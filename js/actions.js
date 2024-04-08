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

/**
 * Handles selection actions UP, LEFT, RIGHT, and DOWN.
 */
function selection() {
	// action timer
	actionTimer--;
	if (actionTimer > -1) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// menus
	if (menuLocation === MENU.TITLE) {
		if (!game.artifacts.includes(0)) {
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
		};
		return;
	};
	// confirmation
	if (game.select[0] === CONFIRM_END || game.select[0] === CONFIRM_EXIT || game.select[0] === CONFIRM_RESTART) {
		if (action === LEFT && game.select[1]) {
			game.select[1] = 0;
			actionTimer = 1;
		} else if (action === RIGHT && !game.select[1]) {
			game.select[1] = 1;
			actionTimer = 1;
		};
		return;
	} else if (game.select[0] === CONFIRM_FRAGMENT_UPGRADE || game.select[0] === CONFIRM_PURIFY || game.select[0] === CONFIRM_REFINE) {
		if (action === LEFT && game.select[1] > 0) {
			game.select[1]--;
			actionTimer = 1;
		} else if (action === RIGHT && game.select[1] < 2) {
			game.select[1]++;
			actionTimer = 1;
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
		};
		return;
	} else if (game.select[0] === CARD_REWARDS) {
		if (action === RIGHT && game.select[1] < get.cardRewardChoices()) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === LEFT && game.select[1] > -1) {
			game.select[1]--;
			actionTimer = 1;
		};
		return;
	} else if (game.select[0] === ARTIFACT_REWARDS) {
		if (action === RIGHT && game.select[1] < 3) {
			game.select[1]++;
			actionTimer = 1;
		} else if (action === LEFT && game.select[1] > -1) {
			game.select[1]--;
			actionTimer = 1;
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
		if (hasPopups()) {
			game.select = [POPUPS, 0];
			while (game.select[1] < popups.length && !popups[game.select[1]].length) {
				game.select[1]++;
			};
		} else if (!game.enemies.length) {
			game.select = [LOOKER, 0];
		} else {
			game.select = [LOOKAT_ENEMY, 0];
		};
		actionTimer = 1;
		return;
	} else if ((action === RIGHT || action === DOWN) && game.select[0] === VOID && !game.select[1]) {
		game.select = [DISCARD, 0];
		actionTimer = 1;
		return;
	} else if (action === UP && game.select[0] === DISCARD && !game.select[1]) {
		if (game.void.length) {
			game.select = [VOID, 0];
		} else if (hasPopups()) {
			game.select = [POPUPS, 0];
			while (game.select[1] < popups.length && !popups[game.select[1]].length) {
				game.select[1]++;
			};
		} else if (!game.enemies.length) {
			game.select = [LOOKER, 0];
		} else {
			game.select = [LOOKAT_ENEMY, 0];
		};
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
			if (hasPopups()) {
				game.select = [POPUPS, 0];
				while (game.select[1] < popups.length && !popups[game.select[1]].length) {
					game.select[1]++;
				};
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
		if (game.select[1] >= popups.length) {
			game.select[1] = popups.length - 1;
			return;
		} else if (!popups[game.select[1]].length) {
			while (game.select[1] >= 0 && !popups[game.select[1]].length) {
				game.select[1]--;
			};
			if (game.select[1] == -1) {
				if (!game.hand.length) {
					if (game.void.length) game.select = [VOID, 0];
					else game.select = [DISCARD, 0];
				} else game.select = [HAND, game.prevCard];
			};
			return;
		} else if (action === UP) {
			game.select[1]++;
			while (game.select[1] < popups.length && !popups[game.select[1]].length) {
				game.select[1]++;
			};
			if (game.select[1] == popups.length) {
				game.select = [LOOKER, 0];
			};
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			game.select[1]--;
			while (game.select[1] >= 0 && !popups[game.select[1]].length) {
				game.select[1]--;
			};
			if (game.select[1] == -1) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			};
			actionTimer = 1;
			return;
		} else if (action === LEFT) {
			if (!game.hand.length) game.select = [LOOKAT_YOU, 0];
			else game.select = [HAND, game.prevCard];
			actionTimer = 1;
			return;
		};
	};
	// deck selection
	if (((game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD || (game.select[0] === IN_MAP && game.mapSelect == (paths[game.location] || []).length)) && game.select[1]) || game.select[0] === PURIFIER) {
		let len = game.deckLocal.length;
		if (game.select[0] === VOID) len = game.void.length;
		else if (game.select[0] === DISCARD) len = game.discard.length;
		else if (game.select[0] === IN_MAP || game.select[0] === PURIFIER) len = game.deck.length;
		if (action === LEFT) {
			if (game.cardSelect[0] > 0) {
				game.cardSelect[0]--;
			} else if (game.cardSelect[1] > 0) {
				game.cardSelect[0] = 5;
				game.cardSelect[1]--;
			};
			actionTimer = 1;
			return;
		} else if (action === RIGHT) {
			if (game.cardSelect[0] < 5 && (game.cardSelect[0] < (len - 1) % 6 || game.cardSelect[1] < Math.floor(len / 6))) {
				game.cardSelect[0]++;
			} else if (game.cardSelect[0] + (game.cardSelect[1] * 6) < len - 1) {
				game.cardSelect[0] = 0;
				game.cardSelect[1]++;
			};
			actionTimer = 1;
			return;
		} else if (action === UP) {
			if (game.cardSelect[1] > 0) {
				game.cardSelect[1]--;
			};
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			if (game.cardSelect[1] < Math.floor(len / 6) && (game.cardSelect[0] < len % 6 || game.cardSelect[1] < Math.floor(len / 6) - 1)) {
				game.cardSelect[1]++;
			};
			actionTimer = 1;
			return;
		};
	};
	// deck selection from refiner
	if (game.select[0] === REFINER) {
		let len = game.deck.length;
		if (action === LEFT) {
			do {
				if (game.cardSelect[0] > 0) {
					game.cardSelect[0]--;
				} else if (game.cardSelect[1] > 0) {
					game.cardSelect[0] = 5;
					game.cardSelect[1]--;
				} else {
					break;
				};
			} while (game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].level > 0);
			actionTimer = 1;
			return;
		} else if (action === RIGHT) {
			do {
				if (game.cardSelect[0] < 5 && (game.cardSelect[0] < (len - 1) % 6 || game.cardSelect[1] < Math.floor(len / 6))) {
					game.cardSelect[0]++;
				} else if (game.cardSelect[0] + (game.cardSelect[1] * 6) < len - 1) {
					game.cardSelect[0] = 0;
					game.cardSelect[1]++;
				} else {
					break;
				};
			} while (game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].level > 0);
			actionTimer = 1;
			return;
		} else if (action === UP) {
			if (game.cardSelect[1] > 0) {
				game.cardSelect[1]--;
			};
			while (game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].level > 0) {
				if (game.cardSelect[0] > 0) {
					game.cardSelect[0]--;
				} else if (game.cardSelect[1] > 0) {
					game.cardSelect[0] = 5;
					game.cardSelect[1]--;
				} else {
					break;
				};
			};
			actionTimer = 1;
			return;
		} else if (action === DOWN) {
			if (game.cardSelect[1] < Math.floor(len / 6) && (game.cardSelect[0] < len % 6 || game.cardSelect[1] < Math.floor(len / 6) - 1)) {
				game.cardSelect[1]++;
			};
			while (game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].level > 0) {
				if (game.cardSelect[0] < 5 && (game.cardSelect[0] < (len - 1) % 6 || game.cardSelect[1] < Math.floor(len / 6))) {
					game.cardSelect[0]++;
				} else if (game.cardSelect[0] + (game.cardSelect[1] * 6) < len - 1) {
					game.cardSelect[0] = 0;
					game.cardSelect[1]++;
				} else {
					break;
				};
			};
			actionTimer = 1;
			return;
		};
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
			if (game.select[0] === MAP) {
				game.select = [LOOKAT_YOU, 0];
			} else if (hasPopups()) {
				game.select = [POPUPS, popups.length - 1];
				while (game.select[1] >= 0 && !popups[game.select[1]].length) {
					game.select[1]--;
				};
			} else if (!game.enemies.length) {
				if (game.void.length) game.select = [VOID, 0];
				else game.select = [DISCARD, 0];
			} else {
				game.select = [LOOKAT_ENEMY, 0];
			};
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
 * Performs the current action.
 */
function performAction() {
	// action timer
	if (actionTimer > -1) return;
	if (!actionTimer || actionTimer < -1) actionTimer = -1;
	// menus
	if (game.select[0] === WELCOME) {
		game.select = [-1, 0];
		actionTimer = 2;
		return;
	} else if (menuLocation === MENU.TITLE) {
		menuLocation = -1;
		actionTimer = 2;
		return;
	} else if (menuLocation === MENU.DIFFICULTY_CHANGE) {
		if (!menuSelect) {
			if (game.difficulty === 0) game.difficulty++;
			else game.difficulty--;
			restartRun();
		} else menuLocation = MENU.TITLE;
		actionTimer = 2;
		return;
	};
	// player turn
	if (game.turn === TURN.PLAYER) {
		// only one card can be active
		if (game.enemyAtt[3]) return;
		// attack enemy
		if (game.select[0] === ATTACK_ENEMY) {
			game.energy -= getCardCost(game.enemyAtt[2]);
			activateAttackEffects(game.enemyAtt[2].id);
			game.enemyAtt[3] = true;
			discardCard(game.hand.splice(game.enemyAtt[0], 1)[0], true);
			cardAnim.splice(game.enemyAtt[0], 1);
			activateArtifacts(CARD_PLAY, game.enemyAtt[2]);
			game.enemyAtt[0] = -1;
			game.enemyAtt[1] = game.select[1];
			if (game.prevCard) game.select = [HAND, game.prevCard - 1];
			else game.select = [HAND, 0];
			actionTimer = 4;
			updateData();
			return;
		};
		// activate special selection effect
		if (game.select[0] === SELECT_HAND) {
			if (game.select[1] == -1 || game.select[1] == game.hand.length) {
				game.select = [HAND, game.enemyAtt[0]];
				game.enemyAtt = [-1, -1, new Card(), false];
				actionTimer = 4;
				return;
			} else {
				if (cards[game.enemyAtt[2].id].effect) cards[game.enemyAtt[2].id].effect(game.enemyAtt[2].level);
				game.energy -= getCardCost(game.enemyAtt[2]);
				discardCard(game.hand.splice(game.enemyAtt[0], 1)[0], true);
				cardAnim.splice(game.enemyAtt[0], 1);
				activateArtifacts(CARD_PLAY, game.enemyAtt[2]);
				if (game.enemyAtt[0]) game.select = [HAND, game.enemyAtt[0] - 1];
				else game.select = [HAND, 0];
				game.enemyAtt = [-1, -1, new Card(), false];
				actionTimer = 4;
				updateData();
				return;
			};
		};
		// play card
		if (game.select[0] === HAND) {
			let selected = game.hand[game.select[1]], id = selected.id;
			if (cards[id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
				if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "unplayable", -2];
				else notif = [game.select[1], 0, "unplayable", 0];
				actionTimer = 1;
			} else if (cards[id].can && !cards[id].can(selected.level)) {
				if (cards[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, getCardAttr("cannotMessage", id, selected.level), -2];
				else notif = [game.select[1], 0, getCardAttr("cannotMessage", id, selected.level), 0];
				actionTimer = 1;
			} else if (game.energy >= getCardCost(selected)) {
				if (cards[id].select instanceof Array) { // effects of cards that have a special selection
					game.enemyAtt[0] = game.select[1];
					game.select = [cards[id].select[0], cards[id].select[1]];
					game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
					actionTimer = 4;
				} else if (cards[id].effect) { // effects of cards that activate right away
					cards[id].effect(selected.level);
					game.energy -= getCardCost(selected);
					let cardObj = game.hand.splice(game.select[1], 1)[0];
					discardCard(cardObj, true);
					cardAnim.splice(game.select[1], 1);
					activateArtifacts(CARD_PLAY, cardObj);
					if (game.prevCard) game.select = [HAND, game.prevCard - 1];
					else game.select = [HAND, 0];
					actionTimer = 4;
				} else if (cards[id].damage || cards[id].attack) { // effects of attack cards
					if (cards[id].target === false) {
						game.energy -= getCardCost(selected);
						delete selected[CARD_EFF.COST_REDUCTION];
						delete selected[CARD_EFF.RETENTION];
						game.enemyAtt[2] = game.hand[game.select[1]];
						activateAttackEffects(id);
						game.enemyAtt[3] = true;
						let cardObj = game.hand.splice(game.select[1], 1)[0];
						discardCard(cardObj, true);
						cardAnim.splice(game.select[1], 1);
						activateArtifacts(CARD_PLAY, cardObj);
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
			updateData();
			return;
		};
	};
	// game end
	if ((game.select[0] === GAME_OVER || game.select[0] === GAME_FIN) && game.select[1] == 50) {
		let score = get.totalScore();
		if (!global.highScore || score > global.highScore) {
			global.highScore = score;
		};
		restartRun();
		actionTimer = 2;
		return;
	};
	// confirmation
	if (game.select[0] === CONFIRM_END) {
		if (!game.select[1]) {
			endTurn();
			game.select = [END, 0];
		} else if (game.hand.length) game.select = [HAND, game.prevCard];
		actionTimer = 2;
		return;
	} else if (game.select[0] === CONFIRM_EXIT) {
		if (!game.select[1]) {
			game.select = [MAP, 0];
			mapPopup();
		} else {
			game.select = [REWARDS, game.rewards.length - 1];
		};
		actionTimer = 2;
		return;
	} else if (game.select[0] === CONFIRM_RESTART) {
		if (!game.select[1]) {
			restartRun();
			game.select = [OPTIONS, 0];
		} else game.select = [OPTIONS, Object.keys(global.options).length + 2];
		actionTimer = 2;
		return;
	} else if (game.select[0] === CONFIRM_FRAGMENT_UPGRADE) {
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
		return;
	} else if (game.select[0] === CONFIRM_PURIFY) {
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
		return;
	} else if (game.select[0] === CONFIRM_REFINE) {
		if (game.select[1] == 1) {
			game.select = [REFINER, 0];
		} else {
			if (game.select[1] == 0) game.deck[game.cardSelect[0] + game.cardSelect[1] * 6].level = 1;
			for (let index = 0; index < game.rewards.length; index++) {
				if (game.rewards[index] == "1 refiner") {
					if (game.select[1] == 0) game.rewards[index] += " - claimed";
					game.select = [REWARDS, index];
					break;
				};
			};
		};
		actionTimer = 2;
		return;
	};
	// rewards
	if (game.select[0] === REWARDS) {
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
			} else if (arr[1] == "refiner") {
				game.select = [REFINER, 0];
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
					mapPopup();
				};
			};
		};
		actionTimer = 2;
		return;
	} else if (game.select[0] === CARD_REWARDS) {
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
		return;
	} else if (game.select[0] === ARTIFACT_REWARDS) {
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
		return;
	};
	// map
	if (game.select[0] === IN_MAP && game.state === STATE.EVENT_FIN && paths[game.location] && paths[game.location][game.mapSelect]) {
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
	// event
	if (game.select[0] === CONFIRM_EVENT) {
		const event = getCurrentEvent();
		if (event[game.select[1]]) {
			const next = event[game.select[1] + 2][1];
			game.turn = 10000 + (typeof next == "function" ? next() : next);
			getCurrentEvent()[0]();
			if (game.select[0] === CONFIRM_EVENT) game.select[1] = -1;
			actionTimer = 2;
			return;
		};
	};
	// popups
	if (game.select[0] === POPUPS) {
		if (game.select[1] >= popups.length) {
			game.select[1] = popups.length - 1;
			return;
		} else if (!popups[game.select[1]].length) {
			while (game.select[1] >= 0 && !popups[game.select[1]].length) {
				game.select[1]--;
			};
			if (game.select[1] == -1) {
				if (!game.hand.length) {
					if (game.void.length) game.select = [VOID, 0];
					else game.select = [DISCARD, 0];
				} else game.select = [HAND, game.prevCard];
			};
		} else {
			popups[game.select[1]] = [];
			while (game.select[1] >= 0 && !popups[game.select[1]].length) {
				game.select[1]--;
			};
			if (game.select[1] == -1) {
				if (!game.hand.length) {
					if (game.void.length) game.select = [VOID, 0];
					else game.select = [DISCARD, 0];
				} else game.select = [HAND, game.prevCard];
			};
			actionTimer = 1;
		};
		return;
	};
	// activate purifier
	if (game.select[0] === PURIFIER) {
		game.select = [CONFIRM_PURIFY, 1];
		actionTimer = 2;
		return;
	};
	// activate refiner
	if (game.select[0] === REFINER) {
		if (game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].level == 0) {
			game.select = [CONFIRM_REFINE, 1];
		} else {
			game.select = [REWARDS, game.rewards.indexOf("1 refiner")];
		};
		actionTimer = 2;
		return;
	};
	// activate / deactivate extras
	if (game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (game.select[0] === MAP) {
		game.select = [IN_MAP, 0];
		actionTimer = 2;
		return;
	} else if (game.select[0] === IN_MAP && game.mapSelect == -1) {
		game.select = [MAP, 0];
		actionTimer = 2;
		return;
	} else if (game.select[0] === IN_MAP && game.mapSelect == (paths[game.location] || []).length) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (game.select[0] === LOOKER) {
		if (game.select[1] == 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (game.select[0] === HELP) {
		if (game.select[1] <= 2) game.select[1]++;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (game.select[0] === OPTIONS && game.select[1] <= 1) {
		if (game.select[1] === 0) game.select[1] = 1;
		else game.select[1] = 0;
		actionTimer = 2;
		return;
	} else if (game.select[0] === END && game.turn === TURN.PLAYER) {
		endTurnConfirm();
		return;
	};
	// options
	if (game.select[0] === OPTIONS) {
		const option = +Object.keys(global.options)[game.select[1] - 2];
		if (option === OPTION.PIXEL_PERFECT_SIZE) {
			let index = PIXEL_SIZES.indexOf(global.options[OPTION.PIXEL_PERFECT_SIZE]) + 1;
			if (index >= PIXEL_SIZES.length) index = 0;
			global.options[OPTION.PIXEL_PERFECT_SIZE] = PIXEL_SIZES[index];
		} else if (option) {
			global.options[option] = !global.options[option];
		} else {
			game.select = [CONFIRM_RESTART, 1];
		};
		if (option === OPTION.MUSIC) {
			if (global.options[OPTION.MUSIC]) document.getElementById("music").play();
			else document.getElementById("music").pause();
			musicPopup();
		} else if (option === OPTION.PIXEL_PERFECT_SCREEN || option === OPTION.PIXEL_PERFECT_SIZE) {
			if (global.options[OPTION.PIXEL_PERFECT_SCREEN]) document.getElementById("canvas").style = "width: " + (800 * global.options[OPTION.PIXEL_PERFECT_SIZE]) + "px";
			else document.getElementById("canvas").style = "";
			fixCanvas();
		};
		actionTimer = 2;
		return;
	};
};
