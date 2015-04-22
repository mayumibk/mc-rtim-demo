/**
 * Created by kmonahan on 11/13/14.
 */

(function () {
    "use strict";

    // The hash of localization functions that we return when our factory is created.
    var factory = {
        initialized: false
    };

    // Some constants for dates and times.
    factory.TINY_DATE = "tiny";
    factory.SHORT_DATE = "short";
    factory.MEDIUM_DATE = "medium";
    factory.LONG_DATE = "long";
    factory.FULL_DATE = "full";
    factory.DEFAULT_DATE = factory.SHORT_DATE;

    factory.SHORT_TIME = "short";
    factory.MEDIUM_TIME = "medium";
    factory.LONG_TIME = "long";
    factory.SECONDS_TIME = "seconds";
    factory.MILLISECONDS_TIME = "ms";
    factory.MILITARY_TIME = "military";
    factory.HOUR_24_TIME = "24";
    factory.DEFAULT_TIME = factory.MEDIUM_TIME;

    var L10NFactoryFunction =
        function( utils ) {
            if (factory.initialized) {
                return factory;
            }
            factory.initialized = true;

            var initialized = false;
            // Always set to the current configuration. We initially set it to the default
            // config define above but will hopefully have it set to a specific language.
            var currentLocalization;

            // Default configuration data, using EN-US.
            var defaultConfig = {
                    /** The language of the localizations provided in this file. */
                    language: "default",
                    /** and the name of this language. */
                    name: "default (US English)",

                    /**
                     * A map that defines the translations we use to localize content.
                     * Each attribute in ths map defines one translation from a key
                     * (the attribute name) to a localized value (the attribute's
                     * value). If the value is an array then the first item is used
                     * when a singular word is appropriate. The second item is used when
                     * a plural word is appropriate. Providing singular and plural
                     * versions is not required. If a plural value is requested at
                     * runtime and none is provided then the singular version or the
                     * value itself (an array not used) is returned. The third and fourth
                     * elemnts in the array are when the translation should be capitalized.
                     * Note that these must be the actual third and fourth elements of
                     * the array.
                     *
                     * So, assume you have a dialog that prompts for the user's name
                     * and has a control label that needs to be translated. The key
                     * could be "Name". If the current translation is Spanish then
                     * factory.text( "Name" ) would return "Nombre". The translations
                     * object would have the attribute:
                     *      Name: "Nombre"
                     */
                    translations: {},
                    conversions: {
                        // See the documentation below for the defaultNumberConfigs variable.
                        number: "commaPeriod",
                        currency: {
                            /**
                             * When a number is localized as a currency this is the currency
                             * symbol (string) that is prepended to the formatted number. This
                             * can be multiple characters; for example, "USD". The default is "USD"
                             */
                            currencySymbol: '$',
                            /**
                             * Negative currency values are sometimes represented in a distinct
                             * form, such as within percentages: ($1,234.56) for -1234.56. If this
                             * attribute is a single character--for example, a minus symbol, then
                             * negative currency values are prefixed with that symbol. If two characters
                             * are supplied--for example, "()"--then negative currency values are
                             * prefixed with the first character an suffixed with the second character.
                             */
                            negativeCurrencySymbol: '-'
                        },
                        date: {
                            format: 'monthDay',
                            /**
                             * The month names used when localizing dates as
                             * longer forms; for example, February 10, 2011. This attribute is an array of
                             * month name arrays (two dimensions). For each month provide the full
                             * month name (first array element) and the abbreviated month name (second array
                             * element). Note that we only assume a 12-month calendar, for now.
                             */
                            months: [
                                ["January", "Jan"],
                                ["February", "Feb"],
                                ["March", "Mar"],
                                ["April", "Apr"],
                                ["May", "May"],
                                ["June", "Jun"],
                                ["July", "Jul"],
                                ["August", "Aug"],
                                ["September", "Sep"],
                                ["October", "Oct"],
                                ["November", "Nov"],
                                ["December", "Dec"]
                            ],
                            /** Similar content for days of the week. */
                            days: [
                                ["Sunday", "Sun"],
                                ["Monday", "Mon"],
                                ["Tuesday", "Tue"],
                                ["Wednesday", "Wed"],
                                ["Thursday", "Thu"],
                                ["Friday", "Fri"],
                                ["Saturday", "Sat"]
                            ]
                        },
                        time: {
                            /**
                             * Like date.format, an array of patterns for different ways of
                             * displaying time values. Use these symbols:
                             *      h: hours expressed as 1 -- 12.
                             *      H: Hours expressed as 0 -- 23
                             *      m: minutes
                             *      s: seconds
                             *      S: milliseconds
                             *      a: AM/PM indicator expressed as "A" or "P"
                             *      A: AM/PM indicator expressed as "AM" or "PM"
                             */
                            format:
                                [
                                    /* short:    9:24 */        "h:m",
                                    /* 24:       21:24 */       "H:m",
                                    /* medium    9:24P */       "h:ma",
                                    /* long      9:24PM */      "h:mA",
                                    /* seconds:  9:24:38 */     "h:m:s",
                                    /* ms:       9:24:38.234 */ "h:m:s.S",
                                    /* military: 2124 */        "Hm"
                                ],   // Default,

                            /**
                             * The localized "spelling" of AM and PM. The first element is the
                             * "full" spelling ("A" in the format string); the second element is
                             * the abbreviated form ("a" in the format string).
                             */
                            am: ["AM", "A"],
                            pm: ["PM", "P"],

                            /**
                             * The string that separates the date from the time when
                             * doing a combined localization.
                             */
                            dateTimeSeparator: " "
                        }
                    }
                },

                /**
                 * Rules for localizing numbers and currencies. Note that these rules
                 * simply format numbers with the approriate digit group separators,
                 * decimal marks and group sizes, etc. This is not intended as an
                 * implementation of a sprintf-like formatting function where you can
                 * supply a formatting string to be used. That capability could be a
                 * later addition to Hibiscus.I18N.
                 *
                 * See http://en.wikipedia.org/wiki/Decimal_mark for useful background info.
                 *
                 * Note that this design does not support the India Lakh/Crore model.
                 * If needed, that model could be handled in a special way, such as by
                 * setting number: "india" instead of an object. The localization code would then do the
                 * proper two- and four-character group formatting.
                 *
                 * The number attribute can be set to either an object or a string. Use the
                 * string form if one of the standard number styles is appropriate:
                 *
                 *           "commaPeriod":  1,234,567.89
                 *           "periodComma":  1.234.567,89
                 *            "spaceComma":  1 234 567,89
                 *           "spacePeriod":  1 234 567.89
                 *      "apostrophePeriod":  1'234'567.89
                 *
                 * If you need something different then define an object with these
                 * attributes:
                 *
                 *      decimalMark
                 *          The symbol used to separate the integer part and decimal part
                 *          of the number. If not supplied then '.' is used as a default.
                 *      groupSeparator
                 *          The symbol used to separate the digit groups; i.e., the
                 *          thousands separator when the digit groups represent 10**3
                 *          and are three digits long. The default is ','.
                 *      alternateGroupSeparator
                 *          Some countries--notably Mexico--use a distinct mark as the
                 *          millions separator; for example, 12'345,678.90. This attribute
                 *          defines that mark. If not supplied then the groupSeparator
                 *          is used for the millions separator.
                 *      groupSize
                 *          The number of digits in each digit group of the integer part;
                 *          for example, three in western localizations. China, for example,
                 *          can use 4. The default is 3.
                 *      negativeSymbol
                 *          The symbol used t denote negative numbers. This design assumes,
                 *          for numbers vs currency, that the negative symbol is always placed
                 *          to the left of a negative number. The default is the standard
                 *          minus symbol.
                 */
                defaultNumberConfigs = {
                    // 1,234,567.89
                    commaPeriod: {
                        decimalMark: '.',
                        groupSeparator: ',', alternateGroupSeparator: null,
                        groupSize: 3,
                        negativeSymbol: '-'
                    },

                    // 1.234.567,89
                    periodComma: {
                        decimalMark: ',',
                        groupSeparator: '.', alternateGroupSeparator: null,
                        groupSize: 3,
                        negativeSymbol: '-'
                    },

                    // 1 234 567,89
                    spaceComma: {
                        decimalMark: ',',
                        groupSeparator: ' ', alternateGroupSeparator: null,
                        groupSize: 3,
                        negativeSymbol: '-'
                    },

                    // 1 234 567,89
                    spacePeriod: {
                        decimalMark: '.',
                        groupSeparator: ' ', alternateGroupSeparator: null,
                        groupSize: 3,
                        negativeSymbol: '-'
                    },

                    // 1'234'567,89
                    apostrophePeriod: {
                        decimalMark: '.',
                        groupSeparator: "'", alternateGroupSeparator: null,
                        groupSize: 3,
                        negativeSymbol: '-'
                    }
                },

                /**
                 * Defines the order in which the date elements--month, day and year--are shown
                 * and the symbol used to separate the elements. Use the single characters 'm', 'd'
                 * and 'y' plus the separator symbol. This is not used to indicate the number
                 * of digits to be used. That is specified in the Hibiscus.I18N.localizeDate
                 * function.
                 *
                 * Three values are provided. The first is used for number-only date
                 * representations (e.g., "10/25/10") with two-digit year, the second
                 * for number-only date representations with four-digit year and the
                 * third and fourth for text/number representations (e.g., "October 25, 2010").
                 * The third one uses the month's abbreviation and the second uses the
                 * full month. While you can format these as you wish, the four elements
                 * ultimately correspond to the "type" arguemnt passed to localizeDate:
                 * [ tiny, short, medium, long, full ]. Here are the definitions of the symbols:
                 *      y: 2-digit year
                 *      Y: 4-digit year
                 *      n: Month number (January = 1)
                 *      m: Month's abbreviation (Jan)
                 *      M: Month's full name (January)
                 *      d: day of month
                 *      w: Day of week, abbreviated
                 *      W: Full Day of week
                 *
                 * Note that the format attribute can be either an array with these
                 * format strings or can be a simple string. Use the string form when
                 * one of the standard styles is appropriate:
                 *
                 *      "monthDay":  June 10, 2012 or 6/10/2012
                 *       "dayMonth:  10 June 2012 or 10/6/2012
                 *
                 * Otherwise, define an array of 5 strings that contain layouts for
                 * the five ways we localize strings:
                 *
                 *      tiny:  "n/d/y",
                 *     short:  "n/d/Y",
                 *    medium:  "m d, Y",
                 *      long:  "M d, Y",
                 *      full:  "W, M d, Y"
                 */

                defaultDateConfigs =
                {
                    monthDay: [
                        /* tiny */    "n/d/y",
                        /* short */   "n/d/Y",
                        /* medium */  "m d, Y",
                        /* long */    "M d, Y",
                        /* full */    "W, M d, Y"
                    ],

                    dayMonth: [
                        /* tiny */    "d/n/y",
                        /* short */   "d/n/Y",
                        /* medium */  "d m, Y",
                        /* long */    "d M, Y",
                        /* full */    "W, d M, Y"
                    ]
                },

            // We normally format currencies using the user's current localization. For example,
            // an en_us user would see currencies expressed using $ while a British user would
            // see £. We want money values to be expressed in the localization of the currency
            // type, not necessarily the user's localization. This table lists the ways that
            // currencies are expressed. See the third argument of the currency function below.
                currencies = {
                    // Each key in this hash maps to the currency name. The value is an array
                    // with three items: [ currency symbol, negative currency symbol, number format].
                    // See the "currency" section of a localization file for details on these three items.
                    USD: [ "$", "-", "commaPeriod" ],
                    GBP: [ "£", "-", "commaPeriod" ],
                    EUR: [ "€", "-", "commaPeriod" ]
                };

            // Always set to the current configuration. We initially set it to the default
            // config define above but will hopefully have it set to a specific language.
            currentLocalization = defaultConfig;

            factory.useLocalization =
                /**
                 * Sets the localized translation configuration. If the I18N service has already been
                 * initialized then we'll apply this translation immediately. If not then
                 * we'll defer it until the service is initialized (see the "factory"
                 * function above.
                 * @param localization A configuration for the current language translation.
                 *                      The object generally looks like the defaultConfig object.
                 */
                function( localization ) {
                    AMO.log.debug( "factory.useLocalization: language = " + localization.language + ", name = " + localization.name );
                    currentLocalization = $.extend( true, {}, defaultConfig, localization );

                    // Only install this translation if the service has been fully
                    // initialized. Otherwise, set it aside.
                    if (initialized) {
                        installI18NFunctions();
                    }
                };

//    var config = $.extend(true, {}, defaultConfig, l10n),
//        translations = config.translations,
//        date = config.conversions.date,
//        time = config.conversions.time;

            // Default, empty functions that allow the I18N functions to be called before
            // the utility has been fully initialized.
            factory.text = function() {};
            factory.number = function() {};
            factory.currency = function()  {};
            factory.date = function() {};
            factory.time = function() {};
            factory.dateTime = function() {};
            factory.phrase = function() {};
            factory.localize = function() {};
            factory.getLanguage = function() {};
            factory.getLanguageName = function() {};


            var installI18NFunctions =
                /**
                 * Overwrites the default no-op functions with the actual values.
                 * This is done after the I18N utility has been initialized.
                 */
                function () {

                    var translations = currentLocalization.translations;

                    AMO.log.debug( "factory.installI18NFunctions: language = " + currentLocalization.name + " (" + currentLocalization.language + ")" );

                    /**
                     * Generates a localized string from a key value. The key is used
                     * to look up the translation, in the "translations" map in the
                     * localization definition.
                     * @param key The key used to look up a translation. Required.
                     * @param isPlural If true then the code looks for a plural translation
                     *              for the source key. If no plural translation is found
                     *              then the singular form is returned.
                     * @param capitalize If true then we return a capitalized version of
                     *              the key, if available.
                     * @param defaultTranslation If a translation is not found--that is,
                     *              translations[source] is null or undefined--then this
                     *              value is returned. If this value is undefined then
                     *              it defaults to source. This value may be an array
                     *              with singular/plural and lowercase/capitalized defaults.
                     *              If the function is called with just two arguments then
                     *              we'll ignore isPlural and capitalize. The second argument
                     *              is assigned to defaultTranslation
                     */
                    factory.text = function (key, isPlural, capitalize, defaultTranslation) {
                        if (utils.isEmpty( key )) {
                            return '';
                        }

                        // Seee if we have a translation for this key. If we don't then see if the
                        // caller provided a default translation.
                        var translation =
                            translations[key] ||
                            // defaultTranslation is the fourth parameter if four arguments
                            // were provided. Otherwise it is the second.
                            (arguments.length === 2 ? arguments[1] : defaultTranslation);

                        // Translations are either primitives (usually strings) or
                        // an array with a singular and plural form. Since we're
                        // Since we want to distinguish primitives from arrays we
                        // can use typeof === "object" to detect an array--we do not
                        // currently have a different sort of translated value that is a
                        // non-array object.
                        if (!! translation) {
                            // Distinguish between array and a primitive. If a
                            // primitive then just return it. Otherwise, handle the
                            // singular/plural and lowercase/capital test.
                            //
                            // If translation is an array it will contain up to 4 entries.
                            // Here are the options:
                            //      [singular]
                            //      [singular, plural]
                            //      [singular, plural, singularCapitalized]
                            //      [singluar, plural, singularCapitalized, pluralCapitalized]

                            if (typeof translation === "object") {
                                var usePlural = (typeof isPlural !== "undefined") && isPlural,
                                    useCapitals = (typeof capitalize !== "undefined") && capitalize;
                                // The element of the array we'll try to use.
                                var translationIndex;
                                if (usePlural) {
                                    translationIndex = useCapitals ? 3 : 1;
                                } else {
                                    translationIndex = useCapitals ? 2 : 0;
                                }
                                return utils.getNonNullValue( getTranslationValue( translation, translationIndex ), key );
                            } else {
                                return utils.getNonNullValue( translation, key );
                            }
                        } else {
                            return key;
                        }
                    };

                    // Before configuring the localizeNumber function see if the caller
                    // wants to use one of the built-in number configurations.
                    var workingNumberConfig = currentLocalization.conversions.number;
                    if (typeof workingNumberConfig === "string") {
                        workingNumberConfig = defaultNumberConfigs[workingNumberConfig];
                        if (typeof workingNumberConfig === "undefined") {
                            AMO.log.error("No such built-in I18N number configuration: " + currentLocalization.conversions.number);
                        }
                    }

                    var createNumberLocalizer =
                        /**
                         * This function basically curries the info from a particular number localization
                         * rule and returns a function that will localize numbers according to that rule.
                         * This function is kept separate because we sometimes do one-off localizations using
                         * different country rules. You can call this method to generate a one-time localization function
                         * @param numberConfig
                         * @returns {Function}
                         */
                        function (numberConfig) {
                            var decimalMark = numberConfig.decimalMark,
                                groupSeparator = numberConfig.groupSeparator,
                                alternateGroupSeparator = (typeof numberConfig.alternateGroupSeparator !== "undefined" && !!numberConfig.alternateGroupSeparator) ? numberConfig.alternateGroupSeparator : groupSeparator,
                                groupSize = numberConfig.groupSize,
                                negativeSymbol = numberConfig.negativeSymbol;

                            // For now, support 3-digit and 4-digit group sizes only.
                            if ((groupSize === 3) || (groupSize === 4)) {
                                /**
                                 * Return a function that localizes numbers into three-digit or
                                 * four-digit groups.
                                 * @param number The number to localize. Required.
                                 * @param numDecimalPlaces The number of digits to include after
                                 *              the decimal mark; that is, the fractional part.
                                 *              The default value is 0. When 0 is used then the
                                 *              localized string will not include a decimal mark.
                                 *              Otherwise, a decimal mark followed by the requested
                                 *              number of digits is retured. The digits are padded
                                 *              with zeros if number has insufficient resolution. If
                                 *              the fractional part is longer than this value then
                                 *              truncation and rounding occurs. The standard "round-up
                                 *              by adding .5" approach is used. Note tht this will also
                                 *              occur when zero decimal places are requested. For example,
                                 *              localizeNumber( .6789, 0 ) returns "1", localizeNumber( .4321, 0 )
                                 *              returns "0".
                                 * @param noSeparators Optional. If true then do not insert separators
                                 *              between number groups.
                                 * @return A string representing the localized number.
                                 */
                                return function (number, numDecimalPlaces, noSeparators) {
                                    if (utils.isEmpty( number )) {
                                        return ''; // Our standard for a missing number.
                                    }
                                    var workingNumber = number;

                                    if (typeof number === "string") {
                                        workingNumber = Number(number);
                                        if (isNaN( workingNumber )) {
                                            return "Error: NaN";
                                        }
                                    }
                                    if ((typeof workingNumber === "number") || (workingNumber instanceof Number)) {
                                        // Start with a string that has the correct workingNumber of decimal places. We work wih the workingNumber as a
                                        // positive value and reappend the negative sign at the end, if needed.
                                        var localNumber = workingNumber < 0 ? -workingNumber : workingNumber,
                                            aString = typeof numDecimalPlaces !== "undefined" ? localNumber.toFixed(numDecimalPlaces) : localNumber.toString();

                                        // Get rid of the "zero" case.
                                        if (localNumber === 0) {
                                            return aString;
                                        }

                                        // Get the integer part
                                        var decimalIndex = aString.indexOf('.'),
                                            decimalPart = decimalIndex++ === -1 ? null : (decimalIndex < aString.length ? aString.substr(decimalIndex) : null),
                                            integerPart = --decimalIndex === -1 ? aString : (decimalIndex === 0 ? "" : aString.substr(0, decimalIndex));

                                        // We now separate the integer part into groups of 3 digits--fewer for the
                                        // first group.
                                        var firstGroupDigits = integerPart.length % groupSize,
                                        // We create an array of the decimal groups here. Later
                                        // we'll concatenate them with the proper symbol.
                                            groups = [],
                                        // March through the integer part string, points to the start
                                        // of each group.
                                            nextDigit = 0,
                                            length = integerPart.length,
                                            numGroups = 0;

                                        // Handle the first group separately if it does not contain
                                        // a full complement of digits; e.g, just two or one.
                                        if (!! noSeparators) {
                                            groups.push( integerPart );
                                            numGroups = 1;
                                        } else {
                                            if ((firstGroupDigits !== 0) && (firstGroupDigits < groupSize)) {
                                                groups.push(integerPart.substr(0, firstGroupDigits));
                                                nextDigit = firstGroupDigits;
                                                numGroups++;
                                            }

                                            // Now pull off the remaining groups.
                                            for (; nextDigit < length;) {
                                                groups.push(integerPart.substr(nextDigit, groupSize));
                                                nextDigit += groupSize;
                                                numGroups++;
                                            }
                                        }

                                        // Reassemble the groups using the appropriate separators.
                                        var result = new utils.StringBuilder(),
                                            altSymbolGroup = numGroups - 3;

                                        // If the original workingNumber is negative then add a negative sign.
                                        if (workingNumber < 0) {
                                            result.append(negativeSymbol);
                                        }
                                        for (var i = 0, l = --numGroups; i < l; i++) {
                                            result.append(groups[i]).append(i === altSymbolGroup ? alternateGroupSeparator : groupSeparator);
                                        }
                                        // Append the last group. We don't put a group separator after this one.
                                        result.append(groups[numGroups]);
                                        // if we have a decimal part then attach it.
                                        if (!!decimalPart) {
                                            result.append(decimalMark).append(decimalPart);
                                        }

                                        // At last, return the formatted workingNumber.
                                        return result.toString();
                                    }
                                    else {
                                        // Basically punt if the argument is not a workingNumber.
                                        return typeof workingNumber !== "undefined" ? workingNumber.toString() : '';
                                    }
                                };
                            }
                            else {
                                AMO.log.error("Unsupported group size for localizing numbers: " + groupSize);
                                return function (number, numDecimalPlaces) {
                                    // Just return the number
                                    if (typeof number === "number") {
                                        // Set the decimal places, if requested.
                                        return typeof numDecimalPlaces !== "undefined" ? number.toFixed(numDecimalPlaces) : number.toString();
                                    }
                                    else {
                                        // Basically punt if the argument is not a number.
                                        return typeof number !== "undefined" ? number.toString() : '';
                                    }
                                };
                            }
                        };

                    factory.number = (
                        /**
                         * Note that this function is executed immediately. it returns the actual
                         * localizaton function that will be called.
                         *
                         * Apply some currying to capture the config values we use and then return a function
                         * that is appropriate to the number of decimal places.
                         * todo Could add optional code that would handle traditional Indian formatting with
                         * lakhs and crores. This could be handled by setting conversions.number to "indian" in
                         * the config and thn returning a specialty function. This approach can be expanded in
                         * many ways.
                         */
                        createNumberLocalizer(workingNumberConfig)
                    );

                    factory.currency = (
                        /**
                         * Note that this function is executed immediately. it returns the actual
                         * localizaton function that will be called.
                         *
                         * Apply some currying to capture the config values we use and then return a function
                         * that will localize currency.
                         */
                            function (currencySymbol, negativeCurrencySymbol) {
                            var useWrappingCharsForNegative, prefixChar, suffixChar;

                            if (typeof negativeCurrencySymbol !== "undefined") {
                                if (negativeCurrencySymbol.length > 1) {
                                    prefixChar = negativeCurrencySymbol[0];
                                    suffixChar = negativeCurrencySymbol[1];
                                    useWrappingCharsForNegative = true;
                                }
                                else {
                                    useWrappingCharsForNegative = false;
                                    prefixChar = negativeCurrencySymbol;
                                }
                            }
                            else {
                                useWrappingCharsForNegative = false;
                                prefixChar = '-';
                            }

                            /**
                             * The function we return. See locaizeNumber for a description
                             * of the arguments and return value. The only difference is
                             * that this function will prefix the string with the
                             * appropriate currency symbol and will apply the proper
                             * "negative" formatting.
                             *
                             * Note that currency translations are not always to the local language.
                             * For example, an American user who has USD as the default currency
                             * localization can work with a British client. Money is spent as British
                             * pounds and so should be represented as such, even though the current
                             * localization is en-us. If the third argument is supplied then the
                             * translation will be done to that currency.
                             */
                            return function (amount, numDecimalPlaces, currencyTranslation ) {
                                if (utils.isEmpty( amount )) {
                                    return '';
                                }
                                var amountIsNegative = amount < 0,
                                    formattedNumber;
                                // Localize using the current localization rules?
                                if ((arguments.length === 2) || ! currencyTranslation) {

                                    formattedNumber = factory.number(Math.abs(amount), numDecimalPlaces);

                                    // Attach the negative values if needed.
                                    if (amountIsNegative) {
                                        if (useWrappingCharsForNegative) {
                                            return prefixChar + currencySymbol + formattedNumber + suffixChar;
                                        }
                                        else {
                                            return prefixChar + currencySymbol + formattedNumber;
                                        }
                                    }
                                    else {
                                        return currencySymbol + formattedNumber;
                                    }
                                } else {
                                    // Nope, localize to the specific currency identified by currencyTranslation.
                                    var currency = currencies[currencyTranslation];
                                    if (! currency) {
                                        // No localization for this translation.
                                        AMO.log.error( "Could not find localization rules for the " + currencyTranslation + " currency. Using the current localization instead." );
                                        return factory.currency( amount, numDecimalPlaces );
                                    } else {
                                        // Generate a one-off translation for this currency's number format.
                                        // Then apply the number translation to it.
                                        var numberLocalizer = createNumberLocalizer( defaultNumberConfigs[currency[2]] );
                                        formattedNumber = numberLocalizer(Math.abs(amount), numDecimalPlaces);

                                        // Attach the negative values if needed.
                                        if (amountIsNegative) {
                                            var tempPrefixChar, tempSuffixChar;
                                            if (typeof currency[1] !== "undefined") {
                                                if (currency[1].length > 1) {
                                                    useWrappingCharsForNegative = true;
                                                    tempPrefixChar = currency[1][0];
                                                    tempSuffixChar = currency[1][1];
                                                }
                                                else {
                                                    useWrappingCharsForNegative = false;
                                                    tempPrefixChar = currency[1][0];
                                                }
                                            }
                                            else {
                                                useWrappingCharsForNegative = false;
                                                tempPrefixChar = '-';
                                            }
                                            if (useWrappingCharsForNegative) {
                                                return tempPrefixChar + currency[0] + formattedNumber + tempSuffixChar;
                                            }
                                            else {
                                                return tempPrefixChar + currency[0] + formattedNumber;
                                            }
                                        }
                                        else {
                                            return currency[0] + formattedNumber;
                                        }

                                    }
                                }
                            };
                        }
                        )(currentLocalization.conversions.currency.currencySymbol, currentLocalization.conversions.currency.negativeCurrencySymbol);

                    // Before configuring the localizeDate function see if the caller
                    // wants to use one of the built-in date configurations.
                    var workingDateConfig = currentLocalization.conversions.date;
                    if (typeof workingDateConfig.format === "string") {
                        workingDateConfig.format = defaultDateConfigs[workingDateConfig.format];
                        if (typeof workingDateConfig.format === "undefined") {
                            AMO.log.error("No such built-in I18N date configuration: " + currentLocalization.conversions.date);
                        }
                    }

                    factory.date = (
                        /**
                         * This function is executed immediately. It returns a function
                         * that does the intended formatting. In particular, the function
                         * properly handles the order of the date elements.
                         */
                        function (dateConfig) {
                            // We create an array of functions that will
                            // extract the appropriate date element. The
                            // order in this array represents the order of display;
                            // e.g., y/m/d, etc.
                            var order = { dtiny: [], dshort: [], dmedium: [], dlong: [], dfull: [] },
                                format = dateConfig.format,
                                months = dateConfig.months,
                                days = dateConfig.days,
                                dateElement, nextChar, dateFunction;

                            /**
                             * See if the symbol corresponds to one of the calendar
                             * values we can extract from a date--month, day or year. If so,
                             * return a function that takes a date argument and returns that
                             * value. Note that we correct this value, as needed; for example,
                             * returning a correct year like 2011 instead of 111 or the month
                             * in a one-based value, not zero. Remember, getMonth returns zero
                             * for January.
                             * @param symbol
                             */
                            var getDateFunction = function (symbol) {
                                if (symbol === 'Y') {
                                    return function (date) {
                                        // returns a four-digit year
                                        return date.getYear() + 1900;
                                    };
                                }
                                else {
                                    if (symbol === 'y') {
                                        return function (date) {
                                            // Returns a two-digit year.
                                            return (date.getYear() + 1900) % 100;
                                        };
                                    }
                                    else {
                                        if (symbol === 'n') {
                                            return function (date) {
                                                return date.getMonth() + 1;
                                            };
                                        }
                                        else {
                                            if (symbol === 'm') {
                                                return function (date) {
                                                    return months[date.getMonth()][1];
                                                };
                                            }
                                            else {
                                                if (symbol === 'M') {
                                                    return function (date) {
                                                        return months[date.getMonth()][0];
                                                    };
                                                }
                                                else {
                                                    if (symbol === 'd') {
                                                        return function (date) {
                                                            return date.getDate();
                                                        };
                                                    }
                                                    else {
                                                        if (symbol === 'W') {
                                                            return function (date) {
                                                                return days[date.getDay()][0];
                                                            };
                                                        }
                                                        else {
                                                            if (symbol === 'w') {
                                                                return function (date) {
                                                                    return days[date.getDay()][1];
                                                                };
                                                            }
                                                            else {
                                                                return null;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            };

                            var parseDateFormat = function( orderArray, orderString )
                            {
                                dateElement = "";
                                for (var i = 0, l = orderString.length; i < l; i++)
                                {
                                    // get the next char and see if it is a date element. If so,
                                    // push the accumulated characters into the array and then
                                    // add this elmeent as a function.
                                    nextChar = orderString.charAt( i );
                                    dateFunction = getDateFunction( nextChar );
                                    if (dateFunction === null)
                                    {
                                        // Not one of month, day or year. Keep accumulating
                                        // these characters as separators.
                                        dateElement += nextChar;
                                    }
                                    else
                                    {
                                        // It is one of the specific date elements. Push any
                                        // leading separator characters and then push this
                                        // function character.
                                        if (dateElement.length > 0)
                                        {
                                            orderArray.push( dateElement );
                                            dateElement = '';
                                        }
                                        // Now push our date element
                                        orderArray.push( dateFunction );
                                    }
                                }

                                // Any text at the end of the list?
                                if (dateElement.length > 0)
                                {
                                    orderArray.push( dateElement );
                                }
                            };

                            // Setup the four formats. Note that tiny vs short differs only by th
                            parseDateFormat(order.dtiny, format[0]);
                            parseDateFormat(order.dshort, format[1]);
                            parseDateFormat(order.dmedium, format[2]);
                            parseDateFormat(order.dlong, format[3]);
                            parseDateFormat(order.dfull, format[4]);

                            // Now return a function that will apply this logic to
                            // a supplied date.
                            /**
                             * Formats the date according to the date formatting type.
                             * @param date the Date to format. A JavaScript Date or
                             *              a number that contains a valid Date value.
                             * @param format A string indicating the formatting we apply:
                             *              "tiny", "short", "medium", "long", "full" or "browser".
                             *              The latter uses the browser's builtin toLocaleDateString
                             *              method
                             * @return String containing the formatted date.
                             */
                            return function (date, format) {
                                if (utils.isEmpty( date )) {
                                    return '';
                                }
                                var localDate = getDate(date),
                                    functions;

                                // Now determine the format to use. If the call
                                // requesting the built-in browser localization then return
                                // that choice immediately.
                                if (format === "browser") {
                                    return localDate.toLocaleDateString();
                                }
                                else {
                                    functions = order['d' + utils.getNonNullValue( format, factory.SHORT_DATE )];

                                    if (typeof functions === "undefined") {
                                        AMO.log.error("Unknown format for localizeDate: " + format);
                                        functions = ["(date format error)"];
                                    }
                                }

                                // Finally, format and return the date.
                                var localizedString = new utils.StringBuilder(),
                                    field;
                                for (var i = 0, l = functions.length; i < l; i++) {
                                    field = functions[i];
                                    if (typeof field === "function") {
                                        localizedString.append(field(localDate));
                                    }
                                    else {
                                        localizedString.append(field);
                                    }
                                }

                                return localizedString.toString();
                            };
                        }( workingDateConfig )
                        );

                    factory.time = (
                        /**
                         * This function is executed immediately. It returns a function
                         * that does the intended formatting. In particular, the function
                         * properly handles the formatting of time elements; in particular the
                         * level of detail (seconds, ms, etc.)
                         */
                        function (timeConfig) {
                            // We create an array of functions that will
                            // extract the appropriate date element. The
                            // order in this array represents the order of display;
                            // e.g., y/m/d, etc.
                            var order = { tshort: [], t24: [], tmedium: [], tlong: [], tseconds: [], tms: [], tmilitary: [] },
                                format = timeConfig.format,
                                am = timeConfig.am,
                                pm = timeConfig.pm,
                                timeElement, nextChar, timeFunction,
                                timeZoneOffsetMinutes = new Date().getTimezoneOffset() % 60;

                            /**
                             * See if the symbol corresponds to one of the time
                             * values we can extract from a date--hour, minute, second, etc.. If so,
                             * return a function that takes a date argument and returns that
                             * value. Note that we correct this value, as needed; for example,
                             * returning a correct year like 2011 instead of 111 or the month
                             * in a one-based value, not zero. Remember, getMonth returns zero
                             * for January.
                             * @param symbol
                             */
                            var getTimeFunction = function (symbol) {
                                if (symbol === 'h') {
                                    return function (date, applyGmtOffset) {
                                        var hour = date.getHours();
                                        if (applyGmtOffset) {
                                            hour += Date.getTimezoneOffset() / 60;
                                        }

                                        // Now convert to a 1--12 span.
                                        if (hour > 12) {
                                            hour -= 12;
                                        }

                                        return hour;
                                    };
                                }
                                else {
                                    if (symbol === 'H') {
                                        return function (date, applyGmtOffset) {
                                            var hour = date.getHours();
                                            if (applyGmtOffset) {
                                                hour += Date.getTimezoneOffset() / 60;
                                            }

                                            return hour < 10 ? ('0' + hour) : hour;
                                        };
                                    }
                                    else {
                                        if (symbol === 'm') {
                                            return function (date, applyGmtOffset) {
                                                var minute = date.getMinutes();

                                                if (applyGmtOffset) {
                                                    minute += timeZoneOffsetMinutes;
                                                }

                                                return minute < 10 ? ('0' + minute) : minute;
                                            };
                                        }
                                        else {
                                            if (symbol === 'a') {
                                                return function (date, applyGmtOffset) {
                                                    var hour = date.getHours();
                                                    if (applyGmtOffset) {
                                                        hour += Date.getTimezoneOffset() / 60;
                                                    }

                                                    return hour <= 12 ? am[1] : pm[1];
                                                };
                                            }
                                            else {
                                                if (symbol === 'A') {
                                                    return function (date, applyGmtOffset) {
                                                        var hour = date.getHours();
                                                        if (applyGmtOffset) {
                                                            hour += Date.getTimezoneOffset() / 60;
                                                        }

                                                        return hour <= 12 ? am[0] : pm[0];
                                                    };
                                                }
                                                else {
                                                    if (symbol === 's') {
                                                        return function (date) {
                                                            var seconds = date.getSeconds();
                                                            return seconds < 10 ? ('0' + seconds) : seconds;
                                                        };
                                                    }
                                                    else {
                                                        if (symbol === 'S') {
                                                            return function (date) {
                                                                var ms = date.getMilliseconds().toPrecision(3);
                                                                return ms < 10 ? ('00' + ms) : (ms < 100 ? ('0' + ms) : ms);
                                                            };
                                                        }
                                                        else {
                                                            return null;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            };

                            var parseTimeFormat = function (orderArray, orderString) {
                                timeElement = "";
                                for (var i = 0, l = orderString.length; i < l; i++) {
                                    // get the next char and see if it is a date element. If so,
                                    // push the accumulated characters into the array and then
                                    // add this elmeent as a function.
                                    nextChar = orderString.charAt(i);
                                    timeFunction = getTimeFunction(nextChar);
                                    if (timeFunction === null) {
                                        // Not one of month, day or year. Keep accumulating
                                        // these characters as separators.
                                        timeElement += nextChar;
                                    }
                                    else {
                                        // It is one of the specific date elements. Push any
                                        // leading separator characters and then push this
                                        // function character.
                                        if (timeElement.length > 0) {
                                            orderArray.push(timeElement);
                                            timeElement = '';
                                        }
                                        // Now push our date element
                                        orderArray.push(timeFunction);
                                    }
                                }

                                // Any text at the end of the list?
                                if (timeElement.length > 0) {
                                    orderArray.push(timeElement);
                                }
                            };

                            // Setup the four formats. Note that tiny vs short differs only by th
                            parseTimeFormat(order.tshort, format[0]);
                            parseTimeFormat(order.t24, format[1]);
                            parseTimeFormat(order.tmedium, format[2]);
                            parseTimeFormat(order.tlong, format[3]);
                            parseTimeFormat(order.tseconds, format[4]);
                            parseTimeFormat(order.tms, format[5]);
                            parseTimeFormat(order.tmilitary, format[6]);

                            // Now return a function that will apply this logic to a supplied time value.
                            /**
                             * Formats the time according to the time formatting type.
                             * @param time the Date instance to format. A JavaScript Date or
                             *              a number that contains a valid Date value.
                             * @param format A string indicating the formatting we apply:
                             *             "short", "medium", "long", "seconds" (includes
                             *              seconds in the string), "ms" (includes seconds
                             *              and milliseconds), "military" (hour and minute
                             *              with no separator, hour in 24-hour mode)
                             *              and "browser" (use the browser's builtin
                             *              toLocaleTimeString function).
                             * @param applyGmtOffset If true then the GMT offset for the
                             *              browser's location is applied to the hours value.
                             *              It is also applied to minutes in some specific cases.
                             * @return String containing the formatted time.
                             */
                            return function (time, format, applyGmtOffset) {
                                if (utils.isEmpty( time )) {
                                    return '';
                                }
                                var tempTime = getDate(time),
                                    functions;

                                // Convert the date argument to the proper value.
                                if (time instanceof Date) {
                                    tempTime = time;
                                }
                                else {
                                    if (typeof time === "number") {
                                        tempTime = new Date(time);
                                    }
                                    else {
                                        // Assume something that Date can handle.
                                        tempTime = new Date(time.toString());
                                    }
                                }

                                // Now determine the format to use. If the call
                                // requesting the built-in browser localization then return
                                // that choice immediately.
                                if (format === "browser") {
                                    return tempTime.toLocaleTimeString();
                                }
                                else {
                                    functions = order['t' + utils.getNonNullValue( format, factory.DEFAULT_TIME )];

                                    if (typeof functions === "undefined") {
                                        AMO.log.error("Unknown format for localizeTime: " + format);
                                        functions = ["(date format error)"];
                                    }
                                }

                                // Finally, format and return the time string.
                                var localizedString = new utils.StringBuilder(),
                                    field,
                                    showLocal = typeof applyGmtOffset === "undefined" ? false : applyGmtOffset;
                                for (var i = 0, l = functions.length; i < l; i++) {
                                    field = functions[i];
                                    if (typeof field === "function") {
                                        localizedString.append(field(tempTime, showLocal));
                                    }
                                    else {
                                        localizedString.append(field);
                                    }
                                }

                                return localizedString.toString();
                            };
                        }
                        )( currentLocalization.conversions.time );

                    factory.dateTime = (
                        // This function executes immediately and returns a function that will
                        // format the combined date and time string. We just do this so we can effectively
                        // curry the separator string so we don't have to look it up each time.
                        function (dateTimeSeparator) {
                            var separator = typeof dateTimeSeparator !== "undefined" ? dateTimeSeparator : " ";


                            /**
                             * Uses both localizeDate and localizeTime to format a date/time string.
                             * @param dateTime The Date instance to format. Can also be a number that
                             *                  represents a valid time ms value or a string that new Date()
                             *                  can correctly parse.
                             * @param dateType A string indicating the date format to use. See the docs for
                             *                  localizeDate.
                             * @param timeType A string indicating the time format to use. See the docs for
                             *                  localizeTime
                             * @param applyGmtOffset If true then adjust the hours part of the time to reflect
                             *                  the local timezone of the browser. We also adjust the
                             *                  minutes for those regions where the GMT offset is not an
                             *                  integral number of hours.
                             */
                            return function (dateTime, dateType, timeType, applyGmtOffset) {
                                if (utils.isEmpty( dateTime )) {
                                    return '';
                                }
                                var date = getDate(dateTime);
                                return factory.date(date, dateType) + separator + factory.time(date, timeType, applyGmtOffset);
                            };
                        }
                        )(currentLocalization.conversions.time.dateTimeSeparator);

                    factory.phrase =
                        /**
                         * This function assumes that the translated value (the value
                         * for the indicated key) is a phrase that can contain embedded
                         * items that need further translation, for example:
                         *
                         *      Your ^0/currency:2^ bid on ^1/date:medium^ was too low.
                         *
                         * would be translated into:
                         *
                         *      Your $5.23 bid on Nov 14, 2014 was too low.
                         *
                         * Each ^<index>/<type>:<options>^ sequence in the phrase is treated as a separate localization
                         * element. The <type> item determines the type of localization that is done: text,
                         * number, currency, date, time or dateTime. The <options> element is specific to the type:
                         *      text:<one of spSP>      s = singular, p = plural, S = capitalized Singular, P = capitalized Plural
                         *      number:<# decimals>
                         *      currency:<# of decimals>
                         *      date:<date-format>      tiny, short, medium, long, full, browser
                         *      time:<time-format>      short, medium, long, seconds, ms, military, 24
                         *      dateTime:<date-format>:<time-format>
                         * If the value is just ^<index>^ then the code assumes ^<index>/text:s^. For
                         * text translations the code will use variables[<index>] as the key. If <index>
                         * is not a number--that is, a string like "hello"--then the code will use
                         * that string as the key: "hello" --> "bonjour" in a french translation.
                         *
                         * The variables parameter is an array of values to be translated. The value in
                         * the <index> field is used to retrieve from variables the value to be translated:
                         *      variables[<index>]
                         * When the <type> is text the variables[<index>] value is used to lookup a translation
                         * in the translations hash. This is done using the text(...) function. Otherwise
                         * variables[<index>] is a number or a JavaScript Date value.
                         *
                         * When this function is sed from the l10n directive in Angular-managed HTML the
                         * translated phrase is
                         *
                         * @param key Use this value to retrieve the translated string from the
                         *              translations map. For example the key "bidError" might be
                         *              translated to the phrase "Your ^0/currency:2^ bid on ^1/date:medium^ was too low."
                         * @param variables An array of values. These values map to the index
                         *                  values in the phrase; e.g., variables[0], variables[1] in
                         *                  the example above.
                         * @param defaultPhrase The phrase to use if key does not map to a translation
                         *              in the translations map.
                         */
                        function( key, variables, defaultPhrase ) {
                            if (utils.isEmpty( key )) {
                                return '';
                            }

                            // Parse the phrase into the individual string and ^...^ parts.
                            var parseResults = parsePhrase( utils.getNonNullValue( translations[key], defaultPhrase ) );

                            // Now iterate over each item in the parseResult array. If we have a ^...^ sequence
                            // then we'll apply the requested translation. Otherwise we just push the result
                            // to the result string.
                            var result = new utils.StringBuilder();
                            var nextPart, splitPart, translationOptions, hasOptions, numDigits;
                            var index, localization;
                            for (var i = 0; i < parseResults.length; i++) {
                                nextPart = parseResults[i];
                                // A ^...^ sequence that we need to translate?
                                if (nextPart.charAt( 0 ) === '^') {
                                    // Remove the leading and trailing & characters.
                                    nextPart = nextPart.substring( 1, nextPart.length - 1 );
                                    // We need to identify the type of translation being requested
                                    // and get the data we would use. splitPart[0] is <index>, splitPart[1]
                                    // is the translation request; e.g., currency:2.
                                    splitPart = nextPart.split( '/' );
                                    // splitPart[0] can be either a number that we use to index into
                                    // variables to get the numeric value to translate or it can be
                                    // a text key value. If the latter then we do a simple text translation.
                                    index = Number(splitPart[0]);
                                    if (isNaN( index )) {
                                        // Interpret splitPart[0] as a text option
                                        translationOptions = splitPart[0].split( ':' );
                                        hasOptions = translationOptions.length > 1;
                                        if (translationOptions[0] === "text") {
                                            // Need at least one option after "text".
                                            if (translationOptions.length > 1) {
                                                localization = factory.text(
                                                    translationOptions[1],
                                                        (translationOptions.length > 2) && ((translationOptions[2] === 'p') || (translationOptions[2] === 'P')),
                                                        (translationOptions.length > 2) && ((translationOptions[2] === 'S') || (translationOptions[2] === 'P'))
                                                );
                                            } else {
                                                localization = "(invalid: " + nextPart + ")";
                                                AMO.log.error( "Cannot translate " + nextPart + ". No key value following \"text\"" );
                                            }
                                        } else {
                                            localization = factory.text(translationOptions[0]);
                                        }
                                    } else {
                                        // Now we split splitPart[1] on colons. This will get us
                                        // the translation type and any options that are relevant to the type.
                                        if (utils.hasContents(splitPart[1])) {
                                            translationOptions = splitPart[1].split( ':' );
                                            hasOptions = translationOptions.length > 1;
                                            switch (translationOptions[0]) {
                                                case "number":
                                                    numDigits = hasOptions ? Number(translationOptions[1]) : 0;
                                                    if (isNaN( numDigits )) {
                                                        localization = "(invalid: " + nextPart + ")";
                                                        AMO.log.error("Cannot translate " + nextPart + ". Number of decimal places value is not a number.");
                                                    } else {
                                                        localization = factory.number(variables[index], numDigits);
                                                    }
                                                    break;
                                                case "currency":
                                                    numDigits = hasOptions ? Number(translationOptions[1]) : 0;
                                                    if (isNaN( numDigits )) {
                                                        localization = "(invalid: " + nextPart + ")";
                                                        AMO.log.error("Cannot translate " + nextPart + ". Number of decimal places value is not a number.");
                                                    } else {
                                                        localization = factory.currency(variables[index], numDigits);
                                                    }
                                                    break;
                                                case "date":
                                                    localization = factory.date( variables[index], hasOptions ? translationOptions[1] : null );
                                                    break;
                                                case "time":
                                                    localization = factory.time( variables[index], hasOptions ? translationOptions[1] : null );
                                                    break;
                                                case "dateTime":
                                                    localization = factory.dateTime(
                                                        variables[index],
                                                        hasOptions ? translationOptions[1] : null,
                                                            translationOptions.length > 2 ? translationOptions[2] : null
                                                    );
                                                    break;
                                                case "text":
                                                    localization = factory.text(
                                                        translationOptions[0],
                                                            hasOptions && ((translationOptions[1] === 'p') || (translationOptions[1] === 'P')),
                                                            hasOptions && ((translationOptions[1] === 'S') || (translationOptions[1] === 'P'))
                                                    );
                                                    break;
                                                default:    // A key we'll translate--default for text( key ) with no capitalization or pluralization options.
                                                    localization = factory.text(translationOptions[0]);
                                                    break;
                                            }
                                        } else {
                                            // No data following the /.
                                            localization = "(invalid: " + nextPart + ")";
                                            AMO.log.error("Cannot translate " + nextPart + ". No translation data following the index value.");
                                        }
                                    }
                                    result.append( localization );
                                } else {
                                    result.append( nextPart );
                                }
                            }
                            return result.toString();
                        };

                    factory.localize =
                        /**
                         * Does localization according to the instructions in the l10n string.
                         * This function will eventually call one of the specific factory functions,
                         * like "number", based on the l10n string. This function is, therefore,
                         * a factory for the other functions. In addition, this function will also
                         * @param l10n The string to localize, typically something like "number:scopeVar:2
                         * @param scope The current scope
                         * @param defaultValue Can be null. If not null then will be used when a default
                         *              value is appropriate, like text where the lookup attribute does not
                         *              exist.
                         * @return the localized value.
                         */
                        function( l10n, scope, defaultValue, changeFunction ) {
                            if (utils.hasContents( l10n )) {
                                var result = null;
                                var parts = l10n.split( ':' );
                                var currVal, watchAttribute;


                                // use the first part to determine the what type of translation to do.
                                if (! parts || (parts.length === 0)) {
                                    AMO.log.debug("Possible error: l10n attribute contains no values: " + l10n);
                                } else if (parts.length === 1) {
                                    // If there is just one element then assume it is text. Also
                                    // assume it is singlur and lowercase. We also get the default
                                    // value from the element's body. For example, if the l10n attribute's
                                    // value is "foo" we assume that we've been given "text:foo:s".
                                    result = factory.text( l10n, utils.getNonNullValue( defaultValue, "", true ) );
                                } else {
                                    switch (parts[0]) {
                                        case "number":
                                            // parts: ["number",<scope variable or actual number>,<opt. num decimals>
                                            currVal = parts.length >= 2 ? Number( parts[1] ) : 0;
                                            // Did we get a scope attribute name or an actual amount
                                            if (isNaN( currVal )) {
                                                // got a scope variable name. Get the value from the scope.
                                                watchAttribute = parts[1];
                                                currVal = scope[watchAttribute];
                                            }
                                            result = factory.number(
                                                currVal,
                                                    parts.length >= 3 ? Number(parts[2]) : 0
                                            );
                                            break;

                                        case "currency":
                                            // parts: ["currency",<scope variable or actual amount>,<opt. num decimals>
                                            // Did we get a scope attribute name or an actual amount
                                            currVal = parts.length >= 2 ? Number( parts[1] ) : 0;
                                            if (isNaN( currVal )) {
                                                // got a scope variable name. Get the value from the scope.
                                                watchAttribute = parts[1];
                                                currVal = scope[watchAttribute];
                                            }
                                            result = factory.currency(
                                                currVal,
                                                    parts.length >= 3 ? Number(parts[2]) : 0
                                            );
                                            break;

                                        case "date":
                                            // parts: [ "date", <scope variable or date expressed as #>, <date format>, <adjust for GMT>
                                            currVal = parts.length >= 2 ? Number( parts[1] ) : 0;
                                            var date;
                                            // Did we get a scope attribute name or an actual date value (e.g., Date().getTime()?
                                            if (isNaN( currVal )) {
                                                // got a scope variable name. Get the value from the scope.
                                                watchAttribute = parts[1];
                                                date = new Date( scope[watchAttribute] );
                                            } else {
                                                date = new Date( currVal );
                                            }

                                            result = factory.date( date, parts.length >= 3 ? parts[2] : null );
                                            break;

                                        case "time":
                                            // parts: [ "time", <scope variable or date expressed as #>, <time format>, <adjust for GMT>
                                            currVal = parts.length >= 2 ? Number( parts[1] ) : 0;
                                            var time;
                                            // Did we get a scope attribute name or an actual date value (e.g., Date().getTime()?
                                            if (isNaN( currVal )) {
                                                // got a scope variable name. Get the value from the scope.
                                                watchAttribute = parts[1];
                                                time = new Date( scope[watchAttribute] );
                                            } else {
                                                time = new Date( currVal );
                                            }

                                            result = factory.time( time, parts.length >= 3 ? parts[2] : null, parts.length >= 4 ? parts[3] : null );
                                            break;

                                        case "dateTime":
                                            // parts: [ "time", <scope variable or date expressed as #>, <date format>, <time format>, <adjust for GMT>
                                            currVal = parts.length >= 2 ? Number( parts[1] ) : 0;
                                            var dateTime;
                                            // Did we get a scope attribute name or an actual date value (e.g., Date().getTime()?
                                            if (isNaN( currVal )) {
                                                // got a scope variable name. Get the value from the scope.
                                                watchAttribute = parts[1];
                                                dateTime = new Date( scope[watchAttribute] );
                                            } else {
                                                dateTime = new Date( currVal );
                                            }

                                            result = factory.dateTime( dateTime, parts.length >= 3 ? parts[2] : null, parts.length >= 4 ? parts[3] : null );
                                            break;

                                        case "text":
                                            // Expect a number of attributes:
                                            //      text:key
                                            //      text:key:defaultValue
                                            //      text:key:pluralCapitalizeOption:defaultValue
                                            // We don't expect that key is a scope attribute since we expect key to be
                                            // a value that we use to locate a translated value. That is, we don't
                                            // translate actual text, like "Campaign Name Label", rather we translate
                                            // a key value like "campaignNameLabel".
                                            var plural = false, capitalization = false,
                                                localDefault = defaultValue;

                                            // Handle different number of parameters.
                                            if (arguments.length > 2) {
                                                if (arguments.length === 3) {
                                                    localDefault = utils.getNonNullValue(parts[2], defaultValue);
                                                } else {
                                                    localDefault = utils.getNonNullValue(parts[3], defaultValue);
                                                    if (parts[2] === 'P') {
                                                        capitalization = true;
                                                        plural = true;
                                                    } else if (parts[2] === 'S') {
                                                        capitalization = true;
                                                    } else if (parts[2] === 'p') {
                                                        plural = true;
                                                    }
                                                }
                                            }
                                            // Now localize with the options we determined above.
                                            result = factory.text( parts[1], plural, capitalization, localDefault );
                                            break;

                                        case "phrase":
                                            // Expect three elements in parts: phrase:<key>:<scopeAttr>. If <key> is missing we just
                                            // send null. The default value will be used.
                                            // The part contains the name of the scope attribute that contains
                                            // the data we pass to the translation object. Note that if the phrase only contains
                                            // text references then we might not have any data. We expect an array but will
                                            // convert a single value into an array.
                                            watchAttribute = parts.length >= 3 ? parts[2] : null;
                                            var value = scope[watchAttribute];
                                            result = factory.phrase(
                                                // parts[1] is the key we use to look up the translated phrase in the translation table.
                                                    parts.length >= 2 ? parts[1] : null,
                                                    value instanceof Array ? value : [ value ],
                                                utils.getNonNullValue( defaultValue, "" )
                                            );
                                            break;

                                        default:
                                            // Treat as text with default options.
                                            result = factory.text( l10n );
                                            break;
                                    }
                                }

                                if (!! changeFunction) {
                                    // If our source data is from a scope attribute then we watch that attribute for
                                    // changes.
                                    var doneOnce1 = false;
                                    if (!! watchAttribute) {
                                        if (scope[watchAttribute] instanceof Array) {
                                            scope.$watchCollection(
                                                watchAttribute,
                                                function() {
                                                    if (doneOnce1) {
                                                        changeFunction(l10n, scope, defaultValue);
                                                    } else {
                                                        doneOnce1 = true;
                                                    }
                                                }
                                            );
                                        } else if (typeof scope[watchAttribute] === "object") {
                                            scope.$watch(
                                                watchAttribute,
                                                function() {
                                                    if (doneOnce1) {
                                                        changeFunction(l10n, scope, defaultValue);
                                                    } else {
                                                        doneOnce1 = true;
                                                    }
                                                }, true
                                            );
                                        } else {
                                            scope.$watch(
                                                watchAttribute,
                                                function() {
                                                    if (doneOnce1) {
                                                        changeFunction(l10n, scope, defaultValue);
                                                    } else {
                                                        doneOnce1 = true;
                                                    }
                                                }
                                            );
                                        }
                                    }

                                    // L10N directives will watch this attribute in the root scope. This gets set
                                    // when the language changes and lets the various instances of the directives
                                    // re-render themselves. If I could figure out how to force individual directives
                                    // to re-render then this would not be needed. The code that installs a new
                                    // language selection would simply do that. No extra overhead for a task that
                                    // will likely only occur once, if at all.
                                    var doneOnce2 = false;
                                    scope.$root.$watch(
                                        "CURRENT_LOCALIZATION",
                                        function() {
                                            if (doneOnce2) {
                                                changeFunction(l10n, scope, defaultValue);
                                            } else {
                                                doneOnce2 = true;
                                            }
                                        }
                                    );
                                }

                                return result;
                            } else {
                                return l10n;
                            }

                        };

                    factory.getLanguage =  function () { return currentLocalization.language; };
                    factory.getLanguageName = function () { return currentLocalization.name; };

                    initialized = true;
                };

            var parsePhrase =
                /**
                 * Given a phrase that was input to the parse function extract the
                 * individual string and ^...^ sections into an array. For example,
                 *
                 *      Your ^0/currency:2^ bid on ^1/date:medium^ was too low.
                 *
                 * would parse to:
                 *
                 *      [ "Your ", "^0/currency:2^", " bid on ", "^1/date:medium^", " was too low." ]
                 */
                function( phrase ) {
                    // Where we add the individual substrings, as shown above.
                    var parseResult = [];

                    // Simplest to just scan for '^' characters and extract substrings.
                    var currentPosition = 0, nextCaret = phrase.indexOf( '^' ), totalLength = phrase.length;
                    var currentChar, nextChar;
                    while (currentPosition < totalLength) {
                        // Find the next carat position.
                        if (nextCaret === -1) {
                            nextCaret = totalLength;
                        }

                        // We're looking for ^...^ sequences. So if currentPosition
                        // and nextCarat both point to '^' characters then we output
                        // all data from currentPosition through--and including--
                        // nextCarat are output. This would be a ^...^ sequence that
                        // we'll localize. Otherwise, we're in a text sequence that
                        // we won't localize. Oh, and other edge conditions like
                        // one localiztion sequence directly following another.
                        currentChar = phrase.charAt( currentPosition );
                        nextChar = phrase.charAt( nextCaret );
                        if (currentChar === '^') {
                            // We've found a complete ^...^ sequence so output all of
                            // the characters, including the ^ we just found.
                            parseResult.push( phrase.substring( currentPosition, ++nextCaret ) );
                            currentPosition = nextCaret;
                            nextCaret = phrase.indexOf( '^', currentPosition );
                        } else {
                            // The '^' we found is the start of the next ^...^ sequence.
                            // Everything from currentPosition up to (but not including
                            // the ^ is a simple string.
                            parseResult.push( phrase.substring( currentPosition, nextCaret ) );
                            currentPosition = nextCaret;
                            nextCaret = phrase.indexOf( '^', currentPosition + 1 );
                        }
                    }

                    return parseResult;
                };
            /**
             * Retrieve the translation value at the indicated position
             * in the array of translation values. If the requested value
             * is not provided (undefined or null) then we fall back to
             * another value. For example, if lowercase plural is requested
             * but not provided then we try to return the lowercase singular
             * value.
             * @param translation An array with up to 4 entries. The possible
             *        configurations of values are:
             *              [singular]
             *              [singular, plural]
             *              [singular, plural, singularCapitalized]
             *              [singluar, plural, singularCapitalized, pluralCapitalized]
             * @param index The particular value we should return; for example, 2 if
             *              the singular-capitalized version is needed.
             * @return the translated value. Can be null but this would be a very
             *          degenerate case.
             */
            var getTranslationValue =
                function( translation, translationIndex ) {
                    switch (translationIndex) {
                        case 0: // Singular, lowercase
                            return utils.getNonNullValue( translation[0], null );

                        case 1: // Plural, lowercase
                            return utils.getNonNullValue( translation[1], function() { return getTranslationValue( translation, 0 ); } );

                        case 2: // Singular, capitalized
                            return utils.getNonNullValue( translation[2], function() { return getTranslationValue( translation, 0 ); } );

                        case 3: // Plural, capitalized.
                            return utils.getNonNullValue( translation[3], function() { return getTranslationValue( translation, 1 ); } );
                    }
                };

            /**
             * Generate an actual Date instance from the value in date. Take into consideration
             *  that the value of date can be an actual Date object, a number that
             *  represents the date in traditional milliseconds, a string that contains
             *  a valid date number or a string that contains a formatted date/time value.
             * @param date The value to convert to a date.
             * @return a Date instance. It might not be valid if the input could not be converted.
             */
            var getDate = function (date) {
                var localDate;

                // Convert the date argument to the proper value. Take into consideration
                if (date instanceof Date) {
                    localDate = date;
                }
                else {
                    if ((typeof date === "number") || (date instanceof Number)) {
                        localDate = new Date(date);
                    }
                    else {
                        // See if the data is a string that is a number (vs a
                        // string that could be a formatted date/time string).
                        if ((typeof date === "string") || (date instanceof String)) {
                            // First, is date actually the value "now"? If so, we use the current time.
                            if (date === "now") {
                                localDate = new Date();
                            }
                            else {
                                var number = Number(date);
                                if (isNaN(number)) {
                                    // Assume something that Date can handle.
                                    localDate = new Date(date.toString());
                                }
                                else {
                                    if (number.toString() === date) {
                                        localDate = new Date(number);
                                    }
                                    else {
                                        // Assume something that Date can handle.
                                        localDate = new Date(date.toString());
                                    }
                                }
                            }
                        }
                        else {
                            // Assume something that Date can handle.
                            localDate = new Date(date.toString());
                        }
                    }
                }

                return localDate;
            };

            // Done once when the factory is instantiated by Angular.
            if (! initialized && !! currentLocalization) {
                installI18NFunctions();
                factory.useLocalization( currentLocalization );
            }

            return factory;
        };

    var directiveFunction =
        function() {

            var linkFunction =
                function( scope, element, attrs ) {

                    // The directive can be used in standard HTML elements or
                    // within other directives. When the directive is used in
                    // a div, span, button or option tag the localization will
                    // done immediately. The result will replace the tag's
                    // contents. When the directive is used in other tags it
                    // will not do an immediate translation
                    var tag = element.prop( 'tagName').toLowerCase();
                    if ("<div><span><p><button><option>".indexOf( tag ) !== -1) {
                        var changeFunction =
                            function( l10n, scope, defaultValue ) {
                                element.html(
                                    factory.localize( attrs.cuiL10n, scope, element.html(), changeFunction )
                                );
                            };
                        element.html(
                            factory.localize( attrs.cuiL10n, scope, element.html(), changeFunction )
                        );
                    }
                };

            return {
                link: linkFunction,
                restrict: 'A',
                scope: true
            };
        };

    var module = angular.module( "LocalizationModule", [ "ng", "UtilitiesModule" ] );
    module.run(
        [
            '$rootScope',
            function( $rootScope ) {
                // Just want to make sure the CURRENT_LOCALIZATION attribute exists
                // in the root scope. This attribute contains the current
                // localization config. If this config is changed then
                // this attribute will be updated. When our directive
                // detects this change it will update the specific localization
                // that is wrapped by the directive.
                if (! $rootScope.CURRENT_LOCALIZATION) {
                    $rootScope.CURRENT_LOCALIZATION = "default";
                }
            }
        ]
    );
    module.factory( "LocalizationFactory", [ "UtilitiesFactory", L10NFactoryFunction ] );
    module.directive( "cuiL10n", [ directiveFunction ] );


/*
    var localizationDemo =
        function()
        {

            AMO.log.debug( "I18N test: <not defined> = " + factory.text( 'not-defined' ) );
            AMO.log.debug(
                    "           'foo (spSP)' = " +
                    factory.text( 'foo', false, false ) + ", " + factory.text( 'foo', true, false ) + ", " +
                    factory.text( 'foo', false, true ) + ", " + factory.text( 'foo', true, true )
            );
            AMO.log.debug(
                    "           'date (spSP)' = " +
                    factory.text( 'dateUnit', false, false ) + ", " + factory.text( 'dateUnit', true, false ) + ", " +
                    factory.text( 'dateUnit', false, true ) + ", " + factory.text( 'dateUnit', true, true )
            );
            AMO.log.debug(
                    "           'time (spSP)' = " +
                    factory.text( 'timeUnit', false, false ) + ", " + factory.text( 'timeUnit', true, false ) + ", " +
                    factory.text( 'timeUnit', false, true ) + ", " + factory.text( 'timeUnit', true, true )
            );
            AMO.log.debug(
                    "           '5.43 (0, 1, 2, 3 decimals)' = " +
                    factory.number( 5.43, 0 ) + ", " + factory.number( 5.43, 1 ) + ", " + factory.number( 5.43, 2 ) + ", " + factory.number( 5.43, 3 )
            );
            AMO.log.debug(
                    "           '5 (0, 1, 2, 3 decimals)' = " +
                    factory.number( 5, 0 ) + ", " + factory.number( 5, 1 ) + ", " + factory.number( 5, 2 ) + ", " + factory.number( 5, 3 )
            );
            AMO.log.debug(
                    "           '5.43 as a currency (0, 2 decimals)' = " +
                    factory.currency( 5.43, 0 ) + ", " + factory.currency( 5.43, 2 )
            );
            AMO.log.debug(
                    "           '5 as a currency (0, 2 decimals)' = " +
                    factory.currency( 5, 0 ) + ", " + factory.currency( 5, 2 )
            );
            var now = new Date();
            AMO.log.debug(
                    "           date = " +
                    "tiny = " + factory.date( now, factory.TINY_DATE ) +
                    ", short = " + factory.date( now, factory.SHORT_DATE ) +
                    ", medium = " + factory.date( now, factory.MEDIUM_DATE ) +
                    ", long = " + factory.date( now, factory.LONG_DATE ) +
                    ", full = " + factory.date( now, factory.FULL_DATE )
            );
            AMO.log.debug(
                    "           time = " +
                    "short = " + factory.time( now, factory.SHORT_TIME ) +
                    ", medium = " + factory.time( now, factory.MEDIUM_TIME ) +
                    ", long = " + factory.time( now, factory.LONG_TIME ) +
                    ", seconds = " + factory.time( now, factory.SECONDS_TIME ) +
                    ", ms = " + factory.time( now, factory.MILLISECONDS_TIME ) +
                    ", military = " + factory.time( now, factory.MILITARY_TIME ) +
                    ", 24H = " + factory.time( now, factory.HOUR_24_TIME )
            );
            AMO.log.debug( "           date/time = " + factory.dateTime( now, factory.FULL_DATE, factory.MILLISECONDS_TIME ) );

        };
*/
})();
