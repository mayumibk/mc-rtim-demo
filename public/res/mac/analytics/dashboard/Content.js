/* This is the intended user experience of content items and reportlet linkages as I understand it. However, I'm
 * documenting this through observation only as I've fixed bugs. I did not participate in any UX design discussions
 * or the building of the dashboard so whether this is the preferred UX is TBD. -- Aaron Hardy
 *
 * Create a new dashboard and name it Linkage 1. Drag the Report Suite Summary content item from
 * Add Content > Custom Reportlets > Data Content into the dashboard.  Change the name of the reportlet to Reportlet 1.
 * Do this again but drag the Report Suite Summary content item into a new cell and name it Reportlet 2.  If you change
 * the date period of Reportlet 1 it should not change the date period of Reportlet 2. You should see content items
 * Reportlet 1 and Reportlet 2 under the Dashboard Contents panel on the left.  Drag the Reportlet 1 content item from
 * the panel to a new cell.  You should now have two cells with Reportlet 1 and one cell with Reportlet 2.  Edit the
 * date period of one of the Reportlet 1 cells and it should change the date period of the other Reportlet 1 cell.
 * They are in essence "linked".  Save the dashboard.  Close the layout editor and re-open the layout editor.
 * Again edit the date period of one of the Reportlet 1 cells and it should change the date period of the other
 * Reportlet 1 cell.  The Reportlet 2 cell should remain unchanged.
 *
 * Create a new dashboard and name it Linkage 2.  From the left-hand panel, drag Reportlet 1 from
 * Add Content > My Dashboards > Linkage 1 into the Linkage 2 dashboard.  The date period of the reportlet should
 * be the same as it last was in Linkage 1.  Drag Reportlet 1 in again from the left-hand panel into a new cell.
 * You should now have two cells with Reportlet 1. Under the Dashboard Contents panel on the left Reportlet 1 should
 * only show up a single time.    Modify the date period of one of the cells and it should update the reportlet in the
 * other cell.  Save the dashboard.  Open the Linkage 1 dashboard in a new tab.  The date periods of Reportlet 1 in
 * Linkage 1 should not have changed when the date periods were changed in Linkage 2.
 *
 * Notice an important distinction here.  When dragging a content item twice from Custom Reportlets into two
 * different cells they are not linked.  When dragging a content item twice from My Dashboards, Shared Dashboards,
 * or Legacy Dashboards into two different cells they are linked.  When dragging a content item from
 * Dashboard Contents into two different cells they are always linked.
 */

(function(undefined){

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', DIV = 'div', ICN = 'i', LBL = 'label';

	ns.Content = Class.create({
		dashboard: null,

		element:  null,
		external: null,
		content:  null,

		searcher:  null,
		searching: null,
		reports:   null,

		dragging: null,

		// Array of all ("custom reportlets") reports otherwise known as pre-build reports.
		// These show up under Add Content > Custom Reportlets.
		preBuildReports: null,

		initialize: function initialize(dashboard) {
			this.dashboard = dashboard;
			this.reports   = {};
			this.preBuildReports = [];
			return this.build().addListeners();
		},

		build: function build() {
			this.element  = $('edit_layout_bar');
			this.external = $('dashboard_external_content');
			this.content  = $('dashboard_content');
			this.search_content = $('dashboard_content_search');

			OM.util.disableSelection(this.element);
			this.dashboard.bookmarks.sort(resultNaturalSort);
			this.updateUse();
			this.content.previous().addClassName('open');

			this.proxy = new Element(DIV, { 'class':'report proxy' });
			$(document.body).insert(this.proxy.hide());
			OM.util.disableSelection(this.proxy);

			OM.require('AP:dashboard.Report', this.getPrebuildReports.bind(this));
			return this;
		},

		updateUse: function updateUse() {
			var reports = this.dashboard.bookmarks, i, l = reports.length;
			for (i = 0; i < l; ++i) { reports[i].cells.length = 0; } // clear list
			var pages = this.dashboard.pages, p, pp = pages.length,
				cells, c, cc;
			for (p = 0; p < pp; ++p) { cells = pages[p].cells; cc = cells.length;
				for (c = 0; c < cc; ++c) { cells[c].report.cells.push(cells[c]); }
			}
			this.content.update();
			for (i = 0; i < l; ++i) { this.buildReport(reports[i]); }
		},

		getPrebuildReports: function getPrebuildReports() {
			var sources = this.external.select('[data-source-loaded=1]'),
				extern = this.reports, Report = ns.Report,
				s, ss = sources.length, r, rr, id, json, report;
			for (s = 0; s < ss; ++s) {
				id = sources[s].id;
				reports = sources[s].select('[data-report]');
				for (r = 0, rr = reports.length; r < rr; ++r) {
					json = reports[r].readAttribute('data-report').evalJSON();
					if (json) {
						reports[r].report = (report = new Report(json));
						this.preBuildReports.push(report);
						(extern[id] = extern[id] || []).push(report);
					}
				}
			}
			return this;
		},

		buildReport: function buildReport(report, container, label) {
			container = container || this.content;
			var element = new Element(DIV, { 'class':'report' });
			element.report = report;
			if (container == this.content || container == this.search_content) {
				element.insert(new Element(ICN, { 'class':'remove', title:'Remove'.toLocaleString() }));
				if (report.cells.length) { element.addClassName('used'); }
			}
			element.insert((new Element(LBL)).update(label || report.title.escapeHTML()));
			container.insert(element);
			return this;
		},

		addListeners: function addListeners() {
			this.reportMouseDown = this.reportMouseDown.bindAsEventListener(this);
			this.reportMouseMove = this.reportMouseMove.bindAsEventListener(this);
			this.reportMouseUp   = this.reportMouseUp.bindAsEventListener(this);
			this.element.on('mousedown',  '.edit-layout .report', this.reportMouseDown);
			this.element.on('touchstart', '.edit-layout .report', this.reportMouseDown);
			this.dashboard.pages_div.on('mousedown',  '.edit-layout .reportlet:not(.empty)', this.reportMouseDown);
			this.dashboard.pages_div.on('touchstart', '.edit-layout .reportlet:not(.empty)', this.reportMouseDown);

			this.element.on('click', '.report .remove', this.removeClick = this.removeClick.bindAsEventListener(this));
			this.element.on('click', 'h5,h6',  this.headerClick  = this.headerClick.bindAsEventListener(this));
			this.element.on('om:search',       this.search       = this.search.bindAsEventListener(this));

			this.dashboard.element.on('om:dashboard.Report.titlechange', this.reportTitleChange = this.reportTitleChange.bindAsEventListener(this));
			this.dashboard.element.on('om:dashboard.Cell.reportchange', this.reportChange = this.reportChange.bindAsEventListener(this));
			return this;
		},

		search: function search(e) {
			var input = e.findElement();
			this.searcher = this.searcher || new OM.util.Searcher();
			if (this.searcher.setSearchText(input.value).search_txt) { // start or continue searching
				this.searching = this.searching || {
					extern_was_open: $('dashboard_external_content_header').hasClassName('open'),
					contnt_was_open: $('dashboard_content_header').hasClassName('open')
				};
				this.searching.content_results = [];
				this.searching.extern_results  = [];
				$('dashboard_external_content').hide().insert({ before:$('dashboard_external_content_search').show() });
				$('dashboard_content').hide().insert({ before: $('dashboard_content_search').show() });
				$('dashboard_external_content_header').addClassName('open');
				$('dashboard_content_header').addClassName('open');

				this.match(this.dashboard.bookmarks, this.searching.content_results);
				var ex_reports = this.reports, i, ex_results = this.searching.extern_results;
				for (i in ex_reports) { this.match(ex_reports[i], ex_results); }
				this.buildResults();
			} else if (this.searching) { // stop searching
				$('dashboard_external_content').show().insert({ after:$('dashboard_external_content_search').hide() });
				$('dashboard_content').show().insert({ after: $('dashboard_content_search').hide() });
				$('dashboard_external_content_header')[this.searching.extern_was_open ? 'addClassName' : 'removeClassName']('open');
				$('dashboard_content_header')[this.searching.contnt_was_open ? 'addClassName' : 'removeClassName']('open');
				this.searching = null;
			} // else // not searching, no need to do anything
			return this;
		},

		match: function match(reports, results) {
			var searcher = this.searcher, match,
				i, l = reports.length, r = results.length-1;
			for (i = 0; i < l; ++i) {
				if (!(match = searcher.match(reports[i].title))) { continue; }
				results[++r] = { label:match, report:reports[i] };
			}
			return this;
		},

		buildResults: function buildResults() {
			if (!this.searching || this.dragging) { return this; } // don't update results while dragging
			var results = this.searching.content_results.sort(resultNaturalSort),
				div = $('dashboard_content_search'), r, rr = results.length,
				msg = !rr && 'No Content Found';
			div.update(MT);
			for (r = 0; r < rr; ++r) { this.buildReport(results[r].report, div, results[r].label); }
			if (msg) { div.insert('<div class="loading">'+msg.toLocaleString()+'</div>'); }

			// find next source to load
			var next = this.external.down('[data-source-loaded=0]');

			results = this.searching.extern_results.sort(resultNaturalSort);
			div = $('dashboard_external_content_search'); rr = results.length;
			msg = (next ? 'Searching...' : (!rr && 'No Content Found'));
			div.update(MT);
			for (r = 0; r < rr; ++r) { this.buildReport(results[r].report, div, results[r].label); }
			if (msg) { div.insert('<div class="loading">'+msg.toLocaleString()+'</div>'); }

			if (next) { this.loadSource(next); }
			return this;
		},

		headerClick: function headerClick(e) {
			var header = e.findElement();
			if (header.tagName.toLowerCase() === ICN) { header = header.up(); }
			this.loadSource(header.toggleClassName('open').next())
			return this;
		},

		loadSource: function loadSource(div) {
			if (!div || !div.empty()) { return this; }
			div.loader = new Element(DIV, { 'class':'loading' });
			div.loader.update('Loading'.toLocaleString());
			div.spinner = new Element(ICN, { 'class':'spinner' });
			div.insert(div.loader.insert(div.spinner));
			div.spinner.dots  = 0;
			div.spinner.timer = setInterval(this.updateEllipsis.bind(div), 1000);

			var ids    = div.id.split('_'), id = ids.pop(),
				shared = (ids[1] === 'shared') ? 1 : 0,
				type   = ids.slice(shared+1).join('_');
				params = { shared:shared }; params[type] = id,
				url    = OM.URL.suite('Dashboard.GetContents', params),
				done   = this.sourceLoaded.bind(this, div);
			OM.require('AP:dashboard.Report', function(){
				return new Ajax.Request(url, { method:'GET', onComplete:done });
			});
			return this;
		},

		updateEllipsis: function updateEllipsis() {
			return this.spinner.update('...'.substr(0, (this.spinner.dots = (this.spinner.dots + 1) % 4)));
		},

		sourceLoaded: function sourceLoaded(div, xhr) {
			clearInterval(div.spinner.timer); div.spinner.timer = null;
			var response = xhr.responseJSON || OM.getResponseJSONFromResponseText(xhr.responseText) || { failure:true, success:false },
				reports = response.reports;

			if (!response.success || !reports) {
				div.loader.addClassName('failure')
					.update(response.message || 'Could Not Fetch Content'.toLocaleString());
			} else if (!reports.length) {
				div.loader.addClassName('empty')
					.update(response.message || 'No Content Found'.toLocaleString());
			} else {
				div.loader.remove(); div.loader = null;
				var i, l = reports.sort(resultNaturalSort).length, Report = ns.Report;
				for (i = 0; i < l; ++i) { this.buildReport(reports[i] = new Report(reports[i]), div); }
				this.reports[div.id] = reports;
			}
			div.writeAttribute('data-source-loaded', '1');
			if (this.searching) { this.match(reports || [], this.searching.extern_results).buildResults(); }
			return this;
		},

		reportMouseDown: function reportMouseDown(e) {
			if (this.dragging) {
				if (e.preventDefault) { e.preventDefault(); } // prevent highlighting text while dragging
				return this.reportMouseUp(e);
			}
			if (/^a|i$/i.test(e.findElement().nodeName)) { return this; }
			if (e.findElement().up('.reportlet-settings,.resize,.InlineEdit')) { return this; }
			if (!(this.dragging = e.findElement('.report,.reportlet'))) { return this; }

			var touch = e.changedTouches && e.changedTouches[0],
				x = touch ? touch.pageX : e.pointerX(),
				y = touch ? touch.pageY : e.pointerY(),
				pos = this.dragging.getBoundingClientRect();
			if (!touch && !e.isLeftClick()) { this.dragging = null; return this; }

			if (this.dragging.report) {
				// put proxy in place and start dragging.
				this.proxy.update(this.dragging.innerHTML).show();

				// save the mouse offset from the edge of dragging.
				var fix = this.element.hasClassName('fix') ? document.body.scrollTop : 0,
					off = (this.offset = { x:x-pos.left, y:y-pos.top-fix });
				this.proxy.setStyle({ left:x-off.x+'px', top:y-off.y+'px' });
			} else { /* dragging a cell */
				var off = (this.offset = { x:x-pos.left, y:y-pos.top });
				this.dragging.setStyle({
					width:  this.dragging.measure('width')+'px',
					height: this.dragging.measure('height')+'px',
					left:pos.left+'px', top:pos.top+'px'
				});
				OM.util.disableSelection(this.dragging);
				$(document.body).insert(this.dragging);
			}
			this.dragging.addClassName('dragging');
			this.lastDrag = { x:x, y:y, moved:false };

			$(document.body)
				.observe(touch ? 'touchmove' : 'mousemove', this.reportMouseMove)
				.observe(touch ? 'touchend'  : 'mouseup',   this.reportMouseUp);
			return this;
		},

		reportMouseMove: function reportMouseMove(e) {
			if (!this.dragging) { return this; }
			var touch = e.changedTouches && e.changedTouches[0],
				x = touch ? touch.pageX : e.pointerX(),
				y = touch ? touch.pageY : e.pointerY(),
				off = this.offset;
			if (!this.lastDrag.moved && Math.abs(this.lastDrag.x - x) < 5 && Math.abs(this.lastDrag.y - y) < 5) { return this; }

			if (this.dragging.report) {
				this.proxy.hide().setStyle({ left:x-off.x+'px', top:y-off.y+'px' });
				this.dashboard.hoverReportAt(this.dragging.report, x, y);
				this.proxy.show();
			} else {
				this.dragging.hide().setStyle({ left:x-off.x+'px', top:y-off.y+'px' });
				this.dashboard.hoverReportAt(this.dragging.widget, x, y);
				this.dragging.show();
			}

			var element = $('dashboard_pages'),
				container = $$('.js-endor-content')[0],
				thresh = 40,
				view = { top:element.cumulativeOffset().top,
						 left:element.cumulativeOffset().left,
						 bottom:window.innerHeight,
						 right:window.innerWidth };
			if (y > (view.bottom - thresh)) { element.scrollTop += (y - (view.bottom - thresh)); }
			else if (y < (view.top + thresh)) { element.scrollTop -= ((view.top + thresh) - y); }
			if (x > (view.right - thresh)) { container.scrollLeft += (x - (view.right - thresh)); }
			else if (x < (view.left + thresh)) { container.scrollLeft -= ((view.left + thresh) - x); }

			this.lastDrag.x=x; this.lastDrag.y=y; this.lastDrag.moved=true;
			if (touch && e.preventDefault) { e.preventDefault(); } // prevent scroll action
			return this;
		},

		reportMouseUp: function reportMouseUp(e) {
			if (!this.dragging) { return this; }

			var dragReport = this.dragging.report;

			// The problem we're solving is if a "custom reportlet" has been dragged twice from the content panel
			// into different cells of the dashboard, we don't want the two cells being "linked" to each other.
			// In other words, we don't want a modification of a date period in one of the cells to affect the
			// the other cell.  We do this by cloning the report.  The cloning process is only a shallow copy
			// so we create a new cells array so it's detached from the cells array in the source report.  This
			// cells array is what is updated in updateUse() to "link" multiple cells to the same report.
			if (dragReport && this.preBuildReports.indexOf(dragReport) > -1) {
				dragReport = new OM.dashboard.Report(dragReport);
				dragReport.cells = [];
			}

			var touch = e.changedTouches && e.changedTouches[0],
				x = touch ? touch.pageX : e.pointerX(),
				y = touch ? touch.pageY : e.pointerY(),
				el, to, style;

			if (!this.lastDrag.moved) {
				if (dragReport) {
					this.proxy.hide();
					if (dragReport.cells.length) { Effect.ScrollTo(dragReport.cells[0].element, { duration:.5, offset:-25 }); }
				} else {
					this.dragging.setStyle({ width:null, height:null, left:null, top:null });
					this.dragging.widget.page.content.insert(this.dragging);
				}
				this.dragging.removeClassName('dragging');
				this.dragging = null;
				$(document.body)
					.stopObserving(touch ? 'touchmove' : 'mousemove', this.reportMouseMove)
					.stopObserving(touch ? 'touchend'  : 'mouseup',   this.reportMouseUp);
				return this.buildResults();
			}

			if (dragReport) {
				this.proxy.hide();
				el = this.dashboard.dropReportAt(dragReport, x, y);
				this.proxy.show();
			} else {
				this.dragging.hide();
				el = this.dashboard.dropReportAt(this.dragging.widget, x, y);
				this.dragging.show();
			}

			if (dragReport) {
				if (el) {
					var off = el.positionedOffset(),
						done = el.setStyle.bind(el, { width:null, height:null, left:null, top:null });
					style = {
						left:off.left+'px', width:el.measure('width')+'px',
						top:off.top+'px', height:el.measure('height')+'px' };
					el.clonePosition(this.proxy);
					new Effect.Morph(el, { style:style, afterFinish:done, duration:.5 });
					if (this.dragging.descendantOf(this.external)) {
						this.content.update();
						var reports = this.dashboard.bookmarks, i, l = reports.length;
						reports.sort(resultNaturalSort);
						for (i = 0; i < l; ++i) { this.buildReport(reports[i]); }
						this.content.previous().addClassName('open');
						i = reports.indexOf(dragReport);
						to = this.content.down('.report', i).cumulativeOffset();
					}
				} else { to = this.dragging.cumulativeOffset(); }
			} else {
				if (el) {
					var off   = el.up('.page-content').cumulativeOffset(),
						unset = { width:null, height:null, left:null, top:null },
						done  = el.setStyle.bind(el, unset),
						from  = { width:el.style.width, height:el.style.height,
							left:parseInt(el.style.left)-off.left+'px', top:parseInt(el.style.top)-off.top+'px' };
					el.setStyle(unset);
					style = { width:el.measure('width')+'px', height:el.measure('height')+'px', left:el.measure('left')+'px', top:el.measure('top')+'px' };
					el.setStyle(from);
					new Effect.Morph(el, { style:style, afterFinish:done, duration:.5 });
				} else {
					$(document.body).insert(this.dragging);
					new Effect.DropOut(this.dragging, { duration:.5 });
				}
			}

			var that = this, dragged = this.dragging;
			this.dragging = null;
			function after(){
				dragged.removeClassName('dragging');
				if (dragReport) { that.proxy.hide(); }
				return that.buildResults(); // continue searching
			}

			if (to) {
				var fix = this.element.hasClassName('fix') ? document.body.scrollTop : 0;
				new Effect.Move(this.proxy, { mode:'absolute', x:to.left, y:to.top+fix, duration:.5, afterFinish:after });
			} else { after(); }

			$(document.body)
				.stopObserving(touch ? 'touchmove' : 'mousemove', this.reportMouseMove)
				.stopObserving(touch ? 'touchend'  : 'mouseup',   this.reportMouseUp);
			return this.updateUse();
		},

		removeClick: function removeClick(e) {
			var element = e.findElement().up('.report');
			if (element && element.report) {
				this.dashboard.removeReport(element.report);
				element.remove();
			}
			return this;
		},

		reportChange: function reportChange(e) {
			if (this.dashboard.bookmarks.indexOf(e.memo) !== -1) { return this; }
			this.content.update();
			var reports = this.dashboard.bookmarks;
			reports.push(e.memo);
			reports.sort(resultNaturalSort);
			for (var i=0, l=reports.length; i < l; ++i) { this.buildReport(reports[i]); }
			return this.updateUse();
		},

		reportTitleChange: function reportTitleChange(e) {
			this.content.update();
			var reports = this.dashboard.bookmarks.sort(resultNaturalSort);
			for (var i=0, l=reports.length; i < l; ++i) { this.buildReport(reports[i]); }
			return this;
		}
	});

	/*
	 * Natural Sort algorithm for Javascript - Version 0.5 - Released under MIT license
	 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
	 * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
	 */
	function resultNaturalSort(a, b){
		// setup temp-scope variables for comparison evauluation
		var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|-?[0-9]+)/gi,
			sre = /(^[ ]*|[ ]*$)/g,
			hre = /^0x[0-9a-f]+$/i,
			dre = /(^[0-9\-\.\/]{5,}$)|[0-9]+:[0-9]+|( [0-9]{4})/i,
			ore = /^0/,
			// convert all to strings and trim()
			x = String((a.report || a).title).toLowerCase().replace(sre, MT) || MT,
			y = String((b.report || b).title).toLowerCase().replace(sre, MT) || MT,
			// chunk/tokenize
			xN = x.replace(re, '\0$1\0').replace(/\0$/,MT).replace(/^\0/,MT).split('\0'),
			yN = y.replace(re, '\0$1\0').replace(/\0$/,MT).replace(/^\0/,MT).split('\0'),
			// numeric, hex or date detection
			xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && (new Date(x)).getTime()),
			yD = parseInt(y.match(hre)) || xD && (new Date(y)).getTime() || null;
		// natural sorting of hex or dates - prevent '1.2.3' valid date
		if (yD)
			if ( xD < yD ) return -1;
			else if ( xD > yD )	return 1;
		// natural sorting through split numeric strings and default strings
		for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
			// find floats not starting with '0', string or 0 if not defined (Clint Priest)
			oFxNcL = !(xN[cLoc] || MT).match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
			oFyNcL = !(yN[cLoc] || MT).match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
			// handle numeric vs string comparison - number < string - (Kyle Adams)
			if (isNaN(oFxNcL) !== isNaN(oFyNcL)) return (isNaN(oFxNcL)) ? 1 : -1; 
			// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
			else if (typeof oFxNcL !== typeof oFyNcL) {
				oFxNcL += MT; 
				oFyNcL += MT; 
			}
			if (oFxNcL < oFyNcL) return -1;
			if (oFxNcL > oFyNcL) return 1;
		}
		return 0;
	}

	OM.Requirement.met('AP:dashboard.Content');
})();

