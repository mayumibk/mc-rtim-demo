/**
 * A log utility. By default the various log methods will write formatted
 * log messages to the browser's console. In future enhancements messages
 * will also be written to a server, if requested.
 *
 * TODO This code also needs to do browser detect if console is not available.
 *
 * The log API, as attached to AMO (AMO.log):
 *      //  These methods are "static" in the Java sense: Log.error( "my message" ),
 *      //  etc.
 *      initialize( enableLogging, initialLogLevel ):
 *          function, called once to setup the logger
 *      setLogLevel( logLevel ):
 *          function, determines what severity of log messages are actually displayed
 *      error( message ), warn( message ), info( message ), debug( message ):
 *          functions for logging messages at the indicated level. If message is
 *          a function object then it is executed and the returned value is put
 *          into the log message. Otherwise messsage is output as is.
 *      log( ... ):
 *          The arguments are applied directly to the built-in console.log method.
 *
 *      Level.ERROR, Level.WARN, Level.INFO, Level.DEBUG:
 *          Constants used in the initialize and setLogLevel functions. Access them
 *          as Log.Level.ERROR, etc.
 *
 * Created by Kevin Monahan, 11/23/2014.
 */

/**
 */

(function () {
    "use strict";

    // Slowly removing the generic AMO utility. This used to be defined
    // in amoUtilities.js.
    window.AMO = {};

    // create a function that corresponds to this log utilities area. We'll attach
    // our various utilities to this function. We then attach this function to the global
    // AMO function/object. Note that this function will be called when the app starts and
    // (possibly when the app) stops. This function will do the default log initialization
    // steps
    var wrapper =
        function () {
            wrapper.initializeLog();

            wrapper.info( "The log has been initialized" );
        };
    window.AMO.log = wrapper;

    // "Static" attributes of our log function.

    // True once the log has been initialized.
    var initialized = false;

    /** By default, logging is enabled. */
    var enabled = true;


    // Log levels that are used mainly to set the log level. These variables
    // are set into the returned object's Level object
    var ERROR = 1, WARN = 2, INFO = 3, DEBUG = 4, TRACE = 99;
    wrapper.ERROR = ERROR;
    wrapper.WARN = WARN;
    wrapper.INFO = INFO;
    wrapper.DEBUG = DEBUG;
    wrapper.TRACE = TRACE;

    /**
     * The current log level. The log level of a log request must be >= this level. Note that
     * we initialize it to reflect the hardcoded value of the Log.enabled flag. It can
     * be reset by the Log constructor.
     */
    var logLevel = enabled ? DEBUG : ERROR;

    // We define a number of functions here: initialize, error, warn, etc. These
    // functions are returned as the values of attributes in the returned object.

    wrapper.initializeLog =
        /**
         * Call this method to initialize (or reinitialize) the Log. This method
         * is called automatically when the app starts, using default values.
         * @param enableLogging if true then log messages are displayed
         * (if the console is available); if false they
         * are discarded.
         * @param initialLogLevel A simple integer that determines if a given
         * log message should be displayed. See the constant
         * definitions.
         */
        function (enableLogging, initialLogLevel) {
            // Determine if the console exists. We do a bit
            // more and actually see if at least one console log
            // function exists. If so, then we enable logging.
            if ((!! enableLogging && enableLogging) || (! enableLogging && enabled)) {
                if ((typeof console === "object") && (typeof console.debug !== "undefined")) {
                    enabled = true;
                    // Set the log level, if supplied. Otherwise we stay with the default
                    if (!! initialLogLevel) {
                        logLevel = initialLogLevel;
                    }
                } else {
                    enabled = false;
                }
            } else {
                enabled = false;
            }

            initialized = true;

            installLogFunctions();
        };

    // Default, empty functions that allow the log functions to be called before
    // the log utility has been fully initialized.
    wrapper.trace = function() {};
    wrapper.debug = function() {};
    wrapper.info = function() {};
    wrapper.warn = function() {};
    wrapper.error = function() {};
    wrapper.log = function() {};
    wrapper.setLogLevel = function() {};

    var installLogFunctions =
        /**
         * The individual log functions are set to empty functions. This allows them to
         * be called before the log has been properly initialized. Once this log utility
         * function has been initialized we set these functions to their actual values.
         */
        function() {
            wrapper.trace =
                /**
                 * Logs the message if logging is available. TRACE is just a large number.
                 * @param message Either a string or a function that evaluates to a string. The latter is useful if your message is
                 * constructed (e.g., a concatenation of strings) and you don't want to take the overhead to do so if
                 * the current log level is above that of this log request.
                 * @param logToDatabase The log entry will be sent to the server for permanent logging. This feature is TBD.
                 */
                    function (message, logToDatabase) {
                    if (enabled && (logLevel >= TRACE)) {
                        console.debug(getTimeStamp() + ' ' + (typeof message === "function" ? message() : message));
                    }
                };

            wrapper.debug =
                /**
                 * Logs the message if debug-level logging is enabled.
                 * @param message Either a string or a function that evaluates to a string. The latter is useful if your message is
                 * constructed (e.g., a concatenation of strings) and you don't want to take the overhead to do so if
                 * the current log level is above that of this log request.
                 * @param logToDatabase The log entry will be sent to the server for permanent logging. This feature is TBD.
                 */
                    function (message, logToDatabase) {
                    if (enabled && (logLevel >= DEBUG)) {
                        console.debug(getTimeStamp() + ' ' + (typeof message === "function" ? message() : message));
                    }
                };

            wrapper.info =
                /**
                 * Log the message at the info level
                 * @param message Either a string or a function that evaluates to a string. The latter is useful if your message is
                 * constructed (e.g., a concatenation of strings) and you don't want to take the overhead to do so if
                 * the current log level is above that of this log request.
                 * @param logToDatabase The log entry will be sent to the server for permanent logging. This feature is TBD.
                 */
                    function (message, logToDatabase) {
                    if (enabled && (logLevel >= INFO)) {
                        console.info(getTimeStamp() + ' ' + (typeof message === "function" ? message() : message));
                    }
                };

            wrapper.warn =
                /**
                 * Log the message at the warn level
                 * @param message Either a string or a function that evaluates to a string. The latter is useful if your message is
                 * constructed (e.g., a concatenation of strings) and you don't want to take the overhead to do so if
                 * the current log level is above that of this log request.
                 * @param logToDatabase The log entry will be sent to the server for permanent logging. This feature is TBD.
                 */
                    function (message, logToDatabase) {
                    if (enabled && (logLevel >= WARN)) {
                        console.warn(getTimeStamp() + ' ' + (typeof message === "function" ? message() : message));
                    }
                };

            wrapper.error =
                /**
                 * Log the message at the error level
                 * @param message Either a string or a function that evaluates to a string. The latter is useful if your message is
                 * constructed (e.g., a concatenation of strings) and you don't want to take the overhead to do so if
                 * the current log level is above that of this log request.
                 * @param logToDatabase The log entry will be sent to the server for permanent logging. This feature is TBD.
                 */
                function (message, logToDatabase) {
                    if (enabled && (logLevel >= ERROR)) {
                        console.error(getTimeStamp() + ' ' + (typeof message === "function" ? message() : message));
                    }
                };

            wrapper.log =
                /**
                 * Log directly to Firebug's console.log method. Use this if you want any of console's special log features.
                 * The arguments you supply are passed directly.
                 */
                function () {
                    if (enabled) {
                        // Create a real array from the pseudo arguments array.
                        var array = Array.prototype.slice.call(arguments);
                        try {
                            console.log.apply(null, array);
                            console.log.apply(null, arguments);
                        }
                        catch (ignored) {
                            console.log(array);
                            console.log(arguments);
                        }
                    }
                };

            /**
             * Change the log level to the indicated level.
             * @param newLogLevel The new log level, an integer.
             */
            wrapper.setLogLevel =
                function (newLogLevel) {
                    var currentLogLevel = logLevel;
                    logLevel = newLogLevel;
                    return currentLogLevel;
                };

        };

    // Private methods. These are not returned in the returned object.

    /**
     * Returns a timestamp string that will be placed before the log message.
     */
    var getTimeStamp = function () {
        var now = new Date();
        return (now.getYear() + 1900) + '/' + pad(now.getMonth() + 1, 2) + '/' + pad(now.getDate(), 2) + " " +
            pad(now.getHours(), 2) + ':' + pad(now.getMinutes(), 2) + ':' + pad(now.getSeconds(), 2) + '.' + pad(now.getMilliseconds(), 3);
    };

    /**
     * Returns the number as a string that is padded with leading zeros
     * to the indicated length.
     * @param number The number we pad with zeros
     * @param length The total length of the returned string. This function is
     * only valid up to ten leading zeros.
     * return The number left-padded with zeros to the requested length
     */
    var pad = function (number, length) {
        if (length === 2) {
            return number > 9 ? (number + '') : ('0' + number);
        } else {
            if (length === 3) {
                return number > 99 ? (number + '') : (number > 9 ? ('0' + number) : ('00' + number));
            } else {
                if (length > 3) {
                    var returnVal = '0000000000' + number;
                    return returnVal.substring(returnVal.length - length);
                }
                else {
                    return number + '';
                }
            }
        }
    };

    wrapper.initializeLog();
}());
