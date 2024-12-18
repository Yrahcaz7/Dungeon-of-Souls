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
		desc: "All cards that give you\nshield give you 2 extra.",
	},
	101: {
		name: "gem of rage",
		desc: "All cards that deal\ndamage deal 2 extra.",
	},
	102: {
		name: "candy",
		desc: "You have 15 less max\nhealth, but you gain 3\nhealth each time you\nclear a floor.",
		[FUNC.FLOOR_CLEAR]() {
			game.health += 3;
		},
	},
	103: {
		name: "corrosion",
		desc: "You have 1 more max\nenergy, but you take 4\ncombat damage at the end\nof each of your turns.",
		[FUNC.PLAYER_TURN_END]() {
			takeDamage(4, true, -1);
		},
	},
	104: {
		name: "card charm",
		desc: "You get 1 extra card\nreward choice, but your\nhand size is 1 smaller.",
	},
	105: {
		name: "nutritious meal",
		desc: "You have 15 more max health.\nOn pickup, you gain 10 health.",
		[FUNC.PICKUP]() {
			game.health += 10;
		},
	},
	106: {
		name: "magic book",
		desc: "You draw 2 cards each\ntime you play a magic\ntype card.",
		[FUNC.PLAY_CARD](cardObj) {
			if (Math.floor(cardObj.id / 1000) == 4) {
				drawCards(2);
			};
		},
	},
	107: {
		name: "bottled fire",
		desc: "Enemies start with 1\nburn, and burn deals 3\nextra damage to enemies.",
	},
	200: {
		name: "the map",
		desc: "You can choose where\nto go next each time\nyou clear a floor.",
	},
	201: {
		name: "iron will",
		desc: "You gain 2 health each\ntime you clear a floor.",
		[FUNC.FLOOR_CLEAR]() {
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
		artifacts[key].desc = color(artifacts[key].desc);
	};
};

/**
 * Activates all artifact effects of a type.
 * @param {number} type - the type of effect.
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
