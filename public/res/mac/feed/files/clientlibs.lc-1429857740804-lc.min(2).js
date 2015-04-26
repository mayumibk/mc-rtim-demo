$(function(){$(".show-hidden-cards").click(function(){var d=$(this).is(":checked");
tartan.core.showHiddenCards=!d;
tartan.core.refreshCards({force:true})
});
tartan.core.doScroll=true;
$(".foundation-collection-container").scroll(function(){if(tartan.core.doScroll&&$(".foundation-collection-container").scrollTop()+$(".foundation-collection-container").height()>(0.75*$(".foundation-collection-container")[0].scrollHeight)){tartan.core.doScroll=false;
var d={};
d.start=$("article").length;
d.limit=20;
tartan.core.getMoreCards(d)
}});
if(tartan&&tartan.auth){if(tartan.utils){var c=tartan.utils.getCookie("currentTenant");
if(!c){var a=new RegExp("(://)([^.]+)(.)").exec(location.href);
if(a){var b=a[2];
tartan.auth.setCurrentTenantCookie(b)
}}}}});