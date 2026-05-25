/*  Dungeon of Souls
 *  Copyright (C) 2026 Yrahcaz7
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

/**
 * Makes the player take damage.
 * @param {number} amount - the amount of damage to take.
 * @param {boolean} attack - whether the damage is considered an attack. Defaults to `false`.
 */
function logEventDamage(amount, attack = false) {
	if (isNaN(amount)) throwError(`"${amount}" is not of type "number".`, TypeError);
	// multiply damage
	if (attack) amount = Math.ceil(amount * get.takeDamageMult(-1));
	// take damage
	if (amount < game.shield) {
		game.shield -= amount;
		game.eventLog[EVENT_LOG.DAMAGE] = 0;
	} else {
		amount -= game.shield;
		game.shield = 0;
		game.health -= amount;
		game.eventLog[EVENT_LOG.DAMAGE] = amount;
	};
};

/**
 * Returns a logged event value.
 * @param {number} type - the type of logged event to return.
 */
function getLoggedEvent(type) {
	return game.eventLog[type];
};

/**
 * Starts a battle from an event.
 * @param {number} type - the type of battle.
 * @param {number} num - the number of enemies of a crowd, or the power of an ambush.
 */
function startEventBattle(type, num = 1) {
	enemyAnim.prime = [0, 0, 0, 0, 0, 0];
	if (type === BATTLE.CROWD) {
		if (num > 6) num = 6;
		let enemy = SMALL_ENEMIES[get.area()];
		for (let index = 0; index < num; index++) {
			game.enemies.push(new Enemy(enemy, 1 - (index + num) / (5 - game.difficulty * 2)));
		};
	} else if (type === BATTLE.AMBUSH) {
		let enemy = BIG_ENEMIES[get.area()];
		game.enemies = [new Enemy(enemy, num)];
	};
	enterBattle();
};

/**
 * Finishes an event with no battle or rewards.
 */
function finishEvent() {
	game.select = [S.ARTIFACTS, 0];
	game.state = STATE.EVENT_FIN;
	activateArtifacts(FUNC.FLOOR_CLEAR);
	mapPopup();
};

/**
 * Performs a screen shake animation.
 * @param {number} strength - the strength of the initial shake. Cannot exceed `1`.
 * @param {number} duration - the duration of the animation in seconds.
 * @param {number} angle - the angle of the initial shake. Defaults to a random angle.
 */
const doScreenShake = (() => {
	const SCREEN_SHAKE_MAX_DIST = 8;
	const SCREEN_SHAKE_ANGLE_VARIANCE = Math.PI / 2;
	const SCREEN_SHAKE_TIME = 0.05;

	let screenShakeAnimation = null;

	return (strength = 0, duration = 0, angle = Math.random() * 2 * Math.PI) => {
		if (strength <= 0 || duration <= 0 || !global.options[OPTION.SCREEN_SHAKE]) return;
		strength = Math.min(strength, 1);
		let animation = [];
		if (screenShakeAnimation instanceof Animation && screenShakeAnimation.playState !== "finished") {
			const transform = document.defaultView.getComputedStyle(document.body).transform.split(/\(|, |\)/g);
			animation.push({transform: "translate(" + transform[transform.length - 3] + "px, " + transform[transform.length - 2] + "px)"});
			screenShakeAnimation.cancel();
		} else {
			animation.push({transform: "translate(0px, 0px)"});
		};
		let decayProgress = 0;
		while (true) {
			const shakeX = Math.cos(angle) * strength * SCREEN_SHAKE_MAX_DIST;
			const shakeY = Math.sin(angle) * strength * SCREEN_SHAKE_MAX_DIST;
			animation.push({transform: "translate(" + shakeX.toFixed(3) + "px, " + shakeY.toFixed(3) + "px)"});
			if (strength * SCREEN_SHAKE_MAX_DIST < 0.0005) break;
			angle = (Math.random() * 2 - 1) * SCREEN_SHAKE_ANGLE_VARIANCE - angle;
			decayProgress += SCREEN_SHAKE_TIME / duration;
			strength = Math.max(strength * (1 - decayProgress ** 2), 0);
		};
		screenShakeAnimation = document.body.animate(animation, duration * 1000);
	};
})();

const EVENTS = {
	any: [{
		0: [null, "You see a crowd of enemies up ahead. None of them seem to have noticed you yet. How will you get past them?", ["Charge through", () => chance() ? 20 : 10], ["Sneak past", () => chance(1/4) ? 40 : 30], ["Fight them fairly", 50]],
		10: [() => logEventDamage(8, true), () => "You tried to charge through as fast as you could, but the enemies hit you for " + getLoggedEvent(EVENT_LOG.DAMAGE) + " damage! Also, one enemy was particularly agile. You will have to fight it off.", ["Battle Start!", 11]],
		11: [() => startEventBattle(BATTLE.CROWD, 1)],
		20: [() => logEventDamage(4, true), () => "You successfully got past the enemies! However, you took " + getLoggedEvent(EVENT_LOG.DAMAGE) + " damage while doing so.", ["Get a move on", 21]],
		21: [finishEvent],
		30: [() => gainEff(EFF.WEAKNESS), "You tried to sneak past as best as you could, but the enemies still spotted you! You also have hard time getting up. You were crawling around for a while, after all...", ["Battle Start!", 31]],
		31: [() => {
			if (game.floor >= 5) startEventBattle(BATTLE.CROWD, randomInt(2, 3));
			else startEventBattle(BATTLE.CROWD, 2);
		}],
		40: [null, "You successfully got past the enemies! You must have been very lucky. Stealth isn't your strong suit.", ["Get a move on", 21]],
		50: [() => getArtifact(206), "You vaugely feel something long forgotten... You want to fight these enemies fair and square.", ["Battle Start!", 31]],
	}, {
		0: [null, "You see a chasm in the ground ahead. It is clearly blocking your way forward. What do you do?", ["Navigate around the chasm", 100], ["Jump across the chasm", 200], ["Climb down the side", 300]],
		100: [() => gainEff(EFF.WEAKNESS, 10), "You begin navigating around the chasm. It is very exhausting. You see an enemy in the way. Will you fight or go back?", ["Fight the enemy", 110], ["Go back", 120]],
		110: [null, "You ready yourself and charge at the enemy.", ["Battle Start!", 111]],
		111: [() => startEventBattle(BATTLE.AMBUSH)],
		120: [null, "You are back at the front of the chasm. What will you do?", ["Jump across the chasm", 200], ["Climb down the side", 300]],
		200: [() => {
			logEventDamage(5);
			doScreenShake(0.5, 1, Math.PI / 2);
		}, () => "You fail and fall into the chasm. Luckily, the chasm is not that deep. You only took " + getLoggedEvent(EVENT_LOG.DAMAGE) + " damage. What do you do now?", ["Look around", 400], ["Climb up", 500]],
		300: [null, "You climb down into the chasm unexpectedly easily. However, going back up may be harder. What will you do?", ["Look around", 400], ["Climb up", 500]],
		400: [null, "You find a platform with two giant cups on it. The left cup is filled with purple ooze. The right cup is filled with glowing water. Clearly one is all you can drink. You would vomit if you had both.", ["Look closer at left cup", 410], ["Look closer at right cup", 420], ["Forget this, climb back up", 500]],
		410: [null, 'There is some text engraved on the cup: "ENVIGORATING BUT DANGEROUS. CONSUME AT YOUR OWN RISK."', ["Drink from the left cup", () => hasArtifact(103) ? 430 : 411], ["Look closer at right cup", 420], ["Forget this, climb back up", 500]],
		411: [() => getArtifact(103), "A foul energy courses through your veins. You can now wield Corrosion.", ["Get out of this chasm already", 412]],
		412: [null, "Just as you start to climb out, you spot something very shiny. You can't seem to resist its allure...", ["Pocket the shiny thing", 413]],
		413: [() => game.gold += 10, "You pocket the strange lump of gold. It's probably worth around 10 gold coins. You see another shiny thing nearby...", ["Go get the shiny thing", 414], ["Really, get out of here already!", 500]],
		414: [() => game.gold = 0, "As you reach out to grab the shining rock, a foul energy erupts from within you. Dark tendrils spread outwards, greedily devouring all of your gold. You hear an ominous crackle emerge from yourself. Just what exactly did you drink?", ["GET OUT OF HERE!", 500]],
		420: [null, 'There is some text engraved on the cup: "PURIFIES THE SOUL REMARKABLY. ONLY FOR THE WORTHY."', ["Drink from the right cup", 421], ["Look closer at left cup", 410], ["Forget this, climb back up", 500]],
		421: [null, "A powerful energy surges within you...", ["Utilize this energy", 422]],
		422: [() => {
			game.select = [S.REWARDS, 0];
			game.state = STATE.EVENT_FIN;
			game.rewards = [[REWARD.PURIFIER], [REWARD.FINISH]];
			activateArtifacts(FUNC.FLOOR_CLEAR);
		}],
		430: [() => game.artifacts = game.artifacts.map(id => id === 103 ? 205 : id), "A foul energy courses through your veins. You feel the Corrosion within you grow...", ["Get out of this chasm already", 412]],
		500: [null, "After some time, you manage to climb out. You set off again towards your destination.", ["Get a move on", 501]],
		501: [finishEvent],
	}, {
		0: [null, "You find a very ominous altar. It is pitch black except some dried blood stains. There is some engraved text on the base. What do you do?", ["Read the text", 100], ["Push it over", 200], ["Ignore it", 300]],
		100: [null, 'The engraved text reads: "OFFER YOUR BLOOD, AND YOU SHALL BE BLESSED. LET THE RAGE SIMMERING IN YOUR SOUL BREAK FREE." Will you offer your blood?', ["Offer 6 health", 110], ["Offer 25 health", () => hasArtifact(101) ? 130 : 120], ["Cancel", 0]],
		110: [() => logEventDamage(6), "You cut yourself and bleed onto the altar. Suddenly, an enemy pops out from behind some rocks! It starts hastily running away, quickly vanishing from sight.", ["Get a move on", 111]],
		111: [finishEvent],
		120: [() => logEventDamage(25), "You brutally stab yourself and bleed onto the altar. Seemingly in response, a hidden compartment in the altar opens. Inside is a brilliant red gem. Just holding it makes you feel stronger.", ["Take the gem", 121]],
		121: [() => getArtifact(101), "After pocketing the gem, you stumble around lightheadedly for a bit. Maybe you should be more careful with your blood from now on.", ["Get a move on", 111]],
		130: [() => game.health += 6, "You brutally stab yourself and bleed onto the altar. Your Gem of Rage glows ever brighter... Suddenly, your blood starts to trickle back into your wound. The blood stains become liquid again and enter as well. You gain 6 health, but you feel rather queasy...", ["Get a move on", 111]],
		200: [null, "You have a bad feeling about this...", ["Do it anyway", 201], ["Cancel", 0]],
		201: [null, "You topple the altar, and a dark cloud spreads... You feel sluggish, and you can't see ahead of you.", ["Run out of the cloud", 202]],
		202: [null, "Blindly running ahead, you smack into an enemy.", ["Battle Start!", 203]],
		203: [() => {
			gainEff(EFF.WEAKNESS, 2);
			startEventBattle(BATTLE.AMBUSH);
			game.enemies[0].gainEff(ENEMY_EFF.SHROUD, 6);
		}],
		300: [null, "You decide to ignore the altar and continue on. However, an enemy suddenly jumps out in front of you! It must have been hiding somewhere nearby.", ["Battle Start!", 301]],
		301: [() => startEventBattle(BATTLE.AMBUSH)],
	}],
	0: [{
		0: [null, "You approach some strange-looking ruins. You see light coming from within.", ["Enter the ruins", 100], ["Walk around the ruins", 200]],
		100: [null, "You approach the source of the light. This light seems oddly familiar...", ["Walk closer", 101]],
		101: [null, "You find the source of the light. It is a gray cube that looks oddly out of place. The block is emitting light on one side, which seems to be forming numbers.", ["Read the numbers", 102]],
		102: [null, () => {
			const now = new Date();
			let time = [now.getHours(), now.getMinutes(), now.getSeconds()];
			if (time[0] >= 12) time[0] = time[0] - 12;
			time[0] = 11 - time[0];
			time[1] = 59 - time[1];
			time[2] = 59 - time[2];
			if (time[0] < 10) time[0] = "0" + time[0];
			if (time[1] < 10) time[1] = "0" + time[1];
			if (time[2] < 10) time[2] = "0" + time[2];
			return `The numbers on the block are "${time[0]}:${time[1]}:${time[2]}". The numbers seem to be changing over time... You can't understand how this works.`;
		}, ["Leave the ruins", 110], ["Investigate more", 120]],
		110: [null, "Not wanting to waste even more time, you turn around to leave the ruins... And you see an enemy right next to you!", ["Battle Start!", 111]],
		111: [() => startEventBattle(BATTLE.AMBUSH, 1.1)],
		120: [null, 'There seems to be something written on the ground, but you can only make out the word "difficulty". The rest is completely unreadable. You also see gold coins lying around.', ["Leave the ruins", 110], ["Pocket the coins", 121]],
		121: [() => {
			game.gold += 30;
			logEventDamage(10, true);
		}, () => "You greedily pocket all 30 gold coins. Suddenly, an enemy hits you from behind! You took a staggering " + getLoggedEvent(EVENT_LOG.DAMAGE) + " damage!", ["Battle Start!", 111]],
		200: [null, "You decide not to waste time here. As such, you start walking around the ruins. You then see an enemy in the distance.", ["Fight the enemy", 210], ["Avoid the enemy", 220]],
		210: [() => {
			playerGainShield(10, 0);
			gainEff(EFF.REINFORCE);
		}, "You charge toward the enemy, shield at the ready.", ["Battle Start!", 111]],
		220: [null, "You decide to be wary and avoid the enemy.", ["Creep further", 221]],
		221: [null, "You sucessfully got past the enemy!", ["Get a move on", 222]],
		222: [finishEvent],
	}],
	1: [{
		0: [null, "As you walk down a rather spacious hallway, you spot a strange gray box to the side. On one of its faces, there is a square hole that seems to be glowing. Do you investigate it?", ["Yes", 100], ["No", 200]],
		100: [null, `Upon closer inspection, you see glowing words inside the hole. It reads: "Deposit physical currency here. Unregistered users will recieve a new device." You're not quite sure what it means, but maybe giving it some gold will do something?`, ["Deposit 100 gold", 110], ["Deposit 400 gold", 120], ["Don't deposit anything", 130]],
		110: [() => {
			game.gold -= 100;
			getArtifact(207);
		}, `After throwing in a decent amount of gold, a strange object fell out of the hole. It is probably the "Device" that the text spoke of. The "Device" has many glowing words on it, some of them unfamiliar. The words seem to form a complicated poem... You'll contemplate it later.`, ["Get a move on", 111]],
		111: [finishEvent],
		120: [() => {
			game.gold -= 400;
			game.health += 10;
			getArtifact(207);
		}, "You cram a bunch of gold into the hole, but all of it mysteriously dissapears. Only two objects fall out of the hole: A bottle and a glowing slab. Recognizing the red liquid in the bottle, you quickly chug it down. As soon as you do so, your fatigue begins to wash away.", ["Inspect the slab", 121]],
		121: [null, `The mysterious slab is probably that "Device" mentioned by the text. Picking it up, you realize the glow comes from many individual words on its surface. The words seem to form a complicated poem... You'll have to contemplate it later.`, ["Get a move on", 111]],
		130: [null, "You decide that it's probably not worth the gold and continue onward.", ["Get a move on", 111]],
		200: [null, "You decide that it's not worth your time and continue onward.", ["Get a move on", 111]],
	}],
};

/**
 * Gets the current event.
 * @returns {Array}
 */
function getCurrentEvent() {
	if (game.state !== STATE.EVENT) return [];
	if (game.room[3] < EVENTS.any.length) return EVENTS.any[game.room[3]][game.turn - TURN.EVENT_START] || [];
	return EVENTS[get.area()][game.room[3] - 100][game.turn - TURN.EVENT_START] || [];
};
