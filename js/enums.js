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
const ATTACK = 700, DEFEND = 701, BUFF = 702, SUMMON = 703;

// enemy animation states
const PENDING = 800, STARTING = 801, MIDDLE = 802, ENDING = 803;

// short descriptions of enemy intents
const INTENT = {[ATTACK]: "<#f44>attack</#f44> you", [DEFEND]: "<#58f>defend</#58f> itself", [BUFF]: "buff itself", [SUMMON]: "summon minion(s)"};

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
const OPTION = {MUSIC: 1600, SCREEN_SHAKE: 1601, STICKY_CARDS: 1602, PIXEL_PERFECT_SCREEN: 1603, PIXEL_PERFECT_SIZE: 1604, ALLOW_FAST_MOVEMENT: 1605, MUSIC_TRACK: 1699};

// names of options
const OPTION_NAMES = {[OPTION.MUSIC]: "Music", [OPTION.SCREEN_SHAKE]: "Screen shake", [OPTION.STICKY_CARDS]: "Sticky cards", [OPTION.PIXEL_PERFECT_SCREEN]: "Pixel perfect screen", [OPTION.PIXEL_PERFECT_SIZE]: "Pixel perfect size", [OPTION.ALLOW_FAST_MOVEMENT]: "Allow fast movement", [OPTION.MUSIC_TRACK]: "Music Track"};

// general effects
const EFFECT = {AURA_BLADE: 1700, BURN: 1701, REINFORCE: 1702, RESILIENCE: 1703, WEAKNESS: 1704, BLAZE: 1705, ATKUP: 1706, DEFUP: 1707};

// card effects
const CARD_EFF = {ONE_USE: 1800, UNIFORM: 1801, UNPLAYABLE: 1802, COST_REDUCTION: 1803, RETENTION: 1804};
const CARD_EFF_DESC = 1899;

// enemy effects
const ENEMY_EFF = {COUNTDOWN: 1900, REWIND: 1901, SHROUD: 1902, PLAN_ATTACK: 1903, PLAN_SUMMON: 1904, PLAN_DEFEND: 1905};

// names of effects
const KEYWORD = {[EFFECT.AURA_BLADE]: "aura blade", [EFFECT.BURN]: "burn", [EFFECT.REINFORCE]: "reinforce", [EFFECT.RESILIENCE]: "resilience", [EFFECT.WEAKNESS]: "weakness", [EFFECT.BLAZE]: "blaze", [EFFECT.ATKUP]: "ATK+", [EFFECT.DEFUP]: "DEF+", [CARD_EFF.ONE_USE]: "one use", [CARD_EFF.RETENTION]: "retention", [CARD_EFF.UNIFORM]: "uniform", [CARD_EFF.UNPLAYABLE]: "unplayable", [ENEMY_EFF.COUNTDOWN]: "countdown", [ENEMY_EFF.REWIND]: "rewind", [ENEMY_EFF.SHROUD]: "shroud", [ENEMY_EFF.PLAN_ATTACK]: "plan attack", [ENEMY_EFF.PLAN_SUMMON]: "plan summon", [ENEMY_EFF.PLAN_DEFEND]: "plan defend"};
