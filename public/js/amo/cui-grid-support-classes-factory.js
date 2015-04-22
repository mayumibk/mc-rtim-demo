/**
 * cui-grid-support-classes-factory.js
 *
 * A factory that simply reveals some support classes that are needed
 * when code is configuring a grid. These classes are each defined in
 * their own JS file. This factory simply makes them available via a
 * single injection--helps keep your injection lists short(er).
 * Created by kmonahan on 1/17/15.
 */

(function() {
    "use strict";

    var CuiGridSupportClassesFactoryFunction = (
        function() {

            return function( cuiGridConstants, columnMetadata, columnLayoutData, columnsConfiguration, gridUtilities ) {
                return {
                    CONSTANTS: cuiGridConstants,
                    ColumnMetadata: columnMetadata,
                    ColumnLayoutData: columnLayoutData,
                    ColumnsConfiguration: columnsConfiguration
                };
            };
        }());


    // Add this to the grid module as a value.
    angular.module( "ngCoral" ).factory(
        "CuiGridSupportClassesFactory",
        [
            "CuiGridConstants", "ColumnMetadata", "ColumnLayoutData", "ColumnsConfiguration",
            CuiGridSupportClassesFactoryFunction
        ]
    );
}());
