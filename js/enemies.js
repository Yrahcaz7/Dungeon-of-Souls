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

const SLIME = {BIG: 600, SMALL: 601, PRIME: 602}, FRAGMENT = 603;

const ATTACK = 700, DEFEND = 701;

class Enemy {
	constructor(type, power = 1) {
		if (type === SLIME.SMALL) power--;
		if (type === SLIME.PRIME) power++;
		if (type === FRAGMENT) power += 2;
		power += global.difficulty * 0.75;
		power += (game.floor * 0.05) * (2 ** global.difficulty);
		this.type = +type;
		this.maxHealth = Math.round(((random() / 10) + 0.95) * ((power * 10) + 20));
		this.health = this.maxHealth;
		this.maxShield = Math.round(((random() / 10) + 0.95) * ((power * 5) + 10));
		this.shield = 0;
		this.attackPower = Math.round(((power / 2) + 1) * 5 - 0.25);
		this.defendPower = Math.round(((power / 2) + 1) * 5 + 1);
		this.eff = {};
		this.intent = chance(3/5) ? ATTACK : DEFEND;
		this.intentHistory = [this.intent];
	};
	startAction = () => {
		if (this.intent === ATTACK) {
			if (game.shield && !playerAnim[1].includes("shield")) {
				if (game.eff.weakness) startAnim.player("crouch_shield");
				else startAnim.player("shield");
			};
			if (this.type >= 600 && this.type <= FRAGMENT) startAnim.enemy(game.enemyNum, this.type);
			else {
				this.middleAction();
				this.finishAction();
			};
		} else if (this.intent === DEFEND) {
			this.middleAction();
		};
	};
	middleAction = () => {
		if (this.intent === ATTACK) {
			var damage = this.attackPower;
			if (game.shield <= damage) {
				damage -= game.shield;
				game.shield = 0;
				game.health -= damage;
			} else {
				game.shield -= damage;
			};
			if (game.shield < 1) startAnim.player("hit");
		} else if (this.intent === DEFEND) {
			this.shield += this.defendPower;
			this.finishAction();
		};
	};
	finishAction = () => {
		this.intent = chance(3/5) ? ATTACK : DEFEND;
		this.intentHistory.push(this.intent);
		if (this.overrideIntent(ATTACK)) {
			this.intent = DEFEND;
			this.intentHistory = [DEFEND];
		} else if (this.overrideIntent(DEFEND)) {
			this.intent = ATTACK;
			this.intentHistory = [ATTACK];
		};
		if (game.enemyNum == game.enemies.length - 1) {
			game.enemyNum = 0;
			startTurn();
		} else {
			game.enemyNum++;
		};
		game.enemyStage = -1;
	};
	overrideIntent = (type) => {
		const location0 = this.intentHistory.lastIndexOf(type);
		if (location0 !== -1) {
			const location1 = this.intentHistory.lastIndexOf(type, location0 - 1);
			if (location1 + 1 === location0) {
				const location2 = this.intentHistory.lastIndexOf(type, location1 - 1);
				if (location2 + 1 === location1) {
					this.intentHistory = [];
					return true;
				};
			};
		};
		return false;
	};
};

function classifyEnemy(object = {}) {
	let instance = new Enemy("", NaN);
	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			instance[key] = object[key];
		};
	};
	return instance;
};
