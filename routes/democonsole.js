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


router.get('/', function(req, res) {
    res.render('democonsole', { title: 'Demo Console' });
});

router.post('/index.html',function(req, res){
    demo.updateDemoConfig(req.body);
    res.send("Saved");
});

router.get('/index.html',function(req,res){
    var response = demo.getConfig();
    res.send(response);
});

router.post('/resetdemo.html',function(req,res){
    req.session = null;
    res.send("session closed.");
});

router.post('/uploadavatar',function(req,res){
    demo.updateDemoAvatar(req.files);
    res.send("File Uploaded.");
});

router.post('/metrics', function(req,res){
    //Change this to handle body-parser
        demo.saveJSON(req.body,'metrics.json');
        res.send("Metrics Updated Successfully.");
});

router.post('/segments',function(req,res){
    demo.saveJSON(req.body,'segmentList.json');
    res.send("Segments Updated Successfully.")
});

router.post('/dimensions',function(req,res){
    demo.saveJSON(req.body,'dimensions.json');
    res.send("Segments Updated Successfully.")
});

module.exports = router;