define(function () {
    'use strict';

    return function onDragDrawThumb(canvas, thumbCanvas) {
        return function drawThumb(data) {
            var x = canvas.width/2 * data.percent.left / 100 >> 0;
            var y = canvas.height * data.percent.top / 100 >> 0;

            var width = canvas.width/2 * (data.target.width/data.parent.width) >> 0;
            var height = canvas.height * (data.target.height/data.parent.height) >> 0;

            var context = canvas.getContext('2d'),
                imageData = context.getImageData(
                    x, y,
                    width,
                    height
                );

            thumbCanvas.width = width;
            thumbCanvas.height = height;
            thumbCanvas.style.width = '100%';

            var thumbContext = thumbCanvas.getContext("2d");
            thumbContext.putImageData(imageData, 0, 0);
        }
    }
});
