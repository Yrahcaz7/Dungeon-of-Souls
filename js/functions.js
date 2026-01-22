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

/**
 * Returns a boolean indicating whether the middleground layers are hidden.
 */
function hidden() {
	return !!((game.select[0] === S.LOOKER || game.select[0] === S.HELP || game.select[0] === S.OPTIONS || game.select[0] === S.DECK || game.select[0] === S.DISCARD || game.select[0] === S.VOID) && game.select[1]) || game.select[0] === S.MAP || game.select[0] === S.CARDS || game.select[0] === S.CONF_HAND_ALIGN || game.select[0] === S.CONF_SURRENDER;
};

/**
 * Returns a boolean indicating whether a menu is being viewed.
 */
function inMenu() {
	return menuSelect[0] !== -1 || game.select[0] === S.WELCOME;
};

/**
 * Returns a boolean indicating whether a deck outside battle is being viewed.
 */
function inOutsideDeck() {
	return menuSelect[0] === MENU.PREV_GAME_INFO || game.select[0] === S.CARDS || game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY || game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE;
};

/**
 * Returns a boolean indicating whether a deck is being viewed.
 */
function inDeck() {
	return !!((game.select[0] === S.DECK || game.select[0] === S.DISCARD || game.select[0] === S.VOID) && game.select[1]) || inOutsideDeck();
};

/**
 * Returns the current deck being viewed. If there is none, returns an empty array.
 * @returns {Card[]}
 */
function currentDeck() {
	if (inMenu()) {
		if (menuSelect[0] === MENU.PREV_GAME_INFO) return global.prevGames[sortedPrevGames[Math.floor(menuSelect[1] / 3)]].cards;
	} else {
		if (game.select[0] === S.DECK && game.select[1]) return Card.sort(game.deck.slice());
		if (game.select[0] === S.DISCARD && game.select[1]) return game.discard;
		if (game.select[0] === S.VOID && game.select[1]) return game.void;
		if (game.select[0] === S.CARDS) return game.cards;
		if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY) return game.cards;
		if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) return refinableDeck;
	};
	return [];
};

/**
 * Returns a boolean indicating whether the current floor ends in a cutscene.
 */
function onFloorWithCutscene() {
	return game.floor == 10;
};

/**
 * Returns a boolean indicating whether the specified player image is defending.
 * @param {HTMLImageElement} image - the player image to check.
 */
function isDefending(image) {
	return image === I.player.shield || image === I.player.shield_reinforced || image === I.player.crouch_shield || image === I.player.crouch_shield_reinforced;
};

/**
 * Returns a boolean indicating whether the specified player image is crouching.
 * @param {HTMLImageElement} image - the player image to check.
 */
function isCrouching(image) {
	return image === I.player.crouch_shield || image === I.player.crouch_shield_reinforced;
};

/**
 * Returns a boolean indicating whether the player can play any card from their hand.
 */
function areAnyCardsPlayable() {
	return game.turn === TURN.PLAYER && game.hand.some(card => {
		const cardInfo = CARDS[card.id];
		return getCardCost(card) <= game.energy && !cardInfo.keywords.includes(CARD_EFF.UNPLAYABLE) && (!cardInfo.can || cardInfo.can(card.level));
	});
};

const get = {
	/**
	 * Gets the current area number based on the floor.
	 * @param {number} floor - defaults to `game.floor`.
	 */
	area(floor = game.floor) {
		if (floor < 1) return 0;
		return Math.floor((floor - 1) / 10);
	},
	/**
	 * Gets the number of card reward choices.
	 */
	cardRewardChoices() {
		let choices = 3;
		if (hasArtifact(104)) choices++;
		return choices;
	},
	/**
	 * Gets the player's hand size.
	 */
	handSize() {
		let size = 5;
		if (hasArtifact(104)) size--;
		if (hasArtifact(205)) size++;
		return size;
	},
	/**
	 * Gets the player's maximum health.
	 */
	maxHealth() {
		let max = 60;
		if (hasArtifact(102)) max -= 15;
		if (hasArtifact(105)) max += 15;
		return max;
	},
	/**
	 * Gets the player's maximum shield.
	 */
	maxShield() {
		let max = 60;
		return max;
	},
	/**
	 * Gets the player's maximum energy.
	 */
	maxEnergy() {
		let max = 3;
		if (hasArtifact(103)) max++;
		if (hasArtifact(203)) max++;
		return max;
	},
	/**
	 * Gets the current extra damage effect.
	 * @param {boolean} attacking - whether the player is the middle of attacking.
	 */
	extraDamage(attacking = false) {
		let extra = 0;
		if (game.attackEffects.includes(ATT_EFF.AURA_BLADE)) {
			extra += 5 + ((game.eff[EFF.AURA_BLADE] || 0) + 1);
		} else if (game.eff[EFF.AURA_BLADE] && !attacking) {
			extra += 5 + game.eff[EFF.AURA_BLADE];
		};
		if (hasArtifact(101)) extra += 2;
		return extra;
	},
	/**
	 * Gets the current dealing damage multiplier effect.
	 * @param {number} index - the index of the enemy that is being damaged. Defaults to `game.enemyAtt[1]`.
	 */
	dealDamageMult(index = game.enemyAtt[1]) {
		let mult = 1;
		if (game.eff[EFF.WEAKNESS]) mult -= 0.25;
		if (game.eff[EFF.ATKUP]) mult += 0.25;
		if (game.enemies[index]?.eff[EFF.RESILIENCE]) mult -= 0.25;
		return mult;
	},
	/**
	 * Gets the current taking damage multiplier effect.
	 * @param {number} index - the index of the enemy that is attacking. Defaults to `game.enemyNum`.
	 */
	takeDamageMult(index = game.enemyNum) {
		let mult = 1;
		if (game.enemies[index]?.eff[EFF.WEAKNESS]) mult -= 0.25;
		if (game.enemies[index]?.eff[EFF.ATKUP]) mult += 0.25;
		if (game.eff[EFF.RESILIENCE]) mult -= 0.25;
		if (hasArtifact(203)) mult += 0.25;
		return mult;
	},
	/**
	 * Gets the current extra shield effect.
	 */
	extraShield() {
		let extra = 0;
		if (hasArtifact(100)) extra += 2;
		return extra;
	},
	/**
	 * Gets the current shield gaining multiplier effect for the player.
	 */
	playerShieldMult() {
		let mult = 1;
		if (game.eff[EFF.DEFUP]) mult += 0.25;
		return mult;
	},
	/**
	 * Gets the current shield gaining multiplier effect for an enemy.
	 * @param {number} enemy - the index of the enemy that is gaining shield. Defaults to `game.enemyNum`.
	 */
	enemyShieldMult(enemy = game.enemyNum) {
		let mult = 1;
		if (game.enemies[enemy]?.eff[EFF.DEFUP]) mult += 0.25;
		return mult;
	},
	/**
	 * Gets the version display.
	 * @param {number} version - the version to display. Defaults to `global.version`.
	 */
	versionDisplay(version = global.version) {
		if (version < 2_000_000) return "?.?.?";
		const major = Math.floor(version / 1_000_000) % 1_000;
		const minor = Math.floor(version / 1_000) % 1_000;
		const build = Math.floor(version) % 1_000;
		return major + "." + minor + "." + build;
	},
	/**
	 * Returns an array of locations that the player can move to from their current one.
	 * @param {number[]} location - The player's location. Defaults to `game.location`.
	 * @returns {number[][]}
	 */
	availableLocations(location = game.location) {
		if (location.length >= 2) return (paths[location[0]] || {})[location[1]] || [];
		return paths[location[0]] || [];
	},
	/**
	 * Gets the array of card positions for a hand of a certain size.
	 * @param {number} size - the size of the hand. Defaults to `game.hand.length`.
	 */
	handPos(size = game.hand.length) {
		let positions = [];
		const margin = [-4, -4, -4, -4, -4, 8, 16, 24, 28, 32, 36, 38, 40, 42, 44, 46, 46, 48, 48, 50, 50, 52, 52, 52, 52, 54, 54, 54, 54];
		if (size > margin.length) size = margin.length;
		for (let index = 0; index < size; index++) {
			positions.push(Math.round(198 + (index - (size / 2)) * 64 - (index - ((size - 1) / 2)) * margin[size - 1]));
		};
		return positions;
	},
};

/**
 * Shuffles a deck and returns it.
 * @param {Card[]} deck - the deck to shuffle.
 */
function shuffle(deck) {
	for (let index = deck.length - 1; index > 0; index--) {
		const rand = Math.floor(random() * (index + 1));
		[deck[index], deck[rand]] = [deck[rand], deck[index]];
	};
	return deck;
};

/**
 * Updates the positions of the cards in hand.
 * @param {Card[]} prevHand - the previous hand. Defaults to `game.hand`.
 * @param {number} discardIndex - the discarded card's index, if any.
 * @param {number} prevCardAnim - the y-position of the discarded card. Defaults to `146`.
 */
function updateHandPos(prevHand = game.hand, discardIndex = -1, discardY = 146) {
	// calculate handPos
	const prevHandPos = handPos;
	handPos = get.handPos(game.hand.length);
	// discard extra cards
	if (game.hand.length > handPos.length) {
		const extraCards = game.hand.splice(handPos.length);
		for (const card of extraCards) {
			game.discard.push(new Card(card.id, card.level));
		};
	};
	// start card draw/discard animation
	if (loaded && handPos.length != prevHandPos.length && !hidden() && game.select[0] !== S.PLAYER && game.select[0] !== S.ENEMY && (handAnim.length == 0 || handAnim.at(-1)[0] < 10 || Math.sign(handPos.length - prevHandPos.length) != Math.sign(prevHandPos.length - handAnim.at(-1)[2].length))) {
		handAnim.push([10, prevHand, prevHandPos, []]);
		if (discardIndex >= 0) handAnim.at(-1)[3][discardIndex] = discardY;
	};
};

/**
 * Updates the animating cards, card positions, and index offsets for the animated hand.
 */
function updateAnimatedHandData() {
	handAnimCards = game.hand;
	if (handAnim.length > 0) {
		handAnim[0][0]--;
		if (handAnim[0][0] > 0 || handAnim.length > 1) {
			for (let index = 0; index < handAnim.length; index++) {
				if (handAnim[index][1].length > (handAnim[index + 1] ? handAnim[index + 1][1] : game.hand).length) {
					handAnimCards = handAnim[index][1];
					break;
				};
			};
			const prevHand = handAnim[0][1];
			const nextHand = (handAnim[1] ? handAnim[1][1] : game.hand);
			const prevHandPos = handAnim[0][2];
			const nextHandPos = (handAnim[1] ? handAnim[1][2] : handPos);
			handAnimPositions = [];
			handAnimOffsets = [0];
			const len = Math.max(prevHand.length, nextHand.length);
			for (let index = 0; index < len; index++) {
				handAnimPositions[index] = [];
				const effIndex = index - handAnimOffsets[index];
				if (prevHandPos[index]) {
					if (prevHand[index] != nextHand[effIndex]) {
						handAnimPositions[index][0] = prevHandPos[index];
						const prevY = handAnim[0][3][index] ?? 146;
						handAnimPositions[index][1] = Math.round((200 + 5 - prevY) * (1 - handAnim[0][0] / 10) + prevY);
						handAnimOffsets[index]++;
					} else {
						handAnimPositions[index][0] = Math.round(nextHandPos[effIndex] * (1 - handAnim[0][0] / 10) + prevHandPos[index] * (handAnim[0][0] / 10));
						for (let anim = 0; anim < handAnim.length; anim++) {
							if (handAnim[anim][3][index]) {
								handAnimPositions[index][1] = handAnim[anim][3][index];
								break;
							};
						};
					};
				} else {
					handAnimPositions[index][0] = nextHandPos[effIndex];
					handAnimPositions[index][1] = Math.round((146 + 100) * (1 - handAnim[0][0] / 10) - 100);
				};
				handAnimOffsets[index + 1] = handAnimOffsets[index];
			};
			if (handAnim[0][0] == 0) handAnim.shift();
			return;
		} else {
			handAnim.shift();
		};
	};
	handAnimPositions = handPos.map(x => [x]);
	handAnimOffsets = [];
};

/**
 * Draws cards.
 * @param {number} num - the number of cards to draw.
 */
function drawCards(num) {
	const prevHand = game.hand.slice();
	for (; num > 0 && game.deck.length > 0; num--) {
		game.hand.push(game.deck.pop());
	};
	if (num > 0) {
		game.deck = shuffle(game.discard);
		game.discard = [];
		for (; num > 0 && game.deck.length > 0; num--) {
			game.hand.push(game.deck.pop());
		};
	};
	updateHandPos(prevHand);
};

/**
 * Adds a new temporary card to hand.
 * @param {number} id - the card's id. Defaults to 0.
 * @param {number} level - the card's level. Defaults to 0.
 */
function addCard(id = 0, level = 0) {
	const prevHand = game.hand.slice();
	game.hand.push(new Card(id, level, true));
	updateHandPos(prevHand);
};

/**
 * Discards a card.
 * @param {number} index - the index of the card.
 * @param {boolean} used - whether the card was used. Defaults to `false`.
 */
function discardCard(index, used = false) {
	const cardObj = game.hand[index];
	if (used && CARDS[cardObj.id].keywords.includes(CARD_EFF.ONE_USE)) game.void.push(new Card(cardObj.id, cardObj.level, cardObj.eff[CARD_EFF.TEMP]));
	else game.discard.push(new Card(cardObj.id, cardObj.level, cardObj.eff[CARD_EFF.TEMP]));
	const prevHand = game.hand.slice();
	game.hand.splice(index, 1);
	updateHandPos(prevHand, index, 146 - Math.floor(cardAnim.splice(index, 1)));
};

/**
 * Discards the player's hand.
 * @param {boolean} force - if true, no effect can prevent the discard.
 */
function discardHand(force = false) {
	for (let index = game.hand.length - 1; index >= 0; index--) {
		if (game.hand[index].eff[CARD_EFF.RETENTION] && !force) {
			game.hand[index].eff[CARD_EFF.RETENTION]--;
		} else {
			discardCard(index);
		};
	};
};

/**
 * Gets the cost of a card.
 * @param {Card} cardObj - the card object.
 */
function getCardCost(cardObj) {
	if (cardObj.eff[CARD_EFF.COST_REDUCTION] > 0) return Math.max(cardObj.getAttr("cost") - cardObj.eff[CARD_EFF.COST_REDUCTION], 0);
	return +cardObj.getAttr("cost");
};

/**
 * Starts a transition animation of an enemy.
 * @param {number} index - the index of the enemy.
 * @param {number} prevShield - defaults to `game.enemies[index].shield`.
 */
function startEnemyTransition(index, prevShield = game.enemies[index].shield) {
	if (game.enemies[index].type !== SLIME.BIG && game.enemies[index].type !== SLIME.SMALL && game.enemies[index].type !== SLIME.PRIME && game.enemies[index].type !== SLIME.STICKY && game.enemies[index].type !== SENTRY.BIG && game.enemies[index].type !== SENTRY.SMALL && game.enemies[index].type !== SENTRY.PRIME && game.enemies[index].type !== SENTRY.FLAMING) return;
	if (prevShield > 0 && game.enemies[index].shield === 0) game.enemies[index].transition = [0, TRANSITION.SHIELD];
};

/**
 * Deals damage to an enemy.
 * @param {number} amount - the amount of damage.
 * @param {number} exMod - the extra damage modifier. Defaults to `1`.
 * @param {number} index - the index of the enemy. Defaults to `game.enemyAtt[1]`.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `true`.
 * @param {boolean} mult - whether to multiply the damage. Defaults to `true`.
 */
function dealDamage(amount, exMod = 1, index = game.enemyAtt[1], attack = true, mult = true) {
	if (isNaN(amount)) return;
	// setup
	const enemy = game.enemies[index];
	let prevShield = enemy.shield;
	// increase damage
	if (attack) amount += Math.floor(get.extraDamage(true) * exMod);
	// multiply damage
	if (attack && mult) amount = Math.ceil(amount * get.dealDamageMult(index));
	// damage enemy
	if (amount < enemy.shield) {
		enemy.shield -= amount;
	} else {
		amount -= enemy.shield;
		enemy.shield = 0;
		enemy.health -= amount;
	};
	// additional effects
	if (attack) {
		// calculate number of times triggered
		let triggerNum = 1;
		if (game.eff[EFF.HYPERSPEED]) triggerNum++;
		// trigger effects
		if (game.eff[EFF.BLAZE]) enemy.gainEff(EFF.BURN, triggerNum);
		if (game.eff[EFF.PULSE]) enemy.gainEff(EFF.PULSE, triggerNum);
	};
	if (enemy.eff[EFF.LIVING_METAL]) {
		enemy.shield += enemy.eff[EFF.LIVING_METAL];
		enemy.eff[EFF.LIVING_METAL]--;
	};
	// transitions
	startEnemyTransition(index, prevShield);
};

/**
 * Makes the player take damage.
 * @param {number} amount - the amount of damage to take.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `true`.
 * @param {number} index - the index of the enemy. Defaults to `game.enemyNum`.
 */
function takeDamage(amount, attack = true, index = game.enemyNum) {
	if (isNaN(amount)) return;
	// multiply damage
	if (attack) amount = Math.ceil(amount * get.takeDamageMult(index));
	// take damage
	if (amount < game.shield) {
		game.shield -= amount;
	} else {
		amount -= game.shield;
		game.shield = 0;
		game.health -= amount;
	};
	// additional effects
	if (attack && index >= 0) {
		// calculate number of times triggered
		let triggerNum = 1;
		if (game.enemies[index].eff[EFF.HYPERSPEED]) triggerNum++;
		// trigger effects
		if (game.enemies[index].eff[EFF.BLAZE]) gainEff(EFF.BURN, triggerNum);
		if (game.enemies[index].eff[EFF.PULSE]) gainEff(EFF.PULSE, triggerNum);
		if (game.enemies[index].eff[ENEMY_EFF.STICKY]) {
			game.deck = game.deck.concat(Array.from({length: 2 * triggerNum}, () => new Card(5001, 0, true)));
			shuffle(game.deck);
		};
	};
	if (game.eff[EFF.LIVING_METAL]) {
		game.shield += game.eff[EFF.LIVING_METAL];
		game.eff[EFF.LIVING_METAL]--;
	};
};

/**
 * Has the player gain shield.
 * @param {number} amount - the amount of shield to gain.
 * @param {number} exMod - the extra shield modifier. Defaults to `1`.
 */
function playerGainShield(amount = 0, exMod = 1) {
	if (isNaN(amount)) return;
	// increase shield
	amount += Math.floor(get.extraShield() * exMod);
	// multiply shield
	amount = Math.ceil(amount * get.playerShieldMult());
	// gain shield
	game.shield += amount;
};

/**
 * Has an enemy gain shield.
 * @param {number} amount - the amount of shield to gain.
 * @param {number} index - the index of the enemy. Defaults to `game.enemyNum`.
 */
function enemyGainShield(amount = 0, index = game.enemyNum) {
	if (isNaN(amount)) return;
	// multiply shield
	amount = Math.ceil(amount * get.enemyShieldMult(index));
	// gain shield
	game.enemies[index].shield += amount;
};

/**
 * Has the player gain an effect.
 * @param {number} type - the type of effect to gain.
 * @param {number} amt - the amount of the effect to gain. Defaults to `1`.
 */
function gainEff(type, amt = 1) {
	if (game.eff[type]) game.eff[type] += amt;
	else game.eff[type] = amt;
};
