import * as game from "../game/Game";
import { Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, StatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { addFruitGrowthListener, addFruitHarvestListener, addHazardCreatedListener, addHazardDestroyedListener, addPlantDestroyListener, addWeatherUpdateListener } from "../events/EventMessenger";
import { Weather } from "../game/Weather";
import { ActiveHazard, getHazardMotion, getHazardPath, getHazardTimeToActive } from "../game/Hazard";

const statusBarXPadding = 14;
const statusBarYPadding = 2;
const statusBarYMargin = 27;
const statusIconXMargin = 25;
const hazardToolClickRadius = 100;
const plantYMargin = 100;

let listenersInitialized = false;

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
        if (! listenersInitialized) {
            addPlantDestroyListener(this.handlePlantDestroy, this);
            addWeatherUpdateListener(this.handleWeatherUpdate, this);
            addFruitGrowthListener(this.handleFruitGrowth, this);
            addFruitHarvestListener(this.handleFruitHarvest, this);
            addHazardCreatedListener(this.handleHazardCreated, this);
            addHazardDestroyedListener(this.handleHazardDestroy, this);
            listenersInitialized = true;
        }
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && ! force) {
            return;
        }
        
        let width = this.background.width;
        let height = this.background.height;
        let gameWidth = this.game.renderer.width - config()["toolbarWidth"];
        let xScale, yScale = 1;
        if (width < gameWidth) {
            xScale = gameWidth / width;
        }
        if (height < this.game.renderer.height) {
            yScale = this.game.renderer.height / height;
        }
        this.background.setScale(xScale, yScale);

        let plantXAnchor = (this.game.renderer.width - config()["toolbarWidth"]) / 2;
        let plantY = this.game.renderer.height - plantYMargin;

        let ids = Object.keys(this.gardenGame.plants).map(Number);
        for (let i = 0; i < ids.length; i++) {
            let id: number = ids[i];
            //TODO positioning the plants after the first one based on i value
            let plantX = plantXAnchor;
            this.gardenGame.plants[id].gameObject.setPosition(plantX, plantY);
            this.setStatusBarsPosition(this.plantStatusBars[id], this.gardenGame.plants[id]);
            //TODO resizing hazards?
        }
    }

    create() {
        this.plantStatusBars = {};
        this.plantFruitImages = {};
        this.hazardImages = {};
        this.cameras.main.setBackgroundColor(config()["backgroundColor"]);

        this.background = this.add.image(0, 0, this.gardenGame.weather).setOrigin(0, 0);

        this.createPlant(0, 0);

        this.resize(true);
        this.scale.on("resize", this.resize, this);
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

    createStatusBar(iconTexture: string): StatusBar {
        let barBackground = this.add.image(0, 0, "statusBarBackground").setOrigin(0.5);
        let bar = this.add.rectangle(0, 0, 0, 0,
            parseInt(config()["healthyLevelColor"], 16)).setOrigin(0, 0.5);
        let icon = this.add.image(0, 0, iconTexture);
        return {
            statusBarBackground: barBackground,
            statusBar: bar,
            icon: icon
        };
    }

    setStatusBarsPosition(statusBar: PlantStatusBar, plant: Plant) {
        this.setStatusBarPosition(statusBar.waterStatusBar,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 4), plant);
        this.setStatusBarPosition(statusBar.lightStatusBar,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 3), plant);
        this.setStatusBarPosition(statusBar.fruitStatusBar,
            plant.gameObject.getTopCenter().y - (statusBarYMargin * 2), plant);
        this.setStatusBarPosition(statusBar.healthStatusBar,
            plant.gameObject.getTopCenter().y - statusBarYMargin, plant);
    }

    setStatusBarPosition(statusBar: StatusBar, backgroundY: number, plant: Plant) {
        statusBar.statusBarBackground.setPosition(plant.gameObject.x, backgroundY);
        statusBar.statusBar.setPosition(statusBar.statusBarBackground.getTopLeft().x + statusBarXPadding,
            statusBar.statusBarBackground.y);
        statusBar.statusBar.setSize(statusBar.statusBarBackground.width / 2 - statusBarXPadding,
            statusBar.statusBarBackground.height - (statusBarYPadding * 2));
        statusBar.icon.setPosition(statusBar.statusBarBackground.getTopLeft().x - statusIconXMargin,
            statusBar.statusBarBackground.y);
    }

    createStatusBars(plant: Plant) {
        let waterBar = this.createStatusBar("waterIcon");
        let lightBar = this.createStatusBar("lightIcon");
        let fruitBar = this.createStatusBar("fruitIcon");
        let healthBar = this.createStatusBar("healthIcon");
        this.plantStatusBars[plant.id] = {
            waterStatusBar: waterBar,
            lightStatusBar: lightBar,
            fruitStatusBar: fruitBar,
            healthStatusBar: healthBar,
            maxStatusBarWidth: waterBar.statusBarBackground.width - (statusBarXPadding * 2)
        }
        this.setStatusBarsPosition(this.plantStatusBars[plant.id], plant);
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
        let path = getHazardPath(plantImage, getHazardMotion(activeHazard.hazard));
        let hazardImage = scene.add.image(path.start.x, path.start.y, activeHazard.hazard.toString());
        scene.tweens.add({
            duration: getHazardTimeToActive(activeHazard.hazard),
            x: {
                from: path.start.x,
                to: path.end.x
            },
            y: {
                from: path.start.y,
                to: path.end.y
            },
            targets: hazardImage,
        });
        scene.hazardImages[hazardId] = hazardImage;
        hazardImage.setInteractive();
        hazardImage.on("pointerdown", () => {
            // If this hazard is relatively close to the plant, just treat it like a click on the plant itself
            // This allows using non-hazard related tools when clicking on a hazard
            if (! game.removeHazardIfRightToolSelected(scene.gardenGame, activeHazard) &&
                    Phaser.Math.Distance.Between(plantImage.x, plantImage.y, hazardImage.x, hazardImage.y) < hazardToolClickRadius) {
                game.useSelectedTool(scene.gardenGame, plant);
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
        if (Object.keys(this.gardenGame.plants).length > 0) {
            game.update(this.gardenGame, delta);
            Object.keys(this.gardenGame.plants).forEach(id => {
                updateStatusBars(this.plantStatusBars[id], this.gardenGame, this.gardenGame.plants[id]);
            });

        } else if (config()["automaticRestart"]["enabled"]) {
            this.time.delayedCall(config()["automaticRestart"]["restartTime"],
                () => {
                    game.resetGame(this.gardenGame);
                    this.scene.restart()
                });
        }
    }
}