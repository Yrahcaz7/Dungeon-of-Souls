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
		return (typeof this.enemies == "function" ? this.enemies() : this.enemies);
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
};
