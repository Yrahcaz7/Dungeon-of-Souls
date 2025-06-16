class Desc {
	/**
	 * Returns a new description.
	 * @param {(string | (number | boolean)[])[]} nodes - the nodes of the description.
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
		const DESC_NAME = {[DESC.DAMAGE]: "damage", [DESC.SHIELD]: "shield"};
		return (x = 0, y = 0, id = 0, outside = false) => {
			let str = "";
			let valueIsLess = false;
			for (let index = 0; index < this.nodes.length; index++) {
				if (this.nodes[index] instanceof Array) {
					if (CARDS[id][DESC_EFFECTS[this.nodes[index][1]]] !== false && !outside) {
						let extra = get[DESC_EXTRA[this.nodes[index][1]]]();
						if (CARDS[id].keywords.includes(CARD_EFF.UNIFORM)) extra = Math.floor(extra / 2);
						const mult = get[DESC_MULT[this.nodes[index][1]]](game.select[0] === S.ATTACK ? game.select[1] : game.enemyAtt[1]);
						const amount = Math.ceil((this.nodes[index][0] + extra) * mult);
						if (amount > this.nodes[index][0]) {
							str += "<#0f0 highlight>" + amount + "</#0f0>";
						} else if (amount < this.nodes[index][0]) {
							valueIsLess = true;
							str += "<#fff highlight>" + amount + "</#fff>";
						} else {
							str += amount;
						};
					} else {
						str += this.nodes[index][0];
					};
					str += (this.nodes[index][2] ?? " ") + DESC_NAME[this.nodes[index][1]];
				} else {
					str += this.nodes[index];
				};
			};
			return draw.lore(x, y, str, {"highlight-color": (valueIsLess ? "#f00" : "#000"), "text-small": true});
		};
	})();
};
