'use strict';

var test = require('tape');
var mockProperty = require('mock-property');
var rerequire = require('./rerequire');

var hasProcess = typeof process !== 'undefined'
	&& !!process
	&& typeof process.hrtime === 'function';

test('now', function (t) {
	var now = require('../');

	t.equal(typeof now, 'function', 'is a function');
	t.equal(typeof now(), 'number', 'returns a number');

	var a = now();
	var b = now();
	t.ok(b >= a, 'is non-decreasing');

	t.end();
});

test('fallback tiers', function (t) {
	t.test('process.hrtime tier', { skip: !hasProcess }, function (st) {
		st.teardown(mockProperty(global, 'performance', { value: undefined }));
		st.teardown(function () { rerequire(__dirname, '../'); });

		/** @type {import('../')} */
		var now = rerequire(__dirname, '../');

		st.equal(typeof now(), 'number', 'returns a number via process.hrtime');

		st.end();
	});

	t.test('Date.now tier', function (st) {
		st.teardown(mockProperty(global, 'performance', { value: undefined }));
		if (hasProcess) {
			st.teardown(mockProperty(
				/** @type {Record<keyof typeof process, typeof process[keyof typeof process]>} */
				(process),
				'hrtime',
				{ value: undefined }
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
		st.teardown(mockProperty(global, 'performance', { value: undefined }));
		st.teardown(mockProperty(
			/** @type {Record<keyof DateConstructor, DateConstructor[keyof DateConstructor]>} */
			(Date),
			'now',
			{ value: undefined }
		));
		if (hasProcess) {
			st.teardown(mockProperty(
				/** @type {Record<keyof typeof process, typeof process[keyof typeof process]>} */
				(process),
				'hrtime',
				{ value: undefined }
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
