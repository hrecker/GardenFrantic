import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { Tool } from "../game/Tool";
import { addPlantDestroyListener } from "../events/EventMessenger";

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
        // Event listeners
        addPlantDestroyListener(this.handlePlantDestroy, this);
    }

    create() {
        this.plantStatusBars = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);
        let startingPlant = game.addPlant(this.gardenGame, this.add.image(350, 350, "plant"));
        this.createStatusBar(startingPlant);

        startingPlant.gameObject.setInteractive();
        startingPlant.gameObject.on("pointerdown", () => {
            game.useSelectedTool(this.gardenGame, startingPlant);
        });
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
        let waterIcon = this.add.image(waterBarBackground.getTopLeft().x - statusIconXMargin, waterBarBackground.y, "waterIcon");
        let lightIcon = this.add.image(lightBarBackground.getTopLeft().x - statusIconXMargin, lightBarBackground.y, "lightIcon");

        this.plantStatusBars[plant.id] = {
            waterStatusBar: waterBar,
            waterStatusBarBackground: waterBarBackground,
            waterIcon: waterIcon,
            lightStatusBar: lightBar,
            lightStatusBarBackground: lightBarBackground,
            lightIcon: lightIcon,
            maxStatusBarWidth: waterBarBackground.width - (statusBarXPadding * 2)
        }
    }

    handlePlantDestroy(scene: MainScene, plant: Plant) {
        // Destroy the corresponding status bars
        scene.plantStatusBars[plant.id].lightStatusBar.destroy();
        scene.plantStatusBars[plant.id].lightStatusBarBackground.destroy();
        scene.plantStatusBars[plant.id].lightIcon.destroy();
        scene.plantStatusBars[plant.id].waterStatusBar.destroy();
        scene.plantStatusBars[plant.id].waterStatusBarBackground.destroy();
        scene.plantStatusBars[plant.id].waterIcon.destroy();
        delete scene.plantStatusBars[plant.id];
    }
    
    /** Main game update loop */
    update(time, delta) {
        game.update(this.gardenGame, delta);

        Object.keys(this.gardenGame.plants).forEach(id => {
            updateStatusBars(this.plantStatusBars[id], this.gardenGame.plants[id]);
        })
    }
}