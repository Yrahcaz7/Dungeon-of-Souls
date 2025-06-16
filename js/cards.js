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

const CARDS = {
	0: {
		name: "Error",
		desc: [new Desc("This card is\nclearly an error.\nUnplayable."), new Desc("Wow! An improved\nerror! Amazing! It\ndefinitely still\nisn't unplayable,\nright? That would\nbe ridiculous.")],
		rarity: -1,
		cost: 0,
	},
	1000: {
		name: "Slash",
		desc: [new Desc("Deal ", [5, DESC.DAMAGE], " to\nan enemy."), new Desc("Deal ", [10, DESC.DAMAGE], " to\nan enemy.")],
		rarity: 0,
		cost: 1,
		damage: [5, 10],
	},
	1001: {
		name: "Heat Wave",
		desc: [new Desc("Deal ", [7, DESC.DAMAGE], " to\nan enemy and apply\n2 burn to all\nenemies."), new Desc("Deal ", [7, DESC.DAMAGE], " to\nan enemy and apply\n4 burn to all\nenemies.")],
		rarity: 2,
		cost: 2,
		damage: 7,
		attack(level = 0) {
			const burn = (level >= 1 ? 4 : 2);
			for (let index = 0; index < game.enemies.length; index++) {
				game.enemies[index].gainEff(EFF.BURN, burn);
			};
		},
	},
	1002: {
		name: "Sweeping Slash",
		desc: [new Desc("Deal ", [4, DESC.DAMAGE], " to\nall enemies.\nUniform."), new Desc("Deal ", [8, DESC.DAMAGE], " to\nall enemies.\nUniform.")],
		rarity: 1,
		cost: 1,
		attackAnim: I.player.attack_2,
		target: false,
		attack(level = 0) {
			let damage = (level >= 1 ? 8 : 4);
			for (let index = 0; index < game.enemies.length; index++) {
				dealDamage(damage, 0.5, index);
			};
		},
	},
	1003: {
		name: "Bladestorm",
		desc: new Desc("Use all aura blades\nto deal ", [6, DESC.DAMAGE], " to\nan enemy and ", [1, DESC.DAMAGE, "\n"], " to all other\nenemies per aura\nblade. Uniform."),
		rarity: 2,
		cost: [2, 1],
		attack(level = 0) {
			dealDamage(((game.eff[EFF.AURA_BLADE] || 0) + 1) * 6, 0.5);
			for (let index = 0; index < game.enemies.length; index++) {
				if (index != game.enemyAtt[1]) dealDamage(game.eff[EFF.AURA_BLADE], 0.5, index);
			};
			game.eff[EFF.AURA_BLADE] = 0;
		},
		can(level = 0) {return game.eff[EFF.AURA_BLADE] > 0},
		cannotMessage: "no aura blades",
	},
	1004: {
		name: "Gold Slash",
		desc: [new Desc("Consume 25 gold to\ndeal ", [8, DESC.DAMAGE], " to\nan enemy."), new Desc("Consume 20 gold to\ndeal ", [15, DESC.DAMAGE], " to\nan enemy.")],
		rarity: 1,
		cost: 1,
		damage: [8, 15],
		attack(level = 0) {game.gold -= (level >= 1 ? 20 : 25)},
		can(level = 0) {return game.gold >= (level >= 1 ? 20 : 25)},
		cannotMessage: "not enough gold",
	},
	1005: {
		name: "Iron Slash",
		desc: new Desc("Deal ", [12, DESC.DAMAGE], " to\nan enemy."),
		rarity: 1,
		cost: [2, 1],
		damage: 12,
	},
	1006: {
		name: "Pulsating Strike",
		desc: [new Desc("Gain 1 pulse, then\ndeal [", [4, DESC.DAMAGE, " + pulse]\n"], " to an enemy."), new Desc("Gain 2 pulse, then\ndeal [", [4, DESC.DAMAGE, " + pulse]\n"], " to an enemy.")],
		rarity: 1,
		cost: 1,
		attack(level = 0) {
			gainEff(EFF.PULSE, (level >= 1 ? 2 : 1));
			dealDamage(4 + game.eff[EFF.PULSE]);
		},
	},
	2000: {
		name: "Block",
		desc: [new Desc("Gain ", [4, DESC.SHIELD], "."), new Desc("Gain ", [8, DESC.SHIELD], ".")],
		rarity: 0,
		cost: 1,
		effect(level = 0) {playerGainShield(level >= 1 ? 8 : 4)},
	},
	2001: {
		name: "Reinforce",
		desc: [new Desc("Gain ", [2, DESC.SHIELD], " and\n1 reinforce."), new Desc("Gain ", [4, DESC.SHIELD], " and\n2 reinforce.")],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) {
				playerGainShield(4);
				gainEff(EFF.REINFORCE, 2);
			} else {
				playerGainShield(2);
				gainEff(EFF.REINFORCE);
			};
		},
	},
	2002: {
		name: "Everlasting Shield",
		desc: new Desc("Gain 3 reinforce."),
		rarity: 2,
		cost: [2, 1],
		effect(level = 0) {gainEff(EFF.REINFORCE, 3)},
	},
	2003: {
		name: "Cower",
		desc: [new Desc("Gain ", [9, DESC.SHIELD], " and\n2 weakness."), new Desc("Gain ", [10, DESC.SHIELD], " and\n1 weakness.")],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) {
				playerGainShield(10);
				gainEff(EFF.WEAKNESS);
			} else {
				playerGainShield(9);
				gainEff(EFF.WEAKNESS, 2);
			};
		},
	},
	2004: {
		name: "Resilience",
		desc: [new Desc("Gain 2 resilience."), new Desc("Gain 3 resilience.")],
		rarity: 2,
		cost: 1,
		effect(level = 0) {gainEff(EFF.RESILIENCE, (level >= 1 ? 3 : 2))},
	},
	2005: {
		name: "The Eternal Gold",
		desc: [new Desc("Consume 45 gold\nto gain ", [10, DESC.SHIELD], "\nand 1 reinforce."), new Desc("Consume 30 gold\nto gain ", [15, DESC.SHIELD], "\nand 1 reinforce.")],
		rarity: 1,
		cost: 2,
		effect(level = 0) {
			if (level >= 1) {
				game.gold -= 30;
				playerGainShield(15);
			} else {
				game.gold -= 45;
				playerGainShield(10);
			};
			gainEff(EFF.REINFORCE);
		},
		can(level = 0) {return game.gold >= (level >= 1 ? 30 : 45)},
		cannotMessage: "not enough gold",
	},
	2006: {
		name: "Pulsating Shield",
		desc: [new Desc("Gain 1 pulse, then\ngain [", [3, DESC.SHIELD, " + pulse]\n"], "."), new Desc("Gain 2 pulse, then\ngain [", [3, DESC.SHIELD, " + pulse]\n"], ".")],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			gainEff(EFF.PULSE, (level >= 1 ? 2 : 1));
			playerGainShield(3 + game.eff[EFF.PULSE]);
		},
	},
	3000: {
		name: "War Cry",
		desc: [new Desc("All non-boss\nenemies switch\ntheir intents to\ndefense. One use."), new Desc("All non-boss\nenemies switch\ntheir intents to\ndefense. Draw a\ncard. One use.")],
		rarity: 1,
		cost: 0,
		effectAnim: I.effect.war_cry,
		effect(level = 0) {
			for (let index = 0; index < game.enemies.length; index++) {
				if (!game.enemies[index].isBoss()) {
					game.enemies[index].intent = INTENT.DEFEND;
					if (game.enemies[index].intent !== INTENT.DEFEND) game.enemies[index].intentHistory.push(INTENT.DEFEND);
				};
			};
			if (level >= 1) drawCards(1);
		},
	},
	3001: {
		name: "Rage",
		desc: [new Desc("Kill a non-boss\nenemy. Take\nnon-combat damage\nequal to half its\nhealth, rounded up."), new Desc("Kill a non-boss\nenemy. Take\nnon-combat damage\nequal to half its\nhealth, rounded up.\nDraw a card.")],
		rarity: 1,
		cost: 0,
		attackEffects: false,
		attack(level = 0) {
			if (!game.enemies[game.enemyAtt[1]].isBoss()) {
				takeDamage(Math.ceil(game.enemies[game.enemyAtt[1]].health / 2), false);
				game.enemies[game.enemyAtt[1]].health = 0;
			};
			if (level >= 1) drawCards(1);
		},
	},
	3002: {
		name: "Burn",
		desc: [new Desc("Apply 1 burn to\nyourself and all\nenemies."), new Desc("Apply 1 burn to\nyourself and apply\n2 burn to all\nenemies.")],
		rarity: 1,
		cost: 0,
		effect(level = 0) {
			gainEff(EFF.BURN);
			const burn = (level >= 1 ? 2 : 1);
			for (let index = 0; index < game.enemies.length; index++) {
				game.enemies[index].gainEff(EFF.BURN, burn);
			};
		},
	},
	3003: {
		name: "Memorize",
		desc: new Desc("Choose a card from\nyour hand. Apply 1\ncost reduction\nand 1 retention to\nthe chosen card."),
		rarity: 2,
		cost: [1, 0],
		select() {return [SS.SELECT_HAND, game.select[1] - 1]},
		effect(level = 0) {
			const index = (game.select[1] >= game.enemyAtt[0] ? game.select[1] + 1 : game.select[1]);
			if (game.hand[index].eff[CARD_EFF.RETENTION]) game.hand[index].eff[CARD_EFF.RETENTION]++;
			else game.hand[index].eff[CARD_EFF.RETENTION] = 1;
			if (game.hand[index].eff[CARD_EFF.COST_REDUCTION]) game.hand[index].eff[CARD_EFF.COST_REDUCTION]++;
			else game.hand[index].eff[CARD_EFF.COST_REDUCTION] = 1;
		},
		can(level = 0) {return game.hand.length > 1},
		cannotMessage: "no valid target",
	},
	3004: {
		name: "Vibration",
		desc: new Desc("Gain 2 pulse."),
		rarity: 1,
		cost: [1, 0],
		effect(level = 0) {gainEff(EFF.PULSE, 2)},
	},
	4000: {
		name: "Aura Blade",
		desc: new Desc("Gain 1 aura blade."),
		rarity: 1,
		cost: [1, 0],
		effect(level = 0) {gainEff(EFF.AURA_BLADE)},
	},
	4001: {
		name: "Aura Blaze",
		desc: new Desc("Gain 4 aura blades.\nOne use."),
		rarity: 2,
		cost: [3, 2],
		effect(level = 0) {gainEff(EFF.AURA_BLADE, 4)},
	},
};

const RARITY = ["starter", "common", "rare"];
const CARD_TYPE = ["error", "attack", "defense", "skill", "magic"];

// Loads all card data.
(() => {
	/**
	 * Loads a card and returns its description.
	 * @param {object} ref - a reference to the card data.
	 * @param {Desc} desc - the card's description.
	 */
	function loadCard(ref, desc) {
		// color text
		desc.nodes = desc.nodes.map(node => node instanceof Array ? node : colorText(node));
		// list keywords
		if (!ref.keywords) ref.keywords = [];
		for (const eff in EFF) {
			const regex = new RegExp(EFF_NAME[EFF[eff]].replace(" ", "\\s").replace("+", "\\+"), "i");
			if (!ref.keywords.includes(EFF[eff]) && desc.nodes.some(node => regex.test(node))) {
				ref.keywords.push(EFF[eff]);
			};
		};
		for (const eff in CARD_EFF) {
			if (CARD_EFF[eff] === CARD_EFF.COST_REDUCTION || CARD_EFF[eff] === CARD_EFF.DESC) continue;
			const regex = new RegExp(EFF_NAME[CARD_EFF[eff]].replace(" ", "\\s").replace("+", "\\+"), "i");
			if (!ref.keywords.includes(CARD_EFF[eff]) && desc.nodes.some(node => regex.test(node))) {
				ref.keywords.push(CARD_EFF[eff]);
			};
		};
		// extra info
		if (!ref.keywords.includes(CARD_EFF.DESC) && desc.nodes.some(node => /apply/i.test(node)) && desc.nodes.some(node => /card/i.test(node))) ref.keywords.push(CARD_EFF.DESC);
		// return desc
		return desc;
	};
	for (const key in CARDS) {
		if (CARDS[key].desc instanceof Array) {
			for (let index = 0; index < CARDS[key].desc.length; index++) {
				CARDS[key].desc[index] = loadCard(CARDS[key], CARDS[key].desc[index]);
			};
		} else {
			CARDS[key].desc = loadCard(CARDS[key], CARDS[key].desc);
		};
	};
})();

class Card {
	id = 0;
	level = 0;
	eff = {};
	/**
	 * Returns a new card.
	 * @param {number} id - the card's id. Defaults to `0`.
	 * @param {number} level - the card's level. Defaults to `0`.
	 */
	constructor(id = 0, level = 0) {
		this.id = id;
		this.level = level;
	};
	/**
	 * Returns an object as a card.
	 * @param {object} obj - the object to classify.
	 */
	static classify(obj = {}) {
		let instance = new Card();
		for (const key in instance) {
			if (Object.hasOwn(instance, key) && Object.hasOwn(obj, key)) {
				instance[key] = obj[key];
			};
		};
		return instance;
	};
	/**
	 * Sorts an array of cards. This method mutates the array and returns a reference to the same array.
	 * @param {Card[]} arr - the array of cards to sort.
	 */
	static sort(arr = []) {
		return arr.sort((a, b) => {
			// sort by type
			if (Math.floor(a.id / 1000) < Math.floor(b.id / 1000)) return -1;
			if (Math.floor(a.id / 1000) > Math.floor(b.id / 1000)) return 1;
			// sort by rarity
			if (CARDS[a.id].rarity > CARDS[b.id].rarity) return -1;
			if (CARDS[a.id].rarity < CARDS[b.id].rarity) return 1;
			// sort by name
			if (CARDS[a.id].name < CARDS[b.id].name) return -1;
			if (CARDS[a.id].name > CARDS[b.id].name) return 1;
			// sort by level
			if (a.level > b.level) return -1;
			if (a.level < b.level) return 1;
			// end sort
			return 0;
		});
	};
	/**
	 * Returns an attribute of the card.
	 * @param {string} attr - the attribute to return.
	 */
	getAttr(attr) {
		if (!CARDS[this.id] || CARDS[this.id][attr] === null || CARDS[this.id][attr] === undefined) return;
		if (attr === "name") return CARDS[this.id].name + "+".repeat(this.level);
		if (CARDS[this.id][attr] instanceof Object && !(CARDS[this.id][attr] instanceof Desc)) {
			if (attr === "select") {
				if (CARDS[this.id][attr][this.level] instanceof Object) return CARDS[this.id][attr][this.level];
				return CARDS[this.id][attr];
			};
			return CARDS[this.id][attr][this.level];
		};
		return CARDS[this.id][attr];
	};
};

const CARD_IDS = [[], [], []];

/**
 * Returns a random card set.
 * @param {number} length - the length of the set. Defaults to `0`.
 * @param {number} rareChance - the chance for a card in the set to be a rare. Defaults to `3/10`.
 */
function randomCardSet(length = 0, rareChance = 3/10) {
	if (length <= 0) return [];
	if (length > 10) length = 10;
	let result = [];
	for (let index = 0; index < length; index++) {
		let card = 0;
		while (!card || result.includes(card)) {
			let rarity = (chance(rareChance) ? 2 : 1);
			card = CARD_IDS[rarity][randomInt(0, CARD_IDS[rarity].length - 1)];
		};
		result.push(card);
	};
	return result;
};
