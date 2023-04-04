import * as game from "../game/Game";
import { FruitGrowthStage, Plant } from "../game/Plant";
import { config } from "../model/Config";
import { PlantStatusBar, StatusBar, updateStatusBars } from "../game/PlantStatusBar";
import { addFruitGrowthListener, addFruitHarvestListener, addHazardCreatedListener, addHazardDestroyedListener, addPlantDestroyListener, addWeatherUpdateListener } from "../events/EventMessenger";
import { Weather } from "../game/Weather";
import { ActiveHazard, getHazardMotion, getHazardPath, getHazardTimeToActive, getRandomizedHazards, hasApproachAnimation, Hazard } from "../game/Hazard";
import { createSwayAnimation, flashSprite } from "../util/Util";
import { loadSounds, playSound, stopAllSounds, stopSound } from "../audio/Sound";

const statusBarYMargin = 27;
const statusIconXMargin = 15;
const statusArrowXMargin = 40;
const hazardToolClickRadius = 100;
const plantYMargin = 100;
const backgroundFadeDurationMs = 1000;
const hazardFadeDurationMs = 800;
const hazardFlashDuration = 100;
const hazardFlashColor = 0xf2c3b8;

let listenersInitialized = false;

/** Main game scene */
export class MainScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    plantStatusBars: { [id: number] : PlantStatusBar }
    plantFruitImages: { [id: number] : Phaser.GameObjects.Sprite }
    hazardImages: { [id: number] : Phaser.GameObjects.Image }
    background: Phaser.GameObjects.Image;
    backgroundWipe: Phaser.GameObjects.Image;
    particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    hazardParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

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
        this.backgroundWipe.setScale(xScale, yScale);

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
        this.backgroundWipe = this.add.image(0, 0, this.gardenGame.weather).setOrigin(0, 0).setAlpha(0);

        this.createAnimations();
        this.createPlant(0, 0);
        
        let particles = this.add.particles('particle');
        let redParticles = this.add.particles('redparticle');
        this.particleEmitter = particles.createEmitter({
            speed: 90,
            gravityY: 200,
            scale: 3,
            tint: 0xD9C8BF,
            frequency: -1,
            rotate: { min: 0, max: 360 },
            lifespan: 3000,
        });
        this.hazardParticleEmitter = redParticles.createEmitter({
            speed: 100,
            gravityY: 50,
            scale: 2,
            frequency: -1,
            rotate: { min: 0, max: 360 },
            lifespan: 750,
        }).setAlpha(function (p, k, t) {
            return 1 - t;
        });

        loadSounds(this);

        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    createAnimations() {
        createSwayAnimation(this, 'plantsway', [
                { key: 'plant1' },
                { key: 'plant2' },
            ]);
        createSwayAnimation(this, 'fruitsmallsway', [
                { key: 'fruitsmall1' },
                { key: 'fruitsmall2' },
            ]);
        createSwayAnimation(this, 'fruitmediumsway', [
                { key: 'fruitmedium1' },
                { key: 'fruitmedium2' },
            ]);
        createSwayAnimation(this, 'fruitlargesway', [
                { key: 'fruitlarge1' },
                { key: 'fruitlarge2' },
            ]);
        getRandomizedHazards().forEach(hazard => {
            this.createHazardAnimations(hazard);
        });
    }

    createHazardAnimations(hazard: Hazard) {
        if (hasApproachAnimation(hazard)) {
            createSwayAnimation(this, hazard + "approach", [
                { key: hazard + "approach1" },
                { key: hazard + "approach2" },
            ]);
            createSwayAnimation(this, hazard + "idle", [
                { key: hazard + "idle1" },
                { key: hazard + "idle2" },
            ]);
        } else {
            createSwayAnimation(this, hazard + "idle", [
                { key: hazard + "1" },
                { key: hazard + "2" },
            ]);
        }
    }

    createPlant(x: number, y: number): Plant {
        let sprite = this.add.sprite(x, y, 'plant1').setScale(0.25).play('plantsway');
        let plant = game.addPlant(this.gardenGame, sprite);
        this.createStatusBars(plant);

        plant.gameObject.setInteractive();
        plant.gameObject.on("pointerdown", () => {
            game.useSelectedTool(this.gardenGame, plant);
        });
        return plant;
    }

    createStatusBar(iconTexture: string): StatusBar {
        let barBackground = this.add.image(0, 0, "statusBarBackground").setOrigin(0.5);
        let bar = this.add.image(0, 0, "statusBarHealth").setOrigin(0.5);
        bar.setTint(parseInt(config()["healthyLevelColor"], 16));
        let icon = this.add.image(0, 0, iconTexture);
        let arrow = this.add.image(0, 0, "uparrow");
        let mask = this.add.graphics().setAlpha(0);
        bar.setMask(new Phaser.Display.Masks.GeometryMask(this, mask));
        return {
            statusBarBackground: barBackground,
            statusBar: bar,
            statusBarMask: mask,
            icon: icon,
            arrow: arrow
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
        statusBar.statusBar.setPosition(plant.gameObject.x, backgroundY);
        statusBar.statusBarMask.fillRect(statusBar.statusBarBackground.getTopLeft().x, statusBar.statusBarBackground.getTopLeft().y,
            statusBar.statusBarBackground.width, statusBar.statusBarBackground.height);
        statusBar.icon.setPosition(statusBar.statusBarBackground.getTopLeft().x - statusIconXMargin,
            statusBar.statusBarBackground.y);
        statusBar.arrow.setPosition(statusBar.statusBarBackground.getTopLeft().x - statusArrowXMargin,
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
        }
        this.setStatusBarsPosition(this.plantStatusBars[plant.id], plant);
    }

    destroyStatusBar(statusBar: StatusBar) {
        statusBar.statusBar.destroy();
        statusBar.statusBarBackground.destroy();
        statusBar.icon.destroy();
        statusBar.arrow.destroy();
    }
    
    /** Handle hazard being created */
    handleHazardCreated(scene: MainScene, hazardId: number) {
        let activeHazard: ActiveHazard = scene.gardenGame.activeHazards[hazardId];
        let plant: Plant = scene.gardenGame.plants[activeHazard.targetPlantId];
        let plantImage: Phaser.GameObjects.Image = plant.gameObject;
        let path = getHazardPath(plantImage, getHazardMotion(activeHazard.hazard));
        let texture = activeHazard.hazard.toString() + "1";
        let hasAnimation = hasApproachAnimation(activeHazard.hazard);
        if (hasAnimation) {
            texture = activeHazard.hazard + "approach1";
        }
        let hazardImage = scene.add.sprite(path.start.x, path.start.y, texture);
        if (hasAnimation) {
            hazardImage.play(activeHazard.hazard + "approach");
        } else {
            hazardImage.play(activeHazard.hazard + "idle");
        }
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
            onComplete: function() {
                if (hasAnimation && hazardImage && hazardImage.active) {
                    hazardImage.play(activeHazard.hazard + "idle");
                }
            }
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
        playSound(this, activeHazard.hazard, true);
    }

    handleHazardDestroy(scene: MainScene, hazardId: number) {
        let activeHazard: ActiveHazard = scene.gardenGame.activeHazards[hazardId];
        flashSprite(scene.hazardImages[hazardId], hazardFlashDuration, scene, hazardFlashColor);
        scene.hazardParticleEmitter.explode(10, scene.hazardImages[hazardId].x, scene.hazardImages[hazardId].y);
        // Get a random angle, either between -pi/3 and -2pi/3, or between pi/3 and 2pi/3, so that the image always
        // rotates a good amount
        let multiplier = 1;
        if (Math.random() <= 0.5) {
            multiplier = -1;
        }
        let targetRotation = ((Math.random() * Math.PI / 3) + (Math.PI / 3)) * multiplier;
        scene.tweens.add({
            duration: hazardFadeDurationMs,
            alpha: {
                from: 1,
                to: 0
            },
            rotation: {
                from: scene.hazardImages[hazardId].rotation,
                to: targetRotation
            },
            targets: scene.hazardImages[hazardId],
            onComplete: function() {
                scene.hazardImages[hazardId].destroy();
                delete scene.hazardImages[hazardId];
            }
        });

        stopSound(activeHazard.hazard);
        // Play sounds of tool that destroyed the hazard
        playSound(scene, config()["hazards"][activeHazard.hazard.toString()]["destroyTool"]);
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

        //TODO if more than one plant is allowed, need to handle game over logic elsewhere
        stopAllSounds();
    }

    /** Handle weather being changed (may be called even if the new weather is the same) */
    handleWeatherUpdate(scene: MainScene, weather: Weather, _weatherQueue: Weather[]) {
        // Rotate the backgrounds
        let weatherChanged = weather != scene.background.texture.key;
        if (weatherChanged) {
            scene.backgroundWipe.setAlpha(1);
            scene.background.setTexture(weather);
            scene.tweens.add({
                duration: backgroundFadeDurationMs,
                alpha: {
                    from: 1,
                    to: -0.2
                },
                targets: scene.backgroundWipe,
                onComplete() {
                    scene.backgroundWipe.setAlpha(0);
                    scene.backgroundWipe.setTexture(weather);
                    scene.backgroundWipe.y = 0;
                }
            });
        } else {
            scene.background.setTexture(weather);
        }
    }

    /** Handle a fruit being grown for a plant */
    handleFruitGrowth(scene: MainScene, plant: Plant) {
        let pos = plant.gameObject.getRightCenter();
        let sprite;
        switch (plant.fruitGrowthStage) {
            case FruitGrowthStage.Small:
                sprite = scene.add.sprite(pos.x, pos.y, 'fruitsmall1').setScale(0.25).play('fruitsmallsway');
                break;
            case FruitGrowthStage.Medium:
                sprite = scene.add.sprite(pos.x, pos.y, 'fruitmedium1').setScale(0.25).play('fruitmediumsway');
                scene.plantFruitImages[plant.id].destroy()
                break;
            case FruitGrowthStage.FullyGrown:
                sprite = scene.add.sprite(pos.x, pos.y, 'fruitlarge1').setScale(0.25).play('fruitlargesway');
                scene.plantFruitImages[plant.id].destroy()
                break;
        }
        scene.plantFruitImages[plant.id] = sprite;
    }

    /** Handle a fruit being harvested for a plant */
    handleFruitHarvest(scene: MainScene, plant: Plant) {
        scene.particleEmitter.explode(25, scene.plantFruitImages[plant.id].x, scene.plantFruitImages[plant.id].y);
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