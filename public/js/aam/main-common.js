require.config({
    paths : {
        'AlgoTraitBuilderApp' : 'adobe_am/algotrait_builder/main_algotrait_module',
        'domReady' : 'require/domReady-2.0.1',
        'adobe' : 'adobe_am/adobe_am_utils',
        'underscore' : 'backbone/underscore-1.3.3',
        'backbone' : 'backbone/backbone-0.9.2-build',
        'app': 'adobe_am/app',
        'adobe.backbone_components' : 'adobe_am/bb_mvc',
        'adobe.widgets' : 'adobe_am/widget',
        'adobe.templates' : 'adobe_am/templates',
        'jquery' : 'jquery/jquery-1.7.2',
        'jquery.jquery-ui-1.8.16' : 'jquery_plugins/jquery-ui-1.8.16.min',
        'jquery.jstree' : 'jquery_plugins/jquery.jstree',
        'jquery.numeric' : 'jquery_plugins/jquery.numeric',
        'jquery.dateformat' : 'jquery_plugins/jquery.dateFormat-1.0',
        'json2' : 'json2',
        'backbone.marionette' : 'backbone/backbone.marionette-0.9.10',
        'backbone.paginator' : 'backbone/backbone.paginator',
        'jquery.flot' : 'flot/jquery.flot.min',
        'jquery.crosshair' : 'flot/jquery.flot.crosshair.min',
        'trait' : 'adobe_am/trait',
		'mediator' : 'mediator/mediator',
        demdex_utils : 'demdex_utils',
        demdex_graph : 'demdex/graph',
		'aui' : 'https://www.omniture-static.com/aui/1.0.2/js/aui-min.js',
        cloudViz : 'cloudviz/3.4.0/cloudviz',
        'd3' : 'd3/d3',
        'dv' : 'cloudviz/3.4.0/dv',

        // AlgoTraitBuilder
        routing_helper : 'adobe_am/routing',
        CreateEditAppRouting : 'adobe_am/algotrait_builder/create_edit_app_routing',
        AlgoTraitBuilder : 'adobe_am/algotrait_builder/algo_trait_builder',
        CreateEditApp : 'adobe_am/algotrait_builder/create_edit_app',
        AlgoTrait : 'adobe_am/algotrait_builder/algotrait',
        models_modal : 'adobe_am/algotrait_builder/models_modal'
    },
    shim : {
        'app' : {
            exports : 'APP'
        },
        'aui' : {
            exports : 'AUI'
        },
        'jquery' : {
            exports : '$'
        },
        'underscore' : {
            exports : '_'
        },
        'jquery.flot' : ['jquery'],
        'jquery.crosshair' : ['jquery.flot'],
        'jquery.jstree' : ['jquery'],
        // support traditional browser globals
        'backbone': {
            deps : ['underscore', 'jquery'],
            exports : 'Backbone'
        },
        'backbone.marionette' : ['backbone'],
        'backbone.paginator' : ['jquery', 'backbone'],
        'adobe' : {
            deps : ['jquery', 'underscore'],
            exports : 'ADOBE'
        },
        'adobe.templates' : {
            deps : ['app', 'adobe'],
            exports : "APP.templates"
        },
        'adobe.widgets' : ['adobe', 'jquery', 'jquery.jquery-ui-1.8.16'],
        'adobe.backbone_components' : ['backbone', 'adobe', 'backbone.paginator'],
        'jquery.jquery-ui-1.8.16' : ['jquery'],
        demdex_utils : {
            exports : 'DEMDEX.UTILS'
        },
        demdex_graph : {
            exports : 'DEMDEX.GRAPH'
        },
        'cloudViz' : {
            deps : ['jquery', 'd3', 'dv']
        }
    }
});