"use strict";
/**
 *  Defines the cui-grid-footer directive. This directive, by default,
 *  appears below the body section of the grid.
 * Created by kmonahan on 1/8/15.
 */

(function() {

    angular.module( "ngCoral" ).directive(
        'cuiGridFooter',
        [
            '$compile',
            function( $compile ) {

                var link =
                    function( $scope, $element, attrs ) {
                        var html, customHtml;

                        $element.addClass( "cui-Grid--footer" );
                        // First see if a directive was provided directly in the HTML.
                        if (typeof $scope.cuiFooter !== "undefined") {
                            html = "<" + $scope.cuiFooter + "></" + $scope.cuiFooter + ">";
                        } else if (!! $scope.cuiConfig() && !! $scope.cuiConfig().header && !! (customHtml = $scope.cuiConfig().footer.customHtml)) {
                            // See if a callback wants to provide the footer HTML.
                            // There are two options here. First the rowConfig.customHtml value is a string. Second,
                            // rowConfig.customHtml could be a function that we'll call. We insert the value returned
                            // by the function
                            if (typeof customHtml === "function") {
                                html = customHtml( $scope, $element, attrs );
                            } else {
                                html = customHtml;
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
                        restrict: 'E',
                        scope: false
                    };
            }

        ]
    );

}());
