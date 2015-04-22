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

/* GET the Data Sources UI. */
router.get('/', function(req, res, next) {
    res.render('datasources', demo.config);
});

/* GET the Edit Customer Attribute Datasource UI. */
router.get('/editcustomerattributesource.html', function(req, res, next) {
    res.render('editcustomerattributesource', { title: 'Express' });
});


router.get('/crs/datasources.list.html', function(req,res){
    if(!demo.config.datasourceState) {
        demo.config.datasourceState = "Inactive";
    } else {
        demo.config.datasourceState = "Active";
    }
    res.render('datasources_list',demo.config);
});

router.get('/crs/datasources.html', function(req,res){
    var action = req.query.action;
    if(action == "diagram_data"){
        res.set('Content-Type','application/json');
        return res.send(demo.readJSON('customerattributes_diagramdata.json'));
    }
});

router.get('/crs/datasources.uploadfilelist.html', function(req,res){
    res.render('datasources_uploadfilelist', demo.config);
});

router.get('/crs/configuresolution.solutiondetails.html', function(req,res){
    res.render('configuresolution_solutiondetails',demo.config);
});

router.get('/crs/datasources.reportsuites.html', function(req,res) {
    res.render('datasources_reportsuites',demo.config);
});



module.exports = router;