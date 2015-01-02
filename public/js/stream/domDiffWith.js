define([
    '../dom/el',
    'jef/functional/isArray',
    'jef/domdiff/diff',
    'jef/domdiff/applyDiff'
], function (
    el,
    isArray ,
    domDiff,
    applyDiff
) {
    'use strict';

    /**
     * Compute and apply difference between node and streamed value.
     *
     * @param {Stream} stream
     * @param {Element} element
     */
    return function domDiffWith(stream, element) {
        return stream.on(function(value) {

            var clone = element.cloneNode(false);
            var candidate = el(
                clone,
                isArray(value) ? value : [value]
            );

            applyDiff(
                element,
                candidate,
                domDiff(
                    element,
                    candidate
                )
            )
        });
    }
});
