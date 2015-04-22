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
var session = require('cookie-session');
var demo = require('../libs/demo-controller.js');
var moment = require('moment');

router.get('/', function(req, res) {
    res.render('audiences/audiencelist', demo.config);
});

router.get('/audiencelibrary.fulllist.html', function(req,res){
    demo.updateAudienceList(req.session.segmentList);
    res.render('audiences/fulllist', demo.config);
});

router.get('/create.html/*',function(req,res){
    res.render('audiences/createaudience', { title: 'Express' });
});

router.get('/userinfo.json',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('audiences/userinfo.json'));
});

router.get('/dict.en.json',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('audiences/dict.en.json'));
});

module.exports = router;