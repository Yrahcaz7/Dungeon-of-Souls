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
 * @param {boolean} updateState - whether to update the random state. Defaults to `game.randomState.length == 0`.
 */
function updateRandom(updateState = (game.randomState.length == 0)) {
	if (updateState) {
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
		game.randomState = [seed(), seed(), seed(), seed()];
	};
	random = () => {
		const t = game.randomState[1] << 9;
		let r = game.randomState[1] * 5;
		r = (r << 7 | r >>> 25) * 9;
		game.randomState[2] ^= game.randomState[0];
		game.randomState[3] ^= game.randomState[1];
		game.randomState[1] ^= game.randomState[2];
		game.randomState[0] ^= game.randomState[3];
		game.randomState[2] ^= t;
		game.randomState[3] = game.randomState[3] << 11 | game.randomState[3] >>> 21;
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

const SCALE = 2;

/** @type {HTMLCanvasElement} */
let canvas;
/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {boolean} */
let loaded = false;

window.onload = async function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	draw.lore(200 - 2, 100 - 5.5 * 3, "Loading graphics...\n\n0%", {"color": "#fff", "text-align": DIR.CENTER});
	await Promise.all([loadImages(), loadSave()]);
	fixCanvas(true);
	loaded = true;
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
		if (resize) canvas.style = "width: " + (800 * global.options[OPTION.PERFECT_SIZE]) + "px";
		const width = +(canvas.style.width.match(/\d+/) || [800])[0];
		if (window.innerHeight <= width / 2) {
			if (window.innerWidth <= width) canvas.className = "onlyScroll";
			else canvas.className = "fixed";
		} else {
			canvas.className = "";
		};
	} else {
		if (resize) canvas.style = "";
		if (window.innerHeight <= window.innerWidth / 2) canvas.className = "fixed";
		else canvas.className = "";
	};
};

window.onresize = fixCanvas;

let action = -1;
let lastAction = -1;
let holdTimer = 0;

/**
 * Performs a keyboard shortcut that changes the selection.
 * @param {number} location - the shortcut changes the selection to `[location, 1]`.
 */
function shortcutTo(location) {
	if (game.select[0] === location && game.select[1]) {
		if (game.select[2]) game.select = game.select[2];
		else game.select = [location, 0];
	} else {
		if (game.select[2]) game.select = [location, 1, game.select[2]];
		else game.select = [location, 1, game.select];
	};
	action = -1;
	actionTimer = 2;
};

document.onkeydown = event => {
	if (!loaded) return;
	holdTimer = 0;
	const key = (event.key.length === 1 ? event.key.toUpperCase() : event.key);
	if (menuSelect[0] === MENU.ENTER_SEED) {
		if (key.length === 1 && /[0-9A-F]/i.test(key) && !event.repeat && actionTimer === -1 && newSeed.length < 6) {
			newSeed += key.toUpperCase();
		} else if (key === "Backspace" && !event.repeat && actionTimer === -1) {
			newSeed = newSeed.slice(0, -1);
		} else if (key === "Clear" && !event.repeat && actionTimer === -1) {
			newSeed = "";
		} else if ((key === " " || key === "Enter") && !event.repeat && actionTimer === -1) {
			performAction();
		};
		action = -1;
	} else if (key === "E" && !event.repeat && menuSelect[0] === -1 && actionTimer === -1 && game.turn === TURN.PLAYER) {
		if (game.select[0] === S.CONF_END_TURN) game.select = [S.HAND, game.prevCard];
		else endTurnConfirm();
		action = -1;
	} else if (key === "1" && !event.repeat && menuSelect[0] === -1 && actionTimer === -1) {
		shortcutTo(S.DECK);
	} else if (key === "2" && !event.repeat && menuSelect[0] === -1 && actionTimer === -1) {
		shortcutTo(S.DISCARD);
	} else if (key === "3" && !event.repeat && menuSelect[0] === -1 && actionTimer === -1 && game.void.length) {
		shortcutTo(S.VOID);
	} else if (key === "0" && !event.repeat && menuSelect[0] === -1 && actionTimer === -1) {
		if (game.select[0] === S.CARDS) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.MAP, get.availableLocations().length];
		} else {
			if (game.select[2]) game.select = [S.CARDS, 1, game.select[2]];
			else game.select = [S.CARDS, 1, game.select];
		};
		action = -1;
		actionTimer = 2;
	} else if (key === "C" && !event.repeat && menuSelect[0] === MENU.PREV_GAMES && actionTimer === -1) {
		menuSelect = [MENU.PREV_GAME_SORT, 0, menuSelect];
		action = -1;
		actionTimer = 2;
	} else if (key === "R" && !event.repeat && menuSelect[0] === MENU.PREV_GAMES && actionTimer === -1) {
		menuSelect = [MENU.CONF_REMOVE_PREV_GAME, 1, menuSelect];
		action = -1;
		actionTimer = 2;
	} else if ((key === " " || key === "Enter") && !event.repeat && actionTimer === -1) {
		action = -1;
		performAction();
	} else if (key === "B" && !event.repeat && actionTimer === -1) {
		action = -1;
		performAction(true);
	} else if (key === "W" || key === "ArrowUp") {
		action = DIR.UP;
	} else if (key === "A" || key === "ArrowLeft") {
		action = DIR.LEFT;
	} else if (key === "S" || key === "ArrowDown") {
		action = DIR.DOWN;
	} else if (key === "D" || key === "ArrowRight") {
		action = DIR.RIGHT;
	} else {
		action = -1;
	};
	if (key === "Escape") { // exits fullscreen
		if (document.body.exitFullscreen) {
			document.body.exitFullscreen();
		} else if (document.body.webkitExitFullscreen) {
			document.body.webkitExitFullscreen();
		} else if (document.body.mozExitFullScreen) {
			document.body.mozExitFullScreen();
		} else if (document.body.msExitFullscreen) {
			document.body.msExitFullscreen();
		};
	} else if (key === "Tab") { // enters fullscreen
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
};

document.onkeyup = event => {
	const key = (event.key.length === 1 ? event.key.toUpperCase() : event.key);
	if (key === "W" || key === "ArrowUp" || key === "A" || key === "ArrowLeft" || key === "S" || key === "ArrowDown" || key === "D" || key === "ArrowRight") {
		action = -1;
	};
};
