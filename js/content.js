(function(){
	// make debug messages stand out from grooveshark errors and logs
	var DebugColorString = 'color: blue;';	

	/*
		Globals for content.js
	 */

	var App, 
		Query = ' ',
		PlayBtn = document.getElementById('play-pause');

	var StringToNode = function(tmplString){
		var _div = document.createElement('div');
		_div.innerHTML = tmplString;
		return _div.childNodes[0];
	};

	var Init = function(){
		var _popupTmpl = StringToNode(
							'<div id="gToS" ng-app="sToG" ng-csp ng-controller="MessageHolderCtrl" class="layout-box" ng-class="isVisibleClass">' +
								'<div class="m-toggler" ng-class="state" ng-click="toggleVisibility()">&#9835</div>' +
								'<div ng-show="data.length > 0">' + 
									'<div buttonbar></div>' + 
									'<div datatable></div>' +
									'<div buttonbar></div>' +
								'</div>' +
								'<div ng-show="data.length == 0" ng-bind="status">' +
								'</div>' +		 
							'</div>'
							);

		document.body.appendChild(_popupTmpl);

		App = angular.module('sToG', []);
	}			

	Init();

	/*
		services
	 */
	
	App.constant('MessageBundle', {
		searching : 'Searching for Spotify songs',
		notFound : 'No matching Spotify songs found'
	});

	App.factory('SpotifyFactory', function($http){
		var _factory = {},
			_urlBase = 'http://ws.spotify.com/search/1/track.json?q=';
		/*
			info: Object
				limit: 100
				num_results: 504
				offset: 0
				page: 1
				query: "Pixies"
				type: "track"
			tracks: Array[100]
				0: Object
					album: Object
					artists: Array[1]
					external-ids: Array[1]
					href: "spotify:track:5BP0oaQ1VhuaznT77CBXQp"
					length: 231.931
					name: "Where Is My Mind?"
					popularity: "0.74"
					track-number: "14"
				...
			...		
		 */
			
		_factory.getData = function(query){
			return $http.get(_urlBase + query);
		}

		return _factory;
	});

	App.factory('QueryFactory', function(){
		var _factory = {};

		_factory.getQuery = function(){

			var _newQuery = '',

				//check if song is currently playing
				_song = document.querySelectorAll('#now-playing-metadata .song')[0], 
				_artist = document.querySelectorAll('#now-playing-metadata .artist')[0];
				
			//Pixies 
			if(_artist && _artist.innerText) _newQuery += _artist.innerText.split(' ').join('+') + '+'; //Pixies+
			
			//Trompe le Monde Pixies 
			if(_song && _song.innerText) _newQuery += _song.innerText.split(' ').join('+'); //Pixies+Trompe+le+Monde
			
			//no song is playing. Try to get data from url instead
			if(!_newQuery){
				/*
					search urls : http://grooveshark.com/#!/search?q=pj+thom,
								  http://grooveshark.com/#!/search/song?q=pj+harvey+thom+yorke

					track url : http://grooveshark.com/s/Where+Is+My+Mind/3SG5Ua?src=5

					profile url : http://grooveshark.com/#!/profile/Pixies/22180913

					album url : http://grooveshark.com/#!/album/Trompe+Le+Monde/1261426
				 */

				var _url = window.location.href,
					_searchUrl = '#!/search',
					_trackUrl = '/s/',
					_profileUrl = '#!/profile/',
					_albumUrl = '#!/album/';

				// /#!/search?q=pj+thom	
				if(_url.indexOf(_searchUrl) > -1){
					var queries = _url.slice(_url.indexOf('?') + 1).split('&'); //['q=pj+thom']
					for (var i = 0; i < queries.length; i++) {
					  	var indexOfQ = queries[i].indexOf('q=');
						if(indexOfQ > -1){ //'q=pj+thom'
							_newQuery = queries[i].substring(indexOfQ + 2); //pj+thom
					  	}  
					};					 
				}

				// /s/Where+Is+My+Mind/3SG5Ua?src=5 or /#!/profile/Pixies/22180913 or /#!/album/Trompe+Le+Monde/1261426
				else if((_url.indexOf(_trackUrl) > -1) || (_url.indexOf(_profileUrl) > -1) || (_url.indexOf(_albumUrl) > -1)){
					if(_url.indexOf(_trackUrl) > -1) var hash = _trackUrl;
					else if(_url.indexOf(_profileUrl) > -1) var hash = _profileUrl;
					else var hash = _albumUrl; 	

					var indexOfHash = _url.indexOf(hash),
						indexOfLastSlash = _url.lastIndexOf('/');		
					
					_newQuery = _url.substring(indexOfHash + hash.length, indexOfLastSlash); // Where+Is+My+Mind or Pixies or Trompe+Le+Monde
				}
			}

			return _newQuery; 
		}

		return _factory;
	})

	/*
		filters
	 */
	
	App.filter('startFrom', function() {
	    return function(input, start) {
	        start = +start; //parse to int
	        return input.slice(start);
	    }
	});

	/*
		directives
	 */

	App.directive('buttonbar', function() {
		return {
		    restrict: 'A',
		    replace: true,
		    templateUrl: chrome.extension.getURL('/partials/buttonBar.html')
		  }
	});

	App.directive('datatable', function() {
		return {
		    restrict: 'A',
		    replace: true,
		    templateUrl: chrome.extension.getURL('/partials/dataTable.html')
		  }
	});

	/*
		controllers
	 */

	App.controller('MessageHolderCtrl', function($scope, $http, SpotifyFactory, QueryFactory, MessageBundle){
		var _noTracksFound = function(){
				$scope.data = [];
				$scope.status = MessageBundle.notFound;
				$scope.state = 'is-no-success';
			},
			_getData = function(query){
				$scope.state = 'is-searching';
				SpotifyFactory.getData(query)
					.success(function(data){

						// get essential data
						if(data.tracks.length > 0){
							var _newData = [];
			                
				            for(var i = 0; i < data.tracks.length; i++){
								var _item = {artist: data.tracks[i].artists[0].name, 
											track : data.tracks[i].name, 
											album : data.tracks[i].album.name, 
											link: data.tracks[i].href}

								_newData.push(_item);
				            }
				            $scope.data = _newData;
				            $scope.message = MessageBundle.searching;
				            $scope.state = 'is-success';			            
			            }

			            else{		            	
			            	//no tracks found
			            	_noTracksFound();
			            }
						
					})
					.error(function(error){
						_noTracksFound();
					})
		},

		// initialize values for controller
		_init = function(){		    
		    // data
		    $scope.status = MessageBundle.searching;
		   	$scope.data = [];

		   	// values for pagination
		    $scope.currentPage = 0;
		    $scope.pageSize = 10;

		    $scope.state = 'is-searching';
		    $scope.isVisibleClass = 'is-hidden';

			// keep checking if the query has changed
			setInterval(function(){
				//get query
				var _newQuery = QueryFactory.getQuery();

				//if query has changed update it and get new data
				if(_newQuery !== Query){
					Query = _newQuery;
					console.log('%cNew query: ' + Query, DebugColorString)
					_getData(Query);				
				}
			}, 1000);	    
		};		

		_init();

		/*
			$scope functions
		 */

	    $scope.numberOfPages = function(){
	        return Math.ceil($scope.data.length/$scope.pageSize);                
	    }

	    // helper function for adding active class to column titles
	    $scope.isActive = function(typeStrg){
	    	var className = '';
	    	if(typeStrg && typeStrg === $scope.predicate) className = 'is-active';
	    	return className;
	    }

	    $scope.openLink = function(link, data){
	    	if(PlayBtn && PlayBtn.className.indexOf('playing') > -1) PlayBtn.click();
			var _newWindow = window.open(link,'','width=200,height=100');
			
			var _fileref = _newWindow.document.createElement("link");
			_fileref.setAttribute("rel", "stylesheet");
			_fileref.setAttribute("type", "text/css");
			_fileref.setAttribute("href", chrome.extension.getURL('/css/popup.css'));

			_newWindow.document.getElementsByTagName("head")[0].appendChild(_fileref);

			var _popupTmpl = StringToNode(
								'<div>' +
									'<p>' + data.track + ' - ' + data.artist + ' opened in spotify</p>' +
									'<button onclick="window.close()">Close window</button>' +
								'</div>'	
							);

			_newWindow.document.body.appendChild(_popupTmpl);
			_newWindow.focus();    
		}

		$scope.toggleVisibility = function(){			
			if($scope.isVisibleClass === 'is-hidden') $scope.isVisibleClass = 'is-visible';
			else $scope.isVisibleClass = 'is-hidden';
		}
	});

	/*
		config
	 */

	App.config(function($httpProvider){
    	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});
})();
