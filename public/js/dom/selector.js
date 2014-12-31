define(function () {
    'use strict';

    return function selector(selector, scope) {
        var element = scope ? scope : document,
            list = element.querySelectorAll(selector),
            length = list.length;

        return {
            each: function(fn) {
                for(var i = 0; i < length; i++) {
                    fn(this.get(i));
                }

                return this;
            },
            get: function(index) {
                return arguments.length ? list[index] : list;
            }
        }
    }
});
