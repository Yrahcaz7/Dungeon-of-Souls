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

class Desc {
	/**
	 * Returns a new description.
	 * @param {(string | (string | number | boolean)[])[]} nodes - the nodes of the description.
	 */
	constructor(...nodes) {
		this.nodes = nodes;
	};
	/**
	 * Draws the description on the canvas.
	 * @param {number} x - the x-coordinate to draw the description at.
	 * @param {number} y - the y-coordinate to draw the description at.
	 * @param {number} id - the id of the card to draw the description for.
	 * @param {boolean} outside - whether the card is outside the battle. Defaults to `false`.
	 */
	draw = (() => {
		const DESC_EXTRA = {[DESC.DAMAGE]: "extraDamage", [DESC.SHIELD]: "extraShield"};
		const DESC_MULT = {[DESC.DAMAGE]: "dealDamageMult", [DESC.SHIELD]: "playerShieldMult"};
		const DESC_EFFECTS = {[DESC.DAMAGE]: "attackEffects", [DESC.SHIELD]: "defendEffects"};
		/**
		 * Returns a string constructed from the specified description nodes.
		 * @param {(string | (string | number | boolean)[])[]} nodes - the nodes to construct the string from.
		 * @param {number} id - the id of the card to draw the description for.
		 * @param {boolean} outside - whether the card is outside the battle.
		 * @returns {[string, boolean]}
		 */
		function getStringFromNodes(nodes, id, outside) {
			let str = "";
			let valueIsLess = false;
			for (let index = 0; index < nodes.length; index++) {
				if (nodes[index] instanceof Array) {
					if (typeof nodes[index][1] === "number") {
						if (CARDS[id][DESC_EFFECTS[nodes[index][1]]] !== false && !outside) {
							let extra = get[DESC_EXTRA[nodes[index][1]]]();
							if (CARDS[id].keywords.includes(CARD_EFF.UNIFORM)) extra = Math.floor(extra / 2);
							const mult = get[DESC_MULT[nodes[index][1]]](game.select[0] === S.ATTACK ? game.select[1] : game.enemyAtt[1]);
							const amount = Math.ceil((nodes[index][0] + extra) * mult);
							if (amount > nodes[index][0]) {
								str += "<#0f0 highlight>" + amount + "</#0f0>";
							} else if (amount < nodes[index][0]) {
								valueIsLess = true;
								str += "<#fff highlight>" + amount + "</#fff>";
							} else {
								str += amount;
							};
						} else {
							str += nodes[index][0];
						};
						str += (nodes[index][2] instanceof Array ? getStringFromNodes(nodes[index][2], id, outside)[0] : nodes[index][2] ?? " ");
						const color = EFF_COLOR[nodes[index][1]];
						if (color) str += "<" + color + ">" + DESC_NAME[nodes[index][1]] + "</" + color + ">";
						else str += DESC_NAME[nodes[index][1]];
					} else {
						const name = (typeof nodes[index][1] === "string" ?
							EFF_NAME[nodes[index][0]] + nodes[index][1]
							: (nodes[index][1] === true ?
								EFF_NAME[nodes[index][0]][0].toUpperCase() + EFF_NAME[nodes[index][0]].slice(1)
								: EFF_NAME[nodes[index][0]]
						));
						const color = EFF_COLOR[nodes[index][0]];
						if (color) str += "<" + color + ">" + name + "</" + color + ">";
						else str += name;
					};
				} else if (EFF_NAME[nodes[index]]) {
					const color = EFF_COLOR[nodes[index]];
					if (color) str += "<" + color + ">" + EFF_NAME[nodes[index]] + "</" + color + ">";
					else str += EFF_NAME[nodes[index]];
				} else {
					str += nodes[index];
				};
			};
			return [str, valueIsLess];
		};
		return (x = 0, y = 0, id = 0, outside = false) => {
			const [str, valueIsLess] = getStringFromNodes(this.nodes, id, outside);
			return draw.lore(x, y, str, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		};
	})();
};
