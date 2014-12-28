define(function () {
    'use strict';

    return function between(value, min, max) {
        return value < min
            ? min
            : (value > max
            ? max : value)
    }
});
