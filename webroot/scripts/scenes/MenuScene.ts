import { newGame } from "../game/Game";
import { config } from "../model/Config";
import { ButtonClick, playSound } from "../audio/Sound";
import { getSettings, setMusicEnabled, setSfxEnabled } from "../state/Settings";

// Currently selected button
let selectedButton: string;
const musicControlButtonName = "musicControlButton";
const sfxControlButtonName = "sfxControlButton";

let titleText: Phaser.GameObjects.Text;

let playButton: Phaser.GameObjects.Image;
let musicControlButton: Phaser.GameObjects.Image;
let sfxControlButton: Phaser.GameObjects.Image;

let creditsText: Phaser.GameObjects.Text;

/** Main Menu scene */
export class MenuScene extends Phaser.Scene {
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
        this.input.setDefaultCursor("default");
        
        titleText = this.add.text(0, 0, "Garden Frantic", config()["titleStyle"]).setOrigin(0.5);

        // Buttons
        playButton = this.add.image(0, 0, "playButton").setScale(1.5).setName("playButton");
        this.configureButton(playButton, "playButton");
        
        // Audio control buttons
        musicControlButton = this.add.image(0, 0, this.getMusicButtonTexture()).setOrigin(0, 1).setName(musicControlButtonName);
        this.configureButton(musicControlButton, musicControlButtonName);
        sfxControlButton = this.add.image(0, 0, this.getSfxButtonTexture()).setOrigin(0, 1).setName(sfxControlButtonName);
        this.configureButton(sfxControlButton, sfxControlButtonName);

        // Credits
        creditsText = this.add.text(0, 0, "Music by Eric Matyas\nwww.soundimage.org",
                { ...config()["controlsStyle"], font: "20px Verdana" }).setOrigin(0.5);

        this.resize(true);
        this.scale.on("resize", this.resize, this);

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
}