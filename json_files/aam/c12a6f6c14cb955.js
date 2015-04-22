(function (definition) {if (typeof define =="function") {define(definition);} else {definition();}
})(function () {if (!Function.prototype.bind) {Function.prototype.bind =function bind(that) {var target =this;if (typeof target !="function") {throw new TypeError("Function.prototype.bind called on incompatible "+ target);}
 var args =slice.call(arguments,1);var bound =function () {if (this instanceof bound) {var F =function(){};F.prototype =target.prototype;var self =new F;var result =target.apply(self,args.concat(slice.call(arguments))
 );if (Object(result) ===result) {return result;}
 return self;} else {return target.apply(that,args.concat(slice.call(arguments))
 );}
 };return bound;};}
var call =Function.prototype.call;var prototypeOfArray =Array.prototype;var prototypeOfObject =Object.prototype;var slice =prototypeOfArray.slice;var _toString =call.bind(prototypeOfObject.toString);var owns =call.bind(prototypeOfObject.hasOwnProperty);var defineGetter;var defineSetter;var lookupGetter;var lookupSetter;var supportsAccessors;if ((supportsAccessors =owns(prototypeOfObject,"__defineGetter__"))) {defineGetter =call.bind(prototypeOfObject.__defineGetter__);defineSetter =call.bind(prototypeOfObject.__defineSetter__);lookupGetter =call.bind(prototypeOfObject.__lookupGetter__);lookupSetter =call.bind(prototypeOfObject.__lookupSetter__);}
if (!Array.isArray) {Array.isArray =function isArray(obj) {return _toString(obj) =="[object Array]";};}
if (!Array.prototype.forEach) {Array.prototype.forEach =function forEach(fun ) {var self =toObject(this),thisp =arguments[1],i =-1,length =self.length >>> 0;if (_toString(fun) !="[object Function]") {throw new TypeError();}
 while (++i < length) {if (i in self) {fun.call(thisp,self[i],i,self);}
 }
 };}
if (!Array.prototype.map) {Array.prototype.map =function map(fun ) {var self =toObject(this),length =self.length >>> 0,result =Array(length),thisp =arguments[1];if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 for (var i =0;i < length;i++) {if (i in self)
 result[i] =fun.call(thisp,self[i],i,self);}
 return result;};}
if (!Array.prototype.filter) {Array.prototype.filter =function filter(fun ) {var self =toObject(this),length =self.length >>> 0,result =[],value,thisp =arguments[1];if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 for (var i =0;i < length;i++) {if (i in self) {value =self[i];if (fun.call(thisp,value,i,self)) {result.push(value);}
 }
 }
 return result;};}
if (!Array.prototype.every) {Array.prototype.every =function every(fun ) {var self =toObject(this),length =self.length >>> 0,thisp =arguments[1];if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 for (var i =0;i < length;i++) {if (i in self &&!fun.call(thisp,self[i],i,self)) {return false;}
 }
 return true;};}
if (!Array.prototype.some) {Array.prototype.some =function some(fun ) {var self =toObject(this),length =self.length >>> 0,thisp =arguments[1];if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 for (var i =0;i < length;i++) {if (i in self &&fun.call(thisp,self[i],i,self)) {return true;}
 }
 return false;};}
if (!Array.prototype.reduce) {Array.prototype.reduce =function reduce(fun ) {var self =toObject(this),length =self.length >>> 0;if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 if (!length &&arguments.length ==1) {throw new TypeError('reduce of empty array with no initial value');}
 var i =0;var result;if (arguments.length >=2) {result =arguments[1];} else {do {if (i in self) {result =self[i++];break;}
 if (++i >=length) {throw new TypeError('reduce of empty array with no initial value');}
 } while (true);}
 for (;i < length;i++) {if (i in self) {result =fun.call(void 0,result,self[i],i,self);}
 }
 return result;};}
if (!Array.prototype.reduceRight) {Array.prototype.reduceRight =function reduceRight(fun ) {var self =toObject(this),length =self.length >>> 0;if (_toString(fun) !="[object Function]") {throw new TypeError(fun + " is not a function");}
 if (!length &&arguments.length ==1) {throw new TypeError('reduceRight of empty array with no initial value');}
 var result,i =length - 1;if (arguments.length >=2) {result =arguments[1];} else {do {if (i in self) {result =self[i--];break;}
 if (--i < 0) {throw new TypeError('reduceRight of empty array with no initial value');}
 } while (true);}
 do {if (i in this) {result =fun.call(void 0,result,self[i],i,self);}
 } while (i--);return result;};}
if (!Array.prototype.indexOf) {Array.prototype.indexOf =function indexOf(sought ) {var self =toObject(this),length =self.length >>> 0;if (!length) {return -1;}
 var i =0;if (arguments.length > 1) {i =toInteger(arguments[1]);}
 i =i >=0 ?i :Math.max(0,length + i);for (;i < length;i++) {if (i in self &&self[i] ===sought) {return i;}
 }
 return -1;};}
if (!Array.prototype.lastIndexOf) {Array.prototype.lastIndexOf =function lastIndexOf(sought ) {var self =toObject(this),length =self.length >>> 0;if (!length) {return -1;}
 var i =length - 1;if (arguments.length > 1) {i =Math.min(i,toInteger(arguments[1]));}
 i =i >=0 ?i :length - Math.abs(i);for (;i >=0;i--) {if (i in self &&sought ===self[i]) {return i;}
 }
 return -1;};}
if (!Object.getPrototypeOf) {Object.getPrototypeOf =function getPrototypeOf(object) {return object.__proto__ ||(object.constructor
 ?object.constructor.prototype
 :prototypeOfObject
 );};}
if (!Object.getOwnPropertyDescriptor) {var ERR_NON_OBJECT ="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor =function getOwnPropertyDescriptor(object,property) {if ((typeof object !="object"&&typeof object !="function") ||object ===null) {throw new TypeError(ERR_NON_OBJECT + object);}
 if (!owns(object,property)) {return;}
 var descriptor ={enumerable:true,configurable:true };if (supportsAccessors) {var prototype =object.__proto__;object.__proto__ =prototypeOfObject;var getter =lookupGetter(object,property);var setter =lookupSetter(object,property);object.__proto__ =prototype;if (getter ||setter) {if (getter) {descriptor.get =getter;}
 if (setter) {descriptor.set =setter;}
 return descriptor;}
 }
 descriptor.value =object[property];return descriptor;};}
if (!Object.getOwnPropertyNames) {Object.getOwnPropertyNames =function getOwnPropertyNames(object) {return Object.keys(object);};}
if (!Object.create) {Object.create =function create(prototype,properties) {var object;if (prototype ===null) {object ={"__proto__":null };} else {if (typeof prototype !="object") {throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");}
 var Type =function () {};Type.prototype =prototype;object =new Type();object.__proto__ =prototype;}
 if (properties !==void 0) {Object.defineProperties(object,properties);}
 return object;};}
function doesDefinePropertyWork(object) {try {Object.defineProperty(object,"sentinel",{});return "sentinel"in object;} catch (exception) {}
}
if (Object.defineProperty) {var definePropertyWorksOnObject =doesDefinePropertyWork({});var definePropertyWorksOnDom =typeof document =="undefined"||doesDefinePropertyWork(document.createElement("div"));if (!definePropertyWorksOnObject ||!definePropertyWorksOnDom) {var definePropertyFallback =Object.defineProperty;}
}
if (!Object.defineProperty ||definePropertyFallback) {var ERR_NON_OBJECT_DESCRIPTOR ="Property description must be an object: ";var ERR_NON_OBJECT_TARGET ="Object.defineProperty called on non-object: ";var ERR_ACCESSORS_NOT_SUPPORTED ="getters & setters can not be defined "+
 "on this javascript engine";Object.defineProperty =function defineProperty(object,property,descriptor) {if ((typeof object !="object"&&typeof object !="function") ||object ===null) {throw new TypeError(ERR_NON_OBJECT_TARGET + object);}
 if ((typeof descriptor !="object"&&typeof descriptor !="function") ||descriptor ===null) {throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);}
 if (definePropertyFallback) {try {return definePropertyFallback.call(Object,object,property,descriptor);} catch (exception) {}
 }
 if (owns(descriptor,"value")) {if (supportsAccessors &&(lookupGetter(object,property) ||lookupSetter(object,property)))
 {var prototype =object.__proto__;object.__proto__ =prototypeOfObject;delete object[property];object[property] =descriptor.value;object.__proto__ =prototype;} else {object[property] =descriptor.value;}
 } else {if (!supportsAccessors) {throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);}
 if (owns(descriptor,"get")) {defineGetter(object,property,descriptor.get);}
 if (owns(descriptor,"set")) {defineSetter(object,property,descriptor.set);}
 }
 return object;};}
if (!Object.defineProperties) {Object.defineProperties =function defineProperties(object,properties) {for (var property in properties) {if (owns(properties,property) &&property !="__proto__") {Object.defineProperty(object,property,properties[property]);}
 }
 return object;};}
if (!Object.seal) {Object.seal =function seal(object) {return object;};}
if (!Object.freeze) {Object.freeze =function freeze(object) {return object;};}
try {Object.freeze(function () {});} catch (exception) {Object.freeze =(function freeze(freezeObject) {return function freeze(object) {if (typeof object =="function") {return object;} else {return freezeObject(object);}
 };})(Object.freeze);}
if (!Object.preventExtensions) {Object.preventExtensions =function preventExtensions(object) {return object;};}
if (!Object.isSealed) {Object.isSealed =function isSealed(object) {return false;};}
if (!Object.isFrozen) {Object.isFrozen =function isFrozen(object) {return false;};}
if (!Object.isExtensible) {Object.isExtensible =function isExtensible(object) {if (Object(object) ===object) {throw new TypeError();}
 var name ='';while (owns(object,name)) {name +='?';}
 object[name] =true;var returnValue =owns(object,name);delete object[name];return returnValue;};}
if (!Object.keys) {var hasDontEnumBug =true,dontEnums =["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],dontEnumsLength =dontEnums.length;for (var key in {"toString":null}) {hasDontEnumBug =false;}
 Object.keys =function keys(object) {if ((typeof object !="object"&&typeof object !="function") ||object ===null) {throw new TypeError("Object.keys called on a non-object");}
 var keys =[];for (var name in object) {if (owns(object,name)) {keys.push(name);}
 }
 if (hasDontEnumBug) {for (var i =0,ii =dontEnumsLength;i < ii;i++) {var dontEnum =dontEnums[i];if (owns(object,dontEnum)) {keys.push(dontEnum);}
 }
 }
 return keys;};}
if (!Date.prototype.toISOString ||(new Date(-62198755200000).toISOString().indexOf('-000001') ===-1)) {Date.prototype.toISOString =function toISOString() {var result,length,value,year;if (!isFinite(this)) {throw new RangeError("Date.prototype.toISOString called on non-finite value.");}
 result =[this.getUTCMonth() + 1,this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()];year =this.getUTCFullYear();year =(year < 0 ?'-':(year > 9999 ?'+':'')) + ('00000'+ Math.abs(year)).slice(0 <=year &&year <=9999 ?-4 :-6);length =result.length;while (length--) {value =result[length];if (value < 10) {result[length] ="0"+ value;}
 }
 return year + "-"+ result.slice(0,2).join("-") + "T"+ result.slice(2).join(":") + "."+
 ("000"+ this.getUTCMilliseconds()).slice(-3) + "Z";}
}
if (!Date.now) {Date.now =function now() {return new Date().getTime();};}
if (!Date.prototype.toJSON) {Date.prototype.toJSON =function toJSON(key) {if (typeof this.toISOString !="function") {throw new TypeError('toISOString property is not callable');}
 return this.toISOString();};}
if (!Date.parse ||Date.parse("+275760-09-13T00:00:00.000Z") !==8.64e15) {Date =(function(NativeDate) {var Date =function Date(Y,M,D,h,m,s,ms) {var length =arguments.length;if (this instanceof NativeDate) {var date =length ==1 &&String(Y) ===Y ?new NativeDate(Date.parse(Y)) :length >=7 ?new NativeDate(Y,M,D,h,m,s,ms) :length >=6 ?new NativeDate(Y,M,D,h,m,s) :length >=5 ?new NativeDate(Y,M,D,h,m) :length >=4 ?new NativeDate(Y,M,D,h) :length >=3 ?new NativeDate(Y,M,D) :length >=2 ?new NativeDate(Y,M) :length >=1 ?new NativeDate(Y) :new NativeDate();date.constructor =Date;return date;}
 return NativeDate.apply(this,arguments);};var isoDateExpression =new RegExp("^"+
 "(\\d{4}|[\+\-]\\d{6})"+ "(?:-(\\d{2})"+ "(?:-(\\d{2})"+ "(?:"+ "T(\\d{2})"+ ":(\\d{2})"+ "(?:"+ ":(\\d{2})"+ "(?:\\.(\\d{3}))?"+ ")?"+
 "(?:"+ "Z|"+ "(?:"+ "([-+])"+ "(\\d{2})"+ ":(\\d{2})"+ ")"+
 ")?)?)?)?"+
 "$");for (var key in NativeDate) {Date[key] =NativeDate[key];}
 Date.now =NativeDate.now;Date.UTC =NativeDate.UTC;Date.prototype =NativeDate.prototype;Date.prototype.constructor =Date;Date.parse =function parse(string) {var match =isoDateExpression.exec(string);if (match) {match.shift();for (var i =1;i < 7;i++) {match[i] =+(match[i] ||(i < 3 ?1 :0));if (i ==1) {match[i]--;}
 }
 var minuteOffset =+match.pop(),hourOffset =+match.pop(),sign =match.pop();var offset =0;if (sign) {if (hourOffset > 23 ||minuteOffset > 59) {return NaN;}
 offset =(hourOffset * 60 + minuteOffset) * 6e4 * (sign =="+"?-1 :1);}
 var year =+match[0];if (0 <=year &&year <=99) {match[0] =year + 400;return NativeDate.UTC.apply(this,match) + offset - 12622780800000;}
 return NativeDate.UTC.apply(this,match) + offset;}
 return NativeDate.parse.apply(this,arguments);};return Date;})(Date);}
var ws ="\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003"+
 "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028"+
 "\u2029\uFEFF";if (!String.prototype.trim ||ws.trim()) {ws ="["+ ws + "]";var trimBeginRegexp =new RegExp("^"+ ws + ws + "*"),trimEndRegexp =new RegExp(ws + ws + "*$");String.prototype.trim =function trim() {if (this ===undefined ||this ===null) {throw new TypeError("can't convert "+this+" to object");}
 return String(this).replace(trimBeginRegexp,"").replace(trimEndRegexp,"");};}
var toInteger =function (n) {n =+n;if (n !==n) {n =0;} else if (n !==0 &&n !==(1/0) &&n !==-(1/0)) {n =(n > 0 ||-1) * Math.floor(Math.abs(n));}
 return n;};var prepareString ="a"[0] !="a";var toObject =function (o) {if (o ==null) {throw new TypeError("can't convert "+o+" to object");}
 if (prepareString &&typeof o =="string"&&o) {return o.split("");}
 return Object(o);};});if (typeof ADOBE =="undefined") {var ADOBE ={};}
if (typeof ADOBE.AM =="undefined") {ADOBE.AM ={};}
ADOBE.AM.UTILS ={HANDLE_AJAX :{active :false,status_codes :{},init :function(args) {if (args &&args.status_codes) {$.extend(this.status_codes,args.status_codes);}
this.activateAjaxHandler();},activateAjaxHandler :function() {var that =this;$(document).ajaxError(function(e,xhr,options){if (!xhr) {return false;}
if (!that.status_codes[xhr.status]) {return false;}
that.status_codes[xhr.status].apply(this,arguments);});}
},ERRORS :{TYPES :{ValidationError :function(param,message) {this.param =param;this.message =message;},ArgError :function(param,message) {this.param =param;this.message =message;},FatalDisplayError :function(param,message) {this.param =param;this.message =message;}
},MESSAGES :{}
},LOGGER :{logs :[],log :function(msg,type) {var timestamp =(new Date).getTime(),message ="";if (typeof type =="undefined") {type ="LOG:";}
message =timestamp + ' - '+ type + ": "+ msg;this.logs.push(message);},flush :function() {this.logs =[];},display :function() {var debug =true;if (debug &&window.console &&window.console.log) {for (var i =0;i < this.logs.length;i++) {window.console.log(this.logs[i]);}
}
else if (debug &&window.alert) {window.alert(this.logs.join("\n"));}
}
},HELPERS :{cookieHandler :{data :{},preferences_cookie_name :'_prefs',cookie_store :document,set :function(name,value,expires,path,domain,secure) {var today =new Date();if (expires) {expires =expires * 1000 * 60;}
this.cookie_store.cookie =name + '='+ encodeURIComponent(value) + ((expires) ?';expires='+ new Date(today.getTime() + expires).toUTCString() :'') + ((path) ?';path='+ path :'') + ((domain) ?';domain='+ domain :'') + ((secure) ?';secure':'');},get :function(name) {var nameEQ =name + '=',ca =this.cookie_store.cookie.split(';'),i,l,c;for (i =0,l =ca.length;i < l;i++) {c =ca[i];while (c.charAt(0)==' ') {c =c.substring(1,c.length);}
if (c.indexOf(nameEQ) ===0) {return decodeURIComponent(c.substring(nameEQ.length,c.length));}
}
return null;},load :function(name) {var value =null;try {if (typeof name !="undefined") {value =JSON.parse(this.get(this.preferences_cookie_name))[name];}
else {value =JSON.parse(this.get(this.preferences_cookie_name));}
}
catch (__err__) {}
return value;},save :function() {var obj ={};var args =Array.prototype.slice.call(arguments);obj[args[0]] =args[1];args.shift();args.shift();this.set.apply(this,[this.preferences_cookie_name,JSON.stringify(obj)].concat(args));}
},isObjectEmpty :function(o) {return Object.keys(o).length ===0;},isNumeric :function(n) {return !isNaN(parseFloat(n)) &&isFinite(n);},isDPMTrait :function(trait_type) {if (trait_type =="ON_BOARDED_TRAIT") {return true;}
return false;},isAlgoTrait :function(traitType) {if (traitType =="ALGO_TRAIT") {return true;}
return false;},getTraitTypeLabel :function(type) {switch (type) {case "RULE_BASED_TRAIT":return "Rule-based";case "ON_BOARDED_TRAIT":return "Onboarded";case "ALGO_TRAIT":return "Algorithmic";default:return "Unknown";}
},isTrait :function(trait_type) {return trait_type =="INTENT"||trait_type =="ALGO_TRAIT"||trait_type =="ON_BOARDED_TRAIT"||trait_type =="RULE_BASED_TRAIT";},isSegment :function(trait_type) {return trait_type =="SEGMENT";},isEmptyString :function(str) {var result =false;if (str ===""||str.match(/^\s+$/)) {

result =true;}
return result;},htmlEntityDecode :function(entity) {var $html =$('<div />').html(entity);return $html instanceof $ ?$html.text() :"";},formatNumber :function(num) {num +='';var x =num.split('.');var x1 =x[0];var x2 =x.length > 1 ?'.'+ x[1] :'';var rgx =/(\d+)(\d{3})/;

while (rgx.test(x1)) {x1 =x1.replace(rgx,'$1'+ ','+ '$2');}
return x1 + x2;},formatDate :function(date,format_function) {var year ="",month ="",day ="",hour ="",minute ="";if (!(date instanceof Date)) {date =new Date(date);}
if (isNaN(date.getTime())) {throw new Error("Date is not valid");}
year =date.getFullYear().toString();month =(date.getMonth() + 1).toString();day =date.getDate().toString();hour =date.getHours().toString();minute =date.getMinutes().toString();if (format_function) {return format_function(month,day,year,hour,minute);}
if (hour !=="0") {return {month :month,day :day,year :year,hour :hour,minute :minute
};} else {return {month :month,day :day,year :year
};}
},isNthChildSelectorSupported :function() {return Modernizr['nth-child-selector'];},isFirstOfTypeSelectorSupported :function() {return Modernizr['first-of-type'];},isLastOfTypeSelectorSupported :function() {return Modernizr['last-of-type'];},decorateWithSpanAndSlice :function(func) {return function(el) {var val =func.call(this,el);return '<span title="'+ el + '">'+ (val !==null ?val :"") + '</span>';}
}(function(elem) {return "string"==typeof elem &&elem.length > 30 ?elem.slice(0,30) + "...":elem;}),bindContextHelp :function() {$(".context-help").off().on('click',function(e){e.stopPropagation();var addHelpObj =null,showContextHelp =null,helpPage =$(this).attr("data-id");addHelpObj =function(page ){var url =ADOBE.AM.API.BASEURL + "/contextualhelp/pid-"+ ADOBE.AM.pid + "/"+ page;$.getJSON(url,function(helpObj ){ADOBE.AM.contextHelpArr[page ] =helpObj;showContextHelp(page );});};showContextHelp =function(item ){var alertObj ={};var helpObj =ADOBE.AM.contextHelpArr[item ];helpObj.intro =ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(helpObj.intro);var msg =helpObj.intro+ "<a tabindex='-1' class='moreHelpLink' href='"+ helpObj.url + "' target='_blank'>Click here for more information</a>";alertObj.title =helpObj.title.replace(':',":<br />");alertObj.title ='<h4>'+ alertObj.title + '</h4>';alertObj.msg =msg;msg =alertObj.title + alertObj.msg;ADOBE.AM.AlertModal({type:'help',message:msg });}
if (typeof ADOBE.AM.contextHelpArr[helpPage ] ==="undefined"){addHelpObj(helpPage);} else {showContextHelp(helpPage);}
return false;});},comparator:function(sortby,direction) {return function(a,b) {if (typeof a.get(sortby) ==='string') {a =a.get(sortby).toLowerCase();b =b.get(sortby).toLowerCase();} else {a =a.get(sortby);b =b.get(sortby);}
if (a ==b) {return 0;}
else if (a < b) {return direction =='desc'?-1 :1;}
else {return direction =='desc'?1 :-1;}
};},formatFolderHierarchy :function (obj ){var newObj ={"attr":{"id":obj.folderId + "_folder","rel":"folder"},"data":obj.name
};if($.isArray(obj.subFolders) &&obj.subFolders.length > 0){var children =[];$.each(obj.subFolders ,function (i,child){var childObj =DEMDEX.UTILS.formatFolderHierarchy(child);children.push(childObj );}
);$.extend(newObj,{"state":"closed","children":children});}
return newObj;},formatCategoryTaxonomy :function(obj) {var func =arguments.callee;var newObj ={"attr":{"id":obj.categoryId + "_cat","rel":"category"},"data":obj.name
};if(obj.categoryCount > 0){var children =[];$.each(obj.categories ,function (i,child){var childObj =func(child);children.push(childObj );}
);$.extend(newObj,{"state":"closed","children":children});}
return newObj;},switchPage :function(pageString) {document.getElementById('mainContent').setAttribute('class',pageString);},tempFixForChrome:function() {var isChrome =(navigator.userAgent.toLowerCase().indexOf('safari') > -1) ||(navigator.userAgent.toLowerCase().indexOf('chrome') > -1);if (!isChrome) {return false;}
var $el =$('.AUI_Dialog_outerContainer');var absoluteTop =$el.position().top;var fixedTop =$el.offset().top;$el.css({top:absoluteTop }).addClass('chromeFix');$('body').addClass('disableMainScroll');$(window).resize(function() {$el.removeClass('chromeFix');});},makeTemplate :function(template_name,args) {var template =null;if (template_name instanceof Array) {var tmp =this[template_name[0]];for (var i =1;i < template_name.length;i++) {tmp =tmp[template_name[i]];}
template =tmp;}
else {template =this[template_name];}
for (var key in args) {if (args.hasOwnProperty(key)) {template =template.replace(key,args[key]);}
}
return template;},TableFilter:function(tbl,tbx) {var self =this;if (tbx ===Object(tbx) &&tbx.keyup) {tbx.keyup(function(e) {self.process(e.target.value);});}
this.process =function(val) {if (!(typeof val =='string') ||tbl !==Object(tbl) ||!tbl.find) {return;}
var trs =tbl.find('tbody tr');trs.each(function() {var found =false,tds =$(this).find('td');tds.each(function() {var td =$(this);td.show();if (td.text().toLowerCase().indexOf(val.toLowerCase()) >=0) {found =true;}
});if (!found) {tds.hide();}
})
};},dheElement:null,decodeHTMLEntities:function(str) {if (!this.dheElement) {this.dheElement =document.createElement('div');}
var element =this.dheElement;if(str &&typeof str ==='string') {element.innerHTML =str;}
return element.innerText ||element.textContent ||str;},serialize:function(obj) {var str =[];for (var p in obj) {if (obj.hasOwnProperty(p)) {str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));}
}
return str.join("&");},prettyPrintEnum :function(value) {function formatWord(word) {return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();}
return value.split("_").map(formatWord).join(" ");},parseDataFormatForCloudViz:function(data,dataFormat) {var self =this;var parsed ={x:[],y:[],series:[]
};dataFormat.forEach(function(kv,i) {parsed.x[i] =[];parsed.y[i] =[];parsed.series[i] =[];});try {if (data ===Object(data) &&Object.keys(data).length) {Object.keys(data).forEach(function(x) {var obj =data[x];x =self.getUTCDate(parseInt(x,10));dataFormat.forEach(function(kv,i) {parsed.x[i].push(x);var label =Object.keys(kv)[0];var objKey =kv[label];parsed.y[i].push(obj[objKey]);parsed.series[i].push(label);});});return parsed;}
} catch(_error_) {return {};}
return {};},parseMultipleTrendDataForCloudViz:function(data,typeKey) {var self =this;var parsed ={x:[],y:[],series:[],sids:[]
};var tsSidMappings ={},tsKeys ={},populatedSids =[],emptySids =[];if (data instanceof Array &&data.length) {data.forEach(function(line) {var metrics =line.metrics,mappings ={};if (metrics ===Object(metrics) &&Object.keys(metrics).length) {var name =self.decodeHTMLEntities(line.name) + (typeof line.sid ==='undefined'?'':' ('+ line.sid + ')'),x =[],y =[],series =[];Object.keys(metrics).forEach(function(item) {var date =self.getUTCDate(parseInt(item,10));var yValue =metrics[item][typeKey];x.push(date);y.push(yValue);series.push(name);mappings[item] =yValue;tsKeys[item] =true;});parsed.x.push(x);parsed.y.push(y);parsed.series.push(series);populatedSids.push(line.sid);tsSidMappings[line.sid + ''] =mappings;} else {emptySids.push(line.sid);}
});parsed.sids =populatedSids.concat(emptySids);parsed.graphDataIsEmpty =!populatedSids.length;var dataTable =[];Object.keys(tsKeys).forEach(function(ts) {var obj ={date:new Date(parseInt(ts,10))
};Object.keys(tsSidMappings).forEach(function(sid) {if (ts in tsSidMappings[sid]) {obj[sid] =tsSidMappings[sid][ts];} else {obj[sid] ='';}
});dataTable.push(obj);});parsed.dataTable =dataTable;return parsed;}
return {};},transformDataToCloudViz:function(data) {try {var t ={},tKeys,key;if (data ===Object(data) &&data.y instanceof Array) {tKeys =Object.keys(data);tKeys.forEach(function(key) {t[key] =[];});data.y.forEach(function(y,i) {tKeys.forEach(function(key) {Array.prototype.push.apply(t[key],data[key][i]);});});return t;}
} catch(err) {return {};}
return {};},formatTimestampToUTC :function(timestamp,format) {if (typeof moment ==='undefined') {throw new Error('moment must be defined!');}
if (typeof format ==='undefined') {format ='YYYY-MM-DD';}
return moment(timestamp).utc().format(format);},getUTCDate :function(utcmillis) {var date =new Date(utcmillis);return new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds()
);}
},pressedEnter :function(e){var keycode;if (window.event){keycode =window.event.keyCode;}
else if (e){keycode =e.which;}
else{keycode =e.keyCode;}
if (keycode ==13){return true;}
else{return false;}
},G6 :{SEGMENTS :{trait_cache :{cache :[],getBySid :function(sid) {for (var i =0;i < this.cache.length;i++) {if (this.cache[i].sid ==sid) {return this.cache[i];}
}
}
},getNumberOfTouchingRules :function(remaining_tree) {var cnt =1,node =null;for (var k =0,len =remaining_tree.length;k < len;k++) {node =remaining_tree[k];if (typeof node.on !=undefined &&!node.on ||ADOBE.AM.UTILS.HELPERS.isNumeric(node.val,10)) {cnt++;}
else {break;}
}
return cnt;},treeParser :function(tree,ff) {var result ="";if (tree.expr1 ||tree.expr2 ||tree.frequency ||tree.sid) {result =this.parseExpressionTree.apply(this,arguments);}
return result;},flattenTree :function(t) {var node =t;var parent =null;var flattened_tree =[];var obj ={};while (node !=null) {if (parent !=null) {parent.expr1 =node.expr2;node.expr2 =parent;}
if (node.expr1 !=null) {parent =node;node =node.expr1;continue;}
if (node.frequency) {flattened_tree.push({sids :node.frequency.list,rec_op :node.expressionName,rec_value :node.value,freq_op :node.frequency.op,freq_units :node.frequency.units,freq_val :node.frequency.value
});}
else if (node.expressionName) {obj ={expressionName :node.expressionName
};flattened_tree.push(obj);if (node.expr) {var flattened_expr =arguments.callee(node.expr)
flattened_tree =flattened_tree.concat(flattened_expr);}
}
else if (node.expr) {flattened_tree.push({sid :node.expr.sid
});}
else if (node.sid) {flattened_tree.push({sid :node.sid
});}
node =node.expr2;parent =null;}
return flattened_tree;},parseExpressionTree :function(t) {var g6 =ADOBE.AM.UTILS.G6.SEGMENTS;var helper =g6.tree_helper;helper.init();this.inOrderTreeTraversal(t,helper.storeNode);return g6.formatFlattenedList(helper.nodes,g6.parsingFunctions.html);},tree_helper :{turnOnNextOr :false,turnOnOperatorOverride :false,openParen :false,depth :1,old_depth :null,operatorInfoAtDepth :{},nodes :[],init :function() {this.nodes =[];this.turnOnOperatorOverride =false;this.openParen =false;this.depth =1;this.old_depth =null;this.operatorInfoAtDepth ={};},depthCheck :function() {var helper =ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;return helper.old_depth ==helper.depth;},store :function(node) {this.nodes.push(node);},storeNode :function(type,val,extras) {var result =null,on_off_switch =false,helper =ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;switch(type) {case 'sid':result ={type :'sid',value :val
};break;case 'expr':on_off_switch =((extras &&typeof extras.oo !="undefined") ?extras.oo :1);result ={type :'op',value :val,on :on_off_switch
};break;case 'name-val':result =val;break;case 'frequency':result ={type :'frequency',value :{sids :val.sids,frequency_op :val.freq_op,frequency_val :val.freq_val,units :val.units,recency_op :val.rec_op,recency_val :val.rec_val
}
};break;default:break;}
helper.store(result);return result;},turnOperatorOn :function(op) {if (!this.openParen) {return true;}
if (op.toString().toLowerCase() =="and") {return true;}
if (typeof this.operatorInfoAtDepth[this.depth] !="undefined") {return !this.operatorInfoAtDepth[this.depth];}
return false;},handleExpression :function(op,tree) {switch (op.toString().toLowerCase()) {case 'or':this.openParen =this.lookAroundForSpecialOperations(tree);break;case 'and':this.openParen =false;break;default:break;}
this.incDepth(1);this.turnOnOperatorOverride =false;},handleFrequency :function() {this.openParen =false;this.turnOnOperatorOverride =true;this.incDepth(-1);},handleSid :function() {this.incDepth(-1);},lookAroundForSpecialOperations :function(tree) {if (tree.expr1 &&tree.expr1.frequency ||tree.expr2 &&tree.expr2.frequency) {return false;}
if (tree.expr1 &&tree.expr1.expressionName =="and"||tree.expr2 &&tree.expr2.expressionName =="and") {return false;}
if (typeof this.operatorInfoAtDepth[this.depth] !="undefined") {return this.operatorInfoAtDepth[this.depth];}
if (this.turnOnOperatorOverride) {return false;}
return true;},incDepth :function(val) {var helper =ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;helper.old_depth =helper.depth;helper.depth +=val;},display :function() {var helper =ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper,nodes =helper.nodes,result ="";for (var i =0;i < nodes.length;i++) {var next =nodes[i+1];if (next =="or") {result +=" ( ";result +=nodes[i];for (var j =i + 1;j < nodes.length;j++) {result +=" "+ nodes[j] + " ";if (nodes[j+1] !="or"&&isNaN(parseInt(nodes[j+1],10))) {i =j;break;}
}
i =j;result +=" ) ";}
else {result +=nodes[i] + " ";}
}
return result;}
},inOrderTreeTraversal :function(t,ff) {if (typeof t ==="undefined") {return;}
else if (typeof t =="number") {return t;}
else if (typeof t.name !=="undefined") {return ff('name-val',{name :t.name,value :t.value,expressionName :t.expressionName,type :'rule'});}
else if (t.sid) {ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleSid();return ff('sid',t.sid);}
else if (t.expr) {return ff('expr',t.expressionName) + arguments.callee(t.expr,ff);}
else if (t.expressionName &&t.frequency) {ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleFrequency();return ff('frequency',{freq_val :t.value,freq_op :t.expressionName,rec_val :t.frequency.value,rec_op :t.frequency.op,units :t.frequency.units,sids :t.frequency.list
});}
arguments.callee(t.expr1,ff);if (t.expressionName) {ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.handleExpression(t.expressionName,t);}
ff('expr',t.expressionName,{oo :ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper.turnOperatorOn(t.expressionName)
});arguments.callee(t.expr2,ff);return;},formatFlattenedList :function(flattened_tree,ff) {var num_of_touching_sids =0,first_sid_flag =true,rf_data =null,sid_rules =null,result ="";for (var i =0;i < flattened_tree.length;i++) {node =flattened_tree[i];switch (node.type) {case 'op':if (flattened_tree[i+1] &&flattened_tree[i+1].type =='op'&&flattened_tree[i+1].value.toLowerCase() =='not') {flattened_tree.splice(i+1,1);result +=ff('expr',node.value + " NOT",node.on ?'on':'off');}
else {result +=ff('expr',node.value,node.on ?'on':'off');}
first_sid_flag =node.on ?true :false;break;case 'sid':if (first_sid_flag) {num_of_touching_sids =this.getNumberOfTouchingRules(flattened_tree.slice(i+1));result +=ff('sid',node.value,{row_span :num_of_touching_sids});}
else {result +=ff('sid',node.value);}
first_sid_flag =false;break;case 'frequency':sid_rules =[];for (var j =0,len_j =node.value.sids.length;j < len_j;j++) {sid =node.value.sids[j];if (j ==0) {rf_data ={};if (node.value.frequency_op) {rf_data.frequency_ops =node.value.frequency_op;}
if (node.value.units) {rf_data.frequency_units =node.value.units;}
if (node.value.frequency_val) {rf_data.frequency_val =node.value.frequency_val;}
if (node.value.recency_op) {rf_data.recency_ops =node.value.recency_op;}
if (node.value.recency_val) {rf_data.recency_val =node.value.recency_val;}
sid_rules.push(ff('sid',sid,_.extend(rf_data,{row_span :len_j + (len_j - 1)
})));continue;}
sid_rules.push(ff('sid',sid));}
result +=sid_rules.join(ff('expr','or','off'));first_sid_flag =true;break;}
}
return result;},parsingFunctions :{code :function(type,val,extras) {var result =null,on_off_switch =false,helper =ADOBE.AM.UTILS.G6.SEGMENTS.tree_helper;switch(type) {case 'sid':result =val;break;case 'expr':on_off_switch =((extras &&typeof extras.oo !="undefined") ?extras.oo :1);result =(on_off_switch ?val.toUpperCase() :val.toLowerCase());break;case 'frequency':result ="(Frequency("+ val + " "+ extras.freq_op + " "+ extras.freq_val
+ extras.units + ") "+ extras.rec_op + " "+ extras.rec_val + ")";break;default:return "WTF!";break;}
helper.store(result);return result;},html :function(type,val) {var html ="",empty_rf =null,rf_html ="",trait =null,name ="",rf_state ="off",uniques ="-",rule_template =APP.templates.segment_builder_widget.elements.rule,data =null,rf_cell ="",rf_template =APP.templates.segment_builder_widget.elements.recency_frequency;if (type =='sid') {trait =ADOBE.AM.UTILS.G6.SEGMENTS.trait_cache.getBySid(val);name =trait.name ||"";uniques =ADOBE.AM.UTILS.HELPERS.formatNumber(trait.uniques30Day) ||0;data ={sid :val,name :name,uniques :uniques,rowspan :false
};if (arguments[2] &&arguments[2].row_span) {data.rowspan =!!arguments[2].row_span ||false;empty_rf ={frequency_val :"",frequency_ops :">=",recency_val :"",recency_ops :"<="};if (arguments[2].frequency_val) {rf_state ="on";empty_rf.frequency_val =arguments[2].frequency_val;}
if (arguments[2].frequency_ops) {rf_state ="on";empty_rf.frequency_ops =ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(arguments[2].frequency_ops);}
if (arguments[2].recency_val) {rf_state ="on";empty_rf.recency_val =arguments[2].recency_val;}
if (arguments[2].recency_ops) {rf_state ="on";empty_rf.recency_ops =ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(arguments[2].recency_ops);}
_.extend(empty_rf,{rowspan :arguments[2].row_span,state :rf_state
});rf_cell =_.template(APP.templates.segment_builder_widget.elements.rf_cell,empty_rf);data.rf_html =rf_cell;}
return _.template(rule_template,data);}
if (type =='frequency') {var rule_html =val,op =arguments[2],value =arguments[3],recency_op =arguments[4],recency_val =arguments[5];try {rf_html =_.template(rf_template,{rf_class :"on",recency_ops :recency_op,recency_val :recency_val,frequency_ops :op,frequency_val :value
});}
catch (__err__) {ADOBE.AM.UTILS.LOGGER.log(__err__.message);}
return rule_html + rf_html;}
if (type =='wrapper') {try {if (arguments[2] &&arguments[2].rf ==true) {rf_html =_.template(rf_template,{rf_class :"off",frequency_val :"",frequency_ops :">=",recency_val :"",recency_ops :"<="});html =_.template(rw_template,{content :val + rf_html
});}
else {html =_.template(rw_template,{content :val
});}
}
catch (__err__) {ADOBE.AM.UTILS.LOGGER.log(__err__.message);}
return val;}
if (type =='expr') {var template =APP.templates.segment_builder_widget.elements.op,op_wrapper_classes ="op "+ (arguments[2] ||"on"),html ="";if (val =="or"&&arguments[2] =="off") {val ="";}
try {html =_.template(template,{op_wrapper_class :op_wrapper_classes,op_class :val,selected :val.toString().toUpperCase()
});}
catch (__err__) {ADOBE.AM.UTILS.LOGGER.log(__err__.message);}
return html;}
}
}
}
},MODELS :{validators :{validateData:function(attrs) {var errors =this.validationErrors =[],v,vfn,req,opt;this.attrs =attrs;if (v =attrs.validator) {if (!this.vfn) {this.vfn ={notEmpty:function(key,field) {var val =attrs[key];if (val !=null &&val !=''&&val !='undefined') {return [true];} else {return [false,field + ' cannot be empty'];}
},date:function(key,field) {var val =attrs[key];if (!isNaN(Date.parse(val))) {return [true];} else {return [false,field + ' is not in a parsable date format'];}
},http:function(key,field) {var val =attrs[key];if (/^http:\/\/[-A-Za-z0-9.]+\.[A-Za-z]{2,4}[A-Za-z0-9 \?=\.\/&amp;;_%,@:\[\]~\+#!\$,\^\*\(\)\`\|\/-]*$/.test(val)) {

return [true];} else {return [false,field + ' is not in a valid http url format'];}
},https:function(key,field) {var val =attrs[key];if (/^https:\/\/[-A-Za-z0-9.]+\.[A-Za-z]{2,4}[A-Za-z0-9 \?=\.\/&amp;;_%,@:\[\]~\+#!\$,\^\*\(\)\`\|\/-]*$/.test(val)) {

return [true];} else {return [false,field + ' is not in a valid https url format'];}
}
};}
vfn =this.vfn;if (req =v.required) {$.each(req,function(key,val) {var result =vfn[val[0]](key,val[1]);if (!result[0]) {errors.push(result[1]);}
});}
if (opt =v.optional) {$.each(opt,function(key,val) {if (attrs[key] !=null &&attrs[key] !='') {var result =vfn[val[0]](key,val[1]);if (!result[0]) {errors.push(result[1]);}
}
});}
if (typeof v.custom =='function') {this.customValidation =v.custom;this.customValidation();}
}
if (this.validationErrors.length) {return this.validationErrors;}
}
}
}
};ADOBE.AM.UTILS.GATEKEEPER =function() {this.permission_objects ={};this.current_scheme =null;this.valid =false;};ADOBE.AM.UTILS.GATEKEEPER.prototype ={schemes :null,PermissionClass :null,defaultSchemePermissionCheck :function(perm_object) {var authorized =true,self =this;_.each(self,function(values,key) {if (key.match(/Permission$/) === null) {

return;}
if (this.getPermissionObjects(key).hasPermission(self[key]) ===false) {authorized =false;return false;}
},perm_object);return authorized;},permissionCheck :function() {var scheme_permissions =this.schemes[this.current_scheme];this.valid =scheme_permissions.permissionCheck !==void 0
?scheme_permissions.permissionCheck(this)
:this.defaultSchemePermissionCheck.call(scheme_permissions,this);return this.isValid();},checkPermissions :function(perm_objects,currentScheme) {this.setPermissionObjects(perm_objects);this.setCurrentScheme(currentScheme);if (this.permissionCheck()) {this.clearAll();return true;}
this.clearAll();return false;},isValid :function() {return this.valid;},clearAll :function() {this.permission_objects ={};this.valid =null;this.current_scheme =null;},setPermissionObjects :function(arg) {var obj ={},self =this;function isValid(o) {return o instanceof self.PermissionClass
}
if (self.PermissionClass ===null) {this._errors.handleError("ArgError","arg","PermissionClass on the instance must be defined");}
if (arguments.length > 1) {this._errors.handleError("ArgError","arg","setPermissionObjects accepts single object or array of objects");}
if (arg instanceof Array) {_.each(arg,function(element) {if (!isValid(element)) {self._errors.handleError("ArgError","arg","Argument must be of type ADOBE.AM.Permission.Models.Permission");}
this[element.getName()] =element;},obj);_.extend(this.permission_objects,obj);return true;}
if (!isValid(arg)) {this._errors.handleError("ArgError","arg","Argument must be of type ADOBE.AM.Permission.Models.Permission");}
obj[arg.getName()] =arg;_.extend(this.permission_objects,obj);return true;},getPermissionObjects :function(name) {return name
?this.permission_objects[name]
:this.permission_objects;},setCurrentScheme :function(arg) {this.current_scheme =arg;this.valid =false;},getCurrentScheme :function() {return this.current_scheme;},setSchemes :function(s) {if (typeof s !='object') {this._errors.handleError("ArgError","s","argument must be of type object");}
this.schemes =s;},getSchemes :function() {return this.schemes;},setPermissionClass :function(p) {this.PermissionClass =p;},getPermissionClass :function() {return this.PermissionClass;},setErrorTypes :function(types) {_.extend(this._errors.types,types);this._errors.isCustomErrorsSet =true;},getIsCustomErrorsSet :function() {return this._errors.getIsCustomErrorsSet();},_errors :{types :{},customErrorsSet :false,handleError :function(error_type,arg,message) {if (this.isCustomErrorsSet ===false) {throw new Error(message);}
if (error_type in this.types) {throw new this.types[error_type](arg,message);}
throw new Error(message);},getIsCustomErrorsSet :function() {return this.isCustomErrorsSet;}
},_strings :{}
};ADOBE.AM.API ={BASEURL :"/portal/api/v1",SOLR :{url :function(type) {var url =ADOBE.AM.API.BASEURL + "/segments/";switch (type) {case "estimate30DaySize":type ="estimate-30-day-size";break;case "estimate7DaySize":type ="estimate-7-day-size";break;case "estimate60DaySize":type ="estimate-60-day-size";break;default:break;}
url +=type ?type :"estimate-size";return url;}
},REGION :{regions :{url :function() {return ADOBE.AM.API.BASEURL + "/dcs-regions/";}
}
},MODELS :{algo_model :{url :function(amid,qsa) {var url =ADOBE.AM.API.BASEURL + '/models/';var qs =[];if (amid !=undefined) {url +=amid + "/";}
if (typeof qsa =="object"&&!ADOBE.AM.UTILS.HELPERS.isObjectEmpty(qsa)) {Object.keys(qsa).forEach(function(val,ind,arr) {qs.push(val + "="+ qsa[val]);});url +="?"+ qs.join("&");}
return url;}
},processing_history :function(amid) {return ADOBE.AM.API.MODELS.algo_model.url(amid) + 'processing-history/';},algorithms :{url :function() {return ADOBE.AM.API.BASEURL + "/algorithms/";}
},influential_traits :{url :function(amid) {return ADOBE.AM.API.MODELS.algo_model.url(amid) + "runs/latest/traits/";}
},run_stats :{url :function(amid) {return ADOBE.AM.API.MODELS.algo_model.url(amid) + "runs/latest/stats/";}
},bulk_delete :{url :function() {return ADOBE.AM.API.MODELS.algo_model.url() + "bulk-delete/";}
},limits :{url :function() {return ADOBE.AM.API.BASEURL + '/models/limits';}
}
},TRAITS :{bulkDelete :{url :function() {var url =ADOBE.AM.API.BASEURL + "/traits/bulk-delete/";return url;},method :function(options) {var ids =options.ids,success =options.success ||function(){},error =options.error ||function(){},url =this.url();$.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(ids),success:success,error:error
});}
},type :{url :function(pixelType) {var url =ADOBE.AM.API.BASEURL + '/customer-trait-types/';if (typeof pixelType !="undefined") {url +=pixelType + "/";}
return url;}
},folders :{url :function(folderID) {var url =ADOBE.AM.API.BASEURL + '/folders/traits/';if (folderID !=undefined) {url +='%%folderid%%/';url =url.replace("%%folderid%%",folderID);}
return url;}
},folderTraits :{url :function(pid,folderID) {}
},trait2 :{url :function() {var url =ADOBE.AM.API.BASEURL + '/traits/';return url;}
},trait :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/traits/';if (typeof params !="undefined") {if (params &&params ===Object(params)) {url =url + '?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);} else {url +=params + "/";}
}
return url;}
},limits :{url :function() {return ADOBE.AM.API.BASEURL + '/traits/limits';}
},validate :{url :function() {var url =ADOBE.AM.API.BASEURL + "/traits/validate/";return url;}
},test :{url :function() {var url =ADOBE.AM.API.BASEURL + "/traits/test/";return url;}
},trend :{url:function() {return ADOBE.AM.API.BASEURL + '/reports/traits-trend';},sid:{url :function(sid,startDate,endDate,interval) {var query =[];if (startDate) {query.push('startDate='+ startDate);}
if (endDate) {query.push('endDate='+ endDate);}
if (interval) {query.push('interval='+ interval);}
return ADOBE.AM.API.BASEURL + '/reports/traits-trend/'+ sid + (query.length ?'?'+ query.join('&') :'');}
}
},generalReport :{url :function() {var url =ADOBE.AM.API.BASEURL + "/reports/traits-for-date";return url;}
}
},DESTINATION :{destination :{url :function(qsa) {var qs =[],url =ADOBE.AM.API.BASEURL + "/destinations/";if (typeof qsa ==="undefined") {qsa ={};}
if (!ADOBE.AM.UTILS.HELPERS.isObjectEmpty(qsa)) {Object.keys(qsa).forEach(function(val,ind,arr) {qs.push(val + "="+ qsa[val]);});url +="?"+ qs.join("&");}
return url;},bulkUrl :function(destinationId) {var url =ADOBE.AM.API.BASEURL + "/destinations/%%destinationId%%/bulk-create/";if (!destinationId) {throw new ADOBE.AM.UTILS.ERRORS.TYPES.ValidationError("destinationId","argument is required");}
return url.replace("%%destinationId%%",destinationId);},typeArr :{"PUSH":"URL","S2S":"Server-to-Server","ADS":"Cookie","PULL":"Pull"},allowed_types :["PUSH","S2S","ADS"],getType :function(type) {if (this.allowed_types.indexOf(type) ==-1) {return "";}
return this.typeArr[type];},mapping_divider :"<br />",getMapping :function(destObj,obj) {var mapping,ttdo =obj;if (destObj.destinationType =="PUSH") {if (destObj.serializationEnabled) {mapping =ttdo.traitAlias;}
else{mapping ="";if (ttdo.url !==""||ttdo.secureUrl) {if (ttdo.url ==="") {mapping =ttdo.secureUrl;}
else {mapping =ttdo.url;if (ttdo.secureUrl) {mapping +=this.mapping_divider + ttdo.secureUrl;}
}
}
}
}
else if ("S2S"==destObj.destinationType ) {mapping =ttdo.traitAlias;}
else {if(destObj.formatType =="SINGLE_KEY"){mapping =destObj.singleKey + " = "+ ttdo.valueAlias;}
else{mapping =ttdo.traitAlias + " "+ (destObj.keySeparator ||"=")+ " "+ ttdo.valueAlias;}
}
return mapping;}
},search :{url :function() {var url =ADOBE.AM.API.BASEURL + '/destinations/';return url;}
},limits :{url :function() {return ADOBE.AM.API.BASEURL + '/destinations/limits';}
},availablePlatforms :{url :function() {return ADOBE.AM.API.BASEURL + '/destinations/configurations/available-platforms';}
},outboundHistory:{url :function(destId,startDate,endDate) {return ADOBE.AM.API.DESTINATION.destination.url() +
destId +
'/history/outbound?startDate='+
startDate +
"&endDate="+
endDate;}
}
},SCHEMAS :{schema :{url :function(pid,schema,qsa) {var url =ADOBE.AM.API.BASEURL + '/pid-%%pid%%/schema/';if (!pid) {throw new ADOBE.AM.UTILS.ERRORS.TYPES.ValidationError("pid","argument is required");}
url =url.replace("%%pid%%",pid);if (schema) {url +=schema + '/';}
url +="?";if (qsa &&qsa.token) {url +='token='+ qsa.token + '&';}
if (qsa &&qsa.user) {url +='user='+ qsa.user;}
return url;},method :function(options) {var url =options.url,success =options.success ||function(){},error =options.error ||function(){};$.ajax({url:url,type:"GET",dataType:"json",contentType:"application/json",success:success,error:error
});}
}
},DATAFEED :{url:function (params) {var url =ADOBE.AM.API.BASEURL + '/data-feeds';if (params) {if (params ===Object(params)) {url =url + '?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);} else {url =[url,params,''].join('/');}
}
return url;},plan:{url:function (feedId) {if (feedId) {return [ADOBE.AM.API.DATAFEED.url(),feedId,'plans'].join('/') ;} else {throw new Error('No feed ID is provided for plan');}
}
}
},DATASOURCES :{dataSources :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/datasources/';if (typeof params !="undefined") {if (params &&params ===Object(params)) {url =url + '?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);} else {url +=params + "/";}
}
return url;}
},dataSources_modeling :{url :function() {return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?modelingEnabled=true";}
},dataSources_segments :{url :function() {return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?objectType=segment&includePermissions=true";}
},dataSources_traits :{url :function() {return ADOBE.AM.API.DATASOURCES.dataSources.url() + "?objectType=trait&includePermissions=true&includeThirdParty=true";}
},marketingCloudVisitorIdVersions :{url :function() {return ADOBE.AM.API.DATASOURCES.dataSources.url() + "configurations/marketing-cloud-visitorid-versions";}
},idTypes :{url :function() {return ADOBE.AM.API.DATASOURCES.dataSources.url() + "configurations/available-id-types";}
},bulkDelete :{url :function() {var url =ADOBE.AM.API.BASEURL + "/datasources/bulk-delete/";return url;},method :function(options) {var ids =options.datasourceIds,success =options.success ||function(){},error =options.error ||function(){},url =this.url();return $.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(ids)
});}
},inboundHistory :{url :function(dpid,startDate,endDate) {return ADOBE.AM.API.DATASOURCES.dataSources.url(dpid) +
'history/inbound?startDate='+ startDate + "&endDate="+ endDate;}
},inboundMailingList :{url :function(dataSourceId,emailAddress) {return ADOBE.AM.API.DATASOURCES.dataSources.url(dataSourceId) + 'inbound-mailing-list/'+ (emailAddress ||'');}
}
},TAXONOMY :{categories :{url :function(tid) {var url =ADOBE.AM.API.BASEURL + '/taxonomies/0/';if (tid) {url +=tid + '/';}
return url;}
}
},FOLDERS :{folder :{url :function(type,folderID) {var url =ADOBE.AM.API.BASEURL + '/folders/'+ type + "/";if (folderID !=undefined) {url +='%%folderid%%/';url =url.replace("%%folderid%%",folderID);}
return url;}
},folders :{url :function(type) {var url =ADOBE.AM.API.BASEURL + '/folders/';url +=type + "/";return url;}
}
},SEGMENTS :{limits :{url :function() {return ADOBE.AM.API.BASEURL + '/segments/limits';}
},rule_validation :{url :function() {return ADOBE.AM.API.BASEURL + '/segments/validate/';}
},segment :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/segments/';if (typeof params !="undefined") {if (params &&params ===Object(params)) {url =url + '?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);} else {url +=params + "/";}
}
return url;}
},search :{url :function() {var url =ADOBE.AM.API.BASEURL + '/segments/';return url;}
},folders :{url :function(folderID) {var url =ADOBE.AM.API.BASEURL + '/folders/segments/';if (folderID !=undefined) {url +='%%folderid%%/';url =url.replace("%%folderid%%",folderID);}
return url;}
},folderSegments :{url :function(pid,folderID) {var url =ADOBE.AM.API.SEGMENTS.folders.url.apply(this,arguments);url +="segments/";return url;}
},bulkDelete :{url :function() {var url =ADOBE.AM.API.BASEURL + "/segments/bulk-delete/";return url;},method :function(options) {var ids =options.ids,success =options.success ||function(){},error =options.error ||function(){},pid =options.pid ||null,url =this.url();$.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(ids),success:success,error:error
});}
},trend :{url:function() {return ADOBE.AM.API.BASEURL + '/reports/segments-trend';},sid:{url :function(sid,startDate,endDate,interval) {var query =[];if (startDate) {query.push('startDate='+ startDate);}
if (endDate) {query.push('endDate='+ endDate);}
if (interval) {query.push('interval='+ interval);}
return ADOBE.AM.API.BASEURL + '/reports/segments-trend/'+ sid + (query.length ?'?'+ query.join('&') :'');}
}
},generalReport :{url :function() {var url =ADOBE.AM.API.BASEURL + "/reports/segments-for-date";return url;}
}
},USERS :{user :{url :function(userId) {var url =ADOBE.AM.API.BASEURL + '/users/';if (typeof userId !="undefined") {url +=userId + "/";}
return url;}
},updateGroups :{url :function() {var url =ADOBE.AM.API.BASEURL + "/users/update-groups/";return url;},method :function(options) {var data =options.data,url =this.url();return $.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(data)
});}
},bulkDelete :{url :function() {var url =ADOBE.AM.API.BASEURL + "/users/bulk-delete/";return url;},method :function(options) {var user_ids =options.user_ids,success =options.success ||function(){},error =options.error ||function(){},url =this.url();return $.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(user_ids)
});}
}
},GROUPS :{group :{url :function(groupId) {var url =ADOBE.AM.API.BASEURL + '/groups/';if (typeof groupId !="undefined") {url +=groupId + "/";}
return url;}
},bulkDelete :{url :function() {var url =ADOBE.AM.API.BASEURL + "/groups/bulk-delete/";return url;},method :function(options) {var group_ids =options.group_ids,success =options.success ||function(){},error =options.error ||function(){},url =this.url();return $.ajax({url:url,type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(group_ids)
});}
},permissions :{url :function(groupId) {return ADOBE.AM.API.BASEURL + '/groups/'+ groupId +'/permissions';}
}
},VISITOR_PROFILE :{url :function(uuid,region) {return ADOBE.AM.API.BASEURL + '/visitor-profile?uuid='+ uuid + '&region='+ region;}
},REPORTS :{largest_traits :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/reports/largest-traits';if (params ===Object(params) ) {url +='?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);}
return url;}
},largest_segments :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/reports/largest-segments';if (params ===Object(params) ) {url +='?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);}
return url;}
},traits_most_changed :{url :function(params) {var url =ADOBE.AM.API.BASEURL + '/reports/most-changed-traits';if (params ===Object(params) ) {url +='?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);}
return url;}
},segments_most_changed :{url :function (params) {var url =ADOBE.AM.API.BASEURL + '/reports/most-changed-segments';if (params ===Object(params)) {url +='?'+ ADOBE.AM.UTILS.HELPERS.serialize(params);}
return url;}
},partner_uniques :{url :function(keyVals) {var qs ="";qs =Object
.keys(keyVals)
.map(function(key) {return key + '='+ keyVals[key];})
.join('&');return ADOBE.AM.API.BASEURL + '/reports/partner-uniques?'+ qs;}
}
}
};ADOBE.AM.MESSAGES ={'en_US':{'generic_error':{message :"There was an error.  Please refresh and try again"},'generic_unrefreshable_error':{message :"There was an error. Please contact your administrator."},'generic_api_error':{message :'There was an error.  Please try again'},'loading':{message :'Please wait...'},message :{message :'Message'},saved :{message :'Saved'},ok :{message :'OK'},cancel :{message :'Cancel'},success :{message :'Success'},'cannot_delete_entity_mapped':{title:"Cannot delete segments",summary:"These segments are currently mapped to destinations.",message:"One or more of the segments you are attempting to delete have attached destinations. You must remove destination mappings before deleting a segment."},'not_all_selected_segments_can_be_added_to_destinations':{message:"The following segments you selected were NOT mappable to destinations:<span class='insert'></span>Do you wish to continue?"},'no_selected_segments_can_be_added_to_destinations':{message:"None of the segments you selected can be added to destinations."},'add_dpmtrait_to_recency_frequency':{message:"You are about to add a third party trait to a rule group that has recency and frequency.  This will cause the recency and frequency to be reset for this group.  <br /><br />Do you wish to continue?"},'add_algotrait_to_recency_frequency':{message:"You are about to add an algorithmic trait to a rule group that has recency and frequency.  This will cause the recency and frequency to be reset for this group.  <br /><br />Do you wish to continue?"},'cannot_add_recency_frequency_on_dpmtrait':{message:"You cannot add Recency and Frequency to a trait grouping with a 3rd party trait"},'cannot_add_recency_frequency_on_algotrait':{message:"You cannot add Recency and Frequency to a trait grouping with an algorithmic trait"},'segment_must_be_saved':{message:"You cannot assign destinations until you save the segment."},'invalid_expression':{message:"The rule you entered in the Segment Expression tag was invalid."},'complex_rule':{message:"The segment expression is too complex to show in the builder view.  Please use the code view to edit this expression."},'segment_rule_lack_permissions':{message :"Sorry, you do not have permissions to view all the traits in this segment."},'failure':{message :"Failure"},'solr_failure':{message :"There was an error contacting the Estimated Historic Segment Size service."},'cannot_have_recency_wo_frequency':{message :"You cannot add recency without frequency.  Please add a frequency."},'cannot_create_trait_from_model':{message :"The model must run at least 1 time successfully with data before a trait can be created using it.  You will be emailed when the model has run successfully."},'cannot_create_trait_from_model_simple':{message :"Sorry, you do not have permissions to create a trait from this model."},'delete_model':{message :"Are you sure you want to delete this model?"},'delete_models':{message :"Are you sure you want to delete these models?"},'delete_models_invalid':{message :"You must select at least 1 model to delete."},'delete_model_error':{message :"Sorry, there was an error deleting the model.  Please try again"},'model_has_not_run':{message :'The model has not yet run or produced no data.'},'model_has_no_data':{message :'No data.'},'model_max_reach_exceeded':{message:'All model values exceed maximum reach value, please review the configuration.'},'model_run_once':{message :'You have selected a model that has not run at least once.'},'cannot_delete_entity_with_mappings':{message :"There are traits using this model.  Please delete the traits and try again."},'influential_traits_nodata':{message :'The model has not yet run or produced no data.'},'model_status_error':{message :"There was an error changing the status.  Please try again."},'model_list_page_problem':{message :"There was a problem loading this page.  Please try again."},models_cannot_be_deleted :{message :"The following models cannot be deleted: "},models_cannot_be_deleted_no_permissions :{message :"You do not have permissions to delete any of these models"},'error_in_model_bulk_delete':{message :"There was a problem trying to delete the selected models.  Please try again."},algo_trait_no_model_permissions :{message :"Sorry, you do not have permissions to clone this trait."},'algotrait_no_model_selected':{message :"Please select a model"},algotrait_loading_error :{message :"There was a problem loading this trait.  Please try again."},algotrait_deleted :{message :'Algorithmic Trait deleted!'},unexpected_error :{message :"There was an unexpected error.  Please try again."},trait_created :{message :"The trait has been created"},delete_trait :{message :"Are you sure you want to delete this trait?"},delete_traits :{message :"Are you sure you want to delete these traits?"},'error_in_trait_bulk_delete':{message :"There was a problem trying to delete the selected traits.  Please try again."},trait_deleted :{message :"Trait deleted!"},traits_cannot_be_deleted :{message :"The following trait cannot be deleted: "},traits_cannot_be_deleted_no_permissions :{message :"You do not have permissions to delete one or more of these traits"},no_trait_rule :{message :"No rules to display"},general_trait_problem :{message :"Sorry, this trait could not be loaded."},max_reach_audience_size :{message :'Algorithmic Traits cannot include an audience size of over %%num%% unique visitors. Please select a lower reach or higher accuracy setting.',makeMessage :function(n) {return this.message.replace("%%NUM%%",ADOBE.AM.UTILS.HELPERS.formatNumber(n));}
},no_valid_model_run_values :{message :'All audience sizes from this run are greater than the current max audience size of %%NUM%%.  Please select a different model.',makeMessage :function(n) {return this.message.replace("%%NUM%%",ADOBE.AM.UTILS.HELPERS.formatNumber(n));}
},access_denied_no_create_trait_permission_with_data_provider :{message :'You do not have permissions to create an algorithmic trait with this data provider.'},access_denied_no_read_trait_permission_with_data_provider :{message :'You do not have permissions to view this algorithmic trait with this data provider.'},access_denied_no_edit_trait_permission_with_data_provider :{message :'You do not have permissions to edit this algorithmic trait with this data provider.'},access_denied_no_delete_trait_permission_with_data_provider :{message :'You do not have permissions to delete this algorithmic trait with this data provider.'},access_denied_no_edit_permissions_for_segment :{message :"You do not have permissions to edit this component of the segment"},trait_error_1 :{message :"The Key must start with a letter or quotation."},trait_error_2 :{message :'The Key can only contain letters, numbers, ", -, and _.'},trait_error_3 :{message :'Any quotes (") have to be escaped with a pair of quotes (""").'},trait_error_4 :{message :"For rules containing > or < operators, Value must be numeric only."},trait_error_5 :{message :"An Operator must be selected"},trait_error_6 :{message :"The Value cannot be blank"},trait_error_7 :{message :"You must add quotes around keys with spaces."},trait_error_8 :{message :"You must add a quotes around the entire key."},trait_error_9 :{message :"You can only have 2 quotes and they must be at the beginning and end of the key."},no_results :{message :"No results."},trait_expression_valid :{message :"Valid Expression"},trait_expression_invalid :{message :"Invalid expression"},trait_tab_expression :{message :"Expression Builder"},trait_tab_code :{message :"Code View"},trait_test_url_header_invalid_url :{message :'Invalid URL - Please use a valid URL starting with: <br /> http://'},trait_test_url_header_invalid_fields :{message :'Invalid URL/Header - Please enter a URL and/or Headers to test against'},trait_test_url_header_event_test :{message :"Event Test"},trait_test_url_header_event_test_would_exhibit :{message :"Site visitor with this event would exhibit this trait."},trait_test_url_header_event_test_would_not_exhibit :{message :"Site visitor with this event would not exhibit this trait."},no_datasources_to_create_trait :{message :"Sorry, you cannot create a trait because you do not have access to any Data Sources."},trait_get_pixel_url :{message :'The URLs and tags for the pixel:<br /><br /><b>URL:</b><br /><input type="text" id="__trait_url" value="" size="40"/><br />'+ '<b>Secure URL:</b><br /><input type="text" id="__trait_secure_url" value="" size="40"/><br />'+ '<b>Image Tag:</b><br /><input type="text" id="__trait_img_tag" value="" size="40"/><br />'+ '<b>Image Tag Secure:</b><br /><input type="text" id="__trait_img_secure_tag" value="" size="40"/><br />'},trait_no_model_selected :{message :"Please select a single trait"},traits_no_model_selected :{message :"Please select a trait or traits"},traits_no_selected :{message :"Please select a trait or traits"},cannot_create_model_with_trait :{message :"Sorry, you do not have permissions to create models with this trait."},cannot_create_model_with_segment :{message :"Sorry, you do not have permissions to create models with this segment."},too_many_traits_selected :{message :"Please select only one trait."},too_many_segments_selected :{message :"Please select only one segment."},select_one_segment :{message :"Please select one segment."},clone_copy_of :{message :"Copy of "},trait_type_not_found :{message :"You cannot create this trait.  Please try again."},trait_edit_page_cannot_edit :{message :"You cannot edit this trait.  Please choose another trait."},trait_edit_error_loading_model :{message :"There was an error loading the model.  Please refresh and try again."},generic_404 :{message :"There was an error loading a resource. Please refresh and try again."},segment_added_to_destination :{message :"The segments have been added to the destination."},segment_cannot_clone :{message :"Sorry, you do not have permissions to clone this trait."},destinations_permission_missing_view :{message :"You do not have permissions to view this section"},segments_permission_missing_view :{message :"You do not have permissions to view this section"},user_delete_confirmation :{message :'Are you sure you want to delete this user?'},user_permissions_delete_user :{message :'Delete User'},user_permissions_delete_users :{message :'Delete Users'},user_permissions_delete_user_empty :{message :"You must select at least 1 user to delete"},user_permissions_user_deleted :{message :"User Deleted"},user_permissions_user_deleted_message :{message :"The user has been deleted"},user_deleted_error :{message :"The user(s) could not be deleted"},group_delete_confirmation :{message :'Are you sure you want to delete this group?'},group_permissions_delete_group :{message :'Delete Group'},group_permissions_delete_groups :{message :'Delete Groups'},group_permissions_delete_group_empty :{message :"You must select at least 1 group to delete"},group_permissions_group_deleted :{message :"Group Deleted"},group_permissions_group_deleted_message :{message :"The group has been deleted"},group_deleted_error :{message :"The group(s) could not be deleted"},group_permissions_add_object :{message :"Add Object Permissions"},change_password :{message :'Change Password'},change_password_prompt :{message :'Do you want to reset the users password?'},change_password_problem :{message :'There was a problem resetting the password'},change_password_success :{message :'The password has been reset'},models :{message :'Models'},reports :{message :'Reports'},trait :{message :'Trait'},segment :{message :'Segment'},destination :{message :'Destination'},derived_signals :{message :'Derived Signals'},tags :{message :'Tags'},view_tags :{message :'View Tags'},view_derived_signals :{message :'View Derived Signals'},create_derived_signals :{message :'Create Derived Signals'},edit_derived_signals :{message :'Edit Derived Signals'},delete_derived_signals :{message :'Delete Derived Signals'},delete_all_traits :{message :'Delete All Traits'},create_all_traits :{message :'Create All Traits'},create_all_algo_traits:{message :'Create All Algo Traits'},edit_all_traits :{message :'Edit All Traits'},map_all_to_segments :{message :'Map All To Segments'},map_all_traits_to_models :{message :'Map All Traits To Models'},view_all_traits :{message :'View All Traits'},view_all_destinations :{message :'View All Destinations'},delete_all_destinations :{message :'Delete All Destinations'},edit_all_destinations :{message :'Edit All Destinations'},map_all_segments_to_models :{message :'Map All Segments To Models'},delete_all_segments :{message :'Delete All Segments'},edit_all_segments :{message :'Edit All Segments'},map_all_to_destinations :{message :'Map All To Destinations'},create_all_segments :{message :'Create All Segments'},view_all_segments :{message :'View All Segments'},bid_manager_destination_1_segment :{message :"You can only map 1 segment to this type of destination"},bid_manager_duplicate_userlist :{message :"This Google Bid Manager destination has already been mapped to a segment"},google_user_list_validation_error :{message :"There was a problem mapping this Google Bid Manager destination to this segment"},google_user_list_service_not_reachable :{message :"The Google Bid Manager service is not reachable"},datasource_saved :{message :'The data source was saved successfully.'},datasource_delete_confirmation :{message :'Are you sure you want to delete this data source?'},datasource_permissions_delete_datasource :{message :'Delete Data Source'},datasource_permissions_delete_datasources :{message :'Delete Data Sources'},datasource_permissions_delete_datasource_empty :{message :"You must select at least 1 data source to delete"},datasource_permissions_datasource_deleted :{message :"Data Source Deleted"},datasource_permissions_datasource_deleted_message :{message :"The data source has been deleted"},datasource_deleted_error :{message :"The data source(s) could not be deleted"},resource_limit_exceeded :{message :"The resource limit was exceeded. Please check the Limits page for your resource limit."},no_dcs_event_call_data_returned :{message :"Please check if third party cookies are enabled on your browser.<br />Safari, in particular, disables third party cookies by default.<br />This functionality will also not work if you are using ad blocking software."},months :['January','February','March','April','May','June','July','August','September','October','November','December']
},getMessage:function(errorCode,localization) {return this[localization ||'en_US'][errorCode.toLowerCase()];},getAPIErrorMessage:function(response,options) {var finalMessage ='';var defaultErrorMessage =this.getMessage('generic_api_error').message;var joinChildMessagesOn ='<br />';if (options !==Object(options)) {options ={};}
if (response !==Object(response)) {response ={};}
if (typeof options.joinChildMessagesOn ==='string') {joinChildMessagesOn =options.joinChildMessagesOn;}
if (typeof options.defaultErrorMessage ==='string') {defaultErrorMessage =options.defaultErrorMessage;}
if (Array.isArray(response.childMessages)) {return response.childMessages.join(joinChildMessagesOn);}
var responseText =JSON.parse(response.responseText ||'{}');if (Array.isArray(responseText.childMessages)) {return responseText.childMessages.join(joinChildMessagesOn);}
var data =response.data;if (data !==Object(data)) {data ={};}
var key =response.code ||data.code ||responseText.code ||'';if (typeof options.codePrefix ==='string') {key =options.codePrefix + key;}
var dictionary =this.getMessage(key) ||{};return dictionary.message ||response.message ||data.message ||responseText.message ||defaultErrorMessage;}
};ADOBE.AM.PERMS ={permissions :{traits :{map_to_segments :'MAP_TO_SEGMENTS',view :'READ'},user :{create_destinations :'CREATE_DESTINATIONS',create_all_destinations :'CREATE_ALL_DESTINATIONS',edit_destinations :'EDIT_DESTINATIONS',edit_all_destinations :'EDIT_ALL_DESTINATIONS'},destinations :{write :'WRITE'}
},permission_schemes :{can_view_traits :{UserPermission :['VIEW_TRAITS']
},can_create_trait :{UserPermission :['CREATE_TRAITS','CREATE_ALL_TRAITS'],DataSourcePermission :['CREATE'],TraitPermission :['CREATE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');var trait_permission =perm_object.getPermissionObjects('TraitPermission');if (!(user_permission &&user_permission.hasPermission('CREATE_TRAITS'))) {return false;}
return user_permission.hasPermission('CREATE_ALL_TRAITS')
||(datasource_permission &&datasource_permission.hasPermission('CREATE'))
||(trait_permission &&trait_permission.hasPermission('CREATE'));}
},can_edit_trait :{UserPermission :['EDIT_TRAITS','EDIT_ALL_TRAITS'],TraitPermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var trait_permission =perm_object.getPermissionObjects('TraitPermission');return trait_permission &&trait_permission.hasPermission('WRITE');}
},can_use_dataprovider_to_edit_trait :{UserPermission :['EDIT_TRAITS','EDIT_ALL_TRAITS'],DataSourcePermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission &&!user_permission.hasPermission('EDIT_TRAITS')) {return false;}
else if (user_permission &&user_permission.hasPermission('EDIT_ALL_TRAITS')
||(datasource_permission &&datasource_permission.hasPermission('WRITE')))
{return true;}
return false;}
},can_delete_trait :{UserPermission :['DELETE_TRAITS','DELETE_ALL_TRAITS'],TraitPermission :['DELETE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var trait_permission =perm_object.getPermissionObjects('TraitPermission');return trait_permission &&trait_permission.hasPermission('DELETE');}
},can_show_delete_toolbar_button_in_traitbuilder :{UserPermission :['DELETE_TRAITS']
},can_delete_this_trait_in_traitbuilder :{TraitPermission :['DELETE']
},can_show_add_segment_toolbar_button_in_traitbuilder :{UserPermission :['CREATE_SEGMENTS']
},can_clone_rule_based_trait_in_traitbuilder :{UserPermission :['CREATE_TRAITS','CREATE_ALL_TRAITS'],TraitPermission :['CREATE'],permissionCheck :function(perm_object) {var user_create =this.UserPermission[0];var user_create_all =this.UserPermission[1];var datasource_create =this.TraitPermission[0];var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('TraitPermission');if (user_permission &&!user_permission.hasPermission(user_create)) {return false;}
else if (user_permission &&user_permission.hasPermission(user_create_all)
||datasource_permission &&datasource_permission.hasPermission(datasource_create))
{return true;}
return false;}
},can_clone_algo_trait_in_traitbuilder :{UserPermission :['CREATE_TRAITS','CREATE_ALL_TRAITS'],TraitPermission :['CREATE','CREATE_ALGO_TRAITS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var trait_permission =perm_object.getPermissionObjects('TraitPermission');if (user_permission &&!user_permission.hasPermission('CREATE_TRAITS')) {return false;}
else if (user_permission &&user_permission.hasPermission('CREATE_ALL_TRAITS')
||(trait_permission &&trait_permission.hasPermission('CREATE')
&&trait_permission &&trait_permission.hasPermission("CREATE_ALGO_TRAITS")))
{return true;}
return false;}
},can_use_dataprovider_to_create_trait :{DataSourcePermission :['CREATE']
},can_create_trait_in_traitbuilder :{UserPermission :['CREATE_TRAITS','CREATE_ALL_TRAITS'],DataSourcePermission :['CREATE'],permissionCheck :function(perm_object) {var user_create =this.UserPermission[0];var user_create_all =this.UserPermission[1];var datasource_create =this.DataSourcePermission[0];var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission &&!user_permission.hasPermission(user_create)) {return false;}
else if (user_permission &&user_permission.hasPermission(user_create_all)
||datasource_permission &&datasource_permission.hasPermission(datasource_create))
{return true;}
return false;}
},can_create_model_with_selected :{UserPermission :['CREATE_MODELS'],DataSourcePermission :['MAP_TO_MODELS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (!(user_permission &&user_permission.hasPermission('CREATE_MODELS'))) {return false;}
return datasource_permission &&datasource_permission.hasPermission('MAP_TO_MODELS');}
},can_edit_derived_signals :{UserPermission :['EDIT_DERIVED_SIGNALS']
},can_delete_derived_signals :{UserPermission :['DELETE_DERIVED_SIGNALS']
},can_view_model :{ModelPermission :['CREATE_ALGO_TRAITS','READ']
},can_clone_model :{UserPermission :['CREATE_MODELS'],ModelPermission :['CREATE','READ'],permissionCheck :function(perm_object) {var user_create =this.UserPermission[0];var model_create =this.ModelPermission[0];var model_read =this.ModelPermission[1];var user_permission =perm_object.getPermissionObjects('UserPermission');var model_permission =perm_object.getPermissionObjects('ModelPermission');if (user_permission &&!user_permission.hasPermission(user_create)) {return false;}
else if (model_permission &&model_permission.hasPermission(model_create)
&&model_permission.hasPermission(model_read))
{return true;}
return false;}
},can_pause_play_model :{UserPermission :['EDIT_MODELS'],ModelPermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var model_permission =perm_object.getPermissionObjects('ModelPermission');if (user_permission &&!user_permission.hasPermission('EDIT_MODELS')) {return false;}
else if (model_permission &&model_permission.hasPermission('WRITE'))
{return true;}
return false;}
},can_edit_model :{UserPermission :['EDIT_MODELS'],ModelPermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var model_permission =perm_object.getPermissionObjects('ModelPermission');if (user_permission &&!user_permission.hasPermission('EDIT_MODELS')) {return false;}
else if (model_permission &&model_permission.hasPermission('WRITE'))
{return true;}
return false;}
},can_delete_single_model :{UserPermission :['DELETE_MODELS'],ModelPermission :['DELETE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var model_permission =perm_object.getPermissionObjects('ModelPermission');if (user_permission &&!user_permission.hasPermission('DELETE_MODELS')) {return false;}
else if (model_permission &&model_permission.hasPermission('DELETE')) {return true;}
return false;}
},can_delete_model :{UserPermission :['DELETE_MODELS'],DataSourcePermission :['MAP_TO_MODELS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission &&!user_permission.hasPermission('DELETE_MODELS')) {return false;}
else if (datasource_permission &&datasource_permission.hasPermission('MAP_TO_MODELS')) {return true;}
return false;}
},can_create_model :{UserPermission :['CREATE_MODELS'],DataSourcePermission :['MAP_TO_MODELS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission &&!user_permission.hasPermission('CREATE_MODELS')) {return false;}
else if (datasource_permission &&datasource_permission.hasPermission('MAP_TO_MODELS'))
{return true;}
return false;}
},can_create_trait_with_current_model :{ModelPermission :['CREATE_ALGO_TRAITS']
},can_view_destinations :{UserPermission :'VIEW_DESTINATIONS'},can_edit_destination :{DestinationPermission :['WRITE'],UserPermission :['EDIT_DESTINATIONS','EDIT_ALL_DESTINATIONS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var destination_permission =perm_object.getPermissionObjects('DestinationPermission');if (user_permission
&&user_permission.hasPermission('EDIT_DESTINATIONS')
&&user_permission.hasPermission('EDIT_ALL_DESTINATIONS'))
{return true;}
else if (user_permission &&destination_permission
&&user_permission.hasPermission('EDIT_DESTINATIONS')
&&destination_permission.hasPermission('WRITE'))
{return true;}
return false;}
},can_delete_destination :{DestinationPermission :['DELETE'],UserPermission :['DELETE_DESTINATIONS','DELETE_ALL_DESTINATIONS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var destination_permission =perm_object.getPermissionObjects('DestinationPermission');if (!(user_permission &&user_permission.hasPermission('DELETE_DESTINATIONS')))
{return false;}
if ((user_permission &&user_permission.hasPermission('DELETE_ALL_DESTINATIONS'))
||(destination_permission &&destination_permission.hasPermission('DELETE')))
{return true;}
return false;}
},can_use_dataprovider_to_create_segment :{DataSourcePermission :['CREATE']
},can_use_dataprovider_to_edit_segment :{UserPermission :['EDIT_SEGMENTS','EDIT_ALL_SEGMENTS'],DataSourcePermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission &&!user_permission.hasPermission('EDIT_SEGMENTS')) {return false;}
if (user_permission &&user_permission.hasPermission('EDIT_ALL_SEGMENTS')
||(datasource_permission &&datasource_permission.hasPermission('WRITE')))
{return true;}
return false;}
},can_edit_segment_in_segmentbuilder :{UserPermission :['EDIT_SEGMENTS','EDIT_ALL_SEGMENTS'],SegmentPermission :['WRITE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var segment_permission =perm_object.getPermissionObjects('SegmentPermission');if (user_permission &&!user_permission.hasPermission('EDIT_SEGMENTS')) {return false;}
if (user_permission &&user_permission.hasPermission('EDIT_ALL_SEGMENTS')
||(segment_permission &&segment_permission.hasPermission('WRITE')))
{return true;}
return false;}
},can_create_segment_in_segmentbuilder :{UserPermission :['CREATE_ALL_SEGMENTS','CREATE_SEGMENTS'],DataSourcePermission :['CREATE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var datasource_permission =perm_object.getPermissionObjects('DataSourcePermission');if (user_permission.hasPermission('CREATE_ALL_SEGMENTS')) {return true;}
else if (user_permission &&datasource_permission
&&user_permission.hasPermission('CREATE_SEGMENTS')
&&datasource_permission.hasPermission('CREATE')) {return true;}
return false;}
},can_view_segments :{UserPermission :['VIEW_SEGMENTS']
},can_clone_segment_in_segmentbuilder :{UserPermission :['CREATE_SEGMENTS','CREATE_ALL_SEGMENTS'],SegmentPermission :['CREATE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var segment_permission =perm_object.getPermissionObjects('SegmentPermission');if (user_permission &&!user_permission.hasPermission('CREATE_SEGMENTS')) {return false;}
if (user_permission.hasPermission('CREATE_ALL_SEGMENTS')
||(segment_permission &&segment_permission.hasPermission('CREATE')))
{return true;}
return false;}
},can_map_trait_to_segment_in_segmentbuilder :{UserPermission :['VIEW_TRAITS','MAP_ALL_TO_SEGMENTS']
},can_delete_segment_in_segmentbuilder :{UserPermission :['DELETE_SEGMENTS','DELETE_ALL_SEGMENTS'],SegmentPermission :['DELETE'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var segment_permission =perm_object.getPermissionObjects('SegmentPermission');if (!user_permission.hasPermission('DELETE_SEGMENTS')) {return false;}
if (user_permission.hasPermission('DELETE_ALL_SEGMENTS')) {return true;}
if (segment_permission &&segment_permission.hasPermission('DELETE')) {return true;}
return false;}
},can_show_segment_to_destination_in_sb_toolbar_buttons :{UserPermission :['VIEW_DESTINATIONS']
},can_map_segment_to_destination_in_segmentbuilder :{UserPermission :['VIEW_DESTINATIONS','VIEW_SEGMENTS','VIEW_ALL_SEGMENTS','MAP_ALL_TO_DESTINATIONS'],SegmentPermission :['READ','MAP_TO_DESTINATIONS'],permissionCheck :function(perm_object) {var user_permission =perm_object.getPermissionObjects('UserPermission');var segment_permission =perm_object.getPermissionObjects('SegmentPermission');if (!user_permission.hasPermission('VIEW_DESTINATIONS')) {return false;}
if (!user_permission.hasPermission('VIEW_SEGMENTS')) {return false;}
if (!(user_permission.hasPermission('VIEW_ALL_SEGMENTS')
||segment_permission &&segment_permission.hasPermission('READ')))
{return false;}
if (!(user_permission.hasPermission('MAP_ALL_TO_DESTINATIONS')
||segment_permission &&segment_permission.hasPermission('MAP_TO_DESTINATIONS')))
{return false;}
return true;}
},can_create_datasources_in_toolbar :{UserPermission :['CREATE_DATASOURCES']
},can_edit_datasources_in_toolbar :{UserPermission :['EDIT_DATASOURCES']
},can_delete_datasources_in_toolbar :{UserPermission :['DELETE_DATASOURCES']
}
}
};(function($){$.fn.serializeJSON=function() {var json ={};jQuery.map($(this).serializeArray(),function(n,i){json[n['name']] =n['value'];});return json;};})(jQuery );(function($) {$.whenAlways =function() {var num,loaded =[],$deferred =$.Deferred();if (arguments.length ==1 &&arguments[0].length) {arguments =arguments[0];}
num =arguments.length;for (var i=0;i < num;i++) {loaded[i] =false;}
for (var i=0;i < num;i++) {(function() {$.when(arguments[i]).always(function() {loaded[i] =true;checkLoaded();});})();}
function checkLoaded() {for (var i=0;i < num;i++) {if (!loaded[i]) {return false;}
if (i ==num-1) {$deferred.resolve();}
}
}
return $deferred;};})(jQuery);window.getTemplate =window.getTemplate ||function(id,templateSrc,dataObj) {if (typeof window.getTemplate.cache =='undefined') {window.getTemplate.cache ={nodeStore :{},templates :{},getFromCache :function(id,templateSrc) {var src,match;if (this.nodeStore[templateSrc]) {src =this.nodeStore[templateSrc];} else {src =this.setSourceCache(templateSrc);}
if (!this.templates[id]) {_.each(src.childNodes,function(node) {if (node.nodeName !='SCRIPT') {src.removeChild(node);}
});match =(_.filter(src.childNodes,function(node) {if (node.id !=id) {return false;} else {src.removeChild(node);return node;}
}
))[0];this.setTemplateCache(id,match.innerHTML);}
return this.templates[id];},setSourceCache :function(templateSrc) {var div =document.createElement('div');div.innerHTML =templateSrc;this.nodeStore[templateSrc] =div;return div;},setTemplateCache :function(id,template) {this.templates[id] =template;}
}
}
var template =getTemplate.cache.getFromCache(id,templateSrc),doCompile =true;if (!dataObj) {doCompile =true;} else {if (dataObj.compile ==true ||typeof dataObj.compile =='undefined') {doCompile =true;} else if (dataObj.compile ==false) {doCompile =false;delete dataObj.compile;}
}
return doCompile ?_.template(template,dataObj) :template;};(function(c,j){function k(a,b){var d=a.nodeName.toLowerCase();if("area"===d){b=a.parentNode;d=b.name;if(!a.href||!d||b.nodeName.toLowerCase()!=="map")return false;a=c("img[usemap=#"+d+"]")[0];return!!a&&l(a)}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||b:b)&&l(a)}function l(a){return!c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)}).length}c.ui=c.ui||{};if(!c.ui.version){c.extend(c.ui,{version:"1.8.16",
keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});c.fn.extend({propAttr:c.fn.prop||c.fn.attr,_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,
"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==j)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);if(!isNaN(b)&&b!==0)return b}a=a.parent()}}return 0},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}});c.each(["Width","Height"],function(a,b){function d(f,g,m,n){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;if(m)g-=parseFloat(c.curCSS(f,"border"+this+"Width",true))||0;if(n)g-=parseFloat(c.curCSS(f,"margin"+this,true))||0});return g}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,outerWidth:c.fn.outerWidth,outerHeight:c.fn.outerHeight};c.fn["inner"+b]=function(f){if(f===j)return i["inner"+b].call(this);return this.each(function(){c(this).css(h,d(this,f)+"px")})};c.fn["outer"+b]=function(f,g){if(typeof f!=="number")return i["outer"+b].call(this,f);return this.each(function(){c(this).css(h,d(this,f,true,g)+"px")})}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){return k(a,!isNaN(c.attr(a,"tabindex")))},tabbable:function(a){var b=c.attr(a,"tabindex"),d=isNaN(b);return(d||b>=0)&&k(a,!d)}});c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});c.support.minHeight=b.offsetHeight===100;c.support.selectstart="onselectstart"in b;a.removeChild(b).style.display="none"});c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden")return false;b=b&&b==="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&c.ui.isOverAxis(b,e,i)}})}})(jQuery);;(function(b,j){if(b.cleanData){var k=b.cleanData;b.cleanData=function(a){for(var c=0,d;(d=a[c])!=null;c++)try{b(d).triggerHandler("remove")}catch(e){}k(a)}}else{var l=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add([this]).each(function(){try{b(this).triggerHandler("remove")}catch(d){}});return l.call(b(this),a,c)})}}b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=function(h){return!!b.data(h,a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend(true,{},c.options);b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;if(e&&d.charAt(0)==="_")return h;e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==j){h=i;return false}}):this.each(function(){var g=b.data(this,a);g?g.option(d||{})._init():b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);this.element=b(c);this.options=b.extend(true,{},this.options,this._getCreateOptions(),a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+
"-disabled ui-state-disabled")},widget:function(){return this.element},option:function(a,c){var d=a;if(arguments.length===0)return b.extend({},this.options);if(typeof a==="string"){if(c===j)return this.options[a];d={};d[a]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(d,e){c._setOption(d,e)});return this},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c);return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);;(function(b){var d=false;b(document).mouseup(function(){d=false});b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(c){return a._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(true===b.data(c.target,a.widgetName+".preventClickEvent")){b.removeData(c.target,a.widgetName+".preventClickEvent");c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+
this.widgetName)},_mouseDown:function(a){if(!d){this._mouseStarted&&this._mouseUp(a);this._mouseDownEvent=a;var c=this,f=a.which==1,g=typeof this.options.cancel=="string"&&a.target.nodeName?b(a.target).closest(this.options.cancel).length:false;if(!f||g||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=this._mouseStart(a)!==false;if(!this._mouseStarted){a.preventDefault();return true}}true===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");this._mouseMoveDelegate=function(e){return c._mouseMove(e)};this._mouseUpDelegate=function(e){return c._mouseUp(e)};b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);a.preventDefault();return d=true}},_mouseMove:function(a){if(b.browser.msie&&!(document.documentMode>=9)&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",true);this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);;(function(c){c.ui=c.ui||{};var n=/left|center|right/,o=/top|center|bottom/,t=c.fn.position,u=c.fn.offset;c.fn.position=function(b){if(!b||!b.of)return t.apply(this,arguments);b=c.extend({},b);var a=c(b.of),d=a[0],g=(b.collision||"flip").split(" "),e=b.offset?b.offset.split(" "):[0,0],h,k,j;if(d.nodeType===9){h=a.width();k=a.height();j={top:0,left:0}}else if(d.setTimeout){h=a.width();k=a.height();j={top:a.scrollTop(),left:a.scrollLeft()}}else if(d.preventDefault){b.at="left top";h=k=0;j={top:b.of.pageY,
left:b.of.pageX}}else{h=a.outerWidth();k=a.outerHeight();j=a.offset()}c.each(["my","at"],function(){var f=(b[this]||"").split(" ");if(f.length===1)f=n.test(f[0])?f.concat(["center"]):o.test(f[0])?["center"].concat(f):["center","center"];f[0]=n.test(f[0])?f[0]:"center";f[1]=o.test(f[1])?f[1]:"center";b[this]=f});if(g.length===1)g[1]=g[0];e[0]=parseInt(e[0],10)||0;if(e.length===1)e[1]=e[0];e[1]=parseInt(e[1],10)||0;if(b.at[0]==="right")j.left+=h;else if(b.at[0]==="center")j.left+=h/2;if(b.at[1]==="bottom")j.top+=k;else if(b.at[1]==="center")j.top+=k/2;j.left+=e[0];j.top+=e[1];return this.each(function(){var f=c(this),l=f.outerWidth(),m=f.outerHeight(),p=parseInt(c.curCSS(this,"marginLeft",true))||0,q=parseInt(c.curCSS(this,"marginTop",true))||0,v=l+p+(parseInt(c.curCSS(this,"marginRight",true))||0),w=m+q+(parseInt(c.curCSS(this,"marginBottom",true))||0),i=c.extend({},j),r;if(b.my[0]==="right")i.left-=l;else if(b.my[0]==="center")i.left-=l/2;if(b.my[1]==="bottom")i.top-=m;else if(b.my[1]==="center")i.top-=m/2;i.left=Math.round(i.left);i.top=Math.round(i.top);r={left:i.left-p,top:i.top-q};c.each(["left","top"],function(s,x){c.ui.position[g[s]]&&c.ui.position[g[s]][x](i,{targetWidth:h,targetHeight:k,elemWidth:l,elemHeight:m,collisionPosition:r,collisionWidth:v,collisionHeight:w,offset:e,my:b.my,at:b.at})});c.fn.bgiframe&&f.bgiframe();f.offset(c.extend(i,{using:b.using}))})};c.ui.position={fit:{left:function(b,a){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();b.left=d>0?b.left-d:Math.max(b.left-a.collisionPosition.left,b.left)},top:function(b,a){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();b.top=d>0?b.top-d:Math.max(b.top-a.collisionPosition.top,b.top)}},flip:{left:function(b,a){if(a.at[0]!=="center"){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();var g=a.my[0]==="left"?-a.elemWidth:a.my[0]==="right"?a.elemWidth:0,e=a.at[0]==="left"?a.targetWidth:-a.targetWidth,h=-2*a.offset[0];b.left+=a.collisionPosition.left<0?g+e+h:d>0?g+e+h:0}},top:function(b,a){if(a.at[1]!=="center"){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();var g=a.my[1]==="top"?-a.elemHeight:a.my[1]==="bottom"?a.elemHeight:0,e=a.at[1]==="top"?a.targetHeight:-a.targetHeight,h=-2*a.offset[1];b.top+=a.collisionPosition.top<0?g+e+h:d>0?g+e+h:0}}}};if(!c.offset.setOffset){c.offset.setOffset=function(b,a){if(/static/.test(c.curCSS(b,"position")))b.style.position="relative";var d=c(b),
g=d.offset(),e=parseInt(c.curCSS(b,"top",true),10)||0,h=parseInt(c.curCSS(b,"left",true),10)||0;g={top:a.top-g.top+e,left:a.left-g.left+h};"using"in a?a.using.call(b,g):d.css(g)};c.fn.offset=function(b){var a=this[0];if(!a||!a.ownerDocument)return null;if(b)return this.each(function(){c.offset.setOffset(this,b)});return u.call(this)}}})(jQuery);;(function(d){d.widget("ui.draggable",d.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper=="original"&&!/^(?:r|a|f)/.test(this.element.css("position")))this.element[0].style.position="relative";this.options.addClasses&&this.element.addClass("ui-draggable");this.options.disabled&&this.element.addClass("ui-draggable-disabled");this._mouseInit()},destroy:function(){if(this.element.data("draggable")){this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this}},_mouseCapture:function(a){var b=
this.options;if(this.helper||b.disabled||d(a.target).is(".ui-resizable-handle"))return false;this.handle=this._getHandle(a);if(!this.handle)return false;if(b.iframeFix)d(b.iframeFix===true?"iframe":b.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")});return true},_mouseStart:function(a){var b=this.options;this.helper=this._createHelper(a);this._cacheHelperProportions();if(d.ui.ddmanager)d.ui.ddmanager.current=this;this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this.position=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);b.containment&&this._setContainment();if(this._trigger("start",a)===false){this._clear();return false}this._cacheHelperProportions();d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.helper.addClass("ui-draggable-dragging");this._mouseDrag(a,true);d.ui.ddmanager&&d.ui.ddmanager.dragStart(this,a);return true},_mouseDrag:function(a,b){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!b){b=this._uiHash();if(this._trigger("drag",a,b)===false){this._mouseUp({});return false}this.position=b.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return false},_mouseStop:function(a){var b=false;if(d.ui.ddmanager&&!this.options.dropBehaviour)b=d.ui.ddmanager.drop(this,a);if(this.dropped){b=this.dropped;this.dropped=false}if((!this.element[0]||!this.element[0].parentNode)&&this.options.helper=="original")return false;if(this.options.revert=="invalid"&&!b||this.options.revert=="valid"&&b||this.options.revert===true||d.isFunction(this.options.revert)&&this.options.revert.call(this.element,b)){var c=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){c._trigger("stop",a)!==false&&c._clear()})}else this._trigger("stop",a)!==false&&this._clear();return false},_mouseUp:function(a){this.options.iframeFix===true&&d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)});d.ui.ddmanager&&d.ui.ddmanager.dragStop(this,a);return d.ui.mouse.prototype._mouseUp.call(this,a)},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var b=!this.options.handle||!d(this.options.handle,this.element).length?true:false;d(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==a.target)b=true});return b},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a])):b.helper=="clone"?this.element.clone().removeAttr("id"):this.element;a.parents("body").length||a.appendTo(b.appendTo=="parent"?this.element[0].parentNode:b.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&
a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[a.containment=="document"?0:d(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,a.containment=="document"?0:d(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,(a.containment=="document"?0:d(window).scrollLeft())+d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a.containment=="document"?0:d(window).scrollTop())+(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&a.containment.constructor!=Array){a=d(a.containment);var b=a[0];if(b){a.offset();var c=d(b).css("overflow")!=
"hidden";this.containment=[(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0),(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0),(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom];this.relative_container=a}}else if(a.containment.constructor==Array)this.containment=a.containment},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName);return{top:b.top+
this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName),e=a.pageX,h=a.pageY;if(this.originalPosition){var g;if(this.containment){if(this.relative_container){g=this.relative_container.offset();g=[this.containment[0]+g.left,this.containment[1]+g.top,this.containment[2]+g.left,this.containment[3]+g.top]}else g=this.containment;if(a.pageX-this.offset.click.left<g[0])e=g[0]+this.offset.click.left;
if(a.pageY-this.offset.click.top<g[1])h=g[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>g[2])e=g[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>g[3])h=g[3]+this.offset.click.top}if(b.grid){h=b.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/b.grid[1])*b.grid[1]:this.originalPageY;h=g?!(h-this.offset.click.top<g[1]||h-this.offset.click.top>g[3])?h:!(h-this.offset.click.top<g[1])?h-b.grid[1]:h+b.grid[1]:h;e=b.grid[0]?this.originalPageX+Math.round((e-this.originalPageX)/
b.grid[0])*b.grid[0]:this.originalPageX;e=g?!(e-this.offset.click.left<g[0]||e-this.offset.click.left>g[2])?e:!(e-this.offset.click.left<g[0])?e-b.grid[0]:e+b.grid[0]:e}}return{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop()),left:e-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<
526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=false},_trigger:function(a,b,c){c=c||this._uiHash();d.ui.plugin.call(this,a,[b,c]);if(a=="drag")this.positionAbs=this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,b,c)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.16"});d.ui.plugin.add("draggable","connectToSortable",{start:function(a,b){var c=d(this).data("draggable"),f=c.options,e=d.extend({},b,{item:c.element});c.sortables=[];d(f.connectToSortable).each(function(){var h=d.data(this,"sortable");if(h&&!h.options.disabled){c.sortables.push({instance:h,shouldRevert:h.options.revert});h.refreshPositions();h._trigger("activate",a,e)}})},stop:function(a,b){var c=d(this).data("draggable"),f=d.extend({},b,{item:c.element});d.each(c.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;c.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert)this.instance.options.revert=true;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;c.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else{this.instance.cancelHelperRemoval=false;this.instance._trigger("deactivate",a,f)}})},drag:function(a,b){var c=d(this).data("draggable"),f=this;d.each(c.sortables,function(){this.instance.positionAbs=c.positionAbs;this.instance.helperProportions=c.helperProportions;this.instance.offset.click=c.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=d(f).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",true);this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return b.helper[0]};a.target=this.instance.currentItem[0];this.instance._mouseCapture(a,true);this.instance._mouseStart(a,true,true);this.instance.offset.click.top=c.offset.click.top;this.instance.offset.click.left=c.offset.click.left;this.instance.offset.parent.left-=c.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=c.offset.parent.top-this.instance.offset.parent.top;c._trigger("toSortable",a);c.dropped=this.instance.element;c.currentItem=c.element;this.instance.fromOutside=c}this.instance.currentItem&&this.instance._mouseDrag(a)}else if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",a,this.instance._uiHash(this.instance));this.instance._mouseStop(a,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();this.instance.placeholder&&this.instance.placeholder.remove();c._trigger("fromSortable",a);c.dropped=false}})}});d.ui.plugin.add("draggable","cursor",{start:function(){var a=d("body"),b=d(this).data("draggable").options;if(a.css("cursor"))b._cursor=a.css("cursor");a.css("cursor",b.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","opacity",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("opacity"))b._opacity=a.css("opacity");a.css("opacity",b.opacity)},stop:function(a,b){a=d(this).data("draggable").options;a._opacity&&d(b.helper).css("opacity",a._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var b=d(this).data("draggable"),c=b.options,f=false;if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){if(!c.axis||c.axis!="x")if(b.overflowOffset.top+b.scrollParent[0].offsetHeight-a.pageY<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop+c.scrollSpeed;else if(a.pageY-b.overflowOffset.top<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop-c.scrollSpeed;if(!c.axis||c.axis!="y")if(b.overflowOffset.left+b.scrollParent[0].offsetWidth-a.pageX<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft+c.scrollSpeed;else if(a.pageX-b.overflowOffset.left<
c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft-c.scrollSpeed}else{if(!c.axis||c.axis!="x")if(a.pageY-d(document).scrollTop()<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()-c.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()+c.scrollSpeed);if(!c.axis||c.axis!="y")if(a.pageX-d(document).scrollLeft()<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()-
c.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()+c.scrollSpeed)}f!==false&&d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(b,a)}});d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),b=a.options;a.snapElements=[];d(b.snap.constructor!=String?b.snap.items||":data(draggable)":b.snap).each(function(){var c=d(this),f=c.offset();this!=a.element[0]&&a.snapElements.push({item:this,width:c.outerWidth(),height:c.outerHeight(),top:f.top,left:f.left})})},drag:function(a,b){for(var c=d(this).data("draggable"),f=c.options,e=f.snapTolerance,h=b.offset.left,g=h+c.helperProportions.width,n=b.offset.top,o=n+c.helperProportions.height,i=c.snapElements.length-1;i>=0;i--){var j=c.snapElements[i].left,l=j+c.snapElements[i].width,k=c.snapElements[i].top,m=k+c.snapElements[i].height;if(j-e<h&&h<l+e&&k-e<n&&n<m+e||j-e<h&&h<l+e&&k-e<o&&o<m+e||j-e<g&&g<l+e&&k-e<n&&n<m+e||j-e<g&&g<l+e&&k-e<o&&o<m+e){if(f.snapMode!="inner"){var p=Math.abs(k-o)<=e,q=Math.abs(m-n)<=e,r=Math.abs(j-g)<=e,s=Math.abs(l-h)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k-c.helperProportions.height,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j-c.helperProportions.width}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l}).left-c.margins.left}var t=p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(k-n)<=e;q=Math.abs(m-o)<=e;r=Math.abs(j-h)<=e;s=Math.abs(l-g)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m-c.helperProportions.height,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l-c.helperProportions.width}).left-c.margins.left}if(!c.snapElements[i].snapping&&(p||q||r||s||t))c.options.snap.snap&&c.options.snap.snap.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=p||q||r||s||t}else{c.snapElements[i].snapping&&c.options.snap.release&&c.options.snap.release.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=false}}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options;a=d.makeArray(d(a.stack)).sort(function(c,f){return(parseInt(d(c).css("zIndex"),10)||0)-(parseInt(d(f).css("zIndex"),10)||0)});if(a.length){var b=parseInt(a[0].style.zIndex)||0;d(a).each(function(c){this.style.zIndex=b+c});this[0].style.zIndex=b+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("zIndex"))b._zIndex=a.css("zIndex");a.css("zIndex",b.zIndex)},stop:function(a,b){a=d(this).data("draggable").options;a._zIndex&&d(b.helper).css("zIndex",a._zIndex)}})})(jQuery);;(function(d){d.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var a=this.options,b=a.accept;this.isover=0;this.isout=1;this.accept=d.isFunction(b)?b:function(c){return c.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};d.ui.ddmanager.droppables[a.scope]=d.ui.ddmanager.droppables[a.scope]||[];d.ui.ddmanager.droppables[a.scope].push(this);a.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){for(var a=d.ui.ddmanager.droppables[this.options.scope],b=0;b<a.length;b++)a[b]==this&&a.splice(b,1);this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(a,b){if(a=="accept")this.accept=d.isFunction(b)?b:function(c){return c.is(b)};d.Widget.prototype._setOption.apply(this,arguments)},_activate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass);b&&this._trigger("activate",a,this.ui(b))},_deactivate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass);b&&this._trigger("deactivate",a,this.ui(b))},_over:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.addClass(this.options.hoverClass);this._trigger("over",a,this.ui(b))}},_out:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("out",a,this.ui(b))}},_drop:function(a,b){var c=b||d.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return false;var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var g=d.data(this,"droppable");if(g.options.greedy&&!g.options.disabled&&g.options.scope==c.options.scope&&g.accept.call(g.element[0],c.currentItem||c.element)&&d.ui.intersect(c,d.extend(g,{offset:g.element.offset()}),g.options.tolerance)){e=true;return false}});if(e)return false;if(this.accept.call(this.element[0],c.currentItem||c.element)){this.options.activeClass&&this.element.removeClass(this.options.activeClass);this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("drop",a,this.ui(c));return this.element}return false},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}});d.extend(d.ui.droppable,{version:"1.8.16"});d.ui.intersect=function(a,b,c){if(!b.offset)return false;var e=(a.positionAbs||a.position.absolute).left,g=e+a.helperProportions.width,f=(a.positionAbs||a.position.absolute).top,h=f+a.helperProportions.height,i=b.offset.left,k=i+b.proportions.width,j=b.offset.top,l=j+b.proportions.height;switch(c){case "fit":return i<=e&&g<=k&&j<=f&&h<=l;case "intersect":return i<e+a.helperProportions.width/2&&g-a.helperProportions.width/2<k&&j<f+a.helperProportions.height/2&&h-a.helperProportions.height/2<l;case "pointer":return d.ui.isOver((a.positionAbs||a.position.absolute).top+(a.clickOffset||a.offset.click).top,(a.positionAbs||a.position.absolute).left+(a.clickOffset||a.offset.click).left,j,i,b.proportions.height,b.proportions.width);case "touch":return(f>=j&&f<=l||h>=j&&h<=l||f<j&&h>l)&&(e>=i&&e<=k||g>=i&&g<=k||e<i&&g>k);default:return false}};d.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(a,b){var c=d.ui.ddmanager.droppables[a.options.scope]||[],e=b?b.type:null,g=(a.currentItem||a.element).find(":data(droppable)").andSelf(),f=0;a:for(;f<c.length;f++)if(!(c[f].options.disabled||a&&!c[f].accept.call(c[f].element[0],a.currentItem||a.element))){for(var h=0;h<g.length;h++)if(g[h]==c[f].element[0]){c[f].proportions.height=0;continue a}c[f].visible=c[f].element.css("display")!="none";if(c[f].visible){e=="mousedown"&&c[f]._activate.call(c[f],b);c[f].offset=c[f].element.offset();c[f].proportions={width:c[f].element[0].offsetWidth,height:c[f].element[0].offsetHeight}}}},drop:function(a,b){var c=false;d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(this.options){if(!this.options.disabled&&this.visible&&d.ui.intersect(a,this,this.options.tolerance))c=c||this._drop.call(this,b);if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],a.currentItem||a.element)){this.isout=1;this.isover=0;this._deactivate.call(this,b)}}});return c},dragStart:function(a,b){a.element.parents(":not(body,html)").bind("scroll.droppable",function(){a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)})},drag:function(a,b){a.options.refreshPositions&&d.ui.ddmanager.prepareOffsets(a,b);d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(!(this.options.disabled||this.greedyChild||!this.visible)){var c=d.ui.intersect(a,this,this.options.tolerance);if(c=!c&&this.isover==1?"isout":c&&this.isover==0?"isover":null){var e;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");if(g.length){e=d.data(g[0],"droppable");e.greedyChild=c=="isover"?1:0}}if(e&&c=="isover"){e.isover=0;e.isout=1;e._out.call(e,b)}this[c]=1;this[c=="isout"?"isover":"isout"]=0;this[c=="isover"?"_over":"_out"].call(this,b);if(e&&c=="isout"){e.isout=0;e.isover=1;e._over.call(e,b)}}}})},dragStop:function(a,b){a.element.parents(":not(body,html)").unbind("scroll.droppable");a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)}}})(jQuery);;(function(e){e.widget("ui.resizable",e.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1E3},_create:function(){var b=this,a=this.options;this.element.addClass("ui-resizable");e.extend(this,{_aspectRatio:!!a.aspectRatio,aspectRatio:a.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:a.helper||a.ghost||a.animate?a.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){/relative/.test(this.element.css("position"))&&e.browser.opera&&this.element.css({position:"relative",top:"auto",left:"auto"});this.element.wrap(e('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),
top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=a.handles||(!e(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all")this.handles="n,e,s,w,se,sw,ne,nw";var c=this.handles.split(",");this.handles={};for(var d=0;d<c.length;d++){var f=e.trim(c[d]),g=e('<div class="ui-resizable-handle '+("ui-resizable-"+f)+'"></div>');/sw|se|ne|nw/.test(f)&&g.css({zIndex:++a.zIndex});"se"==f&&g.addClass("ui-icon ui-icon-gripsmall-diagonal-se");this.handles[f]=".ui-resizable-"+f;this.element.append(g)}}this._renderAxis=function(h){h=h||this.element;for(var i in this.handles){if(this.handles[i].constructor==
String)this.handles[i]=e(this.handles[i],this.element).show();if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var j=e(this.handles[i],this.element),l=0;l=/sw|ne|nw|se|n|s/.test(i)?j.outerHeight():j.outerWidth();j=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");h.css(j,l);this._proportionallyResize()}e(this.handles[i])}};this._renderAxis(this.element);this._handles=e(".ui-resizable-handle",this.element).disableSelection();
this._handles.mouseover(function(){if(!b.resizing){if(this.className)var h=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=h&&h[1]?h[1]:"se"}});if(a.autoHide){this._handles.hide();e(this.element).addClass("ui-resizable-autohide").hover(function(){if(!a.disabled){e(this).removeClass("ui-resizable-autohide");b._handles.show()}},function(){if(!a.disabled)if(!b.resizing){e(this).addClass("ui-resizable-autohide");b._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();
var b=function(c){e(c).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){b(this.element);var a=this.element;a.after(this.originalElement.css({position:a.css("position"),width:a.outerWidth(),height:a.outerHeight(),top:a.css("top"),left:a.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);b(this.originalElement);return this},_mouseCapture:function(b){var a=false;for(var c in this.handles)if(e(this.handles[c])[0]==b.target)a=true;return!this.options.disabled&&a},_mouseStart:function(b){var a=this.options,c=this.element.position(),d=this.element;this.resizing=true;this.documentScroll={top:e(document).scrollTop(),left:e(document).scrollLeft()};if(d.is(".ui-draggable")||/absolute/.test(d.css("position")))d.css({position:"absolute",top:c.top,left:c.left});e.browser.opera&&/relative/.test(d.css("position"))&&d.css({position:"relative",top:"auto",left:"auto"});
this._renderProxy();c=m(this.helper.css("left"));var f=m(this.helper.css("top"));if(a.containment){c+=e(a.containment).scrollLeft()||0;f+=e(a.containment).scrollTop()||0}this.offset=this.helper.offset();this.position={left:c,top:f};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:c,top:f};this.sizeDiff={width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:b.pageX,top:b.pageY};this.aspectRatio=typeof a.aspectRatio=="number"?a.aspectRatio:this.originalSize.width/this.originalSize.height||1;a=e(".ui-resizable-"+this.axis).css("cursor");e("body").css("cursor",a=="auto"?this.axis+"-resize":a);d.addClass("ui-resizable-resizing");this._propagate("start",b);return true},_mouseDrag:function(b){var a=this.helper,c=this.originalMousePosition,d=this._change[this.axis];if(!d)return false;c=d.apply(this,[b,b.pageX-c.left||0,b.pageY-c.top||0]);this._updateVirtualBoundaries(b.shiftKey);if(this._aspectRatio||b.shiftKey)c=this._updateRatio(c,b);c=this._respectSize(c,b);this._propagate("resize",b);a.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize();this._updateCache(c);this._trigger("resize",b,this.ui());return false},_mouseStop:function(b){this.resizing=false;var a=this.options,c=this;if(this._helper){var d=this._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName);d=f&&e.ui.hasScroll(d[0],"left")?0:c.sizeDiff.height;f=f?0:c.sizeDiff.width;f={width:c.helper.width()-f,height:c.helper.height()-d};d=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null;var g=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null;a.animate||this.element.css(e.extend(f,
{top:g,left:d}));c.helper.height(c.size.height);c.helper.width(c.size.width);this._helper&&!a.animate&&this._proportionallyResize()}e("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",b);this._helper&&this.helper.remove();return false},_updateVirtualBoundaries:function(b){var a=this.options,c,d,f;a={minWidth:k(a.minWidth)?a.minWidth:0,maxWidth:k(a.maxWidth)?a.maxWidth:Infinity,minHeight:k(a.minHeight)?a.minHeight:0,maxHeight:k(a.maxHeight)?a.maxHeight:Infinity};if(this._aspectRatio||b){b=a.minHeight*this.aspectRatio;d=a.minWidth/this.aspectRatio;c=a.maxHeight*this.aspectRatio;f=a.maxWidth/this.aspectRatio;if(b>a.minWidth)a.minWidth=b;if(d>a.minHeight)a.minHeight=d;if(c<a.maxWidth)a.maxWidth=c;if(f<a.maxHeight)a.maxHeight=f}this._vBoundaries=a},_updateCache:function(b){this.offset=this.helper.offset();if(k(b.left))this.position.left=b.left;if(k(b.top))this.position.top=b.top;if(k(b.height))this.size.height=b.height;if(k(b.width))this.size.width=b.width},_updateRatio:function(b){var a=this.position,c=this.size,d=this.axis;if(k(b.height))b.width=b.height*this.aspectRatio;else if(k(b.width))b.height=b.width/this.aspectRatio;if(d=="sw"){b.left=a.left+(c.width-b.width);b.top=null}if(d=="nw"){b.top=a.top+(c.height-b.height);b.left=a.left+(c.width-b.width)}return b},_respectSize:function(b){var a=this._vBoundaries,c=this.axis,d=k(b.width)&&a.maxWidth&&a.maxWidth<b.width,f=k(b.height)&&a.maxHeight&&a.maxHeight<b.height,g=k(b.width)&&a.minWidth&&a.minWidth>b.width,h=k(b.height)&&a.minHeight&&a.minHeight>b.height;if(g)b.width=a.minWidth;if(h)b.height=a.minHeight;if(d)b.width=a.maxWidth;if(f)b.height=a.maxHeight;var i=this.originalPosition.left+this.originalSize.width,j=this.position.top+this.size.height,l=/sw|nw|w/.test(c);c=/nw|ne|n/.test(c);if(g&&l)b.left=i-a.minWidth;if(d&&l)b.left=i-a.maxWidth;if(h&&c)b.top=j-a.minHeight;if(f&&c)b.top=j-a.maxHeight;if((a=!b.width&&!b.height)&&!b.left&&b.top)b.top=null;else if(a&&!b.top&&b.left)b.left=
null;return b},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var b=this.helper||this.element,a=0;a<this._proportionallyResizeElements.length;a++){var c=this._proportionallyResizeElements[a];if(!this.borderDif){var d=[c.css("borderTopWidth"),c.css("borderRightWidth"),c.css("borderBottomWidth"),c.css("borderLeftWidth")],f=[c.css("paddingTop"),c.css("paddingRight"),c.css("paddingBottom"),c.css("paddingLeft")];this.borderDif=e.map(d,function(g,h){g=parseInt(g,10)||0;h=parseInt(f[h],10)||0;return g+h})}e.browser.msie&&(e(b).is(":hidden")||e(b).parents(":hidden").length)||c.css({height:b.height()-this.borderDif[0]-this.borderDif[2]||0,width:b.width()-this.borderDif[1]-this.borderDif[3]||0})}},_renderProxy:function(){var b=this.options;this.elementOffset=this.element.offset();if(this._helper){this.helper=this.helper||e('<div style="overflow:hidden;"></div>');var a=e.browser.msie&&e.browser.version<7,c=a?1:0;a=a?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+
a,height:this.element.outerHeight()+a,position:"absolute",left:this.elementOffset.left-c+"px",top:this.elementOffset.top-c+"px",zIndex:++b.zIndex});this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(b,a){return{width:this.originalSize.width+a}},w:function(b,a){return{left:this.originalPosition.left+a,width:this.originalSize.width-a}},n:function(b,a,c){return{top:this.originalPosition.top+c,height:this.originalSize.height-c}},s:function(b,a,c){return{height:this.originalSize.height+
c}},se:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},sw:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,a,c]))},ne:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},nw:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,a,c]))}},_propagate:function(b,a){e.ui.plugin.call(this,b,[a,this.ui()]);b!="resize"&&this._trigger(b,a,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});e.extend(e.ui.resizable,{version:"1.8.16"});e.ui.plugin.add("resizable","alsoResize",{start:function(){var b=e(this).data("resizable").options,a=function(c){e(c).each(function(){var d=e(this);d.data("resizable-alsoresize",{width:parseInt(d.width(),10),height:parseInt(d.height(),10),left:parseInt(d.css("left"),10),top:parseInt(d.css("top"),10),position:d.css("position")})})};if(typeof b.alsoResize=="object"&&!b.alsoResize.parentNode)if(b.alsoResize.length){b.alsoResize=b.alsoResize[0];a(b.alsoResize)}else e.each(b.alsoResize,function(c){a(c)});else a(b.alsoResize)},resize:function(b,a){var c=e(this).data("resizable");b=c.options;var d=c.originalSize,f=c.originalPosition,g={height:c.size.height-d.height||0,width:c.size.width-d.width||0,top:c.position.top-
f.top||0,left:c.position.left-f.left||0},h=function(i,j){e(i).each(function(){var l=e(this),q=e(this).data("resizable-alsoresize"),p={},r=j&&j.length?j:l.parents(a.originalElement[0]).length?["width","height"]:["width","height","top","left"];e.each(r,function(n,o){if((n=(q[o]||0)+(g[o]||0))&&n>=0)p[o]=n||null});if(e.browser.opera&&/relative/.test(l.css("position"))){c._revertToRelativePosition=true;l.css({position:"absolute",top:"auto",left:"auto"})}l.css(p)})};typeof b.alsoResize=="object"&&!b.alsoResize.nodeType?
e.each(b.alsoResize,function(i,j){h(i,j)}):h(b.alsoResize)},stop:function(){var b=e(this).data("resizable"),a=b.options,c=function(d){e(d).each(function(){var f=e(this);f.css({position:f.data("resizable-alsoresize").position})})};if(b._revertToRelativePosition){b._revertToRelativePosition=false;typeof a.alsoResize=="object"&&!a.alsoResize.nodeType?e.each(a.alsoResize,function(d){c(d)}):c(a.alsoResize)}e(this).removeData("resizable-alsoresize")}});e.ui.plugin.add("resizable","animate",{stop:function(b){var a=e(this).data("resizable"),c=a.options,d=a._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName),g=f&&e.ui.hasScroll(d[0],"left")?0:a.sizeDiff.height;f={width:a.size.width-(f?0:a.sizeDiff.width),height:a.size.height-g};g=parseInt(a.element.css("left"),10)+(a.position.left-a.originalPosition.left)||null;var h=parseInt(a.element.css("top"),10)+(a.position.top-a.originalPosition.top)||null;a.element.animate(e.extend(f,h&&g?{top:h,left:g}:{}),{duration:c.animateDuration,easing:c.animateEasing,
step:function(){var i={width:parseInt(a.element.css("width"),10),height:parseInt(a.element.css("height"),10),top:parseInt(a.element.css("top"),10),left:parseInt(a.element.css("left"),10)};d&&d.length&&e(d[0]).css({width:i.width,height:i.height});a._updateCache(i);a._propagate("resize",b)}})}});e.ui.plugin.add("resizable","containment",{start:function(){var b=e(this).data("resizable"),a=b.element,c=b.options.containment;if(a=c instanceof e?c.get(0):/parent/.test(c)?a.parent().get(0):c){b.containerElement=
e(a);if(/document/.test(c)||c==document){b.containerOffset={left:0,top:0};b.containerPosition={left:0,top:0};b.parentData={element:e(document),left:0,top:0,width:e(document).width(),height:e(document).height()||document.body.parentNode.scrollHeight}}else{var d=e(a),f=[];e(["Top","Right","Left","Bottom"]).each(function(i,j){f[i]=m(d.css("padding"+j))});b.containerOffset=d.offset();b.containerPosition=d.position();b.containerSize={height:d.innerHeight()-f[3],width:d.innerWidth()-f[1]};c=b.containerOffset;
var g=b.containerSize.height,h=b.containerSize.width;h=e.ui.hasScroll(a,"left")?a.scrollWidth:h;g=e.ui.hasScroll(a)?a.scrollHeight:g;b.parentData={element:a,left:c.left,top:c.top,width:h,height:g}}}},resize:function(b){var a=e(this).data("resizable"),c=a.options,d=a.containerOffset,f=a.position;b=a._aspectRatio||b.shiftKey;var g={top:0,left:0},h=a.containerElement;if(h[0]!=document&&/static/.test(h.css("position")))g=d;if(f.left<(a._helper?d.left:0)){a.size.width+=a._helper?a.position.left-d.left:
a.position.left-g.left;if(b)a.size.height=a.size.width/c.aspectRatio;a.position.left=c.helper?d.left:0}if(f.top<(a._helper?d.top:0)){a.size.height+=a._helper?a.position.top-d.top:a.position.top;if(b)a.size.width=a.size.height*c.aspectRatio;a.position.top=a._helper?d.top:0}a.offset.left=a.parentData.left+a.position.left;a.offset.top=a.parentData.top+a.position.top;c=Math.abs((a._helper?a.offset.left-g.left:a.offset.left-g.left)+a.sizeDiff.width);d=Math.abs((a._helper?a.offset.top-g.top:a.offset.top-
d.top)+a.sizeDiff.height);f=a.containerElement.get(0)==a.element.parent().get(0);g=/relative|absolute/.test(a.containerElement.css("position"));if(f&&g)c-=a.parentData.left;if(c+a.size.width>=a.parentData.width){a.size.width=a.parentData.width-c;if(b)a.size.height=a.size.width/a.aspectRatio}if(d+a.size.height>=a.parentData.height){a.size.height=a.parentData.height-d;if(b)a.size.width=a.size.height*a.aspectRatio}},stop:function(){var b=e(this).data("resizable"),a=b.options,c=b.containerOffset,d=b.containerPosition,
f=b.containerElement,g=e(b.helper),h=g.offset(),i=g.outerWidth()-b.sizeDiff.width;g=g.outerHeight()-b.sizeDiff.height;b._helper&&!a.animate&&/relative/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g});b._helper&&!a.animate&&/static/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g})}});e.ui.plugin.add("resizable","ghost",{start:function(){var b=e(this).data("resizable"),a=b.options,c=b.size;b.ghost=b.originalElement.clone();b.ghost.css({opacity:0.25,
display:"block",position:"relative",height:c.height,width:c.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof a.ghost=="string"?a.ghost:"");b.ghost.appendTo(b.helper)},resize:function(){var b=e(this).data("resizable");b.ghost&&b.ghost.css({position:"relative",height:b.size.height,width:b.size.width})},stop:function(){var b=e(this).data("resizable");b.ghost&&b.helper&&b.helper.get(0).removeChild(b.ghost.get(0))}});e.ui.plugin.add("resizable","grid",{resize:function(){var b=e(this).data("resizable"),a=b.options,c=b.size,d=b.originalSize,f=b.originalPosition,g=b.axis;a.grid=typeof a.grid=="number"?[a.grid,a.grid]:a.grid;var h=Math.round((c.width-d.width)/(a.grid[0]||1))*(a.grid[0]||1);a=Math.round((c.height-d.height)/(a.grid[1]||1))*(a.grid[1]||1);if(/^(se|s|e)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a}else if(/^(ne)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}else{if(/^(sw)$/.test(g)){b.size.width=d.width+h;b.size.height=
d.height+a}else{b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}b.position.left=f.left-h}}});var m=function(b){return parseInt(b,10)||0},k=function(b){return!isNaN(parseInt(b,10))}})(jQuery);;(function(e){e.widget("ui.selectable",e.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var c=this;this.element.addClass("ui-selectable");this.dragged=false;var f;this.refresh=function(){f=e(c.options.filter,c.element[0]);f.each(function(){var d=e(this),b=d.offset();e.data(this,"selectable-item",{element:this,$element:d,left:b.left,top:b.top,right:b.left+d.outerWidth(),bottom:b.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=f.addClass("ui-selectee");this._mouseInit();this.helper=e("<div class='ui-selectable-helper'></div>")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(c){var f=this;this.opos=[c.pageX,c.pageY];if(!this.options.disabled){var d=this.options;this.selectees=e(d.filter,this.element[0]);this._trigger("start",c);e(d.appendTo).append(this.helper);this.helper.css({left:c.clientX,top:c.clientY,width:0,height:0});d.autoRefresh&&this.refresh();this.selectees.filter(".ui-selected").each(function(){var b=e.data(this,"selectable-item");b.startselected=true;if(!c.metaKey){b.$element.removeClass("ui-selected");b.selected=false;b.$element.addClass("ui-unselecting");b.unselecting=true;f._trigger("unselecting",c,{unselecting:b.element})}});e(c.target).parents().andSelf().each(function(){var b=e.data(this,"selectable-item");if(b){var g=!c.metaKey||!b.$element.hasClass("ui-selected");b.$element.removeClass(g?"ui-unselecting":"ui-selected").addClass(g?"ui-selecting":"ui-unselecting");b.unselecting=!g;b.selecting=g;(b.selected=g)?f._trigger("selecting",c,{selecting:b.element}):f._trigger("unselecting",c,{unselecting:b.element});return false}})}},_mouseDrag:function(c){var f=this;this.dragged=true;if(!this.options.disabled){var d=this.options,b=this.opos[0],g=this.opos[1],h=c.pageX,i=c.pageY;if(b>h){var j=h;h=b;b=j}if(g>i){j=i;i=g;g=j}this.helper.css({left:b,top:g,width:h-b,height:i-g});this.selectees.each(function(){var a=e.data(this,"selectable-item");if(!(!a||a.element==f.element[0])){var k=false;if(d.tolerance=="touch")k=!(a.left>h||a.right<b||a.top>i||a.bottom<g);else if(d.tolerance=="fit")k=a.left>b&&a.right<h&&a.top>g&&a.bottom<i;if(k){if(a.selected){a.$element.removeClass("ui-selected");a.selected=false}if(a.unselecting){a.$element.removeClass("ui-unselecting");a.unselecting=false}if(!a.selecting){a.$element.addClass("ui-selecting");a.selecting=true;f._trigger("selecting",c,{selecting:a.element})}}else{if(a.selecting)if(c.metaKey&&a.startselected){a.$element.removeClass("ui-selecting");a.selecting=false;a.$element.addClass("ui-selected");a.selected=true}else{a.$element.removeClass("ui-selecting");a.selecting=false;if(a.startselected){a.$element.addClass("ui-unselecting");a.unselecting=true}f._trigger("unselecting",c,{unselecting:a.element})}if(a.selected)if(!c.metaKey&&!a.startselected){a.$element.removeClass("ui-selected");a.selected=false;a.$element.addClass("ui-unselecting");a.unselecting=true;f._trigger("unselecting",c,{unselecting:a.element})}}}});return false}},_mouseStop:function(c){var f=this;this.dragged=false;e(".ui-unselecting",this.element[0]).each(function(){var d=e.data(this,"selectable-item");d.$element.removeClass("ui-unselecting");d.unselecting=false;d.startselected=false;f._trigger("unselected",c,{unselected:d.element})});e(".ui-selecting",this.element[0]).each(function(){var d=e.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected");d.selecting=false;d.selected=true;d.startselected=true;f._trigger("selected",c,{selected:d.element})});this._trigger("stop",c);this.helper.remove();return false}});e.extend(e.ui.selectable,{version:"1.8.16"})})(jQuery);;(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){var a=this.options;this.containerCache={};this.element.addClass("ui-sortable");this.refresh();this.floating=this.items.length?a.axis==="x"||/left|right/.test(this.items[0].item.css("float"))||/inline|table-cell/.test(this.items[0].item.css("display")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a===
"disabled"){this.options[a]=b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&!b){var f=false;d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<
b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-
b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp({target:null});this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}if(this.placeholder){this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):d(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});!c.length&&a.key&&c.push(a.key+"=");return c.join("&")},
toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b];if(!(c.instance!=this.currentContainer&&this.currentContainer&&c.item[0]!=this.currentItem[0])){var e=this.options.toleranceElement?d(this.options.toleranceElement,c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-
f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),
10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&
this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();
var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-
this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-
this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]="";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.16"})})(jQuery);;(function(c){c.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()===location.href.toLowerCase()}},_create:function(){var a=this,b=a.options;a.running=0;a.element.addClass("ui-accordion ui-widget ui-helper-reset").children("li").addClass("ui-accordion-li-fix");a.headers=a.element.find(b.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){b.disabled||c(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){b.disabled||c(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){b.disabled||c(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){b.disabled||c(this).removeClass("ui-state-focus")});a.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");if(b.navigation){var d=a.element.find("a").filter(b.navigationFilter).eq(0);if(d.length){var h=d.closest(".ui-accordion-header");a.active=h.length?h:d.closest(".ui-accordion-content").prev()}}a.active=a._findActive(a.active||b.active).addClass("ui-state-default ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");a.active.next().addClass("ui-accordion-content-active");a._createIcons();a.resize();a.element.attr("role","tablist");a.headers.attr("role","tab").bind("keydown.accordion",function(f){return a._keydown(f)}).next().attr("role","tabpanel");a.headers.not(a.active||"").attr({"aria-expanded":"false","aria-selected":"false",tabIndex:-1}).next().hide();a.active.length?a.active.attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}):a.headers.eq(0).attr("tabIndex",0);c.browser.safari||a.headers.find("a").attr("tabIndex",-1);b.event&&a.headers.bind(b.event.split(" ").join(".accordion ")+".accordion",function(f){a._clickHandler.call(a,f,this);f.preventDefault()})},_createIcons:function(){var a=this.options;if(a.icons){c("<span></span>").addClass("ui-icon "+a.icons.header).prependTo(this.headers);this.active.children(".ui-icon").toggleClass(a.icons.header).toggleClass(a.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var a=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-accordion-disabled ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("tabIndex");this.headers.find("a").removeAttr("tabIndex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-accordion-disabled ui-state-disabled");if(a.autoHeight||a.fillHeight)b.css("height","");return c.Widget.prototype.destroy.call(this)},_setOption:function(a,b){c.Widget.prototype._setOption.apply(this,arguments);a=="active"&&this.activate(b);if(a=="icons"){this._destroyIcons();b&&this._createIcons()}if(a=="disabled")this.headers.add(this.headers.next())[b?"addClass":"removeClass"]("ui-accordion-disabled ui-state-disabled")},_keydown:function(a){if(!(this.options.disabled||a.altKey||a.ctrlKey)){var b=c.ui.keyCode,d=this.headers.length,h=this.headers.index(a.target),f=false;switch(a.keyCode){case b.RIGHT:case b.DOWN:f=this.headers[(h+1)%d];break;case b.LEFT:case b.UP:f=this.headers[(h-1+d)%d];break;case b.SPACE:case b.ENTER:this._clickHandler({target:a.target},a.target);a.preventDefault()}if(f){c(a.target).attr("tabIndex",-1);c(f).attr("tabIndex",0);f.focus();return false}return true}},resize:function(){var a=this.options,b;if(a.fillSpace){if(c.browser.msie){var d=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}b=this.element.parent().height();c.browser.msie&&this.element.parent().css("overflow",d);this.headers.each(function(){b-=c(this).outerHeight(true)});this.headers.next().each(function(){c(this).height(Math.max(0,b-c(this).innerHeight()+
c(this).height()))}).css("overflow","auto")}else if(a.autoHeight){b=0;this.headers.next().each(function(){b=Math.max(b,c(this).height("").height())}).height(b)}return this},activate:function(a){this.options.active=a;a=this._findActive(a)[0];this._clickHandler({target:a},a);return this},_findActive:function(a){return a?typeof a==="number"?this.headers.filter(":eq("+a+")"):this.headers.not(this.headers.not(a)):a===false?c([]):this.headers.filter(":eq(0)")},_clickHandler:function(a,b){var d=this.options;if(!d.disabled)if(a.target){a=c(a.currentTarget||b);b=a[0]===this.active[0];d.active=d.collapsible&&b?false:this.headers.index(a);if(!(this.running||!d.collapsible&&b)){var h=this.active;j=a.next();g=this.active.next();e={options:d,newHeader:b&&d.collapsible?c([]):a,oldHeader:this.active,newContent:b&&d.collapsible?c([]):j,oldContent:g};var f=this.headers.index(this.active[0])>this.headers.index(a[0]);this.active=b?c([]):a;this._toggle(j,g,e,b,f);h.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);if(!b){a.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").children(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);a.next().addClass("ui-accordion-content-active")}}}else if(d.collapsible){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var g=this.active.next(),e={options:d,newHeader:c([]),oldHeader:d.active,newContent:c([]),oldContent:g},j=this.active=c([]);this._toggle(j,g,e)}},_toggle:function(a,b,d,h,f){var g=this,e=g.options;g.toShow=a;g.toHide=b;g.data=d;var j=function(){if(g)return g._completed.apply(g,arguments)};g._trigger("changestart",null,g.data);g.running=b.size()===0?a.size():b.size();if(e.animated){d={};d=e.collapsible&&h?{toShow:c([]),toHide:b,complete:j,down:f,autoHeight:e.autoHeight||e.fillSpace}:{toShow:a,toHide:b,complete:j,down:f,autoHeight:e.autoHeight||e.fillSpace};if(!e.proxied)e.proxied=e.animated;if(!e.proxiedDuration)e.proxiedDuration=e.duration;e.animated=c.isFunction(e.proxied)?e.proxied(d):e.proxied;e.duration=c.isFunction(e.proxiedDuration)?e.proxiedDuration(d):e.proxiedDuration;h=c.ui.accordion.animations;var i=e.duration,k=e.animated;if(k&&!h[k]&&!c.easing[k])k="slide";h[k]||(h[k]=function(l){this.slide(l,{easing:k,duration:i||700})});h[k](d)}else{if(e.collapsible&&h)a.toggle();else{b.hide();a.show()}j(true)}b.prev().attr({"aria-expanded":"false","aria-selected":"false",tabIndex:-1}).blur();a.prev().attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}).focus()},_completed:function(a){this.running=a?0:--this.running;if(!this.running){this.options.clearStyle&&this.toShow.add(this.toHide).css({height:"",overflow:""});this.toHide.removeClass("ui-accordion-content-active");if(this.toHide.length)this.toHide.parent()[0].className=this.toHide.parent()[0].className;this._trigger("change",null,this.data)}}});c.extend(c.ui.accordion,{version:"1.8.16",animations:{slide:function(a,b){a=c.extend({easing:"swing",duration:300},a,b);if(a.toHide.size())if(a.toShow.size()){var d=a.toShow.css("overflow"),h=0,f={},g={},e;b=a.toShow;e=b[0].style.width;b.width(parseInt(b.parent().width(),10)-parseInt(b.css("paddingLeft"),10)-parseInt(b.css("paddingRight"),10)-(parseInt(b.css("borderLeftWidth"),10)||0)-(parseInt(b.css("borderRightWidth"),10)||0));c.each(["height","paddingTop","paddingBottom"],function(j,i){g[i]="hide";j=(""+c.css(a.toShow[0],i)).match(/^([\d+-.]+)(.*)$/);
f[i]={value:j[1],unit:j[2]||"px"}});a.toShow.css({height:0,overflow:"hidden"}).show();a.toHide.filter(":hidden").each(a.complete).end().filter(":visible").animate(g,{step:function(j,i){if(i.prop=="height")h=i.end-i.start===0?0:(i.now-i.start)/(i.end-i.start);a.toShow[0].style[i.prop]=h*f[i.prop].value+f[i.prop].unit},duration:a.duration,easing:a.easing,complete:function(){a.autoHeight||a.toShow.css("height","");a.toShow.css({width:e,overflow:d});a.complete()}})}else a.toHide.animate({height:"hide",paddingTop:"hide",paddingBottom:"hide"},a);else a.toShow.animate({height:"show",paddingTop:"show",paddingBottom:"show"},a)},bounceslide:function(a){this.slide(a,{easing:a.down?"easeOutBounce":"swing",duration:a.down?1E3:200})}}})})(jQuery);;(function(d){var e=0;d.widget("ui.autocomplete",{options:{appendTo:"body",autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null},pending:0,_create:function(){var a=this,b=this.element[0].ownerDocument,g;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){if(!(a.options.disabled||a.element.propAttr("readOnly"))){g=false;var f=d.ui.keyCode;switch(c.keyCode){case f.PAGE_UP:a._move("previousPage",c);break;case f.PAGE_DOWN:a._move("nextPage",c);break;case f.UP:a._move("previous",c);c.preventDefault();break;case f.DOWN:a._move("next",c);c.preventDefault();break;case f.ENTER:case f.NUMPAD_ENTER:if(a.menu.active){g=true;c.preventDefault()}case f.TAB:if(!a.menu.active)return;a.menu.select(c);break;case f.ESCAPE:a.element.val(a.term);a.close(c);break;default:clearTimeout(a.searching);a.searching=setTimeout(function(){if(a.term!=a.element.val()){a.selectedItem=null;a.search(null,c)}},a.options.delay);break}}}).bind("keypress.autocomplete",function(c){if(g){g=false;c.preventDefault()}}).bind("focus.autocomplete",function(){if(!a.options.disabled){a.selectedItem=null;a.previous=a.element.val()}}).bind("blur.autocomplete",function(c){if(!a.options.disabled){clearTimeout(a.searching);a.closing=setTimeout(function(){a.close(c);a._change(c)},150)}});this._initSource();this.response=function(){return a._response.apply(a,arguments)};this.menu=d("<ul></ul>").addClass("ui-autocomplete").appendTo(d(this.options.appendTo||"body",b)[0]).mousedown(function(c){var f=a.menu.element[0];d(c.target).closest(".ui-menu-item").length||setTimeout(function(){d(document).one("mousedown",function(h){h.target!==a.element[0]&&h.target!==f&&!d.ui.contains(f,h.target)&&a.close()})},1);setTimeout(function(){clearTimeout(a.closing)},13)}).menu({focus:function(c,f){f=f.item.data("item.autocomplete");false!==a._trigger("focus",c,{item:f})&&/^key/.test(c.originalEvent.type)&&
a.element.val(f.value)},selected:function(c,f){var h=f.item.data("item.autocomplete"),i=a.previous;if(a.element[0]!==b.activeElement){a.element.focus();a.previous=i;setTimeout(function(){a.previous=i;a.selectedItem=h},1)}false!==a._trigger("select",c,{item:h})&&a.element.val(h.value);a.term=a.element.val();a.close(c);a.selectedItem=h},blur:function(){a.menu.element.is(":visible")&&a.element.val()!==a.term&&a.element.val(a.term)}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");d.fn.bgiframe&&this.menu.element.bgiframe()},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");this.menu.element.remove();d.Widget.prototype.destroy.call(this)},_setOption:function(a,b){d.Widget.prototype._setOption.apply(this,arguments);a==="source"&&this._initSource();if(a==="appendTo")this.menu.element.appendTo(d(b||"body",this.element[0].ownerDocument)[0]);a==="disabled"&&b&&this.xhr&&this.xhr.abort()},_initSource:function(){var a=this,b,g;if(d.isArray(this.options.source)){b=this.options.source;this.source=function(c,f){f(d.ui.autocomplete.filter(b,c.term))}}else if(typeof this.options.source==="string"){g=this.options.source;this.source=function(c,f){a.xhr&&a.xhr.abort();a.xhr=d.ajax({url:g,data:c,dataType:"json",autocompleteRequest:++e,success:function(h){this.autocompleteRequest===e&&f(h)},error:function(){this.autocompleteRequest===e&&f([])}})}}else this.source=this.options.source},search:function(a,b){a=a!=null?a:this.element.val();this.term=this.element.val();if(a.length<this.options.minLength)return this.close(b);clearTimeout(this.closing);if(this._trigger("search",b)!==false)return this._search(a)},_search:function(a){this.pending++;this.element.addClass("ui-autocomplete-loading");this.source({term:a},this.response)},_response:function(a){if(!this.options.disabled&&a&&a.length){a=this._normalize(a);this._suggest(a);this._trigger("open")}else this.close();this.pending--;this.pending||this.element.removeClass("ui-autocomplete-loading")},close:function(a){clearTimeout(this.closing);if(this.menu.element.is(":visible")){this.menu.element.hide();this.menu.deactivate();this._trigger("close",a)}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(a){if(a.length&&a[0].label&&a[0].value)return a;return d.map(a,function(b){if(typeof b==="string")return{label:b,value:b};return d.extend({label:b.label||b.value,value:b.value||b.label},b)})},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+1);this._renderMenu(b,a);this.menu.deactivate();this.menu.refresh();b.show();this._resizeMenu();b.position(d.extend({of:this.element},this.options.position));this.options.autoFocus&&this.menu.next(new d.Event("mouseover"))},_resizeMenu:function(){var a=this.menu.element;a.outerWidth(Math.max(a.width("").outerWidth(),this.element.outerWidth()))},_renderMenu:function(a,b){var g=this;d.each(b,function(c,f){g._renderItem(a,f)})},_renderItem:function(a,b){return d("<li></li>").data("item.autocomplete",b).append(d("<a></a>").text(b.label)).appendTo(a)},_move:function(a,b){if(this.menu.element.is(":visible"))if(this.menu.first()&&/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);this.menu.deactivate()}else this.menu[a](b);else this.search(null,b)},widget:function(){return this.menu.element}});d.extend(d.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,
"\\$&")},filter:function(a,b){var g=new RegExp(d.ui.autocomplete.escapeRegex(b),"i");return d.grep(a,function(c){return g.test(c.label||c.value||c)})}})})(jQuery);(function(d){d.widget("ui.menu",{_create:function(){var e=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(a){if(d(a.target).closest(".ui-menu-item a").length){a.preventDefault();e.select(a)}});this.refresh()},refresh:function(){var e=this;this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",-1).mouseenter(function(a){e.activate(a,d(this).parent())}).mouseleave(function(){e.deactivate()})},activate:function(e,a){this.deactivate();if(this.hasScroll()){var b=a.offset().top-this.element.offset().top,g=this.element.scrollTop(),c=this.element.height();if(b<0)this.element.scrollTop(g+b);else b>=c&&this.element.scrollTop(g+b-c+a.height())}this.active=a.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",e,{item:a})},deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");this._trigger("blur");this.active=null}},next:function(e){this.move("next",".ui-menu-item:first",e)},previous:function(e){this.move("prev",".ui-menu-item:last",e)},first:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},last:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},move:function(e,a,b){if(this.active){e=this.active[e+"All"](".ui-menu-item").eq(0);e.length?this.activate(b,e):this.activate(b,this.element.children(a))}else this.activate(b,this.element.children(a))},nextPage:function(e){if(this.hasScroll())if(!this.active||this.last())this.activate(e,this.element.children(".ui-menu-item:first"));else{var a=this.active.offset().top,b=this.element.height(),g=this.element.children(".ui-menu-item").filter(function(){var c=d(this).offset().top-a-b+d(this).height();return c<10&&c>-10});g.length||(g=this.element.children(".ui-menu-item:last"));this.activate(e,g)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.last()?":first":":last"))},previousPage:function(e){if(this.hasScroll())if(!this.active||this.first())this.activate(e,this.element.children(".ui-menu-item:last"));else{var a=this.active.offset().top,b=this.element.height();result=this.element.children(".ui-menu-item").filter(function(){var g=d(this).offset().top-a+b-d(this).height();return g<10&&g>-10});result.length||(result=this.element.children(".ui-menu-item:first"));this.activate(e,result)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.first()?":last":":first"))},hasScroll:function(){return this.element.height()<this.element[d.fn.prop?"prop":"attr"]("scrollHeight")},select:function(e){this._trigger("selected",e,{item:this.active})}})})(jQuery);;(function(b){var h,i,j,g,l=function(){var a=b(this).find(":ui-button");setTimeout(function(){a.button("refresh")},1)},k=function(a){var c=a.name,e=a.form,f=b([]);if(c)f=e?b(e).find("[name='"+c+"']"):b("[name='"+c+"']",a.ownerDocument).filter(function(){return!this.form});return f};b.widget("ui.button",{options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",l);if(typeof this.options.disabled!=="boolean")this.options.disabled=this.element.propAttr("disabled");this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var a=this,c=this.options,e=this.type==="checkbox"||this.type==="radio",f="ui-state-hover"+(!e?" ui-state-active":"");if(c.label===null)c.label=this.buttonElement.html();if(this.element.is(":disabled"))c.disabled=true;this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",function(){if(!c.disabled){b(this).addClass("ui-state-hover");this===h&&b(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){c.disabled||b(this).removeClass(f)}).bind("click.button",function(d){if(c.disabled){d.preventDefault();d.stopImmediatePropagation()}});this.element.bind("focus.button",function(){a.buttonElement.addClass("ui-state-focus")}).bind("blur.button",function(){a.buttonElement.removeClass("ui-state-focus")});if(e){this.element.bind("change.button",function(){g||a.refresh()});this.buttonElement.bind("mousedown.button",function(d){if(!c.disabled){g=false;i=d.pageX;j=d.pageY}}).bind("mouseup.button",function(d){if(!c.disabled)if(i!==d.pageX||j!==d.pageY)g=true})}if(this.type==="checkbox")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).toggleClass("ui-state-active");a.buttonElement.attr("aria-pressed",a.element[0].checked)});else if(this.type==="radio")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).addClass("ui-state-active");a.buttonElement.attr("aria-pressed","true");var d=a.element[0];k(d).not(d).map(function(){return b(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed","false")});else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled)return false;b(this).addClass("ui-state-active");h=this;b(document).one("mouseup",function(){h=null})}).bind("mouseup.button",function(){if(c.disabled)return false;b(this).removeClass("ui-state-active")}).bind("keydown.button",function(d){if(c.disabled)return false;if(d.keyCode==b.ui.keyCode.SPACE||d.keyCode==b.ui.keyCode.ENTER)b(this).addClass("ui-state-active")}).bind("keyup.button",function(){b(this).removeClass("ui-state-active")});this.buttonElement.is("a")&&this.buttonElement.keyup(function(d){d.keyCode===b.ui.keyCode.SPACE&&b(this).click()})}this._setOption("disabled",c.disabled);this._resetButton()},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";if(this.type==="checkbox"||this.type==="radio"){var a=this.element.parents().filter(":last"),c="label[for='"+this.element.attr("id")+"']";this.buttonElement=a.find(c);if(!this.buttonElement.length){a=a.length?a.siblings():this.element.siblings();this.buttonElement=a.filter(c);if(!this.buttonElement.length)this.buttonElement=a.find(c)}this.element.addClass("ui-helper-hidden-accessible");(a=this.element.is(":checked"))&&this.buttonElement.addClass("ui-state-active");this.buttonElement.attr("aria-pressed",a)}else this.buttonElement=this.element},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active  ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());this.hasTitle||this.buttonElement.removeAttr("title");b.Widget.prototype.destroy.call(this)},_setOption:function(a,c){b.Widget.prototype._setOption.apply(this,arguments);if(a==="disabled")c?this.element.propAttr("disabled",true):this.element.propAttr("disabled",false);else this._resetButton()},refresh:function(){var a=this.element.is(":disabled");a!==this.options.disabled&&this._setOption("disabled",a);if(this.type==="radio")k(this.element[0]).each(function(){b(this).is(":checked")?b(this).button("widget").addClass("ui-state-active").attr("aria-pressed","true"):b(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false")});else if(this.type==="checkbox")this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true"):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false")},_resetButton:function(){if(this.type==="input")this.options.label&&this.element.val(this.options.label);else{var a=this.buttonElement.removeClass("ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only"),c=b("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(a.empty()).text(),e=this.options.icons,f=e.primary&&e.secondary,d=[];if(e.primary||e.secondary){if(this.options.text)d.push("ui-button-text-icon"+(f?"s":e.primary?"-primary":"-secondary"));e.primary&&a.prepend("<span class='ui-button-icon-primary ui-icon "+e.primary+"'></span>");e.secondary&&a.append("<span class='ui-button-icon-secondary ui-icon "+e.secondary+"'></span>");if(!this.options.text){d.push(f?"ui-button-icons-only":"ui-button-icon-only");this.hasTitle||a.attr("title",c)}}else d.push("ui-button-text-only");a.addClass(d.join(" "))}}});b.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(a,c){a==="disabled"&&this.buttons.button("option",a,c);b.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){var a=this.element.css("direction")==="ltr";this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(a?"ui-corner-left":"ui-corner-right").end().filter(":last").addClass(a?"ui-corner-right":"ui-corner-left").end().end()},destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");b.Widget.prototype.destroy.call(this)}})})(jQuery);;(function(c,l){var m={buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},n={maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},o=c.attrFn||{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true,click:true};c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,position:{my:"center",at:"center",collision:"fit",using:function(a){var b=c(this).css(a).offset().top;b<0&&c(this).css("top",a.top-b)}},resizable:true,show:null,stack:true,title:"",width:300,zIndex:1E3},_create:function(){this.originalTitle=this.element.attr("title");if(typeof this.originalTitle!=="string")this.originalTitle="";this.options.title=this.options.title||this.originalTitle;var a=this,b=a.options,d=b.title||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+
b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&!i.isDefaultPrevented()&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);i.preventDefault()}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)});a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(i){a.close(i);return false}).appendTo(f);(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);c("<span></span>").addClass("ui-dialog-title").attr("id",e).html(d).prependTo(f);if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose))b.beforeClose=b.beforeclose;f.find("*").add(f).disableSelection();b.draggable&&c.fn.draggable&&a._makeDraggable();b.resizable&&c.fn.resizable&&a._makeResizable();a._createButtons(b.buttons);a._isOpen=false;c.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;a.overlay&&a.overlay.destroy();a.uiDialog.hide();a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");a.uiDialog.remove();a.originalTitle&&a.element.attr("title",a.originalTitle);return a},widget:function(){return this.uiDialog},close:function(a){var b=this,d,e;if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();b.uiDialog.unbind("keypress.ui-dialog");b._isOpen=false;if(b.options.hide)b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)});else{b.uiDialog.hide();b._trigger("close",a)}c.ui.dialog.overlay.resize();if(b.options.modal){d=0;c(".ui-dialog").each(function(){if(this!==b.uiDialog[0]){e=c(this).css("z-index");isNaN(e)||(d=Math.max(d,e))}});c.ui.dialog.maxZ=d}return b}},isOpen:function(){return this._isOpen},moveToTop:function(a,b){var d=this,e=d.options;if(e.modal&&!a||!e.stack&&!e.modal)return d._trigger("focus",b);if(e.zIndex>c.ui.dialog.maxZ)c.ui.dialog.maxZ=e.zIndex;if(d.overlay){c.ui.dialog.maxZ+=1;d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)}a={scrollTop:d.element.scrollTop(),scrollLeft:d.element.scrollLeft()};c.ui.dialog.maxZ+=1;d.uiDialog.css("z-index",c.ui.dialog.maxZ);d.element.attr(a);d._trigger("focus",b);return d},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;a.overlay=b.modal?new c.ui.dialog.overlay(a):null;a._size();a._position(b.position);d.show(b.show);a.moveToTop(true);b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");g=g.filter(":last");if(e.target===g[0]&&!e.shiftKey){f.focus(1);return false}else if(e.target===f[0]&&e.shiftKey){g.focus(1);return false}}});c(a.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus();a._isOpen=true;a._trigger("open");return a}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),g=c("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);b.uiDialog.find(".ui-dialog-buttonpane").remove();typeof a==="object"&&a!==null&&c.each(a,function(){return!(d=true)});if(d){c.each(a,function(f,h){h=c.isFunction(h)?{click:h,text:f}:h;var i=c('<button type="button"></button>').click(function(){h.click.apply(b.element[0],arguments)}).appendTo(g);c.each(h,function(j,k){if(j!=="click")j in o?i[j](k):i.attr(j,k)});c.fn.button&&i.button()});e.appendTo(b.uiDialog)}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}}var b=this,d=b.options,e=c(document),g;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();c(this).height(c(this).height()).addClass("ui-dialog-dragging");b._trigger("dragStart",f,a(h))},drag:function(f,h){b._trigger("drag",f,a(h))},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];c(this).removeClass("ui-dialog-dragging").height(g);b._trigger("dragStop",f,a(h));c.ui.dialog.overlay.resize()}})},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,originalSize:f.originalSize,position:f.position,size:f.size}}a=a===l?this.options.resizable:a;var d=this,e=d.options,g=d.uiDialog.css("position");a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",f,b(h))},resize:function(f,h){d._trigger("resize",f,b(h))},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");e.height=c(this).height();e.width=c(this).width();d._trigger("resizeStop",f,b(h));c.ui.dialog.overlay.resize()}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(a){var b=[],d=[0,0],e;if(a){if(typeof a==="string"||typeof a==="object"&&"0"in a){b=a.split?a.split(" "):[a[0],a[1]];if(b.length===1)b[1]=b[0];c.each(["left","top"],function(g,f){if(+b[g]===b[g]){d[g]=b[g];b[g]=f}});a={my:b.join(" "),at:b.join(" "),offset:d.join(" ")}}a=c.extend({},c.ui.dialog.prototype.options.position,a)}else a=c.ui.dialog.prototype.options.position;(e=this.uiDialog.is(":visible"))||this.uiDialog.show();this.uiDialog.css({top:0,left:0}).position(c.extend({of:window},a));e||this.uiDialog.hide()},_setOptions:function(a){var b=this,d={},e=false;c.each(a,function(g,f){b._setOption(g,f);if(g in m)e=true;if(g in n)d[g]=f});e&&this._size();this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",d)},_setOption:function(a,b){var d=this,e=d.uiDialog;switch(a){case "beforeclose":a="beforeClose";break;case "buttons":d._createButtons(b);break;case "closeText":d.uiDialogTitlebarCloseText.text(""+b);break;case "dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);break;case "disabled":b?e.addClass("ui-dialog-disabled"):e.removeClass("ui-dialog-disabled");break;case "draggable":var g=e.is(":data(draggable)");g&&!b&&e.draggable("destroy");!g&&b&&d._makeDraggable();break;case "position":d._position(b);break;case "resizable":(g=e.is(":data(resizable)"))&&!b&&e.resizable("destroy");g&&typeof b==="string"&&e.resizable("option","handles",b);!g&&b!==false&&d._makeResizable(b);break;case "title":c(".ui-dialog-title",d.uiDialogTitlebar).html(""+(b||"&#160;"));break}c.Widget.prototype._setOption.apply(d,arguments)},_size:function(){var a=this.options,b,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0});if(a.minWidth>a.width)a.width=a.minWidth;b=this.uiDialog.css({height:"auto",width:a.width}).height();d=Math.max(0,a.minHeight-b);if(a.height==="auto")if(c.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();a=this.element.css("height","auto").height();e||this.uiDialog.hide();this.element.height(Math.max(a,d))}else this.element.height(Math.max(a.height-
b,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}});c.extend(c.ui.dialog,{version:"1.8.16",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");if(!a){this.uuid+=1;a=this.uuid}return"ui-dialog-title-"+a},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)}});c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&c(document).bind(c.ui.dialog.overlay.events,function(d){if(c(d.target).zIndex()<c.ui.dialog.overlay.maxZ)return false})},1);c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&!d.isDefaultPrevented()&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);d.preventDefault()}});c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)}var b=(this.oldInstances.pop()||c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});c.fn.bgiframe&&b.bgiframe();this.instances.push(b);return b},destroy:function(a){var b=c.inArray(a,this.instances);b!=-1&&this.oldInstances.push(this.instances.splice(b,1)[0]);this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");a.remove();var d=0;c.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);b=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);return a<b?c(window).height()+"px":a+"px"}else return c(document).height()+"px"},width:function(){var a,b;if(c.browser.msie){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);return a<b?c(window).width()+"px":a+"px"}else return c(document).width()+
"px"},resize:function(){var a=c([]);c.each(c.ui.dialog.overlay.instances,function(){a=a.add(this)});a.css({width:0,height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})}});c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);;(function(d){d.widget("ui.slider",d.ui.mouse,{widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var a=this,b=this.options,c=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),f=b.values&&b.values.length||1,e=[];this._mouseSliding=this._keySliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+
this.orientation+" ui-widget ui-widget-content ui-corner-all"+(b.disabled?" ui-slider-disabled ui-disabled":""));this.range=d([]);if(b.range){if(b.range===true){if(!b.values)b.values=[this._valueMin(),this._valueMin()];if(b.values.length&&b.values.length!==2)b.values=[b.values[0],b.values[0]]}this.range=d("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+(b.range==="min"||b.range==="max"?" ui-slider-range-"+b.range:""))}for(var j=c.length;j<f;j+=1)e.push("<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>");this.handles=c.add(d(e.join("")).appendTo(a.element));this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(g){g.preventDefault()}).hover(function(){b.disabled||d(this).addClass("ui-state-hover")},function(){d(this).removeClass("ui-state-hover")}).focus(function(){if(b.disabled)d(this).blur();else{d(".ui-slider .ui-state-focus").removeClass("ui-state-focus");d(this).addClass("ui-state-focus")}}).blur(function(){d(this).removeClass("ui-state-focus")});this.handles.each(function(g){d(this).data("index.ui-slider-handle",g)});this.handles.keydown(function(g){var k=true,l=d(this).data("index.ui-slider-handle"),i,h,m;if(!a.options.disabled){switch(g.keyCode){case d.ui.keyCode.HOME:case d.ui.keyCode.END:case d.ui.keyCode.PAGE_UP:case d.ui.keyCode.PAGE_DOWN:case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:k=false;if(!a._keySliding){a._keySliding=true;d(this).addClass("ui-state-active");i=a._start(g,l);if(i===false)return}break}m=a.options.step;i=a.options.values&&a.options.values.length?(h=a.values(l)):(h=a.value());switch(g.keyCode){case d.ui.keyCode.HOME:h=a._valueMin();break;case d.ui.keyCode.END:h=a._valueMax();break;case d.ui.keyCode.PAGE_UP:h=a._trimAlignValue(i+(a._valueMax()-a._valueMin())/5);break;case d.ui.keyCode.PAGE_DOWN:h=a._trimAlignValue(i-(a._valueMax()-a._valueMin())/5);break;case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:if(i===a._valueMax())return;h=a._trimAlignValue(i+m);break;case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:if(i===a._valueMin())return;h=a._trimAlignValue(i-
m);break}a._slide(g,l,h);return k}}).keyup(function(g){var k=d(this).data("index.ui-slider-handle");if(a._keySliding){a._keySliding=false;a._stop(g,k);a._change(g,k);d(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");this._mouseDestroy();return this},_mouseCapture:function(a){var b=this.options,c,f,e,j,g;if(b.disabled)return false;this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();c=this._normValueFromMouse({x:a.pageX,y:a.pageY});f=this._valueMax()-this._valueMin()+1;j=this;this.handles.each(function(k){var l=Math.abs(c-j.values(k));if(f>l){f=l;e=d(this);g=k}});if(b.range===true&&this.values(1)===b.min){g+=1;e=d(this.handles[g])}if(this._start(a,g)===false)return false;this._mouseSliding=true;j._handleIndex=g;e.addClass("ui-state-active").focus();b=e.offset();this._clickOffset=!d(a.target).parents().andSelf().is(".ui-slider-handle")?{left:0,top:0}:{left:a.pageX-b.left-e.width()/2,top:a.pageY-b.top-e.height()/2-(parseInt(e.css("borderTopWidth"),10)||0)-(parseInt(e.css("borderBottomWidth"),10)||0)+(parseInt(e.css("marginTop"),10)||0)};this.handles.hasClass("ui-state-hover")||this._slide(a,g,c);return this._animateOff=true},_mouseStart:function(){return true},_mouseDrag:function(a){var b=this._normValueFromMouse({x:a.pageX,y:a.pageY});this._slide(a,this._handleIndex,b);return false},_mouseStop:function(a){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(a,this._handleIndex);this._change(a,this._handleIndex);this._clickOffset=this._handleIndex=null;return this._animateOff=false},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(a){var b;if(this.orientation==="horizontal"){b=this.elementSize.width;a=a.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{b=this.elementSize.height;a=a.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}b=a/b;if(b>1)b=1;if(b<0)b=0;if(this.orientation==="vertical")b=1-b;a=this._valueMax()-this._valueMin();return this._trimAlignValue(this._valueMin()+b*a)},_start:function(a,b){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);c.values=this.values()}return this._trigger("start",a,c)},_slide:function(a,b,c){var f;if(this.options.values&&this.options.values.length){f=this.values(b?0:1);if(this.options.values.length===2&&this.options.range===true&&(b===0&&c>f||b===1&&c<f))c=f;if(c!==this.values(b)){f=this.values();f[b]=c;a=this._trigger("slide",a,{handle:this.handles[b],value:c,values:f});this.values(b?0:1);a!==false&&this.values(b,c,true)}}else if(c!==this.value()){a=this._trigger("slide",a,{handle:this.handles[b],value:c});a!==false&&this.value(c)}},_stop:function(a,b){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);c.values=this.values()}this._trigger("stop",a,c)},_change:function(a,b){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);c.values=this.values()}this._trigger("change",a,c)}},value:function(a){if(arguments.length){this.options.value=this._trimAlignValue(a);this._refreshValue();this._change(null,0)}else return this._value()},values:function(a,b){var c,f,e;if(arguments.length>1){this.options.values[a]=this._trimAlignValue(b);this._refreshValue();this._change(null,a)}else if(arguments.length)if(d.isArray(arguments[0])){c=this.options.values;f=arguments[0];for(e=0;e<c.length;e+=1){c[e]=this._trimAlignValue(f[e]);this._change(null,e)}this._refreshValue()}else return this.options.values&&this.options.values.length?this._values(a):this.value();else return this._values()},_setOption:function(a,b){var c,f=0;if(d.isArray(this.options.values))f=this.options.values.length;d.Widget.prototype._setOption.apply(this,arguments);switch(a){case "disabled":if(b){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.propAttr("disabled",true);this.element.addClass("ui-disabled")}else{this.handles.propAttr("disabled",false);this.element.removeClass("ui-disabled")}break;case "orientation":this._detectOrientation();this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case "value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case "values":this._animateOff=true;this._refreshValue();for(c=0;c<f;c+=1)this._change(null,c);this._animateOff=false;break}},_value:function(){var a=this.options.value;return a=this._trimAlignValue(a)},_values:function(a){var b,c;if(arguments.length){b=this.options.values[a];return b=this._trimAlignValue(b)}else{b=this.options.values.slice();for(c=0;c<b.length;c+=1)b[c]=this._trimAlignValue(b[c]);return b}},_trimAlignValue:function(a){if(a<=this._valueMin())return this._valueMin();if(a>=this._valueMax())return this._valueMax();var b=this.options.step>0?this.options.step:1,c=(a-this._valueMin())%b;a=a-c;if(Math.abs(c)*2>=b)a+=c>0?b:-b;return parseFloat(a.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var a=this.options.range,b=this.options,c=this,f=!this._animateOff?b.animate:false,e,j={},g,k,l,i;if(this.options.values&&this.options.values.length)this.handles.each(function(h){e=(c.values(h)-c._valueMin())/(c._valueMax()-c._valueMin())*100;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";d(this).stop(1,1)[f?"animate":"css"](j,b.animate);if(c.options.range===true)if(c.orientation==="horizontal"){if(h===0)c.range.stop(1,1)[f?"animate":"css"]({left:e+"%"},b.animate);if(h===1)c.range[f?"animate":"css"]({width:e-
g+"%"},{queue:false,duration:b.animate})}else{if(h===0)c.range.stop(1,1)[f?"animate":"css"]({bottom:e+"%"},b.animate);if(h===1)c.range[f?"animate":"css"]({height:e-g+"%"},{queue:false,duration:b.animate})}g=e});else{k=this.value();l=this._valueMin();i=this._valueMax();e=i!==l?(k-l)/(i-l)*100:0;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";this.handle.stop(1,1)[f?"animate":"css"](j,b.animate);if(a==="min"&&this.orientation==="horizontal")this.range.stop(1,1)[f?"animate":"css"]({width:e+"%"},b.animate);if(a==="max"&&this.orientation==="horizontal")this.range[f?"animate":"css"]({width:100-e+"%"},{queue:false,duration:b.animate});if(a==="min"&&this.orientation==="vertical")this.range.stop(1,1)[f?"animate":"css"]({height:e+"%"},b.animate);if(a==="max"&&this.orientation==="vertical")this.range[f?"animate":"css"]({height:100-e+"%"},{queue:false,duration:b.animate})}}});d.extend(d.ui.slider,{version:"1.8.16"})})(jQuery);;(function(d,p){function u(){return++v}function w(){return++x}var v=0,x=0;d.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:"<li><a href='#{href}'><span>#{label}</span></a></li>"},_create:function(){this._tabify(true)},_setOption:function(b,e){if(b=="selected")this.options.collapsible&&e==this.options.selected||this.select(e);else{this.options[b]=e;this._tabify()}},_tabId:function(b){return b.title&&b.title.replace(/\s/g,"_").replace(/[^\w\u00c0-\uFFFF-]/g,"")||this.options.idPrefix+u()},_sanitizeSelector:function(b){return b.replace(/:/g,"\\:")},_cookie:function(){var b=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+w());return d.cookie.apply(null,[b].concat(d.makeArray(arguments)))},_ui:function(b,e){return{tab:b,panel:e,index:this.anchors.index(b)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var b=
d(this);b.html(b.data("label.tabs")).removeData("label.tabs")})},_tabify:function(b){function e(g,f){g.css("display","");!d.support.opacity&&f.opacity&&g[0].style.removeAttribute("filter")}var a=this,c=this.options,h=/^#.+/;this.list=this.element.find("ol,ul").eq(0);this.lis=d(" > li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return d("a",this)[0]});this.panels=d([]);this.anchors.each(function(g,f){var i=d(f).attr("href"),l=i.split("#")[0],q;if(l&&(l===location.toString().split("#")[0]||
(q=d("base")[0])&&l===q.href)){i=f.hash;f.href=i}if(h.test(i))a.panels=a.panels.add(a.element.find(a._sanitizeSelector(i)));else if(i&&i!=="#"){d.data(f,"href.tabs",i);d.data(f,"load.tabs",i.replace(/#.*$/,""));i=a._tabId(f);f.href="#"+i;f=a.element.find("#"+i);if(!f.length){f=d(c.panelTemplate).attr("id",i).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(a.panels[g-1]||a.list);f.data("destroy.tabs",true)}a.panels=a.panels.add(f)}else c.disabled.push(g)});if(b){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(c.selected===p){location.hash&&this.anchors.each(function(g,f){if(f.hash==location.hash){c.selected=g;return false}});if(typeof c.selected!=="number"&&c.cookie)c.selected=parseInt(a._cookie(),10);if(typeof c.selected!=="number"&&this.lis.filter(".ui-tabs-selected").length)c.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));c.selected=c.selected||(this.lis.length?0:-1)}else if(c.selected===null)c.selected=-1;c.selected=c.selected>=0&&this.anchors[c.selected]||c.selected<0?c.selected:0;c.disabled=d.unique(c.disabled.concat(d.map(this.lis.filter(".ui-state-disabled"),function(g){return a.lis.index(g)}))).sort();d.inArray(c.selected,c.disabled)!=-1&&c.disabled.splice(d.inArray(c.selected,c.disabled),1);this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");if(c.selected>=0&&this.anchors.length){a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash)).removeClass("ui-tabs-hide");this.lis.eq(c.selected).addClass("ui-tabs-selected ui-state-active");a.element.queue("tabs",function(){a._trigger("show",null,a._ui(a.anchors[c.selected],a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash))[0]))});this.load(c.selected)}d(window).bind("unload",function(){a.lis.add(a.anchors).unbind(".tabs");a.lis=a.anchors=a.panels=null})}else c.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));this.element[c.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");c.cookie&&this._cookie(c.selected,c.cookie);b=0;for(var j;j=this.lis[b];b++)d(j)[d.inArray(b,c.disabled)!=-1&&!d(j).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled");c.cache===false&&this.anchors.removeData("cache.tabs");this.lis.add(this.anchors).unbind(".tabs");if(c.event!=="mouseover"){var k=function(g,f){f.is(":not(.ui-state-disabled)")&&f.addClass("ui-state-"+g)},n=function(g,f){f.removeClass("ui-state-"+
g)};this.lis.bind("mouseover.tabs",function(){k("hover",d(this))});this.lis.bind("mouseout.tabs",function(){n("hover",d(this))});this.anchors.bind("focus.tabs",function(){k("focus",d(this).closest("li"))});this.anchors.bind("blur.tabs",function(){n("focus",d(this).closest("li"))})}var m,o;if(c.fx)if(d.isArray(c.fx)){m=c.fx[0];o=c.fx[1]}else m=o=c.fx;var r=o?function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.hide().removeClass("ui-tabs-hide").animate(o,o.duration||"normal",function(){e(f,o);a._trigger("show",null,a._ui(g,f[0]))})}:function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.removeClass("ui-tabs-hide");a._trigger("show",null,a._ui(g,f[0]))},s=m?function(g,f){f.animate(m,m.duration||"normal",function(){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");e(f,m);a.element.dequeue("tabs")})}:function(g,f){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");a.element.dequeue("tabs")};this.anchors.bind(c.event+".tabs",function(){var g=this,f=d(g).closest("li"),i=a.panels.filter(":not(.ui-tabs-hide)"),l=a.element.find(a._sanitizeSelector(g.hash));if(f.hasClass("ui-tabs-selected")&&!c.collapsible||f.hasClass("ui-state-disabled")||f.hasClass("ui-state-processing")||a.panels.filter(":animated").length||a._trigger("select",null,a._ui(this,l[0]))===false){this.blur();return false}c.selected=a.anchors.index(this);a.abort();if(c.collapsible)if(f.hasClass("ui-tabs-selected")){c.selected=-1;c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){s(g,i)}).dequeue("tabs");this.blur();return false}else if(!i.length){c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this));this.blur();return false}c.cookie&&a._cookie(c.selected,c.cookie);if(l.length){i.length&&a.element.queue("tabs",function(){s(g,i)});a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this))}else throw"jQuery UI Tabs: Mismatching fragment identifier.";d.browser.msie&&this.blur()});this.anchors.bind("click.tabs",function(){return false})},_getIndex:function(b){if(typeof b=="string")b=this.anchors.index(this.anchors.filter("[href$="+b+"]"));return b},destroy:function(){var b=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=d.data(this,"href.tabs");if(e)this.href=e;var a=d(this).unbind(".tabs");d.each(["href","load","cache"],function(c,h){a.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){d.data(this,"destroy.tabs")?d(this).remove():d(this).removeClass("ui-state-default ui-corner-top ui-tabs-selected ui-state-active ui-state-hover ui-state-focus ui-state-disabled ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide")});b.cookie&&this._cookie(null,b.cookie);return this},add:function(b,e,a){if(a===p)a=this.anchors.length;var c=this,h=this.options;e=d(h.tabTemplate.replace(/#\{href\}/g,b).replace(/#\{label\}/g,e));b=!b.indexOf("#")?b.replace("#",""):this._tabId(d("a",e)[0]);e.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var j=c.element.find("#"+b);j.length||(j=d(h.panelTemplate).attr("id",b).data("destroy.tabs",true));j.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(a>=this.lis.length){e.appendTo(this.list);j.appendTo(this.list[0].parentNode)}else{e.insertBefore(this.lis[a]);
j.insertBefore(this.panels[a])}h.disabled=d.map(h.disabled,function(k){return k>=a?++k:k});this._tabify();if(this.anchors.length==1){h.selected=0;e.addClass("ui-tabs-selected ui-state-active");j.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){c._trigger("show",null,c._ui(c.anchors[0],c.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[a],this.panels[a]));return this},remove:function(b){b=this._getIndex(b);var e=this.options,a=this.lis.eq(b).remove(),c=this.panels.eq(b).remove();if(a.hasClass("ui-tabs-selected")&&this.anchors.length>1)this.select(b+(b+1<this.anchors.length?1:-1));e.disabled=d.map(d.grep(e.disabled,function(h){return h!=b}),function(h){return h>=b?--h:h});this._tabify();this._trigger("remove",null,this._ui(a.find("a")[0],c[0]));return this},enable:function(b){b=this._getIndex(b);var e=this.options;if(d.inArray(b,e.disabled)!=-1){this.lis.eq(b).removeClass("ui-state-disabled");e.disabled=d.grep(e.disabled,function(a){return a!=b});this._trigger("enable",null,this._ui(this.anchors[b],this.panels[b]));return this}},disable:function(b){b=this._getIndex(b);var e=this.options;if(b!=e.selected){this.lis.eq(b).addClass("ui-state-disabled");e.disabled.push(b);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[b],this.panels[b]))}return this},select:function(b){b=this._getIndex(b);if(b==-1)if(this.options.collapsible&&this.options.selected!=-1)b=this.options.selected;else return this;this.anchors.eq(b).trigger(this.options.event+".tabs");return this},load:function(b){b=this._getIndex(b);var e=this,a=this.options,c=this.anchors.eq(b)[0],h=d.data(c,"load.tabs");this.abort();if(!h||this.element.queue("tabs").length!==0&&d.data(c,"cache.tabs"))this.element.dequeue("tabs");else{this.lis.eq(b).addClass("ui-state-processing");if(a.spinner){var j=d("span",c);j.data("label.tabs",j.html()).html(a.spinner)}this.xhr=d.ajax(d.extend({},a.ajaxOptions,{url:h,success:function(k,n){e.element.find(e._sanitizeSelector(c.hash)).html(k);e._cleanup();a.cache&&d.data(c,"cache.tabs",true);e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.success(k,n)}catch(m){}},error:function(k,n){e._cleanup();e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.error(k,n,b,c)}catch(m){}}}));e.element.dequeue("tabs");return this}},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},url:function(b,e){this.anchors.eq(b).removeData("cache.tabs").data("load.tabs",e);return this},length:function(){return this.anchors.length}});d.extend(d.ui.tabs,{version:"1.8.16"});d.extend(d.ui.tabs.prototype,{rotation:null,rotate:function(b,e){var a=this,c=this.options,h=a._rotate||(a._rotate=function(j){clearTimeout(a.rotation);a.rotation=setTimeout(function(){var k=c.selected;a.select(++k<a.anchors.length?k:0)},b);j&&j.stopPropagation()});e=a._unrotate||(a._unrotate=!e?function(j){j.clientX&&a.rotate(null)}:function(){t=c.selected;h()});if(b){this.element.bind("tabsshow",h);this.anchors.bind(c.event+".tabs",e);h()}else{clearTimeout(a.rotation);this.element.unbind("tabsshow",h);this.anchors.unbind(c.event+".tabs",e);delete this._rotate;delete this._unrotate}return this}})})(jQuery);;(function(b,d){b.widget("ui.progressbar",{options:{value:0,max:100},min:0,_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this.min,"aria-valuemax":this.options.max,"aria-valuenow":this._value()});this.valueDiv=b("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this.oldValue=this._value();this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");this.valueDiv.remove();b.Widget.prototype.destroy.apply(this,arguments)},value:function(a){if(a===d)return this._value();this._setOption("value",a);return this},_setOption:function(a,c){if(a==="value"){this.options.value=c;this._refreshValue();this._value()===this.options.max&&this._trigger("complete")}b.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var a=this.options.value;if(typeof a!=="number")a=0;return Math.min(this.options.max,Math.max(this.min,a))},_percentage:function(){return 100*
this._value()/this.options.max},_refreshValue:function(){var a=this.value(),c=this._percentage();if(this.oldValue!==a){this.oldValue=a;this._trigger("change")}this.valueDiv.toggle(a>this.min).toggleClass("ui-corner-right",a===this.options.max).width(c.toFixed(0)+"%");this.element.attr("aria-valuenow",a)}});b.extend(b.ui.progressbar,{version:"1.8.16"})})(jQuery);;jQuery.effects||function(f,j){function m(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return n.transparent;return n[f.trim(c).toLowerCase()]}function s(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return m(b)}function o(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function p(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in t||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function u(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function k(c,a,b,d){if(typeof c=="object"){d=
a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}if(f.isFunction(b)){d=b;b=null}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:b in f.fx.speeds?f.fx.speeds[b]:f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}function l(c){if(!c||typeof c==="number"||f.fx.speeds[c])return true;if(typeof c==="string"&&!f.effects[c])return true;return false}f.effects={};f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","borderColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=s(b.elem,a);b.end=m(b.end);b.colorInit=true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}});var n={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},q=["add","remove","toggle"],t={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,d){if(f.isFunction(b)){d=b;b=null}return this.queue(function(){var e=f(this),g=e.attr("style")||" ",h=p(o.call(this)),r,v=e.attr("class");f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});r=p(o.call(this));e.attr("class",v);e.animate(u(h,r),{queue:false,duration:a,easing:b,complete:function(){f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments);f.dequeue(this)}})})};f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===j?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.16",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,a){var b;switch(c[0]){case "top":b=0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),d=document.activeElement;c.wrap(b);if(c[0]===d||f.contains(c[0],d))f(d).focus();b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(e,g){a[g]=c.css(g);if(isNaN(parseInt(a[g],10)))a[g]="auto"});c.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})}return b.css(a).show()},removeWrapper:function(c){var a,b=document.activeElement;if(c.parent().is(".ui-effects-wrapper")){a=c.parent().replaceWith(c);if(c[0]===b||f.contains(c[0],b))f(b).focus();return a}return c},setTransition:function(c,a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=k.apply(this,arguments),b={options:a[1],duration:a[2],callback:a[3]};a=b.options.mode;var d=f.effects[c];if(f.fx.off||!d)return a?this[a](b.duration,b.callback):this.each(function(){b.callback&&b.callback.call(this)});return d.call(this,b)},_show:f.fn.show,show:function(c){if(l(c))return this._show.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(l(c))return this._hide.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(l(c)||typeof c==="boolean"||f.isFunction(c))return this.__toggle.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),b=[];f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,a,b,d,e){if((a/=e/2)<1)return d/
2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,a,b,d,e){return d*((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+b},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,10*(a/e-1))+b},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==e)return b+d;if((a/=e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*a)+1)+b},easeInElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);if(a<1)return-0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,d,e)*0.5+b;return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b}})}(jQuery);;(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","bottom","left","right"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,g);b.effects.removeWrapper(a);c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);;(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","bottom","left","right"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);;(function(b){b.effects.clip=function(e){return this.queue(function(){var a=b(this),i=["position","top","bottom","left","right","height","width"],f=b.effects.setMode(a,e.options.mode||"hide"),c=e.options.direction||"vertical";b.effects.save(a,i);a.show();var d=b.effects.createWrapper(a).css({overflow:"hidden"});d=a[0].tagName=="IMG"?d:a;var g={size:c=="vertical"?"height":"width",position:c=="vertical"?"top":"left"};c=c=="vertical"?d.height():d.width();if(f=="show"){d.css(g.size,0);d.css(g.position,c/2)}var h={};h[g.size]=f=="show"?c:0;h[g.position]=f=="show"?0:c/2;d.animate(h,{queue:false,duration:e.duration,easing:e.options.easing,complete:function(){f=="hide"&&a.hide();b.effects.restore(a,i);b.effects.removeWrapper(a);e.callback&&e.callback.apply(a[0],arguments);a.dequeue()}})})}})(jQuery);;(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a);var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);if(e=="show")a.css("opacity",0).css(f,b=="pos"?-g:g);var i={opacity:e=="show"?1:0};i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);;(function(j){j.effects.explode=function(a){return this.queue(function(){var c=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3,d=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3;a.options.mode=a.options.mode=="toggle"?j(this).is(":visible")?"hide":"show":a.options.mode;var b=j(this).show().css("visibility","hidden"),g=b.offset();g.top-=parseInt(b.css("marginTop"),10)||0;g.left-=parseInt(b.css("marginLeft"),10)||0;for(var h=b.outerWidth(true),i=b.outerHeight(true),e=0;e<c;e++)for(var f=0;f<d;f++)b.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-f*(h/d),top:-e*(i/c)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:h/d,height:i/c,left:g.left+f*(h/d)+(a.options.mode=="show"?(f-Math.floor(d/2))*(h/d):0),top:g.top+e*(i/c)+(a.options.mode=="show"?(e-Math.floor(c/2))*(i/c):0),opacity:a.options.mode=="show"?0:1}).animate({left:g.left+f*(h/d)+(a.options.mode=="show"?0:(f-Math.floor(d/2))*(h/d)),top:g.top+
e*(i/c)+(a.options.mode=="show"?0:(e-Math.floor(c/2))*(i/c)),opacity:a.options.mode=="show"?1:0},a.duration||500);setTimeout(function(){a.options.mode=="show"?b.css({visibility:"visible"}):b.css({visibility:"visible"}).hide();a.callback&&a.callback.apply(b[0]);b.dequeue();j("div.ui-effects-explode").remove()},a.duration||500)})}})(jQuery);;(function(b){b.effects.fade=function(a){return this.queue(function(){var c=b(this),d=b.effects.setMode(c,a.options.mode||"hide");c.animate({opacity:d},{queue:false,duration:a.duration,easing:a.options.easing,complete:function(){a.callback&&a.callback.apply(this,arguments);c.dequeue()}})})}})(jQuery);;(function(c){c.effects.fold=function(a){return this.queue(function(){var b=c(this),j=["position","top","bottom","left","right"],d=c.effects.setMode(b,a.options.mode||"hide"),g=a.options.size||15,h=!!a.options.horizFirst,k=a.duration?a.duration/2:c.fx.speeds._default/2;c.effects.save(b,j);b.show();var e=c.effects.createWrapper(b).css({overflow:"hidden"}),f=d=="show"!=h,l=f?["width","height"]:["height","width"];f=f?[e.width(),e.height()]:[e.height(),e.width()];var i=/([0-9]+)%/.exec(g);if(i)g=parseInt(i[1],
10)/100*f[d=="hide"?0:1];if(d=="show")e.css(h?{height:0,width:g}:{height:g,width:0});h={};i={};h[l[0]]=d=="show"?f[0]:g;i[l[1]]=d=="show"?f[1]:0;e.animate(h,k,a.options.easing).animate(i,k,a.options.easing,function(){d=="hide"&&b.hide();c.effects.restore(b,j);c.effects.removeWrapper(b);a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);;(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};if(d=="hide")f.opacity=0;b.effects.save(a,e);a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();b.effects.restore(a,e);d=="show"&&!b.support.opacity&&this.style.removeAttribute("filter");c.callback&&c.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);;(function(d){d.effects.pulsate=function(a){return this.queue(function(){var b=d(this),c=d.effects.setMode(b,a.options.mode||"show");times=(a.options.times||5)*2-1;duration=a.duration?a.duration/2:d.fx.speeds._default/2;isVisible=b.is(":visible");animateTo=0;if(!isVisible){b.css("opacity",0).show();animateTo=1}if(c=="hide"&&isVisible||c=="show"&&!isVisible)times--;for(c=0;c<times;c++){b.animate({opacity:animateTo},duration,a.options.easing);animateTo=(animateTo+1)%2}b.animate({opacity:animateTo},duration,a.options.easing,function(){animateTo==0&&b.hide();a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()}).dequeue()})}})(jQuery);;(function(c){c.effects.puff=function(b){return this.queue(function(){var a=c(this),e=c.effects.setMode(a,b.options.mode||"hide"),g=parseInt(b.options.percent,10)||150,h=g/100,i={height:a.height(),width:a.width()};c.extend(b.options,{fade:true,mode:e,percent:e=="hide"?g:100,from:e=="hide"?i:{height:i.height*h,width:i.width*h}});a.effect("scale",b.options,b.duration,b.callback);a.dequeue()})};c.effects.scale=function(b){return this.queue(function(){var a=c(this),e=c.extend(true,{},b.options),g=c.effects.setMode(a,b.options.mode||"effect"),h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:g=="hide"?0:100),i=b.options.direction||"both",f=b.options.origin;if(g!="effect"){e.origin=f||["middle","center"];e.restore=true}f={height:a.height(),width:a.width()};a.from=b.options.from||(g=="show"?{height:0,width:0}:f);h={y:i!="horizontal"?h/100:1,x:i!="vertical"?h/100:1};a.to={height:f.height*h.y,width:f.width*h.x};if(b.options.fade){if(g=="show"){a.from.opacity=0;a.to.opacity=1}if(g=="hide"){a.from.opacity=1;a.to.opacity=0}}e.from=a.from;e.to=a.to;e.mode=g;a.effect("size",e,b.duration,b.callback);a.dequeue()})};c.effects.size=function(b){return this.queue(function(){var a=c(this),e=["position","top","bottom","left","right","width","height","overflow","opacity"],g=["position","top","bottom","left","right","overflow","opacity"],h=["width","height","overflow"],i=["fontSize"],f=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],k=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],p=c.effects.setMode(a,b.options.mode||"effect"),n=b.options.restore||false,m=b.options.scale||"both",l=b.options.origin,j={height:a.height(),width:a.width()};a.from=b.options.from||j;a.to=b.options.to||j;if(l){l=c.effects.getBaseline(l,j);a.from.top=(j.height-a.from.height)*l.y;a.from.left=(j.width-a.from.width)*l.x;a.to.top=(j.height-a.to.height)*l.y;a.to.left=(j.width-a.to.width)*l.x}var d={from:{y:a.from.height/j.height,x:a.from.width/j.width},to:{y:a.to.height/j.height,x:a.to.width/j.width}};if(m=="box"||m=="both"){if(d.from.y!=d.to.y){e=e.concat(f);a.from=c.effects.setTransition(a,f,d.from.y,a.from);a.to=c.effects.setTransition(a,f,d.to.y,a.to)}if(d.from.x!=d.to.x){e=e.concat(k);a.from=c.effects.setTransition(a,k,d.from.x,a.from);a.to=c.effects.setTransition(a,k,d.to.x,a.to)}}if(m=="content"||m=="both")if(d.from.y!=d.to.y){e=e.concat(i);a.from=c.effects.setTransition(a,i,d.from.y,a.from);a.to=c.effects.setTransition(a,i,d.to.y,a.to)}c.effects.save(a,n?e:g);a.show();c.effects.createWrapper(a);a.css("overflow","hidden").css(a.from);if(m=="content"||m=="both"){f=f.concat(["marginTop","marginBottom"]).concat(i);k=k.concat(["marginLeft","marginRight"]);h=e.concat(f).concat(k);a.find("*[width]").each(function(){child=c(this);n&&c.effects.save(child,h);var o={height:child.height(),width:child.width()};child.from={height:o.height*d.from.y,width:o.width*d.from.x};child.to={height:o.height*d.to.y,width:o.width*d.to.x};if(d.from.y!=d.to.y){child.from=c.effects.setTransition(child,f,d.from.y,child.from);child.to=c.effects.setTransition(child,f,d.to.y,child.to)}if(d.from.x!=d.to.x){child.from=c.effects.setTransition(child,k,d.from.x,child.from);child.to=c.effects.setTransition(child,k,d.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){n&&c.effects.restore(child,h)})})}a.animate(a.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){a.to.opacity===0&&a.css("opacity",a.from.opacity);p=="hide"&&a.hide();c.effects.restore(a,n?e:g);c.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);;(function(d){d.effects.shake=function(a){return this.queue(function(){var b=d(this),j=["position","top","bottom","left","right"];d.effects.setMode(b,a.options.mode||"effect");var c=a.options.direction||"left",e=a.options.distance||20,l=a.options.times||3,f=a.duration||a.options.duration||140;d.effects.save(b,j);b.show();d.effects.createWrapper(b);var g=c=="up"||c=="down"?"top":"left",h=c=="up"||c=="left"?"pos":"neg";c={};var i={},k={};c[g]=(h=="pos"?"-=":"+=")+e;i[g]=(h=="pos"?"+=":"-=")+e*2;k[g]=(h=="pos"?"-=":"+=")+e*2;b.animate(c,f,a.options.easing);for(e=1;e<l;e++)b.animate(i,f,a.options.easing).animate(k,f,a.options.easing);b.animate(i,f,a.options.easing).animate(c,f/2,a.options.easing,function(){d.effects.restore(b,j);d.effects.removeWrapper(b);a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()});b.dequeue()})}})(jQuery);;(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right"],f=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a).css({overflow:"hidden"});var g=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var e=d.options.distance||(g=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));if(f=="show")a.css(g,b=="pos"?isNaN(e)?"-"+e:-e:e);var i={};i[g]=(f=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+e;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){f=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);;(function(e){e.effects.transfer=function(a){return this.queue(function(){var b=e(this),c=e(a.options.to),d=c.offset();c={top:d.top,left:d.left,height:c.innerHeight(),width:c.innerWidth()};d=b.offset();var f=e('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(a.options.className).css({top:d.top,left:d.left,height:b.innerHeight(),width:b.innerWidth(),position:"absolute"}).animate(c,a.duration,a.options.easing,function(){f.remove();a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);;(function($,undefined ) {$.extend($.ui,{datepicker_old:{version:"1.8.16"} });var PROP_NAME ='datepicker';var dpuuid =new Date().getTime();var instActive;function Datepicker() {this.debug =false;this._curInst =null;this._keyEvent =false;this._disabledInputs =[];this._datepickerShowing =false;this._inDialog =false;this._mainDivId ='ui-datepicker-div';this._inlineClass ='ui-datepicker-inline';this._appendClass ='ui-datepicker-append';this._triggerClass ='ui-datepicker-trigger';this._dialogClass ='ui-datepicker-dialog';this._disableClass ='ui-datepicker-disabled';this._unselectableClass ='ui-datepicker-unselectable';this._currentClass ='ui-datepicker-current-day';this._dayOverClass ='ui-datepicker-days-cell-over';this.regional =[];this.regional[''] ={closeText:'Done',prevText:'Prev',nextText:'Next',currentText:'Today',monthNames:['January','February','March','April','May','June','July','August','September','October','November','December'],monthNamesShort:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],dayNames:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],dayNamesShort:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],dayNamesMin:['Su','Mo','Tu','We','Th','Fr','Sa'],weekHeader:'Wk',dateFormat:'mm/dd/yy',firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:''};this._defaults ={showOn:'focus',showAnim:'fadeIn',showOptions:{},defaultDate:null,appendText:'',buttonText:'...',buttonImage:'',buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:'c-10:c+10',showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:'+10',minDate:null,maxDate:null,duration:'fast',beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:'',altFormat:'',constrainInput:true,showButtonPanel:false,autoSize:false,disabled:false };$.extend(this._defaults,this.regional['']);this.dpDiv =bindHover($('<div id="'+ this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'));}
 $.extend(Datepicker.prototype,{markerClassName:'hasDatepicker',maxRows:4,log:function () {if (this.debug)
 console.log.apply('',arguments);},_widgetDatepicker:function() {return this.dpDiv;},setDefaults:function(settings) {extendRemove(this._defaults,settings ||{});return this;},_attachDatepicker:function(target,settings) {var inlineSettings =null;for (var attrName in this._defaults) {var attrValue =target.getAttribute('date:'+ attrName);if (attrValue) {inlineSettings =inlineSettings ||{};try {inlineSettings[attrName] =eval(attrValue);} catch (err) {inlineSettings[attrName] =attrValue;}
 }
 }
 var nodeName =target.nodeName.toLowerCase();var inline =(nodeName =='div'||nodeName =='span');if (!target.id) {this.uuid +=1;target.id ='dp'+ this.uuid;}
 var inst =this._newInst($(target),inline);inst.settings =$.extend({},settings ||{},inlineSettings ||{});if (nodeName =='input') {this._connectDatepicker(target,inst);} else if (inline) {this._inlineDatepicker(target,inst);}
 },_newInst:function(target,inline) {var id =target[0].id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1'); // escape jQuery meta chars
 return {id:id,input:target,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:inline,dpDiv:(!inline ?this.dpDiv :bindHover($('<div class="'+ this._inlineClass + ' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')))};},_connectDatepicker:function(target,inst) {var input =$(target);inst.append =$([]);inst.trigger =$([]);if (input.hasClass(this.markerClassName))
 return;this._attachments(input,inst);input.addClass(this.markerClassName).keydown(this._doKeyDown).
 keypress(this._doKeyPress).keyup(this._doKeyUp).
 bind("setData.datepicker",function(event,key,value) {inst.settings[key] =value;}).bind("getData.datepicker",function(event,key) {return this._get(inst,key);});this._autoSize(inst);$.data(target,PROP_NAME,inst);if(inst.settings.disabled ) {this._disableDatepicker(target );}
 },_attachments:function(input,inst) {var appendText =this._get(inst,'appendText');var isRTL =this._get(inst,'isRTL');if (inst.append)
 inst.append.remove();if (appendText) {inst.append =$('<span class="'+ this._appendClass + '">'+ appendText + '</span>');input[isRTL ?'before':'after'](inst.append);}
 input.unbind('focus',this._showDatepicker);if (inst.trigger)
 inst.trigger.remove();var showOn =this._get(inst,'showOn');if (showOn =='focus'||showOn =='both') input.focus(this._showDatepicker);if (showOn =='button'||showOn =='both') {var buttonText =this._get(inst,'buttonText');var buttonImage =this._get(inst,'buttonImage');inst.trigger =$(this._get(inst,'buttonImageOnly') ?$('<img/>').addClass(this._triggerClass).
 attr({src:buttonImage,alt:buttonText,title:buttonText }) :$('<button type="button"></button>').addClass(this._triggerClass).
 html(buttonImage ==''?buttonText :$('<img/>').attr({src:buttonImage,alt:buttonText,title:buttonText })));input[isRTL ?'before':'after'](inst.trigger);inst.trigger.click(function() {if ($.datepicker_old._datepickerShowing &&$.datepicker_old._lastInput ==input[0])
 $.datepicker_old._hideDatepicker();else
 $.datepicker_old._showDatepicker(input[0]);return false;});}
 },_autoSize:function(inst) {if (this._get(inst,'autoSize') &&!inst.inline) {var date =new Date(2009,12 - 1,20);var dateFormat =this._get(inst,'dateFormat');if (dateFormat.match(/[DM]/)) {
 var findMax =function(names) {var max =0;var maxI =0;for (var i =0;i < names.length;i++) {if (names[i].length > max) {max =names[i].length;maxI =i;}
 }
 return maxI;};date.setMonth(findMax(this._get(inst,(dateFormat.match(/MM/) ?
 'monthNames':'monthNamesShort'))));date.setDate(findMax(this._get(inst,(dateFormat.match(/DD/) ?
 'dayNames':'dayNamesShort'))) + 20 - date.getDay());}
 inst.input.attr('size',this._formatDate(inst,date).length);}
 },_inlineDatepicker:function(target,inst) {var divSpan =$(target);if (divSpan.hasClass(this.markerClassName))
 return;divSpan.addClass(this.markerClassName).append(inst.dpDiv).
 bind("setData.datepicker",function(event,key,value){inst.settings[key] =value;}).bind("getData.datepicker",function(event,key){return this._get(inst,key);});$.data(target,PROP_NAME,inst);this._setDate(inst,this._getDefaultDate(inst),true);this._updateDatepicker(inst);this._updateAlternate(inst);if(inst.settings.disabled ) {this._disableDatepicker(target );}
 inst.dpDiv.css("display","block");},_dialogDatepicker:function(input,date,onSelect,settings,pos) {var inst =this._dialogInst;if (!inst) {this.uuid +=1;var id ='dp'+ this.uuid;this._dialogInput =$('<input type="text" id="'+ id +
 '" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);$('body').append(this._dialogInput);inst =this._dialogInst =this._newInst(this._dialogInput,false);inst.settings ={};$.data(this._dialogInput[0],PROP_NAME,inst);}
 extendRemove(inst.settings,settings ||{});date =(date &&date.constructor ==Date ?this._formatDate(inst,date) :date);this._dialogInput.val(date);this._pos =(pos ?(pos.length ?pos :[pos.pageX,pos.pageY]) :null);if (!this._pos) {var browserWidth =document.documentElement.clientWidth;var browserHeight =document.documentElement.clientHeight;var scrollX =document.documentElement.scrollLeft ||document.body.scrollLeft;var scrollY =document.documentElement.scrollTop ||document.body.scrollTop;this._pos =[(browserWidth / 2) - 100 + scrollX,(browserHeight / 2) - 150 + scrollY];}
 this._dialogInput.css('left',(this._pos[0] + 20) + 'px').css('top',this._pos[1] + 'px');inst.settings.onSelect =onSelect;this._inDialog =true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);if ($.blockUI)
 $.blockUI(this.dpDiv);$.data(this._dialogInput[0],PROP_NAME,inst);return this;},_destroyDatepicker:function(target) {var $target =$(target);var inst =$.data(target,PROP_NAME);if (!$target.hasClass(this.markerClassName)) {return;}
 var nodeName =target.nodeName.toLowerCase();$.removeData(target,PROP_NAME);if (nodeName =='input') {inst.append.remove();inst.trigger.remove();$target.removeClass(this.markerClassName).
 unbind('focus',this._showDatepicker).
 unbind('keydown',this._doKeyDown).
 unbind('keypress',this._doKeyPress).
 unbind('keyup',this._doKeyUp);} else if (nodeName =='div'||nodeName =='span')
 $target.removeClass(this.markerClassName).empty();},_enableDatepicker:function(target) {var $target =$(target);var inst =$.data(target,PROP_NAME);if (!$target.hasClass(this.markerClassName)) {return;}
 var nodeName =target.nodeName.toLowerCase();if (nodeName =='input') {target.disabled =false;inst.trigger.filter('button').
 each(function() {this.disabled =false;}).end().
 filter('img').css({opacity:'1.0',cursor:''});}
 else if (nodeName =='div'||nodeName =='span') {var inline =$target.children('.'+ this._inlineClass);inline.children().removeClass('ui-state-disabled');inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
 removeAttr("disabled");}
 this._disabledInputs =$.map(this._disabledInputs,function(value) {return (value ==target ?null :value);});},_disableDatepicker:function(target) {var $target =$(target);var inst =$.data(target,PROP_NAME);if (!$target.hasClass(this.markerClassName)) {return;}
 var nodeName =target.nodeName.toLowerCase();if (nodeName =='input') {target.disabled =true;inst.trigger.filter('button').
 each(function() {this.disabled =true;}).end().
 filter('img').css({opacity:'0.5',cursor:'default'});}
 else if (nodeName =='div'||nodeName =='span') {var inline =$target.children('.'+ this._inlineClass);inline.children().addClass('ui-state-disabled');inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
 attr("disabled","disabled");}
 this._disabledInputs =$.map(this._disabledInputs,function(value) {return (value ==target ?null :value);});this._disabledInputs[this._disabledInputs.length] =target;},_isDisabledDatepicker:function(target) {if (!target) {return false;}
 for (var i =0;i < this._disabledInputs.length;i++) {if (this._disabledInputs[i] ==target)
 return true;}
 return false;},_getInst:function(target) {try {return $.data(target,PROP_NAME);}
 catch (err) {throw 'Missing instance data for this datepicker';}
 },_optionDatepicker:function(target,name,value) {var inst =this._getInst(target);if (arguments.length ==2 &&typeof name =='string') {return (name =='defaults'?$.extend({},$.datepicker_old._defaults) :(inst ?(name =='all'?$.extend({},inst.settings) :this._get(inst,name)) :null));}
 var settings =name ||{};if (typeof name =='string') {settings ={};settings[name] =value;}
 if (inst) {if (this._curInst ==inst) {this._hideDatepicker();}
 var date =this._getDateDatepicker(target,true);var minDate =this._getMinMaxDate(inst,'min');var maxDate =this._getMinMaxDate(inst,'max');extendRemove(inst.settings,settings);if (minDate !==null &&settings['dateFormat'] !==undefined &&settings['minDate'] ===undefined)
 inst.settings.minDate =this._formatDate(inst,minDate);if (maxDate !==null &&settings['dateFormat'] !==undefined &&settings['maxDate'] ===undefined)
 inst.settings.maxDate =this._formatDate(inst,maxDate);this._attachments($(target),inst);this._autoSize(inst);this._setDate(inst,date);this._updateAlternate(inst);this._updateDatepicker(inst);}
 },_changeDatepicker:function(target,name,value) {this._optionDatepicker(target,name,value);},_refreshDatepicker:function(target) {var inst =this._getInst(target);if (inst) {this._updateDatepicker(inst);}
 },_setDateDatepicker:function(target,date) {var inst =this._getInst(target);if (inst) {this._setDate(inst,date);this._updateDatepicker(inst);this._updateAlternate(inst);}
 },_getDateDatepicker:function(target,noDefault) {var inst =this._getInst(target);if (inst &&!inst.inline)
 this._setDateFromField(inst,noDefault);return (inst ?this._getDate(inst) :null);},_doKeyDown:function(event) {var inst =$.datepicker_old._getInst(event.target);var handled =true;var isRTL =inst.dpDiv.is('.ui-datepicker-rtl');inst._keyEvent =true;if ($.datepicker_old._datepickerShowing)
 switch (event.keyCode) {case 9:$.datepicker_old._hideDatepicker();handled =false;break;case 13:var sel =$('td.'+ $.datepicker_old._dayOverClass + ':not(.'+
 $.datepicker_old._currentClass + ')',inst.dpDiv);if (sel[0])
 $.datepicker_old._selectDay(event.target,inst.selectedMonth,inst.selectedYear,sel[0]);var onSelect =$.datepicker_old._get(inst,'onSelect');if (onSelect) {var dateStr =$.datepicker_old._formatDate(inst);onSelect.apply((inst.input ?inst.input[0] :null),[dateStr,inst]);}
 else
 $.datepicker_old._hideDatepicker();return false;break;case 27:$.datepicker_old._hideDatepicker();break;case 33:$.datepicker_old._adjustDate(event.target,(event.ctrlKey ?-$.datepicker_old._get(inst,'stepBigMonths') :-$.datepicker_old._get(inst,'stepMonths')),'M');break;case 34:$.datepicker_old._adjustDate(event.target,(event.ctrlKey ?+$.datepicker_old._get(inst,'stepBigMonths') :+$.datepicker_old._get(inst,'stepMonths')),'M');break;case 35:if (event.ctrlKey ||event.metaKey) $.datepicker_old._clearDate(event.target);handled =event.ctrlKey ||event.metaKey;break;case 36:if (event.ctrlKey ||event.metaKey) $.datepicker_old._gotoToday(event.target);handled =event.ctrlKey ||event.metaKey;break;case 37:if (event.ctrlKey ||event.metaKey) $.datepicker_old._adjustDate(event.target,(isRTL ?+1 :-1),'D');handled =event.ctrlKey ||event.metaKey;if (event.originalEvent.altKey) $.datepicker_old._adjustDate(event.target,(event.ctrlKey ?-$.datepicker_old._get(inst,'stepBigMonths') :-$.datepicker_old._get(inst,'stepMonths')),'M');break;case 38:if (event.ctrlKey ||event.metaKey) $.datepicker_old._adjustDate(event.target,-7,'D');handled =event.ctrlKey ||event.metaKey;break;case 39:if (event.ctrlKey ||event.metaKey) $.datepicker_old._adjustDate(event.target,(isRTL ?-1 :+1),'D');handled =event.ctrlKey ||event.metaKey;if (event.originalEvent.altKey) $.datepicker_old._adjustDate(event.target,(event.ctrlKey ?+$.datepicker_old._get(inst,'stepBigMonths') :+$.datepicker_old._get(inst,'stepMonths')),'M');break;case 40:if (event.ctrlKey ||event.metaKey) $.datepicker_old._adjustDate(event.target,+7,'D');handled =event.ctrlKey ||event.metaKey;break;default:handled =false;}
 else if (event.keyCode ==36 &&event.ctrlKey) $.datepicker_old._showDatepicker(this);else {handled =false;}
 if (handled) {event.preventDefault();event.stopPropagation();}
 },_doKeyPress:function(event) {var inst =$.datepicker_old._getInst(event.target);if ($.datepicker_old._get(inst,'constrainInput')) {var chars =$.datepicker_old._possibleChars($.datepicker_old._get(inst,'dateFormat'));var chr =String.fromCharCode(event.charCode ==undefined ?event.keyCode :event.charCode);return event.ctrlKey ||event.metaKey ||(chr < ' '||!chars ||chars.indexOf(chr) > -1);}
 },_doKeyUp:function(event) {var inst =$.datepicker_old._getInst(event.target);if (inst.input.val() !=inst.lastVal) {try {var date =$.datepicker_old.parseDate($.datepicker_old._get(inst,'dateFormat'),(inst.input ?inst.input.val() :null),$.datepicker_old._getFormatConfig(inst));if (date) {$.datepicker_old._setDateFromField(inst);$.datepicker_old._updateAlternate(inst);$.datepicker_old._updateDatepicker(inst);}
 }
 catch (event) {$.datepicker_old.log(event);}
 }
 return true;},_showDatepicker:function(input) {input =input.target ||input;if (input.nodeName.toLowerCase() !='input') input =$('input',input.parentNode)[0];if ($.datepicker_old._isDisabledDatepicker(input) ||$.datepicker_old._lastInput ==input) return;var inst =$.datepicker_old._getInst(input);if ($.datepicker_old._curInst &&$.datepicker_old._curInst !=inst) {if ($.datepicker_old._datepickerShowing ) {$.datepicker_old._triggerOnClose($.datepicker_old._curInst);}
 $.datepicker_old._curInst.dpDiv.stop(true,true);}
 var beforeShow =$.datepicker_old._get(inst,'beforeShow');var beforeShowSettings =beforeShow ?beforeShow.apply(input,[input,inst]) :{};if(beforeShowSettings ===false){return;}
 extendRemove(inst.settings,beforeShowSettings);inst.lastVal =null;$.datepicker_old._lastInput =input;$.datepicker_old._setDateFromField(inst);if ($.datepicker_old._inDialog) input.value ='';if (!$.datepicker_old._pos) {$.datepicker_old._pos =$.datepicker_old._findPos(input);$.datepicker_old._pos[1] +=input.offsetHeight;}
 var isFixed =false;$(input).parents().each(function() {isFixed |=$(this).css('position') =='fixed';return !isFixed;});if (isFixed &&$.browser.opera) {$.datepicker_old._pos[0] -=document.documentElement.scrollLeft;$.datepicker_old._pos[1] -=document.documentElement.scrollTop;}
 var offset ={left:$.datepicker_old._pos[0],top:$.datepicker_old._pos[1]};$.datepicker_old._pos =null;inst.dpDiv.empty();inst.dpDiv.css({position:'absolute',display:'block',top:'-1000px'});$.datepicker_old._updateDatepicker(inst);offset =$.datepicker_old._checkOffset(inst,offset,isFixed);inst.dpDiv.css({position:($.datepicker_old._inDialog &&$.blockUI ?'static':(isFixed ?'fixed':'absolute')),display:'none',left:offset.left + 'px',top:offset.top + 'px'});if (!inst.inline) {var showAnim =$.datepicker_old._get(inst,'showAnim');var duration =$.datepicker_old._get(inst,'duration');var postProcess =function() {var cover =inst.dpDiv.find('iframe.ui-datepicker-cover');if(!!cover.length ){var borders =$.datepicker_old._getBorders(inst.dpDiv);cover.css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()});}
 };inst.dpDiv.zIndex($(input).zIndex()+1);$.datepicker_old._datepickerShowing =true;if ($.effects &&$.effects[showAnim])
 inst.dpDiv.show(showAnim,$.datepicker_old._get(inst,'showOptions'),duration,postProcess);else
 inst.dpDiv[showAnim ||'show']((showAnim ?duration :null),postProcess);if (!showAnim ||!duration)
 postProcess();if (inst.input.is(':visible') &&!inst.input.is(':disabled'))
 inst.input.focus();$.datepicker_old._curInst =inst;}
 },_updateDatepicker:function(inst) {var self =this;self.maxRows =4;var borders =$.datepicker_old._getBorders(inst.dpDiv);instActive =inst;inst.dpDiv.empty().append(this._generateHTML(inst));var cover =inst.dpDiv.find('iframe.ui-datepicker-cover');if(!!cover.length ){cover.css({left:-borders[0],top:-borders[1],width:inst.dpDiv.outerWidth(),height:inst.dpDiv.outerHeight()})
 }
 inst.dpDiv.find('.'+ this._dayOverClass + ' a').mouseover();var numMonths =this._getNumberOfMonths(inst);var cols =numMonths[1];var width =17;inst.dpDiv.removeClass('ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4').width('');if (cols > 1)
 inst.dpDiv.addClass('ui-datepicker-multi-'+ cols).css('width',(width * cols) + 'em');inst.dpDiv[(numMonths[0] !=1 ||numMonths[1] !=1 ?'add':'remove') +
 'Class']('ui-datepicker-multi');inst.dpDiv[(this._get(inst,'isRTL') ?'add':'remove') +
 'Class']('ui-datepicker-rtl');if (inst ==$.datepicker_old._curInst &&$.datepicker_old._datepickerShowing &&inst.input &&inst.input.is(':visible') &&!inst.input.is(':disabled') &&inst.input[0] !=document.activeElement)
 inst.input.focus();if(inst.yearshtml ){var origyearshtml =inst.yearshtml;setTimeout(function(){if(origyearshtml ===inst.yearshtml &&inst.yearshtml ){inst.dpDiv.find('select.ui-datepicker-year:first').replaceWith(inst.yearshtml);}
 origyearshtml =inst.yearshtml =null;},0);}
 },_getBorders:function(elem) {var convert =function(value) {return {thin:1,medium:2,thick:3}[value] ||value;};return [parseFloat(convert(elem.css('border-left-width'))),parseFloat(convert(elem.css('border-top-width')))];},_checkOffset:function(inst,offset,isFixed) {var dpWidth =inst.dpDiv.outerWidth();var dpHeight =inst.dpDiv.outerHeight();var inputWidth =inst.input ?inst.input.outerWidth() :0;var inputHeight =inst.input ?inst.input.outerHeight() :0;var viewWidth =document.documentElement.clientWidth + $(document).scrollLeft();var viewHeight =document.documentElement.clientHeight + $(document).scrollTop();offset.left -=(this._get(inst,'isRTL') ?(dpWidth - inputWidth) :0);offset.left -=(isFixed &&offset.left ==inst.input.offset().left) ?$(document).scrollLeft() :0;offset.top -=(isFixed &&offset.top ==(inst.input.offset().top + inputHeight)) ?$(document).scrollTop() :0;offset.left -=Math.min(offset.left,(offset.left + dpWidth > viewWidth &&viewWidth > dpWidth) ?Math.abs(offset.left + dpWidth - viewWidth) :0);offset.top -=Math.min(offset.top,(offset.top + dpHeight > viewHeight &&viewHeight > dpHeight) ?Math.abs(dpHeight + inputHeight) :0);return offset;},_findPos:function(obj) {var inst =this._getInst(obj);var isRTL =this._get(inst,'isRTL');while (obj &&(obj.type =='hidden'||obj.nodeType !=1 ||$.expr.filters.hidden(obj))) {obj =obj[isRTL ?'previousSibling':'nextSibling'];}
 var position =$(obj).offset();return [position.left,position.top];},_triggerOnClose:function(inst) {var onClose =this._get(inst,'onClose');if (onClose)
 onClose.apply((inst.input ?inst.input[0] :null),[(inst.input ?inst.input.val() :''),inst]);},_hideDatepicker:function(input) {var inst =this._curInst;if (!inst ||(input &&inst !=$.data(input,PROP_NAME)))
 return;if (this._datepickerShowing) {var showAnim =this._get(inst,'showAnim');var duration =this._get(inst,'duration');var postProcess =function() {$.datepicker_old._tidyDialog(inst);this._curInst =null;};if ($.effects &&$.effects[showAnim])
 inst.dpDiv.hide(showAnim,$.datepicker_old._get(inst,'showOptions'),duration,postProcess);else
 inst.dpDiv[(showAnim =='slideDown'?'slideUp':(showAnim =='fadeIn'?'fadeOut':'hide'))]((showAnim ?duration :null),postProcess);if (!showAnim)
 postProcess();$.datepicker_old._triggerOnClose(inst);this._datepickerShowing =false;this._lastInput =null;if (this._inDialog) {this._dialogInput.css({position:'absolute',left:'0',top:'-100px'});if ($.blockUI) {$.unblockUI();$('body').append(this.dpDiv);}
 }
 this._inDialog =false;}
 },_tidyDialog:function(inst) {inst.dpDiv.removeClass(this._dialogClass).unbind('.ui-datepicker-calendar');},_checkExternalClick:function(event) {if (!$.datepicker_old._curInst)
 return;var $target =$(event.target);if ($target[0].id !=$.datepicker_old._mainDivId &&$target.parents('#'+ $.datepicker_old._mainDivId).length ==0 &&!$target.hasClass($.datepicker_old.markerClassName) &&!$target.hasClass($.datepicker_old._triggerClass) &&$.datepicker_old._datepickerShowing &&!($.datepicker_old._inDialog &&$.blockUI))
 $.datepicker_old._hideDatepicker();},_adjustDate:function(id,offset,period) {var target =$(id);var inst =this._getInst(target[0]);if (this._isDisabledDatepicker(target[0])) {return;}
 this._adjustInstDate(inst,offset +
 (period =='M'?this._get(inst,'showCurrentAtPos') :0),period);this._updateDatepicker(inst);},_gotoToday:function(id) {var target =$(id);var inst =this._getInst(target[0]);if (this._get(inst,'gotoCurrent') &&inst.currentDay) {inst.selectedDay =inst.currentDay;inst.drawMonth =inst.selectedMonth =inst.currentMonth;inst.drawYear =inst.selectedYear =inst.currentYear;}
 else {var date =new Date();inst.selectedDay =date.getDate();inst.drawMonth =inst.selectedMonth =date.getMonth();inst.drawYear =inst.selectedYear =date.getFullYear();}
 this._notifyChange(inst);this._adjustDate(target);},_selectMonthYear:function(id,select,period) {var target =$(id);var inst =this._getInst(target[0]);inst['selected'+ (period =='M'?'Month':'Year')] =inst['draw'+ (period =='M'?'Month':'Year')] =parseInt(select.options[select.selectedIndex].value,10);this._notifyChange(inst);this._adjustDate(target);},_selectDay:function(id,month,year,td) {var target =$(id);if ($(td).hasClass(this._unselectableClass) ||this._isDisabledDatepicker(target[0])) {return;}
 var inst =this._getInst(target[0]);inst.selectedDay =inst.currentDay =$('a',td).html();inst.selectedMonth =inst.currentMonth =month;inst.selectedYear =inst.currentYear =year;this._selectDate(id,this._formatDate(inst,inst.currentDay,inst.currentMonth,inst.currentYear));},_clearDate:function(id) {var target =$(id);var inst =this._getInst(target[0]);this._selectDate(target,'');},_selectDate:function(id,dateStr) {var target =$(id);var inst =this._getInst(target[0]);dateStr =(dateStr !=null ?dateStr :this._formatDate(inst));if (inst.input)
 inst.input.val(dateStr);this._updateAlternate(inst);var onSelect =this._get(inst,'onSelect');if (onSelect)
 onSelect.apply((inst.input ?inst.input[0] :null),[dateStr,inst]);else if (inst.input)
 inst.input.trigger('change');if (inst.inline)
 this._updateDatepicker(inst);else {this._hideDatepicker();this._lastInput =inst.input[0];if (typeof(inst.input[0]) !='object')
 inst.input.focus();this._lastInput =null;}
 },_updateAlternate:function(inst) {var altField =this._get(inst,'altField');if (altField) {var altFormat =this._get(inst,'altFormat') ||this._get(inst,'dateFormat');var date =this._getDate(inst);var dateStr =this.formatDate(altFormat,date,this._getFormatConfig(inst));$(altField).each(function() {$(this).val(dateStr);});}
 },noWeekends:function(date) {var day =date.getDay();return [(day > 0 &&day < 6),''];},iso8601Week:function(date) {var checkDate =new Date(date.getTime());checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() ||7));var time =checkDate.getTime();checkDate.setMonth(0);checkDate.setDate(1);return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;},parseDate:function (format,value,settings) {if (format ==null ||value ==null)
 throw 'Invalid arguments';value =(typeof value =='object'?value.toString() :value + '');if (value =='')
 return null;var shortYearCutoff =(settings ?settings.shortYearCutoff :null) ||this._defaults.shortYearCutoff;shortYearCutoff =(typeof shortYearCutoff !='string'?shortYearCutoff :new Date().getFullYear() % 100 + parseInt(shortYearCutoff,10));var dayNamesShort =(settings ?settings.dayNamesShort :null) ||this._defaults.dayNamesShort;var dayNames =(settings ?settings.dayNames :null) ||this._defaults.dayNames;var monthNamesShort =(settings ?settings.monthNamesShort :null) ||this._defaults.monthNamesShort;var monthNames =(settings ?settings.monthNames :null) ||this._defaults.monthNames;var year =-1;var month =-1;var day =-1;var doy =-1;var literal =false;var lookAhead =function(match) {var matches =(iFormat + 1 < format.length &&format.charAt(iFormat + 1) ==match);if (matches)
 iFormat++;return matches;};var getNumber =function(match) {var isDoubled =lookAhead(match);var size =(match =='@'?14 :(match =='!'?20 :(match =='y'&&isDoubled ?4 :(match =='o'?3 :2))));var digits =new RegExp('^\\d{1,'+ size + '}');var num =value.substring(iValue).match(digits);if (!num)
 throw 'Missing number at position '+ iValue;iValue +=num[0].length;return parseInt(num[0],10);};var getName =function(match,shortNames,longNames) {var names =$.map(lookAhead(match) ?longNames :shortNames,function (v,k) {return [[k,v] ];}).sort(function (a,b) {return -(a[1].length - b[1].length);});var index =-1;$.each(names,function (i,pair) {var name =pair[1];if (value.substr(iValue,name.length).toLowerCase() ==name.toLowerCase()) {index =pair[0];iValue +=name.length;return false;}
 });if (index !=-1)
 return index + 1;else
 throw 'Unknown name at position '+ iValue;};var checkLiteral =function() {if (value.charAt(iValue) !=format.charAt(iFormat))
 throw 'Unexpected literal at position '+ iValue;iValue++;};var iValue =0;for (var iFormat =0;iFormat < format.length;iFormat++) {if (literal)
 if (format.charAt(iFormat) =="'"&&!lookAhead("'"))
 literal =false;else
 checkLiteral();else
 switch (format.charAt(iFormat)) {case 'd':day =getNumber('d');break;case 'D':getName('D',dayNamesShort,dayNames);break;case 'o':doy =getNumber('o');break;case 'm':month =getNumber('m');break;case 'M':month =getName('M',monthNamesShort,monthNames);break;case 'y':year =getNumber('y');break;case '@':var date =new Date(getNumber('@'));year =date.getFullYear();month =date.getMonth() + 1;day =date.getDate();break;case '!':var date =new Date((getNumber('!') - this._ticksTo1970) / 10000);year =date.getFullYear();month =date.getMonth() + 1;day =date.getDate();break;case "'":if (lookAhead("'"))
 checkLiteral();else
 literal =true;break;default:checkLiteral();}
 }
 if (iValue < value.length){throw "Extra/unparsed characters found in date: "+ value.substring(iValue);}
 if (year ==-1)
 year =new Date().getFullYear();else if (year < 100)
 year +=new Date().getFullYear() - new Date().getFullYear() % 100 +
 (year <=shortYearCutoff ?0 :-100);if (doy > -1) {month =1;day =doy;do {var dim =this._getDaysInMonth(year,month - 1);if (day <=dim)
 break;month++;day -=dim;} while (true);}
 var date =this._daylightSavingAdjust(new Date(year,month - 1,day));if (date.getFullYear() !=year ||date.getMonth() + 1 !=month ||date.getDate() !=day)
 throw 'Invalid date';return date;},ATOM:'yy-mm-dd',COOKIE:'D, dd M yy',ISO_8601:'yy-mm-dd',RFC_822:'D, d M y',RFC_850:'DD, dd-M-y',RFC_1036:'D, d M y',RFC_1123:'D, d M yy',RFC_2822:'D, d M yy',RSS:'D, d M y',TICKS:'!',TIMESTAMP:'@',W3C:'yy-mm-dd',_ticksTo1970:(((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
 Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),formatDate:function (format,date,settings) {if (!date)
 return '';var dayNamesShort =(settings ?settings.dayNamesShort :null) ||this._defaults.dayNamesShort;var dayNames =(settings ?settings.dayNames :null) ||this._defaults.dayNames;var monthNamesShort =(settings ?settings.monthNamesShort :null) ||this._defaults.monthNamesShort;var monthNames =(settings ?settings.monthNames :null) ||this._defaults.monthNames;var lookAhead =function(match) {var matches =(iFormat + 1 < format.length &&format.charAt(iFormat + 1) ==match);if (matches)
 iFormat++;return matches;};var formatNumber =function(match,value,len) {var num =''+ value;if (lookAhead(match))
 while (num.length < len)
 num ='0'+ num;return num;};var formatName =function(match,value,shortNames,longNames) {return (lookAhead(match) ?longNames[value] :shortNames[value]);};var output ='';var literal =false;if (date)
 for (var iFormat =0;iFormat < format.length;iFormat++) {if (literal)
 if (format.charAt(iFormat) =="'"&&!lookAhead("'"))
 literal =false;else
 output +=format.charAt(iFormat);else
 switch (format.charAt(iFormat)) {case 'd':output +=formatNumber('d',date.getDate(),2);break;case 'D':output +=formatName('D',date.getDay(),dayNamesShort,dayNames);break;case 'o':output +=formatNumber('o',Math.round((new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime() - new Date(date.getFullYear(),0,0).getTime()) / 86400000),3);break;case 'm':output +=formatNumber('m',date.getMonth() + 1,2);break;case 'M':output +=formatName('M',date.getMonth(),monthNamesShort,monthNames);break;case 'y':output +=(lookAhead('y') ?date.getFullYear() :(date.getYear() % 100 < 10 ?'0':'') + date.getYear() % 100);break;case '@':output +=date.getTime();break;case '!':output +=date.getTime() * 10000 + this._ticksTo1970;break;case "'":if (lookAhead("'"))
 output +="'";else
 literal =true;break;default:output +=format.charAt(iFormat);}
 }
 return output;},_possibleChars:function (format) {var chars ='';var literal =false;var lookAhead =function(match) {var matches =(iFormat + 1 < format.length &&format.charAt(iFormat + 1) ==match);if (matches)
 iFormat++;return matches;};for (var iFormat =0;iFormat < format.length;iFormat++)
 if (literal)
 if (format.charAt(iFormat) =="'"&&!lookAhead("'"))
 literal =false;else
 chars +=format.charAt(iFormat);else
 switch (format.charAt(iFormat)) {case 'd':case 'm':case 'y':case '@':chars +='0123456789';break;case 'D':case 'M':return null;case "'":if (lookAhead("'"))
 chars +="'";else
 literal =true;break;default:chars +=format.charAt(iFormat);}
 return chars;},_get:function(inst,name) {return inst.settings[name] !==undefined ?inst.settings[name] :this._defaults[name];},_setDateFromField:function(inst,noDefault) {if (inst.input.val() ==inst.lastVal) {return;}
 var dateFormat =this._get(inst,'dateFormat');var dates =inst.lastVal =inst.input ?inst.input.val() :null;var date,defaultDate;date =defaultDate =this._getDefaultDate(inst);var settings =this._getFormatConfig(inst);try {date =this.parseDate(dateFormat,dates,settings) ||defaultDate;} catch (event) {this.log(event);dates =(noDefault ?'':dates);}
 inst.selectedDay =date.getDate();inst.drawMonth =inst.selectedMonth =date.getMonth();inst.drawYear =inst.selectedYear =date.getFullYear();inst.currentDay =(dates ?date.getDate() :0);inst.currentMonth =(dates ?date.getMonth() :0);inst.currentYear =(dates ?date.getFullYear() :0);this._adjustInstDate(inst);},_getDefaultDate:function(inst) {return this._restrictMinMax(inst,this._determineDate(inst,this._get(inst,'defaultDate'),new Date()));},_determineDate:function(inst,date,defaultDate) {var offsetNumeric =function(offset) {var date =new Date();date.setDate(date.getDate() + offset);return date;};var offsetString =function(offset) {try {return $.datepicker_old.parseDate($.datepicker_old._get(inst,'dateFormat'),offset,$.datepicker_old._getFormatConfig(inst));}
 catch (e) {}
 var date =(offset.toLowerCase().match(/^c/) ?
 $.datepicker_old._getDate(inst) :null) ||new Date();var year =date.getFullYear();var month =date.getMonth();var day =date.getDate();var pattern =/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;
 var matches =pattern.exec(offset);while (matches) {switch (matches[2] ||'d') {case 'd':case 'D':day +=parseInt(matches[1],10);break;case 'w':case 'W':day +=parseInt(matches[1],10) * 7;break;case 'm':case 'M':month +=parseInt(matches[1],10);day =Math.min(day,$.datepicker_old._getDaysInMonth(year,month));break;case 'y':case 'Y':year +=parseInt(matches[1],10);day =Math.min(day,$.datepicker_old._getDaysInMonth(year,month));break;}
 matches =pattern.exec(offset);}
 return new Date(year,month,day);};var newDate =(date ==null ||date ===''?defaultDate :(typeof date =='string'?offsetString(date) :(typeof date =='number'?(isNaN(date) ?defaultDate :offsetNumeric(date)) :new Date(date.getTime()))));newDate =(newDate &&newDate.toString() =='Invalid Date'?defaultDate :newDate);if (newDate) {newDate.setHours(0);newDate.setMinutes(0);newDate.setSeconds(0);newDate.setMilliseconds(0);}
 return this._daylightSavingAdjust(newDate);},_daylightSavingAdjust:function(date) {if (!date) return null;date.setHours(date.getHours() > 12 ?date.getHours() + 2 :0);return date;},_setDate:function(inst,date,noChange) {var clear =!date;var origMonth =inst.selectedMonth;var origYear =inst.selectedYear;var newDate =this._restrictMinMax(inst,this._determineDate(inst,date,new Date()));inst.selectedDay =inst.currentDay =newDate.getDate();inst.drawMonth =inst.selectedMonth =inst.currentMonth =newDate.getMonth();inst.drawYear =inst.selectedYear =inst.currentYear =newDate.getFullYear();if ((origMonth !=inst.selectedMonth ||origYear !=inst.selectedYear) &&!noChange)
 this._notifyChange(inst);this._adjustInstDate(inst);if (inst.input) {inst.input.val(clear ?'':this._formatDate(inst));}
 },_getDate:function(inst) {var startDate =(!inst.currentYear ||(inst.input &&inst.input.val() =='') ?null :this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return startDate;},_generateHTML:function(inst) {var today =new Date();today =this._daylightSavingAdjust(new Date(today.getFullYear(),today.getMonth(),today.getDate()));var isRTL =this._get(inst,'isRTL');var showButtonPanel =this._get(inst,'showButtonPanel');var hideIfNoPrevNext =this._get(inst,'hideIfNoPrevNext');var navigationAsDateFormat =this._get(inst,'navigationAsDateFormat');var numMonths =this._getNumberOfMonths(inst);var showCurrentAtPos =this._get(inst,'showCurrentAtPos');var stepMonths =this._get(inst,'stepMonths');var isMultiMonth =(numMonths[0] !=1 ||numMonths[1] !=1);var currentDate =this._daylightSavingAdjust((!inst.currentDay ?new Date(9999,9,9) :new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));var minDate =this._getMinMaxDate(inst,'min');var maxDate =this._getMinMaxDate(inst,'max');var drawMonth =inst.drawMonth - showCurrentAtPos;var drawYear =inst.drawYear;if (drawMonth < 0) {drawMonth +=12;drawYear--;}
 if (maxDate) {var maxDraw =this._daylightSavingAdjust(new Date(maxDate.getFullYear(),maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1,maxDate.getDate()));maxDraw =(minDate &&maxDraw < minDate ?minDate :maxDraw);while (this._daylightSavingAdjust(new Date(drawYear,drawMonth,1)) > maxDraw) {drawMonth--;if (drawMonth < 0) {drawMonth =11;drawYear--;}
 }
 }
 inst.drawMonth =drawMonth;inst.drawYear =drawYear;var prevText =this._get(inst,'prevText');prevText =(!navigationAsDateFormat ?prevText :this.formatDate(prevText,this._daylightSavingAdjust(new Date(drawYear,drawMonth - stepMonths,1)),this._getFormatConfig(inst)));var prev =(this._canAdjustMonth(inst,-1,drawYear,drawMonth) ?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+ dpuuid +
 '.datepicker_old._adjustDate(\'#' + inst.id + '\', -'+ stepMonths + ', \'M\');"'+
 ' title="'+ prevText + '"><span class="ui-icon ui-icon-circle-triangle-'+ (isRTL ?'e':'w') + '">'+ prevText + '</span></a>':(hideIfNoPrevNext ?'':'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+ prevText +'"><span class="ui-icon ui-icon-circle-triangle-'+ (isRTL ?'e':'w') + '">'+ prevText + '</span></a>'));var nextText =this._get(inst,'nextText');nextText =(!navigationAsDateFormat ?nextText :this.formatDate(nextText,this._daylightSavingAdjust(new Date(drawYear,drawMonth + stepMonths,1)),this._getFormatConfig(inst)));var next =(this._canAdjustMonth(inst,+1,drawYear,drawMonth) ?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+ dpuuid +
 '.datepicker_old._adjustDate(\'#' + inst.id + '\', +'+ stepMonths + ', \'M\');"'+
 ' title="'+ nextText + '"><span class="ui-icon ui-icon-circle-triangle-'+ (isRTL ?'w':'e') + '">'+ nextText + '</span></a>':(hideIfNoPrevNext ?'':'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+ nextText + '"><span class="ui-icon ui-icon-circle-triangle-'+ (isRTL ?'w':'e') + '">'+ nextText + '</span></a>'));var currentText =this._get(inst,'currentText');var gotoDate =(this._get(inst,'gotoCurrent') &&inst.currentDay ?currentDate :today);currentText =(!navigationAsDateFormat ?currentText :this.formatDate(currentText,gotoDate,this._getFormatConfig(inst)));var controls =(!inst.inline ?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+ dpuuid +
 '.datepicker_old._hideDatepicker();">'+ this._get(inst,'closeText') + '</button>':'');var buttonPanel =(showButtonPanel) ?'<div class="ui-datepicker-buttonpane ui-widget-content">'+ (isRTL ?controls :'') +
 (this._isInRange(inst,gotoDate) ?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+ dpuuid +
 '.datepicker_old._gotoToday(\'#' + inst.id + '\');"'+
 '>'+ currentText + '</button>':'') + (isRTL ?'':controls) + '</div>':'';var firstDay =parseInt(this._get(inst,'firstDay'),10);firstDay =(isNaN(firstDay) ?0 :firstDay);var showWeek =this._get(inst,'showWeek');var dayNames =this._get(inst,'dayNames');var dayNamesShort =this._get(inst,'dayNamesShort');var dayNamesMin =this._get(inst,'dayNamesMin');var monthNames =this._get(inst,'monthNames');var monthNamesShort =this._get(inst,'monthNamesShort');var beforeShowDay =this._get(inst,'beforeShowDay');var showOtherMonths =this._get(inst,'showOtherMonths');var selectOtherMonths =this._get(inst,'selectOtherMonths');var calculateWeek =this._get(inst,'calculateWeek') ||this.iso8601Week;var defaultDate =this._getDefaultDate(inst);var html ='';for (var row =0;row < numMonths[0];row++) {var group ='';this.maxRows =4;for (var col =0;col < numMonths[1];col++) {var selectedDate =this._daylightSavingAdjust(new Date(drawYear,drawMonth,inst.selectedDay));var cornerClass =' ui-corner-all';var calender ='';if (isMultiMonth) {calender +='<div class="ui-datepicker-group';if (numMonths[1] > 1)
 switch (col) {case 0:calender +=' ui-datepicker-group-first';cornerClass =' ui-corner-'+ (isRTL ?'right':'left');break;case numMonths[1]-1:calender +=' ui-datepicker-group-last';cornerClass =' ui-corner-'+ (isRTL ?'left':'right');break;default:calender +=' ui-datepicker-group-middle';cornerClass ='';break;}
 calender +='">';}
 calender +='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+ cornerClass + '">'+
 (/all|left/.test(cornerClass) && row == 0 ? (isRTL ? next : prev) : '') +
 (/all|right/.test(cornerClass) && row == 0 ? (isRTL ? prev : next) : '') +
 this._generateMonthYearHeader(inst,drawMonth,drawYear,minDate,maxDate,row > 0 ||col > 0,monthNames,monthNamesShort) + '</div><table class="ui-datepicker-calendar"><thead>'+
 '<tr>';var thead =(showWeek ?'<th class="ui-datepicker-week-col">'+ this._get(inst,'weekHeader') + '</th>':'');for (var dow =0;dow < 7;dow++) {var day =(dow + firstDay) % 7;thead +='<th'+ ((dow + firstDay + 6) % 7 >=5 ?' class="ui-datepicker-week-end"':'') + '>'+
 '<span title="'+ dayNames[day] + '">'+ dayNamesMin[day] + '</span></th>';}
 calender +=thead + '</tr></thead><tbody>';var daysInMonth =this._getDaysInMonth(drawYear,drawMonth);if (drawYear ==inst.selectedYear &&drawMonth ==inst.selectedMonth)
 inst.selectedDay =Math.min(inst.selectedDay,daysInMonth);var leadDays =(this._getFirstDayOfMonth(drawYear,drawMonth) - firstDay + 7) % 7;var curRows =Math.ceil((leadDays + daysInMonth) / 7);var numRows =(isMultiMonth ?this.maxRows > curRows ?this.maxRows :curRows :curRows);this.maxRows =numRows;var printDate =this._daylightSavingAdjust(new Date(drawYear,drawMonth,1 - leadDays));for (var dRow =0;dRow < numRows;dRow++) {calender +='<tr>';var tbody =(!showWeek ?'':'<td class="ui-datepicker-week-col">'+
 this._get(inst,'calculateWeek')(printDate) + '</td>');for (var dow =0;dow < 7;dow++) {var daySettings =(beforeShowDay ?beforeShowDay.apply((inst.input ?inst.input[0] :null),[printDate]) :[true,'']);var otherMonth =(printDate.getMonth() !=drawMonth);var unselectable =(otherMonth &&!selectOtherMonths) ||!daySettings[0] ||(minDate &&printDate < minDate) ||(maxDate &&printDate > maxDate);tbody +='<td class="'+
 ((dow + firstDay + 6) % 7 >=5 ?' ui-datepicker-week-end':'') + (otherMonth ?' ui-datepicker-other-month':'') + ((printDate.getTime() ==selectedDate.getTime() &&drawMonth ==inst.selectedMonth &&inst._keyEvent) ||(defaultDate.getTime() ==printDate.getTime() &&defaultDate.getTime() ==selectedDate.getTime()) ?' '+ this._dayOverClass :'') + (unselectable ?' '+ this._unselectableClass + ' ui-state-disabled':'') + (otherMonth &&!showOtherMonths ?'':' '+ daySettings[1] + (printDate.getTime() ==currentDate.getTime() ?' '+ this._currentClass :'') + (printDate.getTime() ==today.getTime() ?' ui-datepicker-today':'')) + '"'+ ((!otherMonth ||showOtherMonths) &&daySettings[2] ?' title="'+ daySettings[2] + '"':'') + (unselectable ?'':' onclick="DP_jQuery_'+ dpuuid + '.datepicker_old._selectDay(\'#' +
                                    inst.id + '\','+ printDate.getMonth() + ','+ printDate.getFullYear() + ', this);return false;"') + '>'+ (otherMonth &&!showOtherMonths ?'&#xa0;':(unselectable ?'<span class="ui-state-default">'+ printDate.getDate() + '</span>':'<a class="ui-state-default'+
 (printDate.getTime() ==today.getTime() ?' ui-state-highlight':'') +
 (printDate.getTime() ==currentDate.getTime() ?' ui-state-active':'') + (otherMonth ?' ui-priority-secondary':'') + '" href="#">'+ printDate.getDate() + '</a>')) + '</td>';printDate.setDate(printDate.getDate() + 1);printDate =this._daylightSavingAdjust(printDate);}
 calender +=tbody + '</tr>';}
 drawMonth++;if (drawMonth > 11) {drawMonth =0;drawYear++;}
 calender +='</tbody></table>'+ (isMultiMonth ?'</div>'+
 ((numMonths[0] > 0 &&col ==numMonths[1]-1) ?'<div class="ui-datepicker-row-break"></div>':'') :'');group +=calender;}
 html +=group;}
 html +=buttonPanel + ($.browser.msie &&parseInt($.browser.version,10) < 7 &&!inst.inline ?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':'');inst._keyEvent =false;return html;},_generateMonthYearHeader:function(inst,drawMonth,drawYear,minDate,maxDate,secondary,monthNames,monthNamesShort) {var changeMonth =this._get(inst,'changeMonth');var changeYear =this._get(inst,'changeYear');var showMonthAfterYear =this._get(inst,'showMonthAfterYear');var html ='<div class="ui-datepicker-title">';var monthHtml ='';if (secondary ||!changeMonth)
 monthHtml +='<span class="ui-datepicker-month">'+ monthNames[drawMonth] + '</span>';else {var inMinYear =(minDate &&minDate.getFullYear() ==drawYear);var inMaxYear =(maxDate &&maxDate.getFullYear() ==drawYear);monthHtml +='<select class="ui-datepicker-month" '+
 'onchange="DP_jQuery_'+ dpuuid + '.datepicker_old._selectMonthYear(\'#' + inst.id + '\', this, \'M\');" '+
 '>';for (var month =0;month < 12;month++) {if ((!inMinYear ||month >=minDate.getMonth()) &&(!inMaxYear ||month <=maxDate.getMonth()))
 monthHtml +='<option value="'+ month + '"'+
 (month ==drawMonth ?' selected="selected"':'') +
 '>'+ monthNamesShort[month] + '</option>';}
 monthHtml +='</select>';}
 if (!showMonthAfterYear)
 html +=monthHtml + (secondary ||!(changeMonth &&changeYear) ?'&#xa0;':'');if (!inst.yearshtml ) {inst.yearshtml ='';if (secondary ||!changeYear)
 html +='<span class="ui-datepicker-year">'+ drawYear + '</span>';else {var years =this._get(inst,'yearRange').split(':');var thisYear =new Date().getFullYear();var determineYear =function(value) {var year =(value.match(/c[+-].*/) ? drawYear + parseInt(value.substring(1), 10) :
 (value.match(/[+-].*/) ? thisYear + parseInt(value, 10) :
 parseInt(value,10)));return (isNaN(year) ?thisYear :year);};var year =determineYear(years[0]);var endYear =Math.max(year,determineYear(years[1] ||''));year =(minDate ?Math.max(year,minDate.getFullYear()) :year);endYear =(maxDate ?Math.min(endYear,maxDate.getFullYear()) :endYear);inst.yearshtml +='<select class="ui-datepicker-year" '+
 'onchange="DP_jQuery_'+ dpuuid + '.datepicker_old._selectMonthYear(\'#' + inst.id + '\', this, \'Y\');" '+
 '>';for (;year <=endYear;year++) {inst.yearshtml +='<option value="'+ year + '"'+
 (year ==drawYear ?' selected="selected"':'') +
 '>'+ year + '</option>';}
 inst.yearshtml +='</select>';html +=inst.yearshtml;inst.yearshtml =null;}
 }
 html +=this._get(inst,'yearSuffix');if (showMonthAfterYear)
 html +=(secondary ||!(changeMonth &&changeYear) ?'&#xa0;':'') + monthHtml;html +='</div>';return html;},_adjustInstDate:function(inst,offset,period) {var year =inst.drawYear + (period =='Y'?offset :0);var month =inst.drawMonth + (period =='M'?offset :0);var day =Math.min(inst.selectedDay,this._getDaysInMonth(year,month)) +
 (period =='D'?offset :0);var date =this._restrictMinMax(inst,this._daylightSavingAdjust(new Date(year,month,day)));inst.selectedDay =date.getDate();inst.drawMonth =inst.selectedMonth =date.getMonth();inst.drawYear =inst.selectedYear =date.getFullYear();if (period =='M'||period =='Y')
 this._notifyChange(inst);},_restrictMinMax:function(inst,date) {var minDate =this._getMinMaxDate(inst,'min');var maxDate =this._getMinMaxDate(inst,'max');var newDate =(minDate &&date < minDate ?minDate :date);newDate =(maxDate &&newDate > maxDate ?maxDate :newDate);return newDate;},_notifyChange:function(inst) {var onChange =this._get(inst,'onChangeMonthYear');if (onChange)
 onChange.apply((inst.input ?inst.input[0] :null),[inst.selectedYear,inst.selectedMonth + 1,inst]);},_getNumberOfMonths:function(inst) {var numMonths =this._get(inst,'numberOfMonths');return (numMonths ==null ?[1,1] :(typeof numMonths =='number'?[1,numMonths] :numMonths));},_getMinMaxDate:function(inst,minMax) {return this._determineDate(inst,this._get(inst,minMax + 'Date'),null);},_getDaysInMonth:function(year,month) {return 32 - this._daylightSavingAdjust(new Date(year,month,32)).getDate();},_getFirstDayOfMonth:function(year,month) {return new Date(year,month,1).getDay();},_canAdjustMonth:function(inst,offset,curYear,curMonth) {var numMonths =this._getNumberOfMonths(inst);var date =this._daylightSavingAdjust(new Date(curYear,curMonth + (offset < 0 ?offset :numMonths[0] * numMonths[1]),1));if (offset < 0)
 date.setDate(this._getDaysInMonth(date.getFullYear(),date.getMonth()));return this._isInRange(inst,date);},_isInRange:function(inst,date) {var minDate =this._getMinMaxDate(inst,'min');var maxDate =this._getMinMaxDate(inst,'max');return ((!minDate ||date.getTime() >=minDate.getTime()) &&(!maxDate ||date.getTime() <=maxDate.getTime()));},_getFormatConfig:function(inst) {var shortYearCutoff =this._get(inst,'shortYearCutoff');shortYearCutoff =(typeof shortYearCutoff !='string'?shortYearCutoff :new Date().getFullYear() % 100 + parseInt(shortYearCutoff,10));return {shortYearCutoff:shortYearCutoff,dayNamesShort:this._get(inst,'dayNamesShort'),dayNames:this._get(inst,'dayNames'),monthNamesShort:this._get(inst,'monthNamesShort'),monthNames:this._get(inst,'monthNames')};},_formatDate:function(inst,day,month,year) {if (!day) {inst.currentDay =inst.selectedDay;inst.currentMonth =inst.selectedMonth;inst.currentYear =inst.selectedYear;}
 var date =(day ?(typeof day =='object'?day :this._daylightSavingAdjust(new Date(year,month,day))) :this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay)));return this.formatDate(this._get(inst,'dateFormat'),date,this._getFormatConfig(inst));}
 });function bindHover(dpDiv) {var selector ='button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';return dpDiv.bind('mouseout',function(event) {var elem =$(event.target ).closest(selector );if (!elem.length ) {return;}
 elem.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover");})
 .bind('mouseover',function(event) {var elem =$(event.target ).closest(selector );if ($.datepicker_old._isDisabledDatepicker(instActive.inline ?dpDiv.parent()[0] :instActive.input[0]) ||!elem.length ) {return;}
 elem.parents('.ui-datepicker-calendar').find('a').removeClass('ui-state-hover');elem.addClass('ui-state-hover');if (elem.hasClass('ui-datepicker-prev')) elem.addClass('ui-datepicker-prev-hover');if (elem.hasClass('ui-datepicker-next')) elem.addClass('ui-datepicker-next-hover');});}
 function extendRemove(target,props) {$.extend(target,props);for (var name in props)
 if (props[name] ==null ||props[name] ==undefined)
 target[name] =props[name];return target;};function isArray(a) {return (a &&(($.browser.safari &&typeof a =='object'&&a.length) ||(a.constructor &&a.constructor.toString().match(/\Array\(\)/))));
 };$.fn.datepicker_old =function(options){if (!this.length ) {return this;}
 if (!$.datepicker_old.initialized) {$(document).mousedown($.datepicker_old._checkExternalClick).
 find('body').append($.datepicker_old.dpDiv);$.datepicker_old.initialized =true;}
 var otherArgs =Array.prototype.slice.call(arguments,1);if (typeof options =='string'&&(options =='isDisabled'||options =='getDate'||options =='widget'))
 return $.datepicker_old['_'+ options + 'Datepicker'].
 apply($.datepicker_old,[this[0]].concat(otherArgs));if (options =='option'&&arguments.length ==2 &&typeof arguments[1] =='string')
 return $.datepicker_old['_'+ options + 'Datepicker'].
 apply($.datepicker_old,[this[0]].concat(otherArgs));return this.each(function() {typeof options =='string'?$.datepicker_old['_'+ options + 'Datepicker'].
 apply($.datepicker_old,[this].concat(otherArgs)) :$.datepicker_old._attachDatepicker(this,options);});};$.datepicker_old =new Datepicker();$.datepicker_old.initialized =false;$.datepicker_old.uuid =new Date().getTime();$.datepicker_old.version ="1.8.16";window['DP_jQuery_'+ dpuuid] =$;})(jQuery);"use strict";(function () {if(jQuery &&jQuery.jstree) {return;}
var is_ie6 =false,is_ie7 =false,is_ff2 =false;(function ($) {$.vakata ={};$.vakata.css ={get_css :function(rule_name,delete_flag,sheet) {rule_name =rule_name.toLowerCase();var css_rules =sheet.cssRules ||sheet.rules,j =0;do {if(css_rules.length &&j > css_rules.length + 5) {return false;}
if(css_rules[j].selectorText &&css_rules[j].selectorText.toLowerCase() ==rule_name) {if(delete_flag ===true) {if(sheet.removeRule) {sheet.removeRule(j);}
if(sheet.deleteRule) {sheet.deleteRule(j);}
return true;}
else {return css_rules[j];}
}
}
while (css_rules[++j]);return false;},add_css :function(rule_name,sheet) {if($.jstree.css.get_css(rule_name,false,sheet)) {return false;}
if(sheet.insertRule) {sheet.insertRule(rule_name + ' { }',0);} else {sheet.addRule(rule_name,null,0);}
return $.vakata.css.get_css(rule_name);},remove_css :function(rule_name,sheet) {return $.vakata.css.get_css(rule_name,true,sheet);},add_sheet :function(opts) {var tmp =false,is_new =true;if(opts.str) {if(opts.title) {tmp =$("style[id='"+ opts.title + "-stylesheet']")[0];}
if(tmp) {is_new =false;}
else {tmp =document.createElement("style");tmp.setAttribute('type',"text/css");if(opts.title) {tmp.setAttribute("id",opts.title + "-stylesheet");}
}
if(tmp.styleSheet) {if(is_new) {document.getElementsByTagName("head")[0].appendChild(tmp);tmp.styleSheet.cssText =opts.str;}
else {tmp.styleSheet.cssText =tmp.styleSheet.cssText + " "+ opts.str;}
}
else {tmp.appendChild(document.createTextNode(opts.str));document.getElementsByTagName("head")[0].appendChild(tmp);}
return tmp.sheet ||tmp.styleSheet;}
if(opts.url) {if(document.createStyleSheet) {try {tmp =document.createStyleSheet(opts.url);} catch (e) {}
}
else {tmp=document.createElement('link');tmp.rel='stylesheet';tmp.type='text/css';tmp.media="all";tmp.href=opts.url;document.getElementsByTagName("head")[0].appendChild(tmp);return tmp.styleSheet;}
}
}
};var instances =[],focused_instance =-1,plugins ={},prepared_move ={};$.fn.jstree =function (settings) {var isMethodCall =(typeof settings =='string'),args =Array.prototype.slice.call(arguments,1),returnValue =this;if(isMethodCall) {if(settings.substring(0,1) =='_') {return returnValue;}
this.each(function() {var instance =instances[$.data(this,"jstree_instance_id")],methodValue =(instance &&$.isFunction(instance[settings])) ?instance[settings].apply(instance,args) :instance;if(typeof methodValue !=="undefined"&&(settings.indexOf("is_") ===0 ||(methodValue !==true &&methodValue !==false))) {returnValue =methodValue;return false;}
});}
else {this.each(function() {var instance_id =$.data(this,"jstree_instance_id"),a =[],b =settings ?$.extend({},true,settings) :{},c =$(this),s =false,t =[];a =a.concat(args);if(c.data("jstree")) {a.push(c.data("jstree"));}
b =a.length ?$.extend.apply(null,[true,b].concat(a)) :b;if(typeof instance_id !=="undefined"&&instances[instance_id]) {instances[instance_id].destroy();}
instance_id =parseInt(instances.push({}),10) - 1;$.data(this,"jstree_instance_id",instance_id);b.plugins =$.isArray(b.plugins) ?b.plugins :$.jstree.defaults.plugins.slice();b.plugins.unshift("core");b.plugins =b.plugins.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",");

s =$.extend(true,{},$.jstree.defaults,b);s.plugins =b.plugins;$.each(plugins,function (i,val) {if($.inArray(i,s.plugins) ===-1) {s[i] =null;delete s[i];} else {t.push(i);}
});s.plugins =t;instances[instance_id] =new $.jstree._instance(instance_id,$(this).addClass("jstree jstree-"+ instance_id),s);$.each(instances[instance_id]._get_settings().plugins,function (i,val) {instances[instance_id].data[val] ={};});$.each(instances[instance_id]._get_settings().plugins,function (i,val) {if(plugins[val]) {plugins[val].__init.apply(instances[instance_id]);} });setTimeout(function() {if(instances[instance_id]) {instances[instance_id].init();} },0);});}
return returnValue;};$.jstree ={defaults :{plugins :[]
},_focused :function () {return instances[focused_instance] ||null;},_reference :function (needle) {if(instances[needle]) {return instances[needle];}
var o =$(needle);if(!o.length &&typeof needle ==="string") {o =$("#"+ needle);}
if(!o.length) {return null;}
return instances[o.closest(".jstree").data("jstree_instance_id")] ||null;},_instance :function (index,container,settings) {this.data ={core :{} };this.get_settings=function () {return $.extend(true,{},settings);};this._get_settings=function () {return settings;};this.get_index=function () {return index;};this.get_container=function () {return container;};this.get_container_ul =function () {return container.children("ul:eq(0)");};this._set_settings=function (s) {settings =$.extend(true,{},settings,s);};},_fn :{},plugin :function (pname,pdata) {pdata =$.extend({},{__init:$.noop,__destroy:$.noop,_fn:{},defaults:false
},pdata);plugins[pname] =pdata;$.jstree.defaults[pname] =pdata.defaults;$.each(pdata._fn,function (i,val) {val.plugin=pname;val.old=$.jstree._fn[i];$.jstree._fn[i] =function () {var rslt,func =val,args =Array.prototype.slice.call(arguments),evnt =new $.Event("before.jstree"),rlbk =false;if(this.data.core.locked ===true &&i !=="unlock"&&i !=="is_locked") {return;}
do {if(func &&func.plugin &&$.inArray(func.plugin,this._get_settings().plugins) !==-1) {break;}
func =func.old;} while(func);if(!func) {return;}
if(i.indexOf("_") ===0) {rslt =func.apply(this,args);}
else {rslt =this.get_container().triggerHandler(evnt,{"func":i,"inst":this,"args":args,"plugin":func.plugin });if(rslt ===false) {return;}
if(typeof rslt !=="undefined") {args =rslt;}
rslt =func.apply($.extend({},this,{__callback :function (data) {this.get_container().triggerHandler(i + '.jstree',{"inst":this,"args":args,"rslt":data,"rlbk":rlbk });},__rollback :function () {rlbk =this.get_rollback();return rlbk;},__call_old :function (replace_arguments) {return func.old.apply(this,(replace_arguments ?Array.prototype.slice.call(arguments,1) :args ) );}
}),args);}
return rslt;};$.jstree._fn[i].old =val.old;$.jstree._fn[i].plugin =pname;});},rollback :function (rb) {if(rb) {if(!$.isArray(rb)) {rb =[rb ];}
$.each(rb,function (i,val) {instances[val.i].set_rollback(val.h,val.d);});}
}
};$.jstree._fn =$.jstree._instance.prototype ={};$(function() {var u =navigator.userAgent.toLowerCase(),v =(u.match(/.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],

css_string =''+ '.jstree ul, .jstree li { display:block; margin:0 0 0 0; padding:0 0 0 0; list-style-type:none; } '+ '.jstree li { display:block; min-height:18px; line-height:18px; white-space:nowrap; margin-left:18px; min-width:18px; } '+ '.jstree-rtl li { margin-left:0; margin-right:18px; } '+ '.jstree > ul > li { margin-left:0px; } '+ '.jstree-rtl > ul > li { margin-right:0px; } '+ '.jstree ins { display:inline-block; text-decoration:none; width:18px; height:18px; margin:0 0 0 0; padding:0; } '+ '.jstree a { display:inline-block; line-height:16px; height:16px; color:black; white-space:nowrap; text-decoration:none; padding:1px 2px; margin:0; } '+ '.jstree a:focus { outline: none; } '+ '.jstree a > ins { height:16px; width:16px; } '+ '.jstree a > .jstree-icon { margin-right:3px; } '+ '.jstree-rtl a > .jstree-icon { margin-left:3px; margin-right:0; } '+ 'li.jstree-open > ul { display:block; } '+ 'li.jstree-closed > ul { display:none; } ';if(/msie/.test(u) && parseInt(v, 10) == 6) { 

is_ie6 =true;try {document.execCommand("BackgroundImageCache",false,true);} catch (err) {}
css_string +=''+ '.jstree li { height:18px; margin-left:0; margin-right:0; } '+ '.jstree li li { margin-left:18px; } '+ '.jstree-rtl li li { margin-left:0px; margin-right:18px; } '+ 'li.jstree-open ul { display:block; } '+ 'li.jstree-closed ul { display:none !important; } '+ '.jstree li a { display:inline; border-width:0 !important; padding:0px 2px !important; } '+ '.jstree li a ins { height:16px; width:16px; margin-right:3px; } '+ '.jstree-rtl li a ins { margin-right:0px; margin-left:3px; } ';}
if(/msie/.test(u) && parseInt(v, 10) == 7) { 

is_ie7 =true;css_string +='.jstree li a { border-width:0 !important; padding:0px 2px !important; } ';}
if(!/compatible/.test(u) && /mozilla/.test(u) && parseFloat(v, 10) < 1.9) {

is_ff2 =true;css_string +=''+ '.jstree ins { display:-moz-inline-box; } '+ '.jstree li { line-height:12px; } '+ '.jstree a { display:-moz-inline-box; } '+ '.jstree .jstree-no-icons .jstree-checkbox { display:-moz-inline-stack !important; } ';}
$.vakata.css.add_sheet({str :css_string,title :"jstree"});});$.jstree.plugin("core",{__init :function () {this.data.core.locked =false;this.data.core.to_open =this.get_settings().core.initially_open;this.data.core.to_load =this.get_settings().core.initially_load;},defaults :{html_titles:false,animation:500,initially_open :[],initially_load :[],open_parents :true,notify_plugins :true,rtl:false,load_open:false,strings:{loading:"Loading ...",new_node:"New node",multiple_selection :"Multiple selection"}
},_fn :{init:function () {this.set_focus();if(this._get_settings().core.rtl) {this.get_container().addClass("jstree-rtl").css("direction","rtl");}
this.get_container().html("<ul><li class='jstree-last jstree-leaf'><ins>&#160;</ins><a class='jstree-loading' href='#'><ins class='jstree-icon'>&#160;</ins>"+ this._get_string("loading") + "</a></li></ul>");this.data.core.li_height =this.get_container_ul().find("li.jstree-closed, li.jstree-leaf").eq(0).height() ||18;this.get_container()
.delegate("li > ins","click.jstree",$.proxy(function (event) {var trgt =$(event.target);this.toggle_node(trgt);},this))
.bind("mousedown.jstree",$.proxy(function () {this.set_focus();},this))
.bind("dblclick.jstree",function (event) {var sel;if(document.selection &&document.selection.empty) {document.selection.empty();}
else {if(window.getSelection) {sel =window.getSelection();try {sel.removeAllRanges();sel.collapse();} catch (err) {}
}
}
});if(this._get_settings().core.notify_plugins) {this.get_container()
.bind("load_node.jstree",$.proxy(function (e,data) {var o =this._get_node(data.rslt.obj),t =this;if(o ===-1) {o =this.get_container_ul();}
if(!o.length) {return;}
o.find("li").each(function () {var th =$(this);if(th.data("jstree")) {$.each(th.data("jstree"),function (plugin,values) {if(t.data[plugin] &&$.isFunction(t["_"+ plugin + "_notify"])) {t["_"+ plugin + "_notify"].call(t,th,values);}
});}
});},this));}
if(this._get_settings().core.load_open) {this.get_container()
.bind("load_node.jstree",$.proxy(function (e,data) {var o =this._get_node(data.rslt.obj),t =this;if(o ===-1) {o =this.get_container_ul();}
if(!o.length) {return;}
o.find("li.jstree-open:not(:has(ul))").each(function () {t.load_node(this,$.noop,$.noop);});},this));}
this.__callback();this.load_node(-1,function () {this.loaded();this.reload_nodes();});},destroy:function () {var i,n =this.get_index(),s =this._get_settings(),_this =this;$.each(s.plugins,function (i,val) {try {plugins[val].__destroy.apply(_this);} catch(err) {}
});this.__callback();if(this.is_focused()) {for(i in instances) {if(instances.hasOwnProperty(i) &&i !=n) {instances[i].set_focus();break;} }
}
if(n ===focused_instance) {focused_instance =-1;}
this.get_container()
.unbind(".jstree")
.undelegate(".jstree")
.removeData("jstree_instance_id")
.find("[class^='jstree']")
.andSelf()
.attr("class",function () {return this.className.replace(/jstree[^ ]*|$/ig,''); });

$(document)
.unbind(".jstree-"+ n)
.undelegate(".jstree-"+ n);instances[n] =null;delete instances[n];},_core_notify :function (n,data) {if(data.opened) {this.open_node(n,false,true);}
},lock :function () {this.data.core.locked =true;this.get_container().children("ul").addClass("jstree-locked").css("opacity","0.7");this.__callback({});},unlock :function () {this.data.core.locked =false;this.get_container().children("ul").removeClass("jstree-locked").css("opacity","1");this.__callback({});},is_locked :function () {return this.data.core.locked;},save_opened :function () {var _this =this;this.data.core.to_open =[];this.get_container_ul().find("li.jstree-open").each(function () {if(this.id) {_this.data.core.to_open.push("#"+ this.id.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:")); }

});this.__callback(_this.data.core.to_open);},save_loaded :function () {},reload_nodes :function (is_callback) {var _this =this,done =true,current =[],remaining =[];if(!is_callback) {this.data.core.reopen =false;this.data.core.refreshing =true;this.data.core.to_open =$.map($.makeArray(this.data.core.to_open),function (n) {return "#"+ n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });

this.data.core.to_load =$.map($.makeArray(this.data.core.to_load),function (n) {return "#"+ n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });

if(this.data.core.to_open.length) {this.data.core.to_load =this.data.core.to_load.concat(this.data.core.to_open);}
}
if(this.data.core.to_load.length) {$.each(this.data.core.to_load,function (i,val) {if(val =="#") {return true;}
if($(val).length) {current.push(val);}
else {remaining.push(val);}
});if(current.length) {this.data.core.to_load =remaining;$.each(current,function (i,val) {if(!_this._is_loaded(val)) {_this.load_node(val,function () {_this.reload_nodes(true);},function () {_this.reload_nodes(true);});done =false;}
});}
}
if(this.data.core.to_open.length) {$.each(this.data.core.to_open,function (i,val) {_this.open_node(val,false,true);});}
if(done) {if(this.data.core.reopen) {clearTimeout(this.data.core.reopen);}
this.data.core.reopen =setTimeout(function () {_this.__callback({},_this);},50);this.data.core.refreshing =false;this.reopen();}
},reopen :function () {var _this =this;if(this.data.core.to_open.length) {$.each(this.data.core.to_open,function (i,val) {_this.open_node(val,false,true);});}
this.__callback({});},refresh :function (obj) {var _this =this;this.save_opened();if(!obj) {obj =-1;}
obj =this._get_node(obj);if(!obj) {obj =-1;}
if(obj !==-1) {obj.children("UL").remove();}
else {this.get_container_ul().empty();}
this.load_node(obj,function () {_this.__callback({"obj":obj});_this.reload_nodes();});},loaded:function () {this.__callback();},set_focus:function () {if(this.is_focused()) {return;}
var f =$.jstree._focused();if(f) {f.unset_focus();}
this.get_container().addClass("jstree-focused");focused_instance =this.get_index();this.__callback();},is_focused:function () {return focused_instance ==this.get_index();},unset_focus:function () {if(this.is_focused()) {this.get_container().removeClass("jstree-focused");focused_instance =-1;}
this.__callback();},_get_node:function (obj) {var $obj =$(obj,this.get_container());if($obj.is(".jstree") ||obj ==-1) {return -1;} $obj =$obj.closest("li",this.get_container());return $obj.length ?$obj :false;},_get_next:function (obj,strict) {obj =this._get_node(obj);if(obj ===-1) {return this.get_container().find("> ul > li:first-child");}
if(!obj.length) {return false;}
if(strict) {return (obj.nextAll("li").size() > 0) ?obj.nextAll("li:eq(0)") :false;}
if(obj.hasClass("jstree-open")) {return obj.find("li:eq(0)");}
else if(obj.nextAll("li").size() > 0) {return obj.nextAll("li:eq(0)");}
else {return obj.parentsUntil(".jstree","li").next("li").eq(0);}
},_get_prev:function (obj,strict) {obj =this._get_node(obj);if(obj ===-1) {return this.get_container().find("> ul > li:last-child");}
if(!obj.length) {return false;}
if(strict) {return (obj.prevAll("li").length > 0) ?obj.prevAll("li:eq(0)") :false;}
if(obj.prev("li").length) {obj =obj.prev("li").eq(0);while(obj.hasClass("jstree-open")) {obj =obj.children("ul:eq(0)").children("li:last");}
return obj;}
else {var o =obj.parentsUntil(".jstree","li:eq(0)");return o.length ?o :false;}
},_get_parent:function (obj) {obj =this._get_node(obj);if(obj ==-1 ||!obj.length) {return false;}
var o =obj.parentsUntil(".jstree","li:eq(0)");return o.length ?o :-1;},_get_children:function (obj) {obj =this._get_node(obj);if(obj ===-1) {return this.get_container().children("ul:eq(0)").children("li");}
if(!obj.length) {return false;}
return obj.children("ul:eq(0)").children("li");},get_path:function (obj,id_mode) {var p =[],_this =this;obj =this._get_node(obj);if(obj ===-1 ||!obj ||!obj.length) {return false;}
obj.parentsUntil(".jstree","li").each(function () {p.push(id_mode ?this.id :_this.get_text(this) );});p.reverse();p.push(id_mode ?obj.attr("id") :this.get_text(obj) );return p;},_get_string :function (key) {return this._get_settings().core.strings[key] ||key;},is_open:function (obj) {obj =this._get_node(obj);return obj &&obj !==-1 &&obj.hasClass("jstree-open");},is_closed:function (obj) {obj =this._get_node(obj);return obj &&obj !==-1 &&obj.hasClass("jstree-closed");},is_leaf:function (obj) {obj =this._get_node(obj);return obj &&obj !==-1 &&obj.hasClass("jstree-leaf");},correct_state:function (obj) {obj =this._get_node(obj);if(!obj ||obj ===-1) {return false;}
obj.removeClass("jstree-closed jstree-open").addClass("jstree-leaf").children("ul").remove();this.__callback({"obj":obj });},open_node:function (obj,callback,skip_animation) {obj =this._get_node(obj);if(!obj.length) {return false;}
if(!obj.hasClass("jstree-closed")) {if(callback) {callback.call();} return false;}
var s =skip_animation ||is_ie6 ?0 :this._get_settings().core.animation,t =this;if(!this._is_loaded(obj)) {obj.children("a").addClass("jstree-loading");this.load_node(obj,function () {t.open_node(obj,callback,skip_animation);},callback);}
else {if(this._get_settings().core.open_parents) {obj.parentsUntil(".jstree",".jstree-closed").each(function () {t.open_node(this,false,true);});}
if(s) {obj.children("ul").css("display","none");}
obj.removeClass("jstree-closed").addClass("jstree-open").children("a").removeClass("jstree-loading");if(s) {obj.children("ul").stop(true,true).slideDown(s,function () {this.style.display ="";t.after_open(obj);});}
else {t.after_open(obj);}
this.__callback({"obj":obj });if(callback) {callback.call();}
}
},after_open:function (obj) {this.__callback({"obj":obj });},close_node:function (obj,skip_animation) {obj =this._get_node(obj);var s =skip_animation ||is_ie6 ?0 :this._get_settings().core.animation,t =this;if(!obj.length ||!obj.hasClass("jstree-open")) {return false;}
if(s) {obj.children("ul").attr("style","display:block !important");}
obj.removeClass("jstree-open").addClass("jstree-closed");if(s) {obj.children("ul").stop(true,true).slideUp(s,function () {this.style.display ="";t.after_close(obj);});}
else {t.after_close(obj);}
this.__callback({"obj":obj });},after_close:function (obj) {this.__callback({"obj":obj });},toggle_node:function (obj) {obj =this._get_node(obj);if(obj.hasClass("jstree-closed")) {return this.open_node(obj);}
if(obj.hasClass("jstree-open")) {return this.close_node(obj);}
},open_all:function (obj,do_animation,original_obj) {obj =obj ?this._get_node(obj) :-1;if(!obj ||obj ===-1) {obj =this.get_container_ul();}
if(original_obj) {obj =obj.find("li.jstree-closed");}
else {original_obj =obj;if(obj.is(".jstree-closed")) {obj =obj.find("li.jstree-closed").andSelf();}
else {obj =obj.find("li.jstree-closed");}
}
var _this =this;obj.each(function () {var __this =this;if(!_this._is_loaded(this)) {_this.open_node(this,function() {_this.open_all(__this,do_animation,original_obj);},!do_animation);}
else {_this.open_node(this,false,!do_animation);}
});if(original_obj.find('li.jstree-closed').length ===0) {this.__callback({"obj":original_obj });}
},close_all:function (obj,do_animation) {var _this =this;obj =obj ?this._get_node(obj) :this.get_container();if(!obj ||obj ===-1) {obj =this.get_container_ul();}
obj.find("li.jstree-open").andSelf().each(function () {_this.close_node(this,!do_animation);});this.__callback({"obj":obj });},clean_node:function (obj) {obj =obj &&obj !=-1 ?$(obj) :this.get_container_ul();obj =obj.is("li") ?obj.find("li").andSelf() :obj.find("li");obj.removeClass("jstree-last")
.filter("li:last-child").addClass("jstree-last").end()
.filter(":has(li)")
.not(".jstree-open").removeClass("jstree-leaf").addClass("jstree-closed");obj.not(".jstree-open, .jstree-closed").addClass("jstree-leaf").children("ul").remove();this.__callback({"obj":obj });},get_rollback :function () {this.__callback();return {i :this.get_index(),h :this.get_container().children("ul").clone(true),d :this.data };},set_rollback :function (html,data) {this.get_container().empty().append(html);this.data =data;this.__callback();},load_node:function (obj,s_call,e_call) {this.__callback({"obj":obj });},_is_loaded:function (obj) {return true;},create_node:function (obj,position,js,callback,is_loaded) {obj =this._get_node(obj);position =typeof position ==="undefined"?"last":position;var d =$("<li />"),s =this._get_settings().core,tmp;if(obj !==-1 &&!obj.length) {return false;}
if(!is_loaded &&!this._is_loaded(obj)) {this.load_node(obj,function () {this.create_node(obj,position,js,callback,true);});return false;}
this.__rollback();if(typeof js ==="string") {js ={"data":js };}
if(!js) {js ={};}
if(js.attr) {d.attr(js.attr);}
if(js.metadata) {d.data(js.metadata);}
if(js.state) {d.addClass("jstree-"+ js.state);}
if(!js.data) {js.data =this._get_string("new_node");}
if(!$.isArray(js.data)) {tmp =js.data;js.data =[];js.data.push(tmp);}
$.each(js.data,function (i,m) {tmp =$("<a />");if($.isFunction(m)) {m =m.call(this,js);}
if(typeof m =="string") {tmp.attr('href','#')[s.html_titles ?"html":"text"](m);}
else {if(!m.attr) {m.attr ={};}
if(!m.attr.href) {m.attr.href ='#';}
tmp.attr(m.attr)[s.html_titles ?"html":"text"](m.title);if(m.language) {tmp.addClass(m.language);}
}
tmp.prepend("<ins class='jstree-icon'>&#160;</ins>");if(!m.icon &&js.icon) {m.icon =js.icon;}
if(m.icon) {if(m.icon.indexOf("/") ===-1) {tmp.children("ins").addClass(m.icon);}
else {tmp.children("ins").css("background","url('"+ m.icon + "') center center no-repeat");}
}
d.append(tmp);});d.prepend("<ins class='jstree-icon'>&#160;</ins>");if(obj ===-1) {obj =this.get_container();if(position ==="before") {position ="first";}
if(position ==="after") {position ="last";}
}
switch(position) {case "before":obj.before(d);tmp =this._get_parent(obj);break;case "after":obj.after(d);tmp =this._get_parent(obj);break;case "inside":case "first":if(!obj.children("ul").length) {obj.append("<ul />");}
obj.children("ul").prepend(d);tmp =obj;break;case "last":if(!obj.children("ul").length) {obj.append("<ul />");}
obj.children("ul").append(d);tmp =obj;break;default:if(!obj.children("ul").length) {obj.append("<ul />");}
if(!position) {position =0;}
tmp =obj.children("ul").children("li").eq(position);if(tmp.length) {tmp.before(d);}
else {obj.children("ul").append(d);}
tmp =obj;break;}
if(tmp ===-1 ||tmp.get(0) ===this.get_container().get(0)) {tmp =-1;}
this.clean_node(tmp);this.__callback({"obj":d,"parent":tmp });if(callback) {callback.call(this,d);}
return d;},get_text:function (obj) {obj =this._get_node(obj);if(!obj.length) {return false;}
var s =this._get_settings().core.html_titles;obj =obj.children("a:eq(0)");if(s) {obj =obj.clone();obj.children("INS").remove();return obj.html();}
else {obj =obj.contents().filter(function() {return this.nodeType ==3;})[0];return obj.nodeValue;}
},set_text:function (obj,val) {obj =this._get_node(obj);if(!obj.length) {return false;}
obj =obj.children("a:eq(0)");if(this._get_settings().core.html_titles) {var tmp =obj.children("INS").clone();obj.html(val).prepend(tmp);this.__callback({"obj":obj,"name":val });return true;}
else {obj =obj.contents().filter(function() {return this.nodeType ==3;})[0];this.__callback({"obj":obj,"name":val });return (obj.nodeValue =val);}
},rename_node :function (obj,val) {obj =this._get_node(obj);this.__rollback();if(obj &&obj.length &&this.set_text.apply(this,Array.prototype.slice.call(arguments))) {this.__callback({"obj":obj,"name":val });}
},delete_node :function (obj) {obj =this._get_node(obj);if(!obj.length) {return false;}
this.__rollback();var p =this._get_parent(obj),prev =$([]),t =this;obj.each(function () {prev =prev.add(t._get_prev(this));});obj =obj.detach();if(p !==-1 &&p.find("> ul > li").length ===0) {p.removeClass("jstree-open jstree-closed").addClass("jstree-leaf");}
this.clean_node(p);this.__callback({"obj":obj,"prev":prev,"parent":p });return obj;},prepare_move :function (o,r,pos,cb,is_cb) {var p ={};p.ot =$.jstree._reference(o) ||this;p.o =p.ot._get_node(o);p.r =r ===- 1 ?-1 :this._get_node(r);p.p =(typeof pos ==="undefined"||pos ===false) ?"last":pos;if(!is_cb &&prepared_move.o &&prepared_move.o[0] ===p.o[0] &&prepared_move.r[0] ===p.r[0] &&prepared_move.p ===p.p) {this.__callback(prepared_move);if(cb) {cb.call(this,prepared_move);}
return;}
p.ot =$.jstree._reference(p.o) ||this;p.rt =$.jstree._reference(p.r) ||this;if(p.r ===-1 ||!p.r) {p.cr =-1;switch(p.p) {case "first":case "before":case "inside":p.cp =0;break;case "after":case "last":p.cp =p.rt.get_container().find(" > ul > li").length;break;default:p.cp =p.p;break;}
}
else {if(!/^(before|after)$/.test(p.p) && !this._is_loaded(p.r)) {

return this.load_node(p.r,function () {this.prepare_move(o,r,pos,cb,true);});}
switch(p.p) {case "before":p.cp =p.r.index();p.cr =p.rt._get_parent(p.r);break;case "after":p.cp =p.r.index() + 1;p.cr =p.rt._get_parent(p.r);break;case "inside":case "first":p.cp =0;p.cr =p.r;break;case "last":p.cp =p.r.find(" > ul > li").length;p.cr =p.r;break;default:p.cp =p.p;p.cr =p.r;break;}
}
p.np =p.cr ==-1 ?p.rt.get_container() :p.cr;p.op =p.ot._get_parent(p.o);p.cop =p.o.index();if(p.op ===-1) {p.op =p.ot ?p.ot.get_container() :this.get_container();}
if(!/^(before|after)$/.test(p.p) && p.op && p.np && p.op[0] === p.np[0] && p.o.index() < p.cp) { p.cp++; }

p.or =p.np.find(" > ul > li:nth-child("+ (p.cp + 1) + ")");prepared_move =p;this.__callback(prepared_move);if(cb) {cb.call(this,prepared_move);}
},check_move :function () {var obj =prepared_move,ret =true,r =obj.r ===-1 ?this.get_container() :obj.r;if(!obj ||!obj.o ||obj.or[0] ===obj.o[0]) {return false;}
if(obj.op &&obj.np &&obj.op[0] ===obj.np[0] &&obj.cp - 1 ===obj.o.index()) {return false;}
obj.o.each(function () {if(r.parentsUntil(".jstree","li").andSelf().index(this) !==-1) {ret =false;return false;}
});return ret;},move_node :function (obj,ref,position,is_copy,is_prepared,skip_check) {if(!is_prepared) {return this.prepare_move(obj,ref,position,function (p) {this.move_node(p,false,false,is_copy,true,skip_check);});}
if(is_copy) {prepared_move.cy =true;}
if(!skip_check &&!this.check_move()) {return false;}
this.__rollback();var o =false;if(is_copy) {o =obj.o.clone(true);o.find("*[id]").andSelf().each(function () {if(this.id) {this.id ="copy_"+ this.id;}
});}
else {o =obj.o;}
if(obj.or.length) {obj.or.before(o);}
else {if(!obj.np.children("ul").length) {$("<ul />").appendTo(obj.np);}
obj.np.children("ul:eq(0)").append(o);}
try {obj.ot.clean_node(obj.op);obj.rt.clean_node(obj.np);if(!obj.op.find("> ul > li").length) {obj.op.removeClass("jstree-open jstree-closed").addClass("jstree-leaf").children("ul").remove();}
} catch (e) {}
if(is_copy) {prepared_move.cy =true;prepared_move.oc =o;}
this.__callback(prepared_move);return prepared_move;},_get_move :function () {return prepared_move;}
}
});})(jQuery);(function ($) {var scrollbar_width,e1,e2;$(function() {if (/msie/.test(navigator.userAgent.toLowerCase())) {

e1 =$('<textarea cols="10" rows="2"></textarea>').css({position:'absolute',top:-1000,left:0 }).appendTo('body');e2 =$('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({position:'absolute',top:-1000,left:0 }).appendTo('body');scrollbar_width =e1.width() - e2.width();e1.add(e2).remove();} else {e1 =$('<div />').css({width:100,height:100,overflow:'auto',position:'absolute',top:-1000,left:0 })
.prependTo('body').append('<div />').find('div').css({width:'100%',height:200 });scrollbar_width =100 - e1.width();e1.parent().remove();}
});$.jstree.plugin("ui",{__init :function () {this.data.ui.selected =$();this.data.ui.last_selected =false;this.data.ui.hovered =null;this.data.ui.to_select =this.get_settings().ui.initially_select;this.get_container()
.delegate("a","click.jstree",$.proxy(function (event) {event.preventDefault();event.currentTarget.blur();if(!$(event.currentTarget).hasClass("jstree-loading")) {this.select_node(event.currentTarget,true,event);}
},this))
.delegate("a","mouseenter.jstree",$.proxy(function (event) {if(!$(event.currentTarget).hasClass("jstree-loading")) {this.hover_node(event.target);}
},this))
.delegate("a","mouseleave.jstree",$.proxy(function (event) {if(!$(event.currentTarget).hasClass("jstree-loading")) {this.dehover_node(event.target);}
},this))
.bind("reopen.jstree",$.proxy(function () {this.reselect();},this))
.bind("get_rollback.jstree",$.proxy(function () {this.dehover_node();this.save_selected();},this))
.bind("set_rollback.jstree",$.proxy(function () {this.reselect();},this))
.bind("close_node.jstree",$.proxy(function (event,data) {var s =this._get_settings().ui,obj =this._get_node(data.rslt.obj),clk =(obj &&obj.length) ?obj.children("ul").find("a.jstree-clicked") :$(),_this =this;if(s.selected_parent_close ===false ||!clk.length) {return;}
clk.each(function () {_this.deselect_node(this);if(s.selected_parent_close ==="select_parent") {_this.select_node(obj);}
});},this))
.bind("delete_node.jstree",$.proxy(function (event,data) {var s =this._get_settings().ui.select_prev_on_delete,obj =this._get_node(data.rslt.obj),clk =(obj &&obj.length) ?obj.find("a.jstree-clicked") :[],_this =this;clk.each(function () {_this.deselect_node(this);});if(s &&clk.length) {data.rslt.prev.each(function () {if(this.parentNode) {_this.select_node(this);return false;}
});}
},this))
.bind("move_node.jstree",$.proxy(function (event,data) {if(data.rslt.cy) {data.rslt.oc.find("a.jstree-clicked").removeClass("jstree-clicked");}
},this));},defaults :{select_limit :-1,select_multiple_modifier :"ctrl",select_range_modifier :"shift",selected_parent_close :"select_parent",selected_parent_open :true,select_prev_on_delete :true,disable_selecting_children :false,initially_select :[]
},_fn :{_get_node :function (obj,allow_multiple) {if(typeof obj ==="undefined"||obj ===null) {return allow_multiple ?this.data.ui.selected :this.data.ui.last_selected;}
var $obj =$(obj,this.get_container());if($obj.is(".jstree") ||obj ==-1) {return -1;} $obj =$obj.closest("li",this.get_container());return $obj.length ?$obj :false;},_ui_notify :function (n,data) {if(data.selected) {this.select_node(n,false);}
},save_selected :function () {var _this =this;this.data.ui.to_select =[];this.data.ui.selected.each(function () {if(this.id) {_this.data.ui.to_select.push("#"+ this.id.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:")); } });

this.__callback(this.data.ui.to_select);},reselect :function () {var _this =this,s =this.data.ui.to_select;s =$.map($.makeArray(s),function (n) {return "#"+ n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });

$.each(s,function (i,val) {if(val &&val !=="#") {_this.select_node(val);} });this.data.ui.selected =this.data.ui.selected.filter(function () {return this.parentNode;});this.__callback();},refresh :function (obj) {this.save_selected();return this.__call_old();},hover_node :function (obj) {obj =this._get_node(obj);if(!obj.length) {return false;}
if(!obj.hasClass("jstree-hovered")) {this.dehover_node();}
this.data.ui.hovered =obj.children("a").addClass("jstree-hovered").parent();this._fix_scroll(obj);this.__callback({"obj":obj });},dehover_node :function () {var obj =this.data.ui.hovered,p;if(!obj ||!obj.length) {return false;}
p =obj.children("a").removeClass("jstree-hovered").parent();if(this.data.ui.hovered[0] ===p[0]) {this.data.ui.hovered =null;}
this.__callback({"obj":obj });},select_node :function (obj,check,e) {obj =this._get_node(obj);if(obj ==-1 ||!obj ||!obj.length) {return false;}
var s =this._get_settings().ui,is_multiple =(s.select_multiple_modifier =="on"||(s.select_multiple_modifier !==false &&e &&e[s.select_multiple_modifier + "Key"])),is_range =(s.select_range_modifier !==false &&e &&e[s.select_range_modifier + "Key"] &&this.data.ui.last_selected &&this.data.ui.last_selected[0] !==obj[0] &&this.data.ui.last_selected.parent()[0] ===obj.parent()[0]),is_selected =this.is_selected(obj),proceed =true,t =this;if(check) {if(s.disable_selecting_children &&is_multiple &&((obj.parentsUntil(".jstree","li").children("a.jstree-clicked").length) ||(obj.children("ul").find("a.jstree-clicked:eq(0)").length)
)
) {return false;}
proceed =false;switch(!0) {case (is_range):this.data.ui.last_selected.addClass("jstree-last-selected");obj =obj[obj.index() < this.data.ui.last_selected.index() ?"nextUntil":"prevUntil"](".jstree-last-selected").andSelf();if(s.select_limit ==-1 ||obj.length < s.select_limit) {this.data.ui.last_selected.removeClass("jstree-last-selected");this.data.ui.selected.each(function () {if(this !==t.data.ui.last_selected[0]) {t.deselect_node(this);}
});is_selected =false;proceed =true;}
else {proceed =false;}
break;case (is_selected &&!is_multiple):this.deselect_all();is_selected =false;proceed =true;break;case (!is_selected &&!is_multiple):if(s.select_limit ==-1 ||s.select_limit > 0) {this.deselect_all();proceed =true;}
break;case (is_selected &&is_multiple):this.deselect_node(obj);break;case (!is_selected &&is_multiple):if(s.select_limit ==-1 ||this.data.ui.selected.length + 1 <=s.select_limit) {proceed =true;}
break;}
}
if(proceed &&!is_selected) {if(!is_range) {this.data.ui.last_selected =obj;}
obj.children("a").addClass("jstree-clicked");if(s.selected_parent_open) {obj.parents(".jstree-closed").each(function () {t.open_node(this,false,true);});}
this.data.ui.selected =this.data.ui.selected.add(obj);this._fix_scroll(obj.eq(0));this.__callback({"obj":obj,"e":e });}
},_fix_scroll :function (obj) {var c =this.get_container()[0],t;if(c.scrollHeight > c.offsetHeight) {obj =this._get_node(obj);if(!obj ||obj ===-1 ||!obj.length ||!obj.is(":visible")) {return;}
t =obj.offset().top - this.get_container().offset().top;if(t < 0) {c.scrollTop =c.scrollTop + t - 1;}
if(t + this.data.core.li_height + (c.scrollWidth > c.offsetWidth ?scrollbar_width :0) > c.offsetHeight) {c.scrollTop =c.scrollTop + (t - c.offsetHeight + this.data.core.li_height + 1 + (c.scrollWidth > c.offsetWidth ?scrollbar_width :0));}
}
},deselect_node :function (obj) {obj =this._get_node(obj);if(!obj.length) {return false;}
if(this.is_selected(obj)) {obj.children("a").removeClass("jstree-clicked");this.data.ui.selected =this.data.ui.selected.not(obj);if(this.data.ui.last_selected.get(0) ===obj.get(0)) {this.data.ui.last_selected =this.data.ui.selected.eq(0);}
this.__callback({"obj":obj });}
},toggle_select :function (obj) {obj =this._get_node(obj);if(!obj.length) {return false;}
if(this.is_selected(obj)) {this.deselect_node(obj);}
else {this.select_node(obj);}
},is_selected :function (obj) {return this.data.ui.selected.index(this._get_node(obj)) >=0;},get_selected :function (context) {return context ?$(context).find("a.jstree-clicked").parent() :this.data.ui.selected;},deselect_all :function (context) {var ret =context ?$(context).find("a.jstree-clicked").parent() :this.get_container().find("a.jstree-clicked").parent();ret.children("a.jstree-clicked").removeClass("jstree-clicked");this.data.ui.selected =$([]);this.data.ui.last_selected =false;this.__callback({"obj":ret });}
}
});$.jstree.defaults.plugins.push("ui");})(jQuery);(function ($) {$.jstree.plugin("crrm",{__init :function () {this.get_container()
.bind("move_node.jstree",$.proxy(function (e,data) {if(this._get_settings().crrm.move.open_onmove) {var t =this;data.rslt.np.parentsUntil(".jstree").andSelf().filter(".jstree-closed").each(function () {t.open_node(this,false,true);});}
},this));},defaults :{input_width_limit :200,move :{always_copy:false,open_onmove:true,default_position:"last",check_move:function (m) {return true;}
}
},_fn :{_show_input :function (obj,callback) {obj =this._get_node(obj);var rtl =this._get_settings().core.rtl,w =this._get_settings().crrm.input_width_limit,w1 =obj.children("ins").width(),w2 =obj.find("> a:visible > ins").width() * obj.find("> a:visible > ins").length,t =this.get_text(obj),h1 =$("<div />",{css :{"position":"absolute","top":"-200px","left":(rtl ?"0px":"-1000px"),"visibility":"hidden"} }).appendTo("body"),h2 =obj.css("position","relative").append($("<input />",{"value":t,"class":"jstree-rename-input","css":{"padding":"0","border":"1px solid silver","position":"absolute","left":(rtl ?"auto":(w1 + w2 + 4) + "px"),"right":(rtl ?(w1 + w2 + 4) + "px":"auto"),"top":"0px","height":(this.data.core.li_height - 2) + "px","lineHeight":(this.data.core.li_height - 2) + "px","width":"150px"},"blur":$.proxy(function () {var i =obj.children(".jstree-rename-input"),v =i.val();if(v ==="") {v =t;}
h1.remove();i.remove();this.set_text(obj,t);this.rename_node(obj,v);callback.call(this,obj,v,t);obj.css("position","");},this),"keyup":function (event) {var key =event.keyCode ||event.which;if(key ==27) {this.value =t;this.blur();return;}
else if(key ==13) {this.blur();return;}
else {h2.width(Math.min(h1.text("pW"+ this.value).width(),w));}
},"keypress":function(event) {var key =event.keyCode ||event.which;if(key ==13) {return false;}
}
})
).children(".jstree-rename-input");this.set_text(obj,"");h1.css({fontFamily:h2.css('fontFamily')||'',fontSize:h2.css('fontSize')||'',fontWeight:h2.css('fontWeight')||'',fontStyle:h2.css('fontStyle')||'',fontStretch:h2.css('fontStretch')||'',fontVariant:h2.css('fontVariant')||'',letterSpacing:h2.css('letterSpacing')||'',wordSpacing:h2.css('wordSpacing')||''});h2.width(Math.min(h1.text("pW"+ h2[0].value).width(),w))[0].select();},rename :function (obj) {obj =this._get_node(obj);this.__rollback();var f =this.__callback;this._show_input(obj,function (obj,new_name,old_name) {f.call(this,{"obj":obj,"new_name":new_name,"old_name":old_name });});},create :function (obj,position,js,callback,skip_rename) {var t,_this =this;obj =this._get_node(obj);if(!obj) {obj =-1;}
this.__rollback();t =this.create_node(obj,position,js,function (t) {var p =this._get_parent(t),pos =$(t).index();if(callback) {callback.call(this,t);}
if(p.length &&p.hasClass("jstree-closed")) {this.open_node(p,false,true);}
if(!skip_rename) {this._show_input(t,function (obj,new_name,old_name) {_this.__callback({"obj":obj,"name":new_name,"parent":p,"position":pos });});}
else {_this.__callback({"obj":t,"name":this.get_text(t),"parent":p,"position":pos });}
});return t;},remove :function (obj) {obj =this._get_node(obj,true);var p =this._get_parent(obj),prev =this._get_prev(obj);this.__rollback();obj =this.delete_node(obj);if(obj !==false) {this.__callback({"obj":obj,"prev":prev,"parent":p });}
},check_move :function () {if(!this.__call_old()) {return false;}
var s =this._get_settings().crrm.move;if(!s.check_move.call(this,this._get_move())) {return false;}
return true;},move_node :function (obj,ref,position,is_copy,is_prepared,skip_check) {var s =this._get_settings().crrm.move;if(!is_prepared) {if(typeof position ==="undefined") {position =s.default_position;}
if(position ==="inside"&&!s.default_position.match(/^(before|after)$/)) { position = s.default_position; }

return this.__call_old(true,obj,ref,position,is_copy,false,skip_check);}
if(s.always_copy ===true ||(s.always_copy ==="multitree"&&obj.rt.get_index() !==obj.ot.get_index() )) {is_copy =true;}
this.__call_old(true,obj,ref,position,is_copy,true,skip_check);},cut :function (obj) {obj =this._get_node(obj,true);if(!obj ||!obj.length) {return false;}
this.data.crrm.cp_nodes =false;this.data.crrm.ct_nodes =obj;this.__callback({"obj":obj });},copy :function (obj) {obj =this._get_node(obj,true);if(!obj ||!obj.length) {return false;}
this.data.crrm.ct_nodes =false;this.data.crrm.cp_nodes =obj;this.__callback({"obj":obj });},paste :function (obj) {obj =this._get_node(obj);if(!obj ||!obj.length) {return false;}
var nodes =this.data.crrm.ct_nodes ?this.data.crrm.ct_nodes :this.data.crrm.cp_nodes;if(!this.data.crrm.ct_nodes &&!this.data.crrm.cp_nodes) {return false;}
if(this.data.crrm.ct_nodes) {this.move_node(this.data.crrm.ct_nodes,obj);this.data.crrm.ct_nodes =false;}
if(this.data.crrm.cp_nodes) {this.move_node(this.data.crrm.cp_nodes,obj,false,true);}
this.__callback({"obj":obj,"nodes":nodes });}
}
});})(jQuery);(function ($) {var themes_loaded =[];$.jstree._themes =false;$.jstree.plugin("themes",{__init :function () {this.get_container()
.bind("init.jstree",$.proxy(function () {var s =this._get_settings().themes;this.data.themes.dots =s.dots;this.data.themes.icons =s.icons;this.set_theme(s.theme,s.url);},this))
.bind("loaded.jstree",$.proxy(function () {if(!this.data.themes.dots) {this.hide_dots();}
else {this.show_dots();}
if(!this.data.themes.icons) {this.hide_icons();}
else {this.show_icons();}
},this));},defaults :{theme :"default",url :false,dots :true,icons :true
},_fn :{set_theme :function (theme_name,theme_url) {if(!theme_name) {return false;}
if(!theme_url) {theme_url =$.jstree._themes + theme_name + '/style.css';}
if($.inArray(theme_url,themes_loaded) ==-1) {$.vakata.css.add_sheet({"url":theme_url });themes_loaded.push(theme_url);}
if(this.data.themes.theme !=theme_name) {this.get_container().removeClass('jstree-'+ this.data.themes.theme);this.data.themes.theme =theme_name;}
this.get_container().addClass('jstree-'+ theme_name);if(!this.data.themes.dots) {this.hide_dots();}
else {this.show_dots();}
if(!this.data.themes.icons) {this.hide_icons();}
else {this.show_icons();}
this.__callback();},get_theme:function () {return this.data.themes.theme;},show_dots:function () {this.data.themes.dots =true;this.get_container().children("ul").removeClass("jstree-no-dots");},hide_dots:function () {this.data.themes.dots =false;this.get_container().children("ul").addClass("jstree-no-dots");},toggle_dots:function () {if(this.data.themes.dots) {this.hide_dots();} else {this.show_dots();} },show_icons:function () {this.data.themes.icons =true;this.get_container().children("ul").removeClass("jstree-no-icons");},hide_icons:function () {this.data.themes.icons =false;this.get_container().children("ul").addClass("jstree-no-icons");},toggle_icons:function () {if(this.data.themes.icons) {this.hide_icons();} else {this.show_icons();} }
}
});$(function () {if($.jstree._themes ===false) {$("script").each(function () {if(this.src.toString().match(/jquery\.jstree[^\/]*?\.js(\?.*)?$/)) { 

$.jstree._themes =this.src.toString().replace(/jquery\.jstree[^\/]*?\.js(\?.*)?$/, "") + 'themes/'; 

return false;}
});}
if($.jstree._themes ===false) {$.jstree._themes ="themes/";}
});$.jstree.defaults.plugins.push("themes");})(jQuery);(function ($) {var bound =[];function exec(i,event) {var f =$.jstree._focused(),tmp;if(f &&f.data &&f.data.hotkeys &&f.data.hotkeys.enabled) {tmp =f._get_settings().hotkeys[i];if(tmp) {return tmp.call(f,event);}
}
}
$.jstree.plugin("hotkeys",{__init :function () {if(typeof $.hotkeys ==="undefined") {throw "jsTree hotkeys: jQuery hotkeys plugin not included.";}
if(!this.data.ui) {throw "jsTree hotkeys: jsTree UI plugin not included.";}
$.each(this._get_settings().hotkeys,function (i,v) {if(v !==false &&$.inArray(i,bound) ==-1) {$(document).bind("keydown",i,function (event) {return exec(i,event);});bound.push(i);}
});this.get_container()
.bind("lock.jstree",$.proxy(function () {if(this.data.hotkeys.enabled) {this.data.hotkeys.enabled =false;this.data.hotkeys.revert =true;}
},this))
.bind("unlock.jstree",$.proxy(function () {if(this.data.hotkeys.revert) {this.data.hotkeys.enabled =true;}
},this));this.enable_hotkeys();},defaults :{"up":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_prev(o));return false;},"ctrl+up":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_prev(o));return false;},"shift+up":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_prev(o));return false;},"down":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_next(o));return false;},"ctrl+down":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_next(o));return false;},"shift+down":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected ||-1;this.hover_node(this._get_next(o));return false;},"left":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o) {if(o.hasClass("jstree-open")) {this.close_node(o);}
else {this.hover_node(this._get_prev(o));}
}
return false;},"ctrl+left":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o) {if(o.hasClass("jstree-open")) {this.close_node(o);}
else {this.hover_node(this._get_prev(o));}
}
return false;},"shift+left":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o) {if(o.hasClass("jstree-open")) {this.close_node(o);}
else {this.hover_node(this._get_prev(o));}
}
return false;},"right":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o &&o.length) {if(o.hasClass("jstree-closed")) {this.open_node(o);}
else {this.hover_node(this._get_next(o));}
}
return false;},"ctrl+right":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o &&o.length) {if(o.hasClass("jstree-closed")) {this.open_node(o);}
else {this.hover_node(this._get_next(o));}
}
return false;},"shift+right":function () {var o =this.data.ui.hovered ||this.data.ui.last_selected;if(o &&o.length) {if(o.hasClass("jstree-closed")) {this.open_node(o);}
else {this.hover_node(this._get_next(o));}
}
return false;},"space":function () {if(this.data.ui.hovered) {this.data.ui.hovered.children("a:eq(0)").click();} return false;},"ctrl+space":function (event) {event.type ="click";if(this.data.ui.hovered) {this.data.ui.hovered.children("a:eq(0)").trigger(event);} return false;},"shift+space":function (event) {event.type ="click";if(this.data.ui.hovered) {this.data.ui.hovered.children("a:eq(0)").trigger(event);} return false;},"f2":function () {this.rename(this.data.ui.hovered ||this.data.ui.last_selected);},"del":function () {this.remove(this.data.ui.hovered ||this._get_node(null));}
},_fn :{enable_hotkeys :function () {this.data.hotkeys.enabled =true;},disable_hotkeys :function () {this.data.hotkeys.enabled =false;}
}
});})(jQuery);(function ($) {$.jstree.plugin("json_data",{__init :function() {var s =this._get_settings().json_data;if(s.progressive_unload) {this.get_container().bind("after_close.jstree",function (e,data) {data.rslt.obj.children("ul").remove();});}
},defaults :{data :false,ajax :false,correct_state :true,progressive_render :false,progressive_unload :false
},_fn :{load_node :function (obj,s_call,e_call) {var _this =this;this.load_node_json(obj,function () {_this.__callback({"obj":_this._get_node(obj) });s_call.call(this);},e_call);},_is_loaded :function (obj) {var s =this._get_settings().json_data;obj =this._get_node(obj);return obj ==-1 ||!obj ||(!s.ajax &&!s.progressive_render &&!$.isFunction(s.data)) ||obj.is(".jstree-open, .jstree-leaf") ||obj.children("ul").children("li").length > 0;},refresh :function (obj) {obj =this._get_node(obj);var s =this._get_settings().json_data;if(obj &&obj !==-1 &&s.progressive_unload &&($.isFunction(s.data) ||!!s.ajax)) {obj.removeData("jstree_children");}
return this.__call_old();},load_node_json :function (obj,s_call,e_call) {var s =this.get_settings().json_data,d,error_func =function () {},success_func =function () {};obj =this._get_node(obj);if(obj &&obj !==-1 &&(s.progressive_render ||s.progressive_unload) &&!obj.is(".jstree-open, .jstree-leaf") &&obj.children("ul").children("li").length ===0 &&obj.data("jstree_children")) {d =this._parse_json(obj.data("jstree_children"),obj);if(d) {obj.append(d);if(!s.progressive_unload) {obj.removeData("jstree_children");}
}
this.clean_node(obj);if(s_call) {s_call.call(this);}
return;}
if(obj &&obj !==-1) {if(obj.data("jstree_is_loading")) {return;}
else {obj.data("jstree_is_loading",true);}
}
switch(!0) {case (!s.data &&!s.ajax):throw "Neither data nor ajax settings supplied.";case ($.isFunction(s.data)):s.data.call(this,obj,$.proxy(function (d) {d =this._parse_json(d,obj);if(!d) {if(obj ===-1 ||!obj) {if(s.correct_state) {this.get_container().children("ul").empty();}
}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);}
}
if(e_call) {e_call.call(this);}
}
else {if(obj ===-1 ||!obj) {this.get_container().children("ul").empty().append(d.children());}
else {obj.append(d).children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");}
this.clean_node(obj);if(s_call) {s_call.call(this);}
}
},this));break;case (!!s.data &&!s.ajax) ||(!!s.data &&!!s.ajax &&(!obj ||obj ===-1)):if(!obj ||obj ==-1) {d =this._parse_json(s.data,obj);if(d) {this.get_container().children("ul").empty().append(d.children());this.clean_node();}
else {if(s.correct_state) {this.get_container().children("ul").empty();}
}
}
if(s_call) {s_call.call(this);}
break;case (!s.data &&!!s.ajax) ||(!!s.data &&!!s.ajax &&obj &&obj !==-1):error_func =function (x,t,e) {var ef =this.get_settings().json_data.ajax.error;if(ef) {ef.call(this,x,t,e);}
if(obj !=-1 &&obj.length) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(t ==="success"&&s.correct_state) {this.correct_state(obj);}
}
else {if(t ==="success"&&s.correct_state) {this.get_container().children("ul").empty();}
}
if(e_call) {e_call.call(this);}
};success_func =function (d,t,x) {var sf =this.get_settings().json_data.ajax.success;if(sf) {d =sf.call(this,d,t,x) ||d;}
if(d ===""||(d &&d.toString &&d.toString().replace(/^[\s\n]+$/,"") === "") || (!$.isArray(d) && !$.isPlainObject(d))) {

return error_func.call(this,x,t,"");}
d =this._parse_json(d,obj);if(d) {if(obj ===-1 ||!obj) {this.get_container().children("ul").empty().append(d.children());}
else {obj.append(d).children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");}
this.clean_node(obj);if(s_call) {s_call.call(this);}
}
else {if(obj ===-1 ||!obj) {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);}
}
}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);if(s_call) {s_call.call(this);} }
}
}
};s.ajax.context =this;s.ajax.error =error_func;s.ajax.success =success_func;if(!s.ajax.dataType) {s.ajax.dataType ="json";}
if($.isFunction(s.ajax.url)) {s.ajax.url =s.ajax.url.call(this,obj);}
if($.isFunction(s.ajax.data)) {s.ajax.data =s.ajax.data.call(this,obj);}
$.ajax(s.ajax);break;}
},_parse_json :function (js,obj,is_callback) {var d =false,p =this._get_settings(),s =p.json_data,t =p.core.html_titles,tmp,i,j,ul1,ul2;if(!js) {return d;}
if(s.progressive_unload &&obj &&obj !==-1) {obj.data("jstree_children",d);}
if($.isArray(js)) {d =$();if(!js.length) {return false;}
for(i =0,j =js.length;i < j;i++) {tmp =this._parse_json(js[i],obj,true);if(tmp.length) {d =d.add(tmp);}
}
}
else {if(typeof js =="string") {js ={data :js };}
if(!js.data &&js.data !=="") {return d;}
d =$("<li />");if(js.attr) {d.attr(js.attr);}
if(js.metadata) {d.data(js.metadata);}
if(js.state) {d.addClass("jstree-"+ js.state);}
if(!$.isArray(js.data)) {tmp =js.data;js.data =[];js.data.push(tmp);}
$.each(js.data,function (i,m) {tmp =$("<a />");if($.isFunction(m)) {m =m.call(this,js);}
if(typeof m =="string") {tmp.attr('href','#')[t ?"html":"text"](m);}
else {if(!m.attr) {m.attr ={};}
if(!m.attr.href) {m.attr.href ='#';}
tmp.attr(m.attr)[t ?"html":"text"](m.title);if(m.language) {tmp.addClass(m.language);}
}
tmp.prepend("<ins class='jstree-icon'>&#160;</ins>");if(!m.icon &&js.icon) {m.icon =js.icon;}
if(m.icon) {if(m.icon.indexOf("/") ===-1) {tmp.children("ins").addClass(m.icon);}
else {tmp.children("ins").css("background","url('"+ m.icon + "') center center no-repeat");}
}
d.append(tmp);});d.prepend("<ins class='jstree-icon'>&#160;</ins>");if(js.children) {if(s.progressive_render &&js.state !=="open") {d.addClass("jstree-closed").data("jstree_children",js.children);}
else {if(s.progressive_unload) {d.data("jstree_children",js.children);}
if($.isArray(js.children) &&js.children.length) {tmp =this._parse_json(js.children,obj,true);if(tmp.length) {ul2 =$("<ul />");ul2.append(tmp);d.append(ul2);}
}
}
}
}
if(!is_callback) {ul1 =$("<ul />");ul1.append(d);d =ul1;}
return d;},get_json :function (obj,li_attr,a_attr,is_callback) {var result =[],s =this._get_settings(),_this =this,tmp1,tmp2,li,a,t,lang;obj =this._get_node(obj);if(!obj ||obj ===-1) {obj =this.get_container().find("> ul > li");}
li_attr =$.isArray(li_attr) ?li_attr :["id","class"];if(!is_callback &&this.data.types) {li_attr.push(s.types.type_attr);}
a_attr =$.isArray(a_attr) ?a_attr :[];obj.each(function () {li =$(this);tmp1 ={data :[] };if(li_attr.length) {tmp1.attr ={};}
$.each(li_attr,function (i,v) {tmp2 =li.attr(v);if(tmp2 &&tmp2.length &&tmp2.replace(/jstree[^ ]*/ig,'').length) {

tmp1.attr[v] =(" "+ tmp2).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,""); 

}
});if(li.hasClass("jstree-open")) {tmp1.state ="open";}
if(li.hasClass("jstree-closed")) {tmp1.state ="closed";}
if(li.data()) {tmp1.metadata =li.data();}
a =li.children("a");a.each(function () {t =$(this);if(a_attr.length ||$.inArray("languages",s.plugins) !==-1 ||t.children("ins").get(0).style.backgroundImage.length ||(t.children("ins").get(0).className &&t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').length)

) {lang =false;if($.inArray("languages",s.plugins) !==-1 &&$.isArray(s.languages) &&s.languages.length) {$.each(s.languages,function (l,lv) {if(t.hasClass(lv)) {lang =lv;return false;}
});}
tmp2 ={attr :{},title :_this.get_text(t,lang) };$.each(a_attr,function (k,z) {tmp2.attr[z] =(" "+ (t.attr(z) ||"")).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"");

});if($.inArray("languages",s.plugins) !==-1 &&$.isArray(s.languages) &&s.languages.length) {$.each(s.languages,function (k,z) {if(t.hasClass(z)) {tmp2.language =z;return true;}
});}
if(t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/^\s+$/ig,"").length) {

tmp2.icon =t.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"");

}
if(t.children("ins").get(0).style.backgroundImage.length) {tmp2.icon =t.children("ins").get(0).style.backgroundImage.replace("url(","").replace(")","");}
}
else {tmp2 =_this.get_text(t);}
if(a.length > 1) {tmp1.data.push(tmp2);}
else {tmp1.data =tmp2;}
});li =li.find("> ul > li");if(li.length) {tmp1.children =_this.get_json(li,li_attr,a_attr,true);}
result.push(tmp1);});return result;}
}
});})(jQuery);(function ($) {$.jstree.plugin("languages",{__init :function () {this._load_css();},defaults :[],_fn :{set_lang :function (i) {var langs =this._get_settings().languages,st =false,selector =".jstree-"+ this.get_index() + ' a';if(!$.isArray(langs) ||langs.length ===0) {return false;}
if($.inArray(i,langs) ==-1) {if(!!langs[i]) {i =langs[i];}
else {return false;}
}
if(i ==this.data.languages.current_language) {return true;}
st =$.vakata.css.get_css(selector + "."+ this.data.languages.current_language,false,this.data.languages.language_css);if(st !==false) {st.style.display ="none";}
st =$.vakata.css.get_css(selector + "."+ i,false,this.data.languages.language_css);if(st !==false) {st.style.display ="";}
this.data.languages.current_language =i;this.__callback(i);return true;},get_lang :function () {return this.data.languages.current_language;},_get_string :function (key,lang) {var langs =this._get_settings().languages,s =this._get_settings().core.strings;if($.isArray(langs) &&langs.length) {lang =(lang &&$.inArray(lang,langs) !=-1) ?lang :this.data.languages.current_language;}
if(s[lang] &&s[lang][key]) {return s[lang][key];}
if(s[key]) {return s[key];}
return key;},get_text :function (obj,lang) {obj =this._get_node(obj) ||this.data.ui.last_selected;if(!obj.size()) {return false;}
var langs =this._get_settings().languages,s =this._get_settings().core.html_titles;if($.isArray(langs) &&langs.length) {lang =(lang &&$.inArray(lang,langs) !=-1) ?lang :this.data.languages.current_language;obj =obj.children("a."+ lang);}
else {obj =obj.children("a:eq(0)");}
if(s) {obj =obj.clone();obj.children("INS").remove();return obj.html();}
else {obj =obj.contents().filter(function() {return this.nodeType ==3;})[0];return obj.nodeValue;}
},set_text :function (obj,val,lang) {obj =this._get_node(obj) ||this.data.ui.last_selected;if(!obj.size()) {return false;}
var langs =this._get_settings().languages,s =this._get_settings().core.html_titles,tmp;if($.isArray(langs) &&langs.length) {lang =(lang &&$.inArray(lang,langs) !=-1) ?lang :this.data.languages.current_language;obj =obj.children("a."+ lang);}
else {obj =obj.children("a:eq(0)");}
if(s) {tmp =obj.children("INS").clone();obj.html(val).prepend(tmp);this.__callback({"obj":obj,"name":val,"lang":lang });return true;}
else {obj =obj.contents().filter(function() {return this.nodeType ==3;})[0];this.__callback({"obj":obj,"name":val,"lang":lang });return (obj.nodeValue =val);}
},_load_css :function () {var langs =this._get_settings().languages,str ="/* languages css */",selector =".jstree-"+ this.get_index() + ' a',ln;if($.isArray(langs) &&langs.length) {this.data.languages.current_language =langs[0];for(ln =0;ln < langs.length;ln++) {str +=selector + "."+ langs[ln] + " {";if(langs[ln] !=this.data.languages.current_language) {str +=" display:none; ";}
str +=" } ";}
this.data.languages.language_css =$.vakata.css.add_sheet({'str':str,'title':"jstree-languages"});}
},create_node :function (obj,position,js,callback) {var t =this.__call_old(true,obj,position,js,function (t) {var langs =this._get_settings().languages,a =t.children("a"),ln;if($.isArray(langs) &&langs.length) {for(ln =0;ln < langs.length;ln++) {if(!a.is("."+ langs[ln])) {t.append(a.eq(0).clone().removeClass(langs.join(" ")).addClass(langs[ln]));}
}
a.not("."+ langs.join(", .")).remove();}
if(callback) {callback.call(this,t);}
});return t;}
}
});})(jQuery);(function ($) {$.jstree.plugin("cookies",{__init :function () {if(typeof $.cookie ==="undefined") {throw "jsTree cookie: jQuery cookie plugin not included.";}
var s =this._get_settings().cookies,tmp;if(!!s.save_loaded) {tmp =$.cookie(s.save_loaded);if(tmp &&tmp.length) {this.data.core.to_load =tmp.split(",");}
}
if(!!s.save_opened) {tmp =$.cookie(s.save_opened);if(tmp &&tmp.length) {this.data.core.to_open =tmp.split(",");}
}
if(!!s.save_selected) {tmp =$.cookie(s.save_selected);if(tmp &&tmp.length &&this.data.ui) {this.data.ui.to_select =tmp.split(",");}
}
this.get_container()
.one((this.data.ui ?"reselect":"reopen") + ".jstree",$.proxy(function () {this.get_container()
.bind("open_node.jstree close_node.jstree select_node.jstree deselect_node.jstree",$.proxy(function (e) {if(this._get_settings().cookies.auto_save) {this.save_cookie((e.handleObj.namespace + e.handleObj.type).replace("jstree",""));}
},this));},this));},defaults :{save_loaded:"jstree_load",save_opened:"jstree_open",save_selected:"jstree_select",auto_save:true,cookie_options:{}
},_fn :{save_cookie :function (c) {if(this.data.core.refreshing) {return;}
var s =this._get_settings().cookies;if(!c) {if(s.save_loaded) {this.save_loaded();$.cookie(s.save_loaded,this.data.core.to_load.join(","),s.cookie_options);}
if(s.save_opened) {this.save_opened();$.cookie(s.save_opened,this.data.core.to_open.join(","),s.cookie_options);}
if(s.save_selected &&this.data.ui) {this.save_selected();$.cookie(s.save_selected,this.data.ui.to_select.join(","),s.cookie_options);}
return;}
switch(c) {case "open_node":case "close_node":if(!!s.save_opened) {this.save_opened();$.cookie(s.save_opened,this.data.core.to_open.join(","),s.cookie_options);}
if(!!s.save_loaded) {this.save_loaded();$.cookie(s.save_loaded,this.data.core.to_load.join(","),s.cookie_options);}
break;case "select_node":case "deselect_node":if(!!s.save_selected &&this.data.ui) {this.save_selected();$.cookie(s.save_selected,this.data.ui.to_select.join(","),s.cookie_options);}
break;}
}
}
});})(jQuery);(function ($) {$.jstree.plugin("sort",{__init :function () {this.get_container()
.bind("load_node.jstree",$.proxy(function (e,data) {var obj =this._get_node(data.rslt.obj);obj =obj ===-1 ?this.get_container().children("ul") :obj.children("ul");this.sort(obj);},this))
.bind("rename_node.jstree create_node.jstree create.jstree",$.proxy(function (e,data) {this.sort(data.rslt.obj.parent());},this))
.bind("move_node.jstree",$.proxy(function (e,data) {var m =data.rslt.np ==-1 ?this.get_container() :data.rslt.np;this.sort(m.children("ul"));},this));},defaults :function (a,b) {return this.get_text(a) > this.get_text(b) ?1 :-1;},_fn :{sort :function (obj) {var s =this._get_settings().sort,t =this;obj.append($.makeArray(obj.children("li")).sort($.proxy(s,t)));obj.find("> li > ul").each(function() {t.sort($(this));});this.clean_node(obj);}
}
});})(jQuery);(function ($) {var o =false,r =false,m =false,ml =false,sli =false,sti =false,dir1 =false,dir2 =false,last_pos =false;$.vakata.dnd ={is_down :false,is_drag :false,helper :false,scroll_spd :10,init_x :0,init_y :0,threshold :5,helper_left :5,helper_top :10,user_data :{},drag_start :function (e,data,html) {if($.vakata.dnd.is_drag) {$.vakata.drag_stop({});}
try {e.currentTarget.unselectable ="on";e.currentTarget.onselectstart =function() {return false;};if(e.currentTarget.style) {e.currentTarget.style.MozUserSelect ="none";}
} catch(err) {}
$.vakata.dnd.init_x =e.pageX;$.vakata.dnd.init_y =e.pageY;$.vakata.dnd.user_data =data;$.vakata.dnd.is_down =true;$.vakata.dnd.helper =$("<div id='vakata-dragged' />").html(html);$(document).bind("mousemove",$.vakata.dnd.drag);$(document).bind("mouseup",$.vakata.dnd.drag_stop);return false;},drag :function (e) {if(!$.vakata.dnd.is_down) {return;}
if(!$.vakata.dnd.is_drag) {if(Math.abs(e.pageX - $.vakata.dnd.init_x) > 5 ||Math.abs(e.pageY - $.vakata.dnd.init_y) > 5) {$.vakata.dnd.helper.appendTo("body");$.vakata.dnd.is_drag =true;$(document).triggerHandler("drag_start.vakata",{"event":e,"data":$.vakata.dnd.user_data });}
else {return;}
}
if(e.type ==="mousemove") {var d =$(document),t =d.scrollTop(),l =d.scrollLeft();if(e.pageY - t < 20) {if(sti &&dir1 ==="down") {clearInterval(sti);sti =false;}
if(!sti) {dir1 ="up";sti =setInterval(function () {$(document).scrollTop($(document).scrollTop() - $.vakata.dnd.scroll_spd);},150);}
}
else {if(sti &&dir1 ==="up") {clearInterval(sti);sti =false;}
}
if($(window).height() - (e.pageY - t) < 20) {if(sti &&dir1 ==="up") {clearInterval(sti);sti =false;}
if(!sti) {dir1 ="down";sti =setInterval(function () {$(document).scrollTop($(document).scrollTop() + $.vakata.dnd.scroll_spd);},150);}
}
else {if(sti &&dir1 ==="down") {clearInterval(sti);sti =false;}
}
if(e.pageX - l < 20) {if(sli &&dir2 ==="right") {clearInterval(sli);sli =false;}
if(!sli) {dir2 ="left";sli =setInterval(function () {$(document).scrollLeft($(document).scrollLeft() - $.vakata.dnd.scroll_spd);},150);}
}
else {if(sli &&dir2 ==="left") {clearInterval(sli);sli =false;}
}
if($(window).width() - (e.pageX - l) < 20) {if(sli &&dir2 ==="left") {clearInterval(sli);sli =false;}
if(!sli) {dir2 ="right";sli =setInterval(function () {$(document).scrollLeft($(document).scrollLeft() + $.vakata.dnd.scroll_spd);},150);}
}
else {if(sli &&dir2 ==="right") {clearInterval(sli);sli =false;}
}
}
$.vakata.dnd.helper.css({left :(e.pageX + $.vakata.dnd.helper_left) + "px",top :(e.pageY + $.vakata.dnd.helper_top) + "px"});$(document).triggerHandler("drag.vakata",{"event":e,"data":$.vakata.dnd.user_data });},drag_stop :function (e) {if(sli) {clearInterval(sli);}
if(sti) {clearInterval(sti);}
$(document).unbind("mousemove",$.vakata.dnd.drag);$(document).unbind("mouseup",$.vakata.dnd.drag_stop);$(document).triggerHandler("drag_stop.vakata",{"event":e,"data":$.vakata.dnd.user_data });$.vakata.dnd.helper.remove();$.vakata.dnd.init_x =0;$.vakata.dnd.init_y =0;$.vakata.dnd.user_data ={};$.vakata.dnd.is_down =false;$.vakata.dnd.is_drag =false;}
};$(function() {var css_string ='#vakata-dragged { display:block; margin:0 0 0 0; padding:4px 4px 4px 24px; position:absolute; top:-2000px; line-height:16px; z-index:10000; } ';$.vakata.css.add_sheet({str :css_string,title :"vakata"});});$.jstree.plugin("dnd",{__init :function () {this.data.dnd ={active :false,after :false,inside :false,before :false,off :false,prepared :false,w :0,to1 :false,to2 :false,cof :false,cw :false,ch :false,i1 :false,i2 :false,mto :false
};this.get_container()
.bind("mouseenter.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {if(this.data.themes) {m.attr("class","jstree-"+ this.data.themes.theme);if(ml) {ml.attr("class","jstree-"+ this.data.themes.theme);}
$.vakata.dnd.helper.attr("class","jstree-dnd-helper jstree-"+ this.data.themes.theme);}
if(e.currentTarget ===e.target &&$.vakata.dnd.user_data.obj &&$($.vakata.dnd.user_data.obj).length &&$($.vakata.dnd.user_data.obj).parents(".jstree:eq(0)")[0] !==e.target) {var tr =$.jstree._reference(e.target),dc;if(tr.data.dnd.foreign) {dc =tr._get_settings().dnd.drag_check.call(this,{"o":o,"r":tr.get_container(),is_root :true });if(dc ===true ||dc.inside ===true ||dc.before ===true ||dc.after ===true) {$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");}
}
else {tr.prepare_move(o,tr.get_container(),"last");if(tr.check_move()) {$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");}
}
}
}
},this))
.bind("mouseup.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree &&e.currentTarget ===e.target &&$.vakata.dnd.user_data.obj &&$($.vakata.dnd.user_data.obj).length &&$($.vakata.dnd.user_data.obj).parents(".jstree:eq(0)")[0] !==e.target) {var tr =$.jstree._reference(e.currentTarget),dc;if(tr.data.dnd.foreign) {dc =tr._get_settings().dnd.drag_check.call(this,{"o":o,"r":tr.get_container(),is_root :true });if(dc ===true ||dc.inside ===true ||dc.before ===true ||dc.after ===true) {tr._get_settings().dnd.drag_finish.call(this,{"o":o,"r":tr.get_container(),is_root :true });}
}
else {tr.move_node(o,tr.get_container(),"last",e[tr._get_settings().dnd.copy_modifier + "Key"]);}
}
},this))
.bind("mouseleave.jstree",$.proxy(function (e) {if(e.relatedTarget &&e.relatedTarget.id &&e.relatedTarget.id ==="jstree-marker-line") {return false;}
if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {if(this.data.dnd.i1) {clearInterval(this.data.dnd.i1);}
if(this.data.dnd.i2) {clearInterval(this.data.dnd.i2);}
if(this.data.dnd.to1) {clearTimeout(this.data.dnd.to1);}
if(this.data.dnd.to2) {clearTimeout(this.data.dnd.to2);}
if($.vakata.dnd.helper.children("ins").hasClass("jstree-ok")) {$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");}
}
},this))
.bind("mousemove.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {var cnt =this.get_container()[0];if(e.pageX + 24 > this.data.dnd.cof.left + this.data.dnd.cw) {if(this.data.dnd.i1) {clearInterval(this.data.dnd.i1);}
this.data.dnd.i1 =setInterval($.proxy(function () {this.scrollLeft +=$.vakata.dnd.scroll_spd;},cnt),100);}
else if(e.pageX - 24 < this.data.dnd.cof.left) {if(this.data.dnd.i1) {clearInterval(this.data.dnd.i1);}
this.data.dnd.i1 =setInterval($.proxy(function () {this.scrollLeft -=$.vakata.dnd.scroll_spd;},cnt),100);}
else {if(this.data.dnd.i1) {clearInterval(this.data.dnd.i1);}
}
if(e.pageY + 24 > this.data.dnd.cof.top + this.data.dnd.ch) {if(this.data.dnd.i2) {clearInterval(this.data.dnd.i2);}
this.data.dnd.i2 =setInterval($.proxy(function () {this.scrollTop +=$.vakata.dnd.scroll_spd;},cnt),100);}
else if(e.pageY - 24 < this.data.dnd.cof.top) {if(this.data.dnd.i2) {clearInterval(this.data.dnd.i2);}
this.data.dnd.i2 =setInterval($.proxy(function () {this.scrollTop -=$.vakata.dnd.scroll_spd;},cnt),100);}
else {if(this.data.dnd.i2) {clearInterval(this.data.dnd.i2);}
}
}
},this))
.bind("scroll.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree &&m &&ml) {m.hide();ml.hide();}
},this))
.delegate("a","mousedown.jstree",$.proxy(function (e) {if(e.which ===1) {this.start_drag(e.currentTarget,e);return false;}
},this))
.delegate("a","mouseenter.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {this.dnd_enter(e.currentTarget);}
},this))
.delegate("a","mousemove.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {if(!r ||!r.length ||r.children("a")[0] !==e.currentTarget) {this.dnd_enter(e.currentTarget);}
if(typeof this.data.dnd.off.top ==="undefined") {this.data.dnd.off =$(e.target).offset();}
this.data.dnd.w =(e.pageY - (this.data.dnd.off.top ||0)) % this.data.core.li_height;if(this.data.dnd.w < 0) {this.data.dnd.w +=this.data.core.li_height;}
this.dnd_show();}
},this))
.delegate("a","mouseleave.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {if(e.relatedTarget &&e.relatedTarget.id &&e.relatedTarget.id ==="jstree-marker-line") {return false;}
if(m) {m.hide();}
if(ml) {ml.hide();}
this.data.dnd.mto =setTimeout((function (t) {return function () {t.dnd_leave(e);};})(this),0);}
},this))
.delegate("a","mouseup.jstree",$.proxy(function (e) {if($.vakata.dnd.is_drag &&$.vakata.dnd.user_data.jstree) {this.dnd_finish(e);}
},this));$(document)
.bind("drag_stop.vakata",$.proxy(function () {if(this.data.dnd.to1) {clearTimeout(this.data.dnd.to1);}
if(this.data.dnd.to2) {clearTimeout(this.data.dnd.to2);}
if(this.data.dnd.i1) {clearInterval(this.data.dnd.i1);}
if(this.data.dnd.i2) {clearInterval(this.data.dnd.i2);}
this.data.dnd.after=false;this.data.dnd.before=false;this.data.dnd.inside=false;this.data.dnd.off=false;this.data.dnd.prepared=false;this.data.dnd.w=false;this.data.dnd.to1=false;this.data.dnd.to2=false;this.data.dnd.i1=false;this.data.dnd.i2=false;this.data.dnd.active=false;this.data.dnd.foreign=false;if(m) {m.css({"top":"-2000px"});}
if(ml) {ml.css({"top":"-2000px"});}
},this))
.bind("drag_start.vakata",$.proxy(function (e,data) {if(data.data.jstree) {var et =$(data.event.target);if(et.closest(".jstree").hasClass("jstree-"+ this.get_index())) {this.dnd_enter(et);}
}
},this));var s =this._get_settings().dnd;if(s.drag_target) {$(document)
.delegate(s.drag_target,"mousedown.jstree-"+ this.get_index(),$.proxy(function (e) {o =e.target;$.vakata.dnd.drag_start(e,{jstree :true,obj :e.target },"<ins class='jstree-icon'></ins>"+ $(e.target).text() );if(this.data.themes) {if(m) {m.attr("class","jstree-"+ this.data.themes.theme);}
if(ml) {ml.attr("class","jstree-"+ this.data.themes.theme);}
$.vakata.dnd.helper.attr("class","jstree-dnd-helper jstree-"+ this.data.themes.theme);}
$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");var cnt =this.get_container();this.data.dnd.cof =cnt.offset();this.data.dnd.cw =parseInt(cnt.width(),10);this.data.dnd.ch =parseInt(cnt.height(),10);this.data.dnd.foreign =true;e.preventDefault();},this));}
if(s.drop_target) {$(document)
.delegate(s.drop_target,"mouseenter.jstree-"+ this.get_index(),$.proxy(function (e) {if(this.data.dnd.active &&this._get_settings().dnd.drop_check.call(this,{"o":o,"r":$(e.target),"e":e })) {$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");}
},this))
.delegate(s.drop_target,"mouseleave.jstree-"+ this.get_index(),$.proxy(function (e) {if(this.data.dnd.active) {$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");}
},this))
.delegate(s.drop_target,"mouseup.jstree-"+ this.get_index(),$.proxy(function (e) {if(this.data.dnd.active &&$.vakata.dnd.helper.children("ins").hasClass("jstree-ok")) {this._get_settings().dnd.drop_finish.call(this,{"o":o,"r":$(e.target),"e":e });}
},this));}
},defaults :{copy_modifier:"ctrl",check_timeout:100,open_timeout:500,drop_target:".jstree-drop",drop_check:function (data) {return true;},drop_finish:$.noop,drag_target:".jstree-draggable",drag_finish:$.noop,drag_check:function (data) {return {after :false,before :false,inside :true };}
},_fn :{dnd_prepare :function () {if(!r ||!r.length) {return;}
this.data.dnd.off =r.offset();if(this._get_settings().core.rtl) {this.data.dnd.off.right =this.data.dnd.off.left + r.width();}
if(this.data.dnd.foreign) {var a =this._get_settings().dnd.drag_check.call(this,{"o":o,"r":r });this.data.dnd.after =a.after;this.data.dnd.before =a.before;this.data.dnd.inside =a.inside;this.data.dnd.prepared =true;return this.dnd_show();}
this.prepare_move(o,r,"before");this.data.dnd.before =this.check_move();this.prepare_move(o,r,"after");this.data.dnd.after =this.check_move();if(this._is_loaded(r)) {this.prepare_move(o,r,"inside");this.data.dnd.inside =this.check_move();}
else {this.data.dnd.inside =false;}
this.data.dnd.prepared =true;return this.dnd_show();},dnd_show :function () {if(!this.data.dnd.prepared) {return;}
var o =["before","inside","after"],r =false,rtl =this._get_settings().core.rtl,pos;if(this.data.dnd.w < this.data.core.li_height/3) {o =["before","inside","after"];}
else if(this.data.dnd.w <=this.data.core.li_height*2/3) {o =this.data.dnd.w < this.data.core.li_height/2 ?["inside","before","after"] :["inside","after","before"];}
else {o =["after","inside","before"];}
$.each(o,$.proxy(function (i,val) {if(this.data.dnd[val]) {$.vakata.dnd.helper.children("ins").attr("class","jstree-ok");r =val;return false;}
},this));if(r ===false) {$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");}
pos =rtl ?(this.data.dnd.off.right - 18) :(this.data.dnd.off.left + 10);switch(r) {case "before":m.css({"left":pos + "px","top":(this.data.dnd.off.top - 6) + "px"}).show();if(ml) {ml.css({"left":(pos + 8) + "px","top":(this.data.dnd.off.top - 1) + "px"}).show();}
break;case "after":m.css({"left":pos + "px","top":(this.data.dnd.off.top + this.data.core.li_height - 6) + "px"}).show();if(ml) {ml.css({"left":(pos + 8) + "px","top":(this.data.dnd.off.top + this.data.core.li_height - 1) + "px"}).show();}
break;case "inside":m.css({"left":pos + (rtl ?-4 :4) + "px","top":(this.data.dnd.off.top + this.data.core.li_height/2 - 5) + "px"}).show();if(ml) {ml.hide();}
break;default:m.hide();if(ml) {ml.hide();}
break;}
last_pos =r;return r;},dnd_open :function () {this.data.dnd.to2 =false;this.open_node(r,$.proxy(this.dnd_prepare,this),true);},dnd_finish :function (e) {if(this.data.dnd.foreign) {if(this.data.dnd.after ||this.data.dnd.before ||this.data.dnd.inside) {this._get_settings().dnd.drag_finish.call(this,{"o":o,"r":r,"p":last_pos });}
}
else {this.dnd_prepare();this.move_node(o,r,last_pos,e[this._get_settings().dnd.copy_modifier + "Key"]);}
o =false;r =false;m.hide();if(ml) {ml.hide();}
},dnd_enter :function (obj) {if(this.data.dnd.mto) {clearTimeout(this.data.dnd.mto);this.data.dnd.mto =false;}
var s =this._get_settings().dnd;this.data.dnd.prepared =false;r =this._get_node(obj);if(s.check_timeout) {if(this.data.dnd.to1) {clearTimeout(this.data.dnd.to1);}
this.data.dnd.to1 =setTimeout($.proxy(this.dnd_prepare,this),s.check_timeout);}
else {this.dnd_prepare();}
if(s.open_timeout) {if(this.data.dnd.to2) {clearTimeout(this.data.dnd.to2);}
if(r &&r.length &&r.hasClass("jstree-closed")) {this.data.dnd.to2 =setTimeout($.proxy(this.dnd_open,this),s.open_timeout);}
}
else {if(r &&r.length &&r.hasClass("jstree-closed")) {this.dnd_open();}
}
},dnd_leave :function (e) {this.data.dnd.after=false;this.data.dnd.before=false;this.data.dnd.inside=false;$.vakata.dnd.helper.children("ins").attr("class","jstree-invalid");m.hide();if(ml) {ml.hide();}
if(r &&r[0] ===e.target.parentNode) {if(this.data.dnd.to1) {clearTimeout(this.data.dnd.to1);this.data.dnd.to1 =false;}
if(this.data.dnd.to2) {clearTimeout(this.data.dnd.to2);this.data.dnd.to2 =false;}
}
},start_drag :function (obj,e) {o =this._get_node(obj);if(this.data.ui &&this.is_selected(o)) {o =this._get_node(null,true);}
var dt =o.length > 1 ?this._get_string("multiple_selection") :this.get_text(o),cnt =this.get_container();if(!this._get_settings().core.html_titles) {dt =dt.replace(/</ig,"&lt;").replace(/>/ig,"&gt;"); }

$.vakata.dnd.drag_start(e,{jstree :true,obj :o },"<ins class='jstree-icon'></ins>"+ dt );if(this.data.themes) {if(m) {m.attr("class","jstree-"+ this.data.themes.theme);}
if(ml) {ml.attr("class","jstree-"+ this.data.themes.theme);}
$.vakata.dnd.helper.attr("class","jstree-dnd-helper jstree-"+ this.data.themes.theme);}
this.data.dnd.cof =cnt.offset();this.data.dnd.cw =parseInt(cnt.width(),10);this.data.dnd.ch =parseInt(cnt.height(),10);this.data.dnd.active =true;}
}
});$(function() {var css_string =''+ '#vakata-dragged ins { display:block; text-decoration:none; width:16px; height:16px; margin:0 0 0 0; padding:0; position:absolute; top:4px; left:4px; '+ ' -moz-border-radius:4px; border-radius:4px; -webkit-border-radius:4px; '+
'} '+ '#vakata-dragged .jstree-ok { background:green; } '+ '#vakata-dragged .jstree-invalid { background:red; } '+ '#jstree-marker { padding:0; margin:0; font-size:12px; overflow:hidden; height:12px; width:8px; position:absolute; top:-30px; z-index:10001; background-repeat:no-repeat; display:none; background-color:transparent; text-shadow:1px 1px 1px white; color:black; line-height:10px; } '+ '#jstree-marker-line { padding:0; margin:0; line-height:0%; font-size:1px; overflow:hidden; height:1px; width:100px; position:absolute; top:-30px; z-index:10000; background-repeat:no-repeat; display:none; background-color:#456c43; '+ ' cursor:pointer; border:1px solid #eeeeee; border-left:0; -moz-box-shadow: 0px 0px 2px #666; -webkit-box-shadow: 0px 0px 2px #666; box-shadow: 0px 0px 2px #666; '+ ' -moz-border-radius:1px; border-radius:1px; -webkit-border-radius:1px; '+
'}'+ '';$.vakata.css.add_sheet({str :css_string,title :"jstree"});m =$("<div />").attr({id :"jstree-marker"}).hide().html("&raquo;")
.bind("mouseleave mouseenter",function (e) {m.hide();ml.hide();e.preventDefault();e.stopImmediatePropagation();return false;})
.appendTo("body");ml =$("<div />").attr({id :"jstree-marker-line"}).hide()
.bind("mouseup",function (e) {if(r &&r.length) {r.children("a").trigger(e);e.preventDefault();e.stopImmediatePropagation();return false;} })
.bind("mouseleave",function (e) {var rt =$(e.relatedTarget);if(rt.is(".jstree") ||rt.closest(".jstree").length ===0) {if(r &&r.length) {r.children("a").trigger(e);m.hide();ml.hide();e.preventDefault();e.stopImmediatePropagation();return false;}
}
})
.appendTo("body");$(document).bind("drag_start.vakata",function (e,data) {if(data.data.jstree) {m.show();if(ml) {ml.show();} }
});$(document).bind("drag_stop.vakata",function (e,data) {if(data.data.jstree) {m.hide();if(ml) {ml.hide();} }
});});})(jQuery);(function ($) {$.jstree.plugin("checkbox",{__init :function () {this.data.checkbox.noui =this._get_settings().checkbox.override_ui;if(this.data.ui &&this.data.checkbox.noui) {this.select_node =this.deselect_node =this.deselect_all =$.noop;this.get_selected =this.get_checked;}
this.get_container()
.bind("open_node.jstree create_node.jstree clean_node.jstree refresh.jstree",$.proxy(function (e,data) {this._prepare_checkboxes(data.rslt.obj);},this))
.bind("loaded.jstree",$.proxy(function (e) {this._prepare_checkboxes();},this))
.delegate((this.data.ui &&this.data.checkbox.noui ?"a":"ins.jstree-checkbox") ,"click.jstree",$.proxy(function (e) {e.preventDefault();if(this._get_node(e.target).hasClass("jstree-checked")) {this.uncheck_node(e.target);}
else {this.check_node(e.target);}
if(this.data.ui &&this.data.checkbox.noui) {this.save_selected();if(this.data.cookies) {this.save_cookie("select_node");}
}
else {e.stopImmediatePropagation();return false;}
},this));},defaults :{override_ui :false,two_state :false,real_checkboxes :false,checked_parent_open :true,real_checkboxes_names :function (n) {return [("check_"+ (n[0].id ||Math.ceil(Math.random() * 10000))) ,1];}
},__destroy :function () {this.get_container()
.find("input.jstree-real-checkbox").removeClass("jstree-real-checkbox").end()
.find("ins.jstree-checkbox").remove();},_fn :{_checkbox_notify :function (n,data) {if(data.checked) {this.check_node(n,false);}
},_prepare_checkboxes :function (obj) {obj =!obj ||obj ==-1 ?this.get_container().find("> ul > li") :this._get_node(obj);if(obj ===false) {return;} var c,_this =this,t,ts =this._get_settings().checkbox.two_state,rc =this._get_settings().checkbox.real_checkboxes,rcn =this._get_settings().checkbox.real_checkboxes_names;obj.each(function () {t =$(this);c =t.is("li") &&(t.hasClass("jstree-checked") ||(rc &&t.children(":checked").length)) ?"jstree-checked":"jstree-unchecked";t.find("li").andSelf().each(function () {var $t =$(this),nm;$t.children("a"+ (_this.data.languages ?"":":eq(0)") ).not(":has(.jstree-checkbox)").prepend("<ins class='jstree-checkbox'>&#160;</ins>").parent().not(".jstree-checked, .jstree-unchecked").addClass(ts ?"jstree-unchecked":c );if(rc) {if(!$t.children(":checkbox").length) {nm =rcn.call(_this,$t);$t.prepend("<input type='checkbox' class='jstree-real-checkbox' id='"+ nm[0] + "' name='"+ nm[0] + "' value='"+ nm[1] + "' />");}
else {$t.children(":checkbox").addClass("jstree-real-checkbox");}
}
if(!ts) {if(c ==="jstree-checked"||$t.hasClass("jstree-checked") ||$t.children(':checked').length) {$t.find("li").andSelf().addClass("jstree-checked").children(":checkbox").prop("checked",true);}
}
else {if($t.hasClass("jstree-checked") ||$t.children(':checked').length) {$t.addClass("jstree-checked").children(":checkbox").prop("checked",true);}
}
});});if(!ts) {obj.find(".jstree-checked").parent().parent().each(function () {_this._repair_state(this);});}
},change_state :function (obj,state) {obj =this._get_node(obj);var coll =false,rc =this._get_settings().checkbox.real_checkboxes;if(!obj ||obj ===-1) {return false;}
state =(state ===false ||state ===true) ?state :obj.hasClass("jstree-checked");if(this._get_settings().checkbox.two_state) {if(state) {obj.removeClass("jstree-checked").addClass("jstree-unchecked");if(rc) {obj.children(":checkbox").prop("checked",false);}
}
else {obj.removeClass("jstree-unchecked").addClass("jstree-checked");if(rc) {obj.children(":checkbox").prop("checked",true);}
}
}
else {if(state) {coll =obj.find("li").andSelf();if(!coll.filter(".jstree-checked, .jstree-undetermined").length) {return false;}
coll.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");if(rc) {coll.children(":checkbox").prop("checked",false);}
}
else {coll =obj.find("li").andSelf();if(!coll.filter(".jstree-unchecked, .jstree-undetermined").length) {return false;}
coll.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");if(rc) {coll.children(":checkbox").prop("checked",true);}
if(this.data.ui) {this.data.ui.last_selected =obj;}
this.data.checkbox.last_selected =obj;}
obj.parentsUntil(".jstree","li").each(function () {var $this =$(this);if(state) {if($this.children("ul").children("li.jstree-checked, li.jstree-undetermined").length) {$this.parentsUntil(".jstree","li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");if(rc) {$this.parentsUntil(".jstree","li").andSelf().children(":checkbox").prop("checked",false);}
return false;}
else {$this.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");if(rc) {$this.children(":checkbox").prop("checked",false);}
}
}
else {if($this.children("ul").children("li.jstree-unchecked, li.jstree-undetermined").length) {$this.parentsUntil(".jstree","li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");if(rc) {$this.parentsUntil(".jstree","li").andSelf().children(":checkbox").prop("checked",false);}
return false;}
else {$this.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");if(rc) {$this.children(":checkbox").prop("checked",true);}
}
}
});}
if(this.data.ui &&this.data.checkbox.noui) {this.data.ui.selected =this.get_checked();}
this.__callback(obj);return true;},check_node :function (obj) {if(this.change_state(obj,false)) {obj =this._get_node(obj);if(this._get_settings().checkbox.checked_parent_open) {var t =this;obj.parents(".jstree-closed").each(function () {t.open_node(this,false,true);});}
this.__callback({"obj":obj });}
},uncheck_node :function (obj) {if(this.change_state(obj,true)) {this.__callback({"obj":this._get_node(obj) });}
},check_all :function () {var _this =this,coll =this._get_settings().checkbox.two_state ?this.get_container_ul().find("li") :this.get_container_ul().children("li");coll.each(function () {_this.change_state(this,false);});this.__callback();},uncheck_all :function () {var _this =this,coll =this._get_settings().checkbox.two_state ?this.get_container_ul().find("li") :this.get_container_ul().children("li");coll.each(function () {_this.change_state(this,true);});this.__callback();},is_checked :function(obj) {obj =this._get_node(obj);return obj.length ?obj.is(".jstree-checked") :false;},get_checked :function (obj,get_all) {obj =!obj ||obj ===-1 ?this.get_container() :this._get_node(obj);return get_all ||this._get_settings().checkbox.two_state ?obj.find(".jstree-checked") :obj.find("> ul > .jstree-checked, .jstree-undetermined > ul > .jstree-checked");},get_unchecked :function (obj,get_all) {obj =!obj ||obj ===-1 ?this.get_container() :this._get_node(obj);return get_all ||this._get_settings().checkbox.two_state ?obj.find(".jstree-unchecked") :obj.find("> ul > .jstree-unchecked, .jstree-undetermined > ul > .jstree-unchecked");},show_checkboxes :function () {this.get_container().children("ul").removeClass("jstree-no-checkboxes");},hide_checkboxes :function () {this.get_container().children("ul").addClass("jstree-no-checkboxes");},_repair_state :function (obj) {obj =this._get_node(obj);if(!obj.length) {return;}
if(this._get_settings().checkbox.two_state) {obj.find('li').andSelf().not('.jstree-checked').removeClass('jstree-undetermined').addClass('jstree-unchecked').children(':checkbox').prop('checked',true);return;}
var rc =this._get_settings().checkbox.real_checkboxes,a =obj.find("> ul > .jstree-checked").length,b =obj.find("> ul > .jstree-undetermined").length,c =obj.find("> ul > li").length;if(c ===0) {if(obj.hasClass("jstree-undetermined")) {this.change_state(obj,false);} }
else if(a ===0 &&b ===0) {this.change_state(obj,true);}
else if(a ===c) {this.change_state(obj,false);}
else {obj.parentsUntil(".jstree","li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");if(rc) {obj.parentsUntil(".jstree","li").andSelf().children(":checkbox").prop("checked",false);}
}
},reselect :function () {if(this.data.ui &&this.data.checkbox.noui) {var _this =this,s =this.data.ui.to_select;s =$.map($.makeArray(s),function (n) {return "#"+ n.toString().replace(/^#/,"").replace(/\\\//g,"/").replace(/\//g,"\\\/").replace(/\\\./g,".").replace(/\./g,"\\.").replace(/\:/g,"\\:"); });

this.deselect_all();$.each(s,function (i,val) {_this.check_node(val);});this.__callback();}
else {this.__call_old();}
},save_loaded :function () {var _this =this;this.data.core.to_load =[];this.get_container_ul().find("li.jstree-closed.jstree-undetermined").each(function () {if(this.id) {_this.data.core.to_load.push("#"+ this.id);}
});}
}
});$(function() {var css_string ='.jstree .jstree-real-checkbox { display:none; } ';$.vakata.css.add_sheet({str :css_string,title :"jstree"});});})(jQuery);(function ($) {$.vakata.xslt =function (xml,xsl,callback) {var rs ="",xm,xs,processor,support;if(document.recalc) {xm =document.createElement('xml');xs =document.createElement('xml');xm.innerHTML =xml;xs.innerHTML =xsl;$("body").append(xm).append(xs);setTimeout((function (xm,xs,callback) {return function () {callback.call(null,xm.transformNode(xs.XMLDocument));setTimeout((function (xm,xs) {return function () {$(xm).remove();$(xs).remove();};})(xm,xs),200);};})(xm,xs,callback),100);return true;}
if(typeof window.DOMParser !=="undefined"&&typeof window.XMLHttpRequest !=="undefined"&&typeof window.XSLTProcessor ==="undefined") {xml =new DOMParser().parseFromString(xml,"text/xml");xsl =new DOMParser().parseFromString(xsl,"text/xml");}
if(typeof window.DOMParser !=="undefined"&&typeof window.XMLHttpRequest !=="undefined"&&typeof window.XSLTProcessor !=="undefined") {processor =new XSLTProcessor();support =$.isFunction(processor.transformDocument) ?(typeof window.XMLSerializer !=="undefined") :true;if(!support) {return false;}
xml =new DOMParser().parseFromString(xml,"text/xml");xsl =new DOMParser().parseFromString(xsl,"text/xml");if($.isFunction(processor.transformDocument)) {rs =document.implementation.createDocument("","",null);processor.transformDocument(xml,xsl,rs,null);callback.call(null,new XMLSerializer().serializeToString(rs));return true;}
else {processor.importStylesheet(xsl);rs =processor.transformToFragment(xml,document);callback.call(null,$("<div />").append(rs).html());return true;}
}
return false;};var xsl ={'nest':'<'+ '?xml version="1.0" encoding="utf-8" ?>'+ '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >'+ '<xsl:output method="html" encoding="utf-8" omit-xml-declaration="yes" standalone="no" indent="no" media-type="text/html" />'+ '<xsl:template match="/">'+ '<xsl:call-template name="nodes">'+ '<xsl:with-param name="node" select="/root" />'+ '</xsl:call-template>'+ '</xsl:template>'+ '<xsl:template name="nodes">'+ '<xsl:param name="node" />'+ '<ul>'+ '<xsl:for-each select="$node/item">'+ '<xsl:variable name="children" select="count(./item) &gt; 0" />'+ '<li>'+ '<xsl:attribute name="class">'+ '<xsl:if test="position() = last()">jstree-last </xsl:if>'+ '<xsl:choose>'+ '<xsl:when test="@state = \'open\'">jstree-open </xsl:when>'+ '<xsl:when test="$children or @hasChildren or @state = \'closed\'">jstree-closed </xsl:when>'+ '<xsl:otherwise>jstree-leaf </xsl:otherwise>'+ '</xsl:choose>'+ '<xsl:value-of select="@class" />'+ '</xsl:attribute>'+ '<xsl:for-each select="@*">'+ '<xsl:if test="name() != \'class\' and name() != \'state\' and name() != \'hasChildren\'">'+ '<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>'+ '</xsl:if>'+ '</xsl:for-each>'+ '<ins class="jstree-icon"><xsl:text>&#xa0;</xsl:text></ins>'+ '<xsl:for-each select="content/name">'+ '<a>'+ '<xsl:attribute name="href">'+ '<xsl:choose>'+ '<xsl:when test="@href"><xsl:value-of select="@href" /></xsl:when>'+ '<xsl:otherwise>#</xsl:otherwise>'+ '</xsl:choose>'+ '</xsl:attribute>'+ '<xsl:attribute name="class"><xsl:value-of select="@lang" /> <xsl:value-of select="@class" /></xsl:attribute>'+ '<xsl:attribute name="style"><xsl:value-of select="@style" /></xsl:attribute>'+ '<xsl:for-each select="@*">'+ '<xsl:if test="name() != \'style\' and name() != \'class\' and name() != \'href\'">'+ '<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>'+ '</xsl:if>'+ '</xsl:for-each>'+ '<ins>'+ '<xsl:attribute name="class">jstree-icon '+ '<xsl:if test="string-length(attribute::icon) > 0 and not(contains(@icon,\'/\'))"><xsl:value-of select="@icon" /></xsl:if>'+ '</xsl:attribute>'+ '<xsl:if test="string-length(attribute::icon) > 0 and contains(@icon,\'/\')"><xsl:attribute name="style">background:url(<xsl:value-of select="@icon" />) center center no-repeat;</xsl:attribute></xsl:if>'+ '<xsl:text>&#xa0;</xsl:text>'+ '</ins>'+ '<xsl:copy-of select="./child::node()" />'+ '</a>'+ '</xsl:for-each>'+ '<xsl:if test="$children or @hasChildren"><xsl:call-template name="nodes"><xsl:with-param name="node" select="current()" /></xsl:call-template></xsl:if>'+ '</li>'+ '</xsl:for-each>'+ '</ul>'+ '</xsl:template>'+ '</xsl:stylesheet>','flat':'<'+ '?xml version="1.0" encoding="utf-8" ?>'+ '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >'+ '<xsl:output method="html" encoding="utf-8" omit-xml-declaration="yes" standalone="no" indent="no" media-type="text/xml" />'+ '<xsl:template match="/">'+ '<ul>'+ '<xsl:for-each select="//item[not(@parent_id) or @parent_id=0 or not(@parent_id = //item/@id)]">'+ '<xsl:call-template name="nodes">'+ '<xsl:with-param name="node" select="." />'+ '<xsl:with-param name="is_last" select="number(position() = last())" />'+ '</xsl:call-template>'+ '</xsl:for-each>'+ '</ul>'+ '</xsl:template>'+ '<xsl:template name="nodes">'+ '<xsl:param name="node" />'+ '<xsl:param name="is_last" />'+ '<xsl:variable name="children" select="count(//item[@parent_id=$node/attribute::id]) &gt; 0" />'+ '<li>'+ '<xsl:attribute name="class">'+ '<xsl:if test="$is_last = true()">jstree-last </xsl:if>'+ '<xsl:choose>'+ '<xsl:when test="@state = \'open\'">jstree-open </xsl:when>'+ '<xsl:when test="$children or @hasChildren or @state = \'closed\'">jstree-closed </xsl:when>'+ '<xsl:otherwise>jstree-leaf </xsl:otherwise>'+ '</xsl:choose>'+ '<xsl:value-of select="@class" />'+ '</xsl:attribute>'+ '<xsl:for-each select="@*">'+ '<xsl:if test="name() != \'parent_id\' and name() != \'hasChildren\' and name() != \'class\' and name() != \'state\'">'+ '<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>'+ '</xsl:if>'+ '</xsl:for-each>'+ '<ins class="jstree-icon"><xsl:text>&#xa0;</xsl:text></ins>'+ '<xsl:for-each select="content/name">'+ '<a>'+ '<xsl:attribute name="href">'+ '<xsl:choose>'+ '<xsl:when test="@href"><xsl:value-of select="@href" /></xsl:when>'+ '<xsl:otherwise>#</xsl:otherwise>'+ '</xsl:choose>'+ '</xsl:attribute>'+ '<xsl:attribute name="class"><xsl:value-of select="@lang" /> <xsl:value-of select="@class" /></xsl:attribute>'+ '<xsl:attribute name="style"><xsl:value-of select="@style" /></xsl:attribute>'+ '<xsl:for-each select="@*">'+ '<xsl:if test="name() != \'style\' and name() != \'class\' and name() != \'href\'">'+ '<xsl:attribute name="{name()}"><xsl:value-of select="." /></xsl:attribute>'+ '</xsl:if>'+ '</xsl:for-each>'+ '<ins>'+ '<xsl:attribute name="class">jstree-icon '+ '<xsl:if test="string-length(attribute::icon) > 0 and not(contains(@icon,\'/\'))"><xsl:value-of select="@icon" /></xsl:if>'+ '</xsl:attribute>'+ '<xsl:if test="string-length(attribute::icon) > 0 and contains(@icon,\'/\')"><xsl:attribute name="style">background:url(<xsl:value-of select="@icon" />) center center no-repeat;</xsl:attribute></xsl:if>'+ '<xsl:text>&#xa0;</xsl:text>'+ '</ins>'+ '<xsl:copy-of select="./child::node()" />'+ '</a>'+ '</xsl:for-each>'+ '<xsl:if test="$children">'+ '<ul>'+ '<xsl:for-each select="//item[@parent_id=$node/attribute::id]">'+ '<xsl:call-template name="nodes">'+ '<xsl:with-param name="node" select="." />'+ '<xsl:with-param name="is_last" select="number(position() = last())" />'+ '</xsl:call-template>'+ '</xsl:for-each>'+ '</ul>'+ '</xsl:if>'+ '</li>'+ '</xsl:template>'+ '</xsl:stylesheet>'},escape_xml =function(string) {return string
.toString()
.replace(/&/g, '&amp;')

.replace(/</g, '&lt;')

.replace(/>/g, '&gt;')

.replace(/"/g, '&quot;')

.replace(/'/g, '&apos;');

};$.jstree.plugin("xml_data",{defaults :{data :false,ajax :false,xsl :"flat",clean_node :false,correct_state :true,get_skip_empty :false,get_include_preamble :true
},_fn :{load_node :function (obj,s_call,e_call) {var _this =this;this.load_node_xml(obj,function () {_this.__callback({"obj":_this._get_node(obj) });s_call.call(this);},e_call);},_is_loaded :function (obj) {var s =this._get_settings().xml_data;obj =this._get_node(obj);return obj ==-1 ||!obj ||(!s.ajax &&!$.isFunction(s.data)) ||obj.is(".jstree-open, .jstree-leaf") ||obj.children("ul").children("li").size() > 0;},load_node_xml :function (obj,s_call,e_call) {var s =this.get_settings().xml_data,error_func =function () {},success_func =function () {};obj =this._get_node(obj);if(obj &&obj !==-1) {if(obj.data("jstree_is_loading")) {return;}
else {obj.data("jstree_is_loading",true);}
}
switch(!0) {case (!s.data &&!s.ajax):throw "Neither data nor ajax settings supplied.";case ($.isFunction(s.data)):s.data.call(this,obj,$.proxy(function (d) {this.parse_xml(d,$.proxy(function (d) {if(d) {d =d.replace(/ ?xmlns="[^"]*"/ig, "");

if(d.length > 10) {d =$(d);if(obj ===-1 ||!obj) {this.get_container().children("ul").empty().append(d.children());}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.append(d);obj.removeData("jstree_is_loading");}
if(s.clean_node) {this.clean_node(obj);}
if(s_call) {s_call.call(this);}
}
else {if(obj &&obj !==-1) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);if(s_call) {s_call.call(this);} }
}
else {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);} }
}
}
}
},this));},this));break;case (!!s.data &&!s.ajax) ||(!!s.data &&!!s.ajax &&(!obj ||obj ===-1)):if(!obj ||obj ==-1) {this.parse_xml(s.data,$.proxy(function (d) {if(d) {d =d.replace(/ ?xmlns="[^"]*"/ig, "");

if(d.length > 10) {d =$(d);this.get_container().children("ul").empty().append(d.children());if(s.clean_node) {this.clean_node(obj);}
if(s_call) {s_call.call(this);}
}
}
else {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);}
}
}
},this));}
break;case (!s.data &&!!s.ajax) ||(!!s.data &&!!s.ajax &&obj &&obj !==-1):error_func =function (x,t,e) {var ef =this.get_settings().xml_data.ajax.error;if(ef) {ef.call(this,x,t,e);}
if(obj !==-1 &&obj.length) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(t ==="success"&&s.correct_state) {this.correct_state(obj);}
}
else {if(t ==="success"&&s.correct_state) {this.get_container().children("ul").empty();}
}
if(e_call) {e_call.call(this);}
};success_func =function (d,t,x) {d =x.responseText;var sf =this.get_settings().xml_data.ajax.success;if(sf) {d =sf.call(this,d,t,x) ||d;}
if(d ===""||(d &&d.toString &&d.toString().replace(/^[\s\n]+$/,"") === "")) {

return error_func.call(this,x,t,"");}
this.parse_xml(d,$.proxy(function (d) {if(d) {d =d.replace(/ ?xmlns="[^"]*"/ig, "");

if(d.length > 10) {d =$(d);if(obj ===-1 ||!obj) {this.get_container().children("ul").empty().append(d.children());}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.append(d);obj.removeData("jstree_is_loading");}
if(s.clean_node) {this.clean_node(obj);}
if(s_call) {s_call.call(this);}
}
else {if(obj &&obj !==-1) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);if(s_call) {s_call.call(this);} }
}
else {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);} }
}
}
}
},this));};s.ajax.context =this;s.ajax.error =error_func;s.ajax.success =success_func;if(!s.ajax.dataType) {s.ajax.dataType ="xml";}
if($.isFunction(s.ajax.url)) {s.ajax.url =s.ajax.url.call(this,obj);}
if($.isFunction(s.ajax.data)) {s.ajax.data =s.ajax.data.call(this,obj);}
$.ajax(s.ajax);break;}
},parse_xml :function (xml,callback) {var s =this._get_settings().xml_data;$.vakata.xslt(xml,xsl[s.xsl],callback);},get_xml :function (tp,obj,li_attr,a_attr,is_callback) {var result ="",s =this._get_settings(),_this =this,tmp1,tmp2,li,a,lang;if(!tp) {tp ="flat";}
if(!is_callback) {is_callback =0;}
obj =this._get_node(obj);if(!obj ||obj ===-1) {obj =this.get_container().find("> ul > li");}
li_attr =$.isArray(li_attr) ?li_attr :["id","class"];if(!is_callback &&this.data.types &&$.inArray(s.types.type_attr,li_attr) ===-1) {li_attr.push(s.types.type_attr);}
a_attr =$.isArray(a_attr) ?a_attr :[];if(!is_callback) {if(s.xml_data.get_include_preamble) {result +='<'+ '?xml version="1.0" encoding="UTF-8"?'+ '>';}
result +="<root>";}
obj.each(function () {result +="<item";li =$(this);$.each(li_attr,function (i,v) {var t =li.attr(v);if(!s.xml_data.get_skip_empty ||typeof t !=="undefined") {result +=" "+ v + "=\"" + escape_xml(("" + (t || "")).replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig,"").replace(/^ /,"").replace(/ $/,"")) + "\"";}
});if(li.hasClass("jstree-open")) {result +=" state=\"open\"";}
if(li.hasClass("jstree-closed")) {result +=" state=\"closed\"";}
if(tp ==="flat") {result +=" parent_id=\"" + escape_xml(is_callback) + "\"";}
result +=">";result +="<content>";a =li.children("a");a.each(function () {tmp1 =$(this);lang =false;result +="<name";if($.inArray("languages",s.plugins) !==-1) {$.each(s.languages,function (k,z) {if(tmp1.hasClass(z)) {result +=" lang=\"" + escape_xml(z) + "\"";lang =z;return false;}
});}
if(a_attr.length) {$.each(a_attr,function (k,z) {var t =tmp1.attr(z);if(!s.xml_data.get_skip_empty ||typeof t !=="undefined") {result +=" "+ z + "=\"" + escape_xml(("" + t || "").replace(/ jstree[^ ]*/ig,'').replace(/\s+$/ig,"").replace(/^ /,"").replace(/ $/,"")) + "\"";}
});}
if(tmp1.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/^\s+$/ig,"").length) {

result +=' icon="'+ escape_xml(tmp1.children("ins").get(0).className.replace(/jstree[^ ]*|$/ig,'').replace(/\s+$/ig," ").replace(/^ /,"").replace(/ $/,"")) + '"';

}
if(tmp1.children("ins").get(0).style.backgroundImage.length) {result +=' icon="'+ escape_xml(tmp1.children("ins").get(0).style.backgroundImage.replace("url(","").replace(")","").replace(/'/ig,"").replace(/"/ig,"")) + '"';

}
result +=">";result +="<![CDATA["+ _this.get_text(tmp1,lang) + "]]>";result +="</name>";});result +="</content>";tmp2 =li[0].id ||true;li =li.find("> ul > li");if(li.length) {tmp2 =_this.get_xml(tp,li,li_attr,a_attr,tmp2);}
else {tmp2 ="";}
if(tp =="nest") {result +=tmp2;}
result +="</item>";if(tp =="flat") {result +=tmp2;}
});if(!is_callback) {result +="</root>";}
return result;}
}
});})(jQuery);(function ($) {$.expr[':'].jstree_contains =function(a,i,m){return (a.textContent ||a.innerText ||"").toLowerCase().indexOf(m[3].toLowerCase())>=0;};$.expr[':'].jstree_title_contains =function(a,i,m) {return (a.getAttribute("title") ||"").toLowerCase().indexOf(m[3].toLowerCase())>=0;};$.jstree.plugin("search",{__init :function () {this.data.search.str ="";this.data.search.result =$();if(this._get_settings().search.show_only_matches) {this.get_container()
.bind("search.jstree",function (e,data) {$(this).children("ul").find("li").hide().removeClass("jstree-last");data.rslt.nodes.parentsUntil(".jstree").andSelf().show()
.filter("ul").each(function () {$(this).children("li:visible").eq(-1).addClass("jstree-last");});})
.bind("clear_search.jstree",function () {$(this).children("ul").find("li").css("display","").end().end().jstree("clean_node",-1);});}
},defaults :{ajax :false,search_method :"jstree_contains",show_only_matches :false
},_fn :{search :function (str,skip_async) {if($.trim(str) ==="") {this.clear_search();return;}
var s =this.get_settings().search,t =this,error_func =function () {},success_func =function () {};this.data.search.str =str;if(!skip_async &&s.ajax !==false &&this.get_container_ul().find("li.jstree-closed:not(:has(ul)):eq(0)").length > 0) {this.search.supress_callback =true;error_func =function () {};success_func =function (d,t,x) {var sf =this.get_settings().search.ajax.success;if(sf) {d =sf.call(this,d,t,x) ||d;}
this.data.search.to_open =d;this._search_open();};s.ajax.context =this;s.ajax.error =error_func;s.ajax.success =success_func;if($.isFunction(s.ajax.url)) {s.ajax.url =s.ajax.url.call(this,str);}
if($.isFunction(s.ajax.data)) {s.ajax.data =s.ajax.data.call(this,str);}
if(!s.ajax.data) {s.ajax.data ={"search_string":str };}
if(!s.ajax.dataType ||/^json/.exec(s.ajax.dataType)) { s.ajax.dataType = "json"; }

$.ajax(s.ajax);return;}
if(this.data.search.result.length) {this.clear_search();}
this.data.search.result =this.get_container().find("a"+ (this.data.languages ?"."+ this.get_lang() :"") + ":"+ (s.search_method) + "("+ this.data.search.str + ")");this.data.search.result.addClass("jstree-search").parent().parents(".jstree-closed").each(function () {t.open_node(this,false,true);});this.__callback({nodes :this.data.search.result,str :str });},clear_search :function (str) {this.data.search.result.removeClass("jstree-search");this.__callback(this.data.search.result);this.data.search.result =$();},_search_open :function (is_callback) {var _this =this,done =true,current =[],remaining =[];if(this.data.search.to_open.length) {$.each(this.data.search.to_open,function (i,val) {if(val =="#") {return true;}
if($(val).length &&$(val).is(".jstree-closed")) {current.push(val);}
else {remaining.push(val);}
});if(current.length) {this.data.search.to_open =remaining;$.each(current,function (i,val) {_this.open_node(val,function () {_this._search_open(true);});});done =false;}
}
if(done) {this.search(this.data.search.str,true);}
}
}
});})(jQuery);(function ($) {$.vakata.context ={hide_on_mouseleave :false,cnt:$("<div id='vakata-contextmenu' />"),vis:false,tgt:false,par:false,func:false,data:false,rtl:false,show:function (s,t,x,y,d,p,rtl) {$.vakata.context.rtl =!!rtl;var html =$.vakata.context.parse(s),h,w;if(!html) {return;}
$.vakata.context.vis =true;$.vakata.context.tgt =t;$.vakata.context.par =p ||t ||null;$.vakata.context.data =d ||null;$.vakata.context.cnt
.html(html)
.css({"visibility":"hidden","display":"block","left":0,"top":0 });if($.vakata.context.hide_on_mouseleave) {$.vakata.context.cnt
.one("mouseleave",function(e) {$.vakata.context.hide();});}
h =$.vakata.context.cnt.height();w =$.vakata.context.cnt.width();if(x + w > $(document).width()) {x =$(document).width() - (w + 5);$.vakata.context.cnt.find("li > ul").addClass("right");}
if(y + h > $(document).height()) {y =y - (h + t[0].offsetHeight);$.vakata.context.cnt.find("li > ul").addClass("bottom");}
$.vakata.context.cnt
.css({"left":x,"top":y })
.find("li:has(ul)")
.bind("mouseenter",function (e) {var w =$(document).width(),h =$(document).height(),ul =$(this).children("ul").show();if(w !==$(document).width()) {ul.toggleClass("right");}
if(h !==$(document).height()) {ul.toggleClass("bottom");}
})
.bind("mouseleave",function (e) {$(this).children("ul").hide();})
.end()
.css({"visibility":"visible"})
.show();$(document).triggerHandler("context_show.vakata");},hide:function () {$.vakata.context.vis =false;$.vakata.context.cnt.attr("class","").css({"visibility":"hidden"});$(document).triggerHandler("context_hide.vakata");},parse:function (s,is_callback) {if(!s) {return false;}
var str ="",tmp =false,was_sep =true;if(!is_callback) {$.vakata.context.func ={};}
str +="<ul>";$.each(s,function (i,val) {if(!val) {return true;}
$.vakata.context.func[i] =val.action;if(!was_sep &&val.separator_before) {str +="<li class='vakata-separator vakata-separator-before'></li>";}
was_sep =false;str +="<li class='"+ (val._class ||"") + (val._disabled ?" jstree-contextmenu-disabled ":"") + "'><ins ";if(val.icon &&val.icon.indexOf("/") ===-1) {str +=" class='"+ val.icon + "' ";}
if(val.icon &&val.icon.indexOf("/") !==-1) {str +=" style='background:url("+ val.icon + ") center center no-repeat;' ";}
str +=">&#160;</ins><a href='#' rel='"+ i + "'>";if(val.submenu) {str +="<span style='float:"+ ($.vakata.context.rtl ?"left":"right") + ";'>&raquo;</span>";}
str +=val.label + "</a>";if(val.submenu) {tmp =$.vakata.context.parse(val.submenu,true);if(tmp) {str +=tmp;}
}
str +="</li>";if(val.separator_after) {str +="<li class='vakata-separator vakata-separator-after'></li>";was_sep =true;}
});str =str.replace(/<li class\='vakata-separator vakata-separator-after'\><\/li\>$/,"");

str +="</ul>";$(document).triggerHandler("context_parse.vakata");return str.length > 10 ?str :false;},exec:function (i) {if($.isFunction($.vakata.context.func[i])) {$.vakata.context.func[i].call($.vakata.context.data,$.vakata.context.par);return true;}
else {return false;}
}
};$(function () {var css_string =''+ '#vakata-contextmenu { display:block; visibility:hidden; left:0; top:-200px; position:absolute; margin:0; padding:0; min-width:180px; background:#ebebeb; border:1px solid silver; z-index:10000; *width:180px; } '+ '#vakata-contextmenu ul { min-width:180px; *width:180px; } '+ '#vakata-contextmenu ul, #vakata-contextmenu li { margin:0; padding:0; list-style-type:none; display:block; } '+ '#vakata-contextmenu li { line-height:20px; min-height:20px; position:relative; padding:0px; } '+ '#vakata-contextmenu li a { padding:1px 6px; line-height:17px; display:block; text-decoration:none; margin:1px 1px 0 1px; } '+ '#vakata-contextmenu li ins { float:left; width:16px; height:16px; text-decoration:none; margin-right:2px; } '+ '#vakata-contextmenu li a:hover, #vakata-contextmenu li.vakata-hover > a { background:gray; color:white; } '+ '#vakata-contextmenu li ul { display:none; position:absolute; top:-2px; left:100%; background:#ebebeb; border:1px solid gray; } '+ '#vakata-contextmenu .right { right:100%; left:auto; } '+ '#vakata-contextmenu .bottom { bottom:-1px; top:auto; } '+ '#vakata-contextmenu li.vakata-separator { min-height:0; height:1px; line-height:1px; font-size:1px; overflow:hidden; margin:0 2px; background:silver; /* border-top:1px solid #fefefe; */ padding:0; } ';$.vakata.css.add_sheet({str :css_string,title :"vakata"});$.vakata.context.cnt
.delegate("a","click",function (e) {e.preventDefault();})
.delegate("a","mouseup",function (e) {if(!$(this).parent().hasClass("jstree-contextmenu-disabled") &&$.vakata.context.exec($(this).attr("rel"))) {$.vakata.context.hide();}
else {$(this).blur();}
})
.delegate("a","mouseover",function () {$.vakata.context.cnt.find(".vakata-hover").removeClass("vakata-hover");})
.appendTo("body");$(document).bind("mousedown",function (e) {if($.vakata.context.vis &&!$.contains($.vakata.context.cnt[0],e.target)) {$.vakata.context.hide();} });if(typeof $.hotkeys !=="undefined") {$(document)
.bind("keydown","up",function (e) {if($.vakata.context.vis) {var o =$.vakata.context.cnt.find("ul:visible").last().children(".vakata-hover").removeClass("vakata-hover").prevAll("li:not(.vakata-separator)").first();if(!o.length) {o =$.vakata.context.cnt.find("ul:visible").last().children("li:not(.vakata-separator)").last();}
o.addClass("vakata-hover");e.stopImmediatePropagation();e.preventDefault();} })
.bind("keydown","down",function (e) {if($.vakata.context.vis) {var o =$.vakata.context.cnt.find("ul:visible").last().children(".vakata-hover").removeClass("vakata-hover").nextAll("li:not(.vakata-separator)").first();if(!o.length) {o =$.vakata.context.cnt.find("ul:visible").last().children("li:not(.vakata-separator)").first();}
o.addClass("vakata-hover");e.stopImmediatePropagation();e.preventDefault();} })
.bind("keydown","right",function (e) {if($.vakata.context.vis) {$.vakata.context.cnt.find(".vakata-hover").children("ul").show().children("li:not(.vakata-separator)").removeClass("vakata-hover").first().addClass("vakata-hover");e.stopImmediatePropagation();e.preventDefault();} })
.bind("keydown","left",function (e) {if($.vakata.context.vis) {$.vakata.context.cnt.find(".vakata-hover").children("ul").hide().children(".vakata-separator").removeClass("vakata-hover");e.stopImmediatePropagation();e.preventDefault();} })
.bind("keydown","esc",function (e) {$.vakata.context.hide();e.preventDefault();})
.bind("keydown","space",function (e) {$.vakata.context.cnt.find(".vakata-hover").last().children("a").click();e.preventDefault();});}
});$.jstree.plugin("contextmenu",{__init :function () {this.get_container()
.delegate("a","contextmenu.jstree",$.proxy(function (e) {e.preventDefault();if(!$(e.currentTarget).hasClass("jstree-loading")) {this.show_contextmenu(e.currentTarget,e.pageX,e.pageY);}
},this))
.delegate("a","click.jstree",$.proxy(function (e) {if(this.data.contextmenu) {$.vakata.context.hide();}
},this))
.bind("destroy.jstree",$.proxy(function () {if(this.data.contextmenu) {$.vakata.context.hide();}
},this));$(document).bind("context_hide.vakata",$.proxy(function () {this.data.contextmenu =false;},this));},defaults :{select_node :false,show_at_node :true,items :{"create":{"separator_before":false,"separator_after":true,"label":"Create","action":function (obj) {this.create(obj);}
},"rename":{"separator_before":false,"separator_after":false,"label":"Rename","action":function (obj) {this.rename(obj);}
},"remove":{"separator_before":false,"icon":false,"separator_after":false,"label":"Delete","action":function (obj) {if(this.is_selected(obj)) {this.remove();} else {this.remove(obj);} }
},"ccp":{"separator_before":true,"icon":false,"separator_after":false,"label":"Edit","action":false,"submenu":{"cut":{"separator_before":false,"separator_after":false,"label":"Cut","action":function (obj) {this.cut(obj);}
},"copy":{"separator_before":false,"icon":false,"separator_after":false,"label":"Copy","action":function (obj) {this.copy(obj);}
},"paste":{"separator_before":false,"icon":false,"separator_after":false,"label":"Paste","action":function (obj) {this.paste(obj);}
}
}
}
}
},_fn :{show_contextmenu :function (obj,x,y) {obj =this._get_node(obj);var s =this.get_settings().contextmenu,a =obj.children("a:visible:eq(0)"),o =false,i =false;if(s.select_node &&this.data.ui &&!this.is_selected(obj)) {this.deselect_all();this.select_node(obj,true);}
if(s.show_at_node ||typeof x ==="undefined"||typeof y ==="undefined") {o =a.offset();x =o.left;y =o.top + this.data.core.li_height;}
i =obj.data("jstree") &&obj.data("jstree").contextmenu ?obj.data("jstree").contextmenu :s.items;if($.isFunction(i)) {i =i.call(this,obj);}
this.data.contextmenu =true;$.vakata.context.show(i,a,x,y,this,obj,this._get_settings().core.rtl);if(this.data.themes) {$.vakata.context.cnt.attr("class","jstree-"+ this.data.themes.theme + "-context");}
}
}
});})(jQuery);(function ($) {$.jstree.plugin("types",{__init :function () {var s =this._get_settings().types;this.data.types.attach_to =[];this.get_container()
.bind("init.jstree",$.proxy(function () {var types =s.types,attr =s.type_attr,icons_css ="",_this =this;$.each(types,function (i,tp) {$.each(tp,function (k,v) {if(!/^(max_depth|max_children|icon|valid_children)$/.test(k)) { _this.data.types.attach_to.push(k); }

});if(!tp.icon) {return true;}
if(tp.icon.image ||tp.icon.position) {if(i =="default"){icons_css +='.jstree-'+ _this.get_index() + ' a > .jstree-icon { ';}
else{icons_css +='.jstree-'+ _this.get_index() + ' li['+ attr + '="'+ i + '"] > a > .jstree-icon { ';}
if(tp.icon.image){icons_css +=' background-image:url('+ tp.icon.image + '); ';}
if(tp.icon.position){icons_css +=' background-position:'+ tp.icon.position + '; ';}
else{icons_css +=' background-position:0 0; ';}
icons_css +='} ';}
});if(icons_css !=="") {$.vakata.css.add_sheet({'str':icons_css,title :"jstree-types"});}
},this))
.bind("before.jstree",$.proxy(function (e,data) {var s,t,o =this._get_settings().types.use_data ?this._get_node(data.args[0]) :false,d =o &&o !==-1 &&o.length ?o.data("jstree") :false;if(d &&d.types &&d.types[data.func] ===false) {e.stopImmediatePropagation();return false;}
if($.inArray(data.func,this.data.types.attach_to) !==-1) {if(!data.args[0] ||(!data.args[0].tagName &&!data.args[0].jquery)) {return;}
s =this._get_settings().types.types;t =this._get_type(data.args[0]);if(((s[t] &&typeof s[t][data.func] !=="undefined") ||(s["default"] &&typeof s["default"][data.func] !=="undefined") ) &&this._check(data.func,data.args[0]) ===false
) {e.stopImmediatePropagation();return false;}
}
},this));if(is_ie6 ||($.browser.msie &&($.browser.version ==9)) ) {this.get_container()
.bind("load_node.jstree set_type.jstree",$.proxy(function (e,data) {var r =data &&data.rslt &&data.rslt.obj &&data.rslt.obj !==-1 ?this._get_node(data.rslt.obj).parent() :this.get_container_ul(),c =false,s =this._get_settings().types;$.each(s.types,function (i,tp) {if(tp.icon &&(tp.icon.image ||tp.icon.position)) {c =i ==="default"?r.find("li > a > .jstree-icon") :r.find("li["+ s.type_attr + "='"+ i + "'] > a > .jstree-icon");if(tp.icon.image) {c.css("backgroundImage","url("+ tp.icon.image + ")");}
c.css("backgroundPosition",tp.icon.position ||"0 0");}
});},this));}
},defaults :{max_children:-1,max_depth:-1,valid_children:"all",use_data :false,type_attr :"rel",types :{"default":{"max_children":-1,"max_depth":-1,"valid_children":"all"}
}
},_fn :{_types_notify :function (n,data) {if(data.type &&this._get_settings().types.use_data) {this.set_type(data.type,n);}
},_get_type :function (obj) {obj =this._get_node(obj);return (!obj ||!obj.length) ?false :obj.attr(this._get_settings().types.type_attr) ||"default";},set_type :function (str,obj) {obj =this._get_node(obj);var ret =(!obj.length ||!str) ?false :obj.attr(this._get_settings().types.type_attr,str);if(ret) {this.__callback({obj :obj,type :str});}
return ret;},_check :function (rule,obj,opts) {obj =this._get_node(obj);var v =false,t =this._get_type(obj),d =0,_this =this,s =this._get_settings().types,data =false;if(obj ===-1) {if(!!s[rule]) {v =s[rule];}
else {return;}
}
else {if(t ===false) {return;}
data =s.use_data ?obj.data("jstree") :false;if(data &&data.types &&typeof data.types[rule] !=="undefined") {v =data.types[rule];}
else if(!!s.types[t] &&typeof s.types[t][rule] !=="undefined") {v =s.types[t][rule];}
else if(!!s.types["default"] &&typeof s.types["default"][rule] !=="undefined") {v =s.types["default"][rule];}
}
if($.isFunction(v)) {v =v.call(this,obj);}
if(rule ==="max_depth"&&obj !==-1 &&opts !==false &&s.max_depth !==-2 &&v !==0) {obj.children("a:eq(0)").parentsUntil(".jstree","li").each(function (i) {if(s.max_depth !==-1 &&s.max_depth - (i + 1) <=0) {v =0;return false;}
d =(i ===0) ?v :_this._check(rule,this,false);if(d !==-1 &&d - (i + 1) <=0) {v =0;return false;}
if(d >=0 &&(d - (i + 1) < v ||v < 0) ) {v =d - (i + 1);}
if(s.max_depth >=0 &&(s.max_depth - (i + 1) < v ||v < 0) ) {v =s.max_depth - (i + 1);}
});}
return v;},check_move :function () {if(!this.__call_old()) {return false;}
var m =this._get_move(),s =m.rt._get_settings().types,mc =m.rt._check("max_children",m.cr),md =m.rt._check("max_depth",m.cr),vc =m.rt._check("valid_children",m.cr),ch =0,d =1,t;if(vc ==="none") {return false;} if($.isArray(vc) &&m.ot &&m.ot._get_type) {m.o.each(function () {if($.inArray(m.ot._get_type(this),vc) ===-1) {d =false;return false;}
});if(d ===false) {return false;}
}
if(s.max_children !==-2 &&mc !==-1) {ch =m.cr ===-1 ?this.get_container().find("> ul > li").not(m.o).length :m.cr.find("> ul > li").not(m.o).length;if(ch + m.o.length > mc) {return false;}
}
if(s.max_depth !==-2 &&md !==-1) {d =0;if(md ===0) {return false;}
if(typeof m.o.d ==="undefined") {t =m.o;while(t.length > 0) {t =t.find("> ul > li");d ++;}
m.o.d =d;}
if(md - m.o.d < 0) {return false;}
}
return true;},create_node :function (obj,position,js,callback,is_loaded,skip_check) {if(!skip_check &&(is_loaded ||this._is_loaded(obj))) {var p =(typeof position =="string"&&position.match(/^before|after$/i) && obj !== -1) ? this._get_parent(obj) : this._get_node(obj),

s =this._get_settings().types,mc =this._check("max_children",p),md =this._check("max_depth",p),vc =this._check("valid_children",p),ch;if(typeof js ==="string") {js ={data :js };}
if(!js) {js ={};}
if(vc ==="none") {return false;} if($.isArray(vc)) {if(!js.attr ||!js.attr[s.type_attr]) {if(!js.attr) {js.attr ={};}
js.attr[s.type_attr] =vc[0];}
else {if($.inArray(js.attr[s.type_attr],vc) ===-1) {return false;}
}
}
if(s.max_children !==-2 &&mc !==-1) {ch =p ===-1 ?this.get_container().find("> ul > li").length :p.find("> ul > li").length;if(ch + 1 > mc) {return false;}
}
if(s.max_depth !==-2 &&md !==-1 &&(md - 1) < 0) {return false;}
}
return this.__call_old(true,obj,position,js,callback,is_loaded,skip_check);}
}
});})(jQuery);(function ($) {$.jstree.plugin("html_data",{__init :function () {this.data.html_data.original_container_html =this.get_container().find(" > ul > li").clone(true);this.data.html_data.original_container_html.find("li").andSelf().contents().filter(function() {return this.nodeType ==3;}).remove();},defaults :{data :false,ajax :false,correct_state :true
},_fn :{load_node :function (obj,s_call,e_call) {var _this =this;this.load_node_html(obj,function () {_this.__callback({"obj":_this._get_node(obj) });s_call.call(this);},e_call);},_is_loaded :function (obj) {obj =this._get_node(obj);return obj ==-1 ||!obj ||(!this._get_settings().html_data.ajax &&!$.isFunction(this._get_settings().html_data.data)) ||obj.is(".jstree-open, .jstree-leaf") ||obj.children("ul").children("li").size() > 0;},load_node_html :function (obj,s_call,e_call) {var d,s =this.get_settings().html_data,error_func =function () {},success_func =function () {};obj =this._get_node(obj);if(obj &&obj !==-1) {if(obj.data("jstree_is_loading")) {return;}
else {obj.data("jstree_is_loading",true);}
}
switch(!0) {case ($.isFunction(s.data)):s.data.call(this,obj,$.proxy(function (d) {if(d &&d !==""&&d.toString &&d.toString().replace(/^[\s\n]+$/,"") !== "") {

d =$(d);if(!d.is("ul")) {d =$("<ul />").append(d);}
if(obj ==-1 ||!obj) {this.get_container().children("ul").empty().append(d.children()).find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.append(d).children("ul").find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");obj.removeData("jstree_is_loading");}
this.clean_node(obj);if(s_call) {s_call.call(this);}
}
else {if(obj &&obj !==-1) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);if(s_call) {s_call.call(this);} }
}
else {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);} }
}
}
},this));break;case (!s.data &&!s.ajax):if(!obj ||obj ==-1) {this.get_container()
.children("ul").empty()
.append(this.data.html_data.original_container_html)
.find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end()
.filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");this.clean_node();}
if(s_call) {s_call.call(this);}
break;case (!!s.data &&!s.ajax) ||(!!s.data &&!!s.ajax &&(!obj ||obj ===-1)):if(!obj ||obj ==-1) {d =$(s.data);if(!d.is("ul")) {d =$("<ul />").append(d);}
this.get_container()
.children("ul").empty().append(d.children())
.find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end()
.filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");this.clean_node();}
if(s_call) {s_call.call(this);}
break;case (!s.data &&!!s.ajax) ||(!!s.data &&!!s.ajax &&obj &&obj !==-1):obj =this._get_node(obj);error_func =function (x,t,e) {var ef =this.get_settings().html_data.ajax.error;if(ef) {ef.call(this,x,t,e);}
if(obj !=-1 &&obj.length) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(t ==="success"&&s.correct_state) {this.correct_state(obj);}
}
else {if(t ==="success"&&s.correct_state) {this.get_container().children("ul").empty();}
}
if(e_call) {e_call.call(this);}
};success_func =function (d,t,x) {var sf =this.get_settings().html_data.ajax.success;if(sf) {d =sf.call(this,d,t,x) ||d;}
if(d ===""||(d &&d.toString &&d.toString().replace(/^[\s\n]+$/,"") === "")) {

return error_func.call(this,x,t,"");}
if(d) {d =$(d);if(!d.is("ul")) {d =$("<ul />").append(d);}
if(obj ==-1 ||!obj) {this.get_container().children("ul").empty().append(d.children()).find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");}
else {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.append(d).children("ul").find("li, a").filter(function () {return !this.firstChild ||!this.firstChild.tagName ||this.firstChild.tagName !=="INS";}).prepend("<ins class='jstree-icon'>&#160;</ins>").end().filter("a").children("ins:first-child").not(".jstree-icon").addClass("jstree-icon");obj.removeData("jstree_is_loading");}
this.clean_node(obj);if(s_call) {s_call.call(this);}
}
else {if(obj &&obj !==-1) {obj.children("a.jstree-loading").removeClass("jstree-loading");obj.removeData("jstree_is_loading");if(s.correct_state) {this.correct_state(obj);if(s_call) {s_call.call(this);} }
}
else {if(s.correct_state) {this.get_container().children("ul").empty();if(s_call) {s_call.call(this);} }
}
}
};s.ajax.context =this;s.ajax.error =error_func;s.ajax.success =success_func;if(!s.ajax.dataType) {s.ajax.dataType ="html";}
if($.isFunction(s.ajax.url)) {s.ajax.url =s.ajax.url.call(this,obj);}
if($.isFunction(s.ajax.data)) {s.ajax.data =s.ajax.data.call(this,obj);}
$.ajax(s.ajax);break;}
}
}
});$.jstree.defaults.plugins.push("html_data");})(jQuery);(function ($) {$.jstree.plugin("themeroller",{__init :function () {var s =this._get_settings().themeroller;this.get_container()
.addClass("ui-widget-content")
.addClass("jstree-themeroller")
.delegate("a","mouseenter.jstree",function (e) {if(!$(e.currentTarget).hasClass("jstree-loading")) {$(this).addClass(s.item_h);}
})
.delegate("a","mouseleave.jstree",function () {$(this).removeClass(s.item_h);})
.bind("init.jstree",$.proxy(function (e,data) {data.inst.get_container().find("> ul > li > .jstree-loading > ins").addClass("ui-icon-refresh");this._themeroller(data.inst.get_container().find("> ul > li"));},this))
.bind("open_node.jstree create_node.jstree",$.proxy(function (e,data) {this._themeroller(data.rslt.obj);},this))
.bind("loaded.jstree refresh.jstree",$.proxy(function (e) {this._themeroller();},this))
.bind("close_node.jstree",$.proxy(function (e,data) {this._themeroller(data.rslt.obj);},this))
.bind("delete_node.jstree",$.proxy(function (e,data) {this._themeroller(data.rslt.parent);},this))
.bind("correct_state.jstree",$.proxy(function (e,data) {data.rslt.obj
.children("ins.jstree-icon").removeClass(s.opened + " "+ s.closed + " ui-icon").end()
.find("> a > ins.ui-icon")
.filter(function() {return this.className.toString()
.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
.indexOf("ui-icon-") ===-1;}).removeClass(s.item_open + " "+ s.item_clsd).addClass(s.item_leaf ||"jstree-no-icon");},this))
.bind("select_node.jstree",$.proxy(function (e,data) {data.rslt.obj.children("a").addClass(s.item_a);},this))
.bind("deselect_node.jstree deselect_all.jstree",$.proxy(function (e,data) {this.get_container()
.find("a."+ s.item_a).removeClass(s.item_a).end()
.find("a.jstree-clicked").addClass(s.item_a);},this))
.bind("dehover_node.jstree",$.proxy(function (e,data) {data.rslt.obj.children("a").removeClass(s.item_h);},this))
.bind("hover_node.jstree",$.proxy(function (e,data) {this.get_container()
.find("a."+ s.item_h).not(data.rslt.obj).removeClass(s.item_h);data.rslt.obj.children("a").addClass(s.item_h);},this))
.bind("move_node.jstree",$.proxy(function (e,data) {this._themeroller(data.rslt.o);this._themeroller(data.rslt.op);},this));},__destroy :function () {var s =this._get_settings().themeroller,c =["ui-icon"];$.each(s,function (i,v) {v =v.split(" ");if(v.length) {c =c.concat(v);}
});this.get_container()
.removeClass("ui-widget-content")
.find("."+ c.join(", .")).removeClass(c.join(" "));},_fn :{_themeroller :function (obj) {var s =this._get_settings().themeroller;obj =!obj ||obj ==-1 ?this.get_container_ul() :this._get_node(obj).parent();obj
.find("li.jstree-closed")
.children("ins.jstree-icon").removeClass(s.opened).addClass("ui-icon "+ s.closed).end()
.children("a").addClass(s.item)
.children("ins.jstree-icon").addClass("ui-icon")
.filter(function() {return this.className.toString()
.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
.indexOf("ui-icon-") ===-1;}).removeClass(s.item_leaf + " "+ s.item_open).addClass(s.item_clsd ||"jstree-no-icon")
.end()
.end()
.end()
.end()
.find("li.jstree-open")
.children("ins.jstree-icon").removeClass(s.closed).addClass("ui-icon "+ s.opened).end()
.children("a").addClass(s.item)
.children("ins.jstree-icon").addClass("ui-icon")
.filter(function() {return this.className.toString()
.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
.indexOf("ui-icon-") ===-1;}).removeClass(s.item_leaf + " "+ s.item_clsd).addClass(s.item_open ||"jstree-no-icon")
.end()
.end()
.end()
.end()
.find("li.jstree-leaf")
.children("ins.jstree-icon").removeClass(s.closed + " ui-icon "+ s.opened).end()
.children("a").addClass(s.item)
.children("ins.jstree-icon").addClass("ui-icon")
.filter(function() {return this.className.toString()
.replace(s.item_clsd,"").replace(s.item_open,"").replace(s.item_leaf,"")
.indexOf("ui-icon-") ===-1;}).removeClass(s.item_clsd + " "+ s.item_open).addClass(s.item_leaf ||"jstree-no-icon");}
},defaults :{"opened":"ui-icon-triangle-1-se","closed":"ui-icon-triangle-1-e","item":"ui-state-default","item_h":"ui-state-hover","item_a":"ui-state-active","item_open":"ui-icon-folder-open","item_clsd":"ui-icon-folder-collapsed","item_leaf":"ui-icon-document"}
});$(function() {var css_string =''+ '.jstree-themeroller .ui-icon { overflow:visible; } '+ '.jstree-themeroller a { padding:0 2px; } '+ '.jstree-themeroller .jstree-no-icon { display:none; }';$.vakata.css.add_sheet({str :css_string,title :"jstree"});});})(jQuery);(function ($) {$.jstree.plugin("unique",{__init :function () {this.get_container()
.bind("before.jstree",$.proxy(function (e,data) {var nms =[],res =true,p,t;if(data.func =="move_node") {if(data.args[4] ===true) {if(data.args[0].o &&data.args[0].o.length) {data.args[0].o.children("a").each(function () {nms.push($(this).text().replace(/^\s+/g,"")); });

res =this._check_unique(nms,data.args[0].np.find("> ul > li").not(data.args[0].o),"move_node");}
}
}
if(data.func =="create_node") {if(data.args[4] ||this._is_loaded(data.args[0])) {p =this._get_node(data.args[0]);if(data.args[1] &&(data.args[1] ==="before"||data.args[1] ==="after")) {p =this._get_parent(data.args[0]);if(!p ||p ===-1) {p =this.get_container();}
}
if(typeof data.args[2] ==="string") {nms.push(data.args[2]);}
else if(!data.args[2] ||!data.args[2].data) {nms.push(this._get_string("new_node"));}
else {nms.push(data.args[2].data);}
res =this._check_unique(nms,p.find("> ul > li"),"create_node");}
}
if(data.func =="rename_node") {nms.push(data.args[1]);t =this._get_node(data.args[0]);p =this._get_parent(t);if(!p ||p ===-1) {p =this.get_container();}
res =this._check_unique(nms,p.find("> ul > li").not(t),"rename_node");}
if(!res) {e.stopPropagation();return false;}
},this));},defaults :{error_callback :$.noop
},_fn :{_check_unique :function (nms,p,func) {var cnms =[];p.children("a").each(function () {cnms.push($(this).text().replace(/^\s+/g,"")); });

if(!cnms.length ||!nms.length) {return true;}
cnms =cnms.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",");

if((cnms.length + nms.length) !=cnms.concat(nms).sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",").length) {

this._get_settings().unique.error_callback.call(null,nms,p,func);return false;}
return true;},check_move :function () {if(!this.__call_old()) {return false;}
var p =this._get_move(),nms =[];if(p.o &&p.o.length) {p.o.children("a").each(function () {nms.push($(this).text().replace(/^\s+/g,"")); });

return this._check_unique(nms,p.np.find("> ul > li").not(p.o),"check_move");}
return true;}
}
});})(jQuery);(function ($) {$.jstree.plugin("wholerow",{__init :function () {if(!this.data.ui) {throw "jsTree wholerow: jsTree UI plugin not included.";}
this.data.wholerow.html =false;this.data.wholerow.to =false;this.get_container()
.bind("init.jstree",$.proxy(function (e,data) {this._get_settings().core.animation =0;},this))
.bind("open_node.jstree create_node.jstree clean_node.jstree loaded.jstree",$.proxy(function (e,data) {this._prepare_wholerow_span(data &&data.rslt &&data.rslt.obj ?data.rslt.obj :-1 );},this))
.bind("search.jstree clear_search.jstree reopen.jstree after_open.jstree after_close.jstree create_node.jstree delete_node.jstree clean_node.jstree",$.proxy(function (e,data) {if(this.data.to) {clearTimeout(this.data.to);}
this.data.to =setTimeout((function (t,o) {return function() {t._prepare_wholerow_ul(o);};})(this,data &&data.rslt &&data.rslt.obj ?data.rslt.obj :-1),0);},this))
.bind("deselect_all.jstree",$.proxy(function (e,data) {this.get_container().find(" > .jstree-wholerow .jstree-clicked").removeClass("jstree-clicked "+ (this.data.themeroller ?this._get_settings().themeroller.item_a :""));},this))
.bind("select_node.jstree deselect_node.jstree ",$.proxy(function (e,data) {data.rslt.obj.each(function () {var ref =data.inst.get_container().find(" > .jstree-wholerow li:visible:eq("+ (parseInt((($(this).offset().top - data.inst.get_container().offset().top + data.inst.get_container()[0].scrollTop) / data.inst.data.core.li_height),10)) + ")");ref.children("a").attr("class",data.rslt.obj.children("a").attr("class"));});},this))
.bind("hover_node.jstree dehover_node.jstree",$.proxy(function (e,data) {this.get_container().find(" > .jstree-wholerow .jstree-hovered").removeClass("jstree-hovered "+ (this.data.themeroller ?this._get_settings().themeroller.item_h :""));if(e.type ==="hover_node") {var ref =this.get_container().find(" > .jstree-wholerow li:visible:eq("+ (parseInt(((data.rslt.obj.offset().top - this.get_container().offset().top + this.get_container()[0].scrollTop) / this.data.core.li_height),10)) + ")");ref.children("a").attr("class",data.rslt.obj.children(".jstree-hovered").attr("class"));}
},this))
.delegate(".jstree-wholerow-span, ins.jstree-icon, li","click.jstree",function (e) {var n =$(e.currentTarget);if(e.target.tagName ==="A"||(e.target.tagName ==="INS"&&n.closest("li").is(".jstree-open, .jstree-closed"))) {return;}
n.closest("li").children("a:visible:eq(0)").click();e.stopImmediatePropagation();})
.delegate("li","mouseover.jstree",$.proxy(function (e) {e.stopImmediatePropagation();if($(e.currentTarget).children(".jstree-hovered, .jstree-clicked").length) {return false;}
this.hover_node(e.currentTarget);return false;},this))
.delegate("li","mouseleave.jstree",$.proxy(function (e) {if($(e.currentTarget).children("a").hasClass("jstree-hovered").length) {return;}
this.dehover_node(e.currentTarget);},this));if(is_ie7 ||is_ie6) {$.vakata.css.add_sheet({str :".jstree-"+ this.get_index() + " { position:relative; } ",title :"jstree"});}
},defaults :{},__destroy :function () {this.get_container().children(".jstree-wholerow").remove();this.get_container().find(".jstree-wholerow-span").remove();},_fn :{_prepare_wholerow_span :function (obj) {obj =!obj ||obj ==-1 ?this.get_container().find("> ul > li") :this._get_node(obj);if(obj ===false) {return;} obj.each(function () {$(this).find("li").andSelf().each(function () {var $t =$(this);if($t.children(".jstree-wholerow-span").length) {return true;}
$t.prepend("<span class='jstree-wholerow-span' style='width:"+ ($t.parentsUntil(".jstree","li").length * 18) + "px;'>&#160;</span>");});});},_prepare_wholerow_ul :function () {var o =this.get_container().children("ul").eq(0),h =o.html();o.addClass("jstree-wholerow-real");if(this.data.wholerow.last_html !==h) {this.data.wholerow.last_html =h;this.get_container().children(".jstree-wholerow").remove();this.get_container().append(o.clone().removeClass("jstree-wholerow-real")
.wrapAll("<div class='jstree-wholerow' />").parent()
.width(o.parent()[0].scrollWidth)
.css("top",(o.height() + (is_ie7 ?5 :0)) * -1 )
.find("li[id]").each(function () {this.removeAttribute("id");}).end()
);}
}
}
});$(function() {var css_string =''+ '.jstree .jstree-wholerow-real { position:relative; z-index:1; } '+ '.jstree .jstree-wholerow-real li { cursor:pointer; } '+ '.jstree .jstree-wholerow-real a { border-left-color:transparent !important; border-right-color:transparent !important; } '+ '.jstree .jstree-wholerow { position:relative; z-index:0; height:0; } '+ '.jstree .jstree-wholerow ul, .jstree .jstree-wholerow li { width:100%; } '+ '.jstree .jstree-wholerow, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow li, .jstree .jstree-wholerow a { margin:0 !important; padding:0 !important; } '+ '.jstree .jstree-wholerow, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow li { background:transparent !important; }'+ '.jstree .jstree-wholerow ins, .jstree .jstree-wholerow span, .jstree .jstree-wholerow input { display:none !important; }'+ '.jstree .jstree-wholerow a, .jstree .jstree-wholerow a:hover { text-indent:-9999px; !important; width:100%; padding:0 !important; border-right-width:0px !important; border-left-width:0px !important; } '+ '.jstree .jstree-wholerow-span { position:absolute; left:0; margin:0px; padding:0; height:18px; border-width:0; padding:0; z-index:0; }';if(is_ff2) {css_string +=''+ '.jstree .jstree-wholerow a { display:block; height:18px; margin:0; padding:0; border:0; } '+ '.jstree .jstree-wholerow-real a { border-color:transparent !important; } ';}
if(is_ie7 ||is_ie6) {css_string +=''+ '.jstree .jstree-wholerow, .jstree .jstree-wholerow li, .jstree .jstree-wholerow ul, .jstree .jstree-wholerow a { margin:0; padding:0; line-height:18px; } '+ '.jstree .jstree-wholerow a { display:block; height:18px; line-height:18px; overflow:hidden; } ';}
$.vakata.css.add_sheet({str :css_string,title :"jstree"});});})(jQuery);(function ($) {var nodeInterface =["getChildren","getChildrenCount","getAttr","getName","getProps"],validateInterface =function(obj,inter) {var valid =true;obj =obj ||{};inter =[].concat(inter);$.each(inter,function (i,v) {if(!$.isFunction(obj[v])) {valid =false;return false;}
});return valid;};$.jstree.plugin("model",{__init :function () {if(!this.data.json_data) {throw "jsTree model: jsTree json_data plugin not included.";}
this._get_settings().json_data.data =function (n,b) {var obj =(n ==-1) ?this._get_settings().model.object :n.data("jstree_model");if(!validateInterface(obj,nodeInterface)) {return b.call(null,false);}
if(this._get_settings().model.async) {obj.getChildren($.proxy(function (data) {this.model_done(data,b);},this));}
else {this.model_done(obj.getChildren(),b);}
};},defaults :{object :false,id_prefix :false,async :false
},_fn :{model_done :function (data,callback) {var ret =[],s =this._get_settings(),_this =this;if(!$.isArray(data)) {data =[data];}
$.each(data,function (i,nd) {var r =nd.getProps() ||{};r.attr =nd.getAttr() ||{};if(nd.getChildrenCount()) {r.state ="closed";}
r.data =nd.getName();if(!$.isArray(r.data)) {r.data =[r.data];}
if(_this.data.types &&$.isFunction(nd.getType)) {r.attr[s.types.type_attr] =nd.getType();}
if(r.attr.id &&s.model.id_prefix) {r.attr.id =s.model.id_prefix + r.attr.id;}
if(!r.metadata) {r.metadata ={};}
r.metadata.jstree_model =nd;ret.push(r);});callback.call(null,ret);}
}
});})(jQuery);})();(function($) {$.fn.numeric =function(config,callback)
{if(typeof config ==='boolean')
{config ={decimal:config };}
config =config ||{};if(typeof config.negative =="undefined") config.negative =true;var decimal =(config.decimal ===false) ?"":config.decimal ||".";var negative =(config.negative ===true) ?true :false;var callback =typeof callback =="function"?callback :function(){};return this.data("numeric.decimal",decimal).data("numeric.negative",negative).data("numeric.callback",callback).keypress($.fn.numeric.keypress).keyup($.fn.numeric.keyup).blur($.fn.numeric.blur);}
$.fn.numeric.keypress =function(e)
{var decimal =$.data(this,"numeric.decimal");var negative =$.data(this,"numeric.negative");var key =e.charCode ?e.charCode :e.keyCode ?e.keyCode :0;if(key ==13 &&this.nodeName.toLowerCase() =="input")
{return true;}
else if(key ==13)
{return false;}
var allow =false;if((e.ctrlKey &&key ==97 ) ||(e.ctrlKey &&key ==65) ) return true;if((e.ctrlKey &&key ==120 ) ||(e.ctrlKey &&key ==88) ) return true;if((e.ctrlKey &&key ==99 ) ||(e.ctrlKey &&key ==67) ) return true;if((e.ctrlKey &&key ==122 ) ||(e.ctrlKey &&key ==90) ) return true;if((e.ctrlKey &&key ==118 ) ||(e.ctrlKey &&key ==86) ||(e.shiftKey &&key ==45)) return true;if(key < 48 ||key > 57)
{var value =$(this).val();if(value.indexOf("-") !=0 &&negative &&key ==45 &&(value.length ==0 ||($.fn.getSelectionStart(this)) ==0)) return true;if(decimal &&key ==decimal.charCodeAt(0) &&value.indexOf(decimal) !=-1)
{allow =false;}
if(key !=8 &&key !=9 &&key !=13 &&key !=35 &&key !=36 &&key !=37 &&key !=39 &&key !=46 )
{allow =false;}
else
{if(typeof e.charCode !="undefined")
{if(e.keyCode ==e.which &&e.which !=0)
{allow =true;if(e.which ==46) allow =false;}
else if(e.keyCode !=0 &&e.charCode ==0 &&e.which ==0)
{allow =true;}
}
}
if(decimal &&key ==decimal.charCodeAt(0))
{if(value.indexOf(decimal) ==-1)
{allow =true;}
else
{allow =false;}
}
}
else
{allow =true;}
return allow;}
$.fn.numeric.keyup =function(e)
{var val =$(this).value;if(val &&val.length > 0)
{var carat =$.fn.getSelectionStart(this);var decimal =$.data(this,"numeric.decimal");var negative =$.data(this,"numeric.negative");if(decimal !="")
{var dot =val.indexOf(decimal);if(dot ==0)
{this.value ="0"+ val;}
if(dot ==1 &&val.charAt(0) =="-")
{this.value ="-0"+ val.substring(1);}
val =this.value;}
var validChars =[0,1,2,3,4,5,6,7,8,9,'-',decimal];var length =val.length;for(var i =length - 1;i >=0;i--)
{var ch =val.charAt(i);if(i !=0 &&ch =="-")
{val =val.substring(0,i) + val.substring(i + 1);}
else if(i ==0 &&!negative &&ch =="-")
{val =val.substring(1);}
var validChar =false;for(var j =0;j < validChars.length;j++)
{if(ch ==validChars[j])
{validChar =true;break;}
}
if(!validChar ||ch ==" ")
{val =val.substring(0,i) + val.substring(i + 1);}
}
var firstDecimal =val.indexOf(decimal);if(firstDecimal > 0)
{for(var i =length - 1;i > firstDecimal;i--)
{var ch =val.charAt(i);if(ch ==decimal)
{val =val.substring(0,i) + val.substring(i + 1);}
}
}
this.value =val;$.fn.setSelection(this,carat);}
}
$.fn.numeric.blur =function()
{var decimal =$.data(this,"numeric.decimal");var callback =$.data(this,"numeric.callback");var val =this.value;if(val !="")
{var re =new RegExp("^\\d+$|\\d*"+ decimal + "\\d+");if(!re.exec(val))
{callback.apply(this);}
}
}
$.fn.removeNumeric =function()
{return this.data("numeric.decimal",null).data("numeric.negative",null).data("numeric.callback",null).unbind("keypress",$.fn.numeric.keypress).unbind("blur",$.fn.numeric.blur);}
$.fn.getSelectionStart =function(o)
{if (o.createTextRange)
{var r =document.selection.createRange().duplicate();r.moveEnd('character',o.value.length);if (r.text =='') return o.value.length;return o.value.lastIndexOf(r.text);} else return o.selectionStart;}
$.fn.setSelection =function(o,p)
{if(typeof p =="number") p =[p,p];if(p &&p.constructor ==Array &&p.length ==2)
{if (o.createTextRange)
{var r =o.createTextRange();r.collapse(true);r.moveStart('character',p[0]);r.moveEnd('character',p[1]);r.select();}
else if(o.setSelectionRange)
{o.focus();o.setSelectionRange(p[0],p[1]);}
}
}
})(jQuery);(function (jQuery) {var daysInWeek =["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];var shortMonthsInYear =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var longMonthsInYear =["January","February","March","April","May","June","July","August","September","October","November","December"];var shortMonthsToNumber =[];shortMonthsToNumber["Jan"] ="01";shortMonthsToNumber["Feb"] ="02";shortMonthsToNumber["Mar"] ="03";shortMonthsToNumber["Apr"] ="04";shortMonthsToNumber["May"] ="05";shortMonthsToNumber["Jun"] ="06";shortMonthsToNumber["Jul"] ="07";shortMonthsToNumber["Aug"] ="08";shortMonthsToNumber["Sep"] ="09";shortMonthsToNumber["Oct"] ="10";shortMonthsToNumber["Nov"] ="11";shortMonthsToNumber["Dec"] ="12";jQuery.format =(function () {function strDay(value) {return daysInWeek[parseInt(value,10)] ||value;}
 function strMonth(value) {var monthArrayIndex =parseInt(value,10) - 1;return shortMonthsInYear[monthArrayIndex] ||value;}
 function strLongMonth(value) {var monthArrayIndex =parseInt(value,10) - 1;return longMonthsInYear[monthArrayIndex] ||value;}
 var parseMonth =function (value) {return shortMonthsToNumber[value] ||value;};var parseTime =function (value) {var retValue =value;var millis ="";if (retValue.indexOf(".") !==-1) {var delimited =retValue.split('.');retValue =delimited[0];millis =delimited[1];}
 var values3 =retValue.split(":");if (values3.length ===3) {hour =values3[0];minute =values3[1];second =values3[2];return {time:retValue,hour:hour,minute:minute,second:second,millis:millis
 };} else {return {time:"",hour:"",minute:"",second:"",millis:""};}
 };return {date:function (value,format) {try {var date =null;var year =null;var month =null;var dayOfMonth =null;var dayOfWeek =null;var time =null;if (typeof value =="number"){return this.date(new Date(value),format);} else if (typeof value.getFullYear =="function") {year =value.getFullYear();month =value.getMonth() + 1;dayOfMonth =value.getDate();dayOfWeek =value.getDay();time =parseTime(value.toTimeString());} else if (value.search(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[-+]?\d{2}:?\d{2}/) != -1) { /* 2009-04-19T16:11:05+02:00 */

 var values =value.split(/[T\+-]/);

 year =values[0];month =values[1];dayOfMonth =values[2];time =parseTime(values[3].split(".")[0]);date =new Date(year,month - 1,dayOfMonth);dayOfWeek =date.getDay();} else {var values =value.split(" ");switch (values.length) {case 6:year =values[5];month =parseMonth(values[1]);dayOfMonth =values[2];time =parseTime(values[3]);date =new Date(year,month - 1,dayOfMonth);dayOfWeek =date.getDay();break;case 2:var values2 =values[0].split("-");year =values2[0];month =values2[1];dayOfMonth =values2[2];time =parseTime(values[1]);date =new Date(year,month - 1,dayOfMonth);dayOfWeek =date.getDay();break;case 7:case 9:case 10:year =values[3];month =parseMonth(values[1]);dayOfMonth =values[2];time =parseTime(values[4]);date =new Date(year,month - 1,dayOfMonth);dayOfWeek =date.getDay();break;case 1:var values2 =values[0].split("");year=values2[0]+values2[1]+values2[2]+values2[3];month=values2[5]+values2[6];dayOfMonth =values2[8]+values2[9];time =parseTime(values2[13]+values2[14]+values2[15]+values2[16]+values2[17]+values2[18]+values2[19]+values2[20])
 date =new Date(year,month - 1,dayOfMonth);dayOfWeek =date.getDay();break;default:return value;}
 }
 var pattern ="";var retValue ="";var unparsedRest ="";for (var i =0;i < format.length;i++) {var currentPattern =format.charAt(i);pattern +=currentPattern;unparsedRest ="";switch (pattern) {case "ddd":retValue +=strDay(dayOfWeek);pattern ="";break;case "dd":if (format.charAt(i + 1) =="d") {break;}
 if (String(dayOfMonth).length ===1) {dayOfMonth ='0'+ dayOfMonth;}
 retValue +=dayOfMonth;pattern ="";break;case "d":if (format.charAt(i + 1) =="d") {break;}
 retValue +=parseInt(dayOfMonth,10);pattern ="";break;case "MMMM":retValue +=strLongMonth(month);pattern ="";break;case "MMM":if (format.charAt(i + 1) ==="M") {break;}
 retValue +=strMonth(month);pattern ="";break;case "MM":if (format.charAt(i + 1) =="M") {break;}
 if (String(month).length ===1) {month ='0'+ month;}
 retValue +=month;pattern ="";break;case "yyyy":retValue +=year;pattern ="";break;case "yy":if (format.charAt(i + 1) =="y"&&format.charAt(i + 2) =="y") {break;}
 retValue +=String(year).slice(-2);pattern ="";break;case "HH":retValue +=time.hour;pattern ="";break;case "hh":var hour =(time.hour ==0 ?12 :time.hour < 13 ?time.hour :time.hour - 12);hour =String(hour).length ==1 ?'0'+ hour :hour;retValue +=hour;pattern ="";break;case "h":if (format.charAt(i + 1) =="h") {break;}
 var hour =(time.hour ==0 ?12 :time.hour < 13 ?time.hour :time.hour - 12);retValue +=parseInt(hour,10);pattern ="";break;case "mm":retValue +=time.minute;pattern ="";break;case "ss":retValue +=time.second.substring(0,2);pattern ="";break;case "SSS":retValue +=time.millis.substring(0,3);pattern ="";break;case "a":retValue +=time.hour >=12 ?"PM":"AM";pattern ="";break;case " ":retValue +=currentPattern;pattern ="";break;case "/":retValue +=currentPattern;pattern ="";break;case ":":retValue +=currentPattern;pattern ="";break;default:if (pattern.length ===2 &&pattern.indexOf("y") !==0 &&pattern !="SS") {retValue +=pattern.substring(0,1);pattern =pattern.substring(1,2);} else if ((pattern.length ===3 &&pattern.indexOf("yyy") ===-1)) {pattern ="";} else {unparsedRest =pattern;}
 }
 }
 retValue +=unparsedRest;return retValue;} catch (e) {console.log(e);return value;}
 }
 };}());}(jQuery));jQuery.format.date.defaultShortDateFormat ="dd/MM/yyyy";jQuery.format.date.defaultLongDateFormat ="dd/MM/yyyy hh:mm:ss";jQuery(document).ready(function () {jQuery(".shortDateFormat").each(function (idx,elem) {if (jQuery(elem).is(":input")) {jQuery(elem).val(jQuery.format.date(jQuery(elem).val(),jQuery.format.date.defaultShortDateFormat));} else {jQuery(elem).text(jQuery.format.date(jQuery(elem).text(),jQuery.format.date.defaultShortDateFormat));}
 });jQuery(".longDateFormat").each(function (idx,elem) {if (jQuery(elem).is(":input")) {jQuery(elem).val(jQuery.format.date(jQuery(elem).val(),jQuery.format.date.defaultLongDateFormat));} else {jQuery(elem).text(jQuery.format.date(jQuery(elem).text(),jQuery.format.date.defaultLongDateFormat));}
 });});var JSON;if (!JSON) {JSON ={};}
(function () {'use strict';function f(n) {return n < 10 ?'0'+ n :n;}
 if (typeof Date.prototype.toJSON !=='function') {Date.prototype.toJSON =function (key) {return isFinite(this.valueOf())
 ?this.getUTCFullYear() + '-'+
 f(this.getUTCMonth() + 1) + '-'+
 f(this.getUTCDate()) + 'T'+
 f(this.getUTCHours()) + ':'+
 f(this.getUTCMinutes()) + ':'+
 f(this.getUTCSeconds()) + 'Z':null;};String.prototype.toJSON =Number.prototype.toJSON =Boolean.prototype.toJSON =function (key) {return this.valueOf();};}
 var cx =/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

 escapable =/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

 gap,indent,meta ={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string) {escapable.lastIndex =0;return escapable.test(string) ?'"'+ string.replace(escapable,function (a) {var c =meta[a];return typeof c ==='string'?c
 :'\\u'+ ('0000'+ a.charCodeAt(0).toString(16)).slice(-4);}) + '"':'"'+ string + '"';}
 function str(key,holder) {var i,k,v,length,mind =gap,partial,value =holder[key];if (value &&typeof value ==='object'&&typeof value.toJSON ==='function') {value =value.toJSON(key);}
if (typeof rep ==='function') {value =rep.call(holder,key,value);}
switch (typeof value) {case 'string':return quote(value);case 'number':return isFinite(value) ?String(value) :'null';case 'boolean':case 'null':return String(value);case 'object':if (!value) {return 'null';}
gap +=indent;partial =[];if (Object.prototype.toString.apply(value) ==='[object Array]') {length =value.length;for (i =0;i < length;i +=1) {partial[i] =str(i,value) ||'null';}
v =partial.length ===0
 ?'[]':gap
 ?'[\n'+ gap + partial.join(',\n'+ gap) + '\n'+ mind + ']':'['+ partial.join(',') + ']';gap =mind;return v;}
if (rep &&typeof rep ==='object') {length =rep.length;for (i =0;i < length;i +=1) {if (typeof rep[i] ==='string') {k =rep[i];v =str(k,value);if (v) {partial.push(quote(k) + (gap ?': ':':') + v);}
 }
 }
 } else {for (k in value) {if (Object.prototype.hasOwnProperty.call(value,k)) {v =str(k,value);if (v) {partial.push(quote(k) + (gap ?': ':':') + v);}
 }
 }
 }
v =partial.length ===0
 ?'{}':gap
 ?'{\n'+ gap + partial.join(',\n'+ gap) + '\n'+ mind + '}':'{'+ partial.join(',') + '}';gap =mind;return v;}
 }
if (typeof JSON.stringify !=='function') {JSON.stringify =function (value,replacer,space) {var i;gap ='';indent ='';if (typeof space ==='number') {for (i =0;i < space;i +=1) {indent +=' ';}
} else if (typeof space ==='string') {indent =space;}
rep =replacer;if (replacer &&typeof replacer !=='function'&&(typeof replacer !=='object'||typeof replacer.length !=='number')) {throw new Error('JSON.stringify');}
return str('',{'':value});};}
if (typeof JSON.parse !=='function') {JSON.parse =function (text,reviver) {var j;function walk(holder,key) {var k,v,value =holder[key];if (value &&typeof value ==='object') {for (k in value) {if (Object.prototype.hasOwnProperty.call(value,k)) {v =walk(value,k);if (v !==undefined) {value[k] =v;} else {delete value[k];}
 }
 }
 }
 return reviver.call(holder,key,value);}
text =String(text);cx.lastIndex =0;if (cx.test(text)) {text =text.replace(cx,function (a) {return '\\u'+
 ('0000'+ a.charCodeAt(0).toString(16)).slice(-4);});}
if (/^[\],:{}\s]*$/

 .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')

 .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')

 .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

j =eval('('+ text + ')');return typeof reviver ==='function'?walk({'':j},'')
 :j;}
throw new SyntaxError('JSON.parse');};}
}());if (typeof ADOBE ==="undefined") {var ADOBE ={};}
if (typeof ADOBE.AM ==="undefined") {ADOBE.AM ={};}
ADOBE.AM.hierarchy_tree =function (){this.treeElement ="";this.folderSrc ="";this.listSrc =[];this.inc3rdParty =false;this.foldersOnly =false;this.folderThemeSrc ="";this.showCheckboxes =true;this.two_state =false;this.dots =false;this.icons =true;this.initially_select =[];this.initially_open =[];this.formatData =function (data) {jQuery.each(data,function (i,item) {item.data =DEMDEX.UTILS.unescape(item.data);});};var extractId =function() {var regex =null;if (arguments[1] =="segment") {regex =new RegExp("(seg_)?\\d+_"+ "segment_row_","");}
else if (arguments[1] =="destination") {regex =new RegExp("(seg_)?\\d+_"+ "order_row_","");}
else {regex =new RegExp("(seg_)?(\\d+_)?folder_row_","");}
return (arguments[0].replace(regex,""));};var folderHTML =function(type,id,status) {var html_templates ={wrapper :'<div id="%%id%%" class="btn_wrap hide-spans">%%contents%%</div>',edit :'<img src="https://a248.e.akamai.net/demdex.download.akamai.com/corp/images/edit.png" title="Edit" alt="Edit" />',play :'<img src="https://a248.e.akamai.net/demdex.download.akamai.com/corp/images/play.png" title="Activate" alt="Play" />',stop :'<img src="https://a248.e.akamai.net/demdex.download.akamai.com/corp/images/pause.png" title="Deactivate" alt="Stop" />','delete':'<img src="https://a248.e.akamai.net/demdex.download.akamai.com/corp/images/bin.png" title="Delete" alt="Delete" />'},html ="";switch(type) {case "folder":html =html_templates.wrapper.replace("%%id%%","seg_"+ id)
.replace("%%contents%%",'<span>'+ html_templates.edit + '</span><span>'+ html_templates['delete'] + '</span>');break;case "segment":html =html_templates.wrapper.replace("%%id%%","seg_"+ id)
.replace("%%contents%%",'<span>'+ html_templates.edit + '</span><span>'+ (+status ==1 ?html_templates.stop :html_templates.play) + '</span><span>'+ html_templates['delete'] + '</span>');break;default:break;}
return html;};this.loadTree =function(){var pluginArray;if(this.showCheckboxes){pluginArray =["themes","json_data","ui","search","types","checkbox"];}else{pluginArray =["themes","json_data","ui","search","types"];}
var foldersOnly =this.foldersOnly;var inc3rdParty =this.inc3rdParty;$(this.treeElement).jstree({"plugins":pluginArray,"themes":{"theme":"default","dots":this.dots,"icons":this.icons,"url":this.folderThemeSrc
 },"json_data":{progressive_render :true,"ajax":{"url":this.folderSrc,"async":false,"data":function (n) {return {"q":new Date().getTime(),"operation":"get_children","id":n.attr ?extractId(n.attr("id"),n.attr("rel")) :-1,"foldersOnly":foldersOnly,"includeThirdParty":inc3rdParty
};},"success":this.formatData
},"row_hook":function(elem,obj) {var tmp1 =null,html ="";if (typeof obj.attr =="undefined") {return elem;}
else if (obj.attr.rel =="folder") {html =folderHTML(obj.attr.rel,obj.attr.id,obj.status);tmp1 =$(html)
.click(function(e) {var name =e.target.nodeName.toLowerCase();var elem =(name =="span"?$(e.target).find('img')[0]
:e.target);$(document).trigger("folder_action",[this,elem]);});} else {html =folderHTML(obj.attr.rel,obj.attr.id,obj.status);tmp1 =$(html)
.click(function(e) {var name =e.target.nodeName.toLowerCase();var elem =(name =="span"?$(e.target).find('img')[0]
:e.target);$(document).trigger("segment_action",[this,elem]);});}
elem.append(tmp1);return elem;}
},"search":{"ajax":{"url":this.folderSrc + "?q="+ new Date().getTime(),"data":function (str) {return {"operation":"search","search_str":str };}
}
},"types":{"max_depth":-2,"max_children":-2,"valid_children":["drive","folder","destination","category"],"types":{"trait":{"valid_children":"none","icon":{"image":"/css/aam/images/leaf.gif"}
},"destination":{"valid_children":"none","icon":{"image":"/css/aam/images/leaf.gif"}
},"segment":{"valid_children":"none","icon":{"image":"/css/aam/images/leaf.gif"}
},"folder":{"valid_children":["segment","folder"],"icon":{"image":"/css/aam/images/folder.gif"}
},"category":{"valid_children":["category"]
}
}
},"ui":{"initially_select":this.initially_select
},"core":{"initially_open":this.initially_open,"animation":0,"html_titles":true
},"checkbox":{"two_state":this.two_state
}
});$(this.treeElement).bind("select_node.jstree",function(event,data){var el =data.rslt.obj.attr("id");$(this.treeElement + " a").removeClass("selectedNode");$("#"+el+">a").addClass("selectedNode");$(this).jstree("open_node",$("#"+el))
});return $(this.treeElement);}
}
ADOBE.AM.contextHelpArr =[];ADOBE.AM.addHelpObj =function(page ){var url =ADOBE.AM.API.BASEURL + "/contextualhelp/pid-"+ ADOBE.AM.pid + "/"+ page;$.getJSON(url,function(helpObj ){ADOBE.AM.contextHelpArr[page ] =helpObj;ADOBE.AM.showContextHelp(page );}
);};ADOBE.AM.showContextHelp =function(item ){var alertObj ={};var helpObj =ADOBE.AM.contextHelpArr[item ];helpObj.intro =ADOBE.AM.UTILS.HELPERS.htmlEntityDecode(helpObj.intro);var msg =helpObj.intro+ "<a tabindex='-1' class='moreHelpLink' href='"+ helpObj.url + "' target='_blank'>Click here for more information</a>";alertObj.title =helpObj.title;alertObj.msg =msg;ADOBE.AM.alertBox(alertObj );}
ADOBE.AM.alertBox =function(alertObj ){$("#alertBoxDialog .message").hide();$alertBoxDialog.dialog("option","title",'Alert');if(typeof alertObj !=="undefined"){if(typeof alertObj.title !=="undefined"){$alertBoxDialog.dialog("option","title",alertObj.title );}
if(typeof alertObj.errorMsg !=="undefined"){$("#alertBoxDialog .errorMsg").html(alertObj.errorMsg );$("#alertError").show();}
if(typeof alertObj.warningMsg !=="undefined"){$("#alertBoxDialog .warningMsg").html(alertObj.warningMsg );$("#alertWarning").show();}
if(typeof alertObj.msg !=="undefined"){$("#alertMsg").html(alertObj.msg );}
}
 try {$alertBoxDialog.dialog('open');}
 catch (ERR) {}
};ADOBE.AM.AlertModal =function(config) {var auiDialog =null,auiAlert =null,dialog_config ={},dialog_arg_support =['width','header','buttons'],dialog_defaults ={width :'300px',footer :'<button class="primary" style="margin-right:4px">OK</button>'},alert_arg_support =['type','message'],alert_defaults ={type :'error',message :"",header :true
 };function assignDefaultButtonClick() {$('button.primary',auiDialog.el('container')).off().on('click',function() {$(auiDialog.el('container')).fadeOut('slow',function() {$(auiAlert.el('container')).remove();auiDialog.hide();$('body').removeClass('disableMainScroll');$(auiDialog.el('container')).find('.AUI_Dialog_outerContainer').removeClass('chromeFix').css({top:'50%'});});});}
function handleHeadlessDialog() {var container =auiDialog.el('container');var classes =container.getAttribute('class');classes +=" headless";container.setAttribute('class',classes);}
function handleHeadDialog() {var container =auiDialog.el('container');var classes =container.getAttribute('class');classes =classes.replace(/\s?headless\s?/g, " ");

 container.setAttribute('class',classes);}
function getAlertArgs(args) {var return_args ={},alert_args =_.pick.apply(null,[].concat(args).concat(alert_arg_support));return _.extend(return_args,alert_defaults,alert_args);}
function getDialogArgs(args) {var return_args ={},div =document.createElement('div'),dialog_args =_.pick.apply(null,[].concat(args).concat(dialog_arg_support));if (_.isEmpty(dialog_args)) {return _.extend(return_args,dialog_defaults);}
if (dialog_args.buttons) {_.each(dialog_args.buttons,function(button_args) {var button =document.createElement('button');button.innerHTML =button_args.text;button.className =button_args.className;div.appendChild(button);AUI.addListener(button,'click',button_args.onClick);});dialog_args.footer =div;}
delete dialog_args.buttons;return _.extend(return_args,dialog_defaults,dialog_args);}
 dialog_config =getDialogArgs(config);auiDialog =new AUI.Dialog(dialog_config).render().show();auiDialog.el('container').setAttribute('id','alertModal');_.extend(alert_defaults,{parent :auiDialog.el('content')});ADOBE.AM.AlertModal =function(config) {var alert_config ={},is_type_loading =false,is_headless_dialog_config =false,attach_default_buttons_handlers =false,dialog_config ={};alert_config =_.extend(getAlertArgs(config),{header :true});is_headless_dialog_config =dialog_config.header ===undefined;is_type_loading =alert_config.type ==="loading";attach_default_buttons_handlers =config.buttons ===undefined;dialog_config =getDialogArgs(config);if (is_headless_dialog_config) {handleHeadlessDialog();}
 else {handleHeadDialog();auiDialog.set('header',dialog_config.header);}
 if (is_type_loading) {auiDialog.set('footer','');delete alert_config.header;}
 else {auiDialog.set('footer',dialog_config.footer);if (attach_default_buttons_handlers) {assignDefaultButtonClick();}
 }
 if (auiAlert instanceof AUI.Alert) {auiAlert.destroy();}
 auiAlert =new AUI.Alert(alert_config).render().show();if (!$('.AUI_Dialog:visible').length) {auiDialog.set('zIndex',1001);}
 $(auiDialog.el('container')).show();auiDialog.show();return auiDialog;};return ADOBE.AM.AlertModal(config);};ADOBE.AM.LoadingOverlay ={store :{},instance_properties :{overlay :null,parent_element :null,rendered :null,message :"Loading...",show :function() {var self =this;if (this.rendered) {this.overlay.css({height :this.parent_element.outerHeight(),width:this.parent_element.outerWidth()
 });this.overlay.css("display","block");this.aui_alert.show();return;}
 this.overlay =$('<div class="loading_overlay" />');this.overlay.css({height :function() {return self.parent_element.outerHeight();},width:this.parent_element.outerWidth()
 });this.parent_element.append(this.overlay);this.aui_alert =new AUI.Alert({parent:this.parent_element.get(0),type:'loading',label:'',message:this.message
 }).render().show();this.rendered =true;},hide :function() {if (this.overlay) {this.overlay.css("display","none");}
 if (this.aui_alert &&this.aui_alert.get('visible')) {this.aui_alert.hide();}
 }
 },config :function(config) {var loading_obj =null;if (config.id ==null) {throw Error("You must supply an id property");return;}
 loading_obj =this.store[config.id];if (loading_obj &&loading_obj.rendered) {return loading_obj;}
 loading_obj =_.extend({},this.instance_properties,config);this.store[config.id] =loading_obj;return this.store[config.id];},flush :function(id) {if (typeof id =="string") {delete this.store[id];}
 else {this.store ={};}
 }
};$(document).ready(function() {$alertBoxDialog =$("#alertBoxDialog").dialog({autoOpen:false,closeText :"Close",modal:true,create:function(){$("#alertBoxDialog .close, #alertBoxDialog .oldClose").click(function(){$alertBoxDialog.dialog('close');});}
});if (window.location.href.indexOf('SegmentBuilder') ==-1) {$(".context-help").click(function(){var helpPage =$(this).attr("data-id");if(typeof ADOBE.AM.contextHelpArr[helpPage ] ==="undefined"){ADOBE.AM.addHelpObj(helpPage);}else{ADOBE.AM.showContextHelp(helpPage );}
});}
});(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=

function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||

u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);(function(){var l=this,y=l.Backbone,z=Array.prototype.slice,A=Array.prototype.splice,g;g=typeof exports!=="undefined"?exports:l.Backbone={};g.VERSION="0.9.2";var f=l._;!f&&typeof require!=="undefined"&&(f=require("underscore"));var i=l.jQuery||l.Zepto||l.ender;g.setDomLibrary=function(a){i=a};g.noConflict=function(){l.Backbone=y;return this};g.emulateHTTP=!1;g.emulateJSON=!1;var p=/\s+/,k=g.Events={on:function(a,b,c){var d,e,f,g,j;if(!b)return this;a=a.split(p);for(d=this._callbacks||(this._callbacks=
{});e=a.shift();)f=(j=d[e])?j.tail:{},f.next=g={},f.context=c,f.callback=b,d[e]={tail:g,next:j?j.next:f};return this},off:function(a,b,c){var d,e,h,g,j,q;if(e=this._callbacks){if(!a&&!b&&!c)return delete this._callbacks,this;for(a=a?a.split(p):f.keys(e);d=a.shift();)if(h=e[d],delete e[d],h&&(b||c))for(g=h.tail;(h=h.next)!==g;)if(j=h.callback,q=h.context,b&&j!==b||c&&q!==c)this.on(d,j,q);return this}},trigger:function(a){var b,c,d,e,f,g;if(!(d=this._callbacks))return this;f=d.all;a=a.split(p);for(g=z.call(arguments,1);b=a.shift();){if(c=d[b])for(e=c.tail;(c=c.next)!==e;)c.callback.apply(c.context||this,g);if(c=f){e=c.tail;for(b=[b].concat(g);(c=c.next)!==e;)c.callback.apply(c.context||this,b)}}return this}};k.bind=k.on;k.unbind=k.off;var o=g.Model=function(a,b){var c;a||(a={});b&&b.parse&&(a=this.parse(a));if(c=n(this,"defaults"))a=f.extend({},c,a);if(b&&b.collection)this.collection=b.collection;this.attributes={};this._escapedAttributes={};this.cid=f.uniqueId("c");this.changed={};this._silent={};this._pending={};this.set(a,{silent:!0});this.changed={};this._silent={};this._pending={};this._previousAttributes=f.clone(this.attributes);this.initialize.apply(this,arguments)};f.extend(o.prototype,k,{changed:null,_silent:null,_pending:null,idAttribute:"id",initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var b;if(b=this._escapedAttributes[a])return b;b=this.get(a);return this._escapedAttributes[a]=f.escape(b==null?"":""+b)},has:function(a){return this.get(a)!=null},set:function(a,b,c){var d,e;f.isObject(a)||a==null?(d=a,c=b):(d={},d[a]=b);c||(c={});if(!d)return this;if(d instanceof o)d=d.attributes;if(c.unset)for(e in d)d[e]=void 0;if(!this._validate(d,c))return!1;if(this.idAttribute in d)this.id=d[this.idAttribute];var b=c.changes={},h=this.attributes,g=this._escapedAttributes,j=this._previousAttributes||{};for(e in d){a=d[e];if(!f.isEqual(h[e],a)||c.unset&&f.has(h,e))delete g[e],(c.silent?this._silent:b)[e]=!0;c.unset?delete h[e]:h[e]=a;!f.isEqual(j[e],a)||f.has(h,e)!=f.has(j,e)?(this.changed[e]=a,c.silent||(this._pending[e]=!0)):(delete this.changed[e],delete this._pending[e])}c.silent||this.change(c);return this},unset:function(a,b){(b||(b={})).unset=!0;return this.set(a,null,b)},clear:function(a){(a||(a={})).unset=!0;return this.set(f.clone(this.attributes),a)},fetch:function(a){var a=a?f.clone(a):{},b=this,c=a.success;a.success=function(d,e,f){if(!b.set(b.parse(d,f),a))return!1;c&&c(b,d)};a.error=g.wrapError(a.error,b,a);return(this.sync||g.sync).call(this,"read",this,a)},save:function(a,b,c){var d,e;f.isObject(a)||a==null?(d=a,c=b):(d={},d[a]=b);c=c?f.clone(c):{};if(c.wait){if(!this._validate(d,c))return!1;e=f.clone(this.attributes)}a=f.extend({},c,{silent:!0});if(d&&!this.set(d,c.wait?a:c))return!1;var h=this,i=c.success;c.success=function(a,b,e){b=h.parse(a,e);c.wait&&(delete c.wait,b=f.extend(d||{},b));if(!h.set(b,c))return!1;i?i(h,a):h.trigger("sync",h,a,c)};c.error=g.wrapError(c.error,h,c);b=this.isNew()?"create":"update";b=(this.sync||g.sync).call(this,b,this,c);c.wait&&this.set(e,a);return b},destroy:function(a){var a=a?f.clone(a):{},b=this,c=a.success,d=function(){b.trigger("destroy",b,b.collection,a)};if(this.isNew())return d(),!1;a.success=function(e){a.wait&&d();c?c(b,e):b.trigger("sync",b,e,a)};a.error=g.wrapError(a.error,b,a);var e=(this.sync||g.sync).call(this,"delete",this,a);a.wait||d();return e},url:function(){var a=n(this,"urlRoot")||n(this.collection,"url")||t();return this.isNew()?a:a+(a.charAt(a.length-1)=="/"?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},change:function(a){a||(a={});var b=this._changing;this._changing=!0;for(var c in this._silent)this._pending[c]=!0;var d=f.extend({},a.changes,this._silent);this._silent={};for(c in d)this.trigger("change:"+c,this,this.get(c),a);if(b)return this;for(;!f.isEmpty(this._pending);){this._pending={};this.trigger("change",this,a);for(c in this.changed)!this._pending[c]&&!this._silent[c]&&delete this.changed[c];this._previousAttributes=f.clone(this.attributes)}this._changing=!1;return this},hasChanged:function(a){return!arguments.length?!f.isEmpty(this.changed):f.has(this.changed,a)},changedAttributes:function(a){if(!a)return this.hasChanged()?f.clone(this.changed):!1;var b,c=!1,d=this._previousAttributes,e;for(e in a)if(!f.isEqual(d[e],b=a[e]))(c||(c={}))[e]=b;return c},previous:function(a){return!arguments.length||!this._previousAttributes?null:this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},isValid:function(){return!this.validate(this.attributes)},_validate:function(a,b){if(b.silent||!this.validate)return!0;var a=f.extend({},this.attributes,a),c=this.validate(a,b);if(!c)return!0;b&&b.error?b.error(this,c,b):this.trigger("error",this,c,b);return!1}});var r=g.Collection=function(a,b){b||(b={});if(b.model)this.model=b.model;if(b.comparator)this.comparator=b.comparator;this._reset();this.initialize.apply(this,arguments);a&&this.reset(a,{silent:!0,parse:b.parse})};f.extend(r.prototype,k,{model:o,initialize:function(){},toJSON:function(a){return this.map(function(b){return b.toJSON(a)})},add:function(a,b){var c,d,e,g,i,j={},k={},l=[];b||(b={});a=f.isArray(a)?a.slice():[a];for(c=0,d=a.length;c<d;c++){if(!(e=a[c]=this._prepareModel(a[c],b)))throw Error("Can't add an invalid model to a collection");g=e.cid;i=e.id;j[g]||this._byCid[g]||i!=null&&(k[i]||this._byId[i])?l.push(c):j[g]=k[i]=e}for(c=l.length;c--;)a.splice(l[c],1);for(c=0,d=a.length;c<d;c++)(e=a[c]).on("all",this._onModelEvent,this),this._byCid[e.cid]=e,e.id!=null&&(this._byId[e.id]=e);this.length+=d;A.apply(this.models,[b.at!=null?b.at:this.models.length,0].concat(a));this.comparator&&this.sort({silent:!0});if(b.silent)return this;for(c=0,d=this.models.length;c<d;c++)if(j[(e=this.models[c]).cid])b.index=c,e.trigger("add",e,this,b);return this},remove:function(a,b){var c,d,e,g;b||(b={});a=f.isArray(a)?a.slice():[a];for(c=0,d=a.length;c<d;c++)if(g=this.getByCid(a[c])||this.get(a[c])){delete this._byId[g.id];delete this._byCid[g.cid];e=this.indexOf(g);this.models.splice(e,1);this.length--;if(!b.silent)b.index=e,g.trigger("remove",g,this,b);this._removeReference(g)}return this},push:function(a,b){a=this._prepareModel(a,b);this.add(a,b);return a},pop:function(a){var b=this.at(this.length-1);this.remove(b,a);return b},unshift:function(a,b){a=this._prepareModel(a,b);this.add(a,f.extend({at:0},b));return a},shift:function(a){var b=this.at(0);this.remove(b,a);return b},get:function(a){return a==null?void 0:this._byId[a.id!=null?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},where:function(a){return f.isEmpty(a)?[]:this.filter(function(b){for(var c in a)if(a[c]!==b.get(c))return!1;return!0})},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");var b=f.bind(this.comparator,this);this.comparator.length==1?this.models=this.sortBy(b):this.models.sort(b);a.silent||this.trigger("reset",this,a);return this},pluck:function(a){return f.map(this.models,function(b){return b.get(a)})},reset:function(a,b){a||(a=[]);b||(b={});for(var c=0,d=this.models.length;c<d;c++)this._removeReference(this.models[c]);this._reset();this.add(a,f.extend({silent:!0},b));b.silent||this.trigger("reset",this,b);return this},fetch:function(a){a=a?f.clone(a):{};if(a.parse===void 0)a.parse=!0;var b=this,c=a.success;a.success=function(d,e,f){b[a.add?"add":"reset"](b.parse(d,f),a);c&&c(b,d)};a.error=g.wrapError(a.error,b,a);return(this.sync||g.sync).call(this,"read",this,a)},create:function(a,b){var c=this,b=b?f.clone(b):{},a=this._prepareModel(a,b);if(!a)return!1;b.wait||c.add(a,b);var d=b.success;b.success=function(e,f){b.wait&&c.add(e,b);d?d(e,f):e.trigger("sync",a,f,b)};a.save(null,b);return a},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_prepareModel:function(a,b){b||(b={});if(a instanceof o){if(!a.collection)a.collection=this}else{var c;b.collection=this;a=new this.model(a,b);a._validate(a.attributes,b)||(a=!1)}return a},_removeReference:function(a){this==a.collection&&delete a.collection;a.off("all",this._onModelEvent,this)},_onModelEvent:function(a,b,c,d){(a=="add"||a=="remove")&&c!=this||(a=="destroy"&&this.remove(b,d),b&&a==="change:"+b.idAttribute&&(delete this._byId[b.previous(b.idAttribute)],this._byId[b.id]=b),this.trigger.apply(this,arguments))}});f.each("forEach,each,map,reduce,reduceRight,find,detect,filter,select,reject,every,all,some,any,include,contains,invoke,max,min,sortBy,sortedIndex,toArray,size,first,initial,rest,last,without,indexOf,shuffle,lastIndexOf,isEmpty,groupBy".split(","),function(a){r.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}});var u=g.Router=function(a){a||(a={});if(a.routes)this.routes=a.routes;this._bindRoutes();this.initialize.apply(this,arguments)},B=/:\w+/g,C=/\*\w+/g,D=/[-[\]{}()+?.,\\^$|#\s]/g;f.extend(u.prototype,k,{initialize:function(){},route:function(a,b,c){g.history||(g.history=new m);f.isRegExp(a)||(a=this._routeToRegExp(a));c||(c=this[b]);g.history.route(a,f.bind(function(d){d=this._extractParameters(a,d);c&&c.apply(this,d);this.trigger.apply(this,["route:"+b].concat(d));g.history.trigger("route",this,b,d)},this));return this},navigate:function(a,b){g.history.navigate(a,b)},_bindRoutes:function(){if(this.routes){var a=
[],b;for(b in this.routes)a.unshift([b,this.routes[b]]);b=0;for(var c=a.length;b<c;b++)this.route(a[b][0],a[b][1],this[a[b][1]])}},_routeToRegExp:function(a){a=a.replace(D,"\\$&").replace(B,"([^/]+)").replace(C,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}});var m=g.History=function(){this.handlers=[];f.bindAll(this,"checkUrl")},s=/^[#\/]/,E=/msie [\w.]+/;m.started=!1;f.extend(m.prototype,k,{interval:50,getHash:function(a){return(a=(a?a.location:window.location).href.match(/#(.*)$/))?
a[1]:""},getFragment:function(a,b){if(a==null)if(this._hasPushState||b){var a=window.location.pathname,c=window.location.search;c&&(a+=c)}else a=this.getHash();a.indexOf(this.options.root)||(a=a.substr(this.options.root.length));return a.replace(s,"")},start:function(a){if(m.started)throw Error("Backbone.history has already been started");m.started=!0;this.options=f.extend({},{root:"/"},this.options,a);this._wantsHashChange=this.options.hashChange!==!1;this._wantsPushState=!!this.options.pushState;this._hasPushState=!(!this.options.pushState||!window.history||!window.history.pushState);var a=this.getFragment(),b=document.documentMode;if(b=E.exec(navigator.userAgent.toLowerCase())&&(!b||b<=7))this.iframe=i('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a);if(this._hasPushState)i(window).bind("popstate",this.checkUrl);else if(this._wantsHashChange&&"onhashchange"in window&&!b)i(window).bind("hashchange",this.checkUrl);else if(this._wantsHashChange)this._checkUrlInterval=setInterval(this.checkUrl,this.interval);this.fragment=a;a=window.location;b=a.pathname==this.options.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!b)return this.fragment=this.getFragment(null,!0),window.location.replace(this.options.root+"#"+this.fragment),!0;else if(this._wantsPushState&&this._hasPushState&&b&&a.hash)this.fragment=this.getHash().replace(s,""),window.history.replaceState({},document.title,a.protocol+"//"+a.host+this.options.root+this.fragment);if(!this.options.silent)return this.loadUrl()},stop:function(){i(window).unbind("popstate",this.checkUrl).unbind("hashchange",this.checkUrl);clearInterval(this._checkUrlInterval);m.started=!1},route:function(a,b){this.handlers.unshift({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();a==this.fragment&&this.iframe&&(a=this.getFragment(this.getHash(this.iframe)));if(a==this.fragment)return!1;this.iframe&&this.navigate(a);this.loadUrl()||this.loadUrl(this.getHash())},loadUrl:function(a){var b=this.fragment=this.getFragment(a);return f.any(this.handlers,function(a){if(a.route.test(b))return a.callback(b),!0})},navigate:function(a,b){if(!m.started)return!1;if(!b||b===!0)b={trigger:b};var c=(a||"").replace(s,"");if(this.fragment!=c)this._hasPushState?(c.indexOf(this.options.root)!=0&&(c=this.options.root+c),this.fragment=c,window.history[b.replace?"replaceState":"pushState"]({},document.title,c)):this._wantsHashChange?(this.fragment=c,this._updateHash(window.location,c,b.replace),this.iframe&&c!=this.getFragment(this.getHash(this.iframe))&&(b.replace||this.iframe.document.open().close(),this._updateHash(this.iframe.location,c,b.replace))):window.location.assign(this.options.root+a),b.trigger&&this.loadUrl(a)},_updateHash:function(a,b,c){c?a.replace(a.toString().replace(/(javascript:|#).*$/,"")+"#"+b):a.hash=b}});var v=g.View=function(a){this.cid=f.uniqueId("view");this._configure(a||{});this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()},F=/^(\S+)\s*(.*)$/,w="model,collection,el,id,attributes,className,tagName".split(",");
f.extend(v.prototype,k,{tagName:"div",$:function(a){return this.$el.find(a)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();return this},make:function(a,b,c){a=document.createElement(a);b&&i(a).attr(b);c&&i(a).html(c);return a},setElement:function(a,b){this.$el&&this.undelegateEvents();this.$el=a instanceof i?a:i(a);this.el=this.$el[0];b!==!1&&this.delegateEvents();return this},delegateEvents:function(a){if(a||(a=n(this,"events"))){this.undelegateEvents();for(var b in a){var c=a[b];f.isFunction(c)||(c=this[a[b]]);if(!c)throw Error('Method "'+a[b]+'" does not exist');var d=b.match(F),e=d[1],d=d[2],c=f.bind(c,this);e+=".delegateEvents"+this.cid;d===""?this.$el.bind(e,c):this.$el.delegate(d,e,c)}}},undelegateEvents:function(){this.$el.unbind(".delegateEvents"+this.cid)},_configure:function(a){this.options&&(a=f.extend({},this.options,a));for(var b=0,c=w.length;b<c;b++){var d=w[b];a[d]&&(this[d]=a[d])}this.options=a},_ensureElement:function(){if(this.el)this.setElement(this.el,!1);else{var a=n(this,"attributes")||{};if(this.id)a.id=this.id;if(this.className)a["class"]=this.className;this.setElement(this.make(this.tagName,a),!1)}}});o.extend=r.extend=u.extend=v.extend=function(a,b){var c=G(this,a,b);c.extend=this.extend;return c};var H={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};g.sync=function(a,b,c){var d=H[a];c||(c={});var e={type:d,dataType:"json"};if(!c.url)e.url=n(b,"url")||t();if(!c.data&&b&&(a=="create"||a=="update"))e.contentType="application/json",e.data=JSON.stringify(b.toJSON());if(g.emulateJSON)e.contentType="application/x-www-form-urlencoded",e.data=e.data?{model:e.data}:{};if(g.emulateHTTP&&(d==="PUT"||d==="DELETE")){if(g.emulateJSON)e.data._method=d;e.type="POST";e.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",d)}}if(e.type!=="GET"&&!g.emulateJSON)e.processData=!1;return i.ajax(f.extend(e,c))};g.wrapError=function(a,b,c){return function(d,e){e=d===b?e:d;a?a(b,e,c):b.trigger("error",b,e,c)}};var x=function(){},G=function(a,b,c){var d;d=b&&b.hasOwnProperty("constructor")?b.constructor:function(){a.apply(this,arguments)};f.extend(d,a);x.prototype=a.prototype;d.prototype=new x;b&&f.extend(d.prototype,b);c&&f.extend(d,c);d.prototype.constructor=d;d.__super__=a.prototype;return d},n=function(a,b){return!a||!a[b]?null:f.isFunction(a[b])?a[b]():a[b]},t=function(){throw Error('A "url" property or function must be specified');}}).call(this);Backbone.Paginator =(function (Backbone,_,$) {"use strict";var Paginator ={};Paginator.version ="0.15";Paginator.clientPager =Backbone.Collection.extend({sync:function (method,model,options) {var queryMap ={};queryMap[this.pageSizeAttribute] =this.pageSize;queryMap[this.skipAttribute] =this.page * this.pageSize;queryMap[this.orderAttribute] =this.sortField;queryMap[this.customAttribute1] =this.customParam1;queryMap[this.formatAttribute] =this.format;queryMap[this.customAttribute2] =this.customParam2;queryMap[this.queryAttribute] =this.query;var params =_.extend({type:'GET',dataType:'jsonp',jsonpCallback:'callback',data:decodeURIComponent($.param(queryMap)),url:this.url,processData:false
},options);return $.ajax(params);},nextPage:function () {this.page =++this.page;this.pager();},previousPage:function () {this.page =--this.page ||1;this.pager();},goTo:function (page) {if(page !==undefined){this.page =parseInt(page,10);this.pager();}
},howManyPer:function (pageSize) {if(pageSize !==undefined){this.displayPerPage =parseInt(pageSize,10);this.pager();}
},setSort:function (column,direction) {if(column !==undefined &&direction !==undefined){this.pager(column,direction);}
},pager:function (sort,direction) {var self =this,disp =this.displayPerPage,start =(self.page - 1) * disp,stop =start + disp;if (self.origModels ===undefined) {self.origModels =self.models;}
self.models =self.origModels;if (sort) {self.models =self._sort(self.models,sort,direction);}
self.reset(self.models.slice(start,stop));},_sort:function (models,sort,direction) {models =models.sort(function (a,b) {var ac =a.get(sort),bc =b.get(sort);if (direction ==='desc') {if (ac > bc) {return -1;}
if (ac < bc) {return 1;}
} else {if (ac < bc) {return -1;}
if (ac > bc) {return 1;}
}
return 0;});return models;},info:function () {var self =this,info ={},totalRecords =(self.origModels) ?self.origModels.length :self.length,totalPages =Math.ceil(totalRecords / self.displayPerPage);info ={totalRecords:totalRecords,page:self.page,pageSize:this.displayPerPage,totalPages:totalPages,lastPage:totalPages,lastPagem1:totalPages - 1,previous:false,next:false,page_set:[],startRecord:(self.page - 1) * this.displayPerPage + 1,endRecord:Math.min(totalRecords,self.page * this.displayPerPage)
};if (self.page > 1) {info.prev =self.page - 1;}
if (self.page < info.totalPages) {info.next =self.page + 1;}
info.pageSet =self.setPagination(info);self.information =info;return info;},setPagination:function (info) {var pages =[],i =0,l =0;var ADJACENT =3,ADJACENTx2 =ADJACENT * 2,LASTPAGE =Math.ceil(info.totalRecords / info.pageSize),LPM1 =-1;if (LASTPAGE > 1) {if (LASTPAGE < (7 + ADJACENTx2)) {for (i =1,l =LASTPAGE;i <=l;i++) {pages.push(i);}
}
else if (LASTPAGE > (5 + ADJACENTx2)) {if (info.page < (1 + ADJACENTx2)) {for (i =1,l =4 + ADJACENTx2;i < l;i++) {pages.push(i);}
}
else if (LASTPAGE - ADJACENTx2 > info.page &&info.page > ADJACENTx2) {for (i =info.page - ADJACENT;i <=info.page + ADJACENT;i++) {pages.push(i);}
}
else {for (i =LASTPAGE - (2 + ADJACENTx2);i <=LASTPAGE;i++) {pages.push(i);}
}
}
}
return pages;}
});Paginator.requestPager =Backbone.Collection.extend({sync:function (method,model,options) {var queryMap ={},url ="",params;queryMap[this.pageSizeAttribute] =(model &&model.pageSize) ||this.pageSize;queryMap[this.skipAttribute] =(model &&model.page) ||this.page;queryMap[this.orderAttribute] =(model &&model.sortField) ||this.sortField;queryMap[this.customAttribute1] =model &&typeof model.customParam1 !=="undefined"?model.customParam1
 :this.customParam1;queryMap[this.formatAttribute] =this.format;queryMap[this.customAttribute2] =this.customParam2;queryMap[this.queryAttribute] =(model &&model.query) ||this.query;if (!_.isEmpty(this.custom_query_string_params)) {if (!_.isUndefined(this.custom_query_string_params.customParam1)) {delete this.custom_query_string_params.customParam1;}
for (var key in queryMap) {if (queryMap.hasOwnProperty(key)) {if (queryMap[key] ==null) {delete queryMap[key];}
}
}
}
 var data_args ={type:'GET',cache:false,dataType:'json'};_.extend(options.data ||{},this.custom_query_string_params,queryMap);for (var key in options.data) {if (options.data.hasOwnProperty(key)) {if (options.data[key] ==null) {delete options.data[key];}
 }
 }
params =_.extend(data_args,options);return $.ajax(params);},requestNextPage:function () {if (this.page !==undefined) {this.page +=1;this.pager();}
},requestPreviousPage:function () {if (this.page !==undefined) {this.page -=1;this.pager();}
},updateOrder:function (column) {if (column !==undefined) {this.sortField =column;this.pager();}
},goTo:function (page) {if(page !==undefined){this.page =parseInt(page,10);this.pager();}
},howManyPer:function (count) {if(count !==undefined){this.page =this.firstPage;this.pageSize =count;this.pager();}
},sort:function () {},info:function () {var info ={page:this.page,firstPage:this.firstPage,totalPages:this.totalPages,lastPage:this.totalPages,pageSize:this.pageSize
};this.information =info;return info;},pager:function () {return this.fetch();}
});return Paginator;}(Backbone,_,$));this.Handlebars ={};(function(Handlebars) {Handlebars.VERSION ="1.0.rc.1";Handlebars.helpers ={};Handlebars.partials ={};Handlebars.registerHelper =function(name,fn,inverse) {if(inverse) {fn.not =inverse;}
 this.helpers[name] =fn;};Handlebars.registerPartial =function(name,str) {this.partials[name] =str;};Handlebars.registerHelper('helperMissing',function(arg) {if(arguments.length ===2) {return undefined;} else {throw new Error("Could not find property '"+ arg + "'");}
});var toString =Object.prototype.toString,functionType ="[object Function]";Handlebars.registerHelper('blockHelperMissing',function(context,options) {var inverse =options.inverse ||function() {},fn =options.fn;var ret ="";var type =toString.call(context);if(type ===functionType) {context =context.call(this);}
 if(context ===true) {return fn(this);} else if(context ===false ||context ==null) {return inverse(this);} else if(type ==="[object Array]") {if(context.length > 0) {return Handlebars.helpers.each(context,options);} else {return inverse(this);}
 } else {return fn(context);}
});Handlebars.K =function() {};Handlebars.createFrame =Object.create ||function(object) {Handlebars.K.prototype =object;var obj =new Handlebars.K();Handlebars.K.prototype =null;return obj;};Handlebars.registerHelper('each',function(context,options) {var fn =options.fn,inverse =options.inverse;var ret ="",data;if (options.data) {data =Handlebars.createFrame(options.data);}
 if(context &&context.length > 0) {for(var i=0,j=context.length;i<j;i++) {if (data) {data.index =i;}
 ret =ret + fn(context[i],{data:data });}
 } else {ret =inverse(this);}
 return ret;});Handlebars.registerHelper('if',function(context,options) {var type =toString.call(context);if(type ===functionType) {context =context.call(this);}
 if(!context ||Handlebars.Utils.isEmpty(context)) {return options.inverse(this);} else {return options.fn(this);}
});Handlebars.registerHelper('unless',function(context,options) {var fn =options.fn,inverse =options.inverse;options.fn =inverse;options.inverse =fn;return Handlebars.helpers['if'].call(this,context,options);});Handlebars.registerHelper('with',function(context,options) {return options.fn(context);});Handlebars.registerHelper('log',function(context) {Handlebars.log(context);});}(this.Handlebars));;Handlebars.Exception =function(message) {var tmp =Error.prototype.constructor.apply(this,arguments);for (var p in tmp) {if (tmp.hasOwnProperty(p)) {this[p] =tmp[p];}
 }
 this.message =tmp.message;};Handlebars.Exception.prototype =new Error();Handlebars.SafeString =function(string) {this.string =string;};Handlebars.SafeString.prototype.toString =function() {return this.string.toString();};(function() {var escape ={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};var badChars =/[&<>"'`]/g;
 var possible =/[&<>"'`]/;

 var escapeChar =function(chr) {return escape[chr] ||"&amp;";};Handlebars.Utils ={escapeExpression:function(string) {if (string instanceof Handlebars.SafeString) {return string.toString();} else if (string ==null ||string ===false) {return "";}
 if(!possible.test(string)) {return string;}
 return string.replace(badChars,escapeChar);},isEmpty:function(value) {if (typeof value ==="undefined") {return true;} else if (value ===null) {return true;} else if (value ===false) {return true;} else if(Object.prototype.toString.call(value) ==="[object Array]"&&value.length ===0) {return true;} else {return false;}
 }
 };})();;Handlebars.VM ={template:function(templateSpec) {var container ={escapeExpression:Handlebars.Utils.escapeExpression,invokePartial:Handlebars.VM.invokePartial,programs:[],program:function(i,fn,data) {var programWrapper =this.programs[i];if(data) {return Handlebars.VM.program(fn,data);} else if(programWrapper) {return programWrapper;} else {programWrapper =this.programs[i] =Handlebars.VM.program(fn);return programWrapper;}
 },programWithDepth:Handlebars.VM.programWithDepth,noop:Handlebars.VM.noop
 };return function(context,options) {options =options ||{};return templateSpec.call(container,Handlebars,context,options.helpers,options.partials,options.data);};},programWithDepth:function(fn,data,$depth) {var args =Array.prototype.slice.call(arguments,2);return function(context,options) {options =options ||{};return fn.apply(this,[context,options.data ||data].concat(args));};},program:function(fn,data) {return function(context,options) {options =options ||{};return fn(context,options.data ||data);};},noop:function() {return "";},invokePartial:function(partial,name,context,helpers,partials,data) {var options ={helpers:helpers,partials:partials,data:data };if(partial ===undefined) {throw new Handlebars.Exception("The partial "+ name + " could not be found");} else if(partial instanceof Function) {return partial(context,options);} else if (!Handlebars.compile) {throw new Handlebars.Exception("The partial "+ name + " could not be compiled when running in runtime-only mode");} else {partials[name] =Handlebars.compile(partial,{data:data !==undefined});return partials[name](context,options);}
 }
};Handlebars.template =Handlebars.VM.template;;(function ($,window,undefined) {var isTouch ='ontouchstart'in window;$.fn.finger =function () {if (isTouch) {this.on.apply(this,arguments);}
 return this;};$.fn.pointer =function () {if (!isTouch) {this.on.apply(this,arguments);}
 return this;};$.fn.fipo =function () {var args =Array.prototype.slice.call(arguments,1,arguments.length);this.pointer.apply(this,args);args[0] =arguments[0];this.finger.apply(this,args);return this;};}(jQuery,this));(function (undefined) {var moment,VERSION ="1.7.2",round =Math.round,i,languages ={},currentLanguage ='en',hasModule =(typeof module !=='undefined'&&module.exports),langConfigProperties ='months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),aspNetJsonRegex =/^\/?Date\((\-?\d+)/i,

 formattingTokens =/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|.)/g,
 localFormattingTokens =/(\[[^\[]*\])|(\\)?(LT|LL?L?L?)/g,

 parseMultipleFormatChunker =/([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

 parseTokenOneOrTwoDigits =/\d\d?/, // 0 - 99
 parseTokenOneToThreeDigits =/\d{1,3}/, // 0 - 999
 parseTokenThreeDigits =/\d{3}/, // 000 - 999
 parseTokenFourDigits =/\d{1,4}/, // 0 - 9999
 parseTokenWord =/[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, // any word characters or numbers
 parseTokenTimezone =/Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
 parseTokenT =/T/i, // T (ISO seperator)

 isoRegex =/^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
 isoFormat ='YYYY-MM-DDTHH:mm:ssZ',isoTimes =[['HH:mm:ss.S',/T\d\d:\d\d:\d\d\.\d{1,3}/],
 ['HH:mm:ss',/T\d\d:\d\d:\d\d/],
 ['HH:mm',/T\d\d:\d\d/],
 ['HH',/T\d\d/]
 ],parseTimezoneChunker =/([\+\-]|\d\d)/gi,

 proxyGettersAndSetters ='Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),unitMillisecondFactors ={'Milliseconds':1,'Seconds':1e3,'Minutes':6e4,'Hours':36e5,'Days':864e5,'Months':2592e6,'Years':31536e6
 },formatFunctions ={},ordinalizeTokens ='DDD w M D d'.split(' '),paddedTokens ='M D H h m s w'.split(' '),formatTokenFunctions ={M :function () {return this.month() + 1;},MMM :function (format) {return getValueFromArray("monthsShort",this.month(),this,format);},MMMM :function (format) {return getValueFromArray("months",this.month(),this,format);},D :function () {return this.date();},DDD :function () {var a =new Date(this.year(),this.month(),this.date()),b =new Date(this.year(),0,1);return ~~(((a - b) / 864e5) + 1.5);},d :function () {return this.day();},dd :function (format) {return getValueFromArray("weekdaysMin",this.day(),this,format);},ddd :function (format) {return getValueFromArray("weekdaysShort",this.day(),this,format);},dddd :function (format) {return getValueFromArray("weekdays",this.day(),this,format);},w :function () {var a =new Date(this.year(),this.month(),this.date() - this.day() + 5),b =new Date(a.getFullYear(),0,4);return ~~((a - b) / 864e5 / 7 + 1.5);},YY :function () {return leftZeroFill(this.year() % 100,2);},YYYY :function () {return leftZeroFill(this.year(),4);},a :function () {return this.lang().meridiem(this.hours(),this.minutes(),true);},A :function () {return this.lang().meridiem(this.hours(),this.minutes(),false);},H :function () {return this.hours();},h :function () {return this.hours() % 12 ||12;},m :function () {return this.minutes();},s :function () {return this.seconds();},S :function () {return ~~(this.milliseconds() / 100);},SS :function () {return leftZeroFill(~~(this.milliseconds() / 10),2);},SSS :function () {return leftZeroFill(this.milliseconds(),3);},Z :function () {var a =-this.zone(),b ="+";if (a < 0) {a =-a;b ="-";}
 return b + leftZeroFill(~~(a / 60),2) + ":"+ leftZeroFill(~~a % 60,2);},ZZ :function () {var a =-this.zone(),b ="+";if (a < 0) {a =-a;b ="-";}
 return b + leftZeroFill(~~(10 * a / 6),4);}
 };function getValueFromArray(key,index,m,format) {var lang =m.lang();return lang[key].call ?lang[key](m,format) :lang[key][index];}
 function padToken(func,count) {return function (a) {return leftZeroFill(func.call(this,a),count);};}
 function ordinalizeToken(func) {return function (a) {var b =func.call(this,a);return b + this.lang().ordinal(b);};}
 while (ordinalizeTokens.length) {i =ordinalizeTokens.pop();formatTokenFunctions[i + 'o'] =ordinalizeToken(formatTokenFunctions[i]);}
 while (paddedTokens.length) {i =paddedTokens.pop();formatTokenFunctions[i + i] =padToken(formatTokenFunctions[i],2);}
 formatTokenFunctions.DDDD =padToken(formatTokenFunctions.DDD,3);function Moment(date,isUTC,lang) {this._d =date;this._isUTC =!!isUTC;this._a =date._a ||null;this._lang =lang ||false;}
 function Duration(duration) {var data =this._data ={},years =duration.years ||duration.y ||0,months =duration.months ||duration.M ||0,weeks =duration.weeks ||duration.w ||0,days =duration.days ||duration.d ||0,hours =duration.hours ||duration.h ||0,minutes =duration.minutes ||duration.m ||0,seconds =duration.seconds ||duration.s ||0,milliseconds =duration.milliseconds ||duration.ms ||0;this._milliseconds =milliseconds +
 seconds * 1e3 + minutes * 6e4 + hours * 36e5;this._days =days +
 weeks * 7;this._months =months +
 years * 12;data.milliseconds =milliseconds % 1000;seconds +=absRound(milliseconds / 1000);data.seconds =seconds % 60;minutes +=absRound(seconds / 60);data.minutes =minutes % 60;hours +=absRound(minutes / 60);data.hours =hours % 24;days +=absRound(hours / 24);days +=weeks * 7;data.days =days % 30;months +=absRound(days / 30);data.months =months % 12;years +=absRound(months / 12);data.years =years;this._lang =false;}
 function absRound(number) {if (number < 0) {return Math.ceil(number);} else {return Math.floor(number);}
 }
 function leftZeroFill(number,targetLength) {var output =number + '';while (output.length < targetLength) {output ='0'+ output;}
 return output;}
 function addOrSubtractDurationFromMoment(mom,duration,isAdding) {var ms =duration._milliseconds,d =duration._days,M =duration._months,currentDate;if (ms) {mom._d.setTime(+mom + ms * isAdding);}
 if (d) {mom.date(mom.date() + d * isAdding);}
 if (M) {currentDate =mom.date();mom.date(1)
 .month(mom.month() + M * isAdding)
 .date(Math.min(currentDate,mom.daysInMonth()));}
 }
 function isArray(input) {return Object.prototype.toString.call(input) ==='[object Array]';}
 function compareArrays(array1,array2) {var len =Math.min(array1.length,array2.length),lengthDiff =Math.abs(array1.length - array2.length),diffs =0,i;for (i =0;i < len;i++) {if (~~array1[i] !==~~array2[i]) {diffs++;}
 }
 return diffs + lengthDiff;}
 function dateFromArray(input,asUTC,hoursOffset,minutesOffset) {var i,date,forValid =[];for (i =0;i < 7;i++) {forValid[i] =input[i] =(input[i] ==null) ?(i ===2 ?1 :0) :input[i];}
 input[7] =forValid[7] =asUTC;if (input[8] !=null) {forValid[8] =input[8];}
 input[3] +=hoursOffset ||0;input[4] +=minutesOffset ||0;date =new Date(0);if (asUTC) {date.setUTCFullYear(input[0],input[1],input[2]);date.setUTCHours(input[3],input[4],input[5],input[6]);} else {date.setFullYear(input[0],input[1],input[2]);date.setHours(input[3],input[4],input[5],input[6]);}
 date._a =forValid;return date;}
 function loadLang(key,values) {var i,m,parse =[];if (!values &&hasModule) {values =require('./lang/'+ key);}
 for (i =0;i < langConfigProperties.length;i++) {values[langConfigProperties[i]] =values[langConfigProperties[i]] ||languages.en[langConfigProperties[i]];}
 for (i =0;i < 12;i++) {m =moment([2000,i]);parse[i] =new RegExp('^'+ (values.months[i] ||values.months(m,'')) +
 '|^'+ (values.monthsShort[i] ||values.monthsShort(m,'')).replace('.',''),'i');}
 values.monthsParse =values.monthsParse ||parse;languages[key] =values;return values;}
 function getLangDefinition(m) {var langKey =(typeof m ==='string') &&m ||m &&m._lang ||null;return langKey ?(languages[langKey] ||loadLang(langKey)) :moment;}
 function removeFormattingTokens(input) {if (input.match(/\[.*\]/)) {
 return input.replace(/^\[|\]$/g, "");
 }
 return input.replace(/\\/g, "");
 }
 function makeFormatFunction(format) {var array =format.match(formattingTokens),i,length;for (i =0,length =array.length;i < length;i++) {if (formatTokenFunctions[array[i]]) {array[i] =formatTokenFunctions[array[i]];} else {array[i] =removeFormattingTokens(array[i]);}
 }
 return function (mom) {var output ="";for (i =0;i < length;i++) {output +=typeof array[i].call ==='function'?array[i].call(mom,format) :array[i];}
 return output;};}
 function formatMoment(m,format) {var i =5;function replaceLongDateFormatTokens(input) {return m.lang().longDateFormat[input] ||input;}
 while (i-- &&localFormattingTokens.test(format)) {format =format.replace(localFormattingTokens,replaceLongDateFormatTokens);}
 if (!formatFunctions[format]) {formatFunctions[format] =makeFormatFunction(format);}
 return formatFunctions[format](m);}
 function getParseRegexForToken(token) {switch (token) {case 'DDDD':return parseTokenThreeDigits;case 'YYYY':return parseTokenFourDigits;case 'S':case 'SS':case 'SSS':case 'DDD':return parseTokenOneToThreeDigits;case 'MMM':case 'MMMM':case 'dd':case 'ddd':case 'dddd':case 'a':case 'A':return parseTokenWord;case 'Z':case 'ZZ':return parseTokenTimezone;case 'T':return parseTokenT;case 'MM':case 'DD':case 'YY':case 'HH':case 'hh':case 'mm':case 'ss':case 'M':case 'D':case 'd':case 'H':case 'h':case 'm':case 's':return parseTokenOneOrTwoDigits;default :return new RegExp(token.replace('\\',''));}
 }
 function addTimeToArrayFromToken(token,input,datePartArray,config) {var a,b;switch (token) {case 'M':case 'MM':datePartArray[1] =(input ==null) ?0 :~~input - 1;break;case 'MMM':case 'MMMM':for (a =0;a < 12;a++) {if (getLangDefinition().monthsParse[a].test(input)) {datePartArray[1] =a;b =true;break;}
 }
 if (!b) {datePartArray[8] =false;}
 break;case 'D':case 'DD':case 'DDD':case 'DDDD':if (input !=null) {datePartArray[2] =~~input;}
 break;case 'YY':datePartArray[0] =~~input + (~~input > 70 ?1900 :2000);break;case 'YYYY':datePartArray[0] =~~Math.abs(input);break;case 'a':case 'A':config.isPm =((input + '').toLowerCase() ==='pm');break;case 'H':case 'HH':case 'h':case 'hh':datePartArray[3] =~~input;break;case 'm':case 'mm':datePartArray[4] =~~input;break;case 's':case 'ss':datePartArray[5] =~~input;break;case 'S':case 'SS':case 'SSS':datePartArray[6] =~~ (('0.'+ input) * 1000);break;case 'Z':case 'ZZ':config.isUTC =true;a =(input + '').match(parseTimezoneChunker);if (a &&a[1]) {config.tzh =~~a[1];}
 if (a &&a[2]) {config.tzm =~~a[2];}
 if (a &&a[0] ==='+') {config.tzh =-config.tzh;config.tzm =-config.tzm;}
 break;}
 if (input ==null) {datePartArray[8] =false;}
 }
 function makeDateFromStringAndFormat(string,format) {var datePartArray =[0,0,1,0,0,0,0],config ={tzh :0,tzm :0 },tokens =format.match(formattingTokens),i,parsedInput;for (i =0;i < tokens.length;i++) {parsedInput =(getParseRegexForToken(tokens[i]).exec(string) ||[])[0];if (parsedInput) {string =string.slice(string.indexOf(parsedInput) + parsedInput.length);}
 if (formatTokenFunctions[tokens[i]]) {addTimeToArrayFromToken(tokens[i],parsedInput,datePartArray,config);}
 }
 if (config.isPm &&datePartArray[3] < 12) {datePartArray[3] +=12;}
 if (config.isPm ===false &&datePartArray[3] ===12) {datePartArray[3] =0;}
 return dateFromArray(datePartArray,config.isUTC,config.tzh,config.tzm);}
 function makeDateFromStringAndArray(string,formats) {var output,inputParts =string.match(parseMultipleFormatChunker) ||[],formattedInputParts,scoreToBeat =99,i,currentDate,currentScore;for (i =0;i < formats.length;i++) {currentDate =makeDateFromStringAndFormat(string,formats[i]);formattedInputParts =formatMoment(new Moment(currentDate),formats[i]).match(parseMultipleFormatChunker) ||[];currentScore =compareArrays(inputParts,formattedInputParts);if (currentScore < scoreToBeat) {scoreToBeat =currentScore;output =currentDate;}
 }
 return output;}
 function makeDateFromString(string) {var format ='YYYY-MM-DDT',i;if (isoRegex.exec(string)) {for (i =0;i < 4;i++) {if (isoTimes[i][1].exec(string)) {format +=isoTimes[i][0];break;}
 }
 return parseTokenTimezone.exec(string) ?makeDateFromStringAndFormat(string,format + ' Z') :makeDateFromStringAndFormat(string,format);}
 return new Date(string);}
 function substituteTimeAgo(string,number,withoutSuffix,isFuture,lang) {var rt =lang.relativeTime[string];return (typeof rt ==='function') ?rt(number ||1,!!withoutSuffix,string,isFuture) :rt.replace(/%d/i, number || 1);
 }
 function relativeTime(milliseconds,withoutSuffix,lang) {var seconds =round(Math.abs(milliseconds) / 1000),minutes =round(seconds / 60),hours =round(minutes / 60),days =round(hours / 24),years =round(days / 365),args =seconds < 45 &&['s',seconds] ||minutes ===1 &&['m'] ||minutes < 45 &&['mm',minutes] ||hours ===1 &&['h'] ||hours < 22 &&['hh',hours] ||days ===1 &&['d'] ||days <=25 &&['dd',days] ||days <=45 &&['M'] ||days < 345 &&['MM',round(days / 30)] ||years ===1 &&['y'] ||['yy',years];args[2] =withoutSuffix;args[3] =milliseconds > 0;args[4] =lang;return substituteTimeAgo.apply({},args);}
 moment =function (input,format) {if (input ===null ||input ==='') {return null;}
 var date,matched;if (moment.isMoment(input)) {return new Moment(new Date(+input._d),input._isUTC,input._lang);} else if (format) {if (isArray(format)) {date =makeDateFromStringAndArray(input,format);} else {date =makeDateFromStringAndFormat(input,format);}
 } else {matched =aspNetJsonRegex.exec(input);date =input ===undefined ?new Date() :matched ?new Date(+matched[1]) :input instanceof Date ?input :isArray(input) ?dateFromArray(input) :typeof input ==='string'?makeDateFromString(input) :new Date(input);}
 return new Moment(date);};moment.utc =function (input,format) {if (isArray(input)) {return new Moment(dateFromArray(input,true),true);}
 if (typeof input ==='string'&&!parseTokenTimezone.exec(input)) {input +=' +0000';if (format) {format +=' Z';}
 }
 return moment(input,format).utc();};moment.unix =function (input) {return moment(input * 1000);};moment.duration =function (input,key) {var isDuration =moment.isDuration(input),isNumber =(typeof input ==='number'),duration =(isDuration ?input._data :(isNumber ?{} :input)),ret;if (isNumber) {if (key) {duration[key] =input;} else {duration.milliseconds =input;}
 }
 ret =new Duration(duration);if (isDuration) {ret._lang =input._lang;}
 return ret;};moment.humanizeDuration =function (num,type,withSuffix) {return moment.duration(num,type ===true ?null :type).humanize(type ===true ?true :withSuffix);};moment.version =VERSION;moment.defaultFormat =isoFormat;moment.lang =function (key,values) {var i;if (!key) {return currentLanguage;}
 if (values ||!languages[key]) {loadLang(key,values);}
 if (languages[key]) {for (i =0;i < langConfigProperties.length;i++) {moment[langConfigProperties[i]] =languages[key][langConfigProperties[i]];}
 moment.monthsParse =languages[key].monthsParse;currentLanguage =key;}
 };moment.langData =getLangDefinition;moment.isMoment =function (obj) {return obj instanceof Moment;};moment.isDuration =function (obj) {return obj instanceof Duration;};moment.lang('en',{months :"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort :"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays :"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort :"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin :"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),longDateFormat :{LT :"h:mm A",L :"MM/DD/YYYY",LL :"MMMM D YYYY",LLL :"MMMM D YYYY LT",LLLL :"dddd, MMMM D YYYY LT"},meridiem :function (hours,minutes,isLower) {if (hours > 11) {return isLower ?'pm':'PM';} else {return isLower ?'am':'AM';}
 },calendar :{sameDay :'[Today at] LT',nextDay :'[Tomorrow at] LT',nextWeek :'dddd [at] LT',lastDay :'[Yesterday at] LT',lastWeek :'[last] dddd [at] LT',sameElse :'L'},relativeTime :{future :"in %s",past :"%s ago",s :"a few seconds",m :"a minute",mm :"%d minutes",h :"an hour",hh :"%d hours",d :"a day",dd :"%d days",M :"a month",MM :"%d months",y :"a year",yy :"%d years"},ordinal :function (number) {var b =number % 10;return (~~ (number % 100 / 10) ===1) ?'th':(b ===1) ?'st':(b ===2) ?'nd':(b ===3) ?'rd':'th';}
 });moment.fn =Moment.prototype ={clone :function () {return moment(this);},valueOf :function () {return +this._d;},unix :function () {return Math.floor(+this._d / 1000);},toString :function () {return this._d.toString();},toDate :function () {return this._d;},toArray :function () {var m =this;return [m.year(),m.month(),m.date(),m.hours(),m.minutes(),m.seconds(),m.milliseconds(),!!this._isUTC
 ];},isValid :function () {if (this._a) {if (this._a[8] !=null) {return !!this._a[8];}
 return !compareArrays(this._a,(this._a[7] ?moment.utc(this._a) :moment(this._a)).toArray());}
 return !isNaN(this._d.getTime());},utc :function () {this._isUTC =true;return this;},local :function () {this._isUTC =false;return this;},format :function (inputString) {return formatMoment(this,inputString ?inputString :moment.defaultFormat);},add :function (input,val) {var dur =val ?moment.duration(+val,input) :moment.duration(input);addOrSubtractDurationFromMoment(this,dur,1);return this;},subtract :function (input,val) {var dur =val ?moment.duration(+val,input) :moment.duration(input);addOrSubtractDurationFromMoment(this,dur,-1);return this;},diff :function (input,val,asFloat) {var inputMoment =this._isUTC ?moment(input).utc() :moment(input).local(),zoneDiff =(this.zone() - inputMoment.zone()) * 6e4,diff =this._d - inputMoment._d - zoneDiff,year =this.year() - inputMoment.year(),month =this.month() - inputMoment.month(),date =this.date() - inputMoment.date(),output;if (val ==='months') {output =year * 12 + month + date / 30;} else if (val ==='years') {output =year + (month + date / 30) / 12;} else {output =val ==='seconds'?diff / 1e3 :val ==='minutes'?diff / 6e4 :val ==='hours'?diff / 36e5 :val ==='days'?diff / 864e5 :val ==='weeks'?diff / 6048e5 :diff;}
 return asFloat ?output :round(output);},from :function (time,withoutSuffix) {return moment.duration(this.diff(time)).lang(this._lang).humanize(!withoutSuffix);},fromNow :function (withoutSuffix) {return this.from(moment(),withoutSuffix);},calendar :function () {var diff =this.diff(moment().sod(),'days',true),calendar =this.lang().calendar,allElse =calendar.sameElse,format =diff < -6 ?allElse :diff < -1 ?calendar.lastWeek :diff < 0 ?calendar.lastDay :diff < 1 ?calendar.sameDay :diff < 2 ?calendar.nextDay :diff < 7 ?calendar.nextWeek :allElse;return this.format(typeof format ==='function'?format.apply(this) :format);},isLeapYear :function () {var year =this.year();return (year % 4 ===0 &&year % 100 !==0) ||year % 400 ===0;},isDST :function () {return (this.zone() < moment([this.year()]).zone() ||this.zone() < moment([this.year(),5]).zone());},day :function (input) {var day =this._isUTC ?this._d.getUTCDay() :this._d.getDay();return input ==null ?day :this.add({d :input - day });},startOf:function (val) {switch (val.replace(/s$/, '')) {
 case 'year':this.month(0);case 'month':this.date(1);case 'day':this.hours(0);case 'hour':this.minutes(0);case 'minute':this.seconds(0);case 'second':this.milliseconds(0);}
 return this;},endOf:function (val) {return this.startOf(val).add(val.replace(/s?$/, 's'), 1).subtract('ms', 1);
 },sod:function () {return this.clone().startOf('day');},eod:function () {return this.clone().endOf('day');},zone :function () {return this._isUTC ?0 :this._d.getTimezoneOffset();},daysInMonth :function () {return moment.utc([this.year(),this.month() + 1,0]).date();},lang :function (lang) {if (lang ===undefined) {return getLangDefinition(this);} else {this._lang =lang;return this;}
 }
 };function makeGetterAndSetter(name,key) {moment.fn[name] =function (input) {var utc =this._isUTC ?'UTC':'';if (input !=null) {this._d['set'+ utc + key](input);return this;} else {return this._d['get'+ utc + key]();}
 };}
 for (i =0;i < proxyGettersAndSetters.length;i ++) {makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase(),proxyGettersAndSetters[i]);}
 makeGetterAndSetter('year','FullYear');moment.duration.fn =Duration.prototype ={weeks :function () {return absRound(this.days() / 7);},valueOf :function () {return this._milliseconds +
 this._days * 864e5 +
 this._months * 2592e6;},humanize :function (withSuffix) {var difference =+this,rel =this.lang().relativeTime,output =relativeTime(difference,!withSuffix,this.lang()),fromNow =difference <=0 ?rel.past :rel.future;if (withSuffix) {if (typeof fromNow ==='function') {output =fromNow(output);} else {output =fromNow.replace(/%s/i, output);
 }
 }
 return output;},lang :moment.fn.lang
 };function makeDurationGetter(name) {moment.duration.fn[name] =function () {return this._data[name];};}
 function makeDurationAsGetter(name,factor) {moment.duration.fn['as'+ name] =function () {return +this / factor;};}
 for (i in unitMillisecondFactors) {if (unitMillisecondFactors.hasOwnProperty(i)) {makeDurationAsGetter(i,unitMillisecondFactors[i]);makeDurationGetter(i.toLowerCase());}
 }
 makeDurationAsGetter('Weeks',6048e5);if (hasModule) {module.exports =moment;}
 if (typeof ender ==='undefined') {this['moment'] =moment;}
 if (typeof define ==="function"&&define.amd) {define("moment",[],function () {return moment;});}
}).call(this);this["CUI"] =this["CUI"] ||{};this["CUI"]["Templates"] =this["CUI"]["Templates"] ||{};this["CUI"]["Templates"]["alert"] =Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {this.compilerInfo =[2,'>= 1.0.0-rc.3'];helpers =helpers ||Handlebars.helpers;data =data ||{};var buffer ="",stack1,functionType="function";buffer +="<button class=\"close\" data-dismiss=\"alert\">&times;</button>\r\n<strong>";if (stack1 =helpers.heading) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.heading;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="</strong><div>";if (stack1 =helpers.content) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.content;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="</div>";return buffer;});this["CUI"]["Templates"]["badge"] =Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {this.compilerInfo =[2,'>= 1.0.0-rc.3'];helpers =helpers ||Handlebars.helpers;data =data ||{};var buffer ="",stack1,self=this,functionType="function",escapeExpression=this.escapeExpression;function program1(depth0,data) {return " empty";}
 buffer +="<div class=\"badge";
  stack1 = helpers.unless.call(depth0, depth0.value, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";if (stack1 =helpers.value) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.value;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "</div>";return buffer;});this["CUI"]["Templates"]["header"] =Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {this.compilerInfo =[2,'>= 1.0.0-rc.3'];helpers =helpers ||Handlebars.helpers;partials =partials ||Handlebars.partials;data =data ||{};var buffer ="",stack1,functionType="function",self=this;function program1(depth0,data) {var buffer ="",stack1;buffer +="<div class=\"logo\">";if (stack1 =helpers.logo) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.logo;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="</div>";return buffer;}
function program3(depth0,data) {var stack1;stack1 =self.invokePartial(partials.header_navItem,'header_navItem',depth0,helpers,partials,data);if(stack1 ||stack1 ===0) {return stack1;}
 else {return '';}
 }
function program5(depth0,data) {var buffer ="",stack1;buffer +="<div class=\"drawer\">";stack1 =self.invokePartial(partials.header_drawer,'header_drawer',depth0.drawer,helpers,partials,data);if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="</div>";return buffer;}
 stack1 =helpers['if'].call(depth0,depth0.logo,{hash:{},inverse:self.noop,fn:self.program(1,program1,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="\r\n<nav role=\"tablist\">";stack1 =helpers.each.call(depth0,depth0.navItems,{hash:{},inverse:self.noop,fn:self.program(3,program3,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="</nav>\r\n";stack1 =helpers['if'].call(depth0,depth0.drawer,{hash:{},inverse:self.noop,fn:self.program(5,program5,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 return buffer;});this["CUI"]["Templates"]["header_drawer"] =Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {this.compilerInfo =[2,'>= 1.0.0-rc.3'];helpers =helpers ||Handlebars.helpers;partials =partials ||Handlebars.partials;data =data ||{};var stack1,self=this;function program1(depth0,data) {var stack1;stack1 =self.invokePartial(partials.badge,'badge',depth0.badge,helpers,partials,data);if(stack1 ||stack1 ===0) {return stack1;}
 else {return '';}
 }
 stack1 =helpers['if'].call(depth0,depth0.badge,{hash:{},inverse:self.noop,fn:self.program(1,program1,data),data:data});if(stack1 ||stack1 ===0) {return stack1;}
 else {return '';}
 });this["CUI"]["Templates"]["header_navItem"] =Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {this.compilerInfo =[2,'>= 1.0.0-rc.3'];helpers =helpers ||Handlebars.helpers;data =data ||{};var buffer ="",stack1,functionType="function",escapeExpression=this.escapeExpression,self=this;function program1(depth0,data) {var buffer ="",stack1;buffer +=" id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";return buffer;}
function program3(depth0,data) {var buffer ="",stack1;buffer +=" aria-owns=\"";
  if (stack1 = helpers.owns) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.owns; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";return buffer;}
function program5(depth0,data) {return "aria-selected=\"true\" class=\"selected\"";}
function program7(depth0,data) {return "aria-selected=\"false\"";}
 buffer +="<a href=\"";
  if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" role=\"tab\"";stack1 =helpers['if'].call(depth0,depth0.id,{hash:{},inverse:self.noop,fn:self.program(1,program1,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 stack1 =helpers['if'].call(depth0,depth0.owns,{hash:{},inverse:self.noop,fn:self.program(3,program3,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +=" ";stack1 =helpers['if'].call(depth0,depth0.selected,{hash:{},inverse:self.program(7,program7,data),fn:self.program(5,program5,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>";
  return buffer;
  });

this["CUI"]["Templates"]["modal"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class=\"modal-header\">\r\n <h2>";
  if (stack1 = helpers.heading) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.heading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h2>\r\n <button type=\"button\"class=\"close\"data-dismiss=\"modal\">&times;</button>\r\n</div>\r\n<div class=\"modal-body\">";
  if (stack1 = helpers.content) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\r\n<div class=\"modal-footer\">";
  if (stack1 = helpers.buttons) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.buttons; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>";
  return buffer;
  });

this["CUI"]["Templates"]["rail"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"rail\">\r\n<div class=\"pull-to-refresh\">\r\n <div class=\"icon\"></div>\r\n <div class=\"message\">\r\n <i class=\"arrow\"></i>\r\n <i class=\"spinner large\"></i>\r\n <span class=\"pull\">";
  if (stack1 = helpers.message_ptr_pull) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_pull; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n <span class=\"release\">";
  if (stack1 = helpers.message_ptr_release) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_release; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n <span class=\"loading\">";
  if (stack1 = helpers.message_ptr_loading) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.message_ptr_loading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n </div>\r\n </div>\r\n <div class=\"wrap\">\r\n ";
  if (stack1 = helpers.content) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n </div>\r\n</div>";
  return buffer;
  });

this["CUI"]["Templates"]["tabs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials; data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n ";
  stack1 = self.invokePartial(partials.tabs_tab, 'tabs_tab', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n";
  stack1 = self.invokePartial(partials.tabs_panel, 'tabs_panel', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  return buffer;
  }

  buffer += "<nav role=\"tablist\">\r\n ";
  stack1 = helpers.each.call(depth0, depth0.tabs, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</nav>\r\n";
  stack1 = helpers.each.call(depth0, depth0.tabs, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });

this["CUI"]["Templates"]["tabs_panel"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "id=\"";if (stack1 =helpers.id) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.id;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "\"aria-labelledby=\"";if (stack1 =helpers.id) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.id;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "class=\"active\"";
  }

function program5(depth0,data) {
  
  
  return "aria-disabled=\"true\"";
  }

  buffer += "<section ";
  stack1 = helpers['if'].call(depth0, depth0.id, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "role=\"tabpanel\"";
  stack1 = helpers['if'].call(depth0, depth0.active, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "";
  stack1 = helpers['if'].call(depth0, depth0.disabled, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (stack1 = helpers.content) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</section>";
  return buffer;
  });

this["CUI"]["Templates"]["tabs_tab"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.remote) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.remote; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "#";
  stack1 = helpers['if'].call(depth0, depth0.id, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }
function program4(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  return escapeExpression(stack1);
  }

function program6(depth0,data) {
  
  var stack1;
  stack1 = helpers['if'].call(depth0, depth0.remote, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }
function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "data-target=\"#";if (stack1 =helpers.id) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.id;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "\"";
  return buffer;
  }

function program9(depth0,data) {
  
  
  return "class=\"active\"aria-selected=\"true\"";
  }

function program11(depth0,data) {
  
  
  return "aria-selected=\"false\"";
  }

function program13(depth0,data) {
  
  
  return "class=\"disabled\"aria-disabled=\"true\"";
  }

  buffer += "<a href=\"";stack1 =helpers['if'].call(depth0,depth0.remote,{hash:{},inverse:self.program(3,program3,data),fn:self.program(1,program1,data),data:data});if(stack1 ||stack1 ===0) {buffer +=stack1;}
 buffer +="\"";
  stack1 = helpers['if'].call(depth0, depth0.id, {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "data-toggle=\"tab\"role=\"tab\"";
  stack1 = helpers['if'].call(depth0, depth0.active, {hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "";
  stack1 = helpers['if'].call(depth0, depth0.disabled, {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>";
  return buffer;
  });

this["CUI"]["Templates"]["toolbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<nav class=\"toolbar\">\r\n <div class=\"left\">\r\n <a href=\"#\"class=\"icon-";if (stack1 =helpers.actionName) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.actionName;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + ">";if (stack1 =helpers.actionTitle) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.actionTitle;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "</a>\r\n    <span class=\"divider\"></span>\r\n    <a href=\"#\" class=\"icon-";
  if (stack1 = helpers.actionName) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + ">";
  if (stack1 = helpers.actionTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\r\n </div>\r\n <div class=\"center\">\r\n <h1>";
  if (stack1 = helpers.heading) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.heading; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h1>\r\n </div>\r\n <div class=\"right\">\r\n <a href=\"#\"class=\"icon-";if (stack1 =helpers.actionName) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.actionName;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + ">";if (stack1 =helpers.actionTitle) {stack1 =stack1.call(depth0,{hash:{},data:data});}
 else {stack1 =depth0.actionTitle;stack1 =typeof stack1 ===functionType ?stack1.apply(depth0) :stack1;}
 buffer +=escapeExpression(stack1)
 + "</a>\r\n    <a href=\"#\" class=\"icon-";
  if (stack1 = helpers.actionName) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + ">";
  if (stack1 = helpers.actionTitle) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.actionTitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\r\n </div>\r\n</nav>";
  return buffer;
  });
/**
  Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic constructor/destructor chaining, easy toString methods, and syntactic sugar for calling superclass methods

  @see Base

  @function

  @param {Object} descriptor                        Descriptor object
  @param {String or Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
  @param {Object} descriptor.extend                 The class to extend
  @param {Function} descriptor.construct            The constructor (setup) method for the new class
  @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
  @param {Mixed} descriptor.*                       Other methods and properties for the new class

  @returns {Base} The created class.
*/
var Class;
var Exception;

(function() {
  /**
    @name Base

    @classdesc The abstract class which contains methods that all classes will inherit.
    Base cannot be extended or instantiated and does not exist in the global namespace.
    If you create a class using <code class="prettyprint">new Class()</code> or <code class="prettyprint">MyClass.extend()</code>, it will come with Base' methods.

    @desc Base is an abstract class and cannot be instantiated directly. Constructors are chained automatically, so you never need to call the constructor of an inherited class directly
    @constructs

    @param {Object} options  Instance options. Guaranteed to be defined as at least an empty Object
   */

  /**
    Binds a method of this instance to the execution scope of this instance.

    @name bind
    @memberOf Base.prototype
    @function

    @param {Function} func The this.method you want to bind
   */
  var bindFunc = function(func) {
    // Bind the function to always execute in scope
    var boundFunc = func.bind(this);

    // Store the method name
    boundFunc._methodName = func._methodName;

    // Store the bound function back to the class
    this[boundFunc._methodName] = boundFunc;

    // Return the bound function
    return boundFunc;
  };

  /**
    Extends this class using the passed descriptor. 
    Called on the Class itself (not an instance), this is an alternative to using <code class="prettyprint">new Class()</code>.
    Any class created using Class will have this static method on the class itself.

    @name extend
    @memberOf Base
    @function
    @static

    @param {Object} descriptor                        Descriptor object
    @param {String or Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
    @param {Object} descriptor.extend                 The class to extend
    @param {Function} descriptor.construct            The constructor (setup) method for the new class
    @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
    @param {Anything} descriptor.*                    Other methods and properties for the new class
   */
  var extendClass = function(descriptor) {
    descriptor.extend = this;
    return new Class(descriptor);
  };

  Class = function(descriptor) {
    descriptor = descriptor || {};

    if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
      throw new Class.NonTruthyExtendError(descriptor.toString === 'function' ? descriptor.toString() : descriptor.toString);
    }

    // Extend Object by default
    var extend = descriptor.extend || Object;

    // Construct and destruct are not required
    var construct = descriptor.construct;
    var destruct = descriptor.destruct;

    // Remove special methods and keywords from descriptor
    delete descriptor.bind;
    delete descriptor.extend;
    delete descriptor.destruct;
    delete descriptor.construct;

    // Add toString method, if necessary
    if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
      // Return the string provided
      var classString = descriptor.toString;
      descriptor.toString = function() {
        return classString.toString();
      };
    }
    else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
      // Use parent's toString
      descriptor.toString = extend.prototype.toString;
    }

    // The remaining properties in descriptor are our methods
    var methodsAndProps = descriptor;

    // Create an object with the prototype of the class we're extending
    var prototype = Object.create(extend && extend.prototype);

    // Store super class as a property of the new class' prototype
    prototype.superClass = extend.prototype;

    // Copy new methods into prototype
    if (methodsAndProps) {  
      for (var key in methodsAndProps) {
        if (methodsAndProps.hasOwnProperty(key)) {
          prototype[key] = methodsAndProps[key];

          // Store the method name so calls to inherited() work
          if (typeof methodsAndProps[key] === 'function') {
            prototype[key]._methodName = key;
            prototype[key]._parentProto = prototype;
          }
        }
      }
    }

    /**
      Call the superclass method with the same name as the currently executing method

      @name inherited
      @memberOf Base.prototype
      @function

      @param {Arguments} args  Unadulterated arguments array from calling function
     */
    prototype.inherited = function(args) {
      // Get the function that call us from the passed arguments objected
      var caller = args.callee;

      // Get the name of the method that called us from a property of the method
      var methodName = caller._methodName;

      if (!methodName) {
        throw new Class.MissingCalleeError(this.toString());
      }

      // Start iterating at the prototype that this function is defined in
      var curProto = caller._parentProto;
      var inheritedFunc = null;

      // Iterate up the prototype chain until we find the inherited function
      while (curProto.superClass) {
        curProto = curProto.superClass;
        inheritedFunc = curProto[methodName];
        if (typeof inheritedFunc === 'function')
          break;
      }

      if (typeof inheritedFunc === 'function') {
        // Store our inherited function
        var oldInherited = this.inherited;

        // Overwrite our inherited function with that of the prototype so the called function can call its parent
        this.inherited = curProto.inherited;

        // Call the inherited function our scope, apply the passed args array
        var retVal = inheritedFunc.apply(this, args);

        // Revert our inherited function to the old function
        this.inherited = oldInherited;

        // Return the value called by the inherited function
        return retVal;
      }
      else {
        throw new Class.InheritedMethodNotFoundError(this.toString(), methodName);
      }
    };

    // Add bind to the prototype of the class
    prototype.bind = bindFunc;

    /**
      Destroys this instance and frees associated memory. Destructors are chained automatically, so the <code class="prettyprint">destruct()</code> method of all inherited classes will be called for you

      @name destruct
      @memberOf Base.prototype
      @function
     */
    prototype.destruct = function() {
      // Call our destruct method first
      if (typeof destruct === 'function') {
        destruct.apply(this);
      }

      // Call superclass destruct method after this class' method
      if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
        extend.prototype.destruct.apply(this);      
      }
    };

    // Create a chained construct function which calls the superclass' construct function
    prototype.construct = function() {
      // Add a blank object as the first arg to the constructor, if none provided
      var args = arguments; // get around JSHint complaining about modifying arguments
      if (args[0] === undefined) {
        args.length = 1;
        args[0] = {};
      }

      // call superclass constructor
      if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
        extend.prototype.construct.apply(this, arguments);      
      }

      // call constructor
      if (typeof construct === 'function') {
        construct.apply(this, arguments);
      }
    };

    // Create a function that generates instances of our class and calls our construct functions
    /** @ignore */
    var instanceGenerator = function() {
      // Create a new object with the prototype we built
      var instance = Object.create(prototype);

      // Call all inherited construct functions
      prototype.construct.apply(instance, arguments);

      return instance;
    };

    instanceGenerator.toString = prototype.toString;

    // Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
    instanceGenerator.prototype = prototype;

    // Add extend to the instance generator for the class
    instanceGenerator.extend = extendClass;

    // The constructor, as far as JS is concerned, is actually our instance generator
    prototype.constructor = instanceGenerator;

    return instanceGenerator;
  };

  if (!Object.create) {
    /**
      Polyfill for Object.create. Creates a new object with the specified prototype.

      @author <a href="https:@param {Object} prototype The prototype to create a new object with
 */
 Object.create =function (prototype) {if (arguments.length > 1) {throw new Error('Object.create implementation only accepts the first parameter.');}
 function Func() {}
 Func.prototype =prototype;return new Func();};}
 if (!Function.prototype.bind) {Function.prototype.bind =function (scope) {if (typeof this !=="function") {throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");}
 var aArgs =Array.prototype.slice.call(arguments,1);var fToBind =this;var NoOp =function() {};var fBound =function() {return fToBind.apply(this instanceof NoOp ?this :scope,aArgs.concat(Array.prototype.slice.call(arguments)));};NoOp.prototype =this.prototype;fBound.prototype =new NoOp();return fBound;};}
 Exception =new Class({extend:Error,construct:function() {this.name ='Error';this.message ='General exception';},toString:function() {return this.name+': '+this.message;}
 });var ClassException =Exception.extend({name:'Class Exception'});Class.NonTruthyExtendError =ClassException.extend({construct:function(className) {this.message =className+' attempted to extend a non-truthy object';}
 });Class.InheritedMethodNotFoundError =ClassException.extend({construct:function(className,methodName) {this.message =className+" can't call method '"+methodName+"', no method defined in parent classes";}
 });Class.MissingCalleeError =ClassException.extend({construct:function(className) {this.message =className+" can't call inherited method: calling method did not have _methodName";}
 });}());var CUI =CUI ||{};CUI.options =$.extend({debug:false,dataAPI:true
},CUI.options);(function() {for (var template in CUI.Templates) {Handlebars.registerPartial(template,CUI.Templates[template]);}
 $(function() {$(document).trigger("cui-contentloaded");});}());CUI.util ={};CUI.util.getDataTarget =function($element) {var href =$element.attr('href');var $target =$($element.attr('data-target') ||(href &&href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
 return $target;};CUI.util.decapitalize =function(str) {return str.slice(0,1).toLowerCase()+str.slice(1);};CUI.util.capitalize =function(str) {return str.slice(0,1).toUpperCase()+str.slice(1);};(function($) {CUI.util.plugClass =function(PluginClass,pluginName,callback) {pluginName =pluginName ||CUI.util.decapitalize(PluginClass.toString());$.fn[pluginName] =function(optionsIn) {return this.each(function() {var $element =$(this);var options =$.extend({},$element.data(),typeof optionsIn ==='object'&&optionsIn,{element:this });var instance =$element.data(pluginName) ||new PluginClass(options);if (typeof optionsIn ==='string') instance[optionsIn].apply(instance,Array.prototype.slice.call(arguments,1));else if ($.isPlainObject(optionsIn)) instance.set(optionsIn);if (typeof callback ==='function')
 callback.call(this,instance);});};$.fn[pluginName].Constructor =PluginClass;};CUI.util.buildFunction =function(callbackAsString,params) {params =params ||[];if (typeof params ==="string") {params =[params];}
 if (callbackAsString) {try {var Fn =Function;return new Fn(params,"return "+ callbackAsString + "("+ params.join(", ") + ");");} catch (e) {return null;}
 }
 };CUI.util.selectText =function(field,start,end) {var value =field.val();if (value.length > 0) {start =start ||0;end =end ||value.length;var domEl =$(field)[0];if (domEl.setSelectionRange) {domEl.blur();domEl.setSelectionRange(start,end);domEl.focus();} else if (domEl.createTextRange) {var range =domEl.createTextRange();range.collapse(true);range.moveEnd("character",end - value.length);range.moveStart("character",start);range.select();}
 }
 };$.fn.loadWithSpinner =function(remote,force,callback) {var $target =$(this);if (remote &&(force ||$target.data('loaded-remote') !==remote)) {var timer =setTimeout(function() {$target.html('<div class="spinner large"></div>');},50);$target.load(remote,function(response,status,xhr) {clearTimeout(timer);if (status ==='error') {$target.html('<div class="alert error"><strong>ERROR</strong> Failed to load content: '+xhr.statusText+' ('+xhr.status+')</div>');$target.data('loaded-remote','');}
 if (typeof callback ==='function') {callback.call(this,response,status,xhr);}
 });$target.data('loaded-remote',remote);}
 };$.fn.positionedParent =function() {var parent;$(this).parents().each(function() {var $this =$(this),position =$this.css('position');if (position ==='absolute'||position ==='relative') {parent =$this;return false;}
 });return parent ||$('body');};$.extend({getNested:function(object,nestedKey) {if (!nestedKey) {return object;}
 var keys =typeof nestedKey ==="string"?nestedKey.split(".") :nestedKey;var result =object;while (result &&keys.length > 0) {result =result[keys.shift()];}
 return result;}
 });function focusable(element,isTabIndexNotNaN ) {var map,mapName,img,nodeName =element.nodeName.toLowerCase();if ("area"===nodeName ) {map =element.parentNode;mapName =map.name;if (!element.href ||!mapName ||map.nodeName.toLowerCase() !=="map") {return false;}
 img =$("img[usemap=#"+ mapName + "]")[0];return !!img &&visible(img );}
 return (/input|select|textarea|button|object/.test( nodeName ) ?
 !element.disabled :"a"===nodeName ?element.href ||isTabIndexNotNaN :isTabIndexNotNaN) &&visible(element );}
 function visible(element ) {return $.expr.filters.visible(element ) &&!$(element ).parents().addBack().filter(function() {return $.css(this,"visibility") ==="hidden";}).length;}
 $.extend($.expr[":"],{data:$.expr.createPseudo ?$.expr.createPseudo(function(dataName ) {return function(elem ) {return !!$.data(elem,dataName );};}) :function(elem,i,match ) {return !!$.data(elem,match[3 ] );},focusable:function(element ) {return focusable(element,!isNaN($.attr(element,"tabindex") ) );},tabbable:function(element ) {var tabIndex =$.attr(element,"tabindex"),isTabIndexNaN =isNaN(tabIndex );return (isTabIndexNaN ||tabIndex >=0 ) &&focusable(element,!isTabIndexNaN );}
 });}(window.jQuery));(function ($,window,undefined) {var storageKey ='cui-state',storageLoadEvent ='cui-state-restore',store ={},loaded =false,$doc =$(document);CUI.util.state ={config:{serverpersistence:true
 },save:function (selector,attribute,autorestore,customEvent) {var elem =$(selector),saveLoop =function (i,attr) {store.global[selector] =store.global[selector] ||{};store.global[selector][attr] =store.global[selector][attr] ||{};store.global[selector][attr].val =elem.attr(attr);store.global[selector][attr].autorestore =autorestore ||false;store.global[selector][attr].customEvent =customEvent ||null;};if (attribute) {if ($.isArray(attribute)) {$.each(attribute,saveLoop);} else {saveLoop(0,attribute);}
 } else {}
 localStorage.setItem(storageKey,JSON.stringify(store));if (CUI.util.state.config.serverpersistence) {$.cookie(storageKey,JSON.stringify(store),{expires:7,path:'/'});}
 },restore:function (selector,filter) {var check =filter ||function () {return true;},sel,elem,selectorLoop =function (item,noop) {sel =item;elem =$(sel);if (store.global[sel]) {$.each(store.global[sel],restoreLoop);}
 },restoreLoop =function (attr,obj) {if (check(sel,attr,obj)) {elem.attr(attr,obj.val);if (obj.customEvent) {$doc.trigger(obj.customEvent,[elem,obj]);}
 $doc.trigger(storageLoadEvent,[elem,obj]);}
 };if (!loaded) {loaded =CUI.util.state.load();}
 if (selector) {selectorLoop(selector);} else {$.each(store.global,selectorLoop);}
 },load:function () {var val =localStorage.getItem(storageKey);store =val ?JSON.parse(val) :{global:{}
 };return true;},setSessionItem:function(name,value,ns) {var key =name;if (ns) {key =name + ":"+ ns;}
 sessionStorage.setItem(key,JSON.stringify(value));},getSessionItem:function(name,ns) {var key =name;if (ns) {key =name + ":"+ ns;}
 var value =sessionStorage.getItem(key);if (value) {value =JSON.parse(value);}
 return value;},removeSessionItem:function(name,ns) {var key =name;if (ns) {key =name + ":"+ ns;}
 sessionStorage.removeItem(key);},clearSessionItems:function(ns) {if (ns) {ns =":"+ ns;var keyCnt =sessionStorage.length;var toRemove =[];for (var k =0;k < keyCnt;k++) {var keyToCheck =sessionStorage.key(k);var keyLen =keyToCheck.length;if (keyLen > ns.length) {if (keyToCheck.substring(keyLen - ns.length) ===ns) {toRemove.push(keyToCheck);}
 }
 }
 var removeCnt =toRemove.length;for (var r =0;r < removeCnt;r++) {sessionStorage.removeItem(toRemove[r]);}
 }
 }
 };$doc.ready(function () {CUI.util.state.restore(null,function (selector,attr,val) {if (val.autorestore) {return true;}
 return false;});});}(jQuery,this));CUI.util.isTouch =!!('ontouchstart'in window);CUI.Widget =new Class({toString:'Widget',construct:function(options) {this.options =$.extend({},typeof this.defaults ==='object'&&this.defaults,options);this.$element =$(options.element);this.$element.data(CUI.util.decapitalize(this.toString()),this);this.bind(this.hide);this.bind(this.show);this.bind(this.toggleVisibility);this.on('change:visible',function(evt) {this[evt.value ?'_show':'_hide']();}.bind(this));if (this.options.visible) {this.options.visible =false;this.show();}
 },set:function(optionOrObj,value) {if ($.isPlainObject(optionOrObj)) {for (var option in optionOrObj) {this._set(option,optionOrObj[option]);}
 }
 else {this._set(optionOrObj,value);}
 return this;},_set:function(option,value) {var e =$.Event('beforeChange:'+option,{widget:this,option:option,currentValue:this.options[option],value:value
 });this.$element.trigger(e);if (e.isDefaultPrevented()) return this;this.options[option] =value;e =$.Event('change:'+option,{widget:this,option:option,value:value
 });this.$element.trigger(e);},get:function(option) {return this.options[option];},on:function(evtName,func) {this.$element.on.apply(this.$element,arguments);return this;},off:function(evtName,func) {this.$element.off.apply(this.$element,arguments);return this;},show:function(evt) {evt =evt ||{};if (this.options.visible)
 return this;if (!evt.silent) {var e =$.Event('show');this.$element.trigger(e);if (e.isDefaultPrevented()) return this;}
 this.options.visible =true;this._show(evt);return this;},_show:function(evt) {this.$element.show();},hide:function(evt) {evt =evt ||{};if (!this.options.visible)
 return this;if (!evt.silent) {var e =$.Event('hide');this.$element.trigger(e);if (e.isDefaultPrevented()) return this;}
 this.options.visible =false;this._hide(evt);return this;},_hide:function(evt) {this.$element.hide();},toggleVisibility:function() {return this[!this.options.visible ?'show':'hide']();},setName:function(customName) {this.toString =function() {return customName;};return this;}
 });(function($) {CUI.Modal =new Class({toString:'Modal',extend:CUI.Widget,construct:function(options) {this.$element.delegate('[data-dismiss="modal"]','click.dismiss.modal',this.hide);this.$element.find('.modal-body').loadWithSpinner(this.options.remote);this.$element.addClass('modal');this.$element.attr('tabIndex',-1);this.$element.attr('role','dialog');this.$element.attr('aria-hidden',true);this.$element.on('change:buttons',this._setButtons.bind(this));this.$element.on('change:heading',this._setHeading.bind(this));this.$element.on('change:content',this._setContent.bind(this));this.$element.on('change:type',this._setType.bind(this));this.$element.on('change:fullscreen',this._setFullscreen.bind(this));if (this.$element.children().length ===0) {this.$element.html(CUI.Templates['modal']($.extend({},this.options,{buttons:''})));this.applyOptions(true);}
 else {this.applyOptions();}
 },defaults:{backdrop:'static',keyboard:true,visible:true,type:'default',fullscreen:false
 },_types:['default','error','notice','success','help','info'],applyOptions:function(partial) {if (!partial) {this._setContent();this._setHeading();}
 this._setButtons();this._setType();this._setFullscreen();},_setType:function() {if (typeof this.options.type !=='string'||this._types.indexOf(this.options.type) ===-1) return;this.$element.removeClass(this._types.join(' '));this.$element.addClass(this.options.type);this.center();},_setContent:function() {if (typeof this.options.content !=='string') return;this.$element.find('.modal-body').html(this.options.content);this.center();},_setHeading:function() {if (typeof this.options.heading !=='string') return;this.$element.find('.modal-header h2').html(this.options.heading);this.center();},_setFullscreen:function() {if (this.options.fullscreen)
 this.$element.addClass('fullscreen');else
 this.$element.removeClass('fullscreen');},_show:function() {$('body').addClass('modal-open');this.$element.trigger($.Event("beforeshow"));this._toggleBackdrop(true);this._setEscapeHandler(true);if (!this.$element.parent("body").length) {this.$element.appendTo(document.body);}
 if (this.options.fullscreen) {var $body =this.$element.find('.modal-body');var $footer =this.$element.find('.modal-footer');$body.css({bottom:$footer.outerHeight()
 });}
 else {this.$element.css('visibility','hidden').css('left','0').show();this.center();this.$element.css('visibility','visible').css('left','50%').hide();}
 var self =this;this.$element.addClass('in').attr('aria-hidden',false).fadeIn().focus();if (!this.options.fullscreen)
 this.$element.css('width',this.$element.innerWidth());},_hide:function() {$('body').removeClass('modal-open');this.$element.removeClass('in').attr('aria-hidden',true);this.$element.fadeOut().trigger('hidden');this._toggleBackdrop(false);this._setEscapeHandler(false);return this;},_setEscapeHandler:function(show) {if (show &&this.options.keyboard) {$('body').pointer('keyup',function (e) {if (e.which ===27)
 this.hide();}.bind(this));}
 else if (!show) {this.$element.off('keyup');}
 },_removeBackdrop:function() {if (this.$backdrop &&!this.get('visible')) {this.$backdrop.remove();this.$backdrop =null;}
 },_toggleBackdrop:function(show) {if (show &&this.options.backdrop) {if (this.$backdrop)
 this.$backdrop.fadeIn();else {this.$backdrop =$('<div class="modal-backdrop" style="display: none;" />').appendTo(document.body).fadeIn();if (this.options.backdrop !=='static') {this.$backdrop.click(this.hide);}
 }
 }
 else if (!show &&this.$backdrop) {this.$backdrop.fadeOut(function() {this._removeBackdrop();}.bind(this));}
 },center:function() {if (this.options.fullscreen)
 return this;var width =this.$element.outerWidth();var height =this.$element.outerHeight();this.$element.css('marginLeft',-width/2);this.$element.css('marginTop',-height/2);return this;},_setButtons:function() {if (!$.isArray(this.options.buttons)) return;var $footer =this.$element.find('.modal-footer');$footer.children().remove();$.each(this.options.buttons,function(index,button) {var el =$(button.href ?'<a class="button" />':'<button type="button" />');el.html(button.label);if (button.click) {if (button.click ==='hide')
 el.attr('data-dismiss','modal');else if (typeof button.click ==='function')
 el.fipo('tap','click',button.click.bind(this,{dialog:this }));}
 if (button.href)
 el.attr('href',button.href);if (button.className)
 el.addClass(button.className);$footer.append(el);}.bind(this));}
 });CUI.util.plugClass(CUI.Modal);if (CUI.options.dataAPI) {$(function() {$('body').fipo('tap.modal.data-api','click.modal.data-api','[data-toggle="modal"]',function (e) {var $trigger =$(this);var $target =CUI.util.getDataTarget($trigger);var href =$trigger.attr('href');var options =$.extend({remote:!/#/.test(href) && href }, $target.data(), $trigger.data());

 if (typeof options.buttons ==='string') {options.buttons =JSON.parse(options.buttons);}
 var instance =$target.data('modal');var show =true;if (instance &&instance.get('visible'))
 show =false;$target.modal(options).one('hide',function() {$trigger.focus();});if (instance)
 $target.data('modal').set({visible:show });e.preventDefault();});});}
}(window.jQuery));(function($) {CUI.Tabs =new Class({toString:'Tabs',extend:CUI.Widget,construct:function(options) {var that =this;this.$element.addClass('tabs');this.options =$.extend({},this.defaults,this.options);this._setType();if (this.options.tabs.length > 0 &&(this.options.active ===undefined ||this.options.active ===null)) {this.options.tabs.forEach(function(t,idx) {if (t.active) {that.options.active =idx;return false;}
 });if (typeof this.options.active !=='number') {this.options.active =0;this.options.tabs[0].active =true;}
 }
 if (this.options.tabs.length > 0) {this._render();}
 _makeAccessible(this.$element);setTimeout(this._setActive.bind(this),0);this.$element.on('change:type',this._setType.bind(this));this.$element.on('change:tabs',this._render.bind(this));this.$element.on('change:active',this._setActive.bind(this));},defaults:{tabs:[]
 },_types:['white','nav','stacked'],_setType:function() {if (typeof this.options.type !=='string'||this._types.indexOf(this.options.type) ===-1) return;this.$element.removeClass(this._types.join(' '));this.$element.addClass(this.options.type);},_render:function() {if (!$.isArray(this.options.tabs)) return;this.$element.html(CUI.Templates['tabs'](this.options));},_setActive:function() {var $tab,active =this.options.active;if (typeof active ==='number'&&active < this.options.tabs.length &&active >=0) {$tab =this.$element.find('nav > a[data-toggle="tab"]:eq('+active+')');} else if (typeof active ==='string'&&active.length > 0) {$tab =this.$element.find('nav > a[data-toggle="tab"]').filter('[data-target="#'+active+'"], [href="#'+active+'"]');}
 if ($tab)
 _activateTab($tab,true);}
 });var _makeAccessible =function($element) {$element
 .children('nav')
 .attr('role','tablist')
 .each(function(index) {var $tablist =$(this),tablist_id =$tablist.attr('id');if (!tablist_id) {$tablist.data('init','tablist');tablist_id ='tablist-'+$.expando+'-'+this[$.expando];$tablist.attr('id',tablist_id);}
 $tablist
 .children('a[data-toggle="tab"]')
 .attr('role','tab')
 .attr('tabindex',-1)
 .each(function(index) {var $tab =$(this),tab_id =$tab.attr('id');if (!tab_id) {tab_id =tablist_id + "-tab-"+ index;$tab.attr('id',tab_id);}
 var $tabpanel =$element
 .children('section:eq('+index+')')
 .attr('role','tabpanel'),tabpanel_id =$tabpanel.attr('id');if (!tabpanel_id) {tabpanel_id =tablist_id + "-tabpanel-"+ index;$tabpanel.attr('id',tabpanel_id);}
 $tab.attr('aria-controls',tabpanel_id)
 .attr('data-target','#'+tabpanel_id);if ($tab.attr('href')==='#') {$tab.attr('href','#'+tabpanel_id);}
 $tabpanel.attr('aria-describedby',tab_id);if ($tab.hasClass('active')) {$tab.attr('tabindex',0)
 .attr('aria-selected',true);$tabpanel.addClass('active')
 .removeAttr('hidden');}
 if ($tab.hasClass('disabled')) {$tab.attr('aria-disabled',true);}
 });});};var _activateTab =function($tab,noFocus) {var $target =CUI.util.getDataTarget($tab);if (!$tab ||!$target) return;if ($tab.hasClass('active')) {return false;}
 if ($tab.hasClass('disabled')) {$tab.blur();return false;}
 if ($target.selector ==='#') {$target =$tab.parents('.tabs').first().children('section:eq('+$tab.index()+')');}
 var href =$tab.attr('href');var remote =!/#/.test(href) && href;

 $target.loadWithSpinner(remote);$tab
 .addClass('active')
 .attr('aria-selected',true)
 .attr('tabindex',0);$tab.siblings('a[data-toggle="tab"]')
 .removeClass('active')
 .removeClass('focus')
 .attr('aria-selected',false)
 .attr('tabindex',-1);$target
 .addClass('active')
 .removeAttr('hidden');$target.siblings('section')
 .removeClass('active')
 .removeClass('focus')
 .attr('hidden','hidden');if (!noFocus)
 $tab.focus();};var _onLoad =function() {$('.tabs').each(function() {var $element =$(this),$tab;if (($tab =$element.find('nav > a.active').first()).length ===0)
 $tab =$element.find('nav > a').first();_makeAccessible($element);_activateTab($tab,true);});};CUI.util.plugClass(CUI.Tabs);if (CUI.options.dataAPI) {$(function() {_onLoad();$('body').on('cui-onload.data-api',_onLoad);$('body').fipo('tap.tabs.data-api','click.tabs.data-api','.tabs > nav > a[data-toggle="tab"]',function (e) {var $tab =$(this),$target =$('#'+$tab.attr('aria-controls'));$tab.removeClass('focus');$target.removeClass('focus');_activateTab($tab,(this ===document.activeElement));if (e.type ==='click') {e.preventDefault();return false;}
 });$('body').on('focus.tabs.data-api','.tabs > nav > a[data-toggle="tab"]',function(top_e) {var $tab =$(this),$target =$('#'+$tab.attr('aria-controls'));if (!CUI.util.isTouch &&!$tab.data('mousedown')) {$tab.addClass('focus').siblings('a[data-toggle="tab"]').removeClass('focus');$target.addClass('focus').siblings('section').removeClass('focus');}
 $(this).parents('.tabs').pointer('keydown.tabs.data-api','nav > a[data-toggle="tab"]',function (e) {var $tab =$(this),key =e.which,tabmousedown =$tab.data('mousedown');if (key ===37 ||key ===38) {var prev =$tab.prevAll().not('.disabled').first();if (prev.length ===0) {prev =$tab.siblings().not('.disabled').last();}
 if ($tab.data('mousedown')) {prev.data('mousedown',true);$tab.removeData('mousedown');}
 _activateTab(prev);e.preventDefault();} else if (key ===39 ||key ===40) {var next =$tab.nextAll().not('.disabled').first();if (next.length ===0) {next =$tab.siblings().not('.disabled').first();} if ($tab.data('mousedown')) {next.data('mousedown',true);$tab.removeData('mousedown');}
 _activateTab(next);e.preventDefault();}
 });}).on('blur.tabs.data-api','.tabs > nav > a[data-toggle="tab"]',function(e) {var $tab =$(this),$target =$('#'+$tab.attr('aria-controls'));$tab.removeClass('focus').removeData('mousedown');$target.removeClass('focus');}).on('mousedown.tabs.data-api','.tabs > nav > a[data-toggle="tab"]',function(e) {$(this).data('mousedown',true);});});}
}(window.jQuery));(function($) {CUI.Alert =new Class({toString:'Alert',extend:CUI.Widget,construct:function(options) {this.$element.delegate('[data-dismiss="alert"]','click.dismiss.alert',this.hide);this.$element.addClass('alert');this.$element.on('change:heading',this._setHeading.bind(this));this.$element.on('change:content',this._setContent.bind(this));this.$element.on('change:type',this._setType.bind(this));this.$element.on('change:closable',this._setClosable.bind(this));this.$element.on('change:size',this._setSize.bind(this));$.each(this._types,function(index,type) {if (this.$element.hasClass(type)) {this.options.type =type;return false;}
 }.bind(this));$.each(this._sizes,function(index,size) {if (this.$element.hasClass(size)) {this.options.size =size;return false;}
 }.bind(this));if (this.$element.children().length ===0) {this.options.heading =this.options.heading ===undefined ?this.options.type.toUpperCase() :this.options.heading;this.$element.html(CUI.Templates['alert'](this.options));this.applyOptions();}
 else {this.applyOptions(true);}
 },defaults:{type:'error',size:'small',heading:undefined,visible:true,closable:true
 },_types:['error','notice','success','help','info'],_sizes:['small','large'],applyOptions:function(partial) {if (!partial) {this._setHeading();this._setContent();}
 this._setClosable();this._setType();this._setSize();},_setContent:function() {if (typeof this.options.content !=='string') return;this.$element.find('div').html(this.options.content);},_setHeading:function() {if (typeof this.options.content !=='string') return;this.$element.find('strong').html(this.options.heading);},_setType:function() {if (typeof this.options.type !=='string'||this._types.indexOf(this.options.type) ===-1) return;this.$element.removeClass(this._types.join(' '));this.$element.addClass(this.options.type);},_setSize:function() {if (typeof this.options.size !=='string'||this._sizes.indexOf(this.options.size) ===-1) return;if (this.options.size ==='small')
 this.$element.removeClass('large');else
 this.$element.addClass('large');},_setClosable:function() {var el =this.$element.find('.close');if (!el.length) {this.$element.prepend('<button class="close" data-dismiss="alert">&times;</button>');}
 else {el[this.options.closable ?'show':'hide']();}
 }
 });CUI.util.plugClass(CUI.Alert);if (CUI.options.dataAPI) {$(function() {$('body').fipo('tap.alert.data-api','click.alert.data-api','[data-dismiss="alert"]',function(evt) {$(evt.target).parent().hide();evt.preventDefault();});});}
}(window.jQuery));(function ($) {CUI.Rail =new Class({toString:'Rail',extend:CUI.Widget,construct:function(options) {var e =this.$element,opt =$.extend(true,{},this.defaults,options),html ='<div class="pull-to-refresh">'+
 '<div class="icon"></div>'+
 '<div class="message">'+
 '<i class="arrow"></i>'+
 '<i class="spinner large"></i>'+
 '<span class="pull">'+ opt.message.pull + '</span>'+
 '<span class="release">'+ opt.message.release + '</span>'+
 '<span class="loading">'+ opt.message.loading + '</span>'+
 '</div>'+
 '</div>',_ ={rail:e,content:e.find('.wrap'),ptr:e.find('.pull-to-refresh') },foldable =_.content.find('section.foldable'),switcher =_.content.find('.rail-switch'),quickform =_.content.find('.quickform');_makeAccessible(e);foldable.each(function (i,e) {var f =$(e),trigger =f.find('.heading'),fold =f.find('.fold');trigger.fipo('tap','click',function (ev) {var expanded =f.toggleClass('open').hasClass('open'),showFocus =false;fold.attr({'aria-hidden':!expanded,'aria-expanded':expanded});if (expanded &&ev.type==='click'&&!trigger.is('a')) {showFocus =trigger.hasClass('focus');fold.attr('tabindex','-1').focus();if (showFocus) trigger.addClass('focus');setTimeout(function () {fold.removeAttr('tabindex');trigger.focus();},100);}
 });});$(document).finger('swipe',function (e) {var openTriggerArea =30,w =_.rail.width(),x =e.touches.start[0].pageX,dir =e.direction;if (dir ==='left') {if (x < w) {_.rail.addClass('closed');}
 } else if (dir ==='right') {if (x < openTriggerArea) {_.rail.removeClass('closed');}
 }
 });if (switcher.length > 0) {this._initRailSwitcher(_.content,switcher);}
 if (_.content.hasClass('accordion')) {this._initAccordion(_.content);}
 if (options.refreshCallback) {if (!_.ptr.get(0)) {_.rail.prepend(html);_.ptr =e.find('.pull-to-refresh');}
 _ =$.extend(_,{arrow:_.ptr.find('.arrow'),spinner:_.ptr.find('.spinner'),pull:_.ptr.find('.pull'),release:_.ptr.find('.release'),loading:_.ptr.find('.loading'),h:_.ptr.height(),active:false,waiting:false
 });this._ =_;this.callback =options.refreshCallback;_.rail.addClass('pullable');_.content.finger('touchstart',$.proxy(this._handleTouchstart,this))
 .finger('touchmove',$.proxy(this._handleTouchmove,this))
 .finger('touchend',$.proxy(this._handleTouchend,this));}
 },defaults:{message:{pull:'Pull to refresh',release:'Release to refresh',loading:'Loading'}
 },_handleTouchstart:function (ev) {var _ =this._;if (_.waiting) {return true;}
 _.rail.addClass('scroll touch');if (_.rail.scrollTop() ===0) {_.rail.scrollTop(1);} },_handleTouchmove:function (ev) {var _ =this._,delay =_.h / 3 * 2,top =_.rail.scrollTop(),deg =180 - (top < -_.h ?180 :(top < -delay ?Math.round(180 / (_.h - delay) * (-top - delay)) :0));if (_.waiting) {return true;}
 _.arrow.show();_.arrow.css('transform','rotate('+ deg + 'deg)');_.spinner.hide();if (-top > _.h) {_.pull.css('opacity',0);_.loading.css('opacity',0);_.release.css('opacity',1);_.active =true;} else if (top > -_.h) {_.release.css('opacity',0);_.loading.css('opacity',0);_.pull.css('opacity',1);_.active =false;} },_handleTouchend:function (ev) {var _ =this._,top =_.rail.scrollTop();if (_.active) {ev.preventDefault();_.waiting =true;_.release.css('opacity',0);_.pull.css('opacity',0);_.loading.css('opacity',1);_.arrow.hide();_.spinner.show();_.rail.scrollTop(top - _.h);_.ptr.css('position','static');_.active =false;this.callback().done(function() {_.ptr.animate({height:0
 },'fast','linear',function () {_.ptr.css('position','absolute');_.ptr.height(_.h);_.waiting =false;_.rail.removeClass('touch');});});} else {_.rail.removeClass('touch');}
 },_initAccordion:function (con) {var activeAccordion ='active-accordion',accordions =con.find('section'),closedHeight =accordions.outerHeight(true);accordions.each(function (i,e) {var f =$(e),containerHeight =con.outerHeight(),contentHeight =containerHeight - (accordions.length * closedHeight),trigger =f.find('.heading'),fold =f.find('.fold');trigger.fipo('tap','click',function (ev) {var curHeight =fold.height(),targetHeight,cur =con.data(activeAccordion);if (cur) {cur.removeClass('open').find('.fold').height(0).attr({'aria-hidden':true,'aria-expanded':false});}
 fold.height(contentHeight).attr({'aria-hidden':false ,'aria-expanded':true});con.data(activeAccordion,f.addClass('open'));});});},_initRailSwitcher:function (con,switcher) {var tablist =switcher.find('nav'),tablist_id,trigger =tablist.find('a'),views =con.find('.rail-view'),active =con.find('.rail-view.active'),search =switcher.find('input'),cl ='active';tablist_id =tablist.attr({'role':'tablist'}).attr("id");if (!tablist_id) {tablist.data('rail-switch-tablist','rail-switch-tablist');tablist_id ='cui-rail-switch-tablist-'+$.expando+'-'+tablist[0][$.expando];tablist.attr('id',tablist_id);}
 trigger.each(function (i,e) {var t =$(e),t_id =t.attr('id'),isActive =t.hasClass('active'),viewName =t.data('view'),view =con.find('.rail-view[data-view="'+ viewName +'"]'),view_id =view.attr('id');if (!t_id) {t_id =tablist_id+'-tab-'+viewName;t.attr('id',t_id);}
if (!view_id) {view_id =tablist_id+'-tabpanel-'+viewName;view.attr('id',view_id);}
t.attr({'role':'tab','aria-selected':isActive,'tabindex':isActive ?0 :-1,'aria-controls':view_id}).filter('[href="#"]').attr('href',"#"+view_id);view.attr({'role':'tabpanel','aria-hidden':!isActive,'aria-expanded':isActive,'aria-labelledby':t_id});t.fipo('tap','click',function (ev) {ev.preventDefault();views.removeClass(cl)
 .attr({'aria-hidden':true,'aria-expanded':false});trigger.removeClass(cl)
 .attr({'aria-selected':false,'tabindex':-1});$(this).addClass(cl).attr({'aria-selected':true,'tabindex':0});view.addClass('active').attr({'aria-hidden':false,'aria-expanded':true});}).focus(function(ev) {if (!CUI.util.isTouch &&!$(this).data('mousedown')) {$(this).addClass('focus')
.parent().addClass('focus');}
}).blur(function(ev) {$(this).removeClass('focus').removeData('mousedown')
.parent().removeClass('focus');}).mousedown(function(ev) {$(this).data('mousedown',true);}).keydown(function(ev) {switch(ev.which)
{case 33:if (ev.ctrlKey ||ev.metaKey) {ev.preventDefault();$(this).prev(":focusable").data('mousedown',!!$(this).data('mousedown')).focus().click();}
break;case 34:if (ev.ctrlKey ||ev.metaKey) {ev.preventDefault();$(this).next(":focusable").data('mousedown',!!$(this).data('mousedown')).focus().click();}
break;case 35:trigger.last(":focusable").data('mousedown',!!$(this).data('mousedown')).not(this).focus().click();break;case 36:trigger.first(":focusable").data('mousedown',!!$(this).data('mousedown')).not(this).focus().click();break;case 37:case 38:ev.preventDefault();$(this).prev(":focusable").data('mousedown',!!$(this).data('mousedown')).focus().click();break;case 39:case 40:ev.preventDefault();$(this).next(":focusable").data('mousedown',!!$(this).data('mousedown')).focus().click();break;}
});});}
 });var _makeAccessible =function($element) {$element.attr('role','complementary');var wrap =$element.find('.wrap'),switcher =wrap.find('.rail-switch'),isAccordion =wrap.hasClass('accordion'),sections =wrap.find('section'),foldables =isAccordion ?sections :sections.filter('.foldable'),foldableHeadings =foldables.find('h4, .heading'),folds =foldables.find('.fold'),expanded =sections.not('.foldable'),tablists,foldableParent =null,foldableWrapper =null,quickform =$element.find('.quickform'),quickformAction =quickform.find('.action'),quickformTrigger =quickform.find('>.control .trigger');foldables.not('[role]').attr('role','presentation');if (isAccordion) {foldables.each(function(index) {var foldable =$(this);if (!foldable.parent().is(foldableParent))
{foldableParent =foldable.parent();foldableWrapper =$('<div role="tablist" class="tablist" aria-multiselectable="true"></div>');foldable.wrap(foldableWrapper);} else {foldable.siblings('[role="tablist"]').append(foldable);}
});if(folds.is("ul")) {folds.wrap('<div role="tabpanel" class="fold"></div>');folds =wrap.find('[role="tabpanel"]');} else {folds.attr({'role':'tabpanel'});}
}
foldableHeadings.attr({'tabindex':0});if (isAccordion) {foldableHeadings.attr({'role':'tab'});} else {foldableHeadings.not('[role]').filter('span, a[href="#"]').attr({'role':'button'});}
tablists =isAccordion ?$element.find('[role="tablist"]') :wrap;tablists.each(function(index) {var $wrap =$(this),wrap_id =$wrap.attr('id');if (!wrap_id) {$wrap.data('rail-tablist','rail-tablist');wrap_id ='cui-rail-tablist-'+$.expando+'-'+this[$.expando];$wrap.attr('id',wrap_id);}
});folds.each(function(index) {var $fold =$(this),fold_id =$fold.attr('id'),wrap_id =$fold.closest('[id|="cui-rail-tablist"]').attr('id'),$foldableSection =$fold.closest('section'),$foldableHeading =$foldableSection.find('h4, .heading'),foldableHeading_id =$foldableHeading.attr('id'),expanded =$foldableSection.hasClass('open');if (!fold_id) {fold_id =wrap_id+'-fold'+index;$fold.attr('id',fold_id);}
if (!foldableHeading_id) {foldableHeading_id =wrap_id+'-foldable'+index;$foldableHeading.attr('id',foldableHeading_id);}
$foldableHeading.attr('aria-controls',fold_id).filter('[href="#"]').attr('href',"#"+fold_id);$fold.attr({'aria-labelledby':foldableHeading_id,'aria-hidden':!expanded,'aria-expanded':expanded});});$element.on('focus',':focusable',function(event) {var $target =$(event.target),$section,$tab;if (!CUI.util.isTouch &&!$target.data('mousedown')) {$target.addClass('focus');}
 if (!$target.is('section :focusable')) {if (!$target.is('input[type=text]')) return;}
 $section =$target.closest('section');$tab =$section.find('[aria-controls]');foldableHeadings.filter('[aria-selected]').attr({'aria-selected':false});if ($tab.length>0) {$tab.attr({'aria-selected':true});if ($tab.is('[role="tab"]')) {$tab.attr('tabindex',0);foldableHeadings.not($tab).not('section.open *').attr('tabindex',-1);}
}
 $target
.keydown(_keyDownHandler)
.blur(function(e) {var $t =$(e.target),$s =$t.closest('section'),$t2 =$s.find('[aria-controls]');$t.unbind('keydown',_keyDownHandler)
.removeClass('focus').filter('[aria-selected]').attr('aria-selected',false);if ($t2.length>0) {$t2.filter('[aria-selected]').attr('aria-selected',false);}
if ($t.is('[role="tab"]')) {$t.not('[aria-selected=true], a[href]').attr('tabindex',-1);if (foldableHeadings.filter('[tabindex=0]').length===0) {foldableHeadings.eq(0).attr('tabindex',0);}
}
});}).on('blur',':focusable',function(event) {var $target =$(event.target);if ($target.not('section :focusable, input[type="text"]')) {$target.removeClass('focus');}
 }).on('mousedown','label',function(event) {var $target =$(event.currentTarget),$labelled =$('#'+$target.attr('for'));if ($labelled.length===0) {$labelled =$target.find('input, textarea, select').filter(':focusable');}
 if ($labelled.length===0 &&$target.attr('id')) {$labelled =$('[aria-labelledby*="'+$target.attr('id')+'"]');}
 if ($labelled.length===1) setTimeout(function() {$labelled.get(0).focus();},1);});if (quickform.length>0) {if (quickformAction.length > 0) {quickformAction.attr('role','dialog');var quickformAction_id =quickformAction.attr('id');if (!quickformAction_id) {quickformAction.data('rail-quickform-action','rail-quickform-action');quickformAction_id ='cui-rail-quickform-action-'+$.expando+'-'+quickformAction[0][$.expando];quickformAction.attr('id',quickformAction_id);}
if (quickformTrigger.length > 0) {var quickformTrigger_id =quickformTrigger.attr('id');if (!quickformTrigger_id) {quickformTrigger_id =quickformAction_id+'-trigger';quickformTrigger.attr('id',quickformTrigger_id);}
quickformAction.attr({'aria-labelledby':quickformTrigger_id,'tabindex':-1});quickformTrigger.attr({'role':'button','aria-pressed':quickformAction.css('display')!=='none','aria-haspopup':true,'aria-controls':quickformAction_id});quickform.on('click','>.control .trigger',function(event) {var pressed =quickformAction.css('display')!=='none';quickformTrigger.attr({'aria-pressed':pressed});if (pressed) {quickformAction.attr('tabindex',-1).focus().removeAttr('tabindex');quickformAction.on('keydown',function(event) {if (event.which ===27) {quickform.removeClass('open');quickformTrigger.attr({'aria-pressed':false}).focus();}
});}
});}
}
}
 };var _keyDownHandler =function(event) {var $target =$(event.target),wrap =$target.closest('.wrap'),switcher =wrap.find('.rail-switch'),isRailSwitchTab =$target.is("[data-view]"),isAccordion =wrap.hasClass('accordion'),sections =wrap.find('section'),foldables =isAccordion ?sections :sections.filter('.foldable'),expanded =sections.not('.foldable'),foldableHeadings =foldables.find('h4, .heading'),folds =foldables.find('.fold'),ctrlKey =event.ctrlKey,altKey =event.altKey,metaKey =event.metaKey,shiftKey =event.shiftKey,isFoldableHeading =$target.is('[aria-controls]'),currentSection =(isFoldableHeading) ?$target.closest('section') :null,currentFoldableHeading =(isFoldableHeading) ?$target :null,currentIndex =(isFoldableHeading) ?foldableHeadings.index($target) :-1,tabbables =wrap.find(":focusable"),tabIndexPosition =tabbables.index($target),prevTabbableIndex =tabIndexPosition-1,nextTabbableIndex =tabIndexPosition+1,nextTabbable;if (!isFoldableHeading) {currentSection =$target.parentsUntil('.wrap','section');currentFoldableHeading =currentSection.find('h4, .heading');currentIndex =foldableHeadings.index(currentFoldableHeading);}
switch(event.which)
{case 9:if (nextTabbableIndex<tabbables.length-1 &&!shiftKey) {nextTabbable =tabbables.eq(nextTabbableIndex);if (nextTabbable.is('[role="tab"]') &&$('#'+nextTabbable.attr('aria-controls')).is('[aria-expanded="true"]')) {tabbables.eq(nextTabbableIndex+1).focus();event.preventDefault();}
} break;case 13:if (isFoldableHeading &&!$target.is('a[href]')) {currentFoldableHeading.click();}
break;case 32:if (isFoldableHeading) {currentFoldableHeading.click();}
break;case 33:if (ctrlKey ||metaKey) {event.preventDefault();foldableHeadings.eq(Math.max(0,currentIndex-1) ).not($target).focus();}
break;case 34:if (ctrlKey ||metaKey) {event.preventDefault();if (isFoldableHeading) {foldableHeadings.eq(Math.min(foldableHeadings.length-1,currentIndex+1) ).not($target).focus();} else {currentFoldableHeading.not($target).focus();}
}
break;case 35:foldableHeadings.last().not($target).focus();break;case 36:foldableHeadings.first().not($target).focus();break;case 37:case 38:if (isFoldableHeading) {event.preventDefault();foldableHeadings.eq(Math.max(0,currentIndex-1) ).not($target).focus();} else if ((ctrlKey ||metaKey) &&event.which===38) {event.preventDefault();currentFoldableHeading.not($target).focus();} else if (currentSection.length &&currentSection.hasClass('links') &&prevTabbableIndex > 0) {event.preventDefault();tabbables.eq(prevTabbableIndex).not($target).focus();} break;case 39:case 40:if (isFoldableHeading) {event.preventDefault();foldableHeadings.eq(Math.min(foldableHeadings.length-1,currentIndex+1) ).not($target).focus();} else if (currentSection.length &&currentSection.hasClass('links') &&nextTabbableIndex < tabbables.length-1) {event.preventDefault();tabbables.eq(nextTabbableIndex).not($target).focus();}
break;}
 };CUI.util.plugClass(CUI.Rail);}(window.jQuery));(function($) {var uuid =0;CUI.Popover =new Class({toString:'Popover',extend:CUI.Widget,construct:function(options) {this.$element.addClass('popover');this.$element.on('change:content',this._setContent.bind(this));this.$element.on('change:pointAt',this._setPointAt.bind(this));this.$element.on('change:pointFrom',this._setPointFrom.bind(this));if (this.$element.html() ==='') {this.applyOptions();}
 else {this.applyOptions(true);}
 this.hide();this.uuid =(uuid +=1);this.cachedPointFrom =this.options.pointFrom;},defaults:{pointFrom:'bottom',alignFrom:'left',pointAt:$('body'),arrowPos:'',visible:true
 },_directions:['top','bottom','right','left'],applyOptions:function(partial) {if (!partial) {this._setContent();}
 this._setPointAt();this._setPointFrom();},setPosition:function(position) {this._doSetPointFrom(this.options.pointFrom);if (this.$element.parent().get(0) !==$('body').get(0)) {this.$element.detach().appendTo($('body'));}
 var screenWidth =$(window).width();var screenHeight =$(window).height();var pointFrom =this.options.pointFrom;var top =position[1];var left =position[0];var width =this.$element.outerWidth();var height =this.$element.outerHeight();var arrowHeight =Math.round((this.$element.outerWidth() - this.$element.width())/1.5);if (pointFrom ==='top'&&top - height - arrowHeight < 0) {pointFrom ='bottom';this._doSetPointFrom('bottom');}
 if (pointFrom ==='bottom'&&top + height + arrowHeight > screenHeight) {pointFrom ='top';this._doSetPointFrom('top');}
 if (pointFrom ==='bottom'||pointFrom ==='top') {left -=width/2;}
 if (pointFrom ==='bottom') {top +=arrowHeight;} else if (pointFrom ==='top') {top -=height + arrowHeight;}
 var offset =0;var leftOffset =screenWidth - (left + width);if (leftOffset < 0)
 offset =leftOffset;if (left < 0)
 offset =-left;left +=offset;if (offset < 0) {this.$element.addClass('arrow-pos-right');}
 else if (offset > 0) {this.$element.addClass('arrow-pos-left');}
 else {this.$element.removeClass('arrow-pos-left arrow-pos-right');}
 this.$element.css({top:top,left:left
 });},_show:function() {this.$element.show();$('body').fipo('tap.popover-hide-'+this.uuid,'click.popover-hide-'+this.uuid,function(e) {var el =this.$element.get(0);if (e.target !==el &&!$.contains(el,e.target)) {this.hide();$('body').off('.popover-hide-'+this.uuid);}
 }.bind(this));},_hide:function() {this.$element.hide();$('body').off('.popover-hide-'+this.uuid);},_setContent:function() {if (typeof this.options.content !=='string') return;this.$element.html(this.options.content);},_setPointAt:function() {var $el =$(this.options.pointAt);if ($el.length !==1) return;if (this.$element.parent().get(0) !==$el.parent().get(0)) {this.$element.detach().insertAfter($el);}
 var screenPadding =4;var relativePosition =$el.position(),absolutePosition =$el.offset(),pointAtHeight =$el.outerHeight(),pointAtWidth =$el.outerWidth(),screenWidth =$(window).width(),screenHeight =$(window).height(),pointFrom =this.options.pointFrom,left =relativePosition.left,top =relativePosition.top,absTopDiff =absolutePosition.top - parseInt($el.css("margin-top")) - top,absLeftDiff =absolutePosition.left - parseInt($el.css("margin-left")) - left,width =this.$element.outerWidth(),height =this.$element.outerHeight(),parentWidth =this.$element.positionedParent().width(),parentPadding =parseFloat(this.$element.parent().css('padding-right')),arrowHeight =Math.round((this.$element.outerWidth() - this.$element.innerWidth()) / 1.45),right,offset =0;if (pointFrom ==='top'&&absolutePosition.top - height - pointAtHeight - arrowHeight < 0) {pointFrom ='bottom';}
 if (pointFrom ==='bottom'&&absolutePosition.top + height + arrowHeight + pointAtHeight > screenHeight) {pointFrom ='top';}
 this._doSetPointFrom(pointFrom);if (pointFrom ==='bottom'||pointFrom ==='top') {left -=(width/2 - pointAtWidth/2);if (pointFrom ==='bottom') {top +=(pointAtHeight + arrowHeight);} else if (pointFrom ==='top') {top -=(height + pointAtHeight - arrowHeight);}
 }
 if (pointFrom ==='left'||pointFrom ==='right') {top -=(height/2 - pointAtHeight/2);if (pointFrom ==='left') {left -=(width + arrowHeight);} else if (pointFrom ==='right') {left +=(pointAtWidth + arrowHeight);}
 }
 right =parentWidth - left - width + parentPadding*2;if (absLeftDiff + left - screenPadding < 0) {offset =-(absLeftDiff + left) + screenPadding;} else if (absLeftDiff + left + width + screenPadding > screenWidth) {offset =screenWidth - (absLeftDiff + left + width) - screenPadding;}
 left +=offset;right -=offset;if (this.options.alignFrom ==='right') {this.$element.css({top:top,left:'auto',right:right
 });} else {this.$element.css({top:top,left:left,right:'auto'});}
 var set_arrows =false;if (pointFrom ==='top'||pointFrom ==='bottom') {if (offset < 0 ||this.options.arrowPos ==='right') {this.$element.addClass('arrow-pos-right');set_arrows =true;} else if (offset > 0 ||this.options.arrowPos ==='left') {this.$element.addClass('arrow-pos-left');set_arrows =true;}
 }
 if (!set_arrows) {this.$element.removeClass('arrow-pos-left arrow-pos-right');}
 },_doSetPointFrom:function(pointFrom) {this.$element.removeClass('arrow-top arrow-bottom arrow-right arrow-left');if (pointFrom ==='bottom')
 this.$element.addClass('arrow-top');else if (pointFrom ==='top')
 this.$element.addClass('arrow-bottom');else if (pointFrom ==='left')
 this.$element.addClass('arrow-right');else if (pointFrom ==='right')
 this.$element.addClass('arrow-left');},_setPointFrom:function() {var pointFrom =this.options.pointFrom;if (this._directions.indexOf(pointFrom) ===-1)
 return;if (this.cachedPointFrom !==pointFrom) {this._doSetPointFrom(pointFrom);this.cachedPointFrom =pointFrom;}
 }
 });CUI.util.plugClass(CUI.Popover);$(function() {$('body').fipo('tap.popover.data-api','click.popover.data-api','[data-toggle="popover"]',function (e) {var $trigger =$(this),$target =CUI.util.getDataTarget($trigger);$target =$target &&$target.length > 0 ?$target :$trigger.next('.popover');var popover =$target.popover($.extend({pointAt:$trigger},$target.data(),$trigger.data())).data('popover');popover.toggleVisibility();}).on('click.popover.data-api','[data-toggle="popover"]',false);});}(window.jQuery));(function($) {CUI.DropdownList =new Class({toString:'DropdownList',extend:CUI.Widget,construct:function(options) {var container =$("<div class=\"dropdown-container\">");var el =(this.options.positioningElement) ?this.options.positioningElement :this.$element;el.after(container);el.detach();container.append(el);this.containerElement =container;this.$element.on('change:options change:optionRenderer',function (event) {if (event.widget !==this) return;this.update();}.bind(this));this.$element.on("keydown","",this._keyPressed.bind(this));this.$element.on("blur","",function() {if (this.preventHiding) {this.preventHiding =false;return;}
 this.hide();}.bind(this));},defaults:{positioningElement:null,optionRenderer:null,options:["Apples","Pears","Bananas","Strawberries"],cssClass:null,visible:false,scrollBuffer:10,loadingIndicator:"<div class='spinner'></div>"},listElement:null,containerElement:null,currentIndex:-1,preventHiding:false,show:function() {this._unrender();this.currentIndex =-1;this.$element.focus();this._render();},hide:function(delay) {if (delay > 0) {return setTimeout(this._unrender.bind(this),delay);} else {this._unrender();}
 return null;},isVisible:function() {return this.options.visible;},toggle:function() {this.isVisible() ?this.hide() :this.show();},update:function() {if (this.listElement) {this._unrender();this._render();}
 },addItems:function(items) {var offset =this.listElement.find('li').not('.loading-indicator').length;if(this.listElement) {var list =this.listElement.find('ul');$.each(items,function(index,value) {var el =(this.options.optionRenderer) ?this.options.optionRenderer(index,value) :$("<span>"+ value.toString() + "</span>");var li =$("<li data-id=\"" + (offset+index) + "\">");if (index ===this.currentIndex) li.addClass("selected");li.append(el);list.append(li);this.options.options.push(value);}.bind(this));}
 },getNumberOfItems:function() {var offset =this.listElement.find('li').not('.loading-indicator').length;return offset;},addLoadingIndicator:function() {if(this.listElement) {this.listElement.find("ul").append($("<li>"+ this.options.loadingIndicator + "</li>").addClass("loading-indicator"));}
 },removeLoadingIndicator:function() {if (this.listElement) {this.listElement.find(".loading-indicator").remove();}
 },_keyPressed:function(event) {var key =event.keyCode;if (!this.listElement) {return;}
 var currentIndex =this.currentIndex;if (key ===38) {event.preventDefault();if (currentIndex > 0) currentIndex--;}
 if (key ===40) {event.preventDefault();if (currentIndex < (this.listElement.find("li").length - 1)) currentIndex++;}
 if (key ===27) {event.preventDefault();this.hide();return;}
 if (key ===13 ||key ===20) {event.preventDefault();if (currentIndex >=0) {this._triggerSelect(currentIndex);return;}
 }
 this.currentIndex =currentIndex;var listItems =this.listElement.find("li");listItems.removeClass("selected");if (currentIndex >=0) {var el =$(listItems[currentIndex]);el.addClass("selected");var t =el.position().top;this.listElement.animate({scrollTop:t},50);}
 },_unrender:function() {if (this.listElement) {this.listElement.remove();this.listElement =null;}
 this.containerElement.removeClass("dropdown-visible");this.options.visible =false;},_render:function() {var options =this.options.options;if (options.length ===0) return;var list =$("<ul></ul>");if (this.options.cssClass) list.addClass(this.options.cssClass);$.each(options,function(index,value) {var el =(this.options.optionRenderer) ?this.options.optionRenderer(index,value) :$("<span>"+ value.toString() + "</span>");var li =$("<li data-id=\"" + index + "\">");if (index ===this.currentIndex) li.addClass("selected");li.append(el);list.append(li);}.bind(this));list.on("click","li:not(.loading-indicator)",function(event) {event.preventDefault();this._triggerSelect($(event.target).closest("li").attr("data-id"));}.bind(this));var el =(this.options.positioningElement) ?this.options.positioningElement :this.$element;var left =el.position().left + parseFloat(el.css("margin-left"));var top =el.position().top + el.outerHeight(true) - parseFloat(el.css("margin-bottom"));var width =el.outerWidth(false);var container =$("<div class=\"dropdown-list\">");container.append(list);list =container;list.css({position:"absolute","z-index":"2000",left:left + "px",top:top + "px",width:width + "px"});this.containerElement.addClass("dropdown-visible");list.on("scroll","",function(event) {this._listScrolled();}.bind(this));list.on("mousedown","",function() {this.preventHiding =true;}.bind(this));el.after(list);this.listElement =list;this.options.visible =true;},_listScrolled:function() {if(this._reachedListBottom()) {this._triggerScrolledBottom();}
 },_reachedListBottom:function() {var listWrapper =this.listElement;var list =this.listElement.find('ul');return (list.height() - listWrapper.height() <=listWrapper.scrollTop() + this.options.scrollBuffer);},_triggerSelect:function(index) {this.$element.focus();var e =$.Event('dropdown-list:select',{selectedIndex:index,selectedValue:this.options.options[index],source:this
 });this.$element.trigger(e);},_triggerScrolledBottom:function(index) {var e =$.Event('dropdown-list:scrolled-bottom');this.$element.trigger(e);}
 });CUI.util.plugClass(CUI.DropdownList);}(window.jQuery));(function($) {CUI.Dropdown =new Class({toString:'Dropdown',extend:CUI.Widget,construct:function(options) {if (this.options.autocompleteCallback) {this.options.editable =true;}
 this._render();if (this._isMobile() &&!this.options.editable) {this._initForMobile();} else {this._initForDesktop();}
 var $button =this.$element.find('>div>button');if ($button.length > 0 &&$button.attr('type') ===undefined) {$button[0].setAttribute('type','button');}
 },defaults:{options:[],multiple:false,placeholder:"Select",disabled:false,editable:false,hasError:false
 },dropdownList:null,autocompleteList:null,syncSelectElement:null,buttonElement:null,positioningElement:null,inputElement:null,hasFocus:false,_initForMobile:function() {this.$element.addClass('mobile');this.buttonElement.on("click",function() {this._openSelectInput();}.bind(this));this.$element.find('select').on("change",function() {this._update(true);}.bind(this));this._placeSelect();},_initForDesktop:function() {this.dropdownList =new CUI.DropdownList({element:this.buttonElement,positioningElement:this.positioningElement,options:this.options.options,optionRenderer:this._optionRenderer.bind(this)
 });if (this.options.editable) {this.autocompleteList =new CUI.DropdownList({element:this.inputElement,positioningElement:this.positioningElement,options:this.options.options,optionRenderer:this._optionRendererAutocomplete.bind(this),cssClass:"autocomplete-results"});}
 this.buttonElement.on("dropdown-list:select","",this._processSelect.bind(this));this.buttonElement.on("mousedown","",function(event) {event.preventDefault();this.dropdownList.preventHiding =false;if (this.autocompleteList !==null) {this._adjustAutocompleter();} else {this.dropdownList.toggle();}
 }.bind(this));this.buttonElement.on("mouseup","",function(event) {event.preventDefault();this.dropdownList.preventHiding =true;}.bind(this));this.inputElement.on("click","",function() {if (this.autocompleteList !==null) this._adjustAutocompleter();}.bind(this));this.inputElement.on("input","",function() {if (this.autocompleteList !==null) this._adjustAutocompleter();}.bind(this));this.inputElement.on("dropdown-list:select","",function(event) {this._processSelect(event);}.bind(this));this.$element.children().on("focus","",function() {this.hasFocus =true;this._update();}.bind(this));this.$element.children().on("blur","",function() {this.hasFocus =false;this._update();}.bind(this));this.$element.find('select').on("change",function() {this._update(true);}.bind(this));},_placeSelect:function() {var $select =this.$element.find('select').first();$select.css({position:'absolute',left:0,top:0,right:0,bottom:0,width:'auto',height:'auto'});},_openSelectInput:function() {var selectElement =this.$element.find('select')[0];if (document.createEvent) {var e =document.createEvent("MouseEvents");e.initMouseEvent("mousedown",true,true,window,0,0,0,0,0,false,false,false,false,0,null);selectElement.dispatchEvent(e);} else if (selectElement.fireEvent) {selectElement.fireEvent("onmousedown");}
 },_adjustAutocompleter:function() {var searchFor =this.inputElement.val();var showResults =function(result,searchFor) {this.autocompleteList.set({options:result
 });this.autocompleteList.show();}.bind(this);if (this.options.autocompleteCallback) {this.options.autocompleteCallback(showResults,searchFor);} else {var result =[];$.each(this.options.options,function(index,value) {if (value.toLowerCase().indexOf(searchFor.toLowerCase(),0) >=0 ) result.push(value);});showResults(result,searchFor);}
 },_optionRenderer:function(index,option) {var el =$("<span>"+ option + "</span>");if (this.options.multiple) {var checkbox =$("<div class=\"checkbox\">");if (this.syncSelectElement &&$(this.syncSelectElement.find("option").get(index)).attr("selected")) {checkbox.addClass("checked");}
 el.prepend(checkbox);}
 return el;},_optionRendererAutocomplete:function(index,value) {var searchFor =this.inputElement.val();var i =value.toLowerCase().indexOf(searchFor.toLowerCase());if (i >=0) {value =value.substr(0,i) + "<em>"+ value.substr(i,searchFor.length) + "</em>"+ value.substr(i + searchFor.length);}
 return $("<span>"+ value + "</span>");},_processSelect:function(event) {if (this.syncSelectElement) {var value =event.selectedValue;var current =null;if (event.source ===this.autocompleteList) {this.syncSelectElement.find("option").each(function() {if ($(this).attr("value") ===value) current =$(this);});if (current ===null) {current =$("<option>");current.attr("value",value).text(value);this.syncSelectElement.append(current);}
 } else {current =$(this.syncSelectElement.find("option").get(event.selectedIndex));value =current.attr("value");}
 if (this.options.multiple) {var v =this.syncSelectElement.val();if (v ===null) v =[];if (v.indexOf(value) >=0) {v.splice(v.indexOf(value),1);} else {v.push(value);}
 this.syncSelectElement.val(v);this.dropdownList.update();} else {this.syncSelectElement.val(value);this.dropdownList.hide();}
 this.syncSelectElement.change();}
 this._update(true);},_render:function() {this._readDataFromMarkup();if (this.$element.get(0).tagName !=="DIV") {var div =$("<div></div>");this.$element.after(div);this.$element.detach();div.append(this.$element);this.$element =div;}
 this._createMissingElements();this.buttonElement =this.$element.find("button");this.syncSelectElement =this.$element.find("select");this.inputElement =this.$element.find("input");this.positioningElement =(this.options.editable) ?this.$element :this.buttonElement;if (!this.inputElement.attr("name")) this.inputElement.attr("name",this.syncSelectElement.attr("name") + ".edit");if (this.syncSelectElement.attr("multiple")) this.options.multiple =true;this.$element.addClass("dropdown");if (this.options.editable) this.$element.addClass("dropdown-editable");if (this.$element.find("select option").length > 0 &&this.options.options.length ===0) {this.options.options =[];this.$element.find("select option").each(function(i,e) {this.options.options.push($(e).html());}.bind(this));}
 if (this.options.multiple) {this.syncSelectElement.attr("multiple","multiple");} else {this.syncSelectElement.removeAttr("multiple","multiple");}
 if (this.options.placeholder) {this.buttonElement.text(this.options.placeholder);this.inputElement.attr("placeholder",this.options.placeholder);}
 this._update(true);},_readDataFromMarkup:function() {if (this.$element.attr("disabled")) this.options.disabled =true;if (this.$element.attr("data-disabled")) this.options.disabled =true;if (this.$element.attr("multiple")) this.options.multiple =true;if (this.$element.attr("data-multiple")) this.options.multiple =true;if (this.$element.attr("placeholder")) this.options.placeholder =this.$element.attr("placeholder");if (this.$element.attr("data-placeholder")) this.options.placeholder =this.$element.attr("data-placeholder");if (this.$element.attr("data-editable")) this.options.editable =true;if (this.$element.attr("data-error")) this.options.hasError =true;if (this.$element.hasClass("error")) this.options.hasError =true;},_createMissingElements:function() {if (this.$element.find("button").length ===0) {var button =$("<button>"+ this.options.placeholder + "</button>");button.addClass("dropdown");this.$element.append(button);}
 if (this.options.editable &&this.$element.find("input").length ===0) {var input =$("<input type=\"text\">");this.$element.prepend(input);}
 if (this.$element.find("select").length ===0) {var select =$("<select>");this.$element.append(select);}
 },_update:function(updateContent) {if (updateContent) {if (this.syncSelectElement &&!this.options.multiple) {var option =this.syncSelectElement.find("option:selected");if (option) {var selectedIndex =option.index();var text =option.text();var html =option.html();if (this.inputElement.length > 0) {this.inputElement.val(text).trigger('change');} else {this.buttonElement.html(html);}
 }
 }
 }
 if (this.options.disabled) {this.buttonElement.attr("disabled","disabled");this.inputElement.attr("disabled","disabled");} else {this.buttonElement.removeAttr("disabled");this.inputElement.removeAttr("disabled");}
 if (this.hasFocus) {this.$element.addClass("focus");} else {this.$element.removeClass("focus");}
 if (this.options.hasError) {this.$element.addClass("error");} else {this.$element.removeClass("error");}
 },_isMobile:function() {return typeof window.ontouchstart ==='object';}
 });CUI.util.plugClass(CUI.Dropdown);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=dropdown]",e.target).dropdown();});}
}(window.jQuery));(function($) {CUI.Filters =new Class({toString:'Filters',extend:CUI.Widget,construct:function(options) {this.selectedIndices =[];this.createdIndices =[];if (!this.options.autocompleteCallback) {this.options.autocompleteCallback =this._defaultAutocompleteCallback.bind(this);} else {this.usingExternalData =true;}
 if (!this.options.optionRenderer) this.options.optionRenderer =CUI.Filters.defaultOptionRenderer;this._readDataFromMarkup();if (this.options.stacking) this.options.multiple =true;this._render();if (this.options.optionDisplayStrings.length > this.options.options.length) {this.options.optionDisplayStrings =this.options.optionDisplayStrings.slice(0,this.options.options.length);}
 while (this.options.optionDisplayStrings.length < this.options.options.length) {this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);}
 this.dropdownList =new CUI.DropdownList({element:this.inputElement,positioningElement:(this.options.stacking) ?this.$element :this.inputElement,cssClass:"autocomplete-results"});this._addEventListeners();},defaults:{autocompleteCallback:null,optionRenderer:null,options:[],optionDisplayStrings:[],multiple:false,delay:200,highlight:true,stacking:false,placeholder:null,allowCreate:false,icons:null,iconSize:"small",infiniteLoad:false,maxLoadingItems:20,hasError:false
 },dropdownList:null,syncSelectElement:null,inputElement:null,typeTimeout:null,selectedIndex:-1,selectedIndices:null,createdIndices:null,triggeredBackspace:false,usingExternalData:false,selectedValue:null,isLoadingExternal:false,loadedEverything:false,setSelectedIndex:function(index) {if (index < -1 ||index >=this.options.options.length) return;this.inputElement.attr("value","");this.selectedIndex =index;if (this.options.multiple &&index >=0 &&this.selectedIndices.indexOf(index * 1) < 0) {this.selectedIndices.push(index * 1);}
 if (!this.options.multiple) {this.selectedIndices =(index >=0) ?[index] :[];}
 this._update();},removeSelectedIndex:function(index) {var i =this.selectedIndices.indexOf(index * 1);if (i < 0) return;this.selectedIndices.splice(i,1);this._update();},getSelectedIndex:function() {return this.selectedIndex;},setSelectedIndices:function(indices) {this.selectedIndices =indices.slice(0);this._update();},getSelectedIndices:function() {return this.selectedIndices.slice(0);},_addEventListeners:function() {this.$element.on('change:disabled',this._update.bind(this));this.$element.on('change:placeholder',this._update.bind(this));this.$element.on('change:options',this._changeOptions.bind(this));this.$element.on("input","input",function() {if (this.options.disabled) return;if (this.typeTimeout) clearTimeout(this.typeTimeout);this.typeTimeout =setTimeout(this._inputChanged.bind(this),this.options.delay);}.bind(this));this.$element.on("click touchend","input",function() {if (this.options.disabled) return;this.inputElement.focus();this._inputChanged();}.bind(this));this.$element.on("blur","input",function() {if (this.options.disabled) return;if (this.typeTimeout) clearTimeout(this.typeTimeout);this.typeTimeout =null;if (!this.options.multiple &&this.selectedIndex >=0) {if (this.inputElement.attr("value") ==="") {this.setSelectedIndex(-1);} else {this._update();}
 }
 var hasError =this.options.hasError ||(!this.options.multiple &&this.inputElement.val().length > 0 &&this.selectedIndex < 0);this.$element.toggleClass("error",hasError);}.bind(this));this.$element.on("keydown","input",this._keyPressed.bind(this));this.$element.on("keyup","input",this._keyUp.bind(this));this.dropdownList.on("dropdown-list:select","",function(event) {if(this.options.infiniteLoad) {this.loadedEverything =false;}
 this.dropdownList.hide(200);if(this.usingExternalData) {this._createNewOption(event.selectedValue.toString(),event.selectedValue.toString(),true);this._update();}
 var pos =$.inArray(event.selectedValue.toString(),this.options.options);this.setSelectedIndex(pos * 1);}.bind(this));if(this.options.infiniteLoad) {this.dropdownList.on("dropdown-list:scrolled-bottom","",function(event) {if(!this.isLoadingExternal &&!this.loadedEverything) {this.isLoadingExternal =true;this.dropdownList.addLoadingIndicator();var offset =this.dropdownList.getNumberOfItems();var searchFor =this.inputElement.attr("value");this.options.autocompleteCallback($.proxy(this._appendLoadedData,this),searchFor,offset,this.options.maxLoadingItems);}
 }.bind(this));}
 this.$element.on("click","[data-dismiss=filter]",function(event) {if (this.options.disabled) return;var e =$(event.target).closest("[data-id]");this.removeSelectedIndex(e.attr("data-id"));return false;}.bind(this));this.$element.on("input","input",function() {if (this.options.disabled) return;this._correctInputFieldWidth();}.bind(this));this.$element.on("focus","input",function(event) {if (this.options.disabled) return;this.$element.addClass("focus");event.preventDefault();}.bind(this));this.$element.on("blur","input",function() {if (this.options.disabled) return;this.$element.removeClass("focus");}.bind(this));},_changeOptions:function(event) {if (event.widget !==this) return;this.selectedIndex =-1;this.selectedIndices =[];this.createdIndices =[];this._update();},_render:function() {var div;if (this.$element.get(0).tagName ==="SELECT") {div =$("<div></div>");this.$element.after(div);this.$element.detach();div.append(this.$element);this.$element =div;}
 if (this.$element.get(0).tagName ==="INPUT") {div =$("<div></div>");this.$element.after(div);this.$element.detach();div.prepend(this.$element);this.$element =div;}
 if (this.$element.find("select option").length > 0 &&this.options.options.length ===0) {this.options.options =[];this.options.optionDisplayStrings =[];this.$element.find("select option").each(function(i,e) {this.options.options.push($(e).val());this.options.optionDisplayStrings.push($.trim($(e).text()));if ($(e).attr("selected")) {this.selectedIndices.push(i);this.selectedIndex =i;}
 }.bind(this));}
 this._createMissingElements();this.syncSelectElement =this.$element.find("select");this.inputElement =this.$element.find("input");this.$element.addClass("filters");this.$element.removeClass("focus");if (!this.options.placeholder) this.options.placeholder =this.inputElement.attr("placeholder");if (this.options.name) this.syncSelectElement.attr("name",this.options.name);if (this.options.stacking) this.$element.addClass("stacking");else this.$element.removeClass("stacking");this._update();},_createMissingElements:function() {if (this.$element.find("select").length ===0) {this.$element.append($("<select "+ (this.options.multiple ?"multiple":"") + "></select>"));}
 if (this.$element.find("input").length ===0) {this.$element.prepend($("<input type=\"text\">"));}
 if (this.$element.find("select option").length < this.options.options.length) {for(var i =this.$element.find("select option").length;i < this.options.options.length;i++) {var value =this.options.options[i];var name =this.options.optionDisplayStrings[i] ||this.options.options[i];var opt =$("<option></option>");opt.text(name);opt.attr("value",value);this.$element.find("select").append(opt);}
 }
 },_readDataFromMarkup:function() {if (this.$element.attr("multiple")) this.options.multiple =true;if (this.$element.attr("data-multiple")) this.options.multiple =true;if (this.$element.attr("data-stacking")) this.options.stacking =true;if (this.$element.attr("placeholder")) this.options.placeholder =this.$element.attr("placeholder");if (this.$element.attr("data-placeholder")) this.options.placeholder =this.$element.attr("data-placeholder");if (this.$element.attr("disabled")) this.options.disabled =true;if (this.$element.hasClass("error")) this.options.hasError =true;if (this.$element.find("input").hasClass("error")) this.options.hasError =true;if (this.$element.attr("data-disabled")) this.options.disabled =true;if (this.$element.attr("data-allow") ==="create") this.options.allowCreate =true;if (this.$element.attr("data-option-renderer")) {this.options.optionRenderer =CUI.Filters[this.$element.attr("data-option-renderer") + "OptionRenderer"];if (!this.options.optionRenderer) this.options.optionRenderer =CUI.Filters.defaultOptionRenderer;}
 },_update:function() {if (this.options.placeholder) this.inputElement.attr("placeholder",this.options.placeholder);if (this.options.disabled) {this.$element.addClass("disabled");this.inputElement.attr("disabled","disabled");} else {this.$element.removeClass("disabled");this.inputElement.removeAttr("disabled");}
 if (!this.options.multiple) {if (this.syncSelectElement) this.syncSelectElement.find("option:selected").removeAttr("selected");if (this.selectedIndex >=0) {if (this.syncSelectElement) $(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected","selected");var option =this.options.options[this.selectedIndex];if (this.options.optionDisplayStrings[this.selectedIndex]) {option =this.options.optionDisplayStrings[this.selectedIndex];}
 this.inputElement.attr("value",option);} else {this.inputElement.attr("value","");}
 this.$element.find('select').change();return;}
 if (this.syncSelectElement) {this.syncSelectElement.find("option:selected").removeAttr("selected");for(var i =0;i < this.selectedIndices.length;i++) {var index =this.selectedIndices[i];$(this.syncSelectElement.find("option").get(index)).attr("selected","selected");}
 }
 var ul =$("<ul class=\"tags\"></ul>");$.each(this.selectedIndices,function(iterator,index) {var option =this.options.options[index];var el =(this.options.optionRenderer.bind(this))(index,option,false,false);var li =$("<li data-id=\"" + index + "\"><button data-dismiss=\"filter\">&times;</button></li>");ul.append(li);li.append(el);}.bind(this));this.$element.find("ul").remove();if (ul.children().length > 0) {if (this.options.stacking) {this.$element.prepend(ul);} else {this.$element.append(ul);}
 }
 this._correctInputFieldWidth();this.$element.find('select').change();},_keyUp:function(event) {var key =event.keyCode;if (key ===8) {this.triggeredBackspace =false;}
 },_keyPressed:function(event) {var key =event.keyCode;if (key ===8) {if (this.triggeredBackspace ===false &&this.inputElement.attr("value").length ===0) {if (this.options.multiple &&this.selectedIndices.length > 0) {event.preventDefault();this.removeSelectedIndex(this.selectedIndices[this.selectedIndices.length - 1]);this._inputChanged();}
 }
 this.triggeredBackspace =true;}
 if (!this.dropdownList.isVisible()) {if (key ===40) {this._inputChanged();event.preventDefault();}
 if (key ===13) {var val =this.inputElement.val();if (val.length > 0) {this._createNewOption(val,val,false);event.preventDefault();}
 }
 } else {if (key ===13 &&this.dropdownList.currentIndex < 0) {this.dropdownList.hide();event.preventDefault();}
 }
 },_createNewOption:function(name,displayName,fromInternal) {var existingIndex =-1;$.each(this.options.options,function(index,optionName) {if (this.options.optionDisplayStrings[index] ===name) existingIndex =index;if (optionName ===name) existingIndex =index;}.bind(this));if (existingIndex >=0) {this.setSelectedIndex(existingIndex);return;}
 if (!this.options.allowCreate &&!fromInternal) return;var index =this.options.options.length;this.options.options.push(name);this.options.optionDisplayStrings.push(displayName);if (this.syncSelectElement) {var el =$("<option></option>");el.text(displayName);el.attr("value",name);if (!fromInternal) el.attr("data-new","true");this.syncSelectElement.append(el);}
 if (!fromInternal) this.createdIndices.push(index);this.setSelectedIndex(index);},_correctInputFieldWidth:function() {if (!this.options.stacking) return;var i =this.inputElement;var text =i.attr("value");if (text.length ===0) text =i.attr("placeholder");var styles =["font-family","font-weight","font-style","font-size","letter-spacing","line-height","text-transform"];var div =$("<div style=\"position:absolute;display:none;\"></div>");$.each(styles,function(x,style) {div.css(style,i.css(style));});div.text(text);$("body").append(div);var w =div.width() + 25;div.remove();var border =parseFloat(i.css("margin-left")) + parseFloat(i.css("margin-right"));var isEmpty =(this.selectedIndices.length ===0);if (isEmpty ||w > (this.$element.width() - border)) {w =(this.$element.width() - border);}
 i.width(w);},_inputChanged:function() {if(this.options.infiniteLoad) {this.loadedEverything =false;}
 var searchFor =this.inputElement.attr("value");this.options.autocompleteCallback($.proxy(this._showAutocompleter,this),searchFor,0,(this.options.infiniteLoad) ?this.options.maxLoadingItems :500);},_appendLoadedData:function(results) {this.dropdownList.removeLoadingIndicator();if(results.length ===0) {this.loadedEverything =true;this.isLoadingExternal =false;return;}
 this.dropdownList.addItems(results);this.isLoadingExternal =false;},_showAutocompleter:function(results) {this.dropdownList.hide();if (this.options.multiple) {var l =[];$.each(results,function(iterator,key) {var pos =$.inArray(key,this.options.options);if (this.selectedIndices.indexOf(pos) >=0) return;l.push(key);}.bind(this));results =l;} if (results.length ===0) return;var optionRenderer =function(index,key) {return (this.options.optionRenderer.bind(this))(index,key,this.options.highlight,!$.isEmptyObject(this.options.icons));};this.dropdownList.set("optionRenderer",optionRenderer.bind(this));this.dropdownList.set("options",results);this.dropdownList.show();},_defaultAutocompleteCallback:function(handler,searchFor) {var result =[];$.each(this.options.options,function(index,key) {var name =key;if (this.options.optionDisplayStrings[index]) {name =this.options.optionDisplayStrings[index];}
 if (name.toLowerCase().indexOf(searchFor.toLowerCase(),0) >=0 ) result.push(key);}.bind(this));handler(result,searchFor);},_buildIcon:function(type,attr,size) {if(type ==="url") {return '<i class="'+ size + ' icon-inline-bg-image" style="background-image: url('+ attr + ')">'+ 'icon'+ '</i>';} else if(type ==="cuiIcon") {return '<i class="'+ attr + ' '+ size + '">'+ attr.split('icon-')[1] + '</i>';}
 }
 });CUI.util.plugClass(CUI.Filters);$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=filters]",e.target).filters();});}(window.jQuery));CUI.Filters.defaultOptionRenderer =function(index,key,highlight,icon) {var pos =$.inArray(key,this.options.options);var value =key;if (this.options.optionDisplayStrings[pos]) {value =this.options.optionDisplayStrings[pos];}
 var searchFor =this.inputElement.val();if (highlight) {var i =value.toLowerCase().indexOf(searchFor.toLowerCase());if (i >=0) {value =value.substr(0,i) + "<em>"+ value.substr(i,searchFor.length) + "</em>"+ value.substr(i + searchFor.length);}
 }
 if (this.createdIndices.indexOf(pos) >=0) {value =value + "&nbsp;*";}
 if(icon) {var attr;if(typeof(attr =this.options.icons[key]) !=="undefined") {var type =(/^icon-/i.test(attr)) ? "cuiIcon" : "url";
 value =this._buildIcon(type,attr,this.options.iconSize) + value;}
 }
 return $("<span>"+ value + "</span>");};CUI.Filters.cqTagOptionRenderer =function(iterator,key,highlight) {var index =$.inArray(key,this.options.options);var value =key;if (this.options.optionDisplayStrings[index]) {value =this.options.optionDisplayStrings[index];}
 var searchFor =this.inputElement.val();var namespaced =value.split(":");if (namespaced.length < 2) namespaced[1] ="";var namespace =namespaced[0];var restPath =namespaced[1];var pathParts =restPath.split("/");function e(text) {return $("<div>").text(text).html();}
 value =namespace + ": ";for(var q =0;q < pathParts.length;q++) {var part =pathParts[q];if (highlight) {var i =part.toLowerCase().indexOf(searchFor.toLowerCase());if (i >=0) {part =e(part.substr(0,i)) + "<em>"+ e(part.substr(i,searchFor.length)) + "</em>"+ e(part.substr(i + searchFor.length));} else {part =e(part);}
 } else {part =e(part);}
 if (q > 0) value +=" / ";if (q ===pathParts.length - 1) part ="<b>"+ part + "</b>";value =value + part;}
 if (this.createdIndices.indexOf(index) >=0) {value =value + "&nbsp;*";}
 return $("<span>"+ value + "</span>");};(function($) {CUI.Slider =new Class({toString:'Slider',extend:CUI.Widget,construct:function(options) {var that =this;that.options =$.extend({},this.defaults,options);if (this.$element.hasClass('vertical')) {that.options.orientation ='vertical';that.isVertical =true;}
 if(that.$element.hasClass('tooltips')) {that.options.tooltips =true;}
 if(that.$element.hasClass('ticked')) {that.options.ticks =true;}
 if(this.$element.hasClass('filled')) {that.options.filled =true;}
 if (this.$element.data("slide")) {that.options.slide =true;}
 if(this.$element.hasClass('bound')) {that.options.bound =true;}
 var elementId =this.$element.attr('id');if(!elementId) {this.$element.data("_tmp",0).attr("id","cui-slider-"+$.expando+"-"+this.$element.get(0)[$.expando]).removeData("_tmp");elementId =this.$element.attr('id');}
 this._renderMissingElements();var $fieldset =that.$element.find("fieldset");var $legend;if ($fieldset.length) {that.$element.append($fieldset.contents(":not(legend)"));var $newFieldset =$('<div role="group" class="sliderfieldset" />');that.$element.wrap($newFieldset);$legend =$fieldset.find("legend").first();if ($legend.length) {var $newLegend =$('<label/>').append($legend.contents());$.each($legend.prop("attributes"),function() {$newLegend.attr(this.name,this.value);});if (!$newLegend.attr("id")) {$newLegend.attr("id",elementId+"-legend");}
 $newFieldset.attr("aria-labelledby",$newLegend.attr("id"));$fieldset.replaceWith($newLegend);$legend =$newLegend.insertBefore(that.$element);}
 }
 that.$inputs =this.$element.find('input');var values =[];that.$inputs.each(function(index) {var $this =$(this);var thisId =$this.attr("id");if (!thisId) {$this.attr("id",elementId+"-input"+index);thisId =$this.attr("id");}
 if (!$this.attr("aria-labelledby")) {$this.attr("aria-labelledby","");}
 var $label =that.$element.find("label[for='"+thisId+"']");if ($legend) {if($this.attr("aria-labelledby").indexOf($legend.attr("id"))===-1) {$this.attr("aria-labelledby",$legend.attr("id")+($this.attr("aria-labelledby").length ?" ":"")+$this.attr("aria-labelledby"));}
 }
 if ($label.length) {$label.not($this.parent()).insertBefore(that.$element);$label.each(function(index) {if (!$(this).attr("id")) {$(this).attr("id",thisId+"-label"+index);}
 if($this.attr("aria-labelledby").indexOf(thisId+"-label"+index)===-1) {$this.attr("aria-labelledby",($this.attr("aria-labelledby").length ?" ":"")+thisId+"-label"+index);}
 if (!CUI.util.isTouch)
 {$(this).fipo("touchstart","mousedown",function(event) {that.$handles.eq(index).focus();}.bind(this));}
 });}
 if ($this.parent().is("label")) {$label =$this.parent();if (!$label.attr("id")) {$label.attr("id",thisId+"-label");}
 if (!$label.attr("for")) {$label.attr("for",thisId);}
 $this.insertAfter($label);if ($legend) {$label.addClass("hidden-accessible");}
 $label.insertBefore(that.$element);}
 if ($label.length &&$this.attr("aria-labelledby").indexOf($label.attr("id"))===-1)
 {$this.attr("aria-labelledby",$this.attr("aria-labelledby")+($this.attr("aria-labelledby").length ?" ":"")+$label.attr("id"));}
 if ($label.length===0 &&$this.attr("aria-labelledby").length>0)
 {$label =$("#"+$this.attr("aria-labelledby").split(" ")[0]);}
 if ($this.attr("aria-labelledby").length===0)
 {$this.removeAttr("aria-labelledby");}
 if (!$this.is("[step]")) $this.attr('step',that.options.step);if (!$this.is("[min]")) $this.attr('min',that.options.min);if (!$this.is("[max]")) $this.attr('max',that.options.max);if (!$this.is("[value]")) {$this.attr({'value':that.options.value,'aria-valuetext':that.options.valuetextFormatter(that.options.value)});values.push(that.options.value);} else {values.push($this.attr('value'));}
 if(index ===0) {if($this.is(":disabled")) {that.options.disabled =true;that.$element.addClass("disabled");} else {if(that.options.disabled) {$this.attr("disabled","disabled");that.$element.addClass("disabled");}
 }
 } if (CUI.util.isTouch)
 {$this.on("change",function(event) {if (that.options.disabled) return;if ($this.val()===that.values[index]) return;that.setValue($this.val(),index);}.bind(this));$this.on("focus",function(event) {that._focus(event);}.bind(this));$this.on("blur",function(event) {that._blur(event);}.bind(this));} else {$this.attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});if (index===0) {if ($label) {$label.on("click",function(event) {if (that.options.disabled) return;that._clickLabel(event);}.bind(this));}
 if ($legend) {$legend.on("click",function(event) {if (that.options.disabled) return;that._clickLabel(event);}.bind(this));}
 }
 }
 });that.values =values;if (this.options.orientation ==='vertical') this.isVertical =true;this.$element.fipo("touchstart","mousedown",function(event) {this._mouseDown(event);}.bind(this));this.$element.on('change:value',this._processValueChanged.bind(this));this.$element.on('change:disabled',this._processDisabledChanged.bind(this));this.$element.on('change:min',this._processMinMaxStepChanged.bind(this));this.$element.on('change:max',this._processMinMaxStepChanged.bind(this));this.$element.on('change:step',this._processMinMaxStepChanged.bind(this));this._render();},defaults:{step:'1',min:'1',max:'100',value:'1',orientation:'horizontal',slide:false,disabled:false,tooltips:false,tooltipFormatter:function(value) {return value.toString();},valuetextFormatter:function(value) {return value.toString();},ticks:false,filled:false,bound:false
 },values:[],$inputs:null,$ticks:null,$fill:null,$handles:null,$tooltips:null,isVertical:false,draggingPosition:-1,setValue:function(value,handleNumber) {handleNumber =handleNumber ||0;this._updateValue(handleNumber,value,true);this._moveHandles();if(this.options.filled) {this._updateFill();} },_renderMissingElements:function() {if (!this.$element.find("input").length) {var that =this,el,values =($.isArray(this.options.value)) ?this.options.value :[this.options.value];$.each(values,function(index,value) {el =$("<input>");el.attr({"type":"range","min":that.options.min,"max":that.options.max,"step":that.options.step,"value":value }).val(value);that.$element.append(el);});}
 if (!this.$element.find("div.clickarea").length) {var el2 =$("<div class=\"clickarea\">");this.$element.prepend(el2);}
 this.$element.toggleClass("slider",true);this.$element.toggleClass("vertical",this.options.orientation ==='vertical');this.$element.toggleClass("tooltips",this.options.tooltips);this.$element.toggleClass("ticked",this.options.ticks);this.$element.toggleClass("filled",this.options.filled);},_processValueChanged:function() {var that =this,values =($.isArray(this.options.value)) ?this.options.value :[this.options.value];$.each(values,function(index,value) {that._updateValue(index,value,true);});this._moveHandles();if(this.options.filled) {this._updateFill();} },_processMinMaxStepChanged:function() {var that =this;this.$element.find("input").attr("min",this.options.min);this.$element.find("input").attr("max",this.options.max);this.$element.find("input").attr("step",this.options.step);$.each(this.values,function(index,value) {that._updateValue(index,value,true);});if(this.options.ticks) {this.$element.find(".ticks").remove();this._buildTicks();}
 if(this.options.filled) {this.$element.find(".fill").remove();this._buildFill();}
 this._moveHandles();if(this.options.filled) {this._updateFill();} },_processDisabledChanged:function() {if (this.options.disabled) {this.$inputs.attr("disabled","disabled");this.$handles.each(function() {$(this).removeClass("focus");$(this).parent().removeClass("focus");});if (CUI.util.isTouch) this.$handles.attr("aria-disabled",true).removeAttr("tabindex");} else {this.$inputs.removeAttr("disabled");if (CUI.util.isTouch)
 this.$handles.removeAttr("aria-disabled").attr("tabindex",0);}
 this.$element.toggleClass("disabled",this.options.disabled);},_render:function() {var that =this;var maximums =that.$inputs.map(function() {return $(this).attr('max');});that.options.max =Math.max.apply(null,maximums.toArray());var minimums =that.$inputs.map(function() {return $(this).attr('min');});that.options.min =Math.min.apply(null,minimums.toArray());var steps =that.$inputs.map(function() {return $(this).attr('step');});that.options.step =Math.min.apply(null,steps.toArray());if(that.options.ticks) {that._buildTicks();}
 if(that.options.filled) {that._buildFill();}
 that._buildHandles();},_buildTicks:function() {var that =this;var $ticks =$("<div></div>").addClass('ticks');this.$element.prepend($ticks);var numberOfTicks =Math.round((that.options.max - that.options.min) / that.options.step) - 1;var trackDimensions =that.isVertical ?that.$element.height() :that.$element.width();for (var i =0;i < numberOfTicks;i++) {var position =(i+1) * (trackDimensions / (numberOfTicks+1));var percent =(position / trackDimensions) * 100;var tick =$("<div></div>").addClass('tick').css((that.isVertical ?'bottom':'left'),percent + "%");$ticks.append(tick);}
 that.$ticks =$ticks.find('.tick');if(that.options.filled) {that._coverTicks();}
 },_buildFill:function() {var that =this;this.$fill =$("<div></div>").addClass('fill');if(that.values.length !==0) {var percent,fillPercent;if(that.values.length < 2) {percent =(that.values[0] - that.options.min) / (that.options.max - that.options.min) * 100;this.$fill.css((that.isVertical ?'height':'width'),percent + "%");} else {percent =(this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;fillPercent =(this._getHighestValue() - this._getLowestValue()) / (that.options.max - that.options.min) * 100;this.$fill.css((that.isVertical ?'height':'width'),fillPercent + "%")
 .css((that.isVertical ?'bottom':'left'),percent + "%");}
 }
 this.$element.prepend(this.$fill);that.options.filled =true;},_buildHandles:function() {var that =this;that.$inputs.each(function(index) {var wrap =$(this).wrap("<div></div>").parent().addClass("value");var percent =(that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;var handle =$('<div></div>').addClass('handle').css((that.isVertical ?'bottom':'left'),percent + "%")
 .attr({"role":"slider","id":$(this).attr("id")+"-handle","aria-valuemin":that.options.min,"aria-valuemax":that.options.max,"aria-valuenow":that.values[index],"aria-valuetext":that.options.valuetextFormatter(that.values[index])
 });$(this).css((that.isVertical ?'bottom':'left'),percent + "%");$(wrap).append(handle);if(that.options.tooltips) {var tooltip =$("<output>"+ $(this).attr('value') + "</output>").addClass('tooltip').addClass(that.isVertical ?'arrow-left':'arrow-bottom')
 .attr({'id':$(this).attr("id")+"-tooltip",'for':$(this).attr("id")});handle.append(tooltip);}
 if ($(this).attr("aria-labelledby")) {handle.attr("aria-labelledby",$(this).attr("aria-labelledby"));}
 if (that.$inputs.length>1 &&$(this).attr("aria-labelledby")) {var inputlabelids =$(this).attr("aria-labelledby").split(" "),label;for(var i =0;i<inputlabelids.length;i++)
 {label =$("#"+inputlabelids[i]);if (i>0)
 {label.removeAttr("for");handle.prepend(label);}
 }
 }
 if (CUI.util.isTouch) {handle.attr("aria-hidden",true);$(this).attr("tabindex",0).removeAttr("aria-hidden").removeAttr("hidden");} else {handle.on("focus",function(event) {that._focus(event);}.bind(this));handle.on("blur",function(event) {that._blur(event);}.bind(this));handle.on("keydown",function(event) {that._keyDown(event);}.bind(this));handle.attr("tabindex",0);$(this).attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});}
 if (that.options.disabled) {handle.attr("aria-disabled",true).removeAttr("tabindex");}
 });that.$handles =that.$element.find('.handle');that.$tooltips =that.$element.find('.tooltip');},_handleClick:function(event) {if(this.options.disabled) return false;var that =this;var mouseX =event.pageX;var mouseY =event.pageY;if (event.type ==="touchstart") {var touches =(event.originalEvent.touches.length > 0) ?event.originalEvent.touches :event.originalEvent.changedTouches;mouseX =touches[0].pageX;mouseY =touches[0].pageY;}
 if (mouseX ===undefined ||mouseY ===undefined) return;var pos =that._findNearestHandle(mouseX,mouseY);var val =that._getValueFromCoord(mouseX,mouseY,true);if (!isNaN(val))
 {that._updateValue(pos,val);that._moveHandles();if(that.options.filled) {that._updateFill();}
 }
 if (!CUI.util.isTouch) {if (event.type ==="mousedown") {that.$handles.eq(pos).data("mousedown",true);}
 that.$handles.eq(pos).focus();} },_findNearestHandle:function(mouseX,mouseY) {var that =this;var closestDistance =999999;var pos =0;that.$handles.each(function(index) {var handleX =$(this).offset().left;var handleY =$(this).offset().top;var handleWidth =$(this).width();var handleHeight =$(this).height();var distance =Math.abs(mouseX - (handleX+(handleWidth/2)));if(that.options.orientation ==="vertical") {distance =Math.abs(mouseY - (handleY+(handleHeight/2)));}
 if(distance < closestDistance) {closestDistance =distance;pos =index;}
 });return pos;},_focus:function(event) {if (this.options.disabled) return false;var that =this,$this =$(event.target),$value =$this.closest(".value"),$handle =$value.find(".handle");if (!$handle.data("mousedown")) {that.$element.addClass("focus");$value.addClass("focus");$handle.addClass("focus");}
 },_blur:function(event) {if (this.options.disabled) return false;var that =this,$this =$(event.target),$value =$this.closest(".value"),$handle =$value.find(".handle");that.$element.removeClass("focus");$value.removeClass("focus");$handle.removeClass("focus").removeData("mousedown");},_keyDown:function(event) {if (this.options.disabled) return;var that =this,$this =$(event.target),$input =$this.closest(".value").find("input"),index =that.$inputs.index($input),val =Number($input.val()),step =Number(that.options.step),minimum =Number(that.options.min),maximum =Number(that.options.max),page =Math.max(step,Math.round((maximum-minimum)/10));$this.removeData("mousedown");that._focus(event);switch(event.keyCode) {case 40:case 37:val-=step;event.preventDefault();break;case 38:case 39:val+=step;event.preventDefault();break;case 33:val+=(page-(val%page));event.preventDefault();break;case 34:val-=(page- (val%page===0 ?0 :page-val%page));event.preventDefault();break;case 35:val =maximum;event.preventDefault();break;case 36:val =minimum;event.preventDefault();break;}
 if (val !==Number($input.val())) {that.setValue(val,index);$input.change();}
 },_mouseDown:function(event) {if(this.options.disabled) return false;event.preventDefault();var that =this,$handle;this.draggingPosition =-1;this.$handles.each(function(index,handle) {if (handle ===event.target) that.draggingPosition =index;}.bind(this));this.$tooltips.each(function(index,tooltip) {if (tooltip ===event.target) that.draggingPosition =index;}.bind(this));if (this.draggingPosition < 0) {this._handleClick(event);return;}
 $handle =this.$handles.eq(this.draggingPosition);$handle.addClass("dragging");this.$element.closest("body").addClass("slider-dragging-cursorhack");$(window).fipo("touchmove.slider","mousemove.slider",this._handleDragging.bind(this));$(window).fipo("touchend.slider","mouseup.slider",this._mouseUp.bind(this));if ($handle !==document.activeElement &&!CUI.util.isTouch) {if (event.type ==="mousedown") {$handle.data("mousedown",true);}
 $handle.focus();}
 },_handleDragging:function(event) {var mouseX =event.pageX;var mouseY =event.pageY;if (event.originalEvent.targetTouches) {var touch =event.originalEvent.targetTouches.item(0);mouseX =touch.pageX;mouseY =touch.pageY;}
 this._updateValue(this.draggingPosition,this._getValueFromCoord(mouseX,mouseY));this._moveHandles();if(this.options.filled) {this._updateFill();}
 event.preventDefault();},_mouseUp:function() {this.$handles.eq(this.draggingPosition).removeClass("dragging");this.$element.closest("body").removeClass("slider-dragging-cursorhack");this.draggingPosition =-1;$(window).unbind("mousemove.slider touchmove.slider");$(window).unbind("mouseup.slider touchend.slider");},_clickLabel:function(event) {this.$handles.eq(0)[0].focus();},_updateValue:function(pos,value,doNotTriggerChange) {var that =this;if (that.$inputs.eq(pos).attr("value") !==value.toString() ||(that.values[pos] !==value.toString())) {if (value > this.options.max) value =this.options.max;if (value < this.options.min) value =this.options.min;if(pos ===0 ||pos ===1) {if (that.$inputs.length===2 &&this.options.bound)
 {if (pos===0) {value =Math.min(value,Number(that.$inputs.eq(1).val()));that.$inputs.eq(1).attr({"min":value});that.$inputs.eq(pos).attr({"max":that.$inputs.eq(1).val()});that.$handles.eq(1).attr({"aria-valuemin":value});that.$handles.eq(pos).attr({"aria-valuemax":that.$inputs.eq(1).val()});} else {value =Math.max(value,Number(that.$inputs.eq(0).val()));that.$inputs.eq(0).attr({"max":value});that.$inputs.eq(pos).attr({"min":that.$inputs.eq(0).val()});that.$handles.eq(0).attr({"aria-valuemax":value});that.$handles.eq(pos).attr({"aria-valuemin":that.$inputs.eq(0).val()});}
 }
 that.values[pos] =value.toString();that.$inputs.eq(pos).val(value).attr({"value":value,"aria-valuetext":that.options.valuetextFormatter(value)});that.$handles.eq(pos).attr({"aria-valuenow":value,"aria-valuetext":that.options.valuetextFormatter(value)});if (!doNotTriggerChange) {setTimeout(function() {that.$inputs.eq(pos).change();},1);}
 }
 }
 },_moveHandles:function() {var that =this;this.$handles.each(function(index) {var percent =(that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;var $input =that.$inputs.eq(index);if(that.options.orientation ==="vertical") {if(that.options.slide) {$(this).stop().animate({bottom:percent + "%"});$input.stop().animate({bottom:percent + "%"});} else {$(this).css("bottom",percent + "%");$input.css("bottom",percent + "%");}
 } else {if(that.options.slide) {$(this).stop().animate({left:percent + "%"});$input.stop().animate({left:percent + "%"});} else {$(this).css("left",percent + "%");$input.css("left",percent + "%");}
 }
 if(that.options.tooltips) {that.$tooltips.eq(index).html(that.options.tooltipFormatter(that.values[index]));}
 });},_updateFill:function() {var that =this;var percent;if(that.values.length !==0) {if(that.values.length ===2) {percent =((that._getLowestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;var secondPercent =((that._getHighestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;var percentDiff =secondPercent - percent;if(that.options.orientation ==="vertical") {if(that.options.slide) {that.$fill.stop().animate({bottom:percent + "%",height:percentDiff + "%"});} else {that.$fill.css("bottom",percent + "%").css("height",percentDiff + "%");}
 } else {if(that.options.slide) {that.$fill.stop().animate({left:percent + "%",width:percentDiff + "%"});} else {that.$fill.css("left",percent + "%").css("width",percentDiff + "%");}
 }
 } else {percent =((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;if(that.options.orientation ==="vertical") {if(that.options.slide) {that.$fill.stop().animate({height:percent + "%"});} else {that.$fill.css("height",percent + "%");}
 } else {if(that.options.slide) {that.$fill.stop().animate({width:percent + "%"});} else {that.$fill.css("width",percent + "%");}
 }
 }
 }
 if(that.options.ticks) {that._coverTicks();}
 },_coverTicks:function() {var that =this;that.$ticks.each(function(index) {var value =that._getValueFromCoord($(this).offset().left,$(this).offset().top);if(that.values.length ===2) {if((value > that._getLowestValue()) &&(value < that._getHighestValue())) {if(!$(this).hasClass('covered')) $(this).addClass('covered');} else {$(this).removeClass('covered');}
 } else {if(value < that._getHighestValue()) {if(!$(this).hasClass('covered')) $(this).addClass('covered');} else {$(this).removeClass('covered');}
 }
 });},_getValueFromCoord:function(posX,posY,restrictBounds) {var that =this;var percent,snappedValue,remainder;var elementOffset =that.$element.offset();if(that.options.orientation ==="vertical") {var elementHeight =that.$element.height();percent =((elementOffset.top + elementHeight) - posY) / elementHeight;} else {var elementWidth =that.$element.width();percent =((posX - elementOffset.left) / elementWidth);}
 if (restrictBounds &&(percent<0 ||percent>1)) return NaN;var rawValue =that.options.min * 1 + ((that.options.max - that.options.min) * percent);if(rawValue >=that.options.max) return that.options.max;if(rawValue <=that.options.min) return that.options.min;remainder =((rawValue - that.options.min) % that.options.step);if(Math.abs(remainder) * 2 >=that.options.step) {snappedValue =(rawValue - remainder) + (that.options.step * 1);} else {snappedValue =rawValue - remainder;}
 return snappedValue;},_getHighestValue:function() {return Math.max.apply(null,this.values);},_getLowestValue:function() {return Math.min.apply(null,this.values);}
 });CUI.util.plugClass(CUI.Slider);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$(".slider[data-init~='slider']",e.target).slider();});}
}(window.jQuery));(function($) {CUI.LabeledSlider =new Class({toString:'LabeledSlider',extend:CUI.Slider,alternating:false,construct:function() {this.$element.addClass("labeled-slider");},_getTickLabel:function(index) {var el =this.$element.find("ul.tick-labels li").eq(index);return el.html();},_buildTicks:function() {var that =this;if (this.$element.hasClass("label-alternating")) this.alternating =true;var $ticks =$("<div></div>").addClass('ticks');this.$element.prepend($ticks);var numberOfTicks =Math.ceil((that.options.max - that.options.min) / that.options.step) - 1;var trackDimensions =that.isVertical ?that.$element.height() :that.$element.width();var maxSize =trackDimensions / (numberOfTicks + 1);if (this.alternating) maxSize *=2;for (var i =0;i < numberOfTicks;i++) {var position =trackDimensions * (i + 1) / (numberOfTicks + 1);var tick =$("<div></div>").addClass('tick').css((that.isVertical ?'bottom':'left'),position + "px");$ticks.append(tick);var className ="tick-label-"+ i;var ticklabel =$("<div></div").addClass('tick-label '+ className);if (!that.isVertical) position -=maxSize / 2;ticklabel.css((that.isVertical ?'bottom':'left'),position + "px");if (!that.isVertical) ticklabel.css('width',maxSize + "px");if (that.alternating &&!that.isVertical &&i % 2 ===1) {ticklabel.addClass('alternate');tick.addClass('alternate');}
 ticklabel.append(that._getTickLabel(i));$ticks.append(ticklabel);}
 that.$ticks =$ticks.find('.tick');if(that.options.filled) {that._coverTicks();}
 }
 });CUI.util.plugClass(CUI.LabeledSlider);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$(".slider[data-init~='labeled-slider']",e.target).labeledSlider();});}
}(window.jQuery));(function($) {CUI.Datepicker =new Class({toString:'Datepicker',extend:CUI.Widget,defaults:{monthNames:null,dayNames:null,format:null,type:"date",selectedDateTime:null,startDay:0,disabled:false,displayedFormat:null,storedFormat:null,headFormat:"MMMM YYYY",forceHTMLMode:false,required:false,hasError:false
 },displayDateTime:null,pickerShown:false,useNativeControls:false,internFormat:'YYYY-MM-DD[T]HH:mmZ',officialDateFormat:'YYYY-MM-DD',officialTimeFormat:'HH:mm',officialDatetimeFormat:'YYYY-MM-DD[T]HH:mmZ',language:'coralui',construct:function(options) {this._readDataFromMarkup();this._adjustMarkup();this.options.monthNames =this.options.monthNames ||CUI.Datepicker.monthNames;this.options.dayNames =this.options.dayNames ||CUI.Datepicker.dayNames;this.language ='coralui_'+ new Date().getTime();moment.lang(this.language,{months:this.options.monthNames,weekdaysMin:this.options.dayNames,});this.options.storedFormat =this.options.storedFormat ||(this.options.type ==="time"?'HH:mm':'YYYY-MM-DD[T]HH:mmZ');this.options.displayedFormat =this.options.displayedFormat ||(this.options.type ==="time"?'HH:mm':'YYYY-MM-DD HH:mm');if(this._isSupportedMobileDevice() &&this._supportsInputType(this.options.type)) {this.useNativeControls =true;}
 this._updateState();this.$openButton =this.$element.find('button');this.$input =this.$element.find('input').not("[type=hidden]");this.$hiddenInput =this.$element.find('input[type=hidden]');if(this._isTimeEnabled()) {this._renderTime();}
 if (this.useNativeControls) {if (this.options.type ==='date') {this.options.displayedFormat =this.officialDateFormat;} else if (this.options.type ==='time') {this.options.displayedFormat =this.officialTimeFormat;} else {this.options.displayedFormat =this.officialDatetimeFormat;}
 }
 if(!this.useNativeControls) {this._switchInputTypeToText(this.$input);}
 var timeout =null;var $input =this.$input;var $btn =this.$openButton;var $popover =this.$element.find('.popover').first();if (!this.options.disabled) {$('body').on('click',function(){if (this.keepShown ===false) {this._hidePicker();}
 }.bind(this));this.$element.on('click',function(event){if (!this.pickerShown) this._openPicker();this.keepShown =true;setTimeout(function() {this.keepShown =false;}.bind(this),200);}.bind(this));}
 $input.on("change blur",function() {if (this.options.disabled) return;var newDate =moment(this.$input.val(),this.options.displayedFormat);this._setDateTime(newDate,true);}.bind(this));function normalizeDate(date) {if (!date) return null;return moment([date.year(),date.month(),date.date()]);}
 this.$element.find(".calendar").on("swipe",function(event) {var d =event.direction;if (d ==="left") {this.displayDateTime =normalizeDate(moment([this.displayDateTime.year(),this.displayDateTime.month() + 1,1]));this._renderCalendar("left");} else if (d ==="right") {this.displayDateTime =normalizeDate(moment([this.displayDateTime.year(),this.displayDateTime.month() - 1,1]));this._renderCalendar("right");} }.bind(this));this.$element.on("mousedown",".next-month",function(event) {event.preventDefault();if (!this.displayDateTime) return;this.displayDateTime =normalizeDate(moment([this.displayDateTime.year(),this.displayDateTime.month() + 1,1]));this._renderCalendar("left");}.bind(this));this.$element.on("mousedown",".prev-month",function(event) {event.preventDefault();if (!this.displayDateTime) return;this.displayDateTime =normalizeDate(moment([this.displayDateTime.year(),this.displayDateTime.month() - 1,1]));this._renderCalendar("right");}.bind(this));if(this._isTimeEnabled()) {var dropdownChanged =function () {var h =this._getHoursFromDropdown();var m =this._getMinutesFromDropdown();if (!this.options.selectedDateTime) this.options.selectedDateTime =moment();var date =this.options.selectedDateTime.hours(h).minutes(m);this._setDateTime(date);};this.$element.on("dropdown-list:select",".hour,.minute",dropdownChanged.bind(this));this.$element.on("change",".hour,.minute",dropdownChanged.bind(this));}
 if (this.useNativeControls) {this.displayDateTime =this.options.selectedDateTime =moment(this.$input.val(),this.options.displayedFormat);}
 if (!this.options.selectedDateTime) this._readInputVal([this.options.storedFormat,this.options.displayedFormat]);this._setDateTime(this.options.selectedDateTime);},_readDataFromMarkup:function() {if (this.$element.data("disabled")) {this.options.disabled =true;}
 if (this.$element.hasClass("error")) {this.options.hasError =true;}
 if (this.$element.data('required')) {this.options.required =true;}
 var $input =$(this.$element.find("input").filter("[type^=date],[type=time]"));if ($input.length !==0) {this.options.type =$input.attr("type");}
 var el =this.$element;if (el.data('displayed-format') !==undefined) {this.options.displayedFormat =el.data('displayed-format');}
 if (el.data('stored-format') !==undefined) {this.options.storedFormat =el.data('stored-format');}
 if (el.data('force-html-mode') !==undefined) {this.options.forceHTMLMode =el.data('force-html-mode');}
 if (el.data('day-names') !==undefined) {this.options.dayNames =el.data('day-names') ||this.options.dayNames;}
 if (el.data('month-names') !==undefined) {this.options.monthNames =el.data('month-names') ||this.options.monthNames;}
 if (el.data('head-format') !==undefined) {this.options.headFormat =el.data('head-format') ||this.options.headFormat;}
 if (el.data('start-day') !==undefined) {this.options.startDay =el.data('start-day') * 1;} },_readInputVal:function(format) {if (!format) format =this.options.displayedFormat;var value =this.$input.eq(0).val();var date =moment(value,format);if (!date ||!date.isValid()) date =moment(value);this.displayDateTime =this.options.selectedDateTime =date;},_updateState:function() {if (this.options.disabled) {this.$element.find("input,button").attr("disabled","disabled");this._hidePicker();} else {this.$element.find("input,button").removeAttr("disabled");}
 if (this.options.hasError ||(!this.options.selectedDateTime &&this.options.required) ||(this.options.selectedDateTime &&!this.options.selectedDateTime.isValid())) {this.$element.addClass("error");} else {this.$element.removeClass("error");}
 },_switchInputTypeToText:function($input) {var convertedInput =$input.detach().attr('type','text');this.$element.prepend(convertedInput);},_openNativeInput:function() {this.$input.trigger("tap");},_keyPress:function() {if (!this.pickerShown) return;},_openPicker:function() {this.$element.addClass("focus");if(!this.useNativeControls) {this._readInputVal();this._showPicker();} else {this._openNativeInput();}
 },_showPicker:function() {if(this._isDateEnabled()) this._renderCalendar();var left =this.$openButton.position().left + this.$openButton.width() / 2 - (this.$element.find(".popover").width() / 2);var top =this.$openButton.position().top + this.$openButton.outerHeight() + 16;this.$element.find(".popover").css({"position":"absolute","left":left + "px","top":top + "px"}).show();this.pickerShown =true;},_hidePicker:function() {this.$element.removeClass("focus");this.$element.find(".popover").hide();this.pickerShown =false;},_adjustMarkup:function() {this.$element.addClass("datepicker");if (!this.useNativeControls) {if (this.$element.find("input").not("[type=hidden]").length ===0) {this.$element.append("<input type=\"text\">");}
 if (this.$element.find("button").length ===0) {this.$element.append("<button class=\"icon-calendar small\"><span>Datepicker</span></button>");}
 if (this.$element.find(".popover").length ===0) {this.$element.append('<div class="popover arrow-top" style="display:none"><div class="inner"></div></div>');if(this._isDateEnabled()) this.$element.find(".inner").append('<div class="calendar"><div class="calendar-header"></div><div class="calendar-body"></div></div>');}
 } else {}
 if (this.$element.find("input[type=hidden]").length ===0) {this.$element.append("<input type=\"hidden\">");}
 if (!this.$element.find("input[type=hidden]").attr("name")) {var name =this.$element.find("input").not("[type=hidden]").attr("name");this.$element.find("input[type=hidden]").attr("name",name);this.$element.find("input").not("[type=hidden]").removeAttr("name");}
 var $button =this.$element.find('>button');if ($button.attr('type') ===undefined) {$button[0].setAttribute('type','button');}
 },_renderCalendar:function(slide) {if (!this.displayDateTime ||!this.displayDateTime.isValid()) this.displayDateTime =moment();var displayDateTime =this.displayDateTime;var displayYear =displayDateTime.year();var displayMonth =displayDateTime.month() + 1;var table =this._renderOneCalendar(displayMonth,displayYear);var $calendar =this.$element.find(".calendar");table.on("mousedown","a",function(event) {event.preventDefault();var date =moment($(event.target).data("date"),this.internFormat);if(this._isTimeEnabled()) {var h =this._getHoursFromDropdown();var m =this._getMinutesFromDropdown();date.hours(h).minutes(m);}
 this._setDateTime(date);this._hidePicker();}.bind(this));if ($calendar.find("table").length > 0 &&slide) {this._slideCalendar(table,(slide ==="left"));} else {$calendar.find("table").remove();$calendar.find(".sliding-container").remove();$calendar.find(".calendar-body").append(table);}
 this._updateState();},_getHoursFromDropdown:function() {return parseInt(this.$element.find('.time .hour select').val(),10);},_getMinutesFromDropdown:function() {return parseInt(this.$element.find('.time .minute select').val(),10);},_renderOneCalendar:function(month,year) {var heading =moment([year,month - 1,1]).lang(this.language).format(this.options.headFormat);var title =$('<div class="calendar-header"><h2>'+ heading + '</h2></div>');var nextMonthElement =$("<button class=\"next-month\">›</button>");var prevMonthElement =$("<button class=\"prev-month\">‹</button>");title.append(nextMonthElement).append(prevMonthElement);var $calendar =this.$element.find(".calendar");if ($calendar.find(".calendar-header").length > 0) {$calendar.find(".calendar-header").replaceWith(title);} else {$calendar.prepend(title);}
 var day =null;var table =$("<table>");table.data("date",year + "/"+ month);var html ="<tr>";for(var i =0;i < 7;i++) {day =(i + this.options.startDay) % 7;var dayName =this.options.dayNames[day];html +="<th><span>"+ dayName + "</span></th>";}
 html +="</tr>";table.append("<thead>"+ html + "</thead>");var firstDate =moment([year,month - 1,1]);var monthStartsAt =(firstDate.day() - this.options.startDay) % 7;if (monthStartsAt < 0) monthStartsAt +=7;html ="";var today =moment();function isSameDay(d1,d2) {if (!d1) return;if (!d2) return;return d1.year() ===d2.year() &&d1.month() ===d2.month() &&d1.date() ===d2.date();}
 for(var w =0;w < 6;w++) {html +="<tr>";for(var d =0;d < 7;d++) {day =(w * 7 + d) - monthStartsAt + 1;var displayDateTime =moment([year,month - 1,day]);var isCurrentMonth =(displayDateTime.month() + 1) ===parseFloat(month);var cssClass ="";if (isSameDay(displayDateTime,today)) cssClass +=" today";if (isSameDay(displayDateTime,this.options.selectedDateTime)) cssClass +=" selected";if (isCurrentMonth) {html +="<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.lang(this.language).format(this.internFormat) + "\">"+ displayDateTime.date() + "</a></td>";} else {html +="<td class=\"" + cssClass + "\"><span>"+ displayDateTime.date() + "</span></td>";}
 }
 html +="</tr>";}
 table.append("<tbody>"+ html + "</tbody>");return table;},_slideCalendar:function(newtable,isLeft) {this.$element.find(".sliding-container table").stop(true,true);this.$element.find(".sliding-container").remove();var oldtable =this.$element.find("table");var width =oldtable.width();var height =oldtable.height();var container =$("<div class=\"sliding-container\">");container.css({"display":"block","position":"relative","width":width + "px","height":height + "px","overflow":"hidden"});this.$element.find(".calendar-body").append(container);container.append(oldtable).append(newtable);oldtable.css({"position":"absolute","left":0,"top":0});oldtable.after(newtable);newtable.css({"position":"absolute","left":(isLeft) ?width :-width,"top":0});var speed =400;oldtable.animate({"left":(isLeft) ?-width :width},speed,function() {oldtable.remove();});newtable.animate({"left":0},speed,function() {if (container.parents().length ===0) return;newtable.css({"position":"relative","left":0,"top":0});newtable.detach();this.$element.find(".calendar-body").append(newtable);container.remove();}.bind(this));},_setDateTime:function(date,silent) {this.options.selectedDateTime =this.displayDateTime =date;if (!date) {this.$input.val("");} else if (date.isValid()) {this.$input.val(date.lang(this.language).format(this.options.displayedFormat));}
 var storage =(date &&date.isValid()) ?date.lang('en').format(this.options.storedFormat) :"";this.$hiddenInput.val(storage);this._updateState();if(this._isDateEnabled()) this._renderCalendar();if(this._isTimeEnabled()) this._renderTime();if (!silent)
 this.$input.trigger('change');this.$hiddenInput.trigger('change');},_getTimeFromInput:function() {if(this._isTimeEnabled()) {var h =parseInt(this.$element.find('.time .hour button').text(),10);var m =parseInt(this.$element.find('.time .minute button').text(),10);var time =[h,m];return time;}
 },_getTimeString:function(hour,minute) {return this._pad(hour) + ":"+ this._pad(minute) + ":"+ this._pad(this.options.selectedDateTime.seconds());},_combineDateTimeStrings:function(dateString,timeString) {return dateString + " "+ timeString;},_renderTime:function() {var html =$("<div class='time'><i class='icon-clock small'></i></div>");var hourSelect =$('<select></select>');for(var h =0;h < 24;h++) {var hourOption =$('<option>'+ this._pad(h) + '</option>');if(this.options.selectedDateTime &&h ===this.options.selectedDateTime.hours()) {hourOption.attr('selected','selected');}
 hourSelect.append(hourOption);}
 var hourDropdown =$('<div class="dropdown hour"><button></button></input>').append(hourSelect);var minuteSelect =$('<select></select>');for(var m =0;m < 60;m++) {var minuteOption =$('<option>'+ this._pad(m) + '</option>');if(this.options.selectedDateTime &&m ===this.options.selectedDateTime.minutes()) {minuteOption.attr('selected','selected');}
 minuteSelect.append(minuteOption);}
 var minuteDropdown =$('<div class="dropdown minute"><button>Single Select</button></div>').append(minuteSelect);$(hourDropdown).css({'position':'relative'});$(minuteDropdown).css({'position':'relative'});$(hourDropdown).find('select').css({'position':'absolute','left':'1.5rem','top':'1rem'});$(minuteDropdown).find('select').css({'position':'absolute','left':'1.5rem','top':'1rem'});html.append(hourDropdown,$("<span>:</span>"),minuteDropdown);if (this.$element.find(".time").length ===0) {this.$element.find(".inner").append(html);} else {this.$element.find(".time").empty().append(html.children());}
 $(hourDropdown).dropdown();$(minuteDropdown).dropdown();},_isSupportedMobileDevice:function() {if((navigator.userAgent.match(/Android/i) ||
 navigator.userAgent.match(/iPhone|iPad|iPod/i)) &&
 !this.options.forceHTMLMode) {return true;}
 return false;},_supportsInputType:function(type) {var i =document.createElement("input");i.setAttribute("type",type);return i.type !=="text";},_isDateEnabled:function() {return (this.options.type ==="date") ||(this.options.type ==="datetime") ||(this.options.type ==="datetime-local");},_isTimeEnabled:function() {return (this.options.type ==="time") ||(this.options.type ==="datetime") ||(this.options.type ==="datetime-local");},_pad:function(s) {if (s < 10) return "0"+ s;return s;}
 });CUI.Datepicker.monthNames =["January","February","March","April","May","June","July","August","September","October","November","December"];CUI.Datepicker.dayNames =["Su","Mo","Tu","We","Th","Fr","Sa"];CUI.util.plugClass(CUI.Datepicker);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=datepicker]",e.target).datepicker();});}
}(window.jQuery));(function($) {CUI.Pulldown =new Class({toString:'Pulldown',extend:CUI.Widget,defaults:{pulldownSize:0
 },timeout:null,popoverShown:false,construct:function(options) {this._readDataFromMarkup();var $link =this.$element.find('a').first();var $popover =this.$element.find('.popover').first();$link.on("click",function(event) {event.preventDefault();this.togglePopover();this._keepFocus();}.bind(this));$popover.on("click",function() {this._keepFocus();}.bind(this));$link.on("blur",function() {this.timeout =setTimeout(function() {this.timeout =null;this.hidePopover();}.bind(this),200);}.bind(this));$popover.fipo("tap","click","ul > li > a",function() {var self =this;setTimeout(function() {self.hidePopover();},500);}.bind(this));},_readDataFromMarkup:function () {if (this.$element.data("pulldownSize")) {this.options.pulldownSize =this.$element.data('pulldownSize') * 1;}
 },_keepFocus:function() {var $link =this.$element.find('a').first();if (!$link.is(".disabled, [disabled]")) {clearTimeout(this.timeout);this.timeout =null;$link.focus();}
 },togglePopover:function() {if (this.popoverShown) {this.hidePopover();} else if (!this.$element.find('a').first().is(".disabled, [disabled]")) {this.showPopover();}
 },showPopover:function() {this._placePopover();this.$element.find('.popover').show();this.popoverShown =true;},hidePopover:function() {this.$element.find('.popover').hide();this.popoverShown =false;},setDisabled:function(disabled) {if (disabled ===true) {this.$element.find('a').first().addClass('disabled');this.hidePopover();} else
 this.$element.find('a').first().removeClass('disabled');},_placePopover:function() {var $link =this.$element.find('a').first(),$popover =this.$element.find('.popover'),position =$link.position(),top,left,marginLeft;var w =Math.max($link.width() + 22,$popover.width());var size ={width:w,height:$link.height()
 };if ($popover.hasClass('alignleft')) {top =position.top + size.height;left =- 30;marginLeft =30 - w;} else {top =position.top + size.height + 15;left =position.left + $link.width() - size.width + 5;marginLeft =size.width - 30;}
 $popover.css({top:top,left:left,width:size.width
 });var $list =$popover.find("ul").first();if (this.options.pulldownSize > 0) {var sum =0;$list.find('li:lt('+ this.options.pulldownSize + ')').each(function() {sum +=$(this).outerHeight() + $(this).find("a").first().outerHeight();});$list.css("max-height",sum);}
 }
 });CUI.util.plugClass(CUI.Pulldown);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=pulldown]",e.target).pulldown();});}
}(window.jQuery));(function($) {CUI.Sticky =new Class({toString:'Sticky',extend:CUI.Widget,construct:function(options) {this.$element.addClass("sticky");this.wrapper =$("<div>").addClass("sticky-wrapper");this.$element.wrapAll(this.wrapper);this.wrapper =this.$element.parent();this.wrapper.height(this.$element.outerHeight(true));this.scrollingElement =this.$element.parents(".sticky-container");if (this.scrollingElement.length ===0) {this.scrollingElement =$(document);this.pageScroll =true;}
 this.scrollingElement.on("scroll",this._fixElementPosition.bind(this));$(window).on("resize",this._fixElementPosition.bind(this));},_fixElementPosition:function() {var pos =this.wrapper.offset().top;var scroll =(this.pageScroll) ?this.scrollingElement.scrollTop() :this.scrollingElement.offset().top;var startAt =this._getStickPosition();var left =this.wrapper.position().left;var w =this.wrapper.width();if ((pos - startAt) < scroll) {if (!this.pageScroll) {var containerPosition =this.scrollingElement.position();startAt +=containerPosition.top;left +=containerPosition.left;this.$element.detach();this.scrollingElement.after(this.$element);}
 this.$element.css({"position":(this.pageScroll) ?"fixed":"absolute","top":startAt+"px","left":left,"width":w+"px"});} else {if (!this.pageScroll) {this.$element.detach();this.wrapper.append(this.$element);}
 this.$element.css({"position":"","top":"","left":"","width":w+"px"});}
 },_getStickPosition:function() {var etop =this.wrapper.offset().top;var startAt =0;this.scrollingElement.find(".sticky-wrapper").each(function(index,element) {if ($(element).offset().top < etop) startAt +=$(element).outerHeight(true);}.bind(this));return startAt;},scrollingElement:null,pageScroll:false,wrapper:null
 });CUI.util.plugClass(CUI.Sticky);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$(".sticky,[data-init=sticky]",e.target).sticky();});}
}(window.jQuery));(function($) {var DISPLAY_GRID ="grid";var DISPLAY_LIST ="list";var SELECTION_MODE_COUNT_SINGLE ="single";var SELECTION_MODE_COUNT_MULTI ="multiple";var DEFAULT_SELECTOR_CONFIG ={"itemSelector":"article","headerSelector":"header","dataContainer":"grid-0","enableImageMultiply":true,"view":{"selectedItem":{"list":{"cls":"selected"},"grid":{"cls":"selected"}
 },"selectedItems":{"list":{"selector":"article.selected"},"grid":{"selector":"article.selected"}
 }
 },"controller":{"selectElement":{"list":"article > i.select","grid":"article"},"moveHandleElement":{"list":"article > i.move"},"targetToItem":{"list":function($target) {return $target.closest("article");},"grid":function($target) {return $target.closest("article");},"header":function($target) {return $target.closest("header");}
 },"gridSelect":{"cls":"selection-mode"},"selectAll":{"selector":"header > i.select","cls":"selected"},"sort":{"columnSelector":".label > *"}
 }
 };var ensureItem =function(item) {if (item.jquery) {return item.data("cardView-item");}
 return item;};var Utils ={equals:function($1,$2) {return ($1.length ===$2.length) &&($1.length ===$1.filter($2).length);},getWidget:function($el) {var widget;if ($el.length > 0) {widget =$($el[0]).data("cardView");}
 return widget;},mixObjects:function(object1,object2) {if (object1 ===undefined) return object2;var result ={};for(var i in object2) {if (object1[i] ===undefined) {result[i] =object2[i];continue;}
 var p =object1[i];if (typeof(object1[i]) =="object"&&(!(object1[i] instanceof String))) {p =this.mixObjects(object1[i],object2[i]);}
 result[i] =p;}
 return result;},resolve:function($el,fn) {var resolved =[];$el.each(function() {resolved.push.apply(resolved,fn($(this)).toArray());});return $(resolved);},multiplyImages:function($images,color) {$images =$images.filter(function () {var $image =$(this);return !$image.is(".multiplied") &&!$image.prev().is(".multiplied") &&$image.is(":visible");});var imageMaxCounter =$images.length;var imageIteratorCounter =0;function multiplyNextImage() {if (imageIteratorCounter < imageMaxCounter) {multiplyOneImage($images[imageIteratorCounter]);imageIteratorCounter++;setTimeout(multiplyNextImage,0);}
 }
 function multiplyOneImage(image) {var width =image.naturalWidth,height =image.naturalHeight;if ((width ===0) &&(height ===0)) {window.setTimeout(function() {multiplyOneImage(image);},200);return;}
 var canvas =$("<canvas width='"+ width + "' height='"+ height+"'></canvas>")[0];var context =canvas.getContext("2d");context.drawImage(image,0,0,width,height);var imageData =context.getImageData(0,0,width,height);var data =imageData.data;for (var i =0,l =data.length;i < l;i +=4) {data[i] *=color[0];data[i+1] *=color[1];data[i+2] *=color[2];}
 context.putImageData(imageData,0,0);$("<img class='"+ image.className + " multiplied' "+
 "width='"+ width + "' height='"+ height + "' "+
 "src='"+ canvas.toDataURL("image/png") + "'/>").insertBefore(image);}
 multiplyNextImage();}
 };var ListItemAutoScroller =new Class({$el:null,$containerEl:null,stepSize:0,iid:undefined,autoMoveOffset:0,maxScrollTop:0,construct:function($el,stepSize,autoMoveFn) {this.$el =$el;this.stepSize =stepSize;this.$containerEl =this._getScrollingContainer($el);var cont =this.$containerEl[0];this.maxScrollTop =Math.max(cont.scrollHeight - cont.clientHeight,0);this.autoMoveFn =autoMoveFn;},_getScrollingContainer:function($el) {while (($el.length > 0) &&!$el.is("body")) {var ovflY =$el.css("overflowY");var pos =$el.css("position");if (((ovflY ==="auto") ||(ovflY ==="visible")) &&(pos ==="absolute")) {return $el;}
 $el =$el.parent();}
 return $(window);},_execute:function() {var cont =this.$containerEl[0];var clientHeight =cont.clientHeight;var scrollTop =cont.scrollTop;var itemTop =this.$el.offset().top - this.$containerEl.offset().top;var itemBottom =itemTop + this.$el.height();var isAutoScroll =false;if (itemTop <=0) {if (scrollTop > 0) {scrollTop -=this.stepSize;this.autoMoveOffset =-this.stepSize;if (scrollTop < 0) {scrollTop =0;}
 cont.scrollTop =scrollTop;isAutoScroll =true;}
 } else if (itemBottom >=clientHeight) {if (scrollTop < this.maxScrollTop) {scrollTop +=this.stepSize;this.autoMoveOffset =this.stepSize;if (scrollTop > this.maxScrollTop) {scrollTop =this.maxScrollTop;}
 cont.scrollTop =scrollTop;isAutoScroll =true;}
 }
 return isAutoScroll;},_autoMove:function() {if (this.autoMoveOffset &&this.autoMoveFn) {var itemOffs =this.$el.offset();var itemTop =itemOffs.top + this.autoMoveOffset;this.autoMoveFn(itemOffs.left,itemTop);}
 },check:function() {var self =this;this.stop();var isAutoScroll =this._execute();if (isAutoScroll) {this.iid =window.setTimeout(function() {self.iid =undefined;self._autoMove();},50);}
 },stop:function() {if (this.iid !==undefined) {window.clearTimeout(this.iid);this.autoMoveOffset =0;this.iid =undefined;}
 }
 });var ListItemMoveHandler =new Class({$listEl:null,$itemEl:null,$items:null,$doc:null,$oldBefore:null,dragCls:null,fixHorizontalPosition:false,autoScroller:null,construct:function(config) {var self =this;this.$listEl =config.$listEl;this.$itemEl =config.$itemEl;this.$items =config.$items;this.dragCls =config.dragCls;this.fixHorizontalPosition =(config.fixHorizontalPosition !==false);this.autoScroller =(config.autoScrolling ?new ListItemAutoScroller(this.$itemEl,8,function(x,y) {self._autoMove(x,y);}) :undefined);},_getEventCoords:function(e) {if (!e.originalEvent.touches) {return {x:e.pageX,y:e.pageY
 };}
 return (e.originalEvent.touches.length > 0 ?{x:e.originalEvent.touches[0].pageX,y:e.originalEvent.touches[0].pageY
 } :e.originalEvent.changedTouches.length > 0 ?{x:e.originalEvent.changedTouches[0].pageX,y:e.originalEvent.changedTouches[0].pageY
 } :{x:e.pageX,y:e.pageY
 });},_limit:function(top,left) {if (left < this.listOffset.left) {left =this.listOffset.left;}
 if (top < this.listOffset.top) {top =this.listOffset.top;}
 var right =left + this.size.width;var bottom =top + this.size.height;var limitRight =this.listOffset.left + this.listSize.width;var limitBottom =this.listOffset - top + this.listSize.height;if (right > limitRight) {left =limitRight - this.size.width;}
 if (bottom > limitBottom) {top =limitBottom - this.size.height;}
 if (this.fixHorizontalPosition) {left =this.listOffset.left;}
 return {"top":top,"left":left
 };},_getEventPos:function(e) {var evtPos =this._getEventCoords(e);return {x:evtPos.x - this.delta.left,y:evtPos.y - this.delta.top
 };},_adjustPosition:function(x,y) {this.$itemEl.offset(this._limit(y,x));if (this.autoScroller) {this.autoScroller.check();}
 },_changeOrderIfRequired:function() {var itemPos =this.$itemEl.offset();var hotX =itemPos.left + (this.size.width / 2);var hotY =itemPos.top + (this.size.height / 2);var $newTarget =null;var isInsertBefore =false;for (var i =0;i < this.$items.length;i++) {var $item =$(this.$items[i]);if (!Utils.equals($item,this.$itemEl)) {var offs =$item.offset();var width =$item.width();var height =$item.height();var bottom =offs.top + height;if ((hotX >=offs.left) &&(hotX < offs.left + width) &&(hotY >=offs.top) &&(hotY < bottom)) {isInsertBefore =((hotY - offs.top) > (bottom - hotY));$newTarget =$item;break;}
 }
 }
 if ($newTarget) {var _offs =this.$itemEl.offset();if (isInsertBefore) {$newTarget.before(this.$itemEl);} else {$newTarget.after(this.$itemEl);}
 this.$itemEl.offset(_offs);}
 },_autoMove:function(x,y) {this._adjustPosition(x,y);this._changeOrderIfRequired();},start:function(e) {this.$oldPrev =this.$itemEl.prev();this.$oldNext =this.$itemEl.next();var evtPos =this._getEventCoords(e);if (this.dragCls) {this.$itemEl.addClass(this.dragCls);}
 var self =this;this.$doc =$(document);this.$doc.fipo("touchmove.listview.drag","mousemove.listview.drag",function(e) {self.move(e);});this.$doc.fipo("touchend.listview.drag","mouseup.listview.drag",function(e) {self.end(e);});this.offset =this.$itemEl.offset();this.delta ={"left":evtPos.x - this.offset.left,"top":evtPos.y - this.offset.top
 };this.size ={"width":this.$itemEl.width(),"height":this.$itemEl.height()
 };this.listOffset =this.$listEl.offset();this.listSize ={"width":this.$listEl.width(),"height":this.$listEl.height()
 };e.stopPropagation();e.preventDefault();},move:function(e) {var pos =this._getEventPos(e);this._adjustPosition(pos.x,pos.y);this._changeOrderIfRequired();e.stopPropagation();e.preventDefault();},end:function(e) {var pos =this._getEventPos(e);this._adjustPosition(pos.x,pos.y);if (this.dragCls) {this.$itemEl.removeClass(this.dragCls);}
 if (this.autoScroller) {this.autoScroller.stop();}
 this.$itemEl.css("position","");this.$itemEl.css("top","");this.$itemEl.css("left","");this.$doc.off("touchmove.listview.drag");this.$doc.off("mousemove.listview.drag");this.$doc.off("touchend.listview.drag");this.$doc.off("mouseup.listview.drag");var $newPrev =this.$itemEl.prev();var $newNext =this.$itemEl.next();this.$itemEl.trigger($.Event("item-moved",{newPrev:$newPrev,newNext:$newNext,oldPrev:this.$oldPrev,oldNext:this.$oldNext,hasMoved:!Utils.equals($newPrev,this.$oldPrev)
 }));e.stopPropagation();e.preventDefault();}
 });var Item =new Class({$itemEl:null,construct:function($itemEl) {this.$itemEl =$itemEl;this.reference();},getItemEl:function() {return this.$itemEl;},reference:function() {this.$itemEl.data("cardView-item",this);}
 });var Header =new Class({$headerEl:null,itemRef:null,construct:function($headerEl,itemRef) {this.$headerEl =$headerEl;this.itemRef =itemRef;},getHeaderEl:function() {return this.$headerEl;},getItemRef:function() {return this.itemRef;},setItemRef:function(itemRef) {this.itemRef =itemRef;}
 });var ColumnSortHandler =new Class({construct:function(options) {this.model =options.model;this.comparators =options.comparators;this.selectors =options.selectors;this.columnElement =options.columnElement;this.headerElement =options.columnElement.closest(this.selectors.headerSelector);var header =this.model.getHeaderForEl(this.headerElement);this.items =this.model.getItemsForHeader(header);this.isReverse =this.columnElement.hasClass("sort-asc");this.toNatural =this.columnElement.hasClass("sort-desc");this.fromNatural =!this.headerElement.hasClass("sort-mode");this.comparator =null;if (this.comparators) {for(var selector in this.comparators) {if (!this.columnElement.is(selector)) continue;this.comparator =this.comparators[selector];}
 }
 if (!this.comparator) this.comparator =this._readComparatorFromMarkup();},_readComparatorFromMarkup:function() {var selector =this.columnElement.data("sort-selector");var attribute =this.columnElement.data("sort-attribute");var sortType =this.columnElement.data("sort-type");if (!selector &&!attribute) return null;return new CUI.CardView.DefaultComparator(selector,attribute,sortType);},_adjustMarkup:function() {if (this.fromNatural) this.headerElement.addClass("sort-mode");if (this.toNatural) this.headerElement.removeClass("sort-mode");this.headerElement.find(this.selectors.controller.sort.columnSelector).removeClass("sort-asc sort-desc");this.columnElement.removeClass("sort-desc sort-asc");if (!this.toNatural) this.columnElement.addClass(this.isReverse ?"sort-desc":"sort-asc");var showMoveHandle =this.toNatural;$.each(this.items,function() {this.getItemEl().find(".move").toggle(showMoveHandle);});},sort:function() {if (!this.comparator &&!this.toNatural) return;this._adjustMarkup();var items =this.items.slice();if (this.comparator) {this.comparator.setReverse(this.isReverse);var fn =this.comparator.getCompareFn();if (!this.toNatural) items.sort(fn);}
 var prevItem =this.headerElement;$.each(this.items,function() {this.getItemEl().detach();});for(var i =0;i < items.length;i++) {var item =items[i].getItemEl();prevItem.after(item);prevItem =item;}
 }
 });var DirectMarkupModel =new Class({$el:null,items:null,headers:null,selectors:null,construct:function($el,selectors) {this.$el =$el;this.items =[];this.selectors =selectors;var $items =this.$el.find(selectors.itemSelector);var itemCnt =$items.length;for (var i =0;i < itemCnt;i++) {this.items.push(new Item($($items[i])));}
 this.headers =[];var $headers =this.$el.find(selectors.headerSelector);var headerCnt =$headers.length;for (var h =0;h < headerCnt;h++) {var $header =$($headers[h]);var $itemRef =$header.nextAll(selectors.itemSelector);var itemRef =($itemRef.length > 0 ?this.getItemForEl($($itemRef[0])) :undefined);this.headers.push(new Header($header,itemRef));}
 },initialize:function() {var self =this;this.$el.on("drop",this.selectors.itemSelector,function(e) {if (e.hasMoved) {self._reorder(e);}
 });},_reorder:function(e) {var itemToMove =this.getItemForEl($(e.target));var newBefore =this.getItemForEl(e.newBefore);var isHeaderInsert =false;var header;if (!newBefore) {header =this.getHeaderForEl(e.newBefore);if (header) {isHeaderInsert =true;var refPos =this.getItemIndex(header.getItemRef());if (refPos > 0) {newBefore =this.getItemAt(refPos - 1);}
 }
 }
 var oldPos =this.getItemIndex(itemToMove);this.items.splice(oldPos,1);var headerRef =this._getHeaderByItemRef(itemToMove);if (headerRef) {headerRef.setItemRef(this.getItemAt(oldPos));}
 var insertPos =(newBefore ?this.getItemIndex(newBefore) + 1 :0);this.items.splice(insertPos,0,itemToMove);if (isHeaderInsert) {header.setItemRef(itemToMove);}
 },getItemCount:function() {return this.items.length;},getItemAt:function(pos) {return this.items[pos];},getItemIndex:function(item) {for (var i =0;i < this.items.length;i++) {if (item ===this.items[i]) {return i;}
 }
 return -1;},getItemForEl:function($el) {var itemCnt =this.items.length;for (var i =0;i < itemCnt;i++) {var item =this.items[i];if (Utils.equals(item.getItemEl(),$el)) {return item;}
 }
 return undefined;},insertItemAt:function($items,pos,beforeHeader) {if (!$.isArray($items)) {$items =$items.toArray();}
 for (var i =$items.length - 1;i >=0;i--) {var $item =$items[i];if (!$item.jquery) {$item =$($item);}
 var followupItem;var item =new Item($item);if ((pos ===undefined) ||(pos ===null)) {this.items.push(item);pos =this.items.length - 1;} else {followupItem =this.items[pos];this.items.splice(pos,0,item);}
 var insert ={"item":followupItem,"mode":"item"};var headerCnt =this.headers.length;for (var h =0;h < headerCnt;h++) {var header =this.headers[h];if (header.getItemRef() ===followupItem) {if (beforeHeader) {insert ={"item":header,"mode":"header"};break;} else {header.setItemRef(item);}
 }
 }
 this.$el.trigger($.Event("change:insertitem",{"insertPoint":insert,"followupItem":followupItem,"item":item,"pos":pos,"widget":Utils.getWidget(this.$el),"moreItems":(i > 0)
 }));}
 },getHeaderCount:function() {return this.headers.length;},getHeaderAt:function(pos) {return this.headers[pos];},getHeaders:function() {var headers =[];headers.push.apply(headers,this.headers);return headers;},getHeaderForEl:function($el) {var headerCnt =this.headers.length;for (var h =0;h < headerCnt;h++) {var header =this.headers[h];if (Utils.equals(header.getHeaderEl(),$el)) {return header;}
 }
 return undefined;},_getHeaderByItemRef:function(itemRef) {for (var h =0;h < this.headers.length;h++) {if (this.headers[h].getItemRef() ===itemRef) {return this.headers[h];}
 }
 return undefined;},getItemsForHeader:function(header) {var itemRef =header.getItemRef();var headerCnt =this.headers.length;var itemCnt =this.items.length;var itemsForHeader =[];var isInRange =false;for (var i =0;i < itemCnt;i++) {var item =this.items[i];if (isInRange) {for (var h =0;h < headerCnt;h++) {if (this.headers[h].getItemRef() ===item) {isInRange =false;break;}
 }
 if (isInRange) {itemsForHeader.push(item);} else {break;}
 } else {if (item ===itemRef) {isInRange =true;itemsForHeader.push(itemRef);}
 }
 }
 return itemsForHeader;},fromItemElements:function($elements) {var items =[];$elements.each(function() {var item =$(this).data("cardView-item");if (item) {items.push(item);}
 });return items;},reference:function() {var itemCnt =this.items.length;for (var i =0;i < itemCnt;i++) {this.items[i].reference();}
 },removeAllItemsSilently:function() {this.items.length =0;for (var h =0;h < this.headers.length;h++) {this.headers[h].setItemRef(undefined);}
 }
 });var DirectMarkupView =new Class({$el:null,selectors:null,construct:function($el,selectors) {this.$el =$el;this.selectors =selectors;},initialize:function() {var self =this;this.$el.on("change:displayMode",function(e) {var oldMode =e.oldValue;var newMode =e.value;self.cleanupAfterDisplayMode(oldMode);self.prepareDisplayMode(newMode);});this.$el.on("change:insertitem",function(e) {self._onItemInserted(e);});this.$el.reflow({"small":function ($el,size) {return $el.width() > 40*size.rem() &&$el.width() < 50*size.rem();},"xsmall":function ($el,size) {return $el.width() > 30*size.rem() &&$el.width() < 40*size.rem();},"xxsmall":function ($el,size) {return $el.width() < 30*size.rem();}
 });},_onItemInserted:function(e) {var $dataRoot =this.$el;if (this.selectors.dataContainer) {$dataRoot =$dataRoot.find("."+ this.selectors.dataContainer);}
 var $item =e.item.getItemEl();var followupItem =e.followupItem;switch (this.getDisplayMode()) {case DISPLAY_LIST:if (!followupItem) {$dataRoot.append($item);} else {var insert =e.insertPoint;var item =insert.item;var $ref =(insert.mode ==="item"?item.getItemEl() :item.getHeaderEl());$ref.before($item);}
 break;case DISPLAY_GRID:if (!e.moreItems) {var widget =Utils.getWidget(this.$el);widget._restore();widget.layout();}
 break;}
 },getDisplayMode:function() {return Utils.getWidget(this.$el).getDisplayMode();},setSelectionState:function(item,selectionState) {var displayMode =this.getDisplayMode();var selectorDef =this.selectors.view.selectedItem[displayMode];var $itemEl =item.getItemEl();if (selectorDef.selector) {$itemEl =$itemEl.find(selectorDef.selector);}
 if (selectionState ==="selected") {$itemEl.addClass(selectorDef.cls);if (displayMode ===DISPLAY_GRID) {this._drawSelectedGrid(item);}
 } else if (selectionState ==="unselected") {$itemEl.removeClass(selectorDef.cls);}
 },getSelectionState:function(item) {var selectorDef =this.selectors.view.selectedItem[this.getDisplayMode()];var $itemEl =item.getItemEl();if (selectorDef.selector) {$itemEl =$itemEl.find(selectorDef.selector);}
 var cls =selectorDef.cls.split(" ");for (var c =0;c < cls.length;c++) {if (!$itemEl.hasClass(cls[c])) {return "unselected";}
 }
 return "selected";},getSelectedItems:function() {var selectorDef =this.selectors.view.selectedItems[this.getDisplayMode()];var $selectedItems =this.$el.find(selectorDef.selector);if (selectorDef.resolver) {$selectedItems =selectorDef.resolver($selectedItems);}
 return $selectedItems;},restore:function(model,restoreHeaders) {var $container =$("<div class='"+ this.selectors.dataContainer + "'>");this.$el.empty();this.$el.append($container);var itemCnt =model.getItemCount();for (var i =0;i < itemCnt;i++) {$container.append(model.getItemAt(i).getItemEl());}
 if (restoreHeaders) {var headerCnt =model.getHeaderCount();for (var h =0;h < headerCnt;h++) {var header =model.getHeaderAt(h);var $headerEl =header.getHeaderEl();var itemRef =header.getItemRef();if (itemRef) {itemRef.getItemEl().before($headerEl);} else {$container.append($headerEl);}
 }
 }
 },prepareDisplayMode:function(displayMode) {if (displayMode ===DISPLAY_GRID) {this._drawAllSelectedGrid();}
 },cleanupAfterDisplayMode:function(displayMode) {},_drawImage:function($image) {if ($image.length ===0) {return;}
 if (this._colorFloat ===undefined) {var color256 =$image.closest("a").css("background-color");this._colorFloat =$.map(color256.match(/(\d+)/g), function (val) { // RGB values between 0 and 1
 return val/255;});}
 Utils.multiplyImages($image,this._colorFloat);},_drawAllSelectedGrid:function() {if (!this.selectors.enableImageMultiply) {return;}
 var self =this;var selector =this.selectors.view.selectedItems.grid.selector + " img";var $selector =$(selector);this._drawImage($selector);$selector.load(function() {self._drawImage($(this));});},_drawSelectedGrid:function(item) {if (!this.selectors.enableImageMultiply) {return;}
 var self =this;var $img =item.getItemEl().find("img");this._drawImage($img);$img.load(function() {self._drawImage($(this));});},removeAllItemsSilently:function() {this.$el.find(this.selectors.itemSelector).remove();}
 });var DirectMarkupController =new Class({$el:null,selectors:null,comparators:null,selectionModeCount:null,_listSelect:false,construct:function($el,selectors,comparators) {this.$el =$el;this.selectors =selectors;this.comparators =comparators;this.selectionModeCount =SELECTION_MODE_COUNT_MULTI;},initialize:function() {this.setDisplayMode(this.$el.hasClass("list") ?DISPLAY_LIST :DISPLAY_GRID);var self =this;this.$el.fipo("tap.cardview.select","click.cardview.select",this.selectors.controller.selectElement.list,function(e) {var widget =Utils.getWidget(self.$el);if (widget.getDisplayMode() ===DISPLAY_LIST) {var item =ensureItem(self.getItemElFromEvent(e));if (widget.toggleSelection(item)) {e.stopPropagation();e.preventDefault();}
 if (e.type ==="tap") {self._listSelect =true;}
 }
 });this.$el.fipo("tap.cardview.select","click.cardview.select",this.selectors.controller.selectElement.grid,function(e) {var widget =Utils.getWidget(self.$el);if ((widget.getDisplayMode() ===DISPLAY_GRID) &&widget.isGridSelectionMode()) {var item =ensureItem(self.getItemElFromEvent(e));if (widget.toggleSelection(item)) {e.stopPropagation();e.preventDefault();}
 }
 });this.$el.fipo("tap.cardview.selectall","click.cardview.selectall",this.selectors.controller.selectAll.selector,function(e) {var widget =Utils.getWidget(self.$el);if (widget.getDisplayMode() ===DISPLAY_LIST) {var cls =self.selectors.controller.selectAll.cls;var $header =self.selectors.controller.targetToItem.header($(e.target));var header =widget.getModel().getHeaderForEl($header);if ($header.hasClass(cls)) {widget.deselectAll(header);} else {widget.selectAll(header);}
 }
 });this.$el.fipo("tap.cardview.sort","click.cardview.sort",this.selectors.headerSelector + " "+ this.selectors.controller.sort.columnSelector,function(e) {var widget =Utils.getWidget(self.$el);var model =widget.getModel();var event =$.Event("sortstart");$(e.target).trigger(event);if (event.isDefaultPrevented()) return;var sorter =new ColumnSortHandler({model:model,columnElement:$(e.target),comparators:self.comparators,selectors:self.selectors
 });sorter.sort();var event =$.Event("sortend");$(e.target).trigger(event);});this.$el.on("selectstart.cardview",this.selectors.headerSelector + " "+ this.selectors.controller.sort.columnSelector,function(e) {e.preventDefault();});this.$el.finger("click.cardview.select",this.selectors.controller.selectElement.grid,function(e) {var widget =Utils.getWidget(self.$el);var dispMode =widget.getDisplayMode();if ((dispMode ===DISPLAY_GRID) &&widget.isGridSelectionMode()) {e.stopPropagation();e.preventDefault();}
 });var listNavElement =this.selectors.controller.selectElement.listNavElement ||this.selectors.controller.selectElement.grid;this.$el.finger("click.cardview.select",listNavElement,function(e) {var widget =Utils.getWidget(self.$el);var dispMode =widget.getDisplayMode();if ((dispMode ===DISPLAY_LIST) &&self._listSelect) {e.stopPropagation();e.preventDefault();}
 self._listSelect =false;});this.$el.fipo("touchstart.cardview.reorder","mousedown.cardview.reorder",this.selectors.controller.moveHandleElement.list,function(e) {var $itemEl =self.getItemElFromEvent(e);var handler =new ListItemMoveHandler({$listEl:self.$el,$itemEl:$itemEl,$items:$(self.selectors.itemSelector),dragCls:"dragging",autoScrolling:true
 });handler.start(e);});this.$el.on("change:selection",function(e) {if (e.moreSelectionChanges) {return;}
 self._adjustSelectAllState(e.widget);});this.$el.on("change:insertitem",function(e) {if (e.moreItems) {return;}
 self._adjustSelectAllState(e.widget);});},_adjustSelectAllState:function(widget) {var cls =this.selectors.controller.selectAll.cls;var selectionState =widget.getHeaderSelectionState();var headers =selectionState.headers;var headerCnt =headers.length;for (var h =0;h < headerCnt;h++) {var header =headers[h];var $header =header.header.getHeaderEl();if (header.hasUnselected) {$header.removeClass(cls);} else {$header.addClass(cls);}
 }
 },getItemElFromEvent:function(e) {var $target =$(e.target);var resolver =this.selectors.controller.targetToItem[this.getDisplayMode()];if ($.isFunction(resolver)) {return resolver($target);}
 return $target.find(resolver);},isGridSelect:function() {var selectorDef =this.selectors.controller.gridSelect;var $el =this.$el;if (selectorDef.selector) {$el =$el.find(selectorDef.selector);}
 return $el.hasClass(selectorDef.cls);},setGridSelect:function(isGridSelect) {if (this.isGridSelect() !==isGridSelect) {var selectorDef =this.selectors.controller.gridSelect;var $el =this.$el;if (selectorDef.selector) {$el =$el.find(selectorDef.selector);}
 if (isGridSelect) {$el.addClass(selectorDef.cls);} else {$el.removeClass(selectorDef.cls);Utils.getWidget($el).clearSelection();}
 this.$el.trigger($.Event("change:gridSelect",{"widget":this.$el.data("cardView"),"oldValue":!isGridSelect,"value":isGridSelect
 }));}
 },getDisplayMode:function() {if (this.$el.hasClass("list")) {return DISPLAY_LIST;}
 if (this.$el.hasClass("grid")) {return DISPLAY_GRID;}
 return null;},isColumnSorted:function() {return (this.getDisplayMode() =="list") &&this.$el.find(this.selectors.headerSelector).filter(".sort-mode").length > 0;},setDisplayMode:function(displayMode) {var oldValue =this.getDisplayMode();if (oldValue !==displayMode) {var widget =Utils.getWidget(this.$el);widget._restore(displayMode ===DISPLAY_LIST);switch (displayMode) {case DISPLAY_GRID:this.$el.removeClass("list");this.$el.addClass("grid");if (oldValue !==null) {var selection =widget.getSelection();this.setGridSelect(selection.length > 0);widget.layout();}
 break;case DISPLAY_LIST:this.$el.cuigridlayout("destroy");this.$el.removeClass("grid");this.$el.addClass("list");break;}
 this.$el.trigger($.Event("change:displayMode",{"widget":this.$el.data("cardView"),"oldValue":oldValue,"value":displayMode
 }));}
 },getSelectionModeCount:function() {return this.selectionModeCount;},setSelectionModeCount:function(modeCount) {this.selectionModeCount =modeCount;}
 });var DirectMarkupAdapter =new Class({$el:null,selectors:null,comparators:null,model:null,view:null,controller:null,construct:function(selectors,comparators) {this.selectors =selectors;this.comparators =comparators;},initialize:function($el) {this.$el =$el;this.setModel(new DirectMarkupModel($el,this.selectors));this.setView(new DirectMarkupView($el,this.selectors));this.setController(new DirectMarkupController($el,this.selectors,this.comparators));this.model.initialize();this.view.initialize();this.controller.initialize();},setModel:function(model) {this.model =model;},getModel:function() {return this.model;},setView:function(view) {this.view =view;},getView:function() {return this.view;},setController:function(controller) {this.controller =controller;},getController:function() {return this.controller;},isSelected:function(item) {var selectionState =this.view.getSelectionState(item);return (selectionState ==="selected");},setSelected:function(item,isSelected) {var selectionState =(isSelected ?"selected":"unselected");this.view.setSelectionState(item,selectionState);},getSelection:function(useModel) {var selection =this.view.getSelectedItems();if (useModel ===true) {selection =this.model.fromItemElements(selection);}
 return selection;},getDisplayMode:function() {return this.controller.getDisplayMode();},isColumnSorted:function() {return this.controller.isColumnSorted();},setDisplayMode:function(selectionMode) {this.controller.setDisplayMode(selectionMode);},isGridSelectionMode:function() {return this.controller.isGridSelect();},setGridSelectionMode:function(isSelectionMode) {this.controller.setGridSelect(isSelectionMode);},getSelectionModeCount:function() {return this.controller.getSelectionModeCount();},setSelectionModeCount:function(modeCount) {this.controller.setSelectionModeCount(modeCount);},_restore:function(restoreHeaders) {this.view.restore(this.model,restoreHeaders);this.model.reference();},removeAllItems:function() {var widget =Utils.getWidget(this.$el);widget.clearSelection();this.model.removeAllItemsSilently();this.view.removeAllItemsSilently();}
 });CUI.CardView =new Class({toString:'CardView',extend:CUI.Widget,adapter:null,construct:function(options) {var selectorConfig =Utils.mixObjects(options.selectorConfig,DEFAULT_SELECTOR_CONFIG);var comparators =options.comparators ||null;this.adapter =new DirectMarkupAdapter(selectorConfig,comparators);this.adapter.initialize(this.$element);this.layout(options.gridSettings);},getModel:function() {return this.adapter.getModel();},setModel:function(model) {this.adapter.setModel(model);},isSelected:function(item) {return this.adapter.isSelected(item);},getDisplayMode:function() {return this.adapter.getDisplayMode();},isColumnSorted:function() {return this.adapter.isColumnSorted();},setColumnSortable:function(sortable) {},isColumnSortable:function() {},setDisplayMode:function(displayMode) {this.adapter.setDisplayMode(displayMode);},isGridSelectionMode:function() {return this.adapter.isGridSelectionMode();},setGridSelectionMode:function(isSelection) {this.adapter.setGridSelectionMode(isSelection);},toggleGridSelectionMode:function() {this.setGridSelectionMode(!this.isGridSelectionMode());},getSelectionModeCount:function() {return this.adapter.getSelectionModeCount();},setSelectionModeCount:function(modeCount) {this.adapter.setSelectionModeCount(modeCount);},select:function(item,moreSelectionChanges) {item =ensureItem(item);var isSelected =this.adapter.isSelected(item);if (!isSelected) {if (this.getSelectionModeCount() ===SELECTION_MODE_COUNT_SINGLE &&this.getSelection().length > 0) {this.clearSelection();}
 this.adapter.setSelected(item,true);this.$element.trigger($.Event("change:selection",{"widget":this,"item":item,"isSelected":true,"moreSelectionChanges":(moreSelectionChanges ===true)
 }));}
 },deselect:function(item,moreSelectionChanges) {item =ensureItem(item);var isSelected =this.adapter.isSelected(item);if (isSelected) {this.adapter.setSelected(item,false);this.$element.trigger($.Event("change:selection",{"widget":this,"item":item,"isSelected":false,"moreSelectionChanges":moreSelectionChanges
 }));}
 },toggleSelection:function(item,moreSelectionChanges) {item =ensureItem(item);var beforeEvent =$.Event("beforeselect",{selectionCancelled:false,stopEvent:false,item:item,cancelSelection:function(stopEvent) {this.selectionCancelled =true;this.stopEvent =(stopEvent ===true);}
 });this.$element.trigger(beforeEvent);if (beforeEvent.selectionCancelled) {return beforeEvent.stopEvent;}
 var isSelected =this.isSelected(item);if (!isSelected &&(this.getSelectionModeCount() ===SELECTION_MODE_COUNT_SINGLE) &&(this.getSelection().length > 0)) {this.clearSelection();}
 this.adapter.setSelected(item,!isSelected);this.$element.trigger($.Event("change:selection",{"widget":this,"item":item,"isSelected":!isSelected,"moreSelectionChanges":moreSelectionChanges
 }));return true;},getSelection:function(useModel) {return this.adapter.getSelection(useModel ===true);},clearSelection:function() {var selection =this.getSelection(true);var itemCnt =selection.length;var finalItem =(itemCnt - 1);for (var i =0;i < itemCnt;i++) {this.deselect(selection[i],(i < finalItem));}
 },_headerSel:function(headers,selectFn,lastValidItemFn) {var model =this.adapter.getModel();if (headers ==null) {headers =model.getHeaders();}
 if (!$.isArray(headers)) {headers =[headers ];}
 var headerCnt =headers.length;for (var h =0;h < headerCnt;h++) {var header =headers[h];if (header.jquery) {header =model.getHeaderForEl(header);}
 var itemsToSelect =model.getItemsForHeader(header);var itemCnt =itemsToSelect.length;for (var i =0;i < itemCnt;i++) {selectFn.call(this,itemsToSelect[i],!lastValidItemFn(i,itemsToSelect));}
 }
 },selectAll:function(headers) {if (this.getSelectionModeCount() !==SELECTION_MODE_COUNT_MULTI) return;var self =this;this._headerSel(headers,this.select,function(i,items) {for (++i;i < items.length;i++) {if (!self.isSelected(items[i])) {return false;}
 }
 return true;});},deselectAll:function(headers) {var self =this;this._headerSel(headers,this.deselect,function(i,items) {for (++i;i < items.length;i++) {if (self.isSelected(items[i])) {return false;}
 }
 return true;});},getHeaderSelectionState:function() {var model =this.getModel();var curHeader =null;var state ={"selected":[],"hasUnselected":false,"headers":[]
 };var headerCnt =model.getHeaderCount();var itemCnt =model.getItemCount();for (var i =0;i < itemCnt;i++) {var item =model.getItemAt(i);for (var h =0;h < headerCnt;h++) {var header =model.getHeaderAt(h);if (header.getItemRef() ===item) {curHeader ={"header":header,"selected":[],"hasUnselected":false
 };state.headers.push(curHeader);break;}
 }
 if (this.isSelected(item)) {if (curHeader !==null) {curHeader.selected.push(item);} else {state.selected.push(item);}
 } else {if (curHeader !==null) {curHeader.hasUnselected =true;} else {state.hasUnselected =true;}
 }
 }
 return state;},layout:function(settings) {if (this.getDisplayMode() !==DISPLAY_GRID) {return;}
 if (this.$element.data('cuigridlayout')) {this.$element.cuigridlayout("destroy");}
 this.$element.cuigridlayout(settings);},relayout:function() {if (this.getDisplayMode() !==DISPLAY_GRID) {return;}
 this.$element.cuigridlayout("layout");},_restore:function(restoreHeaders) {this.adapter._restore(restoreHeaders);},append:function($items) {this.adapter.getModel().insertItemAt($items,null,false);},prepend:function($items) {this.adapter.getModel().insertItemAt($items,0,false);},removeAllItems:function() {this.adapter.removeAllItems();if (this.getDisplayMode() ===DISPLAY_GRID) {this.relayout();}
 this.$element.trigger($.Event("change:removeAll",{widget:this
 }));}
 });CUI.CardView.DefaultComparator =new Class({construct:function (selector,attribute,type) {this.selector =selector;this.attribute =attribute;this.isNumeric =(type =="numeric");this.reverseMultiplier =1;},setReverse:function(isReverse) {this.reverseMultiplier =(isReverse) ?-1 :1;},compare:function(item1,item2) {var $item1 =item1.getItemEl();var $item2 =item2.getItemEl();var $e1 =(this.selector) ?$item1.find(this.selector) :$item1;var $e2 =(this.selector) ?$item2.find(this.selector) :$item2;var t1 ="";var t2 ="";if (!this.attribute) {t1 =$e1.text();t2 =$e2.text();} else if(this.attribute.substr(0,5) =="data-") {t1 =$e1.data(this.attribute.substr(5));t2 =$e2.data(this.attribute.substr(5));} else {t1 =$e1.attr(this.attribute);t2 =$e2.attr(this.attribute);}
 if (this.isNumeric) {t1 =t1 * 1;t2 =t2 * 1;if (isNaN(t1)) t1 =0;if (isNaN(t2)) t2 =0;}
 if (t1 > t2) return 1 * this.reverseMultiplier;if (t1 < t2) return -1 * this.reverseMultiplier;return 0;},getCompareFn:function() {return this.compare.bind(this);}
 });CUI.CardView.DISPLAY_GRID =DISPLAY_GRID;CUI.CardView.DISPLAY_LIST =DISPLAY_LIST;CUI.CardView.SELECTION_MODE_COUNT_SINGLE ="single";CUI.CardView.SELECTION_MODE_COUNT_MULTI ="multiple";CUI.CardView.get =function($el) {var cardView =Utils.getWidget($el);if (!cardView) {cardView =Utils.getWidget($el.cardView());}
 return cardView;};CUI.util.plugClass(CUI.CardView);if (CUI.options.dataAPI) {$(function() {var cardViews =$('body').find('[data-toggle="cardview"]');for (var gl =0;gl < cardViews.length;gl++) {var $cardView =$(cardViews[gl]);if (!$cardView.data("cardview")) {$cardView.cardView();}
 }
 });}
 }(window.jQuery));(function($) {CUI.PathBrowser =new Class({toString:'PathBrowser',extend:CUI.Widget,construct:function(options) {if (!this.options.autocompleteCallback) {this.options.autocompleteCallback =this._defaultAutocompleteCallback.bind(this);}
 if (!this.options.optionRenderer) {this.options.optionRenderer =CUI.PathBrowser.defaultOptionRenderer;}
 this._render();while (this.options.optionDisplayStrings.length < this.options.options.length) {this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);}
 this.dropdownList =new CUI.DropdownList({element:this.inputElement,positioningElement:this.inputElement,cssClass:"autocomplete-results"});this.$element.on('change:disabled',this._update.bind(this));this.$element.on('change:placeholder',this._update.bind(this));this.$element.on('change:options',this._changeOptions.bind(this));this.$element.on("input","input",function() {if (this.options.disabled) {return;}
 if (this.typeTimeout) {clearTimeout(this.typeTimeout);}
 this.typeTimeout =setTimeout(this._inputChanged.bind(this),this.options.delay);}.bind(this));this.$element.on("blur","input",function() {if (this.options.disabled) {return;}
 if (this.typeTimeout) {clearTimeout(this.typeTimeout);}
 this.typeTimeout =null;if (this.selectedIndex >=0) {if (this.inputElement.attr("value") ==="") {this.setSelectedIndex(-1);} else {this._update();}
 }
 }.bind(this));this.$element.on("keydown","input",this._keyPressed.bind(this));this.$element.on("keyup","input",this._keyUp.bind(this));this.dropdownList.on("dropdown-list:select","",function(event) {this.dropdownList.hide(200);this.setSelectedIndex(event.selectedValue * 1);}.bind(this));this.$element.on("focus","input",function(event) {if (this.options.disabled) {return;}
 this.$element.addClass("focus");}.bind(this));this.$element.on("blur","input",function() {if (this.options.disabled) {return;}
 this.$element.removeClass("focus");}.bind(this));this.$element.on("click touchend","input",function(event) {if (this.options.disabled) {return;}
 this.inputElement.focus();this._inputChanged();}.bind(this));},defaults:{autocompleteCallback:null,options:[],optionDisplayStrings:[],optionLoader:null,optionLoaderRoot:null,optionValueReader:null,optionTitleReader:null,showTitles:true,rootPath:"/content",delay:200,placeholder:null,optionRenderer:null
 },dropdownList:null,syncSelectElement:null,inputElement:null,typeTimeout:null,selectedIndex:-1,triggeredBackspace:false,setSelectedIndex:function(index) {if (index < -1 ||index >=this.options.options.length) {return;}
 this.selectedIndex =index;this._update();},getSelectedIndex:function() {return this.selectedIndex;},_changeOptions:function(event) {if (event.widget !==this) {return;}
 this.selectedIndex =-1;this._update();},_render:function() {this._readDataFromMarkup();var div;if (this.$element.get(0).tagName ==="SELECT") {div =$("<div></div>");this.$element.after(div);this.$element.detach();div.append(this.$element);this.$element =div;}
 if (this.$element.get(0).tagName ==="INPUT") {div =$("<div></div>");this.$element.after(div);this.$element.detach();div.prepend(this.$element);this.$element =div;}
 if (this.$element.find("select option").length > 0 &&this.options.options.length ===0) {this.options.options =[];this.options.optionDisplayStrings =[];this.$element.find("select option").each(function(i,e) {this.options.options.push($(e).val());this.options.optionDisplayStrings.push($.trim($(e).text()));if ($(e).attr("selected")) {this.selectedIndex =i;}
 }.bind(this));}
 this._createMissingElements();this.syncSelectElement =this.$element.find("select");this.inputElement =this.$element.find("input");this.$element.addClass("pathbrowser");this.$element.removeClass("focus");if (!this.options.placeholder) {this.options.placeholder =this.inputElement.attr("placeholder");}
 if (this.options.name) {this.syncSelectElement.attr("name",this.options.name);}
 this._update();},_createMissingElements:function() {if (this.$element.find("select").length ===0) {this.$element.append($("<select></select>"));}
 if (this.$element.find("input").length ===0) {this.$element
 .prepend($("<input/>",{type:"text"})
 );}
 },_readDataFromMarkup:function() {if (this.$element.attr("placeholder")) {this.options.placeholder =this.$element.attr("placeholder");}
 if (this.$element.attr("data-placeholder")) {this.options.placeholder =this.$element.attr("data-placeholder");}
 if (this.$element.attr("disabled") ||this.$element.attr("data-disabled")) {this.options.disabled =true;}
 if (this.$element.attr("data-option-renderer")) {this.options.optionRenderer =CUI.PathBrowser[this.$element.attr("data-option-renderer") + "OptionRenderer"];}
 if (this.$element.attr("data-root-path")) {this.options.rootPath =this.$element.attr("data-root-path");}
 var optionLoader =CUI.util.buildFunction(this.$element.attr("data-option-loader"),["path","callback"]);if (optionLoader) {this.options.optionLoader =optionLoader.bind(this);}
 if (this.$element.attr("data-option-loader-root")) {this.options.optionLoaderRoot =this.$element.attr("data-option-loader-root");}
 var optionValueReader =CUI.util.buildFunction(this.$element.attr("data-option-value-reader"),["object"]);if (optionValueReader) {this.options.optionValueReader =optionValueReader.bind(this);}
 var optionTitleReader =CUI.util.buildFunction(this.$element.attr("data-option-title-reader"),["object"]);if (optionTitleReader) {this.options.optionTitleReader =optionTitleReader.bind(this);}
 },_update:function() {if (this.options.placeholder) {this.inputElement.attr("placeholder",this.options.placeholder);}
 if (this.options.disabled) {this.$element.addClass("disabled");this.inputElement.attr("disabled","disabled");} else {this.$element.removeClass("disabled");this.inputElement.removeAttr("disabled");}
 if (this.syncSelectElement) {this.syncSelectElement.find("option:selected").removeAttr("selected");}
 if (this.selectedIndex >=0) {if (this.syncSelectElement) {$(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected","selected");}
 var option =this.options.options[this.selectedIndex];if (option &&option.indexOf("/") !==0) {var parentPath ="";var iLastSlash =this.inputElement.attr("value").lastIndexOf("/");if (iLastSlash >=0) {parentPath =this.inputElement.attr("value").substring(0,iLastSlash + 1);}
 option =parentPath + option;}
 this._setInputValue(option,true);} else {this._setInputValue("");}
 },_setInputValue:function(newValue,moveCursor) {if (newValue) {this.inputElement.attr("value",newValue);if (moveCursor &&this.inputElement.is(":focus")) {CUI.util.selectText(this.inputElement,newValue.length);}
 }
 },_keyUp:function(event) {var key =event.keyCode;if (key ===8) {this.triggeredBackspace =false;}
 },_keyPressed:function(event) {var key =event.keyCode;if (!this.dropdownList.isVisible()) {if (key ===40) {this._inputChanged();event.preventDefault();}
 }
 },_inputChanged:function() {var self =this;var searchFor =this.inputElement.attr("value");if (searchFor.length > 0) {this.options.autocompleteCallback(searchFor)
 .done(function(results) {self._showAutocompleter(results);}
 )
 .fail(function() {console.log("Failed to read options");}
 )
 ;} else {this.dropdownList.hide();}
 },_showAutocompleter:function(results) {this.dropdownList.hide();if (results.length ===0) {return;}
 var optionRenderer =function(iterator,value) {return (this.options.optionRenderer.bind(this))(iterator,value);};this.dropdownList.set("optionRenderer",optionRenderer.bind(this));this.dropdownList.set("options",results);this.dropdownList.show();},_defaultAutocompleteCallback:function(path) {var self =this;var def =$.Deferred();if (/^\//.test(path) && /\/$/.test(path) && self.options.optionLoader) {
 var isCustomRoot =false;if (path ==="/") {if (self.options.rootPath) {path =self.options.rootPath.replace(/\/$/, "");
 if (path !=="") {isCustomRoot =true;} else {path ="/";}
 }
 } else {path =path.replace(/\/$/, "");
 }
 if (isCustomRoot) {self._setInputValue(path + "/");}
 var loader ={loadOptions:self.options.optionLoader
 };var loaderDef =$.Deferred();loaderDef.promise(loader);loader.done(function(object) {if ($.isFunction(object.promise)) {object.done(function(object) {self._rebuildOptions(def,path,object);}
 );} else {self._rebuildOptions(def,path,object);}
 }
 );var results =loader.loadOptions(path,function(data) {loaderDef.resolve(data);});if (results) loaderDef.resolve(results);} else {def.resolve(self._filterOptions(path));}
 return def.promise();},_rebuildOptions:function(def,path,object) {var self =this;var root =$.getNested(object,self.options.optionLoaderRoot);if (root) {var newOptions =[];var newOptionDisplayStrings =[];$.each(root,function(i,v) {var value;if (self.options.optionValueReader) {value =self.options.optionValueReader(v);} else {value =typeof v ==="object"?v.path :v;}
 newOptions.push(value);var title ="";if (self.options.optionTitleReader) {title =self.options.optionTitleReader(v);} else if (typeof v ==="object") {title =v.title;}
 newOptionDisplayStrings.push(title);}.bind(self));self.options.options =newOptions;self.options.optionDisplayStrings =newOptionDisplayStrings;var filtered =self._filterOptions(path);def.resolve(filtered);} else {def.reject();}
 },_filterOptions:function(searchFor) {var result =[];$.each(this.options.options,function(key,value) {result.push(key);}.bind(this));return result;}
 });CUI.util.plugClass(CUI.PathBrowser);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~='pathbrowser']",e.target).pathBrowser();});}
}(window.jQuery));CUI.PathBrowser.defaultOptionRenderer =function(iterator,index) {var value =this.options.options[index];if (value.indexOf("/") ===0) {var iLastSlash =value.lastIndexOf("/");value =value.substring(iLastSlash + 1);}
 var valueCls ="pathbrowser-autocomplete-item-value";var titleMarkup ="";if (this.options.showTitles &&this.options.optionDisplayStrings[index] &&this.options.optionDisplayStrings[index].length > 0) {valueCls +=" pathbrowser-autocomplete-item-value-with-title";titleMarkup +="<div class=\"pathbrowser-autocomplete-item-title\">"+ this.options.optionDisplayStrings[index] + "</div>";}
 return $("<div class=\"" + valueCls + "\">"+ value + "</div>"+ titleMarkup);};(function($) {CUI.Wizard =new Class({toString:'Wizard',extend:CUI.Widget,construct:function(options) {this.$nav =this.$element.find('nav').first();this.$back =this.$nav.find('button').first();this.$next =this.$nav.find('button').last();this.$pageOverview =this.$nav.find('ol').last();if (this.$element.data("hide-steps") ===true) {this.$pageOverview.addClass("hidden");}
 if (this.$back.attr('type') ===undefined) {this.$back[0].setAttribute('type','button');}
 if (this.$next.attr('type') ===undefined) {this.$next[0].setAttribute('type','button');}
 this.$nav.addClass('toolbar');this.$back.addClass('left');this.$next.addClass('right');this.$pageOverview.addClass('center');this.$nav.find('li').first().append('<div class="lead-fill"></div>');this.$next.click(this._onNextClick.bind(this));this.$back.click(this._onBackClick.bind(this));this._updateDefault();setTimeout(function() {this.changePage(1);}.bind(this),1);},defaults:{nextDisabled:false,backDisabled:false,nextLabel:'next',backLabel:'back',onPageChanged:null,onFinish:null,onLeaving:null,onNextButtonClick:null,onBackButtonClick:null
 },changePage:function(pageNumber) {if (pageNumber < 1 ||pageNumber > this.$nav.find('li').length) return ;this.pageNumber =pageNumber;var page =this.pageNumber - 1;var $newPage =this.getCurrentPage();this.$nav.find('li').removeClass('stepped');this.$nav.find('li:lt('+ page + ')').addClass('stepped');this.$nav.find('li.active').removeClass('active');this.$nav.find('li:eq('+ page + ')').addClass('active');this.$element.find('>section.active').removeClass('active');this.$element.find('>section:eq('+ page + ')').addClass('active');this._updateButtons();this._fireCallback('onPageChanged');if (typeof this.options.onPageChanged ==='object'&&this._dataExists($newPage,'wizardPageCallback') &&typeof this.options.onPageChanged[$newPage.data('wizardPageCallback')] ==='function') {this.options.onPageChanged[$newPage.data('wizardPageCallback')]($newPage);}
 },getCurrentPageNumber:function() {return this.pageNumber;},getCurrentPage:function() {return this.getPage(this.pageNumber);},getPage:function(pageNumber) {return this.$element.find('>section:eq('+ (parseFloat(pageNumber)-1) +')');},getPageNav:function(pageNumber) {return this.$element.find('>nav li:eq('+ (parseFloat(pageNumber)-1) +')');},setNextButtonLabel:function(label) {this.$next.text(label);},setBackButtonLabel:function(label) {this.$back.text(label);},setNextButtonDisabled:function(disabled) {this.$next.attr('disabled',disabled);},setBackButtonDisabled:function(disabled) {this.$back.attr('disabled',disabled);},activatePage:function(pageNumber) {this.getPage(pageNumber).removeClass('wizard-hidden-step');this.getPageNav(pageNumber).removeClass('wizard-hidden-step');},deactivatePage:function(pageNumber) {this.getPage(pageNumber).addClass('wizard-hidden-step');this.getPageNav(pageNumber).addClass('wizard-hidden-step');},_onNextClick:function(e) {var callbackResult =this._fireCallback('onNextButtonClick');if (callbackResult ===false) {return ;}
 var pageNumber =this._getNextPageNumber();if (pageNumber !=null) {this.changePage(pageNumber);} else {this._fireCallback('onFinish');}
 },_onBackClick:function(e) {var callbackResult =this._fireCallback('onBackButtonClick');if (callbackResult ===false) {return ;}
 var pageNumber =this._getPreviousPageNumber();if (pageNumber !=null) {this.changePage(pageNumber);} else {this._fireCallback('onLeaving');}
 },_getNextPageNumber:function() {var pageNumber =this.getCurrentPageNumber();return this._getRelativeNextPageNumber(pageNumber);},_getRelativeNextPageNumber:function(pageNumber) {if (pageNumber < this.$nav.find('li').length) {var newPageNumber =pageNumber + 1;var page =this.getPage(newPageNumber);if ($(page).hasClass('wizard-hidden-step')) {return this._getRelativeNextPageNumber(newPageNumber);} else {return newPageNumber;}
 } else {return null;}
 },_getPreviousPageNumber:function() {var pageNumber =this.getCurrentPageNumber();return this._getRelativePreviousPageNumber(pageNumber);},_getRelativePreviousPageNumber:function(pageNumber) {if (pageNumber > 1) {var newPageNumber =pageNumber - 1;var page =this.getPage(newPageNumber);if ($(page).hasClass('wizard-hidden-step')) {return this._getRelativePreviousPageNumber(newPageNumber);} else {return newPageNumber;}
 return pageNumber-1;} else {return null;}
 },_updateButtons:function() {var page =this.getCurrentPage();this.setNextButtonLabel((this._dataExists(page,'nextLabel')) ?page.data('nextLabel') :this.options.nextLabel);this.setBackButtonLabel((this._dataExists(page,'backLabel')) ?page.data('backLabel') :this.options.backLabel);this.setNextButtonDisabled((this._dataExists(page,'nextDisabled')) ?page.data('nextDisabled') :this.options.nextDisabled);this.setBackButtonDisabled((this._dataExists(page,'backDisabled')) ?page.data('backDisabled') :this.options.backDisabled);},_fireCallback:function(callback) {if (typeof this.options[callback] ==='function') {return this.options[callback]();}
 return undefined;},_dataExists:function($element,index) {return $element.data(index) !==undefined;},_updateDefault:function() {this.options.nextDisabled =this.$next.is('[disabled]');this.options.backDisabled =this.$back.is('[disabled]');this.options.nextLabel =this.$next.text();this.options.backLabel =this.$back.text();}
 });CUI.util.plugClass(CUI.Wizard);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=wizard]",e.target).wizard();});}
}(window.jQuery));(function($) {function cloneLeft(buttons) {return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("hidden")
 .clone().addClass("back left").each(processButton);}
 function cloneRight(buttons) {return buttons.filter("[data-action=next]").first().addClass("hidden")
 .clone().addClass("primary right").each(processButton);}
 function processButton(i,el) {$(el).removeClass("hidden").not("button").toggleClass("button",true);}
 function buildNav(wizard) {wizard.prepend(function() {var sections =wizard.children(".step");var nav =$('<nav class="toolbar"><ol class="center"></ol></nav>');var ol =nav.children("ol");sections.map(function() {return $("<li />").text(this.title);}).appendTo(ol);ol.children("li").first().addClass("active").append("<div class='lead-fill' />");var buttons =sections.first().find(".flexwizard-control");return nav.prepend(function() {return cloneLeft(buttons);}).append(function() {return cloneRight(buttons);});});}
 function showNav(to) {if (to.length ===0) return;to.addClass("active").removeClass("stepped");to.prevAll("li").addClass("stepped").removeClass("active");to.nextAll("li").removeClass("active stepped");}
 function showStep(wizard,to,from) {if (to.length ===0) return;if (from) {from.removeClass("active");}
 to.toggleClass("active",true);wizard.trigger("flexwizard-stepchange",[to,from]);}
 function controlWizard(wizard,action) {var nav =wizard.children("nav");var from =wizard.children(".step.active");var fromNav =nav.children("ol").children("li.active");var to,toNav;switch (action) {case "prev":to =from.prev(".step");toNav =fromNav.prev("li");break;case "next":to =from.next(".step");toNav =fromNav.next("li");break;case "cancel":return;}
 if (to.length ===0) return;var buttons =to.find(".flexwizard-control");cloneLeft(buttons).replaceAll(nav.children(".left"));cloneRight(buttons).replaceAll(nav.children(".right"));showNav(toNav);showStep(wizard,to,from);}
 CUI.FlexWizard =new Class({toString:"FlexWizard",extend:CUI.Widget,construct:function(options) {var wizard =this.$element;buildNav(wizard);wizard.on("click",".flexwizard-control",function(e) {controlWizard(wizard,$(this).data("action"));});showStep(wizard,wizard.children(".step").first());}
 });CUI.util.plugClass(CUI.FlexWizard);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=flexwizard]",e.target).flexWizard();});}
}(window.jQuery));(function($) {CUI.FileUpload =new Class({toString:'FileUpload',extend:CUI.Widget,construct:function(options) {this._render();this.inputElement.on("change",function(event) {if (this.options.disabled) {return;}
 this._onFileSelectionChange(event);}.bind(this));},defaults:{name:"file",placeholder:null,uploadUrl:null,uploadUrlBuilder:null,disabled:false,multiple:false,mimeTypes:null,sizeLimit:null,autoStart:false,fileNameParameter:null,useHTML5:true,dropZone:null,events:{}
 },inputElement:null,$spanElement:null,fileNameElement:null,uploadQueue:[],_render:function() {var self =this;if (this.$element.get(0).tagName ==="INPUT") {var clazz =this.$element.attr("class");var span =$("<span/>",{"class":clazz
 });this.$element.removeAttr("class");this.$element.after(span);this.$element.detach();span.prepend(this.$element);this.$element =span;}
 this.$spanElement =this.$element.is("span") ?this.$element :this.$element.find("span");this.inputElement =this.$element.find("input[type='file']");this._readDataFromMarkup();if (!CUI.util.HTTP.html5UploadSupported()) {this.options.useHTML5 =false;}
 this._createMissingElements();this.$element.addClass("fileupload");this.$element.removeClass("focus");if (this.inputElement.attr("title")) {this.$element.prepend($("<label/>",{"for":self.options.name
 }).html(this.inputElement.attr("title")));}
 if (this.options.events) {if (typeof this.options.events ==="object") {for (var name in this.options.events) {this._registerEventHandler(name,this.options.events[name]);}
 }
 }
 if (this.options.useHTML5) {this.options.dropZone =this._registerDropZone();} else {this.options.dropZone =null;}
 if (!this.options.placeholder) {this.options.placeholder =this.inputElement.attr("placeholder");}
 if (this.options.autoStart) {this._registerEventHandler("fileselected",function(event) {event.fileUpload.uploadFile(event.item);});}
 if (this.options.uploadUrlBuilder) {this.options.uploadUrl =this.options.uploadUrlBuilder(this);}
 if (!this.options.uploadUrl ||/\$\{.+\}/.test(this.options.uploadUrl)) {
 this.options.disabled =true;}
 this._update();},_registerDropZone:function() {var self =this;if (self.options.dropZone) {try {self.options.dropZone =$(self.options.dropZone);} catch (e) {delete self.options.dropZone;}
 if (self.options.dropZone) {self.options.dropZone
 .on("dragover",function(e) {if (self._isActive()) {self.isDragOver =true;if (e.stopPropagation) {e.stopPropagation();}
 if (e.preventDefault) {e.preventDefault();}
 self.$element.trigger({type:"dropzonedragover",originalEvent:e,fileUpload:self
 });}
 return false;})
 .on("dragleave",function(e) {if (self._isActive()) {if (e.stopPropagation) {e.stopPropagation();}
 if (e.preventDefault) {e.preventDefault();}
 self.isDragOver =false;window.setTimeout(function() {if (!self.isDragOver) {self.$element.trigger({type:"dropzonedragleave",originalEvent:e,fileUpload:self
 });}
 },1);}
 return false;})
 .on("drop",function(e) {if (self._isActive()) {if (e.stopPropagation) {e.stopPropagation();}
 if (e.preventDefault) {e.preventDefault();}
 var files =e.originalEvent.dataTransfer.files;self.$element.trigger({type:"dropzonedrop",originalEvent:e,files:files,fileUpload:self
 });self._onFileSelectionChange(e,files);}
 return false;})
 ;}
 }
 },_registerEventHandler:function(name,handler) {this.$element.on(name,handler);},_createMissingElements:function() {var self =this;var multiple =self.options.useHTML5 &&self.options.multiple;if (self.inputElement.length ===0) {self.inputElement =$("<input/>",{type:"file",name:self.options.name,multiple:multiple
 });self.$element.prepend(self.inputElement);} else {self.inputElement.attr("multiple",multiple);}
 },_readDataFromMarkup:function() {var self =this;if (this.inputElement.attr("name")) {this.options.name =this.inputElement.attr("name");}
 if (this.inputElement.attr("placeholder")) {this.options.placeholder =this.inputElement.attr("placeholder");}
 if (this.inputElement.attr("data-placeholder")) {this.options.placeholder =this.inputElement.attr("data-placeholder");}
 if (this.inputElement.attr("disabled") ||this.inputElement.attr("data-disabled")) {this.options.disabled =true;}
 if (this.inputElement.attr("multiple") ||this.inputElement.attr("data-multiple")) {this.options.multiple =true;}
 if (this.inputElement.attr("data-upload-url")) {this.options.uploadUrl =this.inputElement.attr("data-upload-url");}
 if (this.inputElement.attr("data-upload-url-builder")) {this.options.uploadUrlBuilder =CUI.util.buildFunction(this.inputElement.attr("data-upload-url-builder"),["fileUpload"]);}
 if (this.inputElement.attr("data-size-limit")) {this.options.sizeLimit =this.inputElement.attr("data-size-limit");}
 if (this.inputElement.attr("data-auto-start")) {this.options.autoStart =true;}
 if (this.inputElement.attr("data-usehtml5")) {this.options.useHTML5 =this.inputElement.attr("data-usehtml5") ==="true";}
 if (this.inputElement.attr("data-dropzone")) {this.options.dropZone =this.inputElement.attr("data-dropzone");}
 if (this.inputElement.attr("data-file-name-parameter")) {this.options.fileNameParameter =this.inputElement.attr("data-file-name-parameter");}
 $.each(this.inputElement.get(0).attributes,function(i,attribute) {var match =/^data-event-(.*)$/.exec(attribute.name);
 if (match &&match.length > 1) {var eventHandler =CUI.util.buildFunction(attribute.value,["event"]);if (eventHandler) {self.options.events[match[1]] =eventHandler.bind(self);}
 }
 });},_update:function() {if (this.options.placeholder) {this.inputElement.attr("placeholder",this.options.placeholder);}
 if (this.options.disabled) {this.$element.addClass("disabled");this.inputElement.attr("disabled","disabled");} else {this.$element.removeClass("disabled");this.inputElement.removeAttr("disabled");}
 },_onFileSelectionChange:function(event,files) {var addedCount =0,rejectedCount =0;if (this.options.useHTML5) {files =files ||event.target.files;for (var i =0;i < files.length;i++) {if (this._addFile(files[i])) {addedCount++;} else {rejectedCount++;}
 }
 } else {if (this._addFile(event.target)) {addedCount++;} else {rejectedCount++;}
 }
 this.$element.trigger({type:"filelistprocessed",addedCount:addedCount,rejectedCount:rejectedCount,fileUpload:this
 });},_addFile:function(file) {var self =this;var fileName;if (this.options.useHTML5) {fileName =file.name;} else {fileName =$(file).attr("value");}
 if (fileName.lastIndexOf("\\") !==-1) {fileName =fileName.substring(fileName.lastIndexOf("\\") + 1);}
 if (!self._getQueueItemByFileName(fileName)) {var item ={fileName:fileName
 };if (this.options.useHTML5) {item.file =file;item.fileSize =file.size;if (self.options.sizeLimit &&file.size > self.options.sizeLimit) {self.$element.trigger({type:"filerejected",item:item,message:"File is too big",fileUpload:self
 });return false;}
 }
 self.uploadQueue.push(item);self.$element.trigger({type:"queuechanged",item:item,operation:"ADD",queueLength:self.uploadQueue.length,fileUpload:self
 });self.$element.trigger({type:"fileselected",item:item,fileUpload:self
 });return true;}
 return false;},_getQueueIndex:function(fileName) {var index =-1;$.each(this.uploadQueue,function(i,item) {if (item.fileName ===fileName) {index =i;return false;}
 });return index;},_getQueueItem:function(index) {return index > -1 ?this.uploadQueue[index] :null;},_getQueueItemByFileName:function(fileName) {return this._getQueueItem(this._getQueueIndex(fileName));},uploadFile:function(item) {var self =this;if (self.options.useHTML5) {item.xhr =new XMLHttpRequest();item.xhr.addEventListener("loadstart",function(e) {self._onUploadStart(e,item);},false);item.xhr.addEventListener("load",function(e) {self._onUploadLoad(e,item);},false);item.xhr.addEventListener("error",function(e) {self._onUploadError(e,item);},false);item.xhr.addEventListener("abort",function(e) {self._onUploadCanceled(e,item);},false);var upload =item.xhr.upload;upload.addEventListener("progress",function(e) {self._onUploadProgress(e,item);},false);var file =item.file;var fileName =item.fileName;if (window.FormData) {var f =new FormData();if (self.options.fileNameParameter) {f.append(self.inputElement.attr("name"),file);f.append(self.options.fileNameParameter ||"fileName",fileName);} else {f.append(fileName,file);}
 f.append("_charset_","utf-8");item.xhr.open("POST",self.options.uploadUrl + "?:ck="+ new Date().getTime(),true);item.xhr.send(f);} else {item.xhr.open("PUT",self.options.uploadUrl + "/"+ fileName,true);item.xhr.send(file);}
 } else {var $body =$(document.body);var iframeName ="upload-"+ new Date().getTime();var $iframe =$("<iframe/>",{name:iframeName
 });$iframe.addClass("fileupload").appendTo($body);var $form =$("<form/>",{method:"post",enctype:"multipart/form-data",action:self.options.uploadUrl,target:iframeName
 });$form.addClass("fileupload").appendTo($body);var $charset =$("<input/>",{type:"hidden",name:"_charset_",value:"utf-8"});$form.prepend($charset);if (this.options.fileNameParameter) {this.fileNameElement =$("<input/>",{type:"hidden",name:this.options.fileNameParameter,value:item.fileName
 });$form.prepend(this.fileNameElement);}
 $iframe.one("load",function() {var content =this.contentWindow.document.body.innerHTML;self.inputElement.prependTo(self.$spanElement);$form.remove();$iframe.remove();self.$element.trigger({type:"fileuploadload",item:item,content:content,fileUpload:self
 });});self.inputElement.prependTo($form);$form.submit();}
 },cancelUpload:function(item) {item.xhr.abort();},_onUploadStart:function(e,item) {this.$element.trigger({type:"fileuploadstart",item:item,originalEvent:e,fileUpload:this
 });},_onUploadProgress:function(e,item) {this.$element.trigger({type:"fileuploadprogress",item:item,originalEvent:e,fileUpload:this
 });},_onUploadLoad:function(e,item) {var request =e.target;if (request.readyState ===4) {this._internalOnUploadLoad(e,item,request.status,request.responseText);}
 },_internalOnUploadLoad:function(e,item,requestStatus,responseText) {if (CUI.util.HTTP.isOkStatus(requestStatus)) {this.$element.trigger({type:"fileuploadsuccess",item:item,originalEvent:e,fileUpload:this
 });} else {this.$element.trigger({type:"fileuploaderror",item:item,originalEvent:e,message:responseText,fileUpload:this
 });}
 if (this.fileNameElement) {this.fileNameElement.remove();}
 this.uploadQueue.splice(this._getQueueIndex(item.fileName),1);this.$element.trigger({type:"queuechanged",item:item,operation:"REMOVE",queueLength:this.uploadQueue.length,fileUpload:this
 });},_onUploadError:function(e,item) {this.$element.trigger({type:"fileuploaderror",item:item,originalEvent:e,fileUpload:this
 });},_onUploadCanceled:function(e,item) {this.$element.trigger({type:"fileuploadcanceled",item:item,originalEvent:e,fileUpload:this
 });},_isActive:function() {return !this.inputElement.is(':disabled');}
 });CUI.util.plugClass(CUI.FileUpload);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~='fileupload']",e.target).fileUpload();});}
}(window.jQuery));(function($) {CUI.Toolbar =new Class({toString:'Toolbar',extend:CUI.Widget,construct:function(options) {var $toolbar =this.$element,$header =$toolbar.closest(".content-header"),$icons =$toolbar.find(".left"),hasCenter =$toolbar.find(".center").length !==0,iconWidth =$icons.width();$toolbar.reflow({"break-lines":function ($toolbar,size) {return hasCenter &&$toolbar.width()-2*iconWidth < 16*size.rem();},"long-title":function ($toolbar,size) {return hasCenter &&$toolbar.width()-2*iconWidth > 40*size.rem();}
 },{"applyClassToElement":$header
 });}
 });CUI.util.plugClass(CUI.Toolbar);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=toolbar]",e.target).toolbar();});}
}(window.jQuery));(function($) {CUI.Tooltip =new Class({toString:'Tooltip',extend:CUI.Widget,construct:function(options) {if (this.options.target) this.options.target =$(this.options.target);if (this.$element.length ===0 &&this.options.target) {this.$element =$("<div>");this.$element.insertAfter(this.options.target);}
 this.$element.addClass('tooltip');if (this.$element.data("interactive")) {this.options.interactive =true;if (!this.options.target) this.options.target =this.$element.parent();}
 if (this.$element.data("target")) {this.options.target =$(this.$element.data("target"));}
 if (!this.options.arrow) {this.options.arrow ="left";if (this.$element.hasClass("arrow-left")) this.options.arrow ="left";if (this.$element.hasClass("arrow-right")) this.options.arrow ="right";if (this.$element.hasClass("arrow-top")) this.options.arrow ="top";if (this.$element.hasClass("arrow-bottom")) this.options.arrow ="bottom";}
 if (this.options.interactive) this.options.visible =false;this.$element.toggleClass("hidden",!this.options.visible);this.$element.on('change:content',this._setContent.bind(this));this.$element.on('change:type',this._setType.bind(this));this.$element.on('change:arrow',this._setArrow.bind(this));this.applyOptions();this.reposition();if (this.options.target) this.options.target.data("tooltip",this);if (this.options.interactive &&this.options.target) {var hto =null;$(this.options.target).finger("touchstart.cui-tooltip",function(event) {if (hto) clearTimeout(hto);this.show();hto =setTimeout(function() {this.hide();}.bind(this),3000);}.bind(this));var showTimeout =false;$(this.options.target).pointer("mouseover.cui-tooltip",function(event) {if (showTimeout) clearTimeout(showTimeout);showTimeout =setTimeout(function() {this.show();}.bind(this),this.options.delay);}.bind(this));$(this.options.target).pointer("mouseout.cui-tooltip",function(event) {if (showTimeout) clearTimeout(showTimeout);this.hide();}.bind(this));}
 },defaults:{target:null,visible:true,type:'default',interactive:false,arrow:null,delay:500,distance:5
 },_types:['info','error','notice','success'],_arrows:['arrow-left','arrow-right','arrow-top','arrow-bottom'],applyOptions:function() {this._setContent();this._setType();this._setArrow();},_setType:function() {if (typeof this.options.type !=='string'||this._types.indexOf(this.options.type) ===-1) return;this.$element.removeClass(this._types.join(' '));this.$element.addClass(this.options.type);this.reposition();},_setArrow:function() {if (typeof this.options.arrow !=='string'||this._arrows.indexOf("arrow-"+ this.options.arrow) ===-1) return;this.$element.removeClass(this._arrows.join(' '));this.$element.addClass("arrow-"+ this.options.arrow);this.reposition();},_setContent:function() {if (typeof this.options.content !=='string') return;this.$element.html(this.options.content);this.reposition();},_show:function() {if (this.$element.hasClass("hidden")) {this.$element.removeClass('hidden');this.$element.css("display","none");}
 this.$element.fadeIn();},_hide:function() {this.$element.fadeOut(400,function() {if (this.options.autoDestroy) {this.$element.remove();$(this.options.target).off(".cui-tooltip");$(this.options.target).data("tooltip",null);} }.bind(this));return this;},reposition:function(withoutWorkaround) {if (!this.options.target) return;if (!withoutWorkaround) setTimeout(function() {this.reposition(true);}.bind(this),50);this.$element.detach().insertAfter(this.options.target);this.$element.css("position","absolute");var el =$(this.options.target);var eWidth =el.outerWidth(true);var eHeight =el.outerHeight(true);var eLeft =el.position().left;var eTop =el.position().top;var width =this.$element.outerWidth(true);var height =this.$element.outerHeight(true);var left =0;var top =0;if (this.options.arrow ==="left") {left =eLeft + eWidth + this.options.distance;top =eTop + (eHeight - height) / 2;}
 if (this.options.arrow ==="right") {left =eLeft - width - this.options.distance;top =eTop + (eHeight - height) / 2;}
 if (this.options.arrow ==="bottom") {left =eLeft + (eWidth - width) / 2;top =eTop - height - this.options.distance;}
 if (this.options.arrow ==="top") {left =eLeft + (eWidth - width) / 2;top =eTop + eHeight + this.options.distance;} this.$element.css('left',left);this.$element.css('top',top);return this;}
 });CUI.util.plugClass(CUI.Tooltip);if (CUI.options.dataAPI) {$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=tooltip]",e.target).tooltip();});$(document).fipo("touchstart","mouseover","[data-init~=quicktip]",function(event) {var el =$(event.target);var tooltip =el.data("tooltip");if (!tooltip) {new CUI.Tooltip({target:el,content:el.data("quicktip-content") ||el.html(),type:el.data("quicktip-type"),arrow:el.data("quicktip-arrow"),interactive:true,autoDestroy:true
 });el.trigger(event);}
 }.bind(this));}
}(window.jQuery));(function($) {var ns ="cui-draggable-list";var dropZoneClassName ="dropzone";function boundingBox(element) {return {l:element.offset().left,t:element.offset().top,w:element.outerWidth(),h:element.outerHeight()};}
 function within(x,y,element) {var bb =boundingBox(element);return (x >=bb.l &&y >=bb.t &&x < bb.l + bb.w &&y < bb.t + bb.h);}
 function currentPagePosition(event) {var touch ={};if (event.originalEvent) {var o =event.originalEvent;if (o.changedTouches &&o.changedTouches.length > 0) touch =event.originalEvent.changedTouches[0];if (o.touches &&o.touches.length > 0) touch =event.originalEvent.touches[0];}
 var x =touch.pageX ||event.pageX;var y =touch.pageY ||event.pageY;return {x:x,y:y};}
 DragAction =new Class({construct:function(event,source,dragElement,dropZones,restrictAxis) {this.sourceElement =source;this.dragElement =dragElement;this.container =this._getViewContainer(dragElement);this.containerHeight =this.container.get(0).scrollHeight;this.dropZones =dropZones;this.axis =restrictAxis;this.scrollZone =20;this.dragStart(event);},currentDragOver:null,_getViewContainer:function(element) {while (true) {var p =element.parent();if (p.length ==0) return p;if (p.is("body")) return p;var flow =p.css("overflow");if (flow =="hidden"||flow =="auto"||flow =="scroll") return p;element =p;}
 },dragStart:function(event) {event.preventDefault();var p =this.dragElement.position();this.dragElement.css({"left":p.left,"top":p.top,"width":this.dragElement.width() + "px"}
 );this.dragElement.addClass("dragging");var pp =currentPagePosition(event);var x =pp.x;var y =pp.y;this.dragStart ={x:x - p.left,y:y - p.top};$(document).fipo("touchmove."+ ns,"mousemove."+ ns,this.drag.bind(this));$(document).fipo("touchend."+ ns,"mouseup."+ ns,this.dragEnd.bind(this));this.sourceElement.trigger(this._createEvent("dragstart",event));this.drag(event);},drag:function(event) {event.preventDefault();var p =currentPagePosition(event);var x =p.x;var y =p.y;if (this.container.is("body")) {if ((y - this.container.scrollTop()) < this.scrollZone) this.container.scrollTop(y - this.scrollZone);if ((y - this.container.scrollTop()) > (this.container.height() - this.scrollZone)) this.container.scrollTop(y - (this.container.height() - this.scrollZone));} else {var oldTop =this.container.scrollTop();var t =this.container.offset().top + this.scrollZone;if (y < t) {this.container.scrollTop(this.container.scrollTop() - (t - y));}
 var h =this.container.offset().top + this.container.height() - this.scrollZone;if (y > h) {var s =this.container.scrollTop() + (y - h);if (s > (this.containerHeight - this.container.height())) {s =Math.max(this.containerHeight - this.container.height(),0);}
 this.container.scrollTop(s);}
 var newTop =this.container.scrollTop();this.dragStart.y +=oldTop - newTop;}
 var newCss ={}
 if (this.axis !="horizontal") newCss["top"] =y - this.dragStart.y;if (this.axis !="vertical") newCss["left"] =x - this.dragStart.x;this.dragElement.css(newCss);this.triggerDrag(event);},dragEnd:function(event) {event.preventDefault();this.dragElement.removeClass("dragging");this.dragElement.css({top:"",left:"",width:""});$(document).off("."+ ns);this.triggerDrop(event);if (this.currentDragOver !=null) $(this.currentDragOver).trigger(this._createEvent("dragleave",event));this.sourceElement.trigger(this._createEvent("dragend",event));},triggerDrag:function(event) {var dropElement =this._getCurrentDropZone(event);if (dropElement !=this.currentDragOver) {if (this.currentDragOver !=null) $(this.currentDragOver).trigger(this._createEvent("dragleave",event));this.currentDragOver =dropElement;if (this.currentDragOver !=null) $(this.currentDragOver).trigger(this._createEvent("dragenter",event));} else {if (this.currentDragOver !=null) $(this.currentDragOver).trigger(this._createEvent("dragover",event));} },triggerDrop:function(event) {var dropElement =this._getCurrentDropZone(event);if (dropElement ==null) return;var dropEvent =this._createEvent("drop",event);dropElement.trigger(dropEvent);},_getCurrentDropZone:function(event) {var p =currentPagePosition(event);var dropElement =null;jQuery.each(this.dropZones,function(index,value) {if (!within(p.x,p.y,value)) return;dropElement =value;}.bind(this));return dropElement;},_createEvent:function(name,fromEvent) {var p =currentPagePosition(fromEvent);var event =jQuery.Event(name);event.pageX =p.x;event.pageY =p.y;event.sourceElement =this.sourceElement;event.item =this.dragElement;return event;}
 });var dropZones =[];CUI.DraggableList =new Class({toString:'DraggableList',extend:CUI.Widget,construct:function(options) {this.$element.addClass("draggable");if (this.$element.data("allow")) {var allow =this.$element.data("allow").split(" ");if (jQuery.inArray("reorder",allow) >=0) this.options.allowReorder =true;if (jQuery.inArray("drag",allow) >=0) this.options.allowDrag =true;if (jQuery.inArray("drop",allow) >=0) this.options.allowDrop =true;}
 if (this.$element.data("closable")) this.options.closable =true;this.$element.on("click",".close",this.close.bind(this));this.$element.fipo("taphold","mousedown","li",this.dragStart.bind(this));this.dropZone =(this.$element.parent().is("."+ dropZoneClassName)) ?this.$element.parent() :this.$element;this.$element.on("dragend",this.dragEnd.bind(this));if (this.options.allowDrop ||this.options.allowReorder) {this.dropZone.on("dragenter",this.dragEnter.bind(this));this.dropZone.on("dragover",this.dragOver.bind(this));this.dropZone.on("dragleave",this.dragLeave.bind(this));this.dropZone.on("drop",this.drop.bind(this));}
 if (this.options.allowDrop) {dropZones.push(this.dropZone);}
 this.$element.on("dragstart",function(event) {event.preventDefault();});},defaults:{allowReorder:false,allowDrag:false,allowDrop:false,closable:false
 },dropZone:null,dragStart:function(event) {if ($(event.target).hasClass("close")) return;event.preventDefault();var el =$(event.target).closest("li");el.prevAll().addClass("drag-before");el.nextAll().addClass("drag-after");this.$element.css({height:this.$element.height() + $(event.item).height() + "px"});if (this.options.allowDrag) {new DragAction(event,this.$element,el,dropZones);} else {new DragAction(event,this.$element,el,[this.dropZone],"vertical");}
 },dragEnd:function(event) {this.$element.css({height:""});},dragEnter:function(event) {this.dropZone.addClass("drag-over");if (this.options.allowReorder) {this.reorderPreview(event);} },dragOver:function(event) {if (this.options.allowReorder) {this.reorderPreview(event);}
 },dragLeave:function(event) {this.dropZone.removeClass("drag-over");this.$element.children().removeClass("drag-before drag-after");},drop:function(event) {this.$element.css({height:""});if (this.$element.is(event.sourceElement) &&this.options.allowReorder) {this.reorder(event,false);}
 if (!this.$element.is(event.sourceElement) &&this.options.allowDrop) {var e =$(event.item);if (this.options.closable &&e.find(".close").length ==0) {e.append("<button class=\"close\">&times;</button>");} else if (!this.options.closable) {e.find(".close").remove();}
 if (this.options.allowReorder) {this.reorder(event,e);} else {this.$element.append(e);}
 }
 this.$element.children().removeClass("drag-before drag-after");},reorderPreview:function(event) {var p =currentPagePosition(event);var x =p.x;var y =p.y;var bb =boundingBox(this.$element);var that =this;if (x < bb.l ||y < bb.t ||x > bb.l + bb.w ||y > bb.t + bb.h) {this.$element.children().removeClass("drag-after drag-before");} else {this.$element.children().each(function() {if ($(this).is(".dragging")) return;var bb =boundingBox($(this));var isAfter =(y < (bb.t + bb.h / 2));$(this).toggleClass("drag-after",isAfter);$(this).toggleClass("drag-before",!isAfter);});}
 },reorder:function(event,newItem) {var from =(newItem) ?newItem :$(event.item);var before =this.$element.children(".drag-after:first");var after =this.$element.children(".drag-before:last");var oldPosition =from.index();if (before.length > 0) from.insertBefore(before);if (after.length > 0) from.insertAfter(after);if (before.length ==0 &&after.length ==0 &&newItem) {this.$element.append(from);}
 var newPosition =from.index();if (oldPosition !=newPosition ||newItem) {var e =jQuery.Event((newItem) ?"inserted":"reordered");e.sourceElement =event.sourceElement;e.oldIndex =oldPosition;e.newIndex =newPosition;e.item =from.get(0);this.$element.trigger(e);return true;}
 return false;},close:function(event) {if (!this.options.closable) return;event.preventDefault();var e =$(event.target).closest("li");var index =e.index();e.remove();var event =jQuery.Event("removed");event.sourceElement =this.$element.get(0);event.index =index;event.item =e.get(0);this.$element.trigger(event);}
 });CUI.util.plugClass(CUI.DraggableList);if (CUI.options.dataAPI) {$(document).on('cui-contentloaded.data-api',function() {$("[data-init~=draggable-list]").draggableList();});}
}(window.jQuery));(function($) {CUI.CharacterCount =new Class({toString:'CharacterCount',extend:CUI.Widget,construct:function(options) {if (this.$element.attr("maxlength")) this.options.maxlength =this.$element.attr("maxlength");this.$element.removeAttr("maxlength");this.countElement =$("<span>").addClass("character-count");if (!this.$element.is("input")) {this.container =$("<div>").addClass("character-count-container");this.$element.wrapAll(this.container);}
 this.$element.after(this.countElement);this.$element.on("input",this._render.bind(this));this.$element.on("change:maxlength",this._render.bind(this));this._render();},defaults:{maxlength:null
 },isTooLong:function() {var isFormField =this.$element.is("input,textarea");var length =(isFormField) ?this.$element.val().length :this.$element.text().length;var tooLong =(this.options.maxlength) ?(length > this.options.maxlength) :false;return tooLong;},_render:function() {var isFormField =this.$element.is("input,textarea");var length =(isFormField) ?this.$element.val().length :this.$element.text().length;var tooLong =this.isTooLong();this.$element.toggleClass("error",tooLong);this.countElement.toggleClass("negative",tooLong);this.countElement.text((this.options.maxlength) ?(this.options.maxlength - length) :length);}
 });CUI.util.plugClass(CUI.CharacterCount);$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=character-count]",e.target).characterCount();});}(window.jQuery));(function($) {CUI.Accordion =new Class({toString:'Accordion',extend:CUI.Widget,construct:function(options) {this.isAccordion =(!this.$element.hasClass("collapsible")) &&(!(this.$element.data("init") =="collapsible"));if (this.isAccordion) this.$element.addClass("accordion");if (this.isAccordion) {var activeIndex =this.$element.children(".active").index();if (this.options.active !==false) activeIndex =this.options.active;this.$element.children().each(function(index,element) {this._initElement(element,index !=activeIndex);}.bind(this));} else {this._initElement(this.$element,!(this.options.active ||this.$element.hasClass("active")));}
 this.$element.on("click","h3",this._toggle.bind(this));this.$element.on("change:active",this._changeActive.bind(this));this.$element.on("selectstart","h3",function(event) {event.preventDefault();});},defaults:{active:false
 },isAccordion:false,_toggle:function(event) {var el =$(event.target).closest(".collapsible");var isCurrentlyActive =el.hasClass("active");var active =(isCurrentlyActive) ?false :((this.isAccordion) ?el.index() :true);this.setActive(active);},_changeActive:function() {if (this.isAccordion) {this._collapse(this.$element.children(".active"));if (this.options.active !==false) {var activeElement =this.$element.children().eq(this.options.active);this._expand(activeElement);}
 } else {if (this.options.active) {this._expand(this.$element);} else {this._collapse(this.$element);}
 } },setActive:function(active) {this.options.active =active;this._changeActive();},_initElement:function(element,collapse) {if ($(element).find("h3").length ==0) $(element).prepend("<h3>&nbsp;</h3>");if ($(element).find("h3 i").length ==0) $(element).find("h3").prepend("<i></i>&nbsp;");$(element).addClass("collapsible");if (collapse) {$(element).removeClass("active");$(element).height($(element).find("h3").height());$(element).find("h3 i").removeClass("icon-accordiondown").addClass("icon-accordionup");} else {$(element).addClass("active");$(element).css("height","auto");$(element).find("h3 i").removeClass("icon-accordionup").addClass("icon-accordiondown");} },_collapse:function(el) {el.removeClass("active");el.find("h3 i").removeClass("icon-accordiondown").addClass("icon-accordionup");el.animate({height:el.find("h3").height()},"fast");},_expand:function(el) {el.addClass("active");el.find("h3 i").removeClass("icon-accordionup").addClass("icon-accordiondown");var h =this._calcHeight(el);el.animate({height:h},"fast",function() {el.css("height","auto");});},_calcHeight:function(el) {var el2 =$(el).clone();el2.css({display:"block",position:"absolute",top:"-10000px",width:el.width(),height:"auto"});$("body").append(el2);var h =el2.height();el2.remove();return h;}
 });CUI.util.plugClass(CUI.Accordion);$(document).on("cui-contentloaded.data-api",function(e) {$("[data-init~=accordion],[data-init~=collapsible]").accordion();});}(window.jQuery));(function($,console) {"use strict";if (!$.message ||!$.validator) {if (console) console.warn("$.message and/or $.validator are not available, thus nothing is registered.");return;}
 $.message.register({selector:"*",message:{"validation.required":"Please fill out this field."}
 });$.message.register({selector:":lang(de)",message:{}
 });function simpleShow(el,message) {var error =el.next(".form-error");el.attr("aria-invalid","true").toggleClass("error",true);if (error.length ===0) {el.after($("<span class='form-error' data-init='quicktip' data-quicktip-arrow='top' data-quicktip-type='error' />").html(message));} else {error.html(message);}
 }
 function simpleClear(el) {el.removeAttr("aria-invalid").removeClass("error");el.next(".form-error").remove();}
 $.validator.register({selector:"form *",show:simpleShow,clear:simpleClear
 });$.validator.register({selector:"form input, form textarea",validate:function(el) {var isRequired =el.prop("required") ===true ||(el.prop("required") ===undefined &&el.attr("required") !==undefined) ||el.attr("aria-required") ==="true";if (isRequired &&el.val().length ===0) {return el.message("validation.required") ||"required";}
 }
 });$(document).on("input","form input, form textarea",function(e) {var el =$(this);el.checkValidity();el.updateErrorUI();});$.validator.register({selector:"[role=listbox]",validate:function(el) {if (el.attr("aria-required") !=="true") {return;}
 var selected =false;el.find("[role=option]").each(function() {if ($(this).attr("aria-selected") ==="true") {selected =true;return false;}
 });if (!selected) {return el.message("validation.required") ||"required";}
 }
 });})(jQuery,window.console);