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

const ID = "Yrahcaz7/Dungeon-of-Souls/save";

/**
 * Saves the game.
 */
function save() {
	if (game) localStorage.setItem(ID + "/0", btoa(JSON.stringify(game)));
	if (global) localStorage.setItem(ID + "/master", btoa(JSON.stringify(global)));
};

/**
 * Returns a fixed enemy type.
 * @param {string} item - the enemy type to fix.
 */
function fixEnemyType(item) {
	if (item == "slime_big") return SLIME.BIG;
	else if (item == "slime_small") return SLIME.SMALL;
	else if (item == "slime_prime") return SLIME.PRIME;
	else return ("" + item).replace("slime_small", SLIME.SMALL);
};

/**
 * Returns a fixed enemy intent.
 * @param {string} item - the enemy intent to fix.
 */
function fixEnemyIntent(item) {
	if (item == "attack") return INTENT.ATTACK;
	else if (item == "defend") return INTENT.DEFEND;
};

/**
 * Fixes a room.
 * @param {Array} item - the room to fix.
 */
function fixRoom(item) {
	if (item[0] == "battle") item[0] = ROOM.BATTLE;
	else if (item[0] == "treasure") item[0] = ROOM.TREASURE;
	else if (item[0] == "battle_prime") item[0] = ROOM.PRIME;
	if (item[3] == "closed") item[3] = false;
	else if (item[3] == "open") item[3] = true;
	if (item[3]?.length) {
		for (let index = 0; index < item[3].length; index++) {
			if (typeof item[3][index] == "string") item[3][index] = fixEnemyType(item[3][index]);
		};
	};
};

/**
 * Returns a fixed selector.
 * @param {string} item - the selector to fix.
 */
function fixSelect(item) {
	if (item == "hand") return HAND;
	else if (item == "lookat_you") return LOOKAT_YOU;
	else if (item == "lookat_enemy") return LOOKAT_ENEMY;
	else if (item == "attack_enemy") return ATTACK_ENEMY;
	else if (item == "looker") return LOOKER;
	else if (item == "help") return HELP;
	else if (item == "end") return END;
	else if (item == "confirm_end") return CONFIRM_END;
	else if (item == "deck") return DECK;
	else if (item == "discard") return DISCARD;
	else if (item == "in_map") return IN_MAP;
	else if (item == "popups") return POPUPS;
	else if (item == "rewards") return REWARDS;
	else if (item == "card_rewards") return CARD_REWARDS;
	else if (item == "artifacts" || item == "map" || item === MAP) return ARTIFACTS;
	else if (item == "void") return VOID;
	else if (item == "confirm_exit") return CONFIRM_EXIT;
	else if (item == "options") return OPTIONS;
	else if (item == "game_over") return GAME_OVER;
	else if (item == "game_fin" || item == "game_won" || item == GAME_WON) return GAME_FIN;
	else if (item == "confirm_restart") return CONFIRM_RESTART;
	else if (item == "welcome") return WELCOME;
	else return -1;
};

/**
 * Fixes the save according to its version number.
 * @param {number} version - The version the save is from.
 */
function fixSave(version) {
	// fix PENDING enemy stage (version: all versions)
	if (game.enemyStage === PENDING) {
		if (game.enemies[game.enemyNum].done) game.enemyStage = ENDING;
		else game.enemyStage = STARTING;
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
	for (const eff in EFFECT) {
		if (EFFECT.hasOwnProperty(eff)) {
			I.icon[EFFECT[eff]] = new Image;
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
