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

const cards = { // card attributes format: [type, ...special];
	"aura blade": {
		desc: "Gain 1 aura blade.",
		attributes: ["magic"],
		cost: 1,
	},
	"block": {
		desc: "Gain 4 shield.",
		attributes: ["defense"],
		cost: 1,
	},
	"error": {
		desc: "Unplayable.",
		attributes: ["error", "unplayable"],
		cost: 0,
	},
	"everlasting shield": {
		desc: "Gain 3 reinforces.",
		attributes: ["defense"],
		cost: 2,
	},
	"reinforce": {
		desc: "Gain 1 shield and\n1 reinforce.",
		attributes: ["defense"],
		cost: 1,
	},
	"slash": {
		desc: "Deal 5 damage.",
		attributes: ["attack"],
		cost: 1,
	},
	"war cry": {
		desc: "All enemies (except\nbosses) switch\ntheir intents to\ndefense.",
		attributes: ["skill"],
		cost: 1,
	},
};

class Card {
	constructor(name, level = 0) {
		if (cards[name] === undefined) name = "error";
		this.name = name;
		this.rarity = "";
		this.level = level;
		this.order = -1;
		// rarity
		if (Object.keys(card.starter).includes(name)) {
			this.rarity = "starter";
		} else if (Object.keys(card.common).includes(name)) {
			this.rarity = "common";
		} else if (Object.keys(card.rare).includes(name)) {
			this.rarity = "rare";
		} else {
			this.rarity = "error";
		};
		// order
		if (this.rarity == "starter") this.order = 2;
		else if (this.rarity == "common") this.order = 1;
		else if (this.rarity == "rare") this.order = 0;
		else this.order = -1;
	};
};

Array.prototype.cardSort = function() {
	return this.sort(function compareFn(a, b) {
		if (a.order < b.order) {
			return -1;
		};
		if (a.order > b.order) {
			return 1;
		};
		if (cards[a.name].attributes[0] < cards[b.name].attributes[0]) {
			return -1;
		};
		if (cards[a.name].attributes[0] > cards[b.name].attributes[0]) {
			return 1;
		};
		if (a.name < b.name) {
			return -1;
		};
		if (a.name > b.name) {
			return 1;
		};
		return 0;
	});
};

function randomCardSet(length = 0) {
	if (length <= 0) return [];
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomCard(result));
	};
	return result;
};

function randomCard(notInclude = []) {
	const common = Object.keys(card.common), rare = Object.keys(card.rare);
	let not = notInclude.toString(), bool = true;
	if (not) {
		for (let index = 0; index < common.length; index++) {
			if (!not.includes(common[index])) bool = false;
		};
		for (let index = 0; index < rare.length; index++) {
			if (!not.includes(rare[index])) bool = false;
		};
	};
	if (bool) {
		let result;
		if (chance(7/10)) {
			result = common[randomInt(0, Object.keys(card.common).length - 1)];
		} else {
			result = rare[randomInt(0, Object.keys(card.rare).length - 1)];			
		};
		return result;
	};
	let result;
	while (!result || notInclude.includes(result)) {
		if (chance(7/10)) {
			result = common[randomInt(0, Object.keys(card.common).length - 1)];
		} else {
			result = rare[randomInt(0, Object.keys(card.rare).length - 1)];			
		};
	};
	return result;
};
