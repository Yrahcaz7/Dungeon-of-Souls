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

const ENEMY_NAMES = {
	[SLIME.BIG]: "big slime",
	[SLIME.SMALL]: "small slime",
	[SLIME.PRIME]: "prime slime",
	[FRAGMENT]: "fragment of time",
};

const ENEMY_WORTH = {
	[SLIME.BIG]: 100,
	[SLIME.SMALL]: 50,
	[SLIME.PRIME]: 500,
	[FRAGMENT]: 1000,
};

const ATTACK = 700, DEFEND = 701, BUFF = 702;

const INTENT = {[ATTACK]: "<#f44>attack</#f44> you", [DEFEND]: "<#58f>defend</#58f> itself", [BUFF]: "buff itself"};

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
		power += (game.difficulty * 0.75) + 2;
		power += (game.floor * 0.05) * (2 ** game.difficulty);
		if (game.artifacts.includes(0)) power += 0.5;
		this.type = +type;
		if (type === FRAGMENT) this.maxHealth = Math.max(Math.round((power * 10) * 1.05), 1);
		else this.maxHealth = Math.max(Math.round((power * 10) * ((random() / 10) + 0.95)), 1);
		this.health = this.maxHealth;
		this.maxShield = Math.max(Math.floor(this.maxHealth / 2), 1);
		this.shield = 0;
		this.attackPower = Math.max(Math.round(power * 2.5), 1);
		this.defendPower = Math.max(Math.round(power * 3), 1);
		this.eff = {};
		if (type === FRAGMENT && game.artifacts.includes(0)) this.eff.rewinds = 1;
		this.intent = this.getIntent(true);
		this.intentHistory = [this.intent];
	};
	/**
	 * Gets the enemy's extra attack power.
	 */
	getExtraAttackPower() {
		let power = 0;
		if (this.eff.rewinds) power += this.attackPower * this.eff.rewinds * 0.2;
		return Math.floor(power);
	};
	/**
	 * Gets the enemy's extra defend power.
	 */
	getExtraDefendPower() {
		let power = 0;
		if (this.eff.rewinds) power += this.defendPower * this.eff.rewinds * 0.2;
		return Math.floor(power);
	};
	/**
	 * Gets the enemy's total attack power.
	 */
	getTotalAttackPower() {
		return this.attackPower + this.getExtraAttackPower();
	};
	/**
	 * Gets the enemy's total defend power.
	 */
	getTotalDefendPower() {
		return this.defendPower + this.getExtraDefendPower();
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
			takeDamage(this.getTotalAttackPower());
			if (game.health < prevHealth) startAnim.player("hit");
		} else if (this.intent === DEFEND) {
			this.shield += this.getTotalDefendPower();
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
		this.done = true;
	};
	/**
	 * Finishes the enemy's action.
	 */
	finishAction() {
		if (game.shield == 0 && playerAnim[1] != "idle" && playerAnim[1] != "hit") {
			startAnim.player("idle");
		};
		if (this.eff.countdown > 0) {
			this.intent = this.intentHistory[this.eff.countdown - 1];
			this.intentHistory.push(this.intent);
			this.eff.countdown--;
			if (!this.eff.countdown) this.eff.rewinds++;
		} else {
			this.intent = this.getIntent();
			this.intentHistory.push(this.intent);
			if (this.overrideIntent(ATTACK)) {
				this.intent = DEFEND;
				this.intentHistory.push(this.intent);
			} else if (this.overrideIntent(DEFEND, BUFF)) {
				this.intent = ATTACK;
				this.intentHistory.push(this.intent);
			};
		};
		if (game.enemyNum == game.enemies.length - 1) {
			game.enemyNum = -1;
			startTurn();
		} else {
			game.enemyNum++;
		};
		game.enemyStage = -1;
		delete this.done;
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
