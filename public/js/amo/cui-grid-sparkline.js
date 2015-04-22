/**
 *  Defines a directive that inserts a percent complete or percent of
 *  sparkline graphic into the HTML. The directive creates a horizontal
 *  box using percentage widths. The box is filled in according to a
 *  percent completed value for some task, etc.
 * Created by kmonahan on 1/8/15.
 */

(function() {
    "use strict";

    var module = angular.module( "ngCoral" );
    module.directive(
        'cuiGridSparklinePercentOf',
        [
            '$compile',
            function( $compile ) {

                var link =
                    function( $scope, $element, attrs ) {
                        var html = "<div class='cui-Sparkline cui-PercentCompletedSparkline'>" +
                            "<div class='cui-PercentCompletedSparkline-completed' style='width: " + $scope.percentComplete() + "%;'></div>" +
                            "<div class='cui-PercentCompletedSparkline-text'>" + $scope.percentComplete() + "%</div>" +
                            "</div>";

                        $element.html( html );
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                        link: link,
                        restrict: 'E',
                        scope: {
                            sparklineConfig: "&",
                            percentComplete: "&"
                        }
                    };
            }

        ]
    );

    module.directive(
        'cuiGridSparklineGraph',
        [
            '$compile',
            function( $compile ) {

                var link =
                    function( $scope, $element, attrs ) {
                        var html =
                            "<div class='cui-Sparkline cui-GraphSparkline'>" +
                                "<div style='position: relative;'>" +
                                "<div style='position: absolute; height: 1px; top: " + Math.floor( Math.random() * 16 ) + "px; width: 100%; border-style: solid; border-color: red; border-width: 1px 0 0 0;'></div>" +
                            "</div>";

                        $element.html( html );
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                    link: link,
                    restrict: 'E',
                    scope: {
                        sparklineConfig: "&",
                        percentComplete: "&"
                    }
                };
            }

        ]
    );



}());
