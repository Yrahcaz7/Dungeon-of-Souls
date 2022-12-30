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
	"aura blade": "Every time you <red>attack</red>,\none of your aura blades\nis used up for 5 + X\n<red>extra damage</red>, X being\nthe number of aura\nblades you have.",
	burn: "At the end of each\nturn, each burn deals 1\n<red>damage</red> to what it is on,\nthen one burn on that\ngoes away.",
	"one use": "When a one use card is\nplayed, it will be sent\nto the void instead of\nthe discard.",
	reinforce: "At the start of each\nturn, one reinforce is\nused up to retain your\n<blue>shield</blue> (even if you have\nno <blue>shield</blue> left).",
	weakness: "While something has\nweakness, its <red>attack</red> is\n75% of normal, rounded\ndown. At the end of each\nturn, one weakness will\ngo away.",
	// other
	"the map": "You can choose where\nyou go next. Cannot use\nduring a battle.",
}, overview = ""
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
	+ "<b><gray>An ominous feeling...<s><gray>"
	+ "When the hands align,\n"
	+ "find the fragment of time.\n"
	+ "Else, at the edge of the sky,\n"
	+ "you shall eternally die.",
gameplay = ""
	+ "<b>Cards and Effects<s>"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "Cards cost <yellow>energy</yellow> to play, which is the number in the big yellow circle.\n"
	+ "The <yellow>energy cost</yellow> of each card is shown on their top-left corner.\n"
	+ "When you play a card, it does what it says on the card (effects are listed below).\n"
	+ " - <red>Damage</red> reduces enemies' <red>health</red>, while <blue>shield</blue> protects your <red>health</red> from attacks.\n"
	+ " - Take note that <blue>shield</blue> goes away at the end of your turn unless something says otherwise.\n"
	+ " - Also, <blue>shield</blue> on enemies acts the same and goes away at the start of the enemy turn.\n"
	+ " - Most other effects are more complex, and have a tooltip that says what they do.\n"
	+ "<b>Enemy Intents<s>"
	+ "Take note of what's floating above the enemies' heads. That is their intent.\n"
	+ "An enemy's intent shows what it intends to do on its next turn.\n"
	+ "<deep-red>Red</deep-red> with spikes or stars is <red>attack</red>, <deep-blue>blue</deep-blue> and shield shape means <blue>defense</blue> (gain <blue>shield</blue>).\n"
	+ "There are others later (not implemented yet), but you can look at the tooltips to see what they are.\n"
	+ "Use the enemies' predictableness to strategize what cards you play.\n"
	+ "<b>Building a Deck<s>"
	+ "After each battle, you will get rewards, including a choice of 3 cards.\n"
	+ "Some special things can give you more or less card choices, but it's normally 3.\n"
	+ "Choose cards wisely, and try to get a good synergy between the cards in your deck.\n"
	+ " - Put info about enhancements here when they are added.\n"
	+ "<b>Artifacts<s>"
	+ "Artifacts are very important. You start with two, <light-brown>The Map</light-brown> and Iron Will.\n"
	+ "<light-brown>The map</light-brown> you always have, and it lets you pick where you go next after a battle.\n"
	+ "Iron Will <red>heals</red> you a bit after every battle, which is very useful (especially for beginners).\n"
	+ "More artifacts will appear later, and you can always look at the tooltip to see what it does.\n"
	+ "<b>The Map<s>"
	+ "When you open <light-brown>the map</light-brown>, you will see a tree of paths you can take.\n"
	+ "You will see some chests, which symbolize <yellow>treasure chambers</yellow>.\n"
	+ "<yellow>Treasure chambers</yellow> give better rewards than fights, so try to get them.\n"
	+ "Additionally, there will be a <deep-red>skull</deep-red> on <light-brown>the map</light-brown>. That is the <deep-red>death zone</deep-red>.\n"
	+ "It contains a <deep-red>prime enemy</deep-red>, which is much, much stronger than normal ones.\n"
	+ "However, the rewards you get are even better than ones from <yellow>treasure chambers</yellow>.\n"
	+ "<b>Losing the Game<s>"
	+ "If you reach 0 <red>health</red>, you will <deep-red>die</deep-red> and lose your progress.\n"
	+ "However, you earn <yellow>XP</yellow> (not implemented yet), and when you get enough you can unlock new cards.\n"
	+ "Then, you can use your new knowledge and cards to reach higher heights next time.",
changelog = ""
	+ "<b>Version 1.1 - Perception (in progress)<s>"
	+ " - added a new option: pixel perfect screen\n"
	+ " - two new cards, and a new effect\n"
	+ " - four new artifacts (obtained via death zone rewards)\n"
	+ " - updated/adjusted some pixel art\n"
	+ " - travelled paths on the map now appear darker\n"
	+ " - more bugfixes of course :)\n"
	+ "<b>Version 1.0 - Inception<s>"
	+ " - finally added title and game over screens\n"
	+ " - finally added an options menu\n"
	+ " - added treasure chambers and death zones\n"
	+ " - added shortcut keys for various things\n"
	+ " - three new cards and some card balancing\n"
	+ " - polished up the map generator (and fixed seeds)\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.4 - Formulation<s>"
	+ " - enemies now die upon reaching 0 health\n"
	+ " - added the map (upper-left corner)\n"
	+ " - added artifacts (and seeds; a work in progress)\n"
	+ " - finally added the how to play page\n"
	+ " - two new cards, and a new effect\n"
	+ " - added loot/rewards at end of fights\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.3 - Manifestation<s>"
	+ " - you can now end your turn (you couldn't before)\n"
	+ " - enemies can now attack and defend\n"
	+ " - you can now see what the enemy intends to do\n"
	+ " - added the changelog to the game info\n"
	+ " - added notifications (currently only music change ones)\n"
	+ " - a new card, with a totally new effect\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.2 - Realization<s>"
	+ " - many optimizations including 2 new classes\n"
	+ " - a lot more cool visuals and animations\n"
	+ " - some new options and a help page\n"
	+ " - added custom music, made by myself\n"
	+ " - you can now view your deck and discard\n"
	+ " - a new card, with a totally new effect\n"
	+ " - even more things that I didn't list here\n"
	+ "<b>Version 0.1 - Desolation<s>"
	+ " - started making the game in my spare time\n"
	+ " - still needs a lot of polishing and such\n"
	+ " - next update will probably make it more playable";

function updateData() {
	if (!loaded) return;
	// enemyPos
	let number = game.enemies.length, x = 400, y = 50;
	if (number == 1) enemyPos = [[x - 105, y]];
	else if (number == 2) enemyPos = [[x - 70, y - 5], [x - 140, y + 10]];
	else if (number == 3) enemyPos = [[x - 70, y + 20], [x - 140, y + 30], [x - 110, y - 36]];
	else if (number == 4) enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 110, y - 36], [x - 200, y - 20]];
	else if (number == 5) enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 100, y - 36], [x - 170, y - 36], [x - 210, y + 30]];
	else if (number == 6) enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 100, y - 36], [x - 170, y - 36], [x - 210, y + 30], [x - 240, y - 36]];
	else enemyPos = [];
	// handPos
	if (game.hand.length > 12) game.hand.splice(12);
	number = game.hand.length;
	x = 198;
	if (number == 1) handPos = [x - 32];
	else if (number == 2) handPos = [x - 64 - 1, x + 1];
	else if (number == 3) handPos = [x - 96 - 2, x - 32, x + 32 + 2];
	else if (number == 4) handPos = [x - 128 - 3, x - 64 - 1, x + 1, x + 64 + 3];
	else if (number == 5) handPos = [x - 160 - 4, x - 96 - 2, x - 32, x + 32 + 2, x + 96 + 4];
	else if (number == 6) handPos = [x - 192 + 15, x - 128 + 9, x - 64 + 3, x - 3, x + 64 - 9, x + 128 - 15];
	else if (number == 7) handPos = [x - 224 + 45, x - 160 + 30, x - 96 + 15, x - 32, x + 32 - 15, x + 96 - 30, x + 160 - 45];
	else if (number == 8) handPos = [x - 256 + 77, x - 192 + 55, x - 128 + 33, x - 64 + 11, x - 11, x + 64 - 33, x + 128 - 55, x + 192 - 77];
	else if (number == 9) handPos = [x - 288 + 108, x - 224 + 81, x - 160 + 54, x - 96 + 27, x - 32, x + 32 - 27, x + 96 - 54, x + 160 - 81, x + 224 - 108];
	else if (number == 10) handPos = [x - 320 + 144, x - 256 + 112, x - 192 + 80, x - 128 + 48, x - 64 + 16, x - 16, x + 64 - 48, x + 128 - 80, x + 192 - 112, x + 256 - 144];
	else if (number == 11) handPos = [x - 352 + 175, x - 288 + 140, x - 224 + 105, x - 160 + 70, x - 96 + 35, x - 32, x + 32 - 35, x + 96 - 70, x + 160 - 105, x + 224 - 140, x + 288 - 175];
	else if (number == 12) handPos = [x - 384 + 209, x - 320 + 171, x - 256 + 133, x - 192 + 95, x - 128 + 57, x - 64 + 19, x - 19, x + 64 - 57, x + 128 - 95, x + 192 - 133, x + 256 - 171, x + 320 - 209];
	else handPos = [];
	// info
	if (infPos < 0) infPos = 0;
	if (infPos > infLimit) infPos = infLimit;
	// fixes
	if (game.health < 0) game.health = 0;
	else if (game.health > get.maxHealth()) game.health = get.maxHealth();
	if (game.shield < 0) game.shield = 0;
	else if (game.shield > get.maxShield()) game.shield = get.maxShield();
	for (let a = 0; a < game.enemies.length; a++) {
		let enemy = game.enemies[a];
		if (enemy.health < 0) game.enemies[a].health = 0;
		if (enemy.health > enemy.maxHealth) game.enemies[a].health = enemy.maxHealth;
		if (enemy.shield > enemy.maxShield) game.enemies[a].shield = enemy.maxShield;
	};
	// game over
	if (game.health === 0 && playerAnim[1] != "death") {
		startAnim.player("death");
		game.turn = "none";
		game.state = "game_over";
		game.select = [GAME_OVER, 0];
	};
	// game won
	if (game.floor == 8 && game.state == "event_fin" && game.select[0] === IN_MAP) {
		game.turn = "none";
		game.state = "game_fin";
		game.select = [GAME_FIN, 0];
	};
	// other
	game.deck.cardSort();
	game.discard.cardSort();
	if (game.select[0] === HAND) {
		if (game.hand.length) game.prevCard = game.select[1];
		else game.select = [END, 0];
	};
};
