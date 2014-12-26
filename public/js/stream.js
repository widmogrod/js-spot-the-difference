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
    'jef/stream/noop',
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
    './stream/fromElement'
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
    noop,
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
    fromElement
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

    // Factories
    Stream.fromArray = fromArray;
    Stream.fromEmitter = fromEmitter;
    Stream.fromCallback = fromCallback;
    Stream.fromPromise = fromPromise;
    Stream.fromElement = fromElement;
    Stream.both = both;
    Stream.when = when;
    Stream.noop = noop;
    Stream.merge = merge;
    Stream.timeout = timeout;

    // New classes
    Stream.Push = PushStream;
    Stream.Push.prototype.consume = function(stream) {
        return consume(this, stream);
    };

    return Stream;
});
