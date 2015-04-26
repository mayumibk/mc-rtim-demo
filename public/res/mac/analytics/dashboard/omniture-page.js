
YAHOO.omniture.SuiteContainer=function(dom_id)
{this.init(dom_id);};YAHOO.lang.extend(YAHOO.omniture.SuiteContainer,YAHOO.omniture.ContainerWidget,{init:function(dom_id)
{YAHOO.omniture.SuiteContainer.superclass.init.call(this,dom_id);this._menus=Array();this.registerControls();this.toggleNav=this.toggleNav.bindAsEventListener(this);var btns=$$('.toggle_menu'),i,l=btns.length;for(i=0;i<l;++i){btns[i].observe('click',this.toggleNav);}},toggleNav:function(e){var a=e.findElement(),att=a.readAttribute('data-user-attr'),c=a.up('.NavigationMenu-container'),hidden=c&&c.hasClassName('collapsed'),title=a.title,alt=a.readAttribute('data-alt-title');if(c){c.toggleClassName('collapsed');}
if(att){Omniture.user.setPersistentAttribute(att,hidden?'0':'1');}
if(alt){a.writeAttribute('data-alt-title',title).title=alt;}
return this;},registerControls:Prototype.emptyFunction,_hasLeftNavMenu:function _hasLeftNavMenu(){return true;}});YAHOO.omniture.NavigationModel=function()
{this.init();}
YAHOO.lang.extend(YAHOO.omniture.NavigationModel,YAHOO.omniture.Model,{init:function()
{YAHOO.omniture.NavigationModel.superclass.init.call(this);this._menu=null;this._element_cache=[];},setMenu:function(menu)
{this._menu=menu;},getMenu:function()
{return this._menu;},getHTML:function()
{return this._menu.getHTML();},getAdjustedHTML:function(new_size)
{if(this._menu.adjustSize){this._menu.adjustSize(new_size);}
return this.getHTML();},menuActivated:function(menu)
{this._page_controller.menuActivated(menu);},deselect:function()
{this._menu.deselect();},canShowSubMenus:function()
{return this._menu.canShowSubMenus();},adjustSize:function(new_size)
{if(this._menu.adjustSize){this._menu.adjustSize(new_size);this.notify();return true;}
return false;},getElement:function(element_id)
{return null;if(this._element_cache[element_id]){return this._element_cache[element_id];}else{var elements=this._menu.getElements();for(var i=0;i<elements.length;i++){if(!this._element_cache[elements[i].getCorrespondingDomId()]){this._cacheElement(elements[i]);}
if(this._element_cache[element_id]){return this._element_cache[element_id];}}}
return null;},_cacheElement:function(element)
{this._element_cache[element.getCorrespondingDomId()]=element;if(element.getElements){var elements=element.getElements();for(var i=0;i<elements.length;i++){this._cacheElement(elements[i]);}}}});YAHOO.omniture.PubNavigationModel=function()
{this.init();}
YAHOO.lang.extend(YAHOO.omniture.PubNavigationModel,YAHOO.omniture.NavigationModel,{setReportStateModel:function(model)
{this._state=model;},saveBookmark:function(folder,bookmark,share,shared_folder,default_report,d_access)
{var params={};params.oid=this._state.oid;params.rsid=this._state.rsid;this.folder_name=folder.name;if(folder.value){params.folder_id=folder.value;}else{params.folder_name=folder.name;}
params.bookmark_name=bookmark.name;if(bookmark.value){params.bookmark_id=parseInt(bookmark.value.substring(Omniture.Config.OM_MENU_ID_BOOKMARK.length+1),10);}
if(share){params.share=1;if(shared_folder&&shared_folder.value){params.shared_folder_id=shared_folder.value;}else{params.shared_folder_name=shared_folder.name;}}
if(default_report){params.is_default=1;}
if(d_access){params.d_access=1;}
var url=Omniture.URL.suitej('Bookmark.Save',params);this._save_bm_json=new YAHOO.omniture.JSONModel();this._save_bm_json.attachObserver(this,'handleSavedBookmark');this._save_bm_json.setURL(url);this._save_bm_json.getResponse();},handleSavedBookmark:function(response)
{if(!response.bookmark)var response=this._save_bm_json.getResponse();if(response){this.insertBookmark(response.bookmark,response.folder,'');this.insertBookmark(response.bookmark,response.folder,'_header');if(this._page_controller.addMessage!='undefined'){this._page_controller.addMessage(Omniture.l10n.gettext("Bookmark successfully created"),'success');}}},insertBookmark:function insertBookmark(bookmark,folder,suffix){var menu=$('om_pub_root'+suffix);if(!menu){return;}
var id=OM.Config.OM_MENU_ID_BOOKMARK+'_'+bookmark.id+suffix,li=$(id)||new Element('li');li.update('<a href="'+bookmark.url+'">'+bookmark.name.escapeHTML()+'</a>').id=id;var fid=OM.Config.OM_MENU_ID_BOOKMARK_FOLDER+'_'+folder.id+suffix,ul=$(fid);if(!ul){ul=new Element('ul',{id:fid});var folderli=new Element('li',{'class':'folder'});folderli.update('<a>'+folder.name.escapeHTML()+'</a>');folderli.insert(ul);menu.insert(folderli);}
if(li.up()!==ul){ul.insert(li);}
this.notify();},isValidBookmarkFolder:function(folder)
{return folder.getElements!=null&&folder.getCorrespondingDomId().substring(0,Omniture.Config.OM_MENU_ID_BOOKMARK_FOLDER.length)==Omniture.Config.OM_MENU_ID_BOOKMARK_FOLDER;},isValidBookmark:function(bookmark)
{return bookmark.getElements==null&&bookmark.getCorrespondingDomId().substring(0,Omniture.Config.OM_MENU_ID_BOOKMARK.length)==Omniture.Config.OM_MENU_ID_BOOKMARK;},bookmarkIdToDomId:function(bid)
{return Omniture.Config.OM_MENU_ID_BOOKMARK+':'+bid;}});YAHOO.omniture.HeaderAdminNavigationModel=function()
{YAHOO.omniture.HeaderAdminNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.HeaderAdminNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('header_admin');}});YAHOO.omniture.HeaderUserNavigationModel=function()
{YAHOO.omniture.HeaderUserNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.HeaderUserNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('header_user');}});YAHOO.omniture.ScriptHTMLModel=function(id)
{this.init(id);}
YAHOO.lang.extend(YAHOO.omniture.ScriptHTMLModel,YAHOO.omniture.Model,{init:function(id)
{YAHOO.omniture.ScriptHTMLModel.superclass.init.call(this,id);this._partial_html="";},setURL:function(url)
{this._url=url;},getURL:function()
{return this._url;},getHTML:function()
{if(this.isLoginPage(this._partial_html)){document.location=encodeURI(document.location)+'&logout_message=session_expired';}
else if(this._partial_html){return this._partial_html;}else if(this._url){var script_tag=document.createElement('script');script_tag.src=this.getURL()+'&model='+this._id;var head=document.getElementsByTagName('head');head=head[0];head.appendChild(script_tag);}},setHTML:function(html)
{this._partial_html=html;this.notify();},handleSuccess:function(result)
{this._partial_html=result.responseText;this.notify();},handleFailure:function(result){if(result.status==403){document.location=encodeURI(document.location)+'&logout_message=session_expired';}},isLoginPage:function(response_text)
{if(response_text.indexOf('<!--login-->')>0){return true;}
return false;}});YAHOO.omniture.NavigationWidget=function(container_id)
{this.init(container_id);};YAHOO.lang.extend(YAHOO.omniture.NavigationWidget,YAHOO.omniture.PartialHTMLWidget,{render:function()
{if(YAHOO.omniture.NavigationWidget.superclass.render.call(this)){var menu=this._partial_html_model.getMenu();if(this.shouldContract()||this.shouldExpand()){var avail_size=menu._getDomElement().offsetWidth;var old_overflow=YAHOO.util.Dom.getStyle(menu.getCorrespondingDomId(),'overflow');var partial_html_dom_element=this.getDomElement();if(partial_html_dom_element){partial_html_dom_element.innerHTML=this._partial_html_model.getAdjustedHTML(avail_size);}
YAHOO.util.Dom.setStyle(menu.getCorrespondingDomId(),'overflow',old_overflow);}
menu.attachListeners();return true;}
return false;},shouldContract:function()
{return false;},shouldExpand:function()
{return false;}});Omniture.PublishingNavWidget=function(container_id)
{this.init(container_id);};YAHOO.lang.extend(Omniture.PublishingNavWidget,YAHOO.omniture.NavigationWidget,{shouldContract:function()
{return true;}});YAHOO.omniture.Element=function(display_name,corresponding_dom_id,style_class)
{this.init(display_name,corresponding_dom_id,style_class,'Element');};var g_menu_element=null;YAHOO.omniture.Element.prototype={init:function(display_name,corresponding_dom_id,style_class,class_type)
{this._display_name=display_name;this._style_classes=new Array();this._corresponding_dom_id=corresponding_dom_id;this._class_type=class_type;this._parent=null;},getDisplayName:function()
{return this._display_name;},getCorrespondingDomId:function()
{return this._corresponding_dom_id;},setCorrespondingDomId:function(dom_id)
{this._corresponding_dom_id=dom_id;},addPreRenderStyleClass:function(style_class)
{this._style_classes.push(style_class);},removePreRenderStyleClass:function(style_class)
{for(var i=0;i<this._style_classes.length;i++){if(this._style_classes[i]==style_class){this._style_classes.splice(i,1);}}},toString:function()
{var to_string_components=new Array('type--'+this._class_type);var component_names=new Array('display_name','corresponding_dom_id','style_class','url');for(var i=0;i<component_names.length;i++){for_eval="this._"+component_names[i];if(eval(for_eval)){to_string_components.push(component_names[i]+"--"+eval(for_eval));}}
return to_string_components.join(' :: ')+" <br/>\n";},getHTML:function()
{},select:function()
{},deselect:function()
{},attachListeners:function()
{this._attachListeners();},_getDomElement:function()
{return document.getElementById(this._corresponding_dom_id);},_attachListeners:function()
{var Event=YAHOO.util.Event;Event.addListener(this._corresponding_dom_id,"click",this.onClick,this,true);Event.addListener(this._corresponding_dom_id,"mouseover",this.onMouseOver,this,true);Event.addListener(this._corresponding_dom_id,"mouseout",this.onMouseOut,this,true);},highlight:function()
{YAHOO.util.Dom.addClass(this._getDomElement(),"highlight");},clearHighlight:function()
{YAHOO.util.Dom.removeClass(this._getDomElement(),"highlight");},_getParent:function()
{return this._parent;},_getStyleClassString:function()
{if(this._style_classes.length==0){return null;}
return this._style_classes.join(" ");},onClick:function(e)
{YAHOO.util.Event.stopEvent(e);},onMouseOver:function(e)
{this._g_menu.clearSubmenuTimeout();YAHOO.util.Event.stopEvent(e);},onMouseOut:function(e)
{this._g_menu.startTimeout();YAHOO.util.Event.stopEvent(e);}};YAHOO.omniture.Container=function(display_name,corresponding_dom_id,style_class)
{this.init(display_name,corresponding_dom_id,style_class,'Container');};YAHOO.lang.extend(YAHOO.omniture.Container,YAHOO.omniture.Element,{init:function(display_name,corresponding_dom_id,style_class,class_type)
{YAHOO.omniture.Container.superclass.init.call(this,display_name,corresponding_dom_id,style_class,class_type);this._elements=new Array();this._selected_element=null;},addFolder:function(display_name,corresponding_dom_id)
{var new_folder=new YAHOO.omniture.Folder(display_name,corresponding_dom_id);return this._addElement(new_folder);},addSection:function(display_name,corresponding_dom_id,style_class)
{var new_section=new YAHOO.omniture.Section(display_name,corresponding_dom_id,style_class);return this._addElement(new_section);},addLink:function(display_name,corresponding_dom_id,link_action,classification_hierarchy)
{var new_link=new YAHOO.omniture.Link(display_name,corresponding_dom_id,link_action,classification_hierarchy);return this._addElement(new_link);},addSectionLink:function(display_name,corresponding_dom_id,link_action,style_class)
{var new_section_link=new YAHOO.omniture.SectionLink(display_name,corresponding_dom_id,link_action,style_class);return this._addElement(new_section_link);},addInput:function(display_name,corresponding_dom_id,text_field_obj,button_obj)
{var new_input=new YAHOO.omniture.Input(display_name,corresponding_dom_id,text_field_obj,button_obj);return this._addElement(new_input);},addDivider:function(corresponding_dom_id)
{var new_divider=new YAHOO.omniture.Divider(corresponding_dom_id);return this._addElement(new_divider);},insertElement:function(new_element,index)
{new_element._parent=this;this._elements.splice(index,0,new_element);return new_element;},removeElement:function(index)
{var old_element=this._elements[index];this._elements.splice(index,1);return old_element;},getElements:function()
{return this._elements;},getElement:function(index)
{return this._elements[index];},findElementOffset:function(element_id)
{for(var i=0;i<this._elements.length;i++){if(this._elements[i].getCorrespondingDomId()==element_id){return i;}}
return-1;},setElements:function(elements)
{this._elements=new Array();for(var i=0;i<elements.length;i++){this._addElement(elements[i]);}},getHTML:function()
{var html="";for(var i=0;i<this._elements.length;i++){html+=this._elements[i].getHTML();}
return html;},clearHighlight:function()
{YAHOO.omniture.Container.superclass.clearHighlight.call(this);if(this._selected_element){this._selected_element.clearHighlight();}},highlight:function()
{YAHOO.omniture.Container.superclass.highlight.call(this);if(this._selected_element){this._selected_element.highlight();}},deselect:function()
{if(this._selected_element){this._selected_element.deselect();this._selected_element=null;}},_addElement:function(new_element)
{this._adjustBordersBeforeAdd(new_element);new_element._parent=this;new_element._g_menu=new_element._parent._g_menu;this._elements.push(new_element);return new_element;},_adjustBordersBeforeAdd:function(new_element)
{new_element.addPreRenderStyleClass("no_bottom_border");if(this._hasElements()){this._elements[this._elements.length-1].removePreRenderStyleClass("no_bottom_border");}},_hasElements:function()
{return(this._elements.length>0);},handleChildClick:function(e,child)
{},handleChildMouseOver:function(e,child)
{if(this._selected_element!=null){this._selected_element.deselect();}
this._g_menu.clearSubmenuTimeout();this._selected_element=child;this._g_menu.highlight();},attachListeners:function()
{YAHOO.omniture.Container.superclass.attachListeners.call(this);for(var i=0;i<this._elements.length;i++){this._elements[i].attachListeners();}}});YAHOO.omniture.Menu=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,null,'Menu');};YAHOO.omniture.Menu.ZINDEX=10000;YAHOO.omniture.Menu._parentZIndexes=[];YAHOO.lang.extend(YAHOO.omniture.Menu,YAHOO.omniture.Container,{init:function(display_name,corresponding_dom_id,style_class,class_type)
{YAHOO.omniture.Menu.superclass.init.call(this,display_name,corresponding_dom_id,style_class,class_type);this._view_submenus=false;this._g_menu=this;this._model=null;},startTimeout:function()
{var this_menu=this;this._submenu_timeout=setTimeout(function(){this_menu.deselect();},1500);},activateShowSubMenus:function()
{this.setParentZIndexes();this._view_submenus=true;if(this._model){this._model.menuActivated(this);}},setParentZIndexes:function(){var Dom=YAHOO.util.Dom;var element=this._getDomElement();var position='';var data={};if(YAHOO.omniture.Menu._parentZIndexes.length){this.unsetParentZIndexes();}
do{if(element.tagName=='BODY')break;position=Dom.getStyle(element,'position');if(position=='absolute'||position=='relative'){data={};data.element=element;if(element.style.zIndex!=YAHOO.omniture.Menu.ZINDEX){data.zIndex=element.style.zIndex;element.style.zIndex=YAHOO.omniture.Menu.ZINDEX;}
YAHOO.omniture.Menu._parentZIndexes.push(data);}}while(element=element.parentNode);},deactivateShowSubMenus:function()
{this.unsetParentZIndexes();this._view_submenus=false;},unsetParentZIndexes:function(){var data='';var i=YAHOO.omniture.Menu._parentZIndexes.length;while(i--){data=YAHOO.omniture.Menu._parentZIndexes[i];data.element.style.zIndex=data.zIndex;}
YAHOO.omniture.Menu._parentZIndexes=[];},canShowSubMenus:function()
{return this._view_submenus;},clearSubmenuTimeout:function()
{if(this._submenu_timeout){clearTimeout(this._submenu_timeout);}},deselect:function()
{if(this._view_submenus){this.deactivateShowSubMenus();YAHOO.omniture.Menu.superclass.deselect.call(this);}},setModel:function(model)
{this._model=model;},getHTML:function(class_name)
{if(!class_name){class_name='menu';}
var html='<div id="'+this._corresponding_dom_id+'" class="'+class_name+'"><ul>';html+=YAHOO.omniture.Menu.superclass.getHTML.call(this);html+='</ul></div>';return html;},_adjustBordersBeforeAdd:function(new_element)
{},handleChildMouseOver:function(e,section)
{if(!YAHOO.omniture.Menu._parentZIndexes.length&&this._view_submenus){this.setParentZIndexes();}
if(this._selected_element&&(this._selected_element._corresponding_dom_id!=section._corresponding_dom_id)){this._selected_element.deselect();this._selected_element=section;}
if(this._selected_element==null){this._selected_element=section;}}});YAHOO.omniture.Folder=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,'Folder');};YAHOO.lang.extend(YAHOO.omniture.Folder,YAHOO.omniture.Container,{init:function(display_name,corresponding_dom_id,class_type)
{YAHOO.omniture.Folder.superclass.init.call(this,display_name,corresponding_dom_id,null,class_type);this._submenu_indent=2;this._viewport_submenu_padding=3;this.reflown=false;},getHTML:function()
{var html='<li style="position: relative;" id="'+this._corresponding_dom_id+'"';var style_class=this._getStyleClassString();if(style_class!=null){html+=' class="'+style_class+'"';}
html+='><span class="itemtitle">'+this._display_name+'</span>';html+=this._getSubmenu();if(YAHOO.omniture.Folder.superclass._hasElements.call(this)){html+='<div class="folder_arrow_image_container"></div>';}
html+='</li>';return html;},_getSubmenu:function()
{var html="";if(YAHOO.omniture.Folder.superclass._hasElements.call(this)){html+='<div id="'+this._corresponding_dom_id+'_submenu" class="mnu_sub" style="position: absolute; visibility: hidden; top: -9999px; left: -9999px;"><div class="mnu_sub_container"><ul style="position: relative;">';html+=YAHOO.omniture.Folder.superclass.getHTML.call(this);html+='</ul></div></div>';}
return html;},select:function()
{YAHOO.omniture.Folder.superclass.highlight.call(this);if(this._g_menu.canShowSubMenus()){this._showSubMenu();}},deselect:function()
{YAHOO.omniture.Folder.superclass.clearHighlight.call(this);this._hideSubMenu();},_getSubMenuDomElement:function()
{return document.getElementById(this._corresponding_dom_id+'_submenu');},_showSubMenu:function()
{if(YAHOO.omniture.Folder.superclass._hasElements.call(this)){var submenu_dom_element=this._getSubMenuDomElement();YAHOO.util.Dom.setStyle(submenu_dom_element,"top",this._getYPos()+"px");YAHOO.util.Dom.setStyle(submenu_dom_element,"left",this._getXPos()+"px");YAHOO.util.Dom.setStyle(submenu_dom_element,"visibility","visible");var dom_element=this._getDomElement();var iframeShim=Omniture.util.createIframeShim(submenu_dom_element,submenu_dom_element,dom_element.parentNode.parentNode);YAHOO.util.Dom.setStyle(iframeShim,'display','block');if(!this.reflown){this.reflown=true;document.body.className=document.body.className;}
YAHOO.util.Dom.setStyle(dom_element,"z-index","65535");}},_getXPos:function(){var header_dom_element=YAHOO.omniture.Folder.superclass._getDomElement.call(this);var header_width=header_dom_element.offsetWidth;return header_width-this._submenu_indent;},_getYPos:function(){var scroll_top=window.pageYOffset||document.documentElement&&document.documentElement.scrollTop||document.body.scrollTop||0;var viewport_height=window.innerHeight||document.documentElement&&document.documentElement.clientHeight||document.body.clientHeight||0;var y_pos=YAHOO.util.Dom.getY(this._getDomElement());var submenu_height=this._getSubMenuDomElement().offsetHeight;if(submenu_height>viewport_height){submenu_y_position=-1*(y_pos-scroll_top-this._viewport_submenu_padding);}
else if((y_pos+submenu_height)>(viewport_height+scroll_top)){submenu_y_position=-1*(submenu_height-(viewport_height+scroll_top-y_pos)+this._viewport_submenu_padding);}else{submenu_y_position=0;}
return submenu_y_position;},_hideSubMenu:function()
{if(YAHOO.omniture.Folder.superclass._hasElements.call(this)){YAHOO.omniture.Folder.superclass.deselect.call(this);var submenu_dom_element=this._getSubMenuDomElement();var dom_element=this._getDomElement();YAHOO.util.Dom.setStyle(dom_element.parentNode.parentNode.IFRAME_SHIM,'display','none');YAHOO.util.Dom.setStyle(submenu_dom_element,"visibility","hidden");var dom_element=this._getDomElement();YAHOO.util.Dom.setStyle(dom_element,"z-index","0");}},onClick:function(e)
{this._parent.handleChildClick(e,this);this._g_menu.activateShowSubMenus();this.onMouseOver(e);},onMouseOver:function(e)
{this._parent.handleChildMouseOver(e,this);this.select();YAHOO.omniture.Folder.superclass.onMouseOver.call(this,e);YAHOO.util.Event.stopEvent(e);}});YAHOO.omniture.Section=function(display_name,corresponding_dom_id,style_class)
{this.init(display_name,corresponding_dom_id,style_class,'Section');};YAHOO.lang.extend(YAHOO.omniture.Section,YAHOO.omniture.Container,{init:function(display_name,corresponding_dom_id,style_class,class_type)
{YAHOO.omniture.Section.superclass.init.call(this,display_name,corresponding_dom_id,style_class,class_type);this._open_state=false;this._menu_save_url='';this._save_parameter='';this._pre_img=null;this._post_img=null;},setPreImg:function(src,class_name)
{if(!class_name){class_name="section_pre_img";}
this._pre_img={src:src,class_name:class_name};},setPostImg:function(src,class_name)
{if(!class_name){class_name="section_post_img";}
this._post_img={src:src,class_name:class_name};},addMenuSaveURL:function(url,save_parameter){this._menu_save_url=url;this._save_parameter=save_parameter;},_generateMenuSaveURL:function(url,save_parameter){var menu_open_state_string=(this._open_state)?'1':'0';return this._menu_save_url+"&"+this._save_parameter+"="+menu_open_state_string;},setOpen:function(){this._open_state=(this._open_state)?false:true;},getHTML:function()
{_section_html="";if(this._pre_img){_section_html+='<img class="'+this._pre_img.class_name+'" src="'+this._pre_img.src+'" />';}
_section_html+='<div id="'+this._corresponding_dom_id+'_icon" class="mnu_title closed_section_icon">';_section_html+=this._display_name;_section_html+='</div>';if(this._post_img){_section_html+='<img class="'+this._post_img.class_name+'" src="'+this._post_img.src+'" />';}
var style_class=this._getStyleClassString();if(style_class!=null){_section_html=this._wrapHeaderInStyle(_section_html,style_class);}
html=this._getCompleteSectionBodyHTML(_section_html,style_class);if(this._open_state==true)
{this._showSectionBody();}
return html;},_wrapHeaderInStyle:function(_section_html,style_class)
{return'<div class="'+style_class+'">'+_section_html+'</div>';},_getCompleteSectionBodyHTML:function(_section_html,style_class)
{var html='<li id="'+this._corresponding_dom_id+'" class="mnu_category">'+_section_html;if(style_class!=null){html+='<div class="'+style_class+'">';}
html+=this._getSectionBody();if(style_class!=null){html+='</div>';}
html+='</li>';return html;},_getSectionBody:function()
{var section_body="";if(YAHOO.omniture.Section.superclass._hasElements.call(this)){var disp_style="hidden";if(this._open_state){disp_style="visible";}
section_body+='<div id="'+this._corresponding_dom_id+'_section" class="mnu_container" style="visibility: '+disp_style+'; left: -9999px; top: -9999px; "><div class="mnu_container_sub"><ul>';section_body+=YAHOO.omniture.Section.superclass.getHTML.call(this);section_body+='</ul></div></div>';}
return section_body;},_showSectionBody:function()
{var section_id=this._corresponding_dom_id+"_section";var icon_div_id=this._corresponding_dom_id+"_icon";YAHOO.util.Dom.replaceClass(icon_div_id,"closed_section_icon","open_section_icon");YAHOO.util.Dom.setStyle(section_id,"visibility","visible");},_hideSectionBody:function()
{var section_id=this._corresponding_dom_id+"_section";var icon_div_id=this._corresponding_dom_id+"_icon";YAHOO.util.Dom.replaceClass(icon_div_id,"open_section_icon","closed_section_icon");YAHOO.util.Dom.setStyle(section_id,"visibility","hidden");},_toggleSectionBody:function()
{var section_id=this._corresponding_dom_id+"_section";var current_visibility=YAHOO.util.Dom.getStyle(section_id,"visibility");var dom_element=this._getDomElement();YAHOO.util.Dom.setStyle(dom_element.parentNode.parentNode.IFRAME_SHIM,'display','none');if(current_visibility=="hidden"){this._showSectionBody();}else{this._hideSectionBody();}},onClick:function(e)
{this.setOpen();var menu_save_image=new Image();menu_save_image.src=this._generateMenuSaveURL();this._toggleSectionBody();YAHOO.util.Event.stopEvent(e);},onMouseOver:function(e)
{YAHOO.omniture.Section.superclass.clearHighlight.call(this);this._parent.handleChildMouseOver(e,this);YAHOO.omniture.Section.superclass.onMouseOver.call(this,e);},handleChildMouseOver:function(e,child)
{this._parent.handleChildMouseOver(e,this);YAHOO.omniture.Section.superclass.handleChildMouseOver.call(this,e,child);}});YAHOO.omniture.Item=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,null,'Item');};YAHOO.extend(YAHOO.omniture.Item,YAHOO.omniture.Element);YAHOO.omniture.Link=function(display_name,corresponding_dom_id,link_action,classification_hierarchy)
{this.init(display_name,corresponding_dom_id,link_action,'Link',classification_hierarchy);};YAHOO.lang.extend(YAHOO.omniture.Link,YAHOO.omniture.Item,{init:function(display_name,corresponding_dom_id,link_action,class_type)
{YAHOO.omniture.Link.superclass.init.call(this,display_name,corresponding_dom_id,null,class_type);this._link_action=link_action;this._pre_img=null;this._post_img=null;},getLinkAction:function()
{return this._link_action;},setLinkAction:function(link_action)
{this._link_action=link_action;},getURL:function()
{return this._url;},setURL:function(url)
{this._url=url;},setPreImg:function(src,class_name)
{if(!class_name){class_name="link_pre_img";}
this._pre_img={src:src,class_name:class_name};},setPostImg:function(src,class_name)
{if(!class_name){class_name="link_post_img";}
this._post_img={src:src,class_name:class_name};},getHTML:function()
{var html='<li id="'+this._corresponding_dom_id+'"';var style_class=this._getStyleClassString();if(style_class!=null){html+=' class="'+style_class+'"';}
html+='>';if(this._pre_img){html+='<img class="'+this._pre_img.class_name+'" src="'+this._pre_img.src+'" />';}
html+='<span class="itemtitle">'+this._display_name+'</span>';if(this._post_img){html+='<img class="'+this._post_img.class_name+'" src="'+this._post_img.src+'" />';}
html+='</li>';return html;},select:function()
{YAHOO.omniture.Link.superclass.highlight.call(this);},deselect:function()
{YAHOO.omniture.Link.superclass.clearHighlight.call(this);},onClick:function(e)
{this._parent.handleChildClick(e,this);this._g_menu.deselect(true);var page_controller_handled_link=false;if(page_controller&&typeof page_controller.handleMenuLink=='function'){page_controller_handled_link=page_controller.handleMenuLink(this._url,this._link_action);}
if(!page_controller_handled_link){if(this._url){document.location=Omniture.URL.s(this._url,{'jpj':Omniture.Config.history_id});}else{eval(this._link_action);}}
YAHOO.util.Event.stopEvent(e);},onMouseOver:function(e)
{this._parent.handleChildMouseOver(e,this);this.select();YAHOO.omniture.Section.superclass.onMouseOver.call(this,e);YAHOO.util.Event.stopEvent(e);}});YAHOO.omniture.Divider=function(corresponding_dom_id)
{this.init(null,corresponding_dom_id,null,'Divider');};YAHOO.lang.extend(YAHOO.omniture.Divider,YAHOO.omniture.Item,{getHTML:function()
{var html='<li id="'+this._corresponding_dom_id+'" class="divider';var style_class=this._getStyleClassString();if(style_class!=null){html+=' '+style_class;}
html+='"></li>';return html;}});ImagePreloader=function()
{this.image_list=Array(Omniture.Config.PLATFORM_URL+'/images/Icons/icon_rt_arrow13x15.gif');}
ImagePreloader.prototype={loadImages:function()
{if(!document.images)return;var img=null;var img_obj_array=Array();for(var i=0;i<this.image_list.length;i++){img=new Image();img.src=this.image_list[i];img_obj_array.push(img);}}};YAHOO.omniture.HorizontalMenu=function(display_name,corresponding_dom_id,mode)
{this.init(display_name,corresponding_dom_id,null,'HorizontalMenu',mode);};YAHOO.lang.extend(YAHOO.omniture.HorizontalMenu,YAHOO.omniture.Menu,{getMoreElement:function()
{var last_element=this._elements[this._elements.length-1];if(last_element.getCorrespondingDomId()==this.getCorrespondingDomId()+'_menu_more'){return last_element;}
return null;},curSize:function()
{var cur_size=0;for(var i=0;i<this._elements.length;i++){cur_size+=this._elements[i]._getDomElement().offsetWidth;}
return cur_size;},adjustSize:function(new_size)
{if(this._elements.length<2){return;}
var cur_size=this.curSize();if(cur_size>new_size){var more_section=this.getMoreElement();if(!more_section){more_section=this._addElement(new YAHOO.omniture.HorizontalSection(Omniture.l10n.gettext('More'),this.getCorrespondingDomId()+'_menu_more',''));more_section.setPostImg(Omniture.Config.PLATFORM_URL+'/images/down_arrow.gif');var mid=more_section.getCorrespondingDomId();YAHOO.util.Event.onContentReady(mid,function(){YAHOO.util.Dom.addClass(mid,"more");});cur_size+=140;}
while(this._elements.length>2&&cur_size>new_size){var cur_element=this.removeElement(this._elements.length-2);var folder=more_section._addElement(new YAHOO.omniture.HorizontalFolder(cur_element._display_name,cur_element.getCorrespondingDomId()+"_menu_more"));var elements=cur_element.getElements();for(var j=0;j<elements.length;j++){folder._addElement(elements[j]);}
cur_size-=cur_element._getDomElement().offsetWidth;}}
else if(this._elements[this._elements.length-1].getCorrespondingDomId()=='_menu_more'){var more_section=this._elements[this._elements.length-1];var more_section_width=more_section._getDomElement().offsetWidth;var offset_width=more_section.getElement(more_section._elements.length-1);if(more_section._elements.length==1){offset_width-=more_section_width;}
while(cur_size+offset_width<new_size){var cur_element=more_section.removeElement(more_section._elements.length-1);var section=new YAHOO.omniture.HorizontalSection(cur_element._display_name,cur_element.getCorrespondingDomId()+"_menu_more")
this.insertElement(section,this._elements.length-2);var elements=cur_element.getElements();for(var j=0;j<elements.length;j++){section._addElement(elements[j]);}
var offset_width=more_section.getElement(more_section._elements.length-1);if(more_section._elements.length==1){offset_width-=more_section_width;}}
if(more_section._elements.length<1){this.removeElement(this._elements.length-1);}}},getHTML:function(class_name)
{if(!class_name){class_name='horiz_menu';}
return YAHOO.omniture.HorizontalMenu.superclass.getHTML.call(this,class_name);}});YAHOO.omniture.HorizontalSection=function(display_name,corresponding_dom_id,style_class)
{this.init(display_name,corresponding_dom_id,style_class,'HorizontalSection');};YAHOO.lang.extend(YAHOO.omniture.HorizontalSection,YAHOO.omniture.Section,{deselect:function()
{YAHOO.omniture.HorizontalSection.superclass.deselect.call(this);this._hideSectionBody();},_showSectionBody:function()
{var section_id=this._corresponding_dom_id+"_section";var icon_div_id=this._corresponding_dom_id+"_icon";var section_sub_width=YAHOO.util.Dom.get(section_id).offsetWidth;var section_x_pos=YAHOO.util.Dom.getX(this._corresponding_dom_id);var left_pos="1px";if(section_x_pos+section_sub_width>YAHOO.util.Dom.getViewportWidth()){var section_head_width=YAHOO.util.Dom.get(this._corresponding_dom_id).offsetWidth;left_pos="-"+(section_sub_width-section_head_width)+"px";}
YAHOO.util.Dom.setStyle(section_id,"left",left_pos);var y_pos=this._getDomElement().offsetHeight+4;YAHOO.util.Dom.setStyle(section_id,"top",y_pos+"px");YAHOO.util.Dom.replaceClass(icon_div_id,"closed_section_icon","open_section_icon");YAHOO.util.Dom.setStyle(section_id,"visibility","visible");YAHOO.util.Dom.setStyle(section_id,"z-index","16777216");var dom_element=this._getDomElement();var submenu_dom_element=YAHOO.util.Dom.get(section_id);var iframeShim=Omniture.util.createIframeShim(submenu_dom_element,submenu_dom_element,dom_element.parentNode.parentNode);YAHOO.util.Dom.setStyle(iframeShim,'display','block');},_hideSectionBody:function()
{var section_id=this._corresponding_dom_id+"_section";var icon_div_id=this._corresponding_dom_id+"_icon";YAHOO.util.Dom.replaceClass(icon_div_id,"open_section_icon","closed_section_icon");YAHOO.util.Dom.setStyle(section_id,"visibility","hidden");YAHOO.util.Dom.setStyle(section_id,"z-index","0");var dom_element=this._getDomElement();var submenu_dom_element=YAHOO.util.Dom.get(section_id);var iframeShim=Omniture.util.createIframeShim(submenu_dom_element,submenu_dom_element,dom_element.parentNode.parentNode);YAHOO.util.Dom.setStyle(iframeShim,'display','none');},onClick:function(e)
{if(this._g_menu.canShowSubMenus()){this._g_menu.deactivateShowSubMenus();this._hideSectionBody();}else{this._g_menu.activateShowSubMenus();this.onMouseOver(e);}
YAHOO.util.Event.stopEvent(e);},onMouseOver:function(e)
{if(this._g_menu.canShowSubMenus()){this._showSectionBody();}
YAHOO.omniture.HorizontalSection.superclass.onMouseOver.call(this,e);}});YAHOO.omniture.HorizontalFolder=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,'HorizontalFolder');};YAHOO.lang.extend(YAHOO.omniture.HorizontalFolder,YAHOO.omniture.Folder,{_getXPos:function(){var submenu_width=this._getSubMenuDomElement().offsetWidth;return this._submenu_indent-submenu_width;},getHTML:function(){var html='<li class="h_folder" style="position: relative;" id="'+this._corresponding_dom_id+'">';html+=this._getSubmenu();if(YAHOO.omniture.Folder.superclass._hasElements.call(this)){html+='<img src="'+Omniture.Config.PLATFORM_URL+'/images/left-arrow.gif" style="position: absolute; left: 0; top: 4px;"/>';}
html+='<span class="itemtitle">'+this._display_name+'</span></li>';return html;}});YAHOO.omniture.HorizontalImageMenu=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,null,'Menu');this._nav_model=null;this._pid='site_catalyst';};YAHOO.lang.extend(YAHOO.omniture.HorizontalImageMenu,YAHOO.omniture.HorizontalMenu,{startTimeout:function()
{var this_menu=this;this._submenu_timeout=setTimeout(function(){this_menu.deselect();},10);}});YAHOO.omniture.HorizontalImageSection=function(display_name,corresponding_dom_id,style_class,header_image,logo_width,logo_href)
{this.init(display_name,corresponding_dom_id,style_class,'HorizontalImageSection',header_image,logo_width,logo_href);};YAHOO.lang.extend(YAHOO.omniture.HorizontalImageSection,YAHOO.omniture.HorizontalSection,{init:function(display_name,corresponding_dom_id,style_class,class_name,header_image,logo_width,logo_href)
{YAHOO.omniture.HorizontalImageSection.superclass.init.call(this,display_name,corresponding_dom_id,style_class,class_name);this._section_body_showing=false;this._header_image=header_image;this._logo_width=logo_width;this._logo_href=logo_href},onClick:function(e)
{var x_coord=e.layerX||e.x;if(x_coord<this._logo_width){document.location=this._logo_href;}else{this._g_menu.activateShowSubMenus();this.onMouseOver(e);}
YAHOO.util.Event.stopEvent(e);},highlight:function()
{this.showSelected();},_showSectionBody:function()
{YAHOO.omniture.HorizontalImageSection.superclass._showSectionBody.call(this);this._section_body_showing=true;},_hideSectionBody:function()
{YAHOO.omniture.HorizontalImageSection.superclass._hideSectionBody.call(this);this._section_body_showing=false;this.hideSelected();},onMouseOver:function(e)
{YAHOO.omniture.HorizontalImageSection.superclass.onMouseOver.call(this,e);this.showSelected();},onMouseOut:function(e)
{if(!this._section_body_showing){YAHOO.omniture.HorizontalImageSection.superclass.onMouseOut.call(this,e);this.hideSelected();}},showSelected:function()
{if(YAHOO.util.Dom.getStyle(this._header_image,'top')=='0px'){Omniture.util.toggleStackedImage(this._header_image);}},hideSelected:function()
{if(YAHOO.util.Dom.getStyle(this._header_image,'top')!='0px'){Omniture.util.toggleStackedImage(this._header_image);}}});YAHOO.omniture.AutoSuggestControl=function(form,textbox,provider,layout,url,submit_url,css_class_name)
{this.init(form,textbox,provider,layout,url,submit_url,css_class_name);}
YAHOO.lang.extend(YAHOO.omniture.AutoSuggestControl,YAHOO.omniture.Widget,{init:function(form,textbox,provider,layout,url,submit_url,css_class_name)
{YAHOO.omniture.AutoSuggestControl.superclass.init.call(this,textbox.id);this.cur=-1;this.layer=null
this.provider=provider;this.lprovider=layout;this.timer;this.form=form;this.form.action=submit_url;this.textbox=textbox;this.URL=url;this._down_arrow_id=this._getDownArrowID();this.setHandlers(css_class_name);this.max_results=10;this.old_request_value='';},_getDownArrowID:function()
{},autosuggest:function(aSuggestions,type,stat){if(type=='new'){if(aSuggestions.length>0){this.lprovider.showSuggestions(this,aSuggestions,type);}else{this.hideSuggestions();}}else if(type=='add'){if(stat==3){this.hideSuggestions();}else{this.lprovider.showSuggestions(this,aSuggestions,type);}}},createDropDown:function(className){this.layer=document.createElement("div");this.layer.className=className;this.layer.style.visibility="hidden";this.layer.style.width=this.textbox.offsetWidth+'px';this.setupDropDownEvents();document.getElementById('autoSuggestData').appendChild(this.layer);},setupDropDownEvents:function()
{oThis=this;this.layer.onmousedown=this.layer.onmouseup=this.layer.onmouseover=function(oEvent){oEvent=oEvent||window.event;oTarget=oEvent.target||oEvent.srcElement;if(oTarget.getAttribute("cat")!="category"&&oTarget.getAttribute("cat")!='noResult'){if(oEvent.type=="mousedown"){oThis.textbox.value=oTarget.firstChild.nodeValue;oThis.hideSuggestions();oThis.setInputValues(oTarget);if(!oThis.form.onsubmit()){oThis.form.submit();}}else if(oEvent.type=="mouseover"){oThis.highlightSuggestion(oTarget);}else{oThis.textbox.focus();}}};},setInputValues:function(node)
{var oThis=this;for(var i=0;i<oThis.form.length;i++){if(oThis.form.elements[i].id=='url'){oThis.form.elements[i].value=node.getAttribute("url");}else if(oThis.form.elements[i].id=='group'){oThis.form.elements[i].value=node.getAttribute("groupname");}}},getLeft:function(){var oNode=this.textbox;var iLeft=0;while(oNode&&oNode.tagName!="BODY"){iLeft+=oNode.offsetLeft;oNode=oNode.offsetParent;}
return iLeft;},getTop:function(){var oNode=this.textbox;var iTop=0;while(oNode&&oNode.tagName!="BODY"){iTop+=oNode.offsetTop;oNode=oNode.offsetParent;}
return iTop;},handleKeyDown:function(oEvent){switch(oEvent.keyCode){case 38:this.previousSuggestion();break;case 40:this.nextSuggestion();break;case 13:this.hideSuggestions();break;case 8:if(this.textbox.value==""){this.hideSuggestions();}
break;case 46:if(this.textbox.value==""){this.hideSuggestions();}
break;}},sendRequest:function(){if(this.textbox.value!=''){if(this.old_request_value!=this.current_request_value){this.provider.requestSuggestions(this,this.max_results,this.current_request_value);this.old_request_value=this.current_request_value;}}else{this.old_request_value='';this.hideSuggestions();}},handleKeyUp:function(oEvent){var iKeyCode=oEvent.keyCode;var myClass=this;if(iKeyCode==8||iKeyCode==46){clearTimeout(this.timer);this.timer=setTimeout(function(){myClass.current_request_value=myClass.textbox.value;myClass.sendRequest();},150);}else if(iKeyCode<32||(iKeyCode>=33&&iKeyCode<46)||(iKeyCode>=112&&iKeyCode<=123)){}else{clearTimeout(this.timer);this.timer=setTimeout(function(){myClass.current_request_value=myClass.textbox.value;myClass.sendRequest();},150);}},hideSuggestions:function(){this.layer.style.visibility="hidden";this.layer.innerHTML="";this.cur=-1;},highlightSuggestion:function(oSuggestionNode){for(var i=0;i<this.layer.childNodes.length;i++){var oNode=this.layer.childNodes[i];if(oNode==oSuggestionNode){YAHOO.util.Dom.addClass(oNode,"current");this.cur=i;}else if(YAHOO.util.Dom.hasClass(oNode,"current")){YAHOO.util.Dom.removeClass(oNode,"current");}}},setHandlers:function(css_class_name){var oThis=this;this.textbox.onkeyup=function(oEvent){if(!oEvent){oEvent=window.event;}
oThis.handleKeyUp(oEvent);};this.textbox.onkeydown=function(oEvent){if(!oEvent){oEvent=window.event;}
oThis.handleKeyDown(oEvent);};this.textbox.onblur=function(){oThis.hideSuggestions();};this.createDropDown(css_class_name);},nextSuggestion:function(){var cSuggestionNodes=this.layer.childNodes;if(cSuggestionNodes.length>0&&this.cur<cSuggestionNodes.length-1){var oNode=cSuggestionNodes[++this.cur];this.highlightSuggestion(oNode);this.setInputValues(oNode);this.textbox.value=oNode.firstChild.nodeValue;}},previousSuggestion:function(){var cSuggestionNodes=this.layer.childNodes;if(cSuggestionNodes.length>0&&this.cur>0){var oNode=cSuggestionNodes[--this.cur];this.highlightSuggestion(oNode);this.textbox.value=oNode.firstChild.nodeValue;this.setInputValues(oNode);}}});function RemoteSuggestions(oAutoSuggestions){this.oAutoSuggestControl=null;this.search_term=null;this.preloadImages();}
RemoteSuggestions.prototype.preloadImages=function(){this.report_img=this.createSwatchImage(Omniture.Config.PLATFORM_URL+"/images/Icons/icon_results_reports.gif");this.report_img.style.position='relative';this.report_img.style.top='1px';this.report_img.style.paddingRight='4px';this.tool_img=this.createSwatchImage(Omniture.Config.PLATFORM_URL+"/images/Icons/icon_results_tools.gif");this.tool_img.style.position='relative';this.tool_img.style.top='1px';this.tool_img.style.paddingRight='4px';this.help_img=this.createSwatchImage(Omniture.Config.PLATFORM_URL+"/images/Icons/icon_results_help.gif");this.help_img.style.position='relative';this.help_img.style.top='1px';this.help_img.style.paddingRight='4px';this.loadCustom=this.createLoadImage('custom');this.loadCustom.style.position='relative';this.loadCustom.style.left='15px';this.loadDefault=this.createLoadImage('default');this.loadDefault.style.position='relative';this.loadDefault.style.left='15px';this.loadArticles=this.createLoadImage('articles');this.loadArticles.style.position='relative';this.loadArticles.style.left='15px';};RemoteSuggestions.prototype.createSwatchImage=function(src){img=document.createElement("img");img.setAttribute('src',src);img.alt='';img.width='12';img.height='12';return img;};RemoteSuggestions.prototype.createLoadImage=function(cat){load=document.createElement("img");load.src=Omniture.Config.STATIC_URL+'/images/v15icons/loading-inline.gif';load.width='16';load.height='16';load.setAttribute('groupname',cat);return load;};RemoteSuggestions.prototype.createSuggestionDiv=function(oAutoSuggestControl){oAutoSuggestControl.layer.innerHTML='';var ul=document.createElement('ul');oDiv=document.createElement("li");oDiv.setAttribute("cat","category");oDiv.className="category";oDiv.style.fontSize=110+"%";oDiv.style.fontWeight="bold";oDiv.style.listStyle='none';oDiv.appendChild(document.createTextNode(Omniture.l10n.gettext("Reports")));oDiv2=document.createElement("li");oDiv2.setAttribute("cat","category");oDiv2.className="category";oDiv2.style.fontSize=110+"%";oDiv2.style.fontWeight="bold";oDiv2.style.listStyle='none';oDiv2.style.paddingTop='10px';oDiv2.appendChild(document.createTextNode(Omniture.l10n.gettext("Tools")));oDiv3=document.createElement("li");oDiv3.setAttribute("cat","category");oDiv3.className="category";oDiv3.style.fontSize=110+"%";oDiv3.style.fontWeight="bold";oDiv3.style.listStyle='none';oDiv3.style.paddingTop='10px';oDiv3.appendChild(document.createTextNode(Omniture.l10n.gettext("Help")));ul.appendChild(oDiv);ul.appendChild(this.loadCustom);ul.appendChild(oDiv2);ul.appendChild(this.loadDefault);ul.appendChild(oDiv3);ul.appendChild(this.loadArticles);oAutoSuggestControl.layer.appendChild(ul);oAutoSuggestControl.ul=ul;oAutoSuggestControl.layer.style.left=oAutoSuggestControl.getLeft()+"px";oAutoSuggestControl.layer.style.top=(oAutoSuggestControl.getTop()+oAutoSuggestControl.textbox.offsetHeight)+"px";oAutoSuggestControl.layer.style.position='absolute';oAutoSuggestControl.layer.style.visibility="visible";};RemoteSuggestions.prototype.requestSuggestions=function(oAutoSuggestControl,max,text_val){this.oAutoSuggestControl=oAutoSuggestControl;var search_term=text_val;this.search_term=search_term;oAutoSuggestControl.search_term_order.push(search_term);var default_cached_info=oAutoSuggestControl.default_cache[search_term];var custom_cached_info=oAutoSuggestControl.custom_cache[search_term];var articles_cached_info=oAutoSuggestControl.articles_cache[search_term];this.null_result=0;oAutoSuggestControl.noReports=0;if(search_term!=''){this.createSuggestionDiv(oAutoSuggestControl);if(default_cached_info){oAutoSuggestControl.autosuggest(default_cached_info,'new','default');}else{var sURL=oAutoSuggestControl.URL+"&search="+encodeURIComponent(search_term)+'&mode=default';var callback_default={success:this.setDefaultHTML,failure:this.failure,scope:this};if(this.transaction_default){YAHOO.util.Connect.abort(this.transaction_default,callback_default,null);}
this.transaction_default=YAHOO.util.Connect.asyncRequest('GET',sURL,callback_default,null);}
if(custom_cached_info){oAutoSuggestControl.autosuggest(custom_cached_info,'add','custom');}else{var sURL=oAutoSuggestControl.URL+"&search="+encodeURIComponent(search_term)+'&mode=custom';var callback_custom={success:this.setCustomHTML,failure:this.failure,scope:this};if(this.transaction_custom){YAHOO.util.Connect.abort(this.transaction_custom,callback_custom,null);}
this.transaction_custom=YAHOO.util.Connect.asyncRequest('GET',sURL,callback_custom,null);}
if(articles_cached_info){oAutoSuggestControl.autosuggest(articles_cached_info,'add','articles');}else{var sURL=oAutoSuggestControl.URL+"&search="+encodeURIComponent(search_term)+'&mode=articles';var callback_articles={success:this.setArticlesHTML,failure:this.failure,scope:this};if(this.transaction_articles){YAHOO.util.Connect.abort(this.transaction_articles,callback_articles,null);}
this.transaction_articles=YAHOO.util.Connect.asyncRequest('GET',sURL,callback_articles,null);}}}
RemoteSuggestions.prototype.setDefaultHTML=function(result)
{if(result.responseText){var json_obj=eval("("+result.responseText+")");var aSuggestions=json_obj.pagename;var search_term=json_obj.search_term;if(aSuggestions.length==0){this.null_result++;}
if(!this.oAutoSuggestControl.default_cache[search_term]){this.oAutoSuggestControl.default_cache[search_term]=aSuggestions;var index_last=this.oAutoSuggestControl.search_term_order.length-1;if(this.oAutoSuggestControl.search_term_order[index_last]==search_term&&this.oAutoSuggestControl.textbox.value!=''&&this.oAutoSuggestControl.layer.innerHTML!=''){if(!this.oAutoSuggestControl.custom_cache[search_term]&&!this.oAutoSuggestControl.articles_cache[search_term]){this.oAutoSuggestControl.autosuggest(aSuggestions,'new','default');}else{this.oAutoSuggestControl.autosuggest(aSuggestions,'add','default');}}}}}
RemoteSuggestions.prototype.setCustomHTML=function(result)
{if(result.responseText){var json_obj=eval("("+result.responseText+")");var aSuggestions=json_obj.pagename;var search_term=json_obj.search_term;if(aSuggestions.length==0){this.null_result++;}
if(!this.oAutoSuggestControl.custom_cache[search_term]){this.oAutoSuggestControl.custom_cache[search_term]=aSuggestions;var index_last=this.oAutoSuggestControl.search_term_order.length-1;if(this.oAutoSuggestControl.search_term_order[index_last]==search_term&&this.oAutoSuggestControl.textbox.value!=''&&this.oAutoSuggestControl.layer.innerHTML!=''){if(!this.oAutoSuggestControl.articles_cache[search_term]&&!this.oAutoSuggestControl.default_cache[search_term]){this.oAutoSuggestControl.autosuggest(aSuggestions,'new','custom');}else{this.oAutoSuggestControl.autosuggest(aSuggestions,'add','custom');}}}}}
RemoteSuggestions.prototype.setArticlesHTML=function(result)
{if(result.responseText){var json_obj=eval("("+result.responseText+")");var aSuggestions=json_obj.pagename;var search_term=json_obj.search_term;if(aSuggestions.length==0){this.null_result++;}
if(!this.oAutoSuggestControl.articles_cache[search_term]){this.oAutoSuggestControl.articles_cache[search_term]=aSuggestions;var index_last=this.oAutoSuggestControl.search_term_order.length-1;if(this.oAutoSuggestControl.search_term_order[index_last]==search_term&&this.oAutoSuggestControl.textbox.value!=''&&this.oAutoSuggestControl.layer.innerHTML!=''){if(!this.oAutoSuggestControl.custom_cache[search_term]&&!this.oAutoSuggestControl.default_cache[search_term]){this.oAutoSuggestControl.autosuggest(aSuggestions,'new','articles');}else{this.oAutoSuggestControl.autosuggest(aSuggestions,'add','articles');}}}}}
RemoteSuggestions.prototype.failure=function(result){}
function SearchLayoutProvider(){}
SearchLayoutProvider.prototype.showSuggestions=function(oAutoSuggestControl,aSuggestions,mode,cat){var nodes=oAutoSuggestControl.ul.childNodes;this.deleteLoader(oAutoSuggestControl,cat);this.insertNode(oAutoSuggestControl,nodes,aSuggestions,cat);if(cat=='default'){if(this.countCat(aSuggestions,'Reports')==0){oAutoSuggestControl.noReports++;}
if(this.countCat(aSuggestions,'Tools')==0){this.insertEmptyResultNode(oAutoSuggestControl,nodes,aSuggestions,Omniture.l10n.gettext('Tools'));}}else if(aSuggestions.length==0){if(cat=='custom'){oAutoSuggestControl.noReports++;}else if(cat=='articles'){this.insertEmptyResultNode(oAutoSuggestControl,nodes,aSuggestions,Omniture.l10n.gettext('Help'));}}
if(oAutoSuggestControl.noReports==2){this.insertEmptyResultNode(oAutoSuggestControl,nodes,aSuggestions,Omniture.l10n.gettext('Reports'));oAutoSuggestControl.noReports=0;}
oAutoSuggestControl.layer.style.width=(oAutoSuggestControl.textbox.offsetWidth-2)+"px";YAHOO.util.Dom.setXY(oAutoSuggestControl.layer,[YAHOO.util.Dom.getX(oAutoSuggestControl.textbox),YAHOO.util.Dom.getY(oAutoSuggestControl.textbox)+oAutoSuggestControl.textbox.offsetHeight]);oAutoSuggestControl.layer.style.position='absolute';oAutoSuggestControl.layer.style.visibility="visible";};SearchLayoutProvider.prototype.deleteLoader=function(control,cat){for(var i=0;i<control.ul.childNodes.length;i++){var oNode=control.ul.childNodes[i];if(oNode&&oNode.getAttribute('groupname')==cat){control.ul.removeChild(oNode);}}};SearchLayoutProvider.prototype.countCat=function(suggestions,cat){var count=0;for(var i=0;i<suggestions.length;i++){var aNode=suggestions[i];var index=aNode.length-1;if(aNode[2]==cat){count++;}}
return count;};SearchLayoutProvider.prototype.insertEmptyResultNode=function(oAutoSuggestControl,nodes,suggestions,cat){oDiv=document.createElement('div');oDiv.appendChild(document.createTextNode(Omniture.l10n.gettext('No Results Found')));oDiv.setAttribute('cat','noResult');oDiv.className='noResult';nextCat=this.findNextCategory(nodes,cat);if(nextCat){oAutoSuggestControl.ul.insertBefore(oDiv,nextCat);}else{oAutoSuggestControl.ul.appendChild(oDiv);}}
SearchLayoutProvider.prototype.insertNode=function(oAutoSuggestControl,nodes,suggestions,cat){for(var i=0;i<suggestions.length;i++){oDiv=document.createElement("li");if(cat=='articles'){YAHOO.util.Dom.addClass(oDiv,'kb_bullet');}
oDiv.appendChild(document.createTextNode(suggestions[i][0]));oDiv.setAttribute("groupname",suggestions[i][2]);oDiv.setAttribute("url",suggestions[i][1]);if(suggestions[i][2]){var category=suggestions[i][2];}else{var category=cat;if(cat=='articles'){category='Help';}}
oDiv.setAttribute("cat",category);var id=category+i;oDiv.id=id;nextCat=this.findNextCategory(nodes,Omniture.l10n.gettext(category));if(nextCat){oAutoSuggestControl.ul.insertBefore(oDiv,nextCat);}else{oAutoSuggestControl.ul.appendChild(oDiv);}
this.autosuggest=oAutoSuggestControl;YAHOO.util.Event.addListener(oDiv,'mouseover',this.highlight,this,true);YAHOO.util.Event.addListener(oDiv,'mouseout',this.dehighlight,this,true);YAHOO.util.Event.addListener(oDiv,'mousedown',this.redirect,oAutoSuggestControl,true);}}
SearchLayoutProvider.prototype.highlight=function(e){var target=YAHOO.util.Event.getTarget(e);var highlighted=YAHOO.util.Dom.getElementsByClassName('current','li',this.autosuggest.ul);if(highlighted[0]){YAHOO.util.Dom.removeClass(highlighted[0],'current');}
YAHOO.util.Dom.addClass(target,'current');var index=this.findIndex(this.autosuggest.ul.childNodes,target);this.autosuggest.cur=index;}
SearchLayoutProvider.prototype.dehighlight=function(e){var target=YAHOO.util.Event.getTarget(e);YAHOO.util.Dom.removeClass(target,'current');}
SearchLayoutProvider.prototype.redirect=function(e,oAutoSuggestControl){var target=YAHOO.util.Event.getTarget(e);oAutoSuggestControl.textbox.value=target.firstChild.nodeValue;oAutoSuggestControl.hideSuggestions();oAutoSuggestControl.handleRedirection(target.getAttribute('cat'),target.getAttribute('url'));}
SearchLayoutProvider.prototype.findIndex=function(suggestions,item){for(var i=0;i<suggestions.length;i++){if(suggestions[i]==item){return i;}}
return false;}
SearchLayoutProvider.prototype.findNextCategory=function(nodes,group){var currCat=null;var foundCat=false;var oNode=null;for(var i=0;i<nodes.length;i++){oNode=nodes[i];if(oNode.className=="category"){if(foundCat){return oNode;}
var index=oNode.childNodes.length-1;currCat=oNode.childNodes[index].nodeValue;if(currCat==group){foundCat=true;}}}
return null;};SearchLayoutProvider.prototype.getImageFilename=function(category){if(category=='Report'){return'report-icon.gif';}else if(category=='Tool'){return'tools-search-icon.gif';}else if(category=='Help'){return'help-search-icon.gif';}else{alert('no such category');}
return null;}
SearchLayoutProvider.prototype.isCatExist=function(nodes,cat){for(var i=0;i<nodes.length;i++){var oNode=nodes[i];var index=oNode.childNodes.length-1;if(oNode.className=="category"&&oNode.childNodes[index].nodeValue==cat){return true;}}
return false;}
YAHOO.omniture.SearchNavAutoSuggest=function(oForm,oTextbox,oProvider,oLayout,oUrl,oSubmitUrl,class_name,oRedirectUrl)
{this.init(oForm,oTextbox,oProvider,oLayout,oUrl,oSubmitUrl,class_name,oRedirectUrl);}
YAHOO.lang.extend(YAHOO.omniture.SearchNavAutoSuggest,YAHOO.omniture.AutoSuggestControl,{init:function(form,textbox,provider,layout,url,submit_url,css_class_name,redirect_url)
{YAHOO.omniture.SearchNavAutoSuggest.superclass.init.call(this,form,textbox,provider,layout,url,submit_url,css_class_name);this.default_cache=new Array();this.custom_cache=new Array();this.articles_cache=new Array();this.div_size=new Array();this.search_term_order=new Array();this.redirect_url=redirect_url;this.submit_url=submit_url;},autosuggest:function(aSuggestions,type,stat)
{this.cur=0;this.lprovider.showSuggestions(this,aSuggestions,type,stat);},highlightSuggestion:function(oSuggestionNode){for(var i=0;i<this.ul.childNodes.length;i++){var oNode=this.ul.childNodes[i];if(oNode==oSuggestionNode){YAHOO.util.Dom.addClass(oNode,'current');this.cur=i;}else if(YAHOO.util.Dom.hasClass(oNode,'current')){YAHOO.util.Dom.removeClass(oNode,'current');}}},getHighlightedNode:function(){var highlighted=YAHOO.util.Dom.getElementsByClassName('current','li',this.ul);if(highlighted[0]){return highlighted[0];}else{return false;}},setHandlers:function(css_class_name){var oThis=this;YAHOO.util.Event.addListener(this.textbox,'keyup',this.handleKeyUp,this,true);this.current_request_value='';this.textbox.onkeydown=function(oEvent){if(!oEvent){oEvent=window.event;}
oThis.handleKeyDown(oEvent);if(oEvent.keyCode==13){return false;}};this.textbox.onfocus=function(event){oThis.old_request_value=null;oThis.sendRequest();};this.textbox.onblur=function(){oThis.hideSuggestions();};this.createDropDown(css_class_name);},checkTimeout:function(){var myClass=this;if(this.textbox.value!=$(this.textbox).readAttribute('placeholder')&&this.textbox.value!=this.current_request_value){myClass.current_request_value=myClass.textbox.value;myClass.sendRequest();}
this.timer=setTimeout(function(){myClass.checkTimeout();},150);},handleKeyUp:function(oEvent){var iKeyCode=oEvent.keyCode;var myClass=this;if(iKeyCode==8||iKeyCode==32||(iKeyCode>=46&&iKeyCode<112)||iKeyCode>123){clearTimeout(this.timer);this.timer=setTimeout(function(){myClass.current_request_value=myClass.textbox.value;myClass.sendRequest();},150);}},handleKeyDown:function(oEvent){switch(oEvent.keyCode){case 38:oNode=this.previousSuggestion();if(oNode!=null){this.highlightSuggestion(oNode);this.setInputValues(oNode);}
break;case 40:oNode=this.nextSuggestion();if(oNode!=null){this.highlightSuggestion(oNode);this.setInputValues(oNode);}
break;case 13:highlight_node=this.getHighlightedNode();if(this.ul&&highlight_node){this.textbox.value=highlight_node.firstChild.nodeValue;this.hideSuggestions();this.handleRedirection(highlight_node.getAttribute('cat'),highlight_node.getAttribute('url'));}else{this.handleSubmit('search',this.textbox.value);this.hideSuggestions();}
break;case 8:case 46:if(this.textbox.value==""){this.hideSuggestions();}
break;}},handleRedirection:function(category,node_id){if(category=='Help'){var om_help_window=Omniture.util.popwin(this.redirect_url+'&cat='+category+'&node_id='+node_id,"om_help",1024,768,{resizable:true,scrollbars:true,toolbar:true,menubar:true,status:true});if(om_help_window){om_help_window.focus();}}else{document.location=Omniture.URL.s(node_id);}},handleSubmit:function(mode,search){document.location=this.submit_url+'&mode='+mode+'&qsearch='+escape(search);},setupDropDownEvents:function()
{},nextSuggestion:function(){var cSuggestionNodes=this.ul.childNodes;if(cSuggestionNodes.length>0&&this.cur<cSuggestionNodes.length-1){var oNode=cSuggestionNodes[++this.cur];if(oNode.getAttribute("cat")=="category"||oNode.getAttribute("cat")=='noResult'){if(this.cur<cSuggestionNodes.length){oNode=this.nextSuggestion();}else{oNode=cSuggestionNodes[this.cur-1];}}
return oNode;}
return null;},previousSuggestion:function(){var cSuggestionNodes=this.ul.childNodes;if(cSuggestionNodes.length>0&&this.cur>0){var oNode=cSuggestionNodes[--this.cur];if(oNode.getAttribute("cat")=="category"||oNode.getAttribute("cat")=="noResult"){if(this.cur==0){oNode=cSuggestionNodes[this.cur+1];if(oNode.getAttribute("cat")=="category"||oNode.getAttribute("cat")=="noResult"){oNode=null;}}else{oNode=this.previousSuggestion();}}
return oNode;}
return null;}});YAHOO.omniture.HelpMenuNavigationModel=function()
{YAHOO.omniture.HelpMenuNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.HelpMenuNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('help_menu');}});YAHOO.omniture.MoreMenuNavigationModel=function()
{YAHOO.omniture.MoreMenuNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.MoreMenuNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('more_menu');}});YAHOO.omniture.SCHeaderMenuNavigationModel=function()
{YAHOO.omniture.SCHeaderMenuNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.SCHeaderMenuNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('scheader_menu');}});YAHOO.omniture.SCMHeaderMenuNavigationModel=function()
{YAHOO.omniture.SCMHeaderMenuNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.SCMHeaderMenuNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('scmheader_menu');}});YAHOO.omniture.TestTargetHeaderMenuNavigationModel=function()
{YAHOO.omniture.TestTargetHeaderMenuNavigationModel.superclass.init.call(this);}
YAHOO.lang.extend(YAHOO.omniture.TestTargetHeaderMenuNavigationModel,YAHOO.omniture.NavigationModel,{getHTML:function()
{return this._menu.getHTML('testtarget_header_menu');}});Omniture.ReportNavigationModel=function()
{this.init();}
YAHOO.lang.extend(Omniture.ReportNavigationModel,YAHOO.omniture.NavigationModel,{EVENT_ADD_CUST:1,setReportStateModel:function(model)
{this._state=model;},saveCustomReport:function(custom_report)
{var params={oid:this._state.oid,rsid:this._state.rsid,custom_report_name:custom_report.name};if(custom_report.id){params.custom_report_id=custom_report.id;}
params.el_prefix=Omniture.Config.OM_MENU_ID_CUSTOM_REPORT;var url=Omniture.URL.suitej('CustomReport.Save',params);this._save_bm_json=new YAHOO.omniture.JSONModel();this._save_bm_json.setURL(url);this._save_bm_json.attachObserver(this,'handleSavedCustomReport');this._save_bm_json.getResponse();},handleSavedCustomReport:function()
{var response=this._save_bm_json.getResponse();var cr_dom_id=response.element_id;var cust_group=this.getElement(Omniture.Config.OM_MENU_ID_CUSTOM_REPORT_FOLDER);if(!cust_group){cust_group=new YAHOO.omniture.Folder(Omniture.l10n.gettext('cust_folder_name'));cust_group.setCorrespondingDomId(Omniture.Config.OM_MENU_ID_CUSTOM_REPORT_FOLDER);this.getMenu()._addElement(cust_group);}
if(cust_group){if(!this.getElement(cr_dom_id)){var new_el=new YAHOO.omniture.Link(response.name,cr_dom_id,"document.location='"+response.url+"'");cust_group._addElement(new_el);this.last_success_message=response.success_msg;this.notify(this.EVENT_ADD_CUST);}}},getCustomReportIdByName:function(name)
{var folder=this.getElement(Omniture.Config.OM_MENU_ID_CUSTOM_REPORT_FOLDER);if(folder){var elements=folder.getElements();for(var i in elements){if(elements.hasOwnProperty(i)&&elements[i].getDisplayName()==name){return this.custReportMenuIdToRawId(elements[i].getCorrespondingDomId());}}}
return null;},custReportMenuIdToRawId:function(menu_id)
{return menu_id.substring(Omniture.Config.OM_MENU_ID_CUSTOM_REPORT.length+1);}});YAHOO.omniture.ReportToolWidget=function(dom_id,panel_widget,btn)
{this.init(dom_id,panel_widget,btn);};YAHOO.lang.extend(YAHOO.omniture.ReportToolWidget,YAHOO.omniture.Widget,{init:function(dom_id,panel_widget,btn)
{YAHOO.omniture.ReportToolWidget.superclass.init.call(this,dom_id);this._panel_widget=panel_widget;this._panel_widget.assignDelegate(this);this._closed=true;this._errors=[];this._btn=btn;},render:function()
{this._closed=false;if($(this._btn)){$(this._btn).addClassName('is-selected');}
if(this._panel_widget.render()){YAHOO.util.Dom.setStyle(this.getDomElement(),'display','block');return true;}else{this.renderLoading();return false;}},isShowing:function()
{return!this._closed;},close:function()
{this._closed=true;if($(this._btn)){$(this._btn).removeClassName('is-selected');}
YAHOO.util.Dom.setStyle(this.getDomElement(),'display','none');return;},save:function(e)
{if(this._panel_widget.save(e)){this.clearErrors();this.close(e);}},renderLoading:function()
{var Dom=YAHOO.util.Dom;var el=this.getDomElement();if(Dom.getStyle(el,'display')=='none'){Dom.setStyle(this.getDomElement(),'display','block');if(YAHOO.env.ua.ie==6){Dom.setStyle(el,'height','55px');}else{Dom.setStyle(el,'min-height','55px');}}
YAHOO.omniture.ReportToolWidget.superclass.renderLoading.call(this);},setError:function(id,msg,type)
{type=type||"failure";this.getDelegate().addMessage(msg,type,null,id);this._errors.push(id);},clearErrors:function()
{for(var i=0;i<this._errors.length;i++){this.getDelegate().removeMessage(this._errors[i]);}
this._errors=[];}});YAHOO.omniture.Input=function(display_name,corresponding_dom_id,text_field_obj,button_obj)
{this.init(display_name,corresponding_dom_id,text_field_obj,button_obj,'Input');}
YAHOO.lang.extend(YAHOO.omniture.Input,YAHOO.omniture.Item,{init:function(display_name,corresponding_dom_id,text_field_obj,button_obj,class_type)
{YAHOO.omniture.Input.superclass.init.call(this,display_name,corresponding_dom_id,null,class_type);this._text_field_obj=text_field_obj;this._button_obj=button_obj;},getHTML:function()
{var html='<li id="'+this._corresponding_dom_id+'"';var style_class=this._getStyleClassString();if(style_class!=null){html+=' class="'+style_class+'"';}
html+='>';html+='<span class="itemtitle"> \
   '+(this.getDisplayName()?this.getDisplayName()+'&nbsp;':'')+' \
   <input type="text" name="'+this._text_field_obj.name+'" id="'+this._text_field_obj.id+'" value="'+this._text_field_obj.value+'" \
    title="'+this._text_field_obj.title+'" onfocus="this.select();" /> \
   <input type="button" value="'+this._button_obj.value+'" title="'+this._button_obj.title+'" onclick="'+this._button_obj.onclick+'" \
    class="'+this._button_obj.css_class+'" /> \
  </span>';html+='</li>';return html;},highlight:function()
{},onMouseOver:function(e)
{this._parent.handleChildMouseOver(e,this);YAHOO.util.Event.stopEvent(e);}});YAHOO.omniture.ContextMenu=function(display_name,corresponding_dom_id,mode)
{this.init(display_name,corresponding_dom_id,null,'ContextMenu',mode);};YAHOO.lang.extend(YAHOO.omniture.ContextMenu,YAHOO.omniture.Menu,{addSection:function(display_name,corresponding_dom_id,style_class,is_close_section)
{return this._addElement(new YAHOO.omniture.ContextSection(display_name,corresponding_dom_id,style_class,is_close_section));},deselect:function(keepFrozen)
{if(YAHOO.util.Dom.getStyle(this._getDomElement(),"display")=="none")return;YAHOO.util.Dom.setStyle(this._getDomElement(),"display","none");this.deactivateShowSubMenus();YAHOO.omniture.Menu.superclass.deselect.call(this);if(!keepFrozen){$('data_table').removeClassName('freeze_highlight');if($('data_table').selectedRow)$('data_table').selectedRow.removeClassName('selected');}},getHTML:function(class_name)
{if(!class_name){class_name='context_menu';}
return YAHOO.omniture.HorizontalMenu.superclass.getHTML.call(this,class_name);}});YAHOO.omniture.ContextSection=function(display_name,corresponding_dom_id,style_class)
{this.init(display_name,corresponding_dom_id,style_class,'ContextSection');};YAHOO.lang.extend(YAHOO.omniture.ContextSection,YAHOO.omniture.Section,{init:function(display_name,corresponding_dom_id,style_class,class_type)
{YAHOO.omniture.ContextSection.superclass.init.call(this,display_name,corresponding_dom_id,style_class,class_type);this._open_state=true;this._is_close_section=true;},addFolder:function(display_name,corresponding_dom_id)
{var new_folder=new YAHOO.omniture.ContextFolder(display_name,corresponding_dom_id);return this._addElement(new_folder);},setJSObjName:function(js_obj_name)
{this._js_obj_name=js_obj_name;},setIsCloseSection:function(is_close_section)
{if((is_close_section!==undefined)&&(is_close_section!==null)){this._is_close_section=is_close_section;}},getHTML:function()
{_section_html="";if(this._pre_img){_section_html+='<img class="'+this._pre_img.class_name+'" src="'+this._pre_img.src+'" />';}
_section_html+='<div id="'+this._corresponding_dom_id+'_icon" class="mnu_title closed_section_icon">';if(this._is_close_section){_section_html+='<img class="section_close_img" src="'+OM.Config.STATIC_URL+'/images/v15icons/close.png" onclick="'+this._js_obj_name+'.deselect();" />';}
_section_html+=this._display_name;_section_html+='</div>';if(this._post_img){_section_html+='<img class="'+this._post_img.class_name+'" src="'+this._post_img.src+'" />';}
var style_class=this._getStyleClassString();if(style_class!=null){_section_html=this._wrapHeaderInStyle(_section_html,style_class);}
html=this._getCompleteSectionBodyHTML(_section_html,style_class);if(this._open_state==true)
{this._showSectionBody();}
return html;},onClick:function(e)
{YAHOO.util.Event.stopEvent(e);}});YAHOO.omniture.ContextFolder=function(display_name,corresponding_dom_id)
{this.init(display_name,corresponding_dom_id,'ContextFolder');};YAHOO.lang.extend(YAHOO.omniture.ContextFolder,YAHOO.omniture.Folder,{onMouseOver:function(e)
{this._g_menu.activateShowSubMenus();this._parent.handleChildMouseOver(e,this);this.select();YAHOO.omniture.Folder.superclass.onMouseOver.call(this,e);YAHOO.util.Event.stopEvent(e);}});