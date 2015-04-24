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

router.get('/activities.html', function(req,res){
    res.render('target/editactivities',{title:"Express"});
});

router.get('/wefinance/en/personal.html', function(req,res){
    res.render('target/wefinance_home',{imgurl:"/res/wefinance/files/1429625765040.png",activityUrl:demo.config.activityUrl});
});

router.get('/wefinance/en/apply-for-credit-cards.html', function(req,res){
    res.render('target/wefinance_form',{imgurl:"/res/wefinance/files/1429625765040.png",activityUrl:demo.config.activityUrl});
});

router.post('/adobe-tech-marketing/target/tmp/thumbnails/*', function(req,res){
    res.render('target/thumbnail',{title:"Express"});
});


router.get('/entityAttributes.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/entityattributes.json'));
});

router.get('/adobe-tech-marketing/target/activities.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.updateTargetActivityUrl(demo.readJSON('target/activities.json')));
});

router.get('/adobe-tech-marketing/target/mboxes.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/mboxes.json'));
});

router.get('/adobe-tech-marketing/target/setup/profiletargeted/algorithms.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/algorithms.json'));
});

router.get('/adobe-tech-marketing/target/setup/recs/algorithms.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/recs_algorithms.json'));
});


router.get('/adobe-tech-marketing/target/activities/dat_lp_travel_cardpromo-ccupgradewithmiles.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/travel_card_promo.json'));
});


router.get('/adobe-tech-marketing/target/activities/cc_application_formtest-step1emailonly.at.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/cc_application_formtest-step1emailonly.at.json'));
});

router.get('/adobe-tech-marketing/target/audiences.at.json', function(req,res){
    res.set('Content-Type','application/json');
    //res.send(demo.readJSON('target/audiences.json'));
    res.send(demo.updateTargetSegments(demo.readJSON('target/audiences.json')));
});

router.get('/default/header.jsonp', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/header.json'));
});

router.get('/dict.en.json', function(req,res){
    res.set('Content-Type','application/json');
    res.send(demo.readJSON('target/dict.en.json'));
});

router.get('/querybuilder.json', function(req,res){
    res.set('Content-Type','application/json');
    var filename = "";
    if(req.query["5_property"] == "jcr:content/related/targetRecsTemplate") {
        filename="recs-designs.json";
    } else {
        filename = "dam.json";
    }
    res.send(demo.readJSON('target/' + filename));
});

module.exports = router;