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
    './stream/domDiffWith',
    './stream/toElementProp'
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
    domDiffWith,
    toElementProp
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
    Stream.prototype.mapApply = function(fn, thisArg) {
        return this.map(function(value) {
            return fn.apply(thisArg, value);
        });
    };
    Stream.prototype.onApply = function(fn, thisArg) {
        return this.on(function(value) {
            return fn.apply(thisArg, value);
        });
    };
    Stream.prototype.onWith = function(stream, fn, thisArg) {
        return this.on(function(valueA) {
            stream.on(function(valueB) {
                fn.call(thisArg, valueA, valueB);
                return Stream.stop;
            });
        });
    };
    Stream.prototype.onWithLast = function(stream, fn, thisArg) {
        return this.onWith(stream.last(), fn, thisArg);
    };
    Stream.prototype.toElementProp = function(elementSelector, prop) {
        return toElementProp(this, elementSelector, prop);
    };
    Stream.prototype.domDiffWith = function(elementSelector) {
        return domDiffWith(this, elementSelector);
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
