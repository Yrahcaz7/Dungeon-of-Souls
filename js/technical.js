/*  Dungeon of Souls
 *  Copyright (C) 2025 Yrahcaz7
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
 * Updates the random number generator to use the current seed.
 */
function updateRandom() {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < game.seed.length; i++) {
		let k = Math.imul(game.seed.charCodeAt(i), 3432918353);
		k = k << 15 | k >>> 17;
		h ^= Math.imul(k, 461845907);
		h = h << 13 | h >>> 19;
		h = Math.imul(h, 5) + 3864292196 | 0;
	};
	h ^= game.seed.length;

	const seed = () => {
		h ^= h >>> 16;
		h = Math.imul(h, 2246822507);
		h ^= h >>> 13;
		h = Math.imul(h, 3266489909);
		h ^= h >>> 16;
		return h >>> 0;
	};

	let a = seed(), b = seed(), c = seed(), d = seed();

	random = () => {
		let t = b << 9, r = b * 5;
		r = (r << 7 | r >>> 25) * 9;
		c ^= a;
		d ^= b;
		b ^= c;
		a ^= d;
		c ^= t;
		d = d << 11 | d >>> 21;
		return (r >>> 0) / 4294967296;
	};
};

/**
 * Returns a seeded random number in [0, 1)
 * @type {() => number}
 */
let random;

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

let loaded = false;

window.onload = async function() {
	const promises = [];
	// setup and load things
	setupCanvas();
	draw.lore(200 - 2, 100 - 5.5 * 1, "Loading graphics...", {"color": "#fff", "text-align": DIR.CENTER});
	promises.push(loadImages());
	promises.push(loadSave());
	// finish loading
	await Promise.all(promises);
	loaded = true;
};

let canvas, scale, ctx, action = -1, lastAction = -1;

/**
 * Sets up the canvas.
 */
function setupCanvas() {
	let canv = document.getElementById("canvas");
	scale = canv.width / 400;
	canv.height = canv.width / 2;
	canvas = canv;
	ctx = canvas.getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	fixCanvas(true);
};

/**
 * Clears the canvas.
 */
function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Fixes the canvas.
 * @param {boolean} resize - whether to resize the canvas. Defaults to `false`.
 */
function fixCanvas(resize = false) {
	if (global.options[OPTION.PERFECT_SCREEN]) {
		if (resize) document.getElementById("canvas").style = "width: " + (800 * global.options[OPTION.PERFECT_SIZE]) + "px";
		const width = +(document.getElementById("canvas").style.width.match(/\d+/) || [800])[0];
		if (window.innerHeight <= width / 2) {
			if (window.innerWidth <= width) document.getElementById("canvas").className = "onlyScroll";
			else document.getElementById("canvas").className = "fixed";
		} else {
			document.getElementById("canvas").className = "";
		};
	} else {
		if (resize) document.getElementById("canvas").style = "";
		if (window.innerHeight <= window.innerWidth / 2) document.getElementById("canvas").className = "fixed";
		else document.getElementById("canvas").className = "";
	};
};

window.onresize = () => {
	fixCanvas();
};

document.addEventListener("keydown", event => {
	if (!loaded) return;
	const key = event.key;
	if (key.length == 1 && /[0-9a-f]/i.test(key) && !event.repeat && menuSelect[0] === MENU.ENTER_SEED && newSeed.length < 6 && actionTimer == -1) {
		newSeed += key.toUpperCase();
	} else if (key == "Backspace" && !event.repeat && menuSelect[0] === MENU.ENTER_SEED && actionTimer == -1) {
		newSeed = newSeed.slice(0, -1);
	} else if (key == "Clear" && !event.repeat && menuSelect[0] === MENU.ENTER_SEED && actionTimer == -1) {
		newSeed = "";
	} else if ((key == "E" || key == "e") && !event.repeat && menuSelect[0] == -1 && game.turn === TURN.PLAYER && actionTimer == -1) {
		if (game.select[0] === S.CONF_END) game.select = [S.HAND, game.prevCard];
		else endTurnConfirm();
		action = -1;
	} else if (key == "1" && !event.repeat && menuSelect[0] == -1 && actionTimer == -1) {
		if (game.select[0] === S.DECK && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.DECK, 0];
		} else {
			if (game.select[2]) game.select = [S.DECK, 1, game.select[2]];
			else game.select = [S.DECK, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key == "2" && !event.repeat && menuSelect[0] == -1 && actionTimer == -1) {
		if (game.select[0] === S.DISCARD && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.DISCARD, 0];
		} else {
			if (game.select[2]) game.select = [S.DISCARD, 1, game.select[2]];
			else game.select = [S.DISCARD, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key == "3" && !event.repeat && menuSelect[0] == -1 && game.void.length && actionTimer == -1) {
		if (game.select[0] === S.VOID && game.select[1]) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.VOID, 0];
		} else {
			if (game.select[2]) game.select = [S.VOID, 1, game.select[2]];
			else game.select = [S.VOID, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key == "0" && !event.repeat && menuSelect[0] == -1 && actionTimer == -1) {
		if (game.select[0] === S.CARDS) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.MAP, get.availibleLocations().length];
		} else {
			if (game.select[2]) game.select = [S.CARDS, 1, game.select[2]];
			else game.select = [S.CARDS, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if ((key == "B" || key == "b") && !event.repeat && actionTimer == -1) {
		if (menuSelect[0] === MENU.PREV_GAMES) {
			menuSelect = [MENU.MAIN, 4];
			action = -1;
			actionTimer = 2;
		} else if (menuSelect[0] == -1 && game.select[0] === S.REFINER) {
			for (let index = 0; index < game.rewards.length; index++) {
				if (game.rewards[index] == "1 refiner") {
					game.select = [S.REWARDS, index];
					action = -1;
					actionTimer = 2;
					break;
				};
			};
		};
	} else if ((key == "C" || key == "c") && !event.repeat && menuSelect[0] === MENU.PREV_GAMES && actionTimer == -1) {
		menuSelect = [MENU.PREV_GAME_SORT, 0];
		action = -1;
		actionTimer = 2;
	} else if ((key == " " || key == "Enter") && !event.repeat && actionTimer == -1) {
		action = -1;
		performAction();
	} else if (key == "W" || key == "w" || key == "ArrowUp") {
		action = DIR.UP;
	} else if (key == "A" || key == "a" || key == "ArrowLeft") {
		action = DIR.LEFT;
	} else if (key == "S" || key == "s" || key == "ArrowDown") {
		action = DIR.DOWN;
	} else if (key == "D" || key == "d" || key == "ArrowRight") {
		action = DIR.RIGHT;
	} else {
		action = -1;
	};
	if (key == "Escape") { // exits fullscreen
		if (document.body.exitFullscreen) {
			document.body.exitFullscreen();
		} else if (document.body.webkitExitFullscreen) {
			document.body.webkitExitFullscreen();
		} else if (document.body.mozExitFullScreen) {
			document.body.mozExitFullScreen();
		} else if (document.body.msExitFullscreen) {
			document.body.msExitFullscreen();
		};
	} else if (key == "Tab") { // enters fullscreen
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
	if (!event.repeat && lastAction === action && global.options[OPTION.FAST_MOVEMENT]) {
		if (!inMenu()) manageGameplay();
		selection();
		updateVisuals();
	};
	if (action !== -1) lastAction = action;
});

document.addEventListener("keyup", event => {
	const key = event.key;
	if (key == "W" || key == "w" || key == "ArrowUp" || key == "A" || key == "a" || key == "ArrowLeft" || key == "S" || key == "s" || key == "ArrowDown" || key == "D" || key == "d" || key == "ArrowRight") action = -1;
});
