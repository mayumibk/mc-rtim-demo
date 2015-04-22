"use strict";
/**
 * Directives that define a grid row and a cell within a grid row.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils, CONSTANTS;

    angular.module( "ngCoral").directive(
        'cuiGridCell',
        [
            '$compile', 'UtilitiesFactory', 'CuiGridConstants',
            function( $compile, utilitiesFactory, cuiGridConstants ) {
                utils = utilitiesFactory;
                CONSTANTS = cuiGridConstants;

                var link =
                    function( $scope, $element, attrs ) {
                        var cell = $scope.cell(),   // An instance of ColumnLayoutData
                            metadata = cell.getMetadata(),
                            hasMetadata = utils.hasContents( metadata),
                            columnName = hasMetadata ? metadata.getName() : "-",
                            bodyConfig = $scope.cuiConfig(),
                            cellConfig = utils.getAttribute( bodyConfig, "body.row.cell", null),
                            html, customHtml,
                            css = null, customCss,
                            isSelectionCell = cell.getContentType() === CONSTANTS.SELECTION,
                            parentRow = $element.parent( ".cui-Grid--row"),
                            rawData, formattedData = null,

                            // This gets set to the cell.customCss.metadataPosition attibute. This
                            // attribute can contain keys that map to a cell's column's position
                            // within the column metadata. This maps directly to the raw data.
                            metadataPosition = hasMetadata ? metadata.getPosition() : -1,

                            // By contrast with cssMetadataMapping, cssLayoutMapping can contain keys
                            // that map to a cell's actual position within the grid's layout. This is needed
                            // because a cell might be a position m in the data source's row data but at
                            // position n in the layout. This difference can occur because the column has been
                            // repositioned or other "synthetic" columns (columns that don't directly map
                            // to the raw data) have been inserted. The cssLayoutMapping is also the only place
                            // where synthetic columns can be referenced. For example, a column that shows
                            // special icons.
                            layoutPosition = cell.getPosition(),

                            supportData = {
                                // The metadataPosition of this cell's column within the data source's retrieval.
                                // Note that this cell's data is in rowData[metadataPosition].
                                metadataPosition: metadataPosition,
                                layoutPosition: layoutPosition,

                                // Row data and this cell's data.
                                row: $scope.rowData(),
                                cell: utils.hasContents( metadata ) ? $scope.rowData()[metadataPosition] : null,
                                // The cell's data, as formatted for display in the UI. May be different from cell.
                                formattedCell: formattedData,

                                // Cell's metadata
                                cellMetadata: metadata,
                                // jQuery reference to the entire row. The current cell is provided in
                                // the cell callback parameter.
                                rowElement: parentRow,

                                // The values passed to this directive's link function. The cell parameter to
                                // the function is the link function's $element parameter.
                                scope: $scope,
                                attrs: attrs
                            };

                        // todo Might want to move these out of link so it isn't

                        var applyCssFunction =
                            /**
                             * Assemble the required parameters and invoke the function. Return
                             * whatever the function returns.
                             * @param fcn
                             * @param callbackData
                             */
                            function (fcn, callbackData) {
                                return fcn( $element, supportData, callbackData );
                            };

                        var applyCssValueMap =
                            /**
                             * Handles the case where the config item maps specific cell values
                             * to CSS classes.
                             * @param valueMap A way to map individual cell values to CSS definitions An array
                             *              with three elements:
                             *                  [ <value-hash>, <null-callback-def>, <default-callback-def> ]
                             *                      <value-hash>: a hashmap with the form:
                             *                                  { <cell-value>: <callback-def>, <cell-value>: <callback-def>, ... }
                             *                                      <cell-value>: a value that the cell can have; for example, a status
                             *                                                      column might have the values "active", "paused"
                             *                                                      and "deleted". <cell-value> is one of these values.
                             *                      <null-callback-def>: The CSS definition to use if the cell's value is null or undefined.
                             *                                           Can be null.
                             *                      <default-callback-def>: if the current value of a cell does not match any of the
                             *                                              <cell-value> keys then this CSS definition is used.
                             */
                            function (valueMap) {
                                var cellValue = supportData.cell;

                               if (utils.hasContents( cellValue )) {
                                   // See if this cell value is represented in the value hash. If not then use
                                   // the CSS definition provided in the [2] element.
                                   var valueKey;
                                   // We want our key to be a string, even if the cell's value is not one.
                                   if (typeof cellValue === "string") {
                                       valueKey = cellValue;
                                   } else if (typeof cellValue === "number") {
                                       valueKey = cellValue + '';
                                   } else {
                                       valueKey = cellValue.toString();
                                   }
                                   var valueCssDef = valueMap[0][valueKey];

                                   return applyCss( !! valueCssDef ? valueCssDef : valueMap[2] );
                               } else {
                                   // The cell's current value is either null or undefined so return the CSS
                                   // definition for that value.
                                   return applyCss( valueMap[1] );
                               }
                            };

                        var applyCssMap =
                            /**
                             * The config is a hashmap that contains keys for selected columns, identified
                             * by either name/id (e.g., "campaignName" or metadataPosition in the data source's
                             * row data.
                             * @param customCss
                             */
                            function (customCss) {
                                var builder = new utils.StringBuilder();

                                var generatedCss;
                                // First look for a key using the column name.
                                var cssDef = customCss[columnName];
                                if (!! cssDef) {
                                    generatedCss = applyCss( cssDef );
                                    if (utils.hasContents( generatedCss )) {
                                        builder.append( generatedCss );
                                    }
                                }
                                // Now try using the column metadataPosition.
                                cssDef = customCss[metadataPosition + ''];
                                if (!! cssDef) {
                                    generatedCss = applyCss( cssDef );
                                    if (utils.hasContents( generatedCss )) {
                                        builder.append( generatedCss );
                                    }
                                }
                                // Ditto for the cell's position in the layout. This takes into account
                                // rearrangement of the columns and use of synthetic columns that are not
                                // directly tied to columns in the raw data. For this we
                                cssDef = customCss['+' + layoutPosition];
                                if (!! cssDef) {
                                    generatedCss = applyCss( cssDef );
                                    if (utils.hasContents( generatedCss )) {
                                        builder.append( generatedCss );
                                    }
                                }
                                // And finally the default value.
                                cssDef = customCss["*"];
                                if (!! cssDef) {
                                    generatedCss = applyCss( cssDef );
                                    if (utils.hasContents( generatedCss )) {
                                        builder.append( generatedCss );
                                    }
                                }

                                return builder.hasAppends() ? builder.toString( " " ) : "";
                            };

                        var applyCss =
                            /**
                             * Parse the supplied CSS and return a CSS string or null if no CSS should be applied.
                             * The config values for body.row.css.customCss are documented in cui-grid-config-docs.js
                             * @param customCss
                             */
                            function( customCss ) {
                                var builder = new utils.StringBuilder();

                                if (utils.hasContents( customCss )) {
                                    var generatedCss = null;
                                    var configType = typeof customCss;
                                    if (configType === "string") {
                                        // The simplest form--just a string that contains a space-separated list
                                        // of CSS classes to apply to the element.
                                        generatedCss = customCss;
                                    } else if (configType === "function") {
                                        // A simple function. We call this function and return the results.
                                        generatedCss = applyCssFunction( customCss, null );
                                    } else if (Array.isArray( customCss )) {
                                        // We support two array forms. The first contains a function and an
                                        // optional callbackData value. The second contains three elements
                                        // and provides a value map. This map lets us map CSS to specific
                                        // values in the cell.
                                        if (typeof customCss[0] === "function") {
                                            generatedCss = applyCssFunction( customCss[0], customCss[1] );
                                        } else {
                                            generatedCss = applyCssValueMap( customCss );
                                        }
                                    } else {
                                        // The final choice--the config is a hashmap. We get the entry
                                        // that corresponds to the current column name or metadataPosition.
                                        generatedCss = applyCssMap( customCss );
                                    }

                                    if (utils.hasContents( generatedCss )) {
                                        builder.append( generatedCss );
                                    }
                                }

                                return builder.hasAppends() ? builder.toString( " " ) : "";
                            };

                        $element.addClass( "cui-Grid--rowCell" );
                        $element.addClass( "cui-Grid--cellWrapper" );
//                        $element.addClass( "coral-Table-cell" );
                        // Style the cell for width and add our standard class.
                        $element.css( "width", cell.getWidth() );

                        if (! isSelectionCell) {
                            var rowData = $scope.rowData();
                            rawData = cell.extractValueFromRowData( rowData, null );
                            formattedData = cell.render( rawData, rowData, metadata, cell, $scope );
                            supportData.formattedCell = formattedData;
                        } else {
                            $element.addClass( "selectionCell" );
                        }

                        html = new utils.StringBuilder();
                        var customHtmlItem;
                        // See if the config provides some custom HTML. Note that we pass the row and cell
                        // jQuery objects to the custom handlers so they can manipulate the cell directly.
                        // Probably not a good idea to manipulate the row--be careful!

                        // The customHtml handlers can 1) do nothing (perhaps based on context) 2) return
                        // HTML that will be inserted by us into the cell's DOM or 3) manipulate the DOM
                        // and tell us that no further changes should be made. In case 1) the handler
                        // returns null. In case 2) the handler returns a string. In case 3) the handler
                        // returns false (i.e., don't propagate the event), representing "the cell's contents have been set--don't do anything
                        // else. Finally, if none of the custom handlers return anything we'll insert the
                        // default HTML.

                        // Becomes true in case 3).
                        var cellHasBeenFormatted = false;
                        var typeofCustomHtml, parsedConfig;
                        var generatedHtml;
                        if (!! cellConfig && (customHtml = cellConfig.customHtml)) {
                            // Additional data that might be useful to the callback. We stuff all this into
                            // a hash so that the callback function's signature is not too long.
                            typeofCustomHtml = typeof customHtml;

                            if (utils.hasContents( customHtml )) {

                                if ((typeofCustomHtml === "string") || (typeofCustomHtml === "function") || Array.isArray( typeofCustomHtml )) {
                                    parsedConfig = utils.parseCallbackConfig( customHtml );
                                    if (typeof parsedConfig === "string" ) {
                                        // This would be VERY odd--every cell in the row has the same HTML. Only
                                        // works if the HTML itself executes something or has very clever CSS.
                                        if (utils.hasContents( customHtml )) {
                                            html.append(customHtml);
                                        }
                                    } else {
                                        customHtmlItem = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, true );
                                        if (utils.hasContents( customHtmlItem )) {
                                            html.append(parsedConfig);
                                        }
                                    }
                                } else {
                                    // customHtml is a hashmap with data for specific columns
                                    // See if this column has a value in the hash.
                                    customHtmlItem = customHtml[columnName];
                                    if (utils.hasContents( customHtmlItem )) {
                                        parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                        generatedHtml = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, true );
                                        if (utils.hasContents( generatedHtml )) {
                                            if (typeof generatedHtml === "boolean") {
                                                cellHasBeenFormatted = generatedHtml;
                                            } else {
                                                html.append( generatedHtml );
                                            }
                                        }
                                    }

                                    if (! cellHasBeenFormatted) {
                                        // Or is identified by the column's metadataPosition in the grid.
                                        customHtmlItem = customHtml[metadataPosition + ''];
                                        if (utils.hasContents(customHtmlItem)) {
                                            parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                            generatedHtml = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, true );
                                            if (utils.hasContents(generatedHtml)) {
                                                if (typeof generatedHtml === "boolean") {
                                                    cellHasBeenFormatted = generatedHtml;
                                                } else {
                                                    html.append(generatedHtml);
                                                }
                                            }
                                        }

                                        if (! cellHasBeenFormatted) {
                                            // A column layout position definition?
                                            customHtmlItem = customHtml['+' + layoutPosition];
                                            if (utils.hasContents(customHtmlItem)) {
                                                parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                                generatedHtml = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, true );
                                                if (utils.hasContents(generatedHtml)) {
                                                    if (typeof generatedHtml === "boolean") {
                                                        cellHasBeenFormatted = generatedHtml;
                                                    } else {
                                                        html.append(generatedHtml);
                                                    }
                                                }
                                            }

                                            if (! cellHasBeenFormatted) {
                                                // And see if there is a global item to apply.
                                                customHtmlItem = customHtml["*"];
                                                if (utils.hasContents(customHtmlItem)) {
                                                    parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                                    generatedHtml = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, true );
                                                    if (utils.hasContents(generatedHtml)) {
                                                        if (typeof generatedHtml === "boolean") {
                                                            cellHasBeenFormatted = generatedHtml;
                                                        } else {
                                                            html.append(generatedHtml);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // In case any of the callbacks modified the formatted data.
                            formattedData = supportData.formattedCell;
                        }

                        if (! cellHasBeenFormatted) {
                            // We assume that the returned data is what should be inserted, including
                            // not inserting anything. However, if the callback explicitly returns null
                            // then we'll use the default row HTML. So if the callback returns an empty
                            // string then that will be inserted. This is how the callback can do all
                            // of its own manipulation of the cell's $element jQuery object--just return
                            // an empty string instead of null.
                            if (!html.hasAppends()) {
                                if (isSelectionCell) {
                                    html.append("<cui-checkbox></cui-checkbox>");
                                } else {
                                    html.append( utils.getNonNullValue(formattedData, "-") );
                                }
                            }

                            $element.html(
                                (
                                    isSelectionCell ?
                                        "<div class='cui-Grid--gridCellContents'>" :
                                        "<div class='cui-Grid--gridCellContents' style='text-align: " + cell.getAlignment() + "'>"
                                ) +
                                "<div class='cui-Grid--gridCellContentsPadding'>" +
                                    html.toString( '' ) +
                                "</div></div>"
                            );

                            $element.prop( "title", formattedData );
                        }
                        $compile($element.contents())($scope);


                        // Finally, apply the column width.
                        var minWidth = cell.getMinWidth(),
                            renderWidth = cell.getRenderWidth();

                        $element.css( { width: !! renderWidth ? renderWidth : $scope.cellWidth() } );
                        if (minWidth !== null) {
                            $element.css( { minWidth: minWidth } );
                        }
                        // Only want this log data for the first row. All rows are the same.
                        if (parentRow.attr( "offset" ) === "0") {
                            AMO.log.debug( "cuiGridCell: column = " + columnName + ", width used = " + $element.css( "width" ) + ", minWidth = " + cell.getMinWidth() );
                        }
                        $element.addClass( "column" + cell.getPosition() );
/*
                        // We require the first child to have the no-overflow and cui-Grid--gridCellContents
                        // classes.
                        var firstChild = $element.find( ":first-child" );
                        if (! firstChild.is( ".no-overflow" )) {
                            firstChild.addClass( "no-overflow" );
                        }
                        if (! firstChild.is( ".cui-Grid--gridCellContents" )) {
                            firstChild.addClass( "cui-Grid--gridCellContents" );
                        }
                        firstChild = firstChild.find( ":first-child" );
                        if (! firstChild.is( ".cui-Grid--gridCellContentsPadding" )) {
                            firstChild.addClass( "cui-Grid--gridCellContentsPadding" );
                        }
*/

                        $element.attr( "cui-column-index", metadataPosition );
                        // See if the config provides some customCSS. customCss is either
                        // a simple string containing space-delimited CSS class names or it
                        // is a hashmap of column identifiers and the CSS to be applied to
                        // each column.
                        if (!! cellConfig && (customCss = cellConfig.customCss)) {
                            css = applyCss( customCss );

                            if (utils.hasContents( css )) {
                                $element.children().addClass( css );
                            }
                        }

                        cellHasBeenFormatted = false;
                        if (!! cellConfig && (customHtml = cellConfig.customHtml)) {
                            // Additional data that might be useful to the callback. We stuff all this into
                            // a hash so that the callback function's signature is not too long.
                            typeofCustomHtml = typeof customHtml;
                            var callbackResult;

                            if (utils.hasContents( customHtml )) {

                                if ((typeofCustomHtml === "string") || (typeofCustomHtml === "function") || Array.isArray( typeofCustomHtml )) {
                                    parsedConfig = utils.parseCallbackConfig( customHtml );
                                    if (typeof parsedConfig !== "string" ) {
                                        customHtmlItem = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, false );
                                        if (utils.hasContents( customHtmlItem )) {
                                            html.append(parsedConfig);
                                        }
                                    }
                                } else {
                                    // customHtml is a hashmap with data for specific columns
                                    // See if this column has a value in the hash.
                                    customHtmlItem = customHtml[columnName];
                                    if (utils.hasContents( customHtmlItem )) {
                                        parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                        callbackResult = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, false );
                                        if (utils.hasContents( callbackResult )) {
                                            if (typeof generatedHtml === "boolean") {
                                                cellHasBeenFormatted = generatedHtml;
                                            }
                                        }
                                    }

                                    if (! cellHasBeenFormatted) {
                                        // Or is identified by the column's metadataPosition in the grid.
                                        customHtmlItem = customHtml[metadataPosition + ''];
                                        if (utils.hasContents(customHtmlItem)) {
                                            parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                            callbackResult = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, false );
                                            if (utils.hasContents( callbackResult )) {
                                                if (typeof generatedHtml === "boolean") {
                                                    cellHasBeenFormatted = generatedHtml;
                                                }
                                            }
                                        }

                                        if (! cellHasBeenFormatted) {
                                            // A column layout position definition?
                                            customHtmlItem = customHtml['+' + layoutPosition];
                                            if (utils.hasContents(customHtmlItem)) {
                                                parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                                callbackResult = parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, false );
                                                if (utils.hasContents( callbackResult )) {
                                                    if (typeof generatedHtml === "boolean") {
                                                        cellHasBeenFormatted = generatedHtml;
                                                    }
                                                }
                                            }

                                            if (! cellHasBeenFormatted) {
                                                // And see if there is a global item to apply.
                                                customHtmlItem = customHtml["*"];
                                                if (utils.hasContents(customHtmlItem)) {
                                                    parsedConfig = utils.parseCallbackConfig( customHtmlItem );
                                                    parsedConfig.fcn( $element, supportData, parsedConfig.callbackData, false );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // If we are the row selection checkbox cell then we need to check/uncheck the checkbox
                        // as needed for this row. We're given the row's selection state in the scope. The grid
                        // body will have determined if this is a selected row when it inserts the row directive.
                        if (isSelectionCell && $scope.rowSelected()) {
                            setTimeout(
                                function() {
                                    $element.find( "input" ).prop( "checked", true ); // Don't have to worry about false, that's the default.
                                }, 0
                            );
                        }
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                    link: link,
                    restrict: 'E',
                    scope: {
                        rowData: "&",
                        cell: '&',
                        cuiConfig: "&",
                        rowSelected: "&",
                        // The default % width to apply to each cell. A string that includes
                        // the '%' character--suitable for use in the CSS.
                        cellWidth: "&"
                    }
                };
            }

        ]
    );
}());
