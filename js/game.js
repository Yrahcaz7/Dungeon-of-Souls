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

const VERSION = 2_003_028;

/**
 * Returns the starting global data.
 */
function getStartGlobalData() {
	return {
		options: {
			[OPTION.MUSIC]: true,
			[OPTION.SCREEN_SHAKE]: true,
			[OPTION.STICKY_CARDS]: false,
			[OPTION.PERFECT_SCREEN]: false,
			[OPTION.PERFECT_SIZE]: 1,
			[OPTION.FAST_MOVEMENT]: true,
			[OPTION.AUTO_END_TURN]: false,
			[OPTION.END_TURN_CONFIRM]: true,
		},
		highScore: 0,
		prevGames: [],
		charStage: {
			[CHARACTER.KNIGHT]: 0,
		},
		version: VERSION,
	};
};

/**
 * Returns the starting game data.
 */
function getStartGameData() {
	return {
		character: CHARACTER.KNIGHT,
		difficulty: 0,
		health: 60,
		shield: 0,
		energy: 3,
		floor: 0,
		gold: 0,
		location: [-1],
		rewards: [],
		state: STATE.ENTER,
		turn: -1,
		select: [S.WELCOME, 0],
		prevCard: -1,
		cardSelect: 0,
		kills: {},
		enemies: [],
		enemyNum: -1,
		enemyStage: ANIM.STARTING,
		enemyAtt: [-1, 0, new Card(), false],
		attackEffects: [],
		artifacts: [200, 201],
		cards: [new Card(1000), new Card(1000), new Card(1000), new Card(1000), new Card(2000), new Card(2000), new Card(2000), new Card(2000), new Card(2001), new Card(4000)],
		deck: [],
		deckScroll: 0,
		hand: [],
		discard: [],
		void: [],
		eventLog: {},
		eff: {},
		room: [],
		firstRoom: [],
		map: [],
		traveled: [],
		seed: (() => {
			let arr = (Math.round(Date.now() * (Math.random() + 0.01)) % (16 ** 6 - 1)).toString(16).toUpperCase().split("");
			for (let index = arr.length - 1; index > 0; index--) {
				let rand = Math.floor(Math.random() * (index + 1));
				[arr[index], arr[rand]] = [arr[rand], arr[index]];
			};
			return arr.join("");
		})(),
		version: VERSION,
	};
};

let global = getStartGlobalData();
let game = getStartGameData();
let popups = [];
let notif = [-1, 0, "", 0];
let refinableDeck = [];
let winAnim = 0;

let menuSelect = [MENU.MAIN, 0];
let newSeed = "";
let menuScroll = 0;
let menuArtifactSelect = 0;
let prevGamesSort = [0, true];
let sortedPrevGames = [];

let musicElement;
let musicDuration = 0;

document.addEventListener("DOMContentLoaded", () => {
	musicElement = document.getElementById("music");
});

/**
 * Creates a popup.
 * @param {string} type - the type of the popup.
 * @param {string} description - the description of the popup.
 * @param {string} secondLine - the second line of the popup, if any.
 * @param {function} action - the action to perform when the popup is interacted with.
 */
function createPopup(type, description, secondLine = "", action = null) {
	let oldest = 0;
	for (let index = 0; index <= popups.length && index < 7; index++) {
		if (popups[index]?.length) {
			if (popups[index] && popups[index][2] > popups[oldest][2]) oldest = index;
			continue;
		};
		popups[index] = [type, description, 0, secondLine, action];
		return;
	};
	popups[oldest] = [type, description, 0, secondLine, action];
};

/**
 * Creates the current music popup.
 */
function musicPopup() {
	if (global.options[OPTION.MUSIC]) {
		const track = /^.+\/(.+)\.wav$/.exec(musicElement.src)[1];
		if (track) createPopup("music", track.replace(/_/g, " "));
		else createPopup("music", "music is on");
	} else {
		createPopup("music", "music is off");
	};
};

/**
 * Creates a "go to the map" popup.
 */
function mapPopup() {
	createPopup("go", "go to the map!", "", () => game.select = [S.MAP, -1]);
};

/**
 * Gets the name and duration of the appropriate music track.
 * @returns {[string, number]}
 */
const getMusicTrack = () => {
	const TRACK_DURATION = {
		Ruins_of_Caelum: 48,
		The_Final_Ruins: 43.2,
		Future_Dungeon: 50.4,
		The_Singularity: 48,
	};
	return (() => {
		let name = "";
		if (global.options[OPTION.MUSIC_TRACK] && global.options[OPTION.MUSIC_TRACK] != "default") name = ("" + global.options[OPTION.MUSIC_TRACK]).replace(/\s/g, "_");
		else if (game.floor == 20) name = "The_Singularity";
		else if (get.area() == 1) name = "Future_Dungeon";
		else if (game.floor == 10) name = "The_Final_Ruins";
		else name = "Ruins_of_Caelum";
		return [name, TRACK_DURATION[name] ?? NaN];
	})();
};

/**
 * Changes the music track to the appropriate one.
 */
function changeMusic() {
	const track = getMusicTrack();
	musicElement.src = "music/" + track[0] + ".wav";
	musicDuration = track[1];
	musicPopup();
};

/**
 * Fades out the music, then changes it to the appropriate one.
 */
function fadeMusic() {
	if (!musicElement || musicElement.volume < 1) return;
	let timer = 0;
	let fade = setInterval(() => {
		if (musicElement.volume > 0) {
			musicElement.volume = Math.max(musicElement.volume - 0.0025, 0);
		} else if (timer >= 500) {
			changeMusic();
			musicElement.volume = 1;
			clearInterval(fade);
		};
		timer++;
	}, 5);
};

/**
 * Starts the player's turn.
 * @param {boolean} firstTurn - if true, it is the player's first turn.
 */
function startTurn(firstTurn = false) {
	let toSelect = [S.HAND, 0];
	// end of enemy turn effects
	if (!firstTurn) {
		for (let index = 0; index < game.enemies.length; index++) {
			const enemy = game.enemies[index];
			if (enemy.eff[EFF.BURN]) {
				let damage = enemy.eff[EFF.BURN];
				if (hasArtifact(107)) damage += 3;
				dealDamage(damage, 0, index, false);
				enemy.eff[EFF.BURN]--;
			};
			if (enemy.eff[EFF.WEAKNESS]) enemy.eff[EFF.WEAKNESS]--;
			if (enemy.eff[EFF.BLAZE]) enemy.eff[EFF.BLAZE]--;
			if (enemy.eff[EFF.ATKUP]) enemy.eff[EFF.ATKUP]--;
			if (enemy.eff[EFF.DEFUP]) enemy.eff[EFF.DEFUP]--;
			if (enemy.eff[EFF.PULSE]) enemy.eff[EFF.PULSE] = Math.max(enemy.eff[EFF.PULSE] - 2, 0);
			if (enemy.eff[EFF.HYPERSPEED]) enemy.eff[EFF.HYPERSPEED]--;
			if (enemy.eff[ENEMY_EFF.SHROUD]) {
				enemy.eff[ENEMY_EFF.SHROUD]--;
				if (!enemy.eff[ENEMY_EFF.SHROUD] && !hasArtifact(204)) {
					toSelect = [S.CONF_PEARL, 0];
				};
			};
		};
	};
	// start of player turn effects
	drawCards(get.handSize());
	game.turn = TURN.PLAYER;
	if (game.eff[EFF.REINFORCE]) game.eff[EFF.REINFORCE]--;
	else game.shield = 0;
	if (game.eff[EFF.RESILIENCE]) game.eff[EFF.RESILIENCE]--;
	if (game.eff[EFF.FIREPROOF] && game.eff[EFF.BURN]) game.eff[EFF.BURN] = Math.max(game.eff[EFF.BURN] - game.eff[EFF.FIREPROOF], 0);
	game.energy = get.maxEnergy();
	game.select = toSelect;
	if (playerAnim[1] !== I.player.idle && playerAnim[1] !== I.player.hit) startAnim.player(I.player.idle);
};

/**
 * Ends the player's turn.
 */
function endTurn() {
	if (game.state === STATE.BATTLE) {
		// end of your turn effects
		if (game.hand.length) discardHand();
		cardAnim = [];
		notif = [-1, 0, "", 0];
		if (game.eff[EFF.BURN]) {
			takeDamage(game.eff[EFF.BURN], false);
			game.eff[EFF.BURN]--;
		};
		if (game.eff[EFF.WEAKNESS]) game.eff[EFF.WEAKNESS]--;
		if (game.eff[EFF.BLAZE]) game.eff[EFF.BLAZE]--;
		if (game.eff[EFF.ATKUP]) game.eff[EFF.ATKUP]--;
		if (game.eff[EFF.DEFUP]) game.eff[EFF.DEFUP]--;
		if (game.eff[EFF.PULSE]) game.eff[EFF.PULSE] = Math.max(game.eff[EFF.PULSE] - 2, 0);
		if (game.eff[EFF.HYPERSPEED]) game.eff[EFF.HYPERSPEED]--;
		// activate artifacts
		activateArtifacts(FUNC.PLAYER_TURN_END);
		// start of enemy turn effects
		game.turn = TURN.ENEMY;
		game.enemyNum = -1;
		for (let index = 0; index < game.enemies.length; index++) {
			// effects
			const enemy = game.enemies[index];
			let prevShield = enemy.shield;
			if (enemy.eff[EFF.REINFORCE]) enemy.eff[EFF.REINFORCE]--;
			else enemy.shield = 0;
			if (enemy.eff[EFF.RESILIENCE]) enemy.eff[EFF.RESILIENCE]--;
			if (enemy.eff[EFF.FIREPROOF] && enemy.eff[EFF.BURN]) enemy.eff[EFF.BURN] = Math.max(enemy.eff[EFF.BURN] - enemy.eff[EFF.FIREPROOF], 0);
			// transitions
			startEnemyTransition(index, prevShield);
		};
	};
};

/**
 * Ends the player's turn (after a confirmation if the player can still play cards).
 */
function endTurnConfirm() {
	if (global.options[OPTION.END_TURN_CONFIRM] && areAnyCardsPlayable()) game.select = [S.CONF_END, 0];
	else endTurn();
	actionTimer = 2;
};

/**
 * Does stuff after the player plays a card and its effect activates.
 */
function postCardActivation() {
	if (game.turn === TURN.PLAYER) {
		// finish attack enemy
		if (game.enemyAtt[3]) {
			const attCard = CARDS[game.enemyAtt[2].id];
			if (attCard.target !== false && attCard.damage) {
				if (CARDS[game.enemyAtt[2].id].keywords.includes(CARD_EFF.UNIFORM)) dealDamage(game.enemyAtt[2].getAttr("damage"), 0.5);
				else dealDamage(game.enemyAtt[2].getAttr("damage"));
			};
			if (attCard.attack instanceof Function) attCard.attack(game.enemyAtt[2].level);
			game.enemyAtt = [-1, -1, new Card(), false];
			game.attackEffects = [];
			updateData();
		};
		// auto end turn
		if (global.options[OPTION.AUTO_END_TURN] && !areAnyCardsPlayable()) endTurn();
	};
};

/**
 * Enters the battle.
 */
function enterBattle() {
	enemyAnim.prime = [0, 0, 0, 0, 0, 0];
	game.state = STATE.BATTLE;
	startTurn(true);
};

/**
 * Ends the battle if there are no enemies remaining.
 */
function endBattle() {
	if (game.state === STATE.BATTLE && !game.enemies.length) {
		// normal stuff
		discardHand(true);
		cardAnim = [];
		notif = [-1, 0, "", 0];
		game.select = [S.REWARDS, 0];
		game.state = STATE.EVENT_FIN;
		game.turn = -1;
		game.enemyNum = -1;
		// activate artifacts
		activateArtifacts(FUNC.FLOOR_CLEAR);
		// set rewards
		game.rewards = [];
		if (game.room[4] > 0) game.rewards.push([REWARD.GOLD, game.room[4]]);
		if (get.cardRewardChoices() > 0) game.rewards.push([REWARD.CARD]);
		if ((game.room[0] === ROOM.PRIME || game.room[0] === ROOM.BOSS) && game.room[6] instanceof Array) {
			for (let index = 0; index < game.room[6].length; index++) {
				if (hasArtifact(game.room[6][index])) {
					game.room[6][index] = randomArtifact(game.artifacts.concat(game.room[6]));
				};
			};
			game.rewards.push([REWARD.ARTIFACT]);
		};
		if (game.room[0] === ROOM.BOSS) {
			game.rewards.push([REWARD.REFINER]);
		};
		game.rewards.push([REWARD.FINISH]);
	};
};

/**
 * Loads the room that is being entered.
 */
function loadRoom() {
	if (game.state === STATE.ENTER && !inMenu()) {
		// remove directive popups
		for (let index = 0; index < popups.length; index++) {
			if (popups[index][0] === "go") popups[index] = [];
		};
		// reset things
		game.shield = 0;
		game.energy = get.maxEnergy();
		game.rewards = [];
		game.enemies = [];
		game.hand = [];
		game.deck = shuffle(game.cards.map(obj => new Card(obj.id, obj.level)));
		game.discard = [];
		game.void = [];
		game.eff = {};
		// enter room
		const type = (game.location[0] === -1 ? ROOM.BATTLE : game.map[game.location[0]][game.location[1]][0]);
		if (type === ROOM.BATTLE || type === ROOM.PRIME || type === ROOM.BOSS) {
			if (game.location[0] === -1) game.room = game.firstRoom;
			else game.traveled.push(game.location[1]);
			for (let index = 0; index < game.room[3].length; index++) {
				const enemy = game.room[3][index];
				if (enemy instanceof Array) {
					game.enemies.push(new Enemy(+enemy[0], +enemy[1]));
				} else {
					game.enemies.push(new Enemy(+enemy));
				};
			};
			if (type === ROOM.BOSS || (game.floor > 10 && game.floor % 10 == 1)) fadeMusic();
			enterBattle();
		} else if (type === ROOM.TREASURE) {
			game.traveled.push(game.location[1]);
			game.select = [S.REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [];
			if (game.room[4] > 0) game.rewards.push([REWARD.GOLD, game.room[4]]);
			if (get.cardRewardChoices() > 0) game.rewards.push([REWARD.CARD]);
			game.rewards.push([REWARD.FINISH]);
			activateArtifacts(FUNC.FLOOR_CLEAR);
		} else if (type === ROOM.ORB) {
			game.traveled.push(game.location[1]);
			game.select = [S.REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [[REWARD.HEALTH, Math.floor(get.maxHealth() * 0.5)], [REWARD.PURIFIER]];
			if (get.area() >= 1) game.rewards.push([REWARD.REFINER]);
			game.rewards.push([REWARD.FINISH]);
			activateArtifacts(FUNC.FLOOR_CLEAR);
		} else if (type === ROOM.EVENT) {
			game.traveled.push(game.location[1]);
			game.select = [S.EVENT, -1];
			game.state = STATE.EVENT;
			game.rewards = [];
			game.turn = 10000;
		};
	};
};

/**
 * Handles the gameplay.
 */
function manageGameplay() {
	// update data
	updateData();
	// enemy actions
	if (game.turn === TURN.ENEMY || game.enemyNum >= 0) {
		if (game.enemyNum == -1) startAnim.enemy();
		if (game.enemyNum < game.enemies.length) {
			if (game.enemyStage === ANIM.ENDING) game.enemies[game.enemyNum].finishAction();
			else if (game.enemyStage === ANIM.MIDDLE) game.enemies[game.enemyNum].middleAction();
			else if (game.enemyStage === ANIM.STARTING) game.enemies[game.enemyNum].startAction();
		};
	};
};

/**
 * Handles the visuals of the game.
 */
function updateVisuals() {
	// bugs
	if (!(ctx instanceof CanvasRenderingContext2D)) return;
	// clear
	clearCanvas();
	// update data
	updateData();
	// visuals
	graphics.backgrounds();
	if (inMenu()) {
		graphics.middleLayer();
		draw.image(I.title, (400 - I.title.width) / 2, 0);
		draw.lore(390, 51, "Version " + get.versionDisplay(), {"color": (get.area() == 1 ? "#fcc" : "#f00"), "text-align": DIR.LEFT, "text-small": true});
		draw.lore(1, 1, "HIGH SCORE: " + global.highScore + " points", {"color": "#fff", "text-small": true});
		if (hasArtifact(202) && game.floor == 10) draw.lore(200 - 2, 53, "Secret Act: When the Hands Align", {"color": "#f44", "text-align": DIR.CENTER});
		else if (get.area() == 1) draw.lore(200 - 2, 53, "Act 2: The Color of the Soul", {"color": "#fcc", "text-align": DIR.CENTER});
		else draw.lore(200 - 2, 53, "Act 1: The Hands of Time", {"color": "#f44", "text-align": DIR.CENTER});
		graphics.menu(menuSelect[0] === MENU.MAIN);
		if (game.select[0] === S.WELCOME) {
			draw.box(80 + 2, 83, 240 - 4, 34);
			if (game.difficulty === 0) draw.lore(200 - 1, 84, "Hello there! Welcome to my game!<s>Use the arrow keys or WASD keys to select things.\nPress enter or the space bar to perform an action.\nFor information on how to play, go to the \"?\" at the top-right of the screen.\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": DIR.CENTER});
			else draw.lore(200 - 1, 84, "Hello there! Welcome to <#f00>hard mode!</#f00><s>In hard mode, enemies start much stronger from the beginning.\nAnd by much stronger, I mean <#f00>MUCH STRONGER</#f00>.\nOtherwise, it is the same as easy mode... or is it?\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": DIR.CENTER});
		} else if (menuSelect[0] === MENU.NEW_RUN || menuSelect[0] === MENU.DIFFICULTY || menuSelect[0] === MENU.CHANGE_SEED || menuSelect[0] === MENU.ENTER_SEED) {
			graphics.conf(menuSelect[0] !== MENU.ENTER_SEED);
		} else if (menuSelect[0] === MENU.PREV_GAMES || menuSelect[0] === MENU.PREV_GAME_INFO || menuSelect[0] === MENU.PREV_GAME_SORT) {
			graphics.prevGames(menuSelect[0] === MENU.PREV_GAMES);
		};
		if (menuSelect[0] === MENU.ENTER_SEED) {
			graphics.seedInput();
		} else if (menuSelect[0] === MENU.PREV_GAME_INFO) {
			if (menuSelect[1] % 3 === 0) graphics.deck();
			else if (menuSelect[1] % 3 == 1) graphics.prevGameArtifacts();
			else if (menuSelect[1] % 3 == 2) graphics.prevGameKills();
		} else if (menuSelect[0] === MENU.PREV_GAME_SORT) {
			graphics.prevGameSort();
		}
		if (hasArtifact(202) && game.floor == 10 && transition < 100) transition++;
		return;
	};
	if (!hidden()) {
		graphics.player();
		graphics.enemy();
		graphics.effect();
	};
	graphics.middleLayer();
	if (game.select[0] !== S.EVENT) {
		graphics.foregrounds();
	};
	if (!hidden()) {
		if (game.select[0] === SS.SELECT_HAND) graphics.handSelect();
		else graphics.hand();
	};
	if (game.select[0] === S.MAP) {
		graphics.map();
	} else if (game.select[0] === S.EVENT) {
		graphics.event();
	} else if (game.select[0] === S.REWARDS) {
		graphics.rewards();
	} else if (game.select[0] === S.CARD_REWARD) {
		graphics.cardRewards();
	} else if (game.select[0] === S.ARTIFACT_REWARD) {
		graphics.artifactRewards();
	} else if (game.select[0] === S.HELP && game.select[1]) {
		graphics.info();
	} else if (game.select[0] === S.OPTIONS && game.select[1]) {
		graphics.options();
	} else if ((game.select[0] === S.DECK || game.select[0] === S.DISCARD || game.select[0] === S.VOID) && game.select[1]) {
		if (game.select[2] && (game.select[2][0] === S.MAP || game.select[2][0] === S.CARDS)) graphics.map(false);
		graphics.deck();
	} else if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY || game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) {
		graphics.rewards(false);
		graphics.deck(game.select[0] === S.PURIFIER || game.select[0] === S.REFINER);
	} else if (game.select[0] === S.CARDS) {
		if ((!game.select[1] && !game.select[2]) || (game.select[2] && game.select[2][0] === S.MAP)) graphics.map(false);
		graphics.deck();
	};
	if (!inDeck()) {
		graphics.target();
	};
	if (game.select[0] === S.CONF_END || game.select[0] === S.CONF_PURIFY || game.select[0] === S.CONF_REFINE || game.select[0] === S.CONF_PEARL) {
		graphics.conf();
	} else if (game.select[0] === S.CONF_EXIT) {
		graphics.rewards(false);
		graphics.conf();
	} else if (game.select[0] === S.CONF_SURRENDER) {
		graphics.options(false);
		graphics.conf();
	} else if (game.select[0] === S.CONF_HAND_ALIGN) {
		graphics.map(false);
		graphics.conf();
	};
	graphics.popups();
	if (game.select[0] === S.GAME_OVER || game.select[0] === S.GAME_WON) {
		graphics.gameEnd();
	};
	if (hasArtifact(202) && game.floor == 10 && transition < 100) transition++;
};

const GAME_LOOP = setInterval(() => {
	if (!loaded) return;
	// gameplay
	if (!inMenu()) manageGameplay();
	// selection
	selection();
	// visuals
	updateVisuals();
	// save
	save();
}, 100);

const MUSIC_LOOP = setInterval(() => {
	if (global.options[OPTION.MUSIC] && musicElement?.src) {
		const time = +musicElement.currentTime;
		if (time === 0 && !inMenu()) {
			musicElement.play();
		} else if (time + 0.005 > musicDuration) {
			musicElement.currentTime = 0;
		};
	};
}, 5);
