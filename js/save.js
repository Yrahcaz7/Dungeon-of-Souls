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
 * Resets all variables that are not reset on resets otherwise.
 * @param {boolean} prevGamesMenu - Whether to reset the previous games menu. Defaults to `false`.
 */
function resetVars(prevGamesMenu = false) {
	popups = [];
	notif = [-1, 0, "", 0];
	refinableDeck = [];
	winAnim = 0;
	menuSelect = [MENU.MAIN, 1];
	if (prevGamesMenu) {
		menuScroll = 0;
		menuArtifactSelect = 0;
		prevGamesSort = [0, true];
		sortedPrevGames = [];
	};
	newSeed = "";
	actionTimer = -1;
	secret = false;
	action = -1;
	lastAction = -1;
	enemyPos = [];
	handPos = [];
	handSelectPos = [];
	enemyAnim = new EnemyAnimationSource(enemyAnim.idle.length, enemyAnim.enemies);
	menuEnemyAnim = new EnemyAnimationSource(menuEnemyAnim.idle.length, menuEnemyAnim.enemies);
	backAnim = [0, 1.5, 3, 0];
	intentAnim = [0, 1.5, 3, 0.5, 2, 3.5];
	cardAnim = [];
	effAnim = [0, null];
	playerAnim = [0, I.player.idle];
	extraAnim = [];
	transition = 0;
	auraBladeAnim = [0, 3, 6, 1];
	infoPos = 0;
	infoLimit = 0;
	updateRandom();
	changeMusic();
};

/**
 * Resets everything. Use carefully!
 */
async function hardReset() {
	const startTime = Date.now();
	loaded = false;
	game = getStartGameData();
	global = getStartGlobalData();
	fixCanvas(true);
	resetVars();
	loaded = true;
	save();
	console.log("[hard reset done in " + (Date.now() - startTime) + "ms]");
};

/**
 * Ends (and records) the current run.
 * @param {boolean} startNewRun - Whether to start a new run. Defaults to `false`.
 * @param {number} newDifficulty - The difficulty of the next run. Defaults to `game.difficulty`.
 */
async function endRun(startNewRun = false, newDifficulty = game.difficulty) {
	// setup
	loaded = false;
	// record previous run
	let prevGame = {};
	prevGame.character = game.character;
	prevGame.difficulty = game.difficulty;
	prevGame.health = game.health;
	prevGame.floor = game.floor;
	prevGame.gold = game.gold;
	if (game.select[0] === S.GAME_OVER) prevGame.result = GAME_RESULT.DEFEAT;
	else if (game.select[0] === S.GAME_WON) prevGame.result = GAME_RESULT.VICTORY;
	else prevGame.result = GAME_RESULT.SURRENDER;
	prevGame.kills = game.kills;
	prevGame.artifacts = game.artifacts;
	prevGame.cards = game.cards;
	prevGame.seed = game.seed;
	prevGame.startVersion = game.version;
	prevGame.endVersion = global.version;
	prevGame.score = get.totalScore();
	if (prevGame.score > global.highScore && !game.cheat) {
		global.highScore = prevGame.score;
		prevGame.newHighScore = true;
	};
	if (game.cheat) prevGame.cheat = game.cheat;
	if (game.map.length > 0) {
		global.prevGames.push(prevGame);
	};
	// start new run
	game = getStartGameData();
	if (newDifficulty) {
		game.difficulty = newDifficulty;
	};
	if (game.difficulty === prevGame.difficulty) {
		game.select = [-1, 0]; // skip welcome screen
	};
	if (startNewRun) {
		if (newSeed) {
			game.seed = newSeed;
			game.cheat = true;
		};
		resetVars(game.map.length > 0);
		menuSelect = [-1, 0];
		await generateMap(); // sets loaded to true when done
	} else {
		resetVars(game.map.length > 0);
		loaded = true;
	};
	save();
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
	// version 2.2.1
	if (version < 2_002_001) {
		// `game.deck` is now named `game.cards`
		game.cards = game.deck;
		delete game.deck;
		// `game.deckLocal` is now named `game.deck`
		game.deck = game.deckLocal;
		delete game.deckLocal;
	};
	// version 2.2.17
	if (version < 2_002_017) {
		// `game.enemyStage` now always uses `ANIM.STARTING` instead of `-1`
		if (game.enemyStage === -1) game.enemyStage = ANIM.STARTING;
	};
	// version 2.2.20
	if (version < 2_002_020) {
		// it is now impossible to get a card with applied effects in `game.cards`
		for (let index = 0; index < game.cards.length; index++) {
			game.cards[index].eff = {};
		};
	};
	// reset GAME_OVER and GAME_WON screen fade-in (all versions)
	if (game.select[0] === S.GAME_OVER || game.select[0] === S.GAME_WON) game.select[1] = 0;
	// fix in-progress player attack (all versions)
	if (game.enemyAtt[3]) startAnim.player(CARDS[game.enemyAtt[2].id].attackAnim || I.player.attack);
	// fix in-progress enemy attack (all versions)
	if (game.enemyStage === ANIM.PENDING) {
		if (game.enemies[game.enemyNum].done) game.enemyStage = ANIM.ENDING;
		else game.enemyStage = ANIM.STARTING;
	};
	// classify enemies (all versions)
	game.enemies = game.enemies.map(enemy => Enemy.classify(enemy));
	// classify cards (all versions)
	game.cards = game.cards.map(card => Card.classify(card));
	game.deck = game.deck.map(card => Card.classify(card));
	game.hand = game.hand.map(card => Card.classify(card));
	game.discard = game.discard.map(card => Card.classify(card));
	game.void = game.void.map(card => Card.classify(card));
	game.enemyAtt[2] = Card.classify(game.enemyAtt[2]);
	global.prevGames = global.prevGames.map(prevGame => {
		prevGame.cards = prevGame.cards.map(card => Card.classify(card));
		return prevGame;
	});
};

/**
 * Loads the save. Creates a new save if there is no save to load.
 */
async function loadSave() {
	const startTime = Date.now();
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
				// This is kept for compatibility so new saves don't break if people keep their tabs open.
				// If the game version in the tab is from before v2.2.30, it will still use this method.
				// After enough time has passed, this method can be removed. Maybe a month? A year?
				// No one keeps their tabs open for that long, right?
				game.difficulty = obj.difficulty;
				if (obj.seed) game.seed = obj.seed;
				if (obj.cheat) game.cheat = obj.cheat;
			} else {
				let runVersion = obj.version;
				Object.assign(game, obj);
				game.version = runVersion ?? 0;
			};
		} else {
			console.log("no local save found. creating new save...");
		};
	};
	// fix old save
	if (oldVersion) fixSave(oldVersion);
	// save fixed save
	save();
	// log time
	console.log("[save loaded in " + (Date.now() - startTime) + "ms]");
	// setup things based on save
	updateRandom();
	changeMusic();
	if (game.map.length > 0) {
		calculateMapPaths();
		await generateMapPathPoints();
	} else {
		menuSelect = [MENU.MAIN, 1];
	};
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
