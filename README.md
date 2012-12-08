# gaia-hash [![Build Status](https://secure.travis-ci.org/qualiancy/gaia-hash.png?branch=master)](https://travis-ci.org/qualiancy/gaia-hash)

> Hash tables for javascript.

## Installation

### Node.js

`gaia-hash` is available on [npm](http://npmjs.org).

    $ npm install gaia-hash

### Component

`gaia-hash` is available as a [component](https://github.com/component/component).

    $ component install qualiancy/gaia-hash

## Usage

### Hash (constructor)

* **@param** _{Object}_ key/value pairs to insert
* **@param** _{Object}_ options 

Creates a new hash given a set
of values and options.

```js
var hash = require('gaia-hash')
  , h = hash();
```

The `Hash` constructor is also available
for extending.

```js
var Hash = require('gaia-hash').Hash
  , inhertis = require('tea-inherits');

function MyHash (data) {
  Hash.call(this, data);
}

inherits(MyHash, Hash);
```

In this scenarios, any method that returns a
new hash (such as `.clone()`) will return a
new instance of `MyHash`.


### .length

* **@return** _{Number}_  count of keys

Property that returns the the number of keys
in the hash.


### .keys

* **@return** _{Array}_  keys

Property that returns an array of all of the
keys with defined values in the hash.


### .values

* **@return** _{Array}_  values

Property that return an array of all of the
defined values in the hash. Order will be maintained.
`null` is considered a defined value, but `undefined` is not.


### .set(key, value)

* **@param** _{String}_ key 
* **@param** _{Object}_ value 
* **@return** _{this}_  chainable

Sets the value at a given key.

```js
h.set('hello', 'universe');
```


### .get(key)

* **@param** _{String}_ key 
* **@return** _{Mixed}_  value

Gets the value of at a specific key.

```js
h.get('hello'); // 'universe'
```


### .has(key)

* **@param** _{String}_ key 
* **@return** _{Boolean}_  existence

Checks for existence of key in hash.

```js
if (h.has('hello')) {
  // do something cool
}
```


### .del(key, [silent])

* **@param** _{String}_ key 

```js
h.del('hello');
```

Removes a key from the Hash by setting it's
value to `undefined`. The key will no longer
be included in `h.keys` or `h.toArray()`. Will
be completely removed from internal storage
upon the next invocation of `h.clean()`.


### .clone()

* **@return** _{Hash}_  cloned

Returns a copy of the hash.

```js
var h2 = h.clone();
```


### .at(index)

* **@param** _{Number}_ index 
* **@return** _{Object}_  value at index

Returns the data at a given index,
as if the hash as an array. Respects
the last `.sort()` or the order the
keys were defined.

```js
var first = h.at(0);
```


### .index(key)

* **@param** _{String}_ key 
* **@return** _{Number}_  index

Returns the index for a given
key, as if the hash was an array.
Respects the last `.sort()` or the
order the keys were defined. Returns
`-1` if the key is not defined.

```js
var pos = h.index('key');
```


### .toArray()

* **@return** _{Array}_  

Returns the hash as javascript array with
each entry being an _{Object}_ of `key`/`value`
pairs.

```js
var h = hash({ 'hello': 'world' })
  , arr = h.toArray();

// [ { key: 'hello', value: 'world' } ]
```


### .fromArray(arr)

* **@return** _{this}_  for chaining

Sets values in this Hash from the result of
of a `sol.toArray` call. Array must have entries in
the format `{ key: [key], value: [value] }`.

```js
// the long clone
var arr = h1.toArray()
  , h2 = hash();

h2.fromArray(arr);
```

Any existing values with the same key wil be
overwritten. Any keys with the value of `undefined`
will be skipped.


### .flush()

* **@return** _{this}_  for chaining

Remove all key/value pairs from a hash.

```js
h.flush();
```


### .clean()

* **@return** _{this}_  for chaining

Helper function to remove all keys that have an
`undefined` value. Useful, as `del` leaves keys
in memory.

```js
h.clean();
```


### .each(iterator, [context])

* **@param** _{Function}_ iterator 
* **@param** _{Object}_ context to apply as `this` to iterator. Defaults to current hash.
* **@return** _{this}_  for chaining

Apply a given iteration function to
each value in the hash.

```js
h.each(function (value, key, index) {
  console.log(index, key, value);
});
```


### .map(iterator, [context])

* **@param** _{Function}_ iterator 
* **@param** _{Object}_ content to apply as `this` to iterator. Defults to current hash.
* **@return** _{Hash}_  modified new Hash

Map a given function to every value
in the Hash. Iterator must return new value.
Returns a new Hash.

```js
h.set('hello', 'world');

var h2 = h.map(function (value, key, index) {
  return value.toUpperCase();
});

console.log(h2.get('hello')); // "WORLD"
```


### .reduce(iterator, [context])

* **@param** _{Function}_ iterator 
* **@param** _{Object}_ context to apply as `this` to the iterator. Defaults to current hash.
* **@return** _{Mixed}_  result

```js
h.set('one', 1);
h.set('two', 2);

var sum = h.reduce(function (value, key, index) {
  return value;
});

console.log(sum); // 3
```


### .mapReduce(mapFn, reduceFn)

* **@param** _{Function}_ map function
* **@param** _{Function}_ reduce function
* **@return** _{Hash}_  new Hash of results

Divide and aggregate a hash based on arbitrary criteria.

The `mapFunction` will be applied to each key/value
pair in the original hash. A group key and the value
to be added to that key's array may be emitted by
by this iterator.

The `reduceFunction` will be applied to each group
key emitted by the `mapFunction`. This function should
return the new value for that key to be used in the final
Hash.

This method will return a new Hash with unique keys emitted
by the `mapFunction` with values returned by the `reduceFunction`.

The following example will return a hash with count of
last names that start with a specific letter.

```js
h.set('smith', { first: 'The', 'Doctor' });
h.set('amy', { first: 'Amy', last: 'Williams' });
h.set('rory', { first: 'Rory', last: 'Williams' });

var byLetter = h.mapReduce(
    function map (key, value, emit) {
      var first = value.last.charAt(0).toUpperCase();
      emit(first, 1);
    }
  , function reduce (key, arr) {
      var sum = 0;
      for (var i = 0, i < arr.length; i++) sum += arr[i];
      return sum;
    }
);

byLetter.get('D'); // 1
byLetter.get('W'); // 2
```


### .filter(iterator, [context])

* **@param** _{Function}_ iterator 
* **@param** _{Object}_ context to apply as `this` to iterator. Defaults to current hash.
* **@return** _{Hash}_  new Hash of results

Creates a new hash with all key/values
that pass a given iterator test. Iterator
should return `true` or `false`.

```js
h.set('smith', { first: 'The', 'Doctor' });
h.set('amy', { first: 'Amy', last: 'Williams' });
h.set('rory', { first: 'Rory', last: 'Williams' });

var williams = h.filter(function (value, key) {
  return value.last.toUpperCase() === 'WILLIAMS';
});

williams.length; // 2
```


### .find(query)

* **@param** _{Object}_ query 
* **@return** _{Hash}_  new Hash of results

Creates a new hash with all elements that pass
a given query. Query language is provided by
[gaia-filter](https://github.com/qualiancy/gaia-filter).

```js
h.set('smith', { first: 'The', 'Doctor' });
h.set('amy', { first: 'Amy', last: 'Williams' });
h.set('rory', { first: 'Rory', last: 'Williams' });

var williams = h.find({ 'name': { $eq: 'Williams' }});

williams.length; // 2
```

If the hash is a storage mechanism for multiple _{Object}_
instances instances (such as database models}, the `findRoot`
option may be defined for the Hash. This option will be
transferred to all new result Hashes.

```js
function Model (first, last) {
  this.attributes = { first: first, last: last };
}

var h = hash(null, { findRoot: 'attributes' });

h.set('smith', new Model('Amy', 'Williams'));

// now functions same as above
```


### .sort(iterator)

* **@param** _{String|Function}_ comparator 
* **@return** _{this}_  for chaining

Creates a new hash sorted with an iterator. Can use one
of the provided iterators or provide a custom function.

Comparators:
- `'kasc'`: key alphabetical (default)
- `'kdesc'`: key alphabetical descending
- `'asc'`: value ascending, only if value is not object
- `'desc'`: value descending, only if value is not object
- _{Function}_: provide custom iterator

Custom Comparator:

The parameters for each to compare are an object
with `key` and `value` properties. See the `.toArray()`
method for more information.

```js
hash.sort(function (a, b) {
  var akey = a.key
    , avalue = a.value;
  // etc..
  return 1 || -1 || 0; // choose
});
```


### .sortBy (path, comparator)

* **@param** _{String}_ path 
* **@param** _{String|Function}_ comparator 

Helper for sorting hash of objects by a path.

```js
hash.sortBy('stats.age', 'asc');
```

Comparators:
- `'asc'`: value ascending
- `'desc'`: value descending
- _{Function}_: custom function to receive the value at path



## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@qualiancy.com> (http://qualiancy.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
