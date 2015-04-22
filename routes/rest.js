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

router.get('/head/orgUnitActivity/*/byText',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('activityOverview.json'));
});

router.get('/head/programSummary/byPlanning/withParent/byText', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('programSummary.json'));
});

router.get('/head/program/EVd6HaPHY3usuw_PPSAP8K5AmVhKU8aJjIQEt7AsM9BZVuBioqzJrLZGJRZA-kkuPlDCdpDZr2NdtR6-QMfaHQ/*/byText', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('program.json'));
});

router.get('/head/program/KIGjn-RHQ84C0dKfUO7nxVw6WbvOlETlDAtOEWQA3hdije_6lUd5swWgr2DbjC4yn7RaRMZFUQOOCMfVuuNOEQ/activities/byPlanning/byText',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('program1.json'));
});

router.get('/head/program/Yq-RoZqwbveYtQsfXk2WwFiZQRsrOjhcUEAA5HoYf09GTiuReyYMY1J7KHRPaVcfbeVH7WfqBa0Dnz_6XR4xmw/*/byText',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('program2.json'));
});

router.get('/head/campaign/QEZ2JOqRdkXczD6JmjgpDtBx7kJFnsCCOPY8aTCpEWHbnmR8m8FZ41LEBVwV9HFe/*/byText',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('campaign.json'));
});

router.post('/head/workflow/*/tmp', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('tmp.json'));
});

router.post('/head/workflow/*/activities/activity', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('activity.json'));
});

router.patch('/head/workflow/*',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('patch.json'));
});


router.get('/head/workflow/*/tempMetadata', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('tempMetadata.json'));
});

router.get('/head/webPageStructure', function(req,res){
    var name = req.query.name;
    var jsonFile = "";
    if(name == "workflow/saveAudience"){
        jsonFile = 'saveAudienceStructure.json';
    } else if(name =="workflow/query") {
        jsonFile = 'audienceSelectionStructure.json';
    }else {
        jsonFile = 'webPageStructure.json';
    }
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON(jsonFile));
});

router.get('/head/workflow/wnykhNsawKK1gpu9Af2QevuFEhEpX-3x-umpuMc8G6G7CqK-u2AvKfV5Vdfujbdd/deliveries/8K-We4UAcqxwmNETYePGs0Fii10x0QVlsDp8jjsMVDY',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('8K-We4UAcqxwmNETYePGs0Fii10x0QVlsDp8j.json'));
});

router.get('/head/workflow/wnykhNsawKK1gpu9Af2Qei9SoBM-D4hHsYfuQBFXMEE', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('workflow.json'));
});

router.get('/head/contentModelBase/byText/byContentType',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('delivery.json'));
});

router.get('/head/resourceType/profile/*', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('resourceTypeProfile.json'));
});

router.get('/head/resourceType/resourceType.json',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('resourceType.json'));
});

router.get('/head/resourceType/M4pMOvvTYh_bA_0SQ4cj92c2peqMJURKduNZucDKbKU/filters',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('filters.json'));
});

router.get('/head/audienceBase/metadata/*', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('audienceBase.json'));
});

router.get('/head/audienceBase/byText/byFilteringResource',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('audienceBasebyFilteringResource.json'));
});

router.get('/head/audience/2gdiPkpwfus1-PMOj5mx18cSdzL-2d6djxoHKnPcohA', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('2gdiPkpwfus1-PMOj5mx18cSdzL-2d6djxoHKnPcohA.json'));
});

router.delete('/head/workflow/wnykhNsawKK1gpu9Af2Qet-NarmYC6_F2WpPNeN9ROg/activities/activity/iraLHLaQ1JUdCjnVscciQhkyuURBaNSQBsAtaXlfB0OAdHoXOv_fLSvNzNV_5bxGaD02qlpGB7VADgo-42u9QA/where',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('deleteActivity.json'));
});

router.post('/head/workflow/wnykhNsawKK1gpu9Af2Qet-NarmYC6_F2WpPNeN9ROg/activities/activity/iraLHLaQ1JUdCjnVscciQhkyuURBaNSQBsAtaXlfB0OAdHoXOv_fLSvNzNV_5bxGaD02qlpGB7VADgo-42u9QA/where',function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.getRestJSON('saveActivity.json'));
});

router.post('')

module.exports = router;