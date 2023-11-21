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

const ENDOFBATTLE = 900, ONPICKUP = 901;

const artifacts = {
	1: {
		name: "iron will",
		desc: "Every time a battle\nends, you heal 2 health.",
		rarity: 0,
		[ENDOFBATTLE]() {
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
		[ENDOFBATTLE]() {
			game.health += 3;
		},
	},
	5: {
		name: "corrosion",
		rarity: 1,
		desc: "You have 1 more energy,\nbut you lose 8 health\nafter every battle.",
		[ENDOFBATTLE]() {
			game.health -= 8;
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
		[ONPICKUP]() {
			game.health += 10;
		},
	},
};

for (const key in artifacts) {
	if (Object.hasOwnProperty.call(artifacts, key)) {
		artifacts[key].desc = artifacts[key].desc.replace(/([Mm]ax\shealth|[Hh]ealth|[Hh]eal|[Dd]amage(?!<\/#f44>)|[Ee]xtra\sdamage|[Aa]ttack)/g, "<#f44>$1</#f44>").replace(/([Ss]hield|[Dd]efense)/g, "<#58f>$1</#58f>").replace(/([Ee]nergy|[Cc]ard\sreward\schoice)/g, "<#ff0 highlight>$1</#ff0>");
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
		return randomInt(2, Object.keys(artifact).length);
	};
	let result;
	while (!result || notInclude.includes(result)) {
		result = randomInt(2, Object.keys(artifact).length);
	};
	return result;
};

/**
 * Returns a random artifact set.
 * @param {number} length - the length of the set. Default is `0`.
 */
function randomArtifactSet(length = 0) {
	if (length <= 0) return [];
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomArtifact(result));
	};
	return result;
};
