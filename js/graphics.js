/*  Dungeon of Souls
 *  Copyright (C) 2022 Yrahcaz7
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

var backAnim = [0, "up", 0.5, "down", 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tempAnim = [0, "none", "normal", -1], effAnim = [0, "none"], playerAnim = [0, "idle"], starAnim = [0, 1.5, 3, 0.5, 2, 3.5], primeAnim = 0;
var invNum = -1, popups = [], infPos = 0, infLimit = 0;

const draw = {
	// basic - first order
	image(image, x = 0, y = 0, width = +image.width, height = +image.height) {
		if (!image || (!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		ctx.drawImage(image, x * scale, y * scale, width * scale, height * scale);
	},
	imageSector(image, sx, sy, sw, sh, dx, dy, dw = +sw, dh = +sh) {
		if (!image || (!sx && sx !== 0) || (!sy && sy !== 0) || !sw || !sh || (!dx && dx !== 0) || (!dy && dy !== 0) || !dw || !dh) return;
		ctx.drawImage(image, sx, sy, sw, sh, dx * scale, dy * scale, dw * scale, dh * scale);
	},
	rect(color, x = 0, y = 0, width = canvas.width / scale, height = canvas.height / scale) {
		if (!color || (!x && x !== 0) || (!y && y !== 0) || !width || !height) return;
		ctx.fillStyle = color;
		ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
	},
	line(x, y, x2, y2, color = "#000", width = 1) {
		if ((!x && x !== 0) || (!y && y !== 0) || (!x2 && x2 !== 0) || (!y2 && y2 !== 0)) return;
		ctx.beginPath();
		if (color) ctx.strokeStyle = color;
		else ctx.strokeStyle = "#000";
		if (width) ctx.lineWidth = width * scale;
		else ctx.lineWidth = 1 * scale;
		ctx.moveTo(x * scale, y * scale);
		ctx.lineTo(x2 * scale, y2 * scale);
		ctx.stroke();
	},
	// complex - second order (uses basic)
	lore(x, y, string, style = {"color": "black", "text-align": "right", "text-small": false}) {
		string = "" + string;
		if (!style["color"]) style["color"] = "black";
		if (!style["text-align"]) style["text-align"] = "right";
		if (!style["text-small"]) style["text-small"] = false;
		let color = style["color"];
		let position = style["text-align"];
		let small = style["text-small"];
		string = string.replace(/<br>/g, "\n");
		x = Math.round(x * 2) / 2;
		y = Math.round(y * 2) / 2;
		let img = letters.black, enters = 0, enterIndex = 0, len = string.replace(/<red>|<\/red>|<white>|<\/white>|<black>|<\/black>|<deep-red>|<\/deep-red>|<light-green>|<\/light-green>/g, "").length;
		if (color == "red") img = letters.red;
		else if (color == "white") img = letters.white;
		else if (color == "deep-red") img = letters.deep_red;
		else if (color == "light-green") img = letters.light_green;
		else if (color == "black_fade_0") img = letters.black_fade[0];
		else if (color == "black_fade_1") img = letters.black_fade[1];
		else if (color == "black_fade_2") img = letters.black_fade[2];
		else if (color == "red_fade_0") img = letters.red_fade[0];
		else if (color == "red_fade_1") img = letters.red_fade[1];
		else if (color == "red_fade_2") img = letters.red_fade[2];
		if (string.includes("<b>") || string.includes("<big>") || string.includes("<s>") || string.includes("<small>")) {
			string = string.replace(/<\/b>|<\/big>|<\/s>|<\/small>/g, "");
			let array = string.split("<");
			let space = 0;
			if (!array[0]) array.splice(0, 1);
			for (let index = 0; index < array.length; index++) {
				if (array[index].includes("s>") || array[index].includes("small>")) {
					array[index] = array[index].replace(/s>|small>/, "");
					space += draw.lore(x, y + space, array[index], {"color": color, "text-align": position, "text-small": true});
				} else if (array[index].includes("b>") || array[index].includes("big>")) {
					array[index] = array[index].replace(/b>|big>/, "");
					space += draw.lore(x, y + space, array[index], {"color": color, "text-align": position, "text-small": false});
				} else {
					space += draw.lore(x, y + space, array[index], style);
				};
			};
			return space;
		};
		if (string.includes("\n") && position != "right") {
			let array = string.split("\n");
			let space = 0;
			if (!array[0]) array.splice(0, 1);
			for (let index = 0; index < array.length; index++) {
				space += draw.lore(x, y + space, array[index], style);
			};
			return space;
		};
		let defImg = img;
		for (let a = 0; a < string.length; a++) {
			if (string.charAt(a) == "<") {
				if (string.indexOf("<red>") == a) {
					img = letters.red;
					string = string.replace("<red>", "");
				} else if (string.indexOf("<white>") == a) {
					img = letters.white;
					string = string.replace("<white>", "");
				} else if (string.indexOf("<black>") == a) {
					img = letters.black;
					string = string.replace("<black>", "");
				} else if (string.indexOf("<deep-red>") == a) {
					img = letters.deep_red;
					string = string.replace("<deep-red>", "");
				} else if (string.indexOf("<light-green>") == a) {
					img = letters.light_green;
					string = string.replace("<light-green>", "");
				} else if (img == letters.red && string.indexOf("</red>") == a) {
					img = defImg;
					string = string.replace("</red>", "");
				} else if (img == letters.white && string.indexOf("</white>") == a) {
					img = defImg;
					string = string.replace("</white>", "");
				} else if (img == letters.black && string.indexOf("</black>") == a) {
					img = defImg;
					string = string.replace("</black>", "");
				} else if (img == letters.deep_red && string.indexOf("</deep-red>") == a) {
					img = defImg;
					string = string.replace("</deep-red>", "");
				} else if (img == letters.light_green && string.indexOf("</light-green>") == a) {
					img = defImg;
					string = string.replace("</light-green>", "");
				};
			};
			let index = string.charCodeAt(a);
			if (string.replace(/<red>|<\/red>|<white>|<\/white>|<black>|<\/black>|<deep-red>|<\/deep-red>|<light-green>|<\/light-green>/g, "").includes("\n", enterIndex + 1)) {
				len = string.replace(/<red>|<\/red>|<white>|<\/white>|<black>|<\/black>|<deep-red>|<\/deep-red>|<light-green>|<\/light-green>/g, "").indexOf("\n", enterIndex + 1);
			};
			if (index == 10) {
				enters++;
				enterIndex = a + 1;
			};
			if (enters) {
				a -= enterIndex;
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
			};
		};
		return small?(enters+1)*5.5:(enters+1)*11;
	},
	selector(x, y, width, height) {
		draw.image(select.selector[0], x - 2, y - 2);
		draw.image(select.selector[1], x + width - 6, y - 2);
		draw.image(select.selector[2], x - 2, y + height - 7);
		draw.image(select.selector[3], x + width - 6, y + height - 7);
	},
	intent(x, y, effect, type) {
		let stage = 0;
		if (effect >= 125) stage = 10;
		else if (effect >= 100) stage = 9;
		else if (effect >= 75) stage = 8;
		else if (effect >= 55) stage = 7;
		else if (effect >= 40) stage = 6;
		else if (effect >= 30) stage = 5;
		else if (effect >= 20) stage = 4;
		else if (effect >= 15) stage = 3;
		else if (effect >= 10) stage = 2;
		else if (effect >= 5) stage = 1;
		else stage = 0;
		if (type == "attack") draw.image(intent.attack[stage], x, y);
		else if (type == "defend") draw.image(intent.defend[stage], x, y + 1);
	},
	box(x, y, width, height, style = {"background-color": "#ccc", "border-width": 1, "border-color": "#000"}) {
		if (!style["background-color"]) style["background-color"] = "#ccc";
		if (!style["border-width"]) style["border-width"] = 1;
		if (!style["border-color"]) style["border-color"] = "#000";
		draw.rect(style["background-color"], x, y, width, height);
		let val = style["border-width"];
		if (val) {
			let col = style["border-color"];
			draw.rect(col, x - val, y - val, width + val, val); // top
			draw.rect(col, x - val, y + height, width + val, val); // bottom
			draw.rect(col, x - val, y - val, val, height + val); // left
			draw.rect(col, x + width, y - val, val, height + (val * 2)); // right
		};
	},
	// fractal - third order (uses complex and basic)
	bars(x, y, health, maxHealth, shield, maxShield) {
		let cutoff, percentage = health / maxHealth;
		if (percentage < 0) cutoff = 0;
		else if (percentage > 1) cutoff = 62;
		else cutoff = Math.round(percentage * 62);
		if ((health < 10 && maxHealth >= 10) || (health < 100 && maxHealth >= 100) || (health < 1000 && maxHealth >= 1000)) {
			health = "0" + health;
		};
		draw.imageSector(bar.health_full, 0, 0, cutoff + 1, 12, x, y + 65);
		draw.imageSector(bar.health_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 65);
		draw.lore(x + 25, y + 67, health, {"text-align": "left"});
		draw.lore(x + 34, y + 67, maxHealth);
		if (!shield || !maxShield) return;
		percentage = shield / maxShield;
		if (percentage < 0) cutoff = 0;
		else if (percentage > 1) cutoff = 62;
		else cutoff = Math.round(percentage * 62);
		if ((shield < 10 && maxShield >= 10) || (shield < 100 && maxShield >= 100) || (shield < 1000 && maxShield >= 1000)) {
			shield = "0" + shield;
		};
		draw.imageSector(bar.shield_full, 0, 0, cutoff + 1, 12, x, y + 76);
		draw.imageSector(bar.shield_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 76);
		draw.lore(x + 25, y + 78, shield, {"text-align": "left"});
		draw.lore(x + 34, y + 78, maxShield);
	},
	card(cardObject, index, y, selected = false, overrideX = NaN) {
		if (!(cardObject instanceof Object)) cardObject = new Card("" + cardObject);
		let x = game.handPos[index], img = card.error;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		const rarity = cards[cardObject.name].rarity;
		if (rarity == 0) img = card.starter[cardObject.name];
		else if (rarity == 1) img = card.common[cardObject.name];
		else if (rarity == 2) img = card.rare[cardObject.name];
		if (cardObject.name != "error") draw.image(card.back, x + 2, y + 2);
		const type = cards[cardObject.name].attributes[0];
		if (type == "attack") draw.image(card.outline.attack, x + 3, y + 3);
		else if (type == "curse") draw.image(card.outline.curse, x + 3, y + 3);
		else if (type == "defense") draw.image(card.outline.defense, x + 3, y + 3);
		else if (type == "skill") draw.image(card.outline.skill, x + 3, y + 3);
		else if (type == "magic") draw.image(card.outline.magic, x + 3, y + 3);
		if (selected) {
			if (cards[cardObject.name].attributes.includes("unplayable")) {
				if (rarity == 2) draw.image(select.card_rare_unplayable, x - 3, y - 3);
				else draw.image(select.card_unplayable, x + 1, y + 1);
			} else {
				if (rarity == 2) draw.image(select.card_rare, x - 3, y - 3);
				else draw.image(select.card_normal, x - 1, y - 1);
			};
		};
		if (img == card.error) draw.image(card.error, x + 2, y + 2);
		else draw.image(img, x + 7, y + 7);
		if (cardObject.name.length >= 11) {
			draw.lore(x + 32, y + 44, cardObject.name.title(), {"text-align": "center", "text-small": true});
		} else {
			draw.lore(x + 32, y + 42, cardObject.name.title(), {"text-align": "center"});
		};
		let desc = cards[cardObject.name].desc;
		if (game.auraBlades) {
			desc = desc.replace(/([Dd]eal\s)(\d+)(\sdamage)/g, (substring, pre, number, post) => {
				return pre + "<light-green>" + (parseInt(number) + 5 + game.auraBlades) + "</light-green>" + post;
			});
		};
		draw.lore(x + 6, y + 55, desc, {"text-small": true});
		draw.lore(x + 33, y + 89.5, rarities[rarity] + "|" + type, {"text-align": "center", "text-small": true});
		if (rarity == 2) {
			draw.image(card.rarity.rare, x - 2, y - 2);
		};
		if (!cards[cardObject.name].attributes.includes("unplayable")) {
			draw.image(card.energy, x, y);
			draw.lore(x + 4, y + 2, cards[cardObject.name].cost);
		};
	},
	textBox(x, y, width, string, style = {"color": "black", "text-align": "right", "text-small": false, "background-color": "#ccc", "border-width": 1, "border-color": "#000"}) {
		if (!style["color"]) style["color"] = "black";
		if (!style["text-align"]) style["text-align"] = "right";
		if (!style["text-small"]) style["text-small"] = false;
		if (!style["background-color"]) style["background-color"] = "#ccc";
		if (!style["border-width"]) style["border-width"] = 1;
		if (!style["border-color"]) style["border-color"] = "#000";
		let small = style["text-small"];
		let position = style["text-align"];
		let lines = (string.match(/\n/g) || []).length, height = small?7:12;
		if (small) {
			width = Math.ceil(width * 3 + 0.5);
			height = Math.ceil(lines * 5.5 + 7);
		} else {
			width = width * 6;
			height = lines * 11 + 12;
		};
		draw.box(x, y, width, height, style);
		if (position == "center") {
			x += width / 2;
			if (small) x -= 1.5;
			else x -= 3;
		} else if (position == "left") {
			x += width;
			if (small) x -= 3;
			else x -= 6;
		};
		draw.lore(x + 1, y + 1, string, style);
	},
};

const startAnim = {
	player(type) {
		type = "" + type;
		if (!type) return;
		if (game.auraBlades && (type == "attack" || type == "attack_2")) type += "_aura";
		playerAnim = [0, type];
	},
	effect(type) {
		type = "" + type;
		if (!type) return;
		effAnim = [0, type];
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
	draw.image(background.cave);
	draw.rect("#10106080");
	draw.image(background.temple);
	draw.image(background.floating_arch, 136, 34 - Math.round(backAnim[0]));
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
	if (!global.options.music) draw.imageSector(extra.music, 15, 0, 16, 16, 343, 3);
	else draw.imageSector(extra.music, 0, 0, 16, 16, 343, 3);
	draw.image(extra.end, 3, 163);
	draw.image(extra.deck, 3, 182);
	draw.image(extra.discard, 383, 182);
	draw.image(extra.map, 2, 12);
	if (game.artifacts.includes("iron will")) {
		let index = game.artifacts.indexOf("iron will");
		draw.image(icon.iron_will, 20 + (index * 18), 12);
		if (game.select[0] == "artifacts" && game.select[1] == index) draw.image(select.iron_will, 19 + (index * 18), 11);
	};
	if (game.select[0] == "help") draw.image(select.round, 380, 2);
	else if (game.select[0] == "looker") draw.image(select.round, 361, 2);
	else if (game.select[0] == "music") draw.image(select.round, 342, 2);
	else if (game.select[0] == "end") draw.image(select.round, 2, 162);
	else if (game.select[0] == "deck") draw.image(select.deck, 2, 181);
	else if (game.select[0] == "discard") draw.image(select.discard, 382, 181);
	else if (game.select[0] == "map") draw.image(select.map, 1, 11);
	draw.lore(1, 1, "floor " + game.floor, {"color": "red"});
};

function playerGraphics() {
	let x = 15, y = 30;
	if (game.reinforces) {
		if (game.shield) {
			draw.image(icon.reinforce, x + 23, y + 104);
			draw.lore(x + 34, y + 112, game.reinforces, {"color": "white", "text-align": "left"});
		} else {
			draw.image(icon.reinforce, x + 23, y + 93);
			draw.lore(x + 34, y + 101, game.reinforces, {"color": "white", "text-align": "left"});
		};
	};
	if (game.auraBlades) {
		if (game.reinforces) x += 17;
		if (game.shield) {
			draw.image(icon.aura_blade, x + 23, y + 104);
			draw.lore(x + 34, y + 112, game.auraBlades, {"color": "white", "text-align": "left"});
		} else {
			draw.image(icon.aura_blade, x + 23, y + 93);
			draw.lore(x + 34, y + 101, game.auraBlades, {"color": "white", "text-align": "left"});
		};
		if (game.reinforces) x -= 17;
		for (let blade = 1; blade <= game.auraBlades && blade <= 4; blade++) {
			draw.image(aura_blade, x + game.auraBladePos[blade - 1][0], y + game.auraBladePos[blade - 1][1]);
		};
	};
	draw.imageSector(player[playerAnim[1]], Math.floor(playerAnim[0]) * 120, 0, 120, 80, x, y, 120, 80);
	if (playerAnim[1] == "idle") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	} else if (playerAnim[1] == "attack") {
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_aura") {
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_2") {
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_2_aura") {
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "shield") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	} else if (playerAnim[1] == "shield_reinforced") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	} else if (playerAnim[1] == "hit") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "death") {
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 10) playerAnim[0] = 9;
	};
	draw.bars(x + 22, y + 15, game.health, game.maxHealth, game.shield, game.maxShield);
	let cutoff, energy = game.energy, percentage = energy / game.maxEnergy;
	if (percentage < 0) cutoff = 0;
	else if (percentage > 1) cutoff = 30;
	else cutoff = Math.round(percentage * 30);
	if (energy < 10 && game.maxEnergy >= 10) {
		energy = "0" + energy;
	};
	draw.imageSector(bar.energy_full, 0, 0, cutoff + 1, 32, x, y + 16);
	draw.imageSector(bar.energy_empty, cutoff + 1, 0, 32 - (cutoff + 1), 32, x + (cutoff + 1), y + 16);
	draw.lore(x + 9, y + 28, energy, {"text-align": "left"});
	draw.lore(x + 18, y + 28, game.maxEnergy);
};

function effectGraphics() {
	if (effAnim[1] == "war cry") {
		draw.imageSector(war_cry, Math.floor(effAnim[0]) * 188, 0, 188, 188, -22, -18, 188, 188);
		effAnim[0] += 1;
		if (effAnim[0] >= 35) effAnim = [0, "none"];
	};
};

function enemyGraphics() {
	if (game.enemies.length > 6) {
		game.enemies.splice(6);
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = game.enemyPos[index];
		draw.bars(pos[0], pos[1], select.health, select.maxHealth, select.shield, select.maxShield);
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = game.enemyPos[index];
		if (select.health <= 0) {
			game.enemies.splice(index, 1);
			if (tempAnim[3] >= index) tempAnim[3]--;
			for (let a = index; a < game.enemies.length; a++) {
				let ref = game.enemies[a];
				ref.location = a;
				game.enemies[a] = new Enemy(undefined, undefined, ref);
				console.log("refresh enemy " + a);
			};
		};
		if (!pos) return;
		if (enemyAnim[index] >= 4) enemyAnim[index] = 0;
		if (index !== invNum) {
			if (select.type == "slime_big") {
				draw.imageSector(enemy.slime.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
			} else if (select.type == "slime_small") {
				draw.imageSector(enemy.slime.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1], 64, 64);
			} else if (select.type == "slime_prime") {
				if (primeAnim == -1) {
					draw.imageSector(enemy.slime.prime, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1, 64, 64);
				} else {
					draw.imageSector(enemy.slime.to_prime, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1, 64, 64);
					primeAnim += (Math.random() + 0.5) * 0.1;
					if (primeAnim >= 12) {
						primeAnim = -1;
						enemyAnim[index] = 0;
					};
				};
			};
		};
		enemyAnim[index] += (Math.random() + 0.5) * 0.1;
	};
	if (tempAnim[3] != -1) {
		let pos = game.enemyPos[tempAnim[3]];
		if (tempAnim[1] == "slime_ball") {
			let phase = (tempAnim[0] / 10),
				posX = Math.round(((pos[0] - 80)) * phase),
				posY = Math.round(((pos[1] - 42)) * phase);
			if (playerAnim[1].startsWith("shield")) {
				posX = Math.round(((pos[0] - 94)) * phase);
				posY = Math.round(((pos[1] - 44)) * phase);
			};
			if (tempAnim[2] == "ending") {
				tempAnim = [0, "none", "normal", -1];
				enemyAnim[tempAnim[3]] = 0;
				game.enemyStage = "end";
			} else if (game.enemyStage == "middle") {
				draw.imageSector(enemy.slime.slime_ball, 4 * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
				tempAnim[2] = "ending";
				game.enemyStage = "pending";
			} else {
				draw.imageSector(enemy.slime.slime_ball, (tempAnim[0] % 4) * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
				tempAnim[0]++;
				game.enemyStage = "pending";
				if (tempAnim[0] >= 11) {
					tempAnim[0] = 11;
					game.enemyStage = "middle";
				};
			};
		} else if (tempAnim[1] == "slime_small_launch") {
			if (tempAnim[0] >= 10) {
				let phase = ((tempAnim[0] - 9) / 10),
					posX = Math.round(((pos[0] - 68) - 64) * phase),
					posY = Math.round(((pos[1] - (50 + 10))) * phase);
				draw.imageSector(enemy.slime.small_launch, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
			} else draw.imageSector(enemy.slime.small_launch, Math.floor(tempAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
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
		} else if (tempAnim[1] == "slime_prime_fist") {
			if (tempAnim[0] >= 4) {
				let phase = ((tempAnim[0] - 4) / 10), posX = Math.round(((pos[0] - 68) - 40) * phase);
				draw.imageSector(enemy.slime.prime_fist, 4 * 36, 0, 36, 18, pos[0] - 32 - posX, 80, 36, 18);
			} else draw.imageSector(enemy.slime.prime_fist, Math.floor(tempAnim[0]) * 36, 0, 36, 18, pos[0] - 32, 80, 36, 18);
			tempAnim[0]++;
			if (game.enemyStage == "middle") {
				tempAnim = [0, "none", "normal", -1];
				enemyAnim[tempAnim[3]] = 0;
				game.enemyStage = "end";
			} else if (tempAnim[0] >= 14) {
				tempAnim[0] = 14;
				game.enemyStage = "middle";
			} else {
				game.enemyStage = "pending";
			};
		} else invNum = -1;
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = game.enemyPos[index];
		if (starAnim[index] >= 4) starAnim[index] = 0;
		if (index !== tempAnim[3] && (game.turn == "player" || game.enemyNum !== index)) {
			let y = Math.round(pos[1] + Math.abs(starAnim[index] - 2));
			if (select.type == "slime_big") y -= 17;
			else if (select.type == "slime_small") y -= 7;
			else if (select.type == "slime_prime") {
				if (primeAnim == -1 || primeAnim >= 5) y -= 37;
				else y -= 17;
			};
			if (game.enemies[index].intent == "defend") {
				draw.intent(pos[0] + 16, y, game.enemies[index].defendPower, "defend");
				draw.lore(pos[0] + 30, y + 12, game.enemies[index].defendPower, {"color": "white", "text-align": "center"});
			} else if (game.enemies[index].intent == "attack") {
				draw.intent(pos[0] + 16, y, game.enemies[index].attackPower, "attack");
				draw.lore(pos[0] + 30, y + 12, game.enemies[index].attackPower, {"color": "white", "text-align": "center"});
			};
		};
		starAnim[index] += (Math.random() + 0.5) * 0.15;
	};
};

function infoGraphics() {
	draw.rect("#000c");
	draw.image(extra.help, 381, 3);
	draw.image(select.round, 380, 2);
	draw.lore(1, 12 - infPos, "Source can be found at \"https://github.com/Yrahcaz7/Dungeon-of-Souls\"", {"color": "red", "text-small": true});
	if (game.select[1] == 3) {
		draw.lore(1, 1 - infPos, "Dungeon of Souls - Changelog", {"color": "red"});
		infLimit = (draw.lore(1, 23 - infPos, changelog, {"color": "white"}) + 23) - 200;
	} else if (game.select[1] == 2) {
		draw.lore(1, 1 - infPos, "Dungeon of Souls - How To Play", {"color": "red"});
		infLimit = (draw.lore(1, 23 - infPos, gameplay, {"color": "white"}) + 23) - 200;
	} else {
		draw.lore(1, 1 - infPos, "Dungeon of Souls - Overview", {"color": "red"});
		infLimit = (draw.lore(1, 23 - infPos, overview, {"color": "white"}) + 23) - 200;
	};
	if (infLimit > 0) draw.image(arrows, 386, 22);
};

function deckGraphics(overrideName = "deck") {
	draw.rect("#000c");
	let tempDeck = JSON.parse(game.deckProxy).cardSort(), selected;
	if (overrideName == "discard") tempDeck = game.discard;
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
	draw.rect("#0004", 0, 0, 400, 13);
	draw.lore(200, 1, overrideName.title(), {"color": "white", "text-align": "center"});
	draw.rect("#fff", 1, 12, 398, 1);
};

function renderCards() {
	if (game.select[0] == "attack_enemy") {
		draw.card(game.enemyAtt, 0, 52, true, 104);
	};
	if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") return;
	let temp = -1;
	for (let index = 0; index < game.hand.length; index++) {
		let card = game.hand[index];
		if (game.select[0] == "hand" && game.select[1] == index || (game.prevCard == index && global.options.stickyCards)) {
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
		if (notif[1] >= 9) color = "red_fade_2";
		else if (notif[1] >= 7) color = "red_fade_1";
		else if (notif[1] >= 5) color = "red_fade_0";
		draw.lore(game.handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1] + notif[3], notif[2], {"color": color, "text-align": "center"});
		notif[1]++;
		if (notif[1] > 11) notif = [-1, 0];
	};
};

function info(type, location = "player", xPlus = 0) {
	if (type == "the map") {
		let x = 21 + xPlus, y = 12;
		draw.textBox(x, y, 12, "The Map", {"text-align": "center"});
		draw.textBox(x, y + 13, 24, infoText.the_map, {"text-small": true});
	} else if (type == "iron will") {
		if (location == "artifact") {
			let x = 39 + (game.select[1] * 18) + xPlus, y = 12;
			draw.textBox(x, y, 12, "Iron Will", {"text-align": "center"});
			draw.textBox(x, y + 13, 24, infoText.iron_will, {"text-small": true});
		};
	} else if (type == "reinforce") {
		if (location == "card") {
			let x = game.handPos[game.select[1]] + xPlus, y = 147 - Math.floor(cardAnim[game.select[1]]);
			if (game.select[1] == game.hand.length - 1 && game.hand.length >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.reinforce, {"text-small": true});
		} else if (location == "player") {
			let pos = 71, desc = "You have " + game.reinforces + " reinforce";
			if (game.reinforces >= 2) desc += "s.";
			else desc += ".";
			draw.textBox(85 + xPlus, pos, desc.length, desc, {"text-small": true});
			draw.textBox(85 + xPlus, pos + 11, 24, infoText.reinforce, {"text-small": true});
		} else if (location == "deck") {
			let x = 3 + (game.cardSelect[0] * 66) + xPlus, y = 15 + (game.cardSelect[1] * 98) - game.deckPos;
			if (game.cardSelect[0] >= 4) {
				x -= 146;
			};
			draw.textBox(x + 70, y, 24, infoText.reinforce, {"text-small": true});
		};
	} else if (type == "aura blades") {
		if (location == "card") {
			let x = game.handPos[game.select[1]] + xPlus, y = 147 - Math.floor(cardAnim[game.select[1]]);
			if (game.select[1] == game.hand.length - 1 && game.hand.length >= 4) {
				x -= 146;
			};
			draw.textBox(x + 70, y, 24, infoText.aura_blade, {"text-small": true});
		} else if (location == "player") {
			let pos = 71, desc = "You have " + game.auraBlades + " aura blade";
			if (game.reinforces) pos += 44;
			if (game.auraBlades >= 2) desc += "s.";
			else desc += ".";
			draw.textBox(85 + xPlus, pos, desc.length, desc, {"text-small": true});
			draw.textBox(85 + xPlus, pos + 11, 24, infoText.aura_blade, {"text-small": true});
		} else if (location == "deck") {
			let x = 3 + (game.cardSelect[0] * 66) + xPlus, y = 15 + (game.cardSelect[1] * 98) - game.deckPos;
			if (game.cardSelect[0] >= 4) {
				x -= 146;
			};
			draw.textBox(x + 69, y, 24, infoText.aura_blade, {"text-small": true});
		};
	};
};

function target() {
	if (game.select[0] == "map") {
		info("the map");
	} else if (game.select[0] == "attack_enemy" || game.select[0] == "lookat_enemy") {
		const enemy = game.enemies[game.select[1]];
		const enemyType = enemy.type;
		let pos = game.enemyPos[game.select[1]];
		if (enemyType == "slime_small") {
			draw.selector(pos[0] + 19, pos[1] + 35, 26, 29);
			draw.lore(pos[0] + 31, pos[1] + 27.5, "small slime", {"color": "white", "text-align": "center", "text-small": true});
			if (game.select[1] == 0 && game.enemies.length > 1) draw.lore(pos[0] + 13.5, pos[1] + 33, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-align": "left", "text-small": true});
			else draw.lore(pos[0] + 48, pos[1] + 33, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-small": true});
		} else if (enemyType == "slime_big" || (enemyType == "slime_prime" && primeAnim != -1 && primeAnim < 5)) {
			draw.selector(pos[0] + 5, pos[1] + 25, 54, 39);
			draw.lore(pos[0] + 31, pos[1] + 17.5, "big slime", {"color": "white", "text-align": "center", "text-small": true});
			if (game.select[1] == 0 && game.enemies.length > 1) draw.lore(pos[0] - 0.5, pos[1] + 23, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-align": "left", "text-small": true});
			else draw.lore(pos[0] + 62, pos[1] + 23, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-small": true});
		} else if (enemyType == "slime_prime") {
			draw.selector(pos[0], pos[1] + 5, 63, 59);
			draw.lore(pos[0] + 31, pos[1] - 2.5, "prime slime", {"color": "white", "text-align": "center", "text-small": true});
			if (game.select[1] == 0 && game.enemies.length > 1) draw.lore(pos[0] - 5.5, pos[1] + 3, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-align": "left", "text-small": true});
			else draw.lore(pos[0] + 66, pos[1] + 3, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-small": true});
		};
	} else if (game.select[0] == "lookat_you") {
		let coor = [60, 72, 20, 39];
		if (playerAnim[1] == "shield" || playerAnim[1] == "shield_reinforced") coor = [58, 72, 23, 39];
		draw.selector(coor[0], coor[1], coor[2], coor[3]);
		if (game.character == "knight") {
			if (global.charStage.knight == 0) draw.lore(coor[0] + (coor[2] / 2) - 1, 64.5, "the forgotten one", {"color": "white", "text-align": "center", "text-small": true});
			else if (global.charStage.knight == 1) draw.lore(coor[0] + (coor[2] / 2) - 1, 64.5, "the true knight", {"color": "white", "text-align": "center", "text-small": true});
		};
		if (game.reinforces) {
			info("reinforce", "player", coor[0] + coor[2] - 80);
		};
		if (game.auraBlades) {
			info("aura blades", "player", coor[0] + coor[2] - 80);
		};
	} else if (game.select[0] == "artifacts") {
		let name = game.artifacts[game.select[1]];
		if (name == "iron will") {
			info("iron will", "artifact");
		};
	} else if (game.select[0] == "hand") {
		let name = game.hand[game.select[1]].name;
		if (name == "reinforce" || name == "everlasting shield") {
			info("reinforce", "card");
		} else if (name == "aura blade") {
			info("aura blades", "card");
		};
	} else if (game.select[0] == "deck" && game.select[1] == 1 && game.deckProxy != "[]") {
		let proxy = JSON.parse(game.deckProxy).cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)].name;
		if (proxy == "reinforce" || proxy == "everlasting shield") {
			info("reinforce", "deck");
		} else if (proxy == "aura blade") {
			info("aura blades", "deck");
		};
	} else if (game.select[0] == "discard" && game.select[1] == 1 && game.discard.length > 0) {
		let proxy = game.discard[game.cardSelect[0] + (game.cardSelect[1] * 6)].name;
		if (proxy == "reinforce" || proxy == "everlasting shield") {
			info("reinforce", "deck");
		} else if (proxy == "aura blade") {
			info("aura blades", "deck");
		};
	};
};

function showPopup(type, description, secondLine = "") {
	type = "" + type;
	description = "" + description;
	secondLine = "" + secondLine;
	if (!type || !description) return;
	popups.push([type, description, 400, 0, secondLine]);
};

function popupGraphics() {
	if (popups.length >= 1) {
		for (let a = 0; a < popups.length && a <= 6; a++) {
			let stopPoint = (popups[a][1].length * 6) + 13;
			if (popups[a][4].length > popups[a][1].length) stopPoint = (popups[a][4].length * 3) + 13;
			else if (popups[a][4]) stopPoint = (popups[a][1].length * 3) + 13;
			if (popups[a][2] > 400) {
				popups.splice(a, 1);
				continue;
			};
			stopPoint = 400 - stopPoint;
			if (popups[a][3] >= 1) popups[a][2] += (popups[a][1].length + 1) / 3;
			else if (popups[a][2] > stopPoint) popups[a][2] -= (popups[a][1].length + 1) / 3;
			if (popups[a][2] < stopPoint) popups[a][2] = stopPoint;
			if (popups[a][2] == stopPoint) popups[a][3] += 0.025;
			draw.image(popup.back, popups[a][2], 150 - (a * 21));
			draw.lore(popups[a][2] + 13, 150 - (a * 21) + 8, !!popups[a][4]?popups[a][1]+"<br>"+popups[a][4]:popups[a][1], {"text-small": !!popups[a][4]});
			if (popups[a][0] == "music") draw.image(popup.music, popups[a][2] + 4, 150 - (a * 21) + 3);
			else if (popups[a][0] == "go") draw.image(popup.go, popups[a][2] + 2, 150 - (a * 21) + 3);
			if (game.select[0] == "popups" && game.select[1] == a) {
				draw.image(select.popup, popups[a][2] - 1, 150 - (a * 21) - 1);
			};
		};
	};
};

function rewardGraphics(focused = true) {
	draw.box(150, 20, 100, 160);
	const place = game.location.split(", ");
	const type = game.location=="-1" ? "battle" : game.map[place[0]][place[1]][0];
	if (type == "battle") draw.lore(199, 21, "Battle loot!", {"text-align": "center"});
	else if (type == "treasure") draw.lore(199, 21, "Treasure!", {"text-align": "center"});
	for (let index = 0; index < game.rewards.length; index++) {
		let item = game.rewards[index];
		draw.image(rewards.item, 151, 32 + (index * 19));
		if (game.select[1] == index && focused) draw.image(select.item_border, 150, 31 + (index * 19));
		if (item.endsWith(" - claimed")) draw.image(select.item_green, 151, 32 + (index * 19));
		else if (game.select[1] == index && focused) draw.image(select.item, 151, 32 + (index * 19));
		if (item == "finish") draw.image(rewards.back, 151, 32 + (index * 19));
		draw.lore(171, 36 + (index * 19), item.replace(" - claimed", ""));
	};
};

function cardRewardGraphics(focused = true) {
	let x = 199 - (game.cardRewardChoices * 68 / 2), y = 20, width = (game.cardRewardChoices * 68) + 2, height = 160;
	draw.box(x, y, width, height);
	if (game.cardRewardChoices == 1) draw.lore(x + (width / 2), y + 1, "Choose your\ncard reward:", {"text-align": "center"});
	else draw.lore(x + (width / 2), y + 1, "Choose your card reward:", {"text-align": "center"});
	game.handPos = [];
	for (let index = 0; index < game.cardRewardChoices; index++) {
		game.handPos.push((199 - (game.cardRewardChoices * 68 / 2)) + 1 + (index * 68));
		if (game.select[1] == index && focused) draw.card(new Card(game.room[5][index]), index, 50, true);
		else draw.card(new Card(game.room[5][index]), index, 50, false);
	};
	if ((game.select[1] == -1 || game.select[1] == game.cardRewardChoices) && focused) draw.rect("#fff", x, y + height - 14, width, 14);
	draw.box(x + 2, y + height - 12, width - 4, 10);
	draw.lore(x + 3, y + height - 11, "Go back");
};

function mapGraphics(onlyCalc = false) {
	let render = !onlyCalc, seed = "";
	if (render) {
		draw.rect("#000");
		draw.image(map.top, 3, 12);
		draw.image(map.row, 16, 20, map.row.width, 164);
		draw.image(map.bottom, 16, 184);
		if (game.state == "event_fin") {
			if (game.location == "-1") draw.image(map.select_first, 13, 12);
			else draw.image(map.select, 13 + ((+game.location.split(", ")[0] + 1) * 32), 12);
		} else if (game.location != "-1") {
			if (game.location.split(", ")[0] == "0") draw.image(map.select_first, 13, 12);
			else draw.image(map.select, 13 + (+game.location.split(", ")[0] * 32), 12);
		};
		draw.image(extra.end, 22, 179);
		draw.image(extra.seed, 362, 17);
		if (game.mapSelect == "exit") draw.image(select.round, 21, 178);
		if (game.mapSelect == "seed" || game.mapSelect == "seed-on") draw.image(select.round, 361, 16);
		let info = "floor " + game.floor + " - " + game.gold + " gold";
		let push = info.length * 2;
		draw.lore(1, 1, info, {"color": "red"});
		// seed snippet
		if (push <= 126) {
			seed = JSON.stringify(game.firstRoom) + " " + JSON.stringify(game.map);
			// constants
			seed = seed.slice(30, seed.length - 2).replace("]] [[false", " ");
			// true and false
			seed = seed.replace(/false/g, "\\0").replace(/true/g, "\\1");
			// enemies
			seed = seed.replace(/"slime_small"/g, "\\ss'").replace(/"slime_big"/g, "\\sb'").replace(/"slime_prime"/g, "\\sp'");
			seed = seed.replace(/"slime_small, /g, "\\ss+").replace(/"slime_big, /g, "\\sb+").replace(/"slime_prime, /g, "\\sp+");
			// cards
			seed = seed.replace(/"aura blade"/g, "\\aur_b").replace(/"block"/g, "\\blo").replace(/"error"/g, "\\err").replace(/"everlasting shield"/g, "\\eve_s").replace(/"reinforce"/g, "\\rei").replace(/"slash"/g, "\\sla").replace(/"war cry"/g, "\\war_c");
			// map nodes
			seed = seed.replace(/"battle",/g, "\\B").replace(/"treasure",/g, "\\T").replace(/"battle_prime",/g, "\\P");
			// map attributes
			seed = seed.replace(/"closed",|"open",/g, "\\C");
			// numbers
			seed = seed.replace(/\+0./g, "=").replace(/\+1./g, "^");
			// technical
			seed = seed.replace(/\[\[/g, "(").replace(/\]\]/g, ")").replace(/\[\\/g, "{").replace(/"\]/g, "}").replace(/,\\/g, "/").replace(/\),/g, "~").replace(/\],/g, "&").replace(/'\//g, "!").replace(/'&/g, "*").replace(/\)\/0/g, "#").replace(/,\{/g, "$").replace(/\},/g, "%").replace(/~\{/g, "@").replace(/\(\\/g, "`").replace(/\)&/g, "?").replace(/\?`/g, ";").replace(/#\$/g, "|").replace(/#&`/g, ">").replace(/\?\{0/g, "<").replace(/#&\{/g, "'");
			// duplicate numbers
			seed = seed.replace(/0\/0\/0\/0/g, "0:4").replace(/0\/0\/0/g, "0:3").replace(/0\/0/g, "0:2").replace(/#\/0/g, "-0");
			// duplicate enemies
			seed = seed.replace(/ss!ss/g, "ss:2").replace(/sb!sb/g, "sb:2");
			// encode
			seed = btoa(seed);
			// print
			draw.lore(396, 1, "seed: " + seed.slice(0, 126 - push) + "\n" + seed.slice(126 - push, 255 - (push * 2)) + "...", {"color": "white", "text-align": "left", "text-small": true});
		};
	};
	let store = [];
	for (let x = 0; x < game.map.length; x++) {
		for (let y = 0; y < game.map[x].length; y++) {
			if (!game.map[x][y]) continue;
			let drawX = 25 + (x * 32) + game.map[x][y][1];
			let drawY = 18 + (y * 32) + game.map[x][y][2];
			if (x === 0 && render) {
				draw.line(drawX + 8, drawY + 8, 18, drawY + 8, "#fff", 3);
			};
			if (game.map[x][y]) {
				for (let branch = 0; branch < 2; branch++) {
					let posX, posY;
					for (num = 0; num < 7; num++) {
						if (branch && x != game.map.length - 1) {
							if (game.map[x + 1][y - num]) {
								store.push([x, y, x + 1, y - num]);
								posX = 25 + ((x + 1) * 32) + game.map[x + 1][y - num][1];
								posY = 18 + ((y - num) * 32) + game.map[x + 1][y - num][2];
								break;
							} else if (game.map[x + 1][y + num]) {
								store.push([x, y, x + 1, y + num]);
								posX = 25 + ((x + 1) * 32) + game.map[x + 1][y + num][1];
								posY = 18 + ((y + num) * 32) + game.map[x + 1][y + num][2];
								break;
							};
						} else if (x !== 0) {
							if (game.map[x - 1][y - num]) {
								store.push([x, y, x - 1, y - num]);
								posX = 25 + ((x - 1) * 32) + game.map[x - 1][y - num][1];
								posY = 18 + ((y - num) * 32) + game.map[x - 1][y - num][2];
								break;
							} else if (game.map[x - 1][y + num]) {
								store.push([x, y, x - 1, y + num]);
								posX = 25 + ((x - 1) * 32) + game.map[x - 1][y + num][1];
								posY = 18 + ((y + num) * 32) + game.map[x - 1][y + num][2];
								break;
							};
						};
					};
					if (render) draw.line(drawX + 8, drawY + 8, posX + 8, posY + 8, "#fff", 3);
				};
			};
		};
	};
	let coordSel = game.mapSelect.split(", ");
	let coordOn = game.location.split(", ");
	if (render) {
		for (let x = 0; x < game.map.length; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (!game.map[x][y]) continue;
				let drawX = 25 + (x * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (game.map[x][y][0] == "battle") {
					draw.image(map.battle, drawX, drawY);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.battle, drawX - 1, drawY - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.battle_blue, drawX - 1, drawY - 1);
				} else if (game.map[x][y][0] == "battle_prime") {
					draw.image(map.death_zone, drawX, drawY);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.death_zone, drawX - 1, drawY - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.death_zone_blue, drawX - 1, drawY - 1);
				} else if (game.map[x][y][0] == "treasure") {
					if (game.map[x][y][3] == "open") {
						draw.image(map.treasure_open, drawX, drawY);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_open_blue, drawX - 1, drawY - 1);
					} else {
						draw.image(map.treasure, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.treasure, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_blue, drawX - 1, drawY - 1);
					};
				};
			};
		};
	};
	game.paths = {};
	for (let num = 0; num < store.length; num++) {
		if (store[num][2] > store[num][0]) {
			if (!(game.paths["" + store[num][0] + ", " + store[num][1]])) game.paths["" + store[num][0] + ", " + store[num][1]] = [];
			if (!(game.paths["" + store[num][0] + ", " + store[num][1]].includes("" + store[num][2] + ", " + store[num][3]))) game.paths["" + store[num][0] + ", " + store[num][1]].push("" + store[num][2] + ", " + store[num][3]);
		} else if (store[num][0] > store[num][2]) {
			if (!(game.paths["" + store[num][2] + ", " + store[num][3]])) game.paths["" + store[num][2] + ", " + store[num][3]] = [];
			if (!(game.paths["" + store[num][2] + ", " + store[num][3]].includes("" + store[num][0] + ", " + store[num][1]))) game.paths["" + store[num][2] + ", " + store[num][3]].push("" + store[num][0] + ", " + store[num][1]);
		};
		if (store[num][0] === 0) {
			if (!(game.paths["-1"])) game.paths["-1"] = [];
			if (!(game.paths["-1"].includes("" + store[num][0] + ", " + store[num][1]))) game.paths["-1"].push("" + store[num][0] + ", " + store[num][1]);
		};
	};
	for (let item in game.paths) {
		game.paths[item].sort();
	};
	if (render && game.mapSelect == "seed-on") {
		draw.rect("#000c");
		for (let line = 0; line < seed.length / 132; line++) {
			let indexes = [line * 132, (line + 1) * 132];
			draw.lore(1, 14 + (line * 5.5), seed.slice(indexes[0], indexes[1]), {"color": "white", "text-small": true});
		};
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200, 1, "Seed", {"color": "white", "text-align": "center"});
		draw.rect("#fff", 1, 12, 398, 1);
	};
};
