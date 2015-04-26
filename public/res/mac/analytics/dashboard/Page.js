(function(undefined){

	var ns = (OM.dashboard = OM.dashboard || {}),
		MT = '', DIV = 'div', IMG = 'img', A = 'a', OL = 'ol', LI = 'li', HTITLE = 'h3', HSUB = 'p';

	function cellSort(a, b) {
		return (a.row === b.row) ? (a.column - b.column) : (a.row - b.row);
	}

	ns.Page = Class.create({
		page_style: 'LETTER_LANDSCAPE',
		notes_at:   'top',
		grid:       null,
		cells:      null,

		cells_grid: null,

		initialize: function initialize(o, dashboard) {
			o = o || {};
			for (i in o) { if (i in this) { this[i] = o[i]; } } // set all existing properties

			if (!this.cells) { this.cells = []; }
			this.cells.sort(cellSort);

			if (!/^2x2|2x3|3x2$/.test(this.grid)) { // validate grid, it can be empty
				this.grid = this.cells.length ? '2x2' : null;
			}

			this.dashboard = dashboard;

			return this.build().addListeners();
		},

		build: function build() {
			this.element = new Element(DIV, { 'class':'page grid-'+this.grid+' '+this.page_style.replace('_', ' ').toLowerCase() });
			this.content = new Element(DIV, { 'class':'page-content' });
			this.element.widget = this;
			this.element.insert(this.content);

			if (!this.grid) { this.buildChooseGrid(); }

			OM.require('AP:dashboard.Cell', this.buildCells.bind(this));
			return this.updateEditLayout();
		},

		buildCells: function buildCells() {
			var cells = this.cells, i, l = cells.length, note = 0,
				div = this.content, Cell = ns.Cell;
			for (i = 0; i < l; ++i) {
				div.insert((cells[i] = new Cell(cells[i], this)).element);
				cells[i].updateNote(cells[i].note ? ++note : null);
			}
			return this;
		},

		addCell: function addCell(cell) {
			this.content.insert(cell.element);
			cell.element.fire('dashboard:reportletAddedToDom', cell.report);
			this.cells.push(cell);
			return this.updateCellNotes().updateCellsEditLayout();
		},

		removeCell: function removeCell(cell) {
			cell.element.remove();
			this.cells = this.cells.without(cell);
			return this.updateCellNotes().updateCellsEditLayout();
		},

		updateCellNotes: function updateCellNotes() {
			var cells = this.cells, c, cc = cells.length, note = 0;
			for (c = 0; c < cc; ++c) {
				cells[c].updateNote(cells[c].note ? ++note : null);
			}
			return this;
		},

		buildChooseGrid: function buildChooseGrid() {
			var grids = [ /portrait/i.test(this.page_style) ? '2x3' : '3x2', '2x2' ],
				parts, i, l = grids.length, element, html, grid, c, cc;
			this.chooser = this.chooser && this.chooser.update() || new Element(DIV, { 'class':'choose-grid-cont' });
			for (i = 0; i < l; ++i) {
				parts = (grid = grids[i]).split('x');
				cc = parts[0] * parts[1];
				element = new Element(DIV, { 'class':'choose-grid grid-'+grid });
				html = '<div class="grid-image">';
				for (c = 0; c < cc; ++c) { html += '<div></div>'; }
				html += '</div><div class="grid-text">'+grid+'</div>';
				element.update(html).on('click', this.setGrid.bind(this, grid));
				this.chooser.insert(element);
			}
			this.content.insert(this.chooser);
			return this;
		},

		buildShowPaper: function buildShowPaper() {
			if (this.paper) { return this; }
			var paper = (this.paper = {
				header: new Element(DIV, { 'class':'page-header' }),
				notes:  new Element(DIV, { 'class':'page-notes' }),
				footer: new Element(DIV, { 'class':'page-footer' })
			});

			if (OM.Config.cobranding) {
				var img = new Element(IMG, OM.Config.cobranding).addClassName('branding');
				paper.header.insert(img);
			}
			paper.title    = new Element(HTITLE, { 'class':'page-title' });
			paper.subtitle = new Element(HSUB,   { 'class':'page-subtitle' });
			paper.header.insert(paper.title).insert(paper.subtitle);

			paper.page_num = new Element(DIV,    { 'class':'page-num' });
			paper.footer.insert(paper.page_num)
				.insert(new Element(IMG, { 'class':'adobe-logo', src:OM.Config.STATIC_URL+'/images/footer_logo_adobe_clear.gif' }))
				.insert(new Element(IMG, { 'class':'suite-logo', src:OM.Config.STATIC_URL+'/images/marketing_cloud_dx_300.png' }));

			this.content.insert({ before:paper.header, after:paper.footer });
			paper.header.insert({ after:paper.notes });

			return this;
		},

		updateShowPaper: function updateShowPaper(no, of) {
			this.buildShowPaper();
			var paper = this.paper, db = this.dashboard,
				date  = (OM.Config.rs_current_date = OM.Config.rs_current_date || (new Date()).toFormattedString('%b %e, %Y %l:%M %P %Z')),
				sub_t = db.custom_subtitle ? db.subtitle : 'Created:'.toLocaleString() + ' <date>';
			paper.title.update(db.title.escapeHTML());
			paper.subtitle.update(sub_t.replace(/<date\s*\/?>/g, date).escapeHTML());
			paper.page_num.update('Page %s of %s'.toLocaleString().replace(/%s/, no+1).replace(/%s/, of));

			var cells = this.cells, i, l, note, index = 0, notes = MT;
			for (i=0, l=cells.length; i < l; ++i) {
				cells[i].hideNoteBubble();
				if (note = cells[i].note) { notes += '<p class="note"><i>'+(++index)+'</i>'+(note||MT).escapeHTML()+'</p>'; }
			}
			paper.notes.update(notes);

			var max = parseInt(paper.notes.getStyle('max-height')),
				height = parseInt(paper.notes.measure('height'));
			paper.footer.setStyle({ marginTop:(max-height)+'px' });
		},

		buildEditLayout: function buildEditLayout() {
			if (this.layout) { return this; }
			var els = (this.layout = {
				page_grid: new Element(DIV, { 'class':'page-grid' }),

				move_page: new Element(DIV, { 'class':'move-page' }),

				move_top:  new Element(IMG, { 'src':OM.Config.STATIC_URL+'/images/v15icons/move-top.png',    title:'Move Page To Top'.toLocaleString() }),
				move_up:   new Element(IMG, { 'src':OM.Config.STATIC_URL+'/images/v15icons/move-up.png',     title:'Move Page Up'.toLocaleString() }),
				move_down: new Element(IMG, { 'src':OM.Config.STATIC_URL+'/images/v15icons/move-down.png',   title:'Move Page Down'.toLocaleString() }),
				move_btm:  new Element(IMG, { 'src':OM.Config.STATIC_URL+'/images/v15icons/move-bottom.png', title:'Move Page To Bottom'.toLocaleString() }),

				remove:    new Element(A,   { 'class':'remove-page', title:'Remove Page'.toLocaleString() })
			});
			this.content.insert({ top:els.page_grid });
			els.move_page.insert(els.move_top).insert(els.move_up).insert('<span></span>')
				.insert(els.move_down).insert(els.move_btm).insert('<span></span>').insert(els.remove);
			this.element.insert(els.move_page);

			els.move_page.on('click', this.moveClick = this.moveClick.bindAsEventListener(this));
			return this;
		},

		updateEditLayout: function updateEditLayout() {
			this.buildEditLayout().updateCellsEditLayout();
			var els = this.layout, i = 0, pages = this.dashboard.pages, max = pages.length - 1;
			while (i <= max && pages[i] !== this) { ++i; }
			if (i > 0) {
				els.move_top.removeClassName('disabled');
				els.move_up.removeClassName('disabled');
			} else {
				els.move_top.addClassName('disabled');
				els.move_up.addClassName('disabled');
			}
			if (i < max) {
				els.move_btm.removeClassName('disabled');
				els.move_down.removeClassName('disabled');
			} else {
				els.move_btm.addClassName('disabled');
				els.move_down.addClassName('disabled');
			}

			if (!this.grid || (this.layout && this.layout.grid === this.grid)) { return this; }
			var grid = els.page_grid.update(), empty,
				parts = (els.grid = this.grid).split('x'),
				c, cc = +parts[0], r, rr = +parts[1], text = 'Drop a reportlet here'.toLocaleString();
			grid.grid = [];
			for (r = 0; r < rr; ++r) {
				grid.grid[r] = [];
				for (c = 0; c < cc; ++c) {
					empty = new Element(DIV, { 'class':'reportlet empty col-'+c+' row-'+r }).update('<div class="empty-text">'+text+'</div>');
					grid.insert(grid.grid[r][c] = empty);
				}
			}

			return this;
		},

		updateCellsEditLayout: function updateCellsEditLayout() {
			if (!this.grid) { return this; }
			var grid = (this.cells_grid = this.buildCellsGrid()),
				cells = this.cells, i, l = cells.length,
				rows = +this.grid.split('x')[1], cols = +this.grid.split('x')[0];
			for (i = 0; i < l; ++i) { cells[i].updateEditLayout(grid, rows, cols); }
			return this;
		},

		buildCellsGrid: function buildCellsGrid() {
			if (!this.grid) { return []; }
			var grid = [], cells = this.cells, i, l = cells.length, cell,
				rows = +this.grid.split('x')[1], cols = +this.grid.split('x')[0],
				r, rr, c, cc;
			for (r = 0; r < rows; ++r) {
				grid[r] = [];
				for (c = 0; c < cols; ++c) { grid[r][c] = null; }
			}
			for (i = 0; i < l; ++i) {
				cell = cells[i];
				rr = cell.row+cell.rowspan;
				cc = cell.column+cell.colspan;
				for (r = cell.row; r < rr; ++r) {
					for (c = cell.column; c < cc; ++c) {
						grid[r][c] = cell;
					}
				}
			}
			return grid;
		},

		canPlaceAt: function canPlaceAt(c, r, cs, rs, cell) {
			if (!this.cells_grid) { this.cells_grid = this.buildCellsGrid(); }
			var grid = this.cells_grid, rr = grid.length, cc = grid[0].length;
			if (c < 0 || r < 0 || c+cs > cc || r+rs > rr) { return false; }
			var s = c;
			for (rr = r+rs, cc = c+cs; r < rr; ++r) { for (c = s; c < cc; ++c) {
				if (grid[r][c] && (grid[r][c] !== cell)) { return false; }
			} }
			return true;
		},

		closeEditLayout: function closeEditLayout() {
			var cells = this.cells, c, cc = cells.length;
			for (c = 0; c < cc; ++c) { cells[c].closeEditLayout(); }
			return this;
		},

		setPaper: function setPaper(style) {
			if (!this.grid) {
				this.page_style = style;
				this.element.className = 'page grid-'+this.grid+' '+style.replace('_', ' ').toLowerCase();
				return this.buildChooseGrid();
			}
			var parts = (this.page_style = style).split('_'),
				reverse = (this.grid === '2x3' && parts[1] === 'LANDSCAPE' || this.grid === '3x2' && parts[1] === 'PORTRAIT'),
				cells = this.cells, cell, i, l = cells.length, tmp;

			if (reverse) { this.grid = this.grid.split(MT).reverse().join(MT); }
			this.element.className = 'page grid-'+this.grid+' '+style.replace('_', ' ').toLowerCase();
			for (i = 0; i < l; ++i) {
				cell = cells[i];
				if (reverse) {
					var tmp = cell.row;
					cell.row = cell.column;
					cell.column = tmp;

					tmp = cell.rowspan;
					cell.rowspan = cell.colspan;
					cell.colspan = tmp;
				}
				cell.hideNoteBubble().updatePosition();
			}
			return this.updateEditLayout();
		},

		setGrid: function setGrid(grid) {
			this.element.className = 'page grid-'+(this.grid=grid)+' '+this.page_style.replace('_', ' ').toLowerCase();
			if (grid) { this.chooser.remove(); this.updateEditLayout(); } else { this.buildChooseGrid(); }
			if (!OM.Config.undoing) {
				this.dashboard.history.redo.length = 0;
				this.dashboard.history.undo.push({ undo:this.setGrid.bind(this, null), redo:this.setGrid.bind(this, grid) });
				this.element.fire('om:dashboard.historychange');
			}
			return this;
		},

		moveTo: function moveTo(to) {
			var from = 0, pages = this.dashboard.pages, max = pages.length - 1;
			while (from <= max && pages[from] !== this) { ++from; }
			if (from > max) { return this; } // this page isn't in the dashboard

			if (to === 'bottom')    { to = max; }
			else if (to === 'down') { to = from+1; }
			else if (to === 'up')   { to = from-1; }
			else if (to === 'top')  { to = 0; }
			if (isNaN(to) || to < 0 || to > max || from === to) { return this; } // invalid move

			this.dashboard.pages.splice(from, 1);
			this.dashboard.pages.splice(to, 0, this);

			var offset = this.element.cumulativeOffset().top - document.body.scrollTop;
			if (to === max) { this.dashboard.pages_div.insert(this.element); }
			else { this.dashboard.pages_div.insertBefore(this.element, pages[to+1].element); }
			this.dashboard.updateEditLayout();

			if (!OM.Config.undoing) {
				this.element.scrollTo();
				document.body.scrollTop -= offset;
				this.dashboard.history.redo.length = 0;
				this.dashboard.history.undo.push({ undo:this.moveTo.bind(this, from), redo:this.moveTo.bind(this, to) });
				this.element.fire('om:dashboard.historychange');
			}
			return this;
		},

		moveClick: function moveClick(e) {
			var btn = e.findElement(), els = this.layout;
			if (btn == els.move_top)       { this.moveTo('top'); }
			else if (btn == els.move_up)   { this.moveTo('up'); }
			else if (btn == els.move_down) { this.moveTo('down'); }
			else if (btn == els.move_btm)  { this.moveTo('bottom'); }
			else if (btn == els.remove)    {
				var i = 0, pages = this.dashboard.pages, max = pages.length - 1;
				while (i <= max && pages[i] !== this) { ++i; }
				if (i <= max) { this.dashboard.removePage(i); }
			}
			return this;
		},

		addListeners: function addListeners() {
			return this;
		},

		toJSON: function toJSON() {
			var json = {}, i, ignore = { dashboard:1, element:1, content:1, paper:1, layout:1, chooser:1, cells_grid:1 };
			for (i in this) { if (!ignore[i] && !Object.isFunction(this[i])) { json[i] = this[i]; } }
			return json;
		}
	});

	OM.Requirement.met('AP:dashboard.Page');
})();

