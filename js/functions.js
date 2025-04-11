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
 * Returns a string formatted with color tags.
 * @param {string} text - the string to color.
 */
function color(text) {
	text = text.replace(/(max\shealth|health|non-combat\sdamage|combat\sdamage|extra\sdamage|damage|attacks|attack)/gi, "<#f44>$1</#f44>");
	text = text.replace(/(extra\sshield|shield|defend|defense)/gi, "<#58f>$1</#58f>");
	text = text.replace(/(cost\sreduction|one\suse|retention|uniform|unplayable)/gi, "<#666>$1</#666>");
	text = text.replace(/(magic)(\stype)/gi, "<#f0f>$1</#f0f>$2");
	text = text.replace(/(\[decay\]|decay)/gi, "<#80f>$1</#80f>");
	return text;
};

/**
 * Returns a string with each character's position randomized.
 * @param {string} str - the string.
 */
function randomize(str) {
	let arr = str.split("");
	for (let index = arr.length - 1; index > 0; index--) {
		let rand = Math.floor(Math.random() * (index + 1));
		[arr[index], arr[rand]] = [arr[rand], arr[index]];
	};
	return arr.join("");
};

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
	if (menuSelect[0] === MENU.PREV_GAME_INFO) return global.prevGames[Math.floor(menuSelect[1] / 3)].cards;
	if (game.select[0] === S.DECK && game.select[1]) return Card.sort(game.deck.slice());
	if (game.select[0] === S.DISCARD && game.select[1]) return game.discard;
	if (game.select[0] === S.VOID && game.select[1]) return game.void;
	if (game.select[0] === S.CARDS) return game.cards;
	if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY) return game.cards;
	if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) return refinableDeck;
	return [];
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
	 * Gets the hand size.
	 */
	handSize() {
		let size = 5;
		if (hasArtifact(104)) size--;
		if (hasArtifact(205)) size++;
		return size;
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
	 * Gets the score factors.
	 */
	scoreFactors() {
		let factors = [];
		for (const key in game.kills) {
			if (game.kills.hasOwnProperty(key)) {
				const amt = game.kills[key];
				if (BOSS_ENEMIES.includes(+key)) factors.push(["Killed " + ENEMY_NAME[+key], ENEMY_WORTH[+key], amt]);
				else factors.push(["Killed " + amt + " " + (amt > 1 ? PLURAL_ENEMY_NAME : ENEMY_NAME)[+key], ENEMY_WORTH[+key], amt]);
			};
		};
		factors.push(["Saved " + game.gold + " gold", 1, Math.floor(game.gold / 5)]);
		if (game.select[0] === S.GAME_WON) factors.push(["Saved " + game.health + " health", 5, game.health]);
		return factors;
	},
	/**
	 * Gets the total score.
	 */
	totalScore() {
		let score = 0;
		for (const key in game.kills) {
			if (game.kills.hasOwnProperty(key)) {
				score += game.kills[+key] * ENEMY_WORTH[+key];
			};
		};
		score += Math.floor(game.gold / 5);
		if (game.select[0] === S.GAME_WON) score += game.health * 5;
		if (game.difficulty) {
			if (hasArtifact(202) && game.kills[FRAGMENT]) score *= 3;
			else score *= 2;
		};
		return score;
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
	availibleLocations(location = game.location) {
		if (location.length >= 2) return (paths[location[0]] || {})[location[1]] || [];
		return paths[location[0]] || [];
	},
	/**
	 * Gets the array of card positions for a hand of a certain size.
	 * @param {number} size - the size of the hand. Defaults to `game.hand.length`.
	 */
	handPos(size = game.hand.length) {
		let positions = [];
		const margin = [-4, -4, -4, -4, -4, 8, 16, 24, 28, 32, 36, 38, 40, 42, 44, 46, 46, 48, 48, 50, 50, 52, 52, 52, 52];
		if (size > margin.length) size = margin.length;
		for (let index = 0; index < size; index++) {
			positions.push(198 + (index - (size / 2)) * 64 - (index - ((size - 1) / 2)) * margin[size - 1]);
		};
		return positions;
	},
};

/**
 * Shuffles a deck and returns it.
 * @param {Card[]} deck - the deck to shuffle.
 */
function shuffle(deck) {
	let index = deck.length, randomIndex;
	while (index != 0) {
		randomIndex = Math.floor(random() * index);
		index--;
		[deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
	};
	return deck;
};

/**
 * Draws cards.
 * @param {number} num - the number of cards to draw.
 */
function drawCards(num) {
	if (game.deck.length) {
		for (; num > 0 && game.deck.length > 0; num--) {
			game.hand.push(game.deck.shift());
		};
	};
	if (num > 0) {
		game.deck = shuffle(game.discard.slice());
		game.discard = [];
		for (; num > 0 && game.deck.length > 0; num--) {
			game.hand.push(game.deck.shift());
		};
	};
};

/**
 * Discards a card, not including removing the card from the hand.
 * @param {Card} cardObj - the card object.
 * @param {boolean} used - whether the card was used. Defaults to `false`.
 */
function discardCard(cardObj, used = false) {
	if (used && CARDS[cardObj.id].keywords.includes(CARD_EFF.ONE_USE)) game.void.push(new Card(cardObj.id, cardObj.level));
	else game.discard.push(new Card(cardObj.id, cardObj.level));
};

/**
 * Discards the player's hand.
 * @param {boolean} force - if true, no effect can prevent the discard.
 */
function discardHand(force = false) {
	for (let index = 0; index < game.hand.length; index++) {
		if (game.hand[index].eff[CARD_EFF.RETENTION] && !force) {
			game.hand[index].eff[CARD_EFF.RETENTION]--;
		} else {
			discardCard(game.hand.splice(index, 1)[0]);
			index--;
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
	if (game.enemies[index].type !== SENTRY.BIG && game.enemies[index].type !== SENTRY.SMALL && game.enemies[index].type !== SENTRY.PRIME) return;
	if (prevShield > 0 && game.enemies[index].shield == 0) game.enemies[index].transition = [0, TRANSITION.SHIELD];
};

/**
 * Deals damage to an enemy.
 * @param {number} amount - the amount of damage.
 * @param {number} exMod - the extra damage modifier. Defaults to `1`.
 * @param {number} index - the index of the enemy. Defaults to `game.enemyAtt[1]`.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `true`.
 */
function dealDamage(amount, exMod = 1, index = game.enemyAtt[1], attack = true) {
	if (isNaN(amount)) return;
	// setup
	let prevShield = game.enemies[index].shield;
	// increase damage
	if (attack) amount += Math.floor(get.extraDamage(true) * exMod);
	// multiply damage
	if (attack) amount = Math.ceil(amount * get.dealDamageMult(index));
	// damage enemy
	if (amount < game.enemies[index].shield) {
		game.enemies[index].shield -= amount;
	} else {
		amount -= game.enemies[index].shield;
		game.enemies[index].shield = 0;
		game.enemies[index].health -= amount;
	};
	// additional effects
	if (attack && game.eff[EFF.BLAZE]) {
		if (game.enemies[index].eff[EFF.BURN]) game.enemies[index].eff[EFF.BURN]++;
		else game.enemies[index].eff[EFF.BURN] = 1;
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
	if (attack && index >= 0 && game.enemies[index].eff[EFF.BLAZE]) gainEff(EFF.BURN, 1);
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
 * @param {number} amt - the amount of the effect to gain.
 */
function gainEff(type, amt) {
	if (game.eff[type]) game.eff[type] += amt;
	else game.eff[type] = amt;
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
	startAnim.player(CARDS[id].attackAnim || I.player.attack);
};
