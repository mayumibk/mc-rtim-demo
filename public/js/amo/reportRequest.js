"use strict";
/**
 * reportRequest.js
 *
 * Wraps a request sequence for a single report--instantiate with a
 * server and report criteria object, post, respond to promise, update
 * report criteria and repost, etc. A ReportRequest instance is created
 * by the report factory.
 *
 * This could easily be a simple value that returns a constructor, like
 * used for DataSourceCriteria. It's a factory for now
 * on the assumption that we might add new features in the future, such
 * as checking on the result of an HTTP request, etc--things we might not
 * do directly via the ReportRequest object itself.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    var counter = 0;
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var SERVLET_STRING = "/CMDashboard/reportapi",
        http,
        utils,
        ColumnMetadata,
        CONSTANTS;


    // Utility functions we use when parsing the returned ReportService data.
    var parseReportServiceResponse =
        /**
         * Given data retrieved from the server extract the column meta data and the rows.
         * @param result The object returned by the server
         * @returns a hash containing an array of columns in .columns and an array of rows
         *              in .rows.
         */
        function( result ) {
            var parsedData = {};

            // rows is null if there is no data. Otherwise, if there is only one returned item
            // then row is a hash. If more than one items were returned then rows is an array of hashes.
            var rows = result.result["com.efrontier.common.modules.reports.to.ReportResult"].rows;
            parsedData.columns = parseColumns( result.result["com.efrontier.common.modules.reports.to.ReportResult"].columns[0]["com.efrontier.common.modules.reports.to.Column"] );
            parsedData.rows = parseRows(
                (Array.isArray( rows) && (rows.length > 0) && utils.hasContents( rows[0])) ? rows[0]["com.efrontier.common.modules.reports.to.ReportRow"] : null,
                result.result["com.efrontier.common.modules.reports.to.ReportResult"].offset,
                parsedData.columns
            );

            return parsedData;
        };

    var convertColumnType =
        /**
         * Converts the AMO column types into the canonical types that the grid directive understands.
         * @param value An AMO column type like "INTEGER"
         * @param name The column name. We need this to identify ID columns. These are given to us
         *              as INTEGERs but we need to treat them as IDs. When displayed they will not
         *              use separators between number groups: 1,234,567,890
         * @returns The ColumnMetadata type like "int"
         */
            function( value, name ) {
            switch (value) {
                case "STRING": return "str";
                case "INTEGER": return ((name === "user__acctid") || (name === "sid") || (name === "cid")) ? "id" : "int";
                case "FLOAT": return "flt";
                case "PERCENTAGE": return "pct";
                case "CURRENCY": return "curr";
                case "DATE": return "date";
                case "TIME": return "time";
                case "DATE_TIME": return "dt";
            }
        };

    var parseColumns =
        function( columnData ) {
            var columns = [], totalWidth = 0;
            var columnDatum;
            var position = 0;
            var i;

            // Create our metadata instance for each column we find in the result.
            for (i = 0; i < columnData.length; i++) {
                columnDatum = columnData[i];
                // A hack--the server is doubling the underscores...
                columnDatum.name = columnDatum.name.replace( /_/g, '__' );
                columnDatum.type = convertColumnType( columnDatum.type, columnDatum.name );
                // Turns out, the Java ReportService uses "hidden" rather than "visible".
                // So do a conversion here. If a column does not have a hidden attribute
                // then assume hidden = false.
                columnDatum.visible = ! utils.getNonNullValue( columnDatum.hidden, false );
                if (columnDatum.visible) {
                    if (utils.hasAttribute(columnDatum, "annotation.width")) {
                        columnDatum.width = utils.getNonNullValue(columnDatum.annotation.width, null /* avoids "undefined" */);
                    } else {
                        columnDatum.width = 100;
                    }
                    totalWidth += columnDatum.width;
                }

                columns.push(
                    new ColumnMetadata(
                        columnDatum, position++
                    )
                );
            }

            if (! isNaN( totalWidth )) {
                for (i = 0; i < columns.length; i++) {
                    columnDatum = columns[i];
                    if (columnDatum.isVisible()) {
                        columnDatum.setWidth(((columnDatum.getWidth() / totalWidth ) * 100.0) + '%      ');
                    }
                }
            }
            return columns;
        };

    var extractData =
        /**
         * The column data is given to us as an object hash. The single key in
         * the hash identifies the data type--"string", "int", "long", etc. The value
         * of that key is the actual data. We return that value.
         * @param columnValue
         * @param columnDefinition
         * @returns {*}
         */
        function( columnValue, columnDefinition ) {
            // We don't know what key is used--"string", "int", "long", etc.
            // We do know that there is only one key in the hash (hopefully
            // this doesn't change!) so we get it and then use it.
            if (columnValue === null) {
                return null;
            } else {
                var keys = Object.keys( columnValue),
                    value;
                if (!! keys) {
                    if (keys.length === 1) {
                        value = columnValue[keys[0]];
                    } else {
                        value = columnValue.toString();
                    }
                } else {
                    value = columnValue.toString();
                }

                return typeof value !== "undefined" ? value : '?';
            }
        };

    var parseRows =
            function( rowData, startingOffset, columns ) {
                var rows = [], i;

                // These are the names of all of the columns that are represented
                // in the data. The row's data is actually a map containing key/value
                // pairs--one key for each column. An issue we've seen is the name
                // in the column metadata part of the ReportService response can have
                // different case from the keys in the row's data map. So we convert
                // the keys to lowercase and recreate the data map with lowercase keys.
                var columnNames = [];
                for (i = 0; i < columns.length; i++) {
                    columnNames.push( columns[i].getName().toLowerCase() );
                }

                var makeLowerCaseKeyMap =
                    function( map ) {
                        var lowerCaseKeyMap = {};

                        if (map !== null) {
                            var keys = Object.keys( map );
                            for (var i = 0, l = keys.length; i < l; i++) {
                                lowerCaseKeyMap[keys[i]] = map[keys[i]];
                            }
                        }

                        return lowerCaseKeyMap;
                    };

                var extractDataForRow =
                    /**
                     * The row's data is contained in a map, not a simple array. We need
                     * to extract the data for each column we want to show.
                     * @param row
                     */
                    function( row ) {
                        var oneRow = [],
                            columnValue, j;
                        //oneRow.push(startingOffset + i);
                        for (j = 0; j < columnNames.length; j++) {
                            columnValue = row[columnNames[j]];
                            if (!!columnValue) {
                                oneRow.push( extractData( columnValue, columns[j] ) );
                            } else {
                                oneRow.push( null );
                            }
                        }

                        return oneRow;
                    };

                if (rowData !== null) {
                    // If the result only contains a single object then it
                    // *may* be returned as a simple object, not an object contained
                    // in a one-element array.

                    // The response data contains both the column metadata and objects
                    // for each row of data. Each column's data contains a key value. This
                    // key maps to a key/value pair in the row's data object. The problem
                    // is that the two keys may only match when a case-insensitive query
                    // is done. So, we need to create a new map with all lower-case keys.
                    // We then do our lookup with lower case key values.
                    if (Array.isArray( rowData )) {
                        for (i = 0; i < rowData.length; i++) {
                            rows.push( extractDataForRow( makeLowerCaseKeyMap( rowData[i].map ) ) );
                        }
                    } else {
                        rows.push( extractDataForRow( makeLowerCaseKeyMap( rowData ) ) );
                    }
                }

                return rows;
            };

    var ReportServiceRequestFactory =
        /**
         * Define the ReportRequestConstructor.
         */
        (function() {

            var ReportServiceRequestConstructor =
                /**
                 * Our constructor. We can create a new instance from either a hash that
                 * contains data like id or width or we can create one from a ColumnMetadata instance.
                 * @param options This can be either an instance of ColumnMetadata or a simple hash.
                 *                  We don't have direct access to this
                 * @constructor
                 */
                function( server, port, reportCriteria, useHttps ) {
                    AMO.log.debug( "Instantiating a report request." );

                    this.server = server;
                    this.port = port;
                    this.reportCriteria = reportCriteria;

                    // Useful for debugging when you are using a local server that
                    // doesn't accept https--use false in this case. Otherwise, if
                    // the parameter is not supplied we default to using https--the
                    // typical production criteria.
                    this.useHttps = (typeof useHttps !== "undefined") ? useHttps : true;

                    // We'll eventually do some pre-fetches of data--an attempt
                    // to have data ready before the user wants it. For now,
                    // just store the current block, with its offset. If a request
                    // comes in for it then return it--otherwise go back to the server.

                    this.reset();
                };

            ReportServiceRequestConstructor.prototype.reset =
                /**
                 * Clear any current state in the data source. This is typically done if
                 * there is a sort or filter change or a different set of columns is
                 * being retrieved.
                 */
                function() {
                    this.retrievedRows = null;
                    this.retrievedColumns = null;
                    this.retrievedRowOffset = null;
                    this.status = null;
                    this.headers = null;
                    this.config = null;
                };

            ReportServiceRequestConstructor.prototype.getData =
                /**
                 * Sends the actual request to the server using the URL info and
                 * report criteria info that was supplied when this report request object
                 * was instantiated. Either the successCallback or errorCallback is
                 * returned.
                 *
                 * In general, this method is called by external code that will use the
                 * results; for example in a grid. Subsequent requests can use the getData
                 * method which lets you get additional data at an offset.
                 * @param offset the position in the overall data set where we want to start retriving data.
                 * @param successCallback
                 * @param errorCallback
                 * @param maxRows the maximum number of data rows to return in the block
                 *              of data.
                 */
                function( offset, successCallback, errorCallback, maxRows ) {
                    // Can we handle this with cached data?
                    var localCounter = ++counter;
                    AMO.log.debug( "ReportRequest.getData: counter = " + localCounter + ", offset = " + offset + ", retrievedRowOffset = " + this.retrievedRowOffset );
                    if (offset === this.retrievedRowOffset) {
                        AMO.log.debug( "ReportRequest.getData, using existing data, counter = " + localCounter + ", offset = " + offset + ", retrievedRowOffset = " + this.retrievedRowOffset );
                        successCallback( this.retrievedColumns, this.retrievedRows, offset, maxRows );
                    } else {
                        var map = this.reportCriteria.getMap();
                        map.setOffset( offset );
                        if (typeof maxRows === "number") {
                            map.setLimit( maxRows );
                        }

                        var url = new utils.StringBuilder();
                        url.append( this.useHttps ? "https://" : "http://" )
                            .append( this.server).append( ':' ).append( this.port)
                            .append( SERVLET_STRING );

                        var closureThis = this;
                        AMO.log.debug( "Requesting report data from the server" );

                        http.post(
                            url.toString(),
                            JSON.stringify(
                                createPostBody.call( this,
                                    "getResult",
                                    [
                                        getCriteria( this.reportCriteria )
                                    ]
                                )
                            )
                        )
                            .success(
                                function( data, status, headers, config ) {
                                    AMO.log.debug( "ReportRequest.getData, data received, counter = " + localCounter + ", offset = " + offset + ", retrievedRowOffset = " + closureThis.retrievedRowOffset );
                                    var parsedData = parseReportServiceResponse( data );
                                    closureThis.retrievedRowOffset = offset;
                                    closureThis.retrievedColumns = parsedData.columns;
                                    closureThis.retrievedRows = parsedData.rows;
                                    closureThis.status = status;
                                    closureThis.headers = headers;
                                    closureThis.config = config;
                                    successCallback( parsedData.columns, parsedData.rows, offset, maxRows, [status, headers, config] );
                                }
                            )
                            .error(
                                function (data, status, headers, config) {
                                    errorCallback( data, status, headers, config );
                                }
                            );
                    }
                };

            ReportServiceRequestConstructor.prototype.getNumberOfRows =
                /**
                 * Similar in action to getData except this method requests the total number
                 * of rows defined by the query. Note that this is different from the number
                 * of row that get returned with each getData request.
                 * @param successCallback
                 * @param errorCallback
                 * @returns {defer.promise|*}
                 */
                function( successCallback, errorCallback ) {
                    this.reportCriteria.getMap().setOffset( 0 );

                    var url = new utils.StringBuilder();
                    url.append( this.useHttps ? "https://" : "http://" )
                        .append( this.server).append( ':' ).append( this.port)
                        .append( SERVLET_STRING );

                    AMO.log.debug( "Requesting number of rows from the server" );
                    http.post(
                        url.toString(),
                        JSON.stringify(
                            createPostBody.call( this,
                                "getCount",
                                [
                                    getCriteria( this.reportCriteria ),
                                    { "java.lang.Boolean": false }
                                ]
                            )
                        )
                    )
                        .success(
                            function( data, status, headers, config ) {
                                AMO.log.debug( "    number of rows received: " + data.result["com.efrontier.common.modules.reports.to.ReportResult"].totalSize );
                                successCallback( data.result["com.efrontier.common.modules.reports.to.ReportResult"].totalSize );
                            }
                        )
                        .error( errorCallback );
                };

            ReportServiceRequestConstructor.prototype.getSummaryResult =
                /**
                 * Again similar to getData. This request generates the report summary--
                 * the data that is shown in the summary row.
                 * @param successCallback
                 * @param errorCallback
                 * @returns {defer.promise|*}
                 */
                function( successCallback, errorCallback ) {
                    this.reportCriteria.getMap().setOffset( 0 );

                    var url = new utils.StringBuilder();
                    url.append( this.useHttps ? "https://" : "http://" )
                        .append( this.server).append( ':' ).append( this.port)
                        .append( SERVLET_STRING );

                    AMO.log.debug( "Requesting summary data from the server" );
                    http.post(
                        url.toString(),
                        JSON.stringify(
                            createPostBody.call( this,
                                "getSummaryResult",
                                [
                                    getCriteria( this.reportCriteria )
                                ]
                            )
                        )
                    )
                        .success(
                        function( data, status, headers, config ) {
                            AMO.log.debug( "    summary data received." );

                            //Need to look at this data and how it gets parsed.
                            var parsedData = parseReportServiceResponse( data );
                            successCallback( parsedData.columns, parsedData.rows, status, headers, config );
                        }
                    )
                        .error( errorCallback );
                };

            // Private methods...

            var createPostBody =
                function( method, parameters ) {
                    // Hardcoded during development...
                    var body = {};
                    body.method = method;
                    body.id = "MTQxODY4NDA1NDIwOS0zMDQz";
                    body.compact = false;

                    // An array of additional parameters
                    if (!! parameters) {
                        body.parameters = parameters;
                    }

                    return body;

                };

            var getCriteria =
                function( dataSourceCriteria ) {
                    var basicSettings = dataSourceCriteria.getBasicSettings(),
                        sortInfo = dataSourceCriteria.getSortInfo(),
                        map = dataSourceCriteria.getMap();
                    return {
                        "com.efrontier.common.modules.reports.to.ReportCriteria": {
                            columnGroup: dataSourceCriteria.getColumnGroup(),
                            basicSettings: !! basicSettings ? basicSettings.get() : null,
                            sortInfo: !! sortInfo ? toSortDefinition( sortInfo ) : null,

                            // Todo below...
                            "sortPreset": -1,
                            "filter": extractFilter( dataSourceCriteria ),
                                /*{
                                    "com.efrontier.common.core.filter.Filter$CompoundFilter": {
                                        "filters": [],
                                            "disableFilter": {},
                                        "operation": "AND",
                                            "identifier": null,
                                            "annotation": null,
                                            context: null,
                                            "global": false,
                                            "primary": false
                                    },

                                    "com.efrontier.common.core.filter.Filter$StringFilter": {
                                        "type": 1,
                                            "primary": false,
                                            "annotation": null,
                                            "str": "Test",
                                            "identifier": "adgroup_name",
                                            "global": false,
                                            "isCaseInsensitive": true
                                    }
                                }*/
                    /*{
                                                  "primary": false,
                                                  "filters": [
                                                      {
                                                          "com.efrontier.common.core.filter.Filter$CompoundFilter": {
                                                              "filters": [
                                                                  {
                                                                      "com.efrontier.common.core.filter.Filter$CompoundFilter": {
                                                                          "filters": [],
                                                                          "disableFilter": {},
                                                                          "operation": "AND",
                                                                          "identifier": null,
                                                                          "annotation": null,
                                                                          context: null,
                                                                          "global": false,
                                                                          "primary": false
                                                                      },

                                                                      "com.efrontier.common.core.filter.Filter$StringFilter": {
                                                                          "type": 1,
                                                                          "primary": false,
                                                                          "annotation": null,
                                                                          "str": "FBX",
                                                                          "identifier": "adgroup_name",
                                                                          "global": false,
                                                                          "isCaseInsensitive": true
                                                                      }
                                                                  }
                                                              ],
                                                              "disableFilter": {},
                                                              "operation": "AND",
                                                              "identifier": null,
                                                              "annotation": null,
                                                              context: null,
                                                              "global": false,
                                                              "primary": false
                                                          },

                                                          "com.efrontier.common.core.filter.Filter$StringFilter": {
                                                              "type": 1,
                                                              "primary": false,
                                                              "annotation": null,
                                                              "str": "Test",
                                                              "identifier": "adgroup_name",
                                                              "global": false,
                                                              "isCaseInsensitive": true
                                                          }
                                                      }
                                                  ],
                                                  "operation": "OR",
                                                  "identifier": null,
                                                  "disableFilter": {},
                                                  "global": false,
                                                  "annotation": null,
                                                  "@class": "com.efrontier.common.core.filter.Filter$CompoundFilter"
                                              },*/
                            "bulkSettings": null,
                            "comparableDateRange": {
                                "compareDateOption": null,
                                "compareDateInterval": null,
                                "baseDateInterval": {
                                    "interval": 5,
                                    "utcEndDate": 0,
                                    "utcStartDate": 0
                                }
                            },
                            "allowNestedValues": true,
                            "aggregationList": [
                                {}
                            ],
                            "map": !! map ? map.get() : null
                        }
                    };
                };

            var extractFilter =
                    /**
                     * Converts the filter definition in the data source criteria into
                     * the object structure we send to the ReportService. If we have a
                     * single filter that is neither a compound filter nor a NOT filter
                     * then we enbed it in a compound filter. This means we may have a
                     * single StringFilter within a single CompoundFilter.
                     *
                     * I do not believe we currently support multiple levels of compound
                     * filters. However if more than one filter is provided then they are
                     * split into a nested series of (compound-filter, filter) where
                     * compound-filter is then (compound-filter, next filter), etc. So,
                     * filters always contains zero or two elements. If there is only one
                     * filter criteria then filters contains a compound filter with no
                     * elements plus the provided filter.
                     * @param dataSourceCriteria
                     */
                    function( dataSourceCriteria ) {
                        // The object we'll send to the ReportService servlet. Will contain our
                        // filter definitions, if any were supplied.
                        var masterFilterObject = createCompoundFilter( "AND", false );
                        masterFilterObject["@class"] = "com.efrontier.common.core.filter.Filter$CompoundFilter";


                        var criteriaFilterDefinition = dataSourceCriteria.getFilterDefinition();
                        if (!! criteriaFilterDefinition) {
                            var filter = criteriaFilterDefinition.getFilter();
                            if (filter instanceof dataSourceCriteria.getConstructors().Filter.StringFilter) {
                                masterFilterObject.filters.push(
                                    {
                                        "com.efrontier.common.core.filter.Filter$CompoundFilter":
                                            createCompoundFilter( "AND", true ),
                                        "com.efrontier.common.core.filter.Filter$StringFilter":
                                            createStringFilter(
                                                filter.getAttribute(), convertStringFilterComparison( filter.getComparison() ),
                                                filter.getValue(), filter.isCaseInsensitive()
                                            )
                                    }
                                );
                            } else if (filter instanceof dataSourceCriteria.getConstructors().Filter.ComparableFilter) {
                                masterFilterObject.filters.push(
                                    {
                                        "com.efrontier.common.core.filter.Filter$CompoundFilter":
                                            createCompoundFilter( "AND", true ),
                                        "com.efrontier.common.core.filter.Filter$ComparableFilter":
                                            createComparableFilter(
                                                filter.getAttribute(), convertCompareFilterComparison( filter.getComparison() ),
                                                filter.getValue()
                                            )
                                    }
                                );
                            } else if (filter instanceof dataSourceCriteria.getConstructors().Filter.CompoundFilter) {
                                var receivedFilters = filter.getFilters();
                                var recursiveDefinition = null;
                                var filterDefinition = null;
                                var compoundCombination = filter.getCombination();
                                if (utils.hasContents( receivedFilters )) {
                                    for (var i = receivedFilters.length - 1; i >= 0; i--) {
                                        recursiveDefinition = createCompoundFilter( !! compoundCombination ? compoundCombination : "AND", true );
                                        filter = receivedFilters[i];
                                        if (filter instanceof dataSourceCriteria.getConstructors().Filter.StringFilter) {
                                            recursiveDefinition.filters.push(
                                                {
                                                    "com.efrontier.common.core.filter.Filter$CompoundFilter": !! filterDefinition ? filterDefinition : createCompoundFilter("AND"),
                                                    "com.efrontier.common.core.filter.Filter$StringFilter": createStringFilter(
                                                        filter.getAttribute(), convertStringFilterComparison(filter.getComparison()),
                                                        filter.getValue(), filter.isCaseInsensitive()
                                                    )
                                                }
                                            );
                                        } else if (filter instanceof dataSourceCriteria.getConstructors().Filter.ComparableFilter) {
                                            recursiveDefinition.filters.push(
                                                {
                                                    "com.efrontier.common.core.filter.Filter$CompoundFilter":
                                                        !! filterDefinition ? filterDefinition : createCompoundFilter( "AND" ),
                                                    "com.efrontier.common.core.filter.Filter$ComparableFilter": createComparableFilter(
                                                            filter.getAttribute(), convertCompareFilterComparison(filter.getComparison()),
                                                            filter.getValue()
                                                        )
                                                }
                                            );
                                        } else {
                                            AMO.log.error("Unsupported nested filter type: " + typeof filter);
                                        }

                                        filterDefinition = recursiveDefinition;
                                    }

                                    masterFilterObject.filters = filterDefinition.filters;
                                }
                            }
                        }

                        return masterFilterObject;
                    },

                createCompoundFilter =
                    function( combination, includeContext ) {
                        var filter = {
                            operation: combination,
                            identifier: null,
                            disableFilter: {},
                            primary: false,
                            global: false,
                            annotation: null,
                            filters: []
                        };
                        if (includeContext) {
                            filter.context = null;
                        }

                        return filter;
                    },
                createStringFilter =
                    function( identifier, comparison, value, isCaseInsensitive ) {
                        return {
                            primary: false,
                            global: false,
                            //annotation: null,

                            identifier: identifier,
                            type: comparison,
                            str: value,
                            isCaseInsensitive: isCaseInsensitive
                        };
                    },
                createComparableFilter =
                    function( identifier, comparison, value ) {
                        return {
                            primary: false,
                            global: false,
                            //annotation: null,

                            identifier: identifier,
                            type: comparison,
                            comparable: value
                        };
                    },
                convertStringFilterComparison =
                    function( conversion ) {
                        switch (conversion) {
                            case CONSTANTS.STARTS_WITH:
                                return 1;
                            case CONSTANTS.ENDS_WITH:
                                return 2;
                            case CONSTANTS.CONTAINS:
                                return 3;
                            default:
                                return 4;
                        }
                    },
                convertCompareFilterComparison =
                    function( conversion ) {
                        switch (conversion) {
                            case CONSTANTS.LESS_THAN:
                                return 2;
                            case CONSTANTS.LESS_THAN_OR_EQUAL_TO:
                                return 3;
                            case CONSTANTS.EQUAL_TO:
                                return 1;
                            case CONSTANTS.GREATER_THAN_OR_EQUAL_TO:
                                return 5;
                            case CONSTANTS.GREATER_THAN:
                                return 4;
                            default:
                                return 1;
                        }
                    };

            var toSortDefinition =
                /**
                 * Converts the SortInfo instance we receive from the data source
                 * criteria instance into the type of object expected by the ReportService.
                 * @param sortInfo The SortInfo instance from the data source criteria object.
                 *              Can be null or undefined.
                 */
                function( sortInfo ) {
                    var sortSpecification = null;
                    if (!! sortInfo) {
                        var count = sortInfo.getNumberOfSortDefinitions();
                        if (count > 0) {
                            sortSpecification = [];
                            var sortInfoItem;
                            for (var i = 0; i < count; i++) {
                                sortInfoItem = sortInfo.get( i );
                                sortSpecification.push(
                                    {
                                        "com.sencha.gxt.data.shared.SortInfoBean": {
                                            sortDir: sortInfoItem.direction === CONSTANTS.ASCENDING ? "ASC" : "DESC",
                                            sortField: sortInfoItem.field
                                        }
                                    }
                                );
                            }
                        }
                    }

                    return sortSpecification;
                };

            return function( $http, utilitiesFactory, columnMetadata, dataSourcesConstants ) {
                utils = utilitiesFactory;
                http = $http;
                ColumnMetadata = columnMetadata;
                CONSTANTS = dataSourcesConstants;

                return ReportServiceRequestConstructor;
            };
        }());

    // Add this to the grid module as a value.
    angular.module( "DataSourcesModule" )
        .factory( "ReportServiceRequest", ["$http", "UtilitiesFactory", "ColumnMetadata", "DataSourcesConstants", ReportServiceRequestFactory] );

}());
