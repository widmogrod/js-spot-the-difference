define(['../dom/el'], function (el) {
    'use strict';

    return function differenceTails(diffs) {
        return diffs.map(function (diff) {
            return el('div', {
                class: 'difference',
                draggable: 'true',
                'data-id': diff.id,
                style: 'top:' + diff.percent.top + '%; left:' + diff.percent.left + '%'
            });
        });
    };
});
