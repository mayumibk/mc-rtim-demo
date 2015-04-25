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
var router = express.Router();

router.get('/Analytics/reports.ddx', function(req, res, next) {
    res.render('aam_dasboard',{title:"Express"});
});

router.get('/Traits/Traits.ddx',function(req,res){
    if(req.originalUrl.indexOf("show/list") > 0)
        res.render('aam-traits',{title: "Express"});
    if(req.originalUrl.indexOf("new/model") > 0)
        res.render('aam/traits-model',{title:"Express"});
});

router.get('/Segments/SegmentBuilder.ddx',function(req,res){
    res.render('aam/segmentbuilder',{title: "Express"});
});

router.get('/Segments/Models.ddx', function(req,res){
    res.render('aam/modelbuilder',{title:"Express"});
});

router.get('/common/scripts/adobe_am/reports/dashboard/view.html', function(req, res, next) {
    res.render('report-view',{title:"Express"});
});



router.post('/common/header.jsonp', function(req, res, next) {
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('header.jsonp'));
});


router.get('/combined.js',function(req,res){
    var id = req.query.id;
    res.send(demo.readJSON('aam/' + id + ".js"));
});
module.exports = router;