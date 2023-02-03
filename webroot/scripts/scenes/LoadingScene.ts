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
        this.load.image("plant", "assets/sprites/plant.png");
        this.load.image("statusBarBackground", "assets/sprites/statusBarBackground.png");
        this.load.image("waterIcon", "assets/sprites/waterIcon.png");
        this.load.image("lightIcon", "assets/sprites/lightIcon.png");
        this.load.image("fruitIcon", "assets/sprites/fruitIcon.png");
        this.load.image("healthIcon", "assets/sprites/healthIcon.png");
        this.load.image("toolbox", "assets/sprites/toolbox.png");
        this.load.image("selectedToolbox", "assets/sprites/selectedToolbox.png");
        this.load.image(Tool.Basket, "assets/sprites/" + Tool.Basket + ".png");
        this.load.image(Tool.Lamp, "assets/sprites/" + Tool.Lamp + ".png");
        this.load.image(Tool.Shade, "assets/sprites/" + Tool.Shade + ".png");
        this.load.image(Tool.Umbrella, "assets/sprites/" + Tool.Umbrella + ".png");
        this.load.image(Tool.WateringCan, "assets/sprites/" + Tool.WateringCan + ".png");
        this.load.image(Tool.Scarecrow, "assets/sprites/" + Tool.Scarecrow + ".png");
        this.load.image(Tool.Weedkiller, "assets/sprites/" + Tool.Weedkiller + ".png");
        this.load.image(Tool.Pesticide, "assets/sprites/" + Tool.Pesticide + ".png");
        this.load.image(Weather.PartlyCloudy, "assets/sprites/" + Weather.PartlyCloudy + ".png");
        this.load.image(Weather.Cloudy, "assets/sprites/" + Weather.Cloudy + ".png");
        this.load.image(Weather.Heat, "assets/sprites/" + Weather.Heat + ".png");
        this.load.image(Weather.Rain, "assets/sprites/" + Weather.Rain + ".png");
        this.load.image(Weather.PartlyCloudy + "Preview", "assets/sprites/" + Weather.PartlyCloudy + "Preview.png");
        this.load.image(Weather.Cloudy + "Preview", "assets/sprites/" + Weather.Cloudy + "Preview.png");
        this.load.image(Weather.Heat + "Preview", "assets/sprites/" + Weather.Heat + "Preview.png");
        this.load.image(Weather.Rain + "Preview", "assets/sprites/" + Weather.Rain + "Preview.png");
        this.load.image(Hazard.Birds, "assets/sprites/hazards/" + Hazard.Birds + ".png");
        this.load.image(Hazard.Bugs, "assets/sprites/hazards/" + Hazard.Bugs + ".png");
        this.load.image(Hazard.Weeds, "assets/sprites/hazards/" + Hazard.Weeds + ".png");

        this.load.bitmapFont('uiFont', 'assets/fonts/uiFont.png', 'assets/fonts/uiFont.xml');

        // Load json
        this.load.json("config", "assets/json/config.json");
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