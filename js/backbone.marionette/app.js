/*global Backbone */

console.log(document.body.dataset.language)

var test = {
	test : '...' + document.body.dataset.language
}

console.log(test.test)

'use strict';

var gToE = new Backbone.Marionette.Application();

var App = {
		Models : {},
		Collections : {},
		Views : {}
}

App.Models.Song = Backbone.Model.extend({});

App.Views.Song = Backbone.View.extend({
	tagName : 'li',
	
	template : _.template( $('#template-list-item').html() ),

	initialize : function(){
		this.render(this);
	},

	render : function(){
		var template  = this.template( this.model.toJSON() );
		this.$el.html(template);
		return this;
	}
});

App.Collections.Songs = Backbone.Collection.extend({
	model : App.Models.Song
});

App.Views.Songs = Backbone.View.extend({
	tagName : 'ul',

	initialize : function(){
		this.collection.on('add', this.addOne, this);
	},

	render: function(){
		this.collection.each(this.addOne, this)
		return this;
	},

	addOne : function(song){
		var songView = new App.Views.Song({ model : song })
		this.$el.append(songView.render().el)
	} 
})

var songCollection;

gToE.module("songService", function(songService, gToE, Backbone, Marionette, $, _){
    songService.getData = function(query){
		if(query.playerData){
          query = query.playerData  
        }
        else if(query.url){
          query = query.url
        }

        else {
          noMatch();
        }

        if(query){
			$.get('http://ws.spotify.com/search/1/track.json?q=' + query, function(data){
				songCollection = new App.Collections.Songs(data['tracks']);
				var songsView = new App.Views.Songs({collection : songCollection});
				$('#main').html(songsView.render().el);
			});

		}	
	}
});

gToE.on('start', function() {
	var songService = gToE.module("songService");
	var init = function(){
		var query = {
			playerData : 'Walking In Your Footsteps Shout Out Louds', 
			url :  localStorage['tabUrl']
		}
	  
    	songService.getData(query);
	}

	init();
});

