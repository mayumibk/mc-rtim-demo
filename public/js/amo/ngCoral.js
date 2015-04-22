(function () {

"use strict";

var ngCoral = angular.module('ngCoral', ['ngCoral-templates']);

ngCoral.directive('cuiCollectionHost', function () {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs', '$transclude', function ($scope, $element, $attrs, $transclude) {

            this.handleChildAddition = function (element) {
                if ($.isFunction($scope.handleChildAddition)) {
                    $scope.handleChildAddition(element);
                }
            };

            this.handleChildRemoval = function (element) {
                if ($.isFunction($scope.handleChildRemoval)) {
                    $scope.handleChildRemoval(element);
                }
            };
        }]
    };
});

ngCoral.directive('cuiCollectionItem', function () {
    return {
        restrict: 'A',
        require: '^cuiCollectionHost',
        link: function (scope, element, attrs, ctrl, transclude) {

            // Signal that a new child has been added:
            ctrl.handleChildAddition(element);

            // Listen for the element being removed:
            scope.$on('$destroy', function () {
                // Signal that a child has been removed:
                ctrl.handleChildRemoval(element);
            });
        }
    };
});

// Directive that given a root object and a field string, depicts the
// string value:
// <cui-deep-field object="item" field="long.path.to.field">
ngCoral.directive('cuiDeepField', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<span></span>',
        link: function (scope, element, attrs) {
            var all_fields = attrs.object;
            var fields = attrs.field || '';
            if (fields) {
                all_fields += '.' + fields;
            }
            scope.$watch(all_fields, function (value) {
                element.text(value);
            });
        }
    };
});

// Directive that given a scope, monitors a field on that scope, adding
// it as the main text of the defining element:
ngCoral.directive('cuiDeepFieldAttr', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var target = attrs.cuiDeepFieldAttr;
            scope.$watch(target, function (value) {
                element.text(value);
            });
        }
    };
});

ngCoral.constant('ngCoral.MANIFEST', {
  "version": [
    1,
    0,
    6
  ],
  "target_cui_version": [
    2,
    6,
    0
  ],
  "target_cui_shell_version": [
    3,
    0,
    8
  ],
  "target_cui_card_version": [
    1,
    2,
    2
  ],
  "target_angular_version": [
    1,
    2,
    21
  ],
  "directives": [
    "cui-accordion",
    "cui-alert",
    "cui-card-view",
    "cui-character-count",
    "cui-collapsible",
    "cui-cycle-button",
    "cui-datepicker",
    "cui-modal",
    "cui-number-input",
    "cui-popover",
    "cui-select",
    "cui-select-list",
    "cui-shell",
    "cui-slider",
    "cui-tabs",
    "cui-tag-list",
    "cui-tooltip",
    "cui-wizard",
    "data-init"
  ]
});

// Internal uid representation:
var uid = ['0', '0', '0' ];

// Method for obtaining a unique ID. Copy of Angular's internal nextUid() method.
function nextUid() {
    var index = uid.length;
    var digit;

    while (index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
}

function hash(object) {
    return object.$$ngCuiHash || (object.$$ngCuiHash = nextUid());
}

// Strip all the fields that are set to undefined from a given object:
function removeUndefinedFields(object) {
    for (var field in object) {
        if (object[field] === undefined) {
            delete object[field];
        }
    }
    return object;
}

function stringToBool(value) {
    if (value === undefined) {
        return undefined;
    } else {
        var stringValue = value ? value.toString().toLowerCase() : 'false';
        return !(stringValue === 'false' || stringValue === '0');
    }
}

function stringToNumber(value) {
    if (value === undefined) {
        return undefined;
    } else {
        return parseFloat(value);
    }
}

angular.module('ngCoral-templates', ['cui-accordion/tab-container.tpl.html', 'cui-accordion/tab-content.tpl.html', 'cui-accordion/tab-header.tpl.html', 'cui-accordion/tab-tab.tpl.html', 'cui-alert/template.tpl.html', 'cui-character-count/input.tpl.html', 'cui-character-count/textarea.tpl.html', 'cui-collapsible/template.tpl.html', 'cui-datepicker/template.tpl.html', 'cui-modal/template.tpl.html', 'cui-number-input/template.tpl.html', 'cui-popover/popover-container.tpl.html', 'cui-popover/popover-content.tpl.html', 'cui-select-list/item.tpl.html', 'cui-select-list/template.tpl.html', 'cui-select/template.tpl.html', 'cui-slider/template.tpl.html', 'cui-tabs/template.tpl.html', 'cui-tag-list/template.tpl.html', 'cui-wizard/template.tpl.html']);

angular.module("cui-accordion/tab-container.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-accordion/tab-container.tpl.html",
    "<ul class=\"coral-Accordion\"></ul>");
}]);

angular.module("cui-accordion/tab-content.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-accordion/tab-content.tpl.html",
    "<div class=\"coral-Accordion-content\"></div>");
}]);

angular.module("cui-accordion/tab-header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-accordion/tab-header.tpl.html",
    "<h3 class=\"coral-Accordion-header\">\n" +
    "</h3>");
}]);

angular.module("cui-accordion/tab-tab.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-accordion/tab-tab.tpl.html",
    "<li class=\"coral-Accordion-item\"></li>");
}]);

angular.module("cui-alert/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-alert/template.tpl.html",
    "<div class=\"coral-Alert coral-Alert--error\">\n" +
    "    <button ng-show=\"closable\" type=\"button\" class=\"coral-MinimalButton coral-Alert-closeButton\" title=\"Close\" data-dismiss=\"alert\">\n" +
    "        <i class=\"coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon\"></i>\n" +
    "    </button>\n" +
    "    <i class=\"coral-Alert-typeIcon coral-Icon coral-Icon--sizeS coral-Icon--alert\"></i>\n" +
    "    <strong class=\"coral-Alert-title\"></strong>\n" +
    "    <div class=\"coral-Alert-message\"></div>\n" +
    "</div>");
}]);

angular.module("cui-character-count/input.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-character-count/input.tpl.html",
    "<span>\n" +
    "    <input class=\"coral-Textfield\" type=\"text\" ng-model=\"$value\">\n" +
    "    <span class=\"coral-CharacterCount\" data-init=\"character-count\"></span>\n" +
    "</span>");
}]);

angular.module("cui-character-count/textarea.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-character-count/textarea.tpl.html",
    "<span>\n" +
    "    <textarea class=\"coral-Textfield coral-Textfield--multiline\" ng-model=\"$value\" rows=\"rows\" cols=\"cols\"></textarea>\n" +
    "    <span class=\"coral-CharacterCount\"></span>\n" +
    "</span>");
}]);

angular.module("cui-collapsible/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-collapsible/template.tpl.html",
    "<div class=\"coral-Collapsible\">\n" +
    "    <h3 class=\"coral-Collapsible-header\">\n" +
    "        <span class=\"coral-Collapsible-title\">{{title}}</span>\n" +
    "        <span class=\"coral-Collapsible-subtitle\">{{subtitle}}</span>\n" +
    "    </h3>\n" +
    "    <div class=\"coral-Collapsible-content\" ng-transclude>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("cui-datepicker/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-datepicker/template.tpl.html",
    "<div class=\"coral-Datepicker coral-InputGroup\">\n" +
    "    <input class=\"coral-InputGroup-input coral-Textfield\">\n" +
    "    <span class=\"coral-InputGroup-button\">\n" +
    "    <button class=\"coral-Button coral-Button--secondary coral-Button--square\"\n" +
    "            type=\"button\"\n" +
    "            title=\"Datetime Picker\">\n" +
    "        <i class=\"coral-Icon coral-Icon--sizeS\"></i>\n" +
    "    </button>\n" +
    "  </span>\n" +
    "</div>");
}]);

angular.module("cui-modal/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-modal/template.tpl.html",
    "<span>\n" +
    "    <div class=\"coral-Modal\">\n" +
    "        <div class=\"coral-Modal-header\">\n" +
    "            <i class=\"coral-Modal-typeIcon coral-Icon coral-Icon--sizeS\"></i>\n" +
    "            <h2 class=\"coral-Modal-title coral-Heading coral-Heading--2\"></h2>\n" +
    "            <button type=\"button\" class=\"coral-MinimalButton coral-Modal-closeButton\" title=\"Close\" data-dismiss=\"modal\">\n" +
    "                <i class=\"coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon\"></i>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <div class=\"coral-Modal-body\"></div>\n" +
    "        <div class=\"coral-Modal-footer\"></div>\n" +
    "    </div>\n" +
    "</span>");
}]);

angular.module("cui-number-input/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-number-input/template.tpl.html",
    "<div class=\"coral-InputGroup\">\n" +
    "  <span class=\"coral-InputGroup-button\">\n" +
    "    <button type=\"button\" class=\"js-coral-NumberInput-decrementButton coral-Button coral-Button--secondary coral-Button--square\" title=\"Decrement\">\n" +
    "        <i class=\"coral-Icon coral-Icon--sizeS coral-Icon--minus\"></i>\n" +
    "    </button>\n" +
    "  </span>\n" +
    "    <input type=\"text\" class=\"js-coral-NumberInput-input coral-InputGroup-input coral-Textfield\">\n" +
    "  <span class=\"coral-InputGroup-button\">\n" +
    "    <button type=\"button\" class=\"js-coral-NumberInput-incrementButton coral-Button coral-Button--secondary coral-Button--square\" title=\"Increment\">\n" +
    "        <i class=\"coral-Icon coral-Icon--sizeS coral-Icon--add\"></i>\n" +
    "    </button>\n" +
    "  </span>\n" +
    "</div>");
}]);

angular.module("cui-popover/popover-container.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-popover/popover-container.tpl.html",
    "<div class=\"coral-Popover\">\n" +
    "    <cui-popover-content style=\"display: none\"></cui-popover-content>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("cui-popover/popover-content.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-popover/popover-content.tpl.html",
    "<div class=\"coral-Popover-content u-coral-padding\" ng-transclude></div>");
}]);

angular.module("cui-select-list/item.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-select-list/item.tpl.html",
    "<li class=\"coral-SelectList-item coral-SelectList-item--option\" role=\"option\" data-value=\"{{$value}}\">{{$label}}</li>");
}]);

angular.module("cui-select-list/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-select-list/template.tpl.html",
    "<ul class=\"coral-SelectList\"></ul>");
}]);

angular.module("cui-select/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-select/template.tpl.html",
    "<span class=\"coral-Select\">\n" +
    "    <button type=\"button\" class=\"coral-Select-button coral-MinimalButton\">\n" +
    "          <span class=\"coral-Select-button-text\">{{placeholder}}</span>\n" +
    "    </button>\n" +
    "    <select class=\"coral-Select-select\">\n" +
    "        <option cui-deep-field-attr=\"{{$parent.composeLabel(option)}}\"\n" +
    "                ng-repeat=\"option in $options\"\n" +
    "                ng-value=\"option.$$hashKey || option\"\n" +
    "                >\n" +
    "        </option>\n" +
    "    </select>\n" +
    "</span>");
}]);

angular.module("cui-slider/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-slider/template.tpl.html",
    "<div class=\"coral-Slider\">\n" +
    "    <fieldset>\n" +
    "        <legend>{{legend}}</legend>\n" +
    "        <label>\n" +
    "            <input type=\"range\">\n" +
    "        </label>\n" +
    "        <label>\n" +
    "            <input type=\"range\">\n" +
    "        </label>\n" +
    "    </fieldset>\n" +
    "</div>");
}]);

angular.module("cui-tabs/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-tabs/template.tpl.html",
    "<div class=\"coral-TabPanel\">\n" +
    "    <nav class=\"coral-TabPanel-navigation\">\n" +
    "    </nav>\n" +
    "    <div class=\"coral-TabPanel-content\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("cui-tag-list/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-tag-list/template.tpl.html",
    "<ul class=\"coral-TagList\"\n" +
    "    role=\"list\"\n" +
    "    cui-collection-host>\n" +
    "    <li class=\"coral-TagList-tag\"\n" +
    "        role=\"listitem\"\n" +
    "        cui-collection-item\n" +
    "        ng-repeat=\"tag in tags\">\n" +
    "        <button class=\"coral-MinimalButton coral-TagList-tag-removeButton\"\n" +
    "                type=\"button\"\n" +
    "                title=\"Remove\">\n" +
    "            <i class=\"coral-Icon coral-Icon--sizeXS coral-Icon--close\"></i>\n" +
    "        </button>\n" +
    "        <cui-deep-field class=\"coral-TagList-tag-label\"\n" +
    "                        object=\"tag\"\n" +
    "                        field=\"{{label}}\">\n" +
    "        </cui-deep-field>\n" +
    "        <input type=\"hidden\"\n" +
    "               value=\"{{$index}}\"/>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("cui-wizard/template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("cui-wizard/template.tpl.html",
    "<form class=\"coral-Wizard\" ng-transclude></form>");
}]);


/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiAccordion', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var definition = {
        restrict: 'E',
        scope: {
            tabs: "=",
            active: "=?",
            disabled: "=?"
        },
        replace: true,
        compile: compile
    };

    var TAB_CONTAINER = $templateCache.get('cui-accordion/tab-container.tpl.html'),
        TAB_TAB = $templateCache.get('cui-accordion/tab-tab.tpl.html'),
        TAB_HEADER = $templateCache.get('cui-accordion/tab-header.tpl.html'),
        TAB_CONTENT = $templateCache.get('cui-accordion/tab-content.tpl.html'),

        CLASS_ACTIVE = 'is-active',
        CLASS_ACCORDION = 'coral-Accordion',

        tTab,
        tabScopes = [];

    function compile(tElement, tAttrs, transclude) {

        var templates = tElement.children(),
            tHeader = $(TAB_HEADER)
                .html(templates.filter('header').html()),
            tContent = $(TAB_CONTENT).html(
                templates.filter('content').html()),
            tTabHTML = $(TAB_TAB).append([tHeader, tContent]);

        tTab = $compile(tTabHTML);

        tElement.eq(0).replaceWith($(TAB_CONTAINER));

        // By returning the link function, it will be invoked next:
        return link;
    }

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var accordion;

        if (scope.active === undefined) {
            scope.active = 0;
        }

        if (scope.disabled === undefined) {
            scope.disabled = false;
        }

        scope.$watch('active', function (newValue) {
            if (accordion && accordion.get('active') !== newValue) {
                accordion.setActive(newValue);
            }
        });

        scope.$watch('disabled', function (newValue) {
            if (accordion && accordion.get('disabled') !== newValue) {
                accordion.set('disabled', newValue);
            }
        });

        scope.$watchCollection('tabs', function () {
            destructAccordion();
            addTabs();
            instantiateAccordion();
        });

        function destructAccordion() {
            if (accordion) {
                accordion.off();
                iElement.off();

                iElement.removeData('accordion');
                accordion = null;

                iElement.removeAttr('aria-disabled');
                iElement.removeClass(CLASS_ACCORDION);
            }

            tabScopes.forEach(function (scope) {
                scope.$destroy();
            });

            // Remove all on the current element:
            iElement.children().remove();
        }

        function addTabs() {
            if (angular.isArray(scope.tabs)) {
                scope.tabs.forEach(function (tab, index) {
                    var tabScope = scope.$new(true);
                    tabScope.$index = index;
                    tabScope.tab = tab;
                    tabScopes.push(tabScope);

                    tTab(tabScope, function (clone) {
                        if (scope.active.toString() === index.toString()) {
                            clone.addClass(CLASS_ACTIVE);
                        }
                        clone.on('click', tabClickedHandler);
                        iElement.append(clone);
                    });
                });
            }
        }

        function instantiateAccordion() {
            iElement.data('init', 'accordion');
            iElement.accordion({
                disabled: scope.disabled
            });

            accordion = iElement.data('accordion');
        }

        function tabClickedHandler(event) {
            scope.$evalAsync(function () {
                scope.active = accordion.get('active');
            });
        }
    }

    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiAlert', ["$compile", "$templateCache", function ($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {
            heading: "=?",
            content: "=?",
            closable: "=?",
            type: "=?",
            size: "=?",
            visible: "=?"
        },
        template: $templateCache.get('cui-alert/template.tpl.html'),
        replace: true,
        link: function (scope, element) {

            scope.visible = scope.visible === undefined ? true : scope.visible;

            var alert;

            [   'heading',
                'content',
                'closable',
                'type',
                'size',
                'visible'
            ].map(function (property) {
                    scope.$watch(property, function (newValue) {
                        if (alert) {
                            alert.set(property, newValue);
                        }
                    });
                });

            element.alert({
                heading: scope.heading,
                content: scope.content,
                closable: scope.closable,
                type: scope.type,
                size: scope.size,
                visible: scope.visible
            });

            alert = element.data('alert');
            alert.on('change:visible', function (event) {
                adjustNgVisible(event.value);
            });

            // Change visible is not triggered when the user dismisses the
            // alert by clicking the close button, so we listen for the
            // alert hiding too:
            alert.on('hide', function () {
                adjustNgVisible(false);
            });

            function adjustNgVisible(value) {
                if (scope.visible !== value) {
                    scope.$apply(function (value) {
                        scope.visible = value;
                    });
                }
            }
        }
    };
}]);

/**
 * cui-card-view. Please refer to the guide for usage instructions.
 *
 */
ngCoral.directive('cuiCardView', ["$compile", function ($compile) {
    return {
        restrict: 'E',
        scope: {
            /**
             * The data collection to depict in the CardView:
             */
            collection: '=',

            /**
             * The variable name under which single items will be accessible on the
             * generated article's scope. ("item" by default).
             */
            itemName: '=?',

            /**
             * A function that takes an individual item, and returns a string that
             * represents that article in HTML. Note that the function may very well
             * return the same HTML regardless of the item passed.
             *
             * When no factory is specified, the directive will look for the first
             * child article tag, and use its HTML as the template for all articles.
             */
            factory: '=?',

            /**
             * An array of holding the subset of 'collection' that is currently
             * selected.
             */
            selection: '=?',

            /**
             * The display mode: true for list mode, and false for grid mode. False
             * by default.
             */
            listMode: '=?',

            /**
             * Grid mode only: determines if clicking a card toggles its selected
             * state or not.
             *
             * Note that all generated articles must have a '<i class="select"></i>'
             * tag added as a child for grid selection (or row selection for that
             * matter) to work.
             */
            gridSelectionMode: '=?'
        },
        transclude: true,
        replace: true,
        link: function (scope, element, attrs, ctrl, transclude) {

            var collectionMap = {},
                cardView;

            function init() {

                // Add the user defined header (if found):
                transclude(scope, function (clone) {
                    var header = clone.filter("header:first");
                    if (header.length) {
                        element.append(header);
                    }
                });

                // Bring to live the JS part of CardView:
                element.addClass('grid');
                CUI.CardView.init(element);
                cardView = CUI.Widget.fromElement(CUI.CardView, element);

                // Set the default item name, if none is given:
                scope.itemName = scope.itemName || "item";

                scope.$watch("listMode", handleListModeChange);
                scope.$watch("gridSelectionMode", handleGridSelectionModeChange);
                scope.$watchCollection("collection", handleCollectionChange);

                toggleNgSelectionChangeListener(true);
                toggleCuiSelectionChangeListener(true);

                cardView.on('item-moved', handleItemMoved);
            }

            function handleListModeChange(listMode) {
                var newMode = listMode ? CUI.CardView.DISPLAY_LIST : CUI.CardView.DISPLAY_GRID;
                if (cardView.getDisplayMode() != newMode) {
                    cardView.setDisplayMode(newMode);
                    // Switching views clears out the '$scope' data attribute (at least
                    // when going from grid to list view). Repair when necessary:
                    angular.forEach(collectionMap, function (record) {
                        if (record.element.scope() !== record.scope) {
                            record.element.data('$scope', record.scope);
                        }
                    });
                }
            }

            function handleGridSelectionModeChange(selectionMode) {
                cardView.setGridSelectionMode(selectionMode);
                if (selectionMode) {
                    handleNgSelectionChange(scope.selection);
                }
            }

            function handleCollectionChange(newCollection, oldCollection) {

                // We'll be removing all items (see below), and this will trigger
                // selection change events from the CardView. Since we'll be
                // restoring the selection later, we pause the listener:
                toggleCuiSelectionChangeListener(false);

                // Clear out all items (highly inefficient). We could determine
                // what items got added and removed by comparing newItems with
                // oldItems, but that would be rather inefficient too. Plus the
                // CardView API doesn't seem to provide a 'removeItem' method for
                // a selected set of items. So for now I'm sticking with the brute
                // force approach.
                //
                // One thing that makes things a little better, is making sure
                // that all the existing articles don't get thrown out by
                // CardView, by moving them into an offscreen div first:
                var cache = $('<div></div>').append($("article", element));
                cardView.removeAllItems();

                // Prepare an array that will hold the jQuery elements that we'll
                // be creating for each data item (using the set factory/template):
                var $elements = [];
                var $toSelect = [];
                var newCollectionMap = {};

                if (newCollection && newCollection.forEach) {
                    newCollection.forEach(function (item, index, count) {
                        var itemHash = hash(item);
                        var record = collectionMap[itemHash];

                        if (record) {
                            // Delete this record from the current map. The ones
                            // that remain on the map get deleted later on:
                            delete collectionMap[itemHash];
                        }
                        else {
                            record = { item: item };
                        }

                        if (!record.scope) {
                            // Create a scope for the item, and put the data itself in there under
                            // the desired name ('item' by default):
                            record.scope = scope.$new(true);
                            record.scope[scope.itemName] = item;
                        }

                        // Either use the factory to get the item's HTML, or use transclude
                        // to fish out the article template:
                        if (!record.element) {
                            if ($.isFunction(scope.factory)) {
                                record.element = $(scope.factory(item, index, count));
                                $compile(record.element)(record.scope);
                            } else {
                                transclude(record.scope, function (clone) {
                                    record.element = clone.filter("article:first");
                                });
                            }
                        }

                        // Retain the record on the new collection map:
                        newCollectionMap[itemHash] = record;

                        // If the item is in our selection, select it:
                        if (scope.selection && scope.selection.indexOf(item) != -1) {
                            $toSelect.push(record.element);
                        }

                        // Store the element so we can append it to the CardView later:
                        $elements.push(record.element);
                    });
                }

                // Remove the remaining records in the collectionMap, for they
                // are no longer present in the new collection:
                angular.forEach(collectionMap, function (record) {
                    record.scope.$destroy();
                    record.element = null;
                });

                // Retain the new collection map:
                collectionMap = newCollectionMap;

                // If there are new items to add, add them to the CardView in one go:
                if ($elements.length) {
                    cardView.append($elements);
                }

                // Abandon the items left in the cache:
                cache.remove();
                cache = null;

                // Select all items that need selecting:
                while ($toSelect.length) {
                    cardView.select($toSelect.pop(), $toSelect.length > 0);
                }

                // Resume listening to the CardView signaling selection changes:
                toggleCuiSelectionChangeListener(true);
            }

            function handleNgSelectionChange(newItems, oldItems) {
                // Since the handler gets toggled on and off, it may be invoked while nothing
                // changed (the listener always fires on setting it), hence this check:
                if (newItems === oldItems) {
                    return;
                }

                // Ignore any selection change events from CardView while we push
                // the ng selection towards the CardView:
                toggleCuiSelectionChangeListener(false);

                cardView.clearSelection();

                var $toSelect = [];
                newItems.forEach(function (item) {
                    var record = collectionMap[hash(item)];
                    if (record && record.element) {
                        $toSelect.push(record.element);
                    }
                });

                while ($toSelect.length) {
                    cardView.select($toSelect.pop(), $toSelect.length > 0);
                }

                // Resume listening to CardView selection changes:
                toggleCuiSelectionChangeListener(true);
            }

            function handleCuiSelectionChange(event) {
                // If more changes are coming, then wait for the last one to arrive:
                if (event.moreSelectionChanges) {
                    return;
                }

                // This handler fires async outside of Angular. Bring it into scope:
                scope.$evalAsync(function () {

                    var $selection = cardView.getSelection();

                    // Ignore any selection change events from scope.selection, for
                    // we are the origin of those changes:
                    toggleNgSelectionChangeListener(false);

                    var newSelection = [];
                    $selection.each(function () {
                        var elementScope = $(this).scope();
                        var itemData = elementScope[scope.itemName];
                        if (itemData) {
                            newSelection.push(itemData);
                        }
                    });

                    // Apply the new selection:
                    scope.selection = newSelection;

                    // Resume listening to scope.selection changing:
                    toggleNgSelectionChangeListener(true);
                });
            }

            function handleItemMoved(event) {
                if (event.hasMoved) {
                    var oldIndex = getElementDataIndex(event.target);
                    if (oldIndex !== -1) {
                        scope.$evalAsync(function () {
                            scope.collection.splice(oldIndex, 1);

                            var newIndex = getElementDataIndex(event.newPrev);
                            if (newIndex === -1) {
                                newIndex = 0;
                            } else {
                                newIndex += 1;
                            }

                            scope.collection.splice(newIndex, 0, getElementData(event.target));
                        });
                    }
                }
            }

            // Tooling
            //

            function toggleNgSelectionChangeListener(on) {
                if (on && (scope._removeNgSelectionChangeListener === undefined)) {
                    scope._removeNgSelectionChangeListener =
                        scope.$watchCollection("selection", handleNgSelectionChange);
                } else if ($.isFunction(scope._removeNgSelectionChangeListener)) {
                    scope._removeNgSelectionChangeListener();
                    delete scope._removeNgSelectionChangeListener;
                }
            }

            function toggleCuiSelectionChangeListener(on) {
                if (on) {
                    cardView.on("change:selection", handleCuiSelectionChange);
                } else {
                    cardView.off("change:selection", handleCuiSelectionChange);
                }
            }

            function getElementData(element) {
                var elementScope = $(element).scope();
                return elementScope[scope.itemName];
            }

            function getElementDataIndex(element) {
                var result = -1;
                try {
                    var data = getElementData(element);
                    result = scope.collection.indexOf(data);
                }
                catch (error) {
                    result = -1;
                }

                return result;
            }

            // Initialize the directive:
            init();
        }
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiCharacterCount', ["$compile", "$templateCache", function ($compile, $templateCache) {
    var definition = {
        restrict: 'E',
        scope: {
            value: "=",
            maxlength: '=',
            rows: '@',
            cols: '@'
        },
        replace: true,
        template: template,
        compile: compile
    };

    function template(tElement, tAttrs) {
        if (tElement.attr('textarea') !== undefined) {
            return $templateCache.get('cui-character-count/textarea.tpl.html');
        } else {
            return $templateCache.get('cui-character-count/input.tpl.html');
        }
    }

    function compile(tElement, tAttrs, transclude) {

        var id = CUI.util.getNextId(),
            children = tElement.children();

        children.eq(0).attr('id', id);

        return link;
    }

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var widget = new CUI.CharacterCount({
            element: iElement.children().get(1),
            related: iElement.children().get(0),
        });

        scope.$value = scope.value;
        scope.$watch('$value', handleInnerValueChange);
        scope.$watch('value', handleOuterValueChange);
        scope.$watch('maxlength', handleMaxLengthChange);

        function handleOuterValueChange(newValue) {
            if (scope.$value !== newValue) {
                scope.$value = newValue;
                // Cause the widget to re-render its counter:
                widget.set('maxlength', scope.maxlength);
            }
        }

        function handleInnerValueChange(newValue) {
            if (newValue !== scope.value) {
                scope.value = newValue;
            }
        }

        function handleMaxLengthChange(newValue) {
            widget.set('maxlength', newValue);
        }
    }

    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiCollapsible', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-collapsible/template.tpl.html');
    var definition = {
        restrict: 'E',
        template: TEMPLATE,
        replace: true,
        transclude: true,
        scope: {
            title: "=?",
            subtitle: "=?",
            active: "=?"
        },
        link: link
    };

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        // Set active to true when no value is preset:
        scope.active = scope.active === undefined ? true : scope.active;

        // Instantiate the collapsible (accordion is the hybrid class for both accordion and collapsible):
        var widget = new CUI.Accordion({
            element: iElement,
            active: scope.active
        });

        scope.$watch('active', function (value) {
            widget.setActive(value);
        });
    }

    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiCycleButton', ["$compile", function ($compile) {

    var CLASS_ACTIVE = 'is-active';

    var definition = {
        restrict: 'A',
        compile: compile,
        scope: {
            cuiCycleButton: "="
        }
    };

    function compile(tElement, tAttrs, transclude) {
        tElement.addClass('coral-CycleButton');
        return link;
    }

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var $active = -1;

        scope.$watch('cuiCycleButton', handleOuterActiveChange);
        iElement.on('click tap', handleWidgetActiveChange);

        var widget = CUI.CycleButton({ element: iElement});

        function handleOuterActiveChange(outerActive) {

            if (outerActive === undefined) {
                outerActive = -1;
            }

            var children = iElement.children();

            // When there are no items to select, or when the index is
            // out of bounds, set the selection to -1.
            if (!children.length || outerActive >= children.length) {
                outerActive = -1;
            }

            // When no active item is set, and items are available, then
            // select the first item:
            if (children.length && outerActive < 0) {
                outerActive = 0;
            }

            updateInnerActive(outerActive);
        }

        function handleWidgetActiveChange(event) {
            scope.$apply(function () {
                if (event._cycleButton) {
                    var index = iElement.children().index(event.target);
                    $active = index;
                    updateOuterActive();
                }
            });
        }

        function updateOuterActive() {
            if (scope.cuiCycleButton !== $active) {
                scope.cuiCycleButton = $active;
            }
        }

        function updateInnerActive(outerActive) {
            if ($active !== outerActive) {
                var index = outerActive;
                var children = iElement.children();
                children.removeClass(CLASS_ACTIVE);
                if (index >= 0) {
                    children.eq(index).addClass(CLASS_ACTIVE);
                }
                $active = outerActive;
            }
        }
    }


    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiDatepicker', ["$compile", "$templateCache", function ($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {
            value: '=',
            hasError: '=?',
            disabled: '=?',
            options: '&?'
        },
        template: $templateCache.get('cui-datepicker/template.tpl.html'),
        replace: true,
        link: function (scope, iElement, iAttrs, controller, transcludeFn) {

            var widget = setupWidget();
            var input,
                hiddenInput,
                ignoreNgValueChange;

            function setupWidget() {

                input = iElement.find('input').eq(0);
                if (scope.value) {
                    input.attr('value', scope.value);
                }
                input.on('change', widgetValueChangeHandler);

                var options = scope.options();
                if (!$.isPlainObject(options)) {
                    options = {};
                }
                options.hasError = scope.hasError;
                options.disabled = scope.disabled;

                var icon = iElement.find('button > i').eq(0);
                if (options.type === "time") {
                    icon.addClass("coral-Icon--clock");
                } else {
                    icon.addClass("coral-Icon--calendar");
                }

                // Construct the datepicker the jQuery way:
                iElement.datepicker(removeUndefinedFields(options));
                hiddenInput = iElement.find('input[type=hidden]').eq(0);

                scope.$watch('value', ngValueChangeHandler);
                scope.$watch('hasError', ngHasErrorChangeHandler);
                scope.$watch('disabled', ngDisabledChangeHandler);

                return iElement.data('datepicker');
            }

            function ngValueChangeHandler(newValue, oldValue) {
                if (!ignoreNgValueChange && widget && (newValue !== oldValue)) {
                    input.val(newValue);
                    widget._readInputVal();
                }
            }

            function ngHasErrorChangeHandler(newValue, oldValue) {
                if (newValue !== oldValue) {
                    widget.set('hasError', newValue);
                    // Update state isn't triggered from 'set'. Hacking
                    // into the internals:
                    widget._updateState();
                }
            }

            function ngDisabledChangeHandler(newValue, oldValue) {
                if (newValue !== oldValue) {
                    widget.set('disabled', newValue);
                    // Update state isn't triggered from 'set'. Hacking
                    // into the internals:
                    widget._updateState();
                }
            }

            function widgetValueChangeHandler(event) {
                scope.$apply(function () {
                    ignoreNgValueChange = true;
                    scope.value = hiddenInput.val();
                    ignoreNgValueChange = false;
                });
            }

        }
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiModal', ["$compile", "$templateCache", function ($compile, $templateCache) {
    var definition = {
        restrict: 'E',
        template: $templateCache.get('cui-modal/template.tpl.html'),
        replace: true,
        transclude: true,
        compile: compile,
        scope: {
            type: "=?",
            buttons: "=?",
            remote: "@?",
            backdrop: "=?",
            visible: "=?"
        }
    };

    function compile(tElement, tAttrs, transclude) {
        return link;
    }

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var widget,
            modal,
            header,
            content,
            template;

        transcludeFn(scope.$parent, function (clone) {
            modal = iElement.children('div.coral-Modal').eq(0);

            header = clone.filter('[header=""]').removeAttr('header');
            content = clone.filter('[content=""]').removeAttr('content');
            template = clone.filter('[template=""]').removeAttr('template');

            if (template.length) {
                modal.replaceWith(template.eq(0));
                modal = iElement.children('div.coral-Modal').eq(0);
            }
        });

        scope.visible = scope.visible === undefined ?
            false :
            scope.visible;

        scope.$watch('visible', handleVisibleChange);
        scope.$on('$destroy', handleScopeDestroy);

        var options = removeUndefinedFields({
            element: modal,
            type: scope.type,
            buttons: scope.buttons,
            remote: scope.remote ? scope.remote : undefined,
            backdrop: scope.backdrop,
            visible: scope.visible,
            header: header,
            content: content
        });

        function instantiateWidget() {
            widget = CUI.Modal(options);
            widget.on('hide', handleWidgetHide);
            widget.on('show', handleWidgetShow);
        }

        function handleVisibleChange(newValue) {
            // Just-in-time instantiation of the widget (when
            // it first becomes visible):
            if (!widget && newValue) {
                instantiateWidget();
            }

            if (widget) {
                if (newValue) {
                    if (!widget.get('visible')) {
                        widget.show();
                    }
                } else {
                    if (widget.get('visible')) {
                        widget.hide();
                    }
                }
            }
        }

        function handleWidgetHide(event) {
            if (scope.visible && event.target === event.currentTarget) {
                scope.$apply(function () {
                    scope.visible = false;
                });
            }
        }

        function handleWidgetShow(event) {
            if (!scope.visible && event.target === event.currentTarget) {
                scope.$apply(function () {
                    scope.visible = true;
                });
            }
        }

        function handleScopeDestroy() {
            // Remove the re-parented modal from the page:
            modal.remove();
        }

    }

    return definition;
}]);


/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiNumberInput', ["$compile", "$templateCache", function ($compile, $templateCache) {
    return {
        restrict: 'E',
        template: $templateCache.get('cui-number-input/template.tpl.html'),
        replace: true,
        scope: {
            value: '=?',
            hasError: '=?',
            disabled: '=?',
            min: '=?',
            max: '=?',
            step: '=?'
        },
        link: function (scope, iElement, iAttrs, controller, transcludeFn) {

            var widget,
                input,
                options = removeUndefinedFields({
                    hasError: scope.hasError,
                    disabled: scope.disabled,
                    min: scope.min,
                    max: scope.max,
                    step: scope.step
                });


            iElement.numberInput();
            widget = iElement.data('numberInput');

            scope.$watch('value', ngValueChangeHandler);
            scope.$watch('hasError', ngHasErrorChangeHandler);
            scope.$watch('disabled', ngDisabledChangeHandler);
            scope.$watch('min', ngMinChangeHandler);
            scope.$watch('max', ngMaxChangeHandler);
            scope.$watch('step', ngStepChangeHandler);

            input = iElement.find('input').eq(0);
            input.change(widgetValueChangeHandler);

            function ngValueChangeHandler(newValue, oldValue) {
                widget.setValue(newValue);
                scope.value = input.val();
            }

            function ngHasErrorChangeHandler(newValue, oldValue) {
                widget.set('hasError', newValue);
            }

            function ngDisabledChangeHandler(newValue, oldValue) {
                widget.set('disabled', newValue);
            }

            function ngMinChangeHandler(newValue, oldValue) {
                widget.setMin(newValue);
            }

            function ngMaxChangeHandler(newValue, oldValue) {
                widget.setMax(newValue);
            }

            function ngStepChangeHandler(newValue, oldValue) {
                widget.setStep(newValue);
            }

            function widgetValueChangeHandler(event) {
                scope.$evalAsync(function () {
                    scope.value = input.val();
                });
            }
        }
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiPopover', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-popover/popover-container.tpl.html');
    var definition = {
        restrict: 'E',
        template: TEMPLATE,
        replace: true,
        transclude: true,
        controller: ['$scope', '$element', controller],
        link: link,
        scope: {
            visible: "=?",
            pointAt: "=?",
            pointFrom: "=?",
            alignFrom: "=?"
        }
    };

    function compile(tElement, tAttrs, transclude) {
        return link;
    }

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        scope.$watch("visible", function () {
            if (!popover) return;
            var visible = popover.get('visible');
            if (visible && !scope.visible) {
                popover.hide();
            } else if (!visible && scope.visible) {
                popover.show();
            }
        });

        [   'pointAt',
            'pointFrom',
            'alignFrom'
        ].map(function (property) {
                scope.$watch(property, function (newValue) {
                    if (popover && newValue !== undefined) {
                        popover.set(property, newValue);
                    }
                });
            });

        var options = removeUndefinedFields({
            element: iElement,
            pointAt: scope.pointAt,
            pointFrom: scope.pointFrom,
            alignFrom: scope.alignFrom,
            within: iAttrs.within,
            preventAutoHide: iAttrs.preventAutoHide
        });

        var popover = new CUI.Popover(options);

        iElement.on('hide', function () {
            if (scope.visible) {
                scope.$apply(function () {
                    scope.visible = false;
                });
            }
        });
    }

    function controller($scope, $element) {

        this.update = function () {
            $element.trigger('change:pointAt');
        };
    }

    return definition;
}]);

ngCoral.directive('cuiPopoverContent', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-popover/popover-content.tpl.html');
    var definition = {
        restrict: 'E',
        require: '^cuiPopover',
        template: TEMPLATE,
        replace: true,
        transclude: true,
        link: link
    };

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        controller.update();

        scope.$on('$destroy', function () {
            controller.update();
        });
    }

    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiSelect', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-select/template.tpl.html'),
        definition = {
            restrict: 'E',
            scope: {
                options: '@',
                selection: '=?',
                label: '=?',
                placeholder: '@',
                multiple: '@',
                change: '&'
            },
            template: TEMPLATE,
            replace: true,
            link: link
        };

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var selection;

        scope.$options = [];

        scope.composeLabel = function (option) {
            var label = scope.label;
            return 'option' + (label ? '.' + label : '');
        };

        function isSelectedElement(element) {
            var option = element.scope().option;
            var selection = scope.selection;
            if (selection) {
                if (scope.multiple) {
                    return selection.indexOf(option) !== -1;
                } else {
                    return option === selection;
                }
            } else {
                // No selection, so value cannot be in it:
                return false;
            }
        }

        var widget,
            taglist,
            pendingReset,
            unwatchOptions,
            unwatchSelection;

        function resetWidget(force) {
            if (!pendingReset) {
                pendingReset = true;
                scope.$evalAsync(function () {
                    // Only update the widget when the outward facing selection
                    // changed, or when force is set:
                    if (!angular.equals(selection, scope.selection) || force === true) {
                        if (widget !== undefined) {
                            unsetWidget();
                        }
                        setWidget();
                    }
                    pendingReset = false;
                });
            }
        }

        function setWidget() {
            $('select option', iElement).each(function () {
                var $el = $(this);
                if (isSelectedElement($el)) {
                    $el.attr('selected', 'selected');
                } else {
                    $el.removeAttr('selected');
                }
            });

            selection = scope.selection;

            CUI.Select.init(iElement);
            widget = iElement.data('select');
            widget.on('selected', function (event) {
                scope.$apply(function () {
                    if (scope.multiple) {
                        selection = event.selected.map(getOptionByHashKey);
                    } else {
                        selection = getOptionByHashKey(event.selected);
                    }
                    scope.selection = selection;
                });

                // It's important we call the change handler in a different scope.apply
                // after the one above. It's likely when the change handler is called that the consumer
                // will immediately be accessing the selection object. By calling the change handler from
                // a separate scope.$apply we ensure that the selection object has been propagated to the
                // parent scope by the time the consumer accesses it.
                scope.$apply(scope.change);
            });

            // Hacking into the select internals to get informed on
            // the user removing a selected item when multiselect
            // is enabled:
            if (scope.multiple) {
                taglist = $('.coral-TagList', iElement);
                taglist.on("itemremoved", function (event) {
                    // Use async to give the select widget a chance to process
                    // the event first:
                    scope.$evalAsync(function () {
                        scope.selection = selection = widget.getValue().map(getOptionByHashKey);
                    });
                });
            }
        }

        function unsetWidget() {
            // Remove listeners:
            widget.off();
            // Remove the widget instance:
            iElement.removeData('select');
            // Remove the select list. and the tag list: This is hacking way
            // into the internals :(
            $('.coral-SelectList', iElement).remove();
            if (taglist) {
                taglist.remove();
                taglist = undefined;
            }
        }

        function getOptionByHashKey(hashKey) {
            var options = scope.$options;
            var result;
            if (options && options.length) {
                options.every(function (option) {
                    var key = option.$$hashKey;
                    if (key === undefined && option.toString() === hashKey) {
                        result = option;
                        return false;
                    } else if (key !== null && key !== undefined && key.toString() === hashKey.toString()) {
                        result = option;
                        return false;
                    }
                    return true;
                });
            }
            return result;
        }

        function watchOptions() {
            unwatchOptions = scope.$parent.$watchCollection(
                scope.options,
                function (newValue) {
                    scope.$options = newValue;
                    resetWidget(true /* force reset, even if the selection didn't change */);
                });
        }

        function watchSelection() {
            unwatchSelection = scope.$watchCollection('selection', resetWidget);
        }

        if (scope.multiple) {
            $("select", iElement).attr('multiple', true);
        }

        watchOptions();
        watchSelection();
    }

    return definition;
}]);


/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiSelectList', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-select-list/template.tpl.html'),
        ITEM_TEMPLATE = $templateCache.get('cui-select-list/item.tpl.html'),
        definition = {
            restrict: 'E',
            template: TEMPLATE,
            replace: true,
            transclude: true,
            link: {
                pre: preLink,
                post: postLink
            },
            scope: {
                items: "=?",
                label: "=?",
                selected: "=?",

                visible: "=?",
                type: "=?",
                multiple: "=?",
                relatedElement: "=?",
                autofocus: "=?",
                autohide: "=?",
                dataurl: "=?",
                dataurlformat: "=?",
                dataadditional: "=?"
            }
        }, tItem;

    function preLink(scope, iElement, iAttrs, controller, transcludeFn) {
        transcludeFn(function (clone) {
            // See if the user specified an item template. If so,
            // then replace the default one with the custom one.
            var template = clone.filter('li');
            if (template.length) {
                ITEM_TEMPLATE = template.get(0).outerHTML;
            }
            tItem = $compile(ITEM_TEMPLATE);
        });
    }

    function postLink(scope, iElement, iAttrs, controller, transcludeFn) {
        var widget,
            scopes = [], freeScopes = [],
            options = removeUndefinedFields({
                element: iElement,
                type: scope.type,
                multiple: scope.multiple,
                relatedElement: scope.relatedElement,
                autofocus: scope.autofocus,
                autohide: scope.autohide,
                dataurl: scope.dataurl,
                dataurlformat: scope.dataurlformat,
                dataadditional: scope.dataadditional
            });
        scope.$watchCollection('items', handleItemsChange);

        iElement.addClass('coral-SelectList');
        widget = new CUI.SelectList(options);

        widget.on('selected', handleWidgetSelectedEvent);

        scope.$watch('visible', handleVisibleChange);

        function handleVisibleChange(newValue) {
            var widgetVisible = widget.get('visible');
            if (newValue && !widgetVisible) {
                widget.show();
            } else if (!newValue && widgetVisible) {
                widget.hide();
            }
        }

        function handleItemsChange(newItems) {
            // All existing items get removed, and then all new
            // ones are added. This is highly wasteful, however,
            // for a select, we may reasonably expect that:
            // a) this list is not too long,
            // b) won't change a lot.

            var children = iElement.children();
            iElement.children().off();
            iElement.children().remove();
            if (newItems) {
                freeScopes = scopes;
                scopes = [];
                newItems.forEach(addItem);
                freeScopes.forEach(function (scope) {
                    scope.$destroy();
                });
                freeScopes = [];
            }
        }

        function handleWidgetSelectedEvent(event, data) {
            scope.$apply(function () {
                scope.selected = $(event.target).scope().item;
            });
        }

        function addItem(item) {

            var itemScope;
            if (freeScopes.length) {
                itemScope = freeScopes.pop();
            } else {
                itemScope = scope.$new(true);
            }
            scopes.push(itemScope);

            angular.extend(itemScope, {
                item: item,
                $label: item && item.label ? item.label : item,
                $value: item && item.value !== undefined ? item.value : item
            });

            var element = tItem(itemScope, function (clone) {
                iElement.append(clone);
            });

        }

    }

    return definition;
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiShell', ["$compile", "$parse", function ($compile, $parse) {

    var definition = {
        restrict: 'A',
        replace: true,
        link: link,
        controller: controller
    };

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var widget,
            options = controller.options,
            main = controller.main,
            outerRail = controller.outerRail,
            blackBar = controller.blackBar,
            innerRail = controller.innerRail,
            actionBar = controller.actionBar,
            footer = controller.footer;

        function setupShell() {

            var _options = {
                element: iElement,

                generateBreadcrumbBar: true,

                generatePage: true,
                pageOptions: {
                    generateOuterRail: outerRail !== undefined,
                    generateBlackBar: blackBar !== undefined,
                    generateInnerRail: innerRail !== undefined,
                    generateActionBar: actionBar !== undefined,
                    generateFooter: footer !== undefined
                }
            };

            if (blackBar) {
                _options.pageOptions.blackBarOptions = blackBar.options;
            }

            $.extend(_options, options);

            widget = new CUI.Shell(_options);

            CUI.Endor.registry.resolve(CUI.Page, onPageResolved);
        }

        function onPageResolved(page) {

            // Make sure that the breadcrumbBar and the page are adjacent. If they
            // aren't, then the bar doesn't hide (for there's a '+' CSS selector
            // involved:
            var breadcrumbBar = CUI.Endor.registry.get(CUI.BreadcrumbBar);
            if (breadcrumbBar) {
                page.$element.insertAfter(breadcrumbBar.$element);
            }

            if (main) {
                main.content.appendTo(page.getContent());
            }
        }

        setupShell();
    }

    function controller($scope, $element, $attrs, $transclude) {

        this.attributesToWidgetOptions = function (attributes, knownOptions, scope) {
            var result = {};
            angular.forEach(attributes, function (value, key) {
                var option = knownOptions[key];
                if (option) {
                    option.expr = $parse(value);
                    result[key] = option.expr(scope);
                }
            }, this);
            return result;
        };

        this.bindWidgetOptions = function (options, knownOptions, scope, widget) {
            angular.forEach(options, function (value, key) {
                var option = knownOptions[key];
                if ($.isFunction(option.set)) {
                    if (!option.expr.constant) {
                        // Watch the expression:
                        scope.$watch(option.expr, function (value) {
                            option.set(widget, value);
                        });
                    }
                }
            }, this);
        };
    }

    return definition;
}]);

/**
 * Used to express cui-shell options. Expected to be placed as a
 * child element of a cui-shell attributed body tag. The tag is
 * removed when the element gets linked.
 */
ngCoral.directive('cuiShellOptions', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {
        brandTitle: {},
        brandIcon: {},
        brandHref: {},

        generateBreadcrumbBar: {},
        breadcrumbBarOptions: {},

        generatePage: {},
        pageOptions: {}
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope);
        controller.options = options;
        iElement.remove();
    }

    return definition;
});

/**
 * Used to identify the main shell page's content. Expected to be placed as a
 * child element of a cui-shell attributed body tag.
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellMain', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, {}, scope);

        controller.main = {
            content: iElement.contents(),
            options: options,
            resolvedHandler: widgetResolvedHandler

        };
        iElement.remove();

        function widgetResolvedHandler(widget) {
            controller.bindWidgetOptions(options, {}, scope, widget);
        }
    }

    return definition;
});

/**
 * Used to identify the shell's right hand side black bar contents, as well
 * as its options (set as attributes on the directive).
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellBlackBar', ["$parse", function ($parse) {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {
        title: {
            set: function (widget, value) {
                widget.setTitle(value);
            }
        },
        noNavToggle: {},
        noBackButton: {},
        noTitle: {}
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope),
            content = iElement.contents();

        controller.blackBar = {
            content: content,
            options: options
        };

        iElement.remove();

        CUI.Endor.registry.resolve(CUI.BlackBar, widgetResolvedHandler);

        function widgetResolvedHandler(widget) {
            controller.bindWidgetOptions(options, OPTIONS, scope, widget);
            widget.addItem(content);
        }
    }

    return definition;
}]);

/**
 * Used to identify the shell page's outer rail content. Expected to be placed
 * as a child element of a cui-shell attributed body tag.
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellOuterRail', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {
        generateBrand: {},
        brandOptions: {}
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope),
            content = iElement.contents();

        controller.outerRail = {
            content: content,
            options: options
        };

        iElement.remove();

        CUI.Endor.registry.resolve(CUI.OuterRail, widgetResolvedHandler);

        function widgetResolvedHandler(widget) {
            if (!widget) return; // no-op;
            controller.bindWidgetOptions(options, OPTIONS, scope, widget);
            content.appendTo(widget.$element);
        }
    }

    return definition;
});

/**
 * Used to identify the shell page's inner rail content. Expected to be placed
 * as a child element of a cui-shell attributed body tag.
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellInnerRail', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {
        activePanelId: {
            set: function (widget, value) {
                widget.setActivePanelId(value);
            }
        }
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope),
            content = iElement.contents();

        controller.innerRail = {
            content: content,
            options: options
        };

        iElement.remove();

        CUI.Endor.registry.resolve(CUI.InnerRail, widgetResolvedHandler);

        function widgetResolvedHandler(widget) {
            if (!widget) return; // no-op;
            controller.bindWidgetOptions(options, OPTIONS, scope, widget);
            widget.addPanel(content);
        }
    }

    return definition;
});

/**
 * Used to identify the shell page's action bar. Expected to be placed
 * as a child element of a cui-shell attributed body tag.
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellActionBar', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {};

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope),
            content = iElement.contents();

        controller.actionBar = {
            content: content,
            options: options
        };

        iElement.remove();

        CUI.Endor.registry.resolve(CUI.ActionBar, widgetResolvedHandler);

        function widgetResolvedHandler(widget) {
            if (!widget) return; // no-op;
            content.each(function () {
                var $this = $(this);
                var options = {
                    right: $this.hasClass('cui-right'),
                    text: $this.hasClass('cui-is-text')
                };
                widget.addItem($this, options);
            });
        }
    }

    return definition;
});

/**
 * Used to identify the shell page's footer. Expected to be placed
 * as a child element of a cui-shell attributed body tag.
 *
 * When the element is linked, its contents are moved into the correct shell
 * location, and the wrapper element is discarded.
 */
ngCoral.directive('cuiShellFooter', function () {
    var definition = {
        restrict: 'E',
        require: '^cuiShell',
        replace: false,
        link: link
    };

    var OPTIONS = {
        copyright: {
            set: function (widget, value) {
                widget.setCopyright(value);
            }
        }
    };

    function link(scope, iElement, iAttrs, controller) {

        var options = controller.attributesToWidgetOptions(iAttrs, OPTIONS, scope),
            content = iElement.contents();

        controller.footer = {
            content: content,
            options: options
        };

        iElement.remove();

        CUI.Endor.registry.resolve(CUI.Footer, widgetResolvedHandler);

        function widgetResolvedHandler(widget) {
            if (!widget) return; // no-op;
            controller.bindWidgetOptions(options, OPTIONS, scope, widget);
            widget.addItem(content);
        }
    }

    return definition;
});


/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiSlider', ["$compile", "$templateCache", function ($compile, $templateCache) {
    return {
        restrict: 'E',
        template: $templateCache.get('cui-slider/template.tpl.html'),
        replace: true,
        scope: {
            legend: '=?',
            range: '@?',

            value: '=',
            value2: '=?',

            min: '@?',
            max: '@?',
            step: '@?',
            ticks: '@?',
            filled: '@?',
            orientation: '@?',
            tooltips: '@?',
            slide: '@?',

            label: "&?"
        },
        link: function (scope, iElement, iAttrs, controller, transcludeFn) {

            var labeled = iAttrs.label !== undefined,
                range = iAttrs.value2 !== undefined,
                inputs = iElement.find('input'),
                input1 = inputs.eq(0),
                input2 = inputs.eq(1),
                widget,
                options;

            input1.change(widgetInputChangeHandler);
            if (range) {
                input2.change(widgetInputChangeHandler);
            } else {
                // When range is not set, then remove the second slider input from
                // the template clone:
                iElement.find('label').eq(1).remove();
                input2 = undefined;
            }

            options = removeUndefinedFields({
                min: stringToNumber(scope.min),
                max: stringToNumber(scope.max),
                step: stringToNumber(scope.step),
                ticks: stringToBool(scope.ticks),
                filled: stringToBool(scope.filled),
                orientation: scope.orientation,
                tooltips: stringToBool(scope.tooltips),
                slide: stringToBool(scope.slide)
            });

            // If we're dealing with a labeled slider, then add the
            // labels to the template:
            if (labeled) {
                iElement.addClass("coral-Slider--labeled");
                var labels = $('<ul></ul>').addClass('coral-Slider-tickLabels');
                var step = options.step || 1;
                for (var i = options.min + step; i <= options.max - step; i += step) {
                    var labelText = scope.label({value: i});
                    labels.append($('<li></li>').text(labelText));
                }
                iElement.append(labels);
            }

            // Instantiate the widget:
            if (labeled) {
                iElement.labeledSlider(options);
                widget = iElement.data('labeledSlider');
            } else {
                iElement.slider(options);
                widget = iElement.data('slider');
            }

            scope.$watch('value', ngValueChangeHandler);
            if (range) {
                scope.$watch('value2', ngValue2ChangeHandler);
            }

            function widgetInputChangeHandler(event) {
                scope.$apply(function () {
                    scope.value = input1.val();
                    if (range) {
                        scope.value2 = input2.val();
                    }
                });
            }

            function ngValueChangeHandler(newValue, oldValue) {
                widget.setValue(newValue);
                scope.value = input1.val();
            }

            function ngValue2ChangeHandler(newValue, oldValue) {
                widget.setValue(newValue, 1);
                scope.value2 = input2.val();
            }
        }
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiTabs', ["$compile", "$templateCache", function ($compile, $templateCache) {

    return {
        restrict: 'E',
        template: $templateCache.get('cui-tabs/template.tpl.html'),
        transclude: true,
        replace: true,
        scope: {
            type: '=?',
            active: '=?',
            tabs: '=?'
        },
        link: function (scope, iElement, iAttrs, controller, transcludeFn) {

            scope.type = scope.type === undefined ? "" : scope.type;

            var tabs = [],
                widget,
                options = removeUndefinedFields({
                    type: scope.type,
                    active: scope.active
                });

            scope.$watchCollection('tabs', ngTabsChangeHandler);

            iElement.tabs(options);
            iElement.on('change:active', widgetActiveChangeHandler);
            widget = iElement.data('tabs');

            scope.$watch('type', ngTypeChangeHandler);
            scope.$watch('active', ngActiveChangeHandler);

            function ngTabsChangeHandler(newTabs) {

                newTabs = newTabs || [];
                newTabs.forEach(function (tab, index) {
                    var oldIndex = tabs.indexOf(tab);
                    if (oldIndex === -1) {
                        constructTab(tab, index);
                        tab.id = widget.addItem(tab.options);
                        var widgetTab = getWidgetTabById(tab.id);
                        widgetTab.on('focus', tab, function () {
                            scope.$evalAsync(function () {
                                scope.active = tab;
                            });
                        });
                    } else {
                        tabs.splice(oldIndex, 1);
                    }
                });

                tabs.forEach(function (tab) {
                    var widgetTab = getWidgetTabById(tab.id);
                    widgetTab.off('focus');
                    widget.removeItem(tab.id);
                });

                tabs = newTabs.concat();

                // Hacking into the internals to get notified on the active tab
                // changing:
                var widgetTabs = widget._getTabs();
            }

            function ngTypeChangeHandler(newValue, oldValue) {
                widget.set('type', newValue);
            }

            function ngActiveChangeHandler(newValue, oldValue) {
                var index = tabs.indexOf(newValue);
                widget.set('active', index);
            }

            function constructTab(tab, index) {
                var options = tab.options || {};
                var data = tab.data;
                if (!options.panelURL && !options.panelContent) {
                    var tabScope = scope.$new(true);
                    tabScope.data = data;
                    tabScope.tab = tab;
                    transcludeFn(tabScope, function (clone) {
                        options.tabContent = clone.filter('.tab-content').contents();
                        options.panelContent = clone.filter('.panel-content').contents();
                    });
                }
            }

            function getWidgetTabById(id) {
                return iElement
                    .children()
                    .eq(0)
                    .find('a[aria-controls="' + id + '"]');
            }

            function widgetActiveChangeHandler(event) {
                var index = index;
                if (index !== -1 && index < tabs.length) {
                    scope.$evalAsync(function () {
                        scope.active = tabs[index];
                    });
                }
            }
        }
    };
}]);

/**
 * Directive cui-tag-list wraps CUI.TagList
 *
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiTagList', ["$compile", "$templateCache", function ($compile, $templateCache) {
    return {
        restrict: 'E',
        scope: {
            tags: '=?',
            label: '@?'
        },
        template: $templateCache.get('cui-tag-list/template.tpl.html'),
        replace: true,
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            /**
             * Child directives API:
             */

            $scope.handleChildAddition = function (element) {
                resetWidget();
            };

            $scope.handleChildRemoval = function (element) {
                resetWidget();
            };

            /**
             * Internals
             */

            var widget,
                pendingReset;

            function resetWidget() {
                if (!pendingReset) {
                    pendingReset = true;
                    $scope.$evalAsync(function () {
                        if (widget !== undefined) {
                            unsetWidget();
                        }
                        setWidget();
                        pendingReset = false;
                    });
                }
            }

            function setWidget() {

                CUI.TagList.init($element);
                widget = $element.data('tagList');
                widget.on('itemremoved', function (event, data) {
                    $scope.$apply(function () {
                        var index = data.value;
                        $scope.tags.splice(index, 1);
                    });
                });
            }

            function unsetWidget() {
                // Remove listeners:
                widget.off();
                // Remove the widget instance:
                $element.removeData('tagList');
            }
        }]
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiTooltip', ["$compile", function ($compile) {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            cuiTooltip: "&",
            cuiTooltipDisabled: "&"
        },
        link: function (scope, iElement, iAttrs, controller, transcludeFn) {

            var widget, options, content, disabled;

            iAttrs.$observe('cuiTooltip', attributeChangeHandler);
            iAttrs.$observe('cuiTooltipDisabled', attributeChangeHandler);

            iElement.on('mouseover', elementMouseOverHandler);

            function attributeChangeHandler(value) {
                parseAttributes();
                update();
            }

            function parseAttributes() {
                var attribute = scope.cuiTooltip();
                if ($.isPlainObject(attribute)) {
                    options = attribute;
                    content = attribute.content;
                } else {
                    options = undefined;
                    content = attribute;
                }

                disabled = scope.cuiTooltipDisabled() === true;
            }

            function update() {
                if (widget) {
                    widget.set('content', content);
                }
            }

            function elementMouseOverHandler(event) {
                parseAttributes();
                if (!disabled) {
                    if (!iElement.data('tooltip')) {
                        var _options = removeUndefinedFields({
                            target: iElement,
                            content: content,
                            type: options ? options.type : undefined,
                            arrow: options ? options.arrow : undefined,
                            distance: options ? options.distance : undefined,
                            delay: options ? options.delay : undefined,
                            interactive: true,
                            autoDestroy: true
                        });

                        widget = new CUI.Tooltip(_options);

                        // Have the tooltip show (respecting the set delay):
                        iElement.trigger('mouseover.cui-tooltip');

                    } else {
                        update();
                    }
                }
            }
        }
    };
}]);

/**
 * Please refer to the directive sample to read more about
 * how to use the directive, and its limitations.
 *
 */
ngCoral.directive('cuiWizard', ["$compile", "$templateCache", function ($compile, $templateCache) {

    var TEMPLATE = $templateCache.get('cui-wizard/template.tpl.html'),
        definition = {
            restrict: 'E',
            link: link,
            template: TEMPLATE,
            replace: true,
            transclude: true,
            scope: {
                step: '=?'
            }
        };

    function link(scope, iElement, iAttrs, controller, transcludeFn) {

        var widget;

        function init() {
            widget = new CUI.FlexWizard({ element: iElement});
            widget.on('flexwizard-stepchange', handleFlexWizardStepChange);
        }

        function handleFlexWizardStepChange(event, data) {
            scope.$apply(function () {
                var element = data[0];
                scope.step = $(data[0]).index() - 1;
            });
        }

        init();
    }

    return definition;
}]);


/**
 * Directive init helps with the initialisation of Coral widgets.
 *
 * It will pick up on elements carrying a 'data-init' attribute, which is
 * something most Coral components that have a JavaScript widget do, in order
 * to have it initialised properly. However, the Coral framework only monitors
 * for this tag right after page load, hence dynamically inserted elements
 * may not be initialised properly. This directive addresses this issue.
 *
 */
ngCoral.directive('init', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var $element = $(element);
            var selector = attrs.init;
            if (selector === 'collapsible') {
                // CUI.Accordion should also be registering as 'collapsible', for
                // it is the same widget that powers both 'Accordion' and 'Collapsible'.
                //
                // Work-around for now:
                CUI.Accordion.init($element);
            }
            else if (selector) {
                CUI.Widget.registry.init(selector, $element);
            }
        }
    };
});

}.call(this));
//# sourceMappingURL=ngCoral.js.map