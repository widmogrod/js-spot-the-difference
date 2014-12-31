define(function () {
    'use strict';

    return function onDragSetTargetPosition(e) {
        var target = e.target.element;
        target.style.left = e.percent.left + '%';
        target.style.top = e.percent.top + '%';
    }
});
