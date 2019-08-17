(function () {
    'use strict';

    // Steps for being abortable https://dom.spec.whatwg.org/#abortcontroller-api-integration
    const AbortController = window.AbortController || window.AbortControllerShim;
    const allSettled = async function (promises) {
        const promisesReturningSettledResults = promises.map(async function (promise) {
            try {
                const value = await promise;
                return {
                    status: 'fulfilled',
                    value
                };
            } catch (reason) {
                return {
                    status: 'rejected',
                    reason
                };
            }
        });
        return await Promise.all(promisesReturningSettledResults);
    };

    // NOTE shared image resource only allowed because Preleoad Image Url is non-reentrant
    const image = new Image();
    const loadImage = function (imageUrl, {signal} = {}) {
        return new Promise(function (resolve, reject) {
            if (signal !== undefined && signal.aborted) {
                reject(new Error('image load aborted'));
                return;
            }
            let cleanup;
            const loadHandler = function () {
                resolve();
                cleanup();
            };
            const abortHandler = function () {
                reject(new Error('image load aborted'));
                cleanup();
            };
            cleanup = function () {
                image.removeEventListener('load', loadHandler);
                if (signal !== undefined) {
                    signal.removeEventListener('abort', abortHandler);
                }
                image.src = '';
            };
            image.addEventListener('load', loadHandler);
            if (signal !== undefined) {
                signal.addEventListener('abort', abortHandler);
            }
            image.src = imageUrl;
        });
    };

    const sleep = function (timeoutMilliseconds, {signal} = {}) {
        return new Promise(function (resolve, reject) {
            // All browsers use Int32 max to represent timeout, ie Math.pow(2,31)-1, about 24.8 days
            const MAX_SAFE_TIMEOUT_MS = 2147483647;
            if (signal !== undefined && signal.aborted) {
                throw new Error('aborted');
            }
            if (typeof timeoutMilliseconds !== 'number') {
                throw new Error('Expected sleep timeout to be a number in milliseconds');
            }

            const timeout = (Number.isNaN(timeoutMilliseconds) || timeoutMilliseconds < 0 || timeoutMilliseconds > MAX_SAFE_TIMEOUT_MS) ? MAX_SAFE_TIMEOUT_MS : timeoutMilliseconds;
            let cleanup;
            let timeoutReference;
            const timeoutHandler = function () {
                resolve();
                cleanup();
            };
            const abortHandler = function () {
                reject(new Error('aborted'));
                cleanup();
            };
            cleanup = function () {
                clearTimeout(timeoutReference);
                if (signal !== undefined) {
                    signal.removeEventListener('abort', abortHandler);
                }
            };
            if (signal !== undefined) {
                signal.addEventListener('abort', abortHandler);
            }
            timeoutReference = setTimeout(timeoutHandler, timeout);
        });
    };

    const timeout = async function (...args) {
        await sleep(...args);
        throw new Error('timeout');
    };

    const preloadImage = async function (imageUrl, timeoutInSeconds) {
        const MILLISECONDS_PER_SECOND = 1000;
        const timeoutMilliseconds = timeoutInSeconds * MILLISECONDS_PER_SECOND;
        const abortController = new AbortController();
        const loadImagePromise = loadImage(imageUrl, {signal: abortController.signal});
        const timeoutPromise = timeout(timeoutMilliseconds, {signal: abortController.signal});
        const promises = [loadImagePromise, timeoutPromise];
        try {
            await Promise.race(promises);
        } finally {
            const allSettledPromise = allSettled(promises);
            abortController.abort();
            await allSettledPromise;
        }
    };

    window.WebVIPreloadImage = {preloadImage};
}());
