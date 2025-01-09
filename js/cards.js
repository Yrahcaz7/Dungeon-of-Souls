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

const cards = {
	0: {
		name: "error",
		desc: ["This card is\nclearly an error.\nUnplayable.", "Wow! An improved\nerror! Amazing! It\ndefinitely still\nisn't unplayable,\nright? That would\nbe ridiculous."],
		rarity: -1,
		cost: 0,
	},
	1000: {
		name: "slash",
		desc: ["Deal 5 damage to\nan enemy.", "Deal 10 damage to\nan enemy."],
		rarity: 0,
		cost: 1,
		damage: [5, 10],
	},
	1001: {
		name: "heat wave",
		desc: ["Deal 7 damage to\nan enemy, and apply\n2 burn to all\nenemies.", "Deal 7 damage to\nan enemy, and apply\n4 burn to all\nenemies."],
		rarity: 2,
		cost: 2,
		damage: 7,
		attack(level = 0) {
			let burn = (level >= 1 ? 4 : 2);
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff[EFF.BURN]) game.enemies[index].eff[EFF.BURN] += burn;
				else game.enemies[index].eff[EFF.BURN] = burn;
			};
		},
	},
	1002: {
		name: "sweeping slash",
		desc: ["Deal 4 damage to\nall enemies.\nUniform.", "Deal 8 damage to\nall enemies.\nUniform."],
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
		name: "bladestorm",
		desc: "Consume all X aura\nblades to deal\nX times 6 damage\nto an enemy and X\nto all others.\nUniform.",
		rarity: 2,
		cost: [2, 1],
		attackEffects: false,
		attack(level = 0) {
			if (game.eff[EFF.AURA_BLADE]) {
				dealDamage(game.eff[EFF.AURA_BLADE] * 6, 0.5);
				for (let index = 0; index < game.enemies.length; index++) {
					if (index != game.enemyAtt[1]) dealDamage(game.eff[EFF.AURA_BLADE], 0.5, index);
				};
				game.eff[EFF.AURA_BLADE] = 0;
			};
		},
	},
	1004: {
		name: "gold slash",
		desc: ["Consume 25 gold to\ndeal 8 damage to\nan enemy.", "Consume 20 gold to\ndeal 15 damage to\nan enemy."],
		rarity: 1,
		cost: 1,
		damage: [8, 15],
		attack(level = 0) {
			if (level >= 1) game.gold -= 20;
			else game.gold -= 25;
		},
		can(level = 0) {
			if (level >= 1) return game.gold >= 20;
			return game.gold >= 25;
		},
		cannotMessage: "not enough gold",
	},
	1005: {
		name: "iron slash",
		desc: "Deal 12 damage to\nan enemy.",
		rarity: 1,
		cost: [2, 1],
		damage: 12,
	},
	2000: {
		name: "block",
		desc: ["Gain 4 shield.", "Gain 8 shield."],
		rarity: 0,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) playerGainShield(8);
			else playerGainShield(4);
		},
	},
	2001: {
		name: "reinforce",
		desc: ["Gain 2 shield and\n1 reinforce.", "Gain 4 shield and\n2 reinforces."],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) {
				playerGainShield(4);
				gainEff(EFF.REINFORCE, 2);
			} else {
				playerGainShield(2);
				gainEff(EFF.REINFORCE, 1);
			};
		},
	},
	2002: {
		name: "everlasting shield",
		desc: "Gain 3 reinforces.",
		rarity: 2,
		cost: [2, 1],
		effect(level = 0) {gainEff(EFF.REINFORCE, 3)},
	},
	2003: {
		name: "cower",
		desc: ["Gain 9 shield and\n2 weakness.", "Gain 10 shield and\n1 weakness."],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) {
				playerGainShield(10);
				gainEff(EFF.WEAKNESS, 1);
			} else {
				playerGainShield(9);
				gainEff(EFF.WEAKNESS, 2);
			};
		},
	},
	2004: {
		name: "resilience",
		desc: ["Gain 2 resilience.", "Gain 3 resilience."],
		rarity: 2,
		cost: 1,
		effect(level = 0) {gainEff(EFF.RESILIENCE, (level >= 1 ? 3 : 2))},
	},
	2005: {
		name: "the eternal gold",
		desc: ["Consume 45 gold\nto gain 10 shield\nand 1 reinforce.", "Consume 30 gold\nto gain 15 shield\nand 1 reinforce."],
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
			gainEff(EFF.REINFORCE, 1);
		},
		can(level = 0) {
			if (level >= 1) return game.gold >= 30;
			return game.gold >= 45;
		},
		cannotMessage: "not enough gold",
	},
	3000: {
		name: "war cry",
		desc: ["All non-boss\nenemies switch\ntheir intents to\ndefense. One use.", "All non-boss\nenemies switch\ntheir intents to\ndefense. Draw a\ncard. One use."],
		rarity: 1,
		cost: 0,
		effect(level = 0) {
			startAnim.effect(I.effect.war_cry);
			for (let index = 0; index < game.enemies.length; index++) {
				if (!isEnemyBoss(index)) {
					game.enemies[index].intent = INTENT.DEFEND;
					game.enemies[index].intentHistory.push(INTENT.DEFEND);
				};
			};
			if (level >= 1) drawCards(1);
		},
	},
	3001: {
		name: "rage",
		desc: ["Kill a non-boss\nenemy. Take\nnon-combat damage\nequal to half its\nhealth, rounded up.", "Kill a non-boss\nenemy. Take\nnon-combat damage\nequal to half its\nhealth, rounded up.\nDraw a card."],
		rarity: 1,
		cost: 0,
		attackEffects: false,
		attack(level = 0) {
			if (!isEnemyBoss(game.enemyAtt[1])) {
				takeDamage(Math.ceil(game.enemies[game.enemyAtt[1]].health / 2), false);
				game.enemies[game.enemyAtt[1]].health = 0;
			};
			if (level >= 1) drawCards(1);
		},
	},
	3002: {
		name: "burn",
		desc: ["Apply 1 burn to\nyourself and all\nenemies.", "Apply 1 burn to\nyourself and apply\n2 burn to all\nenemies."],
		rarity: 1,
		cost: 0,
		effect(level = 0) {
			gainEff(EFF.BURN, 1);
			let burn = (level >= 1 ? 2 : 1);
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff[EFF.BURN]) game.enemies[index].eff[EFF.BURN] += burn;
				else game.enemies[index].eff[EFF.BURN] = burn;
			};
		},
	},
	3003: {
		name: "memorize",
		desc: "Choose a card from\nyour hand. Apply 1\ncost reduction\nand 1 retention to\nthe chosen card.",
		rarity: 2,
		cost: [1, 0],
		select: [SS.SELECT_HAND, -1],
		effect(level = 0) {
			if (game.hand[game.select[1]][CARD_EFF.RETENTION]) game.hand[game.select[1]][CARD_EFF.RETENTION]++;
			else game.hand[game.select[1]][CARD_EFF.RETENTION] = 1;
			if (game.hand[game.select[1]][CARD_EFF.COST_REDUCTION]) game.hand[game.select[1]][CARD_EFF.COST_REDUCTION]++;
			else game.hand[game.select[1]][CARD_EFF.COST_REDUCTION] = 1;
		},
		can(level = 0) {return game.hand.length > 1},
		cannotMessage: "no valid target",
	},
	4000: {
		name: "aura blade",
		desc: "Gain 1 aura blade.",
		rarity: 1,
		cost: [1, 0],
		effect(level = 0) {gainEff(EFF.AURA_BLADE, 1)},
	},
	4001: {
		name: "aura blaze",
		desc: "Gain 4 aura blades.\nOne use.",
		rarity: 2,
		cost: [3, 2],
		effect(level = 0) {gainEff(EFF.AURA_BLADE, 4)},
	},
};

/**
 * Returns a card's attribute.
 * @param {string} attr - the attribute to return.
 * @param {number} id - the card's id.
 * @param {number} level - the card's level. Defaults to `0`.
 */
function getCardAttr(attr, id, level = 0) {
	if (!cards[id] || cards[id][attr] === null) return;
	if (attr == "name") return title(cards[id].name) + "+".repeat(level);
	if (typeof cards[id][attr] == "object") {
		if (attr == "select") {
			if (typeof cards[id][attr][level] == "object") return cards[id][attr][level];
			return cards[id][attr];
		};
		return cards[id][attr][level];
	};
	return cards[id][attr];
};

const RARITY = ["starter", "common", "rare"];

const CARD_TYPE = ["error", "attack", "defense", "skill", "magic"];

/**
 * Loads a card and returns its description.
 * @param {object} ref - a reference to the card.
 * @param {string} desc - the card's description.
 */
function loadCard(ref, desc) {
	// color text
	desc = color(desc);
	// list keywords
	if (!ref.keywords) ref.keywords = [];
	for (const eff in EFF) {
		if (EFF.hasOwnProperty(eff)) {
			if (!ref.keywords.includes(EFF[eff]) && new RegExp(EFF_NAME[EFF[eff]].replace(" ", "\\s").replace("+", "\\+"), "i").test(desc)) ref.keywords.push(EFF[eff]);
		};
	};
	for (const eff in CARD_EFF) {
		if (CARD_EFF.hasOwnProperty(eff) && CARD_EFF[eff] !== CARD_EFF.COST_REDUCTION && CARD_EFF[eff] !== CARD_EFF.DESC) {
			if (!ref.keywords.includes(CARD_EFF[eff]) && new RegExp(EFF_NAME[CARD_EFF[eff]].replace(" ", "\\s").replace("+", "\\+"), "i").test(desc)) ref.keywords.push(CARD_EFF[eff]);
		};
	};
	// extra info
	if (!ref.keywords.includes(CARD_EFF.DESC) && /apply/i.test(desc) && /card/i.test(desc)) ref.keywords.push(CARD_EFF.DESC);
	// return desc
	return desc;
};

for (const key in cards) {
	if (cards.hasOwnProperty(key)) {
		if (cards[key].desc instanceof Array) {
			for (let index = 0; index < cards[key].desc.length; index++) {
				cards[key].desc[index] = loadCard(cards[key], cards[key].desc[index]);
			};
		} else {
			cards[key].desc = loadCard(cards[key], cards[key].desc);
		};
	};
};

class Card {
	/**
	 * Returns a new card.
	 * @param {number} id - the card's id.
	 * @param {number} level - the card's level. Defaults to `0`.
	 */
	constructor(id, level = 0) {
		if (cards[id] === undefined) this.id = 0;
		else this.id = id;
		this.level = level;
	};
};

/**
 * Returns an object as a card.
 * @param {object} object - the object to classify.
 */
function classifyCard(object = {}) {
	let instance = new Card(0);
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			instance[key] = object[key];
		};
	};
	return instance;
};

/**
 * Sorts an array of cards. This method mutates the array and returns a reference to the same array.
 */
Array.prototype.cardSort = function() {
	return this.sort((a, b) => {
		// sort by type
		if (Math.floor(a.id / 1000) < Math.floor(b.id / 1000)) return -1;
		if (Math.floor(a.id / 1000) > Math.floor(b.id / 1000)) return 1;
		// sort by rarity
		if (cards[a.id].rarity > cards[b.id].rarity) return -1;
		if (cards[a.id].rarity < cards[b.id].rarity) return 1;
		// sort by name
		if (cards[a.id].name < cards[b.id].name) return -1;
		if (cards[a.id].name > cards[b.id].name) return 1;
		// sort by level
		if (a.level > b.level) return -1;
		if (a.level < b.level) return 1;
		// end sort
		return 0;
	});
};

const cardIDs = [[], [], []];

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
			card = cardIDs[rarity][randomInt(0, cardIDs[rarity].length - 1)];
		};
		result.push(card);
	};
	return result;
};
