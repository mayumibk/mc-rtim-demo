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

/* GET home page. */
router.get('/home', function(req, res, next) {
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('home.json')});
});

router.get('/activityOverview', function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('activityoverview.json')});
});

router.get('/campaignExplorer', function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('campaignexplorer.json')} );
});

router.get('/program/-h8ItWp1X72nKbvLlVklpHAcNJjas8sa2yNe0yA2PvI.program', function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('-h8ItWp1X72nKbvLlVklpHAcNJjas8sa2yNe0yA2PvI.json')});
});

router.get('/program/-h8ItWp1X72nKbvLlVklpACyGDlccBh_D2oJ1BOE7yM.program',function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('-h8ItWp1X72nKbvLlVklpACyGDlccBh_D2oJ1BOE7yM.json')});
});

router.get('/program/-h8ItWp1X72nKbvLlVklpH9Fys6ECvp33_P2sVgORLw.program',function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('-h8ItWp1X72nKbvLlVklpH9Fys6ECvp33_P2sVgORLw.json')});
});

router.get('/campaign/*.campaign', function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('-HJ0dXTxqxgD104_MolpcGbhTeS02Rh1JfjjJi-_UYVM.json')});
});

router.get('/workflow/TWcf365BYt26Fl1KIomKxBlytVgNRUHGp7QnJvngBUo.workflow', function(req,res){
    res.render('nlview',{userinfo:demo.getPageJSON('userinfo.json'),pageinfo:demo.getPageJSON('workflow.json')});
});

router.get('/assetpicker', function(req,res){
    res.render('assetselector',{title:"Express"});
});

router.get('/content/dam',function(req,res){
    res.render('dam',{title:"Express"});
});

module.exports = router;