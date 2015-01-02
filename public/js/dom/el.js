define([
    '../monad/unit',
    'jef/functional/each',
    'jef/functional/isArray',
    'jef/functional/isObject'
], function (unit, each, isArray, isObject) {
    'use strict';

    function elGet(el) {
        return el;
    }

    function elFromName(name) {
        return unit(document.createElement(name));
    }

    function elOptions(options) {
        if (!isObject(options)) {
            return unit;
        }

        return function elInjectOptions(el) {
            each(options, function(item, key) {
                el.setAttribute(key, item)
            });

            return unit(el);
        }
    }

    function elChildren(children) {
        if (!isArray(children)) {
            return unit;
        }

        return function elInjectChildren(el) {
            each(children, function(child) {
                el.appendChild(child);
            });

            return unit(el);
        }
    }

    return function el(name, options, children) {
        var result = name instanceof Element
            ? unit(name)
            : elFromName(name);

        if (isArray(options)) {
            result = result.bind(elChildren(options));
        } else {
            result = result.bind(elOptions(options));
            result = result.bind(elChildren(children));
        }

        return result.bind(elGet);
    }
});
