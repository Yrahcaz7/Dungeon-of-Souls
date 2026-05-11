/*  Dungeon of Souls
 *  Copyright (C) 2026 Yrahcaz7
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

const ARTIFACTS = {
	0: {
		name: "Error",
		desc: "This artifact is clearly an error. It does absolutely nothing.",
	},
	100: {
		name: "Supershield",
		desc: "All cards that gain shield gain 2 extra.",
	},
	101: {
		name: "Gem of Rage",
		desc: "All cards that deal damage deal 2 extra.",
	},
	102: {
		name: "Candy",
		desc: "You have 15 less max health. On floor clear, gain 3 health.",
		[FUNC.FLOOR_CLEAR]() {
			game.health += 3;
		},
	},
	103: {
		name: "Corrosion",
		desc: "You have 1 more max energy. On end of turn, take 4 decay combat damage.",
		[FUNC.PLAYER_TURN_END]() {
			takeDamage(4, true, -1);
		},
	},
	104: {
		name: "Card Charm",
		desc: "You get 1 extra card reward choice. Your hand size is 1 smaller.",
	},
	105: {
		name: "Nutritious Meal",
		desc: "You have 15 more max health. On pickup, gain 10 health.",
		[FUNC.PICKUP]() {
			game.health += 10;
		},
	},
	106: {
		name: "Magic Book",
		desc: "When you play a magic type card, draw 2 cards.",
		[FUNC.PLAY_CARD](card) {
			if (Math.floor(card.id / 1000) == 4) {
				drawCards(2);
			};
		},
	},
	107: {
		name: "Bottled Fire",
		desc: "Enemies start with 1 burn. Burn deals 3 extra damage to enemies.",
	},
	200: {
		name: "The Map",
		desc: "On floor clear, you can choose where to go next. Interact to open.",
	},
	201: {
		name: "Iron Will",
		desc: "On floor clear, gain 2 health.",
		[FUNC.FLOOR_CLEAR]() {
			game.health += 2;
		},
	},
	202: {
		name: "Determination",
		desc: "As you confront your greatest challenge yet, you are filled with a familiar feeling...",
	},
	203: {
		name: "Warped Essence",
		desc: "You have 1 more max energy. You take 25% more combat damage, rounded up.",
	},
	204: {
		name: "Shrouded Pearl",
		desc: "Non-boss enemies cannot attack on their first turn.",
	},
	205: {
		name: "Corrosion [stage 2]",
		desc: "You have 1 more max energy. On end of turn, take <#0f0 highlight>5</#0f0> decay combat damage.\nSTAGE 2: Your hand size is 1 larger, but decay damage is increased by 1.",
		big: true,
		[FUNC.PLAYER_TURN_END]() {
			takeDamage(5, true, -1);
		},
	},
	206: {
		name: "A Faint Memory",
		desc: "After single-target attack, apply 1 duel.",
		[FUNC.AFTER_ATTACK](card) {
			if (CARDS[card.id].target !== false) {
				game.enemies[game.enemyAtt[1]].gainEff(ENEMY_EFF.DUEL);
			};
		},
	},
};

for (const key in ARTIFACTS) {
	ARTIFACTS[key].desc = wrapText(ARTIFACTS[key].desc, Math.max(ARTIFACTS[key].name.length, 12) * 2, 0, key == 205);
	ARTIFACTS[key].desc = colorText(ARTIFACTS[key].desc);
};

/**
 * Returns a boolean indicating whether the player has an artifact.
 * @param {number} id - the artifact's id.
 */
function hasArtifact(id) {
	if (id == 103 && game.artifacts.includes(205)) return true; // make "Corrosion [stage 2]" count as "Corrosion"
	return game.artifacts.includes(id);
};

/**
 * Activates all artifact effects of a type.
 * @param {number} type - the type of effect.
 */
function activateArtifacts(type, ...params) {
	for (let index = 0; index < game.artifacts.length; index++) {
		const func = ARTIFACTS[game.artifacts[index]][type];
		if (func instanceof Function) func(...params);
	};
};

const ARTIFACT_IDS = [];

/**
 * Returns a random artifact's id.
 * @param {number[]} notInclude - the ids to not include.
 */
function randomArtifact(notInclude = []) {
	if (notInclude.length) {
		let bool = true;
		for (let index = 0; index < ARTIFACT_IDS.length; index++) {
			if (!notInclude.includes(ARTIFACT_IDS[index])) {
				bool = false;
				break;
			};
		};
		if (bool) return 0;
	};
	let result = 0;
	while (!result || notInclude.includes(result)) {
		result = ARTIFACT_IDS[randomInt(0, ARTIFACT_IDS.length - 1)];
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
