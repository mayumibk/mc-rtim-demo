angular.module('portalApp')
    .controller('DashboardCtrl',
    ['$rootScope', '$scope', '$window', '$timeout', '$filter', 'FlashService', 'Trait', 'MostChangedTraitsService', 'MostChangedSegmentsService', 'LargestTraitsService', 'LargestSegmentsService', 'TrendReportService', 'PartnerUniquesService', '$q', 'PermissionCheckService',
        function($rootScope, $scope, $window, $timeout, $filter, flash, Trait, mostChangedTraits, mostChangedSegments, largestTraits, largestSegments, TrendReportService, partnerUniques, $q, PermissionCheckService) {
            'use strict';

            var self = this;
            var _ = $window._;
            var d3 = $window.d3;
            var ADOBE = $window.ADOBE;
            var trendReportService = new TrendReportService();
            var throwPageLoadError = function () {
                var pageLoadErrorMsg = 'There was error loading the page. Please refresh the page to try again.';
                flash.setMessage(pageLoadErrorMsg, 'error').show();
                throw new Error(pageLoadErrorMsg);
            };
            var flashErrorMessage = function (err) {
                if (err) {
                    flash.setMessage(ADOBE.AM.MESSAGES.getAPIErrorMessage(err), 'error').show();
                }
            };

            if (!d3 || !_ || !ADOBE) {
                throwPageLoadError();
            }

            this.config = {
                dateRange: [
                    {
                        value: '6D',
                        label: '7 days'
                    }, {
                        value: '13D',
                        label: '14 days'
                    }, {
                        value: '29D',
                        label: '30 days'
                    }, {
                        value: '59D',
                        label: '60 days'
                    }
                ],
                loading: {
                    partnerUniques: true,
                    trait: true,
                    segment: true
                },
                normalized: {
                    trait: false,
                    segment: false
                },
                tabs: {
                    trait: {
                        mostChanged: {
                            type: 'trait',
                            id: 'cloudvizMostChangedTraits',
                            active: false,
                            service: mostChangedTraits
                        },
                        largest: {
                            type: 'trait',
                            id: 'cloudvizLargestTraits',
                            active: true,
                            service: largestTraits
                        }
                    },
                    segment: {
                        mostChanged: {
                            type: 'segment',
                            id: 'cloudvizMostChangedSegments',
                            active: false,
                            service: mostChangedSegments
                        },
                        largest: {
                            type: 'segment',
                            id: 'cloudvizLargestSegments',
                            active: true,
                            service: largestSegments
                        }
                    }
                },
                traitTypes: angular.extend({}, Trait.TRAIT_TYPES, {allTraitTypes: 'ALL_TRAITS'}),
                selectedDateRange: null

            };

            var getLatestReportDate = trendReportService.getLatestReportDate();

            this.setActiveTab = function (tab) {
                var activeTab = this.getActiveTab(tab.type);
                activeTab.active = false;
                tab.active = true;
            };

            /**
             * return the active tab of the give type, either 'triat' or 'segment'
             *
             * @param tab see self.config.tabs
             * @returns {*} tab object from the config or null
             */
            this.getActiveTab = function (tabType) {
                if (!tabType) {
                    return null;
                }

                return _.find(this.config.tabs[tabType], function (tab) {
                    return tab.active === true;
                });
            };

            this.convertToInterval = function(range) {
                var val = parseInt(range, 10);

                return (val + 1) + 'D';
            };

            this.fetchSegments = function () {
                if (!this.showSegmentGraphs()) {
                    return false;
                }

                var interval = this.convertToInterval(this.config.selectedDateRange);

                $q.allComplete([
                    mostChangedSegments.getSegments(interval),
                    largestSegments.getSegments(interval)
                ]).then(function () {
                    $q.allComplete([
                        mostChangedSegments.getGraphData(self.latestDate),
                        largestSegments.getGraphData(self.latestDate)
                    ]).then(function () {
                        var tab = self.getActiveTab('segment');
                        self.graphTab(tab);
                        _appendDeltaAndUniques('#'+tab.id, tab.service, tab.type);
                    }, flashErrorMessage);
                }, flashErrorMessage);
            };

            function _appendDeltaAndUniques(targetId, service, type) {
                d3.select(targetId).selectAll('.cv-legend-entry')[0].forEach(function (d) {

                    var node = $window.d3.select(d);
                    var data = node.data()[0];

                    // Extract sid from the last instance of ( ) within the name property.
                    var sid = parseInt(data.name.substring(data.name.lastIndexOf('(') + 1, data.name.lastIndexOf(')')), 10);
                    var collection = type + 's';

                    var instance = service[collection].filter(function (obj) {
                        return obj.getId() === sid;
                    })[0];

                    var label = (type === 'segment' ? 'Real-time ' : '') + 'Uniques';

                    if (instance && instance.metrics) {
                        node.select('.delta-uniques').remove();
                        node.insert('div', '.cv-legend-details')
                            .html('Delta: ' + $filter('number')(instance.metrics.deltaPercentage, 1) + '%<br />' + label + ': ' + $filter('number')(instance.metrics.todayUniques))
                            .classed('delta-uniques', true);
                        node.select('.dashboard-cv-uniques-label').remove();
                        node.select('.cv-legend-details')
                            .insert('span')
                            .classed('dashboard-cv-uniques-label', true)
                            .text(label);
                    }
                });
            }

            this.fetchTraits = function () {
                if (!this.showTraitGraphs()) {
                    return false;
                }

                self.config.loading.trait = true;
                var interval = this.convertToInterval(this.config.selectedDateRange);

                mostChangedTraits.setRestrictType($scope.selectedTraitType);
                largestTraits.setRestrictType($scope.selectedTraitType);

                $q.allComplete([
                    mostChangedTraits.getTraits(interval),
                    largestTraits.getTraits(interval)
                ]).then(function () {
                    $q.allComplete([
                        mostChangedTraits.getGraphData(self.latestDate),
                        largestTraits.getGraphData(self.latestDate)
                    ]).then(function () {
                        var tab = self.getActiveTab('trait');
                        self.graphTab(tab);
                    }, flashErrorMessage);
                }, flashErrorMessage);
            };

            this.graphTab = function (tab) {
                if (!tab) {
                    return false;
                }

                self.config.loading[tab.type] = true;
                self.setActiveTab(tab);

                if (tab.service && tab.service.graphData) {
                    $timeout(function() {
                        tab.service.graph = trendReportService.plotGraph({
                            data: tab.service.graphData,
                            selector: '#' + tab.id,
                            normalized: self.config.normalized[tab.type],
                            legendOrientation: 'right',
                            legendVerticalWidth: 300
                        });
                        _appendDeltaAndUniques('#'+tab.id, tab.service, tab.type);

                        self.config.loading[tab.type] = false;
                    });
                } else {
                    throwPageLoadError();
                }

            };

            this.filterTraits = function (selectedType) {
                $scope.selectedTraitType = selectedType;
                this.fetchTraits();
            };

            this.toggleNormalize = function (tabs) {
                if (!tabs) {
                    return false;
                }

                var tab = this.getActiveTab(tabs.largest.type);
                self.config.normalized[tab.type] = !self.config.normalized[tab.type];
                self.graphTab(tab);
            };

            this.showTraitGraphs = function () {
                return PermissionCheckService.canViewTraits();
            };

            this.showSegmentGraphs = function () {
                return PermissionCheckService.canViewSegments();
            };

            // Unique Users Graph
            partnerUniques.setInterval('1D');

            var partnerUniquesTypes = Object.keys(Trait.TRAIT_TYPES).map(function(key) {
                return Trait.TRAIT_TYPES[key];
            });

            partnerUniquesTypes.unshift('TOTAL');

            var partnerUniquesTypeLabels = Object.keys(Trait.TRAIT_TYPE_LABELS).map(function(key) {
                return Trait.TRAIT_TYPE_LABELS[key];
            });

            partnerUniquesTypeLabels.unshift('Total');

            this.showPartnerUniques = function () {
                return PermissionCheckService.canViewAllTraits();
            };

            this.plotPartnerUniquesGraph = function(options) {
                if (!this.showPartnerUniques()) {
                    return false;
                }

                var interval = this.config.selectedDateRange;

                if (!angular.isObject(options)) {
                    options = {};
                }

                if (this.partnerUniquesInterval === interval && !options.useCachedData) {
                    self.config.loading.partnerUniques = false;
                    return;
                } else {
                    this.partnerUniquesInterval = interval;
                }

                this.setPartnerUniquesDates();

                var graphOptions = {
                    selector: '#cloudvizUniqueUsers',
                    normalized: this.normalizePartnerUniquesGraph,
                    legendOrientation: 'right',
                    legendVerticalWidth: 300
                };

                if (options.useCachedData) {
                    graphOptions.data = this.partnerUniquesDataGraph;
                    trendReportService.plotGraph(graphOptions);
                    return;
                }

                var promises = [];

                partnerUniquesTypes.forEach(function(type) {
                    partnerUniques.setRestrictType(type);
                    promises.push(partnerUniques.getMetrics());
                });

                $q.allComplete(promises)
                    .then(function() {
                        var dataRaw = [];

                        partnerUniquesTypes.forEach(function(type, index) {
                            var data = angular.copy(partnerUniques.metrics[type] || null);

                            if (data !== null) {
                                data.name = partnerUniquesTypeLabels[index];
                                dataRaw.push(data);
                            }
                        });

                        partnerUniques.clearMetrics();

                        var dataParsed = ADOBE.AM.UTILS.HELPERS.parseMultipleTrendDataForCloudViz(dataRaw, 'uniques');
                        var dataGraph = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(dataParsed);

                        self.partnerUniquesDataGraph = dataGraph;
                        graphOptions.data = dataGraph;
                        trendReportService.plotGraph(graphOptions);
                        self.config.loading.partnerUniques = false;
                    });
            };

            this.setPartnerUniquesDates = function() {
                var date = new Date(this.partnerUniquesEndMillis);

                date.setDate(date.getDate() - parseInt(this.config.selectedDateRange, 10));
                partnerUniques.setStartDate(+date);
                partnerUniques.setEndDate(this.partnerUniquesEndMillis);
            };

            this.fetchAll = function () {
                this.config.loading = {
                    partnerUniques: true,
                    trait: true,
                    segment: true
                };
                this.fetchTraits();
                this.fetchSegments();
                this.plotPartnerUniquesGraph();
            };

            this.changeDateRange = function() {
                mostChangedSegments.setDateRange(this.config.selectedDateRange);
                mostChangedTraits.setDateRange(this.config.selectedDateRange);
                largestSegments.setDateRange(this.config.selectedDateRange);
                largestTraits.setDateRange(this.config.selectedDateRange);
                this.fetchAll();
            };

            getLatestReportDate
                .then(
                function(response) {
                    self.latestDate = new Date(response).valueOf() || 0;
                    self.partnerUniquesEndMillis = new Date(response).getTime();
                    self.config.selectedDateRange = self.config.dateRange[1].value;
                    $scope.selectedTraitType = self.config.traitTypes.allTraitTypes;
                    self.changeDateRange();
                },
                function () {
                    throwPageLoadError();
                });

            this.toggleNormalizePartnerUniquesGraph = function() {
                $timeout(function() {
                    this.plotPartnerUniquesGraph({
                        useCachedData: true
                    });
                }.bind(this));
            };

        }
    ]
);