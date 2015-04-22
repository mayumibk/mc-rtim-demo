"use strict";
/**
 * Implements the cui-grid-summary-row directive. By default, this
 * summary row is put beneath the column labels.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils, CONSTANTS;

    var defaultSummaryHtml = "<cui-grid-summary-cell summary-data='summaryData' cell='cell' cui-config='cuiConfig()' cell-width='cellWidth()' ng-repeat='cell in columns().layout.columns'></cui-grid-summary-cell>";
    angular.module( "ngCoral").directive(
        'cuiGridSummary',
        [
            '$compile', 'UtilitiesFactory', 'CuiGridConstants',
            function( $compile, utilitiesFactory, cuiGridConstants ) {
                utils = utilitiesFactory;
                CONSTANTS = cuiGridConstants;

                var link =
                    function( $scope, $element, attrs ) {

                        var summaryDataAvailable =
                                function( summaryColumns, summaryData ) {

                                    var html = null, customHtml,
                                        summaryConfig = $scope.cuiConfig().summary;

                                    $element.addClass( "cui-Grid--summary" );
                                    $scope.summaryData = summaryData;
                                    $scope.cellConfig = !! summaryConfig ? summaryConfig.cell : null;

                                    // See if a callback wants to provide the cell HTML.
                                    if (!! summaryConfig && !! (customHtml = summaryConfig.customHtml)) {
                                        // There are two options here. First the rowConfig.customHtml value is a string. Second,
                                        // rowConfig.customHtml could be a function that we'll call. We insert the value returned
                                        // by the function
                                        if (typeof customHtml === "function") {
                                            html = customHtml( $scope, $element, attrs, $scope.rowData() );
                                        } else {
                                            html = customHtml;
                                        }
                                    }
                                    // We assume that the returned data is what should be inserted, including
                                    // not inserting anything. However, if the callback explicitly returns null
                                    // then we'll use the default row HTML. So if the callback returns an empty
                                    // string then that will be inserted.
                                    if (html === null) {
                                        html = defaultSummaryHtml;
                                    }

                                    $element.html( html );
                                    $compile($element.contents())($scope);
                                },
                            cannotRetrieveSummaryData =
                                function( reason ) {

                                };

                        // We defer inserting the summary row until we have received
                        // the summary data. This is generally retreived asynchronously.
                        // This class will trigger a waiting icon in the UI. (todo)
                        $element.addClass( "cui-Grid--summaryPending" );
                        $scope.$on(
                            "cuiGrid-summaryDataAvailable",
                            function( event, data ) {
                                summaryDataAvailable( data.columns, data.data );
                            }
                        );
                        $scope.$on(
                            "cuiGrid-summaryDataNotAvailable",
                            function( event, reason ) {
                                cannotRetrieveSummaryData(reason);
                            }
                        );
                        setTimeout(
                            function() {
                                $scope.$emit( "cuiGrid-readyForSummaryData" );
                            }, 0
                        );
                    };

                return {
                        link: link,
                        restrict: 'E',
                        scope: {
                            columns: '&',
                            rowData: "&",
                            cuiConfig: '&',
                            cellWidth: '&'
                        }
                    };
            }

        ]
    );
}());
