new OWL.Requirement({
	require: [
		'DateExtras',
		'DateRange',
		'Calendars'
	],

	thenDo: function () {
		OWL.Month = Class.create({//{{{
			initialize: function (o) {
				o = o || {};
				this.showWeekSelectors = o.showWeekSelectors || false;
				this.dateRange = o.dateRange || new OWL.DateRange();
				this.calendar = o.calendar || new OWL.Calendar();
				this.year = o.year;
				this.month = o.month;
				this.captionIncludeYear = o.captionIncludeYear || false;

				if (this.month < 0) {
					this.year--;
					this.month = 11;
				} else if (this.month > 11) {
					this.year++;
					this.month %= 12;
				}

				this.element = new Element('div').addClassName('Month dateModeMonth');
				this.build();
			},

			getCaption: function() {
				var odi = OmniDate_createInstance();
				var m = this.month;
				if (!OmniDate_isCustom()) {
					m += 1;
				} else if (odi.defaultTypeId == 5) {
					return this.calendar.getMonthName(m) + (this.captionIncludeYear ? ' ' + this.year : '');
				}
				if (this.captionIncludeYear) {
					return odi.getMonthName(m) + ' ' + this.year;
				} else {
					return odi.getMonthName(m);
				}
			},

			build: function () {
				var html = [];
				var days = this.calendar.getMonthOfYear(this.month, this.year);
				var firstWeekday = this.calendar.firstWeekday;
				this.firstDay = days[0];
				this.lastDay = days[days.length - 1];

				var captionTooltip = this.calendar instanceof OWL.NRFCalendar ? ' title="' + this.firstDay.toString() + ' to ' + this.lastDay.toString() + '"': '';
				var captionAbbr = this.firstDay.getTime() + '|' + this.lastDay.getTime();

				html.push('\
					<table> \
						<caption abbr="' + captionAbbr + '"' + captionTooltip + '>' + this.getCaption() + '</caption> \
						<thead> \
							<tr> \
				');

				this.showWeekSelectors && html.push('<th>&nbsp;</th>');

				// Weekdays in the header
				for (var i = 0; i < 7; i++) {
					html.push( '<td>' + Date.K.abbreviatedDayNames[ (firstWeekday + i) % 7 ] + '</td>');
				}

				html.push('</thead><tbody>');

				// Pad the days array if needed
				if (! (this.calendar instanceof OWL.NRFCalendar)) {
					var frontPad = [];
					var backPad = [];
					var frontDiff = (this.firstDay.getUTCDay() + 7 - firstWeekday) % 7;
					var backDiff = (firstWeekday + 6 - this.lastDay.getUTCDay()) % 7;
					//console.log('frontDiff', frontDiff, 'backDiff', backDiff);

					if (frontDiff) {
						var d = days[0];
						for (var i = frontDiff; i; i--) {
							frontPad.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - (Date.K.ms.day * i)));
						}
					}

					if (backDiff) {
						var d = days[days.length - 1];
						for (var i = 1; i <= backDiff; i++) {
							backPad.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + (Date.K.ms.day * i)));
						}
					}

					days = [frontPad, days, backPad].flatten();
				}

				for (var i = 0; i < days.length; i++) {
					var day = days[i];
					var dayUTC = day.getTime();

					var thabbr = dayUTC + '|' + (dayUTC + Date.K.ms.day*6);
					(!(i % 7)) && html.push('<tr>' + (this.showWeekSelectors ? '<th abbr="' + thabbr + '">&raquo</th>' : ''));

					html.push('<td abbr="' + dayUTC + '">' + day.getUTCDate() + '</td>');

					(!((i + 1) % 7)) &&  html.push('</tr>');
				}

				html.push('</tbody></table>');

				this.element.update(html.join(''));
				this.redraw();

				if (Prototype.Browser.IE) {
					this.element.onselectstart = function () { return false; };
				}
			},

			redraw: function () {
				var start = this.dateRange.start.getTime();
				var end = this.dateRange.end.getTime();

				var first = this.firstDay.getTime();
				var last = this.lastDay.getTime();

				/* This block gets "today" from the report suite...
				var today = new Date(
					new Date().getTime() + 
					(parseFloat(Omniture.Config.timezoneInfo.current) * Date.K.ms.hour) -
					(new Date().getTimezoneOffset() / 60)
				);

				today = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
				*/

				var today = new Date();
				today = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

				var nrf = (this.calendar instanceof OWL.NRFCalendar);

				try {
					var tds = this.element.getElementsByTagName('tbody')[0].getElementsByTagName('td');
				} catch (e) {
					var tds = [];
				}

				for (var i = 0; i < tds.length; i++) {
					var utc = parseInt(tds[i].getAttribute('abbr'));

					var classes = [];
					(utc == today) && classes.push('today');

					if (start != end) {
						(utc == start) && classes.push('start');
						(utc == end) && classes.push('end');
					}

					(start <= utc && utc <= end) && classes.push('selected');

					if (!nrf) {
						var suffix = (start <= utc && utc <= end) ? '-selected': '';
						(utc < first) && classes.push('previousMonth' + suffix);
						(utc > last) && classes.push('nextMonth' + suffix);
					}

					tds[i].className = classes.join(' ');
				}
			}
		});//}}}

		OWL.Requirement.met('Month');
	}
});
