
(function(){if(!window.OM){window.Omniture=window.OWL=window.OM=function(){return OM.fn.apply(OM,arguments);};OM.fn=function(){OM.fn.q.push(arguments);return OM;};OM.fn.q=[];}
var OM=window.OM;MT='';Array.isArray=Array.isArray||Object.isArray;OM.logout=function logout(link){if(OM.Config.headerConfig&&OM.Config.headerConfig.hasImsSession){location=OM.URL.suite('Main.Logout');}else{OM.Config.logout=OM.Config.logout||{};$(link).update(OM.Config.logout.text||'Signing Out...');var products=OM.Config.logout.products||[],remaining=products.length,url=OM.URL.suite('Main.Logout');if(remaining<=0){location=url;}
setTimeout(function(){location=url;},5000);OM.logout.complete=function logout_complete(){if(--remaining<=0){location=url;}};var prefix='<iframe onload="OM.logout.complete()" src="',suffix=(OM.Config.logout.params||MT)+'"></iframe>',div=document.createElement('div');div.style.display='none';div.innerHTML=prefix+products.join(suffix+prefix)+suffix;document.body.appendChild(div);}};OM.Observable=Class.create({handlers:{},initialize:function initialize(o){var handlers={},o=o||{},i,v,on='on',fn='function';for(i in o){if(i.substr(0,2)===on&&i.length>2){v=o[i],i=i.substr(2);if(typeof v===fn){handlers[i]=[v];}
else if(Array.isArray(v)){handlers[i]=v;}}}
this.handlers=handlers;return this;},on:function on(name,fn){if(!name||typeof fn!=='function'){return this;}
var all=this.handlers,evnt=(all[name]=all[name]||[]);evnt[evnt.length]=fn;return this;},un:function un(name,fn){if(!name){return this;}
var all=this.handlers,evnt=(all[name]=all[name]||[]),i;if(!fn){evnt.length=0;return this;}
if((i=evnt.indexOf(fn))>=0){evnt.splice(i,1);}
return this;},fire:function fire(name){var args=Array.prototype.slice.call(arguments,1),all=this.handlers,evnt=(all[name]=all[name]||[]),i,l;for(i=0,l=evnt.length;i<l;++i){evnt[i].apply(this,args);}
return this;}});OM.Security=(function(){var ns={},ENT='&#',SEMI=';',DQ='"',ZRO='0',HEX='\\u';function HtmlEncode(str,dflt){str=''+str;if(!str){return dflt||MT;}
var out=MT,l=str.length,i,c;for(i=0;i<l;++i){c=str.charCodeAt(i);if(c===32||c===44||c===46||c>=48&&c<=57||c>=65&&c<=90||c>=97&&c<=122){out+=str.charAt(i);}
else{out+=ENT+c+SEMI;}}
return out;}ns.XmlEncode=(ns.HtmlEncode=HtmlEncode);function HtmlAttributeEncode(str,dflt){if(!str){return dflt||MT;}
var out=MT,l=str.length,i,c;for(i=0;i<l;++i){c=str.charCodeAt(i);if(c>=48&&c<=57||c>=65&&c<=90||c>=97&&c<=122){out+=str.charAt(i);}
else{out+=ENT+c+SEMI;}}
return out;}ns.XmlAttributeEncode=(ns.HtmlAttributeEncode=HtmlAttributeEncode);function JsString(str,dflt){if(!(str=str||dflt)){return DQ+DQ;}
var out=DQ,l=str.length,i,c,k;for(i=0;i<l;++i){c=str.charCodeAt(i);if(c===32||c===44||c===46||c>=48&&c<=57||c>=65&&c<=90||c>=97&&c<=122){out+=str.charAt(i);}
else{c=c.toString(16);k=4-c.length;while(k-->0){c=ZRO+c;}
out+=HEX+c;}}
return out+DQ;}ns.JsonEncode=(ns.JsString=JsString);var textarea=document.createElement('textarea');function HtmlDecode(s){textarea.innerHTML=(s||MT).replace(/</g,'&lt;').replace(/>/g,'&gt;');return textarea.value;}ns.HtmlDecode=HtmlDecode;return ns;})();var enhancers=[];OM.enhance=function enhance(){var a=enhancers,i,l=a.length,o;for(i=0;i<l;++i){$$((o=a[i]).select).each(o.init,o);}
return OM;}
OM.enhance.add=function enhance_add(o){return enhancers.push(o);};document.observe('dom:loaded',OM.enhance);if(!('placeholder'in document.createElement('input'))){OM.enhance.add({select:'input[placeholder]:not([data-enhanced-placeholder])',init:function init(input){if(input.readAttribute('type').toLowerCase()==='password'){input.isPasswordField=true;}
input.observe('focus',this.onfocus.bindAsEventListener(input)).observe('blur',this.onblur.bindAsEventListener(input)).writeAttribute('data-enhanced-placeholder','true');this.onblur.call(input);if(input===document.activeElement)this.onfocus.call(input);},onfocus:function onfocus(){if(this.value===this.readAttribute('placeholder')){this.removeClassName('placeholder-value').value=MT;}
if(this.isPasswordField){this.writeAttribute('type','password');}},onblur:function onblur(){if(!this.value.strip()){this.addClassName('placeholder-value').value=this.readAttribute('placeholder');if(this.isPasswordField){this.writeAttribute('type','text');}}}});}
var e_search_type=(new Element('input',{type:'search'})).type==='search';OM.enhance.add({select:e_search_type?'input[type=search]:not([data-enhanced-search])':'input',init:function init(input){if(input.readAttribute('type')!=='search'||input.readAttribute('data-enhanced-search')){return;}
var widget={input:input,search:input.fire.bind(input,'om:search'),select:function(){input.select();}};widget.clear=(new Element('a',{'class':'clear-search'})).observe('click',this.onclear.bindAsEventListener(widget));input.observe('keyup',this.onkeyup.bindAsEventListener(widget)).observe('focus',this.onfocus.bindAsEventListener(widget)).writeAttribute('data-enhanced-search','true').insert({after:widget.clear.hide()});this.onkeyup.call(widget);clearTimeout(widget.timer);widget.timer=null;},onkeyup:function onkeyup(e){var input=this.input,text=input.value;if(text===input.readAttribute('placeholder')){text=MT;}
if(text===this.prev){return;}
if(this.prev=text){var offset=input.positionedOffset();this.clear.setStyle({'top':offset.top+'px','left':offset.left+input.getWidth()+'px'}).show();}else{this.clear.hide();}
clearTimeout(this.timer);this.timer=setTimeout(this.search,150);},onfocus:function onfocus(e){setTimeout(this.select,10);},onclear:function onclear(e){this.clear.hide();this.input.value=MT;this.input.focus();this.input.fire('om:searchclear');this.search();}});var l10n=(OM.l10n=OM.l10n||{text:{},images:{}});l10n.sprintf=function(str){var i=1,args=arguments;return String(str).replace(/%?%(s)/g,function(symbol){if('%'==symbol[1])return symbol;var arg=args[i++];return String(arg);});};l10n.getimage_url=function getimage_url(u){return(u in l10n.images)?l10n.images[u]:u;};l10n.gettext=function gettext(s){var result=(s in l10n.text)?l10n.text[s]:s;if(arguments.length>1){arguments[0]=result;result=l10n.sprintf.apply(this,arguments);}
return result;};String.addLocalizedStrings=function addLocalizedStrings(o){for(var i in o){l10n.text[i]=o[i];}};String.prototype.localized=(String.prototype.toLocaleString=function toLocaleString(){return l10n.gettext(String(this));});OM.checkSession=function checkSession(callback){new Ajax.Request(Omniture.URL.suite('Main.SessionTest'),{onComplete:function(response){if(response.status==403){location.reload();}else{callback();}}});}
OM.beta={feedback:'',showFeedback:function(){OM.checkSession(OM.beta.displayFeedback);},displayFeedback:function(){if(!$("beta_feedback_iframe")){var p="?",css,url=Omniture.URL.suite("Main.BetaFeedbackNew");p+="&project=AN";p+="&environment=";for(var name in betaFeedbackData)
{if(betaFeedbackData.hasOwnProperty(name))
{p+=name+": "+betaFeedbackData[name]+", ";}}
css="width: 100%; height: 100%; background-color: transparent; border: none; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 30000;";$(document.body).insert("<iframe frameborder='0' src='"+url+encodeURI(p)+"' id='beta_feedback_iframe' style='"+css+"'/>");window.addEventListener('message',function(e){var beta_feedback_iframe=$("beta_feedback_iframe");if(e.source==beta_feedback_iframe.contentWindow){var data=JSON.parse(e.data);switch(data.type){case"closed":beta_feedback_iframe.remove();window.removeEventListener('message');break;}}});}},hideFeedback:function(){OM.beta.feedback.hide();},centerFeedback:function(){var margin_left=parseInt(document.viewport.getWidth()/2-$("beta_feedback_iframe").getWidth()/2)+"px";$("beta_feedback_iframe").setStyle({marginLeft:margin_left});}}})();Omniture.onPopupReady=function(win){return(window.popupReady=window.popupReady||new YAHOO.util.CustomEvent('popupReady',win)).fire(win);};Omniture.URL={fs:function(command,query_parameters,gateway_url){query_parameters=query_parameters||{};var url=gateway_url||Omniture.Config.SCRIPT_PATH;if(!(Omniture.Config.ACTION_ACCESSOR in query_parameters)){query_parameters[Omniture.Config.ACTION_ACCESSOR]=command;}
url=Omniture.URL.s(url,query_parameters);return url;},f:function(command,query_parameters,gateway_url){query_parameters=query_parameters||{};var url=gateway_url||Omniture.Config.SCRIPT_PATH;if(!(Omniture.Config.ACTION_ACCESSOR in query_parameters)){query_parameters[Omniture.Config.ACTION_ACCESSOR]=command;}
url=Omniture.URL.appendParams(url,query_parameters);return url;},s:function(url,query_parameters){query_parameters=query_parameters||{};var jpj=query_parameters['jpj']||Omniture.Config.jpj;delete query_parameters['jpj'];url=Omniture.URL.appendParams(url,query_parameters);if(url.indexOf('ssSession'===-1)){url+=(url.indexOf('?')==-1)?'?':'&';url+='ssSession='+Omniture.Config.ssSession;url+='&';url+='jpj='+jpj;}
return url;},overrideParams:function(url,query_parameters){var url_parts=url.split("?",2);var params=Omniture.util.objectMerge(Omniture.URL.getParams(url),query_parameters);return Omniture.URL.appendParams(url_parts[0],params);},getParams:function(url){var param_array_names={};var url_parts=url.split("?",2);var w_params=url_parts[1].split("&");var params={};for(var i=0;i<w_params.length;i++){var param_parts=w_params[i].split("=",2);var key=decodeURIComponent(param_parts[0]);var value=decodeURIComponent(param_parts[1]);if(key.indexOf("[]")!=-1){key=key.substr(0,key.indexOf("[]"));if(!(key in param_array_names)){param_array_names[key]=0;}else{param_array_names[key]++;}
params[key+'['+param_array_names[key]+']']=value;}else{params[key]=value;}}
return params;},removeParam:function(url,param){var params=$H(Omniture.URL.getParams(url));params.unset(param);var base_url=url.split("?")[0];var new_url=base_url+'?'+params.toQueryString();return new_url;},removeParams:function(url,params){var allParams=$H(Omniture.URL.getParams(url));for(var i=0;i<params.length;i++){allParams.unset(params[i]);}
var base_url=url.split("?")[0];var new_url=base_url+'?'+allParams.toQueryString();return new_url;},appendParams:function(url,query_parameters){query_parameters=query_parameters||{};var url_parts=url.split('#');url=url_parts[0];var end=url_parts[1]||"";var equals='=',divider='&',first=(url.indexOf('?')<0?'?':'&'),count=0;for(var key in query_parameters){if(typeof query_parameters[key]=='string'||typeof query_parameters[key]=='number'){url+=(count++?divider:first);url+=encodeURIComponent(key);url+=equals;url+=encodeURIComponent(query_parameters[key]);}else{for(var subkey in query_parameters[key]){if(typeof query_parameters[key][subkey]==='function'){continue;}
url+=(count++?divider:first);url+=encodeURIComponent(key)+'['+encodeURIComponent(subkey)+']';url+=equals;url+=encodeURIComponent(query_parameters[key][subkey]);}}}
return url+end;},suite:function(command,query_parameters,gateway_file,append_session_information){if(append_session_information!==false){append_session_information=true;}
gateway_file=gateway_file||'index.html';query_parameters=query_parameters||{};suite_gateway_uri=Omniture.Config.AJAX_SUITE_URL+'/'+gateway_file;if(append_session_information){return Omniture.URL.fs(command,query_parameters,suite_gateway_uri);}else{return Omniture.URL.f(command,query_parameters,suite_gateway_uri);}},fsj:function(command,query_parameters,gateway_url){return Omniture.URL.fs(command,query_parameters||{},gateway_url||Omniture.Config.JSON_GATEWAY||'json.html');},suitej:function(command,query_parameters,gateway_file,append_session_information){return Omniture.URL.suite(command,query_parameters||{},gateway_file||'json/index.html',append_session_information||true);},objectToURL:function(obj){var url="";for(var key in obj){var base_string="&"+encodeURI(key)+"=";if(YAHOO.lang.isArray(obj[key])){array_length=obj[key].length;for(var i=0;i<array_length;i++){url+=base_string+encodeURI(obj[key][i]);}}else{url+=base_string+encodeURI(obj[key]);}}
if(url.length>1){url=url.substring(1);}
return url;},objectToURLStrict:function(obj){var url="";for(var key in obj){var base_string="&"+encodeURIComponent(key)+"=";if(YAHOO.lang.isArray(obj[key])){array_length=obj[key].length;for(var i=0;i<array_length;i++){url+=base_string+encodeURIComponent(obj[key][i]);}}else{url+=base_string+encodeURIComponent(obj[key]);}}
if(url.length>1){url=url.substring(1);}
return url;},reportParamsToUrl:function(obj){var pairs=$H(obj).findAll(function(pair){return pair.value||pair.value===0;});return pairs.collect(function(pair,index){return Omniture.URL._objToQueryString(pair.key,pair.value);}).findAll(function(arg){return!!arg;}).join(';');},_objToQueryString:function(key,value){if(value===null)value='';if(typeof value!='object'){return key+'|'+value.toString();}
if(Object.isArray(value)){var items=value.findAll(function(arg){return arg!==undefined;});if(!items.length)return Omniture.URL._objToQueryString(key,'');var result=items.collect(function(val,index){return Omniture.URL._objToQueryString(key+'['+index+']',val);});}else{var pairs=$H(value).findAll(function(pair){return pair.value!==undefined;});if(!pairs.length)return Omniture.URL._objToQueryString(key,'');var result=pairs.collect(function(pair,index){return Omniture.URL._objToQueryString(key+'['+pair.key+']',pair.value);});}
return result.join(';');},async:function(path,product_id,type){if(!path&&type){var parts={};if(type=='json'){parts=Omniture.URL.parseUri(Omniture.Config.JSON_GATEWAY);}else{parts=Omniture.URL.parseUri(Omniture.Config.URL_GATEWAY);}
path=parts.path;}
return this.getDomain('async',product_id)+path;},getDomain:function(resource_type,sub_domain,server_num){if(!resource_type){return Omniture.Config.OMNITURE_URL;}
if(!sub_domain){sub_domain=Omniture.Config.DEFAULT_SUB_DOMAIN;}
if(!server_num){var OM_CONCURRENCY_MAX=4;server_num=Math.floor(Math.random()*OM_CONCURRENCY_MAX)+1;}
sub_domain+=Omniture.Config.DEFAULT_SUB_DOMAIN_APPEND;var protocol=document.location.protocol+'//';return protocol+sub_domain+'-'+resource_type+'-'+server_num+'.'+Omniture.Config.OMNITURE_DOMAIN_NAME;},mboxUrl:function(url){var hash=url.indexOf('#');var second_part='';if(hash!=-1){second_part=url.substring(hash,url.length);url=url.substring(0,(hash));}
return Omniture.URL.s(url)+second_part;},mboxRedirect:function(url){document.location.href=Omniture.URL.mboxUrl(url);},mboxWindow:function(url){var om_help_window=window.open(Omniture.URL.mboxUrl(url),'om_help','height=768, width=1024, resizable=1, scrollbars=1, toolbar=1, menubar=1, status=1,location=1,directories=1');om_help_window.focus();},switchp:function(pid,redirect_url,redirect_query_parameters){var switch_product_command='Product.SwitchProduct';var switch_product_query_parameters={product_id:pid};if(redirect_url){switch_product_query_parameters.redirect_url=Omniture.URL.appendParams(redirect_url,redirect_query_parameters);}
return Omniture.URL.suite(switch_product_command,switch_product_query_parameters,'index.html',false);},switchps:function(pid,redirect_url,redirect_query_parameters){return Omniture.URL.s(Omniture.URL.switchp(pid,redirect_url,redirect_query_parameters));},switchpf:function(pid,redirect_command,redirect_query_parameters){var switch_product_command='Product.SwitchProduct';var switch_product_query_parameters={product_id:pid};if(redirect_command){switch_product_query_parameters.redirect_command=redirect_command;redirect_query_parameters=redirect_query_parameters||{};for(var i in redirect_query_parameters){switch_product_query_parameters[i]=redirect_query_parameters[i];}}
return Omniture.URL.suite(switch_product_command,switch_product_query_parameters,'index.html',false);},switchpfs:function(pid,redirect_command,redirect_query_parameters)
{return Omniture.URL.s(Omniture.URL.switchpf(pid,redirect_command,redirect_query_parameters));},book:function(dashboard,read_only,query_parameters,append_session_information)
{query_parameters=query_parameters||{};query_parameters.dashboard=dashboard;url=Omniture.URL.suite('Dashboard.Explore',query_parameters,0,append_session_information);if(!read_only){url+='#edit_layout';}
return url;},dashboard:function(dashboard_id,query_parameters,append_session_information)
{query_parameters=query_parameters||{};var prod=0;if(/sc14/.test(location.pathname)){prod='site_catalyst';}
if(/scm/.test(location.pathname)){prod='sem';}
query_parameters.r='Report.GetDashboard';if(!prod){url=Omniture.URL.switchpf('site_catalyst','Report.Dashboard',query_parameters)+'&rp=dashboard|'+dashboard_id;}else{url=Omniture.URL.f('Report.Dashboard',query_parameters,(prod==='sem'?Omniture.Config.SCM_URL+"/index.html":null))+"&rp=dashboard|"+dashboard_id;}
if(append_session_information){url=Omniture.URL.s(url);}
return url;},addReportParameters:function(url,params){var parts=url.match(/(.*?[?&]rp=)(.*)/);if(params=Omniture.URL.reportParamsToUrl(params)){params+=';'};return parts?(parts[1]+params+parts[2]):Omniture.URL.appendParams(url,{rp:params});}};Omniture.URL.parseUri=function(str){var o=Omniture.URL.parseUri.options,m=o.parser[o.strictMode?"strict":"loose"].exec(str),uri={},i=14;while(i--)uri[o.key[i]]=m[i]||"";uri[o.q.name]={};uri[o.key[12]].replace(o.q.parser,function($0,$1,$2){if($1)uri[o.q.name][$1]=$2;});return uri;};Omniture.URL.parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};Omniture.util={MONTH_NAMES:new Array(Omniture.l10n.gettext('January'),Omniture.l10n.gettext('February'),Omniture.l10n.gettext('March'),Omniture.l10n.gettext('April'),Omniture.l10n.gettext('May'),Omniture.l10n.gettext('June'),Omniture.l10n.gettext('July'),Omniture.l10n.gettext('August'),Omniture.l10n.gettext('September'),Omniture.l10n.gettext('October'),Omniture.l10n.gettext('November'),Omniture.l10n.gettext('December')),DAY_NAMES:new Array(Omniture.l10n.gettext('Sunday'),Omniture.l10n.gettext('Monday'),Omniture.l10n.gettext('Tuesday'),Omniture.l10n.gettext('Wednesday'),Omniture.l10n.gettext('Thursday'),Omniture.l10n.gettext('Friday'),Omniture.l10n.gettext('Saturday')),YMD_YEAR_OFFSET:1900,YMD_DATE_LENGTH:7,MILLLISECONDS_PER_DAY:1000*60*60*24,TWO_DIGIT_YEAR_OFFSET:2000,MINIMUM_ANIMATION_TIME:.5,PARENT_ID_TIMEOUT:20,IFRAME_SHIM:null,_loader_images:[],_loader_states:{},validateEmail:function(str)
{var validEmailRegex=/(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6}/;if(validEmailRegex.test(str))
return true;return false;},escapeRegExp:function(text){if(!arguments.callee.sRE){var specials=['/','.','*','+','?','|','(',')','[',']','{','}','\\'];arguments.callee.sRE=new RegExp('(\\'+specials.join('|\\')+')','g');}
return text.replace(arguments.callee.sRE,'\\$1');},isArray:function(obj){return Array.isArray(obj);},preLoadImages:function()
{for(var i=0;i<Omniture.util.preLoadImages.arguments.length;i++)
{var image=new Image(10,10);image.src=Omniture.util.preLoadImages.arguments[i];}},redirect:function(url){window.location=url;return false;},getIFrameDocument:function(iframe)
{var doc=null;if(iframe!=null){if(iframe.contentDocument){doc=iframe.contentDocument;}else if(iframe.contentWindow){doc=iframe.contentWindow.document;}else if(iframe.document){doc=iframe.document;}}
return doc;},disableSelection:function disableSelection(element){if(!(element=$(element))){return;}
if(/input|textarea/i.test(element.nodeName)){element.onselectstart=function(){return false;};}
else{element.onselectstart=function(){return/input|textarea/i.test(window.event.srcElement.nodeName);};}
element.unselectable="on";element.setStyle({MozUserSelect:'-moz-none',WebkitUserSelect:'none',UserSelect:'none'});},getValueOrNull:function(value){var fix_value=value;if(typeof(value)=='undefined'){fix_value=null;}
return fix_value;},removeElement:function(element){return $(element).remove();},resizeWindowToContent:function(){var doc_height=YAHOO.util.Dom.getDocumentHeight();var doc_width=YAHOO.util.Dom.getDocumentWidth();self.resizeTo(doc_width,doc_height);},toggleStackedImage:function(image_id,move_down)
{var image_element=YAHOO.util.Dom.get(image_id);if(!image_element)return;var negative=(move_down)?'':'-';if(YAHOO.util.Dom.getStyle(image_id,'top')=='0px'){YAHOO.util.Dom.setStyle(image_id,'top',negative+(YAHOO.util.Dom.get(image_id).offsetHeight/2)+'px');}else{YAHOO.util.Dom.setStyle(image_id,'top','0px');}},getParentWithId:function(start_element,parent_tag,timeout){var found_element=null;var cur_element=start_element;if(!timeout){timeout=this.PARENT_ID_TIMEOUT;}
var trys=0;while(cur_element!=null&&(cur_element.id==''||cur_element.tagName.toLowerCase()!=parent_tag)&&trys<timeout){trys++;cur_element=cur_element.parentNode;}
if(trys<timeout&&cur_element!=null&&cur_element.id!=''&&cur_element.tagName.toLowerCase()==parent_tag){found_element=cur_element;}
return found_element;},toggleDisplay:function(dom_id,on_state)
{if(!on_state){on_state='block';}
if(YAHOO.util.Dom.getStyle(dom_id,'display')=='none'){if(on_state=="<default>"){on_state='';}
YAHOO.util.Dom.setStyle(dom_id,'display',on_state);}else{YAHOO.util.Dom.setStyle(dom_id,'display','none');}},createIframeShim:function(element,parent,cachelocation,z_index)
{var shimNeeded=false;if(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<7){shimNeeded=true;}
if(YAHOO.env.ua.gecko&&YAHOO.env.ua.gecko<1.9&&navigator.platform.indexOf("Linux")!=-1){shimNeeded=true;}
if(Omniture.Config.excel){shimNeeded=true;}
if(!shimNeeded){return;}
if(typeof(z_index)=='undefined'){z_index=-1;}
parent=parent||element.parentNode;cachelocation=cachelocation||element;var iframe;if(!cachelocation.IFRAME_SHIM){if(!Omniture.IFRAME_SHIM){Omniture.IFRAME_SHIM=document.createElement("iframe");Omniture.IFRAME_SHIM.src='javascript:false;';if(YAHOO.env.ua.ie){Omniture.IFRAME_SHIM.style.filter="alpha(opacity=0)";Omniture.IFRAME_SHIM.frameBorder=0;}
else{Omniture.IFRAME_SHIM.style.opacity="0";}
Omniture.IFRAME_SHIM.style.position="absolute";Omniture.IFRAME_SHIM.style.border="none";Omniture.IFRAME_SHIM.style.margin="0";Omniture.IFRAME_SHIM.style.padding="0";Omniture.IFRAME_SHIM.style.display="none";}
iframe=Omniture.IFRAME_SHIM.cloneNode(false);iframe.id=element.id+'_'+element.tagName.toLowerCase()+'_shim';iframe.style.zIndex=z_index+'';cachelocation.appendChild(iframe);cachelocation.IFRAME_SHIM=iframe;}else{iframe=cachelocation.IFRAME_SHIM;iframe.id=element.id+'_'+element.tagName+'_shim';}
YAHOO.util.Dom.setStyle(iframe,'display','block');Omniture.util.updateIframeShimPosition(element);return iframe;},updateIframeShimPosition:function(element)
{if(element){var iframe=YAHOO.util.Dom.get(element.id+'_'+element.tagName.toLowerCase()+'_shim');if(iframe){var loc=YAHOO.util.Dom.getXY(element);loc[0]=loc[0]-1;loc[1]=loc[1]-1;YAHOO.util.Dom.setXY(iframe,loc);YAHOO.util.Dom.setStyle(iframe,'height',element.offsetHeight+2);YAHOO.util.Dom.setStyle(iframe,'width',element.offsetWidth+2);}}},hideIframeShim:function(element)
{if(element){var iframe=YAHOO.util.Dom.get(element.id+'_'+element.tagName.toLowerCase()+'_shim');if(iframe){YAHOO.util.Dom.setStyle(iframe,'display','none');}}},hasOverflown:function(id)
{var el=document.getElementById(id);if(el){var old_overflow=YAHOO.util.Dom.getStyle(el,'overflow');if(!old_overflow){old_overflow='hidden';}
if(old_overflow=='auto'||old_overflow=='hidden'){var old_height=YAHOO.util.Dom.getStyle(el,'height');var cur_height=el.offsetHeight;YAHOO.util.Dom.setStyle(el,'height','auto');YAHOO.util.Dom.setStyle(el,'overflow','visible');var changed_height=el.offsetHeight;YAHOO.util.Dom.setStyle(el,'height',old_height);}else{var cur_height=el.offsetHeight;el.style['overflow']='auto';var changed_height=el.offsetHeight;}
YAHOO.util.Dom.setStyle(el,'overflow',old_overflow);return cur_height!=changed_height;}
return false;},popwin:function(url,name,width,height,flags){if(height=='')height=500;if(width=='')width=400;var flags_type=typeof(flags);var flags_string='';if(flags_type!='string'){var win_flags=new Omniture.WindowFlags(flags);flags_string=win_flags.toString();}
else{flags_string=flags;}
wName=window.open(url,name+"Window",flags_string+",width="+width+",height="+height);wName.focus();return wName;},onPopupReady:function(popup,scope,func){if(!window.popupReady){window.popupReady=new YAHOO.util.CustomEvent('popupReady',popup);}
window.popupReady.unsubscribe(null,popup);window.popupReady.subscribe(function(type,args,popup){func.apply(scope,arguments)},popup);if(popup.content_ready){window.popupReady.fire(popup);}},attachCallback:function(win,scope,func){win.opener_callback=function(){func.apply(scope,arguments);};},objectMerge:function(){var result={};for(var i=0;i<arguments.length;i++){for(var key in arguments[i]){result[key]=arguments[i][key];}}
return result;},divWriteBuffer:function(widget)
{var html="";var i=0;do{i++;var container_id="write_buffer_"+i;var container=document.getElementById(container_id);}while(container);document.write('<div id="'+container_id+'" style="display:none;">');widget.render();document.write('</div>');container=document.getElementById(container_id);if(container){html=container.innerHTML;container.parentNode.removeChild(container);}
return html;},getMouseCoords:function(e)
{if(document.all){temp_x=e.clientX+(document.documentElement.scrollLeft||document.body.scrollLeft);temp_y=e.clientY+(document.documentElement.scrollTop||document.body.scrollTop);}else{temp_x=e.pageX
temp_y=e.pageY}
return{x:temp_x,y:temp_y}},getParams:function(url)
{var ret={};ret['report']=Omniture.util.getParam(url,"r");ret['params']=Omniture.util.parseParamString(Omniture.util.getParam(url,'rp'));return ret;},getParam:function(url,param)
{if(!url)return"";var val="";var val_only="";var complete_param="&"+param+"=";var param_loc=-1;param_loc=url.indexOf(complete_param)
if(param_loc>=0){val=url.substring(param_loc+complete_param.length);}else{complete_param="?"+param+"=";param_loc=url.indexOf(complete_param);if(param_loc>=0){val=url.substring(param_loc+complete_param.length);}}
if(val.length){if(val.indexOf("&")>0){val_only=val.substring(0,val.indexOf("&"));}
if(!val_only){val_only=val;}}
return val_only;},parseParamString:function(param_string)
{var ret={};param_string=decodeURIComponent(param_string);var param_list=param_string.split(";");if(!param_list)return ret;for(var i=0;i<param_list.length;i++){var pair=param_list[i].split("|");if(pair.length!=2)continue;ret[pair[0]]=Omniture.util.unescapeParamString(pair[1]);}
return ret;},escapeParamString:function(param_string)
{var tmp=param_string.replace(/\|/g,"{pipe}");tmp=tmp.replace(/;/g,"{semicolon}");tmp=tmp.replace(/&/g,"{ampersand}");tmp=tmp.replace(/\?/g,"{questionmark}");tmp=tmp.replace(/=/g,"{equals}");return tmp;},unescapeParamString:function(param_string)
{var tmp=param_string.replace(/{pipe}/g,"|");tmp=tmp.replace(/{semicolon}/g,";");tmp=tmp.replace(/{ampersand}/g,"%26");tmp=tmp.replace(/{questionmark}/g,"%3F");tmp=tmp.replace(/{equals}/g,"%3D");return tmp;},pad:function(value,character,count)
{var padText="";var padCount=count-value.toString().length;for(var i=0;i<padCount;i++)
padText+=character;return padText+value;},padRight:function(value,character,count)
{var padText=value;var padCount=count-value.toString().length;for(var i=0;i<padCount;i++)
padText+=character;return padText;},log:function(msg,type)
{try{omni_logger.show();YAHOO.log(msg,type);}
catch(err){}},execScript:function(script){return window.execScript?window.execScript(script):eval.call(window.parent,script);},attachCss:function(css)
{try{var css_tag=document.createElement("style");css_tag.setAttribute("type","text/css");if(YAHOO.env.ua.ie){css_tag.styleSheet.cssText=css;}else{css_tag.appendChild(document.createTextNode(css));}
var node=document.getElementsByTagName('head')[0]||document.getElementsByTagName('*')[0];node.appendChild(css_tag);}catch(e){}},getTagContents:function(tag,str)
{var found_tags=[];if(str){str=str.replace(/(\r?\n|\r){1,2}/g,' ');var regex=new RegExp("<"+tag+"([^>]*)>(.*)</"+tag+">","gim");var info=regex.exec(str);while(info){found_tags.push({attributes:info[1],inner_html:info[2]});info=regex.exec(str);}}
return found_tags;},objToStr:function(obj)
{var result="";for(var key in obj){result+="key:"+key+" ==> "+obj[key]+"\n";}
return result;},inArray:function(haystack,needle)
{var rtn=false;if(typeof(haystack=="object")){for(var i=0;i<haystack.length&&!rtn;i++){if(haystack[i]==needle){rtn=true;}}}
return rtn;},arraySearch:function(haystack,needle)
{var index;for(index in haystack){if(haystack[index]==needle){return index;}}
return-1;},clone:function(obj)
{if(!obj||typeof(obj)!='object'){return obj;}
if(obj.clone){return obj.clone();}
var new_obj={};for(var key in obj){new_obj[key]=Omniture.util.clone(obj[key]);}
return new_obj;},isValidJSON:function(response){if(response===null){return false;}
if(!response.length){return false;}
if(response.substring(0,1)=="{"&&response.substring(response.length-1)=="}"){return true;}
if(response.substring(0,2)==" {"&&response.substring(response.length-1)=="}"){return true;}
if(response.substring(0,1)=="["&&response.substring(response.length-1)=="]"){return true;}
if(response=='true'||response=='false'){return true;}
return false;},createHiddenDiv:function(template_element)
{var tmp=null;if(template_element){tmp=template_element.cloneNode(true);tmp.style.height="auto";tmp.style.overflow='hidden';tmp.id=tmp.id+'_'+(new Date()).getTime();}else{tmp=document.createElement("div");}
tmp.style.visibility="hidden";if(template_element){template_element.appendChild(tmp);}else{document.body.appendChild(tmp);}
return tmp;},getContentHeight:function(html,template_element)
{var tmp=Omniture.util.createHiddenDiv(template_element);tmp.innerHTML=html;var tmp_height=tmp.offsetHeight;tmp.parentNode.removeChild(tmp);return tmp_height;},calculateAnimateSpeed:function(size)
{var speed=(size/1000)+.2;if(speed<this.MINIMUM_ANIMATION_TIME){speed=this.MINIMUM_ANIMATION_TIME;}
return speed;},getRandId:function(prefix)
{var i=0;do{i++;var dom_id=prefix+'_'+i;}while(document.getElementById(dom_id));return dom_id;},renderLoading:function(dom_id,final_height,final_width,force_default_size)
{var dom_el;if(typeof dom_id=='string'){dom_el=document.getElementById(dom_id);}else{dom_el=dom_id;}
if(!dom_el){return false;}
var height=dom_el.offsetHeight-2;var width=dom_el.offsetWidth-2;final_height=final_height||height;final_width=final_width||width;var image_height="32";var image_width="32";var multiplier=1.5;if(final_height<image_height*multiplier||final_width<image_width*multiplier){var measurement_to_use=final_width;if(final_height<final_width){measurement_to_use=final_height;}
image_height=image_width=measurement_to_use/image_height*image_height;}
var left=(final_width/2)-(image_width/2);var top=(final_height/2)-(image_height/2);if(force_default_size){image_height='32';image_width='32';}
var div_style='height: '+height+'px; width: '+width+'px; position: relative;';var img_style='top: '+top+'px; left: '+left+'px; position: absolute;';var html='<div style="'+div_style+'"><img style="'+img_style+'" src="'+Omniture.Config.STATIC_URL+'/images/blackcat/wait_32.gif" height="'+image_height+'px" width="'+image_width+'px" /></div>';dom_el.innerHTML=html;return true;},toggleLoader:function(id,force_state,overlay_opacity,overlay_bg_img)
{var d_div=null;if(typeof id=='string'){d_div=document.getElementById(id);}else{d_div=id;}
if(!overlay_opacity){overlay_opacity='.8';}
if(!d_div)return;var img_div=null;var over_div=null;var image_height=37;var image_width=37;var region=YAHOO.util.Dom.getRegion(id);if(!region){region={};region['bottom']=0;region['top']=0;region['right']=0;region['left']=0;}
var new_top=(((region['bottom']-region['top'])/2))-(image_height/2);var new_left=(((region['right']-region['left'])/2))-(image_width/2);if(!this._loader_images[id]){var image_name=Omniture.Config.STATIC_URL+'/images/blackcat/wait_32.gif';img_div=document.createElement('div');over_div=document.createElement('div');var img=document.createElement('img');img.src=image_name;img_div.appendChild(img);img_div.style.display='none';img_div.style.position='absolute';img_div.style.zIndex=d_div.style.zIndex+1;d_div.appendChild(img_div);over_div.style.position='absolute';over_div.style.top='-1px';over_div.style.left='-1px';over_div.style.backgroundColor='white';if(overlay_bg_img){over_div.style.backgroundImage="url("+overlay_bg_img+")";over_div.style.backgroundRepeat='no-repeat';}
YAHOO.util.Dom.setStyle(over_div,'opacity',overlay_opacity);d_div.appendChild(over_div);this._loader_images[id]={'image':img_div,'overlay':over_div};}else{img_div=this._loader_images[id].image;over_div=this._loader_images[id].overlay;d_div.appendChild(img_div);d_div.appendChild(over_div);}
if((img_div.style.display=='none'&&force_state!=1)||force_state==2){over_div.style.width=d_div.offsetWidth;over_div.style.height=d_div.offsetHeight;over_div.style.width=(region['right']-region['left'])+"px";over_div.style.height=(region['bottom']-region['top'])+"px";img_div.style.top=new_top+'px';img_div.style.left=new_left+'px';img_div.style.display='block';over_div.style.display='block';this._loader_states[id]=2;}else{img_div.style.display='none';over_div.style.display='none';this._loader_states[id]=1;}},getLoaderState:function(id)
{var rtn=null;if(this._loader_states[id]){rtn=this._loader_states[id];}
return rtn;},setFooterPosition:function(footer_dom_id)
{if(Omniture.util.isIE6()){var footer=YAHOO.util.Dom.get(footer_dom_id);YAHOO.util.Dom.setStyle(footer,"top",document.body.offsetHeight-footer.offsetHeight);}},Date:{format:function(in_date,format)
{if(!in_date.valueOf())
return'&nbsp;';return format.replace(/(yyyy|yy|mmmm|mmm|mm|dddd|ddd|dd|hh|nn|ss|a)/gi,function($1)
{switch($1.toLowerCase())
{case'yyyy':return in_date.getFullYear();case'yy':return(in_date.getFullYear()+'').substr(2,2);case'mmmm':return Omniture.util.MONTH_NAMES[in_date.getMonth()];case'mmm':return Omniture.util.MONTH_NAMES[in_date.getMonth()].substr(0,3);case'mm':return Omniture.util.pad((in_date.getMonth()+1),'0',2);case'dddd':return Omniture.util.DAY_NAMES[in_date.getDay()];case'ddd':return Omniture.util.DAY_NAMES[in_date.getDay()].substr(0,3);case'dd':return Omniture.util.pad(in_date.getDate(),'0',2);case'hh':return Omniture.util.pad(((h=in_date.getHours()%12)?h:12),'0',2);case'ii':return Omniture.util.pad(in_date.getMinutes(),'0',2);case'ss':return Omniture.util.pad(in_date.getSeconds(),'0',2);case'a':return in_date.getHours()<12?'a':'p';}});},getYMD:function(in_date){return(in_date.getFullYear()-Omniture.util.YMD_YEAR_OFFSET)*10000+in_date.getMonth()*100+in_date.getDate();},getRangeYMD:function(start_date,end_date){var range_ymd=null;var days_diff=end_date.getDiffInDays(start_date);range_ymd=start_date.toYMD()+'D'+(days_diff+1);return range_ymd;},parseYMD:function(ymd_date){date=null;try
{if(ymd_date!=null&&ymd_date.toString().length<=Omniture.util.YMD_DATE_LENGTH){var text_date=ymd_date.toString();var full_date=Omniture.util.padRight(text_date,'0',Omniture.util.YMD_DATE_LENGTH);var day=full_date.substr(full_date.length-2,2);var month=full_date.substr(full_date.length-4,2);var year=full_date.substr(0,full_date.length-4);var dayNum=parseInt(day);var monthNum=parseInt(month);var yearNum=parseInt(year)+Omniture.util.YMD_YEAR_OFFSET;if(monthNum==0){date=OmniDate_createInstance(yearNum,monthNum,dayNum);date=date.getStartOfCalMonth();}
if(dayNum==0){dayNum=1;}
date=OmniDate_createInstance(yearNum,monthNum,dayNum);if(text_date.length==3){date=date.getStartOfCalYear();}
else if(text_date.length==5){date=date.getStartOfCalMonth();}}}
catch(err){}
return date;},getDatesFromYMD:function(ymd_date){dates=null;if(ymd_date!=null){try
{var range_days=-1;var text_date=ymd_date.toString();var d_index=text_date.indexOf('D');var m_index=text_date.indexOf('M');var w_index=text_date.indexOf('W');if(d_index>0){text_date=ymd_date.substr(0,d_index);var days=ymd_date.substr(d_index);range_days=parseInt(days);dates=new Object();dates.start_date=this.parseYMD(text_date);dates.end_date=this.parseYMD(text_date);dates.end_date.setDate(dates.end_date.getDate()+range_days);}
else if(m_index>0){text_date=ymd_date.substr(0,m_index);dates=new Object();dates.start_date=this.parseYMD(text_date);dates.end_date=dates.start_date.getEndOfCalQuarter();}
else if(w_index>0){text_date=ymd_date.substr(0,w_index);dates={};dates.start_date=this.parseYMD(text_date);dates.end_date=this.parseYMD(text_date);dates.end_date.setDate(dates.end_date.getDate()+6);}
else if(text_date.length==3){dates=new Object();dates.start_date=this.parseYMD(text_date);dates.end_date=dates.start_date.getEndOfCalYear();}
else if(text_date.length==5){dates=new Object();dates.start_date=this.parseYMD(text_date);dates.end_date=dates.start_date.getEndOfCalMonth();}
else{dates=new Object();dates.start_date=this.parseYMD(text_date);dates.end_date=this.parseYMD(text_date);}}
catch(err){alert('Adobe Date Error: Invalid Date Format!'+err);}}
return dates;},getDaysInMonth:function(month_date){var dd=new Date(month_date.getFullYear(),month_date.getMonth()+1,0);return dd.getDate();},getDiffInDays:function(date_1,date_2){return Math.floor((date_1.getTime()-date_2.getTime())/Omniture.util.MILLLISECONDS_PER_DAY);},parseLocalized:function(date_text){switch(Omniture.Config.locale){case'en_US':return Omniture.util.Date.parse(date_text);break;default:return Omniture.util.Date.parse(date_text.replace(/(\d+)-(\d+)-(\d+)/,"$2/$3/$1"));break;}},parse:function(date_text){var parsed_date=null;if(!date_text)return null;var date_parts=date_text.split('/');if(date_parts.length==2||date_parts.length==3){var yearText='';if(date_parts.length==3){yearText=date_parts[2];}
else{yearText=(OmniDate_createInstance()).getFullYear()+'';}
var month=Number(date_parts[0])-1;var day=Number(date_parts[1]);var year=Number(yearText);if(!isNaN(month)&&!isNaN(day)&&!isNaN(year)&&(yearText.length==2||yearText.length==4)){if(yearText.length==2){year+=Omniture.util.TWO_DIGIT_YEAR_OFFSET;}
parsed_date=OmniDate_createInstance(year,month,day);var standard_date=parsed_date.getStandardDate();if(standard_date.getFullYear()!=year||standard_date.getMonth()!=month||standard_date.getDate()!=day){parsed_date=null;}}}
return parsed_date;}},checkGranularity:function(from,to,gran){if(gran=='none'){return Omniture.l10n.gettext('The date range selected is not large enough for the target\'s granularity.');}
tdiff=(to.getTime()/1000)-(from.getTime()/1000);if(tdiff<0){return Omniture.l10n.gettext("Please check the dates. The 'From' date must be before the 'To' date.");}
var d1=from.getDate();var d2=to.getDate();var m1=from.getMonth();var m2=to.getMonth();var y1=from.getFullYear();var y2=to.getFullYear();if(d1==d2&&m1==m2&&y1==y2&&(gran!='hour')&&(gran!='day')&&(gran!='all')){return Omniture.l10n.gettext("The granularity you selected is not available for the dates you are viewing");}
if(m1==m2&&y1==y2&&gran=='month'){return Omniture.l10n.gettext("Please check the selected dates and granularity. 'Month' is not a valid granularity option for the specified time period.");}
if(m1==m2&&y1==y2&&gran=='quarter'){return Omniture.l10n.gettext("Please check the selected dates and granularity. 'Quarter' is not a valid granularity option for the specified time period.");}
if(y1==y2&&gran=='year'){return Omniture.l10n.gettext("Please check the selected dates and granularity. 'Year' is not a valid granularity option for the specified time period.");}
if(gran=='hour'&&(tdiff/86400>14)){return Omniture.l10n.gettext("Please check the selected dates and granularity. 'Hour' granularity can be selected for a maximum of 14 days.");}
if(gran=='day'&&(tdiff/86400/365>2)){return Omniture.l10n.gettext("Please check the selected dates and granularity. 'Day' granularity can be selected for a maximum of two years.");}},Period:{getYMD:function(start_date,period_type){var ymd_period=null;var standard_date=start_date.getStandardDate();switch(period_type){case'year':ymd_period=standard_date.getFullYear()-Omniture.util.YMD_YEAR_OFFSET;break;case'quarter':ymd_period=(standard_date.getFullYear()-Omniture.util.YMD_YEAR_OFFSET)*10000+standard_date.getMonth()*100+standard_date.getDate()+"M3";break;case'month':ymd_period=(standard_date.getFullYear()-Omniture.util.YMD_YEAR_OFFSET)*100+standard_date.getMonth();break;case'week':ymd_period=start_date.toYMD()+'D7';break;case'day':ymd_period=start_date.toYMD();break;}
return ymd_period;},getFromRange:function(start_date,end_date){var period=null;if(start_date!=null&&end_date!=null){var days_diff=end_date.getDiffInDays(start_date);if(days_diff>350&&days_diff<380){if(start_date.valueOf()==start_date.getStartOfCalYear().valueOf()&&end_date.valueOf()==end_date.getEndOfCalYear().valueOf()){period=new YAHOO.omniture.Period(start_date,end_date,'year');}}
else if(days_diff>80&&days_diff<100){if(start_date.valueOf()==start_date.getStartOfCalQuarter().valueOf()&&end_date.valueOf()==end_date.getEndOfCalQuarter().valueOf()){period=new YAHOO.omniture.Period(start_date,end_date,'quarter');}}
else if(days_diff>=27&&days_diff<=35){if(start_date.valueOf()==start_date.getStartOfCalMonth().valueOf()&&end_date.valueOf()==end_date.getEndOfCalMonth().valueOf()){period=new YAHOO.omniture.Period(start_date,end_date,'month');}}
else if(days_diff==6){if(start_date.getDay()==start_date.getFirstDayOfWeek()&&end_date.getDay()==(end_date.getFirstDayOfWeek()+6)){period=new YAHOO.omniture.Period(start_date,end_date,'week');}}
else if(days_diff==0){period=new YAHOO.omniture.Period(start_date,end_date,'day');}}
return period;},getTitle:function(start_date,end_date,period_type,is_short_title){var title='';switch(period_type){case'year':title=start_date.toString('yyyy',true);break;case'quarter':if(is_short_title){title=start_date.toString('mmm. yyyy')+' - '+end_date.toString('mmm. yyyy');}
else{title=start_date.toString('mmm. yyyy')+' - '+end_date.toString('mmm. yyyy');}
break;case'month':title=start_date.toString('mmmm yyyy',true);break;case'week':if(is_short_title){title=start_date.toString('d mmm. yyyy')+' - '+end_date.toString('d mmm. yyyy');}
else{title=start_date.toString('ddd. d mmm. yyyy')+' - '+end_date.toString('ddd. d mmm. yyyy');}
break;case'day':if(is_short_title){title=start_date.toString('d mmm. yyyy');}
else{title=start_date.toString('ddd. d mmm. yyyy');}
break;}
return title;}},setFormElementsProperty:function(dom_el,prop,value){var tag_names=['select','input','textbox'];for(var i=0;i<tag_names.length;i++){var elements=dom_el.getElementsByTagName(tag_names[i]);for(var j=0;j<elements.length;j++){if(value){elements[j].setAttribute(prop,value);}else{elements[j].removeAttribute(prop);}}}},formToObject:function(form){var inputs={};if(form.elements){for(var i=0;i<form.elements.length;i++){var element=form.elements[i];var disabled=element.disabled;var name=element.name;var value=element.value;if(!form.elements[i].disabled&&name){switch(element.type){case'select-one':case'select-multiple':if(element.options.length>0){inputs[name]=element.options[element.selectedIndex].value;}
break;case'radio':if(element.checked){inputs[name]=value;}
break;case'checkbox':if(element.checked){if(name.indexOf('[]')!=-1){if(!inputs[name]){inputs[name]=[];}
inputs[name].push(value);}
else{inputs[name]=value;}}
break;default:inputs[name]=value;}}}}
return inputs;},objectToForm:function(obj,form,force){if(obj&&form){if(form.elements){var found_elements={};for(var i=0;i<form.elements.length;i++){var element=form.elements[i];var name=element.name;if(name&&obj[name]!=undefined){found_elements[name]=true;var value=obj[name];switch(element.type){case'select-one':case'select-multiple':for(var j=0;j<element.options.length;j++){if(element.options[j].value==value){element.options[j].selected=true;}}
break;case'radio':case'checkbox':if(element.value==value){element.checked=true;}
break;default:element.value=value;}}}
if(force){for(var el_name in obj){if(!found_elements[el_name]){var new_input=document.createElement('input');new_input.type="hidden";new_input.name=el_name;new_input.value=obj[el_name];form.appendChild(new_input);}}}}}},changePageId:function(page_id){Omniture.Config.page_id=page_id;},Ruler:Class.create({initialize:function initialize(o){o=o||{};$(document.body||document.documentElement).insert((this.ruler=new Element('div')).setStyle({position:'absolute',top:'-100%',left:'-100%',whiteSpace:'nowrap',fontFamily:o.fontFamily||'',fontSize:o.fontSize||'',fontWeight:o.fontWeight||'',fontStyle:o.fontStyle||''}));return this;},measure:function measure(text){this.ruler.innerHTML=text;return this.ruler.offsetWidth;},middleTruncate:function middleTruncate(text,width,joiner){var text=OM.Security.HtmlDecode(text),value=text,joiner=joiner||'...',i=joiner.length,x,l=text.length,m=l>>1;while(++i<=l&&this.measure(value)>width){x=m+(i>>1);value=text.substr(0,x-i)+joiner+text.substr(x);}
return value;},rightTruncate:function rightTruncate(text,width,joiner){var text=OM.Security.HtmlDecode(text),value=text,joiner=joiner||'...',i=text.length-joiner.length;while(--i>=0&&this.measure(value)>width){value=text.substr(0,i)+joiner;}
return value;}}),Searcher:Class.create({initialize:function initialize(o){o=o||{};this.no_match=o.no_match||'no-match';this.text_tag=o.text_tag||'a';this.item_tag=o.item_tag||'li';this.subm_tag=o.subm_tag||'ul';this.subm_att=o.subm_att||'submenu';this.res_div=o.res_div||null;return this.setSearchText(o.text).setHilightTag(o.hl_tag);},setSearchText:function setSearchText(text){text=(text||'').replace(/\s+/g,' ').strip();if(text!==this.search_txt){this.search_txt=text;this.search_exp=text&&new RegExp('(.*?)('+OM.util.escapeRegExp(text).split(' ').join(')(.*?)(')+')(.*)','i');}
return this;},setHilightTag:function setHilightTag(tag){tag=tag||'em';this.hl_open='<'+tag+'>';this.hl_close='</'+tag+'>';this.rm_hl_exp=new RegExp('<'+tag+'>|</'+tag+'>','ig');return this;},clear:function clear(items,recur){if(!recur&&this.res_div){this.res_div.hide().update();}
var i,l,item,a,count=0,scrub=!this.res_div;for(i=0,l=items.length;i<l;++i){if(!(item=items[i])||!(a=item.down(this.text_tag))){if(item&&this.res_div){item.removeClassName(this.no_match);}
continue;}
submenu=(item[this.subm_att]=item[this.subm_att]||item.down(this.subm_tag));item.removeClassName(this.no_match);if(scrub){a.innerHTML=a.innerHTML.replace(this.rm_hl_exp,'');}
if(submenu){count+=this.clear(submenu.childElements(),true);}
++count;}
return count;},search:function search(items,nohide,path){if(!path&&this.res_div){this.res_div.update().show();}
var i,l,item,a,html,matches,matched,k,n,count=0,submenu,subcount=0,text,encode=OM.Security.HtmlEncode,decode=OM.Security.HtmlDecode,open=this.hl_open,close=this.hl_close,subm=this.subm_att;for(i=0,l=items.length;i<l;++i){if(!(item=items[i])||!(a=item.down(this.text_tag))){if(item&&this.res_div){item.addClassName(this.no_match);}
continue;}
matches=(text=decode(html=a.innerHTML.replace(this.rm_hl_exp,''))).match(this.search_exp);if(matched=!!(matches&&matches.length)){html='';for(k=1,n=matches.length;k<n;++k){if(k%2){html+=encode(matches[k]);}
else{html+=open+encode(matches[k])+close;}}
++count;}
if(this.res_div){submenu=(item[subm]=item[subm]||item.down(this.subm_tag));path=path?(path+' > '+text):text;if(matched&&!submenu){var node=(new Element(this.item_tag)).insert(item.innerHTML);node.down(this.text_tag).innerHTML=html;if(item.title){node.title=item.title;}else{node.title=path;}
this.res_div.insert(node);}
if(submenu){count+=this.search(submenu.childElements(),matched||nohide,path);}
item.addClassName(this.no_match);}else{a.innerHTML=html;item.removeClassName(this.no_match);if(submenu=(item[subm]=item[subm]||item.down(this.subm_tag))){count+=(subcount=this.search(submenu.childElements(),matched||nohide,true));if(!matched&&!subcount){item.addClassName(this.no_match);}}else if(!matched&&!nohide){item.addClassName(this.no_match);}}}
return count;},match:function match(text){var html='',matches,matched,k,n,open=this.hl_open,close=this.hl_close;matches=text.match(this.search_exp);if(matched=!!(matches&&matches.length)){for(k=1,n=matches.length;k<n;++k){if(k%2){html+=matches[k].escapeHTML();}
else{html+=open+matches[k].escapeHTML()+close;}}}
return html;},run:function run(items){return this.search_txt?this.search(items):this.clear(items);}})};Omniture.Control={};Omniture.Model={};Omniture.control={};Omniture.control.RenameControl=function(dom_id,max_length){this.init(dom_id,max_length);};Omniture.control.RenameControl.prototype={_max_length:null,_previous_name:null,init:function(dom_id,max_length){this._max_length=max_length;this._dom_id=dom_id;this._el=YAHOO.util.Dom.get(this._dom_id);this._input=null;},setSaveCallback:function(obj,func){this._saveCallback=function(input){obj[func](input)};},render:function(){this._previous_name=this._el.innerHTML;this._input=document.createElement('input');this._input.value=this._el.innerHTML;if(this._max_length)
{this._input.setAttribute('maxLength',this._max_length);}
this._el.parentNode.replaceChild(this._input,this._el);this._input.focus();YAHOO.util.Event.addListener(this._input,"keydown",this.onKeyDown,this,true);YAHOO.util.Event.addListener(this._input,"blur",this.onBlur,this,true);},onKeyDown:function(e)
{var key_pressed=e.keyCode;var rename_dom_textbox=null;if(e.target){rename_dom_textbox=e.target;}else if(e.srcElement){rename_dom_textbox=e.srcElement;}
if(key_pressed==13||key_pressed==9||key_pressed==27){this.save(rename_dom_textbox);}},onBlur:function(e)
{var rename_dom_textbox=null;if(e.target){rename_dom_textbox=e.target;}else if(e.srcElement){rename_dom_textbox=e.srcElement;}
this.save(rename_dom_textbox);},save:function(input)
{if(input){if(input.value==""||input.value==" ")
{alert(Omniture.l10n.gettext('A title must be specified!'));this._el.innerHTML=this._previous_name;input.parentNode.replaceChild(this._el,input);}
else
{this._el.innerHTML=input.value;if(input.parentNode)
{input.parentNode.replaceChild(this._el,input);if(this._saveCallback)
{this._saveCallback(input);}}}}}};Omniture.control.singleSelectList=function(i_list,selected_item){this.init(i_list,selected_item);};Omniture.control.singleSelectList.prototype={item_list:[],disabled_items:[],selected_item:"",state_list:{},init:function(i_list,selected_item)
{this.setItemList(i_list);this.disabled_items=[];this.selected_item='';this.state_list={enabled:"",disabled:"",selected:""};if(selected_item){this.setSelectedItem(selected_item);}
this.updateStyles(this);},setItemList:function(item_list)
{if(this.item_list.length){YAHOO.util.Event.removeListener(this.item_list,"click",this.handleClick);}
this.item_list=item_list;for(var i=0;i<this.item_list.length;i++){var el=YAHOO.util.Dom.get(item_list[i]);if(el){YAHOO.util.Event.addListener(el,"click",this.handleClick,this);}}},handleClick:function(e,obj)
{if(!Omniture.util.inArray(obj.disabled_items,this.id)){var old_selected_item=obj.selected_item;var ret=true;if(obj.callback&&!Omniture.util.inArray(obj.disabled_items,this.id)&&this.id!=old_selected_item){ret=obj.callback.call(this);}
if(ret){obj.setSelectedItem(this.id);obj.updateStyles();}}},updateStyles:function()
{for(var i=0;i<this.item_list.length;i++){var item=document.getElementById(this.item_list[i]);if(item){if(Omniture.util.inArray(this.disabled_items,this.item_list[i])){item.className=this.state_list['disabled'];}else if(this.item_list[i]==this.getSelectedItem()){item.className=this.state_list['selected'];}else{item.className=this.state_list['enabled'];}}}},setStateStyle:function(state,class_name)
{this.state_list[state]=class_name;},setSelectedItem:function(item)
{this.selected_item=item;},getSelectedItem:function()
{return this.selected_item;},setDisabled:function(disabled_items)
{this.disabled_items=new Array();if(typeof(disabled_items)=="object"){for(var i=0;i<disabled_items.length;i++){this.disabled_items[this.disabled_items.length]=disabled_items[i];}}else{this.disabled_items[this.disabled_items.length]=disabled_items;}},setCallback:function(callback)
{this.callback=callback;}};Omniture.control.Paginator=function(id,page_jump_distance,current_page,rows_per_page,max_rows){this.init(id,page_jump_distance,current_page,rows_per_page,max_rows);};Omniture.control.Paginator.prototype={_cur_page:1,_page_jump_distance:9,_max_pages:0,_page_obj:null,_page_obj_id:'',_err:'',_selected_class:'',_available_class:'',click_callback:null,_rows_per_page:50,_max_rows:0,_row_var_name:'row',init:function(id,page_jump_distance,current_page,rows_per_page,max_rows)
{if(page_jump_distance){this._page_jump_distance=page_jump_distance}
if(current_page){this._cur_page=current_page;}
this.setRowsPerPage(rows_per_page);this.setMaxRows(max_rows);this._page_obj=document.getElementById(id);if(this._page_obj){this._page_obj_id=id;this.render();}else{this._setError('Unable to find object '+id);}},getMaxPages:function(max_rows,rows_per_page)
{return Math.ceil(max_rows/rows_per_page);},setMaxRows:function(max_rows)
{if(max_rows>=0){this._max_rows=max_rows;this._max_pages=this.getMaxPages(max_rows,this._rows_per_page);}},setRowsPerPage:function(rows_per_page,skip_processing)
{rows_per_page=parseInt(rows_per_page);if(rows_per_page>0){this._rows_per_page=rows_per_page;}
if(!skip_processing){this.processStateChange();}},getRowsPerPage:function()
{return this._rows_per_page;},setCurrentPage:function(page_num,render,skip_processing)
{if(typeof(page_num)=='string'){page_num=parseInt(page_num);}
if(page_num<1||!page_num){page_num=1;}
if(this._max_pages&&page_num>this._max_pages){page_num=this._max_pages;}
if(page_num==this._cur_page)return;this._cur_page=page_num;if(render){this.render();}
if(!skip_processing){this.processStateChange();}},getCurrentPage:function()
{return this._cur_page;},incrementPage:function()
{this.setCurrentPage(this.getCurrentPage()+1,true);},decrementPage:function()
{this.setCurrentPage(this.getCurrentPage()-1,true);},_setError:function(err)
{this._err=err;},setSelectedClass:function(classname)
{this._selected_class=classname;},setAvailableClass:function(classname)
{this._available_class=classname;},render:function()
{var number_list='';var id_list=new Array();var start_page=this._cur_page-this._page_jump_distance;if(start_page<1){start_page=1;}
var end_page=this._cur_page+this._page_jump_distance;if(this._max_pages&&end_page>this._max_pages){end_page=this._max_pages;}
for(var i=start_page;i<=end_page;i++){var classname=this._available_class;if(i==this._cur_page){classname=this._selected_class;}
var tmp_id=this.getIdFromPageNum(i);id_list[id_list.length]=tmp_id;number_list=number_list+'<li id="'+tmp_id+'" class="'+classname+'">'+i+'</li>';}
if(number_list==''){this._setError('Unable to generate a valid page list');}
this._page_obj.innerHTML=number_list;YAHOO.util.Event.addListener(id_list,'click',this.processClick,this);},getIdFromPageNum:function(page_num)
{return this._page_obj_id+'_'+page_num;},getPageNumFromId:function(id)
{return id.substr(this._page_obj_id.length+1);},processClick:function(e,obj)
{var new_page_num=obj.getPageNumFromId(this.id);if(new_page_num==obj.getCurrentPage())return;obj.setCurrentPage(new_page_num,true);},processStateChange:function()
{if(this.click_callback&&typeof(this.click_callback)=='function'){var first_row=this.getFirstRowOfPage(this.getCurrentPage());this.click_callback.call(this,first_row,this);}},getFirstRowOfPage:function(page_num)
{return((page_num-1)*this._rows_per_page)+1;},getPageFromFirstRow:function(first_row)
{return Math.floor(first_row/this._rows_per_page)+1;},setCallback:function(callback)
{this.click_callback=callback;},getRowVar:function()
{return this._row_var_name;},setRowVar:function(row_var)
{this._row_var_name=row_var;}};Omniture.validation={tracking:{_field_tracking:new Array(),incrementInstances:function(field_name){if(this._field_tracking[field_name]==null)
{this._field_tracking[field_name]={instances:1,valids:0,invalids:0};}
else
{this._field_tracking[field_name].instances++;}},resetInstances:function(field_name){this._field_tracking[field_name].instances=0;},incrementValidated:function(field_name,is_valid){if(is_valid){this._field_tracking[field_name].valids++;}
else{this._field_tracking[field_name].invalids++;}},resetValidated:function(field_name){this._field_tracking[field_name].valids=0;this._field_tracking[field_name].invalids=0;},isAllValid:function(field_name){var is_valid=false;if(this._field_tracking[field_name].instances==this._field_tracking[field_name].valids){is_valid=true;}
return is_valid;},isAllExecuted:function(field_name){var is_exec=false;if(this._field_tracking[field_name].instances==(this._field_tracking[field_name].valids+this._field_tracking[field_name].invalids)){is_exec=true;}
return is_exec;}}};Omniture.WindowFlags=function(set_flags){this._init(set_flags);};Omniture.WindowFlags.prototype={location:false,menubar:false,resizable:true,scrollbars:true,status:false,toolbar:false,_init:function(set_flags){if(set_flags!==null){for(flag in set_flags){this[flag]=set_flags[flag];}}},toString:function(){var param_string='',flag;for(flag in this){if(typeof this[flag]!=='function'){param_string+=flag+'='+(this[flag]?'1':'0')+', ';}}
if(param_string.length>2){param_string=param_string.substr(0,param_string.length-2);}
return param_string;}};Omniture.user={setPersistentAttribute:function setPersistentAttribute(attribute,value){return new Ajax.Request(Omniture.URL.suite('User.SetPersistentAttribute',{attribute:attribute,value:value}));},setSessionAttribute:function setSessionAttribute(attribute,value){return new Ajax.Request(Omniture.URL.suite('User.SetSessionAttribute',{attribute:attribute,value:value}));}};Omniture.JSONP=(function(){var counter=0,callbacks={};function request(url,fn){var jsonp='fn'+(--counter),head,script;callbacks[jsonp]=function(o){fn.call(o);delete callbacks[jsonp];head.removeChild(script);};url+=((url.indexOf('?')<0)?'?':'&')+'jsonp=OM.JSONP.fn.'+jsonp;head=document.getElementsByTagName('head')[0]||document.documentElement;script=document.createElement('script');script.src=url;script.defer=(script.async=true);head.appendChild(script);}
return{request:request,fn:callbacks};})();Omniture.SAML={request:null,fallback_url:'',assertIdentity:function assertIdentity(integration,fallback_url,extras){var url=OM.URL.suite('Product.GetSAML',{integration:integration,error_url:fallback_url});if(typeof extras==='object'){for(var i in extras){url+='&'+i+'='+extras[i];}}
this.fallback_url=fallback_url;this.request=new Ajax.Request(url,{method:'get',onSuccess:this.submitAssertion.bind(this),onFailure:this.handleFailure.bind(this)});},submitAssertion:function submitAssertion(result){var tnt_target_url_field=null;var pieces=result.responseText.split('|');if(pieces.length<2){this.handleFailure(result);}
else{for(var i=2;i<pieces.length;i++){var key=pieces[i].substr(0,pieces[i].indexOf('='));if(key==='tnt_target_url'){tnt_target_url_field=new Element('input',{type:'hidden',name:'url',value:pieces[i].substr(pieces[i].indexOf('=')+1)});}}
var form=new Element('form',{action:pieces[0],method:'POST'}),field=new Element('input',{type:'hidden',name:'SAMLRequest',value:pieces[1]});if(this.newwindow){form.target=this.newwindow;}
if(tnt_target_url_field!==null){form.insert(tnt_target_url_field);}
$(document.body).insert(form.insert(field));form.submit();}},handleFailure:function handleFailure(result){if(this.fallback_url){location=this.fallback_url;}}}
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(input){var data=[];var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;input=Base64._utf8_encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64;}else if(isNaN(chr3)){enc4=64;}
data.push(this._keyStr.charAt(enc1)+this._keyStr.charAt(enc2)+this._keyStr.charAt(enc3)+this._keyStr.charAt(enc4));}
return data.join('');},decode:function(input){var output="";var string_arr=[];var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=this._keyStr.indexOf(input.charAt(i++));enc2=this._keyStr.indexOf(input.charAt(i++));enc3=this._keyStr.indexOf(input.charAt(i++));enc4=this._keyStr.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;string_arr.push(String.fromCharCode(chr1));if(enc3!=64){string_arr.push(String.fromCharCode(chr2));}
if(enc4!=64){string_arr.push(String.fromCharCode(chr3));}}
output=string_arr.join("");output=Base64._utf8_decode(output);return output;},_utf8_encode:function(string){string=string.replace(/\r\n/g,"\n");var data=[];for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){data.push(String.fromCharCode(c));}
else if((c>127)&&(c<2048)){data.push(String.fromCharCode((c>>6)|192));data.push(String.fromCharCode((c&63)|128));}
else{data.push(String.fromCharCode((c>>12)|224));data.push(String.fromCharCode(((c>>6)&63)|128));data.push(String.fromCharCode((c&63)|128));}}
return data.join('');},_utf8_decode:function(utftext){var data=[];var i=0;var c=c1=c2=0;while(i<utftext.length){c=utftext.charCodeAt(i);if(c<128){data.push(String.fromCharCode(c));i++;}
else if((c>191)&&(c<224)){c2=utftext.charCodeAt(i+1);data.push(String.fromCharCode(((c&31)<<6)|(c2&63)));i+=2;}
else{c2=utftext.charCodeAt(i+1);c3=utftext.charCodeAt(i+2);data.push(String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63)));i+=3;}}
return data.join('');}}
var $document=$(document);$document.on('click','#menu-toggle-button',function(){$(document.body).toggleClassName('hide_left_nav');});$document.on('click','#left_nav_container .tabs button',function(event,el){var tabSelector=el.readAttribute('data-tab');$$('#left_nav_container .tab.active')[0].removeClassName('active');$$('#left_nav_container '+tabSelector)[0].addClassName('active');$$('#left_nav_container [class*=icon-].active')[0].removeClassName('active');el.addClassName('active');});document.observe('dom:loaded',function(){if($('action_bar')){if($$('#calendar-widget-content .CalendarWidgetActivator').length){$('calendar-widget-content').fire('cal:inserted');}}});OM.getResponseJSONFromResponseText=function(responseText){var responseJSON;try{responseJSON=JSON.parse(responseText);}catch(e){responseJSON=null;if(window.console){console.log('Unable to parse through the response text: ',e);}}
return responseJSON;}
YAHOO.omniture.Model=function(id)
{this.init(id);}
YAHOO.omniture.Model.prototype={EVENT_ALL:1,init:function(id)
{this._id=id;this._observer_list=new Array();this._page_controller=null;this._ajax_object=null;this._ajax_callback=null;},getId:function(){return this._id;},attachObserver:function(observer,callback,event_type)
{if(observer){callback=callback||'update';event_type=event_type||YAHOO.omniture.Model.EVENT_ALL;this._observer_list.push({observer:observer,callback:callback,event_type:event_type});}},removeObserverById:function(observer_id)
{for(var i=0;i<this._observer_list.length;i++){var observer=this._observer_list[i]['observer'];if(typeof(observer.getDomId)!='undefined'&&observer.getDomId()==observer_id){this._observer_list.splice(i,1);i=this._observer_list.length;}}},attachPageController:function(controller)
{if(controller){this._page_controller=controller;}},notify:function(event_type)
{for(var i=0;i<this._observer_list.length;i++){var observer=this._observer_list[i]['observer'];var callback=this._observer_list[i]['callback'];if(!event_type||event_type==this._observer_list[i]['event_type']||this._observer_list[i]['event_type']==YAHOO.omniture.Model.EVENT_ALL)
observer[callback](this);}},_runAJAXRequest:function(child,url,method,post)
{method=method||'GET';post=post||null;if(!child.handleFailure){child.handleFailure=child.handleSuccess;}
var callback={success:child.handleSuccess,failure:child.handleFailure,scope:child}
this._ajax_object=YAHOO.util.Connect.asyncRequest(method,url,callback,post);this._ajax_callback=callback;},_abortAJAXRequest:function()
{this._ajax_callback=null;YAHOO.util.Connect.abort(this._ajax_object,this._ajax_callback,false);this._ajax_object=null;},handleSuccess:function(result){},handleFailure:function(result){}};YAHOO.omniture.Widget=function(dom_id)
{this.init(dom_id);this._delegate=null;}
YAHOO.omniture.Widget.prototype={init:function(dom_id)
{this._dom_id=dom_id;this._model=null;},render:function()
{},_renderContent:function(){this.attachListeners();},update:function(model)
{this.render();},getDomId:function()
{return this._dom_id;},getDomElement:function()
{return $(this._dom_id);},setModel:function(model){this._model=model;},getModel:function(model){return this._model;},renderLoading:function()
{Omniture.util.renderLoading(this.getDomId());},assignDelegate:function(delegate)
{this._delegate=delegate;},getDelegate:function()
{if(this._delegate){return this._delegate;}else{return this;}},attachListeners:function()
{var dom_id=this.getDomId();var Event=YAHOO.util.Event;if(this.onClick){Event.removeListener(dom_id,"click",this.onClick);Event.addListener(dom_id,"click",this.onClick,this,true);}
if(this.onMouseOver){Event.removeListener(dom_id,"mouseover",this.onMouseOver);Event.addListener(dom_id,"mouseover",this.onMouseOver,this,true);}
if(this.onMouseOut){Event.removeListener(dom_id,"mouseout",this.onMouseOut);Event.addListener(dom_id,"mouseout",this.onMouseOut,this,true);}}};YAHOO.omniture.JSONModel=function(id)
{this.init(id);};YAHOO.lang.extend(YAHOO.omniture.JSONModel,YAHOO.omniture.Model,{_error_list:[],_time:false,_timeTaken:false,init:function(id){YAHOO.omniture.JSONModel.superclass.init.call(this,id);this._response_obj=null;this._waiting=false;this._alert_errors=true;},setAlertErrors:function(show_alert){this._alert_errors=show_alert;},setURL:function(url,no_json){this._url=url;if(!no_json){this._url=Omniture.URL.overrideParams(this._url,{json:1});}},getURL:function(){return this._url;},getResponse:function(settings){settings=settings||{};settings.method=settings.method||'GET';postData=settings.postData||null;this.clearMessages();var date=new Date();if(this._response_obj==null&&!this._waiting){this._waiting=true;this._time=date.getTime();this._runAJAXRequest(this,this._url,settings.method,postData);}
return this._response_obj;},abortRequest:function()
{this._abortAJAXRequest();this._waiting=false;},setResponse:function(response){this._response_obj=response;},clearResponse:function(){this._response_obj=null;},hasResponse:function(){var ret=true;if(this._response_obj===null)ret=false;return ret;},handleSuccess:function(result){this._waiting=false;if(this._time&&!this._timeTaken)
{var date=new Date();this._timeTaken=date.getTime()-this._time;this._time=false;}
if(this.validReponse(result.responseText)){this._response_obj=eval("("+result.responseText+")");if(this._timeTaken)this._response_obj.timeTaken=this._timeTaken;this._validResponseReceived(this._response_obj);this.notify();}else{if(this.isLoginPage(result.responseText)){document.location=encodeURI(document.location)+'&logout_message=session_expired';}else if(typeof(page_controller)=="object"&&page_controller.addMessage){page_controller.addMessage(Omniture.l10n.gettext('Unable to retrieve data'),'failure');}else if(this._alert_errors){alert('Unable to retrieve data');}}},_validResponseReceived:function(response){if(response.b64_content)
{var keys=Object.keys(response.b64_content)||[];var c=keys.length;for(var i=0;i<c;i++)
{response[keys[i]]=Base64.decode(response[keys[i]]);}
response.b64_content=false;}},addMessage:function(msg,type)
{if(typeof(page_controller)=="object"&&page_controller.addMessage){this._error_list[this._error_list.length]=page_controller.addMessage(msg,type);}else if(this._alert_errors){alert(msg);}},clearMessages:function()
{for(var i=0;i<this._error_list.length;i++){page_controller.removeMessage(this._error_list[i]);}},pendingResponse:function()
{return this._waiting;},handleFailure:function(result){this._waiting=false;if(result.status==403){document.location=encodeURI(document.location)+'&logout_message=session_expired';}else if(result.status!=0){this.addMessage('Unable to retrieve data','failure');}},validReponse:function(response){if(response===null){return false;}
if(!response.length){return false;}
if(response.substring(0,1)=="{"&&response.substring(response.length-1)=="}"){return true;}
if(response.substring(0,2)==" {"&&response.substring(response.length-1)=="}"){return true;}
if(response.substring(0,1)=="["&&response.substring(response.length-1)=="]"){return true;}
if(response=='true'||response=='false'){return true;}
return false;},isLoginPage:function(response_text)
{if(response_text.indexOf('<!--login-->')>0){return true;}
return false;}});YAHOO.omniture.ContainerWidget=function(corresponding_container_id)
{this.init(corresponding_container_id);};YAHOO.lang.extend(YAHOO.omniture.ContainerWidget,YAHOO.omniture.Widget,{init:function(corresponding_container_id)
{YAHOO.omniture.ContainerWidget.superclass.init.call(this,corresponding_container_id);this.models={};this.widgets={};},render:function()
{var html=this._getHTML();var partial_html_dom_element=this.getDomElement();if(partial_html_dom_element&&html){partial_html_dom_element.innerHTML=html;}
var priority_list=this._getPriorityWidgetList();var rendered={};for(var i=0;i<priority_list.length;i++){var key=priority_list[i];if(this.widgets[key]){this.widgets[key].render();}
rendered[key]=true;}
for(var i in this.widgets){if(!rendered[i]){this.widgets[i].render();}}},_getHTML:function()
{return"";},_getPriorityWidgetList:function()
{return[];}});YAHOO.omniture.PartialHTMLModel=function(id)
{this.init(id);}
YAHOO.lang.extend(YAHOO.omniture.PartialHTMLModel,YAHOO.omniture.Model,{init:function(id)
{YAHOO.omniture.PartialHTMLModel.superclass.init.call(this,id);this._partial_html="";},setURL:function(url)
{this._url=url;},getURL:function()
{return this._url;},getHTML:function()
{if(this.isLoginPage(this._partial_html)){document.location=encodeURI(document.location)+'&logout_message=session_expired';}
else if(this._partial_html){return this._partial_html;}else if(this._url){this._runAJAXRequest(this,this.getURL());}},setHTML:function(html)
{this._partial_html=html;},handleSuccess:function(result)
{this._partial_html=result.responseText;this.notify();},handleFailure:function(result){if(result.status==403){document.location=encodeURI(document.location)+'&logout_message=session_expired';}},isLoginPage:function(response_text)
{if(response_text.indexOf('<!--login-->')>0){return true;}
return false;}});YAHOO.omniture.PartialHTMLWidget=function(dom_id)
{this.init(dom_id);};YAHOO.lang.extend(YAHOO.omniture.PartialHTMLWidget,YAHOO.omniture.Widget,{init:function(dom_id)
{YAHOO.omniture.PartialHTMLWidget.superclass.init.call(this,dom_id);this._partial_html_model=null;},setPartialHTMLModel:function(partial_html_model)
{this._partial_html_model=partial_html_model;},render:function()
{var html=this._partial_html_model.getHTML();if(html){return this._renderCustomHTML(html);}else{this.renderLoading();}
return false;},_renderCustomHTML:function(html)
{var partial_html_dom_element=this.getDomElement();if(partial_html_dom_element){partial_html_dom_element.innerHTML=html;var script_tags=Omniture.util.getTagContents('script',html);for(var i=0;i<script_tags.length;i++){Omniture.util.execScript(script_tags[i].inner_html);}
return true;}
return false;}});Omniture.JsonPartialHTMLWidget=function(dom_id)
{this.init(dom_id);};YAHOO.lang.extend(Omniture.JsonPartialHTMLWidget,YAHOO.omniture.Widget,{init:function(dom_id)
{Omniture.JsonPartialHTMLWidget.superclass.init.call(this,dom_id);this._json_handler=null;},setURL:function(url)
{if(!this._json_handler){this._json_handler=new YAHOO.omniture.JSONModel();this._json_handler.attachObserver(this,'render');}
this._json_handler.setURL(url);},render:function()
{if(!this._json_handler){return false;}
var response=this._json_handler.getResponse();if(response){return this._renderResponse(response);}else{this.renderLoading();}
return false;},setControlContainer:function(container)
{this._control_container=container;},getControlContainer:function()
{if(this._control_container){return this._control_container;}else{return this;}},_renderResponse:function(response)
{var partial_html_dom_element=this.getDomElement();if(partial_html_dom_element){partial_html_dom_element.innerHTML=response.inner_html;Omniture.util.execScript(response.resources.js_inline);Omniture.util.attachCss(response.resources.css_inline);var control_setup=eval(response.control_setup);control_setup.call(this.getControlContainer());return true;}
return false;}});var OM_View=Class.create({default_options:{},initialize:function(container,options)
{this.setContainer(container);this.options=$H(this.default_options).merge(options||{}).toObject();},getContainer:function()
{return this._container;},setContainer:function(c)
{this._container=$(c);}});