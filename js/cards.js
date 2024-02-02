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

const attributes = {
	// gameplay
	unplayable: [0],
	"one use": [3000, 4001],
	uniform: [1002, 1003],
	// technical
	"NO SELECT": [1002],
	"NO ATTACK EFFECTS": [1003, 3001],
}, cards = {
	0: {
		name: "error",
		desc: "Unplayable.",
		rarity: -1,
		cost: 0,
	},
	1000: {
		name: "slash",
		desc: "Deal 5 damage.",
		rarity: 0,
		cost: 1,
		anim: "attack",
		damage: 5,
	},
	1001: {
		name: "heat wave",
		desc: "Deal 7 damage to\nan enemy, and apply\n2 burn to all\nenemies.",
		rarity: 2,
		cost: 2,
		anim: "attack",
		damage: 7,
		attack() {
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff.burn) game.enemies[index].eff.burn += 2;
				else game.enemies[index].eff.burn = 2;
			};
		},
	},
	1002: {
		name: "sweeping slash",
		desc: "Deal 3 damage to\nall enemies.\nUniform.",
		rarity: 1,
		cost: 1,
		anim: "attack_2",
		attack() {
			for (let index = 0; index < game.enemies.length; index++) {
				dealDamage(3, 0.5, index);
			};
		},
	},
	1003: {
		name: "bladestorm",
		desc: "Consume all X aura\nblades to deal\nX times 6 damage\nto one enemy and\nX to all others.\nUniform.",
		rarity: 2,
		cost: 2,
		attack() {
			dealDamage(game.eff.aura_blades * 6, 0.5);
			for (let index = 0; index < game.enemies.length; index++) {
				if (index != game.enemyAtt[1]) dealDamage(game.eff.aura_blades, 0.5, index);
			};
			game.eff.aura_blades = 0;
		},
	},
	1004: {
		name: "gold slash",
		desc: "Consume 25 gold to\ndeal 8 damage.",
		rarity: 1,
		cost: 1,
		anim: "attack",
		damage: 8,
		attack() {
			game.gold -= 25;
		},
		can() {
			return game.gold >= 25;
		},
		cannotMessage: "not enough gold",
	},
	2000: {
		name: "block",
		desc: "Gain 4 shield.",
		rarity: 0,
		cost: 1,
		effect() {
			gainShield(4);
		},
	},
	2001: {
		name: "reinforce",
		desc: "Gain 1 shield and\n1 reinforce.",
		rarity: 1,
		cost: 1,
		effect() {
			gainShield(1);
			game.eff.reinforces++;
		},
	},
	2002: {
		name: "everlasting shield",
		desc: "Gain 3 reinforces.",
		rarity: 2,
		cost: 2,
		effect() {
			game.eff.reinforces += 3;
		},
	},
	2003: {
		name: "cower",
		desc: "Gain 9 shield and\n2 weakness.",
		rarity: 1,
		cost: 1,
		effect() {
			gainShield(9);
			game.eff.weakness += 2;
		},
	},
	2004: {
		name: "resilience",
		desc: "Gain 2 resilience.",
		rarity: 2,
		cost: 1,
		effect() {
			game.eff.resilience += 2;
		},
	},
	2005: {
		name: "the eternal gold",
		desc: "Consume 45 gold\nto gain 10 shield\nand 1 reinforce.",
		rarity: 1,
		cost: 2,
		effect() {
			gainShield(10);
			game.eff.reinforces++;
			game.gold -= 45;
		},
		can() {
			return game.gold >= 45;
		},
		cannotMessage: "not enough gold",
	},
	3000: {
		name: "war cry",
		desc: "All enemies (except\nbosses) switch\ntheir intents to\ndefense. One use.",
		rarity: 1,
		cost: 0,
		effect() {
			startAnim.effect("war cry");
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].type !== FRAGMENT) {
					game.enemies[index].intent = DEFEND;
					game.enemies[index].intentHistory[game.enemies[index].intentHistory.length - 1] = DEFEND;
				};
			};
		},
	},
	3001: {
		name: "rage",
		desc: "Kill a non-boss\nenemy. Take damage\nequal to half its\nhealth, rounded\ndown.",
		rarity: 1,
		cost: 0,
		attack() {
			if (game.enemies[game.enemyAtt[1]].type !== FRAGMENT) {
				takeDamage(Math.floor(game.enemies[game.enemyAtt[1]].health / 2));
				game.enemies[game.enemyAtt[1]].health = 0;
			};
		},
	},
	3002: {
		name: "burn",
		desc: "Apply 1 burn to\nyourself and all\nenemies.",
		rarity: 1,
		cost: 0,
		effect() {
			game.eff.burn++;
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff.burn) game.enemies[index].eff.burn++;
				else game.enemies[index].eff.burn = 1;
			};
		},
	},
	4000: {
		name: "aura blade",
		desc: "Gain 1 aura blade.",
		rarity: 1,
		cost: 1,
		effect() {
			game.eff.aura_blades++;
		},
	},
	4001: {
		name: "aura blaze",
		desc: "Gain 4 aura blades.\nOne use.",
		rarity: 2,
		cost: 3,
		effect() {
			game.eff.aura_blades += 4;
		},
	},
}, rarities = {
	[-1]: "error",
	[0]: "starter",
	[1]: "common",
	[2]: "rare",
}, types = ["error", "attack", "defense", "skill", "magic"];

for (const key in cards) {
	if (Object.hasOwnProperty.call(cards, key)) {
		cards[key].desc = cards[key].desc.replace(/(health|damage|attack)/gi, "<#f44>$1</#f44>");
		cards[key].desc = cards[key].desc.replace(/(shield|defense)/gi, "<#58f>$1</#58f>");
		cards[key].desc = cards[key].desc.replace(/(one\suse|uniform)/gi, "<#666>$1</#666>");
		cards[key].keywords = [];
		if (/aura\sblade/i.test(cards[key].desc)) cards[key].keywords.push("aura blade");
		if (/burn/i.test(cards[key].desc)) cards[key].keywords.push("burn");
		if (/one\suse/i.test(cards[key].desc)) cards[key].keywords.push("one use");
		if (/reinforce/i.test(cards[key].desc)) cards[key].keywords.push("reinforce");
		if (/uniform/i.test(cards[key].desc)) cards[key].keywords.push("uniform");
		if (/weakness/i.test(cards[key].desc)) cards[key].keywords.push("weakness");
	};
};

class Card {
	constructor(id, level = 0) {
		if (cards[id] === undefined) this.id = 0;
		else this.id = id;
		this.level = level;
	};
};

/**
 * Sorts an array of cards. This method mutates the array and returns a reference to the same array.
 */
Array.prototype.cardSort = function() {
	return this.sort((a, b) => {
		if (cards[a.id].rarity > cards[b.id].rarity) {
			return -1;
		};
		if (cards[a.id].rarity < cards[b.id].rarity) {
			return 1;
		};
		if (types[Math.floor(a.id / 1000)] < types[Math.floor(b.id / 1000)]) {
			return -1;
		};
		if (types[Math.floor(a.id / 1000)] > types[Math.floor(b.id / 1000)]) {
			return 1;
		};
		if (cards[a.id].name < cards[b.id].name) {
			return -1;
		};
		if (cards[a.id].name > cards[b.id].name) {
			return 1;
		};
		return 0;
	});
};

const cardNames = {};

/**
 * Constructs the `cardNames` array.
 */
function constructNames() {
	const entries = Object.entries(cards);
	for (let index = 0; index < entries.length; index++) {
		cardNames[entries[index][1].name] = +entries[index][0];
	};
};

const common = Object.keys(card.common), rare = Object.keys(card.rare);

/**
 * Returns a random card's id.
 * @param {string[]} notInclude - the ids to not include.
 */
function randomCard(notInclude = []) {
	let bool = true;
	if (Object.keys(cardNames).length === 0) constructNames();
	if (notInclude.length) {
		for (const key in cards) {
			if (Object.hasOwnProperty.call(cards, key)) {
				if (cards[key].rarity > 0 && !notInclude.includes(+key)) {
					bool = false;
				};
			};
		};
	};
	if (bool) {
		let result = 0;
		if (chance(7/10)) {
			result = cardNames[common[randomInt(0, Object.keys(card.common).length - 1)]];
		} else {
			result = cardNames[rare[randomInt(0, Object.keys(card.rare).length - 1)]];
		};
		return result;
	} else {
		let result = 0;
		while (!result || notInclude.includes(result)) {
			if (chance(7/10)) {
				result = cardNames[common[randomInt(0, Object.keys(card.common).length - 1)]];
			} else {
				result = cardNames[rare[randomInt(0, Object.keys(card.rare).length - 1)]];
			};
		};
		return result;
	};
};

/**
 * Returns a random card set.
 * @param {number} length - the length of the set. Defaults to `0`.
 */
function randomCardSet(length = 0) {
	if (length <= 0) return [];
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomCard(result));
	};
	return result;
};
