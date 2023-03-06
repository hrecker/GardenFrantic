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

        // Images
        this.loadTexture("plant1", "drawn/");
        this.loadTexture("plant2", "drawn/");
        this.loadTexture("plant3", "drawn/");
        this.loadTexture("fruitsmall1", "drawn/");
        this.loadTexture("fruitsmall2", "drawn/");
        this.loadTexture("fruitmedium1", "drawn/");
        this.loadTexture("fruitmedium2", "drawn/");
        this.loadTexture("fruitlarge1", "drawn/");
        this.loadTexture("fruitlarge2", "drawn/");
        this.loadTexture("statusBarBackground");
        this.loadTexture("waterIcon");
        this.loadTexture("lightIcon");
        this.loadTexture("fruitIcon");
        this.loadTexture("healthIcon");
        this.loadTexture("toolbox");
        this.loadTexture("selectedToolbox");
        this.loadTexture(Tool.Basket);
        this.loadTexture(Tool.Fertilizer);
        this.loadTexture(Tool.Lamp);
        this.loadTexture(Tool.Shade);
        this.loadTexture(Tool.Umbrella);
        this.loadTexture(Tool.WateringCan);
        this.loadTexture(Tool.Scarecrow);
        this.loadTexture(Tool.Weedkiller);
        this.loadTexture(Tool.Pesticide);
        this.loadTexture(Tool.Dog);
        this.loadTexture(Tool.Missile);
        this.loadTexture(Tool.Hammer);
        this.loadTexture(Weather.PartlyCloudy);
        this.loadTexture(Weather.Cloudy);
        this.loadTexture(Weather.Heat);
        this.loadTexture(Weather.Rain);
        this.loadTexture(Weather.PartlyCloudy + "Preview");
        this.loadTexture(Weather.Cloudy + "Preview");
        this.loadTexture(Weather.Heat + "Preview");
        this.loadTexture(Weather.Rain + "Preview");
        this.loadTexture(Hazard.Birds, "hazards/");
        this.loadTexture(Hazard.Bugs, "hazards/");
        this.loadTexture(Hazard.Weeds, "hazards/");
        this.loadTexture(Hazard.Bunny, "hazards/");
        this.loadTexture(Hazard.Meteor, "hazards/");
        this.loadTexture(Hazard.Mole, "hazards/");

        this.load.bitmapFont('uiFont', 'assets/fonts/uiFont.png', 'assets/fonts/uiFont.xml');

        // Load json
        this.load.json("config", "assets/json/config.json");
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