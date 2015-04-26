new OWL.Requirement({
	require: 'Localization.Date',
	thenDo: function () {
		Date.K = Date.K || {};
		Object.extend(Date.K, {
			// lengths of time in ms
			ms: {
				second: 1000,
				minute: 60000,
				hour: 3600000,
				day: 86400000,
				week: 604800000,
				year: 31556926000
			},

			formats:  { // Same as strftime in C
				'%a': function (d,u) { return Date.K.shortDayNames[d['get' + u + 'Day']()]; },
				'%A': function (d,u) { return Date.K.dayNames[d['get' + u + 'Day']()]; },
				'%b': function (d,u) { return Date.K.shortMonthNames[d['get' + u + 'Month']()]; },
				'%B': function (d,u) { return Date.K.monthNames[d['get' + u + 'Month']()]; },
				'%c': function (d,u) { return d.toLocaleString(); },
				'%C': function (d,u) { return ~~(d['get' + u + 'FullYear']() / 100).toPaddedString(2); },
				'%d': function (d,u) { return d['get' + u + 'Date']().toPaddedString(2); },
				'%D': function (d,u) { return d.toFormattedString('%m/%d/%y', u); },
				'%e': function (d,u) { return d['get' + u + 'Date']() },
				'%F': function (d,u) { return d.toFormattedString('%Y-%m-%d', u); },
				'%g': function (d,u) { return ''; },
				'%G': function (d,u) { return ''; },
				'%h': function (d,u) { return Date.K.shortMonthNames[d['get' + u + 'Month']()]; },
				'%H': function (d,u) { return d['get' + u + 'Hours']().toPaddedString(2); },
				'%I': function (d,u) { return ((d['get' + u + 'Hours']() % 12) || 12).toPaddedString(2); },
				'%j': function (d,u) { return ''; },
				'%k': function (d,u) { return d['get' + u + 'Hours'](); },
				'%l': function (d,u) { return (d['get' + u + 'Hours']() % 12) || 12; },
				'%m': function (d,u) { return (d['get' + u + 'Month']() + 1).toPaddedString(2); },
				'%M': function (d,u) { return d['get' + u + 'Minutes']().toPaddedString(2); },
				'%n': function (d,u) { return '\n'; },
				'%p': function (d,u) { return d['get' + u + 'Hours']() < 12 ? 'am' : 'pm'; },
				'%P': function (d,u) { return d['get' + u + 'Hours']() < 12 ? 'AM' : 'PM'; },
				'%r': function (d,u) { return d.toFormattedString('%I:%M:%S %p'); },
				'%R': function (d,u) { return d.toFormattedString('%H:%M'); },
				'%s': function (d,u) { return d.getTime(); },
				'%S': function (d,u) { return d['get' + u + 'Seconds']().toPaddedString(2); },
				'%t': function (d,u) { return '\t'; },
				'%T': function (d,u) { return d.toFormattedString('%H:%M:%S', u); },
				'%u': function (d,u) { return d['get' + u + 'Day']() + 1; },
				'%U': function (d,u) { return ''; },
				'%v': function (d,u) { return d.toFormattedString('%e-%b-%Y', u); },
				'%V': function (d,u) { return ''; },
				'%w': function (d,u) { return d['get' + u + 'Day'](); },
				'%W': function (d,u) { return ''; },
				'%x': function (d,u) { return d.toLocaleDateString(); },
				'%X': function (d,u) { return d.toLocaleTimeString(); },
				'%y': function (d,u) { return ('' + d['get' + u + 'FullYear']()).substr(2); }, // Don't use -2 here.  IE doesn't respect negatives in substr appropriately.
				'%Y': function (d,u) { return d['get' + u + 'FullYear'](); },
				'%z': function (d,u) { return d.getTimezoneOffset() / 60; },
				'%Z': function (d,u) { return u || d.toTimeString().replace(/^.*\(([^)]+)\)$/, '$1').replace(/[^A-Z]|I/g, '').replace(/NT/, 'NFT'); },
				'%+': function (d,u) { return d.toLocaleString(); },
				'%%': function (d,u) { return '%'; }
			}
		});

		Date.prototype.toFormattedString = function (fmt, utc) {
			var u = utc ? 'UTC' : '';
			var d = this;

			return fmt.replace(/(%[a-zA-Z+%])/g, function ($1) {
				return Date.K.formats[$1](d, u);
			});

		};

		Date.prototype.toLocalizedForm = function (f, utc) {
			f = f || 'short';
			var lang = (navigator.userLanguage || navigator.language).toLowerCase() || 'en-us';

			return this.toFormattedString(Date.K[f + 'Form'], utc);
		};

		Date.prototype.makeUTC = function () {
			return new Date(Date.UTC(
				this.getFullYear(),
				this.getMonth(),
				this.getDate()
			));
		};

		OWL.Requirement.met('DateExtras');
	}
});
