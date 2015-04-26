new OWL.Requirement({
	require: [
		'DateExtras',
		'DateRange',
		'Calendars'
	],

	thenDo: function () {
		OWL.Year = Class.create({
			initialize: function (o) {
				o = o || {};
				this.showQuarterSelectors = o.showQuarterSelectors || true;
				this.dateRange = o.dateRange || new OWL.DateRange();
				this.calendar = o.calendar || new OWL.Calendar();
				this.year = o.year;

				this.element = new Element('div').addClassName('Month dateModeYear');
				this.build();
			},

			build: function () {
				var html = [];

				var yodi = OmniDate_createInstance();
				yodi.setCalDate(this.year, 1, 1);

				var firstDay = yodi.getStartOfCalMonth().getTime();
				firstDay = new Date(Date.UTC(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()));

				yodi.setCalDate(this.year + 1, 1, 1);
				var lastDay = yodi.getStartOfCalMonth().getTime();
				lastDay = new Date(Date.UTC(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate()));

				var captionAbbr = firstDay.getTime() + '|' + (lastDay.getTime() - Date.K.ms.day);

				html.push('\
					<table> \
						<caption abbr="' + captionAbbr + '">' + this.year + '</caption> \
						<tbody> \
				');

				//this.showQuarterSelectors && html.push('<th>&nbsp;</th>');


				for (var m = 0; m < 12; m++) {
					var odi = OmniDate_createInstance();
					odi.setCalDate(this.year, m+1, 1);

					var start = odi.getStartOfCalMonth().getTime().makeUTC();
					var end = odi.getEndOfCalMonth().getTime().makeUTC();
					var monthName =  odi.getShortMonthName(1 + (m + 12) % 12);

					//console.log(this.year, m+1, odi, odi.getTime());

					if (!(m%3)) {
						html.push('<tr>');
						this.showQuarterSelectors && html.push('<th>&nbsp;</th>');
					}

					var abbr = 
						Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()) + '|' +
						(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

					html.push('<td abbr="' + abbr + '">' + monthName + '</td>');

					if (!((m+1)%12)) {
						html.push('</tr>');
					}
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

				var today = new Date();
				today = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

				var tds = this.element.getElementsByTagName('tbody')[0].getElementsByTagName('td');

				for (var i = 0; i < tds.length; i++) {
					var timestamps = tds[i].getAttribute('abbr').split('|');
					var utcS = parseInt(timestamps[0]);
					var utcE = parseInt(timestamps[1]);

					var classes = [];
					(utcS <= today && today <= utcE) && classes.push('today');

					if (!((utcS == start) && (utcE == end))) {
						(utcS == start) && classes.push('start');
						(utcE == end) && classes.push('end');
					}

					(start <= utcS && utcE <= end) && classes.push('selected');

					tds[i].className = classes.join(' ');
				}
			}
		});

		OWL.Requirement.met('Year');
	}
});
