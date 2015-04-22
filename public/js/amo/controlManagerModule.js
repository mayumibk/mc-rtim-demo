/**
 * A module that contains components that are shared by all controls.
 *
 * Created by kmonahan on 11/18/14.
 *
 * Some todos:
 * 1) merge all of the handlers and CSS definitions into a single list.
 */

(function() {
    "use strict";
    
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils;

    // Constants for the types of various events and actions we receive.
    var
        // Events we receive from the browser although the code can call "focus".
        FOCUS = "focus",
        KEYSTROKE = "keystroke",
            KEY_DOWN = "keydown",
            KEYPRESS = "keypress",
            KEY_UP = "keyup",
        MOUSE = "mouse",
        MOUSE_OVER = "over",
        MOUSE_OUT = "out",
        MOUSE_DOWN = "down",
        MOUSE_UP = "up",
        //CHANGE = "change",

        // This event occurs once when the control loads. Lets the code do any post-setup that it wants.
        INITIALIZE = "initialize",

        // When the code wants to set a value into the control.
        SET_VALUE = "set",

        // For when the control enters or leaves edit mode: edit mode <--> summary mode.
        EDIT_STATE = "editState",

        // An edit part's value has been updated--a click on a radio button or checkbox or
        // keystroke on a text control, for example.
        EDIT_PART_CHANGED = "partChanged",

        // The "value" watch variable has changed.
        VALUE_CHANGED = "valueChanged",

        // Let the directive or calling code decide how to format the
        // text that is displayed in summary mode.
        FORMAT_SUMMARY = "formatSummary",

        VISIBILITY = "visibility",
        ENABLE = "enable",

        // Internationalization and localization.
        LOCALIZE = "localize";

    var
    // We add this attribute to each edit and summary part in the directive.
        DIRECTIVE_ID_ATTR = "cui-directiveId",
        EDIT_PART_CLASS = "cui-Control-editPart",
        JQ_EDIT_PART_CLASS = '.' + EDIT_PART_CLASS,
        FIRST_EDIT_PART_CLASS = "cui-Control-firstEditPart",
        JQ_FIRST_EDIT_PART_CLASS = '.' + FIRST_EDIT_PART_CLASS,
        SUMMARY_PART_CLASS = "cui-Control-summaryPart",
        JQ_SUMMARY_PART_CLASS = '.' + SUMMARY_PART_CLASS,
        REQUIRES_VALUE_CLASS = "cui-Control-required";

    /**
     * The handlers we pass to jQuery for the browser events we track. These are
     * not called in the scope of our ControlManager object. however, that object
     * can be retrieved from the data that is attached to the event, typically
     * in event.data[0]. event.data[1] is typically information that is relevant
     * to the particular event, such as focus/blur or the mouse action that was detected.
     */
    var EventHandlers =
        (function() {
            // Handlers that we pass to jQuery for various browser events. These are not called
            // in the scope of this object. However "this" can be retrieved from the data that
            // gets attached to event.
            var focusEventHandler =
                    /**
                     * Called as a jQuery event handler when the control's live element
                     * receives focus. We update the CSS and then call the callback function,
                     * if supplied by the directive.
                     * @param event The jQuery event. event.data is [ controlManager, html config ]
                     */
                    function( event ) {
                        var data = event.data;
                        var controlManager = data[0];
                        // Ignore focus events if the directive is not enabled.
                        if (controlManager.isEnabled()) {
                            // Invoke any supplied callbacks, including our own.
                            if (controlManager.getCallbackManager().executeEventCallbacks( FOCUS, event, true)) {
                                return true;
                            } else {
                                event.stopPropagation();
                                return false;
                            }
                        }
                    },
                blurEventHandler =
                    /**
                     * Called as a jQuery event handler when the control's live element
                     * looses focus. We update the CSS and then call the callback function,
                     * if supplied by the directive.
                     * @param event The jQuery event. event.data is [ controlManager, HTML element ]
                     */
                    function( event ) {
                        var data = event.data;
                        var controlManager = data[0];

                        // We ignore blur events from the summary part.
                        var blurElement = $( event.currentTarget );
                        if (! blurElement.hasClass( SUMMARY_PART_CLASS )) {
                            // Invoke any supplied callbacks and then execute our default
                            // code, if the callback(s) returned true.
                            if (controlManager.getCallbackManager().executeEventCallbacks( FOCUS, event, false)) {
                                return true;
                            } else {
                                event.stopPropagation();
                                return false;
                            }
                        } else {
                            return true;
                        }
                    },

                keystrokeEventHandler =
                    (function() {

                        // The character entered in the current sequence of keydown/keypress/keyup
                        // events. We're interested in the character from keypress which represents
                        // the actual character that was entered--for example, 'a' vs 'A'.
                        var latestChar = null;
                        // When a callback returns false we stop the event from propagating. If the
                        // user returns false for keydown then we won't receive a keypress event but
                        // will receive a keyup event. We'll squelch that event if keydown returned false.
                        var keydownResult = null;

                        // The actual keystroke handler, with its private closure vars above.
                        return function( event ) {
                            // Invoke a callback, if provided.
                            var currentTarget = $( event.currentTarget );
/*
                            AMO.log.trace(
                                function() {
                                    return "keystroke handler: type = " + event.type + ", key = " + String.fromCharCode( event.which ) + " (" + event.which + "/" +
                                        ((event.shiftKey ? 'S' : 's') + (event.metaKey ? 'M' : 'm') + (event.ctrlKey ? 'C' : 'c') + (event.altKey ? 'A' : 'a') ) + ")" +
                                        ", val = " + currentTarget.val() + ", latestChar = '" + latestChar + "'" + ", keydownResult = " + keydownResult + ", id = " +
                                        AMO.log.debug( "EventHandler: focus = " + $(event.currentTarget).attr("cui-directiveid") );
                                }
                            );
*/

                            if (event.type === KEY_DOWN) {
                                keydownResult =
                                    event.data[0].getCallbackManager().executeEventCallbacks(
                                        KEYSTROKE, event,
                                        [KEY_DOWN, String.fromCharCode( event.which ), currentTarget.val()]
                                    );
                                if (keydownResult) {
                                    return true;
                                } else {
                                    event.stopPropagation();
                                    return false;
                                }
                            } else if (event.type === KEYPRESS) {
                                latestChar = String.fromCharCode( event.which );
                                return true;
                            } else {
                                // The key up event. Ignore it if keydownResult is false.
                                var tempChar = latestChar;
                                latestChar = null;
                                if (keydownResult) {
                                    keydownResult = null;
                                    if (event.data[0].getCallbackManager().executeEventCallbacks( KEYSTROKE, event, [KEY_UP, tempChar, currentTarget.val()] ) ) {
                                        return true;
                                    } else {
                                        event.stopPropagation();
                                        return false;
                                    }
                                } else {
                                    keydownResult = null;
                                    event.stopPropagation();
                                    return false;
                                }
                            }
                        };
                    }()),

                mouseEventHandler =
                    /**
                     * The wrapper handler we attach to elements.
                     * @param event The jQuery event. event.data contains:
                     *              [
                     *                  <this control manager instance>,
                     *                  <HTML element that received the event,
                     *                  <specific mouse event type, such as MOUSE_UP>
                     *              ]
                     * @returns {boolean}
                     */
                    function( event ) {
                        var data = event.data;
                        var controlManager = data[0];

                        if (controlManager.isEnabled()) {
                            // Invoke any supplied callbacks and then execute our default
                            // code, if the callback(s) returned true.
                            if (controlManager.getCallbackManager().executeEventCallbacks( MOUSE, event, data[2])) {
                                return true;
                            } else {
                                event.stopPropagation();
                                return false;
                            }
                        }
                    };


            return {
                focus: focusEventHandler,
                blur: blurEventHandler,
                keystroke: keystrokeEventHandler,
                mouse: mouseEventHandler
            };
        }());

    /**
     * When the control manager or browser trigger events and actions we'll let the directive
     * and code that wraps the directive see and optionally handle the event or action. This
     * is done via callbacks to functions that the directive or calling code supply in the
     * configuration object.
     */
    var CallbackManager =
        (function() {

            // Methods for managing callbacks to the directive when events or actions happen.

            var addSpecificCallback =
                    /**
                     * Adds the callback for a specific type of event or action, such as "focus"
                     * or "visibility"
                     * @param type The type of callback, such as "focus" or "mouse".
                     * @param callback An array defined as [ callback, data ] or an array of these.
                     *                  [callback, data] can be just callback. data will be set to null.
                     */
                    function( type, callback ) {
                        // callback can be any of these:
                        //      fcn                     // Just a single callback function that didn't provide any callback data (data is defaulted to null)
                        //      [fcn, data]             // A single callback that did provide callback data
                        //      [ [...], [...] ]        // An array or one or more elements like the first two.
                        if (!! callback) {
                            if (Array.isArray( callback )) {
                                // Now distinguish between the second and third options.
                                if (callback.length > 0) {
                                    if (Array.isArray( callback[0] )) {
                                        // An example of the third form.
                                        for (var i = 0; i < callback.length; i++) {
                                            // Distinguish between the first and second form.
                                            var callbackInstance = callback[i];
                                            if (Array.isArray( callbackInstance )) {
                                                // Second form
                                                addOneCallback.call( this, type, [callbackInstance[0], callbackInstance.length > 1 ? callbackInstance[1] : null] );
                                            } else {
                                                // First form.
                                                addOneCallback.call( this, type, [callbackInstance, null]);
                                            }
                                        }
                                    } else {
                                        // The second form.
                                        addOneCallback.call( this, type, [callback[0], callback.length > 1 ? callback[1] : null] );
                                    }
                                }
                            } else {
                                // Not an array so an example of the first form.
                                addOneCallback.call( this, type, [callback, null]);
                            }
                        }
                    },

                addOneCallback =
                    /**
                     * Adds one callback of the indicated type.
                     * @param type
                     * @param callback
                     */
                    function( type, callback) {
                        this.addCallbackHandler( type, callback[0], callback[1] );
                    };

            var callbackManagerConstructor =
                /**
                 * The actual constructor for this class.
                 * @param controlManager
                 */
                function( controlManager ) {

                    // Keep the callbacks here. Each attribute in this map contains one or more
                    // registered callbacks. If no callbacks have been registered for an event or
                    // action then the attribute will not exist.
                    this.callbacks = {};

                    this.controlManager = controlManager;
                };

            // Public methods...
            callbackManagerConstructor.prototype.addCallbackHandler =
                /**
                 * We handle a number of browser events and external requests using built-in functions;
                 * for example, setting the control to "active" when focus is received. We also let the
                 * directive add callbacks. This method is given a callback and adds it to the list of
                 * callbacks for the particular type of action (event, external call, etc.) We do allow
                 * more than one callback to be provided.
                 * @param type Identifies the event or action. Becomes the key in the object that
                 *              stores callbacks.
                 * @param handler A function that will be called. This function's signature is typically
                 *                event, controlManager, data, other relevant info.
                 * @param data Optional data that will be handed back to the callback.
                 */
                function( type, handler, data ) {
                    var typeObject = this.callbacks[type];
                    // The callbacks for each type are kept in an array. Make sure that
                    // array exists.
                    if (! typeObject) {
                        typeObject = this.callbacks[type] = [];
                    }

                    typeObject.push( [handler, data] );
                };

            callbackManagerConstructor.prototype.addCallbacks =
                /**
                 * Adds the callbacks that are supplied in the callbacks map. For example,
                 * { focus: myFocusCallback; } Relying on closure here...
                 * @param callbacks
                 */
                function( callbacks ) {
                    if (!! callbacks) {
                        // Iterate over the callbacks hashmap and insert the
                        // defined callback functions into the appropriate callback list--
                        // focus, editState, etc. Don't insert "controller" or "link".
                        var keys = Object.keys( callbacks),
                            value;
                        for (var key in keys) {
                            if (callbacks.hasOwnProperty( (value = keys[key]) )) {
                                if ((value !== "controller") && (value !== "link")) {
                                    addSpecificCallback.call( this, value, callbacks[value] );
                                }
                            }
                        }
                    }
                };

            callbackManagerConstructor.prototype.executeEventCallbacks =
                /**
                 * When we detect a browser event we'll execute all of the registered callbacks.
                 * An event callback handler has this signature:
                 *      handler( event, options, callback data, controlManager, htmlElement )
                 * where
                 *      event:          The jQuery event object that triggered this callback--focus, keystroke, etc.
                 *      options;        Any additional data that is relevent in the context; for example,
                 *                      the focus/blur state for the focus event (we merge focus and blur when
                 *                      doing callbacks.)
                 *      callbackData:   Optional data that the calling code has supplied. Can be undefined. This is data
                 *                      that was provided when the code registered this callback.
                 *      controlManager  The ControlManager instance that is assigned to this directive.
                 *      htmlElement     A jQuery reference to the HTML element that generated the event.
                 * @param type The event's type (e.g., "focus") or the action that
                 *              was called from the outside (for example, enable).
                 * @param event When relevant, the browser event. Can be null
                 * @param options Information that is relevant to the event
                 *                that will be passed to the callback
                 * @return True if our default handler should be called, false
                 *              otherwise.
                 */
                function( type, event, options ) {
                    // As long as this is true we'll continue executing callbacks.
                    // We return the result of the last callback to be executed.
                    // Typically if we return false then our built-in default
                    // handler will not be executed.
                    var response = true;
                    // See if there are any callbacks for this type.
                    var typeCallbacks = this.callbacks[type];
                    if (!! typeCallbacks) {
                        var index = 0, callback;
                        while (response && (index < typeCallbacks.length)) {
                            callback = typeCallbacks[index++];
                            response = callback[0]( event, options, callback[1], this.controlManager, event.data[1] );
                            // We expect a return value. If we don't get one then we assume true.
                            if (typeof response === "undefined") {
                                response = true;
                            }
                        }
                    }

                    return response;
                };

            callbackManagerConstructor.prototype.executeActionCallbacks =
                /**
                 * When we receive some sort of action request--make visible,
                 * enable, set active/quiet, etc., we'll execute all of the registered callbacks.
                 *
                 * The signature of an action callback is:
                 *      handler( controlManager, callbackData, options )
                 * where
                 *      controlManager: The ControlManager instance assigned to this directive.
                 *      callbackData:   Optional data that the calling code has supplied. Can be undefined.
                 *      options;        Any additional data that is relevent in the context; for example,
                 *                      the value of the scope "value" attribute.
                 *
                 * @param type The action's type (e.g., "focus") or the action that
                 *              was called from the outside (for example, enable).
                 * @param options Info that is relevant to this action.
                 * @return True if our default handler should be called, false
                 *              otherwise.
                 */
                function( type, scope, options ) {
                    // As long as this is true we'll continue executing callbacks.
                    // We return the result of the last callback to be executed.
                    // Typically if we return false then our built-in default
                    // handler will not be executed.
                    var response = true;
                    // See if there are any callbacks for this type.
                    var typeCallbacks = this.callbacks[type];
                    if (!! typeCallbacks) {
                        var index = 0, callback;
                        while (response && (index < typeCallbacks.length)) {
                            callback = typeCallbacks[index++];
                            response = callback[0]( this.controlManager, callback[1], scope, options );
                            // We expect a return value. If we don't get one then we assume true.
                            if (typeof response === "undefined") {
                                response = true;
                            }
                        }
                    }

                    return response;
                };

            callbackManagerConstructor.prototype.executeValidationCallbacks =
                /**
                 * A special callback that will validate the input.
                 *
                 * The signature of a validation callback is:
                 *      validationCallback( controlManager, data, scope, currentElement, value )
                 * where
                 *      controlManager: The ControlManager instance assigned to this directive.
                 *      data:           Optional data that the calling code has supplied. Can be undefined.
                 *      scope:          The directive's scope, generally an isolate scope.
                 *      currentElement: The HTML element that is triggering the validation.
                 *      value:          The current value of the "cuiValue" scope attribute.
                 *      blurred:        True if the element is loosing focus (if false then the input
                 *                      is being validated on a keystroke-by-keystroke basis.)
                 *      validationConfig: The validation config, including method, keystroke (yes/no)
                 *                      and message.
                 * @return If the input validates then return true or null. If the input does not validate
                 *          the return either false or a string. The string becomes the error message (after
                 *          it is localized.)
                 */
                function( scope, currentElement, value, blurred, validationConfig ) {
                    // Validation callbacks are a bit different from action and event callbacks.
                    // The validation can be either a function that is called or a regular expression
                    // that is used on the input. We also look at the blurred parameter and the
                    // keystroke attribute in the config to determine if validation should be done
                    // on a keystroke-by-keystroke basis or just when the element looses focus.

                    // The config attribute--if present--contains one or more validation definitions.
                    // Each definition includes the method (a function or a string/regular expression),
                    // whether the validation is done on a keystroke-by-keystroke basis or just when
                    // the element looses focus and finally a message that is returned when the validation
                    // fails. This message--after localization--is shown to the user.

                    var result = null;
                    if (!! validationConfig) {
                        // The config can be either a single config definition or an array of definitions.
                        if (Array.isArray( validationConfig )) {
                            // Go through each validation config definition, as long as the value validates.
                            for (var i = 0; (result === null) && (i < validationConfig.length); i++) {
                                result = this.executeOneValidation( scope, currentElement, value, blurred, validationConfig[i] );
                            }
                        } else {
                            // A single config.
                            result = this.executeOneValidation( scope, currentElement, value, blurred, validationConfig );
                        }
                    }

                    return result;
                };

            callbackManagerConstructor.prototype.executeOneValidation =
                    function( scope, currentElement, value, blurred, validationConfig ) {
                        var validationResult = null;
                        // Some validations are done only when the element looses focus while
                        // others want to look at each keystroke.
                        if (blurred || validationConfig.keystroke) {
                            if (typeof validationConfig.method === "function") {
                                validationResult = validationConfig.method(this.controlManager, validationConfig, scope, currentElement, value, blurred);
                            } else if (typeof validationConfig.method === "number") {
                                validationResult = !! value && (value.length <= validationConfig.method);
                            } else {
                                // Todo handle regex comparison
                            }
                        }

                        // Convert our result into null for success. Otherwise return the generated value.
                        // This would be either false or a string (that contains a message that describes
                        // why the validation failed.)
                        return ((validationResult === null) || ((typeof validationResult === "boolean") && validationResult)) ? null : validationResult;
                    };

            callbackManagerConstructor.prototype.executeFormatSummaryCallbacks =
                /**
                 * A special callback that will generate the string that gets displayed in
                 * the summary part.
                 *
                 * The signature of a validation callback is:
                 *      validationCallback( controlManager, data, scope, currentElement, value )
                 * where
                 *      controlManager: The ControlManager instance assigned to this directive.
                 *      data:           Optional data that the calling code has supplied. Can be undefined.
                 *      scope:          The directive's scope, generally an isolate scope.
                 * @return The string that should be displayed in the summary part. If for some reason
                 *          the callback doesn't want to do so then return null.
                 */
                    function( scope, valueVariable ) {
                    var summaryText = null;
                    // See if there are any callbacks for this type.
                    var typeCallbacks = this.callbacks[FORMAT_SUMMARY];
                    if (!! typeCallbacks) {
                        var index = 0, callback;
                        while (! summaryText && (index < typeCallbacks.length)) {
                            callback = typeCallbacks[index++];
                            summaryText = callback[0]( this.controlManager, callback[1], scope, this.controlManager.l10n, valueVariable );
                            // We expect a return value. If we don't get one then we assume null.
                            if (typeof summaryText === "undefined") {
                                summaryText = null;
                            }
                        }
                    }

                    return summaryText;
                };

            callbackManagerConstructor.prototype.executeLocalizationCallbacks =
                /**
                 * Used when a value should be localized--text, number, currency, etc. If the
                 * localization handler list contains more than one handler then we invoke
                 * each until the list is exhausted or a non null value is returned. The
                 * default localization handler in this module will just return the value--
                 * hence we'll always return something.
                 *
                 * The signature of a validation callback is:
                 *      validationCallback( controlManager, data, scope, type, value, options )
                 * where
                 *      controlManager: The ControlManager instance assigned to this directive.
                 *      data:           Optional data that the calling code has supplied. Can be undefined.
                 *      scope:          The directive's scope, generally an isolate scope.
                 * For type, value and options see the definition of localizeHandler in this file.
                 * @return The string that should be displayed in the summary part. If for some reason
                 *          the callback doesn't want to do so then return null.
                 */
                function( scope, type, value, options ) {
                    var localizedText = null;
                    // See if there are any callbacks for this type.
                    var typeCallbacks = this.callbacks[FORMAT_SUMMARY];
                    if (!! typeCallbacks) {
                        var index = 0, callback;
                        while (! localizedText && (index < typeCallbacks.length)) {
                            callback = typeCallbacks[index++];
                            localizedText = callback[0]( this.controlManager, callback[1], scope, type, value, options );
                            // We expect a return value. If we don't get one then we assume null.
                            if (typeof localizedText === "undefined") {
                                localizedText = null;
                            }
                        }
                    }

                    return localizedText;
                };

            return callbackManagerConstructor;
        }());

    /**
     * An instance of this class is responsible for the management
     * of a single shared control (i.e., directive.) An instance of
     * this class is returned to the directive when it calls the
     * controlManagerFactory(...) function. The directive can then
     * register custom callbacks, etc.
     */
    var ControlManager =
        /** Just want to create some private members. */
        (function() {
            // Each directive is given a unique identifier (not an id but our own internal identifier.)
            // This identifier is used when part of the control looses focus (blur event). We look at the
            // control that subsequently received focus to see if it is part of the same directive.
            // If not then the current directive enters the "summary" state. If so then we assume that
            // the user is just tabbing (clicking, etc.) from one edit part to the next. We don't interpret
            // the blur event as leaving the control.
            var directiveCount = 0;

            // Private methods. We call these with .call so we can provide a "this"
            // context--hence make them into private instance methods.

            var initializeElements =
                    /**
                     * Called once when the directive registers with us. We attach
                     * various browser event handlers. When these handlers are invoked
                     * they will call back to the directive. We also attach CSS to the
                     * elements
                     * @param scope
                     * @param attrs
                     */
                    function( scope, attrs ) {
                        // The directive gives us a jQuery query string that identifies
                        // the edit or live HTML element in the control--for example,
                        // an <input> element. We'll attach our handlers to it. If the
                        // directive has more than one active/edit element then we'll
                        // get an array of query strings. We also attach CSS to the elements
                        // We do this for both the edit parts and the summary parts.

                        var directiveElement = this.directiveElement;

                        // Start the directive in quiet mode.
                        if (! directiveElement.hasClass( "cui-Control--active" )) {
                            directiveElement.addClass( "cui-Control--quiet" );
                        }

                        // If we wrap third-party controls (including ngCoral controls) we need to
                        // attach our classes to the relevant edit parts. This requires that you
                        // wrap the controls in our "cui-wrapper" element and include an
                        // "cui-wrapped-control" attribute that has selectors to each active item
                        // within the control.
                        var wrappedItemHandler =
                            function( event ) {
                                scope.controlManager.callbackManager.executeActionCallbacks( "partChanged", scope );
                            };
                        directiveElement.find( "cui-wrapper").each(
                            function( index, wrappedItem ) {
                                var $wrappedItem = $( wrappedItem );
                                var wrappedControl = $wrappedItem.attr( "cui-wrapped-control");
                                if (utils.hasContents( wrappedControl )) {
                                    // The attribute can contain more than one query string, separated by commas.
                                    // If the value is empty then we just apply to the element itself
                                    var queryStrings = wrappedControl.split( ',' );
                                    for (var i = 0; i < queryStrings.length; i++) {
                                        $wrappedItem.find( queryStrings[i] )
                                            .on( 'selected', wrappedItemHandler )
                                            .addClass( EDIT_PART_CLASS );
                                    }
                                } else {
                                    $wrappedItem.on( 'selected', wrappedItemHandler )
                                        .addClass( EDIT_PART_CLASS );
                                }
                            }
                        );

                        var directiveId = ++directiveCount;

                        // Helps us identify specific directives in logs and determine when a blur event
                        // follwed by a focus event is for the same directive (e.g., one part to another.)
                        this.directiveId = directiveId;
                        directiveElement.attr( DIRECTIVE_ID_ATTR, directiveId );

                        var parts = directiveElement.find( '.' + EDIT_PART_CLASS );
                        if (parts.length > 0) {
                            parts.attr(DIRECTIVE_ID_ATTR, directiveId);
                            attachBrowserEventHandlersToElement.call(this, parts);
                            attachCssToElement(parts, this.config.css.editHtml);
                        }

                        // Now the summary text. *Very* odd if there is more than one summary element.
                        // Odd edge case if we didn't get any summary parts. May be legit in some case.
                        this.summaryElement = parts = directiveElement.find( '.' + SUMMARY_PART_CLASS );
                        parts.attr( DIRECTIVE_ID_ATTR, directiveId );
                        attachBrowserEventHandlersToElement.call( this, parts );
                        attachBrowserEventHandlersToElement.call(this, directiveElement.not( parts ));
                        attachCssToElement( parts, this.config.css.summaryHtml );

                        // We also attach classes to the directive itself and default to a blurred state.
                        var editStateOnly = this.isEditStateOnly();
                        attachCssToElement( directiveElement, utils.asArray( this.config.css.directive ) );
                        attachCssToElement(directiveElement, this.config.css.editHtml);
                        applyOnOffCss.call( this, this.config.css.focus, false );
                        applyOnOffCss.call( this, this.config.css.active, editStateOnly );

                        // Retrieve the default value that is used in the summary text
                        // and any placeholder values that are used in input tags.
                        getDefaultSummaryText.call( this, scope, attrs );
                        attachPlaceholderTextToEditParts.call( this, scope, attrs );

                        setModelIntoHtml( this );
                    },

                setModelIntoHtml =
                    /**
                     * The model object given to us by the using code has been changed externally.
                     * We'll update all of the HTML with the matching data values in the model object
                     * (cuiValue).
                     * @param controlManager Provided for convenience
                     */
                        function( controlManager ) {
                        // When the value scope attribute changes we see if it is null. If this directive
                        // requires a value then we update the CSS so that a required indicator can show.
                        var scope = controlManager.scope;
                        var hasValue = controlManager.requiresValue && utils.hasContents( scope.cuiValue );
                        applyOnOffCss.call( controlManager, controlManager.config.css.required, hasValue );

                        // The control's HTML can define multiple active/edit elements and each
                        // may need specific data from the "value" object that was given to the scope.
                        // We handle this by looking for all of the edit parts and then seeing if
                        // any have the cuiName attribute. If so, then we get that specific item
                        // from the scope. For example, if scope.cuiValue = { first: "Kevin", last: "Monahan" }
                        // and and the input tags look like:
                        //      <input id="f" ... cui-name="first"/><input id="l" ... cui-name="last"/>
                        // then we'll initialize #f with scope.cuiValue.first and #l with scope.cuiValue.last.
                        var directiveElement = controlManager.getDirectiveElement();
                        directiveElement.find( ".cui-Control-editPart" )
                            .each(
                            function( index, part ) {
                                var $part = $( part),
                                    cuiName = $part.attr( "cui-name" );
                                if (utils.hasContents( cuiName )) {
                                    controlManager.getCallbackManager().executeActionCallbacks(
                                        SET_VALUE, scope, [scope.cuiValue[cuiName], $part]
                                    );
                                } else {
                                    controlManager.getCallbackManager().executeActionCallbacks(
                                        SET_VALUE, scope, [scope.cuiValue, $part]
                                    );
                                }
                            }
                        );

                        // If the change was external (e.g., data for the form was received from
                        // the server) then we may need to update the summary text.
                        if (directiveElement.hasClass( "cui-Control--quiet" )) {
                            controlManager.updateSummary();
                        }
                    },

                getDefaultSummaryText =
                    function( scope, attrs ) {
                        // And see if the caller included default "empty" text in the content part
                        // of the directive HTML. This text is displayed in the summary part when
                        // the value of the control is null or empty. Note that we localize the value.
                        // todo the "defaultSummary" value should be localized.
                        this.defaultSummaryText =
                            this.getCallbackManager().executeLocalizationCallbacks( scope, "text", utils.getNonNullValue( attrs.cuiDefaultSummaryText, "defaultSummary" ), null );
                        // In case the using code didn't localize "defaultSummary" to something.
                        if (this.defaultSummaryText === "defaultSummary") {
                            this.defaultSummaryText = utils.getNonNullValue( this.getPlaceholderText(), "" );
                        }
                    },

                attachPlaceholderTextToEditParts =
                    function( scope, attrs ) {
                        // And get the placeholder text. This can be either a string or an
                        // object. If an object then it will include entries for each named input tag.
                        var placeholderText = this.getPlaceholderText();
                        if (!! placeholderText) {
                            // Get all input tags that include an cui-name attribute. The
                            // value of this attribute is used to get the placeholder text from
                            // the hash. If placeholderText is a simple string then that value
                            // is put into each input tag.
                            var inputTags;
                            if (typeof placeholderText === "object") {
                                var closureThis = this;
                                inputTags = this.directiveElement.find( "input[cui-name]");
                                inputTags.each(
                                        function( index, item ) {
                                            item.attr(
                                                "placeholder",
                                                closureThis.getCallbackManager().executeLocalizationCallbacks( scope, "text", utils.getNonNullValue( item.attr( "cuiName" ), "enterPlaceholder" ), null )
                                            );
                                        }
                                    );
                            } else {
                                inputTags = this.directiveElement.find( "input" );
                                inputTags.attr(
                                    "placeholder",
                                    this.getCallbackManager().executeLocalizationCallbacks( scope, "text", utils.getNonNullValue( placeholderText, "enterPlaceholder" ), null )
                                );
                            }
                        }
                    },

                configureWatchVariables =
                    /**
                     * Configure items like visible, enabled.
                     * We monitor various scope variables that are provided in directory attributes:
                     *      cui-enable
                     *          When this attribute evaluates to true we'll enable the directive.
                     *          We $watch this attribute for changes.
                     *      cui-value
                     *          Where we get and put the value of this control. If the attribute
                     *          starts with an '*' then we'll update the attribute whenever the
                     *          directive's edit part(s) changes. Otherwise we'll only update
                     *          the value when a blur event occurs.
                     *      cui-visible
                     *          When this attribute evaluates to true we'll set the directive's
                     *          HTML to visible. We $watch this attribute for changes.
                     *      cui-presentation
                     *          Lets us change the control's presentation between fullsize, normal
                     *          and minified.
                     * @param scope The current scope variable, from the directive.
                     * @param attrs A map of the directive's attributes.
                     */
                    function( scope, attrs ) {
                        // The scope will contain an cuiEnable attribute if the directive's tag contains
                        // a nested cui-enable attribute. The value of this attribute is the name of the
                        // scope attribute we monitor for our enable status. So, if in the directive's tag
                        // we have:
                        //      <directive-name ... cui-enable="foo" ...>
                        // then scope.cuiEnable will be equal to "foo". We will then monitor scope.foo
                        // to determine when to enable the control; that is, when scope.foo is truthy.
                        var scopeAttribute = scope.cuiEnable;
                        if (typeof scope.cuiEnable !== "undefined") {
                            watchEnableScopeAttribute.call( this, scope );
                        } else {
                            // Enabled by default.
                            this.setEnabled( true );
                        }

                        // We watch the value. We may need to update the directive
                        scopeAttribute = scope.cuiValue;
                        if (typeof scope.cuiValue !== "undefined") {
                            watchValueScopeAttribute.call( this, scope );
                        } else {
                            AMO.log.trace( function() { return "The directive's value attribute, \"" + scopeAttribute + "\" does not exist."; } );
                        }

                        // The directive's visibility
                        if (typeof scope.cuiVisible !== "undefined") {
                            watchVisibilityScopeAttribute.call( this, scope );
                        } else {
                            // Visible by default.
                            this.setVisible( true );
                        }
                    },

                watchVisibilityScopeAttribute =
                    /**
                     * Watch the indicated scope attribute. When it changes invoke the setVisible method.
                     * @param scope
                     */
                    function( scope ) {
                        var closureThis = this;
                        // Don't want to get the initial $watch callback that happens when you start $watching a var.
                        // only want "real" changes.
                        var firstCallDone = false;
                        scope.$watch(
                            "cuiVisible",
                            function() {
                                if (firstCallDone) {
                                    closureThis.setVisible( utils.getTruth(scope.cuiVisible) );
                                } else {
                                    firstCallDone = true;
                                }
                            }
                        );

                        // And check it's current value (its value when the directive is first expanded.)
                        this.setVisible( utils.getTruth( scope.cuiVisible ) );
                    },

                watchEnableScopeAttribute =
                    /**
                     * Watch the indicated scope attribute. When it changes invoke the setEnable method.
                     * @param scope
                     */
                    function( scope ) {
                        var closureThis = this;
                        // Don't want to get the initial $watch callback that happens when you start $watching a var.
                        // only want "real" changes.
                        var firstCallDone = false;
                        scope.$watch(
                            "cuiEnable",
                            function() {
                                if (firstCallDone) {
                                    closureThis.setEnabled( utils.getTruth(scope.cuiEnable) );
                                } else {
                                    firstCallDone = true;
                                }
                            }
                        );

                        // And check it's current value (its value when the directive is first expanded.)
                        this.setEnabled( utils.getTruth( scope.cuiEnable ) );
                    },

                watchValueScopeAttribute =
                    /**
                     * Watch the indicated scope attribute. When it changes we'll invoke the corresponding
                     * directive handler. It will then install the value into the edit part(s).
                     * @param scope
                     * @param attribute
                     */
                    function( scope ) {
                        var localThis = this;
                        // Don't want to get the initial $watch callback that happens when you start $watching a var.
                        // only want "real" changes.
                        var firstCallDone = false;
                        scope.$watch(
                            "cuiValue",
                            function() {
                                if (firstCallDone) {
                                    if (! localThis.updatingModelObject) {
                                        AMO.log.debug( "controlManagerModule.$watch-cuiValue: updatingModelObject is false" );
                                        localThis.setModelIntoHtml( localThis );

                                    } else {
                                        // We've successfully ignored the internal $watch update. Reset the
                                        // flag so that we'll detect possible external updates.
                                        AMO.log.debug( "controlManagerModule.$watch-cuiValue: updatingModelObject is true" );
                                        localThis.updatingModelObject = false;
                                    }
                                } else {
                                    firstCallDone = true;
                                }
                            }
                        );
                    },

                attachBrowserEventHandlersToElement =
                    /**
                     * Given an element we attach all of the useful browser events to it. The first argument
                     * (which becomes event.data when the handler is triggered) always contains the CommandManager
                     * in [0] and the current element in [1].
                     * @param htmlElement a jQuery object that contains the element.
                     */
                    function( htmlElement ) {
                        if (utils.hasContents( htmlElement )) {
                            htmlElement.focus([this, htmlElement], EventHandlers.focus);
                            htmlElement.blur([this, htmlElement], EventHandlers.blur);
                            htmlElement.keydown([this, htmlElement], EventHandlers.keystroke);
                            htmlElement.keypress([this, htmlElement], EventHandlers.keystroke);
                            htmlElement.keyup([this, htmlElement], EventHandlers.keystroke);
                            htmlElement.mouseover([this, htmlElement, MOUSE_OVER], EventHandlers.mouse);
                            htmlElement.mouseout([this, htmlElement, MOUSE_OUT], EventHandlers.mouse);
                            htmlElement.mousedown([this, htmlElement, MOUSE_DOWN], EventHandlers.mouse);
                            htmlElement.mouseup([this, htmlElement, MOUSE_UP], EventHandlers.mouse);
                        }
                    },

                attachPlaceholderTextToElement =
                    /**
                     * Attach an HTML placeholder attribute to each editable part. If
                     * the part already has one we will not remove it. We'll also not
                     * attach one to input items that don't use it, like checkboxes. (todo)
                     * @param editParts A jQuery reference to all of the edit parts in
                     *              the control.
                     */
                    function (editParts) {
                        var placeholderText = this.scope.cuiPlaceholderText;
                        if (utils.hasContents( placeholderText )) {
                            editParts.each(
                                /**
                                 * Handle each part.
                                 */
                                function (index, wrappedItem) {

                                }
                            )
                        }
                    };

            var editPartValueChanged =
                /**
                 * One of the directive's parts has changed. We'll notify the directive that the change has
                 * occurred so that it can update the summary value.
                 * @param a jQuery reference to the element that was changed. This could
                 *              be a mouse click on a radio button or checkbox or a
                 *              keystroke event in a text control.
                 */
                function( changedElement ) {
                    // Update the scope cui-value variable that is associated with this part.
                    AMO.log.debug( "controlManagerModule.editPartValueChanged: cuiValue = " + this.scope.cuiValue + "/" + changedElement.val() );
                    this.updateValueModelObject( changedElement.val(), changedElement.attr("cui-name") );
                    this.callbackManager.executeActionCallbacks( EDIT_PART_CHANGED, this.scope, [changedElement, this.editState] );

                    // We also set the dirty class because the part has changed.
                    changedElement.addClass( "ng-dirty" );
                    this.directiveElement.addClass( "ng-dirty" );
                };

            // Utilities for updating CSS when events occur. These don't have a "this" context.

            var applyOnOffCss =
                /**
                 * A utility that applies CSS that occurs in two forms, such as focus/blur, active/quiet, etc.
                 * @param css The CSS we'll apply, either a single string or an array of two strings. If a single
                 *              string then the value will be applied when on is true and removed when on is false.
                 *              If an array then css[0] is applied when on is true and css[1] is applied when on
                 *              is false. The other string is removed.
                 * @param on True or false. See the description of css.
                 */
                function( css, on ) {
                    if (!!css) {
                        var cssToApply = Array.isArray( css ) ? css : [css, null];
                        var onCss = cssToApply[0],
                            offCss = cssToApply[1];

                        // Convert functions to strings, if necessary. Note that the CSS value can be
                        // either a string or a function.
                        onCss = !!onCss ? (typeof onCss === "function" ? onCss() : onCss) : null;
                        offCss = !!offCss ? (typeof offCss === "function" ? offCss() : offCss) : null;

                        // Now apply the "on" CSS, removing the "off" CSS or apply the "off" CSS,
                        // removing the "on" CSS.
                        if (on) {
                            // Remove the "off" CSS, if supplied.
                            if (utils.hasContents(offCss)) {
                                this.directiveElement.removeClass(offCss);
                            }
                            // And add the "on" class, if supplied.
                            if (utils.hasContents(onCss)) {
                                this.directiveElement.addClass(onCss);
                            }
                        } else {
                            // Remove the "on" CSS, if supplied.
                            if (utils.hasContents(onCss)) {
                                this.directiveElement.removeClass(onCss);
                            }
                            // And add the "off" class, if supplied.
                            if (utils.hasContents(offCss)) {
                                this.directiveElement.addClass(offCss);
                            }
                        }
                    }
                },

                applyMouseCss =
                    /**
                     * We'll automatically apply CSS for the directive.
                     *
                     * @param config The CSS classes for mouse actions.
                     * @param mouseState "over", "out", "down", "up"
                     */
                    function( css, mouseState ) {
                        if (!! css) {
                            var mouseCss = Array.isArray( css ) ? css : [css, null];

                            var mouseOverCss = mouseCss[0],
                                mouseDownCss = mouseCss.length > 1 ? mouseCss[1] : null;
                            // Convert functions to strings, if necessary. Note that the CSS value can be
                            // either a string or a function.
                            mouseOverCss = !! mouseOverCss ? (typeof mouseOverCss === "function" ? mouseOverCss() : mouseOverCss) : null;
                            mouseDownCss = !! mouseDownCss ? (typeof mouseDownCss === "function" ? mouseDownCss() : mouseDownCss) : null;
                            switch (mouseState) {
                                case MOUSE_OVER:
                                    if (utils.hasContents( mouseOverCss )) {
                                        this.directiveElement.addClass(mouseOverCss);
                                    }
                                    break;

                                case MOUSE_OUT:
                                    if (utils.hasContents( mouseOverCss )) {
                                        this.directiveElement.removeClass(mouseOverCss);
                                    }
                                    break;

                                case MOUSE_DOWN:
                                    if (utils.hasContents( mouseDownCss )) {
                                        this.directiveElement.addClass(mouseDownCss);
                                    }
                                    break;

                                case MOUSE_UP:
                                    if (utils.hasContents( mouseDownCss )) {
                                        this.directiveElement.removeClass(mouseDownCss);
                                    }
                                    break;
                            }
                        }
                    },

                attachCssToElement =
                    /**
                     * Attach the provided classes to the element.
                     * @param htmlElement a jQuery object that contains the element.
                     * @param cssClasses An array of CSS class names. We'll add each
                     *                  one to htmlElement
                     */
                    function( htmlElement, cssClasses ) {
                        if (!! cssClasses && (cssClasses.length > 0)) {
                            for (var i = 0; i < cssClasses.length; i++) {
                                htmlElement.addClass( cssClasses[i] );
                            }
                        }
                    };


            // For each browser event, like focus or blur, the code will execute all of the
            // callbacks that are (might be) provided by the directive or the code that uses
            // the directive. Included here are the callbacks that we use locally. These typically
            // alter the CSS.
            var focusHandler =
                    /**
                     * Our internal handler for the focus(blur) event.
                     * @param event The original browser focus event
                     * @param focus True for a focus event, false for a blur event.
                     * @param data Data provided when the handler was registered as a callback.
                     *              in this case we don't use it
                     * @param controlManager The current ControlManager instance
                     * @param element The HTML element that raised the original event. Not used here.
                     */
                    function( event, focus, data, controlManager, element ) {
                        if (focus) {
                            applyOnOffCss.call( controlManager, controlManager.config.css.focus, true );
                            controlManager.enterEditState( $( event.currentTarget ) );
                        } else {
                            // Handle any CSS changes.
                            applyOnOffCss.call(controlManager, controlManager.config.css.focus, false);

                            var blurElement = $( event.currentTarget );

                            // Some controls contain multiple edit parts. When the user tabs (clicks, etc.) from
                            // one to another we don't want to interpret a blur event from one part as suggesting
                            // that the entire control be put into quiet mode. So, we wait to see what control has
                            // received focus. If not one in our directive then we go to quiet mode.
                            setTimeout(
                                function() {
                                    var focusedControl = $(':focus');

                                    // If no other control received focus then we are, by default, leaving
                                    // the current control. Set it to summary state. Note that the current
                                    // instance of the control might be configured to not show a summary version.
                                    if (! controlManager.isEditStateOnly()) {
                                        if (focusedControl.length === 0) {
                                            controlManager.enterSummaryState(blurElement);
                                        } else {
                                            // Another control received focus. See if it has the same directive ID
                                            // as the one that lost focus. If so, we don't change from edit to
                                            // summary state--still editing in the same directive. We also allow
                                            // coral (and other directives) to be embedded in our directive. These
                                            // other directives likely will not have directive ID attributes. So,
                                            // if the focused control is not in our directive ID set we do a second
                                            // check to see if the focused control is at least under our directive
                                            // element.
                                            if (blurElement.attr(DIRECTIVE_ID_ATTR) !== focusedControl.attr(DIRECTIVE_ID_ATTR)) {
                                                // Not the same directive ID. In the same directive, though?
                                                if (controlManager.getDirectiveElement().find( focusedControl).length === 0) {
                                                    controlManager.enterSummaryState(blurElement);
                                                }
                                            }
                                        }
                                    }

                                    //editPartValueChanged.call( controlManager, blurElement );

                                    // Trigger a validation pass because the user moved away from this control.
                                    controlManager.validateInput( blurElement, true );
                                }, 0
                            );
                        }

                        return true;
                    },
                keystrokeHandler =
                    /**
                     * Our internal callback for keystroke events. On key up we assume that the
                     * edit text part has been changed.
                     * @param event The original browser focus event
                     * @param text An array of info about the keystroke:
                     *                  text[0] is the event: KEY_DOWN, KEYPRESS or KEY_UP.
                     *                  text[1] is the character or key that was pressed (depends on the event)
                     *                  text[2] is the text from the control. Most useful on KEY_UP.
                     * @param data Data provided when the handler was registered as a callback.
                     *              in this case we don't use it
                     * @param controlManager The current ControlManager instance
                     * @param element The HTML element that raised the original event. Not used here.
                     */
                    function( event, text, data, controlManager, element ) {
                        if (text[0] === KEY_UP) {
                            setTimeout(
                                function() {
                                    editPartValueChanged.call(controlManager, element);
                                }, 0
                            );

                            // Trigger a validation pass because the user moved away from this control.
                            controlManager.validateInput( element, false );
                        }

                        return true;
                    },
                mouseHandler =
                    /**
                     * Our internal callback for mouse events. We mostly just apply different CSS
                     * for the mouse events--mouse over, mouse out, etc.--but will put the part into
                     * the edit state if we get a mouseup event in a summary part.
                     * @param event The original browser focus event
                     * @param focus True for a focus event, false for a blur event.
                     * @param data Data provided when the handler was registered as a callback.
                     *              in this case we don't use it
                     * @param controlManager The current ControlManager instance
                     * @param element The HTML element that raised the original event. Not used here.
                     */
                    function( event, mouseAction, data, controlManager, element ) {
                        // Handle any CSS changes.
                        applyMouseCss.call( controlManager, controlManager.config.css.mouse, mouseAction );

                        // If this is a summary part then use this click to move the directive to the active state.
                        if (event.data[2] === MOUSE_UP) {
                            var currentTarget = $( event.currentTarget );
                            if (currentTarget.hasClass( SUMMARY_PART_CLASS )) {
                                controlManager.enterEditState( currentTarget );
                            }
                        }

                        return true;
                    };

            // Handlers for actions that we generate, often a result of a browser event but also when
            // we've detected a change in an angular scope attribute or some outside code has called
            // one of our set... methods.
            var editStateHandler =
                    function( controlManager, data, scope, options ) {
                        applyOnOffCss.call( controlManager, controlManager.config.css.active, options[0] );
                        return true;
                    },
                visibilityHandler =
                    function( controlManager, data, scope, visibility ) {
                        // Handle any CSS changes.
                        applyOnOffCss.call( controlManager, controlManager.config.css.visibility, visibility );
                    },
                enabledHandler =
                    function( controlManager, data, scope, enabled ) {
                        // Handle any CSS changes.
                        applyOnOffCss.call( controlManager, controlManager.config.css.enable, enabled );

                        // We also enable/disable all of the active elements within the directive.
                        var directive = controlManager.getDirectiveElement();
                        directive.find( JQ_EDIT_PART_CLASS).prop( "disabled", ! enabled );
                        directive.find( JQ_SUMMARY_PART_CLASS ).prop( "disabled", ! enabled );

                    },
                setCallback =
                    /**
                     * The control has detected a change in the model object and is updating
                     * the HTML controls from the model. This is specifically an external change,
                     * probably made by the user of the control.
                     * @param options [scope.cuiValue, jQuery ref to part being set]
                     */
                    function( controlManager, callbackData, scope, options ) {
                        options[1].val( options[0] );
                    },
                formatSummaryHandler =
                    /**
                     * Generate the default summary value which is just the value attribute's
                     * value. We also attach a (Required) message, if this is a required field.
                     * @param controlManager
                     * @param data
                     * @param scope
                     */
                    function( controlManager, data, scope, type, valueVariable, options ) {
                        if (utils.hasContents( valueVariable )) {
                            return valueVariable;
                        } else if (controlManager.required) {
                            return controlManager.defaultSummaryText + " " + controlManager.requiredText;
                        } else {
                            return utils.getNonNullValue( controlManager.defaultSummaryText, controlManager.placeholderText );
                        }
                    },

                localizeHandler =
                    /**
                     * Internationalization and localization is performed by the code that uses
                     * the control, not the control itself. The goal is to allow using code to 
                     * implement any I18N or L10N services that it wants. Our default behavior
                     * is to simply return the value--no changes or localization, etc.
                     * @param controlManager
                     * @param data
                     * @param scope
                     * @param type We support different localization services--text, numbers, 
                     *              currency, date, etc. This value specifies the type of
                     *              localization to perform. The options are "text", "number",
                     *              "currency", "date", "time", "dt" (date/time) and "phrase". 
                     *              The latter allows multiple localizations to be performed 
                     *              on different parts of a longer string.
                     * @param value The content that should be localized. Often a key into a 
                     *              localization dictionary but may also be actual text that
                     *              has no localized option.
                     * @param options An optional value (or array of values) that is used by the particular
                     *              localization type:
                     *              text: [<isPlural>, <isCapitalized>, <default> ]
                     *              number: number of digits after the decimal.
                     *              currency: number of digits after the decimal.
                     *              date: how the date is formatted using numbers or strings
                     *                      and the general length of the formatted result:
                     *                      "tiny", "short", "medium", "long", "full".
                     *              time: The number of digits to use for hours and minutes
                     *                      plus whether seconds or milliseconds are included:
                     *                      "short", "medium", "long", "seconds", "ms",
                     *                      "military", "24"
                     *              dt: For the supplied Date instance shows both the date and
                     *                      time: [<date option>, <time option>]
                     * @return This is the default--essentially noop--localization handler. All we
                     *          do is return the source value.
                     */
                    function( controlManager, data, scope, type, value, options ) {
                        return value;
                    };


            var defaultConfig = {
                /**
                 * CSS that is automatically applied *to the directive* for various events. This is in addition to any
                 * CSS that the directive code itself might apply. This also includes CSS that is attached at
                 * init time to various objects in the
                 */
                css: {
                    /** Added to the directive's element. */
                    directive: "cui-Control",

                    // For the individual browser events and ohter programmatic actions.

                    // [focus class, blur class]
                    focus: [ "cui-Control--focus", function() { return "cui-Control--blur"; } ],
                    // [mouse over class, mouse out class]
                    mouse: [ "cui-Control--mouseOver", "cui-Control--mouseDown" ],

                    // [active, quiet}: active == any part is focused.
                    active: [ "cui-Control--active", "cui-Control--quiet" ],
                    // [visible, hidden]
                    visibility: [ "cui-Control--visible", "cui-Control--hidden" ],
                    // [enabled, disabled[
                    enable: [ "cui-Control--enabled", "cui-Control--disabled" ],

                    required: [ "cui-Control-provided", "cui-Control-missing" ],
                    valid: [ "cui-Control--valid", "cui-Control--invalid" ]
                },

                /**
                 * Our own handlers. These execute after the calling code's handlers and
                 * the directive's handlers get a chance to execute. Note that any of those
                 * handlers can terminate the event so that our handlers do not execute. For
                 * example, the calling code can disable the focus event if it chooses.
                 */
                handlers: {
                    focus: focusHandler,
                    keystroke: keystrokeHandler,
                    mouse: mouseHandler,

                    set: setCallback,
                    editState: editStateHandler,
                    visibility: visibilityHandler,
                    enable: enabledHandler,
                    formatSummary: formatSummaryHandler,
                    
                    localize: localizeHandler
                }
            };

            var mergeOneConfig =
                function( source, destination ) {
                    if (source !== null) {
                        for (var configItem in source) {
                            if (source.hasOwnProperty(configItem)) {
                                // Have we already seen this item? If not, then add it to the
                                // destination. If so, then include this one. This might require
                                // that we convert the destination to an array if we've previously
                                // only seen one item. One item is not stored as an array.
                                var destConfigItem = destination[configItem],
                                    sourceConfigItem, i;
                                if (typeof destConfigItem === "undefined") {
                                    destination[configItem] = source[configItem];
                                } else {
                                    // We already have at least one of these items. Make an array if
                                    // needed and then add this new one. An edgy condition. If we already
                                    // have this config item in the destination then we need to decide
                                    // how to add this new item. If the destination contains multiple
                                    // distinct configs then each config is in its own array. So, if
                                    // destConfiguration is an array we need to see if the first element
                                    // is also an array. If not, then make a new destConfig from the
                                    // current one by putting the current one into its own array element
                                    // then add the next element.
                                    if (! Array.isArray( destConfigItem )) {
                                        // We are adding a second item. We need to create a new
                                        // destConfiguration array and add the current destConfiguration
                                        // as the first element of the array.
                                        destination[configItem] = [ [destConfigItem, null] ];
                                    } else if (! Array.isArray( destConfigItem[0] )) {
                                        destination[configItem] = [ destConfigItem ];
                                    }
                                    destConfigItem = destination[configItem];

                                    // Now add the new source config items to this array. Note that
                                    // source config item can be: 1) fcn, 2) [fcn, data] or 3) [ [...], ... ]
                                    sourceConfigItem = source[configItem];
                                    if (! Array.isArray( sourceConfigItem )) {
                                        destConfigItem.push( [sourceConfigItem, null] );
                                    } else if (! Array.isArray( sourceConfigItem[0] )) {
                                        destConfigItem.push( sourceConfigItem );
                                    } else {
                                        for (i = 0; i < sourceConfigItem.length; i++) {
                                            if (Array.isArray( sourceConfigItem[i] )) {
                                                destConfigItem.push( sourceConfigItem[i] );
                                            } else {
                                                destConfigItem.push( [sourceConfigItem[0], null] );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

            var mergeConfigs =
                /**
                 * Merges the css and handler parts of the configs into a single
                 * object. When more than one config defines something then we
                 * create an array to hold the merged objects. scopeConfig items
                 * are first, coreConfig items are last. We currently look at the
                 * css config and handler configs.
                 * @param scopeConfig
                 * @param serviceConfig
                 * @param directiveConfig
                 * @param callerConfig
                 * @return the merged config.
                 */
                function( coreConfig, serviceConfig, directiveConfig, scopeConfig ) {
                    // Start by creating a single config object that has all of
                    // the data from the four configs. This picks up unique items
                    // that are not specifically css or handlers. Then we'll merge
                    // the css and handler configs.
                    var mergedConfig = {}; //$.extend( {}, coreConfig, serviceConfig, directiveConfig, scopeConfig );

                    // Now merge the CSS configs. Priority is to the scope, then directive
                    // service and core.
                    mergedConfig.css = {};
                    mergeOneConfig( !! scopeConfig ? scopeConfig.css : null, mergedConfig.css );
                    mergeOneConfig( !! directiveConfig ? directiveConfig.css : null, mergedConfig.css );
                    mergeOneConfig( !! serviceConfig ? serviceConfig.css : null, mergedConfig.css );
                    mergeOneConfig( !! coreConfig ? coreConfig.css : null, mergedConfig.css );

                    // And now the handler configs.
                    mergedConfig.handlers = {};
                    mergeOneConfig( !! scopeConfig ? scopeConfig.handlers : null, mergedConfig.handlers );
                    mergeOneConfig( !! directiveConfig ? directiveConfig.handlers : null, mergedConfig.handlers );
                    mergeOneConfig( !! serviceConfig ? serviceConfig.handlers : null, mergedConfig.handlers );
                    mergeOneConfig( !! coreConfig ? coreConfig.handlers : null, mergedConfig.handlers );

                    // And now the handler configs.
                    mergedConfig.validation = {};
                    mergeOneConfig( !! scopeConfig ? scopeConfig.validation : null, mergedConfig.validation );
                    mergeOneConfig( !! directiveConfig ? directiveConfig.validation : null, mergedConfig.validation );
                    mergeOneConfig( !! serviceConfig ? serviceConfig.validation : null, mergedConfig.validation );
                    mergeOneConfig( !! coreConfig ? coreConfig.validation : null, mergedConfig.validation );

                    return mergedConfig;
                };

            var ControlManagerConstructor =
                /**
                 * The actual constructor for the ControlManager class. Note that we're wrapped
                 * in an immediately executed function expression. ControlManagerConstructor is the return
                 * value.
                 */
                function( scope, element, attrs, serviceConfig, directiveConfig, scopeConfig ) {
                    this.config = mergeConfigs( defaultConfig, serviceConfig, directiveConfig, scopeConfig );
                    var localConfig = this.config;

                    // Angular does not seem to want to do two-way binding when this control's scope is
                    // not directly linked ($parent) to the scope where the calling code's value scope
                    // attribute exists. So, when we want to update our cuiValue we need to manually
                    // update the scope attribute is bound to it. So we'll this ourselves.
                    this.valueAttributeName = attrs.cuiValue;

                    // The control can have multiple parts and each part can get data from
                    // distinct attributes in the cuiValue model object. Consequently we manage transferring
                    // data between the HTML input elements and the value object given to us by
                    // the calling code. However, we still want to be able to detect when external
                    // changes are made to the model object so that we can then update the UI. But, if
                    // we watch for changes and then make our own changes then the $watcher will trigger.
                    // We only want to respond to external model changes. So, if we change the model object
                    // ourselves--for example, when the control looses focus or the user updates a part--we
                    // want to be able to ignore the $watch call. This flag will be true when we are updating
                    // the model.
                    this.updatingModelObject = false;

                    this.scopeConfig = scopeConfig;
                    this.scope = scope;
                    this.scope.ControlManagerModule = this;
                    this.directiveElement = element;

                    // The control is in quiet/summary mode by default. This attribute tracks
                    // the current state.
                    this.editState = false;
                    // Some instances of a directive do not want the summary state to happen. For
                    // example, a search text box might always appear as an edit text control, even
                    // when not focused.
                    this.editStateOnly = utils.getNonNullValue( scope.cuiEditStateOnly, false );

                    // localization options for this control; for example, how a date should be displayed.
                    this.l10n = attrs.cuiL10n;

                    // Other defaults:
                    this.enabled = null;
                    this.visible = null;

                    // Placeholder text, if supplied.
                    this.placeholderText = utils.getNonNullValue( attrs.cuiPlaceholderText, null );

                    // Attach ourselves to the directive. This lets code that is not part
                    // of the directive locate this object and call methods.
                    element[0].amoControlManager = this;

                    // Add any callbacks that are supplied in the config passed in by the calling code,
                    // the directive and also our own callbacks.
                    this.callbackManager = new CallbackManager( this );
                    var callbackManager = this.callbackManager;
                    callbackManager.addCallbacks( localConfig.handlers );

                    // Create the "required" text. This is text we append to the
                    // summary text when the directive is for a required control--one
                    // that must have a value. This text will be appended to the summary
                    // text if the control's value is empty/null/etc.
                    if (typeof attrs.cuiRequired !== "undefined") {
                        this.required = true;
                        this.requiredText =
                            "<span class='cui-Control--required'>" +
                            this.callbackManager.executeLocalizationCallbacks( scope, "text", "requiredValue", [ false, false, "(Required)" ] ) +
                            "</span>";
                    } else {
                        this.required = false;
                    }

                    initializeElements.call( this, scope, attrs  );


                    // Set things like visibility, enabled, etc. These are based on scope
                    // attributes that are supplied in attributes in the directive's tag.
                    configureWatchVariables.call( this, scope, attrs );

                    this.callbackManager.executeActionCallbacks( INITIALIZE, scope );
                };

            // The visible part of this class' API follows:

            // Methods the directive uses to add extra handlers. We handle browser events
            // with standard behavior. The directive might want to take special action
            // for some events.
            ControlManagerConstructor.prototype.addFocusHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( FOCUS, handler, data ); };
            ControlManagerConstructor.prototype.addKeystrokeHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( KEYSTROKE, handler, data ); };
            ControlManagerConstructor.prototype.addMouseHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( MOUSE, handler, data ); };

            // And events for state changes that are not directly related to browser events.
            ControlManagerConstructor.prototype.addEditPartChangedHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( EDIT_PART_CHANGED, handler, data ); };
            ControlManagerConstructor.prototype.addValueChangedHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( VALUE_CHANGED, handler, data ); };
            ControlManagerConstructor.prototype.addFormatSummaryHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( FORMAT_SUMMARY, handler, data ); };
            ControlManagerConstructor.prototype.addLocalizeHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( LOCALIZE, localizeHandler, data ); };

            ControlManagerConstructor.prototype.addInitializationHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( INITIALIZE, handler, data ); };
            ControlManagerConstructor.prototype.addEditStateHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( EDIT_STATE, handler, data ); };
            ControlManagerConstructor.prototype.addVisibilityHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( VISIBILITY, handler, data ); };
            ControlManagerConstructor.prototype.addEnabledHandler = function( handler, data ) { this.callbackManager.addCallbackHandler( ENABLE, handler, data ); };

            // The control management API. These are functions that wrapper code can call
            // to manipulate the state of the control

            ControlManagerConstructor.prototype.getDirectiveElement =
                /**
                 * Returns the root element of the directive. This is the HTML element that has the
                 * directive's name as its tag.
                 * @returns The element, as a jQuery object.
                 */
                function() { return this.directiveElement; };

            ControlManagerConstructor.prototype.getDirectiveId =
                /**
                 * Returns the unique identifier that we've assigned to this directive and its edit
                 * and summary parts.
                 * @returns The ID, a number represented as a string.
                 */
                function() { return this.directiveId; };

            ControlManagerConstructor.prototype.getScope =
                function() { return this.scope; };

            ControlManagerConstructor.prototype.getCallbackManager =
                function() { return this.callbackManager; };

            ControlManagerConstructor.prototype.getValueVariable =
                function() { return this.scope.cuiValue; };

            ControlManagerConstructor.prototype.isEditStateOnly =
                function() { return this.editStateOnly; };

            ControlManagerConstructor.prototype.getPlaceholderText =
                function() { return this.placeholderText; };

            ControlManagerConstructor.prototype.setVisible =
                /**
                 * Equivalent to .show and .hide in jQuery. This method can be called by
                 * external code and can be triggered by a change in a watched scope variable.
                 *
                 * @param visible True for .show and false for .hide
                 */
                function( visible ) {
                    if ((visible !== this.visible) && this.callbackManager.executeActionCallbacks( VISIBILITY, this.scope, visible )) {
                        this.visible = visible;
                    }
                };
            ControlManagerConstructor.prototype.isVisible =
                function() { return this.visible; };

            ControlManagerConstructor.prototype.setEnabled =
                /**
                 * Equivalent to .enable injQuery.
                 *
                 * @param enabled True to enable the directive, false to disable it.
                 */
                function( enabled ) {
                    // Don't do anything unless the enable state has changed.
                    if ((enabled !== this.enabled) && this.callbackManager.executeActionCallbacks( ENABLE, this.scope, enabled )) {
                        this.enabled = enabled;
                    }
                };
            ControlManagerConstructor.prototype.isEnabled =
                function() { return this.enabled; };

            //
            ControlManagerConstructor.prototype.enterEditState =
                /**
                 * Put the control into edit mode. This corresponds to active in some discussions.
                 * @param focusedElement The object that has triggered this action, usually by a mouse click or
                 *                          tab-into action. A jQuery object.
                 */
                function( focusedElement ) {
                    if (! this.editState) {
                        var elementToUse = focusedElement;
                        // If the focused element is a summary element then we locate the first edit part
                        // in the directive and focus on that.
                        if (! focusedElement || (focusedElement.length === 0) || focusedElement.hasClass( SUMMARY_PART_CLASS )) {
                            elementToUse = this.directiveElement.find( JQ_EDIT_PART_CLASS );

                            // If we found more than one edit part then we look for the one that is identified
                            // in the config as the default part. Otherwise we just use the first part.
                            if (!! elementToUse && (elementToUse.length > 1)) {
                                var initialPart = elementToUse.find( JQ_FIRST_EDIT_PART_CLASS );
                                if (! initialPart || (initialPart.length === 0)) {
                                    elementToUse = $( elementToUse[0] );
                                } else {
                                    elementToUse = $( initialPart[0] );
                                }
                            }
                        }

                        // Make sure the focusedElement really does have focus. We could be getting called
                        // because the user clicked on the summary part and we're now moving the focus to one
                        // of the edit parts.
                        if (! elementToUse.is( ":focus" )) {
                            setTimeout(
                                function() {
                                    elementToUse.focus();
                                }, 0
                            );
                        }
                        this.editState = true;
                        this.callbackManager.executeActionCallbacks( EDIT_STATE, this.scope, [true, this.directiveElement.is( ".ng-dirty" ) ] );
                    }
                };
            ControlManagerConstructor.prototype.enterSummaryState =
                /**
                 * The opposite of enterEditState--put the directive into "quiet" mode.
                 * @param blurredElement
                 */
                function( blurredElement ) {
                    if (this.editState) {
                        this.editState = false;

                        // Only call this if the part actually changed.
                        if (blurredElement.is( ".ng-dirty" )) {
                            editPartValueChanged.call( this, blurredElement );
                        }

                        if (this.callbackManager.executeActionCallbacks( EDIT_STATE, this.scope, [false, this.directiveElement.is( ".ng-dirty" ) ] )) {
                            this.updateSummary();
                        }
                    }
                };
            ControlManagerConstructor.prototype.isEditState =
                function() { return this.editState; };

            ControlManagerConstructor.prototype.updateValueModelObject =
                /**
                 * Move the current value variable (cuiValue) into the variable that
                 * the parent scope provided. The problem here is that when our control's
                 * scope is not directly tied to the parent controller's scope the two-way
                 * binding process does not work. The problem is particularly true when
                 * the control is transcluded in another directly. If we find the attribute
                 * in the first parent then we don't update it.
                 * @param newValue The value we'll insert into the cuiValue scope attribute
                 *              and the parent scope's attribute.
                 * @param cuiName When the value attribute is a structured object this
                 *              is identifies an sub attribute within it. This is typically used
                 *              when the control has multiple parts, each tied to different
                 *              sub attributes of the main object. Optional.
                 */
                function ( newValue, cuiName ) {
                    if (typeof this.scope.cuiValue !== "undefined") {
                        var localThis = this;
                        this.scope.$apply(
                            function () {
                                // Tells the $watcher on cuiValue that we're making local changes
                                // to the cuiValue model object and don't want to misinterpret these
                                // as externally generated changes. In the latter case we would
                                // update the HTML.
                                localThis.updatingModelObject = true;
                                var name = localThis.valueAttributeName;
                                if (!!name) {
                                    AMO.log.debug( "controlManagerModule.updateValueModelObject: newValue = " + newValue + ", cuiName = " + cuiName );
                                    var targetScope = null,
                                        nextScope = localThis.scope;

                                    while (!targetScope && !!nextScope) {
                                        if ((typeof nextScope[name] !== "undefined") && nextScope.hasOwnProperty( name )) {
                                            // We found the first scope that contains the original value attribute.
                                            targetScope = nextScope;
                                        } else {
                                            // Not here, get the next scope in the $parent chain.
                                            nextScope = nextScope.$parent;
                                        }
                                    }

                                    if (utils.hasContents(cuiName)) {
                                        if (typeof targetScope[name][cuiName] !== "undefined") {
                                            targetScope[name][cuiName] = newValue;
                                        }
                                    } else {
                                        targetScope[name] = newValue;
                                    }

                                    if (localThis.callbackManager.executeActionCallbacks( VALUE_CHANGED, localThis.scope )) {
                                        localThis.updateSummary();
                                    }
                                }
                            }
                        );
                    }
                };

            ControlManagerConstructor.prototype.updateSummary =
                /**
                 * Generate (via the callbacks) the text that gets displayed in
                 * the summary string area.
                 */
                function() {
                    var summary = this.callbackManager.executeFormatSummaryCallbacks( this.scope, this.getValueVariable() );
                    if (!! this.summaryElement) {
                        this.summaryElement.html( summary );
                    }
                };

            ControlManagerConstructor.prototype.validateInput =
                /**
                 * Invoke all of the validation handlers, stopping if one detects a failure.
                 * @param currentElement
                 * @param blurred
                 */
                function( currentElement, blurred ) {
                    var validationResult = null;
                    var scope = this.scope,
                        config = this.config;
                    // Do the wrapping code's validation
                    validationResult = this.callbackManager.executeValidationCallbacks( scope, currentElement, scope.cuiValue, blurred, config.validation );

                    // Finally, show the valid or invalid CSS.
                    var isValid = validationResult === null;
                    applyOnOffCss.call( this, config.css.valid, isValid );

                    if (isValid) {
                        currentElement.removeClass( "ng-invalid" );
                        currentElement.addClass( "ng-valid" );
                    } else {
                        currentElement.removeClass( "ng-valid" );
                        currentElement.addClass( "ng-invalid" );
                    }

                    // And show an error condition if necessary. Probably some icon that shows
                    // the returned error message when the mouse hovers over it.
//                    scope.$apply(
//                        function() {
                            scope.cuiValidationError = isValid ? null : this.getCallbackManager().executeLocalizationCallbacks( scope, "text", validationResult, [false, false, validationResult] );
//                        }
//                    );
                };

            ControlManagerConstructor.prototype.cleanUp =
                function() {
                    if (!! this.directiveElement) {
                        this.directiveElement.amoControlManager = null;
                    }
                };

            return ControlManagerConstructor;
        }());

    /**
     * A factory that manages interaction between the browser and
     * control (directive) and wrapping code and control.
     */
    var controlManagerFactoryFunction = (
        function() {
            /**
             * This factory should be called from the directive's link function.
             * The factory will prepare handlers that detect events received from
             * the actual HTML (focus, blur, keystroke, etc.) As each event is received
             * the factory will do core functions like adding or removing CSS or triggering
             * validation and formatting and then call any directive-specific
             * handlers that have been configured. The factory also instantiates
             * and returns an object that is like a promise.
             * @param scope
             * @param element
             * @param attrs
             * @param config
             */
            return function( utilitiesFactory ) {
                utils = utilitiesFactory;
                return ControlManager;
            };
        }());

    var module = angular.module( 'ControlManagerModule', [] );

    module.factory( 'ControlManagerFactory', [ "UtilitiesFactory", controlManagerFactoryFunction ]);

    // A directive that identifies a part of the control's HTML as an "edit" part.
    // This is a part that can receive focus and interact with the user. The counterpart
    // is a directive that identifies a summary part, where the control's current value is
    // displayed when no parts of the control are active.

    // Include this attribute directive on any element that is editable within the overall
    // control. If this part should receive focus when the user enters this directive/control
    // then set the attribute's value to "first".
    module.directive(
        "cuiEditPart",
        function() {
            var linkFunction =
                function( scope, element, attrs ) {
                    element.addClass( EDIT_PART_CLASS );

                    // Is this also the part that would receive focus when a multi-edit-part directive
                    // is entered?
                    if (attrs.cuiEditPart === "first") {
                        element.addClass( FIRST_EDIT_PART_CLASS );
                        element.addClass( "coral-Textfield" );
                    }

                };

            return {
                link: linkFunction,
                restrict: 'A'
            };
        }
    );

    // Use this directive to identify the summary parts in a control. These (typically one, this)
    // parts usually show a static string that represents the control's current value.
    module.directive(
        "cuiSummaryPart",
        function() {
            var linkFunction =
                function( scope, element, attrs ) {
                    element.addClass( SUMMARY_PART_CLASS );
                };

            return {
                link: linkFunction,
                restrict: 'A'
            };
        }
    );

    module.directive(
        "cuiEditStateOnly",
        function() {
            return {
                link: function( scope, element, attrs ) {
                    scope.cuiEditStateOnly = utils.getNonNullValue( attrs.cuiEditStateOnly, true );
                },
                restrict: 'A'
            };
        }
    );
    module.directive(
        "cuiRequired",
        function() {
            return {
                link: function( scope, element, attrs ) {
                    element.addClass( REQUIRES_VALUE_CLASS );
                },
                restrict: 'A'
            };
        }
    );
    // Generates a formatted form label + control row. The value of this directive's
    // cui-form-label attribute is used as the label. If the directive also contains
    // amo-l10n attribute then a localized version is retrieved.
    module.directive(
        "cuiFormField",
        [
            "$compile",
            function( $compile ) {
                var linkFunction =
                    function( scope, element, attrs ) {
                        scope.cuiFormField = scope.cuiValue + "/" + scope.control1Value;

                        // We may need to localize this.
                        AMO.log.debug( "cuiFormField directive: cuiValue = " + scope.cuiValue + ", control1Value = " + scope.control1Value );
                        scope.cuiFormFieldLabelText = attrs.cuiFormLabel;
                        if (typeof attrs.cuiL10n !== "undefined") {
                            if (!! scope.ControlManagerModule) {
                                scope.cuiFormFieldLabelText = scope.ControlManagerModule.getCallbackManager().executeLocalizationCallbacks(scope, "text", scope.cuiFormFieldLabelText, attrs.cuiL10n);
                            }
                        }
                    };

                return {
                    link: linkFunction,
                    transclude: true,
                    restrict: 'E',
                    // We want the parent scope to just pass through to whatever inner
                    // directive we're wrapping (if any.)
                    //scope: false,
                    template:
                        '<div class="cui-Form--control coral-Form-fieldwrapper">' +
                            '<div class="cui-Form--label coral-Form-fieldlabel">{{cuiFormFieldLabelText}}</div>' +
                            '<div class="cui-Form--value" ng-transclude></div>' +
                        '</div>'
                };
            }
        ]
    );
    module.directive(
        "cuiSummaryElement",
        [
            "$compile",
            function( $compile ) {
                var linkFunction =
                    function( scope, element, attrs ) {
                        element.html( "<span style='position: relative; float: left;' cui-summary-part></span>" );

                        // Really just for cui-summary-part
                        $compile( element.contents() )( scope );
                    };

                return {
                    link: linkFunction,
                    restrict: 'E'
                };
            }
        ]
    );
    module.directive(
        "cuiEditIcon",
        function() {
            var linkFunction =
                function( scope, element, attrs ) {
                    element.html( "<i class='coral-Icon coral-Icon--edit coral-Icon--sizeXS'></i>" );
                };

            return {
                link: linkFunction,
                restrict: 'E'
            };
        }
    );
    module.directive(
        "cuiInfoIcon",
        function() {
            var linkFunction =
                function( scope, element, attrs ) {
                    var data = element.html();
                    element.html(
                            '<span class="coral-Icon coral-Icon--infoCircle coral-Icon--sizeS" data-quicktip-arrow="top" data-quicktip-type="info" data-init="quicktip">' +
                            data +
                            '</span>'
                    );
                };

            return {
                link: linkFunction,
                restrict: 'E'
            };
        }
    );
})();
