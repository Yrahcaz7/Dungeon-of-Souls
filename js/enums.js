/*  Dungeon of Souls
 *  Copyright (C) 2025 Yrahcaz7
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

// map node generation attributes
const MAP_NODE = {FIRST: 0, TREASURE: 1, PRIME: 2, ORB: 3, BOSS: 4, EVENT: 5};

// map room types
const ROOM = {BATTLE: 100, TREASURE: 101, PRIME: 102, ORB: 103, BOSS: 104, EVENT: 105};

// player attack effects
const ATT_EFF = {AURA_BLADE: 200};

// normal selections - used in `game.select` as [S, N] or [S, N, [S_PREV, N_PREV]]
// N is an integer (which defaults to 0) and is defined differently for each following S:
const S = {
	HAND: 300, // N is the index of the selected card.
	PLAYER: 301, // N does not indicate anything.
	ENEMY: 302, // N is the index of the selected enemy.
	ATTACK: 303, // N is the index of the selected enemy.
	LOOKER: 304, // N indicates if the looker is active (1 if it is, 0 if not).
	HELP: 305, // if N == 0, it indicates that no HELP menu is open; otherwise, it indicates which HELP menu is open.
	END: 306, // N does not indicate anything.
	CONF_END: 307, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	DECK: 308, // N indicates if the respective menu is open (1 if it is, 0 if not).
	DISCARD: 309, // N indicates if the respective menu is open (1 if it is, 0 if not).
	MAP: 311, // If N == 0, it indicates that the back button is selected; otherwise, it indicates the index of the selected node in the available locations array if it exists, and otherwise N indicates that the open cards menu button is selected.
	POPUPS: 312, // N is the index of the selected popup.
	REWARDS: 313, // N is the index of the selected reward.
	CARD_REWARD: 314, // if N >= 0, N is the index of the selected card reward; otherwise, N indicates that the back button is selected and that previously, the card reward with index -N-1 was selected.
	ARTIFACTS: 315, // N is the index of the selected artifact.
	VOID: 316, // N indicates if the respective menu is open (1 if it is, 0 if not).
	CONF_EXIT: 317, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	OPTIONS: 318, // if N == 0, it indicates that the OPTIONS menu is closed; otherwise, it indicates the position of the selection in the open OPTIONS menu.
	GAME_OVER: 319, // N is the opacity of the GAME_OVER screen.
	GAME_WON: 320, // N is the opacity of the GAME_WON screen.
	CONF_SURRENDER: 322, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	WELCOME: 323, // N does not indicate anything.
	ARTIFACT_REWARD: 324, // N is the index of the selected artifact reward if it exists; otherwise, N indicates that the back button is selected.
	CONF_HAND_ALIGN: 325, // N indicates which button is selected (2 for the back button, 1 for the ignore button, 0 for the confirm button).
	PURIFIER: 326, // N does not indicate anything.
	CONF_PURIFY: 327, // N indicates which button is selected (2 for the back button, 1 for the reselect button, 0 for the confirm button).
	EVENT: 328, // N indicates which event is occurring (while game.turn indicates where you are in the event).
	REFINER: 329, // N does not indicate anything.
	CONF_REFINE: 330, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	CARDS: 331, // N indicates if the CARDS menu is on top of the map (0 if it is, 1 if not).
	CONF_PEARL: 332, // N indicates which button is selected (1 for the decline button, 0 for the accept button).
};

// menu selections - used in `menuSelect` as [S, N]
// N is an integer (which defaults to 0) and is defined differently for each following S:
const MENU = {
	MAIN: 400, // N is the index of the selected main menu option.
	DIFFICULTY: 401, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	NEW_RUN: 402, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	PREV_GAMES: 403, // N is three times the index of the selected past run in the current sort plus the index of the selected aspect (0 is cards, 1 is artifacts, and 2 is enemies killed).
	PREV_GAME_INFO: 404, // N is three times the index of the selected past run in the current sort plus the index of the selected aspect (0 is cards, 1 is artifacts, and 2 is enemies killed).
	PREV_GAME_SORT: 405, // N indicates which PREV_GAME_SORT menu is open.
	CHANGE_SEED: 406, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
	ENTER_SEED: 407, // N does not indicate anything.
};

// main menu options
const MAIN_MENU_OPTIONS = ["Resume run", "Start new run", "Change difficulty", "Change seed", "View past runs"];

// previous game sort options
const PREV_GAMES_SORT_NAMES = ["Game number", "Result type", "Difficulty", "Highest floor", "Remaining health", "Remaining gold", "Total score", "Seed string", "Number of cards", "Number of artifacts", "Number of enemies killed"];

// special selects from card effects - used in `game.select` as [S, N] or [S, N, [S_PREV, N_PREV]]
// N is an integer (which defaults to 0) and is defined differently for each following S:
const SS = {
	SELECT_HAND: 1200, // N is the index of the selected card in hand if it exists; otherwise, N indicates that the back button is selected.
};

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

// plural names of enemy types
const PLURAL_ENEMY_NAME = {
	[SLIME.BIG]: "big slimes",
	[SLIME.SMALL]: "small slimes",
	[SLIME.PRIME]: "prime slimes",
	[SENTRY.BIG]: "big sentries",
	[SENTRY.SMALL]: "small sentries",
	[SENTRY.PRIME]: "prime sentries",
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
const INTENT = {ATTACK: 700, DEFEND: 701, BUFF: 702, SUMMON: 703, RITUAL: 704};

// minimal descriptions of enemy intents
const MIN_INTENT_DESC = {
	[INTENT.ATTACK]: "<#f44>attack</#f44> you",
	[INTENT.DEFEND]: "<#58f>defend</#58f> itself",
	[INTENT.BUFF]: "buff itself",
	[INTENT.SUMMON]: "summon a minion",
};

// full descriptions of enemy intents
const FULL_INTENT_DESC = {
	[INTENT.ATTACK]: "This enemy intends to <#f44>attack</#f44>\nyou on its next turn.",
	[INTENT.DEFEND]: "This enemy intends to <#58f>defend</#58f>\nitself on its next turn.",
	[INTENT.BUFF]: "This enemy intends to buff\nitself on its next turn.",
	[INTENT.SUMMON]: "This enemy intends to summon\na minion on its next turn.",
	[INTENT.RITUAL]: "This enemy would have\nsummoned a minion on its\nnext turn, but since there\nare already five, it will\nperform a ritual instead.",
};

// enemy animation states
const ANIM = {PENDING: 800, STARTING: 801, MIDDLE: 802, ENDING: 803};

// artifact effect function keys
const FUNC = {FLOOR_CLEAR: 900, PICKUP: 901, PLAYER_TURN_END: 902, PLAY_CARD: 903};

// room states
const STATE = {ENTER: 1000, BATTLE: 1001, EVENT_FIN: 1002, GAME_END: 1003, EVENT: 1004};

// battle turns
const TURN = {PLAYER: 1100, ENEMY: 1101};

// event battle types
const BATTLE = {CROWD: 1300, AMBUSH: 1301};

// characters
const CHARACTER = {KNIGHT: 1400};

// enemy transitions
const TRANSITION = {SHIELD: 1500};

// options
const OPTION = {MUSIC: 1600, SCREEN_SHAKE: 1601, STICKY_CARDS: 1602, PERFECT_SCREEN: 1603, PERFECT_SIZE: 1604, FAST_MOVEMENT: 1605, AUTO_END_TURN: 1606, END_TURN_CONFIRM: 1607, MUSIC_TRACK: 1699};

// names of options
const OPTION_NAME = {[OPTION.MUSIC]: "Music", [OPTION.SCREEN_SHAKE]: "Screen shake", [OPTION.STICKY_CARDS]: "Sticky cards", [OPTION.PERFECT_SCREEN]: "Pixel perfect screen", [OPTION.PERFECT_SIZE]: "Pixel perfect size", [OPTION.FAST_MOVEMENT]: "Allow fast movement", [OPTION.AUTO_END_TURN]: "Automatically end turn", [OPTION.END_TURN_CONFIRM]: "End turn confirmation", [OPTION.MUSIC_TRACK]: "Music track"};

// general effects
const EFF = {AURA_BLADE: 1700, BURN: 1701, REINFORCE: 1702, RESILIENCE: 1703, WEAKNESS: 1704, BLAZE: 1705, ATKUP: 1706, DEFUP: 1707, PULSE: 1708};

// card effects
const CARD_EFF = {ONE_USE: 1800, UNIFORM: 1801, UNPLAYABLE: 1802, COST_REDUCTION: 1803, RETENTION: 1804, DESC: 1899};

// enemy effects
const ENEMY_EFF = {COUNTDOWN: 1900, REWIND: 1901, SHROUD: 1902, PLAN_ATTACK: 1903, PLAN_SUMMON: 1904, PLAN_DEFEND: 1905, SCRAP_HEAP: 1906};

// names of effects
const EFF_NAME = {
	// general effects
	[EFF.AURA_BLADE]: "aura blade",
	[EFF.BURN]: "burn",
	[EFF.REINFORCE]: "reinforce",
	[EFF.RESILIENCE]: "resilience",
	[EFF.WEAKNESS]: "weakness",
	[EFF.BLAZE]: "blaze",
	[EFF.ATKUP]: "ATK+",
	[EFF.DEFUP]: "DEF+",
	[EFF.PULSE]: "pulse",
	// card effects
	[CARD_EFF.ONE_USE]: "one use",
	[CARD_EFF.UNIFORM]: "uniform",
	[CARD_EFF.UNPLAYABLE]: "unplayable",
	[CARD_EFF.COST_REDUCTION]: "cost reduction",
	[CARD_EFF.RETENTION]: "retention",
	// enemy effects
	[ENEMY_EFF.COUNTDOWN]: "countdown",
	[ENEMY_EFF.REWIND]: "rewind",
	[ENEMY_EFF.SHROUD]: "shroud",
	[ENEMY_EFF.PLAN_ATTACK]: "plan attack",
	[ENEMY_EFF.PLAN_SUMMON]: "plan summon",
	[ENEMY_EFF.PLAN_DEFEND]: "plan defend",
	[ENEMY_EFF.SCRAP_HEAP]: "scrap heap",
};

// descriptions of having permanent effects
const PERM_EFF_DESC = {
	[ENEMY_EFF.PLAN_ATTACK]: "This has plan attack.",
	[ENEMY_EFF.PLAN_SUMMON]: "This has plan summon.",
	[ENEMY_EFF.PLAN_DEFEND]: "This has plan defend.",
	[ENEMY_EFF.SCRAP_HEAP]: "This is a scrap heap.",
};

// descriptions of effects
const EFF_DESC = {
	// general effects
	[EFF.AURA_BLADE]: "If you have X aura\nblades, when you attack,\nyou deal 5 + X extra\ndamage, then X is\nreduced by 1.",
	[EFF.BURN]: "If something has X burn,\nat the end of its turn,\nit takes X non-combat\ndamage, then X is\nreduced by 1.",
	[EFF.REINFORCE]: "If something has X\nreinforces, at the start\nof its turn, its shield\nis kept, then X is\nreduced by 1.",
	[EFF.RESILIENCE]: "If something has X\nresilience, it takes 25%\nless combat damage,\nrounded up. At the\nstart of its turn, X is\nreduced by 1.",
	[EFF.WEAKNESS]: "If something has X\nweakness, its attack is\nreduced by 25%, rounded\nup. At the end of its\nturn, X is reduced by 1.",
	[EFF.BLAZE]: "If something has X\nblaze, when it attacks,\nit applies 1 burn on\nthe target. At the end\nof its turn, X is\nreduced by 1.",
	[EFF.ATKUP]: "If something has X ATK+,\nits attack is increased\nby 25%, rounded up. At\nthe end of its turn, X\nis reduced by 1.",
	[EFF.DEFUP]: "If something has X DEF+,\nits defense is increased\nby 25%, rounded up. At\nthe end of its turn, X\nis reduced by 1.",
	[EFF.PULSE]: "If something has X\npulse, when it attacks,\nit applies 1 pulse on\nthe target. At the end\nof its turn, X is\nreduced by 2.",
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
	[ENEMY_EFF.SCRAP_HEAP]: "If something is a scrap\nheap, no benefits of any\nkind may be gained from\nits defeat.",
};

for (const key in EFF_DESC) {
	EFF_DESC[key] = color(EFF_DESC[key]);
};

// event log types
const EVENT_LOG = {DAMAGE: 2000};

// game result types
const GAME_RESULT = {DEFEAT: 2100, VICTORY: 2101, SURRENDER: 2102};

// reward types
const REWARD = {GOLD: 2200, CARD: 2201, ARTIFACT: 2202, HEALTH: 2203, PURIFIER: 2204, REFINER: 2205, FINISH: 2206};

// names of rewards
const REWARD_NAME = {[REWARD.GOLD]: "gold", [REWARD.CARD]: "card", [REWARD.ARTIFACT]: "artifact", [REWARD.HEALTH]: "health", [REWARD.PURIFIER]: "purifier", [REWARD.REFINER]: "refiner", [REWARD.FINISH]: "finish"};
