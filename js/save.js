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
	for (let index = localStorage.length - 1; index >= 0; index--) {
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
	localStorage.setItem(ID + "/0", btoa(JSON.stringify({difficulty: game.difficulty, newSave: true})));
	game = null;
	location.reload();
};

/**
 * Fixes the save according to its version number.
 * @param {number} version - The version the save is from.
 */
function fixSave(version) {
	// version 2.1.0
	if (version < 2_001_000) {
		// `game.deckPos` is now named `game.deckScroll`
		game.deckScroll = game.deckPos;
		delete game.deckPos;
		// `game.cardSelect` is now a number
		game.cardSelect = 0;
	};
	// version 2.1.4
	if (version < 2_001_004) {
		// `game.location` is now an array of numbers
		if (game.location == "-1") game.location = [-1];
		else game.location = game.location.split(", ").map(Number);
	};
	// version 2.1.13
	if (version < 2_001_013) {
		// cards screen is now its own screen
		if (game.select[0] === S.MAP && game.select[1]) game.select = [S.CARDS, 0];
		else if (game.select[2] && game.select[2][0] === S.MAP && game.select[2][1]) game.select[2] = [S.CARDS, 0];
		// `game.mapSelect` is now a part of `game.select`
		if (game.select[0] === S.MAP) {
			game.select[1] = game.mapSelect;
			delete game.mapSelect;
		} else if (game.select[2] && game.select[2][0] === S.MAP) {
			game.select[2][1] = game.mapSelect;
			delete game.mapSelect;
		} else {
			delete game.mapSelect;
		};
	};
	// version 2.1.15
	if (version < 2_001_015) {
		// enemies in the map syntax with custom power are now arrays
		const fixEnemyArray = arr => {
			if (!(arr instanceof Array)) return;
			for (let index = 0; index < arr.length; index++) {
				if (typeof arr[index] == "string") {
					arr[index] = arr[index].split(", ").map(Number);
				};
			};
		};
		for (let x = 0; x < game.map.length; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (!(game.map[x][y] instanceof Array)) continue;
				fixEnemyArray(game.map[x][y][3]);
			};
		};
		fixEnemyArray(game.room[3]);
	};
	// version 2.1.23
	if (version < 2_001_023) {
		// card effects are now in the `Card.eff` property
		const fixCard = obj => {
			if (!obj.eff) obj.eff = {};
			if (obj[CARD_EFF.COST_REDUCTION]) {
				obj.eff[CARD_EFF.COST_REDUCTION] = obj[CARD_EFF.COST_REDUCTION];
				delete obj[CARD_EFF.COST_REDUCTION];
			};
			if (obj[CARD_EFF.RETENTION]) {
				obj.eff[CARD_EFF.RETENTION] = obj[CARD_EFF.RETENTION];
				delete obj[CARD_EFF.RETENTION];
			};
		};
		for (let index = 0; index < game.hand.length; index++) {
			fixCard(game.hand[index]);
		};
		fixCard(game.enemyAtt[2]);
	};
	// version 2.1.25
	if (version < 2_001_025) {
		// it is now impossible to get a card with applied effects in your non-local deck
		for (let index = 0; index < game.deck.length; index++) {
			game.deck[index].eff = {};
		};
	};
	// reset GAME_OVER and GAME_WON screen fade-in (all versions)
	if (game.select[0] === S.GAME_OVER || game.select[0] === S.GAME_WON) game.select[1] = 0;
	// fix ANIM.PENDING enemy stage (all versions)
	if (game.enemyStage === ANIM.PENDING) {
		if (game.enemies[game.enemyNum].done) game.enemyStage = ANIM.ENDING;
		else game.enemyStage = ANIM.STARTING;
	};
	// classify enemies (all versions)
	for (let index = 0; index < game.enemies.length; index++) {
		game.enemies[index] = Enemy.classify(game.enemies[index]);
	};
	// classify cards (all versions)
	for (let index = 0; index < game.deck.length; index++) {
		game.deck[index] = Card.classify(game.deck[index]);
	};
	for (let index = 0; index < game.deckLocal.length; index++) {
		game.deckLocal[index] = Card.classify(game.deckLocal[index]);
	};
	for (let index = 0; index < game.hand.length; index++) {
		game.hand[index] = Card.classify(game.hand[index]);
	};
	for (let index = 0; index < game.discard.length; index++) {
		game.discard[index] = Card.classify(game.discard[index]);
	};
	for (let index = 0; index < game.void.length; index++) {
		game.void[index] = Card.classify(game.void[index]);
	};
	game.enemyAtt[2] = Card.classify(game.enemyAtt[2]);
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
			if (obj.newSave) {
				game.difficulty = obj.difficulty;
			} else {
				let runVersion = obj.version;
				Object.assign(game, obj);
				if (!runVersion) delete game.version;
				else game.version = runVersion;
			};
		} else {
			console.log("no local save found. creating new save...");
		};
	};
	// load images
	for (const id in CARDS) {
		if (CARDS.hasOwnProperty(id) && CARDS[id].rarity >= 0) {
			I.card[RARITY[CARDS[id].rarity]][id] = new Image;
			CARD_IDS[CARDS[id].rarity].push(+id);
		};
	};
	for (const id in ARTIFACTS) {
		if (ARTIFACTS.hasOwnProperty(id)) {
			I.artifact[id] = new Image;
			if (id >= 100 && id < 200) ARTIFACT_IDS.push(+id);
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

document.onvisibilitychange = (() => {
	let musicPausedOnHide = false;

	return () => {
		if (document.hidden) {
			musicPausedOnHide = !document.getElementById("music").paused;
			document.getElementById("music").pause();
			if (loaded) save();
		} else if (musicPausedOnHide) {
			document.getElementById("music").play();
		};
	};
})();
