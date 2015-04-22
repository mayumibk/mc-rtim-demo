"use strict";
/**
 * A class that wraps the config info we need to draw a specific
 * column. This object also includes a reference to a ColumnMetadata
 * instance.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {

    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils, CONSTANTS, ColumnMetadata;

    var ColumnLayoutDataFactory =
        /**
         * Defines how a single column is configured in the layout. For now just width
         * and sort option.
         */
        (function() {

            var ColumnLayoutDataConstructor =
                /**
                 * Our constructor. We can create a new instance from either a hash that
                 * contains data like id or width or we can create one from a ColumnMetadata instance.
                 * @param options This can be either an instance of ColumnMetadata or a simple hash.
                 *                  We don't have direct access to this
                 * @constructor
                 */
                function( options ) {
                    // Note that we accept either
                    if (options instanceof ColumnMetadata) {
                        // The metadata describes the row's array of data and is always DATA,
                        // in the ColumnLayoutData's sense of type. For example, metadata would
                        // never have a "row selection cell" column.
                        this.contentType = CONSTANTS.TEXT;
                        this.type = options.getType();
                        this.name = options.getName();
                        this.width = options.getWidth();
                        this.minWidth = null;
                        this.maxWidth = null;
                        this.sortDirection = CONSTANTS.SORT_NONE;
                        this.alignment = options.getDefaultAlignment();
                    } else {
                        // We have regular data columns and special columns like the
                        // checkbox selector column and a hidden column that contains
                        // the offset into the source data for the data displayed in this row.
                        // The name of the column. This is the internal name, a unique identifier
                        // of the column. We can use this value to get the column's metadata.
                        this.name = options.name;

                        // The type of this cell. We mainly use this to identify cells that have
                        // special use or formatting: the checkbox selection cell or the hidden
                        // cell that contains the offset into the source data for the data in the row.
                        // Note that this is the displayed cell's type. The type of the underlying
                        // row is different.
                        this.contentType = utils.getNonNullValue( options.contentType, CONSTANTS.TEXT );
                        this.sortDirection = utils.getNonNullValue( options.sortDirection, ColumnLayoutDataFactory.SORT_NONE );

                        // When we load the column layout data (when the grid starts) we'll
                        // adjust a "null" value here to the type provided by the matching metadata.
                        // The default value gets used--did you perhaps forget to define a type key
                        // in your argument object?
                        this.type = utils.getNonNullValue( options.type, this.contentType === CONSTANTS.SYNTHETIC ? CONSTANTS.OTHER_TYPE : null );

                        // The width, in pixels, of this column. This attribute defaults to some
                        // value but can be changed by the user; e.g., by dragging the width control
                        // of the column to increase or decrease the column. A null value indicates
                        // that the displayed width should be retrieved from the column meta data.
                        // These values should be persisted somewhere...
                        this.width = null;
                        if (typeof options.width !== "undefined") {
                            this.width = options.width;
                        } else if (this.contentType !== CONSTANTS.TEXT) {
                            if (options.contentType === CONSTANTS.SELECTION) {
                                this.width = 35;
                            }
                        }

                        // The actual column width will be this.width or a width that is calculated
                        // by the grid's column autosizing logic. We may still want to control the
                        // range of widths--not too narrow, not too wide.
                        this.minWidth = !! options.minWidth ? options.minWidth : null;
                        this.maxWidth = !! options.maxWidth ? options.maxWidth : null;

                        // Calculated later on by the body directive. This is the width we'll actually
                        // assign to cells. Can be either a percentage or a pixel value.
                        this.renderWidth = null;

                        // Left/center/right
                        this.alignment = utils.getNonNullValue( options.alignment, null );
                        // An override to the format spec in the metadata. This use of the column might
                        // want fewer decimal places, for example.
                        this.format = utils.getNonNullValue( options.format, null );
                        // When the underlying data is not a primitive we use this to extract data from it.
                        // For example, the data may be an object. value would be an attribute name (or
                        // dotted sequence) that is used to extract the desired attribute. Can also be a function.
                        this.value = utils.getNonNullValue( options.value, null );

                        // The column layout data can override what goes into the label cell.
                        this.label = utils.getNonNullValue( options.label );
                    }

                    // Set reasonable values for min and max width.
/*
                    var type = this.type;
                    if (this.minWidth === null) {
                        // Determine the min width from the column's data type.
                        if (type === CONSTANTS.STRING) {
                            this.minWidth = "100px";
                        } else if (
                            (type === CONSTANTS.INTEGER) || (type === CONSTANTS.PERCENT) ||
                            (type === CONSTANTS.FLOAT) || (type === CONSTANTS.CURRENCY)
                        ) {
                            this.minWidth = "36px";
                        } else if ((type === CONSTANTS.DATE) || (type === CONSTANTS.TIME) || (type === CONSTANTS.DATE_TIME)) {
                            this.minWidth = "72px";
                        } else if (this.contentType === CONSTANTS.SELECTION) {
                            this.minWidth = "22px";
                        } else {
                            this.minWidth = "100px";
                        }
                    }
                    if (this.maxWidth === null) {
                        // Determine the min width from the column's data type.
                        if (type === CONSTANTS.STRING) {
                            this.maxWidth = "300px";
                        } else if (
                            (type === CONSTANTS.INTEGER) || (type === CONSTANTS.PERCENT) ||
                            (type === CONSTANTS.FLOAT) || (type === CONSTANTS.CURRENCY)
                        ) {
                            this.maxWidth = "72px";
                        } else if ((type === CONSTANTS.DATE) || (type === CONSTANTS.TIME) || (type === CONSTANTS.DATE_TIME)) {
                            this.maxWidth = "128px";
                        } else if (this.contentType === CONSTANTS.SELECTION) {
                            this.maxWidth = "22px";
                        } else {
                            this.maxWidth = "300px";
                        }
                    }
*/
                    // The position of this column in the grid, starting with 0 for the left-most
                    // column. We set the actual value when we start drawing the table.
                    this.position = null;

                    // We defer formatting to the metadata. However, the underlying data object
                    // and the metadata that describes that object in the row's data, might be
                    // a structured object, not a simple primitive value. So we might be pulling
                    // a specific value, with a specific data type, from the structured object.
                    // And we would need a way to format it. We store updated formatters locally
                    // here in the column layout data. This is especially necessary if two columns
                    // reference the same data object (typically a structured object) but use
                    // different attributes of the object. Each column could have a separate
                    // way of formatting the data.
                    this.formatter = null;
                };

            // Getter/setters.
            ColumnLayoutDataConstructor.prototype.getName = function() { return this.name; };

            ColumnLayoutDataConstructor.prototype.getType = function() { return this.type; };
            ColumnLayoutDataConstructor.prototype.setType = function( type ) { this.type = type; return this; };

            ColumnLayoutDataConstructor.prototype.getContentType = function() { return this.contentType; };
            ColumnLayoutDataConstructor.prototype.setContentType = function( contentType ) { this.contentType = contentType; return this; };

            ColumnLayoutDataConstructor.prototype.getPosition = function() { return this.position; };
            ColumnLayoutDataConstructor.prototype.setPosition = function( position ) { this.position = position; return this; };

            ColumnLayoutDataConstructor.prototype.getMetadata = function() { return this.metadata; };
            ColumnLayoutDataConstructor.prototype.setMetadata = function( metadata ) { this.metadata = metadata; return this; };

            ColumnLayoutDataConstructor.prototype.getWidth = function() { return this.width; };
            ColumnLayoutDataConstructor.prototype.setWidth = function( width ) { this.width = width; return this; };

            ColumnLayoutDataConstructor.prototype.getMinWidth = function() { return this.minWidth; };
            ColumnLayoutDataConstructor.prototype.setMinWidth = function( minWidth ) {
                this.previousMinWidth = this.minWidth;
                this.minWidth = minWidth;
                return this;
            };
            ColumnLayoutDataConstructor.prototype.hasMinWidthChanged = function() { return this.previousMinWidth !== this.minWidth; };

            ColumnLayoutDataConstructor.prototype.getMaxWidth = function() { return this.maxWidth; };
            ColumnLayoutDataConstructor.prototype.setMaxWidth = function( maxWidth ) { this.maxWidth = maxWidth; return this; };

            ColumnLayoutDataConstructor.prototype.getRenderWidth = function() { return this.renderWidth; };
            ColumnLayoutDataConstructor.prototype.setRenderWidth = function( renderWidth ) {
                this.previousRenderWidth = this.renderWidth;
                this.renderWidth = renderWidth;
                return this;
            };
            ColumnLayoutDataConstructor.prototype.hasRenderWidthChanged = function() {
                return (this.previousRenderWidth !== this.renderWidth) || utils.isEmpty( this.renderWidth );
            };

            ColumnLayoutDataConstructor.prototype.getSortDirection = function() { return this.sortDirection; };
            ColumnLayoutDataConstructor.prototype.setSortDirection = function( sortDirection ) { this.sortDirection = sortDirection; return this; };

            ColumnLayoutDataConstructor.prototype.getAlignment = function() { return this.alignment; };
            ColumnLayoutDataConstructor.prototype.setAlignment = function( alignment ) { this.alignment = alignment; return this; };

            ColumnLayoutDataConstructor.prototype.getFormat = function() { return this.format; };
            ColumnLayoutDataConstructor.prototype.setFormat = function( format ) { this.format = format; return this; };

            ColumnLayoutDataConstructor.prototype.getFormatter = function() { return this.formatter; };
            ColumnLayoutDataConstructor.prototype.setFormatter = function( formatter ) { this.formatter = formatter; return this; };

            ColumnLayoutDataConstructor.prototype.getLabel =
                /**
                 * The column layout data can sometimes override the default label that is
                 * provided in the metadata.
                 */
                function() {
                    return utils.getNonNullValue(
                        this.label,
                        !! this.metadata ? this.metadata.getLabel() : " "
                    );
                };

            ColumnLayoutDataConstructor.prototype.getData =
                /**
                 * Returns the actual value from the row's array of data. We make use of the metadata's
                 * position attribute to determine where in the row's data array our data is found.
                 * @param rowData An array containing one value for each of our columns. It is possible
                 *              that the array does not contain enough value for all items defined in the
                 *              metadata. In this case we return null.
                 * @param defaultValue Optional. If we can't find the data in the row then we return this value.
                 */
                function( rowData, defaultValue ) {
                    var defaultValue0 = utils.getNonNullValue( defaultValue, null );
                    return !! this.metadata ? this.metadata.getFromData( rowData, defaultValue0 ) : defaultValue0;
                };

            ColumnLayoutDataConstructor.prototype.extractValueFromRowData =
                /**
                 * The data for a row is contained in an array, one value per column.
                 * In general the data values are simple primitives like int, number, string
                 * or date. The raw data can also be an object and we may need to extract an
                 * attribute from that object to display in a given row.
                 * @param rowData An array containing one value for each of our columns. It is possible
                 *              that the array does not contain enough value for all items defined in the
                 *              metadata. In this case we return null.
                 * @param defaultValue Optional. If we can't find the data in the row then we return this value.
                 */
                function( rowData, defaultValue ) {
                    var data = this.getData( rowData, defaultValue );
                    // See if we have any additional instructions for extracting the data value
                    // once we get the raw data.
                    if (utils.hasContents( this.value )) {
                        // Our value extractor can be either a string or a function. If
                        // a string then we assume that it is a dotted attribute string
                        // like foo.bar. We'll then extract data["foo.bar"]. Otherwise
                        // it is a function that we call, passing data.
                        if (typeof this.value === "function") {
                            data = this.value( data );
                        } else if (typeof this.value === "string") {
                            data = data[this.value];
                        }
                    }

                    return data;
                };

            ColumnLayoutDataConstructor.prototype.createSparklineRenderer =
                /**
                 * A formatter that generates a horizontal box (horizontal because
                 * it is usually in a wider grid cell.) The box is filled with a
                 * sparkline. For now, just a horizontal line.
                 * @param completedValue
                 */
                function( completedValue ) {
                    return function( amountCompleted, rowData, metadata, layoutData, scope ) {
                        return "<cui-grid-sparkline-graph></cui-grid-sparkline-graph>";
                    };
                };

            ColumnLayoutDataConstructor.prototype.createPercentCompleteRenderer =
                /**
                 * A formatter that generates a horizontal box (horizontal because
                 * it is usually in a wider grid cell.) The box is filled according
                 * to the percent complete of the task. This is determined by dividing
                 * amountCompleted / completedValue.
                 * @param completedValue
                 */
                function( completedValue ) {
                    return function( amountCompleted, rowData, metadata, layoutData, scope ) {
                        scope.percentComplete = Math.floor( (amountCompleted * 100) / completedValue );
                        return "<cui-grid-sparkline-percent-of sparkline-config='config' percent-complete='percentComplete'></cui-grid-sparkline-percent-of>";
                    };
                };

            ColumnLayoutDataConstructor.prototype.render =
                /**
                 * Converts the data into a displayable format, usually a string. We use the
                 * formatting rules defined in the metadata; e.g., number of decimal digits,
                 * length of a date string, etc. In theory, a ColumnLayoutData item could provide
                 * a special formatting function.
                 * @param cellData The value we render (format)
                 */
                function( cellData, rowData, columnMetadata, columnLayoutData, scope ) {
                    var formattedData = cellData;
                    if (!! this.formatter) {
                        formattedData = this.formatter( cellData, rowData, columnMetadata, columnLayoutData, scope );
                    } else {
                        if (!! this.metadata) {
                            formattedData = this.metadata.getFormatter()( cellData, rowData, columnMetadata, columnLayoutData, scope );
                        }
                    }

                    return formattedData;
                };

            return function( utilitiesFactory, cuiGridConstants, columnMetadata ) {
                utils = utilitiesFactory;
                CONSTANTS = cuiGridConstants;
                ColumnMetadata = columnMetadata;

                return ColumnLayoutDataConstructor;
            };
        }());

    // Add this to the grid module as a value.
    angular.module( "ngCoral" )
        .factory(
            "ColumnLayoutData",
            [ "UtilitiesFactory", "CuiGridConstants", "ColumnMetadata", ColumnLayoutDataFactory ]
        );

}());
