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
    './utils/mapDropEventToPosition',
    './utils/onDragSetTargetPosition',
    './utils/onDragDrawThumb',
    './utils/onDragMovePhantom'
], function (config, Stream, eventEmitter,
             mapDropEventToPosition,
             onDragSetTargetPosition,
             onDragDrawThumb,
             onDragMovePhantom) {
    'use strict';

    // Const?
    var elCanvas = document.getElementById('js-image-main');
    var elBoardName = document.getElementById('js-name');
    var elDiffsContainer = document.getElementById('js-diffs');
    var documentEmitter = eventEmitter(document);

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

    //var game = {
    //    boards: [
    //        board
    //    ],
    //    indices: {
    //        board: 1,
    //        diff: 1
    //    }
    //};

    var stateStream = new Stream.Push().distinct();
    var stateStreamLast = stateStream.last();

    var updateNameStream = Stream.fromEmitter(documentEmitter, '[data-action="update-name"]', 'keyup').pluck('target.value').distinct();
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

    // Update DOM
    stateStream.pluck('name').distinct().toElementValue(elBoardName);
    stateStream.pluck('diffs').map(function (diffs) {
        var result = '';
        diffs.forEach(function (diff) {
            result += '<div class="difference tile"> \
                        <canvas id="js-diff-' + diff.id + '"></canvas>\
                    </div>';
        });

        return result;
    }).toElementHtml(elDiffsContainer);

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
        elCanvas.width = image.width;
        elCanvas.height = image.height;
        var context = elCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        elCanvas.style.width = '100%';
        elCanvas.style.height = 'auto';
    });

    // On vent
    var drawThumb = onDragDrawThumb(elCanvas, document.getElementById('js-diff-1'));
    var mapPhantom = onDragMovePhantom(document.getElementById('js-phantom-difference'));

    var draggableEndStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'dragend').map(mapDropEventToPosition);
    var draggableDragStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'drag').map(mapDropEventToPosition);
    var draggableAllStream = draggableEndStream.merge(draggableDragStream);
    var movePhantomOnDragStream = draggableAllStream.map(mapPhantom);

    draggableEndStream.on(onDragSetTargetPosition);
    movePhantomOnDragStream.on(onDragSetTargetPosition);
    draggableAllStream.on(drawThumb);
});
