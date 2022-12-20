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

// setup seeds

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

// setup PRNG

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

// setup other randomness

function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if ((!min && min !== 0) || (!max && max !== 0)) return NaN;
	if (min > max) [min, max] = [max, min];
	return Math.floor(random() * (max - min + 1)) + min;
};

function chance(chance = 0.5) {
	return random() < chance;
};

// setup game

var loaded = false;

window.onload = () => {
	// prep things
	load();
	seed = internalSeed(game.seed);
	canvasData();
	// set things
	if (game.select[0] == GAME_FIN) game.select[1] = 0;
	if (global.options.pixel_perfect_screen) document.getElementById("canvas").style = "width: 800px";
	else document.getElementById("canvas").style = "";
	// calculate things
	mapGraphics(true);
	if (game.map.length === 0) {
		updateMapProg();
		setTimeout(() => {
			generateMap();
		}, 0);
	} else {
		musicPopup();
		updateVisuals();
		loaded = true;
	};
};

// setup canvas

var canvas, scale, ctx, action = -1, lastAction = -1;

function canvasData() {
	let canv = document.getElementById("canvas");
	if (!canv) return false;
	scale = canv.width / 400;
	canv.height = canv.width / 2;
	canvas = canv;
	ctx = canvas.getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	return true;
};

// clear canvas

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// fix canvas

function fixCanvas() {
	if (global.options.pixel_perfect_screen) {
		if (window.innerHeight <= document.getElementById("canvas").height) document.getElementById("canvas").className = "fixed";
		else document.getElementById("canvas").className = "";
	} else {
		if (window.innerHeight <= window.innerWidth / 2) document.getElementById("canvas").className = "fixed";
		else document.getElementById("canvas").className = "";
	};
};

window.onresize = () => {
	fixCanvas();
};

// key press

document.addEventListener("keydown", (event) => {
	const key = event.key, prevAction = +action;
	if ((key == "E" || key == "e") && game.turn == "player") {
		if (game.select[0] != CONFIRM_END) endTurnConfirm();
	} else if (key == "1" && actionTimer == -1) {
		if (game.select[0] === DECK && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [DECK, 0];
		} else {
			if (game.select[2]) game.select = [DECK, 1, game.select[2]];
			else game.select = [DECK, 1, game.select];
			action = -1;
		};
		actionTimer = 2;
	} else if (key == "2" && game.void.length && actionTimer == -1) {
		if (game.select[0] === VOID && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [VOID, 0];
		} else {
			if (game.select[2]) game.select = [VOID, 1, game.select[2]];
			else game.select = [VOID, 1, game.select];
			action = -1;
		};
		actionTimer = 2;
	} else if (key == "3" && actionTimer == -1) {
		if (game.select[0] === DISCARD && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [DISCARD, 0];
		} else {
			if (game.select[2]) game.select = [DISCARD, 1, game.select[2]];
			else game.select = [DISCARD, 1, game.select];
			action = -1;
		};
		actionTimer = 2;
	} else if ((key == " " || key == "Enter") && !(game.select[2] && menuLocation === -1)) action = ENTER;
	else if (key == "W" || key == "w" || key == "ArrowUp") action = UP;
	else if (key == "A" || key == "a" || key == "ArrowLeft") action = LEFT;
	else if (key == "S" || key == "s" || key == "ArrowDown") action = DOWN;
	else if (key == "D" || key == "d" || key == "ArrowRight") action = RIGHT;
	else action = -1;
	if (key == "Escape") fullscreen(true);
	else if (key == "Tab") fullscreen();
	if (!event.repeat && prevAction === -1 && lastAction === action && global.options.allow_fast_movement && loaded) {
		if (action !== ENTER) selection();
		updateVisuals();
	};
	if (action !== -1) lastAction = action;
});

// key lift

document.addEventListener("keyup", (event) => {
	const key = event.key;
	if (key == " " || key == "Enter" || key == "W" || key == "w" || key == "ArrowUp" || key == "A" || key == "a" || key == "ArrowLeft" || key == "S" || key == "s" || key == "ArrowDown" || key == "D" || key == "d" || key == "ArrowRight") action = -1;
});

// enter/exit fullscreen

function fullscreen(exit = false) {
	if (exit) {
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
