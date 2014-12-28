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
    './dom/selector',
    './dom/position',
    './utils/between'
], function (config, Stream, selector, position, between) {
    'use strict';

    var upload = Stream.fromEmitter(selector(document), '[data-action="upload"]', 'change');

    var files = upload.map(function (e) {
        return e.target
    }).filter(function (el) {
        return el.files.length;
    }).flatMap(function (el) {
        return Stream.fromArray(el.files);
    }).filter(function (file) {
        return config.acceptedTypes[file.type];
    });

    files.log('files');

    var thumbs = files.flatMap(function (file) {
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

    var thumb = thumbs.take(1);
    thumb.on(function () {
        document.getElementById('js-image-main')
    });

    var draggable = Stream.fromEmitter(selector(document), '[draggable="true"]', 'dragend')
        .map(function(e) {
            var el = e.target,
                target = {
                    element: el,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                },
                elParent = el.parentNode,
                parent = {
                    width: elParent.offsetWidth,
                    height: elParent.offsetHeight,
                    position: position(elParent)
                };

            return {
                x: between(e.clientX - parent.position.x, 0, parent.width - target.width),
                y: between(e.clientY - parent.position.y - target.height, 0, parent.height - target.height),
                target: target,
                parent: parent
            }
        });

    draggable.on(function (e) {
        var target = e.target.element;
        target.style.left = (e.x / e.parent.width * 100) + '%';
        target.style.top = (e.y / e.parent.width * 100) + '%';
    });
});
