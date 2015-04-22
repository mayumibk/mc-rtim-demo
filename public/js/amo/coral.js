/* global Typekit */
/* jshint -W033,-W116 */
(function (window, undefined) {

  var typeKitId = 'jwv7ouu';
  
  if ( window.CUI && window.CUI.options && window.CUI.options.typeKitId ) 
  {  
     typeKitId = window.CUI.options.typeKitId;
  }

  var config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    var h = document.getElementsByTagName("html")[0];
    h.className += " wf-loading";
    var t = setTimeout(function () {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
      h.className += " wf-inactive"
    }, config.scriptTimeout);
    var tk = document.createElement("script"), d = false;
    tk.src = '//use.typekit.net/' + config.kitId + '.js';
    tk.type = "text/javascript";
    tk.async = "true";
    tk.onload = tk.onreadystatechange = function () {
      var a = this.readyState;
      if (d || a && a != "complete" && a != "loaded")return;
      d = true;
      clearTimeout(t);
      try {
        Typekit.load(config)
      } catch (b) {
      }
    };
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tk, s);
  }

}(this));

/**
 Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic constructor/destructor chaining, easy toString methods, and syntactic sugar for calling superclass methods

 @see Base

 @function

 @param {Object} descriptor                        Descriptor object
 @param {String|Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
 @param {Object} descriptor.extend                 The class to extend
 @param {Function} descriptor.construct            The constructor (setup) method for the new class
 @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
 @param {Mixed} descriptor.*                       Other methods and properties for the new class

 @returns {Base} The created class.
 */
var Class;
var Exception;

(function () {
  /**
   @name Base

   @classdesc The abstract class which contains methods that all classes will inherit.
   Base cannot be extended or instantiated and does not exist in the global namespace.
   If you create a class using <code class="prettyprint">new Class()</code> or <code class="prettyprint">MyClass.extend()</code>, it will come with Base' methods.

   @desc Base is an abstract class and cannot be instantiated directly. Constructors are chained automatically, so you never need to call the constructor of an inherited class directly
   @constructs

   @param {Object} options  Instance options. Guaranteed to be defined as at least an empty Object
   */

  /**
   Binds a method of this instance to the execution scope of this instance.

   @name bind
   @memberOf Base.prototype
   @function

   @param {Function} func The this.method you want to bind
   */
  var bindFunc = function (func) {
    // Bind the function to always execute in scope
    var boundFunc = func.bind(this);

    // Store the method name
    boundFunc._methodName = func._methodName;

    // Store the bound function back to the class
    this[boundFunc._methodName] = boundFunc;

    // Return the bound function
    return boundFunc;
  };

  /**
   Extends this class using the passed descriptor.
   Called on the Class itself (not an instance), this is an alternative to using <code class="prettyprint">new Class()</code>.
   Any class created using Class will have this static method on the class itself.

   @name extend
   @memberOf Base
   @function
   @static

   @param {Object} descriptor                        Descriptor object
   @param {String|Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
   @param {Object} descriptor.extend                 The class to extend
   @param {Function} descriptor.construct            The constructor (setup) method for the new class
   @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
   @param {Anything} descriptor.*                    Other methods and properties for the new class
   */
  var extendClass = function (descriptor) {
    descriptor.extend = this;
    return new Class(descriptor);
  };

  Class = function (descriptor) {
    descriptor = descriptor || {};

    if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
      throw new Class.NonTruthyExtendError(typeof descriptor.toString === 'function' ? descriptor.toString() : descriptor.toString);
    }

    // Extend Object by default
    var extend = descriptor.extend || Object;

    // Construct and destruct are not required
    var construct = descriptor.construct;
    var destruct = descriptor.destruct;

    // Remove special methods and keywords from descriptor
    delete descriptor.bind;
    delete descriptor.extend;
    delete descriptor.destruct;
    delete descriptor.construct;

    // Add toString method, if necessary
    if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
      // Return the string provided
      var classString = descriptor.toString;
      descriptor.toString = function () {
        return classString.toString();
      };
    }
    else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
      // Use parent's toString
      descriptor.toString = extend.prototype.toString;
    }

    // The remaining properties in descriptor are our methods
    var methodsAndProps = descriptor;

    // Create an object with the prototype of the class we're extending
    var prototype = Object.create(extend && extend.prototype);

    // Store super class as a property of the new class' prototype
    prototype.superClass = extend.prototype;

    // Copy new methods into prototype
    if (methodsAndProps) {
      for (var key in methodsAndProps) {
        if (methodsAndProps.hasOwnProperty(key)) {
          prototype[key] = methodsAndProps[key];

          // Store the method name so calls to inherited() work
          if (typeof methodsAndProps[key] === 'function') {
            prototype[key]._methodName = key;
            prototype[key]._parentProto = prototype;
          }
        }
      }
    }

    /**
     Call the superclass method with the same name as the currently executing method

     @name inherited
     @memberOf Base.prototype
     @function

     @param {Arguments} args  Unadulterated arguments array from calling function
     */
    prototype.inherited = function (args) {
      // Get the function that call us from the passed arguments objected
      var caller = args.callee;

      // Get the name of the method that called us from a property of the method
      var methodName = caller._methodName;

      if (!methodName) {
        throw new Class.MissingCalleeError(this.toString());
      }

      // Start iterating at the prototype that this function is defined in
      var curProto = caller._parentProto;
      var inheritedFunc = null;

      // Iterate up the prototype chain until we find the inherited function
      while (curProto.superClass) {
        curProto = curProto.superClass;
        inheritedFunc = curProto[methodName];
        if (typeof inheritedFunc === 'function')
          break;
      }

      if (typeof inheritedFunc === 'function') {
        // Store our inherited function
        var oldInherited = this.inherited;

        // Overwrite our inherited function with that of the prototype so the called function can call its parent
        this.inherited = curProto.inherited;

        // Call the inherited function our scope, apply the passed args array
        var retVal = inheritedFunc.apply(this, args);

        // Revert our inherited function to the old function
        this.inherited = oldInherited;

        // Return the value called by the inherited function
        return retVal;
      }
      else {
        throw new Class.InheritedMethodNotFoundError(this.toString(), methodName);
      }
    };

    // Add bind to the prototype of the class
    prototype.bind = bindFunc;

    /**
     Destroys this instance and frees associated memory. Destructors are chained automatically, so the <code class="prettyprint">destruct()</code> method of all inherited classes will be called for you

     @name destruct
     @memberOf Base.prototype
     @function
     */
    prototype.destruct = function () {
      // Call our destruct method first
      if (typeof destruct === 'function') {
        destruct.apply(this);
      }

      // Call superclass destruct method after this class' method
      if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
        extend.prototype.destruct.apply(this);
      }
    };

    // Create a chained construct function which calls the superclass' construct function
    prototype.construct = function () {
      // Add a blank object as the first arg to the constructor, if none provided
      var args = arguments; // get around JSHint complaining about modifying arguments
      if (args[0] === undefined) {
        args.length = 1;
        args[0] = {};
      }

      // call superclass constructor
      if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
        extend.prototype.construct.apply(this, arguments);
      }

      // call constructor
      if (typeof construct === 'function') {
        construct.apply(this, arguments);
      }
    };

    // Create a function that generates instances of our class and calls our construct functions
    /** @ignore */
    var instanceGenerator = function () {
      // Create a new object with the prototype we built
      var instance = Object.create(prototype);

      // Call all inherited construct functions
      prototype.construct.apply(instance, arguments);

      return instance;
    };

    instanceGenerator.toString = prototype.toString;

    // Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
    instanceGenerator.prototype = prototype;

    // Add extend to the instance generator for the class
    instanceGenerator.extend = extendClass;

    // The constructor, as far as JS is concerned, is actually our instance generator
    prototype.constructor = instanceGenerator;

    return instanceGenerator;
  };

  if (!Object.create) {
    /**
     Polyfill for Object.create. Creates a new object with the specified prototype.

     @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/">Mozilla MDN</a>

     @param {Object} prototype  The prototype to create a new object with
     */
    Object.create = function (prototype) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      function Func() {
      }

      Func.prototype = prototype;
      return new Func();
    };
  }

  if (!Function.prototype.bind) {
    /**
     Polyfill for Function.bind. Binds a function to always execute in a specific scope.

     @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Mozilla MDN</a>

     @param {Object} scope  The scope to bind the function to
     */
    Function.prototype.bind = function (scope) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      /** @ignore */
      var NoOp = function () {
      };
      /** @ignore */
      var fBound = function () {
        return fToBind.apply(this instanceof NoOp ? this : scope, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      NoOp.prototype = this.prototype;
      fBound.prototype = new NoOp();

      return fBound;
    };
  }

  Exception = new Class({
    extend: Error,
    construct: function () {
      this.name = 'Error';
      this.message = 'General exception';
    },

    toString: function () {
      return this.name + ': ' + this.message;
    }
  });

  var ClassException = Exception.extend({
    name: 'Class Exception'
  });

  // Exceptions
  Class.NonTruthyExtendError = ClassException.extend({
    construct: function (className) {
      this.message = className + ' attempted to extend a non-truthy object';
    }
  });

  Class.InheritedMethodNotFoundError = ClassException.extend({
    construct: function (className, methodName) {
      this.message = className + " can't call method '" + methodName + "', no method defined in parent classes";
    }
  });

  Class.MissingCalleeError = ClassException.extend({
    construct: function (className) {
      this.message = className + " can't call inherited method: calling method did not have _methodName";
    }
  });
}());

(function ($, window, undefined) {
  /**
   * @classdesc The main CUI namespace.
   * @namespace
   *
   * @property {Object} options Main options for CloudUI components.
   * @property {Boolean} options.debug If true, show debug messages for all components.
   * @property {Boolean} options.dataAPI If true, add listeners for widget data APIs.
   * @property {Object} Templates Contains templates used by CUI widgets
   *
   * @example
   * <caption>Change CUI options</caption>
   * <description>You can change CUI options by defining <code>CUI.options</code> before you load CUI.js</description>
   * &lt;script type=&quot;text/javascript&quot;&gt;
   * var CUI = {
   *   options: {
   *     debug: false,
   *     dataAPI: true
   *   }
   * };
   * &lt;/script&gt;
   * &lt;script src=&quot;js/CUI.js&quot;&gt;&lt;/script&gt;
   *
   * preferable include the CUI.js at the bottom before the body closes
   */
  window.CUI = window.CUI || {};

  CUI.options = $.extend({
    debug: false,
    dataAPI: true
  }, CUI.options);

  // REMARK: disabled for now
  // Register partials for all templates
  // Note: this requires the templates to be included BEFORE CUI.js
  /*for (var template in CUI.Templates) {
   Handlebars.registerPartial(template, CUI.Templates[template]);
   }*/

  /**
   * <p><code>cui-contentloaded</code> event is an event that is triggered when a new content is injected to the DOM,
   * which is very similar to {@link https://developer.mozilla.org/en-US/docs/DOM/DOM_event_reference/DOMContentLoaded|DOMContentLoaded} event.</p>
   * <p>This event is normally used so that a JavaScript code can be notified when new content needs to be enhanced (applying event handler, layout, etc).
   * The element where the new content is injected is available at event.target, like so:
   * <pre class="prettyprint linenums jsDocExample">$(document).on("cui-contentloaded", function(e) {
   * var container = e.target;
   * // the container is the element where new content is injected.
   * });</pre>
   * This way the listener can limit the scope of the selector accordingly.</p>
   * <p>It will be triggered at DOMContentLoaded event as well, so component can just listen to this event instead of DOMContentLoaded for enhancement purpose.
   * In that case, the value of event.target is <code>document</code>.</p>
   *
   * @event cui-contentloaded
   */
  $(function () {
    $(document).trigger("cui-contentloaded");
  });

}(jQuery, this));

(function ($, window, undefined) {

  var nextId = 1;

  /**
   * Utility functions used by CoralUI widgets
   * @namespace
   */
  CUI.util = {

    /**
     * Flag if a touch device was detected
     * @type {Boolean}
     */
    isTouch: (function () {
      // CUI-2327 Special value for Win8.x/Chrome
      if (/Windows NT 6\.[23];.*Chrome/.test(window.navigator.userAgent)) {
        return false;
      }

      return 'ontouchstart' in window;
    })(),

    /**
     * delivers a unique id within Coral
     * meant to be used in case a id attribute is necessary but missing
     */
    getNextId: function () {
      return 'coral-' + nextId++;
    },

    /**
     * Get the target element of a data API action using the data attributes of an element.
     *
     * @param {jQuery} $element The jQuery object representing the element to get the target from
     * @return {jQuery} The jQuery object representing the target element
     */
    getDataTarget: function ($element) {
      var href = $element.attr('href');
      var $target = $($element.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
      return $target;
    },

    /**
     * Decapitalize a string by converting the first letter to lowercase.
     *
     * @param {String} str The string to de-capitalize
     * @return {String} The de-capitalized string
     */
    decapitalize: function (str) {
      return str.slice(0, 1).toLowerCase() + str.slice(1);
    },

    /**
     * Capitalize a string by converting the first letter to uppercase.
     *
     * @param {String} str The string to capitalize
     * @return {String} The capitalized string
     */
    capitalize: function (str) {
      return str.slice(0, 1).toUpperCase() + str.slice(1);
    },

    /**
     * Create a jQuery plugin from a class
     * @param {Class} PluginClass The class to create to create the plugin for
     * @param {String} [pluginName=PluginClass.toString()] The name of the plugin to create. The de-capitalized return value of PluginClass.toString() is used if left undefined
     * @param {Function} [callback]                              A function to execute in the scope of the jQuery object when the plugin is activated. Used for tacking on additional initialization procedures or behaviors for other plugin functionality.
     */
    plugClass: function (PluginClass, pluginName, callback) {
      pluginName = pluginName || CUI.util.decapitalize(PluginClass.toString());

      $.fn[pluginName] = function (optionsIn) {
        var pluginArgs = arguments;
        return this.each(function () {
          var $element = $(this);

          // Combine defaults, data, options, and element config
          var options = $.extend({}, $element.data(), typeof optionsIn === 'object' && optionsIn, { element: this });

          // Get instance, if present already
          var instance = $element.data(pluginName) || new PluginClass(options);

          if (typeof optionsIn === 'string') // Call method, pass args
            instance[optionsIn].apply(instance, Array.prototype.slice.call(pluginArgs, 1));
          else if ($.isPlainObject(optionsIn)) // Apply options
            instance.set(optionsIn);

          if (typeof callback === 'function')
            callback.call(this, instance);
        });
      };

      $.fn[pluginName].Constructor = PluginClass;
    },

    /**
     * Register a callback from a string
     *
     * @param {String} callbackAsString The string containing the callback function to register
     * @param {Object} [params] Parameters to provide when executing callback
     * @return {Function} The callback function generated from the provided string
     */
    buildFunction: function (callbackAsString, params) {
      params = params || [];

      if (typeof params === "string") {
        params = [params];
      }

      if (callbackAsString) {
        try {
          var Fn = Function;
          return new Fn(params, "return " + callbackAsString + "(" + params.join(", ") + ");");
        } catch (e) {
          return null;
        }
      }
    },

    /**
     * Selects text in the provided field
     * @param {Number} start (optional) The index where the selection should start (defaults to 0)
     * @param {Number} end (optional) The index where the selection should end (defaults to the text length)
     */
    selectText: function (field, start, end) {
      var value = field.val();

      if (value.length > 0) {
        start = start || 0;
        end = end || value.length;
        var domEl = $(field)[0];
        if (domEl.setSelectionRange) {
          // Mostly all browsers
          domEl.blur();
          domEl.setSelectionRange(start, end);
          domEl.focus();
        } else if (domEl.createTextRange) {
          // IE
          var range = domEl.createTextRange();
          range.collapse(true);
          range.moveEnd("character", end - value.length);
          range.moveStart("character", start);
          range.select();
        }
      }
    },

    /**
     * Utility function to get the value of a nested key within an object
     *
     * @param {Object} object The object to retrieve the value from
     * @param {String} nestedKey The nested key. For instance "foo.bar.baz"
     * @return {Object} The object value for the nested key
     */
    getNested: function (object, nestedKey) {
      if (!nestedKey) {
        return object;
      }

      // Split key into a table
      var keys = typeof nestedKey === "string" ? nestedKey.split(".") : nestedKey;

      // Browse object
      var result = object;
      while (result && keys.length > 0) {
        result = result[keys.shift()];
      }

      return result;
    },

    /**
     * Utility function to transform a string representation of a boolean value into that boolean value
     *
     * @param {String} string representation
     * @return {Boolean} The boolean value of the string
     */
    isTrue: function (str) {
      return str === 'true';
    }

  };

  // add touch class to <html>
  $('html').toggleClass('touch', CUI.util.isTouch);

}(jQuery, this));
(function ($, window, undefined) {

  /**
   * Load remote content in an element with a CUI spinner
   * @param {String} remote The remote URL to pass to $.load
   * @param {Boolean} [force] Set force to true to force the load to happen with every call, even if it has succeeded already. Otherwise, subsequent calls will simply return.
   * @param {Function} [callback] A function to execute in the scope of the jQuery $.load call when the load finishes (whether success or failure). The arguments to the callback are the load results: response, status, xhr.
   */
  $.fn.loadWithSpinner = function (remote, force, callback) {
    var $target = $(this);

    // load remote link, if necessary
    if (remote && (force || $target.data('loaded-remote') !== remote)) {
      // only show the spinner if the request takes an appreciable amount of time, otherwise
      // the flash of the spinner is a little ugly
      var timer = setTimeout(function () {
        $target.html('<div class="spinner large"></div>');
      }, 50);

      $target.load(remote, function (response, status, xhr) {
        clearTimeout(timer); // no need for the spinner anymore!

        if (status === 'error') {
          $target.html('<div class="alert error"><strong>ERROR</strong> Failed to load content: ' + xhr.statusText + ' (' + xhr.status + ')</div>');
          $target.data('loaded-remote', '');
        }

        if (typeof callback === 'function') {
          callback.call(this, response, status, xhr);
        }
      }); // load

      $target.data('loaded-remote', remote);
    } // end if remote
  };

  /**
   * $.fn.on for touch devices only
   * @return {jquery} this, chainable
   */
  $.fn.finger = function () {
    if (CUI.util.isTouch) {
      this.on.apply(this, arguments);
    }
    return this;
  };

  /**
   * $.fn.on for pointer devices only
   * @return {jquery} this, chainable
   */
  $.fn.pointer = function () {
    if (!CUI.util.isTouch) {
      this.on.apply(this, arguments);
    }
    return this;
  };

  /**
   * $.fn.on for touch and pointer devices
   * the first parameter is the finger event the second the pointer event
   * @return {jquery} this, chainable
   */
  $.fn.fipo = function () {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);

    this.pointer.apply(this, args);

    args[0] = arguments[0];
    this.finger.apply(this, args);

    return this;
  };

  /**
   * :focusable and :tabbable selectors
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * @ignore
   */
  function focusable(element, isTabIndexNotNaN) {
    var map, mapName, img,
      nodeName = element.nodeName.toLowerCase();
    if ("area" === nodeName) {
      map = element.parentNode;
      mapName = map.name;
      if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }
      img = $("img[usemap=#" + mapName + "]")[0];
      return !!img && visible(img);
    }
    return ( /input|select|textarea|button|object/.test(nodeName) ?
      !element.disabled :
      "a" === nodeName ?
        element.href || isTabIndexNotNaN :
        isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible(element);
  }

  /**
   * :focusable and :tabbable selectors
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * @ignore
   */
  function visible(element) {
    return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
      return $.css(this, "visibility") === "hidden";
    }).length;
  }

  /**
   * create pseudo selectors :focusable and :tabbable
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * support: jQuery >= 1.8
   */
  $.extend($.expr[ ":" ], {
    data: $.expr.createPseudo(function (dataName) {
      return function (elem) {
        return !!$.data(elem, dataName);
      };
    }),

    /**
     * pseudo selector :focusable
     */
    focusable: function (element) {
      return focusable(element, !isNaN($.attr(element, "tabindex")));
    },

    /**
     * pseudo selector :tabbable
     */
    tabbable: function (element) {
      var tabIndex = $.attr(element, "tabindex"),
        isTabIndexNaN = isNaN(tabIndex);
      return ( isTabIndexNaN || tabIndex >= 0 ) && focusable(element, !isTabIndexNaN);
    }
  });

}(jQuery, this));
/*!
 * jQuery UI Position @VERSION
 * http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow ? "" : within.element.css( "overflow-x" ),
			overflowY = within.isWindow ? "" : within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] );
		return {
			element: withinElement,
			isWindow: isWindow,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top -  data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

}( jQuery ) );

/*!
* toe.js
* version 3.0.2
* author: Damien Antipa
* https://github.com/dantipa/toe.js
*/
(function ($, window, undefined) {

    var state, gestures = {}, touch = {

        active: false,

        on: function () {
            $(document).on('touchstart', touchstart)
                .on('touchmove', touchmove)
                .on('touchend touchcancel', touchend);

            touch.active = true;
        },

        off: function () {
            $(document).off('touchstart', touchstart)
                .off('touchmove', touchmove)
                .off('touchend touchcancel', touchend);

            touch.active = false;
        },

        track: function (namespace, gesture) {
            gestures[namespace] = gesture;
        },

        addEventParam: function (event, extra) {
            var $t = $(event.target),
                pos = $t.offset(),
                param = {
                    pageX: event.point[0].x,
                    pageY: event.point[0].y,
                    offsetX: pos.left - event.point[0].x,
                    offsetY: pos.top - event.point[0].y
                };

            return $.extend(param, extra);
        },

        Event: function (event) { // normalizes and simplifies the event object
            var normalizedEvent = {
                type: event.type,
                timestamp: new Date().getTime(),
                target: event.target,   // target is always consistent through start, move, end
                point: []
            }, points = event.changedTouches ||
                event.originalEvent.changedTouches ||
                event.touches ||
                event.originalEvent.touches;

            $.each(points, function (i, e) {
                normalizedEvent.point.push({
                    x: e.pageX,
                    y: e.pageY
                });
            });

            return normalizedEvent;
        },

        State: function (start) {
            var p = start.point[0];

            return {   // TODO add screenX etc.
                start: start,
                move: [],
                end: null
            };
        },

        calc: {
            getDuration: function (start, end) {
                return end.timestamp - start.timestamp;
            },

            getDistance: function (start, end) {
                return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            },

            getAngle: function (start, end) {
                return Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
            },

            getDirection: function (angle) {
                return angle < -45 && angle > -135 ? 'top':
                    angle >= -45 && angle <= 45 ? 'right':
                        angle >= 45 && angle < 135 ? 'down':
                            angle >= 135 || angle <= -135 ? 'left':
                                'unknown';
            },

            getScale: function (start, move) {
                var sp = start.point,
                    mp = move.point;

                if(sp.length === 2 && mp.length === 2) { // needs to have the position of two fingers
                    return (Math.sqrt(Math.pow(mp[0].x - mp[1].x, 2) + Math.pow(mp[0].y - mp[1].y, 2)) / Math.sqrt(Math.pow(sp[0].x - sp[1].x, 2) + Math.pow(sp[0].y - sp[1].y, 2))).toFixed(2);
                }

                return 0;
            },

            getRotation: function (start, move) {
                var sp = start.point,
                    mp = move.point;

                if(sp.length === 2 && mp.length === 2) {
                    return ((Math.atan2(mp[0].y - mp[1].y, mp[0].x - mp[1].x) * 180 / Math.PI) - (Math.atan2(sp[0].y - sp[1].y, sp[0].x - sp[1].x) * 180 / Math.PI)).toFixed(2);
                }

                return 0;
            }
        }

    }; // touch obj

    function loopHandler(type, event, state, point) {
        $.each(gestures, function (i, g) {
            g[type].call(this, event, state, point);
        });
    }

    function touchstart(event) {
        var start = touch.Event(event);
        state = touch.State(start); // create a new State object and add start event

        loopHandler('touchstart', event, state, start);
    }

    function touchmove(event) {
        var move = touch.Event(event);
        state.move.push(move);

        loopHandler('touchmove', event, state, move);
    }

    function touchend(event) {
        var end = touch.Event(event);
        state.end = end;

        loopHandler('touchend', event, state, end);
    }

    touch.on();

    // add to namespace
    $.toe = touch;

}(jQuery, this));
(function ($, touch, window, undefined) {

    var namespace = 'swipe', cfg = {
            distance: 40, // minimum
            duration: 1200, // maximum
            direction: 'all'
        };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            state[namespace] = {
                finger: start.point.length
            };
        },
        touchmove: function (event, state, move) {
            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;
        },
        touchend: function (event, state, end) {
            var opt = $.extend(cfg, event.data),
                duration,
                distance;

            // calc
            duration = touch.calc.getDuration(state.start, end);
            distance = touch.calc.getDistance(state.start.point[0], end.point[0]);

            // check if the swipe was valid
            if (duration < opt.duration && distance > opt.distance) {

                state[namespace].angle = touch.calc.getAngle(state.start.point[0], end.point[0]);
                state[namespace].direction = touch.calc.getDirection(state[namespace].angle);

                // fire if the amount of fingers match
                if (opt.direction === 'all' || state[namespace].direction === opt.direction) {
                    $(event.target).trigger($.Event(namespace, touch.addEventParam(state.start, state[namespace])));
                }
            }
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var namespace = 'tap', cfg = {
        distance: 10,
        duration: 300,
        finger: 1
    };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            state[namespace] = {
                finger: start.point.length
            };
        },
        touchmove: function (event, state, move) {
            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;
        },
        touchend: function (event, state, end) {
            var opt = $.extend(cfg, event.data),
                duration,
                distance;

            // calc
            duration = touch.calc.getDuration(state.start, end);
            distance = touch.calc.getDistance(state.start.point[0], end.point[0]);

            // check if the tap was valid
            if (duration < opt.duration && distance < opt.distance) {
                // fire if the amount of fingers match
                if (state[namespace].finger === opt.finger) {
                    $(event.target).trigger(
                        $.Event(namespace, touch.addEventParam(state.start, state[namespace]))
                    );
                }
            }
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var timer, abort,
        namespace = 'taphold', cfg = {
            distance: 20,
            duration: 500,
            finger: 1
        };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            var opt = $.extend(cfg, event.data);

            abort = false;
            state[namespace] = {
                finger: start.point.length
            };

            clearTimeout(timer);
            timer = setTimeout(function () {
                if (!abort && touch.active) {
                    if (state[namespace].finger === opt.finger) {
                        $(event.target).trigger($.Event(namespace, touch.addEventParam(start, state[namespace])));
                    }
                }
            }, opt.duration);
        },
        touchmove: function (event, state, move) {
            var opt = $.extend(cfg, event.data),
                distance;

            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;

            // calc
            distance = touch.calc.getDistance(state.start.point[0], move.point[0]);
            if (distance > opt.distance) { // illegal move
                abort = true;
            }
        },
        touchend: function (event, state, end) {
            abort = true;
            clearTimeout(timer);
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var namespace = 'transform', cfg = {
            scale: 0.1, // minimum
            rotation: 15
        },
        started;

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            started = false;
            state[namespace] = {
                start: start,
                move: []
            };
        },
        touchmove: function (event, state, move) {
            var opt = $.extend(cfg, event.data);

            if (move.point.length !== 2) {
                return;
            }

            state[namespace].move.push(move);

            if (state[namespace].start.point.length !== 2 && move.point.length === 2) { // in case the user failed to start with 2 fingers
                state[namespace].start = $.extend({}, move);
            }

            state[namespace].rotation = touch.calc.getRotation(state[namespace].start, move);
            state[namespace].scale = touch.calc.getScale(state[namespace].start, move);

            if (Math.abs(1-state[namespace].scale) > opt.scale || Math.abs(state[namespace].rotation) > opt.rotation) {
                if(!started) {
                    $(event.target).trigger($.Event('transformstart', state[namespace]));
                    started = true;
                }

                $(event.target).trigger($.Event('transform', state[namespace]));
            }
        },
        touchend: function (event, state, end) {
            if(started) {
                started = false;

                if (end.point.length !== 2) { // in case the user failed to end with 2 fingers
                    state.end = $.extend({}, state[namespace].move[state[namespace].move.length - 1]);
                }

                state[namespace].rotation = touch.calc.getRotation(state[namespace].start, state.end);
                state[namespace].scale = touch.calc.getScale(state[namespace].start, state.end);

                $(event.target).trigger($.Event('transformend', state[namespace]));
            }
        }
    });

}(jQuery, jQuery.toe, this));
// Patch for jQueryUI's Position utility. Please remove this patch once the fix makes its way into an official
// jQueryUI release.
// Bug logged against jQueryUI: http://bugs.jqueryui.com/ticket/8710
// Pull request logged against jQueryUI: https://github.com/jquery/jquery-ui/pull/1071
// Bug logged against CoralUI for removal of this patch: https://issues.adobe.com/browse/CUI-1046
(function ($) {
  var abs = Math.abs;
  $.ui.position.flip.top = function (position, data) {
    var within = data.within,
      withinOffset = within.offset.top + within.scrollTop,
      outerHeight = within.height,
      offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
      collisionPosTop = position.top - data.collisionPosition.marginTop,
      overTop = collisionPosTop - offsetTop,
      overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
      top = data.my[ 1 ] === "top",
      myOffset = top ?
        -data.elemHeight :
        data.my[ 1 ] === "bottom" ?
          data.elemHeight :
          0,
      atOffset = data.at[ 1 ] === "top" ?
        data.targetHeight :
        data.at[ 1 ] === "bottom" ?
          -data.targetHeight :
          0,
      offset = -2 * data.offset[ 1 ],
      newOverTop,
      newOverBottom;
    if (overTop < 0) {
      newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
      // Patched code:
      if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
        position.top += myOffset + atOffset + offset;
      }
    }
    else if (overBottom > 0) {
      newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
      // Patched code:
      if (newOverTop > 0 || abs(newOverTop) < overBottom) {
        position.top += myOffset + atOffset + offset;
      }
    }
  };
})(jQuery);
(function ($, window, undefined) {

  CUI.Widget = new Class(/** @lends CUI.Widget# */{
    toString: 'Widget',

    /**
     * @classdesc The base class for all widgets
     *
     * @desc Creates a new widget
     * @constructs
     *
     * @param {Object} options Widget options
     * @param {Boolean} [options.visible=false] If True, show the widget immediately
     */
    construct: function (options) {

      // Store the target element jQuery object:
      this.$element = $(options.element);

      // Get widget name:
      var widgetName = CUI.util.decapitalize(this.toString());

      // See if the target element has a widget instance attached already:
      if (this.$element.data(widgetName) !== undefined) {
        var message = [
          'An instance of',
          this,
          'is already attached to the specified target element.',
          'Future versions of CoralUI will throw an exception at this point.'
        ].join(' ');

        window.console.log(message);
      }

      // Cascade and store options:
      this.options = $.extend(
          {},
          (typeof this.defaults === 'object' && this.defaults),
          this.$element.data(),
          options);

      // Add instance to element's data
      this.$element.data(widgetName, this);

      // Bind functions commonly called by listeners
      this.bind(this.hide);
      this.bind(this.show);
      this.bind(this.toggleVisibility);

      // Show/hide when this.options.visible changes
      this.on('change:visible', function (evt) {
        this[evt.value ? '_show' : '_hide']();
      }.bind(this));
    },

    /**
     * Set a number of options using an object or a string
     * @name set
     * @memberOf CUI.Widget#
     * @function
     *
     * @param {String|Object} option The option to set as a string, or an object of key/value pairs to set
     * @param {String} value The value to set the option to (is ignored when first argument is an object)
     *
     * @return {CUI.Widget} this, chainable
     */
    set: function (optionOrObj, value) {
      if ($.isPlainObject(optionOrObj)) {
        // Set multiple options
        for (var option in optionOrObj) {
          this._set(option, optionOrObj[option]);
        }
      }
      else {
        // Set single option
        this._set(optionOrObj, value);
      }

      return this;
    },

    /**
     * @ignore
     */
    _set: function (option, value) {
      // Trigger a change event
      var e = $.Event('beforeChange:' + option, {
        widget: this, // We want to know who fired this event (used by CUI.Filters, CUI.DropdownList)
        option: option,
        currentValue: this.options[option],
        value: value
      });
      this.$element.trigger(e);

      // Don't set if prevented
      if (e.isDefaultPrevented()) return this;

      // Set value
      this.options[option] = value;

      e = $.Event('change:' + option, {
        widget: this,
        option: option,
        value: value
      });
      this.$element.trigger(e);
    },

    /**
     * Get the value of an option
     * @param {String} option The name of the option to fetch the value of
     * @return {Mixed} Option value
     */
    get: function (option) {
      return this.options[option];
    },

    /**
     * Add an event listener
     * @param {String} evtName The event name to listen for
     * @param {Function} func The function that will be called when the event is triggered
     * @return {CUI.Widget} this, chainable
     */
    on: function (evtName, func) {
      this.$element.on.apply(this.$element, arguments);
      return this;
    },

    /**
     * Remove an event listener
     * @param {String} evtName The event name to stop listening for
     * @param {Function} func     The function that was passed to on()
     * @return {CUI.Widget} this, chainable
     */
    off: function (evtName, func) {
      this.$element.off.apply(this.$element, arguments);
      return this;
    },

    /**
     * Show the widget
     * @return {CUI.Widget} this, chainable
     */
    show: function (evt) {
      evt = evt || {};

      if (this.options.visible)
        return this;

      if (!evt.silent) {
        // Trigger event
        var e = $.Event('show');
        this.$element.trigger(e);

        // Do nothing if event is prevented or we're already visible
        if (e.isDefaultPrevented()) return this;
      }

      this.options.visible = true;

      this._show(evt);

      return this;
    },

    /**
     * @ignore
     */
    _show: function (evt) {
      this.$element.show();
    },

    /**
     * Hide the widget
     *
     * @return {CUI.Widget} this, chainable
     */
    hide: function (evt) {
      evt = evt || {};

      if (!this.options.visible)
        return this;

      if (!evt.silent) {
        // Trigger event
        var e = $.Event('hide');
        this.$element.trigger(e);

        if (e.isDefaultPrevented()) return this;
      }

      this.options.visible = false;

      this._hide(evt);

      return this;
    },

    /**
     * @ignore
     */
    _hide: function (evt) {
      this.$element.hide();
    },

    /**
     * Toggle the visibility of the widget
     * @return {CUI.Widget} this, chainable
     */
    toggleVisibility: function () {
      return this[!this.options.visible ? 'show' : 'hide']();
    },

    /**
     * Set a custom name for this widget.
     *
     * @param {String} customName Component name
     * @return {CUI.Widget} this, chainable
     */
    setName: function (customName) {
      /** @ignore */
      this.toString = function () {
        return customName;
      };

      return this;
    }

    /**
     Triggered when the widget is shown

     @name CUI.Widget#show
     @event
     */

    /**
     Triggered when the widget is hidden

     @name CUI.Widget#hide
     @event
     */

    /**
     Triggered when before an option is changed

     @name CUI.Widget#beforeChange:*
     @event

     @param {Object} evt                    Event object
     @param {Mixed} evt.option              The option that changed
     @param {Mixed} evt.currentValue        The current value
     @param {Mixed} evt.value               The value this option will be changed to
     @param {Function} evt.preventDefault   Call to prevent the option from changing
     */

    /**
     Triggered when an option is changed

     @name CUI.Widget#change:*
     @event

     @param {Object} evt          Event object
     @param {Mixed} evt.option    The option that changed
     @param {Mixed} evt.value     The new value
     */
  });

  /**
   * Utility function to get the widget class instance that's attached to
   * the provided element.
   *
   * @param WidgetClass The type of widget instance to obtain.
   * @param $element The target element to obtain the instance from.
   * @returns The obtained Widget instance, if the target element has an
   * instance attached.
   */
  CUI.Widget.fromElement = function (WidgetClass, $element) {
    return $element.data(CUI.util.decapitalize(WidgetClass.toString()));
  };

  /**
   * The registry object maps data-init selector values to Widget
   * types.
   */
  CUI.Widget.registry = {

    /**
     * Registers the given Widget type as the type that belongs
     * to the provided selector.
     *
     * @param selector String representing the data-init value
     * mapping to Widget.
     * @param Widget Widget subclass that maps to the given
     * selector.
     */
    register: function (selector, Widget) {

      // Register as a jQuery plug-in:
      CUI.util.plugClass(Widget);

      this._widgets[selector] = Widget;

      // Extend the Widget with a static 'init' method:
      Widget.init = function ($element) {
        this._init(Widget, $element);
      }.bind(this);

    },

    /**
     * Look-up the Widget subclass that is mapped to the provided
     * selector String value.
     *
     * @param selector String value to look-up the registered
     * Widget subclass for.
     * @returns a Widget subclass, or undefined if the selector
     * could not be resolved.
     */
    resolve: function (selector) {
      return this._widgets[selector];
    },

    /**
     * Initialize the given jQuery element(s) as Widgets of the
     * type as indicated by the selector argument.
     *
     * @param selector String that indicates what Widget subclass
     * must be used to initialize the element.
     * @param $element The jQuery element(s) that the instances
     * must be bound to.
     */
    init: function (selector, $element) {
      this._init(this.resolve(selector), $element);
    },

    getSelectors: function () {
      var selectors = [];
      for (var selector in this._widgets) {
        selectors.push(selector);
      }
      return selectors;
    },

    /**
     * Maps selector values to Widget types
     * @private
     */
    _widgets: {},

    /**
     * Implementation of the public init method, as well as the
     * init method that gets added to registering Widget classes
     *
     * @param Widget The Widget subclass to instantiate.
     * @param $element The jQuery element(s) that the instances
     * must be bound to.
     * @private
     */
    _init: function (Widget, $element) {
      if (Widget !== undefined) {
        $element.each(function () {
          var $item = $(this);

          if (CUI.Widget.fromElement(Widget, $item) === undefined) {
            new Widget({element: $item});
          }
        });
      }
    }
  };

}(jQuery, this));

(function ($) {

  var CLASS_ACTIVE = "is-active";

  CUI.Accordion = new Class(/** @lends CUI.Accordion# */{
    toString: 'Accordion',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A widget for both accordions and collapsibles

     @desc Creates a new accordion or collapsible
     @constructs

     @param {Object} options                               Widget options.
     @param {Mixed}  [options.active=false]                Index of the initial active tab of the accordion or one of true/false for collapsibles
     @param {boolean} [options.disabled=false]             Set the disabled state of the widget.
     @param {String} [options.iconClassCollapsed="coral-Icon--chevronRight"]
     @param {String} [options.iconClassDisabled="coral-Icon--chevronDown"]
     */
    construct: function (options) {
      this._parseAttributes();
      this._setAccordion();
      this._setListeners();
      this._makeAccessible();
      this._updateDOMForDisabled();
    },

    defaults: {
      active: false,
      disabled: false,
      iconClassCollapsed: 'coral-Icon--chevronRight',
      iconClassExpanded: 'coral-Icon--chevronDown'
    },

    isAccordion: false,

    _parseAttributes: function () {
      var iconClassCollapsed = this.$element.attr('data-icon-class-collapsed');
      if (iconClassCollapsed) {
        this.options.iconClassCollapsed = iconClassCollapsed;
      }
      var iconClassExpanded = this.$element.attr('data-icon-class-expanded');
      if (iconClassExpanded) {
        this.options.iconClassExpanded = iconClassExpanded;
      }
    },

    _setAccordion: function () {
      var $element = this.$element;
      // determines the type of component that it is building
      this.isAccordion = (!$element.hasClass("coral-Collapsible")) && ($element.data("init") !== "collapsible");

      if (this.isAccordion) {
        // adds the required class
        $element.addClass("coral-Accordion");

        var activeIndex = $element.children("." + CLASS_ACTIVE).index();
        if (this.options.active !== false) {
          activeIndex = this.options.active;
        } else {
          // saves the element with the active class as the active element
          this.options.active = activeIndex;
        }
        $element.children().each(function (index, element) {
          this._initElement(element, index != activeIndex);
        }.bind(this));
      } else {

        // checks if the element has the active class.
        this.options.active = $element.hasClass(CLASS_ACTIVE);
        this._initElement($element, !this.options.active);
      }
    },

    _setListeners: function () {
      // header selector
      var selector = this.isAccordion ? '> .coral-Accordion-item > .coral-Accordion-header' : '> .coral-Collapsible-header';
      this.$element.on('click', selector, this._toggle.bind(this));

      this.$element.on("change:active", this._changeActive.bind(this));

      // Prevent text selection on header
      var selectstartSelector = this.isAccordion ? '.coral-Accordion-header' : '.coral-Collapsible-header';
      this.$element.on("selectstart", selectstartSelector, function (event) {
        event.preventDefault();
      });

      this.on('change:disabled', function (event) {
        this._updateDOMForDisabled();
      }.bind(this));
    },

    /**
     * Updates styles and attributes to match the current disabled option value.
     * @ignore */
    _updateDOMForDisabled: function () {
      if (this.options.disabled) {
        this.$element.addClass('is-disabled').attr('aria-disabled', true)
          .find('[role=tab], > [role=button]').removeAttr('tabindex').attr('aria-disabled', true);
      } else {
        this.$element.removeClass('is-disabled').attr('aria-disabled', false)
          .find('[role=tab], > [role=button]').each(function (index, element) {
            var elem = $(element);
            elem.removeAttr('aria-disabled').attr('tabindex', elem.is('[aria-selected=true][aria-controls], [aria-expanded][aria-controls]') ? 0 : -1);
          });
      }
    },

    _toggle: function (event) {
      if (this.options.disabled) {
        return;
      }
      var el = $(event.target).closest(this._getCollapsibleSelector()),
        isCurrentlyActive = el.hasClass(CLASS_ACTIVE),
        active = (isCurrentlyActive) ? false : ((this.isAccordion) ? el.index() : true);
      this.setActive(active);
    },
    _changeActive: function () {
      if (this.isAccordion) {
        this._collapse(this.$element.children("." + CLASS_ACTIVE));
        if (this.options.active !== false) {
          var activeElement = this.$element.children().eq(this.options.active);
          this._expand(activeElement);
        }
      } else {
        if (this.options.active) {
          this._expand(this.$element);
        } else {
          this._collapse(this.$element);
        }
      }
    },
    setActive: function (active) {
      if (active !== this.options.active) {
        this.options.active = active;
        this._changeActive();
      }
    },
    _initElement: function (element, collapse) {
      element = $(element);

      // Add correct header
      if (this._getHeaderElement(element).length === 0) this._prependHeaderElement(element);
      if (this._getHeaderIconElement(element).length === 0) this._prependHeaderIconElement(element);

      // adds the content class
      if (this._getContentElement(element).length === 0) this._prependContentElement(element);

      // adds the corresponding container class
      element.addClass(this.isAccordion ? 'coral-Accordion-item' : 'coral-Collapsible');

      var header = this._getHeaderElement(element),
        content = this._getContentElement(element),
        icon = this._getHeaderIconElement(element);

      // move the heading before the collapsible content
      header.prependTo(element);

      // Set correct initial state
      if (collapse) {
        element.removeClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);
        content.hide();
      } else {
        element.addClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);
        content.show();
      }
    },
    _collapse: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);

      content.slideUp({
        duration: "fast",
        complete: function () {
          el.removeClass(CLASS_ACTIVE); // remove the active class after animation so that background color doesn't change during animation
          el.trigger("deactivate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("collapse", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": header.is(document.activeElement) ? 0 : -1,
          "aria-selected": false
        });
      } else {
        header.attr({
          "aria-expanded": false
        });
      }
      content.attr({
        "aria-hidden": true,
        "aria-expanded": false
      });
    },
    _expand: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      el.addClass(CLASS_ACTIVE);
      icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);

      content.slideDown({
        duration: "fast",
        complete: function () {
          el.trigger("activate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("expand", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": 0,
          "aria-selected": true
        });
      } else {
        header.attr({
          "aria-expanded": true
        });
      }
      content.attr({
        "aria-hidden": false,
        "aria-expanded": true
      }).show();
    },
    /** @ignore */
    _getCollapsibleSelector: function () {
      return this.isAccordion ? '.coral-Accordion-item' : '.coral-Collapsible';
    },
    /** @ignore */
    _getHeaderElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header' : '> .coral-Collapsible-header';
      return el.find(selector);
    },
    /** @ignore */
    _getHeaderFirstElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header:first' : '> .coral-Collapsible-header:first';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-header' : 'coral-Collapsible-header';
      el.prepend("<h3 class=\"" + className + "\">&nbsp;</h3>");
    },
    /** @ignore */
    _getHeaderIconElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header > i' : '> .coral-Collapsible-header > i';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderIconElement: function (el) {
      this._getHeaderElement(el).prepend("<i></i>");
    },
    /** @ignore */
    _getContentElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-content' : '> .coral-Collapsible-content';
      return el.find(selector);
    },
    /** @ignore */
    _prependContentElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-content' : 'coral-Collapsible-content';
      el.prepend("<div class=\"" + className + "\"></div>");
    },
    /**
     * adds accessibility attributes and features
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _makeAccessible: function () {
      var idPrefix = 'accordion-' + new Date().getTime() + '-',
        section, header, content, isActive, panelId;
      if (this.isAccordion) {

        this.$element.attr({
          "role": "tablist" // accordion container has the role="tablist"
        });

        this.$element.children(".coral-Accordion-item").each(function (i, e) {
          var section = $(e),
            header = section.find("> .coral-Accordion-header:first"),
            isActive = section.hasClass(CLASS_ACTIVE),
            panelId = idPrefix + 'panel-' + i,
            content = header.next("div");

          section.attr({
            "role": "presentation" // collapsible containers have the role="presentation"
          });

          header.attr({
            "role": "tab", // accordion headers should have the role="tab"
            "id": header.attr("id") || idPrefix + "tab-" + i, // each tab needs an id
            "aria-controls": panelId, // the id for the content wrapper this header controls
            "aria-selected": isActive, // an indication of the current state
            "tabindex": (isActive ? 0 : -1)
          });

          content.attr({
            "role": "tabpanel", // the content wrapper should have the role="tabpanel"
            "id": panelId, // each content wrapper needs a unique id
            "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
            "aria-expanded": isActive, // an indication of the current state
            "aria-hidden": !isActive // hide/show content to assistive technology
          });
        });

      } else {
        idPrefix = 'collapsible-' + new Date().getTime() + '-';
        section = this.$element;
        header = this._getHeaderFirstElement(section);
        isActive = section.hasClass(CLASS_ACTIVE);
        panelId = idPrefix + 'panel';
        content = header.next("div");

        header.attr({
          "role": "button", // the header should have the role="button"
          "id": header.attr("id") || idPrefix + "heading", // each header needs an id
          "aria-controls": panelId, // the id for the content wrapper this header controls
          "aria-expanded": isActive, // an indication of the current state
          "tabindex": 0
        });

        content.attr({
          "id": panelId, // each content wrapper needs a unique id
          "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
          "aria-expanded": isActive, // an indication of the current state
          "aria-hidden": !isActive // hide/show content to assistive technology
        });
      }

      // handle keydown events from focusable descendants
      this.$element.on('keydown', ':focusable', this._onKeyDown.bind(this));

      // handle focusin/focusout events from focusable descendants
      this.$element.on('focusin.accordion', ':focusable', this._onFocusIn.bind(this));
      this.$element.on('focusout.accordion', '.coral-Accordion-header:focusable', this._onFocusOut.bind(this));

      this.$element.on('touchstart.accordion, mousedown.accordion', '.coral-Accordion-header:focusable', this._onMouseDown.bind(this));
    },

    /**
     * keydown event handler, which defines the keyboard behavior of the accordion control
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _onKeyDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header),
        keymatch = true;

      switch (event.which) {
        case 13: //enter
        case 32: //space
          if (isHead) {
            header.trigger('click');
          } else {
            keymatch = false;
          }
          break;
        case 33: //page up
        case 37: //left arrow
        case 38: //up arrow
          if ((isHead && this.isAccordion) || (event.which === 33 && (event.metaKey || event.ctrlKey))) {
            // If the event.target is an accordion heading, or the key command is CTRL + PAGE_UP,
            // focus the previous accordion heading, or if none exists, focus the last accordion heading.
            if (this._getHeaderFirstElement(el.prev()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + UP or CTRL + LEFT, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 34: //page down
        case 39: //right arrow
        case 40: //down arrow
          if (isHead && this.isAccordion) {
            // If the event.target is an accordion heading,
            // focus the next accordion heading, or if none exists, focus the first accordion heading.
            if (this._getHeaderFirstElement(el.next()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && event.which === 34 && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + PAGE_DOWN, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 36: //home
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        case 35: //end
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        default:
          keymatch = false;
          break;
      }

      if (keymatch === true) {
        event.preventDefault();
      }
    },
    /**
     * focusin event handler, used to update tabindex properties on accordion headers
     * and to display focus style on headers.
     * @private
     */
    _onFocusIn: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (this.options.disabled) return;
      if (isHead) {
        if (this.isAccordion) {
          this.$element.find("> .coral-Accordion-item > .coral-Accordion-header[role=tab]").attr('tabindex', -1);
        }
        if (!header.data('collapsible-mousedown')) {
          // el.addClass(':focus');
          el.focus();
        } else {
          header.removeData('collapsible-mousedown');
        }
      }
      header.attr('tabindex', 0);
    },
    /**
     * focusout event handler, used to clear the focus style on headers.
     * @private
     */
    _onFocusOut: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        el.blur().removeData('collapsible-mousedown');
        // el.removeClass(':focus').removeData('collapsible-mousedown');
      }
    },
    /**
     * mousedown event handler, used flag
     * @private
     */
    _onMouseDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        header.data('collapsible-mousedown', true);
      }
    }

    /**
     Triggered when the accordion is activated

     @name CUI.Accordion#activate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered when the accordion is deactivated

     @name CUI.Accordion#deactivate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered while the accordion is expanding after each step of the animation

     @name CUI.Accordion#expand
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

    /**
     Triggered while the accordion is collapsing after each step of the animation

     @name CUI.Accordion#collapse
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

  });

  CUI.Widget.registry.register("accordion", CUI.Accordion);

// Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.Accordion.init($("[data-init~=accordion],[data-init~=collapsible]", e.target));
  });
}(window.jQuery));

(function ($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc An optionally closeable alert message.

      @desc Creates a new alert
      @constructs

      @param {Object} options                               Component options
      @param {String} [options.heading=Type, capitalized]   Title of the alert
      @param {String} options.content                       Content of the alert
      @param {Boolean} options.closeable                     Array of button descriptors
      @param {String} [options.size=small]                  Size of the alert. Either large or small.
      @param {String} [options.type=error]                  Type of alert to display. One of error, notice, success, help, or info
    */
    construct: function (options) {
      // Catch clicks to dismiss alert
      this.$element.delegate('[data-dismiss="alert"]', 'click.dismiss.alert', this.hide);

      // Add alert class to give styling
      this.$element.addClass('coral-Alert');

      // Listen to changes to configuration
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:closeable', this._setCloseable.bind(this));
      this.$element.on('change:size', this._setSize.bind(this));

      // Read in options "set" by markup so we don't override the values they set
      for (var typeKey in this._types) {
        if (this.$element.hasClass(this._types[typeKey]["class"])) {
          this.options.type = typeKey;
          return false;
        }
      }

      for (var sizeKey in this._sizes) {
        if (this.$element.hasClass(this._sizes[sizeKey])) {
          this.options.size = sizeKey;
          return false;
        }
      }

      this._setCloseable();
      this._setType();
      this._setSize();
      this._setHeading();
      this._setContent();

    },

    defaults: {
      type: 'error',
      size: 'small',
      heading: undefined,
      visible: true,
      closeable: true
    },

    _types: {
      "error" : { "class": "coral-Alert--error", "iconClass": "coral-Icon--alert"},
      "notice" : { "class":  "coral-Alert--notice", "iconClass": "coral-Icon--alert"},
      "success" : { "class":  "coral-Alert--success", "iconClass": "coral-Icon--checkCircle"},
      "help" : { "class":  "coral-Alert--help", "iconClass": "coral-Icon--helpCircle"},
      "info" : { "class":  "coral-Alert--info", "iconClass": "coral-Icon--infoCircle"}
    },

    _sizes: {
      "small" : "",
      "large" : "coral-Alert--large"
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content === 'string') {
        this.$element.find('div').html(this.options.content);
      }
    },

    /** @ignore */
    _setHeading: function () {
      if (typeof this.options.heading === 'string') {
        this.$element.find('strong').html(this.options.heading);
      }
    },

    /** @ignore */
    _setType: function () {
      if (this._isValidType(this.options.type)) {
        var icon = this.$element.find('> .coral-Icon');
        for (var key in this._types) {
           this.$element.removeClass(this._types[key]["class"]);
           icon.removeClass(this._types[key]["iconClass"]);
        }
        this.$element.addClass(this._types[this.options.type]["class"]);
        var iconClass = this._types[this.options.type]["iconClass"];
        icon.addClass(iconClass);
      }

    },

    /** @ignore */
    _setSize: function () {
      if (this._isValidSize(this.options.size)) {
        if (this.options.size === 'small') {
          this.$element.removeClass(this._sizes['large']);
        }
        else {
          this.$element.addClass(this._sizes['large']);
        }
      }
    },

    /** @ignore */
    _setCloseable: function () {
      var el = this.$element.find('.coral-Alert-closeButton');
      if (!el.length && this.options.closeable) {
        // Add the close element if it's not present
        this.$element.prepend('<button class="coral-MinimalButton coral-Alert-closeButton" title="Close" data-dismiss="alert"><i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon"></i></button>');
      }
      else {
        el[this.options.closeable ? 'show' : 'hide']();
      }
    },

    /** @ignore */
    _isValidType: function (value) {
      return typeof value == 'string' && this._types.hasOwnProperty(value);
    },

    /** @ignore */
    _isValidSize: function (value) {
      return typeof value == 'string' && this._sizes.hasOwnProperty(value);
    },

    /** @ignore */
    _fixType: function (value) {
      return this._isValidType(value) ? value : this.defaults.type;
    },

    /** @ignore */
    _fixHeading: function (value) {
      return value === undefined ? this._fixType(this.options.type).toUpperCase() : value;
    }

  });

  CUI.util.plugClass(CUI.Alert);

  // Data API
  if (CUI.options.dataAPI) {
    $(function () {
      $(document).on('click.alert.data-api', '[data-dismiss="alert"]', function (evt) {
        $(evt.currentTarget).parent().hide();
        evt.preventDefault();
      });
    });
  }
}(window.jQuery));

(function ($) {
  CUI.CharacterCount = new Class(/** @lends CUI.CharacterCount# */{
    toString: 'CharacterCount',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Give visual feedback of the maximum length for textfields/textarea to the user.
     <p>This widget will not restrict the
     user to the max length given: The user can enter as much text
     as he/she wants and will only get visual feedback.</p>
     <p>For textareas some browsers count newline characters differently: While they count as 2 chars in the browsers builtin maxlength support,
     they only count as 1 char in this widget.</p>

     @desc Create a character count for a textfield or textarea.
     @constructs

     @param {Object} options Component options
     @param {Object} [options.related] The related Textfield or TextArea for this component.
     @param {String} [options.maxlength] Maximum length for the Textfield/Textarea (will be read from markup if given)
     */
    construct: function (options) {

      this.$input = $(options.related);

      if (this.$input.attr("maxlength")) {
        this.options.maxlength = this.$input.attr("maxlength");
      }
      this.$input.removeAttr("maxlength"); // Remove so that we can do our own error handling

      this.$input.on("input", this._render.bind(this));
      this.$element.on("change:maxlength", this._render.bind(this));

      this._render();

    },

    defaults: {
      maxlength: null
    },

    /**
     * @private
     * @return {Number} [description]
     */
    _getLength: function () {
      return this.$input.is("input,textarea") ? this.$input.val().length :
        this.$input.text().length;
    },

    _render: function () {
      var len = this._getLength(),
        exceeded = this.options.maxlength ? (len > this.options.maxlength) : false;

      this.$input.toggleClass("is-invalid", exceeded);
      this.$element.toggleClass("is-invalid", exceeded);

      this.$element.text(this.options.maxlength ? (this.options.maxlength - len) : len);
    }
  });

  CUI.Widget.registry.register("character-count", CUI.CharacterCount);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CharacterCount.init($("[data-init~=character-count]", e.target));
  });
}(window.jQuery));



(function ($) {
  "use strict";

  function getNext(from) {
    var next = from.next();

    if (next.length > 0) {
      return next;
    }

    // returns the first child. i.e. rotating
    return from.prevAll().last();
  }

  CUI.CycleButton = new Class(/** @lends CUI.CycleButton# */{
    toString: "CycleButton",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc
     A component that show the current active item. Only one item can be active at the same time.
     When clicked, the next item of the active is shown and the click is triggered at that next item instead.
     If the last item is clicked, then the first item is shown and triggered accordingly.

     @desc Creates a new instance
     @constructs

     @param {Object} options Widget options
     */
    construct: function () {
      // Currently doesn't support form submission
      // When you need it please raise the issue in the mailing first, as the feature should not be necessarily implemented in this component

      this.$element.on("click", function (e) {
        if (e._cycleButton) {
          return;
        }

        e.stopPropagation();
        e.preventDefault();

        var toggle = $(this);

        if (toggle.children().length === 1) {
          return;
        }

        var from = toggle.children(".is-active");
        var to = getNext(from);

        from.removeClass("is-active");
        to.addClass("is-active").focus();

        var click = $.Event("click", {
          _cycleButton: true
        });
        to.trigger(click);
      });
    }
  });

  CUI.Widget.registry.register("cyclebutton", CUI.CycleButton);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CycleButton.init($("[data-init~='cyclebutton']", e.target));
  });
}(window.jQuery));

/**
 HTTP Utility functions used by CoralUI widgets

 @namespace
 */
CUI.util.HTTP = {
  /**
   * Checks whether the specified status code is OK.
   * @static
   * @param {Number} status The status code
   * @return {Boolean} True if the status is OK, else false
   */
  isOkStatus: function(status) {
    try {
      return (String(status).indexOf("2") === 0);
    } catch (e) {
      return false;
    }
  },

  /**
   * Returns <code>true</code> if HTML5 Upload is supported
   * @return {Boolean} HTML5 Upload support status
   */
  html5UploadSupported: function() {
    var xhr = new XMLHttpRequest();
    return !! (
      xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)
    );
  }
};

(function ($) {
  CUI.FileUpload = new Class(/** @lends CUI.FileUpload# */{
    toString: 'FileUpload',
    extend: CUI.Widget,

    /**
     Triggered when a file is selected and accepted into the queue

     @name CUI.FileUpload#fileselected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when a selected file is rejected before upload

     @name CUI.FileUpload#filerejected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.message            The reason why the file has been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when the internal upload queue changes (file added, file uploaded, etc.)

     @name CUI.FileUpload#queuechanged
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.operation          The operation on the queue (ADD or REMOVE)
     @param {int} evt.queueLength           The number of items in the queue
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when selected files list is processed

     @name CUI.FileUpload#filelistprocessed
     @event

     @param {Object} evt                    Event object
     @param {int} evt.addedCount            The number of files that have been added to the processing list
     @param {int} evt.rejectedCount         The number of files that have been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file starts

     @name CUI.FileUpload#fileuploadstart
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file progresses

     @name CUI.FileUpload#fileuploadprogress
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event (from which the upload ratio can be calculated)
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file is completed (for non-HTML5 uploads only, regardless of success status)

     @name CUI.FileUpload#fileuploadload
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.content            The server response to the upload request, which needs to be analyzed to determine if upload was successful
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file succeeded

     @name CUI.FileUpload#fileuploadsuccess
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file failed

     @name CUI.FileUpload#fileuploaderror
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {String} evt.message            The reason why the file upload failed
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file has been cancelled

     @name CUI.FileUpload#fileuploadcanceled
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging into a drop zone

     @name CUI.FileUpload#dropzonedragenter
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging over a drop zone

     @name CUI.FileUpload#dropzonedragover
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging out of a drop zone

     @name CUI.FileUpload#dropzonedragleave
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dropping files in a drop zone

     @name CUI.FileUpload#dropzonedrop
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drop event
     @param {FileList} evt.files            The list of dropped files
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     @extends CUI.Widget
     @classdesc A file upload widget

     @desc Creates a file upload field
     @constructs

     @param {Object}   options                                    Component options
     @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
     @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
     @param {String}   [options.uploadUrl=null]                   URL where to upload the file
     @param {String}   [options.uploadUrlBuilder=null]            Upload URL builder
     @param {boolean}  [options.disabled=false]                   Is this component disabled?
     @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
     @param {int}      [options.sizeLimit=null]                   File size limit
     @param {Array}    [options.mimeTypes=[]]                     Mime types allowed for uploading (proper mime types, wildcard "*" and file extensions are supported)
     @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
     @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
     @param {boolean}  [options.useHTML5=true]                    (Optional) Prefer HTML5 to upload files (if browser allows it)
     @param {boolean}  [options.dropZone=null]                    (Optional) Drop zone to upload files from file system directly (if browser allows it)
     @param {Object}   [options.events={}]                        (Optional) Event handlers
     */
    construct: function (options) {
      // Adjust DOM to our needs
      this._render();

      this.inputElement.on("change", function (event) {
        if (this.options.disabled) {
          return;
        }
        this._onFileSelectionChange(event);
      }.bind(this));
    },

    defaults: {
      name: "file",
      placeholder: null,
      uploadUrl: null,
      uploadUrlBuilder: null,
      disabled: false,
      multiple: false,
      sizeLimit: null,
      mimeTypes: [], // Default case: no restriction on mime types
      autoStart: false,
      fileNameParameter: null,
      useHTML5: true,
      dropZone: null,
      events: {}
    },

    inputElement: null,
    $inputContainer: null,
    fileNameElement: null,
    uploadQueue: [],

    /** @ignore */
    _render: function () {
      var self = this;

      // container for the input
      this.$inputContainer = this.$element.find(".coral-FileUpload-trigger");

      // Get the input element
      this.inputElement = this.$inputContainer.find(".coral-FileUpload-input");

      // Read configuration from markup
      this._readDataFromMarkup();

      if (!CUI.util.HTTP.html5UploadSupported()) {
        this.options.useHTML5 = false;
      }

      this._createMissingElements();

      // Register event handlers
      if (this.options.events) {
        if (typeof this.options.events === "object") {
          for (var name in this.options.events) {
            this._registerEventHandler(name, this.options.events[name]);
          }
        }
      }

      // Register drop zone
      if (this.options.useHTML5) {
        this._registerDropZone();
      } else {
        this.options.dropZone = null;
      }

      if (!this.options.placeholder) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }

      if (this.options.autoStart) {
        this._registerEventHandler("fileselected", function (event) {
          event.fileUpload.uploadFile(event.item);
        });
      }

      // URL built via JavaScript function
      if (this.options.uploadUrlBuilder) {
        this.options.uploadUrl = this.options.uploadUrlBuilder(this);
      }

      if (!this.options.uploadUrl || /\$\{.+\}/.test(this.options.uploadUrl)) {
        this.options.disabled = true;
      }

      this._update();
    },

    _registerDropZone: function () {
      var self = this;

      if (!self.options.dropZone) {
        // No dropZone specified, a default one that wraps the whole fileupload is then created
        self.$element.addClass("coral-FileUpload--dropSupport");

        self.options.dropZone = self.$element;
      }

      // Try to get the drop zone via a jQuery selector
      try {
        self.options.dropZone = $(self.options.dropZone);
      } catch (e) {
        delete self.options.dropZone;
      }

      if (self.options.dropZone) {
        self.options.dropZone
            .on("dragenter", function (e) {
              if (self._isActive()) {

                if (e.stopPropagation) {
                  e.stopPropagation();
                }
                if (e.preventDefault) {
                  e.preventDefault();
                }

                self.$element.trigger({
                  type: "dropzonedragenter",
                  originalEvent: e,
                  fileUpload: self
                });
              }

              return false;
            })
          .on("dragover", function (e) {
            if (self._isActive()) {
              self.isDragOver = true;

              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.$element.trigger({
                type: "dropzonedragover",
                originalEvent: e,
                fileUpload: self
              });
            }

            return false;
          })
          .on("dragleave", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.isDragOver = false;

              window.setTimeout(function () {
                if (!self.isDragOver) {
                  self.$element.trigger({
                    type: "dropzonedragleave",
                    originalEvent: e,
                    fileUpload: self
                  });
                }
              }, 1);
            }

            return false;
          })
          .on("drop", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              var files = e.originalEvent.dataTransfer.files;

              self.$element.trigger({
                type: "dropzonedrop",
                originalEvent: e,
                files: files,
                fileUpload: self
              });

              self._onFileSelectionChange(e, files);
            }

            return false;
          })
        ;
      }
    },

    _registerEventHandler: function (name, handler) {
      this.$element.on(name, handler);
    },

    _createMissingElements: function () {
      var self = this;

      var multiple = self.options.useHTML5 && self.options.multiple;
      if (self.inputElement.length === 0) {
        self.inputElement = $("<input/>", {
          type: "file",
          'class': 'coral-FileUpload-input',
          name: self.options.name,
          multiple: multiple
        });
        self.$inputContainer.prepend(self.inputElement);
      } else {
        self.inputElement.attr("multiple", multiple);
      }
    },

    /** @ignore */
    _readDataFromMarkup: function () {
      var self = this;
      if (this.inputElement.attr("name")) {
        this.options.name = this.inputElement.attr("name");
      }
      if (this.inputElement.attr("placeholder")) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }
      if (this.inputElement.data("placeholder")) {
        this.options.placeholder = this.inputElement.data("placeholder");
      }
      if (this.inputElement.attr("disabled") || this.inputElement.data("disabled")) {
        this.options.disabled = true;
      }
      if (this.inputElement.attr("multiple") || this.inputElement.data("multiple")) {
        this.options.multiple = true;
      }
      if (this.inputElement.data("uploadUrl")) {
        this.options.uploadUrl = this.inputElement.data("uploadUrl");
      }
      if (this.inputElement.data("uploadUrlBuilder")) {
        this.options.uploadUrlBuilder = CUI.util.buildFunction(this.inputElement.data("uploadUrlBuilder"), ["fileUpload"]);
      }
      if (this.inputElement.data("mimeTypes")) {
        this.options.mimeTypes = this.inputElement.data("mimeTypes");
      }
      if (this.inputElement.data("sizeLimit")) {
        this.options.sizeLimit = this.inputElement.data("sizeLimit");
      }
      if (this.inputElement.data("autoStart")) {
        this.options.autoStart = true;
      }
      if (this.inputElement.data("usehtml5")) {
        this.options.useHTML5 = this.inputElement.data("usehtml5") === true;
      }
      if (this.inputElement.data("dropzone")) {
        this.options.dropZone = this.inputElement.data("dropzone");
      }
      if (this.inputElement.data("fileNameParameter")) {
        this.options.fileNameParameter = this.inputElement.data("fileNameParameter");
      }
      var inputElementHTML = this.inputElement.length ? this.inputElement.get(0) : undefined;
      if (inputElementHTML) {
        $.each(inputElementHTML.attributes, function (i, attribute) {
          var match = /^data-event-(.*)$/.exec(attribute.name);
          if (match && match.length > 1) {
            var eventHandler = CUI.util.buildFunction(attribute.value, ["event"]);
            if (eventHandler) {
              self.options.events[match[1]] = eventHandler.bind(self);
            }
          }
        });
      }
    },

    /** @ignore */
    _update: function () {
      if (this.options.placeholder) {
        this.inputElement.attr("placeholder", this.options.placeholder);
      }

      if (this.options.disabled) {
        this.$element.addClass("is-disabled");
        this.$inputContainer.addClass("is-disabled");
        this.inputElement.attr("disabled", "disabled");
      } else {
        this.$element.removeClass("is-disabled");
        this.$inputContainer.removeClass("is-disabled");
        this.inputElement.removeAttr("disabled");
      }
    },

    /** @ignore */
    _onFileSelectionChange: function (event, files) {
      var addedCount = 0, rejectedCount = 0;
      if (this.options.useHTML5) {
        files = files || event.target.files;
        for (var i = 0; i < files.length; i++) {
          if (this._addFile(files[i])) {
            addedCount++;
          } else {
            rejectedCount++;
          }
        }
      } else {
        if (this._addFile(event.target)) {
          addedCount++;
        } else {
          rejectedCount++;
        }
      }

      this.$element.trigger({
        type: "filelistprocessed",
        addedCount: addedCount,
        rejectedCount: rejectedCount,
        fileUpload: this
      });
    },

    /** @ignore */
    _addFile: function (file) {
      var self = this;

      var fileName,
        fileMimeType;
      if (this.options.useHTML5) {
        fileName = file.name;
        fileMimeType = file.type;
      } else {
        fileName = $(file).attr("value") || file.value;
        fileMimeType = CUI.FileUpload.MimeTypes.getMimeTypeFromFileName(fileName);
      }
      if (fileName.lastIndexOf("\\") !== -1) {
        fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
      }

      // if no autostart is used we need to set fileNameParameter as an additional form input field
      // to be submitted with the form.
      if (self.options.fileNameParameter && !this.options.autoStart) {
        if (!self.fileNameElement) {
          // check if there is already a form input field defined to store the parameter
          self.fileNameElement = $("input[name=\"" + self.options.fileNameParameter + "\"]");
          if (self.fileNameElement.length === 0) {
            // create and append
            self.fileNameElement = $("<input/>", {
              type: "hidden",
              name: self.options.fileNameParameter
            });
            self.fileNameElement.appendTo(self.$element);
          }
        }
        self.fileNameElement.val(fileName);
      }

      if (!self._getQueueItemByFileName(fileName)) {
        var item = {
          fileName: fileName
        };
        if (this.options.useHTML5) {
          item.file = file;
          item.fileSize = file.size;

          // Check file size
          if (self.options.sizeLimit && file.size > self.options.sizeLimit) {
            self.$element.trigger({
              type: "filerejected",
              item: item,
              message: "File is too big",
              fileUpload: self
            });
            return false;
          }
        }

        // Check file mime type against allowed mime types
        if (!self._checkMimeTypes(fileMimeType)) {
          self.$element.trigger({
            type: "filerejected",
            item: item,
            message: "File mime type is not allowed",
            fileUpload: self
          });
          return false;
        }

        // Add item to queue
        self.uploadQueue.push(item);
        self.$element.trigger({
          type: "queuechanged",
          item: item,
          operation: "ADD",
          queueLength: self.uploadQueue.length,
          fileUpload: self
        });

        self.$element.trigger({
          type: "fileselected",
          item: item,
          fileUpload: self
        });

        return true;
      }

      return false;
    },

    /** @ignore */
    _checkMimeTypes: function (fileMimeType) {
      function isMimeTypeAllowed(fileMimeType, allowedMimeType) {
        var mimeTypeRegEx = /(.+)\/(.+)$/,      // "text/plain"
          fileExtensionRegEx = /\.(.+)$/,     // ".txt"
          shortcutRegEx = /.*/,               // "text"
          isAllowed = false;

        if (allowedMimeType === "*" || allowedMimeType === ".*" || allowedMimeType === "*/*") {
          // Explicit wildcard case: allow any file
          isAllowed = true;
        } else if (!fileMimeType || !fileMimeType.match(mimeTypeRegEx)) {
          // File mime type is erroneous
          isAllowed = false;
        } else if (allowedMimeType.match(mimeTypeRegEx)) {
          // Proper mime type case: directly compare with file mime type
          isAllowed = (fileMimeType === allowedMimeType);
        } else if (allowedMimeType.match(fileExtensionRegEx)) {
          // File extension case: map extension to proper mime type and then compare
          isAllowed = (fileMimeType === CUI.FileUpload.MimeTypes[allowedMimeType]);
        } else if (allowedMimeType.match(shortcutRegEx)) {
          // "Shortcut" case: only compare first part of the file mime type with the shortcut
          isAllowed = (fileMimeType.split("/")[0] === allowedMimeType);
        }
        return isAllowed;
      }

      var length = this.options.mimeTypes.length,
        i;

      if (length === 0) {
        // No restriction has been defined (default case): allow any file
        return true;
      } else {
        // Some restrictions have been defined
        for (i = 0; i < length; i += 1) {
          if (isMimeTypeAllowed(fileMimeType, this.options.mimeTypes[i])) {
            return true;
          }
        }
        // The file mime type matches none of the mime types allowed
        return false;
      }

    },

    /** @ignore */
    _getQueueIndex: function (fileName) {
      var index = -1;
      $.each(this.uploadQueue, function (i, item) {
        if (item.fileName === fileName) {
          index = i;
          return false;
        }
      });
      return index;
    },

    /** @ignore */
    _getQueueItem: function (index) {
      return index > -1 ? this.uploadQueue[index] : null;
    },

    /** @ignore */
    _getQueueItemByFileName: function (fileName) {
      return this._getQueueItem(this._getQueueIndex(fileName));
    },

    /**
     Upload a file item

     @param {Object} item                   Object representing a file item
     */
    uploadFile: function (item) {
      var self = this;

      if (self.options.useHTML5) {
        item.xhr = new XMLHttpRequest();
        item.xhr.addEventListener("loadstart", function (e) {
          self._onUploadStart(e, item);
        }, false);
        item.xhr.addEventListener("load", function (e) {
          self._onUploadLoad(e, item);
        }, false);
        item.xhr.addEventListener("error", function (e) {
          self._onUploadError(e, item);
        }, false);
        item.xhr.addEventListener("abort", function (e) {
          self._onUploadCanceled(e, item);
        }, false);

        var upload = item.xhr.upload;
        upload.addEventListener("progress", function (e) {
          self._onUploadProgress(e, item);
        }, false);

        // TODO: encoding of special characters in file names
        var file = item.file;
        var fileName = item.fileName;
        if (window.FormData) {
          var f = new FormData();
          if (self.options.fileNameParameter) {
            // Custom file and file name parameter
            f.append(self.inputElement.attr("name"), file);
            f.append(self.options.fileNameParameter || "fileName", fileName);
          } else {
            f.append(fileName, file);
          }
          f.append("_charset_", "utf-8");

          item.xhr.open("POST", self.options.uploadUrl + "?:ck=" + new Date().getTime(), true);
          item.xhr.send(f);
        } else {
          item.xhr.open("PUT", self.options.uploadUrl + "/" + fileName, true);
          item.xhr.send(file);
        }

      } else {
        var $body = $(document.body);

        // Build an iframe
        var iframeName = "upload-" + new Date().getTime();
        var $iframe = $("<iframe/>", {
          name: iframeName,
          "class": "coral-FileUpload-iframe"
        }).appendTo($body);

        // Build a form
        var $form = $("<form/>", {
          method: "post",
          enctype: "multipart/form-data",
          action: self.options.uploadUrl,
          target: iframeName,
          "class": "coral-FileUpload-form"
        }).appendTo($body);

        var $charset = $("<input/>", {
          type: "hidden",
          name: "_charset_",
          value: "utf-8"
        });
        $form.prepend($charset);

        // Define value of the file name element
        if (this.options.fileNameParameter) {
          this.fileNameElement = $("<input/>", {
            type: "hidden",
            name: this.options.fileNameParameter,
            value: item.fileName
          });
          $form.prepend(this.fileNameElement);
        }

        $iframe.one("load", function () {
          var content = this.contentWindow.document.body.innerHTML;
          self.inputElement.prependTo(self.$element);
          $form.remove();
          $iframe.remove();

          self.$element.trigger({
            type: "fileuploadload",
            item: item,
            content: content,
            fileUpload: self
          });
        });

        self.inputElement.prependTo($form);
        $form.submit();
      }
    },

    /**
     Cancel upload of a file item

     @param {Object} item                   Object representing a file item
     */
    cancelUpload: function (item) {
      item.xhr.abort();
    },

    /** @ignore */
    _onUploadStart: function (e, item) {
      this.$element.trigger({
        type: "fileuploadstart",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadProgress: function (e, item) {
      // Update progress bar
      this.$element.trigger({
        type: "fileuploadprogress",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadLoad: function (e, item) {
      var request = e.target;
      if (request.readyState === 4) {
        this._internalOnUploadLoad(e, item, request.status, request.responseText);
      }
    },

    /** @ignore */
    _internalOnUploadLoad: function (e, item, requestStatus, responseText) {
      if (CUI.util.HTTP.isOkStatus(requestStatus)) {
        this.$element.trigger({
          type: "fileuploadsuccess",
          item: item,
          originalEvent: e,
          fileUpload: this
        });
      } else {
        this.$element.trigger({
          type: "fileuploaderror",
          item: item,
          originalEvent: e,
          message: responseText,
          fileUpload: this
        });
      }

      // Remove file name element if needed
      if (this.fileNameElement) {
        this.fileNameElement.remove();
      }

      // Remove queue item
      this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
      this.$element.trigger({
        type: "queuechanged",
        item: item,
        operation: "REMOVE",
        queueLength: this.uploadQueue.length,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadError: function (e, item) {
      this.$element.trigger({
        type: "fileuploaderror",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadCanceled: function (e, item) {
      this.$element.trigger({
        type: "fileuploadcanceled",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _isActive: function () {
      return !this.inputElement.is(':disabled');
    }

  });

  CUI.Widget.registry.register("fileupload", CUI.FileUpload);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FileUpload.init($("[data-init~='fileupload']", e.target));
    });
  }

}(window.jQuery));

(function ($) {
  CUI.FileUpload.MimeTypes =
  {
    ".3dm": "x-world/x-3dmf",
    ".3dmf": "x-world/x-3dmf",
    ".a": "application/octet-stream",
    ".aab": "application/x-authorware-bin",
    ".aam": "application/x-authorware-map",
    ".aas": "application/x-authorware-seg",
    ".abc": "text/vnd.abc",
    ".acgi": "text/html",
    ".afl": "video/animaflex",
    ".ai": "application/postscript",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".aim": "application/x-aim",
    ".aip": "text/x-audiosoft-intra",
    ".ani": "application/x-navi-animation",
    ".aos": "application/x-nokia-9000-communicator-add-on-software",
    ".aps": "application/mime",
    ".arc": "application/octet-stream",
    ".arj": "application/octet-stream",
    ".art": "image/x-jg",
    ".asf": "video/x-ms-asf",
    ".asm": "text/x-asm",
    ".asp": "text/asp",
    ".asx": "video/x-ms-asf-plugin",
    ".au": "audio/x-au",
    ".avi": "video/x-msvideo",
    ".avs": "video/avs-video",
    ".bcpio": "application/x-bcpio",
    ".bin": "application/x-macbinary",
    ".bm": "image/bmp",
    ".bmp": "image/x-windows-bmp",
    ".boo": "application/book",
    ".book": "application/book",
    ".boz": "application/x-bzip2",
    ".bsh": "application/x-bsh",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".c": "text/x-c",
    ".c++": "text/plain",
    ".cat": "application/vnd.ms-pki.seccat",
    ".cc": "text/x-c",
    ".ccad": "application/clariscad",
    ".cco": "application/x-cocoa",
    ".cdf": "application/x-netcdf",
    ".cer": "application/x-x509-ca-cert",
    ".cha": "application/x-chat",
    ".chat": "application/x-chat",
    ".class": "application/x-java-class",
    ".com": "text/plain",
    ".conf": "text/plain",
    ".cpio": "application/x-cpio",
    ".cpp": "text/x-c",
    ".cpt": "application/x-cpt",
    ".crl": "application/pkix-crl",
    ".crt": "application/x-x509-user-cert",
    ".csh": "text/x-script.csh",
    ".css": "text/css",
    ".cxx": "text/plain",
    ".dcr": "application/x-director",
    ".deepv": "application/x-deepv",
    ".def": "text/plain",
    ".der": "application/x-x509-ca-cert",
    ".dif": "video/x-dv",
    ".dir": "application/x-director",
    ".dl": "video/x-dl",
    ".doc": "application/msword",
    ".dot": "application/msword",
    ".dp": "application/commonground",
    ".drw": "application/drafting",
    ".dump": "application/octet-stream",
    ".dv": "video/x-dv",
    ".dvi": "application/x-dvi",
    ".dwf": "model/vnd.dwf",
    ".dwg": "image/x-dwg",
    ".dxf": "image/x-dwg",
    ".dxr": "application/x-director",
    ".el": "text/x-script.elisp",
    ".elc": "application/x-elc",
    ".env": "application/x-envoy",
    ".eps": "application/postscript",
    ".es": "application/x-esrehber",
    ".etx": "text/x-setext",
    ".evy": "application/x-envoy",
    ".exe": "application/octet-stream",
    ".f": "text/x-fortran",
    ".f77": "text/x-fortran",
    ".f90": "text/x-fortran",
    ".fdf": "application/vnd.fdf",
    ".fif": "image/fif",
    ".fli": "video/x-fli",
    ".flo": "image/florian",
    ".flx": "text/vnd.fmi.flexstor",
    ".fmf": "video/x-atomic3d-feature",
    ".for": "text/x-fortran",
    ".fpx": "image/vnd.net-fpx",
    ".frl": "application/freeloader",
    ".funk": "audio/make",
    ".g": "text/plain",
    ".g3": "image/g3fax",
    ".gif": "image/gif",
    ".gl": "video/x-gl",
    ".gsd": "audio/x-gsm",
    ".gsm": "audio/x-gsm",
    ".gsp": "application/x-gsp",
    ".gss": "application/x-gss",
    ".gtar": "application/x-gtar",
    ".gz": "application/x-gzip",
    ".gzip": "multipart/x-gzip",
    ".h": "text/x-h",
    ".hdf": "application/x-hdf",
    ".help": "application/x-helpfile",
    ".hgl": "application/vnd.hp-hpgl",
    ".hh": "text/x-h",
    ".hlb": "text/x-script",
    ".hlp": "application/x-winhelp",
    ".hpg": "application/vnd.hp-hpgl",
    ".hpgl": "application/vnd.hp-hpgl",
    ".hqx": "application/x-mac-binhex40",
    ".hta": "application/hta",
    ".htc": "text/x-component",
    ".htm": "text/html",
    ".html": "text/html",
    ".htmls": "text/html",
    ".htt": "text/webviewhtml",
    ".htx": "text/html",
    ".ice": "x-conference/x-cooltalk",
    ".ico": "image/x-icon",
    ".idc": "text/plain",
    ".ief": "image/ief",
    ".iefs": "image/ief",
    ".iges": "model/iges",
    ".igs": "model/iges",
    ".ima": "application/x-ima",
    ".imap": "application/x-httpd-imap",
    ".inf": "application/inf",
    ".ins": "application/x-internett-signup",
    ".ip": "application/x-ip2",
    ".isu": "video/x-isvideo",
    ".it": "audio/it",
    ".iv": "application/x-inventor",
    ".ivr": "i-world/i-vrml",
    ".ivy": "application/x-livescreen",
    ".jam": "audio/x-jam",
    ".jav": "text/x-java-source",
    ".java": "text/x-java-source",
    ".jcm": "application/x-java-commerce",
    ".jfif": "image/pjpeg",
    ".jfif-tbnl": "image/jpeg",
    ".jpe": "image/pjpeg",
    ".jpeg": "image/pjpeg",
    ".jpg": "image/pjpeg",
    ".jps": "image/x-jps",
    ".js": "application/x-javascript",
    ".jut": "image/jutvision",
    ".kar": "music/x-karaoke",
    ".ksh": "text/x-script.ksh",
    ".la": "audio/x-nspaudio",
    ".lam": "audio/x-liveaudio",
    ".latex": "application/x-latex",
    ".lha": "application/x-lha",
    ".lhx": "application/octet-stream",
    ".list": "text/plain",
    ".lma": "audio/x-nspaudio",
    ".log": "text/plain",
    ".lsp": "text/x-script.lisp",
    ".lst": "text/plain",
    ".lsx": "text/x-la-asf",
    ".ltx": "application/x-latex",
    ".lzh": "application/x-lzh",
    ".lzx": "application/x-lzx",
    ".m": "text/x-m",
    ".m1v": "video/mpeg",
    ".m2a": "audio/mpeg",
    ".m2v": "video/mpeg",
    ".m3u": "audio/x-mpequrl",
    ".man": "application/x-troff-man",
    ".map": "application/x-navimap",
    ".mar": "text/plain",
    ".mbd": "application/mbedlet",
    ".mc$": "application/x-magic-cap-package-1.0",
    ".mcd": "application/x-mathcad",
    ".mcf": "text/mcf",
    ".mcp": "application/netmc",
    ".me": "application/x-troff-me",
    ".mht": "message/rfc822",
    ".mhtml": "message/rfc822",
    ".mid": "x-music/x-midi",
    ".midi": "x-music/x-midi",
    ".mif": "application/x-mif",
    ".mime": "www/mime",
    ".mjf": "audio/x-vnd.audioexplosion.mjuicemediafile",
    ".mjpg": "video/x-motion-jpeg",
    ".mm": "application/x-meme",
    ".mme": "application/base64",
    ".mod": "audio/x-mod",
    ".moov": "video/quicktime",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "video/x-mpeq2a",
    ".mp3": "video/x-mpeg",
    ".mpa": "video/mpeg",
    ".mpc": "application/x-project",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpga": "audio/mpeg",
    ".mpp": "application/vnd.ms-project",
    ".mpt": "application/x-project",
    ".mpv": "application/x-project",
    ".mpx": "application/x-project",
    ".mrc": "application/marc",
    ".ms": "application/x-troff-ms",
    ".mv": "video/x-sgi-movie",
    ".my": "audio/make",
    ".mzz": "application/x-vnd.audioexplosion.mzz",
    ".nap": "image/naplps",
    ".naplps": "image/naplps",
    ".nc": "application/x-netcdf",
    ".ncm": "application/vnd.nokia.configuration-message",
    ".nif": "image/x-niff",
    ".niff": "image/x-niff",
    ".nix": "application/x-mix-transfer",
    ".nsc": "application/x-conference",
    ".nvd": "application/x-navidoc",
    ".o": "application/octet-stream",
    ".oda": "application/oda",
    ".omc": "application/x-omc",
    ".omcd": "application/x-omcdatamaker",
    ".omcr": "application/x-omcregerator",
    ".p": "text/x-pascal",
    ".p10": "application/x-pkcs10",
    ".p12": "application/x-pkcs12",
    ".p7a": "application/x-pkcs7-signature",
    ".p7c": "application/x-pkcs7-mime",
    ".p7m": "application/x-pkcs7-mime",
    ".p7r": "application/x-pkcs7-certreqresp",
    ".p7s": "application/pkcs7-signature",
    ".part": "application/pro_eng",
    ".pas": "text/pascal",
    ".pbm": "image/x-portable-bitmap",
    ".pcl": "application/x-pcl",
    ".pct": "image/x-pict",
    ".pcx": "image/x-pcx",
    ".pdb": "chemical/x-pdb",
    ".pdf": "application/pdf",
    ".pfunk": "audio/make.my.funk",
    ".pgm": "image/x-portable-greymap",
    ".pic": "image/pict",
    ".pict": "image/pict",
    ".pkg": "application/x-newton-compatible-pkg",
    ".pko": "application/vnd.ms-pki.pko",
    ".pl": "text/x-script.perl",
    ".plx": "application/x-pixclscript",
    ".pm": "text/x-script.perl-module",
    ".pm4": "application/x-pagemaker",
    ".pm5": "application/x-pagemaker",
    ".png": "image/png",
    ".pnm": "image/x-portable-anymap",
    ".pot": "application/vnd.ms-powerpoint",
    ".pov": "model/x-pov",
    ".ppa": "application/vnd.ms-powerpoint",
    ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppt": "application/x-mspowerpoint",
    ".ppz": "application/mspowerpoint",
    ".pre": "application/x-freelance",
    ".prt": "application/pro_eng",
    ".ps": "application/postscript",
    ".psd": "application/octet-stream",
    ".pvu": "paleovu/x-pv",
    ".pwz": "application/vnd.ms-powerpoint",
    ".py": "text/x-script.phyton",
    ".pyc": "applicaiton/x-bytecode.python",
    ".qcp": "audio/vnd.qcelp",
    ".qd3": "x-world/x-3dmf",
    ".qd3d": "x-world/x-3dmf",
    ".qif": "image/x-quicktime",
    ".qt": "video/quicktime",
    ".qtc": "video/x-qtc",
    ".qti": "image/x-quicktime",
    ".qtif": "image/x-quicktime",
    ".ra": "audio/x-realaudio",
    ".ram": "audio/x-pn-realaudio",
    ".ras": "image/x-cmu-raster",
    ".rast": "image/cmu-raster",
    ".rexx": "text/x-script.rexx",
    ".rf": "image/vnd.rn-realflash",
    ".rgb": "image/x-rgb",
    ".rm": "audio/x-pn-realaudio",
    ".rmi": "audio/mid",
    ".rmm": "audio/x-pn-realaudio",
    ".rmp": "audio/x-pn-realaudio-plugin",
    ".rng": "application/vnd.nokia.ringing-tone",
    ".rnx": "application/vnd.rn-realplayer",
    ".roff": "application/x-troff",
    ".rp": "image/vnd.rn-realpix",
    ".rpm": "audio/x-pn-realaudio-plugin",
    ".rt": "text/vnd.rn-realtext",
    ".rtf": "text/richtext",
    ".rtx": "text/richtext",
    ".rv": "video/vnd.rn-realvideo",
    ".s": "text/x-asm",
    ".s3m": "audio/s3m",
    ".saveme": "application/octet-stream",
    ".sbk": "application/x-tbook",
    ".scm": "video/x-scm",
    ".sdml": "text/plain",
    ".sdp": "application/x-sdp",
    ".sdr": "application/sounder",
    ".sea": "application/x-sea",
    ".set": "application/set",
    ".sgm": "text/x-sgml",
    ".sgml": "text/x-sgml",
    ".sh": "text/x-script.sh",
    ".shar": "application/x-shar",
    ".shtml": "text/x-server-parsed-html",
    ".sid": "audio/x-psid",
    ".sit": "application/x-stuffit",
    ".skd": "application/x-koan",
    ".skm": "application/x-koan",
    ".skp": "application/x-koan",
    ".skt": "application/x-koan",
    ".sl": "application/x-seelogo",
    ".smi": "application/smil",
    ".smil": "application/smil",
    ".snd": "audio/x-adpcm",
    ".sol": "application/solids",
    ".spc": "text/x-speech",
    ".spl": "application/futuresplash",
    ".spr": "application/x-sprite",
    ".sprite": "application/x-sprite",
    ".src": "application/x-wais-source",
    ".ssi": "text/x-server-parsed-html",
    ".ssm": "application/streamingmedia",
    ".sst": "application/vnd.ms-pki.certstore",
    ".step": "application/step",
    ".stl": "application/x-navistyle",
    ".stp": "application/step",
    ".sv4cpio": "application/x-sv4cpio",
    ".sv4crc": "application/x-sv4crc",
    ".svf": "image/x-dwg",
    ".svr": "x-world/x-svr",
    ".swf": "application/x-shockwave-flash",
    ".t": "application/x-troff",
    ".talk": "text/x-speech",
    ".tar": "application/x-tar",
    ".tbk": "application/x-tbook",
    ".tcl": "text/x-script.tcl",
    ".tcsh": "text/x-script.tcsh",
    ".tex": "application/x-tex",
    ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo",
    ".text": "text/plain",
    ".tgz": "application/x-compressed",
    ".tif": "image/x-tiff",
    ".tiff": "image/x-tiff",
    ".tr": "application/x-troff",
    ".tsi": "audio/tsp-audio",
    ".tsp": "audio/tsplayer",
    ".tsv": "text/tab-separated-values",
    ".turbot": "image/florian",
    ".txt": "text/plain",
    ".uil": "text/x-uil",
    ".uni": "text/uri-list",
    ".unis": "text/uri-list",
    ".unv": "application/i-deas",
    ".uri": "text/uri-list",
    ".uris": "text/uri-list",
    ".ustar": "multipart/x-ustar",
    ".uu": "text/x-uuencode",
    ".uue": "text/x-uuencode",
    ".vcd": "application/x-cdlink",
    ".vcs": "text/x-vcalendar",
    ".vda": "application/vda",
    ".vdo": "video/vdo",
    ".vew": "application/groupwise",
    ".viv": "video/vnd.vivo",
    ".vivo": "video/vnd.vivo",
    ".vmd": "application/vocaltec-media-desc",
    ".vmf": "application/vocaltec-media-file",
    ".voc": "audio/x-voc",
    ".vos": "video/vosaic",
    ".vox": "audio/voxware",
    ".vqe": "audio/x-twinvq-plugin",
    ".vqf": "audio/x-twinvq",
    ".vql": "audio/x-twinvq-plugin",
    ".vrml": "x-world/x-vrml",
    ".vrt": "x-world/x-vrt",
    ".vsd": "application/x-visio",
    ".vst": "application/x-visio",
    ".vsw": "application/x-visio",
    ".w60": "application/wordperfect6.0",
    ".w61": "application/wordperfect6.1",
    ".w6w": "application/msword",
    ".wav": "audio/x-wav",
    ".wb1": "application/x-qpro",
    ".wbmp": "image/vnd.wap.wbmp",
    ".web": "application/vnd.xara",
    ".wiz": "application/msword",
    ".wk1": "application/x-123",
    ".wmf": "windows/metafile",
    ".wml": "text/vnd.wap.wml",
    ".wmlc": "application/vnd.wap.wmlc",
    ".wmls": "text/vnd.wap.wmlscript",
    ".wmlsc": "application/vnd.wap.wmlscriptc",
    ".word": "application/msword",
    ".wp": "application/wordperfect",
    ".wp5": "application/wordperfect6.0",
    ".wp6": "application/wordperfect",
    ".wpd": "application/x-wpwin",
    ".wq1": "application/x-lotus",
    ".wri": "application/x-wri",
    ".wrl": "x-world/x-vrml",
    ".wrz": "x-world/x-vrml",
    ".wsc": "text/scriplet",
    ".wsrc": "application/x-wais-source",
    ".wtk": "application/x-wintalk",
    ".xbm": "image/xbm",
    ".xdr": "video/x-amt-demorun",
    ".xgz": "xgl/drawing",
    ".xif": "image/vnd.xiff",
    ".xl": "application/excel",
    ".xla": "application/x-msexcel",
    ".xlb": "application/x-excel",
    ".xlc": "application/x-excel",
    ".xld": "application/x-excel",
    ".xlk": "application/x-excel",
    ".xll": "application/x-excel",
    ".xlm": "application/x-excel",
    ".xls": "application/x-msexcel",
    ".xlt": "application/x-excel",
    ".xlv": "application/x-excel",
    ".xlw": "application/x-msexcel",
    ".xm": "audio/xm",
    ".xml": "text/xml",
    ".xmz": "xgl/movie",
    ".xpix": "application/x-vnd.ls-xpix",
    ".xpm": "image/xpm",
    ".x-png": "image/png",
    ".xsr": "video/x-amt-showrun",
    ".xwd": "image/x-xwindowdump",
    ".xyz": "chemical/x-pdb",
    ".z": "application/x-compressed",
    ".zip": "multipart/x-zip",
    ".zoo": "application/octet-stream",
    ".zsh": "text/x-script.zsh"
  };

  /**
   Returns the mime type corresponding to the given file name's extension

   @param {String}                   fileName Name of the file
   */
  CUI.FileUpload.MimeTypes.getMimeTypeFromFileName = function (fileName) {
    var fileExtensionMatch = fileName.match(/.+(\..+)/);

    return (fileExtensionMatch ?
      CUI.FileUpload.MimeTypes[fileExtensionMatch[1]] :
      undefined);
  };
}(window.jQuery));

(function ($) {
  CUI.NumberInput = new Class(/** @lends CUI.NumberInput# */{
    toString: 'NumberInput',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A number input widget with increment and decrement buttons.

     @desc Creates a Number Input object
     @constructs
     @param {Object} options Component options
     @param {numberic} [options.min=NaN] (Optional) Minimum value allowed for input.
     @param {numberic} [options.max=NaN] (Optional) Maximum value allowed for input.
     @param {numberic} [options.step=1] Amount increment/decrement for input.
     @param {numberic} [options.defaultValue=0] Fallback value in case the input is empty at the beginning.
     @param {boolean} [options.hasError=false] Set the error state of the widget.
     @param {boolean} [options.disabled=false] Set the disabled state of the widget.
     */

    construct: function (options) {

      this._initMarkup();
      this._setListeners();
      this._setAttributes();

    },

    defaults: {
      defaultValue: 0,
      max: null,
      min: null,
      step: 1,
      hasError: false,
      disabled: false
    },

    /**
     Increments value by step amount
     */
    increment: function () {
      if (this._isNumber()) {
        var value = this.getValue();
        value += this.getStep();
        value = value > this.getMax() ? this.getMax() : value;
        this.setValue(value);
      }
    },

    /**
     Decrements value by step amount
     */
    decrement: function () {
      var value = this.getValue();
      value -= this.getStep();
      value = value < this.getMin() ? this.getMin() : value;
      this.setValue(value);
    },

    /**
     Sets the value, which triggers the change event.  Note that value will be
     limited to the range defined by the min and max properties.
     @param value {numberic} The input value to set.
     */
    setValue: function (value) {
      this.$input.val(value);
      this.$input.trigger('change');
    },

    /**
     Sets the minimum value allowed.
     @param value {numberic} The min value to set.
     */
    setMin: function (value) {
      this.set('min', value);
    },

    /**
     Sets the maximum value allowed.
     @param value {numberic} The max value to set.
     */
    setMax: function (value) {
      this.set('max', value);
    },


    /**
     Sets the step value for increment and decrement.
     @param value {numberic} The step value to set.
     */
    setStep: function (value) {
      this.set('step', value);
    },

    /**
     Attempts to return parseFloat for value.
     Does not attempt to parse null, undefined, or empty string.
     @return The current input value.
     */
    getValue: function () {
      var result = this.$input.val();
      if (typeof result == 'undefined' ||
        result == null ||
        result.length < 1) {
        result = '';
      } else {
        result = parseFloat(result);
      }
      return result;
    },

    /**
     @return The minimum input value allowed.
     */
    getMin: function () {
      return parseFloat(this.options.min);
    },

    /**
     @return The maximum input value allowed.
     */
    getMax: function () {
      return parseFloat(this.options.max);
    },

    /**
     @return The current increment/decrement step amount .
     */
    getStep: function () {
      return parseFloat(this.options.step);
    },

    /** @ignore */
    _initMarkup: function () {
      // get the input, fix it if it's number
      this.$input = this.$element.find('.js-coral-NumberInput-input');
      if (this.$input.attr('type') != 'text') {
        this._switchInputTypeToText(this.$input);
      }

      this.$decrementElement = this.$element.find('.js-coral-NumberInput-decrementButton');
      this.$incrementElement = this.$element.find('.js-coral-NumberInput-incrementButton');
    },

    /** @ignore */
    _setListeners: function () {

      this.$input.on('change', function () {
        this._checkMinMaxViolation();
        this._adjustValueLimitedToRange();
      }.bind(this));

      this.on('beforeChange:step', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:min', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:max', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('change:disabled', function (event) {
        this._toggleDisabled();
      }.bind(this));

      this.on('change:hasError', function (event) {
        this._toggleError();
      }.bind(this));

      this.$incrementElement.on('click', function () {
        this.increment();
      }.bind(this));

      this.$decrementElement.on('click', function (event) {
        this.decrement();
      }.bind(this));

    },

    /** @ignore */
    _setAttributes: function () {

      if (this.$input.attr('max')) {
        this.setMax(this.$input.attr('max'));
      }

      if (this.$input.attr('min')) {
        this.setMin(this.$input.attr('min'));
      }

      if (this.$input.attr('step')) {
        this.setStep(this.$input.attr('step'));
      }

      if (this.$element.attr("error")) {
        this.options.hasError = true;
      }

      this.setStep(this.options.step || CUI.Numberinput.step);

      this.setValue(this.$input.val() !== '' ? this.$input.val() : this.options.defaultValue);

      if (this.$element.attr('disabled') || this.$element.attr('data-disabled')) {
        this._toggleDisabled();
      }

      if (this.$element.hasClass('is-invalid') || this.$element.attr('data-error')) {
        this.set('hasError', true);
      }
    },

    /** @ignore */
    _adjustValueLimitedToRange: function () {
      var value = this.getValue();
      if (!isNaN(value)) {
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }
      }
      this.$input.val(value);
    },

    /** @ignore */
    _checkMinMaxViolation: function () {

      if (this._isNumber()) {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');

        if (this.options.max && this.getValue() >= this.getMax()) {
          this.$incrementElement.attr('disabled', 'disabled');
        } else if (this.options.min && this.getValue() <= this.getMin()) {
          this.$decrementElement.attr('disabled', 'disabled');
        }
      }
    },

    /** @ignore */
    _switchInputTypeToText: function ($input) {
      var convertedInput = $input.detach().attr('type', 'text');
      this.$element.prepend(convertedInput);
    },

    /** @ignore */
    _isNumber: function () {
      return !isNaN(this.$input.val());
    },

    /** @ignore */
    _optionBeforeChangeHandler: function (event) {
      if (isNaN(parseFloat(event.value))) {
        // console.error('CUI.NumberInput cannot set option \'' + event.option + '\' to NaN value');
        event.preventDefault();
      }
    },

    /** @ignore */
    _toggleDisabled: function () {
      if (this.options.disabled) {
        this.$incrementElement.attr('disabled', 'disabled');
        this.$decrementElement.attr('disabled', 'disabled');
        this.$input.attr('disabled', 'disabled');
      } else {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');
        this.$input.removeAttr('disabled');
      }
    },

    /** @ignore */
    _toggleError: function () {
      if (this.options.hasError) {
        this.$input.addClass('is-invalid');
      } else {
        this.$input.removeClass('is-invalid');
      }
    }

  });

  CUI.Widget.registry.register("numberinput", CUI.NumberInput);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.NumberInput.init($("[data-init~=numberinput]", e.target));
  });

}(window.jQuery));

(function ($) {
  var uuid = 0;

  CUI.Popover = new Class(/** @lends CUI.Popover# */{
    toString: 'Popover',
    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc A box which points at an element or point.

     @desc Creates a new popover
     @constructs

     @param {Object} options                               Component options
     @param {Object} options.pointAt                       The element or coordinate to which the popover should point.
     A coordinate should be provided as an array where the first
     item is the X coordinate and the second item is a Y
     coordinate. The coordinate should be in the document
     coordinate space.
     @param {String} [options.content]                     Content of the popover (HTML).
     @param {String} [options.pointFrom=bottom]            The side of the target element or coordinate the popover
     @param {Object} [options.within=window]               Popover collision detection container
     should be pointing from. Possible values include
     <code>top</code>, <code>right</code>, <code>bottom</code>,
     or <code>left</code>.
     @param {boolean} [options.preventAutoHide=false]      When set to <code>false</code>, the popover will close when
     the user clicks outside the popover. When set to
     <code>true</code>, the popover will only close when the
     target element is clicked or <code>hide()</code> is
     manually called.
     @param {String} [options.alignFrom=left]              When set to left, the popover will be anchored to the left
     side of its offset parent (in other words, it will use the
     <code>left</code> CSS property). When set to right, the
     popover will be anchored to the right side of its offset
     parent (in other words, it will use the <code>right</code>
     CSS property). When the element the popover is pointing at
     is right-aligned, it can be useful to set the value to
     <code>right</code> so the popover will appear to stay
     attached to the element when the user resizes the window
     horizontally.

     */
    construct: function (options) {

      // listens to configuration changes
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:pointAt', this._position.bind(this));
      this.$element.on('change:pointFrom', this._position.bind(this));
      this.$element.on('change:alignFrom', this._position.bind(this));

      // main class of the component
      this.$element.addClass('coral-Popover');

      // checks if the content element exists
      if (this._getContentElement(this.$element).length === 0) {
        this._wrapContent(this.$element);
      }

      // gets the content element
      this._$content = this._getContentElement(this.$element);

      // adds the content if the current is blank.
      if(this._$content.html() === '') {
        this._setContent();
      }

      this._createTail();

      this.uuid = (uuid += 1);
    },

    defaults: {
      pointFrom: 'bottom',
      preventAutoHide: false,
      alignFrom: 'left',
      visible: false
    },

    _directions: [
      'top',
      'bottom',
      'right',
      'left'
    ],

    /**
     * Creates the popover tail (i.e., tip, arrow, triangle) and adds it as a child.
     * @private
     */
    _createTail: function () {
      this._$tail = $('<div class="coral-Popover-arrow coral-Popover-arrow--left"/>').appendTo(this.$element);

      this._cachedTailDimensions = {};

      // Cache the tail dimensions when the popover is on the left or right of the target.
      this._cachedTailDimensions.leftRight = {
        width: this._$tail.outerWidth(),
        height: this._$tail.outerHeight()
      };

      // While it's possible that the dimensions are different depending on whether it's left/right vs top/bottom,
      // it likely (and is currently) just a rotated version of the arrow. To reduce the cost of measuring, we'll
      // just invert the dimensions until more complex tails are introduced.
      this._cachedTailDimensions.topBottom = {
        width: this._cachedTailDimensions.leftRight.height,
        height: this._cachedTailDimensions.leftRight.width
      };

      // The correct arrow class will be applied when the popover is positioned.
      this._$tail.removeClass('coral-Popover-arrow--left');
    },

    /**
     * Wrapps the content of the popover inside a
     * coral-Popover-content class.
     *
     * @ignore
     */
    _wrapContent: function (el) {
      el.wrapInner('<div class="coral-Popover-content"/>');
    },
    /** @ignore */
    _getContentElement: function (el) {
      return el.find('> .coral-Popover-content');
    },

    /**
     * Positions the popover (if visible). Leverages [jQueryUI's Position utility]{@link http://jqueryui.com/position}.
     *
     * @private
     */
    _position: function () {
      // Let's not use the cycles to position if the popover is not visible. When show() is called, the element will
      // run through positioning again.
      if (!this.options.visible || !this.options.pointAt) {
        return;
      }

      var $popover = this.$element,
        target = this.options.pointAt,
        pointFrom = this.options.pointFrom,
        tailDimensions = this._cachedTailDimensions,
        instructions;

      if ($.isArray(target)) {
        if (target.length !== 2) {
          return;
        }
        target = this._convertCoordsToEvent(target);
      }

      // Using the 'flip' collision option, jQueryUI's positioning logic will flip the position of the popover to
      // whichever side will expose most of the popover within the window viewport. However, this can sometimes place
      // the popover so that it is cropped by the top or left of the document. While it's great that the user would
      // be able to initially see more of the popover than if it had been placed in the opposite position, the user
      // would not be able to even scroll to see the cropped portion. We would rather show less of the popover and
      // still allow the user to scroll to see the rest of the popover. Here we detect if such cropping is taking
      // place and, if so, we re-run the positioning algorithm while forcing the position to the bottom or right
      // directions.
      // Fixes https://issues.adobe.com/browse/CUI-794
      var validateFinalPosition = function (position, feedback) {
        var offsetParentOffset = $popover.offsetParent().offset(),
          forcePointFrom;

        if ((pointFrom == 'top' || pointFrom == 'bottom') && offsetParentOffset.top + position.top < 0) {
          forcePointFrom = 'bottom';
        } else if ((pointFrom == 'left' || pointFrom == 'right') && offsetParentOffset.left + position.left < 0) {
          forcePointFrom = 'right';
        }

        if (forcePointFrom) {
          instructions = this._instructionFactory[forcePointFrom]({
            target: target,
            tailDimensions: tailDimensions,
            allowFlip: false,
            callback: this._applyFinalPosition.bind(this),
            within: this.options.within || window
          });
          $popover.position(instructions);
        } else {
          this._applyFinalPosition(position, feedback);
        }
      }.bind(this);

      instructions = this._instructionFactory[pointFrom]({
        target: target,
        tailDimensions: tailDimensions,
        allowFlip: true,
        callback: validateFinalPosition,
        within: this.options.within || window
      });

      $popover.position(instructions);
    },

    /**
     * Converts an array containing a coordinate into an event (needed for jQueryUI's Position utility)..
     * @param {Array} pointAt An array where the first item is the x coordinate and the second item is the y coordinate.
     * @returns {Object} A jquery event object with the pageX and pageY properties set.
     * @private
     */
    _convertCoordsToEvent: function (pointAt) {
      // If target is an array, it should contain x and y coords for absolute positioning.
      // Transform coords for jQueryUI Position which requires an event object with pageX and pageY.
      var event = $.Event();
      event.pageX = pointAt[0];
      event.pageY = pointAt[1];
      return event;
    },

    /**
     * Applies the final position to the popover (both bubble and tail).
     * @param position The position to be applied to the bubble.
     * @param feedback Additional information useful for positioning the tail.
     * @private
     */
    _applyFinalPosition: function (position, feedback) {
      var css = {
        top: position.top
      };

      if (this.options.alignFrom === 'right') {
        // Convert the "left" position to a "right" position.

        var offsetParent = this.$element.offsetParent();
        var offsetParentWidth;

        // If the offset parent is the root HTML element, we need to do some finagling. We really need to get the width
        // of the viewpane minus the scrollbar width since the "right" position will be relative to the left of the
        // scrollbar. We do this by getting the outerWidth(true) of body (so it includes any margin, border, and padding).
        if (offsetParent.prop('tagName').toLowerCase() == 'html') {
          offsetParent = $('body');
          offsetParentWidth = offsetParent.outerWidth(true);
        } else {
          offsetParentWidth = offsetParent.innerWidth();
        }

        css.left = 'auto';
        css.right = offsetParentWidth - position.left - this.$element.outerWidth(true);
      } else {
        css.left = position.left;
        css.right = 'auto';
      }

      this.$element.css(css);

      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      this._positionTail(feedback);
    },

    /**
     * Factory for creating instruction objects to be used by jQuery's Position utility.
     * @private
     */
    _instructionFactory: {
      top: function (options) {
        return {
          my: 'center bottom-' + options.tailDimensions.topBottom.height,
          at: 'center top',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback,
          within: options.within
        };
      },
      right: function (options) {
        return {
          my: 'left+' + options.tailDimensions.leftRight.width + ' center',
          at: 'right center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback,
          within: options.within
        };
      },
      bottom: function (options) {
        return {
          my: 'center top+' + options.tailDimensions.topBottom.height,
          at: 'center bottom',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback,
          within: options.within
        };
      },
      left: function (options) {
        return {
          my: 'right-' + options.tailDimensions.leftRight.width + ' center',
          at: 'left center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback,
          within: options.within
        };
      }
    },

    /**
     * Positions the tail of the popover.
     * @param positionFeedback Positioning feedback object returned from jQuery's Position utility. This contains
     * information regarding how the popover bubble was positioned.
     * @private
     */
    _positionTail: function (positionFeedback) {
      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      var targetRect,
        offset = this.$element.offset();

      if ($.isArray(this.options.pointAt)) {
        targetRect = {
          top: this.options.pointAt[1],
          left: this.options.pointAt[0],
          width: 0,
          height: 0
        };
      } else {
        var targetOffset = $(positionFeedback.target.element).offset();
        targetRect = {
          top: targetOffset.top,
          left: targetOffset.left,
          width: positionFeedback.target.width,
          height: positionFeedback.target.height
        };
      }

      // Convert from doc coordinate space to this.$element coordinate space.
      targetRect.top -= (offset.top + parseFloat(this.$element.css('borderTopWidth')));
      targetRect.left -= (offset.left + parseFloat(this.$element.css('borderLeftWidth')));

      var tailClass, tailLeft, tailTop, tailWidth;
      switch (this.options.pointFrom) {
        case 'top': // Consumer wanted popover above target
        case 'bottom': // Consumer wanted popover below target
          tailWidth = this._cachedTailDimensions.topBottom.width;
          tailLeft = targetRect.left + targetRect.width / 2 - tailWidth / 2;
          if (positionFeedback.vertical == 'bottom') { // Popover ended up above the target
            tailClass = 'coral-Popover-arrow--down';
            tailTop = targetRect.top - this._cachedTailDimensions.topBottom.height;
          } else { // Popover ended up below the target
            tailClass = 'coral-Popover-arrow--up';
            tailTop = targetRect.top + targetRect.height;
          }
          break;
        case 'left': // Consumer wanted popover to the left of the target
        case 'right': // Consumer wanted popover to the right of the target
          tailWidth = this._cachedTailDimensions.leftRight.width;
          tailTop = targetRect.top + targetRect.height / 2 -
            this._cachedTailDimensions.leftRight.height / 2;
          if (positionFeedback.horizontal == 'left') { // Popover ended up on the right side of the target
            tailClass = 'coral-Popover-arrow--left';
            tailLeft = targetRect.left + targetRect.width;
          } else { // Popover ended up on the left side of the target
            tailClass = 'coral-Popover-arrow--right';
            tailLeft = targetRect.left - tailWidth;
          }
          break;
      }

      this._$tail.css({ top: tailTop, left: tailLeft })
        .removeClass('coral-Popover-arrow--up coral-Popover-arrow--down coral-Popover-arrow--left coral-Popover-arrow--right')
        .addClass(tailClass);
    },

    /** @ignore */
    _show: function () {
      this.$element.show().prop('aria-hidden', false);
      this._position();

      if (!this.options.preventAutoHide) {
        clearTimeout(this.autoHideInitTimeout);
        this.autoHideInitTimeout = setTimeout(function() {
          // Must watch touchstart because click events don't bubble as expected on iOS Safari.
          $(document).on('touchstart.popover-hide-' + this.uuid + ' click.popover-hide-' + this.uuid, function (e) {
            var el = this.$element.get(0);

            if (e.target !== el && !$.contains(el, e.target)) {
              this.hide();
            }
          }.bind(this));
        }.bind(this), 0);
      }
    },

    /** @ignore */
    _hide: function () {
      clearTimeout(this.autoHideInitTimeout);
      this.$element.hide().prop('aria-hidden', true);
      $(document).off('.popover-hide-' + this.uuid);
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content !== 'string') return;

      // adds the content
      this._$content.html(this.options.content);

      this._position();
    },

    /**
     * Deprecated.
     * @param position
     * @deprecated Please use set('pointAt', [x, y]) instead.
     */
    setPosition: function (position) {
      this.set('pointAt', position);
    }
  });

  CUI.Widget.registry.register("popover", CUI.Popover);

  $(function () {
    // Must watch touchstart because click events don't bubble as expected on iOS Safari.
    $(document).on('touchstart.popover.data-api click.popover.data-api', '[data-toggle="popover"]',function (event) {
      var $trigger = $(this),
        $target = CUI.util.getDataTarget($trigger);

      // if data target is not defined try to find the popover as a sibling
      $target = $target && $target.length > 0 ? $target : $trigger.next('.coral-Popover');

      var popover = $target.popover($.extend({pointAt: $trigger}, $target.data(), $trigger.data())).data('popover');
      popover.toggleVisibility();
      event.preventDefault();
    });
  });
}(window.jQuery));

(function ($, window, undefined) {
  CUI.SelectList = new Class(/** @lends CUI.SelectList# */{
    toString: 'SelectList',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A select list for drop down widgets. This widget is intended to be used by other widgets.
     *
     * @description Creates a new select list
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} [options.type=static] static or dynamic list
     * @param  {Boolean} [options.multiple=false] multiple selection or not
     * @param  {Object} options.relatedElement DOM element to position at
     * @param  {Boolean} [options.autofocus=true] automatically sets the
     * caret to the first item in the list
     * @param  {Boolean} [options.autohide=true] automatically closes the
     * list when clicking the toggle button or clicking outside of the list
     * @param  {String} [options.dataurl] URL to receive values dynamically
     * @param  {String} [options.dataurlformat=html] format of the dynamic data load
     * @param  {Object} [options.dataadditional] additonal data to be sent with a remote loading request
     * @param  {Function} [options.loadData] function to be called if more data is needed. The function should return a $.Promise, which will be done, when all requested items where added to the list. This must not be used with a set dataurl.
     * @param {String} [options.collisionAdjustment] the collision option to be passed to jquery.ui.position. Use "none" to omit flipping.
     *
     *
     */
    construct: function (options) {
      this.applyOptions();

      this.$element
        .on('change:type', this._setType.bind(this))
        .on('click', this._SELECTABLE_SELECTOR, this._triggerSelected.bind(this))
        .on('mouseenter', this._SELECTABLE_SELECTOR, this._handleMouseEnter.bind(this));

      // accessibility
      this._makeAccessible();
    },

    defaults: {
      type: 'static', // static or dynamic
      multiple: false,
      relatedElement: null,
      autofocus: true, // autofocus on show
      autohide: true,
      dataurl: null,
      dataurlformat: 'html',
      datapaging: true,
      datapagesize: 10,
      dataadditional: null,
      loadData: $.noop, // function to receive more data
      position: 'center bottom-1',  // -1 to override the border,
      collisionAdjustment: ''
    },

    /**
     * Retrieve list of first level list items (groups or options). NB: The list
     * represents a snapshot of the current state. If items are added or
     * removed, the list will become invalid.
     *
     * @return {Array} List of CUI.SelectList.Option and CUI.SelectList.Group
     *                 instances
     */
    getItems: function () {
      return this.$element.children(".coral-SelectList-item").toArray().map(function (element) {
        var $element = $(element);
        if ($element.is(".coral-SelectList-item--option")) {
          return new CUI.SelectList.Option({element : $element});
        }
        else if ($element.is(".coral-SelectList-item--optgroup")) {
          return new CUI.SelectList.Group({element : $element});
        }
      });
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @returns option
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this.$element.children(".coral-SelectList-item"),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      if (!element.is(".coral-SelectList-item--option")) {
        throw new TypeError("Position does not point to option element");
      }

      return new CUI.SelectList.Option({element: element});
    },

    /**
     * Get CUI.SelectList.Group representing the group at the given position.
     *
     * @returns group
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getGroup : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this.$element.children(".coral-SelectList-item"),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      if (!element.is(".coral-SelectList-item--optgroup")) {
        throw new TypeError("Position does not point to group element");
      }

      return new CUI.SelectList.Group({element: element});
    },

    /**
     * Adds option at the given position. If position is undefined, the option
     * is added at the end of the list.
     *
     * @param {Object|CUI.SelectList.Option|Element|jQuery|Array} option that
     *        should be added. If type is Object, the keys `value` and `display`
     *        are used to create the option. If type is CUI.SelectList.Option,
     *        the underlying element is added to the list. If type is Element,
     *        the node is added to the list. If type is jQuery <b>all</b>
     *        elements within the collection are added to the list. If type is
     *        Array, then the array is expected to contain one of the other
     *        types.
     * @param {Number} Position at which the element should be inserted. If
     *        undefined, the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addOption : function (optionDescription, position) {
      var item, element, i;

      if ($.isArray(optionDescription) || (optionDescription && optionDescription.jquery)) {
        for (i = 0; i < optionDescription.length; i++) {
          this.addOption(optionDescription[i], position !== undefined ? position + i : undefined);
        }
        return;
      }
      else if (optionDescription && optionDescription.$element) {
        this.addOption(optionDescription.$element);
        return;
      }
      else if ($.isPlainObject(optionDescription)) {
        item = optionDescription;
      }
      else if (optionDescription instanceof Element) {
        element = $(optionDescription);
        item = {
          value: element.data("value"),
          display: element.text()
        };
      }
      else {
        throw new TypeError("Only Object, Element, CUI.SelectList.Option, jQuery and Array type arguments allowed.");
      }

      if (!element) {
        element = $("<li>", {
          "class": "coral-SelectList-item coral-SelectList-item--option",
          "data-value": item.value
        }).text(item.display);
      }

      this._addItem(element, position);
      this.$element.trigger($.Event("itemadded", {item: new CUI.SelectList.Option({element: element})}));
    },

    /**
     * Adds option group at the given position. If position is undefined, the group
     * is added to the end of the list.
     *
     * @param {String|CUI.SelectList.Group|Element|jQuery|Array} group that
     *        should be added. If type is String, it is used as display value.
     *        If type is CUI.SelectList.Group, the underlying element is added
     *        to the list. If type is Element, the node is added to the list.
     *        If type is jQuery <b>all</b> element within the collection are
     *        added to the list. If type is Array, then the array is expected to
     *        contain one of the other types.
     * @param {Number} Position at which the element should be inserted. If
     *        undefined, the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addGroup : function (groupDescription, position) {
      var item, element, i;

      if ($.isArray(groupDescription) || (groupDescription && groupDescription.jquery)) {
        for (i = 0; i < groupDescription.length; i++) {
          this.addGroup(groupDescription[i], position !== undefined ? position + i : undefined);
        }
        return;
      }
      else if (groupDescription && groupDescription.$element) {
        this.addGroup(groupDescription.$element);
        return;
      }
      else if ($.type(groupDescription) === "string") {
        item = {
          display: groupDescription
        };
      }
      else if (groupDescription instanceof Element) {
        element = $(groupDescription);
        item = {
          display: element.children(".coral-SelectList-groupHeader").text()
        };
      }
      else {
        throw new TypeError("Only String, Element, CUI.SelectList.Group, jQuery and Array type arguments allowed.");
      }

      if (!element) {
        element = $("<li>", {"class": "coral-SelectList-item coral-SelectList-item--optgroup"});
      }
      if (element.find(".coral-SelectList-groupHeader").length === 0) {
        element.prepend($("<span>", {"class": "coral-SelectList-groupHeader"}).text(item.display));
      }
      if (element.find(".coral-SelectList-sublist").length === 0) {
        element.append($("<ul>", {"class": "coral-SelectList-sublist"}));
      }

      this._addItem(element, position);
      this.$element.trigger($.Event("itemadded", {item: new CUI.SelectList.Group({element: element})}));
    },

    /**
     * @private
     */
    _addItem : function (element, position) {
      this._makeAccessibleListOption(element);

      var list = this._getList(),
          items = this._getItems();


      if (position === undefined || position === items.length) {
        list.append(element);
        return items.length;
      }

      if (position === 0) {
        list.prepend(element);
        return 0;
      }

      var ref = items.eq(position);

      if (position > 0 && ref.length) {
        ref.before(element);
        return position;
      }

      throw new RangeError("Position " + position + " is not within " +
                           "accepted range [0..." + items.length + "].");
    },

    /**
     * @private
     */
    _getList : function () {
      return this.$element;
    },

    /**
     * @private
     */
    _getItems : function () {
      return this._getList().children(".coral-SelectList-item");
    },

    /**
     * Selector used to find selectable items.
     * @private
     */
    _SELECTABLE_SELECTOR: '.coral-SelectList-item--option:not(.is-disabled):not(.is-hidden)',

    applyOptions: function () {
      this._setType();
    },

    /**
     * @private
     */
    _setType: function () {
      var self = this,
        timeout;

      function timeoutLoadFunc() {
        var elem = self.$element.get(0),
          scrollHeight = elem.scrollHeight,
          scrollTop = elem.scrollTop;

        if ((scrollHeight - self.$element.height()) <= (scrollTop + 30)) {
          self._handleLoadData();
        }
      }

      // we have a dynamic list of values
      if (this.options.type === 'dynamic') {

        this.$element.on('scroll.cui-selectlist-dynamic-load', function (event) {
          // debounce
          if (timeout) {
            clearTimeout(timeout);
          }

          if (self._loadingComplete || this._loadingIsActive) {
            return;
          }

          timeout = setTimeout(timeoutLoadFunc, 500);
        });
      } else { // static
        this.$element.off('scroll.cui-selectlist-dynamic-load');
      }
    },

    /**
     * The element that "owns" this SelectList element for accessibility purposes.
     * It should be an element that has an aria-owns attribute containing the id of this.$element,
     * if such an element doesn't exist, the _ownerElement will be the same as the _relatedElement.
     * @private
     */
    _ownerElement: null,

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#listbox
     * @private
     */
    _makeAccessible: function () {
      var self = this,
          $relatedElement = $(this.options.relatedElement),
          isVisible = this.$element.hasClass('is-visible');

      this._ownerElement = $('[aria-owns*="' + this.$element.attr('id') + '"]');

      if ($relatedElement.length) {
        if (!this._ownerElement.length) {
          this._ownerElement = $relatedElement;
        }
      }

      this._ownerElement.attr({
        'id': this._ownerElement.attr('id') || CUI.util.getNextId(),
        'aria-haspopup': true,
        'aria-expanded': isVisible
      });

      $relatedElement.not(this._ownerElement).removeAttr('aria-haspopup').removeAttr('aria-expanded');

      this.$element.attr({
        'role': 'listbox',
        'aria-hidden': !isVisible,
        'aria-multiselectable': this.options.multiple || null,
        'tabindex': -1
      });

      if (isVisible) {
          this.$element.attr('tabindex', 0);
          this.$element.not('.is-inline').addClass('is-inline');
      }

      this.$element
          .off('focusin.cui-selectlist focusout.cui-selectlist')
          .on('focusin.cui-selectlist', this._handleFocusIn.bind(this))
          .on('focusout.cui-selectlist', this._handleFocusOut.bind(this));

      this._makeAccessibleListOption(this.$element.children());
    },

    /**
     * Determine if the SelectList has focus.
     * @private
     */
    _hasFocus: function () {
      return this._ownerElement.is(document.activeElement) || $(document.activeElement).closest(this.$element).length === 1;
    },

    /**
     * Handles focusin events for accessibility purposes.
     * @param event The focusin event.
     * @private
     */
    _handleFocusIn: function (event) {
      var currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR+'[aria-selected="true"], ' + this._SELECTABLE_SELECTOR+'[tabindex="0"], '+ this._SELECTABLE_SELECTOR+'.is-highlighted').first();
      if (currentFocusEntry.length === 0) {
        this.setCaretToItem(
          this.$element.find(this._SELECTABLE_SELECTOR).first(),
          true);
        this.$element.attr('tabindex', -1);
      }

      if (this.$element.is('.is-inline')) {
        this.$element.addClass('is-focused');
        this.$element.off('keydown.cui-selectlist keypress.cui-selectlist')
          .on('keydown.cui-selectlist', this._handleKeyDown.bind(this))
          .on('keypress.cui-selectlist', this._handleKeyPress.bind(this));
      }
    },

    /**
     * Handles focusout events for accessibility purposes.
     * @param event The focusout event.
     * @private
     */
    _handleFocusOut: function (event) {
      if (this.$element.is('.is-inline')) {
        this.$element.removeClass('is-focused');
        this.$element.off('keydown.cui-selectlist keypress.cui-selectlist');
      }
    },

    _restoreFocusToOwnerElement: function() {
      var self = this,
          $ownerElement = this._ownerElement;

      if (!$ownerElement.is(':tabbable')) {
        $ownerElement = $ownerElement.find('input[type="text"], input[type="search"], button, input[type="button"]').filter(':tabbable').first();
      }
      $ownerElement.trigger('focus');
    },

    /**
     * Handles key down events for accessibility purposes.
     * @param event The keydown event.
     * @private
     */
    _handleKeyDown: function(event) {
      // enables keyboard support
      var entries = this.$element.find(this._SELECTABLE_SELECTOR),
        currentFocusEntry = entries.filter('.is-highlighted'),
        currentFocusIndex = entries.index(currentFocusEntry),
        newFocusEntry;

      if (!entries.length) {
        return;
      }

      switch (event.which) {
        case 13: // enter
        case 32: // space
          // If the toggle button for the select list has focus and
          // the user hits enter or space when a list item is
          // highlighted, they would expect the item
          // to be selected. If no item is highlighted, they
          // would expect the toggle to hide the list.
          // This is why we only preventDefault() when an entry
          // is highlighted.
          if (currentFocusEntry.length && $(document.activeElement).closest(this.$element).length === 1) {
            currentFocusEntry.trigger('click');
            event.preventDefault();
          }
          break;
        case 27: //esc
          this.hide();
          event.preventDefault();
          break;
        case 33: //page up
        case 38: //up arrow
          // According to spec, don't loop to the bottom of the list.
          if (currentFocusIndex > 0) {
            newFocusEntry = entries[currentFocusIndex-1];
          } else if (currentFocusIndex == -1) {
            newFocusEntry = entries[entries.length-1];
          }
          event.preventDefault();
          break;
        case 34: //page down
        case 40: //down arrow
          // According to spec, don't loop to the top of the list.
          if (currentFocusIndex + 1 < entries.length) {
            newFocusEntry = entries[currentFocusIndex+1];
          }
          event.preventDefault();
          break;
        case 36: //home
          newFocusEntry = entries[0];
          event.preventDefault();
          break;
        case 35: //end
          newFocusEntry = entries[entries.length-1];
          event.preventDefault();
          break;
        case 9:  //tab
          if (this.options.visible && this.options.autohide) {
            event.preventDefault();
          }
          break;
      }

      if (newFocusEntry !== undefined && this._hasFocus()) {
        this.setCaretToItem($(newFocusEntry), true);
      }
    },

    _keypressTimeoutID: null,
    _keypressTimeoutDuration: 1000,
    _keypressSearchString: "",
    _unicodeRangesRegExp: /[\u0000-\u007F|\u0080-\u00FF|\u0100-\u017F|\u0180-\u024F|\u0250-\u02AF|\u02B0-\u02FF|\u0300-\u036F|\u0370-\u03FF|\u0400-\u04FF|\u0500-\u052F|\u0530-\u058F|\u0590-\u05FF|\u0600-\u06FF|\u0700-\u074F|\u0780-\u07BF|\u0900-\u097F|\u0980-\u09FF|\u0A00-\u0A7F|\u0A80-\u0AFF|\u0B00-\u0B7F|\u0B80-\u0BFF|\u0C00-\u0C7F|\u0C80-\u0CFF|\u0D00-\u0D7F|\u0D80-\u0DFF|\u0E00-\u0E7F|\u0E80-\u0EFF|\u0F00-\u0FFF|\u1000-\u109F|\u10A0-\u10FF|\u1100-\u11FF|\u1200-\u137F|\u13A0-\u13FF|\u1400-\u167F|\u1680-\u169F|\u16A0-\u16FF|\u1700-\u171F|\u1720-\u173F|\u1740-\u175F|\u1760-\u177F|\u1780-\u17FF|\u1800-\u18AF|\u1900-\u194F|\u1950-\u197F|\u19E0-\u19FF|\u1D00-\u1D7F|\u1E00-\u1EFF|\u1F00-\u1FFF|\u2000-\u206F|\u2070-\u209F|\u20A0-\u20CF|\u20D0-\u20FF|\u2100-\u214F|\u2150-\u218F|\u2190-\u21FF|\u2200-\u22FF|\u2300-\u23FF|\u2400-\u243F|\u2440-\u245F|\u2460-\u24FF|\u2500-\u257F|\u2580-\u259F|\u25A0-\u25FF|\u2600-\u26FF|\u2700-\u27BF|\u27C0-\u27EF|\u27F0-\u27FF|\u2800-\u28FF|\u2900-\u297F|\u2980-\u29FF|\u2A00-\u2AFF|\u2B00-\u2BFF|\u2E80-\u2EFF|\u2F00-\u2FDF|\u2FF0-\u2FFF|\u3000-\u303F|\u3040-\u309F|\u30A0-\u30FF|\u3100-\u312F|\u3130-\u318F|\u3190-\u319F|\u31A0-\u31BF|\u31F0-\u31FF|\u3200-\u32FF|\u3300-\u33FF|\u3400-\u4DBF|\u4DC0-\u4DFF|\u4E00-\u9FFF|\uA000-\uA48F|\uA490-\uA4CF|\uAC00-\uD7AF|\uD800-\uDB7F|\uDB80-\uDBFF|\uDC00-\uDFFF|\uE000-\uF8FF|\uF900-\uFAFF|\uFB00-\uFB4F|\uFB50-\uFDFF|\uFE00-\uFE0F|\uFE20-\uFE2F|\uFE30-\uFE4F|\uFE50-\uFE6F|\uFE70-\uFEFF|\uFF00-\uFFEF|\uFFF0-\uFFFF]/,

    /**
     * Handles key press events for accessibility purposes. Provides alphanumeric search.
     * @param event The keypress event.
     * @private
     */
    _handleKeyPress: function(event) {
      // enables keyboard support
      var entries = this.$element.find(this._SELECTABLE_SELECTOR),
        currentFocusEntry = entries.filter('.is-highlighted'),
        currentFocusIndex = entries.index(currentFocusEntry),
        $newFocusEntry,
        newString = '',
        start, i, entry, regex, comparison;

      if (!entries.length) {
        return;
      }
      switch (event.which) {
        case 13: // enter
        case 32: // space
        case 27: // esc
        case 33: // page up
        case 37: // left arrow
        case 38: // up arrow
        case 34: // page down
        case 39: // right arrow
        case 40: // down arrow
        case 36: // home
        case 35: // end
        case 9: // tab
          break;
        default:  // alphanumeric
          clearTimeout(this._keypressTimeoutID);

          newString = String.fromCharCode(event.which);


          if (!this._unicodeRangesRegExp.test(newString)) {
              newString = '';
          }

          if (newString === '') {
            return;
          }

          this._keypressSearchString += newString !== this._keypressSearchString ? newString : '';

          this._keypressTimeoutID = setTimeout(function () {
            this._keypressSearchString = '';
          }.bind(this), this._keypressTimeoutDuration);

          if (currentFocusIndex === -1) {
            start = 0;
          }
          else if (this._keypressSearchString.length === 1) {
            start = currentFocusIndex + 1;
          }
          else {
            start = currentFocusIndex;
          }

          regex = new RegExp('^' + this._keypressSearchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'), 'i');

          for (i = start; i < entries.length; i++) {
            entry = entries.eq(i);
            comparison = $.trim((entry.data('display') || entry.text()));
            if (regex.test(comparison)) {
              $newFocusEntry = entry;
              break;
            }
          }

          if ($newFocusEntry === undefined) {
            for (i = 0; i < start; i++) {
              entry = entries.eq(i);
              comparison = $.trim((entry.data('display') || entry.text()));
              if (regex.test(comparison)) {
                $newFocusEntry = entry;
                break;
              }
            }
          }

          if ($newFocusEntry !== undefined) {
            this.setCaretToItem($newFocusEntry, true);
          }
      }
    },

    /**
     * makes the list options accessible
     * @private
     * @param  {jQuery} elem
     */
    _makeAccessibleListOption: function (elem) {
      elem.each(function (i, e) {
        var entry = $(e), $optGroupTitle;

        // group header
        if (entry.hasClass('coral-SelectList-item--optgroup')) {
          $optGroupTitle = entry.children('.coral-SelectList-groupHeader');
          $optGroupTitle.attr({
            'id': $optGroupTitle.attr('id') || CUI.util.getNextId(),
            'role': 'heading'
          });
          entry.attr({
            'role': 'presentation'
          }).children('ul').each(function(i, ul){
            var $ul = $(ul);
            $ul.attr({
              'role': 'group',
              'aria-labelledby': $optGroupTitle.attr('id')
            });
          }).children('li').each(function(i, li){
            var $li = $(li);
            $li.attr({
              'role': 'option',
              'id': $li.attr('id') || CUI.util.getNextId()
            });
          });
        } else {
          entry.attr({
            'role': 'option',
            'id': entry.attr('id') || CUI.util.getNextId()
          });
        }
      });
    },

    /**
     * Visually focuses the provided list item and ensures it is within
     * view.
     * @param {jQuery} $item The list item to focus.
     * @param {boolean} scrollToItem Whether to scroll to ensure the item
     * is fully within view.
     */
    setCaretToItem: function($item, scrollToItem) {
      this.$element.find('.coral-SelectList-item--option')
        .removeClass('is-highlighted')
        .removeAttr('tabindex');

      $item.addClass('is-highlighted').attr('tabindex', 0);
      this._ownerElement.attr('aria-activedescendant', $item.attr('id'));
      this.$element.attr('aria-activedescendant', $item.attr('id'));

      if (this._hasFocus()) {
        $item.trigger('focus');
      } else if (scrollToItem) {
        this.scrollToItem($item);
      }
    },

    /**
     * Removes visual focus from list items and scrolls to the top.
     */
    resetCaret: function() {
      this.$element.find('[role="option"]')
        .removeClass('is-highlighted')
        .removeAttr('tabindex');
      this.$element.scrollTop(0);
      this._ownerElement.removeAttr('aria-activedescendant');
      this.$element.removeAttr('aria-activedescendant');
    },

    /**
     * Scrolls as necessary to ensure the list item is within view.
     * @param {jQuery} $item The list item
     */
    scrollToItem: function($item) {
      if (!$item.length) {
        return;
      }

      var itemTop = $item.position().top,
        itemHeight = $item.outerHeight(false),
        scrollNode = this.$element[0];

      var bottomOverflow = itemTop + itemHeight - scrollNode.clientHeight;

      if (bottomOverflow > 0) {
        scrollNode.scrollTop += bottomOverflow;
      } else if (itemTop < 0) {
        scrollNode.scrollTop += itemTop;
      }
    },

    show: function () {
      if (this.options.visible) {
        return this;
      } else {
        hideLists(); // Must come before the parent show method.
        return this.inherited(arguments);
      }
    },

    /**
     * @private
     */
    _show: function () {
      var self = this,
          currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR+'[aria-selected="true"], ' + this._SELECTABLE_SELECTOR+'[tabindex="0"], '+ this._SELECTABLE_SELECTOR+'.is-highlighted').first();

      this.$element
        .addClass('is-visible')
        .attr('aria-hidden', false);

      this._ownerElement.attr('aria-expanded', true);

      this._position();

      if (this.options.autofocus) {
        if (currentFocusEntry.length === 0) {
            currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR).first();
        }
        this.setCaretToItem(
          currentFocusEntry,
          true);
      }

      // if dynamic start loading
      if (this.options.type === 'dynamic') {
        this._handleLoadData().done(function () {
          if (self.options.autofocus) {
            self.setCaretToItem(
              self.$element.find(self._SELECTABLE_SELECTOR).first(),
              true);
          }
        });
      }

      $(document).on('keydown.cui-selectlist', this._handleKeyDown.bind(this))
        .on('keypress.cui-selectlist', this._handleKeyPress.bind(this));
    },

    /**
     * Positions the list below a related component (or above when it does not fit below).
     * @private
     */
    _position: function () {
      if (this.options.visible) {
        this.$element.position({
          my: 'top',
          at: this.options.position,
          of: this.options.relatedElement,
          collision: this.options.collisionAdjustment
        });
      }
    },

    /**
     * @private
     */
    _hide: function () {
      var $relatedElement = $(this.options.relatedElement),
          $ownerElement = this._ownerElement,
          removeKeyboardEventHandlers = true,
          hasFocus = this._hasFocus();

      this.$element
        .removeClass('is-visible')
        .attr('aria-hidden', true);

      this._ownerElement.attr('aria-expanded', true);

      this.reset();

      // Determine if there is a visible selectList with autohide=false
      $(selectListSelector).each(function () {
        var selectList = $(this).data('selectList');
        if (selectList && !selectList.get('autohide') && selectList.get('visible')) {
          // If the selectList with autohide=false is visible,
          // we don't want to remove the keyboard event listeners.
          removeKeyboardEventHandlers = false;
        }
      });

      // Only remove keyboard event listeners when no selectList with autohide=false is visible.
      if (removeKeyboardEventHandlers) {
        $(document).off('keydown.cui-selectlist keypress.cui-selectlist');
      }

      $ownerElement.removeAttr('aria-activedescendant');
      if ($ownerElement.length && hasFocus) {
          setTimeout(this._restoreFocusToOwnerElement.bind(this), 50);
      }
    },

    /**
     * triggers an event for the currently selected element
     * @fires SelectList#selected
     * @private
     */
    _triggerSelected: function (event) {
      var cur = $(event.currentTarget),
        val = cur.data('value'),
        display = cur.data('display') || cur.text();

      cur.trigger($.Event('selected', {
        selectedValue: val,
        displayedValue: display
      }));
    },

    /**
     * handles the mousenter event on an option
     * this events sets the the focus to the current event
     * @param  {jQuery.Event} event
     *
     * @private
     */
    _handleMouseEnter: function (event) {
      this.setCaretToItem($(event.currentTarget), false);
    },

    /**
     * deletes the item from the dom
     */
    clearItems: function () {
      this.$element.empty();
    },

    /**
     * current position for the pagination
     * @private
     * @type {Number}
     */
    _pagestart: 0,

    /**
     * indicates if all data was fetched
     * @private
     * @type {Boolean}
     */
    _loadingComplete: false,

    /**
     * indicates if currently data is fetched
     * @private
     * @type {Boolean}
     */
    _loadingIsActive: false,

    /**
     * handle asynchronous loading of data (type == dynamic)
     * @private
     */
    _handleLoadData: function () {
      var promise,
        self = this,
        end = this._pagestart + this.options.datapagesize,
        wait = $('<div/>', {
          'class': 'coral-SelectList-item--wait',
          'role': 'presentation'
        }).append($('<span/>', {
            'class': 'coral-Wait',
            'role': 'progressbar'
          }));

      if (this._loadingIsActive) { // immediately resolve
        return $.Deferred().resolve().promise();
      }

      // activate fetching
      this._loadingIsActive = true;

      // add wait
      this.$element.append(wait);

      // load from given URL
      if (this.options.dataurl) {
        promise = $.ajax({
          url: this.options.dataurl,
          context: this,
          dataType: this.options.dataurlformat,
          data: $.extend({
            start: this._pagestart,
            end: end
          }, this.options.dataadditional || {})
        }).done(function (data) {
            var cnt = 0;

            if (self.options.dataurlformat === 'html') {
              var elem = $(data);

              cnt = elem.filter('li').length;

              self._makeAccessibleListOption(elem);
              self.$element.append(elem);
            }

            // if not enough elements came back then the loading is complete
            if (cnt < self.options.datapagesize) {
              this._loadingComplete = true;
            }

          });

      } else { // expect custom function to handle
        promise = this.options.loadData.call(this, this._pagestart, end);
        promise.done(function (loadingComplete) {
          if (loadingComplete !== undefined) {
            self._loadingComplete = loadingComplete;
          }
        });
      }

      // increase to next page
      this._pagestart = end;

      promise.always(function () {
        wait.remove();
        self._position();
        self._loadingIsActive = false;
      });

      return promise;
    },

    /**
     * resets the dynamic loaded data
     */
    reset: function () {
      if (this.options.type === 'dynamic') {
        this.clearItems();
        this._pagestart = 0;
        this._loadingComplete = false;
      }
    },

    /**
     * triggers a loading operation
     * this requires to have the selectlist in a dynamic configuration
     * @param  {Boolean} reset resets pagination
     */
    triggerLoadData: function (reset) {
      if (reset) {
        this.reset();
      }

      this._handleLoadData();
    },

    /**
     * Filters the list of items based on a provided filtering function. This
     * filtering only occurs on the client and therefore is primarily intended
     * to be used with a static list (type=static).
     * @param {CUI.SelectList~filterCallback} [callback] Callback used to test
     * list options. If no function is passed, all items will be shown.
     */
    filter: function(callback) {
      var $items = this.$element.find('.coral-SelectList-item--option'),
          $groups = this.$element.find('.coral-SelectList-item--optgroup');

      if (callback) {
        $items.each(function() {
          var $item = $(this);

          var hideItem =
              !callback.call(this, $item.data('value'), $item.data('display') || $item.text());

          $item.toggleClass('is-hidden', hideItem);

          if (hideItem) {
            $item.removeClass('is-highlighted');
          }
        });

        $groups.each(function() {
          var $group = $(this);

          var hasVisibleItems =
              $group.find('[role="option"]:not(.is-hidden)').length > 0;

          $group.toggleClass('is-hidden', !hasVisibleItems);
        });
      } else {
        // Shortcut for performance. Assumes that all groups have items
        // and therefore should be shown.
        $items.removeClass('is-hidden');
        $groups.removeClass('is-hidden');
      }

      // Important when the bottom of the list needs to stay pegged to the top of an input, for example.
      this._position();
    }
  });

  CUI.Widget.registry.register("selectlist", CUI.SelectList);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.SelectList.init($('[data-init~=selectlist]', event.target));
    });
  }

  var selectListSelector = '.coral-SelectList',
    toggleSelector = '[data-toggle~=selectlist]';

  /**
   * Hides all select lists that have autohide enabled.
   * @ignore
   */
  var hideLists = function () {
    $(selectListSelector).each(function () {
      var selectList = $(this).data('selectList');
      if (selectList && selectList.get('autohide')) {
        selectList.hide();
      }
    });
  };

  /**
   * From a toggle element, toggles the visibility of its target select list.
   * @ignore
   */
  var toggleList = function () {
    var $selectList = CUI.util.getDataTarget($(this)),
        selectListWidget;
    if ($selectList.length) {
      selectListWidget = $selectList.data('selectList');
      if (!selectListWidget.get('relatedElement')) {
        selectListWidget.set('relatedElement', this);
        selectListWidget._makeAccessible();
      }
      selectListWidget.resetCaret();
      selectListWidget.toggleVisibility();
    }
    return false;
  };

  var handleToggleSelectorKeydown = function(event) {
    var $selectList = CUI.util.getDataTarget($(this)),
        selectList = $selectList.data('selectList'),
        isVisible = $selectList.length && $selectList.hasClass('is-visible');
    switch(event.which) {
      case 40:
        if ($selectList.length && !isVisible) {
          toggleList.call(this);
        }
        event.preventDefault();
        break;
      case 9:
        if (isVisible && selectList.get('autohide')) {
          event.preventDefault();
        }
        break;
    }
  };

  $(document)
    // If a click reaches the document, hide all open lists.
    .on('click.cui-selectlist', hideLists)

    // If the click is from a select list, don't let it reach the document
    // to keep the listener above from hiding the list.
    .on('click.cui-selectlist', selectListSelector, function (event) {
      event.stopPropagation();
    })

    // If a click is from a trigger button, toggle its menu.
    .on('click.cui-selectlist', toggleSelector, toggleList)

    .on('keydown.cui-selectlist-toggleSelector', toggleSelector, handleToggleSelectorKeydown);


  /**
   * Triggered when option was selected
   *
   * @name CUI.SelectList#selected
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.selectedValue value which was selected
   * @param {String} event.displayedValue displayed text of the selected element
   */

  /**
   * Triggered after option or group was added
   *
   * @name CUI.SelectList#itemadded
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.kind either "option" or "group"
   * @param {String} event.position index of element within parents child list
   * @param {String} event.display displayed text of added element
   * @param {String} event.value value of added element (not present for groups)
   * @param {String} event.target either .coral-SelectList or .coral-SelectList-item--optgroup
   *                              node to which the element was added. Use this
   *                              to detect hierarchies
   */

  /**
   * Triggered after option or group was removed
   *
   * @name CUI.SelectList#itemremoved
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.kind either "option" or "group"
   * @param {String} event.position index of element within parents child list
   *                                before it was removed
   * @param {String} event.display displayed text of removed element
   * @param {String} event.value value of removed element (not present for groups)
   * @param {String} event.target either .coral-SelectList or .coral-SelectList-item--optgroup
   *                              node from which the element was removed. Use
   *                              this to detect hierarchies
   */

  /**
   * Triggered when option was unselected (not implemented)
   *
   * @name CUI.SelectList#unselected
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.selectedValue value which was unselected
   * @param {String} event.displayedValue displayed text of the unselected element
   */

  /**
   * Callback used to test list options for filtering purposes. Expects a
   * return value of true if the list item should be visible or false if it
   * should be hidden.
   *
   * @callback CUI.SelectList~filterCallback
   * @param {Object} value The value of the list item.
   * @param {String} display The text representation of the list item.
   */

}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Item = new Class(/** @lends CUI.SelectList.Item# */{
    toString : 'SelectList.Item',
    $element : undefined,

    /**
     * @private
     * The last known position before the element was removed.
     */
    _cachedPosition: null,

    construct : function (args) {
      this.$element = $(args.element);
    },

    /**
     * Get position within the set of sibling items. The return value may be
     * used as index with {get,add}Group() and {get,add}Option().
     */
    getPosition : function () {
      var position = this.$element.index();
      return position > -1 ? position : this._cachedPosition;
    },

    /**
     * @abstract
     */
    getDisplay : function () {
      throw new Error("Subclass responsibility");
    },

    /**
     * Remove item from list.
     */
    remove : function () {
      var parent = this._getParent();

      this._cachedPosition = this.getPosition();
      this.$element.remove();
      parent.trigger($.Event("itemremoved", {item: this}));
    },

    /**
     * @abstract
     * @private
     */
    _getParent : function () {
      throw new Error("Subclass responsibility");
    }
  });
}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Option = new Class(/** @lends CUI.SelectList.Option# */{
    toString : 'SelectList.Option',

    extend: CUI.SelectList.Item,

    /**
     * Get displayed text, which represents the Option.
     */
    getDisplay : function () {
      return this.$element.text();
    },

    /**
     * Get value, which represents the Option.
     */
    getValue : function () {
      return this.$element.attr("data-value");
    },

    /**
     * @override
     * @private
     */
    _getParent : function () {
      return this.$element.closest(".coral-SelectList, .coral-SelectList-item--optgroup");
    }
  });
}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Group = new Class(/** @lends CUI.SelectList.Group# */{
    toString : 'SelectList.Group',
    extend: CUI.SelectList.Item,

    /**
     * Get displayed text, which represents the Group.
     */
    getDisplay : function () {
      return this.$element.children("span").text();
    },

    /**
     * Get list of Options, that are part of this Group. Similar to
     * {@linkcode CUI.SelectList.getItems()}, only that this may only return
     * Option instances.
     *
     * @return {Array} List of CUI.SelectList.Option instances.
     */
    getItems : function () {
      return this._getItems().toArray().map(function (element) {
        return new CUI.SelectList.Option({element : element});
      });
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @returns option
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this._getItems(),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      return new CUI.SelectList.Option({element: element});
    },

    /**
     * Add Option to Group. If specified, the option will be inserted at
     * `position`, otherwise at the end.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     */
    addOption : CUI.SelectList.prototype.addOption,

    /**
     * @private
     */
    _addItem : CUI.SelectList.prototype._addItem,
    /**
     * @private
     */
    _getList : function () {
      return this.$element.children(".coral-SelectList-sublist").first();
    },
    /**
     * @private
     */
    _getItems : CUI.SelectList.prototype._getItems,
    /**
     * @private
     */
    _makeAccessibleListOption : CUI.SelectList.prototype._makeAccessibleListOption,

    /**
     * @override
     * @private
     */
    _getParent : function () {
      return this.$element.parent();
    }
  });
}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_PANE_LIST = 'coral-TabPanel-content',
      CLASS_TAB_LIST = 'coral-TabPanel-navigation',

      SELECTOR_TAB_LIST = '.' + CLASS_TAB_LIST,
      SELECTOR_PANE_LIST = '.' + CLASS_PANE_LIST;

  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A group of tabs.
     *
     * @description Creates a new tab panel
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} [options.type=""] Style type of the tabs. Can be
     * "stacked", "nav", or left blank (infers the default type).
     * @param  {Number} [options.active=0] index of active tab
     */
    construct: function (options) {

      this.tablist = this._findOrCreateTabList();
      this.panelist = this._findOrCreatePaneList();

      this._applyOptions();

      // set up listeners for change events
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:active', this._setActive.bind(this));
    },

    defaults: {},

    // Note: the white tabs variant is deprecated, and will be removed in a future release
    // See https://issues.adobe.com/browse/CUI-1156 and https://issues.adobe.com/browse/CUI-1154
    DEFAULT_VARIANT_KEY: 'default',

    VARIANT_TYPES: [
      'default',
      'stacked',
      'nav'
    ],

    VARIANT_CLASS_MAPPING: {
      'default': '',
      'stacked': 'coral-TabPanel--stacked',
      'nav': 'coral-TabPanel--large'
    },

    /**
     * Disables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setDisabled: function (tab, switcher) {
      var hop = switcher || false;

      tab.toggleClass('is-disabled', hop)
        .prop('aria-disabled', hop);
      return this;
    },

    /**
     * Enables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setEnabled: function (tab) {
      return this.setDisabled(tab, true);
    },

    /**
     * Adds a tab and associated panel.
     *
     * @param {Object} [options] Tab options.
     * @param {String|HTMLElement|jQuery} [options.tabContent] Content to be
     * used inside the tab. This can be an HTML string, a DOM node,
     * or a jQuery object. This content will be wrapped by an
     * internally-created element that will serve as the tab.
     * @param {String|HTMLElement|jQuery} [options.panelContent] Content to be
     * used inside the panel. This can be an HTML string, a DOM node,
     * or a jQuery object. This content will be wrapped by an internally-created
     * element that will serve as the panel. This is not intended to be
     * used when options.panelURL is defined.
     * @param {String} [options.panelURL] A URL from which to asynchronously
     * load the panel content when the tab is activated. This is not intended
     * to be used when options.panelContent is defined.
     * @param {String} [options.panelID] An ID to be applied to the
     * internally-created panel. If one is not provided, a unique ID will be
     * generated for the panel.
     * @param {Number} [options.index] The index at which the tab should be
     * added. If no index is provided, the tab will be added as the last
     * tab.
     * @param {Boolean} [options.enabled=true] Whether the tab should be
     * enabled (disabled tabs cannot be selected).
     * @param {Boolean} [options.active=true] Whether the tab should be
     * immediately activated/selected. In other words, its panel will be
     * immediately visible and panels for other tabs will be hidden.
     *
     * @return {String} The ID of the panel. If options.panelID was defined,
     * this will be the same value. If options.panelID was not defined,
     * this will be an internally-generated, unique ID.
     */
    addItem: function(options) {
      var tabs = this._getTabs();

      options = $.extend({
        tabContent: '',
        panelContent: '',
        panelID: undefined,
        panelURL: undefined,
        index: tabs.length,
        enabled: true,
        active: true
      }, options);

      var $panel = $('<section class="coral-TabPanel-pane"/>').append(options.panelContent);

      if (options.panelID !== undefined) {
        $panel.attr('id', options.panelID);
      }

      var $tab = $('<a class="coral-TabPanel-tab" data-toggle="tab"/>').append(options.tabContent);

      if (options.panelURL !== undefined) {
        $tab.attr('href', options.panelURL);
      }

      // Confine the index to valid values.
      var index = Math.min(Math.max(options.index, 0), tabs.length);

      if (index === 0) {
        this.tablist.prepend($tab);
        this.panelist.prepend($panel);
      } else {
        tabs.eq(index - 1).after($tab);
        this._getPanels().eq(index - 1).after($panel);
      }

      if (!options.enabled) {
        $tab.addClass('is-disabled');
      }

      this._makeTabsAccessible($tab);

      if (options.active && options.enabled) {
        this._activateTab($tab, true);
      }

      return $panel.attr('id');
    },

    /**
     * Removes a tab and associated panel. If the tab being removed is
     * the active tab, the nearest enabled tab will be activated.
     * @param {Number} index The index of the tab to remove.
     */
    removeItem: function(indexOrID) {
      var $tabs = this._getTabs(),
        $panels = this._getPanels(),
        $tab, $panel;

      if (typeof indexOrID === 'number') {
        $tab = $tabs.eq(indexOrID);
        $panel = $panels.eq(indexOrID);
      } else if (typeof indexOrID === 'string') {
        $tab = $tabs.filter('[aria-controls="' + indexOrID + '"]');
        $panel = $panels.filter('#' + indexOrID);
      }

      if (!$tab || !$panel) {
        return;
      }

      if ($tab.hasClass('is-active')) {
        var ENABLED_TAB_SELECTOR = '.coral-TabPanel-tab[data-toggle="tab"]:not(.is-disabled)';

        var $tabToActivate = $tab.nextAll(ENABLED_TAB_SELECTOR).first();

        if ($tabToActivate.length === 0) {
          $tabToActivate = $tab.prevAll(ENABLED_TAB_SELECTOR).first();
        }

        if ($tabToActivate.length === 1) {
          this._activateTab($tabToActivate, true);
        }
      }

      $panel.remove();
      $tab.remove();
    },

    /** Internals **/

    // finds or creates the container for the tabs
    /** @ignore **/
    _findOrCreateTabList: function() {
      var element = this.$element.find(SELECTOR_TAB_LIST);
      if (element.length === 0) {
        element = $('<nav>')
            .addClass(CLASS_TAB_LIST)
            .prependTo(this.$element);
      }
      return element;
    },

    // finds or creates the container for the panes that are being
    // switched be the tabs
    /** @ignore **/
    _findOrCreatePaneList: function() {
      var element = this.$element.find(SELECTOR_PANE_LIST);
      if (element.length === 0) {
        element = $('<div>')
            .addClass(CLASS_PANE_LIST)
            .appendTo(this.$element);
      }
      return element;
    },

    // sets all options
    /** @ignore */
    _applyOptions: function () {
      var activeTab = this._getTabs().filter('.is-active');

      // ensure the type is set correctly
      if (this.options.type) {
        this._setType(this.options.type);
      }

      // init tab switch
      this._initTabswitch();

      // accessibility
      this._makeAccessible();

      // set an active tab if there is non flagged as active
      if (activeTab.length === 0) {
        this._setActive(this.options.active || 0);
      } else {
        // call the activation logic
        // in case the initial tab has remote content
        this._activateTab(activeTab, true);
      }
    },

    /**
     * @return {jQuery} All tabs.
     * @private
     * @ignore
     */
    _getTabs: function() {
      return this.tablist.find('> .coral-TabPanel-tab[data-toggle="tab"]');
    },

    /**
     * @return {jQuery} All panels.
     * @private
     * @ignore
     */
    _getPanels: function() {
      return this.panelist.children('.coral-TabPanel-pane');
    },

    // Set a certain tab (by index) as active
    // * @param  {Number} index of the tab to make active
    /** @ignore */
    _setActive: function (idx) {
      idx = $.isNumeric(idx) ? idx : this.options.active;
      var activeTab = this._getTabs().eq(idx);
      // Activate the tab, but don't focus
      this._activateTab(activeTab, true);
    },

    // sets the type of the tabs
    // @param  {String} type of the tabs: 'default', 'nav', 'stacked'
    /** @ignore */
    _setType: function (type) {

      var that = this,
          classValue = $.type(type) === 'string' ? type : this.options.type;

      // applies the variant if the class type i
      if (this.VARIANT_TYPES.indexOf(classValue) > -1 && this.VARIANT_CLASS_MAPPING[classValue] !== undefined) {


        // gets all the class mappings
        var vals = Object.keys(this.VARIANT_CLASS_MAPPING).map(function (key) {
            return that.VARIANT_CLASS_MAPPING[key];
        });
        // removes any additional class
        this.$element.removeClass(vals.join(' '));

        // adds the new type variant
        this.$element.addClass(this.VARIANT_CLASS_MAPPING[classValue]);
      }
    },

    // activates the given tab
    /** @ignore */
    _activateTab: function (tab, noFocus) {
      var href = tab.attr('href'),
        activeClass = 'is-active',
        tabs = this._getTabs(),
        panels = this._getPanels(),
        panel;

      // do not allow to enable disabled tabs
      if (tab.hasClass('is-disabled')) {
        tab.blur(); // ensure disabled tabs do not receive focus
        return false;
      }

      // get panel based on aria control attribute
      panel = panels.filter('#' + tab.attr('aria-controls'));

      // supposed to be remote url
      if (href && href.charAt(0) !== '#') {
        panel.loadWithSpinner(href);
      }

      tabs.removeClass(activeClass).attr({
        'aria-selected': false,
        'tabindex': -1 // just the active one is able to tabbed
      });
      panels.removeClass(activeClass).attr({
        'aria-hidden': true
      });

      tab.addClass(activeClass).attr({
        'aria-selected': true,
        'tabindex': 0 // just the active one is able to tabbed
      });
      panel.addClass(activeClass).attr({
        'aria-hidden': false
      });

      if (!noFocus) {
        tab.trigger('focus');
      }
    }, // _activateTab

    // add the switching functionality
    /** @ignore */
    _initTabswitch: function () {
      var self = this,
        sel = '> .coral-TabPanel-navigation > .coral-TabPanel-tab[data-toggle="tab"]';

      this.$element.on('click', sel,function (event) {
        var tab = $(event.currentTarget);

        // prevent the default anchor
        event.preventDefault();

        self._activateTab(tab);
      });
    }, // _initTabswitch

    // adds some accessibility attributes and features
    // http://www.w3.org/WAI/PF/aria-practices/#tabpanel
    /** @ignore */
    _makeAccessible: function () {
      this._makeTabsAccessible();
      this._makeTablistAccessible();
    }, // _makeAccessible

    /**
     * Adds accessibility attributes and features for the tabs.
     * @private
     * @ignore
     */
    _makeTabsAccessible: function($tabs) {
      var $panels = this._getPanels();
      $tabs = $tabs || this._getTabs();

      // set tab props
      $tabs.each(function (i, e) {
        var $tab = $(e),
          $panel = $panels.eq($tab.index()),
          id = $panel.attr('id') || CUI.util.getNextId();

        var tabAttrs = {
          'role': 'tab',
          'tabindex': -1,
          'aria-selected': false,
          'aria-controls': id,
          'aria-disabled': $tab.hasClass('is-disabled')
        };

        if (!$tab.attr('href')) {
          // Mainly so the cursor turns the mouse into a hand
          // on hover.
          tabAttrs.href = '#';
        }

        $tab.attr(tabAttrs);

        $panel.attr({
          'id': id,
          'role': 'tabpanel',
          'aria-hidden': true
        });
      });
    },

    /**
     * Adds accessibility attributes and features for the tab list.
     * @private
     * @ignore
     */
    _makeTablistAccessible: function() {
      // init the key handling for tabs
      var self = this,
          tabSelector = '> [role="tab"]';

      // the nav around the tabs has a tablist role
      this.tablist.attr('role', 'tablist');

      // keyboard handling
      this.tablist.on('keydown', tabSelector, function (event) {
        // enables keyboard support

        var elem = $(event.currentTarget),
          tabs = $(event.delegateTarget)
            .find(tabSelector)
            .not('[aria-disabled="true"]'), // ignore disabled tabs
          focusElem = elem,
          keymatch = true,
          idx = tabs.index(elem);

        switch (event.which) {
          case 33: //page up
          case 37: //left arrow
          case 38: //up arrow
            focusElem = idx - 1 > -1 ? tabs[idx - 1] : tabs[tabs.length - 1];
            break;
          case 34: //page down
          case 39: //right arrow
          case 40: //down arrow
            focusElem = idx + 1 < tabs.length ? tabs[idx + 1] : tabs[0];
            break;
          case 36: //home
            focusElem = tabs[0];
            break;
          case 35: //end
            focusElem = tabs[tabs.length - 1];
            break;
          default:
            keymatch = false;
            break;
        }

        if (keymatch) { // if a key matched then we set the currently focused element
          event.preventDefault();
          self._activateTab($(focusElem));
        }
      });
    }
  });

  CUI.Widget.registry.register("tabs", CUI.Tabs);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Tabs.init($('[data-init~=tabs]', event.target));
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.TagList = new Class(/** @lends CUI.TagList# */{
    toString: 'TagList',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A tag list for input widgets. This widget is intended to be used by other widgets.
     * @description Creates a new tag list
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for taglist container
     * @param  {String} options.fieldname fieldname for the input fields
     * @param  {Array} options.values to set the taglist
     * @param  {Boolean} [options.multiline=false] defines if newly created tags are multiline elements
     * @param  {CUI.TagList~rendererCallback} [options.renderer] a custom
     + renderer to use for rendering tags.
     *
     * @fires TagList#itemadded
     * @fires TagList#itemremoved
     *
     */
    construct: function (options) {
      var self = this;

      this.applyOptions();

      this.$element
        .on('change:values', this._setValues.bind(this));

      // Convert to using js-* class when we can break backward-compatibility
      this.$element.on('click', 'button', function (event) {
        var elem = self.$element
            .children()
            .has(event.currentTarget)
            .find('input');

        self.removeItem(elem.val());
      });

      // accessibility
      this._makeAccessible();
    },

    defaults: {
      fieldname: "",
      values: null,
      tag: 'li',
      renderer: null
    },

    /**
     * existing values in the tag list
     * @private
     * @type {Array}
     */
    _existingValues: null,

    applyOptions: function () {
      var self = this;

      this._existingValues = [];

      this.options.values = this.options.values || [];

      // set values if given
      if (this.options.values.length > 0) {
        this._setValues();
      } else { // read from markup
        this.$element.find('input').each(function (i, e) {
          var elem = $(e);

          // add to options.values
          self._existingValues.push(elem.attr('value'));
        });
      }
    },

    /**
     * @private
     */
    _setValues: function () {
      var items = this.options.values;

      // remove list elements
      this.$element.empty();

      // clear options to readd
      this.options.values = [];
      // add elements again
      this.addItem(items);
    },

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#list
     * @private
     */
    _makeAccessible: function () {
      this.$element.attr({
        'role': 'list'
      });

      this.$element.children(this.options.tag).attr({
        'role': 'listitem'
      });
    },

    /**
     * @private
     */
    _show: function () {
      this.$element
        .show()
        .attr('aria-hidden', false);
    },

    /**
     * @private
     */
    _hide: function () {
      this.$element
        .hide()
        .attr('aria-hidden', true);
    },

    /**
     * remove an item from the DOM
     * @private
     * @param  {String} item
     */
    _removeItem: function (item) {
      var elem = this.$element.children(':has(input[value="' + item + '"])');

      if (elem.length > 0) {
        elem.remove();

        this.$element.trigger($.Event('itemremoved'), {
          value: item
        });
      }
    },

    /**
     * adds a new item to the DOM
     * @private
     * @param  {String|Object} item entry to be displayed
     */
    _appendItem: function (item) {
      var display, val;

      // see if string or object
      if ($.type(item) === "string") {
        display = val = item;
      } else {
        display = item.display;
        val = item.value;
      }

      // always be a string
      val += "";

      if (($.inArray(val, this._existingValues) > -1) || val.length === 0) {
        return;
      }

      // add to internal storage
      this._existingValues.push(val); // store as string

      var renderer = this.options.renderer || this._renderTag;
      this.$element.append(renderer.call(this, val, display));

      this.$element.trigger($.Event('itemadded'), {
        value: val,
        display: display
      });
    },

    /**
     * Renders a tag for a given item.
     * @see CUI.TagList~rendererCallback
     * @private
     */
    _renderTag: function(value, display) {
      var elem, btn;
      
      // add DOM element
      elem = $('<' + this.options.tag + '/>', {
        'role': 'listitem',
        'class': 'coral-TagList-tag' + (this.options.multiline ? ' coral-TagList-tag--multiline' : ''),
        'title': display
      });

      btn = $('<button/>', {
        'class': 'coral-MinimalButton coral-TagList-tag-removeButton',
        'type': 'button',
        'title': 'Remove'
      }).appendTo(elem);

      $('<i/>', {
        'class': 'coral-Icon coral-Icon--sizeXS coral-Icon--close'
      }).appendTo(btn);

      $('<span/>', {
        'class': 'coral-TagList-tag-label',
        'text': display
      }).appendTo(elem);

      $('<input/>', {
        'type': 'hidden',
        'value': value,
        'name': this.options.fieldname
      }).appendTo(elem);
      
      return elem;
    },

    /**
     * @param {String} item value to be deleted
     */
    removeItem: function (item) {
      var idx = this._existingValues.indexOf("" + item);

      if (idx > -1) {
        this._existingValues.splice(idx, 1);
        this._removeItem(item);
      }
    },

    /**
     * @param  {String|Object|Array} item
     * @param  {String} item.display
     * @param  {String} item.value
     */
    addItem: function (item) {
      var self = this,
        items = $.isArray(item) ? item : [item];

      $.each(items, function (i, item) {
        self._appendItem(item);
      });
    },

    getValues: function () {
      return this._existingValues.slice(0);
    }
  });

  CUI.Widget.registry.register("taglist", CUI.TagList);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.TagList.init($('[data-init~=taglist]', event.target));
    });
  }

  /**
   * Triggered when an item was added
   *
   * @name CUI.TagList#itemadded
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.value value which was added
   * @param {String} event.display displayed text of the element
   */

  /**
   * Triggered when an item was removed
   *
   * @name CUI.TagList#itemremoved
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.value value which was removed
   */

  /**
   * Callback used to render a tag. If a child of the returned tag is a button,
   * it will be used to remove the tag. The returned tag element should also
   * contain a hidden input with a value that matches the <code>value</code>
   * argument.
   *
   * @callback CUI.TagList~rendererCallback
   * @param {String} value The underlying value for the item.
   * @param {*} display Represents what should be displayed for the item.
   * @return {String|HTMLElement|jQuery} The constructed element to use
   * as a tag.
   */

}(jQuery, this));

(function ($) {
  CUI.Tooltip = new Class(/** @lends CUI.Tooltip# */{
    toString: 'Tooltip',

    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc A tooltip that can be attached to any other element and may be displayed immediately, on mouse over or only on API call.

     @desc Creates a new tooltip.
     @constructs

     @param {Object} options                       Component options
     @param {Mixed} [options.element]              jQuery selector or DOM element to use for tooltip.
     @param {Mixed} options.target                 jQuery selector or DOM element the tooltip is attached to
     @param {String} [options.content]             Content of the tooltip (HTML)
     @param {String} [options.type=info]           Type of dialog to display. One of info, error, notice, success, or inspect
     @param {String} [options.arrow=left]          Where to place the arrow? One of left, right, top or bottom.
     @param {Integer} [options.delay=500]          Delay before an interactive tooltip is shown.
     @param {Integer} [options.distance=5]         Additional distance of tooltip from element.
     @param {Boolean} [options.visible=true]       True to display immediately, False to defer display until show() called
     @param {Boolean} [options.interactive=false]  True to display tooltip on mouse over, False to only show/hide it when show()/hide() is called manually
     @param {Boolean} [options.autoDestroy=false]  Automatically destroy tooltip on hide?
     */
    construct: function (options) {
      // Ensure we have an object, not only a selector
      if (this.options.target) this.options.target = $(this.options.target);

      if (this.$element.length === 0 && this.options.target) {
        // Special case: We do not have a element yet, but a target
        // -> let us create our own element
        this.$element = $("<div>");
        this.$element.insertAfter(this.options.target);
      }

      // Add coral-Tooltip class to give styling
      this.$element.addClass('coral-Tooltip');

      if (this.$element.data("interactive")) {
        this.options.interactive = true;
        if (!this.options.target) this.options.target = this.$element.parent();
      }

      if (this.$element.data("target")) {
        this.options.target = $(this.$element.data("target"));
      }

      if (!this.options.arrow) {
        this.options.arrow = "left"; // set some default
        if (this.$element.hasClass("coral-Tooltip--positionRight")) this.options.arrow = "left";
        if (this.$element.hasClass("coral-Tooltip--positionLeft")) this.options.arrow = "right";
        if (this.$element.hasClass("coral-Tooltip--positionBelow")) this.options.arrow = "top";
        if (this.$element.hasClass("coral-Tooltip--positionAbove")) this.options.arrow = "bottom";
      }

      if (!this.options.type) {
        this.options.type = "info"; // set some default
        if (this.$element.hasClass("coral-Tooltip--info")) this.options.type = "info";
        if (this.$element.hasClass("coral-Tooltip--error")) this.options.type = "error";
        if (this.$element.hasClass("coral-Tooltip--success")) this.options.type = "success";
        if (this.$element.hasClass("coral-Tooltip--notice")) this.options.type = "notice";
        if (this.$element.hasClass("coral-Tooltip--inspect")) this.options.type = "inspect";
      }

      // Interactive Tooltips are never visible by default!
      if (this.options.interactive) {
        this.options.visible = false;
      }

      this.$element.toggleClass("is-hidden", !this.options.visible);

      // Listen to changes to configuration
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:arrow', this._setArrow.bind(this));

      this.applyOptions();
      this.reposition();

      // Save this object also in the target element
      if (this.options.target) this.options.target.data("tooltip", this);

      if (this.options.interactive && this.options.target) {
        var hto = null;
        // Special behaviour on mobile: show tooltip on every touchstart
        $(this.options.target).on("touchstart.cui-tooltip", function (event) {
          if (hto) clearTimeout(hto);
          this.show();
          hto = setTimeout(function () {
            this.hide();
          }.bind(this), 3000); // Hide after 3 seconds
        }.bind(this));

        var showTimeout = false;
        $(this.options.target).on("mouseover.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          showTimeout = setTimeout(function () {
            this.show();
          }.bind(this), this.options.delay);
        }.bind(this));

        $(this.options.target).on("mouseout.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          this.hide();
        }.bind(this));
      }
    },

    defaults: {
      target: null,
      visible: true,
      type: null,
      interactive: false,
      arrow: null,
      delay: 500,
      distance: 5
    },

    _stylesTypes: {
      'info': 'coral-Tooltip--info',
      'error': 'coral-Tooltip--error',
      'notice': 'coral-Tooltip--notice',
      'success': 'coral-Tooltip--success',
      'inspect': 'coral-Tooltip--inspect'
    },

    _arrows: {
      'left': 'coral-Tooltip--positionRight',
      'right': 'coral-Tooltip--positionLeft',
      'top': 'coral-Tooltip--positionBelow',
      'bottom': 'coral-Tooltip--positionAbove'
    },

    applyOptions: function () {
      this._setContent();
      this._setType();
      this._setArrow();
    },

    /** @ignore */
    _setType: function () {
      if (typeof this.options.type !== 'string' || !this._stylesTypes.hasOwnProperty(this.options.type)) return;

      // Remove old type
      var classesNames = this._stylesTypes['info'] + ' ' +
                        this._stylesTypes['error'] + ' ' +
                        this._stylesTypes['notice'] + ' ' +
                        this._stylesTypes['success'] + ' ' +
                        this._stylesTypes['inspect'];

      this.$element.removeClass(classesNames);

      // Add new type
      this.$element.addClass(this._stylesTypes[this.options.type]);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _setArrow: function () {

      if (typeof this.options.arrow !== 'string' || !this._arrows.hasOwnProperty(this.options.arrow)) return;

      // Remove old type
      var classesNames = this._arrows['left'] + ' ' +
                        this._arrows['right'] + ' ' +
                        this._arrows['top'] + ' ' +
                        this._arrows['bottom'];

      this.$element.removeClass(classesNames);

      // Add new type
      this.$element.addClass(this._arrows[this.options.arrow]);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content !== 'string') return;

      this.$element.html(this.options.content);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _show: function () {
      if (this.$element.hasClass("is-hidden")) {
        this.$element.removeClass('is-hidden');
        this.$element.css("display", "none");
      }
      this.$element.fadeIn();
      //this.reposition();
    },

    /** @ignore */
    _hide: function () {
      this.$element.fadeOut(400, function () {
        if (this.options.autoDestroy) {
          this.$element.remove();
          $(this.options.target).off(".cui-tooltip");
          $(this.options.target).data("tooltip", null);
        }
      }.bind(this));
      return this;
    },

    /**
     Place tooltip on page

     @returns {CUI.Tooltip} this, chainable
     */
    reposition: function (withoutWorkaround) {
      if (!this.options.target) return;

      // Reposition a second time due to rendering errors with Chrome and IE
      if (!withoutWorkaround) setTimeout(function () {
        this.reposition(true);
      }.bind(this), 50);

      this.$element.detach().insertAfter(this.options.target);

      this.$element.css("position", "absolute");

      var el = $(this.options.target);
      var eWidth = el.outerWidth(true);
      var eHeight = el.outerHeight(true);

      var eLeft = el.position().left;
      var eTop = el.position().top;

      var offsetParent = el.offsetParent();
      if (!offsetParent.is("html")) {
        eTop  += offsetParent.scrollTop();
        eLeft += offsetParent.scrollLeft();
      }

      var width = this.$element.outerWidth(true);
      var height = this.$element.outerHeight(true);

      var left = 0;
      var top = 0;

      if (this.options.arrow === "left") {
        left = eLeft + eWidth + this.options.distance;
        top = eTop + (eHeight - height) / 2;
      }
      if (this.options.arrow === "right") {
        left = eLeft - width - this.options.distance;
        top = eTop + (eHeight - height) / 2;
      }
      if (this.options.arrow === "bottom") {
        left = eLeft + (eWidth - width) / 2;
        top = eTop - height - this.options.distance;
      }
      if (this.options.arrow === "top") {
        left = eLeft + (eWidth - width) / 2;
        top = eTop + eHeight + this.options.distance;
      }

      this.$element.css('left', left);
      this.$element.css('top', top);

      return this;
    }
  });

  CUI.Widget.registry.register("tooltip", CUI.Tooltip);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      // Only initialize non-interactive tooltips this way!
      CUI.Tooltip.init($("[data-init~=tooltip]", e.target));
    });

    $(document).on("touchstart mouseover", "[data-init~=quicktip]", function (e) {
      var el = $(this),
          tooltip = el.data("tooltip"),
          isMouseOver = e.type === "mouseover",
          quicktip;

      if (!tooltip) {
        quicktip = new CUI.Tooltip({
          target: el,
          content: el.data("quicktip-content") || el.html(),
          type: el.data("quicktip-type"),
          arrow: el.data("quicktip-arrow"),
          interactive: false,
          autoDestroy: true
        });

        if (isMouseOver) {
          // Hide when mouse leaves
          el.pointer("mouseout", function (event) {
            quicktip.hide();
          });

        } else {
          // Hide after 3 seconds
          setTimeout(function () {
            quicktip.hide();
          }, 3000);
        }
      }
    });
  }
}(window.jQuery));

/*
 ADOBE CONFIDENTIAL

 Copyright 2013 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function ($) {
  function cloneLeft(buttons) {
    return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Wizard-backButton").each(processButton);
  }

  function cloneRight(buttons) {
    return buttons.filter("[data-action=next]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Button--primary coral-Wizard-nextButton").each(processButton);
  }

  function cloneCancel(buttons) {
    return buttons.filter("[data-action=cancel]").first()
      .clone(true).addClass("coral-Button--quiet coral-Wizard-nextButton").each(processButton);
  }

  function processButton(i, el) {
    $(el).removeClass("u-coral-hidden").addClass("coral-Button");
  }

  function buildNav(wizard, sections) {
    var nav = wizard.children(".js-coral-Wizard-nav");

    if (nav.length === 0) {
      wizard.prepend(function () {
        nav = $(
          "<nav class=\"js-coral-Wizard-nav coral-Wizard-nav coral--dark coral-Background coral-Text\">" +
            "<ol class=\"coral-Wizard-steplist\"></ol>" +
          "</nav>");
        var ol = nav.children("ol");

        sections.map(function () {
          return $("<li class=\"js-coral-Wizard-steplist-item coral-Wizard-steplist-item\"></li>").
                      text($(this).data("stepTitle") || this.title).get(0);
        }).appendTo(ol);

        return nav;
      });
    }

    nav.addClass("coral--dark");

    nav.find(".js-coral-Wizard-steplist-item:first").addClass("is-active");

    var buttons = sections.first().find(".js-coral-Wizard-step-control");

    nav.prepend(function () {
      return cloneLeft(buttons);
    }).append(function () {
      return cloneRight(buttons).add(cloneCancel(buttons).toggleClass("u-coral-hidden", true));
    });
  }

  function insertAfter(wizard, step, refStep) {
    var index = wizard.children(".js-coral-Wizard-step").index(refStep),
        refNavStep = wizard.children(".js-coral-Wizard-nav").find(".js-coral-Wizard-steplist-item").eq(index),
        navStep = refNavStep.clone().text(step.data("stepTitle") || step.attr("title"));

    hideStep(step);

    refNavStep.after(navStep);
    refStep.after(step);
  }

  function showNav(to) {
    if (to.length === 0) return;

    to.addClass("is-active").removeClass("is-stepped");

    to.prevAll(".js-coral-Wizard-steplist-item").addClass("is-stepped").removeClass("is-active");
    to.nextAll(".js-coral-Wizard-steplist-item").removeClass("is-active is-stepped");
  }

  function hideStep(step) {
    if (step && step.length) {
      step.addClass("u-coral-hidden");
    }
  }

  function showStep(step) {
    if (step && step.length) {
      step.removeClass("u-coral-hidden");
    }
  }

  function changeStep(wizard, to, from) {
    if (to.length === 0) return;

    hideStep(from);
    showStep(to);

    wizard.trigger("flexwizard-stepchange", [to, from]);
  }

  function controlWizard(wizard, action) {
    var nav = wizard.children(".js-coral-Wizard-nav");
    var from = wizard.children(".js-coral-Wizard-step:not(.u-coral-hidden)");
    var fromNav = nav.find(".js-coral-Wizard-steplist-item.is-active");

    var to, toNav;
    switch (action) {
      case "prev":
        to = from.prev(".js-coral-Wizard-step");
        toNav = fromNav.prev(".js-coral-Wizard-steplist-item");
        break;
      case "next":
        to = from.next(".js-coral-Wizard-step");
        toNav = fromNav.next(".js-coral-Wizard-steplist-item");
        break;
      case "cancel":
        return;
    }

    if (to.length === 0) return;

    var buttons = to.find(".js-coral-Wizard-step-control");

    cloneLeft(buttons).replaceAll(nav.children(".coral-Wizard-backButton"));
    cloneRight(buttons).replaceAll(nav.children(".coral-Wizard-nextButton:not([data-action=cancel])"));

    nav.children(".coral-Wizard-nextButton[data-action=cancel]").toggleClass("u-coral-hidden", to.prev(".js-coral-Wizard-step").length === 0);

    showNav(toNav);
    changeStep(wizard, to, from);
  }

  CUI.FlexWizard = new Class(/** @lends CUI.FlexWizard# */{
    toString: "FlexWizard",

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Wizard component
     @desc Creates a new wizard
     @constructs
     */
    construct: function (options) {
      var wizard = this.$element,
          steps = wizard.find(".js-coral-Wizard-step");

      buildNav(wizard, steps);

      wizard.on("click", ".js-coral-Wizard-step-control", function (e) {
        controlWizard(wizard, $(this).data("action"));
      });

      hideStep(steps);
      changeStep(wizard, steps.first());
    },

    /**
     Goes to the previous step. If there is no previous step, this method does nothing.
     */
    prevStep: function() {
      controlWizard(this.$element, "prev");
    },

    /**
     Goes to the next step. If there is no next step, this method does nothing.
     */
    nextStep: function() {
      controlWizard(this.$element, "next");
    },

    /**
     Adds the given step to the wizard.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {Number} [index] The index the step is added. If not passed, the step is added as the last one
     */
    add: function (step, index) {
      var wizard = this.$element;

      if (index === undefined) {
        this.addAfter(step, wizard.children(".js-coral-Wizard-step").last());
        return;
      }

      if (!step.jquery) {
        step = $(step);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, wizard.children(".js-coral-Wizard-step").eq(index));
    },

    /**
     Adds the given step after the given reference step.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {HTMLElement|jQuery} refStep The reference step
     */
    addAfter: function (step, refStep) {
      var wizard = this.$element;

      if (!step.jquery) {
        step = $(step);
      }

      if (!refStep.jquery) {
        refStep = $(refStep);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, refStep);
    },

    /**
     Removes the given step from the wizard.
     If the current step is removed, the resulting behaviour is undefined.

     @param {HTMLElement|jQuery} step The step to be removed
     */
    remove: function(step) {
      var wizard = this.$element;

      if (!step.jquery) {
          step = $(step);
      }

      var index = wizard.children(".js-coral-Wizard-step").index(step);
      wizard.find(".js-coral-Wizard-steplist-item").eq(index).remove();

      step.remove();
    }
  });

  CUI.Widget.registry.register("flexwizard", CUI.FlexWizard);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FlexWizard.init($("[data-init~=flexwizard]", e.target));
    });
  }
}(window.jQuery));

(function ($, window, undefined) {

  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    toString: 'Modal',

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A dialog that prevents interaction with page elements while displayed.

     @desc Creates a new modal dialog.
     @constructs
     @param {Object} options Component options
     @param {Mixed} options.element jQuery selector or DOM element to use for dialog
     @param {String} options.header Title of the modal dialog (HTML)
     @param {String} options.content Title of the modal dialog (HTML)
     @param {String} [options.type=default] Type of dialog to display. One of default, error, notice, success, help, or info
     @param {Array} [options.buttons] Array of button descriptors
     @param {String} [options.buttons.label] Button label (HTML)
     @param {String} [options.buttons.className] CSS class name to apply to the button
     @param {Mixed} [options.buttons.click] Click handler function or string 'hide' to hide the dialog
     @param {String} [options.remote] URL to asynchronously load content from the first time the modal is shown
     @param {Mixed} [options.backdrop=static] False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
     @param {Mixed} [options.visible=true] True to display immediately, False to defer display until show() called

     */
    construct: function (options) {

      // modal parts
      this.header = this.$element.find('.coral-Modal-header');
      this.body = this.$element.find('.coral-Modal-body');
      this.footer = this.$element.find('.coral-Modal-footer');

      // previous focus element
      this._previousFocus = $();

      // creates a backdrop object
      // but it does not attach it to the document
      this.backdrop = $('<div/>', {
        'class': 'coral-Modal-backdrop',
        'style': 'display: none;'
      }).on('click', function (event) {
          if (this.options.backdrop !== 'static') {
            this.hide();
          }
        }.bind(this));

      // Fetch content asynchronously, if remote is defined
      this.body.loadWithSpinner(this.options.remote);

      this.applyOptions();

      this.$element.on('change:heading', this._setHeading.bind(this)) // @deprecated
        .on('change:header', this._setHeader.bind(this))
        .on('change:content', this._setContent.bind(this))
        .on('change:buttons', this._setFooter.bind(this))
        .on('change:type', this._setType.bind(this))
        .on('change:fullscreen', this._setFullscreen.bind(this))

        // close when a click was fired on a close trigger (e.g. button)
        .on('click', '[data-dismiss="modal"]', this.hide.bind(this));

      this._makeAccessible();
    },

    defaults: {
      backdrop: 'static',
      visible: true,
      type: 'default',
      fullscreen: false,
      attachToBody: true
    },

    _types: {
      "default": { "class": '', "iconClass": ""},
      "error": { "class": 'coral-Modal--error', "iconClass": "coral-Icon--alert"},
      "notice": { "class": 'coral-Modal--notice', "iconClass": "coral-Icon--alert"},
      "success": { "class": 'coral-Modal--success', "iconClass": "coral-Icon--checkCircle"},
      "help": { "class": 'coral-Modal--help', "iconClass": "coral-Icon--helpCircle"},
      "info": { "class": 'coral-Modal--info', "iconClass": "coral-Icon--infoCircle"}
    },

    applyOptions: function () {
      this._setHeader();
      this._setHeading();  // @deprecated
      this._setContent();
      this._setFooter();
      this._setType();
      this._setFullscreen();

      if (this.options.visible) {
        // Show immediately
        this.options.visible = false;
        this.show();
      }
    },

    /**
     adds some accessibility attributes and features
     http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
     @private
     */
    _makeAccessible: function () {
      var self = this,
        idPrefix = 'modal-header' + new Date().getTime() + '-';

      // the element has the role dialog
      this.$element.attr({
        'role': 'dialog',
        'aria-hidden': !this.options.visible,
        'aria-labelledby': idPrefix + 'label',
        'aria-describedby': idPrefix + 'message',
        'tabindex': -1
      });

      this.header.find('h2').attr({
        'id': idPrefix + 'label',
        'tabindex': 0
      });

      // Message areas have role document and tabindex="0"
      this.body.attr({
        'id': idPrefix + 'message',
        'role': 'document',
        'tabindex': 0
      });

      // keyboard handling
      this.$element.on('keydown', ':focusable', function (event) {
        // enables keyboard support

        var elem = $(event.currentTarget),
          tabbables = self.$element.find(':tabbable'),
          focusElem;

        switch (event.which) {
          case 9: //tab
            if (event.shiftKey && event.currentTarget === tabbables[0]) {
              // in case it is the first one, we switch to the last one
              focusElem = tabbables.last();
            } else if (!event.shiftKey && event.currentTarget === tabbables[tabbables.length - 1]) {
              // in case it is the last one, we switch to the first one
              focusElem = tabbables.first();
            }
            break;
        }

        if (focusElem) { // if a key matched then we set the currently focused element
          event.preventDefault();
          focusElem.trigger('focus');
        }
      });
    },

    /**
     sets the type of the modal
     @private
     */
    _setType: function () {
      if (this.options.type) {

        var icon = this.$element.find('.coral-Modal-header > .coral-Icon');
        // Remove old type
        for (var typeKey in this._types) {
          this.$element.removeClass(this._types[typeKey]["class"]);
          icon.removeClass(this._types[typeKey]["iconClass"]);
        }
        // Add new type
        if (this.options.type !== 'default') {
          this.$element.addClass(this._types[this.options.type]["class"]);
          icon.addClass(this._types[this.options.type]["iconClass"]);
        }
      }
    },

    /**
     sets the header of the modal
     @private
     */
    _setHeader: function () {
      if (!this.options.header) {
        return;
      }

      this.header.find('h2').html(this.options.header);
    },

    /**
     @deprecated rather use #_setHeader
     @private
     */
    _setHeading: function () {
      if (!this.options.heading) {
        return;
      }

      this.options.header = this.options.heading;
      this._setHeader.apply(this, arguments);
    },

    /**
     sets the content of the modal body
     @private
     */
    _setContent: function () {
      if (!this.options.content) {
        return;
      }

      this.body.html(this.options.content);
    },

    /**
     sets the buttons into the footer from the config
     @private
     */
    _setFooter: function () {
      if (!$.isArray(this.options.buttons)) {
        return;
      }

      var self = this;

      // remove existing buttons
      this.footer.empty();

      $.each(this.options.buttons, function (idx, button) {
        // Create an anchor if href is provided
        var btn = button.href ? $('<a/>', {
          'class': 'button'
        }) : $('<button/>', {
          'class': 'coral-Button',
          'type': 'button'
        });

        // Add label
        btn.html(button.label);

        // attach event handler
        if (button.click === 'hide') {
          btn.attr('data-dismiss', 'modal');
        } else if ($.isFunction(button.click)) {
          btn.on('click', button.click.bind(self, {
            dialog: self
          }));
        }

        if (button.href) {
          btn.attr('href', button.href);
        }

        if (button.className) {
          btn.addClass(button.className);
        }

        self.footer.append(btn);
      });
    },

    /**
     sets the fullscreen css class
     @private
     */
    _setFullscreen: function () {
      if (this.options.fullscreen) {
        this.$element.addClass('fullscreen');
      } else {
        this.$element.removeClass('fullscreen');
      }
    },

    /**
     @private
     @event beforeshow
     */
    _show: function () {
      var documentBody = $('body'),
        tabcapture,
        self = this;

      // ARIA: http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
      // When the dialog is closed or cancelled focus should
      // return to the element in the application which had focus
      // before the dialog is invoked
      this._previousFocus = $(':focus'); //save previously focused element
      this._previousFocus.trigger('blur');

      documentBody.addClass('coral-Modal.is-open');

      // fire event before showing the modal
      this.$element.trigger('beforeshow');

      this._toggleBackdrop(true);

      // Move to the bottom of body so we're outside of any relative/absolute context
      // This allows us to know we'll always float above the backdrop

      // TODO: This doesn't actually work.  The z-index in the css saves the bacon...
      // Even though _toggleBackdrop is called before this append, the
      // backdrop gets appended to body before modal first time through
      // but is appended to body *after* the modal every time after

      if (this.options.attachToBody) {
        if (this.$element.parent('body').length === 0) {
          this.$element.appendTo(documentBody);
        }
        // ARIA
        // Hide sibling elements from assistive technologies,
        // but first store the state of any siblings already have the aria-hidden attribute
        this.$element.siblings('[aria-hidden]').each(function (index, element) {
          $(element).data('aria-hidden', $(element).attr('aria-hidden'));
        });
        this.$element.siblings().not('script, link, style').attr('aria-hidden', this.options.visible);
      }

      this.$element.attr('aria-hidden', !this.options.visible);

      // center before showing
      this.center();

      // fadeIn
      this.$element.fadeIn();

      // When a modal dialog opens focus goes to the first focusable item in the dialog
      this.$element.find(':tabbable:not(.coral-Modal-header .coral-Modal-closeButton):first').focus();

      // add tab-focusable divs to capture and forward focus to the modal dialog when page regains focus
      tabcapture = $('<div class="coral-Modal-tabcapture" tabindex="0"/>');
      tabcapture.on('focus.modal-tabcapture', function (event) {
        var tabbables = self.$element.find(':tabbable'),
          tabcaptures = $('body > .coral-Modal-tabcapture'),
          lasttabcapture = tabcaptures.last(),
          focusElem;

        if (event.currentTarget === lasttabcapture[0]) {
          focusElem = tabbables.filter(':not(.coral-Modal-header .coral-Modal-closeButton):last');
        } else {
          focusElem = tabbables.filter(':not(.coral-Modal-header .coral-Modal-closeButton):first');
        }

        if (focusElem.length === 0) {
          focusElem = self.$element;
        }

        focusElem.trigger('focus');
      })
      // this method chaining is super janky...
        .prependTo(documentBody)
        .clone(true)
        .appendTo(documentBody);

      // add escape handler
      $(document).on('keydown.modal-escape', this._escapeKeyHandler.bind(this));

      return this;
    },

    /**
     @private
     @event beforehide
     */
    _hide: function () {
      $('body').removeClass('coral-Modal.is-open')
        .find('.coral-Modal-tabcapture').off('focus.modal-tabcapture').remove();

      // remove escape handler
      $(document).off('keydown.modal-escape');

      // fire event before showing the modal
      this.$element.trigger('beforehide');

      this._toggleBackdrop(false);

      this.$element.attr('aria-hidden', !this.options.visible);

      this.$element.siblings()
        .removeAttr('aria-hidden')
        .filter(':data("aria-hidden")')
        .each(function (index, element) {
          $(element).attr('aria-hidden', $(element).data('aria-hidden'))
            .removeData('aria-hidden');
        });

      // fadeOut
      this.$element.fadeOut().trigger('blur');

      // ARIA: http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
      // When the dialog is closed or cancelled focus should
      // return to the element in the application which had focus
      // before the dialog is invoked
      this._previousFocus.trigger('focus');

      return this;
    },

    /**
     centers the modal in the middle of the screen
     @returns {CUI.Modal} this, chainable
     */
    center: function () {
      var width = this.$element.outerWidth(),
        height = this.$element.outerHeight();

      this.$element.css({
        'margin-left': -(width / 2),
        'margin-top': -(height / 2)
      });
    },

    /**
     toggles back drop
     @private
     @param  {Boolean} [show] true/false to force state
     */
    _toggleBackdrop: function (show) {
      if (!this.options.backdrop) {
        return;
      }

      var documentBody = $('body');

      if ((show || this.backdrop.is(':hidden')) && show !== false) {
        this.backdrop.appendTo(documentBody).fadeIn();
      }
      else {
        this.backdrop.fadeOut(function () {
          $(this).detach();
        });
      }
    },

    /**
     handler to close the dialog on escape key
     @private
     */
    _escapeKeyHandler: function (event) {
      if (event.which === 27) {
        this.hide();
      }

    }
  });

  CUI.Widget.registry.register("modal", CUI.Modal);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Modal.init($('[data-init~=modal]', event.target));
    });

    // @deprecated
    // this differs from other components
    // rather in future we use data-init~="modal-trigger" to intialize a trigger
    // and require data-init~="modal" on the modal to indicate it is a modal
    $(document).on('click.modal.data-api', '[data-toggle="modal"]',function (e) {
      // Stop links from navigating
      // Always do preventDefault first, otherwise when exception occurs in the handler, it is not called
      e.preventDefault();

      var $trigger = $(this);

      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      // Pass configuration based on data attributes in the triggering link
      var href = $trigger.attr('href');
      var options = $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());

      // Parse buttons
      if (typeof options.buttons === 'string') {
        options.buttons = JSON.parse(options.buttons);
      }

      // If a modal already exists, show it
      var instance = $target.data('modal');

      // Apply the options from the data attributes of the trigger
      // When the dialog is closed, focus on the button that triggered its display
      $target.modal(options);

      // Perform visibility toggle if we're not creating a new instance
      if (instance) {
        $target.data('modal').set({ visible: !instance.get('visible') });
      }
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.Slider = new Class(/** @lends CUI.Slider# */{
    toString: 'Slider',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @desc Creates a slider.
     * @constructs
     *
     * @param {Object} options Component options
     * @param {number} [options.step=1]  The steps to snap in
     * @param {number} [options.min=1]   Minimum value
     * @param {number} [options.max=100] Maximum value
     * @param {number} [options.value=1] Starting value
     * @param {number} [options.tooltips=false] Show tooltips?
     * @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
     * @param {boolean} [options.slide=false]    True for smooth sliding animations. Can make the slider unresponsive on some systems.
     * @param {boolean} [options.disabled=false] True for a disabled element
     * @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min
     *
     */
    construct: function () {
      var that = this,
        elementId = this.$element.attr('id'),
      // sliders with two inputs should be contained within a fieldset to provide a label for the grouping
        fieldset = this.$element.children('fieldset'),
        legend = fieldset.children('legend'),

        values = [];

      // reads the options from markup
      this._readOptions();

      // if the element doesn't have an id, build a unique id using new Date().getTime()
      if (!elementId) {
        elementId = CUI.util.getNextId();
        this.$element.attr('id', elementId);
      }

      this._renderMissingElements();

      // [~dantipa]
      // this block has to be optimized
      // taking the content of fieldset and appending it somewhere else causes flashing
      // future markup should be like the expected markup (breaking change)
      if (fieldset.length > 0) {
        // move all fieldset children other than the legend to be children of the element.
        this.$element.append(fieldset.contents(":not(legend)"));

        // create a new wrapper div with role="group" and class="sliderfieldset," which will behave as a fieldset but render as an inline block
        this._group = $('<div/>', {
          'role': 'group',
          'class': 'coral-Slider-fieldset '
        });

        // wrap the element with the new "coral-Slider-fieldset " div
        // @todo Why not use the existing div? This is slow, do something different here unless absolutely requried
        that.$element.wrap(this._group);

        if (legend.length > 0) {
          // create new label element and append the contents of the legend
          this._grouplegend = $('<label/>').append(legend.contents());

          // give the new label element all the same attributes as the legend
          $.each(legend.prop('attributes'), function () {
            that._grouplegend.attr(this.name, this.value);
          });

          // if the new label/legend has no id, assign one.
          if (!this._grouplegend.attr('id')) {
            this._grouplegend.attr('id', elementId + '-legend');
          }

          this._group.attr('aria-labelledby', this._grouplegend.attr('id'));

          // replace the original fieldset, which now only contains the original legend, with the new legend label element
          fieldset.replaceWith(this._grouplegend);

          // insert the new label/legend before the element
          legend = this._grouplegend.insertBefore(this.$element);
        }
      }

      // get all input value fields
      this.$inputs = this.$element.find('input');

      this.$inputs.each(function (index) {

        var $this = $(this),
          thisId = $this.attr('id');

        // if the input doesn't have an id, make one
        if (!thisId) {
          $this.attr('id', elementId + "-input" + index);
          thisId = $this.attr("id");
        }

        if (!$this.attr("aria-labelledby")) {
          $this.attr("aria-labelledby", "");
        }

        // existing labels that use the "for" attribute to identify the input
        var $label = that.$element.find('label[for="' + thisId + '"]');

        // if we have a legend, the input should first be labelled by the legend
        if (legend) {
          if ($this.attr("aria-labelledby").indexOf(legend.attr("id")) === -1) {
            $this.attr("aria-labelledby", legend.attr("id") + ($this.attr("aria-labelledby").length ? " " : "") + $this.attr("aria-labelledby"));
          }
        }

        // for existing labels that use the "for" attribute to identify the input
        if ($label.length > 0) {
          // the label is not the inputs parent, move it before the slider element tag
          $label.not($this.parent()).insertBefore(that.$element);
          $label.each(function (index) {
            // if the label doesn't have an id, create one
            if (!$(this).attr("id")) {
              $(this).attr("id", thisId + "-label" + index);
            }

            // explicity identify the input's label
            if ($this.attr("aria-labelledby").indexOf(thisId + "-label" + index) === -1) {
              $this.attr("aria-labelledby", ($this.attr("aria-labelledby").length ? " " : "") + thisId + "-label" + index);
            }

            if (!CUI.util.isTouch) {
              $(this).fipo("touchstart", "mousedown", function (event) {
                that.$handles.eq(index).focus();
              }.bind(this));
            }
          });
        }

        // if the input is contained by a label
        if ($this.parent().is("label")) {
          $label = $this.parent();

          // make sure it has an id
          if (!$label.attr("id")) {
            $label.attr("id", thisId + "-label");
          }

          // make sure it explicitly identifies the input it labels
          if (!$label.attr("for")) {
            $label.attr("for", thisId);
          }

          // move the input after the label
          $this.insertAfter($label);

          // if there is a legend, this is a two thumb slider; internal labels identify the minimum and maximum, and they should have the class="hidden-accessible"
          if (legend) {
            $label.addClass("u-coral-screenReaderOnly");
          }

          // move the label outside the slider element tag
          $label.insertBefore(that.$element);
        }

        // if the input has a label and it is not included in the aria-labelledby attribute, add the label id to the "aria-labelledby" attribute
        if ($label.length && $this.attr("aria-labelledby").indexOf($label.attr("id")) === -1) {
          $this.attr("aria-labelledby", $this.attr("aria-labelledby") + ($this.attr("aria-labelledby").length ? " " : "") + $label.attr("id"));
        }

        if ($label.length === 0 && $this.attr("aria-labelledby").length > 0) {
          $label = $("#" + $this.attr("aria-labelledby").split(" ")[0]);
        }

        if ($this.attr("aria-labelledby").length === 0) {
          $this.removeAttr("aria-labelledby");
        }

        // setting default step
        if (!$this.is("[step]")) $this.attr('step', that.options.step);

        // setting default min
        if (!$this.is("[min]")) $this.attr('min', that.options.min);

        // setting default max
        if (!$this.is("[max]")) $this.attr('max', that.options.max);

        // setting default value
        if (!$this.is("[value]")) {
          $this.attr({'value': that.options.value, 'aria-valuetext': that.options.valuetextFormatter(that.options.value)});
          values.push(that.options.value);
        } else {
          values.push($this.attr('value'));
        }

        if (index === 0) {
          if ($this.is(":disabled")) {
            that.options.disabled = true;
            that.$element.addClass("is-disabled");
          } else {
            if (that.options.disabled) {
              $this.attr("disabled", "disabled");
              that.$element.addClass("is-disabled");
            }
          }
        }

        if (CUI.util.isTouch) {
          // handle input value changes
          $this.on("change", function (event) {
            if (that.options.disabled) return;
            if ($this.val() === that.values[index]) return;
            that.setValue($this.val(), index);
          }.bind(this));

          // On mobile devices, the input receives focus; listen for focus and blur events, so that the parent style updates appropriately.
          $this.on("focus", function (event) {
            that._focus(event);
          }.bind(this));

          $this.on("blur", function (event) {
            that._blur(event);
          }.bind(this));
        } else {
          // on desktop, we don't want the input to receive focus
          $this.attr({"aria-hidden": true, "tabindex": -1, "hidden": "hidden"});

          if (index === 0) {
            if ($label) {
              $label.on("click", function (event) {
                if (that.options.disabled) return;
                that._clickLabel(event);
              }.bind(this));
            }

            if (legend) {
              legend.on("click", function (event) {
                if (that.options.disabled) return;
                that._clickLabel(event);
              }.bind(this));
            }
          }
        }
      });

      that.values = values;
      if (this.options.orientation === 'vertical') this.isVertical = true;

      // Set up event handling
      this.$element.fipo("touchstart", "mousedown", function (event) {
        this._mouseDown(event);
      }.bind(this));

      // Listen to changes to configuration
      this.$element.on('change:value', this._processValueChanged.bind(this));
      this.$element.on('change:disabled', this._processDisabledChanged.bind(this));
      this.$element.on('change:min', this._processMinMaxStepChanged.bind(this));
      this.$element.on('change:max', this._processMinMaxStepChanged.bind(this));
      this.$element.on('change:step', this._processMinMaxStepChanged.bind(this));

      // Adjust dom to our needs
      this._render();
    }, // construct

    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      orientation: 'horizontal',
      slide: false,
      disabled: false,
      tooltips: false,
      tooltipFormatter: function (value) {
        return value.toString();
      },
      valuetextFormatter: function (value) {
        return value.toString();
      },
      ticks: false,
      filled: false,
      bound: false
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    draggingPosition: -1,

    /**
     * reads the options from the markup (classes)
     * TODO optimize
     * @private
     */
    _readOptions: function () {
      // setting default dom attributes if needed
      if (this.$element.hasClass('coral-Slider--vertical')) {
        this.options.orientation = 'vertical';
        this.isVertical = true;
      }

      if (this.$element.hasClass('coral-Slider--tooltips')) {
        this.options.tooltips = true;
      }

      if (this.$element.hasClass('coral-Slider--ticked')) {
        this.options.ticks = true;
      }

      if (this.$element.hasClass('coral-Slider--filled')) {
        this.options.filled = true;
      }

      if (this.$element.hasClass('coral-Slider--bound')) {
        this.options.bound = true;
      }

      if (this.$element.data("slide")) {
        this.options.slide = true;
      }
    },

    /**
     * Set the current value of the slider
     * @param {int}   value   The new value for the slider
     * @param {int}   handleNumber   If the slider has 2 handles, you can specify which one to change, either 0 or 1
     */
    setValue: function (value, handleNumber) {
      handleNumber = handleNumber || 0;

      this._updateValue(handleNumber, value, true); // Do not trigger change event on programmatic value update!
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _renderMissingElements: function () {
      if (!this.$element.find("input").length) {
        var that = this,
          el,
          values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
        $.each(values, function (index, value) {
          el = $("<input>");
          el.attr({
            "type": "range",
            "min": that.options.min,
            "max": that.options.max,
            "step": that.options.step,
            "value": value
          }).val(value);
          that.$element.append(el);
        });
      }

      if (!this.$element.find("div.coral-Slider-clickarea").length) {
        var el2 = $("<div class=\"coral-Slider-clickarea\">");
        this.$element.prepend(el2); // Prepend: Must be first element to not hide handles!
      }

      // @todo This is not a missing element, so it's odd to have this method called as such
      this.$element.toggleClass("coral-Slider", true);
      this.$element.toggleClass("coral-Slider--vertical", this.options.orientation === 'vertical');
      this.$element.toggleClass("coral-Slider--tooltips", this.options.tooltips); // Not used in CSS
      this.$element.toggleClass("coral-Slider--ticked", this.options.ticks); // Not used in CSS
      this.$element.toggleClass("coral-Slider--filled", this.options.filled); // Not used in CSS
    },

    _processValueChanged: function () {
      var that = this,
        values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
      $.each(values, function (index, value) {
        that._updateValue(index, value, true); // Do not trigger change event on programmatic value update!
      });
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processMinMaxStepChanged: function () {
      var that = this;
      this.$element.find("input").attr("min", this.options.min);
      this.$element.find("input").attr("max", this.options.max);
      this.$element.find("input").attr("step", this.options.step);

      $.each(this.values, function (index, value) {
        that._updateValue(index, value, true); // Ensure current values are between min and max
      });

      if (this.options.ticks) {
        this.$element.find(".coral-Slider-ticks").remove();
        this._buildTicks();
      }

      if (this.options.filled) {
        this.$element.find(".coral-Slider-fill").remove();
        this._buildFill();
      }

      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processDisabledChanged: function () {
      if (this.options.disabled) {
        this.$inputs.attr("disabled", "disabled");
        this.$handles.each(function () {
          // @todo always chain class or cache selectors
          $(this).removeClass("is-focused");
          $(this).parent().removeClass("is-focused");
        });
        if (CUI.util.isTouch)
          this.$handles.attr("aria-disabled", true).removeAttr("tabindex");
      } else {
        this.$inputs.removeAttr("disabled");
        if (CUI.util.isTouch)
          this.$handles.removeAttr("aria-disabled").attr("tabindex", 0);
      }
      this.$element.toggleClass("is-disabled", this.options.disabled);
    },
    _render: function () {
      var that = this;

      // get maximum max value
      var maximums = that.$inputs.map(function () {
        return $(this).attr('max');
      });
      that.options.max = Math.max.apply(null, maximums.toArray());

      // get minimum min value
      var minimums = that.$inputs.map(function () {
        return $(this).attr('min');
      });
      that.options.min = Math.min.apply(null, minimums.toArray());

      // get minimum step value
      var steps = that.$inputs.map(function () {
        return $(this).attr('step');
      });
      that.options.step = Math.min.apply(null, steps.toArray());

      // Todo: do not add already existing elements or remove them before adding new elements
      // build ticks if needed
      if (that.options.ticks) {
        that._buildTicks();
      }

      // build fill if needed
      if (that.options.filled) {
        that._buildFill();
      }

      that._buildHandles();
    },

    _buildTicks: function () {
      // The ticks holder
      var $ticks = $("<div></div>").addClass('coral-Slider-ticks');
      this.$element.prepend($ticks);

      var numberOfTicks = Math.round((this.options.max - this.options.min) / this.options.step) - 1;
      var trackDimensions = this.isVertical ? this.$element.height() : this.$element.width();
      for (var i = 0; i < numberOfTicks; i++) {
        var position = (i + 1) * (trackDimensions / (numberOfTicks + 1));
        var percent = (position / trackDimensions) * 100;
        var tick = $("<div></div>").addClass('coral-Slider-tick').css((this.isVertical ? 'bottom' : 'left'), percent + "%");
        $ticks.append(tick);
      }
      this.$ticks = $ticks.find('.coral-Slider-tick');
      if (this.options.filled) {
        this._coverTicks();
      }
    },

    _buildFill: function () {
      var that = this;

      this.$fill = $("<div></div>").addClass('coral-Slider-fill');

      if (that.values.length !== 0) {
        var percent, fillPercent;
        if (that.values.length < 2) {
          percent = (that.values[0] - that.options.min) / (that.options.max - that.options.min) * 100;
          this.$fill.css((that.isVertical ? 'height' : 'width'), percent + "%");
        } else {
          percent = (this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;
          fillPercent = (this._getHighestValue() - this._getLowestValue()) / (that.options.max - that.options.min) * 100;
          this.$fill.css((that.isVertical ? 'height' : 'width'), fillPercent + "%")
            .css((that.isVertical ? 'bottom' : 'left'), percent + "%");
        }
      }
      this.$element.prepend(this.$fill);
      that.options.filled = true;
    },

    _buildHandles: function () {
      var that = this;

      // Wrap each input field and add handles and tooltips (if required)
      that.$inputs.each(function (index) {

        var wrap = $(this).wrap("<div></div>").parent().addClass("coral-Slider-value");

        // Add handle for input field
        var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
        var handle = $('<div></div>').addClass('coral-Slider-handle u-coral-openHand').css((that.isVertical ? 'bottom' : 'left'), percent + "%")
          .attr({
            "role": "slider",
            "id": $(this).attr("id") + "-handle",
            "aria-valuemin": that.options.min,
            "aria-valuemax": that.options.max,
            "aria-valuenow": that.values[index],
            "aria-valuetext": that.options.valuetextFormatter(that.values[index])
          });

        // position the input relative to the slider container element
        $(this).css((that.isVertical ? 'bottom' : 'left'), percent + "%");
        $(wrap).append(handle);

        // Add tooltip to handle if required
        if (that.options.tooltips) {
          // @todo replace with correct classnames for coral-Tooltip-arrow**
          var tooltip = $("<output>" + $(this).attr('value') + "</output>").addClass('coral-Tooltip coral-Tooltip--info').addClass(that.isVertical ? 'coral-Tooltip--positionRight' : 'coral-Tooltip--positionAbove')
            .attr({'id': $(this).attr("id") + "-tooltip", 'for': $(this).attr("id")});
          handle.append(tooltip);
        }

        if ($(this).attr("aria-labelledby")) {
          handle.attr("aria-labelledby", $(this).attr("aria-labelledby"));
        }

        if (that.$inputs.length > 1 && $(this).attr("aria-labelledby")) {
          var inputlabelids = $(this).attr("aria-labelledby").split(" "),
            label;
          for (var i = 0; i < inputlabelids.length; i++) {
            label = $("#" + inputlabelids[i]);
            if (i > 0) {
              label.removeAttr("for");
              handle.prepend(label);
            }
          }
        }

        if (CUI.util.isTouch) {
          handle.attr("aria-hidden", true);
          $(this).attr("tabindex", 0).removeAttr("aria-hidden").removeAttr("hidden");
        } else {
          handle.on("focus", function (event) {
            that._focus(event);
          }.bind(this));

          handle.on("blur", function (event) {
            that._blur(event);
          }.bind(this));

          handle.on("keydown", function (event) {
            that._keyDown(event);
          }.bind(this));

          handle.attr("tabindex", 0);
          $(this).attr({"aria-hidden": true, "tabindex": -1, "hidden": "hidden"});
        }

        if (that.options.disabled) {
          handle.attr("aria-disabled", true).removeAttr("tabindex");
        }
      });

      that.$handles = that.$element.find('.coral-Slider-handle');
      that.$tooltips = that.$element.find('.coral-Tooltip');
    },

    _handleClick: function (event) {
      if (this.options.disabled) return false;
      var that = this;

      // Mouse page position
      var mouseX = event.pageX;
      var mouseY = event.pageY;

      if (event.type === "touchstart") {
        var touches = (event.originalEvent.touches.length > 0) ? event.originalEvent.touches : event.originalEvent.changedTouches;
        mouseX = touches[0].pageX;
        mouseY = touches[0].pageY;
      }

      if (mouseX === undefined || mouseY === undefined) return; // Do not use undefined values!

      // Find the nearest handle
      var pos = that._findNearestHandle(mouseX, mouseY);

      var val = that._getValueFromCoord(mouseX, mouseY, true);

      if (!isNaN(val)) {
        that._updateValue(pos, val);
        that._moveHandles();
        if (that.options.filled) {
          that._updateFill();
        }
      }

      if (!CUI.util.isTouch) {
        if (event.type === "mousedown") {
          that.$handles.eq(pos).data("mousedown", true);
        }
        that.$handles.eq(pos).focus();
      }
    },

    _findNearestHandle: function (mouseX, mouseY) {
      var that = this;

      var closestDistance = 999999; // Incredible large start value

      // Find the nearest handle
      var pos = 0;
      that.$handles.each(function (index) {

        // Handle position
        var handleX = $(this).offset().left;
        var handleY = $(this).offset().top;

        // Handle Dimensions
        var handleWidth = $(this).width();
        var handleHeight = $(this).height();

        // Distance to handle
        var distance = Math.abs(mouseX - (handleX + (handleWidth / 2)));
        if (that.options.orientation === "vertical") {
          distance = Math.abs(mouseY - (handleY + (handleHeight / 2)));
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          pos = index;
        }
      });

      return pos;
    },

    _focus: function (event) {
      if (this.options.disabled) return false;

      var $this = $(event.target);
      var $value = $this.closest(".coral-Slider-value");
      var $handle = $value.find(".coral-Slider-handle");

      if (!$handle.data("mousedown")) {
        this.$element.addClass("is-focused");
        $value.addClass("is-focused");
        $handle.addClass("is-focused");
      }
    },

    _blur: function (event) {
      if (this.options.disabled) return false;
      var $this = $(event.target);
      var $value = $this.closest(".coral-Slider-value");
      var $handle = $value.find(".coral-Slider-handle");
      this.$element.removeClass("is-focused");
      $value.removeClass("is-focused");
      $handle.removeClass("is-focused").removeData("mousedown");
    },

    _keyDown: function (event) {
      if (this.options.disabled) return;
      var that = this,
        $this = $(event.target),
        $input = $this.closest(".coral-Slider-value").find("input"),
        index = that.$inputs.index($input),
        val = Number($input.val()),
        step = Number(that.options.step),
        minimum = Number(that.options.min),
        maximum = Number(that.options.max),
        page = Math.max(step, Math.round((maximum - minimum) / 10));

      $this.removeData("mousedown");
      that._focus(event);

      switch (event.keyCode) {
        case 40:
        case 37:
          // down/left
          val -= step;
          event.preventDefault();
          break;
        case 38:
        case 39:
          // up/right
          val += step;
          event.preventDefault();
          break;
        case 33:
          // page up
          val += (page - (val % page));
          event.preventDefault();
          break;
        case 34:
          // page down
          val -= (page - (val % page === 0 ? 0 : page - val % page));
          event.preventDefault();
          break;
        case 35:
          // end
          val = maximum;
          event.preventDefault();
          break;
        case 36:
          // home
          val = minimum;
          event.preventDefault();
          break;
      }
      if (val !== Number($input.val())) {
        that.setValue(val, index);
        $input.change();
      }
    },

    _mouseDown: function (event) {
      if (this.options.disabled) return false;
      event.preventDefault();

      var that = this, $handle;

      this.draggingPosition = -1;
      this.$handles.each(function (index, handle) {
        if (handle === event.target) that.draggingPosition = index;
      }.bind(this));

      this.$tooltips.each(function (index, tooltip) {
        if (tooltip === event.target) that.draggingPosition = index;
      }.bind(this));

      // Did not touch any handle? Emulate click instead!
      if (this.draggingPosition < 0) {
        this._handleClick(event);
        return;
      }

      $handle = this.$handles.eq(this.draggingPosition);

      $handle.addClass("is-dragged");
      $("body").addClass("u-coral-closedHand");

      $(window).fipo("touchmove.slider", "mousemove.slider", this._handleDragging.bind(this));
      $(window).fipo("touchend.slider", "mouseup.slider", this._mouseUp.bind(this));

      if ($handle !== document.activeElement && !CUI.util.isTouch) {
        if (event.type === "mousedown") {
          $handle.data("mousedown", true);
        }
        $handle.focus();
      }
      //update();
    },

    _handleDragging: function (event) {
      var mouseX = event.pageX;
      var mouseY = event.pageY;

      // Handle touch events
      if (event.originalEvent.targetTouches) {
        var touch = event.originalEvent.targetTouches.item(0);
        mouseX = touch.pageX;
        mouseY = touch.pageY;
      }

      this._updateValue(this.draggingPosition, this._getValueFromCoord(mouseX, mouseY));
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
      event.preventDefault();
    },

    _mouseUp: function () {
      this.$handles.eq(this.draggingPosition).removeClass("is-dragged");
      $("body").removeClass("u-coral-closedHand");

      this.draggingPosition = -1;
      $(window).unbind("mousemove.slider touchmove.slider");
      $(window).unbind("mouseup.slider touchend.slider");
    },

    _clickLabel: function (event) {
      this.$handles.eq(0)[0].focus(); // @todo What if there are no handles? Impossible case?
    },

    _updateValue: function (pos, value, doNotTriggerChange) {
      var that = this;
      if (that.$inputs.eq(pos).attr("value") !== value.toString() || (that.values[pos] !== value.toString())) {
        if (value > this.options.max) value = this.options.max;
        if (value < this.options.min) value = this.options.min;

        if (pos === 0 || pos === 1) {
          if (that.$inputs.length === 2 && this.options.bound) {
            if (pos === 0) {
              value = Math.min(value, Number(that.$inputs.eq(1).val()));
              that.$inputs.eq(1).attr({"min": value});
              that.$inputs.eq(pos).attr({"max": that.$inputs.eq(1).val()});
              that.$handles.eq(1).attr({"aria-valuemin": value});
              that.$handles.eq(pos).attr({"aria-valuemax": that.$inputs.eq(1).val()});
            } else {
              value = Math.max(value, Number(that.$inputs.eq(0).val()));
              that.$inputs.eq(0).attr({"max": value});
              that.$inputs.eq(pos).attr({"min": that.$inputs.eq(0).val()});
              that.$handles.eq(0).attr({"aria-valuemax": value});
              that.$handles.eq(pos).attr({"aria-valuemin": that.$inputs.eq(0).val()});
            }
          }
          that.values[pos] = value.toString();
          that.$inputs.eq(pos).val(value).attr({"value": value, "aria-valuetext": that.options.valuetextFormatter(value)});
          that.$handles.eq(pos).attr({"aria-valuenow": value, "aria-valuetext": that.options.valuetextFormatter(value)});
          if (!doNotTriggerChange) {
            setTimeout(function () {
              that.$inputs.eq(pos).change(); // Keep input element value updated too and fire change event for any listeners
            }, 1); // Not immediatly, but after our own work here
          }
        }
      }
    },

    _moveHandles: function () {
      var that = this;

      // Set the handle position as a percentage based on the stored values
      this.$handles.each(function (index) {
        var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
        var $input = that.$inputs.eq(index);

        if (that.options.orientation === "vertical") {
          if (that.options.slide) {
            // @todo this is really awful UX, the handle never continues to animate if you're dragging up and moving around
            $(this).stop().animate({bottom: percent + "%"});
            $input.stop().animate({bottom: percent + "%"});
          } else {
            $(this).css("bottom", percent + "%");
            $input.css("bottom", percent + "%");
          }
        } else { // Horizontal
          if (that.options.slide) {
            // @todo this is really awful UX, the handle never continues to animate if you're dragging up and moving around
            $(this).stop().animate({left: percent + "%"});
            $input.stop().animate({left: percent + "%"});
          } else {
            $(this).css("left", percent + "%");
            $input.css("left", percent + "%");
          }
        }

        // Update tooltip value (if required)
        if (that.options.tooltips) {
          that.$tooltips.eq(index).html(that.options.tooltipFormatter(that.values[index]));
        }
      });
    },

    _updateFill: function () {
      var that = this;
      var percent;

      if (that.values.length !== 0) {
        if (that.values.length === 2) { // Double value/handle
          percent = ((that._getLowestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
          var secondPercent = ((that._getHighestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
          var percentDiff = secondPercent - percent;
          if (that.options.orientation === "vertical") {
            if (that.options.slide) {
              that.$fill.stop().animate({bottom: percent + "%", height: percentDiff + "%"});
            } else {
              that.$fill.css("bottom", percent + "%").css("height", percentDiff + "%");
            }
          } else { // Horizontal
            if (that.options.slide) {
              that.$fill.stop().animate({left: percent + "%", width: percentDiff + "%"});
            } else {
              that.$fill.css("left", percent + "%").css("width", percentDiff + "%");
            }
          }
        } else { // Single value/handle
          percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
          if (that.options.orientation === "vertical") {
            if (that.options.slide) {
              that.$fill.stop().animate({height: percent + "%"});
            } else {
              that.$fill.css("height", percent + "%");
            }
          } else {
            if (that.options.slide) {
              that.$fill.stop().animate({width: percent + "%"});
            } else {
              that.$fill.css("width", percent + "%");
            }
          }
        }
      }
      if (that.options.ticks) {
        that._coverTicks();
      }
    },

    _coverTicks: function () {
      var that = this;

      // Ticks covered by the fill are given a different class
      that.$ticks.each(function (index) {
        var value = that._getValueFromCoord($(this).offset().left, $(this).offset().top);
        if (that.values.length === 2) { // @todo Figure out what previous comitter said when they wrote "add a parameter to indicate multi values/handles" here
          if ((value > that._getLowestValue()) && (value < that._getHighestValue())) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
        else {
          if (value < that._getHighestValue()) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
      });
    },

    _getValueFromCoord: function (posX, posY, restrictBounds) {
      var that = this;
      var percent, snappedValue, remainder;
      var elementOffset = that.$element.offset();

      if (that.options.orientation === "vertical") {
        var elementHeight = that.$element.height();
        percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
      } else {
        var elementWidth = that.$element.width();
        percent = ((posX - elementOffset.left) / elementWidth);
      }

      // if the bounds are retricted, as with _handleClick, we souldn't change the value.
      if (restrictBounds && (percent < 0 || percent > 1)) return NaN;

      var rawValue = that.options.min * 1 + ((that.options.max - that.options.min) * percent);

      if (rawValue >= that.options.max) return that.options.max;
      if (rawValue <= that.options.min) return that.options.min;

      // Snap value to nearest step
      remainder = ((rawValue - that.options.min) % that.options.step);
      if (Math.abs(remainder) * 2 >= that.options.step) {
        snappedValue = (rawValue - remainder) + (that.options.step * 1); // *1 for IE bugfix: Interpretes expr. as string!
      } else {
        snappedValue = rawValue - remainder;
      }

      return snappedValue;
    },

    _getHighestValue: function () {
      return Math.max.apply(null, this.values);
    },

    _getLowestValue: function () {
      return Math.min.apply(null, this.values);
    }

    /*
    update: function() {
     // @todo Figure out what last committer meant when they wrote "Single update method" here
    }
    */
  });

  CUI.Widget.registry.register("slider", CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Slider.init($(".coral-Slider[data-init~='slider']", e.target));
    });
  }
}(jQuery, this));


(function ($) {
  CUI.LabeledSlider = new Class(/** @lends CUI.LabeledSlider# */{
    toString: 'LabeledSlider',
    extend: CUI.Slider,

    alternating: false,
    /**
     @extends CUI.Slider
     @classdesc <p><span id="slider-label">A slider widget with labeled ticks</span></p>


     <p>
     The labeled slider uses the same options/markup as the slider label, but with one addition: You can provide a list of labels for the
     slider's ticks. (And of course use data-init="labeled-slider"!)
     </p>
     <p><em>Please note</em> that you have to list the labels for the ticks exactly in the order and count that you configured
     your slider's ticks. If your slider has 5 ticks, provide 5 labels for it. The number of ticks depends on the step / min / max values and
     can be calculated by ceil((max - min) / step) - 1.</p>

     @desc Creates a labeled slider from a div
     @constructs

     @param {Object}   options                               Component options
     @param {number} [options.step=1]  The steps to snap in
     @param {number} [options.min=1]   Minimum value
     @param {number} [options.max=100] Maximum value
     @param {number} [options.value=1] Starting value
     @param {number} [options.tooltips=false] Show tooltips?
     @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
     @param {boolean} [options.slide=false]    True for smooth sliding animations. Can make the slider unresponsive on some systems.
     @param {boolean} [options.disabled=false] True for a disabled element
     @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min
     **/
    construct: function () {
      this.$element.addClass("coral-Slider--labeled");
    },

    _getTickLabel: function (index) {
      var el = this.$element.find("ul.coral-Slider-tickLabels li").eq(index);
      return el.html();
    },

    _buildTicks: function () {
      var that = this;

      // @todo This shouldn't be read from the className, it should be stored as an option
      if (this.$element.hasClass("coral-Slider--alternatingLabels")) this.alternating = true;

      // The ticks holder
      var $ticks = $("<div></div>").addClass('coral-Slider-ticks');
      this.$element.prepend($ticks);

      var numberOfTicks = Math.ceil((that.options.max - that.options.min) / that.options.step) - 1;
      var trackDimensions = that.isVertical ? that.$element.height() : that.$element.width();
      var maxSize = trackDimensions / (numberOfTicks + 1);

      if (this.alternating) maxSize *= 2;
      for (var i = 0; i < numberOfTicks; i++) {
        var position = trackDimensions * (i + 1) / (numberOfTicks + 1);
        var tick = $("<div></div>").addClass('coral-Slider-tick').css((that.isVertical ? 'bottom' : 'left'), position + "px");
        $ticks.append(tick);
        var className = "coral-Slider-tickLabel-" + i; // @todo Is this necessary?
        var ticklabel = $("<div></div>").addClass('coral-Slider-tickLabel ' + className);
        if (!that.isVertical) position -= maxSize / 2;
        ticklabel.css((that.isVertical ? 'bottom' : 'left'), position + "px");
        if (!that.isVertical) ticklabel.css('width', maxSize + "px");
        if (that.alternating && !that.isVertical && i % 2 === 1) {
          // @todo Are either of these styled anywhere?
          // @todo Can't we just rely on nth-child? It's supported in IE9
          ticklabel.addClass('coral-Slider-tickLabel--alternate');
          tick.addClass('coral-Slider-tick--alternate');
        }
        ticklabel.append(that._getTickLabel(i));
        $ticks.append(ticklabel);
      }
      that.$ticks = $ticks.find('.tick');  // @todo wrong class?  can't figure out if the behavior is wrong here.
      if (that.options.filled) {
        that._coverTicks();
      }
    }

  });

  CUI.Widget.registry.register("labeled-slider", CUI.LabeledSlider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.LabeledSlider.init($(".coral-Slider[data-init~='labeled-slider']", e.target));
    });
  }
}(window.jQuery));




(function ($, window, undefined) {
  CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
    toString: 'Autocomplete',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc Autocomplete is an input component which allows users
     * to search a list of items by typing into the input or, optionally,
     * clicking a toggle button. The list of items can be provided directly
     * or loaded dynamically from a remote endpoint. Depending on enabled
     * options, users can also create tags based on the text they have
     * entered or an item they have selected.
     *
     * @description Creates a new select
     * @constructs
     *
     * @param {Object} options Component options
     * @param {Mixed} options.element jQuery selector or DOM element to use
     * for the autocomplete element.
     * @param {String} [options.mode=starts] Search mode for
     * filtering on the client. Possible values are "starts" or "contains".
     * This has no effect if filtering is occurring remotely.
     * @param {Boolean} [options.ignorecase=true] Whether filtering on the
     * client should be case insensitive. This has no effect if filtering
     * is occurring remotely.
     * @param {Number} [options.delay=500] Amount of time, in milliseconds,
     * to wait after typing a character before a filter operation is
     * triggered.
     * @param {Boolean} [options.multiple=false] Allows multiple items
     * to be selected. Each item selection generates a tag.
     * @param {Boolean} [options.forceselection=false] <code>true</code> to
     * restrict the selected value to one of the given options of select list.
     * Otherwise the user is allow to enter arbitrary text.
     * @param {Object} [options.selectlistConfig] A configuration object
     * that is passed through to the select list. See {@link CUI.SelectList}
     * for more information.
     * @param {Object} [options.tagConfig] A configuration object
     * that is passed through to the tag list. See {@link CUI.TagList}
     * for more information.
     */
    construct: function () {
      // find elements
      this._input = this.options.predefine.input || this.$element.find('.js-coral-Autocomplete-textfield');
      this._selectlist = this.options.predefine.selectlist || this.$element.find('.js-coral-Autocomplete-selectList');
      this._tags = this.options.predefine.tags || this.$element.find('.js-coral-Autocomplete-tagList');
      this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.js-coral-Autocomplete-toggleButton');
      this._selectListAnchor = this.$element.find('.js-coral-Autocomplete-field');

      // For backward-compatibility.
      if (!this._selectListAnchor.length) {
        this._selectListAnchor = this.$element.find('.js-coral-Autocomplete-inputGroup');
      }

      // apply
      this.applyOptions();

      // accessibility
      this._makeAccessible();

      this._initTypeahead();
      this._setOptionListeners();
    },

    defaults: {
      mode: 'starts', // filter mode ['starts', 'contains']
      ignorecase: true,
      delay: 200,
      multiple: false,
      forceselection: false,

      selectlistConfig: null,
      tagConfig: null,

      // @warning do not use this
      //
      // future feature
      // allows to bypass element search and pass elements
      // will allow to evalute this solution
      predefine: {}
    },

    applyOptions: function () {
      this._setInput();
      this._setTags();
      this._setSelectlist();
      this._setSuggestions();
      this._setForceSelection();
    },

    /**
     *
     * @return {Array|String} current value
     */
    getValue: function () {
      if (this.options.multiple) { // multiple returns array
        return this._tagListWidget.getValues();
      } else if (this.options.forceselection) {
        return this._lastSelected;
      } else {
        return this._input.val();
      }
    },

    /**
     * Sets up listeners for option changes.
     * @private
     */
    _setOptionListeners: function () {
      this.on('change:multiple', function () {
        this._setInput();
        this._setTags();
        this._setForceSelection();
      }.bind(this));

      this.on('change:forceselection', function () {
        this._setForceSelection();
      }.bind(this));
    },

    /**
     * Initializes the forceselection logic
     * @private
     */
    _setForceSelection: function () {
      var self = this;

      if (this.options.forceselection && !this.options.multiple) {

        // if the hidden field has not been initialized we set it up
        if (!this._valueInput) {

              // queries for the hidden value
          var hiddenInput = this.$element.find('.js-coral-Autocomplete-hidden'),
              // gets name used by the input
              inputName = this._input.prop('name'),
              // gets the current value
              inputValue = this._input.val();

          // if the hidden value exists
          if(hiddenInput.length > 0) {

            // uses the current hidden value
            this._valueInput = hiddenInput;

            // if the hidden input does not have a name and
            // and the input field has one, we assign it to
            // the hidden input
            if(!this._valueInput.prop('name') && inputName) {
              this._valueInput.prop('name', inputName);
            }

            // clears the name of original input
            this._input.prop('name', '');

            // preserves the current value of the hidden field as the last selected
            self._lastSelected = this._valueInput.val();
            // saves the current displayed value
            self._lastSelectedDisplay = inputValue;

          } else {

            // creates a new hidden input
            if (inputName) {
              // creates a hidden field and copies the current
              // name and value
              this._valueInput = $('<input type="hidden" class="js-coral-Autocomplete-hidden">')
                .prop('name', inputName)
                .val(inputValue)
                .insertAfter(this._input);

              // clears the name of original input
              this._input.prop('name', '');
            }

            // sets the initial value as lastSelect and lastDisplaySelected
            self._lastSelected = inputValue;
            self._lastSelectedDisplay = inputValue;
          }
        }

        // Reset to last value on blur.
        this._input.on('blur.autocomplete-forceselection', function () {

          var handler = function () {
              // if the display value has changed
              if (self._lastSelectedDisplay !== self._input.val()) {

                // if the user reset the value, we clear everything
                if (self._input.val() === '') {
                  // resets the stored variables
                  self._lastSelectedDisplay = '';
                  self._lastSelected = '';

                  self._triggerValueChange();
                }

                // sets the latest known values
                self._input.val(self._lastSelectedDisplay);
                self._valueInput.val(self._lastSelected);
              }
          };

          var timeout = setTimeout(handler, 0);

          self._suggestionsBtn.on('focus', function () {
            clearTimeout(timeout);
            self._suggestionsBtn.on('blur', handler);
          });
        });
      } else {
        this._input.off('blur.autocomplete-forceselection');

        if (this._valueInput) {
          // copies back the name and value to the original input
          this._input.prop('name', this._valueInput.prop('name'));
          this._input.val(this._valueInput.val());
          // removes the hidden input
          this._valueInput.remove();
          this._valueInput = undefined;
        }
      }
    },

    /**
     * Initializes the text input
     * @private
     */
    _setInput: function () {
      if (this.options.multiple) {
        this._input.on('keypress.autocomplete-preventsubmit', function (event) {
          if (event.which === 13) { // enter
            // Prevent it from submitting a parent form.
            event.preventDefault();
            return false;
          }
        });
      } else {
        this._input.off('keypress.autocomplete-preventsubmit');
      }

      // Prevents native autocompletion from being enabled when inside
      // a form.
      this._input.attr('autocomplete', 'off');

      // uses the initial value as default
      this._lastSelected = this._input.val();
      this._lastSelectedDisplay = this._input.val();
    },

    /**
     * initializes the select list widget
     * @private
     */
    _setSelectlist: function () {
      // if the element is not there, create it
      if (this._selectlist.length === 0) {
        this._selectlist = $('<ul/>', {
          'id': CUI.util.getNextId(),
          'class': 'coral-SelectList js-coral-Autocomplete-selectList'
        }).appendTo(this.$element);
      } else if (!this._selectlist.attr('id')) {
        this._selectlist.attr('id', CUI.util.getNextId());
      }

      this._selectlist.selectList($.extend({
        relatedElement: this._selectListAnchor,
        autofocus: false,
        autohide: true
      }, this.options.selectlistConfig || {}));

      this._selectListWidget = this._selectlist.data('selectList');

      this._selectlist
        // receive the value from the list
        .on('selected.autocomplete', this._handleSelected.bind(this));
    },

    /**
     * initializes the tags for multiple options
     * @private
     */
    _setTags: function () {
      if (this.options.multiple && !this._tagListWidget) {
        // if the element is not there, create it
        if (this._tags.length === 0) {
          this._tags = $('<ul/>', {
            'class': 'coral-TagList js-coral-Autocomplete-tagList'
          }).appendTo(this.$element);
        }

        this._tags.tagList(this.options.tagConfig || {});
        this._tagListWidget = this._tags.data('tagList');
        this._input.on('keyup.autocomplete-addtag', this._addTag.bind(this));
        var boundTriggerValueChange = this._triggerValueChange.bind(this);
        this._tags.on('itemremoved', boundTriggerValueChange);
        this._tags.on('itemadded', boundTriggerValueChange);

      } else if (!this.options.multiple && this._tagListWidget) {
        this._tags.off('itemadded');
        this._tags.off('itemremoved');
        this._tags.remove();
        this._tags = null;
        this._tagListWidget = null;
        this._input.off('keyup.autocomplete-addtag');
      }
    },

    /**
     * initializes the typeahead functionality
     * @private
     */
    _initTypeahead: function () {
      var self = this,
        timeout;

      var debounceComplete = function () {

        self.showSuggestions(
          self._input.val(),
          false,
          self._selectListWidget);
      };

      var debounce = function (event) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(debounceComplete, self.options.delay);
      };

      this._input.on('input.autocomplete', debounce);

      // IE9 doesn't fire input events for backspace, delete, or cut so
      // we're making up the difference.
      this._input.on('cut.autocomplete', debounce);
      this._input.on('keyup.autocomplete', function (event) {
        switch (event.which) {
          case 8: // backspace
          case 46: // delete
            debounce();
        }
      });
      this._input.on('keypress.autocomplete', function (event) {
        event.stopPropagation();
      });
    },

    /**
     * sets the suggestion button
     * @private
     */
    _setSuggestions: function () {
      var self = this;

      // if the button to trigger the suggestion box is not there,
      // then we add it
      if (this._suggestionsBtn.length) {
        // handler to open suggestion box
        this._suggestionsBtn.attr({
          'tabindex': -1,
          'aria-hidden': true
        });
        this._suggestionsBtn.on('click.autocomplete', function (event) {
          if (!self._selectListWidget.get('visible')) {
            self.showSuggestions(
              '',
              true,
              self._selectListWidget);

            self._input.trigger('focus');

            event.preventDefault();
            // If the event were to bubble to the document the
            // select list would be hidden.
            event.stopPropagation();
          } else {
            self._input.trigger('focus');
          }
        });

        // add class to input to to increase padding right for the button
        this._input.addClass('autocomplete-has-suggestion-btn');
      }
    },

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#combobox
     * http://www.w3.org/WAI/PF/aria/states_and_properties#aria-autocomplete
     * @private
     */
    _makeAccessible: function () {
      var self = this, $inputLabel;
      this._input.attr({
        'id': this._input.attr('id') || CUI.util.getNextId(),
        'role': 'combobox',
        'aria-multiselectable': this.options.multiple || null,
        'aria-autocomplete': this.options.typeahead ? 'list' : null,
        'aria-owns': this._selectlist.attr('id') || null
      });

      // Make sure that the input has a label.
      // If no label is present, this tries to correct the poor practice
      // of using placeholder text instead of a true label.
      $inputLabel = $('label[for="' + this._input.attr('id') +'"]');
      if ($inputLabel.length === 0) {
        $inputLabel = this._input.closest('label');
      }
      if (($inputLabel.length === 0 || $.trim($inputLabel.text()).length === 0) && this._input.attr('placeholder')) {
        this._input.attr({
          'aria-label': this._input.attr('placeholder')
        });
      }

      this._selectListWidget._makeAccessible();

      this._input.add(this._suggestionsBtn).on('keydown.cui-autocomplete', function (event) {
        switch (event.which) {
          case 40: // down arrow
            if (!self._selectListWidget.get('visible')) {
              self._selectListWidget.show().resetCaret();
            } else {
              self._selectListWidget.$element.trigger('focus');
            }
            event.preventDefault();
            // If the event continued propagation then the
            // SelectList would set its cursor to the next
            // item in the list.
            event.stopPropagation();
            break;
        }
      }.bind(this));
    },

    /**
     * adds a new tag with the current input value
     * @private
     */
    _addTag: function (event) {
      if (event.which !== 13 || this.options.forceselection) {
        return;
      }

      this._tagListWidget.addItem(this._input.val());
      this.clear();
      this._selectListWidget.hide();
    },

    /**
     * @private
     * @param  {jQuery.Event} event
     */
    _handleSelected: function (event) {
      this._selectListWidget.hide();

      var selectedValue = event.selectedValue,
        displayedValue = event.displayedValue;

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          display: displayedValue,
          value: selectedValue
        });
        this.clear();
      } else {
        this._lastSelected = selectedValue || displayedValue;
        this._lastSelectedDisplay = displayedValue;

        if (this.options.forceselection) {
          this._input.val(displayedValue);
          this._valueInput.val(this._lastSelected);
        } else {
          // Use _lastSelected to follow <datalist> behaviour
          this._input.val(this._lastSelected);
        }

        this._triggerValueChange();
      }

      this._input.trigger('focus');
    },

    /**
     * this function is triggered when a typeahead request needs to be done
     * override this function to achieve a custom handling on the client
     *
     * @fires Autocomplete#query
     * @param {String} val null if all values need to be shown
     * @param {Boolean} fromToggle Whether the request was triggered
     * by the user clicking the suggestion toggle button.
     * @param {CUI.SelectList} selectlist instance to control the popup
     */
    showSuggestions: function (val, fromToggle, selectlist) { // selectlist argument is passed for custom implementations
      // fire event to allow notifications
      this.$element.trigger($.Event('query', {
        value: val
      }));

      var selectListWidgetType = this._selectListWidget.get('type'),
          showList = true;

      if (val.length || fromToggle) {
        // actually handle the filter
        if (selectListWidgetType === 'static') {
          this._handleStaticFilter(val);
          showList = this._selectlist.find('[role="option"]:not(.is-hidden)').length > 0;
        } else if (selectListWidgetType === 'dynamic') {
          this._handleDynamicFilter(val);
        }
        if (!showList) {
          this._selectListWidget.hide();
        } else {
          this._selectListWidget.show().resetCaret();
        }
      } else if (val.length === 0 && this._selectListWidget._hasFocus()) {
        if (selectListWidgetType === 'static') {
          this._handleStaticFilter(val);
          showList = this._selectlist.find('[role="option"]:not(.is-hidden)').length > 0;
        }
        if (!showList) {
          this._selectListWidget.hide();
        }
      } else { // No input text and the user didn't click the toggle.
        // TODO when val.length === 0, it should show all options. Otherwise bad UX.
        this._selectListWidget.hide();
      }
    },

    /**
     * handles a static list filter (type == static) based on the defined mode
     * @private
     * @param  {String} query The term used to filter list items.
     */
    _handleStaticFilter: function (query) {
      var self = this;

      if (query) {
        this._selectListWidget.filter(function (value, display) {
          if (self.options.ignorecase) {
            display = display.toLowerCase();
            query = query.toLowerCase();
          }

          // performance "starts": http://jsperf.com/js-startswith/6
          // performance "contains": http://jsperf.com/string-compare-perf-test
          return self.options.mode === 'starts' ? display.lastIndexOf(query, 0) === 0 :
            self.options.mode === 'contains' ? display.search(query) !== -1 :
              false;
        });
      } else {
        this._selectListWidget.filter();
      }
    },

    /**
     * handles a static list filter (type == static) based on the defined mode
     * @private
     * @param {String} query The term used to filter list items.
     */
    _handleDynamicFilter: function (query) {
      var data = $.extend({}, this._selectListWidget.get('dataadditional'), {
        query: query
      });

      this._selectListWidget.set('dataadditional', data);
      this._selectListWidget.triggerLoadData(true);
    },

    _triggerValueChange: function () {
      this.$element.trigger(
        $.Event('change:value'),
        {
          value: this.getValue()
        }
      );
    },

    /**
     * clears the autocomplete input field
     */
    clear: function () {
      this._input.val('');
      this._lastSelected = '';
      this._lastSelectedDisplay = '';
      this._selectListWidget.filter();
    },

    /**
     * disables the autocomplete
     */
    disable: function () {
      this.$element.addClass('is-disabled');
      this.$element.attr('aria-disabled', true);
      this._input.prop('disabled', true);
      this._suggestionsBtn.prop('disabled', true);
    },

    /**
     * enables the autocomplete
     */
    enable: function () {
      this.$element.removeClass('is-disabled');
      this.$element.attr('aria-disabled', false);
      this._input.prop('disabled', false);
      this._suggestionsBtn.prop('disabled', false);
    }
  });

  CUI.Widget.registry.register("autocomplete", CUI.Autocomplete);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (e) {
      CUI.Autocomplete.init($('[data-init~=autocomplete]', e.target));
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.Select = new Class(/** @lends CUI.Select# */{
    toString: 'Select',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc a widget which is similar to the native &lt;select&gt;
     *
     * @description Creates a new select
     * @constructs
     *
     * @param {Object} [options=null] Component options
     * @param {Mixed} [options.element=null] jQuery selector or DOM element to use for panel
     * @param {String} [options.type=static] static or dynamic list
     * @param {Boolean} [options.nativewidget=false] shows a native select; instead of a SelectList widget
     * @param {Boolean} [options.nativewidgetonmobile=true] forces a native select on a mobile device if possible
     * @param {Boolean} [options.multiple=false] multiple selection, will automatically be detected form a given &lt;select&gt; source
     */
    construct: function () {
      var self = this;

      // find elements
      this._button = this.$element.children('.coral-Select-button');
      this._buttonText = this._button.children('.coral-Select-button-text');
      this._nativeSelect = this.$element.children('.coral-Select-select');
      this._selectList = this.$element.children('.coral-SelectList');
      this._tagList = this.$element.children('.coral-TagList');
      this._valueInput = this.$element.children('input[type=hidden]');

      // apply
      this.applyOptions();
    },

    defaults: {
      type: 'static',
      nativewidget: false,
      nativewidgetonmobile: true,
      multiple: false,
      tagConfig: null,
      selectlistConfig: null
    },

    applyOptions: function () {
      // there is a select given so read the "native" config options
      if (this._nativeSelect.length > 0) {
        // if multiple set multiple
        if (this._nativeSelect.prop('multiple')) {
          this.options.multiple = true;
        }
      }

      // Create SelectList in any case, since it is used to implement
      // add{Option,Group} and getItems APIs.
      this._createSelectList();

      this._nativeSelect.removeClass("coral-Select-select--native");
      this._nativeSelect.off(".selectlist");
      this._button.off(".selectlist");

      switch (this._getModeOfOperation()) {
        case "disabled":
          this._disabledEventHandling();
          break;

        case "nativeselect":
          this._prepareSelectForInteraction();
          this._disableKeyboardInteractionWithSelectList();
          break;

        case "selectlist":
          this._prepareSelectListForInteraction();
          this._disableKeyboardInteractionWithNativeSelect();
          break;

        case "hybrid":
          this._prepareSelectForInteraction();
          this._prepareSelectListForInteraction();

          this._hybridEventHandling();
          this._disableKeyboardInteractionWithNativeSelect();
          break;
      }

      if (this.options.multiple) {
        this._setTagList();
      } else if (this.options.type === 'static') {
        this._handleNativeSelect();
      }

      this._makeAccessible();
    },

    _makeAccessible: function() {
      var labelElementSelector, $labelElement, labelElementId,
          isMacLike = window.navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

      this._button.attr({
        'id': this._button.attr('id') || CUI.util.getNextId()
      });

      if (this._button.hasClass('is-invalid')) {
        this._button.attr({
          'aria-invalid': true
        });
        this._nativeSelect.attr({
          'aria-invalid': true
        });
        this._selectList.attr({
          'aria-invalid': true
        });
      }

      if (this._button.hasClass('is-disabled')) {
        this._button.attr({
          'aria-disabled': true,
          'disabled': 'disabled'
        });
        this._nativeSelect.attr({
          'aria-disabled': true,
          'disabled': 'disabled'
        });
        this._selectList.attr({
          'aria-disabled': true
        });
      }

      labelElementSelector = (this._nativeSelect.length && this._nativeSelect.attr('id')) ? 'label[for="'+ this._nativeSelect.attr('id') +'"]' : 'label[for="'+ this._button.attr('id') +'"]';

      $labelElement = $(labelElementSelector);

      $labelElement.attr({
        'id':  $labelElement.attr('id') || CUI.util.getNextId()
      });

      labelElementId = $labelElement.attr('id');

      this._buttonText.attr({
        'id': this._buttonText.attr('id') || CUI.util.getNextId()
      });

      this._button.attr({
        'role': isMacLike ? 'button' : 'combobox',
        'aria-expanded': false,
        'aria-haspopup': true,
        'aria-labelledby': labelElementId ?  this._buttonText.attr('id') + ' ' + labelElementId : null,
        'aria-owns': this._selectList.attr('id'),
        'aria-multiselectable': this.options.multiple || null
      });

      if (this._selectListWidget) {
        this._selectListWidget._makeAccessible();
      }

      this._selectList.attr({
        'aria-controls': this._button.attr('id'),
        'aria-multiselectable': this.options.multiple || null
      });

      if ($labelElement.length && !this._button.is('[aria-hidden=true]')) {
        $labelElement.on('click.selectLabel', function (event) {
          this._button.focus();
          event.preventDefault();
        }.bind(this));
      }
    },

    /**
     * @return {Array|String} current value
     */
    getValue: function () {
      if (this.options.multiple) { // multiple returns array
        return this._tagListWidget.getValues();
      } else if (this.options.type === 'static') { // static
        return this._nativeSelect[0][this._nativeSelect[0].selectedIndex].value;
      } else if (this.options.type === 'dynamic') {
        return this._valueInput.val();
      }

      return null;
    },



    /**
     * Retrieve list of first level list items (groups or options). NB: The list
     * represents a snapshot of the current state. If items are added or
     * removed, the list will become invalid.
     *
     * @return {Array} List of CUI.SelectList.Option and CUI.SelectList.Group
     *                 instances
     */
    getItems : function () {
      return this._selectListWidget.getItems();
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @param {Number} position
     *
     * @returns option
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption: function (position) {
      return this._selectListWidget.getOption(position);
    },

    /**
     * Get CUI.SelectList.Group representing the group at the given position.
     *
     * @param {Number} position
     *
     * @returns group
     *
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getGroup: function (position) {
      return this._selectListWidget.getGroup(position);
    },

    /**
     * Adds option at the given position. If position is undefined, the option
     * is added at the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged. Since closing/opening the select will reload the list
     * content, the elements that were added via this method call will be lost.
     *
     * @param {Object|CUI.SelectList.Option|Element|jQuery|Array} option
     *        Option that should be added. If type is Object, the keys `value`
     *        and `display` are used to create the option. If type is
     *        CUI.SelectList.Option, the underlying element is added to the
     *        list. If type is Element, the node is added to the list. If type
     *        is jQuery <b>all</b> elements within the collection are added to
     *        the list. If type is Array, then the array is expected to contain
     *        one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addOption : function (option, position) {
      this._selectListWidget.addOption(option, position);
    },

    /**
     * Adds option group at the given position. If position is undefined, the
     * group is added to the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged. Since closing/opening the select will reload the list
     * content, the elements that were added via this method call will be lost.
     *
     * @param {String|CUI.SelectList.Group|Element|jQuery|Array} group
     *        Group that should be added. If type is String, it is used as
     *        display value.  If type is CUI.SelectList.Group, the underlying
     *        element is added to the list. If type is Element, the node is
     *        added to the list.  If type is jQuery <b>all</b> element within
     *        the collection are added to the list. If type is Array, then the
     *        array is expected to contain one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addGroup : function (group, position) {
      this._selectListWidget.addGroup(group, position);
    },

    /**
     * @private
     */
    _getModeOfOperation : function () {
      if (this._button.is(".is-disabled")) {
        return "disabled";
      }
      if (this.options.type === 'dynamic') {
        // Functionality only supported in combination with SelectList component
        return "selectlist";
      }
      if (this.options.nativewidget) {
        // If native widget is set explicitly, we should follow the wish
        return "nativeselect";
      }
      if (this.options.nativewidgetonmobile) {
        // Unless specified otherwise, we want to have native controls on touch
        return "hybrid";
      }

      return "selectlist";
    },


    /**
     * @private
     */
    _disabledEventHandling : function () {
      this._button.on("click.selectlist", function (e) {
        return false;
      });
    },

    /**
     * Sets up event handling for hybrid mode. When a user clicks on the select,
     * which is positioned right above the button, then the opening of the
     * native options list should be aborted. Instead a button click should be
     * emulated. If the user taps on the select, no special handling should take
     * place. Instead the native default behaviour should cause the select to be
     * opened.
     *
     * @private
     */
    _hybridEventHandling : function () {
      var isTouch = false,
          stopClick = false,
          self = this;

      this._nativeSelect
        .on("touchstart.selectlist", function () {
          isTouch = true;
        })
        .on("pointerdown.selectlist", function (e) { // IE 11+
          if (e.originalEvent && e.originalEvent.pointerType === "touch") {
            isTouch = true;
          }
        })
        .on("MSPointerDown.selectlist", function (e) { // IE 10
          if (e.originalEvent && e.originalEvent.pointerType === 2) {
            isTouch = true;
          }
        })
        .on("mousedown.selectlist", function (e) {
          // Ignore touch interaction. We're prefering the defaults in this case
          if (isTouch) {
            isTouch = false;
            return;
          }

          // Ignore everything but left clicks
          if (e.which !== 1) {
            return;
          }

          /**
           * Trying to trick the browser into using the custom SelectList
           * instead of the native select.
           */

          // Avoid display of native options list
          self._nativeSelect.attr("disabled", "disabled");
          setTimeout(function () {
            self._nativeSelect.removeAttr("disabled");
            self._button.focus();
          }, 0);

          stopClick = true;
          self._button.click();
        })
        .on("click.selectlist", function (e) {
          if (stopClick) {
            e.stopPropagation();
            stopClick = false;
          }
        })
        .on("mouseenter.selectlist mouseleave.selectlist", function (e) {
          self._button.toggleClass("is-hovered", e.type === "mouseenter");
        })
        .on("focus.selectlist", function (e) {
          self._button.toggleClass("is-focused", e.type === "focus");
        })
        .on("blur.selectlist", function (e) {
          self._button.removeClass("is-focused");
        });
    },

    /**
     * @private
     */
    _disableKeyboardInteractionWithNativeSelect :  function () {
      // Keyboard focus should not jump to native select
      this._nativeSelect.attr({
        "tabindex": "-1",
        "aria-hidden": true
      });

      this._nativeSelect.off('focusin.nativeselect focusout.nativeselect keydown.nativeselect pointerdown.nativeselect MSPointerDown.nativeselect mousedown.nativeselect');
    },

    /**
     * @private
     */
    _disableKeyboardInteractionWithSelectList : function () {
      // Keyboard focus should not jump to button
      this._button.attr({
        "tabindex": "-1",
        "aria-hidden": true
      });
    },

    /**
     * Applies necessary changes to native select element, so that a user might
     * interact with it.
     *
     * @private
     */
    _prepareSelectForInteraction : function () {
      var self = this;

      self._nativeSelect.addClass("coral-Select-select--native");

      self._nativeSelect.css({
        height: self._button.outerHeight()
      });

      self._nativeSelect.on('change.select', self._handleNativeSelect.bind(self));

      self._nativeSelect.on('focusin.nativeselect', function () {
        self._button.addClass('is-focused');
      });

      self._nativeSelect.on('focusout.nativeselect', function (e) {
        self._button.removeClass('is-focused');
      });
    },

    /**
     * Creates SelectList and initially syncs with native &lt;select&gt;
     *
     * @private
     */
    _createSelectList : function () {
      var self = this,
          type = 'static';

      // if the element is not there, create it
      if (this._selectList.length === 0) {
        this._selectList = $('<ul/>', {
          'id': CUI.util.getNextId(),
          'class': 'coral-SelectList'
        }).appendTo(this.$element);
      } else if (!this._selectList.attr('id')) {
        this._selectList.attr('id', CUI.util.getNextId());
      }

      // read values from markup
      if (this._nativeSelect.length > 0) {
        this._parseMarkup();
      } else { // if no <select> wa found then a dynamic list is expected
        type = 'dynamic';
      }

      this._selectList.selectList($.extend({
        relatedElement: this._button,
        type: type
      }, this.options.selectlistConfig || {}));

      this._selectListWidget = this._selectList.data('selectList');

      this._selectList
        .on("itemadded", this._addItemToSelect.bind(this))
        .on("itemremoved", function (e) {
          var values;

          if (e.item instanceof CUI.SelectList.Group) {
            values = e.item.getItems().map(function(option) { return option.getValue(); });
          } else {
            values = [e.item.getValue()];
          }

          self._deselect(values);
          self._removeItemFromSelect(e);
        });
    },

    /**
     * Event handler, which acts on element insertions to SelectList and updates
     * &lt;select&gt; accordingly.
     *
     * @private
     */
    _addItemToSelect : function (e) {
      var node;
      if (e.item instanceof CUI.SelectList.Option) {
        node = $("<option>");
        node.attr("value", e.item.getValue());
      }
      else if (e.item instanceof CUI.SelectList.Group) {
        node = $("<optgroup>");
      }
      else {
        // something went wrong.
        return;
      }

      node.text(e.item.getDisplay());


      var parentNode = this._nativeSelect;

      if (e.target != this._selectList.get(0)) {
        // Event occured on nested option, find matching optgroup!
        parentNode = parentNode.children().eq($(e.target).closest(".coral-SelectList-item--optgroup").index());
      }

      var position = e.item.getPosition();

      if (position >= parentNode.children().length) {
        parentNode.append(node);
      }
      else if (position === 0) {
        parentNode.prepend(node);
      }
      else {
        parentNode.children().eq(position).before(node);
      }
    },

    /**
     * Event handler, which acts on element removal from SelectList and updates
     * &lt;select&gt; accordingly.
     *
     * @private
     */
    _removeItemFromSelect : function (e) {
      var parentNode = this._nativeSelect;

      if (e.target != this._selectList.get(0)) {
        // Event occured on nested option, find matching optgroup!
        parentNode = parentNode.children().eq($(e.target).closest(".coral-SelectList-item--optgroup").index());
      }

      parentNode.children().eq(e.item.getPosition()).remove();
    },

    /**
     * Creates SelectList if necessary and populates it with the given data. It
     * also binds the button to the SelectList, such that a click on the button
     * toggles the SelectList visibility.
     *
     * @private
     */
    _prepareSelectListForInteraction : function () {
      var self = this;

      this._button.attr({
        'data-toggle': 'selectlist',
        'data-target': '#' + this._selectList.attr('id')
      });

      this._selectList
        // receive the value from the list
        .on('selected.select', this._handleSelectedFromSelectList.bind(this))
        // handle open/hide for the button
        .on('show.select hide.select', function (event) {
          self._button.toggleClass('is-active', event.type === 'show');
        });
    },

    /**
     * Handles a native change event on the select
     * @fires Select#selected
     * @private
     */
    _handleNativeSelect: function (event) {
      var self = this,
        selected, selectedElem;

      if (self.options.multiple) {
        // loop over all options
        $.each(self._nativeSelect[0].options, function (i, opt) {
          if (opt.selected) {
            self._tagListWidget.addItem({
              value: opt.value,
              display: opt.text
            });
          } else {
            self._tagListWidget.removeItem(opt.value);
          }
        });

        selected = self._tagListWidget.getValues();
      } else if (self._nativeSelect[0]) {

        selectedElem = self._nativeSelect[0][self._nativeSelect[0].selectedIndex];

        self._buttonText.text(selectedElem ? selectedElem.text : '');

        selected = selectedElem ? selectedElem.value : null;
      }

      if (event) {
        this.$element.trigger($.Event('selected', {
          selected: selected
        }));
      }
    },

    /**
     * Selects options within the native select element using the provided values and deselects any options
     * not matching the provided values.
     * @param selectedValues The values for which options should be selected.
     * @private
     */
    _syncSelectionToNativeSelect: function (selectedValues) {
      if (this._nativeSelect.length) {
        $.each(this._nativeSelect[0].options, function (i, option) {
          option.selected = selectedValues.indexOf(option.value) > -1;
        });
      } 
    },

    /**
     * Selects options within the SelectList using the provided values and deselects any options
     * not matching the provided values.
     * @param selectedValues The values for which options should be selected.
     * @private
     */
    _syncSelectionToSelectList: function (selectedValues) {
      if (this._selectList.length) {
        $.each(this._selectList.find(this._selectListWidget._SELECTABLE_SELECTOR), function (i, option) {
          var $option = $(option);
          $option.attr('aria-selected', selectedValues.indexOf($option.attr('data-value')) > -1);
        });
      }
    },

    /**
     * this function parses the values from the native select
     * and prints the right markup for the SelectList widget
     * This function may only be called in SelectList widget mode.
     * @private
     */
    _parseMarkup: function () {
      var self = this,
        optgroup = this._nativeSelect.children('optgroup');

      function parseGroup(parent, dest) {
        parent.children('option').each(function (i, e) {
          var opt = $(e);

          $('<li/>', {
            'class': 'coral-SelectList-item coral-SelectList-item--option',
            'data-value': opt.val(),
            'text': opt.text()
          }).appendTo(dest);
        });
      }

      // optgroups are part of the select -> different markup
      if (optgroup.length > 0) {
        optgroup.each(function (i, e) {
          var group = $(e),
            entry = $('<li/>', {
              'class': 'coral-SelectList-item coral-SelectList-item--optgroup'
            }).append($('<span/>', {
              'class': 'coral-SelectList-groupHeader',
              'text': group.attr('label')
            }));

          parseGroup(group, $('<ul/>', {
            'class': 'coral-SelectList-sublist'
          }).appendTo(entry));

          self._selectList.append(entry);
        });
      } else { // flat select list
        parseGroup(this._nativeSelect, this._selectList);
      }
    },

    /**
     * sets a tag list for the multiple selection
     * @private
     */
    _setTagList: function () {
      var self = this;

      // if the element is not there, create it
      if (this._tagList.length === 0) {
        this._tagList = $('<ol/>', {
          'class': 'coral-TagList'
        }).appendTo(this.$element);
      }

      this._tagList.tagList(this.options.tagConfig || {});

      this._tagListWidget = this._tagList.data('tagList');

      this._tagList.on('itemremoved', function (ev, data) {
        var selectedValues = self._tagListWidget.getValues();
        self._syncSelectionToNativeSelect(selectedValues);
        self._syncSelectionToSelectList(selectedValues);
      });

      // Load selected values from markup
      this._handleNativeSelect();
    },

    _handleSelectedFromSelectList: function(e) {
      // we stop the propagation because the component itself provides a selected event too
      if (e) {
        e.stopPropagation();
      }

      this._selectListWidget.hide();

      this._select(e.selectedValue, e.displayedValue);

      this._button.trigger('focus');

      this.$element.trigger($.Event('selected', {
        selected: this.getValue()
      }));
    },

    /**
     * Select an item.
     * @param value The value of the item to be selected.
     * @param display The display text for the item to be selected.
     * @private
     */
    _select: function (value, display) {
      var newSelectedValues;

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          value: value,
          display: display
        });
        newSelectedValues = this._tagListWidget.getValues();
      } else {
        // set the button label
        this._buttonText.text(display);
        // in case it is dynamic a value input should be existing
        this._valueInput.val(value);
        newSelectedValues = ['' + value];
      }

      this._syncSelectionToNativeSelect(newSelectedValues);
      this._syncSelectionToSelectList(newSelectedValues);
    },

    /**
     * Deselects an item.
     * @param value The value of the item to be deselected.
     * @private
     */
    _deselect: function (values) {
      var self = this,
        newSelectedValues;

      if (this.options.multiple) {
        values.forEach(function(value) {
            self._tagListWidget.removeItem(value);
        });
        newSelectedValues = this._tagListWidget.getValues();
      } else {
        // If the selected value is being deselected, select the first option that's not being deselected if one exists.
        if (values.indexOf(this.getValue()) > -1) {
          var newSelectedOption = this._getFirstOptionWithoutValues(this._getAllOptions(), values),
            newValue,
            newDisplay;

          if (newSelectedOption) {
            newValue = newSelectedOption.getValue();
            newDisplay = newSelectedOption.getDisplay();
            newSelectedValues = [newValue];
          } else {
            newValue = '';
            newDisplay = '';
            newSelectedValues = [];
          }

          this._buttonText.text(newDisplay);
          this._valueInput.val(newValue);
        }
      }

      if (newSelectedValues) {
        this._syncSelectionToNativeSelect(newSelectedValues);
        this._syncSelectionToSelectList(newSelectedValues);
      }
    },

    /**
     * Gets the first option that does not have a value equal to those within an array of provided values.
     * @param {Array} options The options to search through.
     * @param {Array} values A blacklist of values.
     * @returns {CUI.SelectList.Option}
     * @private
     */
    _getFirstOptionWithoutValues: function (options, values) {
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (values.indexOf(option.getValue()) === -1) {
          return option;
        }
      }
    },

    /**
     * Retrieves all options as an array of CUI.SelectList.Option objects.
     * Possibly move this up to CUI.SelectList when/if others need it?
     * @returns {Array}
     * @private
     */
    _getAllOptions: function () {
      var items = this.getItems();
      var options = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item instanceof CUI.SelectList.Group) {
          options = options.concat(item.getItems());
        } else {
          options.push(item);
        }
      }

      return options;
    }
  });

  CUI.Widget.registry.register("select", CUI.Select);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (e) {
      CUI.Select.init($('[data-init~=select]', e.target));
    });
  }

  /**
   * Triggered when option was selected
   *
   * @name CUI.Select#selected
   * @event
   *
   * @param {Object} event Event object
   * @param {String|Array} event.selected value which was selected
   *
   */

}(jQuery, this));

(function ($) {

  // Instance id counter:
  var datepicker_guid = 0;

  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A datepicker widget

     <pre>
     Currently there are the following data options:
     data-init="datepicker"         Inits the datepicker widget after page load
     data-disabled                  Sets field to "disabled" if given (with any non-empty value)
     data-required                  Sets field to "required" if given (with any non-empty value)
     data-stored-format             Sets the format of the date for transferring it to the server
     data-displayed-format          Sets the format of the date for displaying it to the user
     data-force-html-mode           Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     data-day-names                 JSON-array-data with the short names of all week days, starting with Sunday
     data-month-names               JSON-array-data with the names of all months, starting with January
     data-head-format               Defines headline format, default is "MMMM YYYY".
     data-start-day                 Defines the start day of the week, 0 = Sunday, 1 = Monday, etc.

     Additionally the type (date, time, datetime) and value are read from the &lt;input&gt; field.
     </pre>

     @desc Creates a datepicker from a div element
     @constructs

     @param {Object}  options                                                     Component options
     @param {Array}   [options.monthNames=english names]                          Array of strings with the name for each month with January at index 0 and December at index 11
     @param {Array}   [options.dayNames=english names]                            Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
     @param {String}  [options.type="date"]                                       Type of picker, supports date, datetime, datetime-local and time
     @param {integer} [options.startDay=0]                                        Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
     @param {boolean} [options.disabled=false]                                    Is this widget disabled?
     @param {String}  [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
     @param {String}  [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]                Storage Date format, is never shown to the user, but transferred to the server
     @param {String}  [options.required=false]                                    Is a value required?
     @param {String}  [options.hasError=false]                                    True to display widget as erroneous, regardless if the value is required or not.
     @param {String}  [options.minDate]                                           Defines the start date of selection range. Dates earlier than minDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.maxDate]                                           Defines the end date of selection range. Dates later than maxDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.headFormat="MMMM YYYY"]                            Defines calendar headline format, default is "MMMM YYYY"
     @param {boolean} [options.forceHTMLMode=false]                               Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     @param {String}  [options.selectedDateTime]                                  Defines what date/time will be selected when the calendar is rendered. If nothing is specified it will be
     considerend today or current time.
     */

    defaults: {
      monthNames: null,
      dayNames: null,
      format: null,
      type: "date",
      selectedDateTime: null,
      startDay: 0,
      disabled: false,
      displayedFormat: null,
      storedFormat: null,
      headFormat: "MMMM YYYY",
      forceHTMLMode: false,
      required: false,
      hasError: false,
      minDate: null,
      maxDate: null
    },

    displayDateTime: null,
    pickerShown: false,

    construct: function () {
      this.guid = (datepicker_guid += 1);
      this._readOptionsFromMarkup();
      this._parseOptions();
      this._setupMomentJS();
      this._adjustMarkup();
      this._findElements();
      this._constructPopover();
      this._initialize();
    },

    _readOptionsFromMarkup: function () {
      var options = this.options;
      var element = this.$element;
      var $input = $(element.find("input").filter("[type^=date],[type=time]"));
      if ($input.length !== 0) {
        options.type = $input.attr("type");
      }

      [
        [ "disabled", "disabled", asBoolean ],
        [ "required", "required", asBoolean ],
        [ "displayed-format", "displayedFormat", ifDefined],
        [ "stored-format", "storedFormat", ifDefined],
        [ "force-html-mode", "forceHTMLMode", ifDefined],
        [ "day-names", "dayNames", ifTruthy],
        [ "month-names", "monthNames", ifTruthy ],
        [ "head-format", "headFormat", ifTruthy],
        [ "start-day", "startDay", asNumber],
        [ "min-date", "minDate", ifDefined],
        [ "max-date", "maxDate", ifDefined]
      ].map(function (attr) {
          var name = attr[0], field = attr[1], processor = attr[2];
          processor(element.data(name), field, options);
        });
    },

    _parseOptions: function () {
      var options = this.options;
      options.monthNames = options.monthNames || CUI.Datepicker.monthNames;
      options.dayNames = options.dayNames || CUI.Datepicker.dayNames;

      options.isDateEnabled =
        (options.type === "date") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      options.isTimeEnabled =
        (options.type === "time") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      var i = document.createElement("input");
      i.setAttribute("type", options.type);
      options.supportsInputType = i.type !== "text";

      if (options.minDate !== null) {
        if (options.minDate === "today") {
          options.minDate = moment().startOf("day");
        } else {
          if (moment(options.minDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.minDate = moment(options.minDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.minDate = null;
          }
        }
      }

      if (options.maxDate !== null) {
        if (options.maxDate === "today") {
          options.maxDate = moment().startOf("day");
        } else {
          if (moment(options.maxDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.maxDate = moment(options.maxDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.maxDate = null;
          }
        }
      }

      options.storedFormat = options.storedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : OFFICIAL_DATETIME_FORMAT);
      options.displayedFormat = options.displayedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : DISPLAY_FORMAT);
      options.useNativeControls = options.forceHTMLMode;

      if ((!options.forceHTMLMode) &&
        IS_MOBILE_DEVICE &&
        options.supportsInputType) {
        options.useNativeControls = true;
      }

      // If HTML5 input is used, then force to use the official format.
      if (options.useNativeControls) {
        if (options.type === 'date') {
          options.displayedFormat = OFFICIAL_DATE_FORMAT;
        } else if (options.type === 'time') {
          options.displayedFormat = OFFICIAL_TIME_FORMAT;
        } else {
          options.displayedFormat = OFFICIAL_DATETIME_FORMAT;
        }
      }
    },

    _setupMomentJS: function () {
      // Generate a language name for this picker to not overwrite any existing
      // moment.js language definition
      this.options.language = LANGUAGE_NAME_PREFIX + new Date().getTime();

      moment.lang(this.options.language, {
        months: this.options.monthNames,
        weekdaysMin: this.options.dayNames
      });
    },

    _adjustMarkup: function () {
      var $element = this.$element;

      if (!this.options.useNativeControls) {
        var id = "popguid" + this.guid;
        var idQuery = "#" + id + ".coral-Popover";
        this.$popover = $('body').find(idQuery);
        if (this.$popover.length === 0) {
          $('body').append(HTML_POPOVER.replace("%ID%", id));
          this.$popover = $('body').find(idQuery);
          if (this.options.isDateEnabled) {
            this.$popover.find(".coral-Popover-content").append(HTML_CALENDAR);
          }
        }
      } else {
        // Show native control
        this.$popover = [];
      }

      // Always include hidden field
      if ($element.find("input[type=hidden]").length === 0) {
        $element.append("<input type=\"hidden\">");
      }

      if (!$element.find("input[type=hidden]").attr("name")) {
        var name = $element.find("input").not("[type=hidden]").attr("name");
        $element.find("input[type=hidden]").attr("name", name);
        $element.find("input").not("[type=hidden]").removeAttr("name");
      }
    },

    _findElements: function () {
      this.$input = this.$element.find('input').not("[type=hidden]");
      this.$hiddenInput = this.$element.find('input[type=hidden]');
      this.$openButton = this.$element.find('button');
    },

    _constructPopover: function () {
      if (this.$popover.length) {
        this.popover = new Popover({
          $element: this.$popover,
          $trigger: this.$openButton,
          options: this.options,
          setDateTimeCallback: this._popoverSetDateTimeCallback.bind(this),
          hideCallback: this._popoverHideCallback.bind(this)
        });
      }
    },

    _initialize: function () {
      if (this.options.useNativeControls) {
        this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        this.$openButton.hide();
      } else {
        this._switchInputTypeToText(this.$input);
      }

      if (!this.options.disabled) {
        this.$openButton.on('click', this._clickHandler.bind(this));
        this.$input.on("change" + (IS_MOBILE_DEVICE ? " blur" : ""), this._inputChangedHandler.bind(this));
      }

      // Reading input value for the first time. There may be a storage format:
      if (!this.options.selectedDateTime) {
        this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
      }

      // Set the selected date and time:
      this._setDateTime(this.options.selectedDateTime, true);
    },

    _readInputVal: function (format) {
      var value = this.$input.eq(0).val();
      if (value !== '') {
        var date = moment(value, format || this.options.displayedFormat);
        if (!date || !date.isValid()) {
          // Fallback: Try automatic guess if none of our formats match
          date = moment(value);
        }
        this.displayDateTime = this.options.selectedDateTime = date;
        if (date !== null && date.isValid()) {
          this.displayDateTime = this.options.selectedDateTime = date;
        }
      } else {
        this.displayDateTime = null;
      }
    },

    _updateState: function () {
      if (this.options.disabled) {
        this.$element.find("input,button").attr("disabled", "disabled");
        this._hidePicker();
      } else {
        this.$element.find("input,button").removeAttr("disabled");
      }

      if (this.options.hasError ||
        (!this.options.selectedDateTime && this.options.required) ||
        (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())
        ) {
        this.$element.addClass("is-invalid");
        this.$element.find("input").addClass("is-invalid");
      } else {
        this.$element.removeClass("is-invalid");
        this.$element.find("input").removeClass("is-invalid");
      }
    },

    _popoverSetDateTimeCallback: function () {
      this._setDateTime.apply(this, arguments);
      if (this.options.isTimeEnabled === false) {
        this._hidePicker();
      }
    },

    _popoverHideCallback: function () {
      this.pickerShown = false;
      this.$element.find("input").removeClass("is-highlighted");
    },

    _switchInputTypeToText: function ($input) {
      var $parent = $input.parent();
      $input.detach().attr('type', 'text').prependTo($parent);
    },

    _openNativeInput: function () {
      this.$input.trigger("tap");
    },

    _clickHandler: function (event) {
      if (this.pickerShown) {
        this._hidePicker();
      } else {
        // The time-out is a work-around for CUI.Popover issue #1307. Must
        // be taken out once that is fixed:
        var self = this;
        setTimeout(function () {
          self._openPicker();
        }, 100);
      }
    },

    _inputChangedHandler: function () {
      if (this.options.disabled) {
        return;
      }

      var newDate;
      if (this.$input.val() !== '') {
        newDate = moment(this.$input.val(), this.options.displayedFormat);
        this.options.hasError = newDate !== null && !isDateInRange(newDate, this.options.minDate, this.options.maxDate);
      } else {
        this.options.hasError = false;
      }
      this._setDateTime(newDate, true); // Set the date, but don't trigger a change event
    },

    _keyPress: function () {
      if (this.pickerShown) {
        // TODO: Keyboard actions
      }
    },

    _openPicker: function () {
      if (this.options.useNativeControls) {
        this._openNativeInput();
      } else {
        this._readInputVal();
        this._showPicker();
      }
    },

    _showPicker: function () {
      if (!this.pickerShown) {
        this.$element.find("input").addClass("is-highlighted");
        this.popover.show(this.displayDateTime);
        this.pickerShown = true;
      }
    },

    _hidePicker: function () {
      if (this.pickerShown) {
        this.$element.find("input").removeClass("is-highlighted");
        this.popover.hide();
        this.pickerShown = false;
      }
    },

    /**
     * Sets a new datetime object for this picker
     * @private
     */
    _setDateTime: function (date, silent) {
      this.options.selectedDateTime = this.displayDateTime = date;

      if (!date) {
        this.$input.val(""); // Clear for null values
      } else if (date.isValid()) {
        this.$input.val(date.lang(this.options.language).format(this.options.displayedFormat)); // Set only valid dates
      }

      var storage = (date && date.isValid()) ? date.lang('en').format(this.options.storedFormat) : ""; // Force to english for storage format!
      this.$hiddenInput.val(storage);

      this._updateState();

      // Trigger a change even on the input
      if (!silent) {
        this.$input.trigger('change');
      }

      // Always trigger a change event on the hidden input, since we're not listening to it internally
      this.$hiddenInput.trigger('change');
    }
  });

  CUI.Datepicker.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.Widget.registry.register("datepicker", CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Datepicker.init($("[data-init~=datepicker]", e.target));
    });
  }

  /**
   * Governs the generation and the interaction of the calendar and
   * time selects.
   *
   * @private
   */
  var Popover = new Class({
    toString: 'Popover',
    extend: Object,

    construct: function (options) {
      this.$element = options.$element;
      this.options = options.options;
      this.setDateTimeCallback = options.setDateTimeCallback;
      this.hideCallback = options.hideCallback;

      this.$element.popover();
      this.popover = this.$element.data("popover");
      this.popover.set({
        pointAt: options.$trigger,
        pointFrom: "bottom"
      });

      this._setupListeners();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be shown.
     */
    show: function (displayDateTime) {
      this.displayDateTime = displayDateTime;
      this._renderCalendar();
      if (this.options.isTimeEnabled) {
        this._renderTime();
      }
      this.popover.show();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be hidden.
     */
    hide: function () {
      this.popover.hide();
    },

    /**
     * Register event handlers.
     *
     * @private
     */
    _setupListeners: function () {

      // Pop show-hide:
      this.popover.on("hide", this._popupHideHandler.bind(this));

      // Calendar navigation
      this.$element.find(".coral-DatePicker-calendar").on("swipe", this._swipeHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-nextMonth", this._mouseDownNextHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-prevMonth", this._mouseDownPrevHandler.bind(this));

      if (this.options.isTimeEnabled) {
        // for Desktop
        this.$element.on("selected", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
        // for Mobile
        this.$element.on("change", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
      }
    },

    _popupHideHandler: function (event) {
      this.hideCallback();
    },

    _swipeHandler: function (event) {
      var d = event.direction,
        year = this.displayDateTime.year(),
        month = this.displayDateTime.month();

      if (d === "left") {
        this.displayDateTime = normalizeDate(moment([year, month + 1, 1]));
        this._renderCalendar("left");
      } else if (d === "right") {
        this.displayDateTime = normalizeDate(moment([year, month - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _mouseDownNextHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]));
        this._renderCalendar("left");
      }
    },

    _mouseDownPrevHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _dropdownChangedHandler: function () {
      var hours = this._getHoursFromDropdown();
      var minutes = this._getMinutesFromDropdown();
      if (!this.options.selectedDateTime) {
        this.options.selectedDateTime = moment();
      }
      var date = this.options.selectedDateTime.hours(hours).minutes(minutes);
      this.setDateTimeCallback(date);
    },

    _tableMouseDownHandler: function (event) {
      event.preventDefault();
      var date = moment($(event.target).data("date"), OFFICIAL_DATETIME_FORMAT);
      if (this.options.isTimeEnabled) {
        var h = this._getHoursFromDropdown();
        var m = this._getMinutesFromDropdown();
        date.hours(h).minutes(m);
      }
      this.setDateTimeCallback(date);
      this._renderCalendar();
    },

    _renderCalendar: function (slide) {
      var displayDateTime = this.displayDateTime;
      if (!displayDateTime || !displayDateTime.isValid()) {
        this.displayDateTime = displayDateTime = moment();
      }

      var displayYear = displayDateTime.year();
      var displayMonth = displayDateTime.month() + 1;

      var table = this._renderOneCalendar(displayMonth, displayYear);

      var $calendar = this.$element.find(".coral-DatePicker-calendar");

      table.on("mousedown", "a", this._tableMouseDownHandler.bind(this));

      if ($calendar.find("table").length > 0 && slide) {
        this._slideCalendar(table, (slide === "left"));
      } else {
        $calendar.find("table").remove();
        $calendar.find(".coral-DatePicker-calendarSlidingContainer").remove();
        $calendar.find(".coral-DatePicker-calendarBody").append(table);
      }
    },

    _renderOneCalendar: function (month, year) {
      var heading = moment([year, month - 1, 1]).lang(this.options.language).format(this.options.headFormat);
      var title = $('<div class="coral-DatePicker-calendarHeader"><h2 class="coral-Heading coral-Heading--2">' + heading + '</h2></div>').
        append($("<button class=\"coral-MinimalButton coral-DatePicker-nextMonth\">&#x203A;</button>")).
        append($("<button class=\"coral-MinimalButton coral-DatePicker-prevMonth\">&#x2039;</button>"));
      var $calendar = this.$element.find(".coral-DatePicker-calendar");
      var header = $calendar.find(".coral-DatePicker-calendarHeader");
      if (header.length > 0) {
        header.replaceWith(title);
      } else {
        $calendar.prepend(title);
      }

      var table = $("<table>");
      table.data("date", year + "/" + month);

      var html = "<tr>";
      var day = null;
      for (var i = 0; i < 7; i++) {
        day = (i + this.options.startDay) % 7;
        var dayName = this.options.dayNames[day];
        html += "<th><span>" + dayName + "</span></th>";
      }
      html += "</tr>";
      table.append("<thead>" + html + "</thead>");

      var firstDate = moment([year, month - 1, 1]);
      var monthStartsAt = (firstDate.day() - this.options.startDay) % 7;
      if (monthStartsAt < 0) monthStartsAt += 7;

      html = "";
      var today = moment();

      for (var w = 0; w < 6; w++) {
        html += "<tr>";
        for (var d = 0; d < 7; d++) {
          day = (w * 7 + d) - monthStartsAt + 1;
          var displayDateTime = moment([year, month - 1, day]);
          var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
          var cssClass = "";

          if (isSameDay(displayDateTime, today)) {
            cssClass += " today";
          }

          if (isSameDay(displayDateTime, this.options.selectedDateTime)) {
            cssClass += " selected";
          }

          if (isCurrentMonth && isDateInRange(displayDateTime, this.options.minDate, this.options.maxDate)) {
            html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.lang(this.options.language).format(OFFICIAL_DATETIME_FORMAT) + "\">" + displayDateTime.date() + "</a></td>";
          } else {
            html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
          }
        }
        html += "</tr>";
      }
      table.append("<tbody>" + html + "</tbody>");

      return table;
    },

    _slideCalendar: function (newtable, isLeft) {

      var containerClass = "coral-DatePicker-calendarSlidingContainer";
      this.$element.find(".coral-DatePicker-calendarSlidingContainer table").stop(true, true);
      this.$element.find(".coral-DatePicker-calendarSlidingContainer").remove();

      var oldtable = this.$element.find("table");
      var width = oldtable.width();
      var height = oldtable.height();

      var container = $("<div class=\"coral-DatePicker-calendarSlidingContainer\">");

      container.css({"display": "block",
        "position": "relative",
        "width": width + "px",
        "height": height + "px",
        "overflow": "hidden"});

      this.$element.find(".coral-DatePicker-calendarBody").append(container);
      container.append(oldtable).append(newtable);
      oldtable.css({"position": "absolute", "left": 0, "top": 0});
      oldtable.after(newtable);
      newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

      oldtable.animate({"left": (isLeft) ? -width : width}, TABLE_ANIMATION_SPEED, function () {
        oldtable.remove();
      });

      newtable.animate({"left": 0}, TABLE_ANIMATION_SPEED, function () {
        if (container.parents().length === 0) {
          // We already were detached!
          return;
        }
        newtable.css({"position": "relative", "left": 0, "top": 0});
        newtable.detach();
        this.$element.find(".coral-DatePicker-calendarBody").append(newtable);
        container.remove();
      }.bind(this));
    },

    _renderTime: function () {

      var selectedTime = this.options.selectedDateTime;
      var html = $(HTML_CLOCK_ICON);

      // Hours
      var hourSelect = $('<select class="coral-Select-select"></select>');
      for (var h = 0; h < 24; h++) {
        var hourOption = $('<option>' + padSingleDigit(h) + '</option>');
        if (selectedTime && h === selectedTime.hours()) {
          hourOption.attr('selected', 'selected');
        }
        hourSelect.append(hourOption);
      }
      var hourDropdown = $(HTML_HOUR_DROPDOWN).append(hourSelect);

      // Minutes
      var minuteSelect = $('<select class="coral-Select-select"></select>');
      for (var m = 0; m < 60; m++) {
        var minuteOption = $('<option>' + padSingleDigit(m) + '</option>');
        if (selectedTime && m === selectedTime.minutes()) {
          minuteOption.attr('selected', 'selected');
        }
        minuteSelect.append(minuteOption);
      }
      var minuteDropdown = $(HTML_MINUTE_DROPDOWN).append(minuteSelect);

      $(hourDropdown).css(STYLE_POSITION_RELATIVE);
      $(hourDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);
      $(minuteDropdown).css(STYLE_POSITION_RELATIVE);
      $(minuteDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);

      html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

      if (this.$element.find(".coral-DatePicker-timeControls").length === 0) {
        this.$element.find(".coral-Popover-content").append(html);
      } else {
        this.$element.find(".coral-DatePicker-timeControls").empty().append(html.children());
      }

      // Set up dropdowns
      $(hourDropdown).select();
      $(minuteDropdown).select();
    },

    _getHoursFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-hour .coral-Select-select').val(), 10);
    },

    _getMinutesFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-minute .coral-Select-select').val(), 10);
    }

  });

  /**
   * Static
   */

  function padSingleDigit(s) {
    if (s < 10) return "0" + s;
    return s;
  }

  function ifDefined(value, field, options) {
    if (value !== undefined) {
      options[field] = value;
    }
  }

  function asBoolean(value, field, options) {
    options[field] = value ? true : false;
  }

  function ifTruthy(value, field, options) {
    options[field] = value || options[field];
  }

  function asNumber(value, field, options) {
    if (value !== undefined) {
      options[field] = value * 1;
    }
  }

  function normalizeDate(date) {
    if (!date) return null;
    return moment([date.year(), date.month(), date.date()]);
  }

  function isDateInRange(date, startDate, endDate) {
    if (startDate === null && endDate === null) {
      return true;
    }
    if (startDate === null) {
      return date <= endDate;
    } else if (endDate === null) {
      return date >= startDate;
    } else {
      return (startDate <= date && date <= endDate);
    }
  }

  function isSameDay(d1, d2) {
    if (d1 && d2) {
      return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date();
    }
  }

  var
    IS_MOBILE_DEVICE = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i),
    OFFICIAL_DATE_FORMAT = 'YYYY-MM-DD',
    OFFICIAL_TIME_FORMAT = 'HH:mm',
    OFFICIAL_DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mmZ',
    DISPLAY_FORMAT = 'YYYY-MM-DD HH:mm',
    LANGUAGE_NAME_PREFIX = 'coralui_',

    HTML_CALENDAR = [
      '<div class="coral-DatePicker-calendar">',
      '<div class="coral-DatePicker-calendarHeader"></div>',
      '<div class="coral-DatePicker-calendarBody"></div>',
      '</div>'
    ].join(''),
    HTML_POPOVER = [
      '<div class="coral-Popover" style="display:none" id="%ID%">',
      '<div class="coral-Popover-content"></div>',
      '</div>'
    ].join(''),

    HTML_CLOCK_ICON = '<div class="coral-DatePicker-timeControls"><i class="coral-Icon coral-Icon--clock coral-Icon--small"></i></div>',
    HTML_HOUR_DROPDOWN = '<div class="coral-Select coral-DatePicker-hour"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',
    HTML_MINUTE_DROPDOWN = '<div class="coral-Select coral-DatePicker-minute"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',

    STYLE_POSITION_RELATIVE = {
      'position': 'relative'
    },
    STYLE_DROPDOWN_SELECT = {
      'position': 'absolute',
      'left': '1.5rem',
      'top': '1rem'
    },

    TABLE_ANIMATION_SPEED = 400;

}(window.jQuery));

/*
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function (window, $, undefined) {

    // ========================= smartresize ===============================

    /*
     * smartresize: debounced resize event for jQuery
     *
     * latest version and complete README available on Github:
     * https://github.com/louisremi/jquery.smartresize.js
     *
     * Copyright 2011 @louis_remi
     * Licensed under the MIT license.
     */

    var $event = $.event,
            resizeTimeout;

    $event.special.smartresize = {
        setup:function () {
            $(this).bind("resize", $event.special.smartresize.handler);
        },
        teardown:function () {
            $(this).unbind("resize", $event.special.smartresize.handler);
        },
        handler:function (event, execAsap) {
            // Save the context
            var context = this,
                    args = arguments;

            // set correct event type
            event.type = "smartresize";

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(function () {
                $event.dispatch.apply(context, args);
            }, execAsap === "execAsap" ? 0 : 10);
        }
    };

    $.fn.smartresize = function (fn) {
        return fn ? this.bind("smartresize", fn) : this.trigger("smartresize", ["execAsap"]);
    };

    // constructor
    $.CUIGridLayout = function (options, element, callback) {
        this.element = $(element);
        this._create(options);
        this._init(callback);
    };

    var $window = $(window);

    $.CUIGridLayout.settings = {
        colWidth: 240,
        gutterX: 15,
        gutterY: 15,
        marginLeft:0,
        marginRight:0,
        selector:"article"
//        itemClass:"macboard-card"
    };

    // TODO layout only takes image sizes into account; may fail when cards have differing "legends"

    $.CUIGridLayout.prototype = {

        option:function(options) {
            this.options = $.extend({}, $.CUIGridLayout.settings, options);
        },

        // sets up widget
        _create:function (options) {

            this.options = $.extend({}, $.CUIGridLayout.settings, options);

            this.items = [];

            this.itemsByPath = {};

            this.numCols = -1;

            this.pendingImages = 0;

            this.update();


            // bind resize method
            var self = this;
            $window.bind('smartresize.cui.gridlayout', function () {
                self.updateDimensions();
                self.layout();
            });

        },

        _init:function (callback) {
            this.updateDimensions();
            this.layout(callback);

            // Give browser a chance to lay out elements and calculate layout a second time after
            // all CSS is applied correctly by the browser. Without this second, timed calculation is sometimes wrong due
            // to race conditions with the rendering engine of the browser.
            setTimeout(function() {
                this.numCols = -1;
                this.updateDimensions();
                this.layout(callback);

                this.element.trigger($.Event("cui-gridlayout-initialized", {
                    "widget": this
                }));
            }.bind(this), 1);
        },

        update:function () {
            var items = [],
                itemsByPath = {};

            this.element.find(this.options.selector).each(function (i) {
                var $card = $(this);
                var $img = $("img", $card);
                if ($img.length === 0) {
                    $img = null;
                }
                var item = {
                    path: $card.data().path,
                    i:i,
                    $el:$card,
                    $img:$img
                };
                items.push(item);
                itemsByPath[item.path] = item;
            });

            this.items = items.sort(function (i1, i2) {
                var i1key = i1.$el.data("gridlayout-sortkey") || 0,
                    i2key = i2.$el.data("gridlayout-sortkey") || 0;

                return i2key - i1key || i1.i - i2.i;
            });
            this.itemsByPath = itemsByPath;
        },

        _imageLoaded: function() {

            if (--this.pendingImages === 0) {
//                console.log("all images loaded");
                // force relayout
                this.numCols = -1;
                this.layout();
            }

        },
        updateDimensions: function() {
            var self = this;
            this.items.every(function (i) {
                var $el = i.$el;

                i.w = $el.width();
                i.h = $el.height();

                // check if card has an image and if it's loaded
                if (i.$img) {
                    // Hack: Recalculate element size if browser has wrong values. This sometimes occurs with loaded
                    // images when the elements are not yet displayed on screen.
                    if (i.$img.width() > i.w) {
                        i.h = (i.h - i.$img.height()) + (i.$img.height() / i.$img.width() * i.w);
                    }

                    if (i.$img.height() === 0) {
                        // just assume 1:1 for now
                        i.h += i.w;
                        self.pendingImages++;
                        i.$img.on("load.cui.gridlayout", function() {
                            i.$img = null;
                            i.w = $el.width(); // Set width AND height to ensure proper ratio
                            i.h = $el.height();

//                            console.log("image loaded.", i);
                            self._imageLoaded();
                        });
                    } else {
                        // we don't need to know this info anymore
                        i.$img = null;
                    }
                }

                // debug
//                $("h4", i.$el).html("Card Nr " + i.i + " (" + i.w + "x" + i.h + ")");

                return true;
            });

        },

        layout:function () {
            var self = this;
            var $this = this.element;
            var colWidth = this.options.colWidth;
            var marginLeft = this.options.marginLeft;
            var marginRight = this.options.marginRight;
            var gx = this.options.gutterX;
            if ($this.width() === 0) {
          //need not to layout the div whose width is 0
                return;
            }
            // calculate # columns:
            // containerWidth = marginLeft + (colWidth + gx) * n - gx + marginRight;
            // use: "round" for avg width, "floor" for minimal width, "ceil" for maximal width
            var n = Math.floor(($this.width() - marginLeft - marginRight + gx) / (colWidth + gx));

            if (n < 1) n = 1; // Minimum 1 column!

            if (n == this.numCols) {
                // nothing to do. CSS takes care of the scaling
                return;
            }

            this.numCols = n;

            // calculate actual column width:
            // containerWidth = marginLeft + (cw + gx) * n - gx + marginRight;
            var cw =  (($this.width() - marginLeft - marginRight + gx) / n) - gx;

            // initialize columns
            var cols = [];
            var colHeights = [];
            while (cols.length < n) {
                cols.push([]);
                colHeights.push(0);
            }

            this.items.every(function (i) {
                // determine height of card, based on the ratio
                var height = (i.h / i.w) * cw;

                // find lowest column
                var min = colHeights[0];
                var best = 0;
                for (var c = 0; c < colHeights.length; c++) {
                    var h = colHeights[c];
                    if (h < min) {
                        min = h;
                        best = c;
                    }
                }

                // update columns and heights array
                cols[best].push(i);
                colHeights[best] += height + self.options.gutterY;
                return true;
            });

            // detach all the cards first
            $this.detach(this.options.selector);

            // remember old columns. because otherwise the
            // event handlers bound on the cards would be removed
            var $cols = $this.contents();

            // now fill up all the columns
            for (var c=0; c<cols.length; c++) {
                var $col = $('<div class="grid-'+n+'"></div>').appendTo($this);
                for (var j=0; j<cols[c].length; j++) {
                    $col.append(cols[c][j].$el);
                }
            }

            // remove old columns
            $cols.remove();

            $(document).trigger("cui-gridlayout-layout");
        },

        destroy: function() {
            $window.unbind("smartresize.cui.gridlayout");
            this.element.removeData("cuigridlayout");
        }
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // plugin bridge
    $.fn.cuigridlayout = function (options, callback) {
        if (typeof options === 'string') {
            // call method
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (!instance) {
                    logError("cannot call methods on cuigridlayout prior to initialization; " +
                            "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cuigridlayout instance");
                    return;
                }
                // apply method
                instance[ options ].apply(instance, args);
            });
        } else {
            this.each(function () {
                var instance = $.data(this, 'cuigridlayout');
                if (instance) {
                    // apply options & init
                    instance.option(options);
                    instance._init(callback);
                } else {
                    // initialize new instance
                    $.data(this, 'cuigridlayout', new $.CUIGridLayout(options, this, callback));
                }
            });
        }
        // return jQuery object
        // so plugin methods do not have to
        return this;
    };
})(window, jQuery);


(function($, window, undefined) {

  var defaults = {
    "threshold": 200, // How often the resize and reflow events should be considered
    "applyClassToElement": undefined
  };

  // Utility functions to help calculating sizes
  var size = {
    "rem": function () {
      // This caches the rem value to calculate it only once, but might lead to wrong results if the font size gets changed
      if (size._rem === undefined) {
        size._rem = parseInt($("body").css("font-size"));
      }
      return size._rem;
    },
    "em": function (elem) {
      return parseFloat(elem.css("font-size"));
    }
  };

  // Adds and removes classes to the given element depending on the result of the associated functions.
  // Can be called with or without parameters:
  // When a breakpoints object is provided, the reflow listener gets setup to the given element.
  // The options parameter is optional, it allows to change the default settings.
  // When no parameters are provided it triggers a reflow event on the provided object.
  $.fn.reflow = function reflow(breakpoints, options) {
    return this.each(function reflowEach() {
      var elem = $(this),
        didApplyClassNames = false,
        scheduledReflowCheck = false,
        settings;

      if (breakpoints) {
        settings = $.extend({}, defaults, options);
        settings.applyClassToElement = settings.applyClassToElement || elem;

        function reflowEventHandler() {
          if (elem.is(":visible")) {
            if (!scheduledReflowCheck) {
              applyClassNames();
              scheduledReflowCheck = setTimeout(function reflowCheck() {
                scheduledReflowCheck = false;
                if (!didApplyClassNames && elem.is(":visible")) {
                  applyClassNames();
                }
              }, settings.threshold);
            } else {
              didApplyClassNames = false;
            }
          }
        }

        function applyClassNames() {
          didApplyClassNames = true;
          for (var className in breakpoints) {
            settings.applyClassToElement.toggleClass(className, breakpoints[className](elem, size));
          }
        }

        elem.on("reflow", reflowEventHandler);
        $(window).on("resize.reflow", reflowEventHandler);
      }

      elem.trigger("reflow");

    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  var storageKey = 'cui-state',
    storageLoadEvent = 'cui-state-restore',
    store = {},
    loaded = false,
    $doc = $(document);

  /**
   * state object to enable UI page refresh stable states
   * TODO:
   *  - all states are global, lack of an auto restore mode which is aware of the URL
   *  - client side only (localStorage)
   *  - lack of an abstraction layer for the client side storage
   * @type {Object}
   */
  CUI.util.state = {

    /*saveForm: function (form, elem) {

     },*/

    config: {
      serverpersistence: true
    },

    /**
     * Persist attributes of a DOM node
     *
     * @param {String} selector
     * @param {String|Array} [attribute] single attribute or list of attributes to be saved. If null then all attributes will be saved
     * @param {Boolean} [autorestore]
     * @param {String} [customEvent] custom event name
     */
    save: function (selector, attribute, autorestore, customEvent) {
      var elem = $(selector),
        saveLoop = function (i, attr) {
          store.global[selector] = store.global[selector] || {};
          store.global[selector][attr] = store.global[selector][attr] || {};
          store.global[selector][attr].val = elem.attr(attr);
          store.global[selector][attr].autorestore = autorestore || false;
          store.global[selector][attr].customEvent = customEvent || null;
        };


      if (attribute) { // save single or multiple attributes
        if ($.isArray(attribute)) { // multiple values to save
          $.each(attribute, saveLoop);
        } else { // save all attributes
          saveLoop(0, attribute);
        }
      } else { // save all attributes
        // TODO
        // not supported yet because the browser implementation of Node.attributes is a mess
        // https://developer.mozilla.org/en-US/docs/DOM/Node.attributes
      }

      localStorage.setItem(storageKey, JSON.stringify(store));

      if (CUI.util.state.config.serverpersistence) {
        $.cookie(storageKey, JSON.stringify(store), {
          expires: 7,
          path: '/'
        });
      }
    },

    /**
     *
     * @param {String} [selector]
     * @param {Function} [filter] filter function for the attributes of the given selector
     */
    restore: function (selector, filter) {
      var check = filter || function () {
          return true;
        },
        sel,
        elem,
        selectorLoop = function (item, noop) {
          sel = item;
          elem = $(sel);

          if (store.global[sel]) {
            $.each(store.global[sel], restoreLoop);
          }
        },
        restoreLoop = function (attr, obj) {
          if (check(sel, attr, obj)) {
            elem.attr(attr, obj.val);

            if (obj.customEvent) {
              $doc.trigger(obj.customEvent, [elem, obj]);
            }

            $doc.trigger(storageLoadEvent, [elem, obj]);
          }
        };

      if (!loaded) {
        loaded = CUI.util.state.load();
      }


      if (selector) { // restore single selector
        selectorLoop(selector);
      } else { // restore everything
        $.each(store.global, selectorLoop);
      }
    },

    load: function () {
      var val = localStorage.getItem(storageKey);

      store = val ? JSON.parse(val) : {
        global: {}
      };

      return true;
    },

    // support for "temporary" storage that will be automatically cleared if
    // the browser session ends; currently uses a set/get pattern rather than
    // loading the entire thing on document ready. Also note that the data is currently
    // not sent to the server.

    setSessionItem: function(name, value, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      sessionStorage.setItem(key, JSON.stringify(value));
    },

    getSessionItem: function(name, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      var value = sessionStorage.getItem(key);
      if (value) {
        value = JSON.parse(value);
      }
      return value;
    },

    removeSessionItem: function(name, ns) {
      var key = name;
      if (ns) {
        key = name + ":" + ns;
      }
      sessionStorage.removeItem(key);
    },

    clearSessionItems: function(ns) {
      if (ns) {
        ns = ":" + ns;
        var keyCnt = sessionStorage.length;
        var toRemove = [ ];
        for (var k = 0; k < keyCnt; k++) {
          var keyToCheck = sessionStorage.key(k);
          var keyLen = keyToCheck.length;
          if (keyLen > ns.length) {
            if (keyToCheck.substring(keyLen - ns.length) === ns) {
              toRemove.push(keyToCheck);
            }
          }
        }
        var removeCnt = toRemove.length;
        for (var r = 0; r < removeCnt; r++) {
          sessionStorage.removeItem(toRemove[r]);
        }
      }
    }

  };

  $doc.ready(function () {
    CUI.util.state.restore(null, function (selector, attr, val) {
      if (val.autorestore) {
        return true;
      }

      return false;
    });
  });
}(jQuery, this));

/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

(function ($) {

  var DISPLAY_GRID = "grid";

  var DISPLAY_LIST = "list";

  var SELECTION_MODE_COUNT_SINGLE = "single";

  var SELECTION_MODE_COUNT_MULTI = "multiple";

  var DEFAULT_SELECTOR_CONFIG = {

    "itemSelector": "article",                      // selector for getting items
    "headerSelector": "header",                     // selector for headers
    "dataContainer": "grid-0",                      // class name of the data container
    "enableImageMultiply": true,                    // flag if images should be multiplied
    "view": {
      "selectedItem": {                           // defines what classes (cls) on what elements (selector; optional) are used to mark a selection
        "list": {
          "cls": "selected"
        },
        "grid": {
          "cls": "selected"
        }
      },
      "selectedItems": {                          // defines the selector that is used for determining the current selection; a resolver function may be specified that adjusts the selection (for exmaple by determining a suitable parent element)
        "list": {
          "selector": "article.selected"
        },
        "grid": {
          "selector": "article.selected"
        }
      }
    },
    "controller": {
      "selectElement": {                          // defines the selector that is used for installing the tap/click handlers
        "list": "article > i.select",
        /* "listNavElement": "article", */      // may be used to determine the element that is responsible for navigating in list view (required only if different from the Grid's select item)
        "grid": "article"
      },
      "moveHandleElement": {                      // defines the selector that is used to determine the object that is responsible for moving an item in list view
        "list": "article > i.move"
      },
      "targetToItem": {                           // defines methods that are used to resolve the event target of a tap/click event to a card view item
        "list": function ($target) {
          return $target.closest("article");
        },
        "grid": function ($target) {
          return $target.closest("article");
        },
        "header": function ($target) {
          return $target.closest("header");
        }
      },
      "gridSelect": {                             // defines the class that is used to trigger the grid selection mode
        "cls": "selection-mode"
      },
      "selectAll": {                              // defines the "select all" config (list view only)
        "selector": "header > i.select",
        "cls": "selected"
      },
      "sort": {                                   // defines the config for column sort
        "columnSelector": ".label > *"
      }
    }

  };

  var ensureItem = function (item) {
    if (item.jquery) {
      return item.data("cardView-item");
    }
    return item;
  };

  /**
   * @classdesc
   * Internal class that provides utility functionality to the card view.
   */
  var Utils = {

    /**
     * Check two jQuery objects for equality.
     * @param {jQuery} $1 first jQuery object
     * @param {jQuery} $2 second jQuery object
     * @return {boolean} True if both objects are considered equal
     */
    equals: function ($1, $2) {
      return ($1.length === $2.length) && ($1.length === $1.filter($2).length);
    },

    /**
     * Gets a CardView widget for the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView} The widget
     */
    getWidget: function ($el) {
      var widget;
      if ($el.length > 0) {
        widget = $($el[0]).data("cardView");
      }
      return widget;
    },

    /**
     * Mixes two objects so that for every missing property in object1 the properties of object2 are used. This is also done
     * for nested objects.
     * @param {object} Object 1
     * @param {object} Object 2
     * @return {object} The mixed object with all properties
     */
    mixObjects: function (object1, object2) {
      if (object1 === undefined) return object2;

      var result = {};
      for (var i in object2) {
        if (object1[i] === undefined) {
          result[i] = object2[i];
          continue;
        }
        var p = object1[i];

        // Go one step deeper in the object hierarchy if we find an object that is not a string.
        // Note: typeof returns "function" for functions, so no special testing for functions needed.
        if (typeof(object1[i]) == "object" && (!(object1[i] instanceof String))) {
          p = this.mixObjects(object1[i], object2[i]);
        }
        result[i] = p;
      }
      return result;
    },

    /**
     * Resolves each of the DOM elements in the specified jQuery object with a given
     * function into a new jQuery object.
     * @param {jQuery} $el The jQuery object to resolve
     * @param {Function} fn The resolver function
     * @return {jQuery} The resolved jQuery object
     */
    resolve: function ($el, fn) {
      var resolved = [ ];
      $el.each(function () {
        resolved.push.apply(resolved, fn($(this)).toArray());
      });
      return $(resolved);
    },

    /**
     * Multiplies the image with the provided color. This will insert a canvas element
     * before the img element.
     * @param {HTMLElement} $images image element to multiply with the color
     * @param {Number[]} color RGB array of values between 0 and 1
     */
    multiplyImages: function ($images, color) {
      // Filter out images where the multiply effect has already been inserted to the DOM, or images that aren't visible
      $images = $images.filter(function () {
        var $image = $(this);
        return !$image.is(".multiplied") && !$image.prev().is(".multiplied") && $image.is(":visible");
      });

      var imageMaxCounter = $images.length;
      var imageIteratorCounter = 0;

      function multiplyNextImage() {
        if (imageIteratorCounter < imageMaxCounter) {
          // Not adding the timeout for the first image will make it feel more reactive.
          multiplyOneImage($images[imageIteratorCounter]);

          imageIteratorCounter++;

          // But adding a timeout for the other images will make it non-blocking.
          setTimeout(multiplyNextImage, 0);
        }
      }

      function multiplyOneImage(image) {
        var width = image.naturalWidth,
          height = image.naturalHeight;

        // defer if image is not yet available
        if ((width === 0) && (height === 0)) {
          window.setTimeout(function () {
            multiplyOneImage(image);
          }, 200);
          return;
        }

        try {
          var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>")[0];

          var context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, width, height);

          var imageData = context.getImageData(0, 0, width, height);
          var data = imageData.data;

          for (var i = 0, l = data.length; i < l; i += 4) {
            data[i] *= color[0];
            data[i + 1] *= color[1];
            data[i + 2] *= color[2];
          }

          context.putImageData(imageData, 0, 0);

          // re-sizing of canvases are handled different in IE and Opera, thus we have to use an image
          $("<img class='" + image.className + " multiplied' " +
            "width='" + image.width + "' " +
            "src='" + canvas.toDataURL("image/png") + "'/>").insertBefore(image);

        } catch(err) {
          // CUI-2187: we have to catch the error produced by getImageDate, such that
          // it does not break the selection. When the error was produced, the navigation
          // was performed instead of selecting the card.
        }
      }

      multiplyNextImage();
    }
  };

  var ListItemAutoScroller = new Class(/** @lends CUI.CardView.ListItemAutoScroller# */{

    /**
     * The item element
     * @type jQuery
     * @private
     */
    $el: null,

    /**
     * The scrolling container element (with overflow auto/visible and position
     * absolute)
     * @type jQuery
     * @private
     */
    $containerEl: null,

    /**
     * Size of a scrolling step (= number of pixels that get scrolled per autoscrolling
     * 'tick'
     * @type Number
     * @private
     */
    stepSize: 0,

    /**
     * Timeout ID
     * @type Number
     * @private
     */
    iid: undefined,

    /**
     * @private
     */
    autoMoveOffset: 0,

    /**
     * The maximum value that is allowed for scrollTop while autoscrolling
     * @type Number
     * @private
     */
    maxScrollTop: 0,


    /**
     * @ignore
     * @name CUI.CardView.ListItemAutoScroller
     * @classdesc
     * Internal class that implements auto scrolling while moving cards in list view.
     *
     * @desc
     * Creates a new auto scroller.
     *
     * @constructs
     *
     * @param {jQuery} $el The jQuery container element of the card item that is moved
     * @param {Number} stepSize The step size (number of pixels scrolled per 'tick')
     * @param {Function} autoMoveFn Function that gets executed on every auto scroll
     *        "event". The function must actually reposition the item element to
     *        the coordinate specified as parameters (first parameter: x; second
     *        parameter: y
     */
    construct: function ($el, stepSize, autoMoveFn) {
      this.$el = $el;
      this.stepSize = stepSize;
      this.$containerEl = this._getScrollingContainer($el);
      var cont = this.$containerEl[0];
      this.maxScrollTop = Math.max(cont.scrollHeight - cont.clientHeight, 0);
      this.autoMoveFn = autoMoveFn;
    },

    /**
     * Gets a suitable container element that limits the scrolling area.
     * @param {jQuery} $el The card item's container element
     * @return {jQuery} The container element
     * @private
     */
    _getScrollingContainer: function ($el) {
      while (($el.length > 0) && !$el.is("body")) {
        var ovflY = $el.css("overflowY");
        var pos = $el.css("position");
        if (((ovflY === "auto") || (ovflY === "visible")) && (pos === "absolute")) {
          return $el;
        }
        $el = $el.parent();
      }
      return $(window);
    },

    /**
     * Checks if scrolling is necessary according to the item element's current position
     * and the scroll container's state and executes a single scrolling step by
     * adjusting the scroll container's scrollTop property if necessary.
     * @return {Boolean} True if scrolling occured; false if no scrolling was necessary
     * @private
     */
    _execute: function () {
      var cont = this.$containerEl[0];
      var clientHeight = cont.clientHeight;
      var scrollTop = cont.scrollTop;
      var itemTop = this.$el.offset().top - this.$containerEl.offset().top;
      var itemBottom = itemTop + this.$el.height();
      var isAutoScroll = false;
      if (itemTop <= 0) {
        // auto scroll upwards
        if (scrollTop > 0) {
          scrollTop -= this.stepSize;
          this.autoMoveOffset = -this.stepSize;
          if (scrollTop < 0) {
            scrollTop = 0;
          }
          cont.scrollTop = scrollTop;
          isAutoScroll = true;
        }
      } else if (itemBottom >= clientHeight) {
        // auto scroll downwards
        if (scrollTop < this.maxScrollTop) {
          scrollTop += this.stepSize;
          this.autoMoveOffset = this.stepSize;
          if (scrollTop > this.maxScrollTop) {
            scrollTop = this.maxScrollTop;
          }
          cont.scrollTop = scrollTop;
          isAutoScroll = true;
        }
      }
      return isAutoScroll;
    },

    /**
     * Moves the card item's element by calculating its new position and calling
     * the function that was provided in the constructor as autoMoveFn.
     * @private
     */
    _autoMove: function () {
      if (this.autoMoveOffset && this.autoMoveFn) {
        var itemOffs = this.$el.offset();
        var itemTop = itemOffs.top + this.autoMoveOffset;
        this.autoMoveFn(itemOffs.left, itemTop);
      }
    },

    /**
     * Checks if autoscrolling is currently necessary; if so, the autoscrolling is
     * executed and a timer is started that will check again later if additional
     * auto scrolling is necessary (and execute again if so).
     */
    check: function () {
      var self = this;
      this.stop();
      var isAutoScroll = this._execute();
      if (isAutoScroll) {
        this.iid = window.setTimeout(function () {
          self.iid = undefined;
          self._autoMove();
        }, 50);
      }
    },

    /**
     * Stops autoscrolling.
     */
    stop: function () {
      if (this.iid !== undefined) {
        window.clearTimeout(this.iid);
        this.autoMoveOffset = 0;
        this.iid = undefined;
      }
    }

  });

  var ListItemMoveHandler = new Class(/** @lends CUI.CardView.ListItemMoveHandler# */{

    /**
     * The list's jQuery element
     * @type {jQuery}
     * @private
     */
    $listEl: null,

    /**
     * The moved item's jQuery element
     * @type {jQuery}
     * @private
     */
    $itemEl: null,

    /**
     * A jQuery element that contains all items of the list
     * @type {jQuery}
     * @private
     */
    $items: null,

    /**
     * The document
     * @type {jQuery}
     * @private
     */
    $doc: null,

    /**
     * The jQuery object that represents the card that is right before the moved card
     * just before the move; undefined, if the moved card is the first card of the list
     * @type {jQuery}
     * @private
     */
    $oldBefore: null,

    /**
     * The CSS class that is added to the item while it is moved
     * @type String
     * @private
     */
    dragCls: null,

    /**
     * Flag that determines if the horizontal position of an item should be fixed
     * while it is moved
     * @type {Boolean}
     * @private
     */
    fixHorizontalPosition: false,

    /**
     * The autoscroller module
     * @type {ListItemAutoScroller}
     * @private
     */
    autoScroller: null,

    /**
     * @ignore
     * @name CUI.CardView.ListItemMoveHandler
     *
     * @classdesc
     * Internal class that implements the reordering of cards in list view.
     *
     * @constructor
     * @desc
     * Creates a new handler for moving a item around in a list by drag &amp; drop (or
     * its touch counterpart).
     */
    construct: function (config) {
      var self = this;
      this.$listEl = config.$listEl;
      this.$itemEl = config.$itemEl;
      this.$items = config.$items;
      this.dragCls = config.dragCls;
      this.fixHorizontalPosition = (config.fixHorizontalPosition !== false);
      this.autoScroller = (config.autoScrolling ?
        new ListItemAutoScroller(this.$itemEl, 8, function (x, y) {
          self._autoMove(x, y);
        }) : undefined);
    },

    /**
     * Gets the page coordinates of the specified event, regardless if it is a mouse
     * or a touch event.
     * @param {Object} e The event
     * @return {{x: (Number), y: (Number)}} The page coordinates
     * @private
     */
    _getEventCoords: function (e) {
      if (!e.originalEvent.touches) {
        return {
          x: e.pageX,
          y: e.pageY
        };
      }
      return (e.originalEvent.touches.length > 0 ? {
        x: e.originalEvent.touches[0].pageX,
        y: e.originalEvent.touches[0].pageY
      } : e.originalEvent.changedTouches.length > 0 ? {
        x: e.originalEvent.changedTouches[0].pageX,
        y: e.originalEvent.changedTouches[0].pageY
      } : {
        x: e.pageX,
        y: e.pageY
      });
    },

    /**
     * Limits the specified coordinates to the list's real estate.
     * @param {Number} top vertical coordinate to limit
     * @param {Number} left horizontal coordinate to limit
     * @return {{top: *, left: *}}
     * @private
     */
    _limit: function (top, left) {
      if (left < this.listOffset.left) {
        left = this.listOffset.left;
      }
      if (top < this.listOffset.top) {
        top = this.listOffset.top;
      }
      var right = left + this.size.width;
      var bottom = top + this.size.height;
      var limitRight = this.listOffset.left + this.listSize.width;
      var limitBottom = this.listOffset - top + this.listSize.height;
      if (right > limitRight) {
        left = limitRight - this.size.width;
      }
      if (bottom > limitBottom) {
        top = limitBottom - this.size.height;
      }
      if (this.fixHorizontalPosition) {
        left = this.listOffset.left;
      }
      return {
        "top": top,
        "left": left
      };
    },

    /**
     * Gets the coordinates of the specified event in a device (mouse, touch) agnostic
     * way.
     * @param {Object} e The event
     * @return {{x: Number, y: Number}} The coordinates
     * @private
     */
    _getEventPos: function (e) {
      var evtPos = this._getEventCoords(e);
      return {
        x: evtPos.x - this.delta.left,
        y: evtPos.y - this.delta.top
      };
    },

    /**
     * Adjust the position of the moved item by limiting it to the containing list
     * and executing autoscrolling.
     * @param {Number} x The original x coordinate
     * @param {Number} y The original y coordinate
     * @private
     */
    _adjustPosition: function (x, y) {
      this.$itemEl.offset(this._limit(y, x));
      if (this.autoScroller) {
        this.autoScroller.check();
      }
    },

    /**
     * Changes the order of the items in the list if necessary.
     * @private
     */
    _changeOrderIfRequired: function () {
      var itemPos = this.$itemEl.offset();
      var hotX = itemPos.left + (this.size.width / 2);
      var hotY = itemPos.top + (this.size.height / 2);
      var $newTarget = null;
      // check if we are overlapping another item at least 50% -> then we will take
      // its position
      var isInsertBefore = false;
      for (var i = 0; i < this.$items.length; i++) {
        var $item = $(this.$items[i]);
        if (!Utils.equals($item, this.$itemEl)) {
          var offs = $item.offset();
          var width = $item.width();
          var height = $item.height();
          var bottom = offs.top + height;
          if ((hotX >= offs.left) && (hotX < offs.left + width) &&
            (hotY >= offs.top) && (hotY < bottom)) {
            isInsertBefore = ((hotY - offs.top) > (bottom - hotY));
            $newTarget = $item;
            break;
          }
        }
      }
      if ($newTarget) {
        var _offs = this.$itemEl.offset();
        if (isInsertBefore) {
          $newTarget.before(this.$itemEl);
        } else {
          $newTarget.after(this.$itemEl);
        }
        this.$itemEl.offset(_offs);
      }
    },

    /**
     * Callback for auto move (called by auto scroller implementation)
     * @param x {Number} The horizontal position
     * @param y {Number} The vertical position
     * @private
     */
    _autoMove: function (x, y) {
      this._adjustPosition(x, y);
      this._changeOrderIfRequired();
    },

    /**
     * Starts moving the list item.
     * @param {Object} e The event that starts the move
     */
    start: function (e) {
      this.$oldPrev = this.$itemEl.prev();
      this.$oldNext = this.$itemEl.next();

      var evtPos = this._getEventCoords(e);
      if (this.dragCls) {
        this.$itemEl.addClass(this.dragCls);
      }
      var self = this;
      this.$doc = $(document);
      this.$doc.on("touchmove.listview.drag mousemove.listview.drag",
        function (e) {
          self.move(e);
        });
      this.$doc.on("touchend.listview.drag mouseup.listview.drag",
        function (e) {
          self.end(e);
        });
      this.offset = this.$itemEl.offset();
      this.delta = {
        "left": evtPos.x - this.offset.left,
        "top": evtPos.y - this.offset.top
      };
      this.size = {
        "width": this.$itemEl.width(),
        "height": this.$itemEl.height()
      };
      this.listOffset = this.$listEl.offset();
      this.listSize = {
        "width": this.$listEl.width(),
        "height": this.$listEl.height()
      };
      e.stopPropagation();
      e.preventDefault();
      /*
       console.log("offset", this.offset, "delta", this.delta, "size", this.size,
       "listoffs", this.listOffset, "listsize", this.listSize);
       */
    },

    /**
     * Moves the card item.
     * @param {Object} e The event that is responsible for the move
     */
    move: function (e) {
      // console.log("move", e);
      var pos = this._getEventPos(e);
      this._adjustPosition(pos.x, pos.y);
      this._changeOrderIfRequired();
      e.stopPropagation();
      e.preventDefault();
    },

    /**
     * Finishes moving the card item.
     * @param {Object} e The event that is responsible for finishing the move
     */
    end: function (e) {
      var pos = this._getEventPos(e);
      this._adjustPosition(pos.x, pos.y);
      // console.log("end", e);
      if (this.dragCls) {
        this.$itemEl.removeClass(this.dragCls);
      }
      if (this.autoScroller) {
        this.autoScroller.stop();
      }
      this.$itemEl.css("position", "");
      this.$itemEl.css("top", "");
      this.$itemEl.css("left", "");
      this.$doc.off("touchmove.listview.drag");
      this.$doc.off("mousemove.listview.drag");
      this.$doc.off("touchend.listview.drag");
      this.$doc.off("mouseup.listview.drag");
      var $newPrev = this.$itemEl.prev();
      var $newNext = this.$itemEl.next();

      this.$itemEl.trigger($.Event("item-moved", {
        newPrev: $newPrev,
        newNext: $newNext,
        oldPrev: this.$oldPrev,
        oldNext: this.$oldNext,
        hasMoved: !Utils.equals($newPrev, this.$oldPrev)
      }));
      e.stopPropagation();
      e.preventDefault();
    }

  });

  /*
   * This class represents a single item in the list model.
   */
  var Item = new Class(/** @lends CUI.CardView.Item# */{

    /**
     * The jQuery object that represents the card
     * @type {jQuery}
     * @private
     */
    $itemEl: null,

    /**
     * @ignore
     * @name CUI.CardView.Item
     *
     * @classdesc
     * Internal class that represents a single card/list item in a card view's data
     * model.
     *
     * @constructor
     * @desc
     * Create a new card/list item.
     */
    construct: function ($itemEl) {
      this.$itemEl = $itemEl;
      this.reference();
    },

    /**
     * Get the card/list item's jQuery object.
     * @return {jQuery} The jQuery object
     */
    getItemEl: function () {
      return this.$itemEl;
    },

    /**
     * References the item's data model in the jQzery object.
     */
    reference: function () {
      this.$itemEl.data("cardView-item", this);
    }

  });

  var Header = new Class(/** @lends CUI.CardView.Header# */{

    /**
     * The jQuery object that represents the header
     * @type {jQuery}
     * @private
     */
    $headerEl: null,

    /**
     * The first item that follows the header
     * @type {CUI.CardView.Item}
     */
    itemRef: null,

    /**
     * @ignore
     * @name CUI.CardView.Header
     *
     * @classdesc
     * This class represents a list header (that is shown in list view only) in the
     * card view's data model.
     *
     * @constructor
     * @desc
     * Create a new list header.
     */
    construct: function ($headerEl, itemRef) {
      this.$headerEl = $headerEl;
      this.itemRef = itemRef;
    },

    /**
     * Get the jQuery object that is assosciated with the list header.
     * @return {jQuery} The associated jQuery object
     */
    getHeaderEl: function () {
      return this.$headerEl;
    },

    /**
     * Get the list item that follows the header directly.
     * @return {CUI.CardView.Item} The item
     */
    getItemRef: function () {
      return this.itemRef;
    },

    /**
     * Set the list item that follows the header directly.
     * @param {CUI.CardView.Item} itemRef The item
     */
    setItemRef: function (itemRef) {
      this.itemRef = itemRef;
    }

  });

  /**
   Handles resort according to columns
   */
  var ColumnSortHandler = new Class(/** @lends CUI.CardView.ColumnSortHandler# */{
    construct: function (options) {
      this.model = options.model;
      this.comparators = options.comparators;
      this.selectors = options.selectors;
      this.columnElement = options.columnElement;

      this.headerElement = options.columnElement.closest(this.selectors.headerSelector);
      var header = this.model.getHeaderForEl(this.headerElement);
      this.items = this.model.getItemsForHeader(header);

      this.isReverse = this.columnElement.hasClass("sort-asc"); // switch to reverse?
      this.toNatural = this.columnElement.hasClass("sort-desc"); // back to natural order?
      this.fromNatural = !this.headerElement.hasClass("sort-mode");

      this.comparator = null;

      // Choose the right comparator
      if (this.comparators) {
        for (var selector in this.comparators) {
          if (!this.columnElement.is(selector)) continue;
          this.comparator = this.comparators[selector];
        }
      }

      if (!this.comparator) this.comparator = this._readComparatorFromMarkup();
    },
    _readComparatorFromMarkup: function () {
      var selector = this.columnElement.data("sort-selector");
      var attribute = this.columnElement.data("sort-attribute");
      var sortType = this.columnElement.data("sort-type");
      var ignoreCase = this.columnElement.data("ignorecase");
      if (!selector && !attribute) return null;
      return new CUI.CardView.DefaultComparator(selector, attribute, sortType, ignoreCase);

    },
    _adjustMarkup: function () {
      // Adjust general mode class
      if (this.fromNatural) this.headerElement.addClass("sort-mode");
      if (this.toNatural) this.headerElement.removeClass("sort-mode");

      // Adjust column classes
      this.headerElement.find(this.selectors.controller.sort.columnSelector).removeClass("sort-asc sort-desc");
      this.columnElement.removeClass("sort-desc sort-asc");
      if (!this.toNatural) this.columnElement.addClass(this.isReverse ? "sort-desc" : "sort-asc");

      // Show or hide d&d elements
      var showMoveHandle = this.toNatural;
      $.each(this.items, function () {
        this.getItemEl().find(".move").toggle(showMoveHandle);
      });
    },
    sort: function () {
      if (!this.comparator && !this.toNatural) return;

      this._adjustMarkup();

      // Re-Sort items
      var items = this.items.slice(); // Make a copy before sorting
      // By default items are in their "natural" order, most probably defined by the user with d&d

      // Only sort if we have a comparator
      if (this.comparator) {
        this.comparator.setReverse(this.isReverse);
        var fn = this.comparator.getCompareFn();
        if (!this.toNatural) items.sort(fn);   // Only sort if we do not want to go back to natural order
      }

      // Adjust DOM
      var prevItem = this.headerElement; // Use header as starting point;
      $.each(this.items, function () {
        this.getItemEl().detach();
      }); // First: Detach all items

      // Now: reinsert in new order
      for (var i = 0; i < items.length; i++) {
        var item = items[i].getItemEl();
        prevItem.after(item);
        prevItem = item;
      }
    }
  });


  var DirectMarkupModel = new Class(/** @lends CUI.CardView.DirectMarkupModel# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * List of items; original/current sorting order (without UI sorting applied)
     * @type {CUI.CardView.Item[]}
     * @private
     */
    items: null,

    /**
     * List of headers
     * @type {CUI.CardView.Header[]}
     * @private
     */
    headers: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupModel
     *
     * @classdesc
     * This class represents a data model that is created via a selector from an
     * existing DOM.
     *
     * @constructor
     * @desc
     * Create a new data model.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function ($el, selectors) {
      this.$el = $el;
      this.items = [ ];
      this.selectors = selectors;
      var $items = this.$el.find(selectors.itemSelector);
      var itemCnt = $items.length;
      for (var i = 0; i < itemCnt; i++) {
        this.items.push(new Item($($items[i])));
      }
      this.headers = [ ];
      var $headers = this.$el.find(selectors.headerSelector);
      var headerCnt = $headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var $header = $($headers[h]);
        var $itemRef = $header.nextAll(selectors.itemSelector);
        var itemRef = ($itemRef.length > 0 ?
          this.getItemForEl($($itemRef[0])) : undefined);
        this.headers.push(new Header($header, itemRef));
      }
    },

    /**
     * Initialize the data model.
     */
    initialize: function () {
      var self = this;
      this.$el.on("item-moved", this.selectors.itemSelector, function (e) {
        if (e.hasMoved) {
          self._reorder(e);
        }
      });
    },

    /**
     * Reorder the cards according to the specified event.
     * @param {Event} e The reordering event
     * @private
     */
    _reorder: function (e) {
      var itemToMove = this.getItemForEl($(e.target));
      var newBefore = this.getItemForEl(e.newPrev);
      var isHeaderInsert = false;
      var header;
      if (!newBefore) {
        header = this.getHeaderForEl(e.newPrev);
        if (header) {
          isHeaderInsert = true;
          var refPos = this.getItemIndex(header.getItemRef());
          if (refPos > 0) {
            newBefore = this.getItemAt(refPos - 1);
          }
        }
      }
      var oldPos = this.getItemIndex(itemToMove);
      this.items.splice(oldPos, 1);
      // if the item to move is directly following a header, the header's item ref
      // has to be updated
      var headerRef = this._getHeaderByItemRef(itemToMove);
      if (headerRef) {
        headerRef.setItemRef(this.getItemAt(oldPos));
      }
      var insertPos = (newBefore ? this.getItemIndex(newBefore) + 1 : 0);
      this.items.splice(insertPos, 0, itemToMove);
      if (isHeaderInsert) {
        header.setItemRef(itemToMove);
      }
      // console.log(itemToMove, newBefore, isHeaderInsert);
    },

    /**
     * Get the number of cards/list items.
     * @return {Number} The number of cards/list items
     */
    getItemCount: function () {
      return this.items.length;
    },

    /**
     * Get the card/list item that is at the specified list position.
     * @param {Number} pos The position
     * @return {CUI.CardView.Item} The item at the specified position
     */
    getItemAt: function (pos) {
      return this.items[pos];
    },

    /**
     * Get the list position of the specified card/list item.
     * @param {CUI.CardView.Item} item The item
     * @return {Number} The list position; -1 if the specified item is not a part of
     *         the list
     */
    getItemIndex: function (item) {
      for (var i = 0; i < this.items.length; i++) {
        if (item === this.items[i]) {
          return i;
        }
      }
      return -1;
    },

    /**
     * Get the card/list item that is associated with the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView.Item} The item; undefined if no item is associated with
     *         the specified jQuery object
     */
    getItemForEl: function ($el) {
      var itemCnt = this.items.length;
      for (var i = 0; i < itemCnt; i++) {
        var item = this.items[i];
        if (Utils.equals(item.getItemEl(), $el)) {
          return item;
        }
      }
      return undefined;
    },

    /**
     * <p>Inserts the specified card(s)/list item(s) at the given position.</p>
     * <p>Please note that you can specify multiple items either as an array of jQuery
     * objects or a single jQuery object that contains multiple DOM objects, each
     * representing an item.</p>
     * @param {jQuery|jQuery[]} $items The item(s) to insert
     * @param {Number} pos The position to insert
     * @param {Boolean} beforeHeader True if the items should added before headers (only
     *        applicable if the items are inserted directly at a position where also
     *        a header is present); needs to be false if the list has a single header
     *        that is placed at the top of the list
     */
    insertItemAt: function ($items, pos, beforeHeader) {
      if (!$.isArray($items)) {
        $items = $items.toArray();
      }
      for (var i = $items.length - 1; i >= 0; i--) {

        var $item = $items[i];
        if (!$item.jquery) {
          $item = $($item);
        }

        // adjust model
        var followupItem;
        var item = new Item($item);
        if ((pos === undefined) || (pos === null)) {
          this.items.push(item);
          pos = this.items.length - 1;
        } else {
          followupItem = this.items[pos];
          this.items.splice(pos, 0, item);
        }
        var insert = {
          "item": followupItem,
          "mode": "item"
        };

        // adjust header references if item is inserted directly behind a header
        var headerCnt = this.headers.length;
        for (var h = 0; h < headerCnt; h++) {
          var header = this.headers[h];
          if (header.getItemRef() === followupItem) {
            if (beforeHeader) {
              insert = {
                "item": header,
                "mode": "header"
              };
              break;
            } else {
              header.setItemRef(item);
            }
          }
        }

        // trigger event
        this.$el.trigger($.Event("change:insertitem", {
          "insertPoint": insert,
          "followupItem": followupItem,
          "item": item,
          "pos": pos,
          "widget": Utils.getWidget(this.$el),
          "moreItems": (i > 0)
        }));
      }
    },

    /**
     * Get the number of list headers.
     * @return {Number} The number of headers
     */
    getHeaderCount: function () {
      return this.headers.length;
    },

    /**
     * Get a list header by its position in the list of headers.
     * @param {Number} pos The list header
     * @return {CUI.CardView.Header} The list header at the specified position
     */
    getHeaderAt: function (pos) {
      return this.headers[pos];
    },

    /**
     * Get all list headers.
     * @return {CUI.CardView.Header[]} List headers
     */
    getHeaders: function () {
      var headers = [ ];
      headers.push.apply(headers, this.headers);
      return headers;
    },

    /**
     * Get the list header that is associated with the specified jQuery object.
     * @param {jQuery} $el The jQuery object
     * @return {CUI.CardView.Header} The list header; undefined if no header is
     *         associated with the jQuery object
     */
    getHeaderForEl: function ($el) {
      var headerCnt = this.headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = this.headers[h];
        if (Utils.equals(header.getHeaderEl(), $el)) {
          return header;
        }
      }
      return undefined;
    },

    /**
     * Get the header that directly precedes the specified list item.
     * @param {CUI.CardView.Item} itemRef The item
     * @return {CUI.CardView.Header} header The header
     * @private
     */
    _getHeaderByItemRef: function (itemRef) {
      for (var h = 0; h < this.headers.length; h++) {
        if (this.headers[h].getItemRef() === itemRef) {
          return this.headers[h];
        }
      }
      return undefined;
    },

    /**
     * Get all list items that are preceded by the specified header.
     * @param header {CUI.CardView.Header} The header
     * @return {CUI.CardView.Item[]} The list items
     */
    getItemsForHeader: function (header) {
      // TODO does not handle empty headers yet
      var itemRef = header.getItemRef();
      var headerCnt = this.headers.length;
      var itemCnt = this.items.length;
      var itemsForHeader = [ ];
      var isInRange = false;
      for (var i = 0; i < itemCnt; i++) {
        var item = this.items[i];
        if (isInRange) {
          for (var h = 0; h < headerCnt; h++) {
            if (this.headers[h].getItemRef() === item) {
              isInRange = false;
              break;
            }
          }
          if (isInRange) {
            itemsForHeader.push(item);
          } else {
            break;
          }
        } else {
          if (item === itemRef) {
            isInRange = true;
            itemsForHeader.push(itemRef);
          }
        }
      }
      return itemsForHeader;
    },

    /**
     * Get the list items (data model) from their associated DOM objects.
     * @param {jQuery} $elements The jQuery object that specifies the items' DOM
     *        objects
     * @return {CUI.CardView.Item[]} List items
     */
    fromItemElements: function ($elements) {
      var items = [ ];
      $elements.each(function () {
        var item = $(this).data("cardView-item");
        if (item) {
          items.push(item);
        }
      });
      return items;
    },

    /**
     * Write back references to the data model to the respective DOM objects.
     */
    reference: function () {
      var itemCnt = this.items.length;
      for (var i = 0; i < itemCnt; i++) {
        this.items[i].reference();
      }
    },

    /**
     * Removes all items without triggering respective events.
     */
    removeAllItemsSilently: function () {
      this.items.length = 0;
      for (var h = 0; h < this.headers.length; h++) {
        this.headers[h].setItemRef(undefined);
      }
    }

  });

  var DirectMarkupView = new Class(/** @lends CUI.CardView.DirectMarkupView# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupView
     *
     * @classdesc
     * This class represents a view for data represented by a DirectMarkupModel.
     *
     * @constructor
     * @desc
     * Create a new view.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function ($el, selectors) {
      this.$el = $el;
      this.selectors = selectors;
    },

    /**
     * Initializes the view.
     */
    initialize: function () {
      var self = this;
      this.$el.on("change:displayMode", function (e) {
        var oldMode = e.oldValue;
        var newMode = e.value;
        self.cleanupAfterDisplayMode(oldMode);
        self.prepareDisplayMode(newMode);
      });
      this.$el.on("change:insertitem", function (e) {
        self._onItemInserted(e);
      });
      this.$el.reflow({
        "small": function ($el, size) {
          return $el.width() > 40 * size.rem() && $el.width() < 50 * size.rem();
        },
        "xsmall": function ($el, size) {
          return $el.width() > 30 * size.rem() && $el.width() < 40 * size.rem();
        },
        "xxsmall": function ($el, size) {
          return $el.width() < 30 * size.rem();
        }
      });
    },

    /**
     * Handler that adjusts the view after a new card/list item has been inserted.
     * @param {Event} e The event
     * @private
     */
    _onItemInserted: function (e) {
      var $dataRoot = this.$el;
      if (this.selectors.dataContainer) {
        $dataRoot = $dataRoot.find("." + this.selectors.dataContainer);
      }
      var $item = e.item.getItemEl();
      var followupItem = e.followupItem;
      switch (this.getDisplayMode()) {
        case DISPLAY_LIST:
          if (!followupItem) {
            $dataRoot.append($item);
          } else {
            var insert = e.insertPoint;
            var item = insert.item;
            var $ref = (insert.mode === "item" ?
              item.getItemEl() : item.getHeaderEl());
            $ref.before($item);
          }
          break;
        case DISPLAY_GRID:
          if (!e.moreItems) {
            var widget = Utils.getWidget(this.$el);
            widget._restore();
            widget.layout();
          }
          break;
      }
    },

    /**
     * Get the current display mode (grid view/list view)
     * @return {String} The display mode; defined by constants prefixed by DISPLAY_
     */
    getDisplayMode: function () {
      return Utils.getWidget(this.$el).getDisplayMode();
    },

    /**
     * Set the selection state of the specified item.
     * @param {CUI.CardView.Item} item The item
     * @param {String} selectionState The selection state; currently supported:
     *        "selected", "unselected"
     */
    setSelectionState: function (item, selectionState) {
      var displayMode = this.getDisplayMode();
      var selectorDef = this.selectors.view.selectedItem[displayMode];
      var $itemEl = item.getItemEl();
      if (selectorDef.selector) {
        $itemEl = $itemEl.find(selectorDef.selector);
      }
      if (selectionState === "selected") {
        $itemEl.addClass(selectorDef.cls);
        if (displayMode === DISPLAY_GRID) {
          this._drawSelectedGrid(item);
        }
      } else if (selectionState === "unselected") {
        $itemEl.removeClass(selectorDef.cls);
      }
    },

    /**
     * Get the selection state of the specified item.
     * @param {CUI.CardView.Item} item The item
     * @return {String} The selection state; currently supported: "selected",
     *         "unselected"
     */
    getSelectionState: function (item) {
      var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
      var $itemEl = item.getItemEl();
      if (selectorDef.selector) {
        $itemEl = $itemEl.find(selectorDef.selector);
      }
      var cls = selectorDef.cls.split(" ");
      for (var c = 0; c < cls.length; c++) {
        if (!$itemEl.hasClass(cls[c])) {
          return "unselected";
        }
      }
      return "selected";
    },

    /**
     * Get a list of currently selected items.
     * @return {jQuery} The list of selected items
     */
    getSelectedItems: function () {
      var selectorDef = this.selectors.view.selectedItems[this.getDisplayMode()];
      var $selectedItems = this.$el.find(selectorDef.selector);
      if (selectorDef.resolver) {
        $selectedItems = selectorDef.resolver($selectedItems);
      }
      return $selectedItems;
    },

    /**
     * <p>Restors the card view.</p>
     * <p>The container is purged and the cards are re-inserted in original order
     * (note that this is necessary, because the item elements get reordered for
     * card view; original order has to be restored for list view),</p>
     * @param {CUI.CardView.DirectMarkupModel} model The data model
     * @param {Boolean} restoreHeaders True if header objects should be restored as
     *        well (for list view)
     */
    restore: function (model, restoreHeaders) {
      var $container = $("<div class='" + this.selectors.dataContainer + "'>");
      this.$el.empty();
      this.$el.append($container);
      var itemCnt = model.getItemCount();
      for (var i = 0; i < itemCnt; i++) {
        $container.append(model.getItemAt(i).getItemEl());
      }
      if (restoreHeaders) {
        var headerCnt = model.getHeaderCount();
        for (var h = 0; h < headerCnt; h++) {
          var header = model.getHeaderAt(h);
          var $headerEl = header.getHeaderEl();
          var itemRef = header.getItemRef();
          if (itemRef) {
            itemRef.getItemEl().before($headerEl);
          } else {
            $container.append($headerEl);
          }
        }
      }
    },

    /**
     * Prepares the specified display mode (grid vs. list view).
     * @param {String} displayMode The display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    prepareDisplayMode: function (displayMode) {
      if (displayMode === DISPLAY_GRID) {
        this._drawAllSelectedGrid();
      }
    },

    /**
     * Clean up before the specified display mode is left.
     * @param {String} displayMode The display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    cleanupAfterDisplayMode: function (displayMode) {
      // not yet required; may be overridden
    },

    /**
     * Draw the multiplied version (used for displaying a selection) of the specified
     * image.
     * @param {jQuery} $image The image
     * @private
     */
    _drawImage: function ($image, $item) {
      if ($image.length === 0) {
        return;
      }

      if (this._colorFloat === undefined) {
        var color256 = $image.closest("a, .card", $item[0]).css("background-color");  // Let's grab the color from the card background

        if (!color256 || color256.indexOf("rgb(") < 0) {
            return;
        }

        this._colorFloat = $.map(color256.match(/(\d+)/g), function (val) { // RGB values between 0 and 1
          return val / 255;
        });
      }

      Utils.multiplyImages($image, this._colorFloat);
    },

    /**
     * Create the multiplied images for selected state (in grid view) for all cards.
     * @private
     */
    _drawAllSelectedGrid: function () {
      if (!this.selectors.enableImageMultiply) {
        return;
      }
      var self = this;

      $(this.selectors.view.selectedItems.grid.selector).each(function () {
        var $item = $(this);
        var $img = $item.find("img");

        self._drawImage($img, $item);
        $img.load(function () {
          self._drawImage($(this), $item);
        });
      });
    },

    /**
     * Create the multiplied image for the selected state of the specified card (in
     * grid view).
     * @param {CUI.CardView.Item} item The card/list item
     * @private
     */
    _drawSelectedGrid: function (item) {
      if (!this.selectors.enableImageMultiply) {
        return;
      }
      var self = this;
      var $item = item.getItemEl();
      var $img = $item.find("img");

      this._drawImage($img, $item);
      $img.load(function () {
        self._drawImage($(this), $item);
      });
    },

    /**
     * Removes all items from the view without triggering respective events.
     */
    removeAllItemsSilently: function () {
      this.$el.find(this.selectors.itemSelector).remove();
    }

  });

  var DirectMarkupController = new Class(/** @lends CUI.CardView.DirectMarkupController# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * comparator config for list sorting
     * @type {Object}
     * @private
     */
    comparators: null,

    /**
     * The selection mode
     * @type {String}
     * @private
     */
    selectionModeCount: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupController
     *
     * @classdesc
     * This class implements the controller for data represented by DirectMarkupModel
     * and displayed by DirectMarkupView.
     *
     * @constructor
     * @desc
     * Create a new controller.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     * @param {Object} comparators The comparator config for column sorting
     */
    construct: function ($el, selectors, comparators) {
      this.$el = $el;
      this.selectors = selectors;
      this.comparators = comparators;
      this.selectionModeCount = SELECTION_MODE_COUNT_MULTI;
    },

    /**
     * Initializes the controller
     */
    initialize: function () {
      this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
      var self = this;

      // Selection
      this.$el.on("click.cardview.select",
        this.selectors.controller.selectElement.list, function (e) {
          var widget = Utils.getWidget(self.$el);
          if (widget.getDisplayMode() === DISPLAY_LIST) {
            var item = ensureItem(self.getItemElFromEvent(e));
            if (widget.toggleSelection(item)) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        });
      this.$el.on("click.cardview.select",
        this.selectors.controller.selectElement.grid, function (e) {
          var widget = Utils.getWidget(self.$el);
          if ((widget.getDisplayMode() === DISPLAY_GRID) &&
            widget.isGridSelectionMode()) {
            var item = ensureItem(self.getItemElFromEvent(e));
            if (widget.toggleSelection(item)) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        });
      // list header
      this.$el.on("click.cardview.selectall",
        this.selectors.controller.selectAll.selector, function (e) {
          var widget = Utils.getWidget(self.$el);
          if (widget.getDisplayMode() === DISPLAY_LIST) {
            var cls = self.selectors.controller.selectAll.cls;
            var $header = self.selectors.controller.targetToItem.header(
              $(e.target));
            var header = widget.getModel().getHeaderForEl($header);
            if ($header.hasClass(cls)) {
              widget.deselectAll(header);
            } else {
              widget.selectAll(header);
            }
          }
        });

      // list sorting
      this.$el.on("click.cardview.sort",
        this.selectors.headerSelector + " " + this.selectors.controller.sort.columnSelector, function (e) {

          var widget = Utils.getWidget(self.$el);
          var model = widget.getModel();

          // Trigger a sortstart event
          var event = $.Event("sortstart");
          $(e.target).trigger(event);
          if (event.isDefaultPrevented()) return;

          var sorter = new ColumnSortHandler({
            model: model,
            columnElement: $(e.target),
            comparators: self.comparators,
            selectors: self.selectors
          });
          sorter.sort();

          // Trigger an sortend event
          event = $.Event("sortend");
          $(e.target).trigger(event);
        });

      // Prevent text selection of headers!
      this.$el.on("selectstart.cardview", this.selectors.headerSelector + " " + this.selectors.controller.sort.columnSelector, function (e) {
        e.preventDefault();
      });

      // reordering
      this.$el.on("mousedown.cardview.reorder",
        this.selectors.controller.moveHandleElement.list, function (e) {
          var $itemEl = self.getItemElFromEvent(e);
          var handler = new ListItemMoveHandler({
            $listEl: self.$el,
            $itemEl: $itemEl,
            $items: $(self.selectors.itemSelector),
            dragCls: "dragging",
            autoScrolling: true
          });
          handler.start(e);
        });
      // handle select all state
      this.$el.on("change:selection", function (e) {
        if (e.moreSelectionChanges) {
          return;
        }
        self._adjustSelectAllState(e.widget);
      });
      this.$el.on("change:insertitem", function (e) {
        if (e.moreItems) {
          return;
        }
        self._adjustSelectAllState(e.widget);
      });
    },

    /**
     * Adjusts the state of the "select all" element of all list headers.
     * @param {CUI.CardView} widget The card view widget
     * @private
     */
    _adjustSelectAllState: function (widget) {
      var cls = this.selectors.controller.selectAll.cls;
      var selectionState = widget.getHeaderSelectionState();
      var headers = selectionState.headers;
      var headerCnt = headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = headers[h];
        var $header = header.header.getHeaderEl();
        if (header.hasUnselected) {
          $header.removeClass(cls);
        } else {
          $header.addClass(cls);
        }
      }
    },

    /**
     * Resolves the target of the specified event to a jQuery element that represents
     * a card.
     * @param {Event} e The event
     * @return {jQuery} The jQuery object that represents a card
     */
    getItemElFromEvent: function (e) {
      var $target = $(e.target);
      var resolver = this.selectors.controller.targetToItem[this.getDisplayMode()];
      if ($.isFunction(resolver)) {
        return resolver($target);
      }
      return $target.find(resolver);
    },

    /**
     * Checks if selection mode is enabled for grid view.
     * @return {Boolean} True if selection mode is enabled
     */
    isGridSelect: function () {
      var selectorDef = this.selectors.controller.gridSelect;
      var $el = this.$el;
      if (selectorDef.selector) {
        $el = $el.find(selectorDef.selector);
      }
      return $el.hasClass(selectorDef.cls);
    },

    /**
     * Set selection mode for grid view.
     * @param {Boolean} isGridSelect True to turn selection mode on
     */
    setGridSelect: function (isGridSelect) {
      if (this.isGridSelect() !== isGridSelect) {
        var selectorDef = this.selectors.controller.gridSelect;
        var $el = this.$el;
        if (selectorDef.selector) {
          $el = $el.find(selectorDef.selector);
        }
        if (isGridSelect) {
          $el.addClass(selectorDef.cls);
        } else {
          $el.removeClass(selectorDef.cls);
          Utils.getWidget($el).clearSelection();
        }
        this.$el.trigger($.Event("change:gridSelect", {
          "widget": this.$el.data("cardView"),
          "oldValue": !isGridSelect,
          "value": isGridSelect
        }));
      }
    },

    /**
     * Get current display mode (grid/list view).
     * @return {String} Display mode ({@link CUI.CardView.DISPLAY_GRID},
     *         {@link CUI.CardView.DISPLAY_LIST})
     */
    getDisplayMode: function () {
      if (this.$el.hasClass("list")) {
        return DISPLAY_LIST;
      }
      if (this.$el.hasClass("grid")) {
        return DISPLAY_GRID;
      }
      return null;
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return (this.getDisplayMode() == "list") && this.$el.find(this.selectors.headerSelector).filter(".sort-mode").length > 0;
    },

    /**
     * Set display mode.
     * @param {String} displayMode Display mode ({@link CUI.CardView.DISPLAY_GRID},
     *        {@link CUI.CardView.DISPLAY_LIST})
     */
    setDisplayMode: function (displayMode) {
      var oldValue = this.getDisplayMode();
      if (oldValue !== displayMode) {
        var widget = Utils.getWidget(this.$el);
        widget._restore(displayMode === DISPLAY_LIST);
        switch (displayMode) {
          case DISPLAY_GRID:
            this.$el.removeClass("list");
            this.$el.addClass("grid");
            if (oldValue !== null) {
              var selection = widget.getSelection();
              this.setGridSelect(selection.length > 0);
              widget.layout();
            }
            break;
          case DISPLAY_LIST:
            this.$el.cuigridlayout("destroy");
            this.$el.removeClass("grid");
            this.$el.addClass("list");
            break;
        }
        this.$el.trigger($.Event("change:displayMode", {
          "widget": this.$el.data("cardView"),
          "oldValue": oldValue,
          "value": displayMode
        }));
      }
    },

    /**
     * Get selection mode (single/multiple).
     * @return {String} The selection mode;
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI}
     */
    getSelectionModeCount: function () {
      return this.selectionModeCount;
    },

    /**
     * Set selection mode (single/multiple).
     * @param {String} modeCount The selection mode;
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI}
     */
    setSelectionModeCount: function (modeCount) {
      this.selectionModeCount = modeCount;
    }

  });

  var DirectMarkupAdapter = new Class(/** @lends CUI.CardView.DirectMarkupAdapter# */{

    /**
     * The jQuery object that is the parent of the card view
     * @type {jQuery}
     * @private
     */
    $el: null,

    /**
     * CSS selector config
     * @type {Object}
     * @private
     */
    selectors: null,

    /**
     * comparator config
     * @type {Object}
     * @private
     */
    comparators: null,

    /**
     * The model
     * @type {CUI.CardView.DirectMarkupModel}
     * @private
     */
    model: null,

    /**
     * The view
     * @type {CUI.CardView.DirectMarkupView}
     * @private
     */
    view: null,

    /**
     * The controller
     * @type {CUI.CardView.DirectMarkupController}
     * @private
     */
    controller: null,

    /**
     * @ignore
     * @name CUI.CardView.DirectMarkupAdapter
     *
     * @classdesc
     * Internal class that wires model, controller and view.
     *
     * @constructor
     * @desc
     * Create a new adapter.
     * @param {jQuery} $el The jQuery object that is the parent of the card view
     * @param {Object} selectors The CSS selector config
     */
    construct: function (selectors, comparators) {
      this.selectors = selectors;
      this.comparators = comparators;
    },

    /**
     * Initialize the adapter (and the wrapped model, view & controller).
     * @param {jQuery} $el The card view's parent element
     */
    initialize: function ($el) {
      this.$el = $el;
      this.setModel(new DirectMarkupModel($el, this.selectors));
      this.setView(new DirectMarkupView($el, this.selectors));
      this.setController(new DirectMarkupController($el, this.selectors, this.comparators));
      this.model.initialize();
      this.view.initialize();
      this.controller.initialize();
    },

    /**
     * Set the model.
     * @param {CUI.CardView.DirectMarkupModel} model The model
     */
    setModel: function (model) {
      this.model = model;
    },

    /**
     * Get the model.
     * @return {CUI.CardView.DirectMarkupModel} The model
     */
    getModel: function () {
      return this.model;
    },

    /**
     * Set the view.
     * @param {CUI.CardView.DirectMarkupView} view The view
     */
    setView: function (view) {
      this.view = view;
    },

    /**
     * Get the view.
     * @return {CUI.CardView.DirectMarkupView} The view
     */
    getView: function () {
      return this.view;
    },

    /**
     * Set the controller.
     * @param {CUI.CardView.DirectMarkupController} controller The controller
     */
    setController: function (controller) {
      this.controller = controller;
    },

    /**
     * Get the controller.
     * @return {CUI.CardView.DirectMarkupController} The controller
     */
    getController: function () {
      return this.controller;
    },

    /**
     * Check if the specified card/list item is selected.
     * @param {CUI.CardView.Item} item The card/item
     * @return {Boolean} True if it is selected
     */
    isSelected: function (item) {
      var selectionState = this.view.getSelectionState(item);
      return (selectionState === "selected");
    },

    /**
     * Set the selection state of zhe specified card/list item.
     * @param {CUI.CardView.Item} item The card/item
     * @param {Boolean} isSelected True if it is selected
     */
    setSelected: function (item, isSelected) {
      var selectionState = (isSelected ? "selected" : "unselected");
      this.view.setSelectionState(item, selectionState);
    },

    /**
     * Get a list of selected items
     * @param {Boolean} useModel True if {@link CUI.CardView.Item}s should be returned;
     *        false for jQuery objects
     * @return {CUI.CardView.Item[]|jQuery}
     */
    getSelection: function (useModel) {
      var selection = this.view.getSelectedItems();
      if (useModel === true) {
        selection = this.model.fromItemElements(selection);
      }
      return selection;
    },

    /**
     * Get the display mode.
     * @return {String} The display mode ({@link CUI.CardView.DISPLAY_GRID} or
     *         {@link CUI.CardView.DISPLAY_LIST})
     */
    getDisplayMode: function () {
      return this.controller.getDisplayMode();
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return this.controller.isColumnSorted();
    },

    /**
     * Set the display mode.
     * @param {String} selectionMode The display mode ({@link CUI.CardView.DISPLAY_GRID}
     *        or {@link CUI.CardView.DISPLAY_LIST})
     */
    setDisplayMode: function (selectionMode) {
      this.controller.setDisplayMode(selectionMode);
    },

    /**
     * Check if selection mode is active in grid view.
     * @return {Boolean} True if selection mode is active
     */
    isGridSelectionMode: function () {
      return this.controller.isGridSelect();
    },

    /**
     * Set if selection mode is active in grid view.
     * @param {Boolean} isSelectionMdoe True if selection mode is active
     */
    setGridSelectionMode: function (isSelectionMode) {
      this.controller.setGridSelect(isSelectionMode);
    },

    /**
     * Get the general selection mode (single/multiple items)
     * @return {String} The selection mode
     *         ({@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *         {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI})
     */
    getSelectionModeCount: function () {
      return this.controller.getSelectionModeCount();
    },

    /**
     * Set the general selection mode (single/multiple items)
     * @param {String} modeCount The selection mode
     *        ({@link CUI.CardView.SELECTION_MODE_COUNT_SINGLE},
     *        {@link CUI.CardView.SELECTION_MODE_COUNT_MULTI})
     */
    setSelectionModeCount: function (modeCount) {
      this.controller.setSelectionModeCount(modeCount);
    },

    /**
     * Restores the opriginal DOM structure of the widget.
     * @param {Boolean} restoreHeaders True if list headers should also be restored
     *        (list view)
     * @protected
     */
    _restore: function (restoreHeaders) {
      this.view.restore(this.model, restoreHeaders);
      this.model.reference();
    },

    /**
     * Removes all items from the card view.
     */
    removeAllItems: function () {
      var widget = Utils.getWidget(this.$el);
      widget.clearSelection();
      this.model.removeAllItemsSilently();
      this.view.removeAllItemsSilently();
    }

  });

  CUI.CardView = new Class(/** @lends CUI.CardView# */{

    toString: 'CardView',

    extend: CUI.Widget,

    adapter: null,


    /**
     * @extends CUI.Widget
     * @classdesc
     * <p>A display of cards that can either be viewed as a grid or a list.</p>
     * <p>The display mode - grid or list view - can be changed programmatically
     * whenever required.</p>
     * <p>Grid view has two modes: navigation and selection, which can also be switched
     * programmatically. In navigation mode, the user can use cards to navigate
     * hierarchical structures ("to another stack of cards"). In selection mode, the
     * cards get selected on user interaction instead. List view combines both selection
     * and navigation modes.</p>
     * <p>The card view uses a data model internally that abstracts the cards. This
     * data model is currently not opened as API. Therefore you will often encounter
     * unspecified objects that represent cards in the data model. You can use them
     * interchangibly (for example, if one method returns a card data object, you can
     * pass it to another method that takes a card data object as a parameter), but
     * you shouldn't assume anything about their internals. You may use
     * {@link CUI.CardView#prepend}, {@link CUI.CardView#append} and
     * {@link CUI.CardView#removeAllItems} to manipulate the data model.</p>
     * <p>Please note that the current implementation has some limitiations which are
     * documented if known. Subsequent releases of CoralUI will remove those limitations
     * bit by bit.</p>
     * <p>The following example shows two cards in grid view:</p>
     *
     <div class="grid" data-toggle="cardview">
     <div class="grid-0">
     <article class="card-default">
     <i class="select"></i>
     <i class="move"></i>
     <a href="#">
     <span class="image">
     <img class="show-grid" src="images/preview.png" alt="">
     <img class="show-list" src="images/preview-small.png" alt="">
     </span>
     <div class="label">
     <h4>A card</h4>
     <p>Description</p>
     </div>
     </a>
     </article>
     <article class="card-default">
     <i class="select"></i>
     <i class="move"></i>
     <a href="#">
     <span class="image">
     <img class="show-grid" src="images/preview.png" alt="">
     <img class="show-list" src="images/preview-small.png" alt="">
     </span>
     <div class="label">
     <h4>Another card</h4>
     <p>See shell example page for more info.</p>
     </div>
     </a>
     </article>
     </div>
     </div>
     *
     * @example
     <caption>Instantiate with Class</caption>
     // Currently unsupported.
     *
     * @example
     <caption>Instantiate with jQuery</caption>
     // Currently unsupported.
     *
     * @example
     <caption>Markup</caption>
     &lt;div class="grid" data-toggle="cardview"&gt;
     &lt;div class="grid-0"&gt;
     &lt;article class="card-default"&gt;
     &lt;i class="select"&gt;&lt;/i&gt;
     &lt;i class="move"&gt;&lt;/i&gt;
     &lt;a href="#"&gt;
     &lt;span class="image"&gt;
     &lt;img class="show-grid" src="images/preview.png" alt=""&gt;
     &lt;img class="show-list" src="images/preview-small.png" alt=""&gt;
     &lt;/span&gt;
     &lt;div class="label"&gt;
     &lt;h4&gt;A card&lt;/h4&gt;
     &lt;p&gt;Description&lt;/p&gt;
     &lt;/div&gt;
     &lt;/a&gt;
     &lt;/article&gt;
     &lt;/div&gt;
     &lt;/div&gt;
     * @example
     <caption>Defining comparators for column sorting</caption>
     //  Define a selector for the column and then a comparator to be used for sorting
     // The comparator
     var comparatorConfig = {".label .main": new CUI.CardView.DefaultComparator(".label h4", null, false),
                   ".label .published": new CUI.CardView.DefaultComparator(".label .published", "data-timestamp", true)};
     new CUI.CardView({comparators: comparatorConfig})

     * @example
     <caption>Defining comparators via data API</caption>
     &lt;!-- Page header for list view --&gt;
     &lt;header class="card-page selectable movable"&gt;
     &lt;i class="select"&gt;&lt;/i&gt;
     &lt;i class="sort"&gt;&lt;/i&gt;
     &lt;div class="label"&gt;
     &lt;div class="main" data-sort-selector=".label h4"&gt;Title&lt;/div&gt;
     &lt;div class="published" data-sort-selector=".label .published .date" data-sort-attribute="data-timestamp" data-sort-type="numeric"&gt;Published&lt;/div&gt;
     &lt;div class="modified" data-sort-selector=".label .modified .date" data-sort-attribute="data-timestamp" data-sort-type="numeric"&gt;Modified&lt;/div&gt;
     &lt;div class="links" data-sort-selector=".label .links-number" data-sort-type="numeric"&gt;&lt;i class="icon-arrowright"&gt;Links&lt;/i&gt;&lt;/div&gt;
     &lt;/div&gt;
     &lt;/header&gt;
     &lt;!--
     Sorting is started when the user clicks on the corresponding column header.

     data-sort-selector   defines which part of the item to select for sorting
     data-sort-attribute  defines which attribute of the selected item element should be user for sorting. If not given, the inner text is used.
     data-sort-type       if set to "numeric", a numerical comparison is used for sorting, an alphabetical otherwise
     --&gt;

     * @example
     <caption>Switching to grid selection mode using API</caption>
     $cardView.cardView("toggleGridSelectionMode");
     *
     * @example
     <caption>Switching to grid selection mode using CSS contract</caption>
     $cardView.toggleClass("selection-mode");
     $cardView.find("article").removeClass("selected");
     *
     * @desc Creates a new card view.
     * @constructs
     *
     * @param {Object} [options] Component options
     * @param {Object} [options.selectorConfig]
     *        The selector configuration. You can also omit configuration values: Values not given will be used from
     *        the default selector configuration.
     * @param {String} options.selectorConfig.itemSelector
     *        The selector that is used to retrieve the cards from the DOM
     * @param {String} options.selectorConfig.headerSelector
     *        The selector that is used to retrieve the header(s) in list view from the
     *        DOM
     * @param {String} options.selectorConfig.dataContainer
     *        The class of the div that is used internally for laying out the cards
     * @param {Boolean} options.selectorConfig.enableImageMultiply
     *        Flag that determines if the images of cards should use the "multiply
     *        effect" for display in selected state
     * @param {Object} options.selectorConfig.view
     *        Configures the view of the CardView
     * @param {Object} options.selectorConfig.view.selectedItem
     *        Defines what classes on what elements are used to select a card
     * @param {Object} options.selectorConfig.view.selectedItem.list
     *        Defines the selection-related config in list view
     * @param {String} options.selectorConfig.view.selectedItem.list.cls
     *        Defines the CSS class that is used to select a card in list view
     * @param {String} [options.selectorConfig.view.selectedItem.list.selector]
     *        An additioonal selector if the selection class has to be set on a child
     *        element rather than the card's parent element
     * @param {Object} options.selectorConfig.view.selectedItem.grid
     *        Defines the selection-related config in grid view
     * @param {String} options.selectorConfig.view.selectedItem.grid.cls
     *        Defines the CSS class that is used to select a card in grid view
     * @param {String} [options.selectorConfig.view.selectedItem.grid.selector]
     *        An additioonal selector if the selection class has to be set on a child
     *        element rather than the card's parent element
     * @param {Object} options.selectorConfig.view.selectedItems
     *        Defines how to determine the currently selected cards
     * @param {Object} options.selectorConfig.view.selectedItems.list
     *        Defines how to determine the currently selected cards in list view
     * @param {String} options.selectorConfig.view.selectedItems.list.selector
     *        The selector that determines the DOM elements that represent all currently
     *        selected cards
     * @param {Function} [options.selectorConfig.view.selectedItems.list.resolver]
     *        A function that is used to calculate a card's parent element from the
     *        elements that are returned from the selector that is used for determining
     *        selected cards
     * @param {Object} options.selectorConfig.view.selectedItems.grid
     *        Defines how to determine the currently selected cards in grid view
     * @param {String} options.selectorConfig.view.selectedItems.grid.selector
     *        The selector that determines the DOM elements that represent all currently
     *        selected cards
     * @param {Function} [options.selectorConfig.view.selectedItems.grid.resolver]
     *        A function that is used to calculate a card's parent element from the
     *        elements that are returned from the selector that is used for determining
     *        selected cards
     * @param {Object} options.selectorConfig.controller
     *        Configures the controller of the CardView
     * @param {Object} options.selectorConfig.controller.selectElement
     *        The selector that defines the DOM element that is used for selecting
     *        a card (= targets for the respective click/tap handlers)
     * @param {String} options.selectorConfig.controller.selectElement.list
     *        The selector that defines the event targets for selecting a card in list
     *        view
     * @param {String} [options.selectorConfig.controller.selectElement.listNavElement]
     *        An additional selector that may be used to determine the element that is
     *        used for navigating in list view if it is different from the event target
     *        defined by options.selectorConfig.controller.selectElement.grid
     * @param {String} options.selectorConfig.controller.selectElement.grid
     *        The selector that defines the event targets for selecting a card in grid
     *        view
     * @param {Object} options.selectorConfig.controller.moveHandleElement
     *        The selector that defines the DOM elements that are used for moving
     *        cards in list view (= targets for the respective mouse/touch handlers)
     * @param {String} options.selectorConfig.controller.moveHandleElement.list
     *        The selector that defines the event targets for the handles that are used
     *        to move a card in list view
     * @param {Object} options.selectorConfig.controller.targetToItems
     *        Defines the mapping from event targets to cards
     * @param {Function|String} options.selectorConfig.controller.targetToItems.list
     *        A function that takes a jQuery object that represents the event target for
     *        selecting a card in list view and that has to return the jQuery object
     *        that represents the entire card; can optionally be a selector as well
     * @param {Function|String} options.selectorConfig.controller.targetToItems.grid
     *        A function that takes a jQuery object that represents the event target for
     *        selecting a card in grid view and that has to return the jQuery object t
     *        hat represents the entire card; can optionally be a selector as well
     * @param {Function|String} options.selectorConfig.controller.targetToItems.header
     *        A function that takes a jQuery object that represents the event target for
     *        the "select all" button of a header in list view and that has to return
     *        the jQuery object that represents the respective header; can optionally
     *        be a selector as well
     * @param {Object} options.selectorConfig.controller.gridSelect
     *        Defines the selection mode in grid view
     * @param {Object} options.selectorConfig.controller.gridSelect.cls
     *        Defines the class that is used to switch to selection mode in grid view
     * @param {Object} options.selectorConfig.controller.gridSelect.selector
     *        An additional selector that is used to define the child element where the
     *        selection mode class should be applied to/read from
     * @param {Object} options.selectorConfig.controller.selectAll
     *        Defines how to select all cards in list view
     * @param {Object} options.selectorConfig.controller.selectAll.selector
     *        The selector that is used to determine all "select all" buttons in a
     *        CardView
     * @param {Object} options.selectorConfig.controller.sort
     *        Defines selectors for the column sorting mechanism.
     * @param {Object} options.selectorConfig.controller.sort.columnSelector
     *        The selector for all column objects within the header
     * @param {Object} options.gridSettings
     *        Custom options for jQuery grid layout plugin.
     * @param {Object} options.selectorConfig.controller.selectAll.cls
     *        The class that has to be applied to each card if "select all" is invoked
     * @param {Object} [options.comparators]
     *        An associative array of comparators for column sorting: Every object attribute is a CSS selector
     *        defining one column and its value has to be of type CUI.CardView.DefaultComparator (or your own derived class)
     */
    construct: function (options) {
      // Mix given selector config with defaults: Use given config and add defaults, where no option is given
      var selectorConfig = Utils.mixObjects(options.selectorConfig, DEFAULT_SELECTOR_CONFIG);
      var comparators = options.comparators || null;

      this.adapter = new DirectMarkupAdapter(selectorConfig, comparators);
      this.adapter.initialize(this.$element);
      this.layout(options.gridSettings);
    },

    /*
     * Cleans up the component by removing any internal data and listeners. The component should be
     * used anymore after calling this method.
     *
     * @instance
     */
    destroy: function () {

      // removes every registered element
      this.$element.off();

      // removes the added components
      this.$element.removeData('cardView');
      if (this.$element.data('cuigridlayout')) {
        this.$element.data('cuigridlayout').destroy();
      }

      // removes the adapter reference
      this.adapter = null;

      // removes the element reference
      delete this.$element;
    },

    /**
     * Get the underlying data model.
     * @return {*} The underlying data model
     * @private
     */
    getModel: function () {
      return this.adapter.getModel();
    },

    /**
     * Set the underlying data model.
     * @param {*} model The underlying data model
     * @private
     */
    setModel: function (model) {
      this.adapter.setModel(model);
    },

    /**
     * Check if the specified item (part of the data model) is currently selected.
     * @param {*} item The item (data mode) to check
     * @return {Boolean} True if the specified item is selected
     * @private
     */
    isSelected: function (item) {
      return this.adapter.isSelected(item);
    },

    /**
     * Get the current display mode (grid or list view).
     * @return {String} The display mode; either {@link CUI.CardView.DISPLAY_GRID} or
     *         {@link CUI.CardView.DISPLAY_LIST}
     */
    getDisplayMode: function () {
      return this.adapter.getDisplayMode();
    },

    /**
     * @return {boolean} true if this widget is currently in list mode and has a column sorting on any header applied
     */
    isColumnSorted: function () {
      return this.adapter.isColumnSorted();
    },

    /**
     * @param {boolean} sortable     Set to true if this list should be sortable by click on column
     */
    setColumnSortable: function (sortable) {
      // TODO implement
    },

    /**
     * @return {boolean} True if this list is column sortable (does not say if it is currently sorted, use isColumnSorted() for this)
     */
    isColumnSortable: function () {
      // TODO implement
    },

    /**
     * Set the display mode (grid or list view).
     * @param {String} displayMode The display mode; either
     *        {@link CUI.CardView.DISPLAY_GRID} or {@link CUI.CardView.DISPLAY_LIST}
     */
    setDisplayMode: function (displayMode) {
      this.adapter.setDisplayMode(displayMode);
    },

    /**
     * Checks if selection mode is currently active in grid view.
     * @return {Boolean} True if selection mode is active
     */
    isGridSelectionMode: function () {
      return this.adapter.isGridSelectionMode();
    },

    /**
     * Set the selection mode in grid view.
     * @param {Boolean} isSelection True to switch grid selection mode on
     */
    setGridSelectionMode: function (isSelection) {
      this.adapter.setGridSelectionMode(isSelection);
    },

    /**
     * Toggle selection mode in grid view.
     */
    toggleGridSelectionMode: function () {
      this.setGridSelectionMode(!this.isGridSelectionMode());
    },

    getSelectionModeCount: function () {
      return this.adapter.getSelectionModeCount();
    },

    setSelectionModeCount: function (modeCount) {
      this.adapter.setSelectionModeCount(modeCount);
    },

    /**
     * <p>Select the specified item.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item to select; may either be from data model or a
     *        jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     */
    select: function (item, moreSelectionChanges) {
      // TODO implement beforeselect event
      item = ensureItem(item);
      var isSelected = this.adapter.isSelected(item);
      if (!isSelected) {
        if (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE &&
          this.getSelection().length > 0) {
          this.clearSelection();
        }

        this.adapter.setSelected(item, true);
        this.$element.trigger($.Event("change:selection", {
          "widget": this,
          "item": item,
          "isSelected": true,
          "moreSelectionChanges": (moreSelectionChanges === true)
        }));
      }
    },

    /**
     * <p>Deselect the specified card.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item to deselect; may either be from data model or a
     *        jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     */
    deselect: function (item, moreSelectionChanges) {
      // TODO implement beforeselect event
      item = ensureItem(item);
      var isSelected = this.adapter.isSelected(item);
      if (isSelected) {
        this.adapter.setSelected(item, false);
        this.$element.trigger($.Event("change:selection", {
          "widget": this,
          "item": item,
          "isSelected": false,
          "moreSelectionChanges": moreSelectionChanges
        }));
      }
    },

    /**
     * <p>Toggle the selection state of the specified item.</p>
     * <p>The second parameter should be used if multiple cards are selected/deselected
     * at once. It prevents some time consuming stuff from being executed more than
     * once.</p>
     * @param {jQuery|*} item The item; may be either from data model or a jQuery object
     * @param {Boolean} moreSelectionChanges True if there are more selection changes
     *        following directly
     * @return {Boolean} True if the toggle requires the originating event (if any)
     *         to be stopped and to prevent browser's default behavior
     */
    toggleSelection: function (item, moreSelectionChanges) {
      item = ensureItem(item);

      // allow to cancel & stop the event
      var beforeEvent = $.Event("beforeselect", {

        selectionCancelled: false,

        stopEvent: false,

        item: item,

        cancelSelection: function (stopEvent) {
          this.selectionCancelled = true;
          this.stopEvent = (stopEvent === true);
        }
      });
      this.$element.trigger(beforeEvent);
      if (beforeEvent.selectionCancelled) {
        return beforeEvent.stopEvent;
      }

      var isSelected = this.isSelected(item);
      if (!isSelected &&
        (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE) &&
        (this.getSelection().length > 0)) {
        this.clearSelection();
      }

      this.adapter.setSelected(item, !isSelected);
      this.$element.trigger($.Event("change:selection", {
        "widget": this,
        "item": item,
        "isSelected": !isSelected,
        "moreSelectionChanges": moreSelectionChanges
      }));
      return true;
    },

    /**
     * Gets the currently selected cards.
     * @param {Boolean} useModel True if items from the data model should be retured;
     *        false, if a jQuery object should be returned instead
     * @return {Array|jQuery} The selected items
     */
    getSelection: function (useModel) {
      return this.adapter.getSelection(useModel === true);
    },

    /**
     * Clears the current selection state by deselecting all selected cards.
     */
    clearSelection: function () {
      var selection = this.getSelection(true);
      var itemCnt = selection.length;
      var finalItem = (itemCnt - 1);
      for (var i = 0; i < itemCnt; i++) {
        this.deselect(selection[i], (i < finalItem));
      }
    },

    /**
     * @private
     */
    _headerSel: function (headers, selectFn, lastValidItemFn) {
      var model = this.adapter.getModel();
      if (headers == null) {
        headers = model.getHeaders();
      }
      if (!$.isArray(headers)) {
        headers = [ headers ];
      }
      var headerCnt = headers.length;
      for (var h = 0; h < headerCnt; h++) {
        var header = headers[h];
        if (header.jquery) {
          header = model.getHeaderForEl(header);
        }
        var itemsToSelect = model.getItemsForHeader(header);
        var itemCnt = itemsToSelect.length;
        for (var i = 0; i < itemCnt; i++) {
          selectFn.call(this,
            itemsToSelect[i], !lastValidItemFn(i, itemsToSelect));
        }
      }
    },

    /**
     * <p>Selects all cards.</p>
     * <p>If the headers parameter is specified, all items that are part of one
     * of the specified headers get selected. Items that are not assigned to one of the
     * specified headers are not changed.</p>
     * @param {Array} [headers] Header filter
     */
    selectAll: function (headers) {
      if (this.getSelectionModeCount() !== SELECTION_MODE_COUNT_MULTI) return;

      var self = this;
      this._headerSel(headers, this.select, function (i, items) {
        for (++i; i < items.length; i++) {
          if (!self.isSelected(items[i])) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * <p>Deselect all cards.</p>
     * <p>If the headers parameter is specified, all items that are part of one
     * of the specified headers get deselected. Items that are not assigned to one of
     * the specified headers are not changed.</p>
     * @param {Array} [headers] Header filter
     */
    deselectAll: function (headers) {
      var self = this;
      this._headerSel(headers, this.deselect, function (i, items) {
        for (++i; i < items.length; i++) {
          if (self.isSelected(items[i])) {
            return false;
          }
        }
        return true;
      });
    },

    /**
     * @private
     */
    getHeaderSelectionState: function () {
      var model = this.getModel();
      var curHeader = null;
      var state = {
        "selected": [ ],
        "hasUnselected": false,
        "headers": [ ]
      };
      var headerCnt = model.getHeaderCount();
      var itemCnt = model.getItemCount();
      for (var i = 0; i < itemCnt; i++) {
        var item = model.getItemAt(i);
        for (var h = 0; h < headerCnt; h++) {
          var header = model.getHeaderAt(h);
          if (header.getItemRef() === item) {
            curHeader = {
              "header": header,
              "selected": [ ],
              "hasUnselected": false
            };
            state.headers.push(curHeader);
            break;
          }
        }
        if (this.isSelected(item)) {
          if (curHeader !== null) {
            curHeader.selected.push(item);
          } else {
            state.selected.push(item);
          }
        } else {
          if (curHeader !== null) {
            curHeader.hasUnselected = true;
          } else {
            state.hasUnselected = true;
          }
        }
      }
      return state;
    },

    /**
     * Create and execute a layout of the cards if in grid view.
     */
    layout: function (settings) {
      if (this.getDisplayMode() !== DISPLAY_GRID) {
        return;
      }
      if (this.$element.data('cuigridlayout')) {
        this.$element.cuigridlayout("destroy");
      }
      this.$element.cuigridlayout(settings);
    },

    /**
     * Exexute a relayout of the cards if in grid view.
     */
    relayout: function () {
      if (this.getDisplayMode() !== DISPLAY_GRID) {
        return;
      }
      this.$element.cuigridlayout("layout");
    },

    /**
     * @protected
     */
    _restore: function (restoreHeaders) {
      this.adapter._restore(restoreHeaders);
    },

    /**
     * <p>Append the specified jQuery items as cards.</p>
     * <p>Note that if you are intending to add multiple cards at once, you should
     * either create a single jQuery object that matches the cards to append or an array
     * of jQuery objects, where each array element represents a single card.</p>
     * @param {jQuery|jQuery[]} $items The jQuery item(s) to append
     */
    append: function ($items) {
      this.adapter.getModel().insertItemAt($items, null, false);
    },

    /**
     * Prepend the specified jQuery items as cards.
     * @param {jQuery} $items The jQuery item(s) to prepend
     */
    prepend: function ($items) {
      this.adapter.getModel().insertItemAt($items, 0, false);
    },

    /**
     * Remove all cards from the view.
     */
    removeAllItems: function () {
      this.adapter.removeAllItems();
      if (this.getDisplayMode() === DISPLAY_GRID) {
        this.relayout();
      }
      this.$element.trigger($.Event("change:removeAll", {
        widget: this
      }));
    }

  });

  /** Comparator class for column sorting */
  CUI.CardView.DefaultComparator = new Class(/** @lends CUI.CardView.DefaultComparator# */{
    /**
     * This comparator can select any text or attribute of a given jQuery element and compares
     * it with a second item either numerical or alpahebtical
     *
     * @param {String}  selector   A CSS selector that matches the part of the item to be compared
     * @param {String}  attribute  The attribute of the item to be compared. If not given, the inner text of the item will be used for comparison.
     * @param {String}  type  "numeric" for numeric comparison, or "string" for alphabetical comparison
     */
    construct: function (selector, attribute, type, ignoreCase) {
      this.selector = selector;
      this.attribute = attribute;
      this.ignoreCase = ignoreCase;
      this.isNumeric = (type == "numeric");
      this.reverseMultiplier = 1;
    },
    /**
     * Changes the order of the sort algorithm
     * @param {boolean} True for reverse sorting, false for normal
     */
    setReverse: function (isReverse) {
      this.reverseMultiplier = (isReverse) ? -1 : 1;
    },
    /**
     * Compares two items according to the configuration
     * @return {integer} -1, 0, 1
     */
    compare: function (item1, item2) {
      var $item1 = item1.getItemEl();
      var $item2 = item2.getItemEl();
      var $e1 = (this.selector) ? $item1.find(this.selector) : $item1;
      var $e2 = (this.selector) ? $item2.find(this.selector) : $item2;
      var t1 = "";
      var t2 = "";
      if (!this.attribute) {
        t1 = (this.ignoreCase) ? $e1.text().toLowerCase() : $e1.text();
        t2 = (this.ignoreCase) ? $e2.text().toLowerCase() : $e2.text();
      } else if (this.attribute.substr(0, 5) == "data-") {
        t1 = $e1.data(this.attribute.substr(5));
        t2 = $e2.data(this.attribute.substr(5));
      } else {
        t1 = $e1.attr(this.attribute);
        t2 = $e2.attr(this.attribute);
      }

      if (this.isNumeric) {
        t1 = t1 * 1;
        t2 = t2 * 1;
        if (isNaN(t1)) t1 = 0;
        if (isNaN(t2)) t2 = 0;
      }

      if (t1 > t2) return 1 * this.reverseMultiplier;
      if (t1 < t2) return -1 * this.reverseMultiplier;
      return 0;
    },
    /**
     * Return the compare function for use in Array.sort()
     * @return {function} The compare function (bound to this object)
     */
    getCompareFn: function () {
      return this.compare.bind(this);
    }
  });


  /**
   * Display mode: grid view; value: "grid"
   * @type {String}
   */
  CUI.CardView.DISPLAY_GRID = DISPLAY_GRID;

  /**
   * Display mode: list view; value: "list"
   * @type {String}
   */
  CUI.CardView.DISPLAY_LIST = DISPLAY_LIST;

  /**
   * Single selection mode; value: "single"
   * @type {String}
   */
  CUI.CardView.SELECTION_MODE_COUNT_SINGLE = "single";

  /**
   * Multi selection mode; value: "multiple"
   * @type {String}
   */
  CUI.CardView.SELECTION_MODE_COUNT_MULTI = "multiple";

  /**
   * Utility method to get a {@link CUI.CardView} for the specified jQuery element.
   * @param {jQuery} $el The jQuery element to get the widget for
   * @return {CUI.CardView} The widget
   */
  CUI.CardView.get = function ($el) {
    var cardView = Utils.getWidget($el);
    if (!cardView) {
      cardView = Utils.getWidget($el.cardView());
    }
    return cardView;
  };

  CUI.Widget.registry.register("cardview", CUI.CardView);

  // Data API
  if (CUI.options.dataAPI) {
    $(function () {
      var cardViews = $('body').find('[data-toggle="cardview"]');
      for (var gl = 0; gl < cardViews.length; gl++) {
        var $cardView = $(cardViews[gl]);
        if (!$cardView.data("cardview")) {
          CUI.CardView.init($cardView);
        }
      }
    });
  }

  // additional JSdoc

  /**
   * Triggered when a new card has been inserted succesfully.
   * @name CUI.CardView#change:insertitem
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {*} evt.item The inserted item (data model)
   */

  /**
   * Triggered when the grid selection mode changes.
   * @name CUI.CardView#change:gridSelect
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {Boolean} evt.oldValue True if grid select mode was previously active
   * @param {Boolean} evt.value True if grid select mode is now active
   */

  /**
   * Triggered when the display mode (list/grid view) changes. Display modes are
   * defined by their respective String constants, see for example
   * {@link CUI.CardView.DISPLAY_GRID}.
   * @name CUI.CardView#change:displayMode
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {String} evt.oldValue The old display mode
   * @param {String} evt.value The new display mode
   */

  /**
   * Triggered when the selection changes.
   * @name CUI.CardView#change:selection
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   * @param {*} evt.item The card that is (de)selected (data model)
   * @param {Boolean} evt.isSelected True if the item is now selected
   * @param {Boolean} evt.moreSelectionChanges True if there are more selection changes
   *        following (multiple single selection changes can be treated as one big
   *        selection change)
   */

  /**
   * Triggered right before the selection changes if (and only if) the selection is
   * changed using {@link CUI.CardView#toggleSelection}. The selection change can be
   * vetoed by calling cancelSelection on the Event object.
   * @name CUI.CardView#beforeselect
   * @event
   * @param {Object} evt The event
   * @param {*} evt.item The card that is will get (de)selected (data model)
   * @param {Function} evt.changeSelection This function may be called to cancel the
   *        selection; if true is passed as an argument, the originating event (if
   *        applicable; for example if the selection change is triggered by a user
   *        interaction) is cancelled as well (no event propagation; no default browser
   *        behavior)
   */

  /**
   * Triggered after an item has been moved with drag&drop to a new place in the list by the user.
   * @name CUI.CardView#item-moved
   * @event
   * @param {Object} evt          The event
   * @param {Object} evt.oldPrev  The jQuery element that was previous to the item before dragging started, may be empty or a header
   * @param {Object} evt.oldNext  The jQuery element that was next to the item before dragging started, may be empty
   * @param {Object} evt.newPrev  The jQuery element that is now previous to the item, may be empty or a header
   * @param {Object} evt.newNext  The jQuery element that is now next to the item, may be empty
   * @param {boolean} evt.hasMoved  True if the item really moved or false if it has the some position after the drag action as before.
   */

  /**
   * Triggered right before a column sort action on the list is started (when the user clicks on a column). The client side
   * sorting can be vetoed by setting preventDefault() on the event object. The event target is set to the column header the user clicked on.
   * The sortstart event is always triggered, even if the column has no client side sort configuration.
   * @name CUI.CardView#sortstart
   * @event
   * @param {Object} evt The event
   */

  /**
   * Triggered right after a sorting action on the list has been finished (when the user has clicked on a column).
   * The event target is set to the column header the user clicked on. This event is always triggered, even if the column does not have
   * a client side sort configuration.
   * @name CUI.CardView#sortend
   * @event
   * @param {Object} evt The event
   */

  /**
   * Triggered when all cards are removed.
   * @name CUI.CardView#change:removeAll
   * @event
   * @param {Object} evt The event
   * @param {CUI.CardView} evt.widget The widget
   */

}(window.jQuery));

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

(function ($, window, undefined) {

  /**
   * CUI.Endor is the namespace for shell specific static objects.
   *
   * @namespace
   */
  CUI.Endor = CUI.Endor || {
  };

}(jQuery, this));

(function ($, window, undefined) {

  /**
   * CUI.Endor.registry is used to store and retrieve instances of shell components and is typically only used
   * by shell internals.
   *
   * @namespace
   */
  CUI.Endor.registry = {

    // Public API //

    /**
     * Add an object to the register.
     *
     * @param {Object} instance The object instance to register.
     * @param {string} [key]  The key to register the instance under. If not
     * specified, 'instance.getRegistryKey()' is tried. If not available,
     * a native 'instance.toString()' will be used, and if that's not
     * available, then a unique ID will be generated.
     *
     * @returns {string} The key under which the instance got stored.
     */
    register: function (instance, key) {
      var instanceMap = this._instanceMap,
          callbackMap = this._callbackMap,
          self = this;

      key = this._resolveKey(instance, key) || CUI.util.getNextId();

      if (instance._isSingleton) {
        // This can either be a first instance, or a consecutive one. In the
        // latter case, only the last instance is kept:
        instanceMap[key] = instance;
      } else {
        // All instances of a non-singleton shell widget are kept:
        var instances = instanceMap[key] || (instanceMap[key] = []);
        instances.push(instance);
      }

      // Invoke callbacks registered to this key:
      var callbacks = callbackMap[key];
      if (callbacks) {
        // While iterating over the callbacks, filter out the ones
        // that have the 'once' flag raised. These can be removed
        // right after the callback has been invoked:
        callbackMap[key] = callbacks.filter(function (callback) {
          self._invokeCallback(callback, instance, key);
          return !callback.options.once;
        });
        // When there's no callbacks left for the key, then clean
        // up the empty array:
        if (callbackMap[key].length === 0) {
          delete callbackMap[key];
        }
      }

      return key;
    },

    /**
     * Unregister an instance.
     *
     * @param {Object} instance The instance to unregister.
     * @param {string} [key] The key with which the instance was registered. This is required when instance.toString was
     * not used to register the instance.
     * @returns {string} The key that was used to unregister the instance.
     */
    unregister: function (instance, key) {
      var instanceMap = this._instanceMap,
          callbackMap = this._callbackMap,
          self = this;

      key = this._resolveKey(instance, key);
      if (!key) {
        throw new Error('Invalid instance key');
      }

      if (instance._isSingleton) {
        delete instanceMap[key];
      } else {
        var instances = instanceMap[key];
        var index = instances.indexOf(instance);
        if (index != -1) {
          instances.splice(index, 1);
        }
      }

      var callbacks = callbackMap[key];
      if (callbacks) {
        callbacks.forEach(function (callback) {
          self._invokeCallback(callback, null, key);
        });
      }

      return key;
    },

    /**
     * Check if there are instances registered under the given key.
     *
     * @param {string} key
     * @returns {boolean}
     */
    has: function (key) {
      return this._instanceMap.hasOwnProperty(key);
    },

    /**
     * Get the instance(s) registered under the given key.
     *
     * @param {string} key The key to get the instance(s) for.
     * @returns {Array|undefined} Array with matched instances when the last
     * registered object is not a singleton, otherwise the matched
     * instance, or undefined if no matches were found.
     */
    get: function (key) {
      return this._instanceMap[key + ''];
    },

    /**
     * Request a callback to be invoked when a given key is or was
     * used to register an instance.
     *
     * @param {string} key The key to have callback(s) invoked for.
     * @param {Function} callback The callback to invoke.
     * @param options
     * @param {*} options.scope Scope to use on invoked the callback.
     * @param {boolean} [options.once=false] Set to true to have the
     * callback invoked just once.
     * @returns {Function} A method that can be invoked to cancel the
     * resolve request.
     */
    resolve: function (key, callback, options) {
      callback = {
        method: callback,
        options: $.extend({}, this._defaultCallbackOptions, options)
      };

      if (this.has(key)) {
        this._invokeCallback(callback, this.get(key), key);
        if (callback.options.once) {
          // return, all done:
          return function () {
            return callback;
          };
        }
      }

      var callbacks = this._callbackMap[key] || (this._callbackMap[key] = []);
      callbacks.push(callback);

      // Cancellation method:
      return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        return callback;
      };
    },

    /**
     * Unregister all instances, and cancel all resolve requests. Used for
     * unit testing.
     */
    reset: function () {
      this._instanceMap = {};
      this._callbackMap = {};
    },

    // Internals //

    _instanceMap: {},
    _callbackMap: {},

    _defaultCallbackOptions: {
      once: false,
      scope: this
    },

    /**
     * @private
     */
    _invokeCallback: function (callback, instance, key) {
      var scope = callback.options.scope || this;
      callback.method.apply(scope, [instance, key]);
    },

    /**
     * @private
     */
    _resolveKey: function (instance, key) {
      return key || (
          $.isFunction(instance.getRegistryKey) ?
              instance.getRegistryKey() :
              instance.hasOwnProperty('toString') ?
                  instance + '' :
                  undefined
          );
    }

  };

}(jQuery, this));

(function ($, window) {

  /**
   * CUI.Endor.util defines a number of utility methods
   *
   * @namespace
   */
  CUI.Endor.util = {

    /**
     * Simple method for sanitizing html passed in by the user. This loosely follows the implementation by mustachejs.
     * @param html
     * @returns {string}
     */
    escapeHtml: function(html) {
      var htmlSafeEntityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };

      return String(html).replace(/[&<>"'\/]/g, function (s) {
        return htmlSafeEntityMap[s];
      }.bind(this));
    },

    /**
     * Utility function that queues up events triggered in rapid succession, delivering
     * only the last one.
     *
     * @param fn
     * @param threshold
     * @param execAsap
     * @returns {debounced}
     */
    debounce: function (fn, threshold, execAsap) {
      var timeout;
      return function debounced() {
        var obj = this, args = arguments; // arguments which were passed
        function delayed() {
          if (!execAsap) {
            fn.apply(obj, args); // execute now
          }

          // clear timeout handle
          timeout = null;
        }

        // stop any current detection period
        if (timeout) {
          clearTimeout(timeout);
        } else if (execAsap) { // otherwise, if we're not already waiting and we're executing at the beginning of the detection period
          fn.apply(obj, args); // execute now
        }
        timeout = setTimeout(delayed, threshold || 100);
      };
    },

    ensureElementId: function (element) {
      var $element = $(element);
      if (!$element.attr('id')) {
        $element.attr('id', CUI.util.getNextId());
      }
      return $element;
    },

    /**
     * Register a widget with the CoralUI registry. Since we always follow the
     * same convention, this can be captured in a util.
     *
     * The selector used for registration is derived from what the type returns
     * when 'toString' is invoked. If for example, this would be 'ShellWidgetExample',
     * then the used selector would be 'shellWidgetExample', and the data-init
     * selector 'shell-widget-example'.
     *
     * @param type {Class} to register.
     */
    registerWidget: function (type) {
      var typeString = type.toString(),
          typeCamelCase = CUI.util.decapitalize(typeString),
          typeSelectorCase = CUI.Endor.util.pascalCaseToSelectorCase(typeString);

      CUI.Widget.registry.register(typeCamelCase, type);
      if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
          type.init($('[data-init~='+ typeSelectorCase + ']', event.target));
        });
      }
    },

    pascalCaseToSelectorCase: function (value) {
      var expression = /([A-Z]_*)/g;
      return value
          .replace(expression,'-$1')
          .split('-')
          .filter(function(item){return item !== '';})
          .map(CUI.util.decapitalize)
          .join('-');
    }

  };

}(jQuery, window));
(function ($, window, undefined) {

  var RE_STORE = /^(store)([A-Z]\w*)$/;

  function isString(item) {
    return typeof item === 'string';
  }

  CUI.ShellWidgetMixin = /** @lends CUI.ShellWidgetMixin# */{

    getRegistryKey: function () {
      return this + '';
    },

    // Internals //

    _resolveWidget: function (type, callback, options) {
      var optionsWithScope = $.extend({ scope: this }, options);
      return CUI.Endor.registry.resolve(type, callback, optionsWithScope);
    },

    _initOptionsStore: function () {
      // Look for any options that match the 'store' flag:
      for (var field in this.options) {
        var fieldValue = this.options[field],
            matches = RE_STORE.exec(field);
        if (matches) {
          var option = CUI.util.decapitalize(matches[2]),
              name = [
                this.toString(),
                option,
                fieldValue
              ].filter(isString)
                  .join('.');
          // Watch the target option for change:
          this._initOptionStore(option, name);
        }
      }
    },

    _initOptionStore: function (option, name) {
      var listener = {
        type: 'change:' + option,
        handler: function (event) {
          var value = event.value;
          if (value !== undefined) {
            CUI.Endor.store.save(name, value);
          } else {
            CUI.Endor.store.clear(name);
          }
        }
      };
      this.$element.on(listener.type, listener.handler);
    }
  };

  CUI.ShellWidgetMixin.applyTo = function (targetType, isSingleton) {

    var proto = targetType.prototype,
        construct = proto.construct,
        destruct = proto.destruct;

    $.extend(proto,
        CUI.ShellWidgetMixin,
        {
          _isSingleton: isSingleton !== undefined ? isSingleton : true,

          construct: function () {
            if ($.isFunction(construct)) {
              construct.apply(this, arguments);
            }
            this._initOptionsStore();
            CUI.Endor.registry.register(this);
          },

          destruct: function () {
            CUI.Endor.registry.unregister(this);

            if ($.isFunction(destruct)) {
              destruct.apply(this, arguments);
            }
          }
        }
    );
  };

}(jQuery, this));

(function ($, window, undefined) {

  var RE_STORE = /^(store)([A-Z]\w*)$/;

  function isString(item) {
    return typeof item === 'string';
  }

  CUI.ShellWidget = new Class(/** @lends CUI.ShellWidget# */{

    toString: 'ShellWidget',
    extend: CUI.Widget,

    /**
     * @classdesc CUI.ShellWidget is the base class for all of the widgets in the
     * core shell package. Deriving classes will automatically get
     * registered with the Endor instance registry, and have support
     * for (optionally) persisting options.
     * The constructor invokes <code>this._init(options)</code> upfront
     * registering the instance with the Endor instance registy.
     *
     * Use 'store' prefixed options (i.e. option.storeMyOption, or set
     * on the DOM using <code>data-store-my-option</code> attributes) to
     * have the target option stored on change, via CUI.Endor.store.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init(options);
    },

    /**
     * Stub for subclasses to override. On doing so, make sure to
     * invoke <code>this.inherited(arguments);</code>.
     *
     * @param options
     * @private
     */
    _init: function (options) {
    }

  });

  // Mix-in the shell widget functionality:
  CUI.ShellWidgetMixin.applyTo(CUI.ShellWidget);

}(jQuery, this));
(function ($, window, undefined) {

  var DEFAULTS = {
    isClosed: null
  };

  CUI.Closable = new Class(/** @lends CUI.Closable# */{
    toString: 'Closable',
    extend: CUI.ShellWidget,

    defaults: DEFAULTS,

    // Public API //

    /**
     * @classdesc Base class for widgets that can be in an open or closed state, using
     * the 'is-closed' class.
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.isClosed=false] When true, the widget is in a closed state.
     * When this option is omitted, the widget will set this option to <code>true</code> when the
     * target element has the <code>is-closed</code> class.
     */
    construct: function (options) {
    },

    /**
     * See if the widget is in a closed state.
     * @returns {boolean} True if the widget is closed.
     */
    getIsClosed: function () {
      return this.options.isClosed;
    },

    /**
     * Update the widget's closed state.
     * @param value {boolean} True if the widget should be set closed. False otherwise.
     * @returns {boolean} True if the widget is set closed.
     */
    setIsClosed: function (value) {
      if (value !== this.options.isClosed) {
        if (this._set('isClosed', value) !== this) {
          this._updateDOM();
        }
      }
      return this.options.isClosed;
    },

    /**
     * Sugar for <code>setIsClosed(false);</code>
     * @returns {boolean} True if the the widget is set closed.
     */
    open: function () {
      return this.setIsClosed(false);
    },

    /**
     * Sugar for <code>setIsClosed(true);</code>
     * @returns {boolean} True if the the widget is set closed.
     */
    close: function () {
      return this.setIsClosed(true);
    },

    /**
     * Toggle the widget's closed state.
     * @returns {boolean} True if the the widget is set closed.
     */
    toggleIsClosed: function () {
      return this.setIsClosed(!this.options.isClosed);
    },

    // Internals //

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {
      if (this.options.isClosed === null) {
        this.options.isClosed = this.$element.hasClass(CUI.Closable.CLASS_CLOSED);
      }

      this._updateDOM();
    },

    _updateDOM: function () {
      CUI.Endor.util.ensureElementId(this.$element);

      this.$element.toggleClass(CUI.Closable.CLASS_CLOSED, this.options.isClosed);
    }
  });

  CUI.Closable.defaults = DEFAULTS;
  CUI.Closable.CLASS_CLOSED = 'is-closed';

}(jQuery, this));


(function ($, window, undefined) {

  // When the available inner window width drops below the specified value,
  // the shell will switch the 'compact' mode:
  var ELEMENT_CLASSES = 'endor-Panel',

      CLASS_TRANSITIONING = 'is-transitioning',
      CLASS_BREADCRUMBBAR_HEIGHT = 'endor-Panel-content--breadcrumbBarHeight',

      EVENT_TRANSITION_END = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';

  CUI.Shell = new Class(/** @lends CUI.Shell# */{
    toString: 'Shell',
    extend: CUI.ShellWidget,

    defaults: {

      brandIcon: null,
      brandTitle: null,
      brandHref: null,

      generateBreadcrumbBar: false,
      breadcrumbBarOptions: {
        isClosed: true
      },

      generatePage: false,
      pageOptions: {
        generateOuterRail: true,
        generateInnerRail: true,
        generateBlackBar: true,
        generateActionBar: true,
        generateFooter: true
      }

    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc CUI.Shell manages inter shell widget communication and state keeping.
     *
     * @constructs
     * @param {Object} options
     * @param {jQuery} options.element The widget's target element. Expected to be the document's body tag.
     * @param {string} [options.brandIcon=null] A string that holds the classes that select the icon that should be shown as the application brand.
     * @param {string} [options.brandTitle=null] A string that holds the title of the application, as should be shown in the brand areas.
     * @param {string} [options.brandHref=null] A string that holds the URL that the browser should load on the brand icon or title being clicked.
     * @param {boolean} [options.generateBreadcrumbBar=false] When this option is set to true, the widget will generate a breadcrumb bar and insert it on the DOM.
     * @param {Object} [options.breadcrumbBarOptions={isClosed: true}] The options that the widget will forward to CUI.BreadcrumbBar on constructing the bar in response to the generateBreadcrumbBar flag being raised.
     *
     * @param {boolean} [options.generatePage=false] When this option is set to true, then the widget will generate a shell page and insert it on the DOM.
     * @param {Object} [options.pageOptions={generateOuterRail: true, generateInnerRail: true, generateBlackBar: true, generateFooter: true}] The options that the widget will forward to CUI.Page on constructing the page in response to the generatePage flag being raised.
     */
    construct: function (options) {
    },

    // Internals //

    _breadcrumbBar: null,    // CUI.BreadcrumbBar widget
    _crumbs: null,           // CUI.Crumbs widget
    _page: null,             // CUI.Page widget
    _brand: null,            // CUI.Brand widget

    _isCompact: false,       // When true, the shell hides the nav rail

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
      this._resolveWidgets();
      this._updateIsCompact();
      this._updateBrand();
      this._addListeners();
      this._handleWindowLoadOrResize();
    },

    _setupElement: function () {

      this.$element.addClass(ELEMENT_CLASSES);

      // Accept just the attribute as 'true':
      this.options.generateBreadcrumbBar = !!this.options.generateBreadcrumbBar;
      if (this.options.generateBreadcrumbBar) {
        var $breadcrumbBar = $('<div></div>').prependTo(this.$element);
        $breadcrumbBar.before('<!-- CUI.Shell | breadcrumb bar -->');
        new CUI.BreadcrumbBar($.extend(
            { element: $breadcrumbBar },
            { isClosed: true },
            this.options.breadcrumbBarOptions
        ));
      }

      // Accept just the attribute as 'true':
      this.options.generatePage = !!this.options.generatePage;
      if (this.options.generatePage) {
        var $page = $('<div></div>').appendTo(this.$element);
        $page.before('<!-- CUI.Shell | page -->');
        new CUI.Page($.extend(
            { element: $page },
            this.options.pageOptions
        ));
      }
    },

    _resolveWidgets: function () {
      this._resolveWidget(CUI.Page, this._handlePageResolved);
      this._resolveWidget(CUI.Crumbs, this._handleCrumbsResolved);
      this._resolveWidget(CUI.BreadcrumbBar, this._handleBreadcrumbBarResolved);
      this._resolveWidget(CUI.Brand, this._handleBrandResolved);
    },

    _handlePageResolved: function (page) {
      this._page = page;
      this._updateBreadcrumbBarSpacing();
      this._handleWindowLoadOrResize();
    },

    _handleCrumbsResolved: function (crumbs) {
      this._crumbs = crumbs;
      if (crumbs && this.options.brandTitle) {
        crumbs.setFirstItem({
          title: this.options.brandTitle,
          href: this.options.brandHref,
          icon: this.options.brandIcon
        });
      }
      this._handleWindowLoadOrResize();
    },

    _handleBreadcrumbBarResolved: function (breadcrumbBar) {

      // Clean up:
      var isClosedHandler = this._handleBreadcrumbBarIsClosedChange;
      if (isClosedHandler) {
        this._breadcrumbBar.off('change:isClosed', isClosedHandler);
        delete this._handleBreadcrumbBarIsClosedChange;
      }

      // Reset:
      this._breadcrumbBar = breadcrumbBar;
      if (breadcrumbBar) {
        isClosedHandler = this._handleBreadcrumbBarIsClosedChange = this._updateBrand.bind(this);
        breadcrumbBar.on('change:isClosed', isClosedHandler);
      }
      this._updateBreadcrumbBarSpacing();
      this._handleWindowLoadOrResize();
    },

    _handleBrandResolved: function (brand) {
      this._brand = brand;
      this._updateBrand();
    },

    _addListeners: function () {
      var self = this;

      $(window).on('resize load', CUI.Endor.util.debounce(this._handleWindowLoadOrResize).bind(this));

      $(document).on(CUI.BlackBar.EVENT_BACK_BUTTON_CLICK, function (event) {
        event.preventDefault();
        self._navigateToPreviousCrumb();
      });

      $(document).on(CUI.BlackBar.EVENT_TITLE_CLICK, function (event) {
        event.preventDefault();
        self._toggleBreadcrumbBar();
      });
    },

    _updateIsCompact: function () {
      this._isCompact = window.innerWidth < CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY;
    },

    _updateBrand: function () {
      if (this._brand) {

        if (this._breadcrumbBar) {
          this._brand.setIsClosed(!this._breadcrumbBar.getIsClosed());
        }

        if (this.options.brandTitle) {
          this._brand.setTitle(this.options.brandTitle);
        }

        if (this.options.brandIcon) {
          this._brand.setIcon(this.options.brandIcon);
        }

        if (this.options.brandHref) {
          this._brand.setHref(this.options.brandHref);
        }
      }
    },

    _updateBreadcrumbBarSpacing: function() {
      if (this._page) {
        if (this._breadcrumbBar) {
          this._page.$element.addClass(CLASS_BREADCRUMBBAR_HEIGHT);
        } else {
          this._page.$element.removeClass(CLASS_BREADCRUMBBAR_HEIGHT);
        }
      }
    },

    _handleWindowLoadOrResize: function () {
      this._updateIsCompact();

      if (this._crumbs) {
        this._crumbs.truncate();
      }

      if (this._page) {
        this._page.resize(this._isCompact);

        if (this._breadcrumbBar &&
            this._page._blackBar &&
            this._page._blackBar._titleBar &&
            this._page._blackBar._titleBar.length) {
          var breadcrumbBarElement = this._breadcrumbBar.$element;
          this._page._blackBar._titleBar.attr({
            'aria-controls': breadcrumbBarElement.attr('id'),
            'aria-expanded': !this._breadcrumbBar.get('isClosed'),
            'tabindex': 0
          });
        }
      }
    },

    _toggleBreadcrumbBar: function () {
      if (this._breadcrumbBar) {
        this._breadcrumbBar.toggleIsClosed();
        if (this._page) {
          var pageElement = this._page.$element;
          pageElement
              .toggleClass(CLASS_TRANSITIONING)
              .on(EVENT_TRANSITION_END, function handler(event) {
                pageElement.off(EVENT_TRANSITION_END, handler);
                pageElement.removeClass(CLASS_TRANSITIONING);
              });
          if (this._page._blackBar &&
            this._page._blackBar._titleBar &&
            this._page._blackBar._titleBar.length) {
            this._page._blackBar._titleBar.attr({
              'aria-expanded': !this._breadcrumbBar.get('isClosed')
            });
          }
        }
      }
    },

    _navigateToPreviousCrumb: function () {
      if (this._crumbs) {
        var item = this._crumbs.getLastNavigableItem();
        if (item) {
          window.location = item.attr('href');
          return;
        }
      }

      window.history.back();
    }

  });

  CUI.Endor.util.registerWidget(CUI.Shell);

  CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY = 1024;

}(jQuery, this));

(function ($, window, undefined) {

  var ELEMENT_CLASSES = 'js-endor-page endor-Panel-content endor-Page',

      CLASS_INNER_RAIL_OPEN = 'is-innerRailOpen',
      CLASS_ACTIONBAR_HEIGHT = 'endor-Panel-content--actionBarHeight',
      CLASS_BLACKBAR_HEIGHT = 'endor-Panel-content--blackBarHeight',

      HTML_CONTENT = '<div class="endor-Page-content endor-Panel">',
      HTML_PANEL_CONTENT = '<div class="endor-Panel-content" role="main">',
      HTML_PAGE_CONTENT = '<div class="js-endor-content endor-Panel-content">',
      HTML_PAGE_CONTENT_INNER = '<div class="endor-Panel-contentMain"><div class="u-coral-padding"></div></div>';

  CUI.Page = new Class(/** @lends CUI.Page# */{
    toString: 'Page',
    extend: CUI.ShellWidget,

    defaults: {
      generateOuterRail: false,
      outerRailOptions: {
        generateBrand: true
      },

      generateBlackBar: false,
      blackBarOptions: null,

      generateInnerRail: false,
      innerRailOptions: null,

      generateActionBar: false,

      generateFooter: false,
      footerOptions: null
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc The CUI.Page widget manages the appearance of the nav rail, inner rail, black bar, action bar and the footer.
     *
     *
     * @example
     * <caption>Instantiate with Class</caption>
     * var page = new CUI.Page({
     *     element: '#myPage'
     * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myPage').page();
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.generateOuterRail=false] When set to true, the widget will add an outer rail to the page. The outer rail is where the main navigation bits of page usually reside. See CUI.OuterRail.
     * @param {Object} [options.outerRailOptions={generateBrand: true}] The options that the widget will forward to CUI.OuterRail on constructing the outer rail in response to the generateOuterRail flag being raised. See CUI.OuterRail for more information on what options can be set.
     * @param {Boolean} [options.generateBlackBar=false] When set to true, the widget will add a black bar to the page. The black bar is where the page title, hamburger and back button usually reside. See CUI.BlackBar.
     * @param {Object} [options.blackBarOptions=null] The options that the widget will forward to CUI.BlackBar on constructing the black bar in response to the generateBlackBar flag being raised. See CUI.BlackBar for more information on what options can be set.
     * @param {Boolean} [options.generateInnerRail=false] When set to true, the widget will add an inner rail to the page.
     * @param {Object} [options.innerRailOptions=null] The options that the widget will forward to CUI.InnerRail on constructing the inner rail in response to the generateInnerRail flag being raised. See CUI.InnerRail for more information on what options can be set.
     * @param {Boolean} [options.generateActionBar=false] When set to true, the widget will add an action bar to the page. See CUI.ActionBar.
     * @param {Boolean} [options.generateFooter=false] When set to true, the widget will add a footer to the page.
     * @param {Object} [options.footerOptions=null] The options that the widget will forward to CUI.Footer on constructing the footer in response to the generateFooter flag being raised. See CUI.Footer for more information on what options can be set.
     */
    construct: function (options) {
    },

    resize: function (isCompact) {
      if (isCompact != this._isCompact) {
        this._isCompact = isCompact;
        this._updateOuterRailToggleState();
        this._updateBreadcrumbBarIsCompact();
      }
    },

    /**
     * @returns {jQuery} Page content area container
     */
    getContent: function () {
      return this._$pageContentInner;
    },

    openOuterRail: function () {
      if (this._isCompact && this._innerRail && this._innerRail.getActivePanelId() !== '') {
        // There can be only one rail visible at a time in compact mode. Since 'nav' was last
        // clicked here, close the inner rail:
        this.setActiveInnerRailPanel('');
      }

      this._outerRail.open();
      this._updateOuterRailToggleState();
      this._updateBreadcrumbBarIsCompact();
    },

    closeOuterRail: function () {
      this._outerRail.close();
      this._updateOuterRailToggleState();
      this._updateBreadcrumbBarIsCompact();
    },

    toggleOuterRail: function () {
      if (this._outerRail) {
        if (this._outerRailIsClosed()) {
          this.openOuterRail();
        } else {
          this.closeOuterRail();
        }
      }
    },

    setActiveInnerRailPanel: function (targetId) {
      if (!this._innerRail) {
        return;
      }

      var activeId = this._innerRail.getActivePanelId();

      // Reset the selection when the active panel gets re-selected:
      if (targetId === activeId) {
        targetId = '';
      }

      // If a change occurred, then update accordingly:
      if (targetId !== activeId) {
        this._innerRail.setActivePanelId(targetId);
        this._updateInnerRailState();
        this._updateInnerRailToggleSelectedStates();

        if (this._isCompact) {
          this._updateOuterRailToggleState();
          this._updateBreadcrumbBarIsCompact();
        }
      }
    },


    // Internals //

    _outerRail: null,         // CUI.OuterRail widget
    _outerRailToggle: null,   // CUI.OuterRailToggle widget
    _innerRail: null,         // CUI.InnerRail widget
    _innerRailToggles: [],    // CUI.InnerRailToggle widgets
    _footer: null,            // CUI.Footer widget
    _blackBar: null,          // CUI.BlackBar widget
    _actionBar: null,         // CUI.ActionBar widget
    _breadcrumbBar: null,     // CUI.BreadcrumbBar widget.
    _$belowBlackBar: null,    // jQuery element that holds the content below the black bar.
    _$pageContentOuter: null, // jQuery element that contains the page main contents, outer div.
    _$pageContentInner: null, // jQuery element that contains the page main contents, inner div.
    _$railToggleBtn: null,    // jQuery element that contains the railToggleBtn.
    _isCompact: false,        // Inner/Nav rail toggling influences each other in compact mode.

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
      this._resolveWidgets();
      this._addListeners();
      this._updateInnerRailState();
    },

    _setupElement: function () {
      this.$element.addClass(ELEMENT_CLASSES);

      var $content, $panelContent, $pageContentInner, $pageContentOuter, $generated;

      this.options.generateOuterRail = !!this.options.generateOuterRail;
      if (this.options.generateOuterRail) {
        $generated = $('<div>').prependTo(this.$element);
        $generated.before('<!-- CUI.Page | outer rail -->');
        new CUI.OuterRail($.extend(
            { element: $generated },
            this.options.outerRailOptions
        ));
      }

      $content = this.$element.children('div.endor-Page-content');
      if (!$content.length) {
        $content = $(HTML_CONTENT).appendTo(this.$element);
        $content.before('<!-- CUI.Page | main -->');
      }

      this.options.generateBlackBar = !!this.options.generateBlackBar;
      if (this.options.generateBlackBar) {
        $generated = $('<nav>').appendTo($content);
        $generated.before('<!-- CUI.Page | black bar -->');
        new CUI.BlackBar($.extend(
            { element: $generated },
            this.options.blackBarOptions
        ));
      }

      $panelContent = $content.children('div.endor-Panel-content');
      if (!$panelContent.length) {
        $panelContent = $(HTML_PANEL_CONTENT).appendTo($content);
        $panelContent.before('<!-- CUI.Page | panel content -->');
      }
      this._$belowBlackBar = $panelContent;

      this.options.generateInnerRail = !!this.options.generateInnerRail;
      if (this.options.generateInnerRail) {
        $generated = $('<div>').prependTo($panelContent);
        $generated.before('<!-- CUI.Page | inner rail -->');
        new CUI.InnerRail($.extend(
            { element: $generated },
            this.options.innerRailOptions
        ));
      }

      $content = $panelContent.find('div.endor-Page-content');
      if (!$content.length) {
        $content = $(HTML_CONTENT).appendTo($panelContent);
        $content.before('<!-- CUI.Page | content -->');
      }

      this.options.generateActionBar = !!this.options.generateActionBar;
      if (this.options.generateActionBar) {
        $generated = $('<nav>').prependTo($content);
        $generated.before('<!-- CUI.Page | action bar -->');
        new CUI.ActionBar({ element: $generated });
      }

      $pageContentOuter = $content.find('.js-endor-content');
      if (!$pageContentOuter.length) {
        $pageContentOuter = $(HTML_PAGE_CONTENT).appendTo($content);
        $pageContentOuter.before('<!-- CUI.Page | page content (outer) -->');
      }
      this._$pageContentOuter = $pageContentOuter;

      $pageContentInner = $pageContentOuter.find('div.endor-Panel-contentMain');
      if (!$pageContentInner.length) {
        $pageContentInner = $(HTML_PAGE_CONTENT_INNER).appendTo($pageContentOuter);
        $pageContentInner.before('<!-- CUI.Page | page content (inner) -->');
      }

      this._$pageContentInner = $pageContentInner.children('div.u-coral-padding');

      this.options.generateFooter = !!this.options.generateFooter;
      if (this.options.generateFooter) {
        $generated = $('<footer>').appendTo($pageContentInner);
        $generated.before('<!-- CUI.Page | footer -->');
        new CUI.Footer($.extend(
            { element: $generated },
            this.options.footerOptions
        ));
      }

    },

    _resolveWidgets: function () {

      this._resolveWidget(CUI.InnerRail, function (instance) {
        this._innerRail = instance;
        this._innerRail.on('change:activePanelId', function () {
          this._updateInnerRailState();
        }.bind(this));
        this._updateInnerRailState();
      });

      this._resolveWidget(CUI.OuterRail, function (instance) {
        this._outerRail = instance;
      });

      this._resolveWidget(CUI.OuterRailToggle, function (instance) {
        if (this._outerRailToggleHandler) {
          this._outerRailToggle.$element.off(CUI.OuterRailToggle.EVENT_CLICK, this._outerRailToggleHandler);
          this._outerRailToggleHandler = undefined;
        }
        this._outerRailToggle = instance;
        if (this._outerRailToggle) {
          this._outerRailToggleHandler = this.toggleOuterRail.bind(this);
          this._outerRailToggle.$element.on(CUI.OuterRailToggle.EVENT_CLICK, this._outerRailToggleHandler);
        }
        this._updateOuterRailToggleState();
      });

      this._resolveWidget(CUI.BlackBar, function (instance) {
        this._blackBar = instance;
        if (instance) {
          this._$belowBlackBar.addClass(CLASS_BLACKBAR_HEIGHT);
        } else {
          this._$belowBlackBar.removeClass(CLASS_BLACKBAR_HEIGHT);
        }
      });

      this._resolveWidget(CUI.ActionBar, function (instance) {
        if (instance)
          this._$pageContentOuter.addClass(CLASS_ACTIONBAR_HEIGHT);
        else
          this._$pageContentOuter.removeClass(CLASS_ACTIONBAR_HEIGHT);

        this._actionBar = instance;
      });

      this._resolveWidget(CUI.Footer, function (instance) {
        this._footer = instance;
        this.resize(this._isCompact);
      });

      this._resolveWidget(CUI.BreadcrumbBar, function (instance) {
        this._breadcrumbBar = instance;
        this._updateBreadcrumbBarIsCompact();
      });

      this._resolveWidget(CUI.InnerRailToggle, function (instance) {
        this._innerRailToggles = CUI.Endor.registry.get(CUI.InnerRailToggle);
        this._updateInnerRailToggleSelectedStates();
      });
    },

    _addListeners: function () {
      var self = this;

      $(document).on(CUI.InnerRailToggle.EVENT_CLICK, function (event, orgEvent, widget) {
        var target = $(widget.getTarget()).attr('id') || '';
        self.setActiveInnerRailPanel(target);
      });
    },

    _updateInnerRailState: function () {
      if (this._innerRail) {
        var targetId = this._innerRail.getActivePanelId();
        if (targetId === '') {
          this.$element.removeClass(CLASS_INNER_RAIL_OPEN);
        } else {
          this.$element.addClass(CLASS_INNER_RAIL_OPEN);
        }
      }
      this._updateInnerRailToggleSelectedStates();
    },

    _updateInnerRailToggleSelectedStates: function () {
      var selected = this._innerRail ? this._innerRail.getActivePanel() : $();
      if (this._innerRailToggles) {
        this._innerRailToggles.forEach(function (toggle) {
          toggle.setSelected(selected.is(toggle.getTarget()));
        });
      }
    },

    _updateOuterRailToggleState: function () {
      if (this._outerRailToggle) {
        this._outerRailToggle.setIsClosed(this._outerRailIsClosed());
      }
    },

    _updateBreadcrumbBarIsCompact: function () {
      if (this._breadcrumbBar && this._outerRail) {
        this._breadcrumbBar.setIsCompact(this._outerRailIsClosed());
      }
    },

    _outerRailIsClosed: function () {
      if (!this._outerRail) {
        return false;
      }

      if (this._isCompact && this._innerRail && this._innerRail.getActivePanelId() !== '') {
        return true;
      }

      return this._outerRail.getIsClosed();
    }

  });

  CUI.Endor.util.registerWidget(CUI.Page);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_CRUMBS = 'endor-Crumbs',
      CLASS_CRUMBS_ITEM = 'endor-Crumbs-item',
      CLASS_ELLIPSIS = 'endor-Crumbs-item--ellipsis',
      CLASS_COLLAPSED = 'is-collapsed',

      SELECTOR_ELLIPSIS = '.' + CLASS_ELLIPSIS,

      MOD_UNAVAILABLE = CLASS_CRUMBS_ITEM + '--unavailable',
      MOD_NONAVIGATION = CLASS_CRUMBS_ITEM + '--noNavigation',

      HTML_ICON = '<i class="endor-Crumbs-item-icon coral-Icon"></i>',
      HTML_ELLIPSIS = '<a class="' + CLASS_CRUMBS_ITEM + ' ' + CLASS_ELLIPSIS + '" href="#"></a>',

      TRUNCATE_HORIZONTAL_SPACING = 100;

  CUI.Crumbs = new Class(/** @lends CUI.Crumbs# */{
    toString: 'Crumbs',
    extend: CUI.ShellWidget,

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Widget to display a series of links that know how to truncate when there's not enough space
     * to show all the links.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
    },

    /**
     * Set or update the first crumb.
     *
     * @param titleOrObjectOrElement {string | Object | jQuery}
     * @param href {string} Specifies the link to use, when the first argument is a string.
     *
     * @returns {jQuery}
     */
    setFirstItem: function (titleOrObjectOrElement, href) {
      var $item = this._itemFromTitleOrObjectOrElement(titleOrObjectOrElement, href);
      if (this._firstCrumb) {
        this._firstCrumb.replaceWith($item);
      } else {
        this.$element.prepend($item);
      }
      return this._firstCrumb = $item;
    },

    /**
     * Adds new a crumb. Returns the given or generated element
     *
     * @param titleOrObjectOrElement {string | Object | jQuery}
     * @param href {string} Specifies the link to use, when the first argument is a string.
     *
     * @returns {jQuery} The crumbs as it got added.
     */
    addItem: function (titleOrObjectOrElement, href) {

      var $item = this._itemFromTitleOrObjectOrElement(titleOrObjectOrElement, href);

      this.$element.append($item);
      return $item;
    },

    /**
     * Returns the currently present set of crumbs.
     *
     * @returns {jQuery}
     */
    getItems: function () {
      return this.$element.children().not(SELECTOR_ELLIPSIS);
    },

    /**
     * Removes last crumb and returns it.
     *
     * @returns {*}
     */
    removeItem: function () {
      var $item = this.$element.children(':last-child').remove();
      if ($item.is(this._firstCrumb)) {
        delete this._firstCrumb;
      } else if ($item.is(this._ellipsis)) {
        // Ellipsis is internal: remove the next crumb instead:
        return this._remoteItem();
      }
      return $item;
    },

    /**
     * Removes all crumbs, and returns them.
     *
     * @returns {*}
     */
    removeAllItems: function () {
      delete this._firstCrumb;
      return this.$element.children().remove().not(SELECTOR_ELLIPSIS);
    },

    /**
     * Truncate each item just enough to fit all crumbs. The first and the last
     * item always stay.
     */
    truncate: function () {


      var items = this.$element.children(),
          availableWidth = this.$element.width() - TRUNCATE_HORIZONTAL_SPACING;

      items.removeClass(CLASS_COLLAPSED);
      this._ellipsis.remove();

      var fullWidth = Array.prototype.reduce.call(items, function (memo, v) {
        return memo += $(v).outerWidth();
      }, 0);

      if (items.length && (fullWidth > availableWidth)) {

        // Truncate each item just enough. The first and the last item always stay:
        var w = fullWidth;
        for (var i = 1, ln = items.length - 1; i < ln && w > availableWidth; i++) {
          var item = $(items[i]);
          w -= item.width();
          item.addClass(CLASS_COLLAPSED);
        }

        this._ellipsis.insertAfter(items[0]).addClass(CLASS_COLLAPSED);
      }
    },

    /**
     * Returns the last available and navigable item from the list of set items.
     *
     * @returns {*}
     */
    getLastNavigableItem: function () {
      var result;
      this.$element.children().toArray().reverse().some(function (item) {
        var $element = $(item);
        if ($element.hasClass(MOD_UNAVAILABLE) || $element.hasClass(MOD_NONAVIGATION)) {
          return false;
        }
        else {
          result = $element;
          return true;
        }
      });
      return result ? result.eq(0) : $();
    },

    // Internals //

    _brand: null,
    _ellipsis: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._decorateElement();
      this._findOrCreateEllipsis();

      this.truncate();
    },

    _decorateElement: function () {
      if (!this.$element.is('nav')) {
        throw new Error('CUI.Crumbs expects to be attached to a nav element');
      }

      this.$element.addClass(CLASS_CRUMBS);
      this.$element.children().addClass(CLASS_CRUMBS_ITEM);
    },

    _findOrCreateEllipsis: function () {
      var $ellipsis = this.$element.find(SELECTOR_ELLIPSIS);
      if ($ellipsis.length === 0) {
        $ellipsis = $(HTML_ELLIPSIS);
      }
      this._ellipsis = $ellipsis;
    },

    _itemFromTitleOrObjectOrElement: function (titleOrObjectOrElement, href) {
      var a1 = titleOrObjectOrElement,
          title = (typeof a1 === 'string') ? a1 : undefined,
          object = $.isPlainObject(a1) ? a1 : undefined,
          element = (a1 && a1.jquery) ? a1 : undefined,
          $item;

      if (element) {
        $item = element;
        $item.addClass(CLASS_CRUMBS_ITEM);
      } else if (object) {
        $item = this._constructItemFromObject(object);
      } else {
        $item = this._constructItemFromTitleAndRef(title, href);
      }
      return $item;
    },

    _constructItemFromTitleAndRef: function (title, href) {

      return $('<a>').
          attr('href', href).
          text(title).
          addClass(CLASS_CRUMBS_ITEM);
    },

    _constructItemFromObject: function (object) {

      var $anchor = this._constructItemFromTitleAndRef(object.title, object.href);

      if (object.hasOwnProperty('isAvailable') && !object.isAvailable) {
        $anchor.addClass(MOD_UNAVAILABLE);
        $anchor.attr('tabindex', -1);
      }
      if (object.hasOwnProperty('isNavigable') && !object.isNavigable) {
        $anchor.addClass(MOD_NONAVIGATION);
      }
      if (object.hasOwnProperty('icon')) {
        var $icon = $(HTML_ICON);
        $icon.addClass(object.icon);
        $anchor.prepend($icon);
      }
      return $anchor;
    }
  });

  /**
   * Determine if an element is considered to be 'unavailable' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isUnavailable = function ($item) {
    return $item && $item.hasClass(MOD_UNAVAILABLE);
  };

  /**
   * Determine if an element is considered to be 'no-navigation' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isNoNavigation = function ($item) {
    return $item && $item.hasClass(MOD_NONAVIGATION);
  };

  /**
   * Determine if an element is considered to be 'navigable' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isNavigable = function ($item) {
    var unavailable = CUI.Crumbs.isUnavailable($item),
        noNavigation = CUI.Crumbs.isNoNavigation($item);

    return $item &&
        $item.is('.' + CLASS_CRUMBS_ITEM) && !(unavailable || noNavigation);
  };

  CUI.Crumbs.CLASS_ITEM_UNAVAILABLE = MOD_UNAVAILABLE;
  CUI.Crumbs.CLASS_ITEM_NONAVIGATION = MOD_NONAVIGATION;

  CUI.Endor.util.registerWidget(CUI.Crumbs);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Panel-header endor-ActionBar',

      CLASS_LEFT = 'endor-ActionBar-left',
      CLASS_RIGHT = 'endor-ActionBar-right',
      CLASS_ITEM = 'endor-ActionBar-item',
      CLASS_ITEM_TEXT = CLASS_ITEM + '--text';

  CUI.ActionBar = new Class(/** @lends CUI.ActionBar# */{
    toString: 'ActionBar',
    extend: CUI.Widget,

    // Public API //

    /**
     * @extends CUI.Widget
     * @classdesc Used to define the bar that goes on top of a page, just below the black bar.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init(options);
    },

    /**
     * Add an element to the bar.
     *
     * @param item {jQuery | string} The element to add. Can be either a selector, or a jQuery object.
     * @param options
     * @param options.isText {string} If true, marks up the element as text.
     * @param options.right {boolean} If true, the element gets added
     * to the bar's right hand side.
     * @returns {jQuery} The element as it got added.
     */
    addItem: function (item, options) {

      var $container = (options && options.right === true) ?
              this._rightContainer :
              this._leftContainer,
          isText = options && options.isText;

      item = $(item);
      item.addClass(CLASS_ITEM + (isText ? ' ' + CLASS_ITEM_TEXT : ''));

      $container.append(item);

      return item;
    },

    /**
     * Remove an element from the bar.
     *
     * @param item {jQuery | string} The element to remove. Can be either a selector, or a jQuery object.
     * @returns {jQuery} The element as it got removed.
     */
    removeItem: function (item) {
      item = this.$element.find(item);
      return item.remove();
    },

    /**
     * @returns {jQuery} The bar's left hand side container element.
     */
    getLeftContainer: function () {
      return this._leftContainer;
    },

    /**
     * @returns {jQuery} The bar's right hand side container element.
     */
    getRightContainer: function () {
      return this._rightContainer;
    },

    // Internals //

    _leftContainer: $(),
    _rightContainer: $(),

    _init: function (options) {
      this._setupElement();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);

      var $container;

      $container = this.$element.children('div.' + CLASS_LEFT);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_LEFT)
            .appendTo(this.$element);
      }
      this._leftContainer = $container.eq(0);

      $container = this.$element.children('div.' + CLASS_RIGHT);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_RIGHT)
            .appendTo(this.$element);
      }
      this._rightContainer = $container.eq(0);
    }

  });

  CUI.Widget.registry.register('actionBar', CUI.ActionBar);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.ActionBar.init($('[data-init~="action-bar"]', event.target));
    });
  }

  // When this code gets moved out of the shell repository, then this bit needs
  // to stay behind, to be called *after* the widget gets defined.
  CUI.ShellWidgetMixin.applyTo(CUI.ActionBar);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Footer endor-Panel-footer endor-Footer--sticky',

      CLASS_COPYRIGHT = 'endor-Footer-copyright',
      CLASS_LINKS = 'endor-Footer-links',
      CLASS_ITEM = 'endor-Footer-item',

      SELECTOR_COPYRIGHT = 'span.' + CLASS_COPYRIGHT,
      SELECTOR_LINKS = 'div.' + CLASS_LINKS;

  CUI.Footer = new Class(/** @lends CUI.Footer# */{
    toString: 'Footer',
    extend: CUI.ShellWidget,

    defaults: {
      copyright: '© 2014 Adobe Systems Incorporated. All Rights Reserved.'
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a shell footer.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.copyright="© 2014 Adobe Systems Incorporated. All Rights Reserved."] Copyright text.
     */
    construct: function (options) {
    },

    /**
     * Set the copyright text.
     *
     * @param value {string} Copyright text.
     */
    setCopyright: function (value) {
      if (value !== this.options.copyright) {
        if (this._set('copyright', value) !== this) {
          this._updateCopyrightDOM();
        }
      }
    },

    /**
     * Add a footer item(s).
     *
     * @param item {Array | jQuery | string}
     * @returns {Array | jQuery} The item(s) as added.
     */
    addItem: function (item) {
      if ($.isArray(item)) {
        return item.map(this.addItem, this);
      }

      return $(item)
          .addClass(CLASS_ITEM)
          .appendTo(this._$items);
    },

    /**
     * Remove a footer item.
     *
     * @param item
     * @returns {jQuery} The removed item.
     */
    removeItem: function (item) {
      return this._$items.find(item).remove();
    },

    // Internals //

    _$copyright: $(),
    _$items: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._setupElement();
      this._updateCopyrightDOM();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);

      var $container;

      $container = this.$element.children(SELECTOR_COPYRIGHT);
      if (!$container.length) {
        $container = $('<span>')
            .addClass(CLASS_COPYRIGHT)
            .appendTo(this.$element);
      }
      this._$copyright = $container.eq(0);

      $container = this.$element.children(SELECTOR_LINKS);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_LINKS)
            .appendTo(this.$element);
      }
      this._$items = $container.eq(0);
    },

    _updateCopyrightDOM: function () {
      this._$copyright.text(this.options.copyright || '');
    }

  });

  CUI.Endor.util.registerWidget(CUI.Footer);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_COMPACT = 'is-compact',

      SELECTOR_CLOSEINDICATOR = 'div.endor-BreadcrumbBar-closeIndicator',

      HTML_CLASSES = 'endor-Panel-header endor-BreadcrumbBar js-endor-breadcrumb-bar',
      HTML_NAV = '<nav class="endor-Crumbs">',
      HTML_CLOSEINDICATOR = [
        '<button class="endor-BreadcrumbBar-closeIndicator coral-MinimalButton">',
          '<i class="coral-Icon coral-Icon--chevronUp coral-Icon--sizeS"></i>',
        '</button>'
      ].join('');

  CUI.BreadcrumbBar = new Class(/** @lends CUI.BreadcrumbBar# */{
    toString: 'BreadcrumbBar',
    extend: CUI.Closable,

    $closeIndicatorElement: null,
    $navElement: null,
    crumbsWidget: null,

    defaults: $.extend({},
        CUI.Closable.defaults,
        {
          isCompact: null,
          closeOnNavigate: false,
          closeOnClick: false,
          hideCloseIndicator: false,
          closeIndicatorText: "Close" //Text which provides an accessible label for the close indicator button.
        }),

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the shell breadcrumb bar container.
     *
     * @constructs
     * @param {Object} options
     * @param {boolean} [options.isCompact=false] Whether the first item in the breadcrumb should only show its icon (and not its associated text). For this option to work correctly, the first item needs to have an icon set. Use setIsCompact or toggleIsCompact methods to update this option post initialization.
     * @param {boolean} [options.closeOnNavigate=false] Whether the breadcrumb bar should be closed when a navigable
     * breadcrumb item is clicked.
     * @param {boolean} [options.closeOnClick=false] Whether the breadcrumb bar should be closed when it is clicked.
     * When set to false, the breadcrumb bar will still be closed when the close indicator is clicked.
     * @param {boolean} [options.hideCloseIndicator=false] Whether the close indicator should be hidden.
     * @param {String} [options.closeIndicatorText="Close"] Text which provides an accessible label for the close indicator button.
     */
    construct: function (options) {
    },


    /**
     * Find out if the bar is in a compact state.
     * @returns {boolean} True when the breadcrumb bar is in a compact state.
     */
    getIsCompact: function () {
      return this.options.isCompact;
    },

    /**
     * Set the bar's compact state. In compact mode, the first item in the breadcrumb shows only its icon (and not its associated text). For this option to work correctly, the first item needs to have an icon set.
     * @param value {boolean} True when the breadcrumb bar should go into a compact state. False otherwise.
     * @returns {boolean} The value of options.isCompact.
     */
    setIsCompact: function (value) {
      if (value !== this.options.isCompact) {
        if (this._set('isCompact', value) !== this) {
          this._applyIsCompactToDOM();
        }
      }
      return value;
    },

    /**
     * Toggle the bar's compact state. When options.isCompact is true, the invocation of this method will
     * result in options.isCompact to become false. Otherwise options.isCompact will be set to true.
     *
     * In compact mode, the first item in the breadcrumb shows only its icon (and not its associated text).
     * For this option to work correctly, the first item needs to have an icon set.
     *
     * @returns {boolean} The value of options.isCompact
     */
    toggleIsCompact: function () {
      return this.setIsCompact(!this.options.isCompact);
    },

    // Internals //

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {

      this.inherited(arguments);

      CUI.Endor.util.ensureElementId(this.$element);

      // When options.isCompact is not set, see if class is-compact is opn the target element:
      if (this.options.isCompact === null) {
        this.options.isCompact = this.$element.hasClass(CLASS_COMPACT);
      }

      // Have the mere presence of an attribute toggle the setting 'true' (unless set 'false'
      // specifically):
      this.options.isCompact = !!this.options.isCompact;
      this.options.closeOnNavigate = !!this.options.closeOnNavigate;
      this.options.closeOnClick = !!this.options.closeOnClick;
      this.options.hideCloseIndicator = !!this.options.hideCloseIndicator;

      this.$element.addClass(HTML_CLASSES);
      this.$navElement = this._getOrConstructNavElement();
      this.crumbsWidget = this._getOrConstructCrumbsWidget();
      this.$closeIndicatorElement = this._getOrConstructCloseIndicator();
      this._setupCloseIndicator();
      this._applyIsCompactToDOM();

      // Listen to the bar being clicked:
      this.$element.on('click', this._handleElementClick.bind(this));
    },

    _getOrConstructNavElement: function () {
      var $nav = this.$element.children('nav').eq(0);
      if ($nav.length === 0) {
        $nav = $(HTML_NAV);
        this.$element.prepend($nav);
      }
      return $nav;
    },

    _getOrConstructCrumbsWidget: function () {
      var $nav = this.$navElement,
          widget = CUI.Widget.fromElement(CUI.Crumbs, $nav);
      if (!widget) {
        widget = new CUI.Crumbs({ element: $nav});
      }
      return widget;
    },

    _getOrConstructCloseIndicator: function () {
      var $indicator = this.$element.children(SELECTOR_CLOSEINDICATOR).eq(0);
      if ($indicator.length === 0) {
        $indicator = $(HTML_CLOSEINDICATOR);
        this.$element.append($indicator);
      }
      if ($.trim($indicator.text()).length === 0 &&
          !$indicator.is('[aria-label], [aria-labelledby]') &&
          $indicator.find('[aria-label], [aria-labelledby]').length === 0) {
        $indicator.attr({
          'aria-label': this.options.closeIndicatorText,
          'title': this.options.closeIndicatorText
        });
      }
      return $indicator;
    },

    _setupCloseIndicator: function () {
      if (this.options.hasOwnProperty('hideCloseIndicator')) {
        this.options.hideCloseIndicator = this.options.hideCloseIndicator === true;
      }
      if (this.options.hideCloseIndicator) {
        this.$closeIndicatorElement.remove();
        this.$closeIndicatorElement = undefined;
      }
    },

    _handleElementClick: function (event) {
      var $target = $(event.target),
          close = this.options.closeOnClick;

      if (this.$closeIndicatorElement && (this.$closeIndicatorElement.find($target).length || this.$closeIndicatorElement.is($target))) {
        // Close if the close-indicator got clicked:
        close = true;
      } else if (CUI.Crumbs.isNavigable($target)) {
        // Close a navigable item only when options allow to:
        close = this.options.closeOnNavigate;
      }

      if (close) {
        this.setIsClosed(true);
      }
    },

    _applyIsCompactToDOM: function () {

      if (this.options.isCompact) {
        this.$element.addClass(CLASS_COMPACT);
      } else {
        this.$element.removeClass(CLASS_COMPACT);
      }
    }

  });

  CUI.Endor.util.registerWidget(CUI.BreadcrumbBar);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_ICON = '<i></i>',
      CLASS_BRAND = 'endor-Brand',
      CLASS_BRAND_ICON = 'endor-Brand-icon',

      SELECTOR_BRAND_ICON = '.' + CLASS_BRAND_ICON,

      DEFAULTS = {
        icon: 'coral-Icon coral-Icon--hammer coral-Icon--sizeM',
        title: 'CoralUI',
        href: 'http://coralui.corp.adobe.com'
      };

  CUI.Brand = new Class(/** @lends CUI.Brand# */{
    toString: 'Brand',
    extend: CUI.Closable,
    defaults: CUI.Closable.defaults,

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the appearance of the application bar that's usually placed in the outer rail.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.icon="coral-Icon coral-Icon--hammer coral-Icon--sizeM"] One or more (space delimited) class names that will be set on the internal icon tag in order to depict the desired icon. Use the setIcon method to update this option from JavaScript.
     * @param {string} [options.title="CoralUI"] The title of the brand. Use the setTitle method to update this option from JavaScript.
     * @param {string} [options.href="http://coralui.corp.adobe.com"] The URL to open when the brand icon or text is clicked. Use the setHref method to update this option from JavaScript.
     */
    construct: {
    },

    /**
     * Update the brand's title text. The newly set value is store on the widget's options object.
     * @param value {string} The title text.
     */
    setTitle: function (value) {
      if (value !== this.options.title) {
        if (this._set('title', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Update the brand's link. The newly set value is store on the widget's options object.
     * @param value The URL to open when the brand icon or text is clicked.
     */
    setHref: function (value) {
      if (value !== this.options.href) {
        if (this._set('href', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Update the classes that are to be set on the brand's internal icon element.
     * @param value {string} One or more (space delimited) class names that will be set on the internal icon tag in order to depict the desired icon.
     */
    setIcon: function (value) {
      if (value !== this.options.icon) {
        if (this._set('icon', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    // Internals //

    $icon: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._decorateElement();

      this._findOrCreateIcon();
      this._findOrCreateText();

      this._updateAppearance();

      this.on('click', this._handleClick.bind(this));
    },

    _decorateElement: function () {
      this.$element.addClass(CLASS_BRAND);
      if (!this.options.hasOwnProperty('href')) {
        this.options.href = this.$element.attr('href') || DEFAULTS.href;
      }
    },

    _findOrCreateIcon: function () {
      var $icon = this.$element.children(SELECTOR_BRAND_ICON);
      if ($icon.length === 0) {

        $icon = $(HTML_ICON)
            .prependTo(this.$element);

        // Set default in absence of client set option:
        if (!this.options.hasOwnProperty('icon')) {
          this.options.icon = DEFAULTS.icon;
        }
      } else {

        // Existing <i> tag: adopt its classes, if set:
        if (!this.options.hasOwnProperty('icon')) {
          this.options.icon = $icon.attr('class')
              .split(' ')
              .filter(function (item) {
                return item !== CLASS_BRAND_ICON;
              })
              .join(' ') || DEFAULTS.icon;
        }
      }
      return this.$icon = $icon;
    },

    _findOrCreateText: function () {
      var $text = this._getTextNode();
      if ($text.length === 0) {
        if (!this.options.hasOwnProperty('title')) {
          this.options.title = DEFAULTS.title;
        }

        $text = $(document.createTextNode(this.options.title))
            .appendTo(this.$element);

      } else {
        if (!this.options.hasOwnProperty('title')) {
          this.options.title = $text.text();
        }
      }
      return $text;
    },

    _updateAppearance: function () {

      // Update link:
      if (this.options.href && this.options.href !== "") {
        this.$element.attr('href', this.options.href);
      }

      // Update title:
      this._getTextNode().replaceWith(document.createTextNode(this.options.title));

      // Update icon:
      this.$icon.removeClass();
      this.$icon.addClass(CLASS_BRAND_ICON);
      this.$icon.addClass(this.options.icon);
    },

    _getTextNode: function () {
      return this.$element
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .eq(0);
    },

    _handleClick: function (event) {
      if (!this.options.href) {
        event.preventDefault();
        this.$element.trigger(CUI.Brand.EVENT_CLICK, event);
      }
    }

  });

  /**
   * Event dispatched when the brand gets clicked ONLY when the
   * href option resolves to 'false'.
   *
   * Dispatched from the target DOM element.
   *
   */

  /**
   * Event dispatched when the brand gets clicked ONLY when the href option resolves to 'false'. It is recommended to use CUI.Brand.EVENT_CLICK instead of this literal.
   *
   * @event CUI.Brand#cui-brand-click.
   */

  /**
   * The type of the event that is triggered when the brand icon or text is clicked (and href is falsy)
   * @type {string}
   */
  CUI.Brand.EVENT_CLICK = 'cui-brand-click';

  CUI.Endor.util.registerWidget(CUI.Brand);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_CLASSES = 'js-endor-inner-rail endor-Page-sidepanel endor-Page-sidepanel--innerRail',

      CLASS_ACTIVE = 'is-active',
      CLASS_PANEL = 'coral-MultiPanel',

      SELECTOR_PANEL = '.' + CLASS_PANEL,
      SELECTOR_ACTIVE = '.' + CLASS_ACTIVE;

  CUI.InnerRail = new Class(/** @lends CUI.InnerRail# */{
    toString: 'InnerRail',
    extend: CUI.ShellWidget,

    defaults: {
      activePanelId: ''
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Widget that holds a number of panels, one or none of which may appear at the left hand side
     * of the page's main content area.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.activePanelId=""] The value of the id attribute of the panel that should be set active. Post initialization, update this option using the <code>setActivePanel</code> or <code>setActivePanelId</code> method.
     */
    construct: {
    },

    /**
     * @returns {jQuery} The $element that is currently active.
     */
    getActivePanel: function () {
      return this._getActivePanelById(this.options.activePanelId);
    },

    /**
     * @returns {string} The value of the id attribute of the panel that is currently active.
     */
    getActivePanelId: function () {
      return this.options.activePanelId;
    },

    /**
     * Set what panel should be active. Setting an invalid element or null
     * causes the inner rail to close.
     *
     * @param panel {jQuery} The panel to activate.
     * @returns {*}
     */
    setActivePanel: function (panel) {
      var id = $(panel).attr('id');
      return this.setActivePanelId(id);
    },

    /**
     * Set what panel should be active, by passing its id. Setting an
     * id that does not resolve to a panel results in the inner rail
     * closing.
     *
     * @param id
     */
    setActivePanelId: function (id) {
      if (id !== this.options.activePanelId) {
        if (this._set('activePanelId', id) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Add a panel.
     *
     * @param panel {jQuery | string | Array} The panel(s) to add.
     * @returns {jQuery} The panel as added.
     */
    addPanel: function (panel) {
      if ($.isArray(panel)) {
        return panel.map(this.addPanel, this);
      }

      return CUI.Endor.util.ensureElementId(panel).
          addClass(CLASS_PANEL).
          appendTo(this.$element);
    },

    /**
     * Remove a panel. If the panel that is removed is the active panel,
     * then the active panel becomes undefined.
     *
     * @param {jQuery} The panel to remove
     * @returns {*}
     */
    removePanel: function (panel) {
      if (panel.attr('id') === this.options.activePanelId) {
        this.setActivePanelId('');
      }
      panel.remove();

      return panel;
    },

    // Internals //

    _init: function (options) {

      this.inherited(arguments);

      CUI.Endor.util.ensureElementId(this.$element);

      this.$element.addClass(HTML_CLASSES);
      this._parseHTML();
      this._updateAppearance();
    },

    _parseHTML: function () {
      // Find preset panels:
      var panels = this._getPanels();

      // Make sure all panels have an ID:
      panels.each(function () {
        CUI.Endor.util.ensureElementId(this);
      });

      // If options holds no selection, see if the HTML holds an active
      // panel:
      if (!this.options.activePanelId || this.options.activePanelId === '') {
        var panel = panels.filter(SELECTOR_ACTIVE);
        if (panel.length) {
          this.options.activePanelId = panel.attr('id');
        }
      }
    },

    _updateAppearance: function () {
      var activeCSS = this._getActivePanelByCSS(),
          activeID = this._getActivePanelById();

      if (!activeID.length) {
        // no-op: without an active id set, the inner rail should be hidden: no use
        // updating its appearance.
        return;
      }

      if (activeCSS.length && activeCSS.eq(0).attr('id') === activeID.eq(0).attr('id')) {
        // no-op: the correct element is set selected already.
        return;
      }

      activeCSS.removeClass(CLASS_ACTIVE);
      activeID.addClass(CLASS_ACTIVE);
    },

    _getPanels: function () {
      return this.$element.children(SELECTOR_PANEL);
    },

    _getActivePanelById: function () {
      return this.options.activePanelId ? this.$element.children('#' + this.options.activePanelId) : $();
    },

    _getActivePanelByCSS: function () {
      return this.$element.children(SELECTOR_PANEL + SELECTOR_ACTIVE);
    }

  });

  CUI.Endor.util.registerWidget(CUI.InnerRail);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_IS_SELECTED = 'is-selected',
      SELECTOR_LABEL = '.endor-ActionButton-label';

  CUI.InnerRailToggle = new Class(/** @lends CUI.InnerRailToggle# */{
    toString: 'InnerRailToggle',
    extend: CUI.ShellWidget,
    _isSingleton: false,

    // Public API //

    defaults: {
      target: '',
      label: null,
      prefixSelected: 'Hide',
      prefixUnselected: 'Show',
      selected: false
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a widget that reflects the selected state of an inner rail panel. The target inner rail is
     * specified by the data-target attribute. Note thay by itself, the InnerRailToggle will not show or hide a panel
     * on being clicked. For that to happen and instance of CUI.Page must be loaded too.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.target=""] The selector to the panel element that this toggle toggles.
     * @param {string} [options.label=null] The label to be shown with the toggle. The widget applies the label using jQuery text() on any child element that bears the endor-ActionButton-label class.
     * @param {string} [options.prefixSelected="Hide"] String with which to prefix the label when selected.
     * @param {string} [options.prefixUnselected="Show"] String with which to prefix the label when not selected.
     * @param {boolean} [options.selected=false] Boolean indicating whether the toggle should be in a selected state.
     */
    construct: {
    },

    /**
     * Get the selector for the panel that this toggle is bound to.
     * @returns {String}
     */
    getTarget: function () {
      return this.options.target;
    },

    /**
     * Sets the toggle's selected state.
     *
     * @param {Boolean} value
     * @param {Boolean} [force] Used internally (forces an update even if the set value didn't change).
     */
    setSelected: function (value, force) {
      if (force || (value !== this.options.selected)) {
        if (this._set('selected', value) !== this) {
          this.$element.toggleClass(CLASS_IS_SELECTED, value)
            .attr({
              'aria-pressed': value,
              'aria-expanded': value
            });
          this._updateLabelDOM();
        }
      }
    },

    /**
     * Sets the toggle's associated label. Note that the widget applies the label using jQuery text() on
     * any child element that bears the "endor-ActionButton-label" class. Without such a child element,
     * no label will show.
     *
     * @param {Boolean} value
     * @param {Boolean} [force] Used internally (forces an update even if the set value didn't change).
     */
    setLabel: function (value, force) {
      if (force || (value !== this.options.label)) {
        if (this._set('label', value) !== this) {
          this._updateLabelDOM();
        }
      }
    },

    // Internals //

    _init: function (options) {
      this.inherited(arguments);

      if (this.options.label === null) {
        // When there's no label set, use what's on the DOM:
        this.options.label = $.trim(this.$element.find(SELECTOR_LABEL).text());
      }

      this.setLabel(this.options.label, true);
      this.setSelected(this.options.selected, true);

      this.$element.on('click', function (event) {
        event.preventDefault();
        this.$element.trigger(CUI.InnerRailToggle.EVENT_CLICK, [event, this]);
      }.bind(this));

      var $target = $(this.getTarget()),
          ariaControlsArray = [],
          $innerRail = $target.closest('.js-endor-inner-rail, .endor-Page-sidepanel--innerRail, .endor-Page-sidepanel');

      if ($innerRail.attr('id')) {
        ariaControlsArray.push($innerRail.attr('id'));
      }

      if ($target.attr('id')) {
        ariaControlsArray.push($target.attr('id'));
      }

      if (ariaControlsArray.length) {
        this.$element.attr('aria-controls', ariaControlsArray.join(' '));
      }
    },

    _updateLabelDOM: function () {
      var $label = this.$element.find(SELECTOR_LABEL);
      if ($label.length) {
        var label = '';
        if (this.options.selected && this.options.prefixSelected) {
          label = this.options.prefixSelected + ' ';
        } else if (!this.options.selected && this.options.prefixUnselected) {
          label = this.options.prefixUnselected + ' ';
        }
        label += this.options.label;
        $label.eq(0).text(label);
      }
    }

  });

  /**
   * Event emitted when the user clicks the toggle.
   *
   * @type {string}
   */
  CUI.InnerRailToggle.EVENT_CLICK = 'cui-inner-rail-toggle-click';

  CUI.Endor.util.registerWidget(CUI.InnerRailToggle);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_CLASSES = 'js-endor-navrail endor-Page-sidepanel endor-Page-sidepanel--navigation',
      THEME_DARK = 'dark',
      CLASS_DARK =  'coral--dark';

  CUI.OuterRail = new Class(/** @lends CUI.OuterRail# */{
    toString: 'OuterRail',
    extend: CUI.Closable,

    defaults: $.extend({},
      CUI.Closable.defaults,
      {
        generateBrand: false,
        brandOptions: null,
        theme: THEME_DARK
    }),

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the container that usually holds the shell application's navigation. Can
     * be set to generate a child <code>CUI.Brand</code> widget.
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.generateBrand=false] When set to true an anchor element will be inserted as the first child of the target element, to which a CUI.Brand instance will be bound.
     * @param {Object} [options.brandOptions=null] The options that the widget will forward to CUI.Brand on constructing it. See CUI.Brand for the available fields.
     * @param {theme} [options.theme="dark"] When set to 'dark' the widget will add the 'coral--dark' class to the target element.
     */
    construct: {
    },

    // Internals //

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
    },

    _setupElement: function () {

      this.$element.addClass(HTML_CLASSES);
      if (this.options.theme === THEME_DARK) {
        this.$element.addClass(CLASS_DARK);
      }

      // Accept just the attribute as 'true':
      this.options.generateBrand = !!this.options.generateBrand;
      if (this.options.generateBrand) {
        var $brand = $('<a></a>').prependTo(this.$element);
        new CUI.Brand($.extend(
            { element: $brand },
            { isClosed: false },
            this.options.brandOptions
        ));
      }
    },

    _updateDOM: function () {
      this.inherited(arguments);

      this.$element.attr({
        'aria-expanded': !this.options.isClosed,
        'aria-hidden': this.options.isClosed
      });
    }
  });

  CUI.Endor.util.registerWidget(CUI.OuterRail);

}(jQuery, this));

(function ($, window, undefined) {

  var SELECTOR_ICON = 'i.coral-Icon',

      CLASS_NAV = 'endor-BlackBar-nav',
      CLASS_ACTIVE = 'is-active',

      HTML_ICON = '<i class="coral-Icon coral-Icon--navigation"></i>';

  CUI.OuterRailToggle = new Class(/** @lends CUI.OuterRailToggle# */{
    toString: 'OuterRailToggle',
    extend: CUI.ShellWidget,

    // Public API //

    defaults: {
      isClosed: false,
      title: "Toggle Rail"
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a widget that reflects the closed state of the outer rail panel.
     *
     * Note that by itself, the OuterRailToggle will not show or hide a panel on being clicked. For that to happen and instance of CUI.Page must be loaded too.
     *
     * @constructs
     * @param {Object} options
     * @param {boolean} [isClosed=false] The initial rail state that the toggle should reflect. Use the <code>setIsClosed</code> method to update the toggle's state at a later time.
     * @param {string} [title="Toggle Rail"] The initial title for the toggle. Use the <code>setTitle</code> method to update the toggle's title at a later time.
     */
    construct: {
    },

    /**
     * Update the outer rail state that the toggle should reflect.
     * @param {boolean} value True when the outer rail is closed, false otherwise.
     */
    setIsClosed: function (value) {
      this.options.isClosed = value;
      this._updateDOM();
    },

    /**
     * Update toggle's title attribute.
     * @param {string} value The new title value to set.
     */
    setTitle: function (value) {
      this.options.title = value;
      this._updateDOM();
    },

    // Internals //

    _init: function (options) {

      this.options.title = this.$element.attr('title') || this.options.title;

      this.$element.addClass(CLASS_NAV);

      var icon = this.$element.children(SELECTOR_ICON);
      if (!icon.length) {
        this.$element.prepend(HTML_ICON);
      }

      this.$element.on('click', function (event) {
        event.preventDefault();
        this.$element.trigger(CUI.OuterRailToggle.EVENT_CLICK, [event, this]);
      }.bind(this));

      this._updateDOM();
    },

    _updateDOM: function() {
      this.$element.attr({
        'title': this.options.title,
        'aria-label': this.options.title
      });

      this.$element.toggleClass(CLASS_ACTIVE, !this.options.isClosed)
       .attr({
         'aria-pressed': !this.options.isClosed,
         'aria-expanded': !this.options.isClosed
       });
    }

  });

  /**
   * Event emitted when the user clicks the toggle. It is recommended to use CUI.OuterRailToggle.EVENT_CLICK instead of this literal.
   *
   * @event CUI.OuterRailToggle#cui-outer-rail-toggle-click
   */

  /**
   * The type of the event that is triggered when the toggle is clicked.
   * @type {string}
   */
  CUI.OuterRailToggle.EVENT_CLICK = 'cui-outer-rail-toggle-click';

  CUI.Endor.util.registerWidget(CUI.OuterRailToggle);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Panel-header endor-BlackBar',

      SELECTOR_NAV_TOGGLE = '.endor-BlackBar-nav',
      HTML_NAV_TOGGLE = '<button></button>',

      SELECTOR_BACK_BUTTON = '.endor-BlackBar-back',
      HTML_BACK_BUTTON =
          '<button class="endor-BlackBar-back js-endor-BlackBar-back" title="Back">' +
              '<i class="coral-Icon coral-Icon--chevronLeft"></i>' +
              '</button>',

      SELECTOR_TITLE = '.endor-BlackBar-title',
      HTML_TITLE =
          '<div role="heading" aria-level="1" class="endor-BlackBar-title">' +
              '</div>',

      SELECTOR_RIGHT_CONTENTS = '.endor-BlackBar-right',
      HTML_RIGHT_CONTENTS = '<div class="endor-BlackBar-right"></div>',

      CLASS_ITEM = 'endor-BlackBar-item',
      CLASS_ITEM_HIDEN_XS = 'u-coral-hiddenXS',
      CLASS_ITEM_TEXT = 'endor-BlackBar-item--text';

  CUI.BlackBar = new Class(/** @lends CUI.BlackBar# */{
    toString: 'BlackBar',
    extend: CUI.ShellWidget,

    defaults: {
      title: undefined,
      noNavToggle: false,
      noBackButton: false,
      noTitle: false,
      backButtonTitle: 'Back'
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc The BlackBar component is the part of the shell that goes over the main page. It usually holds the current page's title, a hamburger icon for toggling the outer rail, and a back button. Most of these items can be toggled off, and additional items can be added to the right hand side of the component.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.title=undefined] The initial title that should be set on the black bar. The black bar resolves the title element looking for the 'endor-Black-title' class. After initialization this option can be updated via the setTitle method.
     * @param {boolean} [options.noNavToggle=false] When raised, the widget will not generate a nav toggle at initialization time.
     * @param {boolean} [options.noBackButton=false] When raised, the widget will not generate a back button at initialization time.
     * @param {boolean} [options.noTitle=false] When raised, the widget will not generate a title at initialization time.
     */
    construct: function (options) {
    },

    /**
     * Update the black bar's title.
     * @param value {string} The new title to set.
     * @param [force] {Boolean} Used internally to force the widget to update the DOM even if the passed value is equal to the currently set title.
     */
    setTitle: function (value, force) {
      if (force || value != this.options.value) {
        if (this._set('title', value) !== this || force) {
          this._titleBar.html(CUI.Endor.util.escapeHtml(this.options.title || ''));
        }
      }
    },

    /**
     * Update the black bar's back button title.
     * @param value {string} The new back button title to set.
     * @param [force] {Boolean} Used internally to force the widget to update the DOM even if the passed value is equal to the currently set title.
     */
    setBackButtonTitle: function (value, force) {
      if (force || value != this.options.backButtonTitle) {
        if (this._set('backButtonTitle', value) !== this || force) {
          value = CUI.Endor.util.escapeHtml(this.options.backButtonTitle);
          this._backButton.attr({
            'aria-label': value,
            'title': value
          });
        }
      }
    },

    /**
     * Add an element to the right hand side of the bar.
     *
     * @param item {jQuery | string} The element to add.
     * @param options
     * @param options.isText {string} If true, marks up the element as text.
     * to the bar's right hand side.
     * @returns {jQuery} The element as it got added.
     */
    addItem: function (item, options) {

      var $container = this._rightContainer,
          isText = options && options.isText;

      item = $(item);
      item.addClass(CLASS_ITEM + (isText ? ' ' + CLASS_ITEM_TEXT : ''))
          .addClass(CLASS_ITEM_HIDEN_XS);

      $container.append(item);

      return item;
    },

    /**
     * Remove an element from the bar.
     *
     * @param item {jQuery | string} The element to remove.
     * @returns {jQuery} The element as it got removed.
     */
    removeItem: function (item) {
      item = this._rightContainer.find(item);
      return item.remove();
    },

    getRightContainer: function () {
      return this._rightContainer;
    },

    // Internals //

    _backButton: null,
    _titleBar: null,
    _rightContainer: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._setupElement();

      this._initLeftBarContents();
      this._initRightBarContents();
      this._initTitleBar();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);
    },

    _initLeftBarContents: function () {

      // Generate a nav toggle if need be:
      var navToggle = this.$element.find(SELECTOR_NAV_TOGGLE);
      if (!this.options.noNavToggle) {
        if (!navToggle.length) {
          navToggle = $(HTML_NAV_TOGGLE).prependTo(this.$element);
        }
        new CUI.OuterRailToggle({
          element: navToggle
        });
      }

      // Generate a back button if need be:
      this._backButton = this.$element.find(SELECTOR_BACK_BUTTON);
      if (!this._backButton.length && !this.options.noBackButton) {
        this._backButton = $(HTML_BACK_BUTTON).insertAfter(navToggle);
      }

      var backButtonTitle = this._backButton.attr('aria-label') || this._backButton.attr('title') || this.options.backButtonTitle;

      this.setBackButtonTitle(backButtonTitle, true);

      this._backButton.on('click', this._getRedispatchingHandler(CUI.BlackBar.EVENT_BACK_BUTTON_CLICK));
    },

    _initTitleBar: function () {
      var title = this.options.title;

      this._titleBar = this.$element.find(SELECTOR_TITLE);
      if (!this._titleBar.length && !this.options.noTitle) {
        this._titleBar = $(HTML_TITLE).appendTo(this.$element);
        this.setTitle(title, true);
      } else if (title === undefined) {
        title = this._titleBar.html();
        this.options.title = title;
      } else {
        this.setTitle(title, true);
      }

      this._titleBar.on('click', this._getRedispatchingHandler(CUI.BlackBar.EVENT_TITLE_CLICK)).on('keydown', function (event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
          event.preventDefault();
          $(event.target).trigger('click');
        }
      });
    },

    _initRightBarContents: function () {
      //Create the right content container if it doesn't exist yet.
      this._rightContainer = this.$element.find(SELECTOR_RIGHT_CONTENTS);
      if (!this._rightContainer.length) {
        this._rightContainer = $(HTML_RIGHT_CONTENTS).appendTo(this.$element);
      }
    },

    // Tools //

    _getRedispatchingHandler: function (type) {
      return function (event) {
        event.preventDefault();
        this.$element.trigger(type, [event, this]);
      }.bind(this);
    }

  });



  /**
   * Triggered when the user clicks the black bar title. It is recommended to use
   * CUI.BlackBar.EVENT_TITLE_CLICK instead of this literal.
   *
   * @event CUI.BlackBar#cui-blackbar-title-click.
   */

  /**
   * The type of the event that is triggered when the title bar is clicked.
   * @type {string}
   */
  CUI.BlackBar.EVENT_TITLE_CLICK = 'cui-blackbar-title-click';

  /**
   * Triggered when the user clicks the black bar back button. It is recommended to use
   * CUI.BlackBar.EVENT_BACK_BUTTON_CLICK instead of this literal.
   *
   * @event CUI.BlackBar#cui-blackbar-back-button-click
   */

  /**
   * The type of the event that is triggered when the back button is clicked.
   * @type {string}
   */
  CUI.BlackBar.EVENT_BACK_BUTTON_CLICK = 'cui-blackbar-back-button-click';

  CUI.Endor.util.registerWidget(CUI.BlackBar);

}(jQuery, this));

(function ($, window) {
  //Assign the appropriate requestAnimationFrame function to the global requestAnimationFrame.
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || null;

  var SELECTOR_NAVIGATION_VIEW = 'coral-NavigationView',
    SELECTOR_NAVIGATION_VIEW_BRAND_HEIGHT = 'coral-NavigationView--brandHeight',

    SELECTOR_COLUMN = 'coral-ColumnView',    
    SELECTOR_NAV_ELEMENT = 'coral-ColumnView--navigation',
    SELECTOR_NAV_CONTENT = 'coral-NavigationView-content',
    SELECTOR_NAV_CONTENT_SEARCH_BOX_HEIGHT = 'coral-NavigationView-content--searchBoxHeight',
    SELECTOR_COLUMN_BASE = 'coral-ColumnView-column',
    SELECTOR_NAV_COLUMN = 'coral-NavigationView-column',
    SELECTOR_NAV_COLUMN_CONTENT = 'coral-NavigationView-columnContent',
    SELECTOR_NAV_ITEM = 'coral-ColumnView-item',
    SELECTOR_NAV_ITEM_BACK = 'coral-ColumnView-item--back',
    SELECTOR_NAV_ITEM_TITLE = 'coral-ColumnView-item--title',
    SELECTOR_CORAL_ICON = 'coral-Icon',
    SELECTOR_NAV_ITEM_ICON = 'coral-ColumnView-icon',
    SELECTOR_NAV_FOLDER = 'coral-ColumnView-item--hasChildren',
    SELECTOR_NAV_ITEM_BACK_HEIGHT = 'coral-NavigationView-columnContent--backButtonHeight',
    SELECTOR_NAV_ITEM_BACK_HOME_HEIGHT = 'coral-NavigationView-columnContent--homeAndBackHeight',
    SELECTOR_LOADING_ICON = 'coral-Wait coral-Wait--large coral-Wait--center',
    
    SELECTOR_ACTIVE_COLUMN = 'is-active',
    SELECTOR_PREVIOUS_COLUMN = 'is-left',
    SELECTOR_NEXT_COLUMN = 'is-right',
    SELECTOR_SLIDING_COLUMN = 'is-sliding',

    DATA_TARGET_COLUMN = 'coralColumnviewTarget',
    DATA_TARGET_COLUMN_DASHERIZED = 'data-coral-columnview-target',
    DATA_COLUMN_ID = 'coralColumnviewId',
    DATA_COLUMN_ID_DASHERIZED = 'data-coral-columnview-id';

  CUI.NavigationView = new Class(/** @lends CUI.NavigationView# */{
    toString: 'NavigationView',
    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc This widget creates, manages and visualises tree structured data.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.jsonUrl=null] A reference to an external url for loading in json to this component.
     * @param {Object} [options.jsonData=null] A reference to an object that already contains the json menu structure.
     * @param {boolean} [options.searchEnabled=false] A flag to indicate whether navigation search is enabled or not.
     * @param {String} [options.searchPlaceholderText="Search Navigation"] The placeholder text for the searchBox.
     * @param {Function} [options.itemClickHandler=null] A custom item click handler for performing your own navigation.
     * @param {boolean} [options.accountForBrand=true] If a brand is present then this option will account for the brand height.
     */
    construct: function (options) {
      this._init(options);
    },

    defaults: {
      jsonUrl: null,          //Build from JSON supplied asynchronously.
      withCredentials: false, //Run all xhr requests with credentials.
      jsonData: null,         //Build from JSON passed into the constructor.
      searchEnabled: false,   //Enable Navigation Search
      searchPlaceholderText: "Search Navigation", //Text to display as a placeholder for navigation.
      itemClickHandler: null,  //A custom item selection handler.
      accountForBrand: true    //Account for the height of the brand
    },

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {

      if (options.jsonData && $.type(options.jsonData) === "string") {
        //Transform the global object string into an actual object.
        this.options.jsonData = window[options.jsonData];
      }

      this.$element.addClass(SELECTOR_NAVIGATION_VIEW);  
      
      if (this.options.accountForBrand){
        this.$element.addClass(SELECTOR_NAVIGATION_VIEW_BRAND_HEIGHT);
      }

      // Build out the components if they don't exist yet and all all associated event listeners.
      this._initSearchBox();
      this._initNavElement();

      this._applyOptions();
    },

    /**
     * A reference to the home column (the one that you navigate to when clicking the marketing cloud logo).
     * @private
     */
    _homeColumnId: null,

    /**
     * A reference to the current columns id.
     * @private
     */
    _currentColumnId: null,

    /**
     * A reference to the target column id.
     * @private
     */
    _targetColumnId: null,

    /**
     * A hashmap of all nested lists with an associated id.
     * @private
     */
    _jsonColumnCache: {},

    /**
     * An array of items that can be searched on.
     * @private
     */
    _searchableItems: [],

    /**
     * Generate the menu from JSON that was passed in or do an ajax request with the json url that was
     * provided.
     * @private
     */
    _applyOptions: function () {
      if (this.options.jsonData) {
        this._applyJSONData(this.options.jsonData);
      } else if (this.options.jsonUrl) {
        var wait = $(document.createElement('div')).addClass(SELECTOR_LOADING_ICON).appendTo(this.$navElement),
          ajaxOptions = { url: this.options.jsonUrl };

        if (this.options.withCredentials){
          ajaxOptions.xhrFields = { withCredentials: true };
        }

        $.ajax(ajaxOptions).done(function (data) {
          this.updateJSONData(data);
        }.bind(this))
        .always(function () {
          wait.remove();
        });
      }
    },

    /**
     * Completely create a new menu from JSON.
     * @param {Object} data The new menu model object.
     */
    updateJSONData: function (data) {
      //Remove any cached data associated with the last json array.
      this._currentColumnId = null;
      this._targetColumnId = null;
      this._homeColumnId = null;
      this._jsonColumnCache = {};

      //Remove every column view container from the view.
      this.$navElement.empty();

      //Set the new jsonData
      this.options.jsonData = data;
      this._applyJSONData(data);
    },

    /**
     * Transitions to the home menu.
     */
    navigateHome: function () {
      if (this._currentColumnId === this._homeColumnId) { return; }
      
      var currentColumn = this.$element.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._currentColumnId + '"]'),
          homeColumn = this.$element.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._homeColumnId + '"]');

      // Store a reference to the target column id so that it will become the current column id on transition end.
      this._targetColumnId = this._homeColumnId;

      if (homeColumn.length) {
        this._performNavNextFrame(currentColumn, homeColumn, true);
      } else if (this._getTargetColumnJSON(this._homeColumnId)) { //Navigate to a json column.
        //The column doesn't yet exist so we need to re-create it and then navigate in the next frame.
        this._targetJSONColumnData = this._getTargetColumnJSON(this._homeColumnId);
        homeColumn = this._createColumnViewFromJSON(this._targetJSONColumnData, SELECTOR_PREVIOUS_COLUMN);
        this._performNavNextFrame(currentColumn, homeColumn, true);
      }
    },

    // Internals //

    /**
     * Create the initial column from JSON.
     * @param jsonData
     * @private
     */
    _applyJSONData: function (jsonData) {
      jsonData.id = 'json_' + CUI.util.getNextId();
      this._jsonColumnCache[jsonData.id] = jsonData; //Make sure to add the list to the json cache
      this._homeColumnId = jsonData.id; //This will be the home column.

      //massage the data so that it has a parent and enough data to create a back button.
      this._initJSONData(jsonData, jsonData.children);

      if (this._currentColumnId) {
        this._createColumnViewFromJSON(this._jsonColumnCache[this._currentColumnId], SELECTOR_ACTIVE_COLUMN);
      } else {
        this._createColumnViewFromJSON(jsonData, SELECTOR_ACTIVE_COLUMN);
      }
    },

    /**
     * Create the coral-ColumnView--navigation element if it doesn't exist yet and assign all associated
     * event listeners.
     * @private
     */
    _initNavElement: function () {
      this.$navElement = this.$element.find('.' + SELECTOR_NAV_ELEMENT);
      //Create the navigation list if it doesn't exist yet.
      if (!this.$navElement.length) {
        this.$navElement = $('<div></div>')
          .addClass(SELECTOR_COLUMN)
          .addClass(SELECTOR_NAV_ELEMENT)
          .appendTo(this.$element);
      }

      this.$navElement.addClass(SELECTOR_NAV_CONTENT);

      if (this.options.searchEnabled){
        //Account for the search box within the columns
        this.$navElement.addClass(SELECTOR_NAV_CONTENT_SEARCH_BOX_HEIGHT);
      }

      //Assign a listener to the navigation element for going back and forth.
      this.$navElement.on('click', '.' + SELECTOR_NAV_ITEM, function (e) {
        var activator = $(e.currentTarget);
        if (activator.data(DATA_TARGET_COLUMN) || activator.hasClass(SELECTOR_NAV_FOLDER)) {
          e.preventDefault();
          this._navigateColumnView(activator);
        } else {
          //Change the visual selection.
          this._selectItemHandler(activator);

          if (this.options.itemClickHandler) {
            //Prevent the link event from firing and allow call the callback with the item and the associated
            //data if there is any.
            e.preventDefault();

            this.options.itemClickHandler.apply(this, [e, this._selectedItem]);
          }
        }
      }.bind(this));
    },

    /**
     * Find the current and target columns if they exist. Otherwise, either create a column from a data cache or load
     * the columns data asynchronously. If columns are loaded asynchronously a loader will be displayed to the user
     * until the column has completed loading and is added to the DOM. Once both the current and target columns are in
     * view call performNav or performNavNextFrame to provide the actual navigation.
     *
     * @param activator
     * @private
     */
    _navigateColumnView: function (activator) {
      var columnView = activator.closest('.' + SELECTOR_COLUMN),
          currentColumn = activator.closest('.' + SELECTOR_COLUMN_BASE),
          targetId = activator.data(DATA_TARGET_COLUMN),
          isBack = activator.hasClass(SELECTOR_NAV_ITEM_BACK),
          targetColumn = columnView.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + targetId + '"]');

      //Store a reference to the current column id
      this._currentColumnId = currentColumn.data(DATA_COLUMN_ID);
      this._targetColumnId = targetId;

      //If we haven't created a reference yet to the home column then this column should be it.
      if (!this._homeColumnId) {
        this._homeColumnId = this._currentColumnId;
      }

      if (targetColumn.length) {
        this._performNavNextFrame(currentColumn, targetColumn, isBack);
      } else if (this._getTargetColumnJSON(targetId)) { //Navigate to a json column.
        this._targetJSONColumnData = this._getTargetColumnJSON(targetId);
        targetColumn = this._createColumnViewFromJSON(this._targetJSONColumnData, isBack ? SELECTOR_PREVIOUS_COLUMN : SELECTOR_NEXT_COLUMN);
        this._performNavNextFrame(currentColumn, targetColumn, isBack);
      } else if (activator.prop('href')) {
        //Make an async call to get the next column
        var wait = $('<div></div>').addClass(SELECTOR_LOADING_ICON).appendTo(currentColumn);
        $.get(activator.prop('href')).done(function (data) {
              //If html was returned it will be of type string.
              if ($.type(data) === "string") {
                targetColumn = $(data).addClass(SELECTOR_NEXT_COLUMN).appendTo(columnView);
              } else {
                var jsonData = data;
                jsonData.id = targetId;
                //The back button is created from a json object. In this case we need to derive that data
                //from the button that ws clicked on and then merge it with the current object.
                jsonData = $.extend(jsonData, this._getBackButtonDataFromButton(activator));

                this._initJSONData(jsonData, jsonData.children);

                this._jsonColumnCache[targetId] = jsonData; //Make sure to add the list to the json cache
                targetColumn = this._createColumnViewFromJSON(jsonData, isBack ? SELECTOR_PREVIOUS_COLUMN : SELECTOR_NEXT_COLUMN);
              }
              this._performNavNextFrame(currentColumn, targetColumn, isBack);
            }.bind(this))
            .always(function () {
              wait.remove(); //Remove the wait indicator
            });
      }
    },

    /**
     * This is where all the magic happens. The css for the navigation consists of elements that are positioned
     * to the right and left of the current element and an active element.
     * @param currentColumn
     * @param targetColumn
     * @param isBack
     * @private
     */
    _performNav: function (currentColumn, targetColumn, isBack) {
      // used to clear all the added classes
      var transitionEvent = this._getTransitionEvent(),
        self = this,
        onSlideEnd = function(event) {
          $(event.currentTarget).off(transitionEvent, onSlideEnd);
          self._removeColumnAnimation($(event.currentTarget));
          self._onNavComplete();
        };

      this._addCurrentColumnAnimation(currentColumn, isBack);
      this._addTargetColumnAnimation(targetColumn, isBack);

      // listens to transition end to remove all the added classes
      //The transition end event is used for removing the last json column to keep things light. It also changes
      //both the current and target column id's.
      if (transitionEvent){
        currentColumn.on(transitionEvent, onSlideEnd);
        targetColumn.on(transitionEvent, onSlideEnd);
      } else {
        self._removeColumnAnimation(currentColumn);
        self._removeColumnAnimation(targetColumn);
        this._onNavComplete();
      }
    },

    _addTargetColumnAnimation: function(column, isBack) {
      // remove any previous animations
      this._removeColumnAnimation(column);

      //The target column will become the new active column.
      column.addClass(SELECTOR_ACTIVE_COLUMN);

      // is-sliding class enables the css transition.
      column.addClass(SELECTOR_SLIDING_COLUMN);
    },

    _addCurrentColumnAnimation: function(column, isBack){
      // remove any previous animations
      this._removeColumnAnimation(column);

      //Remove the active class from the current column
      column.removeClass(SELECTOR_ACTIVE_COLUMN);

      // Add the new location
      if (isBack) {
        column.addClass(SELECTOR_NEXT_COLUMN);
      } else {
        column.addClass(SELECTOR_PREVIOUS_COLUMN);
      }

      // is-sliding class enables the css transition.
      column.addClass('is-sliding');
    },

    _removeColumnAnimation: function(column){
      column.removeClass(SELECTOR_SLIDING_COLUMN + ' ' + SELECTOR_PREVIOUS_COLUMN + ' ' + SELECTOR_NEXT_COLUMN);
    },

    /**
     * An element that is first added to the DOM will not transition even if it has an is-right or is-left state
     * assigned to it because it has not yet been drawn to the DOM. The best way to tell if the DOM has been repainted
     * is to use requestAnimationFrame. This method is called directly before a repaint. In this case we will use
     * requestAnimationFrame twice because the first time it is called will be before an animation has happend. The
     * second time will be directly before the next repaint at which time we can call performNav.
     *
     * @param currentColumn
     * @param targetColumn
     * @param isBack
     *
     * @private
     */
    _performNavNextFrame: function (currentColumn, targetColumn, isBack) {
      if (window.requestAnimationFrame) {
        var animationStart = null,
            performNav = function (timestamp) {
              //If animationStart is null then this is the first time that this method has
              //been called by requestAnimationFrame. This means that a repaint has not happend
              //yet. Call requestAnimationFrame one more time and we can be sure that the new
              //components that were added have been drawn.
              if (animationStart === null) {
                animationStart = timestamp;
                window.requestAnimationFrame(performNav.bind(this));
              } else {
                this._performNav(currentColumn, targetColumn, isBack);
              }
            };

        // add the correct class as an initial state
        targetColumn.removeClass(SELECTOR_NEXT_COLUMN + ' ' + SELECTOR_PREVIOUS_COLUMN + ' ' + SELECTOR_SLIDING_COLUMN);
        if(isBack) {
          targetColumn.addClass(SELECTOR_PREVIOUS_COLUMN);
        } else {
          targetColumn.addClass(SELECTOR_NEXT_COLUMN);
        }

        //An animation frame is is called right before a repaint.
        //Since we want this to happen after a repaint we are actually going
        //to call this twice.
        window.requestAnimationFrame(performNav.bind(this));
      } else {
        //If requestAnimationFrame does not exist (IE9) then call _performNav immediately.
        this._performNav(currentColumn, targetColumn, isBack);

        //Call onNavComplete directly because the transitionend event will not exist.
        this._onNavComplete();
      }
    },

    /**
     * Listener for the native transitionend event that fires after a css transitino has completed. This handler
     * removes the last json column from the DOM.
     *
     * @param event
     * @private
     */
    _onNavComplete: function () {
      var column = this.$navElement.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._currentColumnId + '"]');

      if (this._targetColumnId && column.data(DATA_COLUMN_ID) === this._currentColumnId) {
        //Remove any json menus that we added.
        if (this._jsonColumnCache[this._currentColumnId]) {
          column.remove();
        }

        //The current column now becomes the target column.
        this._currentColumnId = this._targetColumnId;
        this._targetColumnId = null;
      }
    },

    /**
     * Deselect the last item and select a new item. This is very important for Single Page Applications where there
     * is no page refresh to indicate a menu change.
     * @param activator
     * @private
     */
    _selectItemHandler: function (activator) {
      //Unselect the current JSON item.
      if (this._selectedItem) {
        this._selectedItem.selected = false;
      }

      //Find the new json item within the current json column if there is one.
      if (this._currentColumnId && this._jsonColumnCache[this._currentColumnId]) {
        var columnData = this._jsonColumnCache[this._currentColumnId],
            itemText = activator.text(),
            itemData;

        for (var i = 0; i < columnData.children.length; i++) {
          itemData = columnData.children[i];
          if (itemData.name == itemText) {
            this._selectedItem = itemData;
            this._selectedItem.selected = true;
            break;
          }
        }
      }

      //deselect the current item visually if there is one.
      this.$navElement.find('.' + SELECTOR_NAV_ITEM + '.' + SELECTOR_ACTIVE_COLUMN).removeClass(SELECTOR_ACTIVE_COLUMN);

      //Select the item that was just clicked on.
      activator.addClass(SELECTOR_ACTIVE_COLUMN);
    },

    /*
     ----------------------------------------------------------------------------------------------------------
     JSON COLUMN LOGIC
     ----------------------------------------------------------------------------------------------------------
     */

    /**
     * Look for a column in the json cache. If one exists then return it immediately. Otherwise, look through the
     * children of the currently selected column and find the next column, put it in the cache, and then return
     * the results.
     *
     * @param targetId
     * @returns {*}
     * @private
     */
    _getTargetColumnJSON: function (targetId) {
      if (this._jsonColumnCache[targetId]) {
        return this._jsonColumnCache[targetId];
      } else {
        var currentColumnJSON = this._jsonColumnCache[this._currentColumnId],
            targetColumnJSON,
            listItem;

        if (!currentColumnJSON) {
          return null;
        }

        for (var i = 0; i < currentColumnJSON.children.length; i++) {
          listItem = currentColumnJSON.children[i];
          if (listItem.id == targetId) {
            targetColumnJSON = listItem;
            //Cache the results so that we don't have to do this every-time they come to this list item.
            this._jsonColumnCache[targetId] = targetColumnJSON;
            break;
          }
        }
        return targetColumnJSON;
      }
    },

    /**
     * Generate a new column from a JSON object.
     * @param columnJSON
     * @param state
     * @returns {appendTo|*}
     * @private
     */
    _createColumnViewFromJSON: function (columnJSON, state) {
      var self = this,
        columnView = $('<div></div>')
          .addClass(SELECTOR_NAV_COLUMN)
          .addClass(SELECTOR_COLUMN_BASE)
          .addClass(state)
          .attr(DATA_COLUMN_ID_DASHERIZED, columnJSON.id);

      if (columnJSON.homeColumnId) {
        columnView.append(this._createHomeButtonFromJSON(columnJSON));
      }

      if (columnJSON.parentColumnId || columnJSON.backButtonLink) {
        columnView.append(this._createBackButtonFromJSON(columnJSON));
      }
      
      return columnView
        .append(function(){
          var columnContent = $('<div></div>').addClass(SELECTOR_NAV_COLUMN_CONTENT);
          if (columnJSON.homeColumnId && (columnJSON.parentColumnId || columnJSON.backButtonLink)) {
            columnContent.addClass(SELECTOR_NAV_ITEM_BACK_HOME_HEIGHT);
          } else if (columnJSON.homeColumnId || columnJSON.parentColumnId || columnJSON.backButtonLink) {
            columnContent.addClass(SELECTOR_NAV_ITEM_BACK_HEIGHT);
          }

          
          columnJSON.children.forEach(function(columnViewItem){
            columnContent.append(self._createColumnViewItemFromJSON(columnViewItem));
          });

          return columnContent;
        })
        .appendTo(this.$navElement);
    },

    /**
     * Generate a back button from the data provided. NOTE: This data is generated inside the _initJSONData method.
     * @param columnJSON
     * @returns {string}
     * @private
     */
    _createBackButtonFromJSON: function (columnJSON) {
      var backButton = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .addClass(SELECTOR_NAV_ITEM_BACK)
        .addClass(SELECTOR_NAV_ITEM_TITLE)
        .text(columnJSON.backButtonLabel);
        
      if (columnJSON.backButtonIcon) {
        backButton.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnJSON.backButtonIcon)
        );
      }

      if (columnJSON.parentColumnId) {
        backButton.attr(DATA_TARGET_COLUMN_DASHERIZED, columnJSON.parentColumnId);
      }

      if (columnJSON.backButtonLink) {
        backButton.attr('href', columnJSON.backButtonLink);
      }

      return backButton;
    },

    /**
     * Generate the html for each nav button. Add an icon if the item has an associated icon.
     * @param columnViewItem
     * @private
     */
    _createColumnViewItemFromJSON: function (columnViewItem) {
      var columnView = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .text(columnViewItem.name);

      if (columnViewItem.selected && !columnViewItem.children) { columnView.addClass(SELECTOR_ACTIVE_COLUMN); }
      if (columnViewItem.children) { columnView.addClass(SELECTOR_NAV_FOLDER); }
      if (columnViewItem.url) { columnView.attr('href', columnViewItem.url); }
      if (columnViewItem.id) { columnView.attr(DATA_TARGET_COLUMN_DASHERIZED, columnViewItem.id); }
      if (columnViewItem.tooltip) { columnView.attr('title', columnViewItem.tooltip); }
      if (columnViewItem.icon) {
        columnView.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnViewItem.icon)
        );
      }

      return columnView;
    },

    /**
     * Generate a menuHome button. NOTE: This is data centric and will only apply if users have set a menuHome
     * flag within the parent lists data set.
     *
     * @param columnJSON
     * @returns {string}
     * @private
     */
    _createHomeButtonFromJSON: function (columnJSON) {
      var homeButton = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .addClass(SELECTOR_NAV_ITEM_BACK)
        .addClass(SELECTOR_NAV_ITEM_TITLE)
        .attr(DATA_TARGET_COLUMN_DASHERIZED, columnJSON.homeColumnId)
        .text(columnJSON.homeColumnLabel);

      if (columnJSON.homeColumnIcon) {
        homeButton.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnJSON.homeColumnIcon)
        );
      }

      return homeButton;
    },

    /**
     * If a JSON menu was created by clicking on an existing DOM element we want to generate the back button data
     * by getting that button, finding its text, icon and other data associated with it and then assigning it to
     * the JSON item. This data will be used to create the actual back button.
     *
     * @param target
     * @returns {{parentColumnId: (null|_currentColumnId), backButtonLabel: *, backButtonIcon: string}}
     * @private
     */
    _getBackButtonDataFromButton: function (target) {
      var $target = $(target),
          backButtonData = {
            parentColumnId: this._currentColumnId,
            backButtonLabel: $target.text(),
            backButtonIcon: ''
          },
          btnIcon = $(target).find('.' + SELECTOR_NAV_ITEM_ICON),
          backButtonIcon;

      if (btnIcon.length > 0) {
        backButtonIcon = btnIcon.attr('class');
        backButtonIcon = backButtonIcon.replace(SELECTOR_NAV_ITEM_ICON, ''); //Get rid of everything except the icon class. The others will be added dynamically.
        backButtonIcon = backButtonIcon.replace(SELECTOR_CORAL_ICON, '');
        backButtonData.backButtonIcon = $.trim(backButtonIcon);
      }

      return backButtonData;
    },

    /**
     * Recursively go through each item in the JSON menu and assign a parent, setup a backbutton, create a unique id,
     * add a menuHome button if a parent has that flag set, and cache the results for easy retrieval of the menu and
     * for searchability of menu options.
     *
     * @param parentColumnData
     * @param columnData
     * @param menuHome
     * @private
     */
    _initJSONData: function (parentColumnData, columnData, menuHome) {
      //Create a reference to the parent in each child in order to build menus both forwards and backwards.
      for (var i = 0; i < columnData.length; i++) {
        var listItem = columnData[i];

        if (parentColumnData) {
          listItem.parentColumnId = parentColumnData.id;
          listItem.backButtonLabel = listItem.name;
          listItem.backButtonIcon = listItem.icon;
        }

        if (menuHome) {
          listItem.homeColumnId = menuHome.id;
          listItem.homeColumnLabel = menuHome.homeMenuLabel || menuHome.name;
          listItem.homeColumnIcon = menuHome.homeMenuIcon || '';
        }

        if (listItem.children) {
          listItem.id = 'json_' + CUI.util.getNextId();

          if (listItem.selected) {
            this._currentColumnId = listItem.id;
          }

          this._jsonColumnCache[listItem.id] = listItem;
          this._initJSONData(listItem, listItem.children, listItem.isMenuHome ? listItem : menuHome);
        } else {
          if (listItem.selected) {
            this._currentColumnId = parentColumnData.id || this._currentColumnId;
            this._selectedItem = listItem;  
          }

          this._searchableItems.push(listItem);
        }
      }
    },

    /**
     * Make sure to get the appropriate vendor prefixed transition end event.
     * @private
     */
    _getTransitionEvent: function (){
      var t,
        el = this.$navElement.get(0),
        transitions = {
          'WebkitTransition' :'webkitTransitionEnd',
          'MozTransition'    :'transitionend',
          'MSTransition'     :'msTransitionEnd',
          'OTransition'      :'oTransitionEnd',
          'transition'       :'transitionEnd'
        };

      for(t in transitions){
        if( el.style[t] !== undefined ){
          return transitions[t];
        }
      }

      return null;
    },

    /**
     * Search is an optional feature that most solutions won't have. You can enable search by setting data-search-enabled to
     * true. By default this option is set to false. The Analytics team has been authorized by Alan to enable searching
     * the menu for different navigation options because of how deep our menu can be. This may also be a need for other
     * teams and can easily be enabled if desired. Please talk to Alan before turning data-search-enabled to true. NOTE:
     * because this is an optional feature I have added everything to it's own closure so that it is obvious where the
     * code is for searching on different menu options.
     * @private
     */
    _initSearchBox: function () {
      if (this.options.searchEnabled) {
        var filteredList = null,
            searchBox = this.$element.find('.coral-ColumnView-searchbox'),
            searchField = searchBox.find('.coral-Textfield'),
            clearSearchButton = searchBox.find(''),
            searchList = null,
            searchListContent = null,
            searchText = '',
            cursorIndex = 1,
            currentItem = null,
            $this = this,

            init = function () {
              if (!searchBox.length) {
                searchBox = $([
                  '<div class="coral-ColumnView-item coral-ColumnView-item--searchBox">',
                    '<div class="coral-DecoratedTextfield coral-NavigationView-DecoratedTextfield">',
                      '<i class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search"></i>',
                      '<input placeholder="' + $this.options.searchPlaceholderText + '" type="text" class="coral-DecoratedTextfield-input coral-Textfield">',
                      '<button type="button" class="coral-DecoratedTextfield-button coral-MinimalButton" style="display:none;">',
                        '<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>',
                      '</button>',
                    '</div>',
                  '</div>'
                ].join('')).appendTo($this.$element);

                searchField = searchBox.find('.coral-Textfield');
                clearSearchButton = searchBox.find('.coral-DecoratedTextfield-button');
              }

              searchField.on("keydown", onKeyDown);
              searchField.on("keyup", onKeyUp);

              //Add a clear event listener.
              clearSearchButton.on("click", function () {
                clearSearch();
                searchField.focus();
              });

              //Add a hotkey for getting into the search box.
              $(document).bind('keyup', function (evt) {
                if (evt.target.tagName.toLowerCase() !== "input" &&
                    evt.target.tagName.toLowerCase() !== "textarea" &&
                    evt.keyCode == 191) { //forward slash
                  searchField.focus();
                }
              });
            },

            onKeyDown = function (event) {
              switch (event.keyCode) {
                case 38 : // up
                  event.preventDefault();
                  if (searchText !== "") {
                    if (cursorIndex > 1) {
                      cursorIndex -= 1;
                    } else {
                      cursorIndex = filteredList.length;
                    }
                    updateCursorIndex();
                  }
                  break;
                case 40 : // down
                  event.preventDefault();
                  if (searchText !== "") {
                    if (cursorIndex < filteredList.length) {
                      cursorIndex += 1;
                    } else {
                      cursorIndex = 1;
                    }
                    updateCursorIndex();
                  }
                  break;
                case 13 : //enter
                  event.preventDefault();
                  if (cursorIndex > 0 && filteredList.length) {
                    window.location.href = filteredList[cursorIndex - 1].url;
                  }
                  break;
                case 27 : //esc
                  //Remove the cursor from the search input.
                  clearSearch();
                  searchField.blur();
                  break;
              }
            },

            onKeyUp = function (event) {
              event.stopPropagation();
              var newVal = $(event.target).val();

              if (newVal != searchText) {
                searchText = newVal;
                currentItem = null;

                //If the searchList hasn't been created yet then make sure to create it.
                searchList = searchList ||
                  $('<div></div>')
                    .addClass(SELECTOR_NAV_COLUMN)
                    .addClass(SELECTOR_COLUMN_BASE)
                    .addClass(SELECTOR_ACTIVE_COLUMN)
                    .css('display', 'none')
                    .append(
                      $('<div></div>').addClass(SELECTOR_NAV_COLUMN_CONTENT)
                    )
                    .appendTo($this.$navElement);

                searchListContent = searchListContent || searchList.find('.' + SELECTOR_NAV_COLUMN_CONTENT);

                if (searchText === "") {
                  clearSearchButton.hide();
                  hideSearchList();
                } else {
                  clearSearchButton.show();
                  //Update the actual filtered list of elements.
                  updateFilteredList();

                  //The z-index will always be 1 if the list length is greater than 1.
                  cursorIndex = filteredList.length ? 1 : 0;

                  //Remove all items from the list.
                  searchListContent.empty();

                  //Now add all of the new items to the list.
                  for (var i = 0; i < filteredList.length; i++) {
                    var item = filteredList[i],
                      itemCls = SELECTOR_NAV_ITEM + ((i == cursorIndex - 1) ? ' ' + SELECTOR_ACTIVE_COLUMN : ''),
                      searchItem = $('<a></a>')
                        .addClass(itemCls)
                        .attr('href', item.url)
                        .text(item.name);

                    if (item.tooltip) { searchItem.attr('title', item.tooltip); }

                    searchListContent.append(searchItem);
                  }

                  displaySearchList();
                }
              }
            },

            clearSearch = function () {
              searchText = "";
              searchField.val('');
              clearSearchButton.hide();
              hideSearchList();
            },

            displaySearchList = function () {
              searchList.css('display', 'block');

              //Hide the current list
              $this.$element
                  .find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + $this._currentColumnId + '"]')
                  .css('display', 'none');
            },

            hideSearchList = function () {
              $this.$element
                  .find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + $this._currentColumnId + '"]')
                  .css('display', 'block');

              if (searchList) {
                //Hide the search list
                searchList.css('display', 'none');  
              }
            },

            updateCursorIndex = function () {
              currentItem = currentItem || searchList.find('.' + SELECTOR_NAV_ITEM + '.' + SELECTOR_ACTIVE_COLUMN);
              if (currentItem) {
                currentItem.removeClass(SELECTOR_ACTIVE_COLUMN);
              }

              currentItem = searchList.find('.' + SELECTOR_NAV_ITEM + ':nth-child(' + cursorIndex + ')');
              currentItem.addClass(SELECTOR_ACTIVE_COLUMN);
            },

            updateFilteredList = function (isAdd) {
              //Filter the items.
              filteredList = $this._searchableItems.filter(function (item) {
                //Get the lowercase version of the item name.
                var itemName = $.type(item.name) == "string" ? item.name.toLowerCase() : '',
                    score = 0,
                    char,
                    j = 0, // remembers position of last found character
                    nextj;

                // consider each search character one at a time providing a fuzzy match.
                for (var i = 0; i < searchText.length; i++) {
                  char = searchText[i].toLowerCase();
                  if (char == ' ') continue;     // ignore spaces

                  nextj = itemName.indexOf(char, i === 0 ? j : j + 1);   // search for character & update position
                  score += (nextj - j) * (i === 0 ? 1 : 3); //Figure out the gap between characters and multiply the result by three if it is not the first char.
                  j = nextj;
                  if (j == -1) return false;  // if it's not found, exclude this item
                }

                //increase the score based on the overall item length
                score = score + (itemName.length - j);

                //Increase the score by 100 if the text doesn't have an exact match.
                if (itemName.indexOf(searchText) === -1) score += 100;

                item.score = score;
                return true;
              });

              //Now sort all of the filtered items according to their score.
              filteredList.sort(function (a, b) {
                if (a.score > b.score)
                  return 1;
                if (a.score < b.score)
                  return -1;
                // a must be equal to b
                return 0;
              });
            };

        init();
      }
    }
  });

  CUI.Widget.registry.register('navigationView', CUI.NavigationView);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.NavigationView.init($('[data-init~="navigation-view"]', event.target));
    });
  }

  // When this code gets moved out of the shell repository, then this line needs
  // to stay behind, to be called *after* the widget gets defined:
  CUI.ShellWidgetMixin.applyTo(CUI.NavigationView);

}(jQuery, this));

(function ($, window, undefined) {
  CUI.ColumnView = new Class(/** @lends CUI.ColumnView# */{
    toString: 'ColumnView',
    extend: CUI.ShellWidget,

    /**
     * @extends CUI.ShellWidget
     * @classdesc this widget enables column view features
     * <div class="coral-ColumnView" data-init="columnview">
     *    <div class="coral-ColumnView-column">
     *    </div>
     *    <div class="coral-ColumnView-column">
     *    </div>
     * </div>
     * @example
     * <caption>Instantiate with Class</caption>
     * var columnview = new CUI.ColumnView({
         *     element: '#myColumnView'
         * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myColumnView').ColumnView();
     *
     * @example
     * <caption>Markup</caption>
     * todo
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
    },

    defaults: {
      url: '{+path}',
      path: '',
      wrapLabels: true // wrap long labels
    },

    /**
     * Get the selected items. This does not include the breadcrumb items of other columns.
     * @return {jQuery}
     */
    getSelectedItems: function () {
      return this.getActiveColumn().children('.is-selected');
    },

    /**
     * Get the paths of the selected items. This does not include the breadcrumb items of other columns.
     * @return {String[]}
     */
    getSelectedPaths: function () {
      var paths = [];
      this.getSelectedItems().each(function () {
        paths.push($(this).data('path'));
      });
      return paths;
    },

    /**
     * Get the items of the breadcrumb i.e. selected items not located in the active column.
     * @return {jQuery}
     */
    getBreadcrumbItems: function () {
      return this.getActiveColumn().prevAll().children('.is-selected');
    },

    /**
     *
     * @param path
     */
    selectItemByPath: function (path, selectBreadcrumb) {
      //todo: different column (simply find?), load missing levels (or extra method loadPath?)
      var $item = this.getActiveColumn().children('.coral-ColumnView-item[data-path="' + path + '"]');

      this._setActiveColumn($item, false);
      $item.addClass('is-selected');

      //todo: breadcrumb
    },

    checkItemByPath: function (path, selectBreadcrumb) {
      //todo
    },

    /**
     * Get the active column.
     * @return {jQuery}
     */
    getActiveColumn: function () {
      return this.$element.children('.is-active');
    },

    /**
     * Get the column where actions like adding or pasting items will be applied to. If a single folder is selected
     * this would be the sub column and otherwise the active column.
     * @return {jQuery}
     */
    getTargetColumn: function () {
      var activeColumn = this.getActiveColumn();
      var items = this.getSelectedItems().filter(':not(.is-checked)');
      if (items.length === 1 && items.hasClass('coral-ColumnView-item--hasChildren')) {
        return activeColumn.next();
      } else {
        return activeColumn;
      }
    },

    _init: function (options) {
      this.inherited(arguments);

      if (this.options.path) {
        // only load a column if a path is provided; otherwise the initial column is provided by markup
        var $column = this._addColumn();
        $column.addClass('is-active');
        this._loadColumn($column, this.options.url, this.options.path);
      } else {
        // remove (empty) text nodes to avoid spacing between columns
        this.$element.contents().filter(function () {
          return this.nodeType === 3;
        }).remove();

        this._wrapLabels(this.$element.children('.coral-ColumnView-column'));
      }

      if (!this.$element.hasClass('coral-ColumnView--navigation')) {
        // select: tap the text: single selection
        this.$element.on('click', '.coral-ColumnView-item', this._selectItemHandler.bind(this));

        // check: tap the icon: multiple selection
        this.$element.on('click', '.coral-ColumnView-icon', this._checkItemHandler.bind(this));
      }
    },

    /**
     * Adds a new column to the ColumnView.
     * @return {jQuery}
     * @private
     */
    _addColumn: function () {
      var $column = $('<div class="coral-ColumnView-column"><div class="wait small center"></div></div>');
      this.$element.append($column);
      return $column;
    },

    /**
     * Sets the response of <code>url</code> as content of the given column. The response must be contain a
     * <code>coral-ColumnView-column</code>. The inner HTML of this element will be used (but not the column
     * itself).
     * @param {jQuery} $column The column
     * @param {String} url The URL with a placeholder for the path: <code>{+path}</code>
     * @param {String} path The path injected to <code>url</code>
     * @example
     * //todo: finalize
     * <!DOCTYPE html>
     * <html lang="en">
     *    <head></head>
     *    <body>
     *       <div class="coral-ColumnView-column">
     *           <a class="coral-ColumnView-item" href="#" data-path="...">
     *              <i title="" class="coral-ColumnView-icon icon-file small"></i>
     *              Name
     *           </a>
     *       </div>
     *    </body>
     * </html>
     * @private
     */
    _loadColumn: function ($column, url, path) {
      var columnView = this;
      $.ajax({
        url: url.replace("{+path}", path)
      }).done(function (data) {
        var $loadedColumn = $('<div />').append(data).find('.coral-ColumnView-column');

        $column.html($loadedColumn.html());
        $column.addClass($loadedColumn.attr("class"));

        columnView._wrapLabels($column);

      }).always(function () {
        $column.children('.wait').remove();
        columnView.$element.trigger("loadcolumn", $column, path);
      });
    },

    /**
     * Checks each label of the given column if it does overflow the column. If yes and {{this.option.wrapLabels}}
     * is {{true}} the class {{coral-ColumnView-item--doublespaced}} is applied to the item.
     * @param $column
     * @private
     */
    _wrapLabels: function ($column) {
      if (this.options.wrapLabels === true) {
        $column.find('.coral-ColumnView-item').each(function () {
          var $this = $(this);
          $this.addClass('coral-ColumnView-item--checkWrap');
          if (this.scrollWidth > this.clientWidth) {
            // items with overflowing text: reduce font size
            $this.addClass('coral-ColumnView-item--doublespaced');
          }
          $this.removeClass('coral-ColumnView-item--checkWrap');
        });
      }
    },

    /**
     * The handler to select items. Selecting results in a single selected item, loads its
     * <code>data-url</code> and adds the data to a new column.
     * @param {jQuery.Event} event
     * @private
     */
    _selectItemHandler: function (event) {
      // selecting a single item: deselect items in former active column
      var $item = $(event.target);
      if (!$item.hasClass('coral-ColumnView-item')) {
        $item = $item.parents('.coral-ColumnView-item');
      }

      this._setActiveColumn($item, false);

      $item.addClass('is-selected');
      var $column = this.getActiveColumn().next();
      if ($column.length === 0) {
        // no column after the active one available: add a column
        $column = this._addColumn();
      } else {
        // remove additional classes e.g. coral-ColumnView-preview
        $column.attr("class", "").addClass("coral-ColumnView-column");
      }
      this._loadColumn($column, $item.data('url') || this.options.url,
          $item.data('path'));

      this._scrollToColumn();

      this.$element.trigger("select", $item);
    },

    /**
     * The handler to check and uncheck items. Checking may result in none, a single or multiple selected items.
     * and adds the data to a new column.
     * @param {jQuery.Event} event
     * @private
     */
    _checkItemHandler: function (event) {
      // selecting multiple items
      event.stopPropagation();

      var $item = $(event.target).parents('.coral-ColumnView-item');
      this._setActiveColumn($item, true);

      $item.toggleClass('is-selected is-checked');

      if (this.getSelectedItems().length === 0) {
        // unchecked last item of a column: parent column (if available) is new active column
        var $column = this.getActiveColumn();
        var $parentColumn = $column.prev();
        if ($parentColumn.length !== 0) {
          $column.removeClass('is-active');
          $parentColumn.addClass('is-active');
        }
      }

      this._scrollToColumn();

      this.$element.trigger("check", $item);
    },

    /**
     * Sets the parent of the given item to active column and handles. Selected items are deselected and unchecked.
     * If the former active column is the same as the new one the items will be unchecked solely if
     * <code>forceUncheck</code> is true.
     * @param $item {jQuery} The lastly selected item
     * @param checking {Boolean} <code>true</code> when the "checkbox" (icon) was tapped
     * @private
     */
    _setActiveColumn: function ($item, checking) {
      var $formerActiveColumn = this.getActiveColumn();
      var $activeColumn = $item.parent();

      if (checking === true) {
        // tapping "checkbox": convert selected item of active column into checked
        $activeColumn.children('.is-selected:not(.is-checked)').addClass('is-checked');
      } else {
        // tapping label: deselect all items (note: does not include checked items, see below)
        $activeColumn.children('.is-selected:not(.is-checked)').removeClass('is-selected');
      }

      if (checking === false || $activeColumn.hasClass('is-active') === false) {
        // tapping label or a "checkbox" in a different column: uncheck all items
        $formerActiveColumn.children('.is-checked').removeClass('is-selected is-checked');
      }

      // the parent of the item is the new active column
      $formerActiveColumn.removeClass('is-active');
      $activeColumn.addClass('is-active')
        // clear the columns after the new active column
          .nextAll().html('');
    },

    /**
     * Scroll to the relevant column. If the target column is right of the visible area it will be scrolled into
     * view. Otherwise if the active column is left of the visible area this one will be scrolled into view.
     * @private
     */
    _scrollToColumn: function () {
      var left, duration;
      var $activeColumn = this.getActiveColumn();

      // most right column: target column, preview column or active column
      var $rightColumn;
      var items = this.getSelectedItems().filter(':not(.is-checked)');
      if (items.length === 1) {
        $rightColumn = $activeColumn.next();
      } else {
        $rightColumn = $activeColumn;
      }

      if ($rightColumn.position() && $rightColumn.position().left + $rightColumn.outerWidth() >= this.$element.width()) {
        // most right column is (partially) right of visible area: scroll right column into view

        // remove empty columns right of most right column
        $rightColumn.nextAll().remove();

        left = this.$element[0].scrollWidth - this.$element.outerWidth();
        duration = (left - this.$element.scrollLeft()) * 1.5; // constant speed

        this.$element.animate({
          scrollLeft: left
        }, duration);

      } else if ($activeColumn.position() && $activeColumn.position().left < 0) {
        // active column is (partially) left of visible area: scroll active column into view

        left = 0;
        $activeColumn.prevAll().each(function () {
          left += $(this).outerWidth();
        });
        duration = (this.$element.scrollLeft() - left) * 1.5; // constant speed

        this.$element.animate({
          scrollLeft: left
        }, duration);
      }
    }


    /**
     Triggered when an item is selected (single selection)

     @name CUI.ColumnView#select
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} item                   The selected item
     */

    /**
     Triggered when an item is checked (multi selection)

     @name CUI.ColumnView#check
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} item                   The checked item
     */

    /**
     Triggered when a column is loaded

     @name CUI.ColumnView#loadcolumn
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} column                 The loaded column
     @param {String} path                   The loaded path
     */

  });


  CUI.Widget.registry.register('columnview', CUI.ColumnView);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.ColumnView.init($('[data-init~=columnview]', event.target));
    });
  }

}(jQuery, this));
