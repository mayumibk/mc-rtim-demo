'use strict';

app.controller('TrendBulkExportCtrl', ['$rootScope', '$scope', '$window', '$timeout', 'FlashService', 'TraitService', 'TrendReportService', 'SegmentService', function($rootScope, $scope, $window, $timeout, flash, TraitService, TrendReportService, SegmentService) {
    var trendReportService = new TrendReportService();

    this.report = {
        type: 'TRAIT',
        selectedItems: [],
        payload: {
            startDate: null,
            endDate: null,
            interval: "7D", // default
            usePartnerLevelOverlap: false,
            sids : [],
            includeFolderIds : []
        }
    };

    var formatDate = trendReportService.formatDateYYYYMMDD;

    trendReportService.setDataType(this.report.type);

    this.itemSelectorOptions = {
        serviceClass: TraitService,
        foldersSelectable: true
    };

    this.exportToCSVOptions = {
        service: trendReportService,
        report : this.report
    };

    this.datepickerOptions = {
        start: {
            maxDate: null,
            selectedDateTime: formatDate(new Date())
        },
        end: {
            maxDate: null,
            selectedDateTime: formatDate(new Date())
        }
    };

    this.handleReportTypeChange = function(evt) {
        this.itemSelectorOptions.serviceClass = evt.selected === 'TRAIT' ? TraitService : SegmentService;
        trendReportService.setDataType(evt.selected);
    };

    var _getPayload = function() {
        // Make copy so that removal "usePartnerLevelOverlap" does not persist.
        var payload = angular.copy(this.report.payload);

        if (this.report.type !== 'TRAIT') {
            delete payload.usePartnerLevelOverlap;
        }

        return payload;
    };

    this.generateCSV = function() {
        //trendReportService.setDataType(this.report.type);

        // Transfer selectedItems to sids
        this.report.selectedItems.forEach(function(item) {
            self.report.payload.sids.push(item.sid);
        });

        //Transfer selectedItems to folderIds
        this.report.selectedItems.forEach(function(item) {
            self.report.payload.includeFolderIds.push(item.folderId);
        });

        var payload = _getPayload();

        trendReportService.getTrendData(payload, 'csv');
    }.bind(this);

    var success = function(result) {
        var singleDay = 24 * 60 * 60 * 1000;
        var latestDate = new Date(result.latestDate);
        this.datepickerOptions.end.maxDate = formatDate(latestDate);
        this.datepickerOptions.end.selectedDateTime = formatDate(latestDate);
        this.datepickerOptions.start.selectedDateTime = formatDate(new Date(result.latestDate - (singleDay * 90)));
    }.bind(this);

    trendReportService.getLatestReportDate()
        .then(success);

    this.isTraitReportType = function() {
        return this.report.type === 'TRAIT';
    };
}]);