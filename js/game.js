var game = {
    tickspeed: 100,
    health: 100,
    floor: 1,
    inBattle: false,
    enemies: [],
};

function hardReset() {
    localStorage.removeItem('Yrahcaz7/Dungeon-of-Souls/save');
    game = null;
    location.reload();
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
