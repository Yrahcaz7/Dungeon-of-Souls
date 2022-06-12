class Enemy {
    constructor(type, power) {
        if (type == "slime_small") power--;
        this.type = type;
        this.maxHealth = Math.round(((Math.random() / 4) + 0.875) * ((power * 10) + 20));
        this.health = this.maxHealth;
        this.maxShield = Math.round(((Math.random() / 4) + 0.875) * ((power * 5) + 10));
        this.shield = 0;
        this.attackPower =  Math.round(((power / 2) + 1) * 5);
        this.location = game.enemyIndex;
        game.enemyIndex++;
    };
    startAction(type) {
        if (type == "attack") {
            if (game.shield >= 1) startPlayerAnim("shield");
            startEnemyAnim(this.location, "slime_small_launch");
        };
    };
    middleAction(type) {
        if (type == "attack") {
            var damage = this.attackPower;
            if (game.shield <= damage) {
                damage -= game.shield;
                game.shield = 0;
                game.health -= damage;
            } else {
                game.shield -= damage;
            };
            if (game.shield < 1) startPlayerAnim("hit");
        };
    };
    finishAction(type) {
        if (this.location == game.enemies.length - 1) {
            game.turn = "player";
        };
    };
};
