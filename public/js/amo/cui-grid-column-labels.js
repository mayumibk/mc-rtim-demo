"use strict";
/**
 *  Defines the cui-grid-column-labels directive. This directive creates a row
 *  (by default at the top of the grid) that contains the labels for each column.
 *  The directive uses the cui-grid-column-labels-cell directive for each cell.
 *  The labels are contained in the grid header, defined by the cui-grid-header
 *  directive.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils;

    var mouseHandler =
        function( scope, event, handler, htmlElement ) {
            // event.target is the div that received the mouse up event.
            // What we really want is the element that contains the cui-columnIndex
            // attribute. The value of this attribute is the index of this row
            // in the column metadata.
            var cellElement = $( event.target),
            // True/false if this cell is the selection cell. Otherwise the
            // index of the cell in the column metadata array.
                cellId;

            if (! cellElement.is( "[cui-column-index]" )) {
                cellElement = cellElement.parents( "[cui-column-index]" );
            }

            // Get the selection column, if one was provided.
            var gridRow = cellElement.parents( ".cui-Grid--columnLabels"),
                selectionCell = gridRow.find( ".selectionCell"),
                selectionState ;
            if (selectionCell.length === 1) {
                // todo--treat this as a real control
                selectionState = selectionCell.find( "input").prop( "checked" );
            } else {
                selectionState = null;
            }
            // If a row's selection checkbox has been touched we need to let
            // the grid wrapper know. It is maintaining a list of all selected
            // rows--for group operations.
            var isSelectionCell = cellElement.is( ".selectionCell" );
            if (isSelectionCell) {
                // If the user has clicked on the row selection checkbox we need
                // to reverse the state of selectionState. This is because this
                // handler gets invoked before the logic that resets the checkbox.
                selectionState = ! selectionState;

                // A row's selection checkbox has been touched. We need to let
                // the grid wrapper know. It is maintaining a list of all selected
                // rows--for group operations.
                AMO.log.debug( "emitting the cuiGrid-allSelectionChangedEvent: selectionState = " + selectionState );
                scope.$emit( "cuiGrid-allSelectionChanged", { selectionState: selectionState } );
            }

            cellId = parseInt( cellElement.attr( "cui-column-index" ) );

            // We also want the column metadata.
            var gridWrapper = gridRow.parents( ".cui-Grid"),
                columnLayoutData,
                columnMetadata = null, columnName = null;

            // If we detected a click within a column then get the column metadata
            // for the column. Note that column metadata is only available for
            // some types of columns.
            if (! isNaN( cellId )) {
                columnLayoutData = gridWrapper[0].NGCORAL_COLUMN_LAYOUT_DATA;
                columnMetadata = columnLayoutData[cellId].getMetadata();
                if (utils.hasContents( columnMetadata )) {
                    columnName = columnMetadata.getName();
                }
            }

            // todo Also need default handling for the grid? For example, change sort direction?

            // Execute any callback handlers that are defined in the grid's config (body.row.handlers.click...
            // Note that the value of click can be either a single function that gets
            // called or a hashmap that identifies functions to be called for individual columns.
            if (!! handler) {

                if (typeof handler === "function") {
                    handler( selectionState, cellId, columnMetadata, columnName, isSelectionCell );
                } else {
                    // A hashmap that may contain many functions for individual (or all) columns.
                    // Try the actual column first.
                    handler = handler[columnName];
                    if (typeof handler === "function") {
                        handler( selectionState, cellId, columnMetadata, columnName, isSelectionCell );
                    }
                    // See if a generic handler is defined.
                    handler = handler["*"];
                    if (typeof handler === "function") {
                        handler( selectionState, cellId, columnMetadata, columnName, isSelectionCell );
                    }
                }
            }

            return false;
        };

    var defaultLabelRowHtml = "<div class='cui-Grid--columnLabels'><cui-grid-column-labels-cell cell='cell' cui-config='cuiConfig()' cell-width='cellWidth()' ng-repeat='cell in columns().layout.columns'></cui-grid-column-labels-cell></div>";
    var defaultSummaryRowHtml = "<cui-grid-summary cui-config='cuiConfig()' columns='columns()' cell-width='cellWidth()'></cui-grid-summary>";

    angular.module( "ngCoral" ).directive(
        'cuiGridColumnLabels',
        [
            '$compile', 'ControlService', 'UtilitiesFactory',
            function( $compile, controlService, utilitiesFactory ) {
                utils = utilitiesFactory;

                var link =
                    function( $scope, $element, attrs, controller ) {
                        var html = null, customHtml,
                            labelsRowConfig = $scope.cuiConfig().labels;

                        // If the labels config object is null or the labels.showLabels attribute is
                        // false we just ignore this area.
                        if (utils.isEmpty( labelsRowConfig ) || ((typeof labelsRowConfig.showLabels !== "undefined") && ! labelsRowConfig.showLabels)) {
                            $element.hide();
                            return;
                        }

                        $scope.cellConfig = !! labelsRowConfig ? labelsRowConfig.cell : null;

                        $element.addClass( "cui-Grid-labels" );
//                        $element.addClass( "coral-Table-row" );
                        // See if a callback wants to provide the cell HTML.
                        if (!! labelsRowConfig && !! (customHtml = labelsRowConfig.customHtml)) {
                            // There are two options here. First the rowConfig.customHtml value is a string. Second,
                            // rowConfig.customHtml could be a function that we'll call. We insert the value returned
                            // by the function
                            if (typeof customHtml === "function") {
                                html = customHtml( $scope, $element, attrs );
                            } else {
                                html = customHtml;
                            }
                        }

                        if (html === null) {
                            // We allow an empty string to pass through--the way for the callback
                            // to essentially remove any HTML.
                            html = defaultLabelRowHtml;
                        }

                        // Should we add a summary row to the bottom of the column labels row?
                        // This is part of a new UX.
                        if (!! labelsRowConfig && labelsRowConfig.includeSummaryRow) {
                            var summaryConfig = $scope.cuiConfig().summary,
                                summaryHtml = null;

                            // See if a callback wants to provide the cell HTML.
                            customHtml = labelsRowConfig.customHtml;
                            if (!! summaryConfig && !! (customHtml = labelsRowConfig.customHtml)) {
                                // There are two options here. First the rowConfig.customHtml value is a string. Second,
                                // rowConfig.customHtml could be a function that we'll call. We insert the value returned
                                // by the function
                                if (typeof customHtml === "function") {
                                    summaryHtml = customHtml( $scope, $element, attrs );
                                } else {
                                    summaryHtml = customHtml;
                                }
                            }
                            if (! summaryHtml) {
                                summaryHtml = defaultSummaryRowHtml;
                            }
                            if (!! summaryHtml) {
                                // We add the summary html and put div blocks around both the labels and the summary.
                                html =
                                    "<div class='cui-Grid--labelsWithSummary'>" +
                                        "<div class='cui-Grid--labelsWithSummaryLabels'>" +
                                            html +
                                        "</div>" +
                                        "<div class='cui-Grid--labelsWithSummarySummary'>" +
                                            summaryHtml +
                                        "</div>" +
                                    "</div>";
                            }
                        }

                        $element.html( html );
                        $compile($element.contents())($scope);

                        // We were probably given a row selection callback but check, just to be sure.
                        // If we have one then register it along with a mouse handler. The mouse handler
                        // will detect the click. It's handler will then invoke teh action callback for
                        // the rowSelect handler.
                        // Note, this is a hack.
                        // todo support other types of handlers? Ones associated with the generic control,
                        //      such as hover?
//                        if (!! labelsRowConfig) {
//                            config.handlers = labelsRowConfig;
//                        }
                        $element.mouseup(
                            function( event ) {
                                mouseHandler( $scope, event, !! labelsRowConfig.handlers ? labelsRowConfig.handlers.labelsRowSelected : null, $element );
                            }
                        );

                        $scope.$on(
                            "cuiGrid-readyForSummaryData",
                            function( event, data ) {
                                $scope.$emit( "cuiGrid-getSummaryData" );
                            }
                        );
                    };

                // No controller here but you could provide a controller that would do initialization processing--
                // typically setting scope vars. Can be async.
                return {
                        require: '^cuiGrid',
                        link: link,
                        restrict: 'E',
                        scope: {
                            columns: '&',
                            cuiConfig: '&',
                            cellWidth: '&'
                        }
                    };
            }

        ]
    );

}());
