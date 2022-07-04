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

class Card {
	constructor(name) {
		this.name = name;
		this.rarity = "";
		this.type = "";
		this.text = "";
		this.energyCost = 0;
		this.level = 0;
		this.unplayable = false;
		this.order = -1;
		// error
		if (name != "slash" && name != "block" && name != "reinforce" && name != "aura blade" && name != "error") {
			name = "error";
			this.name = "error";
		};
		// rarity
		if (name == "slash" || name == "block") {
			this.rarity = "starter";
		} else if (name == "reinforce" || name == "aura blade") {
			this.rarity = "common";
		} else {
			this.rarity = "error";
		};
		// type
		if (name == "slash") {
			this.type = "attack";
		} else if (name == "block" || name == "reinforce") {
			this.type = "defense";
		} else if (name == "aura blade") {
			this.type = "magic";
		} else if (name == "error") {
			this.type = "curse";
		};
		// energy cost
		if (name == "slash" || name == "block" || name == "reinforce") {
			this.energyCost = 1;
		} else if (name == "aura blade") {
			this.energyCost = 2;
		};
		// special
		if (name == "error") {
			this.unplayable = true;
		};
		// text
		if (name == "slash") {
			this.text = "Deal 5 damage.";
		} else if (name == "block") {
			this.text = "Gain 4 shield.";
		} else if (name == "reinforce") {
			this.text = "Gain 1 shield and\n1 reinforce.";
		} else if (name == "aura blade") {
			this.text = "Gain 1 aura blade.";
		} else if (name == "error") {
			this.text = "Unplayable.";
		};
		// order
		if (this.rarity == "starter") this.order = 1;
		else if (this.rarity == "common") this.order = 0;
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
