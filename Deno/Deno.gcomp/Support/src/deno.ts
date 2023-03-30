function enableDeno () {
    // no-op, node used to include assets
}

declare namespace globalThis {
    let WebVIDeno: unknown;
}

globalThis.WebVIDeno = {
    enableDeno
};
