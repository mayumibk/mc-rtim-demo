new OWL.Requirement({
	require: [
		'Calendars',
		'Month',
		'MonthBlock',
		'DateExtras',
		'DateRange',
		'Localization.CalendarWidget'
	],

	thenDo: function () {
		OWL.addCSS(OWL.path + 'modules/CalendarWidget/CalendarWidget.css');
		OWL.CalendarWidget = Class.create({
			debug: false,

			initialize: function (o) {
				o = o || {};

				o.additionalCSS && OWL.addCSS(o.additionalCSS);

				this.calendar = o.calendar || OWL.Calendar.createDefault();
				this.dateRange = o.dateRange || new OWL.DateRange();
				this.compareDateRange = o.compareDateRange || new OWL.DateRange({
					start: new Date(this.dateRange.start),
					end: new Date(this.dateRange.end)
				});
				this.element_container = o.element_container || $(document.body);

				this.mode = o.mode || 'select';
				this.dateMode = o.dateMode || 'month';
				this.showWeekSelectors = o.showWeekSelectors || false;
				this.dateRangeModel = o.dateRangeModel || null;
				this.compareEnabled = o.compareEnabled || false;
				this.yearViewEnabled = o.yearViewEnabled || false;
				this.granularityEnabled = o.granularityEnabled || false;

				this.periodTypeGranularityMap = {
					day: 'hour',
					week: 'day',
					month: 'day',
					quarter: 'month',
					year: 'month'
				};

				this.runButtonTitle = o.runButtonTitle || 'Run Report'.localized();

				this.onRun = o.onRun || function () {};

				this.dateRangeModel && this.consumeDateRangeModel();

				this.setupUndo();
				this.build();
				this.bindEventListeners();
				this.addEventListeners();

				this.updateDateTitle();

				this.domId = (new Date()).getTime();

				this.debug && this.debugMe();
			},

			destroy: function() {
				this.activator.stopObserving('click', this.show);
				this.element.stopObserving('dblclick', this.periodDoubleClick);
				this.fader.stopObserving('click', this.faderClick);
				this.dateTitle.stopObserving('click', this.faderClick);
				this.tabs.down('.select').stopObserving('click', this.selectTabClick);
				this.tabs.down('.compare').stopObserving('click', this.compareTabClick);
				this.yearMonthToggler.stopObserving('click', this.dateModeClick);
				this.runButton.stopObserving('click', this.runButtonClick);
				this.actionsForm.down('input[name="cancel"]').stopObserving('click', this.cancelButtonClick);
				this.granularityArea.down('select').stopObserving('change', this.granularityChange);

				this.dateRangeModel && this.dateRangeModel.removeObserverById(this.getDomId());
			},

			/*
			 * Needed for removeObserverById
			 */
			getDomId: function() {
				return this.domId;
			},

			consumeDateRangeModel: function () {
				var odi = OmniDate_createInstance();
				this.calendar = OWL.Calendar.createDefault();
				this.dateRangeModel.attachObserver(this, 'updateFromModel');
				this.updateFromModel();
			},

			updateFromModel: function () {
				var drStart = this.dateRangeModel.getStartDate().getStandardDate();
				var drEnd = this.dateRangeModel.getEndDate().getStandardDate();
				var drPeriod = this.dateRangeModel.getPeriod();
				var drPeriodType = (drPeriod) ? drPeriod.getType() : '';
				var isRange = true;
				isRange = (this.calendar.canTrend && drPeriodType) ? false : true;

				this.dateRange = new OWL.DateRange({
					start: new Date(Date.UTC(drStart.getFullYear(), drStart.getMonth(), drStart.getDate())),
					end: new Date(Date.UTC(drEnd.getFullYear(), drEnd.getMonth(), drEnd.getDate()))
				});

				if (this.dateRangeModel.getCompareStartDate() && this.dateRangeModel.getCompareEndDate()) {
					var cmpStart = this.dateRangeModel.getCompareStartDate().getStandardDate();
					var cmpEnd = this.dateRangeModel.getCompareEndDate().getStandardDate();

					if (cmpStart && cmpEnd) {
						this.compareDateRange = new OWL.DateRange({
							start: new Date(Date.UTC(cmpStart.getFullYear(), cmpStart.getMonth(), cmpStart.getDate())),
							end: new Date(Date.UTC(cmpEnd.getFullYear(), cmpEnd.getMonth(), cmpEnd.getDate()))
						});
					}
				} else {
					this.compareDateRange = new OWL.DateRange({
						start: new Date(this.dateRange.start),
						end: new Date(this.dateRange.end)
					});
				}

				try {
					var crv = Omniture.Config.report_state.clean_report_vars;

					if (crv.period_subselect && crv.period_subselect.dow && crv.period_subselect.dow.length) {
						this.dayOfWeek = true;
					}

					if (crv.granularity) {
						this.granularity = Omniture.Config.report_state.clean_report_vars.granularity;
						this.granularityArea && (this.granularityArea.down('select').value = this.granularity);
					}
					if (crv.view == 0 || crv.view == 3 || crv.view == 17) {
						this.granularityEnabled = true;
					} else {
						this.granularityEnabled = false;
					}
				} catch (e) {
					this.granularityEnabled = false;
				}
				
				if (this.dateBlock) {
					this.dateBlock.dateRange = this.dateRange;
					this.dateBlock.periodType = drPeriodType;
					this.dateBlock.isRange = isRange;
					this.dateBlock.render();
					this.dateBlock.updateInputs();
					this.dateBlock.updateRangeInfo();
				}
				if (this.compareBlock) {
					this.compareBlock.dateRange = this.compareDateRange;
					this.compareBlock.periodType = drPeriodType;
					this.compareBlock.isRange = isRange;
					this.compareBlock.render();
					this.compareBlock.updateInputs();
					this.compareBlock.updateRangeInfo();
				}
				if (this.dateTitle) {
					this.setupUndo();
					this.updateDateTitle();
				}
				
			},

			updateModel: function () {
				if (this.dateRangeModel) {
					var s = OmniDate_createInstance();
					s.setTime(this.dateRange.start);

					var e = OmniDate_createInstance();
					e.setTime(this.dateRange.end);


					this.dateRangeModel.setStartDate(s);
					this.dateRangeModel.setEndDate(e);

					if (this.compareDateRange && this.compareDateRange.start && this.compareDateRange.end) {
						var cs = OmniDate_createInstance();
						cs.setTime(this.compareDateRange.start);
						var ce = OmniDate_createInstance();
						ce.setTime(this.compareDateRange.end);

						this.dateRangeModel.setCompareStartDate(cs);
						this.dateRangeModel.setCompareEndDate(ce);
					}

					var gran = $F(this.granularityArea.getElementsByTagName('select')[0]);
					this.dateRangeModel.granularity = gran;
					/*
					if (this.granularityEnabled && this.periodTypeGranularityMap[this.dateBlock.periodType] != gran) {
						this.dateRangeModel.setRangePeriodFlag(1);
					} else {
						this.dateRangeModel.setRangePeriodFlag(~~this.dateBlock.isRange);
					}
					*/

					if (this.calendar.canTrend && !this.dayOfWeek) {
						this.dateRangeModel.setRangePeriodFlag(~~this.dateBlock.isRange);
					} else {
						this.dateRangeModel.setRangePeriodFlag(1);
					}
					//console.log('updateModel: rp is: ' + this.dateRangeModel.getRangePeriodFlag());

					var p = this.dateBlock.element.getElementsByTagName('select')[0],
						preset = (p.selectedIndex > 0 && p.options[p.selectedIndex].text.indexOf('-') < 0) ? p.options[p.selectedIndex].value || '' : '';
					this.dateRangeModel._preset = this.dateBlock.quickDates[preset] || '';
					this.dateRangeModel.calcPresetType();
				}
			},

			setupUndo: function () {
				this.undoDates = {
					dateRange: new OWL.DateRange({
						start: new Date(this.dateRange.start.getTime()),
						end: new Date(this.dateRange.end.getTime())
					}),

					compareDateRange: new OWL.DateRange({
						start: new Date(this.compareDateRange.start.getTime()),
						end: new Date(this.compareDateRange.end.getTime())
					})
				};

				this.undoMode = this.mode;
				this.undoPeriodType = (this.dateRangeModel && this.dateRangeModel.getPeriod()) ? this.dateRangeModel.getPeriod().getType() : null;
			},

			render: function () {
				// this does nothing, it's here temporarily so that omniture-base.js doesn't die.
			},

			build: function () {
				this.activator = new Element('div').addClassName('CalendarWidgetActivator').update('\
					<i class="endor-ActionButton-icon coral-Icon coral-Icon--calendar"></i> \
					<span class="endor-ActionButton-label"> \
						<span class="select"></span> \
						<span class="separator">/</span> \
						<span class="compare"></span> \
					</span> \
				');

				this.fader = new Element('div').addClassName('CalendarWidgetFader');
				if (OWL.browser === 'IE6' || OWL.browser === 'Firefox') {
					this.shim = new Element('iframe', { src: 'javascript:"";', scrolling: 'no', frameborder: '0' });
					this.shim.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
					this.fader.insert(this.shim).insert(new Element('div'));
				}
				
				this.element = new Element('div').addClassName('CalendarWidget');
				this.element.onselectstart = function() { return /input|textarea/i.test(window.event.srcElement.tagName); }; // prevent text selection in IE.
				this.tabs = new Element('div').addClassName('tabs').update('\
					<span class="select"><span><span>' + 'Select'.localized() + '</span></span></span> \
					<span class="compare"><span><span>' + 'Compare Dates'.localized() + '</span></span></span> \
				');

				this.dateTitle = new Element('div').addClassName('dateTitle').update('\
					<span class="select"></span> \
					<span class="separator">/</span> \
					<span class="compare"></span> \
				');

				this.yearMonthToggler = new Element('div').addClassName('yearMonthToggler').addClassName(this.dateMode).update('\
					<span class="months' + (this.dateMode === 'month' ? ' selected' : '') + '">' + 'Month'.localized() + '</span> \
					<span class="separator">|</span> \
					<span class="years' + (this.dateMode !== 'month' ? ' selected' : '') + '">' + 'Year'.localized() + '</span> \
				');

				this.actionsForm = new Element('form').addClassName('actionsForm').update('\
					<input type="button" class="button" name="run" value="' + this.runButtonTitle + '" /> \
					<input type="button" class="button" name="cancel" value="' + 'Cancel'.localized() + '" /> \
					<span class="tip">' + 'Tip: You can click and drag to select.'.localized() + '</span> \
				');

				this.runButton = this.actionsForm.down('input[name="run"]');

				var recentDates = null;
				if (this.dateRangeModel) {
					var r = this.dateRangeModel.getRecentDateRanges();
					if (r) {
						recentDates = r.collect(function (e) {
							var f = e.from.split('/').collect(function (e) { return parseInt(e, 10) });
							f[2] = f[2] < 70 ? f[2] + 2000 : f[2] + 1900;

							var t = e.to.split('/').collect(function (e) { return parseInt(e, 10) });
							t[2] = t[2] < 70 ? t[2] + 2000 : t[2] + 1900;

							return {
								from: new Date(Date.UTC(f[2], f[0], f[1])),
								to: new Date(Date.UTC(t[2], t[0], t[1]))
							};
						});
					}
				}

				this.dateBlock = new OWL.MonthBlock({
					calendar: this.calendar,
					dateRange: this.dateRange,
					dateMode: this.dateMode,
					recentDates: recentDates,
					startMonth: this.dateRange.start.getUTCMonth() - 1,
					startYear: this.dateRange.start.getUTCFullYear(),
					title: 'Compare these dates (left column):'.localized(),
					onInvalidDate: this.onInvalidDate.bind(this),
					onValidDate: this.onValidDate.bind(this),
					showWeekSelectors: this.showWeekSelectors,
					periodType: (this.dateRangeModel && this.dateRangeModel.getPeriod()) ? this.dateRangeModel.getPeriod().getType() : null
				});

				this.compareBlock = new OWL.MonthBlock({
					calendar: this.calendar,
					dateRange: this.compareDateRange,
					dateMode: this.dateMode,
					recentDates: recentDates,
					startMonth: this.compareDateRange.start.getUTCMonth() - 1,
					startYear: this.compareDateRange.start.getUTCFullYear(),
					title: 'With these dates (right column):'.localized(),
					onInvalidDate: this.onInvalidDate.bind(this),
					onValidDate: this.onValidCompareDate.bind(this),
					showWeekSelectors: this.showWeekSelectors,
					periodType: (this.dateRangeModel && this.dateRangeModel.getPeriod()) ? this.dateRangeModel.getPeriod().getType() : null
				});

				this.compareBlock.element.addClassName('compare');

				this.granularityArea = new Element('div').update('\
					<label>' + 'View by:'.localized() + '</label> \
					<select> \
						<option value="hour">' + 'Hour'.localized() + '</option> \
						<option value="day">' + 'Day'.localized() + '</option> \
						<option value="week">' + 'Week'.localized() + '</option> \
						<option value="month">' + 'Month'.localized() + '</option> \
						<option value="quarter">' + 'Quarter'.localized() + '</option> \
						<option value="year">' + 'Year'.localized() + '</option> \
					</select> \
					<span class="granularityInfo"></span> \
				');

				this.granularityArea.addClassName('GranularityArea');

				if (!this.compareEnabled) {
					this.tabs.down('.compare').hide();
				}

				if (this.mode == 'compare') {
					this.activator.addClassName('CalendarWidgetActivator-compare');
				}

				this.element
					.insert(this.tabs)
					.insert(this.dateTitle)
					.insert(this.dateBlock.element)
					.insert(this.compareBlock.element)
					.insert(this.yearMonthToggler)
					.insert(this.granularityArea)
					.insert(this.actionsForm);
			},

			bindEventListeners: function () {
				[   'periodDoubleClick',
					'faderClick',
					'selectTabClick',
					'compareTabClick',
					'dateModeClick',
					'granularityChange',
					'runButtonClick',
					'cancelButtonClick',
					'show'
				].each(function (e) {
					this[e] = this[e].bindAsEventListener(this);
				}, this);
			},

			addEventListeners: function () {
				this.activator.observe('click', this.show);
				this.element.observe('dblclick', this.periodDoubleClick);
				this.fader.observe('click', this.faderClick);
				this.dateTitle.observe('click', this.faderClick);
				this.tabs.down('.select').observe('click', this.selectTabClick);
				this.tabs.down('.compare').observe('click', this.compareTabClick);
				this.yearMonthToggler.observe('click', this.dateModeClick);
				this.runButton.observe('click', this.runButtonClick);
				this.actionsForm.down('input[name="cancel"]').observe('click', this.cancelButtonClick);
				this.granularityArea.down('select').observe('change', this.granularityChange);
			},

			show: function () {
				var odi = OmniDate_createInstance();

				this.dateRangeModel && this.updateFromModel();

				odi.setTime(this.dateRange.start);
				this.dateBlock.startMonth = (12 + odi.getCalDate()[1] - (1 + ~~!(OmniDate_isCustom()))) % 12;
				if (odi.getCalendarType() === 5) { this.dateBlock.startMonth += odi.anchor_month - 2; }
				this.dateBlock.startYear = odi.getFullYear() - (odi.getCalDate()[1] - (1 + ~~!(OmniDate_isCustom())) < 0 ? 1 : 0);
				this.dateBlock.render();


				odi.setTime(this.compareDateRange.start);
				this.compareBlock.startMonth = (12 + odi.getCalDate()[1] - (1 + ~~!(OmniDate_isCustom()))) % 12;
				if (odi.getCalendarType() === 5) { this.compareBlock.startMonth += odi.anchor_month - 2; }
				this.compareBlock.startYear = odi.getFullYear() - (odi.getCalDate()[1] - (1 + ~~!(OmniDate_isCustom())) < 0 ? 1 : 0);
				this.compareBlock.render();

				this.element.setStyle({ top: this.activator.cumulativeOffset().top - 5 + 'px' });

				if (this.granularityEnabled) {
					this.granularityArea.show();
				} else {
					this.granularityArea.hide();
				}

				$(document.body).insert(this.fader.hide());
				this.element_container.insert(this.element.hide());

				this[this.mode + 'TabClick']();
				this.onValidDate(!!this.dateRangeModel.getRangePeriodFlag());

				this.element.show();
				this.fader.show();
			},

			hide: function () {
				//If the element has not been attached to a parentNode then it doesn't currently exist within the DOM
				//and there is no reason to do anything. This is important for locations outside of the calendar widget
				//like the report-navigation-ctrl that may be calling hide.
				if (this.fader.parentNode && this.element.parentNode) {
					// avoid IE oddities by hiding first, then after timeout actually removing. (fixed bug #40837)
					this.fader.hide();
					this.element.hide();

					//Calling remove on a prototype element without a parentNode will throw an error. When hide is called
					//externally there is no guarantee

					setTimeout((function() {
						this.fader.remove();
						this.element.remove();
					}).bind(this), 13);
				}
			},

			updateDateTitle: function () {
				var ds = this.dateRange.start;
				var de = this.dateRange.end;
				var cds = this.compareDateRange.start;
				var cde = this.compareDateRange.end;

				var selectText = 
					ds.toLocalizedForm('medium', true) +
					((ds.getTime() != de.getTime()) ? ' - ' + de.toLocalizedForm('medium', true) : '');

				var compareText = 
					cds.toLocalizedForm('medium', true) +
					((cds.getTime() != cde.getTime()) ? ' - ' + cde.toLocalizedForm('medium', true) : '');

				this.dateTitle.down('span.select').update(this.dateBlock.dateTitle);
				this.dateTitle.down('span.compare').update(this.compareBlock.dateTitle);

				this.activator.down('span.select').update(this.dateBlock.dateTitle);
				this.activator.down('span.compare').update(this.compareBlock.dateTitle);

/*
				console.log('select:', this.dateBlock.isRange, this.dateBlock.periodType, this.dateBlock.dateTitle);
				console.log('compare:', this.compareBlock.isRange, this.compareBlock.periodType, this.compareBlock.dateTitle);
*/
			},

			undo: function () {
				this.dateRange = new OWL.DateRange({
					start: new Date(this.undoDates.dateRange.start.getTime()),
					end: new Date(this.undoDates.dateRange.end.getTime())
				});

				this.compareDateRange = new OWL.DateRange({
					start: new Date(this.undoDates.compareDateRange.start.getTime()),
					end: new Date(this.undoDates.compareDateRange.end.getTime())
				});

				this.mode = this.undoMode;
				if (this.mode == 'select') {
					this.activator.removeClassName('CalendarWidgetActivator-compare');
				}

				this.dateBlock.dateRange = this.dateRange;
				this.dateBlock.periodType = this.undoPeriodType;
				this.dateBlock.render();
				this.dateBlock.updateInputs();
				this.dateBlock.updateRangeInfo();

				this.compareBlock.dateRange = this.compareDateRange;
				this.compareBlock.periodType = this.undoPeriodType;
				this.compareBlock.render();
				this.compareBlock.updateInputs();
				this.compareBlock.updateRangeInfo();

				this.updateDateTitle();
			},

			onValidCompareDate: function (isRange) {
				this.onValidDate(isRange, true);
			},

			onValidDate: function (isRange, isCompare) {
				if (!this.calendar.canTrend) { isRange = true; }
				if (this.element.select('input.invalid').length > 0) { return; }

				this.dateRange = new OWL.DateRange({
					start: new Date(this.dateBlock.dateRange.start.getTime()),
					end: new Date(this.dateBlock.dateRange.end.getTime())
				});

				this.compareDateRange = new OWL.DateRange({
					start: new Date(this.compareBlock.dateRange.start.getTime()),
					end: new Date(this.compareBlock.dateRange.end.getTime())
				});

				if (!isRange) {
					var odiStart = OmniDate_createInstance(
						this.dateRange.start.getUTCFullYear(),
						this.dateRange.start.getUTCMonth(),
						this.dateRange.start.getUTCDate()
					);
					var odiEnd = OmniDate_createInstance(
						this.dateRange.end.getUTCFullYear(),
						this.dateRange.end.getUTCMonth(),
						this.dateRange.end.getUTCDate()
					);

					if (this.granularityEnabled) {
						this.granularityArea.down('select').value = this.granularity = this.periodTypeGranularityMap[this.dateBlock.periodType];
					} else {
						this.granularity = '';
					}
				}

				if (this.dateRangeModel) {
					if (!this.calendar.canTrend) {
						this.dateRangeModel.compareRangePeriodFlag = 1;
						this.dateRangeModel.setRangePeriodFlag(1);
					} else {
						if (isCompare) {
							this.dateRangeModel.compareRangePeriodFlag = (~~isRange);
						} else {
							this.dateRangeModel.setRangePeriodFlag(~~isRange);
						}
					}
					this.dateRangeModel.granularity = this.granularity;
				}

				this.runButton.removeClassName('disabled');
				this.updateDateTitle();

				if (Omniture && Omniture.Config && Omniture.Config.disabled_granularities) {
					var opts = this.granularityArea.getElementsByTagName('option');
					for (var i = 0; i < opts.length; i++) {
						if (Omniture.Config.disabled_granularities.indexOf('gran_' + opts[i].getAttribute('value')) >= 0) {
							opts[i].setAttribute('disabled', 'disabled');
						} else {
							opts[i].setAttribute('enabled', 'enabled');
						}

						// Validate the granularity and show a warning if needed
						var granularityOk = false;
						var granularityWarning = '';
						var diff = Date.K.ms.day + this.dateRange.end.getTime() - this.dateRange.start.getTime();
						switch ($F(this.granularityArea.down('select'))) {
							case 'hour':
								if ((diff / Date.K.ms.day) > 14) {
									granularityWarning = 'Hourly granularity can only be selected for a maximum of 14 days.'.localized();
								}
								break;

							case 'day':
								if ((diff / (Date.K.ms.day * 365)) > 2) {
									granularityWarning = 'Daily granularity can only be selected for a maximum of 2 years.'.localized();
								}
								break;

							case 'week':
								break;

							case 'month':
								break;

							case 'quarter':
								break;

							case 'year':
								break;

							default:
								granularityOk = true;
								break;
						}

						if (granularityOk) {
							this.granularityArea.down('span').hide();
						} else {
							this.granularityArea.down('span').update(granularityWarning).show();
						}
					}
				}

				if (isCompare) {
					this.compareRangePeriodFlag = isRange;
				} else {
					this.rangePeriodFlag = isRange;
				}
			},

			onInvalidDate: function () {
				this.runButton.addClassName('disabled');
			},

			// Events
			periodDoubleClick: function(evt) {
				(this.dateBlock.runNow || this.compareBlock.runNow) && this.runButtonClick(evt);
			},

			selectTabClick: function () {
				this.tabs.down('.select').addClassName('selected');
				this.tabs.down('.compare').removeClassName('selected');
				this.activator.removeClassName('CalendarWidgetActivator-compare');
				this.element.removeClassName('CalendarWidget-compare');
				this.mode = 'select';
			},

			compareTabClick: function () {
				this.tabs.down('.select').removeClassName('selected');
				this.tabs.down('.compare').addClassName('selected');
				this.activator.addClassName('CalendarWidgetActivator-compare');
				this.element.addClassName('CalendarWidget-compare');
				this.mode = 'compare';
			},

			dateModeClick: function (evt) {
				var t = $(evt.target);

				if (evt.target.hasClassName('months')) {
					this.dateBlock.dateMode = this.dateMode = 'month';
					this.compareBlock.dateMode = this.dateMode = 'month';
					this.element.down('.yearMonthToggler .months').addClassName('selected');
					this.element.down('.yearMonthToggler .years').removeClassName('selected');
				} else if (evt.target.hasClassName('years')) {
					this.dateBlock.dateMode = this.dateMode = 'year';
					this.compareBlock.dateMode = this.dateMode = 'year';
					this.element.down('.yearMonthToggler .months').removeClassName('selected');
					this.element.down('.yearMonthToggler .years').addClassName('selected');
				}

				this.dateBlock.render();
				this.dateBlock.updateInputs();
				this.dateBlock.updateRangeInfo();

				this.compareBlock.render();
				this.compareBlock.updateInputs();
				this.compareBlock.updateRangeInfo();
			},

			granularityChange: function (evt) {
				this.onValidDate(true);
			},

			faderClick: function (evt) {
				evt.stop();
				this.hide();
				this.undo();
			},

			runButtonClick: function (evt) {
				evt.stop();
				if (!this.runButton.hasClassName('disabled')) {
					this.dateRangeModel && this.updateModel();
					this.hide();
					this.onRun();
				}
			},

			cancelButtonClick: function (evt) {
				evt.stop();
				this.hide();
				this.undo();
			},

			// Debug
			debugMe: function () {
				this.debugElement = new Element('div').addClassName('debug').update('\
					<form> \
						<fieldset> \
							<legend>Debug</legend> \
							<label>Calendar Type:</label> \
							<select name="calTypeSelect"> \
								<option value="0">Gregorian (default)</option> \
								<option value="1">NRF</option> \
								<option value="2">QRS</option> \
								<option value="3">Custom 4-5-4</option> \
								<option value="4">Custom 4-4-5</option> \
								<option value="5">Modified Gregorian</option> \
							</select> \
							<label>First Day of Week:</label> \
							<select name="calFirstDaySelect"> \
								<option value="0">Sunday</option> \
								<option value="1">Monday</option> \
								<option value="2">Tuesday</option> \
								<option value="3">Wednesday</option> \
								<option value="4">Thursday</option> \
								<option value="5">Friday</option> \
								<option value="6">Saturday</option> \
							</select> \
						</fieldset> \
					</form> \
				');


				this.debugCalTypeSelect = this.debugElement.down('select[name="calTypeSelect"]');
				this.debugCalFirstDaySelect = this.debugElement.down('select[name="calFirstDaySelect"]');

				this.debugCalTypeSelect.selectedIndex = OmniDate_createInstance().defaultTypeId;
				this.debugCalFirstDaySelect.selectedIndex = this.calendar.firstWeekday;

				var calTypeChange = (function () {
					var calType = $F(this.debugCalTypeSelect);
					var fd = $F(this.debugCalFirstDaySelect);

					if (calType > 2) {
						this.debugCalFirstDaySelect.enable();
					} else {
						this.debugCalFirstDaySelect.disable();
						this.debugCalFirstDaySelect.value = fd = 0;
					}

					this.dateBlock.calendar = 
					this.compareBlock.calendar = 
					this.calendar = new OWL.CalendarTypes[calType]({
						firstWeekday: parseInt(fd)
					});

					this.dateBlock.render();
					this.compareBlock.render();
				}).bindAsEventListener(this);

				this.debugCalTypeSelect.observe('change', calTypeChange);
				this.debugCalFirstDaySelect.observe('change', calTypeChange);

				this.element.insert(this.debugElement);
			}
		});
		OWL.Requirement.met('CalendarWidget');
	}
});
