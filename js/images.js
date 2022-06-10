const player_idle = new Image, player_attack = new Image, player_attack_2 = new Image, player_hit = new Image, // player
	card_basic_attack = new Image, // cards
	slime_big = new Image, slime_small = new Image, // monsters
	slime_small_launch = new Image, // monster animations
	background = new Image, floating_arch = new Image, // backrounds
	clock_face = new Image, clock_hour_hand = new Image, clock_min_hand = new Image, clock_node = new Image, // the clock
	letters_black = new Image, letters_red = new Image, letters_lightRed = new Image, // solid letters
	letters_fade = [new Image, new Image, new Image], // transparent letters
	health_bar = new Image, block_bar = new Image, energy = new Image, // bars
	select_looker = new Image, select_card = new Image, selector = [new Image, new Image, new Image, new Image], // selectors
	looker = new Image, view = new Image; // other

// player
player_idle.src = "images/player/idle.png";
player_attack.src = "images/player/attack.png";
player_attack_2.src = "images/player/attack_2.png";
player_hit.src = "images/player/hit.png";

// cards
card_basic_attack.src = "images/cards/basic_attack.png";

// monsters
slime_big.src = "images/slime_big.png";
slime_small.src = "images/slime_small.png";

// monster animations
slime_small_launch.src = "images/slime_small_launch.png";

// backrounds
background.src = "images/background.png";
floating_arch.src = "images/floating_arch.png";

// the clock
clock_face.src = "images/clock/face.png";
clock_hour_hand.src = "images/clock/hour_hand.png";
clock_min_hand.src = "images/clock/min_hand.png";
clock_node.src = "images/clock/node.png";

// solid letters
letters_black.src = "images/letters/black.png";
letters_red.src = "images/letters/red.png";
letters_lightRed.src = "images/letters/lightRed.png";

// transparent letters
letters_fade[0].src = "images/letters/fade_0.png";
letters_fade[1].src = "images/letters/fade_1.png";
letters_fade[2].src = "images/letters/fade_2.png";

// bars
health_bar.src = "images/health_bar.png";
block_bar.src = "images/block_bar.png";
energy.src = "images/energy.png";

// selectors
select_looker.src = "images/select/looker.png";
select_card.src = "images/select/card.png";
selector[0].src = "images/select/u_l.png";
selector[1].src = "images/select/u_r.png";
selector[2].src = "images/select/d_l.png";
selector[3].src = "images/select/d_r.png";

// other
looker.src = "images/looker.png";
view.src = "images/view.png";
