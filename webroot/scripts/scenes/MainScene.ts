import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, StatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { ActiveTool, getCategory } from "../game/Tool";
import { addFruitGrowthListener, addFruitHarvestListener, addHazardCreatedListener, addPlantDestroyListener, addWeatherUpdateListener } from "../events/EventMessenger";
import { Weather } from "../game/Weather";
import { ActiveHazard } from "../game/Hazard";

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
    hazardImages: { [id: number] : Phaser.GameObjects.Image }
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
        addHazardCreatedListener(this.handleHazardCreated, this);
    }

    create() {
        this.plantStatusBars = {};
        this.plantFruitImages = {};
        this.hazardImages = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);

        this.background = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, this.gardenGame.weather);

        //this.createPlant(200, 350);
        this.createPlant(500, 350);
    }

    createPlant(x: number, y: number): Plant {
        let plant = game.addPlant(this.gardenGame, this.add.image(x, y, "plant"));
        this.createStatusBars(plant);

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

    createStatusBar(plant: Plant, backgroundY: number, iconTexture: string): StatusBar {
        let barBackground = this.add.image(plant.gameObject.x,
            backgroundY, "statusBarBackground").setOrigin(0.5);
        let bar = this.add.rectangle(barBackground.getTopLeft().x + statusBarXPadding,
            barBackground.y,
            barBackground.width / 2 - statusBarXPadding,
            barBackground.height - (statusBarYPadding * 2),
            parseInt(config()["healthyLevelColor"], 16)).setOrigin(0, 0.5);
        let icon = this.add.image(barBackground.getTopLeft().x - statusIconXMargin, barBackground.y, iconTexture);
        return {
            statusBarBackground: barBackground,
            statusBar: bar,
            icon: icon
        };
    }

    createStatusBars(plant: Plant) {
        let waterBar = this.createStatusBar(plant,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 4), "waterIcon");
        let lightBar = this.createStatusBar(plant,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 3), "lightIcon");
        let fruitBar = this.createStatusBar(plant,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 2), "fruitIcon");
        let healthBar = this.createStatusBar(plant,
            plant.gameObject.getTopCenter().y - statusBarYMargin, "healthIcon");
        this.plantStatusBars[plant.id] = {
            waterStatusBar: waterBar,
            lightStatusBar: lightBar,
            fruitStatusBar: fruitBar,
            healthStatusBar: healthBar,
            maxStatusBarWidth: waterBar.statusBarBackground.width - (statusBarXPadding * 2)
        }
    }

    destroyStatusBar(statusBar: StatusBar) {
        statusBar.statusBar.destroy();
        statusBar.statusBarBackground.destroy();
        statusBar.icon.destroy();
    }
    
    /** Handle hazard being created */
    handleHazardCreated(scene: MainScene, hazardId: number) {
        let activeHazard: ActiveHazard = scene.gardenGame.activeHazards[hazardId];
        let plantImage: Phaser.GameObjects.Image = scene.gardenGame.plants[activeHazard.targetPlantId].gameObject;
        let hazardImage: Phaser.GameObjects.Image;
        let tweenConfig: any = {
            duration: config()["hazardTimeToActiveMs"]
        }
        switch(config()["hazards"][activeHazard.hazard.toString()]["motion"]) {
            case "walk":
                hazardImage = scene.add.image(0, plantImage.y, activeHazard.hazard.toString());
                tweenConfig.x = {
                    from: hazardImage.x,
                    to: plantImage.getCenter().x
                }
                break;
            case "swoop":
                hazardImage = scene.add.image(0, 0, activeHazard.hazard.toString());
                tweenConfig.x = {
                    from: hazardImage.x,
                    to: plantImage.getTopCenter().x
                }
                tweenConfig.y = {
                    from: hazardImage.y,
                    to: plantImage.getTopCenter().y
                }
                break;
            case "grow":
                hazardImage = scene.add.image(plantImage.x, plantImage.getBottomCenter().y + 100, activeHazard.hazard.toString());
                tweenConfig.y = {
                    from: hazardImage.y,
                    to: plantImage.getBottomCenter().y
                }
                break;
        }
        tweenConfig.targets = hazardImage;
        scene.tweens.add(tweenConfig);
        scene.hazardImages[hazardId] = hazardImage;
    }

    /** Handle plant being destroyed */
    handlePlantDestroy(scene: MainScene, plant: Plant) {
        // Destroy the corresponding status bars
        scene.destroyStatusBar(scene.plantStatusBars[plant.id].lightStatusBar);
        scene.destroyStatusBar(scene.plantStatusBars[plant.id].waterStatusBar);
        scene.destroyStatusBar(scene.plantStatusBars[plant.id].fruitStatusBar);
        scene.destroyStatusBar(scene.plantStatusBars[plant.id].healthStatusBar);
        delete scene.plantStatusBars[plant.id];
        // Destroy hazards for the plant
        plant.activeHazardIds.forEach(id => {
            scene.hazardImages[id].destroy();
            delete scene.hazardImages[id];
        });

        if (plant.id in scene.plantFruitImages) {
            scene.plantFruitImages[plant.id].destroy();
            delete scene.plantFruitImages[plant.id];
        }
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
            updateStatusBars(this.plantStatusBars[id], this.gardenGame, this.gardenGame.plants[id]);
        })
    }
}