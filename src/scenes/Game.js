import Carrot from '../game/Carrot.js';
import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {
    /** @type {Phaser.Physics.Arcade.StaticBody} */
    player;
    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors;
    /** @type {Phaser.Physics.Arcade.Group} */
    carrots;

    carrotsCollected = 0;
    /** @type {Phaser.GameObjects.Text} */
    scoreBoard;

    constructor() {
        super('game')
    }

    init() {
        this.carrotsCollected = 0;
    }

    preload() {
        this.load.image("background", "assets/bg_layer1.png");
        this.load.image("platform", "assets/ground_grass.png");
        this.load.image("player", "assets/bunny1_stand.png");
        this.load.image("carrot", "assets/carrot.png");
        this.load.image("player-jump", "assets/bunny1_jump.png");
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.createNonInteractables();
        this.createPlatforms();
        this.createPlayer();
        this.createCarrots();   
    }

    createNonInteractables() {
        this.add.image(240, 320, "background").setScrollFactor(1, 0);
        this.cameras.main.setDeadzone(this.scale.width * 1.5);
        this.createScoreBoard();
    }
    
    createScoreBoard() {
        const style = { color: "#000", fontSize: 24 };
        this.scoreBoard = this.add.text(240, 10, "Carrots: 0", style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);
    }

    createPlayer() {
        this.player = this.physics.add.image(240, 320, "player").setScale(0.5);
        this.physics.add.collider(this.platforms, this.player);
        this.player.body.checkCollision = {
            up: false,
            down: true,
            left: false,
            right: false,
        };
        this.cameras.main.startFollow(this.player);
    }

    createCarrots() {
        this.carrots = this.physics.add.group({ classType: Carrot });
        this.carrots.get(240, 320, "carrot");
        this.physics.add.collider(this.platforms, this.carrots);
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        );
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;

            const platform = this.platforms.create(x, y, "platform");
            platform.scale = 0.5;

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body;
            body.updateFromGameObject();
        }
    }

    update() {
        /** @type {Phaser.Physics.Arcade.StaticBody} */
        const body = this.player.body;
        const touchingDown = body.touching.down;
        if (touchingDown) {
            this.player.setVelocityY(-300);
            // Switch to player-jump texture
            this.player.setTexture("player-jump");
        }
        else {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-200);
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(200);
            }
            else {
                this.player.setVelocityX(0);
            }
        }
        const vy = this.player.body.velocity.y;
        // Check if player is falling
        if(vy > 0 && this.player.texture.key !== "player") {
            // Swith back to player texture
            this.player.setTexture("player");
        }

        this.reuse(this.carrots);
        this.reuse(this.platforms, this.addCarrotAbove, this);

        this.horizontalWrap(this.player);

        const bottomMost = this.findBottomMostPlatform();
        if(this.player.y > bottomMost + 500) {
            this.scene.start("game-over");
        }
    }

    /**
        @param {Phaser.Arcade.Group} group
        @param {Function} callOnReuse
        @param {Context} context 
    */
    reuse(group, callOnReuse, context) {
        group.children.iterate(child => {
            const { scrollY } = this.cameras.main;

            if (child.y > scrollY + 700) {
                child.y = scrollY + Phaser.Math.Between(50, 100);
                child.body.updateFromGameObject();
                if (callOnReuse) {
                    callOnReuse.call(context, child);
                }
            }
        });
    }

    /**
        @param {Phaser.GameObjects.Sprite} sprite
    */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5;
        const gameWidth = this.scale.width;
        const leftOfTheScenseByHalfWidth = -halfWidth;
        const rightOfTheSceneByHalfWidth = gameWidth + halfWidth;

        if (sprite.x < leftOfTheScenseByHalfWidth) {
            sprite.x = rightOfTheSceneByHalfWidth;
        }
        else if (sprite.x > rightOfTheSceneByHalfWidth) {
            sprite.x = leftOfTheScenseByHalfWidth;
        }
    }

    /**
        @param {Phaser.GameObjects.Sprite} sprite
    */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight;
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, "carrot");

        // Set carrot active and visible
        carrot.setActive(true);
        carrot.setVisible(true);

        //carrot.body.setSize(carrot.x, carrot.y);

        // make sure body is enabled in physics world
        this.physics.world.enable(carrot);
        return carrot;
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     */
    handleCollectCarrot(player, carrot) {
        // hide from display
        this.carrots.killAndHide(carrot);
        // disable from physics world
        this.physics.world.disableBody(carrot.body);
        // Update Score Board
        const text = `Carrots: ${this.carrotsCollected++}`;
        this.scoreBoard.text = text;
    }

    findBottomMostPlatform() {
        const platforms = this.platforms.getChildren();
        const bottomMost = platforms[0].y;
        platforms.forEach(platform => {
            if (platform.y > bottomMost.y) {
                bottomMost = platform;
            }
        });
        return bottomMost;
    }
}