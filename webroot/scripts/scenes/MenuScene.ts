import { newGame } from "../game/Game";
import { config } from "../model/Config";
import { ButtonClick, playSound } from "../audio/Sound";
import { getSettings, setMusicEnabled, setSfxEnabled } from "../state/Settings";
import { Weather } from "../game/Weather";

// Currently selected button
let selectedButton: string;
const musicControlButtonName = "musicControlButton";
const sfxControlButtonName = "sfxControlButton";

let titleText: Phaser.GameObjects.Text;

let playButton: Phaser.GameObjects.Image;
let musicControlButton: Phaser.GameObjects.Image;
let sfxControlButton: Phaser.GameObjects.Image;

let creditsText: Phaser.GameObjects.Text;

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
        titleText.setPosition(centerX, titleY);

        // Buttons
        let buttonMargin = 100;
        let buttonYAnchor = titleY + buttonMargin + 20;
        playButton.setPosition(centerX, buttonYAnchor);
        
        // Audio control buttons
        musicControlButton.setPosition(5, this.game.renderer.height - 60);
        sfxControlButton.setPosition(5, this.game.renderer.height - 5);

        // Credits
        creditsText.setPosition(this.game.renderer.width - 115, this.game.renderer.height - 40);
    }

    create() {
        this.currentWeatherIndex = 0;
        this.backgroundOne = this.add.sprite(0, 0, weatherQueue[this.currentWeatherIndex]).setOrigin(0, 0);
        this.backgroundTwo = this.add.sprite(0, 0, weatherQueue[this.currentWeatherIndex]).setOrigin(0, 0).setAlpha(0);
        this.timeSinceBackgroundChangeMs = 0;

        this.input.setDefaultCursor("default");
        
        titleText = this.add.text(0, 0, "Garden Frantic", config()["titleStyle"]).setOrigin(0.5).setAlpha(0);

        // Buttons
        playButton = this.add.image(0, 0, "playButton").setScale(1.5).setName("playButton").setAlpha(0);
        this.configureButton(playButton, "playButton");
        
        // Audio control buttons
        musicControlButton = this.add.image(0, 0, this.getMusicButtonTexture()).setOrigin(0, 1).setName(musicControlButtonName).setAlpha(0);
        this.configureButton(musicControlButton, musicControlButtonName);
        sfxControlButton = this.add.image(0, 0, this.getSfxButtonTexture()).setOrigin(0, 1).setName(sfxControlButtonName).setAlpha(0);
        this.configureButton(sfxControlButton, sfxControlButtonName);

        // Credits
        creditsText = this.add.text(0, 0, "Music by Eric Matyas\nwww.soundimage.org",
                { ...config()["titleStyle"], font: "20px Verdana" }).setOrigin(0.5).setAlpha(0);

        this.resize(true);
        this.scale.on("resize", this.resize, this);

        // Fade in menu items
        [titleText,
            playButton].forEach(target => {
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
        })
        this.tweens.add({
            targets: [
                titleText,
                playButton,
                musicControlButton,
                sfxControlButton,
                creditsText
            ],
            alpha: 1,
            duration: 750
        });

        //For quicker testing - just skips the main menu scene and opens the game scene
        //this.handleButtonClick("playButton");
    }

    configureButton(button: Phaser.GameObjects.Image, textureName: string) {
        button.setInteractive();
        button.on('pointerout', () => {
            if (button.visible) {
                button.setTexture(this.getDefaultTexture(textureName)); 
                selectedButton = null;
            }
        });
        button.on('pointerdown', () => {
            button.setTexture(this.getDefaultTexture(textureName) + "Down"); 
            selectedButton = button.name;
            playSound(this, ButtonClick);
        });
        button.on('pointerup', () => {
            if (selectedButton === button.name) {
                this.handleButtonClick(button.name);
            }
            button.setTexture(this.getDefaultTexture(textureName)); 
            selectedButton = null;
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
    }
}