OWL.InlineEdit = Class.create({
	paddingRight: 25,

	initialize: function (o) {
		o = o || {};

		this.text = o.text || '';
		this.emptyText = o.emptyText || '';
		this.maxLength = o.maxLength || 0;
		this.maxWidth = o.maxWidth || 0;
		this.tokens = o.tokens || [];
		this.tokenText = o.tokenText || '</>';
		this.tokenAddText = o.tokenAddText || '';

		this.build();
		this.bindEventListeners();
		this.addEventListeners();
	},

	build: function () {
		this.element = new Element('span').addClassName('InlineEdit');
		this.element.widget = this;
		this.element.update([
			'<span>', this.expandTokens(this.text).escapeHTML() || '&nbsp;', '</span>',
			'<input type="text" value="', this.text.escapeHTML().replace(new RegExp('"','g'),'&quot;'), '" />',
			'<div class="InlineEdit-tokens" style="display:none;"></div>'
		].join(''));

		this.span = this.element.down('span');
		this.input = this.element.down('input');
		this.tokenBtns = this.element.down('.InlineEdit-tokens');
	},

	bindEventListeners: function () {
		[	'focus',
			'blur',
			'mouseEnter',
			'mouseLeave',
			'keyPress',
			'keyUp'
		].each(function (e) {
			this[e] = this[e].bindAsEventListener(this);
		}, this);
	},

	addEventListeners: function () {
		this.input.observe('focus', this.focus);
		this.input.observe('blur', this.blur);
		this.input.observe('keypress', this.keyPress);
		this.input.observe('keyup', this.keyUp);
		this.element.observe('mouseenter', this.mouseEnter);
		this.element.observe('mouseleave', this.mouseLeave);
	},

	focus: function(e) {
		this.input.addClassName('focus');
		this.input.select();
		this.showTokens();
	},

	blur: function(e) {
		if(!this.input.value.strip()) {
			this.input.value = this.emptyText;
			this.keyUp();
		}

		this.hideTokens();
		this.input.removeClassName('focus');
		this.element.fire('OWL:blur', this);
	},

	keyPress: function(e) {
		if (e.keyCode === Event.KEY_RETURN) {
			e.stop(); // prevent form submission
			this.input.blur();
		} else if (e.charCode >= 32) {
			this.span.update(this.expandTokens(this.input.value + String.fromCharCode(e.charCode)).escapeHTML());
		} else {
			this.span.update(this.expandTokens(this.input.value).escapeHTML());
		}
		this.input.setStyle({ width: this.element.offsetWidth + this.paddingRight + 'px' });
	},

	keyUp: function(e) {
		this.setText(this.input.value);
		this.element.fire('OWL:change', this);
	},

	mouseEnter: function(e) { this.input.addClassName('hover'); },

	mouseLeave: function(e) { this.input.removeClassName('hover'); },

	setText: function(text) {
		if (this.maxLength && text.length > this.maxLength) {
			text = text.substr(0, this.maxLength);
		}

		if (this.input.value !== text) { this.input.value = text; }
		this.span.update(this.expandTokens(this.text = text).escapeHTML() || '&nbsp;');
		while (this.maxWidth && this.element.offsetWidth > this.maxWidth) {
			this.input.value = (text = text.substr(0, text.length - 1));
			this.span.update(this.expandTokens(this.text = text).escapeHTML() || '&nbsp;');
		}
		if (this.element.offsetWidth) {
			this.input.setStyle({ width: this.element.offsetWidth + this.paddingRight + 'px' });
		}
	},

	expandTokens: function(text) {
		var tokens = this.tokens, token = null;
		for (var i = 0, l = tokens.length; i < l; ++i) {
			token = tokens[i];
			text = text.replace(token.find, token.replace);
		}
		return text;
	},

	showTokens: function() {
		var tokens = this.tokens, l = tokens.length;
		if (!l) { return; }
	
		this.tokenBtns.update();

		var prefix = this.tokenAddText ? this.tokenAddText + ' ': '';
		for (var i = 0; i < l; ++i) {
			var token = tokens[i];
			if (token.find.match(this.text)) { continue; }

			var button = new Element('a').addClassName('button');
			button.update((prefix + token.token).escapeHTML());
			button.title = token.description || (prefix + '"' + token.replace + '"');
			button.observe('mousedown', this.tokenBtnClick.bindAsEventListener(this, token.token));
			this.tokenBtns.insert(button);
		}

		this.tokenBtns.show();
	},

	hideTokens: function() { this.tokenBtns.hide(); },

	tokenBtnClick: function(e, token) {
		e.stop(); e.findElement('a').remove();
		if (!isNaN(this.input.selectionEnd)) {
			var start = this.input.selectionEnd;
			this.input.value = this.input.value.substr(0, start) + token + this.input.value.substr(start);
			this.input.selectionStart = this.input.selectionEnd = start + token.length;
		} else if (document.selection) {
			var sel = document.selection.createRange();
			sel.text += token;
			sel.select();
			this.input.focus();
		} else {
			this.input.value += token;
		}

		this.span.update(this.expandTokens(this.text = this.input.value).escapeHTML() || '&nbsp;');
		if (this.element.offsetWidth) { this.input.setStyle({ width: this.element.offsetWidth + this.paddingRight + 'px' }); }
		this.element.fire('OWL:change', this);
	}
});
OWL.Requirement.met('InlineEdit');
