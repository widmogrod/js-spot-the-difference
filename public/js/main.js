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
    './utils/mapThumbDimensionForCanvas',
    './utils/mapCanvasSelectedPartToImageData',
    './utils/onDragSetTargetPosition',
    './utils/onDragDrawThumb',
    './utils/onDragMovePhantom',
    './utils/loadImageIntoCanvas',
    './views/differenceTails',
    './views/differenceThumbs',
    './functional/findIndex'
], function (
    config,
    Stream,
    eventEmitter,
    mapDropEventToPosition,
    mapThumbDimensionForCanvas,
    mapCanvasSelectedPartToImageData,
    onDragSetTargetPosition,
    onDragDrawThumb,
    onDragMovePhantom,
    loadImageIntoCanvas,
    differenceTails,
    differenceThumbs,
    findIndex
) {
    'use strict';

    var documentEmitter = eventEmitter(document);
    var canvasStream = Stream.fromValue(document.getElementById('js-image-main'));

    var updateNameStream = Stream.fromEmitter(documentEmitter, '[data-action="update-name"]', 'keyup').pluck('target.value').distinct();
    var addDiffStream = Stream.fromEmitter(documentEmitter, '[data-action="add-diff"]', 'click');
    var uploadStream = Stream.fromEmitter(documentEmitter, '[data-action="upload"]', 'change');

    var state = {
        selectedBoard: 1,
        boards: [
            {
                id: 1,
                name: 'Sisters',
                active: 1,
                diffs: []
            }
        ]
    };

    var stateStream = new Stream.Push();
    var boardStateStream = stateStream.flatMap(function(state) {
        return Stream.fromArray(state.boards).filter(function(board) {
            return board.id === state.selectedBoard;
        });
    });

    var boardUpdateStream = new Stream.Push();
    boardUpdateStream.onWithLast(stateStream, function(board, state) {
        var index = findIndex(state.boards,  function(board) {
            return board.id === state.selectedBoard;
        });

        state.boards[index] = board;
        stateStream.push(state);
    });

    setTimeout(function() {
        stateStream.push(state);
    }, 10);


    stateStream.log('stateStream');
    boardStateStream.log('boardStateStream');
    boardUpdateStream.log('boardUpdateStream');
    addDiffStream.log('addDiffStream');

    addDiffStream.onWithLast(boardStateStream, function (e, board) {
        board.diffs.push({
            id: board.diffs.length + 1,
            name: 'New one 2',
            description: 'Awesome',
            thumb: {
                width: null,
                height: null
            },
            percent: {
                top: 10,
                left: 10
            }
        });

        boardUpdateStream.push(board);
    });

    // Update DOM
    boardStateStream.pluck('name').distinct().toElementProp('#js-name', 'value');

    var stateDiffsStream = boardStateStream.pluck('diffs');
    stateDiffsStream.map(differenceThumbs).domDiffWith('#js-diffs');
    stateDiffsStream.map(differenceTails).domDiffWith('#js-first-half-preview');

    updateNameStream.onWithLast(boardStateStream, function (name, board) {
        board.name = name;
        boardUpdateStream.push(board);
    });

    var uploadedFilesStream = uploadStream.map(function (e) {
        return e.target;
    }).filter(function (el) {
        return el.files.length;
    }).flatMap(function (el) {
        return Stream.fromArray(el.files);
    }).filter(function (file) {
        return config.acceptedTypes[file.type];
    });

    var uploadedImagesStream = uploadedFilesStream.flatMap(function (file) {
        var reader = new FileReader();
        var stream = Stream.fromElement(reader);

        reader.readAsDataURL(file);

        return stream;
    }).flatMap(function (event) {
        var image = new Image();
        var stream = Stream.fromElement(image);
        image.src = event.target.result;

        return stream;
    }).map(function (event) {
        return event.path[0];
    });

    uploadedImagesStream.onWithLast(boardStateStream, function (image, board) {
        board.imageData = image.src;
        boardUpdateStream.push(board);
    });

    var imagesStream = boardStateStream.filter(function(board){
        return !!board.imageData;
    }).map(function(board) {
        var image = new Image();
        image.src = board.imageData;
        image.style.width = '100%';
        return image;
    });

    var imageDimensionStream = imagesStream.map(function (image) {
        return {
            width: image.width,
            height: image.height
        };
    });

    Stream.when([
        imagesStream,
        canvasStream
    ]).onApply(loadImageIntoCanvas);

    // On vent
    //var mapPhantom = onDragMovePhantom(document.getElementById('js-phantom-difference'));

    var draggableEndStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'dragend').map(mapDropEventToPosition);
    var draggableDragStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'drag').map(mapDropEventToPosition);
    var draggableAllStream = draggableEndStream.merge(draggableDragStream);

    //var movePhantomOnDragStream = draggableAllStream.map(mapPhantom);
    //movePhantomOnDragStream.on(onDragSetTargetPosition);

    draggableEndStream.on(onDragSetTargetPosition);
    //var draggableThumbSizeStream = draggableAllStream.map();

    var draggableThumbSizeStream = Stream.when([
        imageDimensionStream,
        draggableAllStream
    ]).mapApply(mapThumbDimensionForCanvas);

    var imageDataStream = Stream.when([
        canvasStream,
        draggableThumbSizeStream
    ]).mapApply(mapCanvasSelectedPartToImageData);

    Stream.when([
        draggableThumbSizeStream,
        imageDataStream
    ]).onApply(function (data, imageData) {
        var thumbCanvas = document.querySelector('canvas[data-id="' + data.id + '"]');
        thumbCanvas.width = data.width;
        thumbCanvas.height = data.height;

        var thumbContext = thumbCanvas.getContext('2d');
        thumbContext.putImageData(imageData, 0, 0);
    });

    Stream.when([
        stateDiffsStream,
        draggableEndStream
    ]).onApply(function (diffs, e) {
        var id = parseInt(e.target.element.getAttribute('data-id'));
        var thumbCanvas = document.querySelector('canvas[data-id="' + id + '"]');

        diffs.filter(function (diff) {
            return diff.id === id;
        }).forEach(function (diff) {
            diff.percent = e.percent;
            diff.thumb = {
                width: thumbCanvas.width,
                height: thumbCanvas.height
            };
        });
    });
});
