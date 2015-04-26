_satellite.pushAsyncScript(function(event, target, $variables){
  (function($){

  var items = [];
  var isCoachMarkVisible = false;
  var currentStepNumber = -1;
  var requestedKey = null, skipTutorial = null;

  function init(){

    var $coachMarkDetails = $(".dtm-coachmarks-details");

    // Show coachmarks only if they are enabled
    var enabled = _satellite.getVar("coachmarks_visible");
    if(enabled === "on"){

      var locale = $coachMarkDetails.data("dtmCoachmarklocale") || "en_US";
      if(locale=="en"){
        locale = "en_US";
      }
      var solution = $coachMarkDetails.data("dtmCoachmarksolution") || "mac";

      // Assuming there is only one unique value concept and coachconcept on the page
      var concept = $("[data-dtm-coachmarkConcept]").data("dtmCoachmarkconcept");
      var coachConcept = $("[data-dtm-coachmarkConcept]").data("dtmCoachmarkcoachconcept");

      if(concept && coachConcept){

        var docUrl = "https://marketing.adobe.com/resources/help/";
        docUrl += locale + "/ch/" + solution + "/" + concept + "/" + coachConcept + ".json";

        var localUrl = "/content/mac/default/coachmarks/" + concept + "/" + coachConcept + ".json";

        // Request the Doc Engine
        $.getJSON( docUrl, function(data){
          // Check for invalid json 
          if(isInvalidJSON(data.widget)){
            // Try the Repo if invalid json format
            getCoachMarksDataFromRepository(localUrl);
          }
          else{
            // else show the coachmarks
            processCoachMarksJSON(data);
          }
        }).fail(function(){
          // If request to Doc server fails, Request the local repo path
          getCoachMarksDataFromRepository(localUrl);
        });
      }
    }
  };

  function getCoachMarksDataFromRepository(localUrl){

    $.getJSON(localUrl, function(data){
      // Check for invalid json 
      if(isInvalidJSON(data.widget)){
        console.error("Invalid JSON returned ",data);    
      }
      else{
        // else show the coachmarks
        processCoachMarksJSON(data); 
      }
      
    });  
  }

  // 
  function processCoachMarksJSON(data){
    
    // Create Intro Wizard
    if(data.widget.type === "INTRO"){
      fetchIntroWizardStyles();
      createIntroWizard(data.widget);
    }
  };

  function isInvalidJSON(widgetJSON){  
    if(widgetJSON == null || widgetJSON.items == null || widgetJSON.items.length == 0){
      console.log("invalid json returned");
      return true;
    }
    return false;
  };

  function fetchIntroWizardStyles(){
    var css = '.coachMarkOverlay{top:0;bottom:0;left:0;right:0;position:fixed;z-index:999999;-webkit-transition:all .3s ease-out;-moz-transition:all .3s ease-out;-ms-transition:all .3s ease-out;-o-transition:all .3s ease-out;transition:all .3s ease-out}.coachMarkHighlighter{position:absolute;border:2px solid #fff;z-index:9999998;opacity:.9;box-shadow:0 0 0 2000px rgba(0,0,0,.65),0 0 0 inset;-moz-box-shadow:0 0 0 2000px rgba(0,0,0,.65),0 0 0 inset;-webkit-box-shadow:0 0 0 2000px rgba(0,0,0,.65),0 0 0 inset}.coachMarkHelper{position:absolute;z-index:100000000;background-color:transparent}.coachMarkHelper .coachMarkToolTip{position:relative;color:#fff;width:200px;font-weight:lighter;line-height:18px}.coachMarkToolTip .tooltipHeader{font-size:18px}.coachMarkToolTip .tooltipHeader p{margin-bottom:5px}.coachMarkToolTip .tooltipBody{padding-bottom:8px;font-size:15px}.coachMarkToolTip .tooltipBody p{margin-top:5px;margin-bottom:5px}.coachMarkToolTip .tooltipBody a{color:#fff}.coachMarkToolTip .tooltipActions .skipLink{display:block;padding-top:5px;color:#fff;text-decoration:underline}.coachMarkToolTip .tooltipActions .skipLink.hidden{display:none}.coachMarkElement{z-index:9999999999!important;position:relative;pointer-events:none}',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  };

  function createIntroWizard(widgetJSON){

    items = widgetJSON.items;
    skipTutorial = widgetJSON.skipTutorial;
    // Sort the JSON array according to the stepNumber
    items.sort(function(a,b) { return parseInt(a.stepNumber) - parseInt(b.stepNumber) } );

    if(requestedKey!=null){
      createCoachMarkByKey(requestedKey);
      requestedKey = null;
      // TODO - Update the currentStepNumber by finding out the requested item -- can do outside this function at one place while creating the coachmark
    }
    else{
      // Create the first coach mark in the list 
      createCoachMarkByStepNumber(0);
      currentStepNumber = 0;  
    }
  };

  function executeFunctionByName(functionName, context /*, args */) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(this, args);
  }

  // item is not null
  // options is a configurable javascript object which could contains options that govern creating of coachmarks. One of them being : createSkipLink
  function createCoachMarkContent(item, options){

    var key = item.key;
    var selector = "[data-dtm-coachmarkkey='"+key+"']";
    var $element = $(selector);
    if($element.length > 0 && $element.is(":visible")){

      // Add the OverLay Element
      var $coachMarkOverlay = $("<div />",{
        class : "coachMarkOverlay"
      }).appendTo("body");
      // Stop propagation of the click event
      $coachMarkOverlay.on("click", function(event){
        event.stopPropagation();
      });

      // Add the CoachMark Highlighter
      var $coachMarkHighlighter = $("<div />", {
        class: "coachMarkHighlighter"
      }).appendTo("body");
      // Calculate dimensions 
      var dimension = $element.width() > $element.height() ? $element.width() : $element.height();
      var elementWidth = dimension*2 > 100 ? 100 : dimension*2;
      var elementHeight = dimension*2 > 100 ? 100 : dimension*2;
      var leftOffset = $element.offset().left - elementWidth/4;
      var topOffset = $element.offset().top - elementHeight/4;
      var borderRadius = elementWidth/2;
      // To make sure that the highlighting is going outside the right window
      if(leftOffset + elementWidth > $(window).width()){
        var diff = $(window).width() - leftOffset - elementWidth;
        leftOffset = leftOffset + diff - 7;
      }

      $coachMarkHighlighter.offset({top: topOffset, left: leftOffset});
      $coachMarkHighlighter.width(elementWidth);
      $coachMarkHighlighter.height(elementHeight);
      $coachMarkHighlighter.css("border-radius", borderRadius);

      // Add the CoachMark Helper - contains the Tooltip Container
      var $coachMarkHelper = $("<div />",{
        class: "coachMarkHelper"
      }).appendTo("body");
      // Copy the dimensions from coachMarkHighlighter
      $coachMarkHelper.offset($coachMarkHighlighter.offset());
      $coachMarkHelper.width($coachMarkHighlighter.width());
      $coachMarkHelper.height($coachMarkHighlighter.height());
      $coachMarkHelper.css("border-radius", $coachMarkHighlighter.css("border-radius"));
      // Stop propagation of the click event
      $coachMarkHelper.on("click", function(event){
        event.stopPropagation();
      });

      // Build Tooltip Container
      var $coachMarkToolTipContainer = $("<div />",{
        class : "coachMarkToolTip"
      }).appendTo($coachMarkHelper);
      // Decide location of tooltip container according to item.location
      var offset = "135px";
      if(item.location === "RIGHT"){
        $coachMarkToolTipContainer.css("left", offset);
      }
      else if(item.location === "LEFT"){
        // TODO - Check
        $coachMarkToolTipContainer.css("right", $coachMarkToolTipContainer.width());
      }
      // TODO -- Support Other Top and Bottom Offsets also ??

      if(item.header){
        // Create header
        var $tooltipHeader = $("<div />",{
          class : "tooltipHeader"
        }).appendTo($coachMarkToolTipContainer);
        $tooltipHeader.append("<p>"+item.header.text+"</p>");   
      }
      if(item.body){
        // Create tooltip body
        var $tooltipBody = $("<div />", {
          class : "tooltipBody"
        }).appendTo($coachMarkToolTipContainer);
        // Add items array - can be either of type TEXT or IMAGE
        var bodyItems = item.body.items; 
        for(var j=0; j<bodyItems.length; j++){
          var bodyItem = bodyItems[j];
          if(bodyItem.type === "TEXT"){
            // Create P Element
            var p = $("<p />").appendTo($tooltipBody);
            p.html(bodyItem.content);
          }
          else if(bodyItem.type === "IMAGE"){
            // Create Image Element
            var img = $("<img />", {
                src : bodyItem.content
            }).appendTo($tooltipBody);
          }
          else if(bodyItem.type === "HTML_TEXT"){
            // Append the HTML text
            var p = $("<p />").appendTo($tooltipBody);
            p.html(bodyItem.content);
          }
        }
      }
      // Add Actions - Okay and Skip buttons
      var $actions = $("<div />",{
        class : "tooltipActions"
      }).appendTo($coachMarkToolTipContainer);
      var $okayButton = $("<button />",{
        class : "primary coral-Button coral-Button--primary"
      }).appendTo($actions);
      $okayButton.attr("data-dtm-coachmark-step-number", item.stepNumber);
      $okayButton.html("Okay!");
      $okayButton.click(function(event){
        var stepNumber = $(this).data("dtmCoachmarkStepNumber");
        hideCoachMarks(stepNumber, $element);
        stepNumber = parseInt(stepNumber) + 1; 
        currentStepNumber = stepNumber;
        createCoachMarkByStepNumber(stepNumber);
      });
      
      var $skipLink = $("<a />",{
        class: "skipLink"
      }).appendTo($actions);
      $skipLink.html("Skip Tutorial");
      $skipLink.click(function(event){
        var stepNumber = $(this).data("dtmCoachmarkStepNumber");
        handleSkipTutorial(stepNumber, $element);     
      });
      
      if(options!=null && options.createSkipLink!=null && options.createSkipLink === false){
        $skipLink.addClass("hidden");
      }

      // Add the coachMarkElement to the Element which needs to be highlighted. TODO : Add color: #eee to all the children nodes ?
      $element.addClass("coachMarkElement");
      isCoachMarkVisible = true;
    }
  }

  function handleSkipTutorial(stepNumber, $element){

    // Disable the coachmarks until the user checks them again
    if(_satellite){
      _satellite.setCookie("coachmarks_visible", "off");
    }
    hideCoachMarks(stepNumber, $element);
    var options = {"createSkipLink": false};

    if(skipTutorial){
      if(skipTutorial.alreadyPresent){
        // create coachmark at step number skipTutorial.stepNumber
        createCoachMarkByStepNumber(skipTutorial.stepNumber, options);
      }
      else{
        // Create Coachmark as in JSON 
        var item = skipTutorial.item;
        createCoachMarkForItem(item, options);
      }
    }
  }

  function createCoachMarkByKey(itemKey){
    if(itemKey){
      var keyItem = items.filter(function(obj){
          return obj.key == itemKey;
        })[0];
      createCoachMarkForItem(keyItem);
    }
  }

  // Create the coach mark and then mark it as finished after displaying the coachmark - Very important to mark it as done
  function createCoachMarkByStepNumber(itemCount, options){
    var item = items[itemCount];
    createCoachMarkForItem(item, options);
  };

  function createCoachMarkForItem(item, options){
    if(item){
      // Handle "beforeShow" - to do any preprocessing before showing a coachmark. 
      // Currently we support calling a namespaced function in the client application.
      if(item.beforeShow){
        if(item.beforeShow.type === 'FUNCTION'){
          // Call the function
          executeFunctionByName( item.beforeShow.name, window );
          $("body").on("coachmarks.functionFinish", function(evt, data){
            if(data === item.beforeShow.name){
              createCoachMarkContent(item, options);  
              // TODO - check if this is needed
              $("body").off("coachmarks.functionFinish");
            }
          });
        }
      }
      else{
        createCoachMarkContent(item, options);
      }
    }
  }

  function hideCoachMarks(stepNumber, $element){
    $("body").find(".coachMarkOverlay").remove();
    $("body").find(".coachMarkHelper").remove();
    $("body").find(".coachMarkHighlighter").remove();
    if($element){
      $element.removeClass("coachMarkElement");
    }
    isCoachMarkVisible = false;
  }

  // Initialize 
  init();   
  // This event could be used for Single Page Applications (SPAs) where the page load event does not happen again and hence we need to manually trigger the DTM rule
  $("body").on("coachmarks.reload", function(evt, data){
    requestedKey = data;
    init();    
  });

  // Parse Again Implementation
  // Listen for "coachmarks.parseAgain" event on Body and parse the DOM again to see if new UI elements have come up as possible candidates for coachmarks
  // This is useful for data that appears later from server side that needs to be parsed again.
  $("body").on("coachmarks.parseAgain", function(evt, data){
    // Iterate over all items for this page and if no other coachmarks is visible currently then show this coachmark
    var parseAgainKey = data;
    var parseAgainItem = items.filter(function(obj){
      return obj.key == parseAgainKey;
    })[0];
    if(parseAgainItem!=null && !isCoachMarkVisible){
      createCoachMarkByStepNumber(parseAgainItem.stepNumber);
    }
  });

}(jQuery));
});
