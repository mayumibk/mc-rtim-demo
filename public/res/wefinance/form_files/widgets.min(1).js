CQ.Ext.namespace("CQ.searchpromote");
CQ.searchpromote.FacetList=CQ.Ext.extend(CQ.Ext.form.ComboBox,{constructor:function(a){CQ.Util.applyDefaults(a,{triggerAction:"all",mode:"local",autoLoad:false,displayField:"label",valueField:"name",store:new CQ.Ext.data.JsonStore({fields:["name","label"],root:"facets",id:"name",url:"localhost"}),listeners:{loadcontent:function(d,b,c){d.store.proxy.setUrl(c+".facetlist.json");
d.store.load()
}}});
CQ.searchpromote.FacetList.superclass.constructor.call(this,a)
}});
CQ.Ext.reg("searchpromote-facetlist",CQ.searchpromote.FacetList);
CQ.Ext.namespace("CQ.searchpromote");
CQ.searchpromote.SearchPromote={SP_REMOTEIDX_ERROR:"Search&amp;Promote remote control indexing service returned an error.",SP_REMOTEIDX_SERVER_ERR:"There was an error sending the request to Search&amp;Promote remote control indexing service",SP_REMOTEIDX_SUCCESS:"Search&amp;Promote remote control indexing service request was successful.",showButtonIndicator:function(b,c){var a=b.find("localName","connectButton")[0];
if(this.labelBtn==null){this.labelBtn=a.getText()
}if(!c){CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connection successful")).hide()
}else{CQ.Ext.Msg.wait(CQ.I18n.getMessage("Connecting to Search&Promote..."))
}},getField:function(a,c){var b=a.find("name","./"+c);
if((CQ.Ext.isArray(b))&&(b.length>0)){return b[0]
}},connect:function(dialog){var memberid=this.getField(dialog,"memberid");
var accountno=this.getField(dialog,"accountno");
var that=this;
this.showButtonIndicator(dialog,true);
function fieldEmpty(field,msg){if(!field||field.getValue()==""){that.showButtonIndicator(dialog,false);
CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),msg);
return true
}return false
}if(fieldEmpty(memberid,CQ.I18n.getMessage("Please enter the member id."))||fieldEmpty(accountno,CQ.I18n.getMessage("Please enter the account no."))){return
}CQ.HTTP.post(CQ.HTTP.externalize("/libs/cq/searchpromote/searchform"),function(options,success,response){that.showButtonIndicator(dialog,false);
if(success){var formxml=CQ.HTTP.eval(response);
if(formxml&&formxml.xml){var formxmlField=that.getField(dialog,"searchformxml");
formxmlField.setValue(formxml.xml);
dialog.find("localName","connectButton")[0].setText(CQ.I18n.getMessage("Re-Connect to Search&Promote"));
CQ.Ext.Msg.show({title:CQ.I18n.getMessage("Success"),msg:CQ.I18n.getMessage("Connection successful"),buttons:CQ.Ext.Msg.OK,icon:CQ.Ext.Msg.INFO});
CQ.cloudservices.getEditOk().enable()
}else{if(formxml&&formxml.error){var cause=formxml.error;
if(formxml.error.indexOf("Credentials")>-1){cause="Login to Search&Promote failed"
}CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getVarMessage(cause))
}}}else{CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage("Connection to Search&Promote could not be established."))
}},{memberid:memberid.getValue(),accountno:accountno.getValue()},this,true)
},callRemoteIndex:function(c){var a=this.getField(c,"fullindex");
var d=this;
var b=c.path.substring(0,c.path.lastIndexOf("/"));
CQ.HTTP.post(CQ.HTTP.externalize("/libs/cq/searchpromote/remoteindex"),function(f,g,e){if(g){if(e.responseText.indexOf("Error")>-1){CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage(d.SP_REMOTEIDX_ERROR))
}else{CQ.Ext.Msg.show({title:CQ.I18n.getMessage("Success"),msg:CQ.I18n.getMessage(d.SP_REMOTEIDX_SUCCESS),buttons:CQ.Ext.Msg.OK,icon:CQ.Ext.Msg.INFO})
}}else{CQ.Ext.Msg.alert(CQ.I18n.getMessage("Error"),CQ.I18n.getMessage(d.SP_REMOTEIDX_SERVER_ERR))
}},{fullfeed:a.getValue(),configPath:b},this,true)
},enableSchedulerControlChanged:function(a,b){this.toggleScheduleExpressionField(a,b)
},toggleScheduleExpressionField:function(b,a){var c=this.getField(b,"schedule");
c.setVisible(a)
},updateSchedulerConfiguration:function(c){var b=this.getField(c,"enabled");
var d=this.getField(c,"schedule");
var a=c.path.substring(0,c.path.lastIndexOf("/"));
CQ.HTTP.post(CQ.HTTP.externalize(c.path+"/config"),function(f,g,e){},{"jcr:primaryType":"cq:ExporterConfigFolder",expression:d.getValue(),type:"searchpromote-index-caller",source:"(not set)",enabled:b.getValue(),"enabled@TypeHint":"Boolean",configPath:a},this,true)
},onBeforeShow:function(b){var a=this.getField(b,"enabled")
},onSelectionChanged:function(c,g,b){var e=c.findParentByType("dialog");
var a=this.getField(e,"schedulelabel");
var f=c.options.length;
for(var d=0;
d<f;
d++){if(c.options[d].value===g){a.setValue(c.options[d].text)
}}}};