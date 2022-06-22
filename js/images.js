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
}, card = {
    _energy: new Image,
    back: new Image,
    error: new Image,
    slash: new Image,
    block: new Image,
    aura_blade: new Image,
    outline: {
        attack: new Image,
        curse: new Image,
        defense: new Image,
        magic: new Image,
    },
}, slime = {
    big: new Image,
    small: new Image,
    small_launch: new Image,
},
cave = new Image, background = new Image, floating_arch = new Image, // backrounds
clock = {
    face: new Image,
    hour_hand: new Image,
    min_hand: new Image,
    node: new Image,
}, letters = {
    black: new Image,
    red: new Image,
    white: new Image,
    fade: [new Image, new Image, new Image],
}, bar = {
    health: new Image,
    shield: new Image,
    energy: new Image,
}, select = {
    round: new Image,
    card_normal: new Image,
    card_unplayable: new Image,
    deck: new Image,
    selector: [new Image, new Image, new Image, new Image],
}, extra = {
    help: new Image,
    looker: new Image,
    music: new Image,
}, icon = {
    aura_blade: new Image,
},
end = new Image, deck = new Image, view = new Image, aura_blade = new Image; // other

// player
player.idle.src = "images/player/idle.png";
player.attack.src = "images/player/attack.png";
player.attack_aura.src = "images/player/attack_aura.png";
player.attack_2.src = "images/player/attack_2.png";
player.attack_2_aura.src = "images/player/attack_2_aura.png";
player.hit.src = "images/player/hit.png";
player.shield.src = "images/player/shield.png";

// cards
card._energy.src = "images/cards/_energy.png";
card.back.src = "images/cards/back.png";
card.error.src = "images/cards/error.png";
card.slash.src = "images/cards/slash.png";
card.block.src = "images/cards/block.png";
card.aura_blade.src = "images/cards/aura_blade.png";

// card outlines
card.outline.attack.src = "images/cards/outline/attack.png";
card.outline.curse.src = "images/cards/outline/curse.png";
card.outline.defense.src = "images/cards/outline/defense.png";
card.outline.magic.src = "images/cards/outline/magic.png";

// slimes
slime.big.src = "images/enemies/slime/big.png";
slime.small.src = "images/enemies/slime/small.png";
slime.small_launch.src = "images/enemies/slime/small_launch.png";

// backrounds
cave.src = "images/cave.png";
background.src = "images/background.png";
floating_arch.src = "images/floating_arch.png";

// the clock
clock.face.src = "images/clock/face.png";
clock.hour_hand.src = "images/clock/hour_hand.png";
clock.min_hand.src = "images/clock/min_hand.png";
clock.node.src = "images/clock/node.png";

// letters
letters.black.src = "images/letters/black.png";
letters.red.src = "images/letters/red.png";
letters.white.src = "images/letters/white.png";
letters.fade[0].src = "images/letters/fade_0.png";
letters.fade[1].src = "images/letters/fade_1.png";
letters.fade[2].src = "images/letters/fade_2.png";

// bars
bar.health.src = "images/bars/health.png";
bar.shield.src = "images/bars/shield.png";
bar.energy.src = "images/bars/energy.png";

// selectors
select.round.src = "images/select/round.png";
select.card_normal.src = "images/select/card_normal.png";
select.card_unplayable.src = "images/select/card_unplayable.png";
select.deck.src = "images/select/deck.png";
select.selector[0].src = "images/select/u_l.png";
select.selector[1].src = "images/select/u_r.png";
select.selector[2].src = "images/select/d_l.png";
select.selector[3].src = "images/select/d_r.png";

// extras
extra.help.src = "images/extras/help.png";
extra.looker.src = "images/extras/looker.png";
extra.music.src = "images/extras/music.png";

// icons
icon.aura_blade.src = "images/icons/aura_blade.png";

// other
end.src = "images/end.png";
deck.src = "images/deck.png";
view.src = "images/view.png";
aura_blade.src = "images/aura_blade.png";
