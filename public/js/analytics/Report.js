(function(undefined) {

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', COL = ':', EMPTY_LABEL = '...';

	// relies on Prototype, OM.URL, Base64 (omniture.js)
	ns.Report = Class.create({
		id:          0,  // what bookmark to save / load
		login:       MT, // the user that owns the bookmark
		product:     'sitecatalyst',
		version:     null, // bookmarks.class version

		// report_state
		oid: 0, // report object id
		rs:  {  // report suite / account / user
			id:       MT,
			title:    MT,
			calendar: { // cal info
				timezone_offset:     0,
				timezone_abbrev:     MT,
				type:                0,
				anchor_date:         null,
				first_day_of_week:   0,
				first_month_of_year: 0
			}
		},
		is_variable:  true,  // publishing lists can change report suite

		// additional info
		title:        MT,   // pretty report name
		segment_name: null, // pretty segment
		segment_id:   [],
		period_label: MT,   // pretty date
		base_url:     null, // url of full report minus report params
		dirty:        false,
		cells:        null, // where the report is place

		// blacklist of params in getJSON and getReportURL
		non_json:  { version:1, cells:1, keep_vars:1, non_url:1, non_json:1, dirty:1, segment_name:1, period_label:1, base_url:1, graph_template:1, graph_views:1, id:1, rs:1, product:1 },
		non_url:   { version:1, cells:1, keep_vars:1, non_url:1, non_json:1, dirty:1, segment_name:1, period_label:1, base_url:1, graph_template:1, graph_views:1, id:1, rs:1, product:1, title:1, oid:1, lock_start:1, lock_end:1, meta_params:1 },
		keep_vars: [ 'bookmark_product_id', 'rs', 'is_variable', 'ob_segment_id', 'segment_name', 'period', 'period_from', 'period_to', 'preset', 'range_period', 'granularity', 'period_label', 'period_subselect', 'lock_start', 'lock_end', 'percent_as_graph', 'version', 'meta_params' ], // whitelist of vars preserved when traversing reports

		/* clean_report_vars */

	//	show_forecast:     0,
	//	show_details:      0,
	//	show_internet_avg: 0,
	//	show_metrics:      0,

	//	cache_override:   false,
	//	skip_fast_tables: false,

		period:       MT,
		granularity:  MT,
		range_period: MT,
		preset:       MT,
		period_from:  MT,
		period_to:    MT,
		lock_start:   MT,
		lock_end:     MT,
		bookmark_product_id: MT, 

		meta_params:      MT, // array

		period_subselect: MT,

		view:             MT,   // see SC_ReportViewMap.class.php
		ob_segment_id:    MT, // segment applied
		show_percents:    MT,  // show percent columns
		percent_as_graph: MT,  // show inline graph in percent columns
		hide_trends: MT,  // hide trends in the graph

		row:        MT, // first row num = row + 1
		subrel_row: MT, // subrow to start at

		detail_depth:        MT, // number of primary items
		subrel_detail_depth: MT,  // number of sub items

		sort:        MT,
		sort_event:  MT,
		trend_items: null, // array
		trend_fit:   null,
		std_events:  null, // array

		ec_reset: MT,
		ec_det:   '::entiresite::',
		ec_det_type: MT,
		ec_pri:   MT,
		ec_sort:  MT,
		ec_sub1:  MT,
		ec_unit:  MT,
		division: MT, // array
		ec_summary_unit:MT,

		v_div: MT,

		current_data:null,

		search:         null,
		sub_rel_search: null,

		page_ids_are_hashes: true,
		page_type:           MT,
		page:  '::entiresite::',
		page1: null,
		page2: null,

		element_filter: MT,
		path_filter:    MT,
		node_filter:    MT,

		hierarchy:   MT,
		c_hierarchy: MT, // classification hier
		h_list:      null,
		hierarchy_hash_list: null,

		ref_type:        null,
		ref_type_search: null,

		mobile_report_type:        null,
		subrel_mobile_report_type: null,

		correlate:         null,
		correlate_details: null,

		// geo
		geo_country: null,
		geo_region:  null,
		
		media:        '::entiremedia::',
		media2:       null,
		media_player: '::entiremediaplayers::',

		// chart vars
		chart_item_count: 0,
		chart_type:       null,
		event_on_graph:   null,
		show_all_others:  false,
		show_none:        false,

		compare:            MT,
		comparison:         MT,
		comparison_details: null,
		normalize:          MT,

		// custom reportlet vars
		api_url_type:     null, // web api
		web_api_url:      null, // web api
		custom_text:      null, // text reportlet
		suites_selected:  null, // company summary
		usage_options:    null, // usage summary
		high_low_display: null, // report suite summary

		// metric gauge
		visualization_type:     null,
		gauge_color_order:      null,
		threshold_less_than:    null,
		threshold_greater_than: null,

		// social sample reportlet
		sentiment: null,
		provider:  null,
		audience:  null,
		author:    null,

		// targeting reportlet
		target_id: null,
		ttas:      null,

		initialize: function(o) { this.cells = []; return o ? this.set(o, true) : this; },

		set: function set(o, no_dirty) {
			var count = 0;
			o = this.decode(o || {});
			for (var i in o) { if (i in this && this[i] !== o[i]) { this[i] = o[i]; ++count; } } // set all changed vars

			// validate property types
			this.oid = parseInt(this.oid, 10) || 0;

			var cal = this.rs.calendar; // update the calendar id hash
			if (cal.hash = cal.type) { cal.hash += COL + cal.anchor_date; }
			cal.hash += COL + cal.timezone_offset;

			if (count && !no_dirty) { this.dirty = true; }
			return this;
		},

		reset: function reset(o) {
			var i, proto = this.constructor.prototype;
			for (i in this) { if (this.hasOwnProperty(i)) { this[i] = proto[i]; } }
			this.cells = [];
			return this.set(o, true);
		},

		decode: function decode(o) {
			if (!o || !o.base64) { return o; }
			var a = o.base64, i, l = a.length;
			for (i = 0; i < l; ++i) { o[a[i]] = Base64.decode(o[a[i]]); }
			return o;
		},

		isCustom:       function isCustom()       { return (this.oid > 1100 && this.oid < 1110); },
		canHaveRS:      function canHaveRS()      { return [ 1101, 1103, 1104, 1105, 1107 ].indexOf(this.oid) < 0; },           // exclude list
		canHaveDate:    function canHaveDate()    { return this.oid !== 1101 && this.oid !== 1107 && this.oid !== 1105 && this.oid !== 1109; },      // not: text, image, or web api
		canHaveGraph:   function canHaveGraph()   { return this.oid !== 1109 && (this.oid < 1101 || this.oid > 1105 || (this.oid === 1105 && this.api_url_type === 'xml')); },
		canHaveData:    function canHaveData()    { return this.oid !== 1106 && this.oid !== 1107 && this.oid !== 1108; },      // not: image only reportlets
		canHaveSummary: function canHaveSummary() { return [ 338, 352, 376, 378, 379, 408, 409, 866, 899, 6101, 819, 823, 844, 847 ].indexOf(this.oid) >= 0; },
		canSetMaxRows:  function canSetMaxRows()  { return !this.isCustom() && [ 372, 373, 338, 847 ].indexOf(this.oid) < 0; }, // not: custom (1100 - 1108), fallout (372, 373), summary (338), funnel (847)
		canEditInline:  function canEditInline()  { return this.oid === 1101 || this.oid === 1105 || this.oid === 1107; },

		autoGraphView: function autoGraphView() { return !!this.graph_views[this.view]; },
		graph_views: [ 1, 0, 0, 1, 0, 1, 0, 1, 0, 1 ], // views 0, 3, 5, 7, 9 show graph, all others show table

		run: function run(params, fn, no_acc) {
			params = params || { page_style:'LETTER_LANDSCAPE', grid:'2x2',
				cell:{ colspan:2, rowspan:2, graph:1, summary:1, table:1, maxRows:-1, hide:[] } };
			params.cell.report = this.toJSON();
			var key = Object.toJSON(params), cache = ns.Report.cache,
				cached = no_acc ? cache.del(key) : cache.get(key);
			if (cached) {
				fn.call(this, this, cached, 0);
				if (cached.period_label) { this.period_label = cached.period_label; }
				return this;
			}

			params.cell = Object.toJSON(params.cell);
			if (no_acc) { params.no_acc = 1; } // kill dashboard accelerator cache

			var Omniture = window.Omniture;
			if(Omniture && Omniture.Config && Omniture.Config.dashboard_debug_id) {
				alert('saving debug');
				params.save_debug = Omniture.Config.dashboard_debug_id;
			}

			var started = +(new Date()),
				request = new Ajax.Request(OM.URL.fs('Dashboard.RunReport', {}, ns.Report.gateway), {
					parameters:params, method:'post',
					onComplete:this.runComplete.bind(this, fn, started, key)
				});
			return this;
		},

		runComplete: function runComplete(fn, started, key, xhr) {
			var response = xhr.responseJSON || OM.getResponseJSONFromResponseText(xhr.responseText) || { failure:true, success:false, text:xhr.responseText };
			if (response.success) { ns.Report.cache.put(key, response); }
			if (response.period_label) { this.period_label = response.period_label; }
			fn.call(this, this, response, (new Date()) - started);
			return this;
		},

		toJSON: function toJSON() {
			if (this.id && !this.dirty) { return { id:this.id }; }
			var i, obj = {}, proto = this.constructor.prototype;
			for (i in this) { if (!(i in obj) && !this.non_json[i] && this[i] !== proto[i]) { obj[i] = this[i]; } }
			obj.rs = this.rs.id;
			return obj;
		},

		getReportURL: function getReportURL(params) {
			if (!this.base_url || this.isCustom()) { return null; }

			var params = params || {}, URL = OM.URL, url = this.base_url, count = 0;
			if (this.dirty || !this.id) {
				for (i in this) { if (!(i in params) && this.hasOwnProperty(i) && !this.non_url[i]) { params[i] = this[i]; ++count; } }
				// replace renamed params
				if ('page' in params && params.page && params.page !== this.constructor.prototype.page) { params.newpage = params.page; params.page = null; }
			}
			if (this.hierarchy && this.hierarchy.num !== undefined) { ++count; params.hierarchy = this.hierarchy; } // hierarchy must be in the url
			if (count) { url = URL.appendParams(url, { rp:URL.reportParamsToUrl(params) }); }
			url = URL.switchps(this.product, url);
			return URL.suite('Main.SwitchReportSuite', { d_url:Base64.encode(url), switch_accnt:this.rs.id });
		},

		getKeepVars: function getKeepVars() {
			var vars = this.keep_vars, i, l = vars.length, o = {};
			for (i = 0; i < l; ++i) { o[vars[i]] = this[vars[i]]; }
			return o;
		}
	});

	var use_async_domains = !window.ActiveXObject && OWL.browser != "Chrome" && location.href.indexOf('xdomain=0') < 0; // IE doesn't do well + flag to disable
	ns.Report.gateway = (use_async_domains ? OM.URL.getDomain('async', 0, 2)+OM.Config.SUITE_PATH : OM.Config.AJAX_SUITE_URL)+'/json/index.html';

	var hb = {}; // hash bang report cache - prevent multiple reports with same params being created
	ns.Report.fromHashBang = function fromHashBang(url) {
		var json = url && (url.indexOf('#!') >= 0) && decodeURI(url.replace(/^[^#]*#!/, '')),
			o = json && (o = json.evalJSON());
		return (o && (hb[json] = hb[json] || new ns.Report(o))) || null;
	};

	ns.Report.delta = function delta(from, to) {
		if (typeof to === 'string') { to = Report.fromHashBang(to); }
		var count = 0, forward = {}, back = {}, i;
		for (i in to) { if (i in from && to[i] !== from[i]) {
			forward[i] = to[i];
			back[i]    = from[i];
			++count;
		} }
		for (i in from) { if (!(i in to) && to[i] !== from[i]) {
			forward[i] = undefined;
			back[i]    = from[i];
			++count;
		} }
		return count ? { forward:forward, back:back } : null;
	};

	ns.Report.cache = {
		items:    {},
		timeout:  (5 * 60 * 1000), // items expire after 5 minutes
		clean: function clean() {
			var items = this.items, p, now = +(new Date());
			for (p in items) { if (items[p].expires < now) { delete items[p]; } }
		},
		put: function put(key, value) {
			this.clean();
			return this.items[key] = { value:value, expires:+(new Date()) + this.timeout };
		},
		get: function get(key) {
			this.clean();
			if (!(key in this.items)) { return null; }
			return this.items[key].value;
		},
		del: function del(key) {
			this.clean();
			delete this.items[key];
			return null;
		}
	};

	OM.Requirement.met('AP:dashboard.Report');
})();
