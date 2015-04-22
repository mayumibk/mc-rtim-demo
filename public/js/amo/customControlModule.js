/**
 * Created by kmonahan on 11/19/14.
 *
 * A custom control wraps arbitrary HTML which can include
 * more than one embedded control--for example, three text
 * controls, a text control and a combo box, etc. Other controls,
 * such as checkboxes, have their own class/module.
 */

(function() {
    "use strict";

    var module = angular.module( 'CustomControlModule', ['ControlServiceModule'] );

    module.directive(
        'cuiCustomControl',
        [
            "ControlService",
            function( controlService ) {
                return controlService(
                    {
                        templateUrl: "./modules/ngCoral-amo/cui-control/controlTemplate.html",
                        link: function( scope ) {
                            scope.customControlModule = scope.cuiValue + "/" + scope.control1Value;
                            AMO.log.debug( "cuiCustomControl directive.link: cuiValue = " + scope.cuiValue + ", control1Value = " + scope.control1Value );
                        }
                    },
                    null // No directive-specific callbacks
                );
            }

        ]
    );
}());
