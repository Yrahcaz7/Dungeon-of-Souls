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
	if (item == "attack") return ATTACK;
	else if (item == "defend") return DEFEND;
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
	else if (item == "map") return MAP;
	else if (item == "in_map") return IN_MAP;
	else if (item == "popups") return POPUPS;
	else if (item == "rewards") return REWARDS;
	else if (item == "card_rewards") return CARD_REWARDS;
	else if (item == "artifacts") return ARTIFACTS;
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
 * Fixes the save if it is old.
 */
function fixSave() {
	// fix enemy attack
	if (game.activeCard !== undefined || game.enemyAttSel !== undefined || game.enemyAttFin !== undefined) {
		game.enemyAtt = [game.activeCard, game.enemyAttSel, game.enemyAtt, game.enemyAttFin];
		delete game.activeCard;
		delete game.enemyAttSel;
		delete game.enemyAttFin;
	};
	// fix enemies
	for (let index = 0; index < game.enemies.length; index++) {
		if (typeof game.enemies[index].type == "string") game.enemies[index].type = fixEnemyType(game.enemies[index].type);
		if (typeof game.enemies[index].intent == "string") game.enemies[index].intent = fixEnemyIntent(game.enemies[index].intent);
		for (let pos = 0; pos < game.enemies[index].intentHistory.length; pos++) {
			if (typeof game.enemies[index].intentHistory[pos] == "string") game.enemies[index].intentHistory[pos] = fixEnemyIntent(game.enemies[index].intentHistory[pos]);
		};
	};
	// fix rooms
	for (let row = 0; row < game.map.length; row++) {
		for (let col = 0; col < game.map[row].length; col++) {
			if (typeof game.map[row][col] == "object") fixRoom(game.map[row][col]);
		};
	};
	if (game.firstRoom) fixRoom(game.firstRoom);
	if (game.room) fixRoom(game.room);
	// fix attack effect
	if (game.attackEffect) {
		if (game.attackEffect == "aura blade") game.attackEffects = [AURA_BLADE];
		delete game.attackEffect;
	};
	// fix selector
	if (typeof game.select[0] == "string") game.select[0] = fixSelect(game.select[0]);
	if (typeof game.select[2] == "string") game.select[2][0] = fixSelect(game.select[2][0]);
	// fix enemy stage
	if (game.enemyStage == "pending") game.enemyStage = PENDING;
	else if (game.enemyStage == "middle") game.enemyStage = MIDDLE;
	else if (game.enemyStage == "end" || game.enemyStage === END) game.enemyStage = ENDING;
	else if (game.enemyStage == "none") game.enemyStage = -1;
	// fix state
	if (game.state == "enter") game.state = STATE.ENTER;
	else if (game.state == "battle") game.state = STATE.BATTLE;
	else if (game.state == "event_fin") game.state = STATE.EVENT_FIN;
	else if (game.state == "game_over" || game.state == "game_won" || game.state == "game_fin") game.state = STATE.GAME_END;
	// fix turn
	if (game.turn == "player") game.turn = TURN.PLAYER;
	else if (game.turn == "enemy") game.turn = TURN.ENEMY;
	else if (game.turn == "none") game.turn = -1;
	// fix artifacts
	for (let index = 0; index < game.artifacts.length; index++) {
		if (game.artifacts[index] == "iron will") {
			game.artifacts[index] = 1;
		};
	};
	// delete unused vars
	delete game.cardRewardChoices;
	delete game.saveNum;
	// fix PENDING enemy stage
	if (game.enemyStage === PENDING) {
		if (game.enemies[game.enemyNum].done) game.enemyStage = ENDING;
		else game.enemyStage = STARTING;
	};
	// fix difficulty
	if (global.difficulty !== undefined) {
		game.difficulty = global.difficulty;
		delete global.difficulty;
	};
	// fix character
	if (game.character == "knight") {
		game.character = CHARACTER.KNIGHT;
	};
	// fix charStage stage
	if (global.charStage.knight !== undefined) {
		global.charStage[CHARACTER.KNIGHT] = global.charStage.knight;
		delete global.charStage.knight;
	};
	// fix options
	let options = {music: OPTION.MUSIC, screen_shake: OPTION.SCREEN_SHAKE, sticky_cards: OPTION.STICKY_CARDS, pixel_perfect_screen: OPTION.PIXEL_PERFECT_SCREEN, pixel_perfect_size: OPTION.PIXEL_PERFECT_SIZE, allow_fast_movement: OPTION.ALLOW_FAST_MOVEMENT};
	for (const option in options) {
		if (Object.hasOwnProperty.call(options, option)) {
			if (global.options[option] !== undefined) {
				global.options[options[option]] = global.options[option];
				delete global.options[option];
			};
		};
	};
	// fix player effects
	if (game.eff.aura_blades !== undefined) {
		game.eff[EFFECT.AURA_BLADE] = game.eff.aura_blades;
		delete game.eff.aura_blades;
	};
	if (game.eff.burn !== undefined) {
		game.eff[EFFECT.BURN] = game.eff.burn;
		delete game.eff.burn;
	};
	if (game.eff.reinforces !== undefined) {
		game.eff[EFFECT.REINFORCE] = game.eff.reinforces;
		delete game.eff.reinforces;
	};
	if (game.eff.resilience !== undefined) {
		game.eff[EFFECT.RESILIENCE] = game.eff.resilience;
		delete game.eff.resilience;
	};
	if (game.eff.weakness !== undefined) {
		game.eff[EFFECT.WEAKNESS] = game.eff.weakness;
		delete game.eff.weakness;
	};
	// fix card effects
	for (let index = 0; index < game.hand.length; index++) {
		if (game.hand[index].retention !== undefined) {
			game.hand[index][CARD_EFF.RETENTION] = game.hand[index].retention;
			delete game.hand[index].retention;
		};
		if (game.hand[index].charge !== undefined) {
			game.hand[index][CARD_EFF.COST_REDUCTION] = game.hand[index].charge;
			delete game.hand[index].charge;
		};
	};
	// fix enemy effects
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].eff.burn !== undefined) {
			game.enemies[index].eff[EFFECT.BURN] = game.enemies[index].eff.burn;
			delete game.enemies[index].eff.burn;
		};
		if (game.enemies[index].eff.resilience !== undefined) {
			game.enemies[index].eff[EFFECT.RESILIENCE] = game.enemies[index].eff.resilience;
			delete game.enemies[index].eff.resilience;
		};
		if (game.enemies[index].eff.countdown !== undefined) {
			game.enemies[index].eff[ENEMY_EFF.COUNTDOWN] = game.enemies[index].eff.countdown;
			delete game.enemies[index].eff.countdown;
		};
		if (game.enemies[index].eff.rewinds !== undefined) {
			game.enemies[index].eff[ENEMY_EFF.REWIND] = game.enemies[index].eff.rewinds;
			delete game.enemies[index].eff.rewinds;
		};
		if (game.enemies[index].eff.shroud !== undefined) {
			game.enemies[index].eff[ENEMY_EFF.SHROUD] = game.enemies[index].eff.shroud;
			delete game.enemies[index].eff.shroud;
		};
	};
	// save the fixed save
	save();
};

/**
 * Loads the save. Creates a new save if there is no save to load.
 */
function load() {
	// load current run
	let get = localStorage.getItem(ID + "/0");
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
	// load global stuff
	get = localStorage.getItem(ID + "/master");
	if (get && atob(get) && JSON.parse(atob(get))) {
		get = JSON.parse(atob(get));
		const defaultOptions = global.options;
		Object.assign(global, get);
		global.options = defaultOptions;
		Object.assign(global.options, get.options);
	} else {
		console.log("no global save found. creating new save...");
	};
	// load images
	for (const id in cards) {
		if (Object.hasOwnProperty.call(cards, id) && cards[id].rarity >= 0) {
			I.card[RARITY[cards[id].rarity]][id] = new Image;
		};
	};
	for (const id in artifacts) {
		if (Object.hasOwnProperty.call(artifacts, id)) {
			I.artifact[id] = new Image;
		};
	};
	for (const eff in EFFECT) {
		if (Object.hasOwnProperty.call(EFFECT, eff)) {
			I.icon[EFFECT[eff]] = new Image;
		};
	};
	for (const eff in ENEMY_EFF) {
		if (Object.hasOwnProperty.call(ENEMY_EFF, eff)) {
			I.icon[ENEMY_EFF[eff]] = new Image;
		};
	};
	for (const folder in I) {
		if (Object.hasOwnProperty.call(I, folder)) {
			loadImage(I, folder, "images/");
		};
	};
	// fix old save
	fixSave();
};

window.onbeforeunload = () => {
	if (loaded) save();
};
