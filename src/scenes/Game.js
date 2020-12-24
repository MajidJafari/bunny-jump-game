import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {
    /** @type {Phaser.Physics.Arcade.StaticBody} */
    player;
    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms; 
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors;

    constructor() {
        super('game')
    }

    preload() {
        this.load.image("background", "assets/bg_layer1.png");
        this.load.image("platform", "assets/ground_grass.png");
        this.load.image("player", "assets/bunny1_stand.png");
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.add.image(240, 320, "background").setScrollFactor(1, 0);

        this.platforms = this.physics.add.staticGroup();
        for(let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;
            
            const platform = this.platforms.create(x, y, "platform");
            platform.scale = 0.5;

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body;
            body.updateFromGameObject();
        }

        this.player = this.physics.add.image(240, 320, "player").setScale(0.5);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(this.scale.width * 1.5);

        this.physics.add.collider(this.platforms, this.player);
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
        else {
            if(this.cursors.left.isDown) {
                this.player.setVelocityX(-200);
            }
            else if(this.cursors.right.isDown) {
                this.player.setVelocityX(200);
            }
            else {
                this.player.setVelocityX(0);
            }
        }

        /** @type {Phaser.Physics.Arcade.Sprite} */
        this.platforms.children.iterate(platform => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const { scrollY } = this.cameras.main;

            if(platform.y > scrollY + 700) {
                platform.y = scrollY + Phaser.Math.Between(50, 100);
                platform.body.updateFromGameObject();
            }
        });

        this.horizontalWrap(this.player);
    }

    /**
        @param {Phaser.GameObjects.Sprite} sprite
    */
    horizontalWrap(sprite) {
        const halfWidth = sprite.width* 0.5;
        const gameWidth = this.scale.width;
        const leftOfTheScenseByHalfWidth = -halfWidth;
        const rightOfTheSceneByHalfWidth = gameWidth + halfWidth;

        if(sprite.x < leftOfTheScenseByHalfWidth) {
            sprite.x = rightOfTheSceneByHalfWidth;
        }
        else if (sprite.x > rightOfTheSceneByHalfWidth) {
            sprite.x = leftOfTheScenseByHalfWidth;
        }
    }
}