import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, StatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { addFruitGrowthListener, addFruitHarvestListener, addHazardCreatedListener, addHazardDestroyedListener, addPlantDestroyListener, addWeatherUpdateListener } from "../events/EventMessenger";
import { Weather } from "../game/Weather";
import { ActiveHazard } from "../game/Hazard";

const statusBarXPadding = 14;
const statusBarYPadding = 2;
const statusBarYMargin = 27;
const statusIconXMargin = 25;
const hazardToolClickRadius = 100;

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
        addHazardDestroyedListener(this.handleHazardDestroy, this);
    }

    create() {
        this.plantStatusBars = {};
        this.plantFruitImages = {};
        this.hazardImages = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);

        this.background = this.add.image(0, 0, this.gardenGame.weather).setOrigin(0, 0);

        //this.createPlant(200, 350);
        this.createPlant((this.game.renderer.width - config()["toolbarWidth"]) / 2, 260);
    }

    createPlant(x: number, y: number): Plant {
        let plant = game.addPlant(this.gardenGame, this.add.image(x, y, "plant"));
        this.createStatusBars(plant);

        plant.gameObject.setInteractive();
        plant.gameObject.on("pointerdown", () => {
            game.useSelectedTool(this.gardenGame, plant);
        });
        return plant;
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
        let plant: Plant = scene.gardenGame.plants[activeHazard.targetPlantId];
        let plantImage: Phaser.GameObjects.Image = plant.gameObject;
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
        hazardImage.setInteractive();
        hazardImage.on("pointerdown", () => {
            // If this hazard is relatively close to the plant, just treat it like a click on the plant itself
            // This allows using non-hazard related tools when clicking on a hazard
            if (Phaser.Math.Distance.Between(plantImage.x, plantImage.y, hazardImage.x, hazardImage.y) < hazardToolClickRadius) {
                game.useSelectedTool(scene.gardenGame, plant);
            } else {
                game.removeHazardIfRightToolSelected(scene.gardenGame, activeHazard);
            }
        });
    }

    handleHazardDestroy(scene: MainScene, hazardId: number) {
        scene.hazardImages[hazardId].destroy();
        delete scene.hazardImages[hazardId];
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
    handleWeatherUpdate(scene: MainScene, weather: Weather, _weatherQueue: Weather[]) {
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