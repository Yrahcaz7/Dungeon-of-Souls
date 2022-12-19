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

// prototype functions

String.prototype.title = function() {
	let result = "";
	for (let num = 0; num < this.length; num++) {
		if (num === 0 || this.charAt(num - 1) == " " || this.charAt(num - 1) == "\n") result += this.charAt(num).toUpperCase();
		else result += this.charAt(num);
	};
	return result;
};

String.prototype.shuffle = function() {
	let arr = this.split("");
	for (let index = arr.length - 1; index > 0; index--) {
		let rand = Math.floor(Math.random() * (index + 1));
		[arr[index], arr[rand]] = [arr[rand], arr[index]];
	};
	return arr.join("");
};

Object.prototype.deepCopy = function(o, keepProto = false) {
	let object = JSON.parse(JSON.stringify(o));
	if (keepProto) Object.setPrototypeOf(object, Object.getPrototypeOf(o));
	return object;
};

// technical functions

function randomize(array) {
	let index = array.length, randomIndex;
	while (index != 0) {
		randomIndex = Math.floor(Math.random() * index);
		index--;
		[array[index], array[randomIndex]] = [array[randomIndex], array[index]];
	};
	return array;
};

function interval(time, range = 1) {
	return (Math.abs((new Date().getTime() % (2000 * time * range) / (1000 * time)) - range) * range) - range;
};

function hidden() {
	return !!((game.select[0] == "looker" || game.select[0] == "help" || game.select[0] == "options" || game.select[0] == "deck" || game.select[0] == "void" || game.select[0] == "discard") && game.select[1]) || game.select[0] == "in_map" || game.select[0] == "confirm_restart";
};

// value getter functions

const get = {
	handSize() {
		let size = 5;
		return size;
	},
	maxHealth() {
		let max = 60;
		return max;
	},
	maxShield() {
		let max = 60;
		return max;
	},
	maxEnergy() {
		let max = 3;
		return max;
	},
};

// reset functions

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

function restartRun() {
	localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save/0");
	game = null;
	location.reload();
};

// gameplay functions

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
		shuffleDeck();
		len = game.deckLocal.length;
		for (; index < handSize && index < len; index++) {
			game.hand.push(game.deckLocal[0]);
			game.deckLocal.splice(0, 1);
		};
	};
};

function discardHand() {
	for (let index = 0; index < game.hand.length; ) {
		game.discard.push(game.hand[index]);
		game.hand.splice(index, 1);
	};
};

const AURA_BLADE = 200;

function dealDamage(amount, exMod = 1, enemy = game.enemyAtt[1]) {
	// extra damage
	let exDamage = 0;
	if (exMod) {
		if (game.attackEffects.includes(AURA_BLADE)) {
			exDamage += 5 + (game.eff.aura_blades + 1);
		};
		exDamage = Math.floor(exDamage * exMod);
	};
	let damage = amount + exDamage;
	// multiply damage
	let mulDamage = 1;
	if (game.eff.weakness) mulDamage = 0.75;
	damage = Math.floor(damage * mulDamage);
	// damage enemy
	if (damage < game.enemies[enemy].shield) {
		game.enemies[enemy].shield -= damage;
	} else {
		damage -= game.enemies[enemy].shield;
		game.enemies[enemy].shield = 0;
		game.enemies[enemy].health -= damage;
	};
};

function activateAttackEffects(id) {
	// stop if effects are not allowed
	if (attributes["NO ATTACK EFFECTS"].includes(id)) return;
	// start player anim
	startAnim.player(cards[id].anim);
	// trigger aura blades
	if (game.eff.aura_blades) {
		game.eff.aura_blades--;
		game.attackEffects.push(AURA_BLADE);
	};
};
