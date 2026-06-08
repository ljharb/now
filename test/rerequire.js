'use strict';

var resolve = require('resolve');

/**
 * @template T
 * @param {string} dirname
 * @param {string} id
 * @returns {T}
 */
module.exports = function rerequire(dirname, id) {
	var resolved = resolve.sync(id, { basedir: dirname });
	delete require.cache[resolved];
	return require(resolved);
};
