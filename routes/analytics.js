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

var express = require('express');
var router = express.Router();
var demo = require('../libs/demo-controller.js');


router.all('/index.html', function(req, res){
    var a = req.query.a;
    var jsonResponse="";

    if(a != "") {
        if(a == "Menus.GetAnalyticsMenu")
            jsonResponse = demo.readJSON("AnalyticsMenu.json");

        if(a == "Menus.GetMyAnalyticsMenu")
            jsonResponse = demo.readJSON("MyAnalyticsMenu.json");

        if(a == "Menus.GetAnalyticsReportsMenu")
            jsonResponse = demo.readJSON("AnalyticsReportsMenu.json");

        if(a == "Predictive.GetMetrics")
            jsonResponse = demo.readJSON("predictive.metrics.json");

        if(a == "Predictive.GetData")
            jsonResponse = demo.updatePredictiveData(demo.readJSON("Data.json"));

        if(a == "Shell.GetUser")
            jsonResponse = demo.updateUserJSON('User.json');

        if(a == "User.GetPersistentAttribute")
            jsonResponse = demo.readJSON("GetPersistentAttribute.json");

        if(a == "ReportSuite.List")
            jsonResponse = demo.updateReportSuiteList(demo.readJSON("ReportSuiteList.json"));

        if(a == "Bookmark.GetFolders")
            jsonResponse = demo.readJSON("BookmarkFolders.json");

        if(a == "ranked")
            jsonResponse = demo.readJSON('ranked.json');

        if (a == "Product.SwitchProduct") {
            var redirectCommand = req.query.redirect_command;
            if(redirectCommand == "ContributionAnalysis")
                return res.redirect('../contributionanalysis');
            if(redirectCommand == "SegmentBuilder")
                return res.redirect('../segmentbuilder');
            if(redirectCommand == "ComponentManager" || !redirectCommand)
                return res.redirect('componentmanager');
        }

        res.set('Content-Type','application/json');
        res.send(jsonResponse);
    }

});



module.exports = router;