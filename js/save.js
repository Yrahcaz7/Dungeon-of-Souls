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

function save() {
	if (game) localStorage.setItem(ID + "/" + game.saveNum, btoa(JSON.stringify(game)));
	if (global) localStorage.setItem(ID + "/master", btoa(JSON.stringify(global)));
};

function fixEnemyType(item) {
	if (item == "slime_big") return SLIME.BIG;
	else if (item == "slime_small") return SLIME.SMALL;
	else if (item == "slime_prime") return SLIME.PRIME;
	else return ("" + item).replace("slime_small", SLIME.SMALL);
};

function fixEnemyIntent(item) {
	if (item == "attack") return ATTACK;
	else if (item == "defend") return DEFEND;
};

function fixRoom(item) {
	if (item[0] == "battle") item[0] = BATTLEROOM;
	else if (item[0] == "treasure") item[0] = TREASUREROOM;
	else if (item[0] == "battle_prime") item[0] = PRIMEROOM;
	if (item[3] == "closed") item[3] = false;
	else if (item[3] == "open") item[3] = true;
	if (item[3]?.length) {
		for (let index = 0; index < item[3].length; index++) {
			if (typeof item[3][index] == "string") item[3][index] = fixEnemyType(item[3][index]);
		};
	};
};

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
	else if (item == "game_fin") return GAME_FIN;
	else if (item == "game_won") return GAME_WON;
	else if (item == "confirm_restart") return CONFIRM_RESTART;
	else if (item == "welcome") return WELCOME;
	else return -1;
};

// fixes old saves
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
			if (game.map[row][col]) fixRoom(game.map[row][col]);
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
	// save again
	save();
};

function load(saveNum = 0) {
	if (saveNum !== 0 && !loaded) {
		console.log("game not finished loading. please wait and try again.");
		return;
	};
	let get = localStorage.getItem(ID + "/" + saveNum), reSave = false;
	if (get && atob(get) && JSON.parse(atob(get))) {
		let obj = JSON.parse(atob(get));
		for (let index = 0; index < obj.enemies.length; index++) {
			obj.enemies[index] = classifyEnemy(obj.enemies[index]);
		};
		for (let index = 0; index < obj.deck.length; index++) {
			obj.deck[index] = new Card(obj.deck[index].id, obj.deck[index].level);
		};
		for (let index = 0; index < obj.deckLocal.length; index++) {
			obj.deckLocal[index] = new Card(obj.deckLocal[index].id, obj.deckLocal[index].level);
		};
		for (let index = 0; index < obj.hand.length; index++) {
			obj.hand[index] = new Card(obj.hand[index].id, obj.hand[index].level);
		};
		for (let index = 0; index < obj.discard.length; index++) {
			obj.discard[index] = new Card(obj.discard[index].id, obj.discard[index].level);
		};
		for (let index = 0; index < obj.void.length; index++) {
			obj.void[index] = new Card(obj.void[index].id, obj.void[index].level);
		};
		Object.assign(game, obj);
		if (saveNum !== 0) {
			localStorage.setItem(ID + "/" + game.saveNum, localStorage.getItem(ID + "/0"));
			game.saveNum = 0;
			save();
		};
	} else if (!get && game) {
		console.log("no local save found. creating new save...");
		reSave = true;
	} else {
		console.warn("the following is not a valid local save: " + get);
		console.log("terminating process.");
	};
	get = localStorage.getItem(ID + "/master");
	if (get && atob(get) && JSON.parse(atob(get))) {
		get = JSON.parse(atob(get));
		Object.assign(global, get);
	} else if (!get && global) {
		console.log("no global save found. creating new save...");
		reSave = true;
	} else {
		console.warn("the following is not a valid global save: " + get);
		console.log("terminating process.");
	};
	if (reSave) save();
	fixSave();
};

window.onbeforeunload = () => {
	if (loaded) save();
};
