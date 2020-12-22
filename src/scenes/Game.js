import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {
    /** @type {Phaser.Physics.Arcade.StaticBody} */
    player;

    constructor() {
        super('game')
    }

    preload() {
        this.load.image("background", "assets/bg_layer1.png");
        this.load.image("platform", "assets/ground_grass.png");
        this.load.image("player", "assets/bunny1_stand.png");
    }

    create() {
        this.add.image(240, 320, "background");

        const platforms = this.physics.add.staticGroup();
        for(let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;
            
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = platforms.create(x, y, "platform");
            platform.scale = 0.5;

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body;
            body.updateFromGameObject();
        }

        this.player = this.physics.add.image(240, 320, "player").setScale(0.5);
        this.cameras.main.startFollow(this.player);
        this.physics.add.collider(platforms, this.player);
        this.player.body.checkCollision = {
            up: false,
            down: true,
            left: false,
            right: false,
        };
    }

    update() {
        /** @type {Phaser.Physics.Arcade.StaticBody} */
        const body = this.player.body;
        const touchingDown = body.touching.down;
        if(touchingDown) {
            this.player.setVelocityY(-300);
        }
    }
}