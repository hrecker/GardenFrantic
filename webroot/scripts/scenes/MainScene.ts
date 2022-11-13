import * as game from "../game/Game";
import * as plant from "../game/Plant";
import { config } from "../model/Config";

let sampleText: Phaser.GameObjects.Text;

/** Main game scene */
export class MainScene extends Phaser.Scene {
    gardenGame: game.GardenGame;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
    }

    create() {
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);
        game.startGame(this.gardenGame, this);
    }
    
    /** Main game update loop */
    update(time, delta) {
        game.update(this.gardenGame, delta);
    }
}