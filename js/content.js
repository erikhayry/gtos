(function(){

	function getQuery(){
		var song = document.querySelectorAll('#now-playing-metadata .song')[0], 
			artist = document.querySelectorAll('#now-playing-metadata .artist')[0],
			query = '';
			
			if(song && song.innerText) query += song.innerText + ' ';
			if(artist && artist.innerText) query += artist.innerText;
			return query; 
	}

	var url = window.location.href,
		i = url.indexOf('/s/'),
		n = url.lastIndexOf('/'),
		urlQuery = url.substring(i + 3, n);
	
	if(urlQuery.indexOf('grooveshark') < 0) {
		localStorage['tabUrl'] = urlQuery
	}

	else localStorage['tabUrl'] = '';
	
	localStorage['songData'] = getQuery();

	setInterval(function(){
		localStorage['songData'] = getQuery();
	}, 3000);

	/*
		Assuming Groovesharks play button got a id of 'play-pause' and a class of 'playing' when playing
	 */

	var paused = false,
		loc = window.location.host;

		var interval = setInterval(function(){
			console.log('checking')
			var playPauseBtn = document.getElementById('play-pause');
			if(!paused && playPauseBtn && playPauseBtn.className.indexOf('playing') > -1){
				playPauseBtn.click();
			}
			localStorage['songData'] = getQuery();
			
			chrome.extension.sendMessage({
			    type: "songData", 
			    query: getQuery()
			});

		}, 1000);
})();
