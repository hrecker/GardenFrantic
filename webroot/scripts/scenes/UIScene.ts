import { ButtonClick, playSound, stopAllSounds } from "../audio/Sound";
import { addGameResetListener, addPlantDestroyListener, addScoreUpdateListener, addWeatherUpdateListener, clearListeners } from "../events/EventMessenger";
import * as game from "../game/Game";
import { advanceTutorial, TutorialState } from "../game/Tutorial";
import { Weather } from "../game/Weather";
import { config } from "../model/Config";
import { getGameResults, getLatestGameResult, getLatestGameResultIndex } from "../state/GameResultState";

const uiY = 35;
const uiXMargin = 15;
const weatherImageWidth = 50;
const addScoreStartMargin = 100;
const addScoreEndMargin = 20;

// Leaderboard UI
type LeaderboardRow = {
    score: Phaser.GameObjects.Text;
    hazardsDefeated: Phaser.GameObjects.Text;
    fruitHarvested: Phaser.GameObjects.Text;
};
const leaderboardColumnMargin = 40;
const defaultLeaderboardRowColor = "#FFF7E4";
const highlightLeaderboardRowColor = "#B0EB93";
const buttonMargin = 120;
const leaderboardY = 35;
const tutorialTextBackgroundColor = 0xD2C9A5;
const tutorialButtonMargin = 5;
const tutorialMaxHeight = 250;


/** UI scene */
export class UIScene extends Phaser.Scene {
    gardenGame: game.GardenGame;
    tutorialState: TutorialState;
    scoreText: Phaser.GameObjects.BitmapText;
    addScoreTextNormal: Phaser.GameObjects.BitmapText;
    addScoreTextSpecial: Phaser.GameObjects.BitmapText;

    weatherImages: Phaser.GameObjects.Image[];
    weatherImageBorders: Phaser.GameObjects.Image[];
    countdownGraphics: Phaser.GameObjects.Graphics;

    rightX: number;
    
    // Leaderboard
    leaderboardBackground: Phaser.GameObjects.Rectangle;
    leaderboardTitle: Phaser.GameObjects.Text;
    leaderboardSubtitle: Phaser.GameObjects.Text;
    leaderboardNumbers: Phaser.GameObjects.Text[];
    leaderboardRows: LeaderboardRow[];
    maxRankWidth: number;
    maxScoreWidth: number;
    maxHazardsWidth: number;
    maxFruitWidth: number;
    // Currently selected button
    selectedButton: string;
    menuButton: Phaser.GameObjects.Image;
    retryButton: Phaser.GameObjects.Image;

    tutorialTextBackground: Phaser.GameObjects.Rectangle;
    tutorialTitle: Phaser.GameObjects.Text;
    tutorialText: Phaser.GameObjects.Text;
    tutorialNextButton: Phaser.GameObjects.Image;
    tutorialSkipButton: Phaser.GameObjects.Image;

    constructor() {
        super({
            key: "UIScene"
        });
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && force !== true) {
            return;
        }
        this.scoreText.setPosition(uiXMargin, uiY - 8);
        
        this.rightX = this.game.renderer.width - config()["toolbarWidth"];
        let weatherRightX = this.rightX - uiXMargin - (weatherImageWidth / 2);
        for (let i = 0; i < this.weatherImages.length; i++) {
            let pos = this.weatherImages.length - i - 1;
            this.weatherImages[i].setPosition(weatherRightX - (pos * weatherImageWidth), uiY);
            this.weatherImageBorders[i].setPosition(this.weatherImages[i].x, this.weatherImages[i].y);
        }

        if (this.tutorialState.enabled) {
            let backgroundX = this.game.renderer.width - (1.5 * config()["toolbarWidth"]) - config()["toolbarShadowSize"];
            let height = Math.min(this.game.renderer.height - this.weatherImages[0].y - 35, tutorialMaxHeight);
            let backgroundY = this.game.renderer.height - (height / 2);
            this.tutorialTextBackground.setPosition(backgroundX, backgroundY);
            this.tutorialTextBackground.setSize(config()["toolbarWidth"], height);
            this.tutorialTitle.setPosition(backgroundX, this.tutorialTextBackground.getTopCenter().y + 12);
            this.tutorialText.setPosition(backgroundX, this.tutorialTitle.getBottomCenter().y + 4);
            this.tutorialText.setWordWrapWidth(config()["toolbarWidth"] - 2);
            this.tutorialSkipButton.setPosition(backgroundX - tutorialButtonMargin, this.game.renderer.height - tutorialButtonMargin);
            this.tutorialNextButton.setPosition(backgroundX + tutorialButtonMargin, this.game.renderer.height - tutorialButtonMargin);
        }

        this.leaderboardTitle.setPosition(this.rightX / 2, leaderboardY);
        this.leaderboardSubtitle.setPosition(this.rightX / 2, leaderboardY + 40);
        this.leaderboardBackground.setPosition(-100, -100);
        this.leaderboardBackground.setSize(this.game.renderer.width + 200, this.game.renderer.height + 200);
        // Ensure buttons don't end up off screen
        this.menuButton.setPosition(this.rightX / 2 - buttonMargin, Math.min(this.menuButton.y, this.game.renderer.height - this.menuButton.height));
        this.retryButton.setPosition(this.rightX / 2 + buttonMargin, Math.min(this.menuButton.y, this.game.renderer.height - this.retryButton.height));

        this.repositionLeaderboard();
    }

    /** Update leaderboard with player highscores */
    updateLeaderboard() {
        let gameResults = getGameResults(this.gardenGame.difficulty);
        let highlightIndex = getLatestGameResultIndex();
        this.leaderboardSubtitle.setText(this.gardenGame.difficulty + " Difficulty");
        // Update the rows in the leaderboard with the current high scores
        this.maxRankWidth = this.leaderboardNumbers[0].width;
        this.maxScoreWidth = this.leaderboardRows[0].score.width;
        this.maxHazardsWidth = this.leaderboardRows[0].hazardsDefeated.width;
        this.maxFruitWidth = this.leaderboardRows[0].fruitHarvested.width;
        for (let i = 0; (i + 1) < this.leaderboardRows.length && i < gameResults.length; i++) {
            let gameResult = gameResults[i];
            // Last row is reserved for result from most recent game
            if (i == this.leaderboardRows.length - 2) {
                // If the score from the most recent game is outside of the top few, show it as an additional row at the bottom
                if (highlightIndex == -1 || highlightIndex >= this.leaderboardRows.length - 2) {
                    gameResult = getLatestGameResult();
                    if (highlightIndex == -1) {
                        this.leaderboardNumbers[i].setText(config()["maxGamesStored"] + "+");
                    } else {
                        this.leaderboardNumbers[i].setText((highlightIndex + 1).toString());
                    }
                    highlightIndex = i;
                } else {
                    // Otherwise just set it as a 0 second result
                    gameResult = {
                        score: 0,
                        hazardsDefeated: 0,
                        fruitHarvested: 0,
                        deaths: 0
                    };
                }
            }
            this.leaderboardRows[i + 1].score.setText(gameResult.score.toString());
            this.leaderboardRows[i + 1].hazardsDefeated.setText(gameResult.hazardsDefeated.toString());
            this.leaderboardRows[i + 1].fruitHarvested.setText(gameResult.fruitHarvested.toString());
            this.maxRankWidth = Math.max(this.maxRankWidth, this.leaderboardNumbers[i].width);
            this.maxScoreWidth = Math.max(this.maxScoreWidth, this.leaderboardRows[i + 1].score.width);
            this.maxHazardsWidth = Math.max(this.maxHazardsWidth, this.leaderboardRows[i + 1].hazardsDefeated.width);
            this.maxFruitWidth = Math.max(this.maxFruitWidth, this.leaderboardRows[i + 1].fruitHarvested.width);
            if (i == highlightIndex) {
                this.leaderboardNumbers[i].setColor(highlightLeaderboardRowColor);
                this.leaderboardRows[i + 1].score.setColor(highlightLeaderboardRowColor);
                this.leaderboardRows[i + 1].hazardsDefeated.setColor(highlightLeaderboardRowColor);
                this.leaderboardRows[i + 1].fruitHarvested.setColor(highlightLeaderboardRowColor);
            } else {
                this.leaderboardNumbers[i].setColor(defaultLeaderboardRowColor);
                this.leaderboardRows[i + 1].score.setColor(defaultLeaderboardRowColor);
                this.leaderboardRows[i + 1].hazardsDefeated.setColor(defaultLeaderboardRowColor);
                this.leaderboardRows[i + 1].fruitHarvested.setColor(defaultLeaderboardRowColor);
            }
        }

        this.repositionLeaderboard();
    }

    /** Reposition the rows in the leaderboard (either due to change in canvas size or change in the contents of the rows) */
    repositionLeaderboard() {
        let leaderboardFullWidth = (leaderboardColumnMargin * 3) +
            this.maxScoreWidth + this.maxHazardsWidth +
            this.maxFruitWidth + this.leaderboardNumbers[0].width;
        let maxX = (this.rightX / 2) + (leaderboardFullWidth / 2);
        for (let i = 0; i < this.leaderboardRows.length; i++) {
            if (i < this.leaderboardNumbers.length) {
                this.leaderboardNumbers[i].setX((this.rightX / 2) - (leaderboardFullWidth / 2));
            }
            this.leaderboardRows[i].score.setX(maxX - this.maxScoreWidth - this.maxHazardsWidth - (2 * leaderboardColumnMargin));
            this.leaderboardRows[i].hazardsDefeated.setX(maxX - this.maxScoreWidth - leaderboardColumnMargin);
            this.leaderboardRows[i].fruitHarvested.setX(maxX);
        }
    }

    setLeaderboardVisible(isVisible: boolean) {
        if (! this.leaderboardTitle || ! this.leaderboardRows || ! this.leaderboardNumbers) {
            return;
        }
        this.leaderboardTitle.setVisible(isVisible);
        this.leaderboardSubtitle.setVisible(isVisible);
        this.leaderboardBackground.setVisible(isVisible);
        this.setRowVisible(this.leaderboardRows[0], isVisible);
        for (let i = 1; i < this.leaderboardRows.length; i++) {
            // Don't show 0 second scores
            if (this.leaderboardRows[i].score.text == "0") {
                this.setRowVisible(this.leaderboardRows[i], false);
                this.leaderboardNumbers[i - 1].setVisible(false);
            } else {
                this.setRowVisible(this.leaderboardRows[i], isVisible);
                this.leaderboardNumbers[i - 1].setVisible(isVisible);
            }
        }
        this.menuButton.setVisible(isVisible);
        this.retryButton.setVisible(isVisible);
    }

    setRowVisible(row: LeaderboardRow, isVisible: boolean) {
        row.score.setVisible(isVisible);
        row.hazardsDefeated.setVisible(isVisible);
        row.fruitHarvested.setVisible(isVisible);
    }

    init(data) {
        this.gardenGame = data.gardenGame;
        this.tutorialState = data.tutorialState;
        // Event listeners
        addScoreUpdateListener(this.handleScoreUpdate, this);
        addWeatherUpdateListener(this.handleWeatherUpdate, this);
        addGameResetListener(this.resetGameListener, this);
    }

    create() {
        this.scoreText = this.add.bitmapText(0, 0, "uiFont", "0", 64).setOrigin(0, 0.5);
        this.addScoreTextNormal = this.add.bitmapText(0, 0, "uiFont", "", 48).setOrigin(0, 0.5);
        this.addScoreTextSpecial = this.add.bitmapText(0, 0, "uiFont", "", 80).setOrigin(0, 0.5);
        // Weather queue images
        this.weatherImages = [];
        this.weatherImageBorders = [];
        for (let i = 0; i < this.gardenGame.weatherQueue.length; i++) {
            let tint = parseInt(config()["weatherPreviewTint"], 16);
            this.weatherImages.push(this.add.image(0, 0, this.gardenGame.weatherQueue[i] + "Preview").
                setTint(i == 0 ? 0xffffff : tint));
            this.weatherImageBorders.push(this.add.image(0, 0, "toolbox"));
        }
        this.countdownGraphics = this.add.graphics();

        // Leaderboard
        this.leaderboardBackground = this.add.rectangle(-100, -100, this.game.renderer.width + 200, this.game.renderer.height + 200, 0x000000, 0.2).setOrigin(0, 0);
        this.leaderboardTitle = this.add.text(0, 0, "High Scores", config()["leaderboardTitleStyle"]).setOrigin(0.5);
        this.leaderboardSubtitle = this.add.text(0, 0, "Normal Difficulty", { ...config()["leaderboardSmallRowStyle"], font: "16px Verdana" }).setOrigin(0.5);
        
        let leaderboardBaseY = leaderboardY + 100;

        this.leaderboardNumbers = [];
        this.leaderboardRows = [];
        let labelRow = {
            score: this.add.text(0, leaderboardBaseY, "Score", config()["leaderboardRowStyle"]).setOrigin(1, 1),
            hazardsDefeated: this.add.text(0, leaderboardBaseY, "Hazards\nDefeated", config()["leaderboardSmallRowStyle"]).setOrigin(1, 1),
            fruitHarvested: this.add.text(0, leaderboardBaseY, "Fruit\nHarvested", config()["leaderboardSmallRowStyle"]).setOrigin(1, 1),
        };
        this.leaderboardRows.push(labelRow);
        let y;
        // Add one row under leaderboard count to show result of most recent game
        for (let i = 0; i < config()["leaderboardCount"] + 1; i++) {
            y = leaderboardBaseY + 45 + (i * 35);
            this.leaderboardNumbers.push(this.add.text(0, y, (i + 1).toString(), config()["leaderboardRowStyle"]).setOrigin(0, 1));
            this.leaderboardRows.push({
                score: this.add.text(0, y, "0", config()["leaderboardRowStyle"]).setOrigin(1, 1),
                hazardsDefeated: this.add.text(0, y, "0", config()["leaderboardRowStyle"]).setOrigin(1, 1),
                fruitHarvested: this.add.text(0, y, "0", config()["leaderboardRowStyle"]).setOrigin(1, 1),
            });
        }
        let buttonY = y + 40;
        this.menuButton = this.add.image(0, buttonY, "menuButton");
        this.retryButton = this.add.image(0, buttonY, "retryButton");
        this.configureButton(this.menuButton, "menu", "menuButton", "menuButtonDown");
        this.configureButton(this.retryButton, "retry", "retryButton", "retryButtonDown");
        this.setLeaderboardVisible(false);

        if (this.tutorialState.enabled) {
            this.tutorialTextBackground = this.add.rectangle(0, 0, config()["toolbarWidth"], 0, tutorialTextBackgroundColor).setAlpha(0.85);
            this.tutorialTitle = this.add.text(0, 0, "Tutorial", config()["tutorialTitleTextStyle"]).setOrigin(0.5);
            this.tutorialText = this.add.text(0, 0, config()["tutorialText"][0], config()["tutorialTextStyle"]).setOrigin(0.5, 0);
            this.tutorialSkipButton = this.add.image(0, 0, "skipButton").setScale(0.5).setOrigin(1, 1);
            this.tutorialNextButton = this.add.image(0, 0, "nextButton").setScale(0.5).setOrigin(0, 1);
            this.configureButton(this.tutorialSkipButton, "skip", "skipButton", "skipButtonDown");
            this.configureButton(this.tutorialNextButton, "next", "nextButton", "nextButtonDown");
        }

        this.resize(true);
        this.scale.on("resize", this.resize, this);

        addGameResetListener(this.handleGameStart, this);
        addPlantDestroyListener(this.handlePlantDestroy, this);
    }

    configureButton(button: Phaser.GameObjects.Image, buttonName: string, defaultTexture: string, downTexture: string) {
        button.setInteractive();
        button.on('pointerout', () => {
            button.setTexture(defaultTexture); 
            this.selectedButton = null;
        });
        button.on('pointerdown', () => {
            button.setTexture(downTexture);
            this.selectedButton = buttonName;
            playSound(this, ButtonClick);
        });
        button.on('pointerup', () => {
            if (this.selectedButton === buttonName) {
                this.handleButtonClick(buttonName);
            }
            button.setTexture(defaultTexture);
            this.selectedButton = null;
        });
    }

    handleButtonClick(buttonName) {
        switch (buttonName) {
            case "skip":
            case "menu":
                this.backToMainMenu();
                break;
            case "retry":
                // Restart game scene
                game.resetGame(this.gardenGame);
                this.scene.get("MainScene").scene.restart();
                break;
            case "next":
                if (this.tutorialState.step < config()["tutorialText"].length - 1) {
                    advanceTutorial(this.tutorialState);
                    this.tutorialText.setText(config()["tutorialText"][this.tutorialState.step]);
                } else {
                    this.backToMainMenu();
                }
                break;
        }
    }

    backToMainMenu() {
        clearListeners();
        stopAllSounds();
        this.scene.stop();
        this.scene.stop("ToolbarScene");
        this.scene.get("MainScene").clearListeners();
        this.scene.stop("MainScene");
        this.scene.start("MenuScene");
    }

    handleGameStart(scene: UIScene) {
        scene.setLeaderboardVisible(false);
    }

    handlePlantDestroy(scene: UIScene) {
        scene.updateLeaderboard();
        scene.setLeaderboardVisible(true);
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
        let previousScore = parseInt(scene.scoreText.text);
        let diff = score - previousScore;
        scene.scoreText.setText(score.toString());
        let addScoreText = scene.addScoreTextNormal;
        if (diff > 10) {
            addScoreText = scene.addScoreTextSpecial;
        }
        if (diff > 0) {
            addScoreText.setText("+" + diff).setAlpha(1).setPosition(scene.scoreText.x, scene.scoreText.y + addScoreStartMargin);
            scene.tweens.add({
                duration: config()["scoreBumpIntervalMs"],
                y: {
                    from: addScoreText.y,
                    to: scene.scoreText.y + addScoreEndMargin,
                },
                alpha: {
                    from: 1,
                    to: 0
                },
                targets: addScoreText
            });
        }
    }

    /** Handle weather queue updating */
    handleWeatherUpdate(scene: UIScene, currentWeather: Weather, weatherQueue: Weather[]) {
        for (let i = 0; i < weatherQueue.length; i++) {
            scene.weatherImages[i].setTexture(weatherQueue[i] + "Preview");
        }
        scene.updateCooldownGraphics();
        if (currentWeather == Weather.Cloudy || currentWeather == Weather.Rain) {
            scene.scoreText.setFont("uiFontWhite");
            scene.addScoreTextNormal.setFont("uiFontWhite");
            scene.addScoreTextSpecial.setFont("uiFontWhite");
        } else {
            scene.scoreText.setFont("uiFont");
            scene.addScoreTextNormal.setFont("uiFont");
            scene.addScoreTextSpecial.setFont("uiFont");
        }
    }

    update() {
        this.updateCooldownGraphics();
    }
}