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
 * Returns the string formatted in title case.
 */
String.prototype.title = function() {
	let result = "";
	for (let num = 0; num < this.length; num++) {
		if (num === 0 || (/\s/.test(this.charAt(num - 1)) && !/^(a|an|and|at|but|by|for|in|nor|of|on|or|so|the|to|up|yet)(?!\w)/.test(this.substring(num)))) result += this.charAt(num).toUpperCase();
		else result += this.charAt(num);
	};
	return result;
};

/**
 * Returns the string with each character's position randomized.
 */
String.prototype.randomize = function() {
	let arr = this.split("");
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
	return !!((game.select[0] === LOOKER || game.select[0] === HELP || game.select[0] === OPTIONS || game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD) && game.select[1]) || game.select[0] === IN_MAP || game.select[0] === CONFIRM_RESTART;
};

/**
 * Returns a boolean indicating whether a deck outside battle is being viewed.
 */
function inOutsideDeck() {
	return ((game.select[0] === IN_MAP && game.select[1]) || game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY || game.select[0] === REFINER || game.select[0] === CONFIRM_REFINE);
};

/**
 * Returns a boolean indicating whether a deck is being viewed.
 */
function inDeck() {
	return ((game.select[0] === DECK || game.select[0] === VOID || game.select[0] === DISCARD) && game.select[1]) || inOutsideDeck();
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
		if (game.artifacts.includes(6)) size--;
		return size;
	},
	/**
	 * Gets the number of card reward choices.
	 */
	cardRewardChoices() {
		let choices = 3;
		if (game.artifacts.includes(6)) choices++;
		return choices;
	},
	/**
	 * Gets the player's maximum health.
	 */
	maxHealth() {
		let max = 60;
		if (game.artifacts.includes(4)) max -= 15;
		if (game.artifacts.includes(7)) max += 15;
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
		if (game.artifacts.includes(5)) max++;
		return max;
	},
	/**
	 * Gets the current extra damage effect.
	 * @param {boolean} attacking - whether the player is the middle of attacking.
	 */
	extraDamage(attacking = false) {
		let extra = 0;
		if (game.attackEffects.includes(AURA_BLADE)) {
			extra += 5 + ((game.eff[EFFECT.AURA_BLADE] || 0) + 1);
		} else if (game.eff[EFFECT.AURA_BLADE] && !attacking) {
			extra += 5 + game.eff[EFFECT.AURA_BLADE];
		};
		if (game.artifacts.includes(3)) extra += 2;
		return extra;
	},
	/**
	 * Gets the current dealing damage multiplier effect.
	 * @param {number} enemy - the index of the enemy that is being damaged. Defaults to `game.enemyAtt[1]`.
	 */
	dealDamageMult(enemy = game.enemyAtt[1]) {
		let mult = 1;
		if (game.eff[EFFECT.WEAKNESS]) mult -= 0.25;
		if (game.enemies[enemy]?.eff[EFFECT.RESILIENCE]) mult -= 0.25;
		return mult;
	},
	/**
	 * Gets the current taking damage multiplier effect.
	 * @param {number} enemy - the index of the enemy that is being damaged. Defaults to `game.enemyNum`.
	 */
	takeDamageMult(enemy = game.enemyNum) {
		let mult = 1;
		if (game.enemies[enemy]?.eff[EFFECT.WEAKNESS]) mult -= 0.25;
		if (game.eff[EFFECT.RESILIENCE]) mult -= 0.25;
		return mult;
	},
	/**
	 * Gets the current extra shield effect.
	 */
	extraShield() {
		let extra = 0;
		if (game.artifacts.includes(2)) extra += 2;
		return extra;
	},
	/**
	 * Gets the score factors.
	 */
	scoreFactors() {
		let factors = [];
		for (const key in game.kills) {
			if (Object.hasOwnProperty.call(game.kills, key)) {
				const amt = game.kills[+key];
				if (+key === FRAGMENT) factors.push(["killed the " + ENEMY_NAMES[+key], amt * ENEMY_WORTH[+key]]);
				else factors.push(["killed " + amt + " " + ENEMY_NAMES[+key] + (amt > 1 ? "s" : ""), amt * ENEMY_WORTH[+key]]);
			};
		};
		factors.push(["saved " + game.gold + " gold", Math.floor(game.gold / 5)]);
		if (game.health > 0) factors.push(["saved " + game.health + " health", game.health * 5]);
		return factors;
	},
	/**
	 * Gets the total score.
	 */
	totalScore() {
		let score = 0;
		for (const key in game.kills) {
			if (Object.hasOwnProperty.call(game.kills, key)) {
				score += game.kills[+key] * ENEMY_WORTH[+key];
			};
		};
		score += Math.floor(game.gold / 5);
		if (game.health > 0) score += game.health * 5;
		if (game.difficulty) {
			if (game.artifacts.includes(0) && game.kills[FRAGMENT]) score *= 3;
			else score *= 2;
		};
		return score;
	},
};

/**
 * Resets everything. Use carefully!
 */
function hardReset() {
	for (let index = 0; index < localStorage.length; index++) {
		const key = localStorage.key(index);
		if (key.startsWith("Yrahcaz7/Dungeon-of-Souls/save/")) {
			localStorage.removeItem(key);
		};
	};
	game = null;
	global = null;
	location.reload();
};

/**
 * Restarts the current run.
 */
function restartRun() {
	localStorage.setItem("Yrahcaz7/Dungeon-of-Souls/save/0", btoa(JSON.stringify({difficulty: game.difficulty})));
	game = null;
	location.reload();
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
	if (game.deckLocal.length) {
		for (; num > 0 && game.deckLocal.length > 0; num--) {
			game.hand.push(game.deckLocal.shift());
		};
	};
	if (num > 0) {
		game.deckLocal = shuffle(game.discard.slice());
		game.discard = [];
		for (; num > 0 && game.deckLocal.length > 0; num--) {
			game.hand.push(game.deckLocal.shift());
		};
	};
};

/**
 * Discards a card, not including removing the card from the hand.
 * @param {Card} cardObj - the card object.
 * @param {boolean} used - whether the card was used. Defaults to `false`.
 */
function discardCard(cardObj, used = false) {
	if (used && cards[cardObj.id].keywords.includes(CARD_EFF.ONE_USE)) game.void.push(new Card(cardObj.id, cardObj.level));
	else game.discard.push(new Card(cardObj.id, cardObj.level));
};

/**
 * Discards the player's hand.
 */
function discardHand() {
	for (let index = 0; index < game.hand.length; ) {
		if (game.hand[index][CARD_EFF.RETENTION]) {
			game.hand[index][CARD_EFF.RETENTION]--;
			index++;
		} else {
			discardCard(game.hand.splice(index, 1)[0]);
		};
	};
};

/**
 * Gets the cost of a card.
 * @param {Card} cardObj - the card object.
 */
function getCardCost(cardObj) {
	if (cardObj[CARD_EFF.COST_REDUCTION]) return Math.max(getCardAttr("cost", cardObj.id, cardObj.level) - cardObj[CARD_EFF.COST_REDUCTION], 0);
	return +getCardAttr("cost", cardObj.id, cardObj.level);
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
	// transitions
	startEnemyTransition(index, prevShield);
};

/**
 * Makes the player take damage.
 * @param {number} amount - the amount of damage to take.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `true`.
 */
function takeDamage(amount, attack = true) {
	// multiply damage
	if (attack) amount = Math.ceil(amount * get.takeDamageMult());
	// take damage
	if (amount < game.shield) {
		game.shield -= amount;
	} else {
		amount -= game.shield;
		game.shield = 0;
		game.health -= amount;
	};
};

/**
 * Has the player gain shield.
 * @param {number} amount - the amount of shield to gain.
 * @param {number} exMod - the extra shield modifier. Defaults to `1`.
 */
function gainShield(amount = 0, exMod = 1) {
	if (isNaN(amount)) return;
	// increase shield
	amount += Math.floor(get.extraShield() * exMod);
	// gain shield
	game.shield += amount;
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

const AURA_BLADE = 200;

/**
 * Activates the attack effects of a card.
 * @param {number} id - the id of the card.
 */
function activateAttackEffects(id) {
	// stop if effects are not allowed
	if (cards[id].attackEffects === false) return;
	// start player anim
	startAnim.player(cards[id].anim);
	// trigger aura blades
	if (game.eff[EFFECT.AURA_BLADE]) {
		game.eff[EFFECT.AURA_BLADE]--;
		game.attackEffects.push(AURA_BLADE);
	};
};
