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
 * Fixes the formatting of a manual page's text and returns it.
 * @param {string} str - the text to fix the formatting of.
 */
function fixManualPageFormat(str) {
	return str.replace(/^\n/, "").replace(/\n$/, "").replace(/\t/g, "");
};

const OVERVIEW = fixManualPageFormat(`
	<b>Storyline<s>
	You have been trapped in this dungeon as long as you can remember.
	You are determined to get out, so you pick up some armour and start climbing up the floors.
	As you go higher, you get closer to the exit, but the monsters get stronger.
	As time goes on, you wonder... What was the reason you were trapped here in the first place?
	Is there something more to this dungeon than it seems?
	<b>Controls<s>
	Use the arrow keys or WASD keys to select things.
	The enter key and the space bar perform actions and interact with things.
	There are also hotkeys, like E, which ends your turn, and B, which goes back in menus.
	The 1, 2, 3, and 0 keys view your deck, discard, void, and owned cards, respectively.
	You also can press tab to enter fullscreen and escape to exit it.
	<b>How to Play<s>
	You have a deck of cards, which you draw the top 5 from each turn.
	You can play the cards in your hand for the effect(s) they say.
	After each battle, you will get rewards, including better cards.
	Try to get a good synergy between the cards in your deck.
	If you reach 0 health, you die and lose your progress.
	However, you can use your new knowledge to reach higher heights next time.
	Note: go to the next page for more details on how to play.
	<b><#999>An ominous feeling...<s>
	<#999>When the hands align,
	find the fragment of time.
	Else, at the edge of the sky,
	you shall eternally die.
`);
const GAMEPLAY = fixManualPageFormat(`
	<b>Cards and Effects<s>
	You have a deck of cards, which you draw the top 5 from each turn.
	Cards cost <#ff0>energy</#ff0> to play, which is the number in the big yellow circle.
	The <#ff0>energy cost</#ff0> of each card is always shown in its top-left corner.
	When you play a card, it does what it says on the card (effects are listed below).
	 - <#f44>Damage</#f44> reduces enemies' <#f44>health</#f44>, while <#48f>shield</#48f> protects your <#f44>health</#f44> from attacks.
	 - Take note that <#48f>shield</#48f> goes away at the start of your turn unless something says otherwise.
	 - Also, <#48f>shield</#48f> on enemies acts the same and goes away at the start of the enemy turn.
	 - Most other effects are more complex and have a tooltip that says what they do.
	<b>Enemy Intents<s>
	Take note of what's floating above the enemies' heads. That is their intent.
	An enemy's intent shows what it intends to do on its next turn.
	<#f44>Red</#f44> intents mean <#f44>attack</#f44>, while <#48f>blue</#48f> intents mean <#48f>defense</#48f> (gain <#48f>shield</#48f>).
	There are others later, but you can look at the tooltips to see what they are.
	Use the enemies' predictability to strategize what cards you play.
	<b>Building a Deck<s>
	After each battle, you will get rewards, including a choice of 3 cards.
	Some special things can give you more or less card choices, but it's normally 3.
	Choose your cards wisely to get a good synergy between the cards in your deck.
	Later on, you can also get purifiers, which let you remove cards from your deck.
	Another reward that can appear later on is refiners, which let you improve your cards.
	<b>Artifacts<s>
	Artifacts are very important. You start with two: <#f0c060>The Map</#f0c060> and Iron Will.
	You can open <#f0c060>the map</#f0c060> to look at it and pick where you will go next after a battle.
	Iron Will has you gain 2 <#f44>health</#f44> every time you clear a floor, which is very useful.
	More artifacts will appear later and you can look at their tooltips to see what they do.
	<b>The Map<s>
	When you open <#f0c060>the map</#f0c060>, you will see a tree of paths you can take.
	Most nodes on the map are normal battles, which give standard rewards.
	You will also see some chests, which symbolize <#ff0>treasure chambers</#ff0>.
	<#ff0>Treasure chambers</#ff0> give better rewards than battles, so try to get them.
	Additionally, there will be a <#f00>skull</#f00> on <#f0c060>the map</#f0c060>. That is the <#f00>death zone</#f00>.
	It contains a <#f00>prime enemy</#f00>, which is much stronger than normal enemies.
	However, the rewards you get are even better than ones from <#ff0>treasure chambers</#ff0>.
	The large node on the far right is a <#f00>boss battle</#f00>, which gives the greatest rewards of all.
	Lastly, the bright orbs right before the <#f00>boss battle</#f00> help prepare you for the fight.
	<b>Losing the Game<s>
	If your <#f44>health</#f44> drops down to 0, you will <#f00>die</#f00> and lose your progress.
	However, you earn <#ff0>XP</#ff0> (not implemented yet), and when you get enough you can unlock new cards.
	Then, you can use your new knowledge and cards to reach higher heights next time.
`);
const CHANGELOG = fixManualPageFormat(`
	<b>Version 3.0 - In Development...<s>
	 - completely reworked the map generator
	 - added one new artifact and many new effects
	 - reworked hard mode
	 - improved the past run info screen
	 - many bugfixes
	<b>Version 2.3 - Consecution<s>
	 - finally added the ACT 2 boss music!
	 - two new enemies and five new effects!
	 - added five new cards (or maybe six?)
	 - finally added card draw/discard animations!
	 - added a way to remove past run info
	 - improved most effect descriptions!
	 - some less important things
	<b>Version 2.2 - Convolution<s>
	 - finally added a way to view info on past runs!
	 - added a way to play runs with custom seeds!
	 - you can now see the types of battles on the map!
	 - added and adjusted a number of enemy animations
	 - various adjustments, bugfixes, and optimizations
	 - added tooltips to all of the menu items!
	 - probably some more things I forgot
	<b>Version 2.1 - Revolution<s>
	 - finally reworked the refiner screen!
	 - added two new options, including auto end turn!
	 - there are two new artifacts (or maybe three?)
	 - added a hotkey (0) to view all cards you own
	 - some bugfixes, balancing, and performance improvements
	 - added a main menu for real this time!
	 - minor changes that you won't even notice
	<b>Version 2.0 - Evolution<s>
	 - finally added ACT 2!
	 - added one new boss!
	 - added three new enemies!
	 - you can now refine your cards!
	 - there is two new artifacts
	 - improved game performance and some visuals
	 - various balancing changes and bugfixes
	 - some less important things
	<b>Version 1.3 - Deception<s>
	 - added THE SECRET ACT!
	 - added special events (4 so far)
	 - added a new option: screen shake
	 - five new cards and many new effects
	 - you now get scored at the end of each run
	 - the map now looks much cooler
	 - probably some more things I forgot
	<b>Version 1.2 - Reception<s>
	 - added a new option: pixel perfect size
	 - two new cards and two new artifacts
	 - a new effect, resilience, which reduces damage taken
	 - the boss is now smarter and has a new move
	 - slimes now finally have defending animations!
	 - rebalancing for cards, enemies, and artifacts
	 - minor changes that you won't even notice
	<b>Version 1.1 - Perception<s>
	 - added a new option: pixel perfect screen
	 - two new cards and a new effect
	 - four new artifacts (obtained via death zone rewards)
	 - finally added a boss battle at the end!
	 - travelled paths on the map now appear darker
	 - balancing (including the map generator)
	 - some less important things
	<b>Version 1.0 - Inception<s>
	 - finally added title and game over screens!
	 - finally added an options menu!
	 - added treasure chambers and death zones
	 - added hotkeys for various things
	 - three new cards and some card rebalancing
	 - polished the map generator (and fixed seeds)
	 - many bugfixes and internal optimizations
	 - probably some more things I forgot
	<b>Version 0.3 - Formulation<s>
	 - enemies now die upon reaching 0 health
	 - added the map (and seeds)
	 - added the starting artifact
	 - finally added the how to play page!
	 - two new cards and a new effect
	 - added loot/rewards at end of fights
	 - minor changes that you won't even notice
	<b>Version 0.2 - Manifestation<s>
	 - you can now end your turn (you couldn't before)
	 - enemies can now attack and defend
	 - you can now see what the enemy intends to do
	 - added the changelog to the game info
	 - added notifications (currently only music change ones)
	 - a new card, with a totally new effect
	 - some less important things
	<b>Version 0.1 - Realization<s>
	 - many optimizations and code improvements
	 - a lot more cool visuals and animations
	 - some new UI items and a help page
	 - added custom music, made by myself
	 - you can now view your deck and discard
	 - a new card, with a totally new effect
	 - probably some more things I forgot
	<b>Version 0.0 - Desolation<s>
	 - started making the game in my spare time
	 - still needs a lot of polishing and such
	 - next update will probably make it more playable
`);

/**
 * Updates the game's data.
 */
function updateData() {
	if (!loaded) return;
	// delete excess enemies
	if (game.enemies.length > 6) game.enemies.splice(6);
	// enemyPos
	if (game.enemies.length !== enemyPos.length) {
		if (game.enemies.length == 1) enemyPos = [[400 - 105, 40]];
		else if (game.enemies.length == 2) enemyPos = [[400 - 70, 35], [400 - 140, 50]];
		else if (game.enemies.length == 3) enemyPos = [[400 - 70, 70], [400 - 140, 80], [400 - 110, 14]];
		else if (game.enemies.length == 4) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 110, 14], [400 - 200, 30]];
		else if (game.enemies.length == 5) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 100, 14], [400 - 170, 14], [400 - 210, 80]];
		else if (game.enemies.length == 6) enemyPos = [[400 - 70, 80], [400 - 140, 80], [400 - 100, 14], [400 - 170, 14], [400 - 210, 80], [400 - 240, 14]];
		else enemyPos = [];
	};
	// info scroll
	if (infoPos < 0) infoPos = 0;
	if (infoPos > infoLimit) infoPos = infoLimit;
	// effect removal
	for (const eff in game.eff) {
		if (!game.eff[eff]) delete game.eff[eff];
	};
	for (let index = 0; index < game.enemies.length; index++) {
		for (const eff in game.enemies[index].eff) {
			if (!game.enemies[index].eff[eff]) delete game.enemies[index].eff[eff];
		};
	};
	for (let index = 0; index < game.hand.length; index++) {
		for (const eff in game.hand[index].eff) {
			if (!game.hand[index].eff[eff]) delete game.hand[index].eff[eff];
		};
	};
	// fixes
	game.health = Math.min(Math.max(game.health, 0), get.maxHealth());
	game.shield = Math.min(Math.max(game.shield, 0), get.maxShield());
	for (let index = 0; index < game.enemies.length; index++) {
		const enemy = game.enemies[index];
		enemy.health = Math.min(enemy.health, enemy.maxHealth);
		enemy.shield = Math.min(enemy.shield, enemy.maxShield);
	};
	// kill enemies
	let healAll = false;
	let damageAll = 0;
	for (let index = game.enemies.length - 1; index >= 0; index--) {
		const enemy = game.enemies[index];
		if (enemy.health > 0) continue;
		const deathTriggers = !enemy.eff[ENEMY_EFF.SCRAP_HEAP] && !enemy.eff[ENEMY_EFF.REVIVED];
		if (deathTriggers) {
			if (enemy.eff[ENEMY_EFF.REWIND] && !enemy.eff[ENEMY_EFF.COUNTDOWN]) {
				enemy.eff[ENEMY_EFF.REWIND]++;
				enemy.eff[ENEMY_EFF.COUNTDOWN] = Math.max(enemy.intentHistory.length - 1, 0);
				enemy.intentHistory.splice(enemy.intentHistory.length - 1);
				healAll = true;
				continue;
			};
			if (enemy.eff[ENEMY_EFF.PERSISTENCE]) {
				const newEnemy = new Enemy(SLIME.PUDDLE);
				newEnemy.maxHealth = enemy.eff[ENEMY_EFF.PERSISTENCE];
				newEnemy.health = newEnemy.maxHealth;
				newEnemy.maxShield = newEnemy.maxHealth;
				newEnemy.eff[ENEMY_EFF.REVIVAL] = 2;
				game.enemies.push(newEnemy);
			};
			if (enemy.eff[ENEMY_EFF.OVERHEAT]) {
				damageAll += Math.floor(enemy.eff[ENEMY_EFF.OVERHEAT] / 2);
			};
			game.kills[enemy.type] = (game.kills[enemy.type] || 0) + 1;
		};
		game.enemies.splice(index, 1);
		if (game.enemyNum >= index) game.enemyNum--;
		if (game.enemyAtt[1] > index) game.enemyAtt[1]--;
		else if (game.enemyAtt[1] === index) game.enemyAtt[1] = -1;
	};
	// heal everything
	if (healAll) {
		game.enemies.forEach(enemy => enemy.health = enemy.maxHealth);
		game.health = get.maxHealth();
	};
	// enemy plans
	for (let index = 0; index < game.enemies.length; index++) {
		if (index == game.enemyNum) continue;
		const enemy = game.enemies[index];
		if (enemy.eff[ENEMY_EFF.PLAN_ATTACK]) {
			if (enemy.intent === INTENT.ATTACK && game.shield >= Math.ceil(enemy.getTotalAttackPower() * get.takeDamageMult(index))) {
				if (enemy.eff[EFF.ATKUP]) enemy.eff[EFF.ATKUP] += 2;
				else enemy.eff[EFF.ATKUP] = 2;
				enemy.eff[[ENEMY_EFF.PLAN_SUMMON, ENEMY_EFF.PLAN_DEFEND][Math.floor(random() * 2)]] = 1;
				delete enemy.eff[ENEMY_EFF.PLAN_ATTACK];
			} else if (enemy.intent === INTENT.DEFEND && enemy.shield > 0) {
				enemy.intent = INTENT.ATTACK;
				enemy.intentHistory.push(this.intent);
				enemy.eff[[ENEMY_EFF.PLAN_SUMMON, ENEMY_EFF.PLAN_DEFEND][Math.floor(random() * 2)]] = 1;
				delete enemy.eff[ENEMY_EFF.PLAN_ATTACK];
			};
		} else if (enemy.eff[ENEMY_EFF.PLAN_SUMMON]) {
			if ((enemy.intent === INTENT.DEFEND && enemy.shield > 0)
				|| (enemy.intent === INTENT.ATTACK && game.shield >= Math.ceil(enemy.getTotalAttackPower() * get.takeDamageMult(index)))
			) {
				enemy.intent = INTENT.SUMMON;
				enemy.intentHistory.push(INTENT.SUMMON);
				enemy.eff[[ENEMY_EFF.PLAN_ATTACK, ENEMY_EFF.PLAN_DEFEND][Math.floor(random() * 2)]] = 1;
				delete enemy.eff[ENEMY_EFF.PLAN_SUMMON];
			};
		} else if (enemy.eff[ENEMY_EFF.PLAN_DEFEND]) {
			if (enemy.intent === INTENT.DEFEND && enemy.shield > 0) {
				if (enemy.eff[EFF.DEFUP]) enemy.eff[EFF.DEFUP] += 2;
				else enemy.eff[EFF.DEFUP] = 2;
				enemy.eff[[ENEMY_EFF.PLAN_ATTACK, ENEMY_EFF.PLAN_SUMMON][Math.floor(random() * 2)]] = 1;
				delete enemy.eff[ENEMY_EFF.PLAN_DEFEND];
			} else if (enemy.intent === INTENT.ATTACK && game.shield >= Math.ceil(enemy.getTotalAttackPower() * get.takeDamageMult(index))) {
				enemy.intent = INTENT.DEFEND;
				enemy.intentHistory.push(INTENT.DEFEND);
				enemy.eff[[ENEMY_EFF.PLAN_ATTACK, ENEMY_EFF.PLAN_SUMMON][Math.floor(random() * 2)]] = 1;
				delete enemy.eff[ENEMY_EFF.PLAN_DEFEND];
			};
		};
	};
	// game over
	if (game.health === 0 && playerAnim[1] !== I.player.death) {
		startAnim.player(I.player.death);
		game.turn = -1;
		game.state = STATE.GAME_END;
		game.select = [S.GAME_OVER, 0];
	};
	// game won
	if (game.floor == 20 && game.state === STATE.EVENT_FIN && game.select[0] === S.MAP) {
		game.turn = -1;
		game.state = STATE.GAME_END;
		game.select = [S.GAME_WON, 0];
	};
	// state changes
	endBattle();
	loadRoom();
	// sort cards
	Card.sort(game.cards);
	Card.sort(game.void);
	Card.sort(game.discard);
	// other
	if (game.select[0] === S.HAND) {
		if (game.hand.length) game.prevCard = game.select[1];
		else game.select = [S.END_TURN, 0];
	};
	// effects that need another update
	if (damageAll > 0) {
		for (let index = 0; index < game.enemies.length; index++) {
			dealDamage(damageAll, 0, index, false);
		};
		takeDamage(damageAll, false);
		updateData();
	};
};
