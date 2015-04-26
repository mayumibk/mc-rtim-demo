(function(undefined) {
	if ((OM.dashboard = OM.dashboard || {}).Tracker) { return; }

	var MT = '', PROP = 'prop', EVAR = 'eVar', EVENT = 'event', EVENTS = 'events',
		O = 'o', D = 'd';

	var Tracker = (OM.dashboard.Tracker = {

		download: function download(e) { Tracker.track('event50', 'Dashboard Download PDF', Tracker.getDashboardVars(), D); },
		print:    function print(e)    { Tracker.track('event51', 'Dashboard Print PDF',    Tracker.getDashboardVars()); },
		send:     function send(e)     { Tracker.track('event52', 'Dashboard Send',         Tracker.getDashboardVars()); },

		save: function save(e) {
			var vars = Tracker.getDashboardVars();
			if (e.memo.id === e.memo.prev_id) { Tracker.track('event53', 'Dashboard Save', vars); }
			else { Tracker.track('event54', 'Dashboard Save As', vars); }
		},

		suiteChange: function suiteChange(e) {
			var vars = Tracker.getDashboardVars();
			vars.prop1 = e.memo.value;
			Tracker.track('event55', 'Dashboard RS Change', vars);
		},

		segmentChange: function segmentChange(e) {
			var vars = Tracker.getDashboardVars(), item = e.memo;
			if (item.value == '0') { vars.prop14 = 'No Segment'; }
			else { vars.prop14 = 'Custom'; }
			Tracker.track('event56', 'Dashboard Segment Change', vars);
		},

		dateChange: function dateChange(e) {
			var date = Tracker.getTrackingDate(e.memo.params);
			if (e.memo.global) { Tracker.track('event57', 'Dashboard Date Change', { prop7:date }); }
			else { Tracker.track('event62', 'Reportlet Date Change', { prop7:date }); }
		},

		reportletRun: function reportletRun(e) {
			var vars = {}, report = e.memo.cell.report,
				extra = 'event65', events = 'event65='+(e.memo.time/1000),
				response = e.memo.response, cell = e.memo.cell,
				size = cell.element.getDimensions();
			vars.prop1 = report.rs.id;
			if (report.canHaveDate()) { vars.prop7 = Tracker.getTrackingDate(report); }
			vars.prop8  = 'Reportlet {oid='+report.oid+'&view='+report.view+'}';
			vars.prop9  = Tracker.getReportletType(report);
			if (report.canHaveGraph()) { vars.prop12 = (report.chart_type||MT)+'|'+(report.chart_item_count||MT)+'|'+(report.show_percents?'percent':'number'); }
			vars.prop40 = Tracker.getTimeFromMs(e.memo.time);
			if (e.memo.time) { // if from in-memory cache, don't log these times
				vars.prop41 = Tracker.getTimeFromMs(response.report_time);
				vars.prop42 = Tracker.getTimeFromMs(response.render_time);
				vars.prop43 = 'db_acc|' + (OM.Config.db_acc_enabled ? (response.from_cache ? 'hit' : 'miss') : 'disabled');
				extra += ',event66,event67';
				events += '|event66='+(response.report_time/1000)+'|event67='+(response.render_time/1000);
			} else { vars.prop43 = 'js|hit'; }
			vars.prop44 = cell.page.page_style.toLowerCase().replace('_', '|')+'|'+cell.page.grid+'|'+cell.colspan+'x'+cell.rowspan+'|'+size.width+'|'+size.height;
			if (response.success) { vars.prop45 = (response.graph&&'graph'||MT)+'|'+(response.content&&response.content.length>1&&'summary'||MT)+'|'+(response.content&&response.content.length&&'details'||MT); }
			if (response.notice) { vars.prop46 = 'no data'; }
			else if (response.error) { vars.prop46 = 'unable to retrieve'; }
			else if (response.warning) { vars.prop46 = response.warning.id.replace(/_/, ' '); }
			else if (response.failure && response.text) { vars.prop46 = 'uncaught php error'; }
			vars.prop47 = +cell.elements.note_icn.innerHTML || 'none';
			vars.prop48 = cell.maxRows < 0 ? 'no limit set' : cell.maxRows;
			Tracker.track('event58,'+extra, 'Reportlet Run', vars, O, events);
		},

		reportletDrillInto: function reportletDrillInto(e) {
			var report = e.memo.report;
			Tracker.track('event59', 'Reportlet Drill Into', { prop8:'Reportlet {oid='+report.oid+'&view='+report.view+'}', prop9:Tracker.getReportletType(report) });
		},

		reportletSuiteChange: function reportletSuiteChange(e) { Tracker.track('event60', 'Reportlet RS Change', { prop1:e.memo.value }); },

		reportletSegmentChange: function reportletSegmentChange(e) {
			var vars = {}, item = e.memo;
			if (item.value == '0') { vars.prop14 = 'No Segment'; }
			else if (item.tnt_id)  { vars.prop14 = item.sc_seg_id; }
			else { vars.prop14 = 'Custom'; }
			Tracker.track('event61', 'Reportlet Segment Change', vars);
		},

		getTrackingDate: function getTrackingDate(params) {
			var ms_per_day = 1000 * 60 * 60 * 24, now = new Date(),
				froma = params.period_from.split('/'), toa = params.period_to.split('/'),
				from = new Date(+froma[2] < 90 ? (+froma[2])+2000 : +froma[2], froma[0]-1, +froma[1]),
				to = new Date(+toa[2] < 90 ? (+toa[2])+2000 : +toa[2], toa[0]-1, +toa[1]),
				days_ago = ~~((now-from)/ms_per_day), days_long = ~~((to-from)/ms_per_day), // ~~ truncates to int
				years_ago = now.getFullYear() - from.getFullYear(), months_ago = now.getMonth() - from.getMonth() + years_ago * 12;
				if (months_ago < 0) { months_ago = 0; }
			return '-'+years_ago+'y|-'+months_ago+'m|-'+days_ago+'d|'+days_long+'d';
		},

		getReportletType: function getReportletType(report) {
			if (report.isCustom()) {
				if (report.oid === 1101) { return 'Text'; }
				if (report.oid === 1102) { return 'Report Suite Summary'; }
				if (report.oid === 1103) { return 'Company Summary'; }
				if (report.oid === 1104) { return 'Usage Summary'; }
				if (report.oid === 1105) {
					if (report.api_url_type === 'xml')  { return 'XML API'; }
					if (report.api_url_type === 'csv')  { return 'CSV API'; }
					if (report.api_url_type === 'rss')  { return 'RSS API'; }
					if (report.api_url_type === 'text') { return 'Text API'; }
					else { return 'HTML API'; }
				}
				if (report.oid === 1106) { return 'Metric Gauge'; }
				if (report.oid === 1107) { return 'Image'; }
			}
			return 'Reportlet';
		},

		getTimeFromMs: function getTimeFromMs(ms) {
			var str = MT, conv = (1000 * 60), // minutes
				time = ~~(ms / conv), rem = ms % conv;
			if (time) { str += time+' minutes '; }
			if (time < 2) {
				time = (rem / 1000); // seconds
				str += +(time.toPrecision(time < 1 ? 1 : 2)) + ' seconds';
			}
			return str.strip();
		},

		getDashboardVars: function getDashboardVars() {
			var dashboard = page_controller.widgets.dashboard;
			if (!dashboard) { return {}; }
			return {
				prop30:dashboard.pages.length,
				prop31:dashboard.page_style.toLowerCase().replace('_', ' '),
				prop32:dashboard.is_owner?'owned':'shared'
			};
		},

		track: function track(events, description, vars, type, cevents) {
			var obuet = window.obuet, p, v, to_track = [ EVENTS, 'prop1', 'prop2', 'prop3', 'prop4', 'prop10', 'prop11', 'prop13' ];
			if (!obuet || !obuet.tl) { return false; }

			vars = vars || {};
			for (p in vars) {
				to_track.push(p);
				obuet[p] = String(vars[p]);
				if (p.indexOf(PROP) === 0) { // copy all props to eVars
					to_track.push(v = EVAR+p.substr(4));
					obuet[v] = obuet[p];
				}
			}
			if (cevents) {
				obuet.products = ';;;;'+cevents;
				to_track.push('products');
			}

			obuet.linkTrackVars = to_track.uniq().join();
			obuet.linkTrackEvents = (obuet.events = events || MT);
			obuet.tl(true, type||O, description);
			return true;
		}

	}), body = $(document.body);

	body.on('click', '#download_tool', Tracker.download);
	body.on('click', '#print_tool', Tracker.print);
//	body.on('click', '#email_tool', Tracker.send);
	body.on('om:dashboard.saved', Tracker.save);
	body.on('om:dashboard.Controller.rschange', Tracker.suiteChange);
	body.on('om:dashboard.Controller.segmentchange', Tracker.segmentChange);
	body.on('om:dashboard.Controller.datechange', Tracker.dateChange);
	body.on('om:dashboard.Cell.panelLoaded', Tracker.reportletRun);
	body.on('om:dashboard.Cell.drillinto', Tracker.reportletDrillInto);
	body.on('om:dashboard.Cell.rschange', Tracker.reportletSuiteChange);
	body.on('om:dashboard.Cell.segmentchange', Tracker.reportletSegmentChange);

	OM.Requirement.met('AP:dashboard.Tracker');
})();
