const ENDOFBATTLE = 900;

const artifacts = {
	1: {
		name: "iron will",
		desc: "Every time a battle\nends, you heal 2 health.",
		rarity: 0,
		[ENDOFBATTLE]() {
			game.health += 2;
		},
	},
	2: {
		name: "supershield",
		rarity: 1,
		desc: "All cards that give\nshield give 2 extra.",
	},
	3: {
		name: "gem of rage",
		rarity: 1,
		desc: "All cards that deal\ndamage deal 2 extra.",
	},
	4: {
		name: "candy",
		rarity: 1,
		desc: "You have 20 less max\nhealth, but you heal by\n3 after every battle.",
		[ENDOFBATTLE]() {
			game.health += 3;
		},
	},
	5: {
		name: "corrosion",
		rarity: 1,
		desc: "You deal 3 extra damage,\nbut you lose 3 health\nafter every battle.",
		[ENDOFBATTLE]() {
			game.health -= 3;
		},
	},
};

for (const key in artifacts) {
	if (Object.hasOwnProperty.call(artifacts, key)) {
		artifacts[key].desc = artifacts[key].desc.replace(/([Mm]ax\shealth|[Hh]ealth|[Hh]eal|[Dd]amage(?!<\/red>)|[Ee]xtra\sdamage|[Aa]ttack)/g, "<red>$1</red>").replace(/([Ss]hield|[Dd]efense)/g, "<blue>$1</blue>");
	};
};
