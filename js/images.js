/*
	Dungeon of Souls
	Copyright (C) 2022 Yrahcaz7

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const player = {
	idle: new Image,
	attack: new Image,
	attack_aura: new Image,
	attack_2: new Image,
	attack_2_aura: new Image,
	hit: new Image,
	shield: new Image,
	shield_reinforced: new Image,
}, card = {
	energy: new Image,
	back: new Image,
	error: new Image,
	outline: {
		attack: new Image,
		curse: new Image,
		defense: new Image,
		skill: new Image,
		magic: new Image,
	},
	rarity: {
		rare: new Image,
	},
	starter: {
		"slash": new Image,
		"block": new Image,
	},
	common: {
		"reinforce": new Image,
		"aura blade": new Image,
		"war cry": new Image,
	},
	rare: {
		"everlasting shield": new Image,
	},
}, enemy = {
	slime: {
		big: new Image,
		small: new Image,
		small_launch: new Image,
	},
}, background = {
	cave: new Image,
	temple: new Image,
	floating_arch: new Image,
}, clock = {
	face: new Image,
	hour_hand: new Image,
	min_hand: new Image,
	node: new Image,
}, letters = {
	black: new Image,
	red: new Image,
	white: new Image,
	black_fade: [new Image, new Image, new Image],
	red_fade: [new Image, new Image, new Image],
}, bar = {
	health: new Image,
	shield: new Image,
	energy: new Image,
}, select = {
	round: new Image,
	card_normal: new Image,
	card_unplayable: new Image,
	card_rare: new Image,
	card_rare_unplayable: new Image,
	deck: new Image,
	discard: new Image,
	popup: new Image,
	map: new Image,
	battle: new Image,
	battle_blue: new Image,
	iron_will: new Image,
	selector: [new Image, new Image, new Image, new Image],
}, extra = {
	help: new Image,
	looker: new Image,
	music: new Image,
	end: new Image,
	deck: new Image,
	discard: new Image,
	map: new Image,
}, icon = {
	reinforce: new Image,
	aura_blade: new Image,
	iron_will: new Image,
}, intent = {
	defend: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
	attack: [new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image, new Image],
}, popup = {
	back: new Image,
	music: new Image,
	go: new Image,
}, map = {
	top: new Image,
	row: new Image,
	bottom: new Image,
	battle: new Image,
	select: new Image,
},
view = new Image, aura_blade = new Image, arrows = new Image; // other

// player
player.idle.src = "images/player/idle.png";
player.attack.src = "images/player/attack.png";
player.attack_aura.src = "images/player/attack_aura.png";
player.attack_2.src = "images/player/attack_2.png";
player.attack_2_aura.src = "images/player/attack_2_aura.png";
player.hit.src = "images/player/hit.png";
player.shield.src = "images/player/shield.png";
player.shield_reinforced.src = "images/player/shield_reinforced.png";

// card stuff
card.energy.src = "images/cards/energy.png";
card.back.src = "images/cards/back.png";
card.error.src = "images/cards/error.png";

// starter cards
card.starter["slash"].src = "images/cards/starter/slash.png";
card.starter["block"].src = "images/cards/starter/block.png";

// common cards
card.common["reinforce"].src = "images/cards/common/reinforce.png";
card.common["aura blade"].src = "images/cards/common/aura_blade.png";
card.common["war cry"].src = "images/cards/common/war_cry.png";

// rare cards
card.rare["everlasting shield"].src = "images/cards/rare/everlasting_shield.png";

// card outlines
card.outline.attack.src = "images/cards/outline/attack.png";
card.outline.curse.src = "images/cards/outline/curse.png";
card.outline.defense.src = "images/cards/outline/defense.png";
card.outline.skill.src = "images/cards/outline/skill.png";
card.outline.magic.src = "images/cards/outline/magic.png";

// card rarities
card.rarity.rare.src = "images/cards/rarity/rare.png";

// slimes
enemy.slime.big.src = "images/enemies/slime/big.png";
enemy.slime.small.src = "images/enemies/slime/small.png";
enemy.slime.small_launch.src = "images/enemies/slime/small_launch.png";

// backrounds
background.cave.src = "images/background/cave.png";
background.temple.src = "images/background/temple.png";
background.floating_arch.src = "images/background/floating_arch.png";

// the clock
clock.face.src = "images/clock/face.png";
clock.hour_hand.src = "images/clock/hour_hand.png";
clock.min_hand.src = "images/clock/min_hand.png";
clock.node.src = "images/clock/node.png";

// letters
letters.black.src = "images/letters/black.png";
letters.red.src = "images/letters/red.png";
letters.white.src = "images/letters/white.png";
letters.black_fade[0].src = "images/letters/black_fade_0.png";
letters.black_fade[1].src = "images/letters/black_fade_1.png";
letters.black_fade[2].src = "images/letters/black_fade_2.png";
letters.red_fade[0].src = "images/letters/red_fade_0.png";
letters.red_fade[1].src = "images/letters/red_fade_1.png";
letters.red_fade[2].src = "images/letters/red_fade_2.png";

// bars
bar.health.src = "images/bars/health.png";
bar.shield.src = "images/bars/shield.png";
bar.energy.src = "images/bars/energy.png";

// selectors
select.round.src = "images/select/round.png";
select.card_normal.src = "images/select/card_normal.png";
select.card_unplayable.src = "images/select/card_unplayable.png";
select.card_rare.src = "images/select/card_rare.png";
select.card_rare_unplayable.src = "images/select/card_rare_unplayable.png";
select.deck.src = "images/select/deck.png";
select.discard.src = "images/select/discard.png";
select.popup.src = "images/select/popup.png";
select.map.src = "images/select/map.png";
select.battle.src = "images/select/battle.png";
select.battle_blue.src = "images/select/battle_blue.png";
select.iron_will.src = "images/select/iron_will.png";
select.selector[0].src = "images/select/u_l.png";
select.selector[1].src = "images/select/u_r.png";
select.selector[2].src = "images/select/d_l.png";
select.selector[3].src = "images/select/d_r.png";

// extras
extra.help.src = "images/extras/help.png";
extra.looker.src = "images/extras/looker.png";
extra.music.src = "images/extras/music.png";
extra.end.src = "images/extras/end.png";
extra.deck.src = "images/extras/deck.png";
extra.discard.src = "images/extras/discard.png";
extra.map.src = "images/extras/map.png";

// icons
icon.reinforce.src = "images/icons/reinforce.png";
icon.aura_blade.src = "images/icons/aura_blade.png";
icon.iron_will.src = "images/icons/iron_will.png";

// intents
intent.defend[0].src = "images/intent/defend/1.png";
intent.defend[1].src = "images/intent/defend/2.png";
intent.defend[2].src = "images/intent/defend/3.png";
intent.defend[3].src = "images/intent/defend/4.png";
intent.defend[4].src = "images/intent/defend/5.png";
intent.defend[5].src = "images/intent/defend/6.png";
intent.defend[6].src = "images/intent/defend/7.png";
intent.defend[7].src = "images/intent/defend/E.png";
intent.defend[8].src = "images/intent/defend/I.png";
intent.defend[9].src = "images/intent/defend/V.png";
intent.defend[10].src = "images/intent/defend/Z.png";
intent.attack[0].src = "images/intent/attack/1.png";
intent.attack[1].src = "images/intent/attack/2.png";
intent.attack[2].src = "images/intent/attack/3.png";
intent.attack[3].src = "images/intent/attack/4.png";
intent.attack[4].src = "images/intent/attack/5.png";
intent.attack[5].src = "images/intent/attack/6.png";
intent.attack[6].src = "images/intent/attack/8.png";
intent.attack[7].src = "images/intent/attack/E.png";
intent.attack[8].src = "images/intent/attack/I.png";
intent.attack[9].src = "images/intent/attack/V.png";
intent.attack[10].src = "images/intent/attack/Z.png";

// popups
popup.back.src = "images/popup/back.png";
popup.music.src = "images/popup/music.png";
popup.go.src = "images/popup/go.png";

// map
map.top.src = "images/map/top.png";
map.row.src = "images/map/row.png";
map.bottom.src = "images/map/bottom.png";
map.battle.src = "images/map/battle.png";
map.select.src = "images/map/select.png";

// other
view.src = "images/view.png";
aura_blade.src = "images/aura_blade.png";
arrows.src = "images/arrows.png";
