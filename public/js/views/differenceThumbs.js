define(['../dom/el'], function (el) {
    'use strict';

    return function differenceThumbs(diffs) {
        return diffs.map(function (diff) {
            return el('div', {class: 'difference tile'}, [
                el('canvas', {
                    'class': 'fit',
                    'data-context': 'thumb',
                    'data-id': diff.id,
                    // This is only to patch domDiff updating given properties
                    // and therefore clearing the canvas
                    'width': diff.thumb.width,
                    'height': diff.thumb.height
                }),
                el('span', {
                    'class': 'action overlay',
                    'data-action': 'remove-diff',
                    'data-id': diff.id
                }, '-')
            ]);
        });
    };
});
