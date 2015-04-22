"use strict";
/**
 * A class that aggregates all of the ColumnLayoutData instances that
 * are used in the current grid. For example, only visible columns are
 * stored and the order of the columns in this object's internal array
 * is the order in which they are displayed.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var CONSTANTS, ColumnLayoutData;


    var ColumnsConfigurationFactory =
        /**
         * Encapsulates the organization and layout of all of the columns in the
         * grid. For now the important parts are the order of columns and the
         * current sort.
         */
        (function() {

            var ColumnsConfigurationConstructor =
                /**
                 * Our constructor.
                 * @param columns An array of ColumnLayoutData instances. The order of columns
                 *                  in this array determines the order they are displayed--and
                 *                  which columns are displayed.
                 */
                    function( columns ) {
                    this.columns = columns;
                };

            ColumnsConfigurationConstructor.prototype.getNumberOfColumns = function() { return this.columns.length; };

            /**
             * Returns a ColumnLayoutData item from the set we have.
             * @param columnReference The index of the column in our columns array or the name of
             *              the column (typically the underlying metadata item name.)
             * @returns A ColumnLayoutData instance
             */
            ColumnsConfigurationConstructor.prototype.getColumn = function( columnReference ) {
                var columnLayoutDataItemForName = null;
                if (typeof columnReference === "number") {
                    columnLayoutDataItemForName = this.columns[columnReference];
                } else {
                    // Assume columnReference is a string and return the ColumnLayoutData item
                    // that it matches.
                    var derefColumns = this.columns;
                    for (var i = 0, l = this.columns.length; ! columnLayoutDataItemForName && (i < l); i++) {
                        if (derefColumns[i].getName() === columnReference) {
                            columnLayoutDataItemForName = derefColumns[i];
                        }
                    }
                }

                return columnLayoutDataItemForName;
            };

            /**
             *
             */
            /**
             * Adds a new ColumnLayoutData item to the end of the columns array.
             */
            ColumnsConfigurationConstructor.prototype.addColumn = function( column ) { this.columns.push( column ); };

            ColumnsConfigurationConstructor.prototype.removeColumnAtPosition =
                /**
                 * The user has, via the UI, removed the column at the indicated position. We
                 * remove it from our columns array.
                 *
                 * @param position
                 */
                    function( position ) {
                    this.columns.splice( position, 1 );
                };

            ColumnsConfigurationConstructor.prototype.moveColumn =
                /**
                 * Move the indicated column from one position to another in the
                 * array. This presumably happens because the user has rearranged
                 * the order of the columns in the grid.
                 * @param from The current position of the column
                 * @param to The new position of the column.
                 */
                    function( from, to ) {
                    var columnToBeMoved = this.columns.splice( from, 1 );
                    this.columns.splice( from < to ? (to - 1) : to, 0, columnToBeMoved );
                };

            ColumnsConfigurationConstructor.prototype.insertColumnAtPosition =
                /**
                 * Insert a new column into the array at the indicated position. The
                 * user may have used the UI to start showing a column that was previously
                 * not visible/shown.
                 * @param position Where to insert the new column.
                 * @param columnLayoutData The column to insert.
                 */
                    function( position, columnLayoutData ) {
                    this.columns.splice( position, 0, columnLayoutData );
                };

            ColumnsConfigurationConstructor.prototype.addSelectionColumn =
                /**
                 * Creates and inserts a "selector" column into the list of columns that gets
                 * displayed. A selector column contains checkboxes for selecting individual rows.
                 * @param position
                 */
                function( position ) {
                    var selectorColumn = new ColumnLayoutData( { contentType: CONSTANTS.SELECTION, type: position } );
                    if (position === CONSTANTS.LEFT_SELECTION) {
                        this.columns.splice( 0, 0, selectorColumn );
                        // Update the positions of the subsequent columns.
                        selectorColumn.setPosition( 0 );
                        for (var i = 1, l = this.columns.length; i < l; i++) {
                            this.columns[i].setPosition( this.columns[i].getPosition() + 1 );
                        }
                    } else if (position === CONSTANTS.RIGHT_SELECTION) {
                        this.columns.push( selectorColumn );
                        selectorColumn.setPosition( this.columns.length );
                    }
                };

            return function( cuiGridConstants, columnLayoutData ) {
                CONSTANTS = cuiGridConstants;
                ColumnLayoutData = columnLayoutData;

                return ColumnsConfigurationConstructor;
            };
        }());

    // Add this to the grid module as a value.
    angular.module( "ngCoral" )
        .factory(
            "ColumnsConfiguration",
            ["CuiGridConstants", "ColumnLayoutData", ColumnsConfigurationFactory]
        );

}());
