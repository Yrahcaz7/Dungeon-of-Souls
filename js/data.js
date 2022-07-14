/*
	Dungeon of Souls
	Copyright (C) 2022 Yrahcaz7

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const infoText = {
	reinforce: "At the start of each\nturn, one reinforce is\nused up to retain your\nblock (even if you have\nno block left.)",
	aura_blade: "Every time you attack,\none of your aura blades\nis used up for 5 + X\nextra damage, X being\nthe number of aura\nblades you have.",
	iron_will: "Every time a battle\nends, you heal 2 health.",
	the_map: "Every time a battle\nends, you can choose\nwhere you go next.",
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
	+ "<b>How to Play:<s>"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "You can play the cards in your hand for the effect(s) they say.\n"
	+ "After each battle, you will get rewards, and you can get better cards.\n"
	+ "Try to get a good synergy between the cards in your deck.\n"
	+ "If you reach 0 health, you die and lose your progress.\n"
	+ "However, you can use your new knowledge to reach higher heights next time.\n"
	+ "<b>An ominous feeling...<s>"
	+ "When the hands align,\n"
	+ "find the fragment of time.\n"
	+ "Else, at the edge of the sky,\n"
	+ "you shall eternally die.",
gameplay = ""
	+ "<b>Cards and Effects<s>"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "You can play the cards in your hand for the effect(s) they say.\n"
	+ " - Damage reduces enemies' health, while shield protects your health from attacks.\n"
	+ " - Take note that shield goes away at the end of your turn unless something says otherwise.\n"
	+ " - Most other effects are more complex, and have a tooltip that says what they do.\n"
	+ "<b>Enemy Intents<s>"
	+ "Take note of what's floating above the enemies' heads. That is their intent.\n"
	+ "An enemy's intent shows what it intents to do on it's next turn.\n"
	+ "Red with spikes or stars is attack, blue and shield shape means shield.\n"
	+ "There are others later, but you can look at the tooltips to see what they are.\n"
	+ "Use the monster's predictableness to strategize what cards you play.\n"
	+ "<b>Building a Deck<s>"
	+ "After each battle, you will get rewards, including a choice of 3 cards.\n"
	+ "Some special things can give you more or less card choices, but it's normally 3.\n"
	+ "Choose cards wisely, and try to get a good synergy between the cards in your deck.\n"
	+ " - Put info about enhancements here when they are added.\n"
	+ "<b>Artifacts<s>"
	+ "Artifacts are very important. You start with two, The Map and Iron Will.\n"
	+ "The map you always have, and it lets you pick where you go next after a battle.\n"
	+ "Iron Will heals you a bit after every battle, which is very useful (especially for beginners.)\n"
	+ "More artifacts will appear later, and you can always look at the tooltip to see what it does.\n"
	+ "<b>Losing the Game<s>"
	+ "If you reach 0 health, you will die and lose your progress.\n"
	+ "However, you earn XP, and when you get enough you can unlock new cards.\n"
	+ "Then, you can use your new knowledge and cards to reach higher heights next time.",
changelog = ""
	+ "<b>Version 1.1 - Formulation (in progress)<s>"
	+ " - enemies now die upon reaching 0 health\n"
	+ " - added the map (upper-left corner)\n"
	+ " - added artifacts, which give various effects\n"
	+ " - added two new cards, and a new effect\n"
	+ "<b>Version 1.0 - Manifestation<s>"
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

var bladeFloat = [0, "up", 2.5, "up", 3, "down", 0.5, "down"];

function updateData() {
	// hide
	hide = (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck" || game.select[0] == "discard" || game.select[0] == "map") && game.select[1];
	// enemyPos
	let number = game.enemies.length, x = 400, y = 50;
	if (number == 1) game.enemyPos = [[x - 105, y]];
	else if (number == 2) game.enemyPos = [[x - 70, y - 5], [x - 140, y + 10]];
	else if (number == 3) game.enemyPos = [[x - 70, y + 20], [x - 140, y + 30], [x - 110, y - 36]];
	else if (number == 4) game.enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 110, y - 36], [x - 200, y - 20]];
	else if (number == 5) game.enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 100, y - 36], [x - 170, y - 36], [x - 210, y + 30]];
	else if (number == 6) game.enemyPos = [[x - 70, y + 30], [x - 140, y + 30], [x - 100, y - 36], [x - 170, y - 36], [x - 210, y + 30], [x - 240, y - 36]];
	// handPos
	number = game.hand.length;
	x = 198;
	if (number == 1) game.handPos = [x - 32];
	else if (number == 2) game.handPos = [x - 64 - 1, x + 1];
	else if (number == 3) game.handPos = [x - 96 - 2, x - 32, x + 32 + 2];
	else if (number == 4) game.handPos = [x - 128 - 3, x - 64 - 1, x + 1, x + 64 + 3];
	else if (number == 5) game.handPos = [x - 160 - 4, x - 96 - 2, x - 32, x + 32 + 2, x + 96 + 4];
	else if (number == 6) game.handPos = [x - 192 + 10, x - 128 + 6, x - 64 + 2, x - 2, x + 64 - 6, x + 128 - 10];
	else if (number == 7) game.handPos = [x - 224 + 42, x - 160 + 28, x - 96 + 14, x - 32, x + 32 - 14, x + 96 - 28, x + 160 - 42];
	else if (number == 8) game.handPos = [x - 256 + 77, x - 192 + 55, x - 128 + 33, x - 64 + 11, x - 11, x + 64 - 33, x + 128 - 55, x + 192 - 77];
	else if (number == 9) game.handPos = [x - 288 + 104, x - 224 + 78, x - 160 + 52, x - 96 + 26, x - 32, x + 32 - 26, x + 96 - 52, x + 160 - 78, x + 224 - 104];
	else if (number == 10) game.handPos = [x - 320 + 135, x - 256 + 105, x - 192 + 75, x - 128 + 45, x - 64 + 15, x - 15, x + 64 - 45, x + 128 - 75, x + 192 - 105, x + 256 - 135];
	else if (number == 11) game.handPos = [x - 352 + 170, x - 288 + 136, x - 224 + 102, x - 160 + 68, x - 96 + 34, x - 32, x + 32 - 34, x + 96 - 68, x + 160 - 102, x + 224 - 136, x + 288 - 170];
	else if (number == 12) game.handPos = [x - 384 + 198, x - 320 + 162, x - 256 + 126, x - 192 + 90, x - 128 + 54, x - 64 + 18, x - 18, x + 64 - 54, x + 128 - 90, x + 192 - 126, x + 256 - 162, x + 320 - 198];
	// AuraBladePos
	game.auraBladePos = [[65, 10], [80, 25], [40, 0], [25, 35]];
	for (let num = 0; num < game.auraBladePos.length && num <= 4; num++) {
		game.auraBladePos[num][1] += Math.round(bladeFloat[num * 2]);
		if (bladeFloat[num * 2 + 1] == "up") bladeFloat[num * 2] += (Math.random() + 0.5) * 0.05;
		else bladeFloat[num * 2] -= (Math.random() + 0.5) * 0.05;
		if (bladeFloat[num * 2] >= 4) bladeFloat[num * 2 + 1] = "down";
		else if (bladeFloat[num * 2] <= 0) bladeFloat[num * 2 + 1] = "up";
	};
	// map
	for (let index = 0; index < game.map.length; index++) {
		let falses = 0;
		for (let ind2 = 0; ind2 < game.map[index].length; ind2++) {
			if (!game.map[index][ind2]) falses++;
		};
		if (falses >= 5) {
			if (index === 0) game.map[0] = [false, mapPiece(), mapPiece(), mapPiece(), mapPiece(), false];
			else game.map[index] = [mapPiece(), mapPiece(), mapPiece(), mapPiece(), mapPiece(), mapPiece()];
		};
	};
	// info
	if (infPos <= 0) infPos = 0;
	if (infLimit <= 0) infLimit = 0;
	if (infPos >= infLimit) infPos = infLimit;
	// fixes
	if (game.health < 0) game.health = 0;
	else if (game.health > game.maxHealth) game.health = game.maxHealth;
	if (game.shield < 0) game.shield = 0;
	else if (game.shield > game.maxShield) game.shield = game.maxShield;
	for (let a = 0; a < game.enemies.length; a++) {
		let enemy = game.enemies[a];
		if (enemy.health < 0) game.enemies[a].health = 0;
		if (enemy.health > enemy.maxHealth) game.enemies[a].health = enemy.maxHealth;
		if (enemy.shield > enemy.maxShield) game.enemies[a].shield = enemy.maxShield;
	};
	// other
	game.deckProxy = JSON.stringify(game.deckLocal);
	game.deck.cardSort();
	game.discard.cardSort();
	if (game.select[0] == "hand") {
		if (game.hand[0]) game.prevCard = game.select[1];
		else game.select = ["end", 0];
	};
};
