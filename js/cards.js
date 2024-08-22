/*  Dungeon of Souls
 *  Copyright (C) 2024 Yrahcaz7
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

const SELECT_HAND = 1200;

const cards = {
	0: {
		name: "error",
		desc: ["This card is\nclearly an error.\nUnplayable.", "Wow! An improved\nerror! Amazing! It\ndefinitely still\nisn't unplayable,\nright? That would\nbe ridiculous."],
		rarity: -1,
		cost: 0,
	},
	1000: {
		name: "slash",
		desc: ["Deal 5 damage.", "Deal 10 damage."],
		rarity: 0,
		cost: 1,
		anim: "attack",
		damage: [5, 10],
	},
	1001: {
		name: "heat wave",
		desc: ["Deal 7 damage to\nan enemy, and apply\n2 burn to all\nenemies.", "Deal 8 damage to\nan enemy, and apply\n3 burn to all\nenemies."],
		rarity: 2,
		cost: 2,
		anim: "attack",
		damage: [7, 8],
		attack(level = 0) {
			let burn = (level >= 1 ? 3 : 2);
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff[EFFECT.BURN]) game.enemies[index].eff[EFFECT.BURN] += burn;
				else game.enemies[index].eff[EFFECT.BURN] = burn;
			};
		},
	},
	1002: {
		name: "sweeping slash",
		desc: ["Deal 4 damage to\nall enemies.\nUniform.", "Deal 8 damage to\nall enemies.\nUniform."],
		rarity: 1,
		cost: 1,
		anim: "attack_2",
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
		desc: "Consume all X aura\nblades to deal\nX times 6 damage\nto one enemy and\nX to all others.\nUniform.",
		rarity: 2,
		cost: [2, 1],
		attackEffects: false,
		attack(level = 0) {
			if (game.eff[EFFECT.AURA_BLADE]) {
				dealDamage(game.eff[EFFECT.AURA_BLADE] * 6, 0.5);
				for (let index = 0; index < game.enemies.length; index++) {
					if (index != game.enemyAtt[1]) dealDamage(game.eff[EFFECT.AURA_BLADE], 0.5, index);
				};
				game.eff[EFFECT.AURA_BLADE] = 0;
			};
		},
	},
	1004: {
		name: "gold slash",
		desc: ["Consume 25 gold to\ndeal 8 damage.", "Consume 20 gold to\ndeal 15 damage."],
		rarity: 1,
		cost: 1,
		anim: "attack",
		damage: [8, 15],
		attack(level = 0) {
			if (level >= 1) game.gold -= 20;
			else game.gold -= 25;
		},
		can(level = 0) {
			if (level >= 1) return game.gold >= 20;
			else return game.gold >= 25;
		},
		cannotMessage: "not enough gold",
	},
	1005: {
		name: "iron slash",
		desc: "Deal 12 damage.",
		rarity: 1,
		cost: [2, 1],
		anim: "attack",
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
				gainEff(EFFECT.REINFORCE, 2);
			} else {
				playerGainShield(2);
				gainEff(EFFECT.REINFORCE, 1);
			};
		},
	},
	2002: {
		name: "everlasting shield",
		desc: "Gain 3 reinforces.",
		rarity: 2,
		cost: [2, 1],
		effect(level = 0) {gainEff(EFFECT.REINFORCE, 3)},
	},
	2003: {
		name: "cower",
		desc: ["Gain 9 shield and\n2 weakness.", "Gain 10 shield and\n1 weakness."],
		rarity: 1,
		cost: 1,
		effect(level = 0) {
			if (level >= 1) {
				playerGainShield(10);
				gainEff(EFFECT.WEAKNESS, 1);
			} else {
				playerGainShield(9);
				gainEff(EFFECT.WEAKNESS, 2);
			};
		},
	},
	2004: {
		name: "resilience",
		desc: ["Gain 2 resilience.", "Gain 3 resilience."],
		rarity: 2,
		cost: 1,
		effect(level = 0) {gainEff(EFFECT.RESILIENCE, (level >= 1 ? 3 : 2))},
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
			gainEff(EFFECT.REINFORCE, 1);
		},
		can(level = 0) {
			if (level >= 1) return game.gold >= 30;
			else return game.gold >= 45;
		},
		cannotMessage: "not enough gold",
	},
	3000: {
		name: "war cry",
		desc: ["All enemies (except\nbosses) switch\ntheir intents to\ndefense. One use.", "All enemies (except\nbosses) switch\ntheir intents to\ndefense. Draw a\ncard. One use."],
		rarity: 1,
		cost: 0,
		effect(level = 0) {
			startAnim.effect("war cry");
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].type !== FRAGMENT) {
					game.enemies[index].intent = DEFEND;
					game.enemies[index].intentHistory[game.enemies[index].intentHistory.length - 1] = DEFEND;
				};
			};
			if (level >= 1) drawCards(1);
		},
	},
	3001: {
		name: "rage",
		desc: ["Kill a non-boss\nenemy. Take damage\nequal to half its\nhealth, rounded up.", "Kill a non-boss\nenemy. Take damage\nequal to half its\nhealth, rounded up.\nDraw a card."],
		rarity: 1,
		cost: 0,
		attackEffects: false,
		attack(level = 0) {
			if (game.enemies[game.enemyAtt[1]].type !== FRAGMENT) {
				takeDamage(Math.ceil(game.enemies[game.enemyAtt[1]].health / 2));
				game.enemies[game.enemyAtt[1]].health = 0;
			};
			if (level >= 1) drawCards(1);
		},
	},
	3002: {
		name: "burn",
		desc: ["Apply 1 burn to\nyourself and all\nenemies.", "Apply 2 burn to\nyourself and all\nenemies."],
		rarity: 1,
		cost: 0,
		effect(level = 0) {
			let burn = (level >= 1 ? 2 : 1);
			gainEff(EFFECT.BURN, burn);
			for (let index = 0; index < game.enemies.length; index++) {
				if (game.enemies[index].eff[EFFECT.BURN]) game.enemies[index].eff[EFFECT.BURN] += burn;
				else game.enemies[index].eff[EFFECT.BURN] = burn;
			};
		},
	},
	3003: {
		name: "memorize",
		desc: "Choose a card from\nyour hand. Apply\n1 cost reduction\nand 1 retention to\nthe chosen card.",
		rarity: 2,
		cost: [1, 0],
		select: [SELECT_HAND, -1],
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
		effect(level = 0) {gainEff(EFFECT.AURA_BLADE, 1)},
	},
	4001: {
		name: "aura blaze",
		desc: "Gain 4 aura blades.\nOne use.",
		rarity: 2,
		cost: [3, 2],
		effect(level = 0) {gainEff(EFFECT.AURA_BLADE, 4)},
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

const EFFECT = {AURA_BLADE: 1700, BURN: 1701, REINFORCE: 1702, RESILIENCE: 1703, WEAKNESS: 1704, BLAZE: 1705, ATKUP: 1706, DEFUP: 1707};

const CARD_EFF = {ONE_USE: 1800, UNIFORM: 1801, UNPLAYABLE: 1802, COST_REDUCTION: 1803, RETENTION: 1804};

const CARD_EFF_DESC = 1899;

const ENEMY_EFF = {COUNTDOWN: 1900, REWIND: 1901, SHROUD: 1902, PLAN_ATTACK: 1903, PLAN_SUMMON: 1904, PLAN_DEFEND: 1905};

const KEYWORD = {[EFFECT.AURA_BLADE]: "aura blade", [EFFECT.BURN]: "burn", [EFFECT.REINFORCE]: "reinforce", [EFFECT.RESILIENCE]: "resilience", [EFFECT.WEAKNESS]: "weakness", [EFFECT.BLAZE]: "blaze", [EFFECT.ATKUP]: "ATK+", [EFFECT.DEFUP]: "DEF+", [CARD_EFF.ONE_USE]: "one use", [CARD_EFF.RETENTION]: "retention", [CARD_EFF.UNIFORM]: "uniform", [CARD_EFF.UNPLAYABLE]: "unplayable", [ENEMY_EFF.COUNTDOWN]: "countdown", [ENEMY_EFF.REWIND]: "rewind", [ENEMY_EFF.SHROUD]: "shroud", [ENEMY_EFF.PLAN_ATTACK]: "plan attack", [ENEMY_EFF.PLAN_SUMMON]: "plan summon", [ENEMY_EFF.PLAN_DEFEND]: "plan defend"};

/**
 * Loads a card and returns its description.
 * @param {object} ref - a reference to the card.
 * @param {string} desc - the card's description.
 */
function loadCard(ref, desc) {
	// color text
	desc = desc.replace(/(health|damage|attack)/gi, "<#f44>$1</#f44>");
	desc = desc.replace(/(shield|defense)/gi, "<#58f>$1</#58f>");
	desc = desc.replace(/(one\suse|retention|uniform|unplayable)/gi, "<#666>$1</#666>");
	// list keywords
	if (!ref.keywords) ref.keywords = [];
	for (const eff in EFFECT) {
		if (EFFECT.hasOwnProperty(eff)) {
			if (!ref.keywords.includes(EFFECT[eff]) && new RegExp(KEYWORD[EFFECT[eff]].replace(" ", "\\s").replace("+", "\\+"), "i").test(desc)) ref.keywords.push(EFFECT[eff]);
		};
	};
	for (const eff in CARD_EFF) {
		if (CARD_EFF.hasOwnProperty(eff) && CARD_EFF[eff] !== CARD_EFF.COST_REDUCTION) {
			if (!ref.keywords.includes(CARD_EFF[eff]) && new RegExp(KEYWORD[CARD_EFF[eff]].replace(" ", "\\s").replace("+", "\\+"), "i").test(desc)) ref.keywords.push(CARD_EFF[eff]);
		};
	};
	// extra info
	if (!ref.keywords.includes(CARD_EFF_DESC) && /apply/i.test(desc) && /card/i.test(desc)) ref.keywords.push(CARD_EFF_DESC);
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
 * Returns a random card's id.
 * @param {number[]} notInclude - the ids to not include.
 */
function randomCard(notInclude = []) {
	let result = 0;
	while (!result || notInclude.includes(result)) {
		let rarity = (chance(3/10) ? 2 : 1);
		result = cardIDs[rarity][randomInt(0, cardIDs[rarity].length - 1)];
	};
	return result;
};

/**
 * Returns a random card set.
 * @param {number} length - the length of the set. Defaults to `0`.
 */
function randomCardSet(length = 0) {
	if (length <= 0) return [];
	if (length > 10) length = 10;
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomCard(result));
	};
	return result;
};
