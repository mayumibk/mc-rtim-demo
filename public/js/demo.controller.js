$.each(["show", "toggle", "toggleClass", "addClass", "removeClass"], function(){
    var _oldFn = $.fn[this];
    $.fn[this] = function(){
        var hidden = this.find(":hidden").add(this.filter(":hidden"));
        var result = _oldFn.apply(this, arguments);
        hidden.filter(":visible").each(function(){
            $(this).triggerHandler("show"); //No bubbling
        });
        return result;
    }
});

$(".summary-table-wrap").bind("show", function(){
    alert(this);
});


