(function(){
  function checkForValidUrl(tabId, changeInfo, tab) {
        
    //if on grooveshark load content.js
    if (tab.url.indexOf('grooveshark.com') > -1) {      
      //execute content.js
      chrome.tabs.executeScript(null, {file: "content.js"});
    }

  };

})();


