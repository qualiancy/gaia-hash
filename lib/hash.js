
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
 * # Hash (constructor)
 *
 * Creates a new hash given a set
 * of values and options.
 *
 * @param {Array} values to insert
 * @param {Object} options
 * @api public
 * @name constructor
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
 * # length
 *
 * Returns the the number of objects in the hash
 *
 * @returns {Number}
 * @api public
 * @name length
 */

Object.defineProperty(Hash.prototype, 'length',
  { get: function () {
      return this.keys.length;
    }
});

/**
 * # keys
 *
 * Returns an Array of all keys in the hash.
 *
 * @returns {Array} keys
 * @api public
 * @name keys
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
 * # values
 *
 * Returns an array of all values in the hash.
 *
 * @returns {Array} values
 * @api public
 * @name values
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
 * # .set(key, value)
 *
 * Sets the value at a given key.
 *
 * @param {String} key
 * @param {Object} value
 * @api public
 * @name .set()
 */

Hash.prototype.set = function (key, value) {
  this._data[key] = value;
  return this;
};

/**
 * # .get(key)
 *
 * Gets the value of at a specific key.
 *
 * @param {String|Number} key
 * @returns {Object} value
 * @api public
 * @name .get()
 */

Hash.prototype.get = function (key) {
  return this._data[key];
};

/**
 * # .has(key)
 *
 * Checks for existence of key in hash.
 *
 * @param {String} key
 * @returns {Boolean} existence
 * @api public
 * @name .has()
 */

Hash.prototype.has = function (key) {
  return !! this._data[key];
};

/**
 * # .del(key, [silent])
 *
 * Removes a key from the Hash.
 *
 * @param {String} key
 * @api public
 * @name .del()
 */

Hash.prototype.del = function (key) {
  this._data[key] = undefined;
  return this;
};

/**
 * # .clone()
 *
 * Returns a copy of the hash.
 *
 * @returns {Hash} cloned
 * @api public
 * @name .clone()
 */

Hash.prototype.clone = function () {
  var hash = new this.constructor(null, this.opts);
  extend(hash._data, this._data);
  return hash;
};

/**
 * # .at(index)
 *
 * Returns the data at a given index,
 * as if the hash as an array.
 *
 * @param {Number} index
 * @returns {Object} value at index
 * @api public
 * @name .at()
 */

Hash.prototype.at = function (index) {
  var key = this.keys[index];
  return this._data[key];
};

/**
 * # .index(key)
 *
 * Returns the index for a given
 * key, as if the hash was an array.
 *
 * @param {String} key
 * @returns {Number} index
 * @api public
 * @name .index()
 */

Hash.prototype.index = function (key) {
  return this.keys.indexOf(key);
};

/**
 * # .toArray()
 *
 * Returns the hash as javascript array in
 * the format `{ key: [key], value: [value] }`.
 *
 * @returns {Array}
 * @api public
 * @name .toArray()
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
 * # .fromArray()
 *
 * Sets values in this Hash from the result of
 * of a `sol.toArray` call. Array must be in
 * the format `{ key: [key], value: [value] }`.
 *
 * @returns {this}
 * @api public
 * @name fromArray
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
 * # .flush()
 *
 * Helper function to remove all values from a hash.
 *
 * @api public
 * @name flush
 */

Hash.prototype.flush = function () {
  delete this._data;
  this._data = Object.create(null);
  return this;
};

/**
 * # .clean()
 *
 * Helper function to remove all keys that have an
 * `undefined` value. Useful, as `del` leaves keys.
 *
 * @api public
 * @name clean
 */

Hash.prototype.clean = function () {
  var arr = this.toArray();
  this.flush().fromArray(arr);
  return this;
};

/**
 * # .each(iterator, [context])
 *
 * Apply a given iteration function to
 * each value in the hash.
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to iterator. Defaults to current hash.
 * @alias forEach
 * @api public
 * @name .each()
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
 * # .map(iterator, [context])
 *
 * Map a given function to every value
 * in the Hash. Iterator must return new value.
 *
 * @param {Function} iterator
 * @param {Object} content to apply as `this` to iterator. Defults to current hash.
 * @api public
 * @name .map()
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
 * # .reduce(iterator, [context])
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to the iterator. Defaults to current hash.
 * @returns {Number} result
 * @api public
 * @name .reduce()
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
 * # .mapReduce(mapFn, reduceFn)
 *
 * @param {Function} map function
 * @param {Function} reduce function
 * @returns Hash
 * @api public
 * @name .mapReduce()
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
 * # .filter(iterator, [context])
 *
 * Creates a new hash with all key/values
 * that pass a given iterator test. Iterator
 * should return `true` or `false`.
 *
 * @param {Function} iterator
 * @param {Object} context to apply as `this` to iterator. Defaults to current hash.
 * @api public
 * @name .filter()
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
 * # .find(query)
 *
 * Creates a new hash with all elements that pass a given query.
 * Query language is provided by [filtr](https://github.com/logicalparadox/filtr).
 *
 * @param {Object} query
 * @returns {Hash}
 * @see https://github.com/logicalparadox/filtr
 * @api public
 * @name .find()
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
 * # .sort(iterator)
 *
 * Creates a new hash sorted with an iterator
 *
 * Options:
 * - **kasc**: key alphabetical (default)
 * - **kdesc**: key alphabetical descending
 * - **asc**: value ascending, only if value is not object
 * - **desc**: value descending, only if value is not object
 * - **{Function}**: provide custom iterator
 *
 * Custom Iterator:
 *
 *    hash.sort(function (a, b) {
 *      var akey = a.key
 *        , avalue = a.value;
 *      // etc..
 *      return 1 || -1 || 0; // choose
 *    });
 *
 * @param {String|Function} iterator
 * @returns {this} for chaining
 * @api public
 * @name .sort()
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
 * * .sortBy (path, comparator)
 *
 * Helper for sorting hash of objects by a path.
 *
 *     hash.sortBy('stats.age', 'asc');
 *
 * Options:
 * - **asc**
 * - **desc**
 *
 * @param {String} path
 * @param {String} iterator (asc||desc)
 * @api public
 * @name sortBy
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
    return iters[iter](vala, valb);
  }

  return this.sort(iterator);
};

