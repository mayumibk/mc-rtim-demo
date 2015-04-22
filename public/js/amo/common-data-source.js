/**
 * common-data-source
 *
 * The simplest form of data source. When instantiating one you
 * provide callbacks for the core functionality: getData,
 * getNumberOfRows and getSummaryData.
 * Created by Kevin Monahan on 2/11/15.
 */

(function () {
    "use strict";

    /*
        A class that shows what a data source is minimally required
        to do: return data, number of rows and summary data from some
        source data set. The source dataset can be a database that
        is accessed asynchronously or an array of pre-fetched/pre-defined
        data that is accessed synchronously. In either case, the three
        methods are expected to return promises.
     */
    var CommonDataSource =
        (function () {
            var CommonDataSourceConstructor =
                /**
                 * Instantiates a common data source that will redirect getData,
                 * getNumberOfRows and getSummaryData requests to the indicated
                 * handlers.
                 * @param getDataHandler Implements getData()
                 * @param getNumberOfRowsHandler Implements getNumberOfRows()
                 * @param getSummaryResultHandler Implements getSummaryData()
                 * @constructor
                 */
                function (getDataHandler, getNumberOfRowsHandler, getSummaryResultHandler, reset) {
                    this.getData = !! getDataHandler ? getDataHandler : defaultGetData;
                    this.getNumberOfRows = !! getNumberOfRowsHandler ? getNumberOfRowsHandler : defaultGetNumberOfRows;
                    this.getSummaryResult = !! getSummaryResultHandler ? getSummaryResultHandler : defaultGetSummaryResult;
                    this.reset = !! reset ? reset : defaultReset;

                    // What a data source looks like...
                    return this;
                };

            // The three methods that the data source must implement--our API. These methods
            // simply pass on the call to the ones provided in the constructor.
            CommonDataSourceConstructor.prototype.getData =
                function( offset, successCallback, errorCallback, maxRows ) {
                    this.getData( offset, successCallback, errorCallback, maxRows );
                };

            CommonDataSourceConstructor.prototype.getNumberOfRows =
                function( successCallback, errorCallback ) {
                    this.getNumberOfRows( successCallback, errorCallback );
                };

            CommonDataSourceConstructor.prototype.getSummaryResult =
                function( successCallback, errorCallback ) {
                    this.getSummaryResult( successCallback, errorCallback );
                };

            CommonDataSourceConstructor.prototype.reset =
                function() {
                    this.reset.apply( this, arguments );
                };

            // Default methods for the three API methods. Note that these methods
            // return errors via the error callback.
            var defaultGetData =
                    function ( offset, successCallback, errorCallback/*, maxRows*/ ) {
                        errorCallback( "The getData method is not implemented in this CommonDataSource instance." );
                    },
                defaultGetNumberOfRows =
                    function ( successCallback, errorCallback ) {
                        errorCallback( "The getNumberOfRows method is not implemented in this CommonDataSource instance." );
                    },
                defaultGetSummaryResult =
                    function ( successCallback, errorCallback ) {
                        errorCallback( "The getSummaryResult method is not implemented in this CommonDataSource instance." );
                    },
                defaultReset =
                    function () {};

            return CommonDataSourceConstructor;
        }());

    // And a factory that will instantiate a data source for you
    angular.module( "DataSourcesModule" )
        .factory(
            "CommonDataSourceFactory",
            function() {
                return  function (getDataHandler, getNumberOfRowsHandler, getSummaryResultHandler, resetHandler) {
                            return new CommonDataSource(getDataHandler, getNumberOfRowsHandler, getSummaryResultHandler, resetHandler);
                        };
            }
        );
}());
