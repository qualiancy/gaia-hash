describe('.length', function () {
  it('should have the correct length', function () {
    var h = hash(data)
      , l = Object.keys(data).length;
    h.should.have.property('length')
      .a('number')
      .that.equal(l);
  });

  it('should account for deleted items', function () {
    var h = hash(data)
      , l = Object.keys(data).length;
    h.should.have.length(l);
    h.del('United States');
    h.should.have.length(l - 1);
  });
});

describe('.keys', function () {
  it('should have all of the keys', function () {
    var h = hash(data)
      , keys = Object.keys(data);
    h.keys.should.deep.equal(keys);
  });

  it('should account for deleted items', function () {
    var h = hash(data)
      , keys = Object.keys(data);
    h.keys.should.include('United States');
    h.del('United States');
    h.keys.should.not.include('United States');
  });
});

describe('.values', function () {
  it('should include all of the values', function () {
    var h = hash(data)
      , i = 0
      , l = Object.keys(data).length
      , vals = h.values;

    vals.should.be.an('array')
      .with.length(l);

    Object.keys(data).forEach(function (line) {
      vals[i].should.equal(data[line]);
      i++;
    });
  });

  it('should account for deleted items', function () {
    var h = hash(data)
      , l = Object.keys(data).length;
    h.values.should.have.length(l);
    h.del('United States');
    h.values.should.have.length(l - 1);
  });
});

describe('.set(key, value)', function () {
  it('should assign value to key', function () {
    var h = hash();
    h.set('hello', 'universe');
    h.should.have.property('_data')
      .with.property('hello', 'universe');
  });

  it('should be able to set js object helpers', function () {
    var h = hash();
  });
});

describe('.get(key)', function () {
  it('should retrieve value at key', function () {
    var h = hash();
    h.set('hello', 'universe');
    h.get('hello').should.equal('universe');
  });
});

describe('.has(key)', function () {
  it('should return boolean if key exists', function () {
    var h = hash();
    h.set('hello', 'universe');
    h.has('hello').should.be.a('boolean', true);
    h.has('universe').should.be.a('boolean', false);
  });

  it('should return false if key was deleted', function () {
    var h = hash();
    h.set('hello', 'universe');
    h.has('hello').should.be.true;
    h.del('hello');
    h.has('hello').should.be.false;
  });

  it('should return true if a key has value of null', function () {
    var h = hash();
    h.set('hello', null);
    h.has('hello').should.be.true;
  });

  it('should not include js object helpers', function () {
    var h = hash();
    h.has('hasOwnProperty').should.be.false;
    h.has('__proto__').should.be.false;
    h.has('constructor').should.be.false;
  });
});

describe('.del(key)', function () {
  it('should set key\'s value to undefined', function () {
    var h = hash({ hello: 'universe' });
    h.del('hello');
    Object.keys(h._data).should.include('hello');
    should.equal(h._data.hello, undefined);
  });
});

describe('.clone()', function () {
  it('should include all values in the original', function () {
    var h = hash(data)
      , c = h.clone();
    c.keys.should.deep.equal(h.keys);
    c.values.should.deep.equal(h.values);
  });

  it('should not share storage', function () {
    var h = hash(data)
      , c = h.clone();
    h.set('hello', 'universe');
    c.set('universe', 'hello');
    h.has('universe').should.be.false;
    c.has('hello').should.be.false;
  });
});

describe('.at(index)', function () {
  it('should return value at index', function () {
    var h = hash({ arthur: 'dent', ford: 'prefect' });
    h.at(0).should.equal('dent');
    h.at(1).should.equal('prefect');
    should.not.exist(h.at(2));
  });
});

describe('.index(key)', function () {
  it('should return index of key', function () {
    var h = hash({ arthur: 'dent', ford: 'prefect' });
    h.index('arthur').should.equal(0);
    h.index('ford').should.equal(1);
    h.index('zaphod').should.equal(-1);
    (function () {
      return !~h.index('arthur')
        ? true
        : false
    })().should.equal(false);
  });
});

describe('.toArray()', function () {
  it('should create an array of key/value pairs', function () {
    var h = hash({ arthur: 'dent', ford: 'prefect' });
    h.toArray().should.deep.equal([
        { key: 'arthur', value: 'dent' }
      , { key: 'ford', value: 'prefect' }
    ]);
  });
});

describe('.toArray()', function () {
  it('should create an array of key/value pairs', function () {
    var h = hash()
    h.fromArray([
        { key: 'arthur', value: 'dent' }
      , { key: 'ford', value: 'prefect' }
    ]);

    h.keys.should.include('arthur', 'ford');
    h.values.should.include('dent', 'prefect');
  });
});

describe('.flush()', function () {
  it('should remove all pairs in a hash', function () {
    var h = hash({ arthur: 'dent', ford: 'prefect' });
    h.flush();
    h.should.have.length(0);
  });
});

describe('.clean()', function () {
  it('should remove deleted keys from a hash', function () {
    var h = hash({ arthur: 'dent', ford: 'prefect' });
    h.del('ford');
    h.should.have.property('_data')
      .and.deep.equal({ arthur: 'dent', ford: undefined });
    h.clean();
    h.should.have.property('_data')
      .and.deep.equal({ arthur: 'dent' });
  });
});

describe('.each(iter)', function () {
  it('should iterate over each key/value pair', function () {
    var h = hash(data)
      , n = 0;

    h.each(function (d, k, i) {
      d.should.equal(data[k]);
      i.should.equal(n);
      n++;
    });

    n.should.equal(h.length);
  });
});

describe('.map(iter)', function () {
  it('should return a new hash modified by iterator', function () {
    var h = hash(data)
      , n = 0;

    var h2 = h.map(function (d, k, i) {
      d.should.equal(data[k]);
      i.should.equal(n);
      n++;
      return d + 1;
    });

    h2.at(0).should.equal(h.at(0) + 1);
    n.should.equal(h.length);
  });
});

describe('.reduce(iter)', function () {
  it('should return a value', function () {
    var h = hash(data)
      , n = 0;

    var l = h.reduce(function (d, k, i) {
      d.should.equal(data[k]);
      i.should.equal(n);
      n++;
      return 1;
    });

    l.should.equal(h.length);
  });
});

describe('.mapReduce(mapFn, reduceFn)', function () {
  it('should return a new hash map/reduced', function () {
    var h = hash(data)

    function mapFn (key, value, emit) {
      var firstLetter = key[0].toUpperCase();
      emit(firstLetter, value);
    }

    function reduceFn (key, values) {
      var res = 0;
      values.forEach(function (v) { res += v; });
      return res;
    }

    var result = h.mapReduce(mapFn, reduceFn);

    result.should.be.instanceof(hash.Hash);
    result.should.have.property('_data')
      .to.deep.equal({
         A: 164634460,
         B: 499541913,
         C: 1612921712,
         D: 16332279,
         E: 201923164,
         F: 71801966,
         G: 153667627,
         H: 34962898,
         I: 1616633286,
         J: 135946476,
         K: 139914902,
         L: 29208715,
         M: 265693642,
         N: 235034558,
         O: 3027959,
         P: 387744743,
         Q: 848016,
         R: 172014868,
         S: 286525125,
         T: 243917984,
         U: 492263162,
         V: 118519363,
         W: 3091113,
         Y: 24133492,
         Z: 25965640
      });
  });
});

describe('.filter(iter)', function () {
  it('should return new hash filtered by an iterator', function () {
    var h = hash(data)
      , n = 0;

    var res = h.filter(function (d, k, i) {
      d.should.equal(data[k]);
      i.should.equal(n);
      n++;
      return n <= 10 ? true : false;
    });

    n.should.equal(h.length);
    res.should.be.instanceof(hash.Hash);
    res.should.have.length(10);
  });
});

describe('.find(query)', function () {
  it('can select based on a query', function () {
    var h = hash(data);

    var h2 = h.find({ $lt: 1000 });
    h2.should.be.instanceof(hash.Hash);
    h2.should.have.length(3);
    h2.keys.should.include('Pitcairn Islands');
  });

  it('can use a custom findRoot option', function () {
    var h = hash(data, { findRoot: 'population' });

    h = h.map(function (v) {
      return { population: v };
    });

    var h2 = h.find({ $lt: 1000 });
    h2.should.be.instanceof(hash.Hash);
    h2.should.have.length(3);
    h2.keys.should.include('Pitcairn Islands');
  });
});

describe('.sort(iterator)', function () {
  function testKasc (sorter) {
    return function () {
      var h = hash(data);
      if (sorter) h.sort(sorter);
      else h.sort();
      h.index('China').should.equal(43);
      h.at(43).should.equal(h.get('China'));
    }
  }

  describe('.sort(\'kasc\')', function () {
    it('should sort by key ascending', testKasc('kasc'));
  });

  describe('.sort()', function () {
    it('should default to "kasc"', testKasc());
  });

  describe('.sort(\'kdesc\')', function () {
    it('should sort by key descending', function () {
      var h = hash(data);
      h.sort('kdesc');
      h.index('China').should.equal(194);
      h.at(194).should.equal(h.get('China'));
    });
  });

  describe('.sort(\'asc\')', function () {
    it('should sort by value ascending', function () {
      var h = hash(data);
      h.sort('asc');
      h.index('Pitcairn Islands').should.equal(0);
      h.at(0).should.equal(h.get('Pitcairn Islands'));
    });
  });

  describe('.sort(\'desc\')', function () {
    it('should sort by value descending', function () {
      var h = hash(data);
      h.sort('desc');
      h.index('China').should.equal(0);
      h.at(0).should.equal(h.get('China'));
    });
  });

  describe('.sort(fn)', function () {
    it('should sort by custom function', function () {
      var h = hash(data);

      // alphabetical
      h.sort(function (a, b) {
        var A = a.key.toLowerCase()
          , B = b.key.toLowerCase();
        if (A < B) return -1;
        else if (A > B) return  1;
        else return 0;
      });

      h.index('China').should.equal(43);
      h.at(43).should.equal(h.get('China'));
    });
  });
});

describe('.sortBy()', function () {
  function sortByAsc (sorter) {
    return function () {
      var h = hash(data);

      h = h.map(function (v) {
        return { population: v };
      });

      if (sorter) h.sortBy('population', sorter);
      else h.sortBy('population');

      h.index('Pitcairn Islands').should.equal(0);
      h.at(0).should.deep.equal(h.get('Pitcairn Islands'));
    }
  }

  describe('.sortBy(path, \'asc\')', function () {
    it('should sort asc', sortByAsc('asc'));
  });

  describe('.sortBy(path)', function () {
    it('should default to asc', sortByAsc());
  });

  describe('.sortBy(path, \'desc\')', function () {
    it('should sort desc', function () {
      var h = hash(data);

      h = h.map(function (v) {
        return { population: v };
      });

      h.sortBy('population', 'desc');

      h.index('China').should.equal(0);
      h.at(0).should.equal(h.get('China'));
    });
  });
});
