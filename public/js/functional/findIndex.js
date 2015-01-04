define(function () {
    'use strict';

    /**
     * @param {Array} array
     * @param {Function} fn
     * @return {Number}
     */
    return function findIndex(array, fn) {
        var value,
            i = 0,
            length = array.length;

        for (; i < length; i++) {
            value = array[i];
            if (fn(value, i, array)) {
                return i;
            }
        }

        return -1;
    };
});
