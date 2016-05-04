var sprites = {
    ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
    missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
    enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1 },
    enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
    enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 }
};

var enemies = {
    straight: {
        x: 0,
        y: -50,
        sprite: 'enemy_ship',
        health: 10,
        E: 100,
        firePercentage: 0.2
    },
    ltr: {
        x: 0,
        y: -100,
        sprite: 'enemy_purple',
        health: 10,
        B: 75,
        C: 1,
        E: 100,
        missiles: 2,
        firePercentage: 0.2
    },
    circle: {
        x: 250,
        y: -50,
        sprite: 'enemy_circle',
        health: 10,
        A: 0,
        B: -100,
        C: 1,
        E: 20,
        F: 100,
        G: 1,
        H: Math.PI / 2,
         firePercentage: 0.2
    },
    wiggle: {
        x: 100,
        y: -50,
        sprite: 'enemy_bee',
        health: 20,
        B: 50,
        C: 4,
        E: 100,
        firePercentage: 0.2,
        missiles: 2
    },
    step: {
        x: 0,
        y: -50,
        sprite: 'enemy_circle',
        health: 10,
        B: 150,
        C: 1.2,
        E: 75,
        firePercentage: 0.2
    }
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
    Game.setBoard(3, new TitleScreen("Alien Invasion",
        "Press fire to start playing",
        playGame));
    
};

var level1 = [
    // Start,   End, Gap,  Type,   Override
    [0, 4000, 500, 'step'],
    [6000, 13000, 800, 'ltr'],
    [10000, 16000, 400, 'circle'],
    [17800, 19000, 500, 'straight', { x: 50 }],
    [22000, 25000, 400, 'wiggle', { x: 150 }],
    [22000, 25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
    var board = new GameBoard();
    board.add(new PlayerShip());
    board.add(new Level(level1, winGame));
    Game.setBoard(5, new GamePoints(0));
    Game.setBoard(6, new GameBlood(100));
    Game.setBoard(3, board);
};
console.log(Game)
var winGame = function() {
    Game.setBoard(3, new TitleScreen("You win!",
        "Press fire to play again",
        playGame));
};

var loseGame = function() {
    Game.setBoard(3, new TitleScreen("You lose!",
        "Press fire to play again",
        playGame));
};

window.addEventListener("load", function() {
    Game.initialize("game", sprites, startGame);

});



/*背景类*/

var Starfield = function(speed, opacity, numStars, clear) {

    // Set up the offscreen canvas
    var stars = document.createElement("canvas");
    stars.width = Game.width;
    stars.height = Game.height;
    var starCtx = stars.getContext("2d");

    var offset = 0;

    // If the clear option is set, 
    // make the background black instead of transparent
    if (clear) {
        starCtx.fillStyle = "#000";
        starCtx.fillRect(0, 0, stars.width, stars.height);
    }

    // Now draw a bunch of random 2 pixel
    // rectangles onto the offscreen canvas
    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity;
    for (var i = 0; i < numStars; i++) {
        starCtx.fillRect(Math.floor(Math.random() * stars.width),
            Math.floor(Math.random() * stars.height),
            2,
            2);
    }

    // This method is called every frame
    // to draw the starfield onto the canvas
    this.draw = function(ctx) {
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;

        // Draw the top half of the starfield
        if (intOffset > 0) {
            ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
        }

        // Draw the bottom half of the starfield
        if (remaining > 0) {
            ctx.drawImage(stars,
                0, 0,
                stars.width, remaining,
                0, intOffset,
                stars.width, remaining);
        }
    }

    // This method is called to update
    // the starfield
    this.step = function(dt) {
        offset += dt * speed;
        offset = offset % stars.height;
    }
}

/*绘制标题*/
var TitleScreen = function TitleScreen(title, subtitle, callback) {
    var up = false;
    this.step = function(dt) {
        if (!Game.keys['fire']) up = true;
        if (up && Game.keys['fire'] && callback) callback();
    };

    this.draw = function(ctx) {
        ctx.fillStyle = "#FFFFFF";

        ctx.font = "bold 40px bangers";
        var measure = ctx.measureText(title);
        ctx.fillText(title, Game.width / 2 - measure.width / 2, Game.height / 2);

        ctx.font = "bold 20px bangers";
        var measure2 = ctx.measureText(subtitle);
        ctx.fillText(subtitle, Game.width / 2 - measure2.width / 2, Game.height / 2 + 40);
    };
};
/*添加主角--重构*/
var PlayerShip = function() {
    this.setup('ship', { vx: 0, frame: 0, reloadTime: 0.25, maxVel: 200, health: 100 });

    this.reload = this.reloadTime;
    this.x = Game.width / 2 - this.w / 2;
    this.y = Game.height - Game.playerOffset - this.h;

    this.step = function(dt) {
        if (Game.keys['left']) { this.vx = -this.maxVel; } else if (Game.keys['right']) { this.vx = this.maxVel; } else { this.vx = 0; }

        this.x += this.vx * dt;

        if (this.x < 0) { this.x = 0; } else if (this.x > Game.width - this.w) {
            this.x = Game.width - this.w
        }

        this.reload -= dt;
        if (Game.keys['fire'] && this.reload < 0) {
            Game.keys['fire'] = false;
            this.reload = this.reloadTime;

            this.board.add(new PlayerMissile(this.x, this.y + this.h / 2));
            this.board.add(new PlayerMissile(this.x + this.w, this.y + this.h / 2));
        }
    }
}

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;
PlayerShip.prototype.hit = function(damage) {
    this.health -= damage;
    Game.Blood = this.health;
    console.log("当前健康"+this.health);
    this.board.add(new Explosion(this.x + this.w / 2,
        this.y + this.h / 2));
    if (this.health <= 0) {
        this.health = 0;
        this.board.remove(this);
        loseGame();
    }
};


/*导弹*/
var PlayerMissile = function(x, y) {
    this.setup('missile', { vy: -700, damage: 10 });
    this.x = x - this.w / 2;
    this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;
PlayerMissile.prototype.step = function(dt) {
        this.y += this.vy * dt;
        var collision = this.board.collide(this, OBJECT_ENEMY);
        if (collision) {

            collision.hit(this.damage);
            this.board.remove(this);
        } else if (this.y < -this.h) {
            this.board.remove(this)
        }
        if (this.y < -this.h) { this.board.remove(this) }
    }
    /*敌人导弹*/
var EnemyMissile = function(x, y) {
    this.setup('enemy_missile', { vy: 200, damage: 10 });
    this.x = x - this.w / 2;
    this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt) {
    this.y += this.vy * dt;
    var collision = this.board.collide(this, OBJECT_PLAYER)
    if (collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    } else if (this.y > Game.height) {
        this.board.remove(this);
    }
};

/*绘制敌人*/
var Enemy = function(blueprint, override) {
    this.setup('ship', { vx: 0, frame: 0, reloadTime: 2, maxVel: 200, damage: 10 });

    this.reload = this.reloadTime;
    this.x = Game.width / 2 - this.w / 2;
    this.y = Game.height - Game.playerOffset - this.h;

    this.merge(this.baseParameters);
    this.setup(blueprint.sprite, blueprint);
    this.merge(override);
}

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
    t: 0
};

Enemy.prototype.step = function(dt) {
    this.t += dt;

    this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
    this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    var collision = this.board.collide(this, OBJECT_PLAYER);
    if (collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    }


    if (this.y > Game.height ||
        this.x < -this.w ||
        this.x > Game.width) {
        this.board.remove(this);
    }
    /*添加导弹*/

    var d = Math.random();
    if (this.reload < 0 && d <= this.firePercentage) {
        this.reload = this.reloadTime;
        if (this.missiles == 2) {

            this.board.add(new EnemyMissile(this.x, this.y + this.h / 2));
            this.board.add(new EnemyMissile(this.x + this.w, this.y + this.h / 2));
        } else {
            this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h / 2));
        }

    }
    this.reload -= dt;
}
Enemy.prototype.hit = function(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            Game.points += this.points || 100;
            this.board.add(new Explosion(this.x + this.w / 2,
                this.y + this.h / 2));
            this.board.remove(this);

        }
    }
    /*爆炸*/
var Explosion = function(centerX, centerY) {
    this.setup('explosion', { frame: 0 });
    this.x = centerX - this.w / 2;
    this.y = centerY - this.h / 2;
}

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
        this.frame++;
        if (this.frame >= 12) {
            this.board.remove(this);
        }
    }
    /*添加得分*/
var GamePoints = function() {
        Game.points = 0;
        var pointsLength = 8;
        this.draw = function(ctx) {
          console.log("我进来了")
            ctx.save();
            ctx.font = "bold 18px arial";
            ctx.fillStyle = "#fff";

            var txt = "" + Game.points;
            var i = pointsLength - txt.length,
                zeros = "";
            while (i-- > 0) { zeros += "0" }
            ctx.fillText(zeros + txt, 10, 20);
            ctx.restore();

        }
        this.step = function(dt) {};
    }
    /*血条Game blood*/
var GameBlood = function(Blood) {
    Game.Blood = Blood>0?Blood:0;
  
    this.draw = function(ctx) {

        ctx.save();
        ctx.fillStyle = "#fff";
          ctx.fillRect(Game.width - 110, 2, 100, 10)
         ctx.restore();

        ctx.save();
        ctx.fillStyle = "#e72121";
        ctx.fillRect(Game.width - 110, 2, Game.Blood, 10)
         ctx.fillText(Game.Blood, Game.width - 110, 50);
        ctx.restore();
        // Game.Blood

    }
    this.step = function(dt) {};
}
