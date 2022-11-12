import * as game from "../game/Game";
import * as plant from "../game/Plant";
import { config } from "../model/Config";

let sampleText: Phaser.GameObjects.Text;

/** Main game scene */
export class MainScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    plants: { [id: number]: Phaser.GameObjects.Image }

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
        this.plants = {};
        Object.keys(this.gardenGame.plants).forEach(id => {
            let pos = this.gardenGame.plants[id].position;
            //TODO texture name for different plants
            this.plants[id] = this.add.image(pos.x, pos.y, "plant");
        });
    }
    
    /** Main game update loop */
    update(time, delta) {
        game.update(this.gardenGame, delta);

        // Update gameobject positions
        Object.keys(this.gardenGame.plants).forEach(id => {
            let plant: plant.Plant = this.gardenGame.plants[id];
            this.plants[plant.id].setPosition(plant.position.x, plant.position.y);
        });
    }
}