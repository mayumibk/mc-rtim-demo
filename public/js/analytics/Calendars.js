new OWL.Requirement({
	require: 'DateExtras',
	thenDo: function () {
		OWL.Calendar = Class.create({
			firstWeekday: 0,
			canTrend: 1,

			initialize: function (o) {
				o = o || {};
			},

			getFirstDayOfYear: function (year) {
				return new Date(Date.UTC(year, 0, 1));
			},

			getFirstDayOfMonthInYear: function (m, y) {
				var year = y + ~~((m < 0 ? m - 12 : m)/12);
				var month = (m + (12 * Math.abs(m % 12)))  % 12;
				return new Date(Date.UTC(year, month, 1));
			},

			getMonthOfYear: function (m, y) {
				var year = y + ~~((m < 0 ? m - 12 : m)/12);
				var month = (m + (12 * Math.abs(m % 12)))  % 12;
				var days = [];
				var lastDay = (new Date(Date.UTC(year, month + 1, 1) - Date.K.ms.day)).getUTCDate();
				//console.log('last day:', lastDay);

				for (var i = 1; i <= lastDay; i++) {
					days.push(new Date(Date.UTC(year, month, i)));
				}

				return days;
			},

			getMonthName: function (month, length) {
				length = length || 'full';

				return length == 'short' ? Date.K.shortMonthNames[month] : Date.K.monthNames[month];
			}
		});

		OWL.Calendar.createDefault = function () {
			if (OmniDate_createInstance) { // intentionally checking for existence of function, not calling it
				var odi = OmniDate_createInstance();

				if (odi.defaultTypeId < 3) {
					// it's Gregorian, NRF, or QRS
					return new OWL.CalendarTypes[odi.defaultTypeId]();
				} else {
					// it's custom
					return new OWL.CalendarTypes[odi.defaultTypeId]({
						firstWeekday: odi.first_weekday
					});
				}
			} else {
				return new OWL.Calendar();
			}
		},

		OWL.NRFCalendar = Class.create(OWL.Calendar, {
			title: 'NRF',
			description: 'National Retail Federation 4-5-4 Calendar',
			firstMonth: 1,
			firstWeekday: 0,
			monthLengths: [
				4, 5, 4,
				4, 5, 4,
				4, 5, 4,
				4, 5, 4
			],

			//odi: null,

			initialize: function (o) {
				this.odi = OmniDate_createInstance();
				this.firstWeekday = this.odi.getFirstDayOfWeek();
				/*
					The following line is commented out to fix bug 49230. There's no reason a NRF
					calendar shouldn't be able to trend.
				*/
				//this.canTrend = 0;
				//console.log('first weekday', this.firstWeekday);
			},

			getFirstDayOfYear: function (year) {
				this.odi = this.odi || OmniDate_createInstance();
				this.odi.setCalDate(year, 0, 1);
				var d = this.odi.getStartOfCalYear();
				return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

				/*
				var fourth = new Date(Date.UTC(year, this.firstMonth, 4));
				return new Date(fourth.getTime() - (fourth.getUTCDay() * Date.K.ms.day) + (this.firstWeekday * Date.K.ms.day));
				*/
			},

			getFirstDayOfMonthInYear: function (m, y) {
				var year = y + ~~((m < 0 ? m - 12 : m)/12);
				var month = (m + (12 * Math.abs(m % 12)))  % 12;

				this.odi = this.odi || OmniDate_createInstance();
				this.odi.setCalDate(year, month, 1);
				var d = this.odi.getStartOfCalMonth();
				return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

				/*
				var firstDayTime = this.getFirstDayOfYear(year).getTime();

				for (var i = 0; i < month; i++) {
					firstDayTime += this.monthLengths[i] * Date.K.ms.week;
				}

				return new Date(firstDayTime);
				*/
			},

			getMonthOfYear: function (m, y) {
				var year = y + ~~((m < 0 ? m - 12 : m)/12);
				var month = (m + (12 * Math.abs(m % 12)))  % 12;
				var days = [];

				this.odi = this.odi || OmniDate_createInstance();
				this.odi.setCalDate(year, month, 1);

				var monthLength = this.odi.getCalMonthLength();

				var f = this.odi.getStartOfCalMonth();
				f.setDate(f.getDate() - f.getDay());
				f = f.getStandardDate();
				var firstDayTime = new Date(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate())).getTime();

				var l = this.odi.getEndOfCalMonth();
				l.setDate(l.getDate() - l.getDay());
				l = l.getStandardDate()
				var lastDayTime = new Date(Date.UTC(l.getFullYear(), l.getMonth(), l.getDate())).getTime();

				//console.log(f, l);

				//console.log(year, month, monthLength, new Date(firstDayTime).toLocalizedForm('full', true), new Date(lastDayTime).toLocalizedForm('full', true));

				/*
				var monthLength = 7 * this.monthLengths[month];
				var firstDayTime = this.getFirstDayOfYear(year).getTime();

				if (month == 11) {
					var lastDay = new Date(firstDayTime + (363 * Date.K.ms.day));
					if (lastDay.getUTCMonth() == 0 && lastDay.getUTCDate() <= 27) {
						monthLength += 7;
					}
				}

				for (var i = 0; i < month; i++) {
					firstDayTime += this.monthLengths[i] * Date.K.ms.week;
				}
				*/

				for (var i = 0; i < monthLength; i++) {
					days.push(new Date(firstDayTime + i * Date.K.ms.day));
				}

				return days;
			},

			getMonthName: function (month, length) {
				length = length || 'full';
				var m = (month + 12) % 12;

				return length == 'short' ? Date.K.shortMonthNames[m] : Date.K.monthNames[m];
			}
		});

		OWL.QRSCalendar = Class.create(OWL.NRFCalendar, {
			title: 'QRS',
			description: 'QRS 4-4-5 Calendar',
			monthLengths: [
				4, 4, 5,
				4, 4, 5,
				4, 4, 5,
				4, 4, 5
			]
		});

		OWL.Custom454Calendar = Class.create(OWL.NRFCalendar, {
			title: '[4-5-4]',
			description: 'Custom 4-5-4 Calendar',
			initialize: function (o) {
				o = o || {};
				this.firstWeekday = o.firstWeekday || 0;
			}
		});

		OWL.Custom445Calendar = Class.create(OWL.QRSCalendar, {
			title: '[4-4-5]',
			description: 'Custom 4-4-5 Calendar',
			initialize: function (o) {
				o = o || {};
				this.firstWeekday = o.firstWeekday || 0;
			}
		});

		OWL.ModifiedGregorianCalendar = Class.create(OWL.Calendar, {
			description: 'Modified Gregorian Calendar',
			initialize: function (o) {
				o = o || {};
				/*
					The following line is commented out to fix bug 49230. There's no reason a
					custom Gregorian calendar shouldn't be able to trend.
				*/
				//this.canTrend = 0;
				this.firstWeekday = o.firstWeekday || 0;
			}
		});

		// This is so you can do:
		// var cal = new CalendarTypes[n](options);
		// The indicies of the array correspond to the calendar types defined in php.
		OWL.CalendarTypes = [
			OWL.Calendar,
			OWL.NRFCalendar,
			OWL.QRSCalendar,
			OWL.Custom454Calendar,
			OWL.Custom445Calendar,
			OWL.ModifiedGregorianCalendar
		];


		OWL.Calendar.datesToPeriodString = function (start, end, type) {
			if (OmniDate_isCustom()) {
				var diff = end.getTime() - start.getTime();
					diff = 1 + (diff / Date.K.ms.day);
					
				return (
					start.getUTCFullYear() - 1900 +
					start.getUTCMonth().toPaddedString(2) +
					start.getUTCDate().toPaddedString(2) +
					'D' + diff
				);
			} else {
				switch (type) {
					case 'year':
							return start.getUTCFullYear() - 1900;
						break;

					case 'quarter':
						return (
							start.getUTCFullYear() - 1900 +
							start.getUTCMonth().toPaddedString(2) +
							start.getUTCDate().toPaddedString(2) +
							'M3'
						);
						break;

					case 'month':
						return (
							start.getUTCFullYear() - 1900 + 
							start.getUTCMonth().toPaddedString(2)
						);
						break;

					case 'week':
						return (
							start.getUTCFullYear() - 1900 +
							start.getUTCMonth().toPaddedString(2) +
							start.getUTCDate().toPaddedString(2) +
							'D7'
						);
						break;

					case 'day':
						return (
							start.getUTCFullYear() - 1900 +
							start.getUTCMonth().toPaddedString(2) +
							start.getUTCDate().toPaddedString(2)
						);
						break;
					
					default:
						var diff = end.getTime() - start.getTime();
							diff = 1 + (diff / Date.K.ms.day);
							
						return (
							start.getUTCFullYear() - 1900 +
							start.getUTCMonth().toPaddedString(2) +
							start.getUTCDate().toPaddedString(2) +
							'D' + diff
						);
						break;
				}
			}
		};

		OWL.Requirement.met('Calendars');
	}
});
