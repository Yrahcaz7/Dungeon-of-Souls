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

// map piece generation attributes
const MAP_PIECE = {FIRST: 0, TREASURE: 1, PRIME: 2, ORB: 3, BOSS: 4, EVENT: 5};

// map room types
const ROOM = {BATTLE: 100, TREASURE: 101, PRIME: 102, ORB: 103, BOSS: 104, EVENT: 105};

// player attack effects
const ATT_EFF = {AURA_BLADE: 200};

// normal selections
const HAND = 300, LOOKAT_YOU = 301, LOOKAT_ENEMY = 302, ATTACK_ENEMY = 303, LOOKER = 304, HELP = 305, END = 306, CONFIRM_END = 307, DECK = 308, DISCARD = 309, MAP = 310, IN_MAP = 311, POPUPS = 312, REWARDS = 313, CARD_REWARDS = 314, ARTIFACTS = 315, VOID = 316, CONFIRM_EXIT = 317, OPTIONS = 318, GAME_OVER = 319, GAME_FIN = 320, GAME_WON = 321, CONFIRM_RESTART = 322, WELCOME = 323, ARTIFACT_REWARDS = 324, CONFIRM_FRAGMENT_UPGRADE = 325, PURIFIER = 326, CONFIRM_PURIFY = 327, CONFIRM_EVENT = 328, REFINER = 329, CONFIRM_REFINE = 330;

// menu selections
const MENU = {TITLE: 400, DIFFICULTY: 401};

// directions
const DIR = {UP: 501, LEFT: 502, CENTER: 503, RIGHT: 504, DOWN: 505};

// enemy types
const SLIME = {BIG: 600, SMALL: 601, PRIME: 602}, FRAGMENT = 603, SENTRY = {BIG: 604, SMALL: 605, PRIME: 606}, SINGULARITY = 607;

// names of enemy types
const ENEMY_NAME = {
	[SLIME.BIG]: "big slime",
	[SLIME.SMALL]: "small slime",
	[SLIME.PRIME]: "prime slime",
	[FRAGMENT]: "the fragment of time",
	[SENTRY.BIG]: "big sentry",
	[SENTRY.SMALL]: "small sentry",
	[SENTRY.PRIME]: "prime sentry",
	[SINGULARITY]: "the singularity",
};

// score worth of enemy types
const ENEMY_WORTH = {
	[SLIME.BIG]: 100,
	[SLIME.SMALL]: 50,
	[SLIME.PRIME]: 500,
	[FRAGMENT]: 1000,
	[SENTRY.BIG]: 150,
	[SENTRY.SMALL]: 75,
	[SENTRY.PRIME]: 750,
	[SINGULARITY]: 2000,
};

// enemy intents
const INTENT = {ATTACK: 700, DEFEND: 701, BUFF: 702, SUMMON: 703};

// minimal descriptions of enemy intents
const MIN_INTENT_DESC = {
	[INTENT.ATTACK]: "<#f44>attack</#f44> you",
	[INTENT.DEFEND]: "<#58f>defend</#58f> itself",
	[INTENT.BUFF]: "buff itself",
	[INTENT.SUMMON]: "summon minion(s)",
};

// full descriptions of enemy intents
const FULL_INTENT_DESC = {
	[INTENT.ATTACK]: "This enemy intends to attack\nyou on its next turn.",
	[INTENT.DEFEND]: "This enemy intends to defend\nitself on its next turn.",
	[INTENT.BUFF]: "This enemy intends to buff\nitself on its next turn.",
	[INTENT.SUMMON]: "This enemy intends to summon\nminion(s) on its next turn.",
};

// enemy animation states
const PENDING = 800, STARTING = 801, MIDDLE = 802, ENDING = 803;

// artifact effect function keys
const FLOOR_CLEAR = 900, ON_PICKUP = 901, END_OF_TURN = 902, CARD_PLAY = 903;

// room states
const STATE = {ENTER: 1000, BATTLE: 1001, EVENT_FIN: 1002, GAME_END: 1003, EVENT: 1004};

// battle turns
const TURN = {PLAYER: 1100, ENEMY: 1101};

// special selects from card effects
const SELECT_HAND = 1200;

// event battle types
const BATTLE = {CROWD: 1300, AMBUSH: 1301};

// characters
const CHARACTER = {KNIGHT: 1400};

// enemy transitions
const TRANSITION = {SHIELD: 1500};

// options
const OPTION = {MUSIC: 1600, SCREEN_SHAKE: 1601, STICKY_CARDS: 1602, PERFECT_SCREEN: 1603, PERFECT_SIZE: 1604, FAST_MOVEMENT: 1605, MUSIC_TRACK: 1699};

// names of options
const OPTION_NAMES = {[OPTION.MUSIC]: "Music", [OPTION.SCREEN_SHAKE]: "Screen shake", [OPTION.STICKY_CARDS]: "Sticky cards", [OPTION.PERFECT_SCREEN]: "Pixel perfect screen", [OPTION.PERFECT_SIZE]: "Pixel perfect size", [OPTION.FAST_MOVEMENT]: "Allow fast movement", [OPTION.MUSIC_TRACK]: "Music Track"};

// general effects
const EFFECT = {AURA_BLADE: 1700, BURN: 1701, REINFORCE: 1702, RESILIENCE: 1703, WEAKNESS: 1704, BLAZE: 1705, ATKUP: 1706, DEFUP: 1707};

// card effects
const CARD_EFF = {ONE_USE: 1800, UNIFORM: 1801, UNPLAYABLE: 1802, COST_REDUCTION: 1803, RETENTION: 1804, DESC: 1899};

// enemy effects
const ENEMY_EFF = {COUNTDOWN: 1900, REWIND: 1901, SHROUD: 1902, PLAN_ATTACK: 1903, PLAN_SUMMON: 1904, PLAN_DEFEND: 1905};

// names of effects
const EFFECT_NAME = {
	// general effects
	[EFFECT.AURA_BLADE]: "aura blade",
	[EFFECT.BURN]: "burn",
	[EFFECT.REINFORCE]: "reinforce",
	[EFFECT.RESILIENCE]: "resilience",
	[EFFECT.WEAKNESS]: "weakness",
	[EFFECT.BLAZE]: "blaze",
	[EFFECT.ATKUP]: "ATK+",
	[EFFECT.DEFUP]: "DEF+",
	// card effects
	[CARD_EFF.ONE_USE]: "one use",
	[CARD_EFF.RETENTION]: "retention",
	[CARD_EFF.UNIFORM]: "uniform",
	[CARD_EFF.UNPLAYABLE]: "unplayable",
	// enemy effects
	[ENEMY_EFF.COUNTDOWN]: "countdown",
	[ENEMY_EFF.REWIND]: "rewind",
	[ENEMY_EFF.SHROUD]: "shroud",
	[ENEMY_EFF.PLAN_ATTACK]: "plan attack",
	[ENEMY_EFF.PLAN_SUMMON]: "plan summon",
	[ENEMY_EFF.PLAN_DEFEND]: "plan defend",
};

// descriptions of effects
const EFFECT_DESC = {
	// general effects
	[EFFECT.AURA_BLADE]: "If something has X aura\nblades, when it attacks,\nit deals 5 + X extra\ndamage, then X is\nreduced by 1.",
	[EFFECT.BURN]: "If something has X burn,\nat the end of its turn,\nit takes X damage, then\nX is reduced by 1.",
	[EFFECT.REINFORCE]: "If something has X\nreinforces, at the start\nof its turn, its shield\nis kept, then X is\nreduced by 1.",
	[EFFECT.RESILIENCE]: "If something has X\nresilience, it takes 25%\nless combat damage,\nrounded down. At the\nstart of its turn, X is\nreduced by 1.",
	[EFFECT.WEAKNESS]: "If something has X\nweakness, its attack is\nreduced by 25%, rounded\ndown. At the end of its\nturn, X is reduced by 1.",
	[EFFECT.BLAZE]: "If something has X\nblaze, when it attacks,\nit inflicts 1 fire on\nthe target. At the end\nof its turn, X is\nreduced by 1.",
	[EFFECT.ATKUP]: "If something has X ATK+,\nits attack is increased\nby 25%, rounded down. At\nthe end of its turn, X\nis reduced by 1.",
	[EFFECT.DEFUP]: "If something has X DEF+,\nits defense is increased\nby 25%, rounded down. At\nthe end of its turn, X\nis reduced by 1.",
	// card effects
	[CARD_EFF.ONE_USE]: "When a one use card is\nplayed, it is sent to\nthe void. Cards in the\nvoid stay there until\nthe end of the battle.",
	[CARD_EFF.RETENTION]: "A card with X retention\nwill not be discarded\nat the end of your turn.\nInstead, X will be\nreduced by 1.",
	[CARD_EFF.UNIFORM]: "Extra damage and extra\nshield have half the\neffect on uniform cards,\nrounded down.",
	[CARD_EFF.UNPLAYABLE]: "An unplayable card has\nno energy cost and\ncannot be played.",
	[CARD_EFF.DESC]: "After a card leaves\nyour hand, it loses all\nof its applied effects.",
	// enemy effects
	[ENEMY_EFF.COUNTDOWN]: "If an enemy has X\ncountdown, at the end of\nits turn, its intent is\nset to what it was on\nthe Xth turn, and then\nX is reduced by 1.",
	[ENEMY_EFF.REWIND]: "If something has X\nrewinds, it is X times\n20 percent stronger. If\nsomething that has\nrewinds and 0 countdown\nreaches 0 health, it\ngains 1 rewind, all\nentities heal fully, and\nthe countdown begins.",
	[ENEMY_EFF.SHROUD]: "If something has X\nshroud, its intent is\nnot visible. At the end\nof its turn, X is\nreduced by 1.",
	[ENEMY_EFF.PLAN_ATTACK]: "If something has plan\nattack: If you have\nenough shield to block\n100% of its attack, it\ngains 2 ATK+ and makes a\nnew plan. If it has\nshield and intends to\ndefend, it changes its\nintent to attack and\nmakes a new plan.",
	[ENEMY_EFF.PLAN_SUMMON]: "If something has plan\nsummon: If you have\nenough shield to block\n100% of its attack or it\nhas shield and intends\nto defend, it changes\nits intent to summon and\nmakes a new plan.",
	[ENEMY_EFF.PLAN_DEFEND]: "If something has plan\ndefend: If it has shield\nand intends to defend,\nit gains 2 DEF+ and\nmakes a new plan. If you\nhave enough shield to\nblock 100% of its\nattack, it changes its\nintent to defense and\nmakes a new plan.",
};

for (const key in EFFECT_DESC) {
	if (EFFECT_DESC.hasOwnProperty(key)) {
		EFFECT_DESC[key] = EFFECT_DESC[key].replace(/(health|heal|combat\sdamage|extra\sdamage|damage|attacks|attack)/gi, "<#f44>$1</#f44>");
		EFFECT_DESC[key] = EFFECT_DESC[key].replace(/(extra\sshield|shield|defend|defense)/gi, "<#58f>$1</#58f>");
		EFFECT_DESC[key] = EFFECT_DESC[key].replace(/(one\suse|retention|uniform|unplayable)/gi, "<#666>$1</#666>");
	};
};
