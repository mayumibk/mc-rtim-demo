"use strict";
/**
 * Utilities that support the grid control but are not necessarily part
 * of a specific directive or feature.
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils, ColumnMetadata, ColumnLayoutData, ColumnsConfiguration;

    // Just to make the config ID unique.
    var idCounter = 0;

    var GridUtilitiesFactory =
        /**
         * Define the individual utility methods. They are then returned as
         * this factory's API.
         */
        function ( utilitiesFactory, gridSupportClassesFactory ) {

            utils = utilitiesFactory;
            ColumnMetadata = gridSupportClassesFactory.ColumnMetadata;
            ColumnLayoutData = gridSupportClassesFactory.ColumnLayoutData;
            ColumnsConfiguration = gridSupportClassesFactory.ColumnsConfiguration;

            var generateSimpleGridConfig =
                /**
                 * The user is creating the simplest form of grid using
                 * an array of row vales and optionally column labels. This
                 * function updates the grid's config object's columns.metadata and
                 * columns.layout attributes.
                 *
                 * The idea is to remove as much responsibility from the user as possible.
                 * If the user does not supply any columns then we'll create the metadata
                 * and layout data using generated names. However, the grid will not show
                 * a column labels row.
                 * @param config An object in the scope that is used as the configuration
                 *              object for the grid.
                 * @param columns An optional array of column data. Each element in the
                 *              array defines one column. This value can be either a string
                 *              (interpreted as the column name) or an array of two elements:
                 *              [ column-name, format ]. Here format is the formatting we
                 *              use in localizationModule.js. If columns is null or empty
                 *              then the data attribute must not be null or empty. This case
                 *              would occur when a "headless" grid is being displayed.
                 * @param data If the user does not provide column format information then
                 *              we'll look at the first row of data and attempt to determine
                 *              the data type. At this time the choices are just string,
                 *              number and date. We infer the latter if the column's value
                 *              is a number and when used with Date( value ) yields a date
                 *              within the 20th or 21st century. data should be an array of
                 *              data values--usually for the first row but can be for any row.
                 * @return The config object. If the caller did not provide one then we'll
                 *              create one. Otherwise, the supplied object is returned.
                 */
                function (config, columns, data) {
                    var returnVal = config;

                    // Make sure the config has a "columns" attribute. We also initialize
                    // the config if needed.
                    if (!! returnVal) {
                        if (typeof returnVal.columns === "undefined") {
                            config.columns = {};
                        }
                    } else {
                        // Create a default config for the caller.
                        returnVal = {
                            grid: {
                                id: "simpleGrid" + (++idCounter)
                            },
                            columns: {},

                            // No labels area unless the user gave us column names.
                            labels: !! columns ? { includeSummaryRow: false } : null,
                            header: null,
                            body: null,
                            footer: null
                        };
                    }


                    // Generate metadata and layout data for each column. If we were given
                    // columns data then use that array to determine the number of rows. If
                    // columns is null or undefined then use the first row of the data argument
                    // to determine the number of columns.
                    var columnMetadata = [],
                        columnLayoutData = [],
                        columnsItem, columnName, columnId, format,
                        i;

                    var width;
                    if (utils.hasContents( columns )) {
                        width = Math.floor( 100 / columns.length ) + '%';
                        for (i = 0; i < columns.length; i++) {
                            columnsItem = columns[i];
                            if (typeof columnsItem === "string") {
                                columnName = columnsItem;
                                // Figure out the column's type by looking at the corresponding value in
                                // the first row of data.
                                if (!! data && (typeof data[i] !== "undefined")) {
                                    format = getColumnTypeFromValue( data[i] );
                                } else {
                                    format = "text";
                                }
                            } else {
                                columnName = columnsItem[0];
                                format = columnsItem[1];
                            }

                            columnId = "column" + i;
                            columnMetadata.push(
                                new ColumnMetadata(
                                    {
                                        name: columnId,
                                        label: columnName,
                                        type: format,
                                        width: width,
                                        visible: true
                                    }, i
                                )
                            );
                            columnLayoutData.push( new ColumnLayoutData( { name: columnId } ) );
                        }
                    } else {
                        // The user did not provide any column labels so we won't show the label area.
                        // However, we'll still generate column metadata and layout data, which is required.
                        width = Math.floor( 100 / data.length ) + '%';
                        for (i = 0; i < data.length; i++) {
                            columnId = "column" + i;
                            columnMetadata.push(
                                new ColumnMetadata(
                                    {
                                        name: columnId,
                                        type: getColumnTypeFromValue( data[i] ),
                                        width: width,
                                        visible: true
                                    }, i
                                )
                            );
                            columnLayoutData.push( new ColumnLayoutData( { name: columnId } ) );
                        }
                    }

                    // Update the config.
                    returnVal.columns.metadata = columnMetadata;
                    returnVal.columns.layout = new ColumnsConfiguration( columnLayoutData );

                    return returnVal;
                },

                getColumnTypeFromValue =
                    /**
                     * Given a column value infer the column type--number, string, date, etc.
                     * @param value
                     * @return column type, using the terminology from localizationModule.js
                     */
                    function (value) {
                        var columnType = "str",
                            valueType = typeof value;

                        if (valueType === "number") {
                            // Float or integer? See if we can tell.
                            columnType = value === Math.floor( value ) ? "int" : "flt";
                        } else if (value instanceof Date) {
                            columnType = "date";
                        }

                        return columnType;
                    };
            return {
                generateSimpleGridConfig: generateSimpleGridConfig
            };
        };

    // Add this to the grid module as a value.
    angular.module( "ngCoral" )
        .factory(
            "CuiGridUtilities",
            ["UtilitiesFactory", "CuiGridSupportClassesFactory", GridUtilitiesFactory]
        );

}());
