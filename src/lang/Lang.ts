export type Lang = {
    code: string,
    // the language's name in its own native script (e.g. عربي, Deutsch)
    display: string,
    numbers: string[],
    // when true, only shown in development / beta builds, hidden in production
    beta?: boolean,
}
