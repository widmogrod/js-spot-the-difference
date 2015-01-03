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
    './dom/el',
    './dom/eventEmitter',
    './utils/mapDropEventToPosition',
    './utils/mapThumbDimensionForCanvas',
    './utils/mapCanvasSelectedPartToImageData',
    './utils/onDragSetTargetPosition',
    './utils/onDragDrawThumb',
    './utils/onDragMovePhantom'
], function (
    config,
    Stream,
    el,
    eventEmitter,
    mapDropEventToPosition,
    mapThumbDimensionForCanvas,
    mapCanvasSelectedPartToImageData,
    onDragSetTargetPosition,
    onDragDrawThumb,
    onDragMovePhantom
) {
    'use strict';

    // Const?
    var elBoardName = document.getElementById('js-name');
    var elDiffsContainer = document.getElementById('js-diffs');
    var elFirstHalfPreview = document.getElementById('js-first-half-preview');
    var elSecondHalfPreview = document.getElementById('js-second-half-preview');
    var documentEmitter = eventEmitter(document);

    var canvasStream = Stream.fromValue(document.getElementById('js-image-main'));

    var board = {
        id: 1,
        name: "Sisters",
        active: 1,
        diffs: []
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

    var stateStream = new Stream.Push().distinct();
    var stateStreamLast = stateStream.last();

    var updateNameStream = Stream.fromEmitter(documentEmitter, '[data-action="update-name"]', 'keyup').pluck('target.value').distinct();
    var addDiffStream = Stream.fromEmitter(documentEmitter, '[data-action="add-diff"]', 'click');
    var uploadStream = Stream.fromEmitter(documentEmitter, '[data-action="upload"]', 'change');

    addDiffStream.on(function () {
        board.diffs.push({
            id: board.diffs.length + 1,
            name: "New one 2",
            description: "Awesome",
            thumb: {
                width: null,
                height: null
            },
            percent: {
                top: 10,
                left: 10
            }
        });
        stateStream.push(board);
    });

    // Update DOM
    stateStream.pluck('name').distinct().toElementValue(elBoardName);
    stateStream.pluck('diffs').map(function (diffs) {
        return diffs.map(function (diff) {
            return el('div', {class: 'difference tile'}, [
                el('canvas', {
                    class: 'fit',
                    'data-id': diff.id,
                    // This is only to patch domDiff updating given properties
                    // and therefore clearing the canvas
                    width: diff.thumb.width,
                    height:diff.thumb.height
                })
            ]);
        });
    }).domDiffWith(elDiffsContainer);

    stateStream.pluck('diffs').map(function(diffs) {
        return diffs.map(function (diff) {
            return el('div', {
                class: 'difference',
                draggable: 'true',
                'data-id': diff.id,
                style: 'top:'+ diff.percent.top +'%; left:' + diff.percent.left +'%'
            });
        });
    }).domDiffWith(elFirstHalfPreview);

    Stream.when([
        updateNameStream,
        stateStreamLast
    ]).onApply(function (name, state) {
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
    var imagesStream = uploadedFilesStream.flatMap(function (file) {
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

    var firstImageStream = imagesStream.take(1);
    var firstImageDimensionStream = firstImageStream.map(function(image) {
        return {
            width: image.width,
            height: image.height
        }
    });

    Stream.when([
        canvasStream,
        firstImageStream
    ]).onApply(function(canvas, image) {
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    });

    // On vent
    var mapPhantom = onDragMovePhantom(document.getElementById('js-phantom-difference'));

    var draggableEndStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'dragend').map(mapDropEventToPosition);
    var draggableDragStream = Stream.fromEmitter(documentEmitter, '[draggable="true"]', 'drag').map(mapDropEventToPosition);
    var draggableAllStream = draggableEndStream.merge(draggableDragStream);

    //var movePhantomOnDragStream = draggableAllStream.map(mapPhantom);
    //movePhantomOnDragStream.on(onDragSetTargetPosition);

    draggableEndStream.on(onDragSetTargetPosition);
    //var draggableThumbSizeStream = draggableAllStream.map();

    var draggableThumbSizeStream = Stream.when([
        firstImageDimensionStream,
        draggableAllStream
    ]).apply(mapThumbDimensionForCanvas);

    var imageDataStream = Stream.when([
        canvasStream,
        draggableThumbSizeStream
    ]).apply(mapCanvasSelectedPartToImageData);

    Stream.when([
        draggableThumbSizeStream,
        imageDataStream
    ]).onApply(function(data, imageData){
        var thumbCanvas = document.querySelector('canvas[data-id="'+ data.id +'"]');
        thumbCanvas.width = data.width;
        thumbCanvas.height = data.height;

        var thumbContext = thumbCanvas.getContext("2d");
        thumbContext.putImageData(imageData, 0, 0);
    });

    Stream.when([
        stateStream.pluck('diffs'),
        draggableEndStream
    ]).onApply(function(diffs, e) {
        var id = parseInt(e.target.element.getAttribute('data-id'));
        var thumbCanvas = document.querySelector('canvas[data-id="'+ id +'"]');

        diffs.filter(function(diff) {
            return diff.id === id;
        }).forEach(function(diff) {
            diff.percent = e.percent;
            diff.thumb = {
                width: thumbCanvas.width,
                height: thumbCanvas.height
            }
        });
    });
});
