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
        'cuiGridSummaryCell',
        [
            '$compile', 'UtilitiesFactory', 'CuiGridConstants',
            function( $compile, utilitiesFactory, cuiGridConstants ) {
                utils = utilitiesFactory;
                CONSTANTS = cuiGridConstants;

                var controller =
                    function( $scope, $element ) {
                    };

                var link =
                    function( $scope, $element, attrs ) {
                        var cell = $scope.cell(),
                            metadata = cell.getMetadata(),
                            columnName = utils.hasContents( metadata ) ? metadata.getName() : "-",
                            type = cell.getType(),
                            cellConfig = $scope.cuiConfig().summary.cell,
                            html = null, customHtml, customHtmlItem,
                            css = null, customCss, customCssItem,
                            i, l,
                            isSelectionCell = type === CONSTANTS.SELECTION;
                        $element.addClass( "cui-Grid--summaryCell" );
//                        $element.addClass( "coral-Table-cell" );
                        // Style the cell for width and add our standard class.
                        $element.css( "width", cell.getWidth() );

                        var rawData, formattedData;
                        if (! isSelectionCell) {
                            rawData = cell.extractValueFromRowData( $scope.summaryData(), null );
                            formattedData = !! metadata ? metadata.getFormatter()( rawData ) : null;
                        } else {
                            $element.addClass( "selectionCell" );
                        }

                        // See if the config provides some customCSS. customCss is either
                        // a simple string containing space-delimted CSS class names or it
                        // is a hashmap of column identifiers and the CSS to be applied to
                        // each column.
                        if (!! cellConfig && (customCss = cellConfig.customCss)) {
                            css = new utils.StringBuilder();
                            if (utils.hasContents( customCss )) {
                                // We have some. Is it the array form or the single form?
                                if (customCss instanceof String) {
                                    // A function or a string?
                                    css.append( utils.executeIfFunction( customCss, [$scope, $element, attrs, metadata, isSelectionCell] ) );
                                } else {
                                    // See if this column has a value in the hash.
                                    customCssItem = customCss[columnName];
                                    if (utils.hasContents( customCssItem )) {
                                        css.append( utils.executeIfFunction( customCssItem, [$scope, $element, attrs, metadata, isSelectionCell] ) );
                                    }

                                    // And see if there is a global item to apply.
                                    customCssItem = customCss["*"];
                                    if (utils.hasContents( customCssItem )) {
                                        css.append( utils.executeIfFunction( customCssItem, [$scope, $element, attrs, metadata, isSelectionCell] ) );
                                    }
                                }

                                if (css.hasAppends()) {
                                    $element.addClass( css.toString( " " ) );
                                }
                            }
                        }

                        html = new utils.StringBuilder();
                        var htmlSnippet;
                        // See if the config provides some custom HTML.
                        if (!! cellConfig && (customHtml = cellConfig.customHtml)) {
                            if (utils.hasContents( customHtml )) {
                                // We have some. Is it the array form or the single form?
                                if (customHtml instanceof Array) {
                                    // Go through the array and see if one of the items
                                    // is for the current column.
                                    for (i = 0, l = customHtml.length; i < l; i++) {
                                        customHtmlItem = customHtml[i];
                                        // For all cells or just a specific cell?
                                        if (customHtmlItem.length === 1) {
                                            // All rows! Once again, are we given a string or a function.
                                            htmlSnippet = utils.executeIfFunction( customHtmlItem[0], [$scope, $element, attrs, metadata, isSelectionCell] );
                                            if (htmlSnippet !== null) {
                                                html.append( htmlSnippet );
                                            }
                                        } else if (customHtmlItem.length === 2) {
                                            // Only the column identified in customHtmlItem[0]. If
                                            // a match then we get the CSS class from customHtmlItem[1].
                                            if (columnName === customHtmlItem[0]) {
                                                htmlSnippet = utils.executeIfFunction( customHtmlItem[1], [$scope, $element, attrs, metadata, isSelectionCell] );
                                                if (htmlSnippet !== null) {
                                                    html.append( htmlSnippet );
                                                }
                                            }
                                        } else {
                                            AMO.log.debug( "Invalid customHtml specification." );
                                        }
                                    }
                                } else {
                                    // A function or a string?
                                    htmlSnippet = utils.executeIfFunction( customHtml, [$scope, $element, attrs, metadata, isSelectionCell] );
                                    if (htmlSnippet !== null) {
                                        html.append( htmlSnippet );
                                    }
                                }
                            }
                        }

                        // We assume that the returned data is what should be inserted, including
                        // not inserting anything. However, if the callback explicitly returns null
                        // then we'll use the default row HTML. So if the callback returns an empty
                        // string then that will be inserted.
                        if (! html.hasAppends()) {
                            if (isSelectionCell) {
                                html.append( "<div></div>" );
                            } else {
                                html.append( utils.getNonNullValue( formattedData, "-" ) );
                            }
                        }

                        $element.html(
                            (
                                isSelectionCell ?
                                    "<div class='cui-Grid--summaryCellContents'>" :
                                    "<div class='cui-Grid--summaryCellContents' style='text-align: " + cell.getAlignment() + "'>"
                            ) +
                            "<div class='cui-Grid--summaryCellContentsPadding'>" +
                                html.toString( '' ) +
                            "</div></div>"
                        );

                        $element.attr( "cui-column-index", cell.getPosition() );
                        $element.addClass( "cui-Grid--cellWrapper" );

                        // Finally, apply the column width.
                        var minWidth = cell.getMinWidth(),
                            renderWidth = cell.getRenderWidth(),
                            defaultWidth = $scope.cellWidth();

                        $element.css( { width: !! renderWidth ? renderWidth : defaultWidth } );
                        if (minWidth !== null) {
                            $element.css( { minWidth: minWidth } );
                        }
                        $element.addClass( "column" + cell.getPosition() );

                        $compile($element.contents())($scope);
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                    controller: controller,
                    link: link,
                    restrict: 'E',
                    scope: {
                        summaryData: '&',
                        cell: '&',
                        cuiConfig: '&',
                        cellWidth: '&'
                    }
                };
            }

        ]
    );
}());
