/*  Dungeon of Souls
 *  Copyright (C) 2022 Yrahcaz7
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// seeding and randomness

function internalSeed(str) {
	for (var k, i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
		k = Math.imul(str.charCodeAt(i), 3432918353); k = k << 15 | k >>> 17;
		h ^= Math.imul(k, 461845907); h = h << 13 | h >>> 19;
		h = Math.imul(h, 5) + 3864292196 | 0;
	};
	h ^= str.length;
	return function() {
		h ^= h >>> 16; h = Math.imul(h, 2246822507);
		h ^= h >>> 13; h = Math.imul(h, 3266489909);
		h ^= h >>> 16;
		return h >>> 0;
	};
};

var seed = internalSeed(game.seed);

function internalRandom(a, b, c, d) {
	return function() {
		var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
		c ^= a; d ^= b;
		b ^= c; a ^= d; c ^= t;
		d = d << 11 | d >>> 21;
		return (r >>> 0) / 4294967296;
	};
};

const random = internalRandom(seed(), seed(), seed(), seed());

function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if ((!min && min !== 0) || (!max && max !== 0)) return NaN;
	if (min > max) [min, max] = [max, min];
	return Math.floor(random() * (max - min + 1)) + min;
};

function chance(chance = 0.5) {
	return random()<chance;
};

// page setup

var canvas, scale, ctx, action = "none", lastAction = "none", loaded = false;

window.onload = () => {
	load();
	seed = internalSeed(game.seed);
	canvasData();
	mapGraphics(true);
	if (game.map.length === 0) {
		updateMapProg();
		setTimeout(function() {
			generateMap();
		}, 0);
	} else {
		musicPopups();
		updateVisuals();
		loaded = true;
	};
};

function canvasData() {
	let canv = document.getElementById("canvas");
	if (!canv) return false;
	canvas = canv;
	scale = canvas.width / 400;
	ctx = canvas.getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	return true;
};

// event listeners

document.addEventListener("keydown", (event) => {
	const key = event.key, prevAction = "" + action;
	if (key == "E" || key == "e") {
		if (game.select[0] != "confirm_end") endTurnConfirm();
	} else if (key == "1" && actionTimer == -1) {
		if (game.select[0] == "deck" && game.select[1]) {
			if (game.hand.length > 0) game.select = ["hand", game.prevCard];
			else if (game.state == "battle") game.select = ["end", 0];
			else game.select = ["map", 0];
		} else game.select = ["deck", 1];
		actionTimer = 2;
	} else if (key == "2" && actionTimer == -1) {
		if (game.select[0] == "void" && game.select[1]) {
			if (game.hand.length > 0) game.select = ["hand", game.prevCard];
			else if (game.state == "battle") game.select = ["end", 0];
			else game.select = ["map", 0];
		} else if (game.void.length > 0) game.select = ["void", 1];
		actionTimer = 2;
	} else if (key == "3" && actionTimer == -1) {
		if (game.select[0] == "discard" && game.select[1]) {
			if (game.hand.length > 0) game.select = ["hand", game.prevCard];
			else if (game.state == "battle") game.select = ["end", 0];
			else game.select = ["map", 0];
		} else game.select = ["discard", 1];
		actionTimer = 2;
	} else if (key == " " || key == "Enter") action = "enter";
	else if (key == "W" || key == "w" || key == "ArrowUp") action = "up";
	else if (key == "A" || key == "a" || key == "ArrowLeft") action = "left";
	else if (key == "S" || key == "s" || key == "ArrowDown") action = "down";
	else if (key == "D" || key == "d" || key == "ArrowRight") action = "right";
	else action = "none";
	if (key == "Escape") fullscreen("exit");
	else if (key == "Tab") fullscreen();
	if (!event.repeat && prevAction == "none" && lastAction == action && global.options.allow_fast_movement) {
		if (action != "enter" && key != "1" && key != "2" && key != "3") selection();
		updateVisuals();
	};
	if (action != "none") lastAction = action;
});

document.addEventListener("keyup", (event) => {
	const key = event.key;
	if (key == " " || key == "Enter" || key == "W" || key == "w" || key == "ArrowUp" || key == "A" || key == "a" || key == "ArrowLeft" || key == "S" || key == "s" || key == "ArrowDown" || key == "D" || key == "d" || key == "ArrowRight") action = "none";
});

function fullscreen(state = "enter") {
	if (state == "exit") {
		if (document.body.exitFullscreen) {
			document.body.exitFullscreen();
		} else if (document.body.webkitExitFullscreen) {
			document.body.webkitExitFullscreen();
		} else if (document.body.mozExitFullScreen) {
			document.body.mozExitFullScreen();
		} else if (document.body.msExitFullscreen) {
			document.body.msExitFullscreen();
		};
	} else {
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen();
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen();
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen();
		} else if (document.body.msRequestFullscreen) {
			document.body.msRequestFullscreen();
		};
	};
};
