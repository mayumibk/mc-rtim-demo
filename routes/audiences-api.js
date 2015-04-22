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

router.get('/*/folder.newaudience.reportSuite.html',function(req,res){
    res.render('audiences/reportsuites',{title:"Express"});
});

router.get('/*/folder.newaudience.attributeType.html',function(req,res){
    res.render('audiences/attributetypes',{title:"Express"});
});

router.get('/*/folder.newaudience.dimension.html',function(req,res){
    res.render('audiences/dimensions',demo.config);
});

router.get('/*/folder.newaudience.events.html',function(req,res){
    res.render('audiences/events',{title:"Express"});
});

router.get('/*/folder.newaudience.evarValues.html',function(req,res){
    res.render('audiences/evarValues',{title:"Express"});
});

router.get('/*/folder.list.html',function(req,res){
    var segmentList="";
    if(req.query.page == "0") {
        if (req.session.segmentList) {
            segmentList = req.session.segmentList;
        } else {
            segmentList = JSON.parse(demo.readJSON('segmentList.json'));
        }
        res.render('audiences/macsegments', {segments: demo.prependBlankSegment(segmentList)});
    }
});

router.get('/*/folder.newaudience.macAudiences.html', function(req,res){
    res.render('audiences/macaudiences', demo.config);
});

router.post('/folder',function(req,res){
    var action = req.body.action;
    var response = {"response":{"traitId":"1187883T"},"success":true};
    res.set('Content-Type','application/json');

    if(action == 'create_audience') {
        demo.saveAudience(req.body.data);
    }
    res.send(response);
});

router.get('/folder',function(req,res){
   var action = req.query.action;
    var response = {"response":{"1837308T":{"size":{"DAYS30":"190120"},"sizeDataType":"historicalEstimate","daysLeft":29}},"success":true};
    if(action == "fetch_segment_size"){
        res.set('Content-Type','application/json');
        res.send(response);
    }

});

module.exports = router;