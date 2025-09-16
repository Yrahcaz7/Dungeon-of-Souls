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

const NO_ANTIALIASING_FILTER = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#filter')`;
const AURA_BLADE_POS = [[65, 10], [80, 25], [42, 0], [28, 35]];

/** @type {number[][]} */
let enemyPos = [];
/** @type {number[]} */
let handPos = [];
/** @type {number[]} */
let handSelectPos = [];
/** @type {[number, Card[], number[], number[]][]} */
let handAnim = [];
/** @type {number[][]} */
let handAnimPositions = [];
/** @type {number[]} */
let handAnimOffsets = [];
/** @type {Card[]} */
let handAnimCards = [];
/** @type {EnemyAnimationSource} */
let enemyAnim = new EnemyAnimationSource(6, () => game.enemies);
/** @type {EnemyAnimationSource} */
let menuEnemyAnim = new EnemyAnimationSource(10, [...SMALL_ENEMIES, ...BIG_ENEMIES, ...PRIME_ENEMIES, ...SPECIAL_ENEMIES, ...BOSS_ENEMIES]);
/** @type {(number | (number | number[])[])[]} */
let backAnim = [0, 1.5, 3, 0];
/** @type {number[]} */
let intentAnim = [0, 1.5, 3, 0.5, 2, 3.5];
/** @type {number[]} */
let cardAnim = [];
/** @type {[number, HTMLImageElement | null]} */
let effAnim = [0, null];
/** @type {[number, HTMLImageElement]} */
let playerAnim = [0, I.player.idle];
/** @type {number[][]} */
let extraAnim = [];
/** @type {number} */
let transition = 0;
/** @type {number[]} */
let auraBladeAnim = [0, 3, 6, 1];
/** @type {number} */
let infoPos = 0;
/** @type {number} */
let infoLimit = 0;

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
		ctx.drawImage(image, (x ?? 0) * SCALE, (y ?? 0) * SCALE, (width ?? image.width) * SCALE, (height ?? image.height) * SCALE);
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
		ctx.drawImage(image, sx, sy, sw, sh, (dx ?? 0) * SCALE, (dy ?? 0) * SCALE, (dw ?? sw) * SCALE, (dh ?? sh) * SCALE);
	},
	/**
	 * Draws a rectangle on the canvas.
	 * @param {string} color - the color of the rectangle.
	 * @param {number} x - the x-coordinate to draw the rectangle at. Defaults to `0`.
	 * @param {number} y - the y-coordinate to draw the rectangle at. Defaults to `0`.
	 * @param {number} width - the width of the rectangle. Defaults to `canvas.width / scale`.
	 * @param {number} height - the height of the rectangle. Defaults to `canvas.height / scale`.
	 */
	rect(color, x = 0, y = 0, width = canvas.width / SCALE, height = canvas.height / SCALE) {
		ctx.fillStyle = color;
		ctx.fillRect((x ?? 0) * SCALE, (y ?? 0) * SCALE, (width ?? canvas.width / SCALE) * SCALE, (height ?? canvas.height / SCALE) * SCALE);
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
		ctx.strokeStyle = color ?? "#000";
		ctx.lineWidth = (width ?? 1) * SCALE;
		ctx.moveTo(x1 * SCALE, y1 * SCALE);
		ctx.lineTo(x2 * SCALE, y2 * SCALE);
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
	 * @param {string} color - the color of the curved line. Defaults to `#000`.
	 * @param {number} width - the width of the curved line. Defaults to `1`.
	 */
	curvedLine(x1, y1, x2, y2, x3, y3, color = "#000", width = 1) {
		ctx.beginPath();
		ctx.strokeStyle = color ?? "#000";
		ctx.lineWidth = (width ?? 1) * SCALE;
		ctx.moveTo(x1 * SCALE, y1 * SCALE);
		ctx.quadraticCurveTo(x2 * SCALE, y2 * SCALE, x3 * SCALE, y3 * SCALE);
		ctx.stroke();
	},
	/**
	 * Draws a polyline on the canvas.
	 * @param {number[][]} points - the coordinates of the polyline's points.
	 * @param {string} color - the color of the polyline. Defaults to `#000`.
	 * @param {number} width - the width of the polyline. Defaults to `1`.
	 */
	polyline(points, color = "#000", width = 1) {
		ctx.beginPath();
		ctx.strokeStyle = color ?? "#000";
		ctx.lineWidth = (width ?? 1) * SCALE;
		for (let index = 0; index < points.length; index++) {
			ctx.lineTo(points[index][0] * SCALE, points[index][1] * SCALE);
		};
		ctx.stroke();
	},
	/**
	 * Draws a polygon on the canvas.
	 * @param {number[][]} points - the coordinates of the polygon's points.
	 * @param style - the polygon's style object.
	 */
	polygon(points, style = {"background-color": "#000", "border-width": 0, "border-color": "#000"}) {
		style = Object.assign({"background-color": "#000", "border-width": 0, "border-color": "#000"}, style);
		ctx.beginPath();
		ctx.fillStyle = style["background-color"];
		ctx.strokeStyle = style["border-color"];
		ctx.lineWidth = style["border-width"] * SCALE;
		for (let index = 0; index < points.length; index++) {
			ctx.lineTo(points[index][0] * SCALE, points[index][1] * SCALE);
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
		ctx.filter = NO_ANTIALIASING_FILTER;
		const coords = [(x + 30) * SCALE, (y + 30) * SCALE];
		if (hours >= 0) {
			ctx.save();
			ctx.translate(coords[0], coords[1]);
			ctx.rotate(hours / 6 * Math.PI);
			let points = [[-1, -3], [-1, -9], [-3, -9], [-3, -10], [0, -13], [3, -10], [3, -9], [1, -9], [1, -3]];
			if (offsetH) {
				for (let index = 0; index < points.length; index++) {
					points[index][1] = Math.max(points[index][1] - offsetH, -30);
				};
			};
			draw.polygon(points, {"background-color": "#f07000"});
			ctx.restore();
		};
		if (minutes >= 0) {
			ctx.save();
			ctx.translate(coords[0], coords[1]);
			ctx.rotate(minutes / 30 * Math.PI);
			let points = [[-1, -3], [-1, -12], [-3, -12], [-3, -13], [0, -16], [3, -13], [3, -12], [1, -12], [1, -3]];
			if (offsetM) {
				for (let index = 0; index < points.length; index++) {
					points[index][1] = Math.max(points[index][1] - offsetM, -30);
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
		style = Object.assign({"color": "#000", "highlight-color": "", "text-small": false}, style);
		// highlight
		if (style["highlight-color"] && char.charCodeAt() >= 32) {
			if (style["text-small"]) draw.rect(style["highlight-color"], x - 0.5, y - 0.5, 3.5, 5.5);
			else draw.rect(style["highlight-color"], x - 1, y - 1, 7, 11);
		};
		// draw char
		if (CHARACTERS[char]) {
			ctx.fillStyle = style["color"];
			for (let row = 0; row < CHARACTERS[char].length; row++) {
				for (let index = 0; index < CHARACTERS[char][row].length; index++) {
					if (CHARACTERS[char][row][index]) {
						if (style["text-small"]) ctx.fillRect(x * SCALE + index, y * SCALE + row, 1, 1);
						else ctx.fillRect((x + index) * SCALE, (y + row) * SCALE, SCALE, SCALE);
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
		style = Object.assign({"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false}, style);
		let color = style["color"];
		let highlight = "";
		let textAlign = style["text-align"];
		let small = style["text-small"];
		str = ("" + str).replace(/<br>/g, "\n");
		x = Math.round(x * 2) / 2;
		y = Math.round(y * 2) / 2;
		let enters = 0;
		let enterIndex = 0;
		let len = str.replace(/<.*?>/g, "").length;
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
		if (str.includes("\n") && textAlign !== DIR.RIGHT) {
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
			if (textAlign === DIR.RIGHT) {
				draw.char(char, x + ((a - enterIndex) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (textAlign === DIR.LEFT) {
				draw.char(char, x + (((a - enterIndex) - len) * (small ? 3 : 6)), y + (enters * (small ? 5.5 : 11)), {
					"color": color,
					"highlight-color": highlight,
					"text-small": small,
				});
			} else if (textAlign === DIR.CENTER) {
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
		const x = enemyPos[index][0] + 16;
		const y = getEnemyIntentPos(index, true);
		if (game.enemies[index].intent === INTENT.SUMMON) {
			if (game.enemies.length >= 6) draw.image(I.intent.ritual, x, y);
			else draw.image(I.intent.summon, x, y);
		} else if (game.enemies[index].intent === INTENT.BUFF) {
			draw.image(I.intent.buff, x, y);
		} else if (game.enemies[index].intent === INTENT.ATTACK) {
			const power = Math.ceil(game.enemies[index].getTotalAttackPower() * get.takeDamageMult(index));
			draw.image(I.intent.attack[Math.min(Math.floor(power / 5), 10)], x, y);
			draw.lore(x + 14, y + 12, power, {"color": "#fff", "text-align": DIR.CENTER});
			if (power > game.enemies[index].attackPower) draw.image(I.intent.increase, x + 32 - 10, y);
			else if (power < game.enemies[index].attackPower) draw.image(I.intent.decrease, x + 32 - 10, y + 32 - 8);
		} else if (game.enemies[index].intent === INTENT.DEFEND) {
			const power = Math.ceil(game.enemies[index].getTotalDefendPower() * get.enemyShieldMult(index));
			draw.image(I.intent.defend[Math.min(Math.floor(power / 5), 10)], x, y);
			draw.lore(x + 14, y + 11, power, {"color": "#fff", "text-align": DIR.CENTER});
			if (power > game.enemies[index].defendPower) draw.image(I.intent.increase, x + 32 - 10, y);
			else if (power < game.enemies[index].defendPower) draw.image(I.intent.decrease, x + 32 - 10, y + 32 - 8);
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
	box(x, y, width, height, style = {"background-color": "#ddd", "border-width": 1, "border-color": "#000"}) {
		style = Object.assign({"background-color": "#ddd", "border-width": 1, "border-color": "#000"}, style);
		if (style["background-color"]) draw.rect(style["background-color"], x, y, width, height);
		const borderW = style["border-width"];
		if (borderW) {
			draw.rect(style["border-color"], x - borderW, y - borderW, width + borderW, borderW); // top
			draw.rect(style["border-color"], x - borderW, y + height, width + borderW, borderW); // bottom
			draw.rect(style["border-color"], x - borderW, y - borderW, borderW, height + borderW); // left
			draw.rect(style["border-color"], x + width, y - borderW, borderW, height + (borderW * 2)); // right
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
		let cutoff = Math.round(Math.min(Math.max(health / maxHealth, 0), 1) * 62);
		if ((health < 10 && maxHealth >= 10) || (health < 100 && maxHealth >= 100) || (health < 1000 && maxHealth >= 1000)) {
			health = "0" + health;
		};
		draw.imageSector(I.bar.health_full, 0, 0, cutoff + 1, 12, x, y + 65);
		draw.imageSector(I.bar.health_empty, cutoff + 1, 0, 64 - (cutoff + 1), 12, x + (cutoff + 1), y + 65);
		draw.lore(x + 31, y + 67, health, {"text-align": DIR.LEFT});
		draw.lore(x + 34, y + 67, maxHealth);
		cutoff = Math.round(Math.min(Math.max(shield / maxShield, 0), 1) * 62);
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
	 * @param {Card | number} card - the card object or card id.
	 * @param {number} x - the x-coordinate to draw the card at.
	 * @param {number} y - the y-coordinate to draw the card at.
	 * @param {boolean} selected - whether the card is selected. Defaults to `false`.
	 * @param {boolean} outside - whether the card is outside the battle. Defaults to `false`.
	 */
	card(card, x, y, selected = false, outside = false) {
		// setup
		if (!(card instanceof Object)) card = new Card(card);
		let img = I.card.error;
		const rarity = +CARDS[card.id].rarity;
		if (card.id > 0 && I.card[rarity]) {
			img = I.card[rarity][card.id];
			draw.image(I.card.back, x + 2, y + 2);
		};
		// card outline
		const type = CARD_TYPE[Math.floor(card.id / 1000)];
		if (I.card.outline[type]) draw.image(I.card.outline[type], x + 3, y + 3);
		// card selector
		if (selected) {
			let selectorName = "card";
			if (rarity == 2) selectorName += "_rare";
			if (CARDS[card.id].keywords.includes(CARD_EFF.UNPLAYABLE)) selectorName += "_unplayable";
			if (card.level >= 1) selectorName += "_plus";
			draw.image(I.select[selectorName], x - 3, y - 3);
		};
		// card image
		if (img === I.card.error) draw.image(img, x + 2, y + 2);
		else draw.image(img, x + 7, y + 7);
		// card title
		const name = CARDS[card.id].name;
		if (name.length >= 10) draw.lore(x + 33, y + 44, name, {"text-align": DIR.CENTER, "text-small": true});
		else if (LOW_CHAR_REGEX.test(name)) draw.lore(x + 32, y + 41, name, {"text-align": DIR.CENTER});
		else draw.lore(x + 32, y + 42, name, {"text-align": DIR.CENTER});
		// card text
		card.getAttr("desc").draw(x + 6, y + 55, card.id, outside);
		draw.lore(x + 33, y + 89.5, (RARITY[rarity] || "special") + "|" + type, {"text-align": DIR.CENTER, "text-small": true});
		// card energy and rarity
		if (rarity == 2) draw.image(I.card.rarity.rare, x - 1, y - 2);
		if (!CARDS[card.id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
			const originalCost = card.getAttr("cost");
			if (outside) {
				draw.image(I.card.energy, x, y);
				draw.lore(x + 4, y + 2, originalCost);
			} else {
				const cost = getCardCost(card);
				if (cost < originalCost) draw.image(I.card.green_energy, x, y);
				else if (cost > originalCost) draw.image(I.card.red_energy, x, y);
				else draw.image(I.card.energy, x, y);
				draw.lore(x + 4, y + 2, cost);
			};
		};
		if (card.level >= 1) draw.image(I.card.plus, x + 55, y);
	},
	/**
	 * Draws a textbox on the canvas.
	 * @param {number} x - the x-coordinate to draw the textbox at.
	 * @param {number} y - the y-coordinate to draw the textbox at.
	 * @param {number} width - the textbox's width, measured in characters.
	 * @param {string} str - the string containing the lore to insert into the textbox.
	 * @param style - the textbox's style object.
	 */
	textBox(x, y, width, str, style = {"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false, "background-color": "#ddd", "border-width": 1, "border-color": "#000"}) {
		style = Object.assign({"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false, "background-color": "#ddd", "border-width": 1, "border-color": "#000"}, style);
		const lines = (("" + str).match(/\n/g) || []).length;
		let height = style["text-small"] ? 7 : 12;
		if (style["text-small"]) {
			width = Math.ceil(width * 3 + 0.5);
			height = Math.ceil(lines * 5.5 + 7);
		} else {
			width = width * 6 + 1;
			height = lines * 11 + 12;
		};
		draw.box(x, y, width, height, style);
		if (style["text-align"] === DIR.CENTER) {
			x += width / 2;
			if (style["text-small"]) x -= 1.5;
			else x -= 2.5;
		} else if (style["text-align"] === DIR.LEFT) {
			x += width;
			if (style["text-small"]) x -= 4;
			else x -= 7;
		};
		draw.lore(x + 1, y + 1, str, style);
		return height + 4;
	},
	/**
	 * Draws a top bar on the canvas.
	 * @param {string} title - the title displayed on the bar.
	 * @param {number} width - the width of the bar. Defaults to `398`.
	 */
	topBar(title, width = 398) {
		draw.rect("#0008", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, title, {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, width, 1);
	},
	/**
	 * Draw's an enemy's icons on the canvas.
	 * @param {number} index - the index of the enemy.
	 */
	enemyIcons(index) {
		const enemy = game.enemies[index];
		draw.bars(enemyPos[index][0], enemyPos[index][1], enemy.health, enemy.maxHealth, enemy.shield, enemy.maxShield);
		let x = +enemyPos[index][0];
		let y = +enemyPos[index][1];
		for (const key in enemy.eff) {
			if (enemy.eff[key]) {
				let img = I.icon[key];
				if (img === I.icon[1704]) draw.image(I.icon["1704_back"], x - 1, y + 88);
				draw.image(img, x, y + 89);
				if (!PERM_EFF_DESC[key]) draw.lore(x + 17, y + 97, enemy.eff[key], {"color": "#fff", "text-align": DIR.LEFT});
				x += 17;
				if (x >= enemyPos[index][0] + (index === 0 && game.void.length && game.enemies.length > 2 ?
					(Object.keys(enemy.eff).length > (game.enemies.length > 3 ? 4 : 6) ? 51 : 34)
					: 68
				)) {
					x = enemyPos[index][0];
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
		if (typeof type === "number" && !EFF_DESC[type]) return 0;
		const normIndex = (game.prevCard == 0 && handAnim.length > 0 ? handAnimCards.indexOf(game.hand[game.prevCard]) : game.prevCard);
		const effIndex = normIndex - (handAnimOffsets[game.prevCard] || 0);
		let x = handAnimPositions[normIndex][0] + 69 + xPlus;
		const y = (handAnimPositions[normIndex][1] ?? (146 - Math.floor(cardAnim[effIndex]))) + 1 + yPlus;
		if (x + 24 * 3 + 2 > 400) {
			const ref = CARDS[handAnimCards[normIndex].id];
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
		if (typeof type === "number" && !EFF_DESC[type]) return 0;
		let x = handSelectPos[game.select[1]] + 69 + xPlus;
		const y = 18 + yPlus;
		if (x + 24 * 3 + 2 > 400) {
			const ref = CARDS[game.hand[game.select[1]].id];
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
		if (typeof type === "number" && !EFF_DESC[type]) return 0;
		let x = handPos[game.select[1]] + 69 + xPlus;
		const y = 51 + yPlus;
		if (game.select[1] == get.cardRewardChoices() - 1 && get.cardRewardChoices() >= 4) {
			const ref = CARDS[game.room[5][game.select[1]]];
			if (ref.keywords.includes(CARD_EFF.UNPLAYABLE) && ref.rarity <= 1) x -= 143;
			else x -= 145;
			if (!EFF_DESC[type]) x += (24 - ("" + type).replace(/<.+?>/g, "").length) * 3;
		};
		if (EFF_DESC[type]) return draw.textBox(x, y, 24, EFF_DESC[type], {"text-small": true});
		return draw.textBox(x, y, ("" + type).replace(/<.+?>/g, "").length, type, {"text-small": true});
	},
	/**
	 * Draws an infobox for a card in a deck.
	 * @param {string | number} type - the infobox contains `EFF_DESC[type]`.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	deck(type, xPlus = 0, yPlus = 0) {
		const deck = currentDeck();
		if (!deck[game.cardSelect] || (typeof type === "number" && !EFF_DESC[type])) return 0;
		const refining = (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE);
		const cols = (refining ? 3 : 6);
		const selected = [game.cardSelect % cols, Math.floor(game.cardSelect / cols)];
		let x = (refining ? 72 : 71) + (selected[0] * (refining ? 68 : 66)) + xPlus;
		const y = (refining ? 16 : 15) + (selected[1] * (refining ? 100 : 98)) - game.deckScroll + yPlus;
		if (selected[0] >= (refining ? 2 : 4)) {
			let ref = CARDS[deck[game.cardSelect].id];
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
		const x = 85 + xPlus;
		const y = 68 + yPlus;
		let move = 0;
		if (eff > 0) {
			const name = EFF_NAME[type] + ((type === EFF.AURA_BLADE || type === ENEMY_EFF.REWIND) && eff >= 2 ? "s" : "");
			const start = (PERM_EFF_DESC[type] ? "This " + PERM_EFF_DESC[type] : "This has " + eff);
			const desc = start + " " + name + ".";
			move += draw.textBox(x, y + move, desc.length, (EFF_COLOR[type] ? start + " <" + EFF_COLOR[type] + ">" + name + "</" + EFF_COLOR[type] + ">." : desc), {"text-small": true});
		};
		move += draw.textBox(x, y + move, 24, EFF_DESC[type], {"text-small": true});
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
		const x = pos[0] - 72.5 + xPlus;
		const y = pos[1] + yPlus;
		let move = 0;
		if (eff > 0) {
			const name = EFF_NAME[type] + ((type === EFF.AURA_BLADE || type === ENEMY_EFF.REWIND) && eff >= 2 ? "s" : "");
			const start = (PERM_EFF_DESC[type] ? "This " + PERM_EFF_DESC[type] : "This has " + eff);
			const desc = start + " " + name + ".";
			move += draw.textBox(x + 72 - (desc.length * 3), y + move, desc.length, (EFF_COLOR[type] ? start + " <" + EFF_COLOR[type] + ">" + name + "</" + EFF_COLOR[type] + ">." : desc), {"text-small": true});
		};
		move += draw.textBox(x, y + move, 24, EFF_DESC[type], {"text-small": true});
		if (type === ENEMY_EFF.COUNTDOWN) move += draw.textBox(x, y + move, 24, "The next intent will be\nto " + MIN_INTENT_DESC[game.enemies[game.select[1]].intentHistory[eff - 1]] + ".", {"text-small": true});
		return move;
	},
	/**
	 * Draws an infobox for the selected enemy's intent.
	 * @param {number} xPlus - adds to the x-coordinate of the infobox.
	 * @param {number} yPlus - adds to the y-coordinate of the infobox.
	 */
	intent(xPlus = 0, yPlus = 0) {
		const x = enemyPos[game.select[1]][0] - 71 + xPlus;
		const y = getEnemyIntentPos(game.select[1]) + yPlus;
		if (y === y) {
			const intent = game.enemies[game.select[1]]?.intent;
			const desc = FULL_INTENT_DESC[intent === INTENT.SUMMON && game.enemies.length >= 6 ? INTENT.RITUAL : intent];
			if (desc) draw.textBox(x, y - (desc.match(/\n/g) || []).length * 3, 28, desc, {"text-small": true});
		};
	},
	/**
	 * Draws an infobox for an artifact.
	 * @param {string | number} type - the type of the artifact.
	 * @param {number} xOveride - overrides the x-coordinate of the infobox.
	 * @param {number} yOveride - overrides the y-coordinate of the infobox.
	 */
	artifact(type, xOveride = NaN, yOveride = NaN) {
		const x = (xOveride === xOveride ? xOveride : 2 + (game.select[1] * 18));
		const y = (yOveride === yOveride ? yOveride : 32);
		const obj = ARTIFACTS[type];
		if (!obj) return;
		if (obj.name.length <= 12) {
			draw.textBox(x, y, 12, obj.name, {"text-align": DIR.CENTER});
			draw.textBox(x, y + 13, 24, obj.desc, {"text-small": true});
		} else {
			draw.textBox(x, y, obj.name.length, obj.name);
			draw.textBox(x, y + 13, obj.name.length * 2, obj.desc, {"text-small": true});
		};
	},
	/**
	 * Draws an infobox for a menu item.
	 * @param {number} location - the location of the menu item. Can be a `DIR` value or `S.MAP`.
	 * @param {number} index - the index of the menu item in its location.
	 * @param {string} desc - the description of the menu item (if location is not `S.MAP`).
	 */
	menuItem(location, index, desc = "") {
		let loc = [0, 0];
		if (location === DIR.LEFT) {
			loc = [22, 184 - index * 19];
		} else if (location === DIR.RIGHT) {
			loc = [377 - desc.length * 6, 184 - index * 19];
		} else if (location === DIR.UP) {
			loc = [396 - index * 19 - desc.length * 6, 22];
		} else if (location === S.MAP) {
			const selection = get.availableLocations()[index];
			if (selection) {
				const node = game.map[selection[0]][selection[1]];
				const area = get.area(game.floor + (game.state === STATE.EVENT_FIN ? 1 : 0));
				if (node[0] === ROOM.BOSS) loc = [259, 100];
				else loc = [25 + ((selection[0] - area * 10) * 32) + node[1] + 19, 18 + (selection[1] * 32) + node[2] + 2];
				if (node[0] === ROOM.BATTLE) desc = "Enter Battle";
				else if (node[0] === ROOM.TREASURE) desc = "Claim Treasure";
				else if (node[0] === ROOM.PRIME) desc = "Enter Death Zone";
				else if (node[0] === ROOM.ORB) desc = "Claim Orb";
				else if (node[0] === ROOM.BOSS) desc = "Fight Boss";
				else if (node[0] === ROOM.EVENT) desc = "Enter Event";
				else desc = "Enter Location";
			} else if (index < 0) {
				loc = [41, 181];
				desc = "Close Map";
			} else {
				loc = [41, 18];
				desc = "View Owned Cards";
			};
		} else if (location === DIR.CENTER) {
			if (index === 0) loc = [22, 60];
			else loc = [376 - desc.length * 6, 60];
		};
		draw.textBox(loc[0], loc[1], desc.length, desc);
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
					if (backAnim[col][index][0] === 0 && Math.random() < 1/100) {
						backAnim[col][index] = [Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 6)];
					};
				};
			};
			for (let col = 0; col < 12; col++) {
				if (!backAnim[col][9]) backAnim[col][9] = [];
				for (let index = 0; index < 6; index++) {
					if (!backAnim[col][9][index]) backAnim[col][9][index] = 0;
					if (backAnim[col][9][index] === 0 && Math.random() < 1/200) {
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
			if (hasArtifact(202) && game.floor == 10) {
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
				const now = new Date();
				let time = [now.getHours(), now.getMinutes()];
				const y = 64 - Math.abs(Math.round(backAnim[2]) - 2);
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
		if (hasArtifact(202) && game.floor == 10) {
			if (!extraAnim.length) {
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
				} else if (extraAnim[index][2] % 2 === 0) {
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
		draw.lore(5, 188, game.deck.length, {"color": "#fff"});
		if (game.void.length) draw.image(I.extra.void, 381, 163);
		draw.image(I.extra.discard, 382, 182);
		draw.lore(396, 188, game.discard.length, {"color": "#fff", "text-align": DIR.LEFT});
		// big artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			if (!ARTIFACTS[game.artifacts[index]].big) continue;
			draw.image(I.artifact[game.artifacts[index]], (index * 18) - 6, 5);
			if (game.select[0] === S.ARTIFACTS && game.select[1] === index) draw.image(I.artifact._.wo[game.artifacts[index]], (index * 18) - 7, 4);
		};
		// small artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			if (ARTIFACTS[game.artifacts[index]].big) continue;
			draw.image(I.artifact[game.artifacts[index]], (index * 18) + 2, 13);
			if (game.select[0] === S.ARTIFACTS && game.select[1] === index) draw.image(I.artifact._.wo[game.artifacts[index]], (index * 18) + 1, 12);
		};
		// selected
		if (game.select[0] === S.LOOKER) draw.image(I.select.round, 342, 2);
		else if (game.select[0] === S.HELP) draw.image(I.select.round, 361, 2);
		else if (game.select[0] === S.OPTIONS) draw.image(get.area() == 1 ? I.select.options : I.select.options_yellow, 380, 2);
		else if (game.select[0] === S.END_TURN) draw.image(I.select.round, 2, 162);
		else if (game.select[0] === S.DECK && !game.select[1]) draw.image(I.select.deck, 3, 181);
		else if (game.select[0] === S.VOID && !game.select[1]) draw.image(I.select.round, 380, 162);
		else if (game.select[0] === S.DISCARD && !game.select[1]) draw.image(I.select.discard, 381, 181);
		// info
		draw.lore(1, 1, "Floor " + game.floor + " - " + game.gold + " gold", {"color": (get.area() == 1 ? "#000" : "#fff")});
		// intents
		if (!hidden() && !(game.select[0] === S.LOOKER || game.select[0] === S.HELP || game.select[0] === S.OPTIONS)) {
			for (let index = 0; index < game.enemies.length; index++) {
				draw.intent(index);
			};
		};
		// selected enemy
		if (game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) {
			draw.enemyIcons(game.select[1]);
			if (enemyPos[game.select[1]]?.length && isEnemyVisible(game.select[1])) {
				enemyAnim.drawEnemy(enemyPos[game.select[1]][0], enemyPos[game.select[1]][1], game.select[1]);
			};
			if (!game.enemies[game.select[1]].transition && game.select[1] == game.enemyNum) {
				enemyAnim.drawEnemyActing(enemyPos[game.select[1]][0], enemyPos[game.select[1]][1], game.select[1]);
			};
		};
	},
	/**
	 * Draws the player on the canvas.
	 */
	player() {
		let x = 15, y = 27;
		// aura blades
		for (let index = 0; index < game.eff[EFF.AURA_BLADE] && index < 4; index++) {
			draw.image(I.aura_blade, x + AURA_BLADE_POS[index][0], y + AURA_BLADE_POS[index][1] + 4 - Math.abs(Math.round(auraBladeAnim[index]) - 4));
			auraBladeAnim[index] += (Math.random() + 0.5) * 0.05;
			if (auraBladeAnim[index] >= 8) auraBladeAnim[index] -= 8;
		};
		// icons
		for (const key in game.eff) {
			if (game.eff[key]) {
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
			if (enemyPos[index]?.length && isEnemyVisible(index) && ((game.select[0] !== S.ATTACK && game.select[0] !== S.ENEMY) || index != game.select[1])) {
				enemyAnim.drawEnemy(enemyPos[index][0], enemyPos[index][1], index);
			};
		};
		// action animations
		if (game.enemies[game.enemyNum] && !game.enemies[game.enemyNum].transition && ((game.select[0] !== S.ATTACK && game.select[0] !== S.ENEMY) || game.enemyNum != game.select[1])) {
			enemyAnim.drawEnemyActing(enemyPos[game.enemyNum][0], enemyPos[game.enemyNum][1], game.enemyNum);
		};
		// move idle animations along
		enemyAnim.progressAnimations();
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
			infoLimit = limit(CHANGELOG);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - Changelog", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, CHANGELOG, {"color": "#fff"});
		} else if (game.select[1] == 2) {
			infoLimit = limit(GAMEPLAY);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - How To Play", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, GAMEPLAY, {"color": "#fff"});
		} else {
			infoLimit = limit(OVERVIEW);
			draw.lore(1, 1 - infoPos, "Dungeon of Souls - Overview", {"color": "#f44"});
			draw.lore(1, 23 - infoPos, OVERVIEW, {"color": "#fff"});
		};
		draw.lore(1, 12 - infoPos, 'Source can be found at "https://github.com/Yrahcaz7/Dungeon-of-Souls"', {"color": "#f44", "text-small": true});
		if (infoLimit > 0) {
			draw.lore(366, 40, "Scrollable", {"color": "#fff", "text-align": DIR.LEFT});
			draw.image(I.extra.arrows, 367, 36);
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
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAME[options[index]] + ": " + (option ? "ON" : "OFF") + "</#ff0>\n";
				else text += OPTION_NAME[options[index]] + ": " + (option ? "ON" : "OFF") + "\n";
			} else if (typeof option == "number") {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAME[options[index]] + ": " + option + "x</#ff0>\n";
				else text += OPTION_NAME[options[index]] + ": " + option + "x\n";
			} else {
				if (game.select[1] - 2 === index && focused) text += "<#ff0>" + OPTION_NAME[options[index]] + ": " + option + "</#ff0>\n";
				else text += OPTION_NAME[options[index]] + ": " + option + "\n";
			};
		};
		if (game.select[1] - 2 === options.length && focused) text += "\n<#ff0>SURRENDER</#ff0>";
		else text += "\nSURRENDER";
		draw.rect("#000c");
		draw.topBar("Options", 378);
		draw.lore(200 - 2, 15, text.trim().replace(/_/g, " "), {"color": "#fff", "text-align": DIR.CENTER});
		draw.image(I.extra.options, 380, 2);
		if (game.select[1] === 1 && focused) draw.image(get.area() === 1 ? I.select.options : I.select.options_yellow, 380, 2);
	},
	/**
	 * Draws the current deck being viewed on the canvas.
	 * @param {boolean} focused - whether the deck layer is focused. Defaults to `true`.
	 */
	deck(focused = true) {
		// draw background
		draw.rect("#000c");
		// setup refinable deck
		if ((game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) && !refinableDeck.length) {
			refinableDeck = game.cards.filter(card => card.level === 0);
			if (!refinableDeck.length) refinableDeck = [new Card()];
		};
		// setup for deck drawing
		const deck = currentDeck();
		const len = deck.length;
		const refining = (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE);
		const cols = (refining ? 3 : 6);
		const scrollPadding = (refining ? 14 : 11);
		const startX = (refining ? 3 : 2);
		const startY = (refining ? 15 : 14);
		const spaceX = (refining ? 68 : 66);
		const spaceY = (refining ? 100 : 98);
		// draw right bar
		if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) {
			draw.rect("#fff", 207, 14, 1, 185);
			let cardObj = deck[game.cardSelect];
			draw.lore(213, 18, "Press B to go back to the reward selection screen.\n\nPress space or enter to refine the selected card.\n\nA preview of the refined card is shown below.", {"color": "#fff", "text-small": true});
			draw.card(cardObj, 213, 51, true, true);
			draw.card(new Card(cardObj.id, 1), 329, 51, true, true);
			draw.image(I.card.refine, 305 - I.card.refine.width / 2, 95);
		};
		// draw deck
		if (len > 0) {
			if (game.cardSelect > len - 1) game.cardSelect = len - 1;
			let maxScroll = Math.max(spaceY * (Math.floor((len - 1) / cols) - 1) + scrollPadding, 0);
			if (game.deckScroll > maxScroll) game.deckScroll = maxScroll;
			let selected = [game.cardSelect % cols, Math.floor(game.cardSelect / cols)];
			for (let x = (len - 1) % cols, y = Math.floor((len - 1) / cols); y >= 0; x--) {
				if (x !== selected[0] || y !== selected[1] || !focused) {
					draw.card(deck[x + (y * cols)], startX + (x * spaceX), startY + (y * spaceY) - game.deckScroll, false, inOutsideDeck());
				};
				if (x === 0) {
					x = cols;
					y--;
				};
			};
			if (focused) {
				draw.card(deck[game.cardSelect], startX + (selected[0] * spaceX), startY + (selected[1] * spaceY) - game.deckScroll, true, inOutsideDeck());
				graphics.target();
				if (game.deckScroll >= spaceY * selected[1]) {
					game.deckScroll -= Math.min(10, Math.abs(game.deckScroll - (spaceY * selected[1])));
				} else if (game.deckScroll <= (spaceY * (selected[1] - 1)) + scrollPadding) {
					game.deckScroll += Math.min(10, Math.abs(game.deckScroll - ((spaceY * (selected[1] - 1)) + scrollPadding)));
				};
			};
		};
		// draw top bar
		if (menuSelect[0] === MENU.PREV_GAME_INFO) draw.topBar("Cards From Run #" + global.prevGames[sortedPrevGames[Math.floor(menuSelect[1] / 3)]].num);
		else if (game.select[0] === S.DECK) draw.topBar("Deck");
		else if (game.select[0] === S.DISCARD) draw.topBar("Discard");
		else if (game.select[0] === S.VOID) draw.topBar("Void");
		else if (game.select[0] === S.CARDS) draw.topBar("Cards");
		else if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY) draw.topBar("Purifier: Pick a Card to Destroy");
		else if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) draw.topBar("Refiner: Pick a Card to Improve");
	},
	/**
	 * Draws the player's hand on the canvas.
	 */
	hand() {
		if (game.select[0] === S.ATTACK) {
			draw.card(game.enemyAtt[2], 50, 22, true);
			return;
		} else if (game.select[0] === S.PLAYER || game.select[0] === S.ENEMY) {
			return;
		};
		updateAnimatedHandData();
		let temp = -1;
		for (let index = 0; index < handAnimCards.length && index < handAnimPositions.length; index++) {
			const effIndex = index - (handAnimOffsets[index] || 0);
			if (effIndex >= 0 && !cardAnim[effIndex]) cardAnim[effIndex] = 0;
			if (((game.select[0] === S.HAND && game.select[1] == effIndex) || (effIndex == game.prevCard && global.options[OPTION.STICKY_CARDS])) && handAnimPositions[index][1] === undefined) {
				temp = index;
			} else {
				if (handAnimPositions[index][1] === undefined) {
					if (cardAnim[effIndex] > 0) cardAnim[effIndex] -= 6 + Math.random();
					if (cardAnim[effIndex] < 0) cardAnim[effIndex] = 0;
				};
				draw.card(handAnimCards[index], handAnimPositions[index][0], handAnimPositions[index][1] ?? (146 - Math.floor(cardAnim[effIndex])));
			};
		};
		if (temp !== -1) {
			const offTemp = temp - (handAnimOffsets[temp] || 0);
			if (cardAnim[offTemp] < 44) cardAnim[offTemp] += 7 + Math.random();
			if (cardAnim[offTemp] > 44) cardAnim[offTemp] = 44;
			draw.card(handAnimCards[temp], handAnimPositions[temp][0], handAnimPositions[temp][1] ?? (146 - Math.floor(cardAnim[offTemp])), true);
		};
		if (notif[0] !== -1) {
			const anim = cardAnim[notif[0] - (handAnimOffsets[notif[0]] || 0)];
			draw.lore(handAnimPositions[notif[0]][0] + 32, 146 - 9 - Math.ceil(anim) - notif[1] + notif[3], notif[2], {
				"color": "#ff" + ["4444", "cccc"][get.area()] + Math.min(16 - notif[1], 15).toString(16) + "f",
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
		if (handSelectPos.length === 0) {
			handSelectPos = get.handPos(game.hand.length - 1);
		};
		draw.rect("#000c");
		draw.image(I.extra.end, 3, 58);
		draw.image(I.extra.end, 381, 58);
		if (game.select[1] === -1) draw.image(I.select.round, 2, 57);
		else if (game.select[1] === game.hand.length - 1) draw.image(I.select.round, 380, 57);
		for (let index = 0; index < game.hand.length - 1; index++) {
			if (index === game.select[1]) continue;
			draw.card(game.hand[index >= game.enemyAtt[0] ? index + 1 : index], handSelectPos[index], 17);
		};
		if (game.select[1] >= 0 && game.select[1] < game.hand.length - 1) {
			draw.card(game.hand[game.select[1] >= game.enemyAtt[0] ? game.select[1] + 1 : game.select[1]], handSelectPos[game.select[1]], 17, true);
		};
		draw.topBar("Select a Card");
	},
	/**
	 * Draws the info of a card on the canvas.
	 * @param {"card" | "cardSelect" | "reward" | "deck"} type - the type of the card's selection.
	 * @param {Card} cardObj - the card object.
	 */
	cardInfo(type, cardObj) {
		const keywords = CARDS[cardObj.id]?.keywords || [];
		const appliedKeywords = [];
		let x = 0, y = 0;
		for (const key in cardObj.eff) {
			const keyword = +key;
			if (EFF_DESC[keyword]) {
				if (EFF_NAME[keyword]) y += info[type]("This has " + cardObj.eff[keyword] + " <#666>" + EFF_NAME[keyword] + "</#666>.", x, y);
				y += info[type](keyword, x, y);
				appliedKeywords.push(keyword);
			};
		};
		for (let index = 0; index < keywords.length; index++) {
			if (appliedKeywords.includes(keywords[index])) continue;
			y += info[type](keywords[index], x, y);
			if (keywords[index] === EFF.BLAZE && !keywords.includes(EFF.BURN)) y += info[type](EFF.BURN, x, y);
		};
	},
	/**
	 * Draws the selector and the info it targets on the canvas.
	 */
	target() {
		if (inDeck()) {
			const cardObj = currentDeck()[game.cardSelect];
			if (cardObj) graphics.cardInfo("deck", cardObj);
		} else if (game.select[0] === S.ATTACK || game.select[0] === S.ENEMY) {
			const enemy = game.enemies[game.select[1]];
			const type = enemy.type;
			const pos = enemyPos[game.select[1]];
			let coords = [];
			let name = ENEMY_NAME[type];
			if (type === SLIME.BIG || (type === SLIME.PRIME && enemyAnim.prime[game.select[1]] != -1 && enemyAnim.prime[game.select[1]] < 5)) {
				coords = [5, 26, 54, 38];
				name = ENEMY_NAME[SLIME.BIG];
			} else if (type === SLIME.SMALL) {
				coords = [19, 36, 26, 28];
			} else if (type === SLIME.PRIME) {
				coords = [0, 7, 64, 57];
			} else if (type === SLIME.STICKY) {
				coords = [-1, 36, 66, 36];
			} else if (type === FRAGMENT && (enemyAnim.prime[game.select[1]] == -1 || enemyAnim.prime[game.select[1]] > 18)) {
				coords = [7, 6, 50, 58];
			} else if (type === SENTRY.BIG) {
				coords = [5, 3, 54, 61];
			} else if (type === SENTRY.SMALL) {
				coords = [4, 34, 56, 30];
			} else if (type === SENTRY.PRIME) {
				coords = [9, 0, 46, 64];
			} else if (type === SENTRY.FLAMING) {
				coords = [7, 6, 50, 58];
			} else if (type === SINGULARITY) {
				coords = [8, 3, 48, 61];
			};
			if (coords) {
				if (pos[1] + coords[1] < 31) {
					coords[1] = 31 - pos[1];
					coords[3] -= 31 - pos[1];
				};
				const left = game.select[1] === 0 && game.enemies.length > 1;
				draw.selector(pos[0] + coords[0], pos[1] + coords[1], coords[2], coords[3]);
				draw.lore(pos[0] + 31, pos[1] + coords[1] - 7.5, name, {"color": "#fff", "text-align": DIR.CENTER, "text-small": true});
				if (game.select[1] !== game.enemyNum && !game.enemies[game.select[1]].eff[ENEMY_EFF.SHROUD]) {
					info.intent();
				};
				const exAtt = enemy.getExtraAttackPower();
				const exDef = enemy.getExtraDefendPower();
				if (left) draw.lore(pos[0] + coords[0] - 2.5, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-align": DIR.LEFT, "text-small": true});
				else draw.lore(pos[0] + coords[0] + coords[2] + 3, pos[1] + coords[1] - 2, "ATK: " + enemy.attackPower + (exAtt ? "+" + exAtt : "") + "\nDEF: " + enemy.defendPower + (exDef ? "+" + exDef : ""), {"color": "#fff", "text-small": true});
				let x = coords[0] - 5.5;
				let y = coords[1] - 1;
				const logged = {};
				const logEff = type => {
					logged[type] = true;
					const height = Math.ceil((EFF_DESC[type].match(/\n/g) || []).length * 5.5 + (game.enemies[game.select[1]].eff[type] > 0 ? 22 : 11));
					if ((left ? y + 12 : y) + height >= 202 - pos[1]) {
						y = coords[1] - 1;
						x -= 77;
					};
					y += info.enemy(type, x, (left ? y + 12 : y));
					if ((type === EFF.BLAZE || type === EFF.FIREPROOF) && !logged[EFF.BURN]) logEff(EFF.BURN);
					else if (type === ENEMY_EFF.PLAN_ATTACK && !logged[EFF.ATKUP]) logEff(EFF.ATKUP);
					else if (type === ENEMY_EFF.PLAN_DEFEND && !logged[EFF.DEFUP]) logEff(EFF.DEFUP);
				};
				for (const key in game.enemies[game.select[1]].eff) {
					logEff(+key);
				};
			};
		} else if (game.select[0] === S.PLAYER) {
			const coords = [58, 69, 24, 39];
			draw.selector(coords[0], coords[1], coords[2], coords[3]);
			draw.lore(coords[0] + (coords[2] / 2) - 1, 61.5, CHARACTER_NAME[game.character][global.charStage[game.character]], {"color": "#fff", "text-align": DIR.CENTER, "text-small": true});
			let x = coords[0] + coords[2] - 80;
			let y = 0;
			const logged = {};
			const logEff = type => {
				logged[type] = true;
				let height = Math.ceil((EFF_DESC[type].match(/\n/g) || []).length * 5.5 + (game.eff[type] > 0 ? 22 : 11));
				if (y + height >= 202 - coords[1]) {
					y = 0;
					x += 77;
				};
				y += info.player(type, x, y);
				if ((type === EFF.BLAZE || type === EFF.FIREPROOF) && !logged[EFF.BURN]) logEff(EFF.BURN);
			};
			for (const key in game.eff) {
				logEff(+key);
			};
		} else if (game.select[0] === S.ARTIFACTS) {
			info.artifact(game.artifacts[game.select[1]]);
		} else if (game.select[0] === S.ARTIFACT_REWARD) {
			info.artifact(game.room[6][game.select[1]], 160 + (game.select[1] * 32), 109);
		} else if (game.select[0] === S.CARD_REWARD && game.select[1] > -1 && game.select[1] < get.cardRewardChoices()) {
			graphics.cardInfo("reward", new Card(game.room[5][game.select[1]]));
		} else if (game.select[0] === S.LOOKER) {
			info.menuItem(DIR.UP, 2, "View Background");
		} else if (game.select[0] === S.HELP) {
			info.menuItem(DIR.UP, 1, "View Manual");
		} else if (game.select[0] === S.OPTIONS && game.select[1] <= 1) {
			info.menuItem(DIR.UP, 0, "Configure Options");
		} else if (game.select[0] === S.END_TURN) {
			info.menuItem(DIR.LEFT, 1, "End Turn");
		} else if (game.select[0] === S.DECK) {
			info.menuItem(DIR.LEFT, 0, "View Deck");
		} else if (game.select[0] === S.VOID) {
			info.menuItem(DIR.RIGHT, 1, "View Void");
		} else if (game.select[0] === S.DISCARD) {
			info.menuItem(DIR.RIGHT, 0, "View Discard");
		} else if (game.select[0] === S.MAP) {
			info.menuItem(S.MAP, game.select[1]);
		};
		if ((game.select[0] === S.HAND || (game.select[0] !== S.ATTACK && game.select[0] !== S.ENEMY && !hidden() && global.options[OPTION.STICKY_CARDS])) && game.hand.length && game.prevCard < game.hand.length) {
			graphics.cardInfo("card", game.hand[game.prevCard]);
		} else if (game.select[0] === SS.SELECT_HAND) {
			if (game.select[1] >= 0 && game.select[1] < game.hand.length - 1) {
				graphics.cardInfo("cardSelect", game.hand[game.select[1] >= game.enemyAtt[0] ? game.select[1] + 1 : game.select[1]]);
			} else {
				info.menuItem(DIR.CENTER, (game.select[1] >= 0 ? 1 : 0), "Cancel");
			};
		};
	},
	/**
	 * Draws the popups on the canvas.
	 */
	popups() {
		for (let index = 0; index < popups.length && index <= 6; index++) {
			if (!popups[index].length) continue;
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
		const type = (game.location[0] === -1 ? ROOM.BATTLE : game.map[game.location[0]][game.location[1]][0]);
		if (type === ROOM.BATTLE) draw.lore(200 - 2, 21, "Battle Loot!", {"text-align": DIR.CENTER});
		else if (type === ROOM.TREASURE) draw.lore(200 - 2, 21, "Treasure!", {"text-align": DIR.CENTER});
		else if (type === ROOM.ORB) draw.lore(200 - 2, 21, "Healing!", {"text-align": DIR.CENTER});
		else draw.lore(200 - 2, 21, "Rewards!", {"text-align": DIR.CENTER});
		for (let index = 0; index < game.rewards.length; index++) {
			const arr = game.rewards[index];
			draw.image(I.reward.item, 149, 33 + (index * 20));
			if (game.select[1] === index && focused) draw.image(I.select.item_border, 148, 32 + (index * 20));
			if (arr[2]) draw.image(I.select.item_green, 149, 33 + (index * 20));
			else if (game.select[1] == index && focused) draw.image(I.select.item, 149, 33 + (index * 20));
			if (arr[0] === REWARD.FINISH) draw.image(I.reward.back, 149, 33 + (index * 20));
			draw.lore(166, 37 + (index * 20), (arr[0] === REWARD.FINISH ? "" : (arr[1] ?? "1") + " ") + REWARD_NAME[arr[0]]);
		};
	},
	/**
	 * Draws the card reward choosing box on the canvas.
	 * @param {boolean} focused - whether the card reward layer is focused. Defaults to `true`.
	 */
	cardRewards(focused = true) {
		const choices = get.cardRewardChoices();
		const x = 198 - (choices * 68 / 2);
		const y = 20;
		const width = (choices * 68) + 4;
		const height = 160;
		draw.box(x, y, width, height, {"background-color": "#aaa"});
		if (choices === 1) draw.lore(200 - 2, y + 1, "Take the\ncard?", {"text-align": DIR.CENTER});
		else draw.lore(200 - 2, y + 1, "Pick a card:", {"text-align": DIR.CENTER});
		handPos = [];
		for (let index = 0; index < choices; index++) {
			handPos.push((199 - (choices * 68 / 2)) + 1 + (index * 68));
			if (index !== game.select[1] || !focused) draw.card(game.room[5][index], handPos[index], 50, false, true);
		};
		if (game.select[1] >= 0 && focused) draw.card(game.room[5][game.select[1]], handPos[game.select[1]], 50, true, true);
		if (game.select[1] < 0 && focused) draw.rect("#fff", x, y + height - 14, width, 14);
		draw.box(x + 2, y + height - 12, width - 4, 10);
		draw.lore(x + 3, y + height - 11, "Go back");
	},
	/**
	 * Draws the artifact reward choosing box on the canvas.
	 * @param {boolean} focused - whether the artifact reward layer is focused. Defaults to `true`.
	 */
	artifactRewards(focused = true) {
		graphics.rewards(false);
		const x = 140;
		const y = 70;
		const width = 120;
		const height = 60;
		draw.box(x, y, width, height, {"background-color": "#aaa"});
		draw.lore(200 - 2, y + 1, "Pick an artifact:", {"text-align": DIR.CENTER});
		for (let index = 0; index < 3; index++) {
			draw.image(I.artifact[game.room[6][index]], 160 + (index * 32), 90);
			if (index === game.select[1]) draw.image(I.artifact._.wo[game.room[6][index]], 159 + (index * 32), 89);
		};
		if (game.select[1] < 0 && focused) draw.rect("#fff", x, y + height - 14, width, 14);
		draw.box(x + 2, y + height - 12, width - 4, 10);
		draw.lore(x + 3, y + height - 11, "Go back");
	},
	/**
	 * Draws the map on the canvas.
	 * @param {boolean} focused - whether the map layer is focused. Defaults to `true`.
	 */
	map(focused = true) {
		// setup
		const availableLocations = get.availableLocations();
		const area = get.area(game.floor + (game.state === STATE.EVENT_FIN ? 1 : 0));
		// draw map
		draw.rect("#000");
		draw.image(I.map.top, 3, 12);
		draw.rect("#f0c060", 18, 19, 364, 174);
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
			if (game.floor % 10 === 0) {
				draw.image(I.map.select, 18 + (9 * 32), 12);
				draw.image(I.map.select, 12 + (10 * 32), 12);
			} else if (game.floor % 10 == 1) {
				draw.image(I.map.select_first, 13, 12);
			} else {
				draw.image(I.map.select, 13 + ((game.floor % 10 - 1) * 32), 12);
			};
		};
		draw.image(I.extra.deck, 22, 16);
		draw.lore(23, 22, game.cards.length, {"color": "#fff"});
		if (game.select[1] === availableLocations.length && focused) draw.image(I.select.deck, 21, 15);
		draw.image(I.extra.end, 22, 179);
		if (game.select[1] === -1 && focused) draw.image(I.select.round, 21, 178);
		draw.lore(1, 1, "Floor " + game.floor + " - " + game.gold + " gold", {"color": "#fff"});
		draw.lore(399, 1, "Seed: " + game.seed, {"color": "#fff", "text-align": DIR.LEFT});
		// draw scribbles
		for (let x = area * 10; x < (area + 1) * 10; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (typeof game.map[x][y] != "number") continue;
				draw.image(I.map.scribble_back, 25 + ((x - area * 10) * 32) + 8 - 4, 18 + (y * 32) + 8 - 3 - 2.5, 80 / 2, 80 / 2);
				draw.imageSector(I.map.scribbles, game.map[x][y] * 64, 0, 64, 70, 25 + ((x - area * 10) * 32) + 8, 18 + (y * 32) + 8 - 3, 64 / 2, 70 / 2);
			};
		};
		// draw paths
		ctx.filter = NO_ANTIALIASING_FILTER;
		for (let row1 = area * 10; row1 < (area + 1) * 10 && row1 < mapPathPoints.length; row1++) {
			for (const node1 in mapPathPoints[row1]) {
				for (const row2 in mapPathPoints[row1][node1]) {
					for (const node2 in mapPathPoints[row1][node1][row2]) {
						if (game.traveled[row1] == node1 && game.traveled[row2] == node2) continue;
						draw.polyline(mapPathPoints[row1][node1][row2][node2], "#b84", 3);
					};
				};
			};
		};
		// draw traveled path
		for (let index = area * 10; index < (area + 1) * 10 && index < game.traveled.length; index++) {
			draw.polyline(mapPathPoints[Math.max(index - 1, area * 10)][game.traveled[Math.max(index - 1, area * 10)]][index][game.traveled[index]], "#842", 3);
		};
		ctx.filter = "none";
		// draw nodes
		const coordSel = availableLocations[game.select[1]] ? availableLocations[game.select[1]] : [];
		const coordOn = game.location ? game.location : [];
		for (let x = area * 10; x < (area + 1) * 10; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (!(game.map[x][y] instanceof Object)) continue;
				const type = +game.map[x][y][0];
				let drawX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (I.map.node[type] instanceof Image) {
					if (game.map[x][y][0] === ROOM.BOSS) {
						drawX += 10;
						drawY = 90;
					};
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node._.wo[type], drawX - 1, drawY - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node._.bo[type], drawX - 1, drawY - 1);
					};
					draw.image(I.map.node[type], drawX, drawY);
				} else {
					let num = -1;
					if (game.map[x][y][0] === ROOM.BATTLE) {
						if (game.map[x][y][3].length === 1) {
							num = (BIG_ENEMIES.includes(game.map[x][y][3][0]) ? 0 : 3);
						} else if (game.map[x][y][3].length === 2) {
							num = (BIG_ENEMIES.includes(game.map[x][y][3][0]) ? 2 : 1);
						};
					} else if (game.map[x][y][0] === ROOM.TREASURE) {
						num = (game.traveled[x] == y ? 1 : 0);
					};
					if (num >= 0) {
						if (focused) {
							if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node[type]._.wo[num], drawX - 1, drawY - 1);
							else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node[type]._.bo[num], drawX - 1, drawY - 1);
						};
						draw.image(I.map.node[type][num], drawX, drawY);
					};
				};
			};
		};
		// draw map edges
		draw.rect("#530", 16, 19, 2, 174);
		draw.rect("#530", 382, 19, 2, 174);
	},
	/**
	 * Draws the current event on the canvas.
	 */
	event() {
		draw.rect("#0006");
		graphics.foregrounds();
		const event = getCurrentEvent();
		if (!event[1]) return;
		draw.lore(200 - 2, 50, (event[1] instanceof Function ? event[1]() : event[1]), {"color": "#fff", "text-align": DIR.CENTER});
		for (let index = 2; index < event.length; index++) {
			const text = (event[index][0] instanceof Function ? event[index][0]() : event[index][0]);
			if (index == game.select[1] + 2) draw.lore(200 - 2, 100 + index * 20, "<#ff0>\> " + text + "  </#ff0>", {"color": "#fff", "text-align": DIR.CENTER});
			else draw.lore(200 - 2, 100 + index * 20, text, {"color": "#fff", "text-align": DIR.CENTER});
		};
	},
	/**
	 * Draws the game end layer on the canvas.
	 */
	gameEnd() {
		// draw background
		ctx.globalAlpha = game.select[1] / (game.select[0] === S.GAME_WON ? 50 : 64);
		if (game.select[1] < 50) game.select[1]++;
		draw.rect("#000");
		if (game.select[0] === S.GAME_WON) {
			draw.image(I.player.victorious, 168, 42 + Math.round(Math.abs(winAnim - 4) - 2), I.player.victorious.width * 2, I.player.victorious.height * 2);
			winAnim += Math.random() * 0.05 + 0.05;
			if (winAnim >= 8) winAnim -= 8;
			draw.rect("#0004");
		};
		// calculate header text
		let text = "";
		if (game.select[0] === S.GAME_WON) {
			text += "YOU BEAT THE GAME ";
			if (hasArtifact(202)) text += "<#fcf050>WITH DETERMINATION</#fcf050>";
			else if (game.difficulty) text += "ON <#f00>HARD MODE!</#f00>";
			else text += "ON EASY MODE!";
			text += "\n\nThank you for playing!\n\nMore content is coming soon!";
		} else {
			text += "GAME OVER\n\nDIFFICULTY: ";
			if (hasArtifact(202)) text += "<#0f0>EASY</#0f0> <#f00>+ HARD</#f00>";
			else if (game.difficulty) text += "HARD";
			else text += "EASY";
			text += "\n\nTOP FLOOR: " + game.floor;
		};
		// calculate score factors
		let factors = [];
		for (let index = 0; index < ENEMY_ORDER.length; index++) {
			const type = ENEMY_ORDER[index];
			const amt = game.kills[type];
			if (amt) {
				if (BOSS_ENEMIES.includes(+type)) factors.push(["Killed " + ENEMY_NAME[+type], ENEMY_WORTH[+type], amt]);
				else factors.push(["Killed " + amt + " " + (amt > 1 ? PLURAL_ENEMY_NAME : ENEMY_NAME)[+type], ENEMY_WORTH[+type], amt]);
			};
		};
		factors.push(["Saved " + game.gold + " gold", 1, Math.floor(game.gold / 5)]);
		if (game.select[0] === S.GAME_WON) factors.push(["Saved " + game.health + " health", 5, game.health]);
		// calculate text position and color
		let len = factors.length;
		if (game.difficulty) len += 2;
		const normalColor = (game.select[0] === S.GAME_WON ? "#0f0" : "#f00");
		const hardColor = (game.select[0] === S.GAME_WON ? "#f00" : "#0f0");
		// draw header and footer text
		draw.lore(200 - 2, 100 - (len + 17) * 2.75, text, {"color": normalColor, "text-align": DIR.CENTER});
		draw.lore(200 - 2, 100 + (len + 15) * 2.75, "PRESS ENTER TO END THE RUN", {"color": normalColor, "text-align": DIR.CENTER});
		// calculate score text
		text = "";
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][0] + ":\n";
		};
		if (game.difficulty) text += "\nBase score:\n\nTotal score:";
		else text += "\nTotal score:";
		draw.lore(120, 100 - (len - 7) * 2.75, text, {"color": normalColor, "text-small": true});
		text = "";
		let totalScore = 0;
		for (let index = 0; index < factors.length; index++) {
			text += factors[index][1] + "x" + factors[index][2] + " = ";
			let amt = factors[index][1] * factors[index][2];
			if (amt < 1000) text += " ".repeat(4 - ("" + amt).length);
			if (amt == 1) {
				text += "1 point \n";
				totalScore++;
			} else {
				text += amt + " points\n";
				totalScore += amt;
			};
		};
		if (game.difficulty) {
			text += "\n" + totalScore + " points";
			if (hasArtifact(202) && game.kills[FRAGMENT]) {
				text += "\n\n" + totalScore + "<#fcf050>x3</#fcf050>";
				totalScore *= 3;
			} else {
				text += "\n\n" + totalScore + "<" + hardColor + ">x2</" + hardColor + ">";
				totalScore *= 2;
			};
			text += " = " + totalScore + " points";
		} else {
			text += "\n" + totalScore + " points";
		};
		// draw score text
		draw.lore(280, 100 - (len - 7) * 2.75, text, {"color": normalColor, "text-align": DIR.LEFT, "text-small": true});
		if (totalScore > global.highScore && !game.cheat) {
			draw.lore(280, 100 + (len + 9) * 2.75, ": NEW HIGH SCORE!", {"color": normalColor, "text-small": true});
		};
		ctx.globalAlpha = 1;
	},
	/**
	 * Draws the main menu layer on the canvas.
	 * @param {boolean} focused - whether the main menu layer is focused. Defaults to `true`.
	 */
	menu(focused = true) {
		draw.imageSector(I.background.difficulty, 0, game.difficulty * 16, 64, 16, 168, 146);
		if (hasArtifact(202)) {
			if (game.floor == 10 && transition < 100) {
				ctx.globalAlpha = transition / 100;
			};
			draw.imageSector(I.background.difficulty, 0, 2 * 16, 64, 16, 168, 146);
			ctx.globalAlpha = 1;
		};
		if (game.select[0] !== S.WELCOME) {
			let text = "";
			for (let index = 0; index < MAIN_MENU_OPTIONS.length; index++) {
				if (index === menuSelect[1] && focused) {
					text += " <#ff0>\> " + MAIN_MENU_OPTIONS[index] + "</#ff0>\n";
				} else if ((index === 0 && game.map.length === 0) || (index === MAIN_MENU_OPTIONS.length - 1 && global.prevGames.length === 0)) {
					text += "   <#888>" + MAIN_MENU_OPTIONS[index] + "</#888>\n";
				} else {
					text += "   " + MAIN_MENU_OPTIONS[index] + "\n";
				};
			};
			draw.lore(1, 84, text, {"color": "#fff"});
		};
	},
	/**
	 * Draws the confirmation layer on the canvas.
	 * @param {boolean} focused - whether the confirmation layer is focused. Defaults to `true`.
	 */
	conf(focused = true) {
		let text = ["Are you sure?"];
		if (menuSelect[0] === MENU.START_NEW_RUN) text = ["Are you sure you want to start a new run?", "If you have an ongoing run, it will be lost forever."];
		else if (menuSelect[0] === MENU.CHANGE_DIFFICULTY) text = ["Are you sure you want to change the difficulty to " + (game.difficulty ? "easy" : "hard") + "?", "If you have an ongoing run, it will be reset."];
		else if (menuSelect[0] === MENU.CHANGE_SEED || menuSelect[0] === MENU.ENTER_SEED) text = ["Are you sure you want to change the seed?", "If you have an ongoing run, it will be reset.", "The new run will also not count towards your high score."];
		else if (menuSelect[0] === MENU.CONF_REMOVE_PREV_GAME) text = ["Are you sure you want to remove run #" + global.prevGames[sortedPrevGames[Math.floor(menuSelect[2][1] / 3)]].num + " from the list?", "This will permanently remove all of its information."];
		else if (game.select[0] === S.CONF_END_TURN) text = ["Are you sure you want to end your turn?"];
		else if (game.select[0] === S.CONF_EXIT) text = ["Are you sure you want to finish collecting rewards?", "There are still rewards left unclaimed."];
		else if (game.select[0] === S.CONF_SURRENDER) text = ["Are you sure you want to end your current run by surrendering?", "This choice cannot be undone."];
		else if (game.select[0] === S.CONF_HAND_ALIGN) text = ["Are you sure you want to align the hands of time?", "You will regret it. There is no going back."];
		else if (game.select[0] === S.CONF_PURIFY) text = ["Are you sure you want to destroy the card " + game.cards[game.cardSelect].getAttr("name") + "?", "If you have multiple, this will only destroy one copy of the card."];
		else if (game.select[0] === S.CONF_REFINE) text = ["Are you sure you want to improve the card " + refinableDeck[game.cardSelect].getAttr("name") + "?", "If you have multiple, this will only improve one copy of the card."];
		else if (game.select[0] === S.CONF_PEARL) text = ["As the dark cloud clears, you see a strange pearl resting on the ground.", "Will you pick it up? This will consume 1 energy."];
		let width = 39;
		for (let index = 0; index < text.length; index++) {
			const size = text[index].length * 3 + 2;
			if (size > width) width = size;
		};
		const height = Math.ceil(text.length * 5.5) + 15;
		const x = (400 - width) / 2;
		const y = (game.select[0] === S.CONF_REFINE ? 20 : (200 - height) / 2);
		draw.rect("#0008");
		draw.box(x, y, width, height);
		draw.lore(x + 1, y + 1, text.join("\n"), {"text-small": true});
		if (focused) {
			const select = (menuSelect[0] == -1 ? game.select[1] : menuSelect[1]);
			if (select === 0) {
				draw.rect("#fff", x, y + height - 14, 23, 14);
			} else if (select == 1) {
				if (game.select[0] === S.CONF_PURIFY) draw.rect("#fff", x + 22, y + height - 14, 53, 14);
				else if (game.select[0] === S.CONF_REFINE) draw.rect("#fff", x + 22, y + height - 14, 29, 14);
				else draw.rect("#fff", x + 22, y + height - 14, 17, 14);
			} else {
				if (game.select[0] === S.CONF_HAND_ALIGN) draw.rect("#fff", x + 38, y + height - 14, 29, 14);
				else if (game.select[0] === S.CONF_PURIFY) draw.rect("#fff", x + 74, y + height - 14, 29, 14);
			};
		};
		draw.box(x + 2, y + height - 12, 19, 10);
		draw.lore(x + 3, y + height - 11, "YES");
		if (game.select[0] === S.CONF_PURIFY) {
			draw.box(x + 24, y + height - 12, 49, 10);
			draw.lore(x + 25, y + height - 11, "RESELECT");
			draw.box(x + 76, y + height - 12, 25, 10);
			draw.lore(x + 77, y + height - 11, "BACK");
		} else if (game.select[0] === S.CONF_REFINE) {
			draw.box(x + 24, y + height - 12, 25, 10);
			draw.lore(x + 25, y + height - 11, "BACK");
			draw.card(refinableDeck[game.cardSelect], 100, 51, true, true);
			draw.card(new Card(refinableDeck[game.cardSelect].id, 1), 234, 51, true, true);
			draw.image(I.card.refine, 200 - I.card.refine.width / 2, 95);
		} else {
			draw.box(x + 24, y + height - 12, 13, 10);
			draw.lore(x + 25, y + height - 11, "NO");
		};
		if (game.select[0] === S.CONF_HAND_ALIGN) {
			draw.box(x + 40, y + height - 12, 25, 10);
			draw.lore(x + 41, y + height - 11, "BACK");
		};
	},
	/**
	 * Draws the seed input layer on the canvas.
	 * @param {boolean} focused - whether the seed input layer is focused. Defaults to `true`.
	 */
	seedInput(focused = true) {
		draw.rect("#0008");
		const x = 200 - 17 * 3 - 4, y = 100 - 20.5;
		draw.box(x, y, 17 * 6 + 5, 41);
		draw.lore(x + 1, y + 1, "Enter a seed:", {"text-small": true});
		draw.lore(x + 1, y + 19, "Only digits and A to F can be used.\nIf the seed is at least 1 character\nlong, you may press space or enter\nto start the custom run.", {"text-small": true});
		draw.box(x + 2, y + 7, 6 * 6 + 1, 10);
		draw.lore(x + 3, y + 8, newSeed);
		if (newSeed.length < 6 && Date.now() % 1000 < 500 && focused) draw.rect("#000", x + 3 + newSeed.length * 6, y + 8, 1, 8);
	},
	/**
	 * Draws the previous games layer on the canvas.
	 * @param {boolean} focused - whether the previous games layer is focused. Defaults to `true`.
	 */
	prevGames(focused = true) {
		// draw background
		draw.rect("#000c");
		// draw right bar
		draw.rect("#fff", 327, 14, 1, 185);
		draw.lore(333, 18, "Press B to go back\nto the main menu.\n\nPress space or enter\nto view the details\nof the selected\naspect of a run.\n\nPress C to change the\nsorting of the list.\n\nPress R to remove the\nselected run from the\nlist permanently.", {"color": "#fff", "text-small": true});
		const spaceY = 49;
		// initialize sorted previous games
		if (!sortedPrevGames.length) {
			for (let index = global.prevGames.length - 1; index >= 0; index--) {
				sortedPrevGames.push(index);
			};
		};
		// scrolling
		if (focused) {
			const scrollPadding = 11;
			const selected = Math.floor(menuSelect[1] / 3);
			if (menuScroll >= spaceY * selected) {
				menuScroll -= Math.min(10, Math.abs(menuScroll - (spaceY * selected)));
			} else if (menuScroll <= (spaceY * (selected - 3)) + scrollPadding) {
				menuScroll += Math.min(10, Math.abs(menuScroll - ((spaceY * (selected - 3)) + scrollPadding)));
			};
			const maxScroll = Math.max(spaceY * (global.prevGames.length - 4) + scrollPadding, 0);
			if (menuScroll > maxScroll) menuScroll = maxScroll;
			else if (menuScroll < 0) menuScroll = 0;
		};
		// draw previous games
		for (let index = 0; index < sortedPrevGames.length; index++) {
			// first row
			const prevGame = global.prevGames[sortedPrevGames[index]];
			let x = 5;
			let y = 18 + (index * spaceY) - menuScroll;
			draw.box(x - 2, y - 2, 321, 45, {"background-color": "#0004", "border-color": "#fff"});
			draw.lore(x, y, "<#000 highlight>Run #" + prevGame.num + "</#000>", {"color": "#000", "highlight-color": "#fff"});
			x += 6 * 10;
			if (prevGame.result === GAME_RESULT.DEFEAT) draw.lore(x, y, "Result: <#f00>Defeat</#f00>", {"color": "#fff"});
			else if (prevGame.result === GAME_RESULT.VICTORY) draw.lore(x, y, "Result: <#0f0>Victory</#0f0>", {"color": "#fff"});
			else draw.lore(x, y, "Result: <#f00>Surrender</#f00>", {"color": "#fff"});
			x += 6 * 18;
			if (prevGame.artifacts.includes(202)) draw.lore(x, y, "Difficulty: <#0f0>Easy</#0f0> <#f00>+ Hard</#f00>", {"color": "#fff"});
			else if (prevGame.difficulty) draw.lore(x, y, "Difficulty: <#f00>Hard</#f00>", {"color": "#fff"});
			else draw.lore(x, y, "Difficulty: <#0f0>Easy</#0f0>", {"color": "#fff"});
			// second row
			x = 5;
			y += 11;
			draw.lore(x, y, "Floor: " + prevGame.floor, {"color": "#fff"});
			x += 6 * 11;
			if (prevGame.result === GAME_RESULT.VICTORY) draw.lore(x, y, "Remaining health: <#0f0>" + prevGame.health + "</#0f0>", {"color": "#fff"});
			else if (prevGame.health > 0) draw.lore(x, y, "Remaining health: <#f00>" + prevGame.health + "</#f00>", {"color": "#fff"});
			else draw.lore(x, y, "Remaining health: 0", {"color": "#fff"});
			x += 6 * 22;
			if (prevGame.gold > 0) draw.lore(x, y, "Remaining gold: <#0f0>" + prevGame.gold + "</#0f0>", {"color": "#fff"});
			else draw.lore(x, y, "Remaining gold: 0", {"color": "#fff"});
			// third row
			x = 5;
			y += 11;
			if (prevGame.cheat) draw.lore(x, y, "Score: <#f00>" + prevGame.score + "</#f00>", {"color": "#fff"});
			else if (prevGame.newHighScore) draw.lore(x, y, "Score: <#0f0>" + prevGame.score + "</#0f0>", {"color": "#fff"});
			else draw.lore(x, y, "Score: " + prevGame.score, {"color": "#fff"});
			x += 6 * 14;
			draw.lore(x, y, "Seed: " + prevGame.seed, {"color": "#fff"});
			x += 6 * 14;
			if (prevGame.startVersion == prevGame.endVersion) {
				if (prevGame.endVersion == global.version) draw.lore(x, y, "Version: <#0f0>" + get.versionDisplay(prevGame.endVersion) + "</#0f0>", {"color": "#fff"});
				else draw.lore(x, y, "Version: " + get.versionDisplay(prevGame.endVersion), {"color": "#fff"});
			} else {
				if (prevGame.endVersion == global.version) draw.lore(x, y, "Version: " + get.versionDisplay(prevGame.startVersion) + " to <#0f0>" + get.versionDisplay(prevGame.endVersion) + "</#0f0>", {"color": "#fff"});
				else draw.lore(x, y, "Version: " + get.versionDisplay(prevGame.startVersion) + " to " + get.versionDisplay(prevGame.endVersion), {"color": "#fff"});
			};
			// fourth row (interactable row)
			x = 5;
			y += 11;
			if (index * 3 == menuSelect[1] && focused) draw.lore(x, y, "> Cards: " + prevGame.cards.length, {"color": "#ff0"});
			else draw.lore(x, y, "  Cards: " + prevGame.cards.length, {"color": "#fff"});
			x += 6 * 12;
			if (index * 3 + 1 == menuSelect[1] && focused) draw.lore(x, y, "> Artifacts: " + prevGame.artifacts.length, {"color": "#ff0"});
			else draw.lore(x, y, "  Artifacts: " + prevGame.artifacts.length, {"color": "#fff"});
			x += 6 * 16;
			let kills = 0;
			for (const key in prevGame.kills) {
				kills += prevGame.kills[key];
			};
			if (index * 3 + 2 == menuSelect[1] && focused) draw.lore(x, y, "> Enemies killed: " + kills, {"color": "#ff0"});
			else if (kills > 0) draw.lore(x, y, "  Enemies killed: <#0f0>" + kills + "</#0f0>", {"color": "#fff"});
			else draw.lore(x, y, "  Enemies killed: 0", {"color": "#fff"});
			// icons
			x = 323;
			if (prevGame.cheat) {
				x -= I.x.width;
				draw.image(I.x, x, y - 1);
			};
			x -= I.player.head.width;
			draw.image(I.player.head, x, y - 1);
		};
		// draw top bar
		draw.topBar("Previous Runs");
	},
	/**
	 * Draws the previous game artifact layer on the canvas.
	 * @param {boolean} focused - whether the previous game artifact layer is focused. Defaults to `true`.
	 */
	prevGameArtifacts(focused = true) {
		draw.rect("#000c");
		const prevGame = global.prevGames[sortedPrevGames[Math.floor(menuSelect[1] / 3)]];
		if (menuArtifactSelect > prevGame.artifacts.length - 1) menuArtifactSelect = prevGame.artifacts.length - 1;
		// big artifacts
		for (let index = 0; index < prevGame.artifacts.length; index++) {
			if (!ARTIFACTS[prevGame.artifacts[index]].big) continue;
			draw.image(I.artifact[prevGame.artifacts[index]], (index * 26) + 3, 16);
			if (index == menuArtifactSelect && focused) draw.image(I.artifact._.wo[prevGame.artifacts[index]], (index * 26) + 2, 15);
		};
		// small artifacts
		for (let index = 0; index < prevGame.artifacts.length; index++) {
			if (ARTIFACTS[prevGame.artifacts[index]].big) continue;
			draw.image(I.artifact[prevGame.artifacts[index]], (index * 26) + 11, 24);
			if (index == menuArtifactSelect && focused) draw.image(I.artifact._.wo[prevGame.artifacts[index]], (index * 26) + 10, 23);
		};
		info.artifact(prevGame.artifacts[menuArtifactSelect], menuArtifactSelect * 26 + 11, 43);
		draw.topBar("Artifacts From Run #" + prevGame.num);
	},
	/**
	 * Draws the previous game kills layer on the canvas.
	 */
	prevGameKills() {
		draw.rect("#000c");
		const prevGame = global.prevGames[sortedPrevGames[Math.floor(menuSelect[1] / 3)]];
		const spaceY = 76;
		let x = 3, y = 16;
		const categories = [SMALL_ENEMIES, BIG_ENEMIES, PRIME_ENEMIES, SPECIAL_ENEMIES, BOSS_ENEMIES];
		for (let category = 0; category < categories.length; category++) {
			const spaceX = (categories[category] === BOSS_ENEMIES ? 400 - x + 1 : (categories[category] === SPECIAL_ENEMIES ? 80 : 76));
			for (let index = 0; index < categories[category].length; index++) {
				const type = categories[category][index];
				if (!prevGame.kills[type]) continue;
				draw.box(x, y, spaceX - 4, spaceY - 4, {"background-color": "#0004", "border-color": "#fff"});
				draw.rect("#fff", x, y + 66, spaceX - 4, 6);
				let text = "Killed ";
				if (categories[category] === BOSS_ENEMIES) text += ENEMY_NAME[type];
				else text += prevGame.kills[type] + " " + (prevGame.kills[type] > 1 ? PLURAL_ENEMY_NAME : ENEMY_NAME)[type];
				draw.lore(x + (spaceX - 4) / 2 - 1, y + 67, text, {"text-align": DIR.CENTER, "text-small": true});
				const enemyIndex = category * categories[category].length + index;
				const posX = x + (spaceX - 4) / 2 - 32;
				if (menuEnemyAnim.enemies[enemyIndex] === SLIME.STICKY) {
					draw.image(I.bar.health_full, posX, y - 13 + 65);
					draw.lore(posX + 31, y - 13 + 67, "??", {"text-align": DIR.LEFT});
					draw.lore(posX + 34, y - 13 + 67, "??");
					menuEnemyAnim.drawEnemy(posX, y - 13, enemyIndex, true);
				} else {
					menuEnemyAnim.drawEnemy(posX, y + 1, enemyIndex, true);
				};
				y += spaceY;
			};
			y = 16;
			x += spaceX;
		};
		draw.topBar("Enemies Killed From Run #" + prevGame.num);
		menuEnemyAnim.progressAnimations();
	},
	/**
	 * Draws the previous game sort layer on the canvas.
	 * @param {boolean} focused - whether the previous game sort layer is focused. Defaults to `true`.
	 */
	prevGameSort(focused = true) {
		draw.rect("#000c");
		let text = "";
		if (menuSelect[1]) {
			if (!focused) text = "   Ascending order\n   Descending order";
			else if (prevGamesSort[1]) text = "   Ascending order\n<#ff0> \> Descending order</#ff0>";
			else text = "<#ff0> \> Ascending order</#ff0>\n   Descending order";
		} else {
			for (let index = 0; index < PREV_GAMES_SORT_NAMES.length; index++) {
				if (index == prevGamesSort[0] && focused) text += "<#ff0> \> " + PREV_GAMES_SORT_NAMES[index] + "</#ff0>\n";
				else text += "   " + PREV_GAMES_SORT_NAMES[index] + "\n";
			};
		};
		draw.lore(2, 15, text, {"color": "#fff"});
		draw.topBar(menuSelect[1] ? "Sort in..." : "Sort by...");
	},
};

const startAnim = {
	/**
	 * Starts a player animation.
	 * @param {HTMLImageElement} image - the image of the player animation.
	 */
	player(image) {
		if (!(image instanceof HTMLImageElement) || playerAnim[1] === I.player.death) return;
		if (game.attackEffects.includes(ATT_EFF.AURA_BLADE)) {
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
	 * Starts the action animation of the next enemy.
	 */
	enemy() {
		game.enemyNum++;
		game.enemyStage = ANIM.STARTING;
		enemyAnim.action = [0, ANIM.STARTING];
		enemyAnim.actionData = [];
	},
};
