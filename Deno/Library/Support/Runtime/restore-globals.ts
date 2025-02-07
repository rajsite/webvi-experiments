// @ts-expect-error re-add window global for existing libraries
globalThis.window = globalThis;
// @ts-expect-error remove global process so that vireo module does not detect as a node env
globalThis.process = undefined;
