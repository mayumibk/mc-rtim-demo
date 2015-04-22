"use strict";
/**
 * A module that contains all services and directives
 * that are needed to create ngCoral-based grids. Other
 * JavaScript files will add to this module. Note that
 * this file must be included first so that the module
 * itself is created.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    var constants =
        {
            // Types of data that we expect to receive from remote sources
            // (or hardcoded data, etc.)
            STRING: "str",
            STRING_PREFIX: "str" + ':',
            INTEGER: "int",
            INTEGER_PREFIX: "int" + ':',
            PERCENT: "pct",
            PERCENT_PREFIX: "pct" + ':',
            // An id is number like a sid or cid that should not include
            // separators between number groups--display it like a string.
            ID: "id",
            ID_PREFIX: "id" + ':',
            FLOAT: "flt",
            FLOAT_PREFIX: "flt" + ':',
            CURRENCY: "curr",
            CURRENCY_PREFIX: "curr" + ':',
            DATE: "date",
            DATE_PREFIX: "date" + ':',
            TIME: "time",
            TIME_PREFIX: "time" + ':',
            DATE_TIME: "dt",
            DATE_TIME_PREFIX: "dt" + ':',
            OBJECT: "obj",
            OBJECT_PREFIX: "obj" + ':',
            ARRAY: "array",
            ARRAY_PREFIX: "array" + ':',

            // Some graphic types.
            IMAGE: "img",
            ICON: "icon",

            // Usually for columns that are synthetic--don't directly map to a
            // raw data item. See the SYNTHETIC content type, for example.
            OTHER_TYPE: "other",

            // What follows here are "contentType" constants. The "type" constants
            // defined above are like subcategories of the contentType. Perhaps
            // "type" should have been called "underlyingDataType". Also, most of the
            // types defined above are for the TEXT content type.

            // The types of content we can display in a cell. The most common is
            // TEXT, where the underlying data type--number, string, date, etc.--is
            // just rendered as text in the cell.
            TEXT: "text",

            // A cell that does not map to a metadata item. A cell that shows operation
            // icons is an example.
            SYNTHETIC: "synthetic",

            // Content types.
            SPARKLINE: "sparkline",
                // Types of sparkline charts.
                // A typical graph, like a stock market ticker
                GRAPH: "graph",
                // A partially filled box with text percent indicator.
                PERCENT_BOX: "percent",
            // A cell that shows a checkbox, usually the first cell in the row
            // and used to select the row.
            SELECTION: 'selection',
            // The selection column appears on the left or right.
            LEFT_SELECTION: 'left',
            RIGHT_SELECTION: 'right',
            // The cell shows a graphic, typically one that shows the data in a
            // transformed manner; for example, a sparkline chart of an array of data,
            // a percent-complete bar (box that is partially filled in) or an icon
            // (icon derived from the data's value, like "active", "paused" or "deleted".)
            GRAPHIC: "graphic",

            // Alignment of text in cells
            ALIGN_LEFT: "left",
            ALIGN_CENTER: "center",
            ALIGN_RIGHT: "right",

            // Typical sort options
            SORT_ASCENDING: "asc",
            SORT_DESCENDING: "desc",
            SORT_NONE: "none" // No sort.
        };

        // Add constants that are used throughout the grid code.
    angular.module( "ngCoral" ).constant(  "CuiGridConstants", constants );
}());
