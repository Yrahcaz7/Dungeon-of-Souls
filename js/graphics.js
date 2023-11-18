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

const ENTER = 500, UP = 501, LEFT = 502, CENTER = 503, RIGHT = 504, DOWN = 505;

const PENDING = 800, STARTING = 801, MIDDLE = 802, ENDING = 803;

var backAnim = [0, UP, 0.5, DOWN, 0, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tempAnim = [0, -1, STARTING, -1], effAnim = [0, "none"], playerAnim = [0, "idle"], starAnim = [0, 1.5, 3, 0.5, 2, 3.5], primeAnim = 0, auraBladePos = [[65, 10], [80, 25], [40, 0], [25, 35]], auraBladeAnim = [0, UP, 2.5, UP, 3, DOWN, 0.5, DOWN], invNum = -1, popups = [], infPos = 0, infLimit = 0;

const draw = {
	// basic - first order
	image(image, x = 0, y = 0, width = (image ? +image.width : 0), height = (image ? +image.height : 0)) {
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
	lore(x, y, string, style = {"color": "black", "highlight-color": "#222", "text-align": RIGHT, "text-small": false}) {
		string = "" + string;
		if (!style["color"]) style["color"] = "black";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = RIGHT;
		if (!style["text-small"]) style["text-small"] = false;
		let color = style["color"], highlight = "", position = style["text-align"], small = style["text-small"];
		string = string.replace(/<br>/g, "\n");
		x = Math.round(x * 2) / 2;
		y = Math.round(y * 2) / 2;
		let img = letters.black, enters = 0, enterIndex = 0, len = string.replace(/<.*?>/g, "").length;
		// set images
		if (letters[color.replace(/-|\s/, "_")]) img = letters[color.replace(/-|\s/, "_")];
		else if (letters[color.slice(0, -2)] && letters[color.slice(0, -2)][color.slice(-1)]) img = letters[color.slice(0, -2)][color.slice(-1)];
		// check for size tags
		if (string.includes("<b>") || string.includes("<big>") || string.includes("<s>") || string.includes("<small>")) {
			string = string.replace(/<\/b>|<\/big>|<\/s>|<\/small>/g, "");
			let array = string.split(/<(?=b>|big>|s>|small>)/g);
			let space = 0;
			if (!array[0]) array.splice(0, 1);
			for (let index = 0; index < array.length; index++) {
				if (array[index].includes("s>") || array[index].includes("small>")) {
					array[index] = array[index].replace(/s>|small>/, "");
					let obj = {};
					Object.assign(obj, style);
					obj["text-small"] = true;
					space += draw.lore(x, y + space, array[index], obj);
				} else if (array[index].includes("b>") || array[index].includes("big>")) {
					array[index] = array[index].replace(/b>|big>/, "");
					let obj = {};
					Object.assign(obj, style);
					obj["text-small"] = false;
					space += draw.lore(x, y + space, array[index], obj);
				} else {
					space += draw.lore(x, y + space, array[index], style);
				};
			};
			return space;
		};
		// print multi-line right aligned text
		if (string.includes("\n") && position !== RIGHT) {
			let array = string.split("\n");
			let space = 0;
			if (!array[0]) array.splice(0, 1);
			for (let index = 0; index < array.length; index++) {
				space += draw.lore(x, y + space, array[index], style);
			};
			return space;
		};
		// print all text
		let defImg = img;
		for (let a = 0; a < string.length; a++) {
			// check for color tags
			if (string.charAt(a) == "<") {
				const cut = string.slice(a + 1), tag = cut.slice(0, cut.indexOf(" ")==-1?cut.indexOf(">"):Math.min(cut.indexOf(">"), cut.indexOf(" ")));
				if (letters[tag.replace("-", "_")]) {
					if (cut.slice(0, cut.indexOf(">")).includes("highlight")) highlight = style["highlight-color"];
					else highlight = "";
					img = letters[tag.replace("-", "_")];
					string = string.replace(new RegExp("<" + tag + ".*?>"), "");
				} else if (img == letters[tag.slice(1).replace("-", "_")] && tag.startsWith("/")) {
					highlight = "";
					img = defImg;
					string = string.replace("<" + tag + ">", "");
				};
			};
			// set things up
			let index = string.charCodeAt(a);
			if (string.replace(/<.*?>/g, "").includes("\n", enterIndex + 1)) {
				len = string.replace(/<.*?>/g, "").indexOf("\n", enterIndex + 1);
			};
			if (index == 10) {
				enters++;
				enterIndex = a + 1;
			};
			// don't print if no color
			if (color == "none") continue;
			// stagger 'a' from line breaks
			if (enters) {
				a -= enterIndex;
			};
			// print letter
			if (small) {
				if (position === RIGHT) {
					if (highlight && index >= 32) draw.rect(highlight, x + (a * 3) - 0.5, y + (enters * 5.5) - 0.5, 3.5, 5.5);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 3), y + (enters * 5.5), 2.5, 5);
				} else if (position === LEFT) {
					if (highlight && index >= 32) draw.rect(highlight, x + ((a - len + 1) * 3) - 0.5, y + (enters * 5.5) - 0.5, 3.5, 5.5);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + ((a - len + 1) * 3), y + (enters * 5.5), 2.5, 5);
				} else if (position === CENTER) {
					if (highlight && index >= 32) draw.rect(highlight, x + (a * 3) - (len * 1.5) + 1 - 0.5, y + (enters * 5.5) - 0.5, 3.5, 5.5);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 3) - (len * 1.5) + 1, y + (enters * 5.5), 2.5, 5);
				};
			} else {
				if (position === RIGHT) {
					if (highlight && index >= 32) draw.rect(highlight, x + (a * 6) - 1, y + (enters * 11) - 1, 7, 11);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 6), y + (enters * 11), 5, 10);
				} else if (position === LEFT) {
					if (highlight && index >= 32) draw.rect(highlight, x + ((a - len + 1) * 6) - 1, y + (enters * 11) - 1, 7, 11);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + ((a - len + 1) * 6), y + (enters * 11), 5, 10);
				} else if (position === CENTER) {
					if (highlight && index >= 32) draw.rect(highlight, x + (a * 6) - (len * 3) + 2 - 1, y + (enters * 11) - 1, 7, 11);
					draw.imageSector(img, (index - 32) * 6, 0, 5, 10, x + (a * 6) - (len * 3) + 2, y + (enters * 11), 5, 10);
				};
			};
			// set 'a' back to normal
			if (enters) {
				a += enterIndex;
			};
		};
		return small ? (enters + 1) * 5.5 : (enters + 1) * 11;
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
		if (type === ATTACK) draw.image(intent.attack[stage], x, y);
		else if (type === DEFEND) draw.image(intent.defend[stage], x, y + 1);
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
		draw.lore(x + 25, y + 67, health, {"text-align": LEFT});
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
		draw.lore(x + 25, y + 78, shield, {"text-align": LEFT});
		draw.lore(x + 34, y + 78, maxShield);
	},
	card(cardObject, index, y, selected = false, overrideX = NaN) {
		// setup
		if (!(cardObject instanceof Object)) cardObject = new Card(cardObject);
		let x = handPos[index], img = card.error;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		const rarity = +cards[cardObject.id].rarity, name = cards[cardObject.id].name, exMod = +cards[cardObject.id].exMod;
		if (card[rarities[rarity]] && rarity >= 0) img = card[rarities[rarity]][name];
		// card back
		if (cardObject.id !== 0) draw.image(card.back, x + 2, y + 2);
		// card outline
		const type = types[Math.floor(cardObject.id / 1000)];
		if (card.outline[type]) draw.image(card.outline[type], x + 3, y + 3);
		// card selector
		if (selected) {
			if (attributes.unplayable.includes(cardObject.id)) {
				if (rarity == 2) draw.image(select.card_rare_unplayable, x - 3, y - 3);
				else draw.image(select.card_unplayable, x + 1, y + 1);
			} else {
				if (rarity == 2) draw.image(select.card_rare, x - 3, y - 3);
				else draw.image(select.card_normal, x - 1, y - 1);
			};
		};
		// card image
		if (img == card.error) draw.image(card.error, x + 2, y + 2);
		else draw.image(img, x + 7, y + 7);
		// card title
		if (name.length >= 11) draw.lore(x + 32, y + 44, name.title(), {"text-align": CENTER, "text-small": true});
		else draw.lore(x + 32, y + 42, name.title(), {"text-align": CENTER});
		// card description
		let desc = cards[cardObject.id].desc, exDamage = get.extraDamage(), mulDamage = 1, valueIsLess = false;
		if (exMod) exDamage = Math.floor(exDamage * exMod);
		if (game.eff.weakness) mulDamage = 0.75;
		if ((exDamage || mulDamage !== 1) && game.select[0] !== CARD_REWARDS) {
			desc = desc.replace(/([Dd]eal\s)(\d+)(\s<red>damage<\/red>)/g, (substring, pre, number, post) => {
				const original = parseInt(number);
				let damage = Math.floor((original + exDamage) * mulDamage);
				if (damage > original) {
					return pre + "<light-green highlight>" + damage + "</light-green>" + post;
				} else if (damage < original) {
					valueIsLess = true;
					return pre + "<white highlight>" + damage + "</white>" + post;
				} else {
					return pre + damage + post;
				};
			});
		};
		let exShield = get.extraShield();
		if (exShield && game.select[0] !== CARD_REWARDS) {
			desc = desc.replace(/([Gg]ain\s)(\d+)(\s<blue>shield<\/blue>)/g, (substring, pre, number, post) => {
				const original = parseInt(number);
				let shield = Math.floor(original + exShield);
				if (shield > original) {
					return pre + "<light-green highlight>" + shield + "</light-green>" + post;
				} else {
					return pre + shield + post;
				};
			});
		};
		// other
		draw.lore(x + 6, y + 55, desc, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		draw.lore(x + 33, y + 89.5, rarities[rarity] + "|" + type, {"text-align": CENTER, "text-small": true});
		if (rarity == 2) {
			draw.image(card.rarity.rare, x - 2, y - 2);
		};
		if (!attributes.unplayable.includes(cardObject.id)) {
			draw.image(card.energy, x, y);
			draw.lore(x + 4, y + 2, cards[cardObject.id].cost);
		};
	},
	textBox(x, y, width, string, style = {"color": "black", "highlight-color": "#222", "text-align": RIGHT, "text-small": false, "background-color": "#ccc", "border-width": 1, "border-color": "#000"}) {
		if (!style["color"]) style["color"] = "black";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = RIGHT;
		if (!style["text-small"]) style["text-small"] = false;
		if (!style["background-color"]) style["background-color"] = "#ccc";
		if (!style["border-width"]) style["border-width"] = 1;
		if (!style["border-color"]) style["border-color"] = "#000";
		let small = style["text-small"];
		let position = style["text-align"];
		let lines = (("" + string).match(/\n/g) || []).length, height = small ? 7 : 12;
		if (small) {
			width = Math.ceil(width * 3 + 0.5);
			height = Math.ceil(lines * 5.5 + 7);
		} else {
			width = width * 6 + 1;
			height = lines * 11 + 12;
		};
		draw.box(x, y, width, height, style);
		if (position === CENTER) {
			x += width / 2;
			if (small) x -= 1.5;
			else x -= 2.5;
		} else if (position === LEFT) {
			x += width;
			if (small) x -= 4;
			else x -= 7;
		};
		draw.lore(x + 1, y + 1, string, style);
		return height + 4;
	},
};

function backgrounds() {
	draw.image(background.cave);
	draw.rect("#10106080");
	draw.image(background.temple);
	draw.image(background.floating_arch, 136, 34 - Math.round(backAnim[0]));
	if (game.floor != 10) {
		let now = new Date(), time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()], x = 170, y = 63 - Math.round(backAnim[2]);
		time[2] += (time[3] / 1000);
		time[1] += (time[2] / 60);
		time[0] += (time[1] / 60);
		if (time[0] >= 12) time[0] = time[0] - 12;
		draw.image(clock.face, x, y);
		draw.imageSector(clock.hour_hand, Math.floor((time[0]) * 82 / 12) * 24, 0, 24, 24, x + 18, y + 18);
		draw.imageSector(clock.min_hand, Math.floor((time[1]) * 80 / 60) * 34, 0, 34, 34, x + 13, y + 13);
		draw.image(clock.node, x + 26, y + 26);
	};
	if (backAnim[0] >= 1) backAnim[1] = DOWN;
	else if (backAnim[0] <= -1) backAnim[1] = UP;
	if (backAnim[1] === UP) backAnim[0] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[1] === DOWN) backAnim[0] -= (Math.random() + 0.5) * 0.075;
	if (backAnim[2] >= 1) backAnim[3] = DOWN;
	else if (backAnim[2] <= -1) backAnim[3] = UP;
	if (backAnim[3] === UP) backAnim[2] += (Math.random() + 0.5) * 0.075;
	else if (backAnim[3] === DOWN) backAnim[2] -= (Math.random() + 0.5) * 0.075;
};

function foregrounds() {
	const past = game.select[2];
	if (past) {
		if (past[0] === REWARDS) rewardGraphics(false);
		else if (past[0] === CARD_REWARDS) cardRewardGraphics(false);
		else if (past[0] === ARTIFACT_REWARDS) artifactRewardGraphics(false);
	};
	draw.image(view);
	if (game.select[0] === LOOKER && game.select[1] === 1) draw.imageSector(extra.looker, 15, 0, 16, 16, 343, 3);
	else draw.imageSector(extra.looker, 0, 0, 16, 16, 343, 3);
	draw.image(extra.help, 362, 3);
	draw.image(extra.options, 380, 2);
	draw.image(extra.end, 3, 163);
	draw.image(extra.deck, 3, 182);
	if (game.void.length) draw.image(extra.void, 381, 163);
	draw.image(extra.discard, 383, 182);
	draw.image(extra.map, 2, 12);
	for (let index = 0; index < game.artifacts.length; index++) {
		const name = ("" + artifacts[game.artifacts[index]].name).replace(/\s/g, "_");
		if (!name) continue;
		draw.image(artifact[name], 20 + (index * 18), 12);
		if (game.select[0] === ARTIFACTS && game.select[1] === index) draw.image(select[name], 19 + (index * 18), 11);
	};
	if (game.select[0] === LOOKER) draw.image(select.round, 342, 2);
	else if (game.select[0] === HELP) draw.image(select.round, 361, 2);
	else if (game.select[0] === OPTIONS) draw.image(select.options, 380, 2);
	else if (game.select[0] === END) draw.image(select.round, 2, 162);
	else if (game.select[0] === DECK) draw.image(select.deck, 2, 181);
	else if (game.select[0] === VOID) draw.image(select.round, 380, 162);
	else if (game.select[0] === DISCARD) draw.image(select.discard, 382, 181);
	else if (game.select[0] === MAP) draw.image(select.map, 1, 11);
	draw.lore(1, 1, "floor " + game.floor, {"color": "red"});
};

const startAnim = {
	player(type) {
		type = "" + type;
		if (!player[type]) return;
		if (game.eff.aura_blades && (type == "attack" || type == "attack_2")) type += "_aura";
		if (game.eff.reinforces && (type == "shield" || type == "crouch_shield")) type += "_reinforced";
		playerAnim = [0, type];
	},
	effect(type) {
		type = "" + type;
		if (!type) return;
		effAnim = [0, type];
	},
	enemy(index, type) {
		index = +index;
		type = +type;
		if ((!index && index !== 0) || !type) return;
		tempAnim = [0, type, STARTING, index];
		if (type === SLIME.SMALL) {
			invNum = index;
		} else invNum = -1;
	},
};

function playerGraphics() {
	let x = 15, y = 30;
	if (game.eff.aura_blades) {
		auraBladePos = [[65, 10], [80, 25], [40, 0], [25, 35]];
		for (let num = 0; num < auraBladePos.length && num <= 4; num++) {
			auraBladePos[num][1] += Math.round(auraBladeAnim[num * 2]);
			if (auraBladeAnim[num * 2 + 1] === UP) auraBladeAnim[num * 2] += (Math.random() + 0.5) * 0.05;
			else auraBladeAnim[num * 2] -= (Math.random() + 0.5) * 0.05;
			if (auraBladeAnim[num * 2] >= 4) auraBladeAnim[num * 2 + 1] = DOWN;
			else if (auraBladeAnim[num * 2] <= 0) auraBladeAnim[num * 2 + 1] = UP;
		};
		for (let blade = 0; blade < game.eff.aura_blades && blade < 4; blade++) {
			draw.image(aura_blade, x + auraBladePos[blade][0], y + auraBladePos[blade][1]);
		};
	};
	for (const key in game.eff) {
		if (Object.hasOwnProperty.call(game.eff, key)) {
			if (game.eff[key]) {
				let img = icon[key.endsWith("s") && !key.endsWith("ss") ? key.slice(0, -1) : key];
				if (game.shield) {
					draw.image(img, x + 23, y + 104);
					draw.lore(x + 34, y + 112, game.eff[key], {"color": "white", "text-align": LEFT});
				} else {
					draw.image(img, x + 23, y + 93);
					draw.lore(x + 34, y + 101, game.eff[key], {"color": "white", "text-align": LEFT});
				};
				x += 17;
			};
		};
	};
	x = 15;
	draw.imageSector(player[playerAnim[1]], Math.floor(playerAnim[0]) * 120, 0, 120, player[playerAnim[1]].height, x, y, 120);
	if (playerAnim[1] == "idle") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 10) playerAnim[0] = 0;
	} else if (playerAnim[1] == "attack" || playerAnim[1] == "attack_aura") {
		playerAnim[0]++;
		if (playerAnim[0] >= 4) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "attack_2" || playerAnim[1] == "attack_2_aura") {
		playerAnim[0]++;
		if (playerAnim[0] >= 6) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "shield" || playerAnim[1] == "shield_reinforced") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 3) playerAnim[0] = 2;
	} else if (playerAnim[1] == "crouch_shield" || playerAnim[1] == "crouch_shield_reinforced") {
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 4) playerAnim[0] = 3;
	} else if (playerAnim[1] == "hit") {
		playerAnim[0] += 0.25;
		if (playerAnim[0] >= 1) playerAnim = [0, "idle"];
	} else if (playerAnim[1] == "death") {
		playerAnim[0] += 0.5;
		if (playerAnim[0] >= 10) playerAnim[0] = 9;
	};
	draw.bars(x + 22, y + 15, game.health, get.maxHealth(), game.shield, get.maxShield());
	let cutoff, energy = game.energy, percentage = energy / get.maxEnergy();
	if (percentage < 0) cutoff = 0;
	else if (percentage > 1) cutoff = 30;
	else cutoff = Math.round(percentage * 30);
	if (energy < 10 && get.maxEnergy() >= 10) {
		energy = "0" + energy;
	};
	draw.imageSector(bar.energy_full, 0, 0, cutoff + 1, 32, x, y + 16);
	draw.imageSector(bar.energy_empty, cutoff + 1, 0, 32 - (cutoff + 1), 32, x + (cutoff + 1), y + 16);
	draw.lore(x + 9, y + 28, energy, {"text-align": LEFT});
	draw.lore(x + 18, y + 28, get.maxEnergy());
};

function effectGraphics() {
	if (effAnim[1] == "war cry") {
		draw.imageSector(war_cry, Math.floor(effAnim[0]) * 188, 0, 188, 188, -22, -18, 188, 188);
		effAnim[0]++;
		if (effAnim[0] >= 35) effAnim = [0, "none"];
	};
};

function enemyGraphics() {
	if (game.enemies.length > 6) {
		game.enemies.splice(6);
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = enemyPos[index];
		draw.bars(pos[0], pos[1], select.health, select.maxHealth, select.shield, select.maxShield);
		let x = +pos[0], y = +pos[1];
		for (const key in select.eff) {
			if (Object.hasOwnProperty.call(select.eff, key)) {
				let img = new Image();
				if (key == "burn") img = icon.burn;
				else if (key == "reinforces") img = icon.reinforce;
				if (select.eff[key]) {
					if (select.shield) {
						draw.image(img, x, y + 89);
						draw.lore(x + 11, y + 97, select.eff[key], {"color": "white", "text-align": LEFT});
					} else {
						draw.image(img, x, y + 78);
						draw.lore(x + 11, y + 86, select.eff[key], {"color": "white", "text-align": LEFT});
					};
					x += 17;
				};
			};
		};
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = enemyPos[index];
		if (select.health <= 0) {
			game.enemies.splice(index, 1);
			if (tempAnim[3] >= index) tempAnim[3]--;
		};
		if (!pos) return;
		if (enemyAnim[index] >= 4) enemyAnim[index] = 0;
		if (index !== invNum) {
			if (select.type === SLIME.BIG) {
				draw.imageSector(enemy.slime.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
			} else if (select.type === SLIME.SMALL) {
				draw.imageSector(enemy.slime.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
			} else if (select.type === SLIME.PRIME) {
				if (primeAnim == -1) {
					draw.imageSector(enemy.slime.prime, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
				} else {
					draw.imageSector(enemy.slime.to_prime, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					primeAnim += (Math.random() + 0.5) * 0.1;
					if (primeAnim >= 12) {
						primeAnim = -1;
						enemyAnim[index] = 0;
					};
				};
			} else if (select.type === FRAGMENT) {
				if (primeAnim == -1) {
					draw.imageSector(enemy.fragment.idle, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
				} else if (primeAnim >= 18) {
					draw.imageSector(enemy.fragment.open, Math.floor(primeAnim - 18) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					primeAnim += 0.5;
					if (primeAnim >= 25) {
						primeAnim = -1;
						enemyAnim[index] = 0;
					};
				} else {
					draw.imageSector(enemy.fragment.roll, Math.floor(primeAnim % 4) * 64, 0, 64, 64, pos[0] + ((18 - primeAnim) * 8), pos[1] + 1);
					primeAnim++;
				};
			};
		};
		enemyAnim[index] += (Math.random() + 0.5) * 0.1;
	};
	if (tempAnim[3] != -1) {
		let pos = enemyPos[tempAnim[3]];
		if (tempAnim[1] === SLIME.BIG) {
			let phase = (tempAnim[0] / 10),
				posX = Math.round(((pos[0] - 80)) * phase),
				posY = Math.round(((pos[1] - 42)) * phase);
			if (playerAnim[1].startsWith("shield")) {
				posX = Math.round(((pos[0] - 94)) * phase);
				posY = Math.round(((pos[1] - 44)) * phase);
			};
			if (tempAnim[2] === ENDING) {
				tempAnim = [0, -1, STARTING, -1];
				game.enemyStage = ENDING;
			} else if (game.enemyStage === MIDDLE) {
				draw.imageSector(enemy.slime.slime_ball, 4 * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
				tempAnim[2] = ENDING;
				game.enemyStage = PENDING;
			} else {
				draw.imageSector(enemy.slime.slime_ball, (tempAnim[0] % 4) * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
				tempAnim[0]++;
				game.enemyStage = PENDING;
				if (tempAnim[0] >= 11) {
					tempAnim[0] = 11;
					game.enemyStage = MIDDLE;
				};
			};
		} else if (tempAnim[1] === SLIME.SMALL) {
			if (tempAnim[0] >= 10) {
				let phase = ((tempAnim[0] - 9) / 10),
					posX = Math.round(((pos[0] - 68) - 64) * phase),
					posY = Math.round(((pos[1] - (50 + 10))) * phase);
				draw.imageSector(enemy.slime.small_launch, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
			} else draw.imageSector(enemy.slime.small_launch, Math.floor(tempAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
			if (tempAnim[2] === STARTING) tempAnim[0]++;
			else if (tempAnim[2] === ENDING) tempAnim[0]--;
			if (tempAnim[0] >= 20) {
				tempAnim[0] = 18;
				tempAnim[2] = ENDING;
				game.enemyStage = MIDDLE;
			} else if (tempAnim[0] < 0) {
				tempAnim = [0, -1, STARTING, -1];
				enemyAnim[tempAnim[3]] = 0;
				game.enemyStage = ENDING;
			} else {
				game.enemyStage = PENDING;
			};
			invNum = tempAnim[3];
		} else if (tempAnim[1] === SLIME.PRIME) {
			if (tempAnim[0] >= 4) {
				let phase = ((tempAnim[0] - 4) / 10), posX = Math.round(((pos[0] - 68) - 40) * phase);
				draw.imageSector(enemy.slime.prime_fist, 4 * 36, 0, 36, 18, pos[0] - 32 - posX, 80, 36, 18);
			} else draw.imageSector(enemy.slime.prime_fist, Math.floor(tempAnim[0]) * 36, 0, 36, 18, pos[0] - 32, 80, 36, 18);
			tempAnim[0]++;
			if (game.enemyStage === MIDDLE) {
				tempAnim = [0, -1, STARTING, -1];
				game.enemyStage = ENDING;
			} else if (tempAnim[0] >= 14) {
				tempAnim[0] = 14;
				game.enemyStage = MIDDLE;
			} else {
				game.enemyStage = PENDING;
			};
		} else if (tempAnim[1] === FRAGMENT) {
			draw.imageSector(enemy.fragment.attack, Math.floor(tempAnim[0]) * 64, 0, 64, 64, pos[0], pos[1]);
			if (tempAnim[0] == 4 || tempAnim[0] == 5) draw.rect("#f00", 0, pos[1] + 4, pos[0], 60);
			tempAnim[0]++;
			if (tempAnim[0] >= 7) {
				tempAnim = [0, -1, STARTING, -1];
				game.enemyStage = ENDING;
			} else if (game.enemyStage === MIDDLE) {
				game.enemyStage = PENDING;
			} else if (tempAnim[0] >= 4) {
				game.enemyStage = MIDDLE;
			} else {
				game.enemyStage = PENDING;
			};
		} else invNum = -1;
	};
	for (let index = 0; index < game.enemies.length; index++) {
		let select = game.enemies[index], pos = enemyPos[index];
		if (starAnim[index] >= 4) starAnim[index] = 0;
		if (index !== tempAnim[3] && (game.turn == "player" || game.enemyNum !== index)) {
			let y = Math.round(pos[1] + Math.abs(starAnim[index] - 2));
			if (select.type === SLIME.BIG) y -= 17;
			else if (select.type === SLIME.SMALL) y -= 7;
			else if (select.type === SLIME.PRIME) {
				if (primeAnim == -1 || primeAnim >= 5) y -= 37;
				else y -= 17;
			} else if (select.type === FRAGMENT) {
				if (primeAnim == -1 || primeAnim > 18) y -= 36;
				else y = NaN;
			};
			if (game.enemies[index].intent === DEFEND) {
				draw.intent(pos[0] + 16, y, game.enemies[index].defendPower, DEFEND);
				draw.lore(pos[0] + 30, y + 12, game.enemies[index].defendPower, {"color": "white", "text-align": CENTER});
			} else if (game.enemies[index].intent === ATTACK) {
				draw.intent(pos[0] + 16, y, game.enemies[index].attackPower, ATTACK);
				draw.lore(pos[0] + 30, y + 12, game.enemies[index].attackPower, {"color": "white", "text-align": CENTER});
			};
		};
		starAnim[index] += (Math.random() + 0.5) * 0.15;
	};
};

function infoGraphics() {
	draw.rect("#000c");
	draw.image(extra.help, 362, 3);
	draw.image(select.round, 361, 2);
	const limit = (str) => {
		let lim = (draw.lore(1, 23, str, {"color": "none"}) + 23) - 200;
		if (lim < 0) lim = 0;
		if (infPos > lim) infPos = lim;
		return lim;
	};
	if (game.select[1] == 3) {
		infLimit = limit(changelog);
		draw.lore(1, 1 - infPos, "Dungeon of Souls - Changelog", {"color": "red"});
		draw.lore(1, 23 - infPos, changelog, {"color": "white"});
	} else if (game.select[1] == 2) {
		infLimit = limit(gameplay);
		draw.lore(1, 1 - infPos, "Dungeon of Souls - How To Play", {"color": "red"});
		draw.lore(1, 23 - infPos, gameplay, {"color": "white"});
	} else {
		infLimit = limit(overview);
		draw.lore(1, 1 - infPos, "Dungeon of Souls - Overview", {"color": "red"});
		draw.lore(1, 23 - infPos, overview, {"color": "white"});
	};
	draw.lore(1, 12 - infPos, 'Source can be found at "https://github.com/Yrahcaz7/Dungeon-of-Souls"', {"color": "red", "text-small": true});
	if (infLimit > 0) {
		draw.lore(360, 26, "Scrollable", {"color": "white", "text-align": LEFT});
		draw.image(arrows, 367, 22);
	};
};

function optionsGraphics(focused = true) {
	const options = Object.keys(global.options);
	let text = "";
	for (let index = 0; index < options.length; index++) {
		let option = global.options[options[index]];
		if (typeof option == "boolean") {
			if (game.select[1] - 2 === index && focused) text += "<yellow>" + options[index].title() + ": " + (option ? "ON" : "OFF") + "</yellow>\n";
			else text += options[index].title() + ": " + (option ? "ON" : "OFF") + "\n";
		} else if (typeof option == "number") {
			if (game.select[1] - 2 === index && focused) text += "<yellow>" + options[index].title() + ": " + option + "x</yellow>\n";
			else text += options[index].title() + ": " + option + "x\n";
		} else {
			if (game.select[1] - 2 === index && focused) text += "<yellow>" + options[index].title() + ": " + option + "</yellow>\n";
			else text += options[index].title() + ": " + option + "\n";
		};
	};
	if (game.select[1] - 2 === options.length && focused) text += "\n<yellow>RESTART RUN</yellow>";
	else text += "\nRESTART RUN";
	draw.rect("#000c");
	draw.rect("#0004", 0, 0, 400, 13);
	draw.lore(200 - 2, 1, "Options", {"color": "white", "text-align": CENTER});
	draw.rect("#fff", 1, 12, 378, 1);
	draw.lore(200 - 2, 15, text.trim().replace(/_/g, " "), {"color": "white", "text-align": CENTER});
	draw.image(extra.options, 380, 2);
	if (game.select[1] == 1 && focused) draw.image(select.options, 380, 2);
};

function deckGraphics(deck) {
	draw.rect("#000c");
	const len = +deck.length;
	if (len > 0) {
		if (game.cardSelect[0] + (game.cardSelect[1] * 6) >= len) game.cardSelect = [(len - 1) % 6, Math.floor((len - 1) / 6)];
		let selected;
		for (let x = 0, y = 0; x + (y * 6) < len; x++) {
			if (x === game.cardSelect[0] && y === game.cardSelect[1]) {
				selected = [x, y];
			} else {
				draw.card(deck[x + (y * 6)], -1, 14 + (y * 98) - game.deckPos, false, 2 + (x * 66));
			};
			if (x >= 5) {
				x = -1;
				y++;
			};
		};
		if (selected) {
			draw.card(deck[selected[0] + (selected[1] * 6)], -1, 14 + (selected[1] * 98) - game.deckPos, true, 2 + (selected[0] * 66));
		};
		target();
		selected = game.cardSelect;
		if (game.deckPos >= 98 * selected[1]) {
			game.deckPos -= Math.min(10, Math.abs(game.deckPos - (98 * selected[1])));
		} else if (game.deckPos <= (98 * (selected[1] - 1)) + 11) {
			game.deckPos +=Math.min(10, Math.abs(game.deckPos - ((98 * (selected[1] - 1)) + 11)));
		};
	};
	draw.rect("#0004", 0, 0, 400, 13);
	if (game.select[0] === DECK) draw.lore(200 - 2, 1, "Deck", {"color": "white", "text-align": CENTER});
	else if (game.select[0] === DISCARD) draw.lore(200 - 2, 1, "Discard", {"color": "white", "text-align": CENTER});
	else if (game.select[0] === VOID) draw.lore(200 - 2, 1, "Void", {"color": "white", "text-align": CENTER});
	else if (game.select[0] === IN_MAP) draw.lore(200 - 2, 1, "Cards", {"color": "white", "text-align": CENTER});
	draw.rect("#fff", 1, 12, 398, 1);
};

function renderCards() {
	if (game.select[0] === ATTACK_ENEMY) {
		draw.card(game.enemyAtt[2], 0, 52, true, 104);
	};
	if (game.select[0] === ATTACK_ENEMY || game.select[0] === LOOKAT_ENEMY) return;
	let temp = -1;
	for (let index = 0; index < game.hand.length; index++) {
		let card = game.hand[index];
		if ((game.select[0] === HAND && game.select[1] == index) || (index == game.prevCard && global.options.sticky_cards)) {
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
		draw.lore(handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1] + notif[3], notif[2], {"color": color, "text-align": CENTER});
		notif[1]++;
		if (notif[1] > 11) notif = [-1, 0];
	};
};

const info = {
	card(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.prevCard] + xPlus, y = 147 - Math.floor(cardAnim[game.prevCard]) + yPlus;
		if (game.prevCard == game.hand.length - 1 && game.hand.length >= 4) {
			x -= 145;
		};
		return draw.textBox(x + 69, y, 24, infoText[type], {"text-small": true});
	},
	reward(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.select[1]] + xPlus;
		if (game.select[1] == get.cardRewardChoices() - 1 && get.cardRewardChoices() >= 4) {
			x -= 145;
		};
		return draw.textBox(x + 69, 51 + yPlus, 24, infoText[type], {"text-small": true});
	},
	deck(type, xPlus = 0, yPlus = 0) {
		let x = (game.cardSelect[0] * 66) + xPlus, y = 15 + (game.cardSelect[1] * 98) - game.deckPos + yPlus;
		if (game.cardSelect[0] >= 4) {
			x -= 145;
		};
		return draw.textBox(x + 71, y, 24, infoText[type], {"text-small": true});
	},
	player(type, xPlus = 0, yPlus = 0) {
		if (typeof type != "string") return 0;
		const ending = type.endsWith("s") ? "" : "s";
		const eff = game.eff[type.replace(/\s/g, "_") + (type.endsWith("s") ? "" : "s")];
		let y = 71 + yPlus, desc = "You have " + eff + " " + type + (eff >= 2 ? ending : "") + ".", move = 0;
		move += draw.textBox(85 + xPlus, y + move, desc.length, desc, {"text-small": true});
		move += draw.textBox(85 + xPlus, y + move, 24, infoText[type], {"text-small": true});
		return move;
	},
	enemy(type, xPlus = 0, yPlus = 0) {
		if (type == "burn") {
			const enemy = game.enemies[game.select[1]];
			const pos = enemyPos[game.select[1]];
			let desc = "This enemy has " + enemy.eff.burn + " burn.";
			draw.textBox(pos[0] - (desc.length * 3) - 0.5 + xPlus, pos[1] + yPlus, desc.length, desc, {"text-small": true});
			draw.textBox(pos[0] - 72.5 + xPlus, pos[1] + yPlus + 11, 24, infoText.burn, {"text-small": true});
		};
	},
	artifact(type, xOveride = 0, yOveride = 0) {
		if (type == "the map") {
			let x = (xOveride ? xOveride : 21), y = (yOveride ? yOveride : 12);
			draw.textBox(x, y, 12, "The Map", {"text-align": CENTER});
			draw.textBox(x, y + 13, 24, infoText["the map"], {"text-small": true});
		} else {
			let x = (xOveride ? xOveride : 39 + (game.select[1] * 18)), y = (yOveride ? yOveride : 12);
			const obj = artifacts[type];
			if (!obj) return;
			if (obj.name.length <= 12) {
				draw.textBox(x, y, 12, obj.name.title(), {"text-align": CENTER});
				draw.textBox(x, y + 13, 24, obj.desc, {"text-small": true});
			} else {
				draw.textBox(x, y, obj.name.length, obj.name.title());
				draw.textBox(x, y + 13, obj.name.length * 2, obj.desc, {"text-small": true});
			};
		};
	},
};

function target() {
	if (game.select[0] === MAP) {
		info.artifact("the map");
	} else if (game.select[0] === ATTACK_ENEMY || game.select[0] === LOOKAT_ENEMY) {
		const enemy = game.enemies[game.select[1]];
		const enemyType = enemy.type;
		const pos = enemyPos[game.select[1]];
		let coords = [], name = "";
		if (enemyType === SLIME.SMALL) {
			coords = [19, 35, 26, 29];
			name = "small slime";
		} else if (enemyType === SLIME.BIG || (enemyType === SLIME.PRIME && primeAnim != -1 && primeAnim < 5)) {
			coords = [5, 25, 54, 39];
			name = "big slime";
		} else if (enemyType === SLIME.PRIME) {
			coords = [0, 5, 63, 59];
			name = "prime slime";
		} else if (enemyType === FRAGMENT && (primeAnim == -1 || primeAnim > 18)) {
			coords = [7, 6, 50, 58];
			name = "fragment of time";
		};
		if (coords) {
			draw.selector(pos[0] + coords[0], pos[1] + coords[1], coords[2], coords[3]);
			draw.lore(pos[0] + 31, pos[1] + coords[1] - 7.5, name, {"color": "white", "text-align": CENTER, "text-small": true});
			if (game.select[1] === 0 && game.enemies.length > 1) draw.lore(pos[0] + coords[0] - 5.5, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-align": LEFT, "text-small": true});
			else draw.lore(pos[0] + coords[0] + coords[2] + 3, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + "\nDEF: " + enemy.defendPower, {"color": "white", "text-small": true});
			if (enemy.eff.burn) {
				if (game.select[1] === 0 && game.enemies.length > 1) info.enemy("burn", coords[0] - 5.5, coords[1] + 11);
				else info.enemy("burn", coords[0] - 5.5, coords[1] - 2);
			};
		};
	} else if (game.select[0] === LOOKAT_YOU) {
		let coor = [59, 72, 21, 39];
		if (playerAnim[1] == "shield" || playerAnim[1] == "shield_reinforced") coor = [58, 72, 23, 39];
		else if (playerAnim[1] == "crouch_shield" || playerAnim[1] == "crouch_shield_reinforced") coor = [58, 72, 22, 39];
		draw.selector(coor[0], coor[1], coor[2], coor[3]);
		if (game.character == "knight") {
			if (global.charStage.knight === 0) draw.lore(coor[0] + (coor[2] / 2) - 1, 64.5, "the forgotten one", {"color": "white", "text-align": CENTER, "text-small": true});
			else if (global.charStage.knight == 1) draw.lore(coor[0] + (coor[2] / 2) - 1, 64.5, "the true knight", {"color": "white", "text-align": CENTER, "text-small": true});
		};
		let x = coor[0] + coor[2] - 80, y = 0;
		for (const key in game.eff) {
			if (Object.hasOwnProperty.call(game.eff, key)) {
				if (game.eff[key]) {
					let type = key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " ");
					let height = Math.ceil(((infoText[type]).match(/\n/g) || []).length * 5.5 + 22);
					if (y + height >= 200 - 71) {
						y = 0;
						x += 77;
					};
					y += info.player(type, x, y);
				};
			};
		};
	} else if (game.select[0] === ARTIFACTS) {
		info.artifact(game.artifacts[game.select[1]]);
	} else if (game.select[0] === ARTIFACT_REWARDS) {
		info.artifact(game.room[6][game.select[1]], 179 + (game.select[1] * 32), 90);
	} else if (game.select[0] === DECK && game.select[1] == 1 && game.deckLocal.length) {
		const keywords = cards[Object.deepCopy(game.deckLocal).cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)].id]?.keywords;
		let x = 0, y = 0;
		if (keywords instanceof Array) {
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.deck(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
		};
	} else if ((game.select[0] === VOID || game.select[0] === DISCARD) && game.select[1] == 1 && game[game.select[0] === VOID ? "void" : "discard"].length) {
		const keywords = cards[game[game.select[0] === VOID ? "void" : "discard"][game.cardSelect[0] + (game.cardSelect[1] * 6)].id]?.keywords;
		let x = 0, y = 0;
		if (keywords instanceof Array) {
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.deck(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
		};
	} else if (game.select[0] === CARD_REWARDS && game.select[1] > -1 && game.select[1] < get.cardRewardChoices()) {
		const keywords = cards[game.room[5][game.select[1]]]?.keywords;
		let x = 0, y = 0;
		if (keywords instanceof Array) {
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.reward(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
		};
	};
	if ((game.select[0] === HAND || (game.select[0] != ATTACK_ENEMY && game.select[0] != LOOKAT_ENEMY && !hidden() && global.options.sticky_cards)) && game.hand.length && game.prevCard < game.hand.length) {
		const keywords = cards[game.hand[game.prevCard].id]?.keywords;
		let x = 0, y = 0;
		if (keywords instanceof Array) {
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.card(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
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
	if (popups.length > 7) {
		popups.shift();
	};
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
			draw.lore(popups[a][2] + 13, 150 - (a * 21) + 8, popups[a][4] ? popups[a][1] + "\n" + popups[a][4] : popups[a][1], {"text-small": !!popups[a][4]});
			if (popup[popups[a][0]]) draw.image(popup[popups[a][0]], popups[a][2] + 2, 150 - (a * 21) + 2);
			if (game.select[0] === POPUPS && game.select[1] == a) {
				draw.image(select.popup, popups[a][2] - 1, 150 - (a * 21) - 1);
			};
		};
	};
};

function rewardGraphics(focused = true) {
	draw.box(150, 20, 100, 160);
	const place = game.location.split(", ");
	const type = (game.location == "-1" ? BATTLEROOM : game.map[place[0]][place[1]][0]);
	if (type === BATTLEROOM) draw.lore(200 - 2, 21, "Battle Loot!", {"text-align": CENTER});
	else if (type === TREASUREROOM) draw.lore(200 - 2, 21, "Treasure!", {"text-align": CENTER});
	else if (type === ORBROOM) draw.lore(200 - 2, 21, "Healing!", {"text-align": CENTER});
	else draw.lore(200 - 2, 21, "Rewards!", {"text-align": CENTER});
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
	const choices = get.cardRewardChoices();
	let x = 199 - (choices * 68 / 2), y = 20, width = (choices * 68) + 2, height = 160;
	draw.box(x, y, width, height);
	if (choices === 2) draw.lore(200 - 2, y + 1, "Choose your card\nreward:", {"text-align": CENTER});
	else if (choices === 1) draw.lore(200 - 2, y + 1, "Choose your\ncard reward", {"text-align": CENTER});
	else draw.lore(200 - 2, y + 1, "Choose your card reward:", {"text-align": CENTER});
	handPos = [];
	for (let index = 0; index < choices; index++) {
		handPos.push((199 - (choices * 68 / 2)) + 1 + (index * 68));
		draw.card(new Card(game.room[5][index]), index, 50);
	};
	if (game.select[1] > -1 && game.select[1] < choices && focused) {
		draw.card(new Card(game.room[5][game.select[1]]), game.select[1], 50, true);
	};
	if ((game.select[1] === -1 || game.select[1] === choices) && focused) draw.rect("#fff", x, y + height - 14, width, 14);
	draw.box(x + 2, y + height - 12, width - 4, 10);
	draw.lore(x + 3, y + height - 11, "Go back");
};

function artifactRewardGraphics(focused = true) {
	rewardGraphics(false);
	let x = 140, y = 70, width = 120, height = 60;
	draw.box(x, y, width, height);
	draw.lore(200 - 2, y + 1, "Pick an artifact:", {"text-align": CENTER});
	for (let index = 0; index < 3; index++) {
		const name = ("" + artifacts[game.room[6][index]].name).replace(/\s/g, "_");
		draw.image(artifact[name], 160 + (index * 32), 90);
		if (game.select[1] === index) draw.image(select[name], 159 + (index * 32), 89);
	};
	if ((game.select[1] === -1 || game.select[1] === 3) && focused) draw.rect("#fff", x, y + height - 14, width, 14);
	draw.box(x + 2, y + height - 12, width - 4, 10);
	draw.lore(x + 3, y + height - 11, "Go back");
};

function mapGraphics(onlyCalc = false) {
	let render = !onlyCalc;
	if (render) {
		draw.rect("#000");
		draw.image(map.top, 3, 12);
		draw.image(map.row, 16, 20, map.row.width, 164);
		draw.image(map.bottom, 16, 184);
		if (game.state == "event_fin") {
			if (game.location == "-1") draw.image(map.select_first, 13, 12);
			else draw.image(map.select, 13 + ((+game.location.split(", ")[0] + 1) * 32), 12);
		} else if (game.location != "-1") {
			if (game.floor % 10 == 0) {
				draw.image(map.select, 18 + (9 * 32), 12);
				draw.image(map.select, 12 + (10 * 32), 12);
			} else if (game.location.split(", ")[0] == "0") {
				draw.image(map.select_first, 13, 12);
			} else {
				draw.image(map.select, 13 + (+game.location.split(", ")[0] * 32), 12);
			};
		};
		draw.image(extra.deck, 22, 16);
		if (game.mapSelect == (paths[game.location] || []).length) draw.image(select.deck, 21, 15);
		draw.image(extra.end, 22, 179);
		if (game.mapSelect == -1) draw.image(select.round, 21, 178);
		draw.lore(1, 1, "floor " + game.floor + " - " + game.gold + " gold", {"color": "red"});
		draw.lore(393, 1, "seed: " + game.seed, {"color": "white", "text-align": LEFT});
	};
	let store = [];
	for (let x = 0; x < game.map.length; x++) {
		for (let y = 0; y < game.map[x].length; y++) {
			if (!game.map[x][y]) continue;
			let drawX = 25 + (x * 32) + game.map[x][y][1];
			let drawY = 18 + (y * 32) + game.map[x][y][2];
			if (game.map[x][y][0] === BOSSROOM) {
				drawX = 25 + 10 + 8 + (x * 32);
				drawY = 90 + 8;
			};
			if (x === 0 && render) {
				if (game.traveled[x] === y) draw.line(drawX + 8, drawY + 8, 18, drawY + 8, "#842", 3);
				else draw.line(drawX + 8, drawY + 8, 18, drawY + 8, "#b84", 3);
			};
			for (let branch = 0; branch < 2; branch++) {
				let posX, posY, connectNode = [];
				const calcNode = (nodeX, nodeY) => {
					connectNode = [nodeX - x, nodeY];
					store.push([x, y, nodeX, nodeY]);
					if (game.map[nodeX][nodeY][0] === BOSSROOM) {
						posX = 25 + 10 + 8 + (nodeX * 32);
						posY = 90 + 8;
					} else {
						posX = 25 + (nodeX * 32) + game.map[nodeX][nodeY][1];
						posY = 18 + (nodeY * 32) + game.map[nodeX][nodeY][2];
					};
				};
				for (num = 0; num < 7; num++) {
					if (branch && x != game.map.length - 1) {
						if (game.map[x + 1][y - num]) {
							calcNode(x + 1, y - num);
							break;
						} else if (game.map[x + 1][y + num]) {
							calcNode(x + 1, y + num);
							break;
						};
					} else if (x !== 0) {
						if (game.map[x - 1][y - num]) {
							calcNode(x - 1, y - num);
							break;
						} else if (game.map[x - 1][y + num]) {
							calcNode(x - 1, y + num);
							break;
						};
					};
				};
				if (render) {
					if (game.traveled[x] === y && game.traveled[x + connectNode[0]] === connectNode[1]) {
						draw.line(drawX + 8, drawY + 8, posX + 8, posY + 8, "#842", 3);
					} else {
						draw.line(drawX + 8, drawY + 8, posX + 8, posY + 8, "#b84", 3);
					};
				};
			};
		};
	};
	if (render) {
		const str = paths[game.location] ? paths[game.location][game.mapSelect] : undefined;
		const coordSel = str ? str.split(", ") : [];
		const coordOn = game.location.split(", ");
		for (let x = 0; x < game.map.length; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (!game.map[x][y]) continue;
				let drawX = 25 + (x * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (game.map[x][y][0] === BATTLEROOM) {
					draw.image(map.battle, drawX, drawY);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.battle, drawX - 1, drawY - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.battle_blue, drawX - 1, drawY - 1);
				} else if (game.map[x][y][0] === PRIMEROOM) {
					draw.image(map.death_zone, drawX, drawY);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.death_zone, drawX - 1, drawY - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.death_zone_blue, drawX - 1, drawY - 1);
				} else if (game.map[x][y][0] === TREASUREROOM) {
					if (game.map[x][y][3]) {
						draw.image(map.treasure_open, drawX, drawY);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_open_blue, drawX - 1, drawY - 1);
					} else {
						draw.image(map.treasure, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.treasure, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_blue, drawX - 1, drawY - 1);
					};
				} else if (game.map[x][y][0] === ORBROOM) {
					draw.image(map.orb, drawX, drawY);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.orb, drawX - 1, drawY - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.orb_blue, drawX - 1, drawY - 1);
				} else if (game.map[x][y][0] === BOSSROOM) {
					drawX += 10;
					draw.image(map.boss, drawX, 90);
					if (x == coordSel[0] && y == coordSel[1]) draw.image(select.boss, drawX - 1, 90 - 1);
					if (x == coordOn[0] && y == coordOn[1]) draw.image(select.boss_blue, drawX - 1, 90 - 1);
				};
			};
		};
	};
	paths = {};
	for (let num = 0; num < store.length; num++) {
		if (store[num][2] > store[num][0]) {
			if (!(paths["" + store[num][0] + ", " + store[num][1]])) paths["" + store[num][0] + ", " + store[num][1]] = [];
			if (!(paths["" + store[num][0] + ", " + store[num][1]].includes("" + store[num][2] + ", " + store[num][3]))) paths["" + store[num][0] + ", " + store[num][1]].push("" + store[num][2] + ", " + store[num][3]);
		} else if (store[num][0] > store[num][2]) {
			if (!(paths["" + store[num][2] + ", " + store[num][3]])) paths["" + store[num][2] + ", " + store[num][3]] = [];
			if (!(paths["" + store[num][2] + ", " + store[num][3]].includes("" + store[num][0] + ", " + store[num][1]))) paths["" + store[num][2] + ", " + store[num][3]].push("" + store[num][0] + ", " + store[num][1]);
		};
		if (store[num][0] === 0) {
			if (!(paths["-1"])) paths["-1"] = [];
			if (!(paths["-1"].includes("" + store[num][0] + ", " + store[num][1]))) paths["-1"].push("" + store[num][0] + ", " + store[num][1]);
		};
	};
	for (const item in paths) {
		if (Object.hasOwnProperty.call(paths, item)) {
			paths[item].sort();
		};
	}
};
