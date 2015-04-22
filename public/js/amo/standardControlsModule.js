/**
 * Created by kmonahan on 11/19/14.
 *
 * A convenience module that includes all of the frequently used control types.
 * Keeps you from having to "import" too many separate modules when you use
 * our UI controls.
 */

(function() {
    "use strict";

    angular.module( 'StandardControlsModule', ['ControlServiceModule', 'CustomControlModule'] );
}());
