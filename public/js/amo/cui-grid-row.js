"use strict";
/**
 * Directives that define a grid row and a cell within a grid row.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    var utils, CONSTANTS;

    var rowMouseHandler =
        /**
         * Invoked when the user clicks on a row. We have two major tasks:
         * 1) Determine if the calling code has provided a callback that should
         *    be called when a row is clicked. That code might want, for example,
         *    to invoke some new dialog like an edit dialog.
         * 2) Determine if the user clicked on the "row selection" checkbox. We'll
         *    let the grid body know so it can update it's list of selected rows.
         * @param event The click event, should you want to get some specific event-related info
         * @param rowConfig The contents of the body.row config object
         * @param rowScope As provided in this directive's link function
         * @param htmlElement The $element parameter of the directive's link function
         * @param attrs The attrs parameter of the directive's link function.
         */
        function( event, rowConfig, rowScope, htmlElement, attrs ) {
            var userCallback =
                    (!! rowConfig.handlers && !! rowConfig.handlers.click) ?
                        rowConfig.handlers.click : null;

            var offset = parseInt( htmlElement.attr( "offset" ) );

            // event.target is the div that received the mouse up event.
            // What we really want is the element that contains the cui-columnIndex
            // attribute. The value of this attribute is the index of this row
            // in the column metadata.
            //
            // Also, if the user clicked on the row in a position that is not one
            // of the cells then event.target will be the same as htmlElement. When
            // we retrieve the gridRow below we'll accommodate this.
            var cellElement = $( event.target),
                // The index, within the current row and, by definition ColumnLayoutData
                // array, of the cell that was clicked on.
                cellId;

            if (! cellElement.is( "[cui-column-index]" )) {
                cellElement = cellElement.parents( "[cui-column-index]" );
            }

            // Get the selection column, if one was provided.
            var gridRow = cellElement.parents( ".cui-Grid--row");
            if (gridRow.length === 0) {
                gridRow = htmlElement;
            }
            var selectionCell = gridRow.find( ".selectionCell"),
                usesSelectionCell = selectionCell.length === 1,
                selectionState;

            if (usesSelectionCell) {
                // todo--treat this as a real control
                selectionState = selectionCell.find( "input").prop( "checked" );
                if (cellElement.is( ".selectionCell" )) {
                    // If the user has clicked on the row selection checkbox we need
                    // to reverse the state of selectionState. This is because this
                    // handler gets invoked before the logic that resets the checkbox.
                    selectionState = ! selectionState;
                }
            } else {
                // No actual selection checkbox. Instead we look for the cui-Grid--row-selected
                // class. Negate the result because we want what the row WILL become.
                selectionState = ! gridRow.is( ".cui-Grid--row-selected" );
            }


            // If a row's selection checkbox has been touched we need to let
            // the grid wrapper know. It is maintaining a list of all selected
            // rows--for group operations.
            rowScope.$emit( "cuiGrid-rowSelectionChanged", { offset: offset, selectionState: selectionState, gridRow: gridRow } );


            var cuiColumnIndex = cellElement.attr( "cui-column-index" );
            cellId = utils.hasContents( cuiColumnIndex ) ? parseInt( cuiColumnIndex ) : -1;

            // We also want the column metadata.
            var gridWrapper = gridRow.parents( ".cui-Grid"),
                columnLayoutData,
                columnMetadata = null, columnName = null;

            // If we detected a click within a column then get the column metadata
            // for the column. Note that column metadata is only available for
            // some types of columns.
            if (! isNaN( cellId ) && (cellId !== -1)) {
                columnLayoutData = gridWrapper[0].NGCORAL_COLUMN_LAYOUT_DATA;
                columnMetadata = columnLayoutData[cellId].getMetadata();
                if (utils.hasContents( columnMetadata )) {
                    columnName = columnMetadata.getName();
                }
            }

            // Execute any callback handlers that are defined in the grid's config (body.row.handlers.click...
            // Note that the value of click can be either a single function that gets
            // called or a hashmap that identifies functions to be called for individual columns.
            // Also note that the callback value can be either a function or can be an array:
            //      [ function, callbackData ]
            if (!! userCallback) {
                var rowData = gridRow[0].NGCORAL_ROW_DEF[1];
                // Is the config data just a simple callback or is it a hashmap that
                // contains more than one callback specification? Also, each callback
                // can be either a function or an array containing a function and optional
                // data that is passed back to the callback.
                var propagate = true,
                    userCallbackIsFunction = typeof userCallback === "function";

                var parsedCallback;
                if (userCallbackIsFunction || (Array.isArray( userCallback ))) {
                    parsedCallback = utils.parseCallbackConfig( userCallback );
                    propagate = parsedCallback.fcn(
                        offset, selectionState,
                        {
                            row: rowData,
                            cell: utils.hasContents(columnMetadata) ? rowData[columnMetadata.getPosition()] : null,
                            columnMetadata: columnMetadata,
                            cellIndex: cellId,
                            rowElement: gridRow,
                            cellElement: cellElement
                        }, parsedCallback.callbackData
                    );
                    if (typeof propagate === "undefined") {
                        propagate = true;
                    }
                } else {
                    // A hashmap that may contain many functions for individual (or all) columns.
                    var handler;

                    // Try the actual column first.
                    if (!! columnName) {
                        handler = userCallback[columnName];
                        if (!!handler) {
                            parsedCallback = utils.parseCallbackConfig( handler );
                            propagate = parsedCallback.fcn(
                                offset, selectionState,
                                {
                                    row: rowData,
                                    cell: utils.hasContents(columnMetadata) ? rowData[columnMetadata.getPosition()] : null,
                                    columnMetadata: columnMetadata,
                                    cellIndex: cellId,
                                    rowElement: gridRow,
                                    cellElement: cellElement
                                }, parsedCallback.callbackData
                            );
                            if (typeof propagate === "undefined") {
                                propagate = true;
                            }
                        }
                    }
                    // See if there is a callback for the given cell index. This lets you execute
                    // callbacks when the column doesn't have a name or you only know its position and
                    // not its name.
                    handler = userCallback[cellId];
                    if (propagate && !! handler) {
                        parsedCallback = utils.parseCallbackConfig( handler );
                        propagate = parsedCallback.fcn(
                            offset, selectionState,
                            {
                                row: rowData,
                                cell: utils.hasContents(columnMetadata) ? rowData[columnMetadata.getPosition()] : null,
                                columnMetadata: columnMetadata,
                                cellIndex: cellId,
                                rowElement: gridRow,
                                cellElement: cellElement
                            }, parsedCallback.callbackData
                        );
                        if (typeof propagate === "undefined") {
                            propagate = true;
                        }
                    }
                    
                    // See if a generic handler is defined.
                    handler = userCallback["*"];
                    if (propagate && !! handler) {
                        parsedCallback = utils.parseCallbackConfig( handler );
                        propagate = parsedCallback.fcn(
                            offset, selectionState,
                            {
                                row: rowData,
                                cell: utils.hasContents(columnMetadata) ? rowData[columnMetadata.getPosition()] : null,
                                columnMetadata: columnMetadata,
                                cellIndex: cellId,
                                rowElement: gridRow,
                                cellElement: cellElement
                            }, parsedCallback.callbackData
                        );
                    }
                }

                return propagate;
            }

            return false;
        };

    var defaultRowHtml = "<cui-grid-cell row-data='localRowData' row-selected='rowSelected()' cell='cell' cell-width='localCellWidth' cui-config='cuiConfig()' ng-repeat='cell in columns().layout.columns'></cui-Grid-cell>";
    angular.module( "ngCoral").directive(
        'cuiGridRow',
        [
            '$compile', 'ControlService', 'UtilitiesFactory', 'CuiGridConstants',
            function( $compile, controlService, utilitiesFactory, cuiGridConstants ) {
                utils = utilitiesFactory;
                CONSTANTS = cuiGridConstants;

                var link =
                    function( $scope, $element, attrs ) {
                        var html = null, customHtml,
                            config = $scope.cuiConfig(),
                            bodyConfig = config.body,
                            rowConfig = !! bodyConfig && !! bodyConfig.row ? bodyConfig.row : null;

                        $element.addClass( "cui-Grid--row" );
//                        $element.addClass( "coral-Table-row" );
                        $element.addClass( "cui-wrapper" );
                        $scope.localRowData = $element[0].NGCORAL_ROW_DEF[1];
                        $scope.localCellWidth = $scope.cellWidth(); // Only evaluate once.
                        $scope.cellConfig = !! rowConfig ? rowConfig.cell : null;

                        // See if a callback wants to provide the cell HTML.
                        if (!! rowConfig && !! (customHtml = rowConfig.customHtml)) {
                             // There are two options here. First the rowConfig.customHtml value is a string. Second,
                            // rowConfig.customHtml could be a function that we'll call or an array that contains
                            // the function and optional data we pass to the function. We insert the value returned
                            // by the function.
                            var parsedCustomHtml = utils.parseCallbackConfig( customHtml );
                            if (typeof parsedCustomHtml === "string") {
                                html = customHtml;
                            } else {
                                html = parsedCustomHtml.fcn(
                                    $scope, $element, attrs, defaultRowHtml, $scope.rowData(), parsedCustomHtml.callbackData );
                            }
                        }
                        // We assume that the returned data is what should be inserted, including
                        // not inserting anything. However, if the callback explicitly returns null
                        // then we'll use the default row HTML. So if the callback returns an empty
                        // string then that will be inserted.
                        if (html === null) {
                            html = defaultRowHtml;
                        }

                        $element.html( html );
                        // Set the row's width. The body directive may want the row to be wider so that
                        // columns don't become too narrow.
                        $compile($element.contents())($scope);

                        // We were probably given a row selection callback but check, just to be sure.
                        // If we have one then register it along with a mouse handler. The mouse handler
                        // will detect the click. It's handler will then invoke the action callback for
                        // the rowSelect handler
                        // todo support other types of handlers? Ones associated with the generic control,
                        //      such as hover?
//                        if (!! rowConfig) {
//                            config.handlers.click = rowConfig.handlers;
//                        }
                        // Always want this, mainly for detecting clicks in the row selection cell.
                        $element.mouseup(
                            function( event ) {
                                rowMouseHandler(
                                    event, rowConfig,
                                    $scope, $element, attrs, rowConfig
                                );
                            }
                        );
                    };

                return {
                        link: link,
                        restrict: 'E',
                        scope: {
                            columns: '&',
                            rowData: "&",
                            cuiConfig: "&",
                            rowSelected: '&',
                            cellWidth: '&'
                        }
                    };
            }

        ]
    );
}());
