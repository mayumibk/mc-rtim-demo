"use strict";
/**
 * The top-level directive for our ngCoral grid.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var CONSTANTS, q, utils, ColumnLayoutData;

    // A grid can contain a "select row" column that contains a checkbox, along with
    // a matching checkbox in the labels row. We're expanding this concept to allow
    // the user to select rows across multiple pages.
    angular.module( "ngCoral" )
        .directive(
            'cuiGrid',
            [
                'ControlService', '$timeout', '$compile', '$q', 'UtilitiesFactory', 'CuiGridConstants', 'ColumnLayoutData',
                function( controlService, $timeout, $compile, $q, utilitiesFactory, cuiGridConstants, columnLayoutData ) {

                    CONSTANTS = cuiGridConstants;
                    q = $q;
                    utils = utilitiesFactory;
                    ColumnLayoutData = columnLayoutData;

                    var gridController =
                        (function() {
                            var controllerFunction =
                                /**
                                 * The actual function that gets returned from this immediate execution block.
                                 */
                                function( $scope ) {
                                    var bodyScope = null;
                                    // We get notifications from the nested directives when various
                                    // events occur.
                                    $scope.$on(
                                        "cuiGrid-bodyReady",
                                        function( event, gridScope ) {
                                            bodyScope = gridScope;
                                        }
                                    );

                                    // We assume that the caller will want to know the total number of rows
                                    // but we can't assume this. So, the cuiNumberOfRows scope attribute, which
                                    // we use to communicate the actual number of rows to the caller, may not
                                    // exist. We need this value, though, for our scroller. So, we create our
                                    // own private scope attribute that is shared with the scroller. When we
                                    // get the number of rows we'll update both attributes--the caller's if it exists.
                                    $scope.numberOfRows = "(pending)";
                                };

                            controllerFunction.link =
                                /**
                                 * Want this here so it can deposit the gridConfig data into the controller's closure.
                                 * Otherwise a typical link function. The link function determines if the required
                                 * column metadata and row data/function are available. If so, it then inserts the
                                 * next level of directives into the grid. If neither or both of these required
                                 * values are not available then the insert operation will be delayed until they
                                 * become available.
                                 */
                                function( $scope, $element, attrs ) {

                                    // When dataSource is a function then we cache the retrieved data rows here.
                                    var dataCache;
                                    var dataSource;
                                    var columnLayout = null;
                                    var columnMetadata = null;

                                    var insertDirectives =
                                            /**
                                             * Actually does the insertion of the next-level directives. This function
                                             * is not called until the directive has all its required data (via scope
                                             * watching.)
                                             */
                                            function() {
                                                // The wrapper for the actual grid
                                                $element.addClass( "cui-Grid" );

                                                var gridHtml = new utils.StringBuilder();

                                                // We see if the HTML provides directives for the header and footer.
                                                // In the future we can look for other directives for row, column, etc.
                                                $scope.cuiHeader = attrs.cuiHeader;
                                                $scope.cuiFooter = attrs.cuiFooter;
                                                $scope.cuiAvailableOffsets = null;
                                                gridHtml.append( "<cui-grid-header></cui-grid-header>" );
                                                gridHtml.append(
                                                    "<cui-grid-body datasource='cuiDataSource()' cui-config='cuiConfig()' columns='columns' " +
                                                    "cui-visible-rows='cuiVisibleRows' cui-available-Offsets='cuiAvailableOffsets' cui-number-of-rows='cuiNumberOfRows'></cui-grid-body>"
                                                );
                                                gridHtml.append( "<cui-grid-footer></cui-grid-footer>" );
                                                gridHtml.append(
                                                    // We need to insert the scroller absolutely and below (HTML wise) all of the content.
                                                    // This allows it to attach to the right edge of the grid even when the body area
                                                    // is scrolled.
                                                    //"<cui-grid-scroller cui-config='cuiConfig().scroller' dimensions='dimensions'></cui-grid-scroller>" +
                                                    "<div class='cui-Grid--renderArea' style='position: absolute; top: 0; left: 0; opacity: 0; z-index: 0;'></div>"
                                                );
                                                $element.html( gridHtml.toString() );
                                                $compile($element.contents())($scope);
                                                setTimeout(
                                                    function() {
                                                        // Update the height of the grid body so that it fits between
                                                        // the header and footer--and lets the footer always be at the bottom.
                                                        var header = $element.find( "cui-grid-header"),
                                                            body = $element.find( "cui-grid-body"),
                                                            footer = $element.find( "cui-grid-footer"),

                                                            headerHeight = (header.length > 0 ? (body.position().top - header.position().top) : 0),

                                                            footerHeight = (footer.length > 0 ? footer.height() : 0),

                                                            bodyHeight = $element.height() - (headerHeight + footerHeight ),

                                                            labels = body.find( "cui-grid-column-labels"),
                                                            labelsHeight = (labels.length > 0 ? (labels.outerHeight()) : 0);

                                                        // Reset the height of the body so that it occupies the
                                                        // remaining vertical space between the header and the
                                                        // footer. Wish I knew of a way to do this entirely with CSS.
                                                        //body.animate( { height: bodyHeight }, 500 );
                                                        body.height( bodyHeight );
                                                        $scope.$broadcast( "cui-grid-bodyHeight-updated", bodyHeight );

                                                        // The scroller also needs (wants) the total number of rows in
                                                        // the entire query. If this value is not available we'll wait
                                                        // for it.
                                                        $scope.$watch(
                                                            "numberOfRows",
                                                            function() {
                                                                AMO.log.debug( "cuiGrid: numberOfRows changed (dimensions): " + $scope.numberOfRows );
                                                                $scope.dimensions = [
                                                                    headerHeight, bodyHeight, labelsHeight,
                                                                    typeof $scope.numberOfRows !== "undefined" ? $scope.numberOfRows : null
                                                                ];
                                                            }
                                                        );
                                                    }
                                                    , 500
                                                );
                                            },

                                        initializeColumnLayout =
                                            /**
                                             * Insert the appropriate metadata object into each cell layout
                                             * instance in layout. If layout is an empty array then we create
                                             * a default list of columns to display by including all of the
                                             * available columns, as defined in metadata.
                                             * @param metadata An array of ColumnMetadata instances.
                                             * @param layout An instance of ColumnsConfiguration which contains an array
                                             *                  of ColumnLayoutData instances
                                             * @param gridConfig
                                             */
                                            function( metadata, layout, gridConfig ) {
                                                var showSelectionCell =
                                                    (typeof gridConfig.grid.showSelectionColumn !== "undefined") ?
                                                        gridConfig.grid.showSelectionColumn : false;


                                                if (layout.getNumberOfColumns() === 0) {
                                                    // We have no definition for the actual columns to show
                                                    // and their order. So create one from the metadata.
                                                    createLayoutFromMetadata( metadata, layout, gridConfig );
                                                } else {
                                                    // We have a layout config. We now need to go through it and
                                                    // link each one to the metadata. We need the metadata to know
                                                    // where the column's data is in the row data array and the
                                                    // type of the column--needed to determine the display format.

                                                    // It's easier if we first convert the metadata into a map,
                                                    // indexed by the metadata's name field. Note that we only keep
                                                    // the columns that are not hidden plus the first one (the key ID.)
                                                    var metadataItem, metadataMap = {};
                                                    var i, l;
                                                    metadataItem = metadata[0];
                                                    metadataMap[metadataItem.name] = metadataItem;
                                                    for (i = 1, l = metadata.length; i < l; i++) {
                                                        metadataItem = metadata[i];
                                                        metadataMap[metadataItem.name] = metadataItem;
                                                    }

                                                    // Now go through each column config and get the matching
                                                    // metadata item. From there we also set other items like
                                                    // sort direction and text alignment, if the layout data
                                                    // does not already specify it. At this time we see if
                                                    // the config contains a custom formatter, a handler
                                                    // that may change how a specific column is formatted.
                                                    var layoutItem, formatOption, contentType, type;
                                                    var customFormatHandler =
                                                        utils.hasAttribute( gridConfig, "columns.customFormatHandler" ) ?
                                                            gridConfig.columns.customFormatHandler : null;
                                                    var isFunction = !! customFormatHandler && (typeof customFormatHandler === "function");
                                                    // This becomes a function pointer that we'll call whenever there is not
                                                    // a specific callback for the column
                                                    var allCellsCustomFormatHandler =
                                                        !! customFormatHandler && ! isFunction ?
                                                            utils.getNonNullValue( customFormatHandler["*"], null ) : null;
                                                    var cellCallback;

                                                    for (i = 0, l = layout.getNumberOfColumns(); i < l; i++) {
                                                        layoutItem = layout.getColumn( i );
                                                        contentType = layoutItem.getContentType();
                                                        type = layoutItem.getType();
                                                        if (contentType === CONSTANTS.SELECTION) {
                                                            layoutItem.setMetadata( null );
                                                            layoutItem.setSortDirection( CONSTANTS.SORT_NONE );
                                                            layoutItem.setAlignment( CONSTANTS.ALIGN_LEFT );
                                                        } else {
                                                            metadataItem = utils.getNonNullValue( metadataMap[layoutItem.getName()] );
                                                            layoutItem.setMetadata(metadataItem );
                                                            if (!! metadataItem) {
                                                                if (layoutItem.getWidth() === null) {
                                                                    layoutItem.setWidth(metadataItem.getWidth());
                                                                }
                                                                if (layoutItem.getAlignment() === null) {
                                                                    layoutItem.setAlignment(metadataItem.getDefaultAlignment());
                                                                }
                                                            }
                                                        }


                                                        if (! layoutItem.getType()) {
                                                            layoutItem.setType( !! metadataItem ? metadataItem.getType() : CONSTANTS.SYNTHETIC );
                                                        }
                                                        // If the layout data specifies a formatting option then we
                                                        // need to tell the metadata instance to use the format. We also
                                                        // need to see if the column layout data has overridden the
                                                        // the default type from the metadata. This could occur if the
                                                        // column layout data is using the value attribute to extract
                                                        // data from the data, e.g., data.minBid vs data.maxBid.

                                                        // Start by getting the format option.
                                                        formatOption = null;
                                                        if (!!customFormatHandler) {
                                                            // Can be either a function we call for all cells or a typical
                                                            // hashmap with functions for individual cells.
                                                            if (isFunction) {
                                                                formatOption = customFormatHandler;
                                                            } else {
                                                                // See if there is a specific callback.
                                                                cellCallback = customFormatHandler[layoutItem.getName()];
                                                                if (!! cellCallback) {
                                                                    formatOption = cellCallback;
                                                                } else {
                                                                    // See if the column has a reference based on the column's position
                                                                    cellCallback = customFormatHandler[i + ''];
                                                                    if (!! cellCallback) {
                                                                        formatOption = cellCallback;
                                                                    } else if (allCellsCustomFormatHandler) {
                                                                        formatOption = allCellsCustomFormatHandler;
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        // If the config does not define a specific formatter then see if
                                                        // either the ColumnLayoutData or ColumnMetadata instances have a "format" attribute.
                                                        if (utils.isEmpty(formatOption)) {
                                                            formatOption = utils.getNonNullValue(layoutItem.format, (!! metadataItem ? metadataItem.getFormatOption() : null) );
                                                        }

                                                        if (contentType === CONSTANTS.TEXT) {
                                                            if (utils.hasContents(formatOption) || (metadataItem.getType() !== layoutItem.getType())) {
                                                                layoutItem.setFormatter(metadataItem.regenerateFormatFunction(layoutItem.getType(), metadataItem, formatOption));
                                                            }
                                                        } else if (contentType === CONSTANTS.SPARKLINE) {
                                                            // Sparklines or other types of graphics. The type attribute will contain the general type
                                                            // of graphic, such as "sparkline", "percent" (a box with partial shading) or "icon". The
                                                            // format field gives more details, on a per-type basis.
                                                            if (type === CONSTANTS.PERCENT_BOX) {
                                                                layoutItem.setFormatter( layoutItem.createPercentCompleteRenderer( formatOption ) );
                                                            } else if (type === CONSTANTS.GRAPH) {
                                                                layoutItem.setFormatter( layoutItem.createSparklineRenderer( formatOption ) );
                                                            }
                                                        } else {
                                                            layoutItem.setFormatter( formatOption );
                                                        }

                                                        layoutItem.setPosition( i );
                                                    }
                                                }

                                                // Should we show the selection column? If so, add it to the
                                                // beginning or end of the column array.
                                                if (!! showSelectionCell) {
                                                    layout.addSelectionColumn( showSelectionCell );
                                                }
                                            },

                                        createLayoutFromMetadata =
                                            /**
                                             * We do not have a layout definition so we create one using
                                             * every available column in the metadata.
                                             * @param metadata
                                             * @param layout
                                             */
                                            function( metadata, layout ) {
                                                var metadataItem, column;

                                                var columnPositionInLayout = 0;
                                                for (var i = 0, l = metadata.length; i < l; i++) {
                                                    metadataItem = metadata[i];
                                                    if (metadataItem.isVisible()) {
                                                        column = new ColumnLayoutData(metadataItem);
                                                        column.setMetadata(metadataItem);
                                                        column.setPosition( columnPositionInLayout++ );
                                                        layout.addColumn(column);
                                                    }
                                                }
                                            },

                                        requestNumberOfRows =
                                            function() {
                                                dataSource.getNumberOfRows(
                                                    function( count ) {
                                                        $scope.numberOfRows = count;
                                                        // Put the value into the scope if the calling code has
                                                        // provided a variable.
                                                        AMO.log.debug( "cuiGrid: numberOfRows changed (count): " + $scope.numberOfRows );
                                                        if (typeof $scope.cuiNumberOfRows !== "undefined") {
                                                            $scope.cuiNumberOfRows = count;
                                                        }

                                                        // Let the body know that there are no rows in the
                                                        // current query.
                                                        $scope.$broadcast( "queryCount", $scope.numberOfRows );
                                                    },
                                                    function( error ) {
                                                        AMO.log( "Error retrieving the count: " + error );
                                                    }
                                                );
                                            },

                                        configDetected =
                                            function() {
                                                gridConfig = $.extend( gridConfigDefault, $scope.cuiConfig() );
                                                if (!!gridConfig.columns) {
                                                    $scope.columns = gridConfig.columns;
                                                    columnMetadata = gridConfig.columns.metadata;
                                                    columnLayout = gridConfig.columns.layout;
                                                    if (!!columnMetadata && !!columnLayout) {
                                                        AMO.log.debug("cuiGrid: column layout and metadata are now available");

                                                        dataSource = $scope.cuiDataSource();
                                                        dataCache = new RowDataCache(dataSource);

                                                        // We initialize the columnLayout objects with the matching
                                                        // column metadata object. We refer to this frequently.
                                                        initializeColumnLayout(columnMetadata, columnLayout, gridConfig);

                                                        // Attach the metadata and layout data (column orders) to the main grid element.
                                                        // Makes it available at runtime.
                                                        $element[0].NGCORAL_COLUMN_METADATA = columnMetadata;
                                                        $element[0].NGCORAL_COLUMN_LAYOUT_DATA = columnLayout.columns;

                                                        // Now that we have the data we can build the grid.
                                                        insertDirectives();

                                                        if (gridConfig.grid.getNumberOfRows) {
                                                            requestNumberOfRows();
                                                        }

                                                        return true;
                                                    } else {
                                                        return false;
                                                    }
                                                } else {
                                                    return false;
                                                }
                                            };

                                    var gridConfigDefault = {
                                            grid: {
                                                showSelectionColumn: null,
                                                getNumberOfRows: true,
                                                getSummaryData: true
                                            }
                                        },
                                        gridConfig = null;
                                    gridConfig = $.extend( gridConfigDefault, $scope.cuiConfig() );
                                    // Does the HTML specify that the selection column be shown, overriding the
                                    // config data?
                                    var showSelectionColumn = attrs.cuiShowSelectionColumn;
                                    if (typeof showSelectionColumn !== "undefined") {
                                        switch (showSelectionColumn.toLowerCase()) {
                                            case CONSTANTS.LEFT_SELECTION:
                                                gridConfig.grid.showSelectionColumn = CONSTANTS.LEFT_SELECTION;
                                                break;
                                            case CONSTANTS.RIGHT_SELECTION:
                                                gridConfig.grid.showSelectionColumn = CONSTANTS.RIGHT_SELECTION;
                                                break;
                                            default:
                                                gridConfig.grid.showSelectionColumn = CONSTANTS.LEFT_SELECTION;
                                        }
                                    }

                                    $scope.$watch(
                                        "cuiManageGrid",
                                        function () {
                                            // When we detect this change we tell the grid body to do the action.
                                            var request = $scope.cuiManageGrid;
                                            if (utils.hasContents( request )) {
                                                if (request[0] !== "refresh") {
                                                    $scope.numberOfRows = "(pending)";
                                                    requestNumberOfRows();
                                                }
                                                $scope.$broadcast("manageGrid", request );
                                            }
                                        }
                                    );
                                    $scope.columns = gridConfig.columns;
                                    $scope.gridController = gridController;
                                    $scope.cuiVisibleRows = null;
                                    //$scope.$watch(
                                    //    "cuiVisibleRows",
                                    //    function () {
                                    //        AMO.log.debug( "cuiGrid: visibleRows changed." );
                                    //    }
                                    //);
                                    // We also listen for when the set of selected rows changes. This is ultimately the "value"
                                    // of the grid. If the user of the grid provided an attribute for us to put this in then
                                    // we'll update it.
                                    $scope.$on(
                                        "cuiGrid-selectionStateUpdated",
                                        function( event, selectedRows )
                                        {
                                            if (utils.isEmpty( $scope.cuiValue )) {
                                                $scope.cuiValue = selectedRows;
                                            }
                                        }
                                    );

                                    // We both listen for and emit "rowOffsetChanged" events.
                                    // The event is currently emitted by the grid body when it has done
                                    // something that changes the row offset that is displayed at the top
                                    // of the grid. Scrolling events are the typical case. When we see this
                                    // event we re-emit it so that other branches of the scope hierarchy
                                    // can receive it--in particular the scroller.
                                    $scope.$on(
                                        "rowOffsetChanged",
                                        function( event, rowOffset ) {
                                            $scope.$broadcast( "rowOffset", [ rowOffset, $scope.numberOfRows ] );
                                        }
                                    );

                                    if (!! gridConfig.columns) {
                                        columnMetadata = gridConfig.columns.metadata;
                                        columnLayout = gridConfig.columns.layout;
                                    } else {
                                        columnMetadata = null;
                                        columnLayout = null;
                                    }

                                    // Done with most of our setup. Grid data is usually retrieved asynchronously
                                    // from a server and is probably not available. So, do some scope watching for
                                    // the data. When it's available we'll insert the next level of grid directives
                                    // and the actual grid will appear.
                                    // todo may be better to watch for something other than the config, like the
                                    // dataSource. We may want the config to determine how to handle the "please wait" time.
                                    if (!! columnMetadata && !! columnLayout) {
                                        // The data is already available. Just continue.

                                        dataSource = $scope.cuiDataSource();
                                        dataCache = new RowDataCache( dataSource );

                                        if ((typeof gridConfig.grid.getNumberOfRows === "undefined") || gridConfig.grid.getNumberOfRows) {
                                            requestNumberOfRows();
                                        }
                                        // We initialize the columnLayout objects with the matching
                                        // column metadata object. We refer to this frequently.
                                        initializeColumnLayout( columnMetadata, columnLayout, gridConfig );
                                        // Attach the metadata and layout data (column orders) to the main grid element.
                                        // Makes it available at runtime.
                                        $element[0].NGCORAL_COLUMN_METADATA = columnMetadata;
                                        $element[0].NGCORAL_COLUMN_LAYOUT_DATA = columnLayout.columns;
                                        insertDirectives();
                                    } else {
                                        // Wait until both are available.
                                        if (! columnMetadata || ! columnLayout) {
                                            $scope.$watch(
                                                "cuiConfig",
                                                function() {
                                                    // Unfortunately we can only do a single watch on cuiConfig because
                                                    // it is a one-way binding. So, if the data is not there we wait
                                                    // and try again.
                                                    if (! configDetected()) {
                                                        var timer = setInterval(
                                                            function() {
                                                                if (configDetected()) {
                                                                    clearInterval( timer );
                                                                }
                                                            }, 100
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    }
                                };

                            return controllerFunction;
                        }());

                    return {
                            controller: gridController,
                            link: gridController.link,
                            restrict: 'E',
                            scope: {
                                cuiManageGrid: '=',
                                cuiDataSource: '&',
                                cuiConfig: '&',
                                // The "value" of our grid:
                                cuiValue: "=",
                                cuiNumberOfRows: "="
                            }
                        };
                }

            ]
        );

    // As we get blocks of rows from the data source we cache
    // them here. This allows the user to scroll beyond the range
    // of rows in a data block and then return to that range later--
    // without having to request the data from the data source again.
    // Using an IIFE so that we can create private methods.
    var RowDataCache = (function() {

        /**
         * Constructs a cache for the provided data source. We assume that
         * the data source returns rows in blocks of arbitrary length.
         * @param dataSource A function that accepts a single offset argument.
         *                  The data source returns n rows, starting at this
         *                  offset. We don't know, up front, what n is.
         *                  dataSource can also be an array of data. In this
         *                  case the grid is being built from a fixed set
         *                  of rows.
         * @constructor
         */
        function RowDataCacheConstructor( dataSource ) {

            // We typically cache up to 7 blocks of data. This gives us our
            // current block plus three previous and three subsequent ones.
            // Each item in the cache is an array of three elements:
            //      starting offset
            //      ending offset
            //      row data.
            // The elements are sorted by starting offset so a cache lookup
            // is basically searching for the first block where the requested
            // offset is between starting offset and ending offset. Since the
            // cache is small we just do linear searches.
            this.cache = [];
            // We keep a reference to the current block here since most requests
            // will generally be satisfied by the current one.
            this.currentCacheIndex = null;

            this.dataSource = dataSource;

            // todo add a flag to indicate if the request for data is asynchronous?
        }

        RowDataCacheConstructor.prototype.getRowAtOffset =
            /**
             * Returns, via a promise, the data for the row at the indicated
             * offset in the dataset. If we cannot satisfy this request from
             * the currently cached data then we'll request a new block from
             * the data source.
             * @param offset The position of the row in the data source, indexed
             *                  from 0.
             * @return a promise to return the row or an error indication.
             *          We don't know if this will be an asynchronous or synchronous
             *          request.
             */
            function( offset ) {
                AMO.log.debug( "getRowAtOffset: offset = " + offset );
                var defer = q.defer();

                var row = getRowFromCache.call( this, offset );
                if (!! row) {
                    defer.resolve( [offset, row ] );
                } else {
                    // The row is not in the cache and we need to go to
                    // the server to fetch it. However, we don't necessarily
                    // do this immediately. The grid currently adds row HTML
                    // to the view for every row in the current block of
                    // data--generally more than can be shown at one time.
                    // So, just because we hit the end of the block doesn't
                    // mean we should ask the data source to fetch more data.
                    // If we did so then we'd end up rendering every row--
                    // perhaps many thousands.
                    //
                    // So, we need to decide if more rows should be requested.
                    // I think the only reason here would be if the current
                    // rendered rows do not completely fill the visible space
                    // in the UI. In other places we'll request more data
                    // when we're getting near the end of the current block
                    // of data--to preload.
                    // todo:, a hack for now while I redesign how rows are fetched.
                    if (offset === 0) {
                        getRowFromServer.call(this, offset)
                            .then(
                            function(row) {
                                defer.resolve([offset, row ]);
                            },
                            function(reason) {
                                defer.reject(reason);
                            }
                        );
                    }
                }

                return defer.promise;
            };

        // Private methods.
        var getRowFromCache =
                /**
                 * Sees if the row at the indicated offset is in our cache. If so, the
                 * row's data (the "row") is returned. Otherwise null is returned.
                 * @param offset The zero-based position of the requested row in the dataset.
                 * @return The row, if it is in our cache or null.
                 */
                function( offset ) {
                    // Iterate over the cache until we find a cached block that contains
                    // the requested offset. If we can't find one then return null.
                    // Since the next row is likely to be in the block that contained the
                    // previously returned row we start there first.
                    var block,
                        cache = this.cache;

                    if (this.currentCacheIndex !== null) {
                        block = this.cache[this.currentCacheIndex];
                        if ((block[0] <= offset) && (offset < block[1])) {
                            return block[2][offset - block[0]];
                        } else {
                            // Not in the recently used one. Search the cache.
                            // Could optimize out the block at currentCacheIndex. Maybe later.
                            var i, l;
                            for (i = 0, l = cache.length; i < l; i++) {
                                block = cache[i];
                                if ((block[0] <= offset) && (offset < block[1])) {
                                    return block[2][offset - block[0]];
                                }
                            }

                            // Not in the cache.
                            return null;
                        }
                    }

                    // No cache.
                    return null;
                },

            getRowFromServer =
                /**
                 * Send a request to the data source for the indicated row. What we'll
                 * receive back is a block of rows that contain the row at this offset.
                 * We might also receive an EOD.
                 * @param offset
                 */
                function( offset ) {
                    // The data source returns a promise for the data. We also return a promise that
                    // is fulfilled when the server's promise completes.
                    var defer = q.defer(),
                        localThis = this;

                    AMO.log.debug( "    getRowFromServer: offset = " + offset );
                    // Only query the data source if it is a function. See the
                    // constructor for details but if the dataSource were just
                    // a block of row data then this.dataSource is null.
                    if (!! this.dataSource) {
                        this.dataSource.getData(
                            offset,
                            function(columns, retrievedRows, offset ) {
                                addBlockToCache.call( localThis, retrievedRows, offset );
                                var requestedRow = getRowFromCache.call( localThis, offset );
                                if (!! requestedRow) {
                                    defer.resolve( requestedRow );
                                } else {
                                    AMO.log.debug( "Unable to get the row after retrieving more data: offset = " + offset );
                                    defer.reject( "Unable to get the row after retrieving more data: offset = " + offset );
                                }
                            },
                            function(error) {
                                defer.reject(error);
                            }
                        );
                    } else {
                        defer.reject( "EOD" );
                    }

                    return defer.promise;
                },

            addBlockToCache =
                /**
                 * rows is an array containing one or more row data hashmaps. We insert
                 * it into our cache, possibly removing some data.
                 * @param rows an array of hashmaps where each hashmap is the data for one row.
                 * @param startingOffset The offset into the data source for the first row in rows.
                 */
                    function( rows, startingOffset ) {
                    // We insert this row into the cache array in a way that keeps
                    // the starting offsets sorted.
                    var cache = this.cache;
                    if (cache.length > 0) {
                        // Find the first cache entry where the ending offset is
                        // equal to or less than this one. We'll insert our cache
                        // entry there.
                        if (startingOffset < cache[0][0]) {
                            // Insert the new row at the start of the cache.
                            cache.unshift( [startingOffset, startingOffset + rows.length, rows] );
                            this.currentCacheIndex = 0;

                            // Prune the other end of the cache if it's getting too big.
                            if (cache.length > 7) {
                                cache.pop();
                            }
                        } else if (cache[cache.length - 1][1] <= startingOffset) {
                            // Insert the new row at the end of the cache.
                            cache.push( [startingOffset, startingOffset + rows.length, rows] );

                            // Prune the other end of the cache if it's getting too big.
                            if (cache.length > 7) {
                                cache.shift();
                            }

                            this.currentCacheIndex = 0;
                        } else {
                            // We need to find the position within this cache. Note that
                            // because the previous two if tests failed we know that we
                            // can ignore the first and last elements. Remember that they
                            // could be the same element so just ignore the first one.
                            var i, l, inserted = false;
                            for (i = 1, l = cache.length - 1; ! inserted && (i < l); i++) {
                                if (startingOffset < cache[i][0]) {
                                    // The new block should be placed before the current one.
                                    cache.splice( i, 0, [startingOffset, startingOffset + rows.length, rows] );
                                    inserted = true;
                                }
                            }
                            this.currentCacheIndex = i;
                        }
                    } else {
                        // The cache is empty, just insert this block.
                        this.cache[0] = [startingOffset, startingOffset + rows.length, rows];
                        this.currentCacheIndex = 0;
                    }
                };

        return RowDataCacheConstructor;
    }());

}());
