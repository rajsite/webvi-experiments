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

class PerspectiveDataItem extends DataItem {
    getValue (_schema) {
        const valueRef = this.getValueRef();
        const dataValueRef = this._vireo.eggShell.getVariantAttribute(valueRef, 'data');
        const valueJSON = this._vireo.eggShell.readJSON(dataValueRef);
        const value = JSON.parse(valueJSON);
        return value;
    }
}

const perspectiveDataItem = new PerspectiveDataItem('Perspective::Table::Table Update.gvi', 'dataItem_Dataprobe');

const tableCreate = async schemaJSON => {
    const schemaColumns = JSON.parse(schemaJSON);
    if (schemaColumns.length <= 0) {
        throw new Error(`Expect at least one column in the table schema ${schemaColumns.length}`);
    }
    const schema = {};
    schemaColumns.forEach(column => {
        schema[column.name] = column.type;
    });
    const table = await worker.table(schema);
    return table;
};

const tableDestroy = table => {
    table.delete();
};

const tableUpdate = async table => {
    const schema = await table.schema();
    const value = perspectiveDataItem.getValue(schema);
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

window.WebVIPerspective = {
    tableCreate,
    tableDestroy,
    tableUpdate,
    viewerCreate,
    viewerDestroy,
    viewerLoad
};
