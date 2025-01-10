/*  Dungeon of Souls
 *  Copyright (C) 2025 Yrahcaz7
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

let auraBladePos = [[65, 10], [80, 25], [42, 0], [28, 35]], enemyPos = [], handPos = [], paths = {};

let backAnim = [0, 1.5, 3, 0], enemyAnim = [0, 1.5, 3, 0.5, 2, 3.5], enemyAnimSync = 0, enemyActionAnim = [0, ANIM.STARTING], intentAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [], effAnim = [0, null], playerAnim = [0, I.player.idle], extraAnim = [], primeAnim = 0, transition = 0, screenShake = 0, auraBladeAnim = [0, 3, 6, 1];

let enemyActionAnimData = [], infoPos = 0, infoLimit = 0;

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
	imageSector(image, sx, sy, sw, sh, dx = 0, dy = 0, dw = sw, dh = sh) {
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
	 * Draws a polygon on the canvas.
	 * @param {number[]} points - the coordinates of the polygon's points.
	 * @param style - the polygon's style object.
	 */
	polygon(points, style = {"background-color": "#000", "border-width": 0, "border-color": "#000"}) {
		if (!style["background-color"]) style["background-color"] = "#000";
		if (!style["border-width"]) style["border-width"] = 0;
		if (!style["border-color"]) style["border-color"] = "#000";
		ctx.beginPath();
		ctx.fillStyle = style["background-color"];
		ctx.strokeStyle = style["border-color"];
		ctx.lineWidth = style["border-width"] * scale;
		for (let index = 0; index + 1 < points.length; index += 2) {
			ctx.lineTo(points[index] * scale, points[index + 1] * scale);
		};
		ctx.closePath();
		ctx.fill();
		if (style["border-width"] > 0) ctx.stroke();
	},
	/**
	 * Draws a clock's hands and node on the canvas.
	 * @param {number} x - the x-coordinate of the clock.
	 * @param {number} y - the y-coordinate of the clock.
	 * @param {number} hours - the time of the hour hand. Defaults to `0`.
	 * @param {number} minutes - the time of the minute hand. Defaults to `0`.
	 * @param {number} offsetH - the offset of the hour hand. Defaults to `0`.
	 * @param {number} offsetM - the offset of the minute hand. Defaults to `0`.
	 */
	clock(x, y, hours = 0, minutes = 0, offsetH = 0, offsetM = 0) {
		ctx.filter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#filter')`;
		let coords = [(x + 30) * scale, (y + 30) * scale];
		if (hours >= 0) {
			ctx.save();
			ctx.translate(coords[0], coords[1]);
			ctx.rotate(hours / 6 * Math.PI);
			let points = [-1, -3, -1, -9, -3, -9, -3, -10, 0, -13, 3, -10, 3, -9, 1, -9, 1, -3];
			if (offsetH) {
				for (let index = 0; index + 1 < points.length; index += 2) {
					points[index + 1] = Math.max(points[index + 1] - offsetH, -30);
				};
			};
			draw.polygon(points, {"background-color": "#f07000"});
			ctx.restore();
		};
		if (minutes >= 0) {
			ctx.save();
			ctx.translate(coords[0], coords[1]);
			ctx.rotate(minutes / 30 * Math.PI);
			let points = [-1, -3, -1, -12, -3, -12, -3, -13, 0, -16, 3, -13, 3, -12, 1, -12, 1, -3];
			if (offsetM) {
				for (let index = 0; index + 1 < points.length; index += 2) {
					points[index + 1] = Math.max(points[index + 1] - offsetM, -30);
				};
			};
			draw.polygon(points, {"background-color": "#f0e000"});
			ctx.restore();
		};
		ctx.filter = "none";
		draw.image(I.background.clock_node, x + 26, y + 26);
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
		if (!style["color"]) style["color"] = "#000";
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
	lore(x, y, str, style = {"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false}) {
		str = "" + str;
		if (!style["color"]) style["color"] = "#000";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = DIR.RIGHT;
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
		if (str.includes("\n") && position !== DIR.RIGHT) {
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
			if (position === DIR.RIGHT) {
				draw.char(char, x + ((a - enterIndex) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (position === DIR.LEFT) {
				draw.char(char, x + (((a - enterIndex) - len) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (position === DIR.CENTER) {
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
		draw.image(I.select.selector[0], x - 2, y - 2);
		draw.image(I.select.selector[1], x + width - 6, y - 2);
		draw.image(I.select.selector[2], x - 2, y + height - 7);
		draw.image(I.select.selector[3], x + width - 6, y + height - 7);
	},
	/**
	 * Draws an intent of an enemy on the canvas.
	 * @param {number} index - the index of the enemy.
	 */
	intent(index) {
		if (game.enemies[index].eff[ENEMY_EFF.SHROUD]) return;
		if (index === game.enemyNum) return;
		let x = enemyPos[index][0] + 16;
		let y = getEnemyIntentPos(index, true);
		if (game.enemies[index].intent === INTENT.SUMMON) {
			if (game.enemies.length >= 6) draw.image(I.intent.ritual, x, y);
			else draw.image(I.intent.summon, x, y);
		} else if (game.enemies[index].intent === INTENT.BUFF) {
			draw.image(I.intent.buff, x, y);
		} else if (game.enemies[index].intent === INTENT.ATTACK) {
			let power = game.enemies[index].getTotalAttackPower();
			power = Math.ceil(power * get.takeDamageMult(index));
			draw.image(I.intent.attack[Math.min(Math.floor(power / 5), 10)], x, y);
			draw.lore(x + 30 - 16, y + 12, power, {"color": "#fff", "text-align": DIR.CENTER});
		} else if (game.enemies[index].intent === INTENT.DEFEND) {
			let power = game.enemies[index].getTotalDefendPower();
			power = Math.ceil(power * get.enemyShieldMult(index));
			draw.image(I.intent.defend[Math.min(Math.floor(power / 5), 10)], x, y);
			draw.lore(x + 30 - 16, y + 11, power, {"color": "#fff", "text-align": DIR.CENTER});
		};
		intentAnim[index] += (Math.random() + 0.5) * 0.15;
		if (intentAnim[index] >= 4) intentAnim[index] -= 4;
	},
	/**
	 * Draws a box on the canvas.
	 * @param {number} x - the x-coordinate to draw the box at.
	 * @param {number} y - the y-coordinate to draw the box at.
	 * @param {number} width - the box's width.
	 * @param {number} height - the box's height.
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
		draw.imageSector(I.bar.health_full, 0, 0, cutoff + 1, 12, x, y + 65);
		draw.imageSector(I.bar.health_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 65);
		draw.lore(x + 31, y + 67, health, {"text-align": DIR.LEFT});
		draw.lore(x + 34, y + 67, maxHealth);
		percentage = shield / maxShield;
		if (percentage < 0) cutoff = 0;
		else if (percentage > 1) cutoff = 62;
		else cutoff = Math.round(percentage * 62);
		if ((shield < 10 && maxShield >= 10) || (shield < 100 && maxShield >= 100) || (shield < 1000 && maxShield >= 1000)) {
			shield = "0" + shield;
		};
		draw.imageSector(I.bar.shield_full, 0, 0, cutoff + 1, 12, x, y + 76);
		draw.imageSector(I.bar.shield_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 76);
		draw.lore(x + 31, y + 78, shield, {"text-align": DIR.LEFT});
		draw.lore(x + 34, y + 78, maxShield);
	},
	/**
	 * Draws a card on the canvas.
	 * @param {Card} cardObj - the card object.
	 * @param {number} index - the index of the card.
	 * @param {number} y - the y-coordinate to draw the card at.
	 * @param {boolean} selected - whether the card is selected or not. Defaults to `false`.
	 * @param {number} overrideX - overrides the calculated x-coordinate to draw at.
	 * @param {boolean} outside - whether the card is outside the battle or not. Defaults to `false`.
	 */
	card(cardObj, index, y, selected = false, overrideX = NaN, outside = false) {
		// setup
		if (!(cardObj instanceof Object)) cardObj = new Card(cardObj);
		let x = handPos[index], img = I.card.error;
		if ((overrideX || overrideX === 0) && overrideX === overrideX) x = overrideX;
		const rarity = +cards[cardObj.id].rarity;
		if (rarity >= 0 && I.card[RARITY[rarity]]) img = I.card[RARITY[rarity]][cardObj.id];
		// card back
		if (cardObj.id !== 0) draw.image(I.card.back, x + 2, y + 2);
		// card outline
		const type = CARD_TYPE[Math.floor(cardObj.id / 1000)];
		if (I.card.outline[type]) draw.image(I.card.outline[type], x + 3, y + 3);
		// card selector
		if (selected) {
			if (cards[cardObj.id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
				if (rarity == 2) draw.image(I.select.card_rare_unplayable, x - 2, y - 3);
				else draw.image(I.select.card_unplayable, x + 1, y + 1);
			} else {
				if (rarity == 2) draw.image(I.select.card_rare, x - 2, y - 3);
				else draw.image(I.select.card, x - 1, y - 1);
			};
		};
		// card image
		if (img == I.card.error) draw.image(I.card.error, x + 2, y + 2);
		else draw.image(img, x + 7, y + 7);
		// card title
		const name = getCardAttr("name", cardObj.id, cardObj.level);
		if (cards[cardObj.id].name.length >= 10) draw.lore(x + 33, y + 44, name, {"text-align": DIR.CENTER, "text-small": true});
		else draw.lore(x + 32, y + 42, name, {"text-align": DIR.CENTER});
		// card description
		let desc = getCardAttr("desc", cardObj.id, cardObj.level), exDamage = get.extraDamage(), mulDamage = get.dealDamageMult(), valueIsLess = false;
		if (cards[cardObj.id].attackEffects !== false && !outside) {
			if (cards[cardObj.id].keywords.includes(CARD_EFF.UNIFORM)) exDamage = Math.floor(exDamage * 0.5);
			if (game.select[0] === S.ATTACK) mulDamage = get.dealDamageMult(game.select[1]);
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
		// card text
		draw.lore(x + 6, y + 55, desc, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		draw.lore(x + 33, y + 89.5, (RARITY[rarity] || "error") + "|" + type, {"text-align": DIR.CENTER, "text-small": true});
		// card energy and rarity
		if (rarity == 2) draw.image(I.card.rarity.rare, x - 1, y - 2);
		if (!cards[cardObj.id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
			let originalCost = getCardAttr("cost", cardObj.id, cardObj.level);
			if (outside) {
				draw.image(I.card.energy, x, y);
				draw.lore(x + 4, y + 2, originalCost);
			} else {
				let cost = getCardCost(cardObj);
				if (cost < originalCost) draw.image(I.card.green_energy, x, y);
				else if (cost > originalCost) draw.image(I.card.red_energy, x, y);
				else draw.image(I.card.energy, x, y);
				draw.lore(x + 4, y + 2, cost);
			};
		};
	},
	/**
	 * Draws a textbox on the canvas.
	 * @param {number} x - the x-coordinate to draw the textbox at.
	 * @param {number} y - the y-coordinate to draw the textbox at.
	 * @param {number} width - the textbox's width, measured in characters.
	 * @param {string} str - the string containing the lore to insert into the textbox.
	 * @param style - the textbox's style object.
	 */
	textBox(x, y, width, str, style = {"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false, "background-color": "#ccc", "border-width": 1, "border-color": "#000"}) {
		if (!style["color"]) style["color"] = "#000";
		if (!style["highlight-color"]) style["highlight-color"] = "#222";
		if (!style["text-align"]) style["text-align"] = DIR.RIGHT;
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
		if (position === DIR.CENTER) {
			x += width / 2;
			if (small) x -= 1.5;
			else x -= 2.5;
		} else if (position === DIR.LEFT) {
			x += width;
			if (small) x -= 4;
			else x -= 7;
		};
		draw.lore(x + 1, y + 1, str, style);
		return height + 4;
	},
	/**
	 * Draw's an enemy's icons on the canvas.
	 * @param {number} index - the index of the enemy.
	 */
	enemyIcons(index) {
		let enemy = game.enemies[index], pos = enemyPos[index];
		draw.bars(pos[0], pos[1], enemy.health, enemy.maxHealth, enemy.shield, enemy.maxShield);
		let x = +pos[0], y = +pos[1];
		for (const key in enemy.eff) {
			if (enemy.eff.hasOwnProperty(key) && enemy.eff[key]) {
				let img = I.icon[key];
				if (img === I.icon[1704]) draw.image(I.icon["1704_back"], x - 1, y + 88);
				draw.image(img, x, y + 89);
				if (!PERM_EFF_DESC[key]) draw.lore(x + 17, y + 97, enemy.eff[key], {"color": "#fff", "text-align": DIR.LEFT});
				x += 17;
				if (x >= pos[0] + (index == 0 && game.void.length && game.enemies.length > 2 ?
					(Object.keys(enemy.eff).length > (game.enemies.length > 3 ? 4 : 6) ? 51 : 34)
					: 68
				)) {
					x = pos[0];
					y += 17;
				};
			};
		};
	},
};

const info = {
	/**
	 * Draws an infobox for a card in the player's hand.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	card(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.prevCard] + 69 + xPlus, y = 147 - Math.floor(cardAnim[game.prevCard]) + yPlus;
		if (x + 24 * 3 + 2 > 400) {
			const ref = cards[game.hand[game.prevCard].id];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x, y, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x, y, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in a special hand select.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	cardSelect(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.select[1]] + 69 + xPlus, y = 15 + yPlus;
		if (x + 24 * 3 + 2 > 400) {
			const ref = cards[game.hand[game.select[1]].id];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x, y, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x, y, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for a card reward choice.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	reward(type, xPlus = 0, yPlus = 0) {
		let x = handPos[game.select[1]] + xPlus;
		if (game.select[1] == get.cardRewardChoices() - 1 && get.cardRewardChoices() >= 4) {
			const ref = cards[game.room[5][game.select[1]]];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x + 69, 51 + yPlus, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x + 69, 51 + yPlus, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in a deck.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	deck(type, xPlus = 0, yPlus = 0) {
		let x = (game.cardSelect[0] * 66) + xPlus, y = 15 + (game.cardSelect[1] * 98) - game.deckPos + yPlus;
		if (game.cardSelect[0] >= 4) {
			const loc = (inOutsideDeck() ? "deck" : (game.select[0] === S.DECK ? "deckLocal" : (game.select[0] === S.VOID ? "void" : "discard")));
			const ref = cards[game[loc][game.cardSelect[0] + (game.cardSelect[1] * 6)].id];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x + 71, y, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x + 71, y, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in the refinable deck.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	refinableDeck(type, xPlus = 0, yPlus = 0) {
		let x = 72 + (game.cardSelect[0] * 68) + xPlus, y = 15 + (game.cardSelect[1] * 100) - game.deckPos + yPlus;
		if (game.cardSelect[0] >= 2) {
			const ref = cards[refinableDeck[game.cardSelect[0] + (game.cardSelect[1] * 3)].id];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x, y, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x, y, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for the player.
	 * @param {number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	player(type, xPlus = 0, yPlus = 0) {
		const eff = game.eff[type];
		let y = 68 + yPlus, move = 0;
		if (eff > 0) {
			let desc = (PERM_EFF_DESC[type] ? PERM_EFF_DESC[type] : "You have " + eff + " " + EFF_NAME[type] + ((type === EFF.AURA_BLADE || type === EFF.REINFORCE) && eff >= 2 ? "s" : "") + ".");
			move += draw.textBox(85 + xPlus, y + move, desc.length, desc, {"text-small": true});
		};
		move += draw.textBox(85 + xPlus, y + move, 24, EFF_DESC[type], {"text-small": true});
		return move;
	},
	/**
	 * Draws an infobox for the selected enemy.
	 * @param {number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	enemy(type, xPlus = 0, yPlus = 0) {
		const pos = enemyPos[game.select[1]];
		const eff = game.enemies[game.select[1]].eff[type];
		let y = pos[1] + yPlus, move = 0;
		if (eff > 0) {
			let desc = (PERM_EFF_DESC[type] ? PERM_EFF_DESC[type] : "This has " + eff + " " + EFF_NAME[type] + ((type === EFF.AURA_BLADE || type === EFF.REINFORCE || type === ENEMY_EFF.REWIND) && eff >= 2 ? "s" : "") + ".");
			move += draw.textBox(pos[0] - (desc.length * 3) - 0.5 + xPlus, y + move, desc.length, desc, {"text-small": true});
		};
		move += draw.textBox(pos[0] - 72.5 + xPlus, y + move, 24, EFF_DESC[type], {"text-small": true});
		if (type === ENEMY_EFF.COUNTDOWN) move += draw.textBox(pos[0] - 72.5 + xPlus, y + move, 24, "The next intent will be\nto " + MIN_INTENT_DESC[game.enemies[game.select[1]].intentHistory[eff - 1]] + ".", {"text-small": true});
		return move;
	},
	/**
	 * Draws an infobox for the selected enemy's intent.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	intent(xPlus = 0, yPlus = 0) {
		let y = getEnemyIntentPos(game.select[1]) + yPlus;
		if (y === y) {
			let intent = game.enemies[game.select[1]]?.intent;
			let desc = (intent === INTENT.SUMMON && game.enemies.length >= 6 ? FULL_INTENT_DESC[INTENT.RITUAL] : FULL_INTENT_DESC[intent]);
			if (desc) draw.textBox(enemyPos[game.select[1]][0] - 71 + xPlus, y - (desc.match(/\n/g) || []).length * 3, 28, desc, {"text-small": true});
		};
	},
	/**
	 * Draws an infobox for an artifact.
	 * @param {string | number} type - the type of the artifact.
	 * @param {number} xOveride - overrides the x-coordinate of the infobox.
	 * @param {number} yOveride - overrides the y-coordinate of the infobox.
	 */
	artifact(type, xOveride = NaN, yOveride = NaN) {
		let x = (xOveride === xOveride ? xOveride : 21 + (game.select[1] * 18)), y = (yOveride === yOveride ? yOveride : 13);
		const obj = artifacts[type];
		if (!obj) return;
		if (obj.name.length <= 12) {
			draw.textBox(x, y, 12, title(obj.name), {"text-align": DIR.CENTER});
			draw.textBox(x, y + 13, 24, obj.desc, {"text-small": true});
		} else {
			draw.textBox(x, y, obj.name.length, title(obj.name));
			draw.textBox(x, y + 13, obj.name.length * 2, obj.desc, {"text-small": true});
		};
	},
};

const graphics = {
	/**
	 * Draws the background layer on the canvas.
	 */
	backgrounds() {
		if (get.area() == 1) {
			for (let col = 0; col < 14 + 15; col++) {
				if (!backAnim[col]?.length) backAnim[col] = [];
				for (let index = 0; index < 9; index++) {
					if (!backAnim[col][index]?.length) backAnim[col][index] = [0];
					if (backAnim[col][index][0] == 0 && Math.random() < 1/100) {
						backAnim[col][index] = [Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 6)];
					};
				};
			};
			for (let col = 0; col < 12; col++) {
				if (!backAnim[col][9]) backAnim[col][9] = [];
				for (let index = 0; index < 6; index++) {
					if (!backAnim[col][9][index]) backAnim[col][9][index] = 0;
					if (backAnim[col][9][index] == 0 && Math.random() < 1/200) {
						backAnim[col][9][index] = Math.floor(Math.random() * 20) + 20;
					};
				};
			};
			draw.image(I.background.hallway, 0, 42);
			if (!backAnim[29]) backAnim[29] = 0;
			for (let col = 0; col < 12; col++) {
				draw.imageSector(I.background.panel, Math.floor(backAnim[29]) * 35, 0, 35, 42, col * 34 - 6, 0);
				for (let index = 0; index < 6; index++) {
					if (backAnim[col][9][index] > 0) backAnim[col][9][index]--;
					else draw.imageSector(I.background.panel_cover, index * 35, 0, 35, 42, col * 34 - 6, 0);
				};
			};
			backAnim[29]++;
			if (backAnim[29] >= 12) backAnim[29] = 0;
			for (let col = 0; col < 14; col++) {
				for (let index = 0; index < 9; index++) {
					if (backAnim[col][index][0] > 0) {
						draw.imageSector(I.background.tiles, backAnim[col][index][1] * 15, 0, 15, 8, col * 34 - index * 9 + 9, index * 18 + 44);
						backAnim[col][index][0]--;
					};
				};
			};
			for (let col = 0; col < 15; col++) {
				for (let index = 0; index < 9; index++) {
					if (backAnim[col + 14][index][0] > 0) {
						draw.imageSector(I.background.tiles, backAnim[col][index][1] * 15, 8, 15, 8, col * 34 - index * 9 - 12, index * 18 + 53);
						backAnim[col + 14][index][0]--;
					};
				};
			};
			draw.rect("#0003");
		} else {
			if (transition < 100) {
				draw.image(I.background.cave);
				draw.rect("#10106080");
				draw.image(I.background.temple);
				draw.image(I.background.floating_arch, 136, 35 - Math.abs(Math.round(backAnim[0]) - 2));
				draw.image(I.background.debris, 151, 93 - Math.abs(Math.round(backAnim[1]) - 2));
			};
			if (game.artifacts.includes(202) && game.floor == 10) {
				if (transition < 100) {
					ctx.globalAlpha = transition / 100;
				};
				draw.image(I.background.tunnel_of_time, 0 - backAnim[3]);
				if (!game.enemies[0]?.eff[ENEMY_EFF.COUNTDOWN]) backAnim[3]++;
				else backAnim[3]--;
				if (backAnim[3] >= 16) backAnim[3] -= 16;
				else if (backAnim[3] < 0) backAnim[3] += 16;
				ctx.globalAlpha = 1;
			};
			if (game.floor != 10) {
				let now = new Date(), time = [now.getHours(), now.getMinutes()], y = 64 - Math.abs(Math.round(backAnim[2]) - 2);
				time[0] += (time[1] / 60);
				if (time[0] >= 12) time[0] = time[0] - 12;
				draw.image(I.background.clock_face, 170, y);
				draw.clock(170, y, time[0], time[1]);
			};
			for (let index = 0; index < 3; index++) {
				backAnim[index] += (Math.random() + 0.5) * 0.075;
				if (backAnim[index] >= 4) backAnim[index] -= 4;
			};
		};
	},
	/**
	 * Draws the middle layer on the canvas.
	 */
	middleLayer() {
		if (game.artifacts.includes(202) && game.floor == 10) {
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
					draw.imageSector(I.background.column_debris, (extraAnim[index][2] % 8) * 16, 0, 16, 8, Math.floor(400 - extraAnim[index][1]), Math.floor(extraAnim[index][0]));
				} else if (extraAnim[index][2] < 16) {
					ctx.scale(-1, 1);
					draw.imageSector(I.background.column_debris, (extraAnim[index][2] % 8) * 16, 0, 16, 8, Math.floor(extraAnim[index][1] - 400), Math.floor(extraAnim[index][0]), -16, 8);
					ctx.scale(-1, 1);
				} else if (extraAnim[index][2] % 2 == 0) {
					draw.image(I.background.debris, Math.floor(400 - extraAnim[index][1]), Math.floor(extraAnim[index][0] + 1));
				} else {
					ctx.scale(-1, 1);
					draw.image(I.background.debris, Math.floor(extraAnim[index][1] - 400), Math.floor(extraAnim[index][0] + 1), -6, 6);
					ctx.scale(-1, 1);
				};
				const rand = Math.random();
				if (rand < 0.05) extraAnim[index][0]++;
				else if (rand < 0.1) extraAnim[index][0]--;
				if (!game.enemies[0]?.eff[ENEMY_EFF.COUNTDOWN]) extraAnim[index][1] += (Math.random() - 0.5) + 2;
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
		// menus
		const past = game.select[2];
		if (past) {
			if (past[0] === S.REWARDS) graphics.rewards(false);
			else if (past[0] === S.CARD_REWARD) graphics.cardRewards(false);
			else if (past[0] === S.ARTIFACT_REWARD) graphics.artifactRewards(false);
		};
		// looker
		if (game.select[0] === S.LOOKER && game.select[1] === 1) {
			draw.imageSector(I.extra.looker, 16, 0, 16, 16, 343, 3);
			draw.image(I.select.round, 342, 2);
			return;
		};
		// extra covers
		if (get.area() == 1) {
			let topLeftX = [(("" + game.floor).length + ("" + game.gold).length - 2) * 6 - 200, (game.artifacts.length - 2) * 18 - 260];
			if (topLeftX[0] > topLeftX[1]) draw.image(I.cover.top_left, topLeftX[0], 0);
			else draw.rect("#000", topLeftX[1] + 299, 0, 1, 12);
			draw.image(I.cover.top_left_big, topLeftX[1], 0);
			if (topLeftX[0] >= topLeftX[1] + 12) draw.image(I.cover.corner, topLeftX[1] + 199, 12);
			draw.image(I.cover.top_right, 339, 0);
			draw.image(I.cover.bottom_left, 0, 159);
			draw.image(I.cover.bottom_right, 377, game.void.length ? 159 : 178);
		};
		// extras
		draw.imageSector(I.extra.looker, 0, 0, 16, 16, 343, 3);
		draw.image(I.extra.help, 362, 3);
		draw.image(I.extra.options, 380, 2);
		draw.image(I.extra.end, 3, 163);
		draw.image(I.extra.deck, 4, 182);
		if (game.void.length) draw.image(I.extra.void, 381, 163);
		draw.image(I.extra.discard, 382, 182);
		// artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			draw.image(I.artifact[game.artifacts[index]], 2 + (index * 18), 13);
			if (game.select[0] === S.ARTIFACTS && game.select[1] === index) draw.image(I.artifact.select[game.artifacts[index]], 1 + (index * 18), 12);
		};
		// selected
		if (game.select[0] === S.LOOKER) draw.image(I.select.round, 342, 2);
		else if (game.select[0] === S.HELP) draw.image(I.select.round, 361, 2);
		else if (game.select[0] === S.OPTIONS) draw.image(get.area() == 1 ? I.select.options : I.select.options_yellow, 380, 2);
		else if (game.select[0] === S.END) draw.image(I.select.round, 2, 162);
		else if (game.select[0] === S.DECK) draw.image(I.select.deck, 3, 181);
		else if (game.select[0] === S.VOID) draw.image(I.select.round, 380, 162);
		else if (game.select[0] === S.DISCARD) draw.image(I.select.discard, 381, 181);
		// info
		draw.lore(1, 1, "floor " + game.floor + " - " + game.gold + " gold", {"color": (get.area() == 1 ? "#000" : "#f44")});
		// intents
		if (!hidden() && !(game.select[0] === S.LOOKER || game.select[0] === S.HELP || game.select[0] === S.OPTIONS)) {
			for (let index = 0; index < game.enemies.length; index++) {
				draw.intent(index);
			};
		};
		// enemy icons
		if (game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) draw.enemyIcons(game.select[1]);
	},
	/**
	 * Draws the player on the canvas.
	 */
	player() {
		let x = 15, y = 27;
		// aura blades
		for (let index = 0; index < game.eff[EFF.AURA_BLADE] && index < 4; index++) {
			draw.image(I.aura_blade, x + auraBladePos[index][0], y + auraBladePos[index][1] + 4 - Math.abs(Math.round(auraBladeAnim[index]) - 4));
			auraBladeAnim[index] += (Math.random() + 0.5) * 0.05;
			if (auraBladeAnim[index] >= 8) auraBladeAnim[index] -= 8;
		};
		// icons
		for (const key in game.eff) {
			if (game.eff.hasOwnProperty(key) && game.eff[key]) {
				let img = I.icon[key];
				if (img === I.icon[1704]) draw.image(I.icon["1704_back"], x + 22, y + 103);
				draw.image(img, x + 23, y + 104);
				if (!PERM_EFF_DESC[key]) draw.lore(x + 40, y + 112, game.eff[key], {"color": "#fff", "text-align": DIR.LEFT});
				x += 17;
				if (x >= 15 + 68) {
					x = 15;
					y += 17;
				};
			};
		};
		x = 15; y = 27;
		// animations
		draw.imageSector(playerAnim[1], Math.floor(playerAnim[0]) * 120, 0, 120, playerAnim[1].height, x, y, 120);
		if (playerAnim[1] === I.player.idle) {
			playerAnim[0] += 0.25;
			if (playerAnim[0] >= 10) {
				playerAnim[0] = 0;
			};
		} else if (playerAnim[1] === I.player.attack || playerAnim[1] === I.player.attack_aura) {
			playerAnim[0]++;
			if (playerAnim[0] >= 4) {
				playerAnim = [0, I.player.idle];
				postCardActivation();
			};
		} else if (playerAnim[1] === I.player.attack_2 || playerAnim[1] === I.player.attack_2_aura) {
			playerAnim[0]++;
			if (playerAnim[0] >= 6) {
				playerAnim = [0, I.player.idle];
				postCardActivation();
			};
		} else if (isDefending(playerAnim[1])) {
			playerAnim[0] += 0.5;
			if (playerAnim[0] >= 3) {
				playerAnim[0] = 2;
			};
		} else if (playerAnim[1] === I.player.hit) {
			playerAnim[0] += 0.25;
			if (playerAnim[0] >= 1) {
				playerAnim = [0, I.player.idle];
			};
		} else if (playerAnim[1] === I.player.death) {
			playerAnim[0] += 0.5;
			if (playerAnim[0] >= 10) {
				playerAnim[0] = 9;
			};
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
		draw.imageSector(I.bar.energy_full, 0, 0, cutoff + 1, 32, x - 1, y + 16);
		draw.imageSector(I.bar.energy_empty, cutoff + 1, 0, 32 - (cutoff + 1), 32, x + cutoff, y + 16);
		draw.lore(x + 14, y + 28, energy, {"text-align": DIR.LEFT});
		draw.lore(x + 17, y + 28, get.maxEnergy());
	},
	/**
	 * Draws the current effect on the canvas.
	 */
	effect() {
		if (effAnim[1] === I.effect.war_cry) {
			draw.imageSector(I.effect.war_cry, Math.floor(effAnim[0]) * 188, 0, 188, 188, -22, -18, 188, 188);
			effAnim[0]++;
			if (effAnim[0] >= 35) effAnim = [0, null];
		};
	},
	/**
	 * Draws the enemies on the canvas.
	 */
	enemy() {
		// icons
		for (let index = 0; index < game.enemies.length; index++) {
			if ((game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) && index == game.select[1]) continue;
			draw.enemyIcons(index);
		};
		// enemy drawing
		for (let index = 0; index < game.enemies.length; index++) {
			let selected = game.enemies[index], pos = enemyPos[index];
			if (pos && isEnemyVisible(index)) {
				if (selected.type === SLIME.BIG) {
					if (selected.shield > 0) draw.imageSector(I.enemy.slime.big_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					else draw.imageSector(I.enemy.slime.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
				} else if (selected.type === SLIME.SMALL) {
					if (selected.shield > 0) draw.imageSector(I.enemy.slime.small_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					else draw.imageSector(I.enemy.slime.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
				} else if (selected.type === SLIME.PRIME) {
					if (primeAnim == -1) {
						if (selected.shield > 0) draw.imageSector(I.enemy.slime.prime_defend, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						else draw.imageSector(I.enemy.slime.prime, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					} else {
						if (selected.shield > 0) draw.imageSector(I.enemy.slime.to_prime_defend, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						else draw.imageSector(I.enemy.slime.to_prime, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						primeAnim += (Math.random() + 0.5) * 0.1;
						if (primeAnim >= 12) {
							primeAnim = -1;
							enemyAnim[index] = 0;
						};
					};
				} else if (selected.type === FRAGMENT) {
					if (primeAnim == -1) {
						draw.imageSector(I.enemy.fragment.idle, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
						if (index !== game.enemyNum || selected.intent !== INTENT.ATTACK) {
							draw.clock(pos[0] + 2, pos[1] + 4, -1, 2 - Math.abs(Math.floor(enemyAnim[index]) - 2));
						};
					} else if (primeAnim >= 18) {
						draw.imageSector(I.enemy.fragment.open, Math.floor(primeAnim - 18) * 64, 0, 64, 64, pos[0], pos[1]);
						draw.clock(pos[0] + 2, pos[1] + 5, 6, 0, (primeAnim - 18) * 5);
						primeAnim += 0.5;
						if (primeAnim >= 25) {
							primeAnim = -1;
							enemyAnim[index] = 0;
						};
					} else {
						let x = pos[0] + ((18 - primeAnim) * 8);
						draw.imageSector(I.enemy.fragment.roll, Math.floor(primeAnim % 4) * 64, 0, 64, 64, x, pos[1]);
						draw.clock(x + 2, pos[1] + 5, (4 - Math.floor((primeAnim - 2) % 4)) * 3, (4 - Math.floor(primeAnim % 4)) * 15);
						primeAnim++;
					};
				} else if (selected.type === SENTRY.BIG) {
					if (selected.shield > 0) {
						draw.imageSector(I.enemy.sentry.big_defend, Math.floor(enemyAnim[index] + 7) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					} else if (selected.transition && selected.transition[1] === TRANSITION.SHIELD) {
						draw.imageSector(I.enemy.sentry.big_defend, Math.floor(7 - selected.transition[0]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						selected.transition[0]++;
						if (selected.transition[0] >= 7) delete selected.transition;
					} else {
						draw.imageSector(I.enemy.sentry.big, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					};
				} else if (selected.type === SENTRY.SMALL) {
					if (selected.shield > 0) {
						draw.imageSector(I.enemy.sentry.small_defend, Math.floor(enemyAnim[index] + 5) * 64, 0, 64, 64, pos[0], pos[1]);
					} else if (selected.transition && selected.transition[1] === TRANSITION.SHIELD) {
						draw.imageSector(I.enemy.sentry.small_defend, Math.floor(5 - selected.transition[0]) * 64, 0, 64, 64, pos[0], pos[1]);
						selected.transition[0]++;
						if (selected.transition[0] >= 5) delete selected.transition;
					} else {
						draw.imageSector(I.enemy.sentry.small, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					};
				} else if (selected.type === SENTRY.PRIME) {
					if (selected.shield > 0) {
						draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(enemyAnim[index] + 9) * 64, 0, 64, 64, pos[0], pos[1]);
						primeAnim = -1;
					} else if (selected.transition && selected.transition[1] === TRANSITION.SHIELD) {
						draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(9 - selected.transition[0]) * 64, 0, 64, 64, pos[0], pos[1]);
						selected.transition[0]++;
						if (selected.transition[0] >= 9) delete selected.transition;
						primeAnim = -1;
					} else if (primeAnim == -1) {
						draw.imageSector(I.enemy.sentry.prime, Math.floor(enemyAnim[index]) * 64, 0, 64, 64, pos[0], pos[1]);
					} else {
						draw.imageSector(I.enemy.sentry.to_prime, Math.floor(primeAnim) * 64, 0, 64, 64, pos[0], pos[1]);
						primeAnim += (Math.random() + 0.5) * 0.1;
						if (primeAnim >= 9) {
							primeAnim = -1;
							enemyAnim[index] = 0;
						};
					};
				} else if (selected.type === SINGULARITY) {
					if (Math.floor(enemyAnim[index]) == 1) pos = [pos[0], pos[1] + 1];
					else if (Math.floor(enemyAnim[index]) == 3) pos = [pos[0], pos[1] - 1];
					if (selected.shield > 0) draw.image(I.enemy.singularity.defend, pos[0], pos[1]);
					else draw.image(I.enemy.singularity.idle, pos[0], pos[1]);
					draw.imageSector(I.enemy.singularity.orbs, Math.floor(enemyAnimSync % 24) * 64, 0, 64, 64, pos[0], pos[1]);
				};
			};
		};
		// action animations
		if (game.enemies[game.enemyNum] && !game.enemies[game.enemyNum].transition) {
			let pos = enemyPos[game.enemyNum];
			const type = game.enemies[game.enemyNum].type;
			const intent = game.enemies[game.enemyNum].intent;
			if (intent === INTENT.ATTACK) {
				if (type === SLIME.BIG) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						pos[0] - (isDefending(playerAnim[1]) ? 94 : 80),
						pos[1] - (isDefending(playerAnim[1]) ? 44 : 42),
					];
					let phase = (enemyActionAnim[0] / 10),
						posX = Math.round(enemyActionAnimData[0] * phase),
						posY = Math.round(enemyActionAnimData[1] * phase);
					if (enemyActionAnim[1] === ANIM.ENDING) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else if (game.enemyStage === ANIM.MIDDLE) {
						draw.imageSector(I.enemy.slime.big_attack, 4 * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
						enemyActionAnim[1] = ANIM.ENDING;
						game.enemyStage = ANIM.PENDING;
					} else {
						draw.imageSector(I.enemy.slime.big_attack, (enemyActionAnim[0] % 4) * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
						enemyActionAnim[0]++;
						game.enemyStage = ANIM.PENDING;
						if (enemyActionAnim[0] >= 11) {
							enemyActionAnim[0] = 11;
							game.enemyStage = ANIM.MIDDLE;
						};
					};
				} else if (type === SLIME.SMALL) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						pos[0] - (isDefending(playerAnim[1]) ? 81 : 62) - 64,
						pos[1] - (isDefending(playerAnim[1]) ? 61 : 57),
					];
					if (enemyActionAnim[0] >= 10) {
						let phase = ((enemyActionAnim[0] - 9) / 10),
							posX = Math.round(enemyActionAnimData[0] * phase),
							posY = Math.round(enemyActionAnimData[1] * phase);
						draw.imageSector(I.enemy.slime.small_attack, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
					} else draw.imageSector(I.enemy.slime.small_attack, Math.floor(enemyActionAnim[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
					if (enemyActionAnim[1] === ANIM.STARTING) enemyActionAnim[0]++;
					else if (enemyActionAnim[1] === ANIM.ENDING) enemyActionAnim[0]--;
					if (enemyActionAnim[0] >= 20) {
						enemyActionAnim[0] = 18;
						enemyActionAnim[1] = ANIM.ENDING;
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyActionAnim[0] < 0) {
						enemyActionAnim = [0, ANIM.STARTING];
						enemyAnim[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SLIME.PRIME) {
					if (enemyActionAnim[0] >= 4) {
						let phase = ((enemyActionAnim[0] - 4) / 10), posX = Math.round(((pos[0] - 68) - 40) * phase);
						draw.imageSector(I.enemy.slime.prime_attack, 4 * 36, 0, 36, 18, pos[0] - 32 - posX, 80, 36, 18);
					} else draw.imageSector(I.enemy.slime.prime_attack, Math.floor(enemyActionAnim[0]) * 36, 0, 36, 18, pos[0] - 32, 80, 36, 18);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 14) {
						enemyActionAnim[0] = 14;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === FRAGMENT && primeAnim == -1) {
					draw.imageSector(I.enemy.fragment.attack, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					draw.clock(pos[0] + 2, pos[1] + 4, -1, (enemyActionAnim[0] >= 3 ? 0 : Math.floor(enemyActionAnim[0] + 1) * 15));
					if (enemyActionAnim[0] >= 4 && enemyActionAnim[0] < 6) draw.rect("#f00", 0, pos[1] + 4, pos[0], 60);
					enemyActionAnim[0]++;
					if (enemyActionAnim[0] >= 7) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] == 4) {
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.BIG) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.big_attack, Math.floor(enemyActionAnim[0]) * 88, 0, 88, 70, pos[0] - 12, pos[1] - 1, 88, 70);
					if (enemyActionAnim[0] >= 4) {
						const start = [pos[0] + 17, pos[1] + 16];
						const end = enemyActionAnimData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyActionAnim[1] === ANIM.STARTING) enemyActionAnim[0]++;
					else if (enemyActionAnim[1] === ANIM.ENDING) enemyActionAnim[0]--;
					if (enemyActionAnim[0] >= 5) {
						enemyActionAnim[0] = 4;
						enemyActionAnim[1] = ANIM.ENDING;
					} else if (enemyActionAnim[0] == 3 && enemyActionAnim[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyActionAnim[0] < 0) {
						enemyActionAnim = [0, ANIM.STARTING];
						enemyAnim[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.SMALL) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.small_attack, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					if (enemyActionAnim[0] >= 11) {
						const start = [pos[0] + 14, pos[1] + 30];
						const end = enemyActionAnimData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyActionAnim[1] === ANIM.STARTING) enemyActionAnim[0]++;
					else if (enemyActionAnim[1] === ANIM.ENDING) enemyActionAnim[0]--;
					if (enemyActionAnim[0] >= 12) {
						enemyActionAnim[0] = 11;
						enemyActionAnim[1] = ANIM.ENDING;
					} else if (enemyActionAnim[0] == 10 && enemyActionAnim[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyActionAnim[0] < 0) {
						enemyActionAnim = [0, ANIM.STARTING];
						enemyAnim[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.PRIME && primeAnim == -1) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.prime_attack, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 86, pos[0], pos[1] - 22);
					if (enemyActionAnim[0] >= 12) {
						let start = [pos[0] + 12, pos[1] + 29];
						const end = enemyActionAnimData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
						start[1] += 7;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyActionAnim[1] === ANIM.STARTING) enemyActionAnim[0]++;
					else if (enemyActionAnim[1] === ANIM.ENDING) enemyActionAnim[0]--;
					if (enemyActionAnim[0] >= 13) {
						enemyActionAnim[0] = 12;
						enemyActionAnim[1] = ANIM.ENDING;
					} else if (enemyActionAnim[0] == 11 && enemyActionAnim[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyActionAnim[0] < 0) {
						enemyActionAnim = [0, ANIM.STARTING];
						enemyAnim[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SINGULARITY) {
					if (!enemyActionAnimData.length) enemyActionAnimData = [
						Math.floor(Math.random() * 4),
						(isDefending(playerAnim[1]) ? (isCrouching(playerAnim[1]) ? 0 : 1) : 2),
					];
					pos = [
						[133 + enemyActionAnimData[0] * 17, 88],
						[155 + enemyActionAnimData[0] * 17, 79],
						[142 + enemyActionAnimData[0] * 17, 70],
					][enemyActionAnimData[1]];
					draw.imageSector(I.enemy.singularity.attack, Math.floor(enemyActionAnim[0]) * 68 + (enemyActionAnimData[0] % 2 + (enemyActionAnimData[1] % 2 == 1 ? 2 : 0)) * 17, 0, 17, 55, pos[0], pos[1]);
					draw.imageSector(I.enemy.singularity.attack_overlay, Math.floor(enemyActionAnim[0]) * 34 + (enemyActionAnimData[1] % 2 == 1 ? 17 : 0), 0, 17, 55, pos[0], pos[1]);
					if (enemyActionAnim[0] >= 8) {
						const start = [pos[0] + 7, pos[1] + 5];
						const end = [[94, 95], [92, 87], [72, 82]][enemyActionAnimData[1]];
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 4);
					};
					if (enemyActionAnim[1] === ANIM.STARTING) enemyActionAnim[0]++;
					else if (enemyActionAnim[1] === ANIM.ENDING) enemyActionAnim[0]--;
					if (enemyActionAnim[0] >= 9) {
						enemyActionAnim[0] = 8;
						enemyActionAnim[1] = ANIM.ENDING;
					} else if (enemyActionAnim[0] == 7 && enemyActionAnim[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyActionAnim[0] < 0) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
						enemyActionAnimData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				};
			} else if (intent === INTENT.DEFEND) {
				if (type === SLIME.BIG) {
					draw.imageSector(I.enemy.slime.big_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, enemyActionAnim[0] * 2 + 5, 64, pos[0], pos[1]);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 27) {
						enemyActionAnim[0] = 27;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SLIME.SMALL) {
					draw.imageSector(I.enemy.slime.small_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, enemyActionAnim[0] + 20, 64, pos[0], pos[1]);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 24) {
						enemyActionAnim[0] = 24;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SLIME.PRIME) {
					draw.imageSector(I.enemy.slime.prime_defend, Math.floor(enemyAnim[game.enemyNum]) * 64, 0, enemyActionAnim[0] * 3, 64, pos[0], pos[1] + 1);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 20) {
						enemyActionAnim[0] = 20;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.BIG) {
					draw.imageSector(I.enemy.sentry.big_defend, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 7) {
						enemyActionAnim[0] = 7;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.SMALL) {
					draw.imageSector(I.enemy.sentry.small_defend, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 5) {
						enemyActionAnim[0] = 5;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.PRIME && primeAnim == -1) {
					draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(enemyActionAnim[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					enemyActionAnim[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyActionAnim = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyActionAnim[0] >= 9) {
						enemyActionAnim[0] = 9;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				};
			};
		};
		// move idle animations along
		for (let index = 0; index < game.enemies.length; index++) {
			enemyAnim[index] += (Math.random() + 0.5) * 0.1;
			if (enemyAnim[index] >= 4) enemyAnim[index] -= 4;
		};
		enemyAnimSync++;
		// draw intents
		if (game.select[0] === S.LOOKER || game.select[0] === S.HELP || game.select[0] === S.OPTIONS) {
			for (let index = 0; index < game.enemies.length; index++) {
				draw.intent(index);
			};
		};
	},
	/**
	 * Draws the current info page on the canvas.
	 */
	info() {
		draw.rect("#000c");
		draw.image(I.extra.help, 362, 3);
		draw.image(I.select.round, 361, 2);
		const limit = (str) => {
			let lim = (draw.lore(1, 23, str, {"color": "none"}) + 23) - 200;
			if (lim < 0) lim = 0;
			if (infoPos > lim) infoPos = lim;
			return lim;
		};
		if (game.select[1] == 3) {
			infoLimit = limit(changelog);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - Changelog", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, changelog, {"color": "#fff"});
		} else if (game.select[1] == 2) {
			infoLimit = limit(gameplay);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - How To Play", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, gameplay, {"color": "#fff"});
		} else {
			infoLimit = limit(overview);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - Overview", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, overview, {"color": "#fff"});
		};
		draw.lore(1, 12 - infoPos, 'Source can be found at "https://github.com/Yrahcaz7/Dungeon-of-Souls"', {"color": "#f44", "text-small": true});
		if (infoLimit > 0) {
			draw.lore(366, 26, "Scrollable", {"color": "#fff", "text-align": DIR.LEFT});
			draw.image(I.arrows, 367, 22);
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
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAMES[options[index]] + ": " + (option ? "ON" : "OFF") + "</#ff0>\n";
				else text += OPTION_NAMES[options[index]] + ": " + (option ? "ON" : "OFF") + "\n";
			} else if (typeof option == "number") {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAMES[options[index]] + ": " + option + "x</#ff0>\n";
				else text += OPTION_NAMES[options[index]] + ": " + option + "x\n";
			} else {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAMES[options[index]] + ": " + option + "</#ff0>\n";
				else text += OPTION_NAMES[options[index]] + ": " + option + "\n";
			};
		};
		if (game.select[1] - 2 === options.length && focused) text += "\n<#ff0>RESTART RUN</#ff0>";
		else text += "\nRESTART RUN";
		draw.rect("#000c");
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Options", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 378, 1);
		draw.lore(200 - 2, 15, text.trim().replace(/_/g, " "), {"color": "#fff", "text-align": DIR.CENTER});
		draw.image(I.extra.options, 380, 2);
		if (game.select[1] == 1 && focused) draw.image(get.area() == 1 ? I.select.options : I.select.options_yellow, 380, 2);
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
				if (x === game.cardSelect[0] && y === game.cardSelect[1] && game.select[0] !== S.CONF_REFINE) {
					selected = [x, y];
				} else {
					draw.card(deck[x + (y * 6)], -1, 14 + (y * 98) - game.deckPos, false, 2 + (x * 66), inOutsideDeck());
				};
				if (x >= 5) {
					x = -1;
					y++;
				};
			};
			if (selected) {
				draw.card(deck[selected[0] + (selected[1] * 6)], -1, 14 + (selected[1] * 98) - game.deckPos, true, 2 + (selected[0] * 66), inOutsideDeck());
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
		if (game.select[0] === S.DECK) draw.lore(200 - 2, 1, "Deck", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.DISCARD) draw.lore(200 - 2, 1, "Discard", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.VOID) draw.lore(200 - 2, 1, "Void", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.MAP) draw.lore(200 - 2, 1, "Cards", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY) draw.lore(200 - 2, 1, "Purifier: Pick a Card to Destroy", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
	},
	/**
	 * Draws the refiner selection screen on the canvas.
	 */
	refiner() {
		if (refinableDeck.length == 0) {
			refinableDeck = game.deck.filter(card => card.level == 0);
			if (refinableDeck.length == 0) refinableDeck = [new Card()];
		};
		draw.rect("#000c");
		draw.rect("#fff", 207, 14, 1, 185);
		const len = refinableDeck.length;
		if (len > 0) {
			if (game.cardSelect[0] + (game.cardSelect[1] * 3) >= len) game.cardSelect = [(len - 1) % 3, Math.floor((len - 1) / 3)];
			if (game.deckPos > Math.max(100 * (Math.floor((len - 1) / 3) - 1) + 14, 0)) game.deckPos = Math.max(100 * (Math.floor((len - 1) / 3) - 1) + 14, 0);
			let selected;
			for (let x = 0, y = 0; x + (y * 3) < len; x++) {
				if (x === game.cardSelect[0] && y === game.cardSelect[1] && game.select[0] !== S.CONF_REFINE) {
					selected = [x, y];
				} else if (refinableDeck[x + (y * 3)].level == 0) {
					draw.card(refinableDeck[x + (y * 3)], -1, 15 + (y * 100) - game.deckPos, false, 3 + (x * 68), inOutsideDeck());
				};
				if (x >= 2) {
					x = -1;
					y++;
				};
			};
			if (selected) {
				draw.card(refinableDeck[selected[0] + (selected[1] * 3)], -1, 15 + (selected[1] * 100) - game.deckPos, true, 3 + (selected[0] * 68), true);
			};
			graphics.target();
			selected = game.cardSelect;
			if (game.deckPos >= 100 * selected[1]) {
				game.deckPos -= Math.min(10, Math.abs(game.deckPos - (100 * selected[1])));
			} else if (game.deckPos <= (100 * (selected[1] - 1)) + 14) {
				game.deckPos += Math.min(10, Math.abs(game.deckPos - ((100 * (selected[1] - 1)) + 14)));
			};
		};
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Refiner: Pick a Card to Improve", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
		let cardObj = refinableDeck[game.cardSelect[0] + (game.cardSelect[1] * 3)];
		draw.lore(213, 18, "Press B to go back to the reward selection screen.\n\nPress space or enter to refine the selected card.\n\nA preview of the refined card is shown below.", {"color": "#FFFFFF", "text-small": true});
		draw.card(cardObj, -1, 51, true, 213, true);
		draw.card(new Card(cardObj.id, 1), -1, 51, true, 329, true);
		draw.image(I.card.refine, 305 - I.card.refine.width / 2, 95);
	},
	/**
	 * Draws the player's hand on the canvas.
	 */
	hand() {
		if (game.select[0] === S.ATTACK) {
			draw.card(game.enemyAtt[2], 0, 22, true, 50);
		};
		if (game.select[0] === S.PLAYER || game.select[0] === S.ENEMY || game.select[0] === S.ATTACK) return;
		let temp = -1;
		for (let index = 0; index < game.hand.length; index++) {
			if (!cardAnim[index]) cardAnim[index] = 0;
			if ((game.select[0] === S.HAND && game.select[1] == index) || (index == game.prevCard && global.options[OPTION.STICKY_CARDS])) {
				temp = index;
			} else {
				if (cardAnim[index] > 0) cardAnim[index] -= 6 + Math.random();
				if (cardAnim[index] < 0) cardAnim[index] = 0;
				draw.card(game.hand[index], index, 146 - Math.floor(cardAnim[index]));
			};
		};
		if (temp != -1) {
			if (cardAnim[temp] < 44) cardAnim[temp] += 7 + Math.random();
			if (cardAnim[temp] > 44) cardAnim[temp] = 44;
			draw.card(game.hand[temp], temp, 146 - Math.floor(cardAnim[temp]), true);
		};
		if (notif[0] != -1) {
			draw.lore(handPos[notif[0]] + 32, 146 - 9 - Math.ceil(cardAnim[notif[0]]) - notif[1] + notif[3], notif[2], {
				"color": "#ff" + ["4444", "8888"][get.area()] + Math.min(16 - notif[1], 15).toString(16) + "f",
				"text-align": DIR.CENTER,
			});
			notif[1]++;
			if (notif[1] > 16) notif = [-1, 0];
		};
	},
	/**
	 * Draws the player's hand in a special select on the canvas.
	 */
	handSelect() {
		draw.rect("#000c");
		draw.image(I.extra.end, 3, 55);
		draw.image(I.extra.end, 381, 55);
		if (game.select[1] == -1) draw.image(I.select.round, 2, 54);
		else if (game.select[1] == game.hand.length) draw.image(I.select.round, 380, 54);
		let temp = -1;
		for (let index = 0; index < game.hand.length; index++) {
			if (index == game.select[1]) {
				temp = index;
			} else if (index == game.enemyAtt[0]) {
				ctx.globalAlpha = 0.75;
				draw.card(game.hand[index], index, 14);
				ctx.globalAlpha = 1;
			} else {
				draw.card(game.hand[index], index, 14);
			};
		};
		if (temp != -1) {
			draw.card(game.hand[temp], temp, 14, true);
		};
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Select a Card", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
	},
	/**
	 * Draws the info of a card on the canvas.
	 * @param {"card" | "cardSelect" | "reward" | "deck"} type - the type of the card's selection.
	 * @param {Card} cardObj - the card object.
	 */
	cardInfo(type, cardObj) {
		let x = 0, y = 0;
		if (cardObj[CARD_EFF.RETENTION]) {
			y += info[type]("This has " + cardObj[CARD_EFF.RETENTION] + " <#666>retention</#666>.", x, y);
		};
		const keywords = cards[cardObj.id]?.keywords;
		if (keywords instanceof Array) {
			for (let index = 0; index < keywords.length; index++) {
				y += info[type](keywords[index], x, y);
				if (keywords[index] === EFF.BLAZE && !keywords.includes(EFF.BURN)) y += info[type](EFF.BURN, x, y);
			};
		};
	},
	/**
	 * Draws the selector and the info it targets on the canvas.
	 */
	target() {
		if (game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) {
			const enemy = game.enemies[game.select[1]];
			const type = enemy.type;
			const pos = enemyPos[game.select[1]];
			let coords = [], name = ENEMY_NAME[type];
			if (type === SLIME.BIG || (type === SLIME.PRIME && primeAnim != -1 && primeAnim < 5)) {
				coords = [5, 26, 54, 38];
				name = ENEMY_NAME[SLIME.BIG];
			} else if (type === SLIME.SMALL) {
				coords = [19, 36, 26, 28];
			} else if (type === SLIME.PRIME) {
				coords = [0, 7, 64, 57];
			} else if (type === FRAGMENT && (primeAnim == -1 || primeAnim > 18)) {
				coords = [7, 6, 50, 58];
			} else if (type === SENTRY.BIG) {
				coords = [5, 3, 54, 61];
			} else if (type === SENTRY.SMALL) {
				coords = [4, 34, 56, 30];
			} else if (type === SENTRY.PRIME) {
				coords = [9, 0, 46, 64];
			} else if (type === SINGULARITY) {
				coords = [8, 3, 48, 61];
			};
			if (coords) {
				if (pos[1] + coords[1] < 31) {
					coords[1] = 31 - pos[1];
					coords[3] -= 31 - pos[1];
				};
				let left = game.select[1] === 0 && game.enemies.length > 1;
				draw.selector(pos[0] + coords[0], pos[1] + coords[1], coords[2], coords[3]);
				draw.lore(pos[0] + 31, pos[1] + coords[1] - 7.5, name, {"color": "#fff", "text-align": DIR.CENTER, "text-small": true});
				if (game.select[1] !== game.enemyNum && !game.enemies[game.select[1]].eff[ENEMY_EFF.SHROUD]) {
					info.intent();
				};
				const exAtt = enemy.getExtraAttackPower();
				const exDef = enemy.getExtraDefendPower();
				if (left) draw.lore(pos[0] + coords[0] - 2.5, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-align": DIR.LEFT, "text-small": true});
				else draw.lore(pos[0] + coords[0] + coords[2] + 3, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-small": true});
				let x = coords[0] - 5.5, y = coords[1] - 1;
				const logEff = (type) => {
					let height = Math.ceil((EFF_DESC[type].match(/\n/g) || []).length * 5.5 + (game.enemies[game.select[1]].eff[type] > 0 ? 22 : 11));
					if ((left ? y + 12 : y) + height >= 202 - pos[1]) {
						y = coords[1] - 1;
						x -= 77;
					};
					y += info.enemy(type, x, (left ? y + 12 : y));
					if (type === EFF.BLAZE && !game.enemies[game.select[1]].eff[EFF.BURN]) logEff(EFF.BURN);
					else if (type === ENEMY_EFF.PLAN_ATTACK && !game.enemies[game.select[1]].eff[EFF.ATKUP]) logEff(EFF.ATKUP);
					else if (type === ENEMY_EFF.PLAN_DEFEND && !game.enemies[game.select[1]].eff[EFF.DEFUP]) logEff(EFF.DEFUP);
				};
				for (const key in game.enemies[game.select[1]].eff) {
					if (game.enemies[game.select[1]].eff.hasOwnProperty(key)) {
						logEff(+key);
					};
				};
			};
		} else if (game.select[0] === S.PLAYER) {
			let coords = [58, 69, 24, 39];
			draw.selector(coords[0], coords[1], coords[2], coords[3]);
			if (game.character === CHARACTER.KNIGHT) {
				if (global.charStage[CHARACTER.KNIGHT] === 0) draw.lore(coords[0] + (coords[2] / 2) - 1, 61.5, "the forgotten one", {"color": "#fff", "text-align": DIR.CENTER, "text-small": true});
				else if (global.charStage[CHARACTER.KNIGHT] === 1) draw.lore(coords[0] + (coords[2] / 2) - 1, 61.5, "the true knight", {"color": "#fff", "text-align": DIR.CENTER, "text-small": true});
			};
			let x = coords[0] + coords[2] - 80, y = 0;
			const logEff = (type) => {
				let height = Math.ceil((EFF_DESC[type].match(/\n/g) || []).length * 5.5 + (game.eff[type] > 0 ? 22 : 11));
				if (y + height >= 202 - coords[1]) {
					y = 0;
					x += 77;
				};
				y += info.player(type, x, y);
				if (type === EFF.BLAZE && !game.eff[EFF.BURN]) logEff(EFF.BURN);
			};
			for (const key in game.eff) {
				if (game.eff.hasOwnProperty(key)) {
					logEff(+key);
				};
			};
		} else if (game.select[0] === S.ARTIFACTS) {
			info.artifact(game.artifacts[game.select[1]]);
		} else if (game.select[0] === S.ARTIFACT_REWARD) {
			info.artifact(game.room[6][game.select[1]], 179 + (game.select[1] * 32), 90);
		} else if (game.select[0] === S.DECK && game.select[1] == 1 && game.deckLocal.length) {
			graphics.cardInfo("deck", game.deckLocal.slice().cardSort()[game.cardSelect[0] + (game.cardSelect[1] * 6)]);
		} else if (game.select[0] === S.DISCARD && game.select[1] == 1 && game.discard.length) {
			graphics.cardInfo("deck", game.discard[game.cardSelect[0] + (game.cardSelect[1] * 6)]);
		} else if (game.select[0] === S.VOID && game.select[1] == 1 && game.void.length) {
			graphics.cardInfo("deck", game.void[game.cardSelect[0] + (game.cardSelect[1] * 6)]);
		} else if (game.select[0] === S.CARD_REWARD && game.select[1] > -1 && game.select[1] < get.cardRewardChoices()) {
			graphics.cardInfo("reward", new Card(game.room[5][game.select[1]]));
		} else if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) {
			graphics.cardInfo("refinableDeck", refinableDeck[game.cardSelect[0] + (game.cardSelect[1] * 3)]);
		} else if (inOutsideDeck()) {
			graphics.cardInfo("deck", game.deck[game.cardSelect[0] + (game.cardSelect[1] * 6)]);
		};
		if ((game.select[0] === S.HAND || (game.select[0] != S.ATTACK && game.select[0] != S.ENEMY && !hidden() && global.options[OPTION.STICKY_CARDS])) && game.hand.length && game.prevCard < game.hand.length) {
			graphics.cardInfo("card", game.hand[game.prevCard]);
		} else if (game.select[0] === SS.SELECT_HAND && game.select[1] >= 0 && game.select[1] < game.hand.length) {
			graphics.cardInfo("cardSelect", game.hand[game.select[1]]);
		};
	},
	/**
	 * Draws the popups on the canvas.
	 */
	popups() {
		for (let index = 0; index < popups.length && index <= 6; index++) {
			if (popups[index].length == 0) continue;
			if (popups[index][2] >= 150) {
				popups[index] = [];
				continue;
			};
			popups[index][2]++;
			if (popups[index][2] >= 100) {
				ctx.globalAlpha = 3 - (popups[index][2] / 50);
			} else if (popups[index][2] < 25) {
				ctx.globalAlpha = popups[index][2] / 25;
			};
			let x = (popups[index][1].length * 6) + 13;
			if (popups[index][3]) x = (Math.max(popups[index][1].length, popups[index][3].length) * 3) + 13;
			x = 400 - x;
			draw.image(I.popup.back, x, 150 - (index * 21));
			draw.lore(x + 13, 150 - (index * 21) + 8, popups[index][3] ? popups[index][1] + "\n" + popups[index][3] : popups[index][1], {"text-small": !!popups[index][3]});
			if (I.popup[popups[index][0]]) draw.image(I.popup[popups[index][0]], x + 2, 150 - (index * 21) + 2);
			if (game.select[0] === S.POPUPS && game.select[1] == index) {
				draw.image(I.select.popup, x - 1, 150 - (index * 21) - 1);
			};
			ctx.globalAlpha = 1;
		};
	},
	/**
	 * Draws the reward claiming box on the canvas.
	 * @param {boolean} focused - whether the reward layer is focused. Defaults to `true`.
	 */
	rewards(focused = true) {
		draw.box(145, 20, 110, 160, {"background-color": "#aaa"});
		const place = game.location.split(", ");
		const type = (game.location == "-1" ? ROOM.BATTLE : game.map[place[0]][place[1]][0]);
		if (type === ROOM.BATTLE) draw.lore(200 - 2, 21, "Battle Loot!", {"text-align": DIR.CENTER});
		else if (type === ROOM.TREASURE) draw.lore(200 - 2, 21, "Treasure!", {"text-align": DIR.CENTER});
		else if (type === ROOM.ORB) draw.lore(200 - 2, 21, "Healing!", {"text-align": DIR.CENTER});
		else draw.lore(200 - 2, 21, "Rewards!", {"text-align": DIR.CENTER});
		for (let index = 0; index < game.rewards.length; index++) {
			let item = game.rewards[index];
			draw.image(I.reward.item, 149, 33 + (index * 20));
			if (game.select[1] == index && focused) draw.image(I.select.item_border, 148, 32 + (index * 20));
			if (item.endsWith(" - claimed")) draw.image(I.select.item_green, 149, 33 + (index * 20));
			else if (game.select[1] == index && focused) draw.image(I.select.item, 149, 33 + (index * 20));
			if (item == "finish") draw.image(I.reward.back, 149, 33 + (index * 20));
			draw.lore(166, 37 + (index * 20), item.replace(" - claimed", ""));
		};
	},
	/**
	 * Draws the card reward choosing box on the canvas.
	 * @param {boolean} focused - whether the card reward layer is focused. Defaults to `true`.
	 */
	cardRewards(focused = true) {
		const choices = get.cardRewardChoices();
		let x = 198 - (choices * 68 / 2), y = 20, width = (choices * 68) + 4, height = 160;
		draw.box(x, y, width, height, {"background-color": "#aaa"});
		if (choices === 1) draw.lore(200 - 2, y + 1, "Take the\ncard?", {"text-align": DIR.CENTER});
		else draw.lore(200 - 2, y + 1, "Pick a card:", {"text-align": DIR.CENTER});
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
		draw.box(x, y, width, height, {"background-color": "#aaa"});
		draw.lore(200 - 2, y + 1, "Pick an artifact:", {"text-align": DIR.CENTER});
		for (let index = 0; index < 3; index++) {
			draw.image(I.artifact[game.room[6][index]], 160 + (index * 32), 90);
			if (game.select[1] === index) draw.image(I.artifact.select[game.room[6][index]], 159 + (index * 32), 89);
		};
		if ((game.select[1] === -1 || game.select[1] === 3) && focused) draw.rect("#fff", x, y + height - 14, width, 14);
		draw.box(x + 2, y + height - 12, width - 4, 10);
		draw.lore(x + 3, y + height - 11, "Go back");
	},
	/**
	 * Calculates the map paths, then draws the map on the canvas.
	 * @param {boolean} onlyCalc - whether to only calculate the map paths. Defaults to `false`.
	 * @param {number} area - overrides the area of the map being calculated and drawn.
	 */
	map(onlyCalc = false, area = get.area(game.floor + (game.state === STATE.EVENT_FIN ? 1 : 0))) {
		let render = !onlyCalc;
		// draw map
		if (render) {
			draw.rect("#000");
			draw.image(I.map.top, 3, 12);
			draw.image(I.map.row, 16, 19, I.map.row.width, 174);
			draw.image(I.map.bottom, 16, 184);
			if (game.state === STATE.EVENT_FIN) {
				if (game.floor % 10 == 9) {
					draw.image(I.map.select, 18 + (9 * 32), 12);
					draw.image(I.map.select, 12 + (10 * 32), 12);
				} else if (game.floor % 10 === 0) {
					draw.image(I.map.select_first, 13, 12);
				} else {
					draw.image(I.map.select, 13 + (game.floor % 10 * 32), 12);
				};
			} else if (game.floor > 0) {
				if (game.floor % 10 == 0) {
					draw.image(I.map.select, 18 + (9 * 32), 12);
					draw.image(I.map.select, 12 + (10 * 32), 12);
				} else if (game.floor % 10 == 1) {
					draw.image(I.map.select_first, 13, 12);
				} else {
					draw.image(I.map.select, 13 + ((game.floor % 10 - 1) * 32), 12);
				};
			};
			draw.image(I.extra.deck, 22, 16);
			if (game.select[0] === S.MAP && game.mapSelect == (paths[game.location] || []).length) draw.image(I.select.deck, 21, 15);
			draw.image(I.extra.end, 22, 179);
			if (game.select[0] === S.MAP && game.mapSelect == -1) draw.image(I.select.round, 21, 178);
			draw.lore(1, 1, "floor " + game.floor + " - " + game.gold + " gold", {"color": "#f44"});
			draw.lore(399, 1, "seed: " + game.seed, {"color": "#fff", "text-align": DIR.LEFT});
		};
		// draw scribbles
		if (render) {
			for (let x = area * 10; x < (area + 1) * 10; x++) {
				for (let y = 0; y < game.map[x].length; y++) {
					if (typeof game.map[x][y] != "number") continue;
					draw.image(I.map.scribble_back, 25 + ((x - area * 10) * 32) + 8 - 4, 18 + (y * 32) + 8 - 3 - 2.5, 80 / 2, 80 / 2);
					draw.imageSector(I.map.scribbles, game.map[x][y] * 64, 0, 64, 70, 25 + ((x - area * 10) * 32) + 8, 18 + (y * 32) + 8 - 3, 64 / 2, 70 / 2);
				};
			};
		};
		// calculate nodes
		let store = [];
		for (let x = area * 10; x < (area + 1) * 10 && x < game.map.length; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (typeof game.map[x][y] != "object") continue;
				let drawX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (game.map[x][y][0] === ROOM.BOSS) {
					drawX = 25 + 10 + 8 + ((x - area * 10) * 32);
					drawY = 90 + 8;
				};
				if (render && x % 10 == 0) {
					if (game.traveled[x] === y) draw.line(drawX + 8, drawY + 8, 18, drawY + 8, "#842", 3);
					else draw.line(drawX + 8, drawY + 8, 18, drawY + 8, "#b84", 3);
				};
				let posX, posY, connectNode = [];
				const calcNode = (nodeX, nodeY) => {
					connectNode = [nodeX - x, nodeY];
					store.push([x, y, nodeX, nodeY]);
					if (game.map[nodeX][nodeY][0] === ROOM.BOSS) {
						posX = 25 + 10 + 8 + ((nodeX - area * 10) * 32);
						posY = 90 + 8;
					} else {
						posX = 25 + ((nodeX - area * 10) * 32) + game.map[nodeX][nodeY][1];
						posY = 18 + (nodeY * 32) + game.map[nodeX][nodeY][2];
					};
				};
				if (x % 10 != 9 && game.map[x + 1]) {
					for (num = 0; num < 7; num++) {
						if (typeof game.map[x + 1][y - num] == "object") {
							calcNode(x + 1, y - num);
							break;
						} else if (typeof game.map[x + 1][y + num] == "object") {
							calcNode(x + 1, y + num);
							break;
						};
					};
					if (render && !(game.traveled[x] === y && game.traveled[x + connectNode[0]] === connectNode[1])) {
						draw.curvedLine(drawX + 8, drawY + 8, (drawX + posX) / 2 + 8, (x % 2 == 0 ? drawY : posY) + 8, posX + 8, posY + 8, "#b84", 3);
					};
				};
				if (x % 10 != 0) {
					for (num = 0; num < 7; num++) {
						if (typeof game.map[x - 1][y - num] == "object") {
							calcNode(x - 1, y - num);
							break;
						} else if (typeof game.map[x - 1][y + num] == "object") {
							calcNode(x - 1, y + num);
							break;
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
			for (let x = area * 10; x < game.traveled.length && x < (area + 1) * 10; x++) {
				let y = game.traveled[x];
				if (game.map[x][y]) {
					if (drawX && drawY) {
						let posX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
						let posY = 18 + (y * 32) + game.map[x][y][2];
						if (game.map[x][y][0] === ROOM.BOSS) {
							posX = 25 + 10 + 8 + ((x - area * 10) * 32);
							posY = 90 + 8;
						};
						draw.curvedLine(drawX + 8, drawY + 8, (drawX + posX) / 2 + 8, (x % 2 == 1 ? drawY : posY) + 8, posX + 8, posY + 8, "#842", 3);
						drawX = posX;
						drawY = posY;
					} else {
						drawX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
						drawY = 18 + (y * 32) + game.map[x][y][2];
					};
				};
			};
		};
		// draw nodes
		if (render) {
			const str = paths[game.location] ? paths[game.location][game.mapSelect] : undefined;
			const coordSel = str ? str.split(", ") : [];
			const coordOn = game.location.split(", ");
			for (let x = area * 10; x < (area + 1) * 10; x++) {
				for (let y = 0; y < game.map[x].length; y++) {
					if (typeof game.map[x][y] != "object") continue;
					let drawX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
					let drawY = 18 + (y * 32) + game.map[x][y][2];
					if (game.map[x][y][0] === ROOM.BATTLE) {
						draw.image(I.map.node.battle, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.battle, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.battle_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.PRIME) {
						draw.image(I.map.node.death_zone, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.death_zone, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.death_zone_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.TREASURE) {
						if (game.map[x][y][3]) {
							draw.image(I.map.node.treasure_open, drawX, drawY);
							if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.treasure_open_blue, drawX - 1, drawY - 1);
						} else {
							draw.image(I.map.node.treasure, drawX, drawY);
							if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.treasure, drawX - 1, drawY - 1);
							if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.treasure_blue, drawX - 1, drawY - 1);
						};
					} else if (game.map[x][y][0] === ROOM.ORB) {
						draw.image(I.map.node.orb, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.orb, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.orb_blue, drawX - 1, drawY - 1);
					} else if (game.map[x][y][0] === ROOM.BOSS) {
						drawX += 10;
						draw.image(I.map.node.boss, drawX, 90);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.boss, drawX - 1, 90 - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.boss_blue, drawX - 1, 90 - 1);
					} else if (game.map[x][y][0] === ROOM.EVENT) {
						draw.image(I.map.node.event, drawX, drawY);
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.event, drawX - 1, drawY - 1);
						if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select.event_blue, drawX - 1, drawY - 1);
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
				if (!paths["-1"]) paths["-1"] = [];
				if (!paths["-1"].includes("" + store[num][0] + ", " + store[num][1])) paths["-1"].push("" + store[num][0] + ", " + store[num][1]);
			} else if (store[num][0] === 10) {
				if (!paths["9, 2"]) paths["9, 2"] = [];
				if (!paths["9, 2"].includes("" + store[num][0] + ", " + store[num][1])) paths["9, 2"].push("" + store[num][0] + ", " + store[num][1]);
			};
		};
		// sort paths
		for (const item in paths) {
			if (paths.hasOwnProperty(item)) {
				paths[item].sort();
			};
		};
	},
	/**
	 * Draws the current event on the canvas.
	 */
	event() {
		draw.rect("#0006");
		graphics.foregrounds();
		const event = getCurrentEvent();
		if (!event[1]) return;
		draw.lore(200 - 2, 50, (typeof event[1] == "function" ? event[1]() : event[1]), {"color": "#fff", "text-align": DIR.CENTER});
		if (game.select[1] !== -1) {
			let len = event[game.select[1] + 2][0].length * 6 + 2;
			draw.box(200 - len / 2, 99 + (game.select[1] + 2) * 20, len, 12, {"background-color": "#0000", "border-color": "#fff"});
		};
		for (let index = 2; index < event.length; index++) {
			let text = event[index][0];
			draw.lore(200 - 2, 100 + index * 20, (typeof text == "function" ? text() : text), {"color": "#fff", "text-align": DIR.CENTER});
		};
	},
};

const startAnim = {
	/**
	 * Starts a player animation.
	 * @param {HTMLImageElement} image - the image of the player animation.
	 */
	player(image) {
		if (!(image instanceof HTMLImageElement) || playerAnim[1] === I.player.death) return;
		if (game.eff[EFF.AURA_BLADE]) {
			if (image == I.player.attack) image = I.player.attack_aura;
			else if (image == I.player.attack_2) image = I.player.attack_2_aura;
		};
		if (game.eff[EFF.REINFORCE]) {
			if (image == I.player.shield) image = I.player.shield_reinforced;
			else if (image == I.player.crouch_shield) image = I.player.crouch_shield_reinforced;
		};
		playerAnim = [0, image];
	},
	/**
	 * Starts an effect animation.
	 * @param {HTMLImageElement} image - the image of the effect animation.
	 */
	effect(image) {
		if (!(image instanceof HTMLImageElement)) return;
		effAnim = [0, image];
	},
	/**
	 * Starts an enemy animation.
	 */
	enemy() {
		enemyActionAnim = [0, ANIM.STARTING];
	},
};
