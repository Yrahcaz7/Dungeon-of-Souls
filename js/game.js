/*
	Dungeon of Souls
	Copyright (C) 2022 Yrahcaz7

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	if ((!min && min !== 0) || (!max && max !== 0)) return NaN;
	if (min > max) [min, max] = [max, min];
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function chance(chance = 0.5) {
	return Math.random()<chance;
};

function round(number, places = 0) {
	places = 10 ** places;
	return Math.round(number * places) / places;
};

function mapPiece(row, attribute = "none") {
	if (attribute == "1stbattle") return ["battle", 0, 0, ["slime_small"], randomInt(25 + (row * 1.5), 50 + (row * 2)), [randomCard(true), randomCard(true), randomCard(true), randomCard(true), randomCard(true)]];
	let type = chance()?"battle":false;
	let result = [type, randomInt(-5, 5), randomInt(-5, 5)];
	if (!type) return false;
	if (type == "battle") {
		if (row >= 5) result.push(chance()?["slime_big"]:(chance(7/10)?["slime_big", "slime_small, " + round(0.5 + (row * 0.05), 2)]:["slime_small", "slime_small, " + round(0.75 + (row * 0.05), 2)]));
		else result.push(chance()?["slime_big"]:["slime_small", "slime_small, " + round(0.75 + (row * 0.05), 2)]);
		result.push(randomInt(25 + (row * 1.5), 50 + (row * 2)), [randomCard(true), randomCard(true), randomCard(true), randomCard(true), randomCard(true)]);
	};
	return result;
};

var global = {
	unlockedCards: ["aura blade", "everlasting shield", "reinforce"],
	options: {
		music: true,
		stickyCards: false,
	},
	charStage: {
		knight: 0,
	},
}, game = {
	character: "knight",
	health: 60,
	maxHealth: 60,
	shield: 0,
	maxShield: 60,
	floor: 0,
	location: "-1",
	rewards: {},
	cardRewardChoices: 3,
	gold: 0,
	state: "enter",
	turn: "none",
	select: ["none", 0],
	cardSelect: [0, 0],
	mapSelect: "exit",
	mapOn: -1,
	enemyAtt: "none",
	enemyAttSel: 0,
	enemyAttFin: false,
	energy: 3,
	maxEnergy: 3,
	enemies: [],
	enemyPos: [],
	enemyIndex: 0,
	enemyNum: 0,
	enemyStage: "none",
	artifacts: ["iron will"],
	deck: [new Card("reinforce"), new Card("aura blade"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("block"), new Card("block"), new Card("block"), new Card("block")],
	deckLocal: [new Card("reinforce"), new Card("aura blade"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("slash"), new Card("block"), new Card("block"), new Card("block"), new Card("block")],
	deckProxy: "",
	deckPos: 0,
	deckMove: "none",
	hand: [],
	handSize: 5,
	handPos: [],
	prevCard: -1,
	activeCard: -1,
	discard: [],
	auraBlades: 0,
	auraBladePos: [[65, 10], [80, 25], [40, 0], [25, 35]],
	reinforces: 0,
	attackEffect: "none",
	room: "none",
	firstRoom: mapPiece(0, "1stbattle"),
	map: [
		[false, mapPiece(1), mapPiece(1), mapPiece(1), mapPiece(1), false],
		[mapPiece(2), mapPiece(2), mapPiece(2), mapPiece(2), mapPiece(2), mapPiece(2)],
		[mapPiece(3), mapPiece(3), mapPiece(3), mapPiece(3), mapPiece(3), mapPiece(3)],
		[mapPiece(4), mapPiece(4), mapPiece(4), mapPiece(4), mapPiece(4), mapPiece(4)],
		[mapPiece(5), mapPiece(5), mapPiece(5), mapPiece(5), mapPiece(5), mapPiece(5)],
		[mapPiece(6), mapPiece(6), mapPiece(6), mapPiece(6), mapPiece(6), mapPiece(6)],
		[mapPiece(7), mapPiece(7), mapPiece(7), mapPiece(7), mapPiece(7), mapPiece(7)],
		[mapPiece(8), mapPiece(8), mapPiece(8), mapPiece(8), mapPiece(8), mapPiece(8)],
	],
	paths: {},
	saveNum: 0,
}, actionTimer = -1, notif = [-1, 0, "", 0], hide = (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck" || game.select[0] == "map") && game.select[1], firstTick = true;

function hardReset() {
	localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save/0");
	game = null;
	location.reload();
};

function musicPopups() {
	let src = document.getElementById("music").src;
	if (!global.options.music) {
		showPopup("music", "music is off");
	} else if (src.includes("Ruins_of_Caelum.mp3")) {
		showPopup("music", "Ruins of Caelum");
	};
};

function randomize(array) {
	let index = array.length, randomIndex;
	while (index != 0) {
		randomIndex = Math.floor(Math.random() * index);
		index--;
		[array[index], array[randomIndex]] = [array[randomIndex], array[index]];
	};
	return array;
};

function shuffleDeck(...newCards) {
	if (newCards) {
		for (let card of newCards) {
			if (card instanceof Object) game.deckLocal.push(card);
			else game.deckLocal.push(new Card("" + card));
		};
	};
	game.deckLocal = randomize(game.deckLocal);
};

function drawHand() {
	let index = 0, len = game.deckLocal.length;
	if (game.deckLocal.length) {
		for (; index < game.handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
	if (index != game.handSize) {
		len = game.discard.length;
		for (let a = 0; a < len; a++) {
			game.deckLocal.push(game.discard[a]);
		};
		game.discard = [];
		shuffleDeck();
		len = game.deckLocal.length;
		for (; index < game.handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
};

function enterBattle() {
	game.state = "battle";
	game.deckLocal = randomize(game.deck).slice(0);
	game.hand = [];
	game.discard = [];
	game.shield = 0;
	game.auraBlades = 0;
	game.reinforces = 0;
	startTurn();
};

function startTurn() {
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].reinforces) {
			game.enemies[index].reinforces--;
		} else {
			game.enemies[index].shield = 0;
		};
	};
	drawHand();
	game.turn = "player";
	if (game.reinforces) {
		game.reinforces--;
	} else {
		game.shield = 0;
	};
	game.energy = game.maxEnergy;
	game.select = ["hand", 0];
	if (playerAnim[1] != "idle") {
		startAnim.player("idle");
	};
};

function endTurn() {
	if (game.hand.length >= 1) {
		let iteration = 0;
		for (let index = 0; index < game.hand.length; iteration++) {
			game.discard.push(game.hand[index]);
			game.hand.splice(index, 1);
			if (iteration >= 100) break;
		};
	};
	game.turn = "enemy";
};

function playerTurn() {
	// action timer
	if (actionTimer > -1) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// attack enemy
	if (action == "enter" && game.select[0] == "attack_enemy") {
		if (game.enemyAtt.name == "slash") {
			game.energy--;
			startAnim.player("attack");
		};
		if (game.auraBlades) {
			game.auraBlades--;
			game.attackEffect = "aura blade";
		} else {
			game.attackEffect = "none";
		};
		game.enemyAttFin = true;
		game.discard.push(game.hand[game.activeCard]);
		game.hand.splice(game.activeCard, 1);
		game.enemyAttSel = game.select[1];
		if (game.prevCard) game.select = ["hand", game.prevCard - 1];
		else game.select = ["hand", 0];
		actionTimer = 4;
		return;
	};
	if (game.enemyAttFin) {
		let damage = 0, shield = game.enemies[game.enemyAttSel].shield;
		if (game.enemyAtt.name == "slash") {
			damage = 5;
		};
		if (game.attackEffect == "aura blade") {
			damage += 6 + game.auraBlades;
		};
		if (shield > damage) {
			game.enemies[game.enemyAttSel].shield -= damage;
			damage = 0;
		} else if (shield) {
			game.enemies[game.enemyAttSel].shield = 0;
			damage -= shield;
		};
		game.enemies[game.enemyAttSel].health -= damage;
		game.enemyAtt = "none";
		game.enemyAttFin = false;
		actionTimer = 1;
		return;
	};
	// play card
	if (action == "enter" && game.select[0] == "hand") {
		let selected = game.hand[game.select[1]], name = selected.name;
		if (selected.unplayable) {
			if (game.hand[game.select[1]].rarity == "rare") notif = [game.select[1], 0, "unplayable", -2];
			else notif = [game.select[1], 0, "unplayable", 0];
			actionTimer = 1;
		} else if (game.energy >= selected.energyCost) {
			let activate = true;
			// effects of cards that activate right away
			if (name == "block") {
				game.shield += 4;
			} else if (name == "reinforce") {
				game.shield += 1;
				game.reinforces++;
			} else if (name == "everlasting shield") {
				game.reinforces += 3;
			} else if (name == "aura blade") {
				game.auraBlades++;
			} else if (name == "war cry") {
				startAnim.effect("war cry");
				for (let index = 0; index < game.enemies.length; index++) {
					game.enemies[index].intent = "defend";
					game.enemies[index].intentHistory.push("defend");
				};
			} else {
				activate = false;
			};
			if (activate) {
				game.energy -= selected.energyCost;
				game.discard.push(game.hand[game.select[1]]);
				game.hand.splice(game.select[1], 1);
				if (game.prevCard) game.select = ["hand", game.prevCard - 1];
				else game.select = ["hand", 0];
				actionTimer = 2;
			} else if (selected.type == "attack") {
				game.activeCard = game.select[1];
				game.select = ["attack_enemy", game.enemies.length - 1];
				game.enemyAtt = game.hand[game.activeCard];
				actionTimer = 5;
			};
		} else {
			if (game.hand[game.select[1]].rarity == "rare") notif = [game.select[1], 0, "not enough energy", -2];
			else notif = [game.select[1], 0, "not enough energy", 0];
			actionTimer = 1;
		};
		return;
	};
};

function enemyTurn() {
	if (game.enemyNum >= game.enemies.length) {
		game.enemyNum = 0;
		startTurn();
	};
	let num = game.enemyNum;
	for (let a = 0; a < game.enemies.length; a++) {
		let ref = game.enemies[a];
		if (ref instanceof Enemy) continue;
		ref.location = a;
		game.enemies[a] = new Enemy(undefined, undefined, ref);
		console.log("refresh enemy " + a);
	};
	if (game.enemyStage == "end") game.enemies[num].finishAction();
	else if (game.enemyStage == "middle") game.enemies[num].middleAction();
	else if (game.enemyStage != "pending") game.enemies[num].startAction();
};

function selection() {
	// action timer
	actionTimer--;
	if (actionTimer > -1) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// confirmation
	if (game.select[0] == "confirm_end") {
		if (action == "left" && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action == "right" && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action == "enter") {
			if (!game.select[1]) endTurn();
			game.select = ["end", 0];
			actionTimer = 2;
		};
		return;
	};
	// map
	if (game.select[0] == "in_map" && game.state == "battle_fin") {
		if (action == "up" && game.mapSelect == "exit") {
			game.mapOn = game.paths[game.location].length - 1;
			game.mapSelect = game.paths[game.location][game.mapOn];
			actionTimer = 1;
			return;
		} else if (action == "up" && game.mapSelect != "seed-on") {
			if (game.mapOn) {
				game.mapOn = game.mapOn - 1;
				game.mapSelect = game.paths[game.location][game.mapOn];
			} else {
				game.mapOn = -1;
				game.mapSelect = "seed";
			};
			actionTimer = 1;
			return;
		} else if (action == "left" && game.mapSelect == "seed") {
			game.mapOn = 0;
			game.mapSelect = game.paths[game.location][0];
			actionTimer = 1;
			return;
		} else if (action == "left" && game.mapSelect != "exit" && game.mapSelect != "seed-on" && game.floor) {
			game.mapOn = -1;
			game.mapSelect = "exit";
			actionTimer = 1;
			return;
		} else if (action == "right" && game.mapSelect == "exit" && game.floor) {
			game.mapOn = game.paths[game.location].length - 1;
			game.mapSelect = game.paths[game.location][game.mapOn];
			actionTimer = 1;
			return;
		} else if (action == "down" && game.mapSelect == "seed") {
			game.mapOn = 0;
			game.mapSelect = game.paths[game.location][0];
			actionTimer = 1;
			return;
		} else if (action == "down" && game.mapSelect != "exit" && game.mapSelect != "seed-on") {
			if (game.mapOn < game.paths[game.location].length - 1) {
				game.mapOn = game.mapOn + 1;
				game.mapSelect = game.paths[game.location][game.mapOn];
			} else {
				game.mapOn = -1;
				game.mapSelect = "exit";
			};
			actionTimer = 1;
			return;
		} else if (action == "enter" && game.mapSelect == "seed-on") {
			game.mapSelect = "seed";
			actionTimer = 1;
			return;
		} else if (action == "enter" && game.mapSelect == "seed") {
			game.mapSelect = "seed-on";
			actionTimer = 1;
			return;
		} else if (action == "enter" && game.mapSelect != "exit") {
			game.location = game.mapSelect;
			let coor = game.mapSelect.split(", ");
			game.room = game.map[coor[0]][coor[1]];
			game.select = ["none", 0];
			game.mapSelect = "exit";
			game.state = "enter";
			game.floor++;
			actionTimer = 1;
			return;
		};
	} else {
		if (game.select[0] == "in_map") {
			if ((action == "up" || action == "right") && game.mapSelect == "exit") {
				game.mapSelect = "seed";
				actionTimer = 1;
				return;
			} else if ((action == "left" || action == "down") && game.mapSelect == "seed") {
				game.mapSelect = "exit";
				actionTimer = 1;
				return;
			} else if (action == "enter" && game.mapSelect == "seed-on") {
				game.mapSelect = "seed";
				actionTimer = 1;
				return;
			} else if (action == "enter" && game.mapSelect == "seed") {
				game.mapSelect = "seed-on";
				actionTimer = 1;
				return;
			}
		};
		game.mapOn = -1;
	};
	// select hand
	if (game.select[0] == "none") game.select = ["hand", 0];
	// select extras
	if (action == "up" && game.select[0] == "lookat_enemy") {
		game.select = ["music", 0];
		actionTimer = 1;
		return;
	};
	// select / deselect player and more extras
	if (action == "up" && game.select[0] == "lookat_you") {
		game.select = ["map", 0];
		actionTimer = 1;
		return;
	} else if (action == "up" && game.select[0] == "discard" && !game.select[1]) {
		if (popups[0]) game.select = ["popups", 0];
		else if (!game.enemies.length) game.select = ["music", 0];
		else game.select = ["lookat_enemy", 0];
		actionTimer = 1;
		return;
	} else if (action == "left") {
		if (game.select[0] == "hand" && !game.select[1]) {
			game.select = ["lookat_you", 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "discard" && !game.select[1]) {
			if (!game.enemies.length) game.select = ["lookat_you", 0];
			else if (!game.hand[0]) game.select = ["lookat_enemy", 0];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		};
	} else if (action == "right") {
		if (game.select[0] == "lookat_you") {
			if (!game.enemies.length) game.select = ["discard", 0];
			else if (!game.hand[0]) game.select = ["lookat_enemy", game.enemies.length - 1];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "hand" && game.select[1] == game.hand.length - 1) {
			if (popups[0]) {
				game.select = ["popups", 0];
			} else {
				game.select = ["discard", 0];
			};
			actionTimer = 1;
			return;
		};
	};
	if (action == "up" || action == "right") {
		if (game.select[0] == "deck" && !game.select[1]) {
			game.select = ["end", 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "end") {
			game.select = ["lookat_you", 0];
			actionTimer = 1;
			return;
		};
	} else if (action == "left" || action == "down") {
		if (game.select[0] == "end") {
			game.select = ["deck", 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "lookat_you") {
			game.select = ["end", 0];
			actionTimer = 1;
			return;
		};
	};
	// popup selection
	if (game.select[0] == "popups") {
		if (popups.length == 0) {
			if (!game.hand.length) game.select = ["discard", 0];
			else game.select = ["hand", game.prevCard];
			return;
		} else if (game.select[1] >= popups.length) {
			game.select[1] = popups.length - 1;
			return;
		} else if (action == "up") {
			if (game.select[1] >= popups.length - 1 || game.select[1] >= 6) {
				game.select = ["music", 0];
			} else {
				game.select[1]++;
			};
			actionTimer = 1;
			return;
		} else if (action == "down") {
			if (!game.select[1]) {
				game.select = ["discard", 0];
			} else {
				game.select[1]--;
			};
			actionTimer = 1;
			return;
		} else if (action == "left") {
			if (!game.hand.length) game.select = ["lookat_you", 0];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		} else if (action == "enter") {
			popups.splice(game.select[1], 1);
			if (popups.length == 0) {
				if (!game.hand.length) game.select = ["discard", 0];
				else game.select = ["hand", game.prevCard];
			} else if (game.select[1] > 0) {
				game.select[1]--;
			};
			actionTimer = 1;
			return;
		};
	};
	// deck selection
	if ((game.select[0] == "deck" || game.select[0] == "discard") && game.select[1]) {
		let coor = game.cardSelect, len = game.deckLocal.length;
		if (game.select[0] == "discard") len = game.discard.length;
		if (action == "left") {
			if (coor[0] > 0) {
				game.cardSelect[0]--;
			} else if (coor[1] > 0) {
				game.cardSelect[0] = 5;
				game.cardSelect[1]--;
				game.deckMove = "up";
			};
			actionTimer = 1;
			return;
		} else if (action == "right" && (coor[0] < (len - 1) % 6 || coor[1] < Math.floor(len / 6))) {
			if (coor[0] < 5) {
				game.cardSelect[0]++;
			} else if (coor[0] + (coor[1] * 6) < len - 1) {
				game.cardSelect[0] = 0;
				game.cardSelect[1]++;
				game.deckMove = "down";
			};
			actionTimer = 1;
			return;
		} else if (action == "up" && coor[1] > 0) {
			game.cardSelect[1]--;
			game.deckMove = "up";
			actionTimer = 1;
			return;
		} else if (action == "down" && coor[1] < Math.floor(len / 6) && (coor[0] < len % 6 || coor[1] < Math.floor(len / 6) - 1)) {
			game.cardSelect[1]++;
			game.deckMove = "down";
			actionTimer = 1;
			return;
		};
	};
	// activate / deactivate extras
	if (action == "enter" && (game.select[0] == "looker" || game.select[0] == "deck" || game.select[0] == "discard")) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "map") {
		game.select = ["in_map", 0];
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "in_map" && game.mapSelect == "exit") {
		game.select = ["map", 0];
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "help") {
		if (game.select[1] <= 2) game.select[1]++;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "music") {
		if (global.options.music) {
			document.getElementById("music").pause();
			global.options.music = false;
		} else {
			document.getElementById("music").play();
			global.options.music = true;
		};
		musicPopups();
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "end" && game.turn == "player") {
		let confirm = false;
		if (game.hand.length >= 1) {
			for (let a = 0; a < game.hand.length; a++) {
				if (game.hand[a].energyCost <= game.energy) {
					confirm = true;
					break;
				};
			};
		};
		if (confirm) game.select = ["confirm_end", 0];
		else endTurn();
		actionTimer = 2;
		return;
	};
	// scrolling
	if (action == "up" && game.select[0] == "help" && infPos > 0 && infLimit > 0) {
		infPos -= infLimit / 6 + 0.5;
	} else if (action == "down" && game.select[0] == "help") {
		if (infPos < infLimit) infPos += infLimit / 6 + 0.5;
		else infPos = infLimit;
	};
	// deselect extras
	if ((game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "music" || game.select[0] == "map") && !game.select[1]) {
		if (action == "left" && game.select[0] == "music") {
			if (game.artifacts.length) game.select = ["artifacts", game.artifacts.length - 1];
			else game.select = ["map", 0];
			actionTimer = 1;
			return;
		} else if (action == "left" && game.select[0] == "looker") {
			game.select = ["music", 0];
			actionTimer = 1;
			return;
		} else if (action == "left" && game.select[0] == "help") {
			game.select = ["looker", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "music") {
			game.select = ["looker", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "map") {
			if (game.artifacts[0]) game.select = ["artifacts", 0];
			else game.select = ["music", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "looker") {
			game.select = ["help", 0];
			actionTimer = 1;
			return;
		} else if (action == "down") {
			if (game.select[0] == "map") game.select = ["lookat_you", 0];
			else if (popups.length) game.select = ["popups", popups.length - 1];
			else if (!game.enemies.length) game.select = ["discard", 0];
			else game.select = ["lookat_enemy", 0];
			actionTimer = 1;
			return;
		};
	};
	// artifacts
	if (game.select[0] == "artifacts") {
		if (action == "left") {
			if (game.select[1] == 0) game.select = ["map", 0];
			else game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action == "right") {
			if (game.select[1] == game.artifacts.length - 1) game.select = ["music", 0];
			else game.select[1]++;
			actionTimer = 1;
			return;
		} else if (action == "down") {
			game.select = ["lookat_you", 0];
			actionTimer = 1;
			return;
		};
		if (game.select[1] < 0) game.select[1] = 0;
		else if (game.select[1] >= game.artifacts.length - 1) game.select[1] = game.artifacts.length - 1;
	};
	// select card
	if (game.select[0] == "hand") {
		if (!game.hand) {
			game.select = ["end", 0];
		} else {
			if (action == "left") {
				game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action == "right") {
				game.select[1]++;
				actionTimer = 1;
				return;
			} else if (action == "up") {
				let to = -1, distance = -1;
				for (let a = 0; a < game.enemies.length; a++) {
					if (game.enemyPos[a][1] > distance) {
						distance = game.enemyPos[a][1];
						to = a;
					};
				};
				for (let a = 0; a < game.enemies.length; a++) {
					if (game.enemyPos[a][0] < distance) {
						distance = game.enemyPos[a][0];
						to = a;
					};
				};
				game.select = ["lookat_enemy", to];
				actionTimer = 1;
				return;
			};
			if (game.select[1] < 0) game.select[1] = 0;
			else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
		};
	};
	// select enemy
	if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
		if (action == "left") {
			if (game.select[1] < game.enemies.length - 1) game.select[1]++;
			else game.select = ["lookat_you", 0];
			actionTimer = 1;
			return;
		} else if (action == "right") {
			if (game.select[1]) game.select[1]--;
			else game.select = ["discard", 0];
			actionTimer = 1;
			return;
		} else if (action == "down" && game.select[0] == "lookat_enemy") {
			if (!game.hand[0]) game.select = ["discard", 0];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		};
	};
};

const gameloop = setInterval(function() {
	// bugs
	if (!canvas || !ctx) {
		canvasData();
		if (!canvas || !ctx) {
			console.error("Canvas not loaded properly. Please reload page if problem persists.");
			return;
		};
	};
	// load
	if (firstTick) {
		firstTick = false;
		return;
	};
	// clear
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// update data
	updateData();
	// actions
	if (game.turn == "player") playerTurn();
	selection();
	if (game.state == "battle" && !game.enemies.length) {
		endTurn();
		game.select = ["rewards", 0];
		game.state = "battle_fin";
		game.turn = "none";
		if (game.artifacts.includes("iron will")) game.health += 2;
		showPopup("go", "go to the map!");
	};
	// update data again
	updateData();
	// load floor
	let place = game.location.split(", ");
	if (game.state == "enter" && (game.location == "-1" || game.map[place[0]][place[1]][0] == "battle")) {
		if (game.location == "-1") game.room = game.firstRoom;
		game.enemyIndex = 0;
		for (let index = 0; index < game.room[3].length; index++) {
			let item = game.room[3][index].split(", ");
			if (item[1]) game.enemies.push(new Enemy(item[0], item[1]));
			else game.enemies.push(new Enemy(item[0]));
		};
		enterBattle();
	};
	// visuals
	backgrounds();
	if (!hide) {
		playerGraphics();
		enemyGraphics();
		effectGraphics();
	};
	foregrounds();
	if (!hide) {
		renderCards();
		if (game.select[0] != "deck" || !game.select[1]) target();
	};
	if (game.select[0] == "in_map") {
		mapGraphics();
	} else if (game.select[0] == "confirm_end") {
		let x = 140, y = 86;
		draw.rect("#00000088");
		draw.rect("#000000", x, y, 120, 22);
		draw.rect("#cccccc", x + 1, y + 1, 120 - 2, 22 - 2);
		draw.lore(x + 2, y + 2, "Are you sure you want to end your turn?", "black", "right", true);
		if (!game.select[1]) draw.rect("#ffffff", x + 1, y + 7, 23, 14);
		else draw.rect("#ffffff", x + 23, y + 7, 17, 14);
		draw.rect("#000000", x + 2, y + 8, 21, 12);
		draw.rect("#cccccc", x + 3, y + 9, 21 - 2, 12 - 2);
		draw.lore(x + 4, y + 10, "YES");
		draw.rect("#000000", x + 24, y + 8, 15, 12);
		draw.rect("#cccccc", x + 25, y + 9, 15 - 2, 12 - 2);
		draw.lore(x + 26, y + 10, "NO");
	} else if (game.state == "battle_fin") {
		
	} else if (game.select[0] == "help" && game.select[1]) {
		infoGraphics();
	} else if (game.select[0] == "deck" && game.select[1]) {
		if (game.deckProxy != "[]") {
			deckGraphics();
		} else {
			draw.rect("#000000cc");
			draw.rect("#00000044", 0, 0, 400, 13);
			draw.lore(200, 1, "Deck", "white", "center");
			draw.rect("#ffffff", 1, 12, 398, 1);
		};
	} else if (game.select[0] == "discard" && game.select[1]) {
		if (game.discard[0]) {
			deckGraphics("discard");
		} else {
			draw.rect("#000000cc");
			draw.rect("#00000044", 0, 0, 400, 13);
			draw.lore(200, 1, "Discard", "white", "center");
			draw.rect("#ffffff", 1, 12, 398, 1);
		};
	} else {
		game.cardSelect = [0, 0];
		deckPos = 0;
		deckMove = "none";
	};
	popupGraphics();
	// enemy actions
	if (game.turn == "enemy") enemyTurn();
}, 100), musicloop = setInterval(function() {
	let time = document.getElementById("music").currentTime;
	if (global.options.music) {
		if (time === 0) {
			document.getElementById("music").play();
		} else if (time > document.getElementById("music").duration - 0.1) {
			document.getElementById("music").currentTime = 0;
		};
	};
}, 2);
