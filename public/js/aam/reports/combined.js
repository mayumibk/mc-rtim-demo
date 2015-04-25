var _globals = {};
var userRoles = ["EDIT_DERIVED_SIGNALS", "DELETE_MODELS", "MAP_ALL_TRAITS_TO_MODELS", "VIEW_MODELS", "VIEW_DCS_REGIONS", "DELETE_ALL_DESTINATIONS", "VIEW_SELF", "DELETE_SEGMENTS", "EDIT_SEGMENTS", "DELETE_DATASOURCES", "DELETE_ALL_SEGMENTS", "VIEW_SEGMENTS", "CREATE_ALL_ALGO_TRAITS", "EDIT_ALL_TRAITS", "EDIT_DATASOURCES", "VIEW_DESTINATIONS", "EDIT_MODELS", "PTRUSER", "MAP_ALL_TO_SEGMENTS", "VIEW_TRAITS", "VIEW_DATASOURCES", "VIEW_ALL_TRAITS", "EDIT_TRAITS", "EDIT_ALL_DESTINATIONS", "DELETE_ALL_TRAITS", "DELETE_TRAITS", "VIEW_DERIVED_SIGNALS", "VIEW_ALL_DESTINATIONS", "CREATE_DERIVED_SIGNALS", "PTRREPORTS", "CREATE_DATASOURCES", "VIEW_DESTINATION_CONFIGS", "VIEW_ALL_SEGMENTS", "MAP_ALL_SEGMENTS_TO_MODELS", "CREATE_TRAITS", "CREATE_MODELS", "EDIT_ALL_SEGMENTS", "MAP_ALL_TO_DESTINATIONS", "CREATE_ALL_SEGMENTS", "CREATE_ALL_TRAITS", "VIEW_TAGS", "DELETE_DERIVED_SIGNALS", "DELETE_DESTINATIONS", "CREATE_SEGMENTS", "EDIT_DESTINATIONS", "CREATE_DESTINATIONS"];
_globals.clone_standard = '/css/aam/images/Clone_Standard.png';
_globals.play_standard = '/css/aam/images/Play_Standard.png';
_globals.trend_graph_api = '/portal/Analytics/TraitTrendReport.ddx';
_globals.segment_graph_api = '/portal/Analytics/SegmentTrendReport.ddx';
_globals.trait_list_page = '/portal/Segments/ListTraits.ddx';
_globals.trait_create_page = '/portal/Segments/ManageTrait.ddx?action=add';
_globals.segment_view_page = '/portal/Segments/SegmentBuilder.ddx';
_globals.segment_create_page_with_traits = _globals.segment_view_page + "#new/traits/";
_globals.model_page = '/portal/Segments/Models.ddx';
_globals.model_create_page_with_trait = _globals.model_page + "#new/trait/";
_globals.pid = 1799;
_globals.permissions = {
    enabled: !!userRoles.length,
    permissions: userRoles
};
_globals.max_reach_audience_size = parseInt(4444425000000, 10);
if (typeof ADOBE == "undefined") {
    var ADOBE = {};
}
if (typeof ADOBE.AM == "undefined") {
    ADOBE.AM = {};
}
ADOBE.AM.UTILS = {
    HANDLE_AJAX: {
        active: false,
        status_codes: {},
        init: function(args) {
            if (args && args.status_codes) {
                $.extend(this.status_codes, args.status_codes);
            }
            this.activateAjaxHandler();
        },
        activateAjaxHandler: function() {
            var that = this;
            $(document).ajaxError(function(e, xhr, options) {
                if (!xhr) {
                    return false;
                }
                if (!that.status_codes[xhr.status]) {
                    return false;
                }
                that.status_codes[xhr.status].apply(this, arguments);
            });
        }
    },
    ERRORS: {
        TYPES: {
            ValidationError: function(param, message) {
                this.param = param;
                this.message = message;
            },
            ArgError: function(param, message) {
                this.param = param;
                this.message = message;
            },
            FatalDisplayError: function(param, message) {
                this.param = param;
                this.message = message;
            }
        },
        MESSAGES: {}
    },
    LOGGER: {
        logs: [],
        log: function(msg, type) {
            var timestamp = (new Date).getTime(),
                message = "";
            if (typeof type == "undefined") {
                type = "LOG:";
            }
            message = timestamp + ' - ' + type + ": " + msg;
            this.logs.push(message);
        },
        flush: function() {
            this.logs = [];
        },
        display: function() {
            var debug = true;
            if (debug && window.console && window.console.log) {
                for (var i = 0; i < this.logs.length; i++) {
                    window.console.log(this.logs[i]);
                }
            } else if (debug && window.alert) {
                window.alert(this.logs.join("\n"));
            }
        }
    },
    HELPERS: {
        cookieHandler: {
            data: {},
            preferences_cookie_name: '_prefs',
            cookie_store: document,
            set: function(name, value, expires, path, domain, secure) {
                var today = new Date();
                if (expires) {
                    expires = expires * 1000 * 60;
                }
                this.cookie_store.cookie = name + '=' + encodeURIComponent(value) + ((expires) ? ';expires=' + new Date(today.getTime() + expires).toUTCString() : '') + ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '') + ((secure) ? ';secure' : '');
            },
            get: function(name) {
                var nameEQ = name + '=',
                    ca = this.cookie_store.cookie.split(';'),
                    i, l, c;
                for (i = 0, l = ca.length; i < l; i++) {
                    c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return decodeURIComponent(c.substring(nameEQ.length, c.length));
                    }
                }
                return null;
            },
            load: function(name) {
                var value = null;
                try {
                    if (typeof name != "undefined") {
                        value = JSON.parse(this.get(this.preferences_cookie_name))[name];
                    } else {
                        value = JSON.parse(this.get(this.preferences_cookie_name));
                    }
                } catch (__err__) {}
                return value;
            },
            save: function() {
                var obj = {};
                var args = Array.prototype.slice.call(arguments);
                obj[args[0]] = args[1];
                args.shift();
                args.shift();
                this.set.apply(this, [this.preferences_cookie_name, JSON.stringify(obj)].concat(args));
            }
        },
        isObjectEmpty: function(o) {
            return Object.keys(o).length === 0;
        },
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isDPMTrait: function(trait_type) {
            if (trait_type == "ON_BOARDED_TRAIT") {
                return true;
            }
            return false;
        },
        isAlgoTrait: function(traitType) {
            if (traitType == "ALGO_TRAIT") {
                return true;
            }
            return false;
        },
        getTraitTypeLabel: function(type) {
            switch (type) {
                case "RULE_BASED_TRAIT":
                    return "Rule-based";
                case "ON_BOARDED_TRAIT":
                    return "Onboarded";
                case "ALGO_TRAIT":
                    return "Algorithmic";
                default:
                    return "Unknown";
            }
        },
        isTrait: function(trait_type) {
            return trait_type == "INTENT" || trait_type == "ALGO_TRAIT" || trait_type == "ON_BOARDED_TRAIT" || trait_type == "RULE_BASED_TRAIT";
        },
        isSegment: function(trait_type) {
            return trait_type == "SEGMENT";
        },
        isEmptyString: function(str) {
            var result = false;
            if (str === "" || str.match(/^\s+$/)) {

                result = true;
            }
            return result;
        },
        htmlEntityDecode: function(entity) {
            var $html = $('<div />').html(entity);
            return $html instanceof $ ? $html.text() : "";
        },
        formatNumber: function(num) {
            num += '';
            var x = num.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        formatDate: function(date, format_function) {
            var year = "",
                month = "",
                day = "",
                hour = "",
                minute = "";
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            if (isNaN(date.getTime())) {
                throw new Error("Date is not valid");
            }
            year = date.getFullYear().toString();
            month = (date.getMonth() + 1).toString();
            day = date.getDate().toString();
            hour = date.getHours().toString();
            minute = date.getMinutes().toString();
            if (format_function) {
                return format_function(month, day, year, hour, minute);
            }
            if (hour !== "0") {
                return {
                    month: month,
                    day: day,
                    year: year,
                    hour: hour,
                    minute: minute
                };
            } else {
                return {
                    month: month,
                    day: day,
                    year: year
                };
            }
        },
        isNthChildSelectorSupported: function() {
            return Modernizr['nth-child-selector'];
        },
        isFirstOfTypeSelectorSupported: function() {
            return Modernizr['first-of-type'];
        },
        isLastOfTypeSelectorSupported: function() {
            return Modernizr['last-of-type'];
        },
        decorateWithSpanAndSlice: function(func) {
            return function(el) {
                var val = func.call(this, el);
                return '<span title="' + el + '">' + (val !== null ? val : "") + '</span>';
            }
        }(function(elem) {
            return "string" == typeof elem && elem.length > 30 ? elem.slice(0, 30) + "..." : elem;
        }),
        bindContextHelp: function() {
            $(".context-help").off().on('click', function(e) {
                e.stopPropagation();
                var addHelpObj = null,
                    showContextHelp = null,
                    helpPage = $(this).attr("data-id");
                addHelpObj = function(page) {
                    var url = ADOBE.AM.API.BASEURL + "/contextualhelp/pid-" + ADOBE.AM.pid + "/" + page;
                    $.getJSON(url, function(helpObj) {
                        ADOBE.AM.contextHelpArr[page] = helpObj;
                        showContextHelp(page);
                    });
                };
                showContextHelp = function(item) {
                    var alertObj = {};
                    var helpObj = ADOBE.AM.contextHelpArr[item];
                    helpObj.intro = ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(helpObj.intro);
                    var msg = helpObj.intro + "<a tabindex='-1' class='moreHelpLink' href='" + helpObj.url + "' target='_blank'>Click here for more information</a>";
                    alertObj.title = helpObj.title.replace(':', ":<br />");
                    alertObj.title = '<h4>' + alertObj.title + '</h4>';
                    alertObj.msg = msg;
                    msg = alertObj.title + alertObj.msg;
                    ADOBE.AM.AlertModal({
                        type: 'help',
                        message: msg
                    });
                }
                if (typeof ADOBE.AM.contextHelpArr[helpPage] === "undefined") {
                    addHelpObj(helpPage);
                } else {
                    showContextHelp(helpPage);
                }
                return false;
            });
        },
        comparator: function(sortby, direction) {
            return function(a, b) {
                if (typeof a.get(sortby) === 'string') {
                    a = a.get(sortby).toLowerCase();
                    b = b.get(sortby).toLowerCase();
                } else {
                    a = a.get(sortby);
                    b = b.get(sortby);
                }
                if (a == b) {
                    return 0;
                } else if (a < b) {
                    return direction == 'desc' ? -1 : 1;
                } else {
                    return direction == 'desc' ? 1 : -1;
                }
            };
        },
        formatFolderHierarchy: function(obj) {
            var newObj = {
                "attr": {
                    "id": obj.folderId + "_folder",
                    "rel": "folder"
                },
                "data": obj.name
            };
            if ($.isArray(obj.subFolders) && obj.subFolders.length > 0) {
                var children = [];
                $.each(obj.subFolders, function(i, child) {
                    var childObj = DEMDEX.UTILS.formatFolderHierarchy(child);
                    children.push(childObj);
                });
                $.extend(newObj, {
                    "state": "closed",
                    "children": children
                });
            }
            return newObj;
        },
        formatCategoryTaxonomy: function(obj) {
            var func = arguments.callee;
            var newObj = {
                "attr": {
                    "id": obj.categoryId + "_cat",
                    "rel": "category"
                },
                "data": obj.name
            };
            if (obj.categoryCount > 0) {
                var children = [];
                $.each(obj.categories, function(i, child) {
                    var childObj = func(child);
                    children.push(childObj);
                });
                $.extend(newObj, {
                    "state": "closed",
                    "children": children
                });
            }
            return newObj;
        },
        switchPage: function(pageString) {
            document.getElementById('mainContent').setAttribute('class', pageString);
        },
        tempFixForChrome: function() {
            var isChrome = (navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('chrome') > -1);
            if (!isChrome) {
                return false;
            }
            var $el = $('.AUI_Dialog_outerContainer');
            var absoluteTop = $el.position().top;
            var fixedTop = $el.offset().top;
            $el.css({
                top: absoluteTop
            }).addClass('chromeFix');
            $('body').addClass('disableMainScroll');
            $(window).resize(function() {
                $el.removeClass('chromeFix');
            });
        },
        makeTemplate: function(template_name, args) {
            var template = null;
            if (template_name instanceof Array) {
                var tmp = this[template_name[0]];
                for (var i = 1; i < template_name.length; i++) {
                    tmp = tmp[template_name[i]];
                }
                template = tmp;
            } else {
                template = this[template_name];
            }
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    template = template.replace(key, args[key]);
                }
            }
            return template;
        },
        TableFilter: function(tbl, tbx) {
            var self = this;
            if (tbx === Object(tbx) && tbx.keyup) {
                tbx.keyup(function(e) {
                    self.process(e.target.value);
                });
            }
            this.process = function(val) {
                if (!(typeof val == 'string') || tbl !== Object(tbl) || !tbl.find) {
                    return;
                }
                var trs = tbl.find('tbody tr');
                trs.each(function() {
                    var found = false,
                        tds = $(this).find('td');
                    tds.each(function() {
                        var td = $(this);
                        td.show();
                        if (td.text().toLowerCase().indexOf(val.toLowerCase()) >= 0) {
                            found = true;
                        }
                    });
                    if (!found) {
                        tds.hide();
                    }
                })
            };
        },
        dheElement: null,
        decodeHTMLEntities: function(str) {
            if (!this.dheElement) {
                this.dheElement = document.createElement('div');
            }
            var element = this.dheElement;
            if (str && typeof str === 'string') {
                element.innerHTML = str;
            }
            return element.innerText || element.textContent || str;
        },
        serialize: function(obj) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },
        prettyPrintEnum: function(value) {
            function formatWord(word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return value.split("_").map(formatWord).join(" ");
        },
        parseDataFormatForCloudViz: function(data, dataFormat) {
            var self = this;
            var parsed = {
                x: [],
                y: [],
                series: []
            };
            dataFormat.forEach(function(kv, i) {
                parsed.x[i] = [];
                parsed.y[i] = [];
                parsed.series[i] = [];
            });
            try {
                if (data === Object(data) && Object.keys(data).length) {
                    Object.keys(data).forEach(function(x) {
                        var obj = data[x];
                        x = self.getUTCDate(parseInt(x, 10));
                        dataFormat.forEach(function(kv, i) {
                            parsed.x[i].push(x);
                            var label = Object.keys(kv)[0];
                            var objKey = kv[label];
                            parsed.y[i].push(obj[objKey]);
                            parsed.series[i].push(label);
                        });
                    });
                    return parsed;
                }
            } catch (_error_) {
                return {};
            }
            return {};
        },
        parseMultipleTrendDataForCloudViz: function(data, typeKey) {
            var self = this;
            var parsed = {
                x: [],
                y: [],
                series: [],
                sids: []
            };
            var tsSidMappings = {},
                tsKeys = {},
                populatedSids = [],
                emptySids = [];
            if (data instanceof Array && data.length) {
                data.forEach(function(line) {
                    var metrics = line.metrics,
                        mappings = {};
                    if (metrics === Object(metrics) && Object.keys(metrics).length) {
                        var name = self.decodeHTMLEntities(line.name) + (typeof line.sid === 'undefined' ? '' : ' (' + line.sid + ')'),
                            x = [],
                            y = [],
                            series = [];
                        Object.keys(metrics).forEach(function(item) {
                            var date = self.getUTCDate(parseInt(item, 10));
                            var yValue = metrics[item][typeKey];
                            x.push(date);
                            y.push(yValue);
                            series.push(name);
                            mappings[item] = yValue;
                            tsKeys[item] = true;
                        });
                        parsed.x.push(x);
                        parsed.y.push(y);
                        parsed.series.push(series);
                        populatedSids.push(line.sid);
                        tsSidMappings[line.sid + ''] = mappings;
                    } else {
                        emptySids.push(line.sid);
                    }
                });
                parsed.sids = populatedSids.concat(emptySids);
                parsed.graphDataIsEmpty = !populatedSids.length;
                var dataTable = [];
                Object.keys(tsKeys).forEach(function(ts) {
                    var obj = {
                        date: new Date(parseInt(ts, 10))
                    };
                    Object.keys(tsSidMappings).forEach(function(sid) {
                        if (ts in tsSidMappings[sid]) {
                            obj[sid] = tsSidMappings[sid][ts];
                        } else {
                            obj[sid] = '';
                        }
                    });
                    dataTable.push(obj);
                });
                parsed.dataTable = dataTable;
                return parsed;
            }
            return {};
        },
        transformDataToCloudViz: function(data) {
            try {
                var t = {},
                    tKeys, key;
                if (data === Object(data) && data.y instanceof Array) {
                    tKeys = Object.keys(data);
                    tKeys.forEach(function(key) {
                        t[key] = [];
                    });
                    data.y.forEach(function(y, i) {
                        tKeys.forEach(function(key) {
                            Array.prototype.push.apply(t[key], data[key][i]);
                        });
                    });
                    return t;
                }
            } catch (err) {
                return {};
            }
            return {};
        },
        formatTimestampToUTC: function(timestamp, format) {
            if (typeof moment === 'undefined') {
                throw new Error('moment must be defined!');
            }
            if (typeof format === 'undefined') {
                format = 'YYYY-MM-DD';
            }
            return moment(timestamp).utc().format(format);
        },
        getUTCDate: function(utcmillis) {
            var date = new Date(utcmillis);
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        }
    },
    pressedEnter: function(e) {
        var keycode;
        if (window.event) {
            keycode = window.event.keyCode;
        } else if (e) {
            keycode = e.which;
        } else {
            keycode = e.keyCode;
        }
        if (keycode == 13) {
            return true;
        } else {
            return false;
        }
    },
    G6: {
        SEGMENTS: {
            trait_cache: {
                cache: [],
                getBySid: function(sid) {
                    for (var i = 0; i < this.cache.length; i++) {
                        if (this.cache[i].sid == sid) {
                            return this.cache[i];
                        }
                    }
                }
            },
            getNumberOfTouchingRules: function(remaining_tree) {
                var cnt = 1,
                    node = null;
                for (var k = 0, len = remaining_tree.length; k < len; k++) {
                    node = remaining_tree[k];
                    if (typeof node.on != undefined && !node.on || ADOBE.AM.UTILS.HELPERS.isNumeric(node.val, 10)) {
                        cnt++;
                    } else {
                        break;
                    }
                }
                return cnt;
            },
            treeParser: function(tree, ff) {
                var result = "";
                if (tree.expr1 || tree.expr2 || tree.frequency || tree.sid) {
                    result = this.parseExpressionTree.apply(this, arguments);
                }
                return result;
            },
            flattenTree: function(t) {
                var node = t;
                var parent = null;
                var flattened_tree = [];
                var obj = {};
                while (node != null) {
                    if (parent != null) {
                        parent.expr1 = node.expr2;
                        node.expr2 = parent;
                    }
                    if (node.expr1 != null) {
                        parent = node;
                        node = node.expr1;
                        continue;
                    }
                    if (node.frequency) {
                        flattened_tree.push({
                            sids: node.frequency.list,
                            rec_op: node.expressionName,
                            rec_value: node.value,
                            freq_op: node.frequency.op,
                            freq_units: node.frequency.units,
                            freq_val: node.frequency.value
                        });
                    } else if (node.expressionName) {
                        obj = {
                            expressionName: node.expressionName
                        };
                        flattened_tree.push(obj);
                        if (node.expr) {
                            var flattened_expr = arguments.callee(node.expr)
                            flattened_tree = flattened_tree.concat(flattened_expr);
                        }
                    } else if (node.expr) {
                        flattened_tree.push({
                            sid: node.expr.sid
                        });
                    } else if (node.sid) {
                        flattened_tree.push({
                            sid: node.sid
                        });
                    }
                    node = node.expr2;
                    parent = null;
                }
                return flattened_tree;
            },
            parseExpressionTree: function(t) {
                var g6 = ADOBE.AM.UTILS.G6.SEGMENTS;
                var helper = g6.tree_helper;
                helper.init();
                this.inOrderTreeTraversal(t, helper.storeNode);
                return g6.formatFlattenedList(helper.nodes, g6.parsingFunctions.html);
            },
            tree_helper: {
                turnOnNextOr: false,
                turnOnOperatorOverride: false,
                openParen: false,
                depth: 1,
                old_depth: null,
                operatorInfoAtDepth: {},
                nodes: [],
                init: function() {
                    this.nodes = [];
                    this.turnOnOperatorOverride = false;
                    this.openParen = false;
                    this.depth = 1;
                    this.old_depth = null;
                    this.operatorInfoAtDepth = {};
                },
                depthCheck: function() {
                    var helper = ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;
                    return helper.old_depth == helper.depth;
                },
                store: function(node) {
                    this.nodes.push(node);
                },
                storeNode: function(type, val, extras) {
                    var result = null,
                        on_off_switch = false,
                        helper = ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;
                    switch (type) {
                        case 'sid':
                            result = {
                                type: 'sid',
                                value: val
                            };
                            break;
                        case 'expr':
                            on_off_switch = ((extras && typeof extras.oo != "undefined") ? extras.oo : 1);
                            result = {
                                type: 'op',
                                value: val,
                                on: on_off_switch
                            };
                            break;
                        case 'name-val':
                            result = val;
                            break;
                        case 'frequency':
                            result = {
                                type: 'frequency',
                                value: {
                                    sids: val.sids,
                                    frequency_op: val.freq_op,
                                    frequency_val: val.freq_val,
                                    units: val.units,
                                    recency_op: val.rec_op,
                                    recency_val: val.rec_val
                                }
                            };
                            break;
                        default:
                            break;
                    }
                    helper.store(result);
                    return result;
                },
                turnOperatorOn: function(op) {
                    if (!this.openParen) {
                        return true;
                    }
                    if (op.toString().toLowerCase() == "and") {
                        return true;
                    }
                    if (typeof this.operatorInfoAtDepth[this.depth] != "undefined") {
                        return !this.operatorInfoAtDepth[this.depth];
                    }
                    return false;
                },
                handleExpression: function(op, tree) {
                    switch (op.toString().toLowerCase()) {
                        case 'or':
                            this.openParen = this.lookAroundForSpecialOperations(tree);
                            break;
                        case 'and':
                            this.openParen = false;
                            break;
                        default:
                            break;
                    }
                    this.incDepth(1);
                    this.turnOnOperatorOverride = false;
                },
                handleFrequency: function() {
                    this.openParen = false;
                    this.turnOnOperatorOverride = true;
                    this.incDepth(-1);
                },
                handleSid: function() {
                    this.incDepth(-1);
                },
                lookAroundForSpecialOperations: function(tree) {
                    if (tree.expr1 && tree.expr1.frequency || tree.expr2 && tree.expr2.frequency) {
                        return false;
                    }
                    if (tree.expr1 && tree.expr1.expressionName == "and" || tree.expr2 && tree.expr2.expressionName == "and") {
                        return false;
                    }
                    if (typeof this.operatorInfoAtDepth[this.depth] != "undefined") {
                        return this.operatorInfoAtDepth[this.depth];
                    }
                    if (this.turnOnOperatorOverride) {
                        return false;
                    }
                    return true;
                },
                incDepth: function(val) {
                    var helper = ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;
                    helper.old_depth = helper.depth;
                    helper.depth += val;
                },
                display: function() {
                    var helper = ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper,
                        nodes = helper.nodes,
                        result = "";
                    for (var i = 0; i < nodes.length; i++) {
                        var next = nodes[i + 1];
                        if (next == "or") {
                            result += " ( ";
                            result += nodes[i];
                            for (var j = i + 1; j < nodes.length; j++) {
                                result += " " + nodes[j] + " ";
                                if (nodes[j + 1] != "or" && isNaN(parseInt(nodes[j + 1], 10))) {
                                    i = j;
                                    break;
                                }
                            }
                            i = j;
                            result += " ) ";
                        } else {
                            result += nodes[i] + " ";
                        }
                    }
                    return result;
                }
            },
            inOrderTreeTraversal: function(t, ff) {
                if (typeof t === "undefined") {
                    return;
                } else if (typeof t == "number") {
                    return t;
                } else if (typeof t.name !== "undefined") {
                    return ff('name-val', {
                        name: t.name,
                        value: t.value,
                        expressionName: t.expressionName,
                        type: 'rule'
                    });
                } else if (t.sid) {
                    ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleSid();
                    return ff('sid', t.sid);
                } else if (t.expr) {
                    return ff('expr', t.expressionName) + arguments.callee(t.expr, ff);
                } else if (t.expressionName && t.frequency) {
                    ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleFrequency();
                    return ff('frequency', {
                        freq_val: t.value,
                        freq_op: t.expressionName,
                        rec_val: t.frequency.value,
                        rec_op: t.frequency.op,
                        units: t.frequency.units,
                        sids: t.frequency.list
                    });
                }
                arguments.callee(t.expr1, ff);
                if (t.expressionName) {
                    ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleExpression(t.expressionName, t);
                }
                ff('expr', t.expressionName, {
                    oo: ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.turnOperatorOn(t.expressionName)
                });
                arguments.callee(t.expr2, ff);
                return;
            },
            formatFlattenedList: function(flattened_tree, ff) {
                var num_of_touching_sids = 0,
                    first_sid_flag = true,
                    rf_data = null,
                    sid_rules = null,
                    result = "";
                for (var i = 0; i < flattened_tree.length; i++) {
                    node = flattened_tree[i];
                    switch (node.type) {
                        case 'op':
                            if (flattened_tree[i + 1] && flattened_tree[i + 1].type == 'op' && flattened_tree[i + 1].value.toLowerCase() == 'not') {
                                flattened_tree.splice(i + 1, 1);
                                result += ff('expr', node.value + " NOT", node.on ? 'on' : 'off');
                            } else {
                                result += ff('expr', node.value, node.on ? 'on' : 'off');
                            }
                            first_sid_flag = node.on ? true : false;
                            break;
                        case 'sid':
                            if (first_sid_flag) {
                                num_of_touching_sids = this.getNumberOfTouchingRules(flattened_tree.slice(i + 1));
                                result += ff('sid', node.value, {
                                    row_span: num_of_touching_sids
                                });
                            } else {
                                result += ff('sid', node.value);
                            }
                            first_sid_flag = false;
                            break;
                        case 'frequency':
                            sid_rules = [];
                            for (var j = 0, len_j = node.value.sids.length; j < len_j; j++) {
                                sid = node.value.sids[j];
                                if (j == 0) {
                                    rf_data = {};
                                    if (node.value.frequency_op) {
                                        rf_data.frequency_ops = node.value.frequency_op;
                                    }
                                    if (node.value.units) {
                                        rf_data.frequency_units = node.value.units;
                                    }
                                    if (node.value.frequency_val) {
                                        rf_data.frequency_val = node.value.frequency_val;
                                    }
                                    if (node.value.recency_op) {
                                        rf_data.recency_ops = node.value.recency_op;
                                    }
                                    if (node.value.recency_val) {
                                        rf_data.recency_val = node.value.recency_val;
                                    }
                                    sid_rules.push(ff('sid', sid, _.extend(rf_data, {
                                        row_span: len_j + (len_j - 1)
                                    })));
                                    continue;
                                }
                                sid_rules.push(ff('sid', sid));
                            }
                            result += sid_rules.join(ff('expr', 'or', 'off'));
                            first_sid_flag = true;
                            break;
                    }
                }
                return result;
            },
            parsingFunctions: {
                code: function(type, val, extras) {
                    var result = null,
                        on_off_switch = false,
                        helper = ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;
                    switch (type) {
                        case 'sid':
                            result = val;
                            break;
                        case 'expr':
                            on_off_switch = ((extras && typeof extras.oo != "undefined") ? extras.oo : 1);
                            result = (on_off_switch ? val.toUpperCase() : val.toLowerCase());
                            break;
                        case 'frequency':
                            result = "(Frequency(" + val + " " + extras.freq_op + " " + extras.freq_val + extras.units + ") " + extras.rec_op + " " + extras.rec_val + ")";
                            break;
                        default:
                            return "WTF!";
                            break;
                    }
                    helper.store(result);
                    return result;
                },
                html: function(type, val) {
                    var html = "",
                        empty_rf = null,
                        rf_html = "",
                        trait = null,
                        name = "",
                        rf_state = "off",
                        uniques = "-",
                        rule_template = APP.templates.segment_builder_widget.elements.rule,
                        data = null,
                        rf_cell = "",
                        rf_template = APP.templates.segment_builder_widget.elements.recency_frequency;
                    if (type == 'sid') {
                        trait = ADOBE.AM.UTILS.G6.SEGMENTS.trait_cache.getBySid(val);
                        name = trait.name || "";
                        uniques = ADOBE.AM.UTILS.HELPERS.formatNumber(trait.uniques30Day) || 0;
                        data = {
                            sid: val,
                            name: name,
                            uniques: uniques,
                            rowspan: false
                        };
                        if (arguments[2] && arguments[2].row_span) {
                            data.rowspan = !!arguments[2].row_span || false;
                            empty_rf = {
                                frequency_val: "",
                                frequency_ops: ">=",
                                recency_val: "",
                                recency_ops: "<="
                            };
                            if (arguments[2].frequency_val) {
                                rf_state = "on";
                                empty_rf.frequency_val = arguments[2].frequency_val;
                            }
                            if (arguments[2].frequency_ops) {
                                rf_state = "on";
                                empty_rf.frequency_ops = ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(arguments[2].frequency_ops);
                            }
                            if (arguments[2].recency_val) {
                                rf_state = "on";
                                empty_rf.recency_val = arguments[2].recency_val;
                            }
                            if (arguments[2].recency_ops) {
                                rf_state = "on";
                                empty_rf.recency_ops = ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(arguments[2].recency_ops);
                            }
                            _.extend(empty_rf, {
                                rowspan: arguments[2].row_span,
                                state: rf_state
                            });
                            rf_cell = _.template(APP.templates.segment_builder_widget.elements.rf_cell, empty_rf);
                            data.rf_html = rf_cell;
                        }
                        return _.template(rule_template, data);
                    }
                    if (type == 'frequency') {
                        var rule_html = val,
                            op = arguments[2],
                            value = arguments[3],
                            recency_op = arguments[4],
                            recency_val = arguments[5];
                        try {
                            rf_html = _.template(rf_template, {
                                rf_class: "on",
                                recency_ops: recency_op,
                                recency_val: recency_val,
                                frequency_ops: op,
                                frequency_val: value
                            });
                        } catch (__err__) {
                            ADOBE.AM.UTILS.LOGGER.log(__err__.message);
                        }
                        return rule_html + rf_html;
                    }
                    if (type == 'wrapper') {
                        try {
                            if (arguments[2] && arguments[2].rf == true) {
                                rf_html = _.template(rf_template, {
                                    rf_class: "off",
                                    frequency_val: "",
                                    frequency_ops: ">=",
                                    recency_val: "",
                                    recency_ops: "<="
                                });
                                html = _.template(rw_template, {
                                    content: val + rf_html
                                });
                            } else {
                                html = _.template(rw_template, {
                                    content: val
                                });
                            }
                        } catch (__err__) {
                            ADOBE.AM.UTILS.LOGGER.log(__err__.message);
                        }
                        return val;
                    }
                    if (type == 'expr') {
                        var template = APP.templates.segment_builder_widget.elements.op,
                            op_wrapper_classes = "op " + (arguments[2] || "on"),
                            html = "";
                        if (val == "or" && arguments[2] == "off") {
                            val = "";
                        }
                        try {
                            html = _.template(template, {
                                op_wrapper_class: op_wrapper_classes,
                                op_class: val,
                                selected: val.toString().toUpperCase()
                            });
                        } catch (__err__) {
                            ADOBE.AM.UTILS.LOGGER.log(__err__.message);
                        }
                        return html;
                    }
                }
            }
        }
    },
    MODELS: {
        validators: {
            validateData: function(attrs) {
                var errors = this.validationErrors = [],
                    v, vfn, req, opt;
                this.attrs = attrs;
                if (v = attrs.validator) {
                    if (!this.vfn) {
                        this.vfn = {
                            notEmpty: function(key, field) {
                                var val = attrs[key];
                                if (val != null && val != '' && val != 'undefined') {
                                    return [true];
                                } else {
                                    return [false, field + ' cannot be empty'];
                                }
                            },
                            date: function(key, field) {
                                var val = attrs[key];
                                if (!isNaN(Date.parse(val))) {
                                    return [true];
                                } else {
                                    return [false, field + ' is not in a parsable date format'];
                                }
                            },
                            http: function(key, field) {
                                var val = attrs[key];
                                if (/^http:\/\/[-A-Za-z0-9.]+\.[A-Za-z]{2,4}[A-Za-z0-9 \?=\.\/&amp;;_%,@:\[\]~\+#!\$,\^\*\(\)\`\|\/-]*$/.test(val)) {

                                    return [true];
                                } else {
                                    return [false, field + ' is not in a valid http url format'];
                                }
                            },
                            https: function(key, field) {
                                var val = attrs[key];
                                if (/^https:\/\/[-A-Za-z0-9.]+\.[A-Za-z]{2,4}[A-Za-z0-9 \?=\.\/&amp;;_%,@:\[\]~\+#!\$,\^\*\(\)\`\|\/-]*$/.test(val)) {

                                    return [true];
                                } else {
                                    return [false, field + ' is not in a valid https url format'];
                                }
                            }
                        };
                    }
                    vfn = this.vfn;
                    if (req = v.required) {
                        $.each(req, function(key, val) {
                            var result = vfn[val[0]](key, val[1]);
                            if (!result[0]) {
                                errors.push(result[1]);
                            }
                        });
                    }
                    if (opt = v.optional) {
                        $.each(opt, function(key, val) {
                            if (attrs[key] != null && attrs[key] != '') {
                                var result = vfn[val[0]](key, val[1]);
                                if (!result[0]) {
                                    errors.push(result[1]);
                                }
                            }
                        });
                    }
                    if (typeof v.custom == 'function') {
                        this.customValidation = v.custom;
                        this.customValidation();
                    }
                }
                if (this.validationErrors.length) {
                    return this.validationErrors;
                }
            }
        }
    }
};
ADOBE.AM.UTILS.GATEKEEPER = function() {
    this.permission_objects = {};
    this.current_scheme = null;
    this.valid = false;
};
ADOBE.AM.UTILS.GATEKEEPER.prototype = {
    schemes: null,
    PermissionClass: null,
    defaultSchemePermissionCheck: function(perm_object) {
        var authorized = true,
            self = this;
        _.each(self, function(values, key) {
            if (key.match(/Permission$/) === null) {

                return;
            }
            if (this.getPermissionObjects(key).hasPermission(self[key]) === false) {
                authorized = false;
                return false;
            }
        }, perm_object);
        return authorized;
    },
    permissionCheck: function() {
        var scheme_permissions = this.schemes[this.current_scheme];
        this.valid = scheme_permissions.permissionCheck !== void 0 ? scheme_permissions.permissionCheck(this) : this.defaultSchemePermissionCheck.call(scheme_permissions, this);
        return this.isValid();
    },
    checkPermissions: function(perm_objects, currentScheme) {
        this.setPermissionObjects(perm_objects);
        this.setCurrentScheme(currentScheme);
        if (this.permissionCheck()) {
            this.clearAll();
            return true;
        }
        this.clearAll();
        return false;
    },
    isValid: function() {
        return this.valid;
    },
    clearAll: function() {
        this.permission_objects = {};
        this.valid = null;
        this.current_scheme = null;
    },
    setPermissionObjects: function(arg) {
        var obj = {},
            self = this;

        function isValid(o) {
            return o instanceof self.PermissionClass
        }
        if (self.PermissionClass === null) {
            this._errors.handleError("ArgError", "arg", "PermissionClass on the instance must be defined");
        }
        if (arguments.length > 1) {
            this._errors.handleError("ArgError", "arg", "setPermissionObjects accepts single object or array of objects");
        }
        if (arg instanceof Array) {
            _.each(arg, function(element) {
                if (!isValid(element)) {
                    self._errors.handleError("ArgError", "arg", "Argument must be of type ADOBE.AM.Permission.Models.Permission");
                }
                this[element.getName()] = element;
            }, obj);
            _.extend(this.permission_objects, obj);
            return true;
        }
        if (!isValid(arg)) {
            this._errors.handleError("ArgError", "arg", "Argument must be of type ADOBE.AM.Permission.Models.Permission");
        }
        obj[arg.getName()] = arg;
        _.extend(this.permission_objects, obj);
        return true;
    },
    getPermissionObjects: function(name) {
        return name ? this.permission_objects[name] : this.permission_objects;
    },
    setCurrentScheme: function(arg) {
        this.current_scheme = arg;
        this.valid = false;
    },
    getCurrentScheme: function() {
        return this.current_scheme;
    },
    setSchemes: function(s) {
        if (typeof s != 'object') {
            this._errors.handleError("ArgError", "s", "argument must be of type object");
        }
        this.schemes = s;
    },
    getSchemes: function() {
        return this.schemes;
    },
    setPermissionClass: function(p) {
        this.PermissionClass = p;
    },
    getPermissionClass: function() {
        return this.PermissionClass;
    },
    setErrorTypes: function(types) {
        _.extend(this._errors.types, types);
        this._errors.isCustomErrorsSet = true;
    },
    getIsCustomErrorsSet: function() {
        return this._errors.getIsCustomErrorsSet();
    },
    _errors: {
        types: {},
        customErrorsSet: false,
        handleError: function(error_type, arg, message) {
            if (this.isCustomErrorsSet === false) {
                throw new Error(message);
            }
            if (error_type in this.types) {
                throw new this.types[error_type](arg, message);
            }
            throw new Error(message);
        },
        getIsCustomErrorsSet: function() {
            return this.isCustomErrorsSet;
        }
    },
    _strings: {}
};
ADOBE.AM.API = {
    BASEURL: "/portal/api/v1",
    SOLR: {
        url: function(type) {
            var url = ADOBE.AM.API.BASEURL + "/segments/";
            switch (type) {
                case "estimate30DaySize":
                    type = "estimate-30-day-size";
                    break;
                case "estimate7DaySize":
                    type = "estimate-7-day-size";
                    break;
                case "estimate60DaySize":
                    type = "estimate-60-day-size";
                    break;
                default:
                    break;
            }
            url += type ? type : "estimate-size";
            return url;
        }
    },
    REGION: {
        regions: {
            url: function() {
                return ADOBE.AM.API.BASEURL + "/dcs-regions/";
            }
        }
    },
    MODELS: {
        algo_model: {
            url: function(amid, qsa) {
                var url = ADOBE.AM.API.BASEURL + '/models/';
                var qs = [];
                if (amid != undefined) {
                    url += amid + "/";
                }
                if (typeof qsa == "object" && !ADOBE.AM.UTILS.HELPERS.isObjectEmpty(qsa)) {
                    Object.keys(qsa).forEach(function(val, ind, arr) {
                        qs.push(val + "=" + qsa[val]);
                    });
                    url += "?" + qs.join("&");
                }
                return url;
            }
        },
        processing_history: function(amid) {
            return ADOBE.AM.API.MODELS.algo_model.url(amid) + 'processing-history/';
        },
        algorithms: {
            url: function() {
                return ADOBE.AM.API.BASEURL + "/algorithms/";
            }
        },
        influential_traits: {
            url: function(amid) {
                return ADOBE.AM.API.MODELS.algo_model.url(amid) + "runs/latest/traits/";
            }
        },
        run_stats: {
            url: function(amid) {
                return ADOBE.AM.API.MODELS.algo_model.url(amid) + "runs/latest/stats/";
            }
        },
        bulk_delete: {
            url: function() {
                return ADOBE.AM.API.MODELS.algo_model.url() + "bulk-delete/";
            }
        },
        limits: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/models/limits';
            }
        }
    },
    TRAITS: {
        bulkDelete: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/traits/bulk-delete/";
                return url;
            },
            method: function(options) {
                var ids = options.ids,
                    success = options.success || function() {},
                    error = options.error || function() {},
                    url = this.url();
                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: success,
                    error: error
                });
            }
        },
        type: {
            url: function(pixelType) {
                var url = ADOBE.AM.API.BASEURL + '/customer-trait-types/';
                if (typeof pixelType != "undefined") {
                    url += pixelType + "/";
                }
                return url;
            }
        },
        folders: {
            url: function(folderID) {
                var url = ADOBE.AM.API.BASEURL + '/folders/traits/';
                if (folderID != undefined) {
                    url += '%%folderid%%/';
                    url = url.replace("%%folderid%%", folderID);
                }
                return url;
            }
        },
        folderTraits: {
            url: function(pid, folderID) {}
        },
        trait2: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + '/traits/';
                return url;
            }
        },
        trait: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/traits/';
                if (typeof params != "undefined") {
                    if (params && params === Object(params)) {
                        url = url + '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                    } else {
                        url += params + "/";
                    }
                }
                return url;
            }
        },
        limits: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/traits/limits';
            }
        },
        validate: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/traits/validate/";
                return url;
            }
        },
        test: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/traits/test/";
                return url;
            }
        },
        trend: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/reports/traits-trend';
            },
            sid: {
                url: function(sid, startDate, endDate, interval) {
                    var query = [];
                    if (startDate) {
                        query.push('startDate=' + startDate);
                    }
                    if (endDate) {
                        query.push('endDate=' + endDate);
                    }
                    if (interval) {
                        query.push('interval=' + interval);
                    }
                    return ADOBE.AM.API.BASEURL + '/reports/traits-trend/' + sid + (query.length ? '?' + query.join('&') : '');
                }
            }
        },
        generalReport: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/reports/traits-for-date";
                return url;
            }
        }
    },
    DESTINATION: {
        destination: {
            url: function(qsa) {
                var qs = [],
                    url = ADOBE.AM.API.BASEURL + "/destinations/";
                if (typeof qsa === "undefined") {
                    qsa = {};
                }
                if (!ADOBE.AM.UTILS.HELPERS.isObjectEmpty(qsa)) {
                    Object.keys(qsa).forEach(function(val, ind, arr) {
                        qs.push(val + "=" + qsa[val]);
                    });
                    url += "?" + qs.join("&");
                }
                return url;
            },
            bulkUrl: function(destinationId) {
                var url = ADOBE.AM.API.BASEURL + "/destinations/%%destinationId%%/bulk-create/";
                if (!destinationId) {
                    throw new ADOBE.AM.UTILS.ERRORS.TYPES.ValidationError("destinationId", "argument is required");
                }
                return url.replace("%%destinationId%%", destinationId);
            },
            typeArr: {
                "PUSH": "URL",
                "S2S": "Server-to-Server",
                "ADS": "Cookie",
                "PULL": "Pull"
            },
            allowed_types: ["PUSH", "S2S", "ADS"],
            getType: function(type) {
                if (this.allowed_types.indexOf(type) == -1) {
                    return "";
                }
                return this.typeArr[type];
            },
            mapping_divider: "<br />",
            getMapping: function(destObj, obj) {
                var mapping, ttdo = obj;
                if (destObj.destinationType == "PUSH") {
                    if (destObj.serializationEnabled) {
                        mapping = ttdo.traitAlias;
                    } else {
                        mapping = "";
                        if (ttdo.url !== "" || ttdo.secureUrl) {
                            if (ttdo.url === "") {
                                mapping = ttdo.secureUrl;
                            } else {
                                mapping = ttdo.url;
                                if (ttdo.secureUrl) {
                                    mapping += this.mapping_divider + ttdo.secureUrl;
                                }
                            }
                        }
                    }
                } else if ("S2S" == destObj.destinationType) {
                    mapping = ttdo.traitAlias;
                } else {
                    if (destObj.formatType == "SINGLE_KEY") {
                        mapping = destObj.singleKey + " = " + ttdo.valueAlias;
                    } else {
                        mapping = ttdo.traitAlias + " " + (destObj.keySeparator || "=") + " " + ttdo.valueAlias;
                    }
                }
                return mapping;
            }
        },
        search: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + '/destinations/';
                return url;
            }
        },
        limits: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/destinations/limits';
            }
        },
        availablePlatforms: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/destinations/configurations/available-platforms';
            }
        },
        outboundHistory: {
            url: function(destId, startDate, endDate) {
                return ADOBE.AM.API.DESTINATION.destination.url() +
                    destId +
                    '/history/outbound?startDate=' +
                    startDate +
                    "&endDate=" +
                    endDate;
            }
        }
    },
    SCHEMAS: {
        schema: {
            url: function(pid, schema, qsa) {
                var url = ADOBE.AM.API.BASEURL + '/pid-%%pid%%/schema/';
                if (!pid) {
                    throw new ADOBE.AM.UTILS.ERRORS.TYPES.ValidationError("pid", "argument is required");
                }
                url = url.replace("%%pid%%", pid);
                if (schema) {
                    url += schema + '/';
                }
                url += "?";
                if (qsa && qsa.token) {
                    url += 'token=' + qsa.token + '&';
                }
                if (qsa && qsa.user) {
                    url += 'user=' + qsa.user;
                }
                return url;
            },
            method: function(options) {
                var url = options.url,
                    success = options.success || function() {},
                    error = options.error || function() {};
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    success: success,
                    error: error
                });
            }
        }
    },
    DATAFEED: {
        url: function(params) {
            var url = ADOBE.AM.API.BASEURL + '/data-feeds';
            if (params) {
                if (params === Object(params)) {
                    url = url + '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                } else {
                    url = [url, params, ''].join('/');
                }
            }
            return url;
        },
        plan: {
            url: function(feedId) {
                if (feedId) {
                    return [ADOBE.AM.API.DATAFEED.url(), feedId, 'plans'].join('/');
                } else {
                    throw new Error('No feed ID is provided for plan');
                }
            }
        }
    },
    DATASOURCES: {
        dataSources: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/datasources/';
                if (typeof params != "undefined") {
                    if (params && params === Object(params)) {
                        url = url + '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                    } else {
                        url += params + "/";
                    }
                }
                return url;
            }
        },
        dataSources_modeling: {
            url: function() {
                return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?modelingEnabled=true";
            }
        },
        dataSources_segments: {
            url: function() {
                return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?objectType=segment&includePermissions=true";
            }
        },
        dataSources_traits: {
            url: function() {
                return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?objectType=trait&includePermissions=true&includeThirdParty=true";
            }
        },
        marketingCloudVisitorIdVersions: {
            url: function() {
                return ADOBE.AM.API.DATASOURCES.dataSources.url() + "configurations/marketing-cloud-visitorid-versions";
            }
        },
        idTypes: {
            url: function() {
                return ADOBE.AM.API.DATASOURCES.dataSources.url() + "configurations/available-id-types";
            }
        },
        bulkDelete: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/datasources/bulk-delete/";
                return url;
            },
            method: function(options) {
                var ids = options.datasourceIds,
                    success = options.success || function() {},
                    error = options.error || function() {},
                    url = this.url();
                return $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(ids)
                });
            }
        },
        inboundHistory: {
            url: function(dpid, startDate, endDate) {
                return ADOBE.AM.API.DATASOURCES.dataSources.url(dpid) +
                    'history/inbound?startDate=' + startDate + "&endDate=" + endDate;
            }
        },
        inboundMailingList: {
            url: function(dataSourceId, emailAddress) {
                return ADOBE.AM.API.DATASOURCES.dataSources.url(dataSourceId) + 'inbound-mailing-list/' + (emailAddress || '');
            }
        }
    },
    TAXONOMY: {
        categories: {
            url: function(tid) {
                var url = ADOBE.AM.API.BASEURL + '/taxonomies/0/';
                if (tid) {
                    url += tid + '/';
                }
                return url;
            }
        }
    },
    FOLDERS: {
        folder: {
            url: function(type, folderID) {
                var url = ADOBE.AM.API.BASEURL + '/folders/' + type + "/";
                if (folderID != undefined) {
                    url += '%%folderid%%/';
                    url = url.replace("%%folderid%%", folderID);
                }
                return url;
            }
        },
        folders: {
            url: function(type) {
                var url = ADOBE.AM.API.BASEURL + '/folders/';
                url += type + "/";
                return url;
            }
        }
    },
    SEGMENTS: {
        limits: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/segments/limits';
            }
        },
        rule_validation: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/segments/validate/';
            }
        },
        segment: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/segments/';
                if (typeof params != "undefined") {
                    if (params && params === Object(params)) {
                        url = url + '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                    } else {
                        url += params + "/";
                    }
                }
                return url;
            }
        },
        search: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + '/segments/';
                return url;
            }
        },
        folders: {
            url: function(folderID) {
                var url = ADOBE.AM.API.BASEURL + '/folders/segments/';
                if (folderID != undefined) {
                    url += '%%folderid%%/';
                    url = url.replace("%%folderid%%", folderID);
                }
                return url;
            }
        },
        folderSegments: {
            url: function(pid, folderID) {
                var url = ADOBE.AM.API.SEGMENTS.folders.url.apply(this, arguments);
                url += "segments/";
                return url;
            }
        },
        bulkDelete: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/segments/bulk-delete/";
                return url;
            },
            method: function(options) {
                var ids = options.ids,
                    success = options.success || function() {},
                    error = options.error || function() {},
                    pid = options.pid || null,
                    url = this.url();
                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(ids),
                    success: success,
                    error: error
                });
            }
        },
        trend: {
            url: function() {
                return ADOBE.AM.API.BASEURL + '/reports/segments-trend';
            },
            sid: {
                url: function(sid, startDate, endDate, interval) {
                    var query = [];
                    if (startDate) {
                        query.push('startDate=' + startDate);
                    }
                    if (endDate) {
                        query.push('endDate=' + endDate);
                    }
                    if (interval) {
                        query.push('interval=' + interval);
                    }
                    return ADOBE.AM.API.BASEURL + '/reports/segments-trend/' + sid + (query.length ? '?' + query.join('&') : '');
                }
            }
        },
        generalReport: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/reports/segments-for-date";
                return url;
            }
        }
    },
    USERS: {
        user: {
            url: function(userId) {
                var url = ADOBE.AM.API.BASEURL + '/users/';
                if (typeof userId != "undefined") {
                    url += userId + "/";
                }
                return url;
            }
        },
        updateGroups: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/users/update-groups/";
                return url;
            },
            method: function(options) {
                var data = options.data,
                    url = this.url();
                return $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                });
            }
        },
        bulkDelete: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/users/bulk-delete/";
                return url;
            },
            method: function(options) {
                var user_ids = options.user_ids,
                    success = options.success || function() {},
                    error = options.error || function() {},
                    url = this.url();
                return $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(user_ids)
                });
            }
        }
    },
    GROUPS: {
        group: {
            url: function(groupId) {
                var url = ADOBE.AM.API.BASEURL + '/groups/';
                if (typeof groupId != "undefined") {
                    url += groupId + "/";
                }
                return url;
            }
        },
        bulkDelete: {
            url: function() {
                var url = ADOBE.AM.API.BASEURL + "/groups/bulk-delete/";
                return url;
            },
            method: function(options) {
                var group_ids = options.group_ids,
                    success = options.success || function() {},
                    error = options.error || function() {},
                    url = this.url();
                return $.ajax({
                    url: url,
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(group_ids)
                });
            }
        },
        permissions: {
            url: function(groupId) {
                return ADOBE.AM.API.BASEURL + '/groups/' + groupId + '/permissions';
            }
        }
    },
    VISITOR_PROFILE: {
        url: function(uuid, region) {
            return ADOBE.AM.API.BASEURL + '/visitor-profile?uuid=' + uuid + '&region=' + region;
        }
    },
    REPORTS: {
        largest_traits: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/reports/largest-traits';
                if (params === Object(params)) {
                    url += '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                }
                return url;
            }
        },
        largest_segments: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/reports/largest-segments';
                if (params === Object(params)) {
                    url += '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                }
                return url;
            }
        },
        traits_most_changed: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/reports/most-changed-traits';
                if (params === Object(params)) {
                    url += '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                }
                return url;
            }
        },
        segments_most_changed: {
            url: function(params) {
                var url = ADOBE.AM.API.BASEURL + '/reports/most-changed-segments';
                if (params === Object(params)) {
                    url += '?' + ADOBE.AM.UTILS.HELPERS.serialize(params);
                }
                return url;
            }
        },
        partner_uniques: {
            url: function(keyVals) {
                var qs = "";
                qs = Object
                    .keys(keyVals)
                    .map(function(key) {
                        return key + '=' + keyVals[key];
                    })
                    .join('&');
                return ADOBE.AM.API.BASEURL + '/reports/partner-uniques?' + qs;
            }
        }
    }
};
ADOBE.AM.MESSAGES = {
    'en_US': {
        'generic_error': {
            message: "There was an error.  Please refresh and try again"
        },
        'generic_unrefreshable_error': {
            message: "There was an error. Please contact your administrator."
        },
        'generic_api_error': {
            message: 'There was an error.  Please try again'
        },
        'loading': {
            message: 'Please wait...'
        },
        message: {
            message: 'Message'
        },
        saved: {
            message: 'Saved'
        },
        ok: {
            message: 'OK'
        },
        cancel: {
            message: 'Cancel'
        },
        success: {
            message: 'Success'
        },
        'cannot_delete_entity_mapped': {
            title: "Cannot delete segments",
            summary: "These segments are currently mapped to destinations.",
            message: "One or more of the segments you are attempting to delete have attached destinations. You must remove destination mappings before deleting a segment."
        },
        'not_all_selected_segments_can_be_added_to_destinations': {
            message: "The following segments you selected were NOT mappable to destinations:<span class='insert'></span>Do you wish to continue?"
        },
        'no_selected_segments_can_be_added_to_destinations': {
            message: "None of the segments you selected can be added to destinations."
        },
        'add_dpmtrait_to_recency_frequency': {
            message: "You are about to add a third party trait to a rule group that has recency and frequency.  This will cause the recency and frequency to be reset for this group.  <br /><br />Do you wish to continue?"
        },
        'add_algotrait_to_recency_frequency': {
            message: "You are about to add an algorithmic trait to a rule group that has recency and frequency.  This will cause the recency and frequency to be reset for this group.  <br /><br />Do you wish to continue?"
        },
        'cannot_add_recency_frequency_on_dpmtrait': {
            message: "You cannot add Recency and Frequency to a trait grouping with a 3rd party trait"
        },
        'cannot_add_recency_frequency_on_algotrait': {
            message: "You cannot add Recency and Frequency to a trait grouping with an algorithmic trait"
        },
        'segment_must_be_saved': {
            message: "You cannot assign destinations until you save the segment."
        },
        'invalid_expression': {
            message: "The rule you entered in the Segment Expression tag was invalid."
        },
        'complex_rule': {
            message: "The segment expression is too complex to show in the builder view.  Please use the code view to edit this expression."
        },
        'segment_rule_lack_permissions': {
            message: "Sorry, you do not have permissions to view all the traits in this segment."
        },
        'failure': {
            message: "Failure"
        },
        'solr_failure': {
            message: "There was an error contacting the Estimated Historic Segment Size service."
        },
        'cannot_have_recency_wo_frequency': {
            message: "You cannot add recency without frequency.  Please add a frequency."
        },
        'cannot_create_trait_from_model': {
            message: "The model must run at least 1 time successfully with data before a trait can be created using it.  You will be emailed when the model has run successfully."
        },
        'cannot_create_trait_from_model_simple': {
            message: "Sorry, you do not have permissions to create a trait from this model."
        },
        'delete_model': {
            message: "Are you sure you want to delete this model?"
        },
        'delete_models': {
            message: "Are you sure you want to delete these models?"
        },
        'delete_models_invalid': {
            message: "You must select at least 1 model to delete."
        },
        'delete_model_error': {
            message: "Sorry, there was an error deleting the model.  Please try again"
        },
        'model_has_not_run': {
            message: 'The model has not yet run or produced no data.'
        },
        'model_has_no_data': {
            message: 'No data.'
        },
        'model_max_reach_exceeded': {
            message: 'All model values exceed maximum reach value, please review the configuration.'
        },
        'model_run_once': {
            message: 'You have selected a model that has not run at least once.'
        },
        'cannot_delete_entity_with_mappings': {
            message: "There are traits using this model.  Please delete the traits and try again."
        },
        'influential_traits_nodata': {
            message: 'The model has not yet run or produced no data.'
        },
        'model_status_error': {
            message: "There was an error changing the status.  Please try again."
        },
        'model_list_page_problem': {
            message: "There was a problem loading this page.  Please try again."
        },
        models_cannot_be_deleted: {
            message: "The following models cannot be deleted: "
        },
        models_cannot_be_deleted_no_permissions: {
            message: "You do not have permissions to delete any of these models"
        },
        'error_in_model_bulk_delete': {
            message: "There was a problem trying to delete the selected models.  Please try again."
        },
        algo_trait_no_model_permissions: {
            message: "Sorry, you do not have permissions to clone this trait."
        },
        'algotrait_no_model_selected': {
            message: "Please select a model"
        },
        algotrait_loading_error: {
            message: "There was a problem loading this trait.  Please try again."
        },
        algotrait_deleted: {
            message: 'Algorithmic Trait deleted!'
        },
        unexpected_error: {
            message: "There was an unexpected error.  Please try again."
        },
        trait_created: {
            message: "The trait has been created"
        },
        delete_trait: {
            message: "Are you sure you want to delete this trait?"
        },
        delete_traits: {
            message: "Are you sure you want to delete these traits?"
        },
        'error_in_trait_bulk_delete': {
            message: "There was a problem trying to delete the selected traits.  Please try again."
        },
        trait_deleted: {
            message: "Trait deleted!"
        },
        traits_cannot_be_deleted: {
            message: "The following trait cannot be deleted: "
        },
        traits_cannot_be_deleted_no_permissions: {
            message: "You do not have permissions to delete one or more of these traits"
        },
        no_trait_rule: {
            message: "No rules to display"
        },
        general_trait_problem: {
            message: "Sorry, this trait could not be loaded."
        },
        max_reach_audience_size: {
            message: 'Algorithmic Traits cannot include an audience size of over %%num%% unique visitors. Please select a lower reach or higher accuracy setting.',
            makeMessage: function(n) {
                return this.message.replace("%%NUM%%", ADOBE.AM.UTILS.HELPERS.formatNumber(n));
            }
        },
        no_valid_model_run_values: {
            message: 'All audience sizes from this run are greater than the current max audience size of %%NUM%%.  Please select a different model.',
            makeMessage: function(n) {
                return this.message.replace("%%NUM%%", ADOBE.AM.UTILS.HELPERS.formatNumber(n));
            }
        },
        access_denied_no_create_trait_permission_with_data_provider: {
            message: 'You do not have permissions to create an algorithmic trait with this data provider.'
        },
        access_denied_no_read_trait_permission_with_data_provider: {
            message: 'You do not have permissions to view this algorithmic trait with this data provider.'
        },
        access_denied_no_edit_trait_permission_with_data_provider: {
            message: 'You do not have permissions to edit this algorithmic trait with this data provider.'
        },
        access_denied_no_delete_trait_permission_with_data_provider: {
            message: 'You do not have permissions to delete this algorithmic trait with this data provider.'
        },
        access_denied_no_edit_permissions_for_segment: {
            message: "You do not have permissions to edit this component of the segment"
        },
        trait_error_1: {
            message: "The Key must start with a letter or quotation."
        },
        trait_error_2: {
            message: 'The Key can only contain letters, numbers, ", -, and _.'
        },
        trait_error_3: {
            message: 'Any quotes (") have to be escaped with a pair of quotes (""").'
        },
        trait_error_4: {
            message: "For rules containing > or < operators, Value must be numeric only."
        },
        trait_error_5: {
            message: "An Operator must be selected"
        },
        trait_error_6: {
            message: "The Value cannot be blank"
        },
        trait_error_7: {
            message: "You must add quotes around keys with spaces."
        },
        trait_error_8: {
            message: "You must add a quotes around the entire key."
        },
        trait_error_9: {
            message: "You can only have 2 quotes and they must be at the beginning and end of the key."
        },
        no_results: {
            message: "No results."
        },
        trait_expression_valid: {
            message: "Valid Expression"
        },
        trait_expression_invalid: {
            message: "Invalid expression"
        },
        trait_tab_expression: {
            message: "Expression Builder"
        },
        trait_tab_code: {
            message: "Code View"
        },
        trait_test_url_header_invalid_url: {
            message: 'Invalid URL - Please use a valid URL starting with: <br /> http://'
        },
        trait_test_url_header_invalid_fields: {
            message: 'Invalid URL/Header - Please enter a URL and/or Headers to test against'
        },
        trait_test_url_header_event_test: {
            message: "Event Test"
        },
        trait_test_url_header_event_test_would_exhibit: {
            message: "Site visitor with this event would exhibit this trait."
        },
        trait_test_url_header_event_test_would_not_exhibit: {
            message: "Site visitor with this event would not exhibit this trait."
        },
        no_datasources_to_create_trait: {
            message: "Sorry, you cannot create a trait because you do not have access to any Data Sources."
        },
        trait_get_pixel_url: {
            message: 'The URLs and tags for the pixel:<br /><br /><b>URL:</b><br /><input type="text" id="__trait_url" value="" size="40"/><br />' + '<b>Secure URL:</b><br /><input type="text" id="__trait_secure_url" value="" size="40"/><br />' + '<b>Image Tag:</b><br /><input type="text" id="__trait_img_tag" value="" size="40"/><br />' + '<b>Image Tag Secure:</b><br /><input type="text" id="__trait_img_secure_tag" value="" size="40"/><br />'
        },
        trait_no_model_selected: {
            message: "Please select a single trait"
        },
        traits_no_model_selected: {
            message: "Please select a trait or traits"
        },
        traits_no_selected: {
            message: "Please select a trait or traits"
        },
        cannot_create_model_with_trait: {
            message: "Sorry, you do not have permissions to create models with this trait."
        },
        cannot_create_model_with_segment: {
            message: "Sorry, you do not have permissions to create models with this segment."
        },
        too_many_traits_selected: {
            message: "Please select only one trait."
        },
        too_many_segments_selected: {
            message: "Please select only one segment."
        },
        select_one_segment: {
            message: "Please select one segment."
        },
        clone_copy_of: {
            message: "Copy of "
        },
        trait_type_not_found: {
            message: "You cannot create this trait.  Please try again."
        },
        trait_edit_page_cannot_edit: {
            message: "You cannot edit this trait.  Please choose another trait."
        },
        trait_edit_error_loading_model: {
            message: "There was an error loading the model.  Please refresh and try again."
        },
        generic_404: {
            message: "There was an error loading a resource. Please refresh and try again."
        },
        segment_added_to_destination: {
            message: "The segments have been added to the destination."
        },
        segment_cannot_clone: {
            message: "Sorry, you do not have permissions to clone this trait."
        },
        destinations_permission_missing_view: {
            message: "You do not have permissions to view this section"
        },
        segments_permission_missing_view: {
            message: "You do not have permissions to view this section"
        },
        user_delete_confirmation: {
            message: 'Are you sure you want to delete this user?'
        },
        user_permissions_delete_user: {
            message: 'Delete User'
        },
        user_permissions_delete_users: {
            message: 'Delete Users'
        },
        user_permissions_delete_user_empty: {
            message: "You must select at least 1 user to delete"
        },
        user_permissions_user_deleted: {
            message: "User Deleted"
        },
        user_permissions_user_deleted_message: {
            message: "The user has been deleted"
        },
        user_deleted_error: {
            message: "The user(s) could not be deleted"
        },
        group_delete_confirmation: {
            message: 'Are you sure you want to delete this group?'
        },
        group_permissions_delete_group: {
            message: 'Delete Group'
        },
        group_permissions_delete_groups: {
            message: 'Delete Groups'
        },
        group_permissions_delete_group_empty: {
            message: "You must select at least 1 group to delete"
        },
        group_permissions_group_deleted: {
            message: "Group Deleted"
        },
        group_permissions_group_deleted_message: {
            message: "The group has been deleted"
        },
        group_deleted_error: {
            message: "The group(s) could not be deleted"
        },
        group_permissions_add_object: {
            message: "Add Object Permissions"
        },
        change_password: {
            message: 'Change Password'
        },
        change_password_prompt: {
            message: 'Do you want to reset the users password?'
        },
        change_password_problem: {
            message: 'There was a problem resetting the password'
        },
        change_password_success: {
            message: 'The password has been reset'
        },
        models: {
            message: 'Models'
        },
        reports: {
            message: 'Reports'
        },
        trait: {
            message: 'Trait'
        },
        segment: {
            message: 'Segment'
        },
        destination: {
            message: 'Destination'
        },
        derived_signals: {
            message: 'Derived Signals'
        },
        tags: {
            message: 'Tags'
        },
        view_tags: {
            message: 'View Tags'
        },
        view_derived_signals: {
            message: 'View Derived Signals'
        },
        create_derived_signals: {
            message: 'Create Derived Signals'
        },
        edit_derived_signals: {
            message: 'Edit Derived Signals'
        },
        delete_derived_signals: {
            message: 'Delete Derived Signals'
        },
        delete_all_traits: {
            message: 'Delete All Traits'
        },
        create_all_traits: {
            message: 'Create All Traits'
        },
        create_all_algo_traits: {
            message: 'Create All Algo Traits'
        },
        edit_all_traits: {
            message: 'Edit All Traits'
        },
        map_all_to_segments: {
            message: 'Map All To Segments'
        },
        map_all_traits_to_models: {
            message: 'Map All Traits To Models'
        },
        view_all_traits: {
            message: 'View All Traits'
        },
        view_all_destinations: {
            message: 'View All Destinations'
        },
        delete_all_destinations: {
            message: 'Delete All Destinations'
        },
        edit_all_destinations: {
            message: 'Edit All Destinations'
        },
        map_all_segments_to_models: {
            message: 'Map All Segments To Models'
        },
        delete_all_segments: {
            message: 'Delete All Segments'
        },
        edit_all_segments: {
            message: 'Edit All Segments'
        },
        map_all_to_destinations: {
            message: 'Map All To Destinations'
        },
        create_all_segments: {
            message: 'Create All Segments'
        },
        view_all_segments: {
            message: 'View All Segments'
        },
        bid_manager_destination_1_segment: {
            message: "You can only map 1 segment to this type of destination"
        },
        bid_manager_duplicate_userlist: {
            message: "This Google Bid Manager destination has already been mapped to a segment"
        },
        google_user_list_validation_error: {
            message: "There was a problem mapping this Google Bid Manager destination to this segment"
        },
        google_user_list_service_not_reachable: {
            message: "The Google Bid Manager service is not reachable"
        },
        datasource_saved: {
            message: 'The data source was saved successfully.'
        },
        datasource_delete_confirmation: {
            message: 'Are you sure you want to delete this data source?'
        },
        datasource_permissions_delete_datasource: {
            message: 'Delete Data Source'
        },
        datasource_permissions_delete_datasources: {
            message: 'Delete Data Sources'
        },
        datasource_permissions_delete_datasource_empty: {
            message: "You must select at least 1 data source to delete"
        },
        datasource_permissions_datasource_deleted: {
            message: "Data Source Deleted"
        },
        datasource_permissions_datasource_deleted_message: {
            message: "The data source has been deleted"
        },
        datasource_deleted_error: {
            message: "The data source(s) could not be deleted"
        },
        resource_limit_exceeded: {
            message: "The resource limit was exceeded. Please check the Limits page for your resource limit."
        },
        no_dcs_event_call_data_returned: {
            message: "Please check if third party cookies are enabled on your browser.<br />Safari, in particular, disables third party cookies by default.<br />This functionality will also not work if you are using ad blocking software."
        },
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    getMessage: function(errorCode, localization) {
        return this[localization || 'en_US'][errorCode.toLowerCase()];
    },
    getAPIErrorMessage: function(response, options) {
        var finalMessage = '';
        var defaultErrorMessage = this.getMessage('generic_api_error').message;
        var joinChildMessagesOn = '<br />';
        if (options !== Object(options)) {
            options = {};
        }
        if (response !== Object(response)) {
            response = {};
        }
        if (typeof options.joinChildMessagesOn === 'string') {
            joinChildMessagesOn = options.joinChildMessagesOn;
        }
        if (typeof options.defaultErrorMessage === 'string') {
            defaultErrorMessage = options.defaultErrorMessage;
        }
        if (Array.isArray(response.childMessages)) {
            return response.childMessages.join(joinChildMessagesOn);
        }
        var responseText = JSON.parse(response.responseText || '{}');
        if (Array.isArray(responseText.childMessages)) {
            return responseText.childMessages.join(joinChildMessagesOn);
        }
        var data = response.data;
        if (data !== Object(data)) {
            data = {};
        }
        var key = response.code || data.code || responseText.code || '';
        if (typeof options.codePrefix === 'string') {
            key = options.codePrefix + key;
        }
        var dictionary = this.getMessage(key) || {};
        return dictionary.message || response.message || data.message || responseText.message || defaultErrorMessage;
    }
};
ADOBE.AM.PERMS = {
    permissions: {
        traits: {
            map_to_segments: 'MAP_TO_SEGMENTS',
            view: 'READ'
        },
        user: {
            create_destinations: 'CREATE_DESTINATIONS',
            create_all_destinations: 'CREATE_ALL_DESTINATIONS',
            edit_destinations: 'EDIT_DESTINATIONS',
            edit_all_destinations: 'EDIT_ALL_DESTINATIONS'
        },
        destinations: {
            write: 'WRITE'
        }
    },
    permission_schemes: {
        can_view_traits: {
            UserPermission: ['VIEW_TRAITS']
        },
        can_create_trait: {
            UserPermission: ['CREATE_TRAITS', 'CREATE_ALL_TRAITS'],
            DataSourcePermission: ['CREATE'],
            TraitPermission: ['CREATE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                var trait_permission = perm_object.getPermissionObjects('TraitPermission');
                if (!(user_permission && user_permission.hasPermission('CREATE_TRAITS'))) {
                    return false;
                }
                return user_permission.hasPermission('CREATE_ALL_TRAITS') || (datasource_permission && datasource_permission.hasPermission('CREATE')) || (trait_permission && trait_permission.hasPermission('CREATE'));
            }
        },
        can_edit_trait: {
            UserPermission: ['EDIT_TRAITS', 'EDIT_ALL_TRAITS'],
            TraitPermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var trait_permission = perm_object.getPermissionObjects('TraitPermission');
                return trait_permission && trait_permission.hasPermission('WRITE');
            }
        },
        can_use_dataprovider_to_edit_trait: {
            UserPermission: ['EDIT_TRAITS', 'EDIT_ALL_TRAITS'],
            DataSourcePermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission && !user_permission.hasPermission('EDIT_TRAITS')) {
                    return false;
                } else if (user_permission && user_permission.hasPermission('EDIT_ALL_TRAITS') || (datasource_permission && datasource_permission.hasPermission('WRITE'))) {
                    return true;
                }
                return false;
            }
        },
        can_delete_trait: {
            UserPermission: ['DELETE_TRAITS', 'DELETE_ALL_TRAITS'],
            TraitPermission: ['DELETE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var trait_permission = perm_object.getPermissionObjects('TraitPermission');
                return trait_permission && trait_permission.hasPermission('DELETE');
            }
        },
        can_show_delete_toolbar_button_in_traitbuilder: {
            UserPermission: ['DELETE_TRAITS']
        },
        can_delete_this_trait_in_traitbuilder: {
            TraitPermission: ['DELETE']
        },
        can_show_add_segment_toolbar_button_in_traitbuilder: {
            UserPermission: ['CREATE_SEGMENTS']
        },
        can_clone_rule_based_trait_in_traitbuilder: {
            UserPermission: ['CREATE_TRAITS', 'CREATE_ALL_TRAITS'],
            TraitPermission: ['CREATE'],
            permissionCheck: function(perm_object) {
                var user_create = this.UserPermission[0];
                var user_create_all = this.UserPermission[1];
                var datasource_create = this.TraitPermission[0];
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('TraitPermission');
                if (user_permission && !user_permission.hasPermission(user_create)) {
                    return false;
                } else if (user_permission && user_permission.hasPermission(user_create_all) || datasource_permission && datasource_permission.hasPermission(datasource_create)) {
                    return true;
                }
                return false;
            }
        },
        can_clone_algo_trait_in_traitbuilder: {
            UserPermission: ['CREATE_TRAITS', 'CREATE_ALL_TRAITS'],
            TraitPermission: ['CREATE', 'CREATE_ALGO_TRAITS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var trait_permission = perm_object.getPermissionObjects('TraitPermission');
                if (user_permission && !user_permission.hasPermission('CREATE_TRAITS')) {
                    return false;
                } else if (user_permission && user_permission.hasPermission('CREATE_ALL_TRAITS') || (trait_permission && trait_permission.hasPermission('CREATE') && trait_permission && trait_permission.hasPermission("CREATE_ALGO_TRAITS"))) {
                    return true;
                }
                return false;
            }
        },
        can_use_dataprovider_to_create_trait: {
            DataSourcePermission: ['CREATE']
        },
        can_create_trait_in_traitbuilder: {
            UserPermission: ['CREATE_TRAITS', 'CREATE_ALL_TRAITS'],
            DataSourcePermission: ['CREATE'],
            permissionCheck: function(perm_object) {
                var user_create = this.UserPermission[0];
                var user_create_all = this.UserPermission[1];
                var datasource_create = this.DataSourcePermission[0];
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission && !user_permission.hasPermission(user_create)) {
                    return false;
                } else if (user_permission && user_permission.hasPermission(user_create_all) || datasource_permission && datasource_permission.hasPermission(datasource_create)) {
                    return true;
                }
                return false;
            }
        },
        can_create_model_with_selected: {
            UserPermission: ['CREATE_MODELS'],
            DataSourcePermission: ['MAP_TO_MODELS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (!(user_permission && user_permission.hasPermission('CREATE_MODELS'))) {
                    return false;
                }
                return datasource_permission && datasource_permission.hasPermission('MAP_TO_MODELS');
            }
        },
        can_edit_derived_signals: {
            UserPermission: ['EDIT_DERIVED_SIGNALS']
        },
        can_delete_derived_signals: {
            UserPermission: ['DELETE_DERIVED_SIGNALS']
        },
        can_view_model: {
            ModelPermission: ['CREATE_ALGO_TRAITS', 'READ']
        },
        can_clone_model: {
            UserPermission: ['CREATE_MODELS'],
            ModelPermission: ['CREATE', 'READ'],
            permissionCheck: function(perm_object) {
                var user_create = this.UserPermission[0];
                var model_create = this.ModelPermission[0];
                var model_read = this.ModelPermission[1];
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var model_permission = perm_object.getPermissionObjects('ModelPermission');
                if (user_permission && !user_permission.hasPermission(user_create)) {
                    return false;
                } else if (model_permission && model_permission.hasPermission(model_create) && model_permission.hasPermission(model_read)) {
                    return true;
                }
                return false;
            }
        },
        can_pause_play_model: {
            UserPermission: ['EDIT_MODELS'],
            ModelPermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var model_permission = perm_object.getPermissionObjects('ModelPermission');
                if (user_permission && !user_permission.hasPermission('EDIT_MODELS')) {
                    return false;
                } else if (model_permission && model_permission.hasPermission('WRITE')) {
                    return true;
                }
                return false;
            }
        },
        can_edit_model: {
            UserPermission: ['EDIT_MODELS'],
            ModelPermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var model_permission = perm_object.getPermissionObjects('ModelPermission');
                if (user_permission && !user_permission.hasPermission('EDIT_MODELS')) {
                    return false;
                } else if (model_permission && model_permission.hasPermission('WRITE')) {
                    return true;
                }
                return false;
            }
        },
        can_delete_single_model: {
            UserPermission: ['DELETE_MODELS'],
            ModelPermission: ['DELETE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var model_permission = perm_object.getPermissionObjects('ModelPermission');
                if (user_permission && !user_permission.hasPermission('DELETE_MODELS')) {
                    return false;
                } else if (model_permission && model_permission.hasPermission('DELETE')) {
                    return true;
                }
                return false;
            }
        },
        can_delete_model: {
            UserPermission: ['DELETE_MODELS'],
            DataSourcePermission: ['MAP_TO_MODELS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission && !user_permission.hasPermission('DELETE_MODELS')) {
                    return false;
                } else if (datasource_permission && datasource_permission.hasPermission('MAP_TO_MODELS')) {
                    return true;
                }
                return false;
            }
        },
        can_create_model: {
            UserPermission: ['CREATE_MODELS'],
            DataSourcePermission: ['MAP_TO_MODELS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission && !user_permission.hasPermission('CREATE_MODELS')) {
                    return false;
                } else if (datasource_permission && datasource_permission.hasPermission('MAP_TO_MODELS')) {
                    return true;
                }
                return false;
            }
        },
        can_create_trait_with_current_model: {
            ModelPermission: ['CREATE_ALGO_TRAITS']
        },
        can_view_destinations: {
            UserPermission: 'VIEW_DESTINATIONS'
        },
        can_edit_destination: {
            DestinationPermission: ['WRITE'],
            UserPermission: ['EDIT_DESTINATIONS', 'EDIT_ALL_DESTINATIONS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var destination_permission = perm_object.getPermissionObjects('DestinationPermission');
                if (user_permission && user_permission.hasPermission('EDIT_DESTINATIONS') && user_permission.hasPermission('EDIT_ALL_DESTINATIONS')) {
                    return true;
                } else if (user_permission && destination_permission && user_permission.hasPermission('EDIT_DESTINATIONS') && destination_permission.hasPermission('WRITE')) {
                    return true;
                }
                return false;
            }
        },
        can_delete_destination: {
            DestinationPermission: ['DELETE'],
            UserPermission: ['DELETE_DESTINATIONS', 'DELETE_ALL_DESTINATIONS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var destination_permission = perm_object.getPermissionObjects('DestinationPermission');
                if (!(user_permission && user_permission.hasPermission('DELETE_DESTINATIONS'))) {
                    return false;
                }
                if ((user_permission && user_permission.hasPermission('DELETE_ALL_DESTINATIONS')) || (destination_permission && destination_permission.hasPermission('DELETE'))) {
                    return true;
                }
                return false;
            }
        },
        can_use_dataprovider_to_create_segment: {
            DataSourcePermission: ['CREATE']
        },
        can_use_dataprovider_to_edit_segment: {
            UserPermission: ['EDIT_SEGMENTS', 'EDIT_ALL_SEGMENTS'],
            DataSourcePermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission && !user_permission.hasPermission('EDIT_SEGMENTS')) {
                    return false;
                }
                if (user_permission && user_permission.hasPermission('EDIT_ALL_SEGMENTS') || (datasource_permission && datasource_permission.hasPermission('WRITE'))) {
                    return true;
                }
                return false;
            }
        },
        can_edit_segment_in_segmentbuilder: {
            UserPermission: ['EDIT_SEGMENTS', 'EDIT_ALL_SEGMENTS'],
            SegmentPermission: ['WRITE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var segment_permission = perm_object.getPermissionObjects('SegmentPermission');
                if (user_permission && !user_permission.hasPermission('EDIT_SEGMENTS')) {
                    return false;
                }
                if (user_permission && user_permission.hasPermission('EDIT_ALL_SEGMENTS') || (segment_permission && segment_permission.hasPermission('WRITE'))) {
                    return true;
                }
                return false;
            }
        },
        can_create_segment_in_segmentbuilder: {
            UserPermission: ['CREATE_ALL_SEGMENTS', 'CREATE_SEGMENTS'],
            DataSourcePermission: ['CREATE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var datasource_permission = perm_object.getPermissionObjects('DataSourcePermission');
                if (user_permission.hasPermission('CREATE_ALL_SEGMENTS')) {
                    return true;
                } else if (user_permission && datasource_permission && user_permission.hasPermission('CREATE_SEGMENTS') && datasource_permission.hasPermission('CREATE')) {
                    return true;
                }
                return false;
            }
        },
        can_view_segments: {
            UserPermission: ['VIEW_SEGMENTS']
        },
        can_clone_segment_in_segmentbuilder: {
            UserPermission: ['CREATE_SEGMENTS', 'CREATE_ALL_SEGMENTS'],
            SegmentPermission: ['CREATE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var segment_permission = perm_object.getPermissionObjects('SegmentPermission');
                if (user_permission && !user_permission.hasPermission('CREATE_SEGMENTS')) {
                    return false;
                }
                if (user_permission.hasPermission('CREATE_ALL_SEGMENTS') || (segment_permission && segment_permission.hasPermission('CREATE'))) {
                    return true;
                }
                return false;
            }
        },
        can_map_trait_to_segment_in_segmentbuilder: {
            UserPermission: ['VIEW_TRAITS', 'MAP_ALL_TO_SEGMENTS']
        },
        can_delete_segment_in_segmentbuilder: {
            UserPermission: ['DELETE_SEGMENTS', 'DELETE_ALL_SEGMENTS'],
            SegmentPermission: ['DELETE'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var segment_permission = perm_object.getPermissionObjects('SegmentPermission');
                if (!user_permission.hasPermission('DELETE_SEGMENTS')) {
                    return false;
                }
                if (user_permission.hasPermission('DELETE_ALL_SEGMENTS')) {
                    return true;
                }
                if (segment_permission && segment_permission.hasPermission('DELETE')) {
                    return true;
                }
                return false;
            }
        },
        can_show_segment_to_destination_in_sb_toolbar_buttons: {
            UserPermission: ['VIEW_DESTINATIONS']
        },
        can_map_segment_to_destination_in_segmentbuilder: {
            UserPermission: ['VIEW_DESTINATIONS', 'VIEW_SEGMENTS', 'VIEW_ALL_SEGMENTS', 'MAP_ALL_TO_DESTINATIONS'],
            SegmentPermission: ['READ', 'MAP_TO_DESTINATIONS'],
            permissionCheck: function(perm_object) {
                var user_permission = perm_object.getPermissionObjects('UserPermission');
                var segment_permission = perm_object.getPermissionObjects('SegmentPermission');
                if (!user_permission.hasPermission('VIEW_DESTINATIONS')) {
                    return false;
                }
                if (!user_permission.hasPermission('VIEW_SEGMENTS')) {
                    return false;
                }
                if (!(user_permission.hasPermission('VIEW_ALL_SEGMENTS') || segment_permission && segment_permission.hasPermission('READ'))) {
                    return false;
                }
                if (!(user_permission.hasPermission('MAP_ALL_TO_DESTINATIONS') || segment_permission && segment_permission.hasPermission('MAP_TO_DESTINATIONS'))) {
                    return false;
                }
                return true;
            }
        },
        can_create_datasources_in_toolbar: {
            UserPermission: ['CREATE_DATASOURCES']
        },
        can_edit_datasources_in_toolbar: {
            UserPermission: ['EDIT_DATASOURCES']
        },
        can_delete_datasources_in_toolbar: {
            UserPermission: ['DELETE_DATASOURCES']
        }
    }
};
(function($) {
    $.fn.serializeJSON = function() {
        var json = {};
        jQuery.map($(this).serializeArray(), function(n, i) {
            json[n['name']] = n['value'];
        });
        return json;
    };
})(jQuery);
(function($) {
    $.whenAlways = function() {
        var num, loaded = [],
            $deferred = $.Deferred();
        if (arguments.length == 1 && arguments[0].length) {
            arguments = arguments[0];
        }
        num = arguments.length;
        for (var i = 0; i < num; i++) {
            loaded[i] = false;
        }
        for (var i = 0; i < num; i++) {
            (function() {
                $.when(arguments[i]).always(function() {
                    loaded[i] = true;
                    checkLoaded();
                });
            })();
        }

        function checkLoaded() {
            for (var i = 0; i < num; i++) {
                if (!loaded[i]) {
                    return false;
                }
                if (i == num - 1) {
                    $deferred.resolve();
                }
            }
        }
        return $deferred;
    };
})(jQuery);
window.getTemplate = window.getTemplate || function(id, templateSrc, dataObj) {
    if (typeof window.getTemplate.cache == 'undefined') {
        window.getTemplate.cache = {
            nodeStore: {},
            templates: {},
            getFromCache: function(id, templateSrc) {
                var src, match;
                if (this.nodeStore[templateSrc]) {
                    src = this.nodeStore[templateSrc];
                } else {
                    src = this.setSourceCache(templateSrc);
                }
                if (!this.templates[id]) {
                    _.each(src.childNodes, function(node) {
                        if (node.nodeName != 'SCRIPT') {
                            src.removeChild(node);
                        }
                    });
                    match = (_.filter(src.childNodes, function(node) {
                        if (node.id != id) {
                            return false;
                        } else {
                            src.removeChild(node);
                            return node;
                        }
                    }))[0];
                    this.setTemplateCache(id, match.innerHTML);
                }
                return this.templates[id];
            },
            setSourceCache: function(templateSrc) {
                var div = document.createElement('div');
                div.innerHTML = templateSrc;
                this.nodeStore[templateSrc] = div;
                return div;
            },
            setTemplateCache: function(id, template) {
                this.templates[id] = template;
            }
        }
    }
    var template = getTemplate.cache.getFromCache(id, templateSrc),
        doCompile = true;
    if (!dataObj) {
        doCompile = true;
    } else {
        if (dataObj.compile == true || typeof dataObj.compile == 'undefined') {
            doCompile = true;
        } else if (dataObj.compile == false) {
            doCompile = false;
            delete dataObj.compile;
        }
    }
    return doCompile ? _.template(template, dataObj) : template;
};
(function() {
    'use strict';
    var ngCoral = angular.module('ngCoral', ['ngCoral-templates']);
    ngCoral.directive('cuiCollectionHost', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
                this.handleChildAddition = function(element) {
                    if ($.isFunction($scope.handleChildAddition)) {
                        $scope.handleChildAddition(element);
                    }
                };
                this.handleChildRemoval = function(element) {
                    if ($.isFunction($scope.handleChildRemoval)) {
                        $scope.handleChildRemoval(element);
                    }
                };
            }]
        };
    });
    ngCoral.directive('cuiCollectionItem', function() {
        return {
            restrict: 'A',
            require: '^cuiCollectionHost',
            link: function(scope, element, attrs, ctrl, transclude) {
                ctrl.handleChildAddition(element);
                scope.$on('$destroy', function() {
                    ctrl.handleChildRemoval(element);
                });
            }
        };
    });
    ngCoral.directive('cuiDeepField', function() {
        return {
            restrict: 'E',
            replace: true,
            template: '<span></span>',
            link: function(scope, element, attrs) {
                var all_fields = attrs.object;
                var fields = attrs.field || '';
                if (fields) {
                    all_fields += '.' + fields;
                }
                scope.$watch(all_fields, function(value) {
                    element.text(value);
                });
            }
        };
    });
    ngCoral.directive('cuiDeepFieldAttr', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var target = attrs.cuiDeepFieldAttr;
                scope.$watch(target, function(value) {
                    element.text(value);
                });
            }
        };
    });
    ngCoral.constant('ngCoral.MANIFEST', {
        'version': [1, 0, 1],
        'target_cui_version': [2, 3, 0],
        'target_cui_shell_version': [3, 0, 4],
        'target_cui_card_version': [1, 0, 9],
        'target_angular_version': [1, 2, 10],
        'directives': ['cui-accordion', 'cui-alert', 'cui-card-view', 'cui-character-count', 'cui-collapsible', 'cui-cycle-button', 'cui-datepicker', 'cui-modal', 'cui-number-input', 'cui-select', 'cui-select-list', 'cui-shell', 'cui-slider', 'cui-tabs', 'cui-tag-list', 'cui-tooltip', 'cui-wizard', 'data-init']
    });
    var uid = ['0', '0', '0'];

    function nextUid() {
        var index = uid.length;
        var digit;
        while (index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90) {
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
    angular.module('ngCoral-templates', ['cui-accordion/tab-container.tpl.html', 'cui-accordion/tab-content.tpl.html', 'cui-accordion/tab-header.tpl.html', 'cui-accordion/tab-tab.tpl.html', 'cui-alert/template.tpl.html', 'cui-character-count/input.tpl.html', 'cui-character-count/textarea.tpl.html', 'cui-collapsible/template.tpl.html', 'cui-datepicker/template.tpl.html', 'cui-modal/template.tpl.html', 'cui-number-input/template.tpl.html', 'cui-select-list/item.tpl.html', 'cui-select-list/template.tpl.html', 'cui-select/template.tpl.html', 'cui-slider/template.tpl.html', 'cui-tabs/template.tpl.html', 'cui-tag-list/template.tpl.html', 'cui-wizard/template.tpl.html']);
    angular.module('cui-accordion/tab-container.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-accordion/tab-container.tpl.html', '<ul class="coral-Accordion"></ul>');
    }]);
    angular.module('cui-accordion/tab-content.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-accordion/tab-content.tpl.html', '<div class="coral-Accordion-content"></div>');
    }]);
    angular.module('cui-accordion/tab-header.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-accordion/tab-header.tpl.html', '<h3 class="coral-Accordion-header">\n' + '</h3>');
    }]);
    angular.module('cui-accordion/tab-tab.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-accordion/tab-tab.tpl.html', '<li class="coral-Accordion-item"></li>');
    }]);
    angular.module('cui-alert/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-alert/template.tpl.html', '<div class="coral-Alert coral-Alert--error">\n' + '    <button ng-show="closable" type="button" class="coral-MinimalButton coral-Alert-closeButton" title="Close" data-dismiss="alert">\n' + '        <i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon"></i>\n' + '    </button>\n' + '    <i class="coral-Alert-typeIcon coral-Icon coral-Icon--sizeS coral-Icon--alert"></i>\n' + '    <strong class="coral-Alert-title"></strong>\n' + '    <div class="coral-Alert-message"></div>\n' + '</div>');
    }]);
    angular.module('cui-character-count/input.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-character-count/input.tpl.html', '<span>\n' + '    <input class="coral-Textfield" type="text" ng-model="$value">\n' + '    <span class="coral-CharacterCount" data-init="character-count"></span>\n' + '</span>');
    }]);
    angular.module('cui-character-count/textarea.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-character-count/textarea.tpl.html', '<span>\n' + '    <textarea class="coral-Textfield coral-Textfield--multiline" ng-model="$value" rows="rows" cols="cols"></textarea>\n' + '    <span class="coral-CharacterCount"></span>\n' + '</span>');
    }]);
    angular.module('cui-collapsible/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-collapsible/template.tpl.html', '<div class="coral-Collapsible">\n' + '    <h3 class="coral-Collapsible-header">\n' + '        <span class="coral-Collapsible-title">{{title}}</span>\n' + '        <span class="coral-Collapsible-subtitle">{{subtitle}}</span>\n' + '    </h3>\n' + '    <div class="coral-Collapsible-content" ng-transclude>\n' + '    </div>\n' + '</div>');
    }]);
    angular.module('cui-datepicker/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-datepicker/template.tpl.html', '<div class="coral-Datepicker coral-InputGroup">\n' + '    <input class="coral-InputGroup-input coral-Textfield">\n' + '    <span class="coral-InputGroup-button">\n' + '    <button class="coral-Button coral-Button--secondary coral-Button--square"\n' + '            type="button"\n' + '            title="Datetime Picker">\n' + '        <i class="coral-Icon coral-Icon--sizeS"></i>\n' + '    </button>\n' + '  </span>\n' + '</div>');
    }]);
    angular.module('cui-modal/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-modal/template.tpl.html', '<span>\n' + '    <div class="coral-Modal">\n' + '        <div class="coral-Modal-header">\n' + '            <i class="coral-Modal-typeIcon coral-Icon coral-Icon--sizeS"></i>\n' + '            <h2 class="coral-Modal-title coral-Heading coral-Heading--2"></h2>\n' + '            <button type="button" class="coral-MinimalButton coral-Modal-closeButton" title="Close" data-dismiss="modal">\n' + '                <i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon"></i>\n' + '            </button>\n' + '        </div>\n' + '        <div class="coral-Modal-body"></div>\n' + '        <div class="coral-Modal-footer"></div>\n' + '    </div>\n' + '</span>');
    }]);
    angular.module('cui-number-input/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-number-input/template.tpl.html', '<div class="coral-InputGroup">\n' + '  <span class="coral-InputGroup-button">\n' + '    <button type="button" class="js-coral-NumberInput-decrementButton coral-Button coral-Button--secondary coral-Button--square" title="Decrement">\n' + '        <i class="coral-Icon coral-Icon--sizeS coral-Icon--minus"></i>\n' + '    </button>\n' + '  </span>\n' + '    <input type="text" class="js-coral-NumberInput-input coral-InputGroup-input coral-Textfield">\n' + '  <span class="coral-InputGroup-button">\n' + '    <button type="button" class="js-coral-NumberInput-incrementButton coral-Button coral-Button--secondary coral-Button--square" title="Increment">\n' + '        <i class="coral-Icon coral-Icon--sizeS coral-Icon--add"></i>\n' + '    </button>\n' + '  </span>\n' + '</div>');
    }]);
    angular.module('cui-select-list/item.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-select-list/item.tpl.html', '<li class="coral-SelectList-item coral-SelectList-item--option" role="option" data-value="{{$value}}">{{$label}}</li>');
    }]);
    angular.module('cui-select-list/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-select-list/template.tpl.html', '<ul class="coral-SelectList"></ul>');
    }]);
    angular.module('cui-select/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-select/template.tpl.html', '<span class="coral-Select">\n' + '    <button type="button" class="coral-Select-button coral-MinimalButton">\n' + '          <span class="coral-Select-button-text">{{placeholder}}</span>\n' + '    </button>\n' + '    <select class="coral-Select-select">\n' + '        <option cui-deep-field-attr="{{$parent.composeLabel(option)}}"\n' + '                ng-repeat="option in $options"\n' + '                ng-value="option.$$hashKey || option"\n' + '                >\n' + '        </option>\n' + '    </select>\n' + '</span>');
    }]);
    angular.module('cui-slider/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-slider/template.tpl.html', '<div class="coral-Slider">\n' + '    <fieldset>\n' + '        <legend>{{legend}}</legend>\n' + '        <label>\n' + '            <input type="range">\n' + '        </label>\n' + '        <label>\n' + '            <input type="range">\n' + '        </label>\n' + '    </fieldset>\n' + '</div>');
    }]);
    angular.module('cui-tabs/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-tabs/template.tpl.html', '<div class="coral-TabPanel">\n' + '    <nav class="coral-TabPanel-navigation">\n' + '    </nav>\n' + '    <div class="coral-TabPanel-content">\n' + '    </div>\n' + '</div>');
    }]);
    angular.module('cui-tag-list/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-tag-list/template.tpl.html', '<ul class="coral-TagList"\n' + '    role="list"\n' + '    cui-collection-host>\n' + '    <li class="coral-TagList-tag"\n' + '        role="listitem"\n' + '        cui-collection-item\n' + '        ng-repeat="tag in tags">\n' + '        <button class="coral-MinimalButton coral-TagList-tag-removeButton"\n' + '                type="button"\n' + '                title="Remove">\n' + '            <i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>\n' + '        </button>\n' + '        <cui-deep-field class="coral-TagList-tag-label"\n' + '                        object="tag"\n' + '                        field="{{label}}">\n' + '        </cui-deep-field>\n' + '        <input type="hidden"\n' + '               value="{{$index}}"/>\n' + '    </li>\n' + '</ul>');
    }]);
    angular.module('cui-wizard/template.tpl.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('cui-wizard/template.tpl.html', '<form class="coral-Wizard" ng-transclude></form>');
    }]);
    ngCoral.directive('cuiAccordion', ['$compile', '$templateCache', function($compile, $templateCache) {
        var definition = {
            restrict: 'E',
            scope: {
                tabs: '=',
                active: '=?',
                disabled: '=?'
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
            tTab, tabScopes = [];

        function compile(tElement, tAttrs, transclude) {
            var templates = tElement.children(),
                tHeader = $(TAB_HEADER).html(templates.filter('header').html()),
                tContent = $(TAB_CONTENT).html(templates.filter('content').html()),
                tTabHTML = $(TAB_TAB).append([tHeader, tContent]);
            tTab = $compile(tTabHTML);
            tElement.eq(0).replaceWith($(TAB_CONTAINER));
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
            scope.$watch('active', function(newValue) {
                if (accordion && accordion.get('active') !== newValue) {
                    accordion.setActive(newValue);
                }
            });
            scope.$watch('disabled', function(newValue) {
                if (accordion && accordion.get('disabled') !== newValue) {
                    accordion.set('disabled', newValue);
                }
            });
            scope.$watchCollection('tabs', function() {
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
                tabScopes.forEach(function(scope) {
                    scope.$destroy();
                });
                iElement.children().remove();
            }

            function addTabs() {
                if (angular.isArray(scope.tabs)) {
                    scope.tabs.forEach(function(tab, index) {
                        var tabScope = scope.$new(true);
                        tabScope.$index = index;
                        tabScope.tab = tab;
                        tabScopes.push(tabScope);
                        tTab(tabScope, function(clone) {
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
                scope.$evalAsync(function() {
                    scope.active = accordion.get('active');
                });
            }
        }
        return definition;
    }]);
    ngCoral.directive('cuiAlert', ['$compile', '$templateCache', function($compile, $templateCache) {
        return {
            restrict: 'E',
            scope: {
                heading: '=?',
                content: '=?',
                closable: '=?',
                type: '=?',
                size: '=?',
                visible: '=?'
            },
            template: $templateCache.get('cui-alert/template.tpl.html'),
            replace: true,
            link: function(scope, element) {
                scope.visible = scope.visible === undefined ? true : scope.visible;
                var alert;
                ['heading', 'content', 'closable', 'type', 'size', 'visible'].map(function(property) {
                    scope.$watch(property, function(newValue) {
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
                alert.on('change:visible', function(event) {
                    adjustNgVisible(event.value);
                });
                alert.on('hide', function() {
                    adjustNgVisible(false);
                });

                function adjustNgVisible(value) {
                    if (scope.visible !== value) {
                        scope.$apply(function(value) {
                            scope.visible = value;
                        });
                    }
                }
            }
        };
    }]);
    ngCoral.directive('cuiCardView', ['$compile', function($compile) {
        return {
            restrict: 'E',
            scope: {
                collection: '=',
                itemName: '=?',
                factory: '=?',
                selection: '=?',
                listMode: '=?',
                gridSelectionMode: '=?'
            },
            transclude: true,
            replace: true,
            link: function(scope, element, attrs, ctrl, transclude) {
                var collectionMap = {},
                    cardView;

                function init() {
                    transclude(scope, function(clone) {
                        var header = clone.filter('header:first');
                        if (header.length) {
                            element.append(header);
                        }
                    });
                    element.addClass('grid');
                    CUI.CardView.init(element);
                    cardView = CUI.Widget.fromElement(CUI.CardView, element);
                    scope.itemName = scope.itemName || 'item';
                    scope.$watch('listMode', handleListModeChange);
                    scope.$watch('gridSelectionMode', handleGridSelectionModeChange);
                    scope.$watchCollection('collection', handleCollectionChange);
                    toggleNgSelectionChangeListener(true);
                    toggleCuiSelectionChangeListener(true);
                    cardView.on('item-moved', handleItemMoved);
                }

                function handleListModeChange(listMode) {
                    var newMode = listMode ? CUI.CardView.DISPLAY_LIST : CUI.CardView.DISPLAY_GRID;
                    if (cardView.getDisplayMode() != newMode) {
                        cardView.setDisplayMode(newMode);
                        angular.forEach(collectionMap, function(record) {
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
                    toggleCuiSelectionChangeListener(false);
                    if (newCollection) {
                        var cache = $('<div></div>').append($('article', element));
                        cardView.removeAllItems();
                        var $elements = [];
                        var $toSelect = [];
                        var newCollectionMap = {};
                        newCollection.forEach(function(item, index, count) {
                            var itemHash = hash(item);
                            var record = collectionMap[itemHash];
                            if (record) {
                                delete collectionMap[itemHash];
                            } else {
                                record = {
                                    item: item
                                };
                            }
                            if (!record.scope) {
                                record.scope = scope.$new(true);
                                record.scope[scope.itemName] = item;
                            }
                            if (!record.element) {
                                if ($.isFunction(scope.factory)) {
                                    record.element = $(scope.factory(item, index, count));
                                    $compile(record.element)(record.scope);
                                } else {
                                    transclude(record.scope, function(clone) {
                                        record.element = clone.filter('article:first');
                                    });
                                }
                            }
                            newCollectionMap[itemHash] = record;
                            if (scope.selection && scope.selection.indexOf(item) != -1) {
                                $toSelect.push(record.element);
                            }
                            $elements.push(record.element);
                        });
                        angular.forEach(collectionMap, function(record) {
                            record.scope.$destroy();
                            record.element = null;
                        });
                        collectionMap = newCollectionMap;
                        if ($elements.length) {
                            cardView.append($elements);
                        }
                        cache.remove();
                        cache = null;
                        while ($toSelect.length) {
                            cardView.select($toSelect.pop(), $toSelect.length > 0);
                        }
                    }
                    toggleCuiSelectionChangeListener(true);
                }

                function handleNgSelectionChange(newItems, oldItems) {
                    if (newItems === oldItems) {
                        return;
                    }
                    toggleCuiSelectionChangeListener(false);
                    cardView.clearSelection();
                    var $toSelect = [];
                    newItems.forEach(function(item) {
                        var record = collectionMap[hash(item)];
                        if (record && record.element) {
                            $toSelect.push(record.element);
                        }
                    });
                    while ($toSelect.length) {
                        cardView.select($toSelect.pop(), $toSelect.length > 0);
                    }
                    toggleCuiSelectionChangeListener(true);
                }

                function handleCuiSelectionChange(event) {
                    if (event.moreSelectionChanges) {
                        return;
                    }
                    scope.$evalAsync(function() {
                        var $selection = cardView.getSelection();
                        toggleNgSelectionChangeListener(false);
                        var newSelection = [];
                        $selection.each(function() {
                            var elementScope = $(this).scope();
                            var itemData = elementScope[scope.itemName];
                            if (itemData) {
                                newSelection.push(itemData);
                            }
                        });
                        scope.selection = newSelection;
                        toggleNgSelectionChangeListener(true);
                    });
                }

                function handleItemMoved(event) {
                    if (event.hasMoved) {
                        var oldIndex = getElementDataIndex(event.target);
                        if (oldIndex !== -1) {
                            scope.$evalAsync(function() {
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

                function toggleNgSelectionChangeListener(on) {
                    if (on && scope._removeNgSelectionChangeListener === undefined) {
                        scope._removeNgSelectionChangeListener = scope.$watchCollection('selection', handleNgSelectionChange);
                    } else if ($.isFunction(scope._removeNgSelectionChangeListener)) {
                        scope._removeNgSelectionChangeListener();
                        delete scope._removeNgSelectionChangeListener;
                    }
                }

                function toggleCuiSelectionChangeListener(on) {
                    if (on) {
                        cardView.on('change:selection', handleCuiSelectionChange);
                    } else {
                        cardView.off('change:selection', handleCuiSelectionChange);
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
                    } catch (error) {
                        result = -1;
                    }
                    return result;
                }
                init();
            }
        };
    }]);
    ngCoral.directive('cuiCharacterCount', ['$compile', '$templateCache', function($compile, $templateCache) {
        var definition = {
            restrict: 'E',
            scope: {
                value: '=',
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
                related: iElement.children().get(0)
            });
            scope.$value = scope.value;
            scope.$watch('$value', handleInnerValueChange);
            scope.$watch('value', handleOuterValueChange);
            scope.$watch('maxlength', handleMaxLengthChange);

            function handleOuterValueChange(newValue) {
                if (scope.$value !== newValue) {
                    scope.$value = newValue;
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
    ngCoral.directive('cuiCollapsible', ['$compile', '$templateCache', function($compile, $templateCache) {
        var TEMPLATE = $templateCache.get('cui-collapsible/template.tpl.html');
        var definition = {
            restrict: 'E',
            template: TEMPLATE,
            replace: true,
            transclude: true,
            scope: {
                title: '=?',
                subtitle: '=?',
                active: '=?'
            },
            link: link
        };

        function link(scope, iElement, iAttrs, controller, transcludeFn) {
            scope.active = scope.active === undefined ? true : scope.active;
            var widget = new CUI.Accordion({
                element: iElement,
                active: scope.active
            });
            scope.$watch('active', function(value) {
                widget.setActive(value);
            });
        }
        return definition;
    }]);
    ngCoral.directive('cuiCycleButton', ['$compile', function($compile) {
        var CLASS_ACTIVE = 'is-active';
        var definition = {
            restrict: 'A',
            compile: compile,
            scope: {
                cuiCycleButton: '='
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
            var widget = CUI.CycleButton({
                element: iElement
            });

            function handleOuterActiveChange(outerActive) {
                if (outerActive === undefined) {
                    outerActive = -1;
                }
                var children = iElement.children();
                if (!children.length || outerActive >= children.length) {
                    outerActive = -1;
                }
                if (children.length && outerActive < 0) {
                    outerActive = 0;
                }
                updateInnerActive(outerActive);
            }

            function handleWidgetActiveChange(event) {
                scope.$apply(function() {
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
    ngCoral.directive('cuiDatepicker', ['$compile', '$templateCache', function($compile, $templateCache) {
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
            link: function(scope, iElement, iAttrs, controller, transcludeFn) {
                var widget = setupWidget();
                var input, hiddenInput, ignoreNgValueChange;

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
                    if (options.type === 'time') {
                        icon.addClass('coral-Icon--clock');
                    } else {
                        icon.addClass('coral-Icon--calendar');
                    }
                    iElement.datepicker(removeUndefinedFields(options));
                    hiddenInput = iElement.find('input[type=hidden]').eq(0);
                    scope.$watch('value', ngValueChangeHandler);
                    scope.$watch('hasError', ngHasErrorChangeHandler);
                    scope.$watch('disabled', ngDisabledChangeHandler);
                    return iElement.data('datepicker');
                }

                function ngValueChangeHandler(newValue, oldValue) {
                    if (!ignoreNgValueChange && widget && newValue !== oldValue) {
                        input.val(newValue);
                        widget._readInputVal();
                    }
                }

                function ngHasErrorChangeHandler(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        widget.set('hasError', newValue);
                        widget._updateState();
                    }
                }

                function ngDisabledChangeHandler(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        widget.set('disabled', newValue);
                        widget._updateState();
                    }
                }

                function widgetValueChangeHandler(event) {
                    scope.$apply(function() {
                        ignoreNgValueChange = true;
                        scope.value = hiddenInput.val();
                        ignoreNgValueChange = false;
                    });
                }
            }
        };
    }]);
    ngCoral.directive('cuiModal', ['$compile', '$templateCache', function($compile, $templateCache) {
        var definition = {
            restrict: 'E',
            template: $templateCache.get('cui-modal/template.tpl.html'),
            replace: true,
            transclude: true,
            compile: compile,
            scope: {
                type: '=?',
                buttons: '=?',
                remote: '@?',
                backdrop: '=?',
                visible: '=?'
            }
        };

        function compile(tElement, tAttrs, transclude) {
            return link;
        }

        function link(scope, iElement, iAttrs, controller, transcludeFn) {
            var widget, modal, header, content, template;
            transcludeFn(scope.$parentScope, function(clone) {
                modal = iElement.children('div.coral-Modal').eq(0);
                header = clone.filter('[header=""]').removeAttr('header');
                content = clone.filter('[content=""]').removeAttr('content');
                template = clone.filter('[template=""]').removeAttr('template');
                if (template.length) {
                    modal.replaceWith(template.eq(0));
                    modal = iElement.children('div.coral-Modal').eq(0);
                }
            });
            scope.visible = scope.visible === undefined ? false : scope.visible;
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

            function handleWidgetHide() {
                if (scope.visible) {
                    scope.$apply(function() {
                        scope.visible = false;
                    });
                }
            }

            function handleWidgetShow() {
                if (!scope.visible) {
                    scope.$apply(function() {
                        scope.visible = true;
                    });
                }
            }

            function handleScopeDestroy() {
                modal.remove();
            }
        }
        return definition;
    }]);
    ngCoral.directive('cuiNumberInput', ['$compile', '$templateCache', function($compile, $templateCache) {
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
            link: function(scope, iElement, iAttrs, controller, transcludeFn) {
                var widget, input, options = removeUndefinedFields({
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
                    scope.$evalAsync(function() {
                        scope.value = input.val();
                    });
                }
            }
        };
    }]);
    ngCoral.directive('cuiSelect', ['$compile', '$templateCache', function($compile, $templateCache) {
        var TEMPLATE = $templateCache.get('cui-select/template.tpl.html'),
            definition = {
                restrict: 'E',
                scope: {
                    options: '@',
                    selection: '=?',
                    label: '=?',
                    placeholder: '@',
                    multiple: '@'
                },
                template: TEMPLATE,
                replace: true,
                link: link
            };

        function link(scope, iElement, iAttrs, controller, transcludeFn) {
            var selection;
            scope.$options = [];
            scope.composeLabel = function(option) {
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
                    return false;
                }
            }
            var widget, taglist, pendingReset, unwatchOptions, unwatchSelection;

            function resetWidget(force) {
                if (!pendingReset) {
                    pendingReset = true;
                    scope.$evalAsync(function() {
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
                $('select option', iElement).each(function() {
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
                widget.on('selected', function(event) {
                    scope.$apply(function() {
                        if (scope.multiple) {
                            selection = event.selected.map(getOptionByHashKey);
                        } else {
                            selection = getOptionByHashKey(event.selected);
                        }
                        scope.selection = selection;
                    });
                });
                if (scope.multiple) {
                    taglist = $('.coral-TagList', iElement);
                    taglist.on('itemremoved', function(event) {
                        scope.$evalAsync(function() {
                            scope.selection = selection = widget.getValue().map(getOptionByHashKey);
                        });
                    });
                }
            }

            function unsetWidget() {
                widget.off();
                iElement.removeData('select');
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
                    options.every(function(option) {
                        var key = option.$$hashKey;
                        if (key === undefined && option.toString() === hashKey) {
                            result = option;
                            return false;
                        } else if (key === hashKey) {
                            result = option;
                            return false;
                        }
                        return true;
                    });
                }
                return result;
            }

            function watchOptions() {
                unwatchOptions = scope.$parent.$watchCollection(scope.options, function(newValue) {
                    scope.$options = newValue;
                    resetWidget(true);
                });
            }

            function watchSelection() {
                unwatchSelection = scope.$watchCollection('selection', resetWidget);
            }
            if (scope.multiple) {
                $('select', iElement).attr('multiple', true);
            }
            watchOptions();
            watchSelection();
        }
        return definition;
    }]);
    ngCoral.directive('cuiSelectList', ['$compile', '$templateCache', function($compile, $templateCache) {
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
                    items: '=?',
                    label: '=?',
                    selected: '=?',
                    visible: '=?',
                    type: '=?',
                    multiple: '=?',
                    relatedElement: '=?',
                    autofocus: '=?',
                    autohide: '=?',
                    dataurl: '=?',
                    dataurlformat: '=?',
                    dataadditional: '=?'
                }
            },
            tItem;

        function preLink(scope, iElement, iAttrs, controller, transcludeFn) {
            transcludeFn(function(clone) {
                var template = clone.filter('li');
                if (template.length) {
                    ITEM_TEMPLATE = template.get(0).outerHTML;
                }
                tItem = $compile(ITEM_TEMPLATE);
            });
        }

        function postLink(scope, iElement, iAttrs, controller, transcludeFn) {
            var widget, scopes = [],
                freeScopes = [],
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
                var children = iElement.children();
                iElement.children().off();
                iElement.children().remove();
                if (newItems) {
                    freeScopes = scopes;
                    scopes = [];
                    newItems.forEach(addItem);
                    freeScopes.forEach(function(scope) {
                        scope.$destroy();
                    });
                    freeScopes = [];
                }
            }

            function handleWidgetSelectedEvent(event, data) {
                scope.$apply(function() {
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
                var element = tItem(itemScope, function(clone) {
                    iElement.append(clone);
                });
            }
        }
        return definition;
    }]);
    ngCoral.directive('cuiShell', ['$compile', '$parse', function($compile, $parse) {
        var definition = {
            restrict: 'A',
            replace: true,
            link: link,
            controller: controller
        };

        function link(scope, iElement, iAttrs, controller, transcludeFn) {
            var widget, options = controller.options,
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
                    _options.pageOptions.blackbarOptions = blackBar.options;
                }
                $.extend(_options, options);
                widget = new CUI.Shell(_options);
                CUI.Endor.registry.resolve(CUI.Page, onPageResolved);
            }

            function onPageResolved(page) {
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
            this.attributesToWidgetOptions = function(attributes, knownOptions, scope) {
                var result = {};
                angular.forEach(attributes, function(value, key) {
                    var option = knownOptions[key];
                    if (option) {
                        option.expr = $parse(value);
                        result[key] = option.expr(scope);
                    }
                }, this);
                return result;
            };
            this.bindWidgetOptions = function(options, knownOptions, scope, widget) {
                angular.forEach(options, function(value, key) {
                    var option = knownOptions[key];
                    if ($.isFunction(option.set)) {
                        if (!option.expr.constant) {
                            scope.$watch(option.expr, function(value) {
                                option.set(widget, value);
                            });
                        }
                    }
                }, this);
            };
        }
        return definition;
    }]);
    ngCoral.directive('cuiShellOptions', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
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
    ngCoral.directive('cuiShellMain', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
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
    ngCoral.directive('cuiShellBlackBar', ['$parse', function($parse) {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
            replace: false,
            link: link
        };
        var OPTIONS = {
            title: {
                set: function(widget, value) {
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
    ngCoral.directive('cuiShellOuterRail', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
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
                if (!widget)
                    return;
                controller.bindWidgetOptions(options, OPTIONS, scope, widget);
                content.appendTo(widget.$element);
            }
        }
        return definition;
    });
    ngCoral.directive('cuiShellInnerRail', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
            replace: false,
            link: link
        };
        var OPTIONS = {
            activePanelId: {
                set: function(widget, value) {
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
                if (!widget)
                    return;
                controller.bindWidgetOptions(options, OPTIONS, scope, widget);
                widget.addPanel(content);
            }
        }
        return definition;
    });
    ngCoral.directive('cuiShellActionBar', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
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
                if (!widget)
                    return;
                content.forEach(function() {
                    var options = {
                        right: this.hasClass('cui-right'),
                        text: this.hasClass('cui-is-text')
                    };
                    widget.addItem(this, options);
                });
            }
        }
        return definition;
    });
    ngCoral.directive('cuiShellFooter', function() {
        var definition = {
            restrict: 'E',
            require: '^cui-shell',
            replace: false,
            link: link
        };
        var OPTIONS = {
            copyright: {
                set: function(widget, value) {
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
                if (!widget)
                    return;
                controller.bindWidgetOptions(options, OPTIONS, scope, widget);
                widget.addItem(content);
            }
        }
        return definition;
    });
    ngCoral.directive('cuiSlider', ['$compile', '$templateCache', function($compile, $templateCache) {
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
                label: '&?'
            },
            link: function(scope, iElement, iAttrs, controller, transcludeFn) {
                var labeled = iAttrs.label !== undefined,
                    range = iAttrs.value2 !== undefined,
                    inputs = iElement.find('input'),
                    input1 = inputs.eq(0),
                    input2 = inputs.eq(1),
                    widget, options;
                input1.change(widgetInputChangeHandler);
                if (range) {
                    input2.change(widgetInputChangeHandler);
                } else {
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
                if (labeled) {
                    iElement.addClass('coral-Slider--labeled');
                    var labels = $('<ul></ul>').addClass('coral-Slider-tickLabels');
                    var step = options.step || 1;
                    for (var i = options.min + step; i <= options.max - step; i += step) {
                        var labelText = scope.label({
                            value: i
                        });
                        labels.append($('<li></li>').text(labelText));
                    }
                    iElement.append(labels);
                }
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
                    scope.$apply(function() {
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
    ngCoral.directive('cuiTabs', ['$compile', '$templateCache', function($compile, $templateCache) {
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
            link: function(scope, iElement, iAttrs, controller, transcludeFn) {
                scope.type = scope.type === undefined ? '' : scope.type;
                var tabs = [],
                    widget, options = removeUndefinedFields({
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
                    newTabs.forEach(function(tab, index) {
                        var oldIndex = tabs.indexOf(tab);
                        if (oldIndex === -1) {
                            constructTab(tab, index);
                            tab.id = widget.addItem(tab.options);
                            var widgetTab = getWidgetTabById(tab.id);
                            widgetTab.on('focus', tab, function() {
                                scope.$evalAsync(function() {
                                    scope.active = tab;
                                });
                            });
                        } else {
                            tabs.splice(oldIndex, 1);
                        }
                    });
                    tabs.forEach(function(tab) {
                        var widgetTab = getWidgetTabById(tab.id);
                        widgetTab.off('focus');
                        widget.removeItem(tab.id);
                    });
                    tabs = newTabs.concat();
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
                        transcludeFn(tabScope, function(clone) {
                            options.tabContent = clone.filter('.tab-content').contents();
                            options.panelContent = clone.filter('.panel-content').contents();
                        });
                    }
                }

                function getWidgetTabById(id) {
                    return iElement.children().eq(0).find('a[aria-controls="' + id + '"]');
                }

                function widgetActiveChangeHandler(event) {
                    var index = index;
                    if (index !== -1 && index < tabs.length) {
                        scope.$evalAsync(function() {
                            scope.active = tabs[index];
                        });
                    }
                }
            }
        };
    }]);
    ngCoral.directive('cuiTagList', ['$compile', '$templateCache', function($compile, $templateCache) {
        return {
            restrict: 'E',
            scope: {
                tags: '=?',
                label: '@?'
            },
            template: $templateCache.get('cui-tag-list/template.tpl.html'),
            replace: true,
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                $scope.handleChildAddition = function(element) {
                    resetWidget();
                };
                $scope.handleChildRemoval = function(element) {
                    resetWidget();
                };
                var widget, pendingReset;

                function resetWidget() {
                    if (!pendingReset) {
                        pendingReset = true;
                        $scope.$evalAsync(function() {
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
                    widget.on('itemremoved', function(event) {
                        $scope.$apply(function() {
                            var index = event.value;
                            $scope.tags.splice(index, 1);
                        });
                    });
                }

                function unsetWidget() {
                    widget.off();
                    $element.removeData('tagList');
                }
            }]
        };
    }]);
    ngCoral.directive('cuiTooltip', ['$compile', function($compile) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                cuiTooltip: '&',
                cuiTooltipDisabled: '&'
            },
            link: function(scope, iElement, iAttrs, controller, transcludeFn) {
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
                            iElement.trigger('mouseover.cui-tooltip');
                        } else {
                            update();
                        }
                    }
                }
            }
        };
    }]);
    ngCoral.directive('cuiWizard', ['$compile', '$templateCache', function($compile, $templateCache) {
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
                widget = new CUI.FlexWizard({
                    element: iElement
                });
                widget.on('flexwizard-stepchange', handleFlexWizardStepChange);
            }

            function handleFlexWizardStepChange(event, data) {
                scope.$apply(function() {
                    var element = data[0];
                    scope.step = $(data[0]).index() - 1;
                });
            }
            init();
        }
        return definition;
    }]);
    ngCoral.directive('init', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $element = $(element);
                var selector = attrs.init;
                if (selector === 'collapsible') {
                    CUI.Accordion.init($element);
                } else if (selector) {
                    CUI.Widget.registry.init(selector, $element);
                }
            }
        };
    });
}.call(this));
'use strict';
(function(angular) {
    function transformObject(jsonResult, Constructor) {
        return new Constructor(jsonResult);
    }

    function transformResult(jsonResult, constructor) {
        if (angular.isArray(jsonResult)) {
            var models = [];
            angular.forEach(jsonResult, function(object) {
                models.push(transformObject(object, constructor));
            });
            return models;
        }
        return transformObject(jsonResult, constructor);
    }
    var modelTransformer = function modelTransformer() {
        return {
            transform: transformResult
        };
    };
    angular
        .module('DataServices', [])
        .factory('modelTransformer', modelTransformer);
}(window.angular));
(function(angular) {
    'use strict';
    angular.module('treeControl', [])
        .directive('treecontrol', ['$compile', function($compile) {
            function classIfDefined(cssClass, addClassProperty) {
                if (cssClass) {
                    if (addClassProperty)
                        return 'class="' + cssClass + '"';
                    else
                        return cssClass;
                } else
                    return "";
            }

            function ensureDefault(obj, prop, value) {
                if (!obj.hasOwnProperty(prop))
                    obj[prop] = value;
            }
            return {
                restrict: 'EA',
                require: "treecontrol",
                transclude: true,
                scope: {
                    treeModel: "=",
                    selectedNode: "=?",
                    expandedNodes: "=?",
                    onSelection: "&",
                    onNodeToggle: "&",
                    options: "=?",
                    orderBy: "@",
                    reverseOrder: "@"
                },
                controller: ['$scope', function($scope) {
                    function defaultIsLeaf(node) {
                        return !node[$scope.options.nodeChildren] || node[$scope.options.nodeChildren].length === 0;
                    }

                    function defaultEquality(a, b) {
                        if (a === undefined || b === undefined)
                            return false;
                        a = angular.copy(a);
                        a[$scope.options.nodeChildren] = [];
                        b = angular.copy(b);
                        b[$scope.options.nodeChildren] = [];
                        return angular.equals(a, b);
                    }
                    $scope.options = $scope.options || {};
                    ensureDefault($scope.options, "nodeChildren", "children");
                    ensureDefault($scope.options, "dirSelectable", "true");
                    ensureDefault($scope.options, "injectClasses", {});
                    ensureDefault($scope.options.injectClasses, "ul", "");
                    ensureDefault($scope.options.injectClasses, "li", "");
                    ensureDefault($scope.options.injectClasses, "liSelected", "");
                    ensureDefault($scope.options.injectClasses, "iExpanded", "");
                    ensureDefault($scope.options.injectClasses, "iCollapsed", "");
                    ensureDefault($scope.options.injectClasses, "iLeaf", "");
                    ensureDefault($scope.options.injectClasses, "label", "");
                    ensureDefault($scope.options.injectClasses, "labelSelected", "");
                    ensureDefault($scope.options, "equality", defaultEquality);
                    ensureDefault($scope.options, "isLeaf", defaultIsLeaf);
                    $scope.expandedNodes = $scope.expandedNodes || [];
                    $scope.expandedNodesMap = {};
                    for (var i = 0; i < $scope.expandedNodes.length; i++) {
                        $scope.expandedNodesMap["" + i] = $scope.expandedNodes[i];
                    }
                    $scope.parentScopeOfTree = $scope.$parent;
                    $scope.headClass = function(node) {
                        var liSelectionClass = classIfDefined($scope.options.injectClasses.liSelected, false);
                        var injectSelectionClass = "";
                        if (liSelectionClass && (this.node == $scope.selectedNode))
                            injectSelectionClass = " " + liSelectionClass;
                        if ($scope.options.isLeaf(node))
                            return "tree-leaf" + injectSelectionClass;
                        if ($scope.expandedNodesMap[this.$id])
                            return "tree-expanded" + injectSelectionClass;
                        else
                            return "tree-collapsed" + injectSelectionClass;
                    };
                    $scope.iBranchClass = function() {
                        if ($scope.expandedNodesMap[this.$id])
                            return classIfDefined($scope.options.injectClasses.iExpanded);
                        else
                            return classIfDefined($scope.options.injectClasses.iCollapsed);
                    };
                    $scope.nodeExpanded = function() {
                        return !!$scope.expandedNodesMap[this.$id];
                    };
                    $scope.selectNodeHead = function() {
                        var expanding = $scope.expandedNodesMap[this.$id] === undefined;
                        $scope.expandedNodesMap[this.$id] = (expanding ? this.node : undefined);
                        if (expanding) {
                            $scope.expandedNodes.push(this.node);
                        } else {
                            var index;
                            for (var i = 0;
                                 (i < $scope.expandedNodes.length) && !index; i++) {
                                if ($scope.options.equality($scope.expandedNodes[i], this.node)) {
                                    index = i;
                                }
                            }
                            if (index != undefined)
                                $scope.expandedNodes.splice(index, 1);
                        }
                        if ($scope.onNodeToggle)
                            $scope.onNodeToggle({
                                node: this.node,
                                expanded: expanding
                            });
                    };
                    $scope.selectNodeLabel = function(selectedNode) {
                        if (selectedNode[$scope.options.nodeChildren] && selectedNode[$scope.options.nodeChildren].length > 0 && !$scope.options.dirSelectable) {
                            this.selectNodeHead();
                        } else {
                            if ($scope.selectedNode != selectedNode) {
                                $scope.selectedNode = selectedNode;
                                if ($scope.onSelection)
                                    $scope.onSelection({
                                        node: selectedNode
                                    });
                            }
                        }
                    };
                    $scope.selectedClass = function() {
                        var labelSelectionClass = classIfDefined($scope.options.injectClasses.labelSelected, false);
                        var injectSelectionClass = "";
                        if (labelSelectionClass && (this.node == $scope.selectedNode))
                            injectSelectionClass = " " + labelSelectionClass;
                        return (this.node == $scope.selectedNode) ? "tree-selected" + injectSelectionClass : "";
                    };
                    var template = '<ul ' + classIfDefined($scope.options.injectClasses.ul, true) + '>' +
                        '<li ng-repeat="node in node.' + $scope.options.nodeChildren + ' | orderBy:orderBy:reverseOrder" ng-class="headClass(node)" ' + classIfDefined($scope.options.injectClasses.li, true) + '>' +
                        '<i class="tree-branch-head" ng-class="iBranchClass()" ng-click="selectNodeHead(node)"></i>' +
                        '<i class="tree-leaf-head ' + classIfDefined($scope.options.injectClasses.iLeaf, false) + '"></i>' +
                        '<div class="tree-label ' + classIfDefined($scope.options.injectClasses.label, false) + '" ng-class="selectedClass()" ng-click="selectNodeLabel(node)" tree-transclude></div>' +
                        '<treeitem ng-if="nodeExpanded()"></treeitem>' +
                        '</li>' +
                        '</ul>';
                    return {
                        template: $compile(template)
                    }
                }],
                compile: function(element, attrs, childTranscludeFn) {
                    return function(scope, element, attrs, treemodelCntr) {
                        scope.$watch("treeModel", function updateNodeOnRootScope(newValue) {
                            if (angular.isArray(newValue)) {
                                if (angular.isDefined(scope.node) && angular.equals(scope.node[scope.options.nodeChildren], newValue))
                                    return;
                                scope.node = {};
                                scope.node[scope.options.nodeChildren] = newValue;
                            } else {
                                if (angular.equals(scope.node, newValue))
                                    return;
                                scope.node = newValue;
                            }
                        });
                        scope.$watchCollection('expandedNodes', function(newValue) {
                            var notFoundIds = 0;
                            var newExpandedNodesMap = {};
                            var $liElements = element.find('li');
                            var existingScopes = [];
                            angular.forEach($liElements, function(liElement) {
                                var $liElement = angular.element(liElement);
                                var liScope = $liElement.scope();
                                existingScopes.push(liScope);
                            });
                            angular.forEach(newValue, function(newExNode) {
                                var found = false;
                                for (var i = 0;
                                     (i < existingScopes.length) && !found; i++) {
                                    var existingScope = existingScopes[i];
                                    if (scope.options.equality(newExNode, existingScope.node)) {
                                        newExpandedNodesMap[existingScope.$id] = existingScope.node;
                                        found = true;
                                    }
                                }
                                if (!found)
                                    newExpandedNodesMap[notFoundIds++] = newExNode;
                            });
                            scope.expandedNodesMap = newExpandedNodesMap;
                        });
                        treemodelCntr.template(scope, function(clone) {
                            element.html('').append(clone);
                        });
                        scope.$treeTransclude = childTranscludeFn;
                    }
                }
            };
        }])
        .directive("treeitem", function() {
            return {
                restrict: 'E',
                require: "^treecontrol",
                link: function(scope, element, attrs, treemodelCntr) {
                    treemodelCntr.template(scope, function(clone) {
                        element.html('').append(clone);
                    });
                }
            }
        })
        .directive("treeTransclude", function() {
            return {
                link: function(scope, element, attrs, controller) {
                    if (!scope.options.isLeaf(scope.node)) {
                        angular.forEach(scope.expandedNodesMap, function(node, id) {
                            if (scope.options.equality(node, scope.node)) {
                                scope.expandedNodesMap[scope.$id] = scope.node;
                                scope.expandedNodesMap[id] = undefined;
                            }
                        });
                    }
                    if (scope.options.equality(scope.node, scope.selectedNode)) {
                        scope.selectNodeLabel(scope.node);
                    }
                    scope.transcludeScope = scope.parentScopeOfTree.$new();
                    scope.transcludeScope.node = scope.node;
                    scope.$on('$destroy', function() {
                        scope.transcludeScope.$destroy();
                    });
                    scope.$treeTransclude(scope.transcludeScope, function(clone) {
                        element.empty();
                        element.append(clone);
                    });
                }
            }
        });
})(angular);
'use strict';
if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function() {
            var funcNameRegex = /function\s([^(]{1,})\(/;
            var results = (funcNameRegex).exec((this).toString());
            return (results && results.length > 1) ? results[1].trim() : "";
        },
        set: function(value) {}
    });
}
var app = angular.module('portalApp', ['ngSanitize', 'ui.router', 'ngCoral', 'treeControl', 'DataServices', 'ngTable']);
app
    .config(['$stateProvider', '$httpProvider', '$provide', '$urlRouterProvider', function($stateProvider, $httpProvider, $provide, $urlRouterProvider) {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/portal/common/scripts/adobe_am/reports/dashboard/view.html',
                controller: 'DashboardCtrl as dashCtrl'
            })
            .state('limits', {
                url: '/limits',
                templateUrl: '/portal/common/scripts/adobe_am/limits/view.html',
                controller: 'LimitsCtrl'
            })
            .state('onboarding-status', {
                url: '/onboarding-status',
                templateUrl: '/portal/common/scripts/adobe_am/reports/onboarding/view.html',
                controller: 'OnboardingStatusCtrl'
            })
            .state('onboarding-status.day', {
                url: '/onboarding-status/:dataSourceId/day/:date',
                templateUrl: '/portal/common/scripts/adobe_am/reports/onboarding/day.html'
            })
            .state('outbound-history', {
                url: '/outbound-history',
                templateUrl: '/portal/common/scripts/adobe_am/reports/outbound/view.html',
                controller: 'OutboundHistoryCtrl'
            })
            .state('general-reports', {
                url: '/general-reports',
                templateUrl: '/portal/common/scripts/adobe_am/reports/general/view.html',
                controller: 'GeneralReportCtrl as genReportCtrl',
                resolve: {
                    AllDestinations: ['DestinationService', '$window', '$q', 'PermissionCheckService', function(DestinationService, $window, $q, permissionCheckService) {
                        if (permissionCheckService.canViewDestinations()) {
                            return new DestinationService().getDestinations();
                        }
                        var defer = $q.defer();
                        defer.resolve([]);
                        return defer.promise;
                    }]
                }
            })
            .state('trend-graph', {
                url: '/trend-graph',
                templateUrl: '/portal/common/scripts/adobe_am/reports/trend/graph/view.html',
                controller: 'TrendGraphCtrl as trendGraphCtrl'
            })
            .state('trend-bulk-export', {
                url: '/trend-bulk-export',
                templateUrl: '/portal/common/scripts/adobe_am/reports/trend/bulk-export/view.html',
                controller: 'TrendBulkExportCtrl as trendBulkExportCtrl'
            });
        $urlRouterProvider.otherwise('/dashboard');
        var token = document.querySelector('meta[name=_tk]');
        if (token) {
            token = token.content;
            $httpProvider.defaults.headers.common['AAM-CSRF-Token'] = token;
        }
        $httpProvider.interceptors.push(['$cacheFactory', function($cacheFactory) {
            var lru_cache = $cacheFactory('lruCache', {
                capacity: 100
            });
            var addNoCacheParam = function addNoCacheParam(config) {
                if (config.url.indexOf('.html') !== -1) {
                    return;
                }
                if (typeof config.params === 'undefined') {
                    config.params = {};
                }
                config.params['no-cache'] = true;
            };
            var getFromCache = function getFromCache(config) {
                var etag = lru_cache.get(config.url);
                if (etag !== null) {
                    config.headers['If-Match'] = etag;
                }
            };
            var request_strategies = {
                get: function(config) {
                    addNoCacheParam(config);
                },
                post: function(config) {
                    addNoCacheParam(config);
                },
                put: function(config) {
                    addNoCacheParam(config);
                    getFromCache(config);
                },
                'delete': function(config) {
                    addNoCacheParam(config);
                    getFromCache(config);
                }
            };
            return {
                request: function processRequest(config) {
                    var method = config.method || null;
                    if (method !== null) {
                        method = method.toLowerCase();
                        if (request_strategies.hasOwnProperty(method)) {
                            request_strategies[method](config);
                        }
                    }
                    return config;
                }
            }
        }]);
        $provide.decorator('$q', ['$delegate', function($delegate) {
            var $q = $delegate;
            $q.allComplete = function(promises) {
                if (!angular.isArray(promises)) {
                    throw new Error('$q.allComplete only accepts an array.');
                }
                var deferred = $q.defer();
                var passed = 0;
                var failed = 0;
                var responses = [];
                angular.forEach(promises, function(promise, idx) {
                    promise
                        .then(function(result) {
                            passed++;
                            responses[idx] = result;
                        })
                        .catch(function(result) {
                            failed++;
                            responses[idx] = result;
                        })
                        .finally(function() {
                            if ((passed + failed) === promises.length) {
                                if (failed > 0) {
                                    deferred.reject(responses);
                                } else {
                                    deferred.resolve(responses);
                                }
                            }
                        });
                });
                return deferred.promise;
            };
            return $q;
        }]);
        $provide.decorator("$exceptionHandler", function($delegate, $injector) {
            return function(exception, cause) {
                var $rootScope = $injector.get("$rootScope");
                $rootScope.handleError({
                    message: "Exception",
                    reason: exception
                });
                $delegate(exception, cause);
            };
        });
    }])
    .filter('range', function() {
        return function(input, min, max) {
            min = parseInt(min, 10);
            max = parseInt(max, 10);
            for (var i = min; i <= max; i++) {
                input.push(i);
            }
            return input;
        };
    })
    .run(['$rootScope', 'myModal', function($rootScope, myModal) {
        $rootScope.handleError = function(err) {
            alert('An unexpected error occurred.  Please reload the page and try again.\n\n' + err.reason || '' + '  .');
        };
        var changePageTitle = function(title) {
            $rootScope.pageTitle = 'Adobe AudienceManager | ';
            switch (title) {
                case 'limits':
                    $rootScope.pageTitle += 'Limits';
                    break;
            }
        };
        $rootScope.$on('$stateChangeSuccess', function(evt, state) {
            $rootScope.currentState = state.name;
        });
        $rootScope.$on('error', function(event, data) {
            alert(data);
        });
        $rootScope.modals = {
            loading: false
        };
    }]);
angular
    .module('portalApp')
    .factory('Pagination', [function() {
        var pagingDefaults = {
            page: 0,
            pageSize: 50
        };

        function Pagination(options) {
            if (!angular.isFunction(options.getItemsReference)) {
                throw new Error('getItemsReference needs to be a function');
            }
            this.paginationEnabled = false;
            this.paginatedItems = {
                paging: {
                    page: options && options.page ? options.page : pagingDefaults.page,
                    pageSize: options && options.pageSize ? options.pageSize : pagingDefaults.pageSize
                },
                total: 0,
                numOfPages: 0
            };
            this.getItems = options.getItemsReference;
            this.handleResponse = function handleResponse(resp) {
                this.paginatedItems.total = resp.total;
                this.paginatedItems.numOfPages = Math.ceil(resp.total / resp.pageSize);
                return resp.list;
            };
            this.reset = function reset() {
                this.paginatedItems.paging_data = pagingDefaults;
                this.paginatedItems.total = 0;
                this.paginatedItems.numOfPages = 0;
            };
            this.isPaginationEnabled = function isPaginationEnabled() {
                return !!this.paginationEnabled;
            };
            this.enablePagination = function enablePagination() {
                this.paginationEnabled = true;
            };
            this.nextPage = function nextPage() {
                this.paginatedItems.paging.page++;
            };
            this.prevPage = function prevPage() {
                if (--this.paginatedItems.paging.page === 0) {
                    this.paginatedItems.paging.page = 0;
                }
            };
            this.isPrevPageAvailable = function isPrevPageAvailable() {
                if (!this || !angular.isObject(this.paginatedItems) || !angular.isObject(this.paginatedItems.paging)) {
                    return false;
                }
                return parseInt(this.paginatedItems.paging.page, 10) > 0;
            };
            this.isNextPageAvailable = function isPrevPageAvailable() {
                if (!this || !angular.isObject(this.paginatedItems) || !angular.isObject(this.paginatedItems.paging)) {
                    return false;
                }
                return (parseInt(this.paginatedItems.paging.page, 10) + 1) < parseInt(this.paginatedItems.numOfPages, 10);
            };
            this.getPaging = function getPaging() {
                if (!this || !angular.isObject(this.paginatedItems)) {
                    return 0;
                }
                return this.paginatedItems.paging;
            };
            this.getTotal = function getTotal() {
                if (!this || !angular.isObject(this.paginatedItems)) {
                    return 0;
                }
                return this.paginatedItems.total;
            };
            this.getNumOfPages = function getNumOfPages() {
                if (!this || !angular.isObject(this.paginatedItems)) {
                    return 0;
                }
                return this.paginatedItems.numOfPages;
            };
            this.setPageSize = function setPageSize(ps) {
                if (this || angular.isObject(this.paginatedItems) || angular.isObject(this.paginatedItems.paging)) {
                    this.paginatedItems.paging.pageSize = ps;
                }
            };
            this.getPageSize = function getPageSize() {
                if (!this || !angular.isObject(this.paginatedItems) || !angular.isObject(this.paginatedItems.paging)) {
                    return null;
                }
                return this.paginatedItems.paging.pageSize;
            };
            this.setPage = function setPage(page) {
                if (this && angular.isObject(this.paginatedItems) && angular.isObject(this.paginatedItems.paging)) {
                    this.paginatedItems.paging.page = page;
                }
            };
            this.getPage = function getPage() {
                if (!this || !angular.isObject(this.paginatedItems) || !angular.isObject(this.paginatedItems.paging)) {
                    return 1;
                }
                return this.paginatedItems.paging.page;
            };
        }
        return Pagination;
    }]);
angular
    .module('portalApp')
    .factory('Sorting', [function() {
        function Sorting(options) {
            this.sortingEnabled = false;
            this.sortingItems = {
                sortBy: options && options.sortBy ? options.sortBy : 'name',
                descending: options && options.descending ? options.descending : false
            };
            this.isSortingEnabled = function isSortingEnabled() {
                return !!this.sortingEnabled;
            };
            this.enableSorting = function enableSorting() {
                this.sortingEnabled = true;
            };
            this.setSortBy = function setSortBy(sort) {
                if (!this.sortingEnabled) {
                    this.sortingEnabled = true;
                }
                this.sortingItems.sortBy = sort;
            };
            this.setDescending = function setDescending(desc) {
                if (!this.sortingEnabled) {
                    this.sortingEnabled = true;
                }
                this.sortingItems.descending = desc;
            };
            this.getSortingItems = function getSortingItems() {
                return this.sortingItems;
            };
        }
        return Sorting;
    }]);
angular
    .module('portalApp')
    .factory('Search', [function() {
        function Search(options) {
            this.searchEnabled = false;
            this.searchItems = {
                search: options.search ? options.search : ''
            };
            this.isSearchEnabled = function isSearchEnabled() {
                return !!this.searchEnabled;
            };
            this.setSearch = function(search) {
                this.searchEnabled = true;
                this.searchItems.search = search;
            };
            this.getSearchItems = function getSearchItems() {
                return this.searchItems;
            }
        }
        return Search;
    }]);
'use strict';
(function(angular) {
    function Folder(data) {
        if (data) {
            angular.extend(this, data);
        }
    }
    Folder.prototype.getFolderId = function() {
        return this.folderId;
    };
    Folder.prototype.getSubFolders = function() {
        return this.subFolders;
    };
    Folder.prototype.setSubFolders = function(data) {
        this.subFolders = data;
    };
    Folder.prototype.getFolderCount = function() {
        return this.folderCount;
    };
    Folder.PropertyNames = {
        folderId: 'folderId',
        subFolders: 'subFolders'
    };
    Folder.isFolder = function(item) {
        return angular.isArray(item.subFolders);
    };
    angular
        .module('portalApp')
        .value('Folder', Folder);
}(window.angular));
'use strict';
(function(angular) {
    function Trait(data) {
        if (data) {
            angular.extend(this, data);
        }
    }
    Trait.isTraitTypeValid = function(type) {
        for (var key in Trait.TRAIT_TYPES) {
            if (!Trait.TRAIT_TYPES.hasOwnProperty(key)) {
                continue;
            }
            if (Trait.TRAIT_TYPES[key] === type) {
                return true;
            }
        }
        return false;
    };
    Trait.TRAIT_TYPES = {
        AlgoTraitType: 'ALGO_TRAIT',
        RuleBasedTraitType: 'RULE_BASED_TRAIT',
        OnBoardedTraitType: 'ON_BOARDED_TRAIT'
    };
    Trait.TRAIT_TYPE_LABELS = {
        AlgoTraitType: 'Algorithmic',
        RuleBasedTraitType: 'Rule-based',
        OnBoardedTraitType: 'Onboarded'
    };
    Trait.prototype.getId = function() {
        return this.sid;
    };
    Trait.prototype.getName = function() {
        return this.name;
    };
    angular
        .module('portalApp')
        .value('Trait', Trait);
}(window.angular));
'use strict';
(function(angular) {
    function Segment(data) {
        if (data) {
            angular.extend(this, data);
        }
    }
    Segment.prototype.getId = function() {
        return this.sid;
    };
    Segment.prototype.getName = function() {
        return this.name;
    };
    Segment.prototype.getActiveStatus = function getActiveStatus() {
        return 'ACTIVE';
    };
    Segment.prototype.getInactiveStatus = function getInactiveStatus() {
        return 'INACTIVE';
    };
    angular
        .module('portalApp')
        .value('Segment', Segment);
}(window.angular));
'use strict';
(function(angular) {
    function Destination(data) {
        if (data) {
            angular.extend(this, data);
        }
    }
    Destination.prototype.getId = function() {
        return this.destinationId;
    };
    Destination.prototype.getName = function() {
        return this.name;
    };
    angular
        .module('portalApp')
        .value('Destination', Destination);
}(window.angular));
(function(angular) {
    'use strict';

    function Partner(data) {
        if (data) {
            angular.extend(this, data);
        }
    }
    Partner.prototype.getId = function() {
        return this.pid;
    };
    angular
        .module('portalApp')
        .value('Partner', Partner);
}(window.angular));
(function() {
    'use strict';
    angular.module('portalApp')
        .directive('cuiAutocomplete', ['$window', function($window) {
            return {
                scope: true,
                require: '?ngModel',
                link: function(scope, element, attrs, ngModelCtrl) {
                    var $textField = element.find('input');
                    var el = new $window.CUI.Autocomplete({
                        element: element[0],
                        showsuggestions: true,
                        mode: 'contains'
                    });
                    var onSelect = scope[attrs.onSelect];
                    ngModelCtrl = ngModelCtrl || {
                        '$setViewValue': angular.noop
                    };
                    el.on('selected', function(e) {
                        if (onSelect) {
                            onSelect(e.selectedValue);
                            $textField.val(e.displayedValue.trim());
                        }
                        ngModelCtrl.$setViewValue(e.selectedValue);
                    });
                }
            };
        }])
        .directive('scrollingTable', ['$timeout', '$window', function($timeout, $window) {
            return {
                scope: true,
                link: function(scope, element) {
                    var $th, $tf;
                    var setTdWidths = function() {
                        $th.each(function(i, th) {
                            var widest = 0;
                            var thWidth = $window.$(th).find('ruler').width();
                            var tfWidth = $tf.eq(i).find('.tf-inner').width();
                            widest = thWidth > widest ? thWidth : 0;
                            widest = tfWidth > widest ? tfWidth : widest;
                            $window.$('.fixed-table-container-inner td').eq(i).css({
                                minWidth: widest + 15
                            });
                            $window.$(th).find('.th-inner').width(widest);
                            $tf.eq(i).find('.tf-inner').width(widest);
                            element.width(element.find('.fixed-table-container-inner table').width());
                        });
                    };
                    $timeout(function() {
                        $th = element.find('th');
                        $tf = element.find('tfoot td');
                        $th.prepend('<ruler></ruler>');
                        $tf.prepend('<ruler></ruler>');
                        setTdWidths();
                    });
                    $window.addEventListener('resize', function() {
                        setTdWidths();
                    });
                }
            };
        }])
        .directive('flash', ['$timeout', 'FlashService', function($timeout, FlashService) {
            return {
                restrict: 'E',
                scope: true,
                controller: function($scope) {
                    $scope.flash = FlashService;
                },
                link: function(scope, element) {
                    scope.$on('flash:show', function() {
                        $timeout(function() {
                            element.fadeOut('slow', function() {
                                element.css('display', 'block');
                                scope.flash.clearMsgObj();
                                scope.$apply();
                            });
                        }, 5000);
                    });
                }
            };
        }])
        .directive('aamDatepicker', ['$window', function($window) {
            return {
                require: '?ngModel',
                link: function(scope, element, attrs, ngModelCtrl) {
                    var MOMENT = $window.moment;
                    var isChrome = !!$window.chrome;
                    var zeropad = function(num) {
                        return num < 10 ? '0' + num : num;
                    };
                    var datepicker = new $window.CUI.Datepicker({
                        element: element,
                        displayedFormat: 'YYYY-MM-DD'
                    });
                    var $button = element.find('button');
                    ngModelCtrl = ngModelCtrl || {
                        '$setViewValue': angular.noop
                    };
                    $button.bind('click', function() {
                        var $popover = $window.$('#popguid' + datepicker.guid);
                        if (isChrome) {
                            $popover.appendTo(this);
                        }
                        $popover.css('opacity', 0);
                        var checkDom = setInterval(function() {
                            if ($popover.css('display') === 'block') {
                                $popover.css({
                                    opacity: 1,
                                    left: function() {
                                        if (isChrome) {
                                            return -126;
                                        }
                                    },
                                    top: function() {
                                        if (isChrome) {
                                            return 39;
                                        }
                                    }
                                });
                                clearInterval(checkDom);
                            }
                        }, 100);
                    });
                    datepicker.$input.on('change', function(e) {
                        ngModelCtrl.$setViewValue(e.target.value);
                        scope.$apply();
                    });
                    if (attrs.options) {
                        scope.$watch(attrs.options, function(newVal) {
                            if (!newVal) {
                                return false;
                            }
                            if (newVal.maxDate) {
                                datepicker.set({
                                    maxDate: MOMENT(newVal.maxDate)
                                });
                            }
                            if (newVal.selectedDateTime) {
                                datepicker.set({
                                    selectedDateTime: MOMENT(newVal.selectedDateTime)
                                });
                                element.find('input[type=text]').val(newVal.selectedDateTime);
                                ngModelCtrl.$setViewValue(newVal.selectedDateTime);
                            }
                        }, true);
                    }
                }
            };
        }])
        .directive('pageTitle', ['$window', function($window) {
            return {
                restrict: 'C',
                scope: true,
                link: function(scope, element) {
                    var pageTitle;
                    scope.$watch('currentState', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            switch (newVal) {
                                case 'dashboard':
                                    pageTitle = 'Dashboard';
                                    break;
                                case 'general-reports':
                                    pageTitle = 'General Reports';
                                    break;
                                case 'trend-graph':
                                    pageTitle = 'Trend Reports';
                                    break;
                                case 'onboarding-status':
                                    pageTitle = 'Onboarding Status';
                                    break;
                                case 'outbound-history':
                                    pageTitle = 'Outbound History';
                                    break;
                            }
                            element.html(pageTitle);
                            $window.$('body').attr('id', newVal);
                        }
                    });
                }
            };
        }])
        .directive('centerModal', ['$window', '$parse', function($window, $parse) {
            return {
                restrict: 'C',
                link: function(scope, element, attrs) {
                    if (attrs.visible) {
                        $parse(attrs.visible).assign(scope, true);
                    }
                    var $backdrop = null;
                    var handleWindowResize = function() {
                        element.css({
                            marginTop: -(element.height() / 2),
                            marginLeft: -(element.width() / 2)
                        });
                    };
                    setTimeout(function() {
                        $backdrop = angular.element('.coral-Modal-backdrop').css('visibility', 'hidden');
                        angular.element('.coral-Modal').css('visibility', 'hidden');
                        handleWindowResize();
                        if (attrs.visible) {
                            $parse(attrs.visible).assign(scope, false);
                        }
                        setTimeout(function() {
                            $backdrop.css('visibility', 'visible');
                            angular.element('.coral-Modal').css('visibility', 'visible');
                        }, 900);
                    }, 0);
                    angular.element($window).resize(handleWindowResize);
                }
            };
        }])
        .directive('loadingModal', [function() {
            return {
                link: function() {}
            };
        }])
        .directive('aamSelect', ['$window', '$timeout', function($window, $timeout) {
            return {
                restrict: 'E',
                require: '?ngModel',
                scope: {
                    onSelect: '&'
                },
                link: function(scope, element, attrs, ngModelCtrl) {
                    var $ul = null;
                    var $button = element.find('button');
                    var cuiSelect = null;
                    var instantiateCUISelect = function() {
                        $timeout(function() {
                            $ul = element.find('ul');
                            if ($ul) {
                                $ul.remove();
                            }
                            cuiSelect = new $window.CUI.Select({
                                element: element
                            });
                            element.addClass('select');
                            if ($button.html() === '') {
                                $button.html('Select');
                            }
                            cuiSelect.on('selected', function(e) {
                                if (ngModelCtrl) {
                                    if (e.selected === ngModelCtrl.$modelValue) {
                                        return false;
                                    }
                                    scope.$apply(function() {
                                        ngModelCtrl.$setViewValue(e.selected);
                                    });
                                }
                                scope.onSelect({
                                    selected: e.selected
                                });
                            });
                            if (!ngModelCtrl) {
                                return false;
                            }
                            ngModelCtrl.$render = function() {
                                if (!cuiSelect) {
                                    return false;
                                }
                                cuiSelect._select.val(ngModelCtrl.$modelValue);
                                cuiSelect._buttonText.text(cuiSelect._select.find('option[value=' + ngModelCtrl.$modelValue + ']').text());
                                cuiSelect._valueInput.val(ngModelCtrl.$modelValue);
                            };
                        });
                    };
                    instantiateCUISelect();
                }
            };
        }]);
}());
(function(angular) {
    'use strict';

    function ItemBrowser(FolderTreeService, Sorting, Pagination, MixinLibrary, $timeout) {
        var itemSelectorCtrl;
        var itemSelectorOptions;
        var folderTree = new FolderTreeService();

        function init(scope) {
            if (!angular.isDefined(scope.options.itemService)) {
                throw new Error('itemService is not defined');
            }
            service = new scope.options.itemService();
            folderTree.setFolderType(service.getModel().name);
            folderTree.setFolderType(service.getModel().name);
            if (!MixinLibrary.isImplemented(service, Sorting.name)) {
                throw new Error(Sorting.name + ' is not implement in the injected service.');
            }
            if (!MixinLibrary.isImplemented(service, Pagination.name)) {
                throw new Error(Pagination.name + ' is not implement in the injected service.');
            }
            service.setSortBy('name');
            service.enablePagination();
            service.setPageSize(10);
            scope.treedata = [];
            scope.paginatedItems = [];
            return folderTree
                .loadTree({
                    leafId: 0,
                    tree: scope.treedata
                })
                .then(function() {
                    scope.expandedNodes = [scope.treedata[0]];
                    if (scope.selectedFolder) {
                        scope.selectedFolder.name = null;
                    }
                    scope.$emit('folders:loaded');
                })
                .catch(function(err) {
                    throw new Error(err);
                });
        }
        var service = null;
        return {
            scope: {
                'selectedItems': '=',
                'selectedItem': '=',
                'options': '='
            },
            template: '<div class="treeview">' +
            '<div class="scrollable">' +
            '<h2 class="coral-Heading coral-Heading--2">Search Folders</h2>' +
            '<treecontrol class="tree-classic" options="opts" tree-model="treedata" on-selection="showSelected(node)" expanded-nodes="expandedNodes" on-node-toggle="showToggle(node, expanded)">' +
            '<span class="node-template" data-value="{{node}}">{{node.name}}</span>' +
            '</treecontrol>' +
            '</div>' +
            '<div class="loading" ng-show="$parent.loadingFolders">' +
            '<div class="coral-Wait coral-Wait--large"></div>' +
            '<div class="overlay"></div>' +
            '</div>' +
            '</div>' +
            '<div class="folder-contents">' +
            '<div class="scrollable">' +
            '<h2 class="coral-Heading coral-Heading--2">{{selectedFolder.name || "Folder Contents"}}</h2>' +
            '<div class="results">' +
            '<div class="init-msg" ng-show="paginatedItems.length === 0 && !selectedFolder">Select a folder to view its contents.</div>' +
            '<div class="no-contents-msg" ng-show="paginatedItems.length === 0 && selectedFolder && selectedFolder.folderCount === 0">This folder has no contents.</div>' +
            '<div class="subfoldercount-msg" ng-show="selectedFolder.folderCount > 0">This folder has {{selectedFolder.folderCount}} subfolder<span ng-hide="selectedFolder.folderCount === 1">s</span>.</div>' +
            '<ul>' +
            '<li ng-repeat="item in paginatedItems" ng-click="itemSelected(item)" draggable="true" data-id="{{item.getId()}}" title="{{item.name}}">' +
            '<i></i>' +
            '<span>{{item.name}}</span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="loading" ng-show="loadingFolderContents">' +
            '<div class="coral-Wait coral-Wait--large"></div>' +
            '<div class="overlay"></div>' +
            '</div>' +
            '<div class="pagination AS-Pagination" ng-if="getNumOfPages() > 1">' +
            '<span class="AS-Pagination-pageGroup">' +
            '<i ng-click="previousPage()" ng-show="isPrevPageAvailable" class="coral-Icon coral-Icon--chevronLeft coral-Icon--sizeXS AS-Pagination-decreasePage"></i>' +
            '<select ng-model="$parent.pageSelection" ng-options="n for n in [] | range:1:getNumOfPages()"></select>' +
            '<span> / </span> ' +
            '{{getNumOfPages()}}' +
            '<i ng-click="nextPage()" ng-show="isNextPageAvailable" class="coral-Icon coral-Icon--chevronRight coral-Icon--sizeXS AS-Pagination-increasePage"></i>' +
            '</span>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            require: ['^?itemSelector', '^?ngModel'],
            link: function(scope, element, attrs, ctrls) {
                itemSelectorCtrl = ctrls[0];
                var ngModelCtrl = ctrls[1] || {
                        '$setViewValue': angular.noop
                    };
                if (itemSelectorCtrl && itemSelectorCtrl.itemSelectorOptions) {
                    itemSelectorOptions = itemSelectorCtrl.itemSelectorOptions;
                }

                function _bindDragOnItems(element) {
                    $timeout(function() {
                        var $folderItems = element.find('.folder-contents').find('li');
                        var $draggedItem = null;
                        $folderItems
                            .on('dragstart', function(evt) {
                                $draggedItem = angular.element(evt.target);
                                $draggedItem.addClass('dragging');
                                itemSelectorCtrl.draggedItem = scope.paginatedItems.filter(function(element) {
                                    return element.getId() === $draggedItem.data('id');
                                })[0];
                                evt.originalEvent.dataTransfer.setData('text/plain', '');
                            })
                            .on('dragend', function(evt) {
                                $draggedItem = angular.element(evt.target);
                                $draggedItem.removeClass('dragging');
                            });
                    });
                }
                scope.pageSelection = 1;
                scope.$watch('pageSelection', function(newVal, oldVal) {
                    if (newVal === oldVal) {
                        return;
                    }
                    service.setPage(parseInt(newVal, 10) - 1);
                    requestItems();
                });
                scope.loadingFolderContents = false;
                scope.showToggle = function(node, expanded) {
                    if (!expanded) {
                        return;
                    }
                    folderTree.loadNodesUnder(node);
                };
                var requestItems = function() {
                    scope.loadingFolderContents = true;
                    return service
                        .getItems()
                        .then(function(items) {
                            scope.paginatedItems = items;
                            scope.loadingFolderContents = false;
                        })
                        .then(function() {
                            scope.numOfPages = service.getNumOfPages();
                            scope.totalPages = service.getTotal();
                            scope.isPrevPageAvailable = service.isPrevPageAvailable();
                            scope.isNextPageAvailable = service.isNextPageAvailable();
                        })
                        .then(function() {
                            _bindDragOnItems(element);
                        });
                };
                scope.showSelected = function(node) {
                    scope.selectedFolder = node;
                    scope.loadingFolderContents = true;
                    scope.pageSelection = 1;
                    service.setPage(0);
                    if (service.setFolderId) {
                        service.setFolderId(node.getFolderId());
                    }
                    requestItems();
                };
                scope.previousPage = function() {
                    scope.pageSelection--;
                    service.prevPage();
                    requestItems();
                };
                scope.nextPage = function() {
                    scope.pageSelection++;
                    service.nextPage();
                    requestItems();
                };
                scope.getNumOfPages = function() {
                    return scope.numOfPages;
                };
                scope.getTotalPages = function() {
                    return scope.totalPages;
                };
                scope.isPrevPageAvailable = function() {
                    return scope.isPrevPageAvailable;
                };
                scope.isNextPageAvailable = function() {
                    return scope.isNextPageAvailable;
                };
                scope.itemSelected = function(item) {
                    scope.selectedItem = item;
                    if (ngModelCtrl) {
                        ngModelCtrl.$setViewValue(scope.selectedItems);
                    }
                };

                function _bindDragOnFolders() {
                    $timeout(function() {
                        var $folders = element.find('.treeview').find('li').attr('draggable', true);
                        $folders.on('dragstart', function(evt) {
                            itemSelectorCtrl.draggedItem = angular.element(evt.target).find('.node-template').data('value');
                            evt.originalEvent.dataTransfer.setData('text/plain', '');
                        });
                    });
                }
                init(scope).then(function() {
                    if (itemSelectorOptions) {
                        if (itemSelectorOptions.foldersSelectable) {
                            _bindDragOnFolders();
                        }
                    }
                });
                scope.$watch('options.itemService', function(newVal, oldVal) {
                    if (!newVal) {
                        return false;
                    }
                    if (newVal === oldVal) {
                        return false;
                    }
                    init(scope).then(function() {
                        if (itemSelectorOptions) {
                            if (itemSelectorOptions.foldersSelectable) {
                                _bindDragOnFolders();
                            }
                        }
                    });
                });
            },
            controller: function($scope) {
                $scope.opts = {
                    nodeChildren: 'subFolders',
                    isLeaf: function(node) {
                        return angular.isUndefined(node.getSubFolders());
                    },
                    dirSelectable: true,
                    injectClasses: {
                        ul: 'a1',
                        li: 'item-selector-folder',
                        liSelected: 'a7',
                        iExpanded: 'coral-Icon--triangleDown',
                        iCollapsed: 'coral-Icon--triangleRight',
                        iLeaf: 'folder',
                        label: '',
                        labelSelected: 'a8'
                    }
                };
            }
        };
    }

    function ItemSelectorFolder() {
        return {
            restrict: 'C',
            require: '^itemSelector',
            link: function(scope, element, attrs, itemSelectorCtrl) {
                if (itemSelectorCtrl && itemSelectorCtrl.itemSelectorOptions && itemSelectorCtrl.itemSelectorOptions.foldersSelectable) {
                    element.attr('draggable', true);
                }
                setTimeout(function() {
                    if (!element.find('.node-template:first').data('value').folderCount) {
                        element.find('.tree-branch-head').css({
                            visibility: 'hidden'
                        });
                    }
                    element.find('.folder:first').prependTo(element.find('.tree-label:first'));
                }, 0);
            }
        };
    }
    angular
        .module('portalApp')
        .directive('itemBrowser', ['FolderTreeService', 'Sorting', 'Pagination', 'MixinLibrary', '$timeout', ItemBrowser])
        .directive('itemSelectorFolder', [ItemSelectorFolder]);
}(angular));
(function(angular) {
    function SearchAutocomplete(MixinLibrary, Search, Pagination, $window) {
        function init(scope) {
            scope.service = new scope.options.itemService();
            scope.$watch('scope.options.itemService', function(newVal, oldVal) {
                if (!newVal) {
                    return false;
                }
                if (newVal === oldVal) {
                    return false;
                }
                scope.service = new newVal();
            });
            if (!MixinLibrary.isImplemented(scope.service, Search.name)) {
                throw new Error(Search.name + ' is not implement in the injected service.');
            }
            if (!MixinLibrary.isImplemented(scope.service, Pagination.name)) {
                throw new Error(Pagination.name + ' is not implement in the injected service.');
            }
            scope.service.setSortBy('name');
            scope.service.enablePagination();
            scope.service.setPageSize(10);
        }
        var liFormatter = {
            format: function(name, id) {
                return name + ' (' + id + ')';
            },
            extractId: function(str) {
                var idMatch = this.idRegex.exec(str);
                if (idMatch.length !== 2) {
                    return null;
                }
                return idMatch[1];
            },
            idRegex: new RegExp('\\((\\d+)\\)$')
        };
        return {
            scope: {
                'selectedItem': '=',
                'options': '='
            },
            template: '<div class="coral-Autocomplete autocomplete-custom">' +
            '<label class="coral-DecoratedTextfield js-coral-Autocomplete-field">' +
            '<span class="u-coral-screenReaderOnly">Search</span>' +
            '<span class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search" aria-hidden="true"></span>' +
            '<input class="coral-DecoratedTextfield-input coral-Textfield js-coral-Autocomplete-textfield" type="text" name="name1" placeholder="Search by Name or ID">' +
            '</label>' +
            '<ul class="coral-SelectList js-coral-Autocomplete-selectList">' +
            '<li class="coral-SelectList-item coral-SelectList-item--option" data-value=""></li>' +
            '</ul>' +
            '</div>',
            restrict: 'E',
            link: function(scope, element) {
                if (!angular.isDefined(scope.options.itemService)) {
                    throw new Error('itemService is not defined');
                }
                init(scope);
                scope.$watch('options.itemService', function(newVal, oldVal) {
                    if (!newVal) {
                        return false;
                    }
                    if (newVal === oldVal) {
                        return false;
                    }
                    init(scope);
                });
                var loadedItems = [];
                var el = element.find('div.coral-Autocomplete.autocomplete-custom');
                var liElement = el.find('li')[0];

                function getItemFromLoadedList(value) {
                    var id = liFormatter.extractId(value);
                    if (!id) {
                        return null;
                    }
                    id = parseInt(id);
                    var filteredList = loadedItems.filter(function(item) {
                        return item.getId() === id;
                    });
                    return filteredList && filteredList.length ? filteredList[0] : null;
                }
                var autocomplete = new CUI.Autocomplete({
                    element: el,
                    selectlistConfig: {
                        type: "dynamic",
                        loadData: function loadData() {
                            var deferred = $window.$.Deferred();
                            var selectListInstance = this;
                            deferred.fail(function() {
                                throw new Error('There was an unexpected error.  Please refresh and try again.');
                            });
                            scope.service.setSearch(autocomplete.getValue());
                            scope
                                .service
                                .getItems()
                                .then(function(items) {
                                    loadedItems = items;
                                    var docFrag = document.createDocumentFragment();
                                    items.forEach(function(item) {
                                        var li = liElement.cloneNode(true);
                                        li['data-value'] = item.getId();
                                        li.textContent = liFormatter.format(item.getName(), item.getId());
                                        docFrag.appendChild(li);
                                    });
                                    selectListInstance.$element.append(docFrag);
                                    deferred.resolve(true);
                                }, deferred.reject);
                            return deferred.promise();
                        }
                    }
                });
                autocomplete.on('hide', function(event) {
                    event.stopPropagation();
                });
                autocomplete.on('change:value', function(event, payload) {
                    var item = getItemFromLoadedList(payload.value);
                    if (!item) {
                        return;
                    }
                    scope.selectedItem = item;
                    scope.$apply();
                });
            }
        };
    }
    angular
        .module('portalApp')
        .directive('searchAutocomplete', ['MixinLibrary', 'Search', 'Pagination', '$window', SearchAutocomplete])
}(angular));
'use strict';
(function(angular) {
    function ItemSelector(Pagination, Sorting, MixinLibrary, flash, $rootScope) {
        var ngModelController;
        return {
            scope: {
                options: '='
            },
            template: '<search-autocomplete options="opts" selected-item="selectedItem"></search-autocomplete>' +
            '<item-browser options="opts" selected-items="selectedItems" selected-item="selectedItem"></item-browser>' +
            '<item-selections></item-selections>',
            restrict: 'E',
            require: '?ngModel',
            link: function(scope, elem, attrs, ngModelCtrl) {
                ngModelController = ngModelCtrl || {
                    '$setViewValue': angular.noop
                };
            },
            controller: function($scope, $element) {
                var self = this;
                if ($scope.options) {
                    this.itemSelectorOptions = $scope.options;
                }
                if (!angular.isDefined($scope.options.serviceClass)) {
                    throw new Error('serviceClass is not defined');
                }
                var serviceClass = $scope.options.serviceClass;
                $scope.service = new $scope.options.serviceClass();
                $scope.$watch('selectedItem', function(newVal) {
                    if (!newVal) return false;
                    if ($scope.selectedItems.indexOf(newVal) >= 0) {
                        return;
                    }
                    var duplicate = $scope.selectedItems.filter(function(item) {
                        var copy = angular.copy(item);
                        delete copy.color;
                        return angular.equals(copy, newVal);
                    });
                    if (duplicate.length) {
                        return;
                    }
                    $scope.selectedItems.push(newVal);
                    if (ngModelController) {
                        ngModelController.$setViewValue($scope.selectedItems);
                    }
                    $scope.selectedItem = null;
                });
                $scope.$on('folders:loaded', function() {
                    $scope.loadingFolders = false;
                    $rootScope.modals.loading = false;
                });
                $scope.$watch('options.serviceClass', function(newVal, oldVal) {
                    if (!newVal) {
                        return false;
                    }
                    if (newVal === oldVal) {
                        return false;
                    }
                    serviceClass = newVal;
                    $scope.service = new serviceClass();
                    $scope.opts.itemService = serviceClass;
                    $scope.loadingFolders = true;
                    $rootScope.modals.loading = true;
                    $scope.selectedItems.splice(0);
                    if (ngModelController) {
                        ngModelController.$setViewValue($scope.selectedItems);
                    }
                });
                if (!MixinLibrary.isImplemented($scope.service, Sorting.name)) {
                    throw new Error(Sorting.name + ' is not implement in the injected service.');
                }
                if (!MixinLibrary.isImplemented($scope.service, Pagination.name)) {
                    throw new Error(Pagination.name + ' is not implement in the injected service.');
                }
                $scope.service.setSortBy('name');
                $scope.service.enablePagination();
                $scope.service.setPageSize(10);
                $scope.selectedItems = [];
                $scope.opts = {
                    itemService: $scope.options.serviceClass
                };
                this.getItemBrowserElement = function() {
                    return $element.find('item-browser');
                };
                this.getItemSelectionsElement = function() {
                    return $element.find('item-selections');
                };
                this.getAutoCompleteListElement = function() {
                    return $element.find('.js-coral-Autocomplete-selectList');
                }
            }
        };
    }
    angular
        .module('portalApp')
        .directive('itemSelector', ['Pagination', 'Sorting', 'MixinLibrary', 'FlashService', '$rootScope', ItemSelector]);
}(angular));
'use strict';
(function(angular) {
    function ItemSelections(FolderService) {
        return {
            restrict: 'E',
            scope: false,
            require: '^itemSelector',
            link: function(scope, element, attrs, itemSelectorCtrl) {
                var itemSelectorOptions;
                var cloudVizColorsCloned;
                if (itemSelectorCtrl && itemSelectorCtrl.itemSelectorOptions) {
                    itemSelectorOptions = itemSelectorCtrl.itemSelectorOptions;
                    if (itemSelectorOptions.graphLineColors) {
                        cloudVizColorsCloned = angular.copy(itemSelectorOptions.graphLineColors);
                    }
                }
                scope.$watchCollection('selectedItems', function(newVal, oldVal) {
                    if (!newVal) return false;
                    if (newVal === oldVal) return false;
                    if (!itemSelectorOptions) return false;
                    var arrayDiff = newVal.filter(function(item) {
                        return oldVal.indexOf(item) === -1;
                    });
                    if (arrayDiff.length === 0 || arrayDiff.length > 1) {
                        return;
                    }
                    newVal = arrayDiff[0];
                    scope.folders = scope.selectedItems.filter(scope.filterFolders);
                    if (!newVal.sid) return false;
                    if (cloudVizColorsCloned) {
                        if (!cloudVizColorsCloned.length) {
                            cloudVizColorsCloned = angular.copy(itemSelectorOptions.graphLineColors);
                        }
                        if (angular.isUndefined(newVal.color)) {
                            newVal.color = cloudVizColorsCloned.shift();
                        }
                    }
                });
                var dropzoneOn = {
                    border: '.0625rem solid #6a8bc4',
                    boxShadow: '0 0 .375rem #377eaf'
                };
                var dropzoneOff = {
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    boxShadow: 'none'
                };
                element
                    .on('dragover', function(evt) {
                        if (evt.preventDefault) evt.preventDefault();
                        element.css(dropzoneOn);
                        return false;
                    })
                    .on('dragenter', function() {
                        element.css(dropzoneOn);
                    })
                    .on('dragleave', function() {
                        element.css(dropzoneOff);
                    })
                    .on('drop', function() {
                        var draggedItem = itemSelectorCtrl.draggedItem;
                        scope.selectedItem = draggedItem;
                        scope.$apply();
                        element.css(dropzoneOff);
                    });
                if (itemSelectorOptions && itemSelectorOptions.maxSelectionCount) {
                    scope.maxSelectionCount = itemSelectorOptions.maxSelectionCount;
                }
                scope.removeItem = function(item) {
                    var index = scope.selectedItems.indexOf(item);
                    if (index > -1) {
                        scope.selectedItems.splice(index, 1);
                    }
                };
                scope.getItemClass = function(item) {
                    var cssClasses = '';
                    if (item.color) {
                        return cssClasses + ' graph-item';
                    }
                    if (item.sid || item.destinationId) {
                        return cssClasses + ' item-node';
                    } else if (item.folderId) {
                        return cssClasses + ' folder-node';
                    } else {
                        return cssClasses;
                    }
                };
                scope.showItem = function(item) {
                    return item.sid || item.destinationId || item.folderId;
                };
                scope.filterGraphItems = function(item) {
                    if (angular.isDefined(cloudVizColorsCloned)) {
                        return !!item.color;
                    } else if (FolderService.isFolder(item)) {
                        return false;
                    }
                    return true;
                };
                scope.filterFolders = function(item) {
                    return !!item.subFolders;
                };
            },
            template: '<div class="scrollable">' +
            '<h2 class="coral-Heading coral-Heading--2">Selections ' +
            '<span ng-show="maxSelectionCount">(for Graph: {{(selectedItems|filter:filterGraphItems).length}}/{{maxSelectionCount}})</span>' +
            '</h2>' +
            '<ul>' +
            '<li ng-repeat="item in selectedItems|filter:filterGraphItems" ng-show="showItem(item)" title="{{item.name}}">' +
            '<span ng-click="removeItem(item)" class="coral-Icon coral-Icon--close coral-Icon--sizeXS"></span>' +
            '<i ng-style="{ backgroundColor: item.color || none }" ng-class="getItemClass(item)"></i>' +
            '<span>{{item.name}}</span>' +
            '</li>' +
            '</ul>' +
            '<ul>' +
            '<li ng-repeat="folder in selectedItems|filter:filterFolders" ng-show="showItem(folder)" title="{{folder.name}}">' +
            '<span ng-click="removeItem(folder)" class="coral-Icon coral-Icon--close coral-Icon--sizeXS"></span>' +
            '<i style="background-color: {{item.color||none}}" ng-class="getItemClass(folder)"></i>' +
            '<span>{{folder.name}}</span>' +
            '</li>' +
            '</ul>' +
            '</div>'
        };
    }
    angular
        .module('portalApp')
        .directive('itemSelections', ['FolderService', ItemSelections]);
}(angular));
'use strict';
(function(angular) {
    function ItemSelectorResize($window) {
        return {
            restrict: 'A',
            scope: false,
            require: '^itemSelector',
            link: function(scope, element, attrs, itemSelectorCtrl) {
                var resizePercent = attrs.itemSelectorResize || .5;
                var $itemBrowser = itemSelectorCtrl.getItemBrowserElement();
                var $itemSelections = itemSelectorCtrl.getItemSelectionsElement();
                var itemSelectorHeight = window.innerHeight * resizePercent;
                var $autocompleteList = itemSelectorCtrl.getAutoCompleteListElement();
                var _resizeItemSelector = function() {
                    itemSelectorHeight = window.innerHeight * resizePercent;
                    element.height(itemSelectorHeight);
                    $itemBrowser.height(itemSelectorHeight - 116);
                    $itemSelections.height(itemSelectorHeight - 116);
                    $autocompleteList.css({
                        maxHeight: itemSelectorHeight
                    });
                };
                _resizeItemSelector();
                angular.element($window).resize(_resizeItemSelector);
            }
        };
    }
    angular
        .module('portalApp')
        .directive('itemSelectorResize', ['$window', ItemSelectorResize]);
}(angular));
(function(angular) {
    'use strict';

    function ExportToCSV($interval) {
        return {
            scope: {
                options: '='
            },
            restrict: 'E',
            template: '<form ng-submit="submit($event)" target="_csvDownload" method="POST" action="{{getUrl()}}">' +
            '<input ng-repeat="item in report.selectedItems" ng-if="item.sid" type="hidden" name="sids" value="{{item.sid}}" />' +
            '<input ng-repeat="item in report.selectedItems" ng-if="shouldIncludeFolderIds(item)" type="hidden" name="includeFolderIds" value="{{item.folderId}}" />' +
            '<input type="hidden" name="startDate" value="{{getStartDate(report.payload.startDate)}}" />' +
            '<input type="hidden" name="usePartnerLevelOverlap" value="{{report.payload.usePartnerLevelOverlap}}" />' +
            '<input type="hidden" name="endDate" value="{{getEndDate(report.payload.endDate)}}" />' +
            '<input type="hidden" name="interval" value="{{report.payload.interval}}" />' +
            '<button type="submit" class="coral-Button coral-Button--primary export-to-csv">' +
            '<i class="coral-Icon coral-Icon--fileExcel"></i>Export to CSV' +
            '</button>' +
            '</form>' +
            '<iframe style="display:none" height="0" width="0" name="_csvDownload"></iframe>',
            link: function(scope, element) {
                var _interval = $interval(function() {
                    var body = null;
                    var iframe = element.find('iframe');
                    if (iframe.length === 0) {
                        return;
                    }
                    try {
                        body = iframe[0].contentWindow.document.body;
                        if (body.textContent === '') {
                            return;
                        }
                        var response = JSON.parse(body.textContent);
                        scope.$emit('error', response.message || 'Unexpected error.  Please try again.');
                        body.textContent = '';
                    } catch (err) {
                        scope.$emit('error', 'Sorry, there was a problem downloading the CSV.  Please try again.');
                    }
                }, 500);
                scope.$on('$destroy', function() {
                    $interval.cancel(_interval);
                });
            },
            controller: ['$scope', function($scope) {
                if (!angular.isObject($scope.options)) {
                    throw new Error('exportToCSVOptions is undefined');
                }
                if (angular.isUndefined($scope.options.report)) {
                    throw new Error('exportToCSVOptions.report is undefined');
                }
                if (angular.isUndefined($scope.options.service)) {
                    throw new Error('exportToCSVOptions.service is undefined');
                }
                $scope.shouldIncludeFolderIds = function(item) {
                    return !!item.path;
                };
                $scope.getStartDate = function(dateStr) {
                    return new Date(dateStr).getTime();
                };
                $scope.getEndDate = function(dateStr) {
                    return new Date(dateStr).getTime();
                };
                $scope.submit = function(event) {
                    event.currentTarget.submit();
                };
                $scope.report = $scope.options.report;
                $scope.service = $scope.options.service;
                $scope.getUrl = $scope.service.getUrl.bind($scope.service);
            }]
        };
    }
    angular
        .module('portalApp')
        .directive('exportTrend', ['$interval', ExportToCSV]);
}(angular));
(function(angular) {
    'use strict';

    function ExportToCSV($interval) {
        return {
            scope: {
                options: '='
            },
            restrict: 'E',
            template: '<form target="_csvDownload" method="POST" action="{{getUrl()}}">' +
            '<input ng-repeat="item in report.selectedItems" ng-if="item.sid" type="hidden" name="sids" value="{{item.sid}}" />' +
            '<input ng-repeat="item in report.selectedItems" ng-if="shouldIncludeFolderIds(item)" type="hidden" name="includeFolderIds" value="{{item.folderId}}" />' +
            '<input ng-repeat="item in report.selectedItems" ng-if="item.destinationId" type="hidden" name="includeDestinationIds" value="{{item.destinationId}}" />' +
            '<input type="hidden" name="date" value="{{convertToTimestamp(report.payload.date)}}" />' +
            '<input type="hidden" name="usePartnerLevelOverlap" value="{{report.payload.usePartnerLevelOverlap}}" />' +
            '<input type="hidden" name="includeDestinationMappings" value="{{report.includeDestinationMappings()}}" />' +
            '<button ng-click="this.form.submit()" class="coral-Button coral-Button--primary">Export to CSV</button>' +
            '</form>' +
            '<iframe style="display:none" height="0" width="0" name="_csvDownload"></iframe>',
            link: function(scope, element) {
                var _interval = $interval(function() {
                    var body = null;
                    var iframe = element.find('iframe');
                    if (iframe.length === 0) {
                        return;
                    }
                    try {
                        body = iframe[0].contentWindow.document.body;
                        if (body.textContent === '') {
                            return;
                        }
                        var response = JSON.parse(body.textContent);
                        scope.$emit('error', response.message || 'Unexpected error.  Please try again.');
                        body.textContent = '';
                    } catch (err) {
                        scope.$emit('error', 'Sorry, there was a problem downloading the CSV.  Please try again.');
                    }
                }, 500);
                scope.$on('$destroy', function() {
                    $interval.cancel(_interval);
                });
            },
            controller: ['$scope', function($scope) {
                if (!angular.isObject($scope.options)) {
                    throw new Error('exportToCSVOptions is undefined');
                }
                if (angular.isUndefined($scope.options.report)) {
                    throw new Error('exportToCSVOptions.report is undefined');
                }
                if (angular.isUndefined($scope.options.service)) {
                    throw new Error('exportToCSVOptions.service is undefined');
                }
                $scope.shouldIncludeFolderIds = function(item) {
                    return !!item.path;
                };
                $scope.convertToTimestamp = function(dateStr) {
                    return new Date(dateStr).getTime();
                };
                $scope.report = $scope.options.report;
                $scope.service = $scope.options.service;
                $scope.getUrl = $scope.service.getUrl.bind($scope.service);
            }]
        };
    }
    angular
        .module('portalApp')
        .directive('exportGeneral', ['$interval', ExportToCSV]);
}(angular));
angular
    .module('portalApp')
    .service('MixinLibrary', [function MixinLibrary() {
        return {
            mixin: function(asBehavior, obj, args) {
                asBehavior.call(obj, args);
                if (typeof obj._mixins === 'undefined') {
                    obj._mixins = [];
                }
                obj._mixins.push(asBehavior.name);
            },
            isImplemented: function(instance, behavior) {
                return angular.isDefined(instance['_mixins']) && instance['_mixins'].indexOf(behavior.name);
            }
        };
    }]);
'use strict';
angular.module('portalApp')
    .factory('TraitService', ['$http', '$window', 'Trait', 'modelTransformer', 'Pagination', 'Sorting', 'Search', 'MixinLibrary', function($http, $window, Trait, modelTransformer, asPagination, asSorting, asSearch, MixinLibrary) {
        function TraitService() {
            this.state = {};
        }
        TraitService.Model = Trait;
        TraitService.getUrl = $window.ADOBE.AM.API.TRAITS.trait.url;
        TraitService.prototype.getModel = function() {
            return TraitService.Model;
        };
        TraitService.prototype.setFolderId = function setFolderId(id) {
            this.state.folderId = id;
        };
        TraitService.prototype.getQueryStringArguments = function(options) {
            var defaultQueryStringArgs = {};
            var queryStringArguments = {};
            if (options && options.queryStringArguments) {
                queryStringArguments = options.queryStringArguments;
            }
            if (this.isSortingEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSortingItems());
            }
            if (this.isPaginationEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getPaging());
            }
            if (this.isSearchEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSearchItems());
            }
            var stateKeys = Object.keys(this.state);
            if (stateKeys.length) {
                angular.extend(defaultQueryStringArgs, this.state);
            }
            return angular.extend(defaultQueryStringArgs, queryStringArguments);
        };
        TraitService.prototype.getTraits = function(options) {
            var queryStringArguments = this.getQueryStringArguments(options);
            return $http
                .get(TraitService.getUrl(queryStringArguments))
                .then(function(response) {
                    var data = response.data;
                    if (angular.isUndefined(data)) {
                        throw new Error('Bad data');
                    }
                    if (angular.isArray(data.list)) {
                        data.list.forEach(function(item) {
                            item.name = $window.ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name);
                        });
                    }
                    var traits = this.isPaginationEnabled() ? this.handleResponse(data) : data;
                    return this.instantiateTraits(traits);
                }.bind(this));
        };
        TraitService.prototype.instantiateTraits = function(list) {
            return modelTransformer.transform(list, Trait);
        };
        MixinLibrary.mixin(asSorting, TraitService.prototype, {
            sortBy: 'name',
            descending: false
        });
        MixinLibrary.mixin(asSearch, TraitService.prototype, {
            search: ''
        });
        MixinLibrary.mixin(asPagination, TraitService.prototype, {
            page: 0,
            pageSize: 50,
            getItemsReference: TraitService.prototype.getTraits
        });
        return TraitService;
    }]);
'use strict';
angular.module('portalApp')
    .factory('SegmentService', ['$http', '$window', 'Segment', 'modelTransformer', 'Pagination', 'Sorting', 'Search', 'MixinLibrary', function($http, $window, Segment, modelTransformer, asPagination, asSorting, asSearch, MixinLibrary) {
        function SegmentService() {
            this.state = {};
        }
        SegmentService.Model = Segment;
        SegmentService.getUrl = $window.ADOBE.AM.API.SEGMENTS.segment.url;
        SegmentService.prototype.getModel = function() {
            return SegmentService.Model;
        };
        SegmentService.prototype.setFolderId = function setFolderId(id) {
            this.state.folderId = id;
        };
        SegmentService.prototype.getQueryStringArguments = function(options) {
            var defaultQueryStringArgs = {};
            var queryStringArguments = {};
            if (options && options.queryStringArguments) {
                queryStringArguments = options.queryStringArguments;
            }
            if (this.isSortingEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSortingItems());
            }
            if (this.isPaginationEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getPaging());
            }
            if (this.isSearchEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSearchItems());
            }
            var stateKeys = Object.keys(this.state);
            if (stateKeys.length) {
                angular.extend(defaultQueryStringArgs, this.state);
            }
            return angular.extend(defaultQueryStringArgs, queryStringArguments);
        };
        SegmentService.prototype.getSegments = function(options) {
            var queryStringArguments = this.getQueryStringArguments(options);
            return $http
                .get(SegmentService.getUrl(queryStringArguments))
                .then(function(response) {
                    var data = response.data;
                    if (angular.isUndefined(data)) {
                        throw new Error('Bad data');
                    }
                    if (angular.isArray(data.list)) {
                        data.list.forEach(function(item) {
                            item.name = $window.ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name);
                        });
                    }
                    var segments = this.isPaginationEnabled() ? this.handleResponse(data) : data;
                    return this.instantiateSegments(segments);
                }.bind(this));
        };
        SegmentService.prototype.instantiateSegments = function(list) {
            return modelTransformer.transform(list, Segment);
        };
        MixinLibrary.mixin(asSorting, SegmentService.prototype, {
            sortBy: 'name',
            descending: false
        });
        MixinLibrary.mixin(asSearch, SegmentService.prototype, {
            search: ''
        });
        MixinLibrary.mixin(asPagination, SegmentService.prototype, {
            page: 0,
            pageSize: 50,
            getItemsReference: SegmentService.prototype.getSegments
        });
        return SegmentService;
    }]);
'use strict';
angular.module('portalApp')
    .factory('DestinationService', ['$http', '$window', 'Destination', 'modelTransformer', 'Pagination', 'Sorting', 'Search', 'MixinLibrary', function($http, $window, Destination, modelTransformer, asPagination, asSorting, asSearch, MixinLibrary) {
        function DestinationService() {
            this.state = {};
        }
        DestinationService.Model = Destination;
        DestinationService.getUrl = $window.ADOBE.AM.API.DESTINATION.destination.url;
        DestinationService.prototype.getModel = function() {
            return DestinationService.Model;
        };
        DestinationService.prototype.getQueryStringArguments = function(options) {
            var defaultQueryStringArgs = {};
            var queryStringArguments = {};
            if (options && options.queryStringArguments) {
                queryStringArguments = options.queryStringArguments;
            }
            if (this.isSortingEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSortingItems());
            }
            if (this.isPaginationEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getPaging());
            }
            if (this.isSearchEnabled()) {
                angular.extend(defaultQueryStringArgs, this.getSearchItems());
            }
            var stateKeys = Object.keys(this.state);
            if (stateKeys.length) {
                angular.extend(defaultQueryStringArgs, this.state);
            }
            return angular.extend(defaultQueryStringArgs, queryStringArguments);
        };
        DestinationService.prototype.getDestinations = function(options) {
            var queryStringArguments = this.getQueryStringArguments(options);
            return $http
                .get(DestinationService.getUrl(queryStringArguments))
                .then(function(response) {
                    var data = response.data;
                    if (angular.isUndefined(data)) {
                        throw new Error('Bad data');
                    }
                    if (angular.isArray(data.list)) {
                        data.list.forEach(function(item) {
                            item.name = $window.ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name);
                        });
                    }
                    var dests = this.isPaginationEnabled() ? this.handleResponse(data) : data;
                    return this.instantiateDestinations(dests);
                }.bind(this));
        };
        DestinationService.prototype.instantiateDestinations = function(list) {
            return modelTransformer.transform(list, Destination);
        };
        MixinLibrary.mixin(asSorting, DestinationService.prototype, {
            sortBy: 'name',
            descending: false
        });
        MixinLibrary.mixin(asSearch, DestinationService.prototype, {
            search: ''
        });
        MixinLibrary.mixin(asPagination, DestinationService.prototype, {
            page: 0,
            pageSize: 50,
            getItemsReference: DestinationService.prototype.getDestinations
        });
        return DestinationService;
    }]);
angular.module('portalApp')
    .factory('PartnerService', ['$http', '$window', 'Partner', 'modelTransformer', function($http, $window, Partner, modelTransformer) {
        'use strict';

        function PartnerService() {}
        PartnerService.Model = Partner;
        PartnerService.prototype.getModel = function() {
            return PartnerService.Model;
        };
        PartnerService.prototype.instantiatePartners = function(list) {
            return modelTransformer.transform(list, Partner);
        };
        return PartnerService;
    }]);
angular.module('portalApp')
    .service('MostChangedTraitsService', ['$window', 'TraitService', '$q', '$http', 'MixinLibrary', 'Pagination', 'TrendReportService', function MostChangedTraitsService($window, TraitService, $q, $http, mixinLib, asPagination, TrendReportService) {
        'use strict';
        var self = this;
        var ADOBE = $window.ADOBE || {};
        var moment = $window.moment || {};
        this.dateRange = null;
        this.traits = [];
        this.restrictType = null;
        this.traitService = new TraitService();
        this.trendReportService = new TrendReportService();
        this.sidsSortedByDelta = [];
        this.graph = null;
        this.canceller = $q.defer();
        this.request = null;
        this.getUrlParams = function(interval) {
            var _base = {
                interval: interval,
                page: this.getPage(),
                pageSize: this.getPageSize(),
                excludeThirdParty: true
            };
            var _type = {};
            if (this.restrictType && this.restrictType !== 'ALL_TRAITS') {
                _type.restrictType = this.restrictType;
            }
            return angular.extend({}, _base, _type);
        };
        this.getUrl = function(interval) {
            return ADOBE.AM.API.REPORTS.traits_most_changed.url(this.getUrlParams(interval));
        };
        this.setDateRange = function(range) {
            this.dateRange = range;
        };
        this.isFiring = function() {
            return this.request !== null;
        };
        this.setRestrictType = function(type) {
            if (!TraitService.Model.isTraitTypeValid(type) && type !== 'ALL_TRAITS') {
                throw new Error(type + ' not a valid Trait Type');
            }
            this.restrictType = type;
        };
        this.getGraphData = function(latestDate) {
            var payload;
            var self = this;
            if (latestDate && $window.angular.isFunction(latestDate.then)) {
                return latestDate.then(function(data) {
                    payload = self.getGraphPayload(data.latestDate);
                    return _getGraphData(payload);
                });
            } else {
                payload = this.getGraphPayload(latestDate);
                return _getGraphData(payload);
            }
        };

        function _getGraphData(payload) {
            if (payload && payload.sids.length) {
                return $http.post(ADOBE.AM.API.TRAITS.trend.url(), payload)
                    .then(function(res) {
                        var _sortByDelta = function(traits) {
                            return self.sidsSortedByDelta.map(function(sid) {
                                return traits.filter(function(trait) {
                                    return trait.sid === sid;
                                })[0];
                            });
                        };
                        var sortedByDelta = _sortByDelta(res.data);
                        var parsedData = $window.ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(sortedByDelta || [], 'uniques');
                        delete parsedData.dataTable;
                        delete parsedData.sids;
                        delete parsedData.graphDataIsEmpty;
                        self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(parsedData || {});
                        self.trendReportService.dataGraph = self.graphData;
                    }, function(err) {
                        ADOBE.AM.MESSAGES.getAPIErrorMessage(err);
                    });
            } else {
                var def = $q.defer();
                self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz({});
                self.trendReportService.dataGraph = self.graphData;
                def.resolve({});
                return def.promise;
            }
        }
        this.getSids = function() {
            var arr = [];
            this.traits.forEach(function(trait) {
                arr.push(trait.getId());
            });
            return arr;
        };
        this.getGraphPayload = function(latestDate) {
            return {
                endDate: this.getEndDate(latestDate),
                startDate: this.getStartDate(latestDate),
                sids: this.getSids(),
                interval: '1D',
                usePartnerLevelOverlap: false
            };
        };
        this.getStartDate = function(latestDate) {
            var endDate = moment.utc(latestDate);
            var range = parseInt(this.dateRange, 10);
            this.startDate = endDate.subtract(range, 'd').valueOf();
            return this.startDate;
        };
        this.getEndDate = function(latestDate) {
            this.endDate = latestDate;
            return this.endDate;
        };
        this.getTraits = function(interval) {
            if (this.request !== null) {
                this.canceller.resolve('aborted');
            }
            var _sortByDelta = function(a, b) {
                return Math.abs(b.metrics.deltaPercentage) - Math.abs(a.metrics.deltaPercentage);
            };
            this.request = $http
                .get(this.getUrl(interval), {
                    timeout: this.canceller.promise
                })
                .then(function(response) {
                    self.request = null;
                    self.traits = self.traitService.instantiateTraits(response.data.list);
                    self.sidsSortedByDelta = self.traits.sort(_sortByDelta).map(function(trait) {
                        return trait.getId();
                    });
                    return self.traits;
                });
            return this.request;
        };
        mixinLib.mixin(asPagination, this, {
            page: 0,
            pageSize: 10,
            getItemsReference: function() {}
        });
    }]);
angular.module('portalApp')
    .service('MostChangedSegmentsService', ['$window', 'SegmentService', '$q', '$http', 'MixinLibrary', 'Pagination', 'TrendReportService', function MostChangedSegmentsService($window, SegmentService, $q, $http, mixinLib, asPagination, TrendReportService) {
        'use strict';
        var self = this;
        var ADOBE = $window.ADOBE || {};
        var moment = $window.moment || {};
        this.dateRange = null;
        this.segments = [];
        this.segmentService = new SegmentService();
        this.trendReportService = new TrendReportService();
        this.sidsSortedByDelta = [];
        this.graph = null;
        this.canceller = $q.defer();
        this.request = null;
        this.getUrl = function(interval) {
            return ADOBE.AM.API.REPORTS.segments_most_changed.url(this.getUrlParams(interval));
        };
        this.setDateRange = function(range) {
            this.dateRange = range;
        };
        this.getUrlParams = function(interval) {
            return {
                interval: interval,
                page: this.getPage(),
                pageSize: this.getPageSize()
            };
        };
        this.isFiring = function() {
            return this.request !== null;
        };
        this.getGraphData = function(latestDate) {
            var payload;
            var self = this;
            if (latestDate && angular.isFunction(latestDate.then)) {
                return latestDate.then(function(data) {
                    payload = self.getGraphPayload(data.latestDate);
                    return _getGraphData(payload);
                });
            } else {
                payload = this.getGraphPayload(latestDate);
                return _getGraphData(payload);
            }
        };

        function _getGraphData(payload) {
            if (payload && payload.sids.length) {
                return $http.post(ADOBE.AM.API.SEGMENTS.trend.url(), payload)
                    .then(function(res) {
                        var _sortByDelta = function(segments) {
                            return self.sidsSortedByDelta.map(function(sid) {
                                return segments.filter(function(segment) {
                                    return segment.sid === sid;
                                })[0];
                            });
                        };
                        var sortedByDelta = _sortByDelta(res.data);
                        var parsedData = ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(sortedByDelta || [], 'instantUniques');
                        delete parsedData.dataTable;
                        delete parsedData.sids;
                        delete parsedData.graphDataIsEmpty;
                        self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(parsedData || {});
                        self.trendReportService.dataGraph = self.graphData;
                    }, function(err) {
                        ADOBE.AM.MESSAGES.getAPIErrorMessage(err);
                    });
            } else {
                var def = $q.defer();
                self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz({});
                self.trendReportService.dataGraph = self.graphData;
                def.resolve({});
                return def.promise;
            }
        }
        this.getSids = function() {
            var arr = [];
            this.segments.forEach(function(segment) {
                arr.push(segment.getId());
            });
            return arr;
        };
        this.getGraphPayload = function(latestDate) {
            return {
                endDate: this.getEndDate(latestDate),
                startDate: this.getStartDate(latestDate),
                sids: this.getSids(),
                interval: '1D'
            };
        };
        this.getStartDate = function(latestDate) {
            var endDate = moment.utc(latestDate);
            var range = parseInt(this.dateRange, 10);
            this.startDate = endDate.subtract(range, 'd').valueOf();
            return this.startDate;
        };
        this.getEndDate = function(latestDate) {
            this.endDate = latestDate;
            return this.endDate;
        };
        this.getSegments = function(interval) {
            if (this.request !== null) {
                this.canceller.resolve('aborted');
            }
            var _sortByDelta = function(a, b) {
                return Math.abs(b.metrics.deltaPercentage) - Math.abs(a.metrics.deltaPercentage);
            };
            this.request = $http
                .get(this.getUrl(interval), {
                    timeout: this.canceller.promise
                })
                .then(function(response) {
                    self.request = null;
                    self.segments = self.segmentService.instantiateSegments(response.data.list);
                    self.sidsSortedByDelta = self.segments.sort(_sortByDelta).map(function(segment) {
                        return segment.getId();
                    });
                    return self.segments;
                });
            return this.request;
        };
        mixinLib.mixin(asPagination, this, {
            page: 0,
            pageSize: 10,
            getItemsReference: function() {}
        });
    }]);
angular.module('portalApp')
    .service('LargestSegmentsService', ['$window', 'SegmentService', '$q', '$http', 'MixinLibrary', 'Pagination', 'TrendReportService', function LargestSegmentsService($window, SegmentService, $q, $http, mixinLib, asPagination, TrendReportService) {
        'use strict';
        var self = this;
        var ADOBE = $window.ADOBE || {};
        var moment = $window.moment || {};
        this.dateRange = null;
        this.segments = [];
        this.segmentService = new SegmentService();
        this.trendReportService = new TrendReportService();
        this.sidsSortedByUniques = [];
        this.graph = null;
        this.canceller = $q.defer();
        this.request = null;
        this.getUrl = function(interval) {
            return ADOBE.AM.API.REPORTS.largest_segments.url(this.getUrlParams(interval));
        };
        this.setDateRange = function(range) {
            this.dateRange = range;
        };
        this.getUrlParams = function(interval) {
            return {
                interval: interval,
                page: this.getPage(),
                pageSize: this.getPageSize()
            };
        };
        this.isFiring = function() {
            return this.request !== null;
        };
        this.getGraphData = function(latestDate) {
            var payload;
            var self = this;
            if (latestDate && angular.isFunction(latestDate.then)) {
                return latestDate.then(function(data) {
                    payload = self.getGraphPayload(data.latestDate);
                    return _getGraphData(payload);
                });
            } else {
                payload = this.getGraphPayload(latestDate);
                return _getGraphData(payload);
            }
        };

        function _getGraphData(payload) {
            if (payload && payload.sids.length) {
                return $http.post(ADOBE.AM.API.SEGMENTS.trend.url(), payload)
                    .then(function(res) {
                        var _sortByUniques = function(segments) {
                            return self.sidsSortedByUniques.map(function(sid) {
                                return segments.filter(function(segment) {
                                    return segment.sid === sid;
                                })[0];
                            });
                        };
                        var sortedByUniques = _sortByUniques(res.data);
                        var parsedData = ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(sortedByUniques || [], 'instantUniques');
                        delete parsedData.dataTable;
                        delete parsedData.sids;
                        delete parsedData.graphDataIsEmpty;
                        self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(parsedData || {});
                        self.trendReportService.dataGraph = self.graphData;
                    }, function(err) {
                        ADOBE.AM.MESSAGES.getAPIErrorMessage(err);
                    });
            } else {
                var def = $q.defer();
                self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz({});
                self.trendReportService.dataGraph = self.graphData;
                def.resolve({});
                return def.promise;
            }
        }
        this.getSids = function() {
            var arr = [];
            this.segments.forEach(function(segment) {
                arr.push(segment.getId());
            });
            return arr;
        };
        this.getGraphPayload = function(latestDate) {
            return {
                endDate: this.getEndDate(latestDate),
                startDate: this.getStartDate(latestDate),
                sids: this.getSids(),
                interval: '1D'
            };
        };
        this.getStartDate = function(latestDate) {
            var endDate = moment.utc(latestDate);
            var range = parseInt(this.dateRange, 10);
            this.startDate = endDate.subtract(range, 'd').valueOf();
            return this.startDate;
        };
        this.getEndDate = function(latestDate) {
            this.endDate = latestDate;
            return this.endDate;
        };
        this.getSegments = function(interval) {
            if (this.request !== null) {
                this.canceller.resolve('aborted');
            }
            var _sortByUniques = function(a, b) {
                return b.metrics.todayUniques - a.metrics.todayUniques;
            };
            this.request = $http
                .get(this.getUrl(interval), {
                    timeout: this.canceller.promise
                })
                .then(function(response) {
                    self.request = null;
                    self.segments = self.segmentService.instantiateSegments(response.data.list);
                    self.sidsSortedByUniques = self.segments.sort(_sortByUniques).map(function(segment) {
                        return segment.getId();
                    });
                    return self.segments;
                });
            return this.request;
        };
        mixinLib.mixin(asPagination, this, {
            page: 0,
            pageSize: 10,
            getItemsReference: function() {}
        });
    }]);
angular.module('portalApp')
    .service('LargestTraitsService', ['$window', 'TraitService', '$q', '$http', 'MixinLibrary', 'Pagination', 'TrendReportService', function LargestTraitsService($window, TraitService, $q, $http, mixinLib, asPagination, TrendReportService) {
        'use strict';
        var self = this;
        var ADOBE = $window.ADOBE || {};
        var moment = $window.moment || {};
        this.dateRange = null;
        this.traits = [];
        this.restrictType = null;
        this.traitService = new TraitService();
        this.trendReportService = new TrendReportService();
        this.sidsSortedByUniques = [];
        this.graph = null;
        this.canceller = $q.defer();
        this.request = null;
        this.getUrl = function(interval) {
            return ADOBE.AM.API.REPORTS.largest_traits.url(this.getUrlParams(interval));
        };
        this.setDateRange = function(range) {
            this.dateRange = range;
        };
        this.getUrlParams = function(interval) {
            var _base = {
                interval: interval,
                page: this.getPage(),
                pageSize: this.getPageSize(),
                excludeThirdParty: true
            };
            var _type = {};
            if (this.restrictType && this.restrictType !== 'ALL_TRAITS') {
                _type.restrictType = this.restrictType;
            }
            return angular.extend({}, _base, _type);
        };
        this.setRestrictType = function(type) {
            if (!TraitService.Model.isTraitTypeValid(type) && type !== 'ALL_TRAITS') {
                throw new Error(type + ' not a valid Trait Type');
            }
            this.restrictType = type;
        };
        this.isFiring = function() {
            return this.request !== null;
        };
        this.getGraphData = function(latestDate) {
            var payload;
            var self = this;
            if (latestDate && angular.isFunction(latestDate.then)) {
                return latestDate.then(function(data) {
                    payload = self.getGraphPayload(data.latestDate);
                    return _getGraphData(payload);
                });
            } else {
                payload = this.getGraphPayload(latestDate);
                return _getGraphData(payload);
            }
        };

        function _getGraphData(payload) {
            if (payload && payload.sids.length) {
                return $http.post(ADOBE.AM.API.TRAITS.trend.url(), payload)
                    .then(function(res) {
                        var _sortByUniques = function(traits) {
                            return self.sidsSortedByUniques.map(function(sid) {
                                return traits.filter(function(trait) {
                                    return trait.sid === sid;
                                })[0];
                            });
                        };
                        var sortedByUniques = _sortByUniques(res.data);
                        var parsedData = ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(sortedByUniques || [], 'uniques');
                        delete parsedData.dataTable;
                        delete parsedData.sids;
                        delete parsedData.graphDataIsEmpty;
                        self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(parsedData || {});
                        self.trendReportService.dataGraph = self.graphData;
                    }, function(err) {
                        ADOBE.AM.MESSAGES.getAPIErrorMessage(err);
                    });
            } else {
                var def = $q.defer();
                self.graphData = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz({});
                self.trendReportService.dataGraph = self.graphData;
                def.resolve({});
                return def.promise;
            }
        }
        this.getSids = function() {
            var arr = [];
            this.traits.forEach(function(trait) {
                arr.push(trait.getId());
            });
            return arr;
        };
        this.getGraphPayload = function(latestDate) {
            return {
                endDate: this.getEndDate(latestDate),
                startDate: this.getStartDate(latestDate),
                sids: this.getSids(),
                interval: '1D',
                usePartnerLevelOverlap: false
            };
        };
        this.getStartDate = function(latestDate) {
            var endDate = moment.utc(latestDate);
            var range = parseInt(this.dateRange, 10);
            this.startDate = endDate.subtract(range, 'd').valueOf();
            return this.startDate;
        };
        this.getEndDate = function(latestDate) {
            this.endDate = latestDate;
            return this.endDate;
        };
        this.getTraits = function(interval) {
            if (this.request !== null) {
                this.canceller.resolve('aborted');
            }
            var _sortByUniques = function(a, b) {
                return b.metrics.todayUniques - a.metrics.todayUniques;
            };
            this.request = $http
                .get(this.getUrl(interval), {
                    timeout: this.canceller.promise
                })
                .then(function(response) {
                    self.request = null;
                    self.traits = self.traitService.instantiateTraits(response.data.list);
                    self.sidsSortedByUniques = self.traits.sort(_sortByUniques).map(function(trait) {
                        return trait.getId();
                    });
                    return self.traits;
                });
            return this.request;
        };
        mixinLib.mixin(asPagination, this, {
            page: 0,
            pageSize: 10,
            getItemsReference: function() {}
        });
    }]);
angular
    .module('portalApp')
    .service('PartnerUniquesService', ['$window', 'PartnerService', 'TraitService', '$q', '$http', function PartnerUniquesService($window, PartnerService, TraitService, $q, $http) {
        'use strict';
        var self = this;
        this.interval = null;
        this.startDate = null;
        this.endDate = null;
        this._restrictType = 'TOTAL';
        this.metrics = {};
        this.partnerService = new PartnerService();
        this.canceller = {};
        this.request = {};
        this.setInterval = function(interval) {
            this.interval = interval;
        };
        this.setStartDate = function(date) {
            this.startDate = date;
        };
        this.setEndDate = function(date) {
            this.endDate = date;
        };
        this.setRestrictType = function(type) {
            if (!TraitService.Model.isTraitTypeValid(type) && type !== 'TOTAL') {
                throw new Error(type + ' not a valid Trait Type');
            }
            this._restrictType = type;
        };
        this.clearMetrics = function() {
            this.metrics = {};
        };
        this.getUrl = function() {
            var qsKeyVals = {};
            ['startDate', 'endDate', 'interval']
                .forEach(function mapToKeyValues(key) {
                    if (this[key] === null) {
                        return;
                    }
                    qsKeyVals[key] = this[key];
                }.bind(this));
            if (this._restrictType !== 'TOTAL') {
                qsKeyVals.restrictType = this._restrictType;
            }
            return $window.ADOBE.AM.API.REPORTS.partner_uniques.url(qsKeyVals);
        };
        this.isFiring = function(traitType) {
            return !angular.isUndefined(this.request[traitType]);
        };
        this.getMetrics = function() {
            var defer = $q.defer();
            var traitType = this._restrictType;
            if (this.metrics[traitType]) {
                defer.resolve(this.metrics[traitType]);
                return defer.promise;
            }
            if (angular.isUndefined(this.canceller[traitType])) {
                this.canceller[traitType] = $q.defer();
            }
            if (!(angular.isUndefined(this.request[traitType]))) {
                this.canceller[traitType].resolve('aborted');
            }
            this.request[traitType] = $http
                .get(this.getUrl(), {
                    timeout: this.canceller[traitType].promise
                })
                .then(function(response) {
                    delete self.request[traitType];
                    self.metrics[traitType] = self.partnerService.instantiatePartners(response.data);
                    return self.metrics[traitType];
                });
            return this.request[traitType];
        };
    }]);
angular
    .module('portalApp')
    .service('PermissionCheckService', ['$window', function PermissionCheckService($window) {
        'use strict';
        var roles = $window.userRoles;
        this.canViewTraits = function() {
            return roles.indexOf('VIEW_TRAITS') >= 0;
        };
        this.canViewSegments = function() {
            return roles.indexOf('VIEW_SEGMENTS') >= 0;
        };
        this.canViewDestinations = function() {
            return roles.indexOf('VIEW_DESTINATIONS') >= 0;
        };
        this.canViewAllTraits = function() {
            return roles.indexOf('VIEW_ALL_TRAITS') >= 0;
        };
        this.canViewAllSegments = function() {
            return roles.indexOf('VIEW_ALL_SEGMENTS') >= 0;
        };
    }]);
'use strict';
angular.module('portalApp')
    .factory('FolderService', ['$window', '$http', 'modelTransformer', 'Folder', 'Trait', 'Segment', 'Destination', '$q', function($window, $http, modelTransformer, Folder, Trait, Segment, Destination, $q) {
        var segmentFoldersUrl = $window.ADOBE.AM.API.SEGMENTS.folders.url() + '?foldersOnly=true';
        var traitFoldersUrl = $window.ADOBE.AM.API.TRAITS.folders.url() + '?foldersOnly=true&includeThirdParty=true';
        var SPECIAL_TYPES = {
            DESTINATION: {
                response: [{
                    folderCount: 0,
                    folderId: 0,
                    name: "All Destinations",
                    parentFolderId: 0,
                    path: "/All Destinations",
                    pid: 0,
                    subFolders: []
                }]
            }
        };

        function FolderService() {}
        FolderService.Model = Folder;
        FolderService.isFolder = Folder.isFolder;
        FolderService.getSubFolderPropertyName = function() {
            return Folder.PropertyNames.subFolders;
        };
        FolderService.getFolderIdPropertyName = function() {
            return Folder.PropertyNames.folderId;
        };
        FolderService.prototype.isSpecialTypeOfFolder = function() {
            var type = this.type.toUpperCase();
            return SPECIAL_TYPES.hasOwnProperty(type);
        };
        FolderService.prototype.getSpecialTypeOfFolderResponse = function() {
            var type = this.type.toUpperCase();
            return SPECIAL_TYPES[type].response;
        }
        FolderService.prototype.setType = function(type) {
            if (type === Trait.name) {
                this.folderUrl = traitFoldersUrl;
                this.type = type;
            } else if (type === Segment.name) {
                this.folderUrl = segmentFoldersUrl;
                this.type = type;
            } else if (type === Destination.name) {
                this.folderUrl = '';
                this.type = type;
            } else {
                this.type = null;
            }
        };
        FolderService.prototype.getAllFolders = function() {
            var handleResponse = function(response) {
                return modelTransformer.transform(response.data, Folder);
            };
            if (this.isSpecialTypeOfFolder()) {
                var defer = $q.defer();
                defer.promise.then(handleResponse)
                defer.resolve(this.getSpecialTypeOfFolderResponse());
                return defer.promise;
            }
            return $http
                .get(this.folderUrl)
                .then(handleResponse);
        };
        FolderService.prototype.convertToFolders = function(objects) {
            if (angular.isArray(objects)) {
                objects.forEach(function(item) {
                    item.name = $window.ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name);
                });
            } else if (angular.isObject(objects)) {
                objects.name = $window.ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(objects.name);
            }
            return modelTransformer.transform(objects, Folder);
        };
        return FolderService;
    }]);
'use strict';
angular.module('portalApp')
    .factory('FolderTreeService', ['FolderService', '$q', function(FolderService, $q) {
        var subFoldersPropName = FolderService.getSubFolderPropertyName();
        var folderIdPropName = FolderService.getFolderIdPropertyName();

        function FolderTree() {
            this.treedata = [];
            this.leafRequest = null;
            this.folderService = new FolderService();
            this.loadedTree = [];
        }
        FolderTree.prototype.setFolderType = function(type) {
            this.folderService.setType(type);
        };
        FolderTree.prototype.getFolderService = function() {
            return this.getFolderService;
        };
        FolderTree.prototype.getFolders = function() {
            return this.folderService.getAllFolders();
        };
        FolderTree.prototype.setTreeData = function(tree) {
            this.treedata = tree;
            return tree;
        };
        FolderTree.prototype.getTreeData = function() {
            return this.treedata;
        };
        FolderTree.prototype.setLeafRequest = function(func) {
            this.leafRequest = func;
        };
        FolderTree.prototype.getLeafRequest = function() {
            return this.leafRequest;
        };
        FolderTree.prototype.shouldMakeLeafRequest = function() {
            return this.leafRequest !== null;
        };
        FolderTree.prototype.setLoadedTree = function(tree) {
            this.loadedTree = tree;
        };
        FolderTree.prototype.getLoadedTree = function() {
            return this.loadedTree;
        };
        FolderTree.prototype.addToLoadedTree = function(nodes) {
            this.loadedTree.push(nodes);
        };
        FolderTree.prototype.areSubFoldersLoaded = function(node) {
            return node.getFolderCount() === node.getSubFolders().length;
        };
        FolderTree.prototype.clonePartialTree = function(node) {
            var partialTree = {};
            Object.keys(node).forEach(function(key) {
                if (key === subFoldersPropName) {
                    partialTree[key] = node[key].map(function(n) {
                        var pt = {};
                        Object.keys(n).forEach(function(k) {
                            pt[k] = k === subFoldersPropName ? [] : n[k];
                        });
                        return this.folderService.convertToFolders(pt);
                    }.bind(this));
                } else {
                    partialTree[key] = node[key];
                }
            }.bind(this));
            return this.folderService.convertToFolders(partialTree);
        };
        FolderTree.prototype.findInTree = function findInTree(node, tree) {
            var treeFolderId = tree[folderIdPropName];
            var treeSubFolders = tree[subFoldersPropName];
            if (angular.isUndefined(treeFolderId)) {
                return;
            }
            if (treeFolderId === node.getFolderId()) {
                return tree;
            }
            if (treeSubFolders instanceof Array && treeSubFolders.length) {
                for (var i = 0, len = treeSubFolders.length; i < len; i++) {
                    var result = findInTree(node, treeSubFolders[i]);
                    if (result) {
                        break;
                    }
                }
                return result;
            }
        };
        FolderTree.prototype.loadNodesUnder = function(node) {
            var defer = $q.defer();
            var promise;
            if (this.areSubFoldersLoaded(node)) {
                defer.resolve(true);
                return defer.promise;
            }
            var treeNode = this.findInTree(node, this.treedata[0]);
            var clonedTree = this.clonePartialTree(treeNode);
            if (this.shouldMakeLeafRequest()) {
                promise = this.leafRequest(node.getFolderId());
            } else {
                defer.resolve([]);
                promise = defer.promise;
            }
            return defer
                .promise
                .then(function(data) {
                    return clonedTree.getSubFolders().concat(data);
                })
                .then(this.addNodes.bind(this, node));
        };
        FolderTree.prototype.addNodes = function(tree, nodes) {
            [].push.apply(tree.getSubFolders(), nodes);
        };
        FolderTree.prototype.loadAndCacheFullTree = function() {
            return this
                .getFolders()
                .then(this.setTreeData.bind(this))
        };
        FolderTree.prototype.loadTree = function(options) {
            var promises = [];
            var loadFolders = null;
            var idToLoad = options.leafId || 0;
            var scopeTree = options.tree || [];
            var clonePartialTree = function(tree) {
                var node = tree[0];
                return this.clonePartialTree(node);
            }.bind(this);
            var handlePromisesResolution = function(responses) {
                var rootNode = responses[0];
                var objects = [];
                if (angular.isUndefined(rootNode.getSubFolders())) {
                    throw new Error("There was a problem with the folder API request");
                }
                if (this.shouldMakeLeafRequest()) {
                    objects = responses[1];
                }
                rootNode.setSubFolders(rootNode.getSubFolders().concat(objects));
                this.addToLoadedTree(rootNode);
                return this.getLoadedTree();
            }.bind(this);
            this.setLoadedTree(scopeTree);
            loadFolders = this
                .loadAndCacheFullTree()
                .then(clonePartialTree);
            promises.push(loadFolders);
            if (this.shouldMakeLeafRequest()) {
                promises.push(this.leafRequest(idToLoad));
            }
            return $q
                .all(promises)
                .then(handlePromisesResolution);
        };
        return FolderTree;
    }]);
'use strict';
angular.module('portalApp')
    .factory('FlashService', ['$rootScope', function($rootScope) {
        var queue = [];
        var currMsgObj = null;
        var _ready = function() {
            currMsgObj = queue.shift() || null;
            if (currMsgObj) {
                $rootScope.$broadcast('flash:show', currMsgObj);
            }
        };
        $rootScope.$on('$stateChangeStart', _ready);
        return {
            setMessage: function(text, type) {
                queue.push({
                    text: text,
                    type: type || 'default'
                });
                return this;
            },
            getMessage: function() {
                return currMsgObj;
            },
            show: function() {
                _ready();
                return currMsgObj;
            },
            clearMsgObj: function() {
                currMsgObj = null;
            }
        };
    }]);
'use strict';
angular.module('portalApp')
    .factory('D3Service', ['$window', function($window) {
        function timeFormat(d3Instance, format) {
            return d3Instance.time.format(format);
        }

        function getStartOfDay(d3Instance, date) {
            return d3Instance.time.day.floor(date);
        }

        function getEndOfDay(d3Instance, date) {
            date.setHours(23, 59, 59, 999);
            return date;
        }
        return {
            getStartOfDay: getStartOfDay,
            getEndOfDay: getEndOfDay,
            timeFormat: timeFormat
        };
    }]);
'use strict';
angular
    .module('portalApp')
    .service('InboundMailingListService', ['$http', '$window', function($http, $window) {
        this.url = function(dataSourceId, emailAddress) {
            return $window.ADOBE.AM.API.DATASOURCES.inboundMailingList.url(dataSourceId, emailAddress);
        };
        this.getEmails = function(dataSourceId) {
            return $http.get(this.url(dataSourceId));
        };
        this.addEmail = function(dataSourceId, emailAddress) {
            return $http.put(this.url(dataSourceId, emailAddress), []);
        };
        this.deleteEmail = function(dataSourceId, emailAddress) {
            return $http.delete(this.url(dataSourceId, emailAddress));
        };
    }]);
angular
    .module('portalApp')
    .factory('TrendReportService', ['$http', '$window', 'ngTableParams', '$filter', '$q', function($http, $window, NgTableParams, $filter, $q) {
        'use strict';

        function TrendReportService() {
            this.cloudVizColors = ['#8cc350', '#5a6eaa', '#d755a5', '#1ebed7', '#f0a01e', '#9b8ce6', '#3cb5a0', '#3287d2', '#f0557d', '#c3d250', '#eb782d', '#78b4f5', '#5faf69', '#aa5fa5', '#fa5a50', '#f5c841'];
            this.getUrl = function() {
                if (this.apiTypeKey && $window.ADOBE.AM.API[this.apiTypeKey].trend && angular.isFunction($window.ADOBE.AM.API[this.apiTypeKey].trend.url)) {
                    return $window.ADOBE.AM.API[this.apiTypeKey].trend.url();
                }
                return '';
            };
            this.getLatestReportDate = function() {
                return $http
                    .get('/portal/api/v1/reports/latest-date')
                    .then(function(response) {
                        return $window.ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(response.data.latestDate);
                    });
            };
            this.dataType = null;
            this.apiTypeKey = null;
            this.trendDataKey = null;
            this.tableColumns = null;
            this.colorMap = null;
            this.setDataType = function(type) {
                if (type === 'TRAIT' || type === 'SEGMENT') {
                    this.reportTypeSet = type;
                    this.dataType = type;
                    this.apiTypeKey = type + 'S';
                    if (type === 'TRAIT') {
                        this.trendDataKey = 'uniques';
                    } else {
                        this.trendDataKey = 'instantUniques';
                    }
                }
            };
            this.getTrendData = function(data) {
                var deferred = $q.defer();
                if (data.sids && data.sids.length === 0) {
                    deferred.reject();
                    return deferred.promise;
                }
                return $http.post(this.getUrl(), data);
            };
            this.setTableColumns = function(selectedItems, sids) {
                var self = this;
                this.tableColumns = [{
                    title: 'Date',
                    field: 'date',
                    visible: true
                }];
                this.colorMap = {};
                sids.forEach(function(sid) {
                    selectedItems.forEach(function(item) {
                        if (item.sid === sid) {
                            var key = item.sid + '',
                                column = {};
                            self.colorMap[key] = item.color;
                            column.title = item.name + '<br /><span class="item-id"> (' + item.sid + ')</span><div class="sort-arrows"></div>';
                            column.field = item.sid + '';
                            column.color = item.color;
                            column.visible = true;
                            self.tableColumns.push(column);
                        }
                    });
                });
            };
            this.plotGraph = function(settings) {
                if (!angular.isObject(settings)) {
                    settings = {};
                }
                var data = settings.data,
                    selector = settings.selector;
                var options = {
                    parent: $window.d3.select(selector).node(),
                    data: data,
                    filled: false,
                    autoResize: true,
                    interactive: true,
                    normalized: !!settings.normalized,
                    legendOrientation: settings.legendOrientation,
                    legendVerticalWidth: settings.legendVerticalWidth
                };
                if (angular.isArray(data.colors) && data.colors.length) {
                    options.colors = data.colors;
                }
                angular.element(selector).show();
                var chart = $window.cloudViz.line(options);
                chart.on('mouseover', function() {
                    this.label(function(d) {
                        return $window.ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(d, 'MM/DD/YYYY');
                    });
                });
                chart.render();
                if (this.reportTypeSet === 'SEGMENT') {
                    this.segmentGraphIsRendered = true;
                } else {
                    this.segmentGraphIsRendered = false;
                }
                return chart;
            };
            this.drawTable = function(data, options, scope) {
                scope.columns = this.tableColumns;
                scope.tableData = data;
                if (!scope.tableParams) {
                    scope.tableParams = new NgTableParams(options, {
                        counts: [],
                        getData: function($defer, params) {
                            var orderedData = params.sorting() ? $filter('orderBy')(scope.tableData, params.orderBy()) : scope.tableData;
                            params.total(orderedData.length);
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
                } else {
                    scope.tableParams.reload();
                }
            };
            this.tdFormat = function(item, key) {
                if (key === 'date') {
                    return $window.ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(item[key], 'MM/DD/YYYY');
                } else {
                    return item[key];
                }
            };
            this.getColorsArray = function(sids) {
                var self = this,
                    colors = [];
                if (angular.isArray(sids) && sids.length) {
                    sids.forEach(function(item) {
                        var color = self.colorMap[item + ''];
                        if (angular.isDefined(color)) {
                            colors.push(color);
                        }
                    });
                }
                return colors;
            };
        }
        return TrendReportService;
    }]);
angular
    .module('portalApp')
    .factory('GeneralReportService', ['$http', '$window', 'ngTableParams', '$filter', 'Pagination', 'Sorting', 'MixinLibrary', 'FlashService', '$sce', function($http, $window, NgTableParams, $filter, asPagination, asSorting, MixinLibrary, flash, $sce) {
        'use strict';

        function GeneralReportService() {
            var self = this;
            this.destinations = [];
            this.apiTypeKey = 'TRAITS';
            this.tableOptions = null;
            this.scope = null;
            this.tableColumns = [{
                title: 'ID',
                field: 'sid',
                visible: true
            }, {
                title: 'Trait',
                field: 'name',
                visible: true
            }, {
                title: 'Destination ID',
                field: 'destinationId',
                visible: false
            }, {
                title: 'Destination',
                field: 'destinationName',
                visible: false
            }, {
                title: 'Mapping',
                field: 'mapping',
                visible: false
            }, {
                title: 'Last 7 Day U',
                field: 'uniques7Day',
                visible: true
            }, {
                title: 'Last 14 Day U',
                field: 'uniques14Day',
                visible: true
            }, {
                title: 'Last 30 Day U',
                field: 'uniques30Day',
                visible: true
            }, {
                title: 'Last 60 Day U',
                field: 'uniques60Day',
                visible: true
            }, {
                title: 'Last 7 Day TF',
                field: 'count7Day',
                visible: true
            }, {
                title: 'Last 14 Day TF',
                field: 'count14Day',
                visible: true
            }, {
                title: 'Last 30 Day TF',
                field: 'count30Day',
                visible: true
            }, {
                title: 'Last 60 Day TF',
                field: 'count60Day',
                visible: true
            }, {
                title: 'Last 7 Day RT',
                field: 'instantUniques7Day',
                visible: true
            }, {
                title: 'Last 14 Day RT',
                field: 'instantUniques14Day',
                visible: true
            }, {
                title: 'Last 30 Day RT',
                field: 'instantUniques30Day',
                visible: true
            }, {
                title: 'Last 60 Day RT',
                field: 'instantUniques60Day',
                visible: true
            }, {
                title: 'Last 7 Day T',
                field: 'totalUniques7Day',
                visible: true
            }, {
                title: 'Last 14 Day T',
                field: 'totalUniques14Day',
                visible: true
            }, {
                title: 'Last 30 Day T',
                field: 'totalUniques30Day',
                visible: true
            }, {
                title: 'Last 60 Day T',
                field: 'totalUniques60Day',
                visible: true
            }];
            this.getUrl = function() {
                return $window.ADOBE.AM.API[this.apiTypeKey].generalReport.url();
            };
            this.setDestinations = function(dests) {
                this.destinations = dests;
            };
            this.getLatestReportDate = function() {
                return $http
                    .get('/portal/api/v1/reports/latest-date')
                    .then(function(response) {
                        return response.data;
                    })
                    .then(function(response) {
                        return $window.ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(response.latestDate);
                    }.bind(this));
            };
            this.formatDateYYYYMMDD = function(date) {
                return $filter('date')(date, 'yyyy-MM-dd');
            };
            this.bindScope = function(scope) {
                var functionsToBind = ['tdValue', 'isSortBy', 'sortTableData', 'retreatPage', 'isPrevPageAvailable', 'getNumOfPages', 'advancePage', 'isNextPageAvailable'];
                functionsToBind.forEach(function(fnName) {
                    scope[fnName] = this[fnName].bind(this);
                }, this);
                scope.pageSelection = 1;
                this.scope = scope;
            };
            this.setDataType = function(type) {
                var title;

                function switchOnSpecialTableColumns(isVisible) {
                    self.tableColumns.map(function(column) {
                        column.visible = isVisible || self.isSortingFieldSupported(column.field);
                    });
                }
                var displaySpecialColumns = !!((this.tableOptions && this.tableOptions.includeDestinationMappings) || (this.tableOptions && this.tableOptions.includeDestinationIds));
                switchOnSpecialTableColumns(displaySpecialColumns);
                switch (type) {
                    case 'TRAIT':
                        this.apiTypeKey = 'TRAITS';
                        title = 'Trait';
                        break;
                    case 'SEGMENT':
                        this.apiTypeKey = 'SEGMENTS';
                        title = 'Segment';
                        break;
                    case 'DESTINATION':
                        this.apiTypeKey = 'SEGMENTS';
                        title = 'Segment';
                        break;
                    default:
                        this.apiTypeKey = null;
                        title = '';
                        break;
                }
                this.tableColumns.some(function(item) {
                    if (item.field === 'name') {
                        item.title = title;
                        return true;
                    }
                });
            };
            this.getDataType = function() {
                return this.apiTypeKey;
            };
            this.getGeneralData = function() {
                angular.extend(this.tableOptions, this.paginatedItems.paging);
                var dataCopy = angular.copy(this.tableOptions);
                if (dataCopy.date) {
                    dataCopy.date = new Date(dataCopy.date).getTime();
                }
                return $http.post($window.ADOBE.AM.API[this.apiTypeKey].generalReport.url(), dataCopy);
            };
            this.setTableColumnVisibility = function(options) {
                if (angular.isObject(options)) {
                    Object.keys(options).forEach(function(field) {
                        this.tableColumns.some(function(column) {
                            if (column.field === field) {
                                column.visible = !!options[field];
                                return true;
                            }
                        });
                    }, this);
                }
            };
            this.setTableColumnTypeVisibility = function(types) {
                var options = {};
                if (angular.isObject(types)) {
                    Object.keys(types).forEach(function(type) {
                        if (['uniques', 'count', 'instantUniques', 'totalUniques'].indexOf(type) > -1) {
                            options[type + '7Day'] = !!types[type];
                            options[type + '14Day'] = !!types[type];
                            options[type + '30Day'] = !!types[type];
                            options[type + '60Day'] = !!types[type];
                        }
                        if (type === 'mapping' && self.scope.genReportCtrl.report.isDestinationReportType()) {
                            options[type] = self.scope.genReportCtrl.report.filters.mapping = true;
                        }
                    });
                }
                this.setTableColumnVisibility(options);
            };
            this.drawTable = function() {
                this.scope.columns = this.tableColumns;
                this.getGeneralData()
                    .then(this.handleAndTransformResponseWithMappings)
                    .then(function(response) {
                        this.handleResponse(response.data);
                        this.scope.$data = response.data.list || [];
                        angular.element('.AS-Pagination').show();
                        this.scope.modals.loading = false;
                    }.bind(this))
                    .catch(function(response) {
                        flash.setMessage($window.ADOBE.AM.MESSAGES.getAPIErrorMessage(response), 'error').show();
                    });
            };
            this.handleAndTransformResponseWithMappings = function(response) {
                var list = response.data.list;
                var resultData = [];
                var flattenObject = this.apiTypeKey === 'SEGMENTS' && (this.tableOptions.includeDestinationMappings || (this.tableOptions.includeDestinationIds && this.tableOptions.includeDestinationIds.length));
                if (this.apiTypeKey === 'TRAITS') {
                    return response;
                }
                if (flattenObject) {
                    list.forEach(function(segment) {
                        if (angular.isUndefined(segment.mappingsByDestinationId) && !angular.isArray(segment.mappingsByDestinationId)) {
                            return;
                        }
                        Object.keys(segment.mappingsByDestinationId).forEach(function(destinationId) {
                            var destination = null;
                            destination = self.destinations.filter(function(dest) {
                                return dest.destinationId === parseInt(destinationId, 10);
                            });
                            destination = destination[0] || {};
                            var rowData = {
                                name: segment.name,
                                sid: segment.sid,
                                destinationName: destination.name,
                                destinationId: destinationId
                            };
                            angular.extend(rowData, segment.metrics);
                            segment.mappingsByDestinationId[destinationId].forEach(function(mapping) {
                                if (!rowData.mapping) {
                                    rowData.mapping = mapping;
                                } else {
                                    rowData.mapping += ', ' + mapping;
                                }
                            });
                            resultData.push(angular.copy(rowData));
                        });
                    });
                    response.data.list = resultData;
                }
                return response;
            }.bind(this);
            this.tdValue = function(item, key) {
                if (angular.isObject(item)) {
                    if (angular.isDefined(item[key])) {
                        return $sce.trustAsHtml(item[key] + '');
                    } else if (angular.isObject(item.metrics)) {
                        var val = item.metrics[key];
                        return angular.isNumber(val) ? val + '' : '';
                    }
                }
                return '';
            };
            this.isSortBy = function(field, direction) {
                var descendingValue = false;
                if (!this.isSortingFieldSupported(field)) {
                    return;
                }
                if (field === this.sortingItems.sortBy && (direction === 'asc' || direction === 'desc')) {
                    if (direction === 'desc') {
                        descendingValue = true;
                    }
                    if (descendingValue === !!this.tableOptions.descending) {
                        return true;
                    }
                }
                return false;
            };
            this.isSortingFieldSupported = function(field) {
                return ['destinationId', 'destinationName', 'mapping'].indexOf(field) === -1;
            };
            this.sortTableData = function(field) {
                if (!this.isSortingFieldSupported(field)) {
                    return;
                }
                var descendingValue = this.isSortBy(field, 'asc');
                this.sortingItems.sortBy = field;
                this.sortingItems.descending = descendingValue;
                angular.extend(this.tableOptions, this.sortingItems);
                this.scope.modals.loading = true;
                this.drawTable();
            };
            this.retreatPage = function() {
                this.prevPage();
                this.scope.pageSelection = parseInt(this.paginatedItems.paging.page, 10) + 1;
            };
            this.advancePage = function() {
                this.nextPage();
                this.scope.pageSelection = parseInt(this.paginatedItems.paging.page, 10) + 1;
            };
        }
        MixinLibrary.mixin(asSorting, GeneralReportService.prototype, {
            sortBy: 'name',
            descending: false
        });
        MixinLibrary.mixin(asPagination, GeneralReportService.prototype, {
            page: 0,
            pageSize: 10,
            getItemsReference: function() {}
        });
        return GeneralReportService;
    }]);
'use strict';
angular
    .module('portalApp')
    .service('myModal', ['$window', function($window) {
        var modal = null,
            error_options = {
                type: 'error',
                heading: 'Error',
                content: 'Sorry.  There was an error.  Please try again.',
                buttons: [{
                    label: 'Close',
                    className: 'cancel',
                    click: 'hide'
                }]
            },
            success_options = {
                type: 'success',
                heading: 'Success',
                content: 'Success!',
                buttons: [{
                    label: 'Close',
                    className: 'cancel',
                    click: 'hide'
                }]
            },
            confirm_options = {
                type: 'help',
                heading: 'Confirmation',
                content: 'Proceed?',
                buttons: [{
                    label: 'OK',
                    click: 'hide'
                }, {
                    label: 'Cancel',
                    className: 'cancel',
                    click: 'hide'
                }]
            };
        var center = function() {
            if (modal) {
                setTimeout(function() {
                    modal.$element.css({
                        left: $window.innerWidth / 2,
                        top: $window.innerHeight / 2,
                        marginLeft: -(modal.$element.width() / 2),
                        marginTop: -(modal.$element.height() / 2)
                    });
                }, 0);
            }
        };
        this.getModal = function() {
            if (!modal) {
                init();
            } else {
                modal.$element.attr('class', 'modal coral-Modal');
            }
            return modal;
        };
        this.show = function() {
            if (!modal) {
                init();
            } else {
                center();
                modal.show();
            }
        };
        this.hide = function() {
            modal.hide();
        };
        this.successModal = function(options) {
            options = options || {};
            if (!modal) {
                init();
            }
            angular.extend(success_options, options);
            return modal.set(success_options);
        };
        this.errorModal = function(options) {
            options = options || {};
            if (!modal) {
                init();
            }
            angular.extend(error_options, options);
            return modal.set(error_options);
        };
        this.confirmModal = function(options) {
            options = options || {};
            if (!modal) {
                init();
            }
            angular.extend(confirm_options, options);
            return modal.set(confirm_options);
        };

        function init() {
            modal = new $window.CUI.Modal({
                element: '#modal'
            });
            center();
        }
    }]);
'use strict';
var app = angular.module('portalApp');
app
    .filter('capitalize', function() {
        return function(input, every) {
            if (every) {
                var splitWords = input.split(' ');
                for (var i = 0; i < splitWords.length; i++) {
                    splitWords[i] = splitWords[i].charAt(0).toUpperCase() + splitWords[i].slice(1);
                }
                return splitWords.join(' ');
            } else {
                if (input) {
                    return input.charAt(0).toUpperCase() + input.slice(1);
                } else {
                    return '';
                }
            }
        };
    })
    .filter('titlecase', function() {
        return function(str) {
            if (str && typeof str === 'string') {
                return str.toString().toLowerCase().replace(/_|-/g, ' ').replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        };
    })
    .filter('utcTimeString', function() {
        return function(timestamp, format) {
            var _format = format || 'YYYY-MM-DD';
            var _moment = window.moment;
            if (timestamp && _moment) {
                return _moment.utc(timestamp).format(_format);
            }
        };
    });