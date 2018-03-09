// ==UserScript==
// @name		AutoGames
// @namespace	https://gitlab.com/nato.boram/AutoGames
// @version		0.0.3
// @author		Nato Boram
// @description	Automagically plays Eldarya's minigames for you!
// @icon		http://www.eldarya.com/static/img/design/menu/minigames.png
// @updateURL	https://gitlab.com/nato.boram/AutoGames/raw/master/autogame.user.js
// @downloadURL	https://gitlab.com/nato.boram/AutoGames/raw/master/autogame.user.js
// @supportURL	https://gitlab.com/nato.boram/AutoGames/issues
// @match		http://www.eldarya.com.br/*
// @match		http://www.eldarya.br/*
// @match		http://www.eldarya.de/*
// @match		http://www.eldarya.es/*
// @match		http://www.eldarya.hu/*
// @match		http://www.eldarya.it/*
// @match		http://www.eldarya.pl/*
// @match		http://www.eldarya.ru/*
// @match		http://www.eldarya.com/*
// @match		http://www.eldarya.fr/*
// @run-at		document-end
// @grant		none
// ==/UserScript==

(function () {
	'use strict';

	/**
	 * Play the game automagically!
	 */
	window.autogames = {

		/**
		 * Start the game and get the token.
		 * @param {String} name Name of the game
		 * @returns {String} Token
		 */
		play: function (game, score) {
			$.ajax({
				url: '/minigames/ajax_startGame',
				type: 'post',
				dataType: 'json',
				data: {
					game: game
				},
				success: function (json) {
					if (json.result == 'success') {

						// Play
						var gameToken = json.data;
						console.log("gameToken : ", gameToken);
						var enc_token = autogames.xorEncode(gameToken, score);
						console.log("enc_token : ", enc_token);
						autogames.send(enc_token, score, game);
						console.log("Played : ", game);

						// Visual Feedback
						new $.flavrNotif("Played : " + game, {
							timeout: 1000
						});
						setTimeout(refreshPlayerInfo, 1000);

					} else {
						console.log("ajax_startGame : ", json);
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
		xorEncode: function (str, key) {
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
		 * @param {Number} score
		 * @param {String} game
		 */
		send: function (enc_token, score, game) {
			var token = decodeURIComponent(enc_token);
			$.ajax({
				"type": "post",
				"url": "/minigames/ajax_saveScore",
				"data": {
					"token": token,
					"score": score,
					"game": game
				},
				"complete": function (data) {}
			});
		},

		/**
		 * Play everything.
		 */
		playall: function () {

			// Play games
			autogames.play("peggle", 10);
			autogames.play("flappy", 190 + Math.round(Math.random() * 10));
			autogames.play("hatchlings", 19 + Math.round(Math.random()));

		}
	};

	// Header Menu
	$("#header-menu").prepend(
		'<li>'+
		'	<a onclick="autogames.playall();" style="color:#34386f;">AutoGames</a>'+
		'</li>'
	);

	// Carousel
	$(".index-carousel-slider").prepend(
		'<div class="index-carousel-slide" id="carousel-autogame">' +
		'	<img class="index-carousel-picture" src="https://gitlab.com/nato.boram/AutoGames/raw/master/assets/carousel-bienvenue.png" />' +
		'	<div class="index-carousel-side">' +
		'		<div class="index-carousel-title">Auto Games</div>' +
		'		<div class="index-carousel-subtitle"></div>' +
		'		<div class="index-carousel-description">Mini-games are validated on the client side. Take advantage of it to win some free maanas!</div>' +
		'		<div class="index-carousel-button">' +
		'			<a class="button" onclick="autogames.playall();">Play Games</a>' +
		'		</div>' +
		'	</div>' +
		'</div>'
	);

})();
