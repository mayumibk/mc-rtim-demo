if (typeof ADOBE == "undefined") {
 var ADOBE = {};
}
if (typeof ADOBE.AM == "undefined") {
 ADOBE.AM = {};
}
ADOBE.AM.Region = {};
ADOBE.AM.Region.Models = {};
ADOBE.AM.Region.Models.Region = (function(adobe, backbone) {
 if (arguments.length === 0) {
  adobe = ADOBE;
  backbone = Backbone;
 }
 return backbone.Model.extend({
  url: function() {
   return adobe.AM.API.REGION.regions.url(this.get("id"));
  },
  getCode: function() {
   return this.get("code");
  }
 });
}
());
ADOBE.AM.Region.Collections = {};
ADOBE.AM.Region.Collections.Regions = (function(backbone, Region, adobe) {
 if (arguments.length === 0) {
  backbone = Backbone;
  Region = ADOBE.AM.Region.Models.Region;
  adobe = ADOBE;
 }
 return backbone.Collection.extend({
  model: Region,
  url: function() {
   return adobe.AM.API.REGION.regions.url();
  },
  findByRegionId: function(id) {
   var _id = parseInt(id, 10);
   return this.findWhere({
    regionId: _id
   });
  }
 });
}
());
ADOBE.AM.Limits = {};
ADOBE.AM.Limits.Models = {};
ADOBE.AM.Limits.Models.Limits = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  backbone = Backbone;
  api = ADOBE.AM.API;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 var LimitsModel = Backbone.Model.extend({
  isLoaded: function() {
   return !!Object.keys(this.attributes).length;
  }
 });
 return LimitsModel;
}
());
ADOBE.AM.Group = {};
ADOBE.AM.Group.Models = {};
ADOBE.AM.Group.Models.Group = (function(adobe, backbone) {
 if (arguments.length === 0) {
  adobe = ADOBE;
  backbone = Backbone;
 }
 return backbone.Model.extend({
  defaults: {
   name: "",
   description: "",
   wildcardPermissions: [],
   users: []
  },
  url: function() {
   return adobe.AM.API.GROUPS.group.url(this.get("id"));
  },
  getClonableAttributes: function() {
   var attrs = {};
   _.each(this.defaults, function(val, key) {
    if (key === "name") {
     attrs[key] = "";
    } else {
     if (key === "users") {
      var _users = this.get(key);
      attrs[key] = _users;
     } else {
      attrs[key] = this.get(key);
     }
    }
   }, this);
   return attrs;
  },
  validate: function(attrs) {
   if ($.trim(attrs.name) == "" || attrs.name == null) {
    return "Name cannot be empty.";
   }
  }
 }, {
  activeGroup: null
 });
}
());
ADOBE.AM.Group.Collections = {};
ADOBE.AM.Group.Collections.Groups = (function(backbone, Group, adobe) {
 if (arguments.length === 0) {
  backbone = Backbone;
  Group = ADOBE.AM.Group.Models.Group;
  adobe = ADOBE;
 }
 return backbone.Collection.extend({
  model: Group,
  query_string_args: {},
  addQueryStringArgs: function(qs) {
   _.extend(this.query_string_args, qs);
  },
  url: function() {
   return adobe.AM.API.GROUPS.group.url();
  },
  findById: function(id) {
   var _id = parseInt(id, 10);
   return this.findWhere({
    id: _id
   });
  },
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.query_string_args);
   options.data = data;
   options.url = this.url();
   return backbone.sync(method, model, options);
  },
  comparator: function(model) {
   return model.get("name").toLowerCase();
  }
 });
}
());
ADOBE.AM.User = {};
ADOBE.AM.User.Models = {};
ADOBE.AM.User.Models.User = (function(adobe, backbone) {
 if (arguments.length === 0) {
  backbone = Backbone;
  adobe = ADOBE;
 }
 return backbone.Model.extend({
  defaults: {
   phoneNumber: "",
   firstName: "",
   lastName: "",
   email: "",
   username: "",
   status: "INACTIVE",
   groups: [],
   title: "",
   admin: false
  },
  groupAttributeName: "groups",
  adminAttributeName: "admin",
  idAttribute: "uid",
  getPasswordUrl: function() {
   return adobe.AM.API.USERS.user.url() + this.get("uid") + "/reset-password";
  },
  getPasswordUpdateUrl: function() {
   return adobe.AM.API.USERS.user.url() + "self/update-password";
  },
  getSelfUpdateUrl: function() {
   return adobe.AM.API.USERS.user.url() + "self/update";
  },
  isStatusActive: function() {
   return this.get("status") === this.constructor.statuses.ACTIVE;
  },
  getClonableAttritbues: function() {
   var attrs = {};
   _.each(this.defaults, function(val, key) {
    if (key === "username") {
     attrs[key] = "";
    } else {
     if (key === "groups") {
      var _groups = this.get(key);
      attrs[key] = _groups;
     } else {
      attrs[key] = this.get(key);
     }
    }
   }, this);
   return attrs;
  },
  changePassword: function() {
   return $.ajax({
    url: this.getPasswordUrl(),
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(this.uid)
   });
  },
  updatePassword: function(args) {
   return $.ajax({
    url: this.getPasswordUpdateUrl(),
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(args)
   });
  },
  updateSelf: function(props) {
   var modelAttributes = this.attributes;
   if (_.isArray(props)) {
    modelAttributes = {};
    _.each(this.attributes, function(val, key) {
     if (props.indexOf(key) >= 0) {
      modelAttributes[key] = val;
     }
    });
   }
   return $.ajax({
    url: this.getSelfUpdateUrl(),
    type: "PUT",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(modelAttributes)
   });
  },
  urlRoot: adobe.AM.API.USERS.user.url()
 }, {
  statuses: {
   ACTIVE: "ACTIVE",
   INACTIVE: "INACTIVE",
   LOCKED: "LOCKED"
  }
 });
}
());
ADOBE.AM.User.Collections = {};
ADOBE.AM.User.Collections.Users = (function(backbone, User, adobe) {
 if (arguments.length === 0) {
  backbone = Backbone;
  User = ADOBE.AM.User.Models.User;
  adobe = ADOBE;
 }
 return backbone.Collection.extend({
  model: User,
  query_string_args: {},
  addQueryStringArgs: function(qs) {
   _.extend(this.query_string_args, qs);
  },
  url: function() {
   return adobe.AM.API.USERS.user.url();
  },
  findByUid: function(uid) {
   var _uid = parseInt(uid, 10);
   return this.findWhere({
    uid: _uid
   });
  },
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.query_string_args);
   options.data = data;
   options.url = this.url();
   return backbone.sync(method, model, options);
  },
  comparator: function(model) {
   return model.get("lastName").toLowerCase();
  }
 });
}
());
ADOBE.AM.Permission = {};
ADOBE.AM.Permission.Models = {};
ADOBE.AM.Permission.Models.Permission = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  valid_permissions: [],
  initialize: function(args) {
   var name = null;
   if (!args) {
    throw new Error("name is required");
   }
   if (!args.name && this.name === null) {
    throw new Error("name is required");
   }
   name = args.name || this.name;
   if (name.match(/Permission$/) === null) {
    throw new Error("name must end with Permission");
   }
   if (args.permissions === void 0 || args.permissions !== void 0 && !(args.permissions instanceof Array)) {
    throw new Error("permissions are required");
   }
  },
  hasPermission: function(perms) {
   if (perms instanceof Array) {
    return !_.difference(perms, this.getPermissions()).length;
   }
   if (typeof perms != "string") {
    throw new Error("Argument must be either a String or an Array");
   }
   return _.indexOf(this.getPermissions(), perms) > -1;
  },
  getPermissions: function() {
   return this.get("permissions");
  },
  getName: function() {
   if (this.get("name") !== void 0) {
    return this.get("name");
   }
   return this.name;
  }
 });
}
());
ADOBE.AM.DataSource = {};
ADOBE.AM.DataSource.Collections = {};
ADOBE.AM.DataSource.Collections.AvailableIdTypes = (function(backbone, adobe) {
 var api;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  parse: function(response) {
   if (!Array.isArray(response)) {
    throw new Error("Response not valid!");
   }
   return response.map(function(type) {
    return {
     type: type
    };
   });
  },
  isIdTypeCrossDevice: function(type) {
   return type === "CROSS_DEVICE";
  },
  url: function() {
   return api.DATASOURCES.idTypes.url();
  },
  getValues: function() {
   return this.pluck("type");
  }
 });
}
());
ADOBE.AM.DataSource.Collections.MarketingCloudVisitorIDs = (function(backbone, adobe) {
 var api;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  parse: function(response) {
   if (!Array.isArray(response)) {
    throw new Error("Response not valid!");
   }
   return response.map(function(id) {
    return {
     id: id
    };
   });
  },
  getValues: function() {
   return this.pluck("id");
  },
  url: function() {
   return api.DATASOURCES.marketingCloudVisitorIdVersions.url();
  }
 });
}
());
ADOBE.AM.DataSource.Models = {};
ADOBE.AM.DataSource.Models.DataSourcePermission = (function(permission) {
 if (permission == undefined) {
  permission = ADOBE.AM.Permission.Models.Permission;
 }
 return permission.extend({
  name: "DataSourcePermission"
 });
}
());
ADOBE.AM.DataSource.Models.DataSource = (function(_, backbone, adobe, globals, DataSourcePermission, MarketingCloudVisitorIDs, AvailableIdTypes) {
 "use strict";
 var pid, api;
 if (arguments.length === 0) {
  _ = window._;
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  DataSourcePermission = ADOBE.AM.DataSource.Models.DataSourcePermission;
  MarketingCloudVisitorIDs = ADOBE.AM.DataSource.Collections.MarketingCloudVisitorIDs;
  AvailableIdTypes = ADOBE.AM.DataSource.Collections.AvailableIdTypes;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  defaults: {
   name: "",
   outboundS2S: false,
   description: "",
   inboundS2S: false,
   integrationCode: "",
   allowDataSharing: false,
   useAudienceManagerVisitorID: false,
   uniqueSegmentIntegrationCodes: false,
   uniqueTraitIntegrationCodes: false,
   masterDataSourceIdProvider: false,
   marketingCloudVisitorIdVersion: 0,
   idType: ""
  },
  set: function(attributes, options) {
   if (_.isObject(attributes) && attributes.hasOwnProperty("idType") && this.isIdTypeCrossDevice(attributes.idType)) {
    attributes.useAudienceManagerVisitorID = false;
   } else {
    if (_.isString(attributes) && attributes === "idType" && this.isIdTypeCrossDevice(options)) {
     this.attributes.useAudienceManagerVisitorID = false;
    }
   }
   return backbone.Model.prototype.set.call(this, attributes, options);
  },
  initialize: function(args) {
   this.set({
    id: this.get("dataSourceId")
   });
   this.relational = this.relational || {};
   if (args && args.permissions) {
    this.setDataSourcePermissions(args.permissions);
   }
  },
  idAttribute: "dataSourceId",
  setDataSourcePermissions: function(perms) {
   var relational = this.relational || {};
   relational.permissions = new DataSourcePermission({
    permissions: perms
   });
  },
  url: function() {
   return api.DATASOURCES.dataSources.url(this.get("dataSourceId"));
  },
  getDataProviderId: function() {
   return this.get("dataSourceId") || this.get("dataSourceId");
  },
  parse: function(response) {
   var perms = response.permissions;
   if (perms && _.isArray(perms)) {
    this.setDataSourcePermissions(perms);
   }
   return response;
  },
  canSetUniqueTraitIntegrationCodes: function() {
   return this.isNew();
  },
  canSetUniqueSegmentIntegrationCodes: function() {
   return this.isNew();
  },
  isFirstParty: function() {
   return this.get("pid") === pid;
  },
  getIdTypes: function() {
   return this.constructor.IDTYPES;
  },
  isIdTypeCrossDevice: function(type) {
   return this.getIdTypes().isIdTypeCrossDevice(type);
  },
  isAAMIdDisabled: function() {
   return this.isIdTypeCrossDevice(this.get("idType"));
  },
  getMarketingCloudVIDs: function() {
   return this.constructor.MARKETING_CLOUD_VIDS;
  },
  Bootstrap: function() {
   return this.constructor.Bootstrap();
  }
 }, {
  IDTYPES: new AvailableIdTypes(),
  MARKETING_CLOUD_VIDS: new MarketingCloudVisitorIDs(),
  Bootstrap: function() {
   var deferred = $.Deferred();
   $.when(this.IDTYPES.fetch(), this.MARKETING_CLOUD_VIDS.fetch()).then(deferred.resolve, deferred.reject);
   return deferred.promise();
  }
 });
}
());
ADOBE.AM.Common = {};
ADOBE.AM.Common.Collections = {};
ADOBE.AM.Common.Collections.PaginatedItems = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Paginator.requestPager.extend({
  custom_query_string_params: {},
  url: "",
  queryAttribute: "search",
  pageSizeAttribute: "pageSize",
  skipAttribute: "page",
  orderAttribute: "sortBy",
  customAttribute1: "descending",
  firstPage: 0,
  page: 0,
  pageSize: 50,
  sortField: "name",
  descending: true,
  customParam1: "descending",
  hook_parse: null,
  total: null,
  initialize: function(args) {
   if (args && args.hook_parse) {
    this.hook_parse = args.hook_parse;
   }
   if (args && args.custom_query_string_params) {
    this.custom_query_string_params = args.custom_query_string_params;
   }
  },
  parse: function(response) {
   this.totalPages = Math.ceil(response.total / this.pageSize);
   this.total = response.total;
   if (this.hook_parse != null) {
    response = this.hook_parse(response);
   }
   return response.list;
  },
  setParams: function(args) {
   if (typeof args.customParam1 != "undefined") {
    this.customParam1 = args.customParam1;
    delete args.customParam1;
   }
   if (typeof args.query != "undefined") {
    this.query = args.query;
    delete args.query;
   }
   if (typeof args.sortField != "undefined") {
    this.sortField = args.sortField;
    delete args.sortField;
   }
   _.extend(this.custom_query_string_params, args);
  },
  resetPagination: function() {
   this.totalPages = 0;
   this.page = 0;
   this.firstPage = 0;
   this.lastPage = 0;
   this.customParam1 = false;
  },
  goTo: function(page) {
   if (page !== undefined) {
    this.page = parseInt(page, 10);
    if (this.page > 0) {
     this.page--;
    }
    this.pager();
   }
  },
  pendingRequest: null,
  sync: function(method, model, options) {
   return backbone.Paginator.requestPager.prototype.sync.call(this, method, model, options);
  }
 });
}
());
ADOBE.AM.Algorithm = {};
ADOBE.AM.Algorithm.Models = {};
ADOBE.AM.Algorithm.Models.Algorithm = (function(backbone, adobe, globals) {
 var pid = null;
 var algorithm_url;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  backbone = Backbone;
  algorithm_url = ADOBE.AM.API.MODELS.algorithms.url;
 } else {
  pid = globals.pid;
  algorithm_url = adobe.AM.API.MODELS.algorithms.url;
 }
 return backbone.Model.extend({
  initialize: function(args) {
   if (args && args.algoTypeId) {
    this.set({
     id: args.algoTypeId
    });
   }
  },
  getName: function() {
   return this.get("name");
  },
  urlRoot: algorithm_url()
 });
}
());
ADOBE.AM.Algorithm.Collections = {};
ADOBE.AM.Algorithm.Collections.Algorithms = (function(backbone, algorithm, adobe, globals) {
 var pid, algorithm_url;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  backbone = Backbone;
  algorithm = ADOBE.AM.Algorithm.Models.Algorithm;
  api = ADOBE.AM.API;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 if (typeof backbone == undefined) {
  pid = globals.pid;
  algorithm_url = null;
 }
 return backbone.Collection.extend({
  model: algorithm,
  url: api.MODELS.algorithms.url()
 });
}
());
ADOBE.AM.User.Models.UserPermission = (function(permission) {
 if (permission == undefined) {
  permission = ADOBE.AM.Permission.Models.Permission;
 }
 return permission.extend({
  name: "UserPermission"
 });
}
());
ADOBE.AM.Taxonomy = {};
ADOBE.AM.Taxonomy.Models = {};
ADOBE.AM.Taxonomy.Models.Category = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  initialize: function() {
   this.set({
    id: this.get("categoryId")
   });
  },
  url: function() {
   return api.TAXONOMY.categories.url(this.get("categoryId"));
  },
  getCategoryId: function() {
   return this.get("categoryId");
  }
 });
}
());
ADOBE.AM.Taxonomy.Collections = {};
ADOBE.AM.Taxonomy.Collections.Categories = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  url: api.TAXONOMY.categories.url()
 });
}
());
ADOBE.AM.DataSource.Models.BlankModel = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  validate: function(attrs) {
   var errors = [];
   if (attrs.name == null || attrs.name === "") {
    errors.push("Name cannot be empty");
   }
   this.errors = errors;
   return this.errors.length == 0 ? "" : errors.join("\n");
  }
 });
}
());
ADOBE.AM.DataSource.Collections.DataSources = (function(backbone, DataSource, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  DataSource = ADOBE.AM.DataSource.Models.DataSource;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: DataSource,
  url: function() {
   return api.DATASOURCES.dataSources.url();
  },
  getFirstParty: function(pid) {
   if (typeof pid == "undefined") {
    return [];
   }
   return this.filter(function(ds) {
    return parseInt(ds.get("pid"), 10) === pid;
   });
  }
 });
}
());
ADOBE.AM.DataSource.Collections.DataSourcesForModeling = (function(backbone, DataSources, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  DataSources = ADOBE.AM.DataSource.Collections.DataSources;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return DataSources.extend({
  url: function() {
   return api.DATASOURCES.dataSources_modeling.url();
  }
 });
}
());
ADOBE.AM.Destination = {};
ADOBE.AM.Destination.Models = {};
ADOBE.AM.Destination.Models.DataOrderTraits = (function(backbone, adobe) {
 var api;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  properties_to_filter: ["pid", "id"],
  intialize: function(args) {
   _.bindAll(this, "populateMapping");
   this.set({
    id: this.destinationMappingId
   });
  },
  populateMapping: function(dest) {
   var mapping = api.DESTINATION.destination.getMapping(dest, this.toJSON());
   this.set({
    derivedMapping: mapping
   });
  },
  sync: function(method, model, options) {
   var data = {};
   var tmp_options = {};
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.properties_to_filter, key) == -1) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  }
 });
}
());
ADOBE.AM.Destination.Collections = {};
ADOBE.AM.Destination.Collections.DataOrderTraits = (function(backbone, DataOrderTraits) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (DataOrderTraits == undefined) {
  DataOrderTraits = ADOBE.AM.Destination.Models.DataOrderTraits;
 }
 return backbone.Collection.extend({
  initialize: function() {
   _.bindAll(this, "populateMappings");
  },
  model: DataOrderTraits,
  populateMappings: function(destination) {
   for (var i = 0; i < this.length; i++) {
    var model = this.at(i);
    model.populateMapping(destination);
   }
  }
 });
}
());
ADOBE.AM.Destination.Collections.Platforms = (function(backbone, adobe) {
 if (arguments.length == 0) {
  adobe = ADOBE;
  backbone = Backbone;
 }
 return backbone.Collection.extend({
  url: function() {
   return adobe.AM.API.DESTINATION.availablePlatforms.url();
  },
  parse: function(response) {
   var sortedResponse = [];
   if (Array.isArray(response)) {
    sortedResponse = response.sort(function(a, b) {
     var lowercaseA = a.toLowerCase();
     var lowercaseB = b.toLowerCase();
     if (lowercaseA > lowercaseB) {
      return 1;
     } else {
      if (lowercaseA < lowercaseB) {
       return -1;
      }
     }
     return 0;
    });
    return sortedResponse.map(function(platform) {
     var name = platform;
     var firstLetter = platform.charAt(0);
     var firstLetterUpperCase = firstLetter.toUpperCase();
     if (firstLetter === firstLetterUpperCase) {
      name = firstLetterUpperCase + platform.slice(1).toLowerCase();
     }
     return {
      type: platform,
      name: name
     };
    });
   }
   throw new Error("Bad data returned from API");
  }
 });
}
());
ADOBE.AM.Destination.Models.Destination = (function(backbone, DataOrderTraits, adobe, Platforms) {
 if (arguments.length == 0) {
  adobe = ADOBE;
  backbone = Backbone;
  DataOrderTraits = ADOBE.AM.Destination.Collections.DataOrderTraits;
  Platforms = ADOBE.AM.Destination.Collections.Platforms;
 }
 return backbone.Model.extend({
  properties_to_filter: ["pid"],
  initialize: function() {
   _.bindAll(this, "populateTraits");
   var ttp = this.get("mappings");
   if (ttp && ttp.length > 0) {
    this.populateTraits(ttp);
   }
  },
  populateTraits: function(ttp) {
   var collection = new DataOrderTraits(ttp);
   collection.populateMappings(this.toJSON());
   this.set({
    DataOrderTraits: collection
   });
  },
  isBidManagerType: function() {
   var con = this.constructor;
   return this.get("destinationType") === con.TYPES.s2s && con.SPECIAL_TYPES.BID_MANAGER.isBidManager(parseInt(this.get("dataSourceId"), 10));
  },
  getPlatformName: function(type) {
   var platformObj = this.constructor.PLATFORMS.where({
    type: type
   });
   return platformObj.length ? platformObj[0].get("name") : "";
  },
  getPlatforms: function() {
   return this.constructor.PLATFORMS;
  },
  getDefaultAutoFillMapping: function() {
   return this.constructor.AUTOFILL_MAPPING.DEFAULT_CODE;
  },
  isAutoFillCustomValue: function(type) {
   type = type || this.get("mappingAutoFiller");
   return this.constructor.AUTOFILL_MAPPING.isCustomValue(type);
  },
  isAutoFillSegmentId: function(type) {
   type = type || this.get("mappingAutoFiller");
   return this.constructor.AUTOFILL_MAPPING.isSegmentId(type);
  },
  isAutoFillIntegrationCode: function(type) {
   type = type || this.get("mappingAutoFiller");
   return this.constructor.AUTOFILL_MAPPING.isIntegrationCode(type);
  },
  isAutoFillMappingEnabled: function(type) {
   type = type || this.get("mappingAutoFiller");
   return this.constructor.AUTOFILL_MAPPING.isAutoFillMappingEnabled(type);
  },
  getTranslatedAutoFillMappingCodes: function() {
   return this.constructor.AUTOFILL_MAPPING.TRANSLATED;
  },
  sync: function(method, model, options) {
   var data = {};
   var tmp_options = {};
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.properties_to_filter, key) == -1) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  }
 }, {
  SPECIAL_TYPES: {
   BID_MANAGER: {
    dpid: [771],
    isBidManager: function(dpid) {
     return this.dpid.indexOf(parseInt(dpid, 10)) >= 0;
    }
   }
  },
  TYPES: {
   s2s: "S2S"
  },
  AUTOFILL_MAPPING: {
   TRANSLATED: {
    IC: "Integration Code",
    SID: "Segment ID",
    NONE: "None"
   },
   CODES: {
    IC: "IC",
    NONE: "NONE",
    SID: "SID"
   },
   DEFAULT_CODE: "NONE",
   isCustomValue: function(type) {
    return type === this.CODES.NONE;
   },
   isSegmentId: function(type) {
    return type === this.CODES.SID;
   },
   isIntegrationCode: function(type) {
    return type === this.CODES.IC;
   },
   isAutoFillMappingEnabled: function(type) {
    return this.isSegmentId(type) || this.isIntegrationCode(type);
   }
  },
  PLATFORMS: new Platforms()
 });
}
());
ADOBE.AM.Destination.Models.AutocompleteDestination = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  initialize: function(args) {
   this.set({
    id: this.get("destinationId")
   });
  }
 });
}
());
ADOBE.AM.Destination.Models.SingleDestination = (function(backbone, adobe) {
 var api, utils;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  backbone = Backbone;
  utils = ADOBE.AM.UTILS;
 } else {
  api = adobe.AM.API;
  utils = adobe.AM.UTILS;
 }
 return backbone.Model.extend({
  properties_to_filter: ["pid", "id"],
  initialize: function(args) {},
  urlRoot: api.DESTINATION.search.url(),
  validate: utils.MODELS.validators.validateData,
  sync: function(method, model, options) {
   var data = {};
   var tmp_options = {};
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.properties_to_filter, key) == -1) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  }
 });
}
());
ADOBE.AM.Destination.Collections.Destinations = (function(backbone, Destination, adobe, globals) {
 var pid, api, utils;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  Destination = ADOBE.AM.Destination.Models.Destination;
  utils = ADOBE.AM.UTILS;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
  utils = adobe.AM.UTILS;
 }
 return backbone.Collection.extend({
  model: Destination,
  url: api.DESTINATION.destination.url(),
  query_string_args: {},
  addQueryStringArgs: function(qs) {
   _.extend(this.query_string_args, qs);
  },
  hasSegment: function(sid) {
   this.addQueryStringArgs({
    containsSegment: sid
   });
  },
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.query_string_args);
   options.data = data;
   options.url = this.url;
   return backbone.sync(method, model, options);
  }
 });
}
());
ADOBE.AM.Destination.Collections.DestinationsAutocomplete = (function(backbone, AutocompleteDestination, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  AutocompleteDestination = ADOBE.AM.Destination.Models.AutocompleteDestination;
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: AutocompleteDestination,
  url: function(qs) {
   if (typeof qs != "object" || !qs) {
    qs = {};
   }
   return api.DESTINATION.destination.url(qs);
  }
 });
}
());
ADOBE.AM.Segment = {};
ADOBE.AM.Segment.Models = {};
ADOBE.AM.Segment.Models.SegmentPermission = (function(Permission) {
 if (Permission == undefined) {
  Permission = ADOBE.AM.Permission.Models.Permission;
 }
 return Permission.extend({
  name: "SegmentPermission"
 });
}
());
ADOBE.AM.Segment.Models.Folder = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
  pid = globals.pid;
 }
 return backbone.Model.extend({
  initialize: function() {
   this.set({
    id: this.get("folderId")
   });
  },
  url: function() {
   return api.FOLDERS.folder.url("segments", this.get("folderId"));
  }
 });
}
());
ADOBE.AM.Segment.Models.Segment = (function(backbone, SegmentFolder, DataSource, Destinations, SegmentPermission, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  backbone = Backbone;
  SegmentFolder = ADOBE.AM.Segment.Models.Folder;
  DataSource = ADOBE.AM.DataSource.Models.DataSource;
  SegmentPermission = ADOBE.AM.Segment.Models.SegmentPermission;
  Destinations = ADOBE.AM.Destination.Collections.Destinations;
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  adobe_am = ADOBE.AM;
 } else {
  adobe_am = adobe.AM;
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  valid_API_properties: ["dataSourceId", "sid", "description", "name", "startTime", "segmentRule", "folderId", "status", "integrationCode"],
  getActiveStatus: function() {
   return "ACTIVE";
  },
  getInactiveStatus: function() {
   return "INACTIVE";
  },
  defaults: {
   name: null
  },
  validate: function(attrs) {
   var errors = [];
   if (attrs.name == null || attrs.name === "") {
    errors.push("Name cannot be empty");
   }
   var numericFolderId = parseInt(attrs.folderId, 10);
   if (!_.isNumber(numericFolderId) || !(numericFolderId >= 0)) {
    errors.push("Folder cannot be empty");
   }
   this.errors = errors;
   return this.errors.length == 0 ? "" : errors.join("\n");
  },
  initialize: function(args) {
   if (args.sid) {
    this.set({
     sid: args.sid
    });
   }
   this.set({
    id: this.get("sid")
   });
   this.relational = this.relational || {};
   this.relational.folder = new SegmentFolder();
   this.relational.dataSource = new DataSource();
   this.relational.destinations = new Destinations();
   if (args && args.permissions) {
    this.setSegmentPermissions(args.permissions);
   }
  },
  canViewAllTraits: function() {
   var inaccessible_traits = this.get("hiddenTraits");
   if (typeof inaccessible_traits == "undefined") {
    return true;
   }
   return inaccessible_traits && inaccessible_traits.length === 0;
  },
  canMapAllTraits: function() {
   var mappable_traits = this.get("mappableTraits"),
       traits = this.get("traits");
   if (typeof mappable_traits == "undefined") {
    return false;
   }
   return (mappable_traits && traits) && (mappable_traits.length === traits.length);
  },
  resetModel: function() {
   this.clear({
    silent: true
   });
   this.set(this.defaults, {
    silent: true
   });
  },
  url: function() {
   return api.SEGMENTS.segment.url(this.get("sid"));
  },
  setStatus: function(status) {
   var that = this;
   this.save({
    status: status
   }, {
    error: function(obj, textStatus, errorThrown) {
     var alertObj = {
      title: (status == "ACTIVE" ? "Play" : "Pause") + " Segment"
     };
     that.set("status", "ACTIVE");
     alertObj.errorMsg = "Sorry, an error occured when trying to change status for segment: " + that.get("name") + ". Please try again.";
     alertObj.msg = errorThrown;
     adobe_am.alertBox && adobe_am.alertBox(alertObj);
    }
   });
  },
  getFolder: function(callback) {
   var that = this;
   this.relational.folder.set({
    folderId: this.get("folderId")
   });
   this.relational.folder.fetch({
    success: function(model, response) {
     that.set({
      folderModel: model
     });
     if (typeof callback == "function") {
      callback();
     }
    }
   });
  },
  getDataSource: function(getMultiple) {
   var that = this;
   if (!getMultiple) {
    this.relational.dataSource.set({
     dataSourceId: that.get("dataSourceId")
    });
   }
   this.relational.dataSource.fetch({
    success: function(model, response) {
     that.set({
      dataSourceModel: model
     });
    }
   });
  },
  getDestinations: function(uncached) {
   var that = this,
       dests = this.get("destinationCollection");
   if (dests instanceof backbone.Collection && !uncached) {
    return dests;
   }
   var $jqxhr = this.relational.destinations.fetch({
    data: {
     containsSegment: this.get("sid")
    }
   }).done(function(models) {
    that.set({
     destinationCollection: that.relational.destinations
    });
   }).fail(function() {
    that.set({
     destinationCollection: new backbone.Collection()
    });
   });
   return $jqxhr;
  },
  getDataSourceModelProp: function(prop) {
   var data_source_model = this.get("dataSourceModel");
   if (!data_source_model || !data_source_model instanceof backbone.Model) {
    return "";
   }
   return data_source_model.get(prop);
  },
  getFolderModelProp: function(prop) {
   var folderModel = this.get("folderModel");
   if (!folderModel || !(folderModel instanceof backbone.Model)) {
    return false;
   }
   return folderModel.get(prop);
  },
  sync: function(method, model, options) {
   var data = {};
   var tmp_options = {};
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.valid_API_properties, key) >= 0) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  },
  parse: function(response) {
   var perms = response.permissions;
   if (perms && _.isArray(perms)) {
    this.setSegmentPermissions(perms);
   }
   return response;
  },
  setSegmentPermissions: function(perms) {
   var relational = this.relational || {};
   relational.permissions = new SegmentPermission({
    permissions: perms
   });
  }
 }, {
  segmentTraitType: "SEGMENT",
  isRealizationTimeEmpty: function(realizationTime) {
   return parseInt(realizationTime, 10) === 0;
  }
 });
}
());
ADOBE.AM.Segment.Collections = {};
ADOBE.AM.Segment.Collections.PaginatedSegments = (function(PaginatedItems, Segment, adobe) {
 if (PaginatedItems == undefined) {
  PaginatedItems = ADOBE.AM.Common.Collections.PaginatedItems;
 }
 if (Segment == undefined) {
  Segment = ADOBE.AM.Segment.Models.Segment;
 }
 var api = adobe == undefined ? ADOBE.AM.API : adobe.AM.API;
 return PaginatedItems.extend({
  custom_query_string_params: {},
  model: Segment,
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.custom_query_string_params);
   options.data = data;
   options.url = this.url;
   if (this.pendingRequest) {
    if (this.pendingRequest.readyState && this.pendingRequest.readyState != 4) {
     this.pendingRequest.abort();
    }
   }
   this.pendingRequest = PaginatedItems.prototype.sync(method, model, options);
   return this.pendingRequest;
  },
  url: api.SEGMENTS.segment.url()
 });
}
());
ADOBE.AM.Segment.Collections.Segments = (function(backbone, adobe, Segment) {
 var api;
 if (arguments.length == 0) {
  backbone = Backbone;
  api = ADOBE.AM.API;
  Segment = ADOBE.AM.Segment.Models.Segment;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  query_string_params: {},
  model: Segment,
  url: api.SEGMENTS.search.url(),
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.query_string_params);
   options.data = data;
   options.url = this.url;
   return backbone.sync(method, model, options);
  }
 });
}
());
ADOBE.AM.Segment.Views = {};
ADOBE.AM.Segment.Views.SegmentsFolderTree = (function(backbone, adobe_am, mediator) {
 if (arguments.length == 0) {
  backbone = Backbone;
  adobe_am = ADOBE.AM;
  mediator = Mediator;
 }
 return backbone.View.extend({
  tagName: "div",
  className: "segmentsFolderTree",
  isRendered: false,
  render: function(args) {
   this.isRendered = true;
   $(this.el).addClass("folder_tree");
   $(this.parentElement).append($(this.el));
   this.addFolderWidget();
   this.loadFolders(args);
  },
  addFolderWidget: function() {
   var tree = null,
       that = this;
   this.folderTree = new adobe_am.hierarchy_tree();
   tree = this.folderTree;
   tree.treeElement = this.el;
   tree.initially_open = ["#0_folder"];
   tree.initially_select = this.tree_options.initially_select;
   tree.showCheckboxes = false;
   tree.folderThemeSrc = "/css/aam/style.css";
   tree.folderSrc = this.tree_options.folderSrc;
   tree.inc3rdParty = this.tree_options.inc3rdParty;
   tree.foldersOnly = this.tree_options.foldersOnly;
   tree.formatData = this.tree_options.formatData;
   this.tree = tree;
  },
  loadFolders: function(args) {
   var folderTree = this.folderTree,
       loadedTree = this.tree.loadTree(),
       that = this,
       args = args || {},
       broadcast = args.broadcast || false;
   $(folderTree.treeElement).html("");
   loadedTree.bind("loaded.jstree", function(event, data) {
    mediator.broadcast("SegmentTreeLoaded", {
     tree: that.$el
    });
   });
   loadedTree.bind("select_node.jstree", function(event, data) {
    var folderNode = $(folderTree.treeElement).jstree("get_selected").attr("id");
    var folderId = parseInt(folderNode, 10);
    mediator.broadcast("SegmentFolderSelectReceived", {
     folderNode: folderNode,
     folderId: folderId
    });
    event.stopPropagation();
   });
  },
  makeJSTreeId: function(id) {
   return "#" + id + "_segment_folder";
  },
  selectNode: function(id) {
   var tree_specific_id = id;
   if (!isNaN(id)) {
    tree_specific_id = this.makeJSTreeId(id);
   }
   this.$el.jstree("select_node", tree_specific_id);
  },
  clearFolders: function() {
   var tree = this.folderTree;
   $(tree.treeElement).jstree("get_selected").find("a.selectedNode").removeClass("selectedNode");
  },
  initialize: function(args) {
   _.bindAll(this, "render");
   _.bindAll(this, "addFolderWidget");
   _.bindAll(this, "loadFolders");
   _.bindAll(this, "selectNode");
   this.parentElement = args.parentElement;
   this.tree_options = args.tree_options;
  }
 });
}
());
ADOBE.AM.Model = {};
ADOBE.AM.Model.Models = {};
ADOBE.AM.Model.Models.RunStat = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  getAccuracy: function() {
   return this.get("AccuracyValue");
  },
  getReach: function() {
   return this.get("ReachValue");
  }
 }, {
  ReachThresholdName: "REACH",
  AccuracyThresholdName: "ACCURACY"
 });
}
());
ADOBE.AM.Model.Models.History = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  initialize: function(timestamp) {
   this.set("timestamp", timestamp);
  }
 });
}
());
ADOBE.AM.Trait = {};
ADOBE.AM.Trait.Models = {};
ADOBE.AM.Trait.Models.TraitPermission = (function(permission) {
 if (permission == undefined) {
  permission = ADOBE.AM.Permission.Models.Permission;
 }
 return permission.extend({
  name: "TraitPermission"
 });
}
());
ADOBE.AM.Trait.Models.Type = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  initialize: function(args) {
   if (args && args.pixelType) {
    this.set({
     id: args.pixelType
    });
   }
  },
  url: function() {
   return api.TRAITS.type.url(this.get("pixelType"));
  }
 });
}
());
ADOBE.AM.Trait.Models.Folder = (function(backbone, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Model.extend({
  initialize: function(args) {
   if (args && args.folderId) {
    this.set({
     id: args.folderId
    });
   }
  },
  url: function() {
   return api.TRAITS.folders.url(this.get("folderId"));
  },
  getFolderId: function() {
   return this.get("folderId");
  }
 });
}
());
ADOBE.AM.Trait.Models.Trait = (function(backbone, TraitFolder, TraitType, DataSource, TaxonomyCategory, adobe, globals, TraitPermission) {
 var pid, algorithm_url, api, utils;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  backbone = Backbone;
  TraitFolder = ADOBE.AM.Trait.Models.Folder;
  TraitType = ADOBE.AM.Trait.Models.Type;
  DataSource = ADOBE.AM.DataSource.Models.DataSource;
  TaxonomyCategory = ADOBE.AM.Taxonomy.Models.Category;
  utils = ADOBE.AM.UTILS;
  api = ADOBE.AM.API;
  TraitPermission = ADOBE.AM.Trait.Models.TraitPermission;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
  utils = adobe.AM.UTILS;
 }
 return backbone.Model.extend({
  idAttribute: "sid",
  relational: {},
  query_string_params: {},
  valid_API_properties: ["name", "description", "dataSourceId", "algoModelId", "integrationCode", "comments", "type", "folderId", "categoryId", "traitRule", "ttl", "traitType", "thresholdType", "accuracy"],
  getValidProperties: function() {
   var trait_type = this.get("traitType");
   if (trait_type == this.constructor.RuleBasedTraitType || trait_type == this.constructor.OnBoardedTraitType) {
    return _.without(this.valid_API_properties, "algoModelId", "accuracy", "thresholdType");
   }
   if (trait_type == this.constructor.AlgoTraitType) {
    return _.without(this.valid_API_properties, "traitRule", "comments", "type");
   }
   return this.valid_API_properties;
  },
  initialize: function(args) {
   if (args && args.sid) {
    this.set({
     id: args.sid
    });
   }
   this.relational = {};
   this.relational.folder = new TraitFolder();
   this.relational.type = new TraitType();
   this.relational.dataSource = new DataSource();
   this.relational.category = new TaxonomyCategory();
   if (args && args.permissions) {
    this.setTraitPermissions(args.permissions);
   }
   if (args && args.query_string_params) {
    this.setParams(args.query_string_params);
   }
  },
  isDPMTrait: function() {
   return utils.HELPERS.isDPMTrait(this.get("traitType"));
  },
  isAlgoTrait: function() {
   return utils.HELPERS.isAlgoTrait(this.get("traitType"));
  },
  isRuleBasedTrait: function() {
   return this.constructor.RuleBasedTraitType == this.get("traitType");
  },
  isOnboardedTrait: function() {
   return this.constructor.OnBoardedTraitType == this.get("traitType");
  },
  isDeletable: function() {
   return this.get("traitType") == this.constructor.RuleBasedTraitType || this.get("traitType") == this.constructor.AlgoTraitType || this.get("traitType") == this.constructor.OnBoardedTraitType;
  },
  isEditable: function() {
   return this.get("traitType") == this.constructor.RuleBasedTraitType || this.get("traitType") == this.constructor.AlgoTraitType || this.get("traitType") == this.constructor.OnBoardedTraitType;
  },
  isClonable: function() {
   return this.get("traitType") == this.constructor.RuleBasedTraitType || this.get("traitType") == this.constructor.AlgoTraitType;
  },
  getFolder: function() {
   var that = this;
   this.relational.folder.set({
    folderId: this.get("folderId")
   });
   return this.relational.folder.fetch({
    success: function(model, response) {
     that.set({
      folderModel: model
     });
    }
   });
  },
  getFolder2: function() {
   return this.relational.folder;
  },
  folderExists: function() {
   return !!this.relational.folder.getFolderId();
  },
  loadFolder: function() {
   var folderId = this.get("folderId");
   this.relational.folder.set({
    folderId: folderId
   });
   return this.relational.folder.fetch();
  },
  getCategory: function() {
   var that = this;
   this.relational.category.set({
    categoryId: this.get("categoryId")
   });
   return this.relational.category.fetch({
    success: function(model, response) {
     that.set({
      categoryModel: model
     });
    }
   });
  },
  getCategory2: function() {
   if (this.relational.category.get("categoryId")) {
    return this.relational.category;
   }
   return false;
  },
  loadCategory: function() {
   var categoryId = this.get("categoryId");
   this.relational.category.set({
    categoryId: categoryId
   });
   return this.relational.category.fetch();
  },
  categoryExists: function() {
   return !!this.relational.category.getCategoryId();
  },
  getDataSource: function(getMultiple) {
   var that = this;
   if (!getMultiple) {
    var dpid = that.get("dataSourceId");
    this.relational.dataSource.set({
     dataSourceId: dpid
    });
   }
   return this.relational.dataSource.fetch({
    success: function(model, response) {
     that.set({
      dataSourceModel: model
     });
    }
   });
  },
  loadDataSource: function() {
   var dataSourceId = this.get("dataSourceId");
   this.relational.dataSource.set({
    dataSourceId: dataSourceId
   });
   return this.relational.dataSource.fetch();
  },
  getDataSource2: function() {
   return this.relational.dataSource;
  },
  dataSourceExists: function() {
   return !!this.relational.dataSource.getDataProviderId();
  },
  getType: function(getMultiple) {
   var that = this;
   if (!getMultiple) {
    this.relational.type.set({
     pixelType: that.get("type")
    });
   }
   return this.relational.type.fetch({
    success: function(model) {
     that.set({
      typeModel: model
     });
    }
   });
  },
  getType2: function() {
   return this.relational.type;
  },
  setTraitPermissions: function(perms) {
   this.relational.permissions = new TraitPermission({
    permissions: perms
   });
  },
  setReach: function(value) {
   this.model.set("thresholdType", "REACH");
   this.model.set("accuracy", value);
  },
  setAccuracy: function(value) {
   this.model.set("thresholdType", "ACCURACY");
   this.model.set("accuracy", value);
  },
  setParams: function(obj) {
   _.extend(this.query_string_params, obj);
  },
  url: function() {
   var qsp = "";
   for (var key in this.query_string_params) {
    if (this.query_string_params.hasOwnProperty((key))) {
     qsp += key + "=" + this.query_string_params[key] + "&";
    }
   }
   if (qsp !== "") {
    qsp = "?" + qsp.replace(/\&$/, "");
   }
   return api.TRAITS.trait.url(this.get("sid")) + qsp;
  },
  sync: function(method, model, options) {
   var data = {};
   var tmp_options = {};
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.valid_API_properties, key) >= 0) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  },
  parse: function(response) {
   var perms = response.permissions;
   if (perms && _.isArray(perms)) {
    this.setTraitPermissions(perms);
   }
   return response;
  },
  validate: utils.MODELS.validators.validateData
 }, {
  AlgoTraitType: "ALGO_TRAIT",
  RuleBasedTraitType: "RULE_BASED_TRAIT",
  OnBoardedTraitType: "ON_BOARDED_TRAIT",
  getTraitTypeName: function(trait_type) {
   switch (trait_type) {
    case "RULE_BASED_TRAIT":
     return "Rule-based";
    case "ON_BOARDED_TRAIT":
     return "Onboarded";
    case "ALGO_TRAIT":
     return "Algorithmic";
    default:
     return "Unknown";
   }
  },
  AlgoModelClass: null
 });
}
());
ADOBE.AM.Trait.Collections = {};
ADOBE.AM.Trait.Collections.PaginatedTraits = (function(backbone, Trait, PaginatedItems, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  Trait = ADOBE.AM.Trait.Models.Trait;
  PaginatedItems = ADOBE.AM.Common.Collections.PaginatedItems;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return PaginatedItems.extend({
  custom_query_string_params: {},
  pendingRequest: {},
  model: Trait,
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.custom_query_string_params);
   options.data = data;
   options.url = this.url;
   if (this.pendingRequest) {
    if (this.pendingRequest.readyState && this.pendingRequest.readyState != 4) {
     this.pendingRequest.abort();
    }
   }
   this.pendingRequest = PaginatedItems.prototype.sync(method, model, options);
   return this.pendingRequest;
  },
  url: api.TRAITS.trait2.url()
 });
}
());
ADOBE.AM.Model.Models.ModelPermission = (function(permission) {
 if (permission == undefined) {
  permission = ADOBE.AM.Permission.Models.Permission;
 }
 return permission.extend({
  name: "ModelPermission"
 });
}
());
ADOBE.AM.Model.Collections = {};
ADOBE.AM.Model.Collections.ProcessingHistory = (function(backbone, History, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  backbone = Backbone;
  api = ADOBE.AM.API;
  History = ADOBE.AM.Model.Models.History;
 } else {
  api = adobe.AM.API;
  pid = globals.pid;
 }
 return backbone.Collection.extend({
  model: History,
  makeUrl: function(algoModelId) {
   this.url = api.MODELS.processing_history(algoModelId);
  }
 });
}
());
ADOBE.AM.Model.Collections.RunStats = (function(backbone, RunStat, globals, adobe) {
 var pid, api;
 if (arguments.length == 0) {
  RunStat = ADOBE.AM.Model.Models.RunStat;
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: RunStat,
  makeUrl: function(model_id) {
   this.url = api.MODELS.run_stats.url(model_id);
  },
  getMinAccuracy: function() {
   var value = this.at(0);
   if (value) {
    return value.getAccuracy();
   }
   throw new Error("No model run statistics");
  },
  parse: function(response) {
   var values = {},
       result = [],
       adjusted_i = 0,
       that = this,
       obj = {},
       max_accuracy = 1,
       expected_interval = 0.05;

   function adjustAccuracy(a) {
    return parseFloat(a).toFixed(2);
   }
   if (response && response instanceof Array && response.length) {
    _.each(response, function(arr) {
     values[arr.AccuracyValue.toFixed(2)] = arr.ReachValue;
    });
    if (response && response instanceof Array && response.length) {
     _.each(response, function(arr) {
      if (arr.ReachValue <= that.constructor.MAX_REACH_AUDIENCE_SIZE) {
       var adjusted_acc = parseFloat(arr.AccuracyValue).toFixed(2);
       result.push({
        AccuracyValue: adjusted_acc,
        ReachValue: arr.ReachValue
       });
      }
     });
    }
   }
   return result;
  },
  getReachFromAccuracy: function(acc) {
   var reach = null,
       results = this.where({
        AccuracyValue: acc
       });
   if (results.length) {
    reach = results[0].getReach();
   }
   return reach;
  },
  getEstimatedAccuracy: function(reach) {
   var acc_interval = 5,
       max_reach_index = -1,
       min_reach_index = -1;
   this.each(function(m, i) {
    if (parseInt(m.get("ReachValue"), 10) > reach) {
     max_reach_index = i;
    }
   });
   min_reach_index = max_reach_index + 1;
   if (max_reach_index == -1) {
    return 0;
   } else {
    if (max_reach_index == (this.length - 1)) {
     return 1;
    } else {
     var model_max_reach = this.at(max_reach_index);
     var model_min_reach = this.at(min_reach_index);
     var max_reach = model_max_reach.get("ReachValue");
     var min_reach = model_min_reach.get("ReachValue");
     var reach_inverval = parseInt((max_reach - min_reach) / acc_interval, 10);
     var estimated_acc = model_max_reach.get("AccuracyValue");
     var loop_reach = parseInt(max_reach - reach_inverval, 10);
     while (loop_reach > reach) {
      estimated_acc = parseFloat(estimated_acc) + 0.01;
      loop_reach = parseInt(loop_reach - reach_inverval, 10);
     }
     return parseFloat(estimated_acc).toFixed(2);
    }
   }
  }
 }, {
  MAX_REACH_AUDIENCE_SIZE: null
 });
}
());
ADOBE.AM.Model.Models.AlgoModel = (function(backbone, ModelPermission, DataSource, Algorithm, RunStats, PaginatedTraits, Trait, ProcessingHistory, Segment, adobe, globals) {
 var pid, api, utils;
 if (arguments.length == 0) {
  backbone = Backbone;
  DataSource = ADOBE.AM.DataSource.Models.DataSource;
  Algorithm = ADOBE.AM.Algorithm.Models.Algorithm;
  RunStats = ADOBE.AM.Model.Collections.RunStats;
  PaginatedTraits = ADOBE.AM.Trait.Collections.PaginatedTraits;
  Trait = ADOBE.AM.Trait.Models.Trait;
  ProcessingHistory = ADOBE.AM.Model.Collections.ProcessingHistory;
  Segment = ADOBE.AM.Segment.Models.Segment;
  ModelPermission = ADOBE.AM.Model.Models.ModelPermission;
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  utils = ADOBE.AM.UTILS;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
  utils = adobe.AM.UTILS;
 }
 return backbone.Model.extend({
  valid_API_properties: {
   put: ["name", "description", "status", "sid", "dataSources", "algoTypeId", "lookBackPeriod"],
   post: ["name", "description", "dataSources", "sid", "algoTypeId", "lookBackPeriod", "status"]
  },
  initialize: function(args) {
   if (args && args.algoModelId) {
    this.set({
     id: args.algoModelId
    });
   }
   this.relational = {};
   this.relational.dataSource = new DataSource();
   this.relational.algorithm = new Algorithm();
   this.relational.run_stats = new RunStats();
   this.relational.baseline = null;
   var TraitsUsingModelName = PaginatedTraits.extend({
    sort: function() {
     backbone.Collection.prototype.sort.apply(this, arguments);
    }
   });
   this.relational.traits_using_model_name = new TraitsUsingModelName({
    custom_query_string_params: {
     usesModel: null,
     page: 0,
     pageSize: 10,
     restrictType: "ALGO_TRAIT"
    },
    pendingRequest: {}
   });
   var InfluentialTraits = PaginatedTraits;
   this.relational.influential_traits = new InfluentialTraits({
    custom_query_string_params: {},
    pendingRequest: {}
   });
   this.relational.processing_history = new ProcessingHistory();
   if (args && args.permissions) {
    this.setModelPermissions(args.permissions);
   }
  },
  loadRunStats: function() {
   this.relational.run_stats.makeUrl(this.get("id"));
   return this.relational.run_stats.fetch();
  },
  loadModelHistory: function() {
   this.relational.processing_history.makeUrl(this.get("id"));
   return this.relational.processing_history.fetch();
  },
  loadAlgorithm: function(algorithm_id) {
   var algoTypeId = this.get("algoTypeId");
   if (algorithm_id != undefined) {
    algoTypeId = algorithm_id;
   }
   this.relational.algorithm.set({
    id: algoTypeId
   });
   return this.relational.algorithm.fetch();
  },
  loadTraitsUsingModelName: function() {
   this.relational.traits_using_model_name.setParams({
    usesModel: this.get("algoModelId")
   });
   return this.relational.traits_using_model_name.fetch();
  },
  loadInfluentialTraits: function(args) {
   this.relational.influential_traits.url = api.MODELS.influential_traits.url(this.get("id"));
   this.relational.influential_traits.resetPagination();
   this.relational.influential_traits.setParams(args);
   return this.relational.influential_traits.pager();
  },
  loadBaseline: function(baselineTraitType) {
   var isTrait = utils.HELPERS.isTrait(baselineTraitType);
   if (isTrait) {
    this.relational.baseline = new Trait({
     sid: this.get("sid")
    });
   } else {
    this.relational.baseline = new Segment({
     sid: this.get("sid")
    });
   }
   return this.relational.baseline.fetch({
    data: {
     includeMetrics: true
    }
   });
  },
  getRunStats: function() {
   return this.relational.run_stats;
  },
  runStatsAreValid: function() {
   return this.relational.run_stats.length > 1;
  },
  getModelHistory: function() {
   return this.relational.processing_history;
  },
  getAlgorithm: function() {
   return this.relational.algorithm;
  },
  getInfluentialTraits: function() {
   return this.relational.influential_traits;
  },
  getTraitsUsingModelName: function() {
   return this.relational.traits_using_model_name;
  },
  getRelationalData: function() {
   var data = {};
   _.each(this.relational, function(model, key) {
    var obj = {};
    obj[key] = model.toJSON();
    _.extend(data, obj);
   });
   return data;
  },
  setStatus: function(status) {
   return this.save({
    status: status
   });
  },
  wasLastRunSuccessfulWithData: function() {
   return !!this.get("lastSuccessfulRunTimestamp") && this.get("lastRunStatus") == this.constructor.processing_status.RUN_WITH_DATA;
  },
  hasBeenRunSuccessfullyOnce: function() {
   return !!this.get("lastSuccessfulRunTimestamp");
  },
  didLastRunHaveNoData: function() {
   return this.get("lastRunStatus") == this.constructor.processing_status.RUN_WITH_NO_DATA;
  },
  setModelPermissions: function(perms) {
   var relational = this.relational || {};
   relational.permissions = new ModelPermission({
    permissions: perms
   });
  },
  urlRoot: api.MODELS.algo_model.url(),
  methodURL: {
   "read": function() {
    var append = !this.isNew() ? this.get("id") + "?returnbaselinetraittype=true&includePermissions=true" : "";
    return this.urlRoot + append;
   },
   "create": function() {
    return this.urlRoot;
   },
   "update": function() {
    return this.urlRoot + this.get("id") + "?includePermissions=true";
   },
   "delete": function() {
    return this.urlRoot + this.get("id");
   }
  },
  parse: function(response) {
   var perms = response.permissions;
   if (perms && _.isArray(perms)) {
    this.setModelPermissions(perms);
   }
   return response;
  },
  sync: function(method, model, options) {
   var func = null,
       data = {},
       tmp_options = {},
       url = model.urlRoot;
   options = options || {};
   func = model.methodURL[method.toLowerCase()];
   if (typeof func == "function") {
    url = func.call(model);
   }
   options.url = url;
   if (method === "update" || method === "create") {
    for (var key in this.attributes) {
     if (_.indexOf(this.valid_API_properties["put"], key) >= 0) {
      data[key] = this.attributes[key];
     }
    }
    tmp_options.data = JSON.stringify(data);
    if (_.isObject(options.data) && !_.isEmpty(options.data)) {
     _.extend(tmp_options.data, options.data);
     delete options.data;
    }
    _.extend(tmp_options, options, {
     dataType: "json",
     contentType: "application/json"
    });
   } else {
    tmp_options = options;
   }
   return backbone.sync(method, model, tmp_options);
  },
  validate: utils.MODELS.validators.validateData
 }, {
  getActiveStatus: function() {
   return "ACTIVE";
  },
  getInactiveStatus: function() {
   return "INACTIVE";
  },
  getStatusName: function(status) {
   if (status == "ACTIVE") {
    return "Active";
   }
   return "Inactive";
  },
  processing_status: {
   RUN_FAILED: 0,
   RUN_WITH_DATA: 1,
   RUN_WITH_NO_DATA: 2
  }
 });
}
());
ADOBE.AM.Model.Collections.Models = (function(backbone, AlgoModel) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (AlgoModel == undefined) {
  AlgoModel = ADOBE.AM.Model.Models.AlgoModel;
 }
 return backbone.Collection.extend({
  model: AlgoModel
 });
}
());
ADOBE.AM.Model.Collections.PaginatedModels = (function(backbone, PaginatedItems, AlgoModel, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  PaginatedItems = ADOBE.AM.Common.Collections.PaginatedItems;
  AlgoModel = ADOBE.AM.Model.Models.AlgoModel;
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  backbone = Backbone;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return PaginatedItems.extend({
  model: AlgoModel,
  pendingRequest: {},
  custom_query_string_params: {},
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.custom_query_string_params);
   options.data = data;
   options.url = this.url;
   if (this.pendingRequest) {
    if (this.pendingRequest.readyState && this.pendingRequest.readyState != 4) {
     this.pendingRequest.abort();
    }
   }
   this.pendingRequest = PaginatedItems.prototype.sync(method, model, options);
   return this.pendingRequest;
  },
  url: api.MODELS.algo_model.url(),
  bulkDelete: function(model_ids) {
   if (model_ids == undefined || !_.isArray(model_ids) || model_ids.length == 0) {
    return false;
   }
   var difference = _.difference(model_ids, this.pluck("id"));
   if (difference.length) {
    return false;
   }
   var bulk_delete_url = api.MODELS.bulk_delete.url();
   var $jqxhr = $.ajax({
    dataType: "json",
    contentType: "application/json",
    url: bulk_delete_url,
    type: "POST",
    data: JSON.stringify(model_ids)
   });
   return $jqxhr;
  }
 });
}
());
ADOBE.AM.Widget = {};
ADOBE.AM.Widget.Views = {};
ADOBE.AM.Widget.Views.DestinationsToolbar = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.View.extend({
  initialize: function(args) {
   _.bindAll(this, "render");
   _.extend(this, args);
  }
 });
}
());
ADOBE.AM.Widget.Views.Table = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.View.extend({
  events: {
   "click thead th.sortable": "tableColumnHeaderClick",
   "click thead th.column_checkbox": "tableColumnCheckboxClick"
  },
  query_params: {},
  tableColumnCheckboxClick: function(event) {
   var $element = $(event.currentTarget),
       checkbox_enabled = $element.hasClass("enabled") || false;
   if (checkbox_enabled) {
    $element.removeClass("enabled").addClass("disabled");
    this.collection.each(function(model) {
     if (model.get("checked")) {
      model.set({
       checked: false
      });
     }
    });
   } else {
    $element.removeClass("disabled").addClass("enabled");
    this.collection.each(function(model) {
     if (!model.get("checked")) {
      model.set({
       checked: true
      });
     }
    });
   }
  },
  tableColumnHeaderClick: function(event) {
   var $element = $(event.currentTarget),
       comparator_func = function() {},
       clicked = $element.data("type");
   if ($element.hasClass("desc")) {
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("asc");
    comparator_func = function(a, b) {
     if (a.get(clicked) == b.get(clicked)) {
      return 0;
     } else {
      if (a.get(clicked) < b.get(clicked)) {
       return -1;
      } else {
       return 1;
      }
     }
    };
   } else {
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("desc");
    comparator_func = function(a, b) {
     if (a.get(clicked) == b.get(clicked)) {
      return 0;
     } else {
      if (a.get(clicked) < b.get(clicked)) {
       return 1;
      } else {
       return -1;
      }
     }
    };
   }
   this.collection.comparator = comparator_func;
   this.collection.sort();
   this.onBeforeSort();
  },
  initialize: function(args) {
   var tags = this.collection || null;
   _.bindAll(this, "addOne");
   _.bindAll(this, "addAll");
   _.bindAll(this, "remove");
   _.bindAll(this, "render");
   _.bindAll(this, "emptyTable");
   _.extend(this, args);
   this.$table_col_headers = this.$el.find("th");
   this.$table_body = this.$el.find("tbody");
   if (tags) {
    tags.on("add", this.addOne, this);
    tags.on("reset", this.addAll, this);
    tags.on("all", this.render, this);
   }
  },
  onBeforeSort: function() {},
  onAfterSort: function() {},
  render: function() {},
  emptyTable: function() {
   this.$table_body.empty();
  },
  addAll: function() {
   this.emptyTable();
   if (this.collection.length > 0) {
    this.collection.each(this.addOne);
   } else {
    var colspan = this.$table_col_headers.length;
    this.$table_body.html("<tr><td colspan=\"" + colspan + "\">" + "No results returned" + "</td></tr>");
   }
   this.onAfterSort();
  },
  addOne: function(item) {
   var view = new this.new_row({
    model: item
   });
   this.$table_body.append(view.render().el);
  }
 });
}
());
ADOBE.AM.Widget.Views.PaginatedTable = (function(Table) {
 if (Table == undefined) {
  Table = ADOBE.AM.Widget.Views.Table;
 }
 return Table.extend({
  tableColumnCheckboxClick: function(event) {
   var that = this,
       $element = $(event.currentTarget),
       checkbox_enabled = $element.hasClass("enabled") || false;
   if (checkbox_enabled) {
    $element.removeClass("enabled").addClass("disabled");
    this.collection.each(function(model) {
     if (model.get("checked")) {
      model.set({
       checked: false
      });
      var index_to_remove = $.inArray(model.get("sid"), that.checkedRows);
      that.checkedRows.splice(index_to_remove, 1);
      if (that.cache) {
       that.cache.cache.splice(index_to_remove, 1);
      }
     }
    });
   } else {
    $element.removeClass("disabled").addClass("enabled");
    this.collection.each(function(model) {
     if (!model.get("checked")) {
      model.set({
       checked: true
      });
      that.checkedRows.push(model.get("sid"));
      if (that.cache) {
       that.cache.addTrait(model.toJSON());
      }
     }
    });
   }
  },
  tableColumnHeaderClick: function(event) {
   var descendingOrder = null,
       $element = $(event.currentTarget),
       type = $element.data("type");
   if ($element.hasClass("desc")) {
    descendingOrder = true;
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("asc");
   } else {
    descendingOrder = false;
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("desc");
   }
   this.collection.resetPagination();
   this.collection.setParams(_.extend(this.query_params, {
    customParam1: descendingOrder,
    sortField: type
   }));
   this.collection.pager();
  }
 });
}
());
ADOBE.AM.Widget.Views.PaginatedTable2 = (function(Table) {
 if (Table == undefined) {
  Table = ADOBE.AM.Widget.Views.Table;
 }
 return Table.extend({
  tableColumnCheckboxClick: function(event) {
   var that = this,
       $element = $(event.currentTarget),
       checkbox_enabled = $element.hasClass("enabled") || false;
   if (checkbox_enabled) {
    $element.removeClass("enabled").addClass("disabled");
    this.collection.each(function(model) {
     if (model.get("checked")) {
      model.set({
       checked: false
      });
      var index_to_remove = $.inArray(model.get("sid"), that.checkedRows);
      that.checkedRows.splice(index_to_remove, 1);
      if (that.cache) {
       that.cache.cache.splice(index_to_remove, 1);
      }
     }
    });
   } else {
    $element.removeClass("disabled").addClass("enabled");
    this.collection.each(function(model) {
     if (!model.get("checked")) {
      model.set({
       checked: true
      });
      that.checkedRows.push(model.get("sid"));
      if (that.cache) {
       that.cache.addTrait(model.toJSON());
      }
     }
    });
   }
  },
  tableColumnHeaderClick: function(event) {
   var descendingOrder = null,
       $element = $(event.currentTarget),
       type = $element.data("sortby");
   if ($element.hasClass("desc")) {
    descendingOrder = true;
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("asc");
   } else {
    descendingOrder = false;
    this.$table_col_headers.removeClass("desc asc");
    $element.addClass("desc");
   }
   this.collection.resetPagination();
   this.collection.setParams(_.extend(this.query_params, {
    customParam1: descendingOrder,
    sortField: type,
    includePermissions: true
   }));
   this.collection.pager();
   this.onBeforeSort();
  }
 });
}
());
ADOBE.AM.Widget.Views.Toolbar = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.View.extend({
  events: {
   "click li": "buttonClick"
  },
  buttonClick: function(event) {
   var $element = $(event.currentTarget),
       type = $element.data("type");
   if (typeof this.userActions[type] !== "undefined") {
    this.userActions[type].call(this, $element);
   }
  },
  render: function() {
   $(this.el).html(this.template());
  },
  initialize: function(options) {
   _.bindAll(this, "render");
   this.userActions = options.userActions;
   this.template = options.template;
  }
 });
}
());
ADOBE.AM.Widget.Views.SearchBox = (function(backbone, cookies, mediator, aui, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  api = ADOBE.AM.API;
  pid = ADOBE.AM.pid;
  backbone = Backbone;
  mediator = Mediator;
  aui = AUI;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.View.extend({
  initialize: function(args) {
   _.bindAll(this, "render");
   _.bindAll(this, "clear");
   _.bindAll(this, "getSearchButton");
   _.bindAll(this, "triggerSearch");
   this.errors = [];
   this.template = args.template;
   this.parentElement = args.parentElement;
   this.parent_identifier = args.parent_identifier;
   this.searchTermCookieName = args.searchTermCookieName;
   this.selectedFolderCookieName = args.selectedFolderCookieName;
   this.query_string_args = {};
   if (args && args.beforeSearch) {
    this.beforeSearch = args.beforeSearch;
   }
   if (args && args.query_string_args) {
    this.query_string_args = args.query_string_args;
   }
  },
  events: {
   "keypress button.AUI_SearchField_Search": "triggerSearch",
   "keyup input[type=text]": "triggerSearchOnEnter"
  },
  beforeSearch: function() {},
  triggerSearchOnEnter: function(e) {
   if (e.keyCode != 13) {
    return;
   }
   this.triggerSearch(e);
  },
  clear: function() {
   this.aui_reference.set("value", "");
  },
  validateSearchTerm: function(term) {
   return true;
  },
  triggerSearch: function(e) {
   var that = this,
       result = null,
       okButton = null,
       message = null,
       event_type = null,
       search_term = that.aui_reference.get("value") || "",
       search_term_cookie_value = $.cookies.get(this.searchTermCookieName);
   if (e) {
    event_type = e.type;
   }
   if (search_term_cookie_value !== "undefined" && search_term_cookie_value !== null && $.trim($(".AUI_SearchField input[type=text]").val()) === "" && event_type !== "keyup" && event_type !== "click") {
    this.aui_reference.set("value", search_term_cookie_value);
    search_term = search_term_cookie_value;
   } else {
    if (event_type == "click" || event_type == "keyup") {
     if ($.trim($(".AUI_SearchField input[type=text]").val()).length) {
      this.aui_reference.set("value", search_term = $(".AUI_SearchField input[type=text]").val());
     }
     if ($.trim(search_term).length) {
      $.cookies.set(this.searchTermCookieName, search_term);
     }
     $.cookies.del(this.selectedFolderCookieName);
     if (APP.views.ListPage.SegmentFolderTree.segmentTree) {
      APP.views.ListPage.SegmentFolderTree.clearFolders();
     }
    }
   }
   result = this.validateSearchTerm(search_term);
   if (!result) {
    okButton = document.createElement("button");
    okButton.className = "primary";
    okButton.innerHTML = "OK";
    message = "<p>" + that.errors.join("<br />") + "</p>";
    this.errors = [];
    var modal = new aui.Dialog({
     header: "Error",
     content: message,
     width: "280px",
     height: "130px",
     footer: okButton,
     center: true
    }).render();
    aui.addListener(okButton, "click", function() {
     modal.hide();
    }, modal);
    modal.show();
    return false;
   }
   mediator.broadcast("ShowLoadingReceived");
   this.errors = [];
   this.beforeSearch();
   this.collection.setParams(_.extend({
    query: search_term
   }, this.query_string_args));
   this.collection.resetPagination();
   this.collection.fetch({
    success: function(coll, response) {
     mediator.broadcast("HideLoadingReceived", {
      loaded: "collection"
     });
     if (response.total === 0) {
      $("#segment_table_tbody").append("<tr><td colspan=\"6\">" + "No results returned" + "</td></tr>");
     }
    },
    error: function() {
     mediator.broadcast("HideLoadingReceived");
    }
   });
   mediator.broadcast("SearchRequestReceived", {
    search: search_term
   });
  },
  getSearchButton: function() {
   return this.$el.find("button.AUI_SearchField_Search").get(0);
  },
  render: function() {
   var search_button = null,
       clear_button = null,
       that = this;
   $(this.parentElement).append($(this.el).html(this.template()));
   this.aui_reference = aui.SimpleSearch({
    parent: this.parent_identifier,
    width: "151px"
   }).render();
   search_button = this.getSearchButton();
   clear_button = this.$el.find(".AUI_SearchField_Close").get(0);
   aui.addListener(search_button, "click", this.triggerSearch);
   aui.addListener(clear_button, "click", function() {
    $.cookies.del(that.searchTermCookieName);
   });
  }
 });
}
());
ADOBE.AM.Widget.Views.SearchField = (function(backbone, aui) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (aui == undefined) {
  aui = AUI;
 }
 return backbone.View.extend({
  query_string_args: {},
  errors: [],
  initialize: function(args) {
   _.bindAll(this, "render");
   _.bindAll(this, "clear");
   _.bindAll(this, "getSearchButton");
   _.bindAll(this, "triggerSearch");
   if (args && args.query_string_args) {
    this.query_string_args = args.query_string_args;
   }
   if (args && args.beforeSearch) {
    this.beforeSearch = args.beforeSearch;
   }
   if (args && args.afterSearch) {
    this.afterSearch = args.afterSearch;
   }
   this.render();
  },
  events: {
   "keypress button.AUI_SearchField_Search": "triggerSearch",
   "keyup input[type=text]": "triggerSearchOnEnter"
  },
  triggerSearchOnEnter: function(e) {
   if (e.keyCode != 13) {
    e.preventDefault();
    e.stopPropagation();
    return false;
   }
   this.triggerSearch(e);
  },
  clear: function() {
   this.aui_reference.set("value", "");
  },
  beforeSearch: function() {},
  afterSearch: function() {},
  triggerSearch: function(e) {
   var that = this,
       search_term = that.aui_reference.get("value");
   this.beforeSearch();
   this.errors = [];
   this.collection.setParams(_.extend({
    query: search_term
   }, this.query_string_args));
   this.collection.resetPagination();
   this.collection.fetch().always(this.afterSearch);
  },
  getSearchButton: function() {
   return this.$el.find("button.AUI_SearchField_Search").get(0);
  },
  render: function() {
   var button = null;
   this.aui_reference = aui.SimpleSearch({
    parent: this.el,
    width: "151px"
   }).render();
   button = this.getSearchButton();
   aui.addListener(button, "click", this.triggerSearch);
  }
 });
}
());
ADOBE.AM.Widget.Views.SearchFieldNoPagination = (function(SearchField, mediator) {
 if (SearchField == undefined) {
  SearchField = ADOBE.AM.Widget.Views.SearchField;
 }
 if (mediator == undefined) {
  mediator = Mediator;
 }
 return SearchField.extend({
  triggerSearch: function(e, queryString) {
   var that = this,
       search_term = that.aui_reference.get("value");
   mediator.broadcast("ShowLoadingReceived");
   this.errors = [];
   if (typeof queryString === "string" && queryString.length) {
    queryString = "&" + queryString;
   } else {
    queryString = "";
   }
   this.collection.fetch({
    data: "search=" + search_term + queryString
   }).always(function() {
    mediator.broadcast("HideLoadingReceived");
   });
  }
 });
}
());
ADOBE.AM.Widget.Views.Accordion = (function(backbone, aui) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (aui == undefined) {
  aui = AUI;
 }
 return backbone.View.extend({
  renderSubViews: function() {
   var that = this;
   _.each(this.sub_views, function(view) {
    view.render(that.el);
   });
  },
  hasBeenRendered: function() {
   return this.isRendered;
  },
  initialize: function(args) {
   var panel_args = null;
   _.bindAll(this, "render");
   _.bindAll(this, "renderSubViews");
   _.bindAll(this, "hasBeenRendered");
   _.bindAll(this, "isVisible");
   this.isRendered = false;
   this.sub_views = args.sub_views;
   this.lazy_load_views = args.lazy_load_views;
   if (args.help) {
    this.help = args.help;
   }
   panel_args = {
    title: args.title,
    parent: args.parent
   };
   if (args.aui_args) {
    _.extend(panel_args, args.aui_args);
   }
   this.panel = new aui.CollapsiblePanel(panel_args);
   return true;
  },
  isVisible: function() {
   return this.$el.is("visible");
  },
  render: function() {
   var that = this;
   this.panel.on("change:expanded", function() {});
   this.panel.render();
   this.el = this.panel.el("content");
   this.$el = $(this.el);
   this.renderSubViews();
   this.isRendered = true;
   if (this.help && !$(this.panel.el("title")).find(".context-help").length) {
    $(this.panel.el("title")).append($("<span class=\"context-help\" title=\"Help\" data-id=\"" + this.help + "\">&nbsp;</span>"));
   }
   return this;
  }
 });
}
());
ADOBE.AM.Widget.Views.Tabs = (function(backbone, aui) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (aui == undefined) {
  aui = AUI;
 }
 return backbone.View.extend({
  initialize: function(args) {
   _.extend(this, args);
   _.bindAll(this, "render");
   _.bindAll(this, "processTabs");
   _.bindAll(this, "processEvents");
   this.isRendered = false;
   this.events = this.aui_args.events;
   delete this.aui_args.events;
   this.processTabs();
   this.processEvents();
  },
  processEvents: function() {
   var that = this;
   if (!this.events) {
    return;
   }
   _.each(this.events, function(func, key) {
    that.tabs.on.call(that.tabs, key, func);
   });
  },
  processTabs: function() {
   this.tabs = new aui.Tabs(this.aui_args);
  },
  render: function() {
   this.tabs.render();
  }
 });
}
());
ADOBE.AM.Widget.Views.Autocomplete = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.View.extend({
  initialize: function(args) {
   _.bindAll(this, "render");
   _.bindAll(this, "attachAutocomplete");
   _.bindAll(this, "getSelected");
   _.extend(this, args);
   if (typeof args.query_string_args == "undefined") {
    this.query_string_args = {};
   }
   this.attachAutocomplete();
   if (args && args.hook_open) {
    this.hook_open = args.hook_open;
   }
   if (args && args.hook_format_reponse) {
    this.hook_format_reponse = args.hook_format_response;
   }
  },
  hook_open: null,
  attachAutocomplete: function() {
   var that = this,
       onsearch = function() {};
   if (this.loading_icon) {
    onsearch = function(event, ui) {
     that.loading_icon.css("visibility", "visible");
    };
   }
   $(this.el).autocomplete({
    minLength: 1,
    search: onsearch,
    source: function(request, response) {
     if (that.collection) {
      that.collection.reset();
     }
     that.collection.addQueryStringArgs({
      search: request.term
     });
     that.collection.fetch().done(function(data) {
      if (that.loading_icon) {
       that.loading_icon.css("visibility", "hidden");
      }
      that.collection.reset(data.list);
      if (that.hook_format_response) {
       response($.map(data.list, that.hook_format_response));
      }
      return data.list;
     });
    },
    select: function(event, ui) {
     $(that.el).data("item", ui.item);
     if (that.select_callback) {
      that.select_callback.apply(this, arguments);
     }
    },
    open: function(event, ui) {
     if (that.hook_open != null) {
      that.hook_open.apply(this, [that, event, ui]);
     }
    }
   });
  },
  getSelected: function() {
   var selected_item = $(this.el).data("item");
   if (!selected_item) {
    return false;
   }
   var search = {};
   search[this.getById] = selected_item[this.getById];
   var backbone_item = this.collection.where(search);
   return backbone_item[0];
  }
 });
}
());
ADOBE.AM.Widget.Views.PaginatedView = (function(backbone, templates) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 if (templates == undefined) {
  templates = APP.templates;
 }
 return backbone.View.extend({
  events: {
   "click a.servernext": "nextResultPage",
   "click a.serverprevious": "previousResultPage",
   "change select.serverhowmany": "changeCount",
   "change select.pagination_pages": "gotoPage"
  },
  tagName: "aside",
  template: _.template(templates.server_pagination),
  initialize: function(args) {
   _.extend(this, args);
   this.isRendered = false;
   this.collection.on("reset", this.render, this);
   this.collection.on("change", this.render, this);
   this.$el.appendTo(this.parent_element);
  },
  beforeEventClick: function() {},
  afterRender: function() {},
  render: function() {
   var html = this.template(this.collection.info());
   this.$el.html(html);
   if (this.isRendered) {
    this.afterRender();
   } else {
    this.isRendered = true;
   }
  },
  nextResultPage: function(e) {
   this.beforeEventClick();
   e.preventDefault();
   this.collection.requestNextPage();
  },
  previousResultPage: function(e) {
   this.beforeEventClick();
   e.preventDefault();
   this.collection.requestPreviousPage();
  },
  gotoPage: function(e) {
   this.beforeEventClick();
   e.preventDefault();
   var page = $(e.target).val();
   this.collection.goTo(page);
  },
  changeCount: function(e) {
   this.beforeEventClick();
   e.preventDefault();
   var per = $(e.target).val();
   this.collection.howManyPer(per);
  }
 });
}
());
ADOBE.AM.Trait.Models.AlgoTrait = (function(Trait, AlgoModel) {
 if (arguments.length == 0) {
  Trait = ADOBE.AM.Trait.Models.Trait;
  AlgoModel = ADOBE.AM.Model.Models.AlgoModel;
 }
 return Trait.extend({
  loadAlgoModel: function() {
   if (AlgoModel === null) {
    throw Error("Trait model must have AlgoModelClass static variable defined");
   }
   this.relational.model = new AlgoModel({
    id: this.get("algoModelId")
   });
   return this.relational.model.fetch();
  },
  getAlgoModel: function() {
   return this.relational.model;
  }
 });
}
());
ADOBE.AM.Trait.Collections.Types = (function(backbone, TraitType, adobe) {
 var api;
 if (arguments.length == 0) {
  TraitType = ADOBE.AM.Trait.Models.Type;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: TraitType,
  url: api.TRAITS.type.url()
 });
}
());
ADOBE.AM.Trait.Collections.Folders = (function(backbone, TraitFolder, adobe) {
 var api;
 if (arguments.length == 0) {
  TraitFolder = ADOBE.AM.Trait.Models.Folder;
  api = ADOBE.AM.API;
  backbone = Backbone;
 } else {
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: TraitFolder,
  url: function() {
   return api.TRAITS.folders.url();
  },
  parse: function(response) {
   var folderArr = [{
    folderId: response[0].folderId,
    path: response[0].path
   }];
   var parseSubFolders = function(parentFolder) {
    if (parentFolder.subFolders.length) {
     $(parentFolder.subFolders).each(function(idx, subFolder) {
      folderArr.push({
       folderId: subFolder.folderId,
       path: subFolder.path
      });
      if (subFolder.subFolders.length) {
       parseSubFolders(subFolder);
      }
     });
    }
   };
   parseSubFolders(response[0]);
   return folderArr;
  }
 });
}
());
ADOBE.AM.Trait.Collections.Traits = (function(backbone, Trait, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  Trait = ADOBE.AM.Trait.Models.Trait;
  api = ADOBE.AM.API;
  backbone = Backbone;
  pid = ADOBE.AM.pid;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return backbone.Collection.extend({
  model: Trait,
  query_string_args: {},
  addQueryStringArgs: function(qs) {
   _.extend(this.query_string_args, qs);
  },
  url: function() {
   var sids = "";
   if (this.sids) {
    sids = this.sids.join(",");
   }
   return api.TRAITS.trait.url() + sids;
  },
  sync: function(method, model, options) {
   var data = options.data || {};
   _.extend(data, this.query_string_args);
   options.data = data;
   options.url = this.url();
   return backbone.sync(method, model, options);
  }
 });
}
());
ADOBE.AM.Behaviors = {};
ADOBE.AM.Behaviors.BackbonePaging = {};
ADOBE.AM.Behaviors.BackbonePaging = (function(_) {
 "use strict";
 return {
  name: "BackbonePaging",
  setup: function() {
   this.totalPages = null;
   this.total = 0;
   this.search = "";
   this.lastFetchedPage = 0;
   this.paging_data = {};
  },
  resetPagination: function() {
   _.extend(this.paging_data, {
    page: 0
   });
   this.lastFetchedPage = 0;
   this.totalPages = null;
  },
  morePages: function() {
   return this.totalPages === null || parseInt(this.paging_data.page, 10) < parseInt(this.totalPages, 10);
  },
  parse: function(response) {
   this.totalPages = Math.ceil(response.total / response.pageSize);
   this.lastFetchedPage = response.page;
   if (typeof this.hook_parse === "function") {
    response = this.hook_parse(response);
   }
   return response.list;
  },
  getLastFetchedPage: function() {
   return this.lastFetchedPage;
  },
  setPagingData: function(pd) {
   this.paging_data = pd;
  },
  getPagingData: function() {
   if (this.search !== "") {
    return _.extend({
     search: this.search
    }, this.paging_data);
   }
   return this.paging_data;
  },
  setSearch: function(s) {
   this.search = s;
  },
  getSearch: function() {
   return this.search;
  },
  setSort: function(s) {
   this.paging_data.sort = s;
  },
  getSort: function() {
   return this.paging_data.sort;
  },
  setPage: function(p) {
   this.paging_data.page = p;
  },
  getPage: function() {
   return this.paging_data.page;
  },
  setPageSize: function(ps) {
   this.paging_data.pageSize = ps;
  },
  getPageSize: function() {
   return this.paging_data.pageSize;
  },
  getTotal: function() {
   return this.total;
  },
  setDescending: function(d) {
   this.paging_data.descending = d;
  },
  getDescending: function() {
   return this.paging_data.descending;
  },
  getTotalPages: function() {
   return this.totalPages;
  }
 };
}
());
ADOBE.AM.Behaviors.BehaviorSupport = {};
ADOBE.AM.Behaviors.BehaviorSupport = (function(_) {
 "use strict";
 return {
  decorate: function(obj) {
   if (typeof obj._behaviors === "undefined") {
    obj._behaviors = {};
   }
   _.extend(obj, {
    addBehavior: this.addBehavior,
    hasBehavior: this.hasBehavior
   });
  },
  addBehavior: function(behavior) {
   if (behavior.name === undefined) {
    throw new Error("A behavior must have a name");
   }
   this._behaviors[behavior.name] = behavior;
   delete behavior.name;
   _.extend(this, behavior);
   behavior.setup.call(this);
  },
  hasBehavior: function(name) {
   return this._behaviors.hasOwnProperty(name);
  }
 };
}
());
ADOBE.AM.Behaviors.InfiniteCollection = {};
ADOBE.AM.Behaviors.InfiniteCollection = (function(backbone, _, $, BackbonePaging, BehaviorSupport) {
 "use strict";
 return {
  name: "InfiniteCollection",
  setup: function() {
   this.request_queue = [];
   this.fetching = false;
   if (!(this instanceof backbone.Collection)) {
    throw new Error("Context object must be a backbone collection");
   }
   BehaviorSupport.addBehavior.call(this, BackbonePaging);
  },
  refresh: function() {
   this.reset();
   this.resetPagination();
  },
  isFetching: function() {
   return this.fetching;
  },
  getRequestQueue: function() {
   return this.request_queue;
  },
  refreshFetch: function() {
   this.fetching = true;
   this.refresh();
   this.fetchMore();
  },
  fetchMore: function() {
   var self = this;
   var BB = backbone.Collection.extend({
    parse: _.bind(this.parse, self)
   });
   var bb = new BB();
   if (!this.morePages()) {
    var deferred = $.Deferred();
    setTimeout(deferred.resolve, 0);
    return deferred;
   }
   this.request_queue.push(_.clone(this.getPagingData()));
   this.setPage(this.getPage() + 1);
   this.fetching = true;
   return bb.fetch({
    url: this.url(),
    data: this.request_queue.shift()
   }).done(function() {
    self.fetching = false;
    if (bb.length) {
     self.add(bb.toJSON());
    } else {
     self.trigger("reset");
    }
   }).always(function() {
    self.fetching = false;
    if (self.request_queue.length) {
     self.fetchMore();
    }
   });
  }
 };
}
());
ADOBE.AM.DataSource.Collections.DataSourcesForSegments = (function(backbone, DataSources, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  DataSources = ADOBE.AM.DataSource.Collections.DataSources;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return DataSources.extend({
  url: function() {
   return api.DATASOURCES.dataSources_segments.url();
  }
 });
}
());
ADOBE.AM.DataSource.Collections.DataSourcesForTraits = (function(backbone, DataSources, adobe, globals) {
 var pid, api;
 if (arguments.length == 0) {
  pid = ADOBE.AM.pid;
  api = ADOBE.AM.API;
  backbone = Backbone;
  DataSources = ADOBE.AM.DataSource.Collections.DataSources;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 return DataSources.extend({
  url: function() {
   return api.DATASOURCES.dataSources_traits.url();
  }
 });
}
());
ADOBE.AM.Destination.Models.DestinationPermission = (function(permission) {
 if (permission == undefined) {
  permission = ADOBE.AM.Permission.Models.Permission;
 }
 return permission.extend({
  name: "DestinationPermission"
 });
}
());
ADOBE.AM.Group.Collections.GroupPermissionObjects = (function(adobe, backbone, GroupPermission, Group) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Collection.extend({
  initialize: function(options) {
   var activeGroup = new Group().constructor.activeGroup;
   if (activeGroup) {
    this.groupId = activeGroup.get("id");
   }
  },
  model: GroupPermission,
  groupId: null,
  url: function() {
   return adobe.AM.API.GROUPS.permissions.url(this.groupId);
  },
  updateAll: function() {
   var collection = this,
       options = {
        success: function(model) {
         collection.reset(model);
        }
       };
   return backbone.sync("update", this, options);
  }
 });
}
());
ADOBE.AM.Group.Models.GroupPermissionObject = (function(backbone, adobe) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  defaults: {
   objectId: null,
   objectType: "",
   permissions: []
  },
  url: function() {
   return adobe.AM.API.GROUPS.permissions.url();
  }
 });
}
());
ADOBE.AM.Model.Views = {};
ADOBE.AM.Model.Views.ModelsModal = (function(backbone, marionette, PaginatedModels, Algorithms, SearchField, PaginatedTable2, PaginatedView, AlgoModel, ModelPermission, adobe, vent) {
 if (arguments.length == 0) {
  return;
 }
 var gk = new adobe.AM.UTILS.GATEKEEPER();
 gk.setPermissionClass(ModelPermission);
 gk.setErrorTypes(adobe.AM.UTILS.ERRORS.TYPES);
 gk.setSchemes(adobe.AM.PERMS.permission_schemes);
 var PaginatedModels = new PaginatedModels({
  hook_parse: function(response) {
   var filtered_resp = _.filter(response.list, function(model) {
    var modelPermissions = new ModelPermission({
     permissions: model.permissions
    });
    return gk.checkPermissions([modelPermissions], "can_view_model");
   });
   response.list = filtered_resp;
   return response;
  }
 });
 var add_button = document.createElement("button");
 var cancel_button = document.createElement("button");
 var div = document.createElement("div");
 add_button.className = "primary";
 add_button.innerHTML = "Add Selected Model to Trait";
 cancel_button.className = "secondary";
 cancel_button.innerHTML = "Cancel";
 AUI.addListener(add_button, "click", function(event) {
  var selected_id = $("input[name=selected_model]:radio:checked").val();
  var model = PaginatedModels.get(selected_id);
  if (model && !model.wasLastRunSuccessfulWithData()) {
   vent.trigger("modal:show", {
    type: "notice",
    message: adobe.AM.MESSAGES.getMessage("model_run_once").message
   });
   return false;
  }
  if (!selected_id) {
   vent.trigger("modal:show", {
    type: "notice",
    message: "You have not selected a model to add."
   });
   return false;
  }
  var selected_model = PaginatedModels.get(selected_id);
  vent.trigger("modal:model:selected", selected_model);
 });
 AUI.addListener(cancel_button, "click", function() {
  vent.trigger("modal:models:hide");
 });
 div.appendChild(add_button);
 div.appendChild(cancel_button);
 var models_modal = new AUI.Dialog({
  header: "Browse All Models",
  width: "1026px",
  height: "780px",
  footer: div,
  center: true,
  zIndex: 1003
 });
 var rendered = false;
 var algorithms_collections = new Algorithms({});
 var showDialog = function() {
  $("body").addClass("disableMainScroll");
  if (rendered) {
   models_modal.render().show();
   return;
  }
  algorithms_collections.fetch().always(showModal);
 };
 var showModal = function() {
  models_modal.render().show();
  models_modal.append("content", APP.templates.browse_models_modal);
  $(".AUI_CloseButton").click(function() {
   $("body").removeClass("disableMainScroll");
  });
  var SearchBar = new SearchField({
   el: $(".models_search"),
   collection: PaginatedModels,
   query_string_args: {
    includeMetrics: true,
    includePermissions: true
   },
   beforeSearch: function() {
    showTableLoading(true);
   },
   afterSearch: function(resp) {
    showTableLoading(false);
    if (resp.status == 404) {
     vent.trigger("modal:show", {
      type: "notice",
      message: adobe.AM.MESSAGES.getMessage("generic_404").message
     });
     vent.trigger("modal:models:hide");
     return false;
    }
   }
  });
  var ModelsTable = new PaginatedTable2({
   el: $("#models_table"),
   query_params: {
    includeMetrics: true
   },
   collection: PaginatedModels,
   new_row: backbone.View.extend({
    initialize: function() {
     _.bindAll(this, "checkbox");
     this.model.bind("change", this.render, this);
    },
    tagName: "tr",
    events: {
     "click .result_checkbox": "checkbox"
    },
    checkbox: function(event) {},
    template: APP.templates.model_table_row,
    templateHelpers: {
     formatTimestamp: function(ts) {
      var date = "";
      if (ts) {
       try {
        date = adobe.AM.UTILS.HELPERS.formatDate(ts, function(m, d, y) {
         return (m[1] ? m : "0" + m[0]) + "/" + (d[1] ? d : "0" + d[0]) + "/" + y;
        });
       } catch (__ERR__) {
        adobe.AM.UTILS.LOGGER.log("ModelsTable:formatTimestamp: " + __ERR__.message);
        date = "";
       }
      }
      return date;
     },
     displayAlgorithm: function(algoTypeId) {
      var model = algorithms_collections.get(algoTypeId);
      if (model) {
       return model.getName();
      }
      return algoTypeId;
     },
     displayStatus: function(status) {
      return AlgoModel.getStatusName(status);
     }
    },
    render: function() {
     var model_model = this.model;
     var data = {
      t: model_model
     };
     _.extend(data, this.templateHelpers);
     this.$el.html(_.template(this.template, data));
     return this;
    }
   }),
   onBeforeSort: function() {
    showTableLoading(true);
   },
   onAfterSort: function() {
    showTableLoading(false);
   },
   checkedRows: []
  });
  var ModelsPagination = new PaginatedView({
   parent_element: $(".AUI_Dialog_footer div"),
   collection: PaginatedModels,
   beforeEventClick: function() {
    showTableLoading(true);
   },
   afterRender: function() {
    showTableLoading(false);
   }
  });
  SearchBar.triggerSearch();
  rendered = true;
 };
 var loading = 0;
 var showTableLoading = function(show) {
  var loading_obj = adobe.AM.LoadingOverlay.config({
   id: "models_modal_table",
   parent_element: $(".models_list"),
   message: "Loading..."
  });
  if (show) {
   if (loading == 0) {
    loading_obj.show();
    loading = 1;
   } else {
    loading += 1;
   }
  } else {
   if (loading == 1) {
    loading_obj.hide();
    loading = 0;
   } else {
    if (loading == 0) {
     return false;
    }
    loading -= 1;
   }
  }
 };
 vent.on("modal:models:show", function() {
  showDialog();
 });
 vent.on("modal:models:hide", function() {
  $("body").removeClass("disableMainScroll");
  models_modal.hide();
 });
}
());
ADOBE.AM.Permission.Collections = {};
ADOBE.AM.Permission.Collections.ObjectTypes = (function(backbone, ObjectType) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Collection.extend({
  model: ObjectType
 });
}
());
ADOBE.AM.Permission.Models.ObjectType = (function(backbone) {
 if (backbone == undefined) {
  backbone = Backbone;
 }
 return backbone.Model.extend({
  defaults: {
   type: "",
   sources: [],
   wildcards: [],
   permissions: []
  }
 });
}
());
ADOBE.AM.Segment.Models.Limits = (function(backbone, adobe, globals, Limits) {
 var api;
 if (arguments.length == 0) {
  backbone = Backbone;
  api = ADOBE.AM.API;
  Limits = ADOBE.AM.Limits.Models.Limits;
 } else {
  api = adobe.AM.API;
 }
 var LimitsModel = Limits.extend({
  url: api.SEGMENTS.limits.url
 });
 return LimitsModel;
}
());
ADOBE.AM.Trait.Views = {};
ADOBE.AM.Trait.Views.BasicInfo = (function(backbone, marionette, app, templates, adobe) {
 if (arguments.length == 0) {
  return;
 }
 return backbone.Marionette.ItemView.extend({
  tagName: "dl",
  template: _.template(templates.trait.views.basic_info),
  templateHelpers: {
   formatTimestamp: function(ts) {
    var date = "-";
    if (typeof ts != undefined) {
     try {
      date = adobe.AM.UTILS.HELPERS.formatDate(ts, function(m, d, y) {
       return (m[1] ? m : "0" + m[0]) + "/" + (d[1] ? d : "0" + d[0]) + "/" + y;
      });
     } catch (__ERR__) {
      adobe.AM.UTILS.LOGGER.log("BasicInfo:templateHelpers:formatTimestamp: " + __ERR__.message);
     }
    }
    return date;
   },
   isAlgoTrait: function() {
    return this.traitType === "ALGO_TRAIT";
   }
  },
  render: function() {
   var names = {
        _datasource: "",
        _folder: "",
        _category: ""
       },
       datasource = null,
       folder = null,
       category = null,
       expires = null,
       type = null,
       self = this,
       data = {
        d: {}
       };
   data.d = this.model.toJSON();
   if (this.model.dataSourceExists()) {
    names._datasource = this.model.getDataSource2().get("name");
   }
   if (this.model.folderExists()) {
    names._folder = this.model.getFolder2().get("name");
   }
   category = this.model.getCategory2();
   if (this.model.categoryExists()) {
    names._category = this.model.getCategory2().get("name");
   }
   var more_props = {
    _comments: self.model.get("comments") || "",
    _integrationCode: self.model.get("integrationCode") || "",
    _expires: self.model.get("ttl") || ""
   };
   var combineAndPassData = function() {
    _.extend(data.d, names, more_props, self.templateHelpers);
    self.$el.html(self.template(data));
   };
   var jqxhr_pxType = this.model.getType();
   jqxhr_pxType.done(function(type) {
    names._type = type.name;
   }).always(combineAndPassData);
   return true;
  }
 });
}
());
ADOBE.AM.Trait.Views.TraitsFolderTree = (function(backbone, adobe, jstree, vent, mediator) {
 var eventAdapter = null;
 if (arguments.length == 0) {
  backbone = Backbone;
  adobe_am = ADOBE.AM;
  mediator = Mediator;
  eventAdapter = function(event, args) {
   mediator.broadcast(event, {
    folderNode: args.folderNode,
    folderId: args.folderId
   });
  };
 } else {
  adobe_am = adobe.AM;
  eventAdapter = function(event, args) {
   vent.trigger(event, {
    folderId: args.folderId
   });
  };
 }
 return backbone.View.extend({
  tagName: "div",
  className: "trait_storage",
  isRendered: false,
  render: function(args) {
   this.isRendered = true;
   $(this.el).addClass("folder_tree");
   $(this.parentElement).append($(this.el));
   this.addFolderWidget();
   this.loadFolders(args);
  },
  addFolderWidget: function() {
   var traitsTree = null,
       that = this;
   this.traitsFolderTree = new adobe_am.hierarchy_tree();
   traitsTree = this.traitsFolderTree;
   traitsTree.treeElement = this.el;
   traitsTree.initially_open = ["#0_folder"];
   traitsTree.initially_select = this.tree_options.initially_select;
   traitsTree.showCheckboxes = false;
   traitsTree.folderThemeSrc = "/css/aam/style.css";
   traitsTree.folderSrc = this.tree_options.folderSrc;
   traitsTree.inc3rdParty = this.tree_options.inc3rdParty;
   traitsTree.foldersOnly = this.tree_options.foldersOnly;
   traitsTree.formatData = this.tree_options.formatData;
   this.traitsTree = traitsTree;
  },
  loadFolders: function(args) {
   var traitsTree = this.traitsFolderTree,
       loadedTree = this.traitsTree.loadTree(),
       that = this,
       args = args || {},
       broadcast = args.broadcast || false;
   $(traitsTree.treeElement).html("");
   loadedTree.bind("loaded.jstree", function(event, data) {
    Mediator.broadcast("TraitsTreeLoaded", {
     tree: that.$el
    });
   });
   loadedTree.bind("select_node.jstree", function(event, data) {
    var folderNode = $(traitsTree.treeElement).jstree("get_selected").attr("id");
    var folderId = parseInt(folderNode, 10);
    eventAdapter("TraitFolderSelectReceived", {
     folderNode: folderNode,
     folderId: folderId
    });
    event.stopPropagation();
   });
  },
  makeJSTreeId: function(id) {
   return "#" + id + "_trait_folder";
  },
  selectNode: function(id) {
   var tree_specific_id = id;
   if (!isNaN(id)) {
    tree_specific_id = this.makeJSTreeId(id);
   }
   this.$el.jstree("select_node", tree_specific_id);
  },
  clearFolders: function() {
   var traitTree = this.traitsFolderTree;
   $(traitTree.treeElement).jstree("get_selected").find("a.selectedNode").removeClass("selectedNode");
  },
  initialize: function(args) {
   _.bindAll(this, "render");
   _.bindAll(this, "addFolderWidget");
   _.bindAll(this, "loadFolders");
   _.bindAll(this, "selectNode");
   this.parentElement = args.parentElement;
   this.tree_options = args.tree_options;
  }
 });
}
());
ADOBE.AM.Utilities = {};
ADOBE.AM.Utilities.ViewportHelper = {};
ADOBE.AM.Utilities.ViewportHelper = (function() {
 "use strict";
 return {
  isElementInViewport: function(el) {
   var rect = el.getBoundingClientRect();
   return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
  }
 };
}
());
ADOBE.AM.Widget.Views.AccordionSetCui = (function(backbone, marionette) {
 if (arguments.length == 0) {
  return false;
 }
 return backbone.Marionette.CollectionView.extend({
  tagName: "ul",
  className: "accordion",
  appendHtml: function(collectionView, itemView, index) {
   var self = this;
   collectionView.$el.append(itemView.el);
   if (index == this.collection.length - 1) {
    setTimeout(self.onRenderComplete, 0);
   }
  },
  onRenderComplete: function() {
   var self = this;
   var accordion = new CUI.Accordion({
    element: self.el
   });
   $("h3", self.el).click(function() {
    var $content = $(this).next(".content:first");
    var toggleSelectAllNone = function() {
     $(this).parent().find(".select-all-none").fadeToggle("fast");
    };
    if ($content.height() == 0) {
     var newHeight = $content.find(".auto-height-container").height() + 20;
     $content.animate({
      height: newHeight
     }, 400, toggleSelectAllNone);
    } else {
     $content.animate({
      height: 0
     }, 400, toggleSelectAllNone);
    }
   });
  }
 });
}
());
ADOBE.AM.Widget.Views.FolderTree = (function(backbone, adobe, adobe_am) {
 var utils;
 if (arguments.length == 0) {
  backbone = Backbone;
  utils = ADOBE.AM.UTILS;
  adobe_am = ADOBE.AM;
 } else {
  adobe_am = adobe.AM;
  utils = adobe_am.UTILS;
 }
 return backbone.View.extend({
  tree: null,
  tagName: "div",
  className: "",
  folder_api_url: "",
  $hoveredElement: null,
  tree_widget: null,
  tree_options: null,
  dialogs_parent: "body",
  dialogs: {
   rename: {
    id: "",
    name_id: "",
    instance: null,
    html: {
     icon: "<span class='edit btnIcon' title='Rename this folder'></span>",
     makeDialogHTML: function(id, name_id) {
      return "<div class=\"dialog\" style=\"display:none;\" id=\"" + id + "\" title=\"Rename Folder\">" + "<ul class=\"formFields\">" + "<li>Folder Name: <input type=\"text\" id=\"" + name_id + "\" size=\"20\" /></li>" + "<li>Folder ID: <span class=\"folderId\"></span></li>" + "</ul>" + "<div class=\"buttons\">" + "<button class=\"primary save\" >Save</button>  <button class=\"secondary cancel\">Cancel</button>" + "</div>" + "</div>";
     }
    }
   },
   add: {
    id: "",
    name_id: "",
    instance: null,
    html: {
     icon: "<span class='add btnIcon' title='Add a folder'></span>",
     makeDialogHTML: function(id, name_id) {
      return "<div class=\"dialog\" style=\"display:none;\" id=\"" + id + "\" title=\"Add Folder\">" + "<ul class=\"formFields\">" + "<li>Folder Name: <input type=\"text\" id=\"" + name_id + "\" size=\"20\" /></li>" + "</ul>" + "<div class=\"buttons\">" + "<button class=\"primary save\" >Save</button>  <button class=\"secondary cancel\">Cancel</button>" + "</div>" + "</div>";
     }
    }
   },
   remove: {
    id: "",
    name_id: "",
    instance: null,
    html: {
     icon: "<span class='delete btnIcon' title='Delete this folder'></span>",
     makeDialogHTML: function(id) {
      return "<div class=\"dialog\" style=\"display:none;\" id=\"" + id + "\" title=\"Delete Folder\">" + "Are you sure you want to delete this folder?" + "<div><span class=\"folderName\"></span> (<span class=\"folderId\"></span>)</div>" + "<div class=\"buttons\">" + "<button class=\"primary delete\" >Delete</button>  <button class=\"secondary cancel\">Cancel</button>" + "</div>" + "</div>";
     }
    }
   }
  },
  unique_id: null,
  isRendered: false,
  folderActionsEnabled: false,
  render: function() {
   $(this.el).addClass("folder_tree");
   $(this.parentElement).append($(this.el));
   this.addFolderWidget();
   this.loadFolders();
   this.isRendered = true;
  },
  addFolderWidget: function() {
   var tree = null,
       that = this,
       folderHTML = "";
   tree = new this.tree_widget();
   tree.treeElement = this.el;
   if (this.tree_options.initially_open != undefined) {
    var init_open = this.makeJSTreeId(this.tree_options.initially_open);
   }
   tree.initially_open = [init_open];
   tree.initially_select = this.tree_options.initially_select;
   tree.showCheckboxes = false;
   tree.folderThemeSrc = "/css/aam/style.css";
   tree.folderSrc = this.tree_options.folderSrc || this.folder_api_url();
   tree.inc3rdParty = this.tree_options.inc3rdParty;
   tree.foldersOnly = this.tree_options.foldersOnly;
   tree.formatData = this.tree_options.formatData;
   tree.two_state = typeof this.tree_options.two_state != "undefined" ? this.tree_options.two_state : false;
   tree.dots = typeof this.tree_options.dots != "undefined" ? this.tree_options.dots : false;
   tree.icons = typeof this.tree_options.icons != "undefined" ? this.tree_options.icons : true;
   this.tree = tree;
   if (this.folderActionsEnabled) {
    if (this.dialogs.add.id && $("#" + this.dialogs.add.id).length == 0) {
     this.addFolderDialog();
    }
    if (this.dialogs.remove.id && $("#" + this.dialogs.remove.id).length == 0) {
     this.addRemoveDialog();
    }
    if (this.dialogs.rename.id && $("#" + this.dialogs.rename.id).length == 0) {
     this.addRenameDialog();
    }
   }
  },
  addFolderDialog: function() {
   var that = this,
       dialog = this.dialogs.add,
       folderHTML = "";
   folderHTML = dialog.html.makeDialogHTML(dialog.id, dialog.name_id);
   $(this.dialogs_parent).append(folderHTML);
   dialog.instance = $("#" + dialog.id).dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     var $dialog = $("#" + dialog.id);
     $dialog.find(".cancel").click(function() {
      dialog.instance.dialog("close");
     });
     $dialog.find(".save").click(function() {
      var parentFolderID = null,
          folder_name = "",
          $name_element = null,
          newFolder = {
           domainid: 0
          };
      try {
       parentFolderID = parseInt(that.$hoveredElement.parent().attr("id"), 10);
      } catch (__ERR__) {
       throw new Error("Error getting the parent folder");
       return false;
      }
      dialog.instance.dialog("close");
      $name_element = $("#" + dialog.name_id);
      folder_name = $name_element.val();
      _.extend(newFolder, {
       parentFolderId: parentFolderID,
       name: $.trim(folder_name)
      });
      $name_element.val("");
      $.ajax({
       url: that.folder_api_url(),
       type: "POST",
       dataType: "json",
       contentType: "application/json",
       data: JSON.stringify(newFolder),
       success: function(data) {
        var selectedFolder = "";
        try {
         selectedFolder = "#" + $(that.tree.treeElement).jstree("get_selected").attr("id");
        } catch (__ERR__) {
         throw new Error("Could not select folder");
        }
        that.tree.initially_select = [selectedFolder];
        that.loadFolders();
       },
       error: function(obj, textStatus, errorThrown) {
        var alertObj = {
         title: that.constructor.error_messages.cannot_save_folder
        };
        if (obj.status == 409) {
         alertObj.errorMsg = that.constructor.error_messages.duplicate_name;
         alertObj.msg = that.constructor.error_messages.change_name_try_again;
        } else {
         alertObj.errorMsg = that.constructor.error_messages.unknown_error;
         alertObj.msg = errorThrown;
        }
        adobe_am.alertBox(alertObj);
       }
      });
     });
     $dialog.find("input").keypress(function(event) {
      if (utils.pressedEnter(event)) {
       $dialog.find(".save").click();
      }
     });
    }
   });
  },
  addRemoveDialog: function() {
   var that = this,
       dialog = that.dialogs.remove,
       folderHTML = "";
   folderHTML = dialog.html.makeDialogHTML(dialog.id, dialog.name_id);
   $(this.dialogs_parent).append(folderHTML);
   dialog.instance = $("#" + dialog.id).dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     $("#" + dialog.id).find(".cancel").click(function() {
      dialog.instance.dialog("close");
     });
     $("#" + dialog.id).find(".delete").click(function() {
      dialog.instance.dialog("close");
      var folderId = parseInt(that.$hoveredElement.parent().attr("id"), 10);
      $.ajax({
       url: that.folder_api_url(folderId),
       type: "DELETE",
       dataType: "json",
       success: function() {
        var parentFolder = null;
        try {
         parentFolder = parseInt(that.$hoveredElement.parent().attr("id"), 10);
         that.tree.initially_open = ["#0_folder", parentFolder];
         that.tree.initially_select = [parentFolder];
         that.loadFolders();
        } catch (__ERR__) {
         throw new Error("The folder was delete but could not open a folder");
        }
       },
       error: function(obj, textStatus, errorThrown) {
        var alertObj = {
         title: that.constructor.error_messages.delete_folder
        };
        if (obj.status == 409) {
         alertObj.errorMsg = that.constructor.error_messages.cannot_delete_folder, alertObj.msg = that.constructor.error_messages.cannot_delete_folder_message;
        } else {
         alertObj.errorMsg = that.constructor.error_messages.unknown_error;
         alertObj.msg = errorThrown;
        }
        adobe_am.alertBox(alertObj);
       }
      });
     });
    }
   });
  },
  addRenameDialog: function() {
   var that = this,
       dialog = this.dialogs.rename,
       folderHTML = "";
   folderHTML = dialog.html.makeDialogHTML(dialog.id, dialog.name_id);
   $(this.dialogs_parent).append(folderHTML);
   dialog.instance = $("#" + dialog.id).dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     var $dialog = $("#" + dialog.id);
     $dialog.find(".cancel").click(function() {
      dialog.instance.dialog("close");
     });
     $dialog.find(".save").click(function(e) {
      dialog.instance.dialog("close");
      var folderId = null,
          newName = "",
          $rename_input = null,
          getURL = "";
      try {
       $rename_input = $("#" + that.dialogs.rename.name_id);
       folderId = parseInt(that.$hoveredElement.parent().attr("id"), 10);
       newName = $.trim($rename_input.val());
       getURL = that.folder_api_url(folderId);
      } catch (__ERR__) {
       throw new Error("Rename folder error");
      }
      $rename_input.val("");
      $.getJSON(getURL, function(folderObj) {
       folderObj.name = newName;
       $.ajax({
        url: getURL,
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(folderObj),
        success: function() {
         var selectedFolder = "#" + $(that.tree.treeElement).jstree("get_selected").attr("id");
         that.tree.initially_select = [selectedFolder];
         that.loadFolders();
        },
        error: function(obj, textStatus, errorThrown) {
         var alertObj = {
          title: that.constructor.error_messages.cannot_save_folder
         };
         if (obj.status == 409) {
          alertObj.errorMsg = that.constructor.error_messages.duplicate_folder_name;
          alertObj.msg = that.constructor.error_messages.change_name_try_again;
         } else {
          alertObj.errorMsg = that.constructor.error_messages.unknown_error;
          alertObj.msg = errorThrown;
         }
         adobe_am.alertBox(alertObj);
        }
       });
      });
     });
     $("#" + that.dialogs.rename.id).find("input").keypress(function(event) {
      if (utils.pressedEnter(event)) {
       $("#" + that.dialogs.rename.id).find(".save").click();
      }
     });
    }
   });
  },
  loadFolders: function(args) {
   var loadedTree = this.tree.loadTree(),
       that = this,
       args = args || {};
   $(that.tree.treeElement).html("");
   loadedTree.bind("loaded.jstree", function(event, data) {
    that.hookTreeLoaded();
   });
   loadedTree.bind("hover_node.jstree", function(event, data) {
    var html = "";
    if (that.folderActionsEnabled) {
     if (that.dialogs.add.id) {
      html += that.dialogs.add.html.icon;
     }
     if (that.dialogs.rename.id) {
      html += that.dialogs.rename.html.icon;
     }
     if (that.dialogs.remove.id) {
      html += that.dialogs.remove.html.icon;
     }
     var $element = $(data.args[0]);
     if ($element.prop("nodeName") != "A") {
      return;
     }
     that.$hoveredElement = $element;
     if ($element.find("span").length) {
      return;
     }
     $element.append(html).find("span").on("click", function(e) {
      e.stopPropagation();
      var dialogs = that.dialogs;
      var folderId = parseInt($(e.target).closest("li[id]").attr("id"), 10);
      if ($(e.target).hasClass("add")) {
       dialogs.add.instance.dialog("open");
      } else {
       if ($(e.target).hasClass("edit")) {
        $("#" + dialogs.rename.name_id).val($.trim($(e.target).parent().text()));
        $("#" + dialogs.rename.id).find(".folderId").text(folderId);
        dialogs.rename.instance.dialog("open");
       } else {
        if ($(e.target).hasClass("delete")) {
         $("#" + dialogs.remove.id + " .folderName").text($(e.target).parent().text());
         $("#" + dialogs.remove.id).find(".folderId").text(folderId);
         dialogs.remove.instance.dialog("open");
        }
       }
      }
      $(".ui-dialog:visible").addClass("fixed-pos");
      return false;
     });
    }
   });
   loadedTree.bind("select_node.jstree", function(event, data) {
    var folderNode = $(that.tree.treeElement).jstree("get_selected").attr("id");
    var folderId = parseInt(folderNode, 10);
    that.hookSelectNode({
     folderNode: folderNode,
     folderId: folderId
    });
    event.stopPropagation();
   });
  },
  hookTreeLoaded: function() {},
  hookSelectNode: function(args) {},
  makeJSTreeId: function(id, text) {
   return "#" + id + (text ? text : "_folder");
  },
  selectNode: function(id, text) {
   var tree_specific_id = id;
   if (!isNaN(id)) {
    tree_specific_id = this.makeJSTreeId(id, text);
   }
   var $selected_id = null;
   var node = this.getSelectedNode();
   if (node) {
    $selected_id = "#" + node.attr("id");
   }
   if ($selected_id != tree_specific_id) {
    this.clearFolders();
    this.closeAllNodes();
    this.$el.jstree("select_node", tree_specific_id);
   }
  },
  openNode: function(id, text) {
   var tree_specific_id = id;
   if (!isNaN(id)) {
    tree_specific_id = this.makeJSTreeId(id, text);
   }
   this.$el.jstree("open_node", tree_specific_id);
  },
  closeAllNodes: function() {
   $(this.el).find("li.jstree-open").removeClass("open").addClass("jstree-closed");
  },
  clearFolders: function() {
   $(this.tree.treeElement).jstree("get_selected").find("a.selectedNode").removeClass("selectedNode");
  },
  getSelectedNode: function() {},
  getDialogId: function(type) {
   switch (type) {
    case "remove":
    case "delete":
     return this.dialogs.remove.id;
     break;
    case "rename":
     return this.dialogs.rename.id;
     break;
    case "add":
     return this.dialogs.add.id;
     break;
    default:
     return false;
     break;
   }
  },
  checkArguments: function(args) {
   if (args == undefined) {
    throw new this.constructor.ArgError("arguments", "certain arguments are required");
   }
   if (args && args.className == undefined) {
    throw new this.constructor.ArgError("className", "className must be defined");
   }
   if (args && args.folder_api_url == undefined) {
    throw new this.constructor.ArgError("folder_api_url", "folder_api_url must be defined");
   }
   if (args && typeof args.folder_api_url != "function") {
    throw new this.constructor.ArgError("folder_api_url", "folder_api_url must be a function");
   }
   if (args.tree_widget == undefined) {
    throw new this.constructor.ArgError("tree_widget", "tree_widget must be defined");
   }
   if (args && args.tree_options == undefined) {
    throw new this.constructor.ArgError("tree_options", "tree_options must be defined");
   }
   return true;
  },
  initialize: function(args) {
   var dialogs = this.dialogs;
   if (!this.checkArguments(args)) {
    return false;
   }
   this.unique_id = new Date().getTime();
   if (args && args.folder_actions) {
    this.folderActionsEnabled = true;
    if (args.folder_actions.rename) {
     dialogs.rename.id = "renameFolderDialog_" + this.unique_id;
     dialogs.rename.name_id = "renameFolderName_" + this.unique_id;
    }
    if (args.folder_actions.add) {
     dialogs.add.id = "addSubFolderDialog_" + this.unique_id;
     dialogs.add.name_id = "subFolderName_" + this.unique_id;
    }
    if (args.folder_actions.remove) {
     dialogs.remove.id = "deleteFolderDialog_" + this.unique_id;
    }
    delete args.folder_actions;
   }
   _.bindAll(this, "render", "addFolderWidget", "loadFolders", "selectNode", "getSelectedNode", "closeAllNodes", "clearFolders", "hookTreeLoaded", "hookSelectNode", "getDialogId", "addFolderDialog", "addRenameDialog", "addRemoveDialog");
   _.extend(this, args);
  }
 }, {
  ArgError: function(p, m) {
   this.param = p;
   this.message = m;
  },
  error_messages: {
   cannot_save_folder: "Cannot save folder",
   duplicate_name: "Duplicate name.",
   change_name_try_again: "Change the name and try again.",
   unknown_error: "An error occured.",
   delete_folder: "Delete Folder",
   cannot_delete_folder: "Cannot delete.",
   cannot_delete_folder_message: "You cannot delete this folder.  It contains traits or another folder.  Move or delete the contents first.",
   duplicate_folder_name: "Duplicate name."
  }
 });
}
());
ADOBE.AM.Widget.Views.LimitsUsage = (function(backbone, adobe, globals, templates) {
 var pid, api;
 if (arguments.length == 0) {
  backbone = Backbone;
  api = ADOBE.AM.API;
  templates = APP.templates;
 } else {
  pid = globals.pid;
  api = adobe.AM.API;
 }
 templates = templates.limits_widget;
 var LimitsUsage = Backbone.View.extend({
  initialize: function(args) {
   var supportListenTo = !!this.listenTo;
   if (args == void 0) {
    throw new Error("No arguments defined");
   }
   if (args.model == void 0 || !(args.model instanceof Backbone.Model)) {
    throw new Error("Model argument is not a backbone model!");
   }
   if (args.templateType == void 0 && this.template == void 0) {
    throw new Error("You must define a templateType");
   }
   if (args.templateType != void 0) {
    var template = templates[args.templateType.toLowerCase()];
    if (template == void 0) {
     throw new Error("The templateType you defined is not available");
    }
    this.template = _.template(template);
   }
   this.model = args.model;
   this.collections = args.collections;
   var deferreds = [$.Deferred()];
   if (this.model.isLoaded()) {
    deferreds[0].resolve();
   } else {
    if (supportListenTo) {
     this.listenTo(this.model, "change", deferreds[0].resolve);
    } else {
     this.model.on("change", deferreds[0].resolve);
    }
   }
   for (var i = 0; i < this.collections.length; i++) {
    var _def = $.Deferred();
    deferreds.push(_def);
    if (this.collections[i].length > 0) {
     _def.resolve();
    } else {
     if (supportListenTo) {
      this.listenTo(this.collections[i], "reset", _def.resolve);
     } else {
      this.collections[i].on("reset", _def.resolve);
     }
    }
   }
   $.when.apply($, deferreds).then(function() {
    this.render();
   }.bind(this), function() {
    console.log("SOmething failed");
   });
  },
  render: function() {
   var totals = [];
   var data = {};
   totals = this.collections.map(function(col) {
    return col.total;
   });
   data = _.extend({
    totals: totals
   }, this.model.attributes);
   this.$el.html(this.template(data));
   console.log(this.model.attributes);
   this.collections.forEach(function(c) {
    console.log(c);
   });
  }
 });
 return LimitsUsage;
}
());
ADOBE.AM.Widget.Views.ListTableAlphabetNav = (function(backbone, marionette, vent) {
 if (arguments.length == 0) {
  return false;
 }
 return backbone.Marionette.CompositeView.extend({
  className: "hasAlphabetNav",
  lastCharCode: "",
  initialize: function(options) {
   this.checked = [];
   this.lastChecked = null;
   this.type = options.type;
   this.template = _.template($("#" + options.type.toLowerCase() + "ListTable").html());
   if (options.onCompositeCollectionRendered && this.collection.length) {
    this.onCompositeCollectionRendered = options.onCompositeCollectionRendered;
   }
  },
  events: {
   "click .scrollTo.enabled": "scrollTo",
   "click th input[name=checkAll]": "checkAll",
   "click td input[name=checkOne]": "checkOne"
  },
  scrollTo: function(e) {
   $(".relativeFrame").scrollTo(this.$("#scroll-" + $(e.currentTarget).text()), 400, {
    axis: "y"
   });
  },
  check: function(lastChecked) {
   var checked = _.map(this.$("tbody input:checked"), function(checkbox) {
    return parseInt(checkbox.value, 10);
   });
   this.checked = checked;
   this.lastChecked = lastChecked;
   var data = {
    checked: checked
   };
   if (lastChecked) {
    data.lastChecked = lastChecked;
   }
   vent.trigger("User:Table:check", data);
  },
  checkAll: function(e) {
   if (e.currentTarget.checked) {
    this.$("tbody input[name=checkOne]").prop("checked", true);
   } else {
    this.$("tbody input[name=checkOne]").prop("checked", false);
   }
   this.check();
  },
  checkOne: function(e) {
   if (e.currentTarget.checked) {
    $(e.currentTarget).prop("checked", true);
    this.check(parseInt(e.currentTarget.value, 10));
   } else {
    $(e.currentTarget).prop("checked", false);
    this.check();
   }
  },
  appendHtml: function(collectionView, itemView, index) {
   if (!this.collection.length) {
    collectionView.$("tbody").append(new this.emptyView().render().el);
    this.$("table.data").addClass("no-results");
    return false;
   }
   var charCode = itemView.model.get(this.options.sortBy).toUpperCase().charCodeAt(0);
   if (this.lastCharCode != charCode) {
    var letter = String.fromCharCode(charCode);
    collectionView.$("tbody").append("<tr class=\"letterAnchorRow\"><td colspan=\"6\">" + "<div id=\"scroll-" + letter + "\" class=\"letterAnchor\"></div><div class=\"letter\">" + letter + "</div>" + "</td></tr>");
    this.lastCharCode = charCode;
   }
   collectionView.$("tbody").append(itemView.el);
  },
  itemViewOptions: function() {
   delete this.options.id;
   return this.options;
  },
  itemView: backbone.Marionette.ItemView.extend({
   initialize: function(options) {
    var self = this;
    this.templateData = {};
    this.template = _.template($("#" + options.type + "ListTableRow").html());
    if (options.multiProps) {
     _.each(options.multiProps, function(multiProp, key) {
      var filteredColl = multiProp.filter(function(model) {
       if (_.indexOf(self.model.get(key), model.get("id")) > -1) {
        return true;
       }
      });
      self.templateData[key] = filteredColl;
     });
    }
   },
   tagName: "tr",
   render: function() {
    var self = this;
    this.$el.html(this.template(_.extend(self.model.toJSON(), self.templateData)));
   }
  }),
  emptyView: backbone.Marionette.ItemView.extend({
   tagName: "tr",
   template: _.template("<td colspan=\"6\"><span class=\"no-results-txt\">No results returned.</span></td>")
  }),
  getChecked: function() {
   return this.checked;
  }
 });
}
());
ADOBE.AM.Widget.Views.ListTableInfiniScroll = (function($, _, backbone, marionette, vent, ViewPortHelper) {
 "use strict";
 if (arguments.length === 0) {
  return false;
 }
 return backbone.Marionette.CompositeView.extend({
  checkElementInViewport: function() {
   var el = this.$el.find("tr:last").eq(0);
   if (el.length === 0) {
    return;
   }
   el = el[0];
   if (this.isElementInViewport(el)) {
    this.collection.fetchMore();
   }
  },
  checkboxColumn: true,
  tagName: "form",
  isElementInViewport: ViewPortHelper.isElementInViewport,
  boundViewport: function() {
   return _.debounce(_.bind(this.checkElementInViewport, this), 100);
  },
  isLoadingState: false,
  isEmptyState: false,
  boundViewportEvent: null,
  initialize: function(options) {
   var self = this;
   this.isLoadingState = false;
   this.isEmptyState = false;
   _.bindAll(this, "boundViewport", "checkElementInViewport");
   this.boundViewportEvent = self.boundViewport();
   $(window).on({
    DOMContentLoaded: this.boundViewportEvent,
    load: this.boundViewportEvent,
    resize: this.boundViewportEvent
   });
   this.checked = [];
   if (options.checkboxCol === false) {
    this.checkboxColumn = false;
   }
   if (options.compositeViewTemplateId) {
    this.template = "#" + options.compositeViewTemplateId;
   } else {
    throw new Error("You must pass in a compositeViewTemplateId via options.");
   }
   if (typeof options.collection.fetchMore !== "function") {
    throw new Error("The collection must have a fetchMore method");
   }
   if (!options.itemViewTemplateId) {
    throw new Error("You must pass in a itemViewTemplateId via options.");
   }
   if (options.collection.length === 0) {
    options.collection.once("add", function() {
     self.clearTable();
    });
   }
  },
  collectionEvents: {
   reset: "clearTable"
  },
  events: {
   "click th input[name=checkAll]": "checkAll",
   "click td input[name=checkOne]": "checkOne"
  },
  onShow: function() {
   this.$el.offsetParent().on("scroll", this.boundViewportEvent);
  },
  onClose: function() {
   var $window = $(window);
   $window.off("DOMContentLoaded", this.boundViewportEvent);
   $window.off("load", this.boundViewportEvent);
   $window.off("resize", this.boundViewportEvent);
   this.$el.offsetParent().off("scroll", this.boundViewportEvent);
  },
  clearTable: function() {
   this.$("tbody").html("");
  },
  check: function(lastChecked) {
   var checked = _.map(this.$("tbody input:checked"), function(checkbox) {
    return parseInt(checkbox.value, 10);
   });
   this.checked = checked;
   this.lastChecked = lastChecked;
   var data = {
    checked: checked
   };
   if (lastChecked) {
    data.lastChecked = lastChecked;
   }
   vent.trigger(this.options.checkEvent, data);
  },
  checkAll: function(e) {
   this.$("tbody input[name=checkOne]").prop("checked", e.currentTarget.checked);
   this.check();
  },
  checkOne: function(e) {
   $(e.currentTarget).prop("checked", e.currentTarget.checked);
   if (e.currentTarget.checked) {
    this.check(parseInt(e.currentTarget.value, 10));
   } else {
    this.check();
   }
  },
  appendHtml: function(collectionView, itemView) {
   var row = null;
   if (this.isLoadingState) {
    this.clearTable();
    this.isLoadingState = false;
   }
   if (this.isEmptyState) {
    this.clearTable();
    this.isEmptyState = false;
   }
   if (!this.collection.length) {
    if (this.collection.isFetching()) {
     row = new this.loadingView().render().el;
     this.isLoadingState = true;
    } else {
     row = new this.emptyView().render().el;
     this.$("table.data").addClass("no-results");
     this.isEmptyState = true;
    }
    collectionView.$("tbody").append(row);
    return false;
   }
   collectionView.$("tbody").append(itemView.el);
  },
  itemViewOptions: function() {
   var self = this;
   return {
    itemViewTemplateId: self.options.itemViewTemplateId
   };
  },
  itemView: backbone.Marionette.ItemView.extend({
   initialize: function(options) {
    var self = this;
    this.templateData = {};
    this.template = _.template($("#" + options.itemViewTemplateId).html());
    if (options.multiProps) {
     _.each(options.multiProps, function(multiProp, key) {
      var filteredColl = multiProp.filter(function(model) {
       if (_.indexOf(self.model.get(key), model.get("id")) > -1) {
        return true;
       }
      });
      self.templateData[key] = filteredColl;
     });
    }
   },
   tagName: "tr"
  }),
  emptyView: backbone.Marionette.ItemView.extend({
   tagName: "tr",
   template: _.template("<td colspan=\"6\"><span class=\"no-results-txt\">No results returned.</span></td>")
  }),
  loadingView: backbone.Marionette.ItemView.extend({
   tagName: "tr",
   template: _.template("<td colspan=\"6\" class=\"loading-table-row\"><div class=\"wait\"></div></td>")
  }),
  alignTableCols: function() {
   var self = this;
   var $thead = self.$el.find("#thead"),
       $theadRow = $thead.find("tr:first"),
       $tbody = self.$el.find("#tbody"),
       $tbodyRow = $tbody.find("tr:first");
   var fixedWidthsTotal = self.checkboxColumn ? $tbodyRow.find(".checkbox").width() : 0;
   _.each(self.options.fixedWidthCols, function(col) {
    fixedWidthsTotal += $tbodyRow.find("." + col).width();
   });
   var remainingWidthDivided = (self.$el.width() - fixedWidthsTotal) / self.options.variableWidthCols.length;
   _.each(self.options.variableWidthCols, function(col) {
    $tbodyRow.find("." + col + ", ." + col + ".wrap").width(remainingWidthDivided);
    $theadRow.find("." + col + ", ." + col + ".wrap").width($tbodyRow.find("." + col).width());
   });
  },
  onCompositeCollectionRendered: function() {
   _.bind(function() {
    vent.trigger(this.options.listLoadCompleteEvent);
    this.alignTableCols();
   }, this);
   $(window).resize(_.debounce(_.bind(this.alignTableCols, this), 100));
  },
  checkElement: function() {
   this.alignTableCols();
   this.checkElementInViewport();
  },
  getChecked: function() {
   return this.checked;
  }
 });
}
());
ADOBE.AM.Widget.Views.LoadingModal = (function(adobe, backbone, _, CUI) {
 "use strict";
 var loading_modal = null;
 if (arguments.length === 0) {
  adobe = ADOBE;
  backbone = Backbone;
 }
 return backbone.View.extend({
  initialize: function(args) {
   var options = {};
   options.type = "default";
   options.buttons = [];
   options.heading = "<div class=\"spinner large\"></div><div class=\"msg\">" + adobe.AM.MESSAGES.getMessage("loading").message + "</div>";
   options.element = "#loading_modal";
   if (args && args.options) {
    _.extend(options, args.options);
   }
   this.options = options;
   _.bindAll(this, "show", "hide");
  },
  show: function(args) {
   var options = _.extend(this.options, args);
   _.extend(options, args);
   loading_modal = new CUI.Modal(options);
  },
  hide: function() {
   if (loading_modal && typeof loading_modal.hide === "function") {
    loading_modal.hide();
   }
  },
  getElement: function() {
   return loading_modal.$element;
  }
 });
}
());
if (typeof ADOBE == "undefined") {
 var ADOBE = {};
}
if (typeof ADOBE.AM == "undefined") {
 ADOBE.AM = {};
}
ADOBE.AM.Widget.Views.DestinationsToolbar = Backbone.View.extend({
 initialize: function(args) {
  _.bindAll(this, 'render');
  _.extend(this, args);
 }
});
ADOBE.AM.Segment.dialogs = {};
ADOBE.AM.Segment.Views = {};
ADOBE.AM.Segment.Views.SegmentPage = Backbone.View.extend({
 renderSubViews: function() {
  _.each(this.sub_views, function(view) {
   view.render();
  });
 },
 lazy_load_views: null,
 isRendered: false,
 hasBeenRendered: function() {
  return this.isRendered;
 },
 initialize: function(args) {
  _.bindAll(this, 'render');
  _.bindAll(this, 'renderSubViews');
  _.bindAll(this, 'hasBeenRendered');
  _.bindAll(this, 'isVisible');
  this.isRendered = false;
  this.sub_views = args.sub_views;
  this.lazy_load_views = args.lazy_load_views;
  if (args.view_functions) {
   _.extend(this, args.view_functions);
   _.each(_.keys(args.view_functions), function(func) {
    _.bindAll(this, func);
   }, this);
  }
  if (args.events) {
   this.events = args.events;
  }
  if (typeof args.customInit == 'function') {
   args.customInit.call(this);
  }
 },
 isVisible: function() {
  return this.$el.is("visible");
 },
 show: function() {
  this.$el.removeClass("noshow");
 },
 hide: function() {
  this.$el.addClass("noshow");
 },
 render: function() {
  this.renderSubViews();
  this.isRendered = true;
 }
});
ADOBE.AM.Segment.Views.Widget = Backbone.View.extend({
 render: function() {
  $(this.el).html(this.model.get("name"));
 },
 initialize: function(options) {
  var that = this;
  _.bindAll(this, "render");
  this.model.on("change:name", function() {
   that.render();
  });
 }
});
ADOBE.AM.Segment.Views.TempWidget = Backbone.View.extend({
 render: function() {
  $(this.el).html(this.template);
 },
 initialize: function(options) {
  _.bindAll(this, "render");
  this.template = options.template;
 }
});
ADOBE.AM.Segment.Views.BasicInfo = Backbone.View.extend({
 render: function() {
  var folderModel = this.model.get("folderModel") || {
           get: function() {
            return '';
           }
          },
      dataSourceModel = this.model.get("dataSourceModel") || {
           get: function() {
            return '';
           }
          };
  var data = this.model.toJSON();
  _.extend(data, {
   sid: data.sid || '',
   legacyId: data.legacyId || '',
   path: (folderModel.get("path") || ''),
   integrationCode: data.integrationCode || '',
   dataSourceName: dataSourceModel.get("name")
  });
  var uniques = {};
  uniques.instantUniques7Day = isNaN(data.instantUniques7Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.instantUniques7Day);
  uniques.instantUniques30Day = isNaN(data.instantUniques30Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.instantUniques30Day);
  uniques.instantUniques60Day = isNaN(data.instantUniques60Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.instantUniques60Day);
  uniques.totalUniques7Day = isNaN(data.totalUniques7Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.totalUniques7Day);
  uniques.totalUniques30Day = isNaN(data.totalUniques30Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.totalUniques30Day);
  uniques.totalUniques60Day = isNaN(data.totalUniques60Day) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(data.totalUniques60Day);
  _.extend(data, uniques);
  $(this.el).html(_.template(this.template, data));
 },
 initialize: function(options) {
  var that = this;
  _.bindAll(this, "render");
  this.template = options.template;
  this.model.on("change:folderId", function() {
   this.getDataSource();
   this.on("change:dataSourceModel", function() {
    that.render();
   });
   this.getFolder();
   this.on("change:folderModel", function() {
    that.render();
   });
  });
 }
});
ADOBE.AM.Segment.Views.NewBasicInfo = Backbone.View.extend({
 render: function() {
  var that = this,
      getMultiple = true;
  this.model.getDataSource(getMultiple);
  this.model.on("change:dataSourceModel", function() {
   var folderModel = this.get("folderModel") || {
            get: function() {
             return '';
            }
           },
       dataSourceModel = this.get("dataSourceModel") || {
            get: function() {
             return '';
            }
           };
   $(that.el).html(_.template(that.template, _.extend(_.extend(this.toJSON(), {
    path: (folderModel.get("path") || ''),
    integrationCode: that.model
        .get('integrationCode') || ''
   }), {
    dataSourceName: dataSourceModel.get("name")
   })));
  });
 },
 initialize: function(options) {
  _.bindAll(this, "render");
  this.template = options.template;
 }
});
ADOBE.AM.Segment.Views.ClonedBasicInfo = Backbone.View.extend({
 render: function() {
  var that = this,
      folderModel = this.model.get("folderModel") || {
           get: function() {
            return '';
           }
          },
      dataSourceModel = this.model.get("dataSourceModel") || {
           get: function() {
            return '';
           }
          };
  $(this.el).html(_.template(that.template, _.extend(_.extend(that.model.toJSON(), {
   path: (folderModel.get("path") || ''),
   integrationCode: that.model.get('integrationCode') || ''
  }), {
   dataSourceName: dataSourceModel.get("name")
  })));
 },
 initialize: function(options) {
  _.bindAll(this, "render");
  this.template = options.template;
 }
});
ADOBE.AM.Segment.Views.EditBasicInfo = Backbone.View.extend({
 render: function(el) {
  var that = this,
      folderModel = this.model.get("folderModel") || {
           get: function() {
            return '';
           }
          },
      dataSourceModel = this.model.get("dataSourceModel") || {
           get: function() {
            return '';
           }
          };
  var the_sid = this.model.get('sid') || "-";
  var the_csegid = this.model.get('legacyId') || "-";
  var the_description = this.model.get('description') || "";
  var integrationCode = this.model.get('integrationCode') || "";
  var data = {
   the_sid: the_sid,
   the_csegid: the_csegid,
   the_description: the_description,
   integrationCode: integrationCode
  };
  if (el) {
   this.el = el;
  }
  var extended_model = _.extend(data, that.model.toJSON(), {
   path: folderModel.get("path"),
   dataSourceName: dataSourceModel.get("name")
  });
  if (typeof this.el == "undefined") {
   throw new FatalDisplayError("this.el", "this.el must contain an jQuery object for rendering");
  }
  if (typeof el == "undefined") {
   this.$el.html($(_.template(that.template, extended_model)));
   this.renderDataSources();
  } else {
   if (!this.isRendered) {
    var $element = $(_.template(that.template, extended_model));
    $(this.el).append($element);
    this.el = $element.get();
    this.$el = $element;
   }
  }
  this.isRendered = true;
 },
 isRendered: false,
 renderDataSources: function() {
  var that = this,
      template = this.template_collection,
      $td_element = $(this.el).find('.segment_datasources'),
      model_datasource_id = this.model.getDataSourceModelProp('dataSourceId'),
      html_string = "",
      datasources = null;
  if (APP.routers.AppRouter.isEditPage()) {
   datasources = _.filter(this.collection.getFirstParty(ADOBE.AM.pid), function(ds) {
    return APP.gateKeeper.checkPermissions([APP.User.permissions, ds.relational.permissions], 'can_use_dataprovider_to_edit_segment');
   });
  } else {
   datasources = _.filter(this.collection.getFirstParty(ADOBE.AM.pid), function(ds) {
    return APP.gateKeeper.checkPermissions([ds.relational.permissions], 'can_use_dataprovider_to_create_segment');
   });
  }
  html_string = _.template(template, {
   datasources: datasources,
   model_dataProviderId: model_datasource_id
  });
  $td_element.html(html_string);
 },
 initialize: function(options) {
  _.extend(this, options);
  _.bindAll(this, "render");
  _.bindAll(this, "renderDataSources");
  this.collection.on('reset', this.renderDataSources);
 }
});
ADOBE.AM.Segment.Views.Graph = Backbone.View.extend({
 render: function() {
  $(this.el).html(this.template);
  this.renderGraph();
 },
 initialize: function(options) {
  _.bindAll(this, "render");
  this.template = options.template;
  this.renderGraph = options.renderGraph;
 }
});
ADOBE.AM.Segment.Views.FolderTree = Backbone.View.extend({
 tagName: "div",
 $hoveredElement: null,
 isRendered: false,
 className: "segmentFolderTree",
 render: function(element) {
  if (this.isRendered) {
   return;
  }
  if (element) {
   $(element).append($(this.el));
  } else {
   $(this.parentElement).append($(this.el));
  }
  this.isRendered = true;
  this.addFolderWidget();
  this.loadFolders();
 },
 switchTree: function() {
  ADOBE.AM.Segment.Views.FolderTree.currentTree = this;
 },
 addFolderWidget: function() {
  ADOBE.AM.Segment.Views.FolderTree.currentTree = this;
  var segmentTree = null,
      that = this,
      folderEditHTML = "";
  this.segmentFolderTree = new ADOBE.AM.hierarchy_tree();
  segmentTree = this.segmentFolderTree;
  segmentTree.treeElement = this.el;
  segmentTree.initially_open = this.tree_options.initially_open;
  segmentTree.initially_select = this.tree_options.initially_select;
  segmentTree.showCheckboxes = false;
  segmentTree.folderThemeSrc = "/css/aam/style.css";
  segmentTree.folderSrc = this.tree_options.folderSrc;
  segmentTree.inc3rdParty = this.tree_options.inc3rdParty;
  segmentTree.foldersOnly = this.tree_options.foldersOnly;
  segmentTree.formatData = this.tree_options.formatData;
  ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentTree = segmentTree;
  if ($('#addSubFolderDialog, #renameFolderDialog, #deleteFolderDialog').length == 0) {
   folderEditHTML = '<div class="dialog" style="display:none;" id="addSubFolderDialog" title="Add Folder">';
   folderEditHTML += '<ul class="formFields">';
   folderEditHTML += '<li>Folder Name: <input type="text" id="subFolderName" size="20" /></li>';
   folderEditHTML += '</ul>';
   folderEditHTML += '<div class="buttons"><button class="primary save" >Save</button>  <button class="secondary cancel">Cancel</button></div>';
   folderEditHTML += '</div>';
   folderEditHTML += '<div class="dialog" style="display:none;" id="renameFolderDialog" title="Rename Folder">';
   folderEditHTML += '<ul class="formFields">';
   folderEditHTML += '<li>Folder Name: <input type="text" id="renameFolderName" size="20" /></li>';
   folderEditHTML += '<li>Folder ID: <span class="folderId"></span></li>';
   folderEditHTML += '</ul>';
   folderEditHTML += '<div class="buttons"><button class="primary save" >Save</button>  <button class="secondary cancel">Cancel</button></div>';
   folderEditHTML += '</div>';
   folderEditHTML += '<div class="dialog" style="display:none;" id="deleteFolderDialog" title="Delete Folder">';
   folderEditHTML += 'Are you sure you want to delete this folder?';
   folderEditHTML += '<div><span class="folderName"></span> (<span class="folderId"></span>)</div>';
   folderEditHTML += '<div class="buttons"><button class="primary delete" >Delete</button>  <button class="secondary cancel">Cancel</button></div>';
   folderEditHTML += '</div>';
   $("body").append(folderEditHTML);
   ADOBE.AM.Segment.dialogs.addSubFolderDialog = $("#addSubFolderDialog").dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     $("#addSubFolderDialog .cancel").click(function() {
      ADOBE.AM.Segment.dialogs.addSubFolderDialog.dialog('close');
     });
     $("#addSubFolderDialog .save").click(function() {
      ADOBE.AM.Segment.dialogs.addSubFolderDialog.dialog('close');
      var currentSegmentTree = ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentTree,
          parentFolderID = parseInt(ADOBE.AM.Segment.Views.FolderTree.currentTree.$hoveredElement.parent().attr("id"), 10),
          newFolder = {};
      newFolder.pid = ADOBE.AM.pid;
      newFolder.parentFolderId = parentFolderID;
      newFolder.name = $.trim($("#subFolderName").val());
      newFolder.description = $("#subFolderDesc").val();
      $("#subFolderName").val("");
      $("#subFolderDesc").val("");
      $.ajax({
       url: ADOBE.AM.API.FOLDERS.folders.url('segments'),
       type: "POST",
       dataType: "json",
       contentType: "application/json",
       data: JSON.stringify(newFolder),
       success: function(data) {
        var selectedFolder = "#" + $(currentSegmentTree.treeElement).jstree("get_selected").attr("id");
        currentSegmentTree.initially_select = [selectedFolder];
        ADOBE.AM.Segment.Views.FolderTree.currentTree.loadFolders();
       },
       error: function(obj, textStatus, errorThrown) {
        var alertObj = {
         title: "Cannot save folder"
        };
        if (obj.status == 409) {
         alertObj.errorMsg = "Duplicate name.";
         alertObj.msg = "Change the name and try again.";
        } else {
         alertObj.errorMsg = "An error occured.";
         alertObj.msg = errorThrown;
        }
        ADOBE.AM.alertBox(alertObj);
       }
      });
     });
     $("#addSubFolderDialog input").keypress(function(event) {
      if (DEMDEX.UTILS.pressedEnter(event)) {
       $("#addSubFolderDialog .save").click();
      }
     });
    }
   });
   ADOBE.AM.Segment.dialogs.renameFolderDialog = $("#renameFolderDialog").dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     $("#renameFolderDialog .cancel").click(function() {
      ADOBE.AM.Segment.dialogs.renameFolderDialog.dialog('close');
     });
     $("#renameFolderDialog .save").click(function(e) {
      ADOBE.AM.Segment.dialogs.renameFolderDialog.dialog('close');
      var currentSegmentTree = ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentTree,
          folderId = parseInt(ADOBE.AM.Segment.Views.FolderTree.currentTree.$hoveredElement.parent().attr("id"), 10),
          newName = $.trim($("#renameFolderName").val()),
          getURL = ADOBE.AM.API.FOLDERS.folder.url('segments', folderId);
      $("#renameFolderName").val("");
      $.getJSON(getURL, function(folderObj) {
       folderObj.name = newName;
       $.ajax({
        url: ADOBE.AM.API.FOLDERS.folder.url('segments', folderId),
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(folderObj),
        success: function() {
         var selectedFolder = "#" + $(currentSegmentTree.treeElement).jstree("get_selected").attr("id");
         currentSegmentTree.initially_select = [selectedFolder];
         ADOBE.AM.Segment.Views.FolderTree.currentTree.loadFolders();
        },
        error: function(obj, textStatus, errorThrown) {
         var alertObj = {
          title: "Cannot save folder"
         };
         if (obj.status == 409) {
          alertObj.errorMsg = "Duplicate name.";
          alertObj.msg = "Change the name and try again.";
         } else {
          alertObj.errorMsg = "An error occured.";
          alertObj.msg = errorThrown;
         }
         ADOBE.AM.alertBox(alertObj);
        }
       });
      });
     });
     $("#renameFolderDialog input")
         .keypress(function(event) {
          if (DEMDEX.UTILS.pressedEnter(event)) {
           $("#renameFolderDialog .save").click();
          }
         });
    }
   });
   ADOBE.AM.Segment.dialogs.deleteFolderDialog = $("#deleteFolderDialog").dialog({
    autoOpen: false,
    modal: true,
    create: function() {
     $("#deleteFolderDialog .cancel").click(function() {
      ADOBE.AM.Segment.dialogs.deleteFolderDialog.dialog('close');
     });
     $("#deleteFolderDialog .delete").click(function() {
      ADOBE.AM.Segment.dialogs.deleteFolderDialog.dialog('close');
      var currentSegmentTree = ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentTree,
          folderId = parseInt(ADOBE.AM.Segment.Views.FolderTree.currentTree.$hoveredElement.parent().attr("id"), 10);
      $.ajax({
       url: ADOBE.AM.API.FOLDERS.folder.url('segments', folderId),
       type: "DELETE",
       dataType: "json",
       success: function() {
        var currentFolderTree = ADOBE.AM.Segment.Views.FolderTree.currentTree;
        var parentFolder = "#" + $("#" + currentFolderTree.makeJSTreeId(folderId)).parents("li").eq(0).attr("id");
        currentSegmentTree.initially_open = ['#0_editpage_folder', parentFolder];
        currentSegmentTree.initially_select = [parentFolder];
        ADOBE.AM.Segment.Views.FolderTree.currentTree.loadFolders();
       },
       error: function(obj, textStatus, errorThrown) {
        var alertObj = {
         title: "Delete Folder"
        };
        if (obj.status == 409) {
         alertObj.errorMsg = "Cannot delete.";
         alertObj.msg = "You cannot delete this folder.  It contains segments or another folder.  Move or delete the contents first.";
        } else {
         alertObj.errorMsg = "An error occured.";
         alertObj.msg = errorThrown;
        }
        ADOBE.AM.alertBox(alertObj);
       }
      });
     });
    }
   });
  }
 },
 loadFolders: function(args) {
  var segmentTree = this.segmentFolderTree,
      loadedTree = ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentFolderTree.loadTree(),
      that = this,
      args = args || {},
      broadcast = args.broadcast || false;
  $(ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentFolderTree.treeElement).html("");
  loadedTree.bind("loaded.jstree", function(event, data) {
   Mediator.broadcast("TreeLoaded", {
    tree: that.$el
   });
  });
  loadedTree.bind("hover_node.jstree", function(event, data) {
   var editHtml = "<span class='add btnIcon' title='Add a folder'></span>";
   editHtml += "<span class='edit btnIcon' title='Rename this folder'></span>";
   editHtml += "<span class='delete btnIcon' title='Delete this folder'></span>";
   var $element = $(data.args[0]);
   if ($element.prop("nodeName") != "A") {
    return;
   }
   ADOBE.AM.Segment.Views.FolderTree.currentTree.$hoveredElement = $element;
   if ($element.find('span').length) {
    return;
   }
   $element.append(editHtml).find("span").on("click", function(e) {
    if ($(e.target).hasClass("add")) {
     ADOBE.AM.Segment.dialogs.addSubFolderDialog.dialog('open');
    } else if ($(e.target).hasClass("edit")) {
     $("#renameFolderName").val($.trim($(e.target).parent().text()));
     ADOBE.AM.Segment.dialogs.renameFolderDialog.find('.folderId').text(parseInt($(e.target).closest('li[id]').attr('id'), 10));
     ADOBE.AM.Segment.dialogs.renameFolderDialog.dialog('open');
    } else if ($(e.target).hasClass("delete")) {
     $("#deleteFolderDialog .folderName")
         .text($(e.target).parent().text());
     ADOBE.AM.Segment.dialogs.deleteFolderDialog.find('.folderId').text(parseInt($(e.target).closest('li[id]').attr('id'), 10));
     ADOBE.AM.Segment.dialogs.deleteFolderDialog.dialog('open');
    }
    $(".ui-dialog:visible").addClass("fixed-pos");
   });
  });
  loadedTree.bind("select_node.jstree", function(event, data) {
   var folderNode = $(ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentFolderTree.treeElement).jstree("get_selected").attr("id");
   var folderId = parseInt(folderNode, 10);
   that.hook_select_node({
    folderNode: folderNode,
    folderId: folderId
   });
  });
 },
 hook_select_node: function(args) {},
 makeJSTreeId: function(id) {},
 selectNode: function(id) {
  var tree_specific_id = id;
  if (!isNaN(id)) {
   tree_specific_id = "#" + this.makeJSTreeId(id);
  }
  var $selected_id = "#" + this.getSelectedNode().attr("id");
  if ($selected_id != tree_specific_id) {
   this.clearFolders();
   this.closeAllNodes();
   this.$el.jstree('select_node', tree_specific_id);
  }
 },
 closeAllNodes: function() {
  $(this.el).find('li.jstree-open').removeClass("open").addClass("jstree-closed");
 },
 clearFolders: function() {
  var segmentTree = this.segmentFolderTree;
  $(ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentFolderTree.treeElement).jstree("get_selected").find("a.selectedNode").removeClass("selectedNode");
 },
 getSelectedNode: function() {
  return $(ADOBE.AM.Segment.Views.FolderTree.currentTree.segmentFolderTree.treeElement).jstree("get_selected");
 },
 initialize: function(args) {
  _.bindAll(this, "render");
  _.bindAll(this, "addFolderWidget");
  _.bindAll(this, "loadFolders");
  _.bindAll(this, "selectNode");
  _.bindAll(this, "getSelectedNode");
  _.bindAll(this, "closeAllNodes");
  _.bindAll(this, "clearFolders");
  _.extend(this, args);
 }
});
ADOBE.AM.Segment.Views.SegmentFolderTree = ADOBE.AM.Segment.Views.FolderTree.extend({});
ADOBE.AM.Segment.Views.SegmentTableRowView = Backbone.View.extend({
 tagName: 'tr',
 template: _.template(APP.templates.makeTemplate('segment_result_item', {
  "%%IMG_PLAY_STANDARD%%": APP.state.vars.images.play_standard,
  "%%IMG_CLONE_STANDARD%%": APP.state.vars.images.clone_standard
 })),
 events: {
  "click .result_checkbox": "checkbox",
  "click .edit": "edit",
  "click .play": "play",
  "click .clone": "clone",
  "click .pause": "pause",
  "click .delete": "delete"
 },
 checkbox: function(event) {
  var check_status = !this.model.get('checked');
  this.model.set({
   checked: check_status
  });
  if (check_status) {
   APP.views.SegmentTable.checkedRows.push(this.model.get("sid"));
  } else {
   var index_to_remove = $.inArray(this.model.get("sid"), APP.views.SegmentTable.checkedRows);
   APP.views.SegmentTable.checkedRows.splice(index_to_remove, 1);
  }
 },
 edit: function() {
  Mediator.broadcast("NavigationRequestReceived", {
   request: "segmentEdit",
   args: {
    sid: this.model.get("sid")
   }
  });
 },
 play: function() {
  var that = this,
      alertObj = {
       title: "Play Segment"
      };
  if (this.model.set({
       status: this.model.getActiveStatus()
      })) {
   this.model.save().fail(function(obj, textStatus, errorThrown) {
    var alertObj = {
     title: "Play Segment"
    };
    var response = JSON
        .parse(obj.responseText);
    var message = response && response.message ? response.message : errorThrown;
    alertObj.errorMsg = message;
    alertObj.msg = "Sorry, an error occured when trying to change status for segment: " + that.model.get('name') + "<br /><br />Please try again.";
    ADOBE.AM.alertBox(alertObj);
   });
  } else {
   alertObj.errorMsg = this.model.errors.join("<br />");
   alertObj.msg = "Sorry, an error occured when trying to change status for segment: " + this.model.get('name') + "<br /><br />Please try again.";
   ADOBE.AM.alertBox(alertObj);
  }
 },
 pause: function() {
  var that = this,
      alertObj = {
       title: "Pause Segment"
      };
  if (this.model.set({
       status: this.model.getInactiveStatus()
      })) {
   this.model.save().fail(function(obj, textStatus, errorThrown) {
    var alertObj = {
     title: "Pause Segment"
    };
    var response = JSON
        .parse(obj.responseText);
    var message = response && response.message ? response.message : errorThrown;
    alertObj.errorMsg = message;
    alertObj.msg = "Sorry, an error occured when trying to change status for segment: " + that.model.get('name') + "<br /><br />Please try again.";;
    ADOBE.AM.alertBox(alertObj);
   });
  } else {
   alertObj.errorMsg = this.model.errors.join("<br />");
   alertObj.msg = "Sorry, an error occured when trying to change status for segment: " + this.model.get('name') + "<br /><br />Please try again.";
   ADOBE.AM.alertBox(alertObj);
  }
 },
 clone: function() {
  var can_clone = false;
  var self = this;

  function cloneFail() {
   var alertObj = {
    errorMsg: ADOBE.AM.MESSAGES.getMessage('segment_cannot_clone').message
   };
   ADOBE.AM.alertBox(alertObj);
  }
  Mediator.broadcast("BlockUIRequested");
  this.model.fetch()
      .done(function() {
       if (self.model.canViewAllTraits()) {
        if (APP.gateKeeper.checkPermissions([APP.User.permissions], 'can_map_trait_to_segment_in_segmentbuilder')) {
         can_clone = true;
        } else {
         can_clone = self.model.canMapAllTraits();
        }
       }
       if (can_clone) {
        Mediator.broadcast("NavigationRequestReceived", {
         request: "segment_clone",
         args: {
          sid: self.model.get("sid")
         }
        });
       } else {
        cloneFail();
       }
      })
      .fail(cloneFail)
      .always(function() {
       Mediator.broadcast("UnblockUIRequested");
      });
 },
 'delete': function() {
  var that = this,
      div = document.createElement('div'),
      okButton = document
          .createElement('button'),
      cancelButton = document
          .createElement('button');
  okButton.className = 'primary';
  okButton.innerHTML = 'OK';
  cancelButton.innerHTML = 'Cancel';
  div.appendChild(okButton);
  div.appendChild(cancelButton);
  var modal = new AUI.Dialog({
   header: 'Confirmation',
   content: '<p>Are you sure you want to delete this segment?</p>',
   width: '300px',
   height: '200px',
   footer: div,
   center: true
  }).render();
  AUI.addListener(okButton, 'click', function() {
   that.model.destroy({
    wait: true,
    error: function(obj, textStatus, err) {
     var errorReturned = JSON.parse(textStatus.responseText),
         errorMsgObj = ADOBE.AM.MESSAGES.getMessage(errorReturned.code),
         alertObj = {
          title: errorMsgObj.title,
          errorMsg: errorReturned.message
         };
     ADOBE.AM.alertBox(alertObj);
    }
   });
   modal.hide();
  }, modal);
  AUI.addListener(cancelButton, 'click', modal.hide, modal);
  modal.show();
 },
 render: function() {
  var self = this;
  this.$el.attr("id", "segment_row_" + this.model.get("sid"));
  this.$el.html(this.template(_.extend(this.model.toJSON(), {
   permissions: {
    edit: (function() {
     var edit_perms = APP.User.has_edit_permissions = false;
     if (APP.gateKeeper.checkPermissions([APP.User.permissions, self.model.relational.permissions], 'can_edit_segment_in_segmentbuilder')) {
      edit_perms = true;
     }
     APP.gateKeeper.clearAll();
     return edit_perms;
    })(),
    clone: (function() {
     var clone_perms = false;
     if (APP.gateKeeper.checkPermissions([APP.User.permissions, self.model.relational.permissions], 'can_clone_segment_in_segmentbuilder')) {
      clone_perms = true;
     }
     APP.gateKeeper.clearAll();
     return clone_perms;
    })(),
    _delete: (function() {
     var delete_perms = APP.User.has_delete_permissions = false;
     if (APP.gateKeeper.checkPermissions([APP.User.permissions, self.model.relational.permissions], 'can_delete_segment_in_segmentbuilder')) {
      delete_perms = true;
     }
     APP.gateKeeper.clearAll();
     return delete_perms;
    })()
   }
  })));
  var canMapToDestinations = APP.gateKeeper.checkPermissions([APP.User.permissions, self.model.relational.permissions], 'can_map_segment_to_destination_in_segmentbuilder');
  self.model.set({
   isDestinationMappable: canMapToDestinations
  });
  if (canMapToDestinations) {
   APP.User.has_map_to_destination_permissions = canMapToDestinations;
  }
  APP.gateKeeper.clearAll();
  return this;
 },
 initialize: function() {
  _.bindAll(this, 'checkbox');
  this.model.bind('change', this.render, this);
  this.model.bind('destroy', this.remove, this);
 }
});
ADOBE.AM.Segment.Views.PaginatedTable = Backbone.View.extend({
 el: '#segment_table',
 events: {
  "click thead th.sortable": "tableColumnHeaderClick",
  "click thead th.column_checkbox": "tableColumnCheckboxClick"
 },
 tableColumnCheckboxClick: function(event) {
  var $element = $(event.currentTarget),
      checkbox_enabled = $element
              .hasClass("enabled") || false;
  if (checkbox_enabled) {
   $element.removeClass("enabled").addClass("disabled");
   this.collection.each(function(model) {
    if (model.get('checked')) {
     model.set({
      checked: false
     });
     var index_to_remove = $.inArray(model.get("sid"), APP.views.SegmentTable.checkedRows);
     APP.views.SegmentTable.checkedRows.splice(index_to_remove, 1);
    }
   });
  } else {
   $element.removeClass("disabled").addClass("enabled");
   this.collection.each(function(model) {
    if (!model.get('checked')) {
     model.set({
      checked: true
     });
     APP.views.SegmentTable.checkedRows.push(model.get("sid"));
    }
   });
  }
 },
 tableColumnHeaderClick: function(event) {
  var order = null,
      $element = $(event.currentTarget),
      type = $element
          .data("type");
  if ($element.hasClass("desc")) {
   order = true;
   this.$table_col_headers.removeClass("desc asc");
   $element.addClass("asc");
  } else {
   order = false;
   this.$table_col_headers.removeClass("desc asc");
   $element.addClass("desc");
  }
  this.collection.resetPagination();
  this.collection.setParams({
   customParam1: order,
   sortField: type
  });
  this.collection.pager();
 },
 initialize: function(args) {
  var tags = this.collection;
  _.bindAll(this, 'addOne');
  _.bindAll(this, 'addAll');
  _.bindAll(this, 'remove');
  _.extend(this, args);
  this.$table_col_headers = this.$el.find("th");
  this.$table_body = this.$el.find('tbody');
  tags.on('add', this.addOne, this);
  tags.on('reset', this.addAll, this);
  tags.on('all', this.render, this);
  tags.on('remove', this.remove, this);
  APP.gateKeeper.setCurrentScheme('can_edit_segment_in_segmentbuilder');
 },
 remove: function() {
  this.collection.resetPagination();
  this.collection.pager();
 },
 addAll: function() {
  this.$table_body.empty();
  this.collection.each(this.addOne);
 },
 addOne: function(item) {
  var view = new this.new_row({
   model: item
  });
  this.$table_body.append(view.render().el);
 }
});
ADOBE.AM.Segment.Routers = {};
ADOBE.AM.Segment.Routers.AppRouter = Backbone.Router.extend({
 current_route: null,
 routes: {
  "": "index",
  "list": "listPage",
  "list/folder/*path": "folderSelect",
  "new": "newPage",
  "new/traits/*sids": "newPageWithTrait",
  "clone/:sid": "clonePage",
  "view/:sid": "viewPage",
  "edit/:sid": "editPage",
  "delete": "deletePage"
 },
 index: function() {
  this.navigate("list", {
   trigger: true
  });
 },
 viewPage: function(sid) {
  ADOBE.AM.UTILS.HELPERS.switchPage('view');
  var view_page = this.views.view_page;
  if (!ADOBE.AM.UTILS.HELPERS.isNumeric(sid)) {
   ADOBE.AM.UTILS.LOGGER.log("viewtPage access with no sid!");
   Mediator.broadcast("FatalErrorEncountered");
   return false;
  }
  APP.models.ActiveSegment.resetModel();
  Mediator.setActiveComponent("APP.views.ViewPage");
  Mediator.broadcast("BlockUIRequested");
  Mediator.broadcast("ActiveSegmentRefreshRequested", {
   sid: sid,
   callback: function() {
    Mediator.broadcast("UnblockUIRequested");
   }
  });
  if (!view_page.isVisible()) {
   view_page.show();
  }
  if (!view_page.hasBeenRendered()) {
   view_page.render();
  } else {}
  this.views.list_page.hide();
  this.views.edit_page.hide();
  this.current_route = "view";
 },
 commonEditPage: function() {
  var edit_page = this.views.edit_page;
  edit_page.$el.removeClass("clone new");
  edit_page.setAccordionEnabled();
  if (!edit_page.isVisible()) {
   edit_page.show();
  }
  if (!edit_page.hasBeenRendered()) {
   edit_page.render();
  }
  this.views.list_page.hide();
  this.views.view_page.hide();
  edit_page.sub_views.basic_info_accordion.sub_views.folder_tree.switchTree();
  edit_page.sub_views.basic_info_accordion.sub_views.folder_tree.loadFolders();
  if (this.current_route == "new") {
   edit_page.$el.addClass("new");
  }
  this.current_route = "edit";
  edit_page.$el.addClass("edit");
 },
 newPageWithTrait: function(sids) {
  if (sids === "") {
   this.navigate("list", {
    trigger: true
   });
   return;
  }
  var sids_array = sids.split(",");
  var any_non_numeric_sids = _.some(sids_array, function(val) {
   return !ADOBE.AM.UTILS.HELPERS.isNumeric(val);
  });
  if (any_non_numeric_sids) {
   ADOBE.AM.UTILS.LOGGER.log("newPageWithTrait route found sids that were non numeric!");
   Mediator.broadcast("FatalErrorEncountered");
   return false;
  }
  this.newPage(sids_array);
 },
 newPage: function(sids_array) {
  Mediator.setActiveComponent("APP.views.EditPage");
  window.SegmentBuilderWidget.setType('edit');
  APP.models.ActiveSegment.resetModel();
  this.commonEditPage();
  this.views.edit_page.sub_views.basic_info_accordion.panel.set('enabled', true);
  this.views.edit_page.sub_views.basic_info_accordion.panel.set('expanded', true);
  this.views.edit_page.$el.find(".basic_info_accordion").remove();
  this.views.edit_page.sub_views.trait_accordion.panel.set('enabled', true);
  this.views.edit_page.$el.find(".trait_accordion").remove();
  this.views.edit_page.setAccordionDisabled('dest_accordion');
  this.views.edit_page.sub_views.dest_accordion.panel.set('expanded', false);
  this.current_route = "new";
  this.views.edit_page.$el.removeClass("edit");
  this.views.edit_page.$el.addClass("new");
  _.each(this.views.edit_page.sub_views.basic_info_accordion.sub_views, function(view) {
   view.render();
  });
  if (!APP.collections.EditPage.DataSources.length) {
   APP.collections.EditPage.DataSources.fetch({
    data: {
     firstPartyOnly: true
    }
   });
  }
  if (APP.views.EditPage.trait_tabs) {
   Mediator.broadcast("LoadSegmentBuilderWidget");
  } else {
   Mediator.broadcast("RenderTraitTabs");
  }
  if (sids_array && sids_array.length) {
   Mediator.broadcast("LoadSegmentBuilderWidgetWithTraits", {
    sids: sids_array
   });
  }
 },
 clonePage: function(sid) {
  var callbacks = null;
  if (APP.views.EditPage.trait_tabs) {
   callbacks = function() {
    Mediator.broadcast("LoadSegmentBuilderWidget");
   };
  } else {
   callbacks = function() {
    Mediator.broadcast("RenderTraitTabs");
   };
  }
  Mediator.setActiveComponent("APP.views.EditPage");
  window.SegmentBuilderWidget.setType('edit');
  if (!APP.models.ActiveSegment.get("id")) {
   Mediator.broadcast("ActiveSegmentRefreshRequested", (function(callbacks) {
    return {
     sid: sid,
     callback: function() {
      APP.models.ActiveSegment.unset('id');
      APP.models.ActiveSegment.unset('sid');
      APP.models.ActiveSegment.unset('legacyId');
      Mediator.broadcast("UnblockUIRequested");
      callbacks();
     }
    };
   }(callbacks)));
   callbacks = function() {};
  }
  this.commonEditPage();
  this.views.edit_page.setAccordionDisabled('dest_accordion');
  this.current_route = "clone";
  this.views.edit_page.$el.removeClass("edit");
  this.views.edit_page.$el.addClass("clone");
  APP.models.ActiveSegment.unset('id');
  APP.models.ActiveSegment.unset('sid');
  APP.models.ActiveSegment.unset('legacyId');
  _.each(this.views.edit_page.sub_views.basic_info_accordion.sub_views, function(view) {
   view.render();
  });
  APP.collections.EditPage.DataSources.fetch({
   data: {
    firstPartyOnly: true
   }
  });
  callbacks();
 },
 editPage: function(sid) {
  if (!ADOBE.AM.UTILS.HELPERS.isNumeric(sid)) {
   ADOBE.AM.UTILS.LOGGER.log("editPage access with no sid!");
   Mediator.broadcast("FatalErrorEncountered");
   return false;
  }
  APP.models.ActiveSegment.resetModel();
  Mediator.setActiveComponent("APP.views.EditPage");
  window.SegmentBuilderWidget.setType('edit');
  Mediator.broadcast("BlockUIRequested");
  Mediator.broadcast("ActiveSegmentRefreshRequested", {
   sid: sid,
   callback: function() {
    if (APP.views.EditPage.trait_tabs) {
     Mediator.broadcast("LoadSegmentBuilderWidget");
    } else {
     Mediator.broadcast("RenderTraitTabs");
    }
   }
  });
  this.commonEditPage();
 },
 listPage: function() {
  var list_page = this.views.list_page;
  Mediator.setActiveComponent("APP.views.ListPage");
  if (!list_page.isVisible()) {
   list_page.show();
  }
  if (!list_page.hasBeenRendered()) {
   list_page.render();
   if (!list_page.isVisible()) {
    list_page.show();
   }
  }
  list_page.sub_views.folder_tree.switchTree();
  list_page.sub_views.folder_tree.loadFolders();
  this.views.view_page.hide();
  this.views.edit_page.hide();
  this.current_route = "list";
 },
 deletePage: function() {
  var list_page = this.views.list_page;
  if (!list_page.isVisible()) {
   list_page.show();
  }
  if (!list_page.hasBeenRendered()) {
   list_page.render();
   if (!list_page.isVisible()) {
    list_page.show();
   }
  }
  this.views.view_page.hide();
  this.views.edit_page.hide();
 },
 isListPage: function() {
  return this.current_route == "list";
 },
 isClonePage: function() {
  return this.current_route == "clone";
 },
 isEditPage: function() {
  return this.current_route == "edit";
 },
 isNewPage: function() {
  return this.current_route == "new";
 },
 states: {
  determineState: function(prev_page, cur_page) {},
  listPage: function() {},
  listToEdit: function() {},
  listToView: function() {},
  editPage: function() {}
 },
 pageTransitions: function(prev_page, cur_page) {
  var state = this.states.determineState();
  state();
 },
 initialize: function(args) {
  _.bindAll(this, 'index');
  _.bindAll(this, 'viewPage');
  _.bindAll(this, 'newPage');
  _.bindAll(this, 'clonePage');
  _.bindAll(this, 'editPage');
  _.bindAll(this, 'listPage');
  this.views = args.pages;
 }
});
window.SegmentBuilderWidget = {
 permissions: {},
 setContainer: function(e) {
  this.$container = e;
 },
 code_view_only: false,
 type: null,
 setType: function(t) {
  this.type = t;
 },
 isEditType: function() {
  return this.type.toUpperCase() == "EDIT";
 },
 listenersAddedToEdit: false,
 listenersAddedToView: false,
 defaults: {
  rf: {
   frequency_val: "",
   frequency_ops: ">=",
   recency_val: "",
   recency_ops: "<="
  }
 },
 elements: {
  getOp: function() {
   var template = null,
       op_classes = null,
       op_wrapper_classes = null,
       compiled_html = null;
   template = APP.templates.segment_builder_widget.elements.op;
   op_classes = "or";
   op_wrapper_classes = "op off";
   compiled_html = _.template(template, {
    op_wrapper_class: op_wrapper_classes,
    op_class: op_classes,
    selected: false
   });
   return compiled_html;
  },
  getRuleWrapper: function(html, args) {
   var rf = null,
       result = null,
       compiled_html = null,
       template = APP.templates.segment_builder_widget.elements.rule_wrapper;
   if (args.rf) {
    rf = $(this.getEmptyRecencyFrequency());
   }
   if (typeof html == "object") {
    compiled_html = _.template(template, {
     content: ""
    });
    result = $(compiled_html);
    var content = result.find('.rule_content');
    content.append(html);
    if (rf != null) {
     content.append(rf);
    }
   } else {
    result = _.template(template, {
     content: html
    });
   }
   return result;
  },
  getEmptyRecencyFrequency: function() {
   var template = APP.templates.segment_builder_widget.elements.recency_frequency,
       html = "";
   try {
    html = _.template(template, _.extend(SegmentBuilderWidget.defaults.rf, {
     rf_class: "off"
    }));
   } catch (__err__) {
    ADOBE.AM.UTILS.LOGGER.log(__err__.message);
   }
   return html;
  },
  getRule: function(name, sid, uniques, rowspan) {
   var template = null,
       rowspan = rowspan,
       compiled_html = null;
   template = APP.templates.segment_builder_widget.elements.rule;
   compiled_html = _.template(template, {
    name: name,
    sid: sid,
    uniques: uniques,
    rowspan: rowspan
   });
   return compiled_html;
  },
  rf_div: {
   height: 28
  }
 },
 isRecencyFrequency: function($elem) {
  return $elem.hasClass("rf");
 },
 isOnlyRuleInGroup: function($elem) {
  var $prev = null;
  var next = null;
  $prev = $elem.prev();
  $next = $elem.next();
  if ((this.isActiveOperator($prev) || this.isRuleBorder($prev)) && (this.isRuleBorder($next) || this.isActiveOperator($next))) {
   return true;
  }
  return false;
 },
 isRule: function($elem) {
  return $elem.hasClass("traitRule");
 },
 isRuleWrapper: function($elem) {
  return $elem.hasClass("rule_wrapper");
 },
 isOperator: function($elem) {
  return $elem.hasClass("ruleOp");
 },
 isRuleBorder: function($elem) {
  return $elem.hasClass('ruleBorder');
 },
 isActiveOperator: function($elem) {
  return ($elem.hasClass("ruleOp") && $elem.hasClass("on"));
 },
 isOperatorText: function(text) {
  var text_upper = text.toUpperCase();
  return text_upper == "OR" || text_upper == "AND" || text_upper == "AND NOT";
 },
 hasSegmentExpressionChanged: function() {
  var entered_expression = $('#segment_expression').val();
  return entered_expression != this.segment_expression;
 },
 clearHTML: function() {
  if (SegmentBuilderWidget.$container) {
   SegmentBuilderWidget.$container.html("");
  }
 },
 clear: function() {
  if (SegmentBuilderWidget.$container) {
   SegmentBuilderWidget.$container.html("");
  }
  var seg_exp_tab = APP.views.EditPage.trait_tabs;
  if (seg_exp_tab && seg_exp_tab.tab_panels && seg_exp_tab.tab_panels[1]) {
   $(seg_exp_tab).find('#segment_expression').val("");
  }
 },
 hasRecencyFrequency: function($div) {
  var result = null;
  try {
   result = {
    freq_val: $div.find('span.frequency_val').text(),
    freq_op: $div.find('span.frequency_ops').text(),
    rec_val: $div.find('span.recency_val').text(),
    rec_op: $div.find('span.recency_ops').text()
   };
  } catch (___err___) {
   throw Error(___err___);
  }
  if (result.freq_op == this.defaults.rf.frequency_ops && result.freq_val == this.defaults.rf.frequency_val && result.rec_val == this.defaults.rf.recency_val && result.rec_op == this.defaults.rf.recency_ops) {
   return false;
  }
  return result;
 },
 resetRecencyFrequency: function(div) {
  var that = this,
      inputs = div.find('.rf_popup input, .rf_popup select');
  div.find('.rf_wrapper').removeClass("on").addClass("off");
  inputs.each(function() {
   var $this = $(this);
   $this.val(that.defaults.rf[$this.attr('class')]);
  });
 },
 sub_expressions: [],
 segment_expression: null,
 populate_ehss_numbers: function(data, type) {
  var timeWindow_css_mapping = {
   DAYS7: ".day_number_7",
   DAYS30: ".day_number_30",
   DAYS60: ".day_number_60"
  };
  var empty_response = {
   "audienceSizes": [{
    "timeWindow": "DAYS7",
    "confidenceInterval": {
     "high": 0,
     "low": 0
    },
    "size": SegmentBuilderWidget.SOLR.messages.no_result
   }, {
    "timeWindow": "DAYS30",
    "confidenceInterval": {
     "high": 0,
     "low": 0
    },
    "size": SegmentBuilderWidget.SOLR.messages.no_result
   }, {
    "timeWindow": "DAYS60",
    "confidenceInterval": {
     "high": 0,
     "low": 0
    },
    "size": SegmentBuilderWidget.SOLR.messages.no_result
   }]
  };

  function displayAudienceSize(result) {
   var sel = '#historic_segment_size ' + timeWindow_css_mapping[result.timeWindow];
   $(sel).fadeOut('fast', function() {
    var number = result.size;
    if (!isNaN(result.size)) {
     number = ADOBE.AM.UTILS.HELPERS.formatNumber(result.size);
    }
    $(this).html(number).fadeIn("slow");
   });
  }
  if (_.isEmpty(data)) {
   empty_response.audienceSizes.forEach(displayAudienceSize);
  } else {
   if (data.audienceSize) {
    displayAudienceSize(data.audienceSize);
   } else if (_.isArray(data.audienceSizes)) {
    data.audienceSizes.forEach(displayAudienceSize);
   }
  }
 },
 isExpressionSingleRule: function(exp) {
  var matches = exp.toUpperCase().match(/AND|OR/);

  if (matches == null) {
   return true;
  }
  return false;
 },
 doesExpressionHaveRecencyFrequency: function(exp) {
  var matches = exp.toUpperCase().match(/FREQUENCY/);

  if (matches == null) {
   return false;
  }
  return true;
 },
 SOLR: {
  messages: {
   not_available: "N/A",
   no_result: "-",
   loading: '<img src="/css/aam/images/16x16/Loading_Animated.gif" alt="-" />'
  },
  modal: null,
  empty_response: {
   "estimateSize": {
    "audienceSizes": [{
     "timeWindow": "DAYS7",
     "confidenceInterval": {
      "high": 0,
      "low": 0
     },
     "size": '<img src="/css/aam/images/16x16/Loading_Animated.gif" alt="-" />'
    }, {
     "timeWindow": "DAYS30",
     "confidenceInterval": {
      "high": 0,
      "low": 0
     },
     "size": '<img src="/css/aam/images/16x16/Loading_Animated.gif" alt="-" />'
    }, {
     "timeWindow": "DAYS60",
     "confidenceInterval": {
      "high": 0,
      "low": 0
     },
     "size": '<img src="/css/aam/images/16x16/Loading_Animated.gif" alt="-" />'
    }]
   },
   estimate30DaySize: {
    audienceSize: {
     "timeWindow": "DAYS30",
     "confidenceInterval": {
      "high": 0,
      "low": 0
     },
     "size": '<img src="/css/aam/images/16x16/Loading_Animated.gif" alt="-" />'
    }
   }
  },
  external_call_enabled: true,
  disableRequest: function() {
   this.external_call_enabled = false
  },
  enableRequest: function() {
   this.external_call_enabled = true;
  },
  solr_error: function(resp) {
   if (resp && resp.readyState === 0) {
    return false;
   }
   if (SegmentBuilderWidget.SOLR.modal == null) {
    var div = null,
        ok_button = null;
    div = document.createElement('div');
    ok_button = document.createElement('button');
    ok_button.innerHTML = "OK";
    div.appendChild(ok_button);
    SegmentBuilderWidget.SOLR.modal = new AUI.Dialog({
     header: 'Message',
     content: "<p>" + ADOBE.AM.MESSAGES.getMessage('solr_failure').message + "</p>",
     width: '300px',
     height: '170px',
     footer: div,
     center: true
    });
    SegmentBuilderWidget.SOLR.modal.render();
    AUI.addListener(ok_button, 'click', function() {
     SegmentBuilderWidget.SOLR.modal.hide();
    }, SegmentBuilderWidget.SOLR.modal);
   }
   if (typeof SegmentBuilderWidget.SOLR.modal.get == "function" && SegmentBuilderWidget.SOLR.modal.get('visible')) {
    return true;
   }
   SegmentBuilderWidget.SOLR.modal.show();
   return true;
  },
  errors: [],
  cache: {
   estimate30DaySize: {},
   estimateSize: {}
  },
  cacheResponse: function(data, type) {
   var cache = this.cache.estimateSize;
   if (typeof type != "undefined") {
    if (typeof this.cache[type] != "undefined") {
     cache = this.cache[type];
    } else {
     ADOBE.AM.UTILS.LOGGER.log("SOLR: cacheResponse: No cache for type: " + type);
     return;
    }
   }
   try {
    cache[data.expression] = data.response;
   } catch (__err__) {
    ADOBE.AM.UTILS.LOGGER.log("SOLR: cacheResponse: Could not cache response since it was not an expected format");
   }
  },
  getCachedResponse: function(exp, type) {
   var cache = this.cache.estimateSize;
   if (typeof type != "undefined") {
    if (typeof this.cache[type] != "undefined") {
     cache = this.cache[type];
    } else {
     ADOBE.AM.UTILS.LOGGER.log("SOLR: getCachedResponse: No cache for type: " + type);
     return;
    }
   }
   return cache[exp];
  },
  request: function(expression, sizeArguments) {
   var that = this;
   var $jqxhr = null;
   if (!this.external_call_enabled) {
    $jqxhr = $.Deferred();
    switch (sizeArguments) {
     case 'estimate30DaySize':
      $jqxhr.resolve(this.empty_response.estimate30DaySize);
      break;
     default:
      $jqxhr.resolve(this.empty_response.estimateSize);
    };
    return $jqxhr;
   }
   if (this.getCachedResponse(expression, sizeArguments)) {
    $jqxhr = $.Deferred();
    $jqxhr.resolve(this.getCachedResponse(expression, sizeArguments));
   } else {
    $jqxhr = $.ajax({
     url: ADOBE.AM.API.SOLR.url(sizeArguments),
     dataType: "json",
     contentType: "application/json",
     type: "post",
     data: JSON.stringify({
      rule: expression
     })
    })
        .done(function(data) {
         that.cacheResponse({
          expression: expression,
          response: data
         }, sizeArguments);
        })
        .fail(function(err) {
         that.errors = err;
        });
   }
   return $jqxhr;
  }
 },
 handleCompleteExpression: function() {
  var $jqxhr = null;
  if (!SegmentBuilderWidget.validSOLRSegmentExpression()) {
   $jqxhr = $.Deferred();
   $jqxhr.resolve(SegmentBuilderWidget.SOLR.getCachedResponse(SegmentBuilderWidget.segment_expression));
  } else {
   $jqxhr = SegmentBuilderWidget.SOLR.request(SegmentBuilderWidget.segment_expression);
  }
  return $jqxhr;
 },
 Expression: function(args) {
  var that = this;
  this.rule = null;
  this.request = null;
  this.size = null;
  this.element = args.element;
  this.expression = null;
  this.setExpression = function(ex, fire_to_solr) {
   that.expression = ex;
   if (!SegmentBuilderWidget.isExpressionSingleRule(that.expression) || SegmentBuilderWidget.doesExpressionHaveRecencyFrequency(that.expression)) {
    if (fire_to_solr) {
     that.element.html(SegmentBuilderWidget.SOLR.messages.loading);
     that.request = SegmentBuilderWidget.SOLR.request(that.expression, 'estimate30DaySize');
     that.request.fail(function(resp) {
      if (SegmentBuilderWidget.SOLR.solr_error(resp)) {
       that.element.fadeOut('fast', function() {
        that.element.html(SegmentBuilderWidget.SOLR.messages.not_available).fadeIn('fast');
       });
      }
     });
     that.request.done(function(data) {
      if (data.audienceSize && data.audienceSize.timeWindow == "DAYS30") {
       that.size = isNaN(data.audienceSize.size) ? data.audienceSize.size : ADOBE.AM.UTILS.HELPERS.formatNumber(data.audienceSize.size);
       that.element.fadeOut('fast', function() {
        that.element.html(that.size).fadeIn('fast');
       });
      }
     });
    } else {
     if (that.element.text() != SegmentBuilderWidget.SOLR.messages.not_available) {
      if (!SegmentBuilderWidget.SOLR.getCachedResponse(that.expression, 'estimate30DaySize')) {
       that.element.html(SegmentBuilderWidget.SOLR.messages.no_result);
      }
     }
    }
   } else {
    var uniques = that.element.parents('tr.traitRule').eq(0).find('td.days_30 span.day_number_30').text();
    if (uniques != that.element.text()) {
     that.element.fadeOut('fast', function() {
      $(this).text(uniques).fadeIn('fast');
     });
    }
   }
  };
 },
 expressionBuilder: function(fire_to_solr) {
  var expression = "",
      single_expr = "",
      that = this,
      $node = null,
      $tmp_nodes = null,
      rf_vaules = null,
      sids = [],
      $nodes = this.$container.children(':not(.ruleBorder)');
  if (typeof this.expressionBuilder.cache_$jqxhr == "undefined") {
   this.expressionBuilder.cache_$jqxhr = [];
  }
  if (this.expressionBuilder.cache_$jqxhr && this.expressionBuilder.cache_$jqxhr.length) {
   this.expressionBuilder.cache_$jqxhr.forEach(function($jqxhr) {
    if ($jqxhr.readyState && $jqxhr.readyState != 4) {
     $jqxhr.abort();
    }
   });
  }
  for (var i = 0, len = $nodes.length; i < len; i++) {
   $node = $nodes.eq(i);
   sids = [];
   if (this.isRule($node)) {
    if (this.isRecencyFrequency($node)) {
     $tmp_nodes = $node.nextUntil('.ruleOp.on, .ruleBorder');
     sids.push(that.formatSid($node.data('sid')));
     if (rf_values = this.hasRecencyFrequency($node)) {
      $tmp_nodes.each(function() {
       var $this = $(this);
       if (that.isRule($this)) {
        sids.push(that.formatSid($this.data('sid')));
       }
      });
      single_expr = this.formatRecencyFrequency(rf_values, sids);
     } else {
      $tmp_nodes.each(function() {
       var $this = $(this);
       if (that.isRule($this)) {
        sids.push(that.formatSid($this.data('sid')));
       }
      });
      single_expr = "(" + sids.join(" OR ") + ")";
     }
     var $solr_elem = $node.find('.solr_number');
     var Expression = new that.Expression({
      element: $solr_elem
     });
     Expression.setExpression(single_expr, fire_to_solr);
     if (Expression.request) {
      this.expressionBuilder.cache_$jqxhr.push(Expression.request);
     }
     $node.data({
      expression_obj: Expression
     });
     expression += single_expr;
     i += $tmp_nodes.length;
    } else {
     ADOBE.AM.UTILS.LOGGER
         .log("expression_builder: Saw a rule without recency/frequency.  We should never see these because we are setting loop counter to skip these");
    }
   } else if (this.isActiveOperator($node)) {
    expression += " " + $node.find('select').val() + " ";
   }
  }
  this.segment_expression = expression;
  return expression;
 },
 formatSid: function(sid) {
  return sid + "T";
 },
 formatRecencyFrequency: function(rf, sids) {
  var template = " frequency([%%SIDS%%]%%REC%%)%%FREQ%% ";
  var rec = " %%REC_OP%% %%REC_VAL%%D";
  var freq = " %%FREQ_OP%% %%FREQ_VAL%%";
  if (rf.rec_val) {
   rec = rec.replace("%%REC_VAL%%", rf.rec_val);
   rec = rec.replace("%%REC_OP%%", rf.rec_op);
   template = template.replace("%%REC%%", rec);
  } else {
   template = template.replace("%%REC%%", "");
  }
  if (rf.freq_val) {
   freq = freq.replace("%%FREQ_VAL%%", rf.freq_val);
   freq = freq.replace("%%FREQ_OP%%", rf.freq_op);
   template = template.replace("%%FREQ%%", freq);
  } else {
   template = template.replace("%%FREQ%%", "");
  }
  template = template.replace("%%SIDS%%", sids.join(","));
  return template;
 },
 handleExpressionChange: function() {
  var expression = this.expressionBuilder();
  $('#segment_expression').val(expression);
  $('#historic_segment_size .day_number_7, #historic_segment_size .day_number_30, #historic_segment_size .day_number_60').html(SegmentBuilderWidget.SOLR.messages.no_result);
 },
 calculateSOLRNumbers: function(args) {
  var expression = this.expressionBuilder(true),
      $tmp_jqxhr = null,
      $jqxhr = null,
      cb = args && args.cb ? args.cb : function() {},
      that = this;
  $('#segment_expression').val(expression);
  this.segment_expression = expression;
  if (this.handleExpressionChange.cached_$jqxhr) {
   $tmp_jqxhr = this.handleExpressionChange.cached_$jqxhr;
   if ($tmp_jqxhr.readyState && $tmp_jqxhr.readyState != 4) {
    $tmp_jqxhr.abort();
   }
  }
  $jqxhr = this.handleCompleteExpression();
  $jqxhr.always(cb);
  $('#historic_segment_size .day_number_7, #historic_segment_size .day_number_30, #historic_segment_size .day_number_60')
      .html(SegmentBuilderWidget.SOLR.messages.loading);
  $jqxhr.done(function(sizes) {
   that.populate_ehss_numbers(sizes);
  });
  $jqxhr.fail(function(resp) {
   if (SegmentBuilderWidget.SOLR.solr_error(resp)) {
    that.populate_ehss_numbers({
     "audienceSizes": [{
      "timeWindow": "DAYS7",
      "size": SegmentBuilderWidget.SOLR.messages.not_available
     }, {
      "timeWindow": "DAYS30",
      "size": SegmentBuilderWidget.SOLR.messages.not_available
     }, {
      "timeWindow": "DAYS60",
      "size": SegmentBuilderWidget.SOLR.messages.not_available
     }]
    });
   }
  });
  this.handleExpressionChange.cached_$jqxhr = $jqxhr;
 },
 validSOLRSegmentExpression: function() {
  if (ADOBE.AM.UTILS.HELPERS.isEmptyString(this.segment_expression)) {
   return false;
  }
  if (!this.doesExpressionHaveRecencyFrequency(this.segment_expression) && this.isExpressionSingleRule(this.segment_expression)) {
   return false;
  }
  return true;
 },
 addRule: function(args) {
  if (this.code_view_only) {
   return false;
  }
  var that = this;
  var name = args.name;
  var sid = args.sid;
  var uniques = args.uniques;
  var is_dpmtrait = args.is_dpmtrait;
  var is_algotrait = args.is_algotrait;
  var op_html = "";
  var rule_html = "";
  var $last_rule = this.$container.find('tr.traitRule:last');
  if ($last_rule.length) {
   rule_html = this.elements.getRule(name, sid, uniques);
   var $rule_with_rf = null;
   if (this.isRuleBorder($last_rule.prev())) {
    $rule_with_rf = $last_rule;
   } else {
    $rule_with_rf = $last_rule.prevAll('tr.traitRule.rf').eq(0);
   }
   if (!$rule_with_rf.length) {
    ADOBE.AM.UTILS.LOGGER
        .log("addRule: Could not find preceding rule with RF set!")
    return;
   }
   if (this.hasRecencyFrequency($rule_with_rf) && (is_dpmtrait || is_algotrait)) {
    var div = document.createElement('div');
    var ok_button = document.createElement('button');
    var cancel_button = document.createElement('button');
    var modal = null;
    ok_button.innerHTML = "Yes";
    cancel_button.innerHTML = "No";
    div.appendChild(ok_button);
    div.appendChild(cancel_button);
    modal = new AUI.Dialog({
     header: 'Message',
     content: "<p>" + ADOBE.AM.MESSAGES
         .getMessage('add_' + (is_dpmtrait ? 'dpm' : 'algo') + 'trait_to_recency_frequency').message + "</p>",
     width: '300px',
     height: '230px',
     footer: div,
     center: true
    }).render();
    AUI.addListener(ok_button, 'click', function() {
     op_html = _.template(APP.templates.segment_builder_widget.elements.op, {
      op_wrapper_class: "off",
      selected: false
     });
     $(op_html + rule_html).insertAfter($last_rule);
     that.adjustGroupRowspan($last_rule, 2);
     that.resetRecencyFrequency($rule_with_rf);
     that.handleExpressionChange();
     modal.hide();
    }, modal);
    AUI.addListener(cancel_button, 'click', modal.hide, modal);
    modal.show();
   } else {
    op_html = _.template(APP.templates.segment_builder_widget.elements.op, {
     op_wrapper_class: "off",
     selected: false
    });
    $(op_html + rule_html).insertAfter($last_rule);
    that.adjustGroupRowspan($last_rule, 2);
    that.handleExpressionChange();
   }
  } else {
   var data = {
    rowspan: 1
   };
   _.extend(data, this.defaults.rf);
   rf_html = _
       .template(APP.templates.segment_builder_widget.elements.rf_cell, data);
   data = {
    name: name,
    sid: sid,
    uniques: uniques,
    rowspan: 1,
    rf_html: rf_html
   };
   rule_html = _.template(APP.templates.segment_builder_widget.elements.rule, data);
   var entire_rule = _.template(APP.templates.rules_with_top_bottom, {
    html: rule_html
   });
   this.$container.append($(entire_rule));
   this.handleExpressionChange();
  }
 },
 addHTML: function(html) {
  var html_with_top_bottom = _.template(APP.templates.rules_with_top_bottom, {
   html: html
  });
  this.$container.html(html_with_top_bottom);
  if (!(this.listenersAddedToEdit && this.listenersAddedToView)) {
   this.addListeners();
  }
 },
 addListeners: function() {
  var that = this;
  if (this.isEditType() && this.listenersAddedToEdit === false) {
   this.$container.sortable({
    items: "tr.traitRule",
    handle: '.mover',
    start: function(event, ui) {
     var $elem = $(ui.item);
     $elem.data('previous_sibling', $elem.prev());
     $elem.data('next_sibling', $elem.next().next());
    },
    update: function(event, ui) {
     that.handleRuleDrop(event, ui);
     $(ui.item.eq(0)).removeClass("hovered");
    }
   })
       .on("change", "tr.ruleOp select", $.proxy(this.opChange, this))
       .on("click", ".actions img.delete_icon", $.proxy(this.deleteRule, this))
       .on("mouseenter", "tr.ruleOp td.middle", this.opShow)
       .on("hover", "tr.traitRule td:not(.rf_cell)", this.traitRuleHover)
       .on("click", "td.rf_cell > img", $.proxy(this.rfPopUp, this))
       .on("click", ".trait_name", this.displayTraitModal)
       .on("change", ".rf_popup input, .rf_popup select", $.proxy(this.handleRFChange, this))
       .on("click", ".rf_popup button.primary", $.proxy(this.resetRFValues, this));
   this.listenersAddedToEdit = true;
  } else if (this.listenersAddedToView === false) {
   this.listenersAddedToView = true;
   $('#SegmentView .ruleDisplay .content table')
       .on("click", ".trait_name", this.displayTraitModal)
       .on("click", "td.rf_cell.on img", $.proxy(this.rfPopUp, this));
  }
 },
 resetRFValues: function(event) {
  this.resetRecencyFrequency($(event.currentTarget).parents('tr'));
 },
 handleRFChange: function(event) {
  var $elem = $(event.currentTarget);
  $elem.next('span').text($elem.val());
 },
 displayTraitModal: function(event) {
  var sid = $(this).parents('.traitRule').data('sid');
  var modal = null;
  var trait = APP.cache.traits.getTrait(sid);
  if (!trait) {
   ADOBE.AM.UTILS.LOGGER.log("displayTraitModal: trait was empty!")
   return;
  }
  modal = new AUI.Dialog({
   header: trait.name,
   content: '<p>Loading...</p>',
   width: '580px',
   height: '400px',
   center: true
  }).render();
  window.modal = modal;
  modal.show();
  event.stopImmediatePropagation();
  var trait_model = new ADOBE.AM.Trait.Models.Trait(trait);
  var $jqxhr;
  if (!APP.collections.EditPage.DataSources.length) {
   $jqxhr = $.when(trait_model.fetch({
    data: {
     includeMetrics: true
    }
   }), APP.collections.EditPage.DataSources.fetch({
    data: {
     firstPartyOnly: true
    }
   }));
  } else {
   $jqxhr = $.when(trait_model.fetch({
    data: {
     includeMetrics: true
    }
   }));
  }
  var $deferreds = $jqxhr.pipe(function() {
   var $calls = [];
   $calls.push(trait_model.getFolder());
   if (trait_model.get("categoryId")) {
    $calls.push(trait_model.getCategory());
   }
   if (trait_model.get("type")) {
    $calls.push(trait_model.getType());
   }
   return $.when.apply(this, $calls);
  });
  $deferreds.done(function() {
   var datasource = "";
   var folder = "";
   var category = "";
   var type = "";
   var dataSourceId = trait_model.get("dataSourceId");
   var folderId = trait_model.get("folderId");
   var categoryId = trait_model.get("categoryId");
   var typeId = trait_model.get("type");
   var trait_name = trait_model.constructor.getTraitTypeName(trait_model.get("traitType"));
   if (folderId) {
    folder = trait_model.get("folderModel").get("name");
   }
   if (categoryId) {
    category = trait_model.get("categoryModel").get("name");
   }
   if (typeId) {
    type = trait_model.get("typeModel").get("name");
   }
   if (dataSourceId) {
    trait_model.set({
     dataSourceModel: APP.collections.EditPage.DataSources.get(dataSourceId)
    });
    var ds_model = trait_model.get("dataSourceModel");
    if (ds_model) {
     datasource = ds_model.get("name");
    }
   }
   var compiled_template = _.template(APP.templates.segment_builder_widget.trait_modal, {
    t: trait_model,
    category: category,
    type: trait_name,
    folder: folder,
    datasource: datasource
   });
   modal.set('content', compiled_template);
  });
 },
 rfPopUp: function(event) {
  var that = this;
  var $elem = $(event.currentTarget);
  if ($(event.target).closest('#dashboard2').length) {
   $(event.target).closest('tr.traitRule').each(function(idx, trait) {
    if (idx === 0) {
     var yCoord = $(this).find('td.rf_cell').height() / 2 - 3;
     $(trait).find('.rf_popup').css({
      top: -yCoord
     });
    }
   });
  }
  if (typeof this.rfPopUp.previousValues == "undefined") {
   this.rfPopUp.previousValues = {};
  }
  if (!$elem.is(":visible")) {
   return false;
  }
  var $group_with_rf = $elem.parents('tr.traitRule.rf').eq(0);
  var sids_in_group = this.getAllSIDsInGroup($group_with_rf);
  var hasDPMTraits = false,
      hasAlgoTraits = false,
      disallowedTraits = [];
  _.each(sids_in_group, function(sid) {
   var trait = APP.cache.traits.getTrait(sid);
   if (trait) {
    if (ADOBE.AM.UTILS.HELPERS.isDPMTrait(trait.traitType)) {
     hasDPMTraits = true;
     disallowedTraits.push(trait);
    }
    if (ADOBE.AM.UTILS.HELPERS.isAlgoTrait(trait.traitType)) {
     hasAlgoTraits = true;
     disallowedTraits.push(trait);
    }
   }
  });
  if (hasDPMTraits || hasAlgoTraits) {
   var message = "<p>" + (hasDPMTraits ? ADOBE.AM.MESSAGES.getMessage('cannot_add_recency_frequency_on_dpmtrait').message + '<br />' : '') + (hasAlgoTraits ? ADOBE.AM.MESSAGES.getMessage('cannot_add_recency_frequency_on_algotrait').message + '<br />' : '') + "</p>";
   var div = document.createElement('div');
   var okButton = document.createElement('button');
   var modal = null;
   message += "<p>";
   _.each(disallowedTraits, function(trait) {
    message += trait.sid + " : " + trait.name + '<br />\n';
   });
   message += "</p>";
   okButton.innerHTML = "OK";
   div.appendChild(okButton);
   modal = new AUI.Dialog({
    header: 'Message',
    content: message,
    width: '280px',
    height: '160px',
    footer: div,
    center: true
   }).render();
   AUI.addListener(okButton, 'click', modal.hide, modal);
   modal.show();
   return;
  }
  var isChanged = false;
  var isNotDefault = false;
  var isValid = true;
  var frequency = null;
  var recency = null;
  $elem.nextAll("div").find("select, input").each(function() {
   var $this = $(this);
   var classname = $this.attr("class");
   if (classname !== "" && classname in SegmentBuilderWidget.defaults.rf) {
    if ($this.val() != SegmentBuilderWidget.defaults.rf[classname]) {
     isNotDefault = true;
    }
    if (classname == "frequency_val") {
     frequency = parseInt($this.val(), 10);
    } else if (classname == "recency_val") {
     recency = parseInt($this.val(), 10);
    }
    if ($this.val() != that.rfPopUp.previousValues[classname]) {
     isChanged = true;
    }
    that.rfPopUp.previousValues[classname] = $this.val();
   }
  });
  if (isNaN(frequency) && ADOBE.AM.UTILS.HELPERS.isNumeric(recency)) {
   var message = "<p>" + ADOBE.AM.MESSAGES.getMessage('cannot_have_recency_wo_frequency').message + "</p>";
   var div = document.createElement('div');
   var okButton = document.createElement('button');
   var modal = null;
   okButton.innerHTML = "OK";
   div.appendChild(okButton);
   modal = new AUI.Dialog({
    header: 'Message',
    content: message,
    width: '280px',
    height: '120px',
    footer: div,
    center: true
   }).render();
   AUI.addListener(okButton, 'click', modal.hide, modal);
   modal.show();
   return false;
  }
  $elem.parent().toggleClass('clicked').removeClass("off on").addClass(isNotDefault ? "on" : "off")
  if (isChanged && !$elem.parent().hasClass("clicked")) {
   that.handleExpressionChange();
  }
  return false;
 },
 getAllSIDsInGroup: function($row) {
  var sids = [],
      that = this;
  sids.push($row.data('sid'));
  $row.nextUntil('.ruleOp.on, .ruleBorder').each(function() {
   if (that.isRule($(this))) {
    sids.push($(this).data('sid'));
   }
  });
  return sids;
 },
 traitRuleHover: function() {
  $(this).parent().toggleClass("hovered");
 },
 opChange: function(event) {
  var that = this,
      $elem = $(event.currentTarget),
      $tr = $elem
          .parents('tr.ruleOp');
  if ($elem.val() == "") {
   if ($elem.hasClass("show")) {
    $tr.removeClass("on show").addClass("off");
    return;
   }
   $tr.removeClass("on").addClass("off");
   this.combineRuleGroups($tr);
   return;
  }
  if ($tr.hasClass("on")) {
   that.handleExpressionChange();
   return;
  }
  $tr.removeClass("off show").addClass("on");
  this.splitRuleGroup($tr);
 },
 splitRuleGroup: function($tr) {
  var that = this,
      num_of_rules = 0,
      $next_tr = null,
      $prev_tr = null;
  $next_tr = $tr;
  while ($next_tr = $next_tr.next()) {
   if (!this.isValidTouchingRuleOrOp($next_tr)) {
    break;
   }
   num_of_rules++;
  }
  $next_tr = $tr.next();
  var data = {
   rowspan: num_of_rules
  };
  _.extend(data, SegmentBuilderWidget.defaults.rf);
  var rf_cell_html = _.template(APP.templates.segment_builder_widget.elements.rf_cell, data);
  $(rf_cell_html).insertAfter($next_tr.find('td.last'));
  $next_tr.addClass("rf");
  $prev_tr = $tr;
  num_of_rules = 0;
  while ($prev_tr = $prev_tr.prev()) {
   if (!this.isValidTouchingRuleOrOp($prev_tr)) {
    break;
   }
   num_of_rules++;
  }
  $prev_tr = $prev_tr.next();
  var $td_rf = null;
  if (this.isRecencyFrequency($tr)) {
   $td_rf = $tr.find('td.rf_cell');
  } else {
   $td_rf = $tr.prevAll('tr.rf').find('td.rf_cell').eq(0);
  }
  if ($td_rf.length) {
   $td_rf.attr({
    rowspan: num_of_rules
   });
   $td_rf.addClass("rf");
  } else {
   ADOBE.AM.UTILS.LOGGER
       .log("splitRuleGroup: Unable to find previous tr with rf_active class");
   return;
  }
  this.resetRecencyFrequency($td_rf.parent());
  $td_rf.removeClass("on").addClass("off");
  that.handleExpressionChange();
 },
 isValidTouchingRuleOrOp: function($tr) {
  return (($tr.hasClass('ruleOp') && $tr.hasClass('off')) || $tr
      .hasClass("traitRule"));
 },
 combineRuleGroups: function($tr) {
  var that = this,
      next_rowspan = 0,
      prev_rowspan = 0,
      $next_tr_rule = null,
      $next_rule_rf_cell = null,
      $prev_rule_rf_cell = null;
  $next_tr_rule = $tr.next('tr.traitRule').eq(0);
  $next_rule_rf_cell = $next_tr_rule.children('td.rf_cell');
  if (!$next_rule_rf_cell.length) {
   ADOBE.AM.UTILS.LOGGER.log("combineRuleGroups rf_cell not found!");
   return;
  }
  next_rowspan = parseInt($next_rule_rf_cell.attr('rowspan'), 10);
  $next_rule_rf_cell.remove();
  $next_tr_rule.removeClass("rf");
  if (this.isRecencyFrequency($tr)) {
   $prev_rule_rf_cell = $tr.children('td.rf_cell')
  } else {
   $prev_rule_rf_cell = $tr.prevAll('tr.traitRule.rf').eq(0).children('td.rf_cell')
  }
  if (!$prev_rule_rf_cell.length) {
   ADOBE.AM.UTILS.LOGGER
       .log("combineRuleGroups rf_cell not found in previous group!");
   return;
  }
  prev_rowspan = parseInt($prev_rule_rf_cell.attr("rowspan"), 10);
  $prev_rule_rf_cell.attr({
   "rowspan": parseInt((next_rowspan + prev_rowspan + 1), 10)
  });
  this.resetRecencyFrequency($prev_rule_rf_cell.parents('tr'));
  that.handleExpressionChange();
 },
 resetRecencyFrequency: function($rule_with_rf) {
  var $rf_cell = $rule_with_rf.find('.rf_cell');
  $rf_cell.find('select, input').each(function() {
   var $this = $(this);
   var classname = $this.attr("class");
   if (classname !== "" && classname in SegmentBuilderWidget.defaults.rf) {
    $this.val(SegmentBuilderWidget.defaults.rf[classname])
        .trigger("change");
   }
  });
  $rf_cell.removeClass("on").addClass("off");
 },
 opShow: function(e) {
  var $this = $(this),
      $parent = $this.parents('tr.ruleOp:first');
  if ($parent.hasClass("on") || $parent.hasClass("show")) {
   return;
  }
  $parent.removeClass("off").addClass("show");
  $parent.on("mouseleave", function(e) {
   var $this = $(this);
   if (e.target && e.target.nodeName && e.target.nodeName.toUpperCase() == "SELECT" || e.target.nodeName.toUpperCase() == "OPTION" || $this.hasClass("on")) {
    return false;
   }
   $this.removeClass("on show").addClass("off");
  });
 },
 removeRfFromRow: function($elem) {
  $elem.removeClass("rf");
  $elem.find('.rf_cell').remove();
 },
 deleteRule: function(event) {
  var $row = $(event.currentTarget).parents('tr.traitRule');
  if (!$row.length) {
   ADOBE.AM.UTILS.LOGGER
       .log("deleteRule: Could not find row from currentTarget")
   return;
  }
  if (this.isOnlyRuleInGroup($row)) {
   if (this.isActiveOperator($row.next())) {
    $row.next().remove();
   } else if (this.isRuleBorder($row.prev())) {
    this.clear();
   } else if (this.isOperator($row.prev())) {
    $row.prev().remove();
   }
  } else if (this.isRecencyFrequency($row)) {
   var $rf_cell = $row.find('.rf_cell');
   var rowspan = parseInt($rf_cell.attr("rowspan"), 10);
   $rf_cell.attr({
    rowspan: (rowspan - 2)
   });
   $row.next().remove();
   var $next_rule = $row.next();
   $next_rule.append($rf_cell);
   $next_rule.addClass("rf");
  } else {
   this.adjustGroupRowspan($row, -2);
   if (this.isRuleBorder($row.next()) || this.isActiveOperator($row.next())) {
    $row.prev().remove();
   } else {
    $row.next().remove();
   }
  }
  $row.remove();
  this.handleExpressionChange();
 },
 adjustGroupRowspan: function($elem, adjust) {
  var $tr_rf = null;
  if (this.isRecencyFrequency($elem)) {
   $tr_rf = $elem;
  } else {
   $tr_rf = $elem.prevAll('.traitRule.rf').eq(0);
  }
  if (!$tr_rf.length) {
   ADOBE.AM.UTILS.LOGGER
       .log("adjustGroupRowspan: Could not find RF Row in group")
  }
  $rf_cell = $tr_rf.find('.rf_cell').eq(0);
  if (!$rf_cell.length) {
   ADOBE.AM.UTILS.LOGGER
       .log("adjustGroupRowspan: Could not find RF Cell in Row RF group")
  }
  var rowspan = parseInt($rf_cell.attr("rowspan"), 10);
  $rf_cell.attr({
   rowspan: rowspan + parseInt(adjust, 10)
  });
 },
 handleRuleDrop: function(event, ui) {
  var $elem = ui.item.eq(0),
      rf_cell = null,
      rf_data = null,
      op_html = null,
      data = null,
      $tr_rf_cell = null,
      $tr_rf = null,
      rf_cell_html = "",
      original_rowspan = 0;
  if (!$elem.length) {
   ADOBE.AM.UTILS.LOGGER
       .log("handleRuleDrop: We do not have an $elem");
  }
  var that = this;
  var $next_elem = $elem.next();
  var $prev_elem = $elem.prev();
  var $prev_from_original_elem = $elem.data('previous_sibling');
  var $next_from_original_elem = $elem.data('next_sibling');

  function handleFirstInGrouping() {
   var $rule_with_rf = $next_elem;
   var $rule_with_rf_cell = $rule_with_rf.find('.rf_cell');
   var next_rule_rowspan = parseInt($rule_with_rf_cell.attr("rowspan"), 10);
   if ($rule_with_rf.hasClass("on")) {
    rf_data = {
     frequency_ops: $rf_cell.find('select.frequency_ops').val(),
     frequency_val: $rf_cell.find('input.frequency_val').val(),
     recency_ops: $rf_cell.find('select.recency_ops').val(),
     recency_val: $rf_cell.find('input.recency_val').val()
    };
   } else {
    rf_data = SegmentBuilderWidget.defaults.rf;
   }
   data = _.extend({
    rowspan: next_rule_rowspan + 2
   }, rf_data);
   rf_cell_html = _.template(APP.templates.segment_builder_widget.elements.rf_cell, data);
   $elem.append(rf_cell_html);
   op_html = _.template(APP.templates.segment_builder_widget.elements.op, {
    op_wrapper_class: "off",
    selected: false
   });
   $(op_html).insertAfter($elem);
   that.removeRfFromRow($rule_with_rf);
   $elem.addClass("rf");
   that.handleExpressionChange();
  }
  if (this.isRecencyFrequency($elem)) {
   $rf_cell = $elem.find('.rf_cell');
   original_rowspan = parseInt($rf_cell.attr("rowspan"), 10)
   if ($rf_cell.hasClass("on")) {
    rf_data = {
     frequency_ops: $rf_cell.find('select.frequency_ops').val(),
     frequency_val: $rf_cell.find('input.frequency_val').val(),
     recency_ops: $rf_cell.find('select.recency_ops').val(),
     recency_val: $rf_cell.find('input.recency_val').val()
    };
   } else {
    rf_data = SegmentBuilderWidget.defaults.rf;
   }
   $rf_cell.remove();
   $elem.removeClass("rf");
  }
  if (this.isRule($prev_elem)) {
   op_html = _.template(APP.templates.segment_builder_widget.elements.op, {
    op_wrapper_class: "off",
    selected: false
   });
   $(op_html).insertBefore($elem);
   if (this.isRecencyFrequency($elem)) {
    $tr_rf = $elem;
   } else {
    $tr_rf = $elem.prevAll('.traitRule.rf').eq(0);
   }
   if ($tr_rf.length) {
    $tr_rf_cell = $tr_rf.find('.rf_cell');
    $tr_rf_cell.attr({
     rowspan: parseInt($tr_rf_cell.attr("rowspan"), 10) + 2
    });
   }
   if (this.isRecencyFrequency($elem)) {
    this.removeRfFromRow($elem);
   }
  } else if (this.isActiveOperator($prev_elem)) {
   handleFirstInGrouping();
  } else if (this.isOperator($prev_elem)) {
   op_html = _.template(APP.templates.segment_builder_widget.elements.op, {
    op_wrapper_class: "off",
    selected: false
   });
   $(op_html).insertAfter($elem);
   if (this.isRecencyFrequency($elem)) {
    $tr_rf = $elem;
   } else {
    $tr_rf = $elem.prevAll('tr.traitRule.rf').eq(0);
   }
   $tr_rf_cell = $tr_rf.find('.rf_cell');
   rowspan = parseInt($tr_rf_cell.attr("rowspan"), 10);
   $tr_rf_cell.attr({
    rowspan: rowspan + 2
   });
  } else if (this.isRuleBorder($prev_elem)) {
   handleFirstInGrouping();
  }
  if (this.isActiveOperator($prev_from_original_elem) || this.isRuleBorder($prev_from_original_elem)) {
   if (this.isRuleBorder($next_from_original_elem)) {
    $prev_from_original_elem.remove();
   } else if (this.isOperator($next_from_original_elem)) {
    if (this.isActiveOperator($next_from_original_elem)) {
     $next_from_original_elem.remove();
    } else {
     var $new_first_rule = $next_from_original_elem.next();
     data = _.extend({
      rowspan: original_rowspan - 2
     }, rf_data);
     rf_cell_html = _
         .template(APP.templates.segment_builder_widget.elements.rf_cell, data);
     $new_first_rule.append($(rf_cell_html));
     $new_first_rule.addClass("rf");
     $next_from_original_elem.remove();
    }
   }
  } else if (this.isOperator($prev_from_original_elem)) {
   var $rule_with_rf = null;
   if (this.isRecencyFrequency($prev_from_original_elem)) {
    $rule_with_rf = $prev_from_original_elem;
   } else {
    $rule_with_rf = $prev_from_original_elem.prevAll('.traitRule.rf').eq(0);
   }
   if ($rule_with_rf.length) {
    $rule_with_rf = $rule_with_rf.find('.rf_cell');
    $rule_with_rf.attr({
     rowspan: parseInt($rule_with_rf.attr("rowspan"), 10) - 2
    });
   }
   $prev_from_original_elem.remove();
  }
  that.handleExpressionChange();
 },
 handleValidExpression: function(response) {
  var code_view_only = response.codeViewOnly;
  try {
   this.clearHTML();
   if (code_view_only) {
    SegmentBuilderWidget.code_view_only = true;
    this.$container.html(ADOBE.AM.MESSAGES.getMessage('complex_rule').message);
    return;
   }
   SegmentBuilderWidget.code_view_only = false;
   var g6s = ADOBE.AM.UTILS.G6.SEGMENTS;
   var expr_tree = $.extend(true, {}, response.expressionTree);
   var traits_for_tree = response.traits;
   if (expr_tree && traits_for_tree) {
    g6s.trait_cache.cache = traits_for_tree;
    APP.cache.traits.setCache(traits_for_tree);
    tree_html = g6s.treeParser(expr_tree, g6s.parsingFunctions.html);
    this.addHTML(tree_html);
    this.handleExpressionChange();
   } else {
    ADOBE.AM.UTILS.LOGGER
        .log("handleValidExpression: Something went wrong when parsing this tree");
   }
  } catch (_err_) {
   ADOBE.AM.UTILS.LOGGER
       .log("handleValidExpression: " + _err_.message);
  }
 },
 handleInvalidExpression: function(reponse) {},
 validateExpression: function(expr) {
  var expression = "";
  expression = expr;
  return $.ajax({
   url: ADOBE.AM.API.SEGMENTS.rule_validation.url(),
   dataType: "json",
   contentType: "application/json",
   type: "post",
   data: JSON.stringify({
    rule: expression
   })
  });
 }
};
$(function() {
 var App = window.APP,
     AAM = window.ADOBE.AM,
     Templates = App.templates,
     modal = null,
     traits_modal = null,
     traits_modal_search = null,
     traits_modal_tree = null,
     modal_anim = null,
     loading = 0,
     vent = _.extend({}, Backbone.Events);
 vent.on("modal:show", function(args) {
  modal = AAM.AlertModal(args);
 });
 vent.on("modal:hide", function() {
  modal.hide();
 });
 App.User = {
  permissions: new ADOBE.AM.User.Models.UserPermission({
   permissions: window.userRoles
  }),
  has_create_permissions: false,
  has_edit_permissions: false,
  has_edit_permissions_for_editpage: function() {
   return App.User.has_edit_permissions && App.models.ActiveSegment.canViewAllTraits() && App.models.ActiveSegment.canMapAllTraits();
  },
  has_clone_permissions_for_editpage: function() {
   return App.models.ActiveSegment.canViewAllTraits() && App.models.ActiveSegment.canMapAllTraits();
  },
  has_clone_permissions: false,
  has_delete_permissions: false,
  has_map_to_destination_permissions: false,
  has_create_model_with_segment_permissions: false,
  can_view_destinations: false
 };
 App.cache.SegmentDataSources = new ADOBE.AM.DataSource.Collections.DataSources(window._globalDataSources || []);
 App.gateKeeper = new ADOBE.AM.UTILS.GATEKEEPER();
 App.gateKeeper.setPermissionClass(ADOBE.AM.Permission.Models.Permission);
 App.gateKeeper.setErrorTypes(ADOBE.AM.UTILS.ERRORS.TYPES);
 App.gateKeeper.setSchemes(ADOBE.AM.PERMS.permission_schemes);
 App.User.can_view_destinations = App.gateKeeper.checkPermissions([App.User.permissions], 'can_view_destinations');
 Mediator.setMainComponent("App");
 App.views.ViewPage = {};
 App.cache.traits = {
  cache: [],
  getTrait: function(sid) {
   for (var i = 0, len = this.cache.length; i < len; i++) {
    if (this.cache[i].sid == sid) {
     return this.cache[i];
    }
   }
   return false;
  },
  addTrait: function(trait) {
   var found = !!this.getTrait(trait.sid);
   if (found) {
    return false;
   }
   this.cache.push(trait);
   return true;
  },
  setCache: function(traits) {
   this.cache = traits;
  }
 };
 App.views.EditPage = {};
 App.views.ListPage = {};
 App.collections.ViewPage = {};
 App.collections.EditPage = {};
 App.dialogs.traits_modal_loading = null;
 App.dialogs.traits_modal = null;
 App.collections.EditPage.DataSources = new ADOBE.AM.DataSource.Collections.DataSourcesForSegments();
 App.collections.helpers.create_custom_destinations = function(dests) {
  var derived_destinations = [];
  if (dests && typeof dests.each == 'function') {
   dests.each(function(destination) {
    var dots = destination.get("DataOrderTraits");
    if (dots) {
     dots.each(function(dot) {
      var tmp_obj = {
       destination_id: destination.get("destinationId"),
       destination_name: destination.get("name"),
       destination_type: ADOBE.AM.API.DESTINATION.destination.getType(destination.get("destinationType"))
      };
      _.extend(tmp_obj, dot.toJSON());
      derived_destinations.push(tmp_obj);
     });
    }
   });
  }
  APP.collections.derived_collection.reset(derived_destinations);
 };
 App.models.ActiveSegment = new ADOBE.AM.Segment.Models.Segment({});
 App.views.ListPage.SegmentFolderTree = new AAM.Segment.Views.SegmentFolderTree({
  tree_options: {
   folderSrc: AAM.API.FOLDERS.folders.url('segments'),
   inc3rdParty: false,
   initially_select: (function() {
    if ($('#SegmentEdit:hidden').length && $.cookies.get('segmentListFolderID')) {
     return ['#' + $.cookies.get('segmentListFolderID') + '_folder'];
    } else {
     return null;
    }
   })(),
   initially_open: ["#0_folder"],
   foldersOnly: true,
   formatData: function(data) {
    var newDataArr = [];

    function formatNode(obj) {
     var newObj = {
      "attr": {
       id: APP.views.ListPage.SegmentFolderTree.makeJSTreeId(obj.folderId),
       rel: "folder"
      },
      "data": obj.name
     };
     if ($.isArray(obj.subFolders) && obj.subFolders.length > 0) {
      var children = [];
      $.each(obj.subFolders, function(i, child) {
       var childObj = formatNode(child);
       children.push(childObj);
      });
      $.extend(newObj, {
       "state": "closed",
       "children": children
      });
     }
     return newObj;
    }
    $.each(data, function(i, folder) {
     newDataArr.push(formatNode(folder));
    });
    return newDataArr;
   }
  },
  parentElement: $('.segment_storage'),
  hook_select_node: function(args) {
   Mediator.broadcast("FolderSelectReceived", args);
  },
  makeJSTreeId: function(id) {
   return id + "_folder";
  }
 });
 Mediator.add('APP.views.ListPage.SegmentFolderTree', {
  onTreeLoaded: function(args) {},
  onClearFoldersRequest: function() {
   App.views.ListPage.SegmentFolderTree.clearFolders();
  }
 });
 App.views.EditPage.SegmentFolderTree = new AAM.Segment.Views.SegmentFolderTree({
  tree_options: {
   folderSrc: AAM.API.FOLDERS.folders.url('segments'),
   inc3rdParty: true,
   initially_open: ["#0_editpage_folder"],
   foldersOnly: true,
   formatData: function(data) {
    var newDataArr = [];

    function formatNode(obj) {
     var newObj = {
      "attr": {
       id: APP.views.EditPage.SegmentFolderTree.makeJSTreeId(obj.folderId),
       rel: "folder"
      },
      "data": obj.name
     };
     if ($.isArray(obj.subFolders) && obj.subFolders.length > 0) {
      var children = [];
      $.each(obj.subFolders, function(i, child) {
       var childObj = formatNode(child);
       children.push(childObj);
      });
      $.extend(newObj, {
       "state": "closed",
       "children": children
      });
     }
     return newObj;
    }
    $.each(data, function(i, folder) {
     newDataArr.push(formatNode(folder));
    });
    return newDataArr;
   }
  },
  parentElement: $('#seBasicInfo .AUI_CollapsiblePanel_content'),
  makeJSTreeId: function(id) {
   return id + "_editpage_folder";
  }
 });
 Mediator.add('APP.views.EditPage.SegmentFolderTree', {
  onTreeLoaded: function(args) {
   var folderId = App.models.ActiveSegment.getFolderModelProp('folderId');
   if (folderId) {
    App.views.EditPage.SegmentFolderTree.selectNode(folderId);
   }
  }
 });
 App.collections.PaginatedItems = new AAM.Segment.Collections.PaginatedSegments();
 App.collections.PaginatedItems.hook_parse = function(response) {
  var that = this;
  $(APP.views.SegmentTable.checkedRows).each(function(idx, checkedRow) {
   $(response.list).each(function(idx, segment) {
    if (segment.sid == checkedRow) {
     segment.checked = true;
    }
   });
  });
  return response;
 };
 App.collections.PaginatedItems.setParams({
  includePermissions: true,
  includeExprTree: true
 });
 var PaginatedSegments = App.collections.PaginatedItems;
 var definedUserActions = {
  addToDestination: function() {
   var segments_selected = this.collection.filter(function(model) {
    return model.get('checked');
   });
   if (segments_selected.length < 1) {
    vent.trigger('modal:show', {
     type: 'notice',
     message: 'You must check the checkboxes for the segments you wish to add to a destination'
    });
    return false;
   }
   var segments_mappable = segments_selected.filter(function(model) {
    return model.get('isDestinationMappable');
   });
   var segments_not_mappable = segments_selected.filter(function(model) {
    return model.get('isDestinationMappable') === false;
   });
   var addMappableSegments = function(segments_mappable) {
    if (App.dialogs.destinations_modal) {
     App.dialogs.destinations_modal.mediatorRequest = 'add_to_destination';
     App.dialogs.destinations_modal.segmentsToAddToDestination = segments_selected;
    }
    Mediator.broadcast("BrowseAllDestinationsModal", {
     request: "add_to_destination",
     segmentsToAddToDestination: segments_mappable
    });
    if (modal) {
     vent.trigger('modal:hide');
    }
   };
   if (segments_not_mappable.length) {
    if (segments_mappable.length) {
     var list = '<ul>';
     _.each(segments_not_mappable, function(segment, idx) {
      list += '<li>' + segment.get('name') + '</li>';
     });
     list += '</ul>';
     vent.trigger('modal:show', {
      type: 'notice',
      message: AAM.MESSAGES.getMessage('not_all_selected_segments_can_be_added_to_destinations').message,
      buttons: [{
       text: 'YES',
       className: 'primary',
       onClick: addMappableSegments
      }, {
       text: 'NO',
       className: 'secondary',
       onClick: function() {
        vent.trigger('modal:hide');
       }
      }]
     });
     $('#alertModal .insert').append(list);
    } else {
     vent.trigger('modal:show', {
      type: 'notice',
      message: AAM.MESSAGES.getMessage('no_selected_segments_can_be_added_to_destinations').message
     });
     return false;
    }
   } else {
    addMappableSegments(segments_mappable);
   }
  },
  createModelWithSelected: function() {
   var segment = this.collection.filter(function(model) {
    return model.get('checked');
   });
   if (segment.length < 1) {
    vent.trigger('modal:show', {
     type: 'notice',
     message: AAM.MESSAGES.getMessage('select_one_segment').message
    });
    return false;
   } else if (segment.length > 1) {
    vent.trigger('modal:show', {
     type: 'notice',
     message: AAM.MESSAGES.getMessage('too_many_segments_selected').message
    });
    return false;
   } else if (_.indexOf(segment_dpids_for_model_creation, segment[0].get('dataSourceId')) < 0) {
    vent.trigger('modal:show', {
     type: 'notice',
     message: AAM.MESSAGES.getMessage('cannot_create_model_with_segment').message
    });
    return false;
   }
   document.location = APP.state.vars.urls.models_page + '#new/segment/' + segment[0].get('id');
  },
  deleteSelected: function() {
   Mediator.broadcast("BulkDeleteReceived");
   var ids_to_delete = this.collection.filter(function(model) {
    return model.get('checked');
   }).map(function(model) {
    return model.get('sid');
   });
   if (ids_to_delete.length < 1) {
    ADOBE.AM.alertBox({
     title: "Notification",
     errorMsg: 'You must select segments',
     msg: 'You must check the checkboxes for the segments you wish to delete'
    });
    return;
   }
   var that = this,
       div = document.createElement('div'),
       okButton = document.createElement('button'),
       cancelButton = document.createElement('button');
   okButton.className = 'primary';
   okButton.innerHTML = 'OK';
   cancelButton.innerHTML = 'Cancel';
   div.appendChild(okButton);
   div.appendChild(cancelButton);
   var modal = new AUI.Dialog({
    header: 'Confirmation',
    content: '<p>Are you sure you want to delete this segment?</p>',
    width: '300px',
    height: '150px',
    footer: div,
    center: true
   }).render();
   AUI.addListener(okButton, 'click', function() {
    Mediator.broadcast("ShowLoadingReceived");
    ADOBE.AM.API.SEGMENTS.bulkDelete.method({
     success: function() {
      Mediator.broadcast("RefreshSegmentsReceived");
      Mediator.broadcast("HideLoadingReceived");
     },
     error: function(obj, textStatus, err) {
      var errorReturned = JSON.parse(obj.responseText),
          errorMsgObj = ADOBE.AM.MESSAGES.getMessage(errorReturned.code),
          alertObj = {
           title: errorMsgObj.title,
           errorMsg: errorMsgObj.summary,
           msg: errorMsgObj.message
          };
      ADOBE.AM.alertBox(alertObj);
      Mediator.broadcast("HideLoadingReceived");
     },
     ids: ids_to_delete,
     pid: ADOBE.AM.pid
    });
    modal.hide();
   }, modal);
   AUI.addListener(cancelButton, 'click', modal.hide, modal);
   modal.show();
  }
 };
 var view_page_defined_user_actions = {
  cloneSegment: function() {
   Mediator.broadcast("NavigationRequestReceived", {
    request: "segment_clone",
    args: {
     sid: this.model.get("sid")
    }
   });
  },
  editSegment: function() {
   App.routers.AppRouter.navigate('edit/' + this.model.get("sid"), {
    trigger: true
   });
  },
  deleteSegment: function() {
   var that = this,
       div = document.createElement('div'),
       okButton = document.createElement('button'),
       cancelButton = document.createElement('button');
   okButton.className = 'primary';
   okButton.innerHTML = 'OK';
   cancelButton.innerHTML = 'Cancel';
   div.appendChild(okButton);
   div.appendChild(cancelButton);
   var modal = new AUI.Dialog({
    header: 'Confirmation',
    content: '<p>Are you sure you want to delete this segment?</p>',
    width: '300px',
    height: '150px',
    footer: div,
    center: true
   }).render().show();
   AUI.addListener(okButton, 'click', function() {
    that.model.destroy({
     success: function() {
      modal.hide();
      var resultModal = new AUI.Dialog({
       header: 'Delete Segment',
       content: '<p>The segment was successfully deleted.</p>',
       width: '300px',
       height: '150px',
       footer: '<div><button class="primary ok">OK</button></div>',
       center: true
      }).render().show();
      $('.ui-dialog').css({
       position: 'absolute',
       top: 133
      });
      $('.ok').live('click', function() {
       Mediator.broadcast("SegmentDeleted");
       App.routers.AppRouter.navigate('', {
        trigger: true
       });
       resultModal.hide();
      });
     },
     error: function(obj, textStatus, errorThrown) {
      modal.hide();
      var alertObj = {
       title: "Delete Segment"
      };
      var msg = "";
      var msgObj = null;
      if (textStatus.status == 400) {
       if (textStatus && typeof textStatus.responseText == "string") {
        msgObj = JSON.parse(textStatus.responseText);
        if (msgObj && msgObj.message) {
         msg = msgObj.message;
        }
       }
       alertObj.errorMsg = msg || "An error occurred.";
      } else {
       alertObj.errorMsg = "An error occurred.";
      }
      alertObj.msg = errorThrown;
      ADOBE.AM.alertBox(alertObj);
     }
    });
   }, modal);
   AUI.addListener(cancelButton, 'click', modal.hide, modal);
  }
 };
 var new_segment_action = {
  newSegment: function() {
   Mediator.broadcast("NavigationRequestReceived", {
    request: "new_segment"
   });
  }
 };
 var _didCreatePermissionsPass = false;
 var segment_dpids_for_model_creation = [];
 if (App.cache.SegmentDataSources.length > 0) {
  _didCreatePermissionsPass = App.cache.SegmentDataSources
      .filter(function(dataSource) {
       if (App.gateKeeper.checkPermissions([App.User.permissions, dataSource.relational.permissions], 'can_create_model_with_selected')) {
        segment_dpids_for_model_creation.push(dataSource.get('dataSourceId'));
        App.User.has_create_model_with_segment_permissions = true;
       }
       return dataSource.isFirstParty();
      })
      .some(function(dataSource) {
       return App.gateKeeper.checkPermissions([App.User.permissions, dataSource.relational.permissions], 'can_create_segment_in_segmentbuilder');
      });
  if (_didCreatePermissionsPass) {
   _.extend(definedUserActions, new_segment_action);
   _.extend(view_page_defined_user_actions, new_segment_action);
   App.User.has_create_permissions = true;
  }
 } else {
  if (App.gateKeeper.checkPermissions([App.User.permissions], 'can_create_segment_in_segmentbuilder')) {
   _.extend(definedUserActions, new_segment_action);
   _.extend(view_page_defined_user_actions, new_segment_action);
   App.User.has_create_permissions = true;
  }
 }
 if (App.gateKeeper.checkPermissions([App.User.permissions], 'can_delete_segment_in_segmentbuilder')) {
  App.User.has_delete_permissions = true;
 }
 var can_show_segment_to_destination_in_sb_toolbar_buttons = App.gateKeeper.checkPermissions([App.User.permissions], 'can_show_segment_to_destination_in_sb_toolbar_buttons');
 App.views.Toolbar = new AAM.Widget.Views.Toolbar({
  el: $('#SegmentList .top_toolbar'),
  template: _.template(Templates.makeTemplate('list_page_toolbar', {
   "%%CREATE_BUTTON_LI%%": App.User.has_create_permissions ? Templates.list_page_toolbar_create_button : "",
   "%%DELETE_BUTTON_LI%%": App.User.has_delete_permissions ? Templates.toolbar_delete_selected_button : "",
   "%%CREATE_MODEL_WITH_SELECTED_LI%%": App.User.has_create_model_with_segment_permissions ? Templates.toolbar_create_model_with_selected : "",
   "%%ADD_TO_DESTINATION%%": can_show_segment_to_destination_in_sb_toolbar_buttons ? Templates.can_show_segment_to_destination_in_sb_toolbar_buttons : ""
  })),
  collection: App.collections.PaginatedItems,
  userActions: definedUserActions
 });
 App.views.ViewPage.Toolbar = new AAM.Widget.Views.Toolbar({
  el: $('#SegmentView .top_toolbar'),
  model: App.models.ActiveSegment,
  userActions: view_page_defined_user_actions
 });
 App.views.ViewPage.SegmentName = new AAM.Segment.Views.Widget({
  el: $('#SegmentView h1'),
  model: App.models.ActiveSegment
 });
 App.views.ViewPage.BasicInfo = new AAM.Segment.Views.BasicInfo({
  el: $('#SegmentView #segmentInfoW'),
  template: App.templates.view_page_basic_info,
  model: App.models.ActiveSegment
 });
 App.views.ViewPage.Graph = new AAM.Segment.Views.Graph({
  el: $('#SegmentView #segmentUniquesW'),
  template: '<h3>Segment Graph</h3><div id="segmentTrend"><div id="cloudVizChart"></div></div>',
  model: App.models.ActiveSegment,
  renderGraph: function() {
   var latestDateInUTC = moment(this.latestDate).utc().hours(0).minutes(0).minutes(0).seconds(0).milliseconds(0);
   var latestDateInUTCMS = latestDateInUTC.valueOf();
   var graphDiv = '#segmentTrend';
   var url = ADOBE.AM.API.SEGMENTS.trend.sid.url(this.model.get('id'), latestDateInUTC.subtract('days', 90).valueOf(), latestDateInUTCMS, '1D');
   $.getJSON(url, function(dataRaw) {
    if (dataRaw.metrics !== Object(dataRaw.metrics) || Object.keys(dataRaw.metrics).length === 0) {
     $('#cloudVizChart').addClass('no_results').html(DEMDEX.UTILS.noDataMsg);
     return;
    }
    var dataFormat = [{
     'Real-time': 'instantUniques'
    }, {
     'Total': 'totalUniques'
    }];
    var data = dataRaw.metrics;
    var dataParsed = ADOBE.AM.UTILS.HELPERS.parseDataFormatForCloudViz(dataRaw.metrics, dataFormat);
    var dataGraph = ADOBE.AM.UTILS.HELPERS.transformDataToCloudViz(dataParsed);
    var chart = cloudViz.line({
     parent: d3.select("#cloudVizChart").node(),
     data: dataGraph,
     filled: false,
     autoResize: true,
     interactive: true,
     normalized: true
    });
    chart.on('mouseover', function() {
     this.label(function(d) {
      return ADOBE.AM.UTILS.HELPERS.formatTimestampToUTC(d, 'MM/DD/YYYY');
     });
    });
    setTimeout(function() {
     chart.render();
    }, 0);
   }).error(function() {
    $(graphDiv).html(DEMDEX.UTILS.noDataMsg);
   });
  }
 });
 App.views.SearchBar = new AAM.Widget.Views.SearchBox({
  template: _.template('<div id="segment_search"></div>'),
  parent_identifier: 'segment_search',
  parentElement: $('.segment_storage'),
  collection: App.collections.PaginatedItems,
  searchTermCookieName: 'segmentSearchTxt',
  selectedFolderCookieName: 'segmentListFolderID',
  beforeSearch: function() {
   this.collection.setParams({
    folderId: null
   });
  }
 });
 App.views.SegmentTable = new AAM.Segment.Views.PaginatedTable({
  collection: App.collections.PaginatedItems,
  new_row: AAM.Segment.Views.SegmentTableRowView,
  checkedRows: []
 });
 App.views.Pagination = new AAM.Widget.Views.PaginatedView({
  el: $('#pagination'),
  collection: App.collections.PaginatedItems,
  beforeEventClick: function() {
   Mediator.broadcast("ShowLoadingReceived");
  },
  afterRender: function() {
   Mediator.broadcast("HideLoadingReceived");
  }
 });
 Mediator.add("App", {
  onLoadSegmentBuilderWidgetWithTraits: function(args) {
   var sids = args.sids;
   Mediator.broadcast("BlockUIRequested");
   var traits_collection = new ADOBE.AM.Trait.Collections.Traits();
   traits_collection.addQueryStringArgs({
    includeMetrics: true
   });
   traits_collection.sids = sids;
   var onTraitCollectionFetchComplete = function() {
    var num_of_traits = traits_collection.length;
    if (num_of_traits > 1) {
     SegmentBuilderWidget.SOLR.disableRequest();
    }
    traits_collection.each(function(trait, index) {
     var uniques = ADOBE.AM.UTILS.HELPERS.formatNumber(trait.get('uniques30Day'));
     if (index == (num_of_traits - 1)) {
      SegmentBuilderWidget.SOLR.enableRequest();
     }
     SegmentBuilderWidget.addRule({
      name: trait.get('name'),
      sid: trait.get('sid'),
      uniques: uniques || 0,
      is_dpmtrait: ADOBE.AM.UTILS.HELPERS.isDPMTrait(trait.get('traitType')),
      is_algotrait: ADOBE.AM.UTILS.HELPERS.isAlgoTrait(trait.get('traitType'))
     });
    });
   };
   var onTraitCollectionFetchFail = function() {
    ADOBE.AM.UTILS.LOGGER.log("onLoadSegmentBuilderWidgetWithTraits: problem fetching sids!");
    Mediator.broadcast("FatalErrorEncountered");
    return false;
   };
   traits_collection.fetch()
       .done(onTraitCollectionFetchComplete)
       .fail(onTraitCollectionFetchFail)
       .always(function() {
        Mediator.broadcast("UnblockUIRequested");
       });
  },
  onBrowseAllDestinationsModal: function(args) {
   var container = null,
       cancel_button = null,
       div = null,
       closeDestinationModal = function() {
        App.dialogs.destinations_modal.hide();
       };
   if (App.dialogs.destinations_modal) {
    $(App.dialogs.destinations_modal.el('container')).find('input[type=radio]:checked').removeAttr('checked');
    App.dialogs.destinations_modal.show();
    return;
   }
   cancel_button = document.createElement('button');
   div = document.createElement('div');
   cancel_button.className = 'secondary';
   cancel_button.innerHTML = "Cancel";
   AUI.addListener(cancel_button, 'click', function() {
    closeDestinationModal();
   });
   div.appendChild(cancel_button);
   App.dialogs.destinations_modal = new AUI.Dialog({
    header: 'Select Destination',
    width: '1026px',
    height: '2000px',
    center: true,
    footer: div,
    zIndex: 1003
   });
   App.dialogs.destinations_modal.render();
   App.dialogs.destinations_modal.mediatorRequest = args.request;
   App.dialogs.destinations_modal.segmentsToAddToDestination = args.segmentsToAddToDestination;
   container = App.dialogs.destinations_modal.el('container');
   if (!container) {
    ADOBE.AM.UTILS.LOGGER.log("AUI error.  Could not get container for destinations_modal");
    return false;
   }
   App.dialogs.destinations_modal.append('content', APP.templates.browse_destinations_modal);
   App.dialogs.destinations_modal.show();
   App.collections.BrowseDestinations = new AAM.Destination.Collections.Destinations({});
   App.views.EditPage.DestinationsSearchBar = new AAM.Widget.Views.SearchFieldNoPagination({
    el: $('.destinations_storage .destination_search'),
    collection: App.collections.BrowseDestinations
   });
   App.views.EditPage.BrowseDestinationsTable = new AAM.Widget.Views.Table({
    el: $('#browse_destinations_modal .browse_destinations_table'),
    collection: App.collections.BrowseDestinations,
    new_row: Backbone.View.extend({
     initialize: function() {
      _.bindAll(this, 'radio');
      this.model.bind('change', this.render, this);
     },
     tagName: 'tr',
     events: {
      "click input[type=radio]": "radio"
     },
     radio: function(event) {
      if (App.dialogs.destinations_modal.mediatorRequest == 'add_to_destination') {
       App.dialogs.destinations_modal.destModel = this.model;
       App.views.EditPage.helpers.runBulkAddModal();
      } else {
       App.views.EditPage.helpers.runAddOrEditModal(false, null, null, this.model, App.dialogs.destinations_modal);
      }
     },
     template: APP.templates.destination_table_row,
     render: function() {
      var compiled_template = _.template(this.template, {
       t: this.model
      });
      this.$el.html(compiled_template);
      return this;
     }
    })
   });
   App.views.EditPage.DestinationsSearchBar.triggerSearch(null, 'sortBy=name');
  },
  onBrowseAllTraitsModelShowLoadingReceived: function() {
   if (loading == 0) {
    if (App.dialogs.traits_modal_loading === null) {
     App.dialogs.traits_modal_loading = AUI.Alert({
      parent: 'browse_traits_modal',
      type: 'loading',
      label: '',
      message: "Loading data"
     }).render().show();
    } else {
     App.dialogs.traits_modal_loading.show();
    }
    loading = 1;
   } else {
    loading += 1;
   }
  },
  onBrowseAllTraitsModelHideLoadingReceived: function() {
   if (loading == 1) {
    if (App.dialogs.traits_modal_loading) {
     App.dialogs.traits_modal_loading.hide();
    }
    loading = 0;
   } else {
    if (loading == 0) {
     return false;
    }
    loading -= 1;
   }
  },
  onBrowseAllTraitsModal: function() {
   var container = null,
       add_button = null,
       cancel_button = null,
       div = null,
       closeTraitModal = function() {
        App.dialogs.traits_modal.hide();
        if ($('#traits_table .column_checkbox').hasClass('enabled')) {
         $('#traits_table .column_checkbox').click();
        } else {
         App.collections.PaginatedTraits.each(function(model) {
          if (model.get('checked')) {
           model.set({
            checked: false
           });
          }
         });
        }
        App.views.EditPage.TraitsTable.checkedRows = [];
       };
   if (App.dialogs.traits_modal) {
    App.dialogs.traits_modal.show();
    return false;
   }
   add_button = document.createElement('button');
   cancel_button = document.createElement('button');
   div = document.createElement('div');
   add_button.className = 'primary';
   add_button.innerHTML = "Add Selected Traits to Segment";
   cancel_button.className = 'secondary';
   cancel_button.innerHTML = "Cancel";
   AUI.addListener(add_button, 'click', function() {
    if (!App.views.EditPage.TraitsTable.checkedRows || App.views.EditPage.TraitsTable.checkedRows.length == 0) {
     ADOBE.AM.AlertModal({
      header: 'Errors',
      message: 'You have not selected any trait(s) to add.'
     });
     return;
    }
    var num_of_rows = App.views.EditPage.TraitsTable.checkedRows.length;
    if (num_of_rows > 1) {
     SegmentBuilderWidget.SOLR.disableRequest();
    }
    _.each(App.views.EditPage.TraitsTable.checkedRows, function(sid, index) {
     var trait = App.cache.traits.getTrait(sid);
     if (!trait) {
      return;
     }
     var uniques = ADOBE.AM.UTILS.HELPERS.formatNumber(trait.uniques30Day);
     if (index == (num_of_rows - 1)) {
      SegmentBuilderWidget.SOLR.enableRequest();
     }
     SegmentBuilderWidget.addRule({
      name: trait.name,
      sid: trait.sid,
      uniques: uniques || 0,
      is_dpmtrait: ADOBE.AM.UTILS.HELPERS.isDPMTrait(trait.traitType),
      is_algotrait: ADOBE.AM.UTILS.HELPERS.isAlgoTrait(trait.traitType)
     });
    });
    closeTraitModal();
   });
   AUI.addListener(cancel_button, 'click', function() {
    closeTraitModal();
   });
   div.appendChild(add_button);
   div.appendChild(cancel_button);
   App.dialogs.traits_modal = new AUI.Dialog({
    header: 'Select Traits',
    width: '1026px',
    footer: div,
    center: true,
    zIndex: 1003
   });
   App.dialogs.traits_modal.render();
   container = App.dialogs.traits_modal.el('container');
   if (!container) {
    ADOBE.AM.UTILS.LOGGER.log("AUI error.  Could not get container for traits_modal");
    return false;
   }
   App.dialogs.traits_modal.append('content', APP.templates.browse_traits_modal);
   App.dialogs.traits_modal.show();
   App.collections.PaginatedTraits = new AAM.Trait.Collections.PaginatedTraits();
   App.collections.PaginatedTraits.hook_parse = function(response) {
    $(App.views.EditPage.TraitsTable.checkedRows).each(function(idx, checkedRow) {
     $(response.list).each(function(idx, trait) {
      if (trait.sid == checkedRow) {
       trait.checked = true;
      }
     });
    });
    return response;
   };
   App.collections.PaginatedTraits.setParams({
    includeMetrics: true,
    includePermissions: true,
    permission: [ADOBE.AM.PERMS.permissions.traits.map_to_segments, ADOBE.AM.PERMS.permissions.traits.view]
   });
   App.views.EditPage.SearchBar = new AAM.Widget.Views.SearchField({
    el: $('.trait_storage .trait_search'),
    collection: App.collections.PaginatedTraits,
    beforeSearch: function() {
     this.collection.setParams({
      folderId: null
     });
    }
   });
   App.views.TraitsFolderTree = new AAM.Trait.Views.TraitsFolderTree({
    tree_options: {
     folderSrc: AAM.API.TRAITS.folders.url(),
     inc3rdParty: true,
     foldersOnly: true,
     formatData: function(data) {
      var newDataArr = [];
      $.each(data, function(i, folder) {
       var obj = DEMDEX.UTILS.formatFolderHierarchy(folder);
       newDataArr.push(obj);
      });
      return newDataArr;
     }
    },
    parentElement: '#traits_folder_tree'
   });
   App.views.TraitsFolderTree.render();
   App.views.EditPage.TraitsTable = new AAM.Widget.Views.PaginatedTable2({
    el: $('#traits_table'),
    collection: App.collections.PaginatedTraits,
    cache: App.cache.traits,
    new_row: Backbone.View.extend({
     initialize: function() {
      _.bindAll(this, 'checkbox');
      this.model.bind('change', this.render, this);
     },
     tagName: 'tr',
     events: {
      "click .result_checkbox": "checkbox"
     },
     checkbox: function(event) {
      var check_status = !this.model.get('checked');
      this.model.set({
       checked: check_status
      });
      if (check_status) {
       App.views.EditPage.TraitsTable.checkedRows.push(this.model.get("sid"));
       App.cache.traits.addTrait(this.model.toJSON());
      } else {
       var index_to_remove = $.inArray(this.model.get("sid"), App.views.EditPage.TraitsTable.checkedRows);
       App.views.EditPage.TraitsTable.checkedRows.splice(index_to_remove, 1);
       App.cache.traits.cache.splice(index_to_remove, 1);
      }
     },
     template: APP.templates.trait_table_row,
     render: function() {
      var trait_model = this.model,
          dataSourceId = trait_model.get('dataSourceId');
      var datasources = new Backbone.Collection(window._globalDataSourcesForTraits);
      var dataSource = datasources.where({
       dataSourceId: dataSourceId
      })[0];
      var dataSourceName = dataSource === Object(dataSource) ? (dataSource.get('name') || '') : '';
      if (dataSourceName) {
       dataSourceName += ' ';
      }
      var compiled_template = _.template(this.template, {
       t: trait_model,
       dataSourceName: dataSourceName,
       getTraitTypeName: ADOBE.AM.Trait.Models.Trait.getTraitTypeName
      });
      this.$el.html(compiled_template);
      return this;
     }
    }),
    checkedRows: [],
    onBeforeSort: function() {
     var searchTerm = $('input', App.views.EditPage.SearchBar.$el).val();
     if (searchTerm) {
      $.extend(this.query_params, {
       search: searchTerm
      });
     }
    }
   });
   App.views.EditPage.TraitsPagination = new AAM.Widget.Views.PaginatedView({
    parent_element: $('#traits_pagination'),
    collection: App.collections.PaginatedTraits,
    beforeEventClick: function() {
     Mediator.broadcast("ShowLoadingReceived");
    },
    afterRender: function() {
     Mediator.broadcast("HideLoadingReceived");
    }
   });
   App.views.EditPage.SearchBar.triggerSearch();
  },
  onFatalErrorEncountered: function(args) {
   var div = document.createElement('div');
   var okButton = document.createElement('button');
   var modal = null;
   var msg = args && args.message ? args.message : "";
   var content = 'Sorry, there was an error.<br /><br />' + msg + '<br /><br />Please click OK to reload the page.';
   okButton.innerHTML = "OK";
   div.appendChild(okButton);
   modal = new AUI.Dialog({
    header: 'Message',
    content: "<p>" + content + "</p>",
    width: '280px',
    footer: div,
    center: true
   }).render();
   AUI.addListener(okButton, 'click', function() {
    window.location.href = APP.state.vars.segment_builder_page_path;
   }, modal);
   modal.show();
  },
  onTraitFolderSelectReceived: function(args) {
   Mediator.broadcast("ShowLoadingReceived");
   App.state.folderId = args.folderId;
   App.collections.PaginatedTraits.setParams({
    query: null,
    folderId: args.folderId
   });
   App.collections.PaginatedTraits.resetPagination();
   App.collections.PaginatedTraits.fetch({
    data: {
     permission: [ADOBE.AM.PERMS.permissions.traits.map_to_segments, ADOBE.AM.PERMS.permissions.traits.view]
    },
    success: function() {
     Mediator.broadcast("HideLoadingReceived");
    },
    error: function() {
     Mediator.broadcast("HideLoadingReceived");
    }
   });
  },
  onLoadSegmentBuilderWidget: function() {
   var builder_tab = null,
       $container = null,
       g6s = null,
       code_view_only = false,
       expr_tree = null,
       traits_for_tree = null,
       tree_html = null,
       populate_segment_expression = function() {
        var seg_exp_tab = App.views.EditPage.trait_tabs.tab_panels[1];
        var segment_rule = AAM.UTILS.HELPERS.htmlEntityDecode(App.models.ActiveSegment.get('segmentRule'));
        $(seg_exp_tab).find('#segment_expression').val(segment_rule);
       };
   try {
    builder_tab = App.views.EditPage.trait_tabs.tab_panels[0];
    code_view_only = App.models.ActiveSegment.get('codeViewOnly');
    $container = $(builder_tab).find('.st_top .ruleDisplay .groupTable tbody');
    g6s = ADOBE.AM.UTILS.G6.SEGMENTS;
    SegmentBuilderWidget.setContainer($container);
    SegmentBuilderWidget.addListeners();
    SegmentBuilderWidget.clear();
    traits_for_tree = App.models.ActiveSegment.get('traits');
    g6s.trait_cache.cache = traits_for_tree;
    if (code_view_only) {
     populate_segment_expression();
     SegmentBuilderWidget.$container.html(ADOBE.AM.MESSAGES.getMessage('complex_rule').message);
     return;
    }
    expr_tree = $.extend(true, {}, App.models.ActiveSegment.get('expressionTree'));
    if (expr_tree && traits_for_tree) {
     App.cache.traits.setCache(traits_for_tree);
     tree_html = g6s.treeParser(expr_tree);
     SegmentBuilderWidget.addHTML(tree_html);
     SegmentBuilderWidget.handleExpressionChange();
    } else {
     ADOBE.AM.UTILS.LOGGER.log("App.models.ActiveSegment[" + (App.models.ActiveSegment.get('sid') || "") + "] does not have an expression tree");
     populate_segment_expression();
    }
   } catch (__WIDGET_ERROR__) {
    SegmentBuilderWidget.$container.html(ADOBE.AM.MESSAGES.getMessage('complex_rule').message);
    populate_segment_expression();
    ADOBE.AM.UTILS.LOGGER.log(__WIDGET_ERROR__.message);
   }
  },
  onSegmentDeleted: function(args) {
   App.collections.PaginatedItems.fetch();
  },
  onActiveSegmentRefreshRequested: function(args) {
   APP.models.ActiveSegment.set({
    id: args.sid,
    sid: args.sid
   }, {
    silent: true
   });
   APP.models.ActiveSegment.fetch({
    data: {
     includeExprTree: true,
     includeMetrics: true
    }
   })
       .fail(function(resp) {
        var message = "",
            response_text = null;
        if (resp && resp.status != "500" && resp.responseText) {
         response_text = JSON.parse(resp.responseText);
         message = response_text.message;
        }
        Mediator.broadcast("FatalErrorEncountered", {
         message: message
        });
       })
       .done(function() {
        if (args.callback) {
         args.callback();
        }
        Mediator.broadcast("ActiveSegmentLoaded");
       });
  },
  onActiveSegmentLoaded: function() {},
  onBlockUIRequested: function() {
   if (modal) {
    modal.el('container').style.cssText = 'opacity:100';
    modal.show();
   } else {
    modal_anim = new AUI.Animation();
    modal = new AUI.Dialog({
     content: '<div class="AUI_Alert">' +
     '<div class="AUI_Alert_Icon AUI_Alert_Icon_Loading"></div>' +
     '<div class="AUI_Notification_Container">' +
     '<span class="AUI_Alert_Content">Loading data.</span>' +
     '</div>' +
     '</div>',
     width: '200px',
     height: '100px',
     center: true
    }).render().show();
    $(modal.el('container')).attr({
     id: 'loadingAlertBox'
    });
   }
   $('.AUI_Dialog').css({
    top: 70,
    left: 170,
    width: $('#SegmentView').width()
   })
       .find('.AUI_Dialog_underlay').css({
        position: 'absolute',
        width: $('#SegmentView').width()
       });
   $('.AUI_Dialog_close').hide();
   modal_anim.addStep({
    el: modal.el('container'),
    props: {
     opacity: {
      to: 0,
      easing: 'linear'
     }
    },
    duration: 700,
    onComplete: function() {
     modal.hide();
    }
   });
  },
  onUnblockUIRequested: function() {
   modal_anim.start();
  },
  onShowLoadingReceived: function() {
   if (App.dialogs.traits_modal && App.dialogs.traits_modal.get("visible")) {
    Mediator.broadcast("BrowseAllTraitsModelShowLoadingReceived");
    return;
   }
   if (!APP.dialogs.aui_alert.get("visible")) {
    APP.dialogs.aui_alert.show();
   }
  },
  onHideLoadingReceived: function(args) {
   if (args.loaded == 'collection') {
    $('li[data-type=addToDestination]').toggle(App.User.has_map_to_destination_permissions);
   }
   if (App.dialogs.traits_modal && App.dialogs.traits_modal.get("visible")) {
    Mediator.broadcast("BrowseAllTraitsModelHideLoadingReceived");
    return;
   }
   if (APP.dialogs.aui_alert.get("visible")) {
    APP.dialogs.aui_alert.hide();
   }
  },
  onSearchRequestReceived: function(args) {
   Mediator.broadcast("ClearFoldersReceived");
   App.state.folderId = null;
  },
  onFolderSelectReceived: function(args) {
   if (!App.routers.AppRouter.isListPage()) {
    return;
   }
   Mediator.broadcast("ShowLoadingReceived");
   App.state.folderId = args.folderId;
   $.cookies.set("segmentListFolderID", args.folderId);
   $.cookies.del('segmentSearchTxt');
   App.collections.PaginatedItems.setParams({
    query: null,
    folderId: args.folderId
   });
   App.collections.PaginatedItems.resetPagination();
   App.collections.PaginatedItems.fetch({
    success: function(resp) {
     Mediator.broadcast("HideLoadingReceived");
     if (parseInt(resp.length, 10) == 0) {
      $('#segment_table_tbody').append('<tr><td colspan="6">' + ADOBE.AM.MESSAGES.getMessage('no_results').message + '</td></tr>');
     }
    },
    error: function() {
     Mediator.broadcast("HideLoadingReceived");
    }
   });
  },
  onRefreshSegmentsReceived: function() {
   App.collections.PaginatedItems.resetPagination();
   App.collections.PaginatedItems.pager();
  },
  onNavigationRequestReceived: function(args) {
   switch (args.request) {
    case 'new_segment':
     App.routers.AppRouter.navigate('new', {
      trigger: true
     });
     break;
    case 'segment_clone':
     App.routers.AppRouter.navigate('clone/' + args.args.sid, {
      trigger: true
     });
     break;
    default:
     break;
   }
  }
 });
 var tmp_model = ADOBE.AM.Destination.Models.Destination.extend({});
 var tmp_collection = Backbone.Collection.extend({
  model: tmp_model
 });
 APP.collections.derived_collection = new tmp_collection();
 if (App.User.can_view_destinations) {
  APP.views.ViewPage.Destinations = new AAM.Widget.Views.Table({
   el: $('#SegmentView #segListW'),
   collection: APP.collections.derived_collection,
   new_row: Backbone.View.extend({
    tagName: 'tr',
    template: _.template(APP.templates.viewpage_destination_table_row),
    render: function() {
     this.$el.html(this.template(this.model.toJSON()));
     return this;
    }
   })
  });
 } else {
  APP.views.ViewPage.Destinations = new(Backbone.View.extend({
   el: $('#SegmentView #segListW .content'),
   template: _.template(Templates.makeTemplate('viewpage_destination_message', {
    "%%MESSAGE%%": ADOBE.AM.MESSAGES.getMessage('destinations_permission_missing_view').message
   })),
   render: function() {
    this.$el.html(this.template());
   }
  }))();
 }
 Mediator.add("APP.views.ViewPage", {
  onActiveSegmentLoaded: function(args) {
   var create_custom_destinations = null,
       destinations = null;
   if (App.User.can_view_destinations) {
    create_custom_destinations = App.collections.helpers.create_custom_destinations;
    destinations = App.models.ActiveSegment.getDestinations();
    if (destinations instanceof Backbone.Collection) {
     create_custom_destinations(destinations);
    } else {
     destinations.always(function() {
      create_custom_destinations(App.models.ActiveSegment.getDestinations());
     });
    }
   } else {
    APP.views.ViewPage.Destinations.render();
   }
   App.views.ViewPage.BasicInfo.render();
   App.views.ViewPage.Graph.render();
   var $container = null,
       expr_tree = null,
       g6s = null,
       tree_html = null,
       traits_for_tree = null,
       code_view_only = false;
   var _active_segment = App.models.ActiveSegment;
   var edit_perms = App.User.has_edit_permissions = false,
       clone_perms = App.User.has_clone_permissions = false,
       delete_perms = App.User.has_delete_permissions = false;
   try {
    if (App.gateKeeper.checkPermissions([App.User.permissions, App.models.ActiveSegment.relational.permissions], 'can_edit_segment_in_segmentbuilder')) {
     edit_perms = true;
    }
    if (App.gateKeeper.checkPermissions([App.User.permissions, App.models.ActiveSegment.relational.permissions], 'can_clone_segment_in_segmentbuilder')) {
     if (_active_segment.canViewAllTraits()) {
      if (App.gateKeeper.checkPermissions([App.User.permissions], 'can_map_trait_to_segment_in_segmentbuilder')) {
       clone_perms = true;
      } else {
       clone_perms = _active_segment.canMapAllTraits();
      }
     }
    }
    if (App.gateKeeper.checkPermissions([App.User.permissions, _active_segment.relational.permissions], 'can_delete_segment_in_segmentbuilder')) {
     delete_perms = true;
    }
    App.views.ViewPage.Toolbar.template = _.template(App.templates.makeTemplate('view_page_toolbar', {
     "%%CLONE_BUTTON_LI%%": clone_perms ? Templates.toolbar_clone_button : "",
     "%%CREATE_BUTTON_LI%%": App.User.has_create_permissions ? Templates.list_page_toolbar_create_button : "",
     "%%EDIT_BUTTON_LI%%": edit_perms ? Templates.list_page_toolbar_edit_button : "",
     "%%DELETE_BUTTON_LI%%": delete_perms ? Templates.toolbar_delete_button : ""
    }));
    App.views.ViewPage.Toolbar.render();
    App.gateKeeper.clearAll();
    var _can_view_traits = _active_segment.canViewAllTraits();
    SegmentBuilderWidget.permissions.can_see_segment_rule_view_mode = _can_view_traits;
    $container = $('#SegmentView .ruleDisplay .content table');
    g6s = ADOBE.AM.UTILS.G6.SEGMENTS;
    code_view_only = App.models.ActiveSegment.get('codeViewOnly');
    SegmentBuilderWidget.setContainer($container);
    SegmentBuilderWidget.setType("view");
    expr_tree = $.extend(true, {}, App.models.ActiveSegment.get('expressionTree'));
    traits_for_tree = App.models.ActiveSegment.get('traits');
    if (code_view_only) {
     SegmentBuilderWidget.$container.html(ADOBE.AM.MESSAGES.getMessage('complex_rule').message);
     return;
    }
    if (SegmentBuilderWidget.permissions.can_see_segment_rule_view_mode === false) {
     SegmentBuilderWidget.$container.html('<tr><td style="background-color:white">' + ADOBE.AM.MESSAGES.getMessage('segment_rule_lack_permissions').message + "</td></tr>");
    }
    if (expr_tree && traits_for_tree) {
     g6s.trait_cache.cache = traits_for_tree;
     App.cache.traits.setCache(traits_for_tree);
     tree_html = g6s.treeParser(expr_tree);
     SegmentBuilderWidget.addHTML(tree_html);
    } else {
     ADOBE.AM.UTILS.LOGGER.log("App.models.ActiveSegment[" + (App.models.ActiveSegment.get('sid') || "") + "] does not have an expression tree");
    }
   } catch (__WIDGET_ERROR__) {
    ADOBE.AM.UTILS.LOGGER.log(__WIDGET_ERROR__.message);
   }
  }
 });
 App.views.SegmentList = new AAM.Segment.Views.SegmentPage({
  el: $('#SegmentList'),
  sub_views: {
   toolbar: App.views.Toolbar,
   search_bar: App.views.SearchBar,
   folder_tree: App.views.ListPage.SegmentFolderTree
  }
 });
 App.views.SegmentView = new AAM.Segment.Views.SegmentPage({
  el: $('#SegmentView'),
  sub_views: {
   title: App.views.ViewPage.SegmentName
  },
  lazy_load_views: {
   destination: App.views.ViewPage.Destinations
  }
 });
 App.views.SegmentNew = new AAM.Segment.Views.SegmentPage({
  el: $('#SegmentEdit'),
  sub_views: {
   basic_info: App.views.NewBasicInfo
  }
 });
 App.views.EditPage.BasicInfo = new AAM.Widget.Views.Accordion({
  title: 'Basic Information',
  parent: 'seBasicInfo',
  help: 'r_segment_basic_info_section.html',
  sub_views: {
   basic_info: new AAM.Segment.Views.EditBasicInfo({
    template: App.templates.edit_page_basic_info,
    template_collection: App.templates.edit_page_datasources,
    model: App.models.ActiveSegment,
    collection: App.collections.EditPage.DataSources
   }),
   folder_tree: App.views.EditPage.SegmentFolderTree
  }
 });
 App.views.EditPage.Traits = new AAM.Widget.Views.Accordion({
  title: 'Traits',
  parent: 'seTraits',
  aui_args: {
   expanded: false
  },
  help: 'r_segment_traits_section.html',
  sub_views: {
   estimated_hss: {
    template: App.templates.historic_segment_size,
    render: function(parentElement) {
     this.el = _.template(this.template, {});
     this.$el = $(this.el);
     $(parentElement).append(this.$el);
    }
   },
   instant_ss: new(Backbone.View.extend({
    template: App.templates.instant_segment_size,
    model: App.models.ActiveSegment,
    initialize: function() {
     _.bindAll(this, 'render');
     _.bindAll(this, 'reRender');
     this.model.bind('change:instantUniques30Day', this.reRender);
    },
    reRender: function() {
     var data = {};
     data.instantUniques7Day = isNaN(this.model.get("instantUniques7Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques7Day"));
     data.instantUniques30Day = isNaN(this.model.get("instantUniques30Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques30Day"));
     data.instantUniques60Day = isNaN(this.model.get("instantUniques60Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques60Day"));
     this.$el.replaceWith(_.template(this.template, data));
    },
    render: function(parentElement) {
     var data = {};
     data.instantUniques7Day = isNaN(this.model.get("instantUniques7Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques7Day"));
     data.instantUniques30Day = isNaN(this.model.get("instantUniques30Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques30Day"));
     data.instantUniques60Day = isNaN(this.model.get("instantUniques60Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("instantUniques60Day"));
     this.el = _.template(this.template, data);
     this.$el = $(this.el);
     $(parentElement).append(this.$el);
    }
   })),
   realized_ss: new(Backbone.View.extend({
    template: App.templates.realized_segment_size,
    model: App.models.ActiveSegment,
    initialize: function() {
     _.bindAll(this, 'render');
     _.bindAll(this, 'reRender');
     this.model.bind('change:totalUniques7Day', this.reRender);
    },
    reRender: function() {
     var data = {};
     data.totalUniques7Day = isNaN(this.model.get("totalUniques7Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques7Day"));
     data.totalUniques30Day = isNaN(this.model.get("totalUniques30Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques30Day"));
     data.totalUniques60Day = isNaN(this.model.get("totalUniques60Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques60Day"));
     this.$el.replaceWith(_.template(this.template, data));
    },
    render: function(parentElement) {
     var data = {};
     data.totalUniques7Day = isNaN(this.model.get("totalUniques7Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques7Day"));
     data.totalUniques30Day = isNaN(this.model.get("totalUniques30Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques30Day"));
     data.totalUniques60Day = isNaN(this.model.get("totalUniques60Day")) ? "-" : ADOBE.AM.UTILS.HELPERS.formatNumber(this.model.get("totalUniques60Day"));
     this.el = _.template(this.template, data);
     this.$el = $(this.el);
     $(parentElement).append(this.$el);
    }
   }))
  }
 });
 Mediator.add('APP.views.EditPage.Traits', {
  onRenderTraitTabs: function(args) {
   var router = App.routers.AppRouter;
   if (!router.isClonePage() && !router.isEditPage() && !router.isNewPage()) {
    return;
   }
   var segment_traits_tab_panel = {
    title: "Basic View",
    id: "seg_tab1",
    content: APP.templates.segment_builder_widget.segment_traits_tab
   };
   var segment_expression_tab_panel = {
    title: 'Code View <span class="context-help" title="Help" data-id="r_segment_code_syntax.html">&nbsp;</span>',
    id: "seg_tab2",
    content: APP.templates.segment_builder_widget.segment_expression_tab
   };
   var trait_accordion = App.views.EditPage.Traits;
   if (typeof App.views.EditPage.trait_tabs == "undefined") {
    App.views.EditPage.trait_tabs = new ADOBE.AM.Widget.Views.Tabs({
     aui_args: {
      parent: trait_accordion.el,
      type: 'secondary',
      color: 'white',
      prepend: true,
      panels: [segment_traits_tab_panel, segment_expression_tab_panel],
      events: {
       renderComplete: function() {
        var view = App.views.EditPage.trait_tabs;
        var aui_tabs = $(view.tabs.get('els').get('container').el).find('.AUI_Tabs_tab');
        var aui_panels = $(view.tabs.get('els').get('container').el).find('.AUI_Panels_panel');
        view.tab_tabs = aui_tabs;
        view.tab_panels = aui_panels;
        Mediator.broadcast("TraitsTabsRenderComplete");
       },
       "change:currentPanel": function() {
        Mediator.broadcast("TraitsTabsPanelChange", arguments);
       }
      }
     },
     showAllTraits: function() {
      var $panel = $(APP.views.EditPage.trait_tabs.tab_panels[1]);
      if ($panel.length) {
       $panel.find('.see_all_traits').css({
        visibility: 'visible'
       });
      }
     }
    });
    trait_accordion.sub_views.trait_tabs = App.views.EditPage.trait_tabs;
    trait_accordion.sub_views.trait_tabs.render();
   }
   ADOBE.AM.UTILS.HELPERS.bindContextHelp();
  },
  onTraitsTabsRenderComplete: function(args) {
   App.collections.autocomplete_traits = new ADOBE.AM.Trait.Collections.Traits();
   App.collections.autocomplete_traits.addQueryStringArgs({
    page: 0,
    pageSize: 10,
    includeMetrics: true,
    permission: [ADOBE.AM.PERMS.permissions.traits.map_to_segments, ADOBE.AM.PERMS.permissions.traits.view]
   });
   APP.views.EditPage.TraitAutoComplete = new ADOBE.AM.Widget.Views.Autocomplete({
    collection: App.collections.autocomplete_traits,
    getById: 'sid',
    el: $('#trait_autocomplete'),
    loading_icon: $('.st_bottom .autocomplete_loading'),
    hook_open: function(context, event, ui) {
     $(context.el).autocomplete("widget").find("li a").each(function(idx, element) {
      var dataSourceId = null;
      var dataSource = null;
      var dataSourceName = '';
      var folderId = null;
      var result = null;
      var folderPath = '';
      try {
       dataSourceId = context.collection.at(idx).get("dataSourceId");
       dataSource = App.cache.SegmentDataSources.get(dataSourceId);
       if (typeof dataSource !== 'undefined') {
        dataSourceName = dataSource.get("name");
       }
       folderId = context.collection.at(idx).get("folderId");
       result = APP.collections.TraitFolders.where({
        folderId: folderId
       });
       folderPath = result.length ? result[0].get("path") : "Not Available";
       $(this).attr("title", "Data Source: " + dataSourceName + "\nFolder Path: " + folderPath);
      } catch (ERR) {}
     });
    },
    hook_format_response: function(item) {
     var obj = {
      value: item.sid + ': ' + ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name)
     };
     return _.extend(item, obj);
    }
   });
   APP.views.EditPage.CodeViewAllTraitsTableRefresh = function(traits) {
    var html = "",
        tmp = [],
        cache = null;
    html = '<br /><table border="1" style="table-layout:fixed">' + '<thead><tr><th width="86"><b>Segment ID</b></th><th width="797"><b>Name</b></th><th width="110"><b>30 Day Uniques</b></th></tr></thead>';
    cache = traits || ADOBE.AM.UTILS.G6.SEGMENTS.trait_cache.cache;
    for (var i = 0, len = cache.length; i < len; i++) {
     tmp.push('<tr><td width="70">' + cache[i].sid + '</td><td width="300">' + cache[i].name + '<td width="100">' + ADOBE.AM.UTILS.HELPERS.formatNumber(cache[i].uniques30Day || 0) + "</td></tr>");
    }
    html += tmp.join("");
    html += "</table>";
    $('.list_traits_in_segment').html(html).css('display', 'block');
   };
   $('a.see_all_traits').click(function() {
    var $this = $(this),
        $content_panel = $(this).parents('div.segment_expression').eq(0),
        args = null,
        cb = function() {},
        state = $this.data("state") || "up",
        rendered = $this.data("rendered") || false;
    if (state == "down") {
     $this.text("Click to show all traits");
     args = {
      height: '200px'
     };
     state = "up";
    } else {
     $this.text("Click to hide all traits");
     args = {
      height: '388px'
     };
     state = "down";
    }
    if (state == "down" && !rendered) {
     cb = APP.views.EditPage.CodeViewAllTraitsTableRefresh;
    }
    $this.data("state", state);
    $this.data("rendered", true);
    $content_panel.animate(args, cb);
   });
   $('.segment_expression .validate_expression').on("click", function() {
    var $that = $(this);
    var div = document.createElement('div');
    var okButton = document.createElement('button');
    var modal = null;
    var content = '';
    okButton.innerHTML = "OK";
    div.appendChild(okButton);
    $that.addClass("disabled");
    var $jqxhr = SegmentBuilderWidget.validateExpression($('#segment_expression').val());
    $jqxhr
        .done(function(data) {
         content = "<p>This expression is valid";
         if (data && data.codeViewOnly) {
          content += ", however, it is too complex to be shown in the Basic View";
         }
         content += "</p>";
         APP.views.EditPage.CodeViewAllTraitsTableRefresh(data.traits);
        })
        .fail(function(data) {
         content = "<p>This expression is not valid</p>";
        })
        .always(function(data) {
         modal = new AUI.Dialog({
          header: 'Message',
          content: content,
          width: '280px',
          height: '130px',
          footer: div,
          center: true
         }).render();
         AUI.addListener(okButton, 'click', modal.hide, modal);
         modal.show();
         $that.removeClass("disabled");
        });
   });
   $('.recalculate_size').on('click', function() {
    var that = this,
        expression = $('#segment_expression').val();
    $(that).find('button').addClass('disabled');
    if (APP.views.EditPage.trait_tabs.tabs.get('currentPanel') == 'seg_tab1') {
     SegmentBuilderWidget.calculateSOLRNumbers({
      cb: (function(self) {
       return function() {
        $(self).find('button').removeClass('disabled');
       };
      }(that))
     });
    } else {
     if (ADOBE.AM.UTILS.HELPERS.isEmptyString(expression)) {
      return;
     }
     SegmentBuilderWidget.segment_expression = expression;
     $jqxhr = SegmentBuilderWidget.handleCompleteExpression();
     SegmentBuilderWidget.segment_expression = "";
     $('#historic_segment_size .day_number_7, #historic_segment_size .day_number_30, #historic_segment_size .day_number_60')
         .html(SegmentBuilderWidget.SOLR.messages.loading);
     $jqxhr.done(function(sizes) {
      SegmentBuilderWidget.populate_ehss_numbers(sizes);
     });
     $jqxhr.fail(function(resp) {
      if (SegmentBuilderWidget.SOLR.solr_error(resp)) {
       SegmentBuilderWidget.populate_ehss_numbers({
        "audienceSizes": [{
         "timeWindow": "DAYS7",
         "size": SegmentBuilderWidget.SOLR.messages.not_available
        }, {
         "timeWindow": "DAYS30",
         "size": SegmentBuilderWidget.SOLR.messages.not_available
        }, {
         "timeWindow": "DAYS60",
         "size": SegmentBuilderWidget.SOLR.messages.not_available
        }]
       });
      }
     });
     $jqxhr.always(function() {
      $(that).find('button').removeClass('disabled');
     });
    }
   });
   $('.segment_expression .reset_and_return').on("click", function() {
    $('#segment_expression').val(SegmentBuilderWidget.segment_expression);
    $(App.views.EditPage.trait_tabs.tab_tabs[0]).trigger("click");
   });
   $('#trait_add').on('click', function() {
    var selected_trait_model = APP.views.EditPage.TraitAutoComplete.getSelected();
    if (selected_trait_model) {
     App.cache.traits.addTrait(selected_trait_model.toJSON());
     SegmentBuilderWidget.addRule({
      name: selected_trait_model.get("name"),
      sid: selected_trait_model.get("sid"),
      uniques: ADOBE.AM.UTILS.HELPERS.formatNumber(selected_trait_model.get("uniques30Day") || 0),
      is_dpmtrait: selected_trait_model.isDPMTrait(),
      is_algotrait: selected_trait_model.isAlgoTrait()
     });
     var $ac = App.views.EditPage.TraitAutoComplete.$el;
     $ac.val('');
     $ac.data('item', null);
    } else {
     ADOBE.AM.AlertModal({
      header: 'Add Trait',
      message: '<br />You have not selected a trait to add.'
     });
     return;
    }
   });
   $('#trait_browse').on('click', function() {
    Mediator.broadcast("BrowseAllTraitsModal");
   });
   Mediator.broadcast("LoadSegmentBuilderWidget");
  },
  onTraitsTabsPanelChange: function(args) {
   if (!args) {
    return;
   }
   if ($('#segment_expression').val() === "") {
    SegmentBuilderWidget.clear();
    return;
   }
   if (args[0] && args[0].oldValue == "seg_tab2" && args[0].newValue == "seg_tab1") {
    var expr = $('#segment_expression').val();
    var $jqxhr = SegmentBuilderWidget.validateExpression(expr);
    $('#seTraits').find('.AUI_CollapsiblePanel_content').css({
     opacity: 0.4
    });
    App.views.EditPage.trait_tabs.showAllTraits();
    $jqxhr
        .done(function(resp) {
         SegmentBuilderWidget.handleValidExpression(resp);
         APP.views.EditPage.CodeViewAllTraitsTableRefresh();
         var $btn = $('.segment_expression .reset_and_return');
         if (_.isObject(resp) && resp.codeViewOnly) {
          $btn.addClass("disabled");
          $btn.off("click");
         } else {
          $btn.removeClass("disabled");
          $btn.on("click", function() {
           $('#segment_expression').val(SegmentBuilderWidget.segment_expression);
           $(App.views.EditPage.trait_tabs.tab_tabs[0]).trigger("click");
          });
         }
        })
        .fail(function() {
         APP.views.EditPage.trait_tabs.tabs.set('currentPanel', 'seg_tab2');
         var div = document.createElement('div');
         var okButton = document.createElement('button');
         var modal = null;
         modal = new AUI.Dialog({
          header: 'Message',
          content: "<p>This expression is not valid</p>",
          width: '280px',
          height: '130px',
          footer: div,
          center: true
         }).render();
         AUI.addListener(okButton, 'click', modal.hide, modal);
         modal.show();
        })
        .always(function(data) {
         $('#seTraits').find('.AUI_CollapsiblePanel_content').css({
          opacity: 1
         });
        });
   }
  }
 });
 APP.views.EditPage.DestinationsTable = new AAM.Widget.Views.Table({
  render: function(el) {
   var that = this,
       table;
   if (!this.$rootEl) {
    this.$rootEl = $(el);
   }
   table = this.$rootEl.find('table');
   if (table.length) {
    table.find('tbody').empty();
   } else {
    this.$rootEl.append('<table class="table"><thead><th data-type="destination_id">Destination ID</th><th data-type="destination_name">Name</th><th data-type="destination_type">Type</th><th data-type="derivedMapping">URL, Key Value Pair or ID</th><th data-type="startDate">Start Date</th><th data-type="endDate">End Date</th><th>Actions</th></thead><tbody></tbody></table>');
    this.$rootEl.find('table thead th').not(':last').addClass('sortable').click(function(event) {
     var $this = $(this);
     $this.siblings().removeClass('desc asc');
     if ($this.hasClass('desc asc')) {
      $this.removeClass('desc asc');
     }
     that.collection = APP.collections.derived_collection;
     that.tableColumnHeaderClick(event);
     that.render();
    });
    this.$rootEl.find('table').delegate('td.actions a', 'click', function() {
     var $this = $(this),
         rel = $this.attr('rel'),
         relSplit = rel.split(',');
     if ($this.hasClass('edit')) {
      App.views.EditPage.helpers.runAddOrEditModal(true, relSplit[0], relSplit[1]);
     } else if ($this.hasClass('remove')) {
      App.views.EditPage.helpers.removeDestinationMapping($this.parents('tr'), relSplit[0], relSplit[1]);
     }
    });
   }
   this.$el = this.$rootEl.find('tbody');
   this.el = this.$el.get(0);
   this.$table_body = this.$el;
   if (APP.collections.derived_collection.length) {
    APP.collections.derived_collection.each(this.addOne);
   }
  },
  new_row: Backbone.View.extend({
   tagName: 'tr',
   template: _.template(APP.templates.destination_table_editable_row),
   render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
   }
  })
 });
 App.views.EditPage.helpers = {
  runAddOrEditModal: function(edit, destinationId, destinationMappingId, browseModel, browseModal) {
   var header = (edit ? 'Edit' : 'Add') + ' Destination',
       content = '',
       destSelected = edit || browseModel ? null : APP.views.EditPage.DestinationAutoComplete.getSelected(),
       types = {
        "PUSH": "URL",
        "S2S": "Server-to-Server",
        "ADS": "Cookie",
        "PULL": "Pull"
       },
       customContent = '',
       destModel, modal;
   if (!destSelected && !edit && !browseModel) {
    ADOBE.AM.alertBox({
     title: header,
     errorMsg: '<br />You have not selected a destination to add.',
     msg: ''
    });
    if (browseModal) {
     browseModal.hide();
    }
    return;
   }
   destModel = new ADOBE.AM.Destination.Models.SingleDestination({
    pid: ADOBE.AM.pid
   });
   destModel.set({
    id: edit ? destinationId : (browseModel ? browseModel.get('destinationId') : destSelected.get("destinationId"))
   });
   destModel.fetch({
    success: function(model) {
     var dest = model.toJSON(),
         dcj = {},
         isValidType = true,
         validator = {
          required: {
           startDate: ['date', 'Start Date']
          },
          optional: {
           endDate: ['date', 'End Date']
          },
          custom: function() {
           var attrs = this.attrs,
               errors = this.validationErrors,
               e = attrs.endDate,
               start, end;
           if (e != null && e != '') {
            start = Date.parse(attrs.startDate), end = Date.parse(e);
            if (!isNaN(start) && !isNaN(end) && end <= start) {
             errors.push('End Date must be later than Start Date');
            }
           }
          }
         },
         req = validator.required,
         opt = validator.optional;
     if (browseModal) {
      browseModal.hide();
     }
     if (edit) {
      var dcm = App.collections.derived_collection.where({
       destinationMappingId: parseInt(destinationMappingId, 10)
      });
      if (dcm && dcm[0]) {
       dcj = dcm[0].toJSON();
      }
     }
     var _tmp_dest = new ADOBE.AM.Destination.Models.Destination(destModel.attributes);
     var alias = null;
     var autoFillMappingEnabled = _tmp_dest.isAutoFillMappingEnabled();
     if (autoFillMappingEnabled) {
      if (_tmp_dest.isAutoFillSegmentId()) {
       alias = APP.models.ActiveSegment.get('sid');
      } else if (_tmp_dest.isAutoFillIntegrationCode()) {
       alias = APP.models.ActiveSegment.get('integrationCode');
      }
     }
     switch (dest.destinationType) {
      case "PUSH":
       if (dest.serializationEnabled) {
        customContent = '<tr><th>Destination Value:</th><td><input name="traitAlias" type="text" value="' + (dcj.traitAlias || '') + '" /></td></tr>';
        req.traitAlias = ['notEmpty', 'Destination Value'];
       } else {
        customContent = '<tr><th>URL:</th><td colspan="3"><textarea name="url" rows="5">' + (dcj.url || '') + '</textarea></td></tr><tr><th>Secure URL:</th><td colspan="3"><textarea name="secureUrl" rows="5">' + (dcj.secureUrl || '') + '</textarea></td></tr>';
        req.url = ['http', 'URL'];
        opt.secureUrl = ['https', 'Secure URL'];
       }
       break;
      case "S2S":
       var traitAlias = dcj.traitAlias || '';
       if (autoFillMappingEnabled) {
        traitAlias = alias;
       } else {
        req.traitAlias = ['notEmpty', 'Destination Value'];
       }
       customContent = '<tr' +
       (_tmp_dest.isBidManagerType() ? ' style="display:none">' : '>') +
       '<th>Destination Value:</th><td><input name="traitAlias" type="text" value="' +
       traitAlias +
       '" ' +
       (autoFillMappingEnabled ? 'disabled="disabled"' : '') + '/></td></tr>';
       break;
      case "ADS":
       var valueAlias = dcj.valueAlias || '';
       if (autoFillMappingEnabled) {
        valueAlias = alias;
       } else {
        req.valueAlias = ['notEmpty', 'Destination Value'];
       }
       if (typeof dest.singleKey == 'string' && dest.singleKey.length) {
        customContent = '<tr><th>Destination Value:</th><td><input name="valueAlias" type="text" value="' +
        valueAlias +
        '" ' +
        (autoFillMappingEnabled ? 'disabled="disabled"' : '') + '/></td></tr>';
       } else {
        customContent = '<tr class="multi"><th>Destination Mapping:</th><td><input name="traitAlias" type="text" value="' + (dcj.traitAlias || '') + '" /></td><td class="separator">' + dest.keySeparator + '</td><td><input name="valueAlias" type="text" value="' + valueAlias + '" ' + (autoFillMappingEnabled ? 'disabled="disabled"' : '') + '/></td></tr>';
        req.traitAlias = ['notEmpty', 'Destination Key'];
       }
       break;
      default:
       isValidType = false;
       break;
     }
     if (!isValidType) {
      ADOBE.AM.alertBox({
       title: header,
       errorMsg: '<br />Allowed destination types are URL, Server-to-Server, and Cookie',
       msg: ''
      });
      return;
     }
     content = '<form id="addDestinationForm"><table class="addDestination"><tbody><tr><th>Destination ID:</th><td colspan="3">' + dest.destinationId + '</td></tr><tr><th>Name:</th><td colspan="3">' + dest.name + '</td></tr><tr><th>Type:</th><td colspan="3">' + types[dest.destinationType] + '</td></tr>' + customContent + '<tr class="dates"><th>Publish from:</th><td><input name="startDate" type="text" class="date" value="' + (dcj.startDate || '') + '" /></td><td class="separator">to</td><td><input name="endDate" type="text" class="date" value="' + (dcj.endDate || '') + '" /></td></tr></tbody></table></form>';
     showModal(function() {
      var addDestinationForm = $('#addDestinationForm');
      var arr = addDestinationForm.serializeArray();
      var data = {};
      var savingModel = new ADOBE.AM.Destination.Models.SingleDestination();
      $.each(arr, function(i, item) {
       data[item.name] = item.value;
      });
      if (edit) {
       data.id = destinationMappingId;
      }
      data.sid = App.models.ActiveSegment.get('sid');
      data.traitType = ADOBE.AM.Segment.Models.Segment.segmentTraitType;
      var _tmp_dest = new ADOBE.AM.Destination.Models.Destination(destModel.attributes);
      if (_tmp_dest.isBidManagerType()) {
       delete validator.required.traitAlias;
      }
      data.validator = validator;
      savingModel.urlRoot = destModel.url() + '/mappings/';
      savingModel.set(data, {
       silent: true
      });
      if (savingModel.isValid()) {
       savingModel.unset('validator', {
        silent: true
       });
       var startDate = savingModel.get('startDate'),
           endDate = savingModel.get('endDate');
       startDate = new Date(startDate).toUTCString();
       savingModel.set({
        startDate: startDate
       }, {
        silent: true
       });
       if (endDate) {
        endDate = new Date(endDate).toUTCString();
        savingModel.set({
         endDate: endDate
        }, {
         silent: true
        });
       }
       savingModel.save()
           .done(function() {
            var ccd = App.collections.helpers.create_custom_destinations,
                $jqxhr = APP.models.ActiveSegment.getDestinations(true);
            $jqxhr.done(function() {
             ccd(APP.models.ActiveSegment.getDestinations());
             APP.views.EditPage.DestinationsTable.render();
            });
           })
           .fail(function(resp) {
            var errorReturned = "",
                errorMsgObj = null,
                message = "",
                alertObj = null;
            errorReturned = JSON.parse(resp.responseText);
            message = typeof errorReturned.code != "undefined" ? ADOBE.AM.MESSAGES.getMessage(errorReturned.code).message : errorReturned.message;
            ADOBE.AM.alertBox({
             title: header,
             errorMsg: message,
             msg: ''
            });
           })
           .always(function() {
            modal.customHide();
           });
      } else {
       ADOBE.AM.alertBox({
        title: header,
        errorMsg: '<br />\n' + savingModel.validationErrors.join('<br />\n'),
        msg: ''
       });
      }
     });
    },
    error: function() {
     ADOBE.AM.alertBox({
      title: header,
      errorMsg: '<br />Error retrieving destination data',
      msg: ''
     });
     if (browseModal) {
      browseModal.hide();
     }
    }
   });

   function showModal(handleOk) {
    var div = document.createElement('div'),
        okButton = document.createElement('button'),
        cancelButton = document.createElement('button');
    modal = new AUI.Dialog({
     header: header,
     content: content,
     width: '467px',
     footer: div,
     center: true
    }).render();
    modal.customHide = function() {
     var $ac = APP.views.EditPage.DestinationAutoComplete.$el;
     $('#addDestinationForm table.addDestination .date').datepicker_old('destroy');
     $('#ui-datepicker-div').hide();
     $(this.el('content')).empty();
     $('#addDestinationForm').removeAttr('id');
     $ac.val('');
     $ac.data('item', null);
     this.hide();
    };
    okButton.className = 'primary';
    okButton.innerHTML = 'Save';
    cancelButton.innerHTML = 'Cancel';
    div.appendChild(okButton);
    div.appendChild(cancelButton);
    AUI.addListener(okButton, 'click', function() {
     if (typeof handleOk == 'function') {
      handleOk();
     }
    }, modal);
    AUI.addListener(cancelButton, 'click', function() {
     modal.customHide();
    }, modal);
    $('#addDestinationForm table.addDestination .date').datepicker_old({
     dateFormat: 'mm/dd/yy',
     minDate: 0,
     showOn: 'both',
     buttonImage: '/portal/images/adobe_ui/icons/calendar.png',
     buttonImageOnly: true
    });
    var $sd = $('#addDestinationForm table.addDestination input[name=startDate]');
    if (!$sd.val()) {
     $sd.datepicker_old('setDate', new Date());
    }
    modal.show();
   }
  },
  runBulkAddModal: function() {
   var header = 'Add Segments to Destination',
       types = ['', 'URL', 'Pull', 'Cookie**', 'Server-to-Server', 'Cookie', 'Bulk Server-to-Server'],
       content = '',
       thead = '',
       customThead = '',
       tr = '',
       customTr = '',
       modal;
   App.dialogs.destinations_modal.destModelFull = new ADOBE.AM.Destination.Models.SingleDestination({
    pid: ADOBE.AM.pid
   });
   App.dialogs.destinations_modal.destModelFull.set({
    id: App.dialogs.destinations_modal.destModel.get('destinationId')
   });
   App.dialogs.destinations_modal.destModelFull.fetch({
    success: function(model) {
     App.dialogs.destinations_modal.validator = {
      required: {
       startDate: ['date', 'Start Date']
      },
      optional: {
       endDate: ['date', 'End Date']
      },
      custom: function() {
       var attrs = this.attrs,
           errors = this.validationErrors,
           e = attrs.endDate,
           start, end;
       if (e != null && e != '') {
        start = Date.parse(attrs.startDate), end = Date.parse(e);
        if (!isNaN(start) && !isNaN(end) && end <= start) {
         errors.push('End Date must be later than Start Date');
        }
       }
      }
     };
     var dest = model.toJSON(),
         dcj = {},
         isValidType = true,
         req = App.dialogs.destinations_modal.validator.required,
         opt = App.dialogs.destinations_modal.validator.optional;
     App.dialogs.destinations_modal.hide();
     var _tmp_dest = new ADOBE.AM.Destination.Models.Destination(dest);
     var alias = null;
     var autoFillMappingEnabled = _tmp_dest.isAutoFillMappingEnabled();
     if (autoFillMappingEnabled) {
      if (_tmp_dest.isAutoFillSegmentId()) {
       alias = APP.models.ActiveSegment.get('sid');
      } else if (_tmp_dest.isAutoFillIntegrationCode()) {
       alias = APP.models.ActiveSegment.get('integrationCode');
      }
     }
     switch (dest.destinationType) {
      case "PUSH":
       if (dest.serializationEnabled) {
        customThead = '<th>Destination Value</th>';
        customTr = '<td><input name="<@= sid @>_traitAlias" type="text" /></td>';
        req.traitAlias = ['notEmpty', 'Destination Value'];
       } else {
        customThead = '<th>URL</th><th>Secure URL</th>';
        customTr = '<td><textarea name="<@= sid @>_url" rows="5"></textarea></td><td><textarea name="<@= sid @>_secureUrl" rows="5"></textarea></td>';
        req.url = ['http', 'URL'];
        opt.secureUrl = ['https', 'Secure URL'];
       }
       break;
      case "S2S":
       if (!_tmp_dest.isBidManagerType()) {
        var traitAlias = autoFillMappingEnabled ? alias : '';
        customThead = '<th>Destination Value</th>';
        customTr = '<td><input name="<@= sid @>_traitAlias" type="text" value="' +
        traitAlias +
        '" ' +
        (autoFillMappingEnabled ? 'disabled="disabled"' : '') +
        ' /></td>';
        req.traitAlias = ['notEmpty', 'Destination Value'];
       }
       break;
      case "ADS":
       var valueAlias = autoFillMappingEnabled ? alias : (dcj.valueAlias || '');
       req.valueAlias = ['notEmpty', 'Destination Value'];
       if (typeof dest.singleKey == 'string' && dest.singleKey.length) {
        customThead = '<th>Destination Value</th>';
        customTr = '<td><input name="<@= sid @>_valueAlias" type="text" value="' +
        valueAlias +
        '" ' +
        (autoFillMappingEnabled ? 'disabled="disabled"' : '') + '/></td>';
       } else {
        customThead = '<th colspan="3">Destination Mapping:</th>';
        customTr = '<td><input name="<@= sid @>_traitAlias" type="text" /></td><td class="separator">' + App.dialogs.destinations_modal.destModelFull.get('keySeparator') + '</td><td><input name="<@= sid @>_valueAlias" type="text" value="' + valueAlias + '" ' + (autoFillMappingEnabled ? 'disabled="disabled"' : '') + '/></td>';
        req.traitAlias = ['notEmpty', 'Destination Key'];
       }
       break;
      default:
       isValidType = false;
       break;
     }
     if (!isValidType) {
      ADOBE.AM.alertBox({
       title: header,
       errorMsg: '<br />Allowed destination types are URL, Server-to-Server, and Cookie',
       msg: ''
      });
      return;
     }
     thead = '<tr><th>Segment Name</th><th>Segment ID</th><th>Description</th>' + customThead + '<th class="dateTh">Start Date</th><th class="dateTh">End Date</th><th>Action</th>';
     tr = '<tr><td><@= name @></td><td><@= sid @></td><td><@= description @></td>' + customTr + '<td><input name="<@= sid @>_startDate" type="text" class="date" /></td><td><input name="<@= sid @>_endDate" type="text" class="date" /></td><td><img src="/css/aam/images/12x12/ClearXGrey_Buttcon.png" title="Remove" alt="Remove" class="remove"></td></tr>';
     App.dialogs.destinations_modal.sidsToAddToDestination = [];
     $.each(App.dialogs.destinations_modal.segmentsToAddToDestination, function(i, model) {
      content += _.template(tr, model.toJSON());
      App.dialogs.destinations_modal.sidsToAddToDestination.push(model.get('sid'));
     });
     content = '<form id="addSegmentsToDestinationForm"><table class="addSegments table" cellpadding="3" border="1"><thead>' + thead + '</thead><tbody>' + content + '</tbody></table></form>';
     showModal(function() {
      var arr = $('#addSegmentsToDestinationForm').serializeArray(),
          dataArr = [],
          validationErrors = {},
          hasValidationErrors = false,
          validatingModel;
      if ($('#addSegmentsToDestinationForm table.addSegments tbody tr:first td:first').html() == 'No data available in table') {
       ADOBE.AM.alertBox({
        title: header,
        errorMsg: '<br />\nNo data available in table',
        msg: ''
       });
       App.dialogs.bulkAddSegmentsModal.customHide();
       return;
      }
      $.each(App.dialogs.destinations_modal.sidsToAddToDestination, function(i, sid) {
       var pattern = new RegExp(sid + '_'),
           data = {
            sid: sid,
            traitType: ADOBE.AM.Segment.Models.Segment.segmentTraitType,
            validator: App.dialogs.destinations_modal.validator
           };
       $.each(arr, function(j, item) {
        var name = item.name;
        if (pattern.test(name)) {
         name = name.replace(pattern, '');
         data[name] = item.value;
        }
       });
       dataArr.push(data);
      });
      $.each(dataArr, function(i, data) {
       var dataIsValid = true;
       validatingModel = new ADOBE.AM.Destination.Models.SingleDestination({});
       validatingModel.set(data, {
        silent: true
       });
       if (!validatingModel.isValid()) {
        hasValidationErrors = true;
        dataIsValid = false;
        $.each(validatingModel.validationErrors, function(j, error) {
         validationErrors[encodeURIComponent(error)] = true;
        });
       }
       if (dataIsValid) {
        data.startDate = new Date(data.startDate).toUTCString();
        if (data.endDate) {
         data.endDate = new Date(data.endDate).toUTCString();
        }
       }
       delete data.validator;
      });
      if (hasValidationErrors) {
       var errors = '<br />\n',
           error;
       for (error in validationErrors) {
        if (validationErrors.hasOwnProperty(error)) {
         errors += decodeURIComponent(error) + '<br />\n';
        }
       }
       ADOBE.AM.alertBox({
        title: header,
        errorMsg: errors,
        msg: ''
       });
       return;
      }
      $.ajax({
       url: ADOBE.AM.API.DESTINATION.destination.bulkUrl(App.dialogs.destinations_modal.destModelFull.get('destinationId')),
       type: "POST",
       dataType: "json",
       contentType: "application/json",
       data: JSON.stringify(dataArr)
      })
          .done(function() {
           try {
            ADOBE.AM.alertBox({
             title: ADOBE.AM.MESSAGES.getMessage('saved').message,
             msg: ADOBE.AM.MESSAGES.getMessage('segment_added_to_destination').message
            });
           } catch (__err) {
            ADOBE.AM.UTILS.LOGGER.log(__err.message);
           }
          })
          .fail(function(resp) {
           var errorMessage = JSON.parse(resp.responseText);
           ADOBE.AM.alertBox({
            title: header,
            errorMsg: errorMessage.message,
            msg: ''
           });
          })
          .always(function() {
           App.dialogs.bulkAddSegmentsModal.customHide();
          });
     });
    },
    error: function() {
     ADOBE.AM.alertBox({
      title: header,
      errorMsg: '<br />Error retrieving destination data',
      msg: ''
     });
    }
   });

   function showModal(handleOk) {
    var div = document.createElement('div'),
        okButton = document.createElement('button'),
        cancelButton = document.createElement('button'),
        modal;

    function initTable() {
     $('#addSegmentsToDestinationForm table.addSegments .date').datepicker_old({
      dateFormat: 'mm/dd/yy',
      minDate: 0,
      showOn: 'both',
      buttonImage: '/portal/images/adobe_ui/icons/calendar.png',
      buttonImageOnly: true
     });
     var sd = /_startDate/;

     $('#addSegmentsToDestinationForm table.addSegments input').each(function() {
      var $this = $(this);
      if (sd.test($this.attr('name'))) {
       $this.datepicker_old('setDate', new Date());
      }
     });
     $('#addSegmentsToDestinationForm table.addSegments').delegate('img.remove', 'click', function() {
      var $this = $(this),
          $table = $this.parents('table.addSegments'),
          colspan;
      $this.parents('tr').remove();
      if (!$table.find('tbody tr').length) {
       colspan = $table.find('thead th').length;
       $table.find('tbody').append('<tr><td colspan="' + colspan + '">No data available in table</td></tr>');
      }
     });
    }
    if (!App.dialogs.bulkAddSegmentsModal) {
     App.dialogs.bulkAddSegmentsModal = new AUI.Dialog({
      header: header,
      content: content,
      width: '1052px',
      footer: div,
      center: true
     });
     App.dialogs.bulkAddSegmentsModal.render();
     App.dialogs.bulkAddSegmentsModal.customHide = function() {
      $('#addSegmentsToDestinationForm table.addSegments .date').datepicker_old('destroy');
      $('#ui-datepicker-div').hide();
      $(this.el('content')).empty();
      this.hide();
     };
     modal = App.dialogs.bulkAddSegmentsModal;
     okButton.className = 'primary';
     okButton.innerHTML = 'Save';
     cancelButton.innerHTML = 'Cancel';
     div.appendChild(okButton);
     div.appendChild(cancelButton);
     AUI.addListener(okButton, 'click', function() {
      if (typeof handleOk == 'function') {
       handleOk();
      }
     }, modal);
     AUI.addListener(cancelButton, 'click', function() {
      modal.customHide();
     }, modal);
     initTable();
    } else {
     App.dialogs.bulkAddSegmentsModal.append('content', content);
     initTable();
     modal = App.dialogs.bulkAddSegmentsModal;
    }
    modal.show();
   }
  },
  removeDestinationMapping: function($tr, destinationId, destinationMappingId) {
   var that = this,
       div = document.createElement('div'),
       okButton = document
           .createElement('button'),
       cancelButton = document
           .createElement('button');
   okButton.className = 'primary';
   okButton.innerHTML = 'OK';
   cancelButton.innerHTML = 'Cancel';
   div.appendChild(okButton);
   div.appendChild(cancelButton);
   var modal = new AUI.Dialog({
        header: 'Confirmation',
        content: '<p>Are you sure you want to remove this destination mapping?</p>',
        width: 'auto',
        height: 'auto',
        footer: div,
        center: true
       }).render(),
       model = new ADOBE.AM.Destination.Models.SingleDestination({
        pid: ADOBE.AM.pid
       });
   model.set({
    id: destinationId
   }, {
    silent: true
   });
   model.urlRoot = model.url() + '/mappings/';
   model.set({
    id: destinationMappingId
   }, {
    silent: true
   });
   var modelToRemove = null;
   var dests = APP.collections.derived_collection;
   dests.each(function(item, iter, list) {
    if (item.get('destinationMappingId') == destinationMappingId) {
     modelToRemove = item;
    }
   });
   AUI.addListener(okButton, 'click', function() {
    model.destroy({
     success: function() {
      $tr.remove();
      modal.hide();
      if (modelToRemove) {
       dests.remove(modelToRemove);
      }
      Mediator.broadcast("DestinationMappingRemoved");
     },
     error: function(obj, textStatus, errorThrown) {
      modal.hide();
      ADOBE.AM.alertBox({
       title: 'Remove Destination Mapping',
       errorMsg: '<br />An error occurred.',
       msg: errorThrown
      });
     }
    });
   }, modal);
   AUI.addListener(cancelButton, 'click', modal.hide, modal);
   modal.show();
  }
 };
 App.views.EditPage.DestinationsToolbar = new AAM.Widget.Views.DestinationsToolbar({
  render: function(el) {
   var $el = $(el),
       destModel;
   this.el = el;
   $el.append('<div class="destinationsToolbar"><strong>Search by Destination</strong><div><input class="autocomplete" type="text"/><button class="primary task addDestination">Add Destination</button><span>|</span> <button class="primary task browseDestinations">Browse All Destinations</button></div></div>');
   $el.delegate('button.addDestination', 'click', function() {
    App.views.EditPage.helpers.runAddOrEditModal();
   });
   $el.delegate('button.browseDestinations', 'click', function() {
    if (App.dialogs.destinations_modal) {
     App.dialogs.destinations_modal.mediatorRequest = 'add_destination';
    }
    Mediator.broadcast('BrowseAllDestinationsModal', {
     request: 'add_destination'
    });
   });
   var destinationsAutoComplete = new ADOBE.AM.Destination.Collections.Destinations();
   destinationsAutoComplete.addQueryStringArgs({
    page: 0,
    pageSize: 10,
    includeMetrics: true
   });
   APP.views.EditPage.DestinationAutoComplete = new ADOBE.AM.Widget.Views.Autocomplete({
    collection: destinationsAutoComplete,
    getById: 'destinationId',
    el: $el.find('.autocomplete'),
    hook_format_response: function(item) {
     var obj = {
      value: ADOBE.AM.UTILS.HELPERS.decodeHTMLEntities(item.name)
     };
     return _.extend(item, obj);
    }
   });
  }
 });
 App.views.EditPage.Destinations = new AAM.Widget.Views.Accordion({
  title: 'Destinations Mapping',
  parent: 'seDestinations',
  sub_views: {
   destinations_table: App.views.EditPage.DestinationsTable,
   destinations_toolbar: APP.views.EditPage.DestinationsToolbar
  },
  aui_args: {
   expanded: false
  },
  help: 'r_segment_destinations_map.html'
 });
 App.views.SegmentEdit = new AAM.Segment.Views.SegmentPage({
  el: $('#SegmentEdit'),
  model: App.models.ActiveSegment,
  sub_views: {
   basic_info_accordion: App.views.EditPage.BasicInfo,
   trait_accordion: App.views.EditPage.Traits,
   dest_accordion: App.views.EditPage.Destinations
  },
  view_functions: {
   setAccordionEnabled: function(args) {
    if (args && args.accordions) {
     var obj = args.accordions;
     for (var prop in args.accordions) {
      if (obj.hasOwnProperty(prop)) {
       try {
        this.sub_views[prop].panel.set('expanded', obj[prop]);
       } catch (__ERR__) {
        ADOBE.AM.UTILS.LOGGER.log("App.views.SegmentEdit:setAccordionEnabled: " + __ERR__);
       }
      }
     }
    } else {
     this.sub_views.basic_info_accordion.panel.set('expanded', true);
     this.sub_views.trait_accordion.panel.set('expanded', false);
     this.sub_views.dest_accordion.panel.set('expanded', false);
     this.sub_views.dest_accordion.panel.set('enabled', true);
    }
    var container = this.sub_views.dest_accordion.panel.el('container');
    $(container).find(".dest_accordion").remove();
   },
   setAccordionDisabled: function(acc, message) {
    var accordion = null,
        aui_acc_container = null,
        overlay_div = document.createElement('div');
    accordion = this.sub_views[acc].panel;
    message = message || 'segment_must_be_saved';
    if (accordion == null) {
     ADOBE.AM.UTILS.LOGGER.log("setAccordionDisabled: " + acc + " not defined");
     return false;
    }
    overlay_div.style.cssText = 'position:absolute;height:28px;width:100%';
    overlay_div.className = 'blocker_div ' + acc;
    accordion.set('enabled', false);
    aui_acc_container = accordion.el('container');
    if (aui_acc_container == null) {
     ADOBE.AM.UTILS.LOGGER.log("App.views.SegmentEdit:view_functions:setAccordionDisabled: " + acc + " not defined");
    }
    $(aui_acc_container).prepend(overlay_div);
    $(overlay_div).click(function() {
     var model_content = "",
         div = document.createElement('div'),
         okButton = document.createElement('button');
     model_content = ADOBE.AM.MESSAGES.getMessage(message).message;
     okButton.className = 'primary';
     okButton.innerHTML = 'OK';
     div.appendChild(okButton);
     var modal = new AUI.Dialog({
      header: 'Errors',
      content: "<p>" + model_content + "<\p>",
      width: '300px',
      height: '200px',
      footer: div,
      center: true
     }).render().show();
     AUI.addListener(okButton, 'click', modal.hide, modal);
     return false;
    });
   },
   eventCancel: function() {
    var sid = this.model.get('sid'),
        path = "";
    this.setAccordionEnabled();
    path = sid ? 'view/' + sid : 'list';
    App.routers.AppRouter.navigate(path, {
     trigger: true
    });
   },
   eventSaveSegment: function(event) {
    var that = this,
        success_cb = null,
        $element = null,
        data_to_save = {},
        savingModal = null,
        $form = null;
    var errorDialog = function(messages) {
     var model_content = "",
         model_content = '<p>There were errors trying to save this Segment';
     if (messages) {
      model_content += ':<br />' + messages;
     }
     model_content += '.</p>';
     ADOBE.AM.AlertModal({
      header: 'Errors',
      message: model_content
     });
     if (savingModal) {
      $(savingModal.el('container')).fadeOut('fast', function() {
       $(this).remove();
       delete savingModal;
      });
     }
    };
    $element = $(event.currentTarget);
    if (this.sub_views.basic_info_accordion.$el) {
     $form = this.sub_views.basic_info_accordion.$el.find('form');
    } else {
     ADOBE.AM.UTILS.LOGGER.log("Accordion Panel not rendered appropriately which is causing us not to grab the form in Basic Information");
     return false;
    }
    if ($form.length == 0) {
     ADOBE.AM.UTILS.LOGGER.log("No form found on Edit page");
     return false;
    }
    _.each($form.serializeArray(), function(item) {
     data_to_save[item.name] = item.value;
    });
    try {
     var $node = this.sub_views.basic_info_accordion.sub_views.folder_tree.getSelectedNode();
     if ($node.length < 1) {
      throw Error();
     }
     var matches = $node.attr("id").match(/^\d+/);

     if (matches == null) {
      throw Error();
     }
     data_to_save.folderId = matches[0];
    } catch (__FOLDER_ERROR__) {
     ADOBE.AM.UTILS.LOGGER
         .log("Error finding folder selection on Edit Page");
    }
    data_to_save.segmentRule = $('#segment_expression').val();
    this.model.set(data_to_save, {
     silent: true
    });
    if (!this.model.isValid()) {
     errorDialog(this.model.errors.join('<br />'));
     return false;
    } else {
     var saveMode = this.model.isNew() ? "segment" : "edits";
     savingModal = new AUI.Dialog({
      content: '<div class="AUI_Alert">' +
      '<div class="AUI_Alert_Icon AUI_Alert_Icon_Loading"></div>' +
      '<div class="AUI_Notification_Container">' +
      '<span class="AUI_Alert_Content">Saving ' + saveMode + '...</span>' +
      '</div>' +
      '</div>',
      width: '200px',
      height: '100px'
     }).render().show();
     $(savingModal.el('container')).attr({
      id: 'loadingAlertBox'
     });
    }
    $element.addClass("disabled");
    if (this.model.isNew()) {
     success_cb = function() {
      App.routers.AppRouter.navigate('view/' + that.model.get('sid'), {
       trigger: true,
       replace: true
      });
      that.setAccordionEnabled({
       accordions: {
        basic_info_accordion: false,
        trait_accordion: false,
        dest_accordion: true
       }
      });
      that.sub_views.basic_info_accordion.render();
      if (savingModal) {
       $(savingModal.el('container')).fadeOut('fast', function() {
        $(this).remove();
        delete savingModal;
       });
      }
      modal.hide();
     };
    } else {
     success_cb = function() {
      App.routers.AppRouter.navigate('view/' + that.model.get('sid'), {
       trigger: true,
       replace: true
      });
      that.setAccordionEnabled();
      that.sub_views.basic_info_accordion.render();
      modal.hide();
      if (savingModal) {
       $(savingModal.el('container')).fadeOut('fast', function() {
        $(this).remove();
        delete savingModal;
       });
      }
      return;
     };
    }
    this.model
        .save()
        .done(success_cb)
        .fail(function(resp) {
         errorDialog(ADOBE.AM.MESSAGES.getAPIErrorMessage(resp, {
          defaultMessage: 'There was an error in saving the segment.'
         }));
        })
        .always(function() {
         $element.removeClass("disabled");
        });
   }
  },
  events: {
   "click .save": "eventSaveSegment",
   "click .cancel": "eventCancel"
  }
 });
 Mediator.add('APP.views.EditPage', {
  onActiveSegmentLoaded: function() {
   if (App.gateKeeper.checkPermissions([App.User.permissions, App.models.ActiveSegment.relational.permissions], 'can_edit_segment_in_segmentbuilder')) {
    App.User.has_edit_permissions = true;
   }
   try {
    if (!App.User.has_edit_permissions_for_editpage()) {
     APP.views.SegmentEdit.sub_views.basic_info_accordion.panel.set('expanded', false);
     APP.views.SegmentEdit.setAccordionDisabled('basic_info_accordion', 'access_denied_no_edit_permissions_for_segment');
     APP.views.SegmentEdit.sub_views.trait_accordion.panel.set('expanded', false);
     APP.views.SegmentEdit.setAccordionDisabled('trait_accordion', 'access_denied_no_edit_permissions_for_segment');
    } else {
     APP.views.SegmentEdit.sub_views.basic_info_accordion.panel.set('enabled', true);
     APP.views.SegmentEdit.sub_views.trait_accordion.panel.set('enabled', true);
    }
   } catch (_e) {
    ADOBE.AM.UTILS.LOGGER.log("APP.views.EditPage : onActiveSegmentLoaded" + _e.message);
   }
   App.models.ActiveSegment.getFolder(function() {
    APP.views.EditPage.BasicInfo.sub_views.basic_info.render();
    APP.views.EditPage.BasicInfo.sub_views.basic_info.renderDataSources();
    var folderId = App.models.ActiveSegment.getFolderModelProp('folderId');
    if (folderId !== false) {
     App.views.EditPage.SegmentFolderTree.selectNode(folderId);
    }
   });
   var $btn = $('.segment_expression .reset_and_return');
   if (App.models.ActiveSegment.get('codeViewOnly')) {
    App.views.EditPage.trait_tabs.showAllTraits();
    $btn.addClass("disabled");
    $btn.off("click")
   } else {
    App.views.EditPage.trait_tabs.showAllTraits();
    $btn.removeClass("disabled");
    $btn.on("click", function() {
     $('#segment_expression').val(SegmentBuilderWidget.segment_expression);
     $(App.views.EditPage.trait_tabs.tab_tabs[0]).trigger("click");
    });
   }
   var datasourcesDeferred = APP.collections.EditPage.DataSources.fetch({
        data: {
         firstPartyOnly: true
        }
       }),
       traitfoldersDeferred = APP.collections.TraitFolders.fetch();
   var destinationsDeferred = APP.models.ActiveSegment.getDestinations();
   var create_custom_destinations = App.collections.helpers.create_custom_destinations;
   if (destinationsDeferred instanceof Backbone.Collection) {
    create_custom_destinations(destinationsDeferred);
    $.when(datasourcesDeferred, traitfoldersDeferred).done(function() {
     if (!App.User.has_edit_permissions_for_editpage()) {
      APP.views.SegmentEdit.sub_views.dest_accordion.panel.set('enabled', true);
      APP.views.SegmentEdit.sub_views.dest_accordion.panel.set('expanded', true);
     }
     Mediator.broadcast("UnblockUIRequested");
     ADOBE.AM.UTILS.HELPERS.bindContextHelp();
    });
   } else {
    $.when(datasourcesDeferred, traitfoldersDeferred, destinationsDeferred).done(function() {
     create_custom_destinations(App.models.ActiveSegment.getDestinations());
     APP.views.EditPage.DestinationsTable.render();
     if (!App.User.has_edit_permissions_for_editpage()) {
      APP.views.SegmentEdit.sub_views.dest_accordion.panel.set('enabled', true);
      APP.views.SegmentEdit.sub_views.dest_accordion.panel.set('expanded', true);
     }
     Mediator.broadcast("UnblockUIRequested");
     ADOBE.AM.UTILS.HELPERS.bindContextHelp();
    });
   }
  }
 });
 App.routers.AppRouter = new AAM.Segment.Routers.AppRouter({
  pages: {
   list_page: App.views.SegmentList,
   view_page: App.views.SegmentView,
   new_page: App.views.SegmentNew,
   cloned_page: App.views.SegmentCloned,
   edit_page: App.views.SegmentEdit
  }
 });
 if (!Backbone.History.started) {
  Backbone.history.start();
 }
 App.dialogs.aui_alert = AUI.Alert({
  parent: 'alert_loading',
  type: 'loading',
  label: '',
  message: "Loading data"
 }).render();
 App.dialogs.aui_alert.hide();
 if (App.routers.AppRouter.isListPage()) {
  App.views.SearchBar.triggerSearch();
 }
 APP.collections.TraitFolders = new ADOBE.AM.Trait.Collections.Folders();
 ADOBE.AM.UTILS.HELPERS.bindContextHelp();
});