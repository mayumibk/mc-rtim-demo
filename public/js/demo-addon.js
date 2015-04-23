/*
 * ************************************************************************
 *
 *  ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   (c) Copyright 2015 Adobe Systems, Inc.
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 * ************************************************************************
 */

/*
 * demo addon - v1.0.0 - 2015-02-24
 * Copyright (c) 2014 Adobe Systems, Inc. All Rights Reserved.
 */

// Define the element we wish to bind to.
var titleField = '.titleField';
var description = '.descriptionField';
var audienceTitle = '.segment-title';
var audienceDescription = '.segment-des';

// Prevent double-binding.
$(document.body).off('change', titleField);
$(document.body).off('change', description);
$(document.body).off('change', audienceTitle);
$(document.body).off('change', audienceDescription);

// Bind the event to all body descendants matching the "bind_to" selector.
$(document.body).on('change keyup', titleField, function(event) {
	var titleValue = "";
    if(this.value.substring(0,1).toLowerCase() == "1")
        titleValue = "Mortgage Prospects";
    if(this.value.substring(0,1).toLowerCase() == "3")
        titleValue = "Mortgage Prospects";
    var scope = angular.element(this).scope();
    scope.$apply(function() {
    	scope.segment.name = titleValue;
    });
});
$(document.body).on('change keyup', description, function(event) {
	var descriptionValue = "";
    if(this.value.substring(0,1).toLowerCase() == "2")
        descriptionValue = "Travel card audience showing interest in Mortgage products.";
    if(this.value.substring(0,1).toLowerCase() == "4")
        descriptionValue = "Travel card audience showing interest in Mortgage products.";
    var scope = angular.element(this).scope();
    scope.$apply(function() {
    	scope.segment.description = descriptionValue;
    });
});

$(document.body).on('change keyup', audienceTitle, function(event) {
    if(this.value.substring(0,1).toLowerCase() == "1")
        this.value = "CC real time";
});

$(document.body).on('change keyup', audienceDescription, function(event) {
    if(this.value.substring(0,1).toLowerCase() == "2")
        this.value = "Real time audience for travel card campaign";
});


$("#save-new-segment").on("click", function(){
    var payload = {"name": $("input[name='title']").val(), "description":$("textarea[name='description']")};
    $.ajax({
        type:'POST',
        url: '/audiences.html/save.segment.html',
        data: payload,
        success: function(data) {
            window.location.href = "/audiences.html";
        }
    })

});

