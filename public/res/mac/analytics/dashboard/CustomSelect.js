(function(undefined){ // create non-global scope

// commonly used strings / shortcuts
var HOVER = 'hover', NOMATCH = 'no-match', MT = '', HAS_LBL_CLS = 'CustomSelect-list-labels',
	LBL_CLS = 'CustomSelect-label', SHOWN = 'li:not(.no-match):not(:has(label))',
	VALUEATTR = 'data-value', TEXTATTR = 'title', ACTIONATTR = 'data-action', HIDE_TEXT = 'hide-text',
	clean = OM.Security.HtmlEncode;

OM.CustomSelect = Class.create({
	element:      null,
	textInput:    null,
	valueInput:   null,
	listElement:  null,
	arrowElement: null,
	hoverElement: null,

	changeListeners: [],

	url:     null,
	items:   null,
	actions: null,
	request: null,
	isOpen:  false,

	selectedValue: null,
	selectedText:  null,

	sprite:      null,
	hoverSprite: null,

	searchable: false,
	newStyle: false,

	initialize: function initialize(o) {
		o = o || {};
		this.url     = o.url     || null;
		this.items   = o.items   || null;
		this.actions = o.actions || null;

		this.complete = !this.url; // not complete if a url was specified

		this.searchable  = o.searchable  || this.searchable;
		this.newStyle    = o.newStyle    || this.newStyle;
		this.loadingText = o.loadingText || 'Loading...';
		this.loadAllText = o.loadAllText || 'Load Complete List';

		this.sprite      = o.sprite      || null;
		this.hoverSprite = o.hoverSprite || null;

		this.container = o.container || document.body;

		this.build(o);
		this.addListeners(o);
		return this;
	},

	build: function build(o) {
		var e = (this.element = $(o.element) || new Element('div'));
		e.addClassName('CustomSelect').widget = this;

		if (this.newStyle) e.addClassName('new_style');

		if (!(this.textInput = e.down('input[type="text"]'))) {
			e.insert(this.textInput = new Element('input', { type: 'text' }));
		}
		this.textInput.autocomplete = 'off';
		this.textInput.writeAttribute('spellcheck', 'false');
		this.textInput.readOnly = !this.searchable;
		this.textInput.onselectstart = (function() { return this.searchable; }).bind(this);

		if (!(this.valueInput = e.down('input[type="hidden"]'))) {
			e.insert(this.valueInput = new Element('input', { type: 'hidden' }));
		}
		if (!(this.listElement = e.down('ul'))) {
			e.insert(this.listElement = new Element('ul'));
		}
		this.listElement.addClassName('CustomSelect-list');
		if (this.newStyle) this.listElement.addClassName('new_style');
		if (this.textInput.id && !this.listElement.id) { this.listElement.id = this.textInput.id + '_list'; }

		this.selectedValue = (this.valueInput.value = o.selectedValue || this.valueInput.defaultValue || this.valueInput.value);
		this.selectedText  = (this.textInput.value  = o.selectedText  || this.textInput.defaultValue  || this.textInput.value);
		this.textInput.prevValue = this.selectedText;
		if (this.sprite) {
			this.textInput.addClassName(HIDE_TEXT).setStyle({ backgroundImage:this.sprite });
			this.updateSpritePos();
		}

		e.insert(this.arrowElement = (new Element('a')).addClassName('CustomSelect-arrow'));
		if (!this.searchable) { this.arrowElement.style.width = '100%'; }

		if (this.newStyle) {
			e.insert({top:
				new Element('div', {'class': 'CustomSelect-buttonBg'})
			});
		}

		this.loadSuccess = this.loadSuccess.bind(this);
		if (o.preload && this.url) { this.loadItems(); }

		return this;
	},

	addListeners: function addListeners(o) {
		var _this = this;
	
		this.changeListeners = [];
		if (o.onchange) { this.changeListeners = this.changeListeners.concat(o.onchange); }

		this.focus = this.focus.bindAsEventListener(this);
		this.textInput.observe('focus', this.focus);

		this.keyDown = this.keyDown.bindAsEventListener(this);
		this.textInput.observe('keydown', this.keyDown);

		this.keyUp = this.keyUp.bindAsEventListener(this);
		if (this.searchable) { this.textInput.observe('keyup', this.keyUp); }

		this.listClick  = this.listClick.bindAsEventListener(this);
		this.listScroll = this.listScroll.bindAsEventListener(this);
		this.listElement.observe('click',  this.listClick);
		this.listElement.observe('scroll', this.listScroll);

		this.listItemOver = this.listItemOver.bindAsEventListener(this);
		this.listElement.observe('mouseover', this.listItemOver);

		this.arrowClick = this.arrowClick.bindAsEventListener(this);
		this.arrowElement.observe('click', this.arrowClick);

		this.arrowElement.observe('mouseover', function() { _this.element.addClassName('hover'); });
		this.arrowElement.observe('mouseout', function() { _this.element.removeClassName('hover'); });

		this.closeBound = this.close.bindAsEventListener(this);

		return this;
	},

	focus: function focus(e) {
		if (this.isOpen || this.textInput.disabled) { return this; } // no need to do work if already open
		this.loadItems();
		if (this.searchable) { this.textInput.select(); } else { this.textInput.blur(); }
		var container = $(this.container);
		container.insert(this.listElement).observe('click', this.closeBound);
		var offset = this.element.cumulativeOffset(), containerOffset = container.cumulativeOffset(), size = this.element.getDimensions(),
			listHeight = this.listElement.getHeight(), docHeight = container.getHeight() + container.scrollTop,
			offsetTop = size.height;
		if ((offset.top + size.height + listHeight) > docHeight && (offset.top - listHeight) > 0) { offsetTop = -listHeight; }
		
		// This doesn't seem to work in IE7. The list's position is off:
		//this.listElement.clonePosition(this.textInput, { offsetTop:offsetTop, setWidth:false, setHeight:false }).setStyle({ width:size.width+'px' });
		
		// This seems to work though:
		this.listElement.setStyle({width: size.width + 'px', left: (offset.left - containerOffset.left) + 'px', top: (offset.top - containerOffset.top) + offsetTop + 'px'});

		// For whatever reason, the first time it's retrieved, offset is 15 pixels too far left.
		// This nasty little hack just repeats the process so the list is positioned correctly,
		// even the first time it's opened.
		offset = this.element.cumulativeOffset();
		containerOffset = container.cumulativeOffset();
		this.listElement.setStyle({width: size.width + 'px', left: (offset.left - containerOffset.left) + 'px', top: (offset.top - containerOffset.top) + offsetTop + 'px'});
		
		this.element.addClassName('CustomSelect-open');
		this.isOpen = true;
		return this;
	},

	disable: function disable() {
		this.textInput.disabled = true;
		return this.close();
	},

	enable: function enable() {
		this.textInput.disabled = false;
		return this;
	},

	close: function close(e) {
		if (e && (
			Event.findElement(e, '.CustomSelect') === this.element ||
			Event.findElement(e, '.CustomSelect-list') === this.listElement
		)) { return; }
		$(document.body).stopObserving('click', this.closeBound);
		this.textInput.value  = this.selectedText;
		this.valueInput.value = this.selectedValue;
		this.element.insert(this.listElement);
		this.filter();
		this.element.removeClassName('CustomSelect-open');
		this.isOpen = false;
		return this;
	},

	loadItems: function loadItems(force) {
		if (!force && (this.request || (this.items && this.items.length))) { return this; }
		var node = this.listElement.down('.load-all, .loading');
		if (node) { $(node).update(clean(this.loadingText)).className='loading'; }
		else { this.listElement.insert('<li><label class="loading">' + clean(this.loadingText) + '</label></li>'); }
		this.element.addClassName('loading-items');
		this.request = new Ajax.Request(this.url, { method:'get', onComplete:this.loadSuccess });
		return this;
	},

	loadSuccess: function loadSuccess(xhr) {
		if (xhr.request !== this.request) { return this; }
		this.request = null;
		this.items = xhr.responseJSON || OM.getResponseJSONFromResponseText(xhr.responseText);
		this.listElement.down('.loading').remove();
		this.element.removeClassName('loading-items');
		if (!this.items) { return this; } // TODO: handle bad response
		this.complete = true;
		this.buildItems();
		this.filter();
		this.moveHover(true);
		if (this.selectedValue) {
			var selected = this.findItem(this.selectedValue);
			if (!selected && this.items.length) { this.setValue(this.items[0].value, this.items[0].text); }
		}
		return this;
	},

	reload: function reload(url) {
		if (url) { this.url = url; }
		var list = this.listElement;
		while (list.lastChild) { list.removeChild(list.lastChild); } // empty list
		this.loadItems(true);
		return this;
	},

	buildItems: function buildItems() {
		var a = this.items, i, l = a.length, ai, li, cls = 'class', list = this.listElement, sprite = this.sprite;
		while (list.lastChild) { list.removeChild(list.lastChild); } // empty list
		for (i = 0; i < l; ++i) {
			ai = a[i]; li = (ai.element = new Element('li').addClassName(ai[cls]||MT)); ai.actions = this.buildActions(ai);
			if (ai.label) { li.update('<label>' + clean(ai.label) + '</label>').addClassName(LBL_CLS); list.addClassName(HAS_LBL_CLS); }
			else if (ai.disabled) { li.update('<span ' + VALUEATTR + '="' + clean(ai.value) + '" title="' + clean(ai.text) + '">' + ai.actions + clean(ai.text) + '</span>').addClassName('disabled'); }
			else { li.update('<a ' + VALUEATTR + '="' + clean(ai.value) + '" title="' + clean(ai.text) + '">' + ai.actions + clean(ai.text) + '</a>'); }
			if (sprite) { li.down('a').addClassName(HIDE_TEXT).setStyle({ backgroundImage:sprite, backgroundPosition:ai.sprite_pos||'0 0' }); }
			list.insert(li);
		}
		if (!this.complete) { list.insert('<li><label class="load-all">' + clean(this.loadAllText) + '</label></li>'); }
		return this;
	},

	buildActions: function buildActions(item) {
		if (item.actions || !this.actions || !this.actions.length) { return item.actions || ''; }
		var html = '', a = this.actions, i = a.length, ai, cls = 'class';
		while (i) {
			if (!(ai = a[--i]) || (ai.test && !ai.test(item))) { continue; }
			html += '<i title="' + clean(ai.text) + '" class="action ' + (ai[cls]||MT) + '" ' + ACTIONATTR + '="' + i + '"></i>';
		}
		return html;
	},

	_lazyLoaded: false,
	_lazyLoadItems: function() {
		if (this._lazyLoaded) return this;
		return this.buildItems();
	},

	arrowClick: function arrowClick(e) {
		this._lazyLoadItems();
		if (this.isOpen) { this.close(); }
		else if (!this.textInput.disabled) { this.textInput.focus(); }
	},

	listClick: function listClick(e) {
		var a = e.findElement();
		//FOR IE - 6
		if (a.tagName.toLowerCase() === 'li') { a = a.down('a') || a; }
		if (a.tagName.toLowerCase() === 'i') { this.textInput.focus(); this.actionClick(e, a); return this; }
		if (a.className === 'load-all')      { this.textInput.focus(); this.loadItems(true); return this; }
		if (a.tagName.toLowerCase() !== 'a') { this.textInput.focus(); return this; }
		this.setValue(a.readAttribute(VALUEATTR), a.readAttribute(TEXTATTR));
		this.close();
		return this;
	},

	listScroll: function listScroll(e) {
		this.textInput.focus(); // make sure we don't lose focus
		return this;
	},

	actionClick: function(e, i) {
		var a = i.up('a'), action = this.actions[i.readAttribute(ACTIONATTR)];
		if (a && action && action.fn) {
			var items = this.items, k, n = items.length, value = String(a.readAttribute(VALUEATTR));
			for (k = 0; k < n && String(items[k].value) !== value; ++k);
			if (String(items[k].value) === value) { action.fn.call(this, items[k]); }
		}
		return this;
	},

	keyDown: function keyDown(e) {
		switch (e.keyCode) {
			case Event.KEY_UP:     this.moveHover(true);  e.stop(); break;
			case Event.KEY_DOWN:   this.moveHover(false); e.stop(); break;
			case Event.KEY_TAB:    this.close();   break;
			case Event.KEY_RETURN: this.submit(e); break;
			default: break;
		}

		return this;
	},

	keyUp: function keyUp(e) {
		var value = this.textInput.value, prev = this.textInput.prevValue;
		if (value !== prev) {
			this.textInput.prevValue = value;
			this.filter();
			if (!this.complete) { this.loadItems(true); }
		}
		return this;
	},

	submit: function submit(e) {
		var hover = this.hoverElement && this.hoverElement.down('a');
		if (hover) { this.setValue(hover.readAttribute(VALUEATTR), hover.readAttribute(TEXTATTR)); }
		return this.close();
	},

	moveHover: function moveHover(up) {
		var current = this.hoverElement, next = null;
		if (!current || !current.match(SHOWN)) { next = this.listElement.down(SHOWN); }
		else { next = (up ? current.previous(SHOWN) : current.next(SHOWN)) || current; }
		this.highlight(next);
		if (next) { // make sure hover item is visible
			var otop = next.offsetTop, bottom = otop + next.offsetHeight, height = this.listElement.clientHeight;
			this.listElement.scrollTop = Math.max(Math.min(this.listElement.scrollTop, otop), bottom - height);
		}
		return this;
	},

	listItemOver: function listItemOver(e) {
		var li = e.findElement(SHOWN);
		if (!li || li === document) { return this; }
		return this.highlight(li);
	},

	highlight: function highlight(item) {
		if (item === this.hoverElement) { return this; }
		if (this.hoverElement) {
			this.hoverElement.removeClassName(HOVER);
			if (this.sprite && this.hoverSprite) { this.hoverElement.down('a').setStyle({ backgroundImage:this.sprite }); }
		}
		if (this.hoverElement = item) {
			this.hoverElement.addClassName(HOVER);
			if (this.sprite && this.hoverSprite) { this.hoverElement.down('a').setStyle({ backgroundImage:this.hoverSprite }); }
		}
		return this;
	},

	setValue: function setValue(value, text, force) {
		var item = this.findItem(value);
		
		if (value == this.selectedValue && !force) { return this; }
		if (text === null || text === undefined) {
			text = (item && item.text) || MT;
		}

		var prevValue = this.selectedValue, prevText = this.selectedText, undo = false;
		this.valueInput.value = this.selectedValue = value;
		this.textInput.value  = this.selectedText  = text;

		// execute all change listeners, if any return false, undo.
		for (var a = this.changeListeners, i = 0, l = a.length; i < l; ++i) {
			if (a[i].call(this, value, text, item) === false) { undo = true; }
		}

		if (undo) {
			this.valueInput.value = this.selectedValue = prevValue;
			this.textInput.value  = this.selectedText  = prevText;
		} else if (this.sprite) { this.updateSpritePos(); }

		return this;
	},

	findItem: function findItem(value) {
		var items = this.items, i;
		
		if (items)
		{
			l = this.items.length;
			for (i = 0; i < l; ++i) { if (items[i].value === value) { return items[i]; } }
		}
		return null;
	},

	updateSpritePos: function updateSpritePos() {
		var items = this.items, i, l = items.length, item = null, value = this.selectedValue;
		for (i = 0; i < l && !item; ++i) { if (items[i].value === value) { item = items[i]; } } // find selected item
		this.textInput.setStyle({ backgroundPosition:item&&item.sprite_pos||'0 0' });
		return this;
	},

	filter: function filter() {
		if (!this.searchable || !this.items) { return; }
		var text = this.textInput.value, items = this.items, i, l, k, t;

		// blank or same as selected, show all
		if (!text.strip() || text.strip() === this.selectedText.strip()) {
			for (i = 0, l = items.length; i < l; ++i) {
				if (items[i].label) { continue; }
                if (items[i].element) {
                    items[i].element.removeClassName(NOMATCH)
                        .down('a').innerHTML = items[i].actions + clean(items[i].text);
                }
			}
			return this;
		}

		// build regex to search, basically each string with anything between
		var search = OM.util.escapeRegExp(text).split(/\s+/);
		search = new RegExp('(.*?)(' + search.join(')(.*?)(') + ')(.*)', 'i');

		// Find each match in items
		var matches, html;
		for (i = 0, l = items.length; i < l; ++i) {
			if (items[i].label) { continue; }
			matches = items[i].text.match(search);
			if (matches && matches.length) {
				// highlight matched text
				html = '';
				for (k = 1, t = matches.length; k < t; ++k) {
					if (k % 2) { html += clean(matches[k]); }
					else { html += '<em>' + clean(matches[k]) + '</em>'; }
				}
				items[i].element.removeClassName(NOMATCH)
					.down('a').innerHTML = items[i].actions + html;
			} else {
				// hide non-matching items
				items[i].element.addClassName(NOMATCH);
			}
		}

		var current = this.hoverElement;
		if (current && !current.match(SHOWN)) { this.moveHover(); }
		return this;
	}
});
OM.Requirement.met('CustomSelect');
})(); // end scope
