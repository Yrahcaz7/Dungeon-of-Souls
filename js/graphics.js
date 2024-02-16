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

let backAnim = [0, UP, 0.5, DOWN, -1, UP, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tempAnim = [0, -1, STARTING, -1], effAnim = [0, "none"], playerAnim = [0, "idle"], starAnim = [0, 1.5, 3, 0.5, 2, 3.5], extraAnim = [], primeAnim = 0, transition = 0, auraBladePos = [[65, 10], [80, 25], [40, 0], [25, 35]], auraBladeAnim = [0, UP, 2.5, UP, 3, DOWN, 0.5, DOWN], invNum = -1, popups = [], infPos = 0, infLimit = 0;

const draw = {
	/**
	 * Draws an image on the canvas.
	 * @param {HTMLImageElement} image - the image to draw.
	 * @param {number} x - the x-coordinate to draw the image at. Defaults to `0`.
	 * @param {number} y - the y-coordinate to draw the image at. Defaults to `0`.
	 * @param {number} width - the width of the image. Defaults to `image.width`.
	 * @param {number} height - the height of the image. Defaults to `image.height`.
	 */
	image(image, x = 0, y = 0, width = image.width, height = image.height) {
		ctx.drawImage(image, x * scale, y * scale, width * scale, height * scale);
	},
	/**
	 * Draws an image sector on the canvas.
	 * @param {HTMLImageElement} image - the image to draw.
	 * @param {number} sx - the x-coordinate to retrieve the sector from.
	 * @param {number} sy - the y-coordinate to retrieve the sector from.
	 * @param {number} sw - the width of the sector.
	 * @param {number} sh - the height of the sector.
	 * @param {number} dx - the x-coordinate to draw the image at. Defaults to `0`.
	 * @param {number} dy - the y-coordinate to draw the image at. Defaults to `0`.
	 * @param {number} dw - the width of the image. Defaults to `sw`.
	 * @param {number} dh - the height of the image. Defaults to `sh`.
	 */
	imageSector(image, sx, sy, sw, sh, dx = 0, dy = 0, dw = +sw, dh = +sh) {
		ctx.drawImage(image, sx, sy, sw, sh, dx * scale, dy * scale, dw * scale, dh * scale);
	},
	/**
	 * Draws a rectangle on the canvas.
	 * @param {string} color - the color of the rectangle.
	 * @param {number} x - the x-coordinate to draw the rectangle at. Defaults to `0`.
	 * @param {number} y - the y-coordinate to draw the rectangle at. Defaults to `0`.
	 * @param {number} width - the width of the rectangle. Defaults to `canvas.width / scale`.
	 * @param {number} height - the height of the rectangle. Defaults to `canvas.height / scale`.
	 */
	rect(color, x = 0, y = 0, width = canvas.width / scale, height = canvas.height / scale) {
		ctx.fillStyle = color;
		ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
	},
	/**
	 * Draws a line on the canvas.
	 * @param {number} x1 - the x-coordinate to start drawing at.
	 * @param {number} y1 - the y-coordinate to start drawing at.
	 * @param {number} x2 - the x-coordinate to end drawing at.
	 * @param {number} y2 - the y-coordinate to end drawing at.
	 * @param {string} color - the color of the line. Defaults to `#000`.
	 * @param {number} width - the width of the line. Defaults to `1`.
	 */
	line(x1, y1, x2, y2, color = "#000", width = 1) {
		ctx.beginPath();
		if (color) ctx.strokeStyle = color;
		else ctx.strokeStyle = "#000";
		if (width) ctx.lineWidth = width * scale;
		else ctx.lineWidth = 1 * scale;
		ctx.moveTo(x1 * scale, y1 * scale);
		ctx.lineTo(x2 * scale, y2 * scale);
		ctx.stroke();
	},
	/**
	 * Draws a curved line on the canvas.
	 * @param {number} x1 - the x-coordinate to start drawing at.
	 * @param {number} y1 - the y-coordinate to start drawing at.
	 * @param {number} x2 - the x-coordinate of the control point.
	 * @param {number} y2 - the y-coordinate of the control point.
	 * @param {number} x3 - the x-coordinate to end drawing at.
	 * @param {number} y3 - the y-coordinate to end drawing at.
	 * @param {string} color - the color of the line. Defaults to `#000`.
	 * @param {number} width - the width of the line. Defaults to `1`.
	 */
	curvedLine(x1, y1, x2, y2, x3, y3, color = "#000", width = 1) {
		ctx.beginPath();
		if (color) ctx.strokeStyle = color;
		else ctx.strokeStyle = "#000";
		if (width) ctx.lineWidth = width * scale;
		else ctx.lineWidth = 1 * scale;
		ctx.moveTo(x1 * scale, y1 * scale);
		ctx.quadraticCurveTo(x2 * scale, y2 * scale, x3 * scale, y3 * scale);
		ctx.stroke();
	},
	/**
	 * Draws a character on the canvas.
	 * @param {string} char - the character to draw.
	 * @param {number} x - the x-coordinate to draw the character at.
	 * @param {number} y - the y-coordinate to draw the character at.
	 * @param style - the character's style object.
	 */
	char(char, x, y, style = {"color": "#000", "highlight-color": "", "text-small": false}) {
		// defualt values
		if (!style["color"]) style["color"] = "black";
		if (!style["text-small"]) style["text-small"] = false;
		// highlight
		if (style["highlight-color"] && char.charCodeAt() >= 32) {
			if (style["text-small"]) draw.rect(style["highlight-color"], x - 0.5, y - 0.5, 3.5, 5.5);
			else draw.rect(style["highlight-color"], x - 1, y - 1, 7, 11);
		};
		// draw char
		if (characters[char]) {
			ctx.fillStyle = style["color"];
			for (let row = 0; row < characters[char].length; row++) {
				for (let index = 0; index < characters[char][row].length; index++) {
					if (characters[char][row][index]) {
						if (style["text-small"]) ctx.fillRect(x * scale + index, y * scale + row, 1, 1);
						else ctx.fillRect((x + index) * scale, (y + row) * scale, scale, scale);
					};
				};
			};
		};
	},
	/**
	 * Draws some lore on the canvas.
	 * @param {number} x - the x-coordinate to draw the lore at.
	 * @param {number} y - the y-coordinate to draw the lore at.
	 * @param {string} str - the string containing the lore.
	 * @param style - the lore's style object.
	 */
	lore(x, y, str, style = {"color": "#000", "highlight-color": "#222", "text-align": RIGHT, "text-small": false}) {
		str = "" + str;
		if (!style["color"]) style["color"] = "black";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = RIGHT;
		if (!style["text-small"]) style["text-small"] = false;
		let color = style["color"], highlight = "", position = style["text-align"], small = style["text-small"];
		str = str.replace(/<br>/g, "\n");
		x = Math.round(x * 2) / 2;
		y = Math.round(y * 2) / 2;
		let enters = 0, enterIndex = 0, len = str.replace(/<.*?>/g, "").length;
		// check for size tags
		if (str.includes("<b>") || str.includes("<big>") || str.includes("<s>") || str.includes("<small>")) {
			str = str.replace(/<\/b>|<\/big>|<\/s>|<\/small>/g, "");
			let array = str.split(/<(?=b>|big>|s>|small>)/g);
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
		// print special multi-line text
		if (str.includes("\n") && position !== RIGHT) {
			let array = str.split("\n");
			let space = 0;
			if (!array[0]) array.splice(0, 1);
			for (let index = 0; index < array.length; index++) {
				space += draw.lore(x, y + space, array[index], style);
			};
			return space;
		};
		// print all text
		for (let a = 0; a < str.length; a++) {
			// check for color tags
			if (str.charAt(a) == "<") {
				const cut = str.slice(a + 1), tag = cut.slice(0, cut.indexOf(" ") == -1 ? cut.indexOf(">") : Math.min(cut.indexOf(">"), cut.indexOf(" ")));
				if (color == tag.slice(1) && tag.startsWith("/")) {
					highlight = "";
					color = style["color"];
					str = str.replace("<" + tag + ">", "");
				} else {
					if (cut.slice(0, cut.indexOf(">")).includes("highlight")) highlight = style["highlight-color"];
					else highlight = "";
					color = tag;
					str = str.replace(new RegExp("<" + tag + ".*?>"), "");
				};
			};
			// calculate length of this line
			if (str.replace(/<.*?>/g, "").includes("\n", enterIndex + 1)) {
				len = str.replace(/<.*?>/g, "").indexOf("\n", enterIndex + 1);
			};
			let char = str.charAt(a);
			if (char == "\n") {
				enters++;
				enterIndex = a + 1;
			};
			// don't print if no color
			if (color == "none" || style["color"] == "none") continue;
			// print character
			if (position === RIGHT) {
				draw.char(char, x + ((a - enterIndex) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (position === LEFT) {
				draw.char(char, x + (((a - enterIndex) - len) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (position === CENTER) {
				draw.char(char, x + ((a - enterIndex) * (small ? 3 : 6)) - (len * (small ? 1.5 : 3)) + (small ? 1 : 2), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			};
		};
		return small ? (enters + 1) * 5.5 : (enters + 1) * 11;
	},
	/**
	 * Draws the selector on the canvas.
	 * @param {number} x - the x-coordinate to draw the selector at.
	 * @param {number} y - the y-coordinate to draw the selector at.
	 * @param {number} width - the width of the selector.
	 * @param {number} height - the height of the selector.
	 */
	selector(x, y, width, height) {
		draw.image(select.selector[0], x - 2, y - 2);
		draw.image(select.selector[1], x + width - 6, y - 2);
		draw.image(select.selector[2], x - 2, y + height - 7);
		draw.image(select.selector[3], x + width - 6, y + height - 7);
	},
	/**
	 * Draws an intent on the canvas.
	 * @param {number} x - the x-coordinate to draw the intent at.
	 * @param {number} y - the y-coordinate to draw the intent at.
	 * @param {number} effect - how powerful the intent is.
	 * @param {ATTACK | DEFEND} type - the type of intent. Can be `ATTACK` or `DEFEND`.
	 */
	intent(x, y, effect, type) {
		if (type === BUFF) {
			draw.image(intent.buff, x, y);
			return;
		};
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
		if (type === ATTACK) {
			draw.image(intent.attack[stage], x, y);
			draw.lore(x + 30 - 16, y + 12, effect, {"color": "#fff", "text-align": CENTER});
		} else if (type === DEFEND) {
			draw.image(intent.defend[stage], x, y);
			draw.lore(x + 30 - 16, y + 11, effect, {"color": "#fff", "text-align": CENTER});
		};
	},
	/**
	 * Draws a box on the canvas.
	 * @param {number} x - the x-coordinate to draw the box at.
	 * @param {number} y - the y-coordinate to draw the box at.
	 * @param {number} width - the width of the box.
	 * @param {number} height - the height of the box.
	 * @param style - the box's style object.
	 */
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
	/**
	 * Draws an entity's status bars on the canvas.
	 * @param {number} x - the x-coordinate to draw the status bars at.
	 * @param {number} y - the y-coordinate to draw the status bars at.
	 * @param {number} health - the health of the entity.
	 * @param {number} maxHealth - the max health of the entity.
	 * @param {number} shield - the shield of the entity. Defaults to `0`.
	 * @param {number} maxShield - the max shield of the entity. Defaults to `0`.
	 */
	bars(x, y, health, maxHealth, shield = 0, maxShield = 0) {
		let cutoff, percentage = health / maxHealth;
		if (percentage < 0) cutoff = 0;
		else if (percentage > 1) cutoff = 62;
		else cutoff = Math.round(percentage * 62);
		if ((health < 10 && maxHealth >= 10) || (health < 100 && maxHealth >= 100) || (health < 1000 && maxHealth >= 1000)) {
			health = "0" + health;
		};
		draw.imageSector(bar.health_full, 0, 0, cutoff + 1, 12, x, y + 65);
		draw.imageSector(bar.health_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 65);
		draw.lore(x + 31, y + 67, health, {"text-align": LEFT});
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
		draw.lore(x + 31, y + 78, shield, {"text-align": LEFT});
		draw.lore(x + 34, y + 78, maxShield);
	},
	/**
	 * Draws a card on the canvas.
	 * @param {Card} cardObject - the card object.
	 * @param {number} index - the index of the card.
	 * @param {number} y - the y-coordinate to draw the card at.
	 * @param {boolean} selected - whether the card is selected or not. Defaults to `false`.
	 * @param {number} overrideX - overrides the calculated x-coordinate to draw at.
	 * @param {boolean} outside - whether the card is outside the battle or not. Defaults to `false`.
	 */
	card(cardObject, index, y, selected = false, overrideX = NaN, outside = false) {
		// setup
		if (!(cardObject instanceof Object)) cardObject = new Card(cardObject);
		let x = handPos[index], img = card.error;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		const rarity = +cards[cardObject.id].rarity, name = cards[cardObject.id].name;
		if (card[rarities[rarity]] && rarity >= 0) img = card[rarities[rarity]][name];
		// card back
		if (cardObject.id !== 0) draw.image(card.back, x + 2, y + 2);
		// card outline
		const type = types[Math.floor(cardObject.id / 1000)];
		if (card.outline[type]) draw.image(card.outline[type], x + 3, y + 3);
		// card selector
		if (selected) {
			if (cards[cardObject.id].keywords.includes("unplayable")) {
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
		if (name.length >= 11) draw.lore(x + 33, y + 44, name.title(), {"text-align": CENTER, "text-small": true});
		else draw.lore(x + 32, y + 42, name.title(), {"text-align": CENTER});
		// card description
		let desc = cards[cardObject.id].desc, exDamage = get.extraDamage(), mulDamage = get.dealDamageMult(), valueIsLess = false;
		if (cards[cardObject.id].attackEffects !== false && !outside) {
			if (cards[cardObject.id].keywords.includes("uniform")) exDamage = Math.floor(exDamage * 0.5);
			if (game.select[0] === ATTACK_ENEMY) mulDamage = get.dealDamageMult(game.select[1]);
			if (exDamage || mulDamage !== 1) {
				desc = desc.replace(/(deal\s)(\d+)(\s<#f44>damage<\/#f44>)/gi, (substring, pre, number, post) => {
					const original = parseInt(number);
					let damage = Math.ceil((original + exDamage) * mulDamage);
					if (damage > original) {
						return pre + "<#0f0 highlight>" + damage + "</#0f0>" + post;
					} else if (damage < original) {
						valueIsLess = true;
						return pre + "<#fff highlight>" + damage + "</#fff>" + post;
					} else {
						return pre + damage + post;
					};
				});
			};
		};
		let exShield = get.extraShield();
		if (exShield && !outside) {
			desc = desc.replace(/(gain\s)(\d+)(\s<#58f>shield<\/#58f>)/gi, (substring, pre, number, post) => {
				const original = parseInt(number);
				let shield = Math.ceil(original + exShield);
				if (shield > original) {
					return pre + "<#0f0 highlight>" + shield + "</#0f0>" + post;
				} else {
					return pre + shield + post;
				};
			});
		};
		// draw text and image
		draw.lore(x + 6, y + 55, desc, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		draw.lore(x + 33, y + 89.5, rarities[rarity] + "|" + type, {"text-align": CENTER, "text-small": true});
		if (rarity == 2) {
			draw.image(card.rarity.rare, x - 2, y - 2);
		};
		if (!cards[cardObject.id].keywords.includes("unplayable")) {
			let cost = getCardCost(cardObject);
			if (cost < cards[cardObject.id].cost) draw.image(card.green_energy, x, y);
			else if (cost > cards[cardObject.id].cost) draw.image(card.red_energy, x, y);
			else draw.image(card.energy, x, y);
			draw.lore(x + 4, y + 2, getCardCost(cardObject));
		};
	},
	/**
	 * Draws a textbox on the canvas.
	 * @param {number} x - the x-coordinate to draw the textbox at.
	 * @param {number} y - the y-coordinate to draw the textbox at.
	 * @param {number} width - the width of the textbox, measured in characters.
	 * @param {string} str - the string containing the lore to insert into the textbox.
	 * @param style - the textbox's style object.
	 */
	textBox(x, y, width, str, style = {"color": "black", "highlight-color": "#222", "text-align": RIGHT, "text-small": false, "background-color": "#ccc", "border-width": 1, "border-color": "#000"}) {
		if (!style["color"]) style["color"] = "black";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = RIGHT;
		if (!style["text-small"]) style["text-small"] = false;
		if (!style["background-color"]) style["background-color"] = "#ccc";
		if (!style["border-width"]) style["border-width"] = 1;
		if (!style["border-color"]) style["border-color"] = "#000";
		let small = style["text-small"];
		let position = style["text-align"];
		let lines = (("" + str).match(/\n/g) || []).length, height = small ? 7 : 12;
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
		draw.lore(x + 1, y + 1, str, style);
		return height + 4;
	},
};

const info = {
	/**
	 * Draws an infobox for a card in the player's hand.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	card(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.prevCard] + xPlus, y = 147 - Math.floor(cardAnim[game.prevCard]) + yPlus;
		if ((game.prevCard == game.hand.length - 1 && game.hand.length >= 4) || (game.prevCard == game.hand.length - 2 && game.hand.length >= 7)) {
			const ref = cards[game.hand[game.prevCard].id];
			if (ref.keywords.includes("unplayable") && ref.rarity <= 1) x -= 143;
			else x -= 145;
		};
		return draw.textBox(x + 69, y, 24, infoText[type], {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in a special hand select.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	card_select(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.select[1]] + xPlus, y = 15 + yPlus;
		if ((game.select[1] == game.hand.length - 1 && game.hand.length >= 4) || (game.select[1] == game.hand.length - 2 && game.hand.length >= 7)) {
			const ref = cards[game.hand[game.select[1]].id];
			if (ref.keywords.includes("unplayable") && ref.rarity <= 1) x -= 143;
			else x -= 145;
		};
		return draw.textBox(x + 69, y, 24, infoText[type], {"text-small": true});
	},
	/**
	 * Draws an infobox for a card reward choice.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	reward(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.select[1]] + xPlus;
		if (game.select[1] == get.cardRewardChoices() - 1 && get.cardRewardChoices() >= 4) {
			const ref = cards[game.room[5][game.select[1]]];
			if (ref.keywords.includes("unplayable") && ref.rarity <= 1) x -= 143;
			else x -= 145;
		};
		return draw.textBox(x + 69, 51 + yPlus, 24, infoText[type], {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in a deck.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	deck(type, xPlus = 0, yPlus = 0) {
		let x = (game.cardSelect[0] * 66) + xPlus, y = 15 + (game.cardSelect[1] * 98) - game.deckPos + yPlus;
		if (game.cardSelect[0] >= 4) {
			const loc = (((game.select[0] === IN_MAP && game.select[1]) || game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY) ? "deck" : (game.select[0] === DECK ? "deckLocal" : (game.select[0] === VOID ? "void" : "discard")));
			const ref = cards[game[loc][game.cardSelect[0] + (game.cardSelect[1] * 6)].id];
			if (ref.keywords.includes("unplayable") && ref.rarity <= 1) x -= 143;
			else x -= 145;
		};
		return draw.textBox(x + 71, y, 24, infoText[type], {"text-small": true});
	},
	/**
	 * Draws an infobox for the player.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	player(type, xPlus = 0, yPlus = 0) {
		if (typeof type != "string") return 0;
		const ending = (type.endsWith("s") || type == "burn" || type == "countdown" || type == "resilience") ? "" : "s";
		const eff = game.eff[type.replace(/\s/g, "_") + ending];
		let y = 71 + yPlus, desc = "You have " + eff + " " + type + (eff >= 2 ? ending : "") + ".", move = 0;
		move += draw.textBox(85 + xPlus, y + move, desc.length, desc, {"text-small": true});
		move += draw.textBox(85 + xPlus, y + move, 24, infoText[type], {"text-small": true});
		return move;
	},
	/**
	 * Draws an infobox for the selected enemy.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	enemy(type, xPlus = 0, yPlus = 0) {
		if (typeof type != "string") return 0;
		const pos = enemyPos[game.select[1]];
		const ending = (type.endsWith("s") || type == "burn" || type == "countdown" || type == "resilience") ? "" : "s";
		const eff = game.enemies[game.select[1]].eff[type.replace(/\s/g, "_") + ending];
		let y = pos[1] + yPlus, desc = "This has " + eff + " " + type + (eff >= 2 ? ending : "") + ".", move = 0;
		move += draw.textBox(pos[0] - (desc.length * 3) - 0.5 + xPlus, y + move, desc.length, desc, {"text-small": true});
		move += draw.textBox(pos[0] - 72.5 + xPlus, y + move, 24, infoText[type], {"text-small": true});
		if (type == "countdown") move += draw.textBox(pos[0] - 72.5 + xPlus, y + move, 24, "The next intent will be\nto " + INTENT[game.enemies[game.select[1]].intentHistory[eff - 1]] + ".", {"text-small": true});
		return move;
	},
	/**
	 * Draws an infobox for the selected enemy's intent.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	intent(xPlus = 0, yPlus = 0) {
		const pos = enemyPos[game.select[1]], select = game.enemies[game.select[1]];
		let y = pos[1] + 14 + yPlus;
		if (select.type === SLIME.BIG) y -= 17;
		else if (select.type === SLIME.SMALL) y -= 7;
		else if (select.type === SLIME.PRIME) {
			if (primeAnim == -1 || primeAnim >= 5) y -= 37;
			else y -= 17;
		} else if (select.type === FRAGMENT) {
			if (primeAnim == -1 || primeAnim > 18) y -= 36;
			else y = NaN;
		};
		if (y === y) {
			let desc = infoText[select.intent];
			if (desc) draw.textBox(pos[0] - 71 + xPlus, y - (desc.match(/\n/g) || []).length * 3, 28, desc, {"text-small": true});
		};
	},
	/**
	 * Draws an infobox for an artifact.
	 * @param {string} type - the infobox contains `infoText[type]`.
	 * @param {number} xOveride - overrides the x-coordinate of the infobox.
	 * @param {number} yOveride - overrides the y-coordinate of the infobox.
	 */
	artifact(type, xOveride = NaN, yOveride = NaN) {
		if (type == "the map") {
			let x = (xOveride === xOveride ? xOveride : 21), y = (yOveride === yOveride ? yOveride : 12);
			draw.textBox(x, y, 12, "The Map", {"text-align": CENTER});
			draw.textBox(x, y + 13, 24, infoText["the map"], {"text-small": true});
		} else {
			let x = (xOveride === xOveride ? xOveride : 39 + (game.select[1] * 18)), y = (yOveride === yOveride ? yOveride : 12);
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

const graphics = {
	/**
	 * Draws the background layer on the canvas.
	 */
	backgrounds() {
		if (transition < 100) {
			draw.image(background.cave);
			draw.rect("#10106080");
			draw.image(background.temple);
			draw.image(background.floating_arch, 136, 34 - Math.round(backAnim[0]));
			draw.image(background.debris, 151, 92 - Math.round(backAnim[2]));
		};
		if (game.artifacts.includes(0) && game.floor == 10) {
			if (transition < 100) {
				ctx.globalAlpha = transition / 100;
			};
			draw.image(background.tunnel_of_time, 0 - backAnim[6]);
			if (!game.enemies[0]?.eff?.countdown) backAnim[6]++;
			else backAnim[6]--;
			if (backAnim[6] >= 16) backAnim[6] -= 16;
			else if (backAnim[6] < 0) backAnim[6] += 16;
			ctx.globalAlpha = 1;
		};
		if (game.floor != 10) {
			let now = new Date(), time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()], x = 170, y = 63 - Math.round(backAnim[4]);
			time[2] += (time[3] / 1000);
			time[1] += (time[2] / 60);
			time[0] += (time[1] / 60);
			if (time[0] >= 12) time[0] = time[0] - 12;
			draw.image(clock.face, x, y);
			draw.imageSector(clock.hour_hand, Math.floor((time[0]) * 82 / 12) * 24, 0, 24, 24, x + 18, y + 18);
			draw.imageSector(clock.min_hand, Math.floor((time[1]) * 80 / 60) * 34, 0, 34, 34, x + 13, y + 13);
			draw.image(clock.node, x + 26, y + 26);
		};
		for (let index = 0; index < backAnim.length; index += 2) {
			if (backAnim[index] >= 1) backAnim[index + 1] = DOWN;
			else if (backAnim[index] <= -1) backAnim[index + 1] = UP;
			if (backAnim[index + 1] === UP) backAnim[index] += (Math.random() + 0.5) * 0.075;
			else if (backAnim[index + 1] === DOWN) backAnim[index] -= (Math.random() + 0.5) * 0.075;
		};
	},
	/**
	 * Draws the middle layer on the canvas.
	 */
	middleLayer() {
		if (game.artifacts.includes(0) && game.floor == 10) {
			if (extraAnim.length == 0) {
				for (let index = 0; index < 9; index++) {
					extraAnim[index] = [Math.random() * 180 + 6, index * 50 - Math.random() * 10, Math.floor(Math.random() * 20 + index) % 20];
				};
			};
			if (transition < 100) {
				ctx.globalAlpha = transition / 100;
			};
			for (let index = 0; index < extraAnim.length; index++) {
				if (extraAnim[index][2] < 8) {
					draw.imageSector(background.column_debri, (extraAnim[index][2] % 8) * 16, 0, 16, 8, Math.floor(400 - extraAnim[index][1]), Math.floor(extraAnim[index][0]));
				} else if (extraAnim[index][2] < 16) {
					ctx.scale(-1, 1);
					draw.imageSector(background.column_debri, (extraAnim[index][2] % 8) * 16, 0, 16, 8, Math.floor(extraAnim[index][1] - 400), Math.floor(extraAnim[index][0]), -16, 8);
					ctx.scale(-1, 1);
				} else if (extraAnim[index][2] % 2 == 0) {
					draw.image(background.debris, Math.floor(400 - extraAnim[index][1]), Math.floor(extraAnim[index][0] + 1));
				} else {
					ctx.scale(-1, 1);
					draw.image(background.debris, Math.floor(extraAnim[index][1] - 400), Math.floor(extraAnim[index][0] + 1), -6, 6);
					ctx.scale(-1, 1);
				};
				const rand = Math.random();
				if (rand < 0.05) extraAnim[index][0]++;
				else if (rand < 0.1) extraAnim[index][0]--;
				if (!game.enemies[0]?.eff?.countdown) extraAnim[index][1] += (Math.random() - 0.5) + 2;
				else extraAnim[index][1] -= (Math.random() - 0.5) + 2;
				if (extraAnim[index][1] >= 450) {
					extraAnim[index] = [Math.random() * 180 + 6, 0 - Math.random() * 10, Math.floor(Math.random() * 20 + index) % 20];
				} else if (extraAnim[index][1] <= 0) {
					extraAnim[index] = [Math.random() * 180 + 6, 450 + Math.random() * 10, Math.floor(Math.random() * 20 + index) % 20];
				};
			};
			ctx.globalAlpha = 1;
		};
	},
	/**
	 * Draws the foreground layer on the canvas.
	 */
	foregrounds() {
		const past = game.select[2];
		if (past) {
			if (past[0] === REWARDS) graphics.rewards(false);
			else if (past[0] === CARD_REWARDS) graphics.cardRewards(false);
			else if (past[0] === ARTIFACT_REWARDS) graphics.artifactRewards(false);
		};
		if (game.select[0] === LOOKER && game.select[1] === 1) draw.imageSector(extra.looker, 15, 0, 16, 16, 343, 3);
		else draw.imageSector(extra.looker, 0, 0, 16, 16, 343, 3);
		draw.image(extra.help, 362, 3);
		draw.image(extra.options, 380, 2);
		draw.image(extra.end, 3, 163);
		draw.image(extra.deck, 4, 182);
		if (game.void.length) draw.image(extra.void, 381, 163);
		draw.image(extra.discard, 382, 182);
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
		else if (game.select[0] === DECK) draw.image(select.deck, 3, 181);
		else if (game.select[0] === VOID) draw.image(select.round, 380, 162);
		else if (game.select[0] === DISCARD) draw.image(select.discard, 381, 181);
		else if (game.select[0] === MAP) draw.image(select.map, 1, 11);
		draw.lore(1, 1, "floor " + game.floor + " - " + game.gold + " gold", {"color": "#f44"});
	},
	/**
	 * Draws the player on the canvas.
	 */
	player() {
		let x = 15, y = 30;
		// aura blades
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
		// icons
		for (const key in game.eff) {
			if (Object.hasOwnProperty.call(game.eff, key)) {
				if (game.eff[key]) {
					let img = icon[key.endsWith("s") && !key.endsWith("ss") ? key.slice(0, -1) : key];
					if (game.shield) {
						draw.image(img, x + 23, y + 104);
						draw.lore(x + 40, y + 112, game.eff[key], {"color": "#fff", "text-align": LEFT});
					} else {
						draw.image(img, x + 23, y + 93);
						draw.lore(x + 40, y + 101, game.eff[key], {"color": "#fff", "text-align": LEFT});
					};
					x += 17;
				};
			};
		};
		x = 15;
		// animations
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
		// bars
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
		draw.lore(x + 15, y + 28, energy, {"text-align": LEFT});
		draw.lore(x + 18, y + 28, get.maxEnergy());
	},
	/**
	 * Draws the current effect on the canvas.
	 */
	effect() {
		if (effAnim[1] == "war cry") {
			draw.imageSector(war_cry, Math.floor(effAnim[0]) * 188, 0, 188, 188, -22, -18, 188, 188);
			effAnim[0]++;
			if (effAnim[0] >= 35) effAnim = [0, "none"];
		};
	},
	/**
	 * Draws the enemies on the canvas.
	 */
	enemy() {
		// icons
		for (let index = 0; index < game.enemies.length; index++) {
			let select = game.enemies[index], pos = enemyPos[index];
			draw.bars(pos[0], pos[1], select.health, select.maxHealth, select.shield, select.maxShield);
			let x = +pos[0], y = +pos[1];
			for (const key in select.eff) {
				if (Object.hasOwnProperty.call(select.eff, key)) {
					let img = new Image();
					if (icon[key]) img = icon[key];
					else if (key == "reinforces") img = icon.reinforce;
					else if (key == "rewinds") img = icon.rewind;
					if (select.eff[key]) {
						if (select.shield) {
							draw.image(img, x, y + 89);
							draw.lore(x + 17, y + 97, select.eff[key], {"color": "#fff", "text-align": LEFT});
						} else {
							draw.image(img, x, y + 78);
							draw.lore(x + 17, y + 86, select.eff[key], {"color": "#fff", "text-align": LEFT});
						};
						x += 17;
					};
				};
			};
		};
		// enemy drawing
		for (let index = 0; index < game.enemies.length; index++) {
			let select = game.enemies[index], pos = enemyPos[index];
			if (!pos) return;
			if (enemyAnim[index] >= 4) enemyAnim[index] = 0;
			if (index !== invNum) {
				if (select.type === SLIME.BIG) {
					if (select.shield > 0) draw.imageSector(enemy.slime.big_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					else draw.imageSector(enemy.slime.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
				} else if (select.type === SLIME.SMALL) {
					if (select.shield > 0) draw.imageSector(enemy.slime.small_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					else draw.imageSector(enemy.slime.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
				} else if (select.type === SLIME.PRIME) {
					if (primeAnim == -1) {
						if (select.shield > 0) draw.imageSector(enemy.slime.prime_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						else draw.imageSector(enemy.slime.prime, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					} else {
						if (select.shield > 0) draw.imageSector(enemy.slime.to_prime_defend, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						else draw.imageSector(enemy.slime.to_prime, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1);
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
		};
		// action animations
		if (game.enemyNum != -1) {
			let pos = enemyPos[game.enemyNum];
			if (tempAnim[3] === ATTACK) {
				if (tempAnim[1] === SLIME.SMALL) {
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
						enemyAnim[game.enemyNum] = 0;
						game.enemyStage = ENDING;
						invNum = -1;
					} else {
						game.enemyStage = PENDING;
						invNum = game.enemyNum;
					};
				} else if (tempAnim[1] === SLIME.BIG) {
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
					} else if (tempAnim[0] == 4) {
						game.enemyStage = MIDDLE;
					} else {
						game.enemyStage = PENDING;
					};
				};
			} else if (tempAnim[3] === DEFEND) {
				if (tempAnim[1] === SLIME.SMALL) {
					draw.imageSector(enemy.slime.small_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, tempAnim[0] + 20, 64, pos[0], pos[1]);
					tempAnim[0]++;
					if (game.enemyStage === MIDDLE) {
						tempAnim = [0, -1, STARTING, -1];
						game.enemyStage = ENDING;
					} else if (tempAnim[0] >= 24) {
						tempAnim[0] = 24;
						game.enemyStage = MIDDLE;
					} else {
						game.enemyStage = PENDING;
					};
				} else if (tempAnim[1] === SLIME.BIG) {
					draw.imageSector(enemy.slime.big_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, tempAnim[0] * 2 + 5, 64, pos[0], pos[1]);
					tempAnim[0]++;
					if (game.enemyStage === MIDDLE) {
						tempAnim = [0, -1, STARTING, -1];
						game.enemyStage = ENDING;
					} else if (tempAnim[0] >= 27) {
						tempAnim[0] = 27;
						game.enemyStage = MIDDLE;
					} else {
						game.enemyStage = PENDING;
					};
				} else if (tempAnim[1] === SLIME.PRIME) {
					draw.imageSector(enemy.slime.prime_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, tempAnim[0] * 3, 64, pos[0], pos[1] + 1);
					tempAnim[0]++;
					if (game.enemyStage === MIDDLE) {
						tempAnim = [0, -1, STARTING, -1];
						game.enemyStage = ENDING;
					} else if (tempAnim[0] >= 20) {
						tempAnim[0] = 20;
						game.enemyStage = MIDDLE;
					} else {
						game.enemyStage = PENDING;
					};
				};
			};
		};
		// move idle animations along
		for (let index = 0; index < game.enemies.length; index++) {
			enemyAnim[index] += (Math.random() + 0.5) * 0.1;
		};
		// intents
		for (let index = 0; index < game.enemies.length; index++) {
			let select = game.enemies[index], pos = enemyPos[index];
			if (starAnim[index] >= 4) starAnim[index] = 0;
			if (index !== game.enemyNum) {
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
				let power = 0;
				if (game.enemies[index].intent === ATTACK) {
					power = game.enemies[index].getTotalAttackPower();
					power = Math.ceil(power * get.takeDamageMult(index));
				} else if (game.enemies[index].intent === DEFEND) {
					power = game.enemies[index].getTotalDefendPower();
				};
				draw.intent(pos[0] + 16, y, power, game.enemies[index].intent);
			};
			starAnim[index] += (Math.random() + 0.5) * 0.15;
		};
	},
	/**
	 * Draws the current info page on the canvas.
	 */
	info() {
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
			draw.lore(1, 1 - infPos, "Dungeon of Souls - Changelog", {"color": "#f44"});
			draw.lore(1, 23 - infPos, changelog, {"color": "#fff"});
		} else if (game.select[1] == 2) {
			infLimit = limit(gameplay);
			draw.lore(1, 1 - infPos, "Dungeon of Souls - How To Play", {"color": "#f44"});
			draw.lore(1, 23 - infPos, gameplay, {"color": "#fff"});
		} else {
			infLimit = limit(overview);
			draw.lore(1, 1 - infPos, "Dungeon of Souls - Overview", {"color": "#f44"});
			draw.lore(1, 23 - infPos, overview, {"color": "#fff"});
		};
		draw.lore(1, 12 - infPos, 'Source can be found at "https://github.com/Yrahcaz7/Dungeon-of-Souls"', {"color": "#f44", "text-small": true});
		if (infLimit > 0) {
			draw.lore(360, 32, "Scrollable", {"color": "#fff", "text-align": LEFT});
			draw.image(arrows, 367, 22);
		};
	},
	/**
	 * Draws the options on the canvas.
	 * @param {boolean} focused - whether the option layer is focused. Defaults to `true`.
	 */
	options(focused = true) {
		const options = Object.keys(global.options);
		let text = "";
		for (let index = 0; index < options.length; index++) {
			let option = global.options[options[index]];
			if (typeof option == "boolean") {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + options[index].title() + ": " + (option ? "ON" : "OFF") + "</#ff0>\n";
				else text += options[index].title() + ": " + (option ? "ON" : "OFF") + "\n";
			} else if (typeof option == "number") {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + options[index].title() + ": " + option + "x</#ff0>\n";
				else text += options[index].title() + ": " + option + "x\n";
			} else {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + options[index].title() + ": " + option + "</#ff0>\n";
				else text += options[index].title() + ": " + option + "\n";
			};
		};
		if (game.select[1] - 2 === options.length && focused) text += "\n<#ff0>RESTART RUN</#ff0>";
		else text += "\nRESTART RUN";
		draw.rect("#000c");
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Options", {"color": "#fff", "text-align": CENTER});
		draw.rect("#fff", 1, 12, 378, 1);
		draw.lore(200 - 2, 15, text.trim().replace(/_/g, " "), {"color": "#fff", "text-align": CENTER});
		draw.image(extra.options, 380, 2);
		if (game.select[1] == 1 && focused) draw.image(select.options, 380, 2);
	},
	/**
	 * Draws a deck on the canvas.
	 * @param {Card[]} deck - the deck to draw.
	 */
	deck(deck) {
		draw.rect("#000c");
		const len = +deck.length;
		if (len > 0) {
			if (game.cardSelect[0] + (game.cardSelect[1] * 6) >= len) game.cardSelect = [(len - 1) % 6, Math.floor((len - 1) / 6)];
			if (game.deckPos > Math.max(98 * (Math.floor((len - 1) / 6) - 1) + 11, 0)) game.deckPos = Math.max(98 * (Math.floor((len - 1) / 6) - 1) + 11, 0);
			let selected;
			for (let x = 0, y = 0; x + (y * 6) < len; x++) {
				if (x === game.cardSelect[0] && y === game.cardSelect[1]) {
					selected = [x, y];
				} else {
					draw.card(deck[x + (y * 6)], -1, 14 + (y * 98) - game.deckPos, false, 2 + (x * 66), (game.select[0] === IN_MAP || game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY));
				};
				if (x >= 5) {
					x = -1;
					y++;
				};
			};
			if (selected) {
				draw.card(deck[selected[0] + (selected[1] * 6)], -1, 14 + (selected[1] * 98) - game.deckPos, true, 2 + (selected[0] * 66), (game.select[0] === IN_MAP || game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY));
			};
			graphics.target();
			selected = game.cardSelect;
			if (game.deckPos >= 98 * selected[1]) {
				game.deckPos -= Math.min(10, Math.abs(game.deckPos - (98 * selected[1])));
			} else if (game.deckPos <= (98 * (selected[1] - 1)) + 11) {
				game.deckPos += Math.min(10, Math.abs(game.deckPos - ((98 * (selected[1] - 1)) + 11)));
			};
		};
		draw.rect("#0004", 0, 0, 400, 13);
		if (game.select[0] === DECK) draw.lore(200 - 2, 1, "Deck", {"color": "#fff", "text-align": CENTER});
		else if (game.select[0] === DISCARD) draw.lore(200 - 2, 1, "Discard", {"color": "#fff", "text-align": CENTER});
		else if (game.select[0] === VOID) draw.lore(200 - 2, 1, "Void", {"color": "#fff", "text-align": CENTER});
		else if (game.select[0] === IN_MAP) draw.lore(200 - 2, 1, "Cards", {"color": "#fff", "text-align": CENTER});
		else if (game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY) draw.lore(200 - 2, 1, "Purifier: Pick a Card to Destroy", {"color": "#fff", "text-align": CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
	},
	/**
	 * Draws the player's hand on the canvas.
	 */
	hand() {
		if (game.select[0] === ATTACK_ENEMY) {
			draw.card(game.enemyAtt[2], 0, 22, true, 50);
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
			draw.lore(handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1] + notif[3], notif[2], {
				"color": "#ff4444" + Math.min(16 - notif[1], 15).toString(16) + "f",
				"text-align": CENTER,
			});
			notif[1]++;
			if (notif[1] > 16) notif = [-1, 0];
		};
	},
	/**
	 * Draws the player's hand in a special select on the canvas.
	 */
	hand_select() {
		draw.rect("#000c");
		draw.image(extra.end, 3, 55);
		draw.image(extra.end, 381, 55);
		if (game.select[1] == -1) draw.image(select.round, 2, 54);
		else if (game.select[1] == game.hand.length) draw.image(select.round, 380, 54);
		let temp = -1;
		for (let index = 0; index < game.hand.length; index++) {
			let card = game.hand[index];
			if (index == game.select[1]) {
				temp = index;
			} else if (index == game.enemyAtt[0]) {
				ctx.globalAlpha = 0.75;
				draw.card(card, index, 14);
				ctx.globalAlpha = 1;
			} else {
				draw.card(card, index, 14);
			};
		};
		if (temp != -1) {
			draw.card(game.hand[temp], temp, 14, true);
		};
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Select a Card", {"color": "#fff", "text-align": CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
	},
	/**
	 * Draws the selector and the info it targets on the canvas.
	 */
	target() {
		if (game.select[0] === MAP) {
			info.artifact("the map");
		} else if (game.select[0] === ATTACK_ENEMY || game.select[0] === LOOKAT_ENEMY) {
			const enemy = game.enemies[game.select[1]];
			const enemyType = enemy.type;
			const pos = enemyPos[game.select[1]];
			let coords = [], name = ENEMY_NAMES[enemyType];
			if (enemyType === SLIME.SMALL) {
				coords = [19, 36, 26, 28];
			} else if (enemyType === SLIME.BIG || (enemyType === SLIME.PRIME && primeAnim != -1 && primeAnim < 5)) {
				coords = [5, 26, 54, 38];
				name = "big slime";
			} else if (enemyType === SLIME.PRIME) {
				coords = [0, 7, 64, 57];
			} else if (enemyType === FRAGMENT && (primeAnim == -1 || primeAnim > 18)) {
				coords = [7, 6, 50, 58];
			};
			if (coords) {
				if (game.select[1] !== game.enemyNum) info.intent();
				let left = game.select[1] === 0 && game.enemies.length > 1;
				draw.selector(pos[0] + coords[0], pos[1] + coords[1], coords[2], coords[3]);
				draw.lore(pos[0] + 31, pos[1] + coords[1] - 7.5, name, {"color": "#fff", "text-align": CENTER, "text-small": true});
				const exAtt = enemy.getExtraAttackPower();
				const exDef = enemy.getExtraDefendPower();
				if (left) draw.lore(pos[0] + coords[0] - 2.5, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-align": LEFT, "text-small": true});
				else draw.lore(pos[0] + coords[0] + coords[2] + 3, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-small": true});
				let x = coords[0] - 5.5, y = coords[1] - 1;
				for (const key in game.enemies[game.select[1]].eff) {
					if (Object.hasOwnProperty.call(game.enemies[game.select[1]].eff, key)) {
						if (game.enemies[game.select[1]].eff[key]) {
							let type = key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " ");
							let height = Math.ceil(((infoText[type]).match(/\n/g) || []).length * 5.5 + 22);
							if (y + height >= 200 - pos[1]) {
								y = coords[1] - 1;
								x -= 77;
							};
							y += info.enemy(type, x, (left ? y + 12 : y));
						};
					};
				};
			};
		} else if (game.select[0] === LOOKAT_YOU) {
			let coords = [59, 72, 22, 39];
			if (playerAnim[1] == "shield" || playerAnim[1] == "shield_reinforced") coords = [58, 72, 23, 39];
			else if (playerAnim[1] == "crouch_shield" || playerAnim[1] == "crouch_shield_reinforced") coords = [58, 72, 22, 39];
			draw.selector(coords[0], coords[1], coords[2], coords[3]);
			if (game.character == "knight") {
				if (global.charStage.knight === 0) draw.lore(coords[0] + (coords[2] / 2) - 1, 64.5, "the forgotten one", {"color": "#fff", "text-align": CENTER, "text-small": true});
				else if (global.charStage.knight == 1) draw.lore(coords[0] + (coords[2] / 2) - 1, 64.5, "the true knight", {"color": "#fff", "text-align": CENTER, "text-small": true});
			};
			let x = coords[0] + coords[2] - 80, y = 0;
			for (const key in game.eff) {
				if (Object.hasOwnProperty.call(game.eff, key)) {
					if (game.eff[key]) {
						let type = key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " ");
						let height = Math.ceil(((infoText[type]).match(/\n/g) || []).length * 5.5 + 22);
						if (y + height >= 200 - coords[1]) {
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
			const keywords = cards[game.deckLocal.slice(0).cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)].id]?.keywords;
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
		} else if ((game.select[0] === IN_MAP && game.select[1]) || game.select[0] === PURIFIER || game.select[0] === CONFIRM_PURIFY) {
			const keywords = cards[game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)].id]?.keywords;
			let x = 0, y = 0;
			if (keywords instanceof Array) {
				for (let index = 0; index < keywords.length; index++) {
					const key = "" + keywords[index];
					if (key) y += info.deck(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
				};
			};
		};
		if ((game.select[0] === HAND || (game.select[0] != ATTACK_ENEMY && game.select[0] != LOOKAT_ENEMY && !hidden() && global.options.sticky_cards)) && game.hand.length && game.prevCard < game.hand.length) {
			const keywords = cards[game.hand[game.prevCard].id].keywords;
			let x = 0, y = 0;
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.card(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
		} else if (game.select[0] === SELECT_HAND && game.select[1] >= 0 && game.select[1] < game.hand.length) {
			const keywords = cards[game.hand[game.select[1]].id].keywords;
			let x = 0, y = 0;
			for (let index = 0; index < keywords.length; index++) {
				const key = "" + keywords[index];
				if (key) y += info.card_select(key.endsWith("s") && !key.endsWith("ss") ? key.replace(/_/g, " ").slice(0, -1) : key.replace(/_/g, " "), x, y);
			};
		};
	},
	/**
	 * Draws the popups on the canvas.
	 */
	popups() {
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
	},
	/**
	 * Draws the reward claiming box on the canvas.
	 * @param {boolean} focused - whether the reward layer is focused. Defaults to `true`.
	 */
	rewards(focused = true) {
		draw.box(150, 20, 100, 160);
		const place = game.location.split(", ");
		const type = (game.location == "-1" ? ROOM.BATTLE : game.map[place[0]][place[1]][0]);
		if (type === ROOM.BATTLE) draw.lore(200 - 2, 21, "Battle Loot!", {"text-align": CENTER});
		else if (type === ROOM.TREASURE) draw.lore(200 - 2, 21, "Treasure!", {"text-align": CENTER});
		else if (type === ROOM.ORB) draw.lore(200 - 2, 21, "Healing!", {"text-align": CENTER});
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
	},
	/**
	 * Draws the card reward choosing box on the canvas.
	 * @param {boolean} focused - whether the card reward layer is focused. Defaults to `true`.
	 */
	cardRewards(focused = true) {
		const choices = get.cardRewardChoices();
		let x = 199 - (choices * 68 / 2), y = 20, width = (choices * 68) + 2, height = 160;
		draw.box(x, y, width, height);
		if (choices === 1) draw.lore(200 - 2, y + 1, "Take the\ncard?", {"text-align": CENTER});
		else draw.lore(200 - 2, y + 1, "Pick a card:", {"text-align": CENTER});
		handPos = [];
		for (let index = 0; index < choices; index++) {
			handPos.push((199 - (choices * 68 / 2)) + 1 + (index * 68));
			draw.card(new Card(game.room[5][index]), index, 50, false, NaN, true);
		};
		if (game.select[1] > -1 && game.select[1] < choices && focused) {
			draw.card(new Card(game.room[5][game.select[1]]), game.select[1], 50, true, NaN, true);
		};
		if ((game.select[1] === -1 || game.select[1] === choices) && focused) draw.rect("#fff", x, y + height - 14, width, 14);
		draw.box(x + 2, y + height - 12, width - 4, 10);
		draw.lore(x + 3, y + height - 11, "Go back");
	},
	/**
	 * Draws the artifact reward choosing box on the canvas.
	 * @param {boolean} focused - whether the artifact reward layer is focused. Defaults to `true`.
	 */
	artifactRewards(focused = true) {
		graphics.rewards(false);
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
	},
	/**
	 * Calculates the map paths, then draws the map on the canvas.
	 * @param {boolean} onlyCalc - whether to only calculate the map paths. Defaults to `false`.
	 */
	map(onlyCalc = false) {
		let render = !onlyCalc;
		// draw map
		if (render) {
			draw.rect("#000");
			draw.image(map.top, 3, 12);
			draw.image(map.row, 16, 20, map.row.width, 164);
			draw.image(map.bottom, 16, 184);
			if (game.state === STATE.EVENT_FIN) {
				if (game.floor % 10 == 9) {
					draw.image(map.select, 18 + (9 * 32), 12);
					draw.image(map.select, 12 + (10 * 32), 12);
				} else if (game.location == "-1") {
					draw.image(map.select_first, 13, 12);
				} else {
					draw.image(map.select, 13 + ((+game.location.split(", ")[0] + 1) * 32), 12);
				};
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
			draw.lore(1, 1, "floor " + game.floor + " - " + game.gold + " gold", {"color": "#f44"});
			draw.lore(399, 1, "seed: " + game.seed, {"color": "#fff", "text-align": LEFT});
		};
		// draw scibbles
		if (render) {
			for (let x = 0; x < game.map.length; x++) {
				for (let y = 0; y < game.map[x].length; y++) {
					if (typeof game.map[x][y] != "number") continue;
					draw.image(map.scribble_back, 25 + (x * 32) + 8 - 4, 18 + (y * 32) + 8 - 3 - 2.5, 80 / 2, 80 / 2);
					draw.imageSector(map.scribbles, game.map[x][y] * 64, 0, 64, 70, 25 + (x * 32) + 8, 18 + (y * 32) + 8 - 3, 64 / 2, 70 / 2);
				};
			};
		};
		// calculate nodes
		let store = [];
		for (let x = 0; x < game.map.length; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (typeof game.map[x][y] != "object") continue;
				let drawX = 25 + (x * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (game.map[x][y][0] === ROOM.BOSS) {
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
						if (game.map[nodeX][nodeY][0] === ROOM.BOSS) {
							posX = 25 + 10 + 8 + (nodeX * 32);
							posY = 90 + 8;
						} else {
							posX = 25 + (nodeX * 32) + game.map[nodeX][nodeY][1];
							posY = 18 + (nodeY * 32) + game.map[nodeX][nodeY][2];
						};
					};
					for (num = 0; num < 7; num++) {
						if (branch && x != game.map.length - 1) {
							if (typeof game.map[x + 1][y - num] == "object") {
								calcNode(x + 1, y - num);
								break;
							} else if (typeof game.map[x + 1][y + num] == "object") {
								calcNode(x + 1, y + num);
								break;
							};
						} else if (x !== 0) {
							if (typeof game.map[x - 1][y - num] == "object") {
								calcNode(x - 1, y - num);
								break;
							} else if (typeof game.map[x - 1][y + num] == "object") {
								calcNode(x - 1, y + num);
								break;
							};
						};
					};
					if (render && !(game.traveled[x] === y && game.traveled[x + connectNode[0]] === connectNode[1])) {
						draw.curvedLine(drawX + 8, drawY + 8, (drawX + posX) / 2 + 8, (x % 2 == 0 ? drawY : posY) + 8, posX + 8, posY + 8, "#b84", 3);
					};
				};
			};
		};
		// draw traveled path
		if (render) {
			let drawX, drawY;
			for (let index = 0; index < game.traveled.length; index++) {
				let y = game.traveled[index];
				if (drawX && drawY) {
					let posX = 25 + (index * 32) + game.map[index][y][1];
					let posY = 18 + (y * 32) + game.map[index][y][2];
					if (game.map[index][y][0] === ROOM.BOSS) {
						posX = 25 + 10 + 8 + (index * 32);
						posY = 90 + 8;
					};
					draw.curvedLine(drawX + 8, drawY + 8, (drawX + posX) / 2 + 8, (index % 2 == 1 ? drawY : posY) + 8, posX + 8, posY + 8, "#842", 3);
					drawX = posX;
					drawY = posY;
				} else {
					drawX = 25 + (index * 32) + game.map[index][y][1];
					drawY = 18 + (y * 32) + game.map[index][y][2];
				};
			};
		};
		// draw nodes
		if (render) {
			const str = paths[game.location] ? paths[game.location][game.mapSelect] : undefined;
			const coordSel = str ? str.split(", ") : [];
			const coordOn = game.location.split(", ");
			for (let x = 0; x < game.map.length; x++) {
				for (let y = 0; y < game.map[x].length; y++) {
					if (typeof game.map[x][y] != "object") continue;
					let drawX = 25 + (x * 32) + game.map[x][y][1];
					let drawY = 18 + (y * 32) + game.map[x][y][2];
					if (game.map[x][y][0] === ROOM.BATTLE) {
						draw.image(map.battle, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.battle, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.battle_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.PRIME) {
						draw.image(map.death_zone, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.death_zone, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.death_zone_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.TREASURE) {
						if (game.map[x][y][3]) {
							draw.image(map.treasure_open, drawX, drawY);
							if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_open_blue, drawX - 1, drawY - 1);
						} else {
							draw.image(map.treasure, drawX, drawY);
							if (x == coordSel[0] && y == coordSel[1]) draw.image(select.treasure, drawX - 1, drawY - 1);
							if (x == coordOn[0] && y == coordOn[1]) draw.image(select.treasure_blue, drawX - 1, drawY - 1);
						};
					} else if (game.map[x][y][0] === ROOM.ORB) {
						draw.image(map.orb, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.orb, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.orb_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.BOSS) {
						drawX += 10;
						draw.image(map.boss, drawX, 90);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.boss, drawX - 1, 90 - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.boss_blue, drawX - 1, 90 - 1);
					} else if (game.map[x][y][0] === ROOM.EVENT) {
						draw.image(map.event, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(select.orb, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(select.orb_blue, drawX - 1, drawY - 1);
					};
				};
			};
		};
		// create paths
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
		// sort paths
		for (const item in paths) {
			if (Object.hasOwnProperty.call(paths, item)) {
				paths[item].sort();
			};
		};
	},
};

const startAnim = {
	/**
	 * Starts a player animation.
	 * @param {string} type - the name of the player animation.
	 */
	player(type) {
		if (!player[type]) return;
		if (game.eff.aura_blades && (type == "attack" || type == "attack_2")) type += "_aura";
		if (game.eff.reinforces && (type == "shield" || type == "crouch_shield")) type += "_reinforced";
		playerAnim = [0, type];
	},
	/**
	 * Starts an effect animation.
	 * @param {string} type - the name of the effect animation.
	 */
	effect(type) {
		effAnim = [0, type];
	},
	/**
	 * Starts an enemy animation.
	 */
	enemy() {
		let name = game.enemies[game.enemyNum].type;
		tempAnim = [0, name, STARTING, game.enemies[game.enemyNum].intent];
		invNum = -1;
	},
};
