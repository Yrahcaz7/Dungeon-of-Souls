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

const get = {
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
			extra += 5 + (game.eff.aura_blades + 1);
		} else if (game.eff.aura_blades && !attacking) {
			extra += 5 + game.eff.aura_blades;
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
		if (game.eff.weakness) mult -= 0.25;
		if (game.enemies[enemy]?.eff.resilience) mult -= 0.25;
		return mult;
	},
	/**
	 * Gets the current taking damage multiplier effect.
	 * @param {number} enemy - the index of the enemy that is being damaged. Defaults to `game.enemyNum`.
	 */
	takeDamageMult(enemy = game.enemyNum) {
		let mult = 1;
		if (game.enemies[enemy]?.eff.weakness) mult -= 0.25;
		if (game.eff.resilience) mult -= 0.25;
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
 * Has the player draw their hand.
 */
function drawHand() {
	const handSize = get.handSize();
	let index = 0, len = game.deckLocal.length;
	if (game.deckLocal.length) {
		for (; index < handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
	if (index != handSize) {
		len = game.discard.length;
		for (let a = 0; a < len; a++) {
			game.deckLocal.push(game.discard[a]);
		};
		game.discard = [];
		game.deckLocal = shuffle(game.deckLocal);
		len = game.deckLocal.length;
		for (; index < handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
};

/**
 * Has the player discard their hand.
 */
function discardHand() {
	for (let index = 0; index < game.hand.length; ) {
		if (game.hand[index].retention >= 1) {
			game.hand[index].retention--;
			index++;
		} else {
			delete game.hand[index].charge;
			delete game.hand[index].retention;
			game.discard.push(game.hand[index]);
			game.hand.splice(index, 1);
		};
	};
};

/**
 * Gets the cost of a card.
 * @param {Card} obj - the card object.
 */
function getCardCost(obj) {
	if (obj.charge > 0) return Math.max(cards[obj.id].cost - obj.charge, 0);
	return +cards[obj.id].cost;
};

const AURA_BLADE = 200;

/**
 * Deals damage to an enemy.
 * @param {number} amount - the amount of damage.
 * @param {number} exMod - the extra damage modifier. Defaults to `1`.
 * @param {number} enemy - the index of the enemy. Defaults to `game.enemyAtt[1]`.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `true`.
 */
function dealDamage(amount, exMod = 1, enemy = game.enemyAtt[1], attack = true) {
	if (isNaN(amount)) return;
	// increase damage
	if (attack) amount += Math.floor(get.extraDamage(true) * exMod);
	// multiply damage
	if (attack) amount = Math.ceil(amount * get.dealDamageMult(enemy));
	// damage enemy
	if (amount < game.enemies[enemy].shield) {
		game.enemies[enemy].shield -= amount;
	} else {
		amount -= game.enemies[enemy].shield;
		game.enemies[enemy].shield = 0;
		game.enemies[enemy].health -= amount;
	};
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
 * Activates the attack effects of a card.
 * @param {number} id - the id of the card.
 */
function activateAttackEffects(id) {
	// stop if effects are not allowed
	if (cards[id].attackEffects === false) return;
	// start player anim
	startAnim.player(cards[id].anim);
	// trigger aura blades
	if (game.eff.aura_blades) {
		game.eff.aura_blades--;
		game.attackEffects.push(AURA_BLADE);
	};
};
