/*
 * Persistent cache for the sound files, backed by IndexedDB.
 *
 * IndexedDB (rather than the Cache Storage API) because it also works in Safari
 * Lockdown Mode, stores Blobs natively (no base64, unlike localStorage), and has
 * a large quota. Entries live until the user clears the cache — there is no TTL.
 *
 * All helpers fail soft: if IndexedDB is unavailable, reads/writes are skipped and
 * playback falls back to the network (getAudioBlob).
 */
const DB_NAME = 'arqaam-audio'
const STORE = 'sounds'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
	if (dbPromise) return dbPromise
	dbPromise = new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('IndexedDB unavailable'))
			return
		}
		const req = indexedDB.open(DB_NAME, 1)
		req.onupgradeneeded = () => req.result.createObjectStore(STORE)
		req.onsuccess = () => resolve(req.result)
		req.onerror = () => reject(req.error)
	})
	return dbPromise
}

function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<T> {
	return openDb().then(db => new Promise<T>((resolve, reject) => {
		const tx = db.transaction(STORE, mode)
		const req = op(tx.objectStore(STORE))
		req.onsuccess = () => resolve(req.result as T)
		req.onerror = () => reject(req.error)
	}))
}

export function idbGet(url: string): Promise<Blob | undefined> {
	return run<Blob | undefined>('readonly', s => s.get(url))
}

export function idbHas(url: string): Promise<boolean> {
	return run<IDBValidKey | undefined>('readonly', s => s.getKey(url)).then(k => k !== undefined)
}

export function idbPut(url: string, blob: Blob): Promise<void> {
	return run('readwrite', s => s.put(blob, url)).then(() => undefined)
}

export function idbCount(): Promise<number> {
	return run<number>('readonly', s => s.count())
}

export function idbClear(): Promise<void> {
	return run('readwrite', s => s.clear()).then(() => undefined)
}

// Return the sound as a Blob: from the cache if present, otherwise fetched from the
// network and stored for next time. Returns null on a failed/empty response.
export async function getAudioBlob(url: string): Promise<Blob | null> {
	try {
		const cached = await idbGet(url)
		if (cached) return cached
	} catch {
		// IndexedDB unavailable — fall through to the network
	}
	try {
		const res = await fetch(url)
		if (!res.ok) return null
		const blob = await res.blob()
		if (blob.size === 0) return null
		idbPut(url, blob).catch(() => {}) // best-effort persist; don't block playback
		return blob
	} catch (e) {
		console.error(`Failed to fetch ${url}:`, e)
		return null
	}
}

// Ensure every given URL is in the cache, fetching only the missing ones.
export async function ensureCached(urls: string[]): Promise<void> {
	await Promise.all(urls.map(async url => {
		let has = false
		try {
			has = await idbHas(url)
		} catch {
			// IndexedDB unavailable — try to fetch+store anyway (store may still fail)
		}
		if (has) return
		try {
			const res = await fetch(url)
			if (!res.ok) {
				console.warn(`Failed to cache: ${url} (status: ${res.status})`)
				return
			}
			const blob = await res.blob()
			if (blob.size > 0) {
				await idbPut(url, blob).catch(() => {})
			}
		} catch (err) {
			console.error(`Error fetching ${url}:`, err)
		}
	}))
}
