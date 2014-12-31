define(['jef/functional/merge'], function (merge) {
    'use strict';

    return function onDragMovePhantom(element) {
        return function movePhantom(e) {
            return merge(e, {
                target: {
                    element: element
                }
            });
        }
    }
});
