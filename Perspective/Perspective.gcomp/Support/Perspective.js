import perspective from './node_modules/@finos/perspective/dist/cdn/perspective.js';
import './node_modules/@finos/perspective-viewer/dist/cdn/perspective-viewer.js';
import './node_modules/@finos/perspective-viewer-datagrid/dist/cdn/perspective-viewer-datagrid.js';
import './node_modules/@finos/perspective-viewer-d3fc/dist/cdn/perspective-viewer-d3fc.js';

// References
// Perspective Types: https://github.com/finos/perspective/blob/master/packages/perspective/index.d.ts

const worker = perspective.worker();

// Obtain JavaScript Reference
class DataItem {
    constructor (viName, dataItemPath) {
        this._viName = viName;
        this._dataItemPath = dataItemPath;
        this._vireo = undefined;
        this._vireoHelpers = undefined;
        this._valueRef = undefined;
    }

    getValueRef () {
        if (this._valueRef === undefined) {
            // Find web application
            const webAppElements = document.querySelectorAll('ni-web-application');
            if (webAppElements.length !== 1) {
                throw new Error('Expected a single ni-web-application element in page.');
            }
            const [webAppElement] = webAppElements;

            const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
            if (!isSupported) {
                throw new Error('Not supported in this version of G Web Development Software.');
            }

            // Find vireo instance
            const vireo = webAppElement.vireoInstance;
            const vireoHelpers = webAppElement.vireoHelpers;

            // Read value from dataspace
            const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(this._viName);
            const valueRef = vireo.eggShell.findValueRef(viNameEncoded, this._dataItemPath);
            this._vireo = vireo;
            this._vireoHelpers = vireoHelpers;
            this._valueRef = valueRef;
        }
        return this._valueRef;
    }
}

class VariantDataItem extends DataItem {
    getValue () {
        const valueRef = this.getValueRef();
        const dataValueRef = this._vireo.eggShell.getVariantAttribute(valueRef, 'data');
        const valueJSON = this._vireo.eggShell.readJSON(dataValueRef);
        const value = JSON.parse(valueJSON);
        return value;
    }
}

const tableUpdateDataItem = new VariantDataItem('Perspective::Table::Table Update.gvi', 'dataItem_Dataprobe');
const tableCreateDataItem = new VariantDataItem('Perspective::Table::Table Create.gvi', 'dataItem_Schemaprobe');

const tableCreate = async () => {
    const schemaType = tableCreateDataItem.getValue();
    const schema = {};
    // TODO validate schema
    for (const [key, value] of Object.entries(schemaType)) {
        if (typeof value === 'number') {
            schema[key] = 'float';
        } else {
            throw new Error('Invalid schema format');
        }
    }
    const table = await worker.table(schema);
    return table;
};

const tableDestroy = table => {
    table.delete();
};

const tableUpdate = async table => {
    // const schema = await table.schema();
    const value = tableUpdateDataItem.getValue();
    // TODO validate value conforms with schema
    table.update(value);
};

const viewerCreate = container => {
    const viewer = document.createElement('perspective-viewer');
    viewer.classList.add('webvi-perspective');
    container.innerHTML = '';
    container.appendChild(viewer);
    return viewer;
};

const viewerDestroy = viewer => {
    viewer.destroy();
};

const viewerLoad = (viewer, table) => {
    viewer.load(table);
};

const uniqBy = (arr, predicate) => {
    const cb = typeof predicate === 'function' ? predicate : o => o[predicate];

    return [...arr.reduce((map, item) => {
        const key = (item === null || item === undefined) ? item : cb(item);

        if (map.has(key)) {
            map.set(key, item);
        }

        return map;
    }, new Map()).values()];
};

const filterViewer = async (viewer, filters, candidates) => {
    const config = await viewer.save();
    const table = await viewer.getTable();
    const availableColumns = Object.keys(await table.schema());
    const currentFilters = config.filter || [];
    const columnAvailable = filter => filter[0] && availableColumns.includes(filter[0]);
    const validFilters = filters.filter(columnAvailable);

    validFilters.push(
        ...currentFilters.filter(x => !candidates.has(x[0]))
    );
    const newFilters = uniqBy(validFilters, item => item[0]);
    await viewer.restore({filter: newFilters});
};

// WIP
const viewerLink = (viewer, parentViewer) => {
    const handler = async event => {
        const config = await event.target.save();
        const candidates = new Set([
            ...(config.group_by || []),
            ...(config.split_by || []),
            ...(config.filter || []).map(x => x[0]),
        ]);
        const filters = [...event.detail.config.filter];
        if (viewer !== event.target) {
            filterViewer(viewer, filters, candidates);
        }
    };
    parentViewer.addEventListener('perspective-click', handler);
    parentViewer.addEventListener('perspective-select', handler);
};

window.WebVIPerspective = {
    tableCreate,
    tableDestroy,
    tableUpdate,
    viewerCreate,
    viewerDestroy,
    viewerLoad,
    viewerLink
};
