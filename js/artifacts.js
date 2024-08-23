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

const artifacts = {
	0: {
		name: "error",
		desc: "This artifact is clearly\nan error. It does\nabsolutely nothing.",
	},
	100: {
		name: "supershield",
		desc: "All cards that give\nshield give 2 extra.",
	},
	101: {
		name: "gem of rage",
		desc: "All cards that deal\ndamage deal 2 extra.",
	},
	102: {
		name: "candy",
		desc: "You have 15 less max\nhealth, but you heal by\n3 each time you clear a\nfloor.",
		[FLOOR_CLEAR]() {
			game.health += 3;
		},
	},
	103: {
		name: "corrosion",
		desc: "You have 1 more max\nenergy, but you take\n4 damage after each of\nyour turns.",
		[END_OF_TURN]() {
			takeDamage(4, false);
		},
	},
	104: {
		name: "card charm",
		desc: "You get 1 extra card\nreward choice, but your\nhand size is 1 smaller.",
	},
	105: {
		name: "nutritious meal",
		desc: "You have 15 more max health.\nOn pickup, heal 10 health.",
		[ON_PICKUP]() {
			game.health += 10;
		},
	},
	106: {
		name: "magic book",
		desc: "You draw a card each\ntime you play a magic\ntype card.",
		[CARD_PLAY](cardObj) {
			if (Math.floor(cardObj.id / 1000) == 4) {
				drawCards(1);
			};
		},
	},
	107: {
		name: "bottled fire",
		desc: "If an enemy takes damage\nfrom a burn effect, it\ntriggers an additional\ntime. This effect cannot\ntrigger itself.",
	},
	200: {
		name: "the map",
		desc: "You can choose where\nto go next each time\nyou clear a floor.",
	},
	201: {
		name: "iron will",
		desc: "You heal 2 health each\ntime you clear a floor.",
		[FLOOR_CLEAR]() {
			game.health += 2;
		},
	},
	202: {
		name: "determination",
		desc: "As you confront your\ngreatest challenge yet,\nyou are filled with\na familiar feeling...",
	},
};

for (const key in artifacts) {
	if (artifacts.hasOwnProperty(key)) {
		artifacts[key].desc = artifacts[key].desc.replace(/(max\shealth|health|heal|damage|attack)/gi, "<#f44>$1</#f44>");
		artifacts[key].desc = artifacts[key].desc.replace(/(shield|defense)/gi, "<#58f>$1</#58f>");
		artifacts[key].desc = artifacts[key].desc.replace(/(magic)(\stype)/gi, "<#f0f>$1</#f0f>$2");
	};
};

/**
 * Activates all artifact effects of a type.
 * @param {FLOOR_CLEAR | END_OF_TURN | CARD_PLAY} type - the type of effect.
 */
function activateArtifacts(type, ...params) {
	for (let index = 0; index < game.artifacts.length; index++) {
		const func = artifacts[game.artifacts[index]][type];
		if (typeof func == "function") func(...params);
	};
};

const artifactIDs = [];

/**
 * Returns a random artifact's id.
 * @param {number[]} notInclude - the ids to not include.
 */
function randomArtifact(notInclude = []) {
	if (notInclude.length) {
		let bool = true;
		for (let index = 0; index < artifactIDs.length; index++) {
			if (!notInclude.includes(artifactIDs[index])) {
				bool = false;
				break;
			};
		};
		if (bool) return 0;
	};
	let result;
	while (!result || notInclude.includes(result)) {
		result = artifactIDs[randomInt(0, artifactIDs.length - 1)];
	};
	return result;
};

/**
 * Returns a random artifact set.
 * @param {number} length - the length of the set. Defaults to `0`.
 */
function randomArtifactSet(length = 0) {
	if (length <= 0) return [];
	if (length > 5) length = 5;
	let result = [];
	for (let index = 0; index < length; index++) {
		result.push(randomArtifact(result));
	};
	return result;
};
