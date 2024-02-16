const SLIME_CROWD = 1300, SLIME_AMBUSH = 1301;

/**
 * Starts a battle from an event.
 * @param {SLIME_CROWD | SLIME_AMBUSH} type - the type of battle.
 * @param {number} num - the number of enemies.
 */
function startEventBattle(type, num) {
	if (num > 6) num = 6;
	const place = game.location.split(", ");
	primeAnim = 0;
	game.traveled.push(+place[1]);
	if (type === SLIME_CROWD) {
		for (let index = 0; index < num; index++) {
			game.enemies.push(new Enemy(SLIME.SMALL, 1 - index / 10 - (num - 1) / 20));
		};
	} else if (type === SLIME_AMBUSH) {
		game.enemies = [new Enemy(SLIME.BIG)];
	};
	enterBattle();
};

const EVENTS = {
	any: [{
		0: [() => {}, "You see a crowd of enemies in direction you are travelling.\nNone of the enemies seem to have noticed you.\nYou can try to charge through the crowd or sneak past them.", ["charge through", 10], ["sneak past", 20]],
		10: [() => {takeDamage(10)}, "You tried to charge through as fast as you could, but the enemies hit you for 10 damage!\nAdditionally, one enemy was particularly agile and caught up to you!", ["Battle Start!", 11]],
		11: [() => {startEventBattle(SLIME_CROWD, 1)}, ""],
		20: [() => {game.eff.weakness += 5}, "You tried to sneak past as best as you could, but the enemies spotted you!\nYou have a hard time getting up after crawling around for so long as well...", ["Battle Start!", 21]],
		21: [() => {startEventBattle(SLIME_CROWD, randomInt(2, 3))}, ""],
	}],
	1: [{

	}],
};
