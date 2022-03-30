import perspective from './node_modules/@finos/perspective/dist/cdn/perspective.js';

(async () => {
    const worker = perspective.worker();
    const table = await worker.table({A: [1, 2, 3]});
    document.querySelector('ni-front-panel').insertAdjacentHTML('beforeend', `
        <perspective-viewer style="height: 100%; width:100%;">
        </perspective-viewer>
    `);
    document.querySelector('perspective-viewer').load(table);
})();
