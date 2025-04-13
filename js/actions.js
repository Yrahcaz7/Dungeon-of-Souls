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

let actionTimer = -1;
let secret = false;

/**
 * Handles selection actions.
 */
const selection = (() => {
	/**
	 * Checks if there is any active popups.
	 */
	function hasPopups() {
		for (let index = 0; index < popups.length; index++) {
			if (popups[index].length) return true;
		};
		return false;
	};
	/**
	 * Handles deck selection.
	 * @returns {boolean} Whether the action was handled.
	 */
	function deckSelection() {
		const len = currentDeck().length;
		const cols = (menuSelect[0] === -1 && game.select[0] === S.REFINER ? 3 : 6);
		if (action === DIR.LEFT) {
			if (game.cardSelect > 0) {
				game.cardSelect--;
			};
			actionTimer = 1;
			return true;
		} else if (action === DIR.RIGHT) {
			if (game.cardSelect < len - 1) {
				game.cardSelect++;
			};
			actionTimer = 1;
			return true;
		} else if (action === DIR.UP) {
			if (game.cardSelect > 0) {
				game.cardSelect = Math.max(game.cardSelect - cols, 0);
			};
			actionTimer = 1;
			return true;
		} else if (action === DIR.DOWN) {
			if (game.cardSelect < len - 1) {
				game.cardSelect = Math.min(game.cardSelect + cols, len - 1);
			};
			actionTimer = 1;
			return true;
		};
		return false;
	};
	return () => {
		// action timer
		actionTimer = Math.max(actionTimer, 0) - 1;
		if (actionTimer > -1) return;
		// menus
		if (menuSelect[0] === MENU.MAIN) {
			if (action === DIR.UP && menuSelect[1] > (game.map.length > 0 ? 0 : 1)) {
				menuSelect[1]--;
				actionTimer = 1;
			} else if (action === DIR.DOWN && menuSelect[1] < MAIN_MENU_OPTIONS.length - (global.prevGames.length > 0 ? 1 : 2)) {
				menuSelect[1]++;
				actionTimer = 1;
			};
		} else if (menuSelect[0] === MENU.NEW_RUN || menuSelect[0] === MENU.DIFFICULTY || menuSelect[0] === MENU.CHANGE_SEED) {
			if (action === DIR.LEFT && menuSelect[1]) {
				menuSelect[1] = 0;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && !menuSelect[1]) {
				menuSelect[1] = 1;
				actionTimer = 1;
			};
		} else if (menuSelect[0] === MENU.PREV_GAMES) {
			if (action === DIR.LEFT && menuSelect[1] > 0) {
				menuSelect[1]--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && menuSelect[1] < global.prevGames.length * 3 - 1) {
				menuSelect[1]++;
				actionTimer = 1;
			} else if (action === DIR.UP && menuSelect[1] > 0) {
				menuSelect[1] = Math.max(menuSelect[1] - 3, 0);
				actionTimer = 1;
			} else if (action === DIR.DOWN && menuSelect[1] < global.prevGames.length * 3 - 1) {
				menuSelect[1] = Math.min(menuSelect[1] + 3, global.prevGames.length * 3 - 1);
				actionTimer = 1;
			};
		} else if (menuSelect[0] === MENU.PREV_GAME_INFO && menuSelect[1] % 3 == 0) {
			deckSelection();
		} else if (menuSelect[0] === MENU.PREV_GAME_INFO && menuSelect[1] % 3 == 1) {
			const len = global.prevGames[sortedPrevGames[Math.floor(menuSelect[1] / 3)]].artifacts.length;
			if (action === DIR.LEFT && menuArtifactSelect > 0) {
				menuArtifactSelect--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && menuArtifactSelect < len - 1) {
				menuArtifactSelect++;
				actionTimer = 1;
			};
		} else if (menuSelect[0] === MENU.PREV_GAME_SORT && menuSelect[1] == 0) {
			if (action === DIR.UP && prevGamesSort[0] > 0) {
				prevGamesSort[0]--;
				actionTimer = 1;
			} else if (action === DIR.DOWN && prevGamesSort[0] < PREV_GAMES_SORT_NAMES.length - 1) {
				prevGamesSort[0]++;
				actionTimer = 1;
			};
		} else if (menuSelect[0] === MENU.PREV_GAME_SORT && menuSelect[1] == 1) {
			if (action === DIR.UP && prevGamesSort[1]) {
				prevGamesSort[1] = false;
				actionTimer = 1;
			} else if (action === DIR.DOWN && !prevGamesSort[1]) {
				prevGamesSort[1] = true;
				actionTimer = 1;
			};
		};
		if (inMenu()) return;
		// confirmation
		if (game.select[0] === S.CONF_END || game.select[0] === S.CONF_EXIT || game.select[0] === S.CONF_SURRENDER || game.select[0] === S.CONF_REFINE || game.select[0] === S.CONF_PEARL) {
			if (action === DIR.LEFT && game.select[1]) {
				game.select[1] = 0;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && !game.select[1]) {
				game.select[1] = 1;
				actionTimer = 1;
			};
			return;
		} else if (game.select[0] === S.CONF_HAND_ALIGN || game.select[0] === S.CONF_PURIFY) {
			if (action === DIR.LEFT && game.select[1] > 0) {
				game.select[1]--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && game.select[1] < 2) {
				game.select[1]++;
				actionTimer = 1;
			};
			return;
		};
		// rewards
		if (game.select[0] === S.REWARDS) {
			if ((action === DIR.RIGHT || action === DIR.DOWN) && game.select[1] < game.rewards.length - 1) {
				game.select[1]++;
				actionTimer = 1;
			} else if ((action === DIR.UP || action === DIR.LEFT) && game.select[1] > 0) {
				game.select[1]--;
				actionTimer = 1;
			};
			return;
		} else if (game.select[0] === S.CARD_REWARD) {
			if (action === DIR.RIGHT && game.select[1] < get.cardRewardChoices()) {
				game.select[1]++;
				actionTimer = 1;
			} else if (action === DIR.LEFT && game.select[1] > -1) {
				game.select[1]--;
				actionTimer = 1;
			};
			return;
		} else if (game.select[0] === S.ARTIFACT_REWARD) {
			if (action === DIR.RIGHT && game.select[1] < 3) {
				game.select[1]++;
				actionTimer = 1;
			} else if (action === DIR.LEFT && game.select[1] > -1) {
				game.select[1]--;
				actionTimer = 1;
			};
			return;
		};
		// map
		let availableLocations = get.availibleLocations();
		if (game.select[0] === S.MAP && game.state === STATE.EVENT_FIN && availableLocations.length) {
			if (action === DIR.UP) {
				if (game.select[1] == -1) {
					game.select[1] = availableLocations.length - 1;
					actionTimer = 1;
					return;
				} else if (game.select[1] == 0) {
					game.select[1] = availableLocations.length;
					actionTimer = 1;
					return;
				} else if (game.select[1] < availableLocations.length) {
					game.select[1]--;
					actionTimer = 1;
					return;
				};
			} else if (action === DIR.DOWN && game.select[1] != -1) {
				if (game.select[1] < availableLocations.length - 1) {
					game.select[1]++;
				} else if (game.select[1] == availableLocations.length) {
					game.select[1] = 0;
				} else {
					game.select[1] = -1;
				};
				actionTimer = 1;
				return;
			};
		} else if (game.select[0] === S.MAP) {
			if (action === DIR.UP && game.select[1] == -1) {
				game.select[1] = availableLocations.length;
			} else if (action === DIR.DOWN && game.select[1] == availableLocations.length) {
				game.select[1] = -1;
			};
		};
		// event
		if (game.select[0] === S.EVENT) {
			const event = getCurrentEvent();
			if (game.select[1] === -1 && action !== -1) {
				game.select[1] = 0;
				actionTimer = 1;
				return;
			} else if (action === DIR.UP && game.select[1] > 0) {
				game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN && game.select[1] < event.length - 3) {
				game.select[1]++;
				actionTimer = 1;
				return;
			};
		};
		// select extras
		if (action === DIR.UP && game.select[0] === S.ENEMY) {
			game.select = [S.LOOKER, 0];
			actionTimer = 1;
			return;
		};
		// select / deselect player and more extras
		if (action === DIR.UP && game.select[0] === S.PLAYER) {
			game.select = [S.ARTIFACTS, 0];
			actionTimer = 1;
			return;
		} else if (action === DIR.UP && game.select[0] === S.VOID && !game.select[1]) {
			if (hasPopups()) {
				game.select = [S.POPUPS, 0];
				while (game.select[1] < popups.length && !popups[game.select[1]].length) {
					game.select[1]++;
				};
			} else if (!game.enemies.length) {
				game.select = [S.LOOKER, 0];
			} else {
				game.select = [S.ENEMY, 0];
			};
			actionTimer = 1;
			return;
		} else if ((action === DIR.RIGHT || action === DIR.DOWN) && game.select[0] === S.VOID && !game.select[1]) {
			game.select = [S.DISCARD, 0];
			actionTimer = 1;
			return;
		} else if (action === DIR.UP && game.select[0] === S.DISCARD && !game.select[1]) {
			if (game.void.length) {
				game.select = [S.VOID, 0];
			} else if (hasPopups()) {
				game.select = [S.POPUPS, 0];
				while (game.select[1] < popups.length && !popups[game.select[1]].length) {
					game.select[1]++;
				};
			} else if (!game.enemies.length) {
				game.select = [S.LOOKER, 0];
			} else {
				game.select = [S.ENEMY, 0];
			};
			actionTimer = 1;
			return;
		} else if (action === DIR.LEFT) {
			if (game.select[0] === S.HAND && !game.select[1]) {
				game.select = [S.PLAYER, 0];
				actionTimer = 1;
				return;
			} else if (game.select[0] === S.VOID && !game.select[1]) {
				if (!game.enemies.length) game.select = [S.PLAYER, 0];
				else if (!game.hand[0]) game.select = [S.ENEMY, 0];
				else game.select = [S.HAND, game.prevCard];
				actionTimer = 1;
				return;
			} else if (game.select[0] === S.DISCARD && !game.select[1]) {
				if (game.void.length) game.select = [S.VOID, 0];
				else if (!game.enemies.length) game.select = [S.PLAYER, 0];
				else if (!game.hand[0]) game.select = [S.ENEMY, 0];
				else game.select = [S.HAND, game.prevCard];
				actionTimer = 1;
				return;
			};
		} else if (action === DIR.RIGHT) {
			if (game.select[0] === S.PLAYER) {
				if (!game.enemies.length) {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				} else if (!game.hand[0]) game.select = [S.ENEMY, game.enemies.length - 1];
				else game.select = [S.HAND, game.prevCard];
				actionTimer = 1;
				return;
			} else if (game.select[0] === S.HAND && game.select[1] == game.hand.length - 1) {
				if (hasPopups()) {
					game.select = [S.POPUPS, 0];
					while (game.select[1] < popups.length && !popups[game.select[1]].length) {
						game.select[1]++;
					};
				} else {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				};
				actionTimer = 1;
				return;
			};
		};
		if (action === DIR.UP || action === DIR.RIGHT) {
			if (game.select[0] === S.DECK && !game.select[1]) {
				game.select = [S.END, 0];
				actionTimer = 1;
				return;
			} else if (game.select[0] === S.END) {
				game.select = [S.PLAYER, 0];
				actionTimer = 1;
				return;
			};
		} else if (action === DIR.LEFT || action === DIR.DOWN) {
			if (game.select[0] === S.END) {
				game.select = [S.DECK, 0];
				actionTimer = 1;
				return;
			} else if (game.select[0] === S.PLAYER) {
				game.select = [S.END, 0];
				actionTimer = 1;
				return;
			};
		};
		// popup selection
		if (game.select[0] === S.POPUPS) {
			if (game.select[1] >= popups.length) {
				game.select[1] = popups.length - 1;
				return;
			} else if (!popups[game.select[1]].length) {
				while (game.select[1] >= 0 && !popups[game.select[1]].length) {
					game.select[1]--;
				};
				if (game.select[1] == -1) {
					if (!game.hand.length) {
						if (game.void.length) game.select = [S.VOID, 0];
						else game.select = [S.DISCARD, 0];
					} else game.select = [S.HAND, game.prevCard];
				};
				return;
			} else if (action === DIR.UP) {
				game.select[1]++;
				while (game.select[1] < popups.length && !popups[game.select[1]].length) {
					game.select[1]++;
				};
				if (game.select[1] == popups.length) {
					game.select = [S.LOOKER, 0];
				};
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN) {
				game.select[1]--;
				while (game.select[1] >= 0 && !popups[game.select[1]].length) {
					game.select[1]--;
				};
				if (game.select[1] == -1) {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				};
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT) {
				if (!game.hand.length) game.select = [S.PLAYER, 0];
				else game.select = [S.HAND, game.prevCard];
				actionTimer = 1;
				return;
			};
		};
		// deck selection
		if (((game.select[0] === S.DECK || game.select[0] === S.DISCARD || game.select[0] === S.VOID) && game.select[1]) || game.select[0] === S.CARDS || game.select[0] === S.PURIFIER || game.select[0] === S.REFINER) {
			const handled = deckSelection();
			if (handled) return;
		};
		// scrolling
		if (action === DIR.UP && game.select[0] === S.HELP && infoPos > 0 && infoLimit > 0) infoPos -= 11;
		else if (action === DIR.DOWN && game.select[0] === S.HELP && infoPos < infoLimit) infoPos += 11;
		// select options
		if (game.select[0] === S.OPTIONS) {
			if (action === DIR.UP && game.select[1] > 1) {
				game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN && game.select[1] > 0 && game.select[1] - 2 < Object.keys(global.options).length) {
				game.select[1]++;
				actionTimer = 1;
				return;
			};
		};
		// deselect extras
		if ((game.select[0] === S.LOOKER || game.select[0] === S.HELP || game.select[0] === S.OPTIONS) && !game.select[1]) {
			if (action === DIR.LEFT && game.select[0] === S.LOOKER) {
				game.select = [S.ARTIFACTS, game.artifacts.length - 1];
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT && game.select[0] === S.HELP) {
				game.select = [S.LOOKER, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT && game.select[0] === S.OPTIONS) {
				game.select = [S.HELP, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select[0] === S.LOOKER) {
				game.select = [S.HELP, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select[0] === S.HELP) {
				game.select = [S.OPTIONS, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN) {
				if (hasPopups()) {
					game.select = [S.POPUPS, popups.length - 1];
					while (game.select[1] >= 0 && !popups[game.select[1]].length) {
						game.select[1]--;
					};
				} else if (!game.enemies.length) {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				} else {
					game.select = [S.ENEMY, 0];
				};
				actionTimer = 1;
				return;
			};
		};
		// artifacts
		if (game.select[0] === S.ARTIFACTS) {
			if (action === DIR.LEFT) {
				if (game.select[1] > 0) game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT) {
				if (game.select[1] === game.artifacts.length - 1) game.select = [S.LOOKER, 0];
				else game.select[1]++;
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN) {
				game.select = [S.PLAYER, 0];
				actionTimer = 1;
				return;
			};
			if (game.select[1] < 0) game.select[1] = 0;
			else if (game.select[1] >= game.artifacts.length - 1) game.select[1] = game.artifacts.length - 1;
		};
		// select hand
		if (game.select[0] === -1) game.select = [S.HAND, 0];
		// cards in hand
		if (game.select[0] === S.HAND) {
			if (!game.hand) {
				game.select = [S.END, 0];
			} else {
				if (action === DIR.LEFT) {
					game.select[1]--;
					actionTimer = 1;
					return;
				} else if (action === DIR.RIGHT) {
					game.select[1]++;
					actionTimer = 1;
					return;
				} else if (action === DIR.UP) {
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
					game.select = [S.ENEMY, to];
					actionTimer = 1;
					return;
				};
				if (game.select[1] < 0) game.select[1] = 0;
				else if (game.select[1] >= game.hand.length - 1) game.select[1] = game.hand.length - 1;
			};
		};
		// hand selection from effect
		if (game.select[0] === SS.SELECT_HAND) {
			if (action === DIR.LEFT && game.select[1] >= 0) {
				game.select[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select[1] < game.hand.length - 1) {
				game.select[1]++;
				actionTimer = 1;
				return;
			};
		};
		// select enemy
		if (game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) {
			if (action === DIR.LEFT) {
				if (game.select[1] < game.enemies.length - 1) game.select[1]++;
				else game.select = [S.PLAYER, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT) {
				if (game.select[1]) game.select[1]--;
				else if (game.void.length) game.select = [S.VOID, 0];
				else game.select = [S.DISCARD, 0];
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN && game.select[0] === S.ENEMY) {
				if (!game.hand[0]) {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				} else game.select = [S.HAND, game.prevCard];
				actionTimer = 1;
				return;
			};
		};
	};
})();

/**
 * Performs the current action.
 */
const performAction = (() => {
	const PIXEL_SIZES = [1, 2, 0.5];
	const MUSIC_TRACKS = ["default", "Ruins of Caelum", "The Final Ruins", "Future Dungeon"];
	/**
	 * Returns the sort value of the previous game.
	 * @param {{result: number, difficulty: number, floor: number, health: number, gold: number, score: number, seed: string, cards: Card[], artifacts: number[], kills: {}}} prevGame - The previous game to get the sort value of.
	 */
	function getPrevGameSortValue(prevGame) {
		if (prevGamesSort[0] == 1) {
			if (prevGame.result === GAME_RESULT.DEFEAT) return 0;
			if (prevGame.result === GAME_RESULT.VICTORY) return 2;
			return 1;
		} else if (prevGamesSort[0] == 2) {
			if (prevGame.artifacts.includes(202)) return 999;
			return prevGame.difficulty;
		} else if (prevGamesSort[0] == 3) {
			return prevGame.floor;
		} else if (prevGamesSort[0] == 4) {
			return prevGame.health;
		} else if (prevGamesSort[0] == 5) {
			return prevGame.gold;
		} else if (prevGamesSort[0] == 6) {
			return prevGame.score;
		} else if (prevGamesSort[0] == 7) {
			return prevGame.seed;
		} else if (prevGamesSort[0] == 8) {
			return prevGame.cards.length;
		} else if (prevGamesSort[0] == 9) {
			return prevGame.artifacts.length;
		} else if (prevGamesSort[0] == 10) {
			let kills = 0;
			for (const key in prevGame.kills) {
				if (prevGame.kills.hasOwnProperty(key)) {
					kills += prevGame.kills[key];
				};
			};
			return kills;
		};
		return 0;
	};
	/**
	 * Activates the attack effects of a card.
	 * @param {number} id - the id of the card.
	 */
	function activateAttackEffects(id) {
		// stop if effects are not allowed
		if (CARDS[id].attackEffects === false) return;
		// trigger aura blade effect
		if (game.eff[EFF.AURA_BLADE]) {
			game.eff[EFF.AURA_BLADE]--;
			game.attackEffects.push(ATT_EFF.AURA_BLADE);
		};
		// start player animation
		startAnim.player(CARDS[id].attackAnim ?? I.player.attack);
	};
	return () => {
		// action timer
		if (actionTimer > -1) return;
		// menus
		if (game.select[0] === S.WELCOME) {
			game.select = [-1, 0];
			actionTimer = 2;
		} else if (menuSelect[0] === MENU.MAIN) {
			if (menuSelect[1] == 0) {
				if (game.map.length > 0) menuSelect = [-1, 0];
			} else if (menuSelect[1] == 1) {
				if (game.map.length > 0) {
					menuSelect = [MENU.NEW_RUN, 1];
				} else {
					menuSelect = [-1, 0];
					generateMap();
					return;
				};
			} else if (menuSelect[1] == 2) {
				menuSelect = [MENU.DIFFICULTY, 1];
			} else if (menuSelect[1] == 3) {
				menuSelect = [MENU.CHANGE_SEED, 1];
			} else if (menuSelect[1] == 4) {
				if (global.prevGames.length > 0) menuSelect = [MENU.PREV_GAMES, 0];
			};
			actionTimer = 2;
		} else if (menuSelect[0] === MENU.NEW_RUN) {
			if (!menuSelect[1]) {
				endRun(true);
				return;
			} else {
				menuSelect = [MENU.MAIN, 1];
				actionTimer = 2;
			};
		} else if (menuSelect[0] === MENU.DIFFICULTY) {
			if (!menuSelect[1]) {
				endRun(false, 1 - game.difficulty);
				return;
			} else {
				menuSelect = [MENU.MAIN, 2];
				actionTimer = 2;
			};
		} else if (menuSelect[0] === MENU.CHANGE_SEED) {
			if (!menuSelect[1]) menuSelect = [MENU.ENTER_SEED, 0];
			else menuSelect = [MENU.MAIN, 3];
			actionTimer = 2;
		} else if (menuSelect[0] === MENU.ENTER_SEED) {
			if (newSeed) {
				endRun();
				return;
			} else {
				menuSelect = [MENU.CHANGE_SEED, 0];
				actionTimer = 2;
			};
		} else if (menuSelect[0] === MENU.PREV_GAMES) {
			menuSelect[0] = MENU.PREV_GAME_INFO;
			actionTimer = 2;
		} else if (menuSelect[0] === MENU.PREV_GAME_INFO) {
			menuSelect[0] = MENU.PREV_GAMES;
			actionTimer = 2;
		} else if (menuSelect[0] === MENU.PREV_GAME_SORT) {
			if (menuSelect[1]) {
				menuSelect = [MENU.PREV_GAMES, 0];
				menuScroll = 0;
				sortedPrevGames = [];
				while (sortedPrevGames.length < global.prevGames.length) {
					let pending = -1;
					for (let index = 0; index < global.prevGames.length; index++) {
						if (sortedPrevGames.includes(index)) continue;
						if (pending == -1 || (prevGamesSort[1] ?
							getPrevGameSortValue(global.prevGames[index]) >= getPrevGameSortValue(global.prevGames[pending])
							: getPrevGameSortValue(global.prevGames[index]) < getPrevGameSortValue(global.prevGames[pending])
						)) {
							pending = index;
						};
					};
					sortedPrevGames.push(pending);
				};
			} else {
				menuSelect[1]++;
			};
			actionTimer = 2;
		};
		if (inMenu() || actionTimer > -1) return;
		// player turn
		if (game.turn === TURN.PLAYER) {
			// only one card can be active
			if (game.enemyAtt[3]) return;
			// attack enemy
			if (game.select[0] === S.ATTACK) {
				let id = game.enemyAtt[2].id;
				game.energy -= getCardCost(game.enemyAtt[2]);
				activateAttackEffects(id);
				game.enemyAtt[3] = true;
				discardCard(game.hand.splice(game.enemyAtt[0], 1)[0], true);
				cardAnim.splice(game.enemyAtt[0], 1);
				activateArtifacts(FUNC.PLAY_CARD, game.enemyAtt[2]);
				game.enemyAtt[0] = -1;
				game.enemyAtt[1] = game.select[1];
				if (game.prevCard) game.select = [S.HAND, game.prevCard - 1];
				else game.select = [S.HAND, 0];
				actionTimer = 4;
				updateData();
				if (CARDS[id].attackEffects === false) postCardActivation();
				return;
			};
			// activate special selection effect
			if (game.select[0] === SS.SELECT_HAND) {
				if (game.select[1] === -1 || game.select[1] === game.hand.length - 1) {
					handSelectPos = [];
					game.select = [S.HAND, game.enemyAtt[0]];
					game.enemyAtt = [-1, -1, new Card(), false];
					actionTimer = 4;
					return;
				} else {
					handSelectPos = [];
					if (CARDS[game.enemyAtt[2].id].effectAnim) startAnim.effect(CARDS[game.enemyAtt[2].id].effectAnim);
					if (CARDS[game.enemyAtt[2].id].effect) CARDS[game.enemyAtt[2].id].effect(game.enemyAtt[2].level);
					game.energy -= getCardCost(game.enemyAtt[2]);
					discardCard(game.hand.splice(game.enemyAtt[0], 1)[0], true);
					cardAnim.splice(game.enemyAtt[0], 1);
					activateArtifacts(FUNC.PLAY_CARD, game.enemyAtt[2]);
					if (game.enemyAtt[0]) game.select = [S.HAND, game.enemyAtt[0] - 1];
					else game.select = [S.HAND, 0];
					game.enemyAtt = [-1, -1, new Card(), false];
					actionTimer = 4;
					updateData();
					postCardActivation();
					return;
				};
			};
			// play card
			if (game.select[0] === S.HAND) {
				const selected = game.hand[game.select[1]];
				const id = selected.id;
				if (CARDS[id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
					if (CARDS[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "unplayable", -2];
					else notif = [game.select[1], 0, "unplayable", 0];
					actionTimer = 1;
				} else if (CARDS[id].can && !CARDS[id].can(selected.level)) {
					if (CARDS[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, selected.getAttr("cannotMessage"), -2];
					else notif = [game.select[1], 0, selected.getAttr("cannotMessage"), 0];
					actionTimer = 1;
				} else if (game.energy >= getCardCost(selected)) {
					if (CARDS[id].select) { // effects of cards that have a special selection
						game.enemyAtt[0] = game.select[1];
						const specialSelect = (CARDS[id].select instanceof Function ? CARDS[id].select() : CARDS[id].select);
						game.select = [specialSelect[0], specialSelect[1]];
						game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
						actionTimer = 4;
					} else if (CARDS[id].effect) { // effects of cards that activate right away
						if (CARDS[id].effectAnim) startAnim.effect(CARDS[id].effectAnim);
						CARDS[id].effect(selected.level);
						game.energy -= getCardCost(selected);
						const cardObj = game.hand.splice(game.select[1], 1)[0];
						discardCard(cardObj, true);
						cardAnim.splice(game.select[1], 1);
						activateArtifacts(FUNC.PLAY_CARD, cardObj);
						if (game.prevCard) game.select = [S.HAND, game.prevCard - 1];
						else game.select = [S.HAND, 0];
						actionTimer = 4;
						updateData();
						postCardActivation();
					} else if (CARDS[id].damage || CARDS[id].attack) { // effects of attack cards
						if (CARDS[id].target === false) {
							game.energy -= getCardCost(selected);
							game.enemyAtt[2] = game.hand[game.select[1]];
							activateAttackEffects(id);
							game.enemyAtt[3] = true;
							const cardObj = game.hand.splice(game.select[1], 1)[0];
							discardCard(cardObj, true);
							cardAnim.splice(game.select[1], 1);
							activateArtifacts(FUNC.PLAY_CARD, cardObj);
							if (game.prevCard) game.select = [S.HAND, game.prevCard - 1];
							else game.select = [S.HAND, 0];
							actionTimer = 4;
							updateData();
							if (CARDS[id].attackEffects === false) postCardActivation();
						} else {
							game.enemyAtt[0] = game.select[1];
							game.select = [S.ATTACK, game.enemies.length - 1];
							game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
							if (game.enemies.length > 1) actionTimer = 4;
						};
					};
				} else {
					if (CARDS[game.hand[game.select[1]].id].rarity == 2) notif = [game.select[1], 0, "not enough energy", -2];
					else notif = [game.select[1], 0, "not enough energy", 0];
					actionTimer = 1;
				};
				return;
			};
		};
		// game end
		if ((game.select[0] === S.GAME_OVER || game.select[0] === S.GAME_WON) && game.select[1] == 50) {
			endRun();
			return;
		};
		// confirmation
		let availableLocations = get.availibleLocations();
		if (game.select[0] === S.CONF_END) {
			if (!game.select[1]) {
				endTurn();
				game.select = [S.END, 0];
			} else if (game.hand.length) {
				game.select = [S.HAND, game.prevCard];
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CONF_EXIT) {
			if (!game.select[1]) {
				game.select = [S.ARTIFACTS, 0];
				mapPopup();
			} else {
				game.select = [S.REWARDS, game.rewards.length - 1];
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CONF_SURRENDER) {
			if (!game.select[1]) {
				endRun();
			} else {
				game.select = [S.OPTIONS, Object.keys(global.options).length + 2];
				actionTimer = 2;
			};
			return;
		} else if (game.select[0] === S.CONF_HAND_ALIGN) {
			if (game.select[1] == 2) {
				game.select = [S.MAP, 0];
			} else {
				game.location = availableLocations[0];
				if (game.select[1] == 0) game.artifacts.push(202);
				game.room = game.map[game.location[0]][game.location[1]];
				game.select = [-1, 0];
				game.state = STATE.ENTER;
				game.floor++;
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CONF_PURIFY) {
			if (game.select[1] == 1) {
				game.select = [S.PURIFIER, 0];
			} else {
				if (game.select[1] == 0) game.cards.splice(game.cardSelect, 1);
				const index = game.rewards.findIndex(arr => arr[0] === REWARD.PURIFIER);
				if (index >= 0) {
					if (game.select[1] == 0) game.rewards[index][2] = true;
					game.select = [S.REWARDS, index];
				};
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CONF_REFINE) {
			if (game.select[1]) {
				game.select = [S.REFINER, 0];
			} else {
				refinableDeck[game.cardSelect].level = 1;
				refinableDeck = [];
				const index = game.rewards.findIndex(arr => arr[0] === REWARD.REFINER);
				if (index >= 0) {
					game.rewards[index][2] = true;
					game.select = [S.REWARDS, index];
				};
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CONF_PEARL) {
			if (!game.select[1]) {
				game.energy--; // spend 1 energy picking up the pearl
				game.artifacts.push(204); // give player artifact "Shrouded Pearl"
				game.select = [S.ARTIFACTS, game.artifacts.length - 1];
			} else {
				game.select = [S.HAND, 0];
			};
			actionTimer = 2;
			return;
		};
		// rewards
		if (game.select[0] === S.REWARDS) {
			const arr = game.rewards[game.select[1]];
			if (!arr[2]) {
				if (arr[0] === REWARD.GOLD) {
					game.gold += arr[1];
					arr[2] = true;
				} else if (arr[0] === REWARD.CARD) {
					game.select = [S.CARD_REWARD, -1];
				} else if (arr[0] === REWARD.ARTIFACT) {
					game.select = [S.ARTIFACT_REWARD, -1];
				} else if (arr[0] === REWARD.HEALTH) {
					game.health += arr[1];
					arr[2] = true;
				} else if (arr[0] === REWARD.PURIFIER) {
					game.select = [S.PURIFIER, 0];
				} else if (arr[0] === REWARD.REFINER) {
					game.select = [S.REFINER, 0];
				} else if (arr[0] === REWARD.FINISH) {
					if (game.rewards.some(arr => arr[0] !== REWARD.FINISH && !arr[2])) {
						game.select = [S.CONF_EXIT, 1];
					} else {
						game.select = [S.ARTIFACTS, 0];
						mapPopup();
					};
				};
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CARD_REWARD) {
			const index = game.rewards.findIndex(arr => arr[0] === REWARD.CARD);
			if (game.select[1] === -1 || game.select[1] === get.cardRewardChoices()) {
				game.select = [S.REWARDS, index];
				if (game.select[1] < 0) game.select[1] = 0;
			} else {
				game.cards.push(new Card(game.room[5][game.select[1]]));
				if (index >= 0) {
					game.rewards[index][2] = true;
					game.select = [S.REWARDS, index];
				};
			};
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.ARTIFACT_REWARD) {
			const index = game.rewards.findIndex(arr => arr[0] === REWARD.ARTIFACT);
			if (game.select[1] === -1 || game.select[1] === 3) {
				game.select = [S.REWARDS, index];
				if (game.select[1] < 0) game.select[1] = 0;
			} else {
				game.artifacts.push(game.room[6][game.select[1]]);
				const func = ARTIFACTS[game.room[6][game.select[1]]][FUNC.PICKUP];
				if (func instanceof Function) func();
				if (index >= 0) {
					game.rewards[index][2] = true;
					game.select = [S.REWARDS, index];
				};
			};
			actionTimer = 2;
			return;
		};
		// map
		if (game.select[0] === S.MAP && game.state === STATE.EVENT_FIN && availableLocations[game.select[1]]) {
			const now = new Date();
			if (game.floor == 9 && game.difficulty == 1 && ((now.getHours() % 12 == 11 && now.getMinutes() >= 59) || (now.getHours() % 12 == 0 && now.getMinutes() <= 1))) {
				game.select = [S.CONF_HAND_ALIGN, 2];
			} else {
				game.location = availableLocations[game.select[1]];
				game.room = game.map[game.location[0]][game.location[1]];
				game.select = [-1, 0];
				game.state = STATE.ENTER;
				game.floor++;
			};
			actionTimer = 1;
			return;
		};
		// event
		if (game.select[0] === S.EVENT) {
			let event = getCurrentEvent();
			if (event[game.select[1] + 2]) {
				const next = event[game.select[1] + 2][1];
				game.turn = 10000 + (next instanceof Function ? next() : next);
				event = getCurrentEvent();
				if (event[0] instanceof Function) event[0]();
				if (game.select[0] === S.EVENT) game.select[1] = -1;
				actionTimer = 2;
				return;
			};
		};
		// popups
		if (game.select[0] === S.POPUPS && popups[game.select[1]]) {
			const action = popups[game.select[1]][4];
			popups[game.select[1]] = [];
			while (game.select[1] >= 0 && !popups[game.select[1]].length) {
				game.select[1]--;
			};
			if (game.select[1] == -1) {
				if (!game.hand.length) {
					if (game.void.length) game.select = [S.VOID, 0];
					else game.select = [S.DISCARD, 0];
				} else {
					game.select = [S.HAND, game.prevCard];
				};
			};
			if (action instanceof Function) action();
			actionTimer = 1;
			return;
		};
		// activate purifier
		if (game.select[0] === S.PURIFIER) {
			game.select = [S.CONF_PURIFY, 1];
			actionTimer = 2;
			return;
		};
		// activate refiner
		if (game.select[0] === S.REFINER && refinableDeck[game.cardSelect]) {
			game.select = [S.CONF_REFINE, 1];
			actionTimer = 2;
			return;
		};
		// activate / deactivate extras
		if (game.select[0] === S.DECK || game.select[0] === S.DISCARD || game.select[0] === S.VOID) {
			if (game.select[2]) game.select = game.select[2];
			else if (game.select[1] == 0) game.select[1] = 1;
			else game.select[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.ARTIFACTS && game.select[1] == 0) {
			game.select = [S.MAP, -1];
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.MAP && game.select[1] == -1) {
			game.select = [S.ARTIFACTS, 0];
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.MAP && game.select[1] == availableLocations.length) {
			game.select = [S.CARDS, 0];
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.CARDS) {
			if (game.select[2]) game.select = game.select[2];
			else game.select = [S.MAP, availableLocations.length];
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.LOOKER) {
			if (game.select[1] == 0) game.select[1] = 1;
			else game.select[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.HELP) {
			if (game.select[1] <= 2) game.select[1]++;
			else game.select[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.OPTIONS && game.select[1] <= 1) {
			if (game.select[1] === 0) game.select[1] = 1;
			else game.select[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select[0] === S.END && game.turn === TURN.PLAYER) {
			endTurnConfirm();
			return;
		};
		// options
		if (game.select[0] === S.OPTIONS) {
			const option = +Object.keys(global.options)[game.select[1] - 2];
			if (option === OPTION.PERFECT_SIZE) {
				let index = PIXEL_SIZES.indexOf(global.options[OPTION.PERFECT_SIZE]) + 1;
				if (index >= PIXEL_SIZES.length) index = 0;
				global.options[OPTION.PERFECT_SIZE] = PIXEL_SIZES[index];
			} else if (option === OPTION.MUSIC_TRACK) {
				let index = MUSIC_TRACKS.indexOf(global.options[OPTION.MUSIC_TRACK]) + 1;
				if (index >= MUSIC_TRACKS.length) index = 0;
				global.options[OPTION.MUSIC_TRACK] = MUSIC_TRACKS[index];
			} else if (option) {
				global.options[option] = !global.options[option];
			} else {
				game.select = [S.CONF_SURRENDER, 1];
			};
			if (option === OPTION.MUSIC) {
				if (global.options[OPTION.MUSIC]) document.getElementById("music").play();
				else document.getElementById("music").pause();
				musicPopup();
			} else if (option === OPTION.PERFECT_SCREEN || option === OPTION.PERFECT_SIZE) {
				fixCanvas(true);
			} else if (option === OPTION.MUSIC_TRACK) {
				fadeMusic();
			};
			if (global.options[OPTION.MUSIC_TRACK]) {
				// secret already obtained
			} else if (secret) {
				if (global.options[OPTION.MUSIC] === false
					&& global.options[OPTION.SCREEN_SHAKE] === true
					&& global.options[OPTION.STICKY_CARDS] === true
					&& global.options[OPTION.PERFECT_SCREEN] === false
					&& global.options[OPTION.PERFECT_SIZE] == 1
					&& global.options[OPTION.FAST_MOVEMENT] === true
					&& global.options[OPTION.AUTO_END_TURN] === false
					&& global.options[OPTION.END_TURN_CONFIRM] === true
				) {
					global.options[OPTION.MUSIC_TRACK] = "default";
				};
			} else {
				if (global.options[OPTION.MUSIC] === true
					&& global.options[OPTION.SCREEN_SHAKE] === false
					&& global.options[OPTION.STICKY_CARDS] === true
					&& global.options[OPTION.PERFECT_SCREEN] === true
					&& global.options[OPTION.PERFECT_SIZE] == 2
					&& global.options[OPTION.FAST_MOVEMENT] === false
					&& global.options[OPTION.AUTO_END_TURN] === true
					&& global.options[OPTION.END_TURN_CONFIRM] === false
				) {
					secret = true;
				};
			};
			actionTimer = 2;
			return;
		};
	};
})();
