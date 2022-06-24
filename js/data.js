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

const text = "Source can be found at \"https://github.com/Yrahcaz7/Dungeon-of-Souls\".\n"
	+ "\n\n\n"
	+ "You have been trapped in this dungeon as long as you can remember.\n"
	+ "You are determined to get out, so you pick up some armour and start climbing up the floors.\n"
	+ "As you go higher, you get closer to the exit, but the monsters get stronger.\n"
	+ "As time goes on, you wonder... what was the reason you were trapped here in the first place?\n"
	+ "Is there something more to this place than what it seems?\n"
	+ "\n\n\n"
	+ "Use the arrow keys or WASD keys to select things.\n"
	+ "Press enter or the space bar to perform an action.\n"
	+ "Press tab to enter full screen, and escape to exit it.\n"
	+ "\n\n\n"
	+ "You have a deck of cards, which you draw the top 5 from each turn.\n"
	+ "You can play the cards in your hand for the effect(s) they say.\n"
	+ "After each battle, you will get rewards, and you can get better cards.\n"
	+ "Try to get a good synergy between the cards in your deck.\n"
	+ "If you reach 0 health, you die and lose your progress.\n"
	+ "However, you can use your new knowledge to reach higher heights next time.\n"
	+ "\n\n\n"
	+ "When the hands align,\n"
	+ "find the fragment of time.\n"
	+ "Else, at the edge of the sky,\n"
	+ "you shall eternally die."

var bladeFloat = [0, "up", 2.5, "up", 3, "down", 0.5, "down"];

function updateData() {
	// hide
	hide = (game.select[0] == "help" || game.select[0] == "looker" || game.select[0] == "deck") && game.select[1];
    // enemyPos
	let number = game.enemies.length;
	if (number == 1) game.enemyPos = [[400 - 105, 50]];
	else if (number == 2) game.enemyPos = [[400 - 70, 50 - 5], [400 - 140, 50 + 20]];
	else if (number == 3) game.enemyPos = [[400 - 70, 50], [400 - 140, 50 + 32], [400 - 140, 50 - 32]];
	else if (number == 4) game.enemyPos = [[400 - 70, 50], [400 - 140, 50 + 32], [400 - 140, 50 - 32], [400 - 210, 50]];
	else if (number == 5) game.enemyPos = [[400 - 70, 50], [400 - 140, 50 + 32], [400 - 140, 50 - 32], [400 - 210, 50 + 32], [400 - 210, 50 - 32]];
	else if (number == 6) game.enemyPos = [[400 - 70, 50], [400 - 140, 50 + 32], [400 - 140, 50 - 32], [400 - 210, 50 + 64], [400 - 210, 50], [400 - 210, 50 - 64]];
	// handPos
    number = game.hand.length;
	if (number == 1) game.handPos = [198 - 32];
	else if (number == 2) game.handPos = [198 - 64 - 1, 198 + 1];
	else if (number == 3) game.handPos = [198 - 96 - 2, 198 - 32, 198 + 32 + 2];
	else if (number == 4) game.handPos = [198 - 128 - 3, 198 - 64 - 1, 198 + 1, 198 + 64 + 3];
	else if (number == 5) game.handPos = [198 - 160 - 4, 198 - 96 - 2, 198 - 32, 198 + 32 + 2, 198 + 96 + 4];
	else if (number == 6) game.handPos = [198 - 192 + 10, 198 - 128 + 6, 198 - 64 + 2, 198 - 2, 198 + 64 - 6, 198 + 128 - 10];
	else if (number == 7) game.handPos = [198 - 224 + 42, 198 - 160 + 28, 198 - 96 + 14, 198 - 32, 198 + 32 - 14, 198 + 96 - 28, 198 + 160 - 42];
	else if (number == 8) game.handPos = [198 - 256 + 77, 198 - 192 + 55, 198 - 128 + 33, 198 - 64 + 11, 198 - 11, 198 + 64 - 33, 198 + 128 - 55, 198 + 192 - 77];
	else if (number == 9) game.handPos = [198 - 288 + 104, 198 - 224 + 78, 198 - 160 + 52, 198 - 96 + 26, 198 - 32, 198 + 32 - 26, 198 + 96 - 52, 198 + 160 - 78, 198 + 224 - 104];
	else if (number == 10) game.handPos = [198 - 320 + 135, 198 - 256 + 105, 198 - 192 + 75, 198 - 128 + 45, 198 - 64 + 15, 198 - 15, 198 + 64 - 45, 198 + 128 - 75, 198 + 192 - 105, 198 + 256 - 135];
	else if (number == 11) game.handPos = [198 - 352 + 170, 198 - 288 + 136, 198 - 224 + 102, 198 - 160 + 68, 198 - 96 + 34, 198 - 32, 198 + 32 - 34, 198 + 96 - 68, 198 + 160 - 102, 198 + 224 - 136, 198 + 288 - 170];
	else if (number == 12) game.handPos = [198 - 384 + 198, 198 - 320 + 162, 198 - 256 + 126, 198 - 192 + 90, 198 - 128 + 54, 198 - 64 + 18, 198 - 18, 198 + 64 - 54, 198 + 128 - 90, 198 + 192 - 126, 198 + 256 - 162, 198 + 320 - 198];
	// AuraBladePos
	number = game.auraBlades;
	if (number == 1) game.auraBladePos = [[65, 10]];
	else if (number == 2) game.auraBladePos = [[65, 10], [80, 25]];
	else if (number == 3) game.auraBladePos = [[65, 10], [80, 25], [40, 0]];
	else game.auraBladePos = [[65, 10], [80, 25], [40, 0], [25, 35]];
	for (let num = 0; num < game.auraBladePos.length && num <= 4; num++) {
		game.auraBladePos[num][1] += Math.round(bladeFloat[num * 2]);
		if (bladeFloat[num * 2 + 1] == "up") bladeFloat[num * 2] += (Math.random() + 0.5) * 0.05;
		else bladeFloat[num * 2] -= (Math.random() + 0.5) * 0.05;
		if (bladeFloat[num * 2] >= 4) bladeFloat[num * 2 + 1] = "down";
		else if (bladeFloat[num * 2] <= 0) bladeFloat[num * 2 + 1] = "up";
	};
};
