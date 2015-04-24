/*
 * ************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *   Copyright 2013 Adobe Systems Incorporated
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

var moment = require('moment');
var replace = require("replacestream");
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var config = require('../config/democonfig.json');

var jsonFilePath = "json_files/";
var htmlFilePath = "html_resources/";
var jsonRestPath = "json_files/rest_calls/";
var jsonHTMLPath = "json_files/html_views/";

/*
    Update the Anomaly Detection json data to reflect recent dates.
    Use simple date calculations to adjust the anomalies to fall
    within the last 30 days.
 */
var updatePredictiveData = function updatePredictiveData(data){
    var now = moment();
    var startDate = now.subtract(31,"days");
    var newDate = moment(startDate);
    var json = JSON.parse(data);
    for(var i=0; i < json.summary.date.length; i++) {
        json.summary.date[i] = newDate.format('YYYY-MM-DDTHH:mm:ssZ');
        //Space out the anomalies after 14 days
        if(i < 14) {
            newDate = newDate.add(1,"days");
        } else {
            newDate = newDate.add(4,"days");
        }

    }
    var yesterday = moment().subtract(1,"days");
    var history = moment().subtract(12,"days");

    // Hack to force the anomaly to be yesterday
    json["summary"]["date"][17] = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');
    json["detail"][0]["mostRecentDate"] = history.format('YYYY-MM-DDTHH:mm:ssZ');
    json["detail"][1]["mostRecentDate"] = history.format('YYYY-MM-DDTHH:mm:ssZ');
    json["detail"][2]["mostRecentDate"] = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');

    for(var i=0; i < json["detail"].length; i++) {
        var detail = json["detail"][i];
        newDate = moment().subtract(31,"days");
        for(var x=0; x < detail['trends']['date'].length; x++) {
            newDate = newDate.add(1,"days");
            detail['trends']['date'][x] = newDate.format('YYYY-MM-DDTHH:mm:ssZ');
        }
    }

    // Hack to force the anomaly to be yesterday
    json["detail"][0]["trends"]["date"][29] = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');
    json["detail"][1]["trends"]["date"][29] = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');
    json["detail"][2]["trends"]["date"][29] = yesterday.format('YYYY-MM-DDTHH:mm:ssZ');

    return json;

};

/*
    Update the queue data to reflect yesterday's date to keep the demo fresh.
 */
var updateQueueData = function updateQueueData(data){
    var yesterday = moment().subtract(1,"days");
    var json = JSON.parse(data);
    var formattedDate =  config.anomalyName + " on " + yesterday.format('MMMM DD, YYYY');

    json[0]["reportDefinition"]["name"] = formattedDate;
    json[0]["reportDefinition"]["anomalyContext"]["selectedAnomalyDate"] = yesterday.format('MMMM DD, YYYY');

    return json;
};

/*
    Hack to force the segments that are created by the Anomaly Detection service
    to match the requirements for Adobe Summit 2015.
 */
var updatePasteBinData = function updatePasteBinData(data){
    var json = JSON.parse(data);
    if(data.length > 0) {
        if(json["container"]["pred"]["preds"].length > 2) {
            for(var i = 0; i < config.firstSegment.length; i++) {
                json["container"]["pred"]["preds"][i]["str"] = config.firstSegment[i].name;
            }
        } else {
            for(var i = 0; i < config.firstSegment.length; i++) {
                json["container"]["pred"]["preds"][i]["str"] = config.secondSegment[i].name;
            }
        }
    }

    return json;
}

/*
    Hack to update the segment data #s to match the requirements for Adobe Summit 2015.
    This code also checks to see if the Bookings attribute was added to the segment
    definition. If it has been added, adjust the #s to simulate the recalculation that
    would occur by further refining the segment.
 */
var updateSegmentSummaryData = function undateSegmentSummaryData(json,summary){
    var matched = false;
    var jsonSummary = JSON.parse(summary);

    if(json.container.pred.preds != undefined) {
        // Validate if the Bookings attribute has been added.
        for (var x = 0; x < json.container.pred.preds.length; x++) {
            if (json.container.pred.preds[x].description == "Application completes")
                matched = true;
        }

        // Segment 1 has 4 attributes
        if (json.container.pred.preds.length > 3) {
            if (matched) {
                jsonSummary['report']['totals'][0]['value'] = 2094;
                jsonSummary['report']['totals'][1]['value'] = 781;
                jsonSummary['report']['totals'][2]['value'] = 693;
            } else {
                jsonSummary['report']['totals'][0]['value'] = 565140;
                jsonSummary['report']['totals'][1]['value'] = 21833;
                jsonSummary['report']['totals'][2]['value'] = 12538;
            }
            // Segment 2 only has 2 attributes
        } else {
            if (matched) {
                jsonSummary['report']['totals'][0]['value'] = 315902;
                jsonSummary['report']['totals'][1]['value'] = 78741;
                jsonSummary['report']['totals'][2]['value'] = 42394;
            } else {
                jsonSummary['report']['totals'][0]['value'] = 417996;
                jsonSummary['report']['totals'][1]['value'] = 79522;
                jsonSummary['report']['totals'][2]['value'] = 43087;
            }
        }

        jsonSummary['report']['totals'][3]['value'] = 1293437;
        jsonSummary['report']['totals'][4]['value'] = 534367;
        jsonSummary['report']['totals'][5]['value'] = 301970;
    }

    return jsonSummary;
};

/*
    Adds the segment to the current list of segments.
    For demo purposes, we're deleting any existing segment
    already in the list with the same name.
    Returns JSON object with updated list of segments.
 */
var saveSegment = function saveSegment(name, description, jsonSegments){
    // Check to see if this segment is already in the list, if so - delete it.
    for(var i=0; i < jsonSegments.length; i++) {
        if(jsonSegments[i].name == name) {
            jsonSegments.splice(i);
        }
    }

    // read the Segment template from file
    var now = moment();
    var jsonTemplate = JSON.parse(readJSON('newsegment-template.json'));
    //var jsonTemplate2 = JSON.parse(readJSON('newsegment-template.json'));
    //var Tagname={"name":"Upsell"};

    jsonTemplate.id = "54e61a3ce4b0d8c54d64d0b4"; //Generate a random unique ID
    jsonTemplate.name = name;
    jsonTemplate.description = description;
    jsonTemplate.rsid = config.reportSuiteName;
    jsonTemplate.siteTitle = config.reportSuiteName;
    jsonTemplate.tags.push({"name":"Retargeting"});
    jsonTemplate.modified = now.format('YYYY-MM-DDTHH:mm:ssZ');
    jsonTemplate.owner.name = config.displayName;
    jsonTemplate.owner.login = config.loginName;

    // Add this new segment to the list.
    jsonSegments.unshift(jsonTemplate);

    // Hack for Summit Demo - Hammond Special.
    /*
    var twoHoursAgo = moment().subtract(2,"hours");
    jsonTemplate2.id = "54e61a3ce4b0d8c54d64d0b5";
    jsonTemplate2.name = "CC qualified customers";
    jsonTemplate2.description = "Target customers for co-branded travel credit card.";
    jsonTemplate2.modified = twoHoursAgo.format('YYYY-MM-DDTHH:mm:ssZ');
    jsonTemplate2.rsid = config.reportSuiteName;
    jsonTemplate2.siteTitle = config.reportSuiteName;
    jsonTemplate2.tags.push({"name":"Upsell"});
    jsonTemplate2.owner.name = config.displayName;
    jsonTemplate2.owner.login= config.loginName;

    jsonSegments.unshift(jsonTemplate2);
    */

    return jsonSegments;
};


var prependBlankSegment = function prependBlankSegment(segmentList) {
    // This is a hack to work around an issue with audience library UI which does not display the first segment in the dropdown.


    var jsonTemplate = JSON.parse(readJSON('newsegment-template.json'));
    jsonTemplate.name = "CC qualified customers";
    segmentList.unshift(jsonTemplate);

    jsonTemplate = JSON.parse(readJSON('newsegment-template.json'));
    segmentList.unshift(jsonTemplate);

    return segmentList;
}

var updateTargetSegments = function updateTargetSegments(targetAudiences) {
    var audiences = JSON.parse(targetAudiences);
    for(var i = 0; i < config.audiences.length; i++) {
        var segmentTemplate = JSON.parse(readJSON('target/audience-template.json'));
        var modified = moment(config.audiences[i].dateModified,'MM/DD/YYYY h:mm a');
        var reference = config.audiences[i].name.toLowerCase().replace(" ","_");
        segmentTemplate["jcr:title"] = config.audiences[i].name;
        segmentTemplate.targetSegmentName = config.audiences[i].name;
        segmentTemplate.targetId = i;
        segmentTemplate.id = "imported/50/" + i;
        segmentTemplate["jcr:lastModified"] = modified.format('L');
        segmentTemplate.targetLastSynced = modified.format('L');
        segmentTemplate.reference = 'audiences/' + reference;
        audiences.items.push(segmentTemplate);
    }

    return audiences;

}

var updateTargetActivityUrl = function updateTargetActivityUrl(activities){
    json = JSON.parse(activities);
    json.items[0].targets.template.activityUrl = config.target.activityUrl;
    return json;
}

var retrieveAAMSegment = function retrieveAAMSegment(id, segments) {
    var json = JSON.parse(segments);
    for(var i = 0; i < json.list.length; i++) {
        if(json.list[i].sid == id) {
            return JSON.stringify(json.list[i]);
        }
    }
}

var retrieveAAMSegmentFolder = function retrieveAAMSegmentFolder(id, folders) {
    var json = JSON.parse(folders);
    for (var i = 0; i < json[0].subFolders.length; i++) {
        if (json[0].subFolders[i].folderId == id) {
            return JSON.stringify(json[0].subFolders[i]);
        }
    }
}

var saveAAMModel = function saveAAMModel(model){
    var json = JSON.parse(model);
    var modelTemplate = JSON.parse(readJSON('aam/model-template.json'));
    modelTemplate.name = json.name;
    modelTemplate.description = json.description;

    return modelTemplate;

}

var updateAAMModels = function updateAAMModels(model, modelList) {

    if(modelList) {
        var json = JSON.parse(modelList);
        json.list.push(model);
    } else {
        var json = JSON.parse(readJSON('aam/models.json'));
        json.list.push(model);
    }

    return json;
}

var retreiveAAMModel = function retrieveAAMModel(id, modelList) {
    if(!modelList)
        modelList = JSON.parse(readJSON('aam/models.json'));
    for(var i = 0; i < modelList.list.length; i++) {
        if(modelList.list[i].algoModelId == id) {
            return modelList.list[i];
        }
    }
}

var updateAudienceList = function updateAudienceList(segmentList){
    var newAudience = {
        "name": "",
        "description": "",
        "source":"Analytics",
        "size":"Collecting Data",
        "active":"Yes",
        "dateModified": ""
    };

    if(segmentList) {
        // get the first segment.
        var modified = moment(segmentList[1].modified);
        newAudience.name = segmentList[1].name;
        newAudience.description = segmentList[1].description;
        newAudience.dateModified = modified.format('MM/DD/YYYY h:mm a');

        config.audiences.unshift(newAudience);
    } else {
        if(config.audiences.length == 10) {
            var modified = moment().subtract(2, "hours");
            newAudience.name = "CC qualified customers";
            newAudience.description = "Target customer for co-branded travel credit card.";
            newAudience.dateModified = modified.format('MM/DD/YYYY h:mm a');

            config.audiences.unshift(newAudience);
        }
    }
}




var saveAudience = function saveAudience(data) {
    var now = moment();
    var json = JSON.parse(data);
    var newAudience = {
        "name":json.name,
        "description":json.description,
        "source":"Marketing Cloud",
        "size":"Collecting Data",
        "active":"Yes",
        "dateModified": now.format('MM/DD/YYYY h:mm a')
    };

    config.audiences.unshift(newAudience);

}

/*
    Update the user.json response with config data
*/

var updateUserJSON = function updateUserJSON(filename) {
    var userJSON = JSON.parse(readJSON(filename));
    userJSON.info.displayName = config.displayName;
    userJSON.info.title = config.title;
    userJSON.info.avatar = config.avatar;
    userJSON.organizations[0].name = config.name;
    userJSON.organizations[0].reportSuiteID = config.reportSuiteID;
    userJSON.organizations[0].reportSuiteName = config.reportSuiteName;
    return JSON.stringify(userJSON);
}

/*
    Update the Report Suite List with demo configuration settings.
 */
var updateReportSuiteList = function updateReportSuiteList(reportSuiteList) {
    var reportSuiteListJson = JSON.parse(reportSuiteList);
    reportSuiteListJson[0].value = config.reportSuiteID;
    reportSuiteListJson[0].text = config.reportSuiteName;
    reportSuiteListJson[0].name = config.reportSuiteName;
    return reportSuiteListJson;
}

/*
 Update the democonfig.json file with the data submitted from the demo console.
 */
var updateDemoConfig = function updateDemoConfig(body) {
    config = JSON.parse(JSON.stringify(body));
    saveConfig(JSON.stringify(config));
};

var updateDemoAvatar = function updateDemoAvatar(uploadedFile) {
    config.avatar = "/images/" + uploadedFile.file.name;
    saveConfig(JSON.stringify(config));
}

/*
    Simple utility function to synchronously read local JSON files.
 */
var readJSON = function readJSON(filename) {
    return fs.readFileSync(jsonFilePath + filename, "utf-8");
};

var saveConfig = function saveConfig(jsonData) {
    fs.writeFileSync('config/democonfig.json', jsonData, "utf-8");
}

var readHTML = function readHTML(filename) {
    return fs.readFileSync(htmlFilePath + filename,"utf-8");
}

var saveJSON = function saveJSON(json,filename) {
    /*
    var jsonBody = JSON.parse(JSON.stringify(json));
    for(var i = 0; i < jsonBody.length; i++){
        if(jsonBody[i].tags.length > 0) {
            var tagArray = jsonBody[i].tags.split(",");
            for(var x=0; x < tagArray.length; x++) {

            }
        }
    }
    */
    return fs.writeFileSync(jsonFilePath + filename,JSON.stringify(json),"utf-8");
}

var getConfig = function getConfig(){
    return fs.readFileSync('config/democonfig.json',"utf-8");
}


var replaceSegmentNamesInData = function replaceSegmentNamesInData(filename){
    var yesterday = moment().subtract(1,"days");
    var formattedDate = config.anomalyName + " on " + yesterday.format('MMMM DD, YYYY');
    var file = fs.readFileSync(jsonFilePath + filename, "utf8");

    for(var i = 0; i < config.firstSegment.length; i++){
        file = replaceAll(config.originalFirstSegment[i].name, config.firstSegment[i].name,file);
    }
    for(var i = 0; i < config.secondSegment.length; i++){
        var exists = false;
        for(var x=0; x<config.firstSegment.length;x++) {
            if(config.secondSegment[i] == config.firstSegment[x])
                exists = true;
        }
        if(!exists)
            file = replaceAll(config.originalSecondSegment[i].name, config.secondSegment[i].name,file);
    }

    var jsonFile = JSON.parse(file);
    jsonFile.reportDefinition.anomalyContext.selectedAnomalyDate = yesterday.format('MMMM DD, YYYY');
    jsonFile.reportDefinition.name = formattedDate;

    return jsonFile;
}


/*
 Simple utility function to synchronously read local JSON files.
 */
exports.getRestJSON = function (filename) {
    return fs.readFileSync(jsonRestPath + filename);
};

exports.getPageJSON = function readHTMLJSON(filename){
    return fs.readFileSync(jsonHTMLPath + filename);
}

// private functions
function replaceAll(find, replace, str) {
    find = find.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(find, 'g'), replace);
}



// Export functions
module.exports.config = config;
module.exports.readJSON = readJSON;
module.exports.readHTML = readHTML;
module.exports.updatePredictiveData = updatePredictiveData;
module.exports.updateQueueData = updateQueueData;
module.exports.updatePasteBinData = updatePasteBinData;
module.exports.updateSegmentSummaryData = updateSegmentSummaryData;
module.exports.updateTargetSegments = updateTargetSegments;
module.exports.updateTargetActivityUrl = updateTargetActivityUrl;
module.exports.retrieveAAMSegment = retrieveAAMSegment;
module.exports.retrieveAAMSegmentFolder = retrieveAAMSegmentFolder;
module.exports.saveAAMModel = saveAAMModel;
module.exports.updateAAMModels = updateAAMModels;
module.exports.retreiveAAMModel = retreiveAAMModel;
module.exports.prependBlankSegment = prependBlankSegment;
module.exports.saveSegment = saveSegment;
module.exports.updateAudienceList = updateAudienceList;
module.exports.saveAudience = saveAudience;
module.exports.updateDemoConfig = updateDemoConfig;
module.exports.updateDemoAvatar = updateDemoAvatar;
module.exports.updateReportSuiteList = updateReportSuiteList;
module.exports.updateUserJSON = updateUserJSON;
module.exports.replaceSegmentNamesInData = replaceSegmentNamesInData;
module.exports.saveJSON = saveJSON;
module.exports.getConfig = getConfig;
