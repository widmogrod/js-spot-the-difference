define(['./monad'], function (monad) {
    'use strict';

    return function nothing() {
        return monad(function (transformFn) {
            return nothing();
        });
    }
});
