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

const ID = "Yrahcaz7/Dungeon-of-Souls/save";

/**
 * Saves the game.
 */
function save() {
	if (game) localStorage.setItem(ID + "/0", btoa(JSON.stringify(game)));
	if (global) localStorage.setItem(ID + "/master", btoa(JSON.stringify(global)));
};

/**
 * Resets everything. Use carefully!
 */
function hardReset() {
	for (let index = 0; index < localStorage.length; index++) {
		const key = localStorage.key(index);
		if (key.startsWith(ID)) localStorage.removeItem(key);
	};
	game = null;
	global = null;
	location.reload();
};

/**
 * Restarts the current run.
 */
function restartRun() {
	localStorage.setItem(ID + "/0", btoa(JSON.stringify({difficulty: game.difficulty})));
	game = null;
	location.reload();
};

/**
 * Fixes the save according to its version number.
 * @param {number} version - The version the save is from.
 */
function fixSave(version) {
	// fix ANIM.PENDING enemy stage (all versions)
	if (game.enemyStage === ANIM.PENDING) {
		if (game.enemies[game.enemyNum].done) game.enemyStage = ANIM.ENDING;
		else game.enemyStage = ANIM.STARTING;
	};
	// version 2.1.0
	if (version < 2_001_000) {
		// game.deckPos is renamed to game.deckScroll
		game.deckScroll = game.deckPos;
		delete game.deckPos;
		// game.cardSelect is now a number
		game.cardSelect = 0;
	};
	// version 2.1.4
	if (version < 2_001_004) {
		// game.location is now an array of numbers
		if (game.location == "-1") game.location = [-1];
		else game.location = game.location.split(", ").map(Number);
	};
};

/**
 * Loads the save. Creates a new save if there is no save to load.
 */
function load() {
	let oldVersion = 0, newGlobal = false;
	// load global stuff
	let get = localStorage.getItem(ID + "/master");
	if (get && atob(get) && JSON.parse(atob(get))) {
		let obj = JSON.parse(atob(get));
		if (obj.version) {
			oldVersion = obj.version;
			obj.version = global.version;
			const defaultOptions = global.options;
			Object.assign(global, obj);
			global.options = defaultOptions;
			Object.assign(global.options, obj.options);
		} else {
			console.log("global save has no version number. creating new save...");
			newGlobal = true;
		};
	} else {
		console.log("no global save found. creating new save...");
		newGlobal = true;
	};
	// load current run
	if (!newGlobal) {
		get = localStorage.getItem(ID + "/0");
		if (get && atob(get) && JSON.parse(atob(get))) {
			let obj = JSON.parse(atob(get));
			for (let index = 0; index < obj.enemies?.length; index++) {
				obj.enemies[index] = classifyEnemy(obj.enemies[index]);
			};
			for (let index = 0; index < obj.deck?.length; index++) {
				obj.deck[index] = classifyCard(obj.deck[index]);
			};
			for (let index = 0; index < obj.deckLocal?.length; index++) {
				obj.deckLocal[index] = classifyCard(obj.deckLocal[index]);
			};
			for (let index = 0; index < obj.hand?.length; index++) {
				obj.hand[index] = classifyCard(obj.hand[index]);
			};
			for (let index = 0; index < obj.discard?.length; index++) {
				obj.discard[index] = classifyCard(obj.discard[index]);
			};
			for (let index = 0; index < obj.void?.length; index++) {
				obj.void[index] = classifyCard(obj.void[index]);
			};
			Object.assign(game, obj);
		} else {
			console.log("no local save found. creating new save...");
		};
	};
	// load images
	for (const id in cards) {
		if (cards.hasOwnProperty(id) && cards[id].rarity >= 0) {
			I.card[RARITY[cards[id].rarity]][id] = new Image;
			cardIDs[cards[id].rarity].push(+id);
		};
	};
	for (const id in artifacts) {
		if (artifacts.hasOwnProperty(id)) {
			I.artifact[id] = new Image;
			if (id >= 100 && id < 200) artifactIDs.push(+id);
		};
	};
	for (const eff in EFF) {
		if (EFF.hasOwnProperty(eff)) {
			I.icon[EFF[eff]] = new Image;
		};
	};
	for (const eff in ENEMY_EFF) {
		if (ENEMY_EFF.hasOwnProperty(eff)) {
			I.icon[ENEMY_EFF[eff]] = new Image;
		};
	};
	for (const folder in I) {
		if (I.hasOwnProperty(folder)) {
			loadImage(I, folder, "images/");
		};
	};
	// fix old save
	if (oldVersion) fixSave(oldVersion);
	// save fixed save
	save();
};

window.onbeforeunload = () => {
	if (loaded) save();
};
