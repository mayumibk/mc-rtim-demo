/**
 * Created by kmonahan on 11/19/14.
 *
 * A service which provides the basic features of all AMO shared controls.
 * The service mainly provides a link function and code to handle config defaults.
 * See standardControlsModule.js to see this in action.
 */

(function() {
    "use strict";

    var module = angular.module( 'ControlServiceModule', [ 'ControlManagerModule','UtilitiesModule' ] );

    module.service(
        'ControlService',
        [
            "ControlManagerFactory", "$compile", "$timeout", "UtilitiesFactory", 
            function( ControlManagerFactory, $compile, $timeout, utils ) {
                /**
                 * Our ControlService returns the hashmap that is expected for
                 * Angular directives. We do also have our own options, provided
                 * in the templateOptions and config parameters. In your directive
                 * defintion you can add:
                 *      return controlService(...)
                 * to your directive's function. The result returned here will be
                 * accepted by Angular
                 * @param templateOptions Overrides for Angular's template and templateUrl
                 *                          options plus a new one of our own: templateCallback.
                 *                          This is a function you supply. The returned string--
                 *                          hopefully valid HTML--is inserted by the link function.
                 * @param config All of the standard CSS and handler options that are used in the
                 *                  ControlManagerModule.
                 * @param directiveOptions Other options that you want provided in the hashmap
                 *                          this function returns. These are typically values you
                 *                          want passed back to angular, such as "restrict".
                 * @return a hashmap that can be returned to Angular by your directive's create
                 *          function.
                 */
                return function( templateOptions, config, directiveOptions ) {
                    // Callbacks. The control manager instance will call these methods
                    // when the corresponding events/actions occur. These methods are
                    // included here primarily to document functions that you can also
                    // include in your calling code. A controller you create
                    //var
                    // Commented-out handlers are provided as examples.
//                        initializationHandler =
//                            /**
//                             * This function is called when the control manager has done its configuration
//                             * of the directive and its HTML. The directive can then do other necessary tasks,
//                             * such as loading data into parts, etc.
//                             * @param controlManager
//                             * @param data
//                             */
//                            function( controlManager, data, scope ) {},

                        //setValueHandler =
                        //    /**
                        //     * Options is an array: [value, element] where the
                        //     * value is
                        //     * @param controlManager
                        //     * @param unused Not used here.
                        //     * @param scope
                        //     * @param options [value, element] where value is the contents of
                        //     *                  the cuiValue scope attribute and element is a
                        //     *                  jQuery reference to the HTML element whose value
                        //     *                  we'll set.
                        //     */
                        //    function( controlManager, unused, scope, options ) {
                        //        options[1].attr( "value", options[0] );
                        //    }

//                        focusHandler =
//                            /**
//                             * The directive responds to a focus/blur event.
//                             * @param event The original browser focus event
//                             * @param focus True for a focus event, false for a blur event.
//                             * @param data Data provided when the handler was registered as a callback.
//                             *              in this case we don't use it
//                             * @param controlManager The current ControlManager instance
//                             * @param element The HTML element that raised the original event. Not used here.
//                             */
//                            function( event, focus, data, controlManager, element ) {
////                            AMO.log.debug( "control " + (focus ? "received" : "lost") + " focus, data = " + data );
//                            },

//                        keystrokeHandler =
//                            /**
//                             * This handler is called for the two main key events: keydown and keyup.
//                             * For keydown and keyup they key value is always the actual keyboard key--
//                             * typing a lowercase 'a' will appear to keydown and keyup as an 'A'. The actual
//                             * character that the user intended--an 'a' or an 'A'--will be passed to the
//                             * editPartChangedHandler
//                             *
//                             * You can do interesting things with each event. Use keydown for two purposes. First, you
//                             * can detect invalid characters and return false. The character will not be added to the
//                             * field and keyup will not be called. Second, you can detect when selected keys have been
//                             * pressed--typically control keys--and then do CSS mods or other mods; for example, turn
//                             * the text red when the shift key is down. You'll likely have better ideas. :)
//                             * Use keyup to get the actual typed character and the current contents of the
//                             * control. This is a time when you can do key-by-key validation or filtering of the field.
//                             * @param event The original browser focus event
//                             * @param text An array of info about the keystroke:
//                             *                  text[0] is the event: KEY_DOWN, KEYPRESS or KEY_UP.
//                             *                  text[1] is the character or key that was pressed (depends on the event)
//                             *                  text[2] is the text from the control. Most useful on KEY_UP.
//                             * @param data Data provided when the handler was registered as a callback.
//                             *              in this case we don't use it
//                             * @param controlManager The current ControlManager instance
//                             * @param element The HTML element that raised the original event. Not used here.
//                             */
//                            function( event, text, data, controlManager, element ) {
////                            AMO.log.trace( function() { return "keystroke: character = " + text[1] + ", field = " + text[2] + ", event = " + text[0]; } );
////                            if (text[0] === "keydown") {
////                                if (event.shiftKey) {
////                                    element.css("color", "green");
////                                }
////                            } else if (text[0] === "keyup") {
////                                element.css( "color", "red" );
////                            }
////                            return text[1] !== 'B';
//                            },
//                        mouseHandler =
//                            /**
//                             * The directive responds to a mouse event.
//                             * @param event The original browser focus event
//                             * @param focus True for a focus event, false for a blur event.
//                             * @param data Data provided when the handler was registered as a callback.
//                             *              in this case we don't use it
//                             * @param controlManager The current ControlManager instance
//                             * @param element The HTML element that raised the original event. Not used here.
//                             */
//                            function( event, controlManager, element, data, mouseAction ) {
////                            AMO.log.trace( function() { return "mouse: " + mouseAction; } );
//                            },
//
//                        editStateHandler =
//                            function( controlManager, data, scope, editState ) {
//
//                            },
//                        visibilityHandler =
//                            function( controlManager, data, scope, visibility ) {
////                            AMO.log.debug( function() { return "visible: " + visibility + ", data = " + data; } );
//                            },
//                        enabledHandler =
//                            function( controlManager, data, scope, enabled ) {
////                            AMO.log.trace( function() { return "enabled: " + enabled + ", data = " + data; } );
//                            },
//
//                        formatSummaryHandler =
//                            /**
//                             * Time to update the summary part.
//                             * @param controlManager
//                             * @param data
//                             * @param summaryElement A jQuery object referencing the HTML used for the summary parts.
//                             */
//                            function( controlManager, data, scope, valueVariable ) {
//                                return null;
//                            },
//
//                        editPartChangedHandler =
//                            /**
//                             * The value of our edit part has changed. We update the
//                             * "value" scope attribute with its contents.
//                             * todo: does this end up triggering valueAttributeChangedHandler?
//                             * @param controlManager Provided for convenience
//                             * @param data Optional data that was provided when this handler was registered.
//                             * @param options An array: [changedElement, blurred]:
//                             *                  changedElement: a jQuery reference to the HTML element that was changed
//                             *                  blurred: true if this event happened because the element lost focus. Use this
//                             *                  if you only want the value scope attribute updated when the user
//                             *                  leaves the directive/part.
//                             */
//                            function( controlManager, data, scope, options ) {
////                            AMO.log.debug( "cuiControl.editPartChangedHandler" );
//                            },
//
//                        valueAttributeChangedHandler =
//                            /**
//                             * The value scope attribute that was defined in the directive tag has changed (its
//                             * value has changed.) We need to update the contents of our parts. Note that this
//                             * is when the cui-name attribute is used. If present then the value of this attribute
//                             * is used to retrieve part of the value attribute.
//                             * @param controlManager
//                             * @param data
//                             */
//                            function( controlManager, data, scope ) {
////                            AMO.log.debug( function() { return "cuiControl.valueAttributeChangedHandler: value = " + scope.cuiValue + ", cui-directiveId = " + controlManager.getDirectiveId(); } );
//                                // The control's HTML can define multiple active/edit elements and each
//                                // may need specific data from the "value" object that was given to the scope.
//                                // We handle this by looking for all of the edit parts and then seeing if
//                                // any have the cuiName attribute. If so, then we get that specific item
//                                // from the scope. For example, if scope.cuiValue = { first: "Kevin", last: "Monahan" }
//                                // and and the input tags look like:
//                                //      <input id="f" ... cui-name="first"/><input id="l" ... cui-name="last"/>
//                                // then we'll initialize #f with scope.cuiValue.first and #l with scope.cuiValue.last.
//                                controlManager.getDirectiveElement()
//                                    .find( ".cui-Control-editPart" )
//                                    .each(
//                                    function( index, part ) {
//                                        var $part = $( part),
//                                            cuiName = $part.attr( "cui-name" );
//                                        if (utils.hasContents( cuiName )) {
//                                            $part.attr( "value", scope.cuiValue[cuiName] );
//                                        } else {
//                                            $part.attr( "value", scope.cuiValue );
//                                        }
//                                    }
//                                );
//                            };
//                        ;

                    var serviceConfig =
                    {
                        /**
                         * Optional
                         * CSS classes that will be automatically added to/removed
                         * from the directive when this html element receives various browser events
                         * items are provided then the classes will be added/removed
                         * based on focus/blur. If only one class is supplied (either
                         * as a simple string or an array of one string element then
                         * that class will be added upon focus and removed upon blur.
                         *
                         * Note that this item is applied to the directive's element,
                         * not the actual HTML input, textarea, etc. The control manager
                         * will also add the standard AMO CSS for focus/blur.
                         *
                         * optional
                         */
                         css: {
                             // [focus class, blur class]
                             //focus: [ "focusedClass", function() { return "classForBlur"; } ],
                             // [mouse over class, mouse out class]
                             //mouse: [ "mouseOverClass", "mouseDownClass" ],

                             //directive: "cui-TextControl",

                             // And classes you want added to your edit and summary HTML
                             // elements. This can be done in the directive template but
                             // the option is provided here for users of the directive that
                             // might want to override this list. These items are added in addition
                             // to CSS that is added by the control manager. See the coreCss
                             // attribute of the config.
                             //editHtml: "editHtmlElement",
                             //summaryHtml: "summaryHtmlElement"
                         },

                        handlers: {
/*
                            initialize: [ initializationHandler, "initialize data" ],
*/
                            // Different controls have different ways of storing the current value.
                            // For example, a text control uses the "value" property while a checkbox
                            // uses the "checked" property. This set handler will handle the
                            // value in the appropriate way. The default is to assume the "value"
                            // property is used.
                            //set: setValueHandler,
/*
                            focus: [focusHandler, "focus data"],
                            keystroke: keystrokeHandler,
                            mouse: mouseHandler,

                            partChanged: editPartChangedHandler,
                            valueChanged: valueAttributeChangedHandler,
                            formatSummary: formatSummaryHandler,

                            editState: editStateHandler,
                            visibility: visibilityHandler,
                            enable: enabledHandler
*/
                        }
                    };

                    var linkFunction =
                        function( scope, element, attrs ) {
                            scope.controlServiceModule_linkFunction = scope.cuiValue + "/" + scope.control1Value;
                            // See if there is a callback.
                            if (!! config && !! config.handlers && !! config.handlers.link) {
                                config.handlers.link( scope, element, attrs );
                            }
                            if (!! scope.cuiConfig() && !! scope.cuiConfig().handlers && !! scope.cuiConfig().handlers.link) {
                                scope.cuiConfig().handlers.link( scope, element, attrs );
                            }

                            // Add an error message attribute to the scope. If validation fails
                            // then this message will be shown.
                            scope.cuiValidationError = null;

                            // Did the original call to this service provide a templateCallback
                            // in the templateOptions argument? If so, then we call this function
                            // and insert the result into the element.
                            if (!! templateOptions && (typeof templateOptions.templateCallback !== "undefined")) {
                                element.html( templateOptions.templateCallback( scope, element, attrs ) );
                                // Required because we're (maybe) nesting directives.
                                $compile(element.contents())(scope);
                            }

                            $timeout(
                                function() {
                                    if (!! scope.cuiConfig()) {
                                        scope.$watch(
                                            "cuiConfig",
                                            // This will get executed once when we watch the scope attribute.
                                            function() {
                                                scope.controlManager = new ControlManagerFactory(scope, element, attrs, serviceConfig, config, scope.cuiConfig());
                                            }
                                        );
                                    } else {
                                        // No extra calling code config so just init our control manager.
                                        scope.controlManager = new ControlManagerFactory( scope, element, attrs, serviceConfig, config );
                                    }


                                }, 0
                            );

                            scope.$on(
                                '$destroy',
                                function() {
                                    if (!! scope.controlManager) {
                                        scope.controlManager.cleanUp();
                                    }
                                }
                            );
                        };

                    // The hashmap Angular expects your directive's definition function to return.
                    var returnVal = $.extend(
                        {restrict: 'E', scope: {}}, directiveOptions,
                        // We require these so we overwrite yours. You can provide a link or
                        // controller function in the config parameter and it will be called
                        // when this link or controller function is called.
                        {
                            link: linkFunction,
                            controller:
                                function( $scope, $element ) {
                                    // See if there is a callback.
                                    if (!! config && !! config.handlers && !! config.handlers.controller) {
                                        config.handlers.controller( $scope, $element );
                                    }
                                    if (!! $scope.cuiConfig() && !! $scope.cuiConfig().handlers && !! $scope.cuiConfig().handlers.controller) {
                                        $scope.cuiConfig().handlers.controller( $scope, $element );
                                    }
                                }
                        }
                    );

                    // Add scope variables if they are not defined by the caller. These are the
                    // default scope names we expect for these standard objects.
                    var scope = returnVal.scope;
                    if (typeof scope.cuiConfig === "undefined") { scope.cuiConfig = "&"; }
                    if (typeof scope.cuiEnable === "undefined") { scope.cuiEnable = "="; }
                    if (typeof scope.cuiValue === "undefined") { scope.cuiValue = "="; }
                    if (typeof scope.cuiVisible === "undefined") { scope.cuiVisible = "="; }

                    // Insert a template option, starting with any the caller might have supplied.
                    if (!! templateOptions) {
                        // The supplied value can be either a template, template function or templateUrl.
                        if (typeof templateOptions.template !== "undefined") {
                            returnVal.template = templateOptions.template;
                        } else if (typeof templateOptions.templateUrl !== "undefined") {
                            returnVal.templateUrl =
                                function( tElement, tAttrs ) {
                                    return templateOptions.templateUrl;
                                };
                        }/* else if (typeof templateOptions.templateCallback === "undefined") {
                            // We can totally bypass the template logic by supplying a function
                            // in the "templateCallback" attribute. This function returns actual
                            // HTML--unlike the Angular template function option which returns
                            // a URL. We'll reference this in the link function. Note that if
                            // this function is not supplied then templateUrl is set. Otherwise,
                            // if it is supplied then both template and templateURL are left undefined.
                            returnVal.templateUrl =
                                function(element, attrs) {
                                    return utils.getNonNullValue( attrs.cuiTemplateUrl, null *//*"./components/shared/ngCoral-amo/cui-control/controlTemplate.html"*//* );
                                };
                        }*/

                        // And the transclude option.
                        if (typeof templateOptions.transclude !== "undefined") {
                            returnVal.transclude = templateOptions.transclude;
                        }
                    }/* else {
                        // Use either the default or a template reference from the directive's HTML itself.
                        returnVal.templateUrl =
                            function(element, attrs) {
                                return utils.getNonNullValue(
                                    attrs.cuiTemplateUrl, null *//*"./components/shared/ngCoral-amo/cui-control/controlTemplate.html" *//*
                                );
                            };
                    }*/

                    return returnVal;
                };
            }
        ]
    );
}());
