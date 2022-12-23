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
		desc: "All cards that give\nshield give 1 extra.",
	},
};

for (const key in artifacts) {
	if (Object.hasOwnProperty.call(artifacts, key)) {
		artifacts[key].desc = artifacts[key].desc.replace(/([Hh]ealth|[Hh]eal|[Dd]amage(?!<\/red>)|[Ee]xtra\sdamage|[Aa]ttack)/g, "<red>$1</red>").replace(/([Ss]hield|[Dd]efense)/g, "<blue>$1</blue>");
	};
};
