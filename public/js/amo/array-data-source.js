/**
 * array-data-source
 *
 * A data source that is backed by an array of data. This is typically
 * a fixed or hardcoded array.
 * Created by Kevin Monahan on 2/11/15.
 */

(function () {
    "use strict";

    var commonDataSourceFactory;

    var createArrayDataSource =
        function( rows, summaryRow ) {

            var localRows = rows,
                localSummaryRow = summaryRow;

            // Define the functions that we pass to the common data source.
            var getData =
                    /**
                     * Returns data from the array, starting at rowIndex and for
                     * rowsToReceive number of localRows.
                     */
                    function(rowIndex, successCallback, errorCallback, rowsToRetrieve ) {
                        if ((typeof localRows === "undefined") || ! localRows) {
                            errorCallback( "The source array is null or undefined." );
                            return;
                        }

                        // The number of localRows we'll actually return, based on how much data remains
                        // in the array.
                        var maxRows = typeof rowsToRetrieve !== "undefined" ? rowsToRetrieve : localRows.length;

                        if (rowIndex < localRows.length) {
                            // We can return some, perhaps as many localRows as requested.
                            // Segment the array into maxRow-sized blocks.
                            if ((rowIndex + maxRows) < localRows.length) {
                                successCallback( null, localRows.slice( rowIndex, rowIndex + maxRows ), rowIndex, maxRows );
                            } else {
                                // Less than maxRows are available so just return
                                // the remainder of the array.
                                successCallback( null, localRows.slice( rowIndex ), rowIndex, maxRows );
                            }
                        } else {
                            // At or past the end of the array. This is our end-of-data condition.
                            successCallback( null, null, rowIndex, maxRows );
                        }
                    },
                getNumberOfRows =
                    /**
                     * Pretty simple, just returns the length of the array.
                     * @returns {*}
                     */
                    function(successCallback, errorCallback) {
                        // Just return the size of the original array
                        if ((typeof localRows === "undefined") || ! localRows) {
                            errorCallback( "The source array is null or undefined." );
                            return;
                        }

                        return successCallback( localRows.length );
                    },
                getSummaryResult =
                    function( successCallback, errorCallback ) {
                        if (!! localSummaryRow) {
                            successCallback( null, localSummaryRow );
                        } else {
                            errorCallback( "no summary data was provided." );
                        }
                    },

                reset =
                    function ( newRows, newSummaryRow ) {
                        localRows = newRows;
                        localSummaryRow = newSummaryRow;
                    };

            // Let the CommonDataSourceFactory instantiate a data source instance for us.
            return commonDataSourceFactory( getData, getNumberOfRows, getSummaryResult, reset );
        };

    angular.module( "DataSourcesModule" )
        .factory(
            "ArrayDataSourceFactory",
            [
                "CommonDataSourceFactory",
                function( CommonDataSourceFactory ) {
                    commonDataSourceFactory = CommonDataSourceFactory;
                    return createArrayDataSource;
                }
            ]
        );
}());
