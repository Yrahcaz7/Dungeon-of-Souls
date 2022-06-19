/*
    Dungeon of Souls
    Copyright (C) 2022 Yrahcaz7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

class Card {
    constructor(name) {
        this.name = name;
        this.rarity = "";
        this.type = "";
        this.energyCost = 0;
        this.unplayable = false;
        // error
        if (name != "slash" && name != "block" && name != "error") {
            name = "error";
            this.name = "error";
        };
        // rarity
        if (name == "error") {
            this.rarity = "error";
        };
        if (name == "slash" || name == "block") {
            this.rarity = "starter";
        };
        // type
        if (name == "slash") {
            this.type = "attack";
        };
        if (name == "block") {
            this.type = "defense";
        };
        if (name == "error") {
            this.type = "curse";
        };
        // energy cost
        if (name == "slash" || name == "block") {
            this.energyCost = 1;
        };
        // special
        if (name == "error") {
            this.unplayable = true;
        };
    };
};
