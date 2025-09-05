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
	END_TURN: 306, // N does not indicate anything.
	CONF_END_TURN: 307, // N indicates which button is selected (1 for the back button, 0 for the confirm button).
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
const PREV_GAMES_SORT_NAMES = ["Run number", "Result type", "Difficulty", "Highest floor", "Remaining health", "Remaining gold", "Total score", "Seed string", "Number of cards", "Number of artifacts", "Number of enemies killed"];

// special selects from card effects - used in `game.select` as [S, N] or [S, N, [S_PREV, N_PREV]]
// N is an integer (which defaults to 0) and is defined differently for each following S:
const SS = {
	SELECT_HAND: 1200, // N is the index of the selected card in hand if it exists; otherwise, N indicates that the back button is selected.
};

// directions
const DIR = {UP: 501, LEFT: 502, CENTER: 503, RIGHT: 504, DOWN: 505};

// enemy types
const SLIME = {BIG: 600, SMALL: 601, PRIME: 602, STICKY: 608}, FRAGMENT = 603, SENTRY = {BIG: 604, SMALL: 605, PRIME: 606, FLAMING: 609}, SINGULARITY = 607;

// enemy type order
const ENEMY_ORDER = [SLIME.SMALL, SLIME.BIG, SLIME.PRIME, SLIME.STICKY, FRAGMENT, SENTRY.SMALL, SENTRY.BIG, SENTRY.PRIME, SENTRY.FLAMING, SINGULARITY];

// names of enemy types
const ENEMY_NAME = {
	[SLIME.BIG]: "big slime",
	[SLIME.SMALL]: "small slime",
	[SLIME.PRIME]: "prime slime",
	[SLIME.STICKY]: "sticky slime",
	[FRAGMENT]: "the fragment of time",
	[SENTRY.BIG]: "big sentry",
	[SENTRY.SMALL]: "small sentry",
	[SENTRY.PRIME]: "prime sentry",
	[SENTRY.FLAMING]: "flaming sentry",
	[SINGULARITY]: "the singularity",
};

// plural names of enemy types
const PLURAL_ENEMY_NAME = {
	[SLIME.BIG]: "big slimes",
	[SLIME.SMALL]: "small slimes",
	[SLIME.PRIME]: "prime slimes",
	[SLIME.STICKY]: "sticky slimes",
	[SENTRY.BIG]: "big sentries",
	[SENTRY.SMALL]: "small sentries",
	[SENTRY.PRIME]: "prime sentries",
	[SENTRY.FLAMING]: "flaming sentries",
};

// score worth of enemy types
const ENEMY_WORTH = {
	[SLIME.BIG]: 100,
	[SLIME.SMALL]: 50,
	[SLIME.PRIME]: 500,
	[SLIME.STICKY]: 150,
	[FRAGMENT]: 1000,
	[SENTRY.BIG]: 150,
	[SENTRY.SMALL]: 75,
	[SENTRY.PRIME]: 750,
	[SENTRY.FLAMING]: 225,
	[SINGULARITY]: 2000,
};

// enemy intents
const INTENT = {ATTACK: 700, DEFEND: 701, BUFF: 702, SUMMON: 703, RITUAL: 704};

// minimal descriptions of enemy intents
const MIN_INTENT_DESC = {
	[INTENT.ATTACK]: "<#f44>attack</#f44> you",
	[INTENT.DEFEND]: "<#48f>defend</#48f> itself",
	[INTENT.BUFF]: "buff itself",
	[INTENT.SUMMON]: "summon a minion",
};

// full descriptions of enemy intents
const FULL_INTENT_DESC = {
	[INTENT.ATTACK]: "This enemy intends to <#f44>attack</#f44>\nyou on its next turn.",
	[INTENT.DEFEND]: "This enemy intends to <#48f>defend</#48f>\nitself on its next turn.",
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

// names of characters
const CHARACTER_NAME = {
	[CHARACTER.KNIGHT]: ["the forgotten one", "the true knight"],
};

// enemy transitions
const TRANSITION = {SHIELD: 1500};

// options
const OPTION = {MUSIC: 1600, SCREEN_SHAKE: 1601, STICKY_CARDS: 1602, PERFECT_SCREEN: 1603, PERFECT_SIZE: 1604, FAST_MOVEMENT: 1605, AUTO_END_TURN: 1606, END_TURN_CONFIRM: 1607, MUSIC_TRACK: 1699};

// names of options
const OPTION_NAME = {[OPTION.MUSIC]: "Music", [OPTION.SCREEN_SHAKE]: "Screen shake", [OPTION.STICKY_CARDS]: "Sticky cards", [OPTION.PERFECT_SCREEN]: "Pixel perfect screen", [OPTION.PERFECT_SIZE]: "Pixel perfect size", [OPTION.FAST_MOVEMENT]: "Allow fast movement", [OPTION.AUTO_END_TURN]: "Automatically end turn", [OPTION.END_TURN_CONFIRM]: "End turn confirmation", [OPTION.MUSIC_TRACK]: "Music track"};

// general effects
const EFF = {AURA_BLADE: 1700, BURN: 1701, REINFORCE: 1702, RESILIENCE: 1703, WEAKNESS: 1704, BLAZE: 1705, ATKUP: 1706, DEFUP: 1707, PULSE: 1708, HYPERSPEED: 1709, FIREPROOF: 1710};

// card effects
const CARD_EFF = {ONE_USE: 1800, UNIFORM: 1801, UNPLAYABLE: 1802, COST_REDUCTION: 1803, RETENTION: 1804, TEMP: 1898, DESC: 1899};

// enemy effects
const ENEMY_EFF = {COUNTDOWN: 1900, REWIND: 1901, SHROUD: 1902, PLAN_ATTACK: 1903, PLAN_SUMMON: 1904, PLAN_DEFEND: 1905, SCRAP_HEAP: 1906, STICKY: 1907};

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
	[EFF.HYPERSPEED]: "hyperspeed",
	[EFF.FIREPROOF]: "fireproof",
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
	[ENEMY_EFF.STICKY]: "sticky",
};

// "has" text for permanent effects
const PERM_EFF_DESC = {
	[ENEMY_EFF.PLAN_ATTACK]: "has",
	[ENEMY_EFF.PLAN_SUMMON]: "has",
	[ENEMY_EFF.PLAN_DEFEND]: "has",
	[ENEMY_EFF.SCRAP_HEAP]: "is a",
	[ENEMY_EFF.STICKY]: "is",
};

// descriptions of effects
const EFF_DESC = {
	// general effects
	[EFF.AURA_BLADE]: "On attack,\ndeal [5 + count] extra\ndamage, then count\ndecreases by 1.",
	[EFF.BURN]: "On end of turn,\ntake [count] non-combat\ndamage, then count\ndecreases by 1.",
	[EFF.REINFORCE]: "On start of\nturn, shield is kept,\nthen count decreases by\n1.",
	[EFF.RESILIENCE]: "Take 25%\nless combat damage,\nrounded up.\nCount decreases by 1 at\nstart of turn.",
	[EFF.WEAKNESS]: "Attack is 25%\nless, rounded up.\nCount decreases by 1 at\nend of turn.",
	[EFF.BLAZE]: "On attack, apply\n1 burn on the target.\nCount decreases by 1 at\nend of turn.",
	[EFF.ATKUP]: "Attack is 25%\ngreater, rounded up.\nCount decreases by 1 at\nend of turn.",
	[EFF.DEFUP]: "Defense is 25%\ngreater, rounded up.\nCount decreases by 1 at\nend of turn.",
	[EFF.PULSE]: "On attack, apply\n1 pulse on the target.\nCount decreases by 2 at\nend of turn.",
	[EFF.HYPERSPEED]: "[On attack]\neffects that do not\ndecrease status counts\ntrigger an additional\ntime.\nCount decreases by 1 at\nend of turn.",
	[EFF.FIREPROOF]: "On start of\nturn, decrease burn\ncount by [count].",
	// card effects
	[CARD_EFF.ONE_USE]: "When played,\nthe card is sent to the\nvoid. Cards in the void\nstay there until the end\nof the battle.",
	[CARD_EFF.RETENTION]: "On end of\nturn, the card is not\ndiscarded, then count\ndecreases by 1.",
	[CARD_EFF.UNIFORM]: "Extra damage\nand extra shield have\nhalf the effect on the\ncard, rounded down.",
	[CARD_EFF.TEMP]: "This card was added due\nto an effect; it will\nnot stay in your deck\nafter this battle.",
	[CARD_EFF.DESC]: "After a card leaves\nyour hand, it loses all\nof its applied effects.",
	// enemy effects
	[ENEMY_EFF.COUNTDOWN]: "On end of\nturn, intent is set to\nwhat it was on the\n[count]th turn, then\ncount decreases by 1.",
	[ENEMY_EFF.REWIND]: "Is 20% stronger\nfor each count, rounded\ndown. If this has 0\ncountdown and 0 health,\ngain 1 count, then all\nentities heal fully and\nthe countdown begins.",
	[ENEMY_EFF.SHROUD]: "Intent is not\nvisible.\nCount decreases by 1 at\nend of turn.",
	[ENEMY_EFF.PLAN_ATTACK]: "If the\nplayer has enough shield\nto block 100% of attack,\ngain 2 ATK+ and make a\nnew plan. If this has\nshield and intends to\ndefend, change intent to\nattack and make a new\nplan.",
	[ENEMY_EFF.PLAN_SUMMON]: "If the\nplayer has enough shield\nto block 100% of attack\nor this has shield and\nintends to defend,\nchange intent to summon\nand make a new plan.",
	[ENEMY_EFF.PLAN_DEFEND]: "If this has\nshield and intends to\ndefend, gain 2 DEF+ and\nmake a new plan. If the\nplayer has enough shield\nto block 100% of attack,\nchange intent to defense\nand make a new plan.",
	[ENEMY_EFF.SCRAP_HEAP]: "On death,\nno effects trigger.",
	[ENEMY_EFF.STICKY]: "On attack, add\n2 copies of Sticky Goo\nto the target's deck.",
};

// numeric desc node types
const DESC = {DAMAGE: 2300, SHIELD: 2301};

// names of desc node types
const DESC_NAME = {[DESC.DAMAGE]: "damage", [DESC.SHIELD]: "shield"};

// effects and phrases associated with colors
const COLOR = {
	"#f44": ["max health", "health", "non-combat damage", "combat damage", "extra damage", "damage", "attacks", "attack", DESC.DAMAGE, EFF.ATKUP, ENEMY_EFF.COUNTDOWN, ENEMY_EFF.SCRAP_HEAP], // red
	"#48f": ["extra shield", "shield", "defend", "defense", "aura blades", DESC.SHIELD, EFF.AURA_BLADE, EFF.DEFUP], // blue
	"#e70": [EFF.BURN, EFF.BLAZE], // orange
	"#862": [EFF.REINFORCE], // brown
	"#665": [EFF.RESILIENCE], // yellowish gray
	"#655": [EFF.WEAKNESS], // reddish gray
	"#e50": [EFF.PULSE], // reddish orange
	"#00f": [EFF.HYPERSPEED], // dark blue
	"#864": [EFF.FIREPROOF], // orangish gray
	"#666": [CARD_EFF.ONE_USE, CARD_EFF.UNIFORM, CARD_EFF.UNPLAYABLE, CARD_EFF.COST_REDUCTION, CARD_EFF.RETENTION], // gray
	"#a80": ["rewinds", ENEMY_EFF.REWIND], // yellow
	"#556": [ENEMY_EFF.SHROUD], // bluish gray
	"#900": [ENEMY_EFF.PLAN_ATTACK], // dark red
	"#070": [ENEMY_EFF.PLAN_SUMMON], // dark green
	"#00a": [ENEMY_EFF.PLAN_DEFEND], // dark blue
	"#080": ["sticky goo", ENEMY_EFF.STICKY], // dark green
};

/**
 * Returns a string formatted with color tags.
 * @param {string} text - the string to color.
 */
const colorText = (() => {
	const COLOR_REGEX = {};
	for (const color in COLOR) {
		COLOR_REGEX[color] = new RegExp("(" + COLOR[color].filter(key => !DESC_NAME[key]).map(key => (EFF_NAME[key] || key).replace(" ", "\\s").replace("+", "\\+")).join("|") + ")", "gi");
	};
	return (text = "") => {
		for (const color in COLOR_REGEX) {
			text = text.replace(COLOR_REGEX[color], "<" + color + ">$1</" + color + ">");
		};
		text = text.replace(/(magic)(\stype)/gi, "<#f0f>$1</#f0f>$2");
		text = text.replace(/(\[decay\]|decay)/gi, "<#80f>$1</#80f>");
		return text;
	};
})();

// colors of effects
const EFF_COLOR = {};

for (const color in COLOR) {
	COLOR[color].forEach(key => {
		if (DESC_NAME[key] || EFF_NAME[key]) EFF_COLOR[key] = color;
	});
};

for (const key in EFF_DESC) {
	const num = +key;
	if (EFF_NAME[num]) {
		if (EFF_COLOR[num]) {
			EFF_DESC[num] = "<" + EFF_COLOR[num] + ">" + EFF_NAME[num].at(0).toUpperCase() + EFF_NAME[num].slice(1) + "</" + EFF_COLOR[num] + ">: " + colorText(EFF_DESC[num]);
		} else {
			EFF_DESC[num] = EFF_NAME[num].at(0).toUpperCase() + EFF_NAME[num].slice(1) + ": " + colorText(EFF_DESC[num]);
		};
	};
};

// event log types
const EVENT_LOG = {DAMAGE: 2000};

// game result types
const GAME_RESULT = {DEFEAT: 2100, VICTORY: 2101, SURRENDER: 2102};

// reward types
const REWARD = {GOLD: 2200, CARD: 2201, ARTIFACT: 2202, HEALTH: 2203, PURIFIER: 2204, REFINER: 2205, FINISH: 2206};

// names of rewards
const REWARD_NAME = {[REWARD.GOLD]: "gold", [REWARD.CARD]: "card", [REWARD.ARTIFACT]: "artifact", [REWARD.HEALTH]: "health", [REWARD.PURIFIER]: "purifier", [REWARD.REFINER]: "refiner", [REWARD.FINISH]: "finish"};
