const HourConvert = 82 / 12, // number of frames divided by number of hours on a clock (12)
MinConvert = 80 / 60; // number of frames divided by number of minutes in an hour

var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
tempAnim = [0, "none", "normal", -1], playerAnim = [0, "idle"], invNum = -1;

function select(x, y, width, height) {
	ctx.drawImage(selector[0], x - 2, y - 2);
	ctx.drawImage(selector[1], x + width - 6, y - 2);
	ctx.drawImage(selector[2], x - 2, y + height - 7);
	ctx.drawImage(selector[3], x + width - 6, y + height - 7);
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
	ctx.drawImage(cave, 0, 0, width, height);
	ctx.drawImage(shade, 0, 0, width, height);
	ctx.drawImage(background, 0, 0, width, height);
	ctx.drawImage(floating_arch, 136, 34 - Math.round(backAnim[0]));
	ctx.drawImage(clock_face, clockX, clockY);
	ctx.drawImage(clock_hour_hand, Math.floor((time[0]) * HourConvert) * 24, 0, 24, 24, clockX + 18, clockY + 18, 24, 24);
	ctx.drawImage(clock_min_hand, Math.floor((time[1]) * MinConvert) * 34, 0, 34, 34, clockX + 13, clockY + 13, 34, 34);
	ctx.drawImage(clock_node, clockX + 26, clockY + 26);
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
    ctx.drawImage(view, 0, 0);
    if (game.select[0] == "help") ctx.drawImage(select_round, width - 20, 2);
    if (game.select[0] == "looker") ctx.drawImage(select_round, width - 39, 2);
    ctx.drawImage(help, width - 19, 3);
    if (game.select[0] == "looker" && game.select[1] == 1) ctx.drawImage(looker, 15, 0, 16, 16, width - 38, 3, 16, 16);
	else ctx.drawImage(looker, 0, 0, 16, 16, width - 38, 3, 16, 16);
    drawLore(1, 1, "floor: " + game.floor, "red", "right");
};

function bars(x, y, health, maxHealth, shield, maxShield) {
	if (health === null || health === undefined || maxHealth === null || maxHealth === undefined) return;
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
	ctx.drawImage(health_bar, 0, Math.round(frame) * 11, 64, 12, x, y + 65, 64, 12);
	drawLore(x + 25, y + 67, health, "black", "left");
	drawLore(x + 34, y + 67, maxHealth, "black", "right");
	if (shield === null || shield === undefined || maxShield === null || maxShield === undefined || shield < 1) return;
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
	ctx.drawImage(shield_bar, 0, Math.round(frame) * 11, 64, 12, x, y + 76, 64, 12);
	drawLore(x + 25, y + 78, shield, "black", "left");
	drawLore(x + 34, y + 78, maxShield, "black", "right");
};

function startPlayerAnim(type) {
	if (type === null || type === undefined) return;
	type = "" + type;
	playerAnim = [0, type];
};

function player() {
	let x = 15, y = centerY - 20;
	if (playerAnim[1] == "idle") {
		ctx.drawImage(player_idle, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	};
	if (playerAnim[1] == "attack") {
		ctx.drawImage(player_attack, Math.floor(playerAnim[0]) * 120, 0, 120, 84, x, y, 120, 84);
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "attack_2") {
		ctx.drawImage(player_attack_2, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "hit") {
		ctx.drawImage(player_hit, 0, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "shield") {
		ctx.drawImage(player_shield, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
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
	ctx.drawImage(energy, 0, Math.round(frame) * 31, 32, 32, x, y + 16, 32, 32);
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
                ctx.drawImage(slime_big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
            } else if (enemy.type == "slime_small") {
                ctx.drawImage(slime_small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
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
				posY = Math.round(((y - (centerY + 10))) * phase);
			ctx.drawImage(slime_small_launch, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
		} else ctx.drawImage(slime_small_launch, Math.floor(tempAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
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
    let x = game.handPos[index];
    overrideX = +overrideX;
    if (overrideX !== null && overrideX !== undefined && overrideX === overrideX) x = overrideX;
	if (type == "slash") {
		ctx.drawImage(card_slash, x, y);
	};
	if (type == "block") {
		ctx.drawImage(card_block, x, y);
	};
};

function renderCards() {
    if (game.select[0] == "attack_enemy") {
        showCard(game.enemyAtt, 0, height / 2 - 48, 104);
        ctx.drawImage(select_card, 103, height / 2 - 48 - 1);
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
		ctx.drawImage(select_card, game.handPos[temp] - 1, height - 54 - 1 - Math.floor(cardAnim[temp]));
        showCard(game.hand[temp], temp, height - 54 - Math.floor(cardAnim[temp]));
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
		drawLore(game.handPos[notif[0]] + 32, height - 54 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1], "not enough energy", color, "center");
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
            drawLore(pos[0] + 32, pos[1] + 24, "small slime", "white", "center");
        } else if (enemyType == "slime_big") {
            select(pos[0] + 5, pos[1] + 25, 54, 39);
            drawLore(pos[0] + 32, pos[1] + 14, "big slime", "white", "center");
        };
    };
};

function drawLore(x, y, string, color = "black", position = "right") {
	if (string === null || string === undefined) return;
	let img = letters_black;
	string = "" + string;
	if (color == "red") img = letters_red;
    else if (color == "white") img = letters_white;
	else if (color == "fade_0") img = letters_fade[0];
	else if (color == "fade_1") img = letters_fade[1];
	else if (color == "fade_2") img = letters_fade[2];
	for (let a = 0; a < string.length; a++) {
		index = string.charCodeAt(a);
		if (position == "right") {
			ctx.drawImage(img, (index - 32) * 6, 0, 5, 10, x + (a * 6), y, 5, 10);
		} else if (position == "left") {
			ctx.drawImage(img, (index - 32) * 6, 0, 5, 10, x + ((a - string.length + 1) * 6), y, 5, 10);
		} else if (position == "center") {
			ctx.drawImage(img, (index - 32) * 6, 0, 5, 10, x + (a * 6) - (string.length * 3), y, 5, 10);
		};
	};
};
