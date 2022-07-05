/*
	Dungeon of Souls
	Copyright (C) 2022 Yrahcaz7

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
tempAnim = [0, "none", "normal", -1], playerAnim = [0, "idle"], invNum = -1, popups = [];

String.prototype.title = function() {
	let result = "";
	for (let num = 0; num < this.length; num++) {
		if (num == 0 || this.charAt(num - 1) == " " || this.charAt(num - 1) == "\n") result += this.charAt(num).toUpperCase();
		else result += this.charAt(num);
	};
	return result;
};

const draw = {
	// basic - first order
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
	rect(color, x = 0, y = 0, width = canvas.width / scale, height = canvas.height / scale) {
		color = "" + color;
		x = +x;
		y = +y;
		width = +width;
		height = +height;
		if (!color || (!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		ctx.fillStyle = color;
		ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
	},
	// complex - second order (uses basic)
	lore(x, y, string, color = "black", position = "right", small = false) {
		x = +x;
		y = +y;
		string = "" + string;
		if ((!x && x !== 0) || (!y && y !== 0) || !string) return;
		let img = letters.black, enters = 0, enterIndex = 0, len = string.length;
		if (color == "red") img = letters.red;
		else if (color == "white") img = letters.white;
		else if (color == "fade_0") img = letters.fade[0];
		else if (color == "fade_1") img = letters.fade[1];
		else if (color == "fade_2") img = letters.fade[2];
		for (let a = 0; a < string.length; a++) {
			let index = string.charCodeAt(a);
			if (string.includes("\n", enterIndex + 1)) {
				len = string.indexOf("\n", enterIndex + 1);
			};
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
	// fractal - third order (uses complex and basic)
	bars(x, y, health, maxHealth, shield, maxShield) {
		x = +x;
		y = +y;
		health = +health;
		maxHealth = +maxHealth;
		shield = +shield;
		maxShield = +maxShield;
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
	card(cardObject, index, y, selected = false, overrideX = NaN) {
		if (!(cardObject instanceof Object)) cardObject = new Card("" + cardObject);
		index = +index;
		y = +y;
		selected = !!selected;
		overrideX = +overrideX;
		if (!cardObject || (!index && index !== 0) || (!y && y !== 0)) return;
		let x = game.handPos[index], img = card.error, name = cardObject.name, type = cardObject.type;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		if (name == "slash") img = card.slash;
		else if (name == "block") img = card.block;
		else if (name == "reinforce") img = card.reinforce;
		else if (name == "aura blade") img = card.aura_blade;
		else console.error("card " + index + " is invalid type: " + name);
		if (name != "error") draw.image(card.back, x + 2, y + 2);
		if (type == "attack") draw.image(card.outline.attack, x + 3, y + 3);
		else if (type == "curse") draw.image(card.outline.curse, x + 3, y + 3);
		else if (type == "defense") draw.image(card.outline.defense, x + 3, y + 3);
		else if (type == "magic") draw.image(card.outline.magic, x + 3, y + 3);
		if (selected) {
			if (cardObject.unplayable) draw.image(select.card_unplayable, x + 1, y + 1);
			else draw.image(select.card_normal, x - 1, y - 1);
		};
		if (img == card.error) draw.image(card.error, x + 2, y + 2);
		else draw.image(img, x + 7, y + 7);
		if (cardObject.name.length >= 11) {
			draw.lore(x + 32, y + 44, cardObject.name.title(), "black", "center", true);
		} else {
			draw.lore(x + 32, y + 42, cardObject.name.title(), "black", "center");
		};
		draw.lore(x + 6, y + 55, cardObject.text, "black", "right", true);
		draw.lore(x + 33, y + 89.5, cardObject.rarity + "|" + cardObject.type, "black", "center", true);
		if (!cardObject.unplayable) {
			draw.image(card._energy, x, y);
			draw.lore(x + 4, y + 2, cardObject.energyCost);
		};
	},
	textBox(x, y, width, string, textColor = "black", position = "right", small = false, boxColor = "#cccccc", outlineColor = "#000000") {
		x = +x;
		y = +y;
		width = +width;
		string = "" + string;
		if ((!x && x !== 0) || (!y && y !== 0) || !width || !string) return;
		var lines = (string.match(/\n/g) || []).length, height = small?7:12;
		if (small) {
			width = Math.ceil(width * 3 + 0.5);
			height = Math.ceil(lines * 5.5 + 7);
		} else {
			width = width * 6;
			height = lines * 11 + 12;
		};
		draw.rect(outlineColor, x, y, width + 3, height + 2);
		draw.rect(boxColor, x + 1, y + 1, width + 1, height);
		draw.lore(x + 2, y + 2, string, textColor, position, small);
	},
};

const startAnim = {
	player(type) {
		type = "" + type;
		if (!type) return;
		if (game.auraBlades && (type == "attack" || type == "attack_2")) type += "_aura";
		playerAnim = [0, type];
	},
	enemy(index, type) {
		index = +index;
		type = "" + type;
		if ((!index && index !== 0) || !type) return;
		tempAnim = [0, type, "normal", index];
		if (type == "slime_small_launch") {
			invNum = index;
		} else invNum = -1;
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
	draw.image(extra.help, 381, 3);
	if (game.select[0] == "looker" && game.select[1] == 1) draw.imageSector(extra.looker, 15, 0, 16, 16, 362, 3);
	else draw.imageSector(extra.looker, 0, 0, 16, 16, 362, 3);
	if (!game.music) draw.imageSector(extra.music, 15, 0, 16, 16, 343, 3);
	else draw.imageSector(extra.music, 0, 0, 16, 16, 343, 3);
	draw.image(extra.end, 3, 163);
	draw.image(extra.deck, 3, 182);
	draw.image(extra.discard, 383, 182);
	if (game.select[0] == "help") draw.image(select.round, 380, 2);
	else if (game.select[0] == "looker") draw.image(select.round, 361, 2);
	else if (game.select[0] == "music") draw.image(select.round, 342, 2);
	else if (game.select[0] == "end") draw.image(select.round, 2, 162);
	else if (game.select[0] == "deck") draw.image(select.deck, 2, 181);
	else if (game.select[0] == "discard") draw.image(select.discard, 382, 181);
	draw.lore(1, 1, "floor: " + game.floor, "red", "right");
};

function playerGraphics() {
	let x = 15, y = 30;
	if (game.reinforces) {
		if (game.shield) {
			draw.image(icon.reinforce, x + 23, y + 104);
			draw.lore(x + 34, y + 112, game.reinforces, "white", "left");
		} else {
			draw.image(icon.reinforce, x + 23, y + 93);
			draw.lore(x + 34, y + 101, game.reinforces, "white", "left");
		};
	};
	if (game.auraBlades) {
		if (game.reinforces) x += 17;
		if (game.shield) {
			draw.image(icon.aura_blade, x + 23, y + 104);
			draw.lore(x + 34, y + 112, game.auraBlades, "white", "left");
		} else {
			draw.image(icon.aura_blade, x + 23, y + 93);
			draw.lore(x + 34, y + 101, game.auraBlades, "white", "left");
		};
		if (game.reinforces) x -= 17;
		for (let blade = 1; blade <= game.auraBlades && blade <= 4; blade++) {
			draw.image(aura_blade, x + game.auraBladePos[blade - 1][0], y + game.auraBladePos[blade - 1][1]);
		};
	};
	if (playerAnim[1] == "idle") {
		draw.imageSector(player.idle, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	} else if (playerAnim[1] == "attack") {
		draw.imageSector(player.attack, Math.floor(playerAnim[0]) * 120, 0, 120, 84, x, y, 120, 84);
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_aura") {
		draw.imageSector(player.attack_aura, Math.floor(playerAnim[0]) * 120, 0, 120, 84, x, y, 120, 84);
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_2") {
		draw.imageSector(player.attack_2, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_2_aura") {
		draw.imageSector(player.attack_2_aura, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "hit") {
		draw.imageSector(player.hit, 0, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "shield") {
		draw.imageSector(player.shield, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	} else if (playerAnim[1] == "shield_reinforced") {
		draw.imageSector(player.shield_reinforced, Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
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
			game.enemyStage = "middle";
		} else if (tempAnim[0] < 0) {
			tempAnim = [0, "none", "normal", -1];
			enemyAnim[tempAnim[3]] = 0;
			game.enemyStage = "end";
		} else {
			game.enemyStage = "pending";
		};
		invNum = tempAnim[3];
	} else invNum = -1;
};

function infoGraphics() {
	draw.rect("#000000cc");
	draw.image(extra.help, 381, 3);
	draw.image(select.round, 380, 2);
	draw.lore(1, 12, "Source can be found at \"https://github.com/Yrahcaz7/Dungeon-of-Souls\"", "red", "right", true);
	if (game.select[1] == 2) {
		draw.lore(1, 1, "Dungeon of Souls - Changelog", "red");
		draw.lore(1, 23, logTitles[0], "white");
		draw.lore(1, 72.5, logTitles[1], "white");
		draw.lore(1, 127.5, logTitles[2], "white");
		draw.lore(1, 34, changelog, "white", "right", true);
	} else {
		draw.lore(1, 1, "Dungeon of Souls - Overview", "red");
		draw.lore(1, 23, "Storyline:", "white");
		draw.lore(1, 67, "Controls:", "white");
		draw.lore(1, 100, "How to Play:", "white");
		draw.lore(1, 149.5, "An ominous feeling...", "white");
		draw.lore(1, 34, text, "white", "right", true);
	};
};

function deckGraphics(overrideName = "deck") {
	draw.rect("#000000cc");
	let tempDeck = JSON.parse(game.deckProxy).cardSort(), selected;
	if (overrideName == "discard") tempDeck = JSON.parse(game.discardProxy).cardSort();
	for (let x = 0, y = 0; x + (y * 6) < tempDeck.length; x++) {
		if (x == game.cardSelect[0] && y == game.cardSelect[1]) {
			selected = [x, y];
		} else {
			draw.card(tempDeck[x + (y * 6)], -1, 14 + (y * 98) - game.deckPos, false, 2 + (x * 66));
		};
		if (x >= 5) {
			x = -1;
			y++;
		};
	};
	if (selected) {
		draw.card(tempDeck[selected[0] + (selected[1] * 6)], -1, 14 + (selected[1] * 98) - game.deckPos, true, 2 + (selected[0] * 66));
	};
	target();
	if (game.deckMove == "up") {
		let speed = Math.abs(Math.round(((98 * selected[1]) - game.deckPos) / 20) - 5);
		if (game.deckPos <= (98 * selected[1]) - 5) game.deckPos += speed;
		else if (game.deckPos >= (98 * selected[1]) + 5) game.deckPos -= speed;
		else game.deckPos = (98 * selected[1]);
	} else if (game.deckMove == "down") {
		let speed = Math.abs(Math.round(((98 * (selected[1] - 1)) + 11 - game.deckPos) / 20) + 5);
		if (game.deckPos <= (98 * (selected[1] - 1)) + 11 - 5) game.deckPos += speed;
		else if (game.deckPos >= (98 * (selected[1] - 1)) + 12 + 5) game.deckPos -= speed;
		else game.deckPos = (98 * (selected[1] - 1)) + 11;
	};
	draw.rect("#00000044", 0, 0, 400, 13);
	draw.lore(200, 1, overrideName.title(), "white", "center");
	draw.rect("#ffffff", 1, 12, 398, 1);
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
			if (cardAnim[index] > 0) cardAnim[index] -= 6 + Math.random();
			if (cardAnim[index] < 0) cardAnim[index] = 0;
			draw.card(card, index, 146 - Math.floor(cardAnim[index]));
		};
	};
	if (temp != -1) {
		if (cardAnim[temp] < 44) cardAnim[temp] += 7 + Math.random();
		if (cardAnim[temp] > 44) cardAnim[temp] = 44;
		draw.card(game.hand[temp], temp, 146 - Math.floor(cardAnim[temp]), true);
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

function info(type, location = "player") {
	if (type == "reinforce") {
		if (location == "card") {
			let x = game.handPos[game.select[1]], y = 146 - Math.floor(cardAnim[game.select[1]]);
			if (game.select[1] == game.hand.length - 1 && game.hand.length >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.reinforce, "black", "right", true);
		} else if (location == "player") {
			let pos = 70, desc = "You have " + game.reinforces + " reinforce";
			if (game.reinforces >= 2) desc += "s.";
			else desc += ".";
			draw.textBox(84, pos, desc.length, desc, "black", "right", true);
			draw.textBox(84, pos + 11, 24, infoText.reinforce, "black", "right", true);
		} else if (location == "deck") {
			let x = 2 + (game.cardSelect[0] * 66), y = 14 + (game.cardSelect[1] * 98) - game.deckPos;
			if (game.cardSelect[0] >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.reinforce, "black", "right", true);
		};
	} else if (type == "aura blades") {
		if (location == "card") {
			let x = game.handPos[game.select[1]], y = 146 - Math.floor(cardAnim[game.select[1]]);
			if (game.select[1] == game.hand.length - 1 && game.hand.length >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.aura_blade, "black", "right", true);
		} else if (location == "player") {
			let pos = 70, desc = "You have " + game.auraBlades + " aura blade";
			if (game.reinforces) pos += 44;
			if (game.auraBlades >= 2) desc += "s.";
			else desc += ".";
			draw.textBox(84, pos, desc.length, desc, "black", "right", true);
			draw.textBox(84, pos + 11, 24, infoText.aura_blade, "black", "right", true);
		} else if (location == "deck") {
			let x = 2 + (game.cardSelect[0] * 66), y = 14 + (game.cardSelect[1] * 98) - game.deckPos;
			if (game.cardSelect[0] >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.aura_blade, "black", "right", true);
		};
	};
};

function target() {
	if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
		enemyType = game.enemies[game.select[1]].type;
		pos = game.enemyPos[game.select[1]];
		if (enemyType == "slime_small") {
			draw.selector(pos[0] + 19, pos[1] + 35, 26, 29);
			draw.lore(pos[0] + 31, pos[1] + 27.5, "small slime", "white", "center", true);
		} else if (enemyType == "slime_big") {
			draw.selector(pos[0] + 5, pos[1] + 25, 54, 39);
			draw.lore(pos[0] + 31, pos[1] + 17.5, "big slime", "white", "center", true);
		};
	} else if (game.select[0] == "lookat_you") {
		draw.selector(60, 72, 20, 39);
		if (game.character == "knight") {
			if (global.charStage.knight == 0) draw.lore(69, 64.5, "the forgotten one", "white", "center", true);
			else if (global.charStage.knight == 1) draw.lore(69, 64.5, "the true knight", "white", "center", true);
		};
		if (game.reinforces) {
			info("reinforce", "player");
		};
		if (game.auraBlades) {
			info("aura blades", "player");
		};
	} else if (game.select[0] == "hand") {
		let name = game.hand[game.select[1]].name;
		if (name == "reinforce") {
			info("reinforce", "card");
		};
		if (name == "aura blade") {
			info("aura blades", "card");
		};
	} else if (game.select[0] == "deck" && game.select[1] == 1) {
		let proxy = JSON.parse(game.deckProxy).cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)].name;
		if (proxy == "reinforce") {
			info("reinforce", "deck");
		};
		if (proxy == "aura blade") {
			info("aura blades", "deck");
		};
	} else if (game.select[0] == "discard" && game.select[1] == 1) {
		let proxy = JSON.parse(game.discardProxy).cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)].name;
		if (proxy == "reinforce") {
			info("reinforce", "deck");
		};
		if (proxy == "aura blade") {
			info("aura blades", "deck");
		};
	};
};

function showPopup(type, description) {
	type = "" + type;
	description = "" + description;
	if (!type || !description) return;
	popups.push([type, description, 400]);
};

function popupGraphics() {
	if (popups.length >= 8) {
		popups.splice(0, 1);
	};
	if (popups.length >= 1) {
		for (let a = 0; a < popups.length; a++) {
			let stopPoint = 400 - (popups[a][1].length * 6) - 13;
			if (popups[a][2] > stopPoint) popups[a][2] -= 5;
			if (popups[a][2] < stopPoint) popups[a][2] = stopPoint;
			draw.image(popup.back, popups[a][2], 150 - (a * 21));
			if (popups[a][0] == "music") draw.image(popup.music, popups[a][2] + 4, 150 - (a * 21) + 3);
			draw.lore(popups[a][2] + 13, 150 - (a * 21) + 8, popups[a][1]);
			if (game.select[0] == "popups" && game.select[1] == a) {
				draw.image(select.popup, popups[a][2] - 1, 150 - (a * 21) - 1);
			};
		};
	};
};
