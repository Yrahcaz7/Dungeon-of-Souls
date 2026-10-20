class Enemy {
	type = SLIME.SMALL;
	maxHealth = 1;
	health = 1;
	maxShield = 1;
	shield = 0;
	attackPower = 0;
	defendPower = 0;
	intent = INTENT.ATTACK;
	intentHistory = [INTENT.ATTACK];
	/** @type {{[key: number]: number}} */
	eff = {};
	/** @type {[number, number] | null} */
	transition = null;
	/**
	 * Returns a new enemy.
	 * @param {number | null} type - the enemy's type.
	 * @param {number} power - the enemy's power. Defaults to `1`.
	 */
	constructor(type = null, power = 1) {
		if (!type) return;
		// setup
		if (SMALL_ENEMIES.includes(type)) power--;
		else if (PRIME_ENEMIES.includes(type)) power++;
		else if (BOSS_ENEMIES.includes(type)) power += 2;
		power += 2 + (game.difficulty + (+hasArtifact(202))) * 0.5 + game.floor * 0.05;
		this.type = type;
		if (type === SINGULARITY) this.maxHealth = (power * 10) * 1.25;
		else if (type === FRAGMENT) this.maxHealth = (power * 10) * 1.05;
		else this.maxHealth = (power * 10) * ((random() / 10) + 0.95);
		this.maxHealth *= (get.area() / 10) + 1;
		this.maxHealth = Math.max(Math.round(this.maxHealth), 1);
		this.health = this.maxHealth;
		this.maxShield = Math.max(Math.floor(this.maxHealth / 2), 1);
		if (type !== SLIME.PUDDLE) {
			this.attackPower = Math.max(Math.round(power * 2.5), 1);
			this.defendPower = Math.max(Math.round(power * 3), 1);
		}
		this.intent = this.getIntent(true);
		this.intentHistory = [this.intent];
		// general effects
		if (type === SENTRY.BIG || type === SENTRY.SMALL || type === SENTRY.PRIME || type === SENTRY.FLAMING || type === SINGULARITY) {
			this.eff[EFF.BLAZE] = 99;
		}
		// specific effects
		if (type === SLIME.STICKY) {
			this.eff[ENEMY_EFF.STICKY] = 1;
		} else if (type === SENTRY.FLAMING) {
			this.eff[EFF.HYPERSPEED] = 99;
			this.eff[EFF.FIREPROOF] = 1;
		} else if (type === SINGULARITY) {
			this.eff[[ENEMY_EFF.PLAN_ATTACK, ENEMY_EFF.PLAN_SUMMON, ENEMY_EFF.PLAN_DEFEND][Math.floor(random() * 3)]] = 1;
		}
		// difficulty effects
		if (game.difficulty >= 1) {
			if (type === SLIME.BIG) this.eff[ENEMY_EFF.PERSISTENCE] = 2;
			else if (type === SLIME.SMALL) this.eff[ENEMY_EFF.PERSISTENCE] = 1;
			else if (type === SLIME.PRIME) this.eff[ENEMY_EFF.PERSISTENCE] = 4;
			else if (type === SLIME.STICKY) this.eff[ENEMY_EFF.PERSISTENCE] = 3;
			else if (type === SENTRY.BIG || type === SENTRY.SMALL || type === SENTRY.PRIME) this.eff[ENEMY_EFF.OVERHEAT] = 1;
			else if (type === SENTRY.FLAMING) this.eff[ENEMY_EFF.OVERHEAT] = 2;
		}
		if (hasArtifact(202)) {
			if (type === FRAGMENT) this.eff[ENEMY_EFF.REWIND] = 1;
		}
		// artifact effects
		if (hasArtifact(107)) this.eff[EFF.BURN] = 1;
	}
	/**
	 * Returns an object as an enemy.
	 * @param {object} obj - the object to classify.
	 */
	static classify(obj = {}) {
		let instance = new Enemy();
		for (const key in instance) {
			if (Object.hasOwn(instance, key) && Object.hasOwn(obj, key)) {
				instance[key] = obj[key];
			}
		}
		return instance;
	}
	/**
	 * Returns a boolean indicating if the enemy is a boss.
	 */
	isBoss() {
		return BOSS_ENEMIES.includes(this.type);
	}
	/**
	 * Gets the enemy's extra attack power.
	 */
	getExtraAttackPower() {
		let power = 0;
		if (this.eff[ENEMY_EFF.REWIND]) power += this.attackPower * this.eff[ENEMY_EFF.REWIND] * 0.2;
		return Math.floor(power);
	}
	/**
	 * Gets the enemy's extra defend power.
	 */
	getExtraDefendPower() {
		let power = 0;
		if (this.eff[ENEMY_EFF.REWIND]) power += this.defendPower * this.eff[ENEMY_EFF.REWIND] * 0.2;
		return Math.floor(power);
	}
	/**
	 * Gets the enemy's total attack power.
	 */
	getTotalAttackPower() {
		return this.attackPower + this.getExtraAttackPower();
	}
	/**
	 * Gets the enemy's total defend power.
	 */
	getTotalDefendPower() {
		return this.defendPower + this.getExtraDefendPower();
	}
	/**
	 * Starts the enemy's action.
	 */
	startAction() {
		if (this.intent === INTENT.ATTACK) {
			if (game.shield && !isDefending(playerAnim[1])) {
				if (game.eff[EFF.WEAKNESS]) startAnim.player(I.player.crouch_shield);
				else startAnim.player(I.player.shield);
			}
		} else if (this.intent === INTENT.DEFEND) {
			return;
		} else {
			this.middleAction();
		}
	}
	/**
	 * Triggers the effects of the enemy's action.
	 */
	middleAction() {
		if (this.done) return;
		if (this.intent === INTENT.ATTACK) {
			const prevHealth = game.health;
			takeDamage(this.getTotalAttackPower());
			if (game.health < prevHealth && this.type !== FRAGMENT) {
				startAnim.player(I.player.hit);
			} else if (game.shield === 0 && playerAnim[1] !== I.player.idle) {
				startAnim.player(I.player.idle);
			}
			this.done = true;
		} else if (this.intent === INTENT.DEFEND) {
			enemyGainShield(this.getTotalDefendPower());
			this.done = true;
		} else if (this.intent === INTENT.BUFF) {
			if (this.type === FRAGMENT) this.gainEff(EFF.RESILIENCE, 3);
			this.finishAction();
		} else if (this.intent === INTENT.SUMMON) {
			if (game.enemies.length >= 6) {
				// RITUAL (sacrifice all minions to deal damage to the player equal to their combined health)
				let damage = 0;
				for (let index = game.enemies.length - 1; index >= 0; index--) {
					if (game.enemies[index].eff[ENEMY_EFF.SCRAP_HEAP]) {
						damage += game.enemies[index].health;
						game.enemies.splice(index, 1);
					}
				}
				const prevHealth = game.health;
				takeDamage(damage);
				if (game.health < prevHealth) startAnim.player(I.player.hit);
				// If the player survives the ritual, they get the easter egg "Warped Essence"
				if (game.health > 0 && !hasArtifact(203)) {
					getArtifact(203);
				}
			} else {
				// SUMMON (summon a small enemy that gives no points when defeated)
				const minion = new Enemy(SMALL_ENEMIES[get.area()], -0.5);
				minion.gainEff(ENEMY_EFF.SCRAP_HEAP);
				game.enemies.push(minion);
			}
			this.finishAction();
		} else {
			this.finishAction();
		}
	}
	/**
	 * Finishes the enemy's action.
	 */
	finishAction() {
		if (this.eff[ENEMY_EFF.COUNTDOWN]) {
			this.intent = this.intentHistory[this.eff[ENEMY_EFF.COUNTDOWN] - 1];
			this.intentHistory.push(this.intent);
			this.eff[ENEMY_EFF.COUNTDOWN]--;
			if (!this.eff[ENEMY_EFF.COUNTDOWN]) {
				this.eff[ENEMY_EFF.REWIND]++;
			}
		} else {
			this.intent = this.getIntent();
			this.intentHistory.push(this.intent);
			if (this.overrideIntent(INTENT.ATTACK, INTENT.SUMMON)) {
				if (this.type === FRAGMENT) {
					if (this.health <= this.maxHealth / 4 || this.eff[EFF.RESILIENCE] > 1) {
						this.intent = INTENT.DEFEND;
					} else {
						this.intent = chance(2/3) ? INTENT.BUFF : INTENT.DEFEND;
					}
				} else {
					this.intent = INTENT.DEFEND;
				}
				this.intentHistory.push(this.intent);
			} else if (this.overrideIntent(INTENT.DEFEND, INTENT.BUFF)) {
				if (this.type === SINGULARITY) {
					if (game.enemies.length > 2) {
						this.intent = INTENT.ATTACK;
					} else {
						this.intent = chance(1/3) ? INTENT.SUMMON : INTENT.ATTACK;
					}
				} else {
					this.intent = INTENT.ATTACK;
				}
				this.intentHistory.push(this.intent);
			}
		}
		if (game.turn !== TURN.ENEMY) {
			game.enemyNum = -1;
		} else if (game.enemyNum === game.enemies.length - 1) {
			game.enemyNum = -1;
			startTurn();
		} else {
			startAnim.enemy();
		}
		delete this.done;
	}
	/**
	 * Gets the enemy's intent.
	 * @param {boolean} first - whether this is the enemy's first intent. Defaults to `false`.
	 */
	getIntent(first = false) {
		if (this.type === SLIME.PUDDLE) {
			return INTENT.NOTHING;
		}
		if (this.type === FRAGMENT) {
			if (first) return INTENT.BUFF;
			if (chance(3/5)) {
				return INTENT.ATTACK;
			} else {
				if (this.health <= this.maxHealth / 4 || this.eff[EFF.RESILIENCE] > 1) return INTENT.DEFEND;
				return chance(2/3) ? INTENT.BUFF : INTENT.DEFEND;
			}
		}
		if (this.type === SINGULARITY) {
			if (first) return INTENT.SUMMON;
			if (this.health <= this.maxHealth / 4) {
				return chance(1/3) ? INTENT.SUMMON : INTENT.DEFEND;
			} else {
				if (chance(3/5)) return chance(1/3) ? INTENT.SUMMON : INTENT.ATTACK;
				return INTENT.DEFEND;
			}
		}
		if (first && hasArtifact(204)) return INTENT.DEFEND;
		return chance(3/5) ? INTENT.ATTACK : INTENT.DEFEND;
	}
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
		}
		if (location !== -1) {
			let item1 = this.intentHistory[location - 1];
			if (item1 === type || (type2 && item1 === type2)) {
				let item2 = this.intentHistory[location - 2];
				if (item2 === type || (type2 && item2 === type2)) {
					this.intentHistory.splice(this.intentHistory.length - 1);
					return true;
				}
			}
		}
		return false;
	}
	/**
	 * Has the enemy gain an effect.
	 * @param {number} type - the type of effect to gain.
	 * @param {number} amt - the amount of the effect to gain. Defaults to `1`.
	 */
	gainEff(type, amt = 1) {
		if (type === ENEMY_EFF.DUEL_TARGET) {
			game.enemies.forEach(enemy => {
				if (enemy !== this) delete enemy.eff[ENEMY_EFF.DUEL_TARGET];
			});
		}
		this.eff[type] = (this.eff[type] || 0) + amt;
	}
}

/**
 * Checks if an enemy should be visible.
 * @param {number} index - The index of the enemy.
 */
function isEnemyVisible(index) {
	if (!game.enemies[index]) return false;
	if (index !== game.enemyNum || game.enemies[index].transition) return true;
	const type = game.enemies[index].type;
	const intent = game.enemies[index].intent;
	if (type === SENTRY.BIG || type === SENTRY.SMALL || (type === SENTRY.PRIME && enemyAnim.prime[index] === -1)) return false;
	if (intent === INTENT.ATTACK) return !(type === SLIME.SMALL || (type === SLIME.STICKY && enemyAnim.action[0] < 8) || type === SENTRY.FLAMING);
	if (intent === INTENT.DEFEND) return !(type === SINGULARITY);
	return true;
}

/**
 * Gets the selection coordinates and name of an enemy.
 * @param {number} index - The index of the enemy.
 */
function getEnemyInfo(index) {
	const type = game.enemies[index]?.type;
	const primeAnim = Math.floor(enemyAnim.prime[index]);
	/** @type {[number, number, number, number] | null} */
	let coords = null;
	let name = ENEMY_NAME[type];
	if (type === SLIME.BIG) {
		coords = [5, 26, 54, 38];
	} else if (type === SLIME.SMALL) {
		coords = [19, 36, 26, 28];
	} else if (type === SLIME.PRIME) {
		const ratio = (primeAnim === -1 ? 1 : Math.max(primeAnim - 4, 0) / 7);
		const shiftX = Math.ceil(ratio * 5);
		const shiftY = Math.ceil(ratio * 20);
		coords = [5 - shiftX, 26 - shiftY, 54 + shiftX * 2, 38 + shiftY];
		if (primeAnim !== -1 && primeAnim < 5) {
			name = ENEMY_NAME[SLIME.BIG];
		}
	} else if (type === SLIME.STICKY) {
		coords = [-1, 36, 66, 36];
	} else if (type === SLIME.PUDDLE) {
		coords = [21, 52, 21, 12];
	} else if (type === FRAGMENT && (primeAnim === -1 || primeAnim >= 18)) {
		coords = [7, 7, 50, 57];
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
	}
	return {coords, name};
}

/**
 * Gets the coordinates of an enemy's intent.
 * @param {number} index - The index of the enemy.
 * @param {number} xPlus - Adds to the x-coordinate of the intent.
 * @param {number} yPlus - Adds to the y-coordinate of the intent.
 */
function getEnemyIntentPos(index, xPlus = 0, yPlus = 0) {
	return {
		x: enemyPos[index][0] + 16 + xPlus,
		y: Math.max(enemyPos[index][1] - 43 + (getEnemyInfo(index).coords?.[1] ?? NaN), -2) + yPlus,
	};
}
