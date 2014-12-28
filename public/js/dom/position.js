define(function () {
    'use strict';

    return function position(element) {
        var x = 0;
        var y = 0;

        while (element) {
            x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            y += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }

        return {x: x, y: y};
    };
});
