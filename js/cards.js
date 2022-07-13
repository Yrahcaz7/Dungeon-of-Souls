/*
	Dungeon of Souls
	Copyright (C) 2022 Yrahcaz7

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const cards = {
	"aura blade": {
		desc: "Gain 1 aura blade.",
		type: "magic",
		cost: 2,
		unplayable: false,
	},
	"block": {
		desc: "Gain 4 shield.",
		type: "defense",
		cost: 1,
		unplayable: false,
	},
	"error": {
		desc: "Unplayable.",
		type: "curse",
		cost: 0,
		unplayable: true,
	},
	"everlasting shield": {
		desc: "Gain 3 reinforces.",
		type: "defense",
		cost: 2,
		unplayable: false,
	},
	"reinforce": {
		desc: "Gain 1 shield and\n1 reinforce.",
		type: "defense",
		cost: 1,
		unplayable: false,
	},
	"slash": {
		desc: "Deal 5 damage.",
		type: "attack",
		cost: 1,
		unplayable: false,
	},
	"war cry": {
		desc: "All enemies (except\nbosses) switch\ntheir intents to\ndefense.",
		type: "skill",
		cost: 1,
		unplayable: false,
	},
};

class Card {
	constructor(name, level = 0) {
		this.name = name;
		this.rarity = "";
		this.type = cards[name].type;
		this.text = cards[name].desc;
		this.energyCost = cards[name].cost;
		this.level = level;
		this.unplayable = cards[name].unplayable;
		this.order = -1;
		// error
		if (!Object.keys(card.starter).includes(name) && !Object.keys(card.common).includes(name) && !Object.keys(card.rare).includes(name)) {
			name = "error";
			this.name = "error";
		};
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
		if (a.type < b.type) {
			return -1;
		};
		if (a.type > b.type) {
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

function randomCard() {
	if (chance(7/10)) {
		return new Card(Object.keys(card.common)[randomInt(0, Object.keys(card.common).length - 1)]);
	} else {
		return new Card(Object.keys(card.rare)[randomInt(0, Object.keys(card.rare).length - 1)]);
	};
};

function cardReward() {
	let result = [];
	for (let num = 0; num < game.cardRewardChoices; num++) {
		result.push(randomCard());
	};
	return result;
};
