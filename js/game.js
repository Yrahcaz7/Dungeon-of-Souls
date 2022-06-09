var game = {
    tickspeed: 100,
    health: 100,
    maxhealth: 100,
    floor: 1,
    state: "enter",
    enemies: [],
    hiddenEnemies: [],
    deck: [],
    hand: [],
    discard: [],
};

function hardReset() {
    localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save");
    game = null;
    location.reload();
};

const gameloop = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.floor == 1) {
        if (game.state=="enter") {
            game.enemies.push(["slime_small", 20, 20]);
            game.state = "battle";
        };
    } else if (game.floor == 2) {
        if (game.state=="enter") {
            game.enemies.push(["slime_big", 30, 30]);
            game.state = "battle";
        };
    };
    renderRoom();
    player();
    enemyAnimations();
    renderCards();
}, game.tickspeed);
