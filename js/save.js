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
	if (game) localStorage.setItem(ID + "/v3/run", btoa(JSON.stringify(game)));
	if (global) localStorage.setItem(ID + "/v3/global", btoa(JSON.stringify(global)));
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
	handAnim = [];
	handAnimCards = [];
	handAnimPositions = [];
	handAnimOffsets = [];
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
	fadeMusic();
};

/**
 * Resets everything. Use carefully!
 */
async function hardReset() {
	const startTime = performance.now();
	loaded = false;
	game = getStartGameData();
	global = getStartGlobalData();
	fixCanvas(true);
	resetVars(true);
	loaded = true;
	save();
	console.log("[hard reset done in " + (performance.now() - startTime) + "ms]");
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
	const prevGame = {};
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
	prevGame.score = 0;
	for (const key in game.kills) {
		prevGame.score += game.kills[+key] * ENEMY_WORTH[+key];
	};
	prevGame.score += Math.floor(game.gold / 5);
	if (game.select[0] === S.GAME_WON) prevGame.score += game.health * 5;
	if (game.difficulty) {
		if (hasArtifact(202) && game.kills[FRAGMENT]) prevGame.score *= 3;
		else prevGame.score *= 2;
	};
	if (prevGame.score > global.highScore && !game.cheat) {
		global.highScore = prevGame.score;
		prevGame.newHighScore = true;
	};
	if (game.cheat) prevGame.cheat = game.cheat;
	if (game.map.length > 0) {
		prevGame.num = global.nextGameNum;
		global.nextGameNum++;
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
	if (newSeed) {
		game.seed = newSeed;
		game.cheat = true;
	};
	resetVars(game.map.length > 0);
	if (startNewRun) {
		menuSelect = [-1, 0];
		await generateMap();
	};
	loaded = true;
	save();
};

/**
 * Parses a save. Returns `null` on failure.
 * @param {string | null} str - The save to parse.
 * @returns {Object | null}
 */
function parseSave(str) {
	if (!str) return null;
	try {
		const obj = JSON.parse(atob(str));
		if (obj instanceof Object) return obj;
	} catch (error) {
		console.warn(error);
	};
	return null;
};

/**
 * Loads the save. Creates a new save if there is no save to load.
 */
const loadSave = (() => {
	/**
	 * Fixes the save according to its version number.
	 * @param {number} version - The version the save is from.
	 */
	function fixSave(version) {
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
		for (const key of ["cards", "deck", "hand", "discard", "void"]) {
			game[key] = game[key].map(card => Card.classify(card));
		};
		game.enemyAtt[2] = Card.classify(game.enemyAtt[2]);
		for (const prevGame of global.prevGames) {
			prevGame.cards = prevGame.cards.map(card => Card.classify(card));
		};
	};
	const versionCutoff = 3_000_019;
	let suffix = "";
	let item = "";
	let obj = {};
	/**
	 * Updates `suffix`, `item`, and `obj` according to `newSuffix`.
	 * @param {string} newSuffix 
	 */
	function updateData(newSuffix) {
		suffix = newSuffix;
		item = localStorage.getItem(ID + suffix);
		obj = parseSave(item);
	};
	return async () => {
		const startTime = performance.now();
		let oldVersion = 0;
		let newGlobal = false;
		// load global data
		{
			updateData("/v3/global");
			if (obj) {
				oldVersion = obj.version;
			};
			if (obj && oldVersion >= versionCutoff) {
				obj.version = global.version;
				const defaultOptions = global.options;
				Object.assign(global, obj);
				global.options = defaultOptions;
				Object.assign(global.options, obj.options);
			} else {
				if (!obj) {
					updateData("/master");
				};
				if (obj) {
					if (obj.version) {
						localStorage.setItem(ID + "/old/global", item);
						localStorage.removeItem(ID + suffix);
					} else {
						console.log("global save has no version number. creating new save...");
						newGlobal = true;
					};
				} else {
					console.log("no global save found. creating new save...");
					newGlobal = true;
				};
			};
		};
		// load current run
		if (!newGlobal) {
			updateData("/v3/run");
			if (obj && oldVersion >= versionCutoff) {
				const runVersion = obj.version;
				Object.assign(game, obj);
				game.version = runVersion ?? 0;
			} else {
				if (!obj) {
					updateData("/0");
				};
				if (obj) {
					localStorage.setItem(ID + "/old/run", item);
					localStorage.removeItem(ID + suffix);
				} else {
					console.log("no local save found. creating new save...");
				};
			};
		};
		// fix old save (this isn't called on saves old enough to not have a version number, as those are reset anyway)
		if (oldVersion) fixSave(oldVersion);
		// save fixed save
		save();
		// log time
		console.log("[save loaded in " + (performance.now() - startTime) + "ms]");
		// setup things based on save
		updateRandom();
		changeMusic();
		if (game.map.length > 0) {
			calculateMapPaths();
			await generateMapPathPoints();
			updateHandPos();
		} else {
			menuSelect = [MENU.MAIN, 1];
		};
		if (parseSave(localStorage.getItem(ID + "/old/global")) || parseSave(localStorage.getItem(ID + "/old/run"))) {
			menuSelect = [MENU.OLD_SAVE_ALERT, 0];
		};
	};
})();

document.onvisibilitychange = (() => {
	let musicPausedOnHide = false;
	return () => {
		if (document.hidden) {
			musicPausedOnHide = !musicElement.paused;
			musicElement.pause();
			if (loaded) save();
		} else if (musicPausedOnHide) {
			musicElement.play();
		};
	};
})();
