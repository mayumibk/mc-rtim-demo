/**
 * A collection of useful utility functions. For
 * example, a utility that returns true if a string is not empty, including
 * checking for null, all spaces, etc.
 *
 * These utilities are made available as the UtilityFactory factory in "UtilityModule".
 *
 */
(function () {
    "use strict";

    var injector = angular.injector( ["ng"] ),
        cacheFactory = injector.get( "$cacheFactory"),
        cache = cacheFactory( "aCache" );

    cache.put( "foo", function() { AMO.log.debug( "Foo, returned from the cache" ); } );
    cache.put( "bar", "This is bar!" );

    // Define our utility methods. Then create a
    var getTruth =
            /**
             * Interpret various values of this object as true or false and
             * return that value. If object is null or undefined we return false.
             * If object is a number we return true if the number is not 0. For
             * strings we return true if the string matches various values that we
             * could interpret as truthy: "true" (in any case), "yes", "1". If we're
             * given a function we'll execute it and then test the result according
             * to these rules. Finally, if we're passed an object we'll test object.toString().
             * If the object does not have that methods then we'll return false.
             *
             * You can figure out how we handle boolean values...
             * @param object The object we test.
             */
            function( object ) {
                var returnVal = false; // You must prove yourself true...

                if (!! object) {
                    var typeofObject = typeof object;
                    if (typeofObject === "function") {
                        returnVal = getTruth( object() );
                    } else if (typeofObject === "object") {
                        returnVal = !! typeofObject.toString ? getTruth( object.toString() ) : false;
                    } else if (typeofObject === "string") {
                        var testableobject = object.trim().toLowerCase();
                        returnVal = ("true" === testableobject) || ("yes" === testableobject) || ("1" === testableobject);
                    } else if (typeofObject === "number") {
                        returnVal = object !== 0;
                    } else if (typeofObject === "boolean") {
                        returnVal = object;
                    }
                }

                return returnVal;
            },

        asArray =
            /**
             * Converts object into an array containing the object. This is
             * useful when you need an array but the data may be provided as
             * a non-array primitive or object.
             * @param object The object to check, can be undefined or null
             * @param nullAsArray if true then we return an empty array if object is undefined or null.
             *                  If false and object is undefined or null then we return null.
             * @returns object if it is an array or [object] if it is not.
             */
            function( object, nullAsArray ) {
                if (!! object) {
                    return object instanceof Array ? object : [object];
                } else if (!! nullAsArray && nullAsArray) {
                    return [];
                } else {
                    return null;
                }
            },

        arrayHasContents =
            /**
             * Returns true if array contains at least one element. Note that
             * [null] returns true.
             */
            function( array ) {
                return !! array && (array instanceof Array) && (array.length > 0);
            },

        getNonNullValue =
            /**
             * Determines if object is null or empty. If not then object is returned. Otherwise,
             * valueIfNull is returned.
             * @param object The object value to test for not null, not empty.
             * @param valueIfNull The value to return if object is null. valueIfNull can be either
             *                      a object or a function. If the latter then the function is executed
             *                      and its value returned.
             * @returns {*}
             */
            function( object, valueIfNull, trim ) {
                return hasContents( object, !! trim ? trim : false ) ? object : (typeof valueIfNull === "function" ? valueIfNull() : valueIfNull);
            },

        executeIfFunction =
            function( object, args, objectContext ) {
                if (typeof object === "function") {
                    return object.apply( !! objectContext ? objectContext : null, args );
                } else {
                    return object;
                }
            },

        hasContents =
            /**
             * Returns true if the object is not null and contains something--at least
             * a character for a string, an element for an array, etc..
             * If trim is true then the function will first trim leading and trailing
             * blank characters from strings or make sure an array has at least
             * one non-null element
             * @param object The object to test, can be null.
             * @param trim If true then leading and trailing characters are trimmed
             *              from object. The default is true.
             * @returns true if the object contains characters, after optionally trimming it.
             */
            function (object, trim) {
                if ((typeof object === "undefined") || (object === null)) {
                    return false;
                } else if (typeof object === "string") {
                    // Were we given a second arg? If not, assume true.
                    if (
                        ((arguments.length === 2) && trim) ||
                        (arguments.length === 1)
                        ) {
                        return object.trim().length > 0;
                    } else {
                        return object.length > 0;
                    }
                } else if (object instanceof Array) {
                    if (object.length === 0) {
                        return false;
                    } else {
                        // Were we given a second argument? If not, assume true,
                        // that the user only wants arrays that have at least one non-null element.
                        if (
                            ((arguments.length === 2) && trim) ||
                            (arguments.length === 1)
                        ) {
                            // Return true if we find at least one non-null element.
                            var nonNullElement = false;
                            for (var i = 0; i < object.length && ! nonNullElement; i++) {
                                if (object[i] !== null) {
                                    return true;
                                }
                            }

                            return false;
                        } else {
                            return true;
                        }
                    }
                } else {
                    // Simple non-null objects have contents, by default.
                    return true;
                }
            },

        getAttribute =
            /**
             * Looks in the object for the attribute identified in the attribute parameter.
             * This parameter can be a dotted string. The method will check each level of
             * the attribute string and then return the value of the final element; i.e.,
             * object[attribute]. Note that once an array value is reached we don't search
             * any further.
             * @param object An object, presumably with nested attributes.
             * @param attribute A string that identifies a specific attribute within
             *              object. This can be a dotted string, letting you locate
             *              an attribute that is multiple levels deep.
             * @param valueIfMissing A value, primitive or object, that we'll return if
             *              either object is null or we cannot find attribute or any of
             *              its dotted parts.
             * @return if object[attribute] exists then return that value. If it does not
             *              exist then return valueIfMissing.
             */
            function (object, attribute, valueIfMissing) {
                if (! object) {
                    return valueIfMissing;
                }

                if (!! attribute) {
                    // Look at each level of attribute.
                    var levels = attribute.split( "." );
                    var value = object;
                    if (levels.length === 1) {
                        // attribute is not a dotted string. Just look for attribute in the
                        // original object.
                        value = getNonNullValue( value[attribute], valueIfMissing );
                    } else {
                        // Walk through each part of the dotted attribute string. At each level
                        // determine if the hash has the indicated value. If so, look at that
                        // value for the next level, etc. If we fail at any level we'll return
                        // valueIfMissing.

                        // false if we can't find a particular attribute level. Lets us break
                        // out of the loop.
                        var keepSearching = true;
                        for (var i = 0; (i < levels.length) && keepSearching; i++) {
                            if ((value === null) || (typeof value[levels[i]] === "undefined")) {
                                keepSearching = false;
                                value = valueIfMissing;
                            } else {
                                value = value[levels[i]];
                            }
                        }
                    }

                    return value;
                } else {
                    return valueIfMissing;
                }
            },

        hasAttribute =
            /**
             * Returns true if the object, assumed to be a hashmap, contains the indicated
             * attribute. Note that attribute can be a dotted string that represents nested
             * objects within object. This function is very similar to getAttribute. The
             * difference is that we return true only if object[attribute] exists. For
             * example, this means we would return true if object[attribute] is false
             * or null, or some other value. We would return false if typeof object[attribute]
             * is "undefined".
             * @param object An object, presumably with nested attributes.
             * @param attribute A string that identifies a specific attribute within
             *              object. This can be a dotted string, letting you locate
             *              an attribute that is multiple levels deep.
             */
            function (object, attribute) {
                if (! object) {
                    return false;
                }

                if (!! attribute) {
                    // Look at each level of attribute.
                    var exists = true;
                    var levels = attribute.split( "." );
                    var value = object;
                    if (levels.length === 1) {
                        // attribute is not a dotted string. Just look for attribute in the
                        // original object.
                        exists = typeof value[attribute] !== "undefined";
                    } else {
                        // Walk through each part of the dotted attribute string. At each level
                        // determine if the hash has the indicated value. If so, look at that
                        // value for the next level, etc. If we fail at any level we'll return
                        // valueIfMissing.

                        // false if we can't find a particular attribute level. Lets us break
                        // out of the loop.
                        var keepSearching = true;
                        for (var i = 0; (i < levels.length) && keepSearching; i++) {
                            if (typeof value[levels[i]] !== "undefined") {
                                value = value[levels[i]];
                            } else {
                                exists = false;
                            }
                        }
                    }

                    return exists;
                } else {
                    return false;
                }
            },

        isEmpty =
            /**
             * The reverse of has contents. Returns true if the object
             * is null or empty.
             * @param object The object to test, can be null.
             * @param trim If true then leading and trailing characters are trimmed
             *              from string or arrays have at least one non-null element, etc.
             *              The default is true.
             * @returns {boolean} true if the object is empty.
             */
            function( object, trim ) {
                return ! hasContents( object, trim );
            },

        copyReferences =
            /**
             * Copies attribute from "from" to "to". Note that this is not
             * doing a clone or deep copy. It simply makes sure that "to" has
             * all of the attributes from "from".
             * @param from Copy attributes from here.
             * @param to And put references to them into here
             * @param onlyReplace If true then only include attributes that already
             *                  exist in to. Optional, the default is false.
             */
            function( from, to, onlyReplace ) {
                if (!! from && !! to) {
                    // Get a default value for onlyReplace
                    var or = (typeof onlyReplace !== "undefined") ? onlyReplace : false;
                    for (var key in from) {
                        if (from.hasOwnProperty(key)) {
                            if (!or || (typeof to[key] !== "undefined")) {
                                to[key] = from[key];
                            }
                        }
                    }
                }
            };

    var parseCallbackConfig =
        /**
         * Callbacks in control configurations can take one of four forms:
         *      string
         *      function
         *      [ function, callbackData ]
         *      [ function ]
         * This method detects the form and returns either the string or
         * an object containing the function and callback data. If callbackData
         * is not provided then null is used.
         * @param callback A string or object from a configuration definition.
         *              Is null or has one of the forms described above.
         * @return The string value if the first form was provided or an object
         *              if one of the other forms was supplied. The object will
         *              always have two attributes:
         *                  fcn: The function provided in the latter three forms
         *                  callbackData: The callbackData value from the third
         *                  form or null if no callback data was provided.
         *              If the callback argument is null then null is returned.
         */
        function (callback) {
            if (!! callback) {
                if (typeof callback === "string") {
                    // First form
                    return callback;
                } else if (typeof callback === "function") {
                    // Second form. No callback data
                    return { fcn: callback, callbackData: null };
                } else {
                    // Either the third or fourth forms.
                    return {
                        fcn: callback[0],
                        callbackData: callback.length > 1 ? callback[1] : null
                    };
                }
            } else {
                return null;
            }
        };

    /**
     * A class definition here. Invoke using the new operator.
     * Creates an object that acts like Java's StringBuilder. Use
     * the append method to add objects to it. When done, use
     * the toString method to join all of the elements into a single string.
     */
    function StringBuilder() {
        /** Where we accumulate our strings. We'll eventually join them. */
        this.result = [];
    }

    /**
     * Add another item. If item is not a string then JavaScript will
     * convert it via item.toString().
     * @param object
     */
    StringBuilder.prototype.append = function( object )
    {
        this.result.push( object );

        return this; // for chaining.
    };

    StringBuilder.prototype.hasAppends =
        /**
         * Returns true if at least one object has been pushed into it. This
         * method does not validate whether there is at least one non-blank
         * element in this.result.
         * @returns {boolean}
         */
        function() {
            return this.result.length > 0;
        };
    /**
     * Return the completed string by joining all of the appended items.
     * Items that are not actual "string" items will be joined as item.toString()
     * @param joinString Optional. If supplied this value will be inserted between each
     *              separate item. A convenience.
     * @param finalJoinString Optional. If a joinString is supplied then this string will
     *              be used between the last two items in the array. A convience when you
     *              want different punctuation between the last two items: a, b, c and d
     *              Here joinString is ", " and finalJoinString is " and ".
     */
    StringBuilder.prototype.toString = function( joinString, finalJoinString )
    {
        if (typeof joinString === "undefined") {
            return this.result.join( "" );
        } else {
            // We have a join string. If we also have a finalJoinString when we
            // cannot use the built-in Array.join method.
            if (typeof finalJoinString === "undefined") {
                return this.result.join( joinString );
            } else {
                var result = this.result;
                if (result.length === 0) {
                    return null;
                } else if (result.length === 1) {
                    return result[0];
                } else if (result.length === 2) {
                    return result[0] + finalJoinString + result[1];
                } else {
                    var joinedString = new StringBuilder();
                    for (var i = 0; i < result.length - 1; i++) {
                        joinedString.append( result[i] );
                    }
                    return joinedString.toString( joinString ) + finalJoinString + result[result.length - 1];
                }
            }
        }
    };

    var utilitiesFunctions = null;

    // Create our factory
    angular.module( "UtilitiesModule", [] )
        .factory(
            "UtilitiesFactory",
            [
                function() {
                    // Just return a map of the utilities and class we offer.
                    if (! utilitiesFunctions) {
                        utilitiesFunctions = {
                            getTruth: getTruth,
                            asArray: asArray,
                            arrayHasContents: arrayHasContents,
                            getNonNullValue: getNonNullValue,
                            executeIfFunction: executeIfFunction,
                            hasContents: hasContents,
                            isEmpty: isEmpty,
                            getAttribute: getAttribute,
                            hasAttribute: hasAttribute,
                            copyReferences: copyReferences,

                            parseCallbackConfig: parseCallbackConfig,

                            StringBuilder: StringBuilder
                        };
                    }
                    return utilitiesFunctions;
                }
            ]
        );
}());