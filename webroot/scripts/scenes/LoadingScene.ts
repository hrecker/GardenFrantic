import { newGame } from "../game/Game";
import { Hazard } from "../game/Hazard";
import { Tool } from "../game/Tool";
import { Weather } from "../game/Weather";
import { loadConfig } from "../model/Config";

let loadingText: Phaser.GameObjects.Text;

/** Load json and assets */
export class LoadingScene extends Phaser.Scene {
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
        loadingText.setPosition(this.game.renderer.width / 2, this.game.renderer.height / 2);
    }

    preload() {
        // Loading message
        // Have to hard-code this because the config isn't loaded yet
        this.cameras.main.setBackgroundColor("#ffffff");
        loadingText = this.add.text(0, 0, "Loading...",
            { font: "bold 64px Verdana",
            stroke: "black",
            strokeThickness: 3,
            color: "#FFF7E4" }).setOrigin(0.5, 0.5);

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

        // Fonts
        this.load.bitmapFont('uiFont', 'assets/fonts/singkong_0.png', 'assets/fonts/singkong.fnt');
        this.load.bitmapFont('uiFontWhite', 'assets/fonts/singkong-white_0.png', 'assets/fonts/singkong-white.fnt');

        // SFX
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

        // Load json
        this.load.json("config", "assets/json/config.json");
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
        loadConfig(this.cache.json.get("config"));
        let game = newGame();
        this.scene.start("MainScene", { gardenGame: game })
                  .start("ToolbarScene", { gardenGame: game })
                  .start("UIScene", { gardenGame: game })
                  .stop();
    }
}