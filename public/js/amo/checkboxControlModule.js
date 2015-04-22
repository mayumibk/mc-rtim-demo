/**
 * Created by kmonahan on 11/19/14.
 *
 * An implementation of a checkbox. This supports scope variables
 * for value and enable status.
 */

(function() {
    "use strict";

    var module = angular.module( 'ngCoral' );

    module.directive(
        'cuiCheckbox',
        [
            "ControlService", "UtilitiesFactory",
            function( controlService, utils ) {
                return controlService(
                    {
                        templateCallback:
                            function( scope, element, attrs ) {
                                return '<label class="coral-Checkbox">' +
                                            '<input class="coral-Checkbox-input cui-Control-editPart" cuiEditPart type="checkbox" name="c2" value="2">' +
                                            '<span class="coral-Checkbox-checkmark"></span>' +
                                            '<span class="coral-Checkbox-description">{{checkboxLabel}}</span>' +
                                       '</label>';
                            }
                    },
                    {
                        handlers: {
                            link:
                                function( scope, element, attrs ) {
                                    scope.checkboxLabel = element.html().trim();
                                },
                            /* An example:
                            initialize:
                                function( controlManager, data, scope ) {
                                    AMO.log.debug( "In checkbox special init." );
                                },
                             */

                            set:
                                /**
                                 * Options is an array: [value, element] where the
                                 * value is
                                 * @param controlManager
                                 * @param unused Not used here.
                                 * @param scope
                                 * @param options [value, element] where value is the contents of
                                 *                  the cuiValue scope attribute and element is a
                                 *                  jQuery reference to the HTML element whose value
                                 *                  we'll set.
                                 */
                                function( controlManager, unused, scope, options ) {
                                    options[1].prop( "checked", utils.getTruth( options[0] ) );
                                }

                                /* An example:
                                 partChanged:
                                function( controlManager, data, scope, options ) {
                                    AMO.log.debug( "checkbox.editPartChangedHandler: " + (options[0].prop( "checked" ) ? "checked" : "unchecked" ) );
                                },*/

                        }
                    }
                );
            }

        ]
    );

}());
