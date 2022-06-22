(function () {
    'use strict';

    // TODO implement timeout
    // TODO document different data configurations
    const postMultipartExt = async function (requestConfigurationJSON, url, _timeout, postDataJSON, postDataFiles) {
        const {includeCredentials, headersConfiguration} = JSON.parse(requestConfigurationJSON);
        const postData = JSON.parse(postDataJSON);

        const formData = new FormData();
        for (const {name, value, filename, mimeType, fileIndex} of postData) {
            if (name === '') {
                throw new Error('All postdata entries must have a name configured');
            }

            if (fileIndex >= 0) {
                const file = postDataFiles[fileIndex];
                if (filename === '') {
                    formData.append(name, file);
                } else {
                    formData.append(name, file, filename);
                }
            } else {
                if (filename === '') {
                    formData.append(name, value);
                } else {
                    const meta = {};
                    if (mimeType !== '') {
                        meta.type = mimeType;
                    }
                    formData.append(name, new File([value], filename, meta));
                }
            }
        }

        const headers = new Headers();
        for (const {header, value} of headersConfiguration) {
            // Ignore a user set content-type header when doing Post multipart
            // so that the browser can configure the boundary parameter correctly
            if (header.trim().toLowerCase() !== 'content-type') {
                headers.append(header, value);
            }
        }

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: includeCredentials ? 'include' : 'same-origin',
            redirect: 'follow',
            headers
        });

        const responseStatus = res.status;
        const responseHeaders = Array
            .from(res.headers.entries())
            .map(([header, value]) => `${header.trim()}: ${value.trim()}`)
            .join('\r\n');
        const responseBody = await res.text();

        const response = [
            responseStatus,
            responseHeaders,
            responseBody
        ];

        return response;
    };

    const typeCastValue = value => value;

    window.WebVIHTTPExtensions = {
        postMultipartExt,
        typeCastValue
    };
}());
