/*
 * ************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *   Copyright 2015 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 * ************************************************************************
 */

// Enable the Save button if any field has been changed.
//$("input").bind('input', function(){
//    $('#save-configuration').removeClass('disableAndOpaque');
//});



var app = angular.module('consoleApp',['angular.filter']);

app.controller(
    'consoleController',
    function($scope, consoleService){
        $scope.config=[];
        $scope.metrics=[];
        $scope.dimensions=[];
        $scope.segments=[];

        loadRemoteData();

        $scope.saveChanges = function(){
            consoleService.saveData($scope.config,'/democonsole/index.html').then(console.warn('config saved.'),console.error('Unable to save config.'));
            consoleService.saveData($scope.events,'/democonsole/metrics').then(console.warn('events saved.'),console.error('Unable to save events.'));
            consoleService.saveData($scope.dimensions,'/democonsole/dimensions').then(console.warn('dimensions saved.'),console.error('Unable to save dimensions.'));
            consoleService.saveData($scope.segments,'/democonsole/segments').then(console.warn('segments saved.'),console.error('Unable to save segments.'));
        };

        $scope.updateSegments = function() {
            $scope.config.secondSegment[0].name = $scope.config.firstSegment[0].name;
            $scope.config.secondSegment[1].name = $scope.config.firstSegment[1].name;
            $scope.apply();
        };

        $scope.addAudience = function(){
            $scope.config.audiences.push({});
        };

        $scope.addAudienceDimension = function(){
            $scope.config.dimensions.push({});
        };

        function loadRemoteData() {
            consoleService.getData('/democonsole/index.html').then(function(config){
                $scope.config = config;
            });
            consoleService.getData('/reports/anomalydetection/metrics').then(function(events){
                $scope.events = events;
            });
            consoleService.getData('/reports/anomalydetection/dimensions').then(function(dimensions){
                $scope.dimensions = dimensions;
            });
            consoleService.getData('/reports/anomalydetection/segments').then(function(segments){
                $scope.segments = segments;
            });
        }
    }
);

app.service(
    'consoleService',
    function($http,$q){

    return({
        getData: getData,
        saveData: saveData
    });


    function getData(endpoint){
        var request = $http({
            method: "get",
            url: endpoint,
            params: {
                action: "get"
            }
        });
        return(request.then(handleSuccess, handleError));
    }

    function saveData(dataPayload, endpoint){
        var request = $http({
            method  : 'POST',
            url     : endpoint,
            data    : dataPayload,  // pass in data as strings
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
        return(request.then(handleSuccess, handleError));
    }

    function handleError(response){
        if (
            ! angular.isObject( response.data ) ||
            ! response.data.message
        ) {

            return( $q.reject( "An unknown error occurred." ) );

        }

        // Otherwise, use expected error message.
        return( $q.reject( response.data.message ) );
    }

    function handleSuccess(response){
        return(response.data);
    }

});


// Event to handle file upload success.
$('#dropzone , #avatar-image').on('fileuploadsuccess',function(data){
    $('#dropzone').hide();
    $('#avatar-image').attr("src","/images/" + data.item.fileName);
    $('#avatar-image').fadeIn('slow');
});