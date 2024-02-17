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

const HAND = 300, LOOKAT_YOU = 301, LOOKAT_ENEMY = 302, ATTACK_ENEMY = 303, LOOKER = 304, HELP = 305, END = 306, CONFIRM_END = 307, DECK = 308, DISCARD = 309, MAP = 310, IN_MAP = 311, POPUPS = 312, REWARDS = 313, CARD_REWARDS = 314, ARTIFACTS = 315, VOID = 316, CONFIRM_EXIT = 317, OPTIONS = 318, GAME_OVER = 319, GAME_FIN = 320, GAME_WON = 321, CONFIRM_RESTART = 322, WELCOME = 323, ARTIFACT_REWARDS = 324, CONFIRM_FRAGMENT_UPGRADE = 325, PURIFIER = 326, CONFIRM_PURIFY = 327, CONFIRM_EVENT = 328;

const MENU = {TITLE: 400, DIFFICULTY_CHANGE: 401};

const STATE = {ENTER: 1000, BATTLE: 1001, EVENT_FIN: 1002, GAME_END: 1003, EVENT: 1004};

const TURN = {PLAYER: 1100, ENEMY: 1101};

const PIXEL_SIZES = [1, 2, 0.5];

let global = {
	options: {
		music: true,
		screen_shake: true,
		sticky_cards: false,
		pixel_perfect_screen: false,
		pixel_perfect_size: 1,
		allow_fast_movement: true,
	},
	charStage: {
		knight: 0,
	},
}, game = {
	character: "knight",
	difficulty: 0,
	health: 60,
	shield: 0,
	energy: 3,
	floor: 0,
	gold: 0,
	location: "-1",
	rewards: [],
	state: STATE.ENTER,
	turn: -1,
	select: [WELCOME, 0],
	prevCard: -1,
	cardSelect: [0, 0],
	mapSelect: -1,
	kills: {},
	enemies: [],
	enemyNum: -1,
	enemyStage: -1,
	enemyAtt: [-1, 0, new Card(), false],
	attackEffects: [],
	artifacts: [1],
	deck: [new Card(1000), new Card(1000), new Card(1000), new Card(1000), new Card(2000), new Card(2000), new Card(2000), new Card(2000), new Card(2001), new Card(4000)],
	deckLocal: [],
	deckPos: 0,
	hand: [],
	discard: [],
	void: [],
	eff: {
		aura_blades: 0,
		burn: 0,
		reinforces: 0,
		resilience: 0,
		weakness: 0,
	},
	room: [],
	firstRoom: [],
	map: [],
	traveled: [],
	seed: "" + (Math.round(new Date().getTime() * (Math.random() + 0.001)) % 1000000).toString().randomize(),
}, actionTimer = -1, notif = [-1, 0, "", 0], menuLocation = MENU.TITLE, menuSelect = 0, enemyPos = [], handPos = [], paths = {}, winAnim = 0;

/**
 * Pushes a popup.
 * @param {string} type - the type of the popup.
 * @param {string} description - the description of the popup.
 * @param {string} secondLine - the second line of the popup, if any.
 */
function pushPopup(type, description, secondLine = "") {
	popups.push([type, description, 400, 0, secondLine]);
};

/**
 * Pushes the current music popup.
 */
function musicPopup() {
	let src = "" + document.getElementById("music").src;
	if (!global.options.music) {
		pushPopup("music", "music is off");
	} else if (/Ruins_of_Caelum/.test(src)) {
		pushPopup("music", "Ruins of Caelum");
	};
};

/**
 * Enters the battle.
 */
function enterBattle() {
	game.state = STATE.BATTLE;
	const deck = shuffle(game.deck.slice(0));
	for (let index = 0; index < deck.length; index++) {
		game.deckLocal.push(classifyCard(deck[index]));
	};
	startTurn();
};

/**
 * Starts the player's turn.
 */
function startTurn() {
	// end of enemy turn effects
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].eff.burn) {
			dealDamage(game.enemies[index].eff.burn, 0, index, false);
			game.enemies[index].eff.burn--;
		};
		if (game.enemies[index].eff.weakness) game.enemies[index].eff.weakness--;
	};
	// start of your turn effects
	drawHand();
	game.turn = TURN.PLAYER;
	if (game.eff.reinforces) game.eff.reinforces--;
	else game.shield = 0;
	if (game.eff.resilience) game.eff.resilience--;
	game.energy = get.maxEnergy();
	game.select = [HAND, 0];
	if (playerAnim[1] != "idle" && playerAnim[1] != "hit") startAnim.player("idle");
};

/**
 * Ends the player's turn.
 */
function endTurn() {
	// end of your turn effects
	if (game.hand.length > 0) discardHand();
	cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	notif = [-1, 0, "", 0];
	if (game.eff.burn) {
		takeDamage(game.eff.burn, false);
		game.eff.burn--;
	};
	if (game.eff.weakness) game.eff.weakness--;
	// activate artifacts
	for (let index = 0; index < game.artifacts.length; index++) {
		const func = artifacts[game.artifacts[index]][END_OF_TURN];
		if (typeof func == "function") func();
	};
	// start of enemy turn effects
	game.turn = TURN.ENEMY;
	game.enemyNum = -1;
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].eff.reinforces) game.enemies[index].eff.reinforces--;
		else game.enemies[index].shield = 0;
		if (game.enemies[index].eff.resilience) game.enemies[index].eff.resilience--;
	};
};

/**
 * Ends the player's turn (after a confirmation if the player can still play cards).
 */
function endTurnConfirm() {
	let confirm = false;
	if (game.hand.length >= 1) {
		for (let index = 0; index < game.hand.length; index++) {
			const id = game.hand[index].id;
			if (getCardCost(game.hand[index]) <= game.energy && !cards[id].keywords.includes("unplayable") && (!cards[id].can || cards[id].can())) {
				confirm = true;
				break;
			};
		};
	};
	if (confirm) game.select = [CONFIRM_END, 0];
	else endTurn();
	actionTimer = 2;
};

/**
 * Handles the player's turn.
 */
function playerTurn() {
	// finish attack enemy
	if (game.enemyAtt[3] && playerAnim[1] == "idle") {
		const attCard = cards[game.enemyAtt[2].id];
		if (attCard.target !== false && attCard.damage) {
			if (cards[game.enemyAtt[2].id].keywords.includes("uniform")) dealDamage(attCard.damage, 0.5);
			else dealDamage(attCard.damage);
		};
		if (typeof attCard.attack == "function") attCard.attack();
		game.enemyAtt = [-1, -1, new Card(), false];
		game.attackEffects = [];
	};
	// action timer
	if (actionTimer > -1 || game.enemyAtt[3]) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// attack enemy
	if (action === ENTER && game.select[0] === ATTACK_ENEMY) {
		game.energy -= getCardCost(game.enemyAtt[2]);
		delete game.enemyAtt[2].charge;
		delete game.enemyAtt[2].retention;
		activateAttackEffects(game.enemyAtt[2].id);
		game.enemyAtt[3] = true;
		if (cards[game.enemyAtt[2].id].keywords.includes("one use")) game.void.push(game.hand.splice(game.enemyAtt[0], 1)[0]);
		else game.discard.push(game.hand.splice(game.enemyAtt[0], 1)[0]);
		cardAnim.splice(game.enemyAtt[0], 1);
		cardAnim.push(0);
		game.enemyAtt[0] = -1;
		game.enemyAtt[1] = game.select[1];
		if (game.prevCard) game.select = [HAND, game.prevCard - 1];
		else game.select = [HAND, 0];
		actionTimer = 4;
		return;
	};
	// activate special selection effect
	if (action === ENTER && game.select[0] === SELECT_HAND) {
		if (game.select[1] == -1 || game.select[1] == game.hand.length) {
			game.select = [HAND, game.enemyAtt[0]];
			game.enemyAtt = [-1, -1, new Card(), false];
			actionTimer = 4;
			return;
		} else {
			if (cards[game.enemyAtt[2].id].effect) cards[game.enemyAtt[2].id].effect();
			game.energy -= getCardCost(game.enemyAtt[2]);
			delete game.enemyAtt[2].charge;
			delete game.enemyAtt[2].retention;
			if (cards[game.enemyAtt[2].id].keywords.includes("one use")) game.void.push(game.hand.splice(game.enemyAtt[0], 1)[0]);
			else game.discard.push(game.hand.splice(game.enemyAtt[0], 1)[0]);
			cardAnim.splice(game.enemyAtt[0], 1);
			cardAnim.push(0);
			if (game.enemyAtt[0]) game.select = [HAND, game.enemyAtt[0] - 1];
			else game.select = [HAND, 0];
			game.enemyAtt = [-1, -1, new Card(), false];
			actionTimer = 4;
			return;
		};
	};
	// play card
	if (action === ENTER && game.select[0] === HAND) {
		let selected = game.hand[game.select[1]], id = selected.id;
		if (cards[id].keywords.includes("unplayable")) {
			if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "unplayable", -2];
			else notif = [game.select[1], 0, "unplayable", 0];
			actionTimer = 1;
		} else if (cards[id].can && !cards[id].can()) {
			if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, cards[id].cannotMessage, -2];
			else notif = [game.select[1], 0, cards[id].cannotMessage, 0];
			actionTimer = 1;
		} else if (game.energy >= getCardCost(selected)) {
			if (cards[id].select instanceof Array) { // effects of cards that have a special selection
				game.enemyAtt[0] = game.select[1];
				game.select = [cards[id].select[0], cards[id].select[1]];
				game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
				actionTimer = 4;
			} else if (cards[id].effect) { // effects of cards that activate right away
				cards[id].effect();
				game.energy -= getCardCost(selected);
				delete selected.charge;
				delete selected.retention;
				if (cards[id].keywords.includes("one use")) game.void.push(game.hand.splice(game.select[1], 1)[0]);
				else game.discard.push(game.hand.splice(game.select[1], 1)[0]);
				cardAnim.splice(game.select[1], 1);
				cardAnim.push(0);
				if (game.prevCard) game.select = [HAND, game.prevCard - 1];
				else game.select = [HAND, 0];
				actionTimer = 4;
			} else if (cards[id].damage || cards[id].attack) { // effects of attack cards
				if (cards[id].target === false) {
					game.energy -= getCardCost(selected);
					delete selected.charge;
					delete selected.retention;
					game.enemyAtt[2] = game.hand[game.select[1]];
					activateAttackEffects(id);
					game.enemyAtt[3] = true;
					if (cards[id].keywords.includes("one use")) game.void.push(game.hand.splice(game.select[1], 1)[0]);
					else game.discard.push(game.hand.splice(game.select[1], 1)[0]);
					cardAnim.splice(game.select[1], 1);
					cardAnim.push(0);
					if (game.prevCard) game.select = [HAND, game.prevCard - 1];
					else game.select = [HAND, 0];
					actionTimer = 4;
				} else {
					game.enemyAtt[0] = game.select[1];
					game.select = [ATTACK_ENEMY, game.enemies.length - 1];
					game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
					actionTimer = 4;
				};
			};
		} else {
			if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "not enough energy", -2];
			else notif = [game.select[1], 0, "not enough energy", 0];
			actionTimer = 1;
		};
		return;
	};
};

/**
 * Handles the enemies' turn.
 */
function enemyTurn() {
	if (game.enemyNum == -1) {
		game.enemyNum = 0;
	};
	if (game.enemyNum < game.enemies.length) {
		if (game.enemyStage === ENDING) game.enemies[game.enemyNum].finishAction();
		else if (game.enemyStage === MIDDLE) game.enemies[game.enemyNum].middleAction();
		else if (game.enemyStage !== PENDING) game.enemies[game.enemyNum].startAction();
	};
};

/**
 * Handles all normal selection cases.
 */
function selection() {
	// action timer
	actionTimer--;
	if (actionTimer > -1) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// menus
	if (game.select[0] === WELCOME) {
		if (action === ENTER) {
			game.select = [-1, 0];
			actionTimer = 2;
		};
		return;
	} else if (menuLocation === MENU.TITLE) {
		if (action === ENTER) {
			menuLocation = -1;
			actionTimer = 2;
		} else if (!game.artifacts.includes(0)) {
			if ((action === LEFT && game.difficulty === 1) || (action === RIGHT && game.difficulty === 0)) {
				menuLocation = MENU.DIFFICULTY_CHANGE;
				menuSelect = 1;
				actionTimer = 2;
			};
		};
		return;
	} else if (menuLocation === MENU.DIFFICULTY_CHANGE) {
		if (action === LEFT && menuSelect) {
			menuSelect = 0;
			actionTimer = 1;
		} else if (action === RIGHT && !menuSelect) {
			menuSelect = 1;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (!menuSelect) {
				if (game.difficulty === 0) game.difficulty++;
				else game.difficulty--;
				restartRun();
			} else menuLocation = MENU.TITLE;
			actionTimer = 2;
		};
		return;
	};
	// game end
	if ((game.select[0] === GAME_OVER || game.select[0] === GAME_FIN) && game.select[1] == 50) {
		if (action === ENTER) {
			restartRun();
			actionTimer = 2;
		};
		return;
	};
	// confirmation
	if (game.select[0] === CONFIRM_END) {
		if (action === LEFT && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action === RIGHT && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (!game.select[1]) {
				endTurn();
				game.select = [END, 0];
			} else if (game.hand.length) game.select = [HAND, game.prevCard];
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === CONFIRM_EXIT) {
		if (action === LEFT && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action === RIGHT && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (!game.select[1]) {
				game.select = [MAP, 0];
				pushPopup("go", "go to the map!");
			} else {
				game.select = [REWARDS, game.rewards.length - 1];
			};
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === CONFIRM_RESTART) {
		if (action === LEFT && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action === RIGHT && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (!game.select[1]) {
				restartRun();
				game.select = [OPTIONS, 0];
			} else game.select = [OPTIONS, Object.keys(global.options).length + 2];
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === CONFIRM_FRAGMENT_UPGRADE) {
		if (action === LEFT && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === RIGHT && game.select[1] < 2) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (game.select[1] == 2) {
				game.select = [IN_MAP, 0];
			} else {
				game.location = paths[game.location][game.mapSelect];
				let coor = game.location.split(", ");
				if (game.select[1] == 0) game.artifacts.push(0);
				game.room = game.map[coor[0]][coor[1]];
				game.select = [-1, 0];
				game.mapSelect = -1;
				game.state = STATE.ENTER;
				game.floor++;
			};
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === CONFIRM_PURIFY) {
		if (action === LEFT && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === RIGHT && game.select[1] < 2) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (game.select[1] == 1) {
				game.select = [PURIFIER, 0];
			} else {
				if (game.select[1] == 0) game.deck.splice(game.cardSelect[0] + game.cardSelect[1] * 6, 1);
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 purifier") {
						if (game.select[1] == 0) game.rewards[index] += " - claimed";
						game.select = [REWARDS, index];
						break;
					};
				};
			};
			actionTimer = 2;
		};
		return;
	};
	// rewards
	if (game.select[0] === REWARDS) {
		if ((action === RIGHT || action === DOWN) && game.select[1] < game.rewards.length - 1) {
			game.select[1]++;
			actionTimer = 1;
		} else if ((action === UP || action === LEFT) && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === ENTER) {
			const item = "" + game.rewards[game.select[1]];
			if (!item.endsWith(" - claimed")) {
				let arr = item.split(" ");
				if (arr[1] == "gold") {
					game.gold += +arr[0];
					game.rewards[game.select[1]] += " - claimed";
				} else if (arr[1] == "card") {
					game.select = [CARD_REWARDS, 0];
				} else if (arr[1] == "artifact") {
					game.select = [ARTIFACT_REWARDS, -1];
				} else if (arr[1] == "health") {
					game.health += +arr[0];
					game.rewards[game.select[1]] += " - claimed";
				} else if (arr[1] == "purifier") {
					game.select = [PURIFIER, 0];
				} else if (item == "finish") {
					let bool = false;
					for (let index = 0; index < game.rewards.length; index++) {
						if (!game.rewards[index].endsWith(" - claimed") && game.rewards[index] != "finish") {
							bool = true;
							break;
						};
					};
					if (bool) {
						game.select = [CONFIRM_EXIT, 1];
					} else {
						game.select = [MAP, 0];
						pushPopup("go", "go to the map!");
					};
				};
			};
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === CARD_REWARDS) {
		if (action === RIGHT && game.select[1] < get.cardRewardChoices()) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === LEFT && game.select[1] > -1) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (game.select[1] === -1 || game.select[1] === get.cardRewardChoices()) {
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 card") {
						game.select = [REWARDS, index];
						break;
					};
				};
			} else {
				game.deck.push(new Card(game.room[5][game.select[1]]));
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 card") {
						game.rewards[index] += " - claimed";
						game.select = [REWARDS, index];
						break;
					};
				};
			};
			actionTimer = 2;
		};
		return;
	} else if (game.select[0] === ARTIFACT_REWARDS) {
		if (action === RIGHT && game.select[1] < 3) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === LEFT && game.select[1] > -1) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === ENTER) {
			if (game.select[1] === -1 || game.select[1] === 3) {
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 artifact") {
						game.select = [REWARDS, index];
						break;
					};
				};
			} else {
				const index = game.room[6][game.select[1]];
				const func = artifacts[index][ON_PICKUP];
				if (typeof func == "function") func();
				game.artifacts.push(index);
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 artifact") {
						game.rewards[index] += " - claimed";
						game.select = [REWARDS, index];
						break;
					};
				};
			};
			actionTimer = 2;
		};
		return;
	};
	// map
	if (game.select[0] === IN_MAP && game.state === STATE.EVENT_FIN && paths[game.location]) {
		if ((action === UP || action === RIGHT)) {
			if (game.mapSelect == -1) {
				game.mapSelect = paths[game.location].length - 1;
				actionTimer = 1;
				return;
			} else if (game.mapSelect == 0) {
				game.mapSelect = paths[game.location].length;
				actionTimer = 1;
				return;
			} else if (game.mapSelect < paths[game.location].length) {
				game.mapSelect = game.mapSelect - 1;
				actionTimer = 1;
				return;
			};
		} else if ((action === LEFT || action === DOWN) && game.mapSelect != -1 && (game.mapSelect != paths[game.location].length || game.select[1] == 0)) {
			if (game.mapSelect < paths[game.location].length - 1) {
				game.mapSelect = game.mapSelect + 1;
			} else if (game.mapSelect == paths[game.location].length) {
				game.mapSelect = 0;
			} else {
				game.mapSelect = -1;
			};
			actionTimer = 1;
			return;
		} else if (action === ENTER && paths[game.location][game.mapSelect]) {
			const now = new Date();
			if (game.floor == 9 && game.difficulty === 1 && ((now.getHours() % 12 == 11 && now.getMinutes() >= 59) || (now.getHours() % 12 == 0 && now.getMinutes() <= 1))) {
				game.select = [CONFIRM_FRAGMENT_UPGRADE, 2];
			} else {
				game.location = paths[game.location][game.mapSelect];
				let coor = game.location.split(", ");
				game.room = game.map[coor[0]][coor[1]];
				game.select = [-1, 0];
				game.mapSelect = -1;
				game.state = STATE.ENTER;
				game.floor++;
			};
			actionTimer = 1;
			return;
		};
	} else if (game.select[0] === IN_MAP) {
		const len = (paths[game.location] || []).length;
		if (action === UP || action === RIGHT) {
			if (game.mapSelect == -1) game.mapSelect = len;
		} else if ((action === LEFT || action === DOWN) && (game.mapSelect != len || game.select[1] == 0)) {
			if (game.mapSelect == len) game.mapSelect = -1;
		};
	};
	// event
	if (game.select[0] === CONFIRM_EVENT) {
		const event = getCurrentEvent();
		if (game.select[1] === -1 && action !== -1) {
			game.select[1] = 0;
			actionTimer = 1;
			return;
		} else if (action === UP && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action === DOWN && game.select[1] < event.length - 3) {
			game.select[1]++;
			actionTimer = 1;
			return;
		} else if (action === ENTER && event[game.select[1]]) {
			let next = 10000 + event[game.select[1] + 2][1];
			game.turn = (typeof next == "function" ? next() : next);
			getCurrentEvent()[0]();
			if (game.select[0] === CONFIRM_EVENT) game.select[1] = -1;
			actionTimer = 2;
			return;
		};
	};
	// select extras
	if (action === UP && game.select[0] === LOOKAT_ENEMY) {
		game.select = [LOOKER, 0];
		actionTimer = 1;
		return;
	};
	// select / deselect player and more extras
	if (action === UP && game.select[0] === LOOKAT_YOU) {
		game.select = [MAP, 0];
		actionTimer = 1;
		return;
	} else if (action === UP && game.select[0] === VOID && !game.select[1]) {
		if (popups[0]) game.select = [POPUPS, 0];
		else if (!game.enemies.length) game.select = [LOOKER, 0];
		else game.select = [LOOKAT_ENEMY, 0];
		actionTimer = 1;
		return;
	} else if ((action === RIGHT || action === DOWN) && game.select[0] === VOID && !game.select[1]) {
		game.select = [DISCARD, 0];
		actionTimer = 1;
		return;
	} else if (action === UP && game.select[0] === DISCARD && !game.select[1]) {
		if (game.void.length) game.select = [VOID, 0];
		else if (popups[0]) game.select = [POPUPS, 0];
		else if (!game.enemies.length) game.select = [LOOKER, 0];
		else game.select = [LOOKAT_ENEMY, 0];
		actionTimer = 1;
		return;
	} else if (action === LEFT) {
		if (game.select[0] === HAND && !game.select[1]) {
			game.select = [LOOKAT_YOU, 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] === VOID && !game.select[1]) {
			if (!game.enemies.length) game.select = [LOOKAT_YOU, 0];
			else if (!game.hand[0]) game.select = [LOOKAT_ENEMY, 0];
			else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		} else if (game.select[0] === DISCARD && !game.select[1]) {
			if (game.void.length) game.select = [VOID, 0];
			else if (!game.enemies.length) game.select = [LOOKAT_YOU, 0];
			else if (!game.hand[0]) game.select = [LOOKAT_ENEMY, 0];
			else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		};
	} else if (action === RIGHT) {
		if (game.select[0] === LOOKAT_YOU) {
			if (!game.enemies.length) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else if (!game.hand[0]) game.select = [LOOKAT_ENEMY, game.enemies.length - 1];
			else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		} else if (game.select[0] === HAND && game.select[1] == game.hand.length - 1) {
			if (popups[0]) {
				game.select = [POPUPS, 0];
			} else {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			};
			actionTimer = 1;
			return;
		};
	};
	if (action === UP || action === RIGHT) {
		if (game.select[0] === DECK && !game.select[1]) {
			game.select = [END, 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] === END) {
			game.select = [LOOKAT_YOU, 0];
			actionTimer = 1;
			return;
		};
	} else if (action === LEFT || action === DOWN) {
		if (game.select[0] === END) {
			game.select = [DECK, 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] === LOOKAT_YOU) {
			game.select = [END, 0];
			actionTimer = 1;
			return;
		};
	};
	// popup selection
	if (game.select[0] === POPUPS) {
		if (popups.length == 0) {
			if (!game.hand.length) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else game.select = [HAND, game.prevCard];
			return;
		} else if (game.select[1] >= popups.length) {
			game.select[1] = popups.length - 1;
			return;
		} else if (action === UP) {
			if (game.select[1] >= popups.length - 1 || game.select[1] >= 6) {
				game.select = [LOOKER, 0];
			} else {
				game.select[1]++;
			};
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			if (!game.select[1]) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else {
				game.select[1]--;
			};
			actionTimer = 1;
			return;
		} else if (action === LEFT) {
			if (!game.hand.length) game.select = [LOOKAT_YOU, 0];
			else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		} else if (action === ENTER) {
			popups.splice(game.select[1], 1);
			if (popups.length == 0) {
				if (!game.hand.length) {
					if (game.void.length) game.select = [VOID, 0];
					else game.select = [DISCARD, 0];
				} else game.select = [HAND, game.prevCard];
			} else if (game.select[1] > 0) {
				game.select[1]--;
			};
			actionTimer = 1;
			return;
		};
	};
	// deck selection
	if (((game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD || (game.select[0] === IN_MAP && game.mapSelect == (paths[game.location] || []).length)) && game.select[1]) || game.select[0] === PURIFIER) {
		let coor = game.cardSelect, len = game.deckLocal.length;
		if (game.select[0] === VOID) len = game.void.length;
		else if (game.select[0] === DISCARD) len = game.discard.length;
		else if (game.select[0] === IN_MAP || game.select[0] === PURIFIER) len = game.deck.length;
		if (action === LEFT) {
			if (coor[0] > 0) {
				game.cardSelect[0]--;
			} else if (coor[1] > 0) {
				game.cardSelect[0] = 5;
				game.cardSelect[1]--;
			};
			actionTimer = 1;
			return;
		} else if (action === RIGHT && (coor[0] < (len - 1) % 6 || coor[1] < Math.floor(len / 6))) {
			if (coor[0] < 5) {
				game.cardSelect[0]++;
			} else if (coor[0] + (coor[1] * 6) < len - 1) {
				game.cardSelect[0] = 0;
				game.cardSelect[1]++;
			};
			actionTimer = 1;
			return;
		} else if (action === UP && coor[1] > 0) {
			game.cardSelect[1]--;
			actionTimer = 1;
			return;
		} else if (action === DOWN && coor[1] < Math.floor(len / 6) && (coor[0] < len % 6 || coor[1] < Math.floor(len / 6) - 1)) {
			game.cardSelect[1]++;
			actionTimer = 1;
			return;
		};
	};
	// activate purifier
	if (action === ENTER && game.select[0] === PURIFIER) {
		game.select = [CONFIRM_PURIFY, 1];
		actionTimer = 2;
		return;
	};
	// activate / deactivate extras
	if (action === ENTER && (game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD)) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === MAP) {
		game.select = [IN_MAP, 0];
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === IN_MAP && game.mapSelect == -1) {
		game.select = [MAP, 0];
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === IN_MAP && game.mapSelect == (paths[game.location] || []).length) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === LOOKER) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === HELP) {
		if (game.select[1] <= 2) game.select[1]++;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === OPTIONS && game.select[1] <= 1) {
		if (game.select[1] === 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action === ENTER && game.select[0] === END && game.turn === TURN.PLAYER) {
		endTurnConfirm();
		return;
	};
	// scrolling
	if (action === UP && game.select[0] === HELP && infPos > 0 && infLimit > 0) infPos -= 11;
	else if (action === DOWN && game.select[0] === HELP && infPos < infLimit) infPos += 11;
	// select options
	if (game.select[0] === OPTIONS) {
		if (action === UP && game.select[1] > 1) {
			game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action === DOWN && game.select[1] > 0 && game.select[1] - 2 < Object.keys(global.options).length) {
			game.select[1]++;
			actionTimer = 1;
			return;
		} else if (action === ENTER) {
			const option = Object.keys(global.options)[game.select[1] - 2];
			if (option == "pixel_perfect_size") {
				let index = PIXEL_SIZES.indexOf(global.options.pixel_perfect_size) + 1;
				if (index >= PIXEL_SIZES.length) index = 0;
				global.options.pixel_perfect_size = PIXEL_SIZES[index];
			} else if (option) {
				global.options[option] = !global.options[option];
			} else {
				game.select = [CONFIRM_RESTART, 1];
			};
			if (option == "music") {
				if (global.options.music) document.getElementById("music").play();
				else document.getElementById("music").pause();
				musicPopup();
			} else if (option == "pixel_perfect_screen" || option == "pixel_perfect_size") {
				if (global.options.pixel_perfect_screen) document.getElementById("canvas").style = "width: " + (800 * global.options.pixel_perfect_size) + "px";
				else document.getElementById("canvas").style = "";
				fixCanvas();
			};
			actionTimer = 2;
			return;
		};
	};
	// deselect extras
	if ((game.select[0] === LOOKER || game.select[0] === HELP || game.select[0] === OPTIONS || game.select[0] === MAP) && !game.select[1]) {
		if (action === LEFT && game.select[0] === LOOKER) {
			if (game.artifacts.length) game.select = [ARTIFACTS, game.artifacts.length - 1];
			else game.select = [MAP, 0];
			actionTimer = 1;
			return;
		} else if (action === LEFT && game.select[0] === HELP) {
			game.select = [LOOKER, 0];
			actionTimer = 1;
			return;
		} else if (action === LEFT && game.select[0] === OPTIONS) {
			game.select = [HELP, 0];
			actionTimer = 1;
			return;
		} else if (action === RIGHT && game.select[0] === LOOKER) {
			game.select = [HELP, 0];
			actionTimer = 1;
			return;
		} else if (action === RIGHT && game.select[0] === MAP) {
			if (game.artifacts.length) game.select = [ARTIFACTS, 0];
			else game.select = [LOOKER, 0];
			actionTimer = 1;
			return;
		} else if (action === RIGHT && game.select[0] === HELP) {
			game.select = [OPTIONS, 0];
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			if (game.select[0] === MAP) game.select = [LOOKAT_YOU, 0];
			else if (popups.length) game.select = [POPUPS, popups.length - 1];
			else if (!game.enemies.length) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else game.select = [LOOKAT_ENEMY, 0];
			actionTimer = 1;
			return;
		};
	};
	// artifacts
	if (game.select[0] === ARTIFACTS) {
		if (action === LEFT) {
			if (game.select[1] === 0) game.select = [MAP, 0];
			else game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action === RIGHT) {
			if (game.select[1] === game.artifacts.length - 1) game.select = [LOOKER, 0];
			else game.select[1]++;
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			game.select = [LOOKAT_YOU, 0];
			actionTimer = 1;
			return;
		};
		if (game.select[1] < 0) game.select[1] = 0;
		else if (game.select[1] >= game.artifacts.length - 1) game.select[1] = game.artifacts.length - 1;
	};
	// select hand
	if (game.select[0] === -1) game.select = [HAND, 0];
	// cards in hand
	if (game.select[0] === HAND) {
		if (!game.hand) {
			game.select = [END, 0];
		} else {
			if (action === LEFT) {
				game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action === RIGHT) {
				game.select[1]++;
				actionTimer = 1;
				return;
			} else if (action === UP) {
				let to = -1, distance = -1;
				for (let index = 0; index < game.enemies.length; index++) {
					if (enemyPos[index][1] > distance) {
						distance = enemyPos[index][1];
						to = index;
					};
				};
				for (let index = 0; index < game.enemies.length; index++) {
					if (enemyPos[index][0] < distance) {
						distance = enemyPos[index][0];
						to = index;
					};
				};
				game.select = [LOOKAT_ENEMY, to];
				actionTimer = 1;
				return;
			};
			if (game.select[1] < 0) game.select[1] = 0;
			else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
		};
	};
	// hand selection from effect
	if (game.select[0] === SELECT_HAND) {
		if (action === LEFT && game.select[1] >= 0) {
			game.select[1]--;
			if (game.select[1] == game.enemyAtt[0]) game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action === RIGHT && game.select[1] < game.hand.length) {
			game.select[1]++;
			if (game.select[1] == game.enemyAtt[0]) game.select[1]++;
			actionTimer = 1;
			return;
		};
	};
	// select enemy
	if (game.select[0] === ATTACK_ENEMY || game.select[0] === LOOKAT_ENEMY) {
		if (action === LEFT) {
			if (game.select[1] < game.enemies.length - 1) game.select[1]++;
			else game.select = [LOOKAT_YOU, 0];
			actionTimer = 1;
			return;
		} else if (action === RIGHT) {
			if (game.select[1]) game.select[1]--;
			else if (game.void.length) game.select = [VOID, 0];
			else game.select = [DISCARD, 0];
			actionTimer = 1;
			return;
		} else if (action === DOWN && game.select[0] === LOOKAT_ENEMY) {
			if (!game.hand[0]) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		};
	};
};

/**
 * Handles the gameplay.
 */
function manageGameplay() {
	// update data
	updateData();
	// actions
	if (game.turn === TURN.PLAYER) playerTurn();
	// end battle
	if (game.state === STATE.BATTLE && !game.enemies.length) {
		// normal stuff
		if (game.hand.length > 0) discardHand();
		cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		notif = [-1, 0, "", 0];
		game.select = [REWARDS, 0];
		game.state = STATE.EVENT_FIN;
		game.turn = -1;
		// activate artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			const func = artifacts[game.artifacts[index]][END_OF_BATTLE];
			if (typeof func == "function") func();
		};
		// set rewards
		game.rewards = [];
		if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
		if (get.cardRewardChoices() > 0) game.rewards.push("1 card");
		if (game.room[0] === ROOM.PRIME || game.room[0] === ROOM.BOSS) {
			if (game.room[6]) {
				for (let index = 0; index < game.room[6].length; index++) {
					if (game.artifacts.includes(game.room[6][index])) {
						game.room[6][index] = randomArtifact(game.artifacts.concat(game.room[6]));
					};
				};
				game.rewards.push("1 artifact");
			};
		};
		game.rewards.push("finish");
	};
	// load room
	if (game.state === STATE.ENTER) {
		// clear effects
		for (const effect in game.eff) {
			if (Object.hasOwnProperty.call(game.eff, effect)) {
				game.eff[effect] = 0;
			};
		};
		// reset things
		game.rewards = [];
		game.energy = get.maxEnergy();
		game.shield = 0;
		game.hand = [];
		game.deckLocal = [];
		game.discard = [];
		game.void = [];
		game.enemies = [];
		// enter room
		const place = game.location.split(", ");
		const type = (game.location == "-1" ? ROOM.BATTLE : game.map[place[0]][place[1]][0]);
		if (type === ROOM.BATTLE || type === ROOM.PRIME || type === ROOM.BOSS) {
			primeAnim = 0;
			if (game.location == "-1") game.room = game.firstRoom;
			else game.traveled.push(+place[1]);
			for (let index = 0; index < game.room[3].length; index++) {
				const enemy = game.room[3][index];
				if (typeof enemy == "string") {
					const item = enemy.split(", ");
					game.enemies.push(new Enemy(+item[0], +item[1]));
				} else {
					game.enemies.push(new Enemy(+enemy));
				};
			};
			enterBattle();
		} else if (type === ROOM.TREASURE) {
			game.traveled.push(+place[1]);
			game.map[place[0]][place[1]][3] = true;
			game.select = [REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [];
			if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
			if (get.cardRewardChoices() > 0) game.rewards.push("1 card");
			game.rewards.push("finish");
		} else if (type === ROOM.ORB) {
			game.traveled.push(+place[1]);
			game.select = [REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [Math.floor(get.maxHealth() * 0.5) + " health", "1 purifier", "finish"];
		} else if (type === ROOM.EVENT) {
			game.traveled.push(+place[1]);
			game.select = [CONFIRM_EVENT, -1];
			game.state = STATE.EVENT;
			game.turn = 10000;
		};
	};
	// update data again
	updateData();
	// enemy actions
	if (game.turn === TURN.ENEMY) enemyTurn();
};

/**
 * Handles the visuals of the game.
 */
function updateVisuals() {
	// bugs
	if (!canvas || !ctx) return;
	// clear
	clearCanvas();
	// update data
	updateData();
	// visuals
	graphics.backgrounds();
	if (menuLocation !== -1) {
		graphics.middleLayer();
		draw.image(title, (400 - title.width) / 2, 0);
		if (game.artifacts.includes(0) && game.floor == 10) draw.lore(200 - 2, 53, "Secret Act: When the Hands Align", {"color": "#f44", "text-align": CENTER});
		else draw.lore(200 - 2, 53, "Act 1: The Hands of Time", {"color": "#f44", "text-align": CENTER});
		if (new Date().getTime() % 1500 >= 700) draw.lore(200 - 2, 131, "PRESS START", {"color": "#fff", "text-align": CENTER});
		if (game.difficulty === undefined) game.difficulty = 0;
		draw.imageSector(difficulty, 0, game.difficulty * 16, 64, 16, 168, 146);
		if (game.artifacts.includes(0)) {
			if (game.floor == 10 && transition < 100) {
				ctx.globalAlpha = transition / 100;
			};
			draw.imageSector(difficulty, 0, 2 * 16, 64, 16, 168, 146);
			ctx.globalAlpha = 1;
		};
		if (game.select[0] === WELCOME) {
			draw.box(80, 83, 240, 34);
			if (game.difficulty === 0) draw.lore(200 - 2, 84, "Hello there! Welcome to my game!<s>Use the arrow keys or WASD keys to select things.\nPress enter or the space bar to perform an action.\nFor information on how to play, go to the '?' at the top-right of the screen.\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": CENTER});
			else draw.lore(200 - 2, 84, "Hello there! Welcome to <#f00>hard mode!</#f00><s>In hard mode, enemies start a lot stronger from the beginning.\nAdditionally, the enemies get more powerful twice as fast as easy mode.\nOtherwise, this is the same as easy mode... or is it?\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": CENTER});
		} else if (menuLocation === MENU.DIFFICULTY_CHANGE) {
			let x = 116, y = 83;
			draw.rect("#0008");
			draw.box(x + 1, y + 1, 166, 26);
			if (game.difficulty === 0) draw.lore(x + 2, y + 2, "Are you sure you want to change the difficulty to hard?\nThis will also reset your current run.", {"text-small": true});
			else draw.lore(x + 2, y + 2, "Are you sure you want to change the difficulty to easy?\nThis will also reset your current run.", {"text-small": true});
			if (!menuSelect) draw.rect("#fff", x + 1, y + 13, 23, 14);
			else draw.rect("#fff", x + 23, y + 13, 17, 14);
			draw.box(x + 3, y + 15, 19, 10);
			draw.box(x + 25, y + 15, 13, 10);
			draw.lore(x + 4, y + 16, "YES");
			draw.lore(x + 26, y + 16, "NO");
		};
		if (game.artifacts.includes(0) && game.floor == 10 && transition < 100) transition++;
		return;
	};
	if (!hidden()) {
		graphics.player();
		graphics.enemy();
		graphics.effect();
	};
	graphics.middleLayer();
	graphics.foregrounds();
	if (!hidden()) {
		if (game.select[0] === SELECT_HAND) graphics.hand_select();
		else graphics.hand();
	};
	if (game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY) {
		graphics.rewards(false);
		graphics.deck(game.deck);
	};
	if (game.select[0] === IN_MAP) {
		graphics.map();
	} else if (game.select[0] === CONFIRM_EVENT) {
		graphics.event();
	} else if (game.select[0] === REWARDS) {
		graphics.rewards();
	} else if (game.select[0] === CARD_REWARDS) {
		graphics.cardRewards();
	} else if (game.select[0] === ARTIFACT_REWARDS) {
		graphics.artifactRewards();
	} else if (game.select[0] === HELP && game.select[1]) {
		graphics.info();
	} else if (game.select[0] === OPTIONS && game.select[1]) {
		graphics.options();
	} else if (game.select[0] === DECK && game.select[1]) {
		graphics.deck(game.deckLocal.slice(0).cardSort());
	} else if (game.select[0] === VOID && game.select[1]) {
		graphics.deck(game.void);
	} else if (game.select[0] === DISCARD && game.select[1]) {
		graphics.deck(game.discard);
	};
	if (game.select[0] === IN_MAP && game.select[1]) {
		graphics.deck(game.deck);
	};
	if (!hidden()) {
		graphics.target();
	};
	if (game.select[0] === CONFIRM_END) {
		let x = 140, y = 86;
		draw.rect("#0008");
		draw.box(x + 1, y + 1, 118, 20);
		draw.lore(x + 2, y + 2, "Are you sure you want to end your turn?", {"text-small": true});
		if (!game.select[1]) draw.rect("#fff", x + 1, y + 7, 23, 14);
		else draw.rect("#fff", x + 23, y + 7, 17, 14);
		draw.box(x + 3, y + 9, 19, 10);
		draw.box(x + 25, y + 9, 13, 10);
		draw.lore(x + 4, y + 10, "YES");
		draw.lore(x + 26, y + 10, "NO");
	} else if (game.select[0] === CONFIRM_EXIT) {
		graphics.rewards(false);
		let x = 122, y = 83;
		draw.rect("#0008");
		draw.box(x + 1, y + 1, 154, 26);
		draw.lore(x + 2, y + 2, "Are you sure you want to finish collecting rewards?\nThere are still rewards left unclaimed.", {"text-small": true});
		if (!game.select[1]) draw.rect("#fff", x + 1, y + 13, 23, 14);
		else draw.rect("#fff", x + 23, y + 13, 17, 14);
		draw.box(x + 3, y + 15, 19, 10);
		draw.box(x + 25, y + 15, 13, 10);
		draw.lore(x + 4, y + 16, "YES");
		draw.lore(x + 26, y + 16, "NO");
	} else if (game.select[0] === CONFIRM_RESTART) {
		graphics.options(false);
		let x = 123, y = 83;
		draw.rect("#0008");
		draw.box(x + 1, y + 1, 152, 26);
		draw.lore(x + 2, y + 2, "Are you sure you want to restart your current run?\nThe map will also be different next time.", {"text-small": true});
		if (!game.select[1]) draw.rect("#fff", x + 1, y + 13, 23, 14);
		else draw.rect("#fff", x + 23, y + 13, 17, 14);
		draw.box(x + 3, y + 15, 19, 10);
		draw.box(x + 25, y + 15, 13, 10);
		draw.lore(x + 4, y + 16, "YES");
		draw.lore(x + 26, y + 16, "NO");
	} else if (game.select[0] === CONFIRM_FRAGMENT_UPGRADE) {
		graphics.map();
		let x = 125, y = 83;
		draw.rect("#0008");
		draw.box(x + 1, y + 1, 148, 26);
		draw.lore(x + 2, y + 2, "Are you sure you want to align the hands of time?\nYou will regret it. There is no going back.", {"text-small": true});
		if (game.select[1] == 0) draw.rect("#fff", x + 1, y + 13, 23, 14);
		else if (game.select[1] == 1) draw.rect("#fff", x + 23, y + 13, 17, 14);
		else draw.rect("#fff", x + 39, y + 13, 29, 14);
		draw.box(x + 3, y + 15, 19, 10);
		draw.box(x + 25, y + 15, 13, 10);
		draw.box(x + 41, y + 15, 25, 10);
		draw.lore(x + 4, y + 16, "YES");
		draw.lore(x + 26, y + 16, "NO");
		draw.lore(x + 42, y + 16, "BACK");
	} else if (game.select[0] === CONFIRM_PURIFY) {
		let x = 99, y = 83;
		draw.rect("#0008");
		draw.box(x + 1, y + 1, 200, 26);
		draw.lore(x + 2, y + 2, "Are you sure you want to destroy the card " + cards[game.deck[game.cardSelect[0] + game.cardSelect[1] * 6].id].name.title() + "?\nIf you have multiple, this will only destroy one copy of the card.", {"text-small": true});
		if (game.select[1] == 0) draw.rect("#fff", x + 1, y + 13, 23, 14);
		else if (game.select[1] == 1) draw.rect("#fff", x + 23, y + 13, 17, 14);
		else draw.rect("#fff", x + 39, y + 13, 29, 14);
		draw.box(x + 3, y + 15, 19, 10);
		draw.box(x + 25, y + 15, 13, 10);
		draw.box(x + 41, y + 15, 25, 10);
		draw.lore(x + 4, y + 16, "YES");
		draw.lore(x + 26, y + 16, "NO");
		draw.lore(x + 42, y + 16, "BACK");
	};
	graphics.popups();
	if (game.select[0] === GAME_OVER) {
		ctx.globalAlpha = game.select[1] / 64;
		if (game.select[1] < 50) game.select[1]++;
		draw.rect("#000");
		const factors = get.scoreFactors();
		let text = "GAME OVER\n\nDIFFICULTY: ";
		if (game.artifacts.includes(0)) text += "<#fcf050>DETERMINATION</#fcf050>";
		else if (game.difficulty) text += "HARD";
		else text += "EASY";
		text += "\n\nTOP FLOOR: " + game.floor;
		let len = factors.length;
		if (game.difficulty) len += 4;
		draw.lore(200 - 2, 100 - (len + 17) * 2.75, text, {"color": "#f00", "text-align": CENTER});
		draw.lore(200 - 2, 100 + (len + 15) * 2.75, "PRESS ENTER TO START A NEW RUN", {"color": "#f00", "text-align": CENTER});
		text = "";
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][0] + ":\n";
		};
		if (game.difficulty) {
			if (game.artifacts.includes(0) && game.kills[FRAGMENT]) text += "\nbase score:\n\n<#fcf050>DETERMINATION</#fcf050> bonus:\n\ntotal score:";
			else text += "\nbase score:\n\n<#0f0>hard difficulty bonus:</#0f0>\n\ntotal score:";
		} else {
			text += "\ntotal score:";
		};
		draw.lore(125, 100 - (len - 7) * 2.75, text, {"color": "#f00", "text-small": true});
		text = "";
		let totalScore = 0;
		for (let index = 0; index < factors.length; index++) {
			if (factors[index][1] == 1) {
				text += "1 point\n";
				totalScore++;
			} else {
				text += factors[index][1] + " points\n";
				totalScore += factors[index][1];
			};
		};
		if (game.difficulty) {
			text += "\n" + totalScore + " points";
			if (game.artifacts.includes(0) && game.kills[FRAGMENT]) {
				totalScore *= 3;
				text += "\n\n<#fcf050>3x multiplier</#fcf050>";
			} else {
				totalScore *= 2;
				text += "\n\n<#0f0>2x multiplier</#0f0>";
			};
			text += "\n\n" + totalScore + " points";
		} else {
			text += "\n" + totalScore + " points";
		};
		draw.lore(275, 100 - (len - 7) * 2.75, text, {"color": "#f00", "text-align": LEFT, "text-small": true});
		ctx.globalAlpha = 1;
	} else if (game.select[0] === GAME_FIN) {
		if (game.select[1] < 50) {
			ctx.globalAlpha = game.select[1] / 50;
			game.select[1]++;
		};
		draw.rect("#000");
		draw.image(victorious, 168, 42 + Math.round(Math.abs(winAnim - 4) - 2), victorious.width * 2, victorious.height * 2);
		winAnim += Math.random() * 0.05 + 0.05;
		if (winAnim >= 8) winAnim -= 8;
		draw.rect("#0004");
		const factors = get.scoreFactors();
		let text = "YOU BEAT THE GAME ";
		if (game.artifacts.includes(0)) text += "<#fcf050>WITH DETERMINATION</#fcf050>";
		else if (game.difficulty) text += "ON <#f00>HARD MODE!</#f00>";
		else text += "ON EASY MODE!";
		text += "\n\nThank you for playing!\n\nMore content is coming soon!";
		let len = factors.length;
		if (game.difficulty) len += 4;
		draw.lore(200 - 2, 100 - (len + 17) * 2.75, text, {"color": "#0f0", "text-align": CENTER});
		draw.lore(200 - 2, 100 + (len + 15) * 2.75, "PRESS ENTER TO START A NEW RUN", {"color": "#0f0", "text-align": CENTER});
		text = "";
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][0] + ":\n";
		};
		if (game.difficulty) {
			if (game.artifacts.includes(0)) text += "\nbase score:\n\n<#fcf050>DETERMINATION</#fcf050> bonus:\n\ntotal score:";
			else text += "\nbase score:\n\n<#f00>hard difficulty bonus:</#f00>\n\ntotal score:";
		} else {
			text += "\ntotal score:";
		};
		draw.lore(125, 100 - (len - 7) * 2.75, text, {"color": "#0f0", "text-small": true});
		text = "";
		let totalScore = 0;
		for (let index = 0; index < factors.length; index++) {
			if (factors[index][1] == 1) {
				text += "1 point\n";
				totalScore++;
			} else {
				text += factors[index][1] + " points\n";
				totalScore += factors[index][1];
			};
		};
		if (game.difficulty) {
			text += "\n" + totalScore + " points";
			if (game.artifacts.includes(0)) {
				totalScore *= 3;
				text += "\n\n<#fcf050>3x multiplier</#fcf050>";
			} else {
				totalScore *= 2;
				text += "\n\n<#f00>2x multiplier</#f00>";
			};
			text += "\n\n" + totalScore + " points";
		} else {
			text += "\n" + totalScore + " points";
		};
		draw.lore(275, 100 - (len - 7) * 2.75, text, {"color": "#0f0", "text-align": LEFT, "text-small": true});
		ctx.globalAlpha = 1;
	};
	if (game.artifacts.includes(0) && game.floor == 10 && transition < 100) transition++;
};

const gameloop = setInterval(() => {
	// check for bugs
	if (!canvas || !ctx) {
		canvasData();
		if (!canvas || !ctx) {
			console.error("Canvas not loaded properly. Please reload page if problem persists.");
			return;
		};
	};
	// normal things
	if (loaded) {
		// gameplay
		if (menuLocation === -1) manageGameplay();
		// selection
		selection();
		// visuals
		if (screenShake > 0) {
			if (global.options.screen_shake) {
				clearCanvas();
				ctx.save();
				ctx.translate((Math.random() - 0.5) * Math.min(screenShake, 10), (Math.random() - 0.5) * Math.min(screenShake, 10));
				screenShake--;
			} else {
				screenShake = 0;
			};
		};
		updateVisuals();
		ctx.restore();
		// save
		save();
	};
}, 100), musicloop = setInterval(() => {
	if (document.getElementById("music")) {
		let time = document.getElementById("music").currentTime;
		if (global.options.music) {
			if (time === 0 && menuLocation === -1) {
				document.getElementById("music").play();
			} else if (time > document.getElementById("music").duration - 0.1) {
				document.getElementById("music").currentTime = 0;
			};
		};
	};
}, 2);
