(function(){
  function checkForValidUrl(tabId, changeInfo, tab) {
    
    console.log('checkForValidUrl')
    
    //if on grooveshark load content.js
    if (tab.url.indexOf('grooveshark.com') > -1) {
      //save url to localstorage
      localStorage['tabUrl'] = tab.url;
      
      //execute content.js
      chrome.tabs.executeScript(null, {file: "content.js"});
      
      //show extension icon in url bar
      chrome.pageAction.show(tabId);  

    }

  };

  //listen for any changes to the URL of any tab.
  chrome.tabs.onUpdated.addListener(checkForValidUrl);

})();


