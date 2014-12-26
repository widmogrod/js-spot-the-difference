define(['jef/stream/stream'], function (Stream) {
    'use strict';

    return function fromElement(object) {
        return new Stream(function (sinkValue, sinkError, sinkComplete) {
            object.onload = function (event) {
                sinkValue(event);
                sinkComplete();
            };

            object.onerror = function (error) {
                sinkError(error);
            };
        });
    }
});
