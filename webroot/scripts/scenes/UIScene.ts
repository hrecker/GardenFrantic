import { addGameResetListener, addScoreUpdateListener, addWeatherUpdateListener } from "../events/EventMessenger";
import * as game from "../game/Game";
import { Weather } from "../game/Weather";
import { config } from "../model/Config";

const uiY = 35;
const uiXMargin = 15;
const weatherImageWidth = 50;

/** UI scene */
export class UIScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    scoreText: Phaser.GameObjects.BitmapText;

    weatherImages: Phaser.GameObjects.Image[];

    constructor() {
        super({
            key: "UIScene"
        });
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && ! force) {
            return;
        }
        this.scoreText.setPosition(uiXMargin, uiY - 8);
        
        let rightX = this.game.renderer.width - config()["toolbarWidth"] - uiXMargin - (weatherImageWidth / 2);
        console.log(rightX);
        for (let i = 0; i < this.weatherImages.length; i++) {
            let pos = this.weatherImages.length - i - 1;
            this.weatherImages[i].setPosition(rightX - (pos * weatherImageWidth), uiY);
        }
    }

    init(data) {
        this.gardenGame = data.gardenGame;
        // Event listeners
        addScoreUpdateListener(this.handleScoreUpdate, this);
        addWeatherUpdateListener(this.handleWeatherUpdate, this);
        addGameResetListener(this.resetGameListener, this);
    }

    create() {
        this.scoreText = this.add.bitmapText(0, 0, "uiFont", "0", 48).setOrigin(0, 0.5);
        // Weather queue images
        this.weatherImages = [];
        for (let i = 0; i < this.gardenGame.weatherQueue.length; i++) {
            this.weatherImages.push(this.add.image(0, 0, this.gardenGame.weatherQueue[i] + "Preview"));
        }
        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    resetGameListener(scene: UIScene) {
        scene.scoreText.setText("0");
        for (let i = 0; i < scene.gardenGame.weatherQueue.length; i++) {
            scene.weatherImages[i].setTexture(scene.gardenGame.weatherQueue[i] + "Preview");
        }
    }

    handleScoreUpdate(scene: UIScene, score: number) {
        scene.scoreText.setText(score.toString());
    }

    /** Handle weather queue updating */
    handleWeatherUpdate(scene: UIScene, _weather: Weather, weatherQueue: Weather[]) {
        for (let i = 0; i < weatherQueue.length; i++) {
            scene.weatherImages[i].setTexture(weatherQueue[i] + "Preview");
        }
    }
}