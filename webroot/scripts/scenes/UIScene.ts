import { addScoreUpdateListener } from "../events/EventMessenger";
import * as game from "../game/Game";
import { config } from "../model/Config";

const scoreY = 50;

/** UI scene */
export class UIScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    scoreText: Phaser.GameObjects.BitmapText;

    constructor() {
        super({
            key: "UIScene"
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
        // Event listeners
        addScoreUpdateListener(this.handleScoreUpdate, this);
    }

    create() {
        this.scoreText = this.add.bitmapText((this.game.renderer.width - config()["toolbarWidth"]) / 2, scoreY, "uiFont", "0", 48).setTintFill(parseInt(config()["uiFontColor"], 16)).setOrigin(0.5);
    }

    handleScoreUpdate(scene: UIScene, score: number) {
        scene.scoreText.setText(score.toString());
    }
}