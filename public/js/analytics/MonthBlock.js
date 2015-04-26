new OWL.Requirement({
	require: [
		'DateExtras',
		'DateRange',
		'Calendars',
		'Month',
		'Year',
		'Localization.QuickDates'
	],

	thenDo: function () {
		OWL.MonthBlock = Class.create({
			initialize: function (o) {
				o = o || {};
				this.dateRange         = o.dateRange         || null;
				this.calendar          = o.calendar          || new OWL.Calendar();
				this.startMonth        = o.startMonth        || (new Date()).getMonth() - 1;
				this.startYear         = o.startYear         || (new Date()).getFullYear();
				this.numMonths         = o.numMonths         || 3;
				this.title             = o.title             || null;
				this.showWeekSelectors = o.showWeekSelectors || false;
				this.isRange           = false;
				this.periodType        = o.periodType        || null;

				this.dateMode = o.dateMode                   || 'month';

				this.recentDates = o.recentDates             || [];
				this.quickDates = o.quickDates               || {
					'day|0'    : 'Today',
					'day|1'    : 'Yesterday',
					'day|7'    : 'Last 7 days',
					'day|30'   : 'Last 30 days',
					'day|60'   : 'Last 60 days',
					'day|90'   : 'Last 90 days',
					'week|0'   : 'This week',
					'week|1'   : 'Last week',
					'week|2'   : 'Last 2 weeks',
					'week|3'   : 'Last 3 weeks',
					'week|4'   : 'Last 4 weeks',
					'week|53'  : 'Last 53 weeks',
					'month|0'  : 'This month',
					'month|1'  : 'Last month',
					'month|2'  : 'Last 2 months',
					'month|3'  : 'Last 3 months',
					'month|6'  : 'Last 6 months',
					'month|12' : 'Last 12 months',
					'month|13' : 'Last 13 months',
					'year|0'   : 'This year',
					'year|1'   : 'Last year'
				};

				if (this.startMonth < 0) {
					this.startMonth += 12;
					this.startYear--;
				}

				this.onInvalidDate = o.onInvalidDate || function () {};
				this.onValidDate = o.onValidDate || function () {};
				this.focusedField = null;

				this.months = [];

				this.build();
				this.bindEventListeners();
				this.addEventListeners();
				this.updateInputs();
				this.updateRangeInfo();
			},

			build: function () {
				this.element = new Element('div').addClassName('MonthBlock');
				this.titleElement = new Element('h1').update(this.title);
				this.yearSelector = new Element('div').addClassName('yearSelector').update('\
					<button class="prev"></button> \
					<span></span> \
					<button class="next"></button> \
				');

				this.monthSelector = new Element('div').addClassName('monthSelector').update('\
					<button class="prev"></button> \
					<button class="next"></button> \
				');

				this.dateRangeForm = new Element('form').addClassName('dateRangeForm').update('\
					<fieldset class="rangeInputBoxes selected"> \
						<input type="text" name="start"/> \
						<span class="to">' + 'to'.localized() + '</span> \
						<input type="text" name="end"/> \
						<span class="rangeInfo"></span> \
					</fieldset> \
					<fieldset class="quickDateRanges"> \
						<select name="quickDateRanges"> \
							<option disabled="disabled" value="0">' + 'Select Preset'.localized() + '</option> \
							<optgroup class="quick" label="' + 'Preset Date'.localized() + '"> \
							</optgroup> \
							<optgroup class="recent" label="' + 'Recent Date Ranges'.localized() + '"> \
							</optgroup> \
						</select> \
					</fieldset> \
				');

				var quickOptGroup = this.dateRangeForm.down('.quick');
				var recentOptGroup = this.dateRangeForm.down('.recent');
				this.startInput = this.dateRangeForm.down('input[name="start"]');
				this.endInput = this.dateRangeForm.down('input[name="end"]');

				$H(this.quickDates).each(function (pair) {
					var num = 0;
					quickOptGroup.insert(
						new Element('option', {
							value: pair.key
						}).update(pair.value
							.replace(/\d+/g, function(n) { num = n; return '%d'; })
							.localized()
							.replace(/%d/g, num)
						)
					);
				});

				$A(this.recentDates).each(function (e) {
					recentOptGroup.insert(
						new Element('option', {
							value: e.from.getTime() + '|' + e.to.getTime()
						}).update(e.from.toLocalizedForm('short') + '\n - ' + e.to.toLocalizedForm('short'))
					);
				});

				this.element
					.insert(this.titleElement)
					.insert(this.yearSelector)
					.insert(this.monthSelector)
					.insert(this.dateRangeForm);

				this.render();
				this.updateInputs();
				this.resetPreset();
			},

			bindEventListeners: function () {
				[   'prevYearClick',
					'nextYearClick',
					'prevMonthClick',
					'nextMonthClick',
					'dateInputKeyup',
					'dateInputFocus',
					'dateInputBlur',
					'dateInputBlur',
					'containerMouseDown',
					'containerDrag',
					'containerDragEnd',
					'containerClick',
					'containerDoubleClick',
					'quickDateRangesChange'
				].each(function (e) {
					this[e] = this[e].bindAsEventListener(this);
				}, this);
			},

			addEventListeners: function () {
				this.element.observe('mousedown', this.containerMouseDown);
				this.element.observe('click', this.containerClick);
				this.element.observe('dblclick', this.containerDoubleClick);

				this.yearSelector.down('.prev').observe('click', this.prevYearClick);
				this.yearSelector.down('.next').observe('click', this.nextYearClick);

				this.monthSelector.down('.prev').observe('click', this.prevMonthClick);
				this.monthSelector.down('.next').observe('click', this.nextMonthClick);

				this.dateRangeForm.down('input[name="start"]').observe('keyup', this.dateInputKeyup);
				this.dateRangeForm.down('input[name="end"]').observe('keyup', this.dateInputKeyup);
				this.dateRangeForm.down('input[name="start"]').observe('focus', this.dateInputFocus);
				this.dateRangeForm.down('input[name="end"]').observe('focus', this.dateInputFocus);
				this.dateRangeForm.down('input[name="start"]').observe('blur', this.dateInputBlur);
				this.dateRangeForm.down('input[name="end"]').observe('blur', this.dateInputBlur);
				this.dateRangeForm.down('select').observe('change', this.quickDateRangesChange);
				/*
				this.dateRangeForm.down('input[name="start"]').observe('blur', this.dateInputBlur);
				this.dateRangeForm.down('input[name="end"]').observe('blur', this.dateInputBlur);
				*/

			},

			updateInputs: function () {
				var startStr = this.dateRange.start.toLocalizedForm('short', true);
				var endStr = this.dateRange.end.toLocalizedForm('short', true);

				this.dateRangeForm.down('input[name="start"]').removeClassName('invalid').value = startStr;
				this.dateRangeForm.down('input[name="end"]').removeClassName('invalid').value = endStr;
			},

			updateRangeInfo: function () {
				var s = this.dateRange.start;
				var e = this.dateRange.end;
				var rangeInfo = this.dateRangeForm.down('span.rangeInfo');
				var newRangeText = "";

				if (this.isRange || OmniDate_createInstance().defaultTypeId > 0) {
					var dateDiff = 1 + (e.getTime() - s.getTime()) / Date.K.ms.day;
					newRangeText = (dateDiff === 1 ? '1 day' : '%d days').localized().replace(/%d/, dateDiff);
					this.dateTitle = (s.getTime() == e.getTime()) ? s.toLocalizedForm('medium', true) : s.toLocalizedForm('mediumShortYear', true) + ' - ' + e.toLocalizedForm('mediumShortYear', true);
				} else {
					switch (this.periodType) {
						default:
						case 'day':
							var dateDiff = 1 + (e.getTime() - s.getTime()) / Date.K.ms.day;
							newRangeText = (dateDiff === 1 ? '1 day' : '%d days').localized().replace(/%d/, dateDiff);
							this.dateTitle = (s.getTime() == e.getTime()) ? s.toLocalizedForm('medium', true) : s.toLocalizedForm('mediumShortYear', true) + ' - ' + e.toLocalizedForm('mediumShortYear', true);
							break;

						case 'week':
							var dateDiff = (1 + (e.getTime() - s.getTime()) / Date.K.ms.day) / 7;
							newRangeText = (dateDiff === 1 ? '1 week' : '%d weeks').localized().replace(/%d/, dateDiff);
							this.dateTitle = s.toLocalizedForm('mediumShortYear', true) + ' - ' + e.toLocalizedForm('mediumShortYear', true);
							break;

						case 'month':
							var sodi = OmniDate_createInstance(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
							var eodi = OmniDate_createInstance(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
							var dateDiff = 1 + eodi.getCalDate()[1] - sodi.getCalDate()[1];
							var yearDiff = eodi.getCalDate()[0] - sodi.getCalDate()[0];
							dateDiff += yearDiff * 12;
							newRangeText = (dateDiff === 1 ? '1 month' : '%d months').localized().replace(/%d/, dateDiff);
							this.dateTitle = Date.K.shortMonthNames[sodi.getCalDate()[1]-1] + ' ' + sodi.getCalDate()[0];
							break;

						case 'quarter':
							var sodi = OmniDate_createInstance(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
							var eodi = OmniDate_createInstance(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
							var dateDiff = (1 + eodi.getCalDate()[1] - sodi.getCalDate()[1]) / 3;
							newRangeText = (dateDiff === 1 ? '1 quarter' : '%d quarters').localized().replace(/%d/, dateDiff);
							this.dateTitle = s.toLocalizedForm('mediumShortYear', true) + ' - ' + e.toLocalizedForm('mediumShortYear', true);
							break;

						case 'year':
							var sodi = OmniDate_createInstance(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
							var eodi = OmniDate_createInstance(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
							var dateDiff = (1 + eodi.getFullYear() - sodi.getFullYear());
							newRangeText = (dateDiff === 1 ? '1 year' : '%d years').localized().replace(/%d/, dateDiff);
							this.dateTitle = sodi.getCalDate()[0];
							break;
					}

				}

				rangeInfo.update().insert(newRangeText);

/*
				if (dateDiff % 7) {
					rangeInfo.update((dateDiff === 1 ? '1 day' : '%d days').localized().replace(/%d/, dateDiff));
				} else {
					var dd = dateDiff / 7;
					rangeInfo.update((dd === 1 ? '1 week' : '%d weeks').localized().replace(/%d/, dd));
				}
*/
			},

			render: function () {
				for (var i = 0; i < this.numMonths; i++) {
					if (this.months[i]) {
						this.months[i].element.remove();
						this.months[i] = null;
					}

					if (this.dateMode == 'month') {
						var m = new OWL.Month({
							calendar: this.calendar,
							year: this.startYear,
							month: this.startMonth + i,
							dateRange: this.dateRange,
							showWeekSelectors: this.showWeekSelectors
						});
						this.yearSelector.show();
					} else {
						var m = new OWL.Year({
							calendar: this.calendar,
							year: this.startYear + i,
							dateRange: this.dateRange,
							showQuarterSelectors: this.showQuarterSelectors
						});
						this.yearSelector.hide();
					}

					this.months[i] = m;
					this.element.insert(m.element);
				}

				this.yearSelector.down('span').update(this.startYear + (this.calendar.title ? ' ' + this.calendar.title : '')).writeAttribute({'title': this.calendar.description || '', 'abbr': this.startYear});
			},

			updateView: function () {
				for (var i = 0; i < this.numMonths; i++) {
					this.months[i].redraw();
				}
			},

			// Events
			prevYearClick: function () {
				this.startYear--;
				this.render();
			},

			nextYearClick: function () {
				this.startYear++;
				this.render();
			},

			prevMonthClick: function () {
				if (this.dateMode == 'year') {
					this.prevYearClick();
				} else {
					this.startMonth--;
					if (this.startMonth < 0) {
						this.startMonth = 11;
						this.startYear--;
					}

					this.render();
				}
			},

			nextMonthClick: function () {
				if (this.dateMode == 'year') {
					this.nextYearClick();
				} else {
					this.startMonth++;
					if (this.startMonth > 11) {
						this.startMonth = 0;
						this.startYear++;
					}
					this.render();
				}
			},

			dateInputFocus: function (evt) {
				//evt.target.select();
				this.focusedField = evt.target;
				return true;
			},

			dateInputKeyup: function (evt) {
				var d = Date.K.parseLocalized(evt.target.value);

				if (~~d && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
					this.isRange = true;
					var utcd = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
					this.dateRange[evt.target.getAttribute('name')] = utcd;
					evt.target.removeClassName('invalid');
					var newStartYear = utcd.getUTCFullYear();
					var newStartMonth = utcd.getUTCMonth();
					if (evt.target.getAttribute('name') == 'end') {
						newStartMonth -= 2;
						if (newStartMonth < 0) {
							newStartMonth += 12;
							newStartYear -= 1;
						}
					}

					this.startYear = newStartYear;
					this.startMonth = newStartMonth;
					this.render();
					this.onValidDate(this.isRange);
					this.updateRangeInfo();
				} else {
					evt.target.addClassName('invalid');
					this.onInvalidDate();
				}

				this.resetPreset();
			},
			
			dateInputBlur: function (evt) {
				this.focusedField = null;
				this.dateInputKeyup(evt);
			},

			containerMouseDown: function (evt) {
				var t = $(evt.target);

				/* Bug 55624/72663 fix. If clicking a day on the calendar, disable blur event on the date textboxes. */
				if(t.nodeName == 'TD' && t.parentNode.parentNode.nodeName == 'TBODY') {
					this.dateRangeForm.down('input[name="start"]').stopObserving('blur', this.dateInputBlur);
					this.dateRangeForm.down('input[name="end"]').stopObserving('blur', this.dateInputBlur);
				}

				var cap = t.hasClassName('start') ? 'start' : '';
				cap = t.hasClassName('end') ? 'end' : cap;

				this.periodType = null;
			
				if (cap) {
					evt.stop();
					//this.isRange = true;
					this.element.observe('mousemove', this.containerDrag);
					this.element.observe('mouseup', this.containerDragEnd);
					this.capDrag = cap;
					this.stickyDate = new Date(this.dateRange[cap == 'start' ? 'end' : 'start']);
					this.startDrag = t.getAttribute('abbr');
				} else if (t.nodeName == 'TD' && t.parentNode.parentNode.nodeName == 'TBODY') {
					evt.stop();
					//this.isRange = true;
					this.element.observe('mousemove', this.containerDrag);
					this.element.observe('mouseup', this.containerDragEnd);
					this.capDrag = null;
					this.startDrag = t.getAttribute('abbr');
					this.oldDrag = t.getAttribute('abbr');
					//console.log(this.startDrag);
					this.stickyDate = new Date(parseInt(this.startDrag, 10));
				} else if (t.nodeName == 'TH' && t.parentNode.parentNode.nodeName == 'TBODY') {
					/*
					evt.stop();
					this.isRange = false;
					this.element.observe('mousemove', this.containerDrag);
					this.element.observe('mouseup', this.containerDragEnd);
					this.capDrag = null;
					this.startDrag = t.getAttribute('abbr');
					this.stickyDate = new Date(parseInt(this.startDrag, 10));
					*/
				}

				//console.log(t.nodeName, t.parentNode.nodeName);
			},

			containerDrag: function (evt) {
				var t = $(evt.target);
				var abbrattr = t.getAttribute('abbr');
				var abbr = parseInt(abbrattr, 10);
				this.isRange = true;

				if (t.nodeName == 'TD' && t.parentNode.parentNode.nodeName == 'TBODY' && abbrattr != this.oldDrag) {

					if (abbrattr.indexOf('|') >= 0 ) {
						var newDates = abbrattr.split('|');
						newDates[0] = parseInt(newDates[0], 10);
						newDates[1] = parseInt(newDates[1], 10);

						var stickyDates = this.startDrag.split('|');
						stickyDates[0] = parseInt(stickyDates[0], 10);
						stickyDates[1] = parseInt(stickyDates[1], 10);

						if (newDates[0] < stickyDates[0]) {
							this.dateRange.start = new Date(newDates[0]);
							this.dateRange.end = new Date(stickyDates[1]);
						} else if (newDates[1] > stickyDates[1]) {
							this.dateRange.start = new Date(stickyDates[0]);
							this.dateRange.end = new Date(newDates[1]);
						}
					} else {
						var newDate = new Date(abbr);
						this.dateRange.start = this.stickyDate;
						this.dateRange.end = newDate;
					}

					this.oldDrag = abbrattr;

					this.dateRange.sanitize();
					this.updateView();
					this.updateInputs();
					this.updateRangeInfo();
					this.onValidDate(this.isRange);
				}

			},

			containerDragEnd: function (evt) {
				this.element.stopObserving('mousemove', this.containerDrag);
				this.element.stopObserving('mouseup', this.containerDragEnd);
				this.capDrag =  null;
				this.startDrag = null;
				//this.isRange = true;
				this.updateRangeInfo();
				this.onValidDate(this.isRange);
				this.resetPreset();
			},

			containerClick: function (evt) {
				var t = $(evt.target);
				var abbrattr = t.getAttribute('abbr');
				var abbr = parseInt(abbrattr, 10);

				var rerender = false;
				this.isRange = false;
				if (t.nodeName == 'CAPTION') {
					var dates = t.getAttribute('abbr').split('|');
					this.dateRange.start = new Date(parseInt(dates[0]));
					this.dateRange.end = new Date(parseInt(dates[1]));
					this.isRange = false;
					this.periodType = this.dateMode;
					rerender = true;
				} else if (t.nodeName == 'SPAN' && t.parentNode.nodeName == 'DIV' && t.parentNode.className.indexOf('yearSelector') >= 0) {
					var odi = OmniDate_createInstance();
					odi.setCalYear(parseInt(t.innerHTML, 10));
					var start = odi.getStartOfCalYear().getTime();
					odi.setCalYear(odi.getCalDate()[0]);
					var end = odi.getEndOfCalYear().getTime();

					this.dateRange.start = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
					this.dateRange.end = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

					this.isRange = false;
					this.periodType = 'year';
					rerender = true;
				} else if (t.nodeName == 'TH' && t.parentNode.parentNode.nodeName == 'TBODY') {
					this.dateRange.start = new Date(parseInt(t.next().getAttribute('abbr')));

					var td2 = t.up('tr').down('td', 6);
					if (td2) {
						this.dateRange.end = new Date(parseInt(t.up('tr').down('td', 6).getAttribute('abbr')));
					} else {
						this.dateRange.end = new Date(parseInt(t.up('tr').down('td', 2).getAttribute('abbr').split('|')[1]));
					}
					this.isRange = false;
					this.periodType = this.dateMode == 'month' ? 'week' : 'quarter';
					rerender = true;
				} else if (t.nodeName == 'TD' && t.parentNode.parentNode.nodeName == 'TBODY') {
					if (evt.shiftKey) {
						if (this.dateMode == 'month' && !this.scmPrecache) {
							var newDate = new Date(abbr);
							if (newDate.getTime() < this.dateRange.start.getTime()) {
								this.dateRange.start = new Date(abbr);
							} else {
								this.dateRange.end = new Date(abbr);
							}
						} else {
							var newDates = abbrattr.split('|');
							newDates[0] = parseInt(newDates[0], 10);
							newDates[1] = parseInt(newDates[1], 10);

							var odi = OmniDate_createInstance();
							if (newDates[0] < this.dateRange.start.getTime()) {
								this.dateRange.start = new Date(newDates[0]);
								odi.setTime(this.dateRange.end);
								var end = odi.getEndOfCalMonth().getTime();
								this.dateRange.end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
							} else {
								this.dateRange.end = new Date(newDates[1]);
								odi.setTime(this.dateRange.start);
								var start = odi.getStartOfCalMonth().getTime();
								this.dateRange.start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
							}
						}

						this.isRange = true;
					} else {
						if (this.focusedField) {
							if (this.focusedField.getAttribute('name') == 'start') {
								var newStart = abbrattr.indexOf('|') > -1 ? parseInt(abbrattr.split('|')[0], 10) : parseInt(abbrattr, 10);
								if (newStart < this.dateRange.end.getTime()) {
									this.dateRange.start = new Date(newStart);
								} else {
									this.dateRange.start = new Date(newStart);
									this.dateRange.end = abbrattr.indexOf('|') > -1 ? new Date(parseInt(abbrattr.split('|')[1], 10)) : new Date(parseInt(abbrattr, 10));
								}
							} else {
								var newEnd = abbrattr.indexOf('|') > -1 ? parseInt(abbrattr.split('|')[1], 10) : parseInt(abbrattr, 10);
								if (newEnd > this.dateRange.start.getTime()) {
									this.dateRange.end = new Date(newEnd);
								} else {
									this.dateRange.start = abbrattr.indexOf('|') > -1 ? new Date(parseInt(abbrattr.split('|')[0], 10)) : new Date(parseInt(abbrattr, 10));
									this.dateRange.end = new Date(newEnd);
								}
							}
							this.isRange = true;
						} else {
							if (abbrattr.indexOf('|') > -1) {
								var parts = abbrattr.split('|');
								this.dateRange.start = new Date(parseInt(parts[0], 10));
								this.dateRange.end = new Date(parseInt(parts[1], 10));
							} else {
								this.dateRange.start = new Date(abbr);
								this.dateRange.end = new Date(abbr);
							}
							this.isRange = false;
						}
					}

					rerender = true;
				/* Bug 55624/72663 fix. Reenable blur callback for date range textboxes. */
					if (this.focusedField) { this.focusedField.blur(); this.focusedField = null; };
					this.dateRangeForm.down('input[name="start"]').observe('blur', this.dateInputBlur);
					this.dateRangeForm.down('input[name="end"]').observe('blur', this.dateInputBlur);
				}

				if (rerender) {
					this.updateView();
					this.updateInputs();
					this.updateRangeInfo();
					this.onValidDate(this.isRange);
					this.resetPreset();
				}

			},

			resetPreset: function() {
				this.element.getElementsByTagName('select')[0].selectedIndex = 0;
			},

			containerDoubleClick: function (evt) {
				var t = $(evt.target);
				var abbrattr = t.getAttribute('abbr');

				if ((t.nodeName == 'CAPTION' || (t.nodeName != 'TD' && abbrattr && abbrattr.toString().indexOf('|') >= 0))
				|| (t.nodeName == 'SPAN' && t.parentNode.nodeName == 'DIV' && t.parentNode.className.indexOf('yearSelector') >= 0)
				|| ((t.nodeName == 'TH' || t.nodeName == 'TD') && t.parentNode.parentNode.nodeName == 'TBODY')) {
					this.runNow = true;
				}
			},

			quickDateRangesChange: function (evt) {
				var val = evt.target.value;
				//console.log(val);

				if (!val || val === '0') { return false; }

				if (this.quickDates[val]) {
					var parts = val.split('|');
					parts[1] = parseInt(parts[1], 10);
					var start = null;
					var end = null;

					/* This block gets 'today' from the report suite...
					var today = new Date(
						new Date().getTime() + 
						(parseFloat(Omniture.Config.timezoneInfo.current) * Date.K.ms.hour) -
						(new Date().getTimezoneOffset() / 60)
					);
					var y = today.getUTCFullYear();
					var m = today.getUTCMonth();
					var d = today.getUTCDate();
					var todayTime = Date.UTC(y, m, d);
					*/

					var today = new Date();
					var todayTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

					switch (parts[0]) {
						case 'day':
							//console.log('quickdate: day');
							if (parts[1] == 0) { // today
								start = end = todayTime;
								//console.log('quickdate: today - ' + new Date(todayTime).toUTCString());
							} else if (parts[1] == 1) { // yesterday
								start = end = todayTime - Date.K.ms.day;
							} else {
								start = todayTime - (Date.K.ms.day * (parts[1] - 1));
								end = todayTime;
							}
							this.isRange = true;
							break;

						case 'week':
							var firstWeekday = this.calendar.firstWeekday;
							start = new Date(todayTime);

							while (start.getUTCDay() != firstWeekday) {
								start = new Date(start - Date.K.ms.day);
							}

							start = new Date(start.getTime() - parts[1] * Date.K.ms.week);
							end = new Date(start.getTime() + (Date.K.ms.week * (parts[1] || 1)) - Date.K.ms.day);
							this.isRange = false;
							this.periodType = 'week';
							break;

						case 'month':
							var odi = OmniDate_createInstance();
							odi.setTime(new Date(todayTime));
							odi.setCalMonth(odi.getCalDate()[1] - parts[1]);
							start = odi.getStartOfCalMonth().getTime();
							odi.setCalMonth(odi.getCalDate()[1] + (parts[1] - 1 <= 0 ? 0 : parts[1] - 1));
							end = odi.getEndOfCalMonth().getTime();
							
							start = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
							end = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
							this.isRange = false;
							this.periodType = 'month';
							break;

						case 'year':
							var odi = OmniDate_createInstance();
							odi.setTime(new Date(todayTime));
							odi.setCalYear(odi.getCalDate()[0] - parts[1]);
							start = odi.getStartOfCalYear().getTime();
							odi.setCalYear(odi.getCalDate()[0] + (parts[1] - 1 <= 0 ? 0 : parts[1] - 1));
							end = odi.getEndOfCalYear().getTime();

							start = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
							end = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
							this.isRange = false;
							this.periodType = 'year';
							break;
					}

					this.dateRange.start = new Date(start);
					this.dateRange.end = new Date(end);
				} else {
					var dates = val.split('|');
					this.dateRange.start = new Date(parseInt(dates[0], 10));
					this.dateRange.end = new Date(parseInt(dates[1], 10));
				}

				this.updateView();
				this.updateInputs();
				this.updateRangeInfo();
				this.onValidDate(this.isRange);
			}

		});

		OWL.Requirement.met('MonthBlock');
	}
});
