"use strict";
/**
 * The top-level directive for our ngCoral grid.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    // Put some angular services into closure space so that we don't
    // have to pass them to the actual constructor function.
    var utils;

    angular.module( "ngCoral").directive(
        'cuiGridBody',
        [
            "$compile", "$timeout", '$q', 'UtilitiesFactory',
            function( $compile, $timeout, $q, utilitiesFactory ) {
                utils = utilitiesFactory;

                var controllerConstructor = (function() {

                    controllerConstructor =
                        function($scope) {
                            var
                                /**
                                 * This method (a callback) is invoked by the data source when
                                 * data has been retrieved successfully. This is done in response
                                 * to a DataSource.getData call.
                                 * @param columns Ignored. The first call to getData (or start)
                                 *                will have triggered the grid to be formed, with
                                 *                the column definitions.
                                 * @param rows An array of row data arrays.
                                 * @param offset The offset within the overall data request to the
                                 *               first row.
                                 * @param numRowsRequested The number of rows that we requested. If
                                 *               this value is less than the number we got then either
                                 *               the data source has hit the end of the data or it
                                 *               cannot provide the requested number of rows.
                                 */
                                dataReceived =
                                    function( columns, rows, offset, numRowsRequested ) {
                                        //AMO.log.debug( "Grid body: rows = " + (!! rows ? rows.length : 0) + ", offset = " + offset + ", numRowsRequest = " + numRowsRequested );
                                        if ((rows === null) || (rows.length === 0)) {
                                            $scope.eodOffset = offset;

                                            // Whenever we hit this condition we assume that the previous
                                            // request may have not returned as much data as we requested.
                                            // And, we would have lowered the rowsToRequest value to match
                                            // what was given. So, restore rowsToRequest. If it goes low
                                            // again we'll just repeat this process.
                                            $scope.rowsToRequest = $scope.previousRowsToRequest;
                                            $scope.$evalAsync(
                                                function() {
                                                    $scope.cuiAvailableOffsets = $scope.blockStore.getOffsetRange();
                                                }
                                            );
                                        } else {
                                            // addResult is null if the received block fits into the
                                            // block store without creating any gaps between the last
                                            // offset in one row and the first offset in the next one.
                                            // Otherwise, addResult is the number of rows we would need
                                            // to avoid any gaps. This only occurs when we're prepending
                                            // blocks to the existing set. The number of rows we requested
                                            // might be more than the data source can provide.
                                            var addResult = $scope.blockStore.addBlock(offset, rows);

                                            // Before continuing on, see if we got the number of rows that we
                                            // requested. If not then we tone down rowsToRequest. The real problem
                                            // is when we're preloading rows "above" our current position.
                                            // We may request more rows than the data source can provide and
                                            // we'll have to discard that block so that we don't leave a gap
                                            // in our continuous set of offsets. So we discard that block and
                                            // request a smaller number. However, there are some edge conditions
                                            // when we only receive a few rows--like paging from near the bottom
                                            // to the bottom or near the top to the top. In these cases, we
                                            // don't want our number of rows value to become some absurd value
                                            // like 1. So, if this happens we bump the value back up again.
                                            if (addResult === null) {
                                                if (numRowsRequested !== rows.length) {
                                                    $scope.previousRowsToRequest = $scope.rowsToRequest;
                                                    $scope.rowsToRequest = rows.length > 30 ? rows.length : 30;
                                                } else {
                                                    // If we did get the number of rows we requested but the number is
                                                    // too small then increase the range.
                                                    if (rows.length < 30) {
                                                        $scope.rowsToRequest = 100;
                                                    }
                                                }
                                                // The view is $watching cuiAvailableOffsets and will redraw if needed
                                                $scope.$evalAsync(
                                                    function() {
                                                        $scope.cuiAvailableOffsets = $scope.blockStore.getOffsetRange();
                                                    }
                                                );
                                                AMO.log.debug("Grid body data received: offset = " + offset + ", cuiAvailableOffsets = " + arrayToString( $scope.cuiAvailableOffsets ) );
                                            } else {
                                                // Not enough data. Reduce our request amount by the
                                                // amount we are missing. Our preload function will continue
                                                // trying.
                                                $scope.previousRowsToRequest = $scope.rowsToRequest;
                                                $scope.rowsToRequest = numRowsRequested - addResult;
                                                AMO.log.debug("Grid body data received, insufficient data" );
                                                preloadDataIfNeeded();
                                            }
                                        }

                                        if ($scope.rowsToRequest < 10) {
                                            $scope.rowsToRequest = 100;
                                        }
                                    },
                                errorCallback =
                                    function( error ) {
                                        AMO.log.debug( "error fetching grid data: " + error );
                                    },
                                /**
                                 * Data is retrieved asynchronously. It's possible that between when
                                 * the request is made and the data received that the user has physically
                                 * navigated away from that position in the grid--typically by scrolling
                                 * using the thumb. We want to ignore data requests that were made before
                                 * this scroll operation
                                 */
                                dataCurrencyCheck =
                                    function( currentScrollRequest, columns, rows, offset, numRowsRequested) {
                                        if ($scope.ignoreScrollRequestsBefore <= currentScrollRequest) {
                                            dataReceived( columns, rows, offset, numRowsRequested );
                                        }
                                    };

                            var viewChanged =
                                function( event, visibleRows ) {
                                    if (!! visibleRows) {
                                        // If visibleRows is null then we assume that the view is behind in its rendering.
                                        $scope.topRowOffset = parseInt( $( visibleRows[0]).attr( "offset" ) );
                                        $scope.bottomRowOffset = parseInt( $( visibleRows[1]).attr( "offset" ) );
                                        //AMO.log.debug( "viewChanged event received: visibleRows = " + arrayToString( [$scope.topRowOffset, $scope.bottomRowOffset] ) );
                                        preloadDataIfNeeded();
                                    }
                                };

                            var preloadDataIfNeeded =
                                /**
                                 * Looks at the rows that are currently visible in the grid and
                                 * determines if we should preload more rows. This is to support
                                 * smooth scrolling for the user.
                                 */
                                function() {
                                    if (! $scope.executingPreloadDataIfNeeded) {
                                        $scope.executingPreloadDataIfNeeded = true;
                                        var requestCounter = ++$scope.preloadRequestCounter;
                                        // Avoid some race conditions if we do preloading exactly
                                        // when the view itself is rendering. Don't try to do any
                                        // preloading until we actually have a range of offsets to
                                        // preload around. This can happen before the first data
                                        // block is received.
                                        if (!$scope.viewRendering && !!$scope.cuiAvailableOffsets) {
                                            $scope.previousAvailableOffsets[0] = $scope.cuiAvailableOffsets[0];
                                            $scope.previousAvailableOffsets[1] = $scope.cuiAvailableOffsets[1];

                                            // Use this to determine if we should load more data. For now,
                                            // concentrate on going forward.
                                            var scrollRequestNumber;
                                            //AMO.log.debug("preloadDataIfNeeded: (" + requestCounter + ") visibleRows = " + arrayToString([$scope.topRowOffset, $scope.bottomRowOffset]) + ", cuiAvailableOffsets = " + arrayToString($scope.cuiAvailableOffsets) + ", displayOffsets = " + $scope.topRowOffset + "--" + $scope.bottomRowOffset + ", eodOffset = " + $scope.eodOffset);
                                            // cuiAvailableOffsets[1] is the highest offset that we have in our cache. We generally
                                            // want to keep at least forwardCacheAmount extra rows in our cache, after the bottom-most
                                            // row that is visible in the grid (bottomRowOffset). This test determines if we have at
                                            // least forwardCacheAmount rows available beyone the bottom visible row--the user might scroll
                                            // into these.
                                            if ($scope.cuiAvailableOffsets[1] <= ($scope.bottomRowOffset + $scope.forwardCacheAmount)) {
                                                // Don't refetch past the end of the data.
                                                if (($scope.eodOffset === null) || ($scope.cuiAvailableOffsets[1] < $scope.eodOffset)) {
                                                    // Don't request another block if there is an outstanding
                                                    // request and it contains the requested offset.
                                                    var requestedOffset = $scope.cuiAvailableOffsets[1];
                                                    if (
                                                        // No outstanding request at this time.
                                                        !$scope.currentDataRequest ||
                                                            // An outstanding request but the offset we want will not be in the request's returned block.
                                                        (
                                                            // The requested offset is before the first row in the current block.
                                                        (requestedOffset < $scope.currentDataRequest[0]) ||
                                                            // The requested offset is beyond what could be returned, even if the returned
                                                            // block contained all the requested rows.
                                                        (($scope.currentDataRequest[0] + $scope.currentDataRequest[1]) < requestedOffset)
                                                        )
                                                    ) {
                                                        //AMO.log.debug("                     (" + requestCounter + ") loading below data from " + $scope.cuiAvailableOffsets[1]);
                                                        scrollRequestNumber = ++$scope.currentScrollRequest;
                                                        $scope.currentDataRequest = [requestedOffset, $scope.rowsToRequest, scrollRequestNumber];
                                                        $scope.datasource().getData(
                                                            requestedOffset,
                                                            function (columns, rows, offset, numRowsRequested) {
                                                                $scope.currentDataRequest = null;// no outstanding request.
                                                                dataCurrencyCheck(scrollRequestNumber, columns, rows, offset, numRowsRequested);
                                                                $scope.executingPreloadDataIfNeeded = false;
                                                            },
                                                            function (error) {
                                                                $scope.currentDataRequest = null;// no outstanding request.
                                                                errorCallback(error);
                                                                $scope.executingPreloadDataIfNeeded = false;
                                                            },
                                                            $scope.rowsToRequest
                                                        );
                                                    } else {
                                                        $scope.executingPreloadDataIfNeeded = false;
                                                    }
                                                } else if ($scope.cuiAvailableOffsets[0] !== 0) {
                                                        // Not at the top of the dataset so see if we should front-load any data.
                                                        scrollBackwardCacheCheck(requestCounter);
                                                } else {
                                                    //AMO.log.debug("                     (" + requestCounter + ") have sufficient data above and below the visible data" );
                                                    trimBlockStore();
                                                    $scope.executingPreloadDataIfNeeded = false;
                                                }
                                            } else if ($scope.cuiAvailableOffsets[0] !== 0) {
                                                // Not at the top of the dataset so see if we should front-load any data.
                                                scrollBackwardCacheCheck(requestCounter);
                                            } else {
                                                //AMO.log.debug("                     (" + requestCounter + ") we're good, already at offset 0.");
                                                trimBlockStore();
                                                $scope.executingPreloadDataIfNeeded = false;
                                            }
                                        } else {
                                            $scope.executingPreloadDataIfNeeded = false;
                                        }
                                        //AMO.log.debug("                     (" + requestCounter + ") >>>> done." );
                                    }
                                };

                            var scrollBackwardCacheCheck =
                                /**
                                 * Looks at the offset of the topmost visible row and determines how many
                                 * rows we have above this one in the cache. If not enough we'll request some more.
                                 * @param requestCounter
                                 */
                                function( requestCounter ) {
                                    if (($scope.topRowOffset - $scope.backwardCacheAmount) < $scope.cuiAvailableOffsets[0]) {
                                        var rowToLoadFrom = $scope.cuiAvailableOffsets[0] - $scope.backwardCacheAmount;
                                        if (rowToLoadFrom < 0) {
                                            rowToLoadFrom = 0;
                                        }
                                        if (rowToLoadFrom < $scope.cuiAvailableOffsets[0]) {
                                            // Don't request another block if there is an outstanding
                                            // request and it contains the requested offset.
                                            if (
                                                // No outstanding request at this time.
                                                ! $scope.currentDataRequest ||
                                                // An outstanding request but the offset we want will not be in the request's returned block.
                                                (
                                                    // The requested offset is before the first row in the current block.
                                                    (rowToLoadFrom < $scope.currentDataRequest[0]) ||
                                                    // The requested offset is beyond what could be returned, even if the returned
                                                    // block contained all the requested rows.
                                                    (($scope.currentDataRequest[0] + $scope.currentDataRequest[1]) < rowToLoadFrom)
                                                )
                                            ) {
                                                AMO.log.debug("                     (" + requestCounter + ") loading above data from " + rowToLoadFrom + ", requesting " + ($scope.cuiAvailableOffsets[0] - rowToLoadFrom) + " rows.");
                                                var scrollRequestNumber = ++$scope.currentScrollRequest;
                                                $scope.currentDataRequest = [ rowToLoadFrom, $scope.backwardCacheAmount, scrollRequestNumber ];
                                                $scope.datasource().getData(
                                                    rowToLoadFrom,
                                                    function (columns, rows, offset, numRowsRequested) {
                                                        $scope.currentDataRequest = null;// no outstanding request.
                                                        dataCurrencyCheck(scrollRequestNumber, columns, rows, offset, numRowsRequested);
                                                        $scope.executingPreloadDataIfNeeded = false;
                                                    },
                                                    function( error ) {
                                                        $scope.currentDataRequest = null;// no outstanding request.
                                                        errorCallback( error );
                                                        $scope.executingPreloadDataIfNeeded = false;
                                                    }, $scope.backwardCacheAmount
                                                );
                                            } else {
                                                $scope.executingPreloadDataIfNeeded = false;
                                            }
                                        } else {
                                            $scope.executingPreloadDataIfNeeded = false;
                                        }
                                    } else {
                                        AMO.log.debug("                     (" + requestCounter + ") no more above data needed for scrolling backward.");
                                        trimBlockStore();
                                        $scope.executingPreloadDataIfNeeded = false;
                                    }
                                };

                            var trimBlockStore =
                                /**
                                 * We only keep a limited number of data blocks. This method will trim excess.
                                 */
                                function() {
                                    if (! $scope.viewRendering) {
                                        if ($scope.blockStore.trimBlockStore( $scope.cuiVisibleRows ) > 0) {
                                            //AMO.log.debug("                     (--) blocks removed, updating availableOffsets.");
                                            $scope.cuiAvailableOffsets = $scope.blockStore.getOffsetRange();
                                        }
                                    }
                                };

                            var initializeGridBody =
                                /**
                                 * Called when we create or otherwise reload the grid's contents. Initialize
                                 * scope attributes, initialize/clear caches, etc.
                                 * @param action An array: [ request, ... ]
                                 *              request: Why we're being called:
                                 *                  "new" -- grid is being loaded for the first time.
                                 *                  "reload" -- The underlying datasource has been changed,
                                 *                              resulting in a new set of rows. This is typically
                                 *                              following a filter or sort operation.
                                 *                  "redraw" -- The grid has changed significantly, typically because
                                 *                              columns have been added or removed. We need to redraw
                                 *                              the entire grid.
                                 *                  "refresh" -- The grid's columns and data remain the same but the
                                 *                               overall dimensions of the grid have changed. We need
                                 *                               to regenerate it.
                                 */
                                function( action ) {
                                    AMO.log.debug( "cuiGrid.initializeGridBody: " + action[0] );
                                    // Our cache of data blocks received from the data source.
                                    // The number of rows we attempt to cache above the topmost visible row
                                    // and below the bottommost visible row.
                                    $scope.forwardCacheAmount = 250;
                                    $scope.backwardCacheAmount = 100;

                                    // Number of rows to request in each DataSource.getData call. If we
                                    // discover that the data source does not return as much as we
                                    // request then we'll tone this value down. Needed in the scope
                                    // because it is needed by the link function in one place.
                                    $scope.rowsToRequest = 100;

                                    // (Mostly) always contains the offset to the top-most and bottom-
                                    // most visible rows in the grid's visible area. These values are
                                    // updated when the grid is modified, like via scrolling. We use
                                    // these values to determine when to pre-fetch more data and optionally
                                    // remove data that is old. Part of our row caching mechanism
                                    $scope.topRowOffset = 0;
                                    $scope.bottomRowOffset = 0;

                                    if (action[0] !== "refresh") { // When we receive the no-more-data condition we store that offset.
                                        // We won't request data beyond this offset anymore.
                                        $scope.eodOffset = null;

                                        $scope.preloadRequestCounter = 0;
                                        $scope.previousAvailableOffsets = [-1, -1];

                                        if(action[0] === "new") {
                                            $scope.blockStore = new BlockStore($scope.backwardCacheAmount, $scope.forwardCacheAmount);
                                        }
                                        else {
                                            $scope.blockStore.emptyBlockStore();
                                        }

                                        // Keep track of outstanding data requests. Requests can take some number of seconds
                                        // to return and we don't want to have multiple scroll events issue multiple overlapping
                                        // requests. null means there is no outstanding request. Otherwise, currentDataRequest
                                        // is a two-element array: [ requested offset, number of rows requested ];
                                        $scope.currentDataRequest = null;

                                        // See the data currency check function. These two values let us determine
                                        // whether we will accept received data. If the data was requested--as represented
                                        // by currentScrollRequest--before a recent screen redraw--represented by the
                                        // value of ignoreScrollRequestsBefore--then we'll ignore the data.
                                        // Note that we may be reloading the data and we want to ignore all requests that
                                        // are made for the previous data set (scrolling, etc.)
                                        $scope.ignoreScrollRequestsBefore = ++$scope.currentScrollRequest;

                                        // When we adjust the value down we also keep the previous value that
                                        // it had. We go back to this value if the previous request--with less
                                        // data--was short because it hit the end of the data set.
                                        $scope.previousRowsToRequest = $scope.rowsToRequest;

                                        // Get data
                                        $scope.currentDataRequest = [ $scope.currentScrollRequest, $scope.rowsToRequest, $scope.currentScrollRequest ];
                                        $scope.datasource().getData(
                                            0,
                                            function (columns, rows, offset, numRowsRequested) {
                                                $scope.currentDataRequest = null;
                                                dataReceived(columns, rows, offset, numRowsRequested);
                                            },
                                            function ( error ) {
                                                $scope.currentDataRequest = null;
                                                errorCallback( error );
                                            },
                                            $scope.rowsToRequest
                                        );
                                    }

                                    $scope.cuiAvailableOffsets = null;
                                    $scope.visibleRows = null;
                                };

                            // Helps us ignore requests that are out of date.
                            $scope.currentScrollRequest = 0;
                            $scope.ignoreScrollRequestsBefore = 0;

                            initializeGridBody( [ "new" ] );

                            $scope.$on(
                                "manageGrid",
                                function( event, data ) {
                                    initializeGridBody( data );
                                }
                            );
                            $scope.executingPreloadDataIfNeeded = false;
                            $scope.$on(
                                "preloadDataIfNeededEvent",
                                function() {
                                    preloadDataIfNeeded();
                                }
                            );
                            // Load our initial set of data
                            $scope.$evalAsync(
                                function() {
                                    $scope.cuiAvailableOffsets = $scope.blockStore.getOffsetRange();
                                }
                            );

                            $scope.$on( "viewChanged", viewChanged );
                        };

                    return controllerConstructor;
                }());

                var link =
                    /**
                     * The link function for the grid body--the area where all of the rows are rendered.
                     * This link function is a bit different from other link functions in that it cannot
                     * insert HTML until the grid's data is available.
                     * @param $scope
                     * @param $element
                     */
                    function( $scope, $element, attrs, controller) {

                        // renderedBlocks tells us which blocks of rows have been rendered into
                        // the view. Each element in renderedBlocks is a two-element array that
                        // corresponds to a block of data we've received from the datasource.
                        // The first element is the offset--in the total row selection--to
                        // the first element in the block. The second element is a jQuery
                        // set of the HTML for these rows.
                        var renderedBlocks = [];

                        // If updateView is executing when a new request is received we
                        // set this to the requested offset. After we've drawn the view
                        // we set it back to null.
                        var requestedOffset = 0;

                        var updateViewCounter = 0;
                        var updateView =
                            /**
                             * The set of rows that are cached has been changed and we may
                             * need to update our view by adding new row directives or removing
                             * existing ones. At this time, this function is only called when
                             * cuiAvailableOffsets is changed and only dataReceived changes it.
                             */
                            function() {
                                var localCounter = ++updateViewCounter;
                                if (! $scope.viewRendering) {
                                    var availableBlocks = $scope.blockStore.getBlockList();
                                    AMO.log.debug("Update view: (" + localCounter + ") start, scroller top = " + $scope.rowsDiv.scrollTop() + ", offset = " + requestedOffset + ", availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks));

                                    // Block other requests.
                                    $scope.viewRendering = true;

                                    // Synchronize renderedBlocks with set of blocks in the BlockStore.
                                    // If a block is in block store and not in the view state then
                                    // add its contents to the view. Or, if a block is not in
                                    // block store but in view state we need to remove it from
                                    // the view.
                                    if (availableBlocks.length > 0) {
                                        // We actually have some rows.
                                        var a, r, // Indexes into availableBlocks and renderedBlocks.
                                            aLength = availableBlocks.length, rLength = renderedBlocks.length,
                                            mismatch, i;
                                        if (renderedBlocks.length === 0) {
                                            // Have data but nothing has been rendered into the view
                                            // so render everything..
                                            //AMO.log.debug( "             (" + localCounter + ") clean slate, availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks ) );
                                            invokeAppendRows(false, 0);
                                        } else {
                                            // There may be new data to show or existing data that needs
                                            // to be removed. We need to find where the set of available
                                            // blocks differs from the set of displayed blocks. To do so
                                            // we find the first block in each list that is the same. We
                                            // then synchronize around that point by adding new blocks and/
                                            // or removing existing blocks.
                                            var matchingIndices = findMatchingBlocks(0, 0);
                                            //AMO.log.debug( "             (" + localCounter + ") matching blocks: " + arrayToString( matchingIndices ) );

                                            // No differences if both are null. If only one is null then
                                            // there are no differences through the data in the shortest array,
                                            // meaning the other array has data to add (available) or remove (rendered)
                                            if ((matchingIndices[0] !== null) && (matchingIndices[1] !== null)) {
                                                a = matchingIndices[0];
                                                r = matchingIndices[1];

                                                if (r > 0) {
                                                    // The two arrays are out of sync. Any rendered rows before this
                                                    // should be removed and any available rows should be prepended.
                                                    // Then we'll start looking below here to find if/where the blocks
                                                    // again differ. This accommodates cases where new data is fetched
                                                    // before the current offset or existing blocks are removed from the
                                                    // cache.

                                                    // When we remove blocks of rows we need to reset the "top" attribute of
                                                    // the overall grid container so that the currently visible rows remain
                                                    // visible.
                                                    var gridRowsDiv = $element.find(".cui-Grid--rows");
                                                    var currentTop = parseInt(gridRowsDiv.css("top"));
                                                    var heightRemoved = 0;

                                                    for (i = --r; 0 <= i; i--) {
                                                        heightRemoved +=
                                                            ($(renderedBlocks[i][1][renderedBlocks[i][1].length - 1]).position().top + $(renderedBlocks[i][1][0]).outerHeight()) -
                                                            $(renderedBlocks[i][1][0]).position().top;
                                                        renderedBlocks[i][1].remove();
                                                    }
                                                    // Now shift the container's top to restore the originally visible top row--needs
                                                    // to be visible again.
                                                    gridRowsDiv.css("top", currentTop + heightRemoved);

                                                    // Removes the first elements.
                                                    renderedBlocks.splice(0, r + 1);
                                                    r = 0;
                                                    rLength = renderedBlocks.length;
                                                    //AMO.log.debug("             (" + localCounter + ") after removing rendered blocks, updated indices = " + arrayToString( [a,r] ) + ", availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks));
                                                }

                                                // We've now removed rendered blocks that are not in the available blocks.
                                                // We now need to add any new blocks.
                                                if (a > 0) {
                                                    // Some blocks in availableBlocks with rows that are "above"
                                                    // the topmost rows in renderedBlocks.
                                                    //AMO.log.debug("             (" + localCounter + ") after removing earlier items, inserting available data, updated indices = " + arrayToString([a, r]) + ", availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks));
                                                    invokeAppendRows(true, --a);
                                                } else {
                                                    // We know that the arrays match at the current a and r indices.
                                                    // We now need to determine where they differ beyond this--if they do.
                                                    // Increment through the two arrays until either
                                                    // we find a mismatch or we run out of data in one or the other.
                                                    mismatch = false;
                                                    do {
                                                        mismatch = availableBlocks[a++][0] !== renderedBlocks[r++][0];
                                                    } while (!mismatch && (a < aLength) && (r < rLength));

                                                    //AMO.log.debug( "             (" + localCounter + ") mismatch = " + mismatch + ", updated indices = " + arrayToString( [a,r] ) + ", max indices = " + arrayToString( [aLength, rLength]) + ", availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks )  );
                                                    // Did we find a mismatch?
                                                    if (mismatch) {
                                                        if (mismatch || ((a !== aLength) || (r !== rLength))) {
                                                            // There is a mismatch. Delete what remains in the rendered array
                                                            // and add what remains in the available array.
                                                            if (r !== rLength) {
                                                                for (i = r; i < rLength; i++) {
                                                                    renderedBlocks[i][1].remove(); // Removes these div elements from the DOM
                                                                }
                                                                renderedBlocks.splice(r, Number.MAX_VALUE);
                                                                //AMO.log.debug("             (" + localCounter + ") after removing later items, updated indices = " + arrayToString([a, r]) + ", availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks));
                                                            }
                                                            if (a !== aLength) {
                                                                //AMO.log.debug("             (" + localCounter + ") removed mismatches, rendering from " + a + ", availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks));
                                                                invokeAppendRows(false, a);
                                                            }
                                                        }
                                                    } else {
                                                        // There is no mismatch through the the elements that both
                                                        // arrays have. If both a and r are at the max lengths then
                                                        // we're done. However, if only r is at the max length then
                                                        // we need to add the remaining data from a.
                                                        if ((a === aLength) && (r === rLength)) {
                                                            // Done, finally.
                                                            repositionAtOffset();
                                                            $scope.visibleRows = getVisibleRowRange();
                                                            //AMO.log.debug("             (" + localCounter + ") == view rendering complete, availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks) + ", visibleRows = " + arrayToString( $scope.visibleRows ) );
                                                            $scope.viewRendering = false;
                                                            $scope.$emit("viewChanged", $scope.visibleRows);
                                                        } else {
                                                            // One or the other is not at its max length. Because there
                                                            // was no explicit mismatch we know that only one is at the
                                                            // max length.
                                                            if (r === rLength) {
                                                                invokeAppendRows(false, r);
                                                            } else {
                                                                // a is at max length. need to remove from r.
                                                                for (i = a; i < rLength; i++) {
                                                                    renderedBlocks[i][1].remove();
                                                                }
                                                                $scope.visibleRows = getVisibleRowRange();
                                                                //AMO.log.debug("             (" + localCounter + ") == view rendering complete after removing some rendered blocks, availableBlocks = " + arrayToString(availableBlocks) + ", renderedBlocks = " + arrayToString(renderedBlocks) + ", visibleRows = " + arrayToString( $scope.visibleRows )  );
                                                                $scope.viewRendering = false;
                                                                $scope.$emit("viewChanged", $scope.visibleRows);
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                // There are no matching blocks between the two arrays. We remove
                                                // all of the HTML attached to the existing blocks and add in the
                                                // available ones.
                                                for (i = 0; i < rLength; i++) {
                                                    renderedBlocks[i][1].remove();
                                                }
                                                //AMO.log.debug( "             (" + localCounter + ") removed all data, availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks ) );
                                                invokeAppendRows(false, 0);
                                            }
                                        }

                                        handleGridState(DATA_RENDERED);
                                    } else {
                                        $scope.visibleRows = getVisibleRowRange();
                                        //AMO.log.debug( "Update view: (" + localCounter + ") skipping, nothing to draw, cuiAvailableOffsets is empty: " + arrayToString( $scope.cuiAvailableOffsets ) + ", visibleRows = " + arrayToString( $scope.visibleRows )  );
                                        // No available data hence nothing to display. It's
                                        // possible that there is some data being displayed--
                                        // remove it.
                                        $element.find(".cui-Grid--rows .cui-Grid--renderedRows").empty();
                                        $scope.viewRendering = false;

                                        // Perhaps we need to load some additional blocks.
                                        $scope.$emit("viewChanged", $scope.visibleRows);

                                        // We may be issuing a request for data at this time. If so,
                                        // go to the "loading" state instead of the now data state.
                                        handleGridState(LOADING_MORE_DATA);
                                    }
                                }
                            };

                        // promiseCallback and invokeAppendRows operate as an asynchronous
                        // loop to insert all of the rows. There are two issues. First we need to let
                        // the current block's data be generated in the DOM. This requires
                        // a timeout--hence the asynchronous part of the loop. Second, as we're
                        // asynchronously adding (and possibly removing) DOM elements we may get
                        // another call to update the view. We may need to break out of our
                        // loop to handle that. So, invokeAppendRows starts the asynchronous
                        // part to insert one block of rows. The prependRows and appendRows
                        // method return promises that are resolved after the rows have been
                        // generated in the DOM. The callback--now operating in a different
                        // thread, invokes promiseCallback. This code determines if invokeAppendRows
                        // should be called again--the loop part.
                        var prependPromiseCallback =
                                function( children ) { promiseCallback( children, true );},
                            appendPromiseCallback =
                                function( children ) { promiseCallback( children, false );};

                        var promiseCallback =
                                /**
                                 * @param children The array that we insert into renderedBlocks.
                                 *                 See docs where renderedBlocks is defined.
                                 * @param prependRowsToView True if we just did a prepend operation
                                 */
                                function( children, prependRowsToView ) {
                                    //AMO.log.debug( "             ((" + updateViewCounter + ")) " + (prependRowsToView ? "prepend" : "append") + " rows complete." );
                                    // If another updateView request was received
                                    // while we're processing this current one then
                                    // we stop the current one and start over.

                                    // Insert the newly added HTML into our renderedBlocks array.
                                    // appends go at the bottom, prepends at the top. Use the
                                    // offset value in element 0 to determine where the block
                                    // should be inserted.
                                    if (renderedBlocks.length === 0) {
                                        renderedBlocks.push( children );
                                    } else {
                                        // Prepend or append--insert at start or end of the array.
                                        if (prependRowsToView) {
                                            renderedBlocks.splice( 0, 0, children );
                                        } else {
                                            renderedBlocks.push( children );
                                        }
                                    }

                                    $scope.viewRendering = false;
                                    setTimeout(
                                        function() {
                                            updateView();
                                        }, 0
                                    );
                                },
                            errorPromiseCallback = function() {};

                        var invokeAppendRows =
                            function( prependRowsToView, currentBlock ) {
                                var availableBlocks = $scope.blockStore.getBlockList(),
                                    oldBlocks = $scope.blockStore.getOldBlockList();
                                if (prependRowsToView) {
                                    if (currentBlock >= 0) {
                                        //AMO.log.debug( "             ((" + updateViewCounter + ")) prepending block " + currentBlock + ", block offset = " + availableBlocks[currentBlock][0] + ", availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks ) );
                                        prependRows(availableBlocks[currentBlock], !! oldBlocks )
                                            .then(prependPromiseCallback, errorPromiseCallback);
                                    } else {
                                        AMO.log.error( "             ((" + updateViewCounter + ")) prepending block, request for " + currentBlock + " is out of range, block offset = " + availableBlocks[currentBlock][0] + ", availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks ) );
                                    }
                                } else {
                                    if (currentBlock < availableBlocks.length) {
                                        // Before adding new rows to the grid's view area see if there
                                        // are old rows that should be removed.
                                        //AMO.log.debug("             ((" + updateViewCounter + ")) appending block " + (currentBlock + 1) + " of " + availableBlocks.length + ", block offset = " + availableBlocks[currentBlock][0] + ", availableBlocks = " + arrayToString( availableBlocks ) + ", renderedBlocks = " + arrayToString( renderedBlocks ) );
//
//                                                    if (!!oldBlocks) {
//                                                        AMO.log.debug("                 animating out" );
//                                                        $element.find(".cui-Grid--rows").css( "opacity", 0.2 );
////                                                        $element.find(".cui-Grid--rows").animate({ opacity: 0.2 }, 400);
//                                                    }
                                        appendRows(availableBlocks[currentBlock], !!oldBlocks)
                                            .then(appendPromiseCallback, errorPromiseCallback);
                                    }
                                }
                            };

                        var findMatchingBlocks =
                            /**
                             * Attempts to find the first pair of blocks in availbleBlocks
                             * and renderedBlocks that are for the same offset.
                             * @param a The current index into availableBlocks
                             * @param r The current index into renderedBlocks
                             * @returns An array with two elements. If we could find a match then
                             *          the array is [a,r]. If we couldn't find a match then either
                             *          a or r is null--null for the array that ran out of data.
                             */
                            function( a, r ) {
                                var availableBlocks = $scope.blockStore.getBlockList();
                                if ((a === availableBlocks.length) || (r === renderedBlocks.length)) {
                                    // We've exhaused one or the other list without finding a match
                                    return [
                                        a === availableBlocks.length ? null : a,
                                        r === renderedBlocks.length ? null : r
                                    ];
                                } else {
                                    var availableOffset = availableBlocks[a][0],
                                        renderedOffset = renderedBlocks[r][0];
                                    if (availableOffset === renderedOffset) {
                                        // Found two blocks that match!.
                                        return [a, r];
                                    } else if (availableOffset < renderedOffset) {
                                        // The current block in the available list is for an offset
                                        // that is before (above) the current rendered block. So
                                        // check the next available block against the current rendered one.
                                        return [a + 1, r];
                                    } else {
                                        return [a, r + 1];
                                    }
                                }
                            };

                        var repositionAtOffset =
                            /**
                             * Try to locate a rendered div with the indicated offset. If
                             * found position it at the top of the view. We don't change
                             * the view's positioning if the offset is one of the visible rows.
                             */
                            function() {
/*
                                // The offset is stored in the HTML of the row. We just need
                                // to locate the HTML and figure out the height of HTML above
                                // it. Remember, rows can have variable height.
                                var visibleRows = getVisibleRowRange();

                                if (!! visibleRows && (parseInt( $(visibleRows[0]).attr( "offset" ) ) <= requestedOffset) && (requestedOffset < parseInt( $(visibleRows[1]).attr( "offset" ) ))) {
                                    AMO.log.debug( "repositionAtOffset: offset " + requestedOffset + " is already visible." );
                                } else {
                                    var offsetToRow = 0,
                                        rowFound = false,
                                        rowContainer = $element.find(".cui-Grid--rows"),
                                        availableRows = rowContainer.children(),
                                        row, i, l,
                                        offsetToCompare = requestedOffset + '';

                                    for (i = 0, l = availableRows.length; !rowFound && (i < l); i++) {
                                        row = $(availableRows[i]);
                                        if (offsetToCompare === row.attr("offset")) {
                                            rowFound = true;
                                        } else {
                                            offsetToRow += row.outerHeight();
                                        }
                                    }

                                    if (rowFound) {
                                        /!*
                                         var top = parseInt( rowContainer.css( "top" )),
                                         bottom = top + ($element.height() - $element.find(".cui-Grid-labels").height()),
                                         visibleSpace = bottom - top,
                                         heightsOfSubsequentRows = 0;
                                         // A little complication. We would like to fill the entire
                                         // grid area--vs let scrolling push the last row up towards
                                         // the top of the grid's view area. So, if offsetToRow +
                                         // height of the grid area is less than the total pixels
                                         // we can show we'll back off a bit. The goal is to fill
                                         // the entire grid. The only caveat is when there isn't enough
                                         // data to fill it, even starting at offset 0.

                                         // Above we found the fow. Now see if subsequent rows have
                                         // enough data to fill the grid. If so, just use offsetToRow.
                                         // Otherwise, adjust offsetToRow so that the entire grid still
                                         // gets filled. So, see how much vertical space we still have
                                         // (without doing more data requests.)
                                         // The (heightsOfSubsequentRows < visibleSpace) test is only because
                                         // we need to ensure that enough data is there to fill the grid. Once
                                         // we exceed that we don't need to look further.
                                         for (; (i < l) && (heightsOfSubsequentRows < visibleSpace); i++) {
                                         heightsOfSubsequentRows += $( availableRows[i] );
                                         }
                                         *!/
                                        rowContainer.css( "top", -offsetToRow );
                                        //AMO.log.debug( "repositionAtOffset: offset " + requestedOffset + " located at position " + offsetToRow + ", availableRows = " + arrayToString( $scope.blockStore.getOffsetRange() ) );
                                    }
                                }
*/
                            };

                        var getVisibleRowRange =
                                /**
                                 * Locate the top-most and bottom-most visible rows in the
                                 * grid and return their offsets. This data will probably be used
                                 * to determine if more rows need to be cached.
                                 */
                                function() {
                                    var rowsParentArea = $element.find( ".cui-Grid--rows"),
                                        displayArea = rowsParentArea.find( ".cui-Grid--renderedRows" ),
                                        top = $element.find( ".cui-Grid--bodyWrapper").scrollTop(),
                                        bottom,
                                        rows = displayArea.children(),
                                        numRows = rows.length,
                                        topRow = null, bottomRow = null,
                                        accumulatedHeight = 0, i;

                                    if (numRows !== 0) {
                                        accumulatedHeight = parseInt( displayArea.css( "top" ) );
                                        //AMO.log.debug("getVisibleRowRange: top = " + top + ", bottom = " + bottom + ", numRows = " + numRows);
                                        // Accumulate the height of rows until we find the first one that
                                        // overlaps top. That row becomes are top visible one.
                                        for (i = 0; (i < numRows) && !topRow; i++) {
                                            accumulatedHeight += $(rows[i]).outerHeight();
                                            if (top < accumulatedHeight) {
                                                topRow = rows[i];
                                            }
                                        }
                                        if (!topRow) {
                                            if (i === numRows) {
                                                topRow = rows[i - 1];
                                                updateVisibleRowScopeAttribute( topRow, topRow );
                                                return [ topRow, topRow ];
                                            } else {
                                                updateVisibleRowScopeAttribute( null );
                                                return null;
                                            }
                                        }

                                        // If there is only one row then top == bottom.
                                        if (numRows > 1) {
                                            // And now to the bottom row.
                                            accumulatedHeight = 0;
                                            bottom = $element.find( ".cui-Grid--bodyWrapper").height();
                                            for (; (i < numRows) && !bottomRow; i++) {
                                                accumulatedHeight += $(rows[i]).height();
                                                if (bottom < accumulatedHeight) {
                                                    // A bit of an edge condition when only a few pixels of the
                                                    // row are really showing or most of it is masked by a scroll
                                                    // bar. In this case, use the previous row.
                                                    if ((bottom - accumulatedHeight) < 16) {
                                                        i--;
                                                    }
                                                    bottomRow = rows[i];
                                                }
                                            }
                                            //AMO.log.debug("                    bottomRow = " + (!!bottomRow ? $(bottomRow).attr("offset") : "(null)") + ", bottom = " + bottom + ", accumulatedHeight = " + accumulatedHeight);
                                            if (!bottomRow) {
                                                updateVisibleRowScopeAttribute( null );
                                                return null;
                                            }
                                        } else {
                                            bottomRow = topRow;
                                        }
                                        updateVisibleRowScopeAttribute( topRow, bottomRow );
                                        return [ topRow, bottomRow !== null ? bottomRow : topRow ];
                                    } else {
                                        //AMO.log.debug("getVisibleRowRange: no children in the view." );
                                        updateVisibleRowScopeAttribute( null );
                                        return null;
                                    }
                                },
                            updateVisibleRowScopeAttribute =
                                function( firstRow, lastRow ) {
                                    var firstRowOffset = 0;
                                    if (!! firstRow) {
                                        firstRowOffset = parseInt( $(firstRow).attr( "offset") );
                                    }
                                    requestedOffset = firstRowOffset;
                                    if (typeof $scope.cuiVisibleRows !== "undefined") {
                                        $scope.$evalAsync(
                                            function() {
                                                $scope.cuiVisibleRows = firstRow === null ? null : [ firstRowOffset, parseInt( $(lastRow).attr( "offset") ) ];
                                            }
                                        );
                                    }
                                };

                        var adjustGridPosition =
                            /**
                             * Given the rows that are currently rendered we'll reposition them and set the size
                             * of the overall container DIV so that 1) the scroller represents the full data set
                             * (vs just the rendered rows) and 2) the current rows are in their approximate position,
                             * based on offset.
                             */
                            function( rowToShow, resetScroller ) {
                                var displayArea = $element.find(".cui-Grid--rows"),
                                    renderArea = displayArea.find( ".cui-Grid--renderedRows" ),
                                    children = renderArea.children(),
                                    numDisplayedRows = children.length,
                                    firstRenderedRow, lastRenderedRow,
                                    firstRowOffset, lastRowOffset, firstRowTop,
                                    averageRowHeight,
                                    startingScrollTop = $scope.rowsDiv.scrollTop();

                                // Are there any rows?
                                if (children.length > 0) {
                                    // The position of the row we want to have at the top of the
                                    // visible part of the grid. This is its
                                    // Yes. We want the displayArea's height to be based on the total
                                    // number of rows. We don't know what each row's height is/will be
                                    // so make an estimate based on the average height of the rendered rows.
                                    firstRenderedRow = $( children[0] );
                                    lastRenderedRow = $( children[numDisplayedRows - 1] );
                                    averageRowHeight =
                                        ((lastRenderedRow.position().top + lastRenderedRow.height()) - firstRenderedRow.position().top) /
                                            numDisplayedRows;
                                    // Position the first row based on its offset.
                                    firstRowOffset = parseInt( firstRenderedRow.attr( "offset" ) );
                                    firstRowTop = averageRowHeight * firstRowOffset;
                                    renderArea.css( "top", firstRowTop );

                                    // And set the overall height of the container based on the total number of rows in
                                    // the dataset and the average height.
                                    var numberOfRows = $scope.cuiNumberOfRows;
                                    if ((typeof numberOfRows === "number") && ! isNaN( numberOfRows )) {
                                        if (numberOfRows > 0) {
                                            displayArea.height( numberOfRows * averageRowHeight );
                                        } else {
                                            displayArea.height( 500 * averageRowHeight );
                                        }
                                    }
                                    //if (resetScroller) {
                                    //    // Reset the scroller to where we have placed the rendered rows.
                                    //    // In particular, make sure rowToShow is positioned at the top
                                    //    // of the visible part of the view. All of our repositioning and
                                    //    // prepending of rows may have caused it to shift away.
                                    //    var newScrollerPosition = firstRowTop + rowToShow.position().top;
                                    //    $scope.rowsDiv.animate({scrollTop: newScrollerPosition}, 200);
                                    //}

                                    lastRowOffset = parseInt( lastRenderedRow.attr( "offset" ) );
                                    AMO.log.debug( "cuiGridBody.adjustGridPosition: rowToShow = " + rowToShow.attr( "offset" ) + ", resetScroller = " + resetScroller + ", height = " + displayArea.height() + ", averageRowHeight = " + averageRowHeight + ", firstRow = " + firstRowOffset + '/' + firstRenderedRow.css( "top" ) + ", lastRow = "  + lastRowOffset + '/' + lastRenderedRow.css( "top" ) + ", scroller position = " + startingScrollTop + '/' + $scope.rowsDiv.scrollTop() );
                                }
                            };

                        var prependRows =
                            function( block ) {
                                var defer = $q.defer();

                                var children = null, html, i,
                                    gridRowsContainer = $element.find( ".cui-Grid--rows"),
                                    offscreenBuffer = $element.parent( ".cui-Grid" ).find( ".cui-Grid--renderArea"),
                                    offset = block[0], availableRows = block[1], data = block[2], rowData, newTopProperty = 0;

                                var visibleRows = getVisibleRowRange();

                                // First append directives/html for each row into our offscreen
                                // buffer. We'll let the buffer gestate and then copy the rendered
                                // HTML into our view.
                                offscreenBuffer.empty();
                                for (i = 0; i < availableRows; i++) {
                                    rowData = data[i];
                                    $scope.rowData = rowData;
                                    $scope.offset = offset;
                                    $scope.rowSelected = $scope.selectedRows.getRowSelectionState( offset );
                                    // When we generate the row we need to see if this row was previously
                                    // displayed and selected. Due to scrolling we may have discarded the
                                    // row's HTML, where the checkbox was checked.
                                    html = "<cui-grid-row cui-config='cuiConfig()' row-selected='" + $scope.rowSelected + "' columns='columns()' cell-width='cellWidth' row-data='rowData' offset='" +
                                            offset + "'></cui-grid-row>";
                                    offscreenBuffer.append( html );
                                    children = offscreenBuffer.children();
                                    html = children.last();
                                    html[0].NGCORAL_ROW_DEF = [offset++, rowData];
                                }
                                $compile( offscreenBuffer )( $scope );

                                // Move these rows to the onscreen buffer.
                                children = offscreenBuffer.children();
                                var onscreenBuffer = gridRowsContainer.find( ".cui-Grid--renderedRows" );
                                var onscreenHeight = onscreenBuffer.height();
                                var offscreenHeight = offscreenBuffer.height();
                                children.prependTo(onscreenBuffer);
                                onscreenBuffer.css( "top", parseInt( onscreenBuffer.css( "top" ) + children.height() ) );

                                //// If the onscreen buffer is currently empty and we're inserting rows
                                //// for offset zero then we leave top at 0. This will show the new rows.
                                //// Otherwise, if there is currently data in the visible area we'll adjust
                                //// top so it remains visible.
                                //if (onscreenHeight > 0) {
                                //    newTopProperty = parseInt( onscreenBuffer.css( "top" ) ) - offscreenHeight;
                                //    onscreenBuffer.css( "top", newTopProperty );
                                //}
                                adjustGridPosition( $( visibleRows[0] ), false );

                                defer.resolve( [block[0], children] );

                                return defer.promise;
                            };

                        var appendRows =
                            /**
                             * Generates row HTML for each row in the block of data. The generated
                             * HTML is placed at the bottom of the HTML currently in the grid's view.
                             * @param block block[0] is the offset to the first row, block[1] is the number
                             *              of rows in the block to use (may be less than the total number
                             *              of rows in order to avoid overflowing onto the next block) and
                             *              block[3] is the data for the rows, an array of arrays.
                             * @param emptyFirst If true we'll clear out the existing HTML. We defer doing
                             *              this until now to avoid some redraw flicker.
                             * @returns an array: [ offset, jQuery set of the newly added children ]
                             */
                            function( block, emptyFirst ) {
                                var defer = $q.defer();

                                var children = null, html, i,
                                    gridRowsContainer = $element.find( ".cui-Grid--rows"),
                                    // Where we actually put the rendered rows. We use this extra div so that
                                    // we can set its "top" property within the overall gridRowsContainer. Remember,
                                    // we don't always render all of the rows but we want the scroller (which is
                                    // attached to gridRowsContainer) to reflect the entire dataset. So we adjust its
                                    // height and then put onscreenBuffer at a vertical position that reflects the
                                    // offse of the first rendered row.
                                    onscreenBuffer = gridRowsContainer.find( ".cui-Grid--renderedRows" ),
                                    offscreenBuffer = $element.parent( ".cui-Grid" ).find( ".cui-Grid--renderArea"),
                                    offset = block[0], availbleRows = block[1], data = block[2], rowData;

                                var visibleRows = getVisibleRowRange();

                                // First append directives/html for each row into our offscreen
                                // buffer. We'll let the buffer gestate and then copy the rendered
                                // HTML into our view.
                                offscreenBuffer.empty();
                                for (i = 0; i < availbleRows; i++) {
                                    rowData = data[i];
                                    $scope.rowData = rowData;
                                    $scope.offset = offset;
                                    $scope.rowSelected = $scope.selectedRows.getRowSelectionState( offset );
                                    html = "<cui-grid-row cui-config='cuiConfig()' row-selected='" + $scope.rowSelected + "' cell-width='cellWidth' columns='columns()' row-data='rowData' offset='" +
                                        offset + "'></cui-grid-row>";
                                    offscreenBuffer.append( html );
                                    children = offscreenBuffer.children();
                                    html = children.last();
                                    html[0].NGCORAL_ROW_DEF = [offset++, rowData];
                                }
                                $compile( offscreenBuffer )( $scope );

                                var firstAppend = false;
                                if (onscreenBuffer.length === 0) {
                                    gridRowsContainer.append( "<div class='cui-Grid--renderedRows'></div>" );
                                    onscreenBuffer = gridRowsContainer.find( ".cui-Grid--renderedRows" );
                                    firstAppend = true;
                                }
                                var existingContentToErase = null;
                                if (emptyFirst) {
                                    existingContentToErase = onscreenBuffer.children();
                                }

                                // Now move from the offscreen buffer to the main buffer.
                                children = offscreenBuffer.children();
                                children.appendTo( onscreenBuffer );
                                // Remove the previous stuff?
                                if (!! existingContentToErase) {
                                    existingContentToErase.remove();
                                }
                                // Happens whenever the grid is empty when we add new items.
                                if (! visibleRows) {
                                    visibleRows = getVisibleRowRange();
                                }
                                if (!! visibleRows) {
                                    adjustGridPosition( $(visibleRows[0]), firstAppend );
                                }

                                defer.resolve( [block[0], children] );

                                return defer.promise;
                            };

                        // The grid's body can be in a variety of states: no data, loading data,
                        // error, data rendered, etc. As the grid goes between states we make
                        // UI changes--showing "loading" animations, obscuring contents, etc.
                        var
                            // A new grid instance is being rendered.
                            INITIAL_STATE = "new",
                            // There is no data to display. This is not because the data is being
                            // loaded--the data source simply has no data.
                            NO_DATA_STATE = "no-data",
                            // The grid cannot be loaded for some reason.
                            ERROR_STATE = "error",
                            // The grid is empty while an entirely new offset range of data is being fetched.
                            LOADING_NEW_DATA = "loading-new",
                            // The grid is not empty. More data is needed to fill in more of the grid.
                            LOADING_MORE_DATA = "loading-more",
                            // Data has been rendered in the grid.
                            DATA_RENDERED = "data-rendered";

                        var handleGridState =
                                /**
                                 * The main entry point for handling state changes. We'll see if the
                                 * using code has provided a callback. If there is no callback or it
                                 * does not handle the new state then we'll change the grid.
                                 * @param newState
                                 */
                                function ( newState ) {
                                    //AMO.log.debug( "cuiGridBody.handleGridState: " + $scope.gridState + " --> " + newState );
                                    if (newState !== $scope.gridState) {
                                        var newStateHandled = false;
                                        // See if a callback wants to handle this.
                                        var body = $scope.cuiConfig().body;
                                        if (!! body && !! body.gridStatusCallback) {
                                            var callbackFunction, callbackData = null;
                                            if (typeof body.gridStatusCallback === "function") {
                                                callbackFunction = body.gridStatusCallback;
                                            } else {
                                                callbackFunction = body.gridStatusCallback[0];
                                                callbackData = utils.getNonNullValue( body.gridStatusCallback[1] );
                                            }

                                            newStateHandled = callbackFunction($element, $scope, newState, callbackData );
                                        }

                                        // If there was no callback or the callback didn't handle the new state
                                        // then handle it ourselves.
                                        if (!newStateHandled) {
                                            switch (newState) {
                                                case INITIAL_STATE:
                                                    handleInitialState();
                                                    break;
                                                case NO_DATA_STATE:
                                                    handleNoDataState();
                                                    break;
                                                case ERROR_STATE:
                                                    handleErrorState();
                                                    break;
                                                case LOADING_NEW_DATA:
                                                    handleLoadingNewDataState();
                                                    break;
                                                case LOADING_MORE_DATA:
                                                    handleLoadingMoreDataState();
                                                    break;

                                                default:
                                                case DATA_RENDERED:
                                                    handleDataRenderedState();
                                                    break;
                                            }
                                        }

                                        $scope.gridState = newState;
                                    }
                                },
                            handleInitialState =
                                function () {
                                    hideGridStateParts( ".cui-Grid--initialPart" );
                                    $element.find( ".cui-Grid--initialPart" ).css( { opacity: 1, visibility: "visible" } );
                                },
                            handleNoDataState =
                                function () {
                                    hideGridStateParts( ".cui-Grid--noDataPart" );
                                    $element.find( ".cui-Grid--noDataPart" ).css( { opacity: 1, visibility: "visible" } );
                                },
                            handleErrorState =
                                function () {

                                },
                            handleLoadingNewDataState =
                                function () {
                                    hideGridStateParts( ".cui-Grid--loadingNewDataPart" );
                                    $element.find( ".cui-Grid--loadingNewDataPart" ).css( { opacity: 0.5, visibility: "visible" } );
                                },
                            handleLoadingMoreDataState =
                                function () {
                                    hideGridStateParts( ".cui-Grid--loadingMoreDataPart" );
                                    $element.find( ".cui-Grid--loadingMoreDataPart" ).css( { opacity: 0.5, visibility: "visible" } );
                                },
                            handleDataRenderedState =
                                function () {
                                    hideGridStateParts( null );
                                },
                            hideGridStateParts =
                                function (exceptPart) {
                                    var contentParts = $element.find( ".cui-Grid-gridStatusPart" );
                                    if (!! exceptPart) {
                                        contentParts = contentParts.not( exceptPart );
                                    }
                                    contentParts.css( "opacity", 0 );
                                    contentParts.css( "visibility", "hidden" );
                                },

                            calculateColumnWidths =
                                /**
                                 * Determines the spacing that columns should use. It starts by assembling
                                 * the horizontal width required for columns that request absolute widths. It
                                 * then considers columns that need min-width values that are less than what
                                 * will be provided if columns simply use width=percent values. Finally, it
                                 * assigns widths to columns that can expand/contract. If necessary in order to
                                 * preserve minimum column widths--especially for variable-width columns--
                                 * the function will make rows longer (and hence scrollable.)
                                 *
                                 * The function's "output" is to update $scope attributes.
                                 */
                                function ( columns, rowWidth ) {
                                    // Determine the size of each column--absolute, percentage, etc.
                                    // We want to use percent widths. However, some columns will have widths we want
                                    // to maintain (like icon columns) while we want others to be wider, like campaign name.
                                    // We sum the fixed-width needs. We then determine the average percentage width to be
                                    // assigned to the remaining columns. However, this % should be based on the part of the
                                    // row that remains AFTER removing the width needed for the fixed-width columns. We
                                    // therefore adjust the average width by the fraction of the row that remains.
                                    var modifiedRowWidth = rowWidth,
                                        adjustedRowWidth = rowWidth,
                                    // We don't want columns to ever get below this width.
                                    // todo: make into a config option?
                                        minPercentColumnWidth = 72,
                                        fixedWidths = 0, percentWidths = 0,
                                        width, nonFixedWidth,
                                        numFixedWidthColumns = 0, numPercentWidthColumns = 0, numNoWidthColumns = 0;

                                    // Look for columns that have fixed-width requirements.

                                    // What the column width would be if all columns used percent widths.
                                    // Use this to determine if a min-width value is greater than this value.
                                    var startingWidth = rowWidth / columns.length,
                                        column;
                                    if (!! columns) {
                                        for (var i = 0, l = columns.length; i < l; i++) {
                                            column = columns[i];
                                            width = column.getWidth();
                                            if (!! width) {
                                                if (typeof width === "number") {
                                                    // Set this as our "render" width.
                                                    column.setRenderWidth(width);
                                                    column.setMinWidth(width);
                                                    fixedWidths += width;
                                                    numFixedWidthColumns++;
                                                } else if (typeof width === "string") {
                                                    // Assume the string is a percentage.
                                                    numPercentWidthColumns++;
                                                    percentWidths += parseInt( width );
                                                } else {
                                                    numNoWidthColumns++;
                                                }
                                            } else {
                                                numNoWidthColumns++;
                                                width = column.getMinWidth();
                                                if (typeof width === "number") {
                                                    if (width === null) {
                                                        width = 40; // Don't let columns collapse completely.
                                                        column.setMinWidth(width);
                                                    }
                                                    // If the min width value is less than the possible column
                                                    // width then just let the column use the percent option. If
                                                    // the min width value is greater than the possible width then
                                                    // use the min width.
                                                    if (width < startingWidth) {
                                                        column.setRenderWidth(null);
                                                    } else {
                                                        column.setRenderWidth(width);
                                                        fixedWidths += width;
                                                        numFixedWidthColumns++;
                                                    }
                                                }
                                            }
                                            AMO.log.debug( "cuiGridBody.cellWidth: column = " + column.getName() + ", render width = " + column.getRenderWidth() + ", minWidth = " + column.getMinWidth() + ", requiredWidth = " + column.getWidth() );
                                        }
                                    }

                                    // Any percentage- or flexible-width columns to handle.
                                    var numNonFixedWithColumns = columns.length - numFixedWidthColumns;
                                    if (numNonFixedWithColumns > 0) {
                                        // There are. Calculate a percentage for the remaining columns that will fill the
                                        // remaining grid space.
                                        nonFixedWidth = rowWidth - fixedWidths;
                                        $scope.cellWidth = nonFixedWidth / numNonFixedWithColumns;
                                    } else {
                                        $scope.cellWidth = rowWidth / columns.length;
                                    }

                                    // If the grid contains many columns or is narrow we might reach a width where the columns that
                                    // use the % width option are too narrow. So we don't let this cell width go below a minimum
                                    // amount. If it does go below then we add width to the row.
                                    var widthForPercentColumns = null;
                                    var contentArea;
                                    if ($scope.cellWidth < minPercentColumnWidth) {
                                        // % width columns would be too narrow. Add enough width to the row so that these
                                        // columns will be at least minPercentColumnWidth px wide.
                                        widthForPercentColumns = numNonFixedWithColumns * minPercentColumnWidth;

                                        modifiedRowWidth = fixedWidths + widthForPercentColumns;
                                        $scope.cellWidth = minPercentColumnWidth;

                                        // We make the row's width a percentage bigger to accommodate this additional width.
                                        adjustedRowWidth = 100.0 * (modifiedRowWidth / rowWidth) + '%';
                                        // Since we changed the row width we need to update the div that wraps the rows to give it extra width.
                                        contentArea = $element.find( ".cui-Grid--contentAreaPart");
                                        $scope.adjustedRowWidth = adjustedRowWidth;
                                    } else  {
                                        if ($scope.adjustedRowWidth !== "100%") {
                                            $scope.adjustedRowWidth = "100%";
                                            contentArea = $element.find( ".cui-Grid--contentAreaPart");
                                        }
                                    }
                                    contentArea.find( ".cui-Grid-labels").width( modifiedRowWidth );

                                    // The fixed-width columns have been handled. Now partition the remaining row width
                                    // by the % widths.
                                    if (numNonFixedWithColumns > 0) {
                                        // Go back over the columns and find ones that are not fixed widths. Assign
                                        // % columns an amount and the other ones $scope.cellWidth amount.

                                        // Start by dividing the remaining space between the % columns and the no-width columns.
                                        var noWidthColumnsWidth = numNoWidthColumns * $scope.cellWidth,
                                            percentWidthColumnsWidth = nonFixedWidth - noWidthColumnsWidth;

                                        // Do the percentages add up to 100%? If not, scale them. They will get what's left.
                                        var percentWidthScaleFactor = 1;
                                        if (percentWidths !== 100) {
                                            percentWidthScaleFactor = 100.0 / percentWidths;
                                        }

                                        for (var j = 0, k = columns.length; j < k; j++) {
                                            column = columns[j];
                                            width = column.getWidth();
                                            if (!! width) {
                                                if (typeof width === "string") {
                                                    column.setRenderWidth( ((parseInt( width ) / 100.0) * percentWidthScaleFactor) * percentWidthColumnsWidth );
                                                } else {
                                                    column.setRenderWidth( width );
                                                }
                                            } else {
                                                column.setRenderWidth( $scope.cellWidth );
                                            }

                                            // If the column does not have a min width then set it to our default
                                            // min width (currently 72px.)
                                            if (utils.isEmpty( column.getMinWidth() )) {
                                                column.setMinWidth( 72 );
                                            }
                                        }
                                    }

                                    $scope.adjustedRowWidth = adjustedRowWidth;
                                    AMO.log.debug( "                       rowWidth = " + rowWidth + ", modifiedRowWidth = " + modifiedRowWidth + ", fixedWidths = " + fixedWidths + ", columns = " + columns.length + "/" + numFixedWidthColumns + ", adjustedRowWidth = " + $scope.adjustedRowWidth );
                                    AMO.log.debug( "                       defaultWidth = " + $scope.cellWidth + ", startingWidth = " + startingWidth );
                                },

                             scrollViewToOffset =
                                function( offset ) {
                                    if ($scope.allowScrolling) { // Is this offset in our cache of blocks?
                                        $scope.allowScrolling = false;
                                        var blockContainingOffset = $scope.blockStore.getBlockContainingOffset(offset);
                                        if (!blockContainingOffset) {
                                            AMO.log.debug("           offset " + offset + " not in cache, emptying cache and refetching, scroller = " + $scope.rowsDiv.scrollTop() );
                                            // The requested offset is not in our cache. Clear the cache
                                            // and submit a request to the data store for this offset. The
                                            // view, via the updateView function, will asynchronously clear
                                            // and reload the view. This offset will appear as the first in
                                            // the block buffer.
                                            var scrollTop = $scope.rowsDiv.scrollTop();
                                            $scope.blockStore.emptyBlockStore();
                                            renderedBlocks = [];
                                            //$element.find(".cui-Grid--rows .cui-Grid--renderedRows").empty();
                                            //AMO.log.debug("           after empty block store: scroller = " + $scope.rowsDiv.scrollTop() );
                                            handleGridState(LOADING_MORE_DATA);
                                            AMO.log.debug("           after handleGridState: scroller = " + $scope.rowsDiv.scrollTop() );
                                            $scope.viewRendering = false;

                                            // Don't request another block if there is an outstanding
                                            // request and it contains the requested offset.
                                            if (
                                                // No outstanding request at this time.
                                                !$scope.currentDataRequest ||
                                                    // An outstanding request but the offset we want will not be in the request's returned block.
                                                (
                                                    // The requested offset is before the first row in the current block.
                                                (offset < $scope.currentDataRequest[0]) ||
                                                    // The requested offset is beyond what could be returned, even if the returned
                                                    // block contained all the requested rows.
                                                (($scope.currentDataRequest[0] + $scope.currentDataRequest[1]) < offset)
                                                )
                                            ) {
                                                // Trigger the view to reload. This will cause the view to clear itself.
                                                $scope.cuiAvailableOffsets = $scope.blockStore.getOffsetRange();

                                                AMO.log.debug("               cuiAvailableOffsets = " + arrayToString($scope.cuiAvailableOffsets) + ", rowsToRequest = " + $scope.rowsToRequest);
                                                var scrollRequestNumber = ++$scope.currentScrollRequest;
                                                $scope.ignoreScrollRequestsBefore = scrollRequestNumber;
                                                $scope.currentDataRequest = [offset, $scope.rowsToRequest, scrollRequestNumber];
                                                $scope.datasource().getData(
                                                    offset,
                                                    // A simplified version of dataReceived.
                                                    function (columns, rows, offset/*, numRowsRequested*/) {
                                                        $scope.currentDataRequest = null;// no outstanding request.
                                                        if ($scope.ignoreScrollRequestsBefore <= scrollRequestNumber) {
                                                            if (rows === null) {
                                                                AMO.log.debug("                 data not available for offset " + offset);
                                                            } else {
                                                                // Put this data into the block store and update cuiAvailableOffsets.
                                                                // This will trigger the view to redraw.
                                                                $scope.blockStore.addBlock(offset, rows);
                                                                var offsetRange = $scope.blockStore.getOffsetRange();
                                                                AMO.log.debug("           block received with " + rows.length + " rows, cuiAvailableOffsets = " + arrayToString(offsetRange));
                                                                $scope.$apply(
                                                                    function() {
                                                                        $scope.cuiAvailableOffsets = offsetRange;
                                                                    }
                                                                );
                                                            }

                                                            $scope.allowScrolling = true;
                                                        }
                                                    },
                                                    function (/*reason*/) {
                                                        $scope.currentDataRequest = null;// no outstanding request.
                                                        AMO.log.error("           Unable to fetch data at for offset = " + offset);
                                                        $scope.allowScrolling = true;
                                                    },
                                                    $scope.rowsToRequest
                                                );
                                            } else {
                                                AMO.log.debug("               skipping scrollTo request, getData request outstanding: requestedOffset = " + offset + ", current request = " + $scope.currentDataRequest[0] + "/" + $scope.currentDataRequest[1] + "/" + $scope.currentDataRequest[2]);
                                                $scope.allowScrolling = true;
                                            }
                                        }
                                    }
                                };

                        var config = $scope.cuiConfig(),
                            body = $scope.cuiConfig().body;
                        $element.addClass( "cui-Grid--body" );

                        // We want viewRendering operations to be serialized so that only
                        // one is going at a time.
                        $scope.viewRendering = false;
                        $scope.allowScrolling = true;

                        // Add our basic body HTML--a wrapper div with a div on the left for displaying
                        // rows and a div on the right for displaying the scroller.
                        //todo need to support adding the summary row here also. See cui-grid-column-labels.js. The code
                        //     needed here is for when the summary row is shown at the bottom of the grid.
                        var bodyHtml =
                            "<div class='cui-Grid--contentArea'>" +
                                "<div class='cui-Grid--contentAreaPart cui-Grid--mainContentPart'>" +
                                    "<cui-grid-column-labels cui-config='cuiConfig()' columns='columns()' cell-width='cellWidth'></cui-grid-column-labels>" +
                                    "<div class='cui-Grid--bodyWrapper'>" +
                                        "<div class='cui-Grid--rows'></div>" +
                                    "</div>" +
                                "</div>" +
                                "<div class='cui-Grid--contentAreaPart cui-Grid--initialPart cui-Grid-gridStatusPart' style='opacity: 1;'>Preparing the grid...</div>" +
                                "<div class='cui-Grid--contentAreaPart cui-Grid--loadingNewDataPart cui-Grid-gridStatusPart' style='opacity: 0;'>Fetching data...</div>" +
                                "<div class='cui-Grid--contentAreaPart cui-Grid--loadingMoreDataPart cui-Grid-gridStatusPart' style='opacity: 0;'>Fetching requested data....</div>" +
                                "<div class='cui-Grid--contentAreaPart cui-Grid--noDataPart cui-Grid-gridStatusPart' style='opacity: 0;'>No data to display</div>" +
                            "</div>";
                        $element.html( bodyHtml );
                        $compile($element.contents())($scope);
                        $scope.labelDiv = $element.find( "cui-grid-column-labels" );
                        $scope.rowsDiv = $element.find( ".cui-Grid--bodyWrapper");

                        calculateColumnWidths(
                            utils.hasAttribute( config, "columns.layout.columns" ) ? config.columns.layout.columns : null,
                            $element.innerWidth() - 16
                        );

                        var columns = utils.hasAttribute( config, "columns.layout.columns" ) ? config.columns.layout.columns : null;
                        $scope.lastResizeWidth = 0;
                        $( window ).resize(
                            function() {
                                var newWidth = $element.innerWidth() - 14 /* todo for the current custom scroll bar; remove when it is replace. */;
                                if (newWidth !== $scope.lastResizeEvent) {
                                    $scope.lastResizeEvent = newWidth;

                                    calculateColumnWidths(
                                        columns,
                                        $element.innerWidth() - 16
                                    );

                                    // Now resize all columns.
                                    // Finally, apply the column width.
                                    var minWidth, renderWidth, renderWidthType, widthToUse,
                                        defaultWidth = $scope.cellWidth,
                                        mainContentPart = $element.find( ".cui-Grid--mainContentPart"),
                                        cellsToUpdate, column;
                                    for (var j = 0, k = columns.length; j < k; j++) {
                                        column = columns[j];
                                        if (column.hasRenderWidthChanged()) {
                                            renderWidth = column.getRenderWidth();
                                            cellsToUpdate = mainContentPart.find(".column" + j);
                                            // is the width a string (percentage) or a number (px value)?
                                            // Changes how we assign a width to it.
                                            renderWidthType = typeof renderWidth;
                                            if (renderWidthType !== "undefined") {
                                                if (renderWidthType === "string") {
                                                    widthToUse = parseInt( renderWidth ) * newWidth;
                                                } else {
                                                    widthToUse = renderWidth;
                                                }
                                            } else {
                                                widthToUse = defaultWidth;
                                            }
                                            cellsToUpdate.css( { width: widthToUse } );
                                        }
                                        minWidth = column.getMinWidth();
                                        if ((minWidth !== null) && column.hasMinWidthChanged()) {
                                            cellsToUpdate.css( { minWidth: minWidth } );
                                        }
                                    }
                                }
                            }
                        );
                        var gridRowsArea = $element.find( ".cui-Grid--rows");
                        $scope.selectedRows =
                            new SelectedRows(
                                $element.find( "cui-grid-column-labels" ), gridRowsArea,
                                utils.hasAttribute( body, "row.selectionRule" ) ? utils.getAttribute(  body, "row.selectionRule" ) : "one"
                            );
                        // Put this object in the value attribute, if one was supplied.
                        if (typeof $scope.cuiValue !== "undefined") {
                            $scope.cuiValue = $scope.selectedRows;
                        }
                        $scope.$on(
                            "cui-grid-bodyHeight-updated",
                            function() {
                                // We need to resize the body wrapper to account for the height of
                                // the labels.
                                $element.find( ".cui-Grid--bodyWrapper")
                                    .height( $element.height() - $element.find( "cui-grid-column-labels" ).outerHeight() );
                            }
                        );
                        $scope.$on(
                            "cuiGrid-allSelectionChanged",
                            function( event, data ) {
                                //AMO.log.debug( "All selection state changed: selectionState = " + data.selectionState );
                                $scope.selectedRows.masterSelectionChanged( data.selectionState );

                                // All rows should be set to the state of the master selection.

                                $scope.$emit( "cuiGrid-selectionStateUpdated", $scope.selectedRows );
                            }
                        );
                        $scope.$on(
                            "cuiGrid-rowSelectionChanged",
                            function( event, data ) {
                                $scope.selectedRows.rowSelectionChanged( data.offset, data.selectionState, data.gridRow );
                                //AMO.log.debug( "Row selection state changed: offset = " + data.offset + ", selectionState = " + data.selectionState + ", rows = " + $scope.selectedRows.toString() );
                                $scope.$emit( "cuiGrid-selectionStateUpdated", $scope.selectedRows );
                            }
                        );
                        $scope.$on(
                            "cuiGrid-getSummaryData",
                            function( /*event, data*/ ) {
                                $scope.datasource().getSummaryResult(
                                    // When we get the summary data we broadcast it back.
                                    function( summaryColumns, summaryData ) {
                                        $scope.$broadcast(
                                            "cuiGrid-summaryDataAvailable",
                                            { columns: summaryColumns, data: summaryData }
                                        );
                                    },
                                    // Or not.
                                    function( reason ) {
                                        $scope.$broadcast( "cuiGrid-summaryDataNotAvailable", reason );
                                    }
                                );
                            }
                        );

                        $scope.$emit( "cuiGrid-bodyReady", $scope );

                        // Watch the $scope.cuiAvailableOffsets attribute. This changes when there is
                        // an additional block of rows to draw or perhaps a block of rows needs to
                        // be removed.
                        $timeout(
                            function() {

                                $scope.$watch(
                                    "cuiAvailableOffsets",
                                    function() {
                                        //AMO.log.debug( ">>> Detected change in cuiAvailableOffsets." );
                                        updateView();
                                    }
                                );
                            }, 0
                        );

                        // See initializeGridBody(...) in the controller for a description
                        // of the values we receive in the data.
                        $scope.$on(
                            "manageGrid",
                            function( event, data ) {
                                // The grid's layout or contents are being updated and we need to redraw
                                // rows. In this handler we make sure that the currently displayed rows
                                // are removed.
                                if (data[0] !== "refresh") {
                                    $element.find(".cui-Grid--rows.cui-Grid--renderedRows").empty();
                                    handleGridState( INITIAL_STATE );
                                    renderedBlocks = [];
                                    requestedOffset = 0;
                                    $scope.viewRendering = false;
                                    $scope.selectedRows =
                                        new SelectedRows(
                                            $element.find( "cui-grid-column-labels" ), gridRowsArea,
                                            utils.hasAttribute( body, "row.selectionRule" ) ? utils.getAttribute(  body, "row.selectionRule" ) : "one"
                                        );
                                    if (typeof $scope.cuiValue !== "undefined") {
                                        $scope.cuiValue = $scope.selectedRows;
                                    }
                                    $scope.cuiAvailableOffsets = null;
                                }
                            }
                        );

                        // The "no data" grid state is a bit difficult to determine locally. So,
                        // when cuiGrid gets the total number of rows in the data set it will
                        // send that data to us. We could just $watch cuiGrid's $scope.dimensions
                        // attribute but I don't want to increase the $watch burden for an event
                        // that happens infrequently.
                        $scope.$on(
                            "queryCount",
                            function ( event, numberOfRows ) {
                                if (numberOfRows === 0) {
                                    handleGridState( NO_DATA_STATE );
                                }
                            }
                        );

                        $scope.gridState = null;
                        handleGridState( INITIAL_STATE );

                        $scope.previousScrollTop = 0;
                        $scope.rowsDiv.scroll(
                            function( event ) {
                                AMO.log.debug( "scroll (t/l): " + $scope.rowsDiv.scrollTop() + '/' + $scope.rowsDiv.scrollLeft() + ", previousTop = " + $scope.previousScrollTop );
                                $scope.labelDiv.css("left", -$scope.rowsDiv.scrollLeft());
                                var scrollTop = $scope.rowsDiv.scrollTop();
                                if (scrollTop !== $scope.previousScrollTop) {
                                    $scope.previousScrollTop = scrollTop;
                                    // The user may have scrolled to a position that is outside
                                    // of the rows that are rendered. If so, we need to fetch more data.
                                    var numRows = $scope.cuiNumberOfRows,
                                        newOffset = 0;
                                    if (typeof numRows !== "undefined") {
                                        // Convert the thumb position to an offset (the index of the row within the
                                        // overall datasource that corresponds to the current vertical position in
                                        // the grid. Remember, we don't render all of the rows.
                                        newOffset = Math.ceil( (scrollTop / $scope.rowsDiv.find( ".cui-Grid--rows" ).height()) * numRows );
                                    }

                                    // Is this offset in the rows that are currently buffered and rendered?
                                    if (! $scope.blockStore.isOffsetInBlockStore( newOffset )) {
                                        AMO.log.debug( "              offset " + newOffset + " not in store" );
                                        setTimeout(
                                            function () {
                                                scrollViewToOffset( newOffset );
                                            }, 0
                                        );
                                    } else {
                                        AMO.log.debug( "              offset " + newOffset + " available" );
                                        $scope.$emit( "executingPreloadDataIfNeeded" );
                                    }
                                }
                            }
                        );
                    };

                return {
                    controller: controllerConstructor,
                    link: link,
                    restrict: 'E',
                    scope: {
                        datasource: '&',
                        columns: '&',
                        cuiConfig: '&',
                        // Updated to show the offsets of the rows that are currently in the UI.
                        // Updated as an array: [first-visible-offset, last-visible-offset, total-rows-in-dataset]
                        cuiVisibleRows: '=',
                        // The rows that are available in our cache.
                        cuiAvailableOffsets: "=",
                        // Total number of rows
                        cuiNumberOfRows: '='
                    }
                };
            }
        ]
    );

    // An instance of this class caches the blocks of data we get from the
    // data store.
    var BlockStore = (function() {

        var BlockStoreConstructor =
            function( backwardCacheLimit, forwardCacheLimit ) {

                // We don't want to cache too many blocks of data. These attributes are
                // the number of offsets before and after the visible offsets that we'll
                // keep in the cache.
                this.backwardCacheLimit = backwardCacheLimit;
                this.forwardCacheLimit = forwardCacheLimit;

                // Our cache of data blocks. Each entry in blocks is an array of three
                // elements: [ <offset to first row>, <num rows to use>, <data rows, an array> ]. The
                // entries in this structure are ordered by the first element, the offset.
                // The second element is the number of rows in the block to actually use.
                // offset + number of rows should not exceed the offset of the next row--that
                // is, we don't want any overlap.
                this.emptyBlockStore();

                // These are blocks that we no longer need but the do contain references
                // to HTML that is being displayed. The updateView method will detect if
                // anything exists here and will remove them--hopefully in a way that
                // prevents flicker in the view.
                this.oldBlocks = null;
            };

        BlockStoreConstructor.prototype.emptyBlockStore =
            function() {
                this.oldBlocks = this.blocks;
                this.blocks = [];
            };

        BlockStoreConstructor.prototype.getBlockList =
            function() {
                return this.blocks;
            };

        BlockStoreConstructor.prototype.getOldBlockList =
            function() {
                var oldBlocks = this.oldBlocks;
                this.oldBlocks = null;
                return oldBlocks;
            };

        BlockStoreConstructor.prototype.addBlock =
            /**
             * A new data block--an array of row data rows--should be added to the
             * blocks array.
             * @param offset The offset within the over all data request to the first
             *                  row in this block.
             * @param block The actual block of data.
             * @return null if we received enough data, a number if we didn't receive enough
             *              data. In this case the number is the number of additional rows we need.
             */
            function( offset, block ) {
                // Make sure the block has data!
                if (block.length === 0) {
                    //AMO.log.debug( "BlockStore.addBlock: block for offset " + offset + " is empty." );
                    return null;
                }
                // We typically insert blocks before the first block or after
                // the last block.
                if (utils.hasContents( this.blocks )) {
                    if (offset < this.blocks[0][0]) {
                        // Block should be inserted before the first block.
                        var lengthToUse = block.length;
                        if ((offset + lengthToUse) > this.blocks[0]) {
                            lengthToUse = this.blocks[0] - offset;
                            // Prepend the block we just received
                            this.blocks.splice( 0, 0, [offset, lengthToUse, block] );
                        } else if ((offset + lengthToUse) < this.blocks[0]) {
                            //AMO.log.debug( "did not receive enough data!" );
                            // If we don't get enough data in this block so that
                            // there is no gap in rows to the next block then we
                            // reject this block.
                            return this.blocks[0] - (offset + lengthToUse);
                        } else {
                            this.blocks.splice( 0, 0, [offset, lengthToUse, block] );
                        }
                    } else {
                        // Insert after the last block. If this block's first offset does not
                        // immediately follow the previous block then discard it.
                        var lastBlock = this.blocks[this.blocks.length - 1];
                        if (lastBlock[0] + lastBlock[1] === offset) {
                            this.blocks.push( [offset, block.length, block] );
                        }
                    }
                } else {
                    this.blocks = [ [offset, block.length, block] ];
                }

                return null;
            };

        BlockStoreConstructor.prototype.trimBlockStore =
            /**
             * As the user navigates through the data set we are constantly getting new
             * blocks of data. We need to periodically remove blocks that are no longer
             * close to the visible rows.
             * @param visibleOffsets
             */
            function( visibleOffsets ) {
                //AMO.log.debug( "BlockStore.trimBlockStore: store = " + arrayToString( this.blocks ) + ", visible offsets = " + arrayToString( visibleOffsets ) );
                var numberOfBlocksRemoved = 0;
                if (!! visibleOffsets && (this.blocks.length > 0)) {
                    // If we have any visible rows then see if there is cached data
                    // before this row that we can delete. We'll make sure that we
                    // retain at least this.backwardCacheLimit number of offsets/rows.
                    // These rows can become stale as the user scrolls down in the grid.
                    if (!! visibleOffsets[0]) {
                        var cacheLimit = visibleOffsets[0] - this.backwardCacheLimit;
                        if (cacheLimit >= 0) {
                            numberOfBlocksRemoved = this.removeBlocksBeforeOffset( cacheLimit );
                        }

                        // Now the same for rows after the visible rows. This could
                        // become stale if the user scrolls up in the grid.
                        this.removeBlocksAfterOffset( visibleOffsets[1] + this.forwardCacheLimit );
                    }
                }

                //AMO.log.debug( "                           " + numberOfBlocksRemoved + " removed, " + this.blocks.length + " remain." );
                return numberOfBlocksRemoved;
            };

        BlockStoreConstructor.prototype.removeBlocksBeforeOffset =
            /**
             * We only keep so many blocks in our live cache--typically two blocks
             * before the current block and two blocks after the current block, where
             * "current block" contains the data that is at the top of the current view.
             * This method removes all of the blocks that contain data that is before
             * the indicated offset.
             * @param offset Remove any block that contains offsets that are before
             *              this offset.
             * @return number of blocks that were removed.
             */
            function( offset ) {
                var numberOfBlocksRemoved = 0;

                // Iterate over the block store removing blocks where all of the offsets in the block
                // are above the indicated offset. We remove the cached blocks from this store. The
                // update view cycle will asynchronously remove the corresponding row DIVs from the
                // view itself.
                for (var i = 0; (i < this.blocks.length) && ((this.blocks[i][0] + this.blocks[i][1]) < offset); i++) {
                    // [2] is a jQuery set of the actual DIVs for the rows in this block.
                    // Remove them from the view. Later we'll redraw the view so that the same visible offset
                    // is at top.
                    //AMO.log.debug( "                           removing leading block: " + this.blocks[i][0] + "/" + this.blocks[i][1] );
                    numberOfBlocksRemoved++;
                }

                // If any blocks were removed then remove them from our store.
                if (numberOfBlocksRemoved > 0) {
                    this.blocks.splice( 0, numberOfBlocksRemoved );
                }

                return numberOfBlocksRemoved;
            };

        BlockStoreConstructor.prototype.removeBlocksAfterOffset =
            /**
             * Similar to removeBlocksBeforeOffset except that this method removes
             * data blocks with data that is all after this offset.
             * @param offset
             */
            function( offset ) {
                var numberOfBlocksRemoved = 0;
                var blockToRemove = null;
                // Never remove offset zero, by definition. That would be handled in the
                // removeBlocksBEFOREOffset method.
                for (var i = 1; i < this.blocks.length && (blockToRemove === null); i++) {
                    if (offset < this.blocks[i][0]) {
                        // Every offset in this block (and all following blocks) are after
                        // the indicated offset. They can be removed from the cache and view.
                        blockToRemove = i;
                    }
                }

                if (blockToRemove !== null) {
                    numberOfBlocksRemoved = this.blocks.length - blockToRemove;
                    this.blocks.splice( blockToRemove );
                    //AMO.log.debug( "                           removing trailing blocks: " + arrayToString( removedBlocks ) );
                }

                return numberOfBlocksRemoved;
            };

        BlockStoreConstructor.prototype.getBlockContainingOffset =
            function( offset ) {
                for (var i = 0, l = this.blocks.length; i < l; i++) {
                    if ((this.blocks[i][0] <= offset) && (offset < (this.blocks[i][0] + this.blocks[i][1]))) {
                        return this.blocks[i];
                    }
                }

                return null;
            };

        BlockStoreConstructor.prototype.getOffsetRange =
            /**
             * Returns a two-element array. The [0] element is the offset of the
             * first row in the first block of this.blocks. The [1] element is the
             * offset of the last row in this.blocks[this.blocks.length - ], the
             * last offset. Returns null if this.blocks is null or empty.
             */
            function() {
                if (utils.hasContents( this.blocks )) {
                    var lastBlock = this.blocks[this.blocks.length - 1];
                    return [this.blocks[0][0], lastBlock[0] + lastBlock[1], this.blocks.length, arrayToString( this.blocks )];
                } else {
                    return null;
                }
            };

        BlockStoreConstructor.prototype.isOffsetInBlockStore =
            /**
             * Returns true if the indicated offset is for a row that is currently
             * in our store.
             * @param offset Offset, within the overall data source's query, to the row
             *              we're checking.
             * @param true if the offset is in one of our blocks.
             */
            function( offset ) {
                var offsets = this.getOffsetRange();
                return !! offsets && ((offsets[0] <= offset) && (offset < offsets[1]));
            };

        return BlockStoreConstructor;
    }());

    var arrayToString =
        /**
         * Converts these arrays into a string form: [ nnn, nnn, nnn ]. Very
         * specific to this type of array... Just a debug logging tool.
         */
        function( array ) {
            if (typeof array === "undefined") {
                return "(undefined)";
            } else if (array === null) {
                return "(null)";
            } else if (array.length === 0) {
                return "[]";
            } else {
                var result = new utils.StringBuilder(), item;
                for (var i = 0; i < array.length; i++) {
                    if (array[i] instanceof Array) {
                        item = array[i][0] + '/' + (typeof array[i][1] !== "number" ? array[i][1].length : array[i][1] );
                    } else {
                        item = array[i];
                    }
                    result.append( utils.getNonNullValue( item, "(null)" ) );
                }

                return "[ " + result.toString( ", " ) + " ]";
            }
        };


    var SelectedRows = (function() {
        var srCounter = 0;
        // We let the user select rows in the grid so that group actions can be performed on them.
        // (This assumes that the row selection checkbox is present.) This class keeps a tally of
        // all selected rows. Note that we let the user preserve selections between pages.
        var SelectedRowsConstructor =
            /**
             * Initialize the selected rows object to an empty state (nothing selected.)
             * @param labelsArea A jQuery reference to the checkbox in the labels row. We
             *              use this to get the value of the checkbox and to update it in some cases.
             * @param gridBody A jQuery reference to the part of the grid where the rows are placed.
             *              We use this when we need to update the settings of the individual row
             *              select checkboxes.
             * @param allowDeselectSome True when the user of the grid can handle operations on all
             *              rows minus a select few. The alternative is when the operation can only
             *              handle operations on specific, defined rows, vs everything EXCEPT FOR
             *              specific, defined rows.
             * @param selectionRule An indication of the number of rows that can be selected concurrently.
             *              The permitted values are "one", "many" and "none". The latter choice is
             *              used when the table is display only (no select/interaction) or a click
             *              handler callback handles all of the selectionRule logic.
             */
            function( labelsArea, gridBody, selectionRule, allowDeselectSome ) {
                this.counter = ++srCounter;

                this.allowDeselectSome = typeof allowDeselectSome !== "undefined" ? allowDeselectSome : false;
                this.labelsArea = labelsArea;
                this.gridBody = gridBody;

                // This flag tracks the state of the row selectionRule checkbox that is shown on the
                // labels row. When this checkbox is selected we will automatically select all
                // rows in the dataset.
                this.masterSelectionChecked = false;

                // This is a sparse array that contains rows whose selectionRule state is the opposite
                // of this.masterSelectionChecked. Each entry is the offset of the row and the
                // row data itself. For example, the user selects the master checkbox
                // in the label row. The checkbox of each displayed row in the UI is automatically
                // checked. The user then unchecks rows 5 and 10. this.rowState will then be:
                //      [ [5, data], [10, data]  ]
                this.rowState = [];

                // Represents the number of elements in rowState that actually contain
                // data. Rather than search through the entire array counting non-undefined
                // elements we increment/decrement this for each add/remove.
                this.numberOfSelectedRows = 0;

                this.selectionCounter = 0;

                this.selectionRule = selectionRule;
            };

        SelectedRowsConstructor.prototype.masterSelectionChanged =
            /**
             * The column labels row can contain a checkbox. Selecting/deselecting
             * this checkbox causes all rows to be selected or deselected.
             * @param masterCheckboxState
             */
            function( masterCheckboxState ) {
                this.masterSelectionChecked = masterCheckboxState;
                // Clears the current selected/deselected list.
                this.rowState = [];

                // Update all of the select row checkboxes.
                if (!! this.gridBody && (this.gridBody.length > 0)) {
                    this.gridBody.find( ".selectionCell input").prop( "checked", masterCheckboxState );
                }
            };

        SelectedRowsConstructor.prototype.rowSelectionChanged =
            /**
             * The list represents rows that are not in the same state as
             * the master checklist. So, basically four quadrants here. We
             * want the rowState array to show rows whose selection state
             * is the opposite of the master state. Or, a row should not
             * be in the rowState array if it is in the same state as
             * the master selection state.
             *
             * Note that the state of
             * allowDeselectSome alters this behavior. When false we never
             * allow select all + deselect some. So if the user selects a
             * row's checkbox and the master selection is "selected" we'll
             * first deselect it.
             * @param offset The position of this row in the overall query.
             * @param rowCheckboxState The state of the checkbox, assuming the
             *                          user's recent click has taken effect.
             * @param row The actual row object in the HTML, a jQuery reference.
             */
            function( offset, rowCheckboxState, row ) {
                // Is the user even allowed to select a row?
                if (this.selectionRule === "none") {
                    return;
                }

                var rowStateToUse = rowCheckboxState;
                if (! this.allowDeselectSome && this.masterSelectionChecked) {
                    // We need to force the master checkbox to false.
                    this.labelsArea.find( ".selectionCell input" ).prop( "checked", false );
                    this.masterSelectionChecked = false;
                    // And update all of the select row checkboxes.
                    if (!! this.gridBody && (this.gridBody.length > 0)) {
                        this.gridBody.find( ".selectionCell input").prop( "checked", false );
                    }

                    // Also remove the row-selected style from each row.
                    this.gridBody.find( ".cui-Grid--row-selected").removeClass( "cui-Grid--row-selected" );

                    // Switch the click to select the checkbox.
                    // todo- make sure the checkbox is also changed...
                    rowStateToUse = true;
                }

                // Now handle per the defined logic. If we're in the state of not
                // allowing select all + deselect then we'll not hit the "true" part
                // of the following if statement.
                if (this.masterSelectionChecked) {
                    // When the master checkbox is true/checked the rowState
                    // array contains rows whose checkbox selection is false/unchecked.
                    // Remember, as we display rows for the first time we'll
                    // automatically select the checkbox.
                    if (rowStateToUse) {
                        removeRow.call( this, offset, row );
                    } else {
                        addRow.call( this, offset, row );
                    }
                } else {
                    // The opposite. The master checkbox is unselected. So rowState
                    // should only contain rows that are checked.
                    if (rowStateToUse) {
                        // Only allow a single row to be selected? If so, first deselect
                        // any existing selected row before selecting the new one.
                        if (this.selectionRule === "one") {
                            deselectAllRows.call( this );
                        }
                        addRow.call( this, offset, row );
                    } else {
                        removeRow.call( this, offset, row );
                    }
                }

                this.selectionCounter++;
            };

        SelectedRowsConstructor.prototype.getRowSelectionState =
            /**
             * Returns true if the row at the indicated offset is selected--
             * that is, it's checkbox should be checked.
             * @param offset
             */
                function( offset ) {
                // Determine if the indicated offset is in any of the ranges
                // in rowStatus. If this.masterSelectionChecked is true then
                // being in one of the ranges means the row is unchecked so return
                // false. Otherwise, if this.masterSelectionChecked is false then
                // being in one of these ranges means the row is checked so return true.

                // Becomes true if the row is in one of the ranges.
                var rowInRange = false;
                if (this.rowState.length > 0) {
                    for (var i = 0, l = this.rowState.length; ! rowInRange && (i < l); i++) {
                        rowInRange = this.rowState[i][0] === offset;
                    }
                }

                return this.masterSelectionChecked ? ! rowInRange : rowInRange;
            };

        SelectedRowsConstructor.prototype.getSelectedRows =
            /**
             * Returns all of the selected rows as an array. Each element
             * of the array is the actual row data--itself an array. This
             * means that the caller--or whomever the caller passes the data
             * to--must understand the columns that are in this array.
             *
             * The actual return value of the method is an array with three
             * elements:
             *      [0] state of the masterSelectionChecked attribute.
             *      [1] the array of row items.
             *      [2] the array of offsets
             * If [0] is true and no individual rows have been deselected
             * then [1] is null. If [0] is false and no individual rows
             * have been selected then [1] is also null. In this case there
             * are no rows to operate on.
             * Otherwise if there have been rows that are selected or
             * deselectd then [1] is an array of those items. Keep in mind
             * that the state of allowDeselectSome influences this. If this
             * attribute is false then we would not have the case where [0]
             * is true and [1] is not null.
             *
             * The array of offsets contains the position within the current
             * data set to the selected rows. So, selectedOffsets[i] is the
             * offset of selectedRows[i] in the data set.
             */
            function() {
                // Return the rows that are in rowState. We actually return
                var selectedRows = null,
                    selectedOffsets = null,
                    derefRowState = this.rowState;

                if (derefRowState.length !== 0) {
                    // There are some selected rows. Move all of their
                    // row data values to the result array. Remember, each
                    // element is this.rowState is a two-element array:
                    // [the row's offset in the query, the row data (an array itself)]
                    selectedRows = [];
                    selectedOffsets = [];

                    for (var i = 0, l = derefRowState.length; i < l; i++) {
                        // rowState[][1] is the row data, an array of values.
                        // rowState[][0] is the offset to the row in the overall data set.
                        selectedRows.push( derefRowState[i][1][0].NGCORAL_ROW_DEF[1] );
                        selectedOffsets.push( derefRowState[i][0] );
                    }
                }

                return [this.masterSelectionChecked, selectedRows, selectedOffsets];
            };

        SelectedRowsConstructor.prototype.toString =
            /**
             * Just returns a formatted string that shows all of the ranges. Useful for
             * debugging, not that my code ever needs debugging, of course. But just in case...
             */
                function() {
                var result = new utils.StringBuilder();
                if (this.rowState.length === 0) {
                    result.append( "(no selected rows)" );
                } else {
                    result.append( "Selected row" + (this.rowState.length === 1 ? ": " : "s: ") );
                    result.append( this.rowState[0][0] );
                    for (var i = 1, l = this.rowState.length; i < l; i++) {
                        result.append( ", " + this.rowState[i][0] );
                    }
                }

                return result.toString( "" );
            };

        // Private methods

        // Add rows to the rowState array or remove rows from the array.
        // This array is a sparse array of rows whose checkbox state is
        // the opposite of the master checkbox state from the labels row.
        // Each entry in this array is indexed by the row's offset and
        // contains the jQuery object.
        var addRow =
                /**
                 * Add the row to the rowState list. The row's selection state
                 * is the opposite of the master checkbox state.
                 * @param offset The position of this row in the overall query
                 * @param row a jQuery object that wraps the selected row's HTML
                 */
                    function( offset, row ) {
                    // The trivial case--the rowState array is empty.
                    var l = this.rowState.length;

                    if (l === 0) {
                        this.rowState.push( [ offset, row ] );
                    } else {
                        // More complicated. We need to find where this offset should be
                        // inserted--just keeping the offsets in order.
                        var i, offsetHandled = false, item;

                        for (i = 0; (i < l) && ! offsetHandled; i++) {
                            item = this.rowState[i];
                            // Is offset before this element? If so, we'll either
                            // add it to this element or insert a new one.
                            if (offset < item[0]) {
                                if (i === 0) {
                                    this.rowState.unshift( [offset, row ] );
                                } else {
                                    this.rowState.splice( i, 0, [offset, row] );
                                }
                                offsetHandled = true;
                            }
                        }

                        // If we didn't handle the offset then we need to add a new element for it
                        // at the end of rowState.
                        if (! offsetHandled) {
                            this.rowState.push( [ offset, row ] );
                        }
                    }

                    // Add the CSS class that identifies this row as selected.
                    row.addClass( "cui-Grid--row-selected" );

                    this.numberOfSelectedRows++;
                },

            removeRow =
                /**
                 * Remove the row from the rowState list. The row's selection
                 * stae is the opposite of the master checkbox state.
                 * @param offset The position of this row in the overall query
                 */
                    function( offset, row ) {
                    // We need to find an existing span that includes this offset.
                    // We only need to look within existing elements. If it's not
                    // in any one then it is, by default, removed. I'm not sure,
                    // though, how we would get a request to remove one that was
                    // not already there. Remember, we only call this method if the
                    // master selection state is the same as the row's selection state.
                    //AMO.log.debug( "SelectedRows.removeRow: offset = " + offset + ", before = " + this.toString() );
                    var offsetRemoved = false, item;
                    for (var i = 0, l = this.rowState.length; ! offsetRemoved && (i < l); i++) {
                        item = this.rowState[i];
                        if (item[0] === offset) {
                            // Three cases. First, if removing the start or end of the range
                            // we just adjust the start or end value. Second, if the range is
                            // just this offset then we just remove the element. And third,
                            // if the offset is between (exclusive) the range bounds then we
                            // create two ranges that do not include the offset (split the
                            // range.)
                            this.rowState.splice( i, 1 );
                            offsetRemoved = true;
                        }
                    }

                    // Remove the CSS class that identifies this row as selected.
                    row.removeClass( "cui-Grid--row-selected" );

                    this.numberOfSelectedRows--;
                },

            deselectAllRows =
                /**
                 * Deselects all of the rows. This is often used when the grid only lets
                 * the user select a single row. Need to force a redraw to undo the selection checkbox?
                 */
                function () {
                    //AMO.log.debug( "SelectedRows.removeAllRows" );

                    // Clears the current selected/deselected list.
                    this.rowState = [];

                    // Update all of the select row checkboxes.
                    if (!! this.gridBody && (this.gridBody.length > 0)) {
                        // Unchecks the row selection checkboxes
                        this.gridBody.find( ".selectionCell input").prop( "checked", false );
                        // Remove the row selected CSS class.
                        this.gridBody.find( ".cui-Grid--row-selected").removeClass( "cui-Grid--row-selected" );
                    }
                };
        return SelectedRowsConstructor;
    }());
}());
