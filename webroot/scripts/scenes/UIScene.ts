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
    weatherImageBorders: Phaser.GameObjects.Image[];
    countdownGraphics: Phaser.GameObjects.Graphics;

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
        for (let i = 0; i < this.weatherImages.length; i++) {
            let pos = this.weatherImages.length - i - 1;
            this.weatherImages[i].setPosition(rightX - (pos * weatherImageWidth), uiY);
            this.weatherImageBorders[i].setPosition(this.weatherImages[i].x, this.weatherImages[i].y);
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
        this.scoreText = this.add.bitmapText(0, 0, "uiFont", "0", 64).setOrigin(0, 0.5);
        // Weather queue images
        this.weatherImages = [];
        this.weatherImageBorders = [];
        let tints = config()["weatherPreviewTints"];
        for (let i = 0; i < this.gardenGame.weatherQueue.length; i++) {
            let tint = parseInt(config()["weatherPreviewTint"], 16);
            this.weatherImages.push(this.add.image(0, 0, this.gardenGame.weatherQueue[i] + "Preview").
                setTint(i == 0 ? 0xffffff : tint));
            this.weatherImageBorders.push(this.add.image(0, 0, "toolbox"));
        }
        this.countdownGraphics = this.add.graphics();

        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    updateCooldownGraphics() {
        let angle = this.gardenGame.currentWeatherDurationMs * 2 * Math.PI / config()["weatherDurationMs"];

        this.countdownGraphics.clear();
        this.countdownGraphics.fillStyle(0x000000, 0.4);
        this.countdownGraphics.beginPath();
        this.countdownGraphics.moveTo(this.weatherImages[0].x, this.weatherImages[0].y);

        if (angle <= Math.PI / 4) {
            let y = this.weatherImages[0].getTopCenter().y;
            let yDiff = this.weatherImages[0].y - y;
            this.countdownGraphics.lineTo(this.weatherImages[0].x + (yDiff * Math.tan(angle)), y);
            this.lineToWeatherImageTop(4);
        } else if (angle <= 3 * Math.PI / 4) {
            let x = this.weatherImages[0].getRightCenter().x;
            let xDiff = x - this.weatherImages[0].x;
            this.countdownGraphics.lineTo(x, this.weatherImages[0].y - (xDiff / Math.tan(angle)));
            this.lineToWeatherImageTop(3);
        } else if (angle <= 5 * Math.PI / 4) {
            let y = this.weatherImages[0].getBottomCenter().y;
            let yDiff = this.weatherImages[0].y - y;
            this.countdownGraphics.lineTo(this.weatherImages[0].x + (yDiff * Math.tan(angle)), y);
            this.lineToWeatherImageTop(2);
        } else if (angle <= 7 * Math.PI / 4) {
            let x = this.weatherImages[0].getLeftCenter().x;
            let xDiff = x - this.weatherImages[0].x;
            this.countdownGraphics.lineTo(x, this.weatherImages[0].y - (xDiff / Math.tan(angle)));
            this.lineToWeatherImageTop(1);
        } else {
            let y = this.weatherImages[0].getTopCenter().y;
            let yDiff = this.weatherImages[0].y - y;
            this.countdownGraphics.lineTo(this.weatherImages[0].x + (yDiff * Math.tan(angle)), y);
            this.lineToWeatherImageTop(0);
        }

        this.countdownGraphics.closePath();
        this.countdownGraphics.fillPath();
    }

    lineToWeatherImageTop(numCornersToAdd: number) {
        if (numCornersToAdd >= 4) {
            this.countdownGraphics.lineTo(this.weatherImages[0].getTopRight().x, this.weatherImages[0].getTopRight().y);
        }
        if (numCornersToAdd >= 3) {
            this.countdownGraphics.lineTo(this.weatherImages[0].getBottomRight().x, this.weatherImages[0].getBottomRight().y);
        }
        if (numCornersToAdd >= 2) {
            this.countdownGraphics.lineTo(this.weatherImages[0].getBottomLeft().x, this.weatherImages[0].getBottomLeft().y);
        }
        if (numCornersToAdd >= 1) {
            this.countdownGraphics.lineTo(this.weatherImages[0].getTopLeft().x, this.weatherImages[0].getTopLeft().y);
        }
        this.countdownGraphics.lineTo(this.weatherImages[0].getTopCenter().x, this.weatherImages[0].getTopCenter().y);
    }

    resetGameListener(scene: UIScene) {
        scene.scoreText.setText("0");
        scene.scoreText.setFont("uiFont");
        for (let i = 0; i < scene.gardenGame.weatherQueue.length; i++) {
            scene.weatherImages[i].setTexture(scene.gardenGame.weatherQueue[i] + "Preview");
        }
    }

    handleScoreUpdate(scene: UIScene, score: number) {
        scene.scoreText.setText(score.toString());
    }

    /** Handle weather queue updating */
    handleWeatherUpdate(scene: UIScene, currentWeather: Weather, weatherQueue: Weather[]) {
        for (let i = 0; i < weatherQueue.length; i++) {
            scene.weatherImages[i].setTexture(weatherQueue[i] + "Preview");
        }
        scene.updateCooldownGraphics();
        if (currentWeather == Weather.Cloudy || currentWeather == Weather.Rain) {
            scene.scoreText.setFont("uiFontWhite");
        } else {
            scene.scoreText.setFont("uiFont");
        }
    }

    update() {
        this.updateCooldownGraphics();
    }
}