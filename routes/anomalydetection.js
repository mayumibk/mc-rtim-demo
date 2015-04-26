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
var bodyParser = require('body-parser');
var rsid="swhstarwoodver2";
var demo = require('../libs/demo-controller.js');
var session = require('cookie-session');
var jobID="1174";


/* GET the Anomaly Detection UI. */
router.get('/', function(req, res, next) {
    res.render('anomalydetection', demo.config);
});

/* GET the Contribution Analysis UI. */
router.get('/contributionanalysis', function(req, res, next) {
    res.render('contributionanalysis', demo.config);
});

/* GET the Segment Builder UI */
router.get('/segmentbuilder', function(req,res,next){
    res.render('segmentbuilder', demo.config);
});

/* GET the Segment Manager UI */
router.get('/componentmanager', function(req,res,next){
    res.render('componentmanager', demo.config);
});


router.all('*/index.html', function(req, res){
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
        if(a == "Dashboard.Localized")
            jsonResponse = demo.readJSON('dashboard-localized.json');

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


router.all('/contributionanalysis/queue', function(req,res){
    res.set('Content-Type','application/json');
    var showCompleted = req.query.showCompleted;

    // First request
    if (req.query.locale == "en_US") {
        if (req.session.demoState == undefined) {
            req.session.demoState = "init";
        }
        return res.send("{\"jobId\":" + jobID + ",\"reinsert\":0}");
    }

    // Subsequent requests
    if(showCompleted == "1"){
        if(!req.session.demoState)
            return res.send("");
        if(req.session.demoState == "init"){
            req.session.demoState = "complete";
            return res.send(demo.updateQueueData(demo.readJSON("queue_stage2.json")));
        }
        if(req.session.demoState == "complete"){
            return res.send(demo.updateQueueData(demo.readJSON("queue_stage3.json")));
        }

    }

    //Call from Contribution Analysis UI.
    if(req.query.a.length > 0) {
        return res.send(demo.replaceSegmentNamesInData(jobID + ".json"));
    }
});


router.get('/contributionanalysis/' + rsid + '/configdata', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("configdata.json"));
});

router.get('/shellnotifications', function(req, res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('shellnotifications.json'));
});

router.get('/usergroups/custom/me', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('me.json'));
});

router.get('/contributionanalysis/' + rsid + '/configdata/estimate', function(req, res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('estimate.json'));
});

router.get('/data/event79',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('event79.json'));
});


router.post('/pastebin',function(req,res){
    var jsonString = '';
    req.on('data', function (data) {
        jsonString += data;
    });
    req.on('end', function () {
        req.session.pastebin = demo.updatePasteBinData(jsonString);
        res.send("{}");
    });
});

router.get('/pastebin',function(req,res){
    res.set('Content-Type','application/json');
    res.send(req.session.pastebin);
});

router.get('/dimensions', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("dimensions.json"));
});

router.get('/metrics', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("metrics.json"));
});

router.get('/tags', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("tags.json"));
});

router.get('/aamstatus', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("aamstatus.json"));
});

router.post('/segmentSummary', function(req,res) {
    res.set('Content-Type', 'application/json');
    // Use body-Parser to handle this post.
    if (req.body.func == "segment") {
        return res.send(demo.updateSegmentSummaryData(req.body, demo.readJSON('segmentsummary.json')));
    } else {
        return res.send(demo.readJSON("segmentsummary.json"));
    }
});


router.get('/segments', function(req,res){
    res.set('Content-Type', 'application/json');
    if(!req.session.segmentList) {
        return res.send(demo.readJSON('segmentList.json'));
    } else {
        return res.send(req.session.segmentList);
    }
});

// Save the new segment
router.post('/segments',function(req,res){
    res.set('Content-Type', 'application/json');
    var jsonSegments = [];

    // Load the segments from the session if available.
    if (req.session.segmentList != undefined) {
        jsonSegments = req.session.segmentList;
    } else {
        jsonSegments = JSON.parse(demo.readJSON("segmentList.json"));
    }
    // Store the updated segment list in the session object.
    var segmentName = req.body.name;
    var segmentDesc = req.body.description;

    req.session.segmentList = demo.saveSegment(segmentName, segmentDesc, jsonSegments);

    // Create a success response to send to the UI
    var jsonResponseTemplate = JSON.parse(demo.readJSON('newsegment-response-template.json'));
    jsonResponseTemplate.name = segmentName;
    jsonResponseTemplate.description = segmentDesc;
    return res.send(jsonResponseTemplate);
});

router.put('/tags/tagitems', function(req,res){
    res.set('Content-Type', 'application/json');
    res.send(demo.readJSON('tags.json'));
});

router.put('/tags', function(req,res){
    res.set('Content-Type', 'application/json');
    res.send(demo.readJSON('tags.json'));
});

router.all('/ranked', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("ranked.json"));
});

router.get('/users', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON("users.json"));
});

router.get('/demosegments',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getConfig());
});


module.exports = router;