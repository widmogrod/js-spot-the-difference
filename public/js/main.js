require.config({
    name: 'main',
    paths: {
        jef: '../vendor/jef/src',
        text: '../vendor/requirejs-text/text',
        interact: '../vendor/interact/interact.min'
    }
});

define([
    './config',
    './stream',
    './dom/eventEmitter',
    './dom/position',
    './utils/between',
    './utils/mapDropEventToPosition',
    './utils/onDragSetTargetPosition',
    './utils/onDragDrawThumb',
    './utils/onDragMovePhantom'
], function (
    config, Stream, eventEmitter, position, between,
    mapDropEventToPosition,
    onDragSetTargetPosition,
    onDragDrawThumb,
    onDragMovePhantom
) {
    'use strict';

    // Const?
    var canvas = document.getElementById('js-image-main');

    var board = {
        id: 1,
        name: "Sisters",
        diffs: [
            {
                id: 1,
                x: 0,
                y: 0,
                name: 'New one',
                description: "Something interesting"
            }
        ]
    };

    var game = {
        boards: [
            board
        ],
        indices: {
            board: 1,
            diff: 1
        }
    };

    var documentEmitter = eventEmitter(document);

    var stateStream = new Stream.Push().distinct();
    var stateStreamLast = stateStream.last();

    var updateNameStream = Stream.fromEmitter(documentEmitter, '[data-action="update-name"]', 'keyup')
        .map(function (e) {
            return e.target.value;
        }).distinct();

    var addDiffStream = Stream.fromEmitter(documentEmitter, '[data-action="add-diff"]', 'click');
    var uploadStream = Stream.fromEmitter(documentEmitter, '[data-action="upload"]', 'change');

    addDiffStream.on(function () {
        board.diffs.push({
            id: board.diffs.length + 1,
            x: 0,
            y: 0,
            name: "New one 2",
            description: "Awesome"
        });
        stateStream.push(board);
    });

    stateStream.map(function (state) {
        return state.name;
    }).distinct().toElementValue(
        document.getElementById('js-name')
    );

    stateStream.map(function (state) {
        return state.diffs;
    }).template(function (diffs) {
        var result = '';
        diffs.forEach(function (diff) {
            result += '<div class="difference tile"> \
                        <canvas id="js-diff-' + diff.id + '"></canvas>\
                    </div>';
        });

        return result;
    }).toElementHtml(
        document.getElementById('js-diffs')
    );

    Stream.when([
        updateNameStream,
        stateStreamLast
    ]).on(function (data) {
        var name = data[0],
            state = data[1];

        state.name = name;
    }).log('when');

    stateStream.push(board);

    var uploadedFilesStream = uploadStream.map(function (e) {
        return e.target
    }).filter(function (el) {
        return el.files.length;
    }).flatMap(function (el) {
        return Stream.fromArray(el.files);
    }).filter(function (file) {
        return config.acceptedTypes[file.type];
    });

    var thumbsStream = uploadedFilesStream.flatMap(function (file) {
        var reader = new FileReader();
        var stream = Stream.fromElement(reader);

        reader.readAsDataURL(file);

        return stream;
    }).flatMap(function (event) {
        var image = new Image();
        var stream = Stream.fromElement(image);

        image.src = event.target.result;
        image.style.width = '100%';

        return stream;
    }).map(function (event) {
        return event.path[0];
    });

    var firstThumbStream = thumbsStream.take(1);
    firstThumbStream.on(function (image) {
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    });


    // On vent
    var drawThumb = onDragDrawThumb(canvas, document.getElementById('js-diff-1'));
    var mapPhantom = onDragMovePhantom(document.getElementById('js-phantom-difference'));

    var draggableEndStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'dragend').map(mapDropEventToPosition);
    var draggableDragStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'drag').map(mapDropEventToPosition);
    var draggableAllStream = draggableEndStream.merge(draggableDragStream);
    var movePhantomOnDragStream = draggableAllStream.map(mapPhantom);

    draggableEndStream.on(onDragSetTargetPosition);
    movePhantomOnDragStream.on(onDragSetTargetPosition);
    draggableAllStream.on(drawThumb);
});
