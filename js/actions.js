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
		for (let index = 0; index < activePopups.length; index++) {
			if (activePopups[index].length) return true;
		}
		return false;
	}
	/**
	 * Handles deck selection.
	 * @returns {boolean} Whether the action was handled.
	 */
	function deckSelection() {
		const len = currentDeck().length;
		const cols = (menuSelect.is(-1) && game.select.is(S.REFINER) ? 3 : 6);
		if (action === DIR.LEFT) {
			if (game.cardSelect > 0) {
				game.cardSelect--;
			}
			actionTimer = 1;
			return true;
		} else if (action === DIR.RIGHT) {
			if (game.cardSelect < len - 1) {
				game.cardSelect++;
			}
			actionTimer = 1;
			return true;
		} else if (action === DIR.UP) {
			if (game.cardSelect > 0) {
				game.cardSelect = Math.max(game.cardSelect - cols, 0);
			}
			actionTimer = 1;
			return true;
		} else if (action === DIR.DOWN) {
			if (game.cardSelect < len - 1) {
				game.cardSelect = Math.min(game.cardSelect + cols, len - 1);
			}
			actionTimer = 1;
			return true;
		}
		return false;
	}
	/**
	 * Changes the event selection index by `increment` one or more times until it is valid.
	 * @param {number} increment - The selection increment.
	 * @returns {boolean} Whether the action was handled.
	 */
	function changeEventSelection(increment) {
		const event = getCurrentEvent();
		if (!event) {
			return false;
		}
		let index = game.select.get()[1] + increment;
		while (event.options[index] && event.options[index][2] instanceof Function && !event.options[index][2]?.()) {
			index += increment;
		}
		if (index >= 0 && index < event.options.length) {
			game.select.get()[1] = index;
			actionTimer = 1;
			return true;
		}
		return false;
	}
	return () => {
		// timers
		actionTimer = Math.max(actionTimer, 0) - 1;
		if (actionTimer > -1 || (action !== -1 && holdTimer === 1) || (handAnim.length > 0 && game.state !== STATE.EVENT_FIN)) {
			return;
		}
		holdTimer++;
		// menus
		if (menuSelect.is(MENU.MAIN)) {
			if (action === DIR.UP && menuSelect.get()[1] > (game.map.length > 0 ? 0 : 1)) {
				menuSelect.get()[1]--;
				actionTimer = 1;
			} else if (action === DIR.DOWN && menuSelect.get()[1] < MAIN_MENU_OPTIONS.length - (global.prevGames.length > 0 ? 1 : 2)) {
				menuSelect.get()[1]++;
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.START_NEW_RUN, MENU.CHANGE_DIFFICULTY, MENU.CHANGE_SEED, MENU.CONF_REMOVE_PREV_GAME, MENU.OLD_SAVE_COPY_FAILED)) {
			if (action === DIR.LEFT && menuSelect.get()[1]) {
				menuSelect.get()[1] = 0;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && !menuSelect.get()[1]) {
				menuSelect.get()[1] = 1;
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.PREV_GAMES)) {
			if (action === DIR.LEFT && menuSelect.get()[1] > 0) {
				menuSelect.get()[1]--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && menuSelect.get()[1] < global.prevGames.length * 3 - 1) {
				menuSelect.get()[1]++;
				actionTimer = 1;
			} else if (action === DIR.UP && menuSelect.get()[1] > 0) {
				menuSelect.get()[1] = Math.max(menuSelect.get()[1] - 3, 0);
				actionTimer = 1;
			} else if (action === DIR.DOWN && menuSelect.get()[1] < global.prevGames.length * 3 - 1) {
				menuSelect.get()[1] = Math.min(menuSelect.get()[1] + 3, global.prevGames.length * 3 - 1);
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.PREV_GAME_INFO) && menuSelect.get()[1] % 3 === 0) {
			deckSelection();
		} else if (menuSelect.is(MENU.PREV_GAME_INFO) && menuSelect.get()[1] % 3 === 1) {
			const len = global.prevGames[sortedPrevGames[Math.floor(menuSelect.get()[1] / 3)]].artifacts.length;
			if (action === DIR.LEFT && menuArtifactSelect > 0) {
				menuArtifactSelect--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && menuArtifactSelect < len - 1) {
				menuArtifactSelect++;
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.PREV_GAME_SORT) && menuSelect.get()[1] === 0) {
			if (action === DIR.UP && prevGamesSort[0] > 0) {
				prevGamesSort[0]--;
				actionTimer = 1;
			} else if (action === DIR.DOWN && prevGamesSort[0] < PREV_GAMES_SORT_NAMES.length - 1) {
				prevGamesSort[0]++;
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.PREV_GAME_SORT) && menuSelect.get()[1] === 1) {
			if (action === DIR.UP && prevGamesSort[1]) {
				prevGamesSort[1] = false;
				actionTimer = 1;
			} else if (action === DIR.DOWN && !prevGamesSort[1]) {
				prevGamesSort[1] = true;
				actionTimer = 1;
			}
		} else if (menuSelect.is(MENU.OLD_SAVE_ALERT)) {
			if (action === DIR.LEFT && menuSelect.get()[1] > 0) {
				menuSelect.get()[1]--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && menuSelect.get()[1] < 2) {
				menuSelect.get()[1]++;
				actionTimer = 1;
			}
		}
		if (inMenu()) return;
		// confirmation
		if (game.select.is(S.CONF_END_TURN, S.CONF_EXIT, S.CONF_SURRENDER, S.CONF_REFINE, S.CONF_PEARL)) {
			if (action === DIR.LEFT && game.select.get()[1]) {
				game.select.get()[1] = 0;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && !game.select.get()[1]) {
				game.select.get()[1] = 1;
				actionTimer = 1;
			}
			return;
		} else if (game.select.is(S.CONF_HAND_ALIGN, S.CONF_PURIFY)) {
			if (action === DIR.LEFT && game.select.get()[1] > 0) {
				game.select.get()[1]--;
				actionTimer = 1;
			} else if (action === DIR.RIGHT && game.select.get()[1] < 2) {
				game.select.get()[1]++;
				actionTimer = 1;
			}
			return;
		}
		// rewards
		if (game.select.is(S.REWARDS)) {
			if ((action === DIR.RIGHT || action === DIR.DOWN) && game.select.get()[1] < game.rewards.length - 1) {
				game.select.get()[1]++;
				actionTimer = 1;
			} else if ((action === DIR.UP || action === DIR.LEFT) && game.select.get()[1] > 0) {
				game.select.get()[1]--;
				actionTimer = 1;
			}
			return;
		} else if (game.select.is(S.CARD_REWARD, S.ARTIFACT_REWARD)) {
			const selectMax = (game.select.is(S.CARD_REWARD) ? get.cardRewardChoices() : 3);
			if (game.select.get()[1] < 0) {
				if (action === DIR.RIGHT) {
					game.select.get()[1] = 0;
					actionTimer = 1;
				} else if (action === DIR.LEFT) {
					game.select.get()[1] = selectMax - 1;
					actionTimer = 1;
				} else if (action === DIR.UP) {
					game.select.get()[1] = -game.select.get()[1] - 1;
					actionTimer = 1;
				}
			} else if (action === DIR.RIGHT) {
				if (game.select.get()[1] < selectMax - 1) game.select.get()[1]++;
				else game.select.get()[1] = -selectMax;
				actionTimer = 1;
			} else if (action === DIR.LEFT && game.select.get()[1] >= 0) {
				game.select.get()[1]--;
				actionTimer = 1;
			} else if (action === DIR.DOWN) {
				game.select.get()[1] = -game.select.get()[1] - 1;
				actionTimer = 1;
			}
			return;
		}
		// map
		const availableLocations = get.availableLocations();
		if (game.select.is(S.MAP) && game.state === STATE.EVENT_FIN && availableLocations.length) {
			if (action === DIR.UP) {
				if (game.select.get()[1] == -1) {
					game.select.get()[1] = availableLocations.length - 1;
					actionTimer = 1;
					return;
				} else if (game.select.get()[1] === 0) {
					game.select.get()[1] = availableLocations.length;
					actionTimer = 1;
					return;
				} else if (game.select.get()[1] < availableLocations.length) {
					game.select.get()[1]--;
					actionTimer = 1;
					return;
				}
			} else if (action === DIR.DOWN && game.select.get()[1] != -1) {
				if (game.select.get()[1] < availableLocations.length - 1) {
					game.select.get()[1]++;
					actionTimer = 1;
					return;
				} else if (game.select.get()[1] == availableLocations.length) {
					game.select.get()[1] = 0;
					actionTimer = 1;
					return;
				} else if (!onFloorWithCutscene()) {
					game.select.get()[1] = -1;
					actionTimer = 1;
					return;
				}
			}
		} else if (game.select.is(S.MAP)) {
			if (action === DIR.UP && game.select.get()[1] == -1) {
				game.select.get()[1] = availableLocations.length;
			} else if (action === DIR.DOWN && game.select.get()[1] == availableLocations.length) {
				game.select.get()[1] = -1;
			}
		}
		// event
		if (game.select.is(S.EVENT)) {
			if (game.select.get()[1] === -1 && action !== -1) {
				const handled = changeEventSelection(1);
				if (handled) return;
			} else if (action === DIR.UP && game.select.get()[1] > 0) {
				const handled = changeEventSelection(-1);
				if (handled) return;
			} else if (action === DIR.DOWN && game.select.get()[1] < (getCurrentEvent()?.options.length || 0) - 1) {
				const handled = changeEventSelection(1);
				if (handled) return;
			}
		}
		// select extras
		if (action === DIR.UP && game.select.is(S.ENEMY)) {
			game.select.set(S.LOOKER);
			actionTimer = 1;
			return;
		}
		// select / deselect player and more extras
		if (action === DIR.UP && game.select.is(S.PLAYER)) {
			game.select.set(S.ARTIFACTS);
			actionTimer = 1;
			return;
		} else if (action === DIR.UP && game.select.is(S.VOID) && !game.select.get()[1]) {
			if (hasPopups()) {
				game.select.set(S.POPUPS);
				while (game.select.get()[1] < activePopups.length && !activePopups[game.select.get()[1]].length) {
					game.select.get()[1]++;
				}
			} else if (!game.enemies.length) {
				game.select.set(S.LOOKER);
			} else {
				game.select.set(S.ENEMY);
			}
			actionTimer = 1;
			return;
		} else if ([DIR.RIGHT, DIR.DOWN].includes(action) && game.select.is(S.VOID) && !game.select.get()[1]) {
			game.select.set(S.DISCARD);
			actionTimer = 1;
			return;
		} else if (action === DIR.UP && game.select.is(S.DISCARD) && !game.select.get()[1]) {
			if (game.void.length) {
				game.select.set(S.VOID);
			} else if (hasPopups()) {
				game.select.set(S.POPUPS);
				while (game.select.get()[1] < activePopups.length && !activePopups[game.select.get()[1]].length) {
					game.select.get()[1]++;
				}
			} else if (!game.enemies.length) {
				game.select.set(S.LOOKER);
			} else {
				game.select.set(S.ENEMY);
			}
			actionTimer = 1;
			return;
		} else if (action === DIR.LEFT) {
			if (game.select.is(S.HAND) && !game.select.get()[1]) {
				game.select.set(S.PLAYER)
				actionTimer = 1;
				return;
			} else if (game.select.is(S.VOID) && !game.select.get()[1]) {
				if (!game.enemies.length) game.select.set(S.PLAYER);
				else if (!game.hand[0]) game.select.set(S.ENEMY);
				else game.select.set(S.HAND, game.prevCard);
				actionTimer = 1;
				return;
			} else if (game.select.is(S.DISCARD) && !game.select.get()[1]) {
				if (game.void.length) game.select.set(S.VOID);
				else if (!game.enemies.length) game.select.set(S.PLAYER);
				else if (!game.hand[0]) game.select.set(S.ENEMY);
				else game.select.set(S.HAND, game.prevCard);
				actionTimer = 1;
				return;
			}
		} else if (action === DIR.RIGHT) {
			if (game.select.is(S.PLAYER)) {
				if (!game.enemies.length) {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				} else if (!game.hand[0]) {
					game.select.set(S.ENEMY, game.enemies.length - 1);
				} else {
					game.select.set(S.HAND, game.prevCard);
				}
				actionTimer = 1;
				return;
			} else if (game.select.is(S.HAND) && game.select.get()[1] == game.hand.length - 1) {
				if (hasPopups()) {
					game.select.set(S.POPUPS);
					while (game.select.get()[1] < activePopups.length && !activePopups[game.select.get()[1]].length) {
						game.select.get()[1]++;
					}
				} else {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				}
				actionTimer = 1;
				return;
			}
		}
		if ([DIR.UP, DIR.RIGHT].includes(action)) {
			if (game.select.is(S.DECK) && !game.select.get()[1]) {
				game.select.set(S.END_TURN);
				actionTimer = 1;
				return;
			} else if (game.select.is(S.END_TURN)) {
				game.select.set(S.PLAYER);
				actionTimer = 1;
				return;
			}
		} else if ([DIR.LEFT, DIR.DOWN].includes(action)) {
			if (game.select.is(S.END_TURN)) {
				game.select.set(S.DECK);
				actionTimer = 1;
				return;
			} else if (game.select.is(S.PLAYER)) {
				game.select.set(S.END_TURN);
				actionTimer = 1;
				return;
			}
		}
		// popup selection
		if (game.select.is(S.POPUPS)) {
			if (game.select.get()[1] >= activePopups.length) {
				game.select.get()[1] = activePopups.length - 1;
				return;
			} else if (!activePopups[game.select.get()[1]].length) {
				while (game.select.get()[1] >= 0 && !activePopups[game.select.get()[1]].length) {
					game.select.get()[1]--;
				}
				if (game.select.get()[1] == -1) {
					if (!game.hand.length) {
						if (game.void.length) game.select.set(S.VOID);
						else game.select.set(S.DISCARD);
					} else {
						game.select.set(S.HAND, game.prevCard);
					}
				}
				return;
			} else if (action === DIR.UP) {
				game.select.get()[1]++;
				while (game.select.get()[1] < activePopups.length && !activePopups[game.select.get()[1]].length) {
					game.select.get()[1]++;
				}
				if (game.select.get()[1] == activePopups.length) {
					game.select.set(S.LOOKER);
				}
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN) {
				game.select.get()[1]--;
				while (game.select.get()[1] >= 0 && !activePopups[game.select.get()[1]].length) {
					game.select.get()[1]--;
				}
				if (game.select.get()[1] == -1) {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				}
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT) {
				if (!game.hand.length) game.select.set(S.PLAYER);
				else game.select.set(S.HAND, game.prevCard);
				actionTimer = 1;
				return;
			}
		}
		// deck selection
		if ((game.select.is(S.DECK, S.DISCARD, S.VOID) && game.select.get()[1]) || game.select.is(S.CARDS, S.PURIFIER, S.REFINER)) {
			const handled = deckSelection();
			if (handled) return;
		}
		// scrolling
		if (game.select.is(S.HELP)) {
			if (action === DIR.UP && infoPos > 0 && infoLimit > 0) {
				infoPos -= 11;
			} else if (action === DIR.DOWN && infoPos < infoLimit) {
				infoPos += 11;
			}
		}
		// select options
		if (game.select.is(S.OPTIONS)) {
			if (action === DIR.UP && game.select.get()[1] > 1) {
				game.select.get()[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN && game.select.get()[1] > 0 && game.select.get()[1] - 2 < Object.keys(global.options).length) {
				game.select.get()[1]++;
				actionTimer = 1;
				return;
			}
		}
		// deselect extras
		if (game.select.is(S.LOOKER, S.HELP, S.OPTIONS) && !game.select.get()[1]) {
			if (action === DIR.LEFT && game.select.is(S.LOOKER)) {
				game.select.set(S.ARTIFACTS, game.artifacts.length - 1);
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT && game.select.is(S.HELP)) {
				game.select.set(S.LOOKER);
				actionTimer = 1;
				return;
			} else if (action === DIR.LEFT && game.select.is(S.OPTIONS)) {
				game.select.set(S.HELP);
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select.is(S.LOOKER)) {
				game.select.set(S.HELP);
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select.is(S.HELP)) {
				game.select.set(S.OPTIONS);
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN) {
				if (hasPopups()) {
					game.select.set(S.POPUPS, activePopups.length - 1);
					while (game.select.get()[1] >= 0 && !activePopups[game.select.get()[1]].length) {
						game.select.get()[1]--;
					}
				} else if (!game.enemies.length) {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				} else {
					game.select.set(S.ENEMY);
				}
				actionTimer = 1;
				return;
			}
		}
		// artifacts
		if (game.select.is(S.ARTIFACTS)) {
			if (action === DIR.LEFT) {
				game.select.get()[1]--;
			} else if (action === DIR.RIGHT) {
				if (game.select.get()[1] >= game.artifacts.length - 1) {
					game.select.set(S.LOOKER);
				} else {
					game.select.get()[1]++;
				}
			} else if (action === DIR.DOWN) {
				game.select.set(S.PLAYER);
			}
			if (game.select.is(S.ARTIFACTS)) {
				game.select.get()[1] = Math.min(Math.max(game.select.get()[1], 0), game.artifacts.length - 1);
			}
			if (action === DIR.LEFT || action === DIR.RIGHT || action === DIR.DOWN) {
				actionTimer = 1;
				return;
			}
		}
		// select hand
		if (game.select.is(-1)) game.select.set(S.HAND, 0);
		// cards in hand
		if (game.select.is(S.HAND)) {
			if (!game.hand) {
				game.select.set(S.END_TURN);
			} else {
				if (action === DIR.LEFT) {
					game.select.get()[1]--;
				} else if (action === DIR.RIGHT) {
					game.select.get()[1]++;
				} else if (action === DIR.UP) {
					let to = 0;
					for (let index = 1; index < game.enemies.length; index++) {
						if (enemyPos[index][1] > enemyPos[to][1] || (enemyPos[index][1] == enemyPos[to][1] && enemyPos[index][0] < enemyPos[to][0])) {
							to = index;
						}
					}
					game.select.set(S.ENEMY, to);
				}
				if (game.select.is(S.HAND)) {
					game.select.get()[1] = Math.min(Math.max(game.select.get()[1], 0), game.hand.length - 1);
				}
				if (action === DIR.LEFT || action === DIR.RIGHT || action === DIR.UP) {
					actionTimer = 1;
					return;
				}
			}
		}
		// hand selection from effect
		if (game.select.is(SS.SELECT_HAND)) {
			if (action === DIR.LEFT && game.select.get()[1] >= 0) {
				game.select.get()[1]--;
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT && game.select.get()[1] < game.hand.length - 1) {
				game.select.get()[1]++;
				actionTimer = 1;
				return;
			}
		}
		// select enemy
		if (game.select.is(S.ATTACK, S.ENEMY)) {
			if (action === DIR.LEFT) {
				if (game.select.get()[1] < game.enemies.length - 1) game.select.get()[1]++;
				else game.select.set(S.PLAYER);
				actionTimer = 1;
				return;
			} else if (action === DIR.RIGHT) {
				if (game.select.get()[1]) game.select.get()[1]--;
				else if (game.void.length) game.select.set(S.VOID);
				else game.select.set(S.DISCARD);
				actionTimer = 1;
				return;
			} else if (action === DIR.DOWN && game.select.is(S.ENEMY)) {
				if (!game.hand[0]) {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				} else {
					game.select.set(S.HAND, game.prevCard);
				}
				actionTimer = 1;
				return;
			}
		}
	}
})();

/**
 * Performs the current action.
 * @param {boolean} back - Whether the action is a back action.
 */
const performAction = (() => {
	const PIXEL_SIZES = [1, 2, 0.5];
	const MUSIC_TRACKS = ["default", "Ruins of Caelum", "The Final Ruins", "Future Dungeon", "The Singularity"];
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
				kills += prevGame.kills[key];
			}
			return kills;
		}
		return 0;
	}
	/**
	 * Attempts to copy the player's old save.
	 */
	function tryCopyOldSave() {
		tryUseClipboard(() => {
			const obj = {
				global: parseSave(localStorage.getItem(ID + "/old/global")),
				run: parseSave(localStorage.getItem(ID + "/old/run")),
			};
			return btoa(JSON.stringify(obj));
		}, () => {
			menuSelect.set(MENU.OLD_SAVE_ALERT);
		}, () => {
			menuSelect.set(MENU.OLD_SAVE_COPY_FAILED);
		});
	}
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
		}
		// start player animation
		startAnim.player(CARDS[id].attackAnim ?? I.player.attack);
	}
	/**
	 * Exits the rewards menu.
	 */
	function exitRewardsMenu() {
		if (onFloorWithCutscene()) {
			game.select = new SelectState([S.CUTSCENE, 0]);
		} else {
			game.select = new SelectState([S.ARTIFACTS, 0]);
			mapPopup();
		}
	}
	return (back = false) => {
		// action timer
		if (actionTimer > -1 || (handAnim.length > 0 && game.state !== STATE.EVENT_FIN)) return;
		// menus
		if (game.select.is(S.WELCOME)) {
			game.select.set(-1);
			actionTimer = 2;
		} else if (menuSelect.is(MENU.MAIN)) {
			if (back) {
				return;
			}
			if (menuSelect.get()[1] === 0) {
				if (game.map.length > 0) {
					menuSelect.set(-1);
				}
			} else if (menuSelect.get()[1] == 1) {
				if (game.map.length > 0) {
					menuSelect.set(MENU.START_NEW_RUN, 1);
				} else {
					menuSelect.set(-1);
					generateMap();
					return;
				}
			} else if (menuSelect.get()[1] == 2) {
				menuSelect.set(MENU.CHANGE_DIFFICULTY, 1);
			} else if (menuSelect.get()[1] == 3) {
				menuSelect.set(MENU.CHANGE_SEED, 1);
			} else if (menuSelect.get()[1] == 4) {
				if (global.prevGames.length > 0) {
					menuSelect.set(MENU.PREV_GAMES);
					menuScroll = 0;
				}
			}
			actionTimer = 2;
		} else if (menuSelect.is(MENU.START_NEW_RUN)) {
			if (!menuSelect.get()[1] && !back) {
				endRun(true);
				return;
			} else {
				menuSelect.set(MENU.MAIN, 1);
				actionTimer = 2;
			}
		} else if (menuSelect.is(MENU.CHANGE_DIFFICULTY)) {
			if (!menuSelect.get()[1] && !back) {
				endRun(false, 1 - game.difficulty);
				return;
			} else {
				menuSelect.set(MENU.MAIN, 2);
				actionTimer = 2;
			}
		} else if (menuSelect.is(MENU.CHANGE_SEED)) {
			if (!menuSelect.get()[1] && !back) {
				menuSelect.set(MENU.ENTER_SEED);
			} else {
				menuSelect.set(MENU.MAIN, 3);
			}
			actionTimer = 2;
		} else if (menuSelect.is(MENU.ENTER_SEED)) {
			if (newSeed && !back) {
				endRun();
				return;
			} else {
				menuSelect.set(MENU.CHANGE_SEED);
				actionTimer = 2;
			}
		} else if (menuSelect.is(MENU.PREV_GAMES)) {
			if (!back) {
				menuSelect.get()[0] = MENU.PREV_GAME_INFO;
			} else {
				menuSelect.set(MENU.MAIN, 4);
			}
			actionTimer = 2;
		} else if (menuSelect.is(MENU.PREV_GAME_INFO)) {
			menuSelect.get()[0] = MENU.PREV_GAMES;
			actionTimer = 2;
		} else if (menuSelect.is(MENU.PREV_GAME_SORT)) {
			if (back) {
				if (menuSelect.get()[1]) {
					menuSelect.get()[1]--;
				} else if (menuSelect.getPrev()) {
					menuSelect.pop();
				} else {
					menuSelect.set(MENU.PREV_GAMES);
				}
			} else if (menuSelect.get()[1]) {
				menuSelect.set(MENU.PREV_GAMES);
				menuScroll = 0;
				sortedPrevGames = getSortedIndexes(global.prevGames, (a, b) => {
					const aVal = getPrevGameSortValue(a);
					const bVal = getPrevGameSortValue(b);
					const sortValue = (aVal < bVal ? -1 : (aVal === bVal ? 0 : 1));
					return prevGamesSort[1] ? 0 - sortValue : sortValue;
				});
			} else {
				menuSelect.get()[1]++;
			}
			actionTimer = 2;
		} else if (menuSelect.is(MENU.CONF_REMOVE_PREV_GAME)) {
			const prevSelect = menuSelect.getPrev();
			if (!prevSelect) {
				menuSelect.set(MENU.PREV_GAMES);
				return;
			}
			if (!menuSelect.get()[1] && !back) {
				if (global.prevGames.length <= 1) {
					global.prevGames = [];
					sortedPrevGames = [];
					menuSelect.set(MENU.MAIN, 3);
					actionTimer = 2;
					return;
				}
				const sortIndex = Math.floor(prevSelect[1] / 3);
				const index = sortedPrevGames[sortIndex];
				global.prevGames.splice(index, 1);
				sortedPrevGames.splice(sortIndex, 1);
				sortedPrevGames = sortedPrevGames.map(val => (val > index ? val - 1 : val));
				if (sortIndex == sortedPrevGames.length) prevSelect[1] -= 3;
			}
			menuSelect.pop();
			actionTimer = 2;
		} else if (menuSelect.is(MENU.OLD_SAVE_ALERT)) {
			if (menuSelect.get()[1] === 0 || back) {
				menuSelect.set(MENU.MAIN, (game.map.length > 0 ? 0 : 1));
			} else if (menuSelect.get()[1] === 1) {
				tryCopyOldSave();
			} else {
				localStorage.removeItem(ID + "/old/global");
				localStorage.removeItem(ID + "/old/run");
				menuSelect.set(MENU.MAIN, (game.map.length > 0 ? 0 : 1));
			}
			actionTimer = 2;
		} else if (menuSelect.is(MENU.OLD_SAVE_COPY_FAILED)) {
			if (!menuSelect.get()[1] && !back) {
				tryCopyOldSave();
			} else {
				menuSelect.set(MENU.OLD_SAVE_ALERT, 1);
			}
			actionTimer = 2;
		}
		if (inMenu() || actionTimer > -1) return;
		// cutscene
		const availableLocations = get.availableLocations();
		if (game.select.is(S.CUTSCENE)) {
			if (game.select.get()[1] > 0) {
				game.select.set(S.MAP, availableLocations.length);
				cutsceneAnim = [];
			}
			return;
		}
		// player turn
		if (game.turn === TURN.PLAYER) {
			// only one card can be active
			if (game.enemyAtt[3]) return;
			// attack enemy
			if (game.select.is(S.ATTACK)) {
				if (back) {
					game.select.pop();
					game.enemyAtt = [-1, -1, new Card(), false];
					actionTimer = 4;
				} else {
					const id = game.enemyAtt[2].id;
					game.energy -= getCardCost(game.enemyAtt[2]);
					activateAttackEffects(id);
					game.enemyAtt[3] = true;
					discardCard(game.enemyAtt[0], true);
					activateArtifacts(FUNC.PLAY_CARD, game.enemyAtt[2]);
					game.enemyAtt[0] = -1;
					game.enemyAtt[1] = game.select.get()[1];
					game.select.setBackTo(S.HAND, Math.max(game.prevCard - 1, 0));
					updateData();
					if (CARDS[id].attackEffects === false) postCardActivation();
				}
				return;
			}
			// activate special selection effect
			if (game.select.is(SS.SELECT_HAND)) {
				if (game.select.get()[1] === -1 || game.select.get()[1] === game.hand.length - 1 || back) {
					handSelectPos = [];
					game.select.pop();
					game.enemyAtt = [-1, -1, new Card(), false];
					actionTimer = 4;
				} else {
					handSelectPos = [];
					if (CARDS[game.enemyAtt[2].id].effectAnim) startAnim.effect(CARDS[game.enemyAtt[2].id].effectAnim);
					if (CARDS[game.enemyAtt[2].id].effect) CARDS[game.enemyAtt[2].id].effect(game.enemyAtt[2].level);
					game.energy -= getCardCost(game.enemyAtt[2]);
					discardCard(game.enemyAtt[0], true);
					activateArtifacts(FUNC.PLAY_CARD, game.enemyAtt[2]);
					game.select.setBackTo(S.HAND, Math.max(game.prevCard - 1, 0));
					game.enemyAtt = [-1, -1, new Card(), false];
					updateData();
					postCardActivation();
				}
				return;
			}
			// play card
			if (game.select.is(S.HAND) && !back) {
				const isSelected = game.hand[game.select.get()[1]];
				const id = isSelected.id;
				if (CARDS[id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
					if (CARDS[isSelected.id].rarity == 2) notif = [game.select.get()[1], 0, "unplayable", -2];
					else notif = [game.select.get()[1], 0, "unplayable", 0];
					actionTimer = 1;
				} else if (CARDS[id].can && !CARDS[id].can(isSelected.level)) {
					if (CARDS[isSelected.id].rarity == 2) notif = [game.select.get()[1], 0, isSelected.getAttr("cannotMessage"), -2];
					else notif = [game.select.get()[1], 0, isSelected.getAttr("cannotMessage"), 0];
					actionTimer = 1;
				} else if (game.energy >= getCardCost(isSelected)) {
					if (CARDS[id].select) { // effects of cards that have a special selection
						game.enemyAtt[0] = game.select.get()[1];
						const specialSelect = run(CARDS[id].select);
						game.select.push(specialSelect[0], specialSelect[1]);
						game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
						actionTimer = 4;
					} else if (CARDS[id].effect) { // effects of cards that activate right away
						if (CARDS[id].effectAnim) startAnim.effect(CARDS[id].effectAnim);
						CARDS[id].effect(isSelected.level);
						game.energy -= getCardCost(isSelected);
						discardCard(game.select.get()[1], true);
						activateArtifacts(FUNC.PLAY_CARD, isSelected);
						game.select.set(S.HAND, Math.max(game.prevCard - 1, 0));
						updateData();
						postCardActivation();
					} else if (CARDS[id].damage || CARDS[id].attack) { // effects of attack cards
						if (CARDS[id].target === false) {
							game.energy -= getCardCost(isSelected);
							game.enemyAtt[2] = isSelected;
							activateAttackEffects(id);
							game.enemyAtt[3] = true;
							discardCard(game.select.get()[1], true);
							activateArtifacts(FUNC.PLAY_CARD, isSelected);
							game.select.set(S.HAND, Math.max(game.prevCard - 1, 0));
							updateData();
							if (CARDS[id].attackEffects === false) postCardActivation();
						} else {
							game.enemyAtt[0] = game.select.get()[1];
							game.select.push(S.ATTACK, game.enemies.length - 1);
							game.enemyAtt[2] = game.hand[game.enemyAtt[0]];
							if (game.enemies.length > 1) actionTimer = 4;
						}
					}
				} else {
					if (CARDS[isSelected.id].rarity == 2) notif = [game.select.get()[1], 0, "not enough energy", -2];
					else notif = [game.select.get()[1], 0, "not enough energy", 0];
					actionTimer = 1;
				}
				return;
			}
		}
		// game end
		if (game.select.is(S.GAME_OVER, S.GAME_WON) && game.select.get()[1] === 50 && !back) {
			endRun();
			return;
		}
		// confirmation
		if (game.select.is(S.CONF_END_TURN)) {
			if (game.select.get()[1] || back) {
				game.select.pop();
			} else {
				endTurn();
				game.select.set(S.END_TURN);
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CONF_EXIT)) {
			if (game.select.get()[1] || back) {
				game.select.pop();
			} else {
				exitRewardsMenu();
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CONF_SURRENDER)) {
			if (game.select.get()[1] || back) {
				game.select.pop();
				actionTimer = 2;
			} else {
				endRun();
			}
			return;
		} else if (game.select.is(S.CONF_HAND_ALIGN)) {
			if (game.select.get()[1] === 2 || back) {
				game.select.pop();
			} else {
				game.floor++;
				game.location = availableLocations[0];
				if (game.select.get()[1] === 0) getArtifact(202);
				game.select.set(-1);
				game.state = STATE.ENTER;
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CONF_PURIFY)) {
			if (game.select.get()[1] === 1 || back) {
				game.select.pop();
			} else {
				if (game.select.get()[1] === 0) game.cards.splice(game.cardSelect, 1);
				const index = game.rewards.findIndex(arr => arr[0] === REWARD.PURIFIER);
				if (index >= 0) {
					if (game.select.get()[1] === 0) game.rewards[index][2] = true;
					game.select.pop();
					game.select.pop();
				}
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CONF_REFINE)) {
			if (game.select.get()[1] || back) {
				game.select.pop();
			} else {
				refinableDeck[game.cardSelect].level = 1;
				refinableDeck = [];
				const index = game.rewards.findIndex(arr => arr[0] === REWARD.REFINER);
				if (index >= 0) {
					game.rewards[index][2] = true;
					game.select.pop();
					game.select.pop();
				}
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CONF_PEARL) && !back) {
			if (game.select.get()[1]) {
				game.select.pop();
			} else {
				game.energy--; // spend 1 energy picking up the pearl
				getArtifact(204); // give player artifact "Shrouded Pearl"
				game.select.setBackTo(S.ARTIFACTS, game.artifacts.length - 1);
			}
			actionTimer = 2;
			return;
		}
		// rewards
		if (game.select.is(S.REWARDS) && !back) {
			const arr = game.rewards[game.select.get()[1]];
			if (!arr[2]) {
				if (arr[0] === REWARD.GOLD) {
					game.gold += arr[1] ?? 0;
					arr[2] = true;
				} else if (arr[0] === REWARD.CARD) {
					game.select.push(S.CARD_REWARD, -1);
				} else if (arr[0] === REWARD.ARTIFACT) {
					game.select.push(S.ARTIFACT_REWARD, -1);
				} else if (arr[0] === REWARD.HEALTH) {
					game.health += arr[1] ?? 0;
					arr[2] = true;
				} else if (arr[0] === REWARD.PURIFIER) {
					game.select.push(S.PURIFIER);
				} else if (arr[0] === REWARD.REFINER) {
					game.select.push(S.REFINER);
				} else if (arr[0] === REWARD.FINISH) {
					if (game.rewards.some(arr => arr[0] !== REWARD.FINISH && !arr[2])) {
						game.select.push(S.CONF_EXIT, 1);
					} else {
						exitRewardsMenu();
					}
				}
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CARD_REWARD, S.ARTIFACT_REWARD)) {
			let index = 0;
			if (game.select.is(S.CARD_REWARD)) {
				index = game.rewards.findIndex(arr => arr[0] === REWARD.CARD);
			} else if (game.select.is(S.ARTIFACT_REWARD)) {
				index = game.rewards.findIndex(arr => arr[0] === REWARD.ARTIFACT);
			}
			if (game.select.get()[1] >= 0 && !back) {
				const currentRoom = getCurrentRoom();
				if (game.select.is(S.CARD_REWARD) && currentRoom[5]) {
					game.cards.push(new Card(currentRoom[5][game.select.get()[1]]));
				} else if (game.select.is(S.ARTIFACT_REWARD) && currentRoom[6]) {
					getArtifact(currentRoom[6][game.select.get()[1]]);
				}
				if (index >= 0) {
					game.rewards[index][2] = true;
				}
			}
			game.select.pop();
			actionTimer = 2;
			return;
		}
		// map
		if (game.select.is(S.MAP) && game.state === STATE.EVENT_FIN && availableLocations[game.select.get()[1]] !== undefined && !back) {
			const now = new Date();
			if (game.floor === 9 && game.difficulty === 1 && ((now.getHours() % 12 === 11 && now.getMinutes() >= 59) || (now.getHours() % 12 === 0 && now.getMinutes() <= 1))) {
				game.select.push(S.CONF_HAND_ALIGN, 2);
			} else {
				game.floor++;
				game.location = availableLocations[game.select.get()[1]];
				game.select.set(-1);
				game.state = STATE.ENTER;
			}
			actionTimer = 1;
			return;
		}
		// event
		if (game.select.is(S.EVENT) && !back) {
			let event = getCurrentEvent();
			if (event?.options[game.select.get()[1]]) {
				game.event[1] = run(event.options[game.select.get()[1]][1]);
				event = getCurrentEvent();
				event?.onEnter?.();
				if (game.select.is(S.EVENT)) {
					game.select.get()[1] = -1;
				}
				actionTimer = 2;
				return;
			}
		}
		// popups
		if (game.select.is(S.POPUPS) && activePopups[game.select.get()[1]] && !back) {
			const action = activePopups[game.select.get()[1]][4];
			activePopups[game.select.get()[1]] = [];
			while (game.select.get()[1] >= 0 && !activePopups[game.select.get()[1]].length) {
				game.select.get()[1]--;
			}
			if (game.select.get()[1] == -1) {
				if (!game.hand.length) {
					if (game.void.length) game.select.set(S.VOID);
					else game.select.set(S.DISCARD);
				} else {
					game.select.set(S.HAND, game.prevCard);
				}
			}
			action?.();
			actionTimer = 1;
			return;
		}
		// purifier
		if (game.select.is(S.PURIFIER)) {
			if (back) {
				game.select.pop();
			} else {
				game.select.push(S.CONF_PURIFY, 1);
			}
			actionTimer = 2;
			return;
		}
		// refiner
		if (game.select.is(S.REFINER)) {
			if (back) {
				game.select.pop();
				actionTimer = 2;
				return;
			} else if (refinableDeck[game.cardSelect]) {
				game.select.push(S.CONF_REFINE, 1);
				actionTimer = 2;
				return;
			}
		}
		// activate / deactivate extras
		if (game.select.is(S.DECK, S.DISCARD, S.VOID)) {
			if (game.select.get()[1] === 1) {
				game.select.pop();
			} else if (!back) {
				game.select.push(game.select.get()[0], 1);
			}
			actionTimer = 2;
			return;
		} else if (game.select.is(S.ARTIFACTS) && game.select.get()[1] === 0 && !back) {
			game.select.push(S.MAP, -1);
			actionTimer = 2;
			return;
		} else if (game.select.is(S.MAP) && (game.select.get()[1] === -1 || back) && game.select.getPrev()) {
			game.select.pop();
			actionTimer = 2;
			return;
		} else if (game.select.is(S.MAP) && game.select.get()[1] === availableLocations.length) {
			game.select.push(S.CARDS);
			actionTimer = 2;
			return;
		} else if (game.select.is(S.CARDS)) {
			game.select.pop();
			actionTimer = 2;
			return;
		} else if (game.select.is(S.LOOKER)) {
			if (game.select.get()[1] === 0 && !back) game.select.get()[1] = 1;
			else game.select.get()[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select.is(S.HELP)) {
			if (game.select.get()[1] <= 2 && !back) game.select.get()[1]++;
			else game.select.get()[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select.is(S.OPTIONS) && (game.select.get()[1] <= 1 || back)) {
			if (game.select.get()[1] === 0 && !back) game.select.get()[1] = 1;
			else game.select.get()[1] = 0;
			actionTimer = 2;
			return;
		} else if (game.select.is(S.END_TURN) && game.turn === TURN.PLAYER && !back) {
			endTurnConfirm();
			return;
		}
		// options
		if (game.select.is(S.OPTIONS)) {
			const option = +Object.keys(global.options)[game.select.get()[1] - 2];
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
				game.select.push(S.CONF_SURRENDER, 1);
			}
			if (option === OPTION.MUSIC) {
				if (global.options[OPTION.MUSIC]) musicElement.play();
				else musicElement.pause();
				musicPopup();
			} else if (option === OPTION.PERFECT_SCREEN || option === OPTION.PERFECT_SIZE) {
				fixCanvas();
			} else if (option === OPTION.MUSIC_TRACK) {
				fadeMusic();
			}
			if (global.options[OPTION.MUSIC_TRACK]) {
				// secret already obtained
			} else if (secret) {
				if (global.options[OPTION.MUSIC] === false
					&& global.options[OPTION.SCREEN_SHAKE] === true
					&& global.options[OPTION.STICKY_CARDS] === true
					&& global.options[OPTION.PERFECT_SCREEN] === false
					&& global.options[OPTION.PERFECT_SIZE] === 1
					&& global.options[OPTION.FAST_MOVEMENT] === true
					&& global.options[OPTION.AUTO_END_TURN] === false
					&& global.options[OPTION.END_TURN_CONFIRM] === true
				) {
					global.options[OPTION.MUSIC_TRACK] = "default";
				}
			} else {
				if (global.options[OPTION.MUSIC] === true
					&& global.options[OPTION.SCREEN_SHAKE] === false
					&& global.options[OPTION.STICKY_CARDS] === true
					&& global.options[OPTION.PERFECT_SCREEN] === true
					&& global.options[OPTION.PERFECT_SIZE] === 2
					&& global.options[OPTION.FAST_MOVEMENT] === false
					&& global.options[OPTION.AUTO_END_TURN] === true
					&& global.options[OPTION.END_TURN_CONFIRM] === false
				) {
					secret = true;
				}
			}
			actionTimer = 2;
			return;
		}
	}
})();
