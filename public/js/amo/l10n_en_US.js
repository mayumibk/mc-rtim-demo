/**
 * An example of a localization file that is used by AMO.i18n.
 * To localize a particular page include this file in the <script>
 * section of the page's header. This will presumably be done by the server-side
 * code that generates the page's HTML and will be based on a cookie or
 * query string parameter.
 *
 * The existing localization can be changed by calling AMO.i18n.useLocalization
 * again with a similar data structure, perhaps as retrieved from the server.
 *
 * This file must be loaded *after* i18nUtilities.js is loaded. Note that this file is
 * valid JavaScript. If loaded via an HTTP GET we'd only need the JSON argument.
 */
(function() {
    "use strict";

    // The translation is defined here.
    var en_US = {
        /** The language of the localizations provided in this file. */
        language: "en_US",
        /** and the name of this language. */
        name: "US English",

        /**
         * The revsion number of this file. In general, this number is
         * updated when the contents are modified; for example, as new
         * translations are added.
         */
        version: 1,

        /**
         * A map that defines the translations we use to localize content.
         * Each attribute in ths map defines one translation from a key
         * (the attribute name) to a localized value (the attribute's
         * value). If the value is an array then the first item is used
         * when a singular word is appropriate. The second item is used when
         * a plural word is appropriate. Providing singular and plural
         * versions is not required. If a plural value is requested at
         * runtime and none is provided then the singular version or the
         * value itself (an array not used) is returned. Similarly two more
         * values can be provided for capitalized words, singular and plural.
         *
         * This section would be sent to Adobe's translation service. (Number,
         * currency, date and time formats are defined later.)
         */
        translations:
        {
            // Examples are defined below. These are for testing/demonstration purposes only, for now.

            /** A word with a single translation, used for both singular and plural, lowercase and caps. */
            campaignNameLabel: "Campaign Name",
            campaignNameDefault: "Enter campaign name",
            adSetNameLabel: "Ad Set Name",
            budgetLabel: "Budget",
            frequencyCapLabel: "Frequency Cap",
            portfolioLabel: "Portfolio",
            portfolioDefault: "Enter a portfolio",
            labelsLabel: "Labels",

            /** A word with specific singular and plural forms. */
            timeUnit: [ "hour", "hours" ],
            /** A word with singular and plural forms in lowercase and initial caps. */
            dateUnit: [ "day", "days", "Day", "Days" ],

            enterPlaceholder: "Enter a value",
            defaultSummary: "",
            requiredValue: "(required)",

            // A phrase that would be translated. The code would then localize the
            // text in the ^...^ sequences. See the documentation for AMO.i18n.phrase(...)
            // for details on how the ^...^ sequences.
            bidError: "Your <span style='color: red;'>^0/currency:2^</span> bid on ^1/date:medium^ was too low.",

            foundZCharError: "Please do not include the capital 'Z' character in your input.",

            // Main tab bar labels.
            portfolio: "Portfolio",
            display: "Display",
            search: "Search",
            social: "Social",
            reports: "Reports",
            admin: "Administration"
        },

        /**
         * Rules for localizing numbers, currency values, dates and times. For
         * the most part, these sections define order (for example, month/day
         * vs day/month) and symbols to use (for example, "comma" as the
         * decimal separator vs "period").
         */
        conversions:
        {
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
            number: "commaPeriod", // "apostrophePeriod" is defined in the default configuration defined ini18nUtilities.js.
            // Other default options are also defined there; for example, "commaPeriod",
            // "apostrophePeriod" (yes, a format that is really used.)

            currency:
            {
                /* Currencies will use the number localization. */
                /**
                 * When a number is localized as a currency this is the currency
                 * symbol (string) that is prepended to the formatted number. This
                 * can be multiple characters; for example, "USD". The default is "USD"
                 */
                currencySymbol: '$',

                /**
                 * Negative currency values are sometimes represented in a distinct
                 * form, such as within parentheses: ($1,234.56) for -1234.56. If this
                 * attribute is a single character--for example, a minus symbol, then
                 * negative currency values are prefixed with that symbol. If two characters
                 * are supplied--for example, "()"--then negative currency values are
                 * prefixed with the first character an suffixed with the second character.
                 * The default value is '-'.
                 */
                negativeCurrencySymbol: '-'     //  Default
            },

            /** Localization rules for dates and the date portion of date/time localizations. */
            date:
            {
                /**
                 * Defines the order in which the date elements--month, day and year--are shown
                 * and the symbol used to separate the elements. Use the single characters 'm', 'd'
                 * and 'y' plus the separator symbol. This is not used to indicate the number
                 * of digits to be used. That is specified in the AMO.i18n.date  function.
                 *
                 * Three values are provided. The first is used for number-only date
                 * representations (e.g., "10/25/10") with two-digit year, the second
                 * for number-only date representations with four-digit year and the
                 * third and fourth for text/number representations (e.g., "October 25, 2010").
                 * The third one uses the month's abbreviation and the second uses the
                 * full month. While you can format these as you wish, the four elements
                 * ultimately correspond to the "type" argument passed to AMO.i18n.date:
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
                 *
                 * Finally, the "browser" format will simply return the browser's Date.toString() value.
                 */
                format: "monthDay", // "monthDay" is defined in the default configuration defined ini18nUtilities.js.
                // Other default options are also defined there, like "dayMonth"

                /**
                 * The month names used when localizing dates as
                 * longer forms; for example, February 10, 2011. This attribute is an array of
                 * month name arrays (two dimensions). For each month provide the full
                 * month name (first array element) and the abbreviated month name (second array
                 * element).
                 */
                months: [ ["January","Jan"], ["February","Feb"], ["March","Mar"], ["April","Apr"], ["May","May"], ["June","Jun"], ["July","Jul"], ["August","Aug"], ["September","Sep"], ["October","Oct"], ["November","Nov"], ["December","Dec"] ],

                /** Similar content for days of the week. */
                days: [ ["Sunday", "Sun"], ["Monday", "Mon"], ["Tuesday", "Tue"], ["Wednesday", "Wed"], ["Thursday", "Thu"], ["Friday", "Fri"], ["Saturday", "Sat"]]
            },
            time:
            {
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
                    ],

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
    };

    var injector = angular.injector( [ "LocalizationModule", "ng" ] );
    var factory = injector.get( "LocalizationFactory" );
    factory.useLocalization( en_US );
}());

