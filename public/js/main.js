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
    './utils/between',
    'jef/functional/merge'
], function (config, Stream, selector, position, between, merge) {
    'use strict';

    var state = {
        name: "Sisters",
        diffs: [
            {
                x: 0,
                y: 0,
                name: 'New one',
                description: "Something interesting"
            }
        ]
    };

    var stateStream = new Stream.Push().distinct();
    var stateStreamLast = stateStream.last();

    var updateName = Stream.fromEmitter(selector(document), '[data-action="update-name"]', 'keyup')
        .map(function (e) {
            return e.target.value;
        }).distinct();

    var createDiff = Stream.fromEmitter(selector(document), '[data-action="add-diff"]', 'click');
    var upload = Stream.fromEmitter(selector(document), '[data-action="upload"]', 'change');

    createDiff.on(function () {
        state.diffs.push({
            x: 0,
            y: 0,
            name: "New one 2",
            description: "Awesome"
        });
        stateStream.push(state);
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
        diffs.forEach(function () {
            result += '<div class="difference"> \
                        <div class="thumb empty">?</div> \
                    </div>';
        });

        return result;
    }).toElementHtml(
        document.getElementById('js-diffs')
    );

    Stream.when([
        updateName,
        stateStreamLast
    ]).log('when')
        .on(function (data) {
            var name = data[0],
                state = data[1];

            state.name = name;
        }).log('when');

    stateStream.push(state);

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


    function mapElementPosition(e) {
        var elTarget = e.target,
            target = {
                element: elTarget,
                width: elTarget.offsetWidth,
                height: elTarget.offsetHeight,
                position: position(elTarget)
            },
            elParent = elTarget.parentNode,
            parent = {
                width: elParent.offsetWidth,
                height: elParent.offsetHeight,
                position: position(elParent)
            };

        return {
            x: between(
                e.clientX - parent.position.x,
                0,
                parent.width - target.width
            ),
            y: between(
                e.clientY - parent.position.y - target.height,
                0,
                parent.height - target.height
            ),
            target: target,
            parent: parent
        }
    }

    function setRelativePosition(e) {
        var target = e.target.element;
        target.style.left = (e.x / e.parent.width * 100) + '%';
        target.style.top = (e.y / e.parent.width * 100) + '%';
    }

    function toPhantom(element) {
        return function mapPhantom(e) {
            return merge(e, {
                target: {
                    element: element
                }
            });
        }
    }

    var mapPhantom = toPhantom(
        document.getElementById('js-phantom-difference')
    );

    var draggableEnd = Stream.fromEmitter(selector(document), '[draggable="true"]', 'dragend').map(mapElementPosition);
    var draggableDrag = Stream.fromEmitter(selector(document), '[draggable="true"]', 'drag').map(mapElementPosition);

    var phantom = draggableEnd.map(mapPhantom)
        .merge(draggableDrag.map(mapPhantom));

    draggableEnd.on(setRelativePosition);
    phantom.on(setRelativePosition);
});
