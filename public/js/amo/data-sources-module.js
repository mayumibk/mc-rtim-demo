/**
 * This module contains all of our AMO data source objects. Data source
 * objects retrieve data from servers and present the data in a canonical
 * form, currently an array of arrays, where each subarray contains the
 * data for a single result row. The data sources are also responsible for
 * providing metadata that describes the contents of each column in the
 * returned rows.
 *
 * Created by kmonahan on 1/13/15.
 */

(function() {
    "use strict";

    // Any constants that are used throughout this module.
    var constants =
    {
        /***** ReportCriteria default values *****/
        // Standalone items (not in contained hashmaps)
        COLUMN_GROUP: "DEFAULT",
        SORT_PRESET: -1,
        BULK_SETTINGS: null,
        ALLOW_NESTED_VALUES: true,

        // basicSettings values.
        INCLUDE_NO_PERFORMANCE_ROWS: false,
        INCLUDE_PERFORMANCE_DATA: false,
        BY_CLICK_DATE: false,

        // Sort
        ASCENDING: "asc",
        DESCENDING: "desc",

        // Filter operations.
        LESS_THAN: "LT",
        LESS_THAN_OR_EQUAL_TO: "LTE",
        EQUAL_TO: "EQ",
        GREATER_THAN_OR_EQUAL_TO: "GTE",
        GREATER_THAN: "GT",

        STARTS_WITH: "SW",
        ENDS_WITH: "EW",
        CONTAINS: "CON",
        EQUALS: "EQ",

        AND: "AND",
        OR: "ANY",
        ANY: "ANY",

        // map defaults
        LIMIT: 50,
        OFFSET: 0
    };

    angular.module( "DataSourcesModule", [] )
        // Add constants that are used throughout the grid code.
        .constant(  "DataSourcesConstants", constants );
}());
