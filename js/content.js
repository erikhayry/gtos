(function(){
	var query = '';

	var _getQuery = function(){

		var newQuery = '',

			//check if song is currently playing
			song = document.querySelectorAll('#now-playing-metadata .song')[0], 
			artist = document.querySelectorAll('#now-playing-metadata .artist')[0];
			
			//Pixies 
			if(artist && artist.innerText) newQuery += artist.innerText.split(' ').join('+') + '+'; //Pixies+
			//Trompe le Monde Pixies 
			if(song && song.innerText) newQuery += song.innerText.split(' ').join('+'); //Pixies+Trompe+le+Monde


			
			//no song is playing. Try to get data from url instead
			if(!newQuery){
				/*
					search urls : http://grooveshark.com/#!/search?q=pj+thom,
								  http://grooveshark.com/#!/search/song?q=pj+harvey+thom+yorke

					track url : http://grooveshark.com/s/Where+Is+My+Mind/3SG5Ua?src=5

					profile url : http://grooveshark.com/#!/profile/Pixies/22180913

					album url : http://grooveshark.com/#!/album/Trompe+Le+Monde/1261426

				 */

				var url = window.location.href,
					type = '';

				// /#!/search?q=pj+thom	
				if(url.indexOf('#!/search') > -1){
					var queries = url.slice(url.indexOf('?') + 1).split('&'); //['q=pj+thom']
					for (var i = 0; i < queries.length; i++) {
					  	var indexOfQ = queries[i].indexOf('q=');
						if(indexOfQ > -1){ //'q=pj+thom'
							newQuery = queries[i].substring(indexOfQ + 2); //pj+thom
					  	}  
					};					 
				}

				// /s/Where+Is+My+Mind/3SG5Ua?src=5 or /#!/profile/Pixies/22180913 or /#!/album/Trompe+Le+Monde/1261426
				else if((url.indexOf('/s/') > -1) || (url.indexOf('#!/profile/') > -1) || (url.indexOf('#!/album/') > -1)){
					if(url.indexOf('/s/') > -1) var hash = '/s/';
					else if(url.indexOf('#!/profile/') > -1) var hash = '#!/profile/';
					else var hash = '#!/album/'; 	

					var indexOfHash = url.indexOf(hash),
						indexOfLastSlash = url.lastIndexOf('/');		
					
					newQuery = url.substring(indexOfHash + hash.length, indexOfLastSlash); // Where+Is+My+Mind or Pixies or Trompe+Le+Monde
				}
			}

			return newQuery; 
	},

	_stringToNode = function(tmplString){
		var div = document.createElement('div');
		div.innerHTML = tmplString;
		return div.childNodes[0];
	};



	var popUpTmpl = _stringToNode(
								'<div ng-app="sToG" ng-csp ng-controller="messageHolder">' + 
									'{{message}}' +
								'</div>'
								);

	var init = function(){

		document.body.appendChild(popUpTmpl);

	}			


	init();

	var App = angular.module('sToG', []);

/*	App.factory('spotifyFactory', function(){
		var factory = {},

		_getData = function(){
			$http.get('http://ws.spotify.com/search/1/track.json?q=' + query).success(function(data) {
			});	
		}



		return factory;

	});*/

	App.controller('messageHolder', function($scope, $http){
		var interval = setInterval(function(){
			var newQuery = _getQuery();
			if(newQuery !== query){
				query = newQuery;
				console.log(query)
				$http.get('http://ws.spotify.com/search/1/track.json?q=' + query).success(function(data) {
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
					 */
					console.log(data);
					
				});
				$scope.$apply(function(){
					$scope.message = query;
				})
			}
		}, 1000);
	});

	App.config(function($httpProvider){
    	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});

	angular.bootstrap(popUpTmpl, ['sToG']);



})();
