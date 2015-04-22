/* global app */
app.controller('TrendGraphCtrl', ['$rootScope', '$scope', '$window', '$timeout', '$http', 'FlashService', 'TraitService', 'SegmentService', 'ngTableParams', '$filter', 'TrendReportService', '$sce', 'PermissionCheckService', function($rootScope, $scope, $window, $timeout, $http, flash, TraitService, SegmentService, NgTableParams, $filter, TrendReportService, $sce, permissionCheckService) {
    'use strict';

    var self = this,
        trendReportService = new TrendReportService();

    this.report = {
        type: 'TRAIT' ,
        selectedItems: [],
        graphItems: [],
        payload: {
            startDate: '',
            endDate: '',
            interval: '14D',
            sids: [],
            usePartnerLevelOverlap: false
        },
        segmentSeriesType: 'instantUniques'
    };
    this.graphLoaded = false;

    var handleReportTypeChange = function(type) {
        self.report.type = type;
        $scope.itemSelectorOptions.serviceClass = type === 'TRAIT' ? TraitService : SegmentService;
        trendReportService.setDataType(type);
    };

    /**
     * Map the Users Roles to the appropriate Report Types
     * @returns {Array}
     */
    var getUserRolesToOptions = function() {
        var reportTypes = [];

        if (permissionCheckService.canViewTraits()) {
            reportTypes.push('Trait');
        }

        if (permissionCheckService.canViewSegments()) {
            reportTypes.push('Segment');
        }

        return reportTypes;
    };

    // ngCui select options
    $scope.selectOptions = getUserRolesToOptions();

    // ngCui selected option
    $scope.selectedOption = $scope.selectOptions[0];
    $scope.$watch('selectedOption', function(newVal, oldVal) {
        if (!newVal) { return; }
        if (newVal === oldVal) { return; }

        handleReportTypeChange(newVal.toUpperCase());
    });

    // Set to whatever report object is initialized to.
    trendReportService.setDataType(this.report.type);

    // Show a loading modal
    $scope.modals.loading = true;

    this.datepickerOptions = {
        start: {
            maxDate: '',
            selectedDateTime: ''
        },
        end: {
            maxDate: '',
            selectedDateTime: ''
        }
    };

    var success = function(dateStr) {
        var todayInUTC = moment(dateStr).utc().hours(0).minutes(0).minutes(0).seconds(0).milliseconds(0);

        self.datepickerOptions.end.maxDate = dateStr;
        self.datepickerOptions.end.selectedDateTime = dateStr;
        self.datepickerOptions.start.selectedDateTime = $window.ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(
            todayInUTC.subtract('days', 90).valueOf()
        );
    };

    $scope.itemSelectorOptions = {
        serviceClass: TraitService,
        graphLineColors: trendReportService.cloudVizColors,
        //maxSelectionCount: 3,
        foldersSelectable: true
    };

    this.exportToCSVOptions = {
        service: trendReportService,
        report : this.report
    };

    $scope.tdFormat = trendReportService.tdFormat;

    /**
     * Since the report object does not really equate to a model,
     * we need to perform some logic on the payload to send to the
     * API.
     *
     * @returns {*}
     */
    this.getPayload = function() {
        // Make copy so that removal "usePartnerLevelOverlap" does not persist.
        var payload = angular.copy(this.report.payload);

        if (this.report.type !== 'TRAIT') {
            delete payload.usePartnerLevelOverlap;
        }

        if (angular.isDefined(payload.startDate)) {
            payload.startDate = new Date(payload.startDate).getTime();
        }

        if (angular.isDefined(payload.endDate)) {
            payload.endDate = new Date(payload.endDate).getTime();
        }

        return payload;
    };

    this.plotGraphAndDrawTable = function() {
        var self = this;

        trendReportService.setDataType(this.report.type);
        this.report.payload.sids = [];
        this.report.segmentSeriesType = 'instantUniques';

        var graphItems = this.report.selectedItems.filter(function(item) {
            return !!item.color;
        });

        graphItems.forEach(function(item) {
            self.report.payload.sids.push(item.sid);
        });

        var payload = this.getPayload();

        getData(payload);
        $scope.modals.loading = true;
    };

    var isTraitOrSegment = function (obj) {
        return obj && (obj instanceof TraitService.Model || obj instanceof SegmentService.Model);
    };

    this.disableGraphBtn = function () {
        var hasTraitOrSegment = self.report.selectedItems.some(function (item) {
            return isTraitOrSegment(item);
        });

        return self.report.selectedItems.length === 0 || !hasTraitOrSegment;
    };

    this.isInvalidEndDate = function () {
        var payload = this.report.payload;
        return !!(payload && payload.endDate && payload.startDate && (payload.endDate < payload.startDate));
    };

    function getData(payload) {
        return trendReportService
            .getTrendData(payload)
            .then(function(response) {
                self.graphLoaded = true;
                trendReportService.dataRaw = response.data;
                trendCallback(trendReportService.dataRaw);

                $scope.modals.loading = false;

                var customizeGraphAndTable = function() {
                    // Add tooltips on graph tabs
                    $window.$('.cv-legend-title').attr('title', function() { return $window.$(this).text(); });

                    // Add tooltips on table headers
                    $window.$('.trend-table th').attr('title', function() { return $window.$(this).text(); });
                };

                $window.$('#scroll-content').stop()
                    .animate({ scrollTop: $window.$('#cloudVizChart').offset().top - 100 }, 1500, 'easeInOutExpo', customizeGraphAndTable);
            })
            .catch(function(response) {
                flash.setMessage(
                    $window.ADOBE.AM.MESSAGES.getAPIErrorMessage(response),
                    'error'
                ).show();
            });
    }

    function trendCallback(dataRaw) {
        var dataParsed = $window.ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(dataRaw, trendReportService.trendDataKey);

        var dataTable = dataParsed.dataTable || [],
            sids = dataParsed.sids || [],
            graphDataIsEmpty = dataParsed.graphDataIsEmpty;

        delete dataParsed.dataTable;
        delete dataParsed.sids;
        delete dataParsed.graphDataIsEmpty;

        var dataGraph = $window.ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(dataParsed);

        trendReportService.setTableColumns(self.report.selectedItems, sids);

        if (!graphDataIsEmpty) {
            dataGraph.colors = trendReportService.getColorsArray(sids);
        }

        trendReportService.dataGraph = dataGraph;

        trendReportService.plotGraph({
            data: trendReportService.dataGraph,
            selector: '#cloudVizChart'
        });

        trendReportService.drawTable(dataTable, {
                page: 1,            // show first page
                count: 100000,      // count per page
                sorting: {
                    date: 'asc'     // initial sorting
                }
            },
            $scope
        );
    }

    trendReportService.getLatestReportDate()
        .then(success);

    this.isTraitReportType = function() {
        return this.report.type === 'TRAIT';
    };

    this.segmentGraphIsRendered = function() {
        return trendReportService.segmentGraphIsRendered;
    };

    // Switch between Real-time and Total in the segment report
    $scope.$watch(
        function() { return this.report.segmentSeriesType; }.bind(this),
        function(newVal, oldVal) {
            if (newVal !== oldVal) {
                trendReportService.trendDataKey = newVal;
                trendCallback(trendReportService.dataRaw);
            }
        }
    );

    $scope.validateDates = function () {
        if (self.isInvalidEndDate()) {
            flash.setMessage(
                'Your end date is before your start date. Please adjust and apply the filter again.',
                'error'
            ).show();
        }
    };

    // This value is read by ng-bind-html, which expects strict html.
    // A character such as a solo '<' in the string is expected to be written as '&lt;'.
    // $sce.trustAsHtml relaxes this restriction.
    this.getTrustedHTML = function(html) {
        return $sce.trustAsHtml(html);
    };

    this.toggleNormalizeGraph = function() {
        $timeout(function() {
            trendReportService.plotGraph({
                data: trendReportService.dataGraph,
                selector: '#cloudVizChart',
                normalized: this.normalizeGraph
            });
        }.bind(this));
    };
}]);