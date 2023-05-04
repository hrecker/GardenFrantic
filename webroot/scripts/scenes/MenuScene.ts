import { newGame } from "../game/Game";
import { config } from "../model/Config";
import { ButtonClick, playSound } from "../audio/Sound";
import { getSettings, setMusicEnabled, setSfxEnabled } from "../state/Settings";
import { Weather } from "../game/Weather";
import { BackgroundImageSpawner, createBackgroundImageAnimations, newBackgroundImageSpawner, update } from "./BackgroundImageSpawner";

const musicControlButtonName = "musicControlButton";
const sfxControlButtonName = "sfxControlButton";

const weatherQueue = [
    Weather.PartlyCloudy,
    Weather.Rain,
    Weather.Heat,
    Weather.Cloudy
];
const backgroundDurationMs = 4000;

/** Main Menu scene */
export class MenuScene extends Phaser.Scene {
    backgroundOne: Phaser.GameObjects.Sprite;
    backgroundTwo: Phaser.GameObjects.Sprite;
    timeSinceBackgroundChangeMs: number;
    currentWeatherIndex: number;
    backgroundImageSpawner: BackgroundImageSpawner;
    
    titleText: Phaser.GameObjects.Text;

    selectedButton: string;
    playButton: Phaser.GameObjects.Image;
    statsButton: Phaser.GameObjects.Image;
    musicControlButton: Phaser.GameObjects.Image;
    sfxControlButton: Phaser.GameObjects.Image;

    creditsText: Phaser.GameObjects.Text;

    // Groups to allow easily showing and hiding multiple UI elements
    mainMenuGroup: Phaser.GameObjects.Group;
    howToPlayGroup: Phaser.GameObjects.Group;
    lifetimeStatsGroup: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: "MenuScene"
        });
    }

    getMusicButtonTexture() {
        return getSettings().musicEnabled ? "musicOnButton" : "musicOffButton";
    }

    getSfxButtonTexture() {
        return getSettings().sfxEnabled ? "soundOnButton" : "soundOffButton";
    }

    getDefaultTexture(buttonName: string) {
        if (buttonName == musicControlButtonName) {
            return this.getMusicButtonTexture();
        }
        if (buttonName == sfxControlButtonName) {
            return this.getSfxButtonTexture();
        }
        return buttonName;
    }


    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && ! force) {
            return;
        }

        let centerX = this.game.renderer.width / 2;
        let titleY = this.game.renderer.height / 6;
        this.titleText.setPosition(centerX, titleY);

        // Buttons
        let buttonMargin = 65;
        let buttonYAnchor = titleY + buttonMargin + 10;
        this.playButton.setPosition(centerX, buttonYAnchor);
        this.statsButton.setPosition(centerX, buttonYAnchor + buttonMargin);
        
        // Audio control buttons
        this.musicControlButton.setPosition(5, this.game.renderer.height - 60);
        this.sfxControlButton.setPosition(5, this.game.renderer.height - 5);

        // Credits
        this.creditsText.setPosition(this.game.renderer.width - 100, this.game.renderer.height - 35);
    }

    create() {
        this.mainMenuGroup = this.add.group();
        this.lifetimeStatsGroup = this.add.group();
        this.howToPlayGroup = this.add.group();

        this.currentWeatherIndex = 0;
        this.backgroundOne = this.add.sprite(0, 0, weatherQueue[this.currentWeatherIndex]).setOrigin(0, 0);
        this.backgroundTwo = this.add.sprite(0, 0, weatherQueue[this.currentWeatherIndex]).setOrigin(0, 0).setAlpha(0);
        this.timeSinceBackgroundChangeMs = 0;

        this.backgroundImageSpawner = newBackgroundImageSpawner(this, 0, 3500, 1);
        createBackgroundImageAnimations(this);
        
        this.input.setDefaultCursor("default");
        
        this.titleText = this.add.text(0, 0, "Garden Frantic", config()["titleStyle"]).setOrigin(0.5).setAlpha(0);
        this.mainMenuGroup.add(this.titleText);

        // Buttons
        this.playButton = this.add.image(0, 0, "playButton").setScale(1.5).setName("playButton").setAlpha(0);
        this.configureButton(this.playButton, "playButton");
        this.statsButton = this.add.image(0, 0, "statsButton").setScale(1.5).setName("statsButton").setAlpha(0);
        this.configureButton(this.statsButton, "statsButton");
        this.mainMenuGroup.add(this.playButton);
        this.mainMenuGroup.add(this.statsButton);
        
        // Audio control buttons
        this.musicControlButton = this.add.image(0, 0, this.getMusicButtonTexture()).setOrigin(0, 1).setName(musicControlButtonName).setAlpha(0);
        this.configureButton(this.musicControlButton, musicControlButtonName);
        this.sfxControlButton = this.add.image(0, 0, this.getSfxButtonTexture()).setOrigin(0, 1).setName(sfxControlButtonName).setAlpha(0);
        this.configureButton(this.sfxControlButton, sfxControlButtonName);
        this.mainMenuGroup.add(this.musicControlButton);
        this.mainMenuGroup.add(this.sfxControlButton);

        // Credits
        this.creditsText = this.add.text(0, 0, "Music by Eric Matyas\nwww.soundimage.org",
                { ...config()["titleStyle"], font: "14px Verdana" }).setOrigin(0.5).setAlpha(0);
        this.mainMenuGroup.add(this.creditsText);

        // Lifetime stats
        let lifetimeStats = getLifetimeStats();

        //TODO
        statsTitle = this.add.text(0, 0, "Statistics", config()["titleStyle"]).setOrigin(0.5);
        statsTexts = [];
        statsTexts.push(this.add.text(0, 0, "Time survived", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        statsTexts.push(this.add.text(0, 0, "Average time survived", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        statsTexts.push(this.add.text(0, 0, "Gems collected", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        statsTexts.push(this.add.text(0, 0, "Enemies killed", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        statsTexts.push(this.add.text(0, 0, "Shots fired", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        statsTexts.push(this.add.text(0, 0, "Deaths", { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(0, 0.5));
        timeSurvivedText = this.add.text(0, 0, lifetimeStats.score.toFixed(1), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        averageTimeSurvivedText = this.add.text(0, 0, this.getAverageTimeSurvived(lifetimeStats).toFixed(1), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        gemsCollectedText = this.add.text(0, 0, lifetimeStats.gemsCollected.toString(), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        enemiesKilledText = this.add.text(0, 0, lifetimeStats.enemiesKilled.toString(), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        shotsFiredText = this.add.text(0, 0, lifetimeStats.shotsFired.toString(), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        deathsText = this.add.text(0, 0, lifetimeStats.deaths.toString(), { ...config()["controlsStyle"], font: "bold 40px Verdana" }).setOrigin(1, 0.5);
        lifetimeStatsGroup.add(statsTitle);
        statsTexts.forEach(text => {
            lifetimeStatsGroup.add(text);
        });
        lifetimeStatsGroup.add(timeSurvivedText);
        lifetimeStatsGroup.add(averageTimeSurvivedText);
        lifetimeStatsGroup.add(gemsCollectedText);
        lifetimeStatsGroup.add(enemiesKilledText);
        lifetimeStatsGroup.add(shotsFiredText);
        lifetimeStatsGroup.add(deathsText);

        this.resize(true);
        this.scale.on("resize", this.resize, this);

        // Fade in menu items
        this.fadeInMainMenu();

        //For quicker testing - just skips the main menu scene and opens the game scene
        //this.handleButtonClick("playButton");
    }

    fadeInMainMenu() {
        this.mainMenuGroup.setVisible(true);
        [this.titleText,
            this.playButton,
            this.statsButton].forEach(target => {
            this.tweens.add({
                targets: target,
                ease: "Quad",
                alpha: 1,
                y: {
                    from: target.y + 50,
                    to: target.y
                },
                duration: 750
            });
        });
        
        this.tweens.add({
            targets: this.mainMenuGroup.getChildren(),
            alpha: 1,
            duration: 750
        });
    }

    fadeInLifetimeStats() {

    }

    fadeInHowToPlay() {

    }

    configureButton(button: Phaser.GameObjects.Image, textureName: string) {
        button.setInteractive();
        button.on('pointerout', () => {
            if (button.visible) {
                button.setTexture(this.getDefaultTexture(textureName)); 
                this.selectedButton = null;
            }
        });
        button.on('pointerdown', () => {
            button.setTexture(this.getDefaultTexture(textureName) + "Down"); 
            this.selectedButton = button.name;
            playSound(this, ButtonClick);
        });
        button.on('pointerup', () => {
            if (this.selectedButton === button.name) {
                this.handleButtonClick(button.name);
            }
            button.setTexture(this.getDefaultTexture(textureName)); 
            this.selectedButton = null;
        });
    }

    handleButtonClick(buttonName) {
        switch (buttonName) {
            case "playButton":
                // Start game
                let game = newGame();
                this.scene.start("MainScene", { gardenGame: game })
                        .start("ToolbarScene", { gardenGame: game })
                        .start("UIScene", { gardenGame: game })
                        .stop();
                break;
            case "statsButton":
                // Show stats
                this.mainMenuGroup.setVisible(false);
                this.fadeInLifetimeStats();
                break;
            case "backButton":
                // Show main menu
                this.fadeInMainMenu();
                this.lifetimeStatsGroup.setVisible(false);
                break;
            case musicControlButtonName:
                // Toggle music
                setMusicEnabled(!getSettings().musicEnabled);
                break;
            case sfxControlButtonName:
                // Toggle sfx
                setSfxEnabled(!getSettings().sfxEnabled);
                break;
        }
    }

    update(time, delta) {
        this.timeSinceBackgroundChangeMs += delta;
        if (this.timeSinceBackgroundChangeMs >= backgroundDurationMs) {
            let oldBackground = this.backgroundOne;
            let newBackground = this.backgroundTwo;
            if (this.backgroundOne.alpha == 0) {
                oldBackground = this.backgroundTwo;
                newBackground = this.backgroundOne;
            }

            this.currentWeatherIndex = (this.currentWeatherIndex + 1) % weatherQueue.length;
            newBackground.setTexture(weatherQueue[this.currentWeatherIndex]);

            this.tweens.add({
                targets: oldBackground,
                alpha: 0,
                duration: 750
            });
            this.tweens.add({
                targets: newBackground,
                alpha: 1,
                duration: 750
            });

            this.timeSinceBackgroundChangeMs = 0;
        }

        update(this, delta, this.backgroundImageSpawner);
    }
}