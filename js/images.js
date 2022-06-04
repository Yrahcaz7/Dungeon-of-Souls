const slime_big = new Image, slime_small = new Image, // monsters

background = new Image, floating_arch = new Image, clock = new Image, // backrounds

health_bar = new Image, letters_black = new Image, letters_red = new Image, view = new Image; // other

var backAnim = [0, "up", 0.5, "down"], enemyAnim = [0, 1, 2, 3];

slime_big.src = "images/slime_big.png";

slime_small.src = "images/slime_small.png";

background.src = "images/background.png";

floating_arch.src = "images/floating_arch.png";

clock.src = "images/clock.png";

health_bar.src = "images/health_bar.png";

letters_black.src = "images/letters_black.png";

letters_red.src = "images/letters_red.png";

view.src = "images/view.png";

function spawnEnemies() {
	ctx.drawImage(background, 0, 0);
	ctx.drawImage(floating_arch, 86, 10 - Math.round(backAnim[0]));
	ctx.drawImage(clock, 120, 28 - Math.round(backAnim[2]));
	if (backAnim[0] >= 1) backAnim[1] = "down";
	else if (backAnim[0] <= -1) backAnim[1] = "up";
	if (backAnim[1] == "up") backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] == "down") backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (backAnim[2] >= 1) backAnim[3] = "down";
	else if (backAnim[2] <= -1) backAnim[3] = "up";
	if (backAnim[3] == "up") backAnim[2] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[3] == "down") backAnim[2] -= (Math.random() + 0.5) * 0.075;
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
		if (enemy[0] == "slime_big") {
			ctx.drawImage(slime_big, Math.floor(enemyAnim[a]) * 64, 0, 64, 64, x, y, 64, 64);
		} else if (enemy[0] == "slime_small") {
			ctx.drawImage(slime_small, Math.floor(enemyAnim[a]) * 64, 0, 64, 64, x, y, 64, 64);
		};
		enemyAnim[a] += (Math.random() + 0.5) * 0.1;
		percentage = enemy[1] / enemy[2];
		if (percentage < 0) frame = 0;
		else if (percentage > 1) frame = 62;
		else frame = percentage * 62;
		ctx.drawImage(health_bar, 0, Math.round(frame) * 11, 64, 12, x, y + 64, 64, 12);
		drawLore(x + 25, y + 66, enemy[1], "black", "left");
		drawLore(x + 34, y + 66, enemy[2], "black", "right");
	};
	ctx.drawImage(view, 0, 0);
	drawLore(1, 1, "floor: " + game.floor, "red", "right");
};

function drawLore(x, y, string, color = "black", position = "right") {
	if (string === null || string === undefined || string === NaN) return;
	string = "" + string;
	for (let a = 0; a < string.length; a++) {
		index = string.charCodeAt(a);
		if (color == "red") img = letters_red;
		else img = letters_black;
		if (position == "right") {
			ctx.drawImage(img, (index - 32) * 6, 0, 5, 10, x + (a * 6), y, 5, 10);
		} else if (position == "left") {
			ctx.drawImage(img, (index - 32) * 6, 0, 5, 10, x + ((a - string.length + 1) * 6), y, 5, 10);
		};
	};
};
