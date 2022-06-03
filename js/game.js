var game = {
    tickspeed: 100,
    health: 100,
    floor: 1,
    inBattle: false,
    enemies: [],
};

const gameloop = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.floor == 1) {
        if (!game.inBattle) {
            game.enemies.push(['slime', 20, 20]);
            game.inBattle = true;
        };
    };
    spawnEnemies();
}, game.tickspeed);
