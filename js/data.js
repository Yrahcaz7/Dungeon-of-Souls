function updateData() {
    // enemyPos
	let number = game.enemies.length;
	if (number == 1) game.enemyPos = [[width - 105, centerY]];
	else if (number == 2) game.enemyPos = [[width - 70, centerY - 5], [width - 140, centerY + 20]];
	else if (number == 3) game.enemyPos = [[width - 70, centerY], [width - 140, centerY + 32], [width - 140, centerY - 32]];
	else if (number == 4) game.enemyPos = [[width - 70, centerY], [width - 140, centerY + 32], [width - 140, centerY - 32], [width - 210, centerY]];
	else if (number == 5) game.enemyPos = [[width - 70, centerY], [width - 140, centerY + 32], [width - 140, centerY - 32], [width - 210, centerY + 32], [width - 210, centerY - 32]];
	else if (number == 6) game.enemyPos = [[width - 70, centerY], [width - 140, centerY + 32], [width - 140, centerY - 32], [width - 210, centerY + 64], [width - 210, centerY], [width - 210, centerY - 64]];
	// handPos
    number = game.hand.length;
	let center = width / 2 - 2;
	if (number == 1) game.handPos = [center - 32];
	else if (number == 2) game.handPos = [center - 64 - 1, center + 1];
	else if (number == 3) game.handPos = [center - 96 - 2, center - 32, center + 32 + 2];
	else if (number == 4) game.handPos = [center - 128 - 3, center - 64 - 1, center + 1, center + 64 + 3];
	else if (number == 5) game.handPos = [center - 160 - 4, center - 96 - 2, center - 32, center + 32 + 2, center + 96 + 4];
	else if (number == 6) game.handPos = [center - 192 + 10, center - 128 + 6, center - 64 + 2, center - 2, center + 64 - 6, center + 128 - 10];
	else if (number == 7) game.handPos = [center - 224 + 42, center - 160 + 28, center - 96 + 14, center - 32, center + 32 - 14, center + 96 - 28, center + 160 - 42];
	else if (number == 8) game.handPos = [center - 256 + 77, center - 192 + 55, center - 128 + 33, center - 64 + 11, center - 11, center + 64 - 33, center + 128 - 55, center + 192 - 77];
	else if (number == 9) game.handPos = [center - 288 + 104, center - 224 + 78, center - 160 + 52, center - 96 + 26, center - 32, center + 32 - 26, center + 96 - 52, center + 160 - 78, center + 224 - 104];
	else if (number == 10) game.handPos = [center - 320 + 135, center - 256 + 105, center - 192 + 75, center - 128 + 45, center - 64 + 15, center - 15, center + 64 - 45, center + 128 - 75, center + 192 - 105, center + 256 - 135];
	else if (number == 11) game.handPos = [center - 352 + 170, center - 288 + 136, center - 224 + 102, center - 160 + 68, center - 96 + 34, center - 32, center + 32 - 34, center + 96 - 68, center + 160 - 102, center + 224 - 136, center + 288 - 170];
	else if (number == 12) game.handPos = [center - 384 + 198, center - 320 + 162, center - 256 + 126, center - 192 + 90, center - 128 + 54, center - 64 + 18, center - 18, center + 64 - 54, center + 128 - 90, center + 192 - 126, center + 256 - 162, center + 320 - 198];
};
