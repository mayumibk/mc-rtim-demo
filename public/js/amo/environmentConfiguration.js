/**
 * Modify this file after a build (under dist/amo/generated-lib/amo-constants.js)
 * if there is a need to introduce environment specific configurations to the app.
 *
 * Only push changes to its source (under static-lib) with dev-time values. Doing the contrary will hinder
 * the team's dev process (you'll break everyone's build and maybe even some automated ones).
 *
 ********** DON'T FORGET gulp lib OR npm install IF YOU DO CHANGE SOMETHING FOR DEV ************
 *
 * DIRECTORY OF CONSTANTS:
 * API_PATH: The URL for the app to find the REST endpoints required for its operation.
 *
 * Created by garodrig on 11/21/14.
 */
(function () {
    'use strict';

    angular.module('amoEnvironmentConfiguration', [])
        .constant('API_PATH', '/display/api/clients/') // These are set in gulp env-config. Type 'gulp -h env-config' for more.
        .constant('JAVA_REPORT_SERVER_PORT', null || top.location.port)
        // Had to add because we closed off the X domain capabilities which made it so we couldn't access hostname anymore, not a problem when running on live.
        .constant('JAVA_REPORT_SERVER_HOSTNAME', null || top.location.hostname)
        .constant('JAVA_REPORT_SERVER_PROTOCOL', null || top.location.protocol);
})();
