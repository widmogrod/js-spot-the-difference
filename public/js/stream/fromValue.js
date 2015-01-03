define(['jef/stream/stream'], function (Stream) {
    'use strict';

    /**
     * @param {*}
     * @return {Stream}
     */
    return function fromValue(value) {
        return new Stream(function (sinkValue, sinkError, sinkComplete) {
            sinkValue(value);
            sinkComplete();
        });
    }
});
