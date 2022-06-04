const slime = new Image, smallSlime = new Image, // monsters

background = new Image, clock = new Image, // backrounds

healthBar = new Image, numbers = new Image, letters = new Image, view = new Image; // other

var backAnim = [0, "up"], enemyAnim = [0, 1, 2, 3];

slime.src = "images/slime.png";

smallSlime.src = "images/smallSlime.png";

background.src = "images/background.png";

clock.src = "images/clock.png";

healthBar.src = "images/healthBar.png";

numbers.src = "images/numbers.png";

letters.src = "images/letters.png";

view.src = "images/view.png";

function spawnEnemies() {
	ctx.drawImage(background, 0, 0);
	ctx.drawImage(clock, 122, 28 - Math.round(backAnim[0]));
	if (backAnim[0] >= 1) backAnim[1] = "down";
	else if (backAnim[0] <= -1) backAnim[1] = "up";
	if (backAnim[1] == "up") backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] == "down") backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (game.enemies.length > 4) {
		for (let a = 4; a < game.enemies.length; a++) {
			game.hiddenEnemies[a - 4] = game.enemies[a];
			game.enemies.splice(a, 1);
		};
	};
	for (let a = 0; a < game.enemies.length; a++) {
		enemy = game.enemies[a];
		if (game.enemies.length == 1) {
			x = 210;
			y = 20;
		} else if (game.enemies.length == 2) {
			if (a == 0) {
				x = 230;
				y = 10;
			} else {
				x = 160;
				y = 50;
			};
		} else if (game.enemies.length == 3) {
			if (a == 0) {
				x = 230;
				y = 30;
			} else if (a == 2) {
				x = 160;
				y = 70;
			} else {
				x = 160;
				y = 5;
			};
		} else if (game.enemies.length == 4) {
			if (a == 0) {
				x = 230;
				y = 5;
			} else if (a == 2) {
				x = 230;
				y = 70;
			} else if (a == 3) {
				x = 160;
				y = 70;
			} else {
				x = 160;
				y = 5;
			};
		};
		if (enemyAnim[a] >= 4) enemyAnim[a] = 0;
		if (enemy[0] == "slime") ctx.drawImage(slime, Math.floor(enemyAnim[a]) * 64, 0, 64, 64, x, y, 64, 64);
		if (enemy[0] == "smallSlime") ctx.drawImage(smallSlime, Math.floor(enemyAnim[a]) * 64, 0, 64, 64, x, y, 64, 64);
		enemyAnim[a] += (Math.random() + 0.5) * 0.1;
		percentage = enemy[1] / enemy[2];
		if (percentage < 0) frame = 0;
		else if (percentage > 1) frame = 62;
		else frame = percentage * 62;
		ctx.drawImage(healthBar, 0, Math.round(frame) * 11, 64, 12, x, y + 64, 64, 12);
		drawNumber(x + 25, y + 66, enemy[1], "left");
		drawNumber(x + 34, y + 66, enemy[2], "right");
	};
	ctx.drawImage(view, 0, 0);
	drawLore(1, 1, "floor: " + game.floor);
};

function drawNumber(x, y, num, position = "right") {
	num = Math.round(num);
	if (position == "right") {
		if (num >= 1000) {
			ctx.drawImage(numbers, Math.floor(num / 1000) * 6, 0, 5, 8, x, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 100 % 10) * 6, 0, 5, 8, x + 6, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 10 % 10) * 6, 0, 5, 8, x + 12, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x + 18, y, 5, 8);
		} else if (num >= 100) {
			ctx.drawImage(numbers, Math.floor(num / 100) * 6, 0, 5, 8, x, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 10 % 10) * 6, 0, 5, 8, x + 6, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x + 12, y, 5, 8);
		} else if (num >= 10) {
			ctx.drawImage(numbers, Math.floor(num / 10) * 6, 0, 5, 8, x, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x + 6, y, 5, 8);
		} else {
			ctx.drawImage(numbers, num * 6, 0, 5, 8, x, y, 5, 8);
		};
	} else if (position == "left") {
		if (num >= 1000) {
			ctx.drawImage(numbers, Math.floor(num / 1000) * 6, 0, 5, 8, x - 18, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 100 % 10) * 6, 0, 5, 8, x - 12, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 10 % 10) * 6, 0, 5, 8, x - 6, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x, y, 5, 8);
		} else if (num >= 100) {
			ctx.drawImage(numbers, Math.floor(num / 100) * 6, 0, 5, 8, x - 12, y, 5, 8);
			ctx.drawImage(numbers, Math.floor(num / 10 % 10) * 6, 0, 5, 8, x - 6, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x, y, 5, 8);
		} else if (num >= 10) {
			ctx.drawImage(numbers, Math.floor(num / 10) * 6, 0, 5, 8, x - 6, y, 5, 8);
			ctx.drawImage(numbers, num % 10 * 6, 0, 5, 8, x, y, 5, 8);
		} else {
			ctx.drawImage(numbers, num * 6, 0, 5, 8, x, y, 5, 8);
		};
	};
};

function drawLore(x, y, string) {
	for (let a = 0; a < string.length; a++) {
		index = string.charCodeAt(a);
		ctx.drawImage(letters, (index - 32) * 6, 0, 5, 10, x + (a * 6), y, 5, 10);
	};
};
