import { ButtonClick, WrongTool } from "../audio/Sound";
import { Hazard } from "../game/Hazard";
import { Tool } from "../game/Tool";
import { Weather } from "../game/Weather";
import { loadConfig } from "../model/Config";


/** Load json and assets */
export class LoadingScene extends Phaser.Scene {
    loadingText: Phaser.GameObjects.Text;
    loadingBox: Phaser.GameObjects.Rectangle;
    loadingFill: Phaser.GameObjects.Rectangle;
    maxQueueSize: number;

    constructor() {
        super({
            key: "LoadingScene"
        });
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && ! force) {
            return;
        }
        this.loadingText.setPosition(this.game.renderer.width / 2, this.game.renderer.height / 2 - 50);
        
        this.loadingFill.setPosition(this.loadingText.x, this.loadingText.y + 100);
        this.loadingFill.setSize(this.loadingText.width, this.loadingText.height / 2);
        this.loadingBox.setPosition(this.loadingText.x, this.loadingText.y + 100);
        this.loadingBox.setSize(this.loadingText.width, this.loadingText.height / 2);
    }

    loadResources() {
        // Ensure the canvas is the right size
        this.scale.refresh();
        this.resize(true);
        this.scale.on("resize", this.resize, this);
        
        // FX
        this.load.image("particle", "assets/sprites/particle.png");
        this.load.image("redparticle", "assets/sprites/redparticle.png");

        // Images
        this.loadTexture("uparrow");
        this.loadTexture("downarrow");
        this.loadTexture("plant1");
        this.loadTexture("plant2");
        this.loadTexture("plantdeath1");
        this.loadTexture("plantdeath2");
        this.loadTexture("fruitsmall1");
        this.loadTexture("fruitsmall2");
        this.loadTexture("fruitmedium1");
        this.loadTexture("fruitmedium2");
        this.loadTexture("fruitlarge1");
        this.loadTexture("fruitlarge2");
        this.loadTexture("statusBarBackground", "statusbar/");
        this.loadTexture("statusBarHealth", "statusbar/");
        this.loadTexture("waterIcon", "statusbar/");
        this.loadTexture("lightIcon", "statusbar/");
        this.loadTexture("fruitIcon", "statusbar/");
        this.loadTexture("healthIcon", "statusbar/");
        this.loadTexture("toolbox");
        this.loadTexture("selectedToolbox");
        this.loadTexture("highlightedToolbox");
        this.loadToolTexture(Tool.Basket);
        this.loadToolTexture(Tool.Fertilizer);
        this.loadToolTexture(Tool.Lamp);
        this.loadToolTexture(Tool.Shade);
        this.loadToolTexture(Tool.Umbrella);
        this.loadToolTexture(Tool.WateringCan);
        this.loadToolTexture(Tool.Scarecrow);
        this.loadToolTexture(Tool.Weedkiller);
        this.loadToolTexture(Tool.Pesticide);
        this.loadToolTexture(Tool.Dog);
        this.loadToolTexture(Tool.Missile);
        this.loadToolTexture(Tool.Hammer);
        this.loadTexture(Weather.PartlyCloudy, "weather/");
        this.loadTexture(Weather.Cloudy, "weather/");
        this.loadTexture(Weather.Heat, "weather/");
        this.loadTexture(Weather.Rain, "weather/");
        this.loadTexture(Weather.PartlyCloudy + "Preview", "weather/");
        this.loadTexture(Weather.Cloudy + "Preview", "weather/");
        this.loadTexture(Weather.Heat + "Preview", "weather/");
        this.loadTexture(Weather.Rain + "Preview", "weather/");
        this.loadHazardTexture(Hazard.Bird, true);
        this.loadHazardTexture(Hazard.Bugs, false);
        this.loadHazardTexture(Hazard.Weeds, false);
        this.loadHazardTexture(Hazard.Bunny, true);
        this.loadHazardTexture(Hazard.Meteor, false);
        this.loadHazardTexture(Hazard.Mole, true);
        this.loadTexture("meteorFragment", "hazards/");
        this.loadTexture("butterfly1", "background/");
        this.loadTexture("butterfly2", "background/");
        this.loadTexture("leaf1", "background/");
        this.loadTexture("leaf2", "background/");
        this.loadTexture("spikeleaf1", "background/");
        this.loadTexture("spikeleaf2", "background/");
        
        // UI
        this.load.image("menuButton", "assets/sprites/ui/menuButton.png");
        this.load.image("menuButtonDown", "assets/sprites/ui/menuButtonDown.png");
        this.load.image("playButton", "assets/sprites/ui/playButton.png");
        this.load.image("playButtonDown", "assets/sprites/ui/playButtonDown.png");
        this.load.image("tutorialButton", "assets/sprites/ui/tutorialButton.png");
        this.load.image("tutorialButtonDown", "assets/sprites/ui/tutorialButtonDown.png");
        this.load.image("statsButton", "assets/sprites/ui/statsButton.png");
        this.load.image("statsButtonDown", "assets/sprites/ui/statsButtonDown.png");
        this.load.image("backButton", "assets/sprites/ui/backButton.png");
        this.load.image("backButtonDown", "assets/sprites/ui/backButtonDown.png");
        this.load.image("retryButton", "assets/sprites/ui/retryButton.png");
        this.load.image("retryButtonDown", "assets/sprites/ui/retryButtonDown.png");
        this.load.image('musicOffButton', 'assets/sprites/ui/music_off_button.png');
        this.load.image('musicOffButtonDown', 'assets/sprites/ui/music_off_button_down.png');
        this.load.image('musicOnButton', 'assets/sprites/ui/music_on_button.png');
        this.load.image('musicOnButtonDown', 'assets/sprites/ui/music_on_button_down.png');
        this.load.image('soundOffButton', 'assets/sprites/ui/sound_off_button.png');
        this.load.image('soundOffButtonDown', 'assets/sprites/ui/sound_off_button_down.png');
        this.load.image('soundOnButton', 'assets/sprites/ui/sound_on_button.png');
        this.load.image('soundOnButtonDown', 'assets/sprites/ui/sound_on_button_down.png');
        this.load.image('radioButtonUnselected', 'assets/sprites/ui/radioButtonUnselected.png');
        this.load.image('radioButtonSelected', 'assets/sprites/ui/radioButtonSelected.png');

        // Fonts
        this.load.bitmapFont('uiFont', 'assets/fonts/singkong_0.png', 'assets/fonts/singkong.fnt');
        this.load.bitmapFont('uiFontWhite', 'assets/fonts/singkong-white_0.png', 'assets/fonts/singkong-white.fnt');

        // Load audio
        this.load.audio('backgroundMusic', 'assets/music/Fishbowl-Acrobatics.mp3');

        // SFX
        this.load.audio(ButtonClick, "assets/sfx/button_click.ogg");

        this.load.audio(Hazard.Bird, "assets/sfx/bird.wav");
        this.load.audio(Hazard.Bugs, "assets/sfx/bugs.wav");
        this.load.audio(Hazard.Bunny, "assets/sfx/bunny.wav");
        this.load.audio(Hazard.Meteor, "assets/sfx/meteor.mp3");
        this.load.audio(Hazard.Mole, "assets/sfx/mole.m4a");
        this.load.audio(Hazard.Weeds, "assets/sfx/weeds.wav");
        
        this.load.audio(Tool.Scarecrow, "assets/sfx/scarecrow.wav");
        this.load.audio(Tool.Pesticide, "assets/sfx/spray.wav");
        this.load.audio(Tool.Missile, "assets/sfx/missile.wav");
        this.load.audio(Tool.Hammer, "assets/sfx/hammer.wav");
        this.load.audio(Tool.Dog, "assets/sfx/dog.wav");
        this.load.audio(Tool.Weedkiller, "assets/sfx/spray.wav");
        this.load.audio(Tool.Basket, "assets/sfx/basket.wav");
        this.load.audio(Tool.Fertilizer, "assets/sfx/fertilizer.wav");
        this.load.audio(Tool.Lamp, "assets/sfx/lamp.wav");
        this.load.audio(Tool.Shade, "assets/sfx/umbrella.wav");
        this.load.audio(Tool.WateringCan, "assets/sfx/wateringcan.wav");
        this.load.audio(Tool.Umbrella, "assets/sfx/umbrella.wav");
        this.load.audio(WrongTool, "assets/sfx/wrong.wav");

        // Load json
        this.load.json("config", "assets/json/config.json");
        this.load.start();
        this.load.on('complete', () => {
            // Start the main menu scene
            loadConfig(this.cache.json.get("config"));
            this.scene.start("BackgroundScene")
                      .start("MenuScene")
                      .stop();
        })
    }

    loadToolTexture(tool: Tool) {
        this.loadTexture(tool + "1", "tools/");
        this.loadTexture(tool + "2", "tools/");
    }

    loadHazardTexture(hazard: Hazard, hasApproach: boolean) {
        if (hasApproach) {
            this.loadTexture(hazard + "approach1", "hazards/");
            this.loadTexture(hazard + "approach2", "hazards/");
            this.loadTexture(hazard + "idle1", "hazards/");
            this.loadTexture(hazard + "idle2", "hazards/");
        } else {
            this.loadTexture(hazard + "1", "hazards/");
            this.loadTexture(hazard + "2", "hazards/");
        }
    }

    loadTexture(textureName: string, pathPrefix?: string) {
        if (! pathPrefix) {
            pathPrefix = "";
        }
        this.load.image(textureName, "assets/sprites/" + pathPrefix + textureName + ".png");
    }

    create() {
        // Loading message
        // Have to hard-code this because the config isn't loaded yet
        this.cameras.main.setBackgroundColor("#8CABA1");
        this.loadingText = this.add.text(0, 0, "Loading...",
            { font: "bold 64px Verdana",
            stroke: "black",
            strokeThickness: 3,
            color: "#FFF7E4" }).setOrigin(0.5, 0.5);
        this.loadingFill = this.add.rectangle(0, 0, 0, 0, 0xFFF7E4, 1);
        this.loadingBox = this.add.rectangle(0, 0, 0, 0).setStrokeStyle(3, 0x000000, 1);
        this.loadResources();
    }

    update() {
        this.loadingFill.width = this.loadingBox.width * this.load.progress;
    }
}