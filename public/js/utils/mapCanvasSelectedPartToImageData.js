define(function () {
    'use strict';

    return function mapCanvasSelectedPartToImageData(canvas, data) {
        var context = canvas.getContext('2d'),
            imageData = context.getImageData(
                data.x,
                data.y,
                data.width,
                data.height
            );

        return imageData;
    }
});
