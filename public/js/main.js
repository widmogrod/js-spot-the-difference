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
    './views/boardThumbs',
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
    boardThumbs,
    differenceTails,
    differenceThumbs,
    findIndex
) {
    'use strict';

    var documentEmitter = eventEmitter(document);
    var canvasStream = Stream.fromValue(document.getElementById('js-image-main'));

    var updateNameStream = Stream.fromEmitter(documentEmitter, '[data-action="update-name"]', 'keyup').pluck('target.value').distinct();
    var addBoardStream = Stream.fromEmitter(documentEmitter, '[data-action="add-board"]', 'click');
    var editBoardStream = Stream.fromEmitter(documentEmitter, '[data-action="edit-board"]', 'click');
    var addDiffStream = Stream.fromEmitter(documentEmitter, '[data-action="add-diff"]', 'click');
    var removeDiffStream = Stream.fromEmitter(documentEmitter, '[data-action="remove-diff"]', 'click');
    var uploadStream = Stream.fromEmitter(documentEmitter, '[data-action="upload"]', 'change');

    var state = {
        selectedBoard: 0,
        boardLastIndex: 0,
        boards: []
    };

    var gameStateStream = new Stream.Push();
    var boardStateStream = gameStateStream.map(function(state) {
        var index = findIndex(state.boards, function(board) {
            return board.id === state.selectedBoard;
        });

        return state.boards[index];
    }).filter(function(board) {
        return !!board;
    });

    var boardUpdateStream = new Stream.Push();
    boardUpdateStream.onWithLast(gameStateStream, function(board, state) {
        var index = findIndex(state.boards, function(value) {
            return value.id === board.id;
        });

        state.boards[index] = board;
        gameStateStream.push(state);
    });

    setTimeout(function() {
        gameStateStream.push(state);
    }, 10);

    editBoardStream.onWithLast(gameStateStream, function(e, state) {
        state.selectedBoard = parseInt(e.target.getAttribute('data-id'));
        gameStateStream.push(state);
    });
    addBoardStream.onWithLast(gameStateStream, function(e, state) {
        state.boards.push({
            id: ++state.boardLastIndex,
            name: 'New board',
            diffsLastIndex: 0,
            diffs: []
        });
        gameStateStream.push(state);
    });
    updateNameStream.onWithLast(boardStateStream, function (name, board) {
        board.name = name;
        boardUpdateStream.push(board);
    });
    addDiffStream.onWithLast(boardStateStream, function (e, board) {
        board.diffs.push({
            id: ++board.diffsLastIndex,
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
    removeDiffStream.onWithLast(boardStateStream, function(e, board) {
        var id = parseInt(e.target.getAttribute('data-id'));
        var index = findIndex(board.diffs,  function(diff) {
            return diff.id === id;
        });

        board.diffs.splice(index, 1);
        boardUpdateStream.push(board);
    });

    // Update DOM
    gameStateStream.pluck('boards').map(boardThumbs).domDiffWith('#js-boards');
    boardStateStream.pluck('name').distinct().toElementProp('#js-name', 'value');

    var boardStateDiffsStream = boardStateStream.pluck('diffs');
    boardStateDiffsStream.map(differenceThumbs).domDiffWith('#js-diffs');
    boardStateDiffsStream.map(differenceTails).domDiffWith('#js-first-half-preview');

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

    var imagesStream = boardStateStream.map(function(board) {
        var image = new Image();
        if (board.imageData) {
            image.src = board.imageData;
            image.style.width = '100%';
        }
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
        var thumbCanvas = document.querySelector('canvas[data-context="diff"][data-id="' + data.id + '"]');
        thumbCanvas.width = data.width;
        thumbCanvas.height = data.height;

        var thumbContext = thumbCanvas.getContext('2d');
        thumbContext.putImageData(imageData, 0, 0);
    });

    Stream.when([
        boardStateDiffsStream,
        draggableEndStream
    ]).onApply(function (diffs, e) {
        var id = parseInt(e.target.element.getAttribute('data-id'));
        var thumbCanvas = document.querySelector('canvas[data-context="diff"][data-id="' + id + '"]');

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


    // Update board thumbnails
    gameStateStream.filter(function(state) {
        return state && state.boards && state.boards.length;
    }).flatMap(function(state) {
        return Stream.fromArray(state.boards);
    }).on(function(board) {
        if (board.imageData) {
            var image = new Image();
            image.src = board.imageData;

            var thumbCanvas = document.querySelector('canvas[data-context="board"][data-id="' + board.id + '"]');
            thumbCanvas.width = image.width / 2;
            thumbCanvas.height = image.height;
            var thumbContext = thumbCanvas.getContext('2d');
            thumbContext.drawImage(image, 0, 0);
        }
    });
});
