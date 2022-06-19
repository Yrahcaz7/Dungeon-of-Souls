/*
    Dungeon of Souls
    Copyright (C) 2022 Yrahcaz7

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
tempAnim = [0, "none", "normal", -1], playerAnim = [0, "idle"], invNum = -1;

const draw = {
	// basic
	image(image, x = 0, y = 0, width = +image.width, height = +image.height) {
		x = +x;
		y = +y;
		width = +width;
		height = +height;
		if (!image || (!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		ctx.drawImage(image, x * scale, y * scale, width * scale, height * scale);
	},
	imageSector(image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) {
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
	},
	rect(color, x = 0, y = 0, width = canvas.width, height = canvas.height) {
		color = "" + color;
		x = +x;
		y = +y;
		width = +width;
		height = +height;
		if (!color || (!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		ctx.fillStyle = color;
		ctx.fillRect(x, y, width, height);
	},
	// advanced
	bars(x, y, health, maxHealth, shield, maxShield) {
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
		draw.imageSector(bar.health, 0, Math.round(frame) * 11, 64, 12, x, y + 65, 64, 12);
		draw.lore(x + 25, y + 67, health, "black", "left");
		draw.lore(x + 34, y + 67, maxHealth, "black", "right");
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
		draw.imageSector(bar.shield, 0, Math.round(frame) * 11, 64, 12, x, y + 76, 64, 12);
		draw.lore(x + 25, y + 78, shield, "black", "left");
		draw.lore(x + 34, y + 78, maxShield, "black", "right");
	},
	card(_card, index, y, selected = false, overrideX = NaN) {
		let x = game.handPos[index], img = card.error, name = _card.name, type = _card.type;
		overrideX = +overrideX;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		if (name == "slash") {
			img = card.slash;
		} else if (name == "block") {
			img = card.block;
		} else {
			console.error("card " + index + " is invalid type: " + name);
		};
		if (name != "error") draw.image(card.back, x, y, 66, 98);
		if (type == "attack") draw.image(card._attack, x, y, 66, 98);
		if (type == "curse") draw.image(card._curse, x, y, 66, 98);
		if (type == "defense") draw.image(card._defense, x, y, 66, 98);
		if (type == "magic") draw.image(card._magic, x, y, 66, 98);
		if (selected) {
			if (_card.unplayable) draw.image(select.card_unplayable, x - 1, y - 1, 68, 100);
			else draw.image(select.card_normal, x - 1, y - 1, 68, 100);
		};
		draw.image(img, x, y, 66, 98);
	},
	lore(x, y, string, color = "black", position = "right", small = false) {
		if ((!x && x !== 0) || (!y && y !== 0) || string === null || string === undefined) return;
		let img = letters.black, enters = 0, enterIndex = 0;
		string = "" + string;
		if (color == "red") img = letters.red;
		else if (color == "white") img = letters.white;
		else if (color == "fade_0") img = letters.fade[0];
		else if (color == "fade_1") img = letters.fade[1];
		else if (color == "fade_2") img = letters.fade[2];
		for (let a = 0; a < string.length; a++) {
			let index = string.charCodeAt(a), len = string.length;
			if (index == 10) {
				enters++;
				enterIndex = a + 1;
			};
			if (enters) {
				a -= enterIndex;
				len -= enterIndex;
			};
			if (small) {
				if (position == "right") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 3), y + (enters * 5.5), 2.5, 5);
				} else if (position == "left") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + ((a - len + 1) * 3), y + (enters * 5.5), 2.5, 5);
				} else if (position == "center") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 3) - (len * 1.5) + 1, y + (enters * 5.5), 2.5, 5);
				};
			} else {
				if (position == "right") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 6), y + (enters * 11), 5, 10);
				} else if (position == "left") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + ((a - len + 1) * 6), y + (enters * 11), 5, 10);
				} else if (position == "center") {
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 6) - (len * 3) + 2, y + (enters * 11), 5, 10);
				};
			};
			if (enters) {
				a += enterIndex;
				len += enterIndex;
			};
		};
	},
	selector(x, y, width, height) {
		x = +x;
		y = +y;
		width = +width;
		height = +height;
		if ((!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		draw.image(select.selector[0], x - 2, y - 2);
		draw.image(select.selector[1], x + width - 6, y - 2);
		draw.image(select.selector[2], x - 2, y + height - 7);
		draw.image(select.selector[3], x + width - 6, y + height - 7);
	},
};

const startAnim = {
	player(type) {
		if (!type) return;
		type = "" + type;
		playerAnim = [0, type];
	},
	enemy(index, type) {
		if ((!index && index !== 0) || !type) return;
		tempAnim = [0, type, "normal", index];
		if (type == "slime_small_launch") {
			invNum = index;
		} else invNum = false;
	},
};

function backgrounds() {
	let now = new Date(Date.now()),
		time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()],
		clockX = 170,
		clockY = 63 - Math.round(backAnim[2]);
	time[2] += (time[3] / 1000);
	time[1] += (time[2] / 60);
	time[0] += (time[1] / 60);
	if (time[0] >= 12) time[0] = time[0] - 12;
	draw.image(cave);
	draw.rect("#10106080");
	draw.image(background);
	draw.image(floating_arch, 136, 34 - Math.round(backAnim[0]));
	draw.image(clock.face, clockX, clockY);
	draw.imageSector(clock.hour_hand, Math.floor((time[0]) * 82 / 12) * 24, 0, 24, 24, clockX + 18, clockY + 18);
	draw.imageSector(clock.min_hand, Math.floor((time[1]) * 80 / 60) * 34, 0, 34, 34, clockX + 13, clockY + 13);
	draw.image(clock.node, clockX + 26, clockY + 26);
	if (backAnim[0] >= 1) backAnim[1] = "down";
	else if (backAnim[0] <= -1) backAnim[1] = "up";
	if (backAnim[1] == "up") backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] == "down") backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (backAnim[2] >= 1) backAnim[3] = "down";
	else if (backAnim[2] <= -1) backAnim[3] = "up";
	if (backAnim[3] == "up") backAnim[2] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[3] == "down") backAnim[2] -= (Math.random() + 0.5) * 0.075;
};

function foregrounds() {
	draw.image(view);
	draw.image(help, 381, 3);
	if (game.select[0] == "help") draw.image(select.round, 380, 2);
    if (game.select[0] == "looker" && game.select[1] == 1) draw.imageSector(looker, 15, 0, 16, 16, 362, 3);
	else draw.imageSector(looker, 0, 0, 16, 16, 362, 3);
	if (game.select[0] == "looker") draw.image(select.round, 361, 2);
	draw.image(end, 3, 163);
	if (game.select[0] == "end") draw.image(select.round, 2, 162);
	draw.image(deck, 3, 182);
	if (game.select[0] == "deck") draw.image(select.deck, 2, 162);
    draw.lore(1, 1, "floor: " + game.floor, "red", "right");
};

function playerGraphics() {
	let x = 15, y = 30;
	if (playerAnim[1] == "idle") {
		draw.imageSector(player.idle, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	};
	if (playerAnim[1] == "attack") {
		draw.imageSector(player.attack, Math.floor(playerAnim[0]) * 120, 0, 120, 84, x, y, 120, 84);
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "attack_2") {
		draw.imageSector(player.attack_2, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "hit") {
		draw.imageSector(player.hit, 0, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	};
	if (playerAnim[1] == "shield") {
		draw.imageSector(player.shield, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	};
	draw.bars(x + 22, y + 15, game.health, game.maxHealth, game.shield, game.maxShield);
	let frame, en = game.energy, maxEn = game.maxEnergy, percentage = en / maxEn;
	if (percentage < 0) frame = 0;
	else if (percentage > 1) frame = 30;
	else frame = percentage * 30;
	if (en < 10 && maxEn >= 10) {
		en = "0" + en;
	};
	draw.imageSector(bar.energy, 0, Math.round(frame) * 31, 32, 32, x, y + 16, 32, 32);
	draw.lore(x + 9, y + 28, en, "black", "left");
	draw.lore(x + 18, y + 28, maxEn, "black", "right");
};

function enemyGraphics() {
	if (game.enemies.length > 6) {
		game.enemies.splice(6);
	};
	for (let index = 0; index < game.enemies.length; index++) {
        let enemy = game.enemies[index], pos = game.enemyPos[index];
        if (enemyAnim[index] >= 4) enemyAnim[index] = 0;
        if (index !== invNum) {
            if (enemy.type == "slime_big") {
                draw.imageSector(slime.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
            } else if (enemy.type == "slime_small") {
                draw.imageSector(slime.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
            };
        };
        enemyAnim[index] += (Math.random() + 0.5) * 0.1;
        draw.bars(pos[0], pos[1], enemy.health, enemy.maxHealth, enemy.shield, enemy.maxShield);
    };
    if (tempAnim[3] == -1) return;
	let pos = game.enemyPos[tempAnim[3]];
	if (tempAnim[1] == "slime_small_launch") {
		if (tempAnim[0] >= 10) {
			let phase = ((tempAnim[0] - 9) / 10),
			posX = Math.round(((game.enemyPos[tempAnim[3]][0] - 68) - 64) * phase),
			posY = Math.round(((game.enemyPos[tempAnim[3]][1] - (50 + 10))) * phase);
			draw.imageSector(slime.small_launch, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
		} else draw.imageSector(slime.small_launch, Math.floor(tempAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
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

function renderCards() {
    if (game.select[0] == "attack_enemy") {
        draw.card(game.enemyAtt, 0, 52, true, 104);
    };
    if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") return;
	let temp = -1;
	for (let index = 0; index < game.hand.length; index++) {
		let card = game.hand[index];
		if (game.select[0] == "hand" && game.select[1] == index) {
			temp = index;
		} else {
			draw.card(card, index, 146 - Math.floor(cardAnim[index]));
		};
	};
	if (temp != -1) {
        draw.card(game.hand[temp], temp, 146 - Math.floor(cardAnim[temp]), true);
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
		draw.lore(game.handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1], notif[2], color, "center");
		notif[1]++;
		if (notif[1] > 11) notif = [-1, 0];
	};
};

function target() {
	if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
        enemyType = game.enemies[game.select[1]].type;
        pos = game.enemyPos[game.select[1]];
        if (enemyType == "slime_small") {
            draw.selector(pos[0] + 19, pos[1] + 35, 26, 29);
            draw.lore(pos[0] + 32, pos[1] + 28, "small slime", "white", "center", true);
        } else if (enemyType == "slime_big") {
            draw.selector(pos[0] + 5, pos[1] + 25, 54, 39);
            draw.lore(pos[0] + 32, pos[1] + 18, "big slime", "white", "center", true);
        };
    };
};
