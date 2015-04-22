/* global app */
app.controller('GeneralReportCtrl',
    ['$rootScope', '$scope', '$window', '$timeout', 'FlashService', 'TraitService', 'SegmentService', 'DestinationService', 'GeneralReportService', 'AllDestinations', 'PermissionCheckService',
        function($rootScope, $scope, $window, $timeout, flash, TraitService, SegmentService, DestinationService, GeneralReportService, AllDestinations, permissionCheckService) {
            'use strict';

            var self = this;
            var generalReportService = new GeneralReportService();

            generalReportService.setDestinations(AllDestinations);

            // Show a loading modal
            $scope.modals.loading = true;

            this.report = {
                type: 'TRAIT',
                selectedItems: [],
                payload: {
                    date: null,
                    includeFolderIds: [],
                    sids: [],
                    usePartnerLevelOverlap: false,
                    includeDestinationMappings: false,
                    includeDestinationIds: []
                },
                filters: {
                    uniques: true,
                    totalFires: true,
                    mapping: false,
                    '7Day': true,
                    '14Day': true,
                    '30Day': true,
                    '60Day': true
                },
                // Business Logic
                // Always send includeDestinationMappings if this is
                // a Destination type report.
                setType : function(type) {
                    this.type = type;

                    if (this.isDestinationReportType()) {
                        this.includeDestinationMappings();
                    }
                },
                isTraitReportType : function() {
                    return this.type === 'TRAIT';
                },
                isSegmentReportType : function() {
                    return this.type === 'SEGMENT';
                },
                isDestinationReportType : function() {
                    return this.type === 'DESTINATION';
                },
                /**
                 * Setter for the includeDestinationMappings
                 *
                 * @returns {boolean}
                 */
                includeDestinationMappings : function() {
                    if (this.isDestinationReportType() ||
                        (this.isSegmentReportType() && this.payload.includeDestinationMappings))
                    {
                        this.payload.includeDestinationMappings = true;
                        return true;
                    }

                    return false;
                }
            };

            var handleReportTypeChange = function(type) {
                var service = null;

                self.report.setType(type);

                switch (type) {
                    case 'TRAIT' : service = TraitService; break;
                    case 'SEGMENT' : service = SegmentService; break;
                    case 'DESTINATION' : service = DestinationService; break;
                    default: throw new Error('Report Type is not a valid option');
                }

                $scope.itemSelectorOptions.serviceClass = service;
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

                if (permissionCheckService.canViewDestinations()) {
                    reportTypes.push('Destination');
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

            this.datepickerOptions = {
                maxDate: '',
                selectedDateTime: ''
            };

            this.showTraitReportType = function() {
                return $window.userRoles.indexOf('VIEW_TRAITS') >= 0;
            };

            this.showSegmentReportType = function() {
                return $window.userRoles.indexOf('VIEW_SEGMENTS') >= 0;
            };

            this.showDestinationReportType = function() {
                return $window.userRoles.indexOf('VIEW_DESTINATIONS') >= 0;
            };

            this.selectReportTypeOptions = function(type) {
                if (type === 'TRAIT' && this.showTraitReportType()) {
                    return true;
                }
                else if (type === 'SEGMENT' && !this.showTraitReportType() && this.showSegmentReportType()) {
                    return true;
                }
                else if (type === 'DESTINATION' && !this.showTraitReportType() && !this.showSegmentReportType()) {
                    return true;
                }

                return false;
            }.bind(this);

            $scope.itemSelectorOptions = {
                serviceClass: TraitService,
                foldersSelectable: true
            };

            this.exportToCSVOptions = {
                service: generalReportService,
                report : this.report
            };

            var _extractSelectedIds = function() {
                self.report.payload.sids = [];
                self.report.payload.includeFolderIds = [];
                self.report.payload.includeDestinationIds = [];

                self.report.selectedItems.forEach(function(item) {
                    if (item.sid) {
                        self.report.payload.sids.push(item.sid);
                    } else if (item.folderId) {
                        self.report.payload.includeFolderIds.push(item.folderId);
                    } else if (item.destinationId) {
                        self.report.payload.includeDestinationIds.push(item.destinationId);
                    }
                });
            };

            var _getPayload = function() {
                // Make copy so that removal "usePartnerLevelOverlap" does not persist.
                var payload = angular.copy(self.report.payload);

                if (!self.report.isTraitReportType()) {
                    delete payload.usePartnerLevelOverlap;
                } else {
                    delete payload.includeDestinationMappings;
                }

                // Modify the copied payload if necessary
                if (!self.report.isDestinationReportType()) {
                    delete payload.includeDestinationIds;
                }

                return payload;
            };

            $scope.pageSelection = null;

            $scope.$watch('pageSelection', function(newVal, oldVal) {
                if (newVal === oldVal || oldVal === null) {
                    return false;
                }
                generalReportService.setPage(parseInt(newVal, 10) - 1);
                generalReportService.drawTable();
            });

            this.drawTable = function() {
                $scope.modals.loading = true;

                _extractSelectedIds();

                generalReportService.tableOptions = _getPayload();
                generalReportService.bindScope($scope);
                generalReportService.setDataType(this.report.type);
                generalReportService.enableSorting();
                generalReportService.enablePagination();
                generalReportService.drawTable();
                this.filterColumns();
                $scope.reportWasRun = true;
            };

            var success = function(utcDateStr) {
                self.datepickerOptions.maxDate = utcDateStr;
                self.datepickerOptions.selectedDateTime = utcDateStr;
            };

            generalReportService
                .getLatestReportDate()
                .then(success);

            this.filterColumns = function() {
                $timeout(function() {
                    var types = {
                        uniques: false,
                        count: false,
                        instantUniques: false,
                        totalUniques: false,
                        mapping: false
                    };

                    if (this.report.type === 'TRAIT') {
                        types.uniques = this.report.filters.uniques;
                        types.count = this.report.filters.totalFires;
                    } else {
                        types.instantUniques = this.report.filters.uniques;
                        types.totalUniques = this.report.filters.totalFires;
                    }

                    generalReportService.setTableColumnTypeVisibility(types);

                    var columns = {},
                        intervals = ['7Day', '14Day', '30Day', '60Day'];

                    Object.keys(types).forEach(function(prefix) {
                        if (types[prefix]) {
                            intervals.forEach(function(interval) {
                                columns[prefix + interval] = this.report.filters[interval];
                            }, this);
                        }
                    }, this);

                    generalReportService.setTableColumnVisibility(columns);
                }.bind(this));
            };

            this.isSortingFieldSupported = generalReportService.isSortingFieldSupported;

        }]);