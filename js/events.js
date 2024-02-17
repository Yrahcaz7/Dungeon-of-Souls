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
			game.enemies.push(new Enemy(SLIME.SMALL, 1 - (index + num) / 10));
		};
	} else if (type === SLIME_AMBUSH) {
		game.enemies = [new Enemy(SLIME.BIG, 1.1)];
	};
	enterBattle();
};

const EVENTS = {
	any: [{
		0: [() => {}, "You see a crowd of enemies up ahead.\nNone of the enemies seem to have noticed you.\nHow will you get past them?", ["charge through", 10], ["sneak past", 20], ["fight them fairly", 30]],
		10: [() => {takeDamage(8)}, "You tried to charge through as fast as you could,\nbut the enemies hit you for 8 damage!\nAlso, one enemy was particularly agile.\nYou will have to fight it off.", ["Battle Start!", 11]],
		11: [() => {startEventBattle(SLIME_CROWD, 1)}],
		20: [() => {game.eff.weakness = 1}, "You tried to sneak past as best as you could,\nbut the enemies still spotted you!\nYou have also have hard time getting up.\nYou were crawling around for a while...", ["Battle Start!", 21]],
		21: [() => {startEventBattle(SLIME_CROWD, randomInt(2, 3))}],
		30: [() => {}, "You vaugely feel something long forgotten...\nYou want to fight these enemies fair and square.", ["Battle Start!", 21]],
	}],
	1: [{
		0: [() => {}, "You approach some strange-looking ruins.\nYou see light coming from within.", ["enter the ruins", 100], ["walk around the ruins", 200]],
		100: [() => {}, "You approach the source of the light.\nThis light seems oddly familiar...", ["walk closer", 101]],
		101: [() => {}, "You find the source of the light.\nIt is a block that looks otherworldy.\nThe block is emitting light on one side.\nThe light seems to be forming numbers...", ["read the numbers", 102]],
		102: [() => {}, () => {
			let now = new Date(), time = [now.getHours(), now.getMinutes(), now.getSeconds()];
			if (time[0] >= 12) time[0] = time[0] - 12;
			time[0] = 12 - time[0];
			time[1] = 60 - time[1];
			time[2] = 60 - time[2];
			if (time[0] < 10) time[0] = "0" + time[0];
			if (time[1] < 10) time[1] = "0" + time[1];
			if (time[2] < 10) time[2] = "0" + time[2];
			return "The numbers on the block are " + time[0] + ":" + time[1] + ":" + time[2] + ".\nThe numbers seem to be changing over time...\nYou cannot understand how this works.";
		}, ["leave the ruins", 110], ["investigate more", 120]],
		110: [() => {}, "Not wanting to waste even more time,\nyou turn around to leave the ruins...\nAnd you see an enemy right next to you!", ["Battle Start!", 111]],
		111: [() => {startEventBattle(SLIME_AMBUSH)}],
		120: [() => {}, 'There seems to be something written on the ground...\nBut you can only make out the word "until".\nThe rest is completely unreadable.\nYou also see gold coins lying around.', ["leave the ruins", 110], ["pocket the coins", 121]],
		121: [() => {
			game.gold += 20;
			takeDamage(10);
		}, "You greedily pocket all 20 gold coins.\nSuddenly, an enemy hits you from behind!\nYou took a staggering 10 damage!", ["Battle Start!", 111]],
		200: [() => {}, "You decide not to waste time here.\nAs such, you start walking around the ruins.\nYou then see an enemy in the distance.", ["fight the enemy", 210], ["avoid the enemy", 220]],
		210: [() => {
			game.shield = 10;
			game.eff.reinforces = 1;
		}, "You charge toward the enemy, shield at the ready.", ["Battle Start!", 211]],
		211: [() => {startEventBattle(SLIME_AMBUSH)}],
		220: [() => {}, "You decide to be wary and avoid the enemy.", ["creep further", 221]],
		221: [() => {
			game.select = [MAP, 0];
			game.state = STATE.EVENT_FIN;
			pushPopup("go", "go to the map!");
		}, "You sucessfully got past the enemy!"],
	}],
};

/**
 * Gets the current event.
 * @returns {Array}
 */
function getCurrentEvent() {
	if (game.state !== STATE.EVENT) return [];
	if (game.room[3] < EVENTS.any.length) return EVENTS.any[game.room[3]][game.turn - 10000] || [];
	return EVENTS[Math.floor(game.floor / 10) + 1][game.room[3] - EVENTS.any.length][game.turn - 10000] || [];
};
