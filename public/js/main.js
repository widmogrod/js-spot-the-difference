require.config({
    name: 'main',
    paths: {
        text: '../vendor/requirejs-text/text',
        jef: '../vendor/jef/src'
    }
});

define(['./selector', './stream', './config'], function (selector, Stream, config) {
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
    }).map(function(event) {
        return event.path[0];
    });

    var thumb = thumbs.take(1);

    thumb.on(function(el) {
        document.getElementById('js-image-main').appendChild(el);
    });

});
