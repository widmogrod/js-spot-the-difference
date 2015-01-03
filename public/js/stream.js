define([
    'jef/stream/stream',
    'jef/stream/map',
    'jef/stream/filter',
    'jef/stream/reduce',
    'jef/stream/concat',
    'jef/stream/group',
    'jef/stream/merge',
    'jef/stream/take',
    'jef/stream/skip',
    'jef/stream/both',
    'jef/stream/distinct',
    'jef/stream/debounce',
    'jef/stream/when',
    //'jef/stream/noop',
    'jef/stream/log',
    'jef/stream/last',
    'jef/stream/timeout',
    'jef/stream/fromArray',
    'jef/stream/fromEmitter',
    'jef/stream/fromCallback',
    'jef/stream/fromPromise',
    'jef/stream/toArray',
    'jef/stream/push-stream',
    'jef/stream/push-consume',
    './stream/fromElement',
    './stream/fromValue',
    './stream/domDiffWith'
], function(
    Stream,
    map,
    filter,
    reduce,
    concat,
    group,
    merge,
    take,
    skip,
    both,
    distinct,
    debounce,
    when,
    //noop,
    log,
    last,
    timeout,
    fromArray,
    fromEmitter,
    fromCallback,
    fromPromise,
    toArray,
    PushStream,
    consume,
    fromElement,
    fromValue,
    domDiffWith
) {
    'use strict';

    Stream.prototype.map = function(fn) {
        return map(this, fn);
    };
    Stream.prototype.filter = function(fn) {
        return filter(this, fn);
    };
    Stream.prototype.reduce = function(fn, base) {
        return reduce(this, fn, base);
    };
    Stream.prototype.concat = function() {
        return concat(this);
    };
    Stream.prototype.group = function(fn) {
        return group(this, fn);
    };
    Stream.prototype.merge = function(stream) {
        return merge(this, stream);
    };
    Stream.prototype.take = function(n) {
        return take(this, n);
    };
    Stream.prototype.skip = function(n) {
        return skip(this, n);
    };
    Stream.prototype.distinct = function() {
        return distinct(this);
    };
    Stream.prototype.debounce = function(timeout) {
        return debounce(this, timeout);
    };
    Stream.prototype.timeout = function(wait) {
        return timeout(this, wait | 0);
    };
    Stream.prototype.log = function(namespace) {
        return log(this, namespace || '');
    };
    Stream.prototype.last = function() {
        return last(this);
    };
    Stream.prototype.toArray = function() {
        return toArray(this);
    };
    Stream.prototype.flatMap = function(fn) {
        return this.map(fn).concat();
    };
    Stream.prototype.apply = function(fn, thisArg) {
        return this.map(function(value) {
            return fn.apply(thisArg, value);
        });
    };
    Stream.prototype.onApply = function(fn, thisArg) {
        return this.on(function(value) {
            fn.apply(thisArg, value);
        });
    };
    Stream.prototype.toElementValue = function(element) {
        return this.on(function(value) {
            element.value = value;
        });
    };
    Stream.prototype.domDiffWith = function(element) {
        return domDiffWith(this, element);
    };
    Stream.prototype.pluck = function(pattern) {
        var path = pattern.split('.'), undefined;
        return this.map(function(value) {
            return path.reduce(function(base, key) {
                return undefined === base
                    ? base
                    : (base.hasOwnProperty(key)
                        ? base[key]
                        : undefined);
            }, value);
        });
    };
    //Stream.prototype.filterUndefined = function(undefined) {
    //    return this.filter(function(value) {
    //        return value !== undefined
    //    })
    //};

    // Factories
    Stream.fromArray = fromArray;
    Stream.fromEmitter = fromEmitter;
    Stream.fromCallback = fromCallback;
    Stream.fromPromise = fromPromise;
    Stream.fromElement = fromElement;
    Stream.fromValue = fromValue;
    Stream.both = both;
    Stream.when = when;
    //Stream.noop = noop;
    Stream.merge = merge;
    Stream.timeout = timeout;

    // New classes
    Stream.Push = PushStream;
    Stream.Push.prototype.consume = function(stream) {
        return consume(this, stream);
    };

    return Stream;
});
