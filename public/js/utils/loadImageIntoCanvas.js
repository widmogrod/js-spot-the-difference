define(function() {
    'use strict';

    /**
     * @param {Image} image
     * @param {HTMLCanvasElement} canvas
     */
    return function loadImageIntoCanvas(image, canvas) {
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        image = null;
    };
});
