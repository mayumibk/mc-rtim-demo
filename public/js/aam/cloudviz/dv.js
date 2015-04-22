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
 * dv - v3.1.0 - 2014-08-22
 * Copyright (c) 2014 Adobe Systems, Inc. All Rights Reserved.
 */
(function(){
// This class is used to shim in extra events into d3.  These event-types don't ordinarily exist in JS, so I
// shimmed them into D3.
var d3_selectionPrototype = d3.selection.prototype,
	d3_selection_on = d3_selectionPrototype.on;

// The shimmed events we are using in DV.
var shims = {
	// Tap event is generated if a touch is started and ends in 200ms. It requires paying attention to
	// touchstart, touchend, and touchmove events.
	"tap": [["touchstart", "touchend", "touchmove"], tap]
};

var pointer = null,
	touchStarted = false,
	curX = 0,
	curY = 0,
	cachedX = 0,
	cachedY = 0;

/**
 * Overriding d3's selection prototype to watch for special events to shim in new event types.
 */
d3_selectionPrototype.on = function(type, listener, capture) {
	var bits = type.split("."),
		eventType = bits.shift(),
		shim = shims[eventType];
	// If we have a shim candidate, handle that case, otherwise passthrough to normal D3 event handling.
	if (shim) {
		var types = shim[0],
			self = this;
		listener = shim[1].call(null, listener);

		// For each regular event that composes our custom event, add event handlers.
		types.forEach(function(d, i) {
			var eType = [d, bits].join(".");
			d3_selection_on.call(self, eType, listener, capture);
		});
		return d3_selection_on;
	} else {
		return d3_selection_on.apply(this, arguments);
	}
};

/**
 * Detects if a tap event occurred.  If it does, dispatch the event to all bound callbacks.
 */
function tap(callback) {
	return function() {
		if (d3.event.type === "touchstart") {
			pointer = getPointerEvent(d3.event);
			cachedX = curX = pointer.pageX;
			cachedY = curY = pointer.pageY;
			touchStarted = true;

			var ev = d3.event;

			// Check back in 200ms to see if a tap occurred.
			setTimeout(function() {
				if ((cachedX === curX) && !touchStarted && (cachedY === curY)) {
					d3.event = ev;
					callback.apply(this, arguments);
				}
			}, 200);
		}
		if (d3.event.type === "touchend" && touchStarted) {
			touchStarted = false;
		}
		if (d3.event.type === "touchmove" && touchStarted) {
			pointer = getPointerEvent(d3.event);
			curX = pointer.pageX;
			curY = pointer.pageY;
		}
	};
}

function getPointerEvent(event) {
	return event.touches ? event.touches[0] : event;
}
dv = function() {};
dv.version = "3.1.0";
dv.ANIMATION = true;

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
var initializing = false, fnTest = /xyz/.test(function() { xyz;	}) ? /\b_super\b/ : /.*/;
dv.extend = function(subClass) {
	var _super = this.prototype;
	initializing = true;
	var prototype = new this();
	// execute outer function to obtain prototype for class
	subClass = subClass();
	subClass.init = subClass;

	initializing = false;
	for (var prop in subClass) {
		prototype[prop] = typeof subClass[prop] == "function" &&
			typeof _super[prop] == "function" && fnTest.test(subClass[prop]) ?
			(function(prop, fn) {
				return function() {
					var tmp = this._super;
					this._super = _super[prop];
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(prop, subClass[prop]) :
			subClass[prop];
	}

	function Class() {
		if(!initializing){
			initializing = true;
			var clazz = new arguments.callee();
			initializing = false;
			clazz.init.apply(clazz, arguments);
			return clazz;
		}

	}

	Class.prototype = prototype;
	Class.mixin = function(name, value) {
		if (dv.util.isObject(name)) {
			dv.util.each(name, function(mixin, name) {
				prototype[name] = value;
			});
		} else {
			prototype[name] = value;
		}
	};
	Class.extend = arguments.callee;

	return Class;
};

dv.DEFAULT_COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
dv.DEFAULT_CATEGORICAL_AES = [ 'color', 'fill', 'stroke', 'shape', 'size', 'linetype' ];

// Returns the absolute coordinates for a pixel value within a plot.
dv.absoluteCoordinates = function(chart, posWithinPlot, panel) {
	// TODO: The coordinate system needs to handle this...
	// We centered the SVG group in the middle of the plot with a transform on the plot group since we're in polar, we need to undo that here.
	if (chart.coord() instanceof dv.coord.polar) {
		var xScale = chart.coord().flip() ? panel.yOuterScale() : panel.xOuterScale(),
			yScale = chart.coord().flip() ? panel.xOuterScale() : panel.yOuterScale(),
			xRange = dv.util.scaleRangeNoReverse(xScale),
			yRange = dv.util.scaleRangeNoReverse(yScale);
		posWithinPlot[0] += (xRange[0] + xRange[1]) / 2;
		posWithinPlot[1] += (yRange[0] + yRange[1]) / 2;
	}

	return posWithinPlot;
};

/**
 * Shows a tooltip at a given position with HTML content.
 * @param targetRect - The bounding rect of the SVG element we are pointing the tooltip to. Has properties: x, y, width, height.
 * @param boundaryRect - The bounding rect which the tooltip can not be displayed outside. If the tooltip gets too close to a boundary, it will try to flip to a different orientation.  Has properties: x, y, width, height.
 * @param content - The HTML content displayed in the tooltip
 * @param padding - The amount of padding we want to add to push the tooltip out further
 * @param parent - The parent the tooltip will be attached to
 */
dv.showTooltip = function(targetRect, boundaryRect, content, orientation, padding, parent) {
	var tipDiv = parent.selectAll(".dv-tooltip").data([targetRect]);

	targetRect.cx = targetRect.cx || targetRect.x + targetRect.width / 2;
	targetRect.cy = targetRect.cy || targetRect.y + targetRect.height / 2;
	targetRect.dx = targetRect.dx || targetRect.x + targetRect.width;
	targetRect.dy = targetRect.dy || targetRect.y + targetRect.height;
	boundaryRect.dx = boundaryRect.dy || boundaryRect.x + boundaryRect.width;
	boundaryRect.dy = boundaryRect.dy || boundaryRect.y + boundaryRect.height;

	var tipDivEnter = tipDiv.enter()
		.append("div")
			.classed("dv-tooltip", true)
			.style("top", 0)
			.style("left", 0);
	tipDivEnter.append('div').classed("content", true);
	tipDivEnter.append('b').classed("notch", true);

	tipDiv.select(".content").html(content);

	var tipDivNotch = tipDiv.select(".notch");

	var tipNode = tipDiv.node(),
		width = tipNode.offsetWidth,
		height = tipNode.offsetHeight,
		top = 0,
		left = 0,
		clamp = function(val, min, max) { return Math.min(Math.max(min, val), max); };

	switch (orientation) {
		case "left" :
			left = targetRect.x - width - padding;
			top = targetRect.cy - height / 2;
			if (left < boundaryRect.x) { // flip to right
				left = targetRect.dx + padding;
				orientation = "right";
			}
			if (top < boundaryRect.y) top = boundaryRect.y; // snap to the top
			if (top + height > boundaryRect.dy) top = boundaryRect.dy - height; // snap to the bottom
			tipDivNotch.style("top", clamp(targetRect.cy - top - 5, 3, height - 13) + "px");
			break;
		case "right" :
			left = targetRect.x + targetRect.width + padding;
			top = targetRect.cy - height / 2;
			if (left + width > boundaryRect.dx) { // flip to left
				left = targetRect.x - width - padding;
				orientation = "left";
			}
			if (top < boundaryRect.y) top = boundaryRect.y; // snap to the top
			if (top + height > boundaryRect.dy) top = boundaryRect.dy - height; // snap to the bottom
			tipDivNotch.style("top", clamp(targetRect.cy - top - 5, 3, height - 13) + "px");
			break;
		case "top" :
			left = targetRect.cx - width / 2;
			top = targetRect.y - height - padding;
			if (top < boundaryRect.y) { // flip to bottom
				top = targetRect.dy + padding;
				orientation = "bottom";
			}
			if (left < boundaryRect.x) left = boundaryRect.x; // snap to the left
			if (left + width > boundaryRect.dx) left = boundaryRect.dx - width; // snap to the right
			tipDivNotch.style("left", clamp(targetRect.cx - left - 5, 3, width - 13) + "px");
			break;
		case "bottom" :
			left = targetRect.cx - width / 2;
			top = targetRect.dy + padding;
			if (top + height > boundaryRect.dy) { // flip to top
				top = targetRect.y - height - padding;
				orientation = "top";
			}
			if (left < boundaryRect.x) left = boundaryRect.x; // snap to the left
			if (left + width > boundaryRect.dx) left = boundaryRect.dx - width; // snap to the right
			tipDivNotch.style("left", clamp(targetRect.cx - left - 5, 3, width - 13) + "px");
			break;
		default :
			orientation = null;
			break;
	}

	top = Math.round(top);
	left = Math.round(left);

	tipDiv
		.classed("top right left bottom hide", false)
		.classed(orientation, true);

	tipDivEnter.style("top", top + "px").style("left", left + "px");

	tipDiv
		.style("top", top + "px")
		.style("left", left + "px");
};

dv.removeTooltip = function(parent) {
	parent.selectAll(".dv-tooltip")
		.classed("hide", true);
};

dv.cancelEvent = function(e) {
	e.stopPropagation();
	e.preventDefault();
};

// Returns the dimensions of the current window.
dv.windowDimensions = function() {
	var size = {
		width: 640,
		height: 480
	};

	if (document.body && document.body.offsetWidth) {
		size.width = document.body.offsetWidth;
		size.height = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		size.width = document.documentElement.offsetWidth;
		size.height = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight) {
		size.width = window.innerWidth;
		size.height = window.innerHeight;
	}
	return size;
};

dv.addWindowResizeHandler = function(func) {
	window.addEventListener("resize", func);
};

dv.removeWindowResizeHandler = function(func) {
	window.removeEventListener("resize", func);
};

dv.scale = dv.extend(function (){

	function scale(d3Scale) {
		this._d3Scale = d3Scale;
		this._reverse = false;
		this._parse = dv.util.identity;

		this._includeInDomain = function() { return true; };
	}

	scale._mapToD3Scale = function(val) {
		return this._d3Scale(val);
	};

	scale.trainingProperties = function(val) {
		if (!arguments.length) {
			if (this._trainingProperties) return this._trainingProperties;
			if (this._property) return [this._property];
			return undefined;
		}
		if (!dv.util.isValidValue(val, ["isUndefined", "isArray"])) dv.log.error({msg: "The supplied properties is not an array", data: {range: val}});
		this._trainingProperties = val;
		return this;
	};

	scale.trainDomain = function(data, options) {
		var domain = this.calculateDomain(data, options);
		this.domain(domain);
		return domain;
	};

	scale.parse = function(val) {
		if (!arguments.length) return this._parse;
		this._parse = val;
		return this;
	};

	scale.applyRangePadding = function() { };

	// Allows the scale to look at its domain to see if it is valid.  If it isn't, a default domain can be set instead.
	scale.validateDomain = function() { };

	// Extracts the scale's property from the object.
	scale.mapToProp = function(obj) {
		var val = obj[this.property()],
			self = this;
		// We'll run each value through the d3 scale object that this wraps.
		// If it's an array, we'll apply the d3 scale to each entry.
		if (dv.util.isArray(val)) {
			return dv.util.map(val, function(d) { return self._mapToD3Scale.call(self, d); });
		}
		return this._mapToD3Scale.call(this, val);
	};

	//  Extracts the scale's property value from the object,
	//	which property's values are then mapped to a percent of the scale.
	scale.mapPropToPercent = function(obj) {
		return this.mapValueToPercent(this.mapToProp(obj));
	};

	//	Take each value along the scale and compute
	//	the percent distance along the fixed length of the scale.
	scale.mapValueToPercent = function(val) {
		var range = dv.util.scaleRange(this),
			denom = range[1] - range[0];
		if (dv.util.isArray(val)) {
			return dv.util.map(val, function(d) { return denom ? (d - range[0]) / denom : 0; });
		}
		return denom ? (val - range[0]) / denom : 0;
	};

	scale.mapValue = function(val) {
		if (dv.util.isArray(val)) {
			var self = this;
			return dv.util.map(val, function(d) { return self._mapToD3Scale.call(self, d); });
		}
		return this._mapToD3Scale.call(this, val);
	};



	scale.invertValue = function(val) {
		return this._d3Scale.invert(val);
	};

	scale.rangeBand = function(val) {
		return 0;
	};

	scale.reverse = function(val) {
		if (!arguments.length) return this._reverse;

		if (this._reverse != val) {
			this._reverse = val;

			var domain = this._d3Scale.domain() || [];
			this._d3Scale.domain(domain.reverse());
		}
		return this;
	};

	scale.property = function(val) {
		if (!arguments.length) return this._property;
		this._property = val;
		return this;
	};

	scale.mapping = function(val) {
		if (!arguments.length) return this._mapping;
		this._mapping = val;
		return this;
	};

	/**
	 * An unreversed domain.  For continuous scales, this represents the limits of the domain (e.g. [0, 50]).
	 * For ordinal scales, this represents a unique set of all values (e.g. ["USA", "Mexico", "Canada", "Brazil"]).
	 */
	scale.domain = function(val) {
		if (!arguments.length) return this._d3Scale.domain();
		if (!this._d3Scale) return this;
		val = this._reverse ? val.reverse() : val;
		this._d3Scale.domain(val);
		return this;
	};

	/**
	 * returns true if the argument d contains the same values as this scale's domain (no more, no less)
	**/
	scale.hasSameDomain = function(d) {
		var retVal = true,
			domain = this.domain();
		if (domain.length != d.length) {
			retVal = false;
		} else {
			for (var i = 0; i < d.length; i++) {
				if (d[i] != domain[i]) {
					retVal = false;
					break;
				}
			}
		}
		return retVal;
	};

	scale.range = function(val) {
		if (!arguments.length) return this._d3Scale.range();
		if (!this._d3Scale) return this;
		if (!dv.util.isValidValue(val, ["isArray"])) dv.log.error({msg: "The supplied range is not an array", data: {range: val}});
		this._d3Scale.range(val);
		return this;
	};

	scale.expand = function(val) { // TODO: Implement me
		if (!arguments.length) return this._expand;
		this._expand = val;
		return this;
	};

	scale.limits = function(val) { // TODO: Implement me
		if (!arguments.length) return this._limits;
		this._limits = val;
		return this;
	};

	scale.breaks = function(val) { // TODO: Implement me
		if (!arguments.length) return this._breaks;
		this._breaks = val;
		return this;
	};

	scale.orientation = function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	};

	/**
	 * A function specified by the user which will be called when calculating the scale's domain.  If the function returns true,
	 * the data point will be included in the training of the domain.  Otherwise, it will be left out while the domain is calculated.
	 */
	scale.includeInDomain = function(val) {
		if (!arguments.length) return this._includeInDomain;
		this._includeInDomain = val;
		return this;
	};

	scale.scaleIndex = function(val) {
		if (!arguments.length) return this._scaleIndex;
		this._scaleIndex = val;
		return this;
	};

	scale._copy = function() {
		dv.log.error({msg: "A copy function was not specified for the scale subclass."});
	};
	scale.copy = scale._copy;

	scale.isDefault = function(val) {
		if (!arguments.length) return this._isDefault;
		this._isDefault = val;
		return this;
	};

	return scale;
});
/**
 * dv.scale.constant is simply a placeholder for constant values that shouldn't be mapped.
 * It is used internally when an aesthetic is supplied with a primitive value instead of
 * an aesthetic.
 */
dv.scale.constant = dv.scale.extend(function(){
	function constant() {
		this._super(null);
	}

	constant.trainDomain = function(data) {
		return;
	};

	constant.map = function(val) {
		return this._value; // There is no translation required.
	};

	constant.mapToProp = function(val) {
		return this._value; // There is no translation required.
	};

	constant.value = function(val) {
		if (!arguments.length) return this._value;
		this._value = val;
		return this;
	};

	constant._copy = function(val) {
		var	trainProps = this.trainingProperties();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		return dv.scale.constant()
			.isDefault(this.isDefault())
			.value(this.value())
			.property(this.property())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
	};
	constant.copy = constant._copy;
	return constant;
});
dv.scale.continuous = dv.scale.extend(function() {
	function continuous(scale) {
		this._super(scale ? scale : d3.scale.linear());

		// to is just an alias function for range since range won't be apparent to those who aren't familiar
		// with D3.
		this.to = this.range;
		this._parse = function(d) {
			if (d == null) {
				return undefined;
			}
			return parseFloat(d);
		};
	}

	/**
	 * Returns an unreversed continuous domain.  Reversing should automatically be done when the returned value
	 * is passed to the scale's domain setter if it is required.
	 */
	continuous.calculateDomain = function(data, options) {
		var domain = [],
			self = this,
			_min,
			_max;

		if (!this.trainingProperties()) this.trainingProperties([ this.property() ]);
		var trainingProps = this.trainingProperties();
		if (!options) options = {};
		if (!data) data = [];

		for (var p = 0; p < trainingProps.length; p++) {
			var prop = trainingProps[p];
			for(var j = 0; j < data.length; j++) {
				if (!options.filter || !options.filter.call(this, data[j].key)) {
					var series = data[j].values;
					for (var i = 0; i < series.length; i++) {
						var dataObj = series[i];
						if (!this._includeInDomain(dataObj, i)) continue;

						// If the scale has an index different than 0, let's append to the data object the index of the scale.
						if (this.scaleIndex() !== 0) dataObj[this.property() + "-index"] = this.scaleIndex();
						var val = (options.stack) ? dataObj.y0 : dataObj[prop];
						if (!dv.util.isArray(val)) {
							val = this._parse.call(this, val);
						}

						var minVal = dv.util.isArray(val) ? d3.min(val) : val;
						_min = (dv.util.isUndefined(_min) || minVal < _min) ? minVal : _min;

						if(options.stack) {
							// With polygons, the stacking occurs along the maximum value in that dimension
							// (i.e., on the bounding box).
							var addVal = dataObj[prop];
							val += dv.util.isArray(addVal) ? d3.max(addVal) : self._parse.call(this, addVal);
						}
						var maxVal = dv.util.isArray(val) ? d3.max(val) : val;
						_max = (dv.util.isUndefined(_max) || maxVal > _max) ? maxVal : _max;
					}
				}
			}
		}

		// This probably means there is no data property matching the mapping. This is ok in cases where a geom
		// is inheriting mappings from the chart, but has data that doesn't contain the mapped properties.
		if (isNaN(_min) && isNaN(_max)) {
			domain = [];
			this._naturalDomain = [];
		}
		else {
			domain = [_min, _max];
			this._naturalDomain = [_min, _max];
		}

		if (options.fill) {
			domain = [0, 100]; // 0 to 100 percent
		}
		if (!dv.util.isUndefined(this._upperLimit) && !dv.util.isFunction(this._upperLimit) &&
			!dv.util.isUndefined(this._lowerLimit) && !dv.util.isFunction(this._lowerLimit)) {
			domain = this.limits(); // Explicitly set limits always trump implicit limits.
		}
		else {
			this._reconcileLimits(domain);
		}

		return domain;
	};

	continuous.unionDomain = function(scale, isReversed) {
		if (!scale || !(scale instanceof dv.scale.continuous)) {
			dv.log.error({msg: "The supplied scale is not continuous.", data: { scale: scale, isReversed: isReversed }});
		}

		var domain = scale.domain(),
			naturalDomain = scale.naturalDomain(),
			unionedDomain = this.domain() ? d3.extent(this.domain().concat(domain)) : d3.extent(domain),
			unionedNatDomain = this._naturalDomain ? d3.extent(this._naturalDomain.concat(naturalDomain)) : d3.extent(naturalDomain);

		if (isNaN(unionedDomain[0]) && isNaN(unionedDomain[1])) {
			unionedDomain = [];
		}
		if (isNaN(unionedNatDomain[0] && isNaN(unionedNatDomain[1]))) {
			unionedNatDomain = [];
		}

		// TODO: We eventually need to get smarter about situations where we are unioning a reversed and
		// unreversed domain.  This will ideally create a situation where we have multiple axes.  For now
		// we'll say if one of them is reversed, the current unioned scale will be reversed as well.
		this.reverse(isReversed || this._reverse);
		this.domain(unionedDomain);
		this._naturalDomain = unionedNatDomain;
		return this;
	};

	// Allows the scale to look at its domain to see if it is valid.  If it isn't, a default domain can be set instead.
	continuous.validateDomain = function() {
		var domain = this.domain();
		if (!domain || !domain.length) {
			this.domain([0, 1]);
		}
	};

	continuous.unionRange = function(range) {
		if (!dv.util.isValidValue(range, ["isArray"])) dv.log.error({msg: "The supplied range is not an array", data: {range: range}});

		this.range(this.range() ? d3.extent(this.range().concat(range)) : range);
		return this;
	};

	continuous.applyRangePadding = function() {
		var domain = this.domain(),
			range = this.range();

		if (this._lowerRangePadding) {
			var lExtent = range[0] - range[1],
				lrp = Math.min(Math.abs(lExtent) - 1, this._lowerRangePadding);
			domain[0] = this.invertValue(lExtent / (Math.abs(lExtent) - lrp) * lrp + range[0]);
		}
		if (this._upperRangePadding) {
			var uExtent = range[1] - range[0],
				urp = Math.min(Math.abs(uExtent) - 1, this._upperRangePadding);
			domain[1] = this.invertValue(uExtent / (Math.abs(uExtent) - urp) * urp + range[1]);
		}

		this.domain(domain);
		return this;
	};

	/**
	 *
	 */
	continuous.upperLimit = function(val) {
		if (!arguments.length) return this._upperLimit;
		if (dv.util.isValidValue(val, ["isUndefined", "isFinite", "isDate", "isFunction"])) this._upperLimit = val;
		else dv.log.error({msg: "Invalid value, cannot set upperLimit with: " + val});
		return this;
	};

	continuous.lowerLimit = function(val) {
		if (!arguments.length) return this._lowerLimit;
		if (dv.util.isValidValue(val, ["isUndefined", "isFinite", "isDate", "isFunction"])) this._lowerLimit = val;
		else dv.log.error({msg: "Invalid value, cannot set lowerLimit with: " + val});
		return this;
	};

	continuous.limits = function(val) {
		if (!arguments.length) return [this._lowerLimit, this._upperLimit];
		if (!val || val.length != 2) dv.log.error({msg: "Incorrect number of arguments, the limits function must supply an array containing both a lower and upper limit"});
		this.lowerLimit(val[0]);
		this.upperLimit(val[1]);
		return this;
	};

	/**
	 * Returns the domain of the data without taking limits into account.  This is essentially the natural min/max
	 * values of the entire dataset.  This is only calculated when calculateDomain is executed on a scale. It cannot
	 * be set externally.
	 */
	continuous.naturalDomain = function() {
		return this._naturalDomain;
	};

	/**
	 * Adds range padding to the end of the scale by adjusting the domain to accommodate the padding.
	 */
	continuous.upperRangePadding = function(val) {
		if (!arguments.length) return this._upperRangePadding;
		if (dv.util.isValidValue(val, ["isUndefined", "isFinite", "isDate", "isFunction"])) this._upperRangePadding = val;
		else dv.log.error({msg: "Invalid value, cannot set upperRangePadding with: " + val});
		return this;
	};

	/**
	 * Adds range padding to the beginning of the scale by adjusting the domain to accommodate the padding.
	 */
	continuous.lowerRangePadding = function(val) {
		if (!arguments.length) return this._lowerRangePadding;
		if (dv.util.isValidValue(val, ["isUndefined", "isFinite", "isDate", "isFunction"])) this._lowerRangePadding = val;
		else dv.log.error({msg: "Invalid value, cannot set lowerRangePadding with: " + val});
		return this;
	};

	continuous.rangePadding = function(val) {
		if (!arguments.length) return [this._lowerRangePadding, this._upperRangePadding];
		if (!val || val.length != 2) dv.log.error({msg: "Incorrect number of arguments, the limits function must supply an array containing both a lower and upper limit"});
		this.lowerRangePadding(val[0]);
		this.upperRangePadding(val[1]);
		return this;
	};

	/**
	 * The soft lower limit will tell the scale that it's lower limit of the domain should be zero, unless
	 * the lower limit of the domain is less than zero.  In that case, nothing will be changed.
	 */
	continuous.softLowerLimit = function(val) {
		if (!arguments.length) return this._softLowerLimit;
		this._softLowerLimit = val;
		return this;
	};

	continuous._reconcileLimits = function(domain) {
		if (!domain.length) return;

		if (!dv.util.isUndefined(this._softLowerLimit)) {
			domain[0] = Math.min(domain[0], this._softLowerLimit);
			domain[1] = Math.max(domain[1], this._softLowerLimit);
		}

		if (!dv.util.isUndefined(this._lowerLimit))
			domain[0] = dv.util.isFunction(this._lowerLimit) ? this._lowerLimit(domain[0], domain[1]) : this._lowerLimit;

		if (!dv.util.isUndefined(this._upperLimit))
			domain[1] = dv.util.isFunction(this._upperLimit) ? this._upperLimit(domain[0], domain[1]) : this._upperLimit;
	};

	continuous.labels = function(val) { // TODO: Implement me
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	};

	continuous._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.continuous()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.reverse(this.reverse())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};


	continuous.invert = function(obj) {
		return this._d3Scale.invert(obj[this.mapping()]);
	};

	continuous.invertFromProp = function(obj) {
		return this._d3Scale.invert(obj[this.property()]);
	};

	continuous.copy = continuous._copy;
	return continuous;

});
dv.scale.linear = dv.scale.continuous.extend(function() {
	function linear() {
		this._super(d3.scale.linear());
	}

	linear._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.linear()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};
	linear.copy = linear._copy;
	return linear;
});
dv.scale.gradient = dv.scale.continuous.extend(function(){
	function gradient() {
		this._super(d3.scale.linear());
		this._innerScale = d3.scale.linear().range([0, 1]);

		// this._d3Scale is the outerScale.  It can accept hex and rgb strings.
		this.colors = this.range;

		this._controlPoints = ["0%", "50%", "100%"];
		this.colors(["#FA5A50", "#E1E1E1", "#5FAF69"]);
	}

	gradient._adjustOuterDomain = function() {
		var self = this;
		this._d3Scale.domain(dv.util.map(this._controlPoints, function(d, i) { return dv.util.isPercentString(d) ? self._innerScale.invert(parseInt(d, 10) / 100) : d; }));
	};

	/**
	 * Control points can include both percent string values (which will work off either the computed extent for the scale, or the user specified limits) or
	 * domain values.
	 */
	gradient.controlPoints = function(val) {
		if (!arguments.length) return this._controlPoints;
		this._controlPoints = val;
		this._adjustOuterDomain();
		return this;
	};

	/**
	 * An unreversed domain.  For continuous scales, this represents the limits of the domain (e.g. [0, 50]).
	 * For ordinal scales, this represents a unique set of all values (e.g. ["USA", "Mexico", "Canada", "Brazil"]).
	 */
	gradient.domain = function(val) {
		if (!arguments.length) return this._innerScale.domain();
		if (!this._innerScale) return this;
		val = this._reverse ? val.reverse() : val;
		this._innerScale.domain(val);
		this._adjustOuterDomain();
		return this;
	};

	gradient._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.gradient()
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.includeInDomain(this.includeInDomain())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.controlPoints(this.controlPoints())
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};
	gradient.copy = gradient._copy;
	return gradient;
});
dv.scale.time = dv.scale.continuous.extend(function() {
	function time() {
		this._super(d3.time.scale());
		this._parse = function(d) { return (d instanceof Date) ? d : new Date(Date.parse(d)); };
	}

	time._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.time()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};
	time.copy = time._copy;

	time._reconcileLimits = function(domain, min, max) {
		if (!dv.util.isUndefined(this._softLowerLimit)) {
			domain[0] = Math.min(domain[0], this._softLowerLimit);
			domain[1] = Math.max(domain[1], this._softLowerLimit);
		}

		if (!dv.util.isUndefined(this._lowerLimit))
			domain[0] = dv.util.isFunction(this._lowerLimit) ? this._parse(this._lowerLimit(new Date(min), new Date(max))) : this._lowerLimit;

		if (!dv.util.isUndefined(this._upperLimit))
			domain[1] = dv.util.isFunction(this._upperLimit) ? this._parse(this._upperLimit(new Date(min), new Date(max))) : this._upperLimit;
	};

	return time;
});
dv.scale.time.utc = dv.scale.continuous.extend(function() {
	function utc() {
		this._super(d3.time.scale.utc());
		this._parse = function(d) { return (d instanceof Date) ? d : new Date(Date.parse(d)); };
	}

	utc._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.time.utc()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};
	utc.copy = utc._copy;

	utc._reconcileLimits = function(domain, min, max) {
		if (!dv.util.isUndefined(this._softLowerLimit)) {
			domain[0] = Math.min(domain[0], this._softLowerLimit);
			domain[1] = Math.max(domain[1], this._softLowerLimit);
		}

		if (!dv.util.isUndefined(this._lowerLimit))
			domain[0] = dv.util.isFunction(this._lowerLimit) ? this._parse(this._lowerLimit(new Date(min), new Date(max))) : this._lowerLimit;

		if (!dv.util.isUndefined(this._upperLimit))
			domain[1] = dv.util.isFunction(this._upperLimit) ? this._parse(this._upperLimit(new Date(min), new Date(max))) : this._upperLimit;
	};

	return utc;
});
dv.scale.ordinal = dv.scale.extend(function() {
	function ordinal() {
		this._super(d3.scale.ordinal());
		this._defaultPadding = 0.1;
		this._defaultOuterPadding = 0;
		this._rangeExtent = [];
		this._rangeBandsSet = false;
	}

	ordinal._mapToD3Scale = function(val) {
		// D3's ordinal scale will automatically add an entry to the domain if that value is requested when mapping.
		// By checking to see if that value is contained in the domain before mapping, we can prevent this from
		// happening.
		var domain = this.domain(),
			i = -1,
			n = domain.length,
			index = -1;
		while (++i < n) {
			var d = domain[i];
			if (d === val || dv.util.isDate(d) && d.getTime() === val.getTime()) {
				index = i;
				break;
			}
		}
		return (index < 0) ? undefined : this._d3Scale(val);
	};

	/**
	 * Returns an unreversed continuous domain.  Reversing should automatically be done when the returned value
	 * is passed to the scale's domain setter if it is required.
	 */
	ordinal.calculateDomain = function(data, options) {
		var uniqValues = {};
		var tuple = [], trainingProps = this.trainingProperties();
		options = options || {};
		for (var p = 0; p < trainingProps.length; p++) {
			var prop = trainingProps[p];
			for(var j = 0; j < data.length; j++) {
				var values = data[j].values;
				if (!options.filter || !options.filter.call(this, data[j].key)) {
					for(var i = 0; i < values.length; i++) {
						var dataObj = values[i];
						if (!this._includeInDomain(dataObj, i)) continue;

						// If the scale has an index different than 0, let's append to the data object the index of the scale.
						if (this.scaleIndex() !== 0) dataObj[this.property() + "-index"] = this.scaleIndex();
						var val = this._parse.call(this, dataObj[prop]);
						if (!dv.util.isUndefined(val) && !uniqValues.hasOwnProperty(val)) {
							uniqValues[val] = val;
							tuple.push(val);
						}
					}
				}
			}
		}
		return tuple.length ? tuple : [];
	};

	ordinal.unionDomain = function(scale, isReversed) {
		if (!scale || !(scale instanceof dv.scale.ordinal)) {
			dv.log.error({msg: "The supplied scale is not ordinal.", data: { scale: scale, isReversed: isReversed }});
		}
		var domain = scale.domain();
		if (domain && !dv.util.isArray(domain)) throw new Error("The supplied domain is not an array");
		if (domain) {
			this.reverse(isReversed || this._reverse);
			this.domain(this.domain() ? dv.util.union(this.domain(), domain) : domain);
		}
		return this;
	};

	ordinal.unionRange = function(range) {
		if (range && !dv.util.isArray(range)) throw new Error("The supplied range is not an array");
		if (range) {
			this.range(this.range() ? dv.util.union(this.range(), range) : range);
		}
		return this;
	};

	ordinal.invertValue = function(val) {
		var index = this.range().indexOf(val),
			domain = this.domain();
		if (index < 0) throw new Error("The supplied value does not exist in the specified range.");

		return domain[index % domain.length];
	};

	ordinal.reverse = function(val) {
		if (!arguments.length) return this._reverse;

		if (this._reverse != val) {
			this._reverse = val;

			var domain = this._d3Scale.domain() || [];
			this._d3Scale.domain(domain.reverse());
		}
		return this;
	};

	ordinal.padding = function(val) {
		if (!arguments.length) return dv.util.isUndefined(this._padding) ? this._defaultPadding : this._padding;
		this._padding = val;

		if (this._rangeBandsSet) {
			this._d3Scale.rangeBands(this.rangeExtent(), this._padding, this.outerPadding());
		}
		return this;
	};

	ordinal.outerPadding = function(val) {
		if (!arguments.length) {
			return dv.util.isUndefined(this._outerPadding) ? (dv.util.isUndefined(this._padding) ? this._defaultOuterPadding : this.padding()) : this._outerPadding;
		}
		this._outerPadding = val;

		if (this._rangeBandsSet) {
			this._d3Scale.rangeBands(this.rangeExtent(), this.padding(), this._outerPadding);
		}
		return this;
	};

	ordinal.rangeBands = function(val) {
		if (!arguments.length) return this._d3Scale.range();
		this._rangeBandsSet = true;
		this._d3Scale.rangeBands(val, this.padding(), this.outerPadding());
		this.rangeExtent(val);
		return this;
	};

	ordinal.rangeBand = function() {
		return this._d3Scale.rangeBand();
	};

	ordinal.range = function(val) {
		if (!arguments.length) return this._d3Scale.range();
		if (!this._d3Scale) return this;
		if (!dv.util.isValidValue(val, ["isArray"])) dv.log.error({msg: "The supplied range is not an array", data: {range: val}});
		this._d3Scale.range(val);
		this.rangeExtent([val[0], val[val.length - 1]]);
		return this;
	};

	ordinal.rangeExtent = function(val) {
		if (!arguments.length) return this._rangeExtent;
		if (!dv.util.isValidValue(val, ["isArray"])) dv.log.error({msg: "The supplied range extent is not an array", data: {range: val}});
		this._rangeExtent = val;
		return this;
	};

	ordinal.values = function(val) {
		if (!arguments.length) return this._d3Scale.range();
		if (!dv.util.isValidValue(val, ["isArray"])) dv.log.error({msg: "The supplied values is not an array", data: {range: val}});
		return this.range(val);
	};

	ordinal.drop = function(val) {
		if (!arguments.length) return this._drop;
		this._drop = val;
		return this;
	};

	ordinal._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.ordinal()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.range(this.range().slice(0))
			.rangeExtent(this.rangeExtent().slice(0))
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent().slice(0));
		}

		return scale;
	};
	ordinal.copy = ordinal._copy;
	return ordinal;
});
dv.scale.color = dv.scale.ordinal.extend(function() {
	var dv_qualitative16 = [ "#8CC350", "#5A6EAA", "#D755A5", "#1EBED7", "#F0A01E", "#9B8CE6", "#3CB5A0", "#3287D2", "#F0557D", "#C3D250", "#EB782D", "#78B4F5", "#5FAF69", "#AA5FA5", "#FA5A50", "#F5C841" ];

	function color() {
		this._super();
		this.range(dv_qualitative16);
	}

	color._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.ordinal()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.range(this.range())
			.rangeExtent(this.rangeExtent())
			.includeInDomain(this.includeInDomain())
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent().slice(0))
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	};

	color.copy = color._copy;
	return color;
});

dv.scale.shape = dv.scale.ordinal.extend(function() {
	var dv_shape = [ "circle", "cross", "diamond", "square", "triangle-down", "triangle-up" ];

	function shape() {
		this._super();
		this.range(dv_shape);
	}

	shape._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.ordinal()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.range(this.range().slice(0))
			.rangeExtent(this.rangeExtent().slice(0))
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent().slice(0))
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	};
	shape.copy = shape._copy;
	return shape;
});

dv.scale.linetype = dv.scale.ordinal.extend(function() {
	var dv_linetype = [ "solid", "dashed", "dotted", "dotdash", "longdash", "twodash" ];

	function linetype() {
		this._super();
		this.range(dv_linetype);
	}

	linetype._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.ordinal()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.range(this.range().slice(0))
			.rangeExtent(this.rangeExtent().slice(0))
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent().slice(0))
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	};
	linetype.copy = linetype._copy;
	return linetype;
});
dv.scale.size = dv.scale.continuous.extend(function() {
	function size() {
		this._super();
		this.to([2, 10]);
	}

	size._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		var scale = dv.scale.size()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.upperRangePadding(this.upperRangePadding())
			.lowerRangePadding(this.lowerRangePadding())
			.softLowerLimit(this.softLowerLimit())
			.range(this.range().slice(0))
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
		scale._naturalDomain = this._naturalDomain;
		return scale;
	};
	size.copy = size._copy;
	return size;
});
dv.scale.identity = dv.scale.ordinal.extend(function() {
	function identity(scale) {
		this._super(d3.scale.ordinal());
	}

	identity.mapToProp = function(obj) { // We should probably be able to remove this if the identity scale is trained correctly.
		return obj[this.property()];
	};

	identity.domain = function(val) {
		if (!arguments.length) return this._d3Scale.domain();
		if (!this._d3Scale) return this;
		val = this._reverse ? val.reverse() : val;
		this._d3Scale.domain(val);
		this._d3Scale.range(val);
		return this;
	};

	identity.range = function() {
		if (!arguments.length) return this._d3Scale.range();
		return this;
	};

	identity.labels = function(val) { // TODO: Implement me
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	};

	identity._copy = function() {
		var domain = this.domain().slice(0),
			trainProps = this.trainingProperties();
		if (this.reverse()) domain.reverse();
		if (!dv.util.isUndefined(trainProps)) trainProps = trainProps.slice(0);

		return dv.scale.identity()
			.isDefault(this.isDefault())
			.property(this.property())
			.mapping(this.mapping())
			.domain(domain)
			.includeInDomain(this.includeInDomain())
			.range(this.range().slice(0))
			.reverse(this.reverse())
			.trainingProperties(trainProps)
			.scaleIndex(this._scaleIndex);
	};
	identity.copy = identity._copy;
	return identity;
});
dv.svg = dv.svg || {};

dv.svg.text = function() {
	var x = dv_svg_textX,
		y = dv_svg_textY,
		label = dv_svg_textLabel,
		defined = dv_svg_textDefined,
		duration = dv_svg_textDuration;

	function text(selection) {
		return selection
			.select(function(d, i) { return defined.call(this, d, i) ? this : null; }) // filter out the undefined results.
			.attr('x', function(d, i) { return x.call(this, d, i); })
			.attr('y', function(d, i) { return y.call(this, d, i); })
			.text(function(d, i) { return label.call(this, d, i); });
	}

	text.x = function(val) {
		if (!arguments.length) return x;
		x = val;
		return text;
	};

	text.y = function(val) {
		if (!arguments.length) return y;
		y = val;
		return text;
	};

	text.label = function(val) {
		if (!arguments.length) return label;
		label = val;
		return text;
	};

	text.defined = function(val) {
		if (!arguments.length) return defined;
		defined = val;
		return text;
	};

	text.duration = function(val) {
		if (!arguments.length) return duration;
		duration = val;
		return text;
	};

	return text;
};

dv.svg.text.radial = function() {
	var angle = dv_svg_textX,
		radius = dv_svg_textY,
		label = dv_svg_textLabel,
		defined = dv_svg_textDefined,
		duration = dv_svg_textDuration;

	function text(selection) {
			var a = function(d, i) { return angle.call(this, d, i) + dv_svg_arcOffset; },
				r = function(d, i) { return radius.call(this, d, i); };
			return selection
				.select(function(d, i) { return defined.call(this, d, i) ? this : null; }) // filter out the undefined results.
				.attr('x', function(d, i) { return r(d, i) * Math.cos(a(d, i)); })
				.attr('y', function(d, i) { return r(d, i) * Math.sin(a(d, i)); })
				.text(function(d, i) { return label.call(this, d, i); });
	}

	text.angle = function(val) {
		if (!arguments.length) return angle;
		angle = val;
		return text;
	};

	text.radius = function(val) {
		if (!arguments.length) return radius;
		radius = val;
		return text;
	};

	text.label = function(val) {
		if (!arguments.length) return label;
		label = val;
		return text;
	};

	text.defined = function(val) {
		if (!arguments.length) return defined;
		defined = val;
		return text;
	};

	text.duration = function(val) {
		if (!arguments.length) return duration;
		duration = val;
		return text;
	};

	return text;
};

function dv_svg_textX(d) {
	return d[0];
}

function dv_svg_textY(d) {
	return d[1];
}

function dv_svg_textLabel(d) {
	return d[2];
}

function dv_svg_textDefined() {
	return true;
}

function dv_svg_textDuration() {
	return 0;
}

dv.svg.rect = function() {
	var x0 = dv_svg_rectX0,
		x1 = dv_svg_rectX1,
		y0 = dv_svg_rectY0,
		y1 = dv_svg_rectY1,
		defined = dv_svg_rectDefined;

	function rect(d, i) {
		if (defined.call(this, d, i)) {
			return dv_svg_rect(x0.call(this, d, i), x1.call(this, d, i), y0.call(this, d, i), y1.call(this, d, i));
		}
		return null;
	}

	rect.x0 = function(val) {
		if (!arguments.length) return x0;
		x0 = val;
		return rect;
	};

	rect.x1 = function(val) {
		if (!arguments.length) return x1;
		x1 = val;
		return rect;
	};

	rect.y0 = function(val) {
		if (!arguments.length) return y0;
		y0 = val;
		return rect;
	};

	rect.y1 = function(val) {
		if (!arguments.length) return y1;
		y1 = val;
		return rect;
	};

	rect.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return rect;
	};

	return rect;
};

function dv_svg_rectX0(d) {
	return d[0];
}

function dv_svg_rectX1(d) {
	return d[1];
}

function dv_svg_rectY0(d) {
	return d[2];
}

function dv_svg_rectY1(d) {
	return d[3];
}

function dv_svg_rectDefined() {
	return true;
}

function dv_svg_rect(x0, x1, y0, y1) {
	// return "M" + x0 + "," + y0 + "L" + x1 + "," + y0 + " A0,0,0,0,1," + x1 + "," + y0 +
	//	" L" + x1 + "," + y1 + " A0,0,0,0,1," + x1 + "," + y1 +
	//	" L" + x0 + "," + y1 + " A0,0,0,0,1," + x0 + "," + y1 +
	//	" L" + x0 + "," + y0 + " A0,0,0,0,1," + x0 + "," + y0 + "Z";
	return "M" + x0 + "," + y0 +
			"L" + x1 + "," + y0 +
			"L" + x1 + "," + y1 +
			"L" + x0 + "," + y1 + "Z";
	//return "M" + x0 + "," + y0 + "A0,0 0 0,1 " + x1 + "," + y0 + "L" + x1 + "," + y1 + "A280000,280000 0 0,0 " + x0 + "," + y1 + "Z";
}

dv.svg.symbol = function() {
	var type = dv_svg_symbolType,
		size = dv_svg_symbolSize,
		x = dv_svg_symbolX,
		y = dv_svg_symbolY,
		defined = dv_svg_symbolDefined;

	function symbol(d, i) {
		if (defined.call(this, d, i)) {
			return (dv_svg_symbols[type.call(this, d, i)]
				|| dv_svg_symbols.circle)
				(size.call(this, d, i), x.call(this, d, i), y.call(this, d, i));
		}
		return null;
	}

	symbol.x = function(val) {
		if (!arguments.length) return x;
		x = val;
		return symbol;
	};

	symbol.y = function(val) {
		if (!arguments.length) return y;
		y = val;
		return symbol;
	};

	symbol.type = function(x) {
		if (!arguments.length) return type;
		type = d3.functor(x);
		return symbol;
	};

	// size of symbol in square pixels
	symbol.size = function(x) {
		if (!arguments.length) return size;
		size = d3.functor(x);
		return symbol;
	};

	symbol.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return symbol;
	};

	return symbol;
};

dv.svg.symbol.radial = function() {
	var type = dv_svg_symbolType,
		size = dv_svg_symbolSize,
		angle = dv_svg_symbolX,
		radius = dv_svg_symbolY,
		defined = dv_svg_symbolDefined;

	function symbol(d, i) {
		if (defined.call(this, d, i)) {
			var a = angle.call(this, d, i) + dv_svg_arcOffset,
				r = radius.call(this, d, i),
				x = r * Math.cos(a),
				y = r * Math.sin(a);
			return (dv_svg_symbols[type.call(this, d, i)]
				|| dv_svg_symbols.circle)
				(size.call(this, d, i), x, y);
		}
		return null;
	}

	symbol.angle = function(val) {
		if (!arguments.length) return angle;
		angle = val;
		return symbol;
	};

	symbol.radius = function(val) {
		if (!arguments.length) return radius;
		radius = val;
		return symbol;
	};

	symbol.type = function(x) {
		if (!arguments.length) return type;
		type = d3.functor(x);
		return symbol;
	};

	// size of symbol in square pixels
	symbol.size = function(x) {
		if (!arguments.length) return size;
		size = d3.functor(x);
		return symbol;
	};

	symbol.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return symbol;
	};

	return symbol;
};

d3.svg.symbolTypes = d3.keys(dv_svg_symbols);

// TODO cross-diagonal?
var dv_svg_symbols = {
	"circle": function(size, x, y) {
		var r = Math.sqrt(size / Math.PI);
		return "M" + x + "," + (y + r)
			+ "A" + r + "," + r + " 0 1,1 " + x + "," + (y - r)
			+ "A" + r + "," + r + " 0 1,1 " + x + "," + (y + r)
			+ "Z";
	},
	"cross": function(size, x, y) {
		var r = Math.sqrt(size / 5) / 2;
		return "M" + (x + -3 * r) + "," + (y - r)
			+ "H" + (x - r)
			+ "V" + (y + -3 * r)
			+ "H" + (x + r)
			+ "V" + (y - r)
			+ "H" + (x + 3 * r)
			+ "V" + (y + r)
			+ "H" + (x + r)
			+ "V" + (y + 3 * r)
			+ "H" + (x - r)
			+ "V" + (y + r)
			+ "H" + (x -3 * r)
			+ "Z";
	},
	"diamond": function(size, x, y) {
		var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
		return "M" + x + "," + (y - ry)
			+ "L" + (x + rx) + "," + y
			+ " " + x + "," + (y + ry)
			+ " " + (x - rx) + "," + y
			+ "Z";
	},
	"square": function(size, x, y) {
		var r = Math.sqrt(size) / 2;
		return "M" + (x - r) + "," + (y - r)
			+ "L" + (x + r) + "," + (y - r)
			+ " " + (x + r) + "," + (y + r)
			+ " " + (x - r) + "," + (y + r)
			+ "Z";
	},
	"triangle-down": function(size, x, y) {
		var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
		return "M" + x + "," + (y + ry)
			+ "L" + (x + rx) + "," + (y - ry)
			+ " " + (x - rx) + "," + (y - ry)
			+ "Z";
	},
	"triangle-up": function(size, x, y) {
		var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
		return "M" + x + "," + (y - ry)
			+ "L" + (x + rx) + "," + (y + ry)
			+ " " + (x - rx) + "," + (y + ry)
			+ "Z";
	}
};

function dv_svg_symbolSize() {
	return 64;
}

function dv_svg_symbolType() {
	return "circle";
}

function dv_svg_symbolX(d) {
	return d[0];
}

function dv_svg_symbolY(d) {
	return d[1];
}

function dv_svg_symbolDefined(d) {
	return true;
}

dv.svg.errorBar = function() {
	var x0 = dv_svg_errorBarX0,
		x1 = dv_svg_errorBarX1,
		y0 = dv_svg_errorBarY0,
		y1 = dv_svg_errorBarY1,
		flip = dv_svg_errorBarFlip,
		defined = dv_svg_errorBarDefined;

	function errorBar(d, i) {
		if (defined.call(this, d, i)) {
			return dv_svg_errorBar(x0.call(this, d, i), x1.call(this, d, i), y0.call(this, d, i), y1.call(this, d, i), flip.call(this, d, i));
		}
		return null;
	}

	errorBar.x0 = function(val) {
		if (!arguments.length) return x0;
		x0 = val;
		return errorBar;
	};

	errorBar.x1 = function(val) {
		if (!arguments.length) return x1;
		x1 = val;
		return errorBar;
	};

	errorBar.y0 = function(val) {
		if (!arguments.length) return y0;
		y0 = val;
		return errorBar;
	};

	errorBar.y1 = function(val) {
		if (!arguments.length) return y1;
		y1 = val;
		return errorBar;
	};

	errorBar.flip = function(val) {
		if (!arguments.length) return flip;
		flip = val;
		return errorBar;
	};

	errorBar.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return errorBar;
	};

	return errorBar;
};

function dv_svg_errorBarX0(d) {
	return d[0];
}

function dv_svg_errorBarX1(d) {
	return d[1];
}

function dv_svg_errorBarY0(d) {
	return d[2];
}

function dv_svg_errorBarY1(d) {
	return d[3];
}

function dv_svg_errorBarFlip() {
	return false;
}

function dv_svg_errorBarDefined() {
	return true;
}

function dv_svg_errorBar(x0, x1, y0, y1, flip) {
	var mid;
	if (flip) {
		mid = y0 + ((y1 - y0) / 2);
		return "M" + x0 + "," + y0 +
				"L" + x0 + "," + y1 +
				"M" + x0 + "," + mid +
				"L" + x1 + "," + mid +
				"M" + x1 + "," + y0 +
				"L" + x1 + "," + y1;
	}
	else {
		mid = x0 + ((x1 - x0) / 2);
		return "M" + x0 + "," + y0 +
				"L" + x1 + "," + y0 +
				"M" + mid + "," + y0 +
				"L" + mid + "," + y1 +
				"M" + x0 + "," + y1 +
				"L" + x1 + "," + y1;
	}
}

var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * Math.PI / 180);

var dv_svg_arcOffset = -Math.PI / 2;

//---------------------- Polygons

dv.svg.poly = function() {
	var defined = dv_svg_polyDefined,
		xs = dv_svg_poly_Xs,
		ys = dv_svg_poly_Ys;

	function poly(d, i) {
		if (defined.call(this, d, i)) {
			return dv_svg_poly(xs.call(this, d, i), ys.call(this, d, i));
		}

		return null;
	}

	poly.xs = function (val) {
		if (!arguments.length)
			return xs;
		xs = val;

		return poly;
	};

	poly.ys = function (val) {
		if (!arguments.length)
			return ys;
		ys = val;

		return poly;
	};

	poly.defined = function (val) {
		if (!arguments.length)
			return defined;
		defined = val;

		return defined;
	};

	return poly;
};

dv.svg.poly.radial = function() {
	var defined = dv_svg_polyDefined,
		angles = dv_svg_poly_Xs,
		radii = dv_svg_poly_Ys;

	function poly(d, i) {
		if (defined.call(this, d, i)) {
			var angs = angles.call(this, d, i);
			var rads = radii.call(this, d, i);
			var max_i = d3.max([angs.length, rads.length]);
			var rval = "M";

			for (var j = 0; j < max_i; j++) {
				if (j > 0) {
					rval += "L";
				}
				var a = angs[j] + dv_svg_arcOffset,
					r = rads[j],
					x = r * Math.cos(a),
					y = r * Math.sin(a);

				rval += (j < angs.length ? x : "0");
				rval += ",";
				rval += (j < rads.length ? y : "0");
			}

			rval += "Z";
			return rval;
		}

		return null;
	}

	poly.angles = function (val) {
		if (!arguments.length) return angles;
		angles = val;
		return poly;
	};

	poly.radii = function (val) {
		if (!arguments.length) return radii;
		radii = val;
		return poly;
	};

	poly.defined = function (val) {
		if (!arguments.length) return defined;
		defined = val;
		return defined;
	};

	return poly;
};

// Default poly functions
function dv_svg_polyDefined(d) {
	return true;
}

function dv_svg_poly_Xs(d) {
	return d[0];
}

function dv_svg_poly_Ys(d) {
	return d[1];
}

function dv_svg_poly(xs, ys) {
	var max_i = d3.max([xs.length, ys.length]);
	var rval = "M";

	for (var i = 0; i < max_i; i++) {
		if (i > 0) {
			rval += "L";
		}
		rval += (i < xs.length ? xs[i] : "0");
		rval += ",";
		rval += (i < ys.length ? ys[i] : "0");
	}

	rval += "Z";
	return rval;
}
dv.util = {};

/**
 * Converts a data format from an object of tuples:
 * {
 *      x: [0, 0, 1, 1, 2, 2],
 *      y: [10, 22, 43, 17, 23, 34],
 *      series: ['one', 'two', 'one', 'two', 'one', 'two']
 * }
 * into a zip array:
 * [
 *      {x: 0, y: 10, series: 'one'}
 *      {x: 1, y: 43, series: 'one'}
 *      {x: 2, y: 23, series: 'one'}
 * ]
 *
 * where the filterKey is the tuple we are grouping (ex. series) and filterValue is the value for which an object is included (ex. 'one').  If
 * no filterKey or filterValue are specified, no filtering will occur, but the tuples will still be transformed into a zip array.
 */
dv.util.filterAndZip = function(data, filterKey, filterValue) {
	var sampleArray = [],
		result = [];

	if (!filterKey) {
		// Grab the first tuple -- we assume they all have the same length.
		// TODO: How will this work if stats produces data of different length?
		for (var k in data) {
			sampleArray = data[k];
			break;
		}
	}
	else {
		sampleArray = data[filterKey]; // Otherwise we'll use the filter tuple instead.
	}

	var i = -1,
		len = sampleArray.length;
	while (++i < len) {
		var cursor = sampleArray[i];

		if (!filterValue || cursor == filterValue) {
			var sliceObj = {};
			for (var k2 in data) {
				if (k2 === "data") {
					sliceObj[k2] = {};
					for (var k3 in data[k2]) {
						sliceObj[k2][k3] = data[k2][k3][i];
					}
				} else {
					sliceObj[k2] = data[k2][i];
				}
			}
			result.push(sliceObj);
		}
	}

	return result;
};

dv.util.binaryCompare = function(a, x, f, lo, hi) {
	var tempLo = lo;

	if (arguments.length < 4) tempLo = 0;
	if (arguments.length < 5) hi = a.length;
	while (tempLo < hi) {
		var mid = (tempLo + hi) >> 1;
		if (x < f(a[mid])) hi = mid;
		else tempLo = mid + 1;
	}

	if (tempLo == lo || Math.abs(f(a[tempLo]) - x) < Math.abs(f(a[tempLo - 1]) - x)) return tempLo;
	else return tempLo - 1;
};

dv.util.uniqueValues = function(array, comparator) {
	var results = [];
	dv.util.each(array, function(value, index) {
		var i = -1,
			n = results.length,
			found = false;
		while (++i < n) {
			var seenVal = results[i];
			if (comparator(value, seenVal)) {
				found = true;
				break;
			}
		}

		if (!found) {
			results.push(array[i]);
		}
	});

	return results;
};

/**
 * Returns the range of the given scale.
 */
dv.util.scaleRange = function(scale, range) {
	if (arguments.length === 1) return scale.rangeExtent ? scale.rangeExtent() : scale.range();
	if (scale.rangeExtent)
		scale.rangeBands(range);
	else
		scale.range(range);
	return scale;
};

/**
 * Calculates the minimum distance between points. prop represents the property we are applying the distance
 * calculation to while nestData is a multidimensional array spanning facets and groups.
 */
dv.util.minRangeDistance = function(prop, nestData) {
	var minDistanceBetweenPoints = Number.MAX_VALUE,
		value,
		previousValue;

	dv.util.each(nestData, function(seriesData) {
		dv.util.each(seriesData.values, function(pointData) {
			value = pointData.panel.xScale(pointData).mapValue(pointData[prop]);
			if (!dv.util.isUndefined(previousValue)) {
				minDistanceBetweenPoints = Math.min(minDistanceBetweenPoints, Math.abs(value - previousValue));
			}
			previousValue = value;
		});
	});

	return minDistanceBetweenPoints;
};

/**
 * Returns the range of the given scale from min to max always.
 */
dv.util.scaleRangeNoReverse = function(scale) {
	return scale.rangeExtent ? scale.rangeExtent() : dv.util.scaleExtent(scale.range());
};

/**
 * Returns the extent of a given domain array.  It will always be ordered from min to max.
 */
dv.util.scaleExtent = function(domain) {
	var start = domain[0], stop = domain[domain.length - 1];
	return start < stop ? [ start, stop ] : [ stop, start ];
};

/**
 * Returns an object which is the result of merging the properties of the two objects. obj2 takes
 * precedence over obj1 when they have like properties.  Neither objects are changed.
 */
dv.util.merge = function(obj1, obj2) {
	var retVal = {};
	var prop;
	for (prop in obj1) { retVal[prop] = obj1[prop]; }
	for (prop in obj2) { retVal[prop] = obj2[prop]; }
	return retVal;
};

/**
 *	Returns the hard value based on the percent in "value" relative to "relativeValue".
 */
dv.util.getPercentValue = function(value, relativeValue) {
	return (dv.util.isPercentString(value)) ? (relativeValue * parseInt(value, 10) / 100) : value;
};

dv.util.isPercentString = function(value) {
	return (typeof value === "string" && /^(-?[0-9]+)%$/.test(value));
};

dv.util.isValidValue = function(val, tests) {
	for (var i = 0; i < tests.length; i++) {
		if (dv.util[tests[i]](val)) return true;
	}
	return false;
};

dv.util.identity = function(value) {
	return value;
};

dv.util.clamp = function(val, min, max) {
	return Math.min(Math.max(val, min), max);
};

dv.util.clone = function(obj) {
	if (!dv.util.isObject(obj)) return obj;
	return dv.util.isArray(obj) ? obj.slice() : dv.util.extend({}, obj);
};

dv.util.isArray = function(obj) {
	if (Array.isArray) return Array.isArray(obj);
	return Object.prototype.toString.call(obj) == '[object Array]';
};

dv.util.isObject = function(obj) {
	return obj === Object(obj);
};

dv.util.isFunction = function(obj) {
	return Object.prototype.toString.call(obj) == '[object Function]';
};

dv.util.isUndefined = function(obj) {
	return obj === void 0;
};

dv.util.isFinite = function(obj) {
	return isFinite(obj) && !isNaN(parseFloat(obj));
};

dv.util.isDate = function(obj) {
	return obj instanceof Date;
};

dv.util.isEmpty = function(obj) {
	return Object.keys(obj).length === 0;
};

dv.util.extend = function(obj) {
	dv.util.each(Array.prototype.slice.call(arguments, 1), function(source) {
		for (var prop in source) {
			obj[prop] = source[prop];
		}
	});
	return obj;
};

dv.util.each = function(obj, iterator, context) {
	if (obj == null) return;
	if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (var i = 0, l = obj.length; i < l; i++) {
			if (iterator.call(context, obj[i], i, obj) === {}) return;
		}
	} else {
		for (var key in obj) {
			if (dv.util.has(obj, key)) {
				if (iterator.call(context, obj[key], key, obj) === {}) return;
			}
		}
	}
};

dv.util.has = function(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
};

dv.util.uniq = function(array, isSorted, iterator, context) {
	if (dv.util.isFunction(isSorted)) {
		context = iterator;
		iterator = isSorted;
		isSorted = false;
	}
	var initial = iterator ? dv.util.map(array, iterator, context) : array;
	var results = [];
	var seen = [];
	dv.util.each(initial, function(value, index) {
		if (isSorted ? (!index || seen[seen.length - 1] !== value) : !dv.util.contains(seen, value)) {
			seen.push(value);
			results.push(array[index]);
		}
	});
	return results;
};

dv.util.union = function() {
	return dv.util.uniq(Array.prototype.concat.apply(Array.prototype, arguments));
};

dv.util.contains = function(obj, target) {
	if (obj == null) return false;
	if (Array.prototype.indexOf && obj.indexOf === Array.prototype.indexOf) return obj.indexOf(target) != -1;
	return dv.util.any(obj, function(value) {
		return value === target;
	});
};

dv.util.any = function(obj, iterator, context) {
	if (!iterator)
		iterator = dv.util.identity;
	var result = false;
	if (obj == null) return result;
	if (Array.prototype.some && obj.some === Array.prototype.some) return obj.some(iterator, context);
	dv.util.each(obj, function(value, index, list) {
		if (result || (result = iterator.call(context, value, index, list))) return {};
	});
};

dv.util.sortBy = function(obj, value, context) {
	var lookupIterator = function(value) { return dv.util.isFunction(value) ? value : function(obj) { return obj[value]; }; };
	var iterator = lookupIterator(value);
	return dv.util.pluck(dv.util.map(obj, function(value, index, list) {
		return {
			value: value,
			index: index,
			criteria: iterator.call(context, value, index, list)
		};
	}).sort(function(left, right) {
		var a = left.criteria;
		var b = right.criteria;
		if (a !== b) {
			if (a > b || a === void 0) return 1;
			if (a < b || b === void 0) return -1;
		}
		return left.index < right.index ? -1 : 1;
	}), 'value');
};

dv.util.pluck = function(obj, key) {
	return dv.util.map(obj, function(value) { return value[key]; });
};

dv.util.map = function(obj, iterator, context) {
	var results = [];
	if (obj === null) return results;
	if (Array.prototype.map && obj.map === Array.prototype.map) return obj.map(iterator, context);
	dv.util.each(obj, function(value, index, list) {
		results[results.length] = iterator.call(context, value, index, list);
	});
	return results;
};

dv.util.reduce = function(obj, iterator, memo, context) {
	var initial = arguments.length > 2;
	if (obj === null) obj = [];
	if (Array.prototype.reduce && obj.reduce === Array.prototype.reduce) {
		if (context) iterator = dv.util.bind(iterator, context);
		return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
	}
	dv.util.each(obj, function(value, index, list) {
		if (!initial) {
			memo = value;
			initial = true;
		} else {
			memo = iterator.call(context, memo, value, index, list);
		}
	});
	if (!initial) throw new TypeError("Reduce of empty array with no initial value");
	return memo;
};

dv.util.bind = function(func, context) {
	if (func.bind === Function.prototype.bind && Function.prototype.bind) return Function.prototype.bind.apply(func, Array.prototype.slice.call(arguments, 1));
	var args = Array.prototype.slice.call(arguments, 2);
	return function() {
		return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
	};
};

dv.util.noop = function() {};

dv.util.each(['Arguments', 'String', 'Number', 'RegExp'], function(name) {
    dv.util['is' + name] = function(obj) {
		return toString.call(obj) == '[object ' + name + ']';
	};
});

dv.util.validateParam = function(param, type, range, defaultVal) {
	if (type === 'isString') {
		if (dv.util.isString(param)) {
			if (dv.util.isArray(range) && (range.indexOf(param.toLowerCase()) !== -1)) return param.toLowerCase();
		}
		return defaultVal;
	} else if (type === 'isNumber') {
		if (dv.util.isNumber(param)){
			if (dv.util.isArray(range) && (param <= range[1] && param >= range[0])) return param;
		}
		return defaultVal;
	} else if (type === 'isFunction') {
		if (dv.util.isFunction(param)) return param;
		return defaultVal;
	} else if (type === 'isDimension') {
		if (param === 'x' || param === 'X') return 'x';
		if (param === 'y' || param === 'Y') return 'y';
		if (param === ['x','y'] || param === ['X','y'] || param === ['x','Y'] || param === ['X','Y']) return ['x','y'];
		return defaultVal;
	} else if (type === 'isRange') {
		var minVal = range[0], maxVal = range[1];
		if (dv.util.isArray(param) && param.length === 2){
			if (dv.util.isNumber(param[0]) && dv.util.isNumber(param[1])){
				minVal = Math.max(Math.min(param[0],param[1]),range[0]);
				maxVal = Math.min(Math.max(param[0],param[1]),range[1]);
			}
			return [minVal,maxVal];
		}
		return defaultVal;
	}
};

dv.util = dv.util || {};
dv.util.svg = {};

// Allows passing in user-friendly linetype formats such as solid, dashed, dotted, etc (see dv.scale.linetype for accepted values) and
// returns a dasharray. If the key is already in dasharray format, it just returns itself.
dv.util.svg.getDasharray = function(key) {
	if (key.indexOf(',') != -1 || key.indexOf(' ') != -1) return key; // It's already in dasharray format just return it.
	if (dv_dasharray.hasOwnProperty(key)) return dv_dasharray[key];
	throw new Error("The dashed line format is invalid");
};

var dv_dasharray = {
	"solid": "",
	"dashed": "7,4",
	"dotted": "2,3",
	"dotdash": "2,3,7,4",
	"longdash": "11,4",
	"twodash": "5,2,11,2"
};
dv.container = dv.extend(function() {
	var dv_container_defaultScales = {
		'x': dv.scale.linear,
		'y': dv.scale.linear,
		'yMin': dv.scale.linear,
		'yMax': dv.scale.linear,
		'xMin': dv.scale.linear,
		'xMax': dv.scale.linear,
		'color': dv.scale.color,
		'fill': dv.scale.color,
		'stroke': dv.scale.color,
		'alpha': dv.scale.linear,
		'shape': dv.scale.shape,
		'size': dv.scale.size,
		'radius': dv.scale.linear,
		'group': dv.scale.ordinal,
		'linetype': dv.scale.linetype,
		'label': dv.scale.identity
	};

	function container() {
		this._aes = {};
	}

	container.render = function() {
		throw new Error("render() must be implemented in a subclass");
	};

	container._calculateStats = function() {
		throw new Error("_calculateStats() must be implemented in a subclass");
	};

	container._handlePositions = function() {
		throw new Error("_handlePositions() must be implemented in a subclass");
	};

	container.getTrainedScale = function(prop) {
		throw new Error("getTrainedScale() must be implemented in a subclass");
	};

	container.getExplicitScalesMap = function() {
		return this._aes;
	};

	container._normalizeData = function(data) {
		// The data is already normalized, return it back out.
		if (data.hasOwnProperty("data") && !dv.util.isArray(data.data)) return data;

		var normalizedData = {},
			map = this.getExplicitScalesMap(),
			scale,
			self = this;
		dv.util.each(map, function(d, i) {
			for (var scaleIndex in d) {
				scale = d[scaleIndex];
				if (!(scale instanceof dv.scale.constant)) {
					var arr = data[scale.mapping()];

					if (dv.util.isArray(arr)) {
						var parsedArr = arr.map(function(d) {
							if (dv.util.isArray(d)) {
								return d.map(function(subD) {
									return scale._parse(subD);
								});
							}
							else {
								return scale._parse(d);
							}
						});
						normalizedData[scale.property()] = parsedArr;
					}
				}
			}
		});
		normalizedData.data = data;
		return normalizedData;
	};

	container.map = function(property, mapping, scale, scaleIndex) {
		//	We capture when the default is used, so that we can determine if chart settings should override the individual scale's.
		//	For example, if the chart defines explicit bounds (which the default scale doesn't), then properties mapped with the
		//	default scale, will not train to honor the chart's bounds.
		if (!scale) scale = dv_container_defaultScales[property]().copy().isDefault(true);
		if (!scale) throw new Error("There is no default scale associated with this property. Either the property isn't valid or the scale default doesn't exist.");
		if (arguments.length < 4) scaleIndex = 0;
		if (!this._aes[property]) this._aes[property] = {};
		this._aes[property][scaleIndex] = scale.property(property).mapping(mapping).scaleIndex(scaleIndex);
		return this;
	};

	// TODO: container.set may want to accept a scaleIndex in the future to make it match with map, although this isn't
	// necessary at this point in time.
	container.set = function(property, val) {
		if (!this._aes[property]) this._aes[property] = {};
		var scale = this._aes[property][0] = dv.scale.constant();
		if (dv.util.isFunction(val)) {
			scale.map = scale.mapToProp = val;
		}
		else scale.value(val);
		return this;
	};

	container.on = function(eventType, callback, capture) {
		if (arguments.length < 3) {
			capture = false;
		}
		var adding = callback && dv.util.isFunction(callback);
		if (adding) {
			this.eventMap = this.eventMap || {};
			this.eventMap[eventType] = {callback: callback, capture: capture};
		}
		else {
			if (this.eventMap) delete this.eventMap[eventType];
			this.unregisterEventMap = this.unregisterEventMap || {};
			this.unregisterEventMap[eventType] = capture;
		}

		this._removeRegisteredEvents();
		this._addRegisteredEvents();

		return this;
	};

	// Positions include:
	// dodge
	// fill
	// identity
	// jitter -- not currently supported
	// stack
	// Grammar of Graphics, p. 59
	container.position = function(val) {
		if (!arguments.length) return (this._chart && !this._position) ? this._chart.position() : this._position;
		this._position = val;
		return this;
	};

	container.delay = function(val) {
		if (!arguments.length) return (this._chart && dv.util.isUndefined(this._delay)) ? this._chart.delay() : this._delay;
		this._delay = d3.functor(val);
		return this;
	};

	container.duration = function(val) {
		if (!arguments.length) return (this._chart && dv.util.isUndefined(this._duration)) ? this._chart.duration() : this._duration;
		this._duration = d3.functor(val);
		return this;
	};

	container.ease = function(val) {
		if (!arguments.length) return (this._chart && dv.util.isUndefined(this._ease)) ? this._chart.ease() : this._ease;
		this._ease = val;
		return this;
	};

	return container;
});
dv.coord = dv.extend(function() {
	function coord() {
		this._flip = false;
	}

	coord.flip = function(val) {
		if (!arguments.length) return this._flip;
		this._flip = val;
		return this;
	};

	coord.startX = function(val) {
		if (!arguments.length) return this._startX;
		if (!dv.util.isValidValue(val, ["isFinite", "isPercentString"])) dv.log.error({msg: "Invalid value type, startX/startAngle must be a number or percent string", data: {val: val}});
		this._startX = val;
		return this;
	};

	coord.endX = function(val) {
		if (!arguments.length) return this._endX;
		if (!dv.util.isValidValue(val, ["isFinite", "isPercentString"])) dv.log.error({msg: "Invalid value type, endX/endAngle must be a number or percent string", data: {val: val}});
		this._endX = val;
		return this;
	};

	coord.startY = function(val) {
		if (!arguments.length) return this._startY;
		if (!dv.util.isValidValue(val, ["isFinite", "isPercentString"])) dv.log.error({msg: "Invalid value type, startY/innerRadius must be a number or percent string", data: {val: val}});
		this._startY = val;
		return this;
	};

	coord.endY = function(val) {
		if (!arguments.length) return this._endY;
		if (!dv.util.isValidValue(val, ["isFinite", "isPercentString"])) dv.log.error({msg: "Invalid value type, endY/outerRadius must be a number or percent string", data: {val: val}});
		this._endY = val;
		return this;
	};
	return coord;
});

dv.coord.cartesian = dv.coord.extend(function() {
	function cartesian() {
		this._super();
		this.startX(0);
		this.endX(0);
		this.startY(0);
		this.endY(0);
		this._type = "cartesian";
	}

	cartesian._translatePercentToX = function(scale, percent) {
		var range = dv.util.scaleRange(scale),
			val = this._translatePercent(percent, range, this.startX(), this.endX()),
			rangeDist = Math.abs(range[1] - range[0]) * 3;
		// Depending on the domain, we can get into situations where the y value we are returning is extremely negative (e.g. -15023491243.234871)
		// or extremely positive.  When this happens, we get some rendering artifacts introduced by the browser.  By constraining how far out
		// these points can be rendered (should be outside the visible area), we can avoid some of these rendering pitfalls.
		return dv.util.clamp(val, range[0] - rangeDist, range[1] + rangeDist);
	};

	cartesian._translatePercentToY = function(scale, percent) {
		var range = dv.util.scaleRange(scale),
			val = this._translatePercent(percent, range, this.startY(), this.endY()),
			rangeDist = Math.abs(range[1] - range[0]) * 3;
		// Depending on the domain, we can get into situations where the y value we are returning is extremely negative (e.g. -15023491243.234871)
		// or extremely positive.  When this happens, we get some rendering artifacts introduced by the browser.  By constraining how far out
		// these points can be rendered (should be outside the visible area), we can avoid some of these rendering pitfalls.
		return dv.util.clamp(val, range[1] - rangeDist, range[0] + rangeDist);
	};

	cartesian._translatePercent = function(percent, range, start, end) {
		return (((range[1] - range[0]) - end - start) * percent + start + range[0]);
	};

	cartesian._translatePercentArrToY = function(scale, percentArr) {
		var self = this;
		return dv.util.map(percentArr, function(percent) {
			return self._translatePercentToY(scale, percent);
		});
	};

	cartesian._translatePercentArrToX = function(scale, percentArr) {
		var self = this;
		return dv.util.map(percentArr, function(percent) {
			return self._translatePercentToX(scale, percent);
		});
	};

	cartesian._text = function() {
		var self = this;

		function text() {
			var renderer = dv.svg.text();
			if (self._flip) {
				return renderer
					.x( function(d, i) { return self._translatePercentToY(d.panel.yOuterScale(), text.y()(d, i)); })
					.y( function(d, i) { return self._translatePercentToX(d.panel.xOuterScale(), text.x()(d, i)); });
			}
			else {
				return renderer
					.x( function(d, i) { return self._translatePercentToX(d.panel.xOuterScale(), text.x()(d, i)); })
					.y( function(d, i) { return self._translatePercentToY(d.panel.yOuterScale(), text.y()(d, i)); });
			}
		}

		text.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		text.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		return text;
	};

	cartesian._point = function() {
		var self = this,
			point = {};

		point.renderer = dv.svg.symbol()
			.x(function(d, i) { return d.bounds.x; })
			.y(function(d, i) { return d.bounds.y; });

		point.getBounds = function(d, i) {
			if (!d.hasOwnProperty('y')) d.y = 0;
			if (!d.hasOwnProperty('x')) d.x = 0;
			if (!point._defined(d, i)) return null;
			if (self._flip) {
				d.bounds = {
					x: self._translatePercentToY(d.panel.yOuterScale(), point.y()(d, i)),
					y: self._translatePercentToX(d.panel.xOuterScale(), point.x()(d, i))
				};
			}
			else {
				d.bounds =  {
					x: self._translatePercentToX(d.panel.xOuterScale(), point.x()(d, i)),
					y: self._translatePercentToY(d.panel.yOuterScale(), point.y()(d, i))
				};
			}
			return d;
		};

		point.getPath = function(obj) {
			return (obj === null || obj.bounds === undefined) ? null : point.renderer(obj);
		};

		point.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return point;
		};

		point.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return point;
		};

		point.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return point;
	};

	cartesian._line = function() {
		var self = this,
			line = {};

		line.renderer = d3.svg.line()
				.x(function(d, i) { return d.bounds.x; })
				.y(function(d, i) { return d.bounds.y; });

		line.getBounds = function(seriesD, seriesI) {
			var retVal = [];
			dv.util.each(seriesD, function(d, i) {
				if (!d.hasOwnProperty('y')) d.y = 0;
				if (!d.hasOwnProperty('x')) d.x = 0;
				if (line._defined(d, i)) {
					if (self._flip) {
						d.bounds = {
							x: self._translatePercentToY(d.panel.yOuterScale(), line.y()(d, i)),
							y: self._translatePercentToX(d.panel.xOuterScale(), line.x()(d, i))
						};
					} else {
						d.bounds = {
							x: self._translatePercentToX(d.panel.xOuterScale(), line.x()(d, i)),
							y: self._translatePercentToY(d.panel.yOuterScale(), line.y()(d, i))
						};
					}
					retVal.push(seriesD[i]);
				}
			});
			return retVal;
		};

		line.getPath = function(obj) {
			return (obj === null) ? null : line.renderer(obj);
		};

		line.x = function(val) {
			if (!arguments.length) return this._x;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.x must be a function", data: {val: val}});
			this._x = val;
			return this;
		};

		line.y = function(val) {
			if (!arguments.length) return this._y;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.y must be a function", data: {val: val}});
			this._y = val;
			return this;
		};

		line.defined = function(val) {
			if (!arguments.length) return this._defined;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.defined must be a function", data: {val: val}});
			this._defined = val;
			return this;
		};

		return line;
	};

	cartesian._area = function() {
		var self = this,
			area = {};

		area.renderer = d3.svg.area();

		area.getBounds = function(seriesD, seriesI) {
			var sd = [];
			area.setupRenderer();
			dv.util.each(seriesD, function(d, i) {
				if (!d.hasOwnProperty('y')) d.y = 0;
				if (!d.hasOwnProperty('x')) d.x = 0;
				if (area._defined(d, i)) {
					var newD = dv.util.clone(d);
					newD.bounds = {
						x: self._translatePercentToX(d.panel.xOuterScale(), area.x()(d, i)),
						y0: self._translatePercentToY(d.panel.yOuterScale(), area.y0()(d, i)),
						y1: self._translatePercentToY(d.panel.yOuterScale(), area.y1()(d, i))
					};
					sd.push(newD);
				}
			});
			return sd;
		};

		area.getPath = function(obj) {
			area.setupRenderer();
			return (obj === null) ? null : area.renderer(obj);
		};

		area.setupRenderer = function() {
			if (self._flip) {
				area.renderer.x(null)
					.y0(null)
					.y1(null)
					.y(function(d, i) { return d.bounds.x; })
					.x0(function(d, i) { return d.bounds.y0; })
					.x1(function(d, i) { return d.bounds.y1; });
			}
			else {
				area.renderer.y(null)
					.x0(null)
					.x1(null)
					.x(function(d, i) { return d.bounds.x; })
					.y0(function(d, i) { return d.bounds.y0; })
					.y1(function(d, i) { return d.bounds.y1; });
			}
		};

		area.x = function(val) {
			if (!arguments.length) return this._x;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, area.x must be a function", data: {val: val}});
			this._x = val;
			return this;
		};

		area.y0 = function(val) {
			if (!arguments.length) return this._y0;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, area.y0 must be a function", data: {val: val}});
			this._y0 = val;
			return this;
		};

		area.y1 = function(val) {
			if (!arguments.length) return this._y1;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, area.y1 must be a function", data: {val: val}});
			this._y1 = val;
			return this;
		};

		area.defined = function(val) {
			if (!arguments.length) return this._defined;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, area.defined must be a function", data: {val: val}});
			this._defined = val;
			return this;
		};

		return area;
	};

	cartesian._rect = function() {
		var self = this,
			rect = {};

		rect.renderer = dv.svg.rect()
			.x0(function(d, i) { return d.bounds.x0; })
			.x1(function(d, i) { return d.bounds.x1; })
			.y0(function(d, i) { return d.bounds.y0; })
			.y1(function(d, i) { return d.bounds.y1; });

		rect.getBounds = function(d, i) {
			var newD = dv.util.clone(d);
			var xVal = newD[d.panel.xScale(d).property()];
			if (dv.util.isArray(xVal)) {
				newD.x0 = xVal[0];
				newD.x1 = xVal[1];
			}
			var yVal = newD[d.panel.yScale(d).property()];
			if (dv.util.isArray(yVal)) {
				newD.y0 = yVal[0];
				newD.y1 = yVal[1];
			}
			if (!rect._defined(newD, i)) return null;
			if (self._flip) {
				newD.bounds = {
					x0: self._translatePercentToY(d.panel.yOuterScale(), rect.y0()(newD, i)),
					x1: self._translatePercentToY(d.panel.yOuterScale(), rect.y1()(newD, i)),
					y0: self._translatePercentToX(d.panel.xOuterScale(), rect.x0()(newD, i)),
					y1: self._translatePercentToX(d.panel.xOuterScale(), rect.x1()(newD, i))
				};
			} else {
				newD.bounds = {
					x0: self._translatePercentToX(d.panel.xOuterScale(), rect.x0()(newD, i)),
					x1: self._translatePercentToX(d.panel.xOuterScale(), rect.x1()(newD, i)),
					y0: self._translatePercentToY(d.panel.yOuterScale(), rect.y0()(newD, i)),
					y1: self._translatePercentToY(d.panel.yOuterScale(), rect.y1()(newD, i))
				};
			}
			return newD;
		};

		rect.getPath = function(obj) {
			return (obj === null) ? null : rect.renderer(obj);
		};

		rect.x0 = function(val) {
			if (!arguments.length) return this._x0;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.x0 must be a function", data: {val: val}});
			this._x0 = val;
			return this;
		};

		rect.x1 = function(val) {
			if (!arguments.length) return this._x1;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.x1 must be a function", data: {val: val}});
			this._x1 = val;
			return this;
		};

		rect.y0 = function(val) {
			if (!arguments.length) return this._y0;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.y0 must be a function", data: {val: val}});
			this._y0 = val;
			return this;
		};

		rect.y1 = function(val) {
			if (!arguments.length) return this._y1;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.y1 must be a function", data: {val: val}});
			this._y1 = val;
			return this;
		};

		rect.defined = function(val) {
			if (!arguments.length) return this._defined;
			if (!dv.util.isValidValue(val, ["isFunction"])) dv.log.error({msg: "Invalid value, line.defined must be a function", data: {val: val}});
			this._defined = val;
			return this;
		};

		return rect;
	};

	cartesian._errorBar = function() {
		var self = this,
			errorBar = {};

		errorBar.renderer = dv.svg.errorBar()
			.x0(function(d, i) { return d.bounds.x0; })
			.x1(function(d, i) { return d.bounds.x1; })
			.y0(function(d, i) { return d.bounds.y0; })
			.y1(function(d, i) { return d.bounds.y1; })
			.flip(function() { return self._flip; });

		errorBar.getBounds = function(d, i) {
			var newD = dv.util.clone(d);
			if (!errorBar._defined(newD, i)) return null;
			if (self._flip) {
				newD.bounds = {
					x0: self._translatePercentToY(d.panel.yOuterScale(), errorBar.y0()(newD, i)),
					x1: self._translatePercentToY(d.panel.yOuterScale(), errorBar.y1()(newD, i)),
					y0: self._translatePercentToX(d.panel.xOuterScale(), errorBar.x0()(newD, i)),
					y1: self._translatePercentToX(d.panel.xOuterScale(), errorBar.x1()(newD, i))
				};
			} else {
				newD.bounds = {
					x0: self._translatePercentToX(d.panel.xOuterScale(), errorBar.x0()(newD, i)),
					x1: self._translatePercentToX(d.panel.xOuterScale(), errorBar.x1()(newD, i)),
					y0: self._translatePercentToY(d.panel.yOuterScale(), errorBar.y0()(newD, i)),
					y1: self._translatePercentToY(d.panel.yOuterScale(), errorBar.y1()(newD, i))
				};
			}
			return newD;
		};

		errorBar.getPath = function(obj) {
			return (obj === null) ? null : errorBar.renderer(obj);
		};

		errorBar.x0 = function(val) {
			if (!arguments.length) return this._x0;
			this._x0 = val;
			return this;
		};

		errorBar.x1 = function(val) {
			if (!arguments.length) return this._x1;
			this._x1 = val;
			return this;
		};

		errorBar.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		errorBar.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		errorBar.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return errorBar;
	};

	cartesian._poly = function() {
		var self = this,
			poly = {};

		poly.renderer = dv.svg.poly()
			.xs(function(d, i) { return d.bounds.x; })
			.ys(function(d, i) { return d.bounds.y; });

		poly.getBounds = function(d, i) {
			var newD = dv.util.clone(d);
			if (poly._defined(d, i)) {
				if (self._flip) {
					newD.bounds = {
						x: self._translatePercentArrToY(d.panel.yOuterScale(), poly.ys()(d, i)),
						y: self._translatePercentArrToX(d.panel.xOuterScale(), poly.xs()(d, i))
					};
				} else {
					newD.bounds = {
						x: self._translatePercentArrToX(d.panel.xOuterScale(), poly.xs()(d, i)),
						y: self._translatePercentArrToY(d.panel.yOuterScale(), poly.ys()(d, i))
					};
				}
			}
			return newD;
		};

		poly.getPath = function(obj) {
			return (obj === null) ? null : poly.renderer(obj);
		};

		poly.xs = function(val) {
			if (!arguments.length) return this._xs;
			this._xs = val;
			return this;
		};

		poly.ys = function(val) {
			if (!arguments.length) return this._ys;
			this._ys = val;
			return this;
		};

		poly.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return poly;
	};

	return cartesian;
});
dv.coord.polar = dv.coord.extend(function() {
	function polar() {
		this._super();
		this.innerRadius = this.startY;
		this.outerRadius = this.endY;
		this.startAngle = this.startX;
		this.endAngle = this.endX;
		this.innerRadius(0);
		this.outerRadius(0);
		this.startAngle(0);
		this.endAngle(360);
		this._type = "polar";
	}

	polar._transformAngleRadiusToXY = function(angle, radius) {
		angle += -1.570796327; // -Math.PI / 2;
		return [radius * Math.cos(angle), radius * Math.sin(angle)];
	};

	polar._translatePercentToRadius = function(range, percent) {
		var radius = Math.abs(range[1] - range[0]) / 2,
			innerRadius = dv.util.getPercentValue(this.innerRadius(), radius),
			outerRadius = dv.util.getPercentValue(this.outerRadius(), radius);
		return (radius - outerRadius - innerRadius) * percent + innerRadius;
	};

	polar._translatePercentToTheta = function(scale, percent) {
		var maxAngle = 360,
			sa = dv.util.getPercentValue(this.startAngle(), maxAngle),
			ea = dv.util.getPercentValue(this.endAngle(), maxAngle),
			degrees = (ea - sa) * percent + sa;
		return degrees * 0.017453293; // Math.PI / 180
	};

	polar._translatePercentArrToRadius = function(range, percentArr) {
		var self = this;
		return dv.util.map(percentArr, function(percent) {
			return self._translatePercentToRadius(range, percent);
		});
	};

	polar._translatePercentArrToTheta = function(scale, percentArr) {
		var self = this;
		return dv.util.map(percentArr, function(percent) {
			return self._translatePercentToTheta(scale, percent);
		});
	};

	polar._getRadiusRange = function(scale1, scale2) {
		var range1 = dv.util.scaleRange(scale1),
			range2 = dv.util.scaleRange(scale2);
		return [0, Math.min(Math.abs(range1[1] - range1[0]), Math.abs(range2[1] - range2[0]))];
	};

	polar._text = function() {
		var self = this;

		function text() {
			var renderer = dv.svg.text.radial();
			if (self._flip) {
				return renderer
					.angle(function(d, i) { return self._translatePercentToTheta(d.panel.yOuterScale(), text.y()(d, i)); })
					.radius(function(d, i) { return self._translatePercentToRadius(self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale()), text.x()(d, i)); });
			}
			else {
				return renderer
					.angle(function(d, i) { return self._translatePercentToTheta(d.panel.xOuterScale(), text.x()(d, i)); })
					.radius(function(d, i) { return self._translatePercentToRadius(self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale()), text.y()(d, i)); });
			}
		}

		text.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		text.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		return text;
	};

	polar._point = function() {
		var self = this,
			point = {};

		point.renderer = dv.svg.symbol.radial()
			.angle(function(d, i) { return d.bounds.x; })
			.radius(function(d, i) { return d.bounds.y; });

		point.getBounds = function(d, i) {
			if (!d.hasOwnProperty('y')) d.y = 0;
			if (!d.hasOwnProperty('x')) d.x = 0;
			if (point._defined(d, i)) {
				var radiusRange = self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale());
				if (self._flip) {
					d.bounds = {
						x: self._translatePercentToTheta(d.panel.xOuterScale(), point.y()(d, i)),
						y: self._translatePercentToRadius(radiusRange, point.x()(d, i))
					};
				}
				else {
					d.bounds = {
						x: self._translatePercentToTheta(d.panel.xOuterScale(), point.x()(d, i)),
						y: self._translatePercentToRadius(radiusRange, point.y()(d, i))
					};
				}
			}
			return d;
		};

		point.getPath = function(obj) {
			return (obj === null || dv.util.isUndefined(obj.bounds)) ? null : point.renderer(obj);
		};

		point.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		point.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		point.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return point;
	};

	polar._line = function() {
		var self = this,
			line = {};

		line.renderer = d3.svg.line.radial()
				.angle(function(d, i) { return d.bounds.x; })
				.radius(function(d, i) { return d.bounds.y; });

		line.getBounds = function(seriesD, seriesI) {
			var retVal = [];
			dv.util.each(seriesD, function(d, i) {
				var radiusRange = self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale());
				if (!d.hasOwnProperty('y')) d.y = 0;
				if (!d.hasOwnProperty('x')) d.x = 0;
				if (line._defined(d, i)) {
					if (self._flip) {
						d.bounds = {
							x: self._translatePercentToTheta(d.panel.xOuterScale(), line.y()(d, i)),
							y: self._translatePercentToRadius(radiusRange, line.x()(d, i))
						};
					} else {
						d.bounds = {
							x: self._translatePercentToTheta(d.panel.xOuterScale(), line.x()(d, i)),
							y: self._translatePercentToRadius(radiusRange, line.y()(d, i))
						};
					}
					retVal.push(seriesD[i]);
				}
			});
			return retVal;
		};

		line.getPath = function(obj) {
			return (obj === null) ? null : line.renderer(obj);
		};

		line.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		line.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		line.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return line;
	};

	polar._area = function() {
		var self = this,
			area = {};

		area.renderer = d3.svg.area.radial();

		area.getBounds = function(seriesD, seriesI) {
			var sd = [];
			area.setupRenderer();
			dv.util.each(seriesD, function(d, i) {
				var radiusRange = self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale());
				if (!d.hasOwnProperty('y')) d.y = 0;
				if (!d.hasOwnProperty('x')) d.x = 0;
				if (area._defined(d, i)) {
					var newD = dv.util.clone(d);
					if (self._flip) {
						newD.bounds = {
							x: self._translatePercentToRadius(radiusRange, area.x()(d, i)),
							y0: self._translatePercentToTheta(d.panel.xOuterScale(), area.y0()(d, i)),
							y1: self._translatePercentToTheta(d.panel.xOuterScale(), area.y1()(d, i))
						};
					} else {
						newD.bounds = {
							x: self._translatePercentToTheta(d.panel.xOuterScale(), area.x()(d, i)),
							y0: self._translatePercentToRadius(radiusRange, area.y0()(d, i)),
							y1: self._translatePercentToRadius(radiusRange, area.y1()(d, i))
						};
					}
					sd.push(newD);
				}
			});
			return sd;
		};

		area.getPath = function(obj) {
			area.setupRenderer();
			return (obj === null) ? null : area.renderer(obj);
		};

		area.setupRenderer = function() {
			if (self._flip) {
				area.renderer.angle(null)
					.innerRadius(null)
					.outerRadius(null)
					.radius(function(d, i) { return d.bounds.x; })
					.startAngle(function(d, i) { return d.bounds.y0; })
					.endAngle(function(d, i) { return d.bounds.y1; });
			}
			else {
				area.renderer.radius(null)
					.startAngle(null)
					.endAngle(null)
					.angle(function(d, i) { return d.bounds.x; })
					.innerRadius(function(d, i) { return d.bounds.y0; })
					.outerRadius(function(d, i) { return d.bounds.y1; });
			}
		};

		area.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		area.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		area.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		area.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return area;
	};

	polar._rect = function() {
		var self = this,
			rect = {};

		rect.renderer = d3.svg.arc()
			.startAngle(function(d, i) { return d.bounds.x0; })
			.endAngle(function(d, i) { return d.bounds.x1; })
			.innerRadius(function(d, i) { return d.bounds.y0; })
			.outerRadius(function(d, i) { return d.bounds.y1; });

		rect.getBounds = function(d, i) {
			var newD = dv.util.clone(d);
			if (!rect._defined(newD, i)) return null;

			var radiusRange = self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale());

			if (self._flip) {
				newD.bounds = {
					x0: self._translatePercentToTheta(d.panel.yOuterScale(), rect.y0()(newD, i)),
					x1: self._translatePercentToTheta(d.panel.yOuterScale(), rect.y1()(newD, i)),
					y0: self._translatePercentToRadius(radiusRange, rect.x0()(newD, i)),
					y1: self._translatePercentToRadius(radiusRange, rect.x1()(newD, i))
				};
			} else {
				newD.bounds = {
					x0: self._translatePercentToTheta(d.panel.xOuterScale(), rect.x0()(newD, i)),
					x1: self._translatePercentToTheta(d.panel.xOuterScale(), rect.x1()(newD, i)),
					y0: self._translatePercentToRadius(radiusRange, rect.y0()(newD, i)),
					y1: self._translatePercentToRadius(radiusRange, rect.y1()(newD, i))
				};
			}
			return newD;
		};

		rect.getPath = function(obj) {
			return (obj === null) ? null : rect.renderer(obj);
		};

		rect.x0 = function(val) {
			if (!arguments.length) return this._x0;
			this._x0 = val;
			return this;
		};

		rect.x1 = function(val) {
			if (!arguments.length) return this._x1;
			this._x1 = val;
			return this;
		};

		rect.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		rect.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		rect.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return rect;
	};

	polar._poly = function() {
		var self = this,
			poly = {};

		poly.renderer = dv.svg.poly.radial()
			.angles(function(d, i) { return d.bounds.x; })
			.radii(function(d, i) { return d.bounds.y; });

		poly.getBounds = function(d, i) {
			var newD = dv.util.clone(d);
			if (poly._defined(d, i)) {
				var radiusRange = self._getRadiusRange(d.panel.xOuterScale(), d.panel.yOuterScale());
				if (self._flip) {
					newD.bounds = {
						x: self._translatePercentArrToTheta(d.panel.xOuterScale(), poly.ys()(d, i)),
						y: self._translatePercentArrToRadius(radiusRange, poly.xs()(d, i))
					};
				} else {
					newD.bounds = {
						x: self._translatePercentArrToTheta(d.panel.xOuterScale(), poly.xs()(d, i)),
						y: self._translatePercentArrToRadius(radiusRange, poly.ys()(d, i))
					};
				}
			}
			return newD;
		};

		poly.getPath = function(obj) {
			return (obj === null) ? null : poly.renderer(obj);
		};

		poly.xs = function(val) {
			if (!arguments.length) return this._xs;
			this._xs = val;
			return this;
		};

		poly.ys = function(val) {
			if (!arguments.length) return this._ys;
			this._ys = val;
			return this;
		};

		poly.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return poly;
	};

	return polar;
});
dv.guide = dv.extend(function() {
	function guide() {
		this._renderer = null;
	}

	guide._render = function() {
		dv.log.warn({msg: "dv.guide._render should not be called directly, try using dv.guide.legend.render or dv.guide.axis.render"});
	};

	guide._scale = function(val) {
		if (!arguments.length) return this.__scale;
		this.__scale = val;
		return this;
	};

	guide.orientation = function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	};

	guide._parent = function(val) {
		if (!arguments.length) return this.__parent;
		this.__parent = val;
		return this;
	};

	guide.scaleIndex = function(val) {
		if (!arguments.length) return this._scaleIndex;
		this._scaleIndex = val;
		return this;
	};

	guide.title = function(val) {
		if (!arguments.length) return this._title;
		this._title = val;
		return this;
	};

	return guide;
});
dv.guide.axes = dv.extend(function() {
	function axes() {
		this._axes = {};
		this._emptyTickFormat = function() { return ""; };
	}

	/**
	 * Make sure orientation has been set and adjust that orientation based on whether coordinates are flipped.
	 */
	axes._initializeAxisRenderers = function() {
		this._eachAxis(function(prop, scaleIndex, axis) {
			// Make sure every valid axis has an orientation before we perform flip logic.
			if (!axis.hasOwnProperty("_orientation") && prop === "x") {
				axis._orientation = "bottom";
			}
			if (!axis.hasOwnProperty("_orientation") && prop === "y") {
				axis._orientation = "left";
			}

			if (this._chart._coord.flip()) {
				switch (axis._orientation) {
					case "top" : axis._orientation = "right"; break;
					case "right": axis._orientation = "top"; break;
					case "bottom": axis._orientation = "left"; break;
					case "left": axis._orientation = "bottom"; break;
				}
			}
		});
	};

	axes._measure = function(panel) {
		var parent = this._chart._g.select(".panels"),
			labelContainer = this._chart._axisLabelContainer;

		this._eachAxis(function(prop, scaleIndex, axis) {
			var scaleGroup = this._changeScaleRangeToLocal(panel.getOuterScale(prop));

			// Remove axis if "none" is specified
			if (!(this._chart._coord instanceof dv.coord.polar) && axis !== "none") {
				axis._chart(this._chart)
					._scale(scaleGroup[scaleIndex])
					._parent(parent)
					._labelParent(labelContainer);

				panel.margins(axis._measure(panel.margins(), panel.bounds(), panel));
			}
		});

		return this;
	};

	axes._getAllOrientations = function() {
		var orientations = {};
		this._eachAxis(function(prop, scaleIndex, axis) {
			orientations[axis._orientation] = prop;
		});
		return orientations;
	};

	axes._render = function(parent, labelParent, panel) {
		// Render the axes for real
		this._eachAxis(function(prop, scaleIndex, axis) {
			var scaleGroup = this._changeScaleRangeToLocal(panel.getOuterScale(prop));

			// Remove axis if "none" is specified
			if (this._chart._coord instanceof dv.coord.polar || axis === "none") {
				// TODO: Create a function called axis.remove();
				parent.selectAll(".axis-" + prop + ".axis-index-" + scaleIndex)
					.transition()
						.duration(this._chart._duration)
					.style("opacity", 0)
					.remove();

				this._chart._chartContainer.select(".axes-labels .axis-" + prop + ".axis-index-" + scaleIndex)
					.transition()
						.duration(this._chart._duration)
					.style("opacity", 0)
					.remove();
			} else {
				axis
					._chart(this._chart)
					._parent(parent)
					._scale(scaleGroup[scaleIndex])
					._labelParent(labelParent)
					._render(parent, panel, panel.bounds());
			}
		});

		return this;
	};

	axes._measureTitles = function(bounds) {
		var parent = this._chart._axisLabelContainer;
		this._eachAxis(function(prop, scaleIndex, axis) {
			if (axis !== "none") {
				var axisTitleBounds = axis
					._chart(this._chart)
					._measureAxisTitle(parent, prop, scaleIndex, bounds);

				bounds.left += axisTitleBounds.left;
				bounds.top += axisTitleBounds.top;
				bounds.right -= axisTitleBounds.right;
				bounds.bottom -= axisTitleBounds.bottom;
			}
		});

		return bounds;
	};

	axes._renderTitles = function(bounds, originsByOrientation) {
		var parent = this._chart._axisLabelContainer;
		this._eachAxis(function(prop, scaleIndex, axis) {
			if (axis === "none" || !axis.title()) {
				parent.selectAll(".axis-title-" + prop + ".axis-title-index-" + scaleIndex)
					.transition()
						.duration(this._chart._duration)
					.style("opacity", 0)
					.remove();
			} else {
				axis
					._chart(this._chart)
					._renderAxisTitle(parent, originsByOrientation, prop, scaleIndex, bounds);
			}
		});
	};

	axes._changeScaleRangeToLocal = function(outerScale) {
		var outerScaleRange = outerScale.range();
		var scaleGroup = outerScale.innerScaleGroup();
		for (var scaleIndex in scaleGroup) {
			dv.util.scaleRange(scaleGroup[scaleIndex], [outerScaleRange[0], outerScaleRange[1]]);
		}
		return scaleGroup;
	};

	axes._eachAxis = function(func) {
		for (var prop in this._axes) {
			var axisGroup = this._axes[prop];
			for (var scaleIndex in axisGroup) {
				func.call(this, prop, +scaleIndex, axisGroup[scaleIndex]);
			}
		}
	};

	axes._add = function(key, axis, scaleIndex) {
		scaleIndex = scaleIndex === undefined ? 0 : scaleIndex;
		var axes = this._axes[key];
		if (!axes) {
			this._axes[key] = axes = {};
		}
		axes[scaleIndex] = axis;
		return this;
	};

	axes._axes = function(val) {
		if (!arguments.length) return this._axes;
		this._axes = val;
		return this;
	};

	axes._get = function(key) {
		return this._axes[key];
	};

	axes._empty = function() {
		for (var prop in this._axes) {
			delete this._axes[prop];
		}
		this._axes = {};
		return this;
	};

	axes._chart = function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		return this;
	};

	return axes;
});
dv.guide.axis = dv.guide.extend(function() {
	function axis() {
		this._ticks = d3.functor(5);
		this._tickInterval = undefined;
		this._labelGroup = null;
		this._htmlLabels = false;
	}

	function dv_percent_tick_format(val, index) {
		return val + "%";
	}

	axis._measure = function(axisPadding, bounds, panel) {
		// 1. Determine the position of the axis
		var axisOffset = this._getAxisOffset(bounds),
			scaleRange = dv.util.scaleRange(this._scale()),
			ticks = this._ticks.call(this, Math.abs(scaleRange[1] - scaleRange[0])),
			labelGroup,
			self = this;

		// 2. Build d3 axis
		var tempParent = this._parent().append("g").classed("temp-axis", true);

		if (this._shouldDrawAxisLabels(panel)) { // should axis labels be drawn?
			labelGroup = this._constructLabelGroup(this.__labelParent, axisOffset, true);
		}
		var d3Axis = this._constructD3Axis(labelGroup, bounds, ticks, panel);

		// 3. Measure the axis for the axis title position (just place it on the temp axis)
		var axisBounds = this._measureAxis(tempParent, axisOffset, d3Axis);

		// 4. Clean up temp-axis and return measurement.
		var maxLabelBounds = {
				left: axisBounds.x + axisOffset[0],
				top: axisBounds.y + axisOffset[1],
				right: axisBounds.x + axisBounds.width + axisOffset[0],
				bottom: axisBounds.y + axisBounds.height + axisOffset[1]
			};

		if (labelGroup) {
			labelGroup.selectAll("span").each(function() {
				var e = this,
					d3Span = d3.select(this),
					labelContent = self._htmlLabels ? d3Span.html() : d3Span.text();
				// Only measure this if there is a visible label begin with.
				if (labelContent) {
					var leftOrientOffset = self._orientation === "right" ? e.offsetWidth / 2 : 0,
						topOrientOffset = self._orientation === "bottom" ? e.offsetHeight / 2 : 0,
						pos = [ e.parentNode.parentNode.offsetLeft + e.parentNode.offsetLeft + leftOrientOffset, e.parentNode.parentNode.offsetTop + e.parentNode.offsetTop + topOrientOffset ];
					maxLabelBounds.left = Math.min(pos[0], maxLabelBounds.left);
					maxLabelBounds.top = Math.min(pos[1], maxLabelBounds.top);
					maxLabelBounds.right = Math.max(pos[0] + leftOrientOffset, maxLabelBounds.right);
					maxLabelBounds.bottom = Math.max(pos[1] + topOrientOffset, maxLabelBounds.bottom);
				}
			});
		}

		tempParent.remove();

		if (labelGroup) {
			labelGroup.remove();
		}

		var newAxisPadding = {};
		newAxisPadding.left = Math.abs(Math.min(maxLabelBounds.left - bounds.left, 0));
		newAxisPadding.top = Math.abs(Math.min(maxLabelBounds.top - bounds.top, 0));
		newAxisPadding.right = Math.max(maxLabelBounds.right - bounds.right, 0);
		newAxisPadding.bottom = Math.max(maxLabelBounds.bottom - bounds.bottom, 0);

		return this._unionAxisPadding(newAxisPadding, axisPadding);
	};

	axis._render = function(parent, panel, bounds) {
		if (!this._scale()) throw new Error("The axis does not have a scale associated with it.");
		var scaleRange = dv.util.scaleRange(this._scale()),
			ticks = this._ticks.call(this, Math.abs(scaleRange[1] - scaleRange[0])),
			labelGroup;

		var axisOffset = this._getAxisOffset(bounds);
		if (this._shouldDrawAxisLabels(panel)) { // should axis labels be drawn?
			labelGroup = this._constructLabelGroup(this.__labelParent, axisOffset);
		}
		else {
			this.__labelParent.selectAll(".axis-" + this._scale().property() + ".axis-index-" + this._scale().scaleIndex()).remove();
		}
		var d3Axis = this._constructD3Axis(labelGroup, bounds, ticks, panel);
		this._renderAxis(this._parent(), panel.bounds(), axisOffset, d3Axis, labelGroup);

		return this;
	};

	axis._shouldDrawAxisLabels = function(panel) {
		var facet = panel.facet(),
			prop = this._scale().property(),
			orientation = this.orientation();
		return (facet._isFree(prop) && facet._showAllPanelLabelsIfFree()) || panel.visibleAxisLabelOrientations()[orientation];
	};

	axis._unionAxisPadding = function(newAxisPadding, axisPadding) {
		axisPadding.left = Math.max(axisPadding.left, newAxisPadding.left);
		axisPadding.top = Math.max(axisPadding.top, newAxisPadding.top);
		axisPadding.right = Math.max(axisPadding.right, newAxisPadding.right);
		axisPadding.bottom = Math.max(axisPadding.bottom, newAxisPadding.bottom);

		return axisPadding;
	};

	axis._constructLabelGroup = function(labelParent, axisOffset, isTemporary) {
		var query = ".axis-" + this._scale().property() + ".axis-index-" + this._scale().scaleIndex() + (isTemporary ? " .temp-axis" : "");
		var labelGroup = labelParent.selectAll(query).data([0]);

		labelGroup.enter().append('div')
			.classed('axis-' + this._scale().property() + " axis-index-" + this._scale().scaleIndex(), true)
			.classed('temp-axis', isTemporary)
			.style("left", axisOffset[0] + "px")
			.style("top", axisOffset[1] + "px");

		if (dv.ANIMATION) {
			labelGroup.transition()
				.delay(this._chart().delay())
				.duration(this._chart().duration())
				.ease(this._chart().ease())
				.style("left", axisOffset[0] + "px")
				.style("top", axisOffset[1] + "px");
		}
		else {
			labelGroup
				.style("left", axisOffset[0] + "px")
				.style("top", axisOffset[1] + "px");
		}

		return labelGroup;
	};

	axis._getAxisOffset = function(bounds) {
		switch (this._orientation) {
			case "bottom": return [0, bounds.bottom];
			case "left": return [bounds.left, 0];
			case "top": return [0, bounds.top];
			case "right": return [bounds.right, 0];
		}
	};

	axis._constructD3Axis = function(labelGroup, bounds, ticks, panel) {
		var size = dv.util.isUndefined(this._tickSize) ? this._getDefaultTickSize(bounds) : this._tickSize,
			minorSize = dv.util.isUndefined(this._minorTickSize) ? this._getDefaultTickSize(bounds) : this._minorTickSize,
			orient; // In D3, orient refers to how labels are aligned.

		if (this._orientation === "left") orient = "right";
		if (this._orientation === "right") orient = "left";
		if (this._orientation === "top") orient = "bottom";
		if (this._orientation === "bottom") orient = "top";

		if (this._scale().property() === "x") {
			var range = dv.util.scaleRange(this._scale());
			range[0] += this._chart().coord().startX();
			range[1] -= this._chart().coord().endX();
			if (this._scale() instanceof dv.scale.ordinal) {
				this._scale().rangeBands(range);
			} else {
				this._scale().range(range);
			}
		}

		return dv.svg.axis()
			._orient(orient)
			._labelParent(labelGroup)
			._panel(panel)
			._ticks(dv.util.isUndefined(ticks) ? 5 : ticks, this._tickInterval)
			._tickSize(size, minorSize, size)
			._tickDx(dv.util.isUndefined(this._tickDx) ? this._getDefaultTickDx() : this._tickDx)
			._tickDy(dv.util.isUndefined(this._tickDy) ? this._getDefaultTickDy() : this._tickDy)
			._tickAnchor(dv.util.isUndefined(this._tickAnchor) ? this._getDefaultTickAnchor() : this._tickAnchor)
			._tickFormat(dv.util.isUndefined(this._tickFormat) && this._chart().position() === "fill" && this._scale().property() === "y" ? dv_percent_tick_format : this._tickFormat)
			._tickValues(this._tickValues)
			._htmlLabels(this._htmlLabels)
			._tickSubdivide(this._tickSubdivide)
			._scale(this._scale()._d3Scale);
	};

	axis._renderAxis = function(p, bounds, axisOffset, d3Axis, labelGroup) {
		var axis = p.selectAll('.axis-' + this._scale().property() + ".axis-index-" + this._scale().scaleIndex()).data([0]);
		d3Axis._labelParent(labelGroup);

		axis.enter().append('g')
			.classed('axis axis-' + this._scale().property() + " axis-index-" + this._scale().scaleIndex(), true)
			.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')');

		if (dv.ANIMATION) {
			axis = axis.transition()
				.delay(this._chart().delay())
				.duration(this._chart().duration())
				.ease(this._chart().ease());
		}

		axis.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')')
			.call(d3Axis);
	};

	// render the axis as it should be on an invisible group, then measure it and immediately remove it.
	axis._measureAxis = function(tempParent, axisOffset, d3Axis) {
		tempParent.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')').call(d3Axis);
		return tempParent.node().getBBox();
	};

	axis._measureAxisTitle = function(parent, prop, scaleIndex, bounds) {
		var titleBounds = { "left": 0, "top": 0, "right": 0, "bottom": 0 };

		if (this._title) {
			var tempAxisTitleContainer = parent.append("div").classed("temp-axis-title", true),
				orientation = this._titleOrientation || this._orientation,
				axisTitle = this._createAndSizeAxisTitle(tempAxisTitleContainer, orientation, prop, scaleIndex, bounds),
				axisTitleBBox = axisTitle.node().getBoundingClientRect();

			if (orientation === "top" || orientation === "bottom") {
				titleBounds[orientation] += axisTitleBBox.height;
			}
			else {
				titleBounds[orientation] += axisTitleBBox.width;
			}

			tempAxisTitleContainer.remove();
		}

		return titleBounds;
	};

	axis._renderAxisTitle = function(parent, originsByOrientation, prop, scaleIndex, bounds) {
		var center,
			titlePadding = 6,
			labelHeight = 0,
			orientation = this._titleOrientation || this._orientation,
			axisTitleAnim;

		if (!this._title) return;

		var firstRender = parent.selectAll(".axis-title-" + prop + ".axis-title-index-" + scaleIndex).empty(),
			axisTitle = this._createAndSizeAxisTitle(parent, orientation, prop, scaleIndex, bounds);

		// EXIT is handled in dv.guide.axes.
		// UPDATE
		if (dv.ANIMATION) {
			axisTitleAnim = axisTitle.transition()
				.duration(this._chart().duration())
				.delay(this._chart().delay())
				.ease(this._chart().ease());
		}
		this._positionAxisTitle((firstRender || !dv.ANIMATION) ? axisTitle : axisTitleAnim, originsByOrientation[orientation], orientation);

		if (axisTitleAnim) {
			axisTitleAnim.style("opacity", 1);
		} else {
			axisTitle.style("opacity", 1);
		}
	};

	axis._createAndSizeAxisTitle = function(parent, orientation, prop, scaleIndex, bounds) {
		var width = orientation === "top" || orientation === "bottom" ? bounds.right - bounds.left : bounds.bottom - bounds.top;

		var axisTitle = parent.selectAll(".axis-title-" + prop + ".axis-title-index-" + scaleIndex)
			.data([axis]);

		// ENTER
		axisTitle.enter()
			.append("div")
				.classed("axis-title axis-title-" + prop + " axis-title-index-" + scaleIndex, true)
				.style("opacity", dv.ANIMATION ? 0 : 1);

		// Clear out old orientations and apply the actual one.
		return axisTitle
			.text(this._title)
			.style('width', (width - 10) + 'px')
			.classed({
				'top' : orientation === 'top',
				'bottom' : orientation === 'bottom',
				'left' : orientation === 'left',
				'right' : orientation === 'right'
			});
	};

	axis._positionAxisTitle = function(axisTitle, origin, orientation) {
		axisTitle
			.style("left", function() {
				var offset = 0;
				return origin[0] + offset + "px";
			})
			.style("top", function() {
				var offset = 0;
				if (orientation === "top") offset = -this.offsetHeight;
				return origin[1] + offset + "px";
			});
	};

	axis._getDefaultTickSize = function(bounds) {
		if (this._orientation === 'bottom') {
			return d3.functor(bounds.bottom - bounds.top);
		}
		else if (this._orientation === 'left') {
			return d3.functor(bounds.right - bounds.left);
		}
		else if (this._orientation === 'top') {
			return d3.functor(bounds.bottom - bounds.top);
		}
		else { // right
			return d3.functor(bounds.right - bounds.left);
		}
	};

	axis._getDefaultTickDx = function() {
		return (this._orientation === "bottom" || this._orientation === "top") ? d3.functor(0) : d3.functor(-12);
	};

	axis._getDefaultTickDy = function() {
		return (this._orientation === "bottom" || this._orientation === "top") ? d3.functor(-12) : d3.functor(0);
	};

	axis._getDefaultTickAnchor = function() {
		if (this._orientation === "left") return d3.functor("end");
		if (this._orientation === "right") return d3.functor("start");
		return d3.functor("middle");
	};

	axis._labelParent = function(val) {
		if (!arguments.length) return this.__labelParent;
		this.__labelParent = val;
		return this;
	};

	axis.ticks = function(arg1, arg2) {
		if (!arguments.length) return dv.util.isFinite(this._tickInterval) ? [this._ticks, this._tickInterval] : this._ticks;
		if (arguments.length > 1) {
			this._ticks = function() { return arg1; };
			this._tickInterval = arg2;
		}
		else {
			this._ticks = d3.functor(arg1);
			this._tickInterval = undefined;
		}
		return this;
	};

	axis.tickSubdivide = function(val) {
		if (!arguments.length) return this._tickSubdivide;
		this._tickSubdivide = val;
		return this;
	};

	axis.tickSize = function(val) {
		if (!arguments.length) return this._tickSize;
		this._tickSize = d3.functor(val);
		return this;
	};

	axis.minorTickSize = function(val) {
		if (!arguments.length) return this._minorTickSize;
		this._minorTickSize = d3.functor(val);
		return this;
	};

	axis.tickDx = function(val) {
		if (!arguments.length) return this._tickDx;
		this._tickDx = d3.functor(val);
		return this;
	};

	// Whether or not to render labels as HTML.  This allows for HTML elements to be embedded inside of a label.
	// There are some performance costs here by enabling this mode.  Do so only if absolutely necessary.
	axis.htmlLabels = function(val) {
		if (!arguments.length) return this._htmlLabels;
		this._htmlLabels = val;
		return this;
	};

	axis.tickDy = function(val) {
		if (!arguments.length) return this._tickDy;
		this._tickDy = d3.functor(val);
		return this;
	};

	axis.tickAnchor = function(val) {
		if (!arguments.length) return this._tickAnchor;
		this._tickAnchor = d3.functor(val);
		return this;
	};

	axis.tickFormat = function(val) {
		if (!arguments.length) {
			var d3Scale = this._scale()._d3Scale;
			if (this._tickFormat) return this._tickFormat;
			if (d3Scale.tickFormat) return d3Scale.tickFormat(d3Scale);
			return function(d) { return d; };
		}
		this._tickFormat = val;
		return this;
	};

	axis.tickValues = function(val) {
		if (!arguments.length) return this._tickValues;
		this._tickValues = val;
		return this;
	};

	axis.titleOrientation = function(val) {
		if (!arguments.length) return this._titleOrientation;
		this._titleOrientation = val;
		return this;
	};

	axis._chart = function(val) {
		if (!arguments.length) return this.__chart;
		this.__chart = val;
		return this;
	};

	return axis;
});

dv.svg.axis = function() {
	var scale = d3.scale.linear(),
		orient = "bottom",
		tickMajorSize = d3.functor(6),
		tickMinorSize = d3.functor(6),
		tickEndSize = d3.functor(6),
		tickDx = d3.functor(0),
		tickDy = d3.functor(0),
		tickAnchor = d3.functor("start"),
		tickArguments_ = [10],
		tickValues = null,
		htmlLabels = false,
		tickFormat_,
		tickSubdivide = 0,
		labelParent;

	function d3_svg_axisX(selection, x) {
		selection.attr("transform", function(d) {
			return "translate(" + x(d) + ",0)";
		});
	}

	function d3_svg_axisY(selection, y) {
		selection.attr("transform", function(d) { return "translate(0," + y(d) + ")"; });
	}

	function getLeftPosition(elem, tickDx, anchor) {
		var offsetWidth = d3.select(elem).select("span").node().offsetWidth;
		var leftAdj = anchor === "end" ? -offsetWidth : anchor === "middle" ? -offsetWidth / 2 : 0;
		return tickDx + leftAdj;
	}

	function getTopPosition(elem, tickDy, anchor) {
		var offsetHeight = d3.select(elem).select("span").node().offsetHeight;
		var topAdj = anchor === "top" ? 0 : anchor === "middle" ? -offsetHeight / 2 : -offsetHeight;
		return tickDy + topAdj;
	}

	function d3_svg_axisSubdivide(scale, ticks, m) {
		var subticks = [];
		if (m && ticks.length > 1) {
			var extent = dv.util.scaleExtent(scale.domain()),
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

	function axis(g) {
		/**
		 * For a given label, determine and return its expected position.
		 *
		 * @param label The label DOM element
		 * @param d The datum for the label
		 * @param i The index of the label in the selection
		 * @param scale The scale to use for retrieving the position
		 * @param orient
		 * @returns { top:Number, left:Number }
		 */
		var getLabelPos = function(label, d, i, scale, orient) {
			var pos = {};

			switch (orient) {
				case 'top':
					pos.top = getTopPosition(label, -tickDy.call(label, d, i), "top");
					pos.left = scale(d) + getLeftPosition(label, tickDx.call(label, d, i), tickAnchor.call(label, d, i));
					break;
				case 'bottom':
					pos.top = getTopPosition(label, tickDy.call(label, d, i), "bottom");
					pos.left = scale(d) + getLeftPosition(label, tickDx.call(label, d, i), tickAnchor.call(label, d, i));
					break;
				case 'right':
					pos.top = scale(d) + getTopPosition(label, tickDy.call(label, d, i), "middle");
					pos.left = getLeftPosition(label, tickDx.call(label, d, i), tickAnchor.call(label, d, i));
					break;
				case 'left':
					pos.top = scale(d) + getTopPosition(label, tickDy.call(label, d, i), "middle");
					pos.left = getLeftPosition(label, -tickDx.call(label, d, i), tickAnchor.call(label, d, i));
					break;
			}

			pos.top = (isNaN(pos.top) ? 0 : pos.top) + 'px';
			pos.left = (isNaN(pos.left) ? 0 : pos.left) + 'px';

			var anchor = tickAnchor.call(label, d, i);
			d3.select(label).classed({
				'start' : anchor === 'start',
				'middle' : anchor === 'middle',
				'end' : anchor === 'end'
			});

			return pos;
		};

		/**
		 * Position a selection of labels using precalculated positions.
		 *
		 * @param labels A selection of labels.
		 * @param positions An array of position objects (with top and left attributes) indexed to match
		 * the labels selection.
		 */
		var applyLabelPositions = function(labels, positions) {
			['top', 'left'].forEach(function(side) {
				labels.style(side, function(d, i) {
					return positions[i][side];
				});
			});
		};

		/**
		 * Add/update/remove axis labels and position them.
		 *
		 * @param ticks
		 * @param oldScale
		 * @param newScale
		 */
		var updateLabels = function(ticks, oldScale, newScale) {
			if (!labelParent) return;

			var tickFormat = tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String) : tickFormat_,
				label, labelEnter, labelExit, labelUpdate;

			// Create/remove DOM.
			labelParent.style("position", "absolute");

			label = labelParent.selectAll(".axis-label").data(ticks, String);
			labelEnter = label.enter().append("div").classed("axis-label", true).style("opacity", 1e-6).style("position", "absolute");//.style("pointer-events", "none");
			labelExit = d3.transition(label.exit()).style("opacity", 1e-6).remove();
			labelUpdate = d3.transition(label).style("opacity", 1);

			labelEnter.append("span");

			// We have to create a flat selection instead of a nested selection (e.g., label.select('span')) so that the
			// index that comes through the tickFormat function is relative to other axis labels and not other spans
			// within the individual axis-label divs (which would result in the index always coming through as 0).
			var labelSpans = label.selectAll("span"),
				tickFormatWrapper = function(d, i, j) { return tickFormat.call(this, d, j); };
			if (htmlLabels) {
				labelSpans.html(tickFormatWrapper);
			} else {
				labelSpans.text(tickFormatWrapper);
			}

			// Calculate DOM positions.
			// We calculate all positions before we apply them for optimization purposes. If we were to calculate the
			// position of an individual label, then apply the position to the label, then repeat the process
			// for all remaining labels, it would trigger a costly, large number of document layouts. We purposefully
			// refactored code away from such an approach because of the considerable speed cost observed.
			var labelEnterPositions = [],
				labelUpdateReorientPositions = [],
				labelUpdatePositions = [],
				labelExitPositions = [];

			// If scale.ticks does not exist then it is an ordinal scale. We wrap the scale to position the label
			// in the middle of the range band bucket.
			var ordinalScaleWrapper;
			if (!scale.ticks) {
				var rangeBandHalfWidth = scale.rangeBand() / 2;
				ordinalScaleWrapper = function(d) { return newScale(d) + rangeBandHalfWidth; };
			}

			labelEnter.each(function(d, i) {
				// In the case of ordinal scales, we'll use the ordinal scale wrapper which positions the
				// labels in the middle of the range band in the new scale.
				// In the case of quantitative scales, position the entering labels at the old scale. This will happen
				// immediately. The enter labels when then be tweened to the new scale with the labelUpdate
				// selection (below).

				// We need to add to the array using i instead of push() because .each() skips over null values
				// and we need to retain proper indexing for when we apply positions.
				labelEnterPositions[i] = getLabelPos(this, d, i, ordinalScaleWrapper || oldScale, orient);
			});

			labelUpdate.each(function(d, i) {
				// We need to add to the array using i instead of push() because .each() skips over null values
				// and we need to retain proper indexing for when we apply positions.
				labelUpdateReorientPositions[i] = getLabelPos(this, d, i, ordinalScaleWrapper || oldScale, orient);
				labelUpdatePositions[i] = getLabelPos(this, d, i, ordinalScaleWrapper || newScale, orient);
			});

			// If scale.ticks exists, then it is a quantitative scale so we have a location we can move exiting
			// labels. If scale.ticks does not exist, then it is an ordinal scale and there's not really an
			// appropriate location to move the exiting labels.
			if (scale.ticks) {
				labelExit.each(function(d, i) {
					// We need to add to the array using i instead of push() because .each() skips over null values
					// and we need to retain proper indexing for when we apply positions.
					labelExitPositions[i] = getLabelPos(this, d, i, newScale, orient);
				});
			}

			applyLabelPositions(labelEnter, labelEnterPositions);
			applyLabelPositions(label, labelUpdateReorientPositions);
			applyLabelPositions(labelUpdate, labelUpdatePositions);

			// If scale.ticks exists, then it is a quantitative scale so we have a location we can move exiting
			// labels. If scale.ticks does not exist, then it is an ordinal scale and there's not really an
			// appropriate location to move the exiting labels.
			if (scale.ticks) {
				applyLabelPositions(labelExit, labelExitPositions);
			}
		};

		g.each(function() {
			var g = d3.select(this);

			// Ticks, or domain values for ordinal scales.
			var ticks = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain()) : tickValues;

			// Minor ticks.
			var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide),
				subtick = g.selectAll(".minor").data(subticks, String),
				subtickEnter = subtick.enter().insert("line", "g").attr("class", "tick minor").style("opacity", 1e-6),
				subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove(),
				subtickUpdate = d3.transition(subtick).style("opacity", 1);

			// Major ticks.
			var tick = g.selectAll(".axis-tick").data(ticks, String),
				tickEnter = tick.enter().insert("g", "path").classed("axis-tick", true).style("opacity", 1e-6),
				tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
				tickUpdate = d3.transition(tick).style("opacity", 1),
				tickTransform;

			// Domain.
			var range = dv.util.scaleRangeNoReverse(scale);
				path = g.selectAll(".domain").data([0]);
				pathEnter = path.enter().append("path").attr("class", "domain");
				pathUpdate = d3.transition(path);

			// Stash a snapshot of the new scale, and retrieve the old snapshot.
			var scale1 = scale.copy(),
				scale0 = this.__chart__ || scale1;
			this.__chart__ = scale1;

			tickEnter.append("line").attr("class", "tick");

			var lineEnter = tickEnter.select("line"),
				lineUpdate = tickUpdate.select("line");

			switch (orient) {
				case "bottom":
					tickTransform = d3_svg_axisX;
					subtickEnter.attr("y2", function(d, i) { return tickMinorSize.call(this, d, i, panel); });
					subtickUpdate.attr("x2", 0).attr("y2", function(d, i) { return tickMinorSize.call(this, d, i, panel); });
					lineEnter.attr("y2", function(d, i) { return tickMajorSize.call(this, d, i, panel); });
					lineUpdate.attr("x2", 0).attr("y2", function(d, i) { return tickMajorSize.call(this, d, i, panel); });
					pathUpdate.attr("d", function(d, i) { return "M" + range[0] + "," + tickEndSize.call(this, d, i, panel) + "V0H" + range[1] + "V" + tickEndSize.call(this, d, i, panel); });
					break;

				case "top":
					tickTransform = d3_svg_axisX;
					subtickEnter.attr("y2", function(d, i) { return -tickMinorSize.call(this, d, i, panel); });
					subtickUpdate.attr("x2", 0).attr("y2", function(d, i) { return -tickMinorSize.call(this, d, i, panel); });
					lineEnter.attr("y2", function(d, i) { return -tickMajorSize.call(this, d, i, panel); });
					lineUpdate.attr("x2", 0).attr("y2", function(d, i) { return -tickMajorSize.call(this, d, i, panel); });
					pathUpdate.attr("d", function(d, i) { return "M" + range[0] + "," + -tickEndSize.call(this, d, i, panel) + "V0H" + range[1] + "V" + -tickEndSize.call(this, d, i, panel); });
					break;

				case "left":
					tickTransform = d3_svg_axisY;
					subtickEnter.attr("x2", function(d, i) { return -tickMinorSize.call(this, d, i, panel); });
					subtickUpdate.attr("x2", function(d, i) { return -tickMinorSize.call(this, d, i, panel); }).attr("y2", 0);
					lineEnter.attr("x2", function(d, i) { return -tickMajorSize.call(this, d, i, panel); });
					lineUpdate.attr("x2", function(d, i) { return -tickMajorSize.call(this, d, i, panel); }).attr("y2", 0);
					pathUpdate.attr("d", function(d, i) { return "M" + -tickEndSize.call(this, d, i, panel) + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize.call(this, d, i, panel); });
					break;

				case "right":
					tickTransform = d3_svg_axisY;
					subtickEnter.attr("x2", function(d, i) { return tickMinorSize.call(this, d, i, panel); });
					subtickUpdate.attr("x2", function(d, i) { return tickMinorSize.call(this, d, i, panel); }).attr("y2", 0);
					lineEnter.attr("x2", function(d, i) { return tickMajorSize.call(this, d, i, panel); });
					lineUpdate.attr("x2", function(d, i) { return tickMajorSize.call(this, d, i, panel); }).attr("y2", 0);
					pathUpdate.attr("d", function(d, i) { return "M" + tickEndSize.call(this, d, i, panel) + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize.call(this, d, i, panel); });
					break;
			}

			// For quantitative scales:
			// - enter new ticks from the old scale
			// - exit old ticks to the new scale
			if (scale.ticks) {
				tickEnter.call(tickTransform, scale0);
				tickUpdate.call(tickTransform, scale1);
				tickExit.call(tickTransform, scale1);
				subtickEnter.call(tickTransform, scale0);
				subtickUpdate.call(tickTransform, scale1);
				subtickExit.call(tickTransform, scale1);
			}

			// For ordinal scales:
			// - any entering ticks are undefined in the old scale
			// - any exiting ticks are undefined in the new scale
			// Therefore, we only need to transition updating ticks.
			else {
				var dx = scale1.rangeBand() / 2, x = function(d) { return scale1(d) + dx; };
				tickEnter.call(tickTransform, x);
				tickUpdate.call(tickTransform, x);
			}

			updateLabels(ticks, scale0, scale1);
		});
	}

	axis._scale = function(x) {
		if (!arguments.length) return scale;
		scale = x;
		return axis;
	};

	axis._orient = function(x) {
		if (!arguments.length) return orient;
		orient = x;
		return axis;
	};

	axis._ticks = function() {
		if (!arguments.length) return tickArguments_;
		tickArguments_ = arguments;
		return axis;
	};

	axis._tickValues = function(x) {
		if (!arguments.length) return tickValues;
		tickValues = x;
		return axis;
	};

	axis._tickFormat = function(x) {
		if (!arguments.length) return tickFormat_;
		tickFormat_ = x;
		return axis;
	};

	axis._htmlLabels = function(val) {
		if (!arguments.length) return htmlLabels;
		htmlLabels = val;
		return axis;
	};

	axis._tickSize = function(x, y, z) {
		if (!arguments.length) return tickMajorSize;
		var n = arguments.length - 1;
		tickMajorSize = d3.functor(x);
		tickMinorSize = n > 1 ? d3.functor(y) : tickMajorSize;
		tickEndSize = n > 0 ? d3.functor(arguments[n]) : tickMajorSize;
		return axis;
	};

	axis._tickDx = function(x) {
		if (!arguments.length) return tickDx;
		tickDx = x;
		return axis;
	};

	axis._tickDy = function(y) {
		if (!arguments.length) return tickDy;
		tickDy = y;
		return axis;
	};

	axis._tickAnchor = function(anchor) {
		if (!arguments.length) return tickAnchor;
		tickAnchor = anchor;
		return axis;
	};

	axis._tickSubdivide = function(x) {
		if (!arguments.length) return tickSubdivide;
		tickSubdivide = +x;
		return axis;
	};

	axis._panel = function(val) {
		if (!arguments.length) return panel;
		panel = val;
		return axis;
	};

	axis._labelParent = function(x) {
		if (!arguments.length) return labelParent;
		labelParent = x;
		return axis;
	};

	return axis;
};

dv.guide.legends = dv.extend(function() {
	function legends() {
		this._legArr = [];
		this.__hide = false;
		this._ad = {left: 0, right: 0, width: 0, height: 0};
	}

	legends._render = function(chartOps) {
		this._w = 0;
		this._h = 0;

		if (!this.__hide) {
			var	parent = chartOps.el.select('.legends'),
				self = this;

			var legends = parent.selectAll(".legend")
				.data(this._legArr);

			legends.exit()
				.transition()
					.duration(chartOps.duration)
					.style("opacity", 0)
					.remove();

			var enterG = legends.enter()
				.append('g')
					.classed("legend", true);

			if (dv.ANIMATION) {
				enterG.style("opacity", 0);
			}

			legends.each(function(d, i) {
				var scales = {},
					prop = d.props[0],
					scale = self._getScale(chartOps, d.props[0]),
					domain = scale.domain();

				for (var j = 0; j < d.props.length; j++) {
					var otherProp = d.props[j],
						otherScale = self._getScale(chartOps, d.props[j]);

					if (otherScale.hasSameDomain(domain)) {
						scales[otherProp] = chartOps.scales[otherProp];
					} else {
						throw new Error("Can't render single legend from multiple domains");
					}
				}
				d.guide._render(d3.select(this), scales, { dims: self._ad, renderOpts: chartOps } );
				self._w += d.guide._getUsedWidth();
				self._h += d.guide._getUsedHeight();
				self._ad = d.guide._getAdjustedDimensions(self._ad);
			});
		}
		return this;
	};

	legends._getScale = function(chartOpts, prop) {
		var scaleGroup = chartOpts.scales[prop],
			scale;
		if (prop === undefined || scaleGroup === undefined || scaleGroup[0] === undefined) {
			throw new Error("A '" + prop + "'' legend has been called for, but '" + prop + " hasn't been mapped to data.");
		}
		return scaleGroup[0];
	};

	legends._add = function(legend) {
		this._legArr.push(legend);
		return this;
	};

	legends._remove = function(properties) {
		for (var p in properties) {
			var prop = properties[p];
			for (var i = 0; i < this._legArr.length; i++) {
				var props = this._legArr[i].props,
					include = true;
				for (var j = 0; j < props.length; j++) {
					if (props[j] === prop) {
						props.splice(j, 1);
						j--;
					}
					if (props.length === 0) include = false;
				}
				if (!include) {
					this._legArr.splice(i, 1);
					i--;
				}
			}
		}
	};

	legends._legends = function(val) {
		if (!arguments.length) return this._legArr;
		this._legArr = val;
		return this;
	};

	legends._allowedDimensions = function(val) {
		if (!arguments.length) return this._ad;
		this._ad = val;
		return this;
	};

	legends._getWidth = function() {
		return this._w;
	};

	legends._getHeight = function() {
		return this._h;
	};

	legends._hide = function(val) {
		if (!arguments.length) return this.__hide;
		this.__hide = val;
		return this;
	};

	legends._empty = function() {
		for (var i = 0; i < this._legArr.length; i++) {
			delete this._legArr[i];
		}
		this._legArr = [];
		return this;
	};

	return legends;
});
dv.guide.legend = dv.guide.extend(function() {
	function legend() {
		this._overlay = false;
		this._orientation = "top";
		this._vGap = 5;
		this._hGap = 15;
		this._defaultPadding = this._padding = {"top": 10, "left": 10, "right": 10, "bottom": 10};
		this._swatchWidth = 15;
		this._swatchHeight = 10;
		this._innerPadding = 5;
		this._spanPercent = 0.75;
		this._lineHeight = 0;
		this._entriesWidth = [];
	}

	legend._render = function(p, scales, options) {
		var pTransition = p,
			maxDimensions = options.dims,
			self = this;

		this._renderingOptions = options.renderOpts;
		this._scales = scales;
		this._transformData = [];
		this._width = maxDimensions.width - this._padding.left - this._padding.right;
		this._height = maxDimensions.height - this._padding.top - this._padding.bottom;

		var entries = this._drawEntries(p);

		this._legendWidths = calc_legends_widths.call(this, entries);
		var colMeta = calc_columns.call(this, Math.min(this._legendWidths.length, Math.floor(this._width / this._swatchWidth)));
		var retVal = calc_offsets.call(this, colMeta);
		var offsets = retVal.offsets;
		colMeta = retVal.cols;

		this._width = this._width - colMeta.padding + (this._hGap * (colMeta.data.length - 1));
		this._height = this._lineHeight + offsets[offsets.length - 1].y;

		entries.each(function(d, i) {
			var el = d3.select(this);
			if (dv.ANIMATION) {
				el = el.transition()
					.duration(self._renderingOptions.duration)
					.delay(self._renderingOptions.delay)
					.ease(self._renderingOptions.ease);
			}
			el.attr("transform", "translate(" + offsets[i].x + ", " + offsets[i].y + ")");
		});

		if (!this._renderingOptions.firstRender) {
			pTransition = p.transition()
				.duration(this._renderingOptions.duration)
				.style("opacity", 1);
		}

		var left = (this._orientation === "right") ? maxDimensions.left + maxDimensions.width - this._width - this._padding.right: maxDimensions.left + this._padding.left;
		var top = (this._orientation === "bottom") ? maxDimensions.top + maxDimensions.height - this._height - this._padding.bottom: maxDimensions.top + this._padding.top;

		pTransition.attr('transform', 'translate(' + (left) + ',' + (top) + ')');

		if (this._renderingOptions.firstRender) {
			pTransition.transition()
				.duration(this._renderingOptions.duration)
				.style("opacity", 1);
		}
	};

	legend._drawEntries = function(p) {
		var self = this,
			domain = [];

		this._entryWidths = [];


		// since all these domains are the same we just need to grab the first one
		for (var prop in this._scales) {
			domain = this._scales[prop][0].domain();
			break;
		}

		var entries = p.selectAll(".legend-entry")
			.data(domain);

		entries.exit()
			.transition()
				.duration(this._renderingOptions.duration)
				.style("opacity", 0)
				.remove();

		var entry = entries.enter()
			.append('g')
			.classed('legend-entry', true);

		entry.append('path');
		entry.append('text')
			.classed('legend-entry-label', true);
		entry.append('text')
			.classed('legend-entry-value', true);

		entries.select("path")
			.attr("d", function(d, i) { return get_path.call(self, d, i); })
			.call(function(selection) {
				selection.attr("style", "");
				if (self._scales.hasOwnProperty("fill"))
					selection.style("fill", function(d, i) { return self._scales["fill"][0].mapValue(d); });
				if (self._scales.hasOwnProperty("stroke"))
					selection.style("stroke", function(d, i) { return self._scales["stroke"][0].mapValue(d); })
						.style("stroke-width", 2);
				if (self._scales.hasOwnProperty("linetype")) {
					selection.style('stroke-dasharray', function(d, i) { return dv.util.svg.getDasharray(self._scales["linetype"][0].mapValue(d)); });
					if (!self._scales.hasOwnProperty("stroke")) selection.style("stroke", "#000");
					selection.style("stroke-width", 2);
				}
				if (self._scales.hasOwnProperty("size")) {
					selection.style("stroke-width", function(d, i) {
						return self._scales["size"][0].mapValue(d);
					});
				}
			})
			.each(function(d, i) {
				self._entryWidths[i] = this.getBBox().width;
			});

		entries.select("text.legend-entry-label")
			.attr("x", this._swatchWidth + this._innerPadding)
			.attr("y", 10)
			.text(function(d, i) {
				if (dv.util.isUndefined(self._labels)) return d;
				else return self._labels[i % self._labels.length];
			})
			.each(function(d, i) {
				self._entryWidths[i] += self._innerPadding + this.getBBox().width;
			});

		entries.select("text.legend-entry-value")
			.attr("y", 10)
			.attr("x", function(d, i) {
				return self._entryWidths[i] + self._innerPadding;
			})
			.text(function(d, i) {
				if (dv.util.isUndefined(self._values)) return "";
				else return self._values[i];
			})
			.style("fill", function(d, i) {
				if (!dv.util.isUndefined(self._scales["stroke"])) return self._scales["stroke"][0].mapValue(d);
				else if (!dv.util.isUndefined(self._scales["fill"])) return self._scales["fill"][0].mapValue(d);
				return;
			})
			.each(function(d, i) {
				var width = this.getBBox().width;
				self._entryWidths[i] += width + ((width > 0) ? self._innerPadding : 0); // Don't add extra padding if there is no value.
			});

		return entries;
	};

	function calc_legends_widths(entries) {
		var self = this;

		entries.each(function(d, i) {
			self._entryWidths[i] = Math.min(self._entryWidths[i], self._width);
			self._lineHeight = Math.max(self._lineHeight, this.getBBox().height);
		});

		return self._entryWidths;
	}

	function calc_offsets(cols) {
		var cursor = 0,
			colIndex = 0,
			d,
			spanned = 0,
			hasMaxCols = false,
			rowOffset = 0,
			colOffset = 0,
			offsets = [];

		for (var i = 0; i < this._legendWidths.length; i++) {
			cursor += ((colIndex === 0) ? 0 : this._hGap) + this._legendWidths[i];
			if (colIndex < cols.data.length && cursor <= this._width) {
				if (this._legendWidths[i] <= cols.data[colIndex] + spanned) {
					colOffset += ((colIndex === 0) ? 0 : this._hGap);
					offsets.push({ x: colOffset, y: rowOffset });
					colOffset += cols.data[colIndex] + spanned;
					spanned = 0;
				} else if ((d = this._legendWidths[i] - cols.data[colIndex]) <= cols.padding) {
					cols.padding -= d;
					cols.data[colIndex] = this._legendWidths[i];
					return calc_offsets.call(this, cols);
				} else if ((colIndex + 1 < cols.data.length) && this._legendWidths[i] >= cols.data[colIndex] + (cols.data[colIndex+1] * this._spanPercent) + spanned) {
					if (colIndex + 1 <= cols.data.length) {
						spanned += ((colIndex === 0) ? 0 : this._hGap) + cols.data[colIndex];
						cursor -= ((colIndex === 0) ? 0 : this._hGap) + this._legendWidths[i];
						i--;
					} else {
						cursor = cursor - this._legendWidths[i] + spanned + cols.data[colIndex];
						spanned = 0;
						colOffset += ((colIndex === 0) ? 0 : this._hGap);
						offsets.push({ x: colOffset, y: rowOffset });
						colOffset += cols.data[colIndex] + spanned;
						colIndex++;
					}
				} else {
					cols = calc_columns.call(this, cols.data.length - 1);
					return calc_offsets.call(this, cols);
				}
				colIndex++;
			} else if (colIndex + 1 === cols.data.length && cols.data.length > 1) {
				cols = calc_columns.call(this, cols.data.length - 1);
				return calc_offsets.call(this, cols);
			} else {
				if (colIndex === cols.data.length) hasMaxCols = true;
				rowOffset += this._lineHeight + this._vGap;
				cursor = colOffset = 0;
				colIndex = 0;
				spanned = 0;
				i--;
			}
		}
		if (colIndex === cols.data.length) hasMaxCols = true;

		if (!hasMaxCols) {
			cols = calc_columns.call(this, cols.data.length - 1);
			return calc_offsets.call(this, cols);
		}

		return {offsets: offsets, cols: cols};
	}

	// Recursively calculates the number of columns needed based on the first "n" legend widths where numCols defines "n"
	function calc_columns(numCols) {
		var colMeta = { data: [], padding: this._width },
			sum = 0,
			i = 0;

		if (this._isVAligned()) {
			numCols = Math.ceil(this._legendWidths.length / Math.floor(this._height / (this._lineHeight + this._vGap)));
		}
		for (i = 0; i < numCols; i++) {
			sum += this._legendWidths[i] + this._hGap;
		}
		sum -= this._hGap;
		if (sum > this._width && numCols > 1) return calc_columns.call(this, numCols-1);

		colMeta.data = this._legendWidths.slice(0, numCols);
		colMeta.padding -= sum;
		if (colMeta.padding < 0) colMeta.padding = 0;

		return colMeta;
	}

	function draw_rect(x, y, w, h) {
		return "M" + x + "," + y +
			"L" + (x + w) + "," + y +
			"L" + (x + w) + "," + (y + h) +
			"L" + x + "," + (y + h) + "Z";
	}

	function draw_line(x0, y0, x1, y1) {
		var midPoint = ((y0 + y1) >> 1);
		return "M" + x0 + "," + midPoint +
			"L" + x1 + "," + midPoint;
	}

	function get_path(d, i) {
		if (this._scales.hasOwnProperty("fill"))
			return draw_rect.call(this, 0, 0, this._swatchWidth, this._swatchHeight);
		else
			return draw_line.call(this, 0, 0, this._swatchWidth, this._swatchHeight);
	}

	legend._getAdjustedDimensions = function(maxDims) {
		if (this._overlay) return maxDims;

		var totalWidth = this._padding.left + this._width + this._padding.right,
			totalHeight = this._padding.top + this._height + this._padding.bottom;

		if (this._orientation === "left") {
			maxDims.left += totalWidth;
			maxDims.width -= totalWidth;
		}
		else if (this._orientation === "top") {
			maxDims.top += totalHeight;
			maxDims.height -= totalHeight;
		}
		else if (this._orientation === "right") maxDims.width -= totalWidth;
		else if (this._orientation === "bottom") maxDims.height -= totalHeight;

		return maxDims;
	};

	legend._getUsedWidth = function() {
		if (this._overlay) return 0;
		else return (this._isVAligned() ? this._width + this._padding.left + this._padding.right: 0);
	};

	legend._getUsedHeight = function() {
		if (this._overlay) return 0;
		else return (this._isVAligned() ? 0 : this._height + this._padding.top + this._padding.bottom);
	};

	legend._isVAligned = function() {
		return (this._orientation === "left" || this._orientation === "right");
	};

	legend.vGap = function(val) {
		if (!arguments.length) return this._vGap;
		this._vGap = val;
		return this;
	};

	legend.hGap = function(val) {
		if (!arguments.length) return this._hGap;
		this._hGap = val;
		return this;
	};

	legend.padding = function(val) {
		if (!arguments.length) return this._padding;
		this._padding = dv.util.merge(this._defaultPadding, val);
		return this;
	};

	legend.align = function(val) {
		if (!arguments.length) return this._align;
		this._align = val;
		return this;
	};

	legend.labels = function(val) {
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	};

	legend.values = function(val) {
		if (!arguments.length) return this._values;
		this._values = val;
		return this;
	};

	legend.overlay = function(val) {
		if (!arguments.length) return this._overlay;
		this._overlay = val;
		return this;
	};

	return legend;
});
dv.guide.custom = dv.guide.extend(function() {
	function custom(config) {
		this._render = function() { dv.log.warn({msg: "empty render function on custom guide"}); return this; };
		this._getAdjustedDimensions = function(maxDims) { return maxDims; };
		this._getUsedWidth = function() { return 0; };
		this._getUsedHeight = function() { return 0; };
	}

	// Allows overwriting of functions
	custom.setFunc = function(funcName, func) {
		this[funcName] = func;
		return this;
	};

	return custom;
});
dv.geom = dv.container.extend(function() {

	function geom() {
		this._super();
		this._defaultAes = {};
		this._behaviorsLayer = null;
		this._dodgePadding = 0;

		this._initializeDefaultAes();
	}

	// These are the default attributes for all geometries
	geom._initializeDefaultAes = function() {
		this._defaultAes['x'] = 1;
		this._defaultAes['y'] = 1;
		this._defaultAes['shape'] = 'circle';
		this._defaultAes['linetype'] = 'solid';
	};

	//
	geom._prerender = function(chart) {
		this._trainedScales = {};
		// Assign the chart for this geom.
		this._chart = chart;
		// Rename the columns to be understandable to this geom and other objects
		// Before this is done, unnormalized data may have any labels assigned
		this.normalizedData(this._normalizeData(this.data()));
		this._calculateStats();
		this._inheritChartAesthetics(chart);
	};

	geom._inheritChartAesthetics = function(chart) {
		for(var prop in chart._aes) {
			// We'll inherit any aesthetics on the chart that aren't defined explicitly on the geom.
			var chartAesGroup = chart._aes[prop];
			if (!this._aes[prop]) this._aes[prop] = {};
			for (var scaleIndex in chartAesGroup) {
				if (!this._aes[prop][scaleIndex]) {
					this._aes[prop][scaleIndex] = chartAesGroup[scaleIndex];
				}
			}
		}
	};

	geom._trainScales = function() { /* Override in subclasses if needed */ };

	geom._createDefaultScales = function() {
		for (var prop in this._defaultAes) {
			if (!this._aes.hasOwnProperty(prop)) {
				this._aes[prop] = {};
				this._aes[prop][0] = dv.scale.constant().value(this._defaultAes[prop]).property(prop);
			}
			delete this._defaultAes[prop];
		}
	};

	geom._render = function(geomGroup) {
		var self = this;
		this._geomGroup = d3.select(geomGroup);

		var seriesGroups = this._geomGroup
			.selectAll('.series')
			.data(this._nestData);

		seriesGroups.exit()
			.call(self.exitSeriesGroup, self);

		seriesGroups.enter()
			.append('g')
			.classed('series', true);

		seriesGroups.call(self.updateGroups, self.enterPen, self.pen, self.enterPen, self)
			.call(self.updateDataPoints, self.enterPen, self.pen, self.enterPen, self);

		self._renderBehaviors(self._geomGroup);

		// Clean up our geom events.  They should have all been removed by now.
		self.unregisterEventMap = null;
	};

	geom._renderBehaviors = function(geomGroup) {
		var self = this;
		if (this._behaviors && this._behaviors.length) {
			this._behaviorsLayer = geomGroup.select('.behavior-layer');

			if (this._behaviorsLayer.empty()) {
				this._behaviorsLayer = geomGroup.append('g')
					.classed("behavior-layer", true);
			} else {
				this._behaviorsLayer.node().parentNode.appendChild(this._behaviorsLayer.node());
			}

			dv.util.each(this._behaviors, function(behavior) {
				behavior._geom(self)._render(self._behaviorsLayer);
			});
		}
	};

	geom.updateGroups = function(seriesGroups, enterPen, pen, exitPen, self) {
		seriesGroups.each(function(d, i) {
			var x = 0,
				y = 0,
				selection = d3.select(this),
				previousTransform = selection.attr("transform");

			if (self._chart._coord instanceof dv.coord.polar) {
				var firstDataPoint = d.values[0],
					xRange = dv.util.scaleRange(firstDataPoint.panel.xOuterScale()),
					yRange = dv.util.scaleRange(firstDataPoint.panel.yOuterScale()),
					xVal = (xRange[0] + xRange[1]) / 2,
					yVal = (yRange[0] + yRange[1]) / 2,
					flipped = self._chart._coord.flip();

				x = flipped ? yVal : xVal;
				y = flipped ? xVal : yVal;
			}

			if (previousTransform && dv.ANIMATION) {
				selection = selection.transition()
					.duration(function(d, i) { return self.duration().call(this, d, i); });
			}

			selection.attr("transform", 'translate(' + x + ',' + y + ')');
		});
	};

	geom.updateDataPoints = function(seriesGroups, enterPen, pen, exitPen, self) {
		var _enterPen = enterPen.call(self),
			_updatePen = pen.call(self),
			_exitPen = exitPen.call(self);

		var nodes = seriesGroups.selectAll('.' + self._dataPointStyleClass)
			.data(function(d) { return self.getValues(d); });

		nodes.exit()
			//.attr('d', _updatePen)
			.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease())
				.each(function() { this.__exiting__ = true; })
				//.style('opacity', 1e-6)
				.attrTween('d', _exitPen.pathTween)
				.remove();

		nodes.enter()
			.append('path') // TODO: This base class shouldn't contain a reference to svg:path.  That should be broken out to another object and used via composition.
				.each(function(d, i, j) { self.setPreviousState.call(this, _enterPen, _exitPen, d, i, j); })
				.attr("class", function(d, i, j) { return "datum-" + i + " series-" + j; })
				.call(self.attributes, self)
				//.style('opacity', 1e-6)
				.attr('d', _enterPen.path);

		var updateTransition = nodes.call(self.attributes, self)
			.call(self._removeRegisteredEvents, self)
			.call(self._addRegisteredEvents, self)
			.each(function() { this.__exiting__ = false; });

		if (dv.ANIMATION) {
			updateTransition = updateTransition.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease())
				.attrTween('d', _updatePen.pathTween);
		} else {
			updateTransition
				.each(function(d, i, j) {
					var bounds = _updatePen.bounds(d, i, j);
					if (bounds) {
						d.bounds = bounds.bounds;
					}
				})
				.attr('d', _updatePen.path);
		}

		updateTransition
			.call(self.addEachFunction, self);
	};

	geom.addEachFunction = function(selection, self) {
		if (self._each) {
			if (!dv.util.isUndefined(self._each["start"])) {
				if (dv.ANIMATION) {
					selection.each("start", function(d, i, j) {
						self._each["start"].call(this, d, i, j);
					});
				} else {
					selection.each(function(d, i, j) {
						self._each["start"].call(this, d, i, j);
					});
				}
			}

			if (!dv.util.isUndefined(self._each["end"])) {
				if (dv.ANIMATION) {
					selection.each("end", function(d, i, j) {
						self._each["end"].call(this, d, i, j);
					});
				} else {
					selection.each(function(d, i, j) {
						self._each["end"].call(this, d, i, j);
					});
				}
			}
		}
	};

	geom.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	geom.setPreviousState = function(enterPen, exitPen, d, i) {
		var bounds = enterPen.bounds(d, i);
		this.__previousBounds__ = bounds;
		this.__exitTransition__ = exitPen;
	};

	geom.pathTween = function(pathRenderer, selection, d, i, j) {
		var path,
			e = d3.select(selection);

		if (selection.__exiting__) {
			path = selection.__exitTransition__.path(d, i);
			selection.__exiting__ = false;
		}
		else {
			path = pathRenderer.getPath(pathRenderer.getBounds(d, i));
		}

		if (path === null) {
			e.remove();
			return null;
		}
		return d3.interpolate(e.attr("d"), path);
	};

	geom._calculateStats = function() {
	};

	/**
	 * Compute stack/fill position adjustments relative to the facet the data points
	 * belong in rather than the scope of the entire chart (all of the facets).
	 */
	geom._handlePositions = function() {
		if (this.position() !== 'stack' && this.position() !== 'fill' && this.position() !== 'dodge') return;

		var position = this.position(),
			layeredNestData = this._addGroupLayerToNestedData(),
			isFlipped = this._chart.coord().flip(),
			includeInDomain = function(prop) {
				var scaleGroup = self.getExplicitScales(prop)[prop],
					include = false;
				return function(d, i) {
					for (var scaleIndex in scaleGroup) {
						include = scaleGroup[scaleIndex]._includeInDomain(d, i);
						if (include) break;
					}
					return include ? d[prop] : 0;
				};
			},
			self = this;

		dv.util.each(layeredNestData, function(nestedFacetData) {
			var xIncludeInDomain = includeInDomain('x'),
				yIncludeInDomain = includeInDomain('y');

			if (position === 'stack') {
				d3.layout.stack()
					.x(xIncludeInDomain)
					.y(yIncludeInDomain)
					.values(function(d) { return d.values; })
					(nestedFacetData.values);
			}
			else if (position === 'fill') {
				d3.layout.stack()
					.x(xIncludeInDomain)
					.y(yIncludeInDomain)
					.offset(function(data) {
						var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
						for (j = 0; j < m; ++j) {
							for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
							if (o) for (i = 0; i < n; i++) data[i][j][1] /= o;
							else for (i = 0; i < n; i++) data[i][j][1] = 0;
						}
						for (j = 0; j < m; ++j) y0[j] = 0;
						return y0;
					})
					.values(function(d) { return d.values; })
					(nestedFacetData.values);
			}
			else if (position === 'dodge') {
				// Give each zipData point a group index so we know how much width to allocate them when we draw.
				var numGroups = nestedFacetData.values.length;
				dv.util.each(nestedFacetData.values, function(nestedGroupData, i) {
					dv.util.each(nestedGroupData.values, function(pointData) {
						// If the series is flipped and we're dodged, render the first series on top instead of bottom.
						pointData.dodge = {
							groupIndex: i,
							numGroups: numGroups
						};
					});
				});
			}
		});
	};

	/**
	 * Converts from our facet-group combo data structure in _nestData:
	 * [
	 *   {
	 *     key: facetId ~ groupId,
	 *     values: [
	 *       {...},
	 *       {...},
	 *       ...
	 *     ]
	 *   },
	 *   ...
	 * ]
	 *
	 * to a completely nested structure for computing stack/fill positions:
	 * [
	 *   {
	 *     key: facetId,
	 *     values: [
	 *       {
	 *         key: groupId,
	 *         values: [
	 *           {...},
	 *           {...},
	 *           ...
	 *         ]
	 *       },
	 *       ...
	 *     ]
	 *   },
	 *   ...
	 * ]
	 */
	geom._addGroupLayerToNestedData = function() {
		var nestedGroups = [],
			facetIdToIndex = {},
			groupIdToIndex = {};


		dv.util.each(this._nestData, function(d, i) {
			var facetId = /(.*) ~ .*/g.exec(d.key)[1],
				groupId = /.* ~ (.*)/g.exec(d.key)[1],
				facet, group;

			if (!facetIdToIndex.hasOwnProperty(facetId)) {
				nestedGroups.push({ key: facetId, values: [] });
				facetIdToIndex[facetId] = nestedGroups.length - 1;
			}
			facet = nestedGroups[facetIdToIndex[facetId]];

			if (!groupIdToIndex.hasOwnProperty(d.key)) {
				facet.values.push({ key: groupId, values: [] });
				groupIdToIndex[d.key] = facet.values.length - 1;
			}
			group = facet.values[groupIdToIndex[d.key]];
			group.values = group.values.concat(d.values);
		});

		return nestedGroups;
	};

	geom.exit = function(geomGroup) {
		d3.select(geomGroup)
			.selectAll('.series')
				.call(this.exitSeriesGroup, this);
	};

	geom.exitSeries = function(seriesGroups, exitPen, self) {
		seriesGroups.selectAll('.' + self._dataPointStyleClass)
			.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease())
				.each(function() { this.__exiting__ = true; })
				.attrTween('d', exitPen.call(self).pathTween)
				.remove()
				.each("end", function(d, i) {
					var seriesGroupNode = this.parentNode;
					if (seriesGroupNode && seriesGroupNode.childNodes && !seriesGroupNode.childNodes.length) {
						// Is the geom container empty now too?
						var geomNode = seriesGroupNode.parentNode;
						if (geomNode && geomNode.childNodes && geomNode.childNodes.length <= 1) {
							d3.select(geomNode).remove();
						} else {
							d3.select(seriesGroupNode).remove();
						}
					}
				});
	};

	geom.coord = function() {
		return this.chart().coord();
	};

	geom._addRegisteredEvents = function(nodes, self) {
		if (!self) self = this;
		if (!self._geomGroup) return;

		nodes = (!nodes ? self._geomGroup.selectAll('.series').selectAll('.' + this._dataPointStyleClass) : nodes);
		self = self || this;
		dv.util.each(self.eventMap, function(e, type) {
			nodes.on(type, function(d, i, j) { // intercept the event and add our own parameters...
					self.eventMap[type].callback.call(this, d, i, j, d3.event);
				}, e.capture);
		});
		dv.util.each(self._chart.eventMap, function(e, type) {
			nodes.on(type + ".dvchart", function(d, i) {
					var e = d3.event,
						interactionGroup = self._chart._interactionGroup.select(".interaction-canvas").node();

					if (self._shouldDispatchChartEvent(e, interactionGroup)) {
						self._chart.eventMap[type].callback.call(interactionGroup, e);
					}
				}, e.capture);
		});

		// Forward this event on to the behaviors
		dv.util.each(self._behaviors, function(behavior) {
			if (behavior._addRegisteredEvents) behavior._addRegisteredEvents();
		});
	};

	geom._removeRegisteredEvents = function(nodes, self) {
		if (!self) self = this;
		if (!self._geomGroup) return;

		nodes = nodes || self._geomGroup.selectAll('.' + this._dataPointStyleClass);
		self = self || this;
		dv.util.each(self.unregisterEventMap, function(capture, type) {
			nodes.on(type, null, capture);
		});
		dv.util.each(self._chart.unregisterEventMap, function(capture, type) {
			nodes.on(type + ".dvchart", null, capture);
		});

		// Forward this event on to the behaviors
		dv.util.each(self._behaviors, function(behavior) {
			if (behavior._removeRegisteredEvents) behavior._removeRegisteredEvents();
		});
	};

	geom._shouldDispatchChartEvent = function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out/over events when rolling over geoms contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var rTarg = e.relatedTarget;
			if (!rTarg)
				rTarg = (e.type === "mouseout") ? e.toElement : e.fromElement;

			var relTarget = d3.select(rTarg);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !((relTarget.node() === interactionGroup) || (className && className.indexOf('-geom') >= 0));
			}
		}
		return result;
	};

	/**
	 * Returns all scales which have been explicitly mapped by both geom and chart (geom overrides chart).
	 */
	geom.getExplicitScalesMap = function() {
		// Clone the chart aes so we can alter it without destroying the original.
		var chartScalesMap = dv.util.clone(this._chart.getExplicitScalesMap());
		for (var prop in this._aes) {
			var geomAesGroup = this._aes[prop],
				chartAesGroup = chartScalesMap[prop] || {},
				combinedAesGroup = dv.util.extend({}, chartAesGroup, geomAesGroup);
			chartScalesMap[prop] = combinedAesGroup;
		}
		return chartScalesMap;
	};

	/**
	 * Returns a scale by looking at the aesthetics defined on the geom (preferrably) or on the chart if it's
	 * not defined on the geom.
	 */
	geom.getExplicitScale = function(property, scaleIndex) {
		if (property === 'group') return this._getGroup();

		// If we can find a scaleIndex on the geom aes, get that first, otherwise check to see if the scaleIndex
		// exists on the chart aes.
		var geomAesGroup = this._aes[property];
		var chartAesGroup = this.chart()._aes[property];
		if (scaleIndex !== undefined && geomAesGroup && geomAesGroup[scaleIndex]) return geomAesGroup[scaleIndex];
		if (scaleIndex !== undefined && chartAesGroup && chartAesGroup[scaleIndex]) return chartAesGroup[scaleIndex];
		// As a last resort just use zero for scaleIndex.
		if (geomAesGroup && geomAesGroup[0] !== undefined) return geomAesGroup[0];
		if (chartAesGroup && chartAesGroup[0] !== undefined) return chartAesGroup[0];
		return null;
	};

	/**
	 * Returns a map of all aesthetics by merging any defined on the geom as well as the chart.  Geom
	 * aesthetics take precidence.
	 */
	geom.getExplicitScales = function(property) {
		if (!dv.util.isArray(property)) property = [property];
		var explicitScales = {},
			i = -1,
			n = property.length;
		while (++i < n) {
			var prop = property[i],
				geomAesGroup = this._aes[prop],
				chartAesGroup = this.chart()._aes[prop] || {};
			explicitScales[prop] = dv.util.extend({}, chartAesGroup, geomAesGroup);
		}
		return explicitScales;
	};

	// Checks for a scale on the geom, if one isn't found, we look on the chart and eventually use
	// a default if no scale was explicitly set by the dev.
	geom.getTrainedScale = function(prop, scaleIndex) {
		return this.chart().getTrainedScale(prop, scaleIndex);
	};

	geom.getScale = function(property, scaleIndex) {
		return this.getExplicitScale(property, scaleIndex);
	};

	geom.getScales = function(property) {
		return this.getExplicitScales(property);
	};

	geom.hasScale = function(property, scaleIndex) {
		if (this.getExplicitScale(property, scaleIndex)) {
			return true;
		}
		return false;
	};

	geom._dodgeAdjust = function(d) {
		var seriesIndex = d.dodge.groupIndex,
			numSeries = d.dodge.numGroups,
			rangeBand = d.panel.xScale(d).rangeBand(),
			slicePadding = (numSeries > 1) ? rangeBand / (numSeries - 1) * this._dodgePadding : 0,
			barWidth = (rangeBand - (slicePadding * (numSeries - 1))) / numSeries;
		return (barWidth + slicePadding) * seriesIndex + (barWidth / 2);
	};

	geom.applyAttributeValue = function(selection, self, styleAttr, prop) {
		var scale = self.getScale(prop, 0);
		selection.style(styleAttr, function(d, i, j) {
			return scale ? scale.mapToProp(dv.util.isArray(d) ? d[0] : d, i, j) : null;
		});
	};

	geom._getGroup = function() {
		// If a group has been explicitly defined, we're done.
		if (this._aes.hasOwnProperty('group')) return this._aes.group[0];
		// Does chart has an explicit group?  If so let's use it.
		var chartGroup = this.chart()._getGroup();
		if (chartGroup && chartGroup.property() === 'group') return chartGroup;

		// Otherwise, let's look for a categorical aesthetic which can serve as a grouping element
		// on the geom.
		var i = -1,
			len = dv.DEFAULT_CATEGORICAL_AES.length - 1;
		while (i++ < len) {
			var catAesGroup = this._aes[dv.DEFAULT_CATEGORICAL_AES[i]];
			// If the scale has a mapping (not a dv.scale.constant scale), we'll use it.
			if (catAesGroup &&
					catAesGroup[0] &&
					catAesGroup[0] instanceof dv.scale.ordinal &&
					!dv.util.isUndefined(catAesGroup[0].mapping())) {
				return catAesGroup[0];
			}
		}

		// If no categorical aesthetic has been explicitly defined on the aes, we'll just use the
		// categorical aesthetic returned from the chart (which may be null).
		return chartGroup;
	};

	geom.each = function(arg1, arg2) {
		var timing, f;
		if (!arguments.length) return this._each;
		this._each = this._each || {};
		if (arguments.length < 2) {
			f = arg1;
			timing = "end";
		}
		else {
			f = arg2;
			timing = arg1;
		}
		this._each[timing] = f;
		return this;
	};

	geom.dodgePadding = function(val) {
		if (!arguments) return this._dodgePadding;
		this._dodgePadding = val;
		return this;
	};

	geom.behaviors = function(val) {
		if (!arguments.length) return this._behaviors;
		this._behaviors = val;
		return this;
	};

	geom.stat = function(val) { // TODO: Use me!
		if (!arguments.length) return this._stat;
		this._stat = val;
		return this;
	};

	geom.chart = function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		return this;
	};

	// This property is set by DV and shouldn't be set externally.
	geom.normalizedData = function(val) {
		if (!arguments.length) return this._normalizedData;
		this._normalizedData = val;
		return this;
	};

	geom.data = function(val) {
		if (!arguments.length) return this._data ? this._data : this.chart().data();
		this._data = val;
		return this;
	};

	return geom;
});
dv.geom.point = dv.geom.extend(function() {
	function point() {
		this._super();
		this._rendererClass = dv.geom.point;
	}
	point._dataPointStyleClass = "point-geom";

	point._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['shape'] = 'circle';
		this._defaultAes['size'] = 7;
	};

	point.getValues = function(seriesData) {
		return seriesData.values;
	};

	point.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	point.attributes = function(selection, self) {
		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'opacity', 'alpha')
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'fill', 'fill');
	};

	point.getHighlightColor = function(d, i) {
		var fillScale = this.getScale('fill'),
			strokeScale = this.getScale('stroke');

		if (strokeScale && !(strokeScale instanceof dv.scale.constant))
			return strokeScale.mapToProp(d, i);

		if (fillScale && !(fillScale instanceof dv.scale.constant))
			return fillScale.mapToProp(d, i);

		return strokeScale ? strokeScale.mapToProp(d, i) : "#8CC350";
	};

	point.enterPen = function() {
		var self = this,
			x,
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		if (this.position() === 'dodge') {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
		}
		else {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); };
		}

		return this._decoratePen(x, y);
	};

	point.pen = function() {
		var self = this,
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y;

		switch(this.position()) {
			case 'identity':
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + y.rangeBand() / 2, i); };
				break;
			case 'stack':
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0 + d.y), i); };
				break;
			case 'dodge':
				x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + y.rangeBand() / 2, i); };
				break;
			case 'fill':
				y = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x, y);
	};

	point._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	point._decoratePen = function(x, y) {
		var shapeScale = this.getScale('shape'),
			sizeScale = this.getScale('size'),
			self = this;

		var pathRenderer = this.coord()._point().x(x).y(y)
			.defined(this._defined);

		pathRenderer.renderer
			.type(function(d, i) { return shapeScale.mapToProp(d, i); })
			.size(function(d, i) { return Math.pow(sizeScale.mapToProp(d, i), 2); });
			// TODO:
			// We can't use getTrainedScale here because it has no ability to lazily create a default scale with a constant value
			// in the event that no size aesthetic was mapped.  We need a way to either:
			//		1. Continue lazily creating default scales.  Does it make sense to create them in dv.facet?
			//			Seems like dv.geom should be the only one who needs to know it's own defaults, but that
			//			creates the potential for awkward conditional logic in many places.
			//				var sizeScale = d.panel.getTrainedScale('size');
			//				return sizeScale ? sizeScale || this.getDefaultScale('size');
			//		2. We could proactively create default scales after training happens in dv.facet for those
			//			aesthetics that were never mapped. This way we could use d.panel.getTrainedScale('size')
			//			without having to worry about whether a scale has been created. **Seems right to me**
			//
			//.size(function(d, i) { return Math.pow(d.panel.getTrainedScale('size').mapToProp(d, i), 2); });

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return point;
});
dv.geom.text = dv.geom.extend(function() {
	function text() {
		this._super();
		this._rendererClass = dv.geom.text;
		this._dx = d3.functor(0);
		this._dy = d3.functor(0);
		this._textFormat = function(d) { return d; };
		this._textAnchor = "start";
	}
	text._dataPointStyleClass = "text-geom";

	text.dx = function(val) {
		if (!arguments.length) return this._dx;
		this._dx = d3.functor(val);
		return this;
	};

	text.dy = function(val) {
		if (!arguments.length) return this._dy;
		this._dy = d3.functor(val);
		return this;
	};

	text.textAnchor = function(val) {
		if (!arguments.length) return this._textAnchor;
		this._textAnchor = val;
		return this;
	};

	text.textFormat = function(val) {
		if (!arguments.length) return this._textFormat;
		this._textFormat = d3.functor(val);
		return this;
	};

	text.getValues = function(seriesData) {
		return seriesData.values;
	};

	text.updateDataPoints = function(seriesGroups, enterPen, pen, exitPen, self) {
		var alphaScale = self.getScale('alpha'),
			_enterPen = enterPen.call(self),
			_updatePen = pen.call(self),
			_exitPen = exitPen.call(self);

		var nodes = seriesGroups.selectAll('.' + self._dataPointStyleClass)
			.data(function(d) { return self.getValues(d); });

		nodes.exit()
			.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease())
				//.style('opacity', 1e-6)
				.call(_exitPen)
				.each("end.transition", function(d, i) {
					var parentNode = this.parentNode;
					if (parentNode) {
						parentNode.removeChild(this);
					}
				});

		nodes.enter()
			.append('text')
				.attr("class", function(d, i, j) { return "datum-" + i + " series-" + j; })
				.call(self.attributes, self)
				//.style('opacity', 1e-6)
				.call(_enterPen);

		var updateTransition = nodes.call(self.attributes, self)
			.call(self._removeRegisteredEvents, self)
			.call(self._addRegisteredEvents, self);

		if (dv.ANIMATION) {
			updateTransition = updateTransition.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease());
		}

		updateTransition
			//.style('opacity', function(d, i) { return alphaScale.mapToProp(d[0], i); })
			.call(_updatePen)
			.call(self.addEachFunction, self);
	};

	text.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	text.exitSeries = function(seriesGroups, exitPen, self) {
		seriesGroups.selectAll('.' + self._dataPointStyleClass)
			.transition()
				.delay(function(d, i, j) { return self.delay().call(this, d, i, j); })
				.duration(function(d, i, j) { return self.duration().call(this, d, i, j); })
				.ease(self.ease())
				.call(exitPen.call(self))
				.remove()
				.each("end.transition", function(d, i) {
					var seriesGroupNode = this.parentNode;
					if (seriesGroupNode.parentNode)
						seriesGroupNode.removeChild(this);
					if (seriesGroupNode && seriesGroupNode.childNodes && !seriesGroupNode.childNodes.length) {
						d3.select(seriesGroupNode).remove();
					}
				});
	};

	text.attributes = function(selection, self) {
		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'fill', 'fill')
			.call(self.applyAttributeValue, self, 'opacity', 'alpha')
			.call(self.applyAttributeValue, self, 'font-size', 'size')
			.attr('text-anchor', self._textAnchor);
	};

	text.enterPen = function() {
		var self = this,
			dx = this._dx,
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; },
			x;

		if (this.position() === 'dodge') {
			x = function(d, i, j) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d) + dx(d, i, j), i); };
		}
		else {
			x = function(d, i, j) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2 + dx(d, i, j), i); };
		}

		return this._decoratePen(x, y);
	};

	text.pen = function() {
		var self = this,
			dx = this._dx,
			dy = this._dy,
			x = function(d, i, j) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2 + dx(d, i, j), i); },
			y;

		switch(this.position()) {
			case 'identity':
				y = function(d, i, j) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + dy(d, i, j) + y.rangeBand() / 2, i); };
				break;
			case 'stack':
				y = function(d, i, j) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0 + d.y, i) + dy(d, i, j), i); };
				break;
			case 'dodge':
				x = function(d, i, j) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d) + dx(d, i, j), i); };
				y = function(d, i, j) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + dy(d, i, j) + y.rangeBand() / 2, i); };
				break;
			case 'fill':
				y = function(d, i, j) { var y = d.panel.yScale(d); return (d.y + d.y0) + y.mapValueToPercent(dy(d, i, j) + dv.util.scaleRange(y)[0], i); };
				break;
		}

		return this._decoratePen(x, y);
	};

	text._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	text._decoratePen = function(x, y) {
		var labelScale = this.getScale('label'),
			self = this;

		var textRenderer = this.coord()._text().x(x).y(y);

		return textRenderer()
			.label(function(d, i, j) { return self._textFormat.call(this, labelScale.mapToProp(d, i), i, j); })
			.defined(this._defined);
	};

	return text;
});
dv.geom.line = dv.geom.extend(function() {
	function line() {
		this._super();
		this._tension = 0.7;
		this._interpolate = 'linear';
		this._rendererClass = dv.geom.line;
	}
	line._dataPointStyleClass = "line-geom";

	line.tension = function(val) {
		if (!arguments.length) return this._tension;
		this._tension = val;
		return this;
	};

	// For a list of possible values see:  https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate
	line.interpolate = function(val) {
		if (!arguments.length) return this._interpolate;
		this._interpolate = val;
		return this;
	};

	line._render = function(geomGroup) {
		this._super(geomGroup);

		var sizeScale = this.getScale('size');
		if (sizeScale && sizeScale.to && !sizeScale.to()) sizeScale.to([2, 8]);
	};

	line.getValues = function(seriesData) {
		// A single path within a line geom is mapped to several points (not a 1:1 relationship unlike point)
		return [seriesData.values];
	};

	line.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	line.attributes = function(selection, self) {
		var lineTypeScale = self.getScale('linetype', 0);

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'opacity', 'alpha')
			.call(self.applyAttributeValue, self, 'stroke-width', 'size')
			.style('stroke-dasharray', function(d, i, j) { return lineTypeScale ? dv.util.svg.getDasharray(lineTypeScale.mapToProp(d[0], i, j)) : null; })
			.style('fill', 'none');
	};

	line.getHighlightColor = function(d, i) {
		var strokeScale = this.getScale('stroke', 0);
		return strokeScale ? strokeScale.mapToProp(d, i) : "#8CC350";
	};

	line.enterPen = function() {
		var self = this,
			x,
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		if (this.position() === 'dodge') {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
		}
		else {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); };
		}

		return this._decoratePen(x, y);
	};

	line.pen = function() {
		var self = this,
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y;

		switch(this.position()) {
			case 'identity':
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + y.rangeBand() / 2, i); };
				break;
			case 'stack':
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0 + d.y), i); };
				break;
			case 'dodge':
				x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
				y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + y.rangeBand() / 2, i); };
				break;
			case 'fill':
				y = function(d, i) { return (d.y + d.y0); };
				break;
		}

		return this._decoratePen(x, y);
	};

	line._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	line._decoratePen = function(x, y) {
		var self = this;

		var pathRenderer = this.coord()._line().x(x).y(y)
			.defined(this._defined);

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};
	return line;
});
dv.geom.area = dv.geom.extend(function() {
	function area() {
		this._super();
		this._tension = 0.7;
		this._interpolate = 'linear';
		this._rendererClass = dv.geom.area;
		this._baseline = 0;
	}

	area._dataPointStyleClass = "area-geom";

	area._initializeDefaultAes =function() {
		this._super();
	};

	area._trainScales = function() {
		// By default we set the domain min to be 0
		if (this._baseline !== undefined) {
			var yScaleGroup = this.getExplicitScales('y')['y'];
			for (var scaleIndex in yScaleGroup) {
				var yScale = yScaleGroup[scaleIndex];
				if (yScale instanceof dv.scale.continuous) {
					yScale.softLowerLimit(this._baseline);
				}
			}
		}

		this._super();
	};

	area.tension = function(val) {
		if (!arguments.length) return this._tension;
		this._tension = val;
		return this;
	};

	// For a list of possible values see:  https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
	area.interpolate = function(val) {
		if (!arguments.length) return this._interpolate;
		this._interpolate = val;
		return this;
	};

	area.getValues = function(seriesData) {
		return [seriesData.values];
	};

	area.pathTween = function(pathRenderer, selection, d, i, j) {
		var dObj = d,
			currentData,
			previousData = selection.__previousBounds__,
			objTweens = [],
			len,
			_enterPen = this.enterPen.call(this, j),
			current,
			previous,
			xDomain = this.getScale("x").domain(),
			pointI = -1;

		currentData = pathRenderer.getBounds(d, i);
		currentData.coord = this.coord();

		// Transitioning from a polar to a cartesian area is tricky with the area geom.  Let's just make it exit for now and we'll transition the new one in.
		if (previousData && previousData.coord
				&& (currentData.coord._type !== previousData.coord._type)
					|| currentData.coord.flip() != previousData.coord.flip()) {
			previousData = this.enterPen.call(this, j).bounds(d, i);
		}

		len = Math.max(currentData.length, previousData.length);
		while(++pointI < len) {
			current = (pointI < currentData.length) ? currentData[pointI] : null;
			previous = (pointI < previousData.length) ? previousData[pointI] : null;
			if (!previous) {
				current.x = xDomain[xDomain.length - 1];
				previous = _enterPen.bounds([current], i)[0];
			}
			else if (!current) {
				current = _enterPen.bounds([previous], i)[0];
			}
			objTweens.push(d3.interpolateObject(previous.bounds, current.bounds));
		}

		selection.__previousBounds__ = currentData;

		return function(t) {
			if (t === 1) { // When the transition finishes, trim off any other data points that no longer exist.
				objTweens = objTweens.splice(0, currentData.length);
			}

			var bounds = [];
			dv.util.each(objTweens, function(tween, tweenIndex) { // Iterate through all the tweens and execute them.
				var obj = {};
				obj.bounds = tween(t);
				bounds.push(obj);
			});
			return pathRenderer.getPath(bounds);
		};
	};

	area.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	area.attributes = function(selection, self) {
		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'opacity', 'alpha')
			.call(self.applyAttributeValue, self, 'fill', 'fill');
	};

	area.getHighlightColor = function(d, i) {
		var fillScale = this.getScale('fill');
		return fillScale ? fillScale.mapToProp(d, i) : "#8CC350";
	};

	area.getBaseline = function(yScale) {
		var minDomain = yScale.domain()[0];
		if (self._baseline !== undefined) {
			return self._baseline;
		}
		return minDomain < 0 ? 0 : minDomain;
	};

	area.enterPen = function() {
		var self = this,
			x,
			y = function(d, i) { var y = d.panel.yScale(d);	return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); };

		if (this.position() === 'dodge') {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
		}
		else {
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); };
		}

		return this._decoratePen(x, y, y);
	};

	area.pen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y0, y1,
			self = this;

		switch(this.position()) {
			case 'identity':
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); };
				y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapPropToPercent(d, i); };
				break;
			case 'stack':
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0), i); };
				y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0 + d.y), i); };
				break;
			case 'dodge':
				x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); };
				y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapPropToPercent(d, i); };
				break;
			case 'fill':
				y0 = function(d, i) { return d.y0; }; // Already in percent
				y1 = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x, y0, y1);
	};

	area._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d));
	};

	area._decoratePen = function(x, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._area().x(x).y0(y0).y1(y1)
			.defined(this._defined);

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.coord = self.coord();
				}
				return newD;
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	area.baseline = function(val) {
		if (!arguments.length) return this._baseline;
		this._baseline = val;
		return this;
	};

	return area;
});
dv.geom.rect = dv.geom.extend(function() {
	function rect() {
		this._super();
		this._rendererClass = dv.geom.rect;
	}
	rect._dataPointStyleClass = "bar-geom";

	rect._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		this._defaultAes['xMin'] = 1;
		this._defaultAes['xMax'] = 1;

		delete this._defaultAes['x'];
		delete this._defaultAes['y'];
	};

	rect._trainScales = function() {
		// This geom won't have y or x aesthetics by default.  We'll need to make sure they exist.  If they don't, we'll create them using
		// properties off the min and max scales.
		var explicitScales = this.getExplicitScales(['yMin', 'xMin']),
			yMinScales = explicitScales['yMin'],
			xMinScales = explicitScales['xMin'],
			scaleIndex;

		for (scaleIndex in yMinScales) {
			var yScaleGroup = this._aes['y'];
			if (!yScaleGroup) this._aes['y'] = yScaleGroup = {};
			if (!yScaleGroup[scaleIndex]) yScaleGroup[scaleIndex] = yMinScales[scaleIndex].copy().property('y').mapping('y');
			yScaleGroup[scaleIndex].trainingProperties(['yMin', 'yMax']);
		}
		for (scaleIndex in xMinScales) {
			var xScaleGroup = this._aes['x'];
			if (!xScaleGroup) this._aes['x'] = xScaleGroup = {};
			if (!xScaleGroup[scaleIndex]) xScaleGroup[scaleIndex] = xMinScales[scaleIndex].copy().property('x').mapping('x');
			xScaleGroup[scaleIndex].trainingProperties(['xMin', 'xMax']);
		}
	};

	rect.getValues = function(seriesData) {
		return seriesData.values;
	};

	rect._render = function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin, yMax, xMin, xMax aesthetics.
		var explicitScales = this.getExplicitScales(['yMin', 'yMax', 'y', 'xMin', 'xMax', 'x']),
			scaleIndex;
		for (scaleIndex in explicitScales['yMin']) {
			var yMinScale = explicitScales['yMin'][scaleIndex],
				yMaxScale = explicitScales['yMax'][scaleIndex],
				yScale = explicitScales['y'][scaleIndex];
			if (yScale) {
				yMaxScale.range(yScale.range()).domain(yScale.domain());
				yMinScale.range(yScale.range()).domain(yScale.domain());
			}
		}
		for (scaleIndex in explicitScales['xMin']) {
			var xMinScale = explicitScales['xMin'][scaleIndex],
				xMaxScale = explicitScales['xMax'][scaleIndex],
				xScale = explicitScales['x'][scaleIndex];
			if (xScale) {
				xMaxScale.range(xScale.range()).domain(xScale.domain());
				xMinScale.range(xScale.range()).domain(xScale.domain());
			}
		}

		this._super(geomGroup);
	};

	rect.pathTween = function(pathRenderer, selection, d, i, j) {
		var dObj = d,
			currentData,
			previousData = selection.__previousBounds__,
			currentCoord = this.coord()._type;

		if (selection.__exiting__)
			currentData = selection.__exitTransition__.bounds(d, i);
		else
			currentData = pathRenderer.getBounds(d, i);

		// Transitioning from a polar to a cartesian bar is tricky with the bar geom.
		if ((previousData && previousData.coord && currentCoord !== previousData.coord)) {
			previousData = selection.__exitTransition__.bounds(d, i);
		}

		if (!currentData || !previousData) return null; // This shouldn't happen, but just in case...

		currentData.coord = currentCoord;

		var objTween = d3.interpolateObject(previousData.bounds, currentData.bounds);
		selection.__previousBounds__ = currentData;
		return function(t) {
			dObj.bounds = objTween(t);
			return pathRenderer.getPath(dObj);
		};
	};

	rect.attributes = function(selection, self) {
		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'fill', 'fill')
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'opacity', 'alpha');
	};

	//	The shape of the geometry when its data enters the picture.
	//	The rectangle will appear from the bottom of the viewport.
	rect.enterPen = function() {
		var y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; },
			x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapValue(dv.util.isArray(d.x) ? d.x[0] : d.xMin, i)); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapValue(dv.util.isArray(d.x) ? d.x[1] : d.xMax, i)); };

		return this._decoratePen(x0, x1, y, y);
	};

	rect.pen = function() {
		var x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapValue(dv.util.isArray(d.x) ? d.x[0] : d.xMin, i)); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapValue(dv.util.isArray(d.x) ? d.x[1] : d.xMax, i)); },
			y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(dv.util.isArray(d.y) ? d.y[0] : d.yMin, i)); },
			y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(dv.util.isArray(d.y) ? d.y[1] : d.yMax, i)); };

		return this._decoratePen(x0, x1, y0, y1);
	};

	rect._defined = function(d, i) {
		var x = d.panel.xScale(d),
			y = d.panel.yScale(d);
		return dv.util.isFinite(x.mapValue(dv.util.isArray(d.x) ? d.x[0] : d.xMin, i))
			&& dv.util.isFinite(x.mapValue(dv.util.isArray(d.x) ? d.x[1] : d.xMax, i))
			&& dv.util.isFinite(y.mapValue(dv.util.isArray(d.y) ? d.y[0] : d.yMin, i))
			&& dv.util.isFinite(y.mapValue(dv.util.isArray(d.y) ? d.y[1] : d.yMax, i));
	};

	rect._decoratePen = function(x0, x1, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._rect().x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(this._defined);

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type;
				}
				return newD;
			},
			pathTween: function(d, i, j) { return self.pathTween(pathRenderer, this, d, i, j); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return rect;
});
dv.geom.tile = dv.geom.rect.extend(function() {
	function tile() {
		this._super();
		this._rendererClass = dv.geom.tile;
	}
	tile._dataPointStyleClass = "tile-geom";

	tile._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['y'] = 1;
		this._defaultAes['x'] = 1;
	};

	tile.getValues = function(seriesData) {
		return seriesData.values;
	};

	tile.enterPen = function() {
		var y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; },
			x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };

		return this._decoratePen(x0, x1, y, y);
	};

	tile.pen = function() {
		var x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); },
			y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapPropToPercent(d, i); },
			y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapToProp(d, i) + y.rangeBand(), i); };

		return this._decoratePen(x0, x1, y0, y1);
	};

	tile._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	tile._decoratePen = function(x0, x1, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._rect().x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(this._defined);

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type;
				}
				return newD;
			},
			pathTween: function(d, i, j) { return self.pathTween(pathRenderer, this, d, i, j); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return tile;
});
dv.geom.bar = dv.geom.rect.extend(function() {
	function bar() {
		this._super();
		this._rendererClass = dv.geom.bar;
		this._baseline = 0;
	}

	bar._dataPointStyleClass = "bar-geom";

	bar._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['y'] = 1;
		this._defaultAes['x'] = 1;
	};

	bar._trainScales = function() {
		// By default we set the domain min to be 0
		if (this._baseline !== undefined) {
			var yScaleGroup = this.getExplicitScales('y')['y'];
			for (var scaleIndex in yScaleGroup) {
				var yScale = yScaleGroup[scaleIndex];
				if (yScale instanceof dv.scale.continuous) {
					yScale.softLowerLimit(this._baseline);
				}
			}
		}
	};

	bar.getValues = function(seriesData) {
		return seriesData.values;
	};

	bar.getBaseline = function(yScale) {
		var minDomain = yScale.domain()[0];
		if (self._baseline !== undefined) {
			return self._baseline;
		}
		return minDomain < 0 ? 0 : minDomain;
	};

	bar.enterPen = function() {
		var self = this,
			y = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); },
			x0, x1;

		if (this.position() === 'dodge') {
			x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d, true), i); };
		}
		else {
			x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); };
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };
		}

		return this._decoratePen(x0, x1, y, y);
	};

	bar.pen = function() {
		var x0, x1, y0, y1,
			self = this;

		switch (this.position()) {
			case 'identity':
				x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); };
				x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); };
				y1 = function(d, i) { return d.panel.yScale(d).mapPropToPercent(d, i); };
				break;
			case 'stack':
				x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); };
				x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0), i); };
				y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.y0 + d.y), i); };
				break;
			case 'dodge':
				x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d), i); };
				x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._dodgeAdjust(d, true), i); };
				y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(self.getBaseline(y)), i); };
				y1 = function(d, i) { return d.panel.yScale(d).mapPropToPercent(d, i); };
				break;
			case 'fill':
				x0 = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); };
				x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };
				y0 = function(d, i) { return d.y0; }; // Already in percent
				y1 = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x0, x1, y0, y1);
	};

	bar._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i)) && dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	bar._decoratePen = function(x0, x1, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._rect().x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(this._defined);

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type;
				}
				return newD;
			},
			pathTween: function(d, i, j) { return self.pathTween(pathRenderer, this, d, i, j); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	bar._dodgeAdjust = function(d, isEnd) {
		var seriesIndex = d.dodge.groupIndex,
			numSeries = d.dodge.numGroups,
			rangeBand = d.panel.xScale(d).rangeBand(),
			slicePadding = (numSeries > 1) ? rangeBand / (numSeries - 1) * this._dodgePadding : 0,
			barWidth = (rangeBand - (slicePadding * (numSeries - 1))) / numSeries;
		return (barWidth + slicePadding) * seriesIndex + (isEnd ? barWidth : 0);
	};

	bar.baseline = function(val) {
		if (!arguments.length) return this._baseline;
		this._baseline = val;
		return this;
	};

	return bar;
});
dv.geom.barrange = dv.geom.bar.extend(function() {
	function barrange() {
		this._super();
		this._rendererClass = dv.geom.barrange;
	}

	barrange._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		delete this._defaultAes['y'];
	};

	barrange._trainScales = function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		var yMinScales = this.getExplicitScales('yMin')['yMin'],
			yScales,
			yScale;
		for (var scaleIndex in yMinScales) {
			if (!this._aes['y']) this._aes['y'] = {};
			yScales = this._aes['y'];
			yScale = yScales[scaleIndex];
			if (!yScale) yScales[scaleIndex] = yScale = yMinScales[scaleIndex].copy().property('y').mapping('y');
			yScale.trainingProperties(['yMin', 'yMax']);
		}
	};

	barrange._render = function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics.
		var explicitScales = this.getExplicitScales(['yMin', 'yMax', 'y']),
			yMinScales = explicitScales['yMin'];
		for (var scaleIndex in yMinScales) {
			var yMinScale = yMinScales[scaleIndex],
				yMaxScale = explicitScales['yMax'][scaleIndex],
				yScale = explicitScales['y'][scaleIndex];

			// TODO: What if the yScale is ordinal? The range function isn't what we'll want here.
			yMaxScale.range(yScale.range()).domain(yScale.domain());
			yMinScale.range(yScale.range()).domain(yScale.domain());
		}

		this._super(geomGroup);
	};

	barrange.enterPen = function() {
		var y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; },
			x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapPropToPercent(d, i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); };

		return this._decoratePen(x0, x1, y, y);
	};

	barrange.pen = function() {
		var x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapPropToPercent(d, i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand(), i); },
			y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMin, i), i); },
			y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMax, i), i); };

		return this._decoratePen(x0, x1, y0, y1);
	};

	barrange._defined = function(d, i) {
		var x = d.panel.xScale(d),
			y = d.panel.yScale(d);
		return dv.util.isFinite(x.mapToProp(d, i))
			&& dv.util.isFinite(y.mapValue(d.yMin, i))
			&& dv.util.isFinite(y.mapValue(d.yMax, i));
	};

	barrange._decoratePen = function(x0, x1, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._rect().x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(this._defined);

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type;
				}
				return newD;
			},
			pathTween: function(d, i, j) { return self.pathTween(pathRenderer, this, d, i, j); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return barrange;
});
dv.geom.segment = dv.geom.line.extend(function() {
	function segment() {
		this._super();
		this._rendererClass = dv.geom.segment;
	}

	segment.getValues = function(seriesData) {
		return seriesData.values;
	};

	segment.enterPen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	};

	segment.pen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y = function(d, i) { return d.panel.yScale(d).mapPropToPercent(d, i); };

		return this._decoratePen(x, y);
	};

	return segment;
});
dv.geom.vline = dv.geom.segment.extend(function() {
	function vline() {
		this._super();
		this._rendererClass = dv.geom.vline;
	}
	vline._dataPointStyleClass = "vline-geom";

	vline._render = function(geomGroup) {
		var self = this;

		dv.util.each(this._nestData, function(d, i) {
			var values = [];
			dv.util.each(d.values, function(d, i) {
				var xScale = d.panel.xScale(d),
					yScale = d.panel.yScale(d),
					yDomain = yScale.domain(),
					x = d[xScale.property()];

				if (dv.util.isArray(d)) {
					d[0].x = x;
					d[1].x = x;
				} else {
					var minMax = [];
					d.x = x;
					minMax.push(d);
					minMax.push(dv.util.clone(d));

					values.push(minMax);
				}
			});
			self._nestData[i].values = values;
		});

		this._super(geomGroup);
	};

	vline.enterPen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y = function(d, i) { return 0; };

		return this._decoratePen(x, y);
	};

	vline.pen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y = function(d, i) { return i === 0 ? 0 : 1; };

		return this._decoratePen(x, y);
	};

	vline._defined = function(d, i) {
		return dv.util.isFinite(d.panel.xScale(d).mapToProp(d, i));
	};

	return vline;
});
dv.geom.hline = dv.geom.segment.extend(function() {
	function hline() {
		this._super();
		this._rendererClass = dv.geom.hline;
	}
	hline._dataPointStyleClass = "hline-geom";

	hline._render = function(geomGroup) {
		var self = this;

		dv.util.each(this._nestData, function(d, i) {
			var values = [];
			dv.util.each(d.values, function(d, i) {
				var xScale = d.panel.xScale(d),
					yScale = d.panel.yScale(d),
					xDomain = xScale.domain(),
					y = d[yScale.property()];

				if (dv.util.isArray(d)) { // We have already transformed the data...
					d[0].y = y;
					d[1].y = y;
				} else {
					var minMax = [];
					d.y = y;
					minMax.push(d);
					minMax.push(dv.util.clone(d));

					values.push(minMax);
				}
			});
			self._nestData[i].values = values;
		});

		this._super(geomGroup);
	};

	hline.enterPen = function() {
		var x = function(d, i) { return i === 0 ? 0 : 1; },
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	};

	hline.pen = function() {
		var x = function(d, i) { return i === 0 ? 0 : 1; },
			y = function(d, i) { return d.panel.yScale(d).mapPropToPercent(d, i); };

		return this._decoratePen(x, y);
	};

	hline._defined = function(d, i) {
		return dv.util.isFinite(d.panel.yScale(d).mapToProp(d, i));
	};

	return hline;
});
// Requires yMax and yMin aesthetics be defined.
dv.geom.ribbon = dv.geom.area.extend(function() {
	function ribbon() {
		this._super();
		this._rendererClass = dv.geom.ribbon;
	}

	ribbon._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		delete this._defaultAes['y'];
	};

	ribbon._trainScales = function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		var yMinScales = this.getExplicitScales('yMin')['yMin'],
			yScales,
			yScale;
		for (var scaleIndex in yMinScales) {
			if (!this._aes['y']) this._aes['y'] = {};
			yScales = this._aes['y'];
			yScale = yScales[scaleIndex];
			if (!yScale) yScales[scaleIndex] = yScale = yMinScales[scaleIndex].copy().property('y').mapping('y');
			yScale.trainingProperties(['yMin', 'yMax']);
		}
	};

	ribbon._render = function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics.
		var explicitScales = this.getExplicitScales(['yMin', 'yMax', 'y']),
			yMinScales = explicitScales['yMin'];
		for (var scaleIndex in yMinScales) {
			var yMinScale = yMinScales[scaleIndex],
				yMaxScale = explicitScales['yMax'][scaleIndex],
				yScale = explicitScales['y'][scaleIndex];

			// TODO: What if the yScale is ordinal? The range function isn't what we'll want here.
			yMaxScale.range(yScale.range()).domain(yScale.domain());
			yMinScale.range(yScale.range()).domain(yScale.domain());
		}

		this._super(geomGroup);
	};

	ribbon.enterPen = function() {
		var self = this,
			x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		return this._decoratePen(x, y, y);
	};

	ribbon.pen = function() {
		var x = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + x.rangeBand() / 2, i); },
			y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMin, i)); },
			y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMax, i)); };

		return this._decoratePen(x, y0, y1);
	};

	ribbon._defined = function(d, i) {
		var x = d.panel.xScale(d),
			y = d.panel.yScale(d);
		return dv.util.isFinite(x.mapToProp(d, i))
			&& dv.util.isFinite(y.mapValue(d.yMin, i))
			&& dv.util.isFinite(y.mapValue(d.yMax, i));
	};

	ribbon._decoratePen = function(x, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._area().x(x).y0(y0).y1(y1)
			.defined(this._defined);

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) {
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.coord = self.coord();
				}
				return newD;
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return ribbon;
});
// Requires yMax and yMin aesthetics be defined.
dv.geom.errorbar = dv.geom.extend(function() {
	function errorbar() {
		this._super();
		this._rendererClass = dv.geom.errorbar;

		this._width = 1;
	}
	errorbar._dataPointStyleClass = "errorbar-geom";

	errorbar._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		delete this._defaultAes['y'];
	};

	errorbar._trainScales = function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		var yMinScales = this.getExplicitScales('yMin')['yMin'],
			yScale;
		for (var scaleIndex in yMinScales) {
			if (!this._aes['y']) this._aes['y'] = {};
			yScales = this._aes['y'];
			yScale = yScales[scaleIndex];
			if (!yScale) yScales[scaleIndex] = yScale = yMinScales[scaleIndex].copy().property('y').mapping('y');
			yScale.trainingProperties(['yMin', 'yMax']);
		}
	};

	errorbar.getValues = function(seriesData) {
		return seriesData.values;
	};

	errorbar.width = function(val) {
		if (!arguments.length) return this._width;
		this._width = val;
		return this;
	};

	errorbar.attributes = function(selection, self) {
		var lineTypeScale = self.getScale('linetype');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'opacity', 'alpha')
			.call(self.applyAttributeValue, self, 'stroke-width', 'size')
			.style('stroke-dasharray', function(d, i, j) { return lineTypeScale ? dv.util.svg.getDasharray(lineTypeScale.mapToProp(d[0], i, j)) : null; })
			.style('fill', 'none');
	};

	errorbar._render = function(geomGroup) {
		var xScale = this.getScale('x');

		// Determine the smallest x gap between points
		if (!(xScale instanceof dv.scale.ordinal)) {
			var minDistanceBetweenPoints = Number.MAX_VALUE,
				value,
				previousValue;

			dv.util.each(this._nestData, function(seriesData) {
				dv.util.each(seriesData.values, function(pointData) {
					value = pointData.panel.xScale(pointData).mapValue(pointData.x);
					if (!dv.util.isUndefined(previousValue)) {
						minDistanceBetweenPoints = Math.min(minDistanceBetweenPoints, Math.abs(value - previousValue));
					}
					previousValue = value;
				});
			});

			this._maxWidthPixels = minDistanceBetweenPoints;
		}

		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics.
		var explicitScales = this.getExplicitScales(['yMin', 'yMax', 'y']),
			yMinScales = explicitScales['yMin'];
		for (var scaleIndex in yMinScales) {
			var yMinScale = yMinScales[scaleIndex],
				yMaxScale = explicitScales['yMax'][scaleIndex];
				yScale = explicitScales['y'][scaleIndex];

			yMaxScale.range(yScale.range()).domain(yScale.domain());
			yMinScale.range(yScale.range()).domain(yScale.domain());
		}

		this._super(geomGroup);
	};

	errorbar.enterPen = function() {
		var self = this,
			x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._offsetX(d), i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._offsetX(d, true), i); },
			y = function(d, i) { return d.panel.yScale(d).reverse() ? 1 : 0; };

		return this._decoratePen(x0, x1, y, y);
	};

	errorbar.pen = function() {
		var self = this,
			x0 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._offsetX(d), i); },
			x1 = function(d, i) { var x = d.panel.xScale(d); return x.mapValueToPercent(x.mapToProp(d, i) + self._offsetX(d, true), i); },
			y0 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMin, i)); },
			y1 = function(d, i) { var y = d.panel.yScale(d); return y.mapValueToPercent(y.mapValue(d.yMax, i)); };

		return this._decoratePen(x0, x1, y0, y1);
	};

	errorbar._isOrdinal = function(d) {
		return d.panel.xScale(d) instanceof dv.scale.ordinal;
	};

	errorbar._offsetX = function(d, isEnd) {
		var x = d.panel.xScale(d),
			result;
		if (x instanceof dv.scale.ordinal) {
			result = x.rangeBand() / 2 + x.rangeBand() / 2 * (isEnd ? this._width : -this._width);
		}
		else {
			result = this._maxWidthPixels * (isEnd ? this._width / 2 : -this._width / 2);
		}
		return result;
	};

	errorbar._defined = function(d, i) {
		var x = d.panel.xScale(d),
			y = d.panel.yScale(d);
		return dv.util.isFinite(x.mapToProp(d, i))
			&& dv.util.isFinite(y.mapValue(d.yMin, i))
			&& dv.util.isFinite(y.mapValue(d.yMax, i));
	};

	errorbar._decoratePen = function(x0, x1, y0, y1) {
		var self = this;

		var pathRenderer = this.coord()._errorBar().x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(this._defined);

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return errorbar;
});
dv.geom.poly = dv.geom.extend(function() {
	function poly() {
		this._super();
		this._rendererClass = dv.geom.poly;
	}
	poly._dataPointStyleClass = "poly-geom";

	poly._initializeDefaultAes = function() {
		this._super();
		this._defaultAes['size'] = 1;

		delete this._defaultAes['shape'];
		delete this._defaultAes['x'];
		delete this._defaultAes['y'];
	};

	poly._trainScales = function() {
		// This geom won't have y or x aesthetics by default.  We'll need to make sure they exist.  If they don't, we'll create them using
		// properties off the min and max scales.
		var explicitScales = this.getExplicitScales(['yMin', 'xMin']),
			scaleIndex;
		for (scaleIndex in explicitScales['yMin']) {
			var yScaleGroup = this._aes['y'];
			if (!yScaleGroup) this._aes['y'] = yScaleGroup = {};
			if (!yScaleGroup[scaleIndex]) yScaleGroup[scaleIndex] = yMinScale.copy().property('y').mapping('y');
			yScaleGroup[scaleIndex].trainingProperties(['yMin', 'yMax']);
		}
		for (scaleIndex in explicitScales['xMin']) {
			var xScaleGroup = this._aes['x'];
			if (!xScaleGroup) this._aes['x'] = xScaleGroup = {};
			if (!xScaleGroup[scaleIndex]) xScaleGroup[scaleIndex] = xMinScale.copy().property('x').mapping('x');
			xScaleGroup[scaleIndex].trainingProperties(['xMin', 'xMax']);
		}
	};

	poly.getValues = function(seriesData) {
		return seriesData.values;
	};

	poly.attributes = function(selection, self) {
		var fillScale = self.getScale('fill'),
			strokeScale = self.getScale('stroke'),
			alphaScale = self.getScale('alpha');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self._dataPointStyleClass, true)
			.call(self.applyAttributeValue, self, 'stroke', 'stroke')
			.call(self.applyAttributeValue, self, 'fill', 'fill')
			.call(self.applyAttributeValue, self, 'opacity', 'alpha');
	};

	poly.exitSeriesGroup = function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	};

	poly.getHighlightColor = function(d, i) {
		var fillScale = this.getScale('fill'),
			strokeScale = this.getScale('stroke');

		if (!(strokeScale instanceof dv.scale.constant))
			return strokeScale.mapToProp(d, i);

		if (!(fillScale instanceof dv.scale.constant))
			return fillScale.mapToProp(d, i);

		return strokeScale.mapToProp(d, i);
	};

	poly.enterPen = function() {
		var x = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); },
			y = function(d, i) { var y = d.panel.yScale(d); return dv.util.map(d[y.property()], function() { return y.reverse() ? 1 : 0; }); };

		return this._decoratePen(x, y);
	};

	poly.pen = function() {
		var x = function(d, i) { return d.panel.xScale(d).mapPropToPercent(d, i); },
			y = function(d, i) { return d.panel.yScale(d).mapPropToPercent(d, i); };

		return this._decoratePen(x, y);
	};

	poly._defined = function(d, i) {
		var xs = d.panel.xScale(d).mapToProp(d, i),
			ys = d.panel.yScale(d).mapToProp(d, i),
			max_i = d3.max([xs.length, ys.length]),
			finite = true;

		for (var j = 0; j < max_i && finite; j++) {
			finite = dv.util.isFinite(xs[j]) && dv.util.isFinite(ys[j]);
		}
		return finite;
	};

	poly._decoratePen = function(x, y) {
		var self = this;

		var pathRenderer = this.coord()._poly().xs(x).ys(y)
			.defined(this._defined);

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i, j) { return self.pathTween(pathRenderer, this, d, i, j); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	};

	return poly;
});
dv.behavior = dv.extend(function() {

	function behavior() {}

	// Chrome for Android version 18 has a bug where screen coordinates are used instead of client
	// coordinates.
	// https://code.google.com/p/chromium/issues/detail?id=141840
	var useScreenCoords;
	behavior._testAndroidChromeBug141840 = function() {
		if (useScreenCoords === undefined) {
			var ua = navigator.userAgent;
			useScreenCoords = /Android .* Chrome\/18+/.exec(ua) !== null || /Silk\/2./.exec(ua) !== null;
		}
		return useScreenCoords;
	};

	return behavior;
});

dv.behavior.inspector = dv.behavior.extend(function() {
	function inspector() {
		this._size = undefined;
		this._lastX = NaN;
		this._visible = false;
		this._inspector = null;
		this._thickness = 3;
		this._orientation = "bottom";
		this._currentValue = null;
		this._gutterPadding = -7; // This is the amount of space the inspector title can extend beyond the bounds of the plot (right or left)
		this._calloutPadding = { left: 8, top: 7, right: 8, bottom: 7 }; // The amount of padding the sides of the label text -- this will determine how far the background extends outside of the label.
		this._label = this._defaultLabel();
		this._underGeoms = false;
		this._dragInspect = true; // If true, we can immediately inspect without waiting for a longPress
		this._pressTimer = null; // The timer which determines if a longPress touch occurs to start inspection
	}

	inspector._render = function(selection) {
		this._domain = sort_data.call(this);

		var maxWidth = 0,
			bounds = this._chart.facet().getPanel(0)._bounds;

		if (this._size === undefined) this._size = bounds.bottom - bounds.top;

		this._xGuide = dv.util.clone(this._chart._axes._get('x')[0]);
		this._selection = selection;
		this._inspector = selection.selectAll('.inspector').data([0]);

		this._inspector.call(this._createInspector, this._orientation, bounds, this._calloutPadding, this._thickness);
	};

	inspector._createInspector = function(selection, orientation, bounds, calloutPadding, thickness) {
		var inspectorUpdate = selection,
			inspectorEnter = selection.enter();

		inspectorEnter = inspectorEnter.append('g').classed("inspector", true);

		inspectorUpdate.style("pointer-events", "none")
			.attr('opacity', 1e-6)
			.attr("transform", "translate(0," + bounds.top + ")");

		var markerEnter = inspectorEnter.append('g')
			.classed('inspector-marker', true);

		var lineContainerEnter = markerEnter.append('g')
			.classed('inspector-line-container', true);

		lineContainerEnter.append('path')
			.classed('inspector-callout', true);

		inspectorUpdate.select('.inspector-callout')
			.attr('d', function() {
				var y0 = -3,
					y1 = y0 + 5;
				if (orientation === "bottom") {
					y0 = bounds.bottom - bounds.top + 2;
					y1 = y0 - 5;
				}
				return "M-5," + y0 + "L5," + y0 + "L0," + y1 + "Z";
			});

		lineContainerEnter.append('line')
			.classed('inspector-line', true);

		inspectorUpdate.select('.inspector-line')
			.attr('y1', orientation === "bottom" ? 0 : 4)
			.attr('y2', orientation === "bottom" ? bounds.bottom - bounds.top - 6 : bounds.bottom - bounds.top)
			.style('stroke-width', thickness);

		var tip = markerEnter.append('g')
			.classed('inspector-tip', true);

		inspectorUpdate.select('.inspector-tip')
			.attr("transform", "translate(0," + (orientation === "bottom" ? bounds.bottom - bounds.top + 2 : -30) + ")");

		tip.append('rect')
			.classed('inspector-tip-background', true);

		tip.append('text')
			.classed('inspector-tip-label', true);

		inspectorUpdate.select('.inspector-tip-label')
			.attr('x', calloutPadding.left)
			.attr('y', '1em')
			.attr('dy', calloutPadding.top);
	};

	inspector.moveToIndex = function(index) {
		var xScale = this._chart.getTrainedScale('x'),
			value = this._domain[index],
			label = this._label.call(this, value, index),
			xPos = xScale.mapValue(value);

		move.call(this, value, label, xPos);
	};

	inspector.hide = function() {
		this._inspector.attr('opacity', 1e-6);
		this._visible = false;
		return this;
	};

	inspector.show = function() {
		this._inspector.attr('opacity', 1);
		this._visible = true;
		return this;
	};

	inspector._removeEvents = function() {
		this._chart.on('mousemove.inspector', null);
		this._chart.on('mouseout.inspector', null);
		this._chart.on('touchstart.inspector', null);
		this._chart.on('touchmove.inspector', null);
		this._chart.on('touchend.inspector', null);
	};

	inspector.inspectorMove = function(val) {
		if (!arguments.length) return this._inspectorMove;
		this._inspectorMove = val;
		return this;
	};

	inspector.inspectorOut = function(val) {
		if (!arguments.length) return this._inspectorOut;
		this._inspectorOut = val;
		return this;
	};

	inspector.label = function(val) {
		if (!arguments.length) return this._label;
		this._label = d3.functor(val);
		return this;
	};

	inspector.thickness = function(val) {
		if (!arguments.length) return this._thickness;
		this._thickness = val;
		return this;
	};

	inspector.size = function(val) {
		if (!arguments.length) return this._size;
		this._size = val;
		return this;
	};

	inspector.chart = function(val) {
		if (!arguments.length) return this._chart;
		if (this._chart) this._removeEvents();
		this._chart = val;
		if (this._chart) add_events.call(this);
		return this;
	};

	inspector.orientation = function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	};

	function sort_data() {
		var allData = [],
			chartXScale = this._chart.getTrainedScale('x'),
			sortedData,
			containsTimeData = false,
			uniqCompareFunc = function(a, b) {
				a = chartXScale._parse(a);
				b = chartXScale._parse(b);
				return containsTimeData && a && b ? a.getTime() === b.getTime() : a === b;
			},
			sortCompareFunc = function(d) { return chartXScale.mapValue(d); },
			chartData = this._chart.data(),
			i = -1,
			n = this._chart._layers.length;

		if (chartData.length)
			allData.concat(chartData[chartXScale.property()]);

		while (++i < n) {
			var geom = this._chart._layers[i],
				geomXScale = geom.getTrainedScale('x'),
				geomData = geom.data()[geomXScale.property()];

			// We've already added the chartData and we want to make sure geoms which just point to the chart's data don't
			// have the same data get added over and over again, so we'll check the reference and add if the data tuple is
			// unique to the geom.
			if (geomData && geomData !== chartData) {
				allData = allData.concat(geomData);
			}
			containsTimeData = containsTimeData || (geomXScale instanceof dv.scale.time || geomXScale instanceof dv.scale.time.utc);
		}

		return allData.length ? dv.util.sortBy(dv.util.uniqueValues(allData, uniqCompareFunc), sortCompareFunc) : allData;
	}

	function add_events() {
		this._chart.on('mousemove.inspector', dv.util.bind(on_mouse_move, this));
		this._chart.on('mouseout.inspector', dv.util.bind(on_mouse_out, this));
		this._chart.on('touchstart.inspector', dv.util.bind(on_touch_start, this));
		this._chart.on('touchmove.inspector', dv.util.bind(on_mouse_move, this));
		this._chart.on('touchend.inspector', dv.util.bind(on_touch_end, this));
	}

	// The default label used for the callout if nothing is specified.
	inspector._defaultLabel = function() {
		var self = this;
		return function(d) {
			var formatter = (self._xGuide.tickFormat) ? self._xGuide.tickFormat() : function(d) { return d; };
			return formatter(d);
		};
	};

	// Set a content function or a static HTML string
	inspector.label = function(lbl) {
		if (!arguments.length) return this._label;
		this._label = d3.functor(lbl);
		return this;
	};

	/**
	 * If true, the inspector is drawn underneath the geom.  False otherwise.
	 */
	inspector.underGeoms = function(val) {
		if (!arguments.length) return this._underGeoms;
		this._underGeoms = val;
		return this;
	};

	/**
	 * The amount of padding from the edges along that x axis that the inspector will not go beyond.
	 */
	inspector.gutterPadding = function(val) {
		if (!arguments.length) return this._gutterPadding;
		this._gutterPadding = val;
		return this;
	};

	function move(value, label, xPos) {
		var calloutWidth = 0,
			calloutHeight = 0;

		if (this._lastX === xPos) return;

		this._inspector.attr('opacity', 1);

		this._inspector.select('.inspector-tip-label')
			.text(label)
			.each(function() {
				var bbox = this.getBBox();
				calloutWidth = Math.max(bbox.width, calloutWidth);
				calloutHeight = Math.max(bbox.height, calloutHeight);
			});

		var panelBounds = this._chart.facet().getPanel(0).bounds(),
			inspectorCalloutXPos;

		calloutWidth += this._calloutPadding.left + this._calloutPadding.right;
		calloutHeight += this._calloutPadding.top + this._calloutPadding.bottom;
		inspectorCalloutXPos = xPos - calloutWidth / 2;
		if (inspectorCalloutXPos < panelBounds.left + this._gutterPadding) {
			inspectorCalloutXPos = panelBounds.left + this._gutterPadding;
		}
		if (inspectorCalloutXPos + calloutWidth > panelBounds.right - this._gutterPadding) {
			inspectorCalloutXPos = panelBounds.right - this._gutterPadding - calloutWidth;
		}

		this._inspector.select('.inspector-marker')
				.attr('transform', 'translate(' + inspectorCalloutXPos + ',0)');

		this._inspector.select('.inspector-tip-background')
			.attr('width', calloutWidth)
			.attr('height', calloutHeight);

		var lineXPos = xPos - inspectorCalloutXPos;
		this._inspector.select('.inspector-line-container')
			.attr('transform', 'translate(' + lineXPos + ',0)');
	}

	function on_touch_start(ev) {
		if (!ev) return;

		var self = this;
		this._dragInspect = false;
		clearTimeout(this._pressTimer);
		// Enter drag inspection mode after 500ms to avoid eating scroll events.
		this._pressTimer = setTimeout(function() {
			// Able to interact with the chart now...
			self._dragInspect = true;
			on_mouse_move.call(self, ev);
		}, 500);
		return false;
	}

	function on_touch_end(ev) {
		clearTimeout(this._pressTimer);
		if (this._dragInspect) {
			this._dragInspect = false;
		}
		on_mouse_out.call(this, ev);
	}

	function on_mouse_move(ev) {
		if (!ev) return;

		if (!this._dragInspect) {
			clearTimeout(this._pressTimer);
			return;
		}

		// If touches exist, grab the first one.  This is needed for Chrome for Android which doesn't add the correct clientX/clientY
		// properties to the main touch event.  For non-touch devices, the raw event should contain the appropriate clientX/clientY.
		var rawEvent = ev.touches ? ev.touches[0] : ev;

		var xScale = this._chart.getTrainedScale('x'),
			xCoord = this._testAndroidChromeBug141840() ? rawEvent.screenX : rawEvent.clientX,
			eventX = xCoord - rawEvent.target.getBoundingClientRect().left + rawEvent.target.getBBox().x,
			index = dv.util.binaryCompare(this._domain, eventX, function(d) { return xScale.mapValue(d); }),
			constrainedIndex = Math.min(Math.max(index || 0, 0), this._domain.length - 1),
			value = this._domain[constrainedIndex],
			label = this._label.call(this, value, constrainedIndex),
			xPos = xScale.mapValue(value);


		if (this._currentValue != value) {
			if (this._inspectorMove) {
				this._inspectorMove.call(this, label, constrainedIndex, xPos, value);
			}
			move.call(this, value, label, xPos);
		}
		this._currentValue = value;
		dv.cancelEvent(ev);
	}

	function on_mouse_out(ev) {
		this._inspector.attr('opacity', 1e-6);
		if (this._inspectorOut) {
			this._inspectorOut.call(this);
		}
		this._currentValue = null;
		dv.cancelEvent(ev);
	}

	return inspector;
});
dv.behavior.brush = dv.behavior.extend(function(){

	// Dimensions refer to which positional scales you can adjust.  You can pass in 'x', which will fix the 'y' to the height of the chart
	// (like you might use in a time series chart), or you can pass in 'y', which will fix the 'x' to the width of the chart.  If you
	// choose ['x', 'y'] which is the default, neither scale will be constrained. This is proper for a scatterplot for example.
	function brush(dimensions) {
		if (arguments.length && !dv.util.isArray(dimensions)) this._dimensions = [this._dimensions];
		this._fluidDimensions = dimensions || ['x', 'y'];
		this._snap = false;
		this._resizing = false;
	}

	brush.initializeBrush = function(chart) {
		var self = this;
		this._brush = dv.brush(chart)
			.on("brushstart.brush", function() {
					self._onBrushStart.call(self);
					if (self._brushStart) self._brushStart.call(this, "start", self._brush.extent(), self);
				})
			.on("brush.brush", function(brush) {
					self._onBrushMove.call(self);
					if (self._brushMove) self._brushMove.call(this, "move", self._brush.extent(), self);
				})
			.on("brushend.brush", function() {
					self._onBrushEnd.call(self);
					if (self._brushEnd) self._brushEnd.call(this, "end", self._brush.extent(), self);
				});
	};

	brush._removeEvents = function() {
		this._brush.on("brushstart.brush", null)
			.on("brush.brush", null)
			.on("brushend.brush", null);
	};

	brush._onBrushStart = function() {
		if (!this.snap() || this._fluidDimensions.length > 1) return;

		this._startPos = d3.mouse(this._brushContainer.node());
		// Are they dragging an existing selection instead of sizing it?
		this._moving = d3.select(d3.event.sourceEvent.target).classed("extent");
	};

	brush._onBrushMove = function() {
		if (!this.snap() || this._fluidDimensions.length > 1) return;

		var movePos = d3.mouse(this._brushContainer.node());

		if (this._startPos[0] !== movePos[0] || this._startPos[1] !== movePos[1])
			this._snapToDataPoints();
	};

	brush._onBrushEnd = function() {
		if (!this.snap() || this._fluidDimensions.length > 1) return;

		var endPos = d3.mouse(this._brushContainer.node());

		if (!this._moving && this._startPos[0] === endPos[0] && this._startPos[1] === endPos[1])
			this.clear();
		else
			this._brushContainer.selectAll(".resize").style("display", null);
	};

	/**
	 * Uses the current extent chosen by the underlying dv.brush to snap them to actual data points.
	 */
	brush._snapToDataPoints = function() {
		var brushExtent = this._brush.extent(),
			extentPixels = [],
			scale = this._chart.getTrainedScale(this._fluidDimensions[0]),
			extentValues = [this._snapToNearestPoint(scale, brushExtent[0], 0), this._snapToNearestPoint(scale, brushExtent[1], 1)];

		// Update the extent on the underlying brush
		this._brush.extent([extentValues[0].value, extentValues[1].value]);

		var plotBounds = this._chart.plotBounds();
		if (this._fluidDimensions === "x") {
			extentPixels[0] = [extentValues[0].rangeValue, 0];
			extentPixels[1] = [extentValues[1].rangeValue, plotBounds.bottom - plotBounds.top];
		}
		else {
			extentPixels[0] = [0, extentValues[0].rangeValue];
			extentPixels[1] = [plotBounds.right - plotBounds.left, extentValues[1].rangeValue];
		}

		this._adjustBounds(this._brushContainer, extentPixels);
	};

	/**
	 * Looks at either the minimum or maximum of the extent and determines how it should be snapped. This function returns an object containing
	 * the nearest point we should snap to.  The obj has two properties:  value - The domain value of the nearest point we're snapping to,
	 * rangeValue - The range value of the nearest point we're snapping to (this value will usually be inbetween two points so it's easy to tell
	 * when one data point is selected).
	 *
	 * @param scale - The scale for the dimension we are snapping on
	 * @param point - The value of the edge we are looking at
	 * @param pointIndex - 0 if we're looking at the minimum of the extent, 1 if we're looking at the maximum.
	 */
	brush._snapToNearestPoint = function(scale, point, pointIndex) {
		var retObj = {},
			constrainedIndex;

		if (scale instanceof dv.scale.ordinal || scale instanceof dv.scale.identity) {
			var range = dv.util.scaleRangeNoReverse(scale);
			var totalRange = range[1] - range[0];
			domain = scale.domain(); // possible columns
			constrainedIndex = Math.round(scale.invertValue(point) / totalRange - 1);
		}
		else {
			domain = dv.util.uniq(this._chart.data()[scale.mapping()]);
			index = dv.util.binaryCompare(domain, point, function(d) { return d; });
			constrainedIndex = Math.min(Math.max(index || 0, 0), domain.length - 1);
		}

		var value = domain[constrainedIndex];
		retObj.value = value;

		if (pointIndex === 0) {
			if (constrainedIndex === 0) {
				retObj.rangeValue = scale.mapValue(value);
			}
			else {
				var previousValue = domain[constrainedIndex - 1],
					previousValueRange = scale.mapValue(previousValue);
				valueRange = scale.mapValue(value);
				retObj.rangeValue = valueRange - (valueRange - previousValueRange) / 2;
			}
		}
		else {
			if (constrainedIndex === domain.length - 1) {
				retObj.rangeValue = scale.mapValue(value);
			}
			else {
				var nextValue = domain[constrainedIndex + 1],
					nextValueRange = scale.mapValue(nextValue);
				valueRange = scale.mapValue(value);
				retObj.rangeValue = valueRange + (nextValueRange - valueRange) / 2;
			}
		}

		return retObj;
	};

	brush._adjustBounds = function(g, extentPixels) {
		if (this._fluidDimensions === "x")
			this._adjustBoundsX(g, extentPixels);
		if (this._fluidDimensions === "y")
			this._adjustBoundsY(g, extentPixels);
		g.selectAll(".resize").attr("transform", function(d) {
			return "translate(" + extentPixels[+(/e$/).test(d)][0] + "," + extentPixels[+(/^s/).test(d)][1] + ")";
		});
	};

	brush._adjustBoundsX = function(g, extentPixels) {
		g.select(".extent").attr("x", extentPixels[0][0]);
		g.selectAll(".extent,.n>rect,.s>rect").attr("width", extentPixels[1][0] - extentPixels[0][0]);
	};

	brush._adjustBoundsY = function(g, extentPixels) {
		g.select(".extent").attr("y", extentPixels[0][1]);
		g.selectAll(".extent,.e>rect,.w>rect").attr("height", extentPixels[1][1] - extentPixels[0][1]);
	};

	brush._setScales = function() {
		if (this._fluidDimensions.indexOf('x') >= 0) {
			var x = this._chart.getTrainedScale('x');
			this._brush.x(x._d3Scale);
		}

		if (this._fluidDimensions.indexOf('y') >= 0) {
			var y = this._chart.getTrainedScale('y');
			this._brush.y(y._d3Scale);
		}
	};

	brush._render = function() {
		this._brushContainer = this._chart._parent.select('.interaction-group');

		if (this._brush.empty()) {
			this._brushContainer //= selection.append('g')
				.classed('brush', true)
				.call(this._brush);
		}

		var plotBounds = this._chart.plotBounds();
		if (!this._brush.y()) {
			var height = plotBounds.bottom - plotBounds.top;
			this._brushContainer.selectAll(".extent").attr("height", height).attr("y", 0);
			this._brushContainer.selectAll(".resize rect").attr("height", height).attr("y", 0);
		}
		if (!this._brush.x()) {
			var width = plotBounds.right - plotBounds.left;
			this._brushContainer.selectAll(".extent").attr("width", width).attr("x", 0);
			this._brushContainer.selectAll(".resize rect").attr("width", width).attr("x", 0);
		}
	};

	brush.empty = function() {
		return this._brush.empty();
	};

	brush.clear = function() {
		this._brushContainer.call(this._brush.clear());
	};

	brush.extent = function(extent) {
		if (!arguments.length) return (this._brush) ? this._brush.extent() : null;
		this._brushContainer.call(this._brush.extent(extent));
		return this;
	};

	// whether or not the extent should snap to the nearest data point.  Snap is always false if this._fluidDimensions equals ['x', 'y'].
	brush.snap = function(val) {
		if (!arguments.length) return this._snap;
		this._snap = (this._fluidDimensions.length > 1) ? false : val;
		return this;
	};

	brush.brushStart = function(val) {
		if (!arguments.length) return this._brushStart;
		this._brushStart = val;
		return this;
	};

	brush.brushMove = function(val) {
		if (!arguments.length) return this._brushMove;
		this._brushMove = val;
		return this;
	};

	brush.brushEnd = function(val) {
		if (!arguments.length) return this._brushEnd;
		this._brushEnd = val;
		return this;
	};

	brush.chart = function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		this.initializeBrush(this._chart);
		if (this._chart) this._setScales();
		return this;
	};

	return brush;
});

dv.brush = function(chart) {
	var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"),
		x = null, // x-scale, optional
		y = null, // y-scale, optional
		resizes = d3_svg_brushResizes[0],
		extent = [[0, 0], [0, 0]], // [x0, y0], [x1, y1], in pixels (integers)
		extentDomain; // the extent in data space, lazily created

	function brush(g) {
		g.each(function() {
			var g = d3.select(this),
				bg = g.selectAll(".background").data([0]),
				fg = g.selectAll(".extent").data([0]),
				tz = g.selectAll(".resize").data(resizes, String),
				e;

			chart.on("mousedown.brush", brushstart)
				.on("touchstart.brush", brushstart)
				._g.style("cursor", "crosshair");

			// Prepare the brush container for events.
			g.style("pointer-events", "all");

			// The visible brush extent; style this as you like!
			fg.enter().append("rect")
				.attr("class", "extent")
				.style("cursor", "move");

			// More invisible rects for resizing the extent.
			tz.enter().append("g")
				.attr("class", function(d) { return "resize " + d; })
				.style("cursor", function(d) { return d3_svg_brushCursor[d]; })
			.append("rect")
				.attr("x", function(d) { return (/[e]$/).test(d) ? -10 : (/[w]$/).test(d) ? 2 : null; })
				.attr("y", function(d) { return (/^[ns]/).test(d) ? -3 : null; })
				.attr("width", 10)
				.attr("height", 6)
				.style("visibility", "hidden");

			// Show or hide the resizers.
			tz.style("display", brush.empty() ? "none" : null);

			// Remove any superfluous resizers.
			tz.exit().remove();

			// Initialize the background to fill the defined range.
			// If the range isn't defined, you can post-process.
			if (x) {
				e = dv.util.scaleRangeNoReverse(x);
				bg.attr("x", e[0]).attr("width", e[1] - e[0]);
				redrawX(g);
			}
			if (y) {
				e = dv.util.scaleRangeNoReverse(y);
				bg.attr("y", e[0]).attr("height", e[1] - e[0]);
				redrawY(g);
			}
			redraw(g);
		});
	}

	function redraw(g) {
		g.selectAll(".resize").attr("transform", function(d) {
			return "translate(" + extent[+/e$/.test(d)][0] + "," + extent[+/^s/.test(d)][1] + ")";
		});
	}

	function redrawX(g) {
		g.select(".extent").attr("x", extent[0][0]);
		g.selectAll(".extent,.n>rect,.s>rect").attr("width", extent[1][0] - extent[0][0]);
	}

	function redrawY(g) {
		g.select(".extent").attr("y", extent[0][1]);
		g.selectAll(".extent,.e>rect,.w>rect").attr("height", extent[1][1] - extent[0][1]);
	}

	function brushstart() {
		var target = this,
			eventTarget = d3.select(d3.event.target),
			event_ = event.of(target, arguments),
			g = d3.select(target),
			resizing = eventTarget.datum(),
			resizingX = !/^(n|s)$/.test(resizing) && x,
			resizingY = !/^(e|w)$/.test(resizing) && y,
			dragging = eventTarget.classed("extent"),
			center,
			origin = mouse(),
			offset;

		var w = d3.select(window)
			.on("mousemove.brush", brushmove)
			.on("mouseup.brush", brushend)
			.on("touchmove.brush", brushmove)
			.on("touchend.brush", brushend)
			.on("keydown.brush", keydown)
			.on("keyup.brush", keyup);

		// If the extent was clicked on, drag rather than brush;
		// store the point between the mouse and extent origin instead.
		if (dragging) {
			origin[0] = extent[0][0] - origin[0];
			origin[1] = extent[0][1] - origin[1];
		}

		// If a resizer was clicked on, record which side is to be resized.
		// Also, set the origin to the opposite side.
		else if (resizing && (resizing === "e" || resizing === "w" || resizing === "s" || resizing === "n"
				|| resizing === "nw" || resizing === "ne" || resizing === "sw" || resizing === "se")) {
			var ex = +/w$/.test(resizing),
				ey = +/^n/.test(resizing);
			offset = [extent[1 - ex][0] - origin[0], extent[1 - ey][1] - origin[1]];
			origin[0] = extent[ex][0];
			origin[1] = extent[ey][1];
		}

		// If the ALT key is down when starting a brush, the center is at the mouse.
		else if (d3.event.altKey) center = origin.slice();

		// Propagate the active cursor to the body for the drag duration.
		g.style("pointer-events", "none").selectAll(".resize").style("display", null);
		d3.select("body").style("cursor", eventTarget.style("cursor"));

		// Notify listeners.
		event_({type: "brushstart"});
		brushmove();
		d3_eventCancel();

		function mouse() {
			var touches = d3.event.changedTouches;
			return touches ? d3.touches(target, touches)[0] : d3.mouse(target);
		}

		function keydown() {
			if (d3.event.keyCode == 32) {
				if (!dragging) {
					center = null;
					origin[0] -= extent[1][0];
					origin[1] -= extent[1][1];
					dragging = 2;
				}
				d3_eventCancel();
			}
		}

		function keyup() {
			if (d3.event.keyCode == 32 && dragging == 2) {
			origin[0] += extent[1][0];
			origin[1] += extent[1][1];
			dragging = 0;
			d3_eventCancel();
			}
		}

		function brushmove() {
			var point = mouse(),
				moved = false;

			// Preserve the offset for thick resizers.
			if (offset) {
				point[0] += offset[0];
				point[1] += offset[1];
			}

			if (!dragging) {

				// If needed, determine the center from the current extent.
				if (d3.event.altKey) {
					if (!center) center = [(extent[0][0] + extent[1][0]) / 2, (extent[0][1] + extent[1][1]) / 2];

					// Update the origin, for when the ALT key is released.
					origin[0] = extent[+(point[0] < center[0])][0];
					origin[1] = extent[+(point[1] < center[1])][1];
				}

				// When the ALT key is released, we clear the center.
				else center = null;
			}

			// Update the brush extent for each dimension.
			if (resizingX && move1(point, x, 0)) {
				redrawX(g);
				moved = true;
			}
			if (resizingY && move1(point, y, 1)) {
				redrawY(g);
				moved = true;
			}

			// Final redraw and notify listeners.
			if (moved) {
				redraw(g);
				event_({type: "brush", mode: dragging ? "move" : "resize"});
			}
		}

		function move1(point, scale, i) {
			var range = dv.util.scaleRangeNoReverse(scale),
				r0 = range[0],
				r1 = range[1],
				position = origin[i],
				size = extent[1][i] - extent[0][i],
				min,
				max;

			// When dragging, reduce the range by the extent size and position.
			if (dragging) {
				r0 -= position;
				r1 -= size + position;
			}

			// Clamp the point so that the extent fits within the range extent.
			min = Math.max(r0, Math.min(r1, point[i]));

			// Compute the new extent bounds.
			if (dragging) {
				max = (min += position) + size;
			} else {

				// If the ALT key is pressed, then preserve the center of the extent.
				if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));

				// Compute the min and max of the position and point.
				if (position < min) {
					max = min;
					min = position;
				} else {
					max = position;
				}
			}

			// Update the stored bounds.
			if (extent[0][i] !== min || extent[1][i] !== max) {
				extentDomain = null;
				extent[0][i] = min;
				extent[1][i] = max;
				return true;
			}
		}

		function brushend() {
			brushmove();

			// reset the cursor styles
			g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
			d3.select("body").style("cursor", null);

			w .on("mousemove.brush", null)
			.on("mouseup.brush", null)
			.on("touchmove.brush", null)
			.on("touchend.brush", null)
			.on("keydown.brush", null)
			.on("keyup.brush", null);

			event_({type: "brushend"});
			d3_eventCancel();
		}
	}

	brush.x = function(z) {
		if (!arguments.length) return x;
		x = z;
		resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
		return brush;
	};

	brush.y = function(z) {
		if (!arguments.length) return y;
		y = z;
		resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
		return brush;
	};

	brush.extent = function(z) {
		var x0, x1, y0, y1, t;

		// Invert the pixel extent to data-space.
		if (!arguments.length) {
			z = extentDomain || extent;
			if (x) {
				x0 = z[0][0], x1 = z[1][0];
				if (!extentDomain) {
					x0 = extent[0][0], x1 = extent[1][0];
					if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
					if (x1 < x0) t = x0, x0 = x1, x1 = t;
				}
			}
			if (y) {
				y0 = z[0][1], y1 = z[1][1];
				if (!extentDomain) {
					y0 = extent[0][1], y1 = extent[1][1];
					if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
					if (y1 < y0) t = y0, y0 = y1, y1 = t;
				}
			}
			return x && y ? [[x0, y0], [x1, y1]] : x ? [x0, x1] : y && [y0, y1];
		}

		// Scale the data-space extent to pixels.
		extentDomain = [[0, 0], [0, 0]];
		if (x) {
			x0 = z[0], x1 = z[1];
			if (y) x0 = x0[0], x1 = x1[0];
			extentDomain[0][0] = x0, extentDomain[1][0] = x1;
			if (x.invert) x0 = x(x0), x1 = x(x1);
			if (x1 < x0) t = x0, x0 = x1, x1 = t;
			extent[0][0] = x0 | 0, extent[1][0] = x1 | 0;
		}
		if (y) {
			y0 = z[0], y1 = z[1];
			if (x) y0 = y0[1], y1 = y1[1];
			extentDomain[0][1] = y0, extentDomain[1][1] = y1;
			if (y.invert) y0 = y(y0), y1 = y(y1);
			if (y1 < y0) t = y0, y0 = y1, y1 = t;
			extent[0][1] = y0 | 0, extent[1][1] = y1 | 0;
		}

		return brush;
	};

	brush.clear = function() {
		extentDomain = null;
		extent[0][0] =
		extent[0][1] =
		extent[1][0] =
		extent[1][1] = 0;
		return brush;
	};

	brush.empty = function() {
		return (x && extent[0][0] === extent[1][0])
			|| (y && extent[0][1] === extent[1][1]);
	};

	return d3.rebind(brush, event, "on");
};

var d3_svg_brushCursor = {
	n: "ns-resize",
	e: "ew-resize",
	s: "ns-resize",
	w: "ew-resize",
	nw: "nwse-resize",
	ne: "nesw-resize",
	se: "nwse-resize",
	sw: "nesw-resize"
};

var d3_svg_brushResizes = [
	["n", "e", "s", "w", "nw", "ne", "se", "sw"],
	["e", "w"],
	["n", "s"],
	[]
];

function d3_dispatch() {}
function d3_dispatch_event(dispatch) {
	function event() {
		var z = listeners, i = -1, n = z.length, l;
		while (++i < n) if (l = z[i].on) l.apply(this, arguments);
		return dispatch;
	}
	var listeners = [], listenerByName = new d3.map();
	event.on = function(name, listener) {
		var l = listenerByName.get(name), i;
		if (arguments.length < 2) return l && l.on;
		if (l) {
			l.on = null;
			listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
			listenerByName.remove(name);
		}
		if (listener) listeners.push(listenerByName.set(name, {
			on: listener
		}));
		return dispatch;
	};
	return event;
}

d3_dispatch.prototype.on = function(type, listener) {
		var i = type.indexOf("."), name = "";
		if (i > 0) {
			name = type.substring(i + 1);
			type = type.substring(0, i);
		}
		return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	};

function d3_eventDispatch(target) {
	var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
	while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	dispatch.of = function(thiz, argumentz) {
		return function(e1) {
			var e0;
			try {
				e0 = e1.sourceEvent = d3.event;
				e1.target = target;
				d3.event = e1;
				dispatch[e1.type].apply(thiz, argumentz);
			} finally {
				d3.event = e0;
			}
		};
	};
	return dispatch;
}

function d3_eventCancel() {
	d3.event.stopPropagation();
	d3.event.preventDefault();
}

dv.behavior.zoom = dv.behavior.extend(function(){

	// Dimensions refer to which positional scales you can adjust.  You can pass in 'x', which will fix the 'y' to the height of the chart
	// (like you might use in a time series chart), or you can pass in 'y', which will fix the 'x' to the width of the chart.  If you
	// choose ['x', 'y'] which is the default, neither scale will be constrained. This is proper for a scatterplot for example.
	function zoom(dimensions) {
		if (arguments.length && !dv.util.isArray(dimensions)) this._dimensions = [this._dimensions];
		this._fluidDimensions = dimensions || ['x', 'y'];
		this._zoom = d3.behavior.zoom();

		this.scaleExtent([0, Infinity]); // scaleExtent default
		this._underGeoms = false;
	}

	zoom.initializeZoom = function(chart) {
		var self = this;
		this._cacheAxes();
		this._zoom
			.on("zoomstart.zoom", function() {
					if (self._zoomStart) self._zoomStart.call(this, "start", d3.event.scale, d3.event.translate, self);
				})
			.on("zoom.zoom", function() {
					if (self._zoomMove) self._zoomMove.call(this, "move", d3.event.scale, d3.event.translate, self);
					self._refresh(d3.event.scale, d3.event.translate);
				})
			.on("zoomend.zoom", function() {
					if (self._zoomEnd) self._zoomEnd.call(this, "end", d3.event.scale, d3.event.translate, self);
				});
	};

	/**
	 * If true, the inspector is drawn underneath the geom.  False otherwise.
	 */
	zoom.underGeoms = function(val) {
		if (!arguments.length) return this._underGeoms;
		this._underGeoms = val;
		return this;
	};

	zoom._cacheAxes = function() {
		this._axisCache = {};
		for (var axis in this._chart._axes._axes) {
			this._axisCache[axis] = this._chart._axes._axes[axis];
		}
	};

	zoom._removeEvents = function() {
		this._zoom.on("zoomstart.zoom", null)
			.on("zoom.zoom", null)
			.on("zoomend.zoom", null);
	};

	zoom._refresh = function(scale, translate) {
		var self = this,
			xBounds = [0, this._bounds.width - this._bounds.width * scale],
			yBounds = [0, this._bounds.height - this._bounds.height * scale];

		if (scale >= 1) {
			translate[0] = Math.min(xBounds[0], Math.max(translate[0], xBounds[1]));
			translate[1] = Math.min(yBounds[0], Math.max(translate[1], yBounds[1]));
		} else {
			translate[0] = (translate[0] < xBounds[0]) ? xBounds[0] : (translate[0] > xBounds[1]) ? xBounds[1] : translate[0];
			translate[1] = (translate[1] < yBounds[0]) ? yBounds[0] : (translate[1] > yBounds[1]) ? yBounds[1] : translate[1];
		}
		this._zoom.translate(translate);

		setTimeout(function() {
			self._chart._axes._axes = self._axisCache;
			self._chart.duration(0);
			self._chart._finalizePlotBounds();
			self._chart._facet._render();
		}, 0);
	};

	zoom._setScales = function() {
		if (this._fluidDimensions.indexOf('x') >= 0) {
			var x = this._chart.getTrainedScale('x');
			this._zoom.x(x._d3Scale);
		}

		if (this._fluidDimensions.indexOf('y') >= 0) {
			var y = this._chart.getTrainedScale('y');
			this._zoom.y(y._d3Scale);
		}
	};

	zoom._render = function(selection) {
		this._zoomContainer = selection.selectAll('.zoom-container').data([0]);
		this._zoomContainer.enter().append('g')
			.classed('zoom-container');

		var zoomPane = this._zoomContainer.selectAll('.zoom-pane').data([0]);
		zoomPane.enter().append('rect')
			.classed('zoom-pane', true);

		var panel = this._chart.facet().getPanel(0),
			panelBounds = panel.bounds();
		zoomPane
			.attr('x', panelBounds.left)
			.attr('y', panelBounds.top)
			.attr('width', panelBounds.width)
			.attr('height', panelBounds.height)
			.call(this._zoom);
		this._bounds = panelBounds;
	};

	zoom.scale = function(scaleFactor) {
		if (!arguments.length) return this._zoom.scale();
		this._zoom.scale(scaleFactor);
		this._refresh(scaleFactor, this._zoom.translate());
		return this;
	};

	zoom.scaleExtent = function(scaleExtent) {
		if (!arguments.length) return this._zoom.scaleExtent();
		this._zoom.scaleExtent(scaleExtent);
		return this;
	};

	zoom.translate = function(translateCoords) {
		if (!arguments.length) return this._zoom.translate();
		this._zoom.translate(translateCoords);
		this._refresh(this._zoom.scale(), translateCoords);
		return this;
	};

	zoom.zoomStart = function(val) {
		if (!arguments.length) return this._zoomStart;
		this._zoomStart = val;
		return this;
	};

	zoom.zoomMove = function(val) {
		if (!arguments.length) return this._zoomMove;
		this._zoomMove = val;
		return this;
	};

	zoom.zoomEnd = function(val) {
		if (!arguments.length) return this._zoomEnd;
		this._zoomEnd = val;
		return this;
	};

	zoom.chart = function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		this.initializeZoom(this._chart);
		if (this._chart) {
			this._setScales();
			this._chart.clipPlot(true);
		}
		return this;
	};

	return zoom;
});
dv.behavior.rollover = dv.behavior.extend(function() {
	function rollover() {
		this._selection = null;
		this._showTooltip = this._defaultShowTooltip;
		this._hideTooltip = this._defaultHideTooltip;
		this._orientation = "right";
		this._tooltipPadding = 10;
		this._content = this._defaultContent;
		this._lastSelectedTarget = null;
		this._timer = null;
		this._pressTimer = null; // The timer which determines if a longPress touch occurs to start inspection
		this._dragInspect = true;
	}

	// Called internally by DV when the behavior is ready for rendering.
	rollover._render = function(selection) {
		this._xGuides = this.__geom._chart._axes._get('x');
		this._yGuides = this.__geom._chart._axes._get('y');
		this._isPolar = (this.__geom.coord() instanceof dv.coord.polar);
		this._selection = selection;
		this._addEvents();
	};

	// Add events to the corresponding geom to handle hover events.
	rollover._addEvents = function() {
		var self = this;
		this.__geom
			.on("mouseover.rollover", function(d, i, j) { return self._onMouseOver.call(this, d, i, j, self); })
			.on("mouseout.rollover", function(d, i, j) { return self._onMouseOut.call(this, d, i, j, self); });
		this.__geom._chart
			// tap is a non-standard event type, it has been shimmed into D3 via src/d3-compat.js
			.on("tap.rollover", function() { return self._onTap.call(self, d3.event); })
			.on("touchstart.rollover", function() { return self._onTouchStart.call(self, d3.event); })
			.on("touchmove.rollover", function() { return self._onTouchMove.call(self, d3.event); })
			.on("touchend.rollover", function() { return self._onTouchEnd.call(self, d3.event); });
	};

	rollover._removeEvents = function() {
		this.__geom
			.on("mouseover.rollover", null)
			.on("mouseout.rollover", null);
		this.__geom._chart
			.on("tap.rollover", null)
			.on("touchstart.rollover", null)
			.on("touchmove.rollover", null)
			.on("touchend.rollover", null);
	};

	rollover._getElementMetadata = function(geom, d3El) {
		var metadata = { d: d3El.datum(), i: 0, j: 0 };
		geom._geomGroup.selectAll('.series .' + geom._dataPointStyleClass).each(function(d, i, j) {
			if (metadata.d === d) {
				metadata.i = i;
				metadata.j = j;
			}
		});
		return metadata;
	};

	// The default functionality for when a tooltip should be shown.  This can be overriden by supplying a function to `showTooltip`.
	rollover._defaultShowTooltip = function(d, i, j, event, self) {
		self._darkenGeom.call(this, d, self);
		self._showTip.call(this, d, i, j, self);
	};

	// The default functionality for when a tooltip should be removed.  This can be overriden by supplying a function to `hideTooltip`
	rollover._defaultHideTooltip = function(d, i, j, event, self) {
		self._brightenGeom.call(this, d, self);
		self._removeTip.call(this, d, i, j, self);
	};

	// Darken the color of the geom to show it's being hovered on.
	rollover._darkenGeom = function(d, self) {
		var singleGeom = d3.select(this),
			fill,
			stroke,
			darken = function(attr, d, geom) {
				if (d[attr]) {
					var color = self.__geom.getScale(attr).mapValue(d[attr]);
					geom.style(attr, d3.rgb(color).darker(1).toString());
				}
			};

		darken("fill", d, singleGeom);
		darken("stroke", d, singleGeom);
	};

	// Restore the geom to its original brighter color.
	rollover._brightenGeom = function(d, self) {
		var singleGeom = d3.select(this),
			fill,
			stroke,
			darken = function(attr, d, geom) {
				if (d[attr]) {
					var color = self.__geom.getScale(attr).mapValue(d[attr]);
					geom.style(attr, color);
				}
			};

		darken("fill", d, singleGeom);
		darken("stroke", d, singleGeom);
	};

	// Show the tooltip on mouseover
	rollover._showTip = function(d, i, j, self) {
		var parent = self.__geom.chart()._chartContainer,
			bounds = this.getBBox(),
			pos = dv.absoluteCoordinates(self.__geom.chart(), [bounds.x, bounds.y], d.panel),
			boundingRect = {
				height: bounds.height,
				width: bounds.width,
				x: pos[0],
				y: pos[1]
			};

		dv.showTooltip(
			boundingRect,
			parent.select(".plot").node().getBBox(),
			self.content().call(self, d, i, j),
			self._orientation,
			self._tooltipPadding,
			parent
		);
	};

	// Remove the tooltip on mouseout.
	rollover._removeTip = function(d, i, j, self) {
		dv.removeTooltip(self.__geom.chart()._chartContainer);
	};

	// The default content used for the tooltip if nothing is specified.
	rollover._defaultContent = function(d, i, j) {
		var seriesGroup = this.__geom.getExplicitScale("group"),
			obj = d[0] ? d[0] : d,
			x = obj.panel.xScale(obj),
			y = obj.panel.yScale(obj),
			xGuide = this._xGuides[x.scaleIndex()],
			yGuide = this._yGuides[y.scaleIndex()],
			xTickFormat = (xGuide.__scale && xGuide.tickFormat() ? xGuide.tickFormat() : String),
			yTickFormat = (yGuide.__scale && yGuide.tickFormat() ? yGuide.tickFormat() : String),
			content = '<span class="metric-value">' + yTickFormat(obj.data[y.mapping()]) + '</span><span class="metric-name">' + y.mapping() + '</span>'
				+ '<span class="metric-value">' + xTickFormat(obj.data[x.mapping()]) + '</span><span class="metric-name">' + x.mapping() + '</span>';

		if (seriesGroup && seriesGroup.mapping()) {
			content = '<span class="series-name">' + obj.data[seriesGroup.mapping()] + "</span>" + content;
		}

		return content;
	};

	// Event Listeners
	// ----------------

	rollover._onMouseOver = function(d, i, j, self) {
		self._showTooltip.call(this, d, i, j, d3.event, self);
		if (this._mouseOver) this._mouseOver.call(this, d, i, j, d3.event);
	};

	rollover._onMouseOut = function(d, i, j, self) {
		self._hideTooltip.call(this, d, i, j, d3.event, self);
		if (self._mouseOut) self._mouseOut.call(this, d, i, j, d3.event);
	};

	rollover._onTap = function(ev) {
		// Turn on drag inspect so we can see a tooltip.
		this._dragInspect = true;
		this._onTouchMove.call(this, ev);
		// Calling touch end will queue the tooltip for removal after a delay.
		this._onTouchEnd.call(this, ev);
	};

	rollover._onTouchStart = function(ev) {
		var self = this;

		if (this._lastSelectedTarget) {
			clearTimeout(self._timer);
			this._onTouchEnd.call(this, ev, 0);
		}

		this._dragInspect = false;
		clearTimeout(this._pressTimer);
		// Enter drag inspection mode after 500ms to avoid eating scroll events.
		this._pressTimer = setTimeout(function() {
			// Able to interact with the chart now...
			self._dragInspect = true;
			self._onTouchMove.call(self, ev);
		}, 500);
		return false;
	};

	rollover._onTouchMove = function(ev) {
		if (!this._dragInspect) {
			clearTimeout(this._pressTimer);
			return;
		}

		var rawEvent = ev.touches ? ev.touches[0] : ev,
			target = d3.select(this._elementFromPoint(rawEvent)),
			sameNodeAsLastTime = this._lastSelectedTarget && this._lastSelectedTarget.node() === target.node();

		if (!target.empty() && target.classed(this.__geom._dataPointStyleClass)) {
			if (this._lastSelectedTarget && !sameNodeAsLastTime) {
				var lastData = this._lastSelectedTarget.datum();
				this._brightenGeom.call(this._lastSelectedTarget.node(), lastData, this);
			}

			if (!sameNodeAsLastTime) {
				var metadata = this._getElementMetadata(this.__geom, target);
				this._showTooltip.call(target.node(), metadata.d, metadata.i, metadata.j, ev, this);
				if (this._mouseOver) {
					this._mouseOver.call(target.node(), metadata.d, metadata.i, metadata.j, ev);
				}
				this._lastSelectedTarget = target;
			}
		}
		dv.cancelEvent(ev);
	};

	rollover._onTouchEnd = function(ev, delay) {
		var self = this;

		clearTimeout(this._pressTimer);
		this._dragInspect = false;

		var rawEvent = ev.touches ? ev.touches[0] : ev;
		if (arguments.length < 2) {
			delay = 500;
		}
		if (this._lastSelectedTarget) {
			var hide = function() {
				if (!self._lastSelectedTarget) return;
				var metadata = self._getElementMetadata(self.__geom, self._lastSelectedTarget);
				self._hideTooltip.call(self._lastSelectedTarget.node(), metadata.d, metadata.i, metadata.j, ev, self);
				if (self._mouseOut) {
					self._mouseOut.call(self._lastSelectedTarget.node(), metadata.d, metadata.i, metadata.j, ev);
				}
				self._lastSelectedTarget = null;
			};
			if (delay) {
				// TODO: Can we do this without a timeout? Maybe tell _hideTooltip what it's delay should be?
				timer = setTimeout(hide, delay);
			} else {
				hide.call(this);
			}
		}
		dv.cancelEvent(ev);
	};

	rollover._elementFromPoint = function(ev) {
		var point = [ev.clientX, ev.clientY];
		if (this._testAndroidChromeBug141840()) {
			point = [ev.screenX, ev.screenY];
		}
		return document.elementFromPoint(point[0], point[1]);
	};

	// Set a content function or a static HTML string
	rollover.content = function(html) {
		if (!arguments.length) return this._content;
		this._content = d3.functor(html);
		return this;
	};

	// The amount of space between the point and the tooltip edge.
	rollover.tooltipPadding = function(val) {
		if (!arguments.length) return this._tooltipPadding;
		this._tooltipPadding = val;
		return this;
	};

	// Where the tooltip should be positioned relative to the point:  top, left, bottom, right
	rollover.orientation = function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	};

	rollover.mouseOver = function(val) {
		if (!arguments.length) return this._mouseOver;
		this._mouseOver = val;
		return this;
	};

	rollover.mouseOut = function(val) {
		if (!arguments.length) return this._mouseOut;
		this._mouseOut = val;
		return this;
	};

	// An overridable function that will be called on hover.  If this is undefined, the default tooltip functionality will be used.
	rollover.showTooltip = function(val) {
		if (!arguments.length) return this._showTooltip;
		this._showTooltip = val;
		return this;
	};

	// An overridable function that will be called on mouseout.  If this is undefined, the default tooltip functionality will be used.
	rollover.hideTooltip = function(val) {
		if (!arguments.length) return this._hideTooltip;
		this._hideTooltip = val;
		return this;
	};

	// The parent geom that selection will be applied to.  This will be set automatically by DV.
	rollover._geom = function(val) {
		if (!arguments.length) return this.__geom;
		if (this.__geom && this.__geom !== val) this._removeEvents();
		this.__geom = val;
		return this;
	};

	return rollover;
});
// The voronoi rollover behavior has been filed for a US patent on 7/17/2013.
// AdobePatentID="3119US01"
dv.behavior.voronoiRollover = dv.behavior.rollover.extend(function() {
	function voronoi() {
		this._super();
		this._voronoiContainer = null;
		this._points = null;
		this._pointDetectionRadius = 20;
		this._numHitAreaVertices = 12;
		this._isPolar = false;
	}

	// Called internally by DV when the behavior is ready for rendering.
	voronoi._render = function(selection) {
		this._xGuides = this.__geom._chart._axes._get('x');
		this._yGuides = this.__geom._chart._axes._get('y');
		this._isPolar = (this.__geom.coord() instanceof dv.coord.polar);
		this._selection = selection;
		this._createTooltipContainer();
		this._renderPolygons(this._getPolygonData(), selection);
		this._addEvents();
	};

	// Add events to the corresponding geom to handle hover events.
	voronoi._addEvents = function() {
		var self = this;
		this.__geom._chart
			// tap is a non-standard event type, it has been shimmed into D3 via src/d3-compat.js
			.on("tap.rollover", function() { return self._onTap.call(self, d3.event); })
			.on("touchstart.rollover", function() { return self._onTouchStart.call(self, d3.event); })
			.on("touchmove.rollover", function() { return self._onTouchMove.call(self, d3.event); })
			.on("touchend.rollover", function() { return self._onTouchEnd.call(self, d3.event); });
	};

	voronoi._removeEvents = function() {
		this.__geom._chart
			.on("tap.rollover", null)
			.on("touchstart.rollover", null)
			.on("touchmove.rollover", null)
			.on("touchend.rollover", null);
	};

	// See if a containing SVG group already exists that we can reuse, otherwise create one.
	voronoi._createTooltipContainer = function() {
		this._voronoiContainer = this._selection.selectAll('.voronoiSelection-container').data([this]);
		this._voronoiContainer.enter()
			.append('g')
				.classed('voronoiSelection-container', true);
	};

	voronoi._getPolygonData = function() {
		var vertices = [],
			data = this.__geom._nestData,
			self = this;

		this._points = [];

		var pathRenderer = self.__geom.coord()._point()
			.x(function(d, i) { return d.x; })
			.y(function(d, i) { return d.y; })
			.defined(function(d, i) { return true; });

		// Create an array of [[x1, y1], [x2, y2], ...] vertices to feed into d3.geom.voronoi.
		// Or can we get away with x and y lookups on the object and throw errors on geoms that don't have both of them as not being supported?
		//
		// TODO: There is currently an open bug in D3 to make accessor functions for x and y in d3.geom.voronoi which could eliminate this double
		// loop. When this is fixed, remove the double loop.  https://github.com/mbostock/d3/issues/558
		dv.util.each(this.__geom._nestData, function(seriesArray, j) {
			dv.util.each(seriesArray.values, function(d, i) {
				var cd = {},
					obj = d[0] ? d[0] : d,
					x = obj.panel.xScale(obj),
					y = obj.panel.yScale(obj);
				cd.x = x.mapValueToPercent(x.mapToProp(obj, i) + x.rangeBand() / 2, i) || 0;
				cd.y = y.mapValueToPercent(y.mapValue(obj.hasOwnProperty('y0') ? (obj.y + obj.y0) : obj.y), i) || 0;
				cd.panel = obj.panel;
				var data = pathRenderer.getBounds(cd, i);

				// If we're in polar space, we've currently got angle and radius info that we need to transform into x and y points. If we're in cartesian,
				// this is already handled for us.
				if (self._isPolar) {
					var xyPoint = self.__geom.coord()._transformAngleRadiusToXY(data.bounds.x, data.bounds.y);
					range.bounds.x = xyPoint[0];
					range.bounds.y = xyPoint[1];
				}

				self._points.push({ data: data, rawData: obj, seriesIndex: j, index: i });
				vertices.push([data.bounds.x, data.bounds.y]);
			});
		});

		return d3.geom.voronoi(vertices);
	};

	voronoi._renderPolygons = function(polygonData, selection) {
		var self = this,
			numSeries = this.__geom._nestData.length,
			numItemsPerSeries = this.__geom._nestData[0].values.length,
			geomParent = d3.select(selection.node().parentNode),
			x = 0,
			y = 0,
			pointInfo;

		// Center the SVG group in the middle of the plot if we're in polar.
		if (this._isPolar) {
			var firstPanel = this.__geom._nestData[0].values[0].panel,
				xRange = dv.util.scaleRangeNoReverse(firstPanel.xOuterScale()),
				yRange = dv.util.scaleRangeNoReverse(firstPanel.yOuterScale());
			x = (xRange[0] + xRange[1]) / 2;
			y = (yRange[0] + yRange[1]) / 2;
		}

		this._voronoiContainer
			.attr("transform", 'translate(' + x + ',' + y + ')');

		// Draw clipped voronoi paths.
		var paths = this._voronoiContainer.selectAll("path")
			.data(polygonData);

		paths.exit().remove();

		paths.enter().append("path")
			.attr("id", function(d, i) { return "path-" + i; })
			.classed("voronoi-overlay", true);

		paths
			.attr("d", function(d, i) { return self._getPolygonPath(d, i, self); })
			.on("mouseover.rollover", function(d, i, j) { return self._onMouseOver.call(this, d.data, i, j, self); })
			.on("mouseout.rollover", function(d, i, j) { return self._onMouseOut.call(this, d.data, i, j, self); })
			.call(this._removeRegisteredEvents, this)
			.call(this._addRegisteredEvents, this);

		paths.exit()
			.on("mouseover.rollover", null)
			.on("mouseout.rollover", null)
			.remove();
	};

	voronoi._addRegisteredEvents = function(paths, self) {
		if (!self) self = this;
		if (!self.__geom) return;

		paths = paths || self._voronoiContainer.selectAll('.voronoi-overlay');
		dv.util.each(self.__geom.eventMap, function(e, type) {
			paths.on(type, function(d, i) {
				self.__geom.eventMap[type].callback.call(this, d, i, d3.event);
			}, e.capture);
		});
		dv.util.each(self.__geom._chart.eventMap, function(e, type) {
			paths.on(type + ".dvchart", function(d, i) {
				var e = d3.event,
					interactionGroup = self.__geom._chart._interactionGroup.node();

				if (self._shouldDispatchChartEvent(e, interactionGroup)) {
					self.__geom._chart.eventMap[type].callback.call(interactionGroup, e);
				}
			}, e.capture);
		});
	};

	voronoi._removeRegisteredEvents = function(paths, self) {
		if (!self) self = this;
		if (!self.__geom) return;

		paths = paths || self._voronoiContainer.selectAll('.voronoi-overlay');
		dv.util.each(self.unregisterEventMap, function(capture, type) {
			paths.on(type, null, capture);
		});
		dv.util.each(self.__geom._chart.unregisterEventMap, function(capture, type) {
			paths.on(type + ".dvchart", null, capture);
		});
	};

	voronoi._shouldDispatchChartEvent = function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out/over events when rolling over voronoi paths contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var rTarg = e.relatedTarget;
			if (!rTarg)
				rTarg = (e.type === "mouseout") ? e.toElement : e.fromElement;

			var relTarget = d3.select(rTarg);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !((relTarget.node() === interactionGroup) || relTarget.classed("voronoi-overlay"));
			}
		}
		return result;
	};

	// Creates a clipping polygon and performs the clip on the voronoi polygon `d`
	voronoi._getPolygonPath = function(d, i, self) {
		// There is an outstanding issue in D3 where voronoi tessellations produce undefined values if they have colinear points.
		// The thought is that D3 will handle this by introducing jitter to colinear points to make them no longer colinear. We
		// used to introduce jitter ourselves manually by multiplying x and y points by 1e-12 + 1, but D3 has recently started
		// rounding to a precision of 6, so that no longer works.  If D3 manages that problem internally it would be ideal.  For
		// now we just won't allow repeated points to be inspectable.
		//
		// see:  https://github.com/mbostock/d3/issues/1503
		if (!d) return null;
		d.data = self._points[i];
		var temp = dv.util.clone(d),
			pointInfo = self._points[i],
			polygon = d3.geom.polygon(self._getPolygonPoints(pointInfo.data.bounds.x, pointInfo.data.bounds.y)),
			vertices = polygon.clip(d);
		return (vertices.length) ? ("M" + vertices.join("L") + "Z") : null;
	};

	// Get the polygon we'll use for clipping a corresponding voronoi polygon.
	voronoi._getPolygonPoints = function(centerX, centerY) {
		var points = [];

		for (var i = 360; i > 0; i -= 360 / this._numHitAreaVertices) {
			var radians = i * Math.PI / 180,
				x = Math.cos(radians) * this._pointDetectionRadius + centerX,
				y = Math.sin(radians) * this._pointDetectionRadius + centerY;
			points.push([x, y]);
		}

		return points;
	};

	// The default functionality for when a tooltip should be shown.  This can be overriden by supplying a function to `showTooltip`.
	voronoi._defaultShowTooltip = function(d, i, j, event, self) {
		self._showPoint.call(this, d, i, j, self);
		self._showTip.call(this, d, i, j, self);
	};

	// The default functionality for when a tooltip should be removed.  This can be overriden by supplying a function to `hideTooltip`
	voronoi._defaultHideTooltip = function(d, i, j, event, self) {
		self._removePoint.call(this, d, i, j, self);
		self._removeTip.call(this, d, i, j, self);
	};

	// Show a point on hover.
	voronoi._showPoint = function(d, i, j, self) {
		var radius = 10,
			pointData = d.rawData,
			elem = self.getGeomFromVoronoiIndex.call(self, pointData, i, j);

		if (!elem.empty()) {
			var bounds = elem.node().getBoundingClientRect(),
				boundingRect = {
					height: bounds.height,
					width: bounds.width,
					x: bounds.x,
					y: bounds.y
				};
			radius = Math.max(boundingRect.height, boundingRect.width) / 2 + 2.5;
		}

		self._voronoiContainer
			.append("circle")
				.classed("hover-point", true)
				.attr("id", "point-" + j + "-" + i)
				.attr("cx", d.data.bounds.x)
				.attr("cy", d.data.bounds.y)
				.attr("r", 0)
				.style("stroke", function() { return self.__geom.getHighlightColor(d.rawData, i); })
				.style("pointer-events", "none")
				.transition()
					.duration(350)
					.attr("r", radius);
	};

	// Remove the point we've added on mouseout.
	voronoi._removePoint = function(d, i, j, self) {
		self._voronoiContainer.selectAll("#point-" + j + "-" + i)
			.transition()
				.duration(350)
				.attr("r", 0)
				.remove();
	};

	// Show the tooltip on mouseover.
	voronoi._showTip = function(d, i, j, self) {
		var parent = self.__geom.chart()._chartContainer,
			boundingRect,
			voronoiData = d.data,
			pointData = d.rawData;

		var elem = self.getGeomFromVoronoiIndex.call(self, pointData, i, j);
		if (elem.empty()) {
			var position = dv.absoluteCoordinates(self.__geom.chart(), [voronoiData.bounds.x, voronoiData.bounds.y], pointData.panel),
				height = 10, width = 10;
			boundingRect = {
				height: height,
				width: width,
				y: position[1] - height / 2,
				x: position[0] - width / 2
			};
		} else {
			var bounds = elem.node().getBBox();

			boundingRect = {
				height: bounds.height,
				width: bounds.width,
				x: bounds.x,
				y: bounds.y
			};
		}

		dv.showTooltip(
			boundingRect,
			parent.select(".panels").node().getBBox(),
			self.content().call(self, pointData, i, j),
			self._orientation,
			self._tooltipPadding,
			parent
		);
	};

	voronoi.getGeomFromVoronoiIndex = function(d, i, j) {
		// Select all data points which match a given datum and series index. Then filter them down further by comparing references
		// on their data object to make sure they are identical refs. We need to filter because other geoms could have the exact same
		// datum and series indices and we need an extra method to distinguish them.
		return this.__geom.chart()._g.selectAll(".datum-" + i + ".series-" + j).filter(function(eData) { return d === eData; });
	};

	// Event Listeners
	// ----------------

	voronoi._onMouseOver = function(d, i, j, self) {
		self._showTooltip.call(this, d, d.index, d.seriesIndex, d3.event, self);
		if (self._mouseOver)
			self._mouseOver.call(this, d.rawData, d.index, d.seriesIndex, d3.event);
	};

	voronoi._onMouseOut = function(d, i, j, self) {
		self._hideTooltip.call(this, d, d.index, d.seriesIndex, d3.event, self);
		if (self._mouseOut)
			self._mouseOut.call(this, d.rawData, d.index, d.seriesIndex, d3.event);

	};

	voronoi._onTouchMove = function(ev) {
		if (!this._dragInspect) {
			clearTimeout(this._pressTimer);
			return;
		}

		var rawEvent = ev.touches ? ev.touches[0] : ev,
			target = d3.select(this._elementFromPoint(rawEvent)),
			sameNodeAsLastTime = this._lastSelectedTarget && this._lastSelectedTarget.node() === target.node();

		if (!target.empty() && target.classed("voronoi-overlay")) {
			if (this._lastSelectedTarget && !sameNodeAsLastTime) {
				var lastData = this._lastSelectedTarget.datum().data;
				this._removePoint.call(target.node(), lastData.rawData, lastData.index, lastData.seriesIndex, this);
			}

			if (!sameNodeAsLastTime) {
				var d = target.datum().data;
				this._showTooltip.call(target.node(), d, d.index, d.seriesIndex, ev, this);
				if (this._mouseOver) {
					this._mouseOver.call(target.node(), d.rawData, d.index, d.seriesIndex, ev);
				}
				this._lastSelectedTarget = target;
			}
		}
		dv.cancelEvent(ev);
	};

	voronoi._onTouchEnd = function(ev, delay) {
		var self = this;

		clearTimeout(this._pressTimer);
		if (this._dragInspect) {
			this._dragInspect = false;
		}

		if (arguments.length < 2) {
			delay = 500;
		}
		if (this._lastSelectedTarget) {
			var hide = function() {
				if (!self._lastSelectedTarget) return;
				var d = self._lastSelectedTarget.datum().data;
				self._hideTooltip.call(self._lastSelectedTarget.node(), d, d.index, d.seriesIndex, ev, self);
				if (self._mouseOut) {
					self._mouseOut.call(self._lastSelectedTarget.node(), d.rawData, d.index, d.seriesIndex, ev);
				}
				self._lastSelectedTarget = null;
			};
			if (delay) {
				// TODO: Can we do this without a timeout? Maybe tell _hideTooltip what it's delay should be?
				timer = setTimeout(hide, delay);
			} else {
				hide.call(this);
			}
		}
		dv.cancelEvent(ev);
	};

	// The radius of the voronoi clipping polygon.
	voronoi.pointDetectionRadius = function(val) {
		if (!arguments.length) return this._pointDetectionRadius;
		this._pointDetectionRadius = val;
		return this;
	};

	// The number of vertices on the voronoi clipping polygon.
	voronoi.numHitAreaVertices = function(val) {
		if (!arguments.length) return this._numHitAreaVertices;
		this._numHitAreaVertices = val;
		return this;
	};

	return voronoi;
});
dv.log = dv.log || {};
dv.log.NOCONSOLE = false;
dv.log.LVL_ERROR = 0; dv.log.ERROR = "error";
dv.log.LVL_WARN = 1; dv.log.WARN = "warn";
dv.log.LVL_DEBUG = 2; dv.log.DEBUG = "debug";
dv.log.LOGLEVEL = dv.log.LVL_DEBUG;

dv.log.error = function(error) { return dv.log._message(dv.log.ERROR, error); };
dv.log.warn = function(error) { return dv.log._message(dv.log.WARN, error); };
dv.log.debug = function(error) { return dv.log._message(dv.log.DEBUG, error); };

// we don't want to simply override the console object and potentially blow away custom console things the user has done
// but we also want to prevent "blowing up" in IE when the console object isn't available
dv.log.noConsole = function(val) {
	dv.log.NOCONSOLE = val || false;
	dv.log.console = window.console || dv.util.noop;
	if (!dv.log.console.log || dv.log.NOCONSOLE) dv.log.console.log = dv.util.noop;
	if (!dv.log.console.error || dv.log.NOCONSOLE) dv.log.console.error = dv.log.console.log;
	if (!dv.log.console.warn || dv.log.NOCONSOLE) dv.log.console.warn = dv.log.console.log;
	if (!dv.log.console.debug || dv.log.NOCONSOLE) dv.log.console.debug = dv.log.console.log;
};

dv.log._message = function(type, error) {
	if (dv.log._isValidType(type)) {
		if (dv.log.LOGLEVEL >= dv.log["LVL_" + type.toUpperCase()]) dv.log.console[type](error.msg, error.data);
		if (type === dv.log.ERROR) throw error.msg + " Context Data: " + JSON.stringify(error.data);
	} else {
		dv.log.console.log("Logging message with invalid type: " + type);
	}
};

dv.log._isValidType = function(type) {
	return type === dv.log.ERROR || type === dv.log.WARN || type === dv.log.DEBUG;
};

dv.log.noConsole(false);
dv.panel = dv.extend(function() {
	function panel() {
		this._margins = { left: 0, top: 0, right: 0, bottom: 0 };
		this._trainedScales = {};
	}

	// Returns a specific trained scale applied to this panel (particularly useful for position aesthetics)
	panel.getTrainedScale = function(prop) {
		if (prop === 'x')
			return this.xScale();

		if (prop === 'y')
			return this.yScale();

		return this._trainedScales[prop];
	};

	panel.getOuterScale = function(prop) {
		if (prop === 'x') return this._xScale;
		if (prop === 'y') return this._yScale;
		return null;
	};

	panel._updateRanges = function(bounds) {
		var xRange = [bounds.left, bounds.right],
			yRange = [bounds.bottom, bounds.top];

		if (this._facet._chart.coord().flip())	{
			this._xScale.range(yRange);
			this._yScale.range(xRange);
		} else {
			this._xScale.range(xRange);
			this._yScale.range(yRange);
		}
	};

	panel.bounds = function(val) {
		if (!arguments.length) return this._bounds;
		this._bounds = val;
		this._updateRanges(this._bounds);
		return this;
	};

	panel.margins = function(val) {
		if (!arguments.length) return this._margins;
		this._margins = val;
		return this;
	};

	/**
	 * An object which keeps track of which axis orientations should show labels.
	 * An example of this would be:
	 * { "top": false, "left": true, "right": false, "bottom": false }
	 * This indicates that axis labels should only be drawn on the left orientation.
	 */
	panel.visibleAxisLabelOrientations = function(val) {
		if (!arguments.length) return this._visibleAxisLabelOrientations;
		this._visibleAxisLabelOrientations = val;
		return this;
	};

	panel.columnIndex = function(val) {
		if (!arguments.length) return this._columnIndex;
		this._columnIndex = val;
		return this;
	};

	panel.rowIndex = function(val) {
		if (!arguments.length) return this._rowIndex;
		this._rowIndex = val;
		return this;
	};

	panel.facetIndex = function(val) {
		if (!arguments.length) return this._facetIndex;
		this._facetIndex = val;
		return this;
	};

	panel.facetKey = function(val) {
		if (!arguments.length) return this._facetKey;
		this._facetKey = val;
		return this;
	};

	panel.xFacetTitle = function(val) {
		if (!arguments.length) return this._xFacetTitle;
		this._xFacetTitle = val;
		return this;
	};

	panel.yFacetTitle = function(val) {
		if (!arguments.length) return this._yFacetTitle;
		this._yFacetTitle = val;
		return this;
	};

	panel.xOuterScale = function(val) {
		if (!arguments.length) return this._xScale;
		this._xScale = val;
		return this;
	};

	panel.yOuterScale = function(val) {
		if (!arguments.length) return this._yScale;
		this._yScale = val;
		return this;
	};

	panel.xScale = function(d) {
		var scaleIndex = 0;
		if (d && d.hasOwnProperty('x-index')) scaleIndex = d['x-index'];
		return this._xScale.innerScaleGroup()[scaleIndex];
	};

	panel.yScale = function(d) {
		var scaleIndex = 0;
		if (d && d.hasOwnProperty('y-index')) scaleIndex = d['y-index'];
		return this._yScale.innerScaleGroup()[scaleIndex];
	};

	panel.facet = function(val) {
		if (!arguments.length) return this._facet;
		this._facet = val;
		this._trainedScales = {};
		return this;
	};

	return panel;
});
dv.facet = dv.extend(function() {
	function facet() {
		this._numColumns = 0;
		this._numRows = 0;
		this._hGap = 10;
		this._vGap = 10;
	}

	facet._prerender = function() {
		var self = this;
		this._trainedScales = {};
		this._panels = [];
		this._rows = [];
		this._columns = [];
		this._panelsWithAxisLabels = [];

		dv.util.each(self._chart._layers, function(geom) {
			geom._prerender(self._chart);
			self._trainFacetGroups(geom);
		});
		this._configureFacets();
		dv.util.each(self._chart._layers, function(geom) {
			geom._nestData = self._nestFacet(geom);
			geom._handlePositions();
			geom._trainScales();
			geom._createDefaultScales();
		});
		this._trainScales();
	};

	facet._trainScales = function() {
		var self = this,
			trainedScale,
			scale,
			host,
			filter,
			facetFreeFilter = function(panel) { return function(facetKey) { return self._getFacetFromFacetKey(facetKey) !== panel.facetKey(); }; },
			fixedAccessor = function(geom) {
				return function(property, scaleIndex, value) {
					if (arguments.length < 2) scaleIndex = 0;
					if (arguments.length < 3) return (this._globalScales[property] === undefined) ? null : this._globalScales[property][scaleIndex];
					if (!this._globalScales[property]) this._globalScales[property] = {};
					this._globalScales[property][scaleIndex] = value;
					return value;
				};
			};

		this._globalScales = {};
		this._positionScales = {};

		dv.util.each(this._panels, function(panel, i) {
			dv.util.each(self._chart._layers, function(geom) {
				for (var property in geom._aes) {
					var aesGroup = geom._aes[property];
					for (var scaleIndex in aesGroup) {
						var geomScale = geom.getScale(property, scaleIndex);
						if (!(geomScale instanceof dv.scale.constant)) {
							if (self._isFree.call(self, property)) {
								trainedScale = self._trainFreeScale(geom, panel, property, scaleIndex, facetFreeFilter(panel));
							} else {
								trainedScale = self._trainScale(geom, fixedAccessor(geom), property, scaleIndex);
							}
							if (!panel._trainedScales[property]) panel._trainedScales[property] = {};
							panel._trainedScales[property][scaleIndex] = trainedScale;
							aesGroup[scaleIndex].unionDomain(trainedScale, trainedScale.reverse());
							aesGroup[scaleIndex].range(trainedScale.range());
						}
					}
				}
			});
		});

		// Once all the scales are trained, make sure the final domains are valid.
		dv.util.each(this._globalScales, function(scaleGroup, prop) {
			dv.util.each(scaleGroup, function(scale, scaleIndex) {
				scale.validateDomain();
			});
		});
	};

	facet._isFree = function(property) {
		var xProp = property === 'x' || property === 'xMin' || property === 'xMax',
			yProp = property === 'y' || property === 'yMin' || property === 'yMax';
		return ((xProp && (this._scales === "free" || this._scales === "free_x")) || (yProp && (this._scales === "free" || this._scales === "free_y")));
	};

	facet._trainScale = function(geom, trainedScalesAccessor, property, scaleIndex, filter) {
		var trainedScale = trainedScalesAccessor.call(this, property, scaleIndex),
			options = {
				stack: geom.position() === "stack" && property === "y",
				fill: geom.position() === "fill" && property === "y",
				filter: filter
			},
			scale;

		if (trainedScale) {
			scale = geom._aes[property][scaleIndex];
			scale.domain(scale.calculateDomain(geom._nestData, options));
			trainedScale.unionDomain(scale, trainedScale.reverse());
			trainedScale.unionRange(scale.range());
		} else {
			geom._aes[property][scaleIndex].trainDomain(geom._nestData, options);
			trainedScale = geom._aes[property][scaleIndex].copy();
			trainedScalesAccessor.call(this, property, scaleIndex, trainedScale);
		}

		return trainedScale;
	};

	facet._render = function() {
		this._axes = this._chart._axes;
		var grid = this._ensureColumnsAndRows();
		this._adjustPlotBounds(grid[0], grid[1]);
		this._configurePanels(grid[0], grid[1]);
		this._axes._initializeAxisRenderers();
		this._axes._measureTitles(this._chart._plotBounds);
		var maxMargins = this._measureMargins(grid[0], grid[1]);
		this._layoutPanels(grid[0], grid[1], maxMargins);
		this._renderAxisTitles();
		this._renderPanels();
	};

	/**
	 * Returns all axis orientations for which labels should be shown for a given panel.
	 */
	facet._setVisibleAxisLabelOrientations = function(panel, lastRowIndex, lastColIndex, numPanels) {
		var rowIndex = panel.rowIndex(),
			colIndex = panel.columnIndex(),
			labelOrientations = {
				"left": colIndex === 0,
				"top": rowIndex === 0,
				"right": (colIndex === lastColIndex) || (panel.facetIndex() === (numPanels - 1)),
				"bottom": (rowIndex === lastRowIndex) || (colIndex > lastColIndex && rowIndex === lastRowIndex - 1)
			};
		panel.visibleAxisLabelOrientations(labelOrientations);
	};

	facet._changeScaleRangeToLocal = function(outerScale) {
		var outerScaleRange = outerScale.range(),
			innerScaleGroup = outerScale.innerScaleGroup();
		for (var scaleIndex in innerScaleGroup) {
			dv.util.scaleRange(innerScaleGroup[scaleIndex], [outerScaleRange[0], outerScaleRange[1]]).applyRangePadding();
		}
		return innerScaleGroup;
	};

	facet._measureMargins = function(cols, rows) {
		var numPanels = this._panels.length,
			lastRowIndex = ~~((numPanels - 1) / cols),
			lastColIndex = (numPanels - 1) % cols,
			axisOrientations = this._axes._getAllOrientations(),
			maxMargins = { rows: [], cols: [] },
			xIsFree = this._isFree('x'),
			yIsFree = this._isFree('y'),
			self = this,
			firstPanel = this._panels[0];

		if (firstPanel) {
			this._changeScaleRangeToLocal(firstPanel.getOuterScale('x'));
			this._changeScaleRangeToLocal(firstPanel.getOuterScale('y'));
		}

		var i = -1;
		while (++i < numPanels) {
			var panel = this._panels[i],
				colIndex = panel.columnIndex(),
				rowIndex = panel.rowIndex();

			this._setVisibleAxisLabelOrientations(panel, lastRowIndex, lastColIndex, numPanels);
			panel.margins({ left: 0, top: 0, right: 0, bottom: 0 });

			if (rowIndex >= maxMargins.rows.length)
				maxMargins.rows[rowIndex] = { left: 0, top: 0, right: 0, bottom: 0 };
			if (colIndex >= maxMargins.cols.length)
				maxMargins.cols[colIndex] = { left: 0, top: 0, right: 0, bottom: 0 };

			this._panelsWithAxisLabels.push(panel);
			this._axes._measure(panel);
			var panelMargins = panel.margins();

			// In these situations we won't take the margins into account when computing the size of each panel
			// because there is an empty cell adjacent to them which will allow axis labels to avoid collisions,
			// so we don't need to account for them in overall axis margin calculation.
			if (axisOrientations["right"] !== undefined && !yIsFree && (i === (numPanels - 1) && colIndex < cols - 1)) panelMargins.right = 0;
			if (axisOrientations["bottom"] !== undefined && !xIsFree && (colIndex >= lastColIndex && rowIndex === lastRowIndex - 1)) panelMargins.bottom = 0;

			// Iterate through cols and rows setting maximums on each.
			for (var dim in maxMargins) {
				var index = dim === "rows" ? rowIndex : colIndex;
				var margins = maxMargins[dim][index];
				margins.left = Math.max(panelMargins.left, margins.left);
				margins.top = Math.max(panelMargins.top, margins.top);
				margins.right = Math.max(panelMargins.right, margins.right);
				margins.bottom = Math.max(panelMargins.bottom, margins.bottom);
			}
		}

		return maxMargins;
	};

	facet._layoutPanels = function(cols, rows, maxMargins) {
		var plotBounds = this._chart._plotBounds,
			availableWidth = (plotBounds.right - plotBounds.left) - (cols - 1) * this._hGap,
			availableHeight = (plotBounds.bottom - plotBounds.top) - (rows - 1) * this._vGap,
			facetWidth,
			facetHeight,
			cursor = { x: 0, y: 0 },
			self = this,
			i,
			n;

		i = -1;
		n = maxMargins.cols.length;
		while (++i < n) {
			availableWidth -= maxMargins.cols[i].left + maxMargins.cols[i].right;
		}

		i = -1;
		n = maxMargins.rows.length;
		while (++i < n) {
			availableHeight -= maxMargins.rows[i].bottom + maxMargins.rows[i].top;
		}

		facetWidth = Math.max(availableWidth / cols, 0);
		facetHeight = Math.max(availableHeight / rows, 0);

		var axesLabelContainer = this._chart._chartContainer.select(".axes-labels");
		var axesPanels = axesLabelContainer.selectAll(".panel-labels")
			.data(this._panelsWithAxisLabels);

		axesPanels.enter()
			.append("div");

		axesPanels.exit()
			.remove();

		axesPanels
			.attr("class", function(d, i) {
				return "panel-labels panel-" + d.facetIndex();
			});

		var panels = this._chart._panelContainer.selectAll(".panel")
			.data(this._panels);

		panels.enter()
			.append("g")
				.classed("panel", true);

		panels.exit()
			.remove();

		panels
			.each(function(d, i) {
				self._drawPanel.call(this, self, d, i, plotBounds, maxMargins, facetWidth, facetHeight, cols, rows, cursor);
				self._axes._render.call(self._axes, d3.select(this), axesLabelContainer.select(".panel-labels.panel-" + d.facetIndex()), d);
			});
	};

	facet._renderAxisTitles = function() {
		var firstColBounds = this.getColumn(0)[0].bounds(),
			firstRowBounds = this.getRow(0)[0].bounds(),
			lastColBounds = this.getColumn(this._columns.length - 1)[0].bounds(),
			lastRowBounds = this.getRow(this._rows.length - 1)[0].bounds(),
			centerColumns = (lastRowBounds.bottom - firstRowBounds.top) / 2 + firstRowBounds.top,
			centerRows = (lastColBounds.right - firstColBounds.left) / 2 + firstColBounds.left,
			plotBounds = this._chart.plotBounds();

		this._axes._renderTitles(plotBounds, {
			"left": [plotBounds.left, centerColumns],
			"right": [plotBounds.right, centerColumns],
			"top": [centerRows, plotBounds.top],
			"bottom": [centerRows, plotBounds.bottom]
		});
	};

	facet._renderPanels = function() {
		var chart = this._chart,
			bounds = chart._plotBounds,
			plotG = chart._g.select('.plot'),
			plotBounds = chart._plotBounds;

		var draw = function(selection) {
			selection.attr('transform', 'translate(0,0)')
				.each(function(geom) {
					if (this.__previousData__ && (this.__previousData__._dataPointStyleClass != geom._dataPointStyleClass)) {
						this.__previousData__.exit(this); // Clear out all elements from the prior geom.
					}
					geom._render(this);

					this.__previousData__ = geom;
				});
		};

		var exit = function(selection) {
			selection.each(function(geom) {
				geom.exit(this, function() {
					selection.remove();
				});
			});
		};

		// TODO: On exit, we should call the geom's render function and then have it perform an exit transition for the paths inside.
		var sel = plotG.selectAll(".geom").data(chart._layers);
		sel.exit().call(exit);
		sel.enter().append("g").classed('geom', true);
		sel.call(draw);
	};

	facet._updatePanelTitle = function(self, label, orientation, left, top, width, height) {
		var titleBounds = { left: 0, top: 0, width: 0, height: 0 },
			el = d3.select(this);

		if (dv.util.isUndefined(label)) {
			self._removePanelTitle.call(this, orientation);
			return titleBounds;
		}

		var title = el.selectAll(".panel-title." + orientation).data([0]);

		var panelTitleEnter = title.enter()
			.append("g")
				.classed("panel-title " + orientation, true)
				.attr("transform", "translate(" + left + "," + top + ")");

		var titleBgEnter = panelTitleEnter
			.append("rect")
				.classed("panel-title-bg", true);

		var titleLabelEnter = panelTitleEnter
			.append("text")
				.classed("panel-title-label", true)
				.attr("text-anchor", "middle");

		if (dv.ANIMATION) {
			title.transition().duration(self._chart._duration).attr("transform", "translate(" + left + "," + top + ")");
		} else {
			title.attr("transform", "translate(" + left + "," + top + ")");
		}

		var titleLabel = title.selectAll(".panel-title-label")
			.text(label);

		var titleBg = title.selectAll(".panel-title-bg");

		var titleBBox = titleLabel.node().getBBox(),
			rotation = 0;

		if (dv.ANIMATION) {
			titleLabel = titleLabel.transition().duration(self._chart._duration);
			titleBg = titleBg.transition().duration(self._chart._duration);
		}

		switch(orientation) {
			case "top" :
				x = width / 2;
				y = titleBBox.height;
				titleBounds.left = 0;
				titleBounds.top = 0;
				titleBounds.width = width;
				titleBounds.height = titleBBox.height + 6;
				break;
			case "right" :
				x = height / 2;
				y = -width + titleBBox.height;
				titleBounds.left = width - (titleBBox.height + 6);
				titleBounds.top = 0;
				titleBounds.width = titleBBox.height + 6;
				titleBounds.height = height;
				rotation = 90;
				break;
			case "bottom" :
				x = width / 2;
				y = height - 6;
				titleBounds.left = 0;
				titleBounds.top = height - (titleBBox.height + 6);
				titleBounds.width = width;
				titleBounds.height = titleBBox.height + 6;
				break;
			case "left" :
				x = -height / 2;
				y = 0 + (titleBBox.height);
				titleBounds.left = 0;
				titleBounds.top = 0;
				titleBounds.width = titleBBox.height + 6;
				titleBounds.height = height;
				rotation = 270;
				break;
		}

		titleBgEnter
			.attr("x", titleBounds.left)
			.attr("y", titleBounds.top)
			.attr("width", titleBounds.width)
			.attr("height", titleBounds.height);

		titleLabelEnter.attr("transform", "rotate(" + rotation + " 0,0)")
			.attr("x", x)
			.attr("y", y);

		titleLabel.attr("transform", "rotate(" + rotation + " 0,0)")
			.attr("x", x)
			.attr("y", y);

		titleBg
			.attr("x", titleBounds.left)
			.attr("y", titleBounds.top)
			.attr("width", titleBounds.width)
			.attr("height", titleBounds.height);

		return titleBounds;
	};

	facet._removePanelTitle = function(orientation) {
		d3.select(this).selectAll(".panel-title." + orientation).remove();
	};

	facet._updatePanelBackground = function(facet, left, top, width, height) {
		var bg = d3.select(this).selectAll(".plot-bg").data([0]);

		bg.enter()
			.append("rect")
				.classed("plot-bg", true)
				.style("opacity", 1e-6)
				.attr('x', left)
				.attr('y', top)
				.attr('width', width)
				.attr('height', height);

		if (dv.ANIMATION) {
			bg = bg.transition()
				.duration(facet._chart._duration);
		}

		bg.attr('x', left)
			.attr('width', width)
			.attr('height', height)
			.style("opacity", 1);
	};

	facet._addToCollection = function(arr, index, panel) {
		if (!arr[index]) {
			arr[index] = [];
		}
		arr[index].push(panel);
	};

	facet.getPanel = function(panelIndex) {
		return this._panels && panelIndex < this._panels.length ? this._panels[panelIndex] : null;
	};

	facet.getRow = function(rowIndex) {
		return this._rows[rowIndex];
	};

	facet.getColumn = function(colIndex) {
		return this._columns[colIndex];
	};

	facet.getTrainedScale = function(prop) {
		if (this._panels.length > 0) {
			return this.getPanel(0).getTrainedScale(prop);
		}
		return this._trainedScales[prop];
	};

	facet.scales = function(val) {
		if (!arguments.length) return this._scales;
		this._scales = val;
		return this;
	};

	facet.space = function(val) {
		if (!arguments.length) return this._space;
		this._space = val;
		return this;
	};

	facet.titleFormat = function(val) {
		if (!arguments.length) return this._titleFormat;
		this._titleFormat = d3.functor(val);
		return this;
	};

	facet.hGap = function(val) {
		if (!arguments.length) return this._hGap;
		this._hGap = val;
		return this;
	};

	facet.vGap = function(val) {
		if (!arguments.length) return this._vGap;
		this._vGap = val;
		return this;
	};

	facet.chart = function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		return this;
	};

	return facet;
});

dv.facet.scale = dv.extend(function() {
	function scale(){}

	scale.domain = function() {
		return this._innerScale.domain();
	};

	scale.range = function(val) {
		if (!arguments.length) return this._range;
		this._range = val;
		return this;
	};

	scale._applyPercentage = function(scaleFunc, args) {
		return this._range[0] + (this._range[1] - this._range[0]) * scaleFunc.apply(this._innerScale, args);
	};

	scale.mapPropToPercent = function(val, i) {
		return this._innerScale.mapPropToPercent(val);
	};

	scale.mapValueToPercent = function(val, i) {
		return this._innerScale.mapValueToPercent(val);
	};

	scale.mapToProp = function(val, i) {
		return this._applyPercentage(this._innerScale.mapPropToPercent, [val, i]);
	};

	scale.mapValue = function(val, i) {
		return this._applyPercentage(this._innerScale.mapValueToPercent, [val, i]);
	};

	scale.rangeBand = function() {
		return this._applyPercentage(this._innerScale.rangeBand);
	};

	scale.innerScaleGroup = function(val) {
		if (!arguments.length) return this._innerScaleGroup;
		this._innerScaleGroup = val;
		return this;
	};

	return scale;
});
dv.facet.wrap = dv.facet.extend(function() {
	function wrap() {
		this._super();

		this._facetScale = null;

		this._preferredAspectRatio = 1;
		this._titleOrientation = "top";
	}

	wrap._prerender = function() {
		this._facetScale = dv.scale.ordinal().mapping(this._group).domain([]);
		this._super();
	};

	wrap._trainFacetGroups = function(geom) {
		var geomFacetTuple = geom.data()[this._facetScale.mapping()];
		if (geomFacetTuple) {
			// domain uniques the values.
			this._facetScale.domain(this._facetScale.domain().concat(geomFacetTuple));
		}
	};

	wrap._trainFreeScale = function(geom, panel, property, scaleIndex, filterFunc) {
		var trainedScalesAccessor = function(property, scaleIndex, value) {
			if (arguments.length < 2) scaleIndex = 0;
			if (arguments.length < 3) {
				if (!panel._trainedScales[property]) return undefined;
				return panel._trainedScales[property][scaleIndex];
			}
			if (!panel._trainedScales[property]) panel._trainedScales[property] = {};
			panel._trainedScales[property][scaleIndex] = value;
			return value;
		};
		return this._trainScale(geom, trainedScalesAccessor, property, scaleIndex, filterFunc);
	};

	/**
	 * If a position scale is free, each facet panel should show labels.
	 */
	wrap._showAllPanelLabelsIfFree = function() {
		return true;
	};

	wrap._configureFacets = function() {
		this._facetKeys = this._facetScale.domain();
		this._facetMap = {};
	};

	wrap._nestFacet = function(geom) {
		// Convert parallel arrays into objects
		var self = this,
			normalizedData = geom.normalizedData(),
			zipData = dv.util.filterAndZip(normalizedData),
			group = geom.getScale('group'),
			facetMapping = this._group,
			facetKeys = this._facetScale.domain(),
			groupProperty,
			groupKeys;

		if (group) {
			groupProperty = group.property();
			groupKeys = groupProperty ? normalizedData[groupProperty] : null;
		}

		var i = -1,
			n = zipData.length;
		while (++i < n) {
			var facetIndex = 0,
				facetTitle,
				data = zipData[i];
			if (data.data.hasOwnProperty(facetMapping)) {
				facetIndex = facetKeys.indexOf(data.data[facetMapping]);
				if (facetIndex >= 0) {
					facetTitle = facetKeys[facetIndex] + "";
				}
			}
			var panel = this._facetMap[facetIndex];
			if (!panel) {
				panel = dv.panel()
					.facetIndex(facetIndex)
					.facetKey(facetTitle)
					.xFacetTitle(facetTitle)
					.facet(this);
				this._facetMap[facetIndex] = panel;
				this._panels.push(panel);
			}
			data.panel = panel;
		}

		// The nest structure should be nested by facet and then group.
		return d3.nest()
			.key(function(d) {
				// facet ~ group
				var id = "";
				id += (d.data.hasOwnProperty(facetMapping) ? d.data[facetMapping] : ".") + " ~ ";
				id += (d.hasOwnProperty(groupProperty) ? d[groupProperty] : ".");
				return id;
			})
			.sortKeys(function(a, b) { // Ensure sort order is maintained.
				var groupA = self._getGroupFromFacetKey(a),
					groupB = self._getGroupFromFacetKey(b),
					aIndex = -1,
					bIndex = -1;

				if (groupA !== ".") {
					aIndex = groupKeys.indexOf(groupA);
					if (aIndex < 0)
						aIndex = groupKeys.indexOf(Number(groupA));
				}

				if (groupB !== ".") {
					bIndex = groupKeys.indexOf(groupB);
					if (bIndex < 0)
						bIndex = groupKeys.indexOf(Number(groupB));
				}

				return bIndex < aIndex ? 1 : -1;
			})
			.entries(zipData);
	};

	wrap._getGroupFromFacetKey = function(facetKey) {
		return (/.* ~ (.*)/g).exec(facetKey)[1];
	};

	wrap._getFacetFromFacetKey = function(facetKey) {
		return (/(.*) ~ .*/g).exec(facetKey)[1];
	};

	wrap._ensureColumnsAndRows = function() {
		var facets = this._panels.length,
			cols = Math.min(this._numColumns, facets),
			rows = Math.min(this._numRows, facets);

		if (cols < 1 && rows < 1) {
			// Let's pick an acceptable default of rows and columns based on the preferred panel aspect ratio.
			// We won't force the aspect ratio, but we'll use it as best we can to inform the cols and rows.
			var plotBounds = this._chart._plotBounds,
				plotWidth = plotBounds.right - plotBounds.left,
				plotHeight = plotBounds.bottom - plotBounds.top,
				columns = Math.min(facets, Math.ceil(Math.sqrt((facets * 1 * plotWidth) / (plotHeight * this._preferredAspectRatio))));

			columns = isNaN(columns) ? 1 : columns;
			return [columns, Math.ceil(facets / columns)];
		}

		if (cols < 1 && rows >= 1) {
			// Figure out num columns
			cols = Math.ceil(facets / rows);
		}

		if (cols >= 1 && rows < 1) {
			// Figure out num rows
			rows = Math.ceil(facets / cols);
		}

		return [cols, rows];
	};

	wrap._adjustPlotBounds = function(cols, rows) {
		return;
	};

	wrap._configurePanels = function(cols, rows) {
		var plotBounds = this._chart._plotBounds,
			plotWidth = plotBounds.right - plotBounds.left,
			plotHeight = plotBounds.bottom - plotBounds.top,
			facetWidth = (plotWidth - ((cols - 1) * this._hGap)) / cols,
			facetHeight = (plotHeight - ((rows - 1) * this._vGap)) / rows;

		var i = -1,
			n = this._panels.length;
		while (++i < n) {
			var panel = this._panels[i],
				xFacetScale = dv.facet.scale().innerScaleGroup(panel._trainedScales.x),
				yFacetScale = dv.facet.scale().innerScaleGroup(panel._trainedScales.y),
				columnIndex = i % cols,
				rowIndex = ~~(i / cols),
				panelBounds = {
					left: 0,
					top: 0,
					right: facetWidth,
					bottom: facetHeight,
					width: facetWidth,
					height: facetHeight
				};

			this._panels[i]
				.xOuterScale(xFacetScale)
				.yOuterScale(yFacetScale)
				.columnIndex(columnIndex)
				.rowIndex(rowIndex)
				.bounds(panelBounds);

			this._addToCollection(this._rows, rowIndex, panel);
			this._addToCollection(this._columns, columnIndex, panel);
		}
	};

	wrap._drawPanel = function(self, d, i, plotBounds, maxMargins, facetWidth, facetHeight, cols, rows, cursor) {
		var colIndex = d.columnIndex(),
			rowIndex = d.rowIndex(),
			maxMarginRow = maxMargins.rows[rowIndex],
			maxMarginCol = maxMargins.cols[colIndex],
			orientation = self._titleOrientation;

		if (colIndex === 0) {
			cursor.x += plotBounds.left;

			if (rowIndex === 0) {
				cursor.y += plotBounds.top;
			}
		}

		var top = cursor.y + maxMarginRow.top,
			left = cursor.x + maxMarginCol.left,
			title = (self._titleFormat ? self._titleFormat.call(this, d.xFacetTitle(), i) : d.xFacetTitle());

		var titleBounds = self._updatePanelTitle.call(this, self, title, orientation, left, top, facetWidth, facetHeight);

		d.bounds({
			width: facetWidth,
			height: facetHeight,
			top: top + (orientation === "top" ? titleBounds.height : 0),
			left: left + (orientation === "left" ? titleBounds.width : 0),
			right: left + facetWidth + (orientation === "right" ? -titleBounds.width : 0),
			bottom: top + facetHeight + (orientation === "bottom" ? -titleBounds.height : 0)
		});

		self._updatePanelBackground.call(this, self, left, top, facetWidth, facetHeight);

		if (colIndex === cols - 1) {
			cursor.x = 0;
			cursor.y += maxMarginRow.top + facetHeight + maxMarginRow.bottom + self._vGap;
		}
		else {
			cursor.x += maxMarginCol.left + facetWidth + maxMarginCol.right + self._hGap;
		}
	};

	wrap.group = function(val) {
		if (!arguments.length) return this._group;
		this._group = val;
		return this;
	};

	wrap.numColumns = function(val) {
		if (!arguments.length) return this._numColumns;
		this._numColumns = val;
		return this;
	};

	wrap.numRows = function(val) {
		if (!arguments.length) return this._numRows;
		this._numRows = val;
		return this;
	};

	wrap.preferredAspectRatio = function(val) {
		if (!arguments.length) return this._preferredAspectRatio;
		this._preferredAspectRatio = val;
		return this;
	};

	return wrap;
});
dv.facet.grid = dv.facet.extend(function() {
	function grid() {
		this._super();

		this._xFacetScale = null;
		this._yFacetScale = null;
	}

	grid._prerender = function() {
		this._xFacetScale = dv.scale.ordinal().mapping(this._xGroup).domain([]);
		this._yFacetScale = dv.scale.ordinal().mapping(this._yGroup).domain([]);
		this._super();
	};

	grid._trainFacetGroups = function(geom) {
		var xGeomFacetTuple = geom.data()[this._xFacetScale.mapping()];
		if (xGeomFacetTuple) {
			// domain uniques the values.
			this._xFacetScale.domain(this._xFacetScale.domain().concat(xGeomFacetTuple));
		}

		var yGeomFacetTuple = geom.data()[this._yFacetScale.mapping()];
		if (yGeomFacetTuple) {
			// domain uniques the values.
			this._yFacetScale.domain(this._yFacetScale.domain().concat(yGeomFacetTuple));
		}
	};

	grid._trainFreeScale = function(geom, panel, property, scaleIndex, filterFunc) {
		var self = this;
		var trainedScalesAccessor = function(property, scaleIndex, value) {
			if (arguments.length < 2) scaleIndex = 0;
			if (!self._positionScales[property]) self._positionScales[property] = {};
			var scaleGroup = self._positionScales[property];
			if (!scaleGroup[scaleIndex]) scaleGroup[scaleIndex] = [];
			var positionScaleArr = scaleGroup[scaleIndex],
				index = (property.indexOf('x') >= 0) ? panel.columnIndex() : panel.rowIndex();

			if (arguments.length < 3) return positionScaleArr[index][scaleIndex];
			positionScaleArr[index][scaleIndex] = value;
			return value;
		};
		return this._trainScale(geom, trainedScalesAccessor, property, filterFunc);
	};

	grid._showAllPanelLabelsIfFree = function() {
		return false;
	};

	grid._configureFacets = function() {
		var xFacetTitle,
			yFacetTitle,
			xFacetKeys = this._xFacetScale.domain(),
			yFacetKeys = this._yFacetScale.domain(),
			facetKey;

		this._numColumns = Math.max(this._xFacetScale.domain().length, 1);
		this._numRows = Math.max(this._yFacetScale.domain().length, 1);

		var i = -1,
			r = this._numRows,
			facetIndex = 0;
		while (++i < r) {
			yFacetIndex = i;
			if (yFacetKeys && yFacetKeys.length > i) {
				yFacetTitle = yFacetKeys[i];
			}
			var j = -1,
				c = this._numColumns;
			while (++j < c) {
				xFacetIndex = j;
				if (xFacetKeys && xFacetKeys.length > j) {
					xFacetTitle = xFacetKeys[j];
				}
				facetKey = (yFacetKeys.length ? yFacetTitle : ".") + " ~ " + (xFacetKeys.length ? xFacetTitle : ".");

				var panel = dv.panel()
					.facetIndex(facetIndex++)
					.facetKey(facetKey)
					.columnIndex(xFacetIndex)
					.rowIndex(yFacetIndex)
					.xFacetTitle(xFacetTitle)
					.yFacetTitle(yFacetTitle)
					.facet(this);

				this._panels.push(panel);
				this._addToCollection(this._rows, yFacetIndex, panel);
				this._addToCollection(this._columns, xFacetIndex, panel);
			}
		}
	};

	grid._nestFacet = function(geom) {
		// Convert parallel arrays into objects
		var self = this,
			normalizedData = geom.normalizedData(),
			zipData = dv.util.filterAndZip(normalizedData),
			group = geom.getScale('group'),
			xFacetKeys = this._xFacetScale.domain(),
			yFacetKeys = this._yFacetScale.domain(),
			groupProperty,
			groupKeys;

		if (group) {
			groupProperty = group.property();
			groupKeys = groupProperty ? normalizedData[groupProperty] : null;
		}

		var i = -1,
			n = zipData.length;
		while (++i < n) {
			var data = zipData[i],
				yFacetIndex = 0,
				xFacetIndex = 0;

			if (data.data.hasOwnProperty(this._xGroup)) {
				xFacetIndex = xFacetKeys.indexOf(data.data[this._xGroup]);
				if (xFacetIndex < 0) xFacetIndex = 0;
			}

			if (data.data.hasOwnProperty(this._yGroup)) {
				yFacetIndex = yFacetKeys.indexOf(data.data[this._yGroup]);
				if (yFacetIndex < 0) yFacetIndex = 0;
			}

			panelIndex = (yFacetIndex * this._numColumns) + xFacetIndex;
			var panel = this._panels[panelIndex];
			data.panel = panel;
		}

		// The nest structure should be nested by facet and then group.
		return d3.nest()
			.key(function(d) {
				// facet ~ group
				var id = "";
				id += (d.data.hasOwnProperty(self._yGroup) ? d.data[self._yGroup] : ".") + " ~ ";
				id += (d.data.hasOwnProperty(self._xGroup) ? d.data[self._xGroup] : ".") + " ~ ";
				id += (d.hasOwnProperty(groupProperty) ? d[groupProperty] : ".");
				return id;
			})
			.sortKeys(function(a, b) { // Ensure sort order is maintained.
				var groupA = self._getGroupFromFacetKey(a),
					groupB = self._getGroupFromFacetKey(b),
					aIndex = -1,
					bIndex = -1;

				if (groupA !== ".") {
					aIndex = groupKeys.indexOf(groupA);
					if (aIndex < 0)
						aIndex = groupKeys.indexOf(Number(groupA));
				}

				if (groupB !== ".") {
					bIndex = groupKeys.indexOf(groupB);
					if (bIndex < 0)
						bIndex = groupKeys.indexOf(Number(groupB));
				}

				return bIndex < aIndex ? 1 : -1;
			})
			.entries(zipData);
	};

	grid._getGroupFromFacetKey = function(facetKey) {
		return (/.* ~ .* ~ (.*)/g).exec(facetKey)[1];
	};

	grid._getFacetFromFacetKey = function(facetKey) {
		return (/(.* ~ .*) ~ .*/g).exec(facetKey)[1];
	};

	grid._ensureColumnsAndRows = function() {
		return [this._numColumns, this._numRows];
	};

	grid._adjustPlotBounds = function(cols, rows) {
		var height = this._measureTitles(this._xFacetScale.domain(), "temp-column-titles", this._chart._g) + 3,
			width = this._measureTitles(this._yFacetScale.domain(), "temp-row-titles", this._chart._g) + 3,
			plotBounds = this._chart._plotBounds;

		this._xTitleHeight = height;
		this._yTitleWidth = width;

		this._chart._plotBounds.top += height;
		this._chart._plotBounds.right -= width;
	};

	grid._measureTitles = function(titleValues, containerSelector, parent) {
		var titles = this._createTitlesContainer(containerSelector, this._chart._g);
		var panelTitle = titles.selectAll(".panel-title").data(titleValues);
		panelTitle.enter()
			.append("text")
				.text(function(d, i) { return d; });

		var titlesBBox = titles.node().getBBox();

		// clean up
		titles.remove();
		return titlesBBox.height;
	};

	grid._createTitlesContainer = function(selector, d3Parent) {
		var titles = d3Parent.selectAll("." + selector).data([0]);
		titles.enter().append("g").classed(selector, true);
		titles.exit().remove();
		return titles;
	};

	grid._configurePanels = function(cols, rows) {
		var plotBounds = this._chart._plotBounds,
			plotWidth = plotBounds.right - plotBounds.left,
			plotHeight = plotBounds.bottom - plotBounds.top,
			facetWidth = (plotWidth - ((cols - 1) * this._hGap)) / cols,
			facetHeight = (plotHeight - ((rows - 1) * this._vGap)) / rows,
			xCursor = 0,
			yCursor = 0,
			colCursor = 0;

		var i = -1,
			n = this._panels.length;
		while (++i < n) {
			var panel = this._panels[i],
				xFacetScale = dv.facet.scale().innerScaleGroup(panel._trainedScales.x),
				yFacetScale = dv.facet.scale().innerScaleGroup(panel._trainedScales.y),
				panelBounds = {
					left: 0,
					top: 0,
					right: 0 + facetWidth,
					bottom: 0 + facetHeight,
					width: facetWidth,
					height: facetHeight
				};

			this._panels[i]
				.xOuterScale(xFacetScale)
				.yOuterScale(yFacetScale)
				.bounds(panelBounds);

			xCursor += facetWidth + this._hGap;
			colCursor++;

			if (colCursor >= cols) {
				xCursor = 0;
				yCursor += facetHeight + this._vGap;
				colCursor = 0;
			}
		}
	};

	grid._drawPanel = function(self, d, i, plotBounds, maxMargins, facetWidth, facetHeight, cols, rows, cursor) {
		var colIndex = d.columnIndex(),
			rowIndex = d.rowIndex(),
			maxMarginRow = maxMargins.rows[rowIndex],
			maxMarginCol = maxMargins.cols[colIndex];

		cursor.x += maxMarginCol.left;

		if (colIndex === 0) {
			cursor.x += plotBounds.left;
		}

		if (rowIndex === 0) {
			var xTitle = (self._titleFormat ? self._titleFormat.call(this, d.xFacetTitle(), i) : d.xFacetTitle());

			cursor.y = maxMarginRow.top + plotBounds.top;
			self._updatePanelTitle.call(this, self, xTitle, "top", cursor.x, cursor.y - self._xTitleHeight, facetWidth, facetHeight);
		}
		else {
			self._removePanelTitle.call(this, "top");
		}

		if (colIndex === self._numColumns - 1) {
			var yTitle = (self._titleFormat ? self._titleFormat.call(this, d.yFacetTitle(), i) : d.yFacetTitle());

			self._updatePanelTitle.call(this, self, yTitle, "right", cursor.x + self._yTitleWidth, cursor.y, facetWidth, facetHeight);
		}
		else {
			self._removePanelTitle.call(this, "right");
		}

		d.bounds({
			width: facetWidth,
			height: facetHeight,
			top: cursor.y,
			left: cursor.x,
			right: cursor.x + facetWidth,
			bottom: cursor.y + facetHeight
		});

		self._updatePanelBackground.call(this, self, cursor.x, cursor.y, facetWidth, facetHeight);

		cursor.x += facetWidth + maxMarginCol.right + self._hGap;
		if (colIndex === self._numColumns - 1) {
			cursor.x = 0;
			cursor.y += maxMarginRow.top + facetHeight + maxMarginRow.bottom + self._vGap;
		}
	};

	grid.xGroup = function(val) {
		if (!arguments.length) return this._xGroup;
		this._xGroup = val;
		return this;
	};

	grid.yGroup = function(val) {
		if (!arguments.length) return this._yGroup;
		this._yGroup = val;
		return this;
	};

	grid.aggregate = function(val) {
		if (!arguments.length) return this._aggregate;
		this._aggregate = val;
		return this;
	};

	return grid;
});
dv.chart = dv.container.extend(function() {
	function chart() {
		this._super();

		this._firstRender = false;

		this._data = {};
		this._coord = dv.coord.cartesian();
		this._facet = dv.facet.wrap().chart(this);
		this._layers = []; // Child layers which create different plots and layer them on top of each other.
		this._behaviors = []; // Interactions
		this._legends = dv.guide.legends();
		this._axes = dv.guide.axes()._chart(this);

		// Animation properties
		this._delay = d3.functor(0);
		this._duration = d3.functor(1000);
		this._ease = "cubic-in-out";

		// SVG containers
		this._parent = null;
		this._chartContainer = null;
		this._svgContainer = null;
		this._g = null;
		this._axisLabelContainer = null;
		this._panelContainer = null;
		this._interactionGroup = null;

		this._prerenderFunc = null;
		this._postrenderFunc = null;

		this._clipPlot = false;

		this._width = NaN;
		this._height = NaN;
		this._plotWidth = NaN;
		this._plotHeight = NaN;
		this._calcWidth = NaN;
		this._calcHeight = NaN;
		this._calcPlotWidth = NaN;
		this._calcPlotHeight = NaN;
		this._defaultPadding = this._padding = this._plotBounds = this._guidesBounds = {"top": 0, "left": 0, "right": 0, "bottom": 0};
		this._position = 'identity';
	}

	chart.render = function() {
		// Throws an error if no data is specified
		if (dv.util.isUndefined(this._data) || dv.util.isEmpty(this._data)) {
			for(var i = 0; i < this._layers.length; i++) {
				if (dv.util.isUndefined(this._layers[i]._data) || dv.util.isEmpty(this._layers[i]._data))
					dv.log.error({msg: "Cannot render a chart with no data provided.", data: { chartData: this._data, geom: this._layers[i] }});
			}
		}

		this._resolvePercentDimensions();
		this._createChartContainer();
		this._prerender();
		this._renderLegends();
		if (this._prerenderFunc) this._prerenderFunc.call(this);
		this._facet._render();
		if (this._postrenderFunc) this._postrenderFunc.call(this);
		this._renderBehaviors();
		this._clipGeoms();
		this._cleanupGuides();

		// Clean up our unregister event map. All chart events should have been elimintated by now.
		this.unregisterEventMap = null;
		return this;
	};

	chart._resolvePercentDimensions = function() {
		// We follow a progression for resolving dimension, 1) chart  2) plot  3) parent
		// Get the actual value from the percentages (if percents were given) for chart width/height
		this._calcWidth = dv.util.getPercentValue(this._width, this._parent.node().offsetWidth);
		this._calcHeight = dv.util.getPercentValue(this._height, this._parent.node().offsetHeight);

		// If width is still undefined we resolve plotWidth percents based on the parent, otherwise we resolve off of chart width
		if (!dv.util.isFinite(this._calcWidth)) {
			this._calcPlotWidth = dv.util.getPercentValue(this._plotWidth, this._parent.node().offsetWidth);
			// If plotWidth is still undefined then we set the chart width to be whatever the parent DOM el width is (last resort)
			if (!dv.util.isFinite(this._calcPlotWidth)) this._calcWidth = this._parent.node().offsetWidth;
		} else {
			this._calcPlotWidth = dv.util.getPercentValue(this._plotWidth, this._calcWidth);
		}

		// If height is still undefined we resolve plotHeight percents based on the parent, otherwise we resolve off of chart height
		if (!dv.util.isFinite(this._calcHeight)) {
			this._calcPlotHeight = dv.util.getPercentValue(this._plotHeight, this._parent.node().offsetHeight);
			// If plotHeight is still undefined then we set the chart height to be whatever the parent DOM el height is (last resort)
			if (!dv.util.isFinite(this._calcPlotHeight)) this._calcHeight = this._parent.node().offsetHeight;
		} else {
			this._calcPlotHeight = dv.util.getPercentValue(this._plotHeight, this._calcHeight);
		}
	};

	chart._finalizePlotBounds = function() {
		var legendAreaRemaining = this._legends._allowedDimensions(),
			lWidth = this._legends._getWidth(),
			lHeight = this._legends._getHeight(),
			b = {
				left: Math.max(legendAreaRemaining.left, this._padding.left),
				top: Math.max(legendAreaRemaining.top, this._padding.top)
			};

		// If chart width is undefined we set it based on the plotWidth + legend width + padding
		// If plot width is undefined we set it based on chartWidth - legend width - padding
		// Because of _resolvePercentDimensions we are certain that at least one of these widths is previously set
		if (!dv.util.isFinite(this._calcWidth)) {
			this._calcWidth = this._calcPlotWidth + lWidth + this._padding.left + this._padding.right;
		} else if (!dv.util.isFinite(this._calcPlotWidth)) {
			this._calcPlotWidth = this._calcWidth - this._padding.left - this._padding.right - lWidth;
		}
		// If chart height is undefined we set it based on the plotHeight + legend height + padding
		// If plot width is undefined we set it based on chartHeight - legend height - padding
		// Because of _resolvePercentDimensions we are certain that at least one of these heights is previously set
		if (!dv.util.isFinite(this._calcHeight)) {
			this._calcHeight = this._calcPlotHeight + lHeight + this._padding.top + this._padding.bottom;
		} else if (!dv.util.isFinite(this._calcPlotHeight)) {
			this._calcPlotHeight = this._calcHeight - this._padding.top - this._padding.bottom - lHeight;
		}

		// Sanity check to ensure that the plotWidth/Height is never greater than the chart width/height
		this._calcPlotWidth = Math.min(this._calcPlotWidth, this._calcWidth - this._padding.left - this._padding.right - lWidth);
		this._calcPlotHeight = Math.min(this._calcPlotHeight, this._calcHeight - this._padding.top - this._padding.bottom - lHeight);

		b.right = b.left + this._calcPlotWidth;
		b.bottom = b.top + this._calcPlotHeight;

		this.plotBounds(b);

		if (this._coord instanceof dv.coord.cartesian) {
			this._plotBounds.right -= this._coord.endX();
			this._plotBounds.left += this._coord.startX();
		}

		this._chartContainer
			.style("width", this._calcWidth + "px")
			.style("height", this._calcHeight + "px");
	};

	chart._prerender = function() {
		this._trainedScales = {}; // Unioned domains and plotting ranges for all properties (accessible by all geoms in the chart)
		this._calculateStats();

		this._facet._prerender();

		var _normalizedData = this._normalizeData(this.data());
		this.data(_normalizedData);

		// By default DV renders both axes
		if(!this._axes._get('x')) this._axes._add('x', dv.guide.axis());
		if(!this._axes._get('y')) this._axes._add('y', dv.guide.axis());
	};

	chart._createChartContainer = function() {
		this._chartContainer = this._parent.selectAll('.dv-chart-container').data([0]);
		this._chartContainer.enter()
			.append("div").classed("dv-chart-container", true);

		this._svgContainer = this._chartContainer.selectAll('svg').data([0]);

		this._svgContainer.enter()
			.append("svg")
			.style("height", "100%")
			.style("width", "100%");

		this._g = this._svgContainer.select('.group');

		// Only create our scaffolding if we don't have a <g class="group" /> element under the root SVG node.
		// Otherwise, we'll use what we already have.
		if (this._g.empty()) {
			this._firstRender = true;

			this._g = this._svgContainer
				.append('g')
					.classed('group', true);

			this._panelContainer = this._g.append('g').classed('panels', true);
			this._interactionGroup = this._g.append('g').classed("interaction-group", true);
			this._g.append('g').classed('behavior-under-geom', true);
			this._g.append('g').classed('plot', true);
			this._g.append('g').classed('behavior', true);
			this._g.append('g').classed('legends', true);

			this._interactionGroup.append('rect').classed('interaction-canvas', true).classed('background', true);
		}

		if (!this._panelContainer) {
			this._panelContainer = this._g.select('.panels');
		}

		if (!this._interactionGroup) {
			this._interactionGroup = this._g.select('.interaction-group');
		}

		this._axisLabelContainer = this._chartContainer.selectAll(".axes-labels").data([0]);
		this._axisLabelContainer.enter().append("div").classed("axes-labels", true);
	};

	chart._addRegisteredEvents = function() {
		var self = this;
		dv.util.each(self.eventMap, function(e, type) {
			self._interactionGroup.on(type, function() { // intercept the event and add our own parameters...
					var e = d3.event,
						interactionGroup = self._interactionGroup.node();
					if (self._shouldDispatchChartEvent(e, interactionGroup)) {
						self.eventMap[type].callback.call(self._interactionGroup.node(), d3.event);
					}
				}, e.capture);
		});

		// Forward this event on to the geoms
		dv.util.each(self._layers, function(geom) {
			geom._addRegisteredEvents();
		});
	};

	chart._removeRegisteredEvents = function() {
		var self = this;
		dv.util.each(self.unregisterEventMap, function(capture, type) {
			if (self._interactionGroup) {
				self._interactionGroup.on(type, null, capture);
			}
		});

		// Forward this event on to the geoms
		dv.util.each(self._layers, function(geom) {
			geom._removeRegisteredEvents();
		});
	};

	chart._shouldDispatchChartEvent = function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out events when rolling over geoms contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var relTarget = d3.select(e.relatedTarget);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !(className && className.indexOf('-geom') >= 0);
			}
		}
		return result;
	};

	chart._calculateStats = function() {
	};

	chart._renderLegends = function() {
		// Calculate the max width and height allowed, we only account for the plot dimensions if they've been specified as real values by the user
		var width = (dv.util.isFinite(this._calcWidth) ? this._calcWidth  - this._padding.left - this._padding.right: this._calcPlotWidth),
			height = (dv.util.isFinite(this._calcHeight) ? this._calcHeight - this._padding.top - this._padding.bottom: this._calcPlotHeight),
			allowedDimensions = {
				left: this._padding.left,
				top: this._padding.top,
				width: width,
				height: height
			},
			chartOpts = {
				el: this._g,
				scales: this._facet._globalScales,
				firstRender: this._firstRender,
				duration: this._duration,
				delay: this._delay,
				ease: this._ease
			};

		this._legends._allowedDimensions(allowedDimensions)._render(chartOpts);
		this._finalizePlotBounds();
	};

	chart._cleanupGuides = function() {
		this._legends._empty();
		this._axes._empty();
	};

	chart._setRanges = function() {
		var bounds = this.plotBounds(),
			yScale = this.getTrainedScale('y'),
			xScale = this.getTrainedScale('x');

		// TODO: Just take a look and see if we can't avoid doing this multiple times
		var xRange = this.coord().flip() ? [bounds.bottom - bounds.top, 0] : [0, bounds.right - bounds.left],
			yRange = this.coord().flip() ? [0, bounds.right - bounds.left] : [bounds.bottom - bounds.top, 0];
		dv.util.scaleRange(xScale, xRange);
		dv.util.scaleRange(yScale, yRange);
	};

	chart.plotBounds = function(val) {
		if (!arguments.length) return this._plotBounds;
		this._plotBounds = val;
		return this;
	};

	chart._renderBehaviors = function() {
		var panel = this._facet.getPanel(0),
			bounds = panel._bounds,
			behaviorContainer = this._g.select('.behavior')
				.attr('transform', 'translate(0,0)'),
			behaviorUnderGeomContainer = this._g.select('.behavior-under-geom')
				.attr('transform', 'translate(0, 0)');

		this._interactionGroup.attr('transform', 'translate(0,0)')
			.select('.interaction-canvas')
				.attr('visibility', 'hidden')
				.attr('width', bounds.right - bounds.left)
				.attr('height', bounds.bottom - bounds.top)
				.attr('x', bounds.left)
				.attr('y', bounds.top);

		var self = this;
		dv.util.each(this._behaviors, function(behavior) {
			if (behavior.underGeoms && behavior.underGeoms()) {
				behavior.chart(self)._render(behaviorUnderGeomContainer);
			} else {
				behavior.chart(self)._render(behaviorContainer);
			}
		});
	};

	chart.guide = function(property, guide, scaleIndex) {
		// check to make sure we have a valid property argument
		if (!property || property === "") throw new Error("Property argument cannot be null or empty");
		if (property === "all") {
			if(guide !== "none") throw new Error("'all' can only be used to set all guides to 'none' (e.g. turn off all guides)");
			this._legends._hide(true);
			this._axes._add('x', "none", 0);
			this._axes._add('y', "none", 0);
		}

		// if property arg isn't already in an array we want to wrap it to make life easier
		property = dv.util.isArray(property) ? property : [property];
		scaleIndex = dv.util.isUndefined(scaleIndex) ? 0 : scaleIndex;

		var baseLegend = dv.guide.legend(),
			type = "";

		// for each property we store a reference to the guide for rendering later
		for(var i = 0; i < property.length; i++) {
			var g = guide,
				isPositional = this._isPositionProperty(property[i]);
			// we check the type of the first property to insure positional and non positional guides aren't mixed (except for custom legends)
			if (!type) type = isPositional ? "axis" : "legend";
			else if (isPositional && type != "axis") throw new Error("Cannot mix positional and non-positional guide types");
			// if no guide was given then we use the defaults
			if (!g) {
				g = isPositional ? dv.guide.axis() : baseLegend;
			} else if (!this._isValidGuideType(property[i], g) && dv.util.isObject(g)) {
				// wrap custom objects as dv.guide.custom
				g = this._buildCustomGuide(g);
			}
			if (this._isValidGuideType(property[i], g)) {
				if (g !== "none") {
					g.scaleIndex(scaleIndex);
				}
				if (isPositional) {
					this._axes._add(property[i], g, scaleIndex);
				}
				else {
					if (g !== "none") {
						this._legends._add({props: property, guide: g});
						// TODO: this breaks the case of trying to handle .guide(["stroke", "x"]), an error should be thrown in this case
						break;
					} else {
						this._legends._remove(property);
					}
				}
			}
		}
		return this;
	};

	chart._isPositionProperty = function(property) {
		return (property === 'x' || property === 'y');
	};

	chart._isValidGuideType = function(property, guide) {
		var isPosProp = this._isPositionProperty(property);
		return guide && (guide === "none" || guide instanceof dv.guide.custom) ||
			(isPosProp && guide instanceof dv.guide.axis) ||
			(!isPosProp && guide instanceof dv.guide.legend);
	};

	chart._buildCustomGuide = function(config) {
		var g = dv.guide.custom();
		for (var funcName in config) {
			g.setFunc(funcName, config[funcName]);
		}
		return g;
	};

	chart.getScale = function(property, scaleIndex) {
		if (arguments.length < 2) scaleIndex = 0;
		if (property === 'group') return this._getGroup();
		if (this._aes.hasOwnProperty(property)) return this._aes[property][scaleIndex];
	};

	chart._getGroup = function() {
		// If a group has been explicitly defined, we're done.
		if (this._aes.hasOwnProperty('group')) return this._aes.group[0];

		// Otherwise, let's look for a categorical aesthetic which can serve as a grouping element.
		var i = -1,
			len = dv.DEFAULT_CATEGORICAL_AES.length - 1;

		while (i++ < len) {
			var catAesGroup = this._aes[dv.DEFAULT_CATEGORICAL_AES[i]];
			// If the scale has a mapping (not a dv.scale.constant scale), we'll use it.
			if (catAesGroup &&
					catAesGroup[0] &&
					catAesGroup[0] instanceof dv.scale.ordinal &&
					!dv.util.isUndefined(catAesGroup[0].mapping())) {
				return catAesGroup[0];
			}
		}
		return null;
	};

	chart._clipGeoms = function() {
		var self = this;

		var clipDefs = this._parent.selectAll(".panel").selectAll("defs").data(function(d) {
			return self._clipPlot ? [d] : [];
		});
		clipDefs.enter().append("defs");
		clipDefs.exit().remove();

		var clippaths = clipDefs.selectAll("clipPath").data(function(d) { return [d]; });
		clippaths.enter().append("clipPath").classed("dv-clip", true);
		clippaths.exit().remove();
		clippaths.attr("id", function(d) { return "dv-clip" + d._facetIndex; });

		var clipRects = clippaths.selectAll("rect").data(function(d) { return [d]; });
		clipRects.enter().append("rect");
		clipRects.exit().remove();
		clipRects
			.attr("x", function(d) {
				return d._bounds.left;
			})
			.attr("y", function(d) { return d._bounds.top; })
			.attr("width", function(d) { return d._bounds.width; })
			.attr("height", function(d) { return d._bounds.height; });

		if (self._clipPlot) {
			var geomSeries = this._parent.selectAll(".series");
			geomSeries.attr("clip-path", function(d) {
				var val = d.values[0],
					panel = dv.util.isArray(val) ? val[0].panel : val.panel;
				return "url(#dv-clip" + panel._facetIndex + ")";
			});
		}
	};

	// GETTERS / SETTERS

	// Returns a specific trained scale based on the required prop ('x', 'y', 'alpha', 'fill', 'stroke', etc)
	chart.getTrainedScale = function(prop) {
		return this._facet.getTrainedScale(prop);
	};

	chart.getExplicitScale = function(property, scaleIndex) {
		if (scaleIndex === undefined) scaleIndex = 0;
		return this._aes[property][scaleIndex];
	};

	chart.parent = function(val) {
		if (!arguments.length) return this._parent ? this._parent.node() : null;
		this._parent = d3.select(val);
		if (this._parent.empty()) throw new Error("The DV parent element was not found.");
		return this;
	};

	chart.layers = function(val) {
		if (!arguments.length) return this._layers;
		this._layers = val;
		return this;
	};

	chart.behaviors = function(val) {
		if (!arguments.length) return this._behaviors;
		this._behaviors = val;
		return this;
	};

	chart.data = function(val) {
		if (!arguments.length) return this._data;
		this._data = val;
		return this;
	};

	chart.coord = function(val) {
		if (!arguments.length) return this._coord;
		this._coord = val;
		return this;
	};

	chart.facet = function(val) {
		if (!arguments.length) return this._facet;
		this._facet = val;
		this._facet.chart(this);
		return this;
	};

	chart.getPlotBounds = function(val) {
		return this._plotBounds;
	};

	chart.plotWidth = function(val) {
		if (!arguments.length) return this._plotWidth;
		this._plotWidth = val;
		return this;
	};

	chart.plotHeight = function(val) {
		if (!arguments.length) return this._plotHeight;
		this._plotHeight = val;
		return this;
	};

	chart.width = function(val) {
		if (!arguments.length) return this._width;
		this._width = val;
		return this;
	};

	chart.height = function(val) {
		if (!arguments.length) return this._height;
		this._height = val;
		return this;
	};

	chart.padding = function(val) {
		if (!arguments.length) return this._padding;
		this._padding = dv.util.merge(this._defaultPadding, val);
		return this;
	};

	chart.prerender = function(val) {
		if (!arguments.length) return this._prerenderFunc;
		this._prerenderFunc = val;
		return this;
	};

	chart.postrender = function(val) {
		if (!arguments.length) return this._postrenderFunc;
		this._postrenderFunc = val;
		return this;
	};

	chart.clipPlot = function(val) {
		if (!arguments.length) return this._clipPlot;
		this._clipPlot = val;
		return this;
	};

	return chart;
});
})();