var isExtension = false;

var gToSApp = angular.module('gToS', []);

gToSApp.controller("GToSCtrl", function ($scope, $http) {
  var originalData = [],  
      sorted = '',
      noMatch = function(){
        $scope.status = 'No spotify tracks found';
        $scope.gotData = false;
      },
      getData = function(query) {
        if(query.playerData){
          query = query.playerData  
        }
        
        else if(query.url){
          var url = query.url,
              i = url.indexOf('/s/'),
              n = url.lastIndexOf('/'),
              query = url.substring(i + 3, n);      
        }

        else {
          query = '';
          noMatch();
        }

        if(query){
          $http.get('http://ws.spotify.com/search/1/track.json?q=' + query).success(function(data) {
             if(data.tracks.length > 0){
              var str = data.tracks[0].href,
                arr = str.split(':'),
                newData = [];
                
              for(var i = 0; i < data.tracks.length; i++){
                var item = {artist: data.tracks[i].artists[0].name, 
                            track : data.tracks[i].name, 
                            album : data.tracks[i].album.name, 
                            link: data.tracks[i].href}
                newData.push(item)
              }

              originalData = newData.slice(0);
              
              $scope.data = newData;
              $scope.gotData = true;
              $scope.status = data.tracks.length + ' songs found';
            }
            else{
              noMatch();
            }  
          });
        }
	},

	init = function(){
    $scope.gotData = false;
    $scope.status = 'Searching for Spotify songs';
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.data = [];

    $scope.numberOfPages=function(){
        return Math.ceil($scope.data.length/$scope.pageSize);                
    }

    $scope.sortedOrder = '';
    $scope.sortedType = '';

	  var query = {
                  playerData : localStorage["songData"], 
                  url :  localStorage['tabUrl']
                }
	  
    getData(query);
	}
    
  init();

  $scope.getClass = function(type){
    var elClass = '';
    if(type === $scope.sortedType){
      elClass = $scope.sortedOrder + ' active';
    }
    return elClass;
  }
  
  $scope.openLink = function(link){
  	chrome.tabs.create({'url': link}, function(tab) {
	    // Tab opened add self closing funtion	    
	  });      
	}
  

  function compare(a, b, type){
    var alc = a[type].toLowerCase(), blc = b[type].toLowerCase();
    return alc > blc ? 1 : alc < blc ? -1 : a[type] > b[type] ? 1 : a[type] < b[type] ? -1 : 0;
  }

  // sort on key values
  $scope.sort = function(type){
    
    if(sorted === 'ascending' && type === $scope.sortedType){
      $scope.data.sort(function(a,b){
        return compare(a, b, type);
      }).reverse();
      sorted = 'descending'
    }

    else if(sorted === 'descending' && type === $scope.sortedType){
      $scope.data = originalData.slice(0);
      sorted = '';
      type = '';
    }

    else{
      $scope.data.sort(function(a,b){
        return compare(a, b, type);
      });
      sorted = 'ascending'      
    }

    $scope.sortedOrder = sorted;
    $scope.sortedType = type;
    $scope.currentPage = 0;
  }
});

gToSApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

gToSApp.directive('buttonbar', function() {
return {
    restrict: 'A',
    replace: true,
    templateUrl: 'partials/buttonBar.html'
  }
});

gToSApp.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});