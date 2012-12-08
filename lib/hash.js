/*!
 * gaia-hash
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var extend = require('tea-extend')
  , filter = require('gaia-filter')
  , properties = require('tea-properties');

/*!
 * Internal dependencies
 */

var comparators = require('./comparators');

/*!
 * Primary export (factory)
 */

module.exports = function (values, opts) {
  return new Hash(values, opts);
};

/*!
 * Expose constructor for inheritance
 */

module.exports.Hash = Hash;

/**
 * ### Hash (constructor)
 *
 * Creates a new hash given a set
 * of values and options.
 *
 * ```js
 * var hash = require('gaia-hash')
 *   , h = hash();
 * ```
 *
 * The `Hash` constructor is also available
 * for extending.
 *
 * ```js
 * var Hash = require('gaia-hash').Hash
 *   , inhertis = require('tea-inherits');
 *
 * function MyHash (data) {
 *   Hash.call(this, data);
 * }
 *
 * inherits(MyHash, Hash);
 * ```
 *
 * In this scenarios, any method that returns a
 * new hash (such as `.clone()`) will return a
 * new instance of `MyHash`.
 *
 * @param {Object} key/value pairs to insert
 * @param {Object} options
 * @api public
 */

function Hash (values, opts) {
  // storage
  this.opts = opts || {};
  this._data = Object.create(null);

  // populate
  if (values) {
    for (var key in values) {
      this.set(key, values[key]);
    }
  }
}

/**
 * ### .length
 *
 * Property that returns the the number of keys
 * in the hash.
 *
 * @return {Number} count of keys
 * @api public
 */

Object.defineProperty(Hash.prototype, 'length',
  { get: function () {
      return this.keys.length;
    }
});

/**
 * ### .keys
 *
 * Property that returns an array of all of the
 * keys with defined values in the hash.
 *
 * @return {Array} keys
 * @api public
 */

Object.defineProperty(Hash.prototype, 'keys',
  { get: function () {
      var keys = []
        , value;

      for (var key in this._data) {
        value = this._data[key];
        if ('undefined' !== typeof value) keys.push(key);
      }

      return keys;
    }
});

/**
 * ### .values
 *
 * Property that return an array of all of the
 * defined values in the hash. Order will be maintained.
 * `null` is considered a defined value, but `undefined` is not.
 *
 * @return {Array} values
 * @api public
 */

Object.defineProperty(Hash.prototype, 'values',
  { get: function () {
      var vals = []
        , value;

      for (var key in this._data) {
        value = this._data[key];
        if ('undefined' !== typeof value) vals.push(value);
      }

      return vals;
    }
});

/**
 * ### .set(key, value)
 *
 * Sets the value at a given key.
 *
 * ```js
 * h.set('hello', 'universe');
 * ```
 *
 * @param {String} key
 * @param {Object} value
 * @return {this} chainable
 * @api public
 */

Hash.prototype.set = function (key, value) {
  this._data[key] = value;
  return this;
};

/**
 * ### .get(key)
 *
 * Gets the value of at a specific key.
 *
 * ```js
 * h.get('hello'); // 'universe'
 * ```
 *
 * @param {String} key
 * @return {Mixed} value
 * @api public
 */

Hash.prototype.get = function (key) {
  return this._data[key];
};

/**
 * ### .has(key)
 *
 * Checks for existence of key in hash.
 *
 * ```js
 * if (h.has('hello')) {
 *   // do something cool
 * }
 * ```
 *
 * @param {String} key
 * @return {Boolean} existence
 * @api public
 */

Hash.prototype.has = function (key) {
  return ~this.keys.indexOf(key) ? true : false;
};

/**
 * ### .del(key, [silent])
 *
 * ```js
 * h.del('hello');
 * ```
 *
 * Removes a key from the Hash by setting it's
 * value to `undefined`. The key will no longer
 * be included in `h.keys` or `h.toArray()`. Will
 * be completely removed from internal storage
 * upon the next invocation of `h.clean()`.
 *
 * @param {String} key
 * @api public
 */

Hash.prototype.del = function (key) {
  this._data[key] = undefined;
  return this;
};

/**
 * ### .clone()
 *
 * Returns a copy of the hash.
 *
 * ```js
 * var h2 = h.clone();
 * ```
 *
 * @return {Hash} cloned
 * @api public
 */

Hash.prototype.clone = function () {
  var hash = new this.constructor(null, this.opts);
  extend(hash._data, this._data);
  return hash;
};

/**
 * ### .at(index)
 *
 * Returns the data at a given index,
 * as if the hash as an array. Respects
 * the last `.sort()` or the order the
 * keys were defined.
 *
 * ```js
 * var first = h.at(0);
 * ```
 *
 * @param {Number} index
 * @return {Object} value at index
 * @api public
 */

Hash.prototype.at = function (index) {
  var key = this.keys[index];
  return this._data[key];
};

/**
 * ### .index(key)
 *
 * Returns the index for a given
 * key, as if the hash was an array.
 * Respects the last `.sort()` or the
 * order the keys were defined. Returns
 * `-1` if the key is not defined.
 *
 * ```js
 * var pos = h.index('key');
 * ```
 *
 * @param {String} key
 * @return {Number} index
 * @api public
 */

Hash.prototype.index = function (key) {
  return this.keys.indexOf(key);
};

/**
 * ### .toArray()
 *
 * Returns the hash as javascript array with
 * each entry being an _{Object}_ of `key`/`value`
 * pairs.
 *
 * ```js
 * var h = hash({ 'hello': 'world' })
 *   , arr = h.toArray();
 *
 * // [ { key: 'hello', value: 'world' } ]
 * ```
 *
 * @return {Array}
 * @api public
 */

Hash.prototype.toArray = function () {
  var self = this
    , arr = [];

  this.each(function (value, key) {
    if (self.has(key)) {
      var obj = { key: key, value: value };
      arr.push(obj);
    }
  });

  return arr;
};

/**
 * ### .fromArray(arr)
 *
 * Sets values in this Hash from the result of
 * of a `sol.toArray` call. Array must have entries in
 * the format `{ key: [key], value: [value] }`.
 *
 * ```js
 * // the long clone
 * var arr = h1.toArray()
 *   , h2 = hash();
 *
 * h2.fromArray(arr);
 * ```
 *
 * Any existing values with the same key wil be
 * overwritten. Any keys with the value of `undefined`
 * will be skipped.
 *
 * @return {this} for chaining
 * @api public
 */

Hash.prototype.fromArray = function (arr) {
  for (var i = 0; i < arr.length; i++) {
    var key = arr[i].key
      , val = arr[i].value;
    if ('undefined' !== typeof val) {
      this.set(key, val);
    }
  }

  return this;
};

/**
 * ### .flush()
 *
 * Remove all key/value pairs from a hash.
 *
 * ```js
 * h.flush();
 * ```
 *
 * @return {this} for chaining
 * @api public
 */

Hash.prototype.flush = function () {
  delete this._data;
  this._data = Object.create(null);
  return this;
};

/**
 * ### .clean()
 *
 * Helper function to remove all keys that have an
 * `undefined` value. Useful, as `del` leaves keys
 * in memory.
 *
 * ```js
 * h.clean();
 * ```
 *
 * @return {this} for chaining
 * @api public
 */

Hash.prototype.clean = function () {
  var arr = this.toArray();
  this.flush().fromArray(arr);
  return this;
};

/**
 * ### .each(iterator, [context])
 *
 * Apply a given iteration function to
 * each value in the hash.
 *
 * ```js
 * h.each(function (value, key, index) {
 *   console.log(index, key, value);
 * });
 * ```
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to iterator. Defaults to current hash.
 * @return {this} for chaining
 * @api public
 */

Hash.prototype.each = function (iterator, context) {
  var index = 0;
  context = context || this;

  for (var key in this._data) {
    iterator.call(context, this._data[key], key, index);
    index++;
  }

  return this;
};

/**
 * ### .map(iterator, [context])
 *
 * Map a given function to every value
 * in the Hash. Iterator must return new value.
 * Returns a new Hash.
 *
 * ```js
 * h.set('hello', 'world');
 *
 * var h2 = h.map(function (value, key, index) {
 *   return value.toUpperCase();
 * });
 *
 * console.log(h2.get('hello')); // "WORLD"
 * ```
 *
 * @param {Function} iterator
 * @param {Object} content to apply as `this` to iterator. Defults to current hash.
 * @return {Hash} modified new Hash
 * @api public
 */

Hash.prototype.map = function (iterator, context) {
  var hash = extend({}, this._data)
    , context = context || this;

  this.each(function(value, key, index) {
    hash[key] = iterator.call(context, hash[key], key, index);
  });

  return new this.constructor(hash, this.opts);
};

/**
 * ### .reduce(iterator, [context])
 *
 * ```js
 * h.set('one', 1);
 * h.set('two', 2);
 *
 * var sum = h.reduce(function (value, key, index) {
 *   return value;
 * });
 *
 * console.log(sum); // 3
 * ```
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to the iterator. Defaults to current hash.
 * @return {Mixed} result
 * @api public
 */

Hash.prototype.reduce = function (iterator, initialValue, context) {
  if ('number' !== typeof initialValue) {
    context = initialValue;
    initialValue = 0;
  }

  var res = initialValue || 0;
  context = context || this;

  this.each(function (value, key, index) {
    res += iterator.call(context, value, key, index);
  });

  return res;
};

/**
 * ### .mapReduce(mapFn, reduceFn)
 *
 * Divide and aggregate a hash based on arbitrary criteria.
 *
 * The `mapFunction` will be applied to each key/value
 * pair in the original hash. A group key and the value
 * to be added to that key's array may be emitted by
 * by this iterator.
 *
 * The `reduceFunction` will be applied to each group
 * key emitted by the `mapFunction`. This function should
 * return the new value for that key to be used in the final
 * Hash.
 *
 * This method will return a new Hash with unique keys emitted
 * by the `mapFunction` with values returned by the `reduceFunction`.
 *
 * The following example will return a hash with count of
 * last names that start with a specific letter.
 *
 * ```js
 * h.set('smith', { first: 'The', 'Doctor' });
 * h.set('amy', { first: 'Amy', last: 'Williams' });
 * h.set('rory', { first: 'Rory', last: 'Williams' });
 *
 * var byLetter = h.mapReduce(
 *     function map (key, value, emit) {
 *       var first = value.last.charAt(0).toUpperCase();
 *       emit(first, 1);
 *     }
 *   , function reduce (key, arr) {
 *       var sum = 0;
 *       for (var i = 0, i < arr.length; i++) sum += arr[i];
 *       return sum;
 *     }
 * );
 *
 * byLetter.get('D'); // 1
 * byLetter.get('W'); // 2
 * ```
 *
 * @param {Function} map function
 * @param {Function} reduce function
 * @return {Hash} new Hash of results
 * @api public
 */

Hash.prototype.mapReduce = function (mapFn, reduceFn) {
  var hash = extend({}, this._data)
    , mapHash = new this.constructor(null, this.opts)
    , reduceHash = new this.constructor(null, this.opts);

  this.each(function (_value, _key) {
    mapFn(_key, _value, function emit (key, value) {
      if (mapHash.has(key)) mapHash.get(key).push(value);
      else mapHash.set(key, [ value ]);
    });
  });

  mapHash.each(function (_value, key) {
    var value = reduceFn(key, _value);
    reduceHash.set(key, value);
  });

  return reduceHash;
};

/**
 * ### .filter(iterator, [context])
 *
 * Creates a new hash with all key/values
 * that pass a given iterator test. Iterator
 * should return `true` or `false`.
 *
 * ```js
 * h.set('smith', { first: 'The', 'Doctor' });
 * h.set('amy', { first: 'Amy', last: 'Williams' });
 * h.set('rory', { first: 'Rory', last: 'Williams' });
 *
 * var williams = h.filter(function (value, key) {
 *   return value.last.toUpperCase() === 'WILLIAMS';
 * });
 *
 * williams.length; // 2
 * ```
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to iterator. Defaults to current hash.
 * @return {Hash} new Hash of results
 * @api public
 */

Hash.prototype.filter = function (iterator, context) {
  var hash = new this.constructor(null, this.opts)
    , context = context || this;

  this.each(function(value, key, index) {
    if (iterator.call(context, value, key, index)) {
      hash.set(key, value);
    }
  });

  return hash;
};

/**
 * ### .find(query)
 *
 * Creates a new hash with all elements that pass
 * a given query. Query language is provided by
 * [gaia-filter](https://github.com/qualiancy/gaia-filter).
 *
 * ```js
 * h.set('smith', { first: 'The', 'Doctor' });
 * h.set('amy', { first: 'Amy', last: 'Williams' });
 * h.set('rory', { first: 'Rory', last: 'Williams' });
 *
 * var williams = h.find({ 'name': { $eq: 'Williams' }});
 *
 * williams.length; // 2
 * ```
 *
 * If the hash is a storage mechanism for multiple _{Object}_
 * instances instances (such as database models}, the `findRoot`
 * option may be defined for the Hash. This option will be
 * transferred to all new result Hashes.
 *
 * ```js
 * function Model (first, last) {
 *   this.attributes = { first: first, last: last };
 * }
 *
 * var h = hash(null, { findRoot: 'attributes' });
 *
 * h.set('smith', new Model('Amy', 'Williams'));
 *
 * // now functions same as above
 * ```
 *
 * @param {Object} query
 * @return {Hash} new Hash of results
 * @see https://github.com/qualiancy/gaia-filter gaia-filter
 * @api public
 */

Hash.prototype.find = function (query) {
  var q = filter(query)
    , stack = []
    , hash = new this.constructor(null, this.opts)
    , root = this.opts.findRoot
    , res;

  this.each(function(value) {
    if (root) {
      var val = properties.get(value, root);
      stack.push(val);
    } else {
      stack.push(value);
    }
  });

  res = q.pass(stack);

  this.each(function(value, key, index) {
    if (res[index]) hash.set(key, value);
  });

  return hash;
};

/**
 * ### .sort(iterator)
 *
 * Creates a new hash sorted with an iterator. Can use one
 * of the provided iterators or provide a custom function.
 *
 * Comparators:
 * - `'kasc'`: key alphabetical (default)
 * - `'kdesc'`: key alphabetical descending
 * - `'asc'`: value ascending, only if value is not object
 * - `'desc'`: value descending, only if value is not object
 * - _{Function}_: provide custom iterator
 *
 * Custom Comparator:
 *
 * The parameters for each to compare are an object
 * with `key` and `value` properties. See the `.toArray()`
 * method for more information.
 *
 * ```js
 * hash.sort(function (a, b) {
 *   var akey = a.key
 *     , avalue = a.value;
 *   // etc..
 *   return 1 || -1 || 0; // choose
 * });
 * ```
 *
 * @param {String|Function} comparator
 * @return {this} for chaining
 * @api public
 */

Hash.prototype.sort = function (iter) {
  var iterator;

  // default to key asc
  if (!iter) iter = 'kasc';

  // if we are passed a custom iterator
  if ('function' == typeof iter) iterator = iter;

  // else we have a string and an iterator
  else if ('string' == typeof iter) {
    iter = iter.toUpperCase();
    if (comparators[iter]) iterator = comparators[iter];
  }

  var arr = this.toArray().sort(iterator)
  this.flush(true);
  this.fromArray(arr);
  return this;
};

/**
 * ### .sortBy (path, comparator)
 *
 * Helper for sorting hash of objects by a path.
 *
 * ```js
 * hash.sortBy('stats.age', 'asc');
 * ```
 *
 * Comparators:
 * - `'asc'`: value ascending
 * - `'desc'`: value descending
 * - _{Function}_: custom function to receive the value at path
 *
 * @param {String} path
 * @param {String|Function} comparator
 * @api public
 */

Hash.prototype.sortBy = function (path, iter) {
  iter = iter || 'asc';

  var iters = {
      asc: function (a, b) { return a - b; }
    , desc: function (a, b) { return b - a; }
  };

  function iterator (a, b) {
    var vala = properties.get(a.value, path)
      , valb = properties.get(b.value, path);

    return 'function' === typeof iter
      ? iter(vala, valb)
      : comparators[iter.toUpperCase()]({ value: vala }, { value: valb });
  }

  return this.sort(iterator);
};
