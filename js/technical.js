/*  Dungeon of Souls
 *  Copyright (C) 2024 Yrahcaz7
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

/**
 * Returns a seeding function based on a string.
 * @param {string} str - the string to use.
 */
function internalSeed(str) {
	for (var k, i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
		k = Math.imul(str.charCodeAt(i), 3432918353);
		k = k << 15 | k >>> 17;
		h ^= Math.imul(k, 461845907);
		h = h << 13 | h >>> 19;
		h = Math.imul(h, 5) + 3864292196 | 0;
	};
	h ^= str.length;
	return () => {
		h ^= h >>> 16;
		h = Math.imul(h, 2246822507);
		h ^= h >>> 13;
		h = Math.imul(h, 3266489909);
		h ^= h >>> 16;
		return h >>> 0;
	};
};

/**
 * Returns a seed.
 */
var seed = internalSeed(game.seed);

/**
 * Returns a function that gives a random number in [0, 1) that is based on four seeds.
 * @param {number} a - the first seed.
 * @param {number} b - the second seed.
 * @param {number} c - the third seed.
 * @param {number} d - the fourth seed.
 */
function internalRandom(a, b, c, d) {
	return () => {
		var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
		c ^= a; d ^= b;
		b ^= c; a ^= d; c ^= t;
		d = d << 11 | d >>> 21;
		return (r >>> 0) / 4294967296;
	};
};

/**
 * Returns a seeded random number in [0, 1)
 */
const random = internalRandom(seed(), seed(), seed(), seed());

/**
 * Returns a seeded random integer in [min, max]
 * @param {number} min - the minimum integer, inclusive.
 * @param {number} max - the maximum integer, inclusive.
 */
function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if (min > max) [min, max] = [max, min];
	return Math.floor(random() * (max - min + 1)) + min;
};

/**
 * Has a chance of returning true.
 * @param {number} chance - the chance. Defaults to `1/2`.
 */
function chance(chance = 1/2) {
	return random() < chance;
};

var loaded = false;

window.onload = async function() {
	// prep things
	load();
	seed = internalSeed(game.seed);
	canvasData();
	// set things
	if (game.select[0] == S.GAME_WON) game.select[1] = 0;
	if (global.options[OPTION.PERFECT_SCREEN]) document.getElementById("canvas").style = "width: " + (800 * global.options[OPTION.PERFECT_SIZE]) + "px";
	else document.getElementById("canvas").style = "";
	// fix things
	fixCanvas();
	// calculate things
	if (game.map.length === 0) {
		await generateMap();
	} else {
		graphics.map(true);
		changeMusic();
		loaded = true;
	};
};

var canvas, scale, ctx, action = -1, lastAction = -1;

/**
 * Sets up the canvas.
 */
function canvasData() {
	let canv = document.getElementById("canvas");
	scale = canv.width / 400;
	canv.height = canv.width / 2;
	canvas = canv;
	ctx = canvas.getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
};

/**
 * Clears the canvas.
 */
function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Fixes the canvas in the html.
 */
function fixCanvas() {
	if (global.options[OPTION.PERFECT_SCREEN]) {
		const width = +(document.getElementById("canvas").style.width.match(/\d+/) || [800])[0];
		if (window.innerHeight <= width / 2) {
			if (window.innerWidth <= width) document.getElementById("canvas").className = "onlyScroll";
			else document.getElementById("canvas").className = "fixed";
		} else {
			document.getElementById("canvas").className = "";
		};
	} else {
		if (window.innerHeight <= window.innerWidth / 2) document.getElementById("canvas").className = "fixed";
		else document.getElementById("canvas").className = "";
	};
};

window.onresize = () => {
	fixCanvas();
};

document.addEventListener("keydown", event => {
	if (!loaded) return;
	const key = event.key, prevAction = action;
	if ((key == "E" || key == "e") && game.turn === TURN.PLAYER && game.select[0] !== S.CONF_END) endTurnConfirm();
	else if (key == "1" && !event.repeat && actionTimer == -1) {
		if (game.select[0] === S.DECK && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.DECK, 0];
		} else {
			if (game.select[2]) game.select = [S.DECK, 1, game.select[2]];
			else game.select = [S.DECK, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key == "2" && !event.repeat && actionTimer == -1) {
		if (game.select[0] === S.DISCARD && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.DISCARD, 0];
		} else {
			if (game.select[2]) game.select = [S.DISCARD, 1, game.select[2]];
			else game.select = [S.DISCARD, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key == "3" && !event.repeat && game.void.length && actionTimer == -1) {
		if (game.select[0] === S.VOID && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.VOID, 0];
		} else {
			if (game.select[2]) game.select = [S.VOID, 1, game.select[2]];
			else game.select = [S.VOID, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if ((key == " " || key == "Enter") && !event.repeat && actionTimer == -1) {
		action = -1;
		performAction();
	} else if (key == "W" || key == "w" || key == "ArrowUp") action = DIR.UP;
	else if (key == "A" || key == "a" || key == "ArrowLeft") action = DIR.LEFT;
	else if (key == "S" || key == "s" || key == "ArrowDown") action = DIR.DOWN;
	else if (key == "D" || key == "d" || key == "ArrowRight") action = DIR.RIGHT;
	else action = -1;
	if (key == "Escape") fullscreen(true);
	else if (key == "Tab") fullscreen();
	if (!event.repeat && prevAction === -1 && lastAction === action && global.options[OPTION.FAST_MOVEMENT] && loaded) {
		if (menuLocation === -1) manageGameplay();
		selection();
		updateVisuals();
	};
	if (action !== -1) lastAction = action;
});

document.addEventListener("keyup", event => {
	const key = event.key;
	if (key == " " || key == "Enter" || key == "W" || key == "w" || key == "ArrowUp" || key == "A" || key == "a" || key == "ArrowLeft" || key == "S" || key == "s" || key == "ArrowDown" || key == "D" || key == "d" || key == "ArrowRight") action = -1;
});

/**
 * Enters fullsceen mode.
 * @param {boolean} exit - whether to exit fullscreen mode instead of entering it.
 */
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
