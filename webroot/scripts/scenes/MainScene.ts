import { config } from "../model/Config";

let sampleText: Phaser.GameObjects.Text;

/** Main game scene */
export class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MainScene"
        });
    }

    create() {
        sampleText = this.add.text(this.game.renderer.width / 2, this.game.renderer.height / 2, "Garden Frantic",
            { font: "bold 64px Verdana",
            stroke: "black",
            strokeThickness: 3,
            color: config()["sampleTextColor"] }).setOrigin(0.5, 0.5);
    }
    
    /** Main game update loop */
    update(time, delta) {
    }
}