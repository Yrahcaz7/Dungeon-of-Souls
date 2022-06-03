const slime = new Image;

const healthBar = new Image;

var slimeFrame = 0;

slime.src = "images/slime.png";

healthBar.src = "images/healthBar.png";

function spawnEnemies() {
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
		if (enemy[0] == 'slime') {
			spawnSlime(x, y);
			drawHealth(x, y + 64, enemy[2] / enemy[1] * 100);
		};
	};
};

function spawnSlime(x, y) {
	if (slimeFrame >= 4) slimeFrame = 0;
	ctx.drawImage(slime, Math.floor(slimeFrame) * 64, 0, 64, 64, x, y, 64, 64);
	slimeFrame += 0.1;
};

function drawHealth(x, y, percentage) {
	if (percentage < 0) frame = 0;
	else if (percentage > 100) frame = 62;
	else frame = percentage * 0.62;
	ctx.drawImage(healthBar, 0, Math.round(frame) * 12, 64, 13, x, y, 64, 13);
};
