new OWL.Requirement({
	require: [
		'DateExtras',
		'Calendars'
	],
	thenDo: function () {
		OWL.DateRange = Class.create({
			initialize: function (o) {
				o = o || {};

				this.start = o.start || new Date();
				this.end = o.end || new Date();
				o.period && this.setPeriod(o.period);

				this.sanitize();
			},

			getPeriod: function (o) {
				o = o || {};
				var calendar = o.calendar || OWL.Calendar.createDefault();
				var granularity = o.granularity || 'daily'; // yearly, quarterly, monthly, weekly, daily, hourly

				var diff = 1 + ((this.end.getTime() - this.start.getTime()) / Date.K.ms.day);
				var year = this.start.getUTCFullYear() - 1900;
				var month = this.start.getUTCMonth();
				var day = this.start.getUTCDate();
				var period = '';
				
				var S = {
					'stamp': this.start.getTime(),
					'year': this.start.getUTCFullYear(),
					'month': this.start.getUTCMonth(),
					'date': this.start.getUTCDate(),
					'day': this.start.getUTCDay()
				};

				var E = {
					'stamp': this.end.getTime(),
					'year': this.end.getUTCFullYear(),
					'month': this.end.getUTCMonth(),
					'date': this.end.getUTCDate(),
					'day': this.end.getUTCDay()
				};

				// Year Alignment
				var firstOfStartYear = calendar.getFirstDayOfYear(S.year);
				var lastOfEndYear = new Date(calendar.getFirstDayOfYear(E.year).getTime() - Date.K.ms.day);


				if (S.stamp == firstOfStartYear.getTime() && E.stamp == lastOfEndYear.getTime()) {
					return S.year - 1900 + 'Y' + (E.year - S.year);
				}


				// Quarter Alignment
				var startMonthDays = calendar.getMonthOfYear(S.month - calendar.firstMonth, S.year);
				var endMonthDays = calendar.getMonthOfYear(E.month - calendar.firstMonth, E.year);
				
				if ( !((E.month - S.month) % 3) && // difference in months is a multiple of 3
					!(S.month - calendar.firstMonth % 3) && // start month is a multiple of 3
					S.stamp == startMonthDays[0].getTime() && // start date equals first date in start month
					E.stamp == endMonthDays[endMonthDays.length - 1].getTime() ) { // end date equals last day in end month

					return S.year + S.month + 'M' + (E.month - S.month);
				}

				
				// Month Alignment


				// Week Alignment
				

				// Default to days
				return (
					(S.year - 1900) +
					S.month.toPaddedString(2) +
					S.date.toPaddedString(2) +
					'D' + diff
				);
			},

			sanitize: function () {
				if (this.start.getTime() > this.end.getTime()) {
					var temp = this.start;
					this.start = this.end;
					this.end = temp;
				}
			}
		});

		OWL.Requirement.met('DateRange');
	}
});
