const slime_big = new Image, slime_small = new Image, // monsters
	background = new Image, floating_arch = new Image, // backrounds
	clock_face = new Image, clock_hour_hand = new Image, clock_min_hand = new Image, clock_node = new Image, // the clock
	health_bar = new Image, letters_black = new Image, letters_red = new Image, view = new Image; // other

var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1, 2, 3];

slime_big.src = "images/slime_big.png";

slime_small.src = "images/slime_small.png";

background.src = "images/background.png";

floating_arch.src = "images/floating_arch.png";

clock_face.src = "images/clock_face.png";

clock_hour_hand.src = "images/clock_hour_hand.png";

clock_min_hand.src = "images/clock_min_hand.png";

clock_node.src = "images/clock_node.png";

health_bar.src = "images/health_bar.png";

letters_black.src = "images/letters_black.png";

letters_red.src = "images/letters_red.png";

view.src = "images/view.png";

const HourConvert = 82 / 12, // number of frames divided by number of hours on a clock (12)

MinConvert = 80 / 60; // number of frames divided by number of minutes in an hour

function renderRoom() {
	var now = new Date(Date.now()),
		time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()],
		centerY = height / 2 - 50;
	time[2] += (time[3] / 1000);
	time[1] += (time[2] / 60);
	time[0] += (time[1] / 60);
	if (time[0] >= 12) time[0] = time[0] - 12;
	ctx.drawImage(background, 0, 0);
	ctx.drawImage(floating_arch, 136, 42 - Math.round(backAnim[0]));
	ctx.drawImage(clock_face, 170, 71 - Math.round(backAnim[2]));
	ctx.drawImage(clock_hour_hand, Math.floor((time[0]) * HourConvert) * 24, 0, 24, 24, 188, 89 - Math.round(backAnim[2]), 24, 24);
	ctx.drawImage(clock_min_hand, Math.floor((time[1]) * MinConvert) * 34, 0, 34, 34, 183, 84 - Math.round(backAnim[2]), 34, 34);
	ctx.drawImage(clock_node, 196, 97 - Math.round(backAnim[2]));
	if (backAnim[0] >= 1) backAnim[1] = "down";
	else if (backAnim[0] <= -1) backAnim[1] = "up";
	if (backAnim[1] == "up") backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] == "down") backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (backAnim[2] >= 1) backAnim[3] = "down";
	else if (backAnim[2] <= -1) backAnim[3] = "up";
	if (backAnim[3] == "up") backAnim[2] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[3] == "down") backAnim[2] -= (Math.random() + 0.5) * 0.075;
	if (game.enemies.length > 6) {
		for (let a = 6; a < game.enemies.length; a++) {
			game.hiddenEnemies[a - 6] = game.enemies[a];
			game.enemies.splice(a, 1);
		};
	};
	for (let a = 0; a < game.enemies.length; a++) {
		enemy = game.enemies[a];
		if (a == 0) {
			x = width - 70;
			y = centerY;
		} else if (a == 1) {
			x = width - 140;
			y = centerY + 32;
		} else if (a == 2) {
			x = width - 140;
			y = centerY - 32;
		};
		if (game.enemies.length == 1) {
			x = width - 110;
			y = centerY;
		} else if (game.enemies.length == 2) {
			if (a == 0) {
				x = width - 70;
				y = centerY - 5;
			} else if (a == 1) {
				x = width - 140;
				y = centerY + 20;
			};
		} else if (game.enemies.length == 4) {
			if (a == 3) {
				x = width - 210;
				y = centerY;
			};
		} else if (game.enemies.length == 5) {
			if (a == 3) {
				x = width - 210;
				y = centerY + 32;
			} else if (a == 4) {
				x = width - 210;
				y = centerY - 32;
			};
		} else if (game.enemies.length == 6) {
			if (a == 3) {
				x = width - 210;
				y = centerY + 64;
			} else if (a == 4) {
				x = width - 210;
				y = centerY;
			} else if (a == 5) {
				x = width - 210;
				y = centerY - 64;
			};
		};
		x = Math.round(x);
		y = Math.round(y);
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
