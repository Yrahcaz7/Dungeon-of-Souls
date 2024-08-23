/*  Dungeon of Souls
 *  Copyright (C) 2024 Yrahcaz7
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

class Enemy {
	/**
	 * Returns a new enemy.
	 * @param {number} type - the enemy's type.
	 * @param {number} power - the enemy's power. Defaults to `1`.
	 */
	constructor(type, power = 1) {
		if (type === SLIME.SMALL || type === SENTRY.SMALL) power--;
		else if (type === SLIME.PRIME || type === SENTRY.PRIME) power++;
		else if (type === FRAGMENT || type === SINGULARITY) power += 2;
		power += (game.difficulty * 0.75) + 2;
		power += (game.floor * 0.05) * (2 ** game.difficulty);
		if (game.artifacts.includes(202)) power += 0.5;
		this.type = +type;
		if (type === SINGULARITY) this.maxHealth = (power * 10) * 1.25;
		else if (type === FRAGMENT) this.maxHealth = (power * 10) * 1.05;
		else this.maxHealth = (power * 10) * ((random() / 10) + 0.95);
		this.maxHealth *= (get.area() / 10) + 1;
		this.maxHealth = Math.max(Math.round(this.maxHealth), 1);
		this.health = this.maxHealth;
		this.maxShield = Math.max(Math.floor(this.maxHealth / 2), 1);
		this.shield = 0;
		this.attackPower = Math.max(Math.round(power * 2.5), 1);
		this.defendPower = Math.max(Math.round(power * 3), 1);
		this.intent = this.getIntent(true);
		this.intentHistory = [this.intent];
		this.eff = {};
		if (type === FRAGMENT && game.artifacts.includes(202)) this.eff[ENEMY_EFF.REWIND] = 1;
		if (type === SENTRY.BIG || type === SENTRY.SMALL || type === SENTRY.PRIME || type === SINGULARITY) this.eff[EFF.BLAZE] = 99;
		if (type === SINGULARITY) this.eff[[ENEMY_EFF.PLAN_ATTACK, ENEMY_EFF.PLAN_SUMMON, ENEMY_EFF.PLAN_DEFEND][Math.floor(random() * 3)]] = 99;
	};
	/**
	 * Gets the enemy's extra attack power.
	 */
	getExtraAttackPower() {
		let power = 0;
		if (this.eff[ENEMY_EFF.REWIND]) power += this.attackPower * this.eff[ENEMY_EFF.REWIND] * 0.2;
		return Math.floor(power);
	};
	/**
	 * Gets the enemy's extra defend power.
	 */
	getExtraDefendPower() {
		let power = 0;
		if (this.eff[ENEMY_EFF.REWIND]) power += this.defendPower * this.eff[ENEMY_EFF.REWIND] * 0.2;
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
		if (this.intent === INTENT.ATTACK) {
			if (game.shield && !/shield/.test(playerAnim[1])) {
				if (game.eff[EFF.WEAKNESS]) startAnim.player("crouch_shield");
				else startAnim.player("shield");
			};
			startAnim.enemy();
		} else if (this.intent === INTENT.DEFEND) {
			if (this.type === FRAGMENT || this.type === SINGULARITY || (this.type === SLIME.PRIME && primeAnim != -1)) {
				this.middleAction();
			} else {
				startAnim.enemy();
			};
		} else {
			this.middleAction();
		};
	};
	/**
	 * Triggers the effects of the enemy's action.
	 */
	middleAction() {
		if (this.intent === INTENT.ATTACK) {
			let prevHealth = game.health;
			takeDamage(this.getTotalAttackPower());
			if (game.health < prevHealth) startAnim.player("hit");
		} else if (this.intent === INTENT.DEFEND) {
			enemyGainShield(this.getTotalDefendPower());
			if (this.type === FRAGMENT || this.type === SINGULARITY || (this.type === SLIME.PRIME && primeAnim != -1)) {
				this.finishAction();
			};
		} else if (this.intent === INTENT.BUFF) {
			if (this.type === FRAGMENT) {
				if (this.eff[EFF.RESILIENCE]) this.eff[EFF.RESILIENCE] += 3;
				else this.eff[EFF.RESILIENCE] = 3;
			};
			this.finishAction();
		} else if (this.intent === INTENT.SUMMON) {
			game.enemies.push(new Enemy([SLIME.SMALL, SENTRY.SMALL][get.area()], 0));
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
		if (this.eff[ENEMY_EFF.COUNTDOWN]) {
			this.intent = this.intentHistory[this.eff[ENEMY_EFF.COUNTDOWN] - 1];
			this.intentHistory.push(this.intent);
			this.eff[ENEMY_EFF.COUNTDOWN]--;
			if (!this.eff[ENEMY_EFF.COUNTDOWN]) this.eff[ENEMY_EFF.REWIND]++;
		} else {
			this.intent = this.getIntent();
			this.intentHistory.push(this.intent);
			if (this.overrideIntent(INTENT.ATTACK, INTENT.SUMMON)) {
				if (this.type === FRAGMENT) {
					if (this.health <= this.maxHealth / 4 || this.eff[EFF.RESILIENCE] > 1) this.intent = INTENT.DEFEND;
					else this.intent = chance(2/3) ? INTENT.BUFF : INTENT.DEFEND;
				} else {
					this.intent = INTENT.DEFEND;
				};
				this.intentHistory.push(this.intent);
			} else if (this.overrideIntent(INTENT.DEFEND, INTENT.BUFF)) {
				if (this.type === SINGULARITY) {
					if (game.enemies.length > 2) this.intent = INTENT.ATTACK;
					else this.intent = chance(1/3) ? INTENT.SUMMON : INTENT.ATTACK;
				} else {
					this.intent = INTENT.ATTACK;
				};
				this.intentHistory.push(this.intent);
			};
		};
		if (game.turn !== TURN.ENEMY) {
			game.enemyNum = -1;
		} else if (game.enemyNum == game.enemies.length - 1) {
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
	 * @param {boolean} first - whether this is the enemy's first intent. Defaults to `false`.
	 */
	getIntent(first = false) {
		if (this.type === SINGULARITY) {
			if (first) return INTENT.SUMMON;
			if (this.health <= this.maxHealth / 5) {
				if (game.enemies.length > 2) return INTENT.DEFEND;
				return chance(1/3) ? INTENT.SUMMON : INTENT.DEFEND;
			} else {
				if (chance(3/5)) {
					if (game.enemies.length > 2) return INTENT.ATTACK;
					return chance(1/3) ? INTENT.SUMMON : INTENT.ATTACK;
				} else {
					return INTENT.DEFEND;
				};
			};
		};
		if (this.type === FRAGMENT) {
			if (first) return INTENT.BUFF;
			if (chance(3/5)) {
				return INTENT.ATTACK;
			} else {
				if (this.health <= this.maxHealth / 4 || this.eff[EFF.RESILIENCE] > 1) return INTENT.DEFEND;
				return chance(2/3) ? INTENT.BUFF : INTENT.DEFEND;
			};
		};
		return chance(3/5) ? INTENT.ATTACK : INTENT.DEFEND;
	};
	/**
	 * Overrides the enemy's intent if the conditions are satisfied.
	 * @param {number} type - the type of intent to override.
	 * @param {number | undefined} type2 - another type to check for, if any.
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
		if (object.hasOwnProperty(key)) {
			instance[key] = object[key];
		};
	};
	return instance;
};

/**
 * Checks if an enemy should be visible.
 * @param {number} index - the index of the enemy.
 */
function isEnemyVisible(index) {
	if (!game.enemies[index]) return false;
	if (index !== game.enemyNum || game.enemies[index].transition) return true;
	const type = game.enemies[index].type;
	const intent = game.enemies[index].intent;
	if (intent === INTENT.ATTACK) return !(type === SLIME.SMALL || type === SENTRY.BIG || type === SENTRY.SMALL || (type === SENTRY.PRIME && primeAnim == -1));
	else if (intent === INTENT.DEFEND) return !(type === SENTRY.BIG || type === SENTRY.SMALL || (type === SENTRY.PRIME && primeAnim == -1));
	else return true;
};

/**
 * Gets the position of an enemy's intent.
 * @param {number} index - the index of the enemy.
 * @param {boolean} moving - whether the intent is moving. Defaults to `false`.
 */
function getEnemyIntentPos(index, moving = false) {
	let y = enemyPos[index][1];
	const type = game.enemies[index]?.type;
	if (type === SLIME.BIG) {
		y -= 17;
	} else if (type === SLIME.SMALL) {
		y -= 7;
	} else if (type === SLIME.PRIME) {
		if (primeAnim == -1 || primeAnim >= 5) y -= 37;
		else y -= 17;
	} else if (type === FRAGMENT) {
		if (primeAnim == -1 || primeAnim > 18) y -= 36;
		else y = NaN;
	} else if (type === SENTRY.BIG) {
		y -= 40;
	} else if (type === SENTRY.SMALL) {
		y -= 9;
	} else if (type === SENTRY.PRIME) {
		y -= 43;
	} else if (type === SINGULARITY) {
		y -= 40;
	};
	y = Math.max(y, -2);
	if (moving) y += Math.abs(intentAnim[index] - 2);
	else y += 14;
	return Math.round(y);
};
