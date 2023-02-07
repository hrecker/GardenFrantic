import { addScoreUpdateListener, addWeatherUpdateListener } from "../events/EventMessenger";
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

    init(data) {
        this.gardenGame = data.gardenGame;
        // Event listeners
        addScoreUpdateListener(this.handleScoreUpdate, this);
        addWeatherUpdateListener(this.handleWeatherUpdate, this);
    }

    create() {
        this.scoreText = this.add.bitmapText(uiXMargin, uiY - 8,
            "uiFont", "0", 48).setOrigin(0, 0.5);//.setTintFill(parseInt(config()["uiFontColor"], 16));
        // Weather queue images
        this.weatherImages = [];
        let rightX = this.game.renderer.width - config()["toolbarWidth"] - uiXMargin - (weatherImageWidth / 2);
        for (let i = 0; i < this.gardenGame.weatherQueue.length; i++) {
            let pos = this.gardenGame.weatherQueue.length - i - 1;
            this.weatherImages.push(this.add.image(rightX - (pos * weatherImageWidth), uiY, 
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