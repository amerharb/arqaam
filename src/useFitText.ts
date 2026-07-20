/*
 * Shrink-to-fit for the display segment: the font shrinks (down to a limit)
 * before the CSS marquee kicks in. The text is measured at the stylesheet size
 * and the font scaled down to fit its container; only a text that still
 * overflows at the minimum font starts scrolling (the marquee keyframes in
 * index.css animate only on overflow).
 */
import { useLayoutEffect, useRef } from 'react'

export function useFitText(text: string, minPx = 18) {
	const ref = useRef<HTMLHeadingElement | null>(null)
	useLayoutEffect(() => {
		const el = ref.current
		const box = el?.parentElement
		if (!el || !box) return
		const fit = () => {
			el.style.fontSize = '' // measure at the stylesheet size first
			const base = parseFloat(getComputedStyle(el).fontSize)
			if (el.scrollWidth > box.clientWidth) {
				el.style.fontSize = `${Math.max(minPx, base * box.clientWidth / el.scrollWidth)}px`
			}
		}
		fit()
		const ro = new ResizeObserver(fit)
		ro.observe(box)
		return () => ro.disconnect()
	}, [text, minPx])
	return ref
}
