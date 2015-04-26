(function(undefined) {

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', DIV = 'div';

	ns.Panel = Class.create({
		cell: null,

		images: null,

		is_loading:  false,
		is_outdated: false,

		initialize: function initialize(cell) {
			this.cell = cell;
			return this.build();
		},

		build: function build() {
			this.element = new Element(DIV, { 'class':'panel' });
			this.element.widget = this;
			this.images = [];
			return this;
		},

		load: function load(fn, hard) {
			this.is_loading = true;
			var cell    = this.cell, page = cell.page, report = cell.report,
				graph   = cell.graph   === 'auto' ? report.autoGraphView()  : cell.graph,
				summary = cell.summary === 'auto' ? !report.autoGraphView() : cell.summary,
				table   = cell.table   === 'auto' ? !report.autoGraphView() : cell.table,
				params  = {
					cell:{ colspan:cell.colspan, rowspan:cell.rowspan, maxRows:cell.maxRows,
						graph:graph, summary:summary, table:table, hide:cell.hide||[] },
					page_style:page.page_style, grid:page.grid
				};
			OM.require('AP:dashboard.ReportTable', report.run.bind(report, params, this.loaded.bind(this, fn), hard));
			return this;
		},

		loaded: function loaded(fn, report, response, time) {
			if (response.success) {
				var cell = this.cell, panel = cell.elements.panel,
					size = { width:panel.measure('width'), height:panel.measure('height') };
				if (!size.width || !size.height) { setTimeout(this.loaded.bind(this, fn, report, response, time), 500); return this; }
				var graph_height = cell.graph && report.canHaveGraph() && this.renderGraph(response.graph, size);
				if (graph_height) { size.height -= graph_height; }
				this.renderTable(response.content, size);
				if (this.images.length) { // don't say we're done until all images load
					var images = this.images, i, l = this.images.length, count = l, panel = this, img;
					function loaded_image() { if (!(--count)) { fn.call(panel, panel, response, time); } }
					for (i = 0; i < l; ++i) {
						img = new Image();
						img.onload = loaded_image;
						img.src = images[i];
					}
					setTimeout(function() { while (count > 0) { loaded_image(); } }, 2000); // cap waiting time to 2 sec.
				} else { fn.call(this, this, response, time); }
			} else {
				var msg = response.notice || response.error;
				if (msg) { this.element.update('<div class="failure"><span>'+msg+'</span></div>'); }
				fn.call(this, this, response, time);
			}
			return this;
		},

		getIEVersion: function getIEVersion() {	
			return /MSIE (\d*?)\./.test(navigator.userAgent) ? new Number(RegExp.$1) : false;
		},

		renderGraph: function renderGraph(graph, size) {
			var img = MT, width = size.width, height = 0;
			if (graph && parseFloat(graph.width) && parseFloat(graph.height)) {
				if (graph.width - width > 3) { height = width * graph.height / graph.width; }
				else { width = graph.width; height = graph.height; }
				if (height - size.height > 3) { width = (height = size.height) * graph.width / graph.height; }
				var url = OM.URL.s(graph.url), ieVersion = this.getIEVersion();
				// Bug AN-59439: fallout and funnel chart images were not showing in reportlets in IE 7,8,9 because 
				//   the image url is cross subdomain. This line changes the url to a relative url for IE 9 and below:
				if (ieVersion && ieVersion <= 9) { url = url.replace(/^.*?\.com/, ""); }
				img = this.graph_template.evaluate({
					src:url, width:~~width, height:~~height, // ~~ truncates the number (no decimals)
					left:~~((size.width-width)/2),
					usemap:graph.usemap||MT, map:graph.map||MT });
				this.images.push(OM.URL.s(graph.url));
			} else if (graph && graph.type === 'text') { img = graph.value; height = 14; }
			this.element.insert(img);
			return height;
		},

		graph_template: new Template(
			'<img class="chart" src="#{src}" width="#{width}" height="#{height}" usemap="#{usemap}" style="margin-left:#{left}px" onmousedown="event.preventDefault&&event.preventDefault()" ondragstart="return false" />#{map}'
		),

		renderTable: function renderTable(content, size) {
			var a = Array.isArray(content) ? content : [content], i, l, table,
				ReportTable = OM.dashboard.ReportTable,
				el = this.element, h = size.height, r = this.cell.maxRows;
			for (i=0, l=a.length; i < l; ++i) {
				if (a[i] && a[i].type === 'image') { this.renderGraph(a[i], size); }
				else { el.insert((new ReportTable({ content:a[i], height:h, maxRows:r })).element); }
			}
			return this;
		}
	});

	OM.Requirement.met('AP:dashboard.Panel');
})();
