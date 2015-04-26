(function(undefined){

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', DIV = 'div', H4 = 'h4', A = 'a', ICN = 'i', PRE = 'pre',
		SHOW = 'show', HIDE = 'hide', TXT = 'textarea';

	ns.Cell = Class.create({
		column:  0,
		row:     0,
		colspan: 1,
		rowspan: 1,

		note:    MT,
		maxRows: -1,
		graph:   true,
		summary: true,
		table:   true,

		report:  null,
		panel:   null,
		hide:    null,

		v: 0, // used to prevent old panels from rendering
		resize: null,
		history: null,

		initialize: function initialize(o, page) {
			o = o || {};
			var a = $A(o.base64), i, k, l = a.length;
			for (i = 0; i < l; ++i) { o[a[i]] = Base64.decode(o[a[i]]); }
			for (i in o) { if (i in this) { this[i] = o[i]; } } // set all existing properties
			if (this.note) { this.note = this.note.unescapeHTML(); } // notes are stored escaped

			this.page = page;
			this.history = [];
			this.hide = this.hide || [];

			return this.build().addListeners();
		},

		build: function build() {
			var cls = 'reportlet col-'+this.column+' row-'+this.row+' cspan-'+this.colspan+' rspan-'+this.rowspan;
			this.element = new Element(DIV, { 'class':cls });
			this.element.widget = this;
			var els = (this.elements = {
				header:   new Element(DIV, { 'class':'reportlet-header' }),

				title_ct: new Element(DIV, { 'class':'reportlet-title' }),
				conf_icn: new Element(ICN, { 'class':'conf-icon',   title:'Change Settings'.toLocaleString() }),
				back_btn: new Element(A,   { 'class':'back',        style:'display:none' }),
				title:    new Element(H4,  { 'class':'title' }),
				note_icn: new Element(ICN, { 'class':'note-icon' }),
				note_bbl: new Element(DIV, { 'class':'note-bubble', style:'display:none' }),
				note_pre: new Element(PRE),
				note_txt: new Element(TXT, { 'class':'note' }),

				warning:  new Element(ICN, { 'class':'reportlet-warning', style:'display:none' }),

				rs_seg:   new Element(DIV, { 'class':'reportlet-rs' }),

				date:     new Element(DIV, { 'class':'reportlet-date' }),

				viewport: new Element(DIV, { 'class':'reportlet-viewport' }),
				panels:   new Element(DIV, { 'class':'panels' }),
				panel:    new Element(DIV, { 'class':'panel' }),
				loading:  new Element(DIV, { 'class':'loading' }).hide()
			});

			els.title_ct.insert(els.conf_icn).insert(els.back_btn).insert(els.title).insert(els.note_icn);
			els.header.insert(els.title_ct).insert(els.warning).insert(els.rs_seg).insert(els.date);
			els.viewport.insert(els.panels.insert(els.panel)).insert(els.loading);
			els.note_bbl.insert(els.note_txt).insert(els.note_pre);
			this.element.insert(els.header).insert(els.viewport).insert(els.note_bbl);

			return this.update();
		},

		addListeners: function addListeners() {
			var el = this.element, els = this.elements;
			els.note_icn.on('click', this.noteClick = this.noteClick.bindAsEventListener(this));
			els.note_icn.on('mouseover', this.noteOver = this.noteOver.bindAsEventListener(this));
			els.note_icn.on('mouseout', this.noteOut = this.noteOut.bindAsEventListener(this));
			els.note_txt.on('keypress', this.noteKeyPress = this.noteKeyPress.bindAsEventListener(this));
			els.back_btn.on('click', this.backClick = this.backClick.bindAsEventListener(this));
			els.title.on('click', 'a', this.titleClick = this.titleClick.bindAsEventListener(this));
			els.conf_icn.on('click', this.settingsClick = this.settingsClick.bindAsEventListener(this));
			if (this.report.title.escapeHTML() != 'Influential Posts') {  //TODO:  Remove temporary hack once switcher is straightened out.
				els.rs_seg.on('click', 'a', this.segmentClick = this.segmentClick.bindAsEventListener(this));
			}
			els.date.on('click', 'a', this.dateClick = this.dateClick.bindAsEventListener(this));
			els.viewport.on('click', '.panels .panel [href]', this.linkClick = this.linkClick.bindAsEventListener(this));
			els.viewport.on('contextmenu', '.panels .panel [href]', this.linkClick);
			this.page.dashboard.element.on('om:dashboard.ReportSettings.save', this.settingsUpdated = this.settingsUpdated.bindAsEventListener(this));
			this.element.on('om:dashboard.ReportSettings.cancel', this.settingsCanceled = this.settingsCanceled.bindAsEventListener(this));
			this.page.dashboard.element.on('om:dashboard.Report.titlechange', this.displayUpdated = this.displayUpdated.bindAsEventListener(this));
			el.on('click', '.resize i', this.resizeClick = this.resizeClick.bindAsEventListener(this));
			el.on('OWL:change', '.InlineEdit', this.titleChange = this.titleChange.bindAsEventListener(this));

			this.panelLoaded   = this.panelLoaded.bind(this);
			this.showSegSelect = this.showSegSelect.bind(this);
			this.showSettings  = this.showSettings.bind(this);
			return this;
		},

		update: function update() {
			var els = this.elements, report = this.report, name, url, title = report.title.escapeHTML();

			if (this.history.length) { els.back_btn.show(); } else { els.back_btn.hide(); }

			if (url = report.getReportURL()) {
				title = '<a title="'+'View Full Report'.toLocaleString()+'" href="'+url+'">'+title+'</a>';
			} els.title.update(title);
			if (els.title_edit) { els.title_edit.setText(report.title); }

			if (report.canHaveRS() && (report.title != "Influential Posts")) {
				name = report.rs.title.escapeHTML();
				if (String(report.ob_segment_id) !== '0' && report.segment_name) { name += ' &ndash; '+report.segment_name.escapeHTML(); }
				els.rs_seg.update('<a>'+name+'</a>').show();
			} else { els.rs_seg.hide(); }

			if (report.canHaveDate()) { els.date.update('<a>'+report.period_label.escapeHTML()+'</a>'); }
			return this;
		},

		updatePosition: function updatePosition(o) {
			if (o) {
				for (var i in o) { this[i] = o[i]; }
				this.page.updateCellsEditLayout();
			}
			this.element.className = 'reportlet col-'+this.column+' row-'+this.row+' cspan-'+this.colspan+' rspan-'+this.rowspan;
			return this.refresh();
		},

		buildEditLayout: function buildEditLayout() {
			if (this.resize) { return this; }
			var i = '<i></i>', resize = (this.resize = {
				resize: new Element(DIV, { 'class':'resize' }),
				top_up: new Element(A, { 'class':'top up' }).update(i).hide(),
				top_dn: new Element(A, { 'class':'top dn' }).update(i).hide(),
				rgt_rt: new Element(A, { 'class':'rgt rt' }).update(i).hide(),
				rgt_lt: new Element(A, { 'class':'rgt lt' }).update(i).hide(),
				btm_up: new Element(A, { 'class':'btm up' }).update(i).hide(),
				btm_dn: new Element(A, { 'class':'btm dn' }).update(i).hide(),
				lft_rt: new Element(A, { 'class':'lft rt' }).update(i).hide(),
				lft_lt: new Element(A, { 'class':'lft lt' }).update(i).hide()
			});
			for (i in resize) { if (i !== 'resize') { resize.resize.insert(resize[i]); } }
			this.element.insert(resize.resize);
			OM.require('InlineEdit', (function(){
				this.elements.title_edit = new OM.InlineEdit({ text:this.report.title, maxLength:50, emptyText:'[Report Title]'.toLocaleString() });
				this.elements.title_edit.paddingRight = this.elements.title_edit.element.down('span').measure('padding-right');
				this.elements.title.insert({ after:this.elements.title_edit.element });
			}).bind(this));
			return this;
		},

		updateEditLayout: function updateEditLayout(grid, rows, cols) {
			this.buildEditLayout();
			var c = this.column, r = this.row,
				cs = this.colspan, rs = this.rowspan,
				cc = c+cs, rr = r+rs, resize = this.resize, cani, i, k;

			k = r-1; cani = k>=0;
			for (i=c; i<cc && cani; ++i) { cani = !grid[k][i]; }
			resize.top_up[cani?SHOW:HIDE]();
			resize.top_dn[rs>1?SHOW:HIDE]();

			k = cc; cani = k<(+this.page.grid.split('x')[0]);
			for (i=r; i<rr && cani; ++i) { cani = !grid[i][k]; }
			resize.rgt_rt[cani?SHOW:HIDE]();
			resize.rgt_lt[cs>1?SHOW:HIDE]();

			k = rr; cani = k<grid.length;
			for (i=c; i<cc && cani; ++i) { cani = !grid[k][i]; }
			resize.btm_dn[cani?SHOW:HIDE]();
			resize.btm_up[rs>1?SHOW:HIDE]();

			k = c-1; cani = k>=0;
			for (i=r; i<rr && cani; ++i) { cani = !grid[i][k]; }
			resize.lft_lt[cani?SHOW:HIDE]();
			resize.lft_rt[cs>1?SHOW:HIDE]();

			var els = this.elements;
			if (els.title_edit) {
				els.title_edit.maxWidth = els.title_ct.measure('width') -
					els.note_icn.measure('margin-box-width') - els.conf_icn.measure('width');
			}

			return this;
		},

		closeEditLayout: function closeEditLayout() {
			if (this.elements.settings && this.elements.settings.open) { this.elements.settings.hide(); }
			if (this.elements.segSelect && this.elements.segSelect.open) { this.elements.segSelect.hide(); }
			return this;
		},

		updateNote: function updateNote(i) {
			if (i && this.note) {
				this.elements.note_icn.update(i).addClassName('has-note').title = 'Edit Note'.toLocaleString();
				this.setNote(this.note, true);
			} else {
				this.setNote(MT, true);
				this.elements.note_icn.update().removeClassName('has-note').title = 'Add Note'.toLocaleString();
			}
			return this;
		},

		setNote: function setNote(note, skipUpdate) {
			this.note = note;
			this.elements.note_txt.value = note;
			this.elements.note_pre.update(note.escapeHTML());
			if (!skipUpdate) { this.page.updateCellNotes(); }
			return this;
		},

		noteOver: function noteOver(e) {
			return (this.elements.note_bbl.visible() || $(document.body).hasClassName('show-paper')) ?
				this : this.showNoteBubble();
		},

		noteOut: function noteOut(e) {
			return (!this.elements.note_bbl.hasClassName('editing')) ? this.hideNoteBubble() : this;
		},

		noteClick: function noteClick(e) {
			if (e.findElement('.note-bubble') == this.elements.note_bbl) { return this; }
			return ($(document.body).hasClassName('show-paper') || e.findElement() != this.elements.note_icn) ?
				this.hideNoteBubble() : this.showNoteBubble(true);
		},

		noteKeyPress: function noteKeyPress(e) {
			if (e.keyCode === Event.KEY_RETURN && !e.shiftKey) {
				this.hideNoteBubble();
				if (e.preventDefault) { e.preventDefault() } else { e.returnValue = false; }
			}
			return this;
		},

		showNoteBubble: function showNoteBubble(edit) {
			if (!this.note && !edit) { return this; }
			var bbl = this.elements.note_bbl, txt = this.elements.note_txt;
			$(document.body).insert(bbl
				.addClassName(this.page.page_style.toLowerCase().replace('_', ' '))
				.addClassName('grid-'+this.page.grid));
			bbl.clonePosition(this.elements.note_icn, { setWidth:false, setHeight:false }).show();
			if (edit) {
				bbl.addClassName('editing');
				if (!this.note) { txt.value = 'Type your note here'.toLocaleString(); }
				txt.focus(); txt.select();
			} else { bbl.removeClassName('editing'); }
			$(document.body).stopObserving('click', this.noteClick);
			$(document.body).observe('click', this.noteClick);
			return this;
		},

		hideNoteBubble: function hideNoteBubble() {
			var bbl = this.elements.note_bbl, txt = this.elements.note_txt, old = this.note,
				val = txt.value === 'Type your note here'.toLocaleString() ? MT : txt.value;
			if (bbl.hasClassName('editing') && val !== old) {
				this.setNote(val);
				if (!OM.Config.undoing) {
					this.page.dashboard.history.redo.length = 0;
					this.page.dashboard.history.undo.push({ undo:this.setNote.bind(this, old), redo:this.setNote.bind(this, val) });
					this.element.fire('om:dashboard.historychange');
				}
			}
			bbl.className = 'note-bubble';
			this.element.insert(bbl.hide());
			$(document.body).stopObserving('click', this.noteClick);
			return this;
		},

		titleClick: function titleClick(e) {
			if ($(document.body).hasClassName('show-paper') || $(document.body).hasClassName('edit-layout')) {
				if (e.preventDefault) { e.preventDefault() } else { e.returnValue = false; }
				return this;
			}

			// this.trackEvents('event48', 'View Full Report');
			if (e.ctrlKey || e.metaKey || e.shiftKey) { return this; } // don't redirect if opened in a new window

			if (e.preventDefault) { e.preventDefault() } else { e.returnValue = false; }
			var href = e.findElement().href;
			setTimeout(function() { location.href = href; }, 200);
			return this;
		},

		linkClick: function linkClick(e) {
			var a = e.findElement(), report, preventDefault = false;

			// Some reports have links to other reports.  For example, the geo and pages reports.  Normally, these
			// would navigate the user to the report, but when the user is in a dashboard, we're doing some finagling
			// in order to only change the dashboard cell rather than navigating the full window to the new url.

			// I didn't write the original code so my comments are interpretations based on my understanding. -- Aaron Hardy

			// If print preview is showing (user clicked More Actions > Print Preview) we don't want the link to do
			// anything at all.
			if ($(document.body).hasClassName('show-paper')) {
				preventDefault = true;
			// If the anchor tag already has a related report object that was previously parsed and stored.
			// See the next conditional for when/how this is performed.  I believe the storage and retrieval are
			// done for caching/optimization purposes.
			} else if (report = a.retrieve('om:dashboard.Report')) {
			} else if (report = ns.Report.fromHashBang(a.href)) {
				a.store('om:dashboard.Report', report);
			}

			if (report) {
				report.set(this.report.getKeepVars());
				a.href = report.getReportURL();
				// If any of these combos are used then we want the link to perform its usual function.
				// Otherwise, we prevent the usual linking and load the target report into the cell.
				if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.isRightClick()) {
					preventDefault = true;
					this.element.fire('om:dashboard.Cell.drillinto', this);
				}
			}

			if (preventDefault) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
			}

			return (report && preventDefault) ? this.changeReport(report, 'forward') : this;
		},

		backClick: function backClick(e) {
			if (!this.history.length) { return this; }
			var past = this.history.pop();
			past.report.set(this.report.getKeepVars());
			return this.changeReport(past.report, 'back');
		},

		showLoading: function showLoading() { this.elements.loading.show(); return this; },
		hideLoading: function hideLoading() { this.elements.loading.hide(); return this; },

		changeReport: function changeReport(report, direction) {
			if (direction === 'forward') { this.history.push({ report:this.report }); }
			else if (!direction) { this.history.length = 0; } // if swapped out report, no going back.
			this.report = report;
			if (!direction) { this.elements.panel.update(); }
			this.element.fire('om:dashboard.Cell.reportchange', report);
			return this.update().refresh(false, direction);
		},

		refresh: function refresh(hard, direction) {
			this.showLoading();
			var rs_seg = this.elements.rs_seg.select('a')[0];
			if (rs_seg) { rs_seg.setStyle({'pointer-events':'none'}); } // disable segment selector link until reportlet loads
			this.elements.warning.hide()
			var type = 'Panel';
			OM.require('AP:dashboard.'+type, this.panelAvail.bind(this, type, hard, direction, ++this.v));
			return this;
		},

		panelAvail: function panelAvail(type, hard, direction, v) {
			if (v !== this.v) { return this; }
			this.panel = new ns[type](this);
			this.panel.v = v;
			this.panel.direction = direction;
			this.panel.load(this.panelLoaded, hard);
			return this;
		},

		panelLoaded: function panelLoaded(panel, response, time) {
			if (panel.v !== this.v) { return this; }
			this.hideLoading();
			var rs_seg = this.elements.rs_seg.select('a')[0];
			if (rs_seg) { rs_seg.setStyle({'pointer-events':'auto'}); } // enable segment selector link now that reportlet is loaded
			if (response.warning) { this.elements.warning.show().title = response.warning.message; }
			var old = this.elements.panel;
			this.elements.panels.insert(this.elements.panel = panel.element);
			if (panel.direction === 'forward') {
				new Effect.Morph(old, { style:{ marginLeft:(-this.elements.viewport.getWidth())+'px' }, duration:0.5, afterFinish:old.remove.bind(old) });
			} else if (panel.direction === 'back') {
				this.elements.panels.insert({ top:panel.element.setStyle({ marginLeft:(-this.elements.viewport.getWidth())+'px' }) });
				new Effect.Morph(panel.element, { style:{ marginLeft:'0px' }, duration:0.5, afterFinish:old.remove.bind(old) });
			} else if (old.parentNode) { old.remove(); }
			this.element.fire('om:dashboard.Cell.panelLoaded', { cell:this, panel:panel, response:response, time:time });
			return this.update();
		},

		titleChange: function titleChange(e) {
			this.report.set({ title:e.memo.text });
			this.element.fire('om:dashboard.Report.titlechange', this.report);
			return this;
		},

		displayUpdated: function displayUpdated(e) { return e.memo === this.report ? this.update() : this; },

		resizeClick: function resizeClick(e) {
			var a = e.findElement().up(), resize = this.resize,
				old = { column:this.column, row:this.row, colspan:this.colspan, rowspan:this.rowspan },
				neu = { column:this.column, row:this.row, colspan:this.colspan, rowspan:this.rowspan };
			if (a == resize.top_up) {  ++neu.rowspan; --neu.row; }
			if (a == resize.top_dn) {  --neu.rowspan; ++neu.row; }
			if (a == resize.rgt_rt) {  ++neu.colspan; }
			if (a == resize.rgt_lt) {  --neu.colspan; }
			if (a == resize.btm_up) {  --neu.rowspan; }
			if (a == resize.btm_dn) {  ++neu.rowspan; }
			if (a == resize.lft_rt) {  --neu.colspan; ++neu.column; }
			if (a == resize.lft_lt) {  ++neu.colspan; --neu.column; }
			if (!OM.Config.undoing) {
				this.page.dashboard.history.undo.push({ undo:this.updatePosition.bind(this, old), redo:this.updatePosition.bind(this, neu) });
				this.element.fire('om:dashboard.historychange');
			}
			return this.updatePosition(neu);
		},

		dateClick: function dateClick(e) {
			if ($(document.body).hasClassName('show-paper')) { return this; }
			if (page_controller.calendarCell === this) { page_controller.cancelDate(); return this; }
			var cal  = Object.clone(this.report.rs.calendar),
				cals = [ { value:'0', text:MT, calendar:cal } ];
			cal.cells = this.report.cells || [ this ];
			page_controller.showCalendars(cals, this);
			return this;
		},

		segmentClick: function segmentClick(e) {
			if ($(document.body).hasClassName('show-paper')) { return this; }
			// if the segment dropdown is not in the DOM or is hidden, call showSegSelect, otherwise hide dropdown
			if( !this.elements.segSelect || !this.elements.segSelect.open || this.elements.segSelect.type !== 'segment' ) {
				if( this.elements.settings && this.elements.settings.open ) { this.elements.settings.hide(); }
				OM.require('AP:dashboard.ReportSettings', this.showSegSelect);
			} else {
				this.elements.segSelect.hide();
			}
			return this;
		},

		settingsClick: function settingsClick(e) {
			// if the settings dropdown is not in the DOM or is hidden, call showSettings, otherwise hide dropdown
			if( !this.elements.settings || !this.elements.settings.open || this.elements.settings.type === 'segment' ) {
				if( this.elements.segSelect && this.elements.segSelect.open ) { this.elements.segSelect.hide(); }
				OM.require('AP:dashboard.ReportSettings', this.showSettings);
			} else {
				this.elements.settings.hide();
			}
			return this;
		},

		showSettings: function showSettings() {
			// if the settings dropdown isn't in the DOM yet, add it, otherwise show dropdown
			if( !this.elements.settings ) {
				var settings = ns.ReportSettings.createFor(this);
				this.elements.viewport.insert(settings.element);
				this.elements.settings = settings.show();
			} else {
				this.elements.settings.show();
			}
			return this;
		},

		showSegSelect: function showSegSelect() {
			// if the segment dropdown isn't in the DOM yet, add it, otherwise show dropdown
			if( !this.elements.segSelect ) {
				var segSelect = new ns.ReportSettings.Segment(this);
				this.elements.viewport.insert(segSelect.element);
				this.elements.segSelect = segSelect.show();
			} else {
				this.elements.segSelect.show();
			}
			// fire event to compile angular content
			this.element.fire('dashboard:segSelectOpened', this.report);
			return this;
		},

		settingsUpdated: function settingsUpdated(e) {
			if (e.memo.report !== this.report) { return this; }
			this.report.dirty = true; // make sure cell changes dirty the report
			return this.update().refresh();
		},

		settingsCanceled: function settingsCanceled(e) {
			return this;
		},

		toJSON: function toJSON() {
			var json = {}, i, ignore = { page:1, element:1, elements:1, panel:1, v:1, resize:1, history:1 };
			for (i in this) { if (!ignore[i] && !Object.isFunction(this[i])) { json[i] = this[i]; } }
			json.report_index = this.page.dashboard.bookmarks.indexOf(this.report);
			if (json.note) { json.note = json.note.escapeHTML(); }
			return json;
		}
	});

	OM.Requirement.met('AP:dashboard.Cell');
})();
