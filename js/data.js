const text = "You have been trapped in this dungeon as long as you can remember.\n"
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
	+ "However, you can use your new knowledge to reach higher heights next time."

function updateData() {
	// hide
	hide = (game.select[0] == "help" || game.select[0] == "looker") && game.select[1];
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
};
