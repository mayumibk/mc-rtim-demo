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

router.get('/feed.html', function(req,res){
    res.render('board',{title:"Express"});
});

router.get('/target.html', function (req,res){
    res.render('target/launchpad',{title:"Express"});
});

router.get('/analytics.html',function(req,res){
    res.render('analytics_launchpad',{title:"Express"});
});

router.get('/analytics/dashboard.html', function(req,res){
    res.render('analytics_dashboard',{title:"Express"});
});

module.exports = router;