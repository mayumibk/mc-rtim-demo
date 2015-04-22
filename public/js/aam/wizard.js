var ftue_width = 730;
var ftue_height = 600;

var ftue_scheme = ('https:' == document.location.protocol ? 'https://' : 'http://');

window.addEventListener('message', function(e){
    if(e.origin.match(/omniture\.com/) || e.origin.match(/adobemc\.com/)) {
        var payload = eval('(' + e.data + ')');
        handleMessage(payload);
    }
});

function handleMessage(evt) {
    if(evt.type == 'wizardClose') {
        var wizContainer = document.getElementById('linking-wizard-container');
        wizContainer.parentNode.removeChild(wizContainer);
        removeLinkUsersButton(evt);
    }
    if(evt.type == 'wizImsHeight') {
        var origHeight = 313;
        var change = evt.value - origHeight;
        if(change > 0) {
            var iframe = document.getElementById('linking-wizard-iframe');
            iframe.style.height = "672px";
        }
    }
}

function startWizard() {
    var redirectUri = encodeURIComponent(ftue_scheme + 'ftue.adobemc.com/p/ftue_wizard/1.0/?token=4a8632c4904b5160945bfd90f1cd05e1ce3e7467&callback=removeLinkUsersButton&redirect_uri=' + encodeURIComponent(location.href));
    var loginUrl = 'https://ims-na1.adobelogin.com/ims/authorize/v1?client_id=Tim1&locale=&redirect_uri=' + redirectUri ;
    window.open(loginUrl, '_blank');
}

function embedButton() {
    var button = document.createElement('div');
    var toolTip = document.createElement('div');
    var arrow   = document.createElement('div');

    button.id                     = "linking-wizard-begin";
    button.textContent            = "Join Marketing Cloud";
    button.style.position         = 'absolute';
    button.style.top              = '20px';
    button.style.right            = '20px';
    button.style['border-radius'] = '3px';
    button.style.borderRadius     = '3px';
    button.style['font-family']   = "AdobeClean, Lucida, LucidaSans, sans-serif";
    button.style['font-size']     = '14px';
    button.style.fontFamily       = "AdobeClean, Lucida, LucidaSans, sans-serif";
    button.style.fontSize         = '14px';
    button.style.color            = 'white';
    button.style.padding          = '5px 9px';
    button.style.border           = 'none';
    button.style.background       = '#2d84d3';
    button.style.outline          = "none";
    button.onmouseover            = function(){this.style.background = "#74b4f8"; toolTip.style.display = "inline";};
    button.onmouseout             = function(){this.style.background = "#2d84d3"; toolTip.style.display = "none";};
    button.onclick                = function(){startWizard();toolTip.style.display = "none";}

    button.appendChild(toolTip);

    arrow.style.width        = '0';
    arrow.style.height       = '0';
    arrow.style.borderLeft   = arrow.style['border-left']   = '5px solid transparent';
    arrow.style.borderRight  = arrow.style['border-right']  = '5px solid transparent';
    arrow.style.borderBottom = arrow.style['border-bottom'] = '5px solid #74b4f8';
    arrow.style.position     = "absolute";
    arrow.style.top          = '-5px';
    arrow.style.left         = '97px';

    toolTip.style.position   = 'absolute';
    toolTip.style.color      = '#333';
    toolTip.style.fontSize   = toolTip.style['font-size'] = '12px';
    toolTip.style.textAlign  = toolTip.style['text-align'] = "left";
    toolTip.style.width      = '180px';
    toolTip.style.padding    = '10px';
    toolTip.style.background = '#74b4f8';
    toolTip.style.top        = '35px';
    toolTip.style.left       = '-20px';
    toolTip.style.border     = '1px solid #333';
    toolTip.innerHTML        = "Link your account to the Adobe Marketing Cloud so you can access all your Adobe solutions with one login.";
    toolTip.style.display    = "none";

    toolTip.appendChild(arrow);

    document.body.appendChild(button);
}

embedButton();