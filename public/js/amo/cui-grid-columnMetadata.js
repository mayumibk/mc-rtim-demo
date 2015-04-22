"use strict";
/**
 * A class that wraps the metadata for a single column. This
 * metadata is retrieved from the server via the report POST request.
 * Created by kmonahan on 1/8/15.
 */

(function() {
    var utils, localization, CONSTANTS;

    var defaultLocalizers = {
        text: function( value ) { return value; },
        number: function( value ) { return value; },
        currency: function( value ) { return value; },
        date: function( value ) { return (!! value && (value instanceof Date)) ? value.toLocaleString() : ""; },
        time: function( value ) { return (!! value && (value instanceof Date)) ? value.toLocaleString() : ""; },
        dateTime: function( value ) { return (!! value && (value instanceof Date)) ? (value.toLocaleString() + " " + value.toLocaleString()) : ""; },
        phrase: function( value ) { return value; },
        localize: function( value ) { return value; }
    };

    var getLocalizer =
        /**
         * Returns a localizer. If we were given one then return it.
         * Otherwise return a simple function that just returns whatever
         * data is passed to it.
         * @param localizer
         * @returns {*}
         */
        function( localizer ) {
            return !! localizer ? localizer : defaultLocalizers;
        };

    /**
     * Information about a column of data--name, data type, etc. This
     * is information we receive from the server when we request data.
     * This class works with the ColumnConfig class. The latter defines
     * how and where a column appears in an actual grid--position, current
     * size, etc.
     * @param metadata A hashmap with key/value pairs for the items.
     *                  Setter/getter methods are also available.
     * @constructor
     */
    var ColumnMetadataFactory =
        (function() {
            // In every case we use closure to define the position of this column
            // within the data rows. This is defined in "position".

            var stringFormatter =
                    function( localizer ) {
                        var localizerToUse = getLocalizer( localizer );

                        return function( data ) {
                            var value = utils.getNonNullValue( data, "-" );
                            if (typeof value !== "string") {
                                value += '';
                            }
                            //return "<div class='no-overflow' title='" + value.replace( /'/g, "&#39;" ) + "'>" + localizerToUse.text( value ) + "</div>" ;
                            return localizerToUse.text( value );
                        };
                    },
                numberFormatter =
                    function( localizer, type, decimalFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        var numDecimals;
                        if (!! decimalFormat) {
                            numDecimals = parseInt(decimalFormat);
                            if (isNaN( numDecimals )) {
                                if (type === "int") {
                                    AMO.log.error( "Invalid int number format specification in the column metadata: " + decimalFormat + ". Using 0." );
                                    numDecimals = 0;
                                } else {
                                    AMO.log.error( "Invalid float number format specification in the column metadata: " + decimalFormat + ". Using 2." );
                                    numDecimals = 2;
                                }
                            }
                        } else {
                            numDecimals = type === "int" ? 0 : 2;
                        }
                        return function( value ) {
                            if (value instanceof Number) {
                                return localizerToUse.number( value, numDecimals );
                            } else {
                                var parsedValue = parseFloat(value);
                                return isNaN( parsedValue ) ? (value !== null ? value : "-") : localizerToUse.number( value, numDecimals );
                            }
                        };
                    },
                percentFormatter =
                    function( localizer, decimalFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        var numDecimals;
                        if (!! decimalFormat) {
                            numDecimals = parseInt(decimalFormat);
                            if (isNaN( numDecimals )) {
                                numDecimals = 0;
                            }
                        } else {
                            numDecimals = 0;
                        }
                        return function( value ) {
                            if (value instanceof Number) {
                                return localizerToUse.number( value, numDecimals ) + "%";
                            } else {
                                var parsedValue = parseFloat(value);
                                if (isNaN( parsedValue )) {
                                    return value !== null ? value : "-";
                                } else {
                                    value = localizerToUse.number(parsedValue, numDecimals);
                                    return !!value ? (value + '%') : "-";
                                }
                            }
                        };
                    },
                idFormatter =
                    function( localizer ) {
                        return function( data ) {
                            return data;
                        };
                    },
                currencyFormatter =
                    function( localizer, decimalFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        var numDecimals;
                        if (!! decimalFormat) {
                            numDecimals = parseInt(decimalFormat);
                            if (isNaN( numDecimals )) {
                                AMO.log.error( "Invalid currency number format specification in the column metadata: " + numDecimals + ". Using 0." );
                                numDecimals = 0;
                            }
                        } else {
                            numDecimals = 0;
                        }
                        return function( value ) {
                            if (value instanceof Number) {
                                return localizerToUse.currency( value, numDecimals );
                            } else {
                                var parsedValue = parseFloat(value);
                                return isNaN( parsedValue ) ? (value !== null ? value : "-") : localizerToUse.currency( value, numDecimals );
                            }
                        };
                    },
                dateFormatter =
                    function( localizer, selectedFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        return function( date ) {
                            if (date instanceof Date) {
                                return localizerToUse.date(date, selectedFormat);
                            } else {
                                return date !== null ? date.toString() : "-";
                            }
                        };
                    },
                timeFormatter =
                    function( localizer, selectedFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        return function( date ) {
                            if (date instanceof Date) {
                                return localizerToUse.time(date, selectedFormat);
                            } else {
                                return date !== null ? date.toString() : "-";
                            }
                        };
                    },
                dateTimeFormatter =
                    function( localizer, selectedFormat ) {
                        var localizerToUse = getLocalizer( localizer );
                        var separatedOptions = selectedFormat.split( "," );
                        if (separatedOptions.length === 1) {
                            AMO.log.error( "Invalid date/time formatting options, two format values are required: " + selectedFormat + ". Time formatting will default to \"medium\"." );
                            separatedOptions.push( "medium" );
                        } else if (separatedOptions.length > 2) {
                            AMO.log.error( "More than two date/time formatting options were provided: " + selectedFormat + ". Date/time formatting will default to \"tiny,medium\"." );
                            separatedOptions = [ "tiny", "medium" ];
                        }
                        var selectedDateFormat = separatedOptions[0];
                        var selectedTimeFormat = separatedOptions[1];
                        return function( date ) {
                            if (date instanceof Date) {
                                return localizerToUse.dateTime(date, selectedDateFormat, selectedTimeFormat);
                            } else {
                                return date !== null ? date.toString() : "-";
                            }
                        };
                    },
                selectionFormatter =
                    function() {
                        return "<cui-checkbox></cui-checkbox>";
                    },
                nullFormatter =
                    function( type ) {
                        var string = "(" + type + ")";
                        return function() {
                            return string;
                        };
                    };

            var curryFormatter =
                /**
                 * Returns a function that will format the specific type of
                 * data represented by this column.
                 * @param type The type of data shown in the column; for example, "number" or "date"
                 * @param columnMetadata.getFormatOption() An optional format specification; for example, more6
                 *                      decimals in a float or a more complete date/time specification.
                 */
                function( type, columnMetadata, formatOption ) {

                    // The format options can be supplied in the call to curryFormatter or
                    // they can be retrieved from the column metadata. If not in the parameter
                    // then the metadata setting is used. If the latter does not exist then a
                    // default is used.

                    // Format option can be null/undefined, a string/number/etc or a function.
                    // In the latter case we will use the result of the function.
                    var format = typeof formatOption !== "undefined" ? formatOption : columnMetadata.getFormatOption();
                    var localizer = columnMetadata.getLocalizer();

                    // Normally we return a built-in formatter that knows how to format a specific
                    // data type, like dates or currencies. However, we also allow the caller to provide
                    // a function that will be called--a formatting callback. This function can then do
                    // anything it wants, short of inserting malicious code, I guess. The idea is that
                    // this function can insert really custom HTML, possibly including Angular directives.
                    if (typeof format === "function") {
                        return format;
                    } else {
                        if ((type === CONSTANTS.STRING) || (type.indexOf( CONSTANTS.STRING_PREFIX ) === 0)) {
                            return stringFormatter( localizer );
                        } else if ((type === CONSTANTS.INTEGER) || (type.indexOf( CONSTANTS.INTEGER_PREFIX ) === 0)) {
                            return numberFormatter( localizer, CONSTANTS.INTEGER, utils.getNonNullValue( format, 0 ) );
                        } else if ((type === CONSTANTS.PERCENT) || (type.indexOf( CONSTANTS.PERCENT_PREFIX ) === 0)) {
                            return percentFormatter( localizer, utils.getNonNullValue( format, 0 ) );
                        } else if ((type === CONSTANTS.ID) || (type.indexOf( CONSTANTS.ID_PREFIX ) === 0)) {
                            return idFormatter( localizer );
                        } else if ((type === CONSTANTS.FLOAT) || (type.indexOf( CONSTANTS.FLOAT_PREFIX ) === 0)) {
                            return numberFormatter( localizer, CONSTANTS.FLOAT, utils.getNonNullValue( format, 2 ) );
                        } else if ((type === CONSTANTS.CURRENCY) || (type.indexOf( CONSTANTS.CURRENCY_PREFIX ) === 0)) {
                            return currencyFormatter( localizer, utils.getNonNullValue( format, 2 ) );
                        } else if ((type === CONSTANTS.DATE) || (type.indexOf( CONSTANTS.DATE_PREFIX ) === 0)) {
                            return dateFormatter( localizer, utils.getNonNullValue( format, "tiny" ) );
                        } else if ((type === CONSTANTS.TIME) || (type.indexOf( CONSTANTS.TIME_PREFIX ) === 0)) {
                            return timeFormatter( localizer, utils.getNonNullValue( format, "medium" ) );
                        } else if ((type === CONSTANTS.DATE_TIME) || (type.indexOf( CONSTANTS.DATE_TIME_PREFIX ) === 0)) {
                            return dateTimeFormatter( localizer, utils.getNonNullValue( format, "tiny,medium" ) );
                        } else if (type === CONSTANTS.SELECTION) {
                            return selectionFormatter;
                        } else if ((type === CONSTANTS.OBJECT) || (type.indexOf( CONSTANTS.OBJECT ) === 0)) {
                            return stringFormatter( localizer );
                        } else {
                            AMO.log.debug( "curryFormatter: unexpected type = " + type );
                            return nullFormatter( type );
                        }
                    }
                };

            var ColumnMetadataConstructor =
                function( metadata, position, localizer ) {
                    // The unique identifier of this column in the server environment.
                    // Often a table column name.
                    this.name = metadata.name;

                    // Determines how to format a data value in a grid cell. Current
                    // options are defined above, STRING, INTEGER, etc. We also now support
                    // OBJECT for data items that are not primitive items or semi-complex
                    // items like dates that are represented as primitives (numbers.)
                    // NOTE THAT THIS IS DIFFERENT from the ColumnLayoutData class'
                    // type attribute. That attribute distinguishes between actual TEXT
                    // (values in the row) and other types of representations of the data.
                    this.type = !! metadata.type ? metadata.type : CONSTANTS.STRING;

                    // When hidden we don't include this column in the grid. This is typically
                    // used for control columns (IDs, etc.) and columns that the user has
                    // specifically hidden/chosen to not view. Note that the ReportService
                    // reports this as a "hidden" attribute.
                    this.visible = typeof metadata.visible !== "undefined" ? metadata.visible : true;

                    // The text we display in the column header.
                    this.label = !! metadata.label ? metadata.label : "";

                    // The position of this column's data in the row's data array.
                    // if -1 then the column has no data (typically a control column.)
                    this.position = position;

                    // The width of column to use. If a value is supplied then we
                    // will use the width. If a value is not supplied then we'll
                    // let the column autosizing logic select a width--often as
                    // a percent of the grid's width.
                    this.width = !! metadata.width ? metadata.width : null;

                    // The hash that defines the metadata for the column can contain formatting
                    // options--# decimals for numbers, date or time formatting options, etc.
                    this.formatOptions = utils.getNonNullValue( metadata.format, null );

                    // Curry a formatter for this type so that individual
                    // cells can just call cmd.format( data ); This is creating the default
                    // version of the formatter--no format options are supplied. Note that
                    // curryFormatter is also called by regenerateFormatFunction, which can
                    // be called by external code that wants a more specific format--e.g.,
                    // a specific number of digits after the decimal point.
                    // If localizer is null then see if we have a current localizer installed.
                    // We should always at least have en_US.
                    this.localizer = !! localizer ? localizer : localization;
                    this.formatter = curryFormatter( this.type, this, this.formatOptions );

                    /*
                        Values seen from the server:
                     annotation: Object
                     @reference: "../../com.efrontier.common.modules.reports.to.Column[20]/annotation"
                     __proto__: Object
                     blankable: false
                     category: "METRIC"
                     compareType: "PERCENTAGE_CHANGE"
                     customLabel: "Cost Difference(%)"
                     editable: false
                     hidden: false
                     isDefaut: false
                     label: "Cost Diff(%)"
                     name: "cost Difference(%)"
                     parentLabel: "Cost"
                     parentName: "cost"
                     postgresOnly: false
                     preset: 0
                     replaceable: false
                     required: false
                     revenueOrder: -1
                     type: "PERCENTAGE"
                     */
                };
            ColumnMetadataConstructor.prototype.getFromData =
                /**
                 * A data row does not always have data for the entire set of columns.
                 * This method will return the data for the indicated column position
                 * if the data array is long enough. Otherwise it will return the
                 * missingDataValue.
                 * @param data The row's data, an array
                 * @param position The position of the column's data in this array
                 * @param missingDataValue What to return if the row does not have enough data
                 * @return The value at data[position] if it exists, defaultValue if it doesn't.
                 */
                function( data, missingDataValue ) {
                    return this.position < data.length ? data[this.position] : missingDataValue;
                };

            ColumnMetadataConstructor.prototype.setPosition = function( position ) { this.position = position; };
            ColumnMetadataConstructor.prototype.getPosition = function() { return this.position; };
            ColumnMetadataConstructor.prototype.getName = function() { return this.name; };
            ColumnMetadataConstructor.prototype.getType = function() { return this.type; };
            ColumnMetadataConstructor.prototype.getLabel = function() { return this.label; };
            ColumnMetadataConstructor.prototype.setVisible = function( visible ) { this.visible = visible; };
            ColumnMetadataConstructor.prototype.isVisible = function() { return this.visible; };
            ColumnMetadataConstructor.prototype.setWidth = function( width ) { this.width = width; };
            ColumnMetadataConstructor.prototype.getWidth = function() { return this.width; };
            ColumnMetadataConstructor.prototype.getFormatOption = function() { return this.formatOptions; };
            ColumnMetadataConstructor.prototype.setFormatter = function( formatter ) { this.formatter = formatter; };
            ColumnMetadataConstructor.prototype.getFormatter = function() { return this.formatter; };
            ColumnMetadataConstructor.prototype.getLocalizer = function() { return this.localizer; };

            ColumnMetadataConstructor.prototype.getDefaultAlignment =
                function() {
                    var localType = this.type;
                    if (
                        (localType === CONSTANTS.STRING) || (localType.indexOf( CONSTANTS.STRING_PREFIX ) === 0) ||
                        (localType === CONSTANTS.DATE) || (localType.indexOf( CONSTANTS.DATE_PREFIX ) === 0) ||
                        (localType === CONSTANTS.TIME) || (localType.indexOf( CONSTANTS.TIME_PREFIX ) === 0) ||
                        (localType === CONSTANTS.DATE_TIME) || (localType.indexOf( CONSTANTS.DATE_TIME_PREFIX ) === 0)
                        ) {
                        return CONSTANTS.ALIGN_LEFT;
                    } else if (
                        (localType === CONSTANTS.INTEGER) || (localType.indexOf( CONSTANTS.INTEGER_PREFIX ) === 0) ||
                        (localType === CONSTANTS.FLOAT) || (localType.indexOf( CONSTANTS.FLOAT_PREFIX ) === 0) ||
                        (localType === CONSTANTS.CURRENCY) || (localType.indexOf( CONSTANTS.CURRENCY_PREFIX ) === 0)
                        ) {
                        return CONSTANTS.ALIGN_RIGHT;
                    } else {
                        return CONSTANTS.ALIGN_CENTER;
                    }
                };

            ColumnMetadataConstructor.prototype.regenerateFormatFunction =
                /**
                 * Use this function to recreate this metadata instance's formatting
                 * function. We typically use this when the column layout specification
                 * also contains format info. This would be when the user has changed how
                 * a specific column should be displayed.
                 * @param type The type of data that is being rendered.
                 * @param formatOption An optional format string that can be
                 *              supplied in the ConfigurationLayoutData option. This string
                 *              overloads the format string found in the metadata object.
                 */
                function( type, columnMetadata, formatOption ) {
                    return curryFormatter( type, columnMetadata, formatOption );
                };

            return function( utilitiesFactory, localizationFactory, cuiGridConstants ) {
                    utils = utilitiesFactory;
                    localization = localizationFactory;
                    CONSTANTS = cuiGridConstants;

                    return ColumnMetadataConstructor;
                };
        }());

    // Add this to the grid module as a value.
    angular.module( "ngCoral" )
        .factory(
            "ColumnMetadata",
            [ "UtilitiesFactory", "LocalizationFactory", "CuiGridConstants", ColumnMetadataFactory ]
        );

}());
