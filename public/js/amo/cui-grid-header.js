"use strict";
/**
 *  Defines the cui-grid-header directive. This directive, by default, appears
 *  at the top of the grid, above the body area and the footer area.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {

    angular.module( "ngCoral" ).directive(
        'cuiGridHeader',
        [
            '$compile', 'ControlService',
            function( $compile, controlService ) {

                var link =
                    function( $scope, $element, attrs, controller ) {
                        var html, customHtml;

                        $element.addClass( "cui-Grid--header" );
                        // First see if a directive was provided directly in the HTML.
                        if (typeof $scope.cuiHeader !== "undefined") {
                            html = "<" + $scope.cuiHeader + "></" + $scope.cuiHeader + ">";
                        } else {
                            if (!!$scope.cuiConfig() && !!(customHtml = $scope.cuiConfig().customHtml)) {
                                if (typeof customHtml === "function") {
                                    html = customHtml($scope, $element, attrs);
                                } else {
                                    html = customHtml;
                                }
                            }
                        }

                        if (typeof html !== "undefined") {
                            $element.html(html);
                            $compile($element.contents())($scope);
                        }
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                    link: link,
                    restrict: 'E'
                };
            }

        ]
    );

}());
