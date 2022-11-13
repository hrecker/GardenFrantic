import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, updateStatusBars } from "./PlantStatusBar";

const statusBarXPadding = 14;
const statusBarYPadding = 2;
const statusBarYMargin = 35;
const statusIconXMargin = 25;

/** Main game scene */
export class MainScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    plantStatusBars: { [id: number] : PlantStatusBar }

    constructor() {
        super({
            key: "MainScene"
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
    }

    create() {
        this.plantStatusBars = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);
        let startingPlant = game.addPlant(this.gardenGame, this.add.image(350, 250, "plant"));
        this.createStatusBar(startingPlant);
    }

    createStatusBar(plant: Plant) {
        let waterBarBackground = this.add.image(plant.gameObject.x,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 2), "statusBarBackground").setOrigin(0.5);
        let lightBarBackground = this.add.image(plant.gameObject.x,
            plant.gameObject.getTopCenter().y - statusBarYMargin, "statusBarBackground").setOrigin(0.5);
        let waterBar = this.add.rectangle(waterBarBackground.getTopLeft().x + statusBarXPadding,
            waterBarBackground.y,
            waterBarBackground.width / 2 - statusBarXPadding,
            waterBarBackground.height - (statusBarYPadding * 2),
            parseInt(config()["healthyLevelColor"], 16)).setOrigin(0, 0.5);
        let lightBar = this.add.rectangle(lightBarBackground.getTopLeft().x + statusBarXPadding,
            lightBarBackground.y,
            lightBarBackground.width / 2 - statusBarXPadding,
            lightBarBackground.height - (statusBarYPadding * 2),
            parseInt(config()["healthyLevelColor"], 16)).setOrigin(0, 0.5);
        
        // Icons
        this.add.image(waterBarBackground.getTopLeft().x - statusIconXMargin, waterBarBackground.y, "waterIcon");
        this.add.image(lightBarBackground.getTopLeft().x - statusIconXMargin, lightBarBackground.y, "lightIcon");

        this.plantStatusBars[plant.id] = {
            waterStatusBar: waterBar,
            lightStatusBar: lightBar,
            maxStatusBarWidth: waterBarBackground.width - (statusBarXPadding * 2)
        }
    }
    
    /** Main game update loop */
    update(time, delta) {
        game.update(this.gardenGame, delta);

        Object.keys(this.gardenGame.plants).forEach(id => {
            updateStatusBars(this.plantStatusBars[id], this.gardenGame.plants[id]);
        })
    }
}