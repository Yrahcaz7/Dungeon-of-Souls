class EnemyAnimationSource {
	enemies = [];
	idle = [];
	prime = [];
	sync = 0;
	action = [0, ANIM.STARTING];
	actionData = [];

	/**
	 * Returns a new enemy animation source.
	 * @param {number} maxSize - the maximum size of the source.
	 * @param {number[] | () => number[]} enemies - the enemies the source will animate.
	 */
	constructor(maxSize, enemies) {
		for (let index = 0; index < maxSize; index++) {
			this.idle.push(index * 1.5 % 4);
			this.prime.push(0);
		};
		this.enemies = enemies;
	};
};
