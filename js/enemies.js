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

const ATTACK = 700, DEFEND = 701, BUFF = 702;

class Enemy {
	/**
	 * Returns a new enemy.
	 * @param {number} type - the enemy's type.
	 * @param {number} power - the enemy's power. Defaults to 1.
	 */
	constructor(type, power = 1) {
		if (type === SLIME.SMALL) power--;
		else if (type === SLIME.PRIME) power++;
		else if (type === FRAGMENT) power += 2;
		power += global.difficulty * 0.75;
		power += (game.floor * 0.05) * (2 ** global.difficulty);
		this.type = +type;
		if (type === FRAGMENT) this.maxHealth = Math.round(((power * 10) + 20) * 1.05);
		else this.maxHealth = Math.round(((power * 10) + 20) * ((random() / 10) + 0.95));
		this.health = this.maxHealth;
		this.maxShield = Math.floor(this.maxHealth / 2);
		this.shield = 0;
		this.attackPower = Math.round(((power / 2) + 1) * 5 - 0.25);
		this.defendPower = Math.round(((power / 2) + 1) * 5 + 1);
		this.eff = {};
		if (type === FRAGMENT && game.artifacts.includes(0)) this.eff.rewinds = 1;
		this.intent = this.getIntent(true);
		this.intentHistory = [this.intent];
	};
	/**
	 * Starts the enemy's action.
	 */
	startAction() {
		if (this.intent === ATTACK) {
			if (game.shield && !playerAnim[1].includes("shield")) {
				if (game.eff.weakness) startAnim.player("crouch_shield");
				else startAnim.player("shield");
			};
			if (this.type >= 600 && this.type <= FRAGMENT) {
				startAnim.enemy();
			} else {
				this.middleAction();
				this.finishAction();
			};
		} else if (this.intent === DEFEND) {
			if (this.type < SLIME.PRIME || (this.type === SLIME.PRIME && primeAnim == -1)) {
				startAnim.enemy();
			} else {
				this.middleAction();
			};
		} else if (this.intent === BUFF) {
			this.middleAction();
		};
	};
	/**
	 * Triggers the effects of the enemy's action.
	 */
	middleAction() {
		if (this.intent === ATTACK) {
			let prevHealth = game.health;
			takeDamage(this.attackPower);
			if (game.health < prevHealth) startAnim.player("hit");
		} else if (this.intent === DEFEND) {
			this.shield += this.defendPower;
			if (this.type > SLIME.PRIME || (this.type === SLIME.PRIME && primeAnim != -1)) {
				this.finishAction();
			};
		} else if (this.intent === BUFF) {
			if (this.type === FRAGMENT) {
				if (this.eff.resilience) this.eff.resilience += 3;
				else this.eff.resilience = 3;
			};
			this.finishAction();
		};
	};
	/**
	 * Finishes the enemy's action.
	 */
	finishAction() {
		if (game.shield == 0 && playerAnim[1] != "idle" && playerAnim[1] != "hit") startAnim.player("idle");
		this.intent = this.getIntent();
		this.intentHistory.push(this.intent);
		if (this.overrideIntent(ATTACK)) {
			this.intent = DEFEND;
			this.intentHistory.push(this.intent);
		} else if (this.overrideIntent(DEFEND, BUFF)) {
			this.intent = ATTACK;
			this.intentHistory.push(this.intent);
		};
		if (game.enemyNum == game.enemies.length - 1) {
			game.enemyNum = -1;
			startTurn();
		} else {
			game.enemyNum++;
		};
		game.enemyStage = -1;
	};
	/**
	 * Gets the enemy's intent.
	 * @param {boolean} first - whether this is the enemy's first intent. Defaults to false.
	 */
	getIntent(first = false) {
		if (this.type === FRAGMENT) {
			if (first) return BUFF;
			if (chance(3/5)) {
				return ATTACK;
			} else {
				if (this.health <= this.maxHealth / 4 || this.eff.resilience > 1) return DEFEND;
				return chance(2/3) ? BUFF : DEFEND;
			};
		};
		return chance(3/5) ? ATTACK : DEFEND;
	};
	/**
	 * Overrides the enemy's intent if the conditions are satisfied.
	 * @param {ATTACK | DEFEND | BUFF} type - the type of intent to override.
	 * @param {ATTACK | DEFEND | BUFF | undefined} type2 - another type to check for, if any.
	 */
	overrideIntent(type, type2) {
		let location = this.intentHistory.lastIndexOf(type);
		if (type2) {
			let location2 = this.intentHistory.lastIndexOf(type2);
			if (location2 > location) location = location2;
		};
		if (location !== -1) {
			let item1 = this.intentHistory[location - 1];
			if (item1 === type || (type2 && item1 === type2)) {
				let item2 = this.intentHistory[location - 2];
				if (item2 === type || (type2 && item2 === type2)) {
					this.intentHistory.splice(this.intentHistory.length - 1);
					return true;
				};
			};
		};
		return false;
	};
};

/**
 * Returns an object as an enemy.
 * @param {object} object - the object to classify.
 */
function classifyEnemy(object = {}) {
	let instance = new Enemy("", NaN);
	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			instance[key] = object[key];
		};
	};
	return instance;
};
