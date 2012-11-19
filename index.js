module.exports = process.env.hash_COV
  ? require('./lib-cov/hash')
  : require('./lib/hash');
