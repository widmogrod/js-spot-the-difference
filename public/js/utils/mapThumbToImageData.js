define(function () {
    'use strict';

    return function mapThumbToImageData(canvas) {
        return function mapToImageData(data) {
            var context = canvas.getContext('2d'),
                imageData = context.getImageData(
                    data.x,
                    data.y,
                    data.width,
                    data.height
                );

            return imageData;
        }
    }
});
