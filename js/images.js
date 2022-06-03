const slime = new Image;

const smallSlime = new Image;

const healthBar = new Image;

var animframe = [0, 1, 2, 3];

slime.src = "images/slime.png";

smallSlime.src = "images/smallSlime.png";

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
		if (animframe[a] >= 4) animframe[a] = 0;
		if (enemy[0] == 'slime') ctx.drawImage(slime, Math.floor(animframe[a]) * 64, 0, 64, 64, x, y, 64, 64);
		if (enemy[0] == 'smallSlime') ctx.drawImage(smallSlime, Math.floor(animframe[a]) * 64, 0, 64, 64, x, y, 64, 64);
		animframe[a] += (Math.random() + 0.5) * 0.1;
		percentage = enemy[2] / enemy[1] * 100;
		if (percentage < 0) frame = 0;
		else if (percentage > 100) frame = 62;
		else frame = percentage * 0.62;
		ctx.drawImage(healthBar, 0, Math.round(frame) * 11 - 10, 64, 12, x, y + 64, 64, 12);
	};
};
