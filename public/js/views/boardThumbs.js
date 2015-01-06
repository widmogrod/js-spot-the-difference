define(['../dom/el'], function (el) {
    'use strict';

    return function boardThumbs(boards) {
        return boards.map(function (board) {
            return el('div', {class: 'board tile'}, [
                el('canvas', {
                    'class': 'fit',
                    'data-id': board.id
                    // This is only to patch domDiff updating given properties
                    // and therefore clearing the canvas
                    //'width': board.thumb.width,
                    //'height': board.thumb.height
                }),
                el('a', {
                    'class': 'name',
                    'data-action': 'edit-board',
                    'data-id': board.id
                }, board.name)
            ]);
        });
    };
});
