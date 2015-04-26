
Omniture.Model.ReportModel=function(id)
{this.init(id);};YAHOO.lang.extend(Omniture.Model.ReportModel,YAHOO.omniture.JSONModel,{_error_list:[],_time:false,_timeTaken:false,init:function(id){Omniture.Model.ReportModel.superclass.init.call(this,id);this._response_obj=null;this._waiting=false;this._alert_errors=true;},getResponse:function(settings){this.clearMessages();var date=new Date();return this._response_obj;}});YAHOO.omniture.StandardReportContainer=function(dom_id)
{this.init(dom_id);};YAHOO.lang.extend(YAHOO.omniture.StandardReportContainer,YAHOO.omniture.SuiteContainer,{_queued_settings:{},init:function(dom_id)
{YAHOO.omniture.StandardReportContainer.superclass.init.call(this,dom_id);this.rt_widgets=[];this.controls={};report_model=new Omniture.Model.ReportModel();this.models.report_model=report_model;var url=this.getInitialURL();this.models.report_model.setURL(url);this.models.report_state=Omniture.Config.report_state;this.models.report_tool_alerts=Omniture.Config.report_tool_alerts;this.models.publishing_nav_model=new YAHOO.omniture.PubNavigationModel();this.models.publishing_nav_model.attachPageController(this);this.models.publishing_nav_model.setReportStateModel(this.models.report_state);this.models.state_change_model=new YAHOO.omniture.JSONModel();this.models.report_settings_model=new YAHOO.omniture.JSONModel();this.models.report_settings_model.setURL(Omniture.URL.s(Omniture.Config.SCRIPT_PATH,{'jpj':Omniture.Config.history_var,'nocache':Omniture.Config.no_cache,'a':'Report.ConfigureReport','r':Omniture.Config.report_action,'sc_oid':this.models.report_state['oid']}));if(Omniture.Config.config_report_area){var report_settings_robj=Omniture.Config.config_report_area;this.models.report_settings_model.setResponse(report_settings_robj);}
this.models.alert_model=new YAHOO.omniture.AlertModel();this.models.alert_model.attachPageController(this);this.models.messages_model=new YAHOO.omniture.MessagesModel();this.widgets.graph=new YAHOO.omniture.GraphWidget("chart_area");this.widgets.graph.setJSONModel(this.models.report_model);this.widgets.data=new YAHOO.omniture.DataWidget("data_table");this.widgets.data.setJSONModel(this.models.report_model);this.widgets.summary_data=new YAHOO.omniture.SummaryDataWidget("summary_table");this.widgets.summary_data.setJSONModel(this.models.report_model);this.widgets.tracking=new YAHOO.omniture.TrackingWidget();this.widgets.tracking.setJSONModel(this.models.report_model);this.widgets.cal_events=new YAHOO.omniture.CalEventsDataWidget("cal_events_container");this.widgets.cal_events.setJSONModel(this.models.report_model);this.widgets.notices=new YAHOO.omniture.NoticesWidget("notice_text");this.widgets.notices.setJSONModel(this.models.report_model);this.widgets.messages=new YAHOO.omniture.MessagesWidget("message_area");this.widgets.messages.setModel(this.models.messages_model);this.widgets.report_settings_context_menu=new YAHOO.omniture.SettingsContextMenuWidget("context_menu_container");this.widgets.report_settings_context_menu.setJSONModel(this.models.report_settings_model);this.widgets.report_tool_alert_box=new YAHOO.omniture.ReportToolAlerts("center_content");this.widgets.report_tool_alert_box.setModel(this.models.report_tool_alerts);if($('data_table_pagination_list')){this.controls.paginator=new Omniture.control.Paginator('data_table_pagination_list',9,1,Omniture.Config.current_row_count,0);this.controls.paginator.setAvailableClass('pagination_page_available');this.controls.paginator.setSelectedClass('pagination_page_selected');this.controls.paginator.setCallback(this.handlePageClick);this.controls.paginator.render();this.widgets.paginator=new YAHOO.omniture.PaginationWidget('data_table_pagination',this.controls.paginator);this.widgets.paginator.setJSONModel(this.models.report_model);this.models.report_model.attachObserver(this.widgets.paginator);}
var report_pieces=[{"json_obj":"filter","container":"filter_container"},{"json_obj":"main_data","container":"data_table"},{"json_obj":"summary_data","container":"summary_table"},{"json_obj":"chart","container":"chart_container"},{"json_obj":"chart","container":"graph_options"},{"json_obj":"cal_events","container":"show_cal_events"}];var report_control_elements={'report_search_container':'search','metric_selector_divider':'ec_unit|std_events'};this.widgets.report_manager=new YAHOO.omniture.ReportManagerWidget(report_pieces,report_control_elements);this.widgets.report_manager.setJSONModel(this.models.report_model);this.widgets.item_breakdown_menu=new YAHOO.omniture.ReportContextMenuWidget("context_menu_container");this.widgets.item_breakdown_menu.setJSONModel(this.models.report_model);this.models.report_model.attachObserver(this.widgets.graph);this.models.report_model.attachObserver(this.widgets.filter);this.models.report_model.attachObserver(this.widgets.data);this.models.report_model.attachObserver(this.widgets.summary_data);this.models.report_model.attachObserver(this.widgets.cal_events);this.models.report_model.attachObserver(this.widgets.notices);this.models.report_model.attachObserver(this.widgets.report_manager);this.models.report_model.attachObserver(this.widgets.granularity);this.models.messages_model.attachObserver(this.widgets.messages);this.models.report_model.attachObserver(this.widgets.item_breakdown_menu);this.models.report_model.attachObserver(this.widgets.settings,"updateReport");this.models.report_settings_model.attachObserver(this.widgets.report_settings_context_menu);this.models.report_model.attachObserver(this.widgets.tracking,"sendReportLink");Omniture.util.disableSelection('configure_label');Omniture.util.disableSelection('metric_selector_container');window.email_notification=setTimeout(this.displayEmailNotice.bind(this),60000);window.timeout_notification=setTimeout(this.timeout.bind(this),5*60*1000);this.initializeActionBar();this.checkEditBookmark();if(Omniture.Config.mixed_data){this.addMessage(Omniture.Config.mixed_data,'alert');}
if(Omniture.Config.show_data_prep){this.checkDataPrepStatus(Omniture.Config.show_data_prep);}
if(Omniture.Config.bot_config){this.addMessage(Omniture.Config.bot_config_message,'alert');}
if(Omniture.Config.psd_config){this.addMessage(Omniture.Config.psd_config_message,'alert');}
if(Omniture.Config.login_expire_warning){this.addMessage(Omniture.Config.login_expire_warning,'alert');}
if($('calendar-widget-content')&&$('calendar_compare')){var canCompare=parseInt($F('calendar_compare'),10),mode='select';if(canCompare&&this.models.date_range_model.getCompareStartDate()){mode='compare';}
this.setupCalendarWidget(canCompare,mode);}
if(OWL.browser==='IE6'){var overlay=$('chart_container_overlay'),cls='over';overlay.observe('mouseenter',function(){overlay.addClassName(cls);}).observe('mouseleave',function(){overlay.removeClassName(cls);});}},checkEditBookmark:function()
{if(!OM.Config.edit_bookmark){return;}
this.addMessage(OM.Config.edit_bookmark.message,OM.Config.edit_bookmark.message_type+' edit_bookmark',Prototype.emptyFunction,'editBookmarkNotice');var _listen=$('message_area').on('click','.edit_bookmark',(function(e){var cls=e.findElement().className;if(cls==='button'){_listen.stop();this.saveChangesEditBookmark(e);}
if(cls==='alert_close_icon'){_listen.stop();this.cancelEditBookmark(e);}}).bindAsEventListener(this));},addToDashboardSuccessMessage:function(text,b64)
{var b64=b64||false;if(b64)
{var text=Base64.decode(text);}
this.removeEditBookmarkNotice();this.addMessage(text,'success');},setReportletTrackingCode:function(reportlet_data)
{if(s&&s.tl)
{s.linkTrackVars="events,eVar37";s.linkTrackEvents="event24";s.eVar37=reportlet_data;s.events="event24";s.tl(true,'o','Dashboard Widget Info');}},setTrackingCodeAndRedirect:function(reportlet_data,redirect_url)
{this.setReportletTrackingCode(reportlet_data);var tmp_this=this;setTimeout(function(){tmp_this.redirect(redirect_url)},200);},saveChangesEditBookmark:function(e)
{var url=Omniture.URL.fs('Report.SaveEditBookmark');var params={method:'get',parameters:{'json':1},onSuccess:this.saveChangesEditBookmarkCallBack.bind(this)};var ajax=new Ajax.Request(url,params);dx_track('event49','Update Reportlet');},saveChangesEditBookmarkCallBack:function(t)
{try
{var d=t.responseText.evalJSON();}
catch(e)
{this.addMessage(Omniture.l10n.gettext('There were technical difficulties in saving your changes.'),'failure');return;}
if(d.success)
{d.base64=d.base64||false;this.addToDashboardSuccessMessage(d.message,d.base64);return;}
else
{var msg=d.message||Omniture.l10n.gettext('There were technical difficulties in saving your changes.');this.addMessage(msg,'failure');}},cancelEditBookmark:function(e)
{var url=Omniture.URL.fs('Report.RemoveEditBookmark');var cancelAjax=new Ajax.Request(url);this.removeEditBookmarkNotice();},removeEditBookmarkNotice:function()
{this.removeMessage('editBookmarkNotice');},setupCalendarWidget:function(compareEnabled,mode){new OWL.Requirement({require:'CalendarWidget',thenDo:(function(){this.widgets.calendar=new OWL.CalendarWidget({dateRangeModel:this.models.date_range_model,showWeekSelectors:true,compareEnabled:compareEnabled,mode:mode,onRun:function(){this.updateModel();this.dateRangeModel.notify();}});this.widgets.calendar.dateBlock.updateRangeInfo();this.widgets.calendar.compareBlock.updateRangeInfo();$('calendar-widget-content').insert(this.widgets.calendar.activator);$('calendar-widget-content').fire('cal:inserted');}).bind(this)});},displayEmailNotice:function(){var ocb=Omniture.Control.BubbleHelpControl;if(ocb){var bubble_url=Omniture.URL.suite('BubbleHelp.GetHelp','','index.html');Omniture.Control.BubbleHelpControl.display_help('email_report_notice','email_notice',bubble_url,true,60000);}},timeout:function(){if(report_model.hasResponse()){return;}
report_model.timed_out=true;var div;if(div=$('loading')){div.hide();}
if(div=$('timeout')){div.show();div.down('a').observe('click',function(){location.reload();});}
this.handleToolClick(this.rt_widgets.add_em_panel,true);},changeSettings:function(settings,loading)
{var orig_params=Omniture.util.getParams(location.href);var new_params={rp:settings,r:orig_params['report']};var settings_arr=Omniture.util.parseParamString(settings);if(settings_arr['jpj']){new_params['jpj']=settings_arr['jpj'];}
var sUrl=Omniture.URL.fs("Report.Standard",new_params);if(sUrl.length>2000){delete new_params['rp'];var sUrl=Omniture.URL.fs("Report.Standard",new_params);var form=document.createElement("form");form.setAttribute("method","post");form.setAttribute("action",sUrl);var hiddenField=document.createElement("input");hiddenField.setAttribute("type","hidden");hiddenField.setAttribute("name","rp");hiddenField.setAttribute("value",settings);form.appendChild(hiddenField);document.body.appendChild(form);form.submit();}else{setTimeout(function(){location=sUrl;},0);}},redirect:function(url)
{window.location.href=url;},updateDateRanges:function(model)
{var mstart=this.widgets.calendar.dateRange.start;var mend=this.widgets.calendar.dateRange.end;var dates={start:this.widgets.calendar.dateRange.start,end:this.widgets.calendar.dateRange.end,compareStart:this.widgets.calendar.compareDateRange?this.widgets.calendar.compareDateRange.start:null,compareEnd:this.widgets.calendar.compareDateRange?this.widgets.calendar.compareDateRange.end:null};var settings={};var preset=model.getPreset();if(preset){settings.preset=preset;}
var odiStart=OmniDate_createInstance(dates.start.getUTCFullYear(),dates.start.getUTCMonth(),dates.start.getUTCDate());var odiEnd=OmniDate_createInstance(dates.end.getUTCFullYear(),dates.end.getUTCMonth(),dates.end.getUTCDate());var utcPeriod=Omniture.util.Period.getFromRange(odiStart,odiEnd);settings.period_from=dates.start.toFormattedString('%D',true);settings.period_to=dates.end.toFormattedString('%D',true);settings.period=OWL.Calendar.datesToPeriodString(dates.start,dates.end,(utcPeriod?utcPeriod.getType():null));if(this.widgets.calendar.rangePeriodFlag||utcPeriod==null){settings.range_period=1;}else{settings.range_period=0;}
if(this.widgets.calendar.granularityEnabled&&model.granularity&&model.granularity!=''){settings.granularity=model.granularity;}else{delete model.granularity;delete settings.granularity;}
if(dates.compareStart&&dates.compareEnd&&this.widgets.calendar.mode=='compare'){try{settings.compare=this.models.report_model.getResponse().applicable_vars.compare?'period':'';var codiStart=OmniDate_createInstance(dates.compareStart.getUTCFullYear(),dates.compareStart.getUTCMonth(),dates.compareStart.getUTCDate());var codiEnd=OmniDate_createInstance(dates.compareEnd.getUTCFullYear(),dates.compareEnd.getUTCMonth(),dates.compareEnd.getUTCDate());var cutcPeriod=Omniture.util.Period.getFromRange(codiStart,codiEnd);settings.compare_from=dates.compareStart.toFormattedString('%D',true);settings.compare_to=dates.compareEnd.toFormattedString('%D',true);settings.comparison=OWL.Calendar.datesToPeriodString(dates.compareStart,dates.compareEnd,(cutcPeriod?cutcPeriod.getType():null));if(this.widgets.calendar.compareRangePeriodFlag||cutcPeriod==null){settings['comparison_details[range_period]']=1;}else{settings['comparison_details[range_period]']=0;}}catch(e){delete settings.compare;}}else if(this.models.report_state.clean_report_vars['compare']=='period'){settings.compare='';settings.comparison='';}
var settingsStr=$H(settings).map(function(p){return p.key+'|'+(p.value!=null?p.value:'');}).join(';');this.changeSettings(settingsStr);},checkDataPrepStatus:function(prep_id)
{var that=this;var url=Omniture.URL.fs('Report.CheckDataPrep',{'data_prep_id':prep_id});var params={method:'get',parameters:{},onSuccess:function(t)
{that.preload_date_range_ajax=null;if(t.responseText=='SUCCESS'){$('loading_content_prep').style.display='none';$('loading_content_run').style.display='';}else{}}};this.data_prep_ajax=new Ajax.Request(url,params);},failureLoadDateRange:function(t)
{$('pre_load').style.display='none';this.addMessage(Omniture.l10n.gettext('The requested date range could not be loaded'),'failure');this.preload_date_range_ajax=null;},changeState:function(settings)
{var new_settings=Omniture.util.parseParamString(settings);var sUrl=Omniture.URL.s(Omniture.Config.SCRIPT_PATH,{'jpj':Omniture.Config.history_var,'nocache':Omniture.Config.no_cache,'a':'Report.ChangeState','next_history_var':Omniture.Config.history_id,'dont_reset_reserved_vars':1});for(var idx in new_settings){this.models.report_state['clean_report_vars'][idx]=new_settings[idx];sUrl=sUrl+"&"+idx+"="+new_settings[idx];}
this.models.state_change_model.clearResponse();this.models.state_change_model.setURL(sUrl);this.models.state_change_model.getResponse();},toggleChartOverlay:function(force_state)
{var overlay_bg_url=null;var overlay_opacity='.8';if(navigator.userAgent.indexOf('Mac')>=0&&navigator.userAgent.indexOf('Firefox')>=0&&navigator.userAgent.indexOf('3.')==-1){var chart=document.getElementById('chart_movie_name');if(chart&&chart.value){var parts=chart.value.split("&type=");var overlay_bg_url=parts[0]+"&type=GIF";}
overlay_opacity='.2';}
Omniture.util.toggleLoader('chart_container_overlay',force_state,overlay_opacity,overlay_bg_url);},toggleDataOverlay:function(state)
{var dv=document.getElementById('data_containers');if(!dv)return;if(state==2){if(dv.style.display!='none'){Omniture.util.toggleLoader('data_containers',2);}}else{YAHOO.util.Dom.setStyle(dv,'background','white');Omniture.util.toggleLoader('data_containers',1);}},toggleChart:function(state)
{var state_change='',chart=$('chart_container_overlay'),chart_btn=$('collapse_chart'),chart_image=$('chart_collapse_image');if(chart.style.display==='none'){chart.style.display='block';chart_btn.title=Omniture.l10n.gettext('Hide Graph');chart_image.src=Omniture.Config.STATIC_URL+"/images/v15icons/collapse-up.png";state_change='chart_collapse|0';if(Omniture.util.getLoaderState('chart_container_overlay')==2){page_controller.toggleChartOverlay();page_controller.toggleChartOverlay();}}else{chart.style.display="none";chart_btn.title=Omniture.l10n.gettext('Show Graph');chart_image.src=Omniture.Config.STATIC_URL+"/images/v15icons/collapse-down.png";state_change='chart_collapse|1';}
this.changeState(state_change);},getQueuedSettings:function(settings)
{for(var i in settings){this._queued_settings[i]=settings[i];}
return this._queued_settings;},clearQueuedSettings:function()
{this._queued_settings={};},changeSettingsFromPopup:function(settings)
{var tmp_this=this;setTimeout(function(){tmp_this.changeSettings(settings)},10);},changeSettingsReload:function(settings)
{var orig_params=Omniture.util.getParams(document.location+'');var new_rp=Omniture.util.parseParamString(settings);var old_rp=orig_params['params'];var new_rp_str='';var cur_url=document.location+'';var url_pieces=cur_url.split('&rp=');var last_piece='';if(url_pieces.length==2){for(var idx in old_rp){var val=old_rp[idx];if(new_rp[idx])val=new_rp[idx];if(new_rp_str.length){new_rp_str=new_rp_str+';';}
new_rp_str=new_rp_str+idx+'|'+val;}
last_piece=new_rp_str+url_pieces[1].substring(url_pieces[1].indexOf('&'));}else{last_piece=settings;}
new_url=url_pieces[0]+'&rp='+last_piece;document.location=new_url;},changeGranularity:function(new_gran)
{var from=Omniture.util.Date.parse(page_controller.models.report_state.clean_report_vars.period_from);var to=Omniture.util.Date.parse(page_controller.models.report_state.clean_report_vars.period_to);new_gran=new_gran||'day';if(from&&to){var ret=Omniture.util.checkGranularity(from,to,new_gran);if(ret){var alrt_id=page_controller.addMessage(ret,"alert");setTimeout('page_controller.removeMessage('+alrt_id+')',8000);return false;}}
page_controller.models.report_state['granularity']=new_gran;page_controller.models.report_state['range_period']=1;page_controller.changeSettings('granularity|'+new_gran+';range_period|1;period_from|'+page_controller.models.report_state['clean_report_vars']['period_from']+';period_to|'+page_controller.models.report_state['clean_report_vars']['period_to']);return true;},changeGraph:function()
{var loading_arr=new Array(page_controller.toggleChartOverlay);page_controller.changeSettings("chart_type|"+this.id,loading_arr);return true;},handlePageClick:function(first_row,obj)
{page_controller.changeSettings(obj.getRowVar()+'|'+(first_row-1)+';detail_depth|'+obj.getRowsPerPage());},incrementPage:function()
{this.controls.paginator.incrementPage();},decrementPage:function()
{this.controls.paginator.decrementPage();},changePage:function(page_num)
{this.controls.paginator.setCurrentPage(page_num,true);},changeRowCount:function(e,args)
{this.controls.paginator.setRowsPerPage(args[0].selected_value);},getInitialURL:function()
{var util_params=Omniture.util.getParams(document.location+"");var no_reset=Omniture.util.getParam(document.location+'','dont_reset_reserved_vars');var query_params={jpj:Omniture.Config.history_var,nocache:(Math.floor(Math.random()*1000)),prepend_output:1,a:util_params['report'],next_history_var:Omniture.Config.history_id};if(Omniture.Config.preview){query_params['preview']='upgrade';}
if(Omniture.Config.bookmark){query_params['bookmark']=Omniture.Config.bookmark;}
if(no_reset){query_params['dont_reset_reserved_vars']=1;}
var sUrl=Omniture.URL.s(Omniture.Config.SCRIPT_PATH,query_params);if(typeof util_params['params']==='object'){for(var idx in util_params['params']){sUrl=sUrl+"&"+idx+"="+util_params['params'][idx];}}
return sUrl;},initializeActionBar:function()
{if(!$$('.endor-ActionBar'))return;this.setupDownloadTool();this.setupEmailTool();this.setupBookmarkTool();this.setupAddDashboardTool();this.setupShareTool();this.setupAlertTool();this.setupCustomReportTool();this.setupCopyGraphTool();this.setupDataExtractTool();this.setupReportLinkTool();var tool=null;if(tool=$('window_tool')){tool.writeAttribute('target','_blank').writeAttribute('href',Omniture.URL.suite('Product.SwitchSession',{redirect_url:location.href}));}
if(tool=$('print_tool')){tool.observe('click',this.printReport);}
if(tool=$('discover_tool')){tool.onclick=this.launchDiscover;}
this.moreActionsClickBound=this.moreActionsClick.bindAsEventListener(this);this.hideActionsClickBound=this.hideActionsClick.bindAsEventListener(this);if(tool=$('more_tool')){tool.observe('click',this.moreActionsClickBound);}
if(tool=$('default_metric_tool')){tool.observe('click',this.moreActionsClickBound);}
this.configGraphClickBound=this.configGraphClick.bindAsEventListener(this);this.hideConfigGraphClickBound=this.hideConfigGraphClick.bindAsEventListener(this);if(tool=$('configure_graph_menu_btn')){tool.observe('click',this.configGraphClickBound);}},printReport:function(){var params=page_controller.models.dashboard_state;params=params?params.getParameters():{};params.report_name=OM.Config.reportname;Omniture.util.popwin(Omniture.URL.fs('Report.Print',params),'print_win',900,600).focus();},launchDiscover:function(){var url=$('discover_tool').href;page_controller.trackEvents('event14','Discover Launches');page_controller.trackOBUEvents('event46','Discover Launches');var iframe=new Element('iframe',{src:url,'class':'off_screen'});$(document.body).insert(iframe);return false;},linkToReport:function(){var extraparams={dont_reset_reserved_vars:1,share_link:1},crv=Omniture.Config.report_state.clean_report_vars;var cleanUrl=Omniture.URL.removeParams(location.href,['jpj','ssSession','rp']);if(crv.hierarchy_hash_list){crv.id=crv.hierarchy_hash_list;delete crv.hierarchy_hash_list;}
if(crv.division_select){crv.select_division=crv.division_select;delete crv.division_select;}
if(crv.page){crv.newpage=crv.page;delete crv.page;}
if(crv.hasOwnProperty('search')&&crv.hasOwnProperty('ec_sub1')){if(crv.ec_sub1===0&&crv.search){delete crv.ec_sub1;}}
var params=Omniture.util.objectMerge(crv,extraparams);var linkUrl=cleanUrl+'&rp='+Omniture.URL.reportParamsToUrl(params);var d_url=Base64.encode(linkUrl);return Omniture.URL.suite('Main.SwitchReportSuite',{'d_url':d_url,'switch_accnt':Omniture.Config.report_state.rsid},null,false);},moreActionsClick:function(e){var menu=e.findElement('.tool_menu');if(menu.hasClassName('tool_menu_open')){this.hideActionsClick();}else{menu.addClassName('tool_menu_open').down('ul').addClassName('show');$(document.body).observe('click',this.hideActionsClickBound);}},hideActionsClick:function(e){var tool,el=e&&e.findElement();if(el&&el.up('.tool_menu')){return;}
if(tool=$('more_tool')){tool.removeClassName('tool_menu_open').down('ul').removeClassName('show');}
if(tool=$('default_metric_tool')){tool.removeClassName('tool_menu_open').down('ul').removeClassName('show');}
$(document.body).stopObserving('click',this.hideActionsClickBound);},configGraphClick:function(e){if($('configure_graph_menu').hasClassName('tool_menu_open')){this.hideConfigGraphClick();}else{$('configure_graph_menu').addClassName('tool_menu_open').down('ul').addClassName('show');$(document.body).observe('click',this.hideConfigGraphClickBound);}},hideConfigGraphClick:function(e){if(e&&Event.findElement(e,'#configure_graph_menu')===$('configure_graph_menu')){return;}
$('configure_graph_menu').removeClassName('tool_menu_open').down('ul').removeClassName('show');$(document.body).stopObserving('click',this.hideConfigGraphClickBound);},handleToolClick:function(tool,panel)
{if(this._selected_tool&&!this._selected_tool.isShowing()){this._selected_tool=null;}
if(panel&&this._selected_tool){this._selected_tool.close();}
return(tool===this._selected_tool)?(this._selected_tool=null):((this._selected_tool=tool).render()||true);},setupDownloadTool:function()
{this.models.add_download=new YAHOO.omniture.PartialHTMLModel();this.models.add_download.setURL(Omniture.URL.suite('DownloadReport.GetOptions',{'dashboard':Omniture.Config.dashboard_id,'oid':Omniture.Config.real_oid}));var download_panel=new YAHOO.omniture.PartialHTMLWidget("shared_toolbar_panel");download_panel.setPartialHTMLModel(this.models.add_download);this.rt_widgets.add_download_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",download_panel,'download_tool');var tmp_this=this;YAHOO.util.Event.addListener("download_tool","click",function(){tmp_this.handleToolClick(this.rt_widgets.add_download_panel,true);tmp_this.trackEvents('event50','Downloads Initiated');},this,true);this.models.add_download.attachObserver(this.rt_widgets.add_download_panel);},setupReportLinkTool:function()
{this.models.report_link=new YAHOO.omniture.PartialHTMLModel();this.models.report_link.setURL(Omniture.URL.suite('ReportLink.Create'));var report_link_panel=new YAHOO.omniture.PartialHTMLWidget("shared_toolbar_panel");report_link_panel.setPartialHTMLModel(this.models.report_link);this.rt_widgets.report_link_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",report_link_panel,'link_tool');var tmp_this=this;YAHOO.util.Event.addListener("link_tool","click",function(){tmp_this.handleToolClick(this.rt_widgets.report_link_panel,true);},this,true);this.models.report_link.attachObserver(this.rt_widgets.report_link_panel);},setupEmailTool:function()
{var email_partial=new Omniture.EmailPartialHTMLWidget("shared_toolbar_panel");email_partial.setControlContainer(this);email_partial.setReportStateModel(this.models.report_state);email_partial.setDateRangeModel(this.models.date_range_model);this.rt_widgets.add_em_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",email_partial,'email_tool');this.rt_widgets.add_em_panel.assignDelegate(this);var btn,toggle_send=(function(){if(this.handleToolClick(this.rt_widgets.add_em_panel,true)){this.trackEvents('event51','Schedules Initiated');}}).bind(this);if(btn=$('email_tool')){btn.observe('click',toggle_send);}},setupBookmarkTool:function()
{var el=YAHOO.util.Dom.get("bookmark_tool");if(!el){return;}
var panel=new Omniture.BookmarkSavePanelWidget("shared_toolbar_panel");panel.setModel(this.models.publishing_nav_model);panel.setSaveCallback(this.models.publishing_nav_model,this.models.publishing_nav_model.saveBookmark);this.rt_widgets.add_bm_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",panel,'bookmark_tool');this.rt_widgets.add_bm_panel.assignDelegate(this);YAHOO.util.Event.addListener(el,"click",function(){this.handleToolClick(this.rt_widgets.add_bm_panel,true);this.trackEvents('event52','Bookmarks Initiated');},this,true);this.models.publishing_nav_model.attachObserver(panel);},setupAddDashboardTool:function()
{if(!$('dashboard_tool')){return;}
var tmp_this=this;var func=function(e){Omniture.util.popwin(this._getDbUrl(),'addBook',670,700,{resizable:true,scrollbars:true});tmp_this.trackEvents('event53','Dashboard Adds Initiated');};$('dashboard_tool').observe('click',func.bindAsEventListener(this));},setupShareTool:function()
{var el=YAHOO.util.Dom.get("share_tool");var tmp_this=this;if(el){YAHOO.util.Event.addListener(el,"click",function(){var chart_type=this.getChartTypeFromState(this.models.report_model.getResponse().clean_report_vars);var show_none=(this.models.report_model.getResponse().clean_report_vars.show_none||(Omniture.Config.report_state.clean_report_vars.ec_pri==29)?true:false);var reportSuiteName=OM.Config.reportSuiteName;var segmentName=OM.Config.segmentName;var opts={url:page_controller.linkToReport()+'&IMS=1',title:this.models.report_model.getResponse().report_name,product:Omniture.l10n.gettext('Reports & Analytics'),imsOrgId:this.models.report_model.getResponse().ims_org_id,type:'dv-report',dataTraits:[{type:'reportsuite',name:reportSuiteName},{type:'segment',name:segmentName}],data:{chartType:chart_type,chartOpts:{legacyColor:false,displayCount:this.models.report_model.getResponse().clean_report_vars.chart_item_count,showNone:show_none},dataURL:this.models.report_model.getResponse().rs_url}};if(this.models.report_model.getResponse().rs_url){tartan.shareCard(opts);}else{alert(Omniture.l10n.gettext("The report must be loaded before sharing"));}
tmp_this.trackEvents('event20','Share Initiated');},this,true);}},getChartTypeFromState:function(state)
{var chart=null;var type_to_type={'rank':{'gt_over_time':{'type':'line','opts':[]},'gt_bar':{'type':'bar','opts':['dodge','vertical']},'gt_stacked_bar':{'type':'bar','opts':['stack','vertical']},'gt_horiz_bar':{'type':'bar','opts':['dodge','flip']},'gt_stacked_horiz_bar':{'type':'bar','opts':['stack','flip']},'gt_fill':{'type':'line','opts':['fill']},'gt_stacked_fill':{'type':'line','opts':['fill','stack']},'gt_pie':{'type':'bar','opts':['polar']},'gt_scatter':{'type':'point','opts':[]},'gt_bubble':{'type':'point','opts':[]}},'trend':{'gt_over_time':{'type':'line','opts':[]},'gt_bar':{'type':'bar','opts':['dodge','vertical']},'gt_fill':{'type':'line','opts':['fill']},'gt_stacked_fill':{'type':'line','opts':['stack','fill']}}};var category='rank';if(state.view==0||state.view==3||state.view==17){category='trend';}
if(type_to_type[category].hasOwnProperty(state.chart_type)){chart='/'+category+'/'+type_to_type[category][state.chart_type]['type']+'/';if(type_to_type[category][state.chart_type]['opts'].length){var opts='';for(var i=0;i<type_to_type[category][state.chart_type]['opts'].length;i++){if(opts){opts=opts+',';}
opts=opts+type_to_type[category][state.chart_type]['opts'][i];}
if(opts){chart=chart+opts;}}}
if(!chart){chart='/rank/bar/vertical';}
return chart;},setupAlertTool:function()
{this.models.add_alert=new YAHOO.omniture.PartialHTMLModel();this.models.add_alert.setURL(Omniture.URL.suite('Alert.EditAlert',{oid:Omniture.Config.report_state.oid}));var add_alert_panel=new YAHOO.omniture.AlertSavePanelWidget("shared_toolbar_panel");add_alert_panel.setPartialHTMLModel(this.models.add_alert);add_alert_panel.setSavePanelModel(this.models.alert_model);add_alert_panel.setSaveCallback(this.models.alert_model,'saveAlert');this.rt_widgets.add_alert_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",add_alert_panel,'alert_tool');var el=YAHOO.util.Dom.get("alert_tool");if(el){var tmp_this=this;YAHOO.util.Event.addListener(el,"click",function(){tmp_this.handleToolClick(this.rt_widgets.add_alert_panel,true);tmp_this.trackEvents('event54','Alerts Initiated');},this,true);}
this.models.add_alert.attachObserver(this.rt_widgets.add_alert_panel);},setupCustomReportTool:function()
{var add_cr_panel=new Omniture.CustomReportPartialHTMLWidget("shared_toolbar_panel");add_cr_panel.setNavigationModel({getCustomReportIdByName:function(name){var id=null;$$('#left_nav .cust_reports a[href*="cust_report"]').each(function(a){if(a.innerHTML===name){id=a.href.match(/bookmark(?:=|%3D)(\d*)/)[0];if(id){id=id.replace(/%3D|\D/g,'');}}});return id;},saveCustomReport:function(o){var state=Omniture.Config.report_state,params={oid:state.oid,rsid:state.rsid,custom_report_name:o.name};if(o.id){params.custom_report_id=o.id;}
params.el_prefix=Omniture.Config.OM_MENU_ID_CUSTOM_REPORT;var url=Omniture.URL.suitej('CustomReport.Save',params);new Ajax.Request(url,{method:'get',evalJSON:'force',onSuccess:function(xhr){var response=xhr.responseJSON||OM.getResponseJSONFromResponseText(xhr.responseText);if(!response||!response.success_msg){return;}
page_controller.addMessage(response.success_msg,'success');var menu=$('sc_left_nav_root').down('.cust_reports').show(),link=$(response.element_id);if(link&&(link=link.down('a'))){link.href=response.url;return;}
link=new Element('a',{href:response.url}).update(o.name.escapeHTML());menu.down('ul').insert(new Element('li',{id:response.element_id}).insert(link));}});}});this.rt_widgets.add_cr_panel=new YAHOO.omniture.ReportToolWidget("shared_toolbar_panel",add_cr_panel,'custom_report_tool');var el=YAHOO.util.Dom.get("custom_report_tool");if(el){var tmp_this=this;YAHOO.util.Event.addListener(el,"click",function(){tmp_this.handleToolClick(this.rt_widgets.add_cr_panel,true);tmp_this.trackEvents('event56','Custom Reports Initiated');},this,true);}},setupDataExtractTool:function()
{var el=YAHOO.util.Dom.get("extract_tool");var tmp_this=this;if(el){YAHOO.util.Event.addListener(el,"click",function(){Omniture.util.popwin(Omniture.URL.fs('Flex.Wizard',{'report_name':Omniture.Config.reportname}),'',640,525,{});tmp_this.trackEvents('event55','Data Extracts Initiated');},this,true);}},setupCopyGraphTool:function()
{var el=YAHOO.util.Dom.get("copy_graph_tool");if(!el){return;}
this.rt_widgets.add_copygraph_panel=new YAHOO.omniture.CopyGraphPanelWidget("send_copygraph_panel");YAHOO.util.Event.addListener(el,"click",function(){this.handleToolClick(this.rt_widgets.add_copygraph_panel,false)},this,true);this.models.report_model.attachObserver(this.rt_widgets.add_copygraph_panel,'graphArrived');},addMessage:function(message,type,callback,id)
{return this.models.messages_model.addMessage(message,type,callback,id);},removeMessage:function(id)
{this.models.messages_model.removeMessage(id);},_getDbUrl:function()
{if(Omniture.Config.edit_bookmark)
{return Omniture.URL.fs("Dashboard.ReportletWizard",{"object_id":Omniture.Config.real_oid,"account":this.models.report_state.rsid,"edit_workflow":1,"bookmark_id":Omniture.Config.edit_bookmark.id});}
else
{return Omniture.URL.fs("Dashboard.ReportletWizard",{"object_id":Omniture.Config.real_oid,"account":this.models.report_state.rsid,"customreportname":Omniture.Config.reportname});}},newCustReport:function(model)
{this.addMessage(model.last_success_message,"success");},_getPriorityWidgetList:function()
{return['graph'];},downloadableReportTrackingCode:function(scheduled,report_format,zipped,frequency)
{var report_format=report_format||"NA";var frequency=frequency||"NA";var dl_format=report_format+":"+(zipped?"zipped":"notzipped");if(scheduled)
{if(s&&s.tl)
{s.linkTrackVars="events,prop24,prop25";s.linkTrackEvents="event5";s.prop24=dl_format;s.prop25=frequency;s.events="event5";s.tl(true,'o','Scheduled Report');}}
else
{if(s&&s.tl)
{s.linkTrackVars="events,prop24";s.linkTrackEvents="event4";s.prop24=dl_format;s.events="event4";s.tl(true,'o','Downloaded Report');}}},trackEvents:function(event_info,event_desc)
{if(s&&s.tl)
{s.linkTrackVars="events";s.linkTrackEvents=event_info;s.events=event_info;s.tl(true,'o',event_desc);return true;}},trackOBUEvents:function(event_info,event_desc)
{var obuet=window.obuet;if(obuet&&obuet.tl)
{obuet.linkTrackVars="events";obuet.linkTrackEvents=event_info;obuet.events=event_info;obuet.tl(true,'o',event_desc);return true;}},addNewDashboard:function(id,title,is_dx){this.insertNewDashboard(id,title,is_dx,'_header');this.insertNewDashboard(id,title,is_dx,'');},insertNewDashboard:function insertNewDashboard(id,title,is_dx,suffix){var label=is_dx&&$('d_legacy'+suffix),wid=(is_dx?'pr_d_'+id:'d_'+id)+suffix,url=(is_dx?OM.URL.book(id,true,{},true):OM.URL.dashboard(id,{},true)),li='<li id="'+wid+'"><a href="'+url+'">'+title.escapeHTML()+'</a></li>';if(label){label.insert({before:li});}
else{$('pub_s_m_d'+suffix).insert(li);}},setDefaultMetrics:function(oid,metric_list,link){if(link.up().hasClassName('tool-working')){return;}
var forget=+link.up().addClassName('tool-working').readAttribute('data-is-default'),url=OM.URL.fs('Report.SetDefaultMetrics',{oid:oid,metric_list:metric_list,forget:forget});if(forget)this.trackOBUEvents('event44','Default metrics forgotten');else this.trackOBUEvents('event43','Default metrics remembered');new Ajax.Request(url,{method:'get',evalJSON:'force',onComplete:function(xhr){var response=xhr.responseJSON||OM.getResponseJSONFromResponseText(xhr.responseText)||{},span=link.up().removeClassName('tool-working'),alt_text=link.readAttribute('data-alt-text');if(!response.success_msg){return page_controller.addMessage(response.error_msg||'Your change could not be saved.'.toLocaleString(),'failure');}
page_controller.addMessage(response.success_msg,'success');link.up().writeAttribute('data-is-default',forget?'0':'1');link.down('i').remove();link.writeAttribute('data-alt-text',link.innerHTML).update('<i></i>'+alt_text);if(!forget&&$('show_defaults')){$('show_defaults').hide();}}});},showDefaultMetrics:function(){this.trackOBUEvents('event45','Default metrics shown');page_controller.changeSettings('use_default_metrics|1');},toggleCalEvents:function toggleCalEvents(){$('cal_events_container').toggle();$('show_cal_events').className=$('cal_events_container').visible()?'coral-Icon coral-Icon--chevronUp coral-Icon--sizeXS':'coral-Icon coral-Icon--chevronDown coral-Icon--sizeXS';},toggleSummaryData:function toggleSummaryData(){var contents=$$('tr.summary_table_contents');for(var i=0;i<contents.length;i++){if(contents[i]!=null){if(contents[i].visible()){$('data_table_header_control').innerHTML='<img src="https://sc.omniture.com/sc15/reports/images/icon_plus_9x9.gif">';}else{$('data_table_header_control').innerHTML='<img src="https://sc.omniture.com/sc15/reports/images/icon_minus_9x9.gif">';}
contents[i].toggle();}}},showCurrentDataLatencyInfo:function showCurrentDataLatencyInfo(){console.log('hi');}});