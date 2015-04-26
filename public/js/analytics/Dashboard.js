(function(undefined){

	var ns = (OM.dashboard = OM.dashboard || {}), MT = '', MAX_PAGES = 30;

	function snake(str) { return str.replace(/[A-Z]/g, function(a){ return '_'+a.toLowerCase(); }); }

	ns.Dashboard = Class.create({
		id:        0,
		folder_id: 0,

		owner: MT,
		is_owner: false,
		shared: false,
		last_updated: MT,

		title:    MT,
		subtitle: MT,
		custom_subtitle: false,
		page_style: 'LETTER_LANDSCAPE',

		pages:     null,
		bookmarks: null,

		history: null,

		hovered: null,

		initialize: function initialize(o) {
			o = o || {};
			var a = $A(o.base64), i, k, l = a.length;
			for (i = 0; i < l; ++i) { o[a[i]] = Base64.decode(o[a[i]]); }
			for (i in o) { if ((k=snake(i)) in this) { this[k] = o[i]; } } // set all existing properties

			if (!this.pages)      { this.pages      = []; }
			if (!this.bookmarks)  { this.bookmarks  = []; }
			if (!this.page_style) { this.page_style = (/en|es|pt/i.test(OM.Config.locale)?'LETTER':'A4')+'_LANDSCAPE'; }
			if (!this.custom_subtitle) { this.subtitle = 'Created:'.toLocaleString()+' <date>'; }

			this.history = { undo:[], redo:[], saving:null };

			return this.build().addListeners();
		},

		build: function build() {
			this.element  = $('dashboard');
			this.pages_div = $('dashboard_pages');
			this.element.widget = this;

			OM.util.disableSelection(this.element);
			OM.require('AP:dashboard.Page', this.buildPages.bind(this));
			OM.require('AP:dashboard.Content', this.buildContent.bind(this));
			return this.loadingAll();
		},

		addListeners: function addListeners() {
			this.element.on('om:dashboard.Cell.panelLoaded', this.panelLoaded = this.panelLoaded.bindAsEventListener(this));
			this.update = this.update.bind(this);
			this.element.on('om:dashboard.ReportSettings.save', this.update);
			this.element.on('om:dashboard.Cell.reportchange',  this.update);
			this.element.on('om:dashboard.historychange',       this.update);
			this.saveComplete = this.saveComplete.bind(this);
			return this;
		},

		buildPages: function buildPages() {
			var pages = this.pages, i, j, l = pages.length,
				div = this.pages_div, Page = ns.Page;
			for (i = 0; i < l; ++i) {
				div.insert((pages[i] = new Page(pages[i], this)).element);
				for( j = 0; j < pages[i].cells.length; j++ ) {
					pages[i].cells[j].element.fire('dashboard:reportletAddedToDom', pages[i].cells[j].report);
				}
			}

			this.element.fire('dashboard:pagesAddedToDom');
			if (!l) { this.addPage(); }
			return this;
		},

		buildContent: function buildContent() {
			this.content = new ns.Content(this);
			return this;
		},

		addPage: function addPage(page, i) {
			if (this.pages.length >= MAX_PAGES) { return this; }
			if (i === undefined) { i = this.pages.length; }
			page = page || new ns.Page({ page_style:this.page_style }, this);
			this.pages.splice(i, 0, page);
			if (i === this.pages.length-1) { this.pages_div.insert(page.element); }
			else { this.pages_div.insertBefore(page.element, this.pages[i+1].element); }
			this.updateEditLayout();
			if (!OM.Config.undoing) {
				if (this.pages.length > 1) { Effect.ScrollTo(page.element, { duration:.5, offset:-25 }); }
				this.history.redo.length = 0;
				this.history.undo.push({ undo:this.removePage.bind(this, i), redo:this.addPage.bind(this, page, i) });
				this.element.fire('om:dashboard.historychange');
			}
			this.element.fire('om:dashboard.pagechange');
			return this;
		},

		removePage: function removePage(i) {
			var page = this.pages[i];
			page.element.remove();
			this.pages.splice(i, 1);
			if (!OM.Config.undoing) {
				this.history.redo.length = 0;
				this.history.undo.push({ undo:this.addPage.bind(this, page, i), redo:this.removePage.bind(this, i) });
				this.element.fire('om:dashboard.historychange');
			}
			this.element.fire('om:dashboard.pagechange');
			return this;
		},

		removeReport: function removeReport(report) {
			var pages = this.pages, p, pp = pages.length, page, cells, c, cc, cell;
			for (p = 0; p < pp; ++p) {
				page = pages[p]; cells = page.cells; cc = cells.length;
				for (c = 0; c < cc; ++c) {
					cell = cells[c];
					if (cell.report === report) { page.removeCell(cell); }
				}
			}
			this.bookmarks = this.bookmarks.without(report);
			if (!OM.Config.undoing) {
				this.history.redo.length = 0;
				this.history.undo.push({ undo:null, redo:null }); // TODO: undo
				this.element.fire('om:dashboard.historychange');
			}
			this.element.fire('om:dashboard.reportschange');
			return this;
		},

		setPaper: function setPaper(style) {
			if (style === this.page_style) { return this; }
			var old_style = this.page_style;
			this.page_style = style;
			var pages = this.pages, i, l = pages.length;
			for (i = 0; i < l; ++i) {
				pages[i].setPaper(style);
			}
			if (!OM.Config.undoing) {
				this.history.redo.length = 0;
				this.history.undo.push({ undo:this.setPaper.bind(this, old_style), redo:this.setPaper.bind(this, style) });
				this.element.fire('om:dashboard.historychange');
			}
			return this;
		},

		updateShowPaper: function updateShowPaper() {
			var pages = this.pages, i, l = pages.length;
			for (i = 0; i < l; ++i) { pages[i].updateShowPaper(i, l); }
			return this;
		},

		updateEditLayout: function updateEditLayout() {
			var pages = this.pages, i, l = pages.length;
			for (i = 0; i < l; ++i) { pages[i].updateEditLayout(); }
			return this;
		},

		closeEditLayout: function closeEditLayout() {
			var pages = this.pages, i, l = pages.length;
			for (i = 0; i < l; ++i) { pages[i].closeEditLayout(); }
			return this;
		},

		refresh: function refresh(hard) {
			var pages = this.pages, p, pp, cells, c, cc;
			for (p=0, pp=pages.length; p < pp; ++p) {
				cells = pages[p].cells;
				for (c=0, cc=cells.length; c < cc; ++c) {
					cells[c].refresh(hard);
				}
			}
			return this.update();
		},

		setReportSuite: function setReportSuite(rs, override) {
			if (this.updating) { return this; }
			var pages = this.pages, p, pp, cells, c, cc,
				report, opts = { rs:rs };
			for (p=0, pp=pages.length; p < pp; ++p) {
				cells = pages[p].cells;
				for (c=0, cc=cells.length; c < cc; ++c) {
					report = cells[c].report;
					if (report.canHaveRS() && (report.is_variable || override)) {
						report.set(opts);
						cells[c].update().refresh();
					}
				}
			}
			return this.update();
		},

		setSegment: function setSegment(id, name) {
			if (this.updating) { return this; }
			var pages = this.pages, p, pp, cells, c, cc,
				report, opts = { ob_segment_id:id, segment_name:name };
			for (p=0, pp=pages.length; p < pp; ++p) {
				cells = pages[p].cells;
				for (c=0, cc=cells.length; c < cc; ++c) {
					report = cells[c].report;
					if (report.canHaveRS()) {
						report.set(opts);
						cells[c].update().refresh();
					}
				}
			}
			return this.update();
		},

		setDate: function setDate(params, cells) {
			if (!cells) { return this; }
			for (var c=0, cc=cells.length; c < cc; ++c) {
				cells[c].report.set(params);
				cells[c].update().refresh();
			}
			return this.update();
		},

		update: function update(e) {
			if (this.unloading) { return this; }
			var suites = {}, segments = {}, dates = {}, keys,
				pages = this.pages, p, pp, cells, c, cc, report;
			for (p=0, pp=pages.length; p < pp; ++p) {
				cells = pages[p].cells;
				for (c=0, cc=cells.length; c < cc; ++c) {
					report = cells[c].report;
					if (report.canHaveRS() && report.is_variable) { suites[report.rs.id] = report.rs.title; }
					if (report.canHaveRS()) { segments[report.ob_segment_id] = report.segment_name; }
					if (report.canHaveDate()) { dates[report.period_from+report.period_to] = report; }
				}
			}

			var reportSuiteSelector = jQuery('#rs_selector').data('reportSuiteSelector');
			if ((keys=$H(suites).keys()).length === 1) {
				reportSuiteSelector.setAlternateText(suites[keys[0]], keys[0]);
			} else if (keys.length > 1) {
				reportSuiteSelector.setAlternateText('Multiple Report Suites'.toLocaleString(), '');
			}

			var cal_select = $('action_bar').down('.select');
			var keys = $H(dates).keys();
			if (keys.length === 1) {
				page_controller.updateRangeModel(dates[keys[0]]);
			} else if (keys.length > 1) {
				cal_select.update('Multiple Periods'.toLocaleString());
			}

			return this;
		},

		getUniqueCalendars: function() {
			var calendars = {}, cal, hash,
				pages = this.pages, p, pp,
				cells, c, cc, report;
			for (p=0, pp=pages.length; p < pp; ++p) {
				cells = pages[p].cells;
				for (c=0, cc=cells.length; c < cc; ++c) {
					report = cells[c].report;
					if (!report.canHaveDate()) { continue; }
					cal = report.rs.calendar; hash = cal.hash;
					if (!(hash in calendars)) {
						calendars[hash] = Object.clone(cal);
						calendars[hash].cells = [];
					}
					calendars[hash].cells.push(cells[c]);
				}
			}
			var types = [ 'Gregorian', 'NRF', 'QRS', '4-5-4', '4-4-5', 'Modified Gregorian' ],
				multi = '%d reportlets'.toLocaleString(), single = '1 reportlet'.toLocaleString(),
				uniqs = [], i = -1, c, text;
			for (hash in calendars) {
				c = calendars[hash];
				text = types[c.type].toLocaleString()+' '+c.timezone_abbrev+
					' ('+(c.cells.length===1 ? single : multi.replace(/%d/g, c.cells.length))+')';
				uniqs[++i] = { value:String(i), text:text, calendar:c };
			}
			return uniqs;
		},

		panelLoaded: function panelLoaded(e) {
			this.element.removeClassName('dashboard-loading');
			return this.update();
		},
		loadingAll: function loadingAll() { this.element.addClassName('dashboard-loading'); return this; },

		hoverReportAt: function hoverReportAt(report, x, y) {
			var off = /ipad|iphone|ipod/i.test(navigator.userAgent) ? { left:0, top:0 } : document.viewport.getScrollOffsets(),
				reportlet = $(document.elementFromPoint(x-off.left, y-off.top));
			if (reportlet && !$(reportlet).match('.reportlet')) { reportlet = reportlet.up('.reportlet'); }
			if (reportlet != this.hovered) {
				if (this.hovered) {
					this.hovered.removeClassName('hovered');
					if (!this.hovered.widget) {
						var grid = this.hovered.up('.page').widget.layout.page_grid.grid,
							c, cc = grid[0].length, r, rr = grid.length;
						for (r = 0; r < rr; ++r) { for (c = 0; c < cc; ++c) {
							grid[r][c].removeClassName('hovered');
						} }
					}
				}
				if (reportlet)    {
					if (!reportlet.widget && report instanceof ns.Cell && (report.colspan > 1 || report.rowspan > 1)) {
						var page = reportlet.up('.page').widget,
							c = +reportlet.className.match(/\bcol-(\d)\b/i)[1],
							r = +reportlet.className.match(/\brow-(\d)\b/i)[1];
						if (page && page.canPlaceAt(c, r, report.colspan, report.rowspan, report)) {
							var cc = c+report.colspan, rr = r+report.rowspan, grid = page.layout.page_grid.grid, s = c;
							for (; r < rr; ++r) { for (c = s; c < cc; ++c) {
								grid[r][c].addClassName('hovered');
							} }
						}
					}
					reportlet.addClassName('hovered');
				}
			}
			return this.hovered = reportlet;
		},

		dropReportAt: function dropReportAt(report, x, y) {
			if (!OM.Config.undoing) { this.history.redo.length = 0; }
			var cellat = this.hoverReportAt(report, x, y);
			if (!cellat) {
				if (report instanceof ns.Cell) {
					report.page.removeCell(report);
					if (!OM.Config.undoing) {
						this.history.undo.push({ undo:report.page.addCell.bind(report.page, report), redo:report.page.removeCell.bind(report.page, report) });
						this.element.fire('om:dashboard.historychange');
					}
				}
				return false;
			}

			this.hovered.removeClassName('hovered');
			if (!this.hovered.widget) {
				var grid = this.hovered.up('.page').widget.layout.page_grid.grid,
					c, cc = grid[0].length, r, rr = grid.length;
				for (r = 0; r < rr; ++r) { for (c = 0; c < cc; ++c) {
					grid[r][c].removeClassName('hovered');
				} }
			}
			this.hovered = null;
			var pages = this.pages, p, pp = pages.length;
			for (p = 0; p < pp; ++p) { pages[p].cells_grid = null; }

			var col = +cellat.className.match(/\bcol-(\d)\b/i)[1],
				row = +cellat.className.match(/\brow-(\d)\b/i)[1],
				page = cellat.up('.page').widget, dcell;
			if (report instanceof ns.Cell) {
				dcell  = report;
				report = dcell.report;
				if (cellat.widget) { cellat.widget.page.removeCell(cellat.widget); }
				var fits = !cellat.widget && page.canPlaceAt(col, row, dcell.colspan, dcell.rowspan, dcell);
				dcell.column = col; dcell.row = row;
				dcell.colspan = cellat.widget ? cellat.widget.colspan : (fits ? dcell.colspan : 1),
				dcell.rowspan = cellat.widget ? cellat.widget.rowspan : (fits ? dcell.rowspan : 1);
				if (dcell.page !== page) {
					dcell.page.removeCell(dcell);
					(dcell.page = page).addCell(dcell);
				} else { page.updateCellsEditLayout().content.insert(dcell.element); }
				dcell.updatePosition();
				if (!OM.Config.undoing) { this.history.undo.push({ undo:page.removeCell.bind(page, dcell), redo:page.addCell.bind(page, dcell) }); }
			} else {
				var add_report = this.bookmarks.indexOf(report) < 0;
				if (add_report) { this.bookmarks.push(report); }
				if (!cellat.widget) {
					dcell = new ns.Cell({ report:report, column:col, row:row }, page);
					page.addCell(dcell);
					dcell.refresh();
					if (!OM.Config.undoing) { this.history.undo.push({ undo:page.removeCell.bind(page, dcell), redo:page.addCell.bind(page, dcell) }); }
				} else {
					dcell = cellat.widget;
					if (!OM.Config.undoing) { this.history.undo.push({ undo:dcell.changeReport.bind(dcell, dcell.report), redo:dcell.changeReport.bind(dcell, report) }); }
					dcell.changeReport(report);
				}
				if (report.isCustom() && !report.id && !report.dirty) { dcell.settingsClick(); }
			}
			this.element.fire('om:dashboard.historychange');
			return dcell.element;
		},

		undo: function undo() {
			if (!this.history.undo.length) { return this; }
			var action = this.history.undo.pop();
			OM.Config.undoing = true;
			action.undo();
			OM.Config.undoing = false;
			this.history.redo.push(action);
			this.element.fire('om:dashboard.historychange');
			return this;
		},

		redo: function redo() {
			if (!this.history.redo.length) { return this; }
			var action = this.history.redo.pop();
			OM.Config.undoing = true;
			action.redo();
			OM.Config.undoing = false;
			this.history.undo.push(action);
			this.element.fire('om:dashboard.historychange');
			return this;
		},

		revert: function revert() {
			var undo = this.history.undo, redo = this.history.redo,
				i = undo.length, action;
			OM.Config.undoing = true;
			while (--i >= 0) {
				(action = undo.pop()).undo();
				redo.push(action);
			}
			OM.Config.undoing = false;
			this.element.fire('om:dashboard.historychange');
			return this;
		},

		isEmpty: function isEmpty() {
			var pages = this.pages, p, pp = pages.length;
			for (p = 0; p < pp; ++p) { if (pages[p].cells.length) { return false; } }
			return true;
		},

		isDirty: function isDirty() {
			if (this.history.undo.length) { return true; }
			var reports = this.bookmarks, r, rr = reports.length;
			for (r = 0; r < rr; ++r) {
				if (reports[r].dirty || (!reports[r].id && OM.Config.real_oid === 198) || reports[r].id < 0) { return true; }
			}
			return false;
		},

		save: function save(as) {
			this.history.saving = new Ajax.Request(OM.URL.suite('Dashboard.Save'), {
				parameters:{ dashboard:Object.toJSON(this), as:as, oid:OM.Config.real_oid }, method:'post',
				onComplete:this.saveComplete
			});
			return this;
		},

		saveComplete: function saveComplete(xhr) {
			this.history.saving = null;
			var response = xhr.responseJSON || OM.getResponseJSONFromResponseText(xhr.responseText) || { failure:true },
				dashboard = response.dashboard, msg = response.message, msg_type = 'success';
			if (!response.success || !dashboard) {
				msg_type = 'failure';
				msg = response.message || 'Could Not Save Your Changes'.toLocaleString();
			} else {
				var prev_id = this.id, prev_title = this.title,
					a = $A(dashboard.base64), i, l = a.length;
				for (i = 0; i < l; ++i) { dashboard[a[i]] = Base64.decode(dashboard[a[i]]); }
				this.id = dashboard.id; this.folder_id = dashboard.folderId;
				this.owner = dashboard.owner; this.is_owner = dashboard.isOwner;
				this.shared = dashboard.shared;
				this.last_updated = dashboard.lastUpdated;
				this.title = dashboard.title;
				var reports = this.bookmarks; a = dashboard.bookmarks; l = a.length;
				for (i = 0; i < l; ++i) { reports[i].reset(a[i]); }
				if (this.content) { this.content.updateUse(); }

				// update URLs for reportlets.
				var pages = this.pages, p, pp = pages.length, cells, c, cc;
				for (p = 0; p < pp; ++p) {
					cells = pages[p].cells; cc = cells.length;
					for (c = 0; c < cc; ++c) { cells[c].update(); }
				}

				OM.Config.report_state.oid = (OM.Config.real_oid = 198);
				this.history.undo.length = 0;
				this.history.redo.length = 0;
				this.element.fire('om:dashboard.historychange');
				this.element.fire('om:dashboard.saved', { id:this.id, prev_id:prev_id, prev_title:prev_title });
			}
			page_controller.addMessage(msg, msg_type);
			return this;
		},

		toJSON: function toJSON() {
			var json = {}, i, ignore = { element:1, pages_div:1, history:1, content:1, hovered:1, updating:1 };
			for (i in this) { if (!ignore[i] && !Object.isFunction(this[i])) { json[i] = this[i]; } }
			return json;
		},

		getJSON: function getJSON() { return Object.toJSON(this); }, // needed for IE 8 printing

		render: Prototype.emptyFunction
	});

	OM.Requirement.met('AP:dashboard.Dashboard');
})();
