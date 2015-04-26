"use strict";
(function($){
	window.adobe = window.adobe || {};
	window.adobe.analytics = window.adobe.analytics || {};

	adobe.analytics.releaseInfoModal = null;
	adobe.analytics.releaseInfoModalVersion = "default";
	adobe.analytics.releaseInfoModalShowOnLoad = false;

	$(document).ready(function(){
		adobe.analytics.releaseInfoModal = new CUI.Modal({ element: "#releaseInfoModal",visible: false });

		adobe.analytics.releaseInfoModal.on('hide', function(event) {
			adobe.analytics.disableReleaseInfoModal();
		});

		adobe.analytics.releaseInfoModal.on('show', function(event) {
			var windowMaxHeight = $(window).height() - 20; //Always leave at least a little buffer for the window
			if (windowMaxHeight < adobe.analytics.releaseInfoModal.$element.height()){
				adobe.analytics.releaseInfoModal.$element.find('.releaseinfo-Modal-Body').height(windowMaxHeight - 105); //105 is approximately the height of the header and footer
			}

			var windowMaxWidth = $(window).width() - 20; //Always leave at least a little buffer for the window
			if (windowMaxWidth < adobe.analytics.releaseInfoModal.$element.width()){
				adobe.analytics.releaseInfoModal.$element.find('.releaseinfo-Modal-Body').width(windowMaxWidth - 15); //15 is approximately the height of the border
			}
		});

		//Allow the mbox to let the modal know it should load even if the mbox loads before the document.ready fires
		if(adobe.analytics.releaseInfoModalShowOnLoad ){
			adobe.analytics.displayReleaseInfoModal();
		}
	});

	adobe.analytics.displayReleaseInfoModal = function() {
		//Only allow the modal to be shown if there is a way to set the persistent attribute that will allow the modal to be hidden in the future
		if(Omniture.user.setPersistentAttribute){
			//Only show the modal if the user hasn't previously hidden this particular version of the release info modal
			if(adobe.analytics.releaseInfoModal && adobe.analytics.releaseInfoModalVersion != OM.Config.releaseInfoModalHideVersion){
				adobe.analytics.releaseInfoModal.show();
				adobe.analytics.trackReleaseInfoModalAction('Release Info Modal Shown');
			}
		}
	}

	adobe.analytics.disableReleaseInfoModal = function (){

		var hideUntilNextRelease = false;

		//If the checkbox is checked then the modal should be hidden until the next release
		var hideCheckbox = $('#releaseInfoModalPermanentHide');
		if(hideCheckbox && hideCheckbox.prop('checked')){
			hideUntilNextRelease = true;
		}

		//Set the version of the release info modal that should be hidden for now
		if(hideUntilNextRelease){
			if(Omniture.user.setPersistentAttribute){
				Omniture.user.setPersistentAttribute("releaseInfoModalHideVersion",adobe.analytics.releaseInfoModalVersion);
				adobe.analytics.trackReleaseInfoModalAction('Release Info Modal Closed Until Next Release');
			}
		}
		else{
			if(Omniture.user.setSessionAttribute){
				Omniture.user.setSessionAttribute("releaseInfoModalHideVersion",adobe.analytics.releaseInfoModalVersion);
				adobe.analytics.trackReleaseInfoModalAction('Release Info Modal Closed');
			}
		}

		//Remove the modal from the DOM since it won't be used anymore
		adobe.analytics.releaseInfoModal.$element.remove();
	};

	adobe.analytics.trackReleaseInfoModalAction = function(customLinkName){
		//If this page has the ability to track data, send an image request to Analytics saying that the modal was viewed
		var obuet = window.obuet;
		if(obuet && obuet.tl){
			obuet.linkTrackVars = "prop1,prop2,prop3,prop4,prop10,prop11,prop13,eVar1,eVar2,eVar3,eVar4,eVar10,eVar11,eVar13";
			obuet.linkTrackEvents = "";
			obuet.tl(this,'o',customLinkName);
		}

		if(s && s.tl){
			s.linkTrackVars = "";
			s.linkTrackEvents = "";
			s.tl(this,'o',customLinkName);
		}
	}
})(jQuery);
