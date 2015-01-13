define([
    'jef/stream/stream',
    'jef/functional/each',
    'jef/functional/contains'
], function(Stream, each, contains, undefined) {
    'use strict';

    /**
     * @param {Stream[]} streams
     * @return {Stream}
     */
    return function whenReset(resetStream, streams) {
        var buffer = new Array(streams.length),
            completed = new Array(streams.length);

        return new Stream(function whenInit(sinkValue, sinkError, sinkComplete) {
            resetStream.on(function() {
                buffer = new Array(streams.length);
                completed = new Array(streams.length);
            }, sinkError, sinkComplete);

            each(streams, function(stream, index) {
                stream.on(function(value) {
                    buffer[index] = value;

                    if (!contains(buffer, undefined)) {
                        sinkValue(buffer.slice(0));
                    }

                }, sinkError, function() {
                    completed[index] = true;
                    if (!contains(completed, undefined)) {
                        sinkComplete();
                        // clear reference
                        completed = buffer = streams = null;
                    }
                });
            });
        });
    };
});
