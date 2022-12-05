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

var global = {
	// unlockedCards: [],
	options: {
		music: true,
		sticky_cards: false,
		pixel_perfect_screen: false,
		allow_fast_movement: true,
	},
	charStage: {
		knight: 0,
	},
}, game = {
	character: "knight",
	health: 60,
	shield: 0,
	floor: 0,
	location: "-1",
	rewards: [],
	cardRewardChoices: 3,
	gold: 0,
	state: "enter",
	turn: "none",
	select: ["none", 0],
	cardSelect: [0, 0],
	mapSelect: -1,
	enemyAtt: "none",
	enemyAttSel: 0,
	enemyAttFin: false,
	energy: 3,
	enemies: [],
	enemyNum: 0,
	enemyStage: "none",
	artifacts: ["iron will"],
	deck: [new Card(1000), new Card(1000), new Card(1000), new Card(1000), new Card(2000), new Card(2000), new Card(2000), new Card(2000), new Card(2001), new Card(4000)],
	deckLocal: [],
	deckPos: 0,
	hand: [],
	prevCard: -1,
	activeCard: -1,
	discard: [],
	void: [],
	eff: {
		auraBlades: 0,
		reinforces: 0,
	},
	attackEffect: "none",
	room: [],
	firstRoom: [],
	map: [],
	seed: "" + (new Date().getTime() % 1000000).toString().shuffle(),
	saveNum: 0,
}, actionTimer = -1, notif = [-1, 0, "", 0], menuLocation = "title", enemyPos = [], handPos = [], paths = {}, deckMove = "none";

function musicPopups() {
	let src = document.getElementById("music").src;
	if (!global.options.music) {
		showPopup("music", "music is off");
	} else if (src.includes("Ruins_of_Caelum.mp3")) {
		showPopup("music", "Ruins of Caelum");
	};
};

function enterBattle() {
	game.state = "battle";
	game.deckLocal = randomize(game.deck.slice(0));
	game.hand = [];
	game.discard = [];
	game.void = [];
	game.shield = 0;
	game.eff.auraBlades = 0;
	game.eff.reinforces = 0;
	startTurn();
};

function startTurn() {
	drawHand();
	game.turn = "player";
	if (game.eff.reinforces) {
		game.eff.reinforces--;
	} else {
		game.shield = 0;
	};
	game.energy = get.maxEnergy();
	game.select = ["hand", 0];
	if (playerAnim[1] != "idle") {
		startAnim.player("idle");
	};
};

function endTurn() {
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].eff.reinforces) {
			game.enemies[index].eff.reinforces--;
		} else {
			game.enemies[index].shield = 0;
		};
		if (game.enemies[index].eff.burn) {
			let damage = game.enemies[index].eff.burn;
			if (game.enemies[index].shield > damage) {
				game.enemies[index].shield -= damage;
				damage = 0;
			} else if (game.enemies[index].shield) {
				damage -= game.enemies[index].shield;
				game.enemies[index].shield = 0;
			};
			game.enemies[index].health -= damage;
			game.enemies[index].eff.burn--;
		};
	};
	if (game.hand.length >= 1) {
		let iteration = 0;
		for (let index = 0; index < game.hand.length; iteration++) {
			game.discard.push(game.hand[index]);
			game.hand.splice(index, 1);
			if (iteration >= 1000) break;
		};
	};
	cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	game.turn = "enemy";
};

function endTurnConfirm() {
	let confirm = false;
	if (game.hand.length >= 1) {
		for (let index = 0; index < game.hand.length; index++) {
			if (cards[game.hand[index].id].cost <= game.energy) {
				confirm = true;
				break;
			};
		};
	};
	if (confirm) game.select = ["confirm_end", 0];
	else endTurn();
	actionTimer = 2;
};

function playerTurn() {
	// finish attack enemy
	if (game.enemyAttFin && playerAnim[1] == "idle") {
		const attCard = cards[game.enemyAtt.id];
		if (!attributes["NO SELECT"].includes(game.enemyAtt.id) && attCard.damage) {
			// calculate damage
			let damage = +attCard.damage;
			let exDamage = 0;
			if (game.attackEffect == "aura blade") {
				exDamage += 5 + (game.eff.auraBlades + 1);
			};
			if (attCard.exMod) exDamage = Math.floor(exDamage * attCard.exMod);
			damage += exDamage;
			// damage enemy
			if (game.enemies[game.enemyAttSel].shield > damage) {
				game.enemies[game.enemyAttSel].shield -= damage;
				damage = 0;
			} else if (game.enemies[game.enemyAttSel].shield) {
				damage -= game.enemies[game.enemyAttSel].shield;
				game.enemies[game.enemyAttSel].shield = 0;
			};
			game.enemies[game.enemyAttSel].health -= damage;
		};
		if (typeof attCard.attack == "function") attCard.attack();
		game.enemyAtt = "none";
		game.enemyAttFin = false;
	};
	// action timer
	if (actionTimer > -1 || game.enemyAttFin) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// attack enemy
	if (action == "enter" && game.select[0] == "attack_enemy") {
		game.energy -= cards[game.enemyAtt.id].cost;
		startAnim.player(cards[game.enemyAtt.id].anim);
		activateAttackEffects(game.enemyAtt.id);
		game.enemyAttFin = true;
		if (attributes["one use"].includes(game.enemyAtt.id)) game.void.push(game.hand.splice(game.activeCard, 1)[0]);
		else game.discard.push(game.hand.splice(game.activeCard, 1)[0]);
		cardAnim.splice(game.select[1], 1);
		cardAnim.push(0);
		game.enemyAttSel = game.select[1];
		if (game.prevCard) game.select = ["hand", game.prevCard - 1];
		else game.select = ["hand", 0];
		actionTimer = 4;
		return;
	};
	// play card
	if (action == "enter" && game.select[0] == "hand") {
		let selected = game.hand[game.select[1]], id = selected.id;
		if (attributes.unplayable.includes(id)) {
			if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "unplayable", -2];
			else notif = [game.select[1], 0, "unplayable", 0];
			actionTimer = 1;
		} else if (game.energy >= cards[id].cost) {
			if (cards[id].effect) { // effects of cards that activate right away
				cards[id].effect();
				game.energy -= cards[id].cost;
				if (attributes["one use"].includes(id)) game.void.push(game.hand.splice(game.select[1], 1)[0]);
				else game.discard.push(game.hand.splice(game.select[1], 1)[0]);
				cardAnim.splice(game.select[1], 1);
				cardAnim.push(0);
				if (game.prevCard) game.select = ["hand", game.prevCard - 1];
				else game.select = ["hand", 0];
				actionTimer = 2;
			} else if (cards[id].damage || cards[id].attack) { // effects of attack cards
				if (attributes["NO SELECT"].includes(id)) {
					game.energy -= cards[id].cost;
					game.enemyAtt = game.hand[game.select[1]];
					startAnim.player(cards[id].anim);
					activateAttackEffects(id);
					game.enemyAttFin = true;
					if (attributes["one use"].includes(id)) game.void.push(game.hand.splice(game.select[1], 1)[0]);
					else game.discard.push(game.hand.splice(game.select[1], 1)[0]);
					cardAnim.splice(game.select[1], 1);
					cardAnim.push(0);
					if (game.prevCard) game.select = ["hand", game.prevCard - 1];
					else game.select = ["hand", 0];
					actionTimer = 2;
				} else {
					game.activeCard = game.select[1];
					game.select = ["attack_enemy", game.enemies.length - 1];
					game.enemyAtt = game.hand[game.activeCard];
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

function enemyTurn() {
	if (game.enemyNum >= game.enemies.length) {
		game.enemyNum = 0;
		startTurn();
	};
	if (game.enemyStage == "end") game.enemies[game.enemyNum].finishAction();
	else if (game.enemyStage == "middle") game.enemies[game.enemyNum].middleAction();
	else if (game.enemyStage != "pending") game.enemies[game.enemyNum].startAction();
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
			if (!game.select[1]) {
				endTurn();
				game.select = ["end", 0];
			} else if (game.hand.length) game.select = ["hand", game.prevCard];
			actionTimer = 2;
		};
		return;
	};
	if (game.select[0] == "confirm_exit") {
		if (action == "left" && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action == "right" && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action == "enter") {
			if (!game.select[1]) {
				game.select = ["map", 0];
				showPopup("go", "go to the map!");
			} else {
				game.select = ["rewards", game.rewards.length - 1];
			};
			actionTimer = 2;
		};
		return;
	};
	if (game.select[0] == "confirm_restart") {
		if (action == "left" && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action == "right" && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		} else if (action == "enter") {
			if (!game.select[1]) {
				restartRun();
				game.select = ["options", 0];
			} else game.select = ["options", Object.keys(global.options).length + 2];
			actionTimer = 2;
		};
		return;
	};
	// game end
	if (game.select[0] == "game_over" && game.select[1] == 204) {
		if (action == "enter") {
			restartRun();
			actionTimer = 2;
		};
		return;
	};
	// menus
	if (menuLocation == "title") {
		if (action == "enter") {
			menuLocation = "none";
			actionTimer = 2;
		};
		return;
	};
	// rewards
	if (game.select[0] == "rewards") {
		if ((action == "right" || action == "down") && game.select[1] < game.rewards.length - 1) {
			game.select[1]++;
			actionTimer = 1;
		} else if ((action == "up" || action == "left") && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action == "enter") {
			let item = "" + game.rewards[game.select[1]];
			if (!item.endsWith(" - claimed")) {
				let arr = item.split(" ");
				if (arr[1] == "gold") {
					game.gold += +arr[0];
					game.rewards[game.select[1]] += " - claimed";
				} else if (arr[1] == "card") {
					game.select = ["card_rewards", 0];
				} else if (arr[1] == "health") {
					game.health += +arr[0];
					game.rewards[game.select[1]] += " - claimed";
				} else if (item == "finish") {
					let bool = false;
					for (let index = 0; index < game.rewards.length; index++) {
						if (!game.rewards[index].endsWith(" - claimed") && game.rewards[index] != "finish") {
							bool = true;
							break;
						};
					};
					if (bool) {
						game.select = ["confirm_exit", 0];
					} else {
						game.select = ["map", 0];
						showPopup("go", "go to the map!");
					};
				};
			};
			actionTimer = 2;
		};
		return;
	};
	if (game.select[0] == "card_rewards") {
		if (action == "right" && game.select[1] < game.cardRewardChoices) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action == "left" && game.select[1] > -1) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action == "enter") {
			if (game.select[1] == -1 || game.select[1] == game.cardRewardChoices) {
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 card") {
						game.select = ["rewards", index];
						break;
					};
				};
			} else {
				game.deck.push(new Card(game.room[5][game.select[1]]));
				for (let index = 0; index < game.rewards.length; index++) {
					if (game.rewards[index] == "1 card") {
						game.rewards[index] += " - claimed";
						game.select = ["rewards", index];
						break;
					};
				};
			};
			actionTimer = 2;
		};
		return;
	};
	// map
	if (game.select[0] == "in_map" && game.state == "event_fin" && paths[game.location]) {
		if ((action == "up" || action == "right")) {
			if (game.mapSelect == -1) {
				game.mapSelect = paths[game.location].length - 1;
				actionTimer = 1;
				return;
			} else if (game.mapSelect > 0) {
				game.mapSelect = game.mapSelect - 1;
				actionTimer = 1;
				return;
			};
		} else if ((action == "left" || action == "down") && game.mapSelect != -1) {
			if (game.mapSelect < paths[game.location].length - 1) {
				game.mapSelect = game.mapSelect + 1;
			} else {
				game.mapSelect = -1;
			};
			actionTimer = 1;
			return;
		} else if (action == "enter" && paths[game.location][game.mapSelect]) {
			game.location = paths[game.location][game.mapSelect];
			let coor = game.location.split(", ");
			game.room = game.map[coor[0]][coor[1]];
			game.select = ["none", 0];
			game.mapSelect = -1;
			game.state = "enter";
			game.floor++;
			actionTimer = 1;
			return;
		};
	};
	// select hand
	if (game.select[0] == "none") game.select = ["hand", 0];
	// select extras
	if (action == "up" && game.select[0] == "lookat_enemy") {
		game.select = ["looker", 0];
		actionTimer = 1;
		return;
	};
	// select / deselect player and more extras
	if (action == "up" && game.select[0] == "lookat_you") {
		game.select = ["map", 0];
		actionTimer = 1;
		return;
	} else if (action == "up" && game.select[0] == "void" && !game.select[1]) {
		if (popups[0]) game.select = ["popups", 0];
		else if (!game.enemies.length) game.select = ["looker", 0];
		else game.select = ["lookat_enemy", 0];
		actionTimer = 1;
		return;
	} else if ((action == "right" || action == "down") && game.select[0] == "void" && !game.select[1]) {
		game.select = ["discard", 0];
		actionTimer = 1;
		return;
	} else if (action == "up" && game.select[0] == "discard" && !game.select[1]) {
		if (game.void.length) game.select = ["void", 0];
		else if (popups[0]) game.select = ["popups", 0];
		else if (!game.enemies.length) game.select = ["looker", 0];
		else game.select = ["lookat_enemy", 0];
		actionTimer = 1;
		return;
	} else if (action == "left") {
		if (game.select[0] == "hand" && !game.select[1]) {
			game.select = ["lookat_you", 0];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "void" && !game.select[1]) {
			if (!game.enemies.length) game.select = ["lookat_you", 0];
			else if (!game.hand[0]) game.select = ["lookat_enemy", 0];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "discard" && !game.select[1]) {
			if (game.void.length) game.select = ["void", 0];
			else if (!game.enemies.length) game.select = ["lookat_you", 0];
			else if (!game.hand[0]) game.select = ["lookat_enemy", 0];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		};
	} else if (action == "right") {
		if (game.select[0] == "lookat_you") {
			if (!game.enemies.length) {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
			} else if (!game.hand[0]) game.select = ["lookat_enemy", game.enemies.length - 1];
			else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		} else if (game.select[0] == "hand" && game.select[1] == game.hand.length - 1) {
			if (popups[0]) {
				game.select = ["popups", 0];
			} else {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
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
			if (!game.hand.length) {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
			} else game.select = ["hand", game.prevCard];
			return;
		} else if (game.select[1] >= popups.length) {
			game.select[1] = popups.length - 1;
			return;
		} else if (action == "up") {
			if (game.select[1] >= popups.length - 1 || game.select[1] >= 6) {
				game.select = ["looker", 0];
			} else {
				game.select[1]++;
			};
			actionTimer = 1;
			return;
		} else if (action == "down") {
			if (!game.select[1]) {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
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
				if (!game.hand.length) {
					if (game.void.length) game.select = ["void", 0];
					else game.select = ["discard", 0];
				} else game.select = ["hand", game.prevCard];
			} else if (game.select[1] > 0) {
				game.select[1]--;
			};
			actionTimer = 1;
			return;
		};
	};
	// deck selection
	if ((game.select[0] == "deck" || game.select[0] == "void" || game.select[0] == "discard") && game.select[1]) {
		let coor = game.cardSelect, len = game.deckLocal.length;
		if (game.select[0] == "void") len = game.void.length;
		else if (game.select[0] == "discard") len = game.discard.length;
		if (action == "left") {
			if (coor[0] > 0) {
				game.cardSelect[0]--;
			} else if (coor[1] > 0) {
				game.cardSelect[0] = 5;
				game.cardSelect[1]--;
				deckMove = "up";
			};
			actionTimer = 1;
			return;
		} else if (action == "right" && (coor[0] < (len - 1) % 6 || coor[1] < Math.floor(len / 6))) {
			if (coor[0] < 5) {
				game.cardSelect[0]++;
			} else if (coor[0] + (coor[1] * 6) < len - 1) {
				game.cardSelect[0] = 0;
				game.cardSelect[1]++;
				deckMove = "down";
			};
			actionTimer = 1;
			return;
		} else if (action == "up" && coor[1] > 0) {
			game.cardSelect[1]--;
			deckMove = "up";
			actionTimer = 1;
			return;
		} else if (action == "down" && coor[1] < Math.floor(len / 6) && (coor[0] < len % 6 || coor[1] < Math.floor(len / 6) - 1)) {
			game.cardSelect[1]++;
			deckMove = "down";
			actionTimer = 1;
			return;
		};
	};
	// activate / deactivate extras
	if (action == "enter" && (game.select[0] == "deck" || game.select[0] == "void" || game.select[0] == "discard")) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		game.deckPos = 0;
		deckMove = "none";
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "map") {
		game.select = ["in_map", 0];
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "in_map" && game.mapSelect == -1) {
		game.select = ["map", 0];
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "looker") {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "help") {
		if (game.select[1] <= 2) game.select[1]++;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "options" && game.select[1] <= 1) {
		if (game.select[1] === 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (action == "enter" && game.select[0] == "end" && game.turn == "player") {
		endTurnConfirm();
		return;
	};
	// scrolling
	if (action == "up" && game.select[0] == "help" && infPos > 0 && infLimit > 0) {
		infPos -= infLimit / 8 + 0.5;
	} else if (action == "down" && game.select[0] == "help") {
		if (infPos < infLimit) infPos += infLimit / 8 + 0.5;
		else infPos = infLimit;
	};
	// select options
	if (game.select[0] == "options") {
		if (action == "up" && game.select[1] > 1) {
			game.select[1]--;
			actionTimer = 1;
			return;
		} else if (action == "down" && game.select[1] > 0 && game.select[1] - 2 < Object.keys(global.options).length) {
			game.select[1]++;
			actionTimer = 1;
			return;
		} else if (action == "enter") {
			const option = Object.keys(global.options)[game.select[1] - 2];
			if (option) global.options[option] = !global.options[option];
			else game.select = ["confirm_restart", 1];
			if (option == "music") {
				if (global.options.music) document.getElementById("music").play();
				else document.getElementById("music").pause();
				musicPopups();
			} else if (option == "pixel_perfect_screen") {
				if (global.options.pixel_perfect_screen) document.getElementById("canvas").style = "width: 800px";
				else document.getElementById("canvas").style = "";
			};
			actionTimer = 2;
			return;
		};
	};
	// deselect extras
	if ((game.select[0] == "looker" || game.select[0] == "help" || game.select[0] == "options" || game.select[0] == "map") && !game.select[1]) {
		if (action == "left" && game.select[0] == "looker") {
			if (game.artifacts.length) game.select = ["artifacts", game.artifacts.length - 1];
			else game.select = ["map", 0];
			actionTimer = 1;
			return;
		} else if (action == "left" && game.select[0] == "help") {
			game.select = ["looker", 0];
			actionTimer = 1;
			return;
		} else if (action == "left" && game.select[0] == "options") {
			game.select = ["help", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "looker") {
			game.select = ["help", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "map") {
			if (game.artifacts[0]) game.select = ["artifacts", 0];
			else game.select = ["looker", 0];
			actionTimer = 1;
			return;
		} else if (action == "right" && game.select[0] == "help") {
			game.select = ["options", 0];
			actionTimer = 1;
			return;
		} else if (action == "down") {
			if (game.select[0] == "map") game.select = ["lookat_you", 0];
			else if (popups.length) game.select = ["popups", popups.length - 1];
			else if (!game.enemies.length) {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
			} else game.select = ["lookat_enemy", 0];
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
			if (game.select[1] == game.artifacts.length - 1) game.select = ["looker", 0];
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
			else if (game.void.length) game.select = ["void", 0];
			else game.select = ["discard", 0];
			actionTimer = 1;
			return;
		} else if (action == "down" && game.select[0] == "lookat_enemy") {
			if (!game.hand[0]) {
				if (game.void.length) game.select = ["void", 0];
				else game.select = ["discard", 0];
			} else game.select = ["hand", game.prevCard];
			actionTimer = 1;
			return;
		};
	};
};

function manageGameplay() {
	// update data
	updateData();
	// actions
	if (game.turn == "player" && menuLocation == "none") playerTurn();
	// end battle
	if (game.state == "battle" && !game.enemies.length) {
		endTurn();
		game.select = ["rewards", 0];
		game.state = "event_fin";
		game.turn = "none";
		game.rewards = [];
		if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
		if (game.cardRewardChoices > 0) game.rewards.push("1 card");
		if (game.room[0] == "battle_prime") game.rewards.push((get.maxHealth() * 0.9) + " health");
		game.rewards.push("finish");
		if (game.artifacts.includes("iron will")) game.health += 2;
	};
	// load floor
	let place = game.location.split(", ");
	if (game.state == "enter") {
		if (game.location == "-1" || game.map[place[0]][place[1]][0] == "battle" || game.map[place[0]][place[1]][0] == "battle_prime") {
			if (game.location == "-1") game.room = game.firstRoom;
			for (let index = 0; index < game.room[3].length; index++) {
				let item = game.room[3][index].split(", ");
				if (item[1]) game.enemies.push(new Enemy(item[0], item[1]));
				else game.enemies.push(new Enemy(item[0]));
			};
			enterBattle();
		} else if (game.map[place[0]][place[1]][0] == "treasure") {
			game.map[place[0]][place[1]][3] = "open";
			game.select = ["rewards", 0];
			game.state = "event_fin";
			game.rewards = [];
			if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
			if (game.cardRewardChoices > 0) game.rewards.push("1 card");
			game.rewards.push("finish");
		};
	};
	// update data again
	updateData();
	// enemy actions
	if (game.turn == "enemy" && menuLocation == "none") enemyTurn();
};

function updateVisuals() {
	// bugs
	if (!canvas || !ctx) return;
	// clear
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// update data
	updateData();
	// visuals
	backgrounds();
	if (menuLocation == "title") {
		draw.image(title, (400 - title.width) / 2, 0);
		draw.lore(200 - 2, 53, "Act 1: The Hands of Time", {"color": "red", "text-align": "center"});
		if (new Date().getTime() % 1500 >= 700) draw.lore(200 - 2, 131, "PRESS START", {"color": "white", "text-align": "center"});
	};
	if (menuLocation != "none") {
		draw.image(view);
		return;
	};
	if (!hidden()) {
		playerGraphics();
		enemyGraphics();
		effectGraphics();
	};
	foregrounds();
	if (!hidden()) renderCards();
	if (game.select[0] == "in_map") {
		mapGraphics();
	} else if (game.select[0] == "confirm_end") {
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
	} else if (game.select[0] == "confirm_exit") {
		rewardGraphics(false);
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
	} else if (game.select[0] == "confirm_restart") {
		optionsGraphics(false);
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
	} else if (game.select[0] == "rewards") {
		rewardGraphics();
	} else if (game.select[0] == "card_rewards") {
		cardRewardGraphics();
	} else if (game.select[0] == "help" && game.select[1]) {
		infoGraphics();
	} else if (game.select[0] == "options" && game.select[1]) {
		optionsGraphics();
	} else if (game.select[0] == "deck" && game.select[1]) {
		deckGraphics();
	} else if (game.select[0] == "void" && game.select[1]) {
		deckGraphics("void");
	} else if (game.select[0] == "discard" && game.select[1]) {
		deckGraphics("discard");
	} else {
		game.cardSelect = [0, 0];
		deckPos = 0;
		deckMove = "none";
	};
	if (!hidden()) target();
	popupGraphics();
	if (game.select[0] == "game_over") {
		if (game.select[1] > 204) game.select[1] = 204;
		const num = Math.floor(game.select[1]).toString(16);
		draw.rect("#000000" + (num.length < 2 ? "0" : "") + num);
		if (game.select[1] < 204) game.select[1] += 10;
		else draw.lore(200 - 2, 53, "GAME OVER\n\nTOP FLOOR: " + game.floor + "\n\nEND GOLD: " + game.gold + "\n\nPRESS ENTER TO START A NEW RUN", {"color": "deep red", "text-align": "center"});
	} else if (game.select[0] == "game_fin") {
		if (game.select[1] > 255) game.select[1] = 255;
		const num = Math.floor(game.select[1]).toString(16);
		draw.rect("#000000" + (num.length < 2 ? "0" : "") + num);
		if (game.select[1] < 255) game.select[1] += 10;
		else {
			save();
			loaded = false;
			game.state = "game_won";
			game.select = ["game_won", 0];
			actionTimer = 4;
			setInterval(() => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				let num = Math.round(interval(4/3, 2));
				draw.image(victorious, 168, 42 + num, victorious.width * 2, victorious.height * 2);
				draw.rect("#0004");
				draw.lore(200 - 2, 50, "YOU WON THE GAME!\n\nThank you for playing!\n\nMore content coming soon, such as:<s>\n- More cards!\n- More enemies!\n- A boss battle!\n- And much more!<b>\n\nPRESS ENTER TO START A NEW RUN", {"color": "light green", "text-align": "center"});
				if (actionTimer <= -1) {
					if (action == "enter") restartRun();
				} else actionTimer -= 0.1;
			}, 10);
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
	if (loaded) {
		// gameplay
		manageGameplay();
		// selection
		selection();
		// visuals
		updateVisuals();
		// save
		save();
	};
}, 100), musicloop = setInterval(function() {
	let time = document.getElementById("music").currentTime;
	if (global.options.music) {
		if (time === 0 && menuLocation != "title") {
			document.getElementById("music").play();
		} else if (time > document.getElementById("music").duration - 0.1) {
			document.getElementById("music").currentTime = 0;
		};
	};
}, 2);
