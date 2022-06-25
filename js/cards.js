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
        if (name != "slash" && name != "block" && name != "aura blade" && name != "error") {
            name = "error";
            this.name = "error";
        };
        // rarity
        if (name == "slash" || name == "block" || name == "aura blade") {
            this.rarity = "starter";
        } else {
            this.rarity = "error";
        };
        // type
        if (name == "slash") {
            this.type = "attack";
        } else if (name == "block") {
            this.type = "defense";
        } else if (name == "aura blade") {
            this.type = "magic";
        } else if (name == "error") {
            this.type = "curse";
        };
        // energy cost
        if (name == "slash" || name == "block") {
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
        } else if (name == "aura blade") {
            this.text = "Gain 1 aura blade.";
        } else if (name == "error") {
            this.text = "Unplayable.";
        };
    };
};

Array.prototype.cardSort = function() {
    for (let item in this) {
        if (!item.name || !item.rarity || !item.type) return;
    };
    this.sort(function compareFn(a, b) {
        if (a.rarity == "error") a.order = -1;
        if (b.rarity == "error") b.order = -1;
        if (a.rarity == "starter") a.order = 0;
        if (b.rarity == "starter") b.order = 0;
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
