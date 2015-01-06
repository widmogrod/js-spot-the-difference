define(['../dom/position', '../utils/between'], function (position, between) {
    'use strict';

    return function mapDropEventToPosition(e) {
        var elTarget = e.target,
            target = {
                element: elTarget,
                width: elTarget.offsetWidth >> 0,
                height: elTarget.offsetHeight >> 0,
                position: position(elTarget)
            },
            elParent = elTarget.parentNode,
            parent = {
                width: elParent.offsetWidth >> 0,
                height: elParent.offsetHeight >> 0,
                position: position(elParent)
            },
            x = between(
                e.clientX - parent.position.x,
                0,
                parent.width - target.width
            ),
            y = between(
                e.clientY - parent.position.y - target.height,
                0,
                parent.height - target.height
            );

        return {
            position: {
                x: x,
                y: y
            },
            percent: {
                left: x / parent.width * 100,
                top: y / parent.height * 100
            },
            target: target,
            parent: parent
        };
    };
});
