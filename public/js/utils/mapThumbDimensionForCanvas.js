define(function () {
    'use strict';

    return function mapThumbDimensionForCanvas(canvasWidth, canvasHeight) {
        return function mapThumbDimension(data) {
            var x = canvasWidth / 2 * data.percent.left / 100 >> 0;
            var y = canvasHeight * data.percent.top / 100 >> 0;

            return {
                id: parseInt(data.target.element.getAttribute('data-id')),
                x: x,
                y: y,
                width: canvasWidth / 2 * (data.target.width / data.parent.width) >> 0,
                height: canvasHeight * (data.target.height / data.parent.height) >> 0
            }
        }
    }
});
