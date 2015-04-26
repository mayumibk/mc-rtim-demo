(function() {
	var OWL = window.OM, empty = Prototype.emptyFunction;

	function create(name, a,b,c,d,e,f,g) {
		return new Requirement({ require:name, thenDo:function() {
			var o = OWL, parts = name.split('.').reverse();
			while (parts.length) { o = o[parts.pop()]; }
			return new o(a,b,c,d,e,f,g);
		} });
	} OWL.create = create;

	OWL.version = OWL.Config.JS_VERSION || '1';
	OWL.path    = (function () {
		var scripts = document.getElementsByTagName('script'), i = scripts.length, src;
		while (i--) { if (/OWL/.test(src = scripts[i].src)) { return src.substr(0, src.indexOf('OWL.js')); } }
	})();

	OWL.log = (window.console && console.log) || empty;
	OWL.dir = (window.console && console.dir) || empty;

	// detect browser
	OWL.browser = (function() {
		if (window.opera) { return 'Opera'; }
		if (window.ActiveXObject) {
			if (window.addEventListener) { return 'IE9'; }
			if (window.querySelectorAll) { return 'IE8'; }
			if (window.XMLHttpRequest)   { return 'IE7'; }
			return 'IE6';
		}
		if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) { return 'Chrome'; }
		if (navigator.taintEnabled) { return 'Safari'/*'Webkit'*/; }
		if (document.getBoxObjectFor || window.mozInnerScreenX !== null) { return 'Firefox'; }
	})();

	// Utilities
	OWL.addJS = function addJS(file, id) {
		var s = document.createElement('script');
		s.src = file; if (id) { s.id = id; }
		document.getElementsByTagName('head')[0].appendChild(s);
	};

	OWL.addCSS = function addCSS(file) {
		var s = document.createElement('link');
		s.rel = 'stylesheet'; s.type = 'text/css';
		s.href = file + (file.indexOf('?') === -1 ? '?' : '&') + 'version=' + OWL.version;
		document.getElementsByTagName('head')[0].appendChild(s);
	};

	OWL.require = function require(id, next) { return new Requirement({ require:id, thenDo:next }); };

	/* Dynamic module loading */
	var m_status = {}, m_loc = {}, LOADING = 1, READY = 2;

	function Requirement(o) { 
		this.dependencies = [].concat(o.require || []);
		this.thenDo = o.thenDo || empty;

        if (o.hasOwnProperty('loading')) {
            m_status[o.loading] = LOADING;
        }

		var a = this.dependencies, i, l = a.length, name, path;
		for (i = 0; i < l; ++i) {
			name = a[i]; path = '';

			if (name.indexOf(':') > -1) {
				var parts = name.split(':');
				path = m_loc[parts[0]] + '/' + parts[1].replace(/\./g, '/');
			} else { path = OWL.path + 'modules/' + name.replace(/\./g, '/'); }

			if (name.indexOf('Localization') > -1) {
				path += '/' + ((OWL.Config && OWL.Config.locale) || 'en-us').replace('_', '-').toLowerCase();
			} else { path += path.substring(path.lastIndexOf('/')); }

			path += '.js?version=' + OWL.version;

			if (!m_status[name]) {
				m_status[name] = LOADING;
				OWL.addJS(path);
			}
		}

		(this.dependencyCheck = dependencyCheck.bind(this))();
	}
	OWL.Requirement = Requirement;

	function dependencyCheck () {
		var a = this.dependencies, i, l = a.length, wait = false;
		for (i = 0; i < l && !wait; ++i) { wait = m_status[a[i]] !== READY; }
		if (wait) { setTimeout(this.dependencyCheck, 100); } else { this.thenDo(); }
		return this;
	}

	Requirement.K = { Loading:LOADING, Ready:READY };
	Requirement.moduleStatus = m_status;
	Requirement.met = function OWL_Requirement_met (req) { return m_status[req] = READY; };

	Requirement.met('StringExtras'); // localization is now defined in omniture.js

	Requirement.externalLocations = m_loc;
	Requirement.addExternalLocation = function addExternalLocation(loc) { return (m_loc[loc.name] = loc.url); };
	Requirement.addExternalLocation({ name:'AP', url:OWL.Config.PLATFORM_URL + '/js' });
	Requirement.addExternalLocation({ name:'Suite', url:OWL.Config.SUITE_URL + '/js' });
	Requirement.addExternalLocation({ name:'SC', url:OWL.Config.SC_URL + '/js' });

	OWL.supports = { data:false, onload:false }; // check for data uri support
	if (document.addEventListener) { // skip old IE browsers that will warn about mixed content
		var s = document.createElement('script'), head = document.getElementsByTagName('head')[0];
		s.src = 'data:text/javascript,OWL.supports.data=true;';
		s.onload = function() { head.removeChild(s); OWL.supports.onload = true; };
		head.appendChild(s);
	}

	// helper functions
	var div = document.createElement('div');

	// returns the browser specific css style available or false
	function supports_css(css) {
		if (div.style[(css = css.camelize())] !== undefined) { return css; }
		return (css = css.substr(0, 1).toUpperCase() + css.substr(1)) &&
			(div.style['Webkit' + css] !== undefined && 'Webkit' + css) || // webkit specific
			(div.style['Moz' + css] !== undefined && 'Moz' + css) || // gecko specific
			(div.style['Ms' + css] !== undefined && 'Ms' + css) || // microsoft specific
			(div.style['O' + css] !== undefined && 'O' + css); // opera specific
	} OWL.supports.css = supports_css;
	if (!supports_css('box-shadow')) { $(document.documentElement).addClassName('no-box-shadow'); }

	// take care of queued up calls to OWL.fn
	if (OWL.fn && OWL.fn.q) {
		var a = OWL.fn.q, i, l = a.length;
		for (i = 0; i < l; ++i) { create.apply(OWL, a[i]); }
	} OWL.fn = create;
})();

