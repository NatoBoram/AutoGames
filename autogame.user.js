// ==UserScript==
// @name		AutoGames
// @namespace	https://gitlab.com/NatoBoram/AutoGames
// @version		1.0.4
// @author		Nato Boram
// @description	Automagically plays Eldarya's minigames for you!
// @icon		http://www.eldarya.com/static/img/design/menu/minigames.png
// @supportURL	https://gitlab.com/NatoBoram/AutoGames/issues
//
// HTTPS
// @match		https://eldarya.com.br/*
// @match		https://eldarya.de/*
// @match		https://eldarya.es/*
// @match		https://eldarya.hu/*
// @match		https://eldarya.it/*
// @match		https://eldarya.pl/*
// @match		https://eldarya.ru/*
// @match		https://eldarya.com/*
// @match		https://eldarya.fr/*
//
// HTTPS WWW
// @match		https://www.eldarya.com.br/*
// @match		https://www.eldarya.de/*
// @match		https://www.eldarya.es/*
// @match		https://www.eldarya.hu/*
// @match		https://www.eldarya.it/*
// @match		https://www.eldarya.pl/*
// @match		https://www.eldarya.ru/*
// @match		https://www.eldarya.com/*
// @match		https://www.eldarya.fr/*
//
// @run-at		document-end
// @grant		none
// ==/UserScript==

(function() {
	'use strict';

	// Force HTTPS
	if (location.protocol !== "https:")
		location.protocol = "https:";

	/**
	 * Play the game automagically!
	 */
	window.autogames = {

		/**
		 * Start the game and get the token.
		 * @param {String} name Name of the game
		 * @returns {String} Token
		 */
		play: function(game, score) {
			$.ajax({
				url: '/minigames/ajax_startGame',
				type: 'post',
				dataType: 'json',
				data: {
					game: game
				},

				/**
				 * Fired when the AJAX POST is successful.
				 * @param {JSON} json Server's response
				 */
				success: function(json) {
					if (json.result == 'success') {

						// Play
						var gameToken = json.data;
						console.log("gameToken :", gameToken);
						var enc_token = autogames.xorEncode(gameToken, score);
						console.log("enc_token :", enc_token);
						autogames.send(enc_token, score, game);
						console.log("Played :", game);

						// Visual Feedback
						new $.flavrNotif("Played : " + game, {
							timeout: 1000
						});

					} else {
						console.log("ajax_startGame :", json);
					}
				}
			});
		},

		/**
		 * Found in `emil-e.js`.
		 * @param {String} str gameToken
		 * @param {String} key score
		 * @returns {String} enc_token
		 */
		xorEncode: function(str, key) {
			str = str.toString();
			key = key.toString();
			var xor = "";
			var tmp;
			for (var i = 0; i < str.length; ++i) {
				tmp = str[i];
				for (var j = 0; j < key.length; ++j) {
					tmp = String.fromCharCode(tmp.charCodeAt(0) ^ key.charCodeAt(j));
				}
				xor += tmp;
			}
			return encodeURIComponent(xor);
		},

		/**
		 * Found in `emil-e.js`.
		 * @param {String} enc_token xorEncode
		 * @param {Number} score score
		 * @param {String} game game
		 */
		send: function(enc_token, score, game) {
			var token = decodeURIComponent(enc_token);
			$.ajax({
				"type": "post",
				"url": "/minigames/ajax_saveScore",
				"data": {
					"token": token,
					"score": score,
					"game": game
				},
				"complete": function(data) {}
			});
		},

		/**
		 * Play everything.
		 */
		playall: function() {

			// Play games
			autogames.play("peggle", 10);
			autogames.play("flappy", 190 + Math.round(Math.random() * 10));
			autogames.play("hatchlings", 19 + Math.round(Math.random()));

		},

		/**
		 * Adds the carousel
		 */
		add_carousel: function() {
			$(".index-carousel-slider").prepend(
				'<div class="index-carousel-slide" id="carousel-autogame">' +
				'	<img class="index-carousel-picture" src="https://gitlab.com/NatoBoram/AutoGames/raw/master/assets/carousel-autogames.png" />' +
				'	<div class="index-carousel-side">' +
				'		<div class="index-carousel-title">Auto Games</div>' +
				'		<div class="index-carousel-subtitle"></div>' +
				'		<div class="index-carousel-description">Automatically play all your minigames!</div>' +
				'		<div class="index-carousel-button">' +
				'			<a class="button" onclick="autogames.playall();">Play Games</a>' +
				'		</div>' +
				'	</div>' +
				'</div>'
			);
		},
	};

	// Carousel
	autogames.add_carousel();

	// Header Menu
	$("#header-menu").prepend(
		'<li>' +
		'	<a onclick="autogames.playall();" style="color:#34386f;">AutoGames</a>' +
		'</li>'
	);

	// Interval
	setInterval(function() {

		// Check if we're on a page where there's a carousel
		if ($(".index-carousel").length === 1) {

			// Check if the carousel entry is there
			if ($("#carousel-efd").length === 0) {

				// Add it!
				autogames.add_carousel();
			}
		}
	}, 60 * 1000);

})();