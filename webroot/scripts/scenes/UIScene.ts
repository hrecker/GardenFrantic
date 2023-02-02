import { addScoreUpdateListener, addWeatherUpdateListener } from "../events/EventMessenger";
import * as game from "../game/Game";
import { Weather } from "../game/Weather";
import { config } from "../model/Config";

const weatherPreviewY = 45;
const weatherImageWidth = 50;
const scoreY = 105;

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

    init(data) {
        this.gardenGame = data.gardenGame;
        // Event listeners
        addScoreUpdateListener(this.handleScoreUpdate, this);
        addWeatherUpdateListener(this.handleWeatherUpdate, this);
    }

    create() {
        let uiCenterX = (this.game.renderer.width - config()["toolbarWidth"]) / 2;
        this.scoreText = this.add.bitmapText(uiCenterX, scoreY,
            "uiFont", "0", 48).setOrigin(0.5);//.setTintFill(parseInt(config()["uiFontColor"], 16));
        // Weather queue images
        this.weatherImages = [];
        let leftX = uiCenterX - (((this.gardenGame.weatherQueue.length / 2.0) - 0.5) * weatherImageWidth);
        for (let i = 0; i < this.gardenGame.weatherQueue.length; i++) {
            this.weatherImages.push(this.add.image(leftX + (i * weatherImageWidth), weatherPreviewY, 
                this.gardenGame.weatherQueue[i] + "Preview"));
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