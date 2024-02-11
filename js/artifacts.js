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

const END_OF_BATTLE = 900, ON_PICKUP = 901, END_OF_TURN = 902;

const artifacts = {
	0: {
		name: "determination",
		desc: "As you confront your\ngreatest challenge yet,\nyou are filled with\na familiar feeling...",
		rarity: 0,
	},
	1: {
		name: "iron will",
		desc: "Every time a battle\nends, you heal 2 health.",
		rarity: 0,
		[END_OF_BATTLE]() {
			game.health += 2;
		},
	},
	2: {
		name: "supershield",
		rarity: 1,
		desc: "All cards that give\nshield give 2 extra.",
	},
	3: {
		name: "gem of rage",
		rarity: 1,
		desc: "All cards that deal\ndamage deal 2 extra.",
	},
	4: {
		name: "candy",
		rarity: 1,
		desc: "You have 15 less max\nhealth, but you heal by\n3 after every battle.",
		[END_OF_BATTLE]() {
			game.health += 3;
		},
	},
	5: {
		name: "corrosion",
		rarity: 1,
		desc: "You have 1 more max\nenergy, but you take\n4 damage after each of\nyour turns.",
		[END_OF_TURN]() {
			takeDamage(4, false);
		},
	},
	6: {
		name: "card charm",
		rarity: 1,
		desc: "You get 1 extra card\nreward choice, but your\nhand size is 1 smaller.",
	},
	7: {
		name: "nutritious meal",
		rarity: 1,
		desc: "You have 15 more max health.\nOn pickup, heal 10 health.",
		[ON_PICKUP]() {
			game.health += 10;
		},
	},
};

for (const key in artifacts) {
	if (Object.hasOwnProperty.call(artifacts, key)) {
		artifacts[key].desc = artifacts[key].desc.replace(/(max\shealth|health|heal|damage|attack)/gi, "<#f44>$1</#f44>");
		artifacts[key].desc = artifacts[key].desc.replace(/(shield|defense)/gi, "<#58f>$1</#58f>");
	};
};

/**
 * Returns a random artifact's id.
 * @param {number[]} notInclude - the ids to not include.
 */
function randomArtifact(notInclude = []) {
	let bool = true;
	if (notInclude.length) {
		for (const key in artifacts) {
			if (Object.hasOwnProperty.call(artifacts, key)) {
				if (artifacts[key].rarity > 0 && !notInclude.includes(+key)) {
					bool = false;
				};
			};
		};
	};
	if (bool) {
		return randomInt(2, Object.keys(artifact).length - 1);
	};
	let result;
	while (!result || notInclude.includes(result)) {
		result = randomInt(2, Object.keys(artifact).length - 1);
	};
	return result;
};

/**
 * Returns a random artifact set.
 * @param {number} length - the length of the set. Defaults to `0`.
 */
function randomArtifactSet(length = 0) {
	if (length <= 0) return [];
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomArtifact(result));
	};
	return result;
};
