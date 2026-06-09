'use strict';

var callBind = require('call-bind-apply-helpers');
var callBound = require('call-bound');
var GetIntrinsic = require('get-intrinsic');
var gOPD = require('gopd');

var $getTime = callBound('Date.prototype.getTime');
var $Date = GetIntrinsic('%Date%');
var $now = GetIntrinsic('%Date.now%', true);

/** @type {import('.')} */
module.exports = (function () {
	if (
		typeof performance !== 'undefined'
		&& performance
		&& typeof performance.now === 'function'
	) {
		return callBind([performance.now, performance]);
	}

	if (typeof process !== 'undefined' && process && typeof process.hrtime === 'function') {
		var hrtime = process.hrtime;

		return function now() {
			var hr = hrtime();
			return (hr[0] * 1e3) + (hr[1] / 1e6);
		};
	}

	if (
		typeof Temporal !== 'undefined'
		&& Temporal
		&& Temporal.Now
		&& typeof Temporal.Now.instant === 'function'
		&& Temporal.Instant
		&& Temporal.Instant.prototype
	) {
		var instant = Temporal.Now.instant;
		var descriptor = gOPD && gOPD(Temporal.Instant.prototype, 'epochNanoseconds');
		var getter = descriptor && descriptor.get;

		if (typeof getter === 'function') {
			var epochNanoseconds = callBind([getter]);

			return function now() {
				return Number(epochNanoseconds(instant())) / 1e6;
			};
		}
	}

	return $now || function now() {
		return $getTime(new $Date());
	};
}());
