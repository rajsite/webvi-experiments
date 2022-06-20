(function () {
    'use strict';

    const postMultipartExt = async function (requestConfigurationJSON, url, timeout, postDataJSON, postDataFiles) {
        const {includeCredentials, headers} = JSON.parse(requestConfigurationJSON);
        const postDatas = JSON.parse(postDataJSON);
        console.log(includeCredentials, headers, url, timeout, postDatas, postDataFiles);

        // method: 'POST',
        // mode: 'cors',
        // credentials: 'same-origin', (change to 'include' with flag)
        // redirect: 'follow'

        // TODO error if Content-Type headder is set

        const response = {
            status: 200,
            headers: 'lol',
            body: 'hello world'
        };
        const responseJSON = JSON.stringify(response);
        return responseJSON;
    };

    window.WebVIHTTPExtensions = {
        postMultipartExt
    };
}());
