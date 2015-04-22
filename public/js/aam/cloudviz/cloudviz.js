/*
 * ************************************************************************
 *
 *  ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   (c) Copyright 2014 Adobe Systems, Inc.
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 * ************************************************************************
 */

/*
 * CloudViz - v3.4.0 - 2014-10-28
 * Copyright (c) 2014 Adobe Systems, Inc. All Rights Reserved.
 */

/**
 * CloudViz Core
 * Base object that provides common functionality we can use for all chart types.
 **/
(function(global) {
	'use strict';

	var cloudViz = {}, dv = global.dv || {}, d3 = global.d3 || {};
	var core = {};

	/**
	 * Contains all options the user has specified plus defaults. The attribute names are the option names are the
	 * option names and the values are the option values.
	 * @type {object}
	 * @private
	 */
	core._options = null;

	/**
	 * A hash of all active event types and callbacks that have already been registered via the `on` method. When
	 * events are removed, they are simply deleted from this hash.
	 *
	 * @typedef EventMap
	 * @type {Object.<string, function>}
	 * @private
	 */
	core._eventMap = {};

	/**
	 * Contains all options that have changed since the last time render() was called. The attribute names are the
	 * option names and the values are the option values.
	 *
	 * @type {object}
	 * @private
	 */
	core._changedOptions = null;

	core.init = function(options) {
		this._initDefaultOptions();
		this.setOptions(options);
		return this;
	};

	/**
	 * Initializes this._options with appropriate default options.
	 *
	 * @param {object} defaultsToMerge Any defaults from extending objects that should be merged into and override
	 * defaults of this object.
	 * @returns {object} Final default options.
	 * @private
	 */
	core._initDefaultOptions = function(defaultsToMerge) {
		var defaults = {
			dataAdapter: 'standard',
			data: null,
			height : null, // set height of the chart within the parent
			parent : null, // parent element in the DOM for the chart
			width : null, // set width of the chart within the parent,
			autoResize : false,
			locale : 'en-US',
			l10n: {}
		};

		if (defaultsToMerge) {
			this._mergeOptions(defaults, defaultsToMerge);
		}

		this._options = defaults;

		this._changedOptions = {};

		// At this point, consider all default options as "changed" options.
		for (var key in defaults) {
			this._changedOptions[key] = defaults[key];
		}

		return this._options;
	};

	/**
	 * Copies a configuration option to destination object using specific option copy rules.
	 * @param {object} dest An object where the configuration option will be copied to.
	 * @param {string} key The name of option being copied.
	 * @param {*} value The value of the option being copied.
	 */
	core._mergeOption = function(dest, name, value) {
		switch(name) {
			case 'mappings': // copy the mappings properties over, don't completely overwrite
			case 'formats': // copy the formats property over in the same way
				dest[name] = dest[name] || {}; // create mappings object if necessary
				this._mergeOptions(dest[name], value);
				break;
			default:
				dest[name] = value;
				break;
		}
		return dest;
	};

	/**
	 * Copies configuration options to one object to another using specific option copy rules.
	 *
	 * @param {object} dest An object where configuration options will be copied to.
	 * @param {object} origin An object where configuration options will be copied from.
	 * @returns {object} The dest object after options have been copied to it.
	 */
	core._mergeOptions = function(dest, source) {
		for (var key in source) {
			this._mergeOption(dest, key, source[key]);
		}
		return dest;
	};

	/**
	 * Truncates long label strings and adds ellipses
	 **/
	core._truncateLabel = function(label, thresh) {
		var max = thresh || this.X_AXIS_LABEL_MAXLENGTH;
		return (label.length > max) ? label.substring(0, max) + '...' : label;
	};

	/**
	 * Formats number `v` according to format `formatType` (currency, percent, decimal [default]).
	 * If decimalPlaces is specified, number abbreviation still occurs, but decimal precision is guaranteed.
	 */
	core._formatNumber = function(formatType, value, decimalPlaces) {
		var symbol = '', format, small,
			l10n = this._dataAdapter.l10n.numberFormat,
			pattern, formatted,
			precision;

		if (formatType == 'currency' || formatType == 'percent') {
			symbol = l10n[formatType].symbol;

			if (value >= 0) {
				pattern = l10n[formatType].positivePattern;
			} else {
				pattern = l10n[formatType].negativePattern;
			}
		} else {
			if (value >= 0) {
				pattern = '{number}';
			} else {
				pattern = l10n.negativePattern;
			}
		}

		if (formatType == 'percent') {
			value *= 100;
		}

		value = Math.abs(value);

		if (value >= 100) { precision = 3; }
		else if (value >= 10) { precision = (value % 1) ? 3 : 2; }
		else if (value >= 1) { precision = (value % 1) ? 3 : 1; }
		else { precision = (value % 1) ? 2 : 1; }

		// If decimalPlaces is specified, we force a precision on an SI Prefix number.
		if (decimalPlaces != null) {
			var prefix = d3.formatPrefix(value);
			formatted = prefix.scale(value).toFixed(decimalPlaces) + prefix.symbol;
		}
		// allow 1000 range to display normally
		else if (value >= 1000 && value < 10000) { formatted = d3.format(',.0f')(value); }
		else { formatted = d3.format('.' + precision + 's')(value); }

		// CV-537: handle really small numbers by rounding up and denoting with '<' char
		if (decimalPlaces && value < Math.pow(10, -decimalPlaces) && value > 0) {
			small = true;
			formatted = Math.pow(10, -decimalPlaces) + '';
		}
		else if (decimalPlaces == null && value < 0.01 && value > 0) {
			small = true;
			formatted = '0.01';
		}
		format = pattern.replace(/\{number\}/i, formatted)
					.replace(/\{symbol\}/i, symbol)
					.replace(/,/g, l10n.groupSeparator)
					.replace(/\./, l10n.decimalSeparator);
		if (small) { format = '<' + format; }
		return format;
	};

	/**
	 * Return value for a key in mapping
	 **/
	core._getPropMapping = function(prop) {
		return this._dataAdapter.mappings()[prop];
	};

	/**
	 * Set option value
	 **/
	core.setOption = function(name, value) {
		// To keep things sanitary, don't allow setting any option for which a default is not provided.
		if (!(name in this._options)) {
			return false;
		}

		// backwards compatibility for RS
		if ('dataAdapter' === name && 'rs2dv' === value) {
			value = 'rs';
		}

		// backwards compatibility for 'clickHandler'
		if ('clickHandler' === name) {
			this.on('click', value);
		}

		this._mergeOption(this._options, name, value);

		// Should be created in initDefaultOptions, but just in case...
		if (!this._changedOptions) {
			this._changedOptions = {};
		}

		this._changedOptions[name] = value;
		return true;
	};

	/**
	 * Get option value
	 **/
	core.getOption = function(key) {
		var options = this._options;
		if (key in options) {
			return options[key];
		}
		return null;
	};

	/**
	 * Update the options for customizing the chart
	 **/
	core.setOptions = function(options) {
		// Update chart options
		for (var k in options) {
			this.setOption(k, options[k]);
		}
	};

	/**
	 * Called before each rendering occurs. Intended as a useful method to extend.
	 * @private
	 */
	core._preRender = function(){
		this._clearErrorMessage();

		if ('autoResize' in this._changedOptions) {
			this._updateWindowResize();
		}

		if ('dataAdapter' in this._changedOptions) {
			var dataAdapterOption = this._changedOptions['dataAdapter'];

			// create a data adapter if none already exists or if its different
			if (!this._dataAdapter || (this._options.dataAdapter !== dataAdapterOption)) {
				// dataAdapterOption will be a string like 'rs'. A matching data layer should have registered itself
				// on the cloudViz.dataAdapter object.
				var adapters = cloudViz.dataAdapter[dataAdapterOption];

				if (!adapters) {
					throw new Error('No data adapters were found for data adapter type ' + dataAdapterOption);
				}

				// Find the adapter for the current visualization type. If that doesn't exist, fall back to the base
				// adapter for the given data adapter option (e.g., rs's base adapter). If that doesn't exist, fall back
				// to the base, standard data adapter. These fallbacks can be legitimate where nothing special needs to
				// happen in the data adapter layer for a given chart type so no adapter was created for the chart type.
				var adapterConstructor = adapters[this._type] || adapters['base'] || cloudViz.dataAdapter.standard.base;
				this._dataAdapter = adapterConstructor();
			}
		}

		this._dataAdapter.process(this._options, this._changedOptions);
	};

	/**
	 * Performs rendering of the visualization. Intended to be extended.
	 * @private
	 */
	core._render = function(  ) {};

	/**
	 * Called after each rendering occurs. Intended as a useful method to extend.
	 * @private
	 */
	core._postRender = function(){
		this._changedOptions = {};
	};

	/**
	 * Renders the chart. This method generally should not be overridden. Instead, override one of the methods
	 * it calls. This method is merely used as a public method that drives pre-render, render, and post-render.
	 */
	core.render = function() {
		this.reset();
		this._preRender();
		this._render();
		this._postRender();
		return this;
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.  Intended to be extended.
	 **/
	core.reset = function() { };

	/**
	 * If the autoResize option is set to true, this will attach an appropriate handler to debounced window
	 * resize events. If it's set to false, it will remove any handler previously attached.
	 * @private
	 */
	core._updateWindowResize = function() {
		if (this._options.autoResize) {
			// Although native bind is supported in all browsers that CloudViz targets, PhantomJS which runs
			// our tests does not yet: https://github.com/ariya/phantomjs/issues/10522
			this._autoResizeHandler = this._autoResizeHandler || dv.util.bind(this._onAutoResize, this);
			cloudViz.windowResize.addHandler(this._autoResizeHandler);
		} else {
			// No errors will throw if _autoResizeHandler is null or the
			// handler wasn't previously added.
			cloudViz.windowResize.removeHandler(this._autoResizeHandler);
		}
	};

	/**
	 * If the autoResize option is set to true, this function will be called when the window is resized.
	 * @private
	 */
	core._onAutoResize = function() { /* Override me */ };

	core.RESPONSIVE_WIDTH_THRESHOLD = 400; // point at which we draw a small graph vs a large one
	/**
	 * If the autoResize option is set to true, this function will be called when the window is resized.
	 * @private
	 */
	core._isSmallChart = function(width) {
		return width < core.RESPONSIVE_WIDTH_THRESHOLD;
	};

	/**
	* Displays error message
	*/
	core.handleError = function(error){
		var l10n = this._dataAdapter.l10n;
		var clientMsg = l10n.labels.core.erroronrender;
		if ('invaliddata' === error.code) {
			clientMsg = l10n.labels.core.nodata;
		}
		this._setErrorMessage(clientMsg);
		return this;
	};

	/**
	 * Displays an error message to the user instead of the visualization.
	 * @param message The error message to display to the user.
	 * @private
	 */
	core._setErrorMessage = function(message) {
		if (message && message.length) {
			d3.select(this._options.parent).html('<div class="cv-error">' + message + '</div>');
		} else {
			this._clearErrorMessage();
		}
	};

	/**
	 * Removes the error message displayed to the user if one exists.
	 * @private
	 */
	core._clearErrorMessage = function() {
		// Although we could call .html('') on the parent selection, removing the cv-error div will allow for the case
		// where the chart has been rendered before this function is called
		d3.select(this._options.parent).select('.cv-error').remove();
	};

	/**
	 * Destroys the chart
	 **/
	core.destroy = function() {
		/* Override me */
		this.reset();
		// No errors will throw if _autoResizeHandler is null or the
		// handler wasn't previously added.
		cloudViz.windowResize.removeHandler(this._autoResizeHandler);
	};

	/**
	 * Adds or removes an event callback which will be called when an event of that type is dispatched by a chart.
	 * If callback is a function, the function will be called when an eventType is dispatched. If callback is null,
	 * a previously registered callback will no longer be dispatched when the event type is called.  CloudViz event
	 * types are registered by each chart.  Events are only dispatched if the chart is `interactive`.  See the
	 * documentation on which events are dispatched by each chart type.
	 *
	 * @param eventType {String} The event key that is used to determine which event should be dispatched
	 * @param callback {?function} A function which is called by a CloudViz chart type when an event matching
	 * eventType is dispatched. If null, a previously registered callback will be deleted which stops events from
	 * being received.
	 */
	core.on = function(eventType, callback) {
		var adding = callback && dv.util.isFunction(callback);
		if (adding) {
			this._eventMap = this._eventMap || {};
			this._eventMap[eventType] = callback;
		}
		else {
			if (this._eventMap) {
				delete this._eventMap[eventType];
			}
		}
		return this;
	};

	// this will allow all other components to hook into cloudViz
	global.cloudViz = cloudViz;
	// for module loaders, hook these dependencies here (for now)
	cloudViz.d3 = d3;
	cloudViz.dv = dv;
	cloudViz.rs2dv = global.rs2dv || {}; // this should probably go in dvcore

	cloudViz.core = core;

	/**
	 * Stores or retrieves a locale definition for a given locale id. If a key is supplied, the settings
	 * for that locale and key are overwritten by the supplied definition data.
	 *
	 * @param {string} locale Locale id composed of a ISO-639 language code and a ISO-3166 country code separated by
	 * an underscore (e.g., "en-US").
	 * @param {object} [definition] The locale definition object (e.g., date formatting, number formatting, currency).
	 * @returns {object} When no definition argument is passed, the definition object for the locale id will be returned.
	 */
	cloudViz.localeDefinition = function(locale, definition, key) {
		var localeDefs, cultureCodes, localeKeys, localeDef;

		// Case insensitive locales storage and retrieval.
		locale = locale.toLowerCase();
		cloudViz._localeDefinitions = localeDefs = cloudViz._localeDefinitions || {};
		if (arguments.length > 1) {
			cultureCodes = locale.split('-');
			if (cultureCodes.length <= 1) { // Must have a valid language culture name (separated with a hyphen)
				throw new Error('A registered CloudViz locale must be a hyphenated language culture code (e.g. en-US).');
			}
			// If a definition is "en-US", an external CV user can request the definition using an underscore separated
			// locale name (e.g. "en_US") or just a language code (e.g. "en").  The caveat with just using a language
			// code is that any subsequent language code definitions will override the first (e.g. adding a "en-US"
			// definition followed by a "en-BR" definition, then requesting an "en" locale will return the "en-BR"
			// definition.
			localeKeys = [ locale, cultureCodes[0], cultureCodes.join('_') ];
			localeKeys.forEach(function(localeKey) {
				if (key == null) {
					localeDefs[localeKey] = definition;
				} else {
					localeDefs[localeKey] = localeDefs[locale] || {};
					localeDefs[localeKey][key] = definition;
				}
			});
		} else {
			localeDef = localeDefs[locale];
			if (!localeDef) {
				throw new Error('Locale definition for ' + locale + ' not found.');
			}
			return localeDef;
		}
	};

	// Handle different requires/loaders
	if ('function' === typeof define && define.amd) {
		define(function() { return cloudViz; }); // amd
	}
	else if ('undefined' === typeof exports) { global.cloudViz = cloudViz; } // browser, explicit global
	else if ('object' !== typeof module || !module.exports) { exports.cloudViz = cloudViz; } // commonjs
	else { module.exports = cloudViz; } // node
}(this));

/*global cloudviz,d3,dv*/
(function(global) {
	'use strict';

	/**
	 * Series State is a finite state machine which keeps track of the state of series in CloudViz.  It has the
	 * ability to attach event callbacks which are triggered when certain events take place on a series.
	 *
	 * Events Dispatched:
	 * 'create' : dispatched when a series state object is newly created.
	 * 'remove' : dispatched when a series state object is removed from the state list.
	 * 'enableChanged' : dispatched when a series state object is enabled or disabled.
	 */
	global.cloudViz.seriesState = function() {

		var seriesState = {}, // instance

			states = [], // List of all SeriesState objects

			stateListeners = {}; // A dictionary of callbacks registered from external consumers

		/**
		 * Checks the series states to see if a particular series should be enabled.  The combination of the id
		 * of the series is used with the seriesType given to the legend entry to determine a unique match.
		 *
		 * @param {string} seriesId The id of an individual series that is unique across states matching
		 * seriesType
		 * @param {[string]} seriesType The type of state we are looking for
		 * @return {boolean} true if the series state has been registered, matches the inputs, and is enabled.
		 * False otherwise.
		 */
		seriesState.isSeriesEnabled = function(seriesId, seriesType) {
			if (!states) { return true; } // If we don't have any states, all series are enabled.

			var i,
				length = states.length,
				state;
			for (i = 0; i < length; i++) {
				state = states[i];
				if (state.id === seriesId && state.type === seriesType) {
					return state.enabled;
				}
			}
			return false;
		};

		/**
		 * Checks the state objects to see if a series state has already been registered.
		 * @param  {string} seriesId The id of an individual series that is unique across states matching
		 * seriesType
		 * @param  {string} seriesType The type of state we are looking for
		 * @return {boolean} true if the series state has been registered and match, false otherwise.
		 */
		seriesState.doesSeriesStateExist = function(seriesId, seriesType) {
			if (!states) { return false; }

			var i,
				length = states.length,
				state;
			for (i = 0; i < length; i++) {
				state = states[i];
				if (state.id === seriesId && state.type === seriesType) {
					return true;
				}
			}
			return false;
		};

		/**
		 * Creates and returns a state object
		 *
		 * @param  {string} label The label that will be displayed to represent the series
		 * @param  {string} id A unique identifier which identifies the series object
		 * @param  {string} stateType used to identify a group of state objects that are similar
		 * @param  {boolean} enabled true if the series is enabled, false otherwise
		 * @return {{name, id, type, enabled}} a built state object
		 */
		seriesState._createStateObject = function(label, id, stateType, enabled) {
			var newObj;
			if (arguments.length < 3) {
				throw new Error('A state object requires a label and stateType.');
			}
			if (arguments.length < 4) {
				enabled = true;
			}
			newObj = { name: label, id: id, type: stateType, enabled: enabled };
			this.dispatch('create', newObj);
			return newObj;
		};

		/**
		 * Inserts a new state object at the beginning of the other states.  The order for which states are
		 * created is important for legend rendering.
		 *
		 * @param  {string} label The label that will be displayed to represent the series
		 * @param  {string} id A unique identifier which identifies the series object
		 * @param  {string} stateType used to identify a group of state objects that are similar
		 * @param  {boolean} enabled true if the series is enabled, false otherwise
		 * @return {{name, id, type, enabled}} a built state object
		 */
		seriesState.insertState = function(label, id, stateType, enabled) {
			states.unshift(this._createStateObject.apply(this, arguments));
		};

		/**
		 * Adds a new state object behind the other states.  The order for which states are created is
		 * important for legend rendering.
		 *
		 * @param  {string} label The label that will be displayed to represent the series
		 * @param  {string} id A unique identifier which identifies the series object
		 * @param  {string} stateType used to identify a group of state objects that are similar
		 * @param  {boolean} enabled true if the series is enabled, false otherwise
		 * @return {{name, id, type, enabled}} a built state object
		 */
		seriesState.appendState = function(label, id, stateType, enabled) {
			states.push(this._createStateObject.apply(this, arguments));
		};

		/**
		 * Sets whether the series state is enabled (true) or disabled (false). When the state changes, an
		 * event is dispatched to let all concerned internal components be aware.
		 * @param  {uint} stateIndex The unique index for a state in the states array
		 * @param  {boolean} enabled true if the series should be enabled, false otherwise
		 */
		seriesState.enableStateByIndex = function(stateIndex, enabled) {
			if (stateIndex < states.length) {
				var state = states[stateIndex];
				if (state.enabled !== enabled) {
					state.enabled = enabled;
					this.dispatch('enableChange', state); // Let others know when enabled changes
				}
			}
		};

		seriesState.enableStateByTypeAndId = function(stateType, stateId, enabled) {
			var i,
				length = states.length,
				state;
			for (i = 0; i < length; i++) {
				state = states[i];
				if (state.id === stateId && state.type === stateType) {
					this.enableStateByIndex(i, enabled);
				}
			}
		};

		/**
		 * Removes all states from the state array if their type matches stateType.
		 *
		 * @param  {string} stateType used to identify a group of state objects that should be removed
		 */
		seriesState.removeStatesByType = function(stateType) {
			var self = this;
			if (states && states.length) {
				states = states.filter(function(d) {
					if (d.type === stateType) {
						self.dispatch('remove', d); // Let others know when a state is removed
						return false;
					}
					return true;
				});
			}
		};

		/**
		 * Adds a event listener which can register for different types of events dispatched by a
		 * SeriesState. Multiple event handlers of the same type can be registered by using dot notation
		 * ('enableChanged.foo' and 'enableChanged.bar').
		 *
		 * Supported event types are documented at the top of this class.
		 *
		 * @param  {string} eventType The type of event that when fired will call the specified function.
		 * Dot notation can be used to add multiple handlers of the same type.  e.g. 'enableChanged.foo'
		 * and 'enabledChanged.bar' will each be called while 'enableChanged.foobar' and
		 * 'enabledChanged.foobar' would only call the latter enabledChanged.foobar function as it would
		 * overwrite the first function.
		 * @param  {function(string, SeriesState)} func A function called when an event is dispatched.  If
		 * the function is null, the event listener is removed.
		 */
		seriesState.on = function(eventType, func) {
			if (arguments.length < 1) {
				throw new Error('series state listeners require an eventType to be specified.');
			}

			var i = eventType.indexOf("."), name = "", listeners;
			if (i > 0) {
				name = eventType.substring(i + 1);
				eventType = eventType.substring(0, i);
			}

			listeners = stateListeners[eventType] || {};

			// A null function removes the listener
			if (!func) {
				delete listeners[name];
			} else {
				listeners[name] = func;
				stateListeners[eventType] = listeners;
			}
		};

		/**
		 * Dispatches an event to all callbacks registered to a particular eventType.
		 *
		 * @param  {string} eventType The type of event that will be fired
		 * @param  {SeriesState} obj The SeriesState object which changed somehow
		 */
		seriesState.dispatch = function(eventType, obj) {
			var listeners = stateListeners[eventType];
			if (listeners) {
				// Each listener in a listeners group represents the second half of the dot notation for
				// events.  See seriesState.on().
				for (var listener in listeners) {
					listeners[listener].call(this, eventType, obj);
				}
			}
		};

		/**
		 * Returns a list of all state object in the order they were added.
		 *
		 * @return {[SeriesState]} An array of SeriesState objects.
		 */
		seriesState.getStateObjects = function() {
			return states;
		};

		/**
		 * Returns true if there are some series which are disabled and false otherwise.
		 *
		 * @return {boolean}
		 */
		seriesState.areSomeSeriesDisabled = function() {
			if (!states) { return false; }
			return (Math.min.apply(null, states.map(function(s){ return +s.enabled; })) === 0);
		};

		/**
		 * Returns true if all series are disabled and false otherwise.
		 *
		 * @return {boolean}
		 */
		seriesState.areAllSeriesDisabled = function() {
			if (!states) { return false; }
			return (Math.max.apply(null, states.map(function(s){ return +s.enabled; })) === 0);
		};

		return seriesState;
	};
})(this);
/**
 * Util
 * Utility functions that are generically usable (not specific to CloudViz). They are not intended to hold state or be
 * instantiated ("newed").
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {};
	var util = cloudViz.util = cloudViz.util || {};

	/**
	 * Copies all the properties in the source objects over to the destination object and returns
	 * the destination object.  It's in-order, so the last source will override properties of the
	 * same name in previous arguments. If any property in the source object is an object itself, the object
	 * will not replace the property on the destination. Instead, its nested properties will be copied over to the
	 * same nested location on the destination object. This occurs recursively.
	 *
	 * deepExtend({ foo: { bar: 'cloud', hello: 'world' }}, { foo: { bar: 'viz' }});
	 * => { foo: { bar: 'viz', hello: 'world' }}
	 *
	 * Based on http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
	 *
	 * @param {object} dest
	 * @param {...object}
	 * @returns {object}
	 */
	util.deepExtend = function(dest) {
		var sources = Array.prototype.slice.call(arguments, 1);
		var i = -1,
			n = sources.length;
		while (++i < n) {
			var source = sources[i];
			if (source) {
				for (var prop in source) {
					if (source[prop] && source[prop].constructor && source[prop].constructor === Object) {
						dest[prop] = dest[prop] || {};
						util.deepExtend(dest[prop], source[prop]);
					} else {
						dest[prop] = source[prop];
					}
				}
			}
		}
		return dest;
	};

	/**
	 * Creates a constructor function. When called, the constructor will call init() on the new instance (if defined)
	 * with any arguments that are passed to the constructor function. The instance is then returned.
	 * @param {object} proto The object which should be used as the blueprint for new instances.
	 * @returns {Function}
	 */
	util.createConstructor = function(proto) {
		function init() {
			var instance = Object.create(proto);

			if ('function' == typeof instance.init) {
				instance.init.apply(instance, arguments);
			}

			return instance;
		}

		init.prototype = proto;

		return init;
	};

	/**
	 * Determines whether the object chain exists for a given namespace string and, if not, creates it. For example, if
	 * the namespace com.adobe.foo is provided (and no base is provided), it will look for a com attribute on the
	 * global variable. If it doesn't exist, will it create an empty object and assign it as the com attribute.
	 * It will then look for adobe attribute on global.com. If the attribute is not found, it will create
	 * an empty object and assign it as the adobe attribute on the com attribute, and so on.
	 *
	 * @param {string} namespace A string representing a namespace (e.g., com.adobe.foo)
	 * @param {object} [head] By default the namespace will be searched for on the global scope. If head is provided,
	 * the namespace will be searched for on it instead.
	 * @returns {object} The object at the tail of the namespace. Given com.adobe.foo, this would be the foo object.
	 */
	util.namespace = function(namespace, head) {
		var segments = namespace.split('.');
		var tail = head || global;
		segments.forEach(function(segment) {
			var current = tail[segment];

			if (!current) {
				current = tail[segment] = {};
			}

			tail = current;
		});
		return tail;
	};
}(this));
/**
 * CloudViz Core
 * Base object that provides common functionality across multiple DV-specific chart types (bar, line etc)
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, core = cloudViz.core || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		dvcore = Object.create(core);

	dvcore.X_AXIS_LABEL_MAXLENGTH = 25; // maximum length for a label on the x axis

	// Possible legend orientations.
	//
	// Bottom is not currently supported. If the user were to ask for an interactive legend with a bottom orientation,
	// the X axis would need to be at the top in order to look decent. However, even if a bottom orientation is
	// requested, we still do a check to see whether the legend item widths are too small for such an orientation.
	// If so, we would force the legend to be on the left to accommodate which would mean the X axis should be back at
	// the bottom. This check to see whether legend item widths are too small must occur late in the process after
	// dv has trained its scales at which point it's too late to change the X axis orientation back to the bottom.
	// Possible solutions include:
	// (1) When a particular legend orientation is requested, force that orientation regardless of whether
	// legend item widths are too small. Under this scenario, the legend position and therefore the X axis position
	// would be known up-front.
	// (2) Come up with a decent style for a bottom-oriented legend while keeping the X axis at the bottom as well.
	dvcore.LEGEND_ORIENTATIONS = ['top', 'right', 'left'];

	dvcore._chart = null; // DV chart
	dvcore.clipIdCounter = { // intentionally nested object so instances will share
		count : 0
	};
	dvcore._legend = null;
	dvcore._seriesState = null;

	dvcore.init = function(options) {
		Object.getPrototypeOf(dvcore).init.apply(this, arguments);
		this._seriesState = cloudViz.seriesState();
		return this;
	};

	dvcore._initDefaultOptions = function(defaultsToMerge) {
		var defaults = {
			aspectRatio : null, // defined aspect ratio of chart
			colors : [ // colors to use when displaying charts
				'#8cc350', // green
				'#5a6eaa', // iris
				'#d755a5', // fuchsia
				'#1ebed7', // cyan
				'#f0a01e', // tangerine
				'#9b8ce6', // periwinkle
				'#3cb5a0', // sea foam
				'#3287d2', // blue
				'#f0557d', // magenta
				'#c3d250', // chartreuse
				'#eb782d', // orange
				'#78b4f5', // sky blue
				'#5faf69', // kelly green
				'#aa5fa5', // plum
				'#fa5a50', // red
				'#f5c841' // yellow
			],
			dateGranularity : undefined, // The date granularity if the x data is time-based. Possible values are year, quarter, month, week, day, and hour. If undefined, DV will attempt to calculate a sensible granularity.
			flip : false, // flip the axis of the chart
			interactive : false, // allow user to interact with legend, use custom legend if true
			legendOrientation: null, // Allow the user to force legend positioning (top, right, bottom, left)
			legendVerticalWidth: 110, // The width the legend will take up when in interactive vertical layout.
			legendVisible: true, // If false, legends are not drawn and space is not allocated for them. If true, legends are drawn.
			targetValues: null, // An array of y intercept values for which a horizontal line is drawn across the chart for each target.
			targetLabel: undefined, // The name of the legend entry which represents the target values.
			mappings : { // base mappings for data (ex: rs2dv outputs parallel arrays in this format)

				// The value to be used along the x-axis
				// For a line/point chart, this usually equates to a range of dates/values
				// For a bar/donut chart, this usually equates to a number of categories
				x: 'x',
				// The value to be used along the y-axis
				y: 'y',
				// Unique group identifier which divides the data into separate series
				series: 'series', // ex: a12ds3
				// Human readable series name, normally the same as used by series
				// However, if your series names are more computed, this allows for a nicer name / localized name
				seriesLabel: 'series' // ex: 'Users'

			},
			plotHeight : null, // set height of the plot (doesn't affect legend) within the chart
			plotWidth : null, // set width of the plot within the chart
			preRender : null, // function that gets called right before render, passes dv chart obj
			xAxisTitle : '', // Label to be displayed on the x-axis
			yAxisTitle : '', // Label(s) to be display on the y-axis (string or 2-index array of strings)
			precision: null // Determines how many decimal points should exist after a number. If the value is undefined, CloudViz will use a default precision. This should be a positive number, but could lead to unexpected results if the desired amount of decimal places is really large.
		};

		if (defaultsToMerge) {
			this._mergeOptions(defaults, defaultsToMerge);
		}

		return Object.getPrototypeOf(dvcore)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Get the DV Chart
	 **/
	dvcore.getChart = function() {
		return this._chart;
	};

	/**
	 * External API method when enables or disables a series by index. If the index is invalid, nothing happens.
	 * If the index is valid, the series will be disabled and the legend entry (if it exists) and paths for the
	 * series will be grayed out.  The visualization may also rescale to focus on the other enabled series.
	 *
	 * @param  {uint} index The index of a state in the order it was created.
	 * @param  {boolean} enabled true if the series should be enabled, false otherwise.
	 */
	dvcore.enableSeriesByIndex = function(index, enabled) {
		this._seriesState.enableStateByIndex(index, enabled);
	};

    /**
     * Use to highlight or remove the highlight of a selection
     *
     * @param selection The d3 selection to be highlighted
     * @param enabled true will highlight the selection, false will reset it
     * @private
     */
    dvcore._highlight = function(selection, enabled) {
        selection.classed('cv-highlight', enabled);
    };

	dvcore._getYTitleFromLabels = function(labels) {
		// If we only have 1 type of label, we should label the y axis.  This is particularly
		// important in the case of interactive legends which don't show the metrics within tabs
		// because there is only one metric.  In this case there would be no way to know what
		// metric is represented by the y axis.  The y axis title is the only way to get that
		// info.
		var uniqLabels = dv.util.uniq(labels);
		if (uniqLabels && uniqLabels.length === 1) {
			return uniqLabels[0];
		}
		return null;
	};

	dvcore._preRender = function() {
		Object.getPrototypeOf(dvcore)._preRender.call(this);
		try {
			// TODO: Have data adapters validate their data independently and kick
			// a valid flag back to core
			this._createSeriesStates();
		} catch(e) {
			var error = new Error('The chart data is invalid');
			error.code = 'invaliddata';
			this.handleError(error);
		}
	};

	dvcore._postRender = function() {
		Object.getPrototypeOf(dvcore)._postRender.call(this);

		var options = this._options,
			d3Parent = d3.select(options.parent);
		this._updateYAxisHitBox(d3Parent);
		this._colorDualYAxes(options, d3Parent);
	};

	dvcore._removeYAxisHitBox = function(d3Parent) {
		d3Parent.selectAll('.axis-y .cv-axis-hitbox').remove();
	};

	dvcore._colorDualYAxes = function(options, d3Parent) {
		if (options.dualYAxis && (!this._isNormalized || !this._isNormalized()) &&
			(this._options.position === 'identity' || this._options.position === 'dodge')) {
			// Color the axis labels to match the series if it's a dual axis and not normalized -- can't be stacked/filled either
			d3Parent.selectAll('.axis-y.axis-index-0 span').style('color', options.colors[0]);
			d3Parent.selectAll('.axis-y.axis-index-1 span').style('color', options.colors[1]);
			d3Parent.selectAll('.axis-title-y.axis-title-index-0').style('color', options.colors[0]);
			d3Parent.selectAll('.axis-title-y.axis-title-index-1').style('color', options.colors[1]);
		}
	};

	/**
	 * Creates the series states which will be used to populate the legend and will dispatch events when their
	 * internal state changes.
	 */
	dvcore._createSeriesStates = function() {
		var options = this._options;

		if ('data' in this._changedOptions && this._changedOptions.data) {
			// Remove old states
			this._seriesState.removeStatesByType('standard');
			var seriesIds = this._dataAdapter.data()[this._getPropMapping('series')],
				seriesNames = this._dataAdapter.data()[this._getPropMapping('seriesLabel')];

			// Reduce the ids down to unique values and grab the corresponding names.  Ids are unique, but names don't have to be.
			if (seriesIds) {
				var seriesTypes = seriesIds.reduce(function(memo, d, i) {
						if (memo.ids.indexOf(d) < 0) {
							memo.ids.push(d);
							memo.names.push(seriesNames ? seriesNames[i] : d);
						}
						return memo;
					}, {names: [], ids: []}),
					// Need to insert new states in reverse order since we are inserting them and want them to be first in the legend etc.
					i = seriesTypes.ids.length;
				while (i--) {
					var seriesName = seriesTypes.names[i],
						seriesId = seriesTypes.ids[i];
					this._seriesState.insertState(seriesName || seriesId, seriesId, 'standard');
				}
			}
		}

		if ('targetValues' in this._changedOptions) {
			if (options.targetValues) { // Add a target series state
				// Remove previously added target states
				this._seriesState.removeStatesByType('target');
				// If the targetLabel is undefined, set it to the localized target default label.
				this._seriesState.appendState(options.targetLabel || this._dataAdapter.l10n.labels.dvcore.target, 'target', 'target');
			}
		}
	};

	dvcore._createTargetHLines = function() {
		var options = this._options,
			chart = this._chart,
			self = this;

		// The chart should already have its layers set, lets add an extra layer for hlines
		if (options.targetValues && options.targetValues.length) {
			var layers = chart.layers(),
				hline = dv.geom.hline(),
				enabled = self._seriesState.isSeriesEnabled('target', 'target'),
				hlineData = { 'y': [], 'name': [] },
				i,
				length = options.targetValues.length,
				rangePadding = [0, this._isSmallChart() ? 24 : 6];

			for (i = 0; i < length; i++) {
				hlineData.y.push(options.targetValues[i]);
			}

			hline.data(hlineData)
				.position('identity')
				.map('y', 'y', dv.scale.linear().includeInDomain(function() {
					if (!self._valuesAreFilterable()) { return true; }
					return enabled;
				})
				.rangePadding(rangePadding))
				.each('start', function(d, i) {
					d3.select(this).attr('legend-type', 'target');
				});

			// The target hlines should appear below line charts and above the other chart types
			if (this._type === 'line') {
				layers.unshift(hline);
			} else {
				layers.push(hline);
			}
			chart.layers(layers);
		}
	};

	dvcore._updateYAxisHitBox = function(d3Parent) {
		var self = this,
			options = this._options,
			panel = this._chart.facet().getPanel(0);

		// Add a hit area on axes for toggling forceZero
		if (panel) {
			var isSmall = this._isSmallChart(),
				normalized = this._isNormalized && this._isNormalized(),
				yScale = this._chart.getTrainedScale('y'),
				naturallyIncludesZero = yScale && yScale.naturalDomain()[0] <= 0,
				left = panel.bounds().left,
				top = yScale.range()[1],
				bottom = yScale.range()[0],
				yAxisParent = d3Parent.selectAll('.axes-labels .axis-y.axis-index-0'),
				hitbox = yAxisParent.selectAll('.cv-axis-hitbox').data([0]);

			if (options.interactive && !isSmall && !normalized && !naturallyIncludesZero && options.position === 'identity') {
				hitbox.enter().append('div').classed('cv-axis-hitbox', true);
				hitbox.on('click', function() {
							if (options.interactive && !isSmall) {
								self._dataAdapter._forceZero = !self._dataAdapter._forceZero;
								self._render(true);
								self._postRender();
							}
						});

				if (this._legend !== 'none' && this._legend.isVertical()) {
					left -= this._legend._getUsedWidth();
				}

				hitbox
					.style('width', left + 'px')
					.style('height', (bottom - top) + 'px')
					.style('top', top + 'px')
					.style('left', (-left) + 'px');

				hitbox.exit()
					.on('click', null);
			}
			else {
				this._removeYAxisHitBox(d3Parent);
			}
		}
		else {
			this._removeYAxisHitBox(d3Parent);
		}
	};

	/**
	 * Render the chart
	 **/
	dvcore._render = function(animate) {
		Object.getPrototypeOf(dvcore)._render.apply(this, arguments);
		var options = this._options, error;
		try {
			// Check for required options (data, parent)
			if (!this._dataAdapter.isDataValid()) {
				error = new Error('The chart data is invalid');
				error.code = 'invaliddata';
				throw error;
			}

			if (!options.parent) {
				throw new Error('The chart options did not contain a parent');
			}

			return this._draw(animate);
		} catch(e) {
			this.handleError(e);
		}
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.
	 **/
	dvcore.reset = function() {
		Object.getPrototypeOf(dvcore).reset.apply(this, arguments);
	};

	/**
	 * Destroy the chart
	 **/
	dvcore.destroy = function() {
		Object.getPrototypeOf(dvcore).destroy.apply(this, arguments);

		if (this._options && this._options.parent) {
			// dvcore charts always have a cv-wrapper around the chart
			d3.select(this._options.parent).select('.cv-wrapper').remove();
		}
		return this;
	};

	dvcore._isMappedAndExistsInData = function(prop) {
		var mapping = this._getPropMapping(prop);
		return mapping && this._options.data[mapping];
	};

	/**
	 * Set the chart's data, dimensions and parent element
	 **/
	dvcore._setChartCoreOptions = function() {
		var options = this._options, chart = this._chart, self = this,
			aspectRatio = options.aspectRatio, width = options.width,
			height = options.height, parent = d3.select(options.parent);

		chart.data(this._dataAdapter.data())
			.width((aspectRatio !== null && height !== null) ? height * aspectRatio : width)
			.height((aspectRatio !== null && width !== null) ? width / aspectRatio : height);

		if (!this._isSmallChart()) {
			var padding = { left: 10 };
			if (options.dualYAxis) {
				// make some room for the right axis labels
				padding.right = 10;
			}
			chart.padding(padding); // move left yaxis labels off left edge
		}

		// Create a wrapper container
		var container = parent.selectAll('.cv-wrapper').data([0]);
		container.enter().insert('div', ':first-child').classed('cv-wrapper', true);
		container.classed({
				'interactive': options.interactive,
				'right-overflow': (this._adjustClipWidth),
				'cv-small-chart': (this._isSmallChart())
			});
		chart.parent(container.node());

		this._legend = this._buildLegend();
		this._seriesState.on('enableChange.paths', function(eventType, state) {
			self._preRender();
			self._render(true);
			self._postRender();
			// Some geoms may change legend groups, so reset
			// TODO: Move into post render
			setTimeout(function() { // TODO: Avoid hack to set async, need post render from DV
				self._updatePathStates();
			}, 10);
		});
	};

	/**
	 * Draw the chart using customized options
	 **/
	dvcore._draw = function(a) {
		var chart = this._chart, options = this._options,
			animate = (a === undefined) ? false : a;

		if (!chart) {
			throw new Error('DV Chart was not created');
		}
		this._setChartCoreOptions();
		this._setChartTypeOptions();
		this._createTargetHLines();

		if (this._isSmallChart()) {
			this._drawSmall();
		} else {
			this._drawLarge();
		}

		if (!animate) { chart.duration(0); }
		else { chart.duration(1000); }

		this._renderChart();

		return this;
	};

	// UX background, must be called after we render
	dvcore._drawBackground = function() {
		var options = this._options;
		if (options.interactive) {
			var container = d3.select(options.parent).select('.cv-wrapper'),
				bg = container.selectAll('.cv-bg').data([0]);
			bg.enter().insert('div', ':first-child').classed('cv-bg', true);

			var chart = this._chart,
				legend = d3.select(options.parent).select('.cv-legend'),
				borderAdjust = ((this._legend !== 'none' && this._legend.isVertical()) || !legend[0][0]) ? 0 : 1, // hide top border under legend
				shadowAdjust = 1, // move height down 1 to hide axis
				padding = chart.padding(),
				lastPanelBounds = chart.facet().getPanel(chart.facet()._panels.length - 1).bounds(), // minus axis
				plotBounds = chart.plotBounds(), // actual plot bounds
				x = this._chart._legends && this._chart._legends.hasOwnProperty('_w') ? this._chart._legends._w : 0, // Offset by the width of the legend
				y = plotBounds.top - borderAdjust - padding.top,
				width = chart._calcWidth - x,
				height = (lastPanelBounds.top + lastPanelBounds.height) - plotBounds.top + borderAdjust + padding.top;

			bg.style('top', y + 'px')
				.style('left', x + 'px')
				.style('height', (height + shadowAdjust) + 'px')
				.style('width', width + 'px');

			// If legend is vertical, set a clipped height if it would be taller than the chart
			if (this._legend !== 'none' && this._legend.isVertical()) {
				var adjust = 1, // adjust for legend border
					d3Legend = d3.select(options.parent).selectAll('.cv-legend'),
					lHeight = legend[0][0] && d3Legend.node().offsetHeight || 0,
					clipped = (lHeight >= height - adjust);
				d3Legend.style('height', clipped ? (height - adjust) + 'px' : null).classed('clipped', clipped);
			}
		}
	};

	dvcore._drawClipping = function() {
		var chart = this._chart, options = this._options,
			svg = d3.select(chart._svgContainer[0][0]),
			defs = svg.selectAll('defs').data([0]);
		// verify we have a defs to contain the clip
		defs.enter().insert('defs', ':first-child');

		// Create clip svg
		// ID needs to be unique per graph so one graph doesn't use clip of another
		// Browser was lowercasing 'clipPath' so we had to add another attr (class) to key off of
		var clipId = 'cv-clip' + (this.clipIdCounter.count++),
			clip = defs.selectAll('.cv-clip').data([0]);
			clip.enter().append('clipPath').classed('cv-clip', true).append('rect');
			clip.attr('id', clipId);

		// Set up clipping
		var rect = clip.selectAll('rect'),
			padding = chart.padding(),
			lastPanelBounds = chart.facet().getPanel(chart.facet()._panels.length - 1).bounds(), // minus axis
			plotBounds = chart.plotBounds(), // actual plot bounds
			x = plotBounds.left - padding.left,
			y = plotBounds.top,
			width = plotBounds.right - x + padding.right,
			height = (lastPanelBounds.top + lastPanelBounds.height) - plotBounds.top;

		// Background has some adjustments
		if (options.interactive) {
			width -= 1; // adjust for border on bg
			height -= 1; // adjust for bottom border on bg
		}
		if (this._adjustClipHeight) {
			height += this._adjustClipHeight;
		}
		if (this._adjustClipWidth) {
			width += this._adjustClipWidth;
		}
		rect.attr('x', x).attr('y', y).attr('width', Math.max(width, 0)).attr('height', Math.max(height, 0));
		svg.selectAll('.geom').attr('clip-path', null);
		svg.selectAll('.geom:not(.no-clip)').attr('clip-path', 'url(#'+clipId+')');
	};

	dvcore._renderChart = function() {
		var self = this,
			options = this._options;

		// Allow consumer final say on render
		if('function' == typeof options.preRender) {
			options.preRender(this.getChart());
		}
		this._chart.render();
		this._drawBackground();
		this._drawClipping();
		setTimeout(function() { // TODO: Avoid hack to set async, need post render from DV
			self._updatePathStates();
		}, 10);
	};

	dvcore._onAutoResize = function() {
		this._draw(false);
	};

	// Override
	dvcore._setChartTypeOptions = function(){};
	dvcore._drawSmall = function(a){};
	dvcore._drawLarge = function(a){};

	/**
	 * Return if a chart should be rendered as small
	 **/
	dvcore._isSmallChart = function() {
		return Object.getPrototypeOf(dvcore)._isSmallChart.apply(this, [this._getChartWidth()]);
	};

	/**
	 * Get the chart's width
	 **/
	dvcore._getChartWidth = function() {
		var options = this._options;
		if (options.plotWidth !== null && !dv.util.isPercentString(options.plotWidth)) {
			return options.plotWidth;
		}
		else if (options.width !== null && !dv.util.isPercentString(options.width)) {
			return options.width;
		}

		// We are either dealing with percentages or will just use the parent width
		var parentWidth = d3.select(options.parent).node().offsetWidth;
		var parentHeight = d3.select(options.parent).node().offsetHeight;
		if (options.plotWidth !== null) {
			return parseInt(options.plotWidth, 10) / 100 * parentWidth;
		}
		else if (options.width !== null) {
			return parseInt(options.width, 10) / 100 * parentWidth;
		}
		else {
			return (options.aspectRatio !== null && parentHeight !== null) ? parentHeight * options.aspectRatio : parentWidth;
		}
	};

	/**
	 * Get the chart's height
	 **/
	dvcore._getChartHeight = function() {
		var options = this._options;
		if (options.plotHeight !== null && !dv.util.isPercentString(options.plotHeight)) {
			return options.plotWidth;
		}
		else if (options.height !== null && !dv.util.isPercentString(options.height)) {
			return options.height;
		}

		// We are either dealing with percentages or will just use the parent width
		var parentWidth = d3.select(options.parent).node().offsetWidth;
		var parentHeight = d3.select(options.parent).node().offsetHeight;
		if (options.plotHeight !== null) {
			return parseInt(options.plotHeight, 10) / 100 * parentHeight;
		}
		else if (options.height !== null) {
			return parseInt(options.height, 10) / 100 * parentHeight;
		}
		else {
			return (options.aspectRatio !== null && parentWidth !== null) ? parentWidth / options.aspectRatio : parentHeight;
		}
	};

	// Legend
	// -------

	dvcore._constructScale = function(axis, dvscale) {
		var scale = dvscale || dv.scale.linear(), options = this._options;
		if (options.interactive) { scale = this._adjustLimits(scale); }
		if (axis === 'y' && this._dataAdapter._forceZero) {
			this._applyForceZero(scale);
		}
		return scale;
	};

	dvcore._applyForceZero = function(scale) {
		scale.lowerLimit(function(min, max) { return min < 0 ? min : 0; }); // If the min lower limit would already be < 0, use it's min, otherwise use zero.
		scale.upperLimit(function(min, max) { return max > 0 ? max : 0; }); // If the max upper limit would be < 0, we need to force it to be zero.
		return scale;
	};

	dvcore._adjustLimits = function(scale) {
		// Set includeInDomain to adjust scales
		var self = this, options = this._options;
		// Map to groups and filter out disabled values
		scale.includeInDomain(function(d, i) {
			if (!self._valuesAreFilterable()) { return true; }
			return self._seriesState.isSeriesEnabled(d.data[self._legend.mapping()], 'standard');
		});
		return scale;
	};

	dvcore._valuesAreFilterable = function() {
		return (this._options.interactive &&
			this._seriesState.areSomeSeriesDisabled() &&
			!this._seriesState.areAllSeriesDisabled());
	};

	/**
	 * Gets the data and filters out non-enabled values based on legend groups
	 **/
	dvcore._getEnabledValues = function(key) {
		var self = this,
			options = this._options,
			values = this._dataAdapter.data()[this._getPropMapping(key)];
		// Handle initial all enabled state
		if (!this._valuesAreFilterable()) { return values; }
		// Map to groups and filter out disabled values
		var	mapping = this._dataAdapter.data()[this._legend.mapping()];
		values = values.filter(function(v, i) {
			return (mapping[i] && self._seriesState.isSeriesEnabled(mapping[i], 'standard'));
		});
		return values;
	};

	dvcore._updatePathStates = function() {
		var self = this,
			options = this._options,
			parent = d3.select(options.parent);
		parent.selectAll('.series [legend-group]')
			.classed('path-inactive', function() {
				if (!options.interactive) { return false; }
				var el = d3.select(this),
					seriesId = el.attr('legend-group');
				if (self._seriesState.doesSeriesStateExist(seriesId, 'standard')) {
					return !self._seriesState.isSeriesEnabled(seriesId, 'standard');
				}
				return el.classed('path-inactive'); // Return whatever it already was.
			});
		if (options.targetValues) {
			parent.selectAll('.series [legend-type]')
				.classed('path-inactive', function() {
					if (!options.interactive) { return false; }
					var el = d3.select(this),
						seriesType = el.attr('legend-type');
					if (self._seriesState.doesSeriesStateExist('target', seriesType)) {
						return !self._seriesState.isSeriesEnabled('target', seriesType);
					}
					return el.classed('path-inactive'); // Return whatever it already was.
				});
		}
	};

	/**
	 * Builds a legend for the user
	 * Defaults to a standard DV legend or custom if interactive flag is set
	 *
	 * @param {string} seriesMapKey The key to use for the legend, defaults to series
	 * @param {string} seriesLabelMapKey The key to use for the legend labels, defaults to seriesLabel
	 * @returns {object} dv.guide.legend or custom object for a custom legend
	 */
	dvcore._buildLegend = function(seriesMapKey, seriesLabelMapKey) {
		// Determine if custom labels will be needed and pass them to the builders
		var labels = null, options = this._options,
			container = d3.select(options.parent).select('.cv-wrapper'),
			seriesMapping = this._getPropMapping(seriesMapKey || 'series'),
			seriesLabelMapping = this._getPropMapping(seriesLabelMapKey || 'seriesLabel');

		// Handle custom labels for the series
		if (seriesMapping && seriesLabelMapping && seriesMapping !== seriesLabelMapping) {
			var data = this._dataAdapter.data(),
				series = data[seriesMapping],
				seriesLabels = data[seriesLabelMapping] || series;
			// We assume that the entries that the standard legend will create will remain in the same order
			// We will then map the first instance of each value to its appropriate label
			labels = [];
			series.forEach(function(v, i, a) {
				if (a.indexOf(v) === i) { // first occurance
					labels.push(seriesLabels[i]);
				}
			});
		}

		if (!options.legendVisible) {
			container.selectAll('.cv-legend').remove();
			container.selectAll('.cv-bg').remove();
			return 'none';
		}

		// Interactive custom legend
		if (options.interactive) {
			return this._buildInteractiveLegend(labels);
		} else {
			return this._buildStandardLegend(labels);
		}
	};

	/**
	 * Builds a standard dv.guide.legend
	 *
	 * @param {string} type The type of chart (bar, line, donut etc)
	 * @param {labels} array Custom labels for the legend entries or null (use series strings)
	 * @returns {object} dv.guide.legend
	 */
	dvcore._buildStandardLegend = function(labels) {
		var options = this._options,
			container = d3.select(options.parent).select('.cv-wrapper');

		this._legend = null;

		// Handle transition from interactive to not, remove old interactive legend containers
		container.selectAll('.cv-legend').remove();
		container.selectAll('.cv-bg').remove();

		// Set padding based on orientation
		var padding, orientation = this.LEGEND_ORIENTATIONS.indexOf(options.legendOrientation) > -1 ?
				options.legendOrientation : 'top';

		switch (this._calculatedLegendOrientation) {
			case 'top':
			case 'bottom':
				padding = {top: 5, bottom: 5, left: 0, right: 0};
				break;
			case 'left':
			case 'right':
				padding = {top: 0, bottom: 0, left: 5, right: 5};
				break;
		}

		var legend = dv.guide.legend().orientation(orientation).padding(padding);
		if (labels) {
			legend.labels(labels);
		}

		// Add additional padding between entries on a small chart
		if (this._isSmallChart()) {
			legend.hGap(10).vGap(2);
		}
		return legend;
	};

	/**
	 * Builds a dv.guide.custom legend using HTML. Used specifically for allowing interactivity with the chart
	 *
	 * @param {labels} array Custom labels for the legend entries or null (use series strings)
	 * @returns {object} dv.guide.custom
	 */
	dvcore._buildInteractiveLegend = function(labels) {
		var options = this._options, self = this,
			container = d3.select(options.parent).select('.cv-wrapper');

		if (!this._legend) {
			this._legend = cloudViz.interactiveLegend();
		}

		// No legend if only 1 unique metric <--- this rule has temporarily been removed. We should display a generic title instead of a legend for a single unique metric.
		var groups = this._dataAdapter.data()[this._getPropMapping('series')],
			multipleGroups = groups.some(function(name, i, names){
				return name !== names[i-1];
			});

		if (!multipleGroups) {
			this._legend.remove();
			// Remove all inactive paths
			container.selectAll('.path-inactive').classed('path-inactive', false);
			return 'none';
		}

		this._legend
			.parent(container.node())
			.orientation(options.legendOrientation)
			.chartWidth(this._getChartWidth())
			.chartHeight(this._getChartHeight())
			.chartPadding(this._chart.padding())
			.validOrientations(this.LEGEND_ORIENTATIONS)
			.legendVerticalWidth(options.legendVerticalWidth)
			.type(this._type)
			.seriesState(this._seriesState);

		if (labels) {
			// set the totals for donut charts in the legend
			if (this._getCategoryTotal) {
				this._legend.totals(labels.map(function(d) {
					return this._getCategoryTotal(d);
				}));
			}
		}

		return this._legend;
	};

	/**
	 * Provides a custom number of ticks for linear x data on the x axis. The function returned by this method is
	 * called by DV's dv.guide.axis.  DV passes the range to this function and the function returns how many ticks
	 * should be able to fit in that amount of range space. This function can be overridden for specific use-cases
	 * downstream.
	 *
	 * @return {function(number):number} A function called by dv.guide.axis which passes in the amount of space and
	 * expects a number of ticks to be returned.
	 */
	dvcore._numXTicks = function() {
		return function(range) {
			return Math.max(range / 120, 2);
		};
	};

	/**
	 * Formats the title for the y axis
	 * @param {num} - the index of which scale we are applying the format to
	 * @param {array} - an optional parameter that allows constraining the range of values for determining tick extent
	 * @returns {string} - y axis title
	 */
	dvcore._yTitleFormat = function(scaleIndex, values) {
		// TODO: scaleIndex is ignored for title
		var adapter = this._dataAdapter,
			title = adapter.yAxisTitle(),
			l10n = adapter.l10n,
			format = this._getYFormatType(scaleIndex),
			time, pattern;

		if ('time' === format) {
			if (!values) {
				values = this._getEnabledValues('y'); // If we don't have values, let's just use the default enabled values
			}
			time = this._yTimeGranularity(values, dv.guide.axis().ticks()());
			time = l10n.time.plural[time.gran];
			pattern = (title) ? l10n.labels.dvcore.yAxisTimeWithTitle: l10n.labels.dvcore.yAxisTimeNoTitle;
			title = pattern.replace(/\{time\}/i, time)
						.replace(/\{title\}/i, title);
		}
		return title;
	};

	/**
	 * Takes a passed y value and formats it based on type
	 * @param {number} - value
	 * @param {string} - format type
	 * @param {object} - optional time object
	 * @param {number} - an optional precision which will enforce the number of decimal places that will be shown on a number.
	 * @returns {string} - format type for y scale
	 */
	dvcore._formatYValue = function(value, type, time, precision) {
		if (time && time.divisor > 0) { value = value / time.divisor; }
		return this._formatNumber(type, value, precision);
	};

	/**
	 * Get the y format type for the passed scaleIndex
	 * @param {num} - the index of which scale we are applying the format to
	 * @returns {string} - format type for y scale
	 */
	dvcore._getYFormatType = function(scaleIndex) {
		var yFormats = this._dataAdapter.formats().y;
		if (!yFormats) {
			return 'decimal'; // default
		}
		if (dv.util.isArray(yFormats)) { // We have different y formats for each series
			if (!yFormats[scaleIndex]) {
				return 'decimal';
			}
			return yFormats[scaleIndex];
		}
		return yFormats; // We have the same y format for all series
	};

	/**
	 * Formats a y value for a label
	 * The main differnce is handling time values, which need to display differently
	 * based on the value rather than against a set scale like on an axis
	 * @param {num} - the index of which scale we are applying the format to
	 * @returns {function} - arguments (d, i) to format number on y axis
	 */
	dvcore._yLabelFormat = function(scaleIndex) {
		var type = this._getYFormatType(scaleIndex),
			adapter = this._dataAdapter,
			opts = this._options,
			self = this;
		return function(d, i) {
			var str, time, l10n = adapter.l10n.time;
			if ('time' === type) {
				time = adapter.getTimeGranularity(d, true); // convert to milliseconds
				l10n = (1 !== +d) ? l10n.plural : l10n.singular;
			}
			str = self._formatYValue(d, type, time, opts.precision);
			if (time && time.gran) { // add time postfix
				str += ' ' + l10n[time.gran];
			}
			return str;
		};
	};

	/**
	 * Formats the label for a tick on the y axis
	 * @param {num} - the index of which scale we are applying the format to
	 * @param {array} - an optional parameter that allows constraining the range of values for determining tick extent
	 * @returns {function} - arguments (d, i) to format number on y axis
	 */
	dvcore._yTickFormat = function(scaleIndex, values) {
		var self = this,
			type = this._getYFormatType(scaleIndex),
			opts = this._options,
			time;
		if ('time' === type) {
			if (!values) {
				// If we don't have values, let's just use the default enabled values
				values = this._getEnabledValues('y');
			}
			time = self._yTimeGranularity(values, dv.guide.axis().ticks()());
		}
		return function(d, i) {
			if (!d) { return ''; } // The baseline y axis shouldn't show.
			return self._formatYValue(d, type, time, opts.precision);
		};
	};

	/**
	 * Takes a range of values in seconds and defines the granularity for the y tick marks
	 * Also determines the divisor to apply to seconds to get the correct value
	 * @returns {obj} - { gran : 'day', divisor : '36000' }
	 */
	dvcore._yTimeGranularity = function(values, ticks) {
		// handle undefined/null in values
		values = values && values.filter(function(v) { return isFinite(v); }) || [];
		ticks = ticks || 1; // don't accept even 0
		if (!values.length) { return null; } // not valid
		var max = Math.max.apply(null, values), min = Math.min.apply(null, values),
			arr = d3.scale.linear().domain([min, max]).ticks(ticks),
			diff = arr.length ? (arr.length > 1) ? arr[1] - arr[0] : max - arr[0] : max,
			step = arr.length ? (diff / arr.length) : diff;
		return this._dataAdapter.getTimeGranularity(step);
	};

	// X Axis Time (Line, Bar)
	// -------

	dvcore._xTickAnchor = function(chart) {
		return function(d, i, n) {
			var xScale = chart.getTrainedScale('x'),
				xRange = dv.util.scaleRange(xScale), // Get xScale.range() if continuous and xScale.rangeExtent() if ordinal
				insetWidth = 20; // within this distance from edge we inset the label

			// Convert the tick value into range space.
			// xScale.rangeBand() will be zero if the scale is continuous.
			// Otherwise, it represents the full width of the "band" so we'll divide by 2 to get the center.
			var labelXPos = xScale.mapValue(d) + xScale.rangeBand() / 2;
			if (labelXPos - xRange[0] < insetWidth) {
				return 'start';
			}
			if (xRange[1] - labelXPos < insetWidth) {
				return 'end';
			}
			return 'middle';
		};
	};

	// Check to see if we're normalized, and if so adjust the axis so we don't show a secondary axis and change the axis title to
	// "normalized" (Line, Bar)
	// -------

	dvcore._checkNormalized = function() {
		var chart = this._chart, l10n = this._dataAdapter.l10n;
		// Normalized, remove all yaxis
		if (this._isNormalized && this._isNormalized()) {
			chart.guide('y', 'none', 1);
			chart.guide('y', dv.guide.axis().ticks(0)
				.tickFormat(function(d, i) { return ''; }) // hide y axis labels
				.title(l10n.labels.core.normalized)
			);
			chart.padding({});
		}
	};

	/**
	 * Formats a date according to a format template. This takes date localization settings into account.
	 *
	 * @param {date} date The date to format.
	 * @param {string} template A format template string following d3.js conventions:
	 * https://github.com/mbostock/d3/wiki/Time-Formatting
	 * @param {string} granularity of the time in the chart
	 * @returns {string} The formatted date string.
	 * @private
	 */
	dvcore._formatTime = function(date, template, gran) {
		// d3's API for localizing dates is quite limited at the moment. It requires you to pre-compile different
		// versions of d3--one for each locale you'd potentially like to use. We'd like it to make it so users can
		// define or override the locale formatting at runtime. In order to do so, we have to seek through the
		// formatting template looking for the tokens that require localization (like months and weekdays) and perform
		// the formatting for those tokens OUTSIDE of d3. The rest of the formatting template we run through d3.
		//
		// This follows a similar approach to the way d3 performs the operation with a few tweaks.
		// One of the tweaks is we're using string concatenation instead of filling an array and joining because
		// it's faster: http://jsperf.com/array-join-vs-string-connect

		var l10n = this._dataAdapter.l10n.calendar;

		var formatters = {
			a: function(d) { // Abbreviated weekday name
				return l10n.weekdayAbbreviations[d.getDay()];
			},
			A: function(d) { // Full weekday name
				return l10n.weekdays[d.getDay()];
			},
			b: function(d) { // Abbreviated month name
				return l10n.monthAbbreviations[d.getMonth()];
			},
			B: function(d) { // Full month name
				return l10n.months[d.getMonth()];
			},
			p: function(d) { // AM/PM
				return l10n.ampm[Math.floor(d.getHours() / 12)];
			}
		};

		var string = '', i = -1, j = 0, n = template.length;

		var addSkipped = function() {
			var skipped = template.substring(j, i);
			if (skipped.length) {
				string += d3.time.format(skipped)(date);
			}
		};

		while (++i < n) {
			if (template.charCodeAt(i) == 37) {
				var token = template.charAt(i + 1);
				var tokenFormatter = formatters[token];

				if (tokenFormatter) {
					addSkipped();
					string += tokenFormatter(date);
					i++;
					j = i + 1;
				}
			}
		}

		addSkipped();

		// Strip leading zeros from hour format
		// TODO: Should this only be for EN locale?
		if ('hour' === gran && 0 === string.indexOf('0')) {
			string = string.slice(1);
		}

		return string;
	};

	dvcore._timeGranTemplate = function(gran, format) {
		var t;
		switch(gran) {
			case 'hour' : t = format.hour; break;
			case 'day' : t = format.day; break;
			case 'week' : t = format.week; break;
			case 'month' : t = format.month; break;
			case 'quarter' : t = format.quarter; break;
			case 'year' : t = format.year; break;
			default : t = format.fallback; break;
		}
		return t;
	};

	dvcore._timeSmallXFormat = function() {
		var self = this, adapter = self._dataAdapter,
			format = adapter.l10n.dateFormat.fullFormat;

		return function(d, i) {
			return self._formatTime(d, format.condensed);
		};
	};

	dvcore._timeXTickFormat = function(validTickFunc) {
		var self = this, options = self._options,
			chart = this._chart, adapter = self._dataAdapter,
			prevTick = new Date(0),
			prevGranLabel = '',
			prevSwitchLabel = '',
			date = adapter.l10n.dateFormat, switchFormat = date.mediumFormat,
			gran = adapter ? adapter.dateGranularity() : '*',
			granTemplate = this._timeGranTemplate(gran, date.shortFormat);

		return function(d, i) {
			var template, granLabel, switchLabel, label;

			// Always show secondary line template if start is inset
			if (0 === i) {
				// always reset the prevTick so when render is called multiple times
				// it doesn't use the last tick date to compare against the first
				prevTick = new Date(0);
				prevGranLabel = null;
				prevSwitchLabel = null;
			}

			// If a validation function was passed in, run it against this particular label to see if it should
			// be rendered, otherwise just render an empty string (no label).
			if (validTickFunc && !validTickFunc.call(this, d, i)) {
				return '';
			}

			if ('hour' === gran && prevTick.getDate() !== d.getDate()) { // day changed
				template = switchFormat.day;
			}
			if (('day' === gran || 'week' === gran) && prevTick.getMonth() !== d.getMonth()) { // month changed
				template = switchFormat.month;
			}
			if (('month' === gran || 'quarter' === gran) && prevTick.getYear() !== d.getYear()) { // year changed
				template = switchFormat.year;
			}

			prevTick = d;
			granLabel = self._formatTime(d, granTemplate, gran);

			// Determine if we need a second line
			if (template) {
				switchLabel = '<br/>' + self._formatTime(d, template);
			} else {
				// CV-543: Require a second row so we don't crop the tooltip
				switchLabel = '<br/>&nbsp;';
			}

			// Don't show a redundant label
			if (granLabel === prevGranLabel &&
					(switchLabel === prevSwitchLabel ||
						!template)) { // If we don't have a template, we didn't have a second line of labels
				label = '';
			} else {
				label = (switchLabel) ? granLabel + switchLabel : granLabel;
			}

			prevGranLabel = granLabel;
			prevSwitchLabel = switchLabel;
			return label;
		};
	};

	global.cloudViz.dvcore = dvcore;
}(this));

/**
 * Centralized debouncing of window resize events.
 */
(function(global) {
	'use strict';

	var enabled,
		handlers = [];

	var debounce = function(fn, timeout) {
		var timeoutID = -1;
		return function() {
			if (timeoutID > -1) {
				window.clearTimeout(timeoutID);
			}
			timeoutID = window.setTimeout(fn, timeout);
		};
	};

	var debouncedHandler = debounce(function() {
		handlers.forEach(function(handler) {
			handler();
		});
	}, 30);

	/**
	 * Register a handler that will be called when the window resizes.
	 * @param handler
	 */
	var addHandler = function(handler) {
		if (handlers.indexOf(handler) == -1) {
			handlers.push(handler);
		}

		if (!enabled) {
			window.addEventListener('resize', debouncedHandler);
			enabled = true;
		}
	};

	/**
	 * Unregisters a handler from being called when the window resizes.
	 * @param handler
	 */
	var removeHandler = function(handler) {
		var index = handlers.indexOf(handler);
		if (index > -1) {
			handlers.splice(index, 1);
		}

		if (handlers.length === 0 && enabled) {
			window.removeEventListener('resize', debouncedHandler);
			enabled = false;
		}
	};

	global.cloudViz.windowResize = {
		addHandler: addHandler,
		removeHandler: removeHandler
	};
}(this));

/**
 * Line Chart
 * A chart that can show progression of data over any linear ordinal metric (time, revenue, etc)
 * Parameters
 * options: customization parameters for the line chart
 * options are defined in the core object, line specific are below in 'Line Options'
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, dvcore = cloudViz.dvcore || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		line = Object.create(dvcore),
		timeoutId = -1;

	line.init = function(options) {
		Object.getPrototypeOf(line).init.apply(this, arguments);

		this._type = 'line';
		this._chart = dv.chart();
		this._displayPoints = null;
		this._adjustClipHeight = 6;
		this._adjustClipWidth = 6;
		this._minTrendTickSpace = 135;
		this._showRibbons = false;
		this._uniqueGroups = null;
		return this;
	};

	line._initDefaultOptions = function() {
		var defaults = {
			// All series have their own y-scale if true
			normalized: false,
			// The area under the geom is colored
			filled: false,
			// The position of the geoms
			position: 'identity',
			// Make the bottom of the y axis always be zero
			forceZero: null,
			// Set the geoms in the chart to each have a y axis. max of 2
			dualYAxis: false,
			// Show anomalies in the line chart using a ribbon
			showAnomalies: false,
			mappings: {
				// upper edge of the ribbon
				upperRangeBand: 'upper',
				// lower edge of the ribbon
				lowerRangeBand: 'lower',
				// NOTE: Setting the ribbon anomaly mappings (upperRangeBand, lowerRangeBand)
				// will turn off filled if set
				// dotted line designating forecasted data inside a ribbon
				// forecast requires that there be bands set
				forecast: 'forecast'
			},
			formats: { // The format each series should be displayed with.  Options are decimal (default), percent, currency, time.
				x: 'decimal',
				y: 'decimal' // The y format can also be an array of formats for each individual series.
			}
		};
		return Object.getPrototypeOf(line)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.
	 **/
	line.reset = function() {
		Object.getPrototypeOf(line).reset.apply(this, arguments);

		// Remove the behaviors and mouse events we may have added with the inspector.
		var options = this._options;
		var d3Parent = d3.select(options.parent);
		d3Parent.selectAll('.behavior').text('');
		d3Parent.selectAll('.behavior-under-geom').text('');
		this._chart.on('mousemove.inspector', null);
		this._chart.on('mouseout.inspector', null);
		// remove second y-axis
		d3Parent.selectAll('.axis-y.axis-index-1').remove();
	};

	/**
	 * Common draw method for all lines
	 **/
	line._setChartTypeOptions = function() {
		var chart = this._chart, options = this._options, self = this,
			layers = [
				dv.geom.line()
					.each('start', function(d, i) {
						d3.select(this).attr('legend-group', d[0]['stroke']);
					})
					.map('stroke', this._getPropMapping('series'), dv.scale.color().values(options.colors))
			];

		this._uniqueGroups = dv.util.uniq(chart.data()[this._getPropMapping('series')]);

		// Ribbons should only be drawn if there is only one series (group) and mappings exist for upperRangeBand and lowerRangeBand.
		this._showRibbons = (this._uniqueGroups.length == 1 &&
			this._isMappedAndExistsInData('upperRangeBand') &&
			this._isMappedAndExistsInData('lowerRangeBand'));

		// Draw upper and lower bounds as a ribbon to denote margin of error in a forecast.
		if (this._showRibbons) {
			// shift to bottom layer
			layers.unshift(
				dv.geom.ribbon()
					.map('yMin', this._getPropMapping('lowerRangeBand'))
					.map('yMax', this._getPropMapping('upperRangeBand'))
					.set('alpha', 0.15)
					.interpolate('cardinal')
			);
			options.filled = false;
		}

		if (this._showRibbons && this._isMappedAndExistsInData('forecast')) {// check upper and lower bounds
			layers.push(
				dv.geom.line()
					.map('y', this._getPropMapping('forecast'))
					.set('alpha', 0.5)
					.set('linetype', 'dotted')
					.interpolate('cardinal')
			);
		}

		if (options.filled) {
			layers.push(
				// A baseline of undefined makes it so an area chart isn't forced to have a specific baseline (zero by default).
				// Undefined baseline causes the chart to use the min domain value as the baseline.
				dv.geom.area().baseline(undefined)
					.each('start', function(d, i) {
						d3.select(this).attr('legend-group', d[0]['fill']);
					})
					.map('fill', this._getPropMapping('series'), dv.scale.color().values(options.colors))
					.set('alpha', 0.2)
			);
		}

		var pointGeom =
			dv.geom.point()
				.map('stroke', this._getPropMapping('series'), dv.scale.color().values(options.colors))
				.set('fill', '#fff')
				.set('size', 7);

		// Needs to be on top of filled
		layers.push(pointGeom);

		var groupMapping = this._getPropMapping('group') || this._getPropMapping('series');
		chart.layers(layers)
			.guide('stroke', this._legend)
			.map('group', groupMapping)
			.set('linetype', function(d, i, j) {
				return (/::incomplete::$/).test(d.data[groupMapping]) ? '0,4,7,0' : 'solid';
			})
			.position(options.position);

		// Show a point for each data point on the line if the data density is not too high.
		pointGeom.each('start', function(d, i) {
			d3.select(this).classed('point-hidden', !self._shouldDisplayPoint.call(self, d))
				.attr('legend-group', d['stroke'])
				.classed('line-point', true); // line-points are styled a little differently than scatterplot or bubble points.
		});

		this._addBehaviors(chart, options);
		this._mapPositionScales(chart, options);
	};

	// Show points if enough space or on a ribbon if its outside the band
	line._shouldDisplayPoint = function(d) {
		return (this._showRibbons) ? this._isAnomalousDataPoint(d) : this._shouldDisplayPoints();
	};

	// We show points for each data point if >= 60px spaced
	line._shouldDisplayPoints = function() {
		// cache
		if (this._displayPoints !== null) { return this._displayPoints; }
		var options = this._options, chart = this._chart, array = chart.layers()[1]._nestData,
			max = Math.max.apply(null, array.map(function(d) { return d.values.length; } )),
			range = chart.getTrainedScale('x').range();

		// range 1 - 0 is the plot width (rather than the chart width).
		// If there is more than 60 pixels between points, we should display points.
		return this._displayPoints = (options.showAnomalies && this._showRibbons) || (((range[1] - range[0]) / max) >= 60);
	};

	/**
	 * Returns true if a point should be displayed in a ribbon chart
	 * This occurs when the point is outside the band range in the ribbon chart
	 */
	line._isAnomalousDataPoint = function(d) {
		return (d.data[this._getPropMapping('y')] > d.data[this._getPropMapping('upperRangeBand')] || d.data[this._getPropMapping('y')] < d.data[this._getPropMapping('lowerRangeBand')]);
	};

	/**
	 * Adds custom interactive behaviors to the chart.
	 */
	line._addBehaviors = function(chart, options) {
		var self = this,
			d3Parent = d3.select(options.parent),
			adapter = this._dataAdapter,
			xFormat = adapter.formats().x;

		// The chart must not be small and must be interactive in order to receive an inspector.
		if (options.interactive) {
			chart.behaviors([
				dv.behavior.inspector()
					.gutterPadding(0)
					.orientation('bottom')
					.thickness(2)
					.label(function(d) {
						// Format the label as a full date if it's a trend.  Otherwise, format it as a number.
						if (adapter.isOvertime()) {
							var gran = adapter.dateGranularity(),
								format = adapter.l10n.dateFormat.fullFormat;
							return self._formatTime(d, self._timeGranTemplate(gran, format), gran);
						}
						return self._formatNumber(xFormat, d, options.precision);
					})
					.inspectorMove(function(lbl, index, xPos, val) {
						var colorScale = chart.getTrainedScale('stroke')[0];
						self._highlightHoveredPoints.call(self, d3Parent, val, colorScale);

						// Hide the x axis labels and titles while the inspector is visible.
						d3Parent.selectAll('.axis-x .axis-label').style('opacity', 0);
						d3Parent.selectAll('.axis-x-title').style('opacity', 0);
						d3Parent.selectAll('.text-geom').style('opacity', 0);

						if (self._eventMap['mouseover']) {
							self._eventMap['mouseover'].call(this, lbl, index, xPos, val, d3.event);
						}
					})
					.inspectorOut(function() {
						var colorScale = chart.getTrainedScale('stroke')[0];
						self._highlightHoveredPoints.call(self, d3Parent, null, colorScale);

						// Show the x axis labels and titles while the inspector is hidden.
						d3Parent.selectAll('.axis-x .axis-label').style('opacity', 1);
						d3Parent.selectAll('.axis-x-title').style('opacity', 1);
						d3Parent.selectAll('.text-geom').style('opacity', 1);

						if (self._eventMap['mouseout']) {
							self._eventMap['mouseout'].call(this, d3.event);
						}
					})
					.underGeoms(true)
			]);
		}
	};

	/**
	 * Highlights points with the inspector over them.
	 * This function also updates the legend to show the highlighted values.
	 * If xPoint is null, no points are highlighted.
	 */
	line._highlightHoveredPoints = function(parent, xPoint, colorScale) {
		var legendValues = {},
			self = this,
			seriesNames = colorScale.domain(),
			opts = this._options;

		// Style the highlighted points and unstyle and non-highlighted points.
		parent.selectAll('.line-point')
			.each(function(d) {
				var d3Element = d3.select(this),
					color = colorScale.mapValue(d.stroke),
					isSelected = self._dataValuesEqual.call(self, d.x, xPoint),
					datum = d3Element.datum();

				// If the point geom is normally hidden, display it if its selected
				d3Element.classed('point-hidden', isSelected ? false : !self._shouldDisplayPoint.call(self, d));

				// Update the point geom to its default styles or to the selected styles
				// if selected, its being displayed on the inspector line
				d3Element
					.style('fill', isSelected ? color : '#FFF')
					.style('opacity', isSelected ? 1 : '');

				// Build up a map of legend values and formats we can use to set numbers in each legend entry.
				if (isSelected) {
					legendValues[d3Element.attr('legend-group')] = { yVal: datum.y, scaleIndex: seriesNames.indexOf(d.stroke) };
				}
			});

		// Display highlighted values in the legend.
		parent.selectAll('.cv-legend-entry')
			.each(function(d) {
				var key = d.id,
					valueObj = legendValues[key],
					num = d3.select(this).select('.cv-legend-num');

				// If we don't have a value object for this legend entry, it's meant to be blank.
				if (!valueObj) { return num.text(''); }

				// Pull out the format which matches the scaleIndex of the axis.
				var format = self._getYFormatType(valueObj.scaleIndex),
					value = valueObj.yVal, text;

				// Modify time to show in an easier to read gran/format
				if ('time' === format) {
					var l10n = self._dataAdapter.l10n,
						timeGran = self._yTimeGranularity(
							self._dataAdapter.getUniqueStrokeExtentByStroke(key),
							dv.guide.axis().ticks()()),
						time = l10n.time.plural[timeGran.gran],
						pattern = l10n.labels.dvcore.legendTime;

					if (timeGran && timeGran.divisor > 0) { value = value / timeGran.divisor; }
					text = pattern.replace(/\{time\}/i, time)
								.replace(/\{value\}/i, self._formatNumber(format, value, opts.precision));
				} else {
					text = self._formatNumber(format, value, opts.precision);
				}

				num.text(text);
			});
	};

	/**
	 * Determine if data values are equivalent.  If it's a trend we compare milliseconds of the date.
	 */
	line._dataValuesEqual = function(a, b) {
		if (!a || !b) { return false; }
		if (this._dataAdapter.isOvertime() && a.getTime() === b.getTime()) { return true; }
		return a === b; // Equality check for numbers. Returns false here if a.getTime doesn't equal b.getTime as date object refs won't match.
	};

	line._mapPositionScales = function(chart, options) {
		var rangePadding = [0, this._isSmallChart() ? 24 : 6],
			scale = this._constructScale('y').rangePadding(rangePadding),
			strokeMapping = this._getPropMapping('series'),
			yMapping = this._getPropMapping('y'),
			xMapping = this._getPropMapping('x'),
			self = this;

		// Filled charts should scale to zero by default
		if (self._dataAdapter._forceZero === null && options.filled) {
			self._dataAdapter._forceZero = true;
			this._applyForceZero(scale);
		}

		// If we have a dual y axis, let's use the same scale for the left axis for the right axis but give them
		// different includeInDomain functions to train the scales differently.
		if (options.normalized || (options.dualYAxis && (options.position === 'identity' || options.position === 'dodge'))) {
			var uniqueGroups = self._dataAdapter.uniqueStrokeValues();
			// create a includeInDomain for each series
			uniqueGroups.forEach(function(g, index) {
				var strokeScale = (0 === index) ? scale : scale.copy();
				strokeScale.includeInDomain(function(d, i) {
					return d.data[strokeMapping] === self._dataAdapter.uniqueStrokeValues()[index];
				});
				if (index > 0) { chart.map('y', yMapping, strokeScale, index); }
			});
		} else {
			// TODO: We don't currently have a way of explicitly removing a scale in DV. So we reach in and see if there
			// is a yScales object and delete the 2nd index (1) which contains information for training the secondary axis
			// scale.  This will need to be fixed eventually in DV.  DV should delete any scale not mapped to a particular
			// axis.
			var yScales = chart.getExplicitScalesMap().y;
			if (yScales) { delete yScales[1]; }
		}

		var xScale = this._dataAdapter.isOvertime() ? dv.scale.time() : dv.scale.linear();
		xScale.rangePadding([10, 10]);

		chart.map('y', yMapping, scale, 0);
		chart.map('x', xMapping, this._constructScale('x', xScale));
	};

	line._xTickFormat = function() {
		var self = this,
			adapter = this._dataAdapter,
			opts = this._options,
			format = adapter.formats().x;
		return function(d, i) {
			return self._formatNumber(format, d, opts.precision);
		};
	};

	line._drawSmall = function() {
		var options = this._options, chart = this._chart, self = this,
			yExtent = this._computeExtents(),
			dateExtent = d3.extent(this._getEnabledValues('x')),
			yFormat = this._getYFormatType(0),
			yLabelFormat = function(d, i) {
				return d ? self._formatNumber(yFormat, d, options.precision) : '0';
			},
			xAxis = dv.guide.axis()
				.tickSize(0)
				.title(this._dataAdapter.xAxisTitle())
				.tickDy(yExtent.y.length > 1 ? -26 : -14)
				.tickAnchor(function(d, i) { return i > 0 ? 'end' : 'start'; }),
			yAxis = dv.guide.axis().ticks(2).title(this._dataAdapter.yAxisTitle()),

			// If showFullAxis is true, we don't use the high/low point geom, we use a y axis instead.
			showFullAxis = options.dualYAxis || (options.position === 'stack' && this._uniqueGroups.length > 1);

		if (!showFullAxis) {
			var layers = [
				dv.geom.point()
					.data(yExtent)
					.set('stroke', 'none')
					.map('y', 'y', dv.scale.linear())
					.map('x', 'x', this._dataAdapter.isOvertime() ? dv.scale.time() : dv.scale.linear())
					.each('start', function(d, i) {
						var colorScale = d.panel.getTrainedScale('fill')[0],
							el = d3.select(this);
						el.style('fill', colorScale.mapValue(d.data.fill))
							.attr('legend-group', d.data.fill);
					})
					.map('group', 'fill')
					.set('size', 6),
				dv.geom.text()
					.data(yExtent)
					.set('stroke', 'none')
					.map('y', 'y', dv.scale.linear())
					.map('x', 'x', this._dataAdapter.isOvertime() ? dv.scale.time() : dv.scale.linear())
					.each('start', function(d, i) {
						var colorScale = d.panel.getTrainedScale('fill')[0],
							el = d3.select(this);
						el.style('fill', colorScale.mapValue(d.data.fill))
							.attr('legend-group', d.data.fill);

						if (this.parentNode) {
							d3.select(this.parentNode.parentNode).classed('no-clip', true).attr('clip-path', null);
						}
					})
					.map('group', 'fill')
					.set('size', '11px')
					.set('label', function(d, i, j) {
						var seriesDomain = d.panel.getTrainedScale('fill')[0].domain(),
							seriesIndex = seriesDomain.indexOf(d.data.fill),
							lbl = self._yTickFormat(seriesIndex)(d.y);
						if ('time' === yFormat) {
							// add the time gran to the label
							var time = self._yTimeGranularity(self._getEnabledValues('y'), dv.guide.axis().ticks()());
							lbl += ' ' + self._dataAdapter.l10n.time.plural[time.gran]; // localize
						}
						return lbl;
					})
					.textAnchor(function(d, i) {
						return d.data && d.data.anchor || 'middle';
					})
					.dy(function(d, i) {
						return (yExtent.y.length === 1 || d.y === yExtent.y[1]) ? -8 : 15;
					})
					.dx(function(d, i) {
						return (d.data && d.data.anchor == 'end') ? 3 : 0;
					})
			];
			chart.layers(chart.layers().concat(layers));
		}

		chart.map('fill', this._getPropMapping('series'), dv.scale.color().values(options.colors));

		if (this._dataAdapter.isOvertime()) {
			xAxis.tickValues(dateExtent).tickFormat(self._timeSmallXFormat());

			if (showFullAxis) {
				yAxis.tickFormat(this._yTickFormat(0));
			} else {
				yAxis.tickFormat(function() { return ''; });
			}
		} else {
			if (options.dualYAxis) {
				// Add a secondary y axis oriented right.  Inset the labels on both axes, and place the labels above the ticks.
				var yAxis2 = dv.guide.axis().tickFormat(this._yTickFormat(1)).orientation('right').tickSize(15).tickDy(-8).tickAnchor('end').tickDx(4).ticks(3);
				yAxis.tickSize(15).tickDy(-8).tickAnchor('start').tickDx(4).ticks(3);
				chart.guide('y', yAxis2, 1);
			} else {
				var xExtent = d3.extent(this._dataAdapter.data()[this._getPropMapping('x')]);
				xAxis.tickValues(xExtent).tickFormat(this._xTickFormat());
				yAxis.tickFormat(this._yTickFormat(0));
				chart.guide('y', 'none', 1);
			}
		}

		chart.guide('x', xAxis).guide('y', yAxis);

		this._checkNormalized();
	};

	/**
	 * Overrides the default behavior in dvcore to provide a custom number of ticks for time series data on the x axis.
	 * The function returned by this method is called by DV's dv.guide.axis.  DV passes the range to this function and
	 * the function returns how many ticks should be able to fit in that amount of range space.
	 *
	 * @return {function(number):number} A function called by dv.guide.axis which passes in the amount of space and
	 * expects a number of ticks to be returned.
	 */
	line._numXTicks = function() {
		var self = this;
		// If we're overtime, calculate x ticks differently than the default
		if (this._dataAdapter.isOvertime()) {
			var points = this._chart._data[this._getPropMapping('x')].length;

			return function(range) {
				var ticks = 0;
				// Determine the number of ticks with a minimum size
				// Max number of ticks is the number of points
				// We need at least 2 ticks (one for each end)
				var size = Math.max(range / points, self._minTrendTickSpace);
				return Math.max(Math.min(Math.floor(range / size), points), 2);
			};
		}
		// Use the default if the x axis isn't overtime
		return Object.getPrototypeOf(line)._numXTicks.call(this);
	};

	line._drawLarge = function() {
		var options = this._options, chart = this._chart,
			d3Parent = d3.select(options.parent),
			useSecondAxisLabelForArrow = false,
			uniqueStrokeExtent0 = this._dataAdapter.getUniqueStrokeExtent(0),
			uniqueStrokeExtent1 = this._dataAdapter.getUniqueStrokeExtent(1),
			yTickFormatFunc,
			xAxis = dv.guide.axis().ticks(this._numXTicks()).title(this._dataAdapter.xAxisTitle()).tickDy(-8).tickAnchor(this._xTickAnchor(chart)),
			yAxis = dv.guide.axis().htmlLabels(true);

		if (this._dataAdapter.isOvertime()) {
			xAxis.tickFormat(this._timeXTickFormat()).htmlLabels(true);
		} else {
			xAxis.tickFormat(this._xTickFormat());
		}

		if (options.dualYAxis && (options.position === 'identity' || options.position === 'dodge')) {
			yTickFormatFunc = this._yTickFormat(0, uniqueStrokeExtent0);
			yAxis.title(this._yTitleFormat(0, uniqueStrokeExtent0));

			// Add a secondary y axis oriented right.  Make the ticks extend a few pixels in.
			var yAxis2 = dv.guide.axis().tickFormat(this._yTickFormat(1, uniqueStrokeExtent1)).title(this._yTitleFormat(1, uniqueStrokeExtent1)).orientation('right').tickSize(15);
			yAxis.tickSize(15);
			chart.guide('y', yAxis2, 1);
		}
		else {
			yTickFormatFunc = this._yTickFormat(0);
			yAxis.title(this._yTitleFormat(0));
			chart.guide('y', 'none', 1); // Clear out secondary axis
		}

		yAxis.tickFormat(function(d, i) {
				var d3Element = d3.select(this),
					yScale = yAxis._scale();
				// Our bottom-most label doesn't touch the baseline, let's draw an awesome arrow.
				// We'll draw a label on the 2nd y axis label if the bottom-most label overlaps the baseline and would look odd.
				if (yScale instanceof dv.scale.linear && d > 0 && (i === 0 || (i === 1 && useSecondAxisLabelForArrow))) {
					// Would the arrow collide with the bottom of the plot? We only care if this is interactive. Non-interactive chart don't have a border to collide with.
					if (yScale.mapValue(d) < yScale.range()[0] - 10 || !options.interactive) {
						d3Element.classed('arrow-container', true);
					}
					else {
						useSecondAxisLabelForArrow = true;
						d3Element.classed('arrow-container', false);
						return '';
					}
				}
				else {
					d3Element.classed('arrow-container', false);
				}
				return yTickFormatFunc.call(this, d, i);
			});

		chart.guide('x', xAxis).guide('y', yAxis);

		this._checkNormalized();
	};

	line._preRender = function() {
		Object.getPrototypeOf(line)._preRender.call(this);
		this._displayPoints = null; // reset flag
	};

	line._computeExtents = function() {
		var i = -1, options = this._options,
			yTuple = this._getEnabledValues('y'),
			xTuple = this._getEnabledValues('x'),
			strokeTuple = this._getEnabledValues('series'),
			n = yTuple.length,
			extent = {
				x: [undefined, undefined],
				y: [undefined, undefined],
				fill: [undefined, undefined],
				anchor: [undefined, undefined]
			}, xLowerLimit = null, xUpperLimit = null;
		xTuple.forEach(function(v, i) {
			xLowerLimit = (xLowerLimit === null || xLowerLimit > v) ? v : xLowerLimit;
			xUpperLimit = (xUpperLimit === null || xUpperLimit < v) ? v : xUpperLimit;
		});
		// todo: also we would need to determine if the lower/upper for the x were set hard rather than based on data
		while (++i < n) {
			var yVal = yTuple[i],
				xVal = xTuple[i],
				color = strokeTuple ? strokeTuple[i] : options.colors[0];
			if (extent.y[0] === undefined || yVal < extent.y[0]) {
				extent.y[0] = yVal;
				extent.x[0] = xVal;
				extent.fill[0] = color;
				extent.anchor[0] = ( +xVal == +xLowerLimit ) ? 'start' : ( +xVal == +xUpperLimit ) ? 'end' : 'middle' ;
			}
			if (extent.y[1] === undefined || yVal > extent.y[1]) {
				extent.y[1] = yVal;
				extent.x[1] = xVal;
				extent.fill[1] = color;
				extent.anchor[1] = ( +xVal == +xLowerLimit ) ? 'start' : ( +xVal == +xUpperLimit ) ? 'end' : 'middle' ;
			}
		}

		// if the lower limit is zero, don't display it.
		if (extent.y[0] === 0) {
			extent.y.splice(0, 1);
			extent.x.splice(0, 1);
			extent.fill.splice(0, 1);
			extent.anchor.splice(0, 1);
		}
		return extent;
	};

	line._isNormalized = function() {
		var options = this._options,
			tooManySeries = this._isSmallChart() ? 1 : 2;
		return options.normalized || (options.dualYAxis && this._dataAdapter.uniqueStrokeValues().length > tooManySeries && (options.position === 'identity' || options.position === 'dodge'));
	};

	global.cloudViz.line = cloudViz.util.createConstructor(line);
}(this));

/**
 * Scatter Plot Chart
 * A scatter plot shows points across multiple metrics/labels
 * Parameters
 * options: customization parameters for the point chart
 **/
(function (global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, dvcore = cloudViz.dvcore || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		point = Object.create(dvcore);


	point.init = function (options) {
		Object.getPrototypeOf(point).init.apply(this, arguments);

		this._type = 'point';
		this._chart = dv.chart();
		return this;
	};

	/**
	 * Returns the currently selected points
	 *
	 * @returns {Array}
	 */
	point.getSelected = function () {
		var selectedPoints = [],
			selected = d3.select(this._options.parent).selectAll('.point-geom.cv-highlight');
		selected.each(function (point) {
			selectedPoints.push(point);
		});
		return selectedPoints;
	};

	/**
	 * Selects and highlights the points that match the given selector function
	 *
	 * @param selectedIds
	 * @returns {point}
	 */
	point.setSelected = function (selectorFn) {
		var self = this,
			selectedPoints = [],
			selected = d3.select(this._options.parent).selectAll('.point-geom').filter(selectorFn);
		selected.each(function (point) {
			selectedPoints.push(point);
		});
		self._selectPoints(selectedPoints);
		return self;
	};

	/**
	 * Highlights the given selection
	 *
	 * @param selection
	 * @returns {point}
	 * @private
	 */
	point._selectPoints = function (selection, policy) {
		var self = this;
        if (!policy || !policy.accumulate )
        {
            if (!policy || selection.length !==0 )
            {
                d3.select(self._options.parent).selectAll('.point-geom').each(function (d) {
                    if (selection.indexOf(d) >= 0) {
                        self._highlight(d3.select(this), true);
                    } else {
                        self._highlight(d3.select(this), false);
                    }
                });
            }
            else if( policy.noneSelected === "selectAll")
            {
                self._highlight(d3.select(self._options.parent).selectAll('.point-geom'), true);
            }
        } else if (policy.action === "add")
        {
            d3.select(self._options.parent).selectAll('.point-geom').each(function (d) {
                if (selection.indexOf(d) >= 0) {
                    self._highlight(d3.select(this), true);
                }
            });
        }
        else if (policy.action === "remove")
        {
            d3.select(self._options.parent).selectAll('.point-geom').each(function (d) {
                if (selection.indexOf(d) >= 0) {
                    self._highlight(d3.select(this), false);
                }
            });
        }

		return self;
	};

	point._initDefaultOptions = function () {
		var defaults = {
			mappings: {
				// The value to be used as the size of the point if its a bubble
				size: 'size'
			},
			// Label to be used to designate what the size represents (bubble)
			// If left blank, size will not be used (scatterplot)
			sizeTitle: '',
			formats: { // The format each series should be displayed with.  Options are decimal (default), percent, currency, time.
				x: 'decimal',
				y: 'decimal', // The y format can also be an array of formats for each individual series.
				size: 'decimal'
			},
			selectionEnabled: false, // set the select brush on or off
			selectPolicyCB: function(){return {"start":null,"end":null,"move":null};}, // select Policy call back
			tooltipContent: null // a function which will be called when a tooltip is shown. Should return an HTML formatted string which will be displayed in the chart.
		};
		return Object.getPrototypeOf(point)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Common draw method for all point charts
	 **/
	point._setChartTypeOptions = function () {
		var chart = this._chart, options = this._options, layers = [],
			self = this;

		// Create each of the point geoms
		// Attach legend-group to tie them to a specific series for later interactivity
		layers[0] = dv.geom.point()
			.each('start', function (d, i) {
				// Data here is the translated DV object, so use fill which will equate to series
				d3.select(this).attr('legend-group', d['fill']);
			});

		// Construct the mappings for each aesthetic
		// Add a legend for the series
		chart.layers(layers)
			.map('x', this._getPropMapping('x'), this._constructScale('x')
				.rangePadding([this._isSmallChart() ? 10 : 20, this._isSmallChart() ? 10 : 20]))
			.map('y', this._getPropMapping('y'), this._constructScale('y')
				.rangePadding([this._isSmallChart() ? 10 : 20, this._isSmallChart() ? 10 : 20]))
			.map('fill', this._getPropMapping('series'), dv.scale.color().values(options.colors))
			.guide('fill', this._legend)
			.padding({ left: 10 });

		// Set the size relative to the value if its a bubble chart, otherwise its static
		if (this._dataAdapter.isBubble()) {
			layers[0].map('size', this._getPropMapping('size'), dv.scale.linear().to([9, 60]));
		} else { // otherwise a scatterplot, style them a little differently
			layers[0].set('size', 10).set('alpha', 0.6);
		}

		this._addBehaviors(chart, layers[0], options);
	};

	/**
	 * Adds custom interactive behaviors to the chart.
	 */
	point._addBehaviors = function (chart, geom, options) {
		var d3Parent = d3.select(options.parent), timer, self = this,
			yFormat = this._getYFormatType(),
			addMetricValue = function (d, scale, format, title) {
				if (!d.data.hasOwnProperty(scale.mapping())) {
					return '';
				}
				return '<span class="metric-value">' + format(d.data[scale.mapping()]) + '</span><span class="metric-name">' + title + '</span>';
			},
			selectionBrush = function (type, extent, brush) {
				var newSelectionPoints = [];
				d3.select(options.parent).selectAll(".point-geom").each(function (d, i) {
					if (extent[0][0] <= d.x && extent[1][0] >= d.x && extent[0][1] <= d.y && extent[1][1] >= d.y) {
						if (self._seriesState.isSeriesEnabled(d.data.group, 'standard') ||
							self._seriesState.isSeriesEnabled(d.data[self._getPropMapping('series')], 'standard')) { // If point is visible
							newSelectionPoints.push(d);
						}
					}
				});

				var selectPolicy = self._options.selectPolicyCB.call();

				self._selectPoints(newSelectionPoints, selectPolicy[type]);

				if (self._eventMap['selectionStart'] && type === 'start') {
					self._eventMap['selectionStart'].call(self, newSelectionPoints);
				}

				if (self._eventMap['selectionEnd'] && type === 'end') {
					self._eventMap['selectionEnd'].call(self, newSelectionPoints);
				}
			};

		if (options.selectionEnabled) {
			chart.behaviors([
				dv.behavior.brush().brushStart(selectionBrush).brushMove(selectionBrush).brushEnd(selectionBrush)
			]);
		} else {
			chart.behaviors([]);
		}

		// The chart must not be small and must be interactive in order to receive an inspector.
		if (!this._isSmallChart() && options.interactive) {
			geom.behaviors([
				dv.behavior.voronoiRollover()
					.pointDetectionRadius(25)
					.content(function (d, i, j) {
						if (options.tooltipContent) {
							return options.tooltipContent.call(this, d, i, j);
						}

						var seriesGroup = this.__geom.getExplicitScale('group'),
							x = d.panel.xScale(d),
							y = d.panel.yScale(d),
							xGuide = this._xGuides[x.scaleIndex()],
							yGuide = this._yGuides[y.scaleIndex()],
							l10n = self._dataAdapter.l10n,
							xTickFormat = (xGuide.__scale && xGuide.tickFormat() ? xGuide.tickFormat() : String),
							yTickFormat = function (d) {
								return self._formatNumber(yFormat, d, options.precision); // allow 0, as opposed to yGuide
							},
							content = addMetricValue(d, y, yTickFormat, self._dataAdapter.yAxisTitle() || l10n.labels.point.yScale) +
								addMetricValue(d, x, xTickFormat, self._dataAdapter.xAxisTitle() || l10n.labels.point.xScale);

						if (self._dataAdapter.isBubble()) {
							var size = d.panel.getTrainedScale('size')[0];
							content += addMetricValue(d, size, String, self._dataAdapter.sizeMetricName() || l10n.labels.point.sizeScale);
						}

						if (seriesGroup && seriesGroup.mapping()) {
							content = '<span class="series-name">' + d.data[seriesGroup.mapping()] + '</span>' + content;
						}

						return content;
					})
					.mouseOver(function (d, i, j, ev) {
						clearTimeout(timer);
						d3Parent.selectAll('.point-geom')
							.classed('cv-medium-duration', false)
							.classed('cv-unselected', function (pointD) {
								return d !== pointD;
							});
						d3Parent.selectAll('.cv-legend-marker')
							.classed('unselected', function (legendD) {
								return legendD !== d.fill;
							})
							.classed('cv-medium-duration', false);

						if (self._eventMap['mouseover']) {
							self._eventMap['mouseover'].call(this, d, i, j, ev);
						}
					})
					.mouseOut(function (d, i, j, ev) {
						timer = setTimeout(function () { // Don't use d3 transitions here.  They can override transitions that occur when moving/sizing a point which makes them freeze in place.
							d3Parent.selectAll('.point-geom')
								.classed('cv-unselected', false)
								.classed('cv-medium-duration', true);
							d3Parent.selectAll('.cv-legend-marker')
								.classed('unselected', false)
								.classed('cv-medium-duration', true);

							if (self._eventMap['mouseout']) {
								self._eventMap['mouseout'].call(this, d, i, j, ev);
							}
						}, 400);
					})
			]);
		}
	};

	point._drawSmall = function () {
		var chart = this._chart,
			xExtent = d3.extent(this._getEnabledValues('x')),
			self = this,
			adapter = this._dataAdapter,
			opts = this._options,
			xFormat = adapter.formats().x,
			yFormat = this._getYFormatType();

		chart.guide('x', dv.guide.axis().tickSize(0).tickValues(xExtent).title(this._dataAdapter.xAxisTitle()).tickFormat(function (d) {
				return self._formatNumber(xFormat, d, opts.precision);
			}).tickAnchor(function (d, i) {
				return i > 0 ? 'end' : 'start';
			}))
			.guide('y', dv.guide.axis().ticks(2).title(this._dataAdapter.yAxisTitle()).tickDy(-8).tickFormat(function (d) {
				return !d ? '' : self._formatNumber(yFormat, d, opts.precision);
			}));
	};

	point._drawLarge = function () {
		var chart = this._chart,
			numYTicks = function (range) {
				return Math.max(2, Math.min(5, range / 70));
			},
			self = this,
			adapter = this._dataAdapter,
			opts = this._options,
			xFormat = adapter.formats().x,
			yFormat = this._getYFormatType();

		chart.guide('x', dv.guide.axis().ticks(this._numXTicks()).title(this._dataAdapter.xAxisTitle()).tickFormat(function (d) {
				return self._formatNumber(xFormat, d, opts.precision);
			}))
			.guide('y', dv.guide.axis().ticks(numYTicks).title(this._dataAdapter.yAxisTitle()).tickDy(-8).tickFormat(function (d) {
				return !d ? '' : self._formatNumber(yFormat, d, opts.precision);
			}));
	};

	point._postRender = function () {
		Object.getPrototypeOf(point)._postRender.call(this);
		var options = this._options, chart = this._chart,
			rightPadding = 5,
			container = d3.select(options.parent).select('.cv-wrapper'),
			label = container.selectAll('.cv-bubble-size-metric').data([0]);
		if (this._dataAdapter.sizeMetricName()) {
			label.enter().append('div').classed('cv-bubble-size-metric', true).html('<span>' + this._dataAdapter.sizeMetricName() + '</span>  <i></i> &ndash; <i></i>');
			setTimeout(function () {
				// Will break on multiple facets (but this should be done in DV anyway)
				var padding = chart.padding(),
					lastPanelBounds = chart.facet().getPanel(chart.facet()._panels.length - 1).bounds(), // minus axis
					plotBounds = chart.plotBounds(), // actual plot bounds
					span = label.selectAll('span'),
					width = plotBounds.right + padding.right,
					height = lastPanelBounds.top + lastPanelBounds.height,
					x = width - label.node().offsetWidth - rightPadding,
					y = height - label.node().offsetHeight;
				label.style('top', y + 'px').style('left', x + 'px');
			}, 300);


		} else {
			label.remove();
		}
	};

	global.cloudViz.point = cloudViz.util.createConstructor(point);
}(this));
/**
 * Bar Chart
 * A bar chart shows bar plots with multiple series across categories
 * Parameters
 * options: customization parameters for the bar chart
 * options are defined in the core object, bar specific are below in 'Bar Options'
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, dvcore = cloudViz.dvcore || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		bar = Object.create(dvcore);

	bar.init = function(options) {
		Object.getPrototypeOf(bar).init.apply(this, arguments);

		this._type = 'bar';
		this._chart = dv.chart();
		this._minTickSpace = 60;
		return this;
	};

	bar._initDefaultOptions = function() {
		var defaults = {
			// All series have their own y-scale if true
			normalized: false,
			position: 'dodge',
			dualYAxis: false,
			clickHandler: null, // Deprecated... please use .on('click', function) instead.
			formats: { // The format each series should be displayed with.  Options are decimal (default), percent, currency, time.
				x: 'decimal',
				y: 'decimal' // The y format can also be an array of formats for each individual series.
			},
			tooltipContent : null // a function which will be called when a tooltip is shown. Should return an HTML formatted string which will be displayed in the chart.
		};

		return Object.getPrototypeOf(bar)._initDefaultOptions.call(this, defaults);
	};

	bar.reset = function() {
		Object.getPrototypeOf(bar).reset.apply(this, arguments);

		var options = this._options,
			d3Parent = d3.select(options.parent);
		d3Parent.selectAll('.axis-y.axis-index-1').remove();
	};

	/**
	 * Common draw method for all bar charts
	 **/
	bar._setChartTypeOptions = function() {
		var chart = this._chart, options = this._options;

		chart.layers([
				dv.geom.bar()
					.each('start', function(d, i) {
						// Data here is the translated DV object, so use fill which will equate to series
						d3.select(this).attr('legend-group', d['fill']);
					})
			])
			.map('fill', this._getPropMapping('series'), dv.scale.color().values(options.colors))
			.guide('fill', this._legend)
			.position(options.position)
			.coord(dv.coord.cartesian().flip(options.flip));

		// handle clicks if a callback is passed in
		chart._layers[0].on('click', this._eventMap['click'] ? this._eventMap['click'] : null);

		this._addBehaviors(chart.layers()[0], options);
		this._mapPositionScales(chart, options);
	};

	bar._mapPositionScales = function(chart, options) {
		var isSmall = this._isSmallChart(),
			rangePadding = [0, isSmall ? 10 : 15],
			scale = this._applyForceZero(this._constructScale('y')).rangePadding(rangePadding),
			fillMapping = this._getPropMapping('series'),
			yMapping = this._getPropMapping('y'),
			xMapping = this._getPropMapping('x'),
			xInnerPadding = isSmall ? 0.8 : Math.min(0.6, Math.max(0.05, this._getChartWidth() / 4000)),
			xOuterPadding = isSmall ? 0 : 0.5,
			self = this;

		if (options.normalized || (options.dualYAxis && (this._options.position === 'identity' || this._options.position === 'dodge'))) {
			var uniqueGroups = self._dataAdapter.uniqueFillValues();
			// create a includeInDomain for each series
			uniqueGroups.forEach(function(g, index) {
				var fillScale = (0 === index) ? scale : scale.copy();
				fillScale.includeInDomain(function(d, i) {
					return d.data[fillMapping] === self._dataAdapter.uniqueFillValues()[index];
				});
				if (index > 0) { chart.map('y', yMapping, fillScale, index); }
			});
		} else {
			// TODO: We don't currently have a way of explicitly removing a scale in DV. So we reach in and see if there
			// is a yScales object and delete the 2nd index (1) which contains information for training the secondary axis
			// scale.  This will need to be fixed eventually in DV.  DV should delete any scale not mapped to a particular
			// axis.
			var yScales = chart.getExplicitScalesMap().y;
			if (yScales) { delete yScales[1]; }
		}
		chart.map('y', yMapping, scale, 0);
		chart.map('x', this._getPropMapping('x'), dv.scale.ordinal().padding(xInnerPadding).outerPadding(xOuterPadding).reverse(options.flip));
	};

	/**
	 * Adds custom interactive behaviors to the chart.
	 */
	bar._addBehaviors = function(geom, options) {
		var d3Parent = d3.select(options.parent),
			timer, adapter = this._dataAdapter,
			self = this;

		// The chart must not be small and must be interactive in order to receive an inspector.
		if (!this._isSmallChart() && options.interactive) {
			geom.behaviors([
				dv.behavior.rollover()
					.orientation(options.flip ? 'top' : 'right')
					.content(function(d, i, j) {
						if (options.tooltipContent) {
							return options.tooltipContent.call(this, d, i, j);
						}
						var seriesGroup = this.__geom.getExplicitScale('group'),
							y = d.panel.yScale(d),
							valueFormat = self._yLabelFormat(y.scaleIndex()),
							content = '<span class="metric-value">' + valueFormat(d.y) +
								'</span><span class="metric-name">' + d.data[self._getPropMapping('seriesLabel')] + '</span>',
							gran = adapter.dateGranularity(),
							format = adapter.l10n.dateFormat.fullFormat,
							xLabel = dv.util.isDate(d.x) ? self._formatTime(d.x, self._timeGranTemplate(gran, format), gran) : d.x;

						if (seriesGroup && seriesGroup.mapping()) {
							content = '<span class="series-name">' + xLabel + '</span>' + content;
						}

						return content;
					})
					.showTooltip(function(d, i, j, ev, behavior) {
						var el = d3.select(this);

						// Only active bars can show a tooltip.
						if (!el.classed('path-inactive')) {
							behavior._showTip.call(this, d, i, j, behavior);
							clearTimeout(timer);
							d3Parent.selectAll('.bar-geom')
								.classed('cv-medium-duration', false)
								.classed('cv-unselected', function(pointD) { return d !== pointD; });
							d3Parent.selectAll('.cv-legend-marker')
								.classed('unselected', function(legendD) { return legendD !== d.fill; })
								.classed('cv-medium-duration', false);

							if (self._eventMap['mouseover']) {
								self._eventMap['mouseover'].call(this, d, i, j, ev);
							}
						}
					})
					.hideTooltip(function(d, i, j, ev, behavior) {
						var el = d3.select(this);

						// Only active bars can hide the tooltip.
						if (!el.classed('path-inactive')) {
							behavior._removeTip.call(this, d, i, j, behavior);
							timer = setTimeout(function() { // Don't use d3 transitions here.  They can override transitions that occur when moving/sizing a bar which makes them freeze in place.
								d3Parent.selectAll('.bar-geom')
									.classed('cv-unselected', false)
									.classed('cv-medium-duration', true);
								d3Parent.selectAll('.cv-legend-marker')
									.classed('unselected', false)
									.classed('cv-medium-duration', true);

								if (self._eventMap['mouseout']) {
									self._eventMap['mouseout'].call(this, d, i, j, ev);
								}
							}, 400);
						}
					})
			]);
		}
	};

	bar._drawSmall = function() {
		var chart = this._chart, options = this._options, xAxis,
			threshold = (options.flip) ? undefined : 10,
			self = this;
		if (options.flip) {
			xAxis = dv.guide.axis()
						.tickDx(function(d, i) { return d3.select(this).select('span').node().offsetWidth; })
						.tickDy(function(d, i) { return -d3.select(this).select('span').node().offsetHeight; })
						.tickSize(0);
		} else {
			xAxis = dv.guide.axis().tickSize(0).tickDy(function(d, i) { return (i % 2 === 0) ? -8 : -26; });
		}

		if (this._dataAdapter.isOvertime()) {
			xAxis.tickValues(d3.extent(this._dataAdapter.data()[this._getPropMapping('x')]))
				.tickFormat(self._timeSmallXFormat())
				.tickAnchor(function(d, i) { return i > 0 ? 'end' : 'start'; })
				.tickDy(-8);
		} else {
			xAxis.tickFormat(function(d, i){ return self._truncateLabel(d, threshold); });
		}

		chart.guide('x', xAxis.title(this._dataAdapter.xAxisTitle()))
			.guide('y', dv.guide.axis().ticks(0).tickSize(0).tickFormat(function(d, i) { return ''; }).title(this._dataAdapter.yAxisTitle()));

		this._checkNormalized();
	};

	bar._drawLarge = function() {
		var chart = this._chart, options = this._options, self = this,
			numYTicks = function(range) { return Math.max(2, Math.min(5, range / 75)); },
			xAxis = dv.guide.axis().tickSize(0),
			yAxis = dv.guide.axis().ticks(numYTicks),
			yAxis2;

		if (options.dualYAxis && (this._options.position === 'identity' || this._options.position === 'dodge')) {
			var uniqueFillExtent0 = self._dataAdapter.getUniqueFillExtent(0),
				uniqueFillExtent1 = self._dataAdapter.getUniqueFillExtent(1);
			yAxis.tickSize(15).tickFormat(this._yTickFormat(0, uniqueFillExtent0)).title(this._yTitleFormat(0, uniqueFillExtent0));
			yAxis2 = dv.guide.axis().ticks(numYTicks).tickFormat(this._yTickFormat(1, uniqueFillExtent1)).title(this._yTitleFormat(1, uniqueFillExtent1)).orientation('right').tickSize(15);
			chart.guide('y', yAxis2, 1);
		} else {
			yAxis.tickFormat(this._yTickFormat(0)).title(this._yTitleFormat(0));
			chart.guide('y', 'none', 1);
		}

		if (options.flip) {
			xAxis.tickDx(-10);
		} else {
			xAxis.tickDy(function(d, i) { return (i % 2 === 0) ? -8 : -26; });
			yAxis.tickDx(-10);
			if (yAxis2) { yAxis2.tickDx(-10); }
		}

		if (this._dataAdapter.isOvertime()) {
			// Only used on histogram, so we assume x is a date object
			var dates = {}, points = 0;
			chart._data[this._getPropMapping('x')].forEach(function(d, i) {
				if ( !dates[+d] ) {
					points++;
					dates[+d] = 1;
				}
			});
			xAxis.tickDy(-8).tickFormat(this._timeXTickFormat(points)).htmlLabels(true);
		} else {
			xAxis.tickFormat(function(d, i){ return self._truncateLabel(d); });
		}

		chart.guide('x', xAxis.title(this._dataAdapter.xAxisTitle()))
			.guide('y', yAxis);

		this._checkNormalized();
	};

	// Indicates whether a label is valid and therefore should be shown or not. This is done by roughly
	// estimating whether labels would collide and if they would we drop some.
	bar._timeXTickValidator = function(points) {
		var self = this;
		return function(d, i) {
			var xScale = self._chart.getTrainedScale('x'),
				xRange = dv.util.scaleRange(xScale),
				width = xRange[1] - xRange[0],
				minTickWidth = Math.ceil(self._minTickSpace / (width / points));
			return i % minTickWidth === 0;
		};
	};

	bar._timeXTickFormat = function(points) {
		return Object.getPrototypeOf(bar)._timeXTickFormat.call(this, this._timeXTickValidator(points));
	};

	bar._isNormalized = function() {
		var options = this._options,
			tooManySeries = this._isSmallChart() ? 1 : 2;
		return options.normalized || (options.dualYAxis && this._dataAdapter.uniqueFillValues().length > tooManySeries && (options.position === 'identity' || options.position === 'dodge'));
	};

	global.cloudViz.bar = cloudViz.util.createConstructor(bar);
}(this));
/**
 * Donut Chart
 * A donut chart shows a bar chart in polar coordinates (pie chart) with an inner radius
 * The donut's slices are the categories/filters and each are displayed in a legend
 * Each donut represents a single metric
 * Parameters
 * options: customization parameters for the bar chart
 * options are defined in the core object, donut specific are below in 'Donut Options'
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, dvcore = cloudViz.dvcore || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		donut = Object.create(dvcore);

	donut.init = function(options) {
		Object.getPrototypeOf(donut).init.apply(this, arguments);

		this._type = 'donut';
		this._chart = dv.chart();
		return this;
	};

	donut._initDefaultOptions = function() {
		var defaults = {
			maxSlices: 6, // maximum number of slices shown, if more aggregate x+ into other category
			innerRadius: '45%', // radius to white out in the middle of the pie chart
			outerRadius: '35%', // radius to white out on the edge of the screen
			clickHandler: null, // Deprecated... please use .on('click', function) instead.
			formats: { // The format each series should be displayed with.  Options are decimal (default), percent, currency, time.
				x: 'decimal',
				y: 'decimal' // The y format can also be an array of formats for each individual series.
			},
			tooltipContent : null // a function which will be called when a tooltip is shown. Should return an HTML formatted string which will be displayed in the chart.
		};
		return Object.getPrototypeOf(donut)._initDefaultOptions.call(this, defaults);
	};

	donut._buildLegend = function() {
		var self = this,
			options = this._options,
			legend = Object.getPrototypeOf(donut)._buildLegend.call(this, 'x', 'x');

		// Set labels data, determine our current state
		this._dataAdapter.processLabelData(legend);

        if (legend !== 'none') {
            // legend
            if (this._dataAdapter.numberOfFacets() == 1) {
				var legendValues = this._dataAdapter.labelData().cvtextvallabel.map(function(d, i) {
					return self._yLabelFormat(0)(d);
				});
                legend.values(legendValues);
            }
            // Add some extra padding to the bottom of the non-interactive legend so it doesn't interfere with facet labels
            if (!options.interactive && (!options.legendOrientation || options.legendOrientation === 'top')) {
                legend.padding({ 'bottom': 20 });
            }
        }

		return legend;
	};

	/**
	 * Sums the values of all the categories of the donut and formats it
	 * This value is normally displayed in the middle of the chart
	 * @param {string} series
	 * @returns {string} formatted sum value
	 * @private
	 */
	donut._getSeriesTotal = function(series) {
		var adapter = this._dataAdapter, data = adapter.data(),
			values = data[this._getPropMapping('y')],
			labels = data[this._getPropMapping('series')],
			i, ii = labels.length, total = 0;
		for (i=0; i<ii; ++i) {
			if (labels[i]+'' === series+'') {
				total += values[i];
			}
		}
		return total;
	};



	/**
	 * Creates the series states which will be used to populate the legend and will dispatch events when their
	 * internal state changes.
	 */
	donut._createSeriesStates = function() {
		// TODO: We shouldn't override dvcore._createSeriesStates(), but we have to. The reason this is done is because the 'series'
		// and 'seriesLabel' properties are actually referring to the facets and not the series labels represented in the legend. In
		// reality, we should have 'facet' and 'facetLabel' mappings.  Right now the 'x' property mapping is what I have to use, but
		// there is no corresponding 'id' so uniqueness can't be guaranteed.  There is probably a bug if I have two donut series
		// called "Page Views" for instance.  If we make sure that 'series' and 'seriesLabel' refer to the actual series, then donut
		// will match how all other chart types are working currently.  Then this override is redundant.
		//
		// When this happens we can also get rid of the call for legend.mapping() which grabs the scale we are using to determine
		// grouping (identifing series).  At that point, this._getPropMapping('seriesLabel') should give us the appropriate mapping
		// and we can remove legend.mapping().
		var options = this._options;

		if ('data' in this._changedOptions && this._changedOptions.data) {
			// Remove old states
			this._seriesState.removeStatesByType('standard');
			var seriesNames = dv.util.uniq(this._dataAdapter.data()[this._getPropMapping('x')]);
			// Need to insert new states in reverse order since we are inserting them and want them to be first in the legend etc.
			var i = seriesNames.length;
			while (i--) {
				var seriesName = seriesNames[i];
				this._seriesState.insertState(seriesName, seriesName, 'standard');
			}
		}

		if ('targetValues' in this._changedOptions) {
			if (options.targetValues) { // Add a target series state
				// Remove previously added target states
				this._seriesState.removeStatesByType('target');
				// If the targetLabel is undefined, set it to the localized target default label.
				this._seriesState.appendState(options.targetLabel || this._dataAdapter.l10n.labels.dvcore.target, 'target', 'target');
			}
		}
	};

	/**
	 * Sums the value of a category
	 * This value is normally displayed in the legend of a single metric chart
	 * This method is called from dvcore's legend code
	 *
	 * @param {string} category
	 * @returns {string} formatted sum value
	 * @private
	 */
	donut._getCategoryTotal = function(cat) {
		// We only show totals in the legend if there is only a single donut in the chart.
		if (this._dataAdapter.numberOfFacets() !== 1) { return ''; }

		var data = this._dataAdapter.data(),
			values = data[this._getPropMapping('y')],
			cats = data[this._getPropMapping('x')],
			i, ii = cats.length, total = 0;
		for (i=0; i<ii; ++i) {
			if (cats[i]+'' === cat+'') {
				total += values[i];
			}
		}
		return total;
	};

	/**
	 * Determine if the labels for the categories should be hidden
	 *
	 * @returns {boolean} true to hide
	 * @private
	 */
	donut._shouldHideLabels = function(d) {
		var panelBounds = d.panel.bounds();
		return d.y <= 0.05 || (Math.min(panelBounds.width, panelBounds.height) / 2 < 80);
	};

	/**
	 * Common draw method for all donuts
	 **/
	donut._setChartTypeOptions = function() {
		var chart = this._chart,
			adapter = this._dataAdapter,
			options = this._options,
			d3Parent = d3.select(options.parent),
			self = this, colors = options.colors.slice(0);

		if (options.interactive) {
			chart.padding({ 'top': 10 });
		}

		// add other
		if (adapter.showOtherCategory()) {
			colors.splice(options.maxSlices - 1, 0, '#ccc');
		}

		var layers = [
				dv.geom.bar()
					.position('fill')
					.set('stroke', '#fff')
					.each('start', function(d, i) {
						d3.select(this).attr('legend-group', d['fill']);
					})
				];

		// handle clicks if a callback is passed in
		layers[0].on('click', this._eventMap['click'] ? this._eventMap['click'] : null);

		var labelData = self._dataAdapter.labelData();
		layers.push(
			dv.geom.text().data(labelData)
				.map('label', 'cvtextperclabel')
				.set('stroke', 'none')
				.position('fill')
				.textAnchor(function(d, i) {
					var val = (d.y0 + d.y / 2) * 100;
					// hacking the starting position
					if ( val < 50 ) { return 'start'; }
					if ( val > 50 ) { return 'end'; }
					return 'middle';
				})
				.each('start', function(d, i) {
					d3.select(this)
						.classed('slice-label', true)
						.classed('hidden', self._shouldHideLabels.call(self, d))
						.attr('dy', '.35em') // Vertically center the label
						.attr('legend-group', d['fill']);
				})
				// TODO: Fix in DV. When applying the hidden class in .each('start'), there is a slight flicker due to the class being applied
				// on the subsequent frame.  DV might need to make .each('start') synchronous to get past this.
				//
				// Until then, I'm having to apply the alpha and then add !important tags in CSS to override the inline `opacity: 0` style.
				.set('alpha', function(d, i, j) {
					return self._shouldHideLabels.call(self, d) ? 0 : 1;
				})
				.dx(function(d, i) {
					var xrange = d.panel.xOuterScale().range(),
						xDist = xrange[1] - xrange[0],
						radius = xDist ? xDist / 2 : 0,
						outerRadius = dv.util.getPercentValue(options.outerRadius, radius),
						padding = 30, // manual adjusting to get labels further outside the donut
						val = (d.y0 + d.y / 2) * 100;

					// position is adding to a calculated percentage
					// radius gets us to 100% aka on the edge of the visible donut
					// outerRadius moves us into the middle of the outerRadius
					return radius + outerRadius - padding;
				})
				.dy(function(d, i) { // Tweak the rotation of the label so it doesn't get obscurred by a tooltip.
					var position = -d.panel._bounds.width / 2 * d.y,
						val = (d.y0 + d.y / 2) * 100;

					// Add some linear smoothing to the top and bottom centers. The closer we get to the center,
					// the greater the adjustment. It should probably be exponential, but this looks pretty good.
					// Another approach would be to measure the labels and offset them, but I think this might
					// incur more overhead than its worth.
					if (val < 10) {
						position -= (10 - val) / 2;
					}
					if (val > 90) {
						position += (10 - (100 - val)) / 2;
					}
					if (val <= 50 && val > 40) {
						position += (10 - (50 - val)) / 2;
					}
					if (val > 50 && val < 60) {
						position -= (10 - (val - 50)) / 2;
					}

					return position;
				})
		);

		chart.layers(layers)
			.map('group', 'cvdonutorder')
			.map('x', this._getPropMapping('series'), dv.scale.ordinal())
			.map('y', this._getPropMapping('y'), this._constructScale('y'))
			.map('fill', this._getPropMapping('x'), dv.scale.color().values(colors))
			.guide('fill', this._legend)
			.guide(['x', 'y'], 'none')
			.coord(dv.coord.polar().flip(true).innerRadius(options.innerRadius).outerRadius(options.outerRadius))
			.postrender(function() {
				var container = d3.select(options.parent).select('.cv-wrapper'),
					donutLabels = container.selectAll('.cv-donut-facet-labels').data([0]),
					adapter = self._dataAdapter;
				donutLabels.enter().append('div').classed('cv-donut-facet-labels', true);
				donutLabels.exit().remove();
				// Create each facet label
				var donutLabel = donutLabels.selectAll('.cv-donut-facet-label').data(this.facet()._panels),
					donutLabelEnter = donutLabel.enter().append('div').classed('cv-donut-facet-label', true);
				donutLabel.each(function(d, i) {
					// Donut labels are positioned above the donut if not large and in the center of the donut otherwise.
					var bounds = d.bounds(),
						label = d3.select(this),
						radius = Math.min(bounds.width, bounds.height) / 2, // smaller of width or height divided by 2.
						topSpace = bounds.height / 2 - radius, // The amount of space from the top of the panel to the top of the donut.
						innerRadius = dv.util.getPercentValue(options.innerRadius, radius),
						size = innerRadius < 25 ? 'small' : innerRadius > 50 ? 'large' : 'medium',
						width = size === 'large' ? innerRadius * 2 : bounds.width, // todo: this will probably need to be massaged because the circle gets small on the bottom
						left = size === 'large' ? bounds.left + (bounds.width / 2) - (width / 2) : bounds.left,
						top = (size === 'large') ? bounds.top + (bounds.height / 2) - 27 : bounds.top + topSpace - 10; // magic number of height of # and first line of title to vertically center on the baseline of the first line of text

					label.style('top', top + 'px')
						.style('width', width + 'px')
						.style('left', left + 'px')
						.classed('cv-donut-small-facet cv-donut-medium-facet cv-donut-large-facet', false)
						.classed('cv-donut-' + size + '-facet', true);
					var num = label.selectAll('.cv-donut-label-number').data([0]);
					num.enter().append('div').classed('cv-donut-label-number', true);
					var value = self._getSeriesTotal(d.xFacetTitle());
					num.text(self._yLabelFormat(d._facetIndex)(value));
					var title = label.selectAll('.cv-donut-label-title').data([0]);
					title.enter().append('div').classed('cv-donut-label-title', true);
					title.text(adapter.yAxisTitle(d._facetIndex));
					if (size === 'medium') {
						num.style('top', bounds.height / 2 - topSpace + 'px'); // Distance from top label to the center of the donut
					}
				});
				donutLabel.exit().remove();
			});

		this._addBehaviors(layers[0], options);
	};

	/**
	 * Adds custom interactive behaviors to the chart.
	 */
	donut._addBehaviors = function(geom, options) {
		var d3Parent = d3.select(options.parent),
			timer, adapter = this._dataAdapter,
			self = this,
			addMetricValue = function(d, scale, format) {
				if (!d.data.hasOwnProperty(scale.mapping())) { return ''; }
				return '<span class="metric-value">' + format(d.data[scale.mapping()]) + '</span><span class="metric-name">' + scale.mapping() + '</span>';
			};

		// The chart must not be small and must be interactive in order to receive an inspector.
		if (!this._isSmallChart() && options.interactive) {
			geom.behaviors([
				dv.behavior.rollover()
					.content(function(d, i, j) {
						if (options.tooltipContent) {
							return options.tooltipContent.call(this, d, i, j);
						}
						var seriesGroup = this.__geom.getExplicitScale('group'),
							y = d.panel.yScale(d),
							valueFormat = self._yLabelFormat(y.scaleIndex()),
							content = '<span class="metric-value">' + valueFormat(d.data[self._getPropMapping('y')]) +
							'</span><span class="metric-name">' + d.data[self._getPropMapping('seriesLabel')] + '</span>',
							gran = self._dataAdapter.dateGranularity(),
							format = adapter.l10n.dateFormat.fullFormat,
							xLabel = dv.util.isDate(d.fill) ? self._formatTime(d.fill, self._timeGranTemplate(gran, format), gran) : d.fill;
						if (seriesGroup && seriesGroup.mapping()) {
							content = '<span class="series-name">' + xLabel + '</span>' + content;
						}

						return content;
					})
					.showTooltip(function(d, i, j, ev, behavior) {
						var el = d3.select(this);

						// Only active bars can show a tooltip.
						if (!el.classed('path-inactive')) {
							behavior._showTip.call(this, d, i, j, behavior);
							clearTimeout(timer);
							// Dim the donuts and their labels.
							d3Parent.selectAll('.bar-geom')
								.classed('cv-medium-duration', false)
								.classed('cv-unselected', function(pointD) { return d !== pointD; });
							d3Parent.selectAll('.text-geom')
								.classed('cv-medium-duration', false)
								.classed('cv-unselected', function(pointD) { return d.group !== pointD.group; })
								.classed('cv-selected', function(pointD) { return d.group === pointD.group; });
							d3Parent.selectAll('.cv-legend-marker')
								.classed('unselected', function(legendD) { return legendD !== d.fill; })
								.classed('cv-medium-duration', false);

							if (self._eventMap['mouseover']) {
								self._eventMap['mouseover'].call(this, d, i, j, ev);
							}
						}
					})
					.hideTooltip(function(d, i, j, ev, behavior) {
						var el = d3.select(this);

						// Only active bars can hide the tooltip.
						if (!el.classed('path-inactive')) {
							behavior._removeTip.call(this, d, i, j, behavior);
							timer = setTimeout(function() { // Don't use d3 transitions here.  They can override transitions that occur when moving/sizing a donut which makes them freeze in place.
								// Make all donuts and their labels opaque.
								d3Parent.selectAll('.bar-geom')
									.classed('cv-unselected', false)
									.classed('cv-medium-duration', true);
								d3Parent.selectAll('.text-geom')
									.classed('cv-unselected cv-selected', false)
									.classed('cv-medium-duration', true);
								d3Parent.selectAll('.cv-legend-marker')
									.classed('unselected', false)
									.classed('cv-medium-duration', true);

								if (self._eventMap['mouseout']) {
									self._eventMap['mouseout'].call(this, d, i, j, ev);
								}
							}, 400);
						}
					})
			]);
		}
	};

	donut._drawSmall = function() {
		var chart = this._chart, options = this._options;
		chart.facet(dv.facet.wrap().group(this._getPropMapping('series')).scales('free').numColumns(1).titleFormat(undefined));
	};

	donut._drawLarge = function() {
		var chart = this._chart;
		chart.facet(dv.facet.wrap().group(this._getPropMapping('series')).scales('free').numColumns(3).titleFormat(undefined));
	};

	global.cloudViz.donut = cloudViz.util.createConstructor(donut);
}(this));

/*global cloudviz,d3,dv*/
(function(global) {
	'use strict';

	/**
	 * The CloudViz interactive legend is passed to DV in place of DV's default legend.  DV kicks off the render cycle by calling _render. The interactive
	 * legend is responsible for creating button-esque legend entries which can be toggled on/off which can be used to update the plot to disable series.
	 *
	 * The interactive legend also provides the ability to manually create legend entries beyond the legend entries specified by the scale registered to
	 * the legend within DV (referred to as "standard" legend entries).
	 */
	global.cloudViz.interactiveLegend = function() {

		var VERT_LEGEND_MARGIN = 10, // margin between the legend and the chart


			// Private variables keeping state of the getter/setters. See comments on the getter/setter functions for details
			// on what these variables do.
			minLegendEntryWidth = 110,
			maxLegendEntryWidth = 250,
			legendVerticalWidth = 110,
			parent,
			orientation,
			validOrientations = ['top', 'right', 'left'],
			chartWidth,
			chartHeight,
			chartPadding,
			isVertical,
			values,
			type,
			showTargetEntry,
			seriesState,
			interactive = true,

			legendEntryWidth, // The final width of a legend entry taking available size and orientation into consideration
			legendEntries, // A D3 selection of all the legend entry DOM elements
			legend, // The containing D3 selected DOM element which houses the legend

			// An object which tracks the states of all legend entries. It includes both standard and manual legend entries.
			// {'name':String, 'type':String, 'enabled:uint'}
			legendStates = null,
			// An object which tracks the state behind all manually create legend entries.
			// {'name':String, 'type':String, 'classList':String[]}
			manualStates = null,
			mapping, // The mapping of the scale which is bound to this legend

			interactiveLegend = {}; // The instance object for the interactive legend.


		/**
		 * The render routine will be called by DV internally when this legend is specified as the class for the guide.
		 * e.g. .guide('fill', cloudViz.interactiveLegend())
		 *
		 * @param parent {DOMElement} An SVG parent passed from DV. Since these legends are HTML, we disregard this parent and use the parent setter below.
		 * @param scales {dv.scale[]} Mapped scales that will be rendered by this legend supplied by DV.
		 * @param opts {} Options set by DV on the legend. We are disregarding these in favor of the options we set manually.
		 */
		interactiveLegend._render = function(parent, scales, opts) {
			this._initSVG(scales);
			this._sizeAndPositionLegendEntries();
			this._positionLegend();
		};

		/**
		 * Initialize the SVG needed for the legend.
		 */
		interactiveLegend._initSVG = function(scales) {
			legend = d3.select(parent).selectAll('.cv-legend').data([0]);
			legend.enter().append('div').classed('cv-legend', true); // create legend/bg if first time

			legendEntries = this._createLegendEntries(legend, scales);

			// Determine legend entry size
			legendEntryWidth = Math.min(
				Math.floor(this._getLegendContainingWidth() / legendEntries[0].length),
				maxLegendEntryWidth
			);

			if (validOrientations.indexOf(orientation) > -1) {
				this._calculatedLegendOrientation = orientation;
			} else {
				this._calculatedLegendOrientation = 'top';
			}

			var isSmall = global.cloudViz.core._isSmallChart(chartWidth);
			if (legendEntryWidth < minLegendEntryWidth && !isSmall &&
					(this._calculatedLegendOrientation == 'top' || this._calculatedLegendOrientation == 'bottom')) {
				this._calculatedLegendOrientation = 'left';
			}

			switch (this._calculatedLegendOrientation) {
				case 'top':
				case 'bottom':
					legendEntryWidth = Math.max(legendEntryWidth, minLegendEntryWidth);
					legend.style('height', null);
					isVertical = false;
					break;
				case 'left':
				case 'right':
					legendEntryWidth = legendVerticalWidth;
					isVertical = true;
					break;
			}

			validOrientations.forEach(dv.util.bind(function(orientation) {
				legend.classed(orientation, this._calculatedLegendOrientation === orientation);
			}, this));
		};

		/**
		 * Called by DV to change the dimensions of the plot area.
		 *
		 * @param dim {{top:number, right:number, bottom:number, left:number}}
		 * @return {{top:number, right:number, bottom:number, left:number}}
		 */
		interactiveLegend._getAdjustedDimensions = function(dim) {
			var legendNode = legend.node();

			switch (this._calculatedLegendOrientation) {
				case 'top':
					dim.top += this._getUsedHeight();
					break;
				case 'right':
					dim.width -= this._getUsedWidth();
					break;
				case 'left':
					dim.left += this._getUsedWidth();
					break;
				case 'bottom':
					dim.height -= this._getUsedHeight();
					break;
			}
			return dim;
		};

		/**
		 * Create both the standard legend entries populated by DV and the manual legend entries that can be added by using
		 * the addManualEntry method.
		 */
		interactiveLegend._createLegendEntries = function(legend, scales) {
			// Create entries for each item in the series/grouping
			var self = this,
				states = seriesState.getStateObjects(), // The raw state objects
				entries,
				newEntries,
				k,
				scale;

			for (k in scales) {
				scale = scales[k][0]; // do we need to handle all or just grab first (or last)
				mapping = scale._mapping;
			}

			entries = legend.selectAll('.cv-legend-entry').data(states);
			newEntries = entries.enter().append('div').attr('class', function(d) { return 'cv-legend-entry cv-legend-' + d.type + '-entry'; });
			newEntries.append('div').classed('cv-legend-title', true);
			var secondLine = newEntries.append('div').classed('cv-legend-details', true);
			secondLine.append('div').classed('cv-legend-marker', true);
			secondLine.append('div').classed('cv-legend-num', true);
			entries.exit().on('click', null).remove();

			entries.each(function(d, i) {
				var entry = d3.select(this);
				entry.select('.cv-legend-title').text(d.name);
				// clear previous numbers, like on hover
				entry.select('.cv-legend-num').text((values && values.length > i) ? values[i] : '');

				entry.select('.cv-legend-marker')
					.attr('class', 'cv-legend-marker ' + type)
					.style('background-color', function(d) {
						var color = scale.mapValue(d.id);
						return color ? color : null;
					});
			});

			// Handle active/inactive
			entries.classed('inactive', function(d, i) { return interactive && !d.enabled; });

			entries.on('click', function(d, i) {
				if (interactive) {
					// The seriesState will notify the legend and all other interested components that this series is enabled/disabled
					seriesState.enableStateByIndex(i, !d.enabled);
				}
			});

			return entries;
		};

		/**
		 * Called when a particular series in enabled/disabled by user interaction or an outside API call
		 * @param  {string} eventType The type of event that was dispatched ('enableChanged' in this case)
		 * @param  {SeriesState} obj The state object representing the series.
		 */
		interactiveLegend._onSeriesEnableChange = function(eventType, obj) {
			if (interactive) {
				legendEntries.filter(function(d) {
					return d.id === obj.id && d.type === obj.type;
				}).classed('inactive', !obj.enabled);
			}
		};

		/**
		 * Position the legend off of the chart.
		 */
		interactiveLegend._positionLegend = function() {
			var legendPosition = {
				top: 0,
				left: 0
			};

			switch (this._calculatedLegendOrientation) {
				case 'bottom':
					legendPosition.top = chartHeight - legend.node().offsetHeight;
					break;
				case 'right':
					legendPosition.left = chartWidth - legendVerticalWidth;
					break;
			}

			legend.style('top', legendPosition.top + 'px').style('left', legendPosition.left + 'px');
		};

		/**
		 * Layout the legend entries based on the orientation.
		 */
		interactiveLegend._sizeAndPositionLegendEntries = function() {
			// Update legends
			if (isVertical) {
				legendEntries.each(function(d, i, s) {
					d3.select(this)
						.style('width', legendEntryWidth + 'px')
						// If the legend wasn't vertical on the prior render, it's possible a title height was set, clear that
						// out. Vertical legend entries can have varying heights unlike horizontal.
						.select('.cv-legend-title')
							.style('height', null);
				});
			} else {
				var entry, height, largestEntryTitleHeight = 0, entryTitleHeightsDifferent = false;
				var numLegendEntries = legendEntries[0].length;
				var legendWidth = numLegendEntries * legendEntryWidth;
				var containingWidth = this._getLegendContainingWidth();
				var legendWidthAdjustment = 0;

				// make an adjustment if the space between the last entry and the edge of the graph is less than
				// the number on the row aka we weren't able to divide them evenly across the space to line up on the right
				if (legendWidth < containingWidth && legendWidth + numLegendEntries > containingWidth) {
					legendWidthAdjustment = containingWidth - legendWidth;
				}

				// assign width if needed
				legend.style('width', (legendWidth > containingWidth && !isVertical) ? containingWidth + 'px' : '');

				legendEntries.each(function(d, i, s) {
					entry = d3.select(this);


					// Spread the legendWidthAdjustment across as many legendEntries as possible.
					var entryWidth = legendEntryWidth;
					if (legendWidthAdjustment > 0) {
						entryWidth += 1;
						legendWidthAdjustment -= 1;
					}

					entry.style('width', entryWidth + 'px');

					// Handle different title heights
					height = entry.select('.cv-legend-title').style('height', null).node().offsetHeight;

					if (height !== largestEntryTitleHeight) {
						entryTitleHeightsDifferent = true;
						largestEntryTitleHeight = Math.max(height, largestEntryTitleHeight);
					}
				});

				// Set entry height for horizontal legend
				if (entryTitleHeightsDifferent) {
					legendEntries.selectAll('.cv-legend-title').style('height', largestEntryTitleHeight + 'px');
				}
			}
		};

		/**
		 * Returns how much width the legend has for layout assuming the legend is oriented top. This function is used
		 * to determine if the legend should adjust from top horizontal to left vertical layout if there are too many
		 * legend entries for the available width.
		 */
		interactiveLegend._getLegendContainingWidth = function() {
			return chartWidth - chartPadding.right;
		};

		/**
		 * This function is called by DV to determine how much width the legend took up if it has a left or right
		 * orientation. This information is used by DV to adjust the left or right margin of the plot so it
		 * doesn't overlap the legend.
		 */
		interactiveLegend._getUsedWidth = function() {
			return isVertical ? legendVerticalWidth + VERT_LEGEND_MARGIN : 0;
		};

		/**
		 * This function is called by DV to determine how much height the legend took up if it has a top or bottom
		 * orientation.  This information is used by DV to adjust the top or bottom margin of the plot so it
		 * doesn't overlap the legend.
		 */
		interactiveLegend._getUsedHeight = function() {
			if (isVertical) {
				return 0;
			} else {
				return legend.node().offsetHeight || 0;
			}
		};

		/**
		 * Clears out data and removes the DOM elements for the legend.
		 */
		interactiveLegend.destroy = function() {
			// Remove old legend if one exists
			legend.remove();
		};

		/**
		 * The parent DOM element which will contain the HTML legend.  This is required even though
		 * DV attempts to supply the legend with a parent we disregard it because DV's legend parent
		 * is SVG where the interactive legend is meant to be HTML.
		 */
		interactiveLegend.parent = function(_) {
			if (!arguments.length) { return parent; }
			parent = _;
			return interactiveLegend;
		};

		/**
		 * The minimum width a legend entry can have.
		 */
		interactiveLegend.minLegendEntryWidth = function(_) {
			if (!arguments.length) { return minLegendEntryWidth; }
			minLegendEntryWidth = _;
			return interactiveLegend;
		};

		/**
		 * The maximum width a legend entry can have.
		 */
		interactiveLegend.maxLegendEntryWidth = function(_) {
			if (!arguments.length) { return maxLegendEntryWidth; }
			maxLegendEntryWidth = _;
			return interactiveLegend;
		};

		/**
		 * Sets the width of all legend entries when the legend is layed out vertically.
		 */
		interactiveLegend.legendVerticalWidth = function(_) {
			if (!arguments.length) { return legendVerticalWidth; }
			legendVerticalWidth = +_;
			return interactiveLegend;
		};

		/**
		 * An array of values which can be displayed in the legend entry which could represent a total or average
		 * of values.
		 */
		interactiveLegend.values = function(_) {
			if (!arguments.length) { return values; }
			values = _;
			return interactiveLegend;
		};

		/**
		 * Represents the type of legend that will be drawn.  This determines what marker will be drawn in the legend
		 * entries. This will be exposed via a CSS class which can be targeted to change the marker to look like a
		 * circle for a scatterplot or a square for a bar chart.
		 */
		interactiveLegend.type = function(_) {
			if (!arguments.length) { return type; }
			type = _;
			return interactiveLegend;
		};

		/**
		 * The allocated width for the entire chart.
		 */
		interactiveLegend.chartWidth = function(_) {
			if (!arguments.length) { return chartWidth; }
			chartWidth = _;
			return interactiveLegend;
		};

		/**
		 * The allocated height for the entire chart.
		 */
		interactiveLegend.chartHeight = function(_) {
			if (!arguments.length) { return chartHeight; }
			chartHeight = _;
			return interactiveLegend;
		};

		/**
		 * The amount of padding that the DV chart has been given.
		 *
		 * @param _ {{top: number, right: number, bottom: number, left: number}} A DV chart padding object.
		 */
		interactiveLegend.chartPadding = function(_) {
			if (!arguments.length) { return chartPadding; }
			chartPadding = _;
			return interactiveLegend;
		};

		interactiveLegend.seriesState = function(_) {
			if (!arguments.length) { return seriesState; }
			seriesState = _;
			seriesState.on('enableChange.legend', this._onSeriesEnableChange);
			return interactiveLegend;
		};

		/**
		 * An array of valid orientations the legend could have.
		 *
		 * @param _ {String[]} Valid options include: 'top', 'right', 'bottom', 'left'
		 */
		interactiveLegend.validOrientations = function(_) {
			if (!arguments.length) { return validOrientations; }
			validOrientations = _;
			return interactiveLegend;
		};

		/**
		 * The requested orientation for the legend.
		 *
		 * @param _ {String} Valid options include: 'top', 'right', 'bottom', 'left'
		 */
		interactiveLegend.orientation = function(_) {
			if (!arguments.length) { return orientation; }
			orientation = _;
			return interactiveLegend;
		};

		/**
		 * If true, the legend can be clicked and toggled on/off.  If false, it isn't clickable.
		 * @param _ {Boolean} [description]
		 */
		interactiveLegend.interactive = function(_) {
			if (!arguments.length) { return interactive; }
			interactive = _;
			return interactiveLegend;
		};

		/**
		 * A getter which returns the mapping of the scale associated with this legend.
		 */
		interactiveLegend.mapping = function() {
			return mapping;
		};

		/**
		 * A getter which returns whether the legend is vertical (true) or horizontal (false).  Vertical
		 * orientations include 'left' and 'right' legend orientations. Non-vertical orientations include
		 * 'top' and 'bottom' legend orientations.
		 */
		interactiveLegend.isVertical = function() {
			return isVertical;
		};

		return interactiveLegend;
	};

}(this));
/*global d3*/
(function(global) {
	"use strict";

	d3.anomaly = function() {
		var anomaly = {},
			data,
			mappings = { "x": "date", "y": "deviation" },
			padding,
			size = [50, 25],
			interactive = true,
			bins = 6,
			normalizePositive = false,
			p = null,
			anomalyWidth,
			anomalyHeight,
			xTicks = 7,
			xTickInterval,

			xUpperLimit,
			xLowerLimit,

			dispatch = d3.dispatch("select", "mouseover", "mouseout"),
			lastMouseOverNode,

			x = d3.time.scale(),
			y = d3.scale.linear(),
			gradient,
			height,
			width,
			binData,
			binSize,
			buckets,
			brush,
			xTickValues,

			// mapping shortcuts
			xMapping,
			yMapping,

			$p,
			$container,
			selectionCache;

		// constants
		var BAND_PADDING = 8,
			ANOMALY_PADDING = 1,
			DAY_IN_MILLIS = 86400000;

		d3.rebind(anomaly, dispatch, "on");

		/**
		 * An array of objects each representing data regarding an anomaly.  Use the mappings object to specify which
		 * property in each object represents x (the date) and which property represents y (deviation from the mean).
		 */
		anomaly.data = function(_) {
			if (!arguments.length) { return data; }
			data = _;
			selectionCache = null;
			return anomaly;
		};

		/**
		 * An object which specifies which properties in each object of the data array refers to x and y.
		 */
		anomaly.mappings = function(_) {
			if (!arguments.length) { return mappings; }
			mappings = extend(mappings, _);
			return anomaly;
		};

		anomaly.xUpperLimit = function(_) {
			if (!arguments.length) { return xUpperLimit; }
			xUpperLimit = _;
			return anomaly;
		};

		anomaly.xLowerLimit = function(_) {
			if (!arguments.length) { return xLowerLimit; }
			xLowerLimit = _;
			return anomaly;
		};

		/**
		 * Show all anomalies as positive even if they are negative.
		 */
		anomaly.normalizePositive = function(_) {
			if (!arguments.length) { return normalizePositive; }
			normalizePositive = _;
			return anomaly;
		};

		/**
		 * Determines how many x ticks should be drawn.  This ultimately determines how things are grouped.  There are two
		 * options that can be used here.
		 *
		 * Option 1: Supply a single integer argument to this function.  A single argument will render a preferred number of
		 * x ticks and the anomaly chart will determine the closest most optimal number of ticks to that preferred number.
		 * There may be times where 4 may be supplied and the anomaly chart is rendered with 3 or 5 ticks.  This is because
		 * ticks is simply a hint and in that particular case 4 ticks may have produced fractions or values which are not
		 * easily understood.
		 *
		 *     Usage:  .xTicks(5)
		 *
		 * Option 2: Supply two arguments. If the first argument is a function, this function will be invoked, being passed
		 * the start and end date of the scale's domain, in addition to the step argument. There are a few functions defined
		 * by D3 which can be used here to specify time interval (https://github.com/mbostock/d3/wiki/Time-Intervals#aliases)
		 *
		 *     Usage:  .xTicks(d3.time.weeks, 2)  // This will add a tick every 2 weeks.
		 *             .xTicks(d3.time.days, 1)  // This will add a tick for every day.
		 */
		anomaly.xTicks = function(arg1, arg2) {
			if (!arguments.length) {
				return arg2 !== undefined ? [xTicks, xTickInterval] : this.xTicks;
			}
			var isArg1Func = !!(arg1 && arg1.constructor && arg1.call && arg1.apply);
			xTicks = (isArg1Func) ? d3.functor(arg1) : arg1;
			xTickInterval = isArg1Func ? arg2 : undefined;
			return this;
		};

		/**
		 * The preferred number of bins that should be used.  This is only a suggestion that the anomaly chart can override.
		 *
		 * The anomaly chart will use a number of bins that lead to pretty intervals that are easier to process.  For
		 * example, if I ask for 3 bins for an interval of [0, 100], we would be showing bins of
		 * [0-33.3333, 33.3333-66.6667, 66.6667-100]. Users would rather have 4 bins of [0-25, 25-50, 50-75, 75-100]
		 * for reduced cognitive load, so this visualization will opt for 4 bins instead of 3.
		 */
		anomaly.bins = function(_) {
			if (!arguments.length) { return bins; }
			bins = _;
			return anomaly;
		};

		/**
		 * An array consisting of preferred width and height for the visualization, in the format [width, height].
		 */
		anomaly.size = function(_) {
			if (!arguments.length) { return size; }
			size = _;
			return anomaly;
		};

		/**
		 * True if the chart should be interactive and false otherwise.
		 */
		anomaly.interactive = function(_) {
			if (!arguments.length) { return interactive; }
			interactive = _;
			return anomaly;
		};

		/**
		 * The p node that the chart will be constructed in.
		 */
		anomaly.parent = function(_) {
			if (!arguments.length) { return p; }
			p = _;
			return anomaly;
		};

		/**
		 * READ-ONLY. The width of each anomaly box. Only available after layout.
		 */
		anomaly.anomalyWidth = function() {
			return anomalyWidth;
		};

		/**
		 * READ-ONLY. The height of each anomaly box.  Only available after layout.
		 */
		anomaly.anomalyHeight = function() {
			return anomalyHeight;
		};

		/**
		 * Draws the anomaly visualization.
		 */
		anomaly.layout = function() {
			if (!anomaly.data() || !anomaly.data().length) { throw new EmptyDataException(); }
			if (!anomaly.parent()) { throw new ParentNotSpecifiedException(); }

			xMapping = getMapping('x');
			yMapping = getMapping('y');

			createScales();
			createBrush();
			$container = createSVGContainer();
			binData = generateBinData();
			y.domain([buckets[0], buckets[buckets.length - 1]]);
			determineSize();
			$container.attr("transform", "translate(" + padding.left + "," + padding.top + ")");
			drawAxes($container, width, height);
			drawInteractionLayer();
			drawAnomalies();

			return anomaly;
		};

		/**
		 * Accepts a function which will be called for each anomaly node in the visualization.  The function will
		 * be passed two parameters.  The first is the data object bound to the anomaly.  The second is the index
		 * of the anomaly within the group of anomalies.  The `this` scope context of the function refers to the
		 * anomaly SVG node.
		 */
		anomaly.nodes = function(f) {
			if (!$p) { throw new Error("layout must be called before nodes may be requested."); }
			$p.selectAll(".anom-anomaly").each(f);
		};

		function extend(dest, source) {
			for (var prop in source) { dest[prop] = source[prop]; }
			return dest;
		}

		/**
		 * Determine the size of the chart and the adequate padding to prevent axis clipping.
		 */
		function determineSize() {
			var tempAxisContainer = $container.append("g").classed("temp-axis", true);
			drawAxes(tempAxisContainer, size[0], size[1]);

			padding = measureAxis(tempAxisContainer);
			width = size[0] - padding.left - padding.right;
			height = size[1] - padding.top - padding.bottom;

			tempAxisContainer.remove();
		}

		/**
		 * Measures the size of the axis and determines where it would be clipped. The areas that would be clipped
		 * are returned as an object with left, top, right, and bottom Numbers.  These numbers represent the padding
		 * in pixels that would need to be added to the chart in order to prevent clipping.
		 */
		function measureAxis(axisContainer) {
			var bbox = axisContainer.node().getBBox(),
				left = Math.abs(bbox.x),
				top = Math.abs(bbox.y);

			return {
				left: left,
				top: top,
				right: bbox.width - size[0] - left,
				bottom: bbox.height - size[1] - top
			};
		}

		/**
		 * Creates the scales and sets the appropriate domain. Range values are not set quite yet.
		 */
		function createScales() {
			var xExtent = calculateExtent(data, function(d) { return Date.parse(d[xMapping]); }, [xLowerLimit, xUpperLimit]);
			var yExtent = calculateExtent(data, function(d) { return d[yMapping]; });

			// Set the domain as it stands and then alter it to get identical column widths.
			x.domain(xExtent);

			// Get a full band for the last x interval (right now it could only be partial).  Each column MUST be the same width.
			var tickVals = x.ticks(xTicks, xTickInterval);

			var tickIntMillis = (+tickVals[1]) - (+tickVals[0]);
			xExtent[1] = tickIntMillis + (+tickVals[tickVals.length - 1]);
			xExtent[0] = (+tickVals[0] > xExtent[0]) ? (+tickVals[0] - tickIntMillis) : xExtent[0];
			x.domain(xExtent);
			xTickValues = x.ticks(xTicks, xTickInterval);

			// Which extent is greater?
			var extentMax = Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1]));

			if (normalizePositive) {
				y.domain([0, extentMax]);

				gradient = d3.scale.linear().domain([-extentMax, extentMax]);
			}
			else {
				y.domain([-extentMax, extentMax]);

				gradient = d3.scale.linear().domain(y.domain());
			}

			gradient.domain([0, 1/10, 1/5, 3/10, 2/5, 0.5, 3/5, 7/10, 4/5, 9/10, 1].map(gradient.invert));
			gradient.range(["#3C476F", "#485485", "#53659C", "#6C7CAF", "#99A2BC", "#C5C5C5", "#ACC997", "#90C867", "#7CBC4B", "#6FA744", "#64913E"]);
		}

		function calculateExtent(data, limitAccessor, manualLimits) {
			var limits = [];
			if (arguments.length < 3 || (manualLimits[0] === undefined && manualLimits[1] === undefined)) {
				limits = d3.extent(data, limitAccessor);
			}
			else {
				limits[0] = (manualLimits[0] === undefined) ? d3.min(data, limitAccessor) : manualLimits[0];
				limits[1] = (manualLimits[1] === undefined) ? d3.max(data, limitAccessor) : manualLimits[1];
			}
			return limits;
		}

		function createBrush() {
			brush = d3.svg.brush()
				.x(x)
				.y(y)
				.on("brushstart", brushstart)
				.on("brush", brushmove)
				.on("brushend", brushend);
		}

		function brushstart(p) {
			dispatchSelectedAnomalies();
		}

		function brushmove(p) {
			$container.selectAll(".extent").style("opacity", 1);
			dispatchSelectedAnomalies();
		}

		function brushend(p) {
			$container.selectAll(".extent").style("opacity", 0);
			dispatchSelectedAnomalies();
		}

		function dispatchSelectedAnomalies() {
			var extent = brush.extent(),
				extentRange = {
					left: Math.min(x(extent[0][0]), x(extent[1][0])),
					right: Math.max(x(extent[0][0]), x(extent[1][0])),
					top: Math.min(y(extent[0][1]), y(extent[1][1])),
					bottom: Math.max(y(extent[0][1]), y(extent[1][1]))
				};

			var selectedAnomalies = $container.selectAll(".anom-anomaly").filter(function(d, i) {
				return intersect({
					left: d.bounds.x,
					right: d.bounds.x + d.bounds.width,
					top: d.bounds.y,
					bottom: d.bounds.y + d.bounds.height
				}, extentRange);
			});

			if (selectionCache && arraysEqual(selectedAnomalies[0], selectionCache[0])) {
				return;
			}

			selectionCache = selectedAnomalies;
			dispatch.select(selectedAnomalies);
		}

		function arraysEqual(array1, array2) {
			if (array1.length != array2.length) {
				return false;
			}
			for (var i = 0, ii = array1.length; i < ii; i++) {
				if (array2.indexOf(array1[i]) === -1) {
					return false;
				}
			}
			return true;
		}

		function intersect(bounds1, bounds2) {
			return !(bounds2.left > bounds1.right ||
					bounds2.right < bounds1.left ||
					bounds2.top > bounds1.bottom ||
					bounds2.bottom < bounds1.top);
		}

		function createSVGContainer() {
			$p = d3.select(p);

			var svg = $p.selectAll("svg").data([data]);
			svg.enter().append("svg");
			svg.exit().remove();
			svg.attr("width", size[0]).attr("height", size[1]);

			var container = svg.selectAll(".anom-container").data([0]);
			container.enter().append("g").classed("anom-container", true);
			return container;
		}

		function generateBinData() {
			buckets = y.ticks(bins);
			var bucketSize = buckets[1] - buckets[0];
			buckets.push(bucketSize + buckets[buckets.length - 1]);

			if (!normalizePositive) {
				buckets.unshift(buckets[0] - bucketSize);
			}

			data = filterData(data);
			sortData(data);
			var nestData = nestDataByX(data);
			binNestedData(buckets, nestData);

			return nestData;
		}

		/**
		 * Ignore data outside the x upper and lower limits.
		 */
		function filterData(data, xExtent) {
			var xDomain = x.domain();
			return data.filter(function(d) {
				var date = new Date(d[xMapping]);
				return date >= xDomain[0] && date < xDomain[1];
			});
		}

		function sortData(data) {
			data.sort(function(a, b) {
				a = new Date(a[xMapping]);
				b = new Date(b[xMapping]);
				return a < b ? -1 : a > b ? 1 : 0;
			});
		}

		function nestDataByX(data) {
			return d3.nest()
				.key(function(d) {
					var date = Date.parse(d[xMapping]),
						tickIndex = 0;
					// Get the previous xTick
					var i = -1,
						n = xTickValues.length;
					while (++i < n) {
						if (+xTickValues[i] > +date) {
							break;
						}
						tickIndex = i;
					}
					return +xTickValues[tickIndex];
				})
				.entries(data);
		}

		function binNestedData(buckets, nestData) {
			nestData.forEach(function(d) {
				d.values = d3.layout.histogram()
					.bins(buckets)
					.value(function(d) { return normalizePositive ? Math.abs(d[yMapping]) : d[yMapping]; })
					(d.values);
				binSize = d.values[0].dx;
			});
		}

		function xTickLabelFormat(w) {
			var prevTick = new Date(0),
				numTicks = xTickValues.length,
				maxTickDensity = Math.max(Math.ceil((xTickValues.length - 1) / (w / 70)), 1),
				fullFormat = d3.time.format("%b %e, %Y"),
				monthFormat = d3.time.format("%b %e"),
				dayFormat = d3.time.format("%a %e"),
				hourFormat = d3.time.format("%I:%M %p");

			return function(d, i) {
				var value = "";

				if (i === numTicks - 1 || (i % maxTickDensity !== 0)) {
					return ""; // Don't set previous tick here
				} else if (i === 0 || prevTick.getYear() !== d.getYear()) {
					value = fullFormat(d);
				} else if (prevTick.getMonth() !== d.getMonth()) {
					value = monthFormat(d);
				} else if (prevTick.getDate() !== d.getDate()) {
					value = dayFormat(d);
				} else if (prevTick.getHours() !== d.getHours()) {
					value = hourFormat(d);
				}

				prevTick = d;
				return value;
			};
		}

		function drawAxes(container, w, h) {
			var numXTicks = xTickValues.length,
				showWeekendMarkers = (xTickValues.length > 1 && (+xTickValues[1] - +xTickValues[0] <= DAY_IN_MILLIS)),
				lastXLabelDate;

			// Set the ranges on the scale now that we have a width and height.
			x.rangeRound([0, w]);
			y.rangeRound([h, 0]);

			var axes = container.selectAll(".anom-axes").data([0]);
			axes.enter().append("g").classed("anom-axes", true);

			var axis = axes.selectAll(".anom-axis").data(['x', 'y']);
			axis.enter().append("g").attr("class", function(d) { return "anom-" + d + " anom-axis"; });

			// Draw x axis
			var xAxis = axes.selectAll(".anom-x")
				.attr("transform", "translate(0," + h + ")")
				.call(d3.svg.axis()
						.scale(x)
						.ticks(xTicks, xTickInterval)
						.orient("bottom")
						.tickSize(-h)
						.tickPadding(20)
						.tickFormat(xTickLabelFormat(w)));

			// Align x axis labels left
			xAxis.selectAll("text").style("text-anchor", "start");

			xAxis.selectAll("line")
				.style("opacity", function(d, i) {
					// Hide the last tick.
					if (i === numXTicks - 1) { return 0; }
					// Make the weekends stick out a little more
					if (showWeekendMarkers && (d.getDay() === 6 || d.getDay() === 1) && d.getHours() === 0 && i < numXTicks - 1) { return 0.3; }
					return null;
				});

			// Draw y axis
			var yAxis = axes.selectAll(".anom-y")
				.call(d3.svg.axis()
						.scale(y)
						.tickValues(buckets)
						.orient("left")
						.tickSize(-w)
						.tickPadding(10)
						// Draw every other label with %
						.tickFormat(function(d, i) {
							if (i === 0 || i === Math.floor(buckets.length / 2) || i === (buckets.length - 1)) {
								// Fix floating point math errors that would result in labels like 1.39999999999999%
								return (Math.round(d * 100000) / 100000) + "%";
							}
							return "";
						}));

			if (!normalizePositive) {
				yAxis.selectAll("line").filter(function(d, i) { return d === 0; })
					.style("stroke-dasharray", "4 4")
					.style("opacity", 0.7);
			}
		}

		function drawAnomalies() {
			var anomalyHeight = Math.round((buckets.length > 1) ? y(buckets[0]) - y(buckets[1]) : height) - 1,
				anomalyWidth = Math.round(computeAnomalyWidth(anomalyHeight)) - 1;

			var plot = $container.selectAll(".anom-plot").data([binData]);
			plot.enter().append("g").classed("anom-plot", true);
			plot.exit().remove();

			var columns = plot.selectAll(".anom-column").data(function(d) { return d; });
			columns.enter().append("g").classed("anom-column", true);
			columns.exit().remove();
			columns.attr("transform", function(d) { return "translate(" + x(+d.key) + ",0)"; });

			var rows = columns.selectAll(".anom-row").data(function(d) { return d.values; });
			rows.enter().append("g").classed("anom-row", true);
			rows.exit().remove();
			rows.attr("transform", function(d, i) {
				return "translate(0," + (y(buckets[i]) - anomalyHeight) + ")";
			});

			// Draw anomaly container
			var anomalies = rows.selectAll(".anom-anomaly").data(function(d) { return d; });
			var anomaliesEnter = anomalies.enter().append("g").classed("anom-anomaly", true);
			anomalies.attr("transform", function(d, i) {
					var bucket = getBucket(normalizePositive ? Math.abs(d[yMapping]) : d[yMapping]);
					if (d[yMapping] >= 0) {
						bucket += binSize;
					}
					d.bounds = {
						'x': x(Date.parse(d[xMapping])) + (i * (anomalyWidth + ANOMALY_PADDING) + ANOMALY_PADDING),
						'y': y(bucket),
						'width': anomalyWidth,
						'height': anomalyHeight
					};
					return "translate(" + (i * (anomalyWidth + ANOMALY_PADDING) + ANOMALY_PADDING) + ",0)";
				});
			anomalies.exit().remove();

			// Draw anomaly cell
			anomaliesEnter.append("rect")
				.classed("anom-cell", true)
				.attr("x", anomalyWidth / 2)
				.attr("y", anomalyHeight / 2)
				.attr("width", 0)
				.attr("height", 0);

			anomalies.selectAll(".anom-cell")
				.attr("fill", function(d) {
					// If normalizePositive, we'll pretend the y value is positive, request it's bucket, and then make the bucket
					// negative before asking the gradient scale for color.
					var bucket = getBucket(normalizePositive ? Math.abs(d[yMapping]) : d[yMapping]);
					if (normalizePositive && d[yMapping] < 0) {
						bucket *= -1;
					}
					return gradient(bucket);
				})
				.transition()
				.duration(500)
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", anomalyWidth)
					.attr("height", anomalyHeight);

			//Draw anomaly selection
			var anomalySelectEnter = anomaliesEnter.append("g")
				.classed("anom-select", true);

			anomalySelectEnter.append("path").classed("outer-border", true);
			anomalySelectEnter.append("path").classed("inner-border", true);

			var anomalySelect = anomalies.selectAll(".anom-select");

			anomalySelect.select(".outer-border")
				.attr("d", rectPath(0, 0, anomalyWidth + 0.5, anomalyHeight + 0.5, 1));

			// Special case the selection border so it doesn't draw the inner border if it's too thin to do it appropriately.
			if (anomalyWidth > 3) {
				anomalySelect.select(".inner-border")
					.attr("d", rectPath(0, 0, anomalyWidth + 1, anomalyHeight + 1, 2));
			}

			var hitArea = anomaliesEnter.append("rect")
				.classed("anom-hit-area", true);
			hitArea
				.on("mouseover", function(d, i) { dispatch.mouseover(this, d, i); })
				.on("mouseout", function(d, i) { dispatch.mouseout(this, d, i); })
				.on("mousedown", function(d, i) {
					brush.clear();
					var xy = d3.mouse($container.node()),
						xInv = x.invert(xy[0]),
						yInv = y.invert(xy[1]);
					brush.extent([[xInv, yInv], [xInv, yInv]]);
				})
				.on("click", function(d, i) { dispatch.select(d3.select(this)); })
				.style("cursor", "crosshair")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", anomalyWidth)
				.attr("height", anomalyHeight);
		}

		function drawInteractionLayer() {
			var interactionCanvas = $container.selectAll(".anom-plot").data([0]);
			interactionCanvas.enter().append("g").classed("anom-plot", true);
			interactionCanvas.exit().remove();
			interactionCanvas.call(brush);
		}

		function rectPath(x, y, width, height, inset) {
			return "M" + inset + "," + inset +
				"L" + (width - inset * 2) + "," + inset +
				"L" + (width - inset * 2) + "," + (height - inset * 2) +
				"L" + inset + "," + (height - inset * 2) +
				"z";
		}

		function getBucket(y) {
			var i = -1,
				n = buckets.length;
			while (++i < n) {
				if (y >= 0 && buckets[i] + binSize > y) { return buckets[i]; }
				if (y < 0 && buckets[i] + binSize > y) { return buckets[i] + binSize; }
			}
			return buckets[0];
		}

		function computeAnomalyWidth(anomalyHeight) {
			var bandWidth = ((xTickValues.length > 1) ? x(xTickValues[1]) - x(xTickValues[0]) : width) - BAND_PADDING,
				maxAnomaliesPerBand = getMaxAnomaliesPerBand();
				anomalyWidth = bandWidth / maxAnomaliesPerBand;
			return (anomalyWidth > anomalyHeight) ? anomalyHeight : anomalyWidth;
		}

		function getMaxAnomaliesPerBand() {
			var maxAnomalies = 0;
			binData.forEach(function(band) {
				band.values.forEach(function(bandRow) {
					maxAnomalies = Math.max(bandRow.length, maxAnomalies);
				});
			});
			return maxAnomalies;
		}

		function getMapping(prop) {
			if (mappings[prop] === undefined) { throw new MappingNotDefinedException(prop); }
			return mappings[prop];
		}

		function MappingNotDefinedException(prop) {
			this.type = "MappingNotDefinedException";
			this.message = "The mapping for property " + prop + " was not defined.";
			this.toString = function() { return this.type + " - " + this.message; };
		}

		function EmptyDataException() {
			this.type = "EmptyDataException";
			this.message = "The data is empty or null";
			this.toString = function() { return this.type + " - " + this.message; };
		}

		function ParentNotSpecifiedException() {
			this.type = "ParentNotSpecifiedException";
			this.message = "A p was not specified for this visualization";
			this.toString = function() { return this.type + " - " + this.message; };
		}

		return anomaly;
	};
}(this));
/**
 * Pathing Diagram
 * Based on the Sankey Diagram, the Pathing Diagram allows for a user to see how traffic flows from one node to another
 * Parameters
 * options are defined in the code below.
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {}, core = cloudViz.core || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		pathing = Object.create(core),
		animationDuration = 400;

	pathing.init = function(options) {
		this._type = 'pathing';
		this._initDefaultOptions();
		this.setOptions(options);
		this._pathLocked = null;
		this._pathedObj = null;
		this._activePaths = [];
		this._lineLocked = null;
		this._lastSide = 0; // TEMP: Rework resize with pivot node
		return this;
	};

	pathing._initDefaultOptions = function() {
		var metricName = 'Visits',
			defaults = {
				// TODO: support custom mappings of data
				// right now we require specific keys
				mappings : {}, // required for validation in core but not used
				// color of the paths on interaction
				colors : [
					'#3287d2',
					'#9b8ce6',
					'#d755a5',
					'#fa5a50',
					'#f0a01e',
					'#c3d250',
					'#5faf69',
					'#1ebed7',
					'#5a6eaa',
					'#78b4f5',
					'#aa5fa5',
					'#f0557d',
					'#e8782d',
					'#f5c841',
					'#8cc350',
					'#3cb5a0', // 16
					'#286eaf',
					'#826ee1',
					'#b93282',
					'#f04641',
					'#e18c00',
					'#a0b400',
					'#50965a',
					'#00a0be',
					'#465a87',
					'#4196e6',
					'#964196',
					'#dc3c69',
					'#dc5f00',
					'#e6b43c',
					'#7daf4b',
					'#32a08c' // 32
				],
				// The width of a node in each column
				nodeWidth: 100,

				// The minimum height each node can be.
				// THIS PROPERTY IS DANGEROUS IF INCREASED TOO MUCH!
				// It distorts the data and makes smaller nodes appear larger than they actually are proportionally.
				// Also pushes the top node off the screen if larger
				minNodeHeight: 1,

				// Used in determining the minimum height of the chart to display every node in a column
				avgNodeHeight: 30,

				// The internal padding of the graph
				// This is the space between the border and where the edges of the nodes are drawn
				padding : {
					top : 80,
					left : 30,
					right : 30,
					bottom : 20
				},

				// Displayed in a tooltip when a link or node is hovered or tapped
				metricName : metricName,

				// The minimum horizontal padding between nodes
				minNodeHorzPadding : 80,

				// The vertical padding between nodes
				// This space includes the name of the node
				nodeVertPadding : 34,

				// The number of iterations the pathing library will run over the data to map it spacially
				iterations: 32,

				// Callback methods for allowing the integrator to know when a specific action was taken on the node
				pivotNode : null,
				collapseNode : null,
				expandNode : null,
				pathSelected : null
			};
		return Object.getPrototypeOf(pathing)._initDefaultOptions.call(this, defaults);
	};

	pathing._onAutoResize = function() {
		this.render();
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.
	 **/
	pathing.reset = function() {
		Object.getPrototypeOf(pathing).reset.apply(this, arguments);
		// Since we use render() on resize (which calls reset in core)
		// we cannot use reset to actually remove behaviors and other additional layers
		// Instead we detect it in preRender and reset there
	};

	pathing._preRender = function() {
		Object.getPrototypeOf(pathing)._preRender.apply(this);

		var options = this._options,
			parent = d3.select(options.parent),
			padding = options.padding;

		// Wrap the pathing chart in a new wrapper to allow for scrolling
		var infoWrapper = parent.selectAll('.pathing-cv-info-wrapper').data([0]);
		infoWrapper.enter().insert('div', ':first-child').classed('pathing-cv-info-wrapper', true);
		var wrapper = infoWrapper.selectAll('.pathing-cv-wrapper').data([0]);
		wrapper.enter().insert('div', ':first-child').classed('pathing-cv-wrapper', true);
		var container = wrapper.selectAll('.pathing-cv-container').data([0]);
		container.enter().insert('div', ':first-child').classed('pathing-cv-container', true);
		var svg = container.selectAll('.pathing-svg').data([0]);
		svg.enter().append('svg').classed('pathing-svg', true);
		var paths = svg.selectAll('.pathing-svg-container').data([0]);
		paths.enter().append('g').classed('pathing-svg-container', true);
		paths.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

		// Side information pane
		var pane = infoWrapper.selectAll('.pathing-cv-info-pane').data([0]);
		pane.enter().append('div').classed('pathing-cv-info-pane', true);
		pane.exit().remove();
		var paneContent = pane.selectAll('.info-pane-content').data([0]);
		paneContent.enter().append('div').classed('info-pane-content', true);
		paneContent.exit().remove();
		var paneTitle = paneContent.selectAll('.pathing-cv-info-title').data([0]);
		paneTitle.enter().append('div').classed('pathing-cv-info-title', true);
		paneTitle.exit().remove();
		var paneValue = paneContent.selectAll('.pathing-cv-info-value').data([0]);
		paneValue.enter().append('div').classed('pathing-cv-info-value', true);
		paneValue.exit().remove();
		var panePaths = paneContent.selectAll('.pathing-cv-info-paths').data([0]);
		panePaths.enter().append('div').classed('pathing-cv-info-paths', true);
		panePaths.exit().remove();

		// Size wrapping divs
		this._sizeChart();

		// Create gradients
		this._createGradients(svg);

		// Unlock node/link if this is new data
		var pathed = this._pathedObj;
		if (this._changedOptions && this._changedOptions.data && pathed) {
			if (this._isDataObjNode(pathed.data)) {
				this._unlockNode(pathed.data, pathed.elem)();
			} else {
				this._unlockLink(pathed.data, pathed.elem)();
			}
		} else {
			// new chart, remove events and layers
			container
				.on('mousemove.node', null)
				.on('click.node', null)
				.on('click.link', null);
			this._removePathOverlays(container);
			this._removeNodeOptions(true);
			this._defaultInformation();
		}
	},

	pathing._render = function() {
		Object.getPrototypeOf(pathing)._render.apply(this);
		if (!this._dataAdapter.isValidPathingData()) { return; }

		this._createDiagram();

		// Handle resizing, check if we have activepaths
		var pathed = this._pathedObj;
		if (this._activePaths.length && pathed) {
			if (this._isDataObjNode(pathed.data)) {
				// Node paths
				this._renderNodePaths(pathed.data, pathed.elem, true);
				this._showNodeOptions(pathed.data, pathed.elem);
			} else {
				// Link paths
				this._renderLinkPaths(pathed.data, pathed.elem, true);
			}
		}
	};

	pathing._postRender = function() {
		Object.getPrototypeOf(pathing)._postRender.apply(this);
	};

	pathing._sizeChart = function(focusElem) {
		clearTimeout(this._wrapperAnimation);
		clearTimeout(this._scrollAnimation);
		var options = this._options, data = this._dataAdapter.data(),
			parent = d3.select(options.parent), self = this,
			infoWrapper = parent.selectAll('.pathing-cv-info-wrapper'),
			wrapper = infoWrapper.selectAll('.pathing-cv-wrapper'),
			container = wrapper.selectAll('.pathing-cv-container'),
			infoPane = infoWrapper.selectAll('.pathing-cv-info-pane'),
			parentWidth = options.parent.offsetWidth,
			parentHeight = options.parent.offsetHeight,
			visibleWidth = dv.util.getPercentValue(options.width, parentWidth),
			visibleHeight = dv.util.getPercentValue(options.height, parentHeight),
			adjustedWidth = visibleWidth - parseInt(infoPane.style('width'), 10), // TODO: make this dynamic, width of info pane
			padding = options.padding;

		// Number of columns that will be rendered
		var nodes = data && data.nodes || [],
			numCols = this._numColumns = nodes.length &&
				(Math.max.apply(null, nodes.map(function(n) { return n.column; } )) + 1) || 1,
			colNodeCount = [], maxNodes = 0;

		data.nodes.forEach(function(n, i) {
			if (colNodeCount[n.column]) { colNodeCount[n.column]++; }
			else { colNodeCount[n.column] = 1; }
		});
		maxNodes = colNodeCount.length && Math.max.apply(null, colNodeCount) || 0;

		// Determine the visible dimensions of the chart
		var containerWidth = adjustedWidth - 2, // adjust for borders
			containerHeight = visibleHeight - 2,
			neededWidth = (numCols * options.nodeWidth) + ((numCols - 1) * options.minNodeHorzPadding) + padding.left + padding.right,
			neededHeight = (maxNodes * options.avgNodeHeight) + (maxNodes * options.nodeVertPadding) + padding.top + padding.bottom,
			wider = neededWidth > adjustedWidth,
			taller = neededHeight > visibleHeight;

		// Check dimensions
		wrapper.classed('is-wider', wider);
		if ( wider ) { // will have horizontal scrolling
			containerWidth = neededWidth;
			containerHeight -= 20; // adjust for horizontal scrollbar
		}
		wrapper.classed('is-taller', taller);
		if ( taller ) { // will have vertical scrolling
			containerHeight = neededHeight;
			containerWidth -= 20; // adjust for vertical scrollbar
		}

		infoWrapper.style('width', visibleWidth + 'px').style('height', visibleHeight + 'px');
		wrapper.style('width', adjustedWidth + 'px').style('height', visibleHeight + 'px');
		container.style('width', containerWidth + 'px').style('height', containerHeight + 'px');
	};

	pathing._getInnerDimensions = function() {
		var options = this._options, padding = options.padding,
			container = d3.select(options.parent).select('.pathing-cv-container'),
			width = parseInt(container.style('width'), 10),
			height =  parseInt(container.style('height'), 10);
		return [width - padding.right - padding.left, height - padding.top - padding.bottom];
	};

	pathing._createDiagram = function() {
		var options = this._options, data = this._dataAdapter.data(),
			container = d3.select(options.parent).selectAll('.pathing-cv-container'),
			containerWidth = parseInt(container.style('width'), 10),
			containerHeight = parseInt(container.style('height'), 10),
			path = this._path = d3.pathing()
				.nodeWidth(options.nodeWidth)
				.nodePadding(options.nodeVertPadding)
				.size(this._getInnerDimensions())
				.nodes(data.nodes)
				.links(data.links)
				.minNodeHeight(options.minNodeHeight)
				.layout(options.interations);

		// Center if only 1 column
		// Must modify data now before links/nodes are processed
		if (!data.nodes.some(function(n) { return n.column !== 0; })) {
			var nodeWidth = path.nodeWidth(),
				padding = options.padding;
			data.nodes.forEach(function(d) {
				d.x += ((containerWidth - padding.left - padding.right) / 2) - (nodeWidth / 2);
			});
		}

		var link = this._updateLinks(path, data.links);
		this._updateNodes(path, data.nodes, link, containerHeight);

		// Force a redraw of the SVG because we sometimes get artifacts in Webkit
		var svg = d3.select(options.parent).select('.pathing-svg').node();
		svg.style.display = 'none';
		var h = svg.offsetHeight; // calling this will force the redraw, assigning because JSHINT doesn't like it by itself
		svg.style.display = '';
	};

	pathing._updateNodes = function(path, nodeData, link, height) {
		var self = this, options = this._options,
			svg = d3.select(options.parent).select('.pathing-svg-container'),
			nodeSelectHandler = this._options.onNodeSelect,
			padding = this._options.padding,
			isResize = (!this._changedOptions || !this._changedOptions.data),
			dur = (isResize) ? 0 : animationDuration;

		function dragmove(d) {
			var maxY = height - this.getBBox().height - padding.bottom;
			d3.select(this).attr('transform', 'translate(' + d.x + ',' + (d.y = Math.max(0, Math.min(maxY, d3.event.y))) + ')');
			path.relayout();
			link.attr('d', path.link());
		}

		var nodeGroup = svg.selectAll('.node-container').data([0]);
		nodeGroup.enter().append('g').classed('node-container', true);
		nodeGroup.exit().remove();

		var node = nodeGroup.selectAll('.node').data(nodeData, this._dataAdapter.nodeKey()),
			nodeWidth = path.nodeWidth();

		// position new nodes in the right column
		node.enter().append('g').classed('hide-node', true).attr('transform', function(d) { return 'translate(' + d.x + ',0)'; });
			/*.call(d3.behavior.drag()
				.origin(function(d) { return d; })
				.on('dragstart', function() { this.parentNode.appendChild(this); })
				.on('drag', dragmove));*/
		node.on('mouseover.node', function(d, i) { self._showNodePaths(d, this); })
			.on('mouseout.node', function(d, i) { self._hideNodePaths(); })
			.on('click.node', function(d, i) { self._activateNode(d, this); });
		var exitNodes = node.exit();
		exitNodes
			.classed('hide-node', true)
			.on('mouseover.node', null).on('mouseout.node', null)
			.on('click.node', null)
			.transition().duration(dur).style('opacity', 0).attr('transform', function(d) { return 'translate(' + d.x + ',0)'; });

		setTimeout(function() {
			exitNodes.remove();
		}, dur);

		node.transition().duration(dur).attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

		var numCols = this._numColumns;
		node.each(function(d, i) {
			var e = d3.select(this), isNew = e.classed('hide-node');
			e.attr('class', 'node'); // clear out other classes
			e.classed('hide-node', isNew);
			e.classed('filter', d.id === 'E_0');
			e.classed('exit-filter', d.id === 'X_0');
			if (d.classname) { e.classed(d.classname, true); }

			// Node background
			var rect = e.selectAll('.node-bg').data([d]);
			rect.enter().append('rect').classed('node-bg', true);
			rect.exit().remove();
			rect.attr('width', nodeWidth);
			rect.transition().duration(dur).attr('height', function(d) { return d.dy; });

			function setAlignment(d) {
				var midCol = true, firstCol = false, lastCol = false;
				if (numCols > 1) {
					firstCol = (0 === d.column);
					lastCol = (numCols - 1 === d.column);
					midCol = !(firstCol || lastCol);
				}
				d3.select(this)
					.attr('x', (midCol) ? nodeWidth/2 : (firstCol) ? 2 : nodeWidth - 4 )
					.attr('text-anchor', (midCol) ? 'middle' : (firstCol) ? 'start' : 'end');
			}

			function truncateTitle(title) {
				var maxChars = 20, endChars = 10, // middle truncation, leave 10 at the end
					delimiter = '\u2026'; // horizontal ellipsis
				if (title.length < maxChars) { return title; }
				return title.slice(0, maxChars - endChars) + delimiter + title.slice(title.length - endChars);
			}

			// Node title
			var text = e.selectAll('.node-title').data([d]);
			text.enter()
				.append('text')
				.classed('node-title', true)
				.attr('y', -5)
				.attr('transform', null);
			text.exit().remove();
			text.each(setAlignment);
			text.text(function(d) { return truncateTitle(d.label); });

			// Node total
			var num = e.selectAll('.node-total').data([d]);
			num.enter()
				.append('text')
				.classed('node-total', true)
				.attr('y', 15)
				.attr('transform', null);
			num.exit().remove();
			num.each(setAlignment);
			num.text(function(d) { return d3.format(',.0f')(d.value); });

			// Node hit area
			var hitArea = e.selectAll('.node-hit-area').data([d]);
			hitArea.enter().append('rect').classed('node-hit-area', true);
			hitArea.exit().remove();
			hitArea.attr('height', function(d) { return d.dy + 4; })
				.attr('y', -4)
				.attr('width', path.nodeWidth())
				.style('opacity', 0);

			setTimeout(function() {
				e.classed('hide-node', false);
			}, dur);

		});
	};

	pathing.gradientCounter = { // intentionally nested object so instances will share
		count : 0
	};
	pathing._updateLinks = function(path, linkData) {
		var options = this._options, self = this,
			svg = d3.select(options.parent).select('.pathing-svg-container'),
			container = d3.select(options.parent).selectAll('svg'),
			defs = container.selectAll('defs').data([0]),
			isResize = (!this._changedOptions || !this._changedOptions.data),
			dur = (isResize) ? 0 : animationDuration;

		defs.enter().append('defs');
		var group = defs.selectAll('.path-fills').data([0]),
			groupEnter = group.enter().append('g').classed('path-fills', true);

		// Create linear gradients
		// ID needs to be unique per graph so one graph doesn't use another
		// Browser was lowercasing 'linearGradient' so we had to add another attr (class) to key off of
		/*var gradId = 'cv-path-gradient' + (this.gradientCounter.count++),
			grads = group.selectAll('.cv-path-gradient').data(colors);

		grads.enter().append('linearGradient').classed('cv-path-gradient', true);
		grads.exit().remove();
		grads.each(function(d, i) {
			var grad = d3.select(this);
			grad.selectAll('stop').remove();
			if (i === colors.length - 1) { return; } // no gradient for last column
			grad.append('stop')
				.classed('stop1', true)
				.attr('offset', '0%')
				.attr('stop-color', d);
			grad.append('stop')
				.classed('stop2', true)
				.attr('offset', '100%')
				.attr('stop-color', colors[i+1]);
			grad.attr('id', gradId+i+'-'+(i+1));
		});*/

		var linkGroup = svg.selectAll('.link-container').data([0]);
		linkGroup.enter().append('g').classed('link-container', true);
		linkGroup.exit().remove();

		var linkOverlays = svg.selectAll('.path-overlay-container').data([0]);
		linkOverlays.enter().append('g').classed('path-overlay-container', true);
		linkOverlays.exit().remove();

		var link = linkGroup.selectAll('path').data(linkData, this._dataAdapter.linkKey());
		link.enter().append('path').classed('hide-link', true);
		link.on('mouseover.link', function(d, i) { self._showLinkPaths(d, this); })
			.on('mouseout.link', function(d, i) { self._hideLinkPaths(); })
			.on('click.link', function(d, i) { self._activateLink(d, this); });
		var exitLinks = link.exit();
			exitLinks
				.classed('hide-link', true)
				.on('click.link', null)
				.on('mouseover.link', null).on('mouseout.link', null);
			setTimeout(function() {
				exitLinks.remove();
			}, dur);
		link.each(function(d, i) {
			var e = d3.select(this), isNew = e.classed('hide-link');
			e.attr('class', function(d) { return !d.source ? 'entry' : !d.target ? 'exit' : 'link'; });
			e.classed('hide-link', isNew);
			if (e.classed('hide-link')) {
				e.attr('d', path.link()(d));
				setTimeout(function() {
					e.classed('hide-link', false);
				}, dur);
			} else {
				e.transition().duration(dur).attr('d', path.link()(d));
			}
			if (d.source && 'E_0' === d.source.id) {
				e.classed('entry-path', true);
			} else if (d.target && 'X_0' === d.target.id) {
				e.classed('exit-path', true);
			}
			var efilter = d.source && 'E_0' === d.source.id,
				xfilter = d.target && 'X_0' === d.target.id;
			e.classed('filter', efilter);
			e.classed('exit-filter', xfilter);
		});

		return link;
	};

	pathing._createGradients = function(svgContainer) {
		// Styles to apply gradients
		// We have to inline this as the url() is relative (FF enforces this)
		var styles = svgContainer.selectAll('style').data([0]);
		styles.enter().append('style');
		styles.text(function(d) {
			var style = '.pathing-svg .exit { fill: url(#exitFill); } \n';
			style += '.pathing-svg .entry { fill: url(#entryFill); } \n';
			style += '.pathing-svg .exit:hover { fill: url(#exitHighlightFill); } \n';
			style += '.pathing-svg .entry:hover { fill: url(#entryHighlightFill); } \n';
			style += '.pathing-svg .pivot-entry { mask: url(#pivotEnterMask); } \n';
			style += '.pathing-svg .pivot-exit { mask: url(#pivotExitMask); } \n';
			style += '.pathing-svg .link-container .entry-path { fill: url(#entryGradient); } \n';
			style += '.pathing-svg .link-container .exit-path { fill: url(#exitGradient); } \n';
			return style;
		});

		// Definitions for gradients/fills
		var defs = svgContainer.selectAll('defs').data([0]);
		defs.enter().append('defs');
		var group = defs.selectAll('.bounce-fills').data([0]),
			groupEnter = group.enter().append('g').classed('bounce-fills', true);

		var pivotEnterGrad = groupEnter.append('linearGradient').attr('id', 'pivotEnterGrad');
		pivotEnterGrad.append('stop').attr('offset', '0%').style('stop-color', '#fff').style('stop-opacity', 0);
		pivotEnterGrad.append('stop').attr('offset', '50%').style('stop-color', '#fff').style('stop-opacity', 0);
		pivotEnterGrad.append('stop').attr('offset', '70%').style('stop-color', '#fff').style('stop-opacity', 0.5);
		pivotEnterGrad.append('stop').attr('offset', '100%').style('stop-color', '#fff').style('stop-opacity', 1);
		var pivotEnterMask = groupEnter.append('mask').attr('id', 'pivotEnterMask')
			.attr('x', '0').attr('y', '0').attr('width', '1').attr('height', '1')
			.attr('maskUnits', 'objectBoundingBox').attr('maskContentUnits', 'objectBoundingBox');
		pivotEnterMask.append('rect')
			.attr('x', '0').attr('y', '0')
			.attr('width', '1').attr('height', '1')
			.attr('fill', 'url(#pivotEnterGrad)');

		var pivotExitGrad = groupEnter.append('linearGradient').attr('id', 'pivotExitGrad').attr('x1', '100%').attr('y1', '0%').attr('x2', '0%').attr('y2', '0%');
		pivotExitGrad.append('stop').attr('offset', '0%').style('stop-color', '#fff').style('stop-opacity', 0);
		pivotExitGrad.append('stop').attr('offset', '50%').style('stop-color', '#fff').style('stop-opacity', 0);
		pivotExitGrad.append('stop').attr('offset', '70%').style('stop-color', '#fff').style('stop-opacity', 0.5);
		pivotExitGrad.append('stop').attr('offset', '100%').style('stop-color', '#fff').style('stop-opacity', 1);
		var pivotExitMask = groupEnter.append('mask').attr('id', 'pivotExitMask')
			.attr('x', '0').attr('y', '0').attr('width', '1').attr('height', '1')
			.attr('maskUnits', 'objectBoundingBox').attr('maskContentUnits', 'objectBoundingBox');
		pivotExitMask.append('rect')
			.attr('x', '0').attr('y', '0')
			.attr('width', '1').attr('height', '1')
			.attr('fill', 'url(#pivotExitGrad)');

		var entryGradient = groupEnter.append('linearGradient').attr('id', 'entryGradient').attr('x1', '0%').attr('y1', '100%').attr('x2', '100%').attr('y2', '100%');
		entryGradient.append('stop').attr('offset', '0%').style('stop-color', '#8cc350');
		entryGradient.append('stop').attr('offset', '100%').style('stop-color', '#3287D2');

		var exitGradient = groupEnter.append('linearGradient').attr('id', 'exitGradient').attr('x1', '0%').attr('y1', '100%').attr('x2', '100%').attr('y2', '100%');
		exitGradient.append('stop').attr('offset', '0%').style('stop-color', '#3287D2');
		exitGradient.append('stop').attr('offset', '100%').style('stop-color', '#cc2539');

		var exitFill = groupEnter.append('linearGradient').attr('id', 'exitFill').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
		exitFill.append('stop').attr('offset', '0%').style('stop-color', '#FA5A50').style('stop-opacity', 0.5);
		exitFill.append('stop').attr('offset', '85%').style('stop-color', '#FA5A50').style('stop-opacity', 0.5);
		exitFill.append('stop').attr('offset', '100%').style('stop-color', '#FA5A50').style('stop-opacity', 0.1);

		var exitHighlightFill = groupEnter.append('linearGradient').attr('id', 'exitHighlightFill').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
		exitHighlightFill.append('stop').attr('offset', '0%').style('stop-color', '#FA5A50').style('stop-opacity', 1);
		exitHighlightFill.append('stop').attr('offset', '85%').style('stop-color', '#FA5A50').style('stop-opacity', 1);
		exitHighlightFill.append('stop').attr('offset', '100%').style('stop-color', '#FA5A50').style('stop-opacity', 0.1);

		var entriesFill = groupEnter.append('linearGradient').attr('id', 'entryFill').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
		entriesFill.append('stop').attr('offset', '0%').style('stop-color', '#58AF5E').style('stop-opacity', 0.1);
		entriesFill.append('stop').attr('offset', '15%').style('stop-color', '#58AF5E').style('stop-opacity', 0.5);
		entriesFill.append('stop').attr('offset', '100%').style('stop-color', '#58AF5E').style('stop-opacity', 0.5);

		var entriesHighlightFill = groupEnter.append('linearGradient').attr('id', 'entryHighlightFill').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
		entriesHighlightFill.append('stop').attr('offset', '0%').style('stop-color', '#58AF5E').style('stop-opacity', 0.1);
		entriesHighlightFill.append('stop').attr('offset', '15%').style('stop-color', '#58AF5E').style('stop-opacity', 1);
		entriesHighlightFill.append('stop').attr('offset', '100%').style('stop-color', '#58AF5E').style('stop-opacity', 1);
	};

	pathing._setOptionContainerContent = function(container, data) {
		var options = this._options, content = '', node, numOptions = 0,
			last = container.classed('is-last-column'), adapter = this._dataAdapter,
			l10n = adapter.l10n.labels.pathing,
			nodeOptions = [
				{ id : 'expand', label : l10n.expand, valid : (options.expandNode && adapter.canExpandNode(data)) },
				{ id : 'pivot', label : l10n.focus, valid : (options.pivotNode && adapter.canPivotNode(data)) },
				{ id : 'collapse', label : l10n.collapse, valid : (options.collapseNode && adapter.canCollapseNode(data)) }
			];
		if (last) { nodeOptions.reverse(); } // display in reverse order
		nodeOptions = nodeOptions.filter(function(n) { return n.valid; });

		if (options.expandNode || options.collapseNode || options.pivotNode) {
			for (var i=0, ii=nodeOptions.length; i<ii; ++i) {
				node = nodeOptions[i];
				content += '<a class="cv-node-option cv-node-option'+
					((last) ? (ii - numOptions - 1) : numOptions) +' cv-node-' + node.id +
					'"><i class="'+node.id+'"></i><span>' + node.label + '</span></a>';
				++numOptions;
			}
		}
		content = '<div class="cv-node-options num-options-'+ numOptions +'">' + content + '</div>';
		container.html(content);
	};

	pathing._activateNode = function(data, node) {
		var self = this;

		// toggle node on/off
		if (this._pathLocked && data === this._pathLocked.data) {
			self._unlockNode(data, node)();
			// allow pivot node to relock on new side
			var side = (d3.mouse(node)[0] >= self._options.nodeWidth/2) ? 1 : -1; // left side = -1, right side = 1
			if (!data.isPivot || side === self._lastSide) {
				return;
			}
		}
		this._setPathLocked({ data: data, elem: node });
		d3.select(self._options.parent).select('.pathing-cv-container')
			.on('click.node', null)
			.on('click.link', null);
		d3.selectAll('.cv-node-active').classed('cv-node-active', false);
		d3.selectAll('.cv-link-active').classed('cv-link-active', false);
		d3.select(node).classed('cv-node-active', true);

		// show paths (if necessary)
		// this must be called before information so paths are set
		this._renderNodePaths(data, node);

		// show buttons on node
		this._showNodeOptions(data, node);

		// update/show info pane
		this._showInformation(data, node);

		// scroll
		this._scrollToElem(node);

		setTimeout(function() {
			d3.select(self._options.parent).select('.pathing-cv-container')
				.on('click.node', self._unlockNode(data, node));
		}, 10);
	};

	// on hover, render the node paths
	pathing._showNodePaths = function(data, node) {
		if (this._pathLocked) { return; }

		// show link overlays
		this._renderNodePaths(data, node);
	};

	pathing._renderNodePaths = function(data, node, resize) {
		var parent = d3.select(this._options.parent).select('.pathing-cv-container');
		// if we were going to hide, don't now
		clearTimeout(this._hidePathOverlaysTimer);

		// Avoid re-rendering of same paths
		parent.on('mousemove.node', null);
		if (this._pathedObj && this._pathedObj.data === data && !resize) {
			return;
		}
		this._setPathedObj({ data: data, elem: node });

		var side = 0, self = this, overlays, paths,
			nodePaths = this._dataAdapter.nodePaths(data);

		// determine side of the node that we are over
		function sideLinkPaths() {
			// filter out one side or the other only if we have BOTH
			// full paths (no nulls) that start and end on the node aka pivot
			paths = self._activePaths = nodePaths.filter(function(p) {
				var index = p.nodes.indexOf(data._pid);
				return (side > 0 && index + 1 < p.nodes.length) ||
					(side < 0 && index > 0);
			});
			overlays = self._dataAdapter.nodePathData(paths, data, side);
			self._createPathOverlays(overlays);
		}

		function updateLinkPaths() {
			var x = 0;
			// d3 throws a javascript error if no mouse event occurred before we call
			try { x = d3.mouse(node)[0]; } // catch if there is no mouse event
			catch (e) {}
			var newSide = (x >= self._options.nodeWidth/2) ? 1 : -1; // left side = -1, right side = 1
			if (newSide !== side) {
				self._lastSide = side = newSide;
				sideLinkPaths();
			}
		}
		// determine if we need to handle sides of the node or just draw all paths
		if (data.isPivot) {
			if (resize) {
				side = self._lastSide;
				sideLinkPaths();
			} else {
				updateLinkPaths(); // set the side and overlays
				if (!self._pathLocked) {
					parent.on('mousemove.node', function(d, i) { updateLinkPaths(); });
				}
			}
		} else {
			self._lastSide = 0;
			self._activePaths = nodePaths;
			overlays = this._dataAdapter.nodePathData(nodePaths, data, side);
			self._createPathOverlays(overlays);
		}

		setTimeout(function() {
			parent.classed('path-overlays', true);
		}, 1);
	};

	pathing._showNodeOptions = function(data, node) {
		var self = this, numCols = this._numColumns,
			parent = d3.select(this._options.parent).select('.pathing-cv-container'),
			offsetContainer = parent.node(),
			options = this._options, delay = 50,
			rectNode = d3.select(node).select('.node-bg').node(),
			containerBounds = offsetContainer.getBoundingClientRect(),
			nodeBounds = rectNode.getBoundingClientRect(),
			top = nodeBounds.top - containerBounds.top,
			left = nodeBounds.left - containerBounds.left + (options.nodeWidth / 2),
			optionContainer = parent.select('.cv-path-node-options');

		if (optionContainer.empty()) {
			optionContainer = parent.append('div').classed('cv-path-node-options', true).attr('node', data._pid);
		} else if (optionContainer.attr('node') == data._pid && optionContainer.classed('is-open')){
			// just update the position, due to resize
		} else {
			this._removeNodeOptions();
			delay = 300; // wait for previous to close, better UI and performs better
			optionContainer = parent.append('div').classed('cv-path-node-options', true).attr('node', data._pid);
		}

		optionContainer
			.classed('is-last-column', (numCols > 1 && numCols - 1 === data.column))
			.style('top', top + 'px')
			.style('left', left + 'px');
		this._setOptionContainerContent(optionContainer, data);

		setTimeout(function() {
			optionContainer.classed('is-open', true);
		}, delay);
	};

	pathing._formatMetricValue = function(d) {
		return this._formatNumber('decimal', d.value) + ' ' + this._options.metricName;
	};

	pathing._formatPathInformation = function(t) {
		var options = this._options, self = this, colors = options.colors;
		return function(d, i) {
			var endNode = self._dataAdapter.getPathEnd(d),
				total = endNode ? (endNode.value) ? endNode.value : t : t, // if node and value is > 0, use it
				content = '', value = d.values[0], percent = value / total;
			i = i % colors.length;
			content += '<span class="pathing-path-marker" style="background-color: ' + colors[i] + '"></span>';
			// todo avg values if necessary
			content += '<span class="pathing-path-value"><span class="pathing-path-num">' + self._formatNumber('decimal', value) + '</span> <span class="pathing-path-perc">' +
				self._formatNumber('percent', percent) + '</span></span>';
			return content;
		};
	};

	pathing._highlightPath = function(data, index, elem) {
		var options = this._options, parent = options.parent,
			e = d3.event, lock = !e || (e && 'click' === e.type),
			container = d3.select(parent).selectAll('.path-overlay-container'),
			infoContainer = d3.select(parent).selectAll('.pathing-cv-info-pane'),
			line = container.selectAll('.link.path'+index),
			links = container.selectAll('.link:not(.path'+index+')');

			if (lock) { // tap, lock or unlock
				if (this._lineLocked === data) { // toggle
					this._setLineLock(null);
					return this._removeHightlightPath();
				}
				this._setLineLock(data);
				infoContainer.selectAll('.locked').classed('locked', false);
				d3.select(elem).classed('locked', true);
			} else if (this._lineLocked) { return; } // hover doesn't update when locked

			container.selectAll('.link.inactive').classed('inactive', false);
			links.classed('inactive', true);
			line.classed('active', true);
	};

	pathing._setLineLock = function(d) {
		var options = this._options;
		if (this._lineLocked === d) { return; } // only fire event if different
		this._lineLocked = d;
		this._callPathSelected(d);
	};

	pathing._setPathedObj = function(d) {
		this._pathedObj = d;
	};

	pathing._setPathLocked = function(d) {
		var options = this._options;
		if (this._pathLocked === d) { return; } // only fire event if different
		this._pathLocked = d;
		this._callPathSelected();
	};

	pathing._callPathSelected = function(path) {
		var params = {}, options = this._options,
			data = this._pathLocked && this._pathLocked.data || {};
		if (path) {
			params.path = path.nodes + '';
		}
		if ('undefined' !== typeof data._pid) {
			params.node = data._pid;
			params.side = this._lastSide;
		}
		if ('undefined' !== typeof data.source || 'undefined' !== typeof data.target) {
			params.source =  (data.source) ? data.source._pid : null;
			params.target = (data.target) ? data.target._pid : null;
		}
		if('function' == typeof options.pathSelected) {
			options.pathSelected(params, this._pathLocked, path);
		}
	};

	pathing._removeHightlightPath = function() {
		if (this._lineLocked) { return; }
		var options = this._options, parent = options.parent,
			infoContainer = d3.select(parent).selectAll('.pathing-cv-info-pane'),
			links = d3.select(parent).selectAll('.path-overlay-container').selectAll('.link');
			links.classed('inactive', false).classed('active', false);
			infoContainer.selectAll('.locked').classed('locked', false);
	};

	pathing._showInformation = function(data, elem) {
		var self = this, options = this._options, content = '',
			isNode = this._isDataObjNode(data),
			l10n = this._dataAdapter.l10n.labels.pathing,
			pane = d3.select(this._options.parent).select('.pathing-cv-info-pane'),
			paneTitle = pane.selectAll('.pathing-cv-info-title'),
			paneValue = pane.selectAll('.pathing-cv-info-value'),
			panePaths = pane.selectAll('.pathing-cv-info-paths');

		this._setLineLock(null);
		this._removeHightlightPath();

		// Handle link/node
		var label, value = this._formatMetricValue(data),
			last = false;
		if (isNode) {
			label = data.label;
			value = this._formatMetricValue(data);
			last = (data.column == this._numColumns - 1);
		} else {
			var pattern = l10n.percOfNode;
			if (!data.source) {
				label = l10n['nodeEntries'].replace(/\{label\}/i, data.target.label);
				value = this._formatMetricValue(data) + '<span class="perc">' +
					pattern
						.replace(/\{perc\}/i, this._formatNumber('percent', data.value / data.target.value))
						.replace(/\{label\}/i, data.target.label) + '</span>';
			} else if (!data.target) {
				label = l10n['nodeExits'].replace(/\{label\}/i, data.source.label);
				value = this._formatMetricValue(data) + '<span class="perc">' +
					pattern
						.replace(/\{perc\}/i, this._formatNumber('percent', data.value / data.source.value))
						.replace(/\{label\}/i, data.source.label) + '</span>';
			} else {
				var adapter = this._dataAdapter,
					dir = adapter.getPathDirection(adapter.data().paths[data.paths[0]]),
					node = (dir < 0) ? data.target : data.source;
				label = l10n['nodeToNode']
					.replace(/\{source\}/i, data.source.label)
					.replace(/\{target\}/i, data.target.label);
				value = this._formatMetricValue(data) + '<span class="perc">' +
					pattern
						.replace(/\{perc\}/i, this._formatNumber('percent', data.value / node.value))
						.replace(/\{label\}/i, node.label) + '</span>';
			}
		}
		pane.classed('is-last-column', last);
		paneTitle.html(label);
		paneValue.html(value);

		// Add path info
		var pathTitle = panePaths.selectAll('.pathing-cv-path-title').data([0]);
		pathTitle.enter().append('span').classed('pathing-cv-path-title', true);
		pathTitle.html(this._dataAdapter.activePathsTitle(this._activePaths));
		var path = panePaths.selectAll('.pathing-cv-path-info').data(this._activePaths);
		path.enter().append('span').classed('pathing-cv-path-info', true);

		path.on('click.line', function(d, i) { self._highlightPath(d, i, this); })
			.on('mouseover.line', function(d, i) { self._highlightPath(d, i, this); })
			.on('mouseout.line', function(d, i) { self._removeHightlightPath(); })
			.html(this._formatPathInformation(data.value));
		path.exit()
			.on('click.line', null)
			.on('mouseover.line', null).on('mouseout.line', null).remove();
	};

	pathing._defaultInformation = function() {
		this._setLineLock(null);
		this._removeHightlightPath();

		var pane = d3.select(this._options.parent).select('.pathing-cv-info-pane'),
			paneTitle = pane.selectAll('.pathing-cv-info-title'),
			paneValue = pane.selectAll('.pathing-cv-info-value'),
			panePaths = pane.selectAll('.pathing-cv-info-paths'),
			l10n = this._dataAdapter.l10n.labels.pathing;

		// Explanation on pathing TODO: Localize
		var help = '<p>'+ l10n.help1 + '</p>';
		help += '<p>'+ l10n.help2 + '</p>';
		help += '<p>'+ l10n.help3 + '</p>';
		// Focus
		help += '<p><span class="cv-node-option"><i class="pivot"></i></span><span class="cv-option-title">'+ l10n.focus + '</span></p>';
		help += '<p>'+ l10n.focusHelp + '</p>';
		// Expand
		help += '<p><span class="cv-node-option"><i class="expand"></i></span><span class="cv-option-title">'+ l10n.expand + '</span></p>';
		help += '<p>'+ l10n.expandHelp + '</p>';
		// Collapse
		help += '<p><span class="cv-node-option"><i class="collapse"></i></span><span class="cv-option-title">'+ l10n.collapse + '</span></p>';
		help += '<p>'+ l10n.collapseHelp + '</p>';

		paneTitle.html(l10n.title);
		paneValue.html('<div class="help">'+help+'</div>');
		panePaths.html('');
	};

	pathing._scrollToElem = function(elem) {
		// scroll to show node if needed
		var options = this._options,
			parent = d3.select(this._options.parent).select('.pathing-cv-container'),
			offsetContainer = parent.node(),
			wrapper = d3.select(options.parent).select('.pathing-cv-wrapper'),
			node = d3.select(elem),
			rectNode = (!node.selectAll('.node-bg').empty()) ? node.select('.node-bg').node() : node.node(),
			containerBounds = offsetContainer.getBoundingClientRect(),
			nodeBounds = rectNode.getBoundingClientRect(),
			top = nodeBounds.top - containerBounds.top,
			left = nodeBounds.left - containerBounds.left + (options.nodeWidth / 2);

		// no scroll, return
		if (!wrapper.classed('is-wider') && !wrapper.classed('is-taller')) { return; }

		function scrollTween(offsetX, offsetY) {
			return function() {
				var iX = (offsetX !== null) ? d3.interpolateNumber(wrapper.node().scrollLeft, offsetX) : null,
					iY = (offsetY !== null) ? d3.interpolateNumber(wrapper.node().scrollTop, offsetY) : null;
				return function(t) {
					if (iX !== null) { wrapper.node().scrollLeft = iX(t); }
					if (iY !== null) { wrapper.node().scrollTop = iY(t); }
				};
			};
		}

		var scrollX = null, scrollY = null;
		if (wrapper.classed('is-wider')) {
			var viewportWidth = parseInt(wrapper.style('width'), 10),
				visibleWidth = parseInt(parent.style('width'), 10);

			scrollX = Math.min(visibleWidth - viewportWidth,
						Math.max(0, left - (viewportWidth / 2)));
		}
		if (wrapper.classed('is-taller')) {
			var viewportHeight = parseInt(wrapper.style('height'), 10),
				visibleHeight = parseInt(parent.style('height'), 10);
			scrollY = Math.min(visibleHeight - viewportHeight,
						Math.max(0, top + 40 - (viewportHeight / 2))); // 40 adjust for title
		}

		d3.transition()
		    .duration(300)
		    .tween('scroll', scrollTween(scrollX, scrollY));
	};

	pathing._unlockNode = function(data, node) {
		var self = this;
		return function(d, i) {
			self._setPathLocked(null);
			d3.select(self._options.parent).select('.pathing-cv-container')
				.on('click.node', null);
			self._deactivateNode(d3.event, data, node);
		};
	},

	pathing._deactivateNode = function(e, d, node) {
		var target = d3.select(e.target),
			options = this._options, data = d || {};
		d3.select(node).classed('cv-node-active', false);
		this._removeNodeOptions(false);
		this._defaultInformation();
		this._hideNodePaths();

		// Handle click on options
		// These must be handled AFTER cleanup since they could change data in sync
		if ('click' === e.type) {
			if (!target.classed('cv-node-option')) { // handle nested elements getting click event
				target = d3.select(target.node().parentNode);
			}
			if (target.classed('cv-node-expand') && ('function' === typeof options.expandNode)) {
				options.expandNode(data);
			}
			if (target.classed('cv-node-collapse') && ('function' === typeof options.collapseNode)) {
				options.collapseNode(data);
			}
			if (target.classed('cv-node-pivot') && ('function' === typeof options.pivotNode)) {
				options.pivotNode(data);
			}
		}
	};

	// Remove the node options popup
	pathing._removeNodeOptions = function(now) {
		var container = d3.selectAll('.cv-path-node-options');
		container.classed('is-open', false);
		setTimeout(function() { container.remove(); }, (now) ? 0 : 300); // give time to animate off
	};

	pathing._hideNodePaths = function() {
		var parent = d3.select(this._options.parent).select('.pathing-cv-container');
		parent.on('mousemove.node', null);
		if (this._pathLocked) { return; }
		this._removePathOverlays(parent);
	};

	pathing._activateLink = function(data, link) {
		var self = this;

		// toggle link on/off
		if (this._pathLocked && data === this._pathLocked.data) {
			self._unlockLink(data, link);
			return;
		}
		this._setPathLocked({ data: data, elem: link });

		d3.select(self._options.parent).select('.pathing-cv-container')
			.on('click.node', null)
			.on('click.link', null);
		d3.selectAll('.cv-node-active').classed('cv-node-active', false);
		d3.selectAll('.cv-link-active').classed('cv-link-active', false);
		d3.select(link).classed('cv-link-active', true);
		this._removeNodeOptions(); // handle popped up node options

		// show paths (if necessary)
		// this must be called before information so paths are set
		this._renderLinkPaths(data, link);

		// update/show info pane
		this._showInformation(data, link);

		// scroll
		this._scrollToElem(link);

		setTimeout(function() {
			d3.select(self._options.parent).select('.pathing-cv-container')
				.on('click.link', self._unlockLink(data, link));
		}, 10);
	};

	// on hover, render the link paths
	pathing._showLinkPaths = function(data, link) {
		if (this._pathLocked) { return; }

		// show link overlays
		this._renderLinkPaths(data, link);
	};

	pathing._renderLinkPaths = function(data, link, resize) {
		// if we were going to hide, don't now
		clearTimeout(this._hidePathOverlaysTimer);

		// Avoid re-rendering of same paths
		if (this._pathedObj && this._pathedObj.data === data && !resize) {
			return;
		}
		this._setPathedObj({ data: data, elem: link });

		// show link overlay
		var adapter = this._dataAdapter;
		this._activePaths = adapter.linkSortActivePaths(data);
		this._createPathOverlays(adapter.linkPathData(this._activePaths));

		var parent = d3.select(this._options.parent).select('.pathing-cv-container');
		setTimeout(function() {
			parent.classed('path-overlays', true);
		}, 1);
	};

	pathing._unlockLink = function(data, link) {
		var self = this;
		return function(d, i) {
			self._setPathLocked(null);
			d3.select(self._options.parent).select('.pathing-cv-container')
				.on('click.link', null);
			self._deactivateLink(d3.event, data, link);
		};
	},

	pathing._deactivateLink = function(e, d, link) {
		var parent = d3.select(this._options.parent).select('.pathing-cv-container');
		d3.select(link).classed('cv-link-active', false);
		this._defaultInformation();
		this._hideLinkPaths();
	};

	pathing._hideLinkPaths = function() {
		var parent = d3.select(this._options.parent).select('.pathing-cv-container');
		if (this._pathLocked) { return; }
		this._removePathOverlays(parent);
	};

	pathing._createPathOverlays = function(links) {
		// Graph the additional link content as an overlay
		var options = this._options, path = this._path,
			linkOverlay = d3.select(options.parent).select('.path-overlay-container'),
			link = linkOverlay.selectAll('path').data(links);
		link.enter().append('path');
		link.exit().remove();
		link.attr('class', function(d) {
				var pivot = (d.pivotStart) ? ' pivot-entry' : (d.pivotEnd) ? ' pivot-exit' : '';
				return 'link path' + d.path + pivot;
			})
			.attr('d', path.link())
			.attr('style', function(d, i) {
				var p = d.path % options.colors.length;
				return 'fill: ' + options.colors[p] + ';';
			})
			.sort(function(a, b) { // handle null values
				if (!a && !b) { return 0; }
				if (!a) { return 1; }
				if (!b) { return -1; }
				return b.dy - a.dy;
			});
	};

	pathing._removePathOverlays = function(parent) {
		clearTimeout(this._hidePathOverlaysTimer);
		this._setPathedObj(null);
		this._hidePathOverlaysTimer = setTimeout(function() {
			parent.classed('path-overlays', false);
		}, 20);
	};

	pathing._isDataObjNode = function(data) {
		return ('undefined' !== typeof data._pid);
	};

	/**
	 * Takes a data object with a path array and an _pid for a node or src/target _pids for a link
	 * If that node/link has that path, we lock the node/path and highlight the path
	 * @param {object} sel
	 *
	 * <pre><code>
	 *     {
	 *         path: '0,12,9,1',
	 *         node: '0'
	 *			// or
	 *         source: '12', // null
	 *         target: '9'
	 *     }
	 * </code></pre>
	 */
	pathing.setActivePath = function(params) {
		var options = this._options, self = this,
			data = this._dataAdapter.data();
		params = params || {};

		// Handle node/link first
		var isNode = ('undefined' !== typeof params.node), type, elems;
		if (isNode) {
			type = data.nodesById[params.node];
		} else {
			type = data.links.filter(function(l) {
				return ((!l.source && !params.source) || // both sources are null
						(l.source && params.source && l.source._pid + '' === params.source)) && // sources match
						((!l.target && !params.target) || // both targets are null
						(l.target && params.target && l.target._pid + '' === params.target)); // targets match
			});
			type = type.length && type[0] || null;
		}
		elems = (isNode) ? '.node' : '.link';
		if (!type) { return; }

		// Handle path if it exists
		var hasPath = false, path;
		hasPath = data.paths.some(function(p) {
			path = p.nodes;
			return p.nodes.toString() === params.path;
		});

		d3.select(options.parent).selectAll(elems).each(function(d, i) {
			if (d === type) {
				if (isNode) {
					self._activateNode(d, this);
				} else {
					self._activateLink(d, this);
				}
				if (!hasPath) { return; }
				d3.select(options.parent).selectAll('.pathing-cv-path-info').filter(function(d, i) {
					if (d.nodes.toString() === path.toString()) {
						self._highlightPath(d, i, this);
					}
				});
			}
		});
	};

	global.cloudViz.pathing = cloudViz.util.createConstructor(pathing);
}(this));
/*global d3*/
(function(global) {
	'use strict';

	d3.pathing = function() {
		var pathing = {},
			nodeWidth = 24,
			nodePadding = 8,
			size = [1, 1],
			nodes = [],
			links = [],
			numColumns = NaN,
			minNodeHeight = 0;

		pathing.nodeWidth = function(_) {
			if (!arguments.length) { return nodeWidth; }
			nodeWidth = +_;
			return pathing;
		};

		pathing.nodePadding = function(_) {
			if (!arguments.length) { return nodePadding; }
			nodePadding = +_;
			return pathing;
		};

		pathing.nodes = function(_) {
			if (!arguments.length) { return nodes; }
			nodes = _;
			return pathing;
		};

		pathing.links = function(_) {
			if (!arguments.length) { return links; }
			links = _;
			return pathing;
		};

		pathing.size = function(_) {
			if (!arguments.length) { return size; }
			size = _;
			return pathing;
		};

		pathing.numColumns = function() {
			return numColumns;
		};

		// Enforces a minimum height restriction on a node.  BE CAREFUL WITH THIS PROPERTY!
		// The minNodeHeight property will distort data by weighting smaller nodes more than
		// larger nodes.  1px seems to be ok (so you can actually see the node) and doesn't
		// noticeably distort the data.
		pathing.minNodeHeight = function(_) {
			if (!arguments.length) { return minNodeHeight; }
			minNodeHeight = _;
			return pathing;
		};

		pathing.layout = function(iterations) {
			computeNodeLinks();
			computeNodeValues();
			computeNodeBreadths();
			computeNodeDepths(iterations);
			computeLinkDepths();
			return pathing;
		};

		pathing.relayout = function() {
			computeLinkDepths();
			return pathing;
		};

		pathing.link = function() {
			var curvature = 0.5;

			function link(d) {
				var x0, x1, xi, x2, x3, x4, x5, y0, y1, y2, y3,
					curveWidth, curveHeight,
					heightOffset = 5, maxWidth = 15;

				// determine the size of the curve based on dy for entry/exit
				curveWidth = curveHeight = Math.min(d.dy + heightOffset, maxWidth);
				if (d.source === null) {
					x0 = d.target.x - curveWidth;
					x1 = d.target.x;
					y0 = d.target.y - heightOffset;
					y1 = d.target.y + d.dy;
					return 'M' + x0 + ',' + y0 +
							'h' + curveWidth + 'v' + (y1 - y0) +
							'c-' + curveWidth + ',0' +
							',-' + curveWidth + ',-' + (curveHeight/2) +
							',-' + curveWidth + ',-' + curveHeight +
							'z';
				}
				if (d.target === null) {
					x0 = d.source.x + d.source.dx;
					x1 = d.source.x + d.source.dx + curveWidth;
					y0 = d.source.y + d.source.dy - d.dy;
					y1 = d.source.y + d.source.dy + heightOffset;
					return 'M' + x1 + ',' + y1 +
							'h-' + curveWidth + 'v-' + (y1 - y0) +
							'c' + curveWidth + ',0' +
							',' + curveWidth + ',' + (curveHeight/2) +
							',' + curveWidth + ',' + curveHeight +
							'V' + y1 + 'z';
				}

				x0 = d.source.x + d.source.dx,
				x1 = d.target.x,
				xi = d3.interpolateNumber(x0, x1),
				x2 = xi(curvature),
				x3 = xi(1 - curvature),
				x4 = x3 + ((d.dy < 15) ? ((d.source.y < d.target.y) ? -1 * d.dy : d.dy) : 0),
				x5 = x2 + ((d.dy < 15) ? ((d.source.y < d.target.y) ? -1 * d.dy : d.dy) : 0),
				y0 = d.source.y + d.sy,
				y1 = d.target.y + d.ty,
				y2 = y1 + d.dy,
				y3 = y0 + d.dy;
				return 'M' + x0 + ',' + y0 +
						'C' + x2 + ',' + y0 +
						' ' + x3 + ',' + y1 +
						' ' + x1 + ',' + y1 +
						'v' + d.dy +
						'C' + x4 + ',' + y2 +
						' ' + x5 + ',' + y3 +
						' ' + x0 + ',' + y3 + 'Z';
			}

			link.curvature = function(_) {
				if (!arguments.length) { return curvature; }
				curvature = +_;
				return link;
			};

			return link;
		};

		// Populate the sourceLinks and targetLinks for each node.
		// Also, if the source and target are not objects, assume they are indices.
		function computeNodeLinks() {
			nodes.forEach(function(node) {
				node.sourceLinks = [];
				node.targetLinks = [];
				node.entryLinks = [];
				node.exitLinks = [];
			});
			links.forEach(function(link) {
				var source = link.source,
						target = link.target;

				if (source !== null && typeof source === 'number') { source = link.source = nodes[link.source]; }
				if (target !== null && typeof target === 'number') { target = link.target = nodes[link.target]; }

				if (source !== null && target !== null) {
					source.sourceLinks.push(link);
					target.targetLinks.push(link);
				}
				else if (source === null) {
					target.entryLinks.push(link);
				}
				else {
					source.exitLinks.push(link);
				}
			});
		}

		// Compute the value (size) of each node by summing the associated links.
		function computeNodeValues() {
			nodes.forEach(function(node) {
				// If the node has a property "total", disregard the adding up of links and just use that for the value (size).
				if (node.hasOwnProperty('total')) {
					node.value = node.total;
				}
				else {
					node.value = Math.max(
						d3.sum(node.sourceLinks, value) + d3.sum(node.exitLinks, value),
						d3.sum(node.targetLinks, value) + d3.sum(node.entryLinks, value)
					);
				}
			});
			function hasLinks(node) {
				return (node.sourceLinks && node.sourceLinks.length) ||
						(node.targetLinks && node.targetLinks.length) ||
						(node.exitLinks && node.exitLinks.length) ||
						(node.entryLinks && node.entryLinks.length);
			}
			// sort node values
			nodes.sort(function(a, b) {
				// sort nodes with links before those that don't
				var al = hasLinks(a), bl = hasLinks(b);
				if (al && !bl) { return -1; }
				if (bl && !al) { return 1; }
				// if same on links, sort on value
				return b.value - a.value;
			});
		}

		// Iteratively assign the breadth (x-position) for each node.
		// Nodes are assigned the maximum breadth of incoming neighbors plus one;
		// nodes with no incoming links are assigned breadth zero, while
		// nodes with no outgoing links are assigned the maximum breadth.
		function computeNodeBreadths() {
			var x = 0,
				columns = [],
				nodeSize = size[0] - nodeWidth;

			nodes.forEach(function(node) {
				node.x = node.column;
				node.dx = nodeWidth;
				if (columns.indexOf(node.column) < 0) {
					columns.push(node.column);
					node.columnIndex = columns.length - 1;
				}
				else {
					node.columnIndex = columns.indexOf(node.column);
				}
			});

			numColumns = columns.length;
			scaleNodeBreadths(numColumns > 1 ? nodeSize / (numColumns - 1) : nodeSize);
		}

		function moveSourcesRight() {
			nodes.forEach(function(node) {
				if (!node.targetLinks.length) {
					node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
				}
			});
		}

		function moveSinksRight(x) {
			nodes.forEach(function(node) {
				if (!node.sourceLinks.length) {
					node.x = x - 1;
				}
			});
		}

		function scaleNodeBreadths(kx) {
			nodes.forEach(function(node) {
				node.x *= kx;
			});
		}

		function computeNodeDepths(iterations) {
			var nodesByBreadth = d3.nest()
				.key(function(d) { return d.x; })
				.sortKeys(d3.ascending)
				.entries(nodes)
				.map(function(d) { return d.values; });

			function initializeNodeDepth() {
				var ky = d3.min(nodesByBreadth, function(nodes) {
					var sum = d3.sum(nodes, value) || 1;
					return (size[1] - (nodes.length - 1) * nodePadding) / sum;
				});

				nodesByBreadth.forEach(function(nodes) {
					nodes.forEach(function(node, i) {
						node.y = i;
						node.dy = Math.max(minNodeHeight, node.value * ky);
					});
				});

				links.forEach(function(link) {
					link.dy = link.value * ky;
				});
			}

			function relaxLeftToRight(alpha) {
				nodesByBreadth.forEach(function(nodes, breadth) {
					nodes.forEach(function(node) {
						if (node.targetLinks.length) {
							var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
							node.y += (y - center(node)) * alpha;
						}
					});
				});

				function weightedSource(link) {
					return center(link.source) * link.value;
				}
			}

			function relaxRightToLeft(alpha) {
				nodesByBreadth.slice().reverse().forEach(function(nodes) {
					nodes.forEach(function(node) {
						if (node.sourceLinks.length) {
							var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
							node.y += (y - center(node)) * alpha;
						}
					});
				});

				function weightedTarget(link) {
					return center(link.target) * link.value;
				}
			}

			function resolveCollisions() {
				nodesByBreadth.forEach(function(nodes) {
					var node,
							dy,
							y0 = 0,
							n = nodes.length,
							i;

					// Push any overlapping nodes down.
					nodes.sort(ascendingDepth);
					for (i = 0; i < n; ++i) {
						node = nodes[i];
						dy = y0 - node.y;
						if (dy > 0) { node.y += dy; }
						y0 = node.y + node.dy + nodePadding;
					}

					// If the bottommost node goes outside the bounds, push it back up.
					dy = y0 - nodePadding - size[1];
					if (dy > 0) {
						y0 = node.y -= dy;

						// Push any overlapping nodes back up.
						for (i = n - 2; i >= 0; --i) {
							node = nodes[i];
							dy = node.y + node.dy + nodePadding - y0;
							if (dy > 0) { node.y -= dy; }
							y0 = node.y;
						}
					}
				});
			}

			function ascendingDepth(a, b) {
				return a.y - b.y;
			}

			initializeNodeDepth();
			resolveCollisions();
			for (var alpha = 1; iterations > 0; --iterations) {
				relaxRightToLeft(alpha *= 0.99);
				resolveCollisions();
				relaxLeftToRight(alpha);
				resolveCollisions();
			}
		}

		function computeLinkDepths() {
			nodes.forEach(function(node) {
				node.sourceLinks.sort(ascendingTargetDepth);
				node.targetLinks.sort(ascendingSourceDepth);
			});
			nodes.forEach(function(node) {
				var sy = 0, ty = 0;
				node.entryLinks.forEach(function(link) {
					link.ty = ty;
					ty += link.dy;
				});
				node.sourceLinks.forEach(function(link) {
					link.sy = sy;
					sy += link.dy;
				});
				node.targetLinks.forEach(function(link) {
					link.ty = ty;
					ty += link.dy;
				});
				node.exitLinks.forEach(function(link) {
					link.sy = sy;
					sy += link.dy;
				});
			});

			function ascendingSourceDepth(a, b) {
				return a.source.y - b.source.y;
			}

			function ascendingTargetDepth(a, b) {
				return a.target.y - b.target.y;
			}
		}

		function center(node) {
			return node.y + node.dy / 2;
		}

		function value(link) {
			return link.value;
		}

		return pathing;
	};
}(this));


/**
 * Anomaly Detection
 * An overview chart for showing anomaly data across multiple metrics.
 * options are defined in the code below.
 **/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {},
		core = cloudViz.core || {},
		dv = global.dv || {},
		d3 = global.d3 || {},
		anomaly = Object.create(core);

	anomaly.init = function(options) {
		this._type = 'anomaly';
		options = options || {};
		this._initDefaultOptions();
		this.setOptions(options);
		this._initializeAnomaly();
		return this;
	};

	anomaly._initDefaultOptions = function(options) {
		var defaults = {

			// An object which specifies which properties in each object of the data array refers to x and y.
			mappings: {	"x": "date", "y": "deviation", "category": "metric" },

			// The preferred number of bins that should be used.  This is only a suggestion that the d3.anomaly can override.
			//
			// The anomaly chart will use a number of bins that lead to pretty intervals that are easier to process.  For
			// example, if I ask for 3 bins for an interval of [0, 100], we would be showing bins of
			// [0-33.3333, 33.3333-66.6667, 66.6667-100]. Users would rather have 4 bins of [0-25, 25-50, 50-75, 75-100]
			// for reduced cognitive load, so this visualization will opt for 4 bins instead of 3.
			bins: 12,

			// Determines how many x ticks should be drawn.  This ultimately determines how things are grouped.  There are two
			// options that can be used here.
			//
			// Option 1: Supply an integer argument.  This will render a preferred number of x ticks and the  anomaly chart
			// will determine the closest most optimal number of ticks to that preferred number. There may be times where 4
			// may be supplied and the anomaly chart is rendered with 3 or 5 ticks.  This is because ticks is simply a hint
			// and in that particular case 4 ticks may have produced fractions or odd intervals which are not easily digested.
			//
			//     Usage:  { ... xTicks: 5, ... }  // Will draw a number of ticks close to 5, but could be 3 - 7.
			//
			// Option 2: Supply a function argument. This function will be invoked, being passed the start and end date of the
			// scale's domain, in addition to the step argument (xTickInterval). There are a few functions defined by D3 which
			// can be used here to specify time interval (https://github.com/mbostock/d3/wiki/Time-Intervals#aliases)
			//
			//     Usage:  .ticks(d3.time.weeks, 2)  // This will add a tick every 2 weeks.
			//             .ticks(d3.time.days, 1)  // This will add a tick for every day.
			xTicks: 7,

			// This property is only useful if xTicks is a function. It defines the interval which is passed into the xTicks
			// function.  In the case of d3.time.* functions, it represents the interval between ticks and defines when they
			// should be drawn.
			//
			//     Usage:  { ... xTicks: d3.time.weeks, xTickInterval: 2, ... } // This will add a tick every 2 weeks.
			//     Usage:  { ... xTicks: d3.time.days, xTickInterval: 1, ... }  // This will add a tick for every day.
			xTickInterval: undefined,

			// Sets the upper limit on the x axis (this should be a date). Depending on xTicks (and xTickInterval), this may
			// not guarantee that the preferred xUpperLimit is chosen.  There are cases where it could be extended in order
			// to keep x bins uniform in width -- which avoids distorting the anomaly rectangle nodes.
			xUpperLimit: undefined,

			// Sets the lower limit on the x axis (this should be a date).  Depending on xTicks (and xTickInterval), this
			// may not guarantee that the preferred xLowerLimit is chosen.  There are cases where it could be extended in
			// order to keep x bins uniform in width -- which avoids distorting the anomaly rectangle nodes.
			xLowerLimit: undefined,

			// Show all anomalies as positive even if they are negative. This is useful if positive/negative direction
			// aren't important to the user.
			normalizePositive: false,

			// A callback which will be called whenever an anomaly is moused-over. The supplied callback function will be
			// called and passed two parameters:  data and index with the context `this` being set to the moused-over node.
			// The data parameter refers to the data which has been bound to that moused-over anomaly. The index represents
			// the index of the data object which was bound to the anomaly in context of the entire array of data objects.
			onMouseOverAnomaly: null,

			// A callback which will be called whenever an anomaly is moused-out. The supplied callback function will be
			// called and passed two parameters:  data and index with the context `this` being set to the moused-out node.
			// The data parameter refers to the data which has been bound to that moused-out anomaly. The index represents
			// the index of the data object which was bound to the anomaly in context of the entire array of data objects.
			onMouseOutAnomaly: null,

			// A callback which will be called whenever one or more anomalies are selected. The supplied callback function
			// will be called and passed no parameters.  The `this` context of the function will be bound to the group of
			// anomaly nodes which were selected.  Each node has a __data__ property which exposes which data object was
			// associated with each node.
			onSelectAnomalies: null
		};
		return Object.getPrototypeOf(anomaly)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Renders the chart.
	 */
	anomaly._render = function() {
		this._configureAnomaly();
		this._anom.layout();
	};

	// Private
	anomaly._initializeAnomaly = function() {
		var options = this._options,
			mappings = options.mappings,
			self = this;

		this._anom = d3.anomaly()
			.on("mouseover", function(node, data, index) {
				self._anom.nodes(function(d, i) {
					var e = d3.select(this)
						.transition()
						.duration(750)
						.style("opacity", d[mappings.category] === data[mappings.category] ? 0.8 : 0.2);
				});

				if (options.onMouseOverAnomaly) {
					options.onMouseOverAnomaly.call(node, data, index);
				}
			})
			.on("mouseout", function(node, data, index) {
				self._anom.nodes(function(d, i) {
					var e = d3.select(this)
						.transition()
						.duration(750)
						.style("opacity", 1);
				});

				if (options.onMouseOutAnomaly) {
					options.onMouseOutAnomaly.call(node, data, index);
				}
			})
			.on("select", function(selection) {
				// Make all nodes unselected, and then select the ones we're interested in.
				self._anom.nodes(function(d, i) {
					d3.select(this)
						.classed("selected", false);
				});
				selection.classed("selected", true);

				if (options.onSelectAnomalies) {
					options.onSelectAnomalies.call(selection);
				}
			});
	};

	// Private
	anomaly._configureAnomaly = function() {
		var options = this._options;
		var width = dv.util.getPercentValue(options.width, options.parent.offsetWidth);
		var height = dv.util.getPercentValue(options.height, options.parent.offsetHeight);

		this._anom
			.data(zipData(options.data))
			.parent(options.parent)
			.mappings(options.mappings)
			.bins(options.bins)
			.size([width, height])
			.xUpperLimit(options.xUpperLimit)
			.xLowerLimit(options.xLowerLimit)
			.normalizePositive(options.normalizePositive)
			.xTicks(options.xTicks, options.xTickInterval);
	};

	anomaly._onAutoResize = function() {
		this.render();
	};

	/**
	 * Converts data from an object with tuples into an array of data objects which d3.anomaly expects.
	 */
	function zipData(data) {
		var retData = [],
			firstMapping = true;
		for (var mapping in data) {
			var tuple = data[mapping],
				i = -1,
				n = tuple.length;
			while (++i < n) {
				var obj,
					val = tuple[i];
				if (firstMapping) {
					obj = {};
					retData.push(obj);
				} else {
					obj = retData[i];
				}
				obj[mapping] = val;
			}
			firstMapping = false;
		}
		return retData;
	}

	/**
	 * Returns the inner d3.anomaly instance for customization and extension.
	 */
	anomaly.chart = function() {
		return this._anom;
	};

	global.cloudViz.anomaly = cloudViz.util.createConstructor(anomaly);
}(this));
(function(global){
	"use strict";
	d3.choropleth = function() {
		var salmonRun = ['#fae6be', '#eb782d', '#dc283c', '#640046'],
			salmonDarker = ['#c7b797', '#b85e23', '#a81e2e', '#300022'],
			sunnyDay = ['#faf0c8', '#d2dc73', '#5faf69', '#00505A'],
			sunnyDark = ['#c7bf9f', '#a0a858', '#437d4a', '#002226'],

			choropleth = {},
			data,
			size = [],
			p,
			$p,
			$wrapper,
			$container,
			svg,
			zoomContainer,

			options,
			projection,
			path,
			tooltip,
			max,
			min,
			extent = [0, 1],
			extentMin = (max - min) * extent[0],
			extentMax = (max - min) * extent[1],
			originalSibling = {},
			brushing = false,
			padding = { top: 0, left: 0, right: 0, bottom: 40 };

		choropleth.layout = function() {
			var self = this;
			if (!choropleth.data()) { throw new EmptyDataException(); }
			if (!choropleth.parent()) { throw new ParentNotSpecifiedException(); }
			size = choropleth.determineSize(options);
			choropleth.calcRange();
			$container = choropleth.createSVGContainer();

			// The GeoJSON is a String URL
			if (typeof options.geoJson === "string") {
				d3.json(options.geoJson, function(jsonData) {
					self._layoutWithData.call(self, jsonData);
				});
			} else {
				this._layoutWithData(options.geoJson);
			}
		};

		choropleth._layoutWithData = function(geoJsonData) {
			choropleth.drawGeos(geoJsonData);
			if (options.interactive) {
				choropleth.drawTooltip();
			}
			choropleth.drawLegend(options.theme, geoJsonData);
		};

		choropleth.determineSize = function(options) {
			var parent = options.parent,
				width = options.width ? options.width : parent.offsetWidth, // Grab the parent's width if we don't have width set
				height = options.height ? options.height : parent.offsetHeight; // Grab the parent's height if we don't have height set

			// If the parent's dimensions aren't set and there are no dimension options, fall back to defaults.
			width = width ? width : 700;
			height = height ? height : 450;

			return [width, height];
		};

		choropleth.calcRange = function() {
			for(var key in options.data.values) {
				if(typeof max == 'undefined') {
					max = options.data.values[key];
					min = options.data.values[key];
				}
				if(options.data.values[key] > max) {
					max = options.data.values[key];
				}
				if(options.data.values[key] < min) {
					min = options.data.values[key];
				}
			}
		};

		choropleth.drawLegend = function(theme, geoJsonData) {
			var self = this,
				height = 9,
				controlSpacer = 12,
				minMaxWidth = 35,
				legendWidth = Math.min(size[0] - padding.left, 630) - 25,
				leftPos = (size[0] - padding.left - legendWidth) / 2,
				barWidth = legendWidth - (minMaxWidth * 2) - (controlSpacer * 2),
				colors = [],
				darkColors = [];

			if(typeof theme != "undefined" && theme == "salmonRun") {
				colors = salmonRun;
				darkColors = salmonDarker;
			} else {
				colors = sunnyDay;
				darkColors = sunnyDark;
			}

			var legend = svg.selectAll(".legend").data([data]);
			legend.enter()
				.append("g")
					.classed("legend", true);
			legend.attr("transform", "translate(" + leftPos + "," + (size[1] - 24) + ")");

			var defs = legend.selectAll("defs").data([theme]);
			defs.enter().append("defs");
			defs.exit().remove();

			var defaultGradient = defs.selectAll("#defaultGradient-" + theme).data([theme]);
			defaultGradient.enter()
				.append("linearGradient")
					.attr("id", "defaultGradient-" + theme);
			defaultGradient.exit().remove();
			var darkGradient = defs.selectAll("#darkGradient-" + theme).data([theme]);
			darkGradient.enter()
				.append("linearGradient")
					.attr("id", "darkGradient-" + theme);
			darkGradient.exit().remove();

			var positions = ["0%", "33%", "67%", "100%"];

			var applyStops = function(selection, positions, colors) {
				var stop = selection.selectAll("stop").data(positions);
				stop.enter()
					.append("stop")
						.attr("class", function(d, i) { return "stop" + i; });
				stop.attr("offset", function(d) { return d; })
					.attr("stop-color", function(d, i) { return colors[i]; });
			};

			applyStops(defaultGradient, positions, colors);
			applyStops(darkGradient, positions, darkColors);

			var gradBg = legend.selectAll(".grad-bg").data([data]);
			gradBg.enter()
				.append("rect")
					.classed("grad-bg", true);
			gradBg
				.attr("x", minMaxWidth + controlSpacer)
				.attr("y", 0)
				.attr("rx", height / 2)
				.attr("ry", height / 2)
				.attr("width", barWidth)
				.attr("height", height);

			var gradRect = legend.selectAll(".grad-rect").data([data]);
			gradRect.enter()
				.append("rect")
					.classed("grad-rect", true);
			gradRect
				.classed("grad-rect", true)
				.attr("x", minMaxWidth + controlSpacer)
				.attr("y", 0)
				.style('stroke', 'url(#darkGradient-' + theme + ')')
				.style('fill', 'url(#defaultGradient-' + theme + ')')
				.attr("width", barWidth)
				.attr("height", height);


			var legendLabel = $wrapper.selectAll(".legend-label").data([min, max]);
			legendLabel.enter()
				.append("div")
					.attr("class", function(d, i) { return "legend-label " + (i ? "max" : "min"); });
			legendLabel
				.style("left", function(d, i) { return (i ? null : leftPos + "px"); })
				.style("right", function(d, i) { return (i ? leftPos + "px" : null); })
				.text(function(d, i) { return options.formatFunction(i ? max : min);});

			if (options.interactive) {
				var brush = d3.svg.brush()
					.x(d3.scale.linear().range([0, barWidth]))
					.extent(extent)
					.on("brushstart", function() {
						brushing = true;
					})
					.on("brushend", function() {
						brushing = false;
					})
					.on("brush", function() {
						extent = brush.extent();
						svg.selectAll(".grad-rect")
							.attr("width", (extent[1] - extent[0]) * barWidth)
							.attr("x", (barWidth * extent[0]) + minMaxWidth + controlSpacer);
						choropleth.drawGeos(geoJsonData);
					});

				var handleWidth = 9;
				var handleHeight = 26;

				var brushg = legend.selectAll(".brush").data([data]);
				brushg.enter()
					.append("g")
						.classed("brush", true);
				brushg
					.attr("transform", "translate(" + (minMaxWidth + controlSpacer) + ",0)")
					.call(brush);

				var resize = brushg.selectAll(".resize");
				var handle = resize.selectAll(".handle").data(function(d) { return d; });
				handle.enter()
					.append("rect")
						.classed("handle", true);
				handle
					.attr("transform", "translate(" + -(handleWidth/2) +  "," + -handleWidth + ")")
					.attr("rx", handleWidth/3)
					.attr("ry", handleWidth/3)
					.attr("width", handleWidth)
					.attr("height", handleHeight);
			}
		};

		choropleth.drawTooltip = function(data) {
			var self = this,
				dataUndefined = data == null || data.value == null;

			tooltip = $wrapper.selectAll(".tooltip").data(dataUndefined ? [] : [data]);
			tooltip.enter()
				.append("div")
					.classed("tooltip", true);
			tooltip.exit()
				.classed("visible", false);
			setTimeout(function() {
				tooltip
					.classed("visible", true);
			}, 10);

			var tooltipBack = tooltip.selectAll(".tooltip-back").data([data]);
			tooltipBack.enter()
				.append("div")
					.classed("tooltip-back", true);

			var ttName = tooltipBack.selectAll(".tt-name").data(function(d) { return [d.name]; });
			ttName.enter()
				.append("p")
					.classed("tt-name", true);
			ttName
				.text(function(d) { return d; });

			var ttValue = tooltipBack.selectAll(".tt-value").data(function(d) { return [d.value]; });
			ttValue.enter()
				.append("p")
					.classed("tt-value", true);
			ttValue
				.text(function(d) { return options.formatFunction(d); });

			var ttMetric = tooltipBack.selectAll(".tt-metric").data(typeof options.metric !== "undefined" ? [options.metric] : []);
			ttMetric.enter()
				.append("p")
					.classed("tt-metric", true);
			ttMetric.text(function(d) { return d; });
			ttMetric.exit().remove();
		};

		choropleth.hideTooltip = function() {
			choropleth.drawTooltip({});
		};

		choropleth.showTooltip = function(data) {
			if('value' in data && data.value) {
				choropleth.drawTooltip(data);
			} else {
				choropleth.hideTooltip();
			}
		};

		choropleth.drawGeos = function(geoJsonData) {
			var color = null,
				interpretedDomain,
				xStart,
				yStart,
				currentScale = 1,
				minDimScale = Math.min(size[0], size[1]),
				width = size[0] - padding.left - padding.right,
				height = size[1] - padding.top - padding.bottom,
				scale = 1,
				offset = [0, 0];

			if (options.projection) {
				projection = d3.geo[options.projection]();
			} else {
				projection = d3.geo.equirectangular();
			}

			projection.scale(scale).translate(offset);

			// create the path
			var path = d3.geo.path().projection(projection);

			// using the path, determine the bounds of the current map and use this information to determine better values
			// for the scale and translation.
			var bounds = path.bounds(geoJsonData);
			scale = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
			offset = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

			var bboxHeight = (scale * ((bounds[1][1] - bounds[0][1]) / height)) * height,
				bboxWidth = (scale * ((bounds[1][0] - bounds[0][0]) / width)) * width;

			// new projection
			projection.scale(scale).translate(offset);
			path = path.projection(projection);

			if (options.interactive) {
				var zoom = d3.behavior.zoom(),
					zoomMax = 4;
				zoomContainer.call(zoom
					.scaleExtent([1, zoomMax])
					.translate([width/2, height/2])
					.scale(1)
					.on("zoom", function(){
						if(d3.event) {
							var t = d3.event.translate,
								s = d3.event.scale,
								widthScaled2 = width / 2 * s,
								heightScaled2 = height / 2 * s,
								newX = t[0] - widthScaled2,
								newY = t[1] - heightScaled2,
								visibleChartWidth = bboxWidth / 6,
								visibleChartHeight = bboxHeight / 6,

								minX = -widthScaled2 - visibleChartWidth,
								maxX = width - widthScaled2 + visibleChartWidth,
								minY = -heightScaled2 - visibleChartHeight,
								maxY = height - heightScaled2 + visibleChartHeight;

							newX = Math.min(newX, maxX);
							newX = Math.max(newX, minX);
							newY = Math.min(newY, maxY);
							newY = Math.max(newY, minY);

							// Update the translation
							t[0] = newX + widthScaled2;
							t[1] = newY + heightScaled2;

							zoom.translate(t);
							$container.attr("transform", "translate(" + newX + "," + newY + ") scale(" + s + ")");
						}
					})
				);
			}

			extentMin = ((max - min) * extent[0]) + min;
			extentMax = ((max - min) * extent[1]) + min;
			interpretedDomain = [extentMin, ((extentMax - extentMin)/3) + extentMin, (((extentMax - extentMin)/3)*2) + extentMin, extentMax];
			$p.selectAll('.legend-label.min').text(function(d, i) { return options.formatFunction(extentMin); });
			$p.selectAll('.legend-label.max').text(function(d, i) { return options.formatFunction(extentMax); });
			if(options.theme == 'salmonRun') {
				color = d3.scale.linear().domain(interpretedDomain).range(salmonRun);
			} else {
				color = d3.scale.linear().domain(interpretedDomain).range(sunnyDay);
			}

			var getColor = function(d) {
				if(
					typeof(data.values[d.properties.GEO_ID]) == 'undefined' ||
					data.values[d.properties.GEO_ID] < extentMin ||
					data.values[d.properties.GEO_ID] > extentMax
				) {
					return '#ddd';
				} else {
					return color(data.values[d.properties.GEO_ID]);
				}
			};

			var geoMouseOver = function(d, i) {
				if(brushing) {
					return;
				}
				var id = d.properties.GEO_ID,
					d3Elem = svg.selectAll("#" + id),
					elem = d3Elem.node();
				elem.parentNode.appendChild(elem);

				d3Elem
					.classed("selected", true);

				choropleth.showTooltip({
					name: d.properties.name,
					id: d.properties.GEO_ID,
					value: data.values[d.properties.GEO_ID]
				});
			};

			var geoMouseOut = function(d, i) {
				if(brushing) {
					return;
				}
				var id = d.properties.GEO_ID,
					d3Elem = svg.selectAll("#" + id),
					elem = d3Elem.node(),
					parentElem = elem.parentNode;
				d3Elem.classed("selected", false);
				choropleth.hideTooltip();
			};

			var geos = $container.selectAll(".geo").data(geoJsonData.features, function(d) { return d.properties.GEO_ID; });
			geos.enter()
				.append('path')
					.classed("geo", true)
					.attr('id', function(d, i) { return d.properties.GEO_ID; })
					.attr('vector-effect', 'non-scaling-stroke')
					.on("mouseover.choro", options.interactive ? geoMouseOver : null)
					.on("mouseout.choro", options.interactive ? geoMouseOut : null);
			geos.exit()
				.on("mouseover.choro", null)
				.on("mouseout.choro", null);
			geos
				.attr('d', path)
				.style('fill', getColor);
		};

		choropleth.createSVGContainer = function() {
			$p = d3.select(p);

			$wrapper = $p.selectAll(".cv-choropleth").data([data]);
			$wrapper.enter().append("div").classed("cv-choropleth", true);
			$wrapper.style("width", size[0] + "px")
				.style("height", size[1] + "px");

			svg = $wrapper.selectAll("svg").data([data]);
			svg.enter().append("svg")
				.attr("width", "100%")
				.attr("height", "100%");
			svg.exit().remove();

			var clipPath = svg.selectAll("#plotClip").data([0]);
			clipPath.enter()
				.append("clipPath")
					.attr("id", "plotClip")
						.append("rect");
			clipPath.select("rect")
				.attr("x", padding.left)
				.attr("y", padding.top)
				.attr("width", size[0] - padding.left - padding.right)
				.attr("height", size[1] - padding.top - padding.bottom);

			var zoomContainerBg = svg.selectAll(".container-bg").data([data]);
			zoomContainerBg.enter()
				.append("rect")
					.classed("container-bg", true)
					.attr("width", "100%")
					.attr("height", "100%");

			zoomContainer = svg.selectAll(".zoom-container").data([data]);
			zoomContainer.enter()
				.append("g")
					.classed("zoom-container", true)
					.attr("clip-path", "url(#plotClip)");

			var zoomContainerPlotBg = zoomContainer.selectAll(".zoom-container-plot-bg").data([data]);
			zoomContainerPlotBg.enter()
				.append("rect")
					.classed("zoom-container-plot-bg", true);
			zoomContainerPlotBg
				.attr("x", padding.left)
				.attr("y", padding.top)
				.attr("width", size[0] - padding.left - padding.right)
				.attr("height", size[1] - padding.top - padding.bottom);

			var container = zoomContainer.selectAll(".choro-container").data([data]);
			container.enter()
				.append("g")
					.classed("choro-container", true);

			return container;
		};

		choropleth.data = function(_) {
			if (!arguments.length) { return data; }
			data = _;
			return choropleth;
		};

		choropleth.parent = function(_) {
			if (!arguments.length) { return p; }
			p = _;
			return choropleth;
		};

		choropleth.options = function(_) {
			if (!arguments.length) { return options; }
			options = _;
			return choropleth;
		};

		function EmptyDataException() {
			this.type = "EmptyDataException";
			this.message = "The data is empty or null";
			this.toString = function() { return this.type + " - " + this.message; };
		}

		function ParentNotSpecifiedException() {
			this.type = "ParentNotSpecifiedException";
			this.message = "A parent was not specified for this visualization";
			this.toString = function() { return this.type + " - " + this.message; };
		}

		return choropleth;
	};

	d3.choropleth.gradIdCounter = 0; // This needs to be static so instances will share
}(this));

/**
 * Choropleth Generation
 *
 * A choropleth map is a thematic map in which areas are shaded or patterned
 * in proportion to the measurement of the statistical variable being
 * displayed on the map, such as population density or per-capita income.
 */
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {},
		core = cloudViz.core || {},
		dv = global.dv || {},
		d3 = global.d3 || {},
		choropleth = Object.create(core);

	choropleth.init = function(options) {
		this._type = 'choropleth';
		options = options || {};
		this._initDefaultOptions();
		this.setOptions(options);
		this._initChoropleth();
		return this;
	};

	choropleth._initDefaultOptions = function(options) {
		var defaults = {
			/**
			 * JSON Path data for map.
			 */
			geoJson: null,
			/**
			 * 'sunnyDay' for green scheme, 'salmonRun' for red scheme
			 */
			theme: 'sunnyDay',
			/**
			 * Metric name, shown in tooltip.
			 */
			metric: "",
			/**
			 * The type of projection being used.
			 */
			projection: "equirectangular",
			/**
			 * The numeric format that should be used on any number.  Options are decimal (default), percent, currency.
			 * @type {String}
			 */
			format: "decimal",
			/**
			 * If true, adds an interactive dual thumb slider to the legend for filtering and shows a tooltip when polygons
			 * are moused-over. If false, none of these behaviors are included.
			 */
			interactive: true
		};

		return Object.getPrototypeOf(choropleth)._initDefaultOptions.call(this, defaults);
	};

	choropleth._render = function() {
		this._configure();
		this._choro.layout();
	};

	choropleth._initChoropleth = function() {
		this._choro = d3.choropleth();
	};

	choropleth._configure = function() {
		var self = this,
			opts = this._options,
			adapter = this._dataAdapter;
		opts.formatFunction = function(val) { return self._formatNumber(opts.format, val); };
		opts.metric = adapter.metric();
		opts.format = adapter.format();
		opts.data = adapter.data();
		this._choro
			.data(this._options.data)
			.parent(this._options.parent)
			.options(this._options)
		;
	};

	global.cloudViz.choropleth = cloudViz.util.createConstructor(choropleth);
}(this));

// Taken from https://github.com/benfred/venn.js
(function(venn) {
    "use strict";
    /** given a list of set objects, and their corresponding overlaps.
    updates the (x, y, radius) attribute on each set such that their positions
    roughly correspond to the desired overlaps */
    venn.venn = function(sets, overlaps, parameters) {
        parameters = parameters || {};
        parameters.distance = parameters.distance || 0;
        parameters.maxIterations = parameters.maxIterations || 500;
        var lossFunction = parameters.lossFunction || venn.lossFunction;
        var initialLayout = parameters.layoutFunction || venn.greedyLayout;

        // initial layout is done greedily
        sets = initialLayout(sets, overlaps, parameters.distance);

        // transform x/y coordinates to a vector to optimize
        var initial = new Array(2*sets.length);
        for (var i = 0; i < sets.length; ++i) {
            initial[2 * i] = sets[i].x;
            initial[2 * i + 1] = sets[i].y;
        }

        // optimize initial layout from our loss function
        var totalFunctionCalls = 0;
        var solution = venn.fmin(
            function(values) {
                totalFunctionCalls += 1;
                var current = new Array(sets.length);
                for (var i = 0; i < sets.length; ++i) {
                    current[i] = {x: values[2 * i],
                                  y: values[2 * i + 1],
                                  radius : sets[i].radius,
                                  size : sets[i].size};
                }
                return lossFunction(current, overlaps);
            },
            initial,
            parameters);

        // transform solution vector back to x/y points
        var positions = solution.solution;
        for (i = 0; i < sets.length; ++i) {
            sets[i].x = positions[2 * i];
            sets[i].y = positions[2 * i + 1];
        }

        return sets;
    };

    /** Returns the distance necessary for two circles of radius r1 + r2 to
    have the overlap area 'overlap' */
    venn.distanceFromIntersectArea = function(r1, r2, overlap) {
        // handle complete overlapped circles
        if (Math.min(r1, r2) * Math.min(r1,r2) * Math.PI < overlap) {
            return Math.abs(r1 - r2);
        }

        return venn.bisect(function(distance) {
            return window.circleIntersection.circleOverlap(r1, r2, distance) - overlap;
        }, 0, r1 + r2);
    };

    /// gets a matrix of euclidean distances between all sets in venn diagram
    venn.getDistanceMatrix = function(sets, overlaps, dist) {
        // initialize an empty distance matrix between all the points
        var distances = [],
            i;
        for (i = 0; i < sets.length; ++i) {
            distances.push([]);
            for (var j = 0; j < sets.length; ++j) {
                distances[i].push(0);
            }
        }

        // compute distances between all the points
        for (i = 0; i < overlaps.length; ++i) {
            var current = overlaps[i];
            if (current.sets.length !== 2) {
                continue;
            }

            var left = current.sets[0],
                right = current.sets[1],
                r1 = Math.sqrt(sets[left].size / Math.PI),
                r2 = Math.sqrt(sets[right].size / Math.PI),
                distance = venn.distanceFromIntersectArea(r1, r2, current.size) + dist;
            distances[left][right] = distances[right][left] = distance;
        }
        return distances;
    };

    /** Lays out a venn diagram greedily, going from most overlapped sets to
    least overlapped, attempting to position each new set such that the
    overlapping areas to already positioned sets are basically right */
    venn.greedyLayout = function(sets, overlaps, distance) {
        // give each set a default position + radius
        var setOverlaps = {},
            set,
            i,
            j;
        for (i = 0; i < sets.length; ++i) {
            setOverlaps[i] = [];
            sets[i].radius = Math.sqrt(sets[i].size / Math.PI);
            sets[i].x = sets[i].y = 0;
        }

        // map each set to a list of all the other sets that overlap it
        for (i = 0; i < overlaps.length; ++i) {
            var current = overlaps[i];
            if (current.sets.length !== 2) {
                continue;
            }

            var left = current.sets[0], right = current.sets[1];

            if (!setOverlaps[left] || !setOverlaps[right]) {
                continue;
            }

            setOverlaps[left].push ({set:right, size:current.size});
            setOverlaps[right].push({set:left,  size:current.size});
        }

        // get list of most overlapped sets
        var mostOverlapped = [];
        for (set in setOverlaps) {
            if (setOverlaps.hasOwnProperty(set)) {
                var size = 0;
                for (i = 0; i < setOverlaps[set].length; ++i) {
                    size += setOverlaps[set][i].size;
                }

                mostOverlapped.push({set: set, size:size});
            }
        }

        // We don't have any overlaps, return.
        if (!mostOverlapped.length) {
            return sets;
        }

        // sort by size desc
        function sortOrder(a,b) {
            return b.size - a.size;
        }
        mostOverlapped.sort(sortOrder);

        // keep track of what sets have been laid out
        var positioned = {};
        function isPositioned(element) {
            return element.set in positioned;
        }

        // adds a point to the output
        function positionSet(point, index) {
            sets[index].x = point.x;
            sets[index].y = point.y;
            positioned[index] = true;
        }

        // add most overlapped set at (0,0)
        positionSet({x: 0, y: 0}, mostOverlapped[0].set);

        // get distances between all points
        var distances = venn.getDistanceMatrix(sets, overlaps, distance);

        for (i = 1; i < mostOverlapped.length; ++i) {
            var setIndex = mostOverlapped[i].set,
                overlap = setOverlaps[setIndex].filter(isPositioned);
            set = sets[setIndex];
            overlap.sort(sortOrder);

            if (overlap.length === 0) {
                throw "Need overlap information for set " + set;
            }

            var points = [];
            for (j = 0; j < overlap.length; ++j) {
                // get appropiate distance from most overlapped already added set
                var p1 = sets[overlap[j].set],
                    d1 = distances[setIndex][overlap[j].set];

                // sample postions at 90 degrees for maximum aesheticness
                points.push({x : p1.x + d1, y : p1.y});
                points.push({x : p1.x - d1, y : p1.y});
                points.push({y : p1.y + d1, x : p1.x});
                points.push({y : p1.y - d1, x : p1.x});

                // if we have at least 2 overlaps, then figure out where the
                // set should be positioned analytically and try those too
                for (var k = j + 1; k < overlap.length; ++k) {
                    var p2 = sets[overlap[k].set],
                        d2 = distances[setIndex][overlap[k].set];

                    var extraPoints = window.circleIntersection.circleCircleIntersection(
                        { x: p1.x, y: p1.y, radius: d1},
                        { x: p2.x, y: p2.y, radius: d2});

                    for (var l = 0; l < extraPoints.length; ++l) {
                        points.push(extraPoints[l]);
                    }
                }
            }

            // we have some candidate positions for the set, examine loss
            // at each position to figure out where to put it at
            var bestLoss = 1e50, bestPoint = points[0];
            for (j = 0; j < points.length; ++j) {
                sets[setIndex].x = points[j].x;
                sets[setIndex].y = points[j].y;
                var loss = venn.lossFunction(sets, overlaps);
                if (loss < bestLoss) {
                    bestLoss = loss;
                    bestPoint = points[j];
                }
            }

            positionSet(bestPoint, setIndex);
        }

        return sets;
    };

    /// Uses multidimensional scaling to approximate a first layout here
    venn.classicMDSLayout = function(sets, overlaps) {
        // get the distance matix
        var distances = venn.getDistanceMatrix(sets, overlaps, 0);

        // get positions for each set
        var positions = window.mds.classic(distances);

        // translate back to (x,y,radius) coordinates
        for (var i = 0; i < sets.length; ++i) {
            sets[i].x = positions[i][0];
            sets[i].y = positions[i][1];
            sets[i].radius = Math.sqrt(sets[i].size / Math.PI);
        }
        return sets;
    };

    /** Given a bunch of sets, and the desired overlaps between these sets - computes
    the distance from the actual overlaps to the desired overlaps. Note that
    this method ignores overlaps of more than 2 circles */
    venn.lossFunction = function(sets, overlaps) {
        var output = 0;

        function getCircles(indices) {
            return indices.map(function(i) { return sets[i]; });
        }

        for (var i = 0; i < overlaps.length; ++i) {
            var area = overlaps[i], overlap;
            if (area.sets.length == 2) {
                var left = sets[area.sets[0]],
                    right = sets[area.sets[1]];
                if (left == null || right == null) {
                    overlap = 0;
                }
                else {
                    overlap = window.circleIntersection.circleOverlap(left.radius, right.radius,
                                    window.circleIntersection.distance(left, right));
                }
            } else {
                overlap = window.circleIntersection.intersectionArea(getCircles(area.sets));
            }

            var weight = (area.weight == null) ? 1 : area.weight;
            output += weight * (overlap - area.size) * (overlap - area.size);
        }

        return output;
    };

    /** Scales a solution from venn.venn or venn.greedyLayout such that it fits in
    a rectangle of width/height - with padding around the borders. */
    venn.scaleSolution = function(solution, width, height, padding) {
        var minMax = function(d) {
            var hi = Math.max.apply(null, solution.map(
                                    function(c) { return c[d] + c.radius; } )),
                lo = Math.min.apply(null, solution.map(
                                    function(c) { return c[d] - c.radius;} ));
            return {max:hi, min:lo};
        };

        width -= 2*padding;
        height -= 2*padding;

        var xRange = minMax('x'),
            yRange = minMax('y'),
            xExtent = (xRange.max - xRange.min),
            yExtent = (yRange.max - yRange.min),
            xScaling = xExtent ? width  / xExtent : 0,
            yScaling = yExtent ? height / yExtent : 0,
            scaling = Math.min(yScaling, xScaling);

        for (var i = 0; i < solution.length; ++i) {
            var set = solution[i];
            set.radius = scaling * set.radius;
            set.x = padding + (set.x - xRange.min) * scaling;
            set.y = padding + (set.y - yRange.min) * scaling;
        }
        solution.scaling = scaling;

        return solution;
    };

    function weightedSum(a, b) {
        var ret = new Array(a[1].length || 0);
        for (var j = 0; j < ret.length; ++j) {
            ret[j] = a[0] * a[1][j] + b[0] * b[1][j];
        }
        return ret;
    }

    /** finds the zeros of a function, given two starting points (which must
     * have opposite signs */
    venn.bisect = function(f, a, b, parameters) {
        parameters = parameters || {};
        var maxIterations = parameters.maxIterations || 100,
            tolerance = parameters.tolerance || 1e-10,
            fA = f(a),
            fB = f(b),
            delta = b - a;

        if (fA * fB > 0) {
            throw "initial bisect points must have opposite signs";
        }

        if (fA === 0) { return a; }
        if (fB === 0) { return b; }

        for (var i = 0; i < maxIterations; ++i) {
            delta /= 2;
            var mid = a + delta,
                fMid = f(mid);

            if (fMid * fA >= 0) {
                a = mid;
            }

            if ((Math.abs(delta) < tolerance) || (fMid === 0)) {
                return mid;
            }
        }
        return a + delta;
    };

    /** minimizes a function using the downhill simplex method */
    venn.fmin = function(f, x0, parameters) {
        parameters = parameters || {};

        var maxIterations = parameters.maxIterations || x0.length * 200,
            nonZeroDelta = parameters.nonZeroDelta || 1.1,
            zeroDelta = parameters.zeroDelta || 0.001,
            minErrorDelta = parameters.minErrorDelta || 1e-5,
            rho = parameters.rho || 1,
            chi = parameters.chi || 2,
            psi = parameters.psi || -0.5,
            sigma = parameters.sigma || 0.5,
            callback = parameters.callback;

        // initialize simplex.
        var N = x0.length,
            simplex = new Array(N + 1);
        simplex[0] = x0;
        simplex[0].fx = f(x0);
        for (var i = 0; i < N; ++i) {
            var point = x0.slice();
            point[i] = point[i] ? point[i] * nonZeroDelta : zeroDelta;
            simplex[i+1] = point;
            simplex[i+1].fx = f(point);
        }

        var sortOrder = function(a, b) { return a.fx - b.fx; };

        for (var iteration = 0; iteration < maxIterations; ++iteration) {
            simplex.sort(sortOrder);
            if (callback) {
                callback(simplex);
            }

            if (Math.abs(simplex[0].fx - simplex[N].fx) < minErrorDelta) {
                break;
            }

            // compute the centroid of all but the worst point in the simplex
            var centroid = new Array(N);
            for (i = 0; i < N; ++i) {
                centroid[i] = 0;
                for (var j = 0; j < N; ++j) {
                    centroid[i] += simplex[j][i];
                }
                centroid[i] /= N;
            }

            // reflect the worst point past the centroid  and compute loss at reflected
            // point
            var worst = simplex[N];
            var reflected = weightedSum([1+rho, centroid], [-rho, worst]);
            reflected.fx = f(reflected);

            var replacement = reflected;

            // if the reflected point is the best seen, then possibly expand
            if (reflected.fx <= simplex[0].fx) {
                var expanded = weightedSum([1+chi, centroid], [-chi, worst]);
                expanded.fx = f(expanded);
                if (expanded.fx < reflected.fx) {
                    replacement = expanded;
                }
            }

            // if the reflected point is worse than the second worst, we need to
            // contract
            else if (reflected.fx >= simplex[N-1].fx) {
                var shouldReduce = false;
                var contracted;

                if (reflected.fx <= worst.fx) {
                    // do an inside contraction
                    contracted = weightedSum([1+psi, centroid], [-psi, worst]);
                    contracted.fx = f(contracted);
                    if (contracted.fx < worst.fx) {
                        replacement = contracted;
                    } else {
                        shouldReduce = true;
                    }
                } else {
                    // do an outside contraction
                    contracted = weightedSum([1-psi * rho, centroid], [psi*rho, worst]);
                    contracted.fx = f(contracted);
                    if (contracted.fx <= reflected.fx) {
                        replacement = contracted;
                    } else {
                        shouldReduce = true;
                    }
                }

                if (shouldReduce) {
                    // do reduction. doesn't actually happen that often
                    for (i = 1; i < simplex.length; ++i) {
                        simplex[i] = weightedSum([1 - sigma, simplex[0]],
                                                 [sigma - 1, simplex[i]]);
                        simplex[i].fx = f(simplex[i]);
                    }
                }
            }

            simplex[N] = replacement;
        }

        simplex.sort(sortOrder);
        return {f : simplex[0].fx,
                solution : simplex[0]};
    };

    venn.drawD3Diagram = function(element, dataset, width, height, parameters) {
        parameters = parameters || {};

        var colours = d3.scale.category10(),
            circleFillColours = parameters.circleFillColours || colours,
            circleStrokeColours = parameters.circleStrokeColours || circleFillColours,
            circleStrokeWidth = parameters.circleStrokeWidth || function(i) { return 0; },
            textFillColours = parameters.textFillColours || colours,
            textStrokeColours = parameters.textStrokeColours || textFillColours,
            nodeOpacity = parameters.opacity || 0.3,
            padding = parameters.padding || 6;

        dataset = venn.scaleSolution(dataset, width, height, padding);
        var svg = element.append("svg")
                .attr("width", width)
                .attr("height", height);

        var nodes = svg.selectAll("circle")
                         .data(dataset)
                         .enter()
                         .append("g");

        var circles = nodes.append("circle")
               .attr("r",  function(d) { return d.radius; })
               .style("fill-opacity", nodeOpacity)
               .attr("cx", function(d) { return d.x; })
               .attr("cy", function(d) { return d.y; })
               .style("stroke", function(d, i) { return circleStrokeColours(i); })
               .style("stroke-width", function(d, i) { return circleStrokeWidth(i); })
               .style("fill", function(d, i) { return circleFillColours(i); });

        var text = nodes.append("text")
               .attr("x", function(d) { return d.x; })
               .attr("y", function(d) { return d.y; })
               .attr("text-anchor", "middle")
               .style("stroke", function(d, i) { return textStrokeColours(i); })
               .style("fill", function(d, i) { return textFillColours(i); })
               .text(function(d) { return d.label; });

        return {'svg' : svg,
                'nodes' : nodes,
                'circles' : circles,
                'text' : text };
    };

    venn.updateD3Diagram = function(element, dataset) {
        var svg = element.select("svg"),
            width = parseInt(svg.attr('width'), 10),
            height = parseInt(svg.attr('height'), 10);

        dataset = venn.scaleSolution(dataset, width, height, 6);
        element.selectAll("circle")
            .data(dataset)
            .transition()
            .duration(400)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r",  function(d) { return d.radius; });

        element.selectAll("text")
            .data(dataset)
            .transition()
            .duration(400)
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    };
}(window.venn = window.venn || {}));
(function(circleIntersection) {
    "use strict";
    var SMALL = 1e-10;

    /** Returns the intersection area of a bunch of circles (where each circle
     is an object having an x,y and radius property) */
    circleIntersection.intersectionArea = function(circles, stats) {
        // get all the intersection points of the circles
        var intersectionPoints = getIntersectionPoints(circles);

        // filter out points that aren't included in all the circles
        var innerPoints = intersectionPoints.filter(function (p) {
            return circleIntersection.containedInCircles(p, circles);
        });

        var arcArea = 0, polygonArea = 0, arcs = [], i;

        // if we have intersection points that are within all the circles,
        // then figure out the area contained by them
        if (innerPoints.length > 1) {
            // sort the points by angle from the center of the polygon, which lets
            // us just iterate over points to get the edges
            var center = circleIntersection.getCenter(innerPoints);
            for (i = 0; i < innerPoints.length; ++i ) {
                var p = innerPoints[i];
                p.angle = Math.atan2(p.x - center.x, p.y - center.y);
            }
            innerPoints.sort(function(a,b) { return b.angle - a.angle;});

            // iterate over all points, get arc between the points
            // and update the areas
            var p2 = innerPoints[innerPoints.length - 1];
            for (i = 0; i < innerPoints.length; ++i) {
                var p1 = innerPoints[i];

                // polygon area updates easily ...
                polygonArea += (p2.x + p1.x) * (p1.y - p2.y);

                // updating the arc area is a little more involved
                var midPoint = {x : (p1.x + p2.x) / 2,
                                y : (p1.y + p2.y) / 2},
                    arc = null;

                for (var j = 0; j < p1.parentIndex.length; ++j) {
                    if (p2.parentIndex.indexOf(p1.parentIndex[j]) > -1) {
                        // figure out the angle halfway between the two points
                        // on the current circle
                        var circle = circles[p1.parentIndex[j]],
                            a1 = Math.atan2(p1.x - circle.x, p1.y - circle.y),
                            a2 = Math.atan2(p2.x - circle.x, p2.y - circle.y);

                        var angleDiff = (a2 - a1);
                        if (angleDiff < 0) {
                            angleDiff += 2*Math.PI;
                        }

                        // and use that angle to figure out the width of the
                        // arc
                        var a = a2 - angleDiff/2,
                            width = circleIntersection.distance(midPoint, {
                                x : circle.x + circle.radius * Math.sin(a),
                                y : circle.y + circle.radius * Math.cos(a)
                            });

                        // pick the circle whose arc has the smallest width
                        if ((arc === null) || (arc.width > width)) {
                            arc = { circle : circle,
                                    width : width,
                                    p1 : p1,
                                    p2 : p2};
                        }
                    }
                }
                arcs.push(arc);
                arcArea += circleIntersection.circleArea(arc.circle.radius, arc.width);
                p2 = p1;
            }
        } else {
            // no intersection points, is either disjoint - or is completely
            // overlapped. figure out which by examining the smallest circle
            var smallest = circles[0];
            for (i = 1; i < circles.length; ++i) {
                if (circles[i].radius < smallest.radius) {
                    smallest = circles[i];
                }
            }

            // make sure the smallest circle is completely contained in all
            // the other circles
            var disjoint = false;
            for (i = 0; i < circles.length; ++i) {
                if (circleIntersection.distance(circles[i], smallest) > Math.abs(smallest.radius - circles[i].radius)) {
                    disjoint = true;
                    break;
                }
            }

            if (disjoint) {
                arcArea = polygonArea = 0;

            } else {
                arcArea = smallest.radius * smallest.radius * Math.PI;
                arcs.push({circle : smallest,
                           p1: { x: smallest.x,        y : smallest.y + smallest.radius},
                           p2: { x: smallest.x - SMALL, y : smallest.y + smallest.radius},
                           width : smallest.radius * 2 });
            }
        }

        polygonArea /= 2;
        if (stats) {
            stats.area = arcArea + polygonArea;
            stats.arcArea = arcArea;
            stats.polygonArea = polygonArea;
            stats.arcs = arcs;
            stats.innerPoints = innerPoints;
            stats.intersectionPoints = intersectionPoints;
        }

        return arcArea + polygonArea;
    };

    /** returns whether a point is contained by all of a list of circles */
    circleIntersection.containedInCircles = function(point, circles) {
        for (var i = 0; i < circles.length; ++i) {
            if (circleIntersection.distance(point, circles[i]) > circles[i].radius + SMALL) {
                return false;
            }
        }
        return true;
    };

    /** Gets all intersection points between a bunch of circles */
    function getIntersectionPoints(circles) {
        var ret = [];
        for (var i = 0; i < circles.length; ++i) {
            for (var j = i + 1; j < circles.length; ++j) {
                var intersect = circleIntersection.circleCircleIntersection(circles[i],
                                                              circles[j]);
                for (var k = 0; k < intersect.length; ++k) {
                    var p = intersect[k];
                    p.parentIndex = [i,j];
                    ret.push(p);
                }
            }
        }
        return ret;
    }

    circleIntersection.circleIntegral = function(r, x) {
        var y = Math.sqrt(r * r - x * x);
        return x * y + r * r * Math.atan2(x, y);
    };

    /** Returns the area of a circle of radius r - up to width */
    circleIntersection.circleArea = function(r, width) {
        return circleIntersection.circleIntegral(r, width - r) - circleIntersection.circleIntegral(r, -r);
    };


    /** euclidean distance between two points */
    circleIntersection.distance = function(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) +
                         (p1.y - p2.y) * (p1.y - p2.y));
    };


    /** Returns the overlap area of two circles of radius r1 and r2 - that
    have their centers separated by distance d. Simpler faster
    circle intersection for only two circles */
    circleIntersection.circleOverlap = function(r1, r2, d) {
        // no overlap
        if (d >= r1 + r2) {
            return 0;
        }

        // completly overlapped
        if (d <= Math.abs(r1 - r2)) {
            return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
        }

        var w1 = r1 - (d * d - r2 * r2 + r1 * r1) / (2 * d),
            w2 = r2 - (d * d - r1 * r1 + r2 * r2) / (2 * d);
        return circleIntersection.circleArea(r1, w1) + circleIntersection.circleArea(r2, w2);
    };


    /** Given two circles (containing a x/y/radius attributes),
    returns the intersecting points if possible.
    note: doesn't handle cases where there are infinitely many
    intersection poiints (circles are equivalent):, or only one intersection point*/
    circleIntersection.circleCircleIntersection = function(p1, p2) {
        var d = circleIntersection.distance(p1, p2),
            r1 = p1.radius,
            r2 = p2.radius;

        // if to far away, or self contained - can't be done
        if ((d >= (r1 + r2)) || (d <= Math.abs(r1 - r2))) {
            return [];
        }

        var a = (r1 * r1 - r2 * r2 + d * d) / (2 * d),
            h = Math.sqrt(r1 * r1 - a * a),
            x0 = p1.x + a * (p2.x - p1.x) / d,
            y0 = p1.y + a * (p2.y - p1.y) / d,
            rx = -(p2.y - p1.y) * (h / d),
            ry = -(p2.x - p1.x) * (h / d);

        return [{ x: x0 + rx, y : y0 - ry },
                { x: x0 - rx, y : y0 + ry }];
    };

    /** Returns the center of a bunch of points */
    circleIntersection.getCenter = function(points) {
        var center = { x: 0, y: 0};
        for (var i =0; i < points.length; ++i ) {
            center.x += points[i].x;
            center.y += points[i].y;
        }
        center.x /= points.length;
        center.y /= points.length;
        return center;
    };
}(window.circleIntersection = window.circleIntersection || {}));

/**
 * Venn Diagram
 *
 *
 */
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {},
		core = cloudViz.core || {},
		dv = global.dv || {},
		d3 = global.d3 || {},
		venn = Object.create(core);

	/**
	 * Called when cloudViz.venn is instantiated.
	 * @param  Object<optionName, optionValue> options Options specified by the user which should be merged into our default options.
	 */
	venn.init = function(options) {
		var self = this;

		this._type = 'venn';
		options = options || {};
		this._initDefaultOptions();
		this.setOptions(options);
		this._cvWrapper = null;

		// Initialize the seriesState object which keeps track of which items are enabled or not.
		this._seriesState = cloudViz.seriesState();
		this._seriesState.on('enableChange.venn', function(eventType, state) {
			// When a set has it's enabled/disabled flag toggled, call this function.
			self._onEnableState(state);
		});

		this._dvColorScale = dv.scale.ordinal();

		return this;
	};

	/**
	 * Initializes the default options that can be used for this chart. We also merge the user specified options over the top of the
	 * defaults object.  User-defined options always override defaults. The final merged options object is returned.
	 * @param  Object<optionName, optionValue> options Options specified by the user which should be merged into our default options.
	 * @return Object<optionName, optionValue> newly merged options Object which now has defaults included.
	 */
	venn._initDefaultOptions = function(options) {
		var defaults = {
			colors : [ // colors to use when displaying charts
				'#8cc350', // green
				'#d755a5', // fuchsia
				'#1ebed7', // cyan
				'#f0a01e', // tangerine
				'#9b8ce6', // periwinkle
				'#3cb5a0', // sea foam
				'#3287d2', // blue
				'#f0557d', // magenta
				'#c3d250', // chartreuse
				'#eb782d', // orange
				'#78b4f5', // sky blue
				'#5faf69', // kelly green
				'#aa5fa5', // plum
				'#fa5a50', // red
				'#f5c841', // yellow
				'#5a6eaa' // iris
			],
			legendVerticalWidth: 110, // The width the legend will take up when in interactive vertical layout.
			duration: 500, // The amount of time each animation will take. If duration is zero, the chart will not be animated (but still drawn on the next render frame).
			distance: 0
		};

		this._margins = { top: 0, left: 0, right: 0, bottom: 0 };

		return Object.getPrototypeOf(venn)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Called by core's internal render, this function represents the render loop for drawing this diagram.
	 */
	venn._render = function() {
		this._id = Math.floor(Math.random() * 10000); // pseudo random number to have unique clippath ids
		this._determineSize();
		this._initScales();
		this._draw();
	};

	/**
	 * The main drawing loop for the Venn Diagram.
	 */
	venn._draw = function() {
		var data = this._options.data;
		data.distance = this._options.distance;
		this._initSVG();
		this._createStates();
		this._parsedSetNotation = this._parseSetNotation(data.notation);
		this._overlapMap = this._createOverlapMap(data.sets, data.overlaps);
		var legendDimensions = this._drawLegend();
		this._positionContainer(legendDimensions);
		var sets = this._configureSets(data);
		var overlayCombos = this._generateOverlayCombinations(sets, this._parsedSetNotation);
		this._drawCircles(sets, overlayCombos);
	};

	/**
	 * Called when the chart is automatically resized. This will only fire if the autoResize option is true and the browser
	 * window size changes.
	 */
	venn._onAutoResize = function() {
		this.render();
	};

	/**
	 * Calculate the overall size based on width/height options or the size of the parent if no size options were specified.
	 */
	venn._determineSize = function(options) {
		var opts = this._options, data = this._dataAdapter.data(),
		parentWidth = opts.parent.offsetWidth,
		parentHeight = opts.parent.offsetHeight,
		width = dv.util.getPercentValue(opts.width, parentWidth)|| parentWidth, // Grab the parent's width if we don't have width set
		height = dv.util.getPercentValue(opts.height, parentHeight) || parentHeight; // Grab the parent's height if we don't have height set

		this._size = [width, height];
	};

	venn._initScales = function() {
		this._dvColorScale.range(this._options.colors);
	};

	/**
	 * Parses the notation string into an array of arrays.  Each subarray will represent an intersection of sets and each
	 * top level array represents a union. So a notation string of '1&2|3&4|0' will be converted to [[1, 2], [3, 4], [0]].
	 * @return json notation representation
	 */
	venn._parseSetNotation = function(notationString) {
		var jsonNotation = [];

		if (!notationString) {
			return jsonNotation;
		}

		var ors = notationString.split('|'),
			indexPattern = /\d+/g;

		var i,
			orLength = ors.length,
			or;
		for (i = 0; i < orLength; i++) {
			or = ors[i];
			var andMatches = or.match(indexPattern);
			var j,
				sets = [],
				andLength = andMatches.length,
				and;
			for (j = 0; j < andLength; j++) {
				sets.push(+andMatches[j]);
			}
			jsonNotation.push(sets);
		}
		return jsonNotation;
	};

	/**
	 * Build up the SVG containers which will hold the Venn Diagram.
	 */
	venn._initSVG = function() {
		var opts = this._options,
			d3Parent = d3.select(opts.parent);

		this._cvWrapper = d3Parent.selectAll('.cv-wrapper.cv-venn').data([0]);
		this._cvWrapper.enter()
			.append('div')
			.classed('cv-wrapper cv-venn', true);
		this._cvWrapper
			.style('width', this._size[0] + 'px')
			.style('height', this._size[1] + 'px');

		var chartContainer = this._cvWrapper.selectAll('.svg-wrapper').data([0]);
		chartContainer.enter()
			.append('div')
			.classed('svg-wrapper', true);

		var svg = chartContainer.selectAll('svg').data([0]);
		svg.enter()
			.append('svg');

		this._d3Container = svg.selectAll('g').data([0]);
		this._d3Container.enter()
			.append('g');
	};

	/**
	 * Now that we have rendered the legend and know it's dimensions, we can allocate the remaining space for the plot itself. This functions sizes the elements
	 * properly to allow for this.
	 * @param  {left:Number, top:Number, right:Number, bottom:Number} legendDimensions The amount of space taken up by legends
	 */
	venn._positionContainer = function(legendDimensions) {
		this._size[0] -= legendDimensions.left + legendDimensions.right;
		this._size[1] -= legendDimensions.top + legendDimensions.bottom;

		this._cvWrapper.select('.svg-wrapper')
			.style({
				'margin-left': legendDimensions.left + 'px',
				'margin-top': legendDimensions.top + 'px',
				'margin-right': legendDimensions.right + 'px',
				'margin-bottom': legendDimensions.bottom + 'px',
				'height': this._size[1] + 'px'
			});

		this._cvWrapper.selectAll('.cv-legend')
			.style('height', legendDimensions.left || legendDimensions.right ? this._size[1] - 1 + 'px' : null);
	};

	/**
	 * Converts the sets and overlaps datasets to a single dataset which shows where each set (circle) should be
	 * positioned and how large of a radius it should have.
	 * @param {Set[], Overlay[], Notation:String} data The original dataset
	 * @return sets An array of circle positions and sizes.
	 */
	venn._configureSets = function(data) {
		var opts = this._options;

		data = this._sanitizeOverlaps(data);
		// TODO: Should we only run venn.venn if we change our dataset?
		// TODO: Rename venn to be d3.venn.
		var circles = global.venn.scaleSolution(global.venn.venn(data.sets, data.overlaps, {distance:data.distance}), this._size[0], this._size[1], 7);

		var i, length = circles.length, circle;
		for (i = 0; i < length; i++) {
			circle = circles[i];
			circle.index = i;
		}
		return circles;
	};

	/**
	 * Generates all possible combintations of numbers given a set with a minimum number of items in the set.  An example of this would
	 * be the set [0, 1, 2] which would create sets: [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2].  This would happen if minLength
	 * was 1, if minLength was 2, we would receive sets: [0, 1], [0, 2], [1, 2], [0, 1, 2].  If minLength was 3, we would only receive
	 * [0, 1, 2].  If maxLength is specified, it caps the length of the items we can receive.  If minLength is 1 and maxLength is 2,
	 * given the set [0, 1, 2], we would receive sets [0], [1], [2], [0, 1], [0, 2], [1, 2].  Note that we wouldn't get [0, 1, 2]
	 * because it exceeds the specified length.
	 */
	venn._combine = function(sets, minLength, maxLength) {
		if (arguments.length < 3) {
			maxLength = sets.length - 1;
		} else {
			maxLength--;
		}
		if (arguments.length < 2) {
			minLength = 1;
		}

		var fn = function(n, src, got, all) {
			if (n === 0) {
				if (got.length > 0) {
					all[all.length] = got;
				}
				return;
			}
			for (var j = 0; j < src.length; j++) {
				fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
			}
			return;
		};
		var all = [];
		for (var i = minLength; i <= maxLength + 1; i++) {
			fn(i, sets, [], all);
		}
		return all;
	};

	/**
	 * Find the commonalities between two sets.  For example, intersecting the sets: [0, 1, 2, 5] and [1, 3, 4, 5] would yield [1, 5]. Order
	 * is guaranteed to be the same as the two arrays.
	 * @param Array<Number> a An array of set indices
	 * @param Array<Number> b An array of set indices
	 * @return An unordered array with intersected set values
	 */
	venn._intersect = function(a, b) {
		var res = [];
		for (var i = 0; i < a.length; i++) {
			for (var j = 0; j < b.length; j++) {
				if (a[i] == b[j]) {
					res.push(a[i]);
					break;
				}
			}
		}
		return res;
	};

	/**
	 * Finds the unique values from each set.  For example, unioning the sets: [0, 1, 2, 5] and [1, 3, 4, 5] would yield [0, 1, 2, 3, 4, 5].
	 * Order is guaranteed to be the same as the input arrays.
	 * @param Array<Number> a An array of values
	 * @param Array<Number> b An array of values
	 * @return An unordered array with unioned set values
	 */
	venn._union = function(a, b) {
		var obj = {};

		for (var i = a.length - 1; i >= 0; --i) {
			obj[a[i]] = a[i];
		}
		for (var j = b.length - 1; j >= 0; --j) {
			obj[b[j]] = b[j];
		}
		var res = [];
		for (var k in obj) {
			if (obj.hasOwnProperty(k)) {
				res.push(obj[k]);
			}
		}
		res.sort(function(a, b) { return a - b; });
		return res;
	};

	/**
	 * Creates an overlayCombinations object which informs how the clips paths should be set up and created. We do this by taking each intersected group of sets
	 * defined by the data.notation string (which has been parsed into JSON -- parsedNotation param) and generate an array of intersected sets that make up these
	 * combinations.  We essentially take parsedNotation array such as:
	 *
	 * [[0, 1, 2], [3, 4]] // equivalent to data.notation string '0&1&2|3&4'
	 *
	 * and we convert it into all possible combinations of sets we can have:
	 *
	 * [
	 *   {key:'0', fill:false, area:Number},
	 *   {key:'1', fill:false, area:Number},
	 *   {key:'2', fill:false, area:Number},
	 *   {key:'0-1', fill:false, area:Number},
	 *   {key:'0-2', fill:false, area:Number},
	 *   {key:'1-2', fill:false, area:Number},
	 *   {key:'0-1-2', fill:true, area:Number},
	 *   {key:'3', fill:false, area:Number},
	 *   {key:'4', fill:false, area:Number},
	 *   {key:'3-4', fill:true, area:Number}
	 * ]
	 *
	 * We mark which sets should be filled in blue, and which sets should be invisible and exist only to create the clipPath combinations we need in order to
	 * properly clip our filled-in areas.
	 *
	 * The area parameter is the total area of the intersection.  It is based purely off how large the intersection would be when plotted. We use it to ensure
	 * the smaller areas are plotted on top of larger areas.  We don't want to have smaller fills behind larger fills.
	 *
	 * @param  {Array<Set>} sets Describes the position and size of each set that should be drawn.
	 * @param  {Array<Array<Number>>} parsedNotation An array of arrays containing set indices which should be intersected. The outer array is used to break up
	 * the sets which should be unioned (or'ed) which the inner area represents the sets which should be intersected (and'ed).
	 * @return {Array<ClipPath>} An array of object which are used to create the clipPaths which reveal the highlighted clip areas.
	 */
	venn._generateOverlayCombinations = function(sets, parsedNotation) {
		var self = this,
			comboMap = {},
			combinedPermutations = [],
			dataFills = [];

		// More specific notations first, follow by the most general
		parsedNotation.sort(function(a, b) {
			return b.length - a.length;
		});

		parsedNotation.forEach(function(and, i) {
			var joinedAnd = and.join('-'); // converts an anded set [0, 1, 2] into a key string '0-1-2'.
			combinedPermutations = combinedPermutations.concat(self._combine(and, 1));
			combinedPermutations.forEach(function(d, j) {
				var key = d.join('-'),
					obj = comboMap[key] || {},
					intersections;

				// If this has already been determined as being filled, don't change it.
				if (!obj.fill) {
					// Check this permutation against the permutation defined by the user. By intersecting both
					// sets, we can determine if the intersection matches the original permutation defined by
					// the user.  If this is true, we should color this area.
					intersections = self._intersect(and, d);
					obj.fill = intersections.join('-') === joinedAnd;
				}

				comboMap[key] = obj;
			});
		});

		// Change the map into an array
		for (var key in comboMap) {
			var setIndices = key.split('-'),
				setSubset = [],
				i,
				setLength = setIndices.length;
			for (i = 0; i < setLength; i++) {
				var set = sets[setIndices[i]];
				if (set) {
					setSubset.push(sets[setIndices[i]]);
				}
			}

			// Calculate the area of the set intersections.
			var intersectionData = {};

			if (setSubset.length > 1) {
				global.circleIntersection.intersectionArea(setSubset, intersectionData);
			}
			if (!setSubset.length) {
				intersectionData.area = 0;
			}
			else {
				intersectionData.area = Math.PI * Math.pow(setSubset[0].radius, 2);
			}

			dataFills.push({
				key: key,
				fill: comboMap[key].fill,
				area: intersectionData.area
			});
		}

		// Larger sized areas come first, then smaller sized areas.  We want our smaller clips to
		// display on top of larger areas so they aren't obscurred by them.
		dataFills.sort(function(a, b) {
			var diff = b.area - a.area;
			if (diff) {
				return diff;
			}

			// If they are the same area, check to see if their key length is the same.  If you have
			// two circles A and B, and B is a subset of A (B is contained wholly within A), and we
			// want the intersection A&B, the area of B and A&B will be identical, however, the key
			// of B will be "B" and the key of A&B will be "A-B".  Since "A-B" is more specific, we
			// want it last so it is always on top of "B".
			return a.key.length - b.key.length;
		});

		return dataFills;
	};

	/**
	 * Here we manually add overlaps of any 2-combination set that wasn't specified in data.overlaps.  These manually added 2-set combinations have a size zero overlap.
	 * This was made to satisfy the bug listed here:  https://github.com/benfred/venn.js/issues/11
	 * @param  {sets:Array[Set], overlaps:Array[Overlap], notation:String} data The data supplied to the Venn Diagram
	 * @return {sets:Array[Set], overlaps:Array[Overlap], notation:String} new data object with added overlaps.
	 */
	venn._sanitizeOverlaps = function(data) {
		// TODO: Need to make sure the data is valid before we get here.
		// TODO: We are only adding zeros to combinations of 2, maybe we should add them to combinations of n?
		var sets = data.sets,
			overlaps = data.overlaps,
			zeroOverlaps = [],
			setIndex,
			otherSetIndex,
			overlapIndex,
			set,
			otherSet,
			overlap,
			found,
			setLen = sets.length,
			overlapLen = overlaps.length,
			overlapMap = {},
			overlapSort = function(a, b) { return +a - +b; };

		// Build up an overlap map we can use for quick indexing.
		for (overlapIndex = 0; overlapIndex < overlapLen; overlapIndex++) {
			overlap = overlaps[overlapIndex];
			overlap.sets.sort(overlapSort); // Sort each set so lowest set index comes first.
			overlapMap[overlap.sets.join('-')] = overlap;
		}

		// Iterate through each set and check if there is an overlap for the other sets.
		for (setIndex = 0; setIndex < setLen; setIndex++) {
			set = sets[setIndex];
			// Compare this set against the remaining sets
			for (otherSetIndex = setIndex + 1; otherSetIndex < setLen; otherSetIndex++) {
				otherSet = sets[otherSetIndex];
				found = false;

				// Look through all the overlaps to see if we have an overlap that matches these two sets.
				if (!overlapMap.hasOwnProperty(setIndex + '-' + otherSetIndex) || overlapMap[setIndex + '-' + otherSetIndex].size === "0" ) {
					// We didn't find an overlap for these two sets, let's create one and zero out the size.
					zeroOverlaps.push({
						sets: [setIndex, otherSetIndex],
						size: 0
					});
				}
			}
		}

		// Add missing overlaps to our data
		data.overlaps = overlaps.concat(zeroOverlaps);
		return data;
	};

	/**
	 * Turns all the overlap data and sets into a Hash of the sizes of each area with a given key.
	 * @param {{sets:[Set], overlaps:[Overlap], notation:string}} data The raw data associated with this visualization
	 * @return {Object<setIndexKey, setSize>} A hash containing all the overlap information associated by key.
	 */
	venn._createOverlapMap = function(sets, overlaps) {
		var overlapMap = {},
			sort = function(a, b) { return a - b; };

		var i,
			setLength = sets.length,
			set;
		for (i = 0; i < setLength; i++) {
			set = sets[i];
			overlapMap[i] = set.size;
		}

		var j,
			overlapLength = overlaps.length,
			overlap;
		for (i = 0; i < overlapLength; i++) {
			overlap = overlaps[i];
			overlap.sets.sort(sort);
			overlapMap[overlap.sets.join('-')] = overlap.size;
		}

		return overlapMap;
	};

	/**
	 * The drawing routine for creating the circles and their filled areas.
	 * @param  {[type]} sets          [description]
	 * @param  {[type]} overlayCombos [description]
	 * @return {[type]}               [description]
	 */
	venn._drawCircles = function(sets, overlayCombos) {
		this._drawSetHitAreas(sets);
		this._createClipPaths(sets, overlayCombos);
		this._drawFilledRegions(overlayCombos);
		this._drawPadding(sets);
		this._drawSetFills(sets);
		this._drawBorders(sets);
		this._makePlotFit(sets);
	};

	/**
	 * Draws a circle for each set. The purposes of these circles is to create a hit area that will listen to mouse events. This hit area must be underneath
	 * the filled-in areas so we can mouse-over those filled-in areas too without them being covered by other set circles.
	 * corresponding legend entry.
	 * @param  {Array[Set]} sets Describes the position and size of each set that should be drawn.
	 */
	venn._drawSetHitAreas = function(sets) {
		var self = this,
			opts = this._options;

		var nodes = this._d3Container.selectAll('.set-hit-areas-container').data([sets]);
		nodes.enter().append('g').classed('set-hit-areas-container', true);
		nodes.exit().remove();

		var circles = nodes.selectAll("circle").data(function(d) { return d; });
		circles.enter().append('circle')
			.attr('r', 0)
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; })
			.attr('tooltip', function(d) { return d.tooltip; });
		circles.exit().remove();
		circles
			// The largest circles should be on bottom to not eat all the events of smaller circles that may be underneath it.
			.sort(function(a, b) { return b.radius - a.radius; })
			.on('mouseover', function(d, i) { self._seriesState.enableStateByTypeAndId('standard', d.index, true); })
			.on('mouseout', function(d, i) { self._seriesState.enableStateByTypeAndId('standard', d.index, false); })
			.transition()
			.duration(opts.duration)
				.attr('r', function(d) { return Math.max(d.radius - 1, 0); })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; });
	};

	/**
	 * Creates a series of clippaths that will be used as masks for our filled areas.
	 * @param  {Array[Set]} sets Describes the position and size of each set that should be drawn.
	 * @param  {Array[Overlay]} overlayCombos All the overlays we will be drawing
	 */
	venn._createClipPaths = function(sets, overlayCombos) {
		var self = this;

		// Each filled region should have a mask that we can apply to overlaps
		var defs = this._cvWrapper.select('svg').selectAll('defs').data(overlayCombos.length ? [0] : []);
		defs.enter().insert('defs', ':first-child');
		defs.exit().remove();

		var masks = defs.selectAll('clipPath').data(overlayCombos);
		masks.enter().append('clipPath');
		masks.exit().remove();
		masks.attr('id', function(d) { return 'clip-' + self._id + '-' + d.key; });

		var clipCircle = masks.selectAll('circle').data(function(d) {
			// Turn the key string '0-2-3' into {circleIndex: 0, maskInfo: '2-3'}
			// This is used to make it easy to create the masks.
			if (!d.key || !d.key.length) { return []; }
			var setIndices = d.key.split('-'),
				maskInfo = {
					circleIndex : setIndices.shift()
				};
			if (setIndices.length) {
				maskInfo.maskId = setIndices.join('-');
			}
			if (!sets || !sets[maskInfo.circleIndex]) {
				return [];
			}
			return [maskInfo];
		});
		clipCircle.enter().append('circle');
		clipCircle.exit().remove();
		clipCircle.attr('clip-path', function(d) { return d.hasOwnProperty('maskId') ? 'url(#clip-' + self._id + '-' + d.maskId + ')' : null; })
			.attr('r', function(d) { return sets[d.circleIndex].radius; })
			.attr('cx', function(d) { return sets[d.circleIndex].x; })
			.attr('cy', function(d) { return sets[d.circleIndex].y; })
			.style('fill', '#FFF');
	};

	/**
	 * Fill in the areas defined by the overlay combinations.  We only fill in areas that have been specified by the notation.
	 * @param  {Array[Overlay]} overlayCombos All the overlays we will be drawing.
	 */
	venn._drawFilledRegions = function(overlayCombos) {
		var self = this,
			opts = this._options;

		var filledRegions = this._d3Container.selectAll('.filled-regions').data(overlayCombos ? [overlayCombos] : []);
		filledRegions.enter().append('g').classed('filled-regions', true);
		filledRegions.exit().remove();

		var regions = filledRegions.selectAll('.fill-region').data(function(d) { return d; });
		regions.enter().append('rect').classed('fill-region', true);
		regions.exit().remove();
		regions.attr('clip-path', function(d) { return 'url(#clip-' + self._id + '-' + d.key + ')'; })
			.style('opacity', 1e-6)
			.attr('width', self._size[0])
			.attr('height', self._size[1])
			.classed('overlay', function(d) { return d.fill; }) // If these should be filled in, give them a class to give them a color.
			.on('mouseover', function(d, i) { self._seriesState.enableStateByTypeAndId('highlight', 'audience', true); })
			.on('mouseout', function(d, i) { self._seriesState.enableStateByTypeAndId('highlight', 'audience', false); })
			.transition()
				.delay(opts.duration)
				.duration(opts.duration)
					.style('opacity', 1);
	};

	/**
	 * Draws a circle for each set with a white very thick stroke.  This will help break up the filled overlays so the colored
	 * circle strokes are easily seen.
	 * @param  {Array[Set]} sets Describes the position and size of each set that should be drawn
	 */
	venn._drawPadding = function(sets) {
		var opts = this._options;

		var nodes = this._d3Container.selectAll('.padding-container').data([sets]);
		nodes.enter().append('g').classed('padding-container', true);
		nodes.exit().remove();

		var circles = nodes.selectAll('circle').data(function(d) { return d; });
		circles.enter().append('circle')
			.attr('r', 0)
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; });
		circles.exit().remove();
		circles
			.transition()
			.duration(opts.duration)
				.attr('r', function(d) { return d.radius; })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; });
	};

	/**
	 * Draws a circle for each set that has a colored fill. These circles are only visible when they are moused-over on the plot or on the
	 * corresponding legend entry.
	 * @param  {Array[Set]} sets Describes the position and size of each set that should be drawn.
	 */
	venn._drawSetFills = function(sets) {
		var self = this,
			opts = this._options;

		var nodes = this._d3Container.selectAll('.set-fills-container').data([sets]);
		nodes.enter().append('g').classed('set-fills-container', true);
		nodes.exit().remove();

		var circles = nodes.selectAll("circle").data(function(d) { return d; });
		circles.enter().append('circle')
			.attr('r', 0)
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; });
		circles.exit().remove();
		circles
			.style('fill', function(d, i) { return self._dvColorScale.mapValue(i); })
			.transition()
			.duration(opts.duration)
				.attr('r', function(d) { return Math.max(d.radius - 3, 0); })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; });
	};

	/**
	 * Draws a circle for each set with a colored stroke.
	 * @param  {Array[Set]} sets Describes the position and size of each set that should be drawn
	 */
	venn._drawBorders = function(sets) {
		var self = this,
			opts = this._options;

		var nodes = this._d3Container.selectAll('.border-container').data([sets]);
		nodes.enter().append('g').classed('border-container', true);
		nodes.exit().remove();

		var circles = nodes.selectAll("circle").data(function(d) { return d; });
		circles.enter().append('circle')
			.attr('r', 0)
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; });
		circles.exit().remove();
		circles
			.style('stroke', function(d, i) { return self._dvColorScale.mapValue(i); })
			.classed('predicted', function(d) { return d.predicted; })
			.transition()
			.duration(opts.duration)
				.attr('r', function(d) { return d.radius; })
				.attr('cx', function(d) { return d.x; })
				.attr('cy', function(d) { return d.y; });
	};

	/**
	 * Creates the state objects that will be used to maintain the enabled/disabled states of the sets and filled areas we are highlighting.
	 */
	venn._createStates = function() {
		var opts = this._options,
			sets = opts.data.sets;

		if ('data' in this._changedOptions && this._changedOptions.data) {
			// Remove old states
			this._seriesState.removeStatesByType('standard');
			this._seriesState.removeStatesByType('highlight');

			this._seriesState.appendState(this._dataAdapter.l10n.labels.venn.definedAudience, 'audience', 'highlight', false);

			var i,
				length = sets.length,
				domain = [],
				set;
			for (i = 0; i < length; i++) {
				set = sets[i];
				domain.push(i);
				this._seriesState.appendState(set.label || i, i, 'standard', false);
			}

			// Update the the color scale's domain, which will be used by the legend.
			this._dvColorScale.domain(domain);
		}
	};

	/**
	 * Uses our DV interactive legend to draw legend entries.
	 * @return {left:Number, top:Number, right:Number, bottom:Number} An object representing the space the legend took up that we'll subtract from the plot area.
	 */
	venn._drawLegend = function() {
		var opts = this._options,
			self = this;

		if (!this._legend) {
			this._legend = cloudViz.interactiveLegend();
		}

		// Use the DV interactive legend for this.  It forces us to do things a little differently than we do in DVCore, but forces
		// consistency and reduces code.
		this._legend
			.parent(this._cvWrapper.node())
			.orientation('bottom')
			.chartWidth(this._size[0]) // this used to be opts.width which now could be a percent string or undefined
                        .chartHeight(this._size[1]) // this used to be opts.height which now could be a percent string or undefined
			.chartPadding({left: 0, top: 0, right: 0, bottom: 0})
			.validOrientations(['bottom', 'left'])
			.legendVerticalWidth(opts.legendVerticalWidth)
			.type('line')
			.seriesState(this._seriesState)
			.interactive(false)
			.values(this._calculateValues(this._options.data.sets, this._overlapMap, this._parsedSetNotation))
			._render(null, {'fill': [this._dvColorScale]});
		var left = this._legend._getUsedWidth(),
			bottom = this._legend._getUsedHeight(),
			isHorizontallyOriented = bottom !== 0; // determine if the legends have a horizontal or vertical layout.

		var legendEntries = this._cvWrapper.selectAll('.cv-legend-entry')
				.on('mouseover', function(d) { self._seriesState.enableStateByTypeAndId(d.type, d.id, true); })
				.on('mouseout', function(d) { self._seriesState.enableStateByTypeAndId(d.type, d.id, false); });
		// Only apply the stretching of legends to fill the width if we have a horizontal orientation. Otherwise leave them alone.
		if (isHorizontallyOriented) {
			legendEntries.style('width', function(d, i) { return (self._size[0] / (self._options.data.sets.length + 1)) + 'px'; }); //divide equally the sets (+ 1 for defined audience).
		}

		return { left: left, bottom: bottom, right: 0, top: 0 };
	};

	/**
	 * This function is called whenever a state has been enabled/disabled.  We show elements and mute (change opacity) of other elements.
	 * @param  {State} state The state object that has been changed
	 */
	venn._onEnableState = function(state) {
		this._cvWrapper.selectAll('.set-fills-container circle')
			.style('display', function(d, i) { return state.type === 'standard' && state.id === i && state.enabled ? 'block' : 'none'; });
		this._cvWrapper.selectAll('.border-container circle')
			.classed('muted', function(d, i) { return state.id !== i && state.enabled; });
		this._cvWrapper.selectAll('.filled-regions rect')
			.classed('muted', function(d, i) { return state.type === 'standard' && state.enabled; });

		this._cvWrapper.selectAll('.padding-container circle')
			.style('display', function(d, i) { return state.type === 'highlight' && state.enabled ? 'none' : 'block'; });

		// Highlight the legend entry of the highlighted area
		this._cvWrapper.selectAll('.cv-legend-entry')
			.classed('inactive', function(d) { return state.enabled && (d.id !== state.id || d.type !== state.type); });
	};

	/**
	 * Determines the values that will be displayed in the legend entries.
	 * @param {{sets:[Set], overlaps:[Overlap], notation:string}} data The raw data associated with this visualization
	 * @return {[String]} Each formatted number that needs to be displayed in the legend entries.
	 */
	venn._calculateValues = function(sets, overlapMap, parsedNotation) {
		// First drop in the sum of all the highlighted areas, since that is always the first legend entry and is handled
		// differently than the remaining legend entries.
		var values = [ this._formatNumber('decimal', this._calculateHighlightedValue(sets, overlapMap, parsedNotation)) ],
			i,
			length = sets.length,
			set;
		for (i = 0; i < length; i++) { // Now add in the values for each of the sets.
			set = sets[i];
			values.push( set.sizeText ? set.sizeText: this._formatNumber('decimal', set.size));
		}

		return values;
	};

	/**
	 * Determines the value of the highlighted area.  NOTE: This will only work if every overlap is given a size, otherwise zero is assumed.  If you are wanting to display
	 * the intersection value of three overlapping sets: (0, 1, 2), there must be an overlap defined that looks like:
	 *
	 * {sets: [0, 1, 2], size: 10}.
	 *
	 * It is not enough to have definitions for 3 intersections like this:
	 *
	 * {sets: [0, 1], size: 10}
	 * {sets: [0, 2], size: 10}
	 * {sets: [1, 2], size: 10}
	 *
	 * without specifing what [0, 1, 2]'s size is.
	 *
	 * @param {{sets:[Set], overlaps:[Overlap], notation:string}} data The raw data associated with this visualization
	 * @return {Number} The calculated total of the highlighted region(s).
	 */
	venn._calculateHighlightedValue = function(sets, overlapMap, parsedNotation) {
		// A recursive function which calculates the sum of all highlighted areas. For example, the area for A | B | C | D with overlaps
		// can be computed as follows (U = union, ∩ = intersection):
		//
		// (A U B U C U D) = A + B + C + D - (A ∩ B) - (A ∩ C) - (A ∩ D) - (B ∩ C) - (B ∩ D) - (C ∩ D) + (A ∩ B ∩ C) + (A ∩ B ∩ D) + (A ∩ C ∩ D) + (B ∩ C ∩ D) - (A ∩ B ∩ C ∩ D).
		//
		// The pattern for achieving this is described here:
		//
		// http://statistics.about.com/od/Formulas/a/Probability-Of-The-Union-Of-Three-Or-More-Sets.htm
		// http://www.math.dartmouth.edu/archive/m19w03/public_html/Section6-2.pdf
		var calculateTotalByLevel = function(parsedNotation, indexArray, total, depth) {
				// Get set index combinations by combining each parsedNotation object with as many other indices as indicated
				// by depth.
				var combinations = this._combine(indexArray, depth, depth);

				// Check each unioned combination and either add or subtract their values from the total. Add the values if depth % 1
				// is != to zero, otherwise subtract.
				var i,
					combinationsLength = combinations.length,
					combo,
					sign = depth % 2 ? 1 : -1;
				for (i = 0; i < combinationsLength; i++) {
					combo = combinations[i];

					var j,
						comboLength = combo.length,
						index,
						setOverlapKey,
						unionedSets = [];
					for (j = 0; j < comboLength; j++) {
						index = combo[j];
						unionedSets = this._union(parsedNotation[index], unionedSets);
					}

					setOverlapKey = unionedSets.join('-');
					total += (overlapMap.hasOwnProperty(setOverlapKey) ? overlapMap[setOverlapKey] : 0) * sign;
				}

				depth++;

				// If depth < number of parsedNotation objects, recurse and increment depth.
				if (depth <= parsedNotation.length) {
					total = calculateTotalByLevel.call(this, parsedNotation, indexArray, total, depth);
				}

				return total;
			},
			generateIndexArray = function(length) {
				var indexArray = [], i;
				for (i = 0; i < length; i++) {
					indexArray.push(i);
				}
				return indexArray;
			};

		return calculateTotalByLevel.call(this, parsedNotation, generateIndexArray(parsedNotation.length), 0, 1);
	};

	/**
	 * Centers the venn diagram in the middle of the plot area.  By default, the venn diagram will appear in the top left.
	 * @param  {[Set]} sets Each set that is represented as a circle on the screen
	 */
	venn._makePlotFit = function(sets) {
		var opts = this._options,
			transformCoords = {x: 0, y: 0},
			largestX = 0,
			largestY = 0,
			padding = 4;

		sets.forEach(function(d) {
			largestX = Math.max(largestX, d.x + d.radius);
			largestY = Math.max(largestY, d.y + d.radius);
		});

		// Which dimension is most underutilized?
		if (this._size[0] - largestX > this._size[1] - largestY) {
			transformCoords.x = (this._size[0] - largestX) / 2 - padding;
		} else {
			transformCoords.y = (this._size[1] - largestY) / 2 - padding;
		}

		// Shift the entire group over to center the plot.
		this._cvWrapper.select('g')
			//.transform()
			//.duration(opts.duration)
				.attr('transform', 'translate(' + transformCoords.x + ',' + transformCoords.y + ')');
	};

	global.cloudViz.venn = cloudViz.util.createConstructor(venn);
}(this));

/**
 * Sunburst
 * The sunburst chart is designed to show multiple layers of ranked reports as they relate to each parent report
 * This chart is condusive to allowing users to interact with the ranked reports to determine segments and trends within those segments
 */

/*global document*/
(function(global) {
	'use strict';

	// Standard creation code for a CloudViz chart
	var cloudViz = global.cloudViz || {}, core = cloudViz.core || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		sunburst = Object.create(core);

	sunburst.init = function(options) {
		this._type = 'sunburst';
		this._hiddenNodes = []; // user hidden nodes, manually set and manually unset
		this._outRangeNodes = []; // hidden nodes when color slider is used
		this._invalidNodes = []; // hidden nodes when secondary metric is used aka other
		this._initDefaultOptions();
		this.setOptions(options);
		return this;
	};

	sunburst._initDefaultOptions = function() {
		var metricName = 'Visits',
			defaults = {
				otherColor : '#ccc',
				otherGrayColor : '#999',
				outRangeColor : '#5a5a5a',
				metricColor : '#fff',
				seqColors : [
					'#faf0c8',
					'#d2dc73',
					'#5faf69',
					'#00505A'
				],
				seqColorsHeat : [
					'#5a6eaa',
					'#3287d2',
					'#3cb5a0',
					'#5faf69',
					'#8cc350',
					'#c3d250',
					'#f5c841',
					'#f0a01e',
					'#eb782d',
					'#fa5a50'
				],
				colors : [
					'#3287d2',
					'#9b8ce6',
					'#d755a5',
					'#fa5a50',
					'#f0a01e',
					'#c3d250',
					'#5faf69',
					'#1ebed7',
					'#5a6eaa',
					'#78b4f5',
					'#aa5fa5',
					'#f0557d',
					'#e8782d',
					'#f5c841',
					'#8cc350',
					'#3cb5a0', // 16
					'#286eaf',
					'#826ee1',
					'#b93282',
					'#f04641',
					'#e18c00',
					'#a0b400',
					'#50965a',
					'#00a0be',
					'#465a87',
					'#4196e6',
					'#964196',
					'#dc3c69',
					'#dc5f00',
					'#e6b43c',
					'#7daf4b',
					'#32a08c' // 32
				],
				padding : {
					top: 10,
					bottom: 60,
					left: 10,
					right: 10
				}
			};
		return Object.getPrototypeOf(sunburst)._initDefaultOptions.call(this, defaults);
	};

	sunburst._onAutoResize = function() {
		this.resize();
	};

	/**
	 * Update container dimensions and update the graph with new values
	 * Don't reprocess the data so we lose the current state
	 **/
	sunburst.resize = function() {
		if (!d3.select(this._options.parent).selectAll('.sunburst-cv').node()) {
			return; // not a valid chart, probably in an error state
		}
		this._sizeChart();
		this._render(true);
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.
	 **/
	sunburst.reset = function() {
		Object.getPrototypeOf(sunburst).reset.apply(this, arguments);
		// Since we use render() on resize (which calls reset in core)
		// we cannot use reset to actually remove behaviors and other additional layers
		// Instead we detect it in preRender and reset there
	};

	sunburst._preRender = function() {
		// Before we process data, lets save off the x/y positions of the path keys
		// Then we can animate them to their new positions if/when needed
		if (this._paths) {
			// initial render, but previous paths
			// go over data and match up keys and put in previous values so we can animate from them
			var keys = this._oldKeys = this._dataAdapter.getDataByPathKey(), k, d;
			// store off the position data on the key
			for (k in keys) {
				d = keys[k];
				keys[k] = {
						xo : d.x, dxo : d.dx,
						yo : d.y, dyo : d.dy
					};
			}
		}

		Object.getPrototypeOf(sunburst)._preRender.apply(this);

		var options = this._options, self = this,
			adapter = this._dataAdapter,
			l10n = adapter.l10n.labels.sunburst,
			parent = d3.select(options.parent);

		// update hidden array for secondary metric
		if (adapter.getSecondaryMetricIndex()) {
			self._hideNode(adapter.data(), self._invalidNodes, function(d) { return self._isInvalidNode(d); });
		}
		// update hidden with same nodes and possibly same children
		var oldHidden = this._hiddenNodes, currentKeys = adapter.getDataByPathKey();
		this._hiddenNodes = [];
		oldHidden.forEach(function(n, i) {
			// find the node in the current data set and hide it and its children
			var nkey = adapter.getPathKey(n);
			if (currentKeys[nkey]) { self._hideNode(currentKeys[nkey], self._hiddenNodes); }
		});
		// update zoomed if same node still applies
		var zoomed = this._zoomedPath;
		this._zoomedPath = null;
		if (zoomed) {
			zoomed = currentKeys[adapter.getPathKey(zoomed)];
			this._zoomedPath = this._oldZoomed = zoomed;
		}

		// locked for path and category
		var locked = this._lockedNode;
		this._lockedNode = null;
		if (locked) {
			if ('path' === locked.type) {
				locked.data = currentKeys[adapter.getPathKey(locked.data)];
				if (locked.data) { this._oldLockedNode = locked; }
			}
			if ('category' === locked.type) {
				var found = adapter.categories().some(function(c) {
					if (locked.data && locked.data.name === c.name) {
						locked.data = c;
						return true;
					}
					return false;
				});
				if (found) { this._oldLockedNode = locked; }
			}
		}

		// Wrap the sunburst chart in a new wrapper to allow for scrolling
		var infoWrapper = parent.selectAll('.sunburst-cv').data([0]);
		infoWrapper.enter().insert('div', ':first-child').classed('sunburst-cv', true);
		var wrapper = infoWrapper.selectAll('.sunburst-cv-wrapper').data([0]);
		wrapper.enter().insert('div', ':first-child').classed('sunburst-cv-wrapper', true);
		var container = wrapper.selectAll('.sunburst-cv-container').data([0]);
		container.enter().insert('div', ':first-child').classed('sunburst-cv-container', true);
		var svg = container.selectAll('.sunburst-svg').data([0]);
		svg.enter().append('svg').classed('sunburst-svg', true);
		var paths = svg.selectAll('.sunburst-svg-container').data([0]);
		paths.enter().append('g').classed('sunburst-svg-container', true);
		var chartLabel = wrapper.selectAll('.sunburst-cv-label').data([0]);
		chartLabel.enter().append('div').classed('sunburst-cv-label', true);
		var chartLabelWrap = chartLabel.selectAll('.sunburst-cv-label-wrap').data([0]);
		chartLabelWrap.enter().append('div').classed('sunburst-cv-label-wrap', true);
		var chartLabelMetric = chartLabelWrap.selectAll('.sunburst-cv-label-metric').data([0]);
		chartLabelMetric.enter().append('div').classed('sunburst-cv-label-metric', true);
		var chartAudiences = chartLabelWrap.selectAll('.sunburst-audiences').data([0]);
		chartAudiences.enter().append('div').classed('sunburst-audiences', true);
		chartAudiences.exit().remove();

		// Chart actions
		var actions = infoWrapper.selectAll('.sunburst-cv-actions-pane').data([0]);
		actions.enter().append('div').classed('sunburst-cv-actions-pane', true);
		actions.exit().remove();
		var zoomout = actions.selectAll('.actions-pane-zoomout').data([0]);
		zoomout.enter().append('div').classed('actions-pane-zoomout', true).classed('actions-pane-action', true);
		zoomout.html('<i class="icon zoomout"></i><span>'+ l10n.zoomout +'</span>');
		zoomout.on('click', function() {
			self._zoomPath(adapter.data());
		});
		zoomout.exit().remove();
		var hidden = actions.selectAll('.actions-pane-hidden').data([0]);
		hidden.enter().append('div').classed('actions-pane-hidden', true).classed('actions-pane-action', true);
		hidden.html('<i class="icon hide"></i><span>'+self._hideLabelText()+'</span>');
		hidden.on('click', function() {
			self._unhidePaths();
		});
		hidden.exit().remove();

		// Secondary metric options
		var second = wrapper.selectAll('.sunburst-cv-sec-viz').data([0]);
		var secondEntry = second.enter().append('div').classed('sunburst-cv-sec-viz', true);
		secondEntry.append('span').classed('title', true);
		var secondEntryBar = secondEntry.append('span').classed('bar', true);
		secondEntryBar.append('span').classed('button', true).classed('color', true).append('span');
		secondEntryBar.append('span').classed('button', true).classed('height', true).append('span');
		secondEntryBar.append('span').classed('button', true).classed('both', true).append('span');
		// Add clicks for this instance
		second.selectAll('.button.color').on('click', function() {
				adapter.setSecondaryMetricType('color');
				self._secondaryMetricChanged();
			})
			.selectAll('span').html(l10n.color);
		second.selectAll('.button.height').on('click', function() {
				adapter.setSecondaryMetricType('height');
				self._secondaryMetricChanged();
			})
			.selectAll('span').html(l10n.height);
		second.selectAll('.button.both').on('click', function() {
				adapter.setSecondaryMetricType('both');
				self._secondaryMetricChanged();
			})
			.selectAll('span').html(l10n.both);
		second.exit().remove();

		// Secondary Metrics Interface
		var secSeq = wrapper.selectAll('.sunburst-cv-secondary').data([0]);
		secSeq.enter().append('div').classed('sunburst-cv-secondary', true);
		secSeq.exit().remove();

		// Color slider interface
		var paneSeq = secSeq.selectAll('.sunburst-cv-color').data([0]);
		paneSeq.enter().append('div').classed('sunburst-cv-color', true);
		paneSeq.exit().remove();

		// Side information pane
		var pane = infoWrapper.selectAll('.sunburst-cv-info-pane').data([0]);
		pane.enter().append('div').classed('sunburst-cv-info-pane', true);
		pane.exit().remove();
		var paneContent = pane.selectAll('.info-pane-content').data([0]);
		paneContent.enter().append('div').classed('info-pane-content', true);
		paneContent.exit().remove();
		var paneCategories = paneContent.selectAll('.info-pane-categories').data([0]);
		paneCategories.enter().append('div').classed('info-pane-categories', true)
			.append('div').classed('pane-title', true).append('span');
		paneCategories.exit().remove();
		var paneAudiences = paneContent.selectAll('.sunburst-audiences').data([0]);
		paneAudiences.enter().append('div').classed('sunburst-audiences', true)
			.append('div').classed('pane-title', true).append('span').text(l10n.audience);
		paneAudiences.exit().remove();
		var paneActions = paneContent.selectAll('.info-pane-actions').data([0]);
		paneActions.enter().append('div').classed('info-pane-actions', true);
		paneActions.exit().remove();
		var paneMetrics = paneContent.selectAll('.info-pane-metrics').data([0]);
		var metricsEnter = paneMetrics.enter().append('div').classed('info-pane-metrics', true);
		metricsEnter.append('div').classed('pane-title', true).classed('pri-metric', true).append('span');
		metricsEnter.append('div').classed('info-pane-metrics-labels', true).classed('pri-metric-labels', true);
		metricsEnter.append('div').classed('pane-title', true).classed('sec-metric', true).append('span');
		metricsEnter.append('div').classed('info-pane-metrics-labels', true).classed('sec-metrics-labels', true)
			.append('span').classed('sec-metrics-help', true);
		metricsEnter.append('div').classed('pane-title', true).classed('rank-chart', true).append('span');
		metricsEnter.append('div').classed('info-pane-metrics-chart', true);
		paneMetrics.exit().remove();
		var paneExtra = paneContent.selectAll('.info-pane-extra').data([0]);
		paneExtra.enter().append('div').classed('info-pane-extra', true);
		paneExtra.exit().remove();

		// Mobile scroll tip
		// This will show if the screen is mobile size and screen is too short
		var scrollTip = infoWrapper.selectAll('.sunburst-cv-mobile-scroll').data([0]);
		scrollTip.enter().append('div').classed('sunburst-cv-mobile-scroll', true);
		scrollTip.html(l10n.mobilescroll);
		scrollTip.exit().remove();

		// Size wrapping divs
		this._sizeChart();

		// update wrapper classes for zoom/hidden
		infoWrapper.classed('hiddenpaths', !!this._hiddenNodes.length);
	};

	sunburst._render = function(resize) {
		Object.getPrototypeOf(sunburst)._render.apply(this);

		var self = this, options = this._options,
			adapter = this._dataAdapter, data = adapter.data(),
			wrapper = d3.select(options.parent).selectAll('.sunburst-cv'),
			container = wrapper.selectAll('.sunburst-cv-container'),
			svg = container.selectAll('.sunburst-svg-container'),
			width = parseInt(container.style('width'), 10),
			height = parseInt(container.style('height'), 10),
			radius = this._radius = Math.min(width, height) / 2;

		// Determine inner radius dimensions
		var isMobileSize = this._isMobileSize(),
			numRings = (data.categories.length + 1), // counts inner radius as a ring
			ringDivisor = this._ringDivisor = 1 / numRings,
			centerLabelWidth = isMobileSize ? 20 : 140, // width of the square inside the circle
			centerRadius = this._centerRadius = Math.ceil((centerLabelWidth / 2) / (Math.cos(Math.PI / 4))); // determine center radius

		// Position svg for paths
		svg.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

		// Save off the old yscale to convert values to the new scale
		if (!resize && this._yScale) {
			this._oldYScale = this._yScale;
		}
		if (!resize && this._xScale) {
			this._oldXScale = this._xScale;
		}

		// Create actual diagram
		var xScale = this._xScale = d3.scale.linear().domain(this._oldXScale ? this._oldXScale.domain() : [0,1]).range([0, 2 * Math.PI]),
			yScale = this._yScale = d3.scale.linear().domain([0, ringDivisor, 1]).range([0, centerRadius, radius]),
			arc = this._arc = d3.svg.arc()
				// Both ending angles must be between 0 and 2PI radians
				.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, xScale(d.x))); })
				.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, xScale(d.x + d.dx))); })
				// A minimum of zero is required for each radius value
				.innerRadius(function(d) { return Math.max(0, yScale(d.y)); })
				.outerRadius(function(d) { return Math.max(0, yScale(d.y + d.dy)); });

		// Set the path data
		this._layoutPaths(resize);

		// Create labels
		var chartLabel = d3.select(options.parent).select('.sunburst-cv-label'),
			labelWidth = Math.ceil((centerRadius * Math.cos(Math.PI / 4)) * 2), // (radius * cos 45 deg) * 2
			labelHeight = labelWidth,
			labelTop = options.padding.top + Math.floor(height/2 - labelHeight/2),
			labelLeft = options.padding.left + Math.floor(width/2 - labelWidth/2);
		// Position chart label
		if (!isMobileSize) {
			chartLabel.style('top', labelTop + 'px').style('left', labelLeft + 'px')
				.style('width', labelWidth + 'px').style('height', labelHeight + 'px');
		} else {
			chartLabel.style('top', '').style('left', '')
				.style('width', '').style('height', '');
		}

		// Update info in the right rail
		this._updateDetails(this._lockedNode);

		// Handle empty data set
		if (adapter.isDataEmpty()) {
			this._setErrorMessage(adapter.l10n.labels.core.nodata);
		} else if (adapter.isSizeEmpty()) {
			this._setErrorMessage(adapter.l10n.labels.sunburst.emptyFirstMetric);
		} else {
			this._clearErrorMessage();
		}
	};

	/**
	 * Joins all hidden arrays into one to determine if a node is hidden or not
	 * @returns {array} array of hidden nodes
	 * @private
	 */
	sunburst._getHiddenNodes = function() {
		return this._hiddenNodes.concat(this._outRangeNodes, this._invalidNodes);
	};

	/**
	 * Use a secondary metric to adjust the height of each of the nodes
	 * Used after partition layout
	 * Recursively calls itself down through the children to adjust the height of the node
	 * and the y position of its children using the modifier
	 * @param {object} path data obj
	 * @param {num} amount to adjust the y down
	 * @param {array} min/max objects for each level
	 * @private
	 */
	sunburst._adjustDataSize = function(node, modifier, minmax) {
		var options = this._options, self = this,
			adapter = this._dataAdapter,
			level = node.depth - 1,
			zoomed = this._zoomedPath,
			minHeight = 0.15, // minimum percentage height
			metricIndex = adapter.getStackedMetricIndex();
		if (level >= 0 && node.metrics && node.metrics[metricIndex]) {
			// adjust y by modifier
			node.y -= modifier;
			// determine new dy value based on metric value percentage
			var value = node.metrics[metricIndex].value,
				cat = minmax[level],
				max = cat.max,
				min = Math.min(0, cat.min),
				scale = d3.scale.linear().domain([min, max]).range([minHeight,1]),
				newDy = scale(value) * node.dy;
			if (max === min || // 1 value, dont' modify
				(zoomed && zoomed.depth > node.depth)) { newDy = node.dy; } // below the zoom
			modifier += (node.dy - newDy);
			node.dy = newDy;
		}
		if (!node.children || !node.children.length) { return; }
		// recursively update
		node.children.forEach(function(c) {
			self._adjustDataSize(c, modifier, minmax);
		});
	};

	/**
	 * Gets the level's unique set of nodes
	 * Will strip out nodes that are hidden if flag is set
	 * Recursively sorts through the nodes
	 * @param {object} path data obj
	 * @param {number} level to get
	 * @param {boolean} flag to include hidden nodes
	 * @return {array} [nodes]
	 * @private
	 */
	sunburst._getLevelUniqueNodes = function(node, level, includeHidden) {
		var adapter = this._dataAdapter, hidden = this._getHiddenNodes(),
			nodes = [], nodesByName = [], self = this, zoomed = this._zoomedPath;
		function getNodes(d) {
			if (zoomed && zoomed.depth === d.depth && zoomed !== d) { return; } // outside zoom
			if (d.depth === level) {
				if (!includeHidden && hidden.indexOf(d) >= 0) { return; }
				if (nodesByName.indexOf(d.name) >= 0) { return; } // already have it
				nodes.push(d);
				nodesByName.push(d.name);
				return; // no need to go deeper
			}
			if (!d.children || !d.children.length) { return; }
			// recursively update
			d.children.forEach(function(c) {
				getNodes(c);
			});
		}
		getNodes(node);
		return nodes || [];
	};

	/**
	 * Update the layout of the paths from the adapter data
	 * @param {boolean} data is being modified, false if initial render
	 * @private
	 */
	sunburst._layoutPaths = function(modify) {
		var options = this._options, arc = this._arc, self = this,
			adapter = this._dataAdapter,
			data = adapter.data(), hidden = this._getHiddenNodes(),
			container = d3.select(options.parent).selectAll('.sunburst-svg-container'),
			partition = d3.layout.partition().value(function(d) {
				return (hidden.indexOf(d) < 0) ? d.size : 0;
			}).sort(function(a, b) {
				if (adapter.isOther(a)) { return 1; } // b first
				if (adapter.isOther(b)) { return -1; } // a first
				return b.size - a.size;
			});

		// Take the current position/dimension and store for animation
		if (modify && self._paths) {
			self._paths.each(function(d) {
				d.xo = d.x;
				d.dxo = d.dx;
				d.yo = d.y;
				d.dyo = d.dy;
			});
		}

		// update with new paths based on data
		var nodes = partition.nodes(data);
		var paths = this._paths = container.selectAll('path').data(nodes,adapter.getPathKey);
		paths.enter().insert('path', ':first-child');
		paths
			.attr('data-sid', function(d, i) { return d._sid; })
			.on('click', function(d, i) { self._lockNode({ data:d, type:'path' }); })
			.on('dblclick', function(d, i) { self._zoomPath(d); })
			.on('mouseenter', function(d, i) {
				if (self._lockedNode || self._isTouch()) { return; }
				self._highlightNode({ data:d, type:'path' });
			});
		var pathsExit = paths.exit().classed('removing', true);
		setTimeout(function() {
			pathsExit.remove();
		}, 501);

		// set color scale
		self.setColorScale();

		// update colors
		this._updatePathColors();

		// update slider
		self._buildColorSlider();

		// Modify the y/dy of each node based on its percentage of the min/max
		// Other is always zero value (maybe)
		var metric;
		if (metric = adapter.getStackedMetric()) {
			// create object with min max for each category for stacked metric
			var index = adapter.getStackedMetricIndex(),
				zoomed = this._zoomedPath,
				// TODO: We need more accurate data type than the format type
				isRate = false, //'percent' === metric.format,
				minMax;

			// only run the calculation if needed
			if (isRate) {
				var metricMinMax = self.getMetricCategoryMinMax(index);
				minMax = Array.apply(null, new Array(data.categories.length)).map(function(){
					return metricMinMax;
				});
			} else {
				minMax = data.categories.map(function(c, i) {
						return self.getMetricCategoryMinMax(index, i);
					});
			}
			self._adjustDataSize(data, 0, minMax);
		}

		if (this._oldKeys) {
			// update if we are rendering a new data set on an older graph
			var key, k, os = this._oldYScale, osd = os.domain(),
				s = this._yScale, sd = s.domain();
			self._paths.each(function(d) {
				key = adapter.getPathKey(d);
				if (k = self._oldKeys[key]) {
					d.xo = k.xo;
					d.dxo = k.dxo;
					d.yo = s.invert(os(k.yo));
					if (adapter.isRoot(d)) {
						// convert to new domain so we draw from the same range
						d.dyo = s.invert(os(k.dyo));
					} else {
						// convert but make sure we don't use the interval reserved for the center
						d.dyo = s.invert(os(osd[1] + k.dyo)) - sd[1];
					}
				}
			});
			this._oldKeys = null;
		}

		// handle new paths created, always animate from zero
		paths.each(function(d) {
			var key = adapter.getPathKey(d);
			if ('undefined' === typeof d.xo) {
				d.xo = d.x;
				d.dxo = d.dx;
				d.yo = 0;
				d.dyo = 0;
			}
		});

		// Transition the paths
		paths.transition()
			.duration(500)
			.attrTween('d', this._changeTween(true));

		container.on('mouseleave', function(d, i) {
			if (self._lockedNode || self._isTouch()) { return; }
			self._unhighlightNode();
		});

		if (!modify) {
			// update locked state now that we have paths
			if (this._oldLockedNode) { this._lockNode(this._oldLockedNode); }
			else { this._unlockNode(); }
			this._oldLockedNode = null;
			this._updateZoomPathStyles(this._oldZoomed);
			this._oldZoomed = null;
		}

	};

	sunburst._isMobileSize = function() {
		var options = this._options,
			parentWidth = options.parent.offsetWidth,
			visibleWidth = dv.util.getPercentValue(options.width, parentWidth);
		return visibleWidth < 640;
	};

	sunburst._isTouch = function() {
		return 'ontouchstart' in document.documentElement;
	};

	sunburst._postRender = function() {
		Object.getPrototypeOf(sunburst)._postRender.apply(this);
	};

	sunburst._sizeChart = function(focusElem) {
		var options = this._options, data = this._dataAdapter.data(),
			parent = d3.select(options.parent), self = this,
			infoWrapper = parent.selectAll('.sunburst-cv'),
			wrapper = infoWrapper.selectAll('.sunburst-cv-wrapper'),
			container = wrapper.selectAll('.sunburst-cv-container'),
			infoPane = infoWrapper.selectAll('.sunburst-cv-info-pane'),
			scrollTip = infoWrapper.selectAll('.sunburst-cv-mobile-scroll'),
			parentWidth = options.parent.offsetWidth,
			parentHeight = options.parent.offsetHeight,
			visibleWidth = dv.util.getPercentValue(options.width, parentWidth),
			visibleHeight = dv.util.getPercentValue(options.height, parentHeight),
			isMobileSize = this._isMobileSize(),
			adjustedWidth = visibleWidth + (isMobileSize ? 0 : -250), // can't use dynamic since it starts at 100%
			adjustedHeight = isMobileSize ? Math.min(adjustedWidth, visibleHeight) : visibleHeight, // mobile make height same is width
			padding = options.padding;


		// Determine the visible dimensions of the chart
		var containerWidth = adjustedWidth - 2 - (padding.left + padding.right), // adjust for borders
			containerHeight = adjustedHeight - 2 - (padding.top + padding.bottom);

		infoWrapper.style('width', visibleWidth + 'px').style('height', visibleHeight + 'px')
			.classed('is-desktop', !isMobileSize).classed('not-touch', !this._isTouch());
		wrapper.style('width', adjustedWidth + 'px').style('height', adjustedHeight + 'px');
		container.style('width', containerWidth + 'px').style('height', containerHeight + 'px');
		container.style('padding-top', padding.top + 'px').style('padding-left', padding.left + 'px');
		scrollTip.style('top', (visibleHeight - 30) + 'px')
			.classed('visible', !infoWrapper.node().scrollTop)
			.classed('show', visibleHeight <= adjustedHeight + 130); // padding on bottom
		infoWrapper.on('scroll', function() {
				scrollTip.classed('visible', !infoWrapper.node().scrollTop);
			});
	};

	/**
	 * Build the color slider to display values for color
	 * to be used as a legend for a second metric
	 * @param {object} path data obj
	 * @private
	 */
	sunburst._buildColorSlider = function() {
		var options = this._options, self = this, adapter = this._dataAdapter,
			pane = d3.select(options.parent).selectAll('.sunburst-cv-color');
		if (!adapter.getColorMetric()) { return pane.text(''); }
		var data = adapter.data(), metric = adapter.getColorMetric(),
			extent = this._colorExtent,
			min = self._colorExtentMin, max = self._colorExtentMax,
			container = d3.select(options.parent).selectAll('.sunburst-cv-container'),
			containerWidth = parseInt(container.style('width'), 10),
			paneWidth = containerWidth / 2,
			colors = adapter.seqColors(),
			colorDiv = Math.round(100 / (colors.length - 1)),
			positions = [],
			// Layout
			height = 12,
			padding = 10,
			controlSpacer = 9,
			minMaxWidth = 40,
			legendHeight = (height + (padding * 2) + 2),
			legendWidth = paneWidth,
			barWidth = legendWidth - (minMaxWidth * 2) - (controlSpacer * 2);

		// Populate positions
		colors.forEach(function(c, i) {
			positions.push((i * colorDiv) + '%');
		});

		// Pane
		pane.style('width', legendWidth + 'px');

		// Color title
		var legendTitle = pane.selectAll('.legend-title').data([0]);
			legendTitle.enter()
				.insert('div', ':first-child')
				.classed('legend-title', true);
		legendTitle.text(metric.name);

		// SVG slider
		var legend = pane.selectAll('.color-slider-legend').data([0]);
		legend.enter().append('div').classed('color-slider-legend', true);
		legend.style('width', legendWidth + 'px').style('height', legendHeight + 'px');
		var svg = legend.selectAll('.color-slider').data([0]);
		svg.enter().append('svg').classed('color-slider', true)
			.style('height', legendHeight + 'px').style('width', '100%');

		// Styles to apply gradients
		// We have to inline this as the url() is relative (FF enforces this)
		var styles = svg.selectAll('style').data([0]);
		styles.enter().append('style');
		styles.text(function(d) {
			var style = '.sunburst-cv .sunburst-cv-color .grad-rect { fill: url(#backGradient); \n';
			return style;
		});

		// Add linear gradients definitions
		var defs = svg.selectAll('defs').data([0]);
		defs.enter().append('defs');
		var backGradient = defs.selectAll('#backGradient').data([0]);
		backGradient.enter().append('linearGradient').attr('id', 'backGradient');

		var applyStops = function(selection, positions, colors) {
			var stop = selection.selectAll('stop').data(positions);
			stop.enter()
				.append('stop')
					.attr('class', function(d, i) { return 'stop' + i; });
			stop.attr('offset', function(d) { return d; })
				.attr('stop-color', function(d, i) { return colors[i]; });
		};
		applyStops(backGradient, positions, colors);

		// Gray Background
		/*var gradBg = svg.selectAll('.grad-bg').data([0]);
		gradBg.enter().append('rect').classed('grad-bg', true);

		gradBg
			.style('fill', options.outRangeColor)
			.attr('x', minMaxWidth + controlSpacer)
			.attr('y', padding)
			.attr('rx', height / 2)
			.attr('ry', height / 2)
			.attr('width', barWidth)
			.attr('height', height);*/

		// Gradient Background
		var gradRect = svg.selectAll('.grad-rect').data([0]);
		gradRect.enter().append('rect').classed('grad-rect', true);
		gradRect
			.attr('x', minMaxWidth + controlSpacer)
			.attr('y', padding)
			.attr('rx', height / 2)
			.attr('ry', height / 2)
			.attr('width', barWidth)
			.attr('height', height);

		// End Labels
		var legendLabel = legend.selectAll('.legend-label').data(['min', 'max']);
		legendLabel.enter()
			.append('div').attr('class', function(d) { return 'legend-label ' + d; });
		legendLabel
			.style('left', function(d) { return (d === 'min' ? 0 : minMaxWidth + (controlSpacer * 2) + barWidth) + 'px'; })
			.style('width', minMaxWidth + 'px')
			.text(function(d) {
				var val = d === 'min' ? min : max;
				val = (null === val) ? (d === 'min') ? '-' : '+' : self._formatNumber(metric.format, val);
				return val;
			});

		/*var brushing = false,
			brush = d3.svg.brush()
			.x(d3.scale.linear().range([0, barWidth]))
			.extent(extent)
			.on('brushstart', function() {
				brushing = true;
			})
			.on('brushend', function() {
				brushing = false;
				self._outRangeNodes = [];
				self._hidePath(adapter.data(), self._outRangeNodes, function(d) { return self._isNodeOutsideRange(d); });
			})
			.on('brush', function() {
				var curExtent;
				self.setColorScale(curExtent = brush.extent());
				svg.selectAll('.grad-rect')
					.attr('width', (curExtent[1] - curExtent[0]) * barWidth)
					.attr('x', (barWidth * curExtent[0]) + minMaxWidth + controlSpacer);

				self._updatePathColors();
				legend.selectAll('.legend-label.min').text(self._formatNumber(metric.format, self._colorExtentMin));
				legend.selectAll('.legend-label.max').text(self._formatNumber(metric.format, self._colorExtentMax));
			});

		var handleWidth = 10;
		var handleHeight = height + 20;

		var brushg = svg.selectAll('.brush').data([data]);
		brushg.enter()
			.append('g')
				.classed('brush', true);
		brushg
			.attr('transform', 'translate(' + (minMaxWidth + controlSpacer) + ',' + (padding + (height/2) - (handleHeight/2)) + ')')
			.call(brush);

		var resize = brushg.selectAll('.resize');
		var handle = resize.selectAll('.handle').data(function(d) { return d; });
		handle.enter()
			.append('rect')
				.classed('handle', true);
		handle
			.attr('transform', 'translate(' + -(handleWidth/2) +  ',0)')
			.attr('rx', handleWidth/3)
			.attr('ry', handleWidth/3)
			.attr('width', handleWidth)
			.attr('height', handleHeight);*/
	};

	/**
	 * Recursive method to determine if node is outside
	 * the current adapter extent range
	 * as well as all of its children
	 * @param {object} path data obj
	 * @returns {boolean} true if node and all its children are outside
	 * @private
	 */
	sunburst._isNodeOutsideRange = function(n) {
		var adapter = this._dataAdapter, self = this,
			children = n.children || [],
			inside = children.some(function(c) {
				return !self._isNodeOutsideRange(c);
			});
		return !inside && this.isOutsideRange(n);
	};

	/**
	 * If a secondary metric is set and the node is other, it is invalid
	 * @param {object} path data obj
	 * @returns {boolean} true if node is invalid
	 * @private
	 */
	sunburst._isInvalidNode = function(n) {
		return this._dataAdapter.isOther(n);
	};

	/**
	 * Returns string for number of hidden items
	 * @returns {string}
	 * @private
	 */
	sunburst._hideLabelText = function() {
		var num = this._hiddenNodes.length, l10n = this._dataAdapter.l10n.labels.sunburst,
			label = (num === 1) ? l10n.hidden: l10n['hidden2+'];
		return label.replace(/\{value\}/i, num);
	};

	/**
	 * Recursive hide method
	 * Hides node and children based on the hide method
	 * If no hide method is provided, it will hide the node and every child
	 * @param {object} path data obj
	 * @param {func} return true to hide current n
	 * @private
	 */
	sunburst._hideNode = function(n, hidden, hide) {
		var self = this;
		if (hidden.indexOf(n) > -1) { return; } // already hidden
		if (hide && hide(n) || !hide) { hidden.push(n); } // func to determine if we should hide the node
		if (!n.children || !n.children.length) { return; }
		n.children.forEach(function(c) { self._hideNode(c, hidden, hide); });
	};

	/**
	 * Removes paths from the visualization
	 * They are still accounted for in numbers/percents etc
	 * @param {object} path data obj
	 * @param {array} array to place the hidden nodes in
	 * @param {func} test method to see if a node should be hidden
	 * @private
	 */
	sunburst._hidePath = function(d, hidden, hide) {
		var options = this._options,
			adapter = this._dataAdapter,
			paths = this._paths;
		// add hidden to specified nodes
		this._hideNode(d, hidden, hide);
		// rerun the partition
		this._layoutPaths(true);
		// remove the locked path if it was locked
		if (this._lockedNode && hidden.indexOf(this._lockedNode.data) > -1) {
			this._unlockNode();
		}
		if (this._zoomedPath && hidden.indexOf(this._zoomedPath) > -1) {
			this._zoomPath(adapter.data());
		}
		// update hidden label
		var num = this._hiddenNodes.length, parent = d3.select(options.parent);
		parent.selectAll('.actions-pane-hidden').selectAll('span').html(this._hideLabelText());
		parent.selectAll('.sunburst-cv').classed('hiddenpaths', !!num);
	};

	/**
	 * Restores all paths from the data set
	 * @param {object} path data obj
	 * @private
	 */
	sunburst._unhidePaths = function() {
		this._hiddenNodes = [];
		// rerun the partition
		this._layoutPaths(true);
		// remove hidden class
		d3.select(this._options.parent).selectAll('.sunburst-cv').classed('hiddenpaths', false);
	};

	/**
	 * Zooms the selected path if possible
	 * @param {object} path data obj
	 * @private
	 */
	sunburst._zoomPath = function(d) {
		// Setup the zoom transition
		if (!this._canZoomIn(d)) { return; }
		this._zoomedPath = d;
		this._layoutPaths(true);
		this._updateZoomPathStyles(d);
		// Update options in the right rail
		this._updateDetails(this._lockedNode);
	};

	sunburst._updateZoomPathStyles = function(d) {
		// Update fill color of inner rings
		var self = this, container = d3.select(this._options.parent).selectAll('.sunburst-cv');
		container.classed('zoomed', d && d.depth > 0);
		container.selectAll('.sunburst-cv-container').selectAll('path').each(function(node) {
			d3.select(this).classed('beyondzoom', node && d && // we do have a zoomed node
				node !== d && node.depth > 0 && // node is not the zoomed node and not base metric
				(node.depth <= d.depth || // node is above or a sibling of zoomed or
					!self._hasAncestorNode(node, d))); // node is not a child of zoomed
			d3.select(this).classed('zoomed', node === d);
		});
	};

	/**
	 * The tween animation function for D3 to handle the d attribute tween
	 * Handles zoom and/or hiding elements
	 * @param {object} path data obj
	 * @private
	 */
	sunburst._changeTween = function(hide) {
		var x = this._xScale, y = this._yScale,
			path = this._zoomedPath || this._dataAdapter.data(),
			arc = this._arc, radius = this._radius,
			ringDivisor = this._ringDivisor,
			centerRadius = this._centerRadius,
			cats = this._dataAdapter.categories(),
			xd = d3.interpolate(x.domain(), [path.x, path.x + path.dx]),
			yd = d3.interpolate(y.domain(), (path.y) ? [0, ringDivisor, path.y, 1] : [0, ringDivisor, 1]),
			yr = d3.interpolate(y.range(), (path.y) ? [0, centerRadius, centerRadius, radius] : [0, centerRadius, radius]);

		return function(d, i) {
			var ip = d3.interpolate({ x: d.xo, dx : d.dxo, y: d.yo, dy: d.dyo }, d);
			return i ?
				function(t) {
					return hide ? arc(ip(t)) : arc(d);
				} :
				function(t) {
					// set the updated domains for each step
					x.domain(xd(t));
					y.domain(yd(t)).range(yr(t));
					return hide ? arc(ip(t)) : arc(d);
				};
		};
	};

	/**
	 * Update the fill colors for all paths based on the current state
	 * @private
	 */
	sunburst._updatePathColors = function() {
		var self = this, adapter = this._dataAdapter, hidden = this._getHiddenNodes(),
			container = d3.select(this._options.parent).selectAll('.sunburst-cv'),
			highlighted = container.classed('node-highlighted');
		this._paths.style('fill', function(d) {
			var path = d3.select(this),
				gray = highlighted && (!path.classed('highlighted'));
			return self.getNodeColor(d, gray);
		}).classed('hidden', function(d) {
			return hidden.indexOf(d) >= 0;
		});
	};

	/**
	 * Lock in the highlight/details for a node with type: path, category, item
	 * A type 'path' is the node as it relates to its parents in the data structure
	 * A type 'category' is the category obj as it relates to all nodes at that depth
	 * A type 'item' is the node as it relates to all other nodes with the same name
	 * @param {object} node obj with data and type
	 * @private
	 */
	sunburst._lockNode = function(node) {
		var self = this, options = self._options,
			locked = self._lockedNode;

		if (locked && locked.data === node.data && locked.type === node.type) {
			// toggle
			return self._unlockNode(node);
		}
		self._lockedNode = node;
		self._highlightNode(node);
		self._updateLockedState(node);
		setTimeout(function() {
			d3.select(self._options.parent).select('.sunburst-cv-wrapper')
				.on('click.cvpath', function() {
					// ignore clicking on the paths in the svg
					if (d3.event && d3.event.target && d3.event.target.nodeName === 'path') { return; }
					self._unlockNode();
				});
		}, 10);
	};

	/**
	 * Remove the lock on a node for its highlights/details
	 * @param {object} node data obj with type
	 * @private
	 */
	sunburst._unlockNode = function(node) {
		var self = this, options = self._options;
		self._lockedNode = null;
		self._updateLockedState();
		if (node && !self._isTouch()) { // only highlight if they can hover off to unhighlight it
			self._highlightNode(node);
		} else {
			self._unhighlightNode();
		}
		d3.select(self._options.parent).select('.sunburst-cv-container')
			.on('click.cvpath', null);
	};

	/**
	 * Update the sunburst to color the node and its relations based on type
	 * Update the node details as well
	 * @param {object} node data obj with type
	 * @private
	 */
	sunburst._highlightNode = function(d) {
		// Get the segment path, may not be needed by lets do it only once
		var self = this, type = d && d.type || 'path', node = d && d.data || null,
			nodes = this._getAncestorNodes(node), methods = {}; // default to path

		// Highlight all nodes on the category depth
		methods.category = function(n) {
			return n.depth === node.index + 1;
		};
		// Highlight all nodes of the same name
		methods.item = function(n) {
			return n && node && n.name === node.name;
		};
		// Highlight all nodes in the path and the children of d
		methods.path = function(n) {
			return nodes.indexOf(n) >= 0 || (self._lockedNode && n.parent === node);
		};

		// Fade all the segments.
		var container = d3.select(this._options.parent).selectAll('.sunburst-cv');
		container.classed('node-highlighted', true);

		// Highlight based on type
		container.selectAll('.sunburst-cv-container').selectAll('path').each(function(n) {
			d3.select(this).classed('highlighted', methods[type](n));
		});

		// Highlight categories
		if (!self._lockedNode) {
			container.selectAll('.info-pane-category').each(function(c) {
				// hovering
				d3.select(this).classed('disabled', 'category' === type && c !== node);
			});
		}

		this._updateDetails(d);
		this._updatePathColors();
	};

	/**
	 * Remove the highlights for the node and update details accordingly
	 * @private
	 */
	sunburst._unhighlightNode = function() {
		this._removeHighlights();
		this._updateDetails();
	};

	/**
	 * Unhighlight all paths
	 * @private
	 */
	sunburst._removeHighlights = function() {
		var container = d3.select(this._options.parent);
		// Transition each segment to full opacity and then reactivate it.
		container
			.selectAll('.sunburst-cv').classed('node-highlighted', false)
			.selectAll('path').classed('highlighted', false);
		// Highlight categories
		container
			.selectAll('.info-pane-category').classed('disabled', false);
		this._updatePathColors();
	};

	/**
	 * User has modified the active secondary metric or which visualization is being used
	 * Redraw the sunburst and update the right rail
	 * @private
	 */
	sunburst._secondaryMetricChanged = function() {
		var self = this, adapter = this._dataAdapter,
			l10n =  adapter.l10n.labels.sunburst,
			m = adapter.getSecondaryMetricIndex();
		// reset slider or remove
		self._outRangeNodes = [];
		if (m) {
			// remove invalids
			self._hidePath(adapter.data(), self._invalidNodes, function(d) { return self._isInvalidNode(d); });
			// hide path will call layoutPaths for us
		} else {
			self._invalidNodes = [];
			// rerun the partition
			self._layoutPaths(true);
		}
		// update classes
		var container = d3.select(this._options.parent);
		container.selectAll('.sunburst-cv').classed('secondary-metric', !!m);
		var secondary = container.selectAll('.sunburst-cv-sec-viz');
		secondary.selectAll('.button').classed('active', false);
		var type = adapter.getSecondaryMetricType();
		if (type) {
			secondary.selectAll('.button.'+type).classed('active', true);
		}
		var metric = adapter.getSecondaryMetric(),
			name = metric && metric.name || null;
		secondary.selectAll('.title').html(name ? l10n['mapmetric'].replace(/\{metric\}/i, name) : '');

		// update the details
		this._updateDetails(this._lockedNode);
		// fire event
		this._updateMetricState();
	};


	/**
	 * Based on the data path object that is passed, display either the details about that object
	 * or if not present, display the general chart information based on the chart state
	 * @param {object} data
	 * @private
	 */
	sunburst._updateDetails = function(d) {
		// don't update for item
		if (d && d.type === 'item') { return; }

		// update chart/details
		this._setChartMetrics(d);
		this._setDetailsMetrics(d);
		this._setDetailsAudiences(d);
		this._setDetailsCategories(d);
		this._setDetailsActions(d);
	};


	/**
	 * Update the categories list in the info pane
	 * @param {object} data
	 * @private
	 */
	sunburst._setDetailsCategories = function(d) {
		var self = this, adapter = this._dataAdapter,
			l10n =  adapter.l10n.labels.sunburst,
			data = adapter.data(), categories = adapter.categories(),
			pane = d3.select(this._options.parent).select('.info-pane-categories'),
			zoomDepth = Math.max(0, self._zoomedPath ? self._zoomedPath.depth - 1 : 0),
			list = d && d.type === 'path' && self._lockedNode ? [] : categories.slice(zoomDepth),
			numCats = list.length, node = d || {},
			categoryLabel = pane.selectAll('.info-pane-category').data(list),
			categoryEnter = categoryLabel.enter().append('div').classed('info-pane-category', true).classed('inactive', true);
		pane.select('.pane-title').select('span').text((1 === numCats.length) ? l10n['category'] : l10n['category2+'] );
		categoryLabel.each(function(d, i) {
			var label = d3.select(this);
			label.text(''); // clear
			self._createRingMarker(label, numCats, i);
			label.append('span').classed('name', true).html(d && d.name || '');
			label.append('span').classed('top', true)
				.html('(' + l10n['topresults'].replace(/\{value\}/i, d.top) + ')');
			if (node.type === 'path') {
				label.classed('disabled', !self._lockedNode &&
					node.data && node.data.depth - 1 !== i - zoomDepth);
			} else if (self._lockedNode && self._lockedNode.type === 'category') {
				label.classed('disabled', d !== self._lockedNode.data);
			}
		});
		setTimeout(function() {
			categoryEnter.classed('inactive', false);
		}, 1);
		var categoryExit = categoryLabel.exit().classed('inactive', true)
			.on('mouseenter', null).on('mouseleave', null).on('click', null);
		setTimeout(function() {
			categoryExit.remove();
		}, 400);
		categoryLabel.on('mouseenter', function(d, i) {
			if (self._lockedNode || self._isTouch()) { return; }
			self._highlightNode({ data:d, type:'category' });
		});
		categoryLabel.on('mouseleave', function(d, i) {
			if (self._lockedNode || self._isTouch()) { return; }
			self._unhighlightNode();
		});
		categoryLabel.on('click', function(d, i) {
			self._lockNode({ data:d, type:'category' });
		});
		pane.classed('empty', !list.length);
	};

	/**
	 * Update the audiences list in the info pane and chart label
	 * If no array is passed, clear out the list
	 * @param {array} data obj
	 * @private
	 */
	sunburst._setDetailsAudiences = function(d) {
		// Update the audience
		var self = this, adapter = this._dataAdapter,
			type = d && d.type || '', node = d && d.data || null,
			isCategory = type === 'category', data = adapter.data(),
			nodes = isCategory ? this._getLevelUniqueNodes(data, node.index + 1, false) :
				this._getAncestorNodes(node),
			dataKey = isCategory ? function(d, i) { return i; } :
				function(d, i) { return d && d.depth || 0; },
			categories = adapter.categories(),
			container = d3.select(this._options.parent).selectAll('.sunburst-audiences'),
			endNode = nodes && nodes[0] || data,
			pathIsMetric = data === endNode,
			nodesList = (!nodes || pathIsMetric) ? [] : nodes.slice();

		// Loop over all audience panes for sunburst
		container.each(function(d) {
			var pane = d3.select(this), list = nodesList.slice();
			// Audiences within the center label are different in that they:
			// - display the audience with the most specific audience first
			// - height is static, so no need to set it
			var isCenterLabel = d3.select(pane.node().parentNode).classed('sunburst-cv-label-wrap');

			// path data needs to be reversed but only for right side
			if (!isCategory && !isCenterLabel) {
				if (!self._lockedNode) { list = []; } // don't show audience when hover on path
				list.reverse();
			}
			else if (isCategory && isCenterLabel) { list = []; } // don't show category list

			// Create audience list, remove if empty
			var audienceLabel = pane.selectAll('.sunburst-audience').data(list, dataKey),
				audienceEnter = audienceLabel.enter().append('span').classed('sunburst-audience', true).classed('inactive', true);
			audienceEnter.append('span').classed('marker', true).style('background-color', '#dcdcdc');
			audienceEnter.append('span').classed('category', true);
			audienceEnter.append('span').classed('name', true);
			audienceLabel.each(function(d, i) {
				var label = d3.select(this), category = categories[d.depth - 1];
				label.select('.marker').style('background-color', self.getNodeColor(d));
				label.select('.category').classed('hidden', isCategory || isCenterLabel).text(!isCategory && category && category.name || '');
				label.select('.name').text(d.name);
				label.classed('to-remove', false).attr('my-name', d.name).attr('my-depth', d.depth);
				label.on('mouseenter', function(d, i) {
					if (self._isTouch()) { return; }
					self._highlightNode({ data: d, type: 'item'});
				});
				label.on('mouseleave', function(d, i) {
					if (self._isTouch()) { return; }
					if (self._lockedNode) {
						self._highlightNode(self._lockedNode);
					} else {
						self._unhighlightNode();
					}
				});
				if (isCenterLabel) { return; } // no need to scale height, locked at 1 line

				// clone it and get the actual height without affecting the node
				var clone = d3.select(label.node().cloneNode(true)).style('height', '')
					.classed('test', true).classed('inactive', false);
				pane.node().appendChild(clone.node());
				label.attr('my-height', parseInt(clone.style('height'), 10));
				clone.remove();
			});
			audienceLabel.order();
			setTimeout(function() {
				audienceLabel.each(function(d, i) {
					var label = d3.select(this);
					label.classed('inactive', false);
					if (isCenterLabel) { return; } // no need to set height
					label.style('height', label.attr('my-height') + 'px');
				});
			}, 1);
			var audienceExit = audienceLabel.exit().classed('inactive', true).style('height', '')
				.classed('to-remove', true).on('mouseenter', null).on('mouseleave', null).on('click', null);
			setTimeout(function() {
				audienceExit.each(function(d, i) {
					var exitLabel = d3.select(this);
					if (exitLabel.classed('to-remove')) { exitLabel.remove(); }
				});
			}, 400);
			pane.classed('empty', !list.length);
		});
	};

	/**
	 * Update the actions panel
	 * Allow for integrator to throw actions in as well
	 * @private
	 */
	sunburst._setDetailsActions = function(d) {
		var self = this, adapter = this._dataAdapter,
			data = adapter.data(),
			pane = d3.select(this._options.parent).select('.info-pane-actions');

		// Setup the two columns, one for chart interactions, other for integrator options
		var chartActions = pane.selectAll('.info-pane-actions-chart').data([0]);
		chartActions.enter().append('div').classed('info-pane-actions-chart', true).classed('info-pane-actions-pane', true);
		var extraActions = pane.selectAll('.info-pane-actions-extra').data([0]);
		extraActions.enter().append('div').classed('info-pane-actions-extra', true).classed('info-pane-actions-pane', true);

		// Handlers
		function zoomin() { self._zoomPath(self._lockedNode.data); }
		function zoomout() { self._zoomPath(data); }
		function hide() { self._hidePath(self._lockedNode.data, self._hiddenNodes); }
		function hideall() {
			// hide the locked path and all of other nodes with the same name
			var node = self._lockedNode.data, hidden = self._hiddenNodes;
			if (!node) { return; } // something wrong, we shouldn't have this option if not a locked path
			self._hidePath(data, hidden, function(d) {
					return d.name === node.name || hidden.indexOf(d.parent) >= 0;
				});
			}

		// Compile the chart actions
		var actions = [], // array of obj with label and icon
			l10n =  adapter.l10n.labels.sunburst;
		// If d is passed, we need to show either hover or click options
		if (d && d.type === 'path' && self._lockedNode) {
			// Add options info if locked, otherwise show help info
			var node = d.data, allowedZoom = self._canZoomIn(node),
				pathIsMetric = node === data;
			if (!self._lockedNode) {
				// hover
				if (!pathIsMetric) {
					actions.push( { click: false, icon: 'more', label: l10n.moreAction });
				}
				if (allowedZoom) {
					actions.push( { click: false, icon: 'zoomin', label: l10n.zoomAction });
				}
			} else if (!pathIsMetric) {
				// click
				if (allowedZoom) {
					actions.push( { click: zoomin, className:'zoomin', icon: 'zoomin', label: l10n.zoomin }); }
				else if (self._canZoomOut(node)) {
					actions.push( { click: zoomout, className:'zoomout', icon: 'zoomout', label: l10n.zoomout });
				}
				actions.push( { click: hide, className:'hide', icon: 'hide', label: l10n.hide });
				actions.push( { click: hideall, className:'hideallname', icon: 'hide', label: l10n.hideall });
			}
		}
		// allow full width if only one is showing options
		var extras = self._getExtraActions(d),
			ap = !!actions.length, ep = !!extras.length;
		pane.classed('full-width', (!ap && ep) || (!ep && ap));
		pane.classed('empty', (!ap && !ep));

		// build chart options
		self._buildActionsPane(chartActions, actions);
		// build extra options
		self._buildActionsPane(extraActions, extras);

		// update hover on hideall
		var hidename = pane.selectAll('.hideallname');
		hidename.on('mouseenter', function() {
			if (self._isTouch()) { return; }
			self._highlightNode({ data: self._lockedNode.data, type: 'item'});
		});
		hidename.on('mouseleave', function(d, i) {
			if (self._isTouch()) { return; }
			if (self._lockedNode) {
				self._highlightNode(self._lockedNode);
			} else {
				self._unhighlightNode();
			}
		});
	};

	/**
	 * Adds actions as quiet buttons to actions pane
	 * @param {element} d3 dom element
	 * @param {array} array of objs to create action buttons
	 * @returns {boolean} true if contains content
	 * @private
	 */
	sunburst._buildActionsPane = function(container, actions) {
		var actionButtons = container.selectAll('.info-pane-action').data(actions);
		var actionEnter = actionButtons.enter().append('a').classed('info-pane-action', true).classed('inactive', true);
		actionEnter.append('i').classed('icon', true);
		actionEnter.append('span');
		actionButtons.each(function(d, i) {
			var btn = d3.select(this);
			btn.select('.icon').attr('class', 'icon').classed(d.icon, true);
			btn.select('span').text(d.label);
			btn.attr('class', 'info-pane-action' +
				(btn.classed('inactive') ? ' inactive' : '') +
				(d.click || d.href ? ' action' : ' help'));
			if (d.click) { btn.on('click', d.click); }
			else { btn.on('click', null); }
			if (d.href) { btn.attr('href', d.href); }
			else { btn.attr('href', null); }
			if (d.className) { btn.classed(d.className, true); }

			// clone it and get the actual height without affecting the node
			var clone = d3.select(btn.node().cloneNode(true)).style('height', '')
				.classed('test', true).classed('inactive', false);
			container.node().appendChild(clone.node());
			btn.attr('my-height', parseInt(clone.style('height'), 10));
			clone.remove();
		});
		setTimeout(function() {
			actionButtons.each(function(d, i) {
				var btn = d3.select(this);
				btn.style('height', btn.attr('my-height') + 'px').classed('inactive', false);
			});
		}, 1);
		var actionExit = actionButtons.exit().classed('inactive', true).style('height', '')
			.classed('to-remove', true).on('click', null);
		setTimeout(function() {
			actionExit.each(function(d, i) {
				var exitAction = d3.select(this);
				if (exitAction.classed('to-remove')) { exitAction.remove(); }
			});
		}, 400);

		return !!actions.length;
	};

	/**
	 * Update the metrics labels at the top of the info pane
	 * @param {object} path data obj
	 * @private
	 */
	sunburst._setDetailsMetrics = function(d) {
		var self = this,
			container = d3.select(this._options.parent).select('.info-pane-metrics'),
			plabels = container.select('.pri-metric-labels'),
			slabels = container.select('.sec-metrics-labels'),
			chart = container.select('.info-pane-metrics-chart'),
			adapter = this._dataAdapter, data = adapter.data(),
			pmetric = data.metrics.slice(0,1),
			smetrics = data.metrics.slice(1),
			categories = adapter.categories(),
			l10n = adapter.l10n.labels.sunburst,
			pathNode = d && d.type === 'path' ? d.data : null,
			node = pathNode || data,
			hasChildren = pathNode && pathNode.children && pathNode.children.length && this._lockedNode;

		container.classed('total', !hasChildren);
		container.selectAll('.pane-title').each(function(d, i) {
			var title = d3.select(this),
				label = title.select('span');
			if (title.classed('pri-metric')) { return label.text(l10n['primarymetric']); }
			if (title.classed('sec-metric')) {
				title.classed('hidden', !smetrics.length);
				return label.text(!smetrics.length ? '' :
					(smetrics.length === 1) ? l10n['secondarymetric'] : l10n['secondarymetric2+']);
			}
			if (title.classed('rank-chart')) {
				label.text((hasChildren) ? categories[pathNode.depth] && categories[pathNode.depth].name : '');
			}
		});
		container.selectAll('.sec-metrics-help').each(function(d, i) {
			d3.select(this).text(smetrics.length === 1 ? l10n['secondarymetrichelp'] : l10n['secondarymetrichelp2+'])
				.classed('hidden', !smetrics.length);
		});
		this._setNodeMetricLabels(plabels, node, pmetric, !!pathNode);
		this._setNodeMetricLabels(slabels, node, smetrics, !!pathNode);
		this._setNodeMetricChart(chart, this._lockedNode ? pathNode : null);
	};

	/**
	 * Update the label that is centered in the sunburst
	 * @param {object} data obj
	 * @private
	 */
	sunburst._setChartMetrics = function(d) {
		var chartLabel = d3.select(this._options.parent).select('.sunburst-cv-label-wrap'),
			data = this._dataAdapter.data(), metrics = data.metrics.slice(),
			node = d && d.type === 'path' ? d.data : data;
		// Limit the center chart label to the top metric
		if (metrics.length > 1) { metrics.length = 1; }
		this._setNodeMetricLabels(chartLabel, node, metrics, false);
	};

	/**
	 * Show labels for all passed metrics for the specific node
	 * @param {element} D3 DOM element
	 * @param {object} path data obj
	 * @param {array} list of metrics for data obj
	 * @param {boolean} show marker
	 * @private
	 */
	sunburst._setNodeMetricLabels = function(container, node, metrics, marker) {
		var self = this, adapter = this._dataAdapter, data = adapter.data(),
			l10n = adapter.l10n.labels.sunburst,
			primary = container.classed('pri-metric-labels') || container.classed('sunburst-cv-label-wrap'),
			metricLabel = container.selectAll('.sunburst-cv-label-metric').data(metrics),
			metricEntry = metricLabel.enter().append('div').classed('sunburst-cv-label-metric', true);
		// remove marker if no children to graph
		marker = (node && node.children && node.children.length && this._lockedNode) ? marker : false;
		metricLabel.each(function(metric, i) {
			var label = d3.select(this),
				value = self.getNodeValue(node, primary ? i : i + 1),
				total = self.getNodeValue(data, primary ? i : i + 1),
				isPercent = 'percent' === metric.format,
				isInvalid = (adapter.isOther(node) && !primary ) || (0 === total),
				percent = isPercent ? value : value / self.getNodeValue(data, primary ? i : i + 1),
				activeLabel = primary || (i + 1) === adapter.getSecondaryMetricIndex(),
				hasMarker = marker && activeLabel,
				hasTotalPercent = null !== value && !isPercent && !isInvalid && node !== data;
			// fill in
			label.classed('active', activeLabel);
			// icon
			var icon = label.selectAll('.sunburst-cv-label-icon').data([metric]);
			icon.enter().append('i');
			icon.each(function(d) {
				d3.select(this).attr('class', 'sunburst-cv-label-icon icon') // reset
					.classed(metric.icon || (primary ? 'donut' : 'stack'), true);
			});
			// value
			var number = label.selectAll('.sunburst-cv-label-number').data([metric]);
			number.enter().append('span').classed('sunburst-cv-label-number', true);
			number.html(isInvalid ? '' : self._formatValue(metric, value))
				.classed('hidden', isInvalid);
			// name with percent (if needed)
			var name = label.selectAll('.sunburst-cv-label-name').data([metric]);
			name.enter().append('span').classed('sunburst-cv-label-name', true).append('span');
			name.select('span').html(hasTotalPercent ?
				l10n.percmetric.replace(/\{percent\}/i, self._formatNumber('percent', percent))
					.replace(/\{metric\}/i, metric.name)
				: metric.name);
			// marker
			var masknum = self.getMetricMaskNum(primary ? i : i + 1);
			var svg = name.selectAll('.sunburst-cv-label-marker').data([metric]);
			svg.enter().insert('svg', ':first-child').classed('sunburst-cv-label-marker', true)
				.append('rect').attr('width', 12).attr('height', 12);
			svg.classed('hidden', !hasMarker)
				.select('rect').attr('style', (null === masknum) ? '' : 'mask: url(#diagmask'+ masknum+');');
				label.on('click', primary ? null : function() {
				adapter.setSecondaryMetricIndex(i + 1);
				self._secondaryMetricChanged();
			});
		});
		metricLabel.exit().remove();
	};

	/**
	 * Wrap the core _formatNumber function to handle time
	 * @param {object} metric
	 * @param {number} value
	 * @private
	 */
	sunburst._formatValue = function(metric, value, abbr) {
		if ('time' !== metric.format) { return this._formatNumber(metric.format, value); }
		var v = value, adapter = this._dataAdapter,
			l10n = abbr ? adapter.l10n.time.abbreviation : (1 === v) ?
				adapter.l10n.time.singular : adapter.l10n.time.plural,
			time = adapter.getTimeGranularity(v, true);

		return this._formatNumber(metric.format, v / time.divisor) + ' ' + l10n[time.gran];
	};

	/**
	 * Creates a horizontal bar chart for the specific node's children for the passed metrics
	 * @param {element} DOM element to insert the chart into
	 * @param {object} data obj
	 * @private
	 */
	sunburst._setNodeMetricChart = function(container, node) {
		var self = this, adapter = this._dataAdapter,
			data = adapter.data(),
			hidden = self._getHiddenNodes(),
			children = node && node.children || [],
			visible = children.filter(function(c) {
				return hidden.indexOf(c) < 0;
			}),
			x = [], y = [], fill = [], metric = [], nodes = [], format = [],
			barData = { x:x, y:y, fill:fill, metric:metric, format:format, node:nodes };

		function validMetric(m, i) {
			return 0 === i || i === adapter.getSecondaryMetricIndex();
		}

		var metrics = data.metrics.slice(),
			valid = metrics.filter(validMetric),
			uniqs = valid.map(function(m) { return m.name; });

		// Fill in bar data
		// reverse to compensate for flip reversing our nodes
		visible.reverse().forEach(function(n) {
			var value;
			// create an entry for each valid metric value
			metrics.forEach(function(m, i) {
				if (!validMetric(m, i)) { return; }
				if (null !== (value = self.getNodeValue(n, i))) {
					y.push(value);
					x.push(n.name);
					fill.push(m.name);
					metric.push(m.name);
					format.push(m.format);
					nodes.push(n);
				}
			});
		});

		var hasContent = !!y.length;

		var paneSVG = container.selectAll('.info-pane-chart-svg').data([0]);
		paneSVG.enter().append('div').classed('info-pane-chart-svg', true);
		paneSVG.exit().remove();
		container.classed('hidden', !hasContent);

		// Create bar chart
		if (hasContent) {

			var barHeight = 15,
				groupPadding = 25,
				dodgeSpacing = 0.05, // percentage of the height
				numInGroup = valid.length,
				numOfGroup = visible.length,
				groupHeight = (numInGroup * barHeight) + groupPadding,
				groupSpacing = groupPadding / groupHeight,
				// 2 * to compensate for 0.5 padding between each group
				chartHeight = Math.ceil((numInGroup * numOfGroup * barHeight) / (1 - groupSpacing));

			// Set height of the div
			paneSVG.style('height', chartHeight + 'px');
			var chart = dv.chart()
				.layers([
					dv.geom.bar()
						.map('group', 'fill')
						.set('fill', function(d, i) {
							return self.getNodeColor(d.data.node);
						})
						.each('start', function(d, i) {
							var masknum = self.getMetricMaskNum(uniqs.indexOf(d.data.metric));
							d3.select(this).attr('mask', (null === masknum) ? '' : 'url(#diagmask'+masknum+')');
						})
						.on('click', function(d) { self._selectChildFromRanked(d); } )
						.dodgePadding(dodgeSpacing),
					dv.geom.text()
						.map('label', 'y')
						.map('group', 'fill')
						.set('fill', '#4b4b4b')
						.textFormat(function(d, i) {
							return d ? self._formatValue({ format: this.__data__.data.format }, d, true) : '';
						})
						.textAnchor('start').set('fill', '#4b4b4b').dx(4).dy(5)
						.on('click', function(d) { self._selectChildFromRanked(d); } )
				])
				.coord(dv.coord.cartesian().flip(true))
				.data(barData)
				.position('dodge')
				.guide('x', dv.guide.axis()
					.tickDx(function(d, i) {
						return d3.select(this).select('span').node().offsetWidth;
					})
					.tickDy(function(d, i) {
						return ((-numInGroup * barHeight) / 2) -
							(d3.select(this).select('span').node().offsetHeight / 2);
					})
					.tickSize(0)
					.tickAnchor('end'))
				.guide('y', dv.guide.axis().ticks(0).tickSize(0).tickFormat(function(d, i) { return ''; }))
				.map('x', 'x', dv.scale.ordinal().padding(groupSpacing))
				.width('100%')
				.height(chartHeight)
				.duration(400)
				.padding({top: 2, right : 65}) // CV-542: cropping on some FF browsers on top with JP chars
				.parent(paneSVG.node());

			// Train each metric on its own scale
			uniqs.forEach(function(g, index) {
				var scale = dv.scale.linear().lowerLimit(0);
				scale.includeInDomain(function(d, i) {
					return d.data['metric'] === uniqs[index];
				});
				chart.map('y', 'y', scale, index);
			});
			chart.render();


			// Patterning for metrics
			var group = paneSVG.select('svg').selectAll('defs').data([0]);
			group.enter().append('defs');

			var patterns = [45]; //[45, 135, 90, 0];
			var pattern = group.selectAll('pattern').data(patterns);
			var patternEnter = pattern.enter()
				.append('pattern')
					.attr('id', function(d, i) {
						return 'diag' + i;
					})
					.attr('patternUnits', 'userSpaceOnUse')
					.attr('width', '3').attr('height', '3')
					.attr('patternTransform', function(d, i) {
						return 'rotate('+d+' 2 2)';
					});
			// Rect allows for the entire background to come through
			patternEnter.append('rect').attr('x', '0').attr('y', '0').attr('width', '3').attr('height', '3').attr('style', 'fill:#fff;');
			// Path is then repeated to fade out some lines
			patternEnter.append('path').attr('d', 'M -1,0 l 10,0').attr('style', 'stroke:#222; fill:none; stroke-width: 3px;');

			var mask = group.selectAll('mask').data(patterns);
			mask.enter()
				.append('mask')
					.attr('id', function(d, i) {
						return 'diagmask' + i;
					})
					.attr('x', '0').attr('y', '0')
				.append('rect')
					.attr('x', '0').attr('y', '0')
					.attr('width', '100%').attr('height', '1')
					.attr('style', function(d, i) {
						return 'stroke:none; fill:url(#diag'+i+')';
					});

			// update mask height
			group.selectAll('mask').selectAll('rect').attr('height', chartHeight);

		} else {
			paneSVG.style('height', '0px');
		}
	};

	/**
	 * Take a data object from the ranked bar chart and determine if its a child of the locked path
	 * If it is, based on name, lock that child path obj
	 * @param {array} dv data obj
	 * @private
	 */
	sunburst._selectChildFromRanked = function(d) {
		var locked = this._lockedNode.data, name = d.data.x;
		if (!locked || !locked.children || !locked.children.length) { return; }
		var i, ii=locked.children.length, child, selected = null;
		for (i=0; i<ii; ++i) {
			if ((child = locked.children[i]).name === name) {
				selected = child;
				break;
			}
		}
		if (selected) {
			this._lockNode( { data: selected, type: 'path' });
		}
	};

	/**
	 * Creates a SVG representation of the sunburst to highlight a ring
	 * @param {element} DOM element to insert the SVG to
	 * @param {number} number of rings in the SVG
	 * @param {highlighted} the ring to highlight
	 * @private
	 */
	sunburst._createRingMarker = function(container, num, highlighted) {
		var svg = container.append('svg').classed('category-ring', true),
			g = svg.append('g').attr('transform', 'translate(12,12)'),
			width = parseInt(svg.style('width'), 10), radius = width / 2,
			lineWidth = 2, lineGap = 1,
			center = radius - (lineWidth * num) - (lineGap * (num - 1)),
			inner, outer, i;
		for (i=0; i<num; ++i) {
			inner = center + ((lineWidth + lineGap) * i);
			outer = inner + lineWidth;
			g.append('path')
				.classed('active', i === highlighted)
				.attr('d', d3.svg.arc()
					    .innerRadius(inner)
					    .outerRadius(outer)
					    .startAngle(0)
					    .endAngle(2 * Math.PI));
		}
	};

	/**
	 * If the path data object is allowed to zoom in
	 * @param {object} path data obj
	 * @returns {boolean}
	 * @private
	 */
	sunburst._canZoomIn = function(d) {
		var metric = this._dataAdapter.data(),
			zPath = this._zoomedPath;
		//return d.children && d.children.length &&
			// Non metric that is not currently zoomed
		return (d !== metric && d !== zPath) ||
			// Metric but another path is zoomed
			(d === metric && metric !== zPath && !!zPath);
	};

	/**
	 * If the path data object is allowed to zoom out
	 * @param {object} path data obj
	 * @returns {boolean}
	 * @private
	 */
	sunburst._canZoomOut = function(d) {
		return d === this._zoomedPath;
	};

	/**
	 * Returns a list of ancestor nodes that have a parent, including d
	 * If d doesn't have any parents, will return just d
	 * @param {object} data
	 * @returns {array} list of nodes
	 * @private
	 */
	sunburst._getAncestorNodes = function(d) {
		var path = [], current = d;
		if (!d) { return path; }
		while (current.parent) {
			path.push(current);
			current = current.parent;
		}
		if (!path.length) { path = [d]; }
		return path;
	};

	/**
	 * Returns true if passed data object has node as an ancestor
	 * returns false otherwise
	 * @param {object} data node
	 * @param {object} ancestor node
	 * @returns {bool} true if data node contains ancestor node
	 * @private
	 */
	sunburst._hasAncestorNode = function(d, node) {
		if (!d || !node || d.depth < node.depth || d === node) { return false; }
		var current = d;
		while (current.parent) {
			if (current.parent === node) { return true; }
			current = current.parent;
		}
		return false;
	};

	/**
	 * Determines height of pane based on direct children height/padding
	 * @param {elem} d3 element
	 * @returns {number} calculated height
	 * @private
	 */
	sunburst._getInfoPaneHeight = function(pane) {
		var height = 0, node;
		d3.selectAll(pane.node().childNodes).each(function(n, i) {
			node = d3.select(this);
			height += parseInt(node.style('height'), 10) +
						parseInt(node.style('padding-bottom'), 10) +
						parseInt(node.style('padding-top'), 10);
		});
		return height;
	};

	/**
	 * Informs of the current locked state with node
	 * @param {object} data object if one is selected
	 * @private
	 */
	sunburst._updateLockedState = function(d) {
		var self = this;
		if (self._eventMap['sunburst.locked']) {
			self._eventMap['sunburst.locked'].call(this, d, self._dataAdapter.data());
		}
	};

	/**
	 * Informs of the current secondary metric
	 * @private
	 */
	sunburst._updateMetricState = function() {
		var self = this, adapter = self._dataAdapter;
		if (self._eventMap['sunburst.metric']) {
			self._eventMap['sunburst.metric'].call(this, adapter.getSecondaryMetricIndex(),
				adapter.getSecondaryMetricType() ,adapter.data());
		}
	};

	/**
	 * Calls actions handler to see if we should populate some actions
	 * @param {object} data object if one is selected
	 * @private
	 */
	sunburst._getExtraActions = function(d) {
		var self = this;
		if (self._eventMap['sunburst.actions']) {
			return self._eventMap['sunburst.actions'].call(this, d, !!this._lockedNode, self._dataAdapter.data());
		}
		return [];
	};

	/**
	 * Gets the numerical value of the path object
	 * This may or may not match the visual representation
	 * Use the metric index to get the correct metric value, otherwise..
	 * Use the size attribute, otherwise ...
	 * Use the computed sum of the children nodes
	 * Show the path objects details
	 * @param {object} path data obj
	 * @param {num} metric array index
	 * @private
	 */
	sunburst.getNodeValue = function(n, i) {
		if (!n) { return 0; }
		if (n.metrics && n.metrics.length && n.metrics[i] &&
			'undefined' !== typeof n.metrics[i].value) { return n.metrics[i].value; }
		if (i > 0) { return null; } // invalid value
		if ('undefined' !== typeof n.size) { return n.size; }
		return n.value;
	};

	/**
	 * Gets the category's minimum value and maximum value for a specific metric
	 * If no category index is passed, min/max for metric for all categories
	 * Will ignore nodes from the hidden list
	 * Recursively sorts through the nodes
	 * @param {number} metric index
	 * @param {number} category index or undefined
	 * @return {object} { min:val, max:val }
	 */
	sunburst.getMetricCategoryMinMax = function(mIndex, cIndex) {
		var o, self = this, adapter = this._dataAdapter, data = adapter.data(),
			hidden = this._getHiddenNodes(), zoomed = this._zoomedPath;
		function getMinMax(d) {
			if (zoomed && zoomed.depth === d.depth && zoomed !== d) { return; } // outside zoom
			// check if same level or if no level is set
			if ('undefined' === typeof cIndex || d.depth === cIndex + 1) { // depth is 1 based, categories are 0 based
				if (adapter.isOther(d)) { return; } // never count other
				if (hidden.indexOf(d) >= 0) { return; }
				var val = self.getNodeValue(d, mIndex);
				if ('undefined' === typeof o) {
					o = { min: val, max: val };
				} else {
					o.min = Math.min(o.min, val);
					o.max = Math.max(o.max, val);
				}
				if (cIndex) {
					return; // no need to go deeper
				}
			}
			if (!d.children || !d.children.length) { return; }
			// recursively update
			d.children.forEach(function(c) {
				getMinMax(c);
			});
		}
		getMinMax(data);
		return o || null;
	};

	/**
	 * Determines the correct hex color for the data object
	 * @param {object} data object
	 * @param {boolean} true if should be grayscaled
	 * @returns {string} hex color
	 */
	sunburst.getNodeColor = function(d, gray) {
		var adapter = this._dataAdapter, scale = this.getColorScale(d), color;
		// Handle metric, can't be grayscaled
		if (!d.depth) { return adapter.metricColor(); }
		// Handle other
		if (adapter.isOther(d)) { color = adapter.otherColor(); }
		// Handle sequential colors, inside and outside of range
		else if (adapter.getColorMetric()) {
			color = this.isOutsideRange(d) ? adapter.outRangeColor() : scale(d.metrics[adapter.getColorMetricIndex()].value);
		// Categorical coloring
		} else { color = scale(d.name); }
		// Grayscale color
		if (gray) { color = this._grayColor(color, d); }
		return color;
	};

	/**
	 * Get the grayscale color for the passed color
	 * @param {string} hex color '#ff0000'
	 * @param {object} data object
	 * @returns {string} gray hex color
	 * @private
	 */
	sunburst._grayColor = function(c, d) {
		var adapter = this._dataAdapter;
		if (adapter.isOther(d)) { return adapter.otherGrayColor(); }
		// convert hex to rgb
		var rhex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
			match = c && c.match(rhex);
		if (!match) { return c; } // not able to parse, return the same color
		var rgb = [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)],
			// using luminosity method of grayscale, which does an average but weights for human perception
			avg = Math.round((0.21 * rgb[0]) + (0.71 * rgb[1]) + (0.07 * rgb[2]));
		return '#' + ((1 << 24) + (avg << 16) + (avg << 8) + avg).toString(16).slice(1);
	};

	/**
	 * Get the index of the pattern to be used
	 * We only have one pattern, so if the metric index is > 0,
	 * then the pattern index is 0
	 * @param {number} metric index
	 * @returns {number} index inside patterns array
	 */
	sunburst.getMetricMaskNum = function(i) {
		return (i === 0) ? null : 0; // hardcoded to single pattern
	};

	/**
	 * Determine if the value for the color metric for the node is within the range
	 * @param {object} node data object
	 * @returns {boolean}
	 */
	sunburst.isOutsideRange = function(d) {
		var adapter = this._dataAdapter,
			metric = adapter.getColorMetric(),
			mIndex = adapter.getColorMetricIndex();
		if (!metric || !d || !d.metrics || 'percent' !== metric.format) { return false; }
		var val = d.metrics[mIndex].value;
		return val > this._colorExtentMax || val < this._colorExtentMin;
	};

	/**
	 * Get the correct color scale based on secondary metric and node
	 * @params {object} node object
	 * @returns {object} d3 scale
	 */
	sunburst.getColorScale = function(d) {
		var adapter = this._dataAdapter, metric;
		// categorical, only one scale
		if (!(metric = adapter.getColorMetric())) { return this._colorScale; }
		// rate, only one scale
		if ('percent' === metric.format) { return this._colorScale; }
		return this._categoryColorScales[d.depth - 1];
	};

	/**
	 * Creates a d3 scale for color based on the extent and max/min values
	 * @params {array} normally [0,1]
	 * @params {number} maximum value
	 * @params {number} minimum value
	 * @params {boolean} store the extent max/min for later use
	 * @returns {function} method to call to get value from scale
	 */
	sunburst._createColorScale = function(extent, max, min, rate) {
		var adapter = this._dataAdapter, colors = adapter.seqColors(),
			extentMin = ((max - min) * extent[0]) + min,
			extentMax = ((max - min) * extent[1]) + min,
			dif = extentMax - extentMin,
			div = colors.length - 1;

		if (rate) {
			this._colorExtent = extent;
			this._colorExtentMin = extentMin;
			this._colorExtentMax = extentMax;
		}

		var colorDomain = [extentMin];
		for (var i=1; i<div; ++i) { colorDomain.push(((dif/div)*i) + extentMin); }
		colorDomain.push(extentMax);
		return d3.scale.linear().domain(colorDomain).range(colors).clamp(true);

		// Log scaling of colors, commented out for now but we may make it an option
		/*var colorDomain = [extentMin],
			shiftDomain = [0.01];
		for (var i=1; i<div; ++i) {
			colorDomain.push(((dif/div)*i) + extentMin);
			shiftDomain.push(((1/div)*i) + 0.01);
		}
		colorDomain.push(extentMax);
		shiftDomain.push(1);
		// shift scale to a known linear scale, then apply log
		var linScale = d3.scale.linear().domain(colorDomain).range(shiftDomain).clamp(true),
			scale = d3.scale.log().domain(shiftDomain).range(colors);
		return function(d) {
			return scale(linScale(d));
		};*/
	};

	/**
	 * Set the color scale based on if there is a secondary metric for color
	 * as well as to what extent of the values should be shown
	 * @params {array} [0,1] or smaller if resizing
	 */
	sunburst.setColorScale = function(extent) {
		extent = extent || [0,1];
		var self = this, adapter = this._dataAdapter, data = adapter.data(), metric;
		// Categorical
		if (!(metric = adapter.getColorMetric())) {
			this._colorScale = d3.scale.ordinal().domain(adapter.uniques()).range(adapter.colors());
			return;
		}
		var index = adapter.getColorMetricIndex(), minMax;
		// Rate - same scale for all nodes
		if ('percent' === metric.format) {
			minMax = self.getMetricCategoryMinMax(index);
			this._colorScale = this._createColorScale(extent, minMax.max, minMax.min, true);
			return;
		}

		// Get min max for each category
		minMax = data.categories.map(function(c, i) {
			return self.getMetricCategoryMinMax(index, i);
		});
		this._categoryColorScales = minMax.map(function(o, i) {
				return self._createColorScale(extent, o.max, o.min, !i);
			});
		// overwrite min/max
		this._colorExtentMin = null;
		this._colorExtentMax = null;
	};

	global.cloudViz.sunburst = cloudViz.util.createConstructor(sunburst);
}(this));
/**
 * flower
 * The flower chart is designed to work similar to a spider web or radar chart.
 */

(function (global) {
	'use strict';

	// Standard creation code for a CloudViz chart
	var cloudViz = global.cloudViz || {}, core = cloudViz.core || {},
		dv = global.dv || {}, d3 = global.d3 || {},
		flower = Object.create(core);

	flower.init = function(options) {
		this._type = 'flower';
		this._initDefaultOptions(); // merge in the options
		this.setOptions(options);
		this.colorScale = dv.scale.color()._d3Scale; // This seems very wrong.....
		return this;
	};

	flower._initDefaultOptions = function() {
		var defaults = {
				animationDuration: 500,          // Set to 0 to remove animation.
				labelFormatter: null,            // Function to format the labels. To hide the labels, use function(d){return "";}
				clickHandler : null,             // Function to call when a petal is clicked.
				onlyUseThreePetalLengths: true,  // Makes the petals length only be 1/3, 2/3 or full length.
				isEmotionChart: true,            // If set to true, use the default labels and colors for emotions.
				mouseoverCallback: [null, null], // Array of two functions to modify the mouseover and mouseout
				horizontalPadding: 70,           // Padding to allow for text. Set to 0 if you are hiding the labels.
				verticalPadding: 30,             // Padding to allow for text. Set to 0 if you are hiding the labels.
				text_offset: 5                   // Padding from the tip of the petal to the label.
			};
		return Object.getPrototypeOf(flower)._initDefaultOptions.call(this, defaults);
	};

	// Called if the autoResize option is set to true.
	flower._onAutoResize = function() {
		this._render();
	};

	// Just call render. Resizing is all handled in the render call.
	flower.resize = function() {
		this._render();
	};

	/**
	 * Resets the chart instance.  Called on both render and destroy.
	 **/
	flower.reset = function() {
		Object.getPrototypeOf(flower).reset.apply(this, arguments);
	};

	flower._preRender = function() {
		Object.getPrototypeOf(flower)._preRender.apply(this);
	};

	// Set up layers to keep the svg elements in the proper order.
	flower._setUpLayer = function(svg, key){
		this['layer' + key] = svg.selectAll('.flower-cv-svg-group-layer' + key).data([0]);
		this['layer' + key].enter().append('g').classed('flower-cv-svg-group-layer' + key, true);
	};

	flower.sprintf = function(s, d) {
		return s.replace(/\{([\w]+)\}/ig, function(a, b){
			return d[b];
		});
	};

	flower._render = function() {
		Object.getPrototypeOf(flower)._render.apply(this);
		var that = this;

		this._parent = d3.select(this._options.parent);

		var cv_wrapper = this._parent.selectAll('.cv-wrapper.cv-flower').data([0]);
		cv_wrapper.enter()
			.append('div')
			.classed('cv-wrapper cv-flower', true);

		var svg = cv_wrapper.selectAll('.flower-cv-svg').data([0]);
		svg.enter().append('svg').classed('flower-cv-svg', true);

		this._svg_group = svg.selectAll('.flower-cv-svg-group').data([0]);
		this._svg_group.enter().append('g').classed('flower-cv-svg-group', true);

		this._setUpLayer(this._svg_group, 1);
		this._setUpLayer(this._svg_group, 2);
		this._setUpLayer(this._svg_group, 3);
		this._setUpLayer(this._svg_group, 4);
		this._setUpLayer(this._svg_group, 5);
		this._setUpLayer(this._svg_group, 6);

		var width = this._options.width || parseInt(this._parent.style('width'), 10);
		var height = this._options.height || parseInt(this._parent.style('height'), 10);

		cv_wrapper
			.style('width', width + 'px')
			.style('height', height + 'px');

		var half_width = width / 2;
		var half_height = height / 2;

		this._svg_group.attr("transform", this.sprintf("translate({width},{height})",{width: half_width, height: half_height}));

		var data = that._dataAdapter.data();
		var possible_width = half_width - this._options.horizontalPadding;
		var possible_height = half_height - this._options.verticalPadding;
		var labelFormatter = this._options.labelFormatter || function(labels){
			labels.append('tspan')
					.attr('class','flower-cv-petal-label')
					.text(function(d){return d.label + ' ';});
			labels.append('tspan')
					.attr('class','flower-cv-petal-label-value')
					.text(function(d){return that._formatNumber('percent', d.value / that._total, 0);});
		};
		var mouseoverCallback = this._options.mouseoverCallback[0] || function() {d3.select(this).attr('opacity', 1); };
		var mouseoutCallback = this._options.mouseoverCallback[1] || function(d) {d3.select(this).attr('opacity', d.petal_opacity).attr('fill', d.petal_color);};

		this._is_single_mode = this._options.onlyUseThreePetalLengths;
		this._petal_size = Math.min(possible_width, possible_height);
		this._circle_size = this._petal_size * 0.676 / 2;
		this._arc_thickness = this._petal_size * 0.027;
		this._arc_half_angle = 360 / data.length / 2 + 0.5;
		this._petal_count = data.length;

		var getTextSizeScale = d3.scale.linear()
			.domain([55, 185])
			.range([9, 12])
			.clamp(true);

		this._font_size = getTextSizeScale(this._petal_size);

		var text_offsets = [
			{offset_y: 1,    fixed_offset_y: 0,    offset_x: 0,    location: 'middle'}, // top
			{offset_y: 1,    fixed_offset_y: 0,    offset_x: -1.5, location: 'middle'}, // tr
			{offset_y: 0,    fixed_offset_y: -2.5, offset_x: -0.8, location: 'start'}, // r
			{offset_y: -1,   fixed_offset_y: -9,   offset_x: -1.5, location: 'middle'}, // br
			{offset_y: -1,   fixed_offset_y: -9,   offset_x: 0,    location: 'middle'}, // b
			{offset_y: -1,   fixed_offset_y: -9,   offset_x: 1.5,  location: 'middle'}, // bl
			{offset_y: 0,    fixed_offset_y: -2.5, offset_x: 0.8,  location: 'end'}, // l
			{offset_y: 1,    fixed_offset_y: 0,    offset_x: 1.5,  location: 'middle'} // tl
		];

		this._total = d3.sum(data, function(d){return d.value;});

		var getAngleScale = d3.scale.linear()
			.domain([0, data.length])
			.range([0, 360]);

		this._getTextOffsetIndex = d3.scale.linear()
			.domain([0, 360])
			.rangeRound([0, 8])
			.clamp(true);

		this._getSizeZeroToThree = d3.scale.linear()
			.domain([0, d3.max(data, function (d) {
				return d.value;
			})])
			.rangeRound([0, 3]);

		this._getPetalSize = d3.scale.linear()
			.domain([d3.min(data, function (d) {
				return d.value;
			}), d3.max(data, function (d) {
				return d.value;
			})])
			.rangeRound([this._circle_size + this._arc_thickness + 10, this._petal_size]);


			dv.util.each(data, function (o, k) {
				o.angle = getAngleScale(k);
				that._addPetalSizes(o);
			});

		this._getTextOffsetScale = function(angle) {
			var index = this._getTextOffsetIndex(angle);
			if(index == 8) {index = 0;} // if it is all the way around, set it back to the top position.
			return text_offsets[index];
		};

		// Full Gray Petal
		var gray_bg_petals = this.layer1.selectAll('.flower-cv-gray-petals').data(data);

		gray_bg_petals.enter().append("path")
		.attr('class', 'flower-cv-gray-petals')
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr("d", that._makePetal(0, 0, 0, 0))
		.attr('opacity', 0);

		gray_bg_petals.transition().duration(that._options.animationDuration)
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr("d", function(d){return that._makePetal(0, 0, 0, d.full_petal); })
		.attr('opacity', function(d){return d.petal_size_number == 3 ? 0 : 1;});

		gray_bg_petals.exit().transition().duration(that._options.animationDuration)
		.attr("d", that._makePetal(0, 0, 0, 0))
		.attr('opacity', 0)
		.remove();

		//Color Petals
		var color_petals = this.layer2.selectAll('.flower-cv-color-petals').data(data);

		color_petals.enter().append("path")
		.attr('class', 'flower-cv-color-petals')
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr('opacity', function(d){return d.petal_opacity;})
		.attr("d", that._makePetal(0, 0, 0, 0))
		.attr('fill', function(d){return d.petal_color; })
		.on("mouseover", mouseoverCallback)
		.on("mouseout", mouseoutCallback)
		.on("click", function(d) {
			if (that._options.clickHandler) {
				that._options.clickHandler(d);
			}
		});

		color_petals.transition().duration(that._options.animationDuration)
		.attr("d", function(d){return that._makePetal(0, 0, 0, d.petal_size); })
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr('fill', function(d){return d.petal_color; })
		.attr('opacity', function(d){return d.petal_opacity; });

		color_petals.exit().transition().duration(that._options.animationDuration)
		.attr("d", that._makePetal(0, 0, 0, 0))
		.attr('opacity', 0)
		.remove();

		var white_arcs = this.layer3.selectAll('.flower-cv-white-arcs').data(data);

		// White border
		var arc = d3.svg.arc()
			.innerRadius(0)
			.outerRadius(this._circle_size + this._arc_thickness + 1)
			.startAngle(-that._arc_half_angle * (Math.PI / 180)) //converting from degs to radians
		.endAngle(that._arc_half_angle * (Math.PI / 180)); //just radians

		white_arcs.enter().append("path")
		.attr('class', 'flower-cv-white-arcs')
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr("fill", "white");

		white_arcs.transition().duration(that._options.animationDuration)
		.attr("d", arc)
			.attr("transform", function(d){ return "rotate(" + d.angle + ")"; });

		white_arcs.exit().remove();

		// Color bar
		arc = d3.svg.arc()
			.innerRadius(0)
			.outerRadius(this._circle_size + this._arc_thickness)
			.startAngle(-(that._arc_half_angle - 1) * (Math.PI / 180)) //converting from degs to radians
		.endAngle((that._arc_half_angle -1) * (Math.PI / 180)); //just radians

		var color_arcs = this.layer4.selectAll('.flower-cv-color-arcs').data(data);
		color_arcs.enter().append("path")
		.attr('class', 'flower-cv-color-arcs')
		.attr("d", arc)
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; })
		.attr('fill', function(d){return d.arc_color; });

		color_arcs.transition().duration(that._options.animationDuration)
		.attr("d", arc)
		.attr('fill', function(d){return d.arc_color; })
		.attr("transform", function(d){ return "rotate(" + d.angle + ")"; });

		color_arcs.exit().remove();

		var petal_labels = this.layer5.selectAll('.flower-cv-petal-labels').data(data);
		petal_labels.enter().append("text")
		.attr('class', 'flower-cv-petal-labels')
		.attr("x", 0)
		.attr("y", 0)
		.attr("text-anchor", function(d){return that._getTextOffsetScale(d.angle).location; })
		.attr("dx", function(d){return that._getTextOffsetScale(d.angle).offset_x * -that._options.text_offset; })
		.attr("dy", function(d){return that._getTextOffsetScale(d.angle).offset_y * -that._options.text_offset - that._getTextOffsetScale(d.angle).fixed_offset_y; })
		.style('font-size', that._font_size)
		.attr("transform", function(d){ return "rotate(" + d.angle + ") rotate(" + -d.angle + ", 0, " + 0 + ")"; })
		.attr('opacity', 0);

		petal_labels
		.style('font-size', that._font_size + 'px')
		.attr("text-anchor", function(d){return that._getTextOffsetScale(d.angle).location; })
		.attr("dx", function(d){return that._getTextOffsetScale(d.angle).offset_x * -that._options.text_offset; })
		.attr("dy", function(d){return that._getTextOffsetScale(d.angle).offset_y * -that._options.text_offset - that._getTextOffsetScale(d.angle).fixed_offset_y; })
		.selectAll("*").remove();

		// Since Firefox and Safari cannot have tspans dynamcially inserted via the html() call,
		// we pass the entire object into the formatter so that the tspans can be appended.
		// This allows for greater customization of the labels that just a string of text.
		labelFormatter(petal_labels);

		petal_labels.transition().duration(that._options.animationDuration)
		.attr("y", function(d){return d.petal_size; })
		.attr("transform", function(d){ return "rotate(" + d.angle + ") rotate(" + -d.angle + ", 0, " + d.petal_size + ")"; })
		.attr('opacity', function(d){return d.petal_number_size === 0 ? 0 : 1;});

		petal_labels.exit().remove();

		var main_circle = this.layer6.selectAll('.flower-cv-main-circle').data([1]);
		main_circle.enter().append("circle")
		.attr('class', 'flower-cv-main-circle')
		.attr("cx", 0)
		.attr("cy", 0);

		main_circle.transition().duration(that._options.animationDuration)
			.attr("r", that._circle_size);

	}; // end the renderPreinit

	flower._makePetal = function(x, y, x2, y2) {
		var radius = this._circle_size + this._arc_thickness + 1,
		    half_width = (radius * 2 * Math.PI) / this._petal_count / 2,
		    degrees = half_width / (radius * 2 * Math.PI) * 360,
		    y3 = Math.cos(degrees * Math.PI / 180) * radius,
		    x3 = Math.sin(degrees * Math.PI / 180) * radius;
		y = -y3;
		var start_x = x - x3,
		    end_x = x + x3,
		    bulge_vertical_location = (y2 - y) * -1 * 0.6,
		    height = (y2 - y) * -1,
		    bulge_width = height * 0.2,
		    result = [
		        'M', start_x, y,
		        'C', start_x - bulge_width, y - bulge_vertical_location, x, y2, x2, y2,
		        'C', x2, y2, end_x + bulge_width, y - bulge_vertical_location, end_x, y
		    ];

		return result.join(' ');
	};

	// This function figures out the petal size and opacity for each of the data points.
	flower._addPetalSizes = function(o){
		if(!o.color){
			o.color = this.colorScale(o.label);
		}
		var size = this._getSizeZeroToThree(o.value);

		if (!this._is_single_mode) {
			if (size === 0) {
				size = 1;
			}
		}

		if(o.value === 0){
			size = 0;
		}

		var opacity = 0.9;
		var color = o.color;
		var arc_color = color;
		var petal_size = this._petal_size;
		var full_petal = petal_size * -1;
		switch (size) {
			case 0:
				opacity = 0;
				arc_color = '#e6e6e6';
				petal_size = 0;
				color = color; // you added this so it would always be defined for transitions.
				break;
			case 3:
				opacity = 0.9;
				break;
			case 2:
				opacity = 0.75;
				petal_size = petal_size * 0.795;
				break;
			case 1:
				opacity = 0.5;
				petal_size = petal_size * 0.6;
				break;
		}

		if (!this._is_single_mode) {
			petal_size = this._getPetalSize(o.value);
		}
		if(o.value === 0){
			petal_size = 0;
		}

		petal_size *= -1;
		o.petal_opacity = opacity;
		o.petal_size = petal_size;
		o.petal_color = color;
		o.full_petal = full_petal;
		o.petal_number_size = size;
		o.arc_color = arc_color;
	};

	global.cloudViz.flower = cloudViz.util.createConstructor(flower);
}(this));
/**
 * Gauge Chart
 *
 * A gauge chart is useful for showing a single value in dashboards, real-time monitors, and reports. They can
 * also give contextual information such as whether than value falls in an acceptable range or not.
 */
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz || {},
		core = cloudViz.core || {},
		dv = global.dv || {},
		d3 = global.d3 || {},
		gauge = Object.create(core);

	var ringThickness = 0.15, // percent thickness of the arc based on radius
		outerPadding = 0.05, // percent padding outside the arc based on radius
		needleThickness = 0.09, // percent thickness of the needle based on radius
		needleLengthRatio = 1 + outerPadding, // percent length of the needle based on radius
		tickThickness = 0.05, // percent thickness of the axis major ticks based on radius
		minorTickThickness = 0.025, // percent thickness of the axis minor ticks based on radius

		tickPadding = 2, // Pixels between the inside lip of the arc and the ticks
		tickLabelGap = 14, // Pixels between the major tick and the major tick label

		minPercentOpen = 0.1, // The largest dial that can be drawn
		maxPercentOpen = 0.75, // The smallest dial that can be drawn

		// DOM elements
		cvWrapper = null,
		d3Container = null;

	gauge.init = function(options) {
		this._type = 'gauge';
		options = options || {};
		this._initDefaultOptions();
		this.setOptions(options);
		return this;
	};

	gauge._initDefaultOptions = function(options) {
		var defaults = {
			duration: 750, // The time it will take for the animation to finish
			percentOpen: minPercentOpen, // Defines the opening at the bottom of the gauge in percentage. The higher the percent, the smaller the arc. Accepts values from 0.1 to 0.75.
			showNeedle: true, // If true, a needle is shown and animates to the selected value. Otherwise, a fill arc will be drawn like a progress bar to the selected value.
			showAxis: true, // If true, draws an axis, otherwise the axis is hidden.
			ticks: 5, // The number of major ticks that will be drawn on the axis. Could be more or less than specified depending on how readable the increments are.
			tickSubdivisions: 0, // The number of minor ticks that will be drawn between major ticks

			format: "decimal", // formats the axis values and value label (values include: currency, percent, decimal)
			fillColor: "#3284d4", // Specifies the colors of the filled arc when showNeedle is false
			minValue: 0, // The minimum value of the gauge drawn on the left side
			maxValue: 10, // The maximum value of the gauge drawn on the right side
			colors: [ // An array of color objects which defines the range bands along the axis. There can be an unlimited amount of colors.
				{
					color: "#ff3400", // The color of the range band
					alpha: 1, // The opacity of the range band
					from: "0%", // A starting value that the arc will be drawn from. Can be a decimal or percent string.  If decimal, it calculates the percent from min and max values to draw the arc.
					to: "33%" // The final value that the arc will be drawn to.
				},
				{
					color: "#faca00",
					alpha: 1,
					from: "33%",
					to: "66%"
				},
				{
					color: "#68b672",
					alpha: 1,
					from: "66%",
					to: "100%"
				}
			],
			metric: "", // A label which will be drawn on the gauge to denote which metric the value represents.
			value: 0 // The selected value where the needle or filled arc will be drawn to.
		};

		this._margins = { top: 0, left: 0, right: 0, bottom: 0 };

		return Object.getPrototypeOf(gauge)._initDefaultOptions.call(this, defaults);
	};

	/**
	 * Called when the chart is ready for rendering.
	 */
	gauge.render = function() {
		Object.getPrototypeOf(gauge).render.call(this, arguments);

		this._determineSize();
		this._initScales();
		this._draw();
		return this;
	};

	/**
	 * Called when the chart is automatically resized. This will only fire if the autoResize option is true and the browser
	 * window size changes.
	 */
	gauge._onAutoResize = function() {
		this.render();
	};

	/**
	 * Calculate the radius of the gauge, the margins, and overall size based on width/height options or the size of the
	 * parent if no size options were specified.
	 */
	gauge._determineSize = function(options) {
		var opts = this._options,
			parent = opts.parent,
			width = opts.width ? opts.width : parent.offsetWidth, // Grab the parent's width if we don't have width set
			height = opts.height ? opts.height : parent.offsetHeight, // Grab the parent's height if we don't have height set
			percentOpen = Math.max(minPercentOpen, Math.min(maxPercentOpen, opts.percentOpen));

		if (opts.showNeedle) {
			this._margins.bottom = height * 0.05;
		}
		this._maxAngle = (1 - percentOpen) * 180;
		this._minAngle = (1 - percentOpen) * -180;

		width -= this._margins.left + this._margins.right;

		this._size = [width, height];
		this._radius = Math.min(width - this._margins.left - this._margins.right, height - this._margins.top - this._margins.bottom) / 2;
	};

	/**
	 * Initializes the scales used to position arcs, axis ticks, and the selected value indicator.
	 */
	gauge._initScales = function() {
		var opts = this._options;

		if (opts.minValue > opts.maxValue) {
			throw new Error("The minimum value is greater than the maximum value.");
		}
		this._scale = d3.scale.linear().domain([opts.minValue, opts.maxValue]).range([0, 1]); // Map domain to percent values
	};

	/**
	 * Queues up the drawing process for gauge.
	 */
	gauge._draw = function() {
		this._initSVG();
		this._drawTrack();
		this._drawAxis();
		this._drawSelectedIndicator();
		this._drawLabels();
	};

	/**
	 * Ensures the DOM elements and SVG container exist in the DOM tree or creates them if they don't.
	 */
	gauge._initSVG = function() {
		var opts = this._options,
			d3Parent = d3.select(opts.parent);

		cvWrapper = d3Parent.selectAll('.cv-wrapper.cv-gauge').data([0]);
		cvWrapper.enter()
			.append('div')
			.classed('cv-wrapper cv-gauge', true);
		cvWrapper
			.style('width', this._size[0] + 'px')
			.style('height', this._size[1] + 'px');

		var chartContainer = cvWrapper.selectAll('.chart-wrapper').data([0]);
		chartContainer.enter()
			.append('div')
			.classed('chart-wrapper', true);

		var svg = chartContainer.selectAll('svg').data([0]);
		svg.enter()
			.append('svg');

		d3Container = svg.selectAll('g').data([0]);
		d3Container.enter()
			.append('g');
		d3Container
			.attr('transform', 'translate(' + (this._size[0] - this._margins.left - this._margins.right) / 2 + ',' + (this._size[1] - this._margins.top - this._margins.bottom) / 2 + ')');
	};

	/**
	 * Draws the arcs that comprise the gauge.  The drawing logic uses the color objects in the colors array to determine
	 * the angles that each arc is drawn from and the color/alpha to be used on the arc.
	 */
	gauge._drawTrack = function() {
		var self = this,
			opts = this._options;

		var arc = d3.svg.arc()
			.innerRadius(this._radius * (1 - outerPadding - ringThickness))
			.outerRadius(this._radius * (1 - outerPadding))
			.startAngle(function(d, i) {
				var percentVal = dv.util.isPercentString(d.from) ? parseInt(d.from, 10) / 100 : self._scale(d.from),
					angle = (self._maxAngle - self._minAngle) * percentVal + self._minAngle;
				return deg2rad(angle);
			})
			.endAngle(function(d, i) {
				var percentVal = dv.util.isPercentString(d.to) ? parseInt(d.to, 10) / 100 : self._scale(d.to),
					angle = (self._maxAngle - self._minAngle) * percentVal + self._minAngle;
				return deg2rad(angle);
			});

		var arcContainer = d3Container.selectAll('.arc').data([0]);
		arcContainer.enter()
			.append('g')
				.classed('arc', true);

		var arcs = arcContainer.selectAll('path').data(opts.colors);
		arcs.enter()
			.append('path');
		arcs.exit()
			.remove();
		arcs
			.attr('fill', function(d, i) { return d.color; })
			.attr('opacity', function(d, i) { return d.hasOwnProperty('alpha') ? d.alpha : 1; })
			.attr('d', arc);
	};

	/**
	 * Draws the axis, or removes an already existing axis, depending on whether the showAxis option is true or false.
	 */
	gauge._drawAxis = function() {
		var self = this,
			opts = this._options,
			tickData = this._scale.ticks(opts.ticks),
			tickDraw = function(scale, minAngle, maxAngle, thickness) {
				return function(selection) {
					selection.attr('x1', 0)
						.attr('y1', tickPadding)
						.attr('x2', 0)
						.attr('y2', self._radius * thickness + tickPadding)
						.attr('transform', function(d) {
							var angle = val2deg(scale, d, minAngle, maxAngle);
							return 'rotate(' + val2deg(scale, d, minAngle, maxAngle) + ') translate(0,' + (self._radius * (ringThickness + outerPadding) - self._radius) + ')';
						});
				};
			};

		var axisContainer = d3Container.selectAll('.axis').data(opts.showAxis ? [0] : []);
		axisContainer.enter()
			.append('g')
				.classed('axis', true);
		axisContainer.exit()
			.remove();

		var ticks = axisContainer.selectAll('.tick').data(tickData);
		ticks.enter()
			.append('line')
				.classed('tick', true);
		ticks.exit()
			.remove();
		ticks.call(tickDraw(this._scale, this._minAngle, this._maxAngle, tickThickness));

		var tickSubdivisionData = axisSubdivide(this._scale, tickData, opts.tickSubdivisions);
		var tickSubdivisions = axisContainer.selectAll('.minor-tick').data(tickSubdivisionData);
		tickSubdivisions.enter()
			.append('line')
				.classed('minor-tick', true);
		tickSubdivisions.exit()
			.remove();
		tickSubdivisions.call(tickDraw(this._scale, self._minAngle, self._maxAngle, minorTickThickness));

		var labels = axisContainer.selectAll('.tick-label').data(tickData);
		labels.enter()
			.append('text')
				.classed('tick-label', true);
		labels.exit()
			.remove();
		labels
			.attr('transform', function(d) {
				var angle = val2deg(self._scale, d, self._minAngle, self._maxAngle),
					rads = val2rad(self._scale, d, self._minAngle, self._maxAngle),
					r = (self._radius - tickLabelGap) * (1 - ringThickness - outerPadding - tickThickness),
					x = Math.cos(rads) * r,
					y = Math.sin(rads) * r;

				if (angle < -10 && angle > -170) {
					x -= 3; // Nudge these axis labels a little closer to their ticks
				}
				if (angle > 10 && angle < 170) {
					x += 3; /// Nudge these axis labels a little closer to their ticks
				}

				return 'translate(' + x + ',' + y + ')';
			})
			.attr('text-anchor', function(d) {
				var angle = val2deg(self._scale, d, self._minAngle, self._maxAngle);
				if (angle > -10 && angle < 10) {
					return 'middle';
				}
				if (angle < 0) {
					return null;
				}
				return 'end';
			})
			.attr('dy', '.35em')
			.style('font-size', clamp(self._radius * 0.05, 8, 14) + 'px')
			.text(function(d) {
				return self._formatNumber(opts.format, d);
			});
	};

	/**
	 * Draws or tears down the needle or filled arc depending on whether the showNeedle option is true or false.
	 */
	gauge._drawSelectedIndicator = function() {
		var opts = this._options;
		this._drawNeedle(opts.showNeedle ? [opts.value] : []);
		this._drawProgressFill(opts.showNeedle ? [] : [opts.value]);
	};

	/**
	 * Draws or tears down the needle.
	 */
	gauge._drawNeedle = function(values) {
		var self = this,
			opts = this._options,
			cr = this._radius * needleThickness / 2, // radius of the inner needle circle
			needleLength = this._radius * needleLengthRatio;

		var needle = d3Container.selectAll('.needle').data(values);
		needle.enter()
			.append('path')
				.classed('needle', true)
				.attr('transform', 'rotate(' + self._minAngle + ')');
		needle.exit()
			.remove();
		needle // SVG for the needle
			.attr('d', 'M' + (cr / 2) + '-' + cr +
				'L0-' + needleLength +
				'L-' + (cr / 2) + '-' + cr +
				'C-' + (cr * 0.8257) + '-' + (cr * 0.8212) + '-' + (cr * 1.035) + '-' + (cr / 2 * 0.9448) + '-' + (cr * 1.035) + '-1' +
				'C-' + (cr * 1.035) + ',' + (cr / 2 * 0.9078) + '-' + (cr * 0.5796) + ',' + (cr * 0.9314) + ',0,' + (cr * 0.9314) +
				'S' + (cr * 1.035) + ',' + (cr / 2 * 0.9078) + ',' + (cr * 1.035) + '-1' +
				'C' + (cr * 1.035) + '-' + (cr / 2 * 0.9448) + ',' + (cr * 0.8257) + '-' + (cr * 0.8212) + ',' + (cr / 2) + '-' + cr + 'z')
			.transition()
			.duration(opts.duration)
			.ease('cubic-in-out')
				.attrTween('transform', function(d) {
					var el = this,
						val = Math.min(opts.maxValue, Math.max(opts.minValue, d)),
						angle = val2deg(self._scale, val, self._minAngle, self._maxAngle),
						previousAngle = this.__previousD__ === undefined ? self._minAngle : this.__previousD__,
						interpolate = d3.interpolate(previousAngle, angle);

					return function(t) {
						el.__previousD__ = interpolate(t);
						return 'rotate(' + el.__previousD__ + ')';
					};
				});
	};

	/**
	 * Draws or tears down the progress fill.
	 */
	gauge._drawProgressFill = function(values) {
		var self = this,
			opts = this._options,
			arc = d3.svg.arc()
				.innerRadius(this._radius * (1 - outerPadding - ringThickness))
				.outerRadius(this._radius * (1 - outerPadding))
				.startAngle(deg2rad(self._minAngle))
				.endAngle(function(d) {
					return deg2rad(val2deg(self._scale, d, self._minAngle, self._maxAngle));
				});

		var progress = d3Container.selectAll('.progress').data(values);
		progress.enter()
			.append('path')
				.classed('progress', true);
		progress.exit()
			.remove();
		progress
			.attr('fill', opts.fillColor)
			.transition()
			.duration(opts.duration)
				.attrTween('d', function(d) {
					var el = this,
						val = Math.min(opts.maxValue, Math.max(opts.minValue, d)),
						previousVal = this.__previousD__ === undefined ? opts.minValue : this.__previousD__,
						interpolate = d3.interpolate(previousVal, val);

					return function(t) {
						el.__previousD__ = interpolate(t);
						return arc(el.__previousD__);
					};
				});
	};

	/**
	 * Draws the value and metric labels
	 */
	gauge._drawLabels = function() {
		var self = this,
			opts = this._options,
			valueData = opts.value === undefined ? [] : [opts.value],
			metricData = opts.metric === undefined ? [] : [opts.metric],
			minRads = val2rad(this._scale, opts.minValue, this._minAngle, this._maxAngle),
			maxRads = val2rad(this._scale, opts.maxValue, this._minAngle, this._maxAngle),
			radiusToInnerArc = (this._radius) * (1 - ringThickness - outerPadding),
			radiusToInsideArc = (this._radius - tickLabelGap) * (1 - ringThickness - outerPadding - tickThickness),
			xLeftOpening = Math.cos(minRads) * radiusToInsideArc + this._radius,
			xRightOpening = Math.cos(maxRads) * radiusToInsideArc + this._radius,
			yInnerOpening = Math.sin(minRads) * radiusToInnerArc + this._radius;

		var labelContainer = cvWrapper.selectAll('.label-container').data([0]);
		labelContainer.enter()
			.append('div')
				.classed('label-container', true);
		labelContainer
			.style('left', this._size[0] / 2 - this._radius + "px");

		var metricLabel = labelContainer.selectAll('.label-title').data(metricData);
		metricLabel.enter()
			.append('span')
				.classed('label-title', true);
		metricLabel.exit()
			.remove();
		metricLabel
			.style('font-size', clamp(this._radius * 0.1, 11, 18) + 'px')
			.classed('multiline-ellipsis', !opts.showNeedle)
			.text(String);

		var valueLabel = labelContainer.selectAll('.label-number').data(valueData),
			valueLabelYPos = Math.max(yInnerOpening, this._radius * 1.1);
		valueLabel.enter()
			.append('span')
				.classed('label-number', true)
				.style('line-height', this._radius * ringThickness + 'px');
		valueLabel.exit()
			.remove();
		valueLabel
			.style('left', xLeftOpening + 'px')
			.style('width', xRightOpening - xLeftOpening + 'px')
			.style('font-size', this._radius * ringThickness + 'px')
			.text(function(d) {
				return self._formatNumber(opts.format, d);
			});

		if (opts.showNeedle) {
			// Metric label shows under the chart if there is a needle.
			metricLabel
				.style('top', valueLabelYPos + this._radius * 0.2 + 'px')
				.style('left', 0)
				.style('width', this._radius * 2 + 'px');

			valueLabel
				.style('top', valueLabelYPos + 'px');
		} else {
			// Metric label shows in the center of the gauge if the filled arc is used.
			var metricLblHeight = clamp(this._radius * 0.1, 11, 20) * 2.3,
				metricLblYPos = this._radius * (1 - outerPadding);

			metricLabel
				.style('top', metricLblYPos + 'px')
				.style('left', this._radius * (ringThickness + outerPadding + tickThickness + 0.3) + 'px')
				.style('width', this._radius * (1 - ringThickness - outerPadding - tickThickness - 0.3) * 2 + 'px')
				.style('height', metricLblHeight + 'px');

			valueLabel
				.style('top', Math.max(metricLblYPos + metricLblHeight, valueLabelYPos) + 'px');
		}
	};

	/**
	 * Converts a raw value into radians
	 */
	function val2rad(scale, val, minAngle, maxAngle) {
		return deg2rad(val2deg(scale, val, minAngle, maxAngle)) - deg2rad(minAngle) - deg2rad(maxAngle) - Math.PI / 2;
	}

	/**
	 * Converts a raw value into an angle in degrees
	 */
	function val2deg(scale, val, minAngle, maxAngle) {
		return minAngle + (scale(val) * (maxAngle - minAngle));
	}

	/**
	 * Converts a angle into radians
	 */
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}

	/**
	 * Enforces a min/max on an arbitrary value
	 */
	function clamp(val, min, max) {
		return Math.max(min, Math.min(max, val));
	}

	/**
	 * Returns an array of axis minor tick raw values used in the axis
	 *
	 * @param scale The D3 scale used to generate minor ticks
	 * @param ticks An array of major ticks that will already be drawn
	 * @param m The number of minor ticks that should be drawn between each major tick
	 */
	function axisSubdivide(scale, ticks, m) {
		var subticks = [];
		if (m && ticks.length > 1) {
			var extent = scaleExtent(scale.domain()),
				i = -1,
				n = ticks.length,
				d = (ticks[1] - ticks[0]) / ++m,
				j,
				v;
			while (++i < n) {
				for (j = m; --j > 0;) {
					if ((v = +ticks[i] - j * d) >= extent[0]) {
						subticks.push(v);
					}
				}
			}
			for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1];) {
				subticks.push(v);
			}
		}
		return subticks;
	}

	/**
	 * Returns a domain array of two values where the first value is always less than the second value.
	 */
	function scaleExtent(domain) {
		var start = domain[0], stop = domain[domain.length - 1];
		return start < stop ? [start, stop] : [stop, start];
	}

	global.cloudViz.gauge = cloudViz.util.createConstructor(gauge);
}(this));
/**
 * TreeMap
 *
 * A treemap recursively subdivides area into rectangles which reveals the size of any node quickly.  The size is linearly proportional to values contained
 * in a size mapping. The fill mapping can be used to map a continuous sequential color scale as the fill for each generated rectangle.
 */
(function (global) {
	'use strict';

	var cloudViz = global.cloudViz || {},
		core = cloudViz.core || {},
		dv = global.dv || {},
		d3 = global.d3 || {},
		treemap = Object.create(core);

	// Dimension variables
	var width = 0,
		height = 0,
		top = 0,

		headingHeight = 25,
		leftMargin = 1,
		rightMargin = 1,
		bottomMargin = 3,

		rgbaRegex = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?|\.[0-9]+)\s*\)/,
		rgbRegex = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,

	// scales
		x = d3.scale.linear(),
		y = d3.scale.linear(),
		color = d3.scale.ordinal(),

	// DOM elements
		chartContainer,
		nodeContainer,

		firstLaunch = true,
		layout;

	treemap.init = function (options) {
		this._type = 'treemap';
		options = options || {};
		this._initDefaultOptions();
		this.setOptions(options);
		return this;
	};

	treemap._initDefaultOptions = function (options) {
		var defaults = {
			colors: [ // colors to use when displaying charts
				'#8cc350', // green
				'#5a6eaa', // iris
				'#d755a5', // fuchsia
				'#1ebed7', // cyan
				'#f0a01e', // tangerine
				'#9b8ce6', // periwinkle
				'#3cb5a0', // sea foam
				'#3287d2', // blue
				'#f0557d', // magenta
				'#c3d250', // chartreuse
				'#eb782d', // orange
				'#78b4f5', // sky blue
				'#5faf69', // kelly green
				'#aa5fa5', // plum
				'#fa5a50', // red
				'#f5c841' // yellow
			],
			layout: 'squarify', // The treemap layout style. 'squarify' is the default treemap style, 'slice' is a single row with multiple columns, 'dice' is a single
			duration: 750, // The length of each transition

			tooltipContent: defaultTooltipContent
		};

		return Object.getPrototypeOf(treemap)._initDefaultOptions.call(this, defaults);
	};

	treemap.reset = function () {

	};

	treemap._preRender = function () {
		this._determineSize(this._options.data);
		this._configureScales(this._options.data);
		this._configureLayout();
	};

	/**
	 * Called by core's render function after preRender and before postRender.
	 */
	treemap._render = function () {
		this._initContainer();
		this._draw(this._options.data);
		firstLaunch = false;
		return this;
	};

	treemap._postRender = function () {

	};

	treemap._determineSize = function (data) {
		var opts = this._options,
			parent = opts.parent;

		width = dv.util.getPercentValue(opts.width, parent.offsetWidth);
		height = dv.util.getPercentValue(opts.height, parent.offsetHeight);
	};

	treemap._configureScales = function (data) {
		var opts = this._options;

		color
			.domain(data.map(function (d) {
				return d.name;
			}))
			.range(opts.colors);

		var xDomain = data.hasOwnProperty('dx') ? [data.x, data.x + data.dx] : [0, width],
			yDomain = data.hasOwnProperty('dy') ? [data.y, data.y + data.dy] : [0, height];

		x.domain(xDomain).range([1, width - 2]);
		y.domain(yDomain).range([1, height - 2]);
	};

	treemap._configureLayout = function () {
		layout = d3.layout.treemap()
			.sticky(true)
			.value(function (d) {
				return d.value || 0;
			})
			.sort(function (a, b) {
				return a.value - b.value;
			})
			.mode(this._options.layout)
			.round(false);
	};

	treemap._initContainer = function () {
		var opts = this._options;

		var container = d3.select(opts.parent).selectAll('.cv-wrapper.cv-treemap').data([0]);
		container.enter()
			.append('div')
			.classed('cv-wrapper cv-treemap', true);

		chartContainer = container.selectAll('.chart-wrapper').data([0]);
		chartContainer.enter()
			.append('div')
			.classed('chart-wrapper', true)
			.style('position', 'relative');
		chartContainer
			.style('width', width + 'px')
			.style('height', height + 'px');

		nodeContainer = chartContainer.selectAll('.node-container').data([0]);
		nodeContainer.enter()
			.append('div')
			.classed('node-container', true)
			.style('overflow', 'hidden');
		nodeContainer
			.style('width', width + 'px')
			.style('height', (height) + 'px');
	};

	treemap._draw = function (data) {
		var self = this,
			opts = this._options,
			layoutData = {children: this._options.data},
			nodes = layout
				.size([width, height])
				.padding([headingHeight, leftMargin, bottomMargin, rightMargin])
				.nodes(layoutData),
			children = nodes.filter(function (d) {
				return !d.children;
			}),
			parents = nodes.filter(function (d) {
				return d.parent && d.children;
			}),
			childrenSelected;

		var node = nodeContainer.selectAll('.cv-node').data(nodes);
		var newNodes = node.enter()
			.append('div')
			.classed('cv-node', true)
			.on('click', function (d, i) {
				// Add click events to items within the treemap main chart area (dept > 0)
				if (d.depth > 0) {
					var el = d3.select(this),
						selectedNodes = [];
					if (d.children) {// If click was on a container select all of its children
						selectedNodes = nodeContainer.selectAll('.second-level').filter(function (cn) {
							return (d.children.indexOf(cn) >= 0);
						});
						selectedNodes[0].push(this); // Add the parent header to the selection
						var previouslySelectedNodes = nodeContainer.selectAll('.cv-node.selected');
						var newSelectedNodes = [];
						if (previouslySelectedNodes[0].indexOf(this) >= 0 ){
							newSelectedNodes = previouslySelectedNodes[0].filter(function (prevNode){
								var found = (selectedNodes[0].indexOf(prevNode) >= 0);
								return !found;
							});
						} else {
							newSelectedNodes = selectedNodes[0].concat(previouslySelectedNodes[0]);
						}
						selectedNodes[0] = newSelectedNodes;

						self._selectNodes(selectedNodes);
					} else {
						selectedNodes = nodeContainer.selectAll('.cv-node.selected');
						var thisIdx = selectedNodes[0].indexOf(this),
							parent;

						// if it was alredy selected unselect it
						if (thisIdx >= 0) {
							selectedNodes[0].splice(thisIdx, 1);
							// when the parent and all its children are selected and we unselect
							// any of the children we need to unselect the parent too
							parent = self._getParentNode(this);
							var parentSelectedIdx = selectedNodes[0].indexOf(parent);
							if (parentSelectedIdx >= 0){
								childrenSelected = 0;
								parent.__data__.children.forEach(function (child){
									selectedNodes.each(function (selectedChild) {
										if (selectedChild == child){
											childrenSelected++;
										}
									});
								});
								if (parent.__data__.children.length-1 === childrenSelected){
									selectedNodes[0].splice(parentSelectedIdx, 1);
								}
							}
						} else {
							// if it is not selected add it
							selectedNodes[0].push(this);
							// If all the children in a group have been selected we need
							// to select also the parent
							parent = self._getParentNode(this);
							childrenSelected = 0;
							parent.__data__.children.forEach(function (child){
								selectedNodes.each(function (selectedChild) {
									if (selectedChild == child){
										childrenSelected++;
									}
								});
							});
							if (parent.__data__.children.length === childrenSelected){
								selectedNodes[0].push(parent);
							}

						}
						self._selectNodes(selectedNodes);
					}
					if (self._eventMap['click']) {
						self._eventMap['click'].call(this, d, i, d3.event);
					}
				}
			})
			.on('mouseover', function (d, i) {
				if (!d.children) {
					var el = d3.select(this),
						bounds = {
							x: d.x + d.dx / 4,
							y: d.y + d.dy / 2,
							width: d.dx / 2,
							height: d.dy / 2
						},
						container = {
							x: 0,
							y: 0,
							width: chartContainer.node().getBoundingClientRect().width,
							height: chartContainer.node().getBoundingClientRect().height
						},
						content = null;
					el.classed('hovered', true);
					// Prepare content
					content = opts.tooltipContent.call(this, d, i);
					// show tooltip
					dv.showTooltip(
						bounds,
						container,
						content,
						'top',
						5,
						chartContainer
					);
					// Fire events
					if (self._eventMap['mouseover']) {
						self._eventMap['mouseover'].call(this, d, i, d3.event);
					}
				}
			})
			.on('mouseout', function (d, i) {
				if (!d.children) {
					var el = d3.select(this);
					el.classed('hovered', false);
					dv.removeTooltip(chartContainer);
					if (self._eventMap['mouseout']) {
						self._eventMap['mouseout'].call(this, d, i, d3.event);
					}
				}
			});
		newNodes.append('div');
		newNodes
			.call(position)
			.call(paint);
		node.exit().remove();
		node.classed('main-level', function (d) {
			return d.depth === layoutData.depth + 1;
		})
			.classed('second-level', function (d) {
				return d.depth === layoutData.depth + 2;
			})
			.call(paint)
			.call(position);
		node.select('div')
			.text(function (d) {
				var defaultLabel = d.hasOwnProperty('name') && d.parent === layoutData ? d.name : null;
				var label = d.hasOwnProperty('label') && d.parent === layoutData ? d.label : null;
				return label || defaultLabel;
			})
			.style('opacity', function (d) {
				return (d.dx < 50 || d.dy < 25) ? 0 : 1;
			});
	};


	treemap._selectNodes = function (nodes) {
		var selectedNodes = nodeContainer.selectAll('.cv-node.selected');
		selectedNodes.classed('selected', false);
		nodes.classed('selected', true);
	};

	treemap._getParentNode = function(node){
		var parentNode;
		var selectedNodes = d3.select(this._options.parent).selectAll('.main-level');
		selectedNodes[0].forEach(function(aParent){
			if (aParent.__data__.children.indexOf(node.__data__) >= 0){
				parentNode = aParent;
			}
		});
		return parentNode;
	};

	/**
	 * highlights the nodes matching the given selector function
	 *
	 * @param selector expression
	 * @param selectorFn
	 * @returns {treemap}
	 */
	treemap.setSelected = function (selectorFn) {
		var self = this;
		// set current selection
		var selectedNodes = d3.select(this._options.parent).selectAll('.second-level').filter(selectorFn);

		// For each node in the selection check if the parent node needs to be selected too
		selectedNodes[0].forEach(function (node){
			var parent = self._getParentNode(node),
				childrenSelected = 0;
			if (parent){
				parent.__data__.children.forEach(function (child){
					selectedNodes.each(function (selectedChild) {
						if (selectedChild == child){
							childrenSelected++;
						}
					});
				});
				if (parent.__data__.children.length === childrenSelected){
					selectedNodes[0].push(parent);
				}
			}
		});


		self._selectNodes(selectedNodes);
		return self;
	};

	/**
	 * Returns the selected nodes
	 *
	 * @returns {Array}
	 */
	treemap.getSelected = function () {
		var selectedNodes = [];
		var selected = nodeContainer.selectAll('.second-level.cv-node.selected');
		if (selected) {
			selected[0].forEach(function (node) {
				selectedNodes.push(node.__data__);
			});
		}
		return selectedNodes;
	};

	/**
	 * Creates the default content for the tooltip
	 *
	 * @param d
	 * @returns {string}
	 */
	function defaultTooltipContent(d) {
		return "<span class='series-name'>" + d.parent.name + "</span>" +
			"<span class='metric-value'>" + d.value + "</span>" +
			"<span class='metric-name'>" + d.name + "</span>";
	}


	/**
	 * Places the given selected node in position with in the treemap
	 *
	 * @param selection
	 */
	function position(selection) {
		var padding = function (d) {
			if (d.depth === 1) {
				return 3;
			}
			if (d.depth === 2) {
				return 1;
			}
			return 0;
		};

		selection
			.style('left', function (d) {
				return (x(d.x) + 1) + 'px';
			})
			.style('top', function (d) {
				return (y(d.y) + 1) + 'px';
			})
			.style('width', function (d) {
				return (x(d.x + d.dx) - x(d.x) - 2) + 'px';
			})
			.style('height', function (d) {
				// The default css height style for section titles will be used.
				if (d.children && d.parent) {
					return null;
				}
				return (y(d.y + d.dy) - y(d.y) - 2) + 'px';
			});
	}

	/**
	 * Colors the given node with the correct color
	 *
	 * @param selection
	 */
	function paint(selection) {
		selection
			.style('background-color', function (d) {
				if (d.children || !d.parent) {
					return null;
				}
				return color(d.parent.name);
			});
	}

	global.cloudViz.treemap = cloudViz.util.createConstructor(treemap);
}(this));

/**
 * Data adapters are intended to process and interpret data in a way that is specific to a particular data format.
 * They then expose translated information to be used during the render process. Data adapters are created
 * as a convenience to consumers of CloudViz so that multiple consumers aren't forced to code the same translation
 * layer between their data format and the format that CloudViz expects.
 *
 * The "standard" data adapter does very little since it assumes the data is already in a format consumable by
 * CloudViz.
 */

(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		dv = global.dv,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard');

	var adapter = {};
	adapter._isDataValid = null;

	/**
	 * Intended to be called prior to rendering a chart. This function processes and interprets options in a way
	 * that is specific to a particular data format and exposes translated information to be used during the render
	 * process.
	 *
	 * @param {object} options All user-defined + default options. The keys are the option names while the values
	 * are the option values.
	 * @param {object} changedOptions All user-defined + default options that have been changed since the previous
	 * render. The keys are the option names while the values are the option values.
	 */
	adapter.process = function(options, changedOptions) {
		this._options = options;

		// We deep extend the definition to a new object so that when the consumer sets specific
		// l10n options to override portions of the locale definition it doesn't modify the original
		// definition object which would affect other charts rendered later.
		this.l10n = cloudViz.util.deepExtend({}, cloudViz.localeDefinition(options.locale), options.l10n || {});

		// only process if data and/or mappings is changed
		if (!('data' in changedOptions) && !('mappings' in changedOptions)) { return; }
		// and the data/mappings are valid
		if (!this._validateData(options.data, options.mappings)) { return; }

		this._processOptions(options, changedOptions);
	};


	/**
	 * Called by process after common setup is done. Intended to be overwritten by subclasses.
	 *
	 * @param {object} options All user-defined + default options. The keys are the option names while the values
	 * are the option values.
	 * @param {object} changedOptions All user-defined + default options that have been changed since the previous
	 * render. The keys are the option names while the values are the option values.
	 * @returns {boolean} true to allow processing to occur
	 */
	adapter._processOptions = function(options, changedOptions) {};

	/**
	 * Determines if the x data is overtime or not. X data is overtime if it consists of javascript Date objects
	 * @param  {x:[]} data A data object of tuples with at least an x property with an array.
	 * @return {boolean} True if overtime, false otherwise
	 */
	adapter._determineOvertime = function(data) {
		var mappings = this.mappings(),
			dates = data[mappings['x']];

		if (!dates || !dates.length) { return false; }
		return dv.util.isDate(dates[0]);
	};

	/**
	 * Looks at the data points time range and determines the time granularity
	 * Will return '*' if its unable to determine a granularity
	 * @param {x:[]} data A data object of tuples with at least an x property with an array.
	 * @returns {string} - 'hour', 'day', 'week', 'month', 'quarter', 'year', '*'
	 */
	adapter._calculateDateGranularity = function(data) {
		var mappings = this.mappings(),
			dates = data[mappings['x']];
		if (!dates || !dates.length) { return '*'; }
		// Simple algorithm will be to determine the min/max and number of points to determine an avg range
		var min = Math.min.apply(Math, dates), max = Math.max.apply(Math, dates),
			range = (max - min) / 1000, step = range / dates.length;
		return this.getTimeGranularity(step).gran;
	};

	/**
	 * Passed a step value in seconds will determine the correct granularity
	 * If total is true, step is the total so determine it differently
	 * @returns {string} - 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year', '*'
	 */
	adapter.getTimeGranularity = function(step, total) {
		var gran = 'second', divisor = 1;
		if (!step) { return { gran : gran, divisor : divisor }; }
		if (total) {
			// Total means that we are displaying the entire value rather than in steps
			// So we go from largest to smallest
			if (step >= (divisor = 60 * 60 * 24 * 365)) { gran = 'year'; }
			else if (step >= (divisor = 60 * 60 * 24 * 31)) { gran = 'month'; }
			else if (step >= (divisor = 60 * 60 * 24 * 7)) { gran = 'week'; }
			else if (step >= (divisor = 60 * 60 * 24)) { gran = 'day'; }
			else if (step >= (divisor = 60 * 60)) { gran = 'hour'; }
			else if (step >= (divisor = 60)) { gran = 'minute'; }
			else {
				gran = 'second';
				divisor = 1;
			}
		} else {
			// Step means the time has been divided into units and we want to show the number
			// of those units for the total amount of time
			if (step <= (divisor = 1)) { gran = 'second'; } // second
			else if (step <= (divisor = 60)) { gran = 'minute'; } // minute
			else if (step <= (divisor = 60 * 60)) { gran = 'hour'; } // hour
			else if (step <= (divisor = 60 * 60 * 24)) { gran = 'day'; } // day
			else if (step <= (divisor = 60 * 60 * 24 * 7)) { gran = 'week'; } // weekly
			else if (step <= (divisor = 60 * 60 * 24 * 31)) { gran = 'month'; } // monthly
			else { // yearly
				gran = 'year';
				divisor = 60 * 60 * 24 * 365;
			}
		}
		return { gran : gran, divisor : divisor };
	};

	adapter._getYTitleFromLabels = function(labels) {
		// If we only have 1 type of label, we should label the y axis.  This is particularly
		// important in the case of interactive legends which don't show the metrics within tabs
		// because there is only one metric.  In this case there would be no way to know what
		// metric is represented by the y axis.  The y axis title is the only way to get that
		// info.
		var uniqLabels = dv.util.uniq(labels);
		if (uniqLabels && uniqLabels.length === 1) {
			return uniqLabels[0];
		}
		return null;
	};

	/**
	 * An object of data tuples. The properties on the data object are used to map visual properties on the chart.
	 *
	 * <pre><code>
	 *     {
	 *         foo: [1, 2, 3, 4, 5],
     *         bar: [10, 8, 7, 15, 20]
	 *     }
	 * </code></pre>
	 *
	 * @returns {object}
	 */
	adapter.data = function() {
		return this._options.data;
	};

	/**
	 * An object mapping tuples from the data object to visual aesthetics on the chart.
	 *
	 * <pre><code>
	 *     {
	 *         x: 'foo'
     *         y: 'bar'
	 *     }
	 * </code></pre>
	 *
	 * @returns {object}
	 */
	adapter.mappings = function() {
		return this._options.mappings;
	};

	/**
-    * An object defining how number values should be formatted for each axis. Possible values include currency, percent,
-    * decimal, and time. Since y supports multiple axes, an array can be used instead of a string.  If a string is provided,
	 * that y format is applied to all series.  If an array is provided for y, each format maps to each series.
-    *
-    * <pre><code>
-    *     {
-    *         x: 'percent',
-    *         y: [ 'currency', 'decimal' ],
	 *         size: 'time'
-    *     }
-    * </code></pre>
-    *
-    * @returns {array}
-    */
	adapter.formats = function() {
		return this._options.formats;
	};

	/**
	 * The user-friendly name of the metric mapped to the x aesthetic.
	 * @returns {string}
	 */
	adapter.xAxisTitle = function() {
		return this._options.xAxisTitle || null;
	};

	/**
	 * The user-friendly name of the metric mapped to the y aesthetic.
	 * @returns {string}
	 */
	adapter.yAxisTitle = function() {
		return this._options.yAxisTitle || null;
	};

	/**
	 * The date granularity if the x data is time-based. Possible values are year, quarter, month, week, day, and hour.
	 * @return {string}
	 */
	adapter.dateGranularity = function() {
		return this._processedOptions.dateGranularity;
	};

	/**
	 * Whether the data is sufficiently valid to be properly rendered.
	 * @returns {boolean}
	 */
	adapter.isDataValid = function() {
		return this._validateData(this._options.data, this._options.mappings);
	};

	/**
	 * Determines if the data object exists and that it has at least one non-empty array of data.
	 * @param {object} data
	 * @param {object} mappings
	 * @returns {boolean}
	 * @private
	 */
	adapter._validateData = function(data, mappings) {
		if (!data) { return false; }
		for (var key in data) {
			if (data[key].length) { return true; }
		}
		return false;
	};

	/**
	 * The "blueprint" of the adapter. This can be used as a prototype object that other adapters can extend. This
	 * is neither intended to be used directly nor instantiated using the "new" keyword.
	 * @type {object}
	 */
	standardAdapters.baseObj = adapter;

	/**
	 * The constructor of the adapter. This is intended to be called in order to instantiate a new adapter object.
	 * Any arguments passed to the function will be passed to the adapter's init() function if one exists.
	 * @type {function}
	 */
	standardAdapters.base = cloudViz.util.createConstructor(adapter);
}(this));
/*global dv*/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj);

	/**
	 * @see base#_processOptions
	 */
	adapter._processOptions = function(options, changedOptions) {
		var processedOptions = this._processedOptions = Object.create(options);

		// We can't simple get the options.data or options.mappings here
		// We need to call to get it in case this class is extended and the data/mappings were changed
		var data = this.data(), mappings = this.mappings();
		this._uniqueFillValues = this._processUniqueFillValues(data, mappings);
		this._uniqueFillExtents = this._processUniqueFillExtents(data, mappings, this._uniqueFillValues);

		// If isOvertime has been set, it was done by a more specific data adapter and doesn't need to be
		// done again.
		if (processedOptions.isOvertime == null) {
			processedOptions.isOvertime = this._determineOvertime(data);

			if (processedOptions.isOvertime) {
				processedOptions.dateGranularity = processedOptions.dateGranularity || this._calculateDateGranularity(data);
			}
		}

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	/**
	 * Whether the data is time-based.
	 * @returns {boolean}
	 */
	adapter.isOvertime = function() {
		return this._processedOptions.isOvertime;
	};

	adapter.uniqueFillValues = function() {
		return this._uniqueFillValues || [];
	};

	adapter.uniqueFillExtents = function() {
		return this._uniqueFillExtents;
	};

	// Should only be used when dual y axis is set and the first and second series are different scales
	adapter.getUniqueFillExtent = function(scaleIndex) {
		var uniqueFillValue = this._uniqueFillValues[scaleIndex];
		if (uniqueFillValue) {
			return this._uniqueFillExtents[uniqueFillValue];
		}
		return null;
	};

	// Returns the extent of all the y data within a given series specified by fill.
	adapter.getUniqueFillExtentByFill = function(fill) {
		return this._uniqueFillExtents[fill];
	};

	/**
	 * Retrieves unique values from the tuple mapped to the fill aesthetic.
	 * @param {object} data
	 * @param {object} mappings
	 * @returns {array}
	 * @private
	 */
	adapter._processUniqueFillValues = function(data, mappings) {
		var tuple = data[mappings['series']];
		return tuple ? dv.util.uniq(tuple) : [];
	};

	/**
	 * Processes all the min/max y values of each series.
	 * @param {object} data
	 * @param {object} mappings
	 * @returns {object}
	 */
	adapter._processUniqueFillExtents = function(data, mappings, uniqueFillValues) {
		var fillTuple = data[mappings['series']],
			yTuple = data[mappings['y']],
			extents = {};

		yTuple.map(function(d, i) {
			var fillValue = fillTuple[i];
			if (!isFinite(d) || d === null) { return; } // ignore undefined/null
			if (!extents[fillValue]) {
				extents[fillValue] = [d, d];
			}
			extents[fillValue][0] = Math.min(d, extents[fillValue][0]);
			extents[fillValue][1] = Math.max(d, extents[fillValue][1]);
		});

		return extents;
	};

	standardAdapters.barObj = adapter;
	standardAdapters.bar = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj),
		d3 = global.d3 || {};

	adapter._processOptions = function(options, changedOptions) {
		Object.getPrototypeOf(adapter)._processOptions.apply(this, arguments);
	};

	adapter._validateData = function(data, mappings) {
		if (!data) { return false; }
		return true;
	};

	adapter.data = function() {
		return this._options.data;
	};

	adapter.metric = function() {
		return this._options.metric;
	};

	adapter.format = function() {
		return this._options.format;
	};

	standardAdapters.choroplethObj = adapter;
	standardAdapters.choropleth = cloudViz.util.createConstructor(adapter);
}(this));
/*global dv*/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		// Donut inherits from standard bar so we get the unique fill methods
		// Since its basically a polar bar chart, this works nicely
		adapter = Object.create(standardAdapters.barObj),
		// Maximum number of facets (individual donuts) that we will render
		maxFacets = 3;

	/**
	 * @see base#_processOptions
	 */
	adapter._processOptions = function(options, changedOptions) {
		this._processCategories(options);
		Object.getPrototypeOf(adapter)._processOptions.call(this, this._processedOptions, changedOptions);
	};

	/**
	 * Manipulates the data in order to:
	 * 1: Sort the data per facet in descending value
	 * 2: Limit the number of slices in a facet to maxSlices
	 * 3: Limit the number of facets to maxFacets
	 * This is done by converting the parallel arrays to a single array of objects, sorting
	 * and then converting back to parallel arrays
	 * For #3:
	 * If the number of facets > maxSlices, collapse (maxSlices-1)+ into single 'other' category
	 * @private
	 **/
	adapter._processCategories = function(options) {
		var processedOptions = Object.create(options),
			data = Object.create(options.data), mappings = options.mappings,
			valKey = mappings['y'], catKey = mappings['x'],
			facetKey = mappings['series'],
			facetLabelKey = mappings['seriesLabel'] || facetKey,
			collection = [], i, ii = data[valKey].length, k,
			facets = [], facetLabels = [], facetsOrder = {}, value;

		// Compile the parallel arrays into a single array
		// Also populates the labelOrder for us in sorting later
		for (i=0; i<ii; ++i) {
			collection[i] = {};
			for (k in data) {
				value = data[k][i];
				if (k === facetKey) {
					if (facets.length) {
						if (value !== facets[facets.length-1]) {
							if (facets.length === this.maxFacets) {
								// total facets already
								ii--;
								i--;
								collection.pop();
								break; // exit the k for loop
							}
							facets[facets.length] = value;
							facetLabels[facetLabels.length] = data[facetLabelKey][i];
							facetsOrder[value] = facets.length;
						}
					} else {
						facets = [value];
						facetLabels = [data[facetLabelKey][i]];
						facetsOrder[value] = facets.length;
					}
				}
				collection[i][k] = value;
			}
		}
		// Sort the array by the key
		this.numFacets = facets.length;
		collection.sort(function(a, b) {
			if (a[facetKey] === b[facetKey]) {
				return b[valKey] - a[valKey];
			}
			return facetsOrder[a[facetKey]] - facetsOrder[b[facetKey]];
		});
		// reset data arrays
		for (k in data) {
			data[k] = [];
		}
		data['cvdonutorder'] = [];

		// Break out again into parallel arrays and compile extra slices into 'other'
		var facetCount = 0, lastFacet, facet, max = this._options.maxSlices;
		this.otherIncluded = false;
		for (i=0, ii=collection.length; i<ii; ++i) {
			// Count along a facet and collapse if we get above maxSlices
			facet = collection[i][facetKey];
			if (facet !== lastFacet) {
				facetCount = 0;
				lastFacet = facet;
			}
			if (facetCount == max - 1 && i+1 < ii && collection[i+1][facetKey] === facet) {
				// look ahead and see if the next item is the same facet
				// if so, we need to start combining, so create the Other category
				for (k in data) {
					if (!data[k]) { data[k] = []; }
					data[k][i] = collection[i][k];
				}
				this.otherIncluded = true;
				data[catKey][i] = this.l10n.labels.core.other;
				++facetCount;
				data['cvdonutorder'][i] = i;
				continue;
			}
			if (facetCount >= max) { // 'other' is previous, append
				// update value
				data[valKey][i-1] += collection[i][valKey];
				// remove and set i back
				collection.splice(i, 1);
				ii = collection.length;
				--i;
				++facetCount;
				continue;
			}
			++facetCount;

			for (k in data) {
				data[k][i] = collection[i][k];
			}
			// this is needed to set the grouping so DV correctly orders the sorted values
			data['cvdonutorder'][i] = i;
		}

		// Update the yAxisTitle
		// Get the array values string names of the facet groups
		processedOptions.yAxisTitle = options.yAxisTitle || facetLabels;

		processedOptions.data = data;
		this._processedOptions = processedOptions;
	};

	/**
	 * Create y values for each text percentage to position correctly around graph
	 * converting the values to between 0 and 100 and also saving off as labels and positioning
	 * This should all go away once we can use DV labels for donuts
	 * @param {object} each category's state (active/inactive) - null if all active or not interactive
	 * @public
	 */
	adapter.processLabelData = function(legend) {
		var d = this.data(), mappings = this.mappings(),
			data = this._labelData = Object.create(d),
			numTotals = {}, visTotals = {}, self = this,
			facets = data[mappings['series']],
			values = data[mappings['y']],
			slices = data[mappings['x']];

		// Store totals for each facet
		facets.forEach(function(v, i) {
			if (numTotals[v] === undefined) { numTotals[v] = 0; }
			if (visTotals[v] === undefined) { visTotals[v] = 0; }
			numTotals[v] += values[i];
			if (!legend.isSeriesEnabled || legend.isSeriesEnabled(slices[i])) {
				visTotals[v] += values[i];
			}
		});

		var	textValue = ( data.cvtextvalue = [] ),
			textPercentLabel = ( data.cvtextperclabel = [] ),
			textValueLabel = (data.cvtextvallabel = [] ),
			preValue = {}, facet, percent, visPercent, visible;
		values.forEach(function(v, i) {
			facet = facets[i];
			percent = (parseFloat(v) / numTotals[facet]) * 100;
			textValueLabel[i] = v;
			textPercentLabel[i] = ((percent % 1 !== 0) ? percent.toFixed(1) : percent ) + '%'; // TODO: Localized
			// handle visible separate
			visible = !legend.isSeriesEnabled || legend.isSeriesEnabled(slices[i]);
			visPercent = (parseFloat(v) / visTotals[facet]) * 100;
			if (preValue[facet] === undefined) { preValue[facet] = 0; }
			textValue[i] = (visible) ? preValue[facet] + (visPercent/2) : 0; // center on the data it represents
			preValue[facet] += (visible) ? visPercent : 0;
		});
	};

	/**
	 * Returns the processed data
	 * @returns {number}
	 */
	adapter.data = function() {
		return this._processedOptions.data;
	};

	/**
	 * Returns the data with labels data
	 * @returns {number}
	 */
	adapter.labelData = function() {
		return this._labelData;
	};

	/**
	 * Determines the correct yAxisTitle aka individual chart title
	 * @returns {number}
	 */
	adapter.yAxisTitle = function(facetIndex) {
		var title = this._processedOptions.yAxisTitle;
		if (title instanceof Array && title.length > facetIndex) { title = title[facetIndex]; }
		return title;
	};

	/**
	 * Whether the chart will inclue an 'Other' category
	 * This category usually represents a number of smaller categories
	 * that couldn't visually fit on the cart
	 * @returns {boolean}
	 */
	adapter.showOtherCategory = function() {
		return this.otherIncluded;
	};

	/**
	 * Returns the number of facets or individual donuts rendered in the chart
	 * @returns {number}
	 */
	adapter.numberOfFacets = function() {
		return this.numFacets;
	};

	standardAdapters.donutObj = adapter;
	standardAdapters.donut = cloudViz.util.createConstructor(adapter);
}(this));
/*global dv*/
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj);

	/**
	 * @see base#_processOptions
	 */
	adapter._processOptions = function(options, changedOptions) {
		var processedOptions = this._processedOptions = Object.create(options);

		// We can't simple get the options.data or options.mappings here
		// We need to call to get it in case this class is extended and the data/mappings were changed
		var data = this.data(), mappings = this.mappings();
		this._forceZero = options._forceZero;
		this._uniqueStrokeValues = this._processUniqueStrokeValues(data, mappings);
		this._uniqueStrokeExtents = this._processUniqueStrokeExtents(data, mappings);

		// If isOvertime has been set, it was done by a more specific data adapter and doesn't need to be
		// done again.
		if (processedOptions.isOvertime == null) {
			processedOptions.isOvertime = this._determineOvertime(data);

			if (processedOptions.isOvertime) {
				processedOptions.dateGranularity = processedOptions.dateGranularity || this._calculateDateGranularity(data);
			}
		}

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	/**
	 * Whether the data is time-based.
	 * @returns {boolean}
	 */
	adapter.isOvertime = function() {
		return this._processedOptions.isOvertime;
	};

	/**
	 * An array of distinct values from the tuple mapped to the stroke aesthetic.
	 * Stroke is visually the grouping of series, as oppose to group which is different geoms (but possibly the same stroke)
	 * @returns {array}
	 */
	adapter.uniqueStrokeValues = function() {
		return this._uniqueStrokeValues || [];
	};

	adapter.uniqueStrokeExtents = function() {
		return this._uniqueStrokeExtents;
	};

	adapter.getUniqueStrokeExtent = function(scaleIndex) {
		var uniqueStrokeValue = this._uniqueStrokeValues[scaleIndex];
		if (uniqueStrokeValue) {
			return this._uniqueStrokeExtents[uniqueStrokeValue];
		}
		return null;
	};

	adapter.getUniqueStrokeExtentByStroke = function(stroke) {
		return this._uniqueStrokeExtents[stroke];
	};

	/**
	 * Retrieves unique values from the tuple mapped to the stroke aesthetic.
	 * @param {object} data
	 * @param {object} mappings
	 * @returns {array}
	 * @private
	 */
	adapter._processUniqueStrokeValues = function(data, mappings) {
		var tuple = data[mappings['series']];
		return tuple ? dv.util.uniq(tuple) : [];
	};

	/**
	 * Processes all the min/max y values of each series.
	 * @param {object} data
	 * @param {object} mappings
	 * @returns {object}
	 * @private
	 */
	adapter._processUniqueStrokeExtents = function(data, mappings) {
		var strokeTuple = data[mappings['series']],
			yTuple = data[mappings['y']],
			extents = {};

		yTuple.map(function(d, i) {
			var strokeValue = strokeTuple[i];
			if (!isFinite(d) || d === null) { return; } // ignore undefined/null
			if (!extents[strokeValue]) {
				extents[strokeValue] = [d, d];
			}
			extents[strokeValue][0] = Math.min(d, extents[strokeValue][0]);
			extents[strokeValue][1] = Math.max(d, extents[strokeValue][1]);
		});
		return extents;
	};

	standardAdapters.lineObj = adapter;
	standardAdapters.line = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj);

	/**
	 * The user-friendly name of the metric mapped to the size aesthetic.
	 * @returns {null}
	 */
	adapter.sizeMetricName = function() {
		return this._options && this._options.sizeTitle || null;
	};

	/**
	 * Checks the size mapping for data.
	 * @returns {boolean}
	 */
	adapter.isBubble = function() {
		var size = this.mappings()['size'];
		return size && size.length;
	};

	standardAdapters.pointObj = adapter;
	standardAdapters.point = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj);

	/**
	 * @see base#_processOptions
	 */
	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = this._processedOptions = Object.create(options),
			data = JSON.parse(JSON.stringify(options.data)); // make a deep copy of the data

		// Map the nodes to an internal id to track them, using index
		data.nodesById = [];
		data.nodes.map(function(n, i) {
			n._pid = i;
			data.nodesById[i] = n;
			return n;
		});

		// Convert the paths into individual links
		data.links = [];
		data.linksById = [];
		var src, target, val, id, link, adap = this;

		// munge the paths first
		data.paths = data.paths.filter(function(p) {
			// Convert single value in values into array
			if (!(p.values instanceof Array)) {
				p.values = Array.apply(null, new Array(p.nodes.length - 1)).map(function(){ return p.values; });
			}

			// remove all paths that have 0 or negative values
			if (p.values.some(function(v) { return v <= 0; })) { return false; }

			// Convert p.nodes to use _pid rather than index (so we can change the order later)
			p.nodes.map(function(n) { return (n !== null) ? data.nodes[n]._pid : null; });
			return true;
		});

		// create links
		data.paths.forEach(function(p, i) {
			p.nodes.forEach(function(n, ni) {
				if (!ni) {
					src = p.nodes[ni];
					if (src !== null) {
						data.nodesById[src].isPathStart = true;
						if (data.nodesById[src].isPathEnd) {
							data.nodesById[src].isPivot = true;
						}
					}
					return; // ignore first
				}
				src = p.nodes[ni-1];
				target = n;
				if (ni === p.nodes.length -1) {
					if (target !== null) {
						data.nodesById[target].isPathEnd = true;
						if (data.nodesById[target].isPathStart) {
							data.nodesById[target].isPivot = true;
						}
					}
				}
				val = p.values[ni-1];
				id = adap._generateLinkId(src, target);
				// If we already have a link, add the value and store reference to the path
				if (link = data.linksById[id]) {
					link.value += val;
					link.paths.push(i);
				} else {
					// Otherwise create a new link
					link = {
						source : src,
						target : target,
						value : val,
						paths : [i]
					};
					data.linksById[id] = link;
					data.links.push(link);
				}
			});
		});

		processedOptions.data = data;
		Object.getPrototypeOf(adapter)._processOptions.apply(this, arguments);
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	/**
	 * Returns a function that will determine how D3 pairs SVG elements with node data objects
	 * @returns {func}
	 * @private
	 */
	adapter.nodeKey = function() {
		return function(d, i) {
			return i;
		};
	};

	/**
	 * Returns a function that will determine how D3 pairs SVG elements with link objects
	 * @returns {func}
	 * @private
	 */
	adapter.linkKey = function() {
		return function(d, i) {
			return i;
		};
	};

	/**
	 * The user-friendly name of the metric that we are pathing on
	 * @returns {string}
	 */
	adapter.pathingTitle = function() {
		return '';
	};

	/**
	 * Determines the end of the path and returns the value of the node
	 * @param {object} path obj with nodes and values array
	 * @returns {obj} node obj
	 */
	adapter.getPathEnd = function(path) {
		return null; // TODO: Implement for base pathing chart...we don't know which of the ends we should return
	};

	/**
	 * Returns the direction of the path, 1 origin of the path is the start, -1 origin is at the end
	 * @param {object} path obj with nodes and values array
	 * @returns {number} 1 from, -1 to, 0 no direction found
	 */
	adapter.getPathDirection = function(path) {
		return 0;
	};

	/**
	 * Returns title for paths
	 * @param {arra} array of pathing objects
	 * @returns {string} title
	 */
	adapter.activePathsTitle = function(paths) {
		return (paths && paths.length) ? this.l10n.labels.pathing['path2+'] : '';
	};

	/**
	 * Verify that pathing data is valid
	 * @param {object} data
	 * @returns {boolean}
	 * @private
	 */
	adapter.isValidPathingData = function() {
		var data = this.data();
		if (!data) { return false; }
		if (!data.nodes || !data.paths) { return false; }
		if (!data.nodes.length) { return false; }

		return true;
	};

	/**
	 * Generate a unique id for a link based on the nodes it connects to
	 * @param {num} source node index
	 * @param {num} target node index
	 * @returns {string}
	 * @private
	 */
	adapter._generateLinkId = function(s, t) {
		return s + '-' + t;
	};

	/**
	 * Pass the src node and the direction that has first priority on the sort
	 * @param {object} data node
	 * @param {num} direction (1 or -1)
	 * @returns {func}
	 * @private
	 */
	adapter._sortPaths = function(node, dir) {
		var data = this.data();
		return function sort(a, b) {
			// given two indexes:
			// -1 if aIndex < bIndex or bIndex does not exist
			// 1 if bIndex < aIndex or aIndex does not exist
			// 0 if paths match all the way down or aIndex and bIndex don't exist
			function checkNodes(aIndex, bIndex, mod) {
				var aMod = aIndex + mod,
					bMod = bIndex + mod;
				// Now go to nodes
				var aValue = (aMod < a.nodes.length && aMod >= 0) ? a.nodes[aMod] : -1,
					bValue = (bMod < b.nodes.length && bMod >= 0) ? b.nodes[bMod] : -1;

				// get index of node
				if (aValue !== -1 && aValue !== null) { aValue = data.nodes.indexOf(data.nodesById[aValue]); }
				if (bValue !== -1 && bValue !== null) { bValue = data.nodes.indexOf(data.nodesById[bValue]); }

				// Handle entrance/exit
				if (null === aValue && null === bValue) { return 0; }
				if (null === aValue) { return (mod > 0) ? 1 : -1; } // enter first, exit last
				if (null === bValue) { return (mod > 0) ? -1 : 1; }
				// Now handle one path being longer
				if (-1 === aValue && -1 === bValue) { return 0; }
				if (-1 === aValue) { return 1; }
				if (-1 === bValue) { return -1; }
				// Now look at which node is before (above vertically)
				var dif = aValue - bValue;
				if (dif !== 0) { return dif; }
				// Same node, go deeper on the path
				return checkNodes(aMod, bMod, mod);
			}
			var aIndex = a.nodes.indexOf(node._pid),
				bIndex = b.nodes.indexOf(node._pid),
				value = checkNodes(aIndex, bIndex, dir);
			if (0 === value) {
				// try other side of nodes
				value = checkNodes(aIndex, bIndex, -dir);
			}
			if (0 !== value) { return value; }
			return b.nodes.length - a.nodes.length;
		};

	};

	/**
	 * Parses the passed path object and creates link objects
	 * The offset for the links is assumed to be reset before calling this method
	 * as it is used across multiple paths
	 * @returns {array}
	 */
	adapter._generatePathLinks = function(path, index, activeNode) {
		var data = this.data(), adap = this,
			src, target, srcNode, targetNode,
			val, prevCombined, combined, height,
			links = [];

		if (!path || !path.nodes) { return links; }
		path.nodes.forEach(function(n, i, arr) {
			if (!i) { return; }
			src = path.nodes[i-1];
			target = n;
			srcNode = data.nodesById[src] || null;
			targetNode = data.nodesById[target] || null;
			val = path.values[i-1];
			// get combined link information
			// to allow us to place the links correctly spacially
			prevCombined = null;
			if (i > 1) { // there is another path to link to
				prevCombined = data.linksById[
					adap._generateLinkId(path.nodes[i-2], src)
				];
			}
			combined = data.linksById[adap._generateLinkId(src, target)];
			height = (val / combined.value) * combined.dy;
			// push previous node
			if (srcNode) {
				links.push({
					dy : height,
					// handle first node in path by just having it stay straight (using combined)
					// handle drawing from previous combined link, negating previous height offset value
					// TODO: handle multiple values in a path aka we can't assume the same height
					sy : (prevCombined) ? prevCombined.ty + prevCombined.offset - height: combined.sy + combined.offset,
					// for exits, always have them end at the bottom
					ty : (!targetNode) ? srcNode.dy - height : combined.sy + combined.offset,
					source : {
						x : srcNode.x,
						y : srcNode.y,
						dx : 0
					},
					target : {
						x : srcNode.x + srcNode.dx,
						y : srcNode.y
					},
					value : val,
					path : index,
					pivotStart : srcNode.isPivot
				});
			}

			// push link
			links.push({
				dy : height,
				sy : combined.sy + combined.offset,
				ty : combined.ty + combined.offset,
				source : srcNode,
				target : targetNode,
				value : val,
				path : index
			});

			// push next node if last path and not an exit
			if (i + 1 === arr.length && targetNode) {
				links.push({
					dy : height,
					sy : combined.ty + combined.offset,
					ty : combined.ty + combined.offset,
					source : {
						x : targetNode.x,
						y : targetNode.y,
						dx : 0
					},
					target : {
						x : targetNode.x + targetNode.dx,
						y : targetNode.y
					},
					value : val,
					path : index,
					pivotEnd : targetNode.isPivot
				});
			}
			combined.offset += height;
		});
		return links;
	};

	/**
	 * Parses the passed node object and returns the paths
	 * @param {object} node data object
	 * @returns {array}
	 */
	adapter.nodePaths = function(node) {
		var data = this.data(),
			paths = data.paths.filter(function(p) {
				return p.nodes.indexOf(node._pid) !== -1;
			});
		return  paths;
	};

	/**
	 * Sorts passed paths and returns those as link objects that can be rendered as overlays
	 * @param {array} array of path objects
	 * @param {object} node data object
	 * @returns {array}
	 */
	adapter.nodePathData = function(paths, node) {
		var data = this.data(), adap = this,
			links = [], dlinks = data.links;

		// clear/set offsets
		dlinks.forEach(function(l) { l.offset = 0; });
		// sort paths by node and then by length
		// this gives the end result of it looking like its sorted by y value
		paths.sort(adap._sortPaths(node, -1));
		// loop over each path and its nodes to create individual links
		paths.forEach(function(p, i) {
			links = links.concat(adap._generatePathLinks(p, i, node));
		});
		return links;
	};

	/**
	 * Parses the passed link object, filters and sorts the paths and returns them
	 * @returns {array}
	 */
	adapter.linkSortActivePaths = function(link) {
		var data = this.data(),
			paths = data.paths, linkPaths,
			node = (link.source) ? link.source : link.target;
		// clear/set offsets
		data.links.forEach(function(l) { l.offset = 0; });
		linkPaths = link.paths.map(function(l) { return paths[l]; });
		linkPaths.sort(this._sortPaths(node, -1));
		return linkPaths;
	};

	/**
	 * Return link objects that can be rendered as overlays for paths
	 * @returns {array}
	 */
	adapter.linkPathData = function(paths) {
		var links = [], adap = this;
		// loop over each path and its nodes to create individual links
		paths.forEach(function(p, i) {
			links = links.concat(adap._generatePathLinks(p, i));
		});
		return links;
	};

	adapter.canExpandNode = function(nodeData) { return true; };
	adapter.canCollapseNode = function(nodeData) { return true; };
	adapter.canPivotNode = function(nodeData) { return true; };

	standardAdapters.pathingObj = adapter;
	standardAdapters.pathing = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj),
		d3 = global.d3 || {};

	adapter._processOptions = function(options, changedOptions, prevOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var oldOptions = prevOptions || this._processedOptions || {},
			processedOptions = this._processedOptions = Object.create(options);

		// Data partition format
		/*
			[{
				"categories": [
					{
						"name": "Phone"
					},
					{
						"name": "Carrier"
					}
				]
				"metrics": [
					{
						"name": "Users",
						"format": "int",
						"value": "10000" // total
					}
				]
				"children": [
					{
						"name": "iPhone 7",
						"metrics": [ {"value" : 8000} ],
						"children": [
							{
								"name": "Verizon",
								"metrics": [ {"value" : 3400} ]
							},
							{
								"name": "AT&T",
								"metrics": [ {"value" : 3908} ]
							}
						]
					},
				]
			}]
		*/

		// The size of the sunburst visualization (width or angle) will be determined by
		// either the metric 1st index value or the summation of its children metric 1st index values
		var data = JSON.parse(JSON.stringify(processedOptions.data)),
			sizeMetric = data.metrics[0] || { name : '', format : 'int' };

		// Sort the data by size (first metric value) so that the unique keys are displayed correctly
		function getNodeSize(n) {
			if (n.metrics && n.metrics.length && n.metrics[0] &&
				'undefined' !== typeof n.metrics[0].value) { return n.metrics[0].value; }
			if (!n.children || !n.children.length) { return 0; }
			return n.children.reduce(function(a, b) {
				return a + getNodeSize(b);
			}, 0);
		}
		function sortChildren(a, b) {
			return getNodeSize(b) - getNodeSize(a);
		}
		// Sort the data into descending order by size
		// Add the 'size' attribute for easy layout
		// Add 'other' data when a parent has a size
		// and it has children to equal the difference
		var otherLabel = this.l10n.labels.core.other;
		function processDataSort(node,level) {
			// Set size if not set yet
			node.size = ('undefined' === typeof node.size) ? getNodeSize(node) : node.size;
			if (!node.children || !node.children.length) { return; }
			// Get top before other is created
			if (level < data.categories.length) {
				var c = data.categories[level], num = node.children.length;
				c.top = ('undefined' !== typeof c.top) ? Math.max(c.top, num) : num;
			}
			// Create other if needed
			if ('undefined' !== typeof node.size && sizeMetric.format !== 'percent') {
				var sum = node.children.reduce(function(a, b) {
					return a + getNodeSize(b);
				}, 0);
				if (node.size > sum) {
					node.children.push({
						id : 'cv-sb-other',
						name : otherLabel,
						size : node.size - sum
					});
				}
			}
			// sort descending by size
			node.children.sort(sortChildren);
			node.children.forEach(function(d) {
				processDataSort(d, level + 1);
			});
		}
		processDataSort(data, 0);

		// Get the unique names to set color for
		// and create unique ID per node
		var names = [];
		function processDataKeys(children, level, step) {
			var ring = names[level] || ( names[level] = [] ),
				i, ii = children.length, item;
			for (i=0; i<ii; ++i) {
				item = children[i];
				item._sid = step + 's' + i;
				// Assign name
				if (otherLabel === item.name) { continue; }
				if (item.name) { ring[ring.length] = item.name; }
				// Dive in further
				if (item.children && item.children.length) {
					processDataKeys(item.children, level + 1, item._sid);
				}
			}
		}
		processDataKeys([data], 0, '');

		// Add the metric name on at the end so it won't take up an initial color
		data.name = sizeMetric.name;
		names.push([sizeMetric.name]);

		// Index the categories
		data.categories.forEach(function(c, i) { c.index = i; });

		// Merge the multidimensional arrays and only take uniques
		processedOptions.uniques = names.reduce(function(a, b) {
			var uniqs = b.reduce(function(x, y) {
				return (x.indexOf(y) < 0) ? x.push(y) && x : x;
			}, []);
			return a.concat(uniqs);
		}, []);

		processedOptions.data = data;
		processedOptions.categories = data.categories;
		// TODO: this will break if the user changes their metrics and/or order
		// as it will point to the wrong index
		// will need to somehow create a meaningful identifier for metrics more
		// than index
		processedOptions.colorMetricIndex = oldOptions.colorMetricIndex;
		processedOptions.stackedMetricIndex = oldOptions.stackedMetricIndex;
		processedOptions.secondaryMetricIndex = oldOptions.secondaryMetricIndex;
		processedOptions.secondaryMetricType = oldOptions.secondaryMetricType;
		processedOptions.seqColors = processedOptions.seqColors;

		Object.getPrototypeOf(adapter)._processOptions.apply(this, arguments);
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	adapter.categories = function() {
		return this._processedOptions.categories;
	};

	adapter.uniques = function() {
		return this._processedOptions.uniques;
	};

	adapter.colors = function() {
		return this._processedOptions.colors;
	};

	adapter.seqColors = function() {
		return this._processedOptions.seqColors;
	};

	adapter.metricColor = function(d) {
		return this._processedOptions.metricColor;
	};

	adapter.otherColor = function(d) {
		return this._processedOptions.otherColor;
	};

	adapter.otherGrayColor = function(d) {
		return this._processedOptions.otherGrayColor;
	};

	adapter.outRangeColor = function(d) {
		return this._processedOptions.outRangeColor;
	};

	adapter.isOther = function(d) {
		return d.name === this.l10n.labels.core.other;
	};

	adapter.isRoot = function(d) {
		return !d.parent;
	};

	adapter.isDataEmpty = function() {
		var d = this.data();
			// TODO: Min/max should be calculated in standard not in RS so we can check for it
			/*empty = d.metrics.every(function(m) {
				return !(m.min || m.max);
			});*/
		return !(d && d.children && d.children.length);
	};

	adapter.isSizeEmpty = function() {
		return !this.data().size;
	};

	adapter._validateData = function(data) {
		if (!data || !data.children || !data.children.length) { return false; }
		return true;
	};

	adapter.getPathKey = function(d, i) {
		return d && d._sid || i;
	};

	adapter.getDataByPathKey = function() {
		var data = this.data(), self = this,
			keys = {}, key;
		function getKey(child) {
			if (!child) { return; }
			key = self.getPathKey(child, null);
			if (key) { keys[key] = child; }
			if (child.children) {
				child.children.forEach(getKey);
			}
		}
		getKey(data);
		return keys;
	};

	/**
	 * Get metric object being used for coloring the chart
	 * @returns {object} metric object
	 */
	adapter.getColorMetric = function() {
		var m = this._processedOptions.colorMetricIndex;
		return (m) ? this.data().metrics[m] : null;
	};

	/**
	 * Get metric object index being used for coloring the chart
	 * @returns {number} metric object index
	 */
	adapter.getColorMetricIndex = function() {
		return this._processedOptions.colorMetricIndex;
	};

	/**
	 * Set metric object index to be used for coloring the chart
	 * @param {number} metric object index
	 */
	adapter.setColorMetricIndex = function(m) {
		if (this._processedOptions.colorMetricIndex === m) { m = null; }
		this._processedOptions.secondaryMetricIndex = m;
		this.setSecondaryMetricType('color');
	};

	/**
	 * Get metric object being used for the height of the chart
	 * @returns {object} metric object
	 */
	adapter.getStackedMetric = function() {
		var m = this._processedOptions.stackedMetricIndex;
		return (m) ? this.data().metrics[m] : null;
	};

	/**
	 * Get metric object index being used for the height of the chart
	 * @returns {number} metric object index
	 */
	adapter.getStackedMetricIndex = function() {
		return this._processedOptions.stackedMetricIndex;
	};

	/**
	 * Set metric object index to be used for the height of the chart
	 * @param {number} metric object index
	 */
	adapter.setStackedMetricIndex = function(m) {
		if (this._processedOptions.stackedMetricIndex === m) { m = null; }
		this._processedOptions.secondaryMetricIndex = m;
		this.setSecondaryMetricType('height');
	};

	/**
	 * Get the secondary metric to be visualized as type
	 * @returns {string} 'color', 'height' 'both' or null
	 */
	adapter.getSecondaryMetricType = function() {
		return this._processedOptions.secondaryMetricType;
	};

	/**
	 * Update the secondary metric to be visualized as type
	 * @param {string} 'color', 'height' 'both' or null to clear
	 */
	adapter.setSecondaryMetricType = function(type) {
		var mIndex = this.getSecondaryMetricIndex() || 1,
			pOptions = this._processedOptions, self = this;
		// update secondary
		pOptions.secondaryMetricIndex = mIndex;
		pOptions.secondaryMetricType = type;
		switch(type) {
			case 'color':
				pOptions.colorMetricIndex = mIndex;
				pOptions.stackedMetricIndex = null;
				break;
			case 'height':
				pOptions.colorMetricIndex = null;
				pOptions.stackedMetricIndex = mIndex;
				break;
			case 'both':
				pOptions.colorMetricIndex = mIndex;
				pOptions.stackedMetricIndex = mIndex;
				break;
			default:
				pOptions.colorMetricIndex = null;
				pOptions.stackedMetricIndex = null;
				pOptions.secondaryMetricIndex = null;
				pOptions.secondaryMetricType = null;
		}
	};

	/**
	 * Get metric object being used for secondary visualization
	 * @returns {object} metric object
	 */
	adapter.getSecondaryMetric = function() {
		var m = this._processedOptions.secondaryMetricIndex;
		return (m) ? this.data().metrics[m] : null;
	};

	/**
	 * Get metric object index being used for secondary visualization
	 * @returns {number} metric object index
	 */
	adapter.getSecondaryMetricIndex = function() {
		return this._processedOptions.secondaryMetricIndex;
	};

	/**
	 * Set metric object index being used for secondary visualization
	 * @param {number} metric object index
	 */
	adapter.setSecondaryMetricIndex = function(index) {
		if (this._processedOptions.secondaryMetricIndex === index) { index = null; } // toggle
		this._processedOptions.secondaryMetricIndex = index;
		this.setSecondaryMetricType(index ? this.getSecondaryMetricType() || 'height' : null); // default to height
	};

	standardAdapters.sunburstObj = adapter;
	standardAdapters.sunburst = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		standardAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.standard'),
		adapter = Object.create(standardAdapters.baseObj),
		d3 = global.d3 || {};

	adapter._processOptions = function(options, changedOptions) {
		// Make a copy of the options.
		var processedOptions = this._processedOptions = Object.create(options);
		var data = options.data;

		if(options.isEmotionChart){
			data = this._getEmotionData(options.data);
		}

		processedOptions.data = data;
		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	adapter._getEmotionData = function(data){
		var l10n =  this.l10n.labels.flower;

		var emotionTemplate = [
				{index: 'joy',          label: l10n.joy,          color:'#e6b43c'},
				{index: 'admiration',   label: l10n.admiration,   color:'#7daf4b'},
				{index: 'fear',         label: l10n.fear,         color:'#50965a'},
				{index: 'surprise',     label: l10n.surprise,     color:'#00a0be'},
				{index: 'sadness',      label: l10n.sadness,      color:'#286eaf'},
				{index: 'disgust',      label: l10n.disgust,      color:'#964196'},
				{index: 'anger',        label: l10n.anger,        color:'#f04641'},
				{index: 'anticipation', label: l10n.anticipation, color:'#dc5f00'}
			];

			var map = {};
			dv.util.each(data, function(o){
				map[o.index] = o;
			});

			dv.util.each(emotionTemplate, function(o){
				if(!map[o.index]){
					o.value = 0;
				}else{
					o.value = map[o.index].value || 0;
				}
			});

		return emotionTemplate;
	};

	adapter._validateData = function(data, mappings) {
		if (!data) { return false; }
		return true;
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	standardAdapters.flowerObj = adapter;
	standardAdapters.flower = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.baseObj);

	/**
	 * Loop over every metric in the data array and determine its unique series index
	 * Using that index, save the metric type to the y format array
	 * @param {object} chart data
	 * @param {object} chart mappings
	 * @param {array} unique values array
	 * @returns {array} array with formats : [ 'int', 'percent' ]
	 * @private
	 */
	adapter._getYFormats = function(data, mappings, values) {
		var y = [];
		if (!data || !data.metric || !mappings || !mappings['series'] || !values) { return y; }
		var len = data.metric.length;
		for (var i = 0; i < len; i++) {
			var metric = data.metric[i],
				group = data[mappings['series']],
				formatIndex = values.indexOf(group[i]);
			y[formatIndex] = metric.type;
		}
		return y;
	};

	/**
	 * An object mapping tuples from the data object to visual aesthetics on the chart.
	 *
	 * <pre><code>
	 *     {
	 *         x: 'foo'
     *         y: 'bar'
	 *     }
	 * </code></pre>
	 *
	 * @returns {object}
	 */
	adapter.mappings = function() {
		return this._processedOptions.mappings;
	};

	/**
-    * An object defining how number values should be formatted for each axis. Possible values include currency, percent,
-    * decimal, and time. Since y supports multiple axes, an array can be used instead of a string.  If a string is provided,
	 * that y format is applied to all series.  If an array is provided for y, each format maps to each series.
-    *
-    * <pre><code>
-    *     {
-    *         x: 'percent',
-    *         y: [ 'currency', 'decimal' ],
	 *         size: 'time'
-    *     }
-    * </code></pre>
-    *
-    * @returns {array}
-    */
	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	// this adapter should not be extended but rather its methods directly used
	rsAdapters.baseObj = adapter;
	// it can be used but really shouldn't
	rsAdapters.base = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.barObj);

	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = this._processedOptions = Object.create(options);

		// Determine if the bar chart is categorical or over time (histogram)
		processedOptions.isOvertime = this._determineOvertime(processedOptions.data);
		// Get the yAxisTitle based on the metric labels in the data
		processedOptions.yAxisTitle = options.yAxisTitle || this._getYAxisTitle(processedOptions.data);
		// Determine time granularity (this will only matter if the chart is a histogram)
		processedOptions.dateGranularity = this._getTimeGranularity(processedOptions.data);

		// Update data/mappings to match a rs bar chart data set
		this._processData(processedOptions);
		this._updateMappings(processedOptions);

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);

		// Determine the correct y formats based on the metric types
		// Must be after mappings and after the fill values have populated in the standard/bar adapter
		processedOptions.formats = {
			x : options.formats.x,
			y : this._getYFormats(processedOptions.data, processedOptions.mappings, this.uniqueFillValues())
		};
	};

	adapter.isOvertime = function() {
		return this._processedOptions.isOvertime;
	};

	adapter.xAxisTitle = function() {
		return null;
	};

	adapter.yAxisTitle = function() {
		return this._processedOptions.yAxisTitle;
	};

	adapter.dateGranularity = function() {
		return this._processedOptions.dateGranularity;
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	adapter.mappings = function() {
		return this._processedOptions.mappings;
	};

	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	adapter._determineOvertime = function(data) {
		var date = data.date, histogram = data.metric && data.metric.some(function(m) {
			return m && m.date_ref && m.date_ref.length > 1;
		});

		return date && date.length && histogram;
	};

	adapter._getYAxisTitle = function(data) {
		return this._getYTitleFromLabels(data.label);
	};

	adapter._processData = function(processedOptions) {
		if (processedOptions.isOvertime) { return; } // no need to process for categorical

		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var d = Object.create(processedOptions.data), i, ii = d.cell.length,
			cell = null, prev = null;
		// create a group array that mirrors except it includes ::incomplete::
		d.group = [];
		for (i=0; i<ii; ++i) {
			prev = cell;
			cell = d.cell[i];
			d.group[i] = d.series[i];

			// when encountering an identical incomplete, create another point to draw the dotted line from
			if (prev && 'incomplete' === cell.status && 'incomplete' !== prev.status) {
				d.group[i] += '::incomplete::'; // mark as a separate type
			}
		}
		processedOptions.data = d;
	};

	adapter._updateMappings = function(processedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var mappings = Object.create(processedOptions.mappings);
		if (processedOptions.isOvertime) {
			// Overtime we need to break up the data in groups by filter/metric/datastore
			mappings.x = 'date';
			mappings.y = 'value';
			mappings.group = 'group'; // Not currently used because we don't show incomplete yet
			mappings.series = 'series';
			mappings.seriesLabel = 'series_name';
		} else {
			// Filter is our x axis, so we only need to break up by metric/datastore
			mappings.x = 'category';
			mappings.y = 'value';
			mappings.series = 'metric_series';
			mappings.seriesLabel = 'metric_series_name';
		}
		processedOptions.mappings = mappings;
	};

	adapter._getTimeGranularity = function(data) {
		return data.metric[0]['date_range'].gran;
	};

	// Base adapter methods
	var base = rsAdapters.baseObj;
	adapter._getYFormats = base._getYFormats;

	rsAdapters.bar = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.choroplethObj),
		d3 = global.d3 || {};

	adapter._processOptions = function(options, changedOptions) {
		// Make a copy of the options.
		var processedOptions = this._processedOptions = Object.create(options);
		this._processData(processedOptions, options);
		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	adapter._processData = function(processedOptions, options) {
		var rsdata = options.data, // raw Reporting Services object
			data = rsdata.data, metrics = rsdata.metrics, filters = rsdata.filters, dates = rsdata.dates,
			filter_ref, date_ref,
			metric, filter,
			result = { values: {} };

		for (var m = 0, mm = metrics.length; m < mm; ++m) {
			metric = metrics[m];
			filter_ref = metric.filter_ref;
			date_ref = metric.date_ref;
			for (var f = 0, ff = filter_ref.length; f < ff; ++f) {
				filter = filters[filter_ref[f]];
				for (var d = 0, dd = date_ref.length; d < dd; ++d) {
					result.values[(filter.info || {}).geo_id] = data[filter_ref[f]][date_ref[d]][m].val;
				}
			}
		}

		processedOptions.data = result; // Choropleth expected data object
		processedOptions.metric = metric.name;
		processedOptions.format = metric.type;
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	adapter.metric = function() {
		return this._processedOptions.metric;
	};

	adapter.format = function() {
		return this._processedOptions.format;
	};

	adapter._validateData = function(data, mappings) {
		if (!data) { return false; }
		return true;
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	rsAdapters.choropleth = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.donutObj);

	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = this._processedOptions = Object.create(options);

		// Update mappings to match a rs donut chart data set
		this._updateMappings(processedOptions);

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);

		// Determine the correct y formats based on the metric types
		// Must be after mappings and after the fill values have populated in the standard/bar adapter
		processedOptions.formats = {
			x: options.formats.x,
			y: this._getYFormats(processedOptions.data, processedOptions.mappings, this.uniqueFillValues())
		};
	};

	adapter.mappings = function() {
		return this._processedOptions.mappings;
	};

	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	adapter._updateMappings = function(processedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var mappings = Object.create(processedOptions.mappings);
		mappings.x = 'category';
		mappings.y = 'value';
		mappings.series = 'metric_series';
		mappings.seriesLabel = 'metric_series_name';
		processedOptions.mappings = mappings;
	};

	// Base adapter methods
	var base = rsAdapters.baseObj;
	adapter._getYFormats = base._getYFormats;

	rsAdapters.donut = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.lineObj);

	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = this._processedOptions = Object.create(options);

		// Determine if the bar chart is categorical or over time (histogram)
		processedOptions.isOvertime = this._determineOvertime(processedOptions.data);
		// Get the yAxisTitle based on the metric labels in the data
		processedOptions.yAxisTitle = options.yAxisTitle || this._getYAxisTitle(processedOptions.data);
		// Determine time granularity (this will only matter if the chart is a histogram)
		processedOptions.dateGranularity = this._getTimeGranularity(processedOptions.data);

		// Update data/mappings to match a rs bar chart data set
		this._updateMappings(processedOptions);
		// Process data for multi-metric
		// This will overwrite the default trend mappings
		this._processMultiMetric(processedOptions);
		// Add incomplete data to groups if necessary
		this._processIncompleteData(processedOptions);

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);

		// Determine the correct y formats based on the metric types
		// Must be after mappings and after the stroke values have populated in the standard/bar adapter
		// Only needed if overtime (multi-metric will have its own formats)
		processedOptions.formats = {
			x: options.formats.x,
			y: processedOptions.isOvertime ? this._getYFormats(processedOptions.data, processedOptions.mappings, this.uniqueStrokeValues()): options.formats.y
		};
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	adapter.mappings = function() {
		return this._processedOptions.mappings;
	};

	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	adapter.xAxisTitle = function() {
		return this._processedOptions.xAxisTitle;
	};

	adapter.yAxisTitle = function() {
		return this._processedOptions.yAxisTitle;
	};

	adapter.isOvertime = function() {
		return this._processedOptions.isOvertime;
	};

	adapter.dateGranularity = function() {
		return this._processedOptions.dateGranularity;
	};

	adapter._determineOvertime = function(data) {
		return +data.date[0] !== +data.date[data.date.length-1];
	};

	adapter._getYAxisTitle = function(data) {
		return this._getYTitleFromLabels(data.label);
	};

	adapter._getTimeGranularity = function(data) {
		// Assuming all metrics have the same time/date range and granularity
		// TODO: Handle multiple metrics with multiple granularities...
		return this.isOvertime() ? data.metric[0].date_range.gran : '*';
	};

	// Nearly identical to point to handle multiple metrics except for some syntax issues
	// And the need to set up support for dual-y-axis and no default mapping settings needed
	adapter._processMultiMetric = function(processedOptions) {
		if (processedOptions.isOvertime) { return; } // no need to process for trend data

		// Create the data structure for the point chart based on the metric information from RS
		// This will support 2-3 metrics. 2 metrics = scatterplot, 3 metrics = bubble
		var data = processedOptions.data, pData = { series: [] },
			metrics = [], formats = [], i, ii, metric;

		// Iterate over the labels (metric names), we need to create new parallel arrays
		// Metric 0 will be the new x axis, its values need to go into the x mapping
		// Metric 1 will be the new y axis, its values need to go into the y mapping
		// The series should be each individual point as it relates to metric 0 and 1
		// If there is metric 2, it should add its value as the size mapping
		// Record the formats for each metric so the numbers can be formatted accordingly
		for (i=0, ii=data.label.length; i<ii; ++i) {
			metric = data.label[i];
			if (!pData[metric]) {
				metrics.push(metric);
				if (data.metric && data.metric.length) {
					formats.push(data.metric[i].type);
				}
				else {
					formats.push(null);
				}
				pData[metric] = [];
			}
			// Assign value for metric
			pData[metric].push(data.value[i]);
			// Convert the category into series
			pData.series[pData[metric].length-1] = data.category[i];
		}

		var m = {
			x: metrics[0],
			y: metrics[1]
		};
		var f = {
			x: formats[0],
			y: {
				0: formats[1] // This is a nested object because we can have multiple y formats for multiple y axes.
			}
		};
		if (data.groups && data.groups.length && data.groups[0].length) {
			// Add a group data set from groups
			var g, gg = data.groups.length, item, group = [];
			for (g = 0; g<gg; ++g) {
				item = data.groups[g];
				group[g] = item.join('-');
			}
			pData.facet_group = group;
			m.series = 'facet_group';
		}

		if (metrics.length > 2) {
			m.size = metrics[2];
			f.size = formats[2];
			processedOptions.sizeMetricName = processedOptions.sizeTitle || metrics[2];
		}

		processedOptions.data = pData;
		processedOptions.mappings = m;
		processedOptions.formats = f;
		processedOptions.xAxisTitle = processedOptions.xAxisTitle || metrics[0];
		processedOptions.yAxisTitle = processedOptions.yAxisTitle || metrics[1];
	};

	adapter._updateMappings = function(processedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var mappings = Object.create(processedOptions.mappings);

		// Overtime we need to break up the data in groups by filter/metric/datastore
		mappings.x = 'date';
		mappings.y = 'value';
		mappings.group = 'series';
		mappings.series = 'series';
		mappings.seriesLabel = 'series_name';
		processedOptions.mappings = mappings;
	};

	adapter._processIncompleteData = function(processedOptions) {
		if (!processedOptions.isOvertime || !processedOptions.data.cell) { return; } // no support for incomplete on multimetric
		// Currently we cannot show incomplete or invalid data when position is fill or stack
		// because D3's stacking function can't use it (which DV uses).
		// See issue #101 for details on why (https://git.corp.adobe.com/Coral/CloudViz/issues/101).
		if (processedOptions.position === 'stack' || processedOptions.position === 'fill') { return; }

		var data = processedOptions.data, mappings = processedOptions.mappings,
			i, ii = data.cell.length, cell = null, prev = null, k, incompleteSeriesExists = false;

		// create a incomplete array that mirrors series except it includes ::incomplete::
		data.cv_rs_group = data.cv_rs_group || [];
		for (i=0; i<ii; ++i) {
			prev = cell;
			cell = data.cell[i];
			data.cv_rs_group[i] = data.cv_rs_group[i] || data.series[i];

			// Let's make sure an incomplete series doesn't already exist.
			// We don't want to create extra incomplete data points if we've already done so previously.
			if(data.cv_rs_group[i].indexOf('::incomplete::') >= 0) { continue; }

			// when encountering an identical incomplete, create another point to draw the dotted line from
			if (prev && 'incomplete' === cell.status && 'incomplete' !== prev.status) {
				for (k in data) { data[k].splice(i, 0, data[k][i - 1]); }
				data.cv_rs_group[i] += '::incomplete::'; // mark as a separate type
				++ii; // update length
				++i; // go back to the original incomplete cell
			}

			data.cv_rs_group[i] += 'incomplete' === cell.status ? '::incomplete::' : '';
		}
		mappings.group = 'cv_rs_group';
	};

	// Base adapter methods
	var base = rsAdapters.baseObj;
	adapter._getYFormats = base._getYFormats;

	rsAdapters.line = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.pointObj);

	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = this._processedOptions = Object.create(options);

		// Create the data structure for the point chart based on the metric information from RS
		// This will support 2-3 metrics. 2 metrics = scatterplot, 3 metrics = bubble
		var data = options.data, pData = { series: [] },
			metrics = [], formats = [], i, ii, metric;

		// Iterate over the labels (metric names), we need to create new parallel arrays
		// Metric 0 will be the new x axis, its values need to go into the x mapping
		// Metric 1 will be the new y axis, its values need to go into the y mapping
		// The series should be each individual point as it relates to metric 0 and 1
		// If there is metric 2, it should add its value as the size mapping
		// Record the formats for each metric so the numbers can be formatted accordingly
		for (i=0, ii=data.label.length; i<ii; ++i) {
			metric = data.label[i];
			if (!pData[metric]) {
				metrics.push(metric);
				if (data.metric && data.metric.length) {
					formats.push(data.metric[i].type);
				}
				else {
					formats.push(null);
				}
				pData[metric] = [];
			}
			// Assign value for metric
			pData[metric].push(data.value[i]);
			// Convert the category into series
			pData.series[pData[metric].length-1] = data.category[i];
		}

		var m = {
			x: metrics[0],
			y: metrics[1]
		};
		var f = {
			x: formats[0],
			y: formats[1]
		};
		if (data.groups && data.groups.length && data.groups[0].length) {
			// Add a group data set from groups
			var g, gg = data.groups.length, item, group = [];
			for (g = 0; g<gg; ++g) {
				item = data.groups[g];
				group[g] = item.join('-');
			}
			pData.group = group;
			m.series = 'group';
		} else {
			m.series = 'series';
		}

		if (metrics.length > 2) {
			m.size = metrics[2];
			f.size = formats[2];
			processedOptions.sizeMetricName = options.sizeTitle || metrics[2];
		}

		processedOptions.data = pData;
		processedOptions.mappings = m;
		processedOptions.formats = f;
		processedOptions.xAxisTitle = options.xAxisTitle || metrics[0];
		processedOptions.yAxisTitle = options.yAxisTitle || metrics[1];

		Object.getPrototypeOf(adapter)._processOptions.apply(this, arguments);
	};

	adapter.data = function() {
		return this._processedOptions.data;
	};

	adapter.mappings = function() {
		return this._processedOptions.mappings;
	};

	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	adapter.xAxisTitle = function() {
		return this._processedOptions.xAxisTitle;
	};

	adapter.yAxisTitle = function() {
		return this._processedOptions.yAxisTitle;
	};

	adapter.sizeMetricName = function() {
		return this._processedOptions.sizeMetricName;
	};

	rsAdapters.point = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.pathingObj),
		maxDepth = 4; // maximum depth that we can request from RS

	// convert the rs data structure to pathing data structure with nodes/paths
	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var processedOptions = Object.create(options),
			rsdata = processedOptions.data, pathdata = {},
			dnodes = (pathdata.nodes = []), dpaths = (pathdata.paths = []),
			nodesById = {}, l10n = this.l10n.labels.pathing;

		function detectEntry(f) { return 'E' === f; }
		function detectExit(f) { return 'X' === f; }

		// Loop over and create nodes based on unique ids for filters and their column position
		// Column position is based on the filter definitions children values
		var filter, filterIndex, filterId, filterName, filterChild, filterOp, filterValue,
			node, nodeId, nodeColumn, isBounce, minimumColumn = 0;
		for (filterIndex in rsdata.filters) {
			filter = rsdata.filters[filterIndex];
			filterId = this._getFilterId(filter);
			if (filterId) {
				// get filter information
				filterName = filter.info && filter.info.name || '';
				filterChild = this._getFilterChild(filter);
				filterOp = filterChild && filterChild.op || null;
				// for now ignore additional filters
				if (filterOp && filterOp !== 'previous' && filterOp !== 'next') {
					filterChild = filterOp = null;
				}
				// get the values for the filter aka the path
				filterValue = (filterChild && filterChild.val) ? [].concat(filterChild.val) : [];
				// determine column and id
				nodeColumn = 0;
				if ('previous' === filterOp) {

					// Create an entry node if this path includes entry (since we won't have an entry filter)
					if (filterValue.some(detectEntry)) {
						var entryId = 'E_0';
						if (!nodesById[entryId]) {
							node = {
								label : l10n.entry,
								id : entryId,
								column : nodeColumn,
								index : dnodes.length,
								filters : [] // TODO: Figure this out
							};
							dnodes[dnodes.length] = node;
							nodesById[entryId] = node;
						}
					}

					nodeColumn = filterValue.length;

				}
				if ('next' === filterOp) {

					// Create an exit node if this path includes exit (since we won't have an entry filter)
					if (filterValue.some(detectExit)) {
						var exitId = 'X_0';
						if (!nodesById[exitId]) {
							node = {
								label : l10n.exit,
								id : exitId,
								column : nodeColumn,
								index : dnodes.length,
								filters : [] // TODO: Figure this out
							};
							dnodes[dnodes.length] = node;
							nodesById[exitId] = node;
						}
					}

					nodeColumn = 0 - filterValue.length;
				}
				nodeId = filterId + '_' + nodeColumn;
				if (nodesById[nodeId]) { // collapse duplicate nodes in the same column
					nodesById[nodeId].filters.push(filter);
					continue;
				}
				isBounce = ('0' === String(filterId) && (l10n.exit === String(filterName) || l10n.entry === String(filterName)) );
				if (isBounce) { continue; } // ignore exit/entry nodes (for now)
				else if ('0' === String(filterId)) { continue; } // ignore nodes that aren't valid
				node = {
					label : filterName,
					id : nodeId,
					column : nodeColumn,
					index : dnodes.length,
					filters : [filter]
				};
				dnodes[dnodes.length] = node;
				minimumColumn = Math.min(minimumColumn, nodeColumn);
				nodesById[nodeId] = node;
			}
		}

		// Slide columns so that the minimum column value is 0
		if (0 !== minimumColumn) {
			for (var n in dnodes) {
				node = dnodes[n];
				node.column -= minimumColumn;
			}
		}

		// Loop over every unique filter and create a path
		var metric, filterRef, dateRef, dateIndex,
			m, mm, f, ff, d, dd,
			date, cell, nodes;
		for (m = 0, mm = rsdata.metrics.length; m < mm; ++m) {
			metric = rsdata.metrics[m];
			filterRef = metric.filter_ref; // get the filter(s) associated with the metric
			dateRef = metric.date_ref; // get the date range(s) associated with the metric
			for (f = 0, ff = filterRef.length; f < ff; ++f) {
				filterIndex = filterRef[f];
				filter = rsdata.filters[filterIndex];
				for (d = 0, dd = dateRef.length; d < dd; ++d) {
					dateIndex = dateRef[d];
					date = rsdata.dates[dateIndex];
					cell = rsdata.data[filterIndex][dateIndex][m]; // three dimensional hash filter:date:metric
					if ('invalid' === cell.status) { continue; } // ignore invalid paths
					// handle a select/equals that sets the total
					if (node = this._getSingleNode(filter, nodesById)) {
						node.total = +cell.val;
						continue;
					}
					nodes = this._createPath(filter, nodesById);
					if (!nodes || !nodes.length) { continue; } // ignore empty paths
					// create path
					dpaths[dpaths.length] = {
						nodes : nodes,
						values : +cell.val || 0
					};
				}
			}
		}

		// Sort the paths by length and then adjust values for subsets
		// Sort longest first
		dpaths.sort(function(a, b) {
			return b.nodes.length - a.nodes.length;
		});
		var i, ii, j, jj, path, otherPath;
		// Loop over from shortest to longest
		// If the outer path finds a path that it is a subset for
		// subtract the superset value from the subset path's value
		for (i=0, ii=dpaths.length; i<ii; ++i) {
			path = dpaths[i];
			for (j=0, jj=dpaths.length; j<jj; ++j) {
				if (i === j) { continue; } // ignore self
				otherPath = dpaths[j];
				if (otherPath.nodes.length === path.nodes.length) { continue; } // no need to check path with same length
				if (-1 !== this._getPathString(path.nodes).indexOf(this._getPathString(otherPath.nodes))) {
					otherPath.values -= path.values;
				}
			}
		}

		// Remove no value paths
		pathdata.paths = dpaths = dpaths.filter(function(p) { return p.values; });

		// Update our processed data
		processedOptions.data = pathdata;

		// Get pathing title
		var metrics = options.data.metrics;
		processedOptions.pathingTitle =  metrics && metrics.length && metrics[0].name;

		// apply normal pathing processing
		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	/**
	 * Returns a function that will determine how D3 pairs SVG elements with node data objects
	 * @returns {func}
	 * @private
	 */
	adapter.nodeKey = function() {
		return function(d, i) {
			return d.id;
		};
	};

	/**
	 * Returns a function that will determine how D3 pairs SVG elements with link objects
	 * @returns {func}
	 * @private
	 */
	adapter.linkKey = function() {
		return function(d, i) {
			return ((d.source) ? d.source.id : 'null') + '-' + ((d.target) ? d.target.id : 'null');
		};
	};

	/**
	 * The user-friendly name of the metric that we are pathing on
	 * @returns {string}
	 */
	adapter.pathingTitle = function() {
		return this._processedOptions.pathingTitle;
	};

	/**
	 * Determines the end of the path and returns the value of the node
	 * @param {object} path obj with nodes and values array
	 * @returns {obj} node obj
	 */
	adapter.getPathEnd = function(path) {
		// Check the ends of the path and find a pivot/entry/exit node
		if (!path || !path.nodes || !path.nodes.length) { return null; }
		if (path.nodes.length === 1) { return path.nodes[0]; } // shouldn't happen
		var nodes = path.nodes, data = this._processedOptions.data,
			byId = data.nodesById, start = byId[nodes[0]],
			end = byId[nodes[nodes.length-1]];
		function isEnd(n) {
			return n && (n.isPivot || n.id === 'E_0' || n.id === 'X_0');
		}
		if (isEnd(start)) { return start; }
		if (isEnd(end)) { return end; }
		return null;
	};

	/**
	 * Returns the direction of the path, 1 origin of the path is the start, -1 origin is at the end
	 * @param {object} path obj with nodes and values array
	 * @returns {number} 1 from, -1 to, 0 no direction found
	 */
	adapter.getPathDirection = function(path) {
		var end = this.getPathEnd(path);
		if (!end) { return 0; }
		return end._pid === path.nodes[0] ? 1 : -1;
	};

	/**
	 * Returns title for paths
	 * @param {array} array of pathing objects
	 * @returns {string} title
	 */
	adapter.activePathsTitle = function(paths) {
		if (!paths || !paths.length) { return ''; }
		// Since all paths in this list will have the same end, just grab the first one
		var end = this.getPathEnd(paths[0]),
			l10n = this.l10n.labels.pathing;
		if (!end) { return l10n['path2+']; }
		var pattern = this.getPathDirection(paths[0]) === 1 ? l10n.pathFromNode : l10n.pathToNode;
		return pattern
			.replace(/\{path\}/i, ((paths.length > 1) ? l10n['path2+'] : l10n['path']))
			.replace(/\{label\}/i, end.label);
	};

	/**
	 * Takes a filter, determines if its a standalone (no previous/next with a select/equals op)
	 * If so, finds the node in the array and returns it
	 * @param {object} filter object
	 * @param {array} all nodes by id
	 * @returns {object}
	 * @private
	 */
	adapter._getSingleNode = function(filter, byId) {
		var id = this._getFilterId(filter),
			def = filter.filter_def && filter.filter_def.length && filter.filter_def[0] || null,
			op = def && def.op || null,
			child = this._getFilterChild(filter),
			childOp = child && child.op || null;
		if (('select' !== op && 'equals' !== op && 'id' !== op) || 'previous' === childOp || 'next' === childOp) { return false; }
		return byId[id + '_0']; // all selects should be in zero column
	};

	/**
	 * Takes an array and converts it to a string
	 * Normally a toString would be enough but the null values need to be accounted for
	 * rather than just being an empty entry
	 * @param {array} path array
	 * @returns {string}
	 * @private
	 */
	adapter._getPathString = function(path) {
		return path.map(function(p){ return (null === p) ? 'null' : p; }).toString();
	};

	/**
	 * Creates the node array needed for a path
	 * @param {object} filter object
	 *
	 * <pre><code>
	 *     {
	 *         data_store: 'dms/adobescmobiledev',
	 *         info: {
	 *             id: '0',
	 *             name: 'Entry'
	 *         }
     *         filter_def: [
     *          {
     *             op: 'select',
	 *             val: {
	 *                 limit: [1, 6],
	 *                 order: [0]
	 *             },
     *             var: 'viewstate',
	 *             child: [
	 *              {
	 *                 op: 'next',
	 *                 val: ['2005543073'],
	 *                 var: 'viewstate'
	 *              }
	 *             ]
     *          }
     *         ]
	 *     }
	 * </code></pre>
	 * @param {array} all nodes by id
	 * @returns {array}
	 * @private
	 */
	adapter._createPath = function(f, byId) {
		var id = this._getFilterId(f), child = this._getFilterChild(f),
			op = child && child.op || null;
		// for now ignore additional filters
		if (op && op !== 'previous' && op !== 'next') { return []; }

		// get the values for the filter aka the path
		var values = (child && child.val) ? [].concat(child.val) : [];
		if (!values.length) { return values; }
		var prev = ('previous' === child.op),
			bounce = ('0' === id),
			c = (prev) ? 0 : (bounce) ? 0 - values.length + 1 : 0 - values.length, // starting column position
			nodes = [];
		if (prev) { values.push(id); }
		else { values.unshift(id); }
		return this._mapNodeIds(c, values, byId);
	};

	/**
	 * Takes an array of node ids and maps them to their indexes within byId
	 * @param {number} starting column index
	 * @param {array} array of node ids
	 * @param {object} lookup of all nodes by their unique id of node id plus column index
	 * @returns {array} mapping of nodes by unique id to index in node array
	 * @private
	 */
	adapter._mapNodeIds = function(c, ids, byId) {
		// handle invalid parameters
		if (!isFinite(c) || !byId) { return []; }
		c = +c;
		// Need to construct a valid path where we have a validValue
		// and there are no missing values aka nodes
		var validValue = false, missingValue = false, nodeId,
			mapped = ids && ids.map && ids.map(function(n) {
				// 0 is the value for an entry or exit
				if ('0' === n) { return null; }
				nodeId = n + '_' + c;
				if (!byId[nodeId]) {
					// node does not exist, throw the path out
					missingValue = true;
					return null;
				}
				// increment column
				// each node in a valid path is in a successive column
				++c;
				validValue = true;
				return +byId[nodeId].index;
			});
		return (validValue && !missingValue) ? mapped : [];
	};

	/**
	 * Gets the filter id if it exists or null
	 * @param {object} filter object
	 * @returns {string}
	 * @private
	 */
	adapter._getFilterId = function(filter) {
		return (filter.info && (filter.info.id || filter.info.id === 0)) ? filter.info.id + '' : null;
	};

	/**
	 * Gets the first AND value of a filter. For pathing, this will be the next or previous for a node
	 * @param {object} filter object
	 * @returns {object}
	 * @private
	 */
	adapter._getFilterChild = function(filter) {
		var def = filter.filter_def && filter.filter_def.length && filter.filter_def[0] || null;
		return def && def.child && def.child.length && def.child[0] || null;
	};

	adapter.canExpandNode = function(node) {
		var enters = node.entryLinks.length + node.targetLinks.length,
			exits = node.exitLinks.length + node.sourceLinks.length,
			column = Math.abs(parseInt(node.id.split('_')[1], 10));

		// Check path length (hack for now looking at column)
		if (column >= maxDepth) { return false; }

		// Handle entry/exit node
		if (exits && node.id === 'E_0') { return false; }
		if (enters && node.id === 'X_0') { return false; }

		// If the node does not have both enter and exit links
		if (!enters || !exits) { return true; }

		return false;
	};

	adapter.canCollapseNode = function(node) {
		var enters = node.entryLinks.length + node.targetLinks.length,
			exits = node.exitLinks.length + node.sourceLinks.length,
			column = parseInt(node.id.split('_')[1], 10);

		// Handle entry/exit
		// Since these aren't really nodes, we can't collapse them
		if (node.id === 'E_0' || node.id === 'X_0') { return false; }

		// Check that it has exits (positive column) or enters (negative column)
		// or either for center
		return (0 === column && (exits || enters)) ||
			(column > 0 && exits) ||
			(column < 0 && enters);
	};

	adapter.canPivotNode = function(node) {
		var enters = node.entryLinks.length + node.targetLinks.length,
			exits = node.exitLinks.length + node.sourceLinks.length,
			column = Math.abs(parseInt(node.id.split('_')[1], 10));
		// Allow any node outside of the center column
		if (column !== 0) { return true; }
		// Allow any node if multiple nodes in center column aka no pivot
		var data = this.data(), columns = data.nodes.map(function(d) { return parseInt(d.id.split('_')[1], 10); }),
			zeroCount = 0;
		if (columns.some(function(c){
			if (c === 0) { zeroCount++; }
			return (zeroCount > 1) ? true : false;
		})) { return true;}
		return false;
	};

	rsAdapters.pathingObj = adapter;
	rsAdapters.pathing = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.sunburstObj);

	adapter._processOptions = function(options, changedOptions) {
		// Prototypal inheritance so any attributes we set will merely mask instead of modify the original.
		var prevOptions = this._processedOptions,
			processedOptions = this._processedOptions = Object.create(options);

		// Recursive function to return an array of the ids the filter was ANDed against
		function getPartitionFilters(def) {
			var val = (def && def.op === 'id') ? [def.val] : [];
			if (def && def.child && def.child[0]) {
				return getPartitionFilters(def.child[0]).concat(val);
			}
			return val;
		}

		// Recursive function to count number of children on a filter def
		function filterDefHasChild(def) {
			if (def && def.child && def.child[0]) {
				return filterDefHasChild(def.child[0]) + 1;
			}
			return 0;
		}

		// Get the depth of the filter based on filter_def children
		function getFilterDepth(filter) {
			var def = filter && filter.filter_def && filter.filter_def[0] || null;
			return filterDefHasChild(def);
		}

		// Sort partitions by depth (number of filter_defs) and then by value
		function sortPartitions(a, b) {
			var aDepth = getFilterDepth(a.filter),
				bDepth = getFilterDepth(b.filter);
			if (aDepth === bDepth) {
				return b.cell[0].val - a.cell[0].val;
			}
			return aDepth - bDepth;
		}

		// Convert the metric/filters/date data into stacked categorical data structure
		var rsdata = options.data,
			metric, filterRef, dateRef, dateIndex,
			f, ff, d, dd, partition, partitions,
			date, cell, nodes, filter, filterIndex,
			data = {
				children : [],
				categories : [],
				metrics : rsdata.metrics.map(function(m, i) {
					return {
						id : m.id,
						icon : m.icon,
						name : m.name || m.id,
						format : m.type,
						categories : []
					};
				})
			};

		// Since the first metric will be all the shapes, we only care about its filters
		// All filters should have data with this metric, so the filter_ref should contain the entire filters list
		if (metric = rsdata.metrics[0]) {
			partitions = [];
			filterRef = metric.filter_ref; // get the filter(s) associated with the metric
			dateRef = metric.date_ref; // get the date range(s) associated with the metric
			// create an array of partitions that are composed of a filter and its value
			for (f = 0, ff = filterRef.length; f < ff; ++f) {
				filterIndex = filterRef[f];
				filter = rsdata.filters[filterIndex];
				for (d = 0, dd = dateRef.length; d < dd; ++d) {
					dateIndex = dateRef[d];
					date = rsdata.dates[dateIndex];
					cell = rsdata.data[filterIndex][dateIndex]; // two dimensional hash filter:date
					if (!cell[0] || 'invalid' === cell[0].status) { continue; } // ignore invalid data on first metric
					if (filter.info && filter.info.id === 0) { continue; } // ignore undefined filters
					partitions.push({
						filter : filter,
						cell : cell
					});
				}
			}
			// sort the array of partitions
			partitions.sort(sortPartitions);
			// loop over and create data
			// thanks to the sort, we will have an id by the time we need to insert it
			var partitionById = {}, parent_pid, parent_partition, def, pFilters, level;
			partitions.forEach(function(partition) {
				filter = partition.filter;
				cell = partition.cell;
				def = filter && filter.filter_def && filter.filter_def[0] || null;
				pFilters = getPartitionFilters(def),
				level = pFilters.length,
				parent_pid = pFilters.join('-');
				if (!parent_pid.length && !filter.info) {
					// assign total value data to metrics
					cell.forEach(function(c, i) {
						data.metrics[i].value = +c.val;
					});
					return;
				}
				partition = {
					id : filter.info.id,
					pid : parent_pid ? parent_pid + '-' + filter.info.id : filter.info.id,
					name : filter.info.name,
					metrics : cell.map(function(c) { return { value: +c.val }; }),
					category : filter.info.category || (def && def['var']) || undefined,
					filtervar : def && def['var'] || undefined,
					children : []
				};
				// add original name
				if (filter.info.orig_name) {
					partition.orig_name = filter.info.orig_name;
				}

				// update min/max for metrics
				cell.forEach(function(c, i) {
					var m = data.metrics[i];
					// metric min/max
					m.min = ('undefined' !== typeof m.min) ? Math.min(m.min, +c.val) : +c.val;
					m.max = ('undefined' !== typeof m.max) ? Math.max(m.max, +c.val) : +c.val;
					// metric & level min/max
					var catLevel;
					if (!(catLevel = m.categories[level])) { m.categories[level] = { min: +c.val, max: +c.val }; }
					else {
						catLevel.min = Math.min(catLevel.min, +c.val);
						catLevel.max = Math.max(catLevel.max, +c.val);
					}
				});

				if (parent_pid && (parent_partition = partitionById[parent_pid])) {
					parent_partition.children.push(partition);
				} else if (!pFilters.length){ // right under metric
					data.children.push(partition);
				} else {
					// else its parent was invalid, like a undefined filter that was removed
					// don't add category and don't add the partition to the list
					return;
				}
				// update categories
				partitionById[partition.pid] = partition;
				data.categories[level] = { name: filter.info.category || (def && def['var']) || data.categories[level] };
			});
		}
		processedOptions.data = data;

		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions, prevOptions);
	};

	adapter._validateData = function(data) {
		if (!data) { return false; }
		for (var key in data) {
			if (data[key].length) { return true; }
		}
		return false;
	};

	adapter.getPathKey = function(d, i) {
		if (!d || !d._sid) { return 0; } // invalid
		if (!d.pid) { return d._sid; } // fallback for other and center
		return d.pid;
	};

	rsAdapters.sunburst = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

	var cloudViz = global.cloudViz,
		rsAdapters = cloudViz.util.namespace('cloudViz.dataAdapter.rs'),
		adapter = Object.create(cloudViz.dataAdapter.standard.flowerObj);

	adapter._processOptions = function(options, changedOptions) {
		// Make a copy of the options.
		var processedOptions = this._processedOptions = Object.create(options);
		processedOptions.data = this._parseData(options.data);
		Object.getPrototypeOf(adapter)._processOptions.call(this, processedOptions, changedOptions);
	};

	adapter._parseData = function(data){
		if(!data.metric.length){return [];}
		var result = [],
		    metric_id = data.metric[0].id;

		dv.util.each(data.metric, function(o,k){
			if(o.id != metric_id) {return;}
			var filter_name = data.filter[k].info.name;
			var value = data.value[k];
			result.push({index: filter_name.toLowerCase(), label: filter_name, value:value});
		});
		return result;
	};

	adapter.formats = function() {
		return this._processedOptions.formats;
	};

	rsAdapters.flower = cloudViz.util.createConstructor(adapter);
}(this));
(function(global) {
	'use strict';

global.cloudViz.localeDefinition('de-DE', {
    "monthAbbreviations": [
        "Jan",
        "Feb",
        "März",
        "Apr",
        "Mai",
        "Juni",
        "Juli",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
    ],
    "months": [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ],
    "weekdayAbbreviations": [
        "So",
        "Mo",
        "Di",
        "Mi",
        "Do",
        "Fr",
        "Sa"
    ],
    "weekdays": [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
    ],
    "ampm": [
        "AM",
        "PM"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('de-DE', {
    "core": {
        "nodata": "Das Diagramm enthält keine Daten.",
        "erroronrender": "Hoppla! Ein Fehler ist aufgetreten und das Diagramm konnte nicht gerendert werden.",
        "other": "Sonstige",
        "normalized": "Normalisiert"
    },
    "dvcore": {
        "target": "Zielgruppe",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} (in {time})",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "Größe"
    },
    "pathing": {
        "entry": "Einstieg",
        "exit": "Ausstieg",
        "entry2+": "Einstiege",
        "exit2+": "Ausstiege",
        "path": "Pfad",
        "path2+": "Pfade",
        "expand": "Erweitern",
        "focus": "Fokus",
        "collapse": "Reduzieren",
        "title": "Pfaderstellungs-diagramm",
        "nodeEntries": "Einstiege für {label}",
        "nodeExits": "Ausstiege für {label}",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} von {label}",
        "pathToNode": "{path} zu {label}",
        "pathFromNode": "{path} aus {label}",
        "help1": "Dieses Diagramm stellt Pfade dar, die von einem Status in einen anderen übernommen wurden.",
        "help2": "Jeder Knoten in Form eines Feldes repräsentiert einen Status im Pfad.",
        "help3": "Durch Tippen oder Klicken auf einen Knoten werden zusätzliche Optionen zum Ändern des Diagramms angezeigt:",
        "focusHelp": "Zeigt Pfade an, die am Knoten ein- oder ausgehen.",
        "expandHelp": "Zeigt zusätzliche Pfade an, die am Knoten ein- oder ausgehen.",
        "collapseHelp": "Entfernt Pfade, die am Knoten ein- oder ausgehen."
    },
    "sunburst": {
        "audience": "Zielgruppe",
        "audience2+": "Zielgruppen",
        "category": "Kategorie",
        "category2+": "Kategorien",
        "metric": "Metrik",
        "metric2+": "Metriken",
        "primarymetric": "Primäre Metrik",
        "secondarymetric": "Sekundäre Metrik",
        "secondarymetric2+": "Sekundäre Metriken",
        "secondarymetrichelp": "Klicken Sie auf die Metrik, um die Höhe zu ändern.",
        "secondarymetrichelp2+": "Klicken Sie auf die Metriken, um die Höhe zu ändern.",
        "emptyFirstMetric": "Die erste Metrik enthält keine Werte. Wählen Sie eine andere Metrik.",
        "total": "Gesamt",
        "zoomAction": "Doppelklicken, um zu vergrößern.",
        "moreAction": "Klicken Sie hier für weitere Optionen.",
        "zoomin": "Nahansicht",
        "zoomout": "Weitansicht",
        "hide": "Ausblenden",
        "hideall": "Alles ausblenden",
        "hideother": "Sonstige ausblenden",
        "hidden": "{value} verborgenes Element",
        "hidden2+": "{value} verborgene Elemente",
        "topresults": "Top {value}",
        "color": "Farbe",
        "height": "Höhe",
        "both": "Beide",
        "none": "Keine",
        "mapmetric": "{metric} anzeigen als:",
        "percmetric": "{percent} der {metric}",
        "mobilescroll": "&#x25BC – scrollen Sie, um Details anzuzeigen."
    },
    "flower": {
        "joy": "Freude",
        "admiration": "Bewunderung",
        "fear": "Angst",
        "surprise": "Überraschung",
        "sadness": "Traurigkeit",
        "disgust": "Empörung",
        "anger": "Wut",
        "anticipation": "Vorausschätzung"
    },
    "venn": {
        "definedAudience": "Definierte Zielgruppe"
    }
}, 'labels');

global.cloudViz.localeDefinition('de-DE', {
    "shortFormat": {
        "hour": "%H",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%H",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%H Uhr %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%H Uhr %a %e"
    },
    "fullFormat": {
        "hour": "%H Uhr %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B %Y",
        "quarter": "%B %Y",
        "year": "%Y",
        "fallback": "%e %b, %Y",
        "condensed": "%d/%m/%Y"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('de-DE', {
    "decimalSeparator": ",",
    "groupSeparator": " ",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    },
    "currency": {
        "symbol": "€",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('de-DE', {
    "singular": {
        "second": "Sekunde",
        "minute": "Minute",
        "hour": "Stunde",
        "day": "Tag",
        "week": "Woche",
        "month": "Monat",
        "year": "Jahr"
    },
    "plural": {
        "second": "Sekunden",
        "minute": "Minuten",
        "hour": "Stunden",
        "day": "Tagen",
        "week": "Wochen",
        "month": "Monate",
        "year": "Jahre"
    },
    "abbreviation": {
        "second": "s",
        "minute": "min",
        "hour": "h",
        "day": "d",
        "week": "w",
        "month": "mon",
        "year": "y"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('en-US', {
	"monthAbbreviations": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	"months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	"weekdayAbbreviations": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"weekdays": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	"ampm": ["AM", "PM"]
}, 'calendar');

global.cloudViz.localeDefinition('en-US', {
	"core": {
		"nodata": "The chart has no data",
		"erroronrender": "Oops! There was an error and the chart could not be rendered.",
		"other": "Other",
		"normalized": "Normalized"
	},
	"dvcore": {
		"target": "Target",
		"yAxisTimeNoTitle": "{time}",
		"yAxisTimeWithTitle": "{title} (in {time})",
		"legendTime": "{value} {time}"
	},
	"point": {
		"xScale": "X",
		"yScale": "Y",
		"sizeScale": "Size"
	},
	"pathing": {
		"entry": "Entry",
		"exit": "Exit",
		"entry2+": "Entries",
		"exit2+": "Exits",
		"path": "Path",
		"path2+": "Paths",
		"expand": "Expand",
		"focus": "Focus",
		"collapse": "Collapse",
		"title": "Pathing Chart",
		"nodeEntries": "{label} Entries",
		"nodeExits": "{label} Exits",
		"nodeToNode": "{source} \u2192 {target}",
		"percOfNode": "{perc} of {label}",
		"pathToNode": "{path} to {label}",
		"pathFromNode": "{path} from {label}",
		"help1": "This chart represents paths taken from one state to another.",
		"help2": "Each node, shaped as a box, represents a state in the path.",
		"help3": "Tapping or clicking a node will provide additional options to modify the chart:",
		"focusHelp": "Shows paths coming into and going out of node",
		"expandHelp": "Shows additional paths coming or going from the node",
		"collapseHelp": "Removes paths coming or going from the node"
	},
	"sunburst": {
		"audience": "Audience",
		"audience2+": "Audiences",
		"category": "Category",
		"category2+": "Categories",
		"metric": "Metric",
		"metric2+": "Metrics",
		"primarymetric": "Primary Metric",
		"secondarymetric": "Secondary Metric",
		"secondarymetric2+": "Secondary Metrics",
		"secondarymetrichelp": "Click metric to toggle height",
		"secondarymetrichelp2+": "Click metrics to toggle height",
		"emptyFirstMetric": "The first metric has no values. Please pick a different metric.",
		"total": "Total",
		"zoomAction": "Double-click to Zoom in.",
		"moreAction": "Click for more options.",
		"zoomin": "Zoom In",
		"zoomout": "Zoom Out",
		"hide": "Hide",
		"hideall": "Hide All",
		"hideother": "Hide Other",
		"hidden": "{value} Hidden Item",
		"hidden2+": "{value} Hidden Items",
		"topresults": "top {value}",
		"color": "Color",
		"height": "Height",
		"both": "Both",
		"none": "None",
		"mapmetric": "Show {metric} as:",
		"percmetric": "{percent} of {metric}",
		"mobilescroll": "&#x25BC scroll for details"
	},
	"flower": {
		"joy": "Joy",
		"admiration": "Admiration",
		"fear": "Fear",
		"surprise": "Surprise",
		"sadness": "Sadness",
		"disgust": "Disgust",
		"anger": "Anger",
		"anticipation": "Anticipation"
	},
	"venn": {
		"definedAudience": "Defined Audience"
	}
}, 'labels');

global.cloudViz.localeDefinition('en-US', {
	"shortFormat" : {
		"hour": "%I %p",
		"day": "%e",
		"week": "%e",
		"month": "%b",
		"quarter": "%b",
		"year": "%Y",
		"fallback": "%e"
	},
	"mediumFormat" : {
		"hour": "%I %p",
		"day": "%a %e",
		"week": "%a %e",
		"month": "%b",
		"quarter": "%b",
		"year": "%Y",
		"fallback": "%a %e"
	},
	"longFormat" : {
		"hour": "%I %p %a %e",
		"day": "%A %e",
		"week": "%A %e",
		"month": "%B",
		"quarter": "%B",
		"year": "%Y",
		"fallback": "%I %p %a %e"
	},
	"fullFormat" : {
		"hour": "%I %p %a %e",
		"day": "%A %e",
		"week": "%A %e",
		"month": "%B %Y",
		"quarter": "%B %Y",
		"year": "%Y",
		"fallback": "%b %e, %Y",
		"condensed": "%m/%d/%Y"
	}
}, 'dateFormat');

global.cloudViz.localeDefinition('en-US', {
	"decimalSeparator": ".",
	"groupSeparator": ",",
	"negativePattern": "-{number}",
	"percent": {
		"symbol": "%",
		"positivePattern": "{number}{symbol}",
		"negativePattern": "-{number}{symbol}"
	},
	"currency": {
		"symbol": "$",
		"positivePattern": "{symbol}{number}",
		"negativePattern": "-{symbol}{number}"
	}
}, 'numberFormat');

global.cloudViz.localeDefinition('en-US', {
	"singular" : {
		"second" : "second",
		"minute" : "minute",
		"hour" : "hour",
		"day" : "day",
		"week" : "week",
		"month" : "month",
		"year" : "year"
	},
	"plural" : {
		"second" : "seconds",
		"minute" : "minutes",
		"hour" : "hours",
		"day" : "days",
		"week" : "weeks",
		"month" : "months",
		"year" : "years"
	},
	"abbreviation" : {
		"second" : "s",
		"minute" : "min",
		"hour" : "h",
		"day" : "d",
		"week" : "w",
		"month" : "mon",
		"year" : "y"
	}
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('es-ES', {
    "monthAbbreviations": [
        "en.",
        "febr.",
        "mzo.",
        "abr.",
        "my.",
        "jun.",
        "jul.",
        "ag.",
        "sept.",
        "oct.",
        "nov.",
        "dic."
    ],
    "months": [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre"
    ],
    "weekdayAbbreviations": [
        "dom.",
        "lun.",
        "mart.",
        "miérc.",
        "juev.",
        "vier.",
        "sáb."
    ],
    "weekdays": [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"
    ],
    "ampm": [
        "a. m.",
        "p. m."
    ]
}, 'calendar');

global.cloudViz.localeDefinition('es-ES', {
    "core": {
        "nodata": "El gráfico no contiene datos",
        "erroronrender": "Se ha producido un error y no se ha podido procesar el gráfico.",
        "other": "Otro",
        "normalized": "Normalizado"
    },
    "dvcore": {
        "target": "Destino",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} (en {time})",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "Tamaño"
    },
    "pathing": {
        "entry": "Entrada",
        "exit": "Salida",
        "entry2+": "Entradas",
        "exit2+": "Salidas",
        "path": "Ruta",
        "path2+": "Rutas",
        "expand": "Expandir",
        "focus": "Enfoque",
        "collapse": "Contraer",
        "title": "Gráfico de ruta",
        "nodeEntries": "Entradas de {label}",
        "nodeExits": "Salidas de {label}",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} de {label}",
        "pathToNode": "{path} a {label}",
        "pathFromNode": "{path} de {label}",
        "help1": "Este gráfico representa las rutas que se pueden tomar para ir de un estado a otro.",
        "help2": "Los nodos, con forma de caja, representan un estado en la ruta.",
        "help3": "Al hacer clic o tocar un nodo, se mostrarán opciones adicionales para modificar el gráfico:",
        "focusHelp": "Muestra las rutas de ida al nodo o de vuelta",
        "expandHelp": "Muestra rutas adicionales de ida al nodo o de vuelta",
        "collapseHelp": "Suprime las rutas de ida al nodo o de vuelta"
    },
    "sunburst": {
        "audience": "Audiencia",
        "audience2+": "Audiencias",
        "category": "Categoría",
        "category2+": "Categorías",
        "metric": "Métrica",
        "metric2+": "Métrica",
        "primarymetric": "Métrica principal",
        "secondarymetric": "Métrica secundaria",
        "secondarymetric2+": "Métricas secundarias",
        "secondarymetrichelp": "Haga clic en la métrica para alternar la altura",
        "secondarymetrichelp2+": "Haga clic en las métricas para alternar la altura",
        "emptyFirstMetric": "La primera métrica no contiene ningún valor. Elija otra métrica.",
        "total": "Total",
        "zoomAction": "Doble clic para aumentar.",
        "moreAction": "Haga clic para ver más opciones.",
        "zoomin": "Acercar",
        "zoomout": "Alejar",
        "hide": "Ocultar",
        "hideall": "Ocultar todo",
        "hideother": "Ocultar otro",
        "hidden": "{value} elemento oculto",
        "hidden2+": "{value} elementos ocultos",
        "topresults": "{value} principales",
        "color": "Color",
        "height": "Altura",
        "both": "Ambos",
        "none": "Ninguno",
        "mapmetric": "Mostrar {metric} como:",
        "percmetric": "{percent} de {metric}",
        "mobilescroll": "&#x25BC desplácese para más detalles"
    },
    "flower": {
        "joy": "Alegría",
        "admiration": "Admiración",
        "fear": "Miedo",
        "surprise": "Sorpresa",
        "sadness": "Tristeza",
        "disgust": "Desagrado",
        "anger": "Enfado",
        "anticipation": "Expectación"
    },
    "venn": {
        "definedAudience": "Audiencia definida"
    }
}, 'labels');

global.cloudViz.localeDefinition('es-ES', {
    "shortFormat": {
        "hour": "%H",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%H",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%Hh %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%Hh %a %e"
    },
    "fullFormat": {
        "hour": "%Hh %I %p",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B %Y",
        "quarter": "%B %Y",
        "year": "%Y",
        "fallback": "%e %b, %Y",
        "condensed": "%d/%m/%Y"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('es-ES', {
    "decimalSeparator": ",",
    "groupSeparator": " ",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    },
    "currency": {
        "symbol": "€",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('es-ES', {
    "singular": {
        "second": "segundo",
        "minute": "minuto",
        "hour": "hora",
        "day": "día",
        "week": "semana",
        "month": "mes",
        "year": "año"
    },
    "plural": {
        "second": "segundos",
        "minute": "minutos",
        "hour": "horas",
        "day": "días",
        "week": "semanas",
        "month": "meses",
        "year": "años"
    },
    "abbreviation": {
        "second": "s",
        "minute": "min",
        "hour": "h",
        "day": "d",
        "week": "w",
        "month": "mon",
        "year": "y"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('fr-FR', {
    "monthAbbreviations": [
        "Janv.",
        "Févr.",
        "Mars",
        "Avr.",
        "Mai",
        "Juin",
        "Juill.",
        "Août",
        "Sept.",
        "Oct.",
        "Nov.",
        "Déc."
    ],
    "months": [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre"
    ],
    "weekdayAbbreviations": [
        "Dim.",
        "Lun.",
        "Mar.",
        "Mer.",
        "Jeu.",
        "Ven.",
        "Sam."
    ],
    "weekdays": [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi"
    ],
    "ampm": [
        "AM",
        "PM"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('fr-FR', {
    "core": {
        "nodata": "Le graphique ne contient aucune donnée",
        "erroronrender": "Une erreur s’est produite, impossible de restituer le graphique.",
        "other": "Autre",
        "normalized": "Normalisé"
    },
    "dvcore": {
        "target": "Cible",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} (en {time})",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "Taille"
    },
    "pathing": {
        "entry": "Entrée",
        "exit": "Sortie",
        "entry2+": "Entrées de",
        "exit2+": "Sorties de",
        "path": "Chemin d’accès",
        "path2+": "Chemins d’accès",
        "expand": "Développer",
        "focus": "Mise au point",
        "collapse": "Réduire",
        "title": "Graphique du cheminement",
        "nodeEntries": "Entrées {label}",
        "nodeExits": "Sorties {label}",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} de {label}",
        "pathToNode": "{path} à {label}",
        "pathFromNode": "{path} de {label}",
        "help1": "Ce graphique représente les chemins d’accès récupérés d’un état à un autre.",
        "help2": "Chaque nœud, en forme de cadre, représente un état dans le chemin d’accès.",
        "help3": "Le fait d’appuyer ou de cliquer sur un nœud fournit d’autres options pour modifier le graphique :",
        "focusHelp": "Présente les chemins d’accès issus du nœud ou y parvenant",
        "expandHelp": "Présente des chemins d’accès supplémentaires issus du nœud ou y parvenant.",
        "collapseHelp": "Supprime les chemins d’accès supplémentaires issus du nœud ou y parvenant."
    },
    "sunburst": {
        "audience": "Audience",
        "audience2+": "Audiences",
        "category": "Catégorie",
        "category2+": "Catégories",
        "metric": "Mesure",
        "metric2+": "Mesures",
        "primarymetric": "Mesure principale",
        "secondarymetric": "Mesure secondaire",
        "secondarymetric2+": "Mesures secondaires",
        "secondarymetrichelp": "Cliquer sur une mesure pour activer/désactiver la hauteur",
        "secondarymetrichelp2+": "Cliquer sur des mesures pour activer/désactiver la hauteur",
        "emptyFirstMetric": "La première mesure n’a aucune valeur. Sélectionnez une autre mesure.",
        "total": "Total",
        "zoomAction": "Double-cliquez pour effectuer un zoom avant.",
        "moreAction": "Cliquez pour plus d’options.",
        "zoomin": "Zoom avant",
        "zoomout": "Zoom arrière",
        "hide": "Masquer",
        "hideall": "Tout masquer",
        "hideother": "Masquer autres",
        "hidden": "{value} élément masqué",
        "hidden2+": "{value} éléments masqués",
        "topresults": "{value} premiers",
        "color": "Couleur",
        "height": "Hauteur",
        "both": "Les deux",
        "none": "Néant",
        "mapmetric": "Afficher {metric} comme :",
        "percmetric": "{percent} des {metric}",
        "mobilescroll": "Défilement &#x25BC pour plus de détails"
    },
    "flower": {
        "joy": "Joie",
        "admiration": "Admiration",
        "fear": "Peur",
        "surprise": "Surprise",
        "sadness": "Tristesse",
        "disgust": "Dégoût",
        "anger": "Colère",
        "anticipation": "Anticipation"
    },
    "venn": {
        "definedAudience": "Audience définie"
    }
}, 'labels');

global.cloudViz.localeDefinition('fr-FR', {
    "shortFormat": {
        "hour": "%H",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%H",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%H h %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%H h %a %e"
    },
    "fullFormat": {
        "hour": "%H h %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B %Y",
        "quarter": "%B %Y",
        "year": "%Y",
        "fallback": "%e %b %Y",
        "condensed": "%d/%m/%Y"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('fr-FR', {
    "decimalSeparator": ",",
    "groupSeparator": " ",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    },
    "currency": {
        "symbol": "€",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('fr-FR', {
    "singular": {
        "second": "seconde",
        "minute": "minute",
        "hour": "heure",
        "day": "jour",
        "week": "semaine",
        "month": "mois",
        "year": "année"
    },
    "plural": {
        "second": "secondes",
        "minute": "minutes",
        "hour": "heures",
        "day": "jours",
        "week": "semaines",
        "month": "mois",
        "year": "années"
    },
    "abbreviation": {
        "second": "s",
        "minute": "min",
        "hour": "h",
        "day": "d",
        "week": "w",
        "month": "mon",
        "year": "y"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('ja-JP', {
    "monthAbbreviations": [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月"
    ],
    "months": [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月"
    ],
    "weekdayAbbreviations": [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ],
    "weekdays": [
        "日曜日",
        "月曜日",
        "火曜日",
        "水曜日",
        "木曜日",
        "金曜日",
        "土曜日"
    ],
    "ampm": [
        "午前",
        "午後"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('ja-JP', {
    "core": {
        "nodata": "データがありません",
        "erroronrender": "エラーのためチャートを作成できません",
        "other": "その他",
        "normalized": "正規化済み"
    },
    "dvcore": {
        "target": "Target",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} ({time})",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "Size"
    },
    "pathing": {
        "entry": "入口",
        "exit": "出口",
        "entry2+": "入口",
        "exit2+": "出口",
        "path": "パス内訳",
        "path2+": "パス内訳",
        "expand": "展開する",
        "focus": "再スタート",
        "collapse": "減らす",
        "title": "遷移チャート",
        "nodeEntries": "{label} 入口",
        "nodeExits": "{label} 出口",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{label}の{perc}",
        "pathToNode": "{label}への{path}",
        "pathFromNode": "{label}からの{path}",
        "help1": "流れ（パス）を現すチャートです。",
        "help2": "四角形のノードがデータ項目です。",
        "help3": "ノードをクリック（タップ）すると、以下のようなチャート設定用アイコンが表示されます：",
        "focusHelp": "画面をクリアし、該当ノードの前後のパスのみを表示",
        "expandHelp": "該当ノードの前後のパスをさらに表示",
        "collapseHelp": "展開したパスを元に戻す"
    },
    "sunburst": {
        "audience": "オーディエンス",
        "audience2+": "オーディエンス",
        "category": "カテゴリ",
        "category2+": "カテゴリ",
        "metric": "指標",
        "metric2+": "指標",
        "primarymetric": "一次指標",
        "secondarymetric": "二次指標",
        "secondarymetric2+": "二次指標",
        "secondarymetrichelp": "指標をクリックすると高さが変わる",
        "secondarymetrichelp2+": "指標をクリックすると高さが変わる",
        "emptyFirstMetric": "最も内側の円となる最初の指標のデータが存在しないため、チャートを描画できません。",
        "total": "合計",
        "zoomAction": "ダブルクリックでズームイン",
        "moreAction": "クリックで選択肢を表示",
        "zoomin": "ズームイン",
        "zoomout": "ズームアウト",
        "hide": "選択項目のみ除外",
        "hideall": "全体から同じ項目を除外",
        "hideother": "この項目以外を除外",
        "hidden": "{value} 個の項目を除外中",
        "hidden2+": "{value} 個の項目を除外中",
        "topresults": "上位{value}件",
        "color": "色",
        "height": "高さ",
        "both": "両方",
        "none": "なし",
        "mapmetric": "{metric}の表示方法:",
        "percmetric": "{metric}の{percent}",
        "mobilescroll": "&#x25BC スクロールして詳細を表示"
    },
    "flower": {
        "joy": "喜び",
        "admiration": "賞賛",
        "fear": "恐怖",
        "surprise": "驚き",
        "sadness": "悲しみ",
        "disgust": "不快",
        "anger": "怒り",
        "anticipation": "予測"
    },
    "venn": {
        "definedAudience": "定義されたオーディエンス"
    }
}, 'labels');

global.cloudViz.localeDefinition('ja-JP', {
    "shortFormat": {
        "hour": "%p %I 時",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%p %I 時",
        "day": "%e 日 (%a)",
        "week": "%e 日 (%a)",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e 日 (%a)"
    },
    "longFormat": {
        "hour": "%e 日 (%a) %p %I 時",
        "day": "%e 日 (%a)",
        "week": "%e 日 (%a)",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%e 日 (%a) %p %I 時"
    },
    "fullFormat": {
        "hour": "%e 日 (%a) %p %I 時",
        "day": "%e 日 (%a)",
        "week": "%e 日 (%a)",
        "month": "%Y 年 %B",
        "quarter": "%Y 年 %B",
        "year": "%Y",
        "fallback": "%Y 年 %b %e 日",
        "condensed": "%Y/%m/%d"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('ja-JP', {
    "decimalSeparator": ".",
    "groupSeparator": ",",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number}{symbol}",
        "negativePattern": "-{number}{symbol}"
    },
    "currency": {
        "symbol": "¥",
        "positivePattern": "{symbol}{number}",
        "negativePattern": "-{symbol}{number}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('ja-JP', {
    "singular": {
        "second": "秒",
        "minute": "分",
        "hour": "時間",
        "day": "日",
        "week": "週間",
        "month": "か月",
        "year": "年"
    },
    "plural": {
        "second": "秒",
        "minute": "分",
        "hour": "時間",
        "day": "日",
        "week": "週間",
        "month": "か月",
        "year": "年"
    },
    "abbreviation": {
        "second": "秒",
        "minute": "分",
        "hour": "時間",
        "day": "日",
        "week": "週間",
        "month": "か月",
        "year": "年"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('ko-KR', {
    "monthAbbreviations": [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월"
    ],
    "months": [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월"
    ],
    "weekdayAbbreviations": [
        "일",
        "월",
        "화",
        "수",
        "목",
        "금",
        "토"
    ],
    "weekdays": [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일"
    ],
    "ampm": [
        "오전",
        "오후"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('ko-KR', {
    "core": {
        "nodata": "차트에 데이터가 없습니다.",
        "erroronrender": "오류가 발생하여 차트를 렌더링할 수 없습니다.",
        "other": "기타",
        "normalized": "정규화됨"
    },
    "dvcore": {
        "target": "목표",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title}({time})",
        "legendTime": "{value}{time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "크기"
    },
    "pathing": {
        "entry": "시작",
        "exit": "종료",
        "entry2+": "시작",
        "exit2+": "종료",
        "path": "경로",
        "path2+": "경로",
        "expand": "확장",
        "focus": "포커스",
        "collapse": "축소",
        "title": "경로 지정 차트",
        "nodeEntries": "{label} 시작",
        "nodeExits": "{label} 종료",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{label}의 {perc}",
        "pathToNode": "{label} 나가는 {path}",
        "pathFromNode": "{label} 들어오는 {path}",
        "help1": "이 차트는 하나의 주에서 다른 주로 가져온 경로를 나타냅니다.",
        "help2": "상자 모양의 노드는 각각 경로 내의 주를 나타냅니다.",
        "help3": "노드를 누르거나 클릭하면 차트를 수정할 추가 옵션을 설정할 수 있습니다.",
        "focusHelp": "노드에 들어오거나 나가는 경로 표시",
        "expandHelp": "노드에 들어오거나 나가는 추가 경로 표시",
        "collapseHelp": "노드에 들어오거나 나가는 경로 제거"
    },
    "sunburst": {
        "audience": "대상",
        "audience2+": "대상",
        "category": "카테고리",
        "category2+": "카테고리",
        "metric": "지표",
        "metric2+": "지표",
        "primarymetric": "기본 지표",
        "secondarymetric": "보조 지표",
        "secondarymetric2+": "보조 지표",
        "secondarymetrichelp": "지표를 클릭하여 높이 전환",
        "secondarymetrichelp2+": "지표를 클릭하여 높이 전환",
        "emptyFirstMetric": "첫 번째 지표에 값이 없습니다. 다른 지표를 선택하십시오.",
        "total": "합계",
        "zoomAction": "확대하려면 두 번 클릭하십시오.",
        "moreAction": "추가 옵션을 보려면 클릭하십시오.",
        "zoomin": "확대",
        "zoomout": "축소",
        "hide": "숨김",
        "hideall": "모두 숨기기",
        "hideother": "나머지 숨기기",
        "hidden": "{value}개의 숨긴 항목",
        "hidden2+": "{value}개의 숨긴 항목",
        "topresults": "상위 {value}개",
        "color": "색상",
        "height": "높이",
        "both": "둘 다",
        "none": "없음",
        "mapmetric": "{metric} 다음으로 표시:",
        "percmetric": "{metric} 수의 {percent} ",
        "mobilescroll": "&#x25BC 자세한 내용을 보려면 스크롤하십시오."
    },
    "flower": {
        "joy": "기쁨",
        "admiration": "감탄",
        "fear": "두려움",
        "surprise": "놀람",
        "sadness": "슬픔",
        "disgust": "혐오",
        "anger": "분노",
        "anticipation": "기대"
    },
    "venn": {
        "definedAudience": "정의된 대상"
    }
}, 'labels');

global.cloudViz.localeDefinition('ko-KR', {
    "shortFormat": {
        "hour": "%p %I",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%p %I",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%e일 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%e일 %a %p %I"
    },
    "fullFormat": {
        "hour": "%e일 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%Y 년 %B",
        "quarter": "%Y %B",
        "year": "%Y",
        "fallback": "%Y %b %e일",
        "condensed": "%Y/%m/%d"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('ko-KR', {
    "decimalSeparator": ".",
    "groupSeparator": ",",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number}{symbol}",
        "negativePattern": "-{number}{symbol}"
    },
    "currency": {
        "symbol": "₩",
        "positivePattern": "{symbol}{number}",
        "negativePattern": "-{symbol}{number}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('ko-KR', {
    "singular": {
        "second": "초",
        "minute": "분",
        "hour": "시간",
        "day": "일",
        "week": "주",
        "month": "월",
        "year": "년"
    },
    "plural": {
        "second": "초",
        "minute": "분",
        "hour": "시간",
        "day": "일",
        "week": "주",
        "month": "월",
        "year": "년"
    },
    "abbreviation": {
        "second": "초",
        "minute": "분",
        "hour": "시간",
        "day": "일",
        "week": "주",
        "month": "월",
        "year": "년"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('pt-BR', {
    "monthAbbreviations": [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez"
    ],
    "months": [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ],
    "weekdayAbbreviations": [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
    ],
    "weekdays": [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado"
    ],
    "ampm": [
        "AM",
        "PM"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('pt-BR', {
    "core": {
        "nodata": "O gráfico não possui dados",
        "erroronrender": "Ops! Houve um erro e o gráfico não pôde ser processado.",
        "other": "Outro",
        "normalized": "Normalizado"
    },
    "dvcore": {
        "target": "Meta",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} (em {time})",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "Tamanho"
    },
    "pathing": {
        "entry": "Entrada",
        "exit": "Sair",
        "entry2+": "Entradas",
        "exit2+": "Saídas",
        "path": "Caminho",
        "path2+": "Caminhos",
        "expand": "Expandir",
        "focus": "Foco",
        "collapse": "Recolher",
        "title": "Gráfico de criação de caminho",
        "nodeEntries": "{label} Entradas",
        "nodeExits": "{label} Saídas",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} de {label}",
        "pathToNode": "{path} para {label}",
        "pathFromNode": "{path} de {label}",
        "help1": "Esse gráfico representa os caminhos tomados de um estado para outro.",
        "help2": "Cada nó, formado como uma caixa representa um estado no caminho.",
        "help3": "Tocar ou clicar em um nó fornecerá opções adicionais para modificar o gráfico:",
        "focusHelp": "Mostra os caminhos entrando ou saindo do nó",
        "expandHelp": "Mostra caminhos adicionais entrando ou saindo do nó",
        "collapseHelp": "Remove os caminhos saindo ou entrando no nó"
    },
    "sunburst": {
        "audience": "Público-alvo",
        "audience2+": "Públicos-alvos",
        "category": "Categoria",
        "category2+": "Categorias",
        "metric": "Métrica",
        "metric2+": "Métricas",
        "primarymetric": "Métrica principal",
        "secondarymetric": "Métrica secundária",
        "secondarymetric2+": "Métricas secundárias",
        "secondarymetrichelp": "Clique na métrica para alternar a altura",
        "secondarymetrichelp2+": "Clique nas métricas para alternar a altura",
        "emptyFirstMetric": "A primeira métrica não tem valores. Esolha uma métrica diferente.",
        "total": "Total",
        "zoomAction": "Clique duas vezes para aumentar o zoom.",
        "moreAction": "Clique para ver mais opções.",
        "zoomin": "Ampliar",
        "zoomout": "Reduzir",
        "hide": "Ocultar",
        "hideall": "Ocultar tudo",
        "hideother": "Ocultar outro",
        "hidden": "{value} Item oculto",
        "hidden2+": "{value} itens ocultos",
        "topresults": "principais {value}",
        "color": "Cor",
        "height": "Altura",
        "both": "Ambos",
        "none": "Nenhum",
        "mapmetric": "Mostrar {metric} como:",
        "percmetric": "{percent} de {metric}",
        "mobilescroll": "&#x25BC role para ver os detalhes"
    },
    "flower": {
        "joy": "Alegria",
        "admiration": "Admiração",
        "fear": "Medo",
        "surprise": "Problemas",
        "sadness": "Tristeza",
        "disgust": "Repulsa",
        "anger": "Raiva",
        "anticipation": "Antecipação"
    },
    "venn": {
        "definedAudience": "Público-alvo definido"
    }
}, 'labels');

global.cloudViz.localeDefinition('pt-BR', {
    "shortFormat": {
        "hour": "%H",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%H",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%Hh %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%Hh %a %e"
    },
    "fullFormat": {
        "hour": "%Hh %a %e",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B %Y",
        "quarter": "%B %Y",
        "year": "%Y",
        "fallback": "%e %b, %Y",
        "condensed": "%Y/%m/%d"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('pt-BR', {
    "decimalSeparator": ",",
    "groupSeparator": " ",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    },
    "currency": {
        "symbol": "R$",
        "positivePattern": "{number} {symbol}",
        "negativePattern": "-{number} {symbol}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('pt-BR', {
    "singular": {
        "second": "segundo",
        "minute": "minuto",
        "hour": "hora",
        "day": "día",
        "week": "semana",
        "month": "mês",
        "year": "ano"
    },
    "plural": {
        "second": "segundos",
        "minute": "minutos",
        "hour": "horas",
        "day": "dias",
        "week": "semanas",
        "month": "meses",
        "year": "anos"
    },
    "abbreviation": {
        "second": "s",
        "minute": "min",
        "hour": "h",
        "day": "d",
        "week": "w",
        "month": "mon",
        "year": "y"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('zh-CN', {
    "monthAbbreviations": [
        "1 月",
        "2 月",
        "3 月",
        "4 月",
        "5 月",
        "6 月",
        "7 月",
        "8 月",
        "9 月",
        "10 月",
        "11 月",
        "12 月"
    ],
    "months": [
        "1 月",
        "2 月",
        "3 月",
        "4 月",
        "5 月",
        "6 月",
        "7 月",
        "8 月",
        "9 月",
        "10 月",
        "11 月",
        "12 月"
    ],
    "weekdayAbbreviations": [
        "周日",
        "周一",
        "周二",
        "周三",
        "周四",
        "周五",
        "周六"
    ],
    "weekdays": [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ],
    "ampm": [
        "上午",
        "下午"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('zh-CN', {
    "core": {
        "nodata": "图表无数据",
        "erroronrender": "抱歉！出现错误，无法呈现图表。",
        "other": "其他",
        "normalized": "已标准化"
    },
    "dvcore": {
        "target": "目标",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title}（{time}）",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "大小"
    },
    "pathing": {
        "entry": "登入",
        "exit": "退出",
        "entry2+": "登入",
        "exit2+": "退出",
        "path": "路径",
        "path2+": "路径",
        "expand": "展开",
        "focus": "聚焦",
        "collapse": "折叠",
        "title": "路径图表",
        "nodeEntries": "{label} 登入",
        "nodeExits": "{label} 退出",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} 的 {label}",
        "pathToNode": "前往 {label} 的 {path}",
        "pathFromNode": "来自 {label} 的 {path}",
        "help1": "此图表代表从一种状态转变为另一种状态的路径。",
        "help2": "每个长方形节点代表路径中的一种状态。",
        "help3": "轻按或单击节点可以提供修改图表的其他选项：",
        "focusHelp": "显示来往于节点的路径",
        "expandHelp": "显示来往于节点的其他路径",
        "collapseHelp": "删除来往于节点的路径"
    },
    "sunburst": {
        "audience": "受众",
        "audience2+": "受众",
        "category": "类别",
        "category2+": "类别",
        "metric": "量度",
        "metric2+": "量度",
        "primarymetric": "主要量度",
        "secondarymetric": "次要量度",
        "secondarymetric2+": "次要量度",
        "secondarymetrichelp": "单击量度可切换高度",
        "secondarymetrichelp2+": "单击量度可切换高度",
        "emptyFirstMetric": "第一个量度没有值。请选择其他量度。",
        "total": "合计",
        "zoomAction": "双击可放大。",
        "moreAction": "单击可获取更多选项。",
        "zoomin": "放大",
        "zoomout": "缩小",
        "hide": "隐藏",
        "hideall": "全部隐藏",
        "hideother": "隐藏其他",
        "hidden": "{value} 个隐藏的条目",
        "hidden2+": "{value} 个隐藏的条目",
        "topresults": "排名前 {value}",
        "color": "彩色",
        "height": "高度",
        "both": "两者",
        "none": "无",
        "mapmetric": "{metric} 显示方式:",
        "percmetric": "{percent} 的 {metric}",
        "mobilescroll": "&#x25BC 展开详细信息"
    },
    "flower": {
        "joy": "欢快",
        "admiration": "羡慕",
        "fear": "害怕",
        "surprise": "惊讶",
        "sadness": "伤心",
        "disgust": "厌恶",
        "anger": "生气",
        "anticipation": "期待"
    },
    "venn": {
        "definedAudience": "定义的受众"
    }
}, 'labels');

global.cloudViz.localeDefinition('zh-CN', {
    "shortFormat": {
        "hour": "%p %I",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%p %I",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%e 日 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%e 日 %a %p %I"
    },
    "fullFormat": {
        "hour": "%e 日 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%Y 年%B",
        "quarter": "%Y %B",
        "year": "%Y",
        "fallback": "%Y %b %e 日",
        "condensed": "%Y/%m/%d"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('zh-CN', {
    "decimalSeparator": ".",
    "groupSeparator": ",",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number}{symbol}",
        "negativePattern": "-{number}{symbol}"
    },
    "currency": {
        "symbol": "¥",
        "positivePattern": "{symbol}{number}",
        "negativePattern": "-{symbol}{number}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('zh-CN', {
    "singular": {
        "second": "秒",
        "minute": "分钟",
        "hour": "小时",
        "day": "天",
        "week": "周",
        "month": "月",
        "year": "年"
    },
    "plural": {
        "second": "秒",
        "minute": "分钟",
        "hour": "小时",
        "day": "天",
        "week": "周",
        "month": "月",
        "year": "年"
    },
    "abbreviation": {
        "second": "秒",
        "minute": "分钟",
        "hour": "小时",
        "day": "天",
        "week": "周",
        "month": "月",
        "year": "年"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('zh-TW', {
    "monthAbbreviations": [
        "1 月",
        "2 月",
        "3 月",
        "4 月",
        "5 月",
        "6 月",
        "7 月",
        "8 月",
        "9 月",
        "10 月",
        "11 月",
        "12 月"
    ],
    "months": [
        "1 月",
        "2 月",
        "3 月",
        "4 月",
        "5 月",
        "6 月",
        "7 月",
        "8 月",
        "9 月",
        "10 月",
        "11 月",
        "12 月"
    ],
    "weekdayAbbreviations": [
        "週日",
        "週一",
        "週二",
        "週三",
        "週四",
        "週五",
        "週六"
    ],
    "weekdays": [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
    ],
    "ampm": [
        "上午",
        "下午"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('zh-TW', {
    "core": {
        "nodata": "此圖表沒有任何資料",
        "erroronrender": "糟糕！發生錯誤，無法產生圖表。",
        "other": "其他",
        "normalized": "已標準化"
    },
    "dvcore": {
        "target": "目標",
        "yAxisTimeNoTitle": "{time}",
        "yAxisTimeWithTitle": "{title} (以{time}數計)",
        "legendTime": "{value} {time}"
    },
    "point": {
        "xScale": "X",
        "yScale": "Y",
        "sizeScale": "大小"
    },
    "pathing": {
        "entry": "登入點",
        "exit": "退出點",
        "entry2+": "登入點",
        "exit2+": "退出點",
        "path": "路徑",
        "path2+": "路徑",
        "expand": "展開",
        "focus": "焦點",
        "collapse": "摺疊",
        "title": "路徑圖表",
        "nodeEntries": "{label} 登入點",
        "nodeExits": "{label} 退出點",
        "nodeToNode": "{source} → {target}",
        "percOfNode": "{perc} 的 {label}",
        "pathToNode": "連至 {label} 的 {path}",
        "pathFromNode": "來自 {label} 的 {path}",
        "help1": "此圖表代表從一狀態變為另一狀態的路徑。",
        "help2": "每個設計成方塊的節點都代表路徑中的一種狀態。",
        "help3": "點選或按一下節點即可取得用於修改圖表的其他選項:",
        "focusHelp": "顯示進出節點的路徑",
        "expandHelp": "顯示前往或遠離節點的其他路徑",
        "collapseHelp": "移除前往或遠離節點的路徑"
    },
    "sunburst": {
        "audience": "讀者",
        "audience2+": "讀者",
        "category": "類別",
        "category2+": "類別",
        "metric": "量度",
        "metric2+": "量度",
        "primarymetric": "主要量度",
        "secondarymetric": "次要量度",
        "secondarymetric2+": "次要量度",
        "secondarymetrichelp": "按一下量度以切換高度",
        "secondarymetrichelp2+": "按一下量度以切換高度",
        "emptyFirstMetric": "第一個量度沒有值。請選擇其他量度。",
        "total": "總計",
        "zoomAction": "連按兩下來放大顯示。",
        "moreAction": "按一下存取更多選項。",
        "zoomin": "放大",
        "zoomout": "縮小",
        "hide": "隱藏",
        "hideall": "全部隱藏",
        "hideother": "隱藏其他",
        "hidden": "{value} 個隱藏項目",
        "hidden2+": "{value} 個隱藏項目",
        "topresults": "前 {value} 個項目",
        "color": "色彩",
        "height": "高度",
        "both": "兩者",
        "none": "無",
        "mapmetric": "將 {metric} 顯示為:",
        "percmetric": "{percent} 的 {metric}",
        "mobilescroll": "&#x25BC 捲動以瞭解詳細資料"
    },
    "flower": {
        "joy": "歡樂",
        "admiration": "欽佩",
        "fear": "恐懼",
        "surprise": "驚喜",
        "sadness": "傷心",
        "disgust": "噁心",
        "anger": "憤怒",
        "anticipation": "期望"
    },
    "venn": {
        "definedAudience": "特定讀者"
    }
}, 'labels');

global.cloudViz.localeDefinition('zh-TW', {
    "shortFormat": {
        "hour": "%p %I",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "%p %I",
        "day": "%a %e",
        "week": "%a %e",
        "month": "%b",
        "quarter": "%b",
        "year": "%Y",
        "fallback": "%a %e"
    },
    "longFormat": {
        "hour": "%e 日 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%B",
        "quarter": "%B",
        "year": "%Y",
        "fallback": "%e 日 %a %p %I"
    },
    "fullFormat": {
        "hour": "%e 日 %a %p %I",
        "day": "%A %e",
        "week": "%A %e",
        "month": "%Y 年 %B",
        "quarter": "%Y %B",
        "year": "%Y",
        "fallback": "%Y %b %e 日",
        "condensed": "%Y/%m/%d"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('zh-TW', {
    "decimalSeparator": ".",
    "groupSeparator": ",",
    "negativePattern": "-{number}",
    "percent": {
        "symbol": "%",
        "positivePattern": "{number}{symbol}",
        "negativePattern": "-{number}{symbol}"
    },
    "currency": {
        "symbol": "NT$",
        "positivePattern": "{symbol}{number}",
        "negativePattern": "-{symbol}{number}"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('zh-TW', {
    "singular": {
        "second": "秒",
        "minute": "分鐘",
        "hour": "小時",
        "day": "天",
        "week": "週",
        "month": "月",
        "year": "年"
    },
    "plural": {
        "second": "秒",
        "minute": "分鐘",
        "hour": "小時",
        "day": "天",
        "week": "週",
        "month": "月",
        "year": "年"
    },
    "abbreviation": {
        "second": "秒",
        "minute": "分鐘",
        "hour": "小時",
        "day": "天",
        "week": "週",
        "month": "月",
        "year": "年"
    }
}, 'time');

}(this));

(function(global) {
	'use strict';

global.cloudViz.localeDefinition('zz-ZZ', {
    "monthAbbreviations": [
        "[g] 승_Jan_文",
        "[q] 승_Feb_文",
        "[r] 승_Mar_文",
        "[n] 승_Apr_文",
        "[p] 승_May_文",
        "[k] 승_Jun_文",
        "[l] 승_Jul_文",
        "[i] 승_Aug_文",
        "[j] 승_Sep_文",
        "[h] 승_Oct_文",
        "[o] 승_Nov_文",
        "[m] 승_Dec_文"
    ],
    "months": [
        "[1] 승_January_文",
        "[2] 승_February_文",
        "[3] 승_March_文",
        "[x] 승_April_文",
        "[y] 승_May_文",
        "[z] 승_June_文",
        "[0] 승_July_文",
        "[s] 승_August_文",
        "[t] 승_September_文",
        "[u] 승_October_文",
        "[v] 승_November_文",
        "[w] 승_December_文"
    ],
    "weekdayAbbreviations": [
        "[+] 승_Sun_文",
        "[4] 승_Mon_文",
        "[5] 승_Tue_文",
        "[6] 승_Wed_文",
        "[7] 승_Thu_文",
        "[8] 승_Fri_文",
        "[9] 승_Sat_文"
    ],
    "weekdays": [
        "[BB] 승_Sunday_文",
        "[BA] 승_Monday_文",
        "[/] 승_Tuesday_文",
        "[BC] 승_Wednesday_文",
        "[BD] 승_Thursday_文",
        "[BE] 승_Friday_文",
        "[BF] 승_Saturday_文"
    ],
    "ampm": [
        "[e] 승_AM_文",
        "[f] 승_PM_文"
    ]
}, 'calendar');

global.cloudViz.localeDefinition('zz-ZZ', {
    "core": {
        "nodata": "[BH] 승_The chart has no data_文",
        "erroronrender": "[BG] 승_Oops! There was an error and the chart could not be rendered._文",
        "other": "[BJ] 승_Other_文",
        "normalized": "[BI] 승_Normalized_文"
    },
    "dvcore": {
        "target": "[BL] 승_Target_文",
        "yAxisTimeNoTitle": "[BK] 승_{time}_文",
        "yAxisTimeWithTitle": "[BN] 승_{title} (in {time})_文",
        "legendTime": "[BM] 승_{value} {time}_文"
    },
    "point": {
        "xScale": "[Bp] 승_X_文",
        "yScale": "[Br] 승_Y_文",
        "sizeScale": "[Bq] 승_Size_文"
    },
    "pathing": {
        "entry": "[Be] 승_Entry_文",
        "exit": "[Bg] 승_Exit_文",
        "entry2+": "[Bn] 승_Entries_文",
        "exit2+": "[Bb] 승_Exits_文",
        "path": "[BZ] 승_Path_文",
        "path2+": "[Bf] 승_Paths_文",
        "expand": "[BX] 승_Expand_文",
        "focus": "[BW] 승_Focus_文",
        "collapse": "[Bj] 승_Collapse_文",
        "title": "[Bc] 승_Pathing Chart_文",
        "nodeEntries": "[Cz] 승_{label} Entries_文",
        "nodeExits": "[C0] 승_{label} Exits_文",
        "nodeToNode": "[Cy] 승_{source} → {target}_文",
        "percOfNode": "[Ba] 승_{perc} of {label}_文",
        "pathToNode": "[Bo] 승_{path} to {label}_文",
        "pathFromNode": "[Bd] 승_{path} from {label}_文",
        "help1": "[BY] 승_This chart represents paths taken from one state to another._文",
        "help2": "[Bh] 승_Each node, shaped as a box, represents a state in the path._文",
        "help3": "[Bk] 승_Tapping or clicking a node will provide additional options to modify the chart:_文",
        "focusHelp": "[Bm] 승_Shows paths coming into and going out of node_文",
        "expandHelp": "[Bi] 승_Shows additional paths coming or going from the node_文",
        "collapseHelp": "[Bl] 승_Removes paths coming or going from the node_文"
    },
    "sunburst": {
        "audience": "[Ci] 승_Audience_文",
        "audience2+": "[Ce] 승_Audiences_文",
        "category": "[Ch] 승_Category_文",
        "category2+": "[Cf] 승_Categories_文",
        "metric": "[Cd] 승_Metric_文",
        "metric2+": "[Cg] 승_Metrics_文",
        "primarymetric": "[Cj] 승_Primary Metric_文",
        "secondarymetric": "[Cl] 승_Secondary Metric_文",
        "secondarymetric2+": "[Ck] 승_Secondary Metrics_文",
        "secondarymetrichelp": "[Cm] 승_Click metric to toggle height_文",
        "secondarymetrichelp2+": "[Cn] 승_Click metrics to toggle height_文",
        "emptyFirstMetric": "[B2] 승_The first metric has no values. Please pick a different metric._文",
        "total": "[B7] 승_Total_文",
        "zoomAction": "[By] 승_Double-click to Zoom in._文",
        "moreAction": "[B5] 승_Click for more options._文",
        "zoomin": "[Bz] 승_Zoom In_文",
        "zoomout": "[Bs] 승_Zoom Out_文",
        "hide": "[Bt] 승_Hide_文",
        "hideall": "[Bw] 승_Hide All_文",
        "hideother": "[Bu] 승_Hide Other_文",
        "hidden": "[B4] 승_{value} Hidden Item_文",
        "hidden2+": "[B0] 승_{value} Hidden Items_文",
        "topresults": "[B8] 승_top {value}_文",
        "color": "[Bx] 승_Color_文",
        "height": "[Bv] 승_Height_文",
        "both": "[B6] 승_Both_文",
        "none": "[B3] 승_None_文",
        "mapmetric": "[B9] 승_Show {metric} as:_文",
        "percmetric": "[B1] 승_{percent} of {metric}_文",
        "mobilescroll": "[Co] 승_&#x25BC scroll for details_文"
    },
    "flower": {
        "joy": "[BU] 승_Joy_文",
        "admiration": "[BT] 승_Admiration_文",
        "fear": "[BQ] 승_Fear_文",
        "surprise": "[BR] 승_Surprise_文",
        "sadness": "[BO] 승_Sadness_文",
        "disgust": "[BP] 승_Disgust_文",
        "anger": "[BV] 승_Anger_文",
        "anticipation": "[BS] 승_Anticipation_文"
    },
    "venn": {
        "definedAudience": "[B+] 승_Defined Audience_文"
    }
}, 'labels');

global.cloudViz.localeDefinition('zz-ZZ', {
    "shortFormat": {
        "hour": "[Z] 승_%I %p_文",
        "day": "%e",
        "week": "%e",
        "month": "%b",
        "quarter": "%b",
        "year": "[d] 승_%Y_文",
        "fallback": "%e"
    },
    "mediumFormat": {
        "hour": "[S] 승_%I %p_文",
        "day": "[Q] 승_%a %e_文",
        "week": "[T] 승_%a %e_文",
        "month": "%b",
        "quarter": "%b",
        "year": "[U] 승_%Y_文",
        "fallback": "[V] 승_%a %e_文"
    },
    "longFormat": {
        "hour": "[P] 승_%I %p %a %e_文",
        "day": "[M] 승_%A %e_文",
        "week": "[O] 승_%A %e_文",
        "month": "[L] 승_%B_文",
        "quarter": "[K] 승_%B_文",
        "year": "[J] 승_%Y_文",
        "fallback": "[N] 승_%I %p %a %e_文"
    },
    "fullFormat": {
        "hour": "[D] 승_%I %p %a %e_文",
        "day": "[C] 승_%A %e_文",
        "week": "[B] 승_%A %e_文",
        "month": "[G] 승_%B %Y_文",
        "quarter": "[E] 승_%B %Y_文",
        "year": "[I] 승_%Y_文",
        "fallback": "[F] 승_%b %e, %Y_文",
        "condensed": "[H] 승_%m/%d/%Y_文"
    }
}, 'dateFormat');

global.cloudViz.localeDefinition('zz-ZZ', {
    "decimalSeparator": "[CC] 승_._文",
    "groupSeparator": "[CD] 승_,_文",
    "negativePattern": "[CE] 승_-{number}_文",
    "percent": {
        "symbol": "[CF] 승_%_文",
        "positivePattern": "[CG] 승_{number}{symbol}_文",
        "negativePattern": "[CH] 승_-{number}{symbol}_文"
    },
    "currency": {
        "symbol": "[B/] 승_$_文",
        "positivePattern": "[CA] 승_{symbol}{number}_文",
        "negativePattern": "[CB] 승_-{symbol}{number}_文"
    }
}, 'numberFormat');

global.cloudViz.localeDefinition('zz-ZZ', {
    "singular": {
        "second": "[CX] 승_second_文",
        "minute": "[CY] 승_minute_文",
        "hour": "[CZ] 승_hour_文",
        "day": "[CV] 승_day_文",
        "week": "[Ca] 승_week_文",
        "month": "[Cb] 승_month_文",
        "year": "[CW] 승_year_文"
    },
    "plural": {
        "second": "[CS] 승_seconds_文",
        "minute": "[CP] 승_minutes_文",
        "hour": "[Cc] 승_hours_文",
        "day": "[CR] 승_days_文",
        "week": "[CQ] 승_weeks_文",
        "month": "[CT] 승_months_文",
        "year": "[CU] 승_years_文"
    },
    "abbreviation": {
        "second": "[CJ] 승_s_文",
        "minute": "[CO] 승_min_文",
        "hour": "[CK] 승_h_文",
        "day": "[CI] 승_d_文",
        "week": "[CL] 승_w_文",
        "month": "[CM] 승_mon_文",
        "year": "[CN] 승_y_文"
    }
}, 'time');

}(this));
