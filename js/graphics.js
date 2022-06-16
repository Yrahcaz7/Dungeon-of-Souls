var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
tempAnim = [0, "none", "normal", -1], playerAnim = [0, "idle"], invNum = -1;

function draw(image, x = 0, y = 0, w = +image.width, h = +image.height) {
	x = +x;
	y = +y;
	w = +w;
	h = +h;
	if (!image || (!x && x !== 0) || (!y && y !== 0) || !w || !h) return;
	ctx.drawImage(image, x * scale, y * scale, w * scale, h * scale);
};

function advDraw(image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) {
	sx = +sx;
	sy = +sy;
	sw = +sw;
	sh = +sh;
	dx = +dx;
	dy = +dy;
	dw = +dw;
	dh = +dh;
	if (!image || (!sx && sx !== 0) || (!sy && sy !== 0) || !sw || !sh || (!dx && dx !== 0) || (!dy && dy !== 0) || !dw || !dh) return;
	ctx.drawImage(image, sx, sy, sw, sh, dx * scale, dy * scale, dw * scale, dh * scale);
};

function select(x, y, width, height) {
	x = +x;
	y = +y;
	width = +width;
	height = +height;
	if ((!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
	draw(selector[0], x - 2, y - 2);
	draw(selector[1], x + width - 6, y - 2);
	draw(selector[2], x - 2, y + height - 7);
	draw(selector[3], x + width - 6, y + height - 7);
};

function renderRoom() {
	let now = new Date(Date.now()),
		time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()],
		clockX = 170,
		clockY = 63 - Math.round(backAnim[2]);
	time[2] += (time[3] / 1000);
	time[1] += (time[2] / 60);
	time[0] += (time[1] / 60);
	if (time[0] >= 12) time[0] = time[0] - 12;
	draw(cave);
	draw(shade);
	draw(background);
	draw(floating_arch, 136, 34 - Math.round(backAnim[0]));
	draw(clock_face, clockX, clockY);
	advDraw(clock_hour_hand, Math.floor((time[0]) * 82 / 12) * 24, 0, 24, 24, clockX + 18, clockY + 18);
	advDraw(clock_min_hand, Math.floor((time[1]) * 80 / 60) * 34, 0, 34, 34, clockX + 13, clockY + 13);
	draw(clock_node, clockX + 26, clockY + 26);
	if (backAnim[0] >= 1) backAnim[1] = "down";
	else if (backAnim[0] <= -1) backAnim[1] = "up";
	if (backAnim[1] == "up") backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] == "down") backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (backAnim[2] >= 1) backAnim[3] = "down";
	else if (backAnim[2] <= -1) backAnim[3] = "up";
	if (backAnim[3] == "up") backAnim[2] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[3] == "down") backAnim[2] -= (Math.random() + 0.5) * 0.075;
	if (game.enemies.length > 6) {
		game.enemies.splice(6);
	};
	if (game.select[0] != "looker" || !game.select[1]) {
		enemies();
	};
	draw(view);
    if (game.select[0] == "help") draw(select_round, 380, 2);
    if (game.select[0] == "looker") draw(select_round, 361, 2);
	draw(help, 381, 3);
    if (game.select[0] == "looker" && game.select[1] == 1) advDraw(looker, 15, 0, 16, 16, 362, 3);
	else advDraw(looker, 0, 0, 16, 16, 362, 3);
    drawLore(1, 1, "floor: " + game.floor, "red", "right");
};

function bars(x, y, health, maxHealth, shield, maxShield) {
	x = +x; y = +y; health = +health; maxHealth = +maxHealth; shield = +shield; maxShield = +maxShield;
	if ((!x && x !== 0) || (!y && y !== 0) || (!health && health !== 0) || !maxHealth) return;
	let frame, percentage = health / maxHealth;
	if (percentage < 0) frame = 0;
	else if (percentage > 1) frame = 62;
	else frame = percentage * 62;
	if (health < 10 && maxHealth >= 10) {
		health = "0" + health;
		if (maxHealth >= 100) health = "0" + health;
		if (maxHealth >= 1000) health = "0" + health;
	} else if (health < 100 && maxHealth >= 100) {
		health = "0" + health;
		if (maxHealth >= 1000) health = "0" + health;
	} else if (health < 1000 && maxHealth >= 1000) {
		health = "0" + health;
	};
	advDraw(health_bar, 0, Math.round(frame) * 11, 64, 12, x, y + 65, 64, 12);
	drawLore(x + 25, y + 67, health, "black", "left");
	drawLore(x + 34, y + 67, maxHealth, "black", "right");
	if (!shield || !maxShield) return;
	percentage = shield / maxShield;
	if (percentage < 0) frame = 0;
	else if (percentage > 1) frame = 62;
	else frame = percentage * 62;
	if (shield < 10 && maxShield >= 10) {
		shield = "0" + shield;
		if (maxShield >= 100) shield = "0" + shield;
		if (maxShield >= 1000) shield = "0" + shield;
	} else if (shield < 100 && maxShield >= 100) {
		shield = "0" + shield;
		if (maxShield >= 1000) shield = "0" + shield;
	} else if (shield < 1000 && maxShield >= 1000) {
		shield = "0" + shield;
	};
	advDraw(shield_bar, 0, Math.round(frame) * 11, 64, 12, x, y + 76, 64, 12);
	drawLore(x + 25, y + 78, shield, "black", "left");
	drawLore(x + 34, y + 78, maxShield, "black", "right");
};

function startPlayerAnim(type) {
	if (type === null || type === undefined) return;
	type = "" + type;
	playerAnim = [0, type];
};

function player() {
	let x = 15, y = 30;
	if (playerAnim[1] == "idle") {
		advDraw(player_idle, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	};
	if (playerAnim[1] == "attack") {
		advDraw(player_attack, Math.floor(playerAnim[0]) * 120, 0, 120, 84, x, y, 120, 84);
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "attack_2") {
		advDraw(player_attack_2, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "hit") {
		advDraw(player_hit, 0, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "shield") {
		advDraw(player_shield, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	};
	bars(x + 22, y + 15, game.health, game.maxHealth, game.shield, game.maxShield);
	let frame, en = game.energy, maxEn = game.maxEnergy, percentage = en / maxEn;
	if (percentage < 0) frame = 0;
	else if (percentage > 1) frame = 30;
	else frame = percentage * 30;
	if (en < 10 && maxEn >= 10) {
		en = "0" + en;
	};
	advDraw(energy, 0, Math.round(frame) * 31, 32, 32, x, y + 16, 32, 32);
	drawLore(x + 9, y + 28, en, "black", "left");
	drawLore(x + 18, y + 28, maxEn, "black", "right");
};

function startEnemyAnim(index, type) {
	if (index === null || index === undefined || type === null || type === undefined) return;
	tempAnim = [0, type, "normal", index];
	if (type == "slime_small_launch") {
		invNum = index;
	} else invNum = false;
};

function enemies() {
	for (let index = 0; index < game.enemies.length; index++) {
        let enemy = game.enemies[index], pos = game.enemyPos[index];
        if (enemyAnim[index] >= 4) enemyAnim[index] = 0;
        if (index !== invNum) {
            if (enemy.type == "slime_big") {
                advDraw(slime_big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
            } else if (enemy.type == "slime_small") {
                advDraw(slime_small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
            };
        };
        enemyAnim[index] += (Math.random() + 0.5) * 0.1;
        bars(pos[0], pos[1], enemy.health, enemy.maxHealth, enemy.shield, enemy.maxShield);
    };
    if (tempAnim[3] == -1) return;
	let pos = game.enemyPos[tempAnim[3]];
	if (tempAnim[1] == "slime_small_launch") {
		if (tempAnim[0] >= 10) {
			let phase = ((tempAnim[0] - 9) / 10),
			posX = Math.round(((x - 68) - 64) * phase),
			posY = Math.round(((y - (50 + 10))) * phase);
			advDraw(slime_small_launch, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
		} else advDraw(slime_small_launch, Math.floor(tempAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
		if (tempAnim[2] == "normal") tempAnim[0]++;
		else if (tempAnim[2] == "backwards") tempAnim[0]--;
		if (tempAnim[0] >= 20) {
			tempAnim[0] = 18;
			tempAnim[2] = "backwards";
		} else if (tempAnim[0] < 0) {
			tempAnim = [0, "none", "normal", -1];
			enemyAnim[tempAnim[3]] = 0;
		};
		invNum = tempAnim[3];
	} else invNum = false;
};

function showCard(type, index, y, overrideX = NaN) {
    let x = game.handPos[index], img;
    overrideX = +overrideX;
    if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
	if (type == "slash") {
		img = card_slash;
	} else if (type == "block") {
		img = card_block;
	} else {
		console.error("card " + index + " is invalid type: " + type);
		console.log("displaying default image... note: this bugged card is unplayable.");
		img = card_slash;
	};
	draw(img, x, y, 66, 98);
};

function renderCards() {
    if (game.select[0] == "attack_enemy") {
        showCard(game.enemyAtt, 0, 52, 104);
		draw(select_card, 103, 52 - 1);
    };
    if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") return;
	let temp = -1;
	for (let index = 0; index < game.hand.length; index++) {
		let card = game.hand[index];
		if (game.select[0] == "hand" && game.select[1] == index) {
			temp = index;
		} else {
			showCard(card, index, 146 - Math.floor(cardAnim[index]));
		};
	};
	if (temp != -1) {
		draw(select_card, game.handPos[temp] - 1, 146 - 1 - Math.floor(cardAnim[temp]));
        showCard(game.hand[temp], temp, 146 - Math.floor(cardAnim[temp]));
        if (cardAnim[temp] < 44) cardAnim[temp] += 7 + Math.random();
        if (cardAnim[temp] > 44) cardAnim[temp] = 44;
    };
    for (let index = 0; index < game.hand.length; index++) {
        if (index == temp) {
            continue;
        } else {
            if (cardAnim[index] > 0) cardAnim[index] -= 6 + Math.random();
            if (cardAnim[index] < 0) cardAnim[index] = 0;
        };
    };
	if (notif[0] != -1) {
		let color = "red";
		if (notif[1] >= 9) color = "fade_2";
		else if (notif[1] >= 7) color = "fade_1";
		else if (notif[1] >= 5) color = "fade_0";
		drawLore(game.handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1], "not enough energy", color, "center");
		notif[1]++;
		if (notif[1] > 11) notif = [-1, 0];
	};
};

function target() {
	if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
        enemyType = game.enemies[game.select[1]].type;
        pos = game.enemyPos[game.select[1]];
        if (enemyType == "slime_small") {
            select(pos[0] + 19, pos[1] + 35, 26, 29);
            drawLore(pos[0] + 32, pos[1] + 28, "small slime", "white", "center", true);
        } else if (enemyType == "slime_big") {
            select(pos[0] + 5, pos[1] + 25, 54, 39);
            drawLore(pos[0] + 32, pos[1] + 18, "big slime", "white", "center", true);
        };
    };
};

function drawLore(x, y, string, color = "black", position = "right", small = false) {
	if ((!x && x !== 0) || (!y && y !== 0) || string === null || string === undefined) return;
	let img = letters_black;
	string = "" + string;
	if (color == "red") img = letters_red;
    else if (color == "white") img = letters_white;
	else if (color == "fade_0") img = letters_fade[0];
	else if (color == "fade_1") img = letters_fade[1];
	else if (color == "fade_2") img = letters_fade[2];
	for (let a = 0; a < string.length; a++) {
		index = string.charCodeAt(a);
		if (small) {
			if (position == "right") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + (a * 3), y, 2.5, 5);
			} else if (position == "left") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + ((a - string.length + 1) * 3), y, 2.5, 5);
			} else if (position == "center") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + (a * 3) - (string.length * 1.5), y, 2.5, 5);
			};
		} else {
			if (position == "right") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + (a * 6), y, 5, 10);
			} else if (position == "left") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + ((a - string.length + 1) * 6), y, 5, 10);
			} else if (position == "center") {
				advDraw(img, (index - 32) * 6, 0, 5, 10, x + (a * 6) - (string.length * 3), y, 5, 10);
			};
		};
	};
};
