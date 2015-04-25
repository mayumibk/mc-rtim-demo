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

router.get('/admin', function(req,res){
    var redirectURL = req.query.redirect;
    if(redirectURL == "/target/wefinance/en/personal.html") {
        var imageUrl = '/res/wefinance/files/1429625765040.png';
        if(req.query.recipeName.indexOf('Exp-B') == 0 )
            imageUrl = '/res/wefinance/dam/1170X400_Travel_5k_Campaign.png';
        if(req.query.recipeName.indexOf('Exp-C') == 0 )
            imageUrl = '/res/wefinance/dam/1170x400_Travel_15k_Campaign.png';

        return res.render('target/wefinance_home',{imgurl: imageUrl,activityUrl:demo.config.activityUrl});
    } else {
        var formStyle = "long";
        if(req.query.recipeName.indexOf('Exp-B') == 0 )
            formStyle = "short";

        return res.render('target/wefinance_form',{style: formStyle});
    }

});

module.exports = router;