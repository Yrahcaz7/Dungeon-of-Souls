var game = {
    tickspeed: 100,
    health: 100,
};

const gameloop = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnSlime(200, 20);
}, game.tickspeed);
