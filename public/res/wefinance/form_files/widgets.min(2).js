(function(b,c,a){a.view.util.TextMetrics={xfaUtil:a.ut.XfaUtil.prototype,ERROR_MARGIN:1,$measureEl:null,initialize:function(e){if(!e){var d=c(document.createElement("div"));
d.id="textMetrics";
var f={};
f.left=-1000;
f.top=-1000;
f.position="absolute";
f.visibility="invisible";
this.xfaUtil.$css(d.get(0),f);
this.$measureEl=d;
document.body.appendChild(this.$measureEl.get(0))
}else{this.$measureEl=e
}},measureExtent:function(i,f){i=i+" ";
if(!this.$measureEl){this.initialize()
}f=f||{};
var g={};
var j=c(f.refEl||"<div/>");
var e=j.get(0);
g.fontSize=j.css("fontSize")||f["font-size"]||f.fontSize;
g.fontStyle=j.css("fontStyle")||f["font-style"]||f.fontStyle;
g.fontWeight=j.css("fontWeight")||f["font-weight"]||f.fontWeight;
g.fontFamily=j.css("fontFamily")||f["font-family"]||f.fontFamily;
g.lineHeight=e.style.lineHeight||f["line-height"]||f.lineHeight;
g.letterSpacing=j.css("letterSpacing")||f["letter-spacing"]||f.letterSpacing;
g.whiteSpace=j.css("whiteSpace")||f["white-space"]||f.whiteSpace||"pre-wrap";
if(c.browser.mozilla&&j.is("textarea")){g.whiteSpace="pre-wrap"
}g.wordBreak=j.css("wordBreak")||f["word-break"]||f.wordBreak||"break-all";
g.wordWrap=j.css("wordWrap")||f["word-wrap"]||f.wordWrap||"break-word";
g.width=this._elWidth(e,f);
g.height=this._elHeight(e,f);
g.minWidth=this._elMinWidth(e,f);
g.minHeight=this._elMinHeight(e,f);
g.maxWidth=this._elMaxWidth(e,f);
g.maxHeight=this._elMaxHeight(e,f);
this.xfaUtil.$css(this.$measureEl.get(0),g);
this.$measureEl.text(i);
var d=this.$measureEl.width();
var h=this.$measureEl.height();
if(d==Math.ceil(f.width)||d==Math.floor(f.width)){d=f.width
}else{if(f.maxWidth>d||(d>f.minWidth>0&&(f.maxWidth||-1)<0)){d=d+1
}}if(h==Math.ceil(f.height)||h==Math.floor(f.height)){h=f.height
}else{if(j.is("textarea")&&(f.maxHeight>h||(h>f.minHeight>0&&(f.maxHeight||-1)<0))){h=h+1
}}this.$measureEl.text("");
return{width:d,height:h}
},_elWidth:function(d,e){if(e.minWidth&&e.minWidth>-1){return"auto"
}else{if(e.maxWidth&&e.maxWidth>-1){return"auto"
}else{return e.width||"auto"
}}},_elHeight:function(d,e){if(!c(d).is("textarea")){return e.height||"auto"
}if(e.minHeight&&e.minHeight>-1){return"auto"
}else{if(e.maxHeight&&e.maxHeight>-1){return"auto"
}else{return e.height||"auto"
}}},_elMinWidth:function(d,e){if(e.minWidth&&e.minWidth>-1){return e.minWidth
}else{return"0"
}},_elMinHeight:function(d,e){if(e.minHeight&&e.minHeight>-1){return e.minHeight
}else{return"0"
}},_elMaxWidth:function(d,e){if(e.maxWidth&&e.maxWidth>-1){return e.maxWidth
}else{return"none"
}},_elMaxHeight:function(d,e){if(e.maxHeight&&e.maxHeight>-1){return e.maxHeight
}else{return"none"
}}}
})(_,jQuery,xfalib);
(function(a){a.alertBox={verticalOffset:-75,horizontalOffset:0,repositionOnResize:true,overlayOpacity:0.01,overlayColor:"#FFF",draggable:false,dialogClass:null,imageDirectory:"..",images:["A_Warning_Lg_N.png","A_Alert2_Lg_N.png","C_QuestionBubble_Xl_N.png","A_InfoBlue_32x32_N.png"],alert:function(b,c,d,e){this._show(b,d,c,null,"OK",function(f){if(e){e(f)
}})
},okCancel:function(b,c,d,e){this._show(b,d,c,null,"OK-Cancel",function(f){if(e){e(f)
}})
},yesNo:function(b,c,d,e){this._show(b,d,c,null,"Yes-No",function(f){if(e){e(f)
}})
},yesNoCancel:function(b,c,d,e){this._show(b,d,c,null,"Yes-No-Cancel",function(f){if(e){e(f)
}})
},_createBox:function(b,d,e){var c=this;
a("#"+b).after("<div id='msgBox_panel'>");
_.each(d.split("-"),function(g,f){dispval=xfalib.locale.Strings[g.toLowerCase()]?xfalib.locale.Strings[g.toLowerCase()]:g;
a("#msgBox_panel").append("<input type='button' value='"+dispval+"' id = 'msgBox_"+g+"' class=msgbox_input />");
a("#msgBox_"+g).click(function(){c._hide();
e(!f)
});
if(!f){a("msgBox_"+g).focus()
}})
},_show:function(b,f,e,d,c,g){this._hide();
this._overlay("show");
a("BODY").append('<div id="msgBox_container"><h1 id="msgBox_title"></h1><div id="msgBox_content"><div id="msgBox_message"></div></div></div>');
if(this.dialogClass){a("#msgBox_container").addClass(a.alertBox.dialogClass)
}a("#msgBox_container").css({position:"absolute",zIndex:99999,padding:0,margin:0});
a("#msgBox_title").text(f);
a("#msgBox_content").addClass("msgBoxType"+b);
e=xfalib.ut.XfaUtil.prototype.encodeScriptableTags(e.replace(/\n/g,"<br />"));
a("#msgBox_message").html(e);
a("#msgBox_container").css({minWidth:a("#msgBox_container").outerWidth(),maxWidth:a("#msgBox_container").outerWidth()});
this._reposition();
this._maintainPosition(true);
this._createBox("msgBox_message",c,g)
},_hide:function(){a("#msgBox_container").remove();
this._overlay("hide");
this._maintainPosition(false)
},_overlay:function(b){switch(b){case"show":this._overlay("hide");
a("BODY").append('<div id="msgBox_overlay"></div>');
a("#msgBox_overlay").css({position:"absolute",zIndex:99998,top:"0px",left:"0px",width:"100%",height:a(document).height(),background:this.overlayColor,opacity:this.overlayOpacity});
break;
case"hide":a("#msgBox_overlay").remove();
break
}},_reposition:function(){var g=a(window).height()/xfalib.ut.XfaUtil.prototype.formScaleFactor,c=a(window).width()/xfalib.ut.XfaUtil.prototype.formScaleFactor,d=a(window).scrollTop()/xfalib.ut.XfaUtil.prototype.formScaleFactor,b=a(window).scrollLeft()/xfalib.ut.XfaUtil.prototype.formScaleFactor,f=((g/2)-(a("#msgBox_container").outerHeight()/2))+this.verticalOffset,e=((c/2)-(a("#msgBox_container").outerWidth()/2))+this.horizontalOffset;
if(f<0){f=0
}if(e<0){e=0
}if(a.browser.msie&&parseInt(a.browser.version)<=6){f=f+d
}a("#msgBox_container").css({top:f+d+"px",left:e+b+"px"});
a("#msgBox_overlay").height(a(document).height())
},_maintainPosition:function(b){if(this.repositionOnResize){switch(b){case true:a(window).bind("resize",this._reposition);
break;
case false:a(window).unbind("resize",this._reposition);
break
}}}}
})(jQuery);
(function(b,c,a){a.view.util.Styles={xfaUtil:a.ut.XfaUtil.prototype,_deviceResolution:144,_in2mmFactor:25.4,_pdfResolution:72,getStyleForEdge:function(f,h,e){var g={raised:"outset",dashDot:"dashed",dashDotDot:"dashed",dashed:"dashed",dotted:"dotted",embossed:"groove",etched:"inset",lowered:"ridge",solid:"solid"};
if(f&&f.jsonModel.presence!="hidden"&&f.jsonModel.presence!="invisible"){e["border"+h+"width"]=this._subPixelValue(this._convertToPx(f.getAttribute("thickness")))||"1px";
if(f.getElement("color")&&f.getElement("color").getAttribute("value")!=""){var d=f.getElement("color").getAttribute("value");
d="rgb("+d+")";
e["border"+h+"color"]=d
}else{e["border"+h+"color"]="rgb(0,0,0)"
}e["border"+h+"style"]=g[f.getAttribute("stroke")]||"solid"
}else{e["border"+h+"width"]="0px";
return 1
}},getStyleForBorder:function(h){if(h){var d=h.getElement("edge",0,true),g=h.getElement("edge",1,true),f=h.getElement("edge",2,true),e=h.getElement("edge",3,true);
if(d||g||f||e){var m={};
var l=this.getStyleForEdge(d,"-top-",m);
var k=this.getStyleForEdge(g||d,"-right-",m);
var j=this.getStyleForEdge(f||d,"-bottom-",m);
var i=this.getStyleForEdge(e||d,"-left-",m);
if(l!=1||k!=1||j!=1||i!=1){return m
}}}return null
},_convertToPx:function(d){if(!d){return 0
}d=""+d;
var e=d;
if(d.indexOf("in")>=0){e=this._mm2px(parseFloat(d)*this._in2mmFactor)
}else{if(d.indexOf("mm")>=0){e=this._mm2px(d)
}else{if(d.indexOf("cm")>=0){e=this._mm2px(parseFloat(d)*10)
}else{if(d.indexOf("pt")>=0){e=parseFloat(d)*(this._deviceResolution/this._pdfResolution)
}else{if(d.indexOf("px")>=0){e=parseFloat(d)
}}}}}return e
},_mm2px:function(g){var d=0;
if(b.isNumber(g)){d=g
}else{d=parseFloat(g)
}var f=1/25.4;
var e=d*f*this._deviceResolution;
return e
},_subPixelValue:function(d){if(d>0.01){return Math.max(d,1)
}else{return d
}}}
})(_,jQuery,xfalib);
(function(l,f,d){var h=d.ut.XfaUtil.prototype;
var k='<div class="dp-clear"><a></a></div>';
var m='<div class="dp-header"><div class="dp-leftnav"></div><div class="dp-caption"></div><div class="dp-rightnav"></div></div><div class="view dp-monthview"></div><div class="view dp-yearview"></div><div class="view dp-yearsetview"></div>';
var g='<div class="dp-header"><div class="dp-leftnav"></div><div class="dp-caption"></div><div class="dp-rightnav"></div></div><div class="view dp-monthview"></div><div class="view dp-yearview"></div><div class="view dp-yearsetview"></div>';
var e={container:"body",yearsPerView:16,width:433,viewHeight:248,locale:{days:["S","M","T","W","T","F","S"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],zero:"0",clearText:"Clear",name:"en_US"},format:"YYYY-MM-DD",pickerType:"date",positioning:null,showCalendarIcon:false},a=[31,28,31,30,31,30,31,31,30,31,30,31],i={Month:{caption:"Year",li:null,key:"day",upDown:7},Year:{caption:"Yearset",li:"Month",key:"month",upDown:3},Yearset:{caption:null,li:"Year",key:"year",upDown:4}},c="header",b=function(){this.initialized=false
};
f.extend(b.prototype,{create:function(q){var s,o=this,r="",p,n;
this.options=f.extend({},e,q);
if(this.options.pickerType.match(/date/)){r+=m
}if(this.options.pickerType.match(/time/)){r+=g
}r+=k;
f.extend(this,{selectedDay:0,selectedMonth:0,selectedYear:0,currentDay:0,currentMonth:0,currentYear:0,touchSupported:"ontouchstart" in window||window.DocumentTouch&&document instanceof DocumentTouch,_visible:false,_defaultView:"Month",_keysEnabled:false,$dp:f("<div></div>").addClass("datetimepicker").width(this.options.width).append(r).addClass("datePickerTarget").appendTo(this.options.container).toggleClass("datetimepicker-notouch",this.touchSupported),$month:f(".dp-monthview",this.$dp).height(this.options.viewHeight),$year:f(".dp-yearview",this.$dp).height(this.options.viewHeight),$yearset:f(".dp-yearsetview",this.$dp).height(this.options.viewHeight)});
this.actualWidth=this.$dp.width();
f(".dp-clear a",this.$dp).bind("click",f.proxy(this._clearDate,this));
p=f(".dp-leftnav",this.$dp).bind("click",function(t){o._adjustDate(-1,o.view)
}).outerWidth(true);
n=f(".dp-rightnav",this.$dp).bind("click",function(t){o._adjustDate(1,o.view)
}).outerWidth(true);
this.$caption=f(".dp-caption",this.$dp).width(this.actualWidth-p-n).bind("click",function(t){if(!o.$caption.hasClass("disabled")){o._layout(i[o.view].caption)
}});
f(this.$dp).on("click",function(t){if(!o.touchSupported){o._curInstance.$field.focus()
}});
f(window).on("touchstart.datetimepicker mousedown.datetimepicker",o._checkWindowClicked);
this._curInstance=null
},_attachField:function(p,o,s){var r=this._newInst(p,o,s),n=this,q=function(v){if(!n._curInstance){n._activateField(v)
}if(v.type==n.getEvent()||(v.type=="focus"&&!n.touchSupported&&!n.scriptFocus)){n._show(v)
}n._clickedWindow=true;
n.scriptFocus=false
},u=function(v){if(!n.touchSupported&&n._clickedWindow){n._hide();
n._deactivateField();
n._clickedWindow=true
}};
h.$data(p[0],"datetimepicker",r);
p.bind(this.getEvent(),q).focus(q).blur(u);
if(this.options.showCalendarIcon){var t=f("<div></div>").addClass("datepicker-calendar-icon").insertAfter(p).css({top:0,right:0}).on(this.getEvent(),function(v){if(!n.touchSupported){p.focus()
}else{p.click()
}})
}},_newInst:function(n,o,p){return{$field:n,locale:o.locale,positioning:o.positioning||n,access:o.access,selectedDate:o.value}
},_checkWindowClicked:function(o){var n=j;
if(n._curInstance){if(!f(o.target).closest(".datePickerTarget").length){if(n.touchSupported){n._hide();
n._curInstance.$field[0].blur();
n._deactivateField()
}else{n._clickedWindow=true
}}else{n._clickedWindow=false
}}},_hotKeys:function(r){var q=false,o;
switch(r.keyCode){case 9:j._hide();
q=false;
break;
case 27:j._hide();
q=true;
break;
case 40:if(!this._visible){this._show();
return
}this.$focusedDate.addClass("dp-focus");
break
}if(j._visible&&this._keysEnabled){var n=i[this.view].key,p=i[this.view].upDown;
switch(r.keyCode){case 32:this.hotKeyPressed=true;
if(this.$focusedDate){this.$focusedDate.trigger("click")
}this.hotKeyPressed=false;
q=true;
break;
case 37:if(r.shiftKey){f(".dp-leftnav",this.$dp).triggerHandler("click")
}else{this._adjustDate(-1,n)
}q=true;
break;
case 38:if(r.shiftKey){this.$caption.triggerHandler("click")
}else{this._adjustDate(-p,n)
}q=true;
break;
case 39:if(r.shiftKey){f(".dp-rightnav",this.$dp).triggerHandler("click")
}else{this._adjustDate(+1,n)
}q=true;
break;
case 40:this._adjustDate(p,n);
q=true;
break;
default:}}if(q){r.preventDefault()
}},_show:function(){if(!this._curInstance){this._activateField(evnt)
}if(this._curInstance.access==false){return
}this.options.locale=this._curInstance.locale;
if(!this._visible){var n=this,o=new Date(),p;
o=this._curInstance.selectedDate?d.ut.DateInfo.ParseIsoString(this._curInstance.selectedDate).getDate():new Date();
this.selectedDay=this.currentDay=o.getDate();
this.selectedMonth=this.currentMonth=o.getMonth();
this.selectedYear=this.currentYear=o.getFullYear();
f(".dp-clear a",this.$dp).text(this.options.locale.clearText);
this._layout("Month");
this._position();
this.$dp.show();
this._visible=true
}},_position:function(){var q=this._curInstance.positioning,o=window.scrollX/d.ut.XfaUtil.prototype.formScaleFactor,n=window.scrollY/d.ut.XfaUtil.prototype.formScaleFactor,z=window.innerHeight/d.ut.XfaUtil.prototype.formScaleFactor,w=window.innerWidth/d.ut.XfaUtil.prototype.formScaleFactor,x=q.outerHeight(true),p=q.outerWidth(true),u=q.offset().top/d.ut.XfaUtil.prototype.formScaleFactor+x,r=q.offset().left/d.ut.XfaUtil.prototype.formScaleFactor,y={top:(u+"px"),left:(r+"px")},t=u+this.$dp.outerHeight(true)-z-n,v,s;
if(t>0){s=u-x-this.$dp.outerHeight(true)-20;
if(s<n){s=u-t;
if(h.isWebkit()){this._curInstance.$field.trigger("onoverlap.datetimepicker")
}}y.top=s+"px"
}if(r+this.$dp.outerWidth(true)>o+w){v=o+w-this.$dp.outerWidth(true)-20;
y.left=v+"px"
}h.$css(this.$dp.get(0),y);
return this
},_layout:function(n){if(n==null){this._hide()
}else{if(this.view){this["$"+this.view.toLowerCase()].hide()
}this.view=n;
this.$caption.toggleClass("disabled",!i[this.view].caption);
this["$"+this.view.toLowerCase()].show();
this["show"+this.view]()
}return this
},showMonth:function(){var p=this,q=this._maxDate(this.currentMonth),o=this._maxDate((this.currentMonth+12)%12),t=new Date(this.currentYear,this.currentMonth,1).getDay(),n=Math.ceil((t+q)/7)+1,r,s;
this.tabulateView({caption:this.options.locale.months[this.currentMonth]+", "+this._convertNumberToLocale(this.currentYear),header:this.options.locale.days,numRows:n,numColumns:7,elementAt:function(w,v){var u=(w-1)*7+v-t+1;
s=p._convertNumberToLocale(u);
r=u;
if(u<1){s=p._convertNumberToLocale(o+u);
r=-1
}else{if(u>q){s=p._convertNumberToLocale(u-q);
r=-1
}}return{data:r,display:s}
}})
},showYear:function(){var n=this,o;
this.tabulateView({caption:this._convertNumberToLocale(this.currentYear),numRows:4,numColumns:3,elementAt:function(q,p){o=q*3+p;
return{data:o,display:n.options.locale.months[o]}
}})
},showYearset:function(){var o,n=this;
this.tabulateView({caption:this._convertNumberToLocale(this.currentYear-this.options.yearsPerView/2)+"-"+this._convertNumberToLocale(this.currentYear-this.options.yearsPerView/2+this.options.yearsPerView-1),numRows:4,numColumns:4,elementAt:function(q,p){o=n.currentYear-8+(q*4+p);
return{data:o,display:n._convertNumberToLocale(o)}
}})
},insertRow:function(v,w,o,x){var r=this["$"+this.view.toLowerCase()],p=(this.actualWidth)/w.length,s=f("ul",r).eq(v),t,u,q,n,y=this;
if(!s.length){s=f("<ul></ul>").appendTo(r).toggleClass(c,o)
}s.height(x);
t=f("li",s).length;
while(t++<w.length){n=f("<li></li>").appendTo(s);
if(!o){n.bind("click",f.proxy(this._selectDate,this))
}}l.each(w,function(A,z){u=f("li",s).eq(z);
if(o){u.text(w[z])
}else{q=w[z];
h.$data(u.get(0),"value",q.data);
if(y._checkDateIsFocussed(q.data)){if(y.$focusedDate){y.$focusedDate.removeClass("dp-focus")
}y.$focusedDate=u;
if(y._keysEnabled){y.$focusedDate.addClass("dp-focus")
}}u.toggleClass("dp-selected",y._checkDateIsSelected(q.data)).toggleClass("disabled",q.data==-1).text(q.display).attr("title",q.data)
}u.css({height:x+"px",width:p+"px","line-height":x+"px"})
});
return s
},tabulateView:function(o){var p=0,q=0,s=[],n=this.options.viewHeight/o.numRows,t;
this.$caption.text(o.caption);
if(o.header){this.insertRow(p++,o.header,true,n)
}while(p<o.numRows){t=0;
while(t<o.numColumns){s[t]=o.elementAt(p,t);
t++
}this.insertRow(p++,s,false,n)
}q=f(".dp-"+this.view.toLowerCase()+"view ul:visible").length;
while(q>o.numRows){f(".dp-"+this.view.toLowerCase()+"view ul").eq(--q).hide()
}while(o.numRows>q){f(".dp-"+this.view.toLowerCase()+"view ul").eq(q++).show()
}},_activateField:function(n){this._curInstance=h.$data(n.target,"datetimepicker");
this._curInstance.$field.trigger("onfocus1.datetimepicker").addClass("datePickerTarget");
if(this.options.showCalendarIcon){this._curInstance.$field.parent().addClass("datePickerTarget")
}if(!this.touchSupported&&!this._keysEnabled){f(window).on("keydown.datetimepicker",f.proxy(this._hotKeys,this));
this._keysEnabled=true
}},_deactivateField:function(){if(this._curInstance){if(this._keysEnabled){f(window).off("keydown.datetimepicker");
this._keysEnabled=false
}if(this._curInstance.selectedDate!=this._curInstance.$field.val()){this._curInstance.selectedDate=this._curInstance.$field.val()
}this._curInstance.$field.trigger("onfocusout.datetimepicker").removeClass("datePickerTarget");
if(this.options.showCalendarIcon){this._curInstance.$field.parent().removeClass("datePickerTarget")
}this._curInstance=null
}},_hide:function(){if(this._visible){this.$dp.hide();
this._curInstance.$field.trigger("onclose.datetimepicker");
this._visible=false
}},_adjustDate:function(p,n){var q,o;
switch(n.toLowerCase()){case"day":this.currentDay+=p;
q=this._maxDate(this.currentMonth);
if(this.currentDay<1){o=this._maxDate((this.currentMonth-1+12)%12);
this.currentDay=o+this.currentDay;
return this._adjustDate(-1,"month")
}if(this.currentDay>q){this.currentDay-=q;
return this._adjustDate(+1,"month")
}break;
case"month":this.currentMonth+=p;
if(this.currentMonth>11){this.currentYear++;
this.currentMonth=0
}if(this.currentMonth<0){this.currentYear--;
this.currentMonth=11
}break;
case"year":this.currentYear+=p;
break;
case"yearset":this.currentYear+=p*this.options.yearsPerView;
break
}this._layout(this.view)
},_checkDateIsSelected:function(n){switch(this.view.toLowerCase()){case"month":return this.currentYear==this.selectedYear&&this.currentMonth==this.selectedMonth&&n==this.selectedDay;
case"year":return this.currentYear==this.selectedYear&&this.selectedMonth==n;
case"yearset":return this.selectedYear==n
}},_checkDateIsFocussed:function(n){switch(this.view.toLowerCase()){case"month":return n==this.currentDay;
case"year":return this.currentMonth==n;
case"yearset":return this.currentYear==n
}},_convertNumberToLocale:function(p){var o=this.options.locale.zero.charCodeAt(0);
p+="";
var q=[];
for(var n=0;
n<p.length;
n++){q.push(String.fromCharCode(o+parseInt(p.charAt(n))))
}return q.join("")
},_clearDate:function(){var n=this._curInstance.$field.val()?false:true;
this.selectedYear=this.selectedMonth=this.selectedYear=-1;
this._curInstance.selectedDate="";
this._curInstance.$field.val("");
if(!n){this._curInstance.$field.trigger("onvaluechange.datetimepicker",[{selectedDate:""}])
}f(".dp-selected",this["$"+this.view.toLowerCase()]).removeClass("dp-selected")
},getEvent:function(){return"click"
},_pad2:function(n){return n=n<10?"0"+n:n
},toString:function(){return this.selectedYear+"-"+this._pad2(this.selectedMonth+1)+"-"+this._pad2(this.selectedDay)
},_selectDate:function(p){var o=h.$data(p.target,"value"),n=i[this.view].li;
if(o==-1){return
}switch(this.view.toLowerCase()){case"month":this.selectedMonth=this.currentMonth;
this.selectedYear=this.currentYear;
this.selectedDay=o;
this._curInstance.selectedDate=this.toString();
this._curInstance.$field.val(this.toString());
this._curInstance.$field.trigger("onvaluechange.datetimepicker",[{selectedDate:this._curInstance.selectedDate}]);
f(".dp-selected",this["$"+this.view.toLowerCase()]).removeClass("dp-selected");
f(p.target).addClass("dp-selected");
break;
case"year":this.currentMonth=o;
break;
case"yearset":this.currentYear=o;
break
}this._layout(n);
if(!this.touchSupported){if(!this.hotKeyPressed){this.scriptFocus=true
}}else{if(n==null){this._deactivateField()
}}},_leapYear:function(){return this.year%400==0||(this.year%100!=0&&this.year%4==0)
},_maxDate:function(n){if(this._leapYear()&&n==1){return 29
}else{return a[n]
}},_access:function(n){if(typeof n=="undefined"){return this.access
}this.access=n
},_value:function(n){if(typeof n=="undefined"){return this.selectedDate
}else{this.selectedDate=n
}}});
var j=new b();
f.fn.adobeDateTimePicker=function(n,o){if(!j.initialized){j.create(n);
j.initialized=true
}if(typeof n==="object"){j._attachField(this,n)
}else{if(typeof n==="string"){if(arguments.length==2){j["_"+n].apply(h.$data(this[0],"datetimepicker"),[o])
}else{return j["_"+n].apply(h.$data(this[0],"datetimepicker"))
}}}return this
}
})(_,jQuery,xfalib);
(function(a){a.ut.TouchUtil=(function(){var b=!!("ontouchstart" in window||window.DocumentTouch&&document instanceof DocumentTouch),c=!!(window.MSPointerEvent||window.PointerEvent),e="mousedown",g="mousemove",d="mouseup",f="MouseEvent";
if(window.PointerEvent){e="pointerdown";
g="pointermove";
d="pointerup";
f="PointerEvent"
}else{if(window.MSPointerEvent){e="MSPointerDown";
g="MSPointerMove";
d="MSPointerUp";
f="MSPointerEvent"
}else{if(b){e="touchstart";
g="touchmove";
d="touchend";
f="TouchEvent"
}}}return{TOUCH_ENABLED:b,POINTER_EVENT:f,POINTER_ENABLED:c,POINTER_DOWN:e,POINTER_MOVE:g,POINTER_UP:d,getTouchEvent:function(h){var i;
if(c){i=h.originalEvent
}else{if(b&&h.originalEvent){i=h.originalEvent.touches[0];
if(h.originalEvent&&h.originalEvent.changedTouches&&h.originalEvent.changedTouches[0]){te=h.originalEvent.changedTouches[0]
}}else{i=h
}}return i
},getTouches:function(h){var i=[];
if(b&&h.originalEvent&&h.originalEvent.touches){i=h.originalEvent.touches
}return i
}}
})()
})(xfalib);
(function(a){a.widget("xfaWidget.abstractWidget",{$userControl:null,$data:xfalib.ut.XfaUtil.prototype.$data,$css:xfalib.ut.XfaUtil.prototype.$css,getOrElse:xfalib.ut.Class.prototype.getOrElse,dIndexOf:xfalib.ut.XfaUtil.prototype.dIndexOf,btwn:xfalib.ut.XfaUtil.prototype.btwn,logger:xfalib.ut.XfaUtil.prototype.getLogger,localeStrings:xfalib.ut.XfaUtil.prototype.getLocaleStrings,logMsgs:xfalib.ut.XfaUtil.prototype.getLogMessages,_widgetName:"abstractWidget",options:{name:"",value:null,commitProperty:"value",displayValue:null,screenReaderText:null,tabIndex:0,role:null,paraStyles:null,dir:null,hScrollDisabled:false},getOptionsMap:function(){return{tabIndex:function(b){this.$userControl.attr("tabindex",b)
},role:function(b){if(b){this.$userControl.attr("role",b)
}},screenReaderText:function(b){if(b){this.$userControl.attr("aria-label",b)
}},paraStyles:function(b){if(b){this.$css(this.$userControl.get(0),b)
}},dir:function(b){if(b){this.$userControl.attr("dir",this.options.dir)
}},height:function(b){if(b){this.$css(this.$userControl[0],{height:b})
}},width:function(b){if(b){this.$css(this.$userControl[0],{width:b})
}}}
},getEventMap:function(){return{focus:xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,blur:xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,click:xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT}
},_create:function(){this.widgetEventPrefix="";
this.element.addClass(this._widgetName);
this.$userControl=this.render();
this.optionsHandler=this.getOptionsMap();
this.eventMap=this.getEventMap();
this._initializeOptions();
this._initializeEventHandlers();
this.$css(this.$userControl.get(0),{"box-sizing":"border-box",position:"absolute"})
},_initializeEventHandlers:function(){_.each(this.eventMap,function(e,d){var b=this;
if(e){if(!(e instanceof Array)){e=[e]
}for(var c=0;
c<e.length;
c++){this.$userControl.bind(d,(function(f){return function(g){b._preProcessEvent.apply(b,[f,g]);
b._trigger(f,g);
b._postProcessEvent.apply(b,[f,g])
}
})(e[c]))
}}},this)
},_preProcessEvent:function(c,b){if(c==this.options.commitEvent){this.preProcessCommit(b)
}switch(c){case xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT:this.preProcessEnter(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT:this.preProcessExit(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT:this.preProcessChange(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT:this.preProcessClick(b);
break
}},_postProcessEvent:function(c,b){if(c==this.options.commitEvent){this.postProcessCommit(b)
}switch(c){case xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT:this.postProcessEnter(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT:this.postProcessExit(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT:this.postProcessChange(b);
break;
case xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT:this.postProcessClick(b);
break
}},_initializeOptions:function(){_.each(this.optionsHandler,function(c,b){if(typeof c==="function"){c.apply(this,[this.options[b]])
}},this)
},_setOption:function(b,c){if(this.options[b]!=c){this.options[b]=c;
if(typeof this.optionsHandler[b]==="function"){this.optionsHandler[b].apply(this,[this.options[b]])
}}},destroy:function(){this.$userControl.removeClass(this._widgetName)
},render:function(){var b;
if(this.element.children().length>0){b=a(this.element.children().get(0))
}else{b=this.element
}b.attr("name",this.options.name);
return b
},preProcessCommit:function(b){this.options.value=this.getCommitValue()
},getCommitValue:function(){},preProcessExit:function(b){},preProcessEnter:function(b){this._showError();
this.showValue()
},preProcessChange:function(b){},preProcessClick:function(b){},postProcessCommit:function(b){this.showDisplayValue()
},postProcessExit:function(b){this.showDisplayValue();
this._hideError()
},postProcessEnter:function(b){},postProcessChange:function(b){},postProcessClick:function(b){},showDisplayValue:function(){this.$userControl.val(this.options.displayValue)
},showValue:function(){this.$userControl.val(this.options.value)
},focus:function(){this.$userControl[0].focus()
},click:function(){this.focus();
this.$userControl.triggerHandler("click")
},_showError:function(){if(this.errorMessage||this.warningMessage){var c=a(this.element).offset();
var b={};
b.left=(c.left*(1/xfalib.ut.XfaUtil.prototype.formScaleFactor)+this.element.width()+5)+"px";
b.top=c.top*(1/xfalib.ut.XfaUtil.prototype.formScaleFactor)+"px";
if(this.errorMessage){this.$css(a("#error-msg").get(0),b);
a("#error-msg").text(this.errorMessage).show();
this.errorMessageVisible=true
}else{if(this.warningMessage){this.$css(a("#warning-msg").get(0),b);
a("#warning-msg").text(this.warningMessage).show();
this.warningMessageVisible=true
}}}},_handleVAlignOnExit:function(i){if(!this.options.paraStyles){return
}var e=this.options.displayValue;
var b=xfalib.view.util.TextMetrics.measureExtent(e,{refEl:this.$userControl.get(0),maxHeight:-1}).height;
var d=this.options.height;
var f=d-b;
var h=(a.browser.mozilla||a.browser.msie)&&this.options.multiLine;
if(this.options.paraStyles&&f>0&&!h){var g=this.options.paraStyles["vertical-align"];
if(g=="bottom"){this.padding=this.$userControl.css("padding-top");
f=f-this.options.paraStyles["padding-bottom"];
this.$userControl.css("padding-top",f)
}else{if(g=="top"||(g!="middle"&&g==undefined)){this.padding=this.$userControl.css("padding-bottom");
if(this.options.paraStyles["padding-top"]){f=f-this.options.paraStyles["padding-top"]
}this.$userControl.css("padding-bottom",f)
}else{if(this.options.multiLine&&g=="middle"){var c=f/2;
c=c-this.options.paraStyles["padding-bottom"];
if(this.options.paraStyles["padding-top"]){c=c+this.options.paraStyles["padding-top"]
}this.$userControl.css("padding-top",c)
}}}}},_handleVAlignOnEnter:function(d){var c=(a.browser.mozilla||a.browser.msie)&&this.options.multiLine;
if(this.options.paraStyles&&!a.browser.msie&&!c){var b=this.options.paraStyles["vertical-align"];
if(b=="bottom"&&this.padding){this.$userControl.css("padding-top",this.padding)
}else{if(b=="top"&&this.padding){this.$userControl.css("padding-bottom",this.padding)
}}}},_hideError:function(){if(this.errorMessageVisible){a("#error-msg").hide();
this.errorMessageVisible=false
}else{if(this.warningMessageVisible){a("#warning-msg").hide();
this.warningMessageVisible=false
}}},markError:function(c,b){if(b!="warning"){if(a("#error-msg").length<1){a("<div id='error-msg'></div>").appendTo("body")
}this.errorMessage=c
}else{if(a("#warning-msg").length<1){a("<div id='warning-msg'></div>").appendTo("body")
}this.warningMessage=c
}},clearError:function(){this._hideError();
this.errorMessage=null;
this.warningMessage=null
}})
})(jQuery);
(function(a){a.widget("xfaWidget.defaultWidget",a.xfaWidget.abstractWidget,{_widgetName:"defaultWidget",getOptionsMap:function(){var b=a.xfaWidget.abstractWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{access:function(c){switch(c){case"open":this.$userControl.removeAttr("readOnly");
this.$userControl.removeAttr("aria-readonly");
this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break;
case"nonInteractive":case"protected":this.$userControl.attr("disabled","disabled");
this.$userControl.attr("aria-disabled","true");
break;
case"readOnly":this.$userControl.attr("readOnly","readOnly");
this.$userControl.attr("aria-readonly","true");
break;
default:this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break
}},displayValue:function(c){if(this.options.commitProperty){this.$userControl.attr(this.options.commitProperty,this.options.displayValue)
}else{this.logger().debug("xfaView","[DefaultWidget._update], User Control or Commit Property is null")
}}})
},render:function(){var b=a.xfaWidget.abstractWidget.prototype.render.apply(this,arguments);
this._attachEventHandlers(b);
return b
},getCommitValue:function(){var b=this.$userControl.val();
if(this.options.hScrollDisabled&&!this.options.multiLine){var b=xfalib.ut.XfaUtil.prototype.splitStringByWidth(this.$userControl.val(),this.$userControl.width(),this.$userControl.get(0))
}return b
},_attachEventHandlers:function(b){b.keydown(a.proxy(this._handleKeyDown,this));
b.keypress(a.proxy(this._handleKeyPress,this));
b.on("paste",a.proxy(this._handlePaste,this))
},_handleKeyDown:function(b){if(b.keyCode==13||b.charCode==13||b.which==13){b.preventDefault()
}},_handleKeyPress:function(b){if(b.keyCode==13||b.charCode==13||b.which==13){b.preventDefault()
}}})
})(jQuery);
(function(b){var a=xfalib.ut.XfaUtil.prototype;
b.widget("xfaWidget.dateTimeEdit",b.xfaWidget.defaultWidget,{_widgetName:"dateTimeEdit",getEventMap:function(){var c=b.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
if(this._nativeWidget===false){return b.extend({},c,{"onfocus1.datetimepicker":xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,"onvaluechange.datetimepicker":xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,"onfocusout.datetimepicker":xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,"onoverlap.datetimepicker":xfalib.ut.XfaUtil.prototype.XFA_CLICK_EVENT,focus:null,blur:null})
}else{return b.extend({},c,{change:xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT})
}},_getAdobeDatePickerOptionsMap:function(c){return{access:function(d){switch(d){case"open":this.$userControl.adobeDateTimePicker("access",true);
break;
case"nonInteractive":case"protected":case"readOnly":this.$userControl.adobeDateTimePicker("access",false);
break
}c.access.apply(this,arguments)
},value:function(d){this.$userControl.adobeDateTimePicker("value",d)
}}
},_getNativeDatePickerOptionsMap:function(c){return{displayValue:function(d){this.showDisplayValue()
}}
},getOptionsMap:function(){var d=b.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments),c=this._nativeWidget===false?this._getAdobeDatePickerOptionsMap(d):this._getNativeDatePickerOptionsMap(d),e={paraStyles:function(f){d.paraStyles.apply(this,arguments);
this._handleVAlignOnExit()
}};
return b.extend({},d,c,e)
},postProcessExit:function(c){b.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
this._handleVAlignOnExit()
},preProcessEnter:function(c){b.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
this._handleVAlignOnEnter()
},showDisplayValue:function(){if(this._nativeWidget===false){b.xfaWidget.defaultWidget.prototype.showDisplayValue.apply(this,arguments)
}else{this.showValue()
}},getCommitValue:function(){if(this._nativeWidget===false){return this.$userControl.adobeDateTimePicker("value")
}return b.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this,arguments)
},render:function(){var c=this,e=this.getOrElse(this.$data(this.element.get(0),"xfamodel"),"textstyle",""),d=b.xfaWidget.abstractWidget.prototype.render.apply(this,arguments);
this._nativeWidget=true;
if(this.options.useNativeWidget===false||d[0].type!=="date"){this._nativeWidget=false;
this.element.children().remove();
b("<div></div>").css("position","relative").append(b("<input type='text'/>")).appendTo(this.element);
d=b("input",this.element).attr("style","width:100%;height:100%;"+e).attr("name",this.options.name).adobeDateTimePicker({positioning:this.element,locale:{months:this.options.months,days:this.options.days,zero:this.options.zero,clearText:this.options.clearText},access:this.options.access,value:this.options.value,showCalendarIcon:this.options.showCalendarIcon})
}this._attachEventHandlers(d);
return d
}})
})(jQuery);
(function(a){a.widget("xfaWidget.numericInput",a.xfaWidget.defaultWidget,{_widgetName:"numericInput",options:{value:null,curValue:null,pos:0,lengthLimitVisible:true,zero:"0",decimal:"."},_matchArray:{integer:"^[+-]?{digits}*$",decimal:"^[+-]?{digits}{leading}({decimal}{digits}{fraction})?$","float":"^[+-]?{digits}*({decimal}{digits}*)?$"},_regex:null,_engRegex:null,_writtenInLocale:false,getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{paraStyles:function(c){b.paraStyles.apply(this,arguments);
this._handleVAlignOnExit()
},height:function(c){if(c){this.$css(this.$userControl[0],{height:c});
this._handleVAlignOnExit()
}}})
},getEventMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return a.extend({},b,{"onKeyInput.numericInput":xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT})
},_getDigits:function(){var c=this.options.zero.charCodeAt(0),d="";
for(var b=0;
b<10;
b++){d+=String.fromCharCode(c+b)
}return"["+d+"]"
},_escape:function(b){return b.replace(".","\\.")
},postProcessExit:function(b){a.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
this._handleVAlignOnExit()
},preProcessEnter:function(b){a.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
this._handleVAlignOnEnter()
},render:function(){var b=this._matchArray[this.options.dataType];
if(b){var h=this.options.leadDigits,f=this.options.fracDigits,g=h&&h!=-1?"{0,"+h+"}":"*",d=f&&f!=-1?"{0,"+f+"}":"*",b=b.replace("{leading}",g).replace("{fraction}",d),c=b.replace(/{digits}/g,this._getDigits()).replace("{decimal}",this._escape(this.options.decimal)),e=b.replace(/{digits}/g,"[0-9]").replace("{decimal}","\\.");
this._processValue=!(this._getDigits()=="[0123456789]"&&this.options.decimal==".");
this._regex=new RegExp(c,"g");
this._engRegex=new RegExp(e,"g")
}return a.xfaWidget.defaultWidget.prototype.render.apply(this,arguments)
},getCommitValue:function(){var b=a.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this,arguments);
if(b.length>0&&this._processValue&&!b.match(this._engRegex)){this._writtenInLocale=true;
b=this._convertValueFromLocale(b)
}else{this._writtenInLocale=false
}if(b&&b.length>=this.options.combCells){b=b.slice(0,this.options.combCells)
}return b
},_attachEventHandlers:function(b){a.xfaWidget.defaultWidget.prototype._attachEventHandlers.apply(this,arguments)
},_handleKeyInput:function(b,f,c){if(b.ctrlKey&&b.type!="paste"){return true
}a.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this,arguments);
this.options.lengthLimitVisible=true;
var d=this.$userControl.attr(this.options.commitProperty)||"",h=this.$userControl.get(0).selectionStart||0,i=h,j=this.$userControl.get(0).selectionEnd||0,k=parseInt(this.options.combCells)||0,g;
if(k>0){f=f.substr(0,k-d.length)
}g=d.substr(0,h)+f+d.substr(h);
if(!(this._regex==null||g.match(this._regex)||g.match(this._engRegex))){b.preventDefault();
return false
}if(b.type!="keydown"&&k&&(d.length>=k||g.length>k)&&i==j){b.preventDefault();
return false
}this.options.curValue=d;
this.options.pos=h;
if(this.options.hScrollDisabled&&b.type!="keydown"){var e=xfalib.view.util.TextMetrics.measureExtent(g,{refEl:this.$userControl.get(0),maxWidth:-1}).width;
if(!b.ctrlKey&&e>this.$userControl.width()-5){b.preventDefault();
this.options.lengthLimitVisible=false
}}this.$userControl.trigger({type:"onKeyInput.numericInput",originalType:b.type,character:f,keyCode:b.keyCode||0,charCode:b.charCode||0,which:b.which||0,ctrlKey:b.ctrlKey||b.metaKey||false,shiftKey:b.shiftKey||false,keyDown:false})
},_handleKeyDown:function(c){if(c){var b=c.charCode||c.which||c.keyCode||0;
if(b==8||b==46){this._handleKeyInput(c,"",b)
}else{if(b==32){c.preventDefault();
return false
}}}},_handleKeyPress:function(c){if(c){var b=c.charCode||c.which||c.keyCode||0,d=String.fromCharCode(b);
if(c.key&&!_.contains(["MozPrintableKey","Subtract","Decimal"],c.key)&&c.key.length!=1){return true
}if(d>="0"&&d<="9"||d==="."||d==="-"){this._handleKeyInput(c,d,b)
}else{if(!c.ctrlKey){c.preventDefault();
return false
}}}},_handlePaste:function(b){if(b){var c=undefined;
if(window.clipboardData&&window.clipboardData.getData){c=window.clipboardData.getData("Text")
}else{if(b.originalEvent.clipboardData&&b.originalEvent.clipboardData.getData){c=b.originalEvent.clipboardData.getData("text/plain")
}}if(c){if(_.every(c.split(""),function(d){if(d>="0"&&d<="9"||d==="."||d==="-"){return true
}})){this._handleKeyInput(b,c,0)
}else{if(!b.ctrlKey){b.preventDefault();
return false
}}}}},_convertValueToLocale:function(c){var b=this.options.zero.charCodeAt(0);
return _.map(c.split(""),function(d){if(d=="."){return this.options.decimal
}else{return String.fromCharCode(+d+b)
}},this).join("")
},_convertValueFromLocale:function(c){var b=this.options.zero.charCodeAt(0);
return _.map(c.split(""),function(d){if(d==this.options.decimal){return"."
}else{return d.charCodeAt(0)-b+""
}},this).join("")
},showValue:function(){if(this.options.value&&this._writtenInLocale){this.$userControl.val(this._convertValueToLocale(this.options.value))
}else{this.$userControl.val(this.options.value)
}if(a.browser.msie){this.$userControl.select()
}else{}}})
})(jQuery);
(function(a){a.widget("xfaWidget.dropDownList",a.xfaWidget.defaultWidget,{_widgetName:"dropDownList",options:{value:[],items:[],editable:false,displayValue:[]},getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{value:function(d){if(!_.isArray(d)){d=[d]
}var c=false;
a("option",this.$userControl).each(function(e){var f=a(this).val();
if(d){if(_.contains(d,f)){a(this).attr("selected",true);
c=true
}else{a(this).attr("selected",false);
if(this.id==="emptyValue"){a(this).val("").html("").hide()
}}}});
if(d&&(d.length==0||d[0]==null)){this.$userControl.children("#emptyValue").attr("selected",true)
}else{if(!c){this.$userControl.children("#emptyValue").text(d[0]).attr("selected",true).val(_.escape(d[0])).show()
}}},items:function(f){if(!_.isArray(f)){f=[f]
}var c=a("option",this.$userControl);
var e=0;
if(c[e]&&c[e].id=="emptyValue"){e=1
}if((c.length-e)>f.length){for(var d=c.length;
d>(e+f.length);
d--){this.deleteItem(d-1-e)
}}else{if((c.length-e)<f.length){for(var d=f.length;
d>(c.length-e);
d--){this.addItem({sDisplayVal:f[d-1].display,sSaveVal:f[d-1].save})
}}}_.each(f,function(h,g,i){var j=a(c[g+e]);
if(j.text()!=h.display){j.text(h.display)
}if(j.attr("value")!=h.save){j.attr("value",h.save)
}})
},displayValue:function(){},access:function(c){switch(c){case"open":this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break;
case"nonInteractive":case"protected":case"readOnly":this.$userControl.attr("disabled","disabled");
this.$userControl.attr("aria-disabled","true");
break;
default:this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break
}}})
},getEventMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return a.extend({},b,{focus:[xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,xfalib.ut.XfaUtil.prototype.XFA_PREOPEN_EVENT],change:xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT})
},render:function(){this.element.addClass(this._widgetName);
this.element.children().remove();
var c=_.uniqueId("select"),h=this.getOrElse(this.$data(this.element.get(0),"xfamodel"),"textstyle",""),e=this,g='<select name="<%=inputName%>" style="width:100%; height: 100%;<%=textStyle%>" size = "1" role="combobox" <% if(editable) {%> class="combobox"  <%} %> ><option id="emptyValue" role="listitem" value="" style="display: none;"></option><% _.each(items, function(item){ %><% var saveItem = item.save ? item.save.replace(/"/g,"&quot;"):null %><option role="option" value="<%= saveItem %>"><%= item.display %></option><%})%></select>',d=_.extend({inputName:c,textStyle:h},this.options),b=_.template(g,d);
this.element.html(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(b));
var f=this.element.children().eq(0).attr("name",this.options.name);
this._attachEventHandlers(f);
return f
},addItem:function(b){this.$userControl[0].add(new Option(b.sDisplayVal,b.sSaveVal),null);
if(b.sSaveVal==this.options.value&&b.sDisplayVal==this.options.displayValue){this.$userControl.children("#emptyValue").val("").html("").attr("selected",false).hide();
this.$userControl.find("[value="+this.options.value+"]").attr("selected",true);
return
}},clearItems:function(){for(var b=this.$userControl[0].options.length-1;
b>=1;
b--){this.$userControl[0].remove(b)
}if(this.options.value){this.$userControl.children("#emptyValue").text(this.options.value).attr("selected",true).val(this.options.value).show()
}},deleteItem:function(b){if(this.$userControl[0].item(0)&&this.$userControl[0].item(0).id=="emptyValue"){b=b+1
}this.$userControl[0].remove(b)
},getCommitValue:function(b){var c=a("option:selected",this.$userControl).map(function(){return a(this).val()
}).get();
return c
},showDisplayValue:function(){},destroy:function(){this.element.removeClass(this._widgetName).children().remove().text("");
a.xfaWidget.defaultWidget.prototype.destroy.apply(this,arguments)
},_handleKeyDown:function(b){if(b.keyCode==13){}else{a.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this,arguments)
}}})
})(jQuery);
(function(a){a.widget("xfaWidget.listBox",a.xfaWidget.defaultWidget,{_widgetName:"listBoxWidget",options:{value:[],items:[],multiSelect:false},getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{width:function(c){this.options.width=c*0.95;
b.width.apply(this,[this.options.width])
},access:function(){},value:function(f){var d=this.options.value,c=this,e=false;
if(!_.isArray(d)){d=[d]
}var e;
this.$userControl.children().each(function(){var g=a(this).attr("data-save");
if(d&&_.contains(d,g)){a(this).removeClass("item-selectable");
a(this).addClass("item-selected");
e=true;
a(this).attr("tabIndex",c.options.tabIndex)
}else{a(this).removeClass("item-selected");
a(this).addClass("item-selectable");
a(this).attr("tabIndex","-1")
}});
if(!e){a(this.$userControl.children().get(0)).attr("tabIndex",this.options.tabIndex)
}},items:function(e){if(!_.isArray(e)){e=[e]
}var c=this.$userControl.children();
if((c.length)>e.length){for(var d=c.length;
d>e.length;
d--){this.deleteItem(d-1)
}}else{if((c.length)<e.length){for(var d=e.length;
d>(c.length);
d--){this.addItem({sDisplayVal:e[d-1].display,sSaveVal:e[d-1].save})
}}}_.each(e,function(g,f,h){var i=a(c[f]);
if(i.val()!=g.display){i.val(g.display)
}if(i.attr("data-save")!=g.save){i.attr("data-save",g.save)
}})
},displayValue:function(){},tabIndex:function(){var d=this.$userControl.children(".item-selected"),c=this.$userControl.children();
if(d.length){d.eq(0).attr("tabIndex",this.options.tabIndex)
}else{if(c.length>0){c.eq(0).attr("tabIndex",this.options.tabIndex)
}}}})
},getEventMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return a.extend({},b,{listboxenter:xfalib.ut.XfaUtil.prototype.XFA_ENTER_EVENT,listboxexit:xfalib.ut.XfaUtil.prototype.XFA_EXIT_EVENT,listboxchange:xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,focus:null,blur:null})
},showDisplayValue:function(){},render:function(){this.element.addClass(this._widgetName);
this.element.children().remove();
var g=this.getOrElse(this.$data(this.element.get(0),"xfamodel"),"textstyle",""),d=this,f='<ol style="position:absolute;<%=textStyle%>" role="listbox"><% _.each(items, function(item){ %><% var saveItem = item.save ? item.save.replace(/"/g,"&quot;"):null %><li role="option" data-save="<%= saveItem %>" data-selected="false"><%= item.display %></li><%})%></ol>',c=_.extend({textStyle:g},this.options),b=_.template(f,c);
d.element.html(xfalib.ut.XfaUtil.prototype.encodeScriptableTags(b));
var e=a(d.element.children().get(0)).attr("name",this.options.name);
this._attachEventHandlers(e);
return e
},focus:function(){if(this.$userControl.children(".item-selected").length>0){this.$userControl.children(".item-selected")[0].focus()
}else{if(this.$userControl.children().length>0){this.$userControl.children()[0].focus()
}}},addItem:function(b){a("<li></li>").attr("data-save",b.sSaveVal).text(b.sDisplayVal).appendTo(this.$userControl).click(a.proxy(this._handleItemClick,this)).focus(a.proxy(this._handleItemFocus,this))
},clearItems:function(){a(this.$userControl).empty()
},deleteItem:function(b){a(this.$userControl).children("li").each(function(c,d){if(c==b){a(d).off("click").off("focus").remove()
}})
},_attachEventHandlers:function(c){var b=this;
c.keydown(a.proxy(this._hotKeys,this)).children().on("mousedown",function(){if(b.inFocus==true){b.mouseDown=true
}}).click(a.proxy(this._handleItemClick,this)).focus(a.proxy(this._handleItemFocus,this)).blur(a.proxy(this._handleFocusOut,this))
},_hotKeys:function(c){if(this.options.access!="open"){return
}if(this.itemInFocus){switch(c.which){case 38:var b=a(this.itemInFocus).prev();
if(b){this.keyDown=true;
b.focus();
this.keyDown=false
}c.preventDefault();
break;
case 40:var d=a(this.itemInFocus).next();
if(d){this.keyDown=true;
d.focus();
this.keyDown=false
}c.preventDefault();
break;
case 91:case 92:c.preventDefault();
break;
case 32:this._toggleItem(this.itemInFocus);
c.preventDefault();
break;
default:}}},_toggleItem:function(e){var b=a(e),c=this.options.multiSelect,d=this;
this.$data(e,"selected",!this.$data(e,"selected"));
var g=this.$data(e,"selected");
if(!c){var f=this.$userControl.children(".item-selected");
if(f.length){this.$data(f[0],"selected",false);
f.removeClass("item-selected").addClass("item-selectable")
}}b.toggleClass("item-selectable",!g).toggleClass("item-selected",g);
this.$userControl.trigger("listboxchange")
},getCommitValue:function(){var c=this,b=this.options.multiSelect;
return this.$userControl.children().map(function(){return c.$data(this,"selected")?a(this).attr("data-save"):null
}).get()
},_handleItemFocus:function(c){if(this.options.access!="open"){return
}var b=c.target;
this.itemInFocus=b;
if(!(this.keyDown||this.mouseDown)){this.$userControl.trigger("listboxenter")
}this.mouseDown=false;
this.inFocus=true
},_handleItemClick:function(b){if(this.mouseDown==true){this.mouseDown=false
}if(this.options.access!="open"){return
}this._toggleItem(b.target)
},_handleFocusOut:function(){if(!(this.keyDown||this.mouseDown)){this.$userControl.trigger("listboxexit");
this.inFocus=false
}},destroy:function(){this.element.removeClass(this._widgetName).children().remove().text("");
a.xfaWidget.defaultWidget.prototype.destroy.apply(this,arguments)
}})
})(jQuery);
(function(a){a.widget("xfaWidget.nwkListBox",a.xfaWidget.dropDownList,{_widgetName:"nwkListBox",options:{value:[],multiSelect:false},render:function(){var b=a.xfaWidget.dropDownList.prototype.render.apply(this,arguments);
if(b){b.children("#emptyValue").remove();
if(this.options.multiSelect){b.attr("multiple","multiple")
}}this._updateSelectSize(b);
return b
},addItem:function(b){a.xfaWidget.dropDownList.prototype.addItem.apply(this,arguments);
this._updateSelectSize()
},clearItems:function(){a.xfaWidget.dropDownList.prototype.clearItems.apply(this,arguments);
this._updateSelectSize()
},deleteItem:function(b){a.xfaWidget.dropDownList.prototype.deleteItem.apply(this,arguments);
this._updateSelectSize()
},_updateSelectSize:function(b){b=b||this.$userControl;
b.attr("size",(this.options.items||[]).length)
},showValue:function(){}})
})(jQuery);
(function(a){a.widget("xfaWidget.xfaButton",a.xfaWidget.defaultWidget,{_widgetName:"xfaButton",options:{value:null,svgCaption:false},getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{access:function(c){switch(c){case"open":this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break;
case"nonInteractive":case"protected":case"readOnly":this.$userControl.attr("disabled","disabled");
this.$userControl.attr("aria-disabled","true");
break;
default:this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break
}},value:function(){},displayValue:function(){},svgCaption:function(c){if(c){this.$userControl.removeAttr("value")
}}})
},_attachEventHandlers:function(b){var c=this;
b.click(function(){c.focus()
})
},getCommitValue:function(){return this.options.value
},showValue:function(){},showDisplayValue:function(){}})
})(jQuery);
(function(a){a.widget("xfaWidget.XfaCheckBox",a.xfaWidget.defaultWidget,{_widgetName:"XfaCheckBox",options:{value:null,state:-1,states:2,values:[]},checkedState:false,getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{access:function(c){switch(c){case"open":this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break;
case"nonInteractive":case"protected":case"readOnly":this.$userControl.attr("disabled","disabled");
this.$userControl.attr("aria-disabled","true");
break;
default:this.$userControl.removeAttr("disabled");
this.$userControl.removeAttr("aria-disabled");
break
}},displayValue:function(c){this.$userControl.attr(this.options.commitProperty,this.options.value);
this._state(this.dIndexOf(this.options.values,this.options.value));
this.$userControl.attr("checked",this.checkedState);
this.$userControl.attr("aria-selected",this.checkedState);
if(this.options.state==2){this.$userControl.addClass("neutral")
}else{if(this.options.states==3){this.$userControl.removeClass("neutral")
}}},allowNeutral:function(d){var c=parseInt(d);
if(c==0||c==1){this.options.states=2+c
}},paraStyles:function(c){b.paraStyles.apply(this,arguments);
this._handleVAlignOnExit()
}})
},getEventMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return a.extend({},b,{change:xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT})
},_attachEventHandlers:function(c){var d=this;
var e=function(f){if(!d.inFocus){d.focus();
d.inFocus=true
}};
var b=function(f){d.inFocus=false
};
c.click(e).change(e).blur(b)
},getCommitValue:function(){this._state((this.options.state+1)%this.options.states);
this.$userControl.attr("checked",this.checkedState);
this.$userControl.attr("aria-selected",this.checkedState);
if(this.options.state==2){this.$userControl.addClass("neutral")
}else{if(this.options.states==3){this.$userControl.removeClass("neutral")
}}return this.options.values[this.options.state]
},_handleVAlignOnExit:function(b){},_state:function(b){if(b==undefined){return this.options.state
}else{this.options.state=b
}this.checkedState=(b==0||b==2)
},click:function(){if(this.$userControl.attr("type")!=="radio"||this.options.state!==0){this.$userControl.trigger("change")
}this.$userControl.triggerHandler("click")
}})
})(jQuery);
(function(a){a.widget("xfaWidget.textField",a.xfaWidget.defaultWidget,{_widgetName:"textField",options:{curValue:null,pos:0,lengthLimitVisible:true,maxChars:0,flag:""},getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{maxChars:function(c){if(this._maxCharsReached(this.options.value)){var d=this.options.value.slice(0,c);
this._setOption("value",d);
this._setOption("displayValue",d)
}},"multiLine ":function(c){if(this.options.multiLine){this.$userControl.attr("aria-multiline","true")
}else{this.$userControl.removeAttr("aria-multiline","false")
}},height:function(c){if(c){this.$css(this.$userControl[0],{height:c});
this._handleVAlignOnExit()
}},paraStyles:function(c){b.paraStyles.apply(this,arguments);
this._handleVAlignOnExit()
}})
},getEventMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return a.extend({},b,{"onKeyInput.textField":xfalib.ut.XfaUtil.prototype.XFA_CHANGE_EVENT})
},_maxCharsReached:function(b){return this.options.maxChars&&this.options.maxChars!=="0"&&b&&b.length>=this.options.maxChars
},_handleKeyInput:function(b,h,c){if(b.ctrlKey&&b.type!="paste"){return true
}if(!this.options.multiLine){a.xfaWidget.defaultWidget.prototype._handleKeyDown.apply(this,arguments);
h=(c==13)?"":h
}var e=this.$userControl.val(),k=e.replace(/\s/g,"&nbsp;"),d=k+h,i=this.$userControl.get(0).selectionStart||0,j=i,l=this.$userControl.get(0).selectionEnd||0;
if(!this.options.multiLine){this.options.lengthLimitVisible=true;
this.options.curValue=e;
this.options.pos=i;
if(this.options.hScrollDisabled&&b.type!="keydown"){var g=xfalib.view.util.TextMetrics.measureExtent(d,{refEl:this.$userControl.get(0),maxWidth:-1}).width;
if(!b.ctrlKey&&g>this.$userControl.width()){b.preventDefault();
this.options.lengthLimitVisible=false
}}}else{if(this.options.multiLine&&this.options.hScrollDisabled){this.$userControl.css("padding","0px 0px 0px");
var f=a(this.element[0]).find("textarea")[0].value;
if(a(this.element[0]).find("textarea")[0].scrollHeight>a(this.element[0]).find("textarea")[0].offsetHeight&&b.type!="keydown"&&!_.contains(["Del","Backspace","Up","Down","Left","Right"],b.key)){b.preventDefault();
while(a(this.element[0]).find("textarea")[0].scrollHeight>a(this.element[0]).find("textarea")[0].offsetHeight){f=a(this.element[0]).find("textarea")[0].value=f.slice(0,-1)
}h=""
}}}if(b.type!="keydown"&&this._maxCharsReached(e)&&j==l){b.preventDefault();
return false
}this.$userControl.trigger({type:"onKeyInput.textField",originalType:b.type,character:h,keyCode:b.keyCode||0,charCode:b.charCode||0,which:b.which||0,ctrlKey:b.ctrlKey||b.metaKey||false,shiftKey:b.shiftKey||false,keyDown:false})
},_handleKeyDown:function(c){if(c){var b=c.charCode||c.which||c.keyCode||0;
if(b==8||b==46){this._handleKeyInput(c,"",b)
}}},_handleKeyPress:function(c){if(c){var b=c.charCode||c.which||c.keyCode||0,d=(b==13)?"\n":String.fromCharCode(b);
if(c.key&&!_.contains(["MozPrintableKey","Divide","Multiply","Subtract","Add","Enter","Decimal","Spacebar"],c.key)&&c.key.length!=1){return true
}this._handleKeyInput(c,d,b)
}},_handlePaste:function(b){if(b){var e=undefined;
if(window.clipboardData&&window.clipboardData.getData){e=window.clipboardData.getData("Text")
}else{if(b.originalEvent.clipboardData&&b.originalEvent.clipboardData.getData){e=b.originalEvent.clipboardData.getData("text/plain")
}}if(e){var d=this.$userControl.val()||"",c=parseInt(this.options.maxChars)||0;
if(c>0){e=e.substr(0,c-d.length)
}if(e){this._handleKeyInput(b,e,0)
}}}},postProcessExit:function(b){a.xfaWidget.defaultWidget.prototype.postProcessExit.apply(this,arguments);
if(this.options.multiLine&&this.options.hScrollDisabled){this.handlePasteOnExit();
return
}this._handleVAlignOnExit()
},preProcessEnter:function(b){a.xfaWidget.defaultWidget.prototype.preProcessEnter.apply(this,arguments);
if(this.options.multiLine&&this.options.hScrollDisabled){return
}this._handleVAlignOnEnter()
},showValue:function(){a.xfaWidget.defaultWidget.prototype.showValue.apply(this,arguments);
if(a.browser.msie){this.$userControl.select()
}else{}},handlePasteOnExit:function(){var b=a(this.element[0]).find("textarea")[0].value;
if(this.options.flag!=b){while(a(this.element[0]).find("textarea")[0].scrollHeight>a(this.element[0]).find("textarea")[0].offsetHeight){b=a(this.element[0]).find("textarea")[0].value=b.slice(0,-1)
}this._setOption("value",b);
this._setOption("displayValue",b);
this.options.flag=b
}},getCommitValue:function(){var b=a.xfaWidget.defaultWidget.prototype.getCommitValue.apply(this,arguments);
if(this._maxCharsReached(b)){b=b.slice(0,this.options.maxChars)
}this.$userControl.val(this.options.value);
if(this.options.multiLine&&this.options.hScrollDisabled){return b
}return b
}})
})(jQuery);
(function(a){a.widget("xfaWidget.imageField",a.xfaWidget.defaultWidget,{_widgetName:"imageField",options:{tabIndex:0,role:"img"},getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{screenReaderText:function(c){if(c){this.$userControl.attr("alt",c)
}},displayValue:function(d){var c="data:image;base64,"+this.options.value;
this.$userControl.attr(this.options.commitProperty,c)
},access:function(){}})
}})
})(jQuery);
(function(a){a.widget("xfaWidget.signatureField",a.xfaWidget.defaultWidget,{_widgetName:"signatureField",getOptionsMap:function(){var b=a.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return a.extend({},b,{displayValue:function(c){},access:function(c){}})
},render:function(){var b=a.xfaWidget.defaultWidget.prototype.render.apply(this,arguments);
if(b){b.attr("readOnly","readonly").attr("disabled",true)
}return b
}})
})(jQuery);
(function(h,e){var c=e.ut.TouchUtil;
var i=(function(){return{localeString:function(m){return e.ut.XfaUtil.prototype.encodeScriptableTags(h.xfaWidget.abstractWidget.prototype.localeStrings()[m])||m
}}
})();
var b=46;
var k=27;
var l=13;
function g(p,o,m,n,q){this._callback=q;
this.canvasID=p;
this._lineWidth=5;
this.canvas=h("#"+p);
this.context=this.canvas.get(0).getContext("2d");
this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
this._enabled=true;
this.context.strokeStyle="#000000";
this.canvasBorderWidth=parseInt(this.canvas.css("border-left-width"),10);
this.context.lineWidth=this._lineWidth;
this.lastMousePoint={x:0,y:0};
this.canvas[0].width=m;
this.canvas[0].height=n;
if(!o){this.context.fillStyle="#ffffff";
this.context.clearRect(0,0,m,n)
}else{this.context.drawImage(o,0,0)
}this.canvas.bind(c.POINTER_DOWN,this.onCanvasMouseDown())
}g.prototype.setLineWidth=function(m){this._lineWidth=m
};
g.prototype.onCanvasMouseDown=function(){var m=this;
return function(n){if(c.getTouches(n).length<2){m.mouseMoveHandler=m.onCanvasMouseMove();
m.mouseUpHandler=m.onCanvasMouseUp();
h(document).bind(c.POINTER_MOVE,m.mouseMoveHandler);
h(document).bind(c.POINTER_UP,m.mouseUpHandler);
m.updateMousePosition(n);
m.updateCanvas(n)
}}
};
g.prototype.onCanvasMouseMove=function(){var m=this;
return function(n){if(c.getTouches(n).length<2){m.updateCanvas(n);
n.preventDefault();
return false
}}
};
g.prototype.onCanvasMouseUp=function(n){var m=this;
return function(o){h(document).unbind(c.POINTER_MOVE,m.mouseMoveHandler);
h(document).unbind(c.POINTER_UP,m.mouseUpHandler);
m.mouseMoveHandler=null;
m.mouseUpHandler=null
}
};
g.prototype.updateMousePosition=function(m){if(!this._enabled){return
}var n=c.getTouchEvent(m);
var o=this.canvas.offset();
this.lastMousePoint.x=n.clientX+h(window).scrollLeft()-o.left-this.canvasBorderWidth;
this.lastMousePoint.y=n.clientY+h(window).scrollTop()-o.top-this.canvasBorderWidth
};
g.prototype._isInsideCanvas=function(m,n){return n>=0&&n<this.canvas[0].height&&m>=0&&m<this.canvas[0].width
};
g.prototype.updateCanvas=function(n){if(!this._enabled){return
}var w,u,q,p,o,v,t,s,r;
s=parseInt(this.canvas[0].style.width,10);
r=parseInt(this.canvas[0].style.height,10);
v=s?this.canvas[0].width/s:1;
t=r?this.canvas[0].height/r:1;
v/=e.ut.XfaUtil.prototype.formScaleFactor;
t/=e.ut.XfaUtil.prototype.formScaleFactor;
w=this.lastMousePoint.x*v;
u=this.lastMousePoint.y*t;
this.updateMousePosition(n);
var m=this.lastMousePoint.x*v;
var x=this.lastMousePoint.y*t;
q=Math.abs(m-w);
p=Math.abs(x-u);
o=(q>0||p>0)&&this._isInsideCanvas(w,u)&&this._isInsideCanvas(m,x);
if(o){this.context.beginPath();
this.context.moveTo(w,u);
this.context.lineTo(m,x);
this.context.lineWidth=this._lineWidth;
this.context.lineCap="round";
this.context.stroke();
this._callback()
}};
g.prototype.toString=function(){var m=this.canvas.get(0).toDataURL("image/png");
return m
};
g.prototype.setEnabled=function(m){this._enabled=m
};
g.prototype.clear=function(){var m=this.canvas[0];
this.context.clearRect(0,0,m.width,m.height)
};
var f=(function(){var n=(function(){var o=['<div id="iEBox_container" tabindex="0" role="dialog" aria-label="'+i.localeString("pleaseSignText")+'">','<div id="iEBox_panel">','<div  id = "iEBox_Cancel" class="iEBox_button" tabindex="0" role="button" aria-label="'+i.localeString("cancel")+'" title="'+i.localeString("cancel")+'" ></div>',"</div>",'<div id="iEBox_content">','<div id="iEBox_canvases" align=center>','<div style="display:inline-block;">','<canvas  id="iEBox_canvas" style="margin:0px;border-bottom:0px;" width="696" height="390" ></canvas>','<fieldset id="iEBox_caption"><legend align="center">'+i.localeString("pleaseSignText")+"</legend></fieldset>","</div>",'<canvas id="iEBox_geoCanvasRight" width="0" height="0" ></canvas>','<div><canvas id="iEBox_geoCanvasBottom" width="0" height="0" ></canvas></div>',"</div>","<div>",'<div id="iEBox_Brush" class="iEBox_button" tabindex="0"  role="button" aria-label="'+i.localeString("brushes")+'"  title="'+i.localeString("brushes")+'"></div>','<div id="iEBox_Clear" class="iEBox_button" tabindex="0"  role="button" aria-label="'+i.localeString("clear")+'"  title="'+i.localeString("clear")+'" ></div>','<div id="iEBox_Geo" class="iEBox_button" tabindex="0"  role="button" aria-label="'+i.localeString("geolocation")+'"  title="'+i.localeString("geolocation")+'" ></div>','<div id="iEBox_title"></div>','<div id="iEBox_Ok" class="iEBox_button" tabindex="0"  role="button" aria-label="'+i.localeString("ok")+'"  title="'+i.localeString("ok")+'" ></div>',"</div>","</div>",'<div id="iEBox_moveframe" ></div>','<div id="iEBox_brushList" ></div>',"</div>"].join("");
return function(){return o
}
});
var m={verticalOffset:0,horizontalOffset:0,repositionOnResize:true,overlayOpacity:0.75,overlayColor:"#CCCCCC",draggable:true,_brushes:[2,3,4,5,6,7,8,9,10],_buttonsEnabled:{},_isOpen:false,show:function(o,p){this._show(p);
this._buttonsEnabled={Geo:true,Clear:true,Ok:true,Cancel:true,Brush:true}
},setEnabled:function(p,o){if(this._buttonsEnabled[p]!=o){this._buttonsEnabled[p]=o;
if(o){h("#iEBox_"+p).empty('<div style="background:white;width:100%;height:100%;opacity:0.75;"></div>').removeClass("disable_button")
}else{h("#iEBox_"+p).append('<div style="background:white;width:100%;height:100%;opacity:0.75;"></div>').addClass("disable_button")
}}},enableButtons:function(p){for(var o in p){this.setEnabled(o,p[o])
}},toggleBrushList:function(q){var p=this;
if(h("#iEBox_brushList").css("display")!="none"){h("#iEBox_brushList").css({display:"none"});
return
}var o=document.onselectstart;
document.onselectstart=function(){return false
};
h("#iEBox_brushList").css({display:"block",visibility:"hidden"});
h("#iEBox_brushList").offset(h("#iEBox_Brush").offset());
h("#iEBox_brushList").offset({top:h("#iEBox_Brush").offset().top-h("#iEBox_brushList").height()});
h("#iEBox_brushList").css({display:"block",visibility:"visible"});
h("#iEBox_brushList").one("mouseleave",function(r){h("#iEBox_brushList").css({display:"none"});
document.onselectstart=o
})
},_attachCallbacks:function(p){var o=this;
_.each("Cancel-Clear-Geo-Ok-Brush".split("-"),function(r,q){h("#iEBox_"+r).click(function(s){if(o._buttonsEnabled[r]){s.stopPropagation();
p(r)
}});
h("#iEBox_"+r).keydown(function(s){if(o._buttonsEnabled[r]&&(s.keyCode==l||s.charCode==l||s.which==l)){s.stopPropagation();
p(r)
}})
});
_.each(h("#iEBox_brushList").children(),function(r,q){h(r).on(c.POINTER_UP,function(s){p("BrushSelect",o._brushes[q]);
h("#iEBox_brushList").css({display:"none"})
});
h(r).on(c.POINTER_DOWN,function(s){s.preventDefault()
})
});
h("#iEBox_container").keydown(function(q){if((q.keyCode==k||q.charCode==k||q.which==k)){q.stopPropagation();
q.preventDefault();
p("Cancel")
}});
if(this.draggable){this._makeDraggable(c.TOUCH_ENABLED)
}},_makeDraggable:function(p){var u=false;
var r=this;
var q;
var o;
var s;
var t;
var v;
h("#iEBox_panel").on(c.POINTER_DOWN,function(x){if(c.getTouches(x).length<2){if(h(x.target).is("#iEBox_panel")){h("body").on(c.POINTER_MOVE,t=function(B){if(c.getTouches(B).length<2&&u){B.preventDefault();
var y=c.getTouchEvent(B);
var A=y.pageX-q;
var z=y.pageY-o;
h("#iEBox_moveframe").offset({top:s.top+z,left:s.left+A})
}});
h("body").on(c.POINTER_UP,v=function(B){if(u){var y=h("#iEBox_moveframe").offset();
var A=h(window).scrollTop();
var z=A+h(window).height();
if(y.top-A<1){y.top=A
}if(y.top-z+h("#iEBox_panel").height()>0){y.top=z-h("#iEBox_panel").height()
}h("#iEBox_container").offset(y);
h("#iEBox_moveframe").css({display:"none"}).offset(y);
u=false;
h("body").off(c.POINTER_MOVE,t);
h("body").off(c.POINTER_UP,v)
}});
var w=c.getTouchEvent(x);
u=true;
q=w.pageX;
o=w.pageY;
s=h("#iEBox_container").offset();
h("#iEBox_moveframe").css({display:"block"});
h("#iEBox_moveframe").offset(s);
h("#iEBox_moveframe").css("width",h("#iEBox_container").css("width"));
h("#iEBox_moveframe").css("height",h("#iEBox_container").css("height"))
}}})
},_createBrushes:function(){var o=this;
_.each(this._brushes,function(t,p){var s=document.createElement("DIV");
var r=document.createElement("CANVAS");
var q=r.getContext("2d");
r.style.border="1px solid #AAAAAA";
r.width=c.TOUCH_ENABLED?200:100;
r.height=c.TOUCH_ENABLED?40:20;
q.lineWidth=t;
q.beginPath();
q.moveTo(10,r.height/2);
q.lineTo(r.width-10,r.height/2);
q.stroke();
s.appendChild(r);
h("#iEBox_brushList").append(s)
})
},getIsOpen:function(){return m._isOpen
},setIsOpen:function(o){m._isOpen=o
},_show:function(u){m.hide();
m._overlay("show");
h("BODY").append(n());
m.setIsOpen(true);
h("#iEBox_container").focus();
m._createBrushes();
m._reposition();
var q=h("#iEBox_container");
var t=h("#iEBox_canvas");
var s=h("#iEBox_container").outerWidth(true);
var o=h("#iEBox_container").outerHeight(true);
var r=t[0].width;
var p=t[0].height;
m.canvas_spacing={x:s-r,y:o-p};
m._maintainPosition(true);
m._attachCallbacks(u)
},hide:function(){h("#iEBox_container").remove();
this._overlay("hide");
m.setIsOpen(false);
this._maintainPosition(false)
},_overlayResize:function(o){if(h("#iEBox_overlay").height()!=h(document).height()){h("#iEBox_overlay").height(h(document).height())
}},_overlay:function(o){switch(o){case"show":this._overlay("hide");
h("BODY").append('<div id="iEBox_overlay"></div>');
h("#iEBox_overlay").css({position:"fixed",zIndex:99997,top:"0px",left:"0px",width:"100%",height:h(document).height(),background:this.overlayColor,opacity:this.overlayOpacity});
h(document).on("scroll",this._overlayResize);
break;
case"hide":h("#iEBox_overlay").remove();
h(document).off("scroll",this._overlayResize);
break
}},_resize:function(){var w=h(window).width();
var x=h(window).height();
var t=h("#iEBox_canvas")[0];
var q=h("#iEBox_geoCanvasBottom")[0];
var o=h("#iEBox_geoCanvasRight")[0];
var v=t.width+o.width;
var A=t.height+q.height;
var z=v+m.canvas_spacing.x-w;
if(z<0){z=0
}var u=A+m.canvas_spacing.y-x;
if(u<0){u=0
}var s,y;
if(z>0||u>0){if(u*v>A*z){s=A-u;
y=(s*v)/A
}else{y=v-z;
s=(y*A)/v
}var p=(y*t.width)/v;
var r=(s*t.height)/A;
t.style.width=p+"px";
t.style.height=r+"px";
q.style.width=p+"px";
q.style.height=(s-r)+"px";
o.style.width=(y-p)+"px";
o.style.height=r+"px";
h("#iEBox_caption").width(Math.floor(p))
}else{t.style.width=t.width+"px";
t.style.height=t.height+"px";
q.style.width=q.width+"px";
q.style.height=q.height+"px";
o.style.width=o.width+"px";
o.style.height=o.height+"px";
h("#iEBox_caption").width(t.width)
}},_reposition:function(){var p=((h(window).height()*(1/e.ut.XfaUtil.prototype.formScaleFactor)/2)-(h("#iEBox_container").outerHeight()/2))+m.verticalOffset;
var o=((h(window).width()*(1/e.ut.XfaUtil.prototype.formScaleFactor)/2)-(h("#iEBox_container").outerWidth()/2))+m.horizontalOffset;
if(p<0){p=0
}if(o<0){o=0
}h("#iEBox_container").css({top:p+h(window).scrollTop()*(1/e.ut.XfaUtil.prototype.formScaleFactor)+"px",left:o+h(window).scrollLeft()*(1/e.ut.XfaUtil.prototype.formScaleFactor)+"px"});
h("#iEBox_container").focus();
h("#iEBox_overlay").height(h(document).height())
},_maintainDialog:function(){m._resize();
m._reposition()
},_maintainPosition:function(o){if(m.repositionOnResize){switch(o){case true:h(window).on("orientationchange",m._maintainDialog);
break;
case false:h(window).off("orientationchange",m._maintainDialog);
break
}}}};
return m
})();
function d(){}d.prototype={init:function(n,m){this._successHandler=n;
this._errorHandler=m;
this._active=true;
return this
},_handleSuccess:function(m){this._successHandler(m)
},_handleError:function(m){this._errorHandler(m)
},query:function(){_that=this;
navigator.geolocation.getCurrentPosition(function(m){if(_that._active){_that._handleSuccess(m)
}_that._active=false
},function(m){if(_that._active){_that._handleError(m)
}_that._active=false
},{timeout:10000})
},cancel:function(){_that._active=false
}};
var j={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(o){var m="";
var v,t,r,u,s,q,p;
var n=0;
while(n<o.length){v=o.charCodeAt(n++);
t=o.charCodeAt(n++);
r=o.charCodeAt(n++);
u=v>>2;
s=((v&3)<<4)|(t>>4);
q=((t&15)<<2)|(r>>6);
p=r&63;
if(isNaN(t)){q=p=64
}else{if(isNaN(r)){p=64
}}m=m+this._keyStr.charAt(u)+this._keyStr.charAt(s)+this._keyStr.charAt(q)+this._keyStr.charAt(p)
}return m
},decode:function(o){var m="";
var v,t,r;
var u,s,q,p;
var n=0;
o=o.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(n<o.length){u=this._keyStr.indexOf(o.charAt(n++));
s=this._keyStr.indexOf(o.charAt(n++));
q=this._keyStr.indexOf(o.charAt(n++));
p=this._keyStr.indexOf(o.charAt(n++));
v=(u<<2)|(s>>4);
t=((s&15)<<4)|(q>>2);
r=((q&3)<<6)|p;
m=m+String.fromCharCode(v);
if(q!=64){m=m+String.fromCharCode(t)
}if(p!=64){m=m+String.fromCharCode(r)
}}return m
}};
var a=(function(){var m={_LC_Scribble_MetaDataKey:"LC_SCIBBLE_METADATA",_isPng:function(n){return n&&n.replace(/\s+/g,"").indexOf("iVBORw0KGgo")==0
},_update_crc:function(p,o){var r=p;
var q;
for(q=0;
q<o.length;
q++){r=this._XOR(m._crc_table[(this._XOR(r,o.charCodeAt(q))&255)>>>0],(r>>>8))
}return r
},_XOR:function(o,n){return(o^n)>>>0
},_U32Int2Str:function(o){return String.fromCharCode((o>>>24)&255)+String.fromCharCode((o>>>16)&255)+String.fromCharCode((o>>>8)&255)+String.fromCharCode(o>>>0&255)
},_init_crc_table:function(){var q=0;
var p,o;
m._crc_table=[];
for(p=0;
p<256;
p++){q=p;
for(o=0;
o<8;
o++){if(((q&1)>>>0)>0){q=m._XOR(3988292384,(q>>>1))
}else{q=q>>>1
}}m._crc_table[p]=q
}},_CRC:function(n){if(!this._crc_table){this._init_crc_table()
}return this._XOR(this._update_crc(4294967295,n),4294967295)
},_prepareTextChunk:function(p,r){var o=p.length;
var s=m._U32Int2Str(o);
var n="tEXt";
var q=m._U32Int2Str(m._CRC(n+p));
return s+n+p+q
},_start:function(n){m._startTime=new Date().getTime();
m._startFun=n
},_end:function(){var n="Time "+m._startFun+": "+(new Date().getTime()-m._startTime)
},_readU32Int:function(n){var p=0;
var o=n.d;
p=((o.charCodeAt(n.p++)<<24)|(o.charCodeAt(n.p++)<<16)|(o.charCodeAt(n.p++)<<8)|(o.charCodeAt(n.p++)))>>>0;
return p
},_readChunkType:function(n){var p=n.d;
var o=p[n.p++]+p[n.p++]+p[n.p++]+p[n.p++];
return o
},_makeReadOnly:function(s){m._start("_makeReadOnly");
var r=m._atob(s.replace(/\s+/g,""));
var n={p:0,d:r};
n.p+=8;
var q=m._readU32Int(n);
m._readChunkType(n);
n.p+=q;
m._readU32Int(n);
var p=m._prepareTextChunk(m._LC_Scribble_MetaDataKey+String.fromCharCode(0)+"true");
var t=n.d.substring(0,n.p)+p+n.d.substring(n.p);
var o=m._btoa(t);
m._end();
return o
},_atob:function(n){if(window.atob){return atob(n)
}return j.decode(n)
},_btoa:function(n){if(window.btoa){return btoa(n)
}return j.encode(n)
},_isReadOnly:function(r){m._start("_isReadOnly");
if(m._isPng(r)){var q=m._LC_Scribble_MetaDataKey+String.fromCharCode(0)+"true";
var p=m._atob(r.replace(/\s+/g,""));
var n={p:0,d:p};
n.p+=8;
while(n.p<n.d.length){var o=m._readU32Int(n);
var s=m._readChunkType(n);
if(s=="tEXt"){if(n.d.indexOf(q,n.p)==n.p){m._end();
return true
}}n.p+=o;
m._readU32Int(n)
}}m._end();
return false
}};
return m
})();
h.widget("xfaWidget.ScribbleImageField",h.xfaWidget.imageField,{_widgetName:"ScribbleImageField",_geoLocQuery:null,_emptyImageVal:null,_extraInfo:null,_defaultStatus:"&nbsp;",_enforceGeoLoc:!!navigator.userAgent.match(/iPad/i),_sigCanvasWidth:696,_sigCanvasHeight:390,_geoCanvId:null,_geoLocAtBottom:false,_geoCanvasHeight:100,_geoCanvasWidth:696,_is_readonly:false,options:{tabIndex:0,role:"img"},getOptionsMap:function(){var m=h.xfaWidget.defaultWidget.prototype.getOptionsMap.apply(this,arguments);
return h.extend({},m,{displayValue:function(o){if(this.options.commitProperty){if(!o){this._displayValue(this._extractData(this._createEmptyImageData()));
this.$userControl.addClass("emptyScribble");
this._is_readonly=false
}else{this.$userControl.removeClass("emptyScribble");
if(a._isPng(o)){var n="data:image/png;base64,"+this.options.value
}else{var n="data:image/*;base64,"+this.options.value
}this._setValue(n)
}}}})
},getEventMap:function(){var m=h.xfaWidget.defaultWidget.prototype.getEventMap.apply(this,arguments);
return h.extend({},m,{scribblefocus:e.ut.XfaUtil.prototype.XFA_ENTER_EVENT,click:null,scribbleclick:e.ut.XfaUtil.prototype.XFA_CLICK_EVENT,change:null,scribblechange:e.ut.XfaUtil.prototype.XFA_CHANGE_EVENT,blur:null,scribbleclose:e.ut.XfaUtil.prototype.XFA_EXIT_EVENT})
},_setUpCanvas:function(){var m=this.element.children("img");
var o=parseInt(m.attr("width"),10);
var n=parseInt(m.attr("height"),10);
var v=n/o;
var t=640;
var u=480;
var p;
var r;
var s=250;
var q=84;
p=t;
r=t*v;
if(r>u){r=u;
p=u/v
}if(v>=1){this._geoCanvId="iEBox_geoCanvasBottom";
this._geoLocAtBottom=true;
this._geoCanvasWidth=p;
this._geoCanvasHeight=Math.min(q,r/3);
this._sigCanvasWidth=p;
this._sigCanvasHeight=r-(this._enforceGeoLoc?this._geoCanvasHeight:0)
}else{this._geoCanvId="iEBox_geoCanvasRight";
this._geoLocAtBottom=false;
this._geoCanvasHeight=r;
this._geoCanvasWidth=Math.min(s,p/3);
this._sigCanvasHeight=r;
this._sigCanvasWidth=p-(this._enforceGeoLoc?this._geoCanvasWidth:0)
}},render:function(){var m=this.options.geoLocMandatoryOnIpad;
if(typeof(m)!="undefined"){this._enforceGeoLoc=this._enforceGeoLoc&&(/^(true|1)$/i).test(h.trim(m))
}this._wgtId="wid"+~~(Math.random()*2000)+"_"+new Date().getTime();
var n=h.xfaWidget.imageField.prototype.render.apply(this,arguments);
if(this.options.value||this.options.value!=this._emptyImageVal){this._is_readonly=!!a._isReadOnly(this.options.value)
}if(this._is_readonly){n.after("<div id='"+this._wgtId+"' class='sc_popUpMenu'></div>")
}else{n.after("<div id='"+this._wgtId+"' style='display:none;' class='sc_popUpMenu'></div>")
}this._setUpCanvas();
return n
},click:function(){var m,o;
this.focus();
var n=this.element.length?this.element[0]:this.element;
if(this.options.access!="open"){return
}if(c.POINTER_ENABLED||c.TOUCH_ENABLED){m=document.createEvent(c.POINTER_EVENT);
o=document.createEvent(c.POINTER_EVENT);
m.initEvent(c.POINTER_DOWN,true,true);
o.initEvent(c.POINTER_UP,true,true);
n.dispatchEvent(m);
n.dispatchEvent(o)
}else{this.$userControl.triggerHandler("click")
}},_attachEventHandlers:function(m){if(c.POINTER_ENABLED||c.TOUCH_ENABLED){this._attachTouchEventHandlers(m)
}else{this._attachMouseEventHandlers(m)
}m.keydown(h.proxy(this._handleKeyDown,this))
},_attachEventHandlerForCrossIcon:function(n){var m=this;
n.mouseenter(function(o){if(m.options.access!="open"){return
}o.stopPropagation();
if(m._is_readonly){h("#"+m._wgtId).css({display:"block"});
var p;
h("body").on("mousemove",p=function(q){if(q.target!=h("#"+m._wgtId)[0]&&q.target!=m.$userControl[0]){h("#"+m._wgtId).css({display:"none"});
h("body").off("mousemove",p)
}})
}});
setTimeout(function(){h("#"+m._wgtId).click(h.proxy(m._onCrossClick,m))
},50)
},_attachTouchEventHandlers:function(p){var o,m=this;
var n=this.element.length?this.element[0]:this.element;
n.addEventListener(c.POINTER_DOWN,function(q){q.preventDefault();
o=setTimeout(function(){o=0;
m._onCrossClick(q)
},1000)
});
n.addEventListener(c.POINTER_UP,function(q){q.preventDefault();
if(o){clearTimeout(o);
m._onImageClick(q)
}});
if(c.POINTER_ENABLED){this._attachEventHandlerForCrossIcon(p);
setTimeout(function(){h("#"+m._wgtId).on(c.POINTER_UP,function(q){q.stopPropagation()
})
},50)
}},_attachMouseEventHandlers:function(o){var n=0,m=this,p=0;
o.dblclick(function(q){if(m.options.access!="open"){return
}q.preventDefault();
q.stopPropagation();
if(n.val){clearTimeout(n);
n=0
}m._onCrossClick(q)
}).click(function(q){m.$userControl.trigger("scribbleclick",q);
if(m.options.access!="open"){return
}q.preventDefault();
q.stopPropagation();
if(n){clearTimeout(n);
n=0
}else{n=setTimeout(function(){n=0;
m._onImageClick(q)
},500)
}});
this._attachEventHandlerForCrossIcon(o)
},_onCrossClick:function(m){if(!this._is_readonly){return
}this.$userControl.trigger("scribblefocus",m);
this.$userControl.trigger("scribbleclick",m);
m.stopPropagation();
h.alertBox.yesNo(null,this.localeStrings().clearSignatureConfirm,this.localeStrings().clearSignature,h.proxy(this._removeSigConfirmationHandler,this))
},_removeSigConfirmationHandler:function(m){if(m){this._saveValue(this._emptyImageVal);
this._displayValue(this._extractData(this._createEmptyImageData()));
this.$userControl.addClass("emptyScribble").trigger("scribbleclose",{});
this._is_readonly=false
}},_createEmptyImageData:function(){if(!this._emptyImageData){var n=document.createElement("canvas");
n.style.width=this._sigCanvasWidth+"px";
n.style.height=this._sigCanvasHeight+"px";
n.width=this._sigCanvasWidth;
n.height=this._sigCanvasHeight;
var m=n.getContext("2d");
m.fillStyle="#ffffff";
m.clearRect(0,0,this._sigCanvasWidth,this._sigCanvasHeight);
this._emptyImageData=n.toDataURL("image/png")
}return this._emptyImageData
},getCommitValue:function(){return this.options.value
},_saveValue:function(m){this.options.value=m;
this.$userControl.trigger("scribblechange")
},_displayValue:function(n){if(this.options.commitProperty){if(n){var m="data:image/png;base64,"+n;
this._setValue(m)
}}else{this.logger().debug("xfaView","[DefaultWidget._update], User Control or Commit Property is null")
}},_doOk:function(){var r=document.createElement("CANVAS");
var n=h("#"+this._geoCanvId)[0];
var q=h("#iEBox_canvas")[0];
var m=r.getContext("2d");
if(n.width>0&&n.height>0){if(this._geoLocAtBottom){r.width=q.width;
r.height=q.height+n.height;
m.drawImage(q,0,0);
m.drawImage(n,0,q.height)
}else{r.width=q.width+n.width;
r.height=q.height;
m.drawImage(q,0,0);
m.drawImage(n,q.width,0)
}}else{r.width=q.width;
r.height=q.height;
m.drawImage(q,0,0)
}f.hide();
var p=r.toDataURL("image/png");
var s,o;
if((s=this._extractData(p))){s=a._makeReadOnly(s);
this._saveValue(s);
this._is_readonly=true
}this._geoLocQuery&&this._geoLocQuery.cancel();
this.$userControl.trigger("scribbleclose")
},_handleOk:function(){if(this._enforceGeoLoc){this._geoLocQuery=new d().init(h.proxy(function(m){this._geoQuerySuccessHandler(m);
this._doOk()
},this),h.proxy(this._geoQueryErrorHandler,this));
this._geoLocQuery.query();
this._showMessage(this.localeStrings().fetchGeoLocation)
}else{this._doOk()
}},_handleCancel:function(){f.hide();
this._geoLocQuery&&this._geoLocQuery.cancel();
this.$userControl.trigger("scribbleclose")
},_handleClear:function(){this.myScribbleHandle.setEnabled(true);
this._is_readonly=false;
this._makeReadOnly(this._is_readonly);
h("#iEBox_canvas")[0].width=this._sigCanvasWidth;
h("#iEBox_caption").width(this._sigCanvasWidth);
h("#iEBox_canvas")[0].height=this._sigCanvasHeight;
var m=h("#"+this._geoCanvId)[0];
f.enableButtons({Ok:false,Clear:false});
m.width=0;
m.height=0;
f._resize();
this._geoLocQuery&&this._geoLocQuery.cancel()
},_makeReadOnly:function(m){f.enableButtons({Ok:false,Clear:false,Geo:!m,Brush:!m});
if(m){h("#iEBox_canvas").css({border:"1px solid gray"});
h("#iEBox_caption").css({display:"none"})
}this._defaultStatus="&nbsp;";
this._showMessage(this._defaultStatus)
},_showMessage:function(n){var m=this;
if(this._msgTimeout){clearTimeout(this._msgTimeout);
this._msgTimeout=0
}h("#iEBox_title").replaceWith('<div id="iEBox_title">'+n+"</div>");
this._msgTimeout=window.setTimeout(function(){h("#iEBox_title").replaceWith('<div id="iEBox_title">'+m._defaultStatus+"</div>")
},15000)
},_geoQueryErrorHandler:function(m){this._showMessage(this.localeStrings().errorFetchGeoLocation)
},_getLogMessage:function(m){return this.logMsgs()[m]||m
},_handleGeo:function(){if(navigator.geolocation){this._geoLocQuery=new d().init(h.proxy(this._geoQuerySuccessHandler,this),h.proxy(this._geoQueryErrorHandler,this));
this._geoLocQuery.query();
this._showMessage(this.localeStrings().fetchGeoLocation)
}else{this.logger().debug("xfaView",this._getLogMessage("ALC-FRM-901-011"))
}},_handleBrushSelect:function(m){if(this.myScribbleHandle&&!this._is_readonly){this.myScribbleHandle.setLineWidth(m)
}},_handleBrush:function(m){f.toggleBrushList(m)
},_handleKeyDown:function(m){if(m.keyCode==l||m.charCode==l||m.which==l){m.preventDefault();
this._onImageClick(m)
}else{if(m.keyCode==b||m.charCode==b||m.which==b){this._onCrossClick(m)
}}},_dialogCallback:function(n,m){switch(n){case"Ok":this._handleOk();
break;
case"Cancel":this._handleCancel();
break;
case"Clear":this._handleClear();
break;
case"Geo":this._handleGeo();
break;
case"BrushSelect":this._handleBrushSelect(m);
break;
case"Brush":this._handleBrush(m);
break
}},_geoQuerySuccessHandler:function(m){this._renderPosition(m)
},_fitGeoLocText:function(p,m,n,t,r,s){var u=12;
t.font="bold "+u+"pt Arial";
var o=Math.max(t.measureText(p).width,t.measureText(m).width,t.measureText(n).width);
var q=t.measureText("m").width*1.5;
while((o>r||3*q>s)&&u>1){u--;
t.font="bold "+u+"pt Arial";
o=Math.max(t.measureText(p).width,t.measureText(m).width,t.measureText(n).width);
q=t.measureText("m").width*1.5
}return{width:o,lineHeight:q,fontSize:u}
},_renderPosition:function(u){if(u&&u.coords){this._showMessage("&nbsp;");
var p=this.localeStrings().latitude+": "+u.coords.latitude;
var m=this.localeStrings().longitude+": "+u.coords.longitude;
var z=new Date();
var w=(z.getTimezoneOffset()/60*-1);
var n=this.localeStrings().time+": "+(z.getMonth()+1)+"/"+z.getDate()+"/"+z.getFullYear()+" "+z.getHours()+":"+z.getMinutes()+":"+z.getSeconds()+((w>0)?" +":" ")+(w);
var r=h("#"+this._geoCanvId)[0];
var y=h("#iEBox_canvas")[0];
var t=document.createElement("canvas");
if(r){var x=r.getContext("2d");
x.font="bold 12pt Arial";
r.width=this._geoCanvasWidth;
r.height=this._geoCanvasHeight;
var v=this._fitGeoLocText(p,m,n,x,r.width,r.height);
if(!this._enforceGeoLoc){if(this._geoLocAtBottom){t.width=this._sigCanvasWidth;
t.height=this._sigCanvasHeight-r.height
}else{t.width=this._sigCanvasWidth-r.width;
t.height=this._sigCanvasHeight
}t.getContext("2d").drawImage(y,0,0,t.width,t.height);
y.width=t.width;
y.height=t.height;
y.getContext("2d").drawImage(t,0,0);
h("#iEBox_caption").width(y.width);
f.enableButtons({Clear:true})
}var s=v.width;
var q=v.lineHeight;
var o=2;
x.fillStyle="#555555";
x.font="bold "+v.fontSize+"pt Arial";
x.fillText(p,0,r.height-2*q-o);
x.fillText(m,0,r.height-q-o);
x.fillText(n,0,r.height-o);
f._resize()
}}},_scribbleCallback:function(){f.enableButtons({Clear:true,Ok:true})
},_onImageClick:function(){if(!f.getIsOpen()){var m=this;
f.show("&nbsp;",h.proxy(this._dialogCallback,this));
if(!this._enforceGeoLoc){h("#iEBox_Geo").css({display:"inline-block"})
}var n=new Image();
n.onload=function(){m.myScribbleHandle=new g("iEBox_canvas",n,n.width,n.height,h.proxy(m._scribbleCallback,m));
m.myScribbleHandle.setEnabled(!m._is_readonly);
h("#iEBox_caption").width(n.width);
h("#iEBox_container").css({display:"table"});
f._resize();
f._reposition()
};
if(!this.options.value||this.options.value==this._emptyImageVal){this._is_readonly=false;
this.$userControl.addClass("emptyScribble");
n.src=this._createEmptyImageData()
}else{this.$userControl.removeClass("emptyScribble");
if(a._isPng(this.options.value)){this._is_readonly=!!a._isReadOnly(this.options.value);
n.src="data:image/png;base64,"+this.options.value
}else{n.src="data:image/*;base64,"+this.options.value
}}this._makeReadOnly(this._is_readonly)
}},_extractData:function(n){var m;
if(n!=null&&n.length>0&&n.indexOf("data:")==0){if((m=n.indexOf(","))>0){return n.substr(m+1)
}}},_setValue:function(m){this.$userControl.attr(this.options.commitProperty,m);
if(this._dummyImg){this._dummyImg.setAttribute(this.options.commitProperty,m)
}}});
h(function(){h("body").bind("touchstart",function(m){})
})
})(jQuery,xfalib);