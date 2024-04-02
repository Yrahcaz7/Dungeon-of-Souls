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

const infoText = {
	// effects
	"aura blade": "If something has X aura\nblades, every time it\nattacks, it deals 5 + X\nextra damage, then X is\nreduced by 1.",
	burn: "If something has X burn,\nat the end of its turn,\nit takes X damage, then\nX is reduced by 1.",
	countdown: "If an enemy has X\ncountdown, at the end of\nits turn, its intent is\nset to what it was on\nthe Xth turn, and then\nX is reduced by 1.",
	"one use": "When a one use card is\nplayed, it is sent to\nthe void. Cards in the\nvoid stay there until\nthe end of the battle.",
	reinforce: "If something has X\nreinforces, at the start\nof its turn, its shield\nis kept, then X is\nreduced by 1.",
	resilience: "If something has X\nresilience, it takes 25%\nless combat damage,\nrounded down. At the\nstart of its turn, X is\nreduced by 1.",
	retention: "A card with X retention\nwill not be discarded\nat the end of your turn.\nInstead, X will be\nreduced by 1.",
	rewind: "If something has X\nrewinds, it is X times\n20 percent stronger. If\nsomething that has\nrewinds and 0 countdown\nreaches 0 health, it\ngains 1 rewind, all\nentities heal fully, and\nthe countdown begins.",
	shroud: "If something has X\nshroud, its intent is\nnot visible. At the end\nof its turn, X is\nreduced by 1.",
	uniform: "Extra damage and extra\nshield have half the\neffect on uniform cards,\nrounded down.",
	unplayable: "An unplayable card has\nno energy cost and\ncannot be played.",
	weakness: "If something has X\nweakness, its attack is\nreduced by 25%, rounded\ndown. At the end of its\nturn, X is reduced by 1.",
	// intents
	[ATTACK]: "This enemy intends to attack\nyou on its next turn.",
	[DEFEND]: "This enemy intends to defend\nitself on its next turn.",
	[BUFF]: "This enemy intends to buff\nitself on its next turn.",
	// other
	"the map": "You can choose where\nyou go next. Cannot use\nduring a battle.",
	"card effect": "After a card leaves\nyour hand, it loses all\nof its applied effects.",
};

for (const key in infoText) {
	if (Object.hasOwnProperty.call(infoText, key)) {
		infoText[key] = infoText[key].replace(/(health|heal|combat\sdamage|extra\sdamage|damage|attacks|attack)/gi, "<#f44>$1</#f44>");
		infoText[key] = infoText[key].replace(/(extra\sshield|shield|defend|defense)/gi, "<#58f>$1</#58f>");
		infoText[key] = infoText[key].replace(/(one\suse|retention|uniform|unplayable)/gi, "<#666>$1</#666>");
	};
};

const overview = ""
	+ "<b>Storyline:<s>"
	+ "You have been trapped in this dungeon as long as you can remember.\n"
	+ "You are determined to get out, so you pick up some armour and start climbing up the floors.\n"
	+ "As you go higher, you get closer to the exit, but the monsters get stronger.\n"
	+ "As time goes on, you wonder... what was the reason you were trapped here in the first place?\n"
	+ "Is there something more to this place than what it seems?\n"
	+ "<b>Controls:<s>"
	+ "Use the arrow keys or WASD keys to select things.\n"
	+ "Press enter or the space bar to perform an action.\n"
	+ "Press tab to enter full screen, and escape to exit it.\n"
	+ "There are also shortcut keys, like the E key, which ends your turn.\n"
	+ "Others are 1, 2, and 3; which view your deck, void, and discard, respectively.\n"
	+ "<b>How to Play:<s>"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "You can play the cards in your hand for the effect(s) they say.\n"
	+ "After each battle, you will get rewards, and you can get better cards.\n"
	+ "Try to get a good synergy between the cards in your deck.\n"
	+ "If you reach 0 health, you die and lose your progress.\n"
	+ "However, you can use your new knowledge to reach higher heights next time.\n"
	+ "Note: go to the next page for more details on how to play.\n"
	+ "<b><#999>An ominous feeling...<s><#999>"
	+ "When the hands align,\n"
	+ "find the fragment of time.\n"
	+ "Else, at the edge of the sky,\n"
	+ "you shall eternally die.",
gameplay = ""
	+ "<b>Cards and Effects<s>"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "Cards cost <#ff0>energy</#ff0> to play, which is the number in the big yellow circle.\n"
	+ "The <#ff0>energy cost</#ff0> of each card is shown on their top-left corner.\n"
	+ "When you play a card, it does what it says on the card (effects are listed below).\n"
	+ " - <#f44>Damage</#f44> reduces enemies' <#f44>health</#f44>, while <#58f>shield</#58f> protects your <#f44>health</#f44> from attacks.\n"
	+ " - Take note that <#58f>shield</#58f> is not kept at the end of your turn unless something says otherwise.\n"
	+ " - Also, <#58f>shield</#58f> on enemies acts the same and goes away at the start of the enemy's turn.\n"
	+ " - Most other effects are more complex, and have a tooltip that says what they do.\n"
	+ "<b>Enemy Intents<s>"
	+ "Take note of what's floating above the enemies' heads. That is their intent.\n"
	+ "An enemy's intent shows what it intends to do on its next turn.\n"
	+ "<#f00>Red</#f00> with spikes or stars is <#f44>attack</#f44>, <#00f>blue</#00f> and shield shape means <#58f>defense</#58f> (gain <#58f>shield</#58f>).\n"
	+ "There are others later, but you can look at the tooltips to see what they are.\n"
	+ "Use the enemies' predictability to strategize what cards you play.\n"
	+ "<b>Building a Deck<s>"
	+ "After each battle, you will get rewards, including a choice of 3 cards.\n"
	+ "Some special things can give you more or less card choices, but it's normally 3.\n"
	+ "Choose cards wisely, and try to get a good synergy between the cards in your deck.\n"
	+ " - Sometimes you will get a purifier, which will let you remove a card from your deck.\n"
	+ " - In Act 2, you can also get refiners, which let you upgrade one of your cards.\n"
	+ "<b>Artifacts<s>"
	+ "Artifacts are very important. You start with two, <#f0c060>The Map</#f0c060> and Iron Will.\n"
	+ "<#f0c060>The map</#f0c060> you always have, and it lets you pick where you go next after a battle.\n"
	+ "Iron Will <#f44>heals</#f44> you a bit after every battle, which is very useful (especially for beginners).\n"
	+ "More artifacts will appear later, and you can always look at the tooltip to see what it does.\n"
	+ "<b>The Map<s>"
	+ "When you open <#f0c060>the map</#f0c060>, you will see a tree of paths you can take.\n"
	+ "You will see some chests, which symbolize <#ff0>treasure chambers</#ff0>.\n"
	+ "<#ff0>Treasure chambers</#ff0> give better rewards than fights, so try to get them.\n"
	+ "Additionally, there will be a <#f00>skull</#f00> on <#f0c060>the map</#f0c060>. That is the <#f00>death zone</#f00>.\n"
	+ "It contains a <#f00>prime enemy</#f00>, which is much, much stronger than normal ones.\n"
	+ "However, the rewards you get are even better than ones from <#ff0>treasure chambers</#ff0>.\n"
	+ "Lastly, the large node at the end is a <#f00>boss battle</#f00>, and the bright orbs before it are healing.\n"
	+ "<b>Losing the Game<s>"
	+ "If you reach 0 <#f44>health</#f44>, you will <#f00>die</#f00> and lose your progress.\n"
	+ "However, you earn <#ff0>XP</#ff0> (not implemented yet), and when you get enough you can unlock new cards.\n"
	+ "Then, you can use your new knowledge and cards to reach higher heights next time.",
changelog = ""
	+ "<b>Version 2.0 - Coming Soon!<s>"
	+ " - in progress of adding Act 2\n"
	+ " - added 3 new types of enemies!\n"
	+ " - you can now enhance cards!\n"
	+ " - improved game performance\n"
	+ " - improved some visuals\n"
	+ "<b>Version 1.3 - Deception<s>"
	+ " - added THE SECRET ACT\n"
	+ " - added special events (4 so far)\n"
	+ " - added a new option: screen shake\n"
	+ " - five new cards, and many new effects\n"
	+ " - you now get scored at the end of each run\n"
	+ " - the map now looks much cooler\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 1.2 - Reception<s>"
	+ " - added a new option: pixel perfect size\n"
	+ " - two new cards and two new artifacts\n"
	+ " - a new effect, resilience, which reduces damage taken\n"
	+ " - the boss is now smarter and has a new move\n"
	+ " - slimes now finally have defending animations!\n"
	+ " - a lot of rebalancing\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 1.1 - Perception<s>"
	+ " - added a new option: pixel perfect screen\n"
	+ " - two new cards, and a new effect\n"
	+ " - four new artifacts (obtained via death zone rewards)\n"
	+ " - finally added a boss battle at the end\n"
	+ " - travelled paths on the map now appear darker\n"
	+ " - balancing (including the map generator)\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 1.0 - Inception<s>"
	+ " - finally added title and game over screens\n"
	+ " - finally added an options menu\n"
	+ " - added treasure chambers and death zones\n"
	+ " - added shortcut keys for various things\n"
	+ " - three new cards and some card rebalancing\n"
	+ " - polished up the map generator (and fixed seeds)\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.3 - Formulation<s>"
	+ " - enemies now die upon reaching 0 health\n"
	+ " - added the map (upper-left corner)\n"
	+ " - added artifacts (and seeds; a work in progress)\n"
	+ " - finally added the how to play page\n"
	+ " - two new cards, and a new effect\n"
	+ " - added loot/rewards at end of fights\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.2 - Manifestation<s>"
	+ " - you can now end your turn (you couldn't before)\n"
	+ " - enemies can now attack and defend\n"
	+ " - you can now see what the enemy intends to do\n"
	+ " - added the changelog to the game info\n"
	+ " - added notifications (currently only music change ones)\n"
	+ " - a new card, with a totally new effect\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.1 - Realization<s>"
	+ " - many optimizations including 2 new classes\n"
	+ " - a lot more cool visuals and animations\n"
	+ " - some new options and a help page\n"
	+ " - added custom music, made by myself\n"
	+ " - you can now view your deck and discard\n"
	+ " - a new card, with a totally new effect\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.0 - Desolation<s>"
	+ " - started making the game in my spare time\n"
	+ " - still needs a lot of polishing and such\n"
	+ " - next update will probably make it more playable";

/**
 * Updates the game's data.
 */
function updateData() {
	if (!loaded) return;
	// delete excess enemies
	if (game.enemies.length > 6) game.enemies.splice(6);
	// enemyPos
	if (game.enemies.length !== enemyPos.length) {
		if (game.enemies.length == 1) enemyPos = [[400 - 105, 40]];
		else if (game.enemies.length == 2) enemyPos = [[400 - 70, 35], [400 - 140, 50]];
		else if (game.enemies.length == 3) enemyPos = [[400 - 70, 70], [400 - 140, 80], [400 - 110, 14]];
		else if (game.enemies.length == 4) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 110, 14], [400 - 200, 30]];
		else if (game.enemies.length == 5) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 100, 14], [400 - 170, 14], [400 - 210, 80]];
		else if (game.enemies.length == 6) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 100, 14], [400 - 170, 14], [400 - 210, 80], [400 - 240, 14]];
		else enemyPos = [];
	};
	// handPos
	if (game.hand.length !== handPos.length) {
		handPos = [];
		const margin = [-2, -2, -2, -2, -2, 8, 16, 24, 28, 32, 36, 38, 40, 42, 44, 46, 46, 48, 48, 50, 50, 52, 52, 52, 52];
		// discard extra cards
		if (game.hand.length > margin.length) {
			let extraCards = game.hand.splice(margin.length);
			for (const key of extraCards) {
				discardCard(key);
			};
		};
		// calculate handPos
		for (let index = 0; index < game.hand.length; index++) {
			handPos.push(198 + (index - (game.hand.length / 2)) * 64 - (index - ((game.hand.length - 1) / 2)) * margin[game.hand.length - 1]);
		};
	};
	// info
	if (infPos < 0) infPos = 0;
	if (infPos > infLimit) infPos = infLimit;
	// fixes
	if (game.health < 0) game.health = 0;
	else if (game.health > get.maxHealth()) game.health = get.maxHealth();
	if (game.shield < 0) game.shield = 0;
	else if (game.shield > get.maxShield()) game.shield = get.maxShield();
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].health > game.enemies[index].maxHealth) game.enemies[index].health = game.enemies[index].maxHealth;
		if (game.enemies[index].shield > game.enemies[index].maxShield) game.enemies[index].shield = game.enemies[index].maxShield;
	};
	// kill enemies
	let healAll = false;
	for (let index = 0; index < game.enemies.length; index++) {
		if (game.enemies[index].health <= 0) {
			if (game.enemies[index].eff.rewinds > 0 && !game.enemies[index].eff.countdown) {
				game.enemies[index].eff.rewinds++;
				game.enemies[index].eff.countdown = Math.max(game.enemies[index].intentHistory.length - 1, 0);
				game.enemies[index].intentHistory.splice(game.enemies[index].intentHistory.length - 1);
				healAll = true;
			} else {
				const type = game.enemies[index].type;
				if (game.kills[type]) game.kills[type]++;
				else game.kills[type] = 1;
				game.enemies.splice(index, 1);
				if (game.enemyNum >= index) game.enemyNum--;
			};
		};
	};
	// heal everything
	if (healAll) {
		for (let index = 0; index < game.enemies.length; index++) {
			game.enemies[index].health = game.enemies[index].maxHealth;
		};
		game.health = get.maxHealth();
	};
	// game over
	if (game.health === 0 && playerAnim[1] != "death") {
		startAnim.player("death");
		game.turn = -1;
		game.state = STATE.GAME_END;
		game.select = [GAME_OVER, 0];
	};
	// game won
	if (game.floor == 10 && game.state === STATE.EVENT_FIN && game.select[0] === IN_MAP) {
		game.turn = -1;
		game.state = STATE.GAME_END;
		game.select = [GAME_FIN, 0];
	};
	// state changes
	endBattle();
	loadRoom();
	// other
	game.deck.cardSort();
	game.void.cardSort();
	game.discard.cardSort();
	if (game.select[0] === HAND) {
		if (game.hand.length) game.prevCard = game.select[1];
		else game.select = [END, 0];
	};
};
