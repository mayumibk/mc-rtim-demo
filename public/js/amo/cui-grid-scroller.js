"use strict";
/**
 * The top-level directive for our ngCoral grid.
 *
 * Created by kmonahan on 1/8/15.
 */

(function() {
    var utils;

    angular.module( "ngCoral").directive(
        'cuiGridScroller',
        [
            '$compile', 'UtilitiesFactory',
            function( $compile, utilitiesFactory ) {
                utils = utilitiesFactory;

                var link =
                    function( $scope, $element ) {

                        // Set to true when the user is actually dragging the thumb in the
                        // scroller. For some reason, the page up/down handler is called first
                        // when the mouse is released, then the thumb handler is called. This
                        // probably reflects how jQuery Draggable handles animating the thumb.
                        // So, when this is true the page up/down handler will ignore a mouse up event.
                        var thumbBeingDragged = false;

                        var scrollUpHandler =
                            function() {
                                if (! thumbBeingDragged) {
                                    $scope.$emit("cuiGrid-scrollUp");
                                    return false; // No propagate.
                                }
                            };
                        var scrollDownHandler =
                            function() {
                                if (! thumbBeingDragged) {
                                    $scope.$emit("cuiGrid-scrollDown");
                                    return false; // No propagate.
                                }
                            };
                        var pageUpDownHandler =
                            /**
                             * Need to decide if the click is above or below the thumb. Note that
                             * event.data is $element. For some reason I can't reach $element via
                             * closure in this method. $scope is available, though.
                             * @returns {boolean}
                             */
                            function( event ) {
                                if (! thumbBeingDragged) {
                                    AMO.log.debug("page up/down event");
                                    var thumb = event.data.find(".cui-Grid--rowScroller-thumbWrapper"),
                                        thumbTop = thumb.position().top,
                                        mouseClick = event.offsetY;

                                    // Above the thumb? Because of the HTML organization we know that
                                    // we're between the top and bottom scrollers and not inside the
                                    // thumb. Otherwise different mouseup handlers would have caught
                                    // these clicks.
                                    if (mouseClick < thumbTop) {
                                        $scope.$emit("cuiGrid-pageUp");
                                        return false; // No propagate.
                                    } else if (mouseClick > (thumbTop + thumb.height())) {
                                        $scope.$emit("cuiGrid-pageDown");
                                        return false; // No propagate.
                                    }
                                }
                            };

                        var updateThumbPosition =
                            /**
                             * The row that is position at the top of the visible part of the grid
                             * has changed externally. We need to update the position of the thumb
                             * to reflect the new row offset.
                             * @param rowOffset
                             * @param numberOfRows The total number of rows in the data set. Used to
                             *              calculate the percentage of the scroll bar that is
                             *              represented by rowOffset
                             */
                            function( rowOffset, numberOfRows ) {
                                var thumb = $element.find(".cui-Grid--rowScroller-thumbWrapper"),
                                    thumbHeight = thumb.height(),
                                    thumbBoundsHeight = $element.find( ".cui-Grid--refThumbBounds").height();

                                // Where the top of the thumb should be placed based on the current row offset
                                // and the total number of rows represented by the thumb. Our intent is to position
                                // the middle of the thumb at the appropriate location.
                                var thumbTop = thumbBoundsHeight * (rowOffset / numberOfRows );
                                // Don't let the bottom of the thumb get pushed beyond the bottom of the scroll zone.
                                if ((thumbTop + thumbHeight) > thumbBoundsHeight) {
                                    // At the bottom--position it there.
                                    thumbTop = thumbBoundsHeight - thumbHeight;
                                } else {
                                    // Now adjust the thumb position so that its middle is aligned with the
                                    // indicated row. If we're at the top then just position it there..
                                    thumbTop -= thumbHeight / 2;
                                    // Keep the thumb completely within the scroll bar area.
                                    if (thumbTop < 0) {
                                        thumbTop = 0;
                                    } else if (thumbBoundsHeight < (thumbTop + thumbHeight)) {
                                        thumbTop = thumbBoundsHeight - thumbHeight;
                                    }
                                }
                                thumb.css( "top", thumbTop );
                                AMO.log.debug( "cuiGridScroller.updateThumbPosition from " + parseInt( thumb.css( "top" ) ) + " to " + thumbTop + ", rowOffset = " + rowOffset + ", numberOfRows = " + numberOfRows );
                            };

                        $element.addClass( "cui-Grid--rowScroller" );
                        $element.css( "opacity", 0 ); // We'll reveal it when we've put it into position.
                        $element.html(
                            "<div style='height: 100%;'>" +
                                "<div class='cui-Grid--rowScroller-up'></div>" +
                                "<div class='cui-Grid--rowScroller-down'></div>" +
                                "<div class='cui-Grid--refThumbBounds'>" +
                                    "<div class='cui-Grid--rowScroller-thumbWrapper'>" +
//                                        "<div class='cui-Grid--rowScroller-thumb'></div>" +
                                    "</div>" +
                                "</div>" +
                            "</div>"
                        );
                        $compile($element.contents())($scope);

                        // When we get the dimensions we adjust various parts of our scroller
                        // to fit the body. The dimensions attribute will be:
                        //      [ headerHeight, bodyHeight, labelHeight, numberOfRows ]
                        $scope.$watch(
                            "dimensions",
                            function() {

                                // To help visualize what each item is.
                                var headerHeight, bodyHeight, labelsHeight,numberOfRows, top, height,

                                    thumbBounds = $element.find(".cui-Grid--refThumbBounds"),
                                    scrollUpHeight = $element.find(".cui-Grid--rowScroller-up").height(),
                                    scrollDownHeight = $element.find(".cui-Grid--rowScroller-down").height(),
                                    thumb = $element.find(".cui-Grid--rowScroller-thumbWrapper"),
                                    thumbHeight = thumb.height(),
                                    scrollerHeight;

                                var newThumbPosition =
                                    /**
                                     * The user has dragged the thumb to a new position. We calculate
                                     * where this would correspond in the overall data.
                                     * @param event The drag event, we get the thumb's new position from here.
                                     * @param ui More from the drag event
                                     */
                                    function( event, ui ) {
                                        // The thumb itself has a height and the thumb cannot be moved
                                        // below the bottom of the scroller. Therefore, ui.position.top will
                                        // never exceed scrollerHeight - thumbHeight. Consequently, if we
                                        // just use the top of the thumb the user would not be able to
                                        // select rows below this point. So, assume we have these variables:
                                        //      scrollerHeight: the height of the full scroller.
                                        //      thumbHeight: the height of the thumb.
                                        //      scrollPosition: the offset within the scroll bar of the top
                                        //                      of the thumb after the scroll completes.
                                        //      maxScroll: scrollerHeight - thumbHeight. scrollPosition cannot
                                        //                 exceed this value because the bottom of the thumb is
                                        //                 against the bottom of the scrollable area.
                                        //      useMousePositionHeight: scrollerHeight -( 2 * thumbHeight ).
                                        //                  Once the thumb's top gets below this point we change
                                        //                  how we detect the thumb's position. Rather than look
                                        //                  at the top of the thumb we look at the mouse's position
                                        //                  within the thumb. This allows us to get offsets
                                        //                  below maxScroll.

                                        // Next complication. jQuery Draggable reports the mouse position differently
                                        // depending on whether the mouse button is released within the bounds of the
                                        // scroller or outside of it. When inside the scroller the mouse position (event.offsetY) is
                                        // the vertical offset from the top of the thumb. When outside the scroller
                                        // the mouse position is the offset from the top of the grid itself (including
                                        // header, labels, etc.) In order to get the proper delta from the top of the
                                        // scroller we need to do some adjustments and produce a corrected position.

                                        var scrollPosition;

                                        AMO.log.debug(
                                            "newThumbPosition: event.offsetX/Y = " + event.offsetX + "/" + event.offsetY +
                                                ", event.pageX/Y = " + event.pageX + "/" + event.pageY +
                                                ", event.screenX/Y = " + event.screenX + "/" + event.screenY +
                                                ", ui.offset.left/top = " + ui.offset.left + "/" + ui.offset.top +
                                                ", ui.position.left/top = " + ui.position.left + "/" + ui.position.top +
                                                ", ui.originalPosition.left/top = " + ui.originalPosition.left + "/" + ui.originalPosition.top +
                                                ", scrollerHeight = " + scrollerHeight + ", thumbHeight = " + thumbHeight
                                        );
                                        // Start by catching the top/bottom edge conditions.
                                        if (ui.position.top < 5) {
                                            // The thumb is pushed all the way to the top. Ignore the position
                                            // of the mouse within the thumb and go to the absolute top. Handle
                                            // the edge condition where ui.position.top may not be an integer 0.
                                            // When near the top it can be a small fractional value. Anyway,
                                            // detect if the user is really close to the top.
                                            scrollPosition = 0;
                                        } else if (Math.abs( (ui.position.top + thumbHeight) - scrollerHeight ) < 5) {
                                            // Like above, except the thumb has been pushed all the way to the bottom.
                                            // Go to the last offset. We assume that we've reached the bottom if we're
                                            // within a few pixels of the bottom. Sometimes the drag position is reported
                                            // in fractional pixels and exact matches are not appropriate.
                                            scrollPosition = scrollerHeight;
                                        }
                                        // Now look at the other options.
                                        else if (event.offsetY <= thumbHeight) {
                                            // Mouse was released inside the scroller. ui.position.top is the offset
                                            // to the top of the thumb.
                                            scrollPosition = ui.position.top + event.offsetY;
                                        } else if (event.offsetY < scrollerHeight) {
                                            // Thumb was released somewhere in the scroller.
                                            scrollPosition = event.offsetY;
                                        } else {
                                            // A weird edge condition here. The mouse itself (pointer, not the scroller's
                                            // thumb) can be outside the bounds of the scroll bar left-right but still
                                            // between the top and bottom of the scroller, from a screen perspective.
                                            // In this case the event.offsetY value is based on the browser window, not
                                            // the scroll bar. Need to take this into account. The jQuery draggable
                                            // plugin does not restrict this.
                                            if (event.offsetX > thumb.width()) {
                                                // We know that the thumb didn't reach the base of the scroller area--
                                                // a previous test would have caught that. So we just need to recalculate
                                                // a new "event.offsetY" based on absolute positions.
                                                scrollPosition = ui.position.top;
                                            } else {
                                                // The mouse is outside the scroller's vertical height. By definition
                                                // it has been moved to the bottom of the scroller so just set it
                                                // to the scroller's height.
                                                scrollPosition = scrollerHeight;
                                            }
                                        }

                                        var maxScroll = scrollerHeight - thumbHeight,
                                            useMousePositionHeight = maxScroll - thumbHeight,
                                            selectedRowOffset;

                                        if (scrollPosition <= 0) {
                                            // The top
                                            selectedRowOffset = "top";
                                        } else if (scrollPosition < useMousePositionHeight) {
                                            // Use the top of the scroller to determine the % of the scroller
                                            // was used and then the offset.
                                            selectedRowOffset = Math.floor( (numberOfRows * scrollPosition) / scrollerHeight );
                                        } else if (scrollPosition < scrollerHeight) {
                                            //  We do our calculation based on the position of the mouse in the thumb.
                                            selectedRowOffset = Math.floor( (numberOfRows * scrollPosition) / scrollerHeight );
                                        } else {
                                            // select the last offset.
                                            var thumbBottomFromPage = thumb.offset().top + thumbHeight;
                                            AMO.log.debug(
                                                "newThumbPosition: numberOfRows = " + numberOfRows +
                                                ", scrollerHeight = " + scrollerHeight +
                                                ", thumb bottom (page) = " + thumbBottomFromPage +
                                                ", mouse position = " + event.offsetY +
                                                ", corrected position = " + scrollPosition +
                                                ", thumb top = " + ui.position.top +
                                                ", thumb height = " + thumbHeight +
                                                ", thumb bottom = " + (thumb.offset().top + thumbHeight)
                                            );
                                            AMO.log.debug( "    event: offsetY = " + event.offsetY + ", pageY = " + event.pageY + ", screenY = " + event.screenY );
                                            AMO.log.debug( "       ui: offset.top = " + ui.offset.top + ", position.top = " + ui.position.top + ", originalPosition.top = " + ui.originalPosition.top );
                                            selectedRowOffset = "bottom";
                                        }

                                        AMO.log.debug( "grid scroller: offset = " + selectedRowOffset );
                                        $scope.$emit( "cuiGrid-scrollToOffset", selectedRowOffset );
                                    };

                                if (utils.hasContents( $scope.dimensions )) {
                                    // Now adjust the position and height of the scroller so that
                                    // it appears to sit to the right of the body, without overlapping
                                    // either the header or the footer.

                                    // To help visualize what each item is.
                                    headerHeight = $scope.dimensions[0];
                                    bodyHeight = $scope.dimensions[1];
                                    labelsHeight = $scope.dimensions[2];
                                    numberOfRows = $scope.dimensions[3]; // may be null

                                    top = headerHeight + labelsHeight + 1;
                                    height = bodyHeight - (labelsHeight + 3) - 16 /* above horiontal scrollbar area */;
                                    scrollerHeight = height - (scrollUpHeight + scrollDownHeight + 4 /* little space above and below */ );

                                    $element.css("top", top);
                                    $element.height(height);

                                    thumbBounds.css( "top", scrollUpHeight + 2 );
                                    thumbBounds.css( "bottom", scrollDownHeight + 2 );

                                    thumbBounds.height( scrollerHeight );

                                    // Make the thumb draggable.
                                    thumb.draggable(
                                        {
                                            animate: true, axis: "y",
                                            containment: thumbBounds,
                                            start: function() {
                                                thumbBeingDragged = true;
                                            },
                                            stop: function( event, ui ) {
                                                AMO.log.debug( "thumb stop event" );
                                                newThumbPosition( event, ui );
                                                thumbBeingDragged = false;
                                            }
                                        }
                                    );
                                    thumb.draggable( "enable" );
                                    // Setup some handlers for mouse clicks.
                                    $element.find( ".cui-Grid--rowScroller-up" ).mouseup( scrollUpHandler );
                                    $element.find( ".cui-Grid--rowScroller-down" ).mouseup( scrollDownHandler );
                                    $element.mouseup( $element, pageUpDownHandler );

                                    // Now make the scroller visible.
                                    $element.animate( { opacity: 1 }, 300 );
                                }
                            }
                        );

                        // External forces can cause changes in the thumb position. In particular, arbitrary
                        // scroll events will reveal different rows and the thumb needs to reposition itself
                        // to reflect the current row. Our scroller works on the basis of pixels so we cannot
                        // locally determine the new thumb position given some arbitrary pixel scroll. So,
                        // we watch this attribute for new thumb positions. When it changes we get the new
                        // row offset and then position the thumb accordingly.
                        $scope.$on(
                            "rowOffset",
                            function( event, rowData ) {
                                // rowData = [ <offset to the current row>, <total number of rows in the dataset> ]
                                AMO.log.debug(
                                    "scroller: thumb reset requested:  dataSource offsets = " + rowData[0] + ", " + rowData[1] +
                                    ", thumb position = " + Math.floor( ($element.find( ".cui-Grid--rowScroller-thumbWrapper").position().top * 100 / $element.find( ".cui-Grid--refThumbBounds").height() ) ) + '%'
                                );
                                updateThumbPosition( rowData[0], rowData[1] );
                            }
                        );
                    };

                return {
                    link: link,
                    restrict: 'E',
                    scope: {
                        dimensions: "="
                    }
                };
            }

        ]
    );
}());
//