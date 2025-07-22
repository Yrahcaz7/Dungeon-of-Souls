class EnemyAnimationSource {
	idle = [];
	prime = [];
	enemies = [];
	sync = 0;
	action = [0, ANIM.STARTING];
	actionData = [];
	/**
	 * Returns a new enemy animation source.
	 * @param {number} maxSize - the maximum size of the source.
	 * @param {(Enemy | number)[] | () => (Enemy | number)[]} enemies - the enemies the source will animate.
	 */
	constructor(maxSize, enemies) {
		for (let index = 0; index < maxSize; index++) {
			this.idle.push(index * 1.5 % 4);
			this.prime.push(0);
		};
		this.enemies = enemies;
	};
	/**
	 * Returns the enemies the source animates.
	 * @returns {(Enemy | number)[]}
	 */
	getEnemies() {
		return (this.enemies instanceof Function ? this.enemies() : this.enemies);
	};
	/**
	 * Progresses the animations of the enemies the source animates.
	 */
	progressAnimations() {
		const enemies = this.getEnemies();
		for (let index = 0; index < enemies.length; index++) {
			let enemy = enemies[index];
			if (!(enemy instanceof Object)) enemy = new Enemy(enemy, NaN);
			this.idle[index] += (Math.random() + 0.5) * 0.1;
			if (this.idle[index] >= 4) this.idle[index] -= 4;
			if (this.prime[index] != -1) {
				let limit = 0;
				if (enemy.type === SLIME.PRIME) {
					if (this.prime[index] >= 4) this.prime[index] += (Math.random() + 0.5) * 0.2;
					else this.prime[index] += (Math.random() + 0.5) * 0.1;
					limit = 12;
				} else if (enemy.type === FRAGMENT) {
					limit = 25;
					if (this.prime[index] >= 18) {
						this.prime[index] += 0.5;
						this.prime[index] = Math.round(this.prime[index] * 1e12) / 1e12;
					} else {
						this.prime[index]++;
					};
				} else if (enemy.type === SENTRY.PRIME) {
					limit = 9;
					if ((enemy.shield > 0) || (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD)) {
						this.prime[index] = -1;
					} else {
						this.prime[index] += (Math.random() + 0.5) * 0.2;
					};
				};
				if (this.prime[index] >= limit) {
					this.prime[index] = -1;
					this.idle[index] = 0;
				};
			};
		};
		this.sync++;
	};
	/**
	 * Draws an enemy that the source animates on the canvas.
	 * @param {number} x - the x-coordinate to draw the enemy at.
	 * @param {number} y - the y-coordinate to draw the enemy at.
	 * @param {number} index - the index of the enemy to draw.
	 * @param {boolean} noPrimeAnim - whether to skip the prime animation. Defaults to `false`.
	 */
	drawEnemy(x, y, index, noPrimeAnim = false) {
		let enemy = this.getEnemies()[index];
		if (!(enemy instanceof Object)) enemy = new Enemy(enemy, NaN);
		if (enemy.type === SLIME.BIG) {
			if (enemy.shield > 0) draw.imageSector(I.enemy.slime.big_defend, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
			else draw.imageSector(I.enemy.slime.big, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
		} else if (enemy.type === SLIME.SMALL) {
			if (enemy.shield > 0) draw.imageSector(I.enemy.slime.small_defend, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
			else draw.imageSector(I.enemy.slime.small, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
		} else if (enemy.type === SLIME.PRIME) {
			if (this.prime[index] == -1 || noPrimeAnim) {
				if (enemy.shield > 0) draw.imageSector(I.enemy.slime.prime_defend, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y + 1);
				else draw.imageSector(I.enemy.slime.prime, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y + 1);
			} else {
				if (enemy.shield > 0) draw.imageSector(I.enemy.slime.to_prime_defend, Math.floor(this.prime[index]) * 64, 0, 64, 64, x, y + 1);
				else draw.imageSector(I.enemy.slime.to_prime, Math.floor(this.prime[index]) * 64, 0, 64, 64, x, y + 1);
			};
		} else if (enemy.type === SLIME.STICKY) {
			if (enemy.shield > 0) draw.imageSector(I.enemy.slime.sticky_defend, Math.floor(this.idle[index]) * 66, 0, 66, 70, x - 1, y + 1);
			else draw.imageSector(I.enemy.slime.sticky, Math.floor(this.idle[index]) * 66, 0, 66, 70, x - 1, y + 1);
		} else if (enemy.type === FRAGMENT) {
			if (this.prime[index] == -1 || noPrimeAnim) {
				draw.imageSector(I.enemy.fragment.idle, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y + 1);
				if (index !== game.enemyNum || enemy.intent !== INTENT.ATTACK) {
					draw.clock(x + 2, y + 5, -1, 2 - Math.abs(Math.floor(this.idle[index]) - 2));
				};
			} else if (this.prime[index] >= 18) {
				draw.imageSector(I.enemy.fragment.open, Math.floor(this.prime[index] - 18) * 64, 0, 64, 64, x, y + 1);
				draw.clock(x + 2, y + 5, 6, 0, (this.prime[index] - 18) * 5);
			} else {
				x += (18 - this.prime[index]) * 8;
				draw.imageSector(I.enemy.fragment.roll, Math.floor(this.prime[index] % 4) * 64, 0, 64, 64, x, y + 1);
				draw.clock(x + 2, y + 5, (4 - Math.floor((this.prime[index] - 2) % 4)) * 3, (4 - Math.floor(this.prime[index] % 4)) * 15);
			};
		} else if (enemy.type === SENTRY.BIG) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.big_defend, Math.floor(this.idle[index] + 7) * 64, 0, 64, 64, x, y + 1);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.big_defend, Math.floor(7 - enemy.transition[0]) * 64, 0, 64, 64, x, y + 1);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 7) delete enemy.transition;
			} else {
				draw.imageSector(I.enemy.sentry.big, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y + 1);
			};
		} else if (enemy.type === SENTRY.SMALL) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.small_defend, Math.floor(this.idle[index] + 5) * 64, 0, 64, 64, x, y);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.small_defend, Math.floor(5 - enemy.transition[0]) * 64, 0, 64, 64, x, y);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 5) delete enemy.transition;
			} else {
				draw.imageSector(I.enemy.sentry.small, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
			};
		} else if (enemy.type === SENTRY.PRIME) {
			if (enemy.shield > 0) {
				draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(this.idle[index] + 9) * 64, 0, 64, 64, x, y);
			} else if (enemy.transition && enemy.transition[1] === TRANSITION.SHIELD) {
				draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(9 - enemy.transition[0]) * 64, 0, 64, 64, x, y);
				enemy.transition[0]++;
				if (enemy.transition[0] >= 9) delete enemy.transition;
			} else if (this.prime[index] == -1 || noPrimeAnim) {
				draw.imageSector(I.enemy.sentry.prime, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
			} else {
				draw.imageSector(I.enemy.sentry.to_prime, Math.floor(this.prime[index]) * 64, 0, 64, 64, x, y);
			};
		} else if (enemy.type === SINGULARITY) {
			if (Math.floor(this.idle[index]) == 1) y++;
			else if (Math.floor(this.idle[index]) == 3) y--;
			if (enemy.shield > 0) draw.image(I.enemy.singularity.defend, x, y);
			else draw.image(I.enemy.singularity.idle, x, y);
			draw.imageSector(I.enemy.singularity.orbs, Math.floor(this.sync % 24) * 64, 0, 64, 64, x, y);
			if (enemy.shield > 0 && index != game.enemyNum) draw.image(I.enemy.singularity.shield, x, y);
		};
	};
	/**
	 * Draws an acting enemy that the source animates on the canvas.
	 * @param {number} x - the x-coordinate to draw the enemy at.
	 * @param {number} y - the y-coordinate to draw the enemy at.
	 * @param {number} index - the index of the enemy to draw.
	 */
	drawEnemyActing(x, y, index) {
		const type = game.enemies[index].type;
		const intent = game.enemies[index].intent;
		if (intent === INTENT.ATTACK) {
			if (type === SLIME.BIG) {
				if (!this.actionData.length) this.actionData = [
					x - (isDefending(playerAnim[1]) ? 78 : 60) - 16,
					y - (isDefending(playerAnim[1]) ? 1 : -6) - 43,
				];
				const phase = Math.cbrt(this.action[0] / 10) ** 2;
				const posX = Math.round(this.actionData[0] * phase);
				const posY = Math.round(this.actionData[1] * phase);
				if (this.action[1] === ANIM.ENDING) {
					game.enemyStage = ANIM.ENDING;
				} else if (game.enemyStage === ANIM.MIDDLE) {
					draw.imageSector(I.enemy.slime.big_attack, 4 * 7, 0, 7, 7, x + 16 - posX, y + 43 - posY);
					this.action[1] = ANIM.ENDING;
					game.enemyStage = ANIM.PENDING;
				} else {
					draw.imageSector(I.enemy.slime.big_attack, (this.action[0] % 4) * 7, 0, 7, 7, x + 16 - posX, y + 43 - posY);
					this.action[0]++;
					game.enemyStage = ANIM.PENDING;
					if (this.action[0] >= 11) {
						this.action[0] = 11;
						game.enemyStage = ANIM.MIDDLE;
					};
				};
			} else if (type === SLIME.SMALL) {
				if (!this.actionData.length) this.actionData = [
					x - (isDefending(playerAnim[1]) ? 81 : 62) - 64,
					y - (isDefending(playerAnim[1]) ? 61 : 57),
				];
				if (this.action[0] >= 10) {
					const phase = ((this.action[0] - 9) / 10);
					const posX = Math.round(this.actionData[0] * phase);
					const posY = Math.round(this.actionData[1] * phase);
					draw.imageSector(I.enemy.slime.small_attack, 9 * 128, 0, 128, 64, x - 64 - posX, y - posY);
				} else {
					draw.imageSector(I.enemy.slime.small_attack, Math.floor(this.action[0]) * 128, 0, 128, 64, x - 64, y);
				};
				if (this.action[1] === ANIM.STARTING) this.action[0]++;
				else if (this.action[1] === ANIM.ENDING) this.action[0]--;
				if (this.action[0] >= 20) {
					this.action[0] = 18;
					this.action[1] = ANIM.ENDING;
					game.enemyStage = ANIM.MIDDLE;
				} else if (this.action[0] < 0) {
					this.idle[index] = 0;
					game.enemyStage = ANIM.ENDING;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SLIME.PRIME) {
				if (!this.actionData.length) this.actionData = [x - (isDefending(playerAnim[1]) ? 90 : 71) - 40];
				if (this.action[0] >= 4) {
					const phase = ((this.action[0] - 4) / 15);
					const posX = Math.round(this.actionData[0] * phase);
					draw.imageSector(I.enemy.slime.prime_attack, 4 * 36, 0, 36, 18, x - 40 - posX, 80);
				} else {
					draw.imageSector(I.enemy.slime.prime_attack, Math.floor(this.action[0]) * 36, 0, 36, 18, x - 40, 80);
				};
				this.action[0]++;
				if (game.enemyStage === ANIM.MIDDLE) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] >= 19) {
					this.action[0] = 19;
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SLIME.STICKY) {
				if (!this.actionData.length) this.actionData = [
					x - (isDefending(playerAnim[1]) ? 70 : 50) - 10,
					y - (isDefending(playerAnim[1]) ? -9 : -16) - 48,
				];
				const phase = Math.cbrt((this.action[0] - 6) / 10) ** 2;
				const posX = x - Math.round(this.actionData[0] * phase) + 10;
				const posY = y - Math.round(this.actionData[1] * phase) + 48;
				if (this.action[1] === ANIM.ENDING) {
					this.idle[index] = 0;
					game.enemyStage = ANIM.ENDING;
				} else if (game.enemyStage === ANIM.MIDDLE) {
					draw.imageSector(I.enemy.slime.big_attack, 4 * 7, 0, 7, 7, posX, posY);
					this.action[1] = ANIM.ENDING;
					game.enemyStage = ANIM.PENDING;
				} else {
					if (this.action[0] >= 7) {
						draw.imageSector(I.enemy.slime.big_attack, (this.action[0] % 4) * 7, 0, 7, 7, posX, posY);
					};
					if (this.action[0] <= 7) {
						draw.imageSector(I.enemy.slime.sticky_attack, Math.floor(this.action[0]) * 66, 0, 66, 70, x - 1, y + 1);
					};
					this.action[0]++;
					game.enemyStage = ANIM.PENDING;
					if (this.action[0] >= 16) {
						this.action[0] = 16;
						game.enemyStage = ANIM.MIDDLE;
					};
				};
			} else if (type === FRAGMENT && this.prime[index] == -1) {
				if (this.action[0] >= 19) {
					draw.clock(x + 2, y + 5, -1, 0);
					ctx.globalAlpha = (23 - this.action[0]) / 5;
					draw.imageSector(I.enemy.fragment.attack, 13 * 800, 0, 800, 400, x - 400 + 32, y - 200 + 32 + 1);
				} else if (this.action[0] >= 5) {
					draw.imageSector(I.enemy.fragment.attack, Math.floor(this.action[0] - 5) * 800, 0, 800, 400, x - 400 + 32, y - 200 + 32 + 1);
				} else {
					draw.clock(x + 2, y + 5, -1, Math.floor(this.action[0] + 1) * 15);
					ctx.globalAlpha = this.action[0] / 5;
					draw.imageSector(I.enemy.fragment.attack, 0, 0, 800, 400, x - 400 + 32, y - 200 + 32 + 1);
				};
				ctx.globalAlpha = 1;
				this.action[0]++;
				if (this.action[0] >= 24) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] == 18) {
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.BIG) {
				if (!this.actionData.length) this.actionData = [
					(isDefending(playerAnim[1]) ? 92 : 72),
					(isDefending(playerAnim[1]) ? 87 : 82),
				];
				draw.imageSector(I.enemy.sentry.big_attack, Math.floor(this.action[0]) * 92, 0, 92, 70, x - 14, y - 1);
				if (this.action[0] >= 4) {
					const start = [x + 17, y + 16];
					const end = this.actionData;
					draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
				};
				if (this.action[1] === ANIM.STARTING) this.action[0]++;
				else if (this.action[1] === ANIM.ENDING) this.action[0]--;
				if (this.action[0] >= 5) {
					this.action[0] = 4;
					this.action[1] = ANIM.ENDING;
				} else if (this.action[0] == 3 && this.action[1] === ANIM.ENDING) {
					game.enemyStage = ANIM.MIDDLE;
				} else if (this.action[0] < 0) {
					this.idle[index] = 0;
					game.enemyStage = ANIM.ENDING;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.SMALL) {
				if (!this.actionData.length) this.actionData = [
					(isDefending(playerAnim[1]) ? 92 : 72),
					(isDefending(playerAnim[1]) ? 87 : 82),
				];
				draw.imageSector(I.enemy.sentry.small_attack, Math.floor(this.action[0]) * 64, 0, 64, 64, x, y);
				if (this.action[0] >= 11) {
					const start = [x + 14, y + 30];
					const end = this.actionData;
					draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
				};
				if (this.action[1] === ANIM.STARTING) this.action[0]++;
				else if (this.action[1] === ANIM.ENDING) this.action[0]--;
				if (this.action[0] >= 12) {
					this.action[0] = 11;
					this.action[1] = ANIM.ENDING;
				} else if (this.action[0] == 10 && this.action[1] === ANIM.ENDING) {
					game.enemyStage = ANIM.MIDDLE;
				} else if (this.action[0] < 0) {
					this.idle[index] = 0;
					game.enemyStage = ANIM.ENDING;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.PRIME && this.prime[index] == -1) {
				if (!this.actionData.length) this.actionData = [
					(isDefending(playerAnim[1]) ? 92 : 72),
					(isDefending(playerAnim[1]) ? 87 : 82),
				];
				draw.imageSector(I.enemy.sentry.prime_attack, Math.floor(this.action[0]) * 64, 0, 64, 86, x, y - 22);
				if (this.action[0] >= 12) {
					let start = [x + 12, y + 29];
					const end = this.actionData;
					draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
					start[1] += 7;
					draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 2);
				};
				if (this.action[1] === ANIM.STARTING) this.action[0]++;
				else if (this.action[1] === ANIM.ENDING) this.action[0]--;
				if (this.action[0] >= 13) {
					this.action[0] = 12;
					this.action[1] = ANIM.ENDING;
				} else if (this.action[0] == 11 && this.action[1] === ANIM.ENDING) {
					game.enemyStage = ANIM.MIDDLE;
				} else if (this.action[0] < 0) {
					this.idle[index] = 0;
					game.enemyStage = ANIM.ENDING;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SINGULARITY) {
				if (!this.actionData.length) this.actionData = [
					Math.floor(Math.random() * 4),
					(isDefending(playerAnim[1]) ? (isCrouching(playerAnim[1]) ? 0 : 1) : 2),
				];
				pos = [
					[133 + this.actionData[0] * 17, 88],
					[155 + this.actionData[0] * 17, 79],
					[142 + this.actionData[0] * 17, 70],
				][this.actionData[1]];
				draw.imageSector(I.enemy.singularity.attack, Math.floor(this.action[0]) * 68 + (this.actionData[0] % 2 + (this.actionData[1] % 2 == 1 ? 2 : 0)) * 17, 0, 17, 55, x, y);
				draw.imageSector(I.enemy.singularity.attack_overlay, Math.floor(this.action[0]) * 34 + (this.actionData[1] % 2 == 1 ? 17 : 0), 0, 17, 55, x, y);
				if (this.action[0] >= 8) {
					const start = [x + 7, y + 5];
					const end = [[94, 95], [92, 87], [72, 82]][this.actionData[1]];
					draw.curvedLine(start[0], start[1], (start[0] + end[0]) / 2, start[1], end[0], end[1], "#f00", 4);
				};
				if (this.action[1] === ANIM.STARTING) this.action[0]++;
				else if (this.action[1] === ANIM.ENDING) this.action[0]--;
				if (this.action[0] >= 9) {
					this.action[0] = 8;
					this.action[1] = ANIM.ENDING;
				} else if (this.action[0] == 7 && this.action[1] === ANIM.ENDING) {
					game.enemyStage = ANIM.MIDDLE;
				} else if (this.action[0] < 0) {
					game.enemyStage = ANIM.ENDING;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			};
		} else if (intent === INTENT.DEFEND) {
			if (type === SLIME.BIG || type === SLIME.SMALL || type === SLIME.PRIME || type === SLIME.STICKY || type === SINGULARITY) {
				if (type === SLIME.PRIME) {
					ctx.globalAlpha = this.action[0] / 15;
					if (this.prime[index] == -1) {
						draw.imageSector(I.enemy.slime.prime_defend, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y + 1);
					} else {
						draw.imageSector(I.enemy.slime.to_prime_defend, Math.floor(this.prime[index]) * 64, 0, 64, 64, x, y + 1);
					};
				} else if (type === SLIME.STICKY) {
					ctx.globalAlpha = this.action[0] / 15;
					draw.imageSector(I.enemy.slime.sticky_defend, Math.floor(this.idle[index]) * 66, 0, 66, 70, x - 1, y + 1);
				} else if (type === SINGULARITY) {
					if (Math.floor(this.idle[index]) == 1) y++;
					else if (Math.floor(this.idle[index]) == 3) y--;
					draw.image(I.enemy.singularity.idle, x, y);
					ctx.globalAlpha = this.action[0] / 15;
					draw.image(I.enemy.singularity.defend, x, y);
					draw.imageSector(I.enemy.singularity.orbs, Math.floor(this.sync % 24) * 64, 0, 64, 64, x, y);
					draw.image(I.enemy.singularity.shield, x, y);
				} else {
					ctx.globalAlpha = this.action[0] / 15;
					let img = I.enemy.slime.big_defend;
					if (type === SLIME.SMALL) img = I.enemy.slime.small_defend;
					draw.imageSector(img, Math.floor(this.idle[index]) * 64, 0, 64, 64, x, y);
				};
				ctx.globalAlpha = 1;
				this.action[0]++;
				if (game.enemyStage === ANIM.MIDDLE) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] >= 15) {
					this.action[0] = 15;
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.BIG) {
				draw.imageSector(I.enemy.sentry.big_defend, Math.floor(this.action[0]) * 64, 0, 64, 64, x, y + 1);
				this.action[0]++;
				if (game.enemyStage === ANIM.MIDDLE) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] >= 7) {
					this.action[0] = 7;
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.SMALL) {
				draw.imageSector(I.enemy.sentry.small_defend, Math.floor(this.action[0]) * 64, 0, 64, 64, x, y);
				this.action[0]++;
				if (game.enemyStage === ANIM.MIDDLE) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] >= 5) {
					this.action[0] = 5;
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			} else if (type === SENTRY.PRIME && this.prime[index] == -1) {
				draw.imageSector(I.enemy.sentry.prime_defend, Math.floor(this.action[0]) * 64, 0, 64, 64, x, y);
				this.action[0]++;
				if (game.enemyStage === ANIM.MIDDLE) {
					game.enemyStage = ANIM.ENDING;
				} else if (this.action[0] >= 9) {
					this.action[0] = 9;
					game.enemyStage = ANIM.MIDDLE;
				} else {
					game.enemyStage = ANIM.PENDING;
				};
			};
		};
	};
};
