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

let auraBladePos = [[65, 10], [80, 25], [42, 0], [28, 35]], enemyPos = [], handPos = [];

let enemyAnim = {
	enemies: () => game.enemies,
	idle: [0, 1.5, 3, 0.5, 2, 3.5],
	prime: [0, 0, 0, 0, 0, 0],
	sync: 0,
	action: [0, ANIM.STARTING],
	actionData: [],
};

let menuEnemyAnim = {
	enemies: [...SMALL_ENEMIES, ...BIG_ENEMIES, ...PRIME_ENEMIES, ...BOSS_ENEMIES],
	idle: [0, 1.5, 3, 0.5, 2, 3.5, 1, 2.5],
	prime: [0, 0, 0, 0, 0, 0, 0, 0],
	sync: 0,
};

let backAnim = [0, 1.5, 3, 0], intentAnim = [0, 1.5, 3, 0.5, 2, 3.5], cardAnim = [], effAnim = [0, null], playerAnim = [0, I.player.idle], extraAnim = [], transition = 0, screenShake = 0, auraBladeAnim = [0, 3, 6, 1];

let infoPos = 0, infoLimit = 0;

const NO_ANTIALIASING_FILTER = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#filter')`;

/**
 * Progresses the animations of the enemies.
 * @param {{idle: number[], prime: number[], sync: number}} animSource - the enemy animation object. Defaults to `enemyAnim`.
 */
function progressEnemyAnimations(animSource = enemyAnim) {
	let enemies = (typeof animSource.enemies == "function" ? animSource.enemies() : animSource.enemies);
	for (let index = 0; index < enemies.length; index++) {
		let enemy = enemies[index];
		if (!(enemy instanceof Object)) enemy = new Enemy(enemy, NaN);
		animSource.idle[index] += (Math.random() + 0.5) * 0.1;
		if (animSource.idle[index] >= 4) animSource.idle[index] -= 4;
		if (animSource.prime[index] != -1) {
			let limit = 0;
			if (enemy.type === SLIME.PRIME) {
				if (animSource.prime[index] >= 4) animSource.prime[index] += (Math.random() + 0.5) * 0.2;
				else animSource.prime[index] += (Math.random() + 0.5) * 0.1;
				limit = 12;
			} else if (enemy.type === FRAGMENT) {
				limit = 25;
				if (animSource.prime[index] >= 18) {
					animSource.prime[index] += 0.5;
					animSource.prime[index] = Math.round(animSource.prime[index] * 1e12) / 1e12;
				} else {
					animSource.prime[index]++;
				};
			} else if (enemy.type === SENTRY.PRIME) {
				limit = 9;
				if ((enemy.shield > 0) || (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD)) {
					animSource.prime[index] = -1;
				} else {
					animSource.prime[index] += (Math.random() + 0.5) * 0.2;
				};
			};
			if (animSource.prime[index] >= limit) {
				animSource.prime[index] = -1;
				animSource.idle[index] = 0;
			};
		};
	};
	animSource.sync++;
};

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
		ctx.drawImage(image, (x ?? 0) * scale, (y ?? 0) * scale, (width ?? image.width) * scale, (height ?? image.height) * scale);
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
		ctx.drawImage(image, sx, sy, sw, sh, (dx ?? 0) * scale, (dy ?? 0) * scale, (dw ?? sw) * scale, (dh ?? sh) * scale);
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
		ctx.fillRect((x ?? 0) * scale, (y ?? 0) * scale, (width ?? canvas.width / scale) * scale, (height ?? canvas.height / scale) * scale);
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
		ctx.lineWidth = (width ?? 1) * scale;
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
	 * @param {string} color - the color of the curved line. Defaults to `#000`.
	 * @param {number} width - the width of the curved line. Defaults to `1`.
	 */
	curvedLine(x1, y1, x2, y2, x3, y3, color = "#000", width = 1) {
		ctx.beginPath();
		ctx.strokeStyle = color ?? "#000";
		ctx.lineWidth = (width ?? 1) * scale;
		ctx.moveTo(x1 * scale, y1 * scale);
		ctx.quadraticCurveTo(x2 * scale, y2 * scale, x3 * scale, y3 * scale);
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
		ctx.lineWidth = (width ?? 1) * scale;
		for (let index = 0; index < points.length; index++) {
			ctx.lineTo(points[index][0] * scale, points[index][1] * scale);
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
		ctx.lineWidth = style["border-width"] * scale;
		for (let index = 0; index < points.length; index++) {
			ctx.lineTo(points[index][0] * scale, points[index][1] * scale);
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
		let coords = [(x + 30) * scale, (y + 30) * scale];
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
		style = Object.assign({"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false}, style);
		let color = style["color"], highlight = "", position = style["text-align"], small = style["text-small"];
		str = ("" + str).replace(/<br>/g, "\n");
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
		style = Object.assign({"background-color": "#ccc", "border-width": 1, "border-color": "#000"}, style);
		if (style["background-color"]) draw.rect(style["background-color"], x, y, width, height);
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
		if (rarity >= 0 && I.card[RARITY[rarity]]) img = I.card[RARITY[rarity]][card.id];
		// card back
		if (card.id !== 0) draw.image(I.card.back, x + 2, y + 2);
		// card outline
		const type = CARD_TYPE[Math.floor(card.id / 1000)];
		if (I.card.outline[type]) draw.image(I.card.outline[type], x + 3, y + 3);
		// card selector
		if (selected) {
			if (CARDS[card.id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
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
		const name = card.getAttr("name");
		if (CARDS[card.id].name.length >= 10) draw.lore(x + 33, y + 44, name, {"text-align": DIR.CENTER, "text-small": true});
		else draw.lore(x + 32, y + 42, name, {"text-align": DIR.CENTER});
		// card description
		let desc = card.getAttr("desc"), exDamage = get.extraDamage(), mulDamage = get.dealDamageMult(), valueIsLess = false;
		if (CARDS[card.id].attackEffects !== false && !outside) {
			if (CARDS[card.id].keywords.includes(CARD_EFF.UNIFORM)) exDamage = Math.floor(exDamage * 0.5);
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
		if (!CARDS[card.id].keywords.includes(CARD_EFF.UNPLAYABLE)) {
			let originalCost = card.getAttr("cost");
			if (outside) {
				draw.image(I.card.energy, x, y);
				draw.lore(x + 4, y + 2, originalCost);
			} else {
				let cost = getCardCost(card);
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
		style = Object.assign({"color": "#000", "highlight-color": "#222", "text-align": DIR.RIGHT, "text-small": false, "background-color": "#ccc", "border-width": 1, "border-color": "#000"}, style);
		let lines = (("" + str).match(/\n/g) || []).length, height = style["text-small"] ? 7 : 12;
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
	/**
	 * Draws an enemy on the canvas.
	 * @param {Enemy | number} enemy - the enemy object or enemy type.
	 * @param {number} x - the x-coordinate to draw the enemy at.
	 * @param {number} y - the y-coordinate to draw the enemy at.
	 * @param {number} index - the index of the enemy.
	 * @param {{idle: number[], prime: number[], sync: number}} animSource - the enemy animation object. Defaults to `enemyAnim`.
	 * @param {boolean} noPrimeAnim - whether to skip the prime animation. Defaults to `false`.
	 */
	enemy(enemy, x, y, index, animSource = enemyAnim, noPrimeAnim = false) {
		if (!(enemy instanceof Object)) enemy = new Enemy(enemy, NaN);
		if (enemy.type === SLIME.BIG) {
			if (enemy.shield > 0) draw.imageSector(I.enemy.slime.big_defend, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
			else draw.imageSector(I.enemy.slime.big, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
		} else if (enemy.type === SLIME.SMALL) {
			if (enemy.shield > 0) draw.imageSector(I.enemy.slime.small_defend, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
			else draw.imageSector(I.enemy.slime.small, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
		} else if (enemy.type === SLIME.PRIME) {
			if (animSource.prime[index] == -1 || noPrimeAnim) {
				if (enemy.shield > 0) draw.imageSector(I.enemy.slime.prime_defend, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y + 1);
				else draw.imageSector(I.enemy.slime.prime, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y + 1);
			} else {
				if (enemy.shield > 0) draw.imageSector(I.enemy.slime.to_prime_defend, Math.floor(animSource.prime[index]) * 64, 0, 64, 64, x, y + 1);
				else draw.imageSector(I.enemy.slime.to_prime, Math.floor(animSource.prime[index]) * 64, 0, 64, 64, x, y + 1);
			};
		} else if (enemy.type === FRAGMENT) {
			if (animSource.prime[index] == -1 || noPrimeAnim) {
				draw.imageSector(I.enemy.fragment.idle, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y + 1);
				if (index !== game.enemyNum || enemy.intent !== INTENT.ATTACK) {
					draw.clock(x + 2, y + 5, -1, 2 - Math.abs(Math.floor(animSource.idle[index]) - 2));
				};
			} else if (animSource.prime[index] >= 18) {
				draw.imageSector(I.enemy.fragment.open, Math.floor(animSource.prime[index] - 18) * 64, 0, 64, 64, x, y + 1);
				draw.clock(x + 2, y + 5, 6, 0, (animSource.prime[index] - 18) * 5);
			} else {
				x += (18 - animSource.prime[index]) * 8;
				draw.imageSector(I.enemy.fragment.roll, Math.floor(animSource.prime[index] % 4) * 64, 0, 64, 64, x, y + 1);
				draw.clock(x + 2, y + 5, (4 - Math.floor((animSource.prime[index] - 2) % 4)) * 3, (4 - Math.floor(animSource.prime[index] % 4)) * 15);
			};
		} else if (enemy.type === SENTRY.BIG) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.big_defend, Math.floor(animSource.idle[index] + 7) * 64, 0, 64, 64, x, y + 1);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.big_defend, Math.floor(7 - enemy.transition[0]) * 64, 0, 64, 64, x, y + 1);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 7) delete enemy.transition;
			} else {
				draw.imageSector(I.enemy.sentry.big, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y + 1);
			};
		} else if (enemy.type === SENTRY.SMALL) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.small_defend, Math.floor(animSource.idle[index] + 5) * 64, 0, 64, 64, x, y);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.small_defend, Math.floor(5 - enemy.transition[0]) * 64, 0, 64, 64, x, y);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 5) delete enemy.transition;
			} else {
				draw.imageSector(I.enemy.sentry.small, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
			};
		} else if (enemy.type === SENTRY.PRIME) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(animSource.idle[index] + 9) * 64, 0, 64, 64, x, y);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(9 - enemy.transition[0]) * 64, 0, 64, 64, x, y);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 9) delete enemy.transition;
			} else if (animSource.prime[index] == -1 || noPrimeAnim) {
				draw.imageSector(I.enemy.sentry.prime, Math.floor(animSource.idle[index]) * 64, 0, 64, 64, x, y);
			} else {
				draw.imageSector(I.enemy.sentry.to_prime, Math.floor(animSource.prime[index]) * 64, 0, 64, 64, x, y);
			};
		} else if (enemy.type === SINGULARITY) {
			if (Math.floor(animSource.idle[index]) == 1) y++;
			else if (Math.floor(animSource.idle[index]) == 3) y--;
			if (enemy.shield > 0) draw.image(I.enemy.singularity.defend, x, y);
			else draw.image(I.enemy.singularity.idle, x, y);
			draw.imageSector(I.enemy.singularity.orbs, Math.floor(animSource.sync % 24) * 64, 0, 64, 64, x, y);
			if (enemy.shield > 0 && index != game.enemyNum) draw.image(I.enemy.singularity.shield, x, y);
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
			const ref = CARDS[game.hand[game.prevCard].id];
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
		let x = handPos[game.select[1]] + xPlus;
		if (game.select[1] == get.cardRewardChoices() - 1 && get.cardRewardChoices() >= 4) {
			const ref = CARDS[game.room[5][game.select[1]]];
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
		let deck = currentDeck();
		if (!deck[game.cardSelect]) return 0;
		let refining = (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE);
		let cols = (refining ? 3 : 6);
		let selected = [game.cardSelect % cols, Math.floor(game.cardSelect / cols)];
		let x = (refining ? 72 : 71) + (selected[0] * (refining ? 68 : 66)) + xPlus;
		let y = (refining ? 16 : 15) + (selected[1] * (refining ? 100 : 98)) - game.deckScroll + yPlus;
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
		const obj = ARTIFACTS[type];
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
		if (hasArtifact(202) && game.floor == 10) {
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
		// big artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			if (!ARTIFACTS[game.artifacts[index]].big) continue;
			draw.image(I.artifact[game.artifacts[index]], (index * 18) - 6, 5);
			if (game.select[0] === S.ARTIFACTS && game.select[1] === index) draw.image(I.artifact.select[game.artifacts[index]], (index * 18) - 7, 4);
		};
		// small artifacts
		for (let index = 0; index < game.artifacts.length; index++) {
			if (ARTIFACTS[game.artifacts[index]].big) continue;
			draw.image(I.artifact[game.artifacts[index]], (index * 18) + 2, 13);
			if (game.select[0] === S.ARTIFACTS && game.select[1] === index) draw.image(I.artifact.select[game.artifacts[index]], (index * 18) + 1, 12);
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
		draw.lore(1, 1, "Floor " + game.floor + " - " + game.gold + " gold", {"color": (get.area() == 1 ? "#000" : "#f44")});
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
			if (enemyPos[index]?.length && isEnemyVisible(index)) {
				draw.enemy(game.enemies[index], enemyPos[index][0], enemyPos[index][1], index);
			};
		};
		// action animations
		if (game.enemies[game.enemyNum] && !game.enemies[game.enemyNum].transition) {
			let pos = enemyPos[game.enemyNum];
			const type = game.enemies[game.enemyNum].type;
			const intent = game.enemies[game.enemyNum].intent;
			if (intent === INTENT.ATTACK) {
				if (type === SLIME.BIG) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						pos[0] - (isDefending(playerAnim[1]) ? 78 : 64) + 16,
						pos[1] - (isDefending(playerAnim[1]) ? 1 : -1) + 43,
					];
					let phase = (enemyAnim.action[0] / 10),
						posX = Math.round(enemyAnim.actionData[0] * phase),
						posY = Math.round(enemyAnim.actionData[1] * phase);
					if (enemyAnim.action[1] === ANIM.ENDING) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else if (game.enemyStage === ANIM.MIDDLE) {
						draw.imageSector(I.enemy.slime.big_attack, 4 * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
						enemyAnim.action[1] = ANIM.ENDING;
						game.enemyStage = ANIM.PENDING;
					} else {
						draw.imageSector(I.enemy.slime.big_attack, (enemyAnim.action[0] % 4) * 7, 0, 7, 7, pos[0] + 16 - posX, pos[1] + 43 - posY);
						enemyAnim.action[0]++;
						game.enemyStage = ANIM.PENDING;
						if (enemyAnim.action[0] >= 11) {
							enemyAnim.action[0] = 11;
							game.enemyStage = ANIM.MIDDLE;
						};
					};
				} else if (type === SLIME.SMALL) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						pos[0] - (isDefending(playerAnim[1]) ? 81 : 62) - 64,
						pos[1] - (isDefending(playerAnim[1]) ? 61 : 57),
					];
					if (enemyAnim.action[0] >= 10) {
						let phase = ((enemyAnim.action[0] - 9) / 10),
							posX = Math.round(enemyAnim.actionData[0] * phase),
							posY = Math.round(enemyAnim.actionData[1] * phase);
						draw.imageSector(I.enemy.slime.small_attack, 9 * 128, 0, 128, 64, pos[0] - 64 - posX, pos[1] - posY, 128, 64);
					} else draw.imageSector(I.enemy.slime.small_attack, Math.floor(enemyAnim.action[0]) * 128, 0, 128, 64, pos[0] - 64, pos[1], 128, 64);
					if (enemyAnim.action[1] === ANIM.STARTING) enemyAnim.action[0]++;
					else if (enemyAnim.action[1] === ANIM.ENDING) enemyAnim.action[0]--;
					if (enemyAnim.action[0] >= 20) {
						enemyAnim.action[0] = 18;
						enemyAnim.action[1] = ANIM.ENDING;
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyAnim.action[0] < 0) {
						enemyAnim.action = [0, ANIM.STARTING];
						enemyAnim.idle[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SLIME.PRIME) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [pos[0] - (isDefending(playerAnim[1]) ? 90 : 71) - 40];
					if (enemyAnim.action[0] >= 4) {
						let phase = ((enemyAnim.action[0] - 4) / 15), posX = Math.round(enemyAnim.actionData[0] * phase);
						draw.imageSector(I.enemy.slime.prime_attack, 4 * 36, 0, 36, 18, pos[0] - 40 - posX, 80, 36, 18);
					} else {
						draw.imageSector(I.enemy.slime.prime_attack, Math.floor(enemyAnim.action[0]) * 36, 0, 36, 18, pos[0] - 40, 80, 36, 18);
					};
					enemyAnim.action[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else if (enemyAnim.action[0] >= 19) {
						enemyAnim.action[0] = 19;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === FRAGMENT && enemyAnim.prime[game.enemyNum] == -1) {
					draw.imageSector(I.enemy.fragment.attack, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					draw.clock(pos[0] + 2, pos[1] + 5, -1, (enemyAnim.action[0] >= 3 ? 0 : Math.floor(enemyAnim.action[0] + 1) * 15));
					if (enemyAnim.action[0] >= 4 && enemyAnim.action[0] < 6) draw.rect("#f00", 0, pos[1] + 5, pos[0], 60);
					enemyAnim.action[0]++;
					if (enemyAnim.action[0] >= 7) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyAnim.action[0] == 4) {
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.BIG) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.big_attack, Math.floor(enemyAnim.action[0]) * 92, 0, 92, 70, pos[0] - 14, pos[1] - 1);
					if (enemyAnim.action[0] >= 4) {
						const start = [pos[0] + 17, pos[1] + 16];
						const end = enemyAnim.actionData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyAnim.action[1] === ANIM.STARTING) enemyAnim.action[0]++;
					else if (enemyAnim.action[1] === ANIM.ENDING) enemyAnim.action[0]--;
					if (enemyAnim.action[0] >= 5) {
						enemyAnim.action[0] = 4;
						enemyAnim.action[1] = ANIM.ENDING;
					} else if (enemyAnim.action[0] == 3 && enemyAnim.action[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyAnim.action[0] < 0) {
						enemyAnim.action = [0, ANIM.STARTING];
						enemyAnim.idle[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.SMALL) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.small_attack, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					if (enemyAnim.action[0] >= 11) {
						const start = [pos[0] + 14, pos[1] + 30];
						const end = enemyAnim.actionData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyAnim.action[1] === ANIM.STARTING) enemyAnim.action[0]++;
					else if (enemyAnim.action[1] === ANIM.ENDING) enemyAnim.action[0]--;
					if (enemyAnim.action[0] >= 12) {
						enemyAnim.action[0] = 11;
						enemyAnim.action[1] = ANIM.ENDING;
					} else if (enemyAnim.action[0] == 10 && enemyAnim.action[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyAnim.action[0] < 0) {
						enemyAnim.action = [0, ANIM.STARTING];
						enemyAnim.idle[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.PRIME && enemyAnim.prime[game.enemyNum] == -1) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						(isDefending(playerAnim[1]) ? 92 : 72),
						(isDefending(playerAnim[1]) ? 87 : 82),
					];
					draw.imageSector(I.enemy.sentry.prime_attack, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 86, pos[0], pos[1] - 22);
					if (enemyAnim.action[0] >= 12) {
						let start = [pos[0] + 12, pos[1] + 29];
						const end = enemyAnim.actionData;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
						start[1] += 7;
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					};
					if (enemyAnim.action[1] === ANIM.STARTING) enemyAnim.action[0]++;
					else if (enemyAnim.action[1] === ANIM.ENDING) enemyAnim.action[0]--;
					if (enemyAnim.action[0] >= 13) {
						enemyAnim.action[0] = 12;
						enemyAnim.action[1] = ANIM.ENDING;
					} else if (enemyAnim.action[0] == 11 && enemyAnim.action[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyAnim.action[0] < 0) {
						enemyAnim.action = [0, ANIM.STARTING];
						enemyAnim.idle[game.enemyNum] = 0;
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SINGULARITY) {
					if (!enemyAnim.actionData.length) enemyAnim.actionData = [
						Math.floor(Math.random() * 4),
						(isDefending(playerAnim[1]) ? (isCrouching(playerAnim[1]) ? 0 : 1) : 2),
					];
					pos = [
						[133 + enemyAnim.actionData[0] * 17, 88],
						[155 + enemyAnim.actionData[0] * 17, 79],
						[142 + enemyAnim.actionData[0] * 17, 70],
					][enemyAnim.actionData[1]];
					draw.imageSector(I.enemy.singularity.attack, Math.floor(enemyAnim.action[0]) * 68 + (enemyAnim.actionData[0] % 2 + (enemyAnim.actionData[1] % 2 == 1 ? 2 : 0)) * 17, 0, 17, 55, pos[0], pos[1]);
					draw.imageSector(I.enemy.singularity.attack_overlay, Math.floor(enemyAnim.action[0]) * 34 + (enemyAnim.actionData[1] % 2 == 1 ? 17 : 0), 0, 17, 55, pos[0], pos[1]);
					if (enemyAnim.action[0] >= 8) {
						const start = [pos[0] + 7, pos[1] + 5];
						const end = [[94, 95], [92, 87], [72, 82]][enemyAnim.actionData[1]];
						draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 4);
					};
					if (enemyAnim.action[1] === ANIM.STARTING) enemyAnim.action[0]++;
					else if (enemyAnim.action[1] === ANIM.ENDING) enemyAnim.action[0]--;
					if (enemyAnim.action[0] >= 9) {
						enemyAnim.action[0] = 8;
						enemyAnim.action[1] = ANIM.ENDING;
					} else if (enemyAnim.action[0] == 7 && enemyAnim.action[1] === ANIM.ENDING) {
						game.enemyStage = ANIM.MIDDLE;
					} else if (enemyAnim.action[0] < 0) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
						enemyAnim.actionData = [];
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				};
			} else if (intent === INTENT.DEFEND) {
				if (type === SLIME.BIG || type === SLIME.SMALL || type === SLIME.PRIME || type === SINGULARITY) {
					if (type === SLIME.PRIME) {
						ctx.globalAlpha = enemyAnim.action[0] / 15;
						if (enemyAnim.prime[game.enemyNum] == -1) {
							draw.imageSector(I.enemy.slime.prime_defend, Math.floor(enemyAnim.idle[game.enemyNum]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						} else {
							draw.imageSector(I.enemy.slime.to_prime_defend, Math.floor(enemyAnim.prime[game.enemyNum]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
						};
					} else if (type === SINGULARITY) {
						let y = pos[1];
						if (Math.floor(enemyAnim.idle[game.enemyNum]) == 1) y++;
						else if (Math.floor(enemyAnim.idle[game.enemyNum]) == 3) y--;
						draw.image(I.enemy.singularity.idle, pos[0], y);
						ctx.globalAlpha = enemyAnim.action[0] / 15;
						draw.image(I.enemy.singularity.defend, pos[0], y);
						draw.imageSector(I.enemy.singularity.orbs, Math.floor(enemyAnim.sync % 24) * 64, 0, 64, 64, pos[0], y);
						draw.image(I.enemy.singularity.shield, pos[0], y);
					} else {
						ctx.globalAlpha = enemyAnim.action[0] / 15;
						let img = I.enemy.slime.big_defend;
						if (type === SLIME.SMALL) img = I.enemy.slime.small_defend;
						draw.imageSector(img, Math.floor(enemyAnim.idle[game.enemyNum]) * 64, 0, 64, 64, pos[0], pos[1]);
					};
					ctx.globalAlpha = 1;
					enemyAnim.action[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyAnim.action[0] >= 15) {
						enemyAnim.action[0] = 15;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.BIG) {
					draw.imageSector(I.enemy.sentry.big_defend, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 64, pos[0], pos[1] + 1);
					enemyAnim.action[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyAnim.action[0] >= 7) {
						enemyAnim.action[0] = 7;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.SMALL) {
					draw.imageSector(I.enemy.sentry.small_defend, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					enemyAnim.action[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyAnim.action[0] >= 5) {
						enemyAnim.action[0] = 5;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				} else if (type === SENTRY.PRIME && enemyAnim.prime[game.enemyNum] == -1) {
					draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(enemyAnim.action[0]) * 64, 0, 64, 64, pos[0], pos[1]);
					enemyAnim.action[0]++;
					if (game.enemyStage === ANIM.MIDDLE) {
						enemyAnim.action = [0, ANIM.STARTING];
						game.enemyStage = ANIM.ENDING;
					} else if (enemyAnim.action[0] >= 9) {
						enemyAnim.action[0] = 9;
						game.enemyStage = ANIM.MIDDLE;
					} else {
						game.enemyStage = ANIM.PENDING;
					};
				};
			};
		};
		// move idle animations along
		progressEnemyAnimations();
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
			draw.lore(366, 26, "Scrollable", {"color": "#fff", "text-align": DIR.LEFT});
			draw.image(I.extra.arrows, 367, 22);
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
		if (game.select[1] - 2 === options.length && focused) text += "\n<#ff0>RESTART RUN</#ff0>";
		else text += "\nRESTART RUN";
		draw.rect("#000c");
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Options", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 378, 1);
		draw.lore(200 - 2, 15, text.trim().replace(/_/g, " "), {"color": "#fff", "text-align": DIR.CENTER});
		draw.image(I.extra.options, 380, 2);
		if (game.select[1] && focused) draw.image(get.area() == 1 ? I.select.options : I.select.options_yellow, 380, 2);
	},
	/**
	 * Draws the current deck being viewed on the canvas.
	 * @param {boolean} focused - whether the deck layer is focused. Defaults to `true`.
	 */
	deck(focused = true) {
		draw.rect("#000c");
		if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) {
			if (refinableDeck.length == 0) {
				refinableDeck = game.cards.filter(card => card.level == 0);
				if (refinableDeck.length == 0) refinableDeck = [new Card()];
			};
			draw.rect("#fff", 207, 14, 1, 185);
		};
		const deck = currentDeck();
		const len = deck.length;
		const refining = (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE);
		const cols = (refining ? 3 : 6);
		const scrollPadding = (refining ? 14 : 11);
		const startX = (refining ? 3 : 2);
		const startY = (refining ? 15 : 14);
		const spaceX = (refining ? 68 : 66);
		const spaceY = (refining ? 100 : 98);
		if (len > 0) {
			if (game.cardSelect > len - 1) game.cardSelect = len - 1;
			let maxScroll = Math.max(spaceY * (Math.floor((len - 1) / cols) - 1) + scrollPadding, 0);
			if (game.deckScroll > maxScroll) game.deckScroll = maxScroll;
			let selected = [game.cardSelect % cols, Math.floor(game.cardSelect / cols)];
			for (let x = 0, y = 0; x + (y * cols) < len; x++) {
				if (x >= cols) {
					x = 0;
					y++;
				};
				if (x != selected[0] || y != selected[1] || !focused) {
					draw.card(deck[x + (y * cols)], startX + (x * spaceX), startY + (y * spaceY) - game.deckScroll, false, inOutsideDeck());
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
		draw.rect("#0004", 0, 0, 400, 13);
		if (menuSelect[0] === MENU.PREV_GAME_INFO) draw.lore(200 - 2, 1, "Cards From Game #" + (Math.floor(menuSelect[1] / 3) + 1), {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.DECK) draw.lore(200 - 2, 1, "Deck", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.DISCARD) draw.lore(200 - 2, 1, "Discard", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.VOID) draw.lore(200 - 2, 1, "Void", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.CARDS) draw.lore(200 - 2, 1, "Cards", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.PURIFIER || game.select[0] === S.CONF_PURIFY) draw.lore(200 - 2, 1, "Purifier: Pick a Card to Destroy", {"color": "#fff", "text-align": DIR.CENTER});
		else if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) draw.lore(200 - 2, 1, "Refiner: Pick a Card to Improve", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
		if (game.select[0] === S.REFINER || game.select[0] === S.CONF_REFINE) {
			let cardObj = deck[game.cardSelect];
			draw.lore(213, 18, "Press B to go back to the reward selection screen.\n\nPress space or enter to refine the selected card.\n\nA preview of the refined card is shown below.", {"color": "#fff", "text-small": true});
			draw.card(cardObj, 213, 51, true, true);
			draw.card(new Card(cardObj.id, 1), 329, 51, true, true);
			draw.image(I.card.refine, 305 - I.card.refine.width / 2, 95);
		};
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
		let temp = -1;
		for (let index = 0; index < game.hand.length; index++) {
			if (!cardAnim[index]) cardAnim[index] = 0;
			if ((game.select[0] === S.HAND && game.select[1] == index) || (index == game.prevCard && global.options[OPTION.STICKY_CARDS])) {
				temp = index;
			} else {
				if (cardAnim[index] > 0) cardAnim[index] -= 6 + Math.random();
				if (cardAnim[index] < 0) cardAnim[index] = 0;
				draw.card(game.hand[index], handPos[index], 146 - Math.floor(cardAnim[index]));
			};
		};
		if (temp != -1) {
			if (cardAnim[temp] < 44) cardAnim[temp] += 7 + Math.random();
			if (cardAnim[temp] > 44) cardAnim[temp] = 44;
			draw.card(game.hand[temp], handPos[temp], 146 - Math.floor(cardAnim[temp]), true);
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
		for (let index = 0; index < game.hand.length; index++) {
			if (index == game.select[1]) {
				continue;
			} else if (index == game.enemyAtt[0]) {
				ctx.globalAlpha = 0.75;
				draw.card(game.hand[index], handPos[index], 14);
				ctx.globalAlpha = 1;
			} else {
				draw.card(game.hand[index], handPos[index], 14);
			};
		};
		if (game.select[1] >= 0 && game.select[1] < game.hand.length) {
			draw.card(game.hand[game.select[1]], handPos[game.select[1]], 14, true);
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
		if (cardObj.eff[CARD_EFF.RETENTION]) {
			y += info[type]("This has " + cardObj.eff[CARD_EFF.RETENTION] + " <#666>retention</#666>.", x, y);
		};
		const keywords = CARDS[cardObj.id]?.keywords;
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
			if (type === SLIME.BIG || (type === SLIME.PRIME && enemyAnim.prime[game.select[1]] != -1 && enemyAnim.prime[game.select[1]] < 5)) {
				coords = [5, 26, 54, 38];
				name = ENEMY_NAME[SLIME.BIG];
			} else if (type === SLIME.SMALL) {
				coords = [19, 36, 26, 28];
			} else if (type === SLIME.PRIME) {
				coords = [0, 7, 64, 57];
			} else if (type === FRAGMENT && (enemyAnim.prime[game.select[1]] == -1 || enemyAnim.prime[game.select[1]] > 18)) {
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
		} else if (game.select[0] === S.CARD_REWARD && game.select[1] > -1 && game.select[1] < get.cardRewardChoices()) {
			graphics.cardInfo("reward", new Card(game.room[5][game.select[1]]));
		} else if (inDeck()) {
			let cardObj = currentDeck()[game.cardSelect];
			if (cardObj) graphics.cardInfo("deck", cardObj);
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
		const type = (game.location == -1 ? ROOM.BATTLE : game.map[game.location[0]][game.location[1]][0]);
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
			draw.card(game.room[5][index], handPos[index], 50, false, true);
		};
		if (game.select[1] > -1 && game.select[1] < choices && focused) {
			draw.card(game.room[5][game.select[1]], handPos[game.select[1]], 50, true, true);
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
	 * Draws the map on the canvas.
	 * @param {boolean} focused - whether the map layer is focused. Defaults to `true`.
	 */
	map(focused = true) {
		// setup
		let availableLocations = getAvailibleLocations();
		let area = get.area(game.floor + (game.state === STATE.EVENT_FIN ? 1 : 0));
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
		if (game.select[1] == availableLocations.length && focused) draw.image(I.select.deck, 21, 15);
		draw.image(I.extra.end, 22, 179);
		if (game.select[1] == -1 && focused) draw.image(I.select.round, 21, 178);
		draw.lore(1, 1, "Floor " + game.floor + " - " + game.gold + " gold", {"color": "#f44"});
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
				if (mapPathPoints[row1].hasOwnProperty(node1)) {
					for (const row2 in mapPathPoints[row1][node1]) {
						if (mapPathPoints[row1][node1].hasOwnProperty(row2)) {
							for (const node2 in mapPathPoints[row1][node1][row2]) {
								if (mapPathPoints[row1][node1][row2].hasOwnProperty(node2)) {
									if (game.traveled[row1] == node1 && game.traveled[row2] == node2) continue;
									draw.polyline(mapPathPoints[row1][node1][row2][node2], "#b84", 3);
								};
							};
						};
					};
				};
			};
		};
		// draw traveled path
		for (let index = 0; index < game.traveled.length; index++) {
			draw.polyline(mapPathPoints[Math.max(index - 1, 0)][game.traveled[Math.max(index - 1, 0)]][index][game.traveled[index]], "#842", 3);
		};
		ctx.filter = "none";
		// draw nodes
		const coordSel = availableLocations[game.select[1]] ? availableLocations[game.select[1]] : [];
		const coordOn = game.location ? game.location : [];
		for (let x = area * 10; x < (area + 1) * 10; x++) {
			for (let y = 0; y < game.map[x].length; y++) {
				if (typeof game.map[x][y] != "object") continue;
				let drawX = 25 + ((x - area * 10) * 32) + game.map[x][y][1];
				let drawY = 18 + (y * 32) + game.map[x][y][2];
				if (game.map[x][y][0] === ROOM.BATTLE) {
					draw.image(I.map.node.battle, drawX, drawY);
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.battle, drawX - 1, drawY - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.battle, drawX - 1, drawY - 1);
					};
				} else if (game.map[x][y][0] === ROOM.PRIME) {
					draw.image(I.map.node.death_zone, drawX, drawY);
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.death_zone, drawX - 1, drawY - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.death_zone, drawX - 1, drawY - 1);
					};
				} else if (game.map[x][y][0] === ROOM.TREASURE) {
					if (game.map[x][y][3]) {
						draw.image(I.map.node.treasure_open, drawX, drawY);
						if (focused) {
							if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.treasure_open, drawX - 1, drawY - 1);
							else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.treasure_open, drawX - 1, drawY - 1);
						};
					} else {
						draw.image(I.map.node.treasure, drawX, drawY);
						if (focused) {
							if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.treasure, drawX - 1, drawY - 1);
							else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.treasure, drawX - 1, drawY - 1);
						};
					};
				} else if (game.map[x][y][0] === ROOM.ORB) {
					draw.image(I.map.node.orb, drawX, drawY);
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.orb, drawX - 1, drawY - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.orb, drawX - 1, drawY - 1);
					};
				} else if (game.map[x][y][0] === ROOM.BOSS) {
					drawX += 10;
					draw.image(I.map.node.boss, drawX, 90);
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.boss, drawX - 1, 90 - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.boss, drawX - 1, 90 - 1);
					};
				} else if (game.map[x][y][0] === ROOM.EVENT) {
					draw.image(I.map.node.event, drawX, drawY);
					if (focused) {
						if (x == coordSel[0] && y == coordSel[1]) draw.image(I.map.node.select.event, drawX - 1, drawY - 1);
						else if (x == coordOn[0] && y == coordOn[1]) draw.image(I.map.node.select_blue.event, drawX - 1, drawY - 1);
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
		draw.lore(200 - 2, 50, (typeof event[1] == "function" ? event[1]() : event[1]), {"color": "#fff", "text-align": DIR.CENTER});
		for (let index = 2; index < event.length; index++) {
			let text = event[index][0];
			text = (typeof text == "function" ? text() : text);
			if (index == game.select[1] + 2) draw.lore(200 - 2, 100 + index * 20, "<#ff0>\> " + text + "  </#ff0>", {"color": "#fff", "text-align": DIR.CENTER});
			else  draw.lore(200 - 2, 100 + index * 20, text, {"color": "#fff", "text-align": DIR.CENTER});
		};
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
		let text = "";
		for (let index = 0; index < MAIN_MENU_OPTIONS.length; index++) {
			if (index == menuSelect[1] && focused) text += " <#ff0>\> " + MAIN_MENU_OPTIONS[index] + "</#ff0>\n";
			else text += "   " + MAIN_MENU_OPTIONS[index] + "\n";
		};
		draw.lore(1, 84, text, {"color": "#fff"});
	},
	/**
	 * Draws the confirmation layer on the canvas.
	 * @param {boolean} focused - whether the confirmation layer is focused. Defaults to `true`.
	 */
	conf(focused = true) {
		let text = "";
		let width = 0;
		let height = 26; // 20 for one line of text, 26 for two.
		if (menuSelect[0] === MENU.NEW_RUN || game.select[0] === S.CONF_RESTART) {
			text = "Are you sure you want to restart your current run?\nThe map will also be different next time.";
			width = 152;
		} else if (menuSelect[0] === MENU.DIFFICULTY) {
			if (game.difficulty === 0) text = "Are you sure you want to change the difficulty to hard?\nThis will also reset your current run.";
			else text = "Are you sure you want to change the difficulty to easy?\nThis will also reset your current run.";
			width = 166;
		} else if (game.select[0] === S.CONF_END) {
			text = "Are you sure you want to end your turn?";
			width = 118;
			height = 20;
		} else if (game.select[0] === S.CONF_EXIT) {
			text = "Are you sure you want to finish collecting rewards?\nThere are still rewards left unclaimed.";
			width = 154;
		} else if (game.select[0] === S.CONF_HAND_ALIGN) {
			text = "Are you sure you want to align the hands of time?\nYou will regret it. There is no going back.";
			width = 148;
		} else if (game.select[0] === S.CONF_PURIFY) {
			text = "Are you sure you want to destroy the card " + game.cards[game.cardSelect].getAttr("name") + "?\nIf you have multiple, this will only destroy one copy of the card.";
			width = 200;
		} else if (game.select[0] === S.CONF_REFINE) {
			text = "Are you sure you want to improve the card " + refinableDeck[game.cardSelect].getAttr("name") + "?\nIf you have multiple, this will only improve one copy of the card.";
			width = 200;
		} else if (game.select[0] === S.CONF_PEARL) {
			text = "As the dark cloud clears, you see a strange pearl resting on the ground.\nWill you pick it up? This will consume 2 energy.";
			width = 217;
		};
		const x = (400 - width) / 2;
		const y = (game.select[0] === S.CONF_REFINE ? 20 : (200 - height) / 2);
		draw.rect("#0008");
		draw.box(x, y, width, height);
		draw.lore(x + 1, y + 1, text, {"text-small": true});
		if (focused) {
			const select = (menuSelect[0] == -1 ? game.select[1] : menuSelect[1]);
			if (select == 0) {
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
	 * Draws the previous games layer on the canvas.
	 * @param {boolean} focused - whether the previous games layer is focused. Defaults to `true`.
	 */
	prevGames(focused = true) {
		draw.rect("#000c");
		draw.rect("#fff", 327, 14, 1, 185);
		const spaceY = 49;
		// draw previous games
		for (let index = 0; index < global.prevGames.length; index++) {
			// first row
			const prevGame = global.prevGames[index];
			let x = 5;
			let y = 18 + (index * spaceY) - menuScroll;
			draw.box(x - 2, y - 2, 321, 45, {"background-color": "#0004", "border-color": "#fff"});
			draw.lore(x, y, "<#000 highlight>Game #" + (index + 1) + "</#000>", {"color": "#000", "highlight-color": "#fff"});
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
				if (prevGame.kills.hasOwnProperty(key)) {
					kills += prevGame.kills[key];
				};
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
		// scrolling
		if (focused) {
			const scrollPadding = 11;
			const selected = Math.floor(menuSelect[1] / 3);
			if (menuScroll >= spaceY * selected) {
				menuScroll -= Math.min(10, Math.abs(menuScroll - (spaceY * selected)));
			} else if (menuScroll <= (spaceY * (selected - 3)) + scrollPadding) {
				menuScroll += Math.min(10, Math.abs(menuScroll - ((spaceY * (selected - 3)) + scrollPadding)));
			};
			const maxScroll = Math.max(spaceY * (global.prevGames.length - 3) + scrollPadding, 0);
			if (menuScroll > maxScroll) menuScroll = maxScroll;
			else if (menuScroll < 0) menuScroll = 0;
		};
		// draw top and right bars
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Previous Games", {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
		draw.lore(333, 18, "Press B to go back\nto the main menu.\n\nPress space or enter\nto view the details\nof the selected\naspect of a game.", {"color": "#fff", "text-small": true});
	},
	/**
	 * Draws the previous game artifact layer on the canvas.
	 * @param {boolean} focused - whether the previous game artifact layer is focused. Defaults to `true`.
	 */
	prevGameArtifacts(focused = true) {
		draw.rect("#000c");
		const artifacts = global.prevGames[Math.floor(menuSelect[1] / 3)].artifacts;
		if (menuArtifactSelect > artifacts.length - 1) menuArtifactSelect = artifacts.length - 1;
		// big artifacts
		for (let index = 0; index < artifacts.length; index++) {
			if (!ARTIFACTS[artifacts[index]].big) continue;
			draw.image(I.artifact[artifacts[index]], (index * 26) + 3, 16);
			if (index == menuArtifactSelect && focused) draw.image(I.artifact.select[artifacts[index]], (index * 26) + 2, 15);
		};
		// small artifacts
		for (let index = 0; index < artifacts.length; index++) {
			if (ARTIFACTS[artifacts[index]].big) continue;
			draw.image(I.artifact[artifacts[index]], (index * 26) + 11, 24);
			if (index == menuArtifactSelect && focused) draw.image(I.artifact.select[artifacts[index]], (index * 26) + 10, 23);
		};
		info.artifact(artifacts[menuArtifactSelect], menuArtifactSelect * 26 + 30, 24);
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Artifacts From Game #" + (Math.floor(menuSelect[1] / 3) + 1), {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
	},
	/**
	 * Draws the previous game kills layer on the canvas.
	 */
	prevGameKills() {
		draw.rect("#000c");
		const kills = global.prevGames[Math.floor(menuSelect[1] / 3)].kills;
		const spaceY = 76;
		let x = 3, y = 16;
		const categories = [SMALL_ENEMIES, BIG_ENEMIES, PRIME_ENEMIES, BOSS_ENEMIES];
		for (let category = 0; category < categories.length; category++) {
			const spaceX = (categories[category] === BOSS_ENEMIES ? 400 - x + 1 : 90);
			for (let index = 0; index < categories[category].length; index++) {
				const type = categories[category][index];
				if (!kills[type]) continue;
				draw.box(x, y, spaceX - 4, spaceY - 4, {"background-color": "#0004", "border-color": "#fff"});
				draw.enemy(type, x + (spaceX - 4) / 2 - 32, y + 1, category * categories[category].length + index, menuEnemyAnim);
				draw.rect("#fff", x, y + 66, spaceX - 4, 6);
				let text = "Killed ";
				if (categories[category] === BOSS_ENEMIES) text += ENEMY_NAME[type];
				else text += kills[type] + " " + (kills[type] > 1 ? PLURAL_ENEMY_NAME : ENEMY_NAME)[type];
				draw.lore(x + (spaceX - 4) / 2 - 1, y + 67, text, {"text-align": DIR.CENTER, "text-small": true});
				y += spaceY;
			};
			y = 16;
			x += spaceX;
		};
		draw.rect("#0004", 0, 0, 400, 13);
		draw.lore(200 - 2, 1, "Enemies Killed From Game #" + (Math.floor(menuSelect[1] / 3) + 1), {"color": "#fff", "text-align": DIR.CENTER});
		draw.rect("#fff", 1, 12, 398, 1);
		progressEnemyAnimations(menuEnemyAnim);
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
	 * Starts an enemy animation.
	 */
	enemy() {
		enemyAnim.action = [0, ANIM.STARTING];
	},
};
