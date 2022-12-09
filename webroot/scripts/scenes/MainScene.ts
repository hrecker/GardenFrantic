import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { ActiveTool, getCategory } from "../game/Tool";
import { addFruitGrowthListener, addFruitHarvestListener, addPlantDestroyListener, addWeatherUpdateListener } from "../events/EventMessenger";
import { Weather } from "../game/Weather";

const statusBarXPadding = 14;
const statusBarYPadding = 2;
const statusBarYMargin = 35;
const statusIconXMargin = 25;

const toolYByCategory = {
    "water": 50,
    "light": 100
};

/** Main game scene */
export class MainScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    plantStatusBars: { [id: number] : PlantStatusBar }
    plantFruitImages: { [id: number] : Phaser.GameObjects.Image }
    background: Phaser.GameObjects.Image;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    init(data) {
        this.gardenGame = data.gardenGame;
        // Event listeners
        addPlantDestroyListener(this.handlePlantDestroy, this);
        addWeatherUpdateListener(this.handleWeatherUpdate, this);
        addFruitGrowthListener(this.handleFruitGrowth, this);
        addFruitHarvestListener(this.handleFruitHarvest, this);
    }

    create() {
        this.plantStatusBars = {};
        this.plantFruitImages = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);

        this.background = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, this.gardenGame.weather);

        this.createPlant(250, 350);
        this.createPlant(450, 350);
    }

    createPlant(x: number, y: number): Plant {
        let plant = game.addPlant(this.gardenGame, this.add.image(x, y, "plant"));
        this.createStatusBar(plant);

        plant.gameObject.setInteractive();
        plant.gameObject.on("pointerdown", () => {
            let newActiveTool = game.useSelectedTool(this.gardenGame, plant);
            if (newActiveTool != null) {
                // Create a gameobject to represent the active tool
                this.createActiveToolGameObject(newActiveTool, plant);
            }
        });
        return plant;
    }

    createActiveToolGameObject(activeTool: ActiveTool, plant: Plant) {
        let topLeft = plant.gameObject.getTopLeft();
        let toolImage = this.add.image(topLeft.x,
            topLeft.y + toolYByCategory[getCategory(activeTool.tool)], activeTool.tool);
        activeTool.gameObject = toolImage;
        toolImage.setInteractive();
        toolImage.on("pointerdown", () => {
            game.removeActiveTool(this.gardenGame, plant, getCategory(activeTool.tool));
        });
    }

    createStatusBar(plant: Plant) {
        let waterBarBackground = this.add.image(plant.gameObject.x,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 3), "statusBarBackground").setOrigin(0.5);
        let lightBarBackground = this.add.image(plant.gameObject.x,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 2), "statusBarBackground").setOrigin(0.5);
        let fruitBarBackground = this.add.image(plant.gameObject.x,
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
        let fruitBar = this.add.rectangle(fruitBarBackground.getTopLeft().x + statusBarXPadding,
            fruitBarBackground.y,
            fruitBarBackground.width / 2 - statusBarXPadding,
            fruitBarBackground.height - (statusBarYPadding * 2),
            parseInt(config()["healthyLevelColor"], 16)).setOrigin(0, 0.5);
        
        // Icons
        let waterIcon = this.add.image(waterBarBackground.getTopLeft().x - statusIconXMargin, waterBarBackground.y, "waterIcon");
        let lightIcon = this.add.image(lightBarBackground.getTopLeft().x - statusIconXMargin, lightBarBackground.y, "lightIcon");
        let fruitIcon = this.add.image(fruitBarBackground.getTopLeft().x - statusIconXMargin, fruitBarBackground.y, "fruitIcon");

        this.plantStatusBars[plant.id] = {
            waterStatusBar: waterBar,
            waterStatusBarBackground: waterBarBackground,
            waterIcon: waterIcon,
            lightStatusBar: lightBar,
            lightStatusBarBackground: lightBarBackground,
            lightIcon: lightIcon,
            fruitStatusBar: fruitBar,
            fruitStatusBarBackground: fruitBarBackground,
            fruitIcon: fruitIcon,
            maxStatusBarWidth: waterBarBackground.width - (statusBarXPadding * 2)
        }
    }

    /** Handle plant being destroyed */
    handlePlantDestroy(scene: MainScene, plant: Plant) {
        // Destroy the corresponding status bars
        scene.plantStatusBars[plant.id].lightStatusBar.destroy();
        scene.plantStatusBars[plant.id].lightStatusBarBackground.destroy();
        scene.plantStatusBars[plant.id].lightIcon.destroy();
        scene.plantStatusBars[plant.id].waterStatusBar.destroy();
        scene.plantStatusBars[plant.id].waterStatusBarBackground.destroy();
        scene.plantStatusBars[plant.id].waterIcon.destroy();
        scene.plantStatusBars[plant.id].fruitStatusBar.destroy();
        scene.plantStatusBars[plant.id].fruitStatusBarBackground.destroy();
        scene.plantStatusBars[plant.id].fruitIcon.destroy();
        delete scene.plantStatusBars[plant.id];
    }

    /** Handle weather being changed (may be called even if the new weather is the same) */
    handleWeatherUpdate(scene: MainScene, weather: Weather) {
        scene.background.setTexture(weather);
    }

    /** Handle a fruit being grown for a plant */
    handleFruitGrowth(scene: MainScene, plant: Plant) {
        let pos = plant.gameObject.getRightCenter();
        scene.plantFruitImages[plant.id] = scene.add.image(pos.x, pos.y, "fruitIcon");
    }

    /** Handle a fruit being harvested for a plant */
    handleFruitHarvest(scene: MainScene, plant: Plant) {
        scene.plantFruitImages[plant.id].destroy();
        delete scene.plantFruitImages[plant.id];
    }
    
    /** Main game update loop */
    update(time, delta) {
        game.update(this.gardenGame, delta);

        Object.keys(this.gardenGame.plants).forEach(id => {
            updateStatusBars(this.plantStatusBars[id], this.gardenGame.plants[id]);
        })
    }
}