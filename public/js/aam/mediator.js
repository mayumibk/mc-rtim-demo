/**
 * This object allows us to centralize all communication between widgets
 * 
 * @example
 *  // Subscribe
	Mediator.add('Segment.Views.SearchBar', (function(that) {
		return {
			onClearSearchReceived : function() {
				that.clear;
			}
		}
	}(this)));
	
	// Publish
	Mediator.broadcast("ClearSearchReceived");
 * 
 * @static Mediator object
 * @param {boolean} toDebug Turn debugging on/off
 * @return {Object} The static Mediator object
 */
var Mediator = (function(toDebug) {
	/**
	 * @return null
	 */
    var debug = toDebug ? function(message) {
	        console.log(message);
	    } : function(){ 
	    	// empty
	    },
		components = {},
		active_component = null,
		main_component = null;
    
	var isValidComponent = function(component) {
		if (main_component == null) {
			return true;
		}
		
		if (active_component == null) {
			return true;
		}
		
		return main_component == component || component.match(RegExp("^" + active_component));
	};
	
    var broadcast = function(event, args, source) {
        var e = event || false;
        var a = args || [];
        if (!e) {
            return;
        }
        debug(["Mediator received", e, a].join(' '));
        for (var c in components) {

        	// If component isn't active, forget about it
        	if (!isValidComponent(c)) {
        		debug("Mediator skipping " + c);
        		continue;
        	}
        	
            if (typeof components[c]["on" + e] == "function") {
                var s = source || components[c];
                try {
                    debug("Mediator calling " + e + " on " + c);
                    components[c]["on" + e].call(s, a);
                } catch (err) {
                    debug(["Mediator error.", e, a, s, err].join(' '));
                }
            }
        }
    };
    
    var addComponent = function(name, component, replaceDuplicate) {
    	debug("Mediator adding func: " + JSON.stringify(component) + " to " + name);

        if (name in components) {
            if (replaceDuplicate) {
                removeComponent(name);
            } else {
                throw new Error('Mediator name conflict: ' + name);
            }
        }
        components[name] = component;
    };
    
    var removeComponent = function(name) {
    	debug("Mediator deleting " + name);
    	
        if (name in components) {
            delete components[name];
        }
    };
    
    var getComponent = function(name) {
        return components[name] || false;
    };
    
    var contains = function(name) {
        return (name in components);
    };
    
    /**
     * Allows you to set an active component, meaning if any components does'nt begin with that name
     * they are ignored.
     * 
     * Ex.
     * 	setActiveComponent('App.views.SegmentEdit');
     *
     */
    var setActiveComponent = function(component_name) {
    	active_component = component_name;
		debug("Mediator activating: " + active_component);
    };
    
    /**
     * Used to override the ActiveComponent.  Meaning that this components' subscribers are always executed.
     * 
     * Ex:
     * 	setMainComponent("App")
     *
     * @return
     */
    var setMainComponent = function(component_name) {
    	main_component = component_name;
		debug("Mediator setting main component to: " + main_component);    	
    };
    
    return {
        name      : "Mediator",
        broadcast : broadcast,
        add       : addComponent,
        rem       : removeComponent,
        get       : getComponent,
        has       : contains,
        setMainComponent : setMainComponent,
        setActiveComponent : setActiveComponent
    };
}(false));