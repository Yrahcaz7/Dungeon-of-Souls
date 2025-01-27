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

let global = {
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
	version: 2_002_004,
}, game = {
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
	enemyStage: -1,
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
	seed: randomize((Math.round(Date.now() * (Math.random() + 0.01)) % (16 ** 6 - 1)).toString(16).toUpperCase()),
	version: global.version,
}, popups = [], notif = [-1, 0, "", 0], menuSelect = [MENU.MAIN, 0], refinableDeck = [], winAnim = 0;

/**
 * Checks if there is any active popups.
 */
function hasPopups() {
	for (let index = 0; index < popups.length; index++) {
		if (popups[index].length) return true;
	};
	return false;
};

/**
 * Creates a popup.
 * @param {string} type - the type of the popup.
 * @param {string} description - the description of the popup.
 * @param {string} secondLine - the second line of the popup, if any.
 */
function createPopup(type, description, secondLine = "") {
	let oldest = 0;
	for (let index = 0; index <= popups.length && index < 7; index++) {
		if (popups[index]?.length) {
			if (popups[index] && popups[index][2] > popups[oldest][2]) oldest = index;
			continue;
		};
		popups[index] = [type, description, 0, secondLine];
		return;
	};
	popups[oldest] = [type, description, 0, secondLine];
};

/**
 * Creates the current music popup.
 */
function musicPopup() {
	let src = "" + document.getElementById("music").src;
	if (!global.options[OPTION.MUSIC]) {
		createPopup("music", "music is off");
	} else if (/Ruins_of_Caelum/.test(src)) {
		createPopup("music", "Ruins of Caelum");
	} else if (/The_Final_Ruins/.test(src)) {
		createPopup("music", "The Final Ruins");
	} else if (/Future_Dungeon/.test(src)) {
		createPopup("music", "Future Dungeon");
	};
};

/**
 * Creates a "go to the map" popup.
 */
function mapPopup() {
	createPopup("go", "go to the map!");
};

/**
 * Changes the music track to the appropriate one.
 */
function changeMusic() {
	if (global.options[OPTION.MUSIC_TRACK] == "Future Dungeon") document.getElementById("music").src = "music/Future_Dungeon.wav";
	else if (global.options[OPTION.MUSIC_TRACK] == "The Final Ruins") document.getElementById("music").src = "music/The_Final_Ruins.wav";
	else if (global.options[OPTION.MUSIC_TRACK] == "Ruins of Caelum") document.getElementById("music").src = "music/Ruins_of_Caelum.wav";
	else if (get.area() == 1) document.getElementById("music").src = "music/Future_Dungeon.wav";
	else if (game.floor == 10) document.getElementById("music").src = "music/The_Final_Ruins.wav";
	else document.getElementById("music").src = "music/Ruins_of_Caelum.wav";
	musicPopup();
};

/**
 * Fades out the music, then changes it.
 */
function fadeMusic() {
	if (!document.getElementById("music") || document.getElementById("music").volume < 1) return;
	let timer = 0;
	let fade = setInterval(() => {
		if (document.getElementById("music").volume > 0) {
			document.getElementById("music").volume = Math.max(document.getElementById("music").volume - 0.0025, 0);
		} else if (timer >= 500) {
			changeMusic();
			document.getElementById("music").volume = 1;
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
	let toSelect = [];
	// end of enemy turn effects
	if (!firstTurn) {
		for (let index = 0; index < game.enemies.length; index++) {
			if (game.enemies[index].eff[EFF.BURN]) {
				let damage = game.enemies[index].eff[EFF.BURN];
				if (hasArtifact(107)) damage += 3;
				dealDamage(damage, 0, index, false);
				game.enemies[index].eff[EFF.BURN]--;
			};
			if (game.enemies[index].eff[EFF.WEAKNESS]) game.enemies[index].eff[EFF.WEAKNESS]--;
			if (game.enemies[index].eff[EFF.BLAZE]) game.enemies[index].eff[EFF.BLAZE]--;
			if (game.enemies[index].eff[EFF.ATKUP]) game.enemies[index].eff[EFF.ATKUP]--;
			if (game.enemies[index].eff[EFF.DEFUP]) game.enemies[index].eff[EFF.DEFUP]--;
			if (game.enemies[index].eff[ENEMY_EFF.SHROUD]) {
				game.enemies[index].eff[ENEMY_EFF.SHROUD]--;
				if (!game.enemies[index].eff[ENEMY_EFF.SHROUD] && !hasArtifact(204)) {
					toSelect = [S.CONF_PEARL, 0];
				};
			};
		};
	};
	// start of your turn effects
	drawCards(get.handSize());
	game.turn = TURN.PLAYER;
	if (game.eff[EFF.REINFORCE]) game.eff[EFF.REINFORCE]--;
	else game.shield = 0;
	if (game.eff[EFF.RESILIENCE]) game.eff[EFF.RESILIENCE]--;
	game.energy = get.maxEnergy();
	if (toSelect.length) game.select = toSelect;
	else game.select = [S.HAND, 0];
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
		// activate artifacts
		activateArtifacts(FUNC.PLAYER_TURN_END);
		// start of enemy turn effects
		game.turn = TURN.ENEMY;
		game.enemyNum = -1;
		for (let index = 0; index < game.enemies.length; index++) {
			// effects
			let prevShield = game.enemies[index].shield;
			if (game.enemies[index].eff[EFF.REINFORCE]) game.enemies[index].eff[EFF.REINFORCE]--;
			else game.enemies[index].shield = 0;
			if (game.enemies[index].eff[EFF.RESILIENCE]) game.enemies[index].eff[EFF.RESILIENCE]--;
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
			if (typeof attCard.attack == "function") attCard.attack(game.enemyAtt[2].level);
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
	game.state = STATE.BATTLE;
	startTurn(true);
};

/**
 * Handles the enemies' turn.
 */
function enemyTurn() {
	if (game.enemyNum == -1) {
		game.enemyNum = 0;
	};
	if (game.enemyNum < game.enemies.length) {
		if (game.enemyStage === ANIM.ENDING) game.enemies[game.enemyNum].finishAction();
		else if (game.enemyStage === ANIM.MIDDLE) game.enemies[game.enemyNum].middleAction();
		else if (game.enemyStage !== ANIM.PENDING) game.enemies[game.enemyNum].startAction();
	};
};

/**
 * Ends the battle if there are no enemies remaining.
 */
function endBattle() {
	if (game.state === STATE.BATTLE && !game.enemies.length) {
		// normal stuff
		if (game.hand.length) discardHand(true);
		cardAnim = [];
		notif = [-1, 0, "", 0];
		game.select = [S.REWARDS, 0];
		game.state = STATE.EVENT_FIN;
		game.turn = -1;
		game.enemyNum = -1;
		game.enemyStage = -1;
		// activate artifacts
		activateArtifacts(FUNC.FLOOR_CLEAR);
		// set rewards
		game.rewards = [];
		if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
		if (get.cardRewardChoices() > 0) game.rewards.push("1 card");
		if (game.room[0] === ROOM.PRIME || game.room[0] === ROOM.BOSS) {
			if (game.room[6]) {
				for (let index = 0; index < game.room[6].length; index++) {
					if (hasArtifact(game.room[6][index])) {
						game.room[6][index] = randomArtifact(game.artifacts.concat(game.room[6]));
					};
				};
				game.rewards.push("1 artifact");
			};
		};
		if (game.room[0] === ROOM.BOSS) game.rewards.push("1 refiner");
		game.rewards.push("finish");
	};
};

/**
 * Loads the room that is being entered.
 */
function loadRoom() {
	if (game.state === STATE.ENTER) {
		// reset things
		game.shield = 0;
		game.energy = get.maxEnergy();
		game.rewards = [];
		game.enemies = [];
		game.hand = [];
		game.deck = shuffle(game.cards.map(obj => Card.classify(obj)));
		game.discard = [];
		game.void = [];
		game.eff = {};
		// enter room
		const type = (game.location == -1 ? ROOM.BATTLE : game.map[game.location[0]][game.location[1]][0]);
		if (type === ROOM.BATTLE || type === ROOM.PRIME || type === ROOM.BOSS) {
			primeAnim = 0;
			if (game.location == -1) game.room = game.firstRoom;
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
			game.map[game.location[0]][game.location[1]][3] = true;
			game.select = [S.REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [];
			if (game.room[4] > 0) game.rewards.push(game.room[4] + " gold");
			if (get.cardRewardChoices() > 0) game.rewards.push("1 card");
			game.rewards.push("finish");
			activateArtifacts(FUNC.FLOOR_CLEAR);
		} else if (type === ROOM.ORB) {
			game.traveled.push(game.location[1]);
			game.select = [S.REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [Math.floor(get.maxHealth() * 0.5) + " health", "1 purifier"];
			if (get.area() >= 1) game.rewards.push("1 refiner");
			game.rewards.push("finish");
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
	if (game.turn === TURN.ENEMY || game.enemyNum >= 0 || game.enemyStage !== -1) enemyTurn();
};

/**
 * Handles the visuals of the game.
 */
function updateVisuals() {
	// bugs
	if (!canvas || !ctx) return;
	// clear
	clearCanvas();
	// update data
	updateData();
	// visuals
	graphics.backgrounds();
	if (menuSelect[0] !== -1) {
		graphics.middleLayer();
		draw.image(I.title, (400 - I.title.width) / 2, 0);
		draw.lore(390, 51, "Version " + get.versionDisplay(), {"color": "#f00", "text-align": DIR.LEFT, "text-small": true});
		draw.lore(1, 1, "HIGH SCORE: " + global.highScore + " points", {"color": "#fff", "text-small": true});
		if (hasArtifact(202) && game.floor == 10) draw.lore(200 - 2, 53, "Secret Act: When the Hands Align", {"color": "#f44", "text-align": DIR.CENTER});
		else if (get.area() == 1) draw.lore(200 - 2, 53, "Act 2: The Color of the Soul", {"color": "#fff", "text-align": DIR.CENTER});
		else draw.lore(200 - 2, 53, "Act 1: The Hands of Time", {"color": "#f44", "text-align": DIR.CENTER});
		graphics.menu(menuSelect[0] === MENU.MAIN);
		if (game.select[0] === S.WELCOME) {
			draw.box(80 + 2, 83, 240 - 4, 34);
			if (game.difficulty === 0) draw.lore(200 - 1, 84, "Hello there! Welcome to my game!<s>Use the arrow keys or WASD keys to select things.\nPress enter or the space bar to perform an action.\nFor information on how to play, go to the '?' at the top-right of the screen.\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": DIR.CENTER});
			else draw.lore(200 - 1, 84, "Hello there! Welcome to <#f00>hard mode!</#f00><s>In hard mode, enemies start much stronger from the beginning.\nAnd by much stronger, I mean <#f00>MUCH STRONGER</#f00>.\nOtherwise, it is the same as easy mode... or is it?\nI think that's enough of me blabbering on. Go and start playing!", {"text-align": DIR.CENTER});
		} else if (menuSelect[0] === MENU.NEW_RUN || menuSelect[0] === MENU.DIFFICULTY) {
			graphics.conf();
		} else if (menuSelect[0] === MENU.PREV_GAMES) {
			graphics.prevGames();
		};
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
	} else if (game.select[0] === S.CONF_RESTART) {
		graphics.options(false);
		graphics.conf();
	} else if (game.select[0] === S.CONF_HAND_ALIGN) {
		graphics.map(false);
		graphics.conf();
	};
	graphics.popups();
	if (game.select[0] === S.GAME_OVER || game.select[0] === S.GAME_WON) {
		ctx.globalAlpha = game.select[1] / (game.select[0] === S.GAME_WON ? 50 : 64);
		if (game.select[1] < 50) game.select[1]++;
		draw.rect("#222");
		if (game.select[0] === S.GAME_WON) {
			draw.image(I.victorious, 168, 42 + Math.round(Math.abs(winAnim - 4) - 2), I.victorious.width * 2, I.victorious.height * 2);
			winAnim += Math.random() * 0.05 + 0.05;
			if (winAnim >= 8) winAnim -= 8;
			draw.rect("#0004");
		};
		const factors = get.scoreFactors();
		let text = "";
		if (game.select[0] === S.GAME_WON) {
			text += "YOU BEAT THE GAME ";
			if (hasArtifact(202)) text += "<#fcf050>WITH DETERMINATION</#fcf050>";
			else if (game.difficulty) text += "ON <#f00>HARD MODE!</#f00>";
			else text += "ON EASY MODE!";
			text += "\n\nThank you for playing!\n\nMore content is coming soon!";
		} else {
			text += "GAME OVER\n\nDIFFICULTY: ";
			if (hasArtifact(202)) text += "<#fcf050>DETERMINATION</#fcf050>";
			else if (game.difficulty) text += "HARD";
			else text += "EASY";
			text += "\n\nTOP FLOOR: " + game.floor;
		};
		let len = factors.length;
		if (game.difficulty) len += 2;
		let normalColor = (game.select[0] === S.GAME_WON ? "#0f0" : "#f00");
		let hardColor = (game.select[0] === S.GAME_WON ? "#f00" : "#0f0");
		draw.lore(200 - 2, 100 - (len + 17) * 2.75, text, {"color": normalColor, "text-align": DIR.CENTER});
		draw.lore(200 - 2, 100 + (len + 15) * 2.75, "PRESS ENTER TO START A NEW RUN", {"color": normalColor, "text-align": DIR.CENTER});
		text = "";
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][0] + ":\n";
		};
		if (game.difficulty) text += "\nBase score:\n\nTotal score:";
		else text += "\nTotal score:";
		draw.lore(120, 100 - (len - 7) * 2.75, text, {"color": normalColor, "text-small": true});
		text = "";
		let totalScore = 0;
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][1] + "x" + factors[index][2] + " = ";
			let amt = factors[index][1] * factors[index][2];
			if (amt < 1000) text += " ".repeat(4 - ("" + amt).length);
			if (amt == 1) {
				text += "1 point \n";
				totalScore++;
			} else {
				text += amt + " points\n";
				totalScore += amt;
			};
		};
		if (game.difficulty) {
			text += "\n" + totalScore + " points";
			if (hasArtifact(202) && game.kills[FRAGMENT]) {
				text += "\n\n" + totalScore + "<#fcf050>x3</#fcf050>";
				totalScore *= 3;
			} else {
				text += "\n\n" + totalScore + "<" + hardColor + ">x2</" + hardColor + ">";
				totalScore *= 2;
			};
			text += " = " + totalScore + " points";
		} else {
			text += "\n" + totalScore + " points";
		};
		draw.lore(280, 100 - (len - 7) * 2.75, text, {"color": normalColor, "text-align": DIR.LEFT, "text-small": true});
		if (!global.highScore || totalScore > global.highScore) {
			draw.lore(280, 100 + (len + 9) * 2.75, ": NEW HIGH SCORE!", {"color": normalColor, "text-small": true});
		};
		ctx.globalAlpha = 1;
	};
	if (hasArtifact(202) && game.floor == 10 && transition < 100) transition++;
};

const GAME_LOOP = setInterval(() => {
	if (!loaded) return;
	// gameplay
	if (menuSelect[0] === -1) manageGameplay();
	// selection
	selection();
	// visuals
	if (screenShake > 0) {
		if (global.options[OPTION.SCREEN_SHAKE]) {
			clearCanvas();
			ctx.save();
			ctx.translate((Math.random() - 0.5) * Math.min(screenShake, 10), (Math.random() - 0.5) * Math.min(screenShake, 10));
			screenShake--;
		} else {
			screenShake = 0;
		};
	};
	updateVisuals();
	ctx.restore();
	// save
	save();
}, 100);

const MUSIC_LOOP = setInterval(() => {
	if (global.options[OPTION.MUSIC] && document.getElementById("music")?.src) {
		let time = document.getElementById("music").currentTime;
		if (time === 0 && menuSelect[0] === -1) {
			document.getElementById("music").play();
		} else if (time > document.getElementById("music").duration - 1.005) {
			document.getElementById("music").currentTime = 0;
		};
	};
}, 5);
