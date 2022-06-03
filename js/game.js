var game = {
    tickspeed: 1,
    health: 100,
};

const gameloop = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnSlime(0, 0, 0);
}, 100);
