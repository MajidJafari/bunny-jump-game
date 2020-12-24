import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene {
    constructor() {
        super("game-over");
    }

    create() {
        const { width, height } = this.scale;
        this.add.text(width * 0.5, height * 0.5, "Game Over", {
            fontSize: 48
        })
        .setOrigin(0.5);
        
        const keyObject = this.input.keyboard.addKey("SPACE")
        keyObject.once("down", () => {
            keyObject.destroy();
            this.scene.start("game");
        })
    }
} 