var game = {
    tickspeed: 100,
    health: 100,
    maxhealth: 100,
    floor: 1,
    state: "enter",
    select: ["none", 0],
    enemies: [],
    hiddenEnemies: [],
    deck: ["basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack", "basic_attack"],
    hand: [],
    handsize: 5,
    discard: [],
};

function hardReset() {
    localStorage.removeItem("Yrahcaz7/Dungeon-of-Souls/save");
    game = null;
    location.reload();
};

function randomize(array) {
    let index = array.length, randomIndex;
    while (index != 0) {
        randomIndex = Math.floor(Math.random() * index);
        index--;
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    };
    return array;
};

function shuffleDeck(newCard = null) {
    if (newCard) game.deck.push("" + newCard);
    game.deck = randomize(game.deck);
};

function drawHand() {
    let index = 0;
    for (; index < game.handsize && index < game.deck.length; index++) {
        game.hand.push(game.deck[index]);
    };
    if (index != game.handsize) {
        game.deck.push(game.discard);
        shuffleDeck();
        for (; index < game.handsize && index < game.deck.length; index++) {
            game.hand.push(game.deck[index]);
        };
    };
};

function enterBattle() {
    game.state = "battle";
    shuffleDeck();
    drawHand();
};

const gameloop = setInterval(function() {
    // visuals
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.floor == 1) {
        if (game.state == "enter") {
            game.enemies.push(["slime_small", 20, 20]);
            enterBattle();
        };
    } else if (game.floor == 2) {
        if (game.state == "enter") {
            game.enemies.push(["slime_big", 30, 30]);
            enterBattle();
        };
    };
    renderRoom();
    player();
    enemyAnimations();
    renderCards();
    // actions
    console.log(action);
}, game.tickspeed);
