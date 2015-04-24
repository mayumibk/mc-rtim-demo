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
var demo = require('../libs/demo-controller.js');
var session = require('cookie-session');
var router = express.Router();

router.get('/reports/latest-date', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/latestdate.json'));
});


router.get('/reports/most-changed-traits', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/mostcachedtraits.json'));
});

router.get('/reports/largest-traits', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/largesttraits.json'));
});


router.get('/reports/largest-segments', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/largestsegments.json'));
});


router.get('/reports/largest-traits', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/largesttraits.json'));
});

router.post('/reports/traits-trend', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/traits-trend.json'));
});

router.get('/reports/most-changed-segments', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/mostchangedsegments.json'));
});

router.get('/reports/partner-uniques', function(req, res, next) {
    var restrict = req.query.restrictType;
    var jsonFile = "aam/partner-uniques.json";
    if(restrict == "ALGO_TRAIT")
        jsonFile = "aam/partner-uniques-algo.json";
    if(restrict == "RULE_BASED_TRAIT")
        jsonFile = "aam/partner-uniques-rules-based.json";
    if(restrict == "ON_BOARDED_TRAIT")
        jsonFile = "aam/partner-uniques-onboarded.json";

    res.set('Content-Type','application/json');
    res.send(demo.readJSON(jsonFile));
});

router.post('/reports/segments-trend', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/segments-trend.json'));
});

router.get('/reports/segments-trend/*', function(req, res) {
    var url = req.originalUrl.substring(0,req.originalUrl.lastIndexOf('?'));
    var segmentId = url.substring(url.lastIndexOf('/') + 1);

    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/segments-trend-' + segmentId + '.json'));
});


router.get('/traits',function(req,res){
    var folderID = req.query.folderId;
    var jsonFile = "aam/traits.json";
    if(!folderID == undefined){
        jsonFile = "aam/traits-folder-" + folderID + ".json";
    }
    res.set('Content-Type','application/json');
    res.send(demo.readJSON(jsonFile));
});

router.get('/segments', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/all-segments.json'));
});

router.get('/folders/traits', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/aam-folder-traits.json'));
});

router.get('/folders/segments/*', function(req,res){
    var url = req.originalUrl.substring(0,req.originalUrl.length - 1);
    var folderId = url.substring(url.lastIndexOf('/') + 1);

    res.set('Content-Type','application/json');
    if(folderId == "segments") {
        res.send(demo.readJSON('aam/folder-segments.json'));
    } else {
        res.send(demo.retrieveAAMSegmentFolder(folderId,demo.readJSON('aam/folder-segments.json')));
    }
});

router.get('/datasources', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/aam-datasources-traits.json'));
});

router.get('/algorithms', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('aam/algorithms.json'));
});

router.get('/segments/*', function(req,res){
    var url = req.originalUrl.substring(0,req.originalUrl.length - 1);
    var segmentId = url.substring(url.lastIndexOf('/') + 1);

    res.set('Content-Type','application/json');
    res.send(demo.retrieveAAMSegment(segmentId, demo.readJSON('aam/all-segments.json')));
});

router.post('/models', function(req,res){
    var newModel = demo.saveAAMModel(JSON.stringify(req.body));
    req.session.models = demo.updateAAMModels(newModel, req.session.models);
    res.set('Content-Type','application/json');
    res.send(newModel);
});

router.get('/models/*', function(req,res){
    var url = req.originalUrl.substring(0,req.originalUrl.lastIndexOf('?'));
    var modelId = url.substring(url.lastIndexOf('/') + 1);

    res.set('Content-Type','application/json');
    if(modelId == "") {
        // check if this is latest stats request
        if(url.indexOf("/runs/latest/stats") > 0) {
            modelId = url.substr(url.indexOf("models/"),url.indexOf("/runs"));
            return res.send(demo.readJSON('aam/latest-run-stats.json'));
        }
        if(req.session.models){
            return res.send(req.session.models);
        } else {
            return res.send(demo.readJSON('aam/models.json'));
        }
    } else {
        return res.send(demo.retreiveAAMModel(modelId,req.session.models));
    }


});

router.get('/customer-trait-types', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('/aam/customer-trait-types.json'));
});

router.get('/taxonomies/*', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('/aam/taxonomies.json'));
});


module.exports = router;