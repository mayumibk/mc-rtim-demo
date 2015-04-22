/**
 * report-service-factory.js
 *
 * This factory instantiates a ReportRequest instance for you.
 * You then submit the request to a server via the ReportRequest
 * instance's send method. So this factory does not do the actual
 * request but rather creates an object that can do it. You can
 * have multiple outstanding requests.
 *
 * Created by kmonahan on 1/13/15.
 */

(function() {
    "use strict";

    var ReportServiceFactoryFunction = (
        function() {

            return function( reportRequest, dataSourceCriteria ) {
                // Support classes that calling code needs. Our factory can
                // create instances via helper functions. This means the calling
                // code only needs ReportServiceFactory injected. It can get the
                // DataSource and ReportResult services from us.
                return {
                    ReportRequest: reportRequest,
                    DataSourceCriteria: dataSourceCriteria
                };
            };
    }());


    // Add this to the grid module as a value.
    angular.module( "DataSourcesModule" ).factory(
        "ReportServiceFactory",
        [ "ReportServiceRequest", "DataSourceCriteria", ReportServiceFactoryFunction ]
    );

}());
