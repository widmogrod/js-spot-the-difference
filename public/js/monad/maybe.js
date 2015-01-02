define(['./monad', './nothing'], function (monad, nothing) {
    'use strict';

    return function maybe(value) {
        if (value === null || typeof value === 'undefined') {
            return nothing();
        }

        return monad(function(transformFn) {
            return transformFn(value);
        });
    }
});
