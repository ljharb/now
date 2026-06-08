'use strict';

/** @template {object} T @typedef {Record<keyof T, T[keyof T]>} AsRecord */

var test = require('tape');
var mockProperty = require('mock-property');
var semver = require('semver');

var browserNow = require('../browser');
var rerequire = require('./rerequire');

var hasHrtime = semver.satisfies(process.version, '>= 0.7.6');

test('now', function (t) {
	var now = require('../');

	t.equal(typeof now, 'function', 'is a function');
	t.equal(typeof now(), 'number', 'returns a number');

	var a = now();
	var b = now();
	t.ok(b >= a, 'is non-decreasing');

	t.end();
});

test('browser', function (t) {
	t.equal(typeof browserNow, 'function', 'is a function');
	t.equal(typeof browserNow(), 'number', 'returns a number');

	var a = browserNow();
	var b = browserNow();
	t.ok(b >= a, 'is non-decreasing');

	t.end();
});

test('browser, without performance', function (t) {
	t.teardown(mockProperty(global, 'performance', { value: undefined }));
	t.teardown(function () { rerequire(__dirname, '../browser'); });

	/** @type {import('../browser')} */
	var bNow = rerequire(__dirname, '../browser');

	t.equal(bNow, Date.now, 'falls back to Date.now');
	t.equal(typeof bNow(), 'number', 'returns a number');

	t.end();
});

test('fallback tiers', function (t) {
	t.test('process.hrtime tier', { skip: !hasHrtime }, function (st) {
		st.teardown(mockProperty(global, 'performance', { value: undefined }));
		st.teardown(function () { rerequire(__dirname, '../'); });

		/** @type {import('../')} */
		var now = rerequire(__dirname, '../');

		st.equal(typeof now(), 'number', 'returns a number via process.hrtime');

		st.end();
	});

	t.test('Date.now tier', function (st) {
		st.teardown(mockProperty(global, 'performance', { value: undefined }));
		if (hasHrtime) {
			st.teardown(mockProperty(
				/** @type {AsRecord<typeof process>} */ (process),
				'hrtime',
				{ 'delete': true }
			));
		}
		st.teardown(function () { rerequire(__dirname, '../'); });

		/** @type {import('../')} */
		var actual = rerequire(__dirname, '../');

		st.equal(actual, Date.now, 'is Date.now');
		st.equal(typeof actual(), 'number', 'returns a number via Date.now');

		st.end();
	});

	t.test('new Date().getTime() tier', function (st) {
		st.teardown(mockProperty(global, 'performance', { 'delete': true }));
		st.teardown(mockProperty(
			/** @type {AsRecord<DateConstructor>} */ (Date),
			'now',
			{ 'delete': true }
		));
		if (hasHrtime) {
			st.teardown(mockProperty(
				/** @type {AsRecord<typeof process>} */ (process),
				'hrtime',
				{ 'delete': true }
			));
		}
		st.teardown(function () {
			rerequire(__dirname, 'get-intrinsic');
			rerequire(__dirname, '../');
		});

		rerequire(__dirname, 'get-intrinsic');

		/** @type {import('../')} */
		var actual = rerequire(__dirname, '../');

		st.equal(typeof actual(), 'number', 'returns a number via new Date().getTime()');

		st.end();
	});

	t.end();
});
