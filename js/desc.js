/**
 * @typedef {(string | number | [number, string | boolean] | [number, number] | [number, number, string | DescNodeList])[]} DescNodeList
 */

class Desc {
	/**
	 * Returns a new description.
	 * @param {DescNodeList} nodes - the nodes of the description.
	 */
	constructor(...nodes) {
		this.nodes = nodes;
	}
	/**
	 * Draws the description on the canvas.
	 * @param {number} x - the x-coordinate to draw the description at.
	 * @param {number} y - the y-coordinate to draw the description at.
	 * @param {number} id - the id of the card to draw the description for.
	 * @param {boolean} outside - whether the card is outside the battle. Defaults to `false`.
	 * @param {number} wrapWidth - the wrapping width of the description (in characters). Defaults to `19`.
	 */
	draw = (() => {
		const DESC_EXTRA = {[DESC.DAMAGE]: "extraDamage", [DESC.SHIELD]: "extraShield"};
		const DESC_MULT = {[DESC.DAMAGE]: "dealDamageMult", [DESC.SHIELD]: "playerShieldMult"};
		const DESC_EFFECTS = {[DESC.DAMAGE]: "attackEffects", [DESC.SHIELD]: "defendEffects"};
		/**
		 * Returns a string constructed from the specified description nodes.
		 * @param {DescNodeList} nodes - the nodes to construct the string from.
		 * @param {number} id - the id of the card to draw the description for.
		 * @param {boolean} outside - whether the card is outside the battle.
		 * @returns {[string, boolean]}
		 */
		function getStringFromNodes(nodes, id, outside) {
			let str = "";
			let valueIsLess = false;
			for (let index = 0; index < nodes.length; index++) {
				const node = nodes[index];
				if (node instanceof Array) {
					if (typeof node[1] === "number") {
						if (CARDS[id][DESC_EFFECTS[node[1]]] !== false && !outside) {
							let extra = get[DESC_EXTRA[node[1]]](selected(S.ATTACK) ? game.select[1] : game.enemyAtt[1]);
							if (CARDS[id].keywords.includes(CARD_EFF.UNIFORM)) extra = Math.floor(extra / 2);
							const mult = get[DESC_MULT[node[1]]](selected(S.ATTACK) ? game.select[1] : game.enemyAtt[1]);
							const amount = Math.ceil((node[0] + extra) * mult);
							if (amount > node[0]) {
								str += "<#0f0 highlight>" + amount + "</#0f0>";
							} else if (amount < node[0]) {
								valueIsLess = true;
								str += "<#fff highlight>" + amount + "</#fff>";
							} else {
								str += amount;
							}
						} else {
							str += node[0];
						}
						str += (node[2] instanceof Array ? getStringFromNodes(node[2], id, outside)[0] : node[2] ?? " ");
						const color = EFF_COLOR[node[1]];
						if (color) str += "<" + color + ">" + DESC_NAME[node[1]] + "</" + color + ">";
						else str += DESC_NAME[node[1]];
					} else {
						const name = (typeof node[1] === "string"
							? EFF_NAME[node[0]] + node[1]
							: (node[1] === true
								? EFF_NAME[node[0]][0].toUpperCase() + EFF_NAME[node[0]].slice(1)
								: EFF_NAME[node[0]]
						));
						const color = EFF_COLOR[node[0]];
						if (color) str += "<" + color + ">" + name + "</" + color + ">";
						else str += name;
					}
				} else if (EFF_NAME[node]) {
					const color = EFF_COLOR[node];
					if (color) str += "<" + color + ">" + EFF_NAME[node] + "</" + color + ">";
					else str += EFF_NAME[node];
				} else {
					str += node;
				}
			}
			return [str, valueIsLess];
		}
		return (x = 0, y = 0, id = 0, outside = false, wrapWidth = 18) => {
			let [str, valueIsLess] = getStringFromNodes(this.nodes, id, outside);
			if (wrapWidth > 0) str = wrapText(str, wrapWidth);
			return draw.lore(x, y, str, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		}
	})();
}
