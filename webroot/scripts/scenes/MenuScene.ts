import { newGame } from "../game/Game";
import { config } from "../model/Config";
import { ButtonClick, playSound } from "../audio/Sound";
import { getSettings, setMusicEnabled, setSfxEnabled } from "../state/Settings";
import { Weather } from "../game/Weather";
import { BackgroundImageSpawner, createBackgroundImageAnimations, newBackgroundImageSpawner, update } from "./BackgroundImageSpawner";
import { getLifetimeStats } from "../state/GameResultState";
import { Difficulty } from "../state/DifficultyState";
import { getDisabledTutorial, getEnabledTutorial, TutorialState } from "../game/Tutorial";
import { getAllTools, getToolDescription, getToolName, Tool } from "../game/Tool";

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
    tutorialButton: Phaser.GameObjects.Image;
    toolListButton: Phaser.GameObjects.Image;
    statsButton: Phaser.GameObjects.Image;
    backButton: Phaser.GameObjects.Image;
    toolListBackButton: Phaser.GameObjects.Image;
    musicControlButton: Phaser.GameObjects.Image;
    sfxControlButton: Phaser.GameObjects.Image;

    creditsText: Phaser.GameObjects.Text;

    easyRadioButton: Phaser.GameObjects.Image;
    normalRadioButton: Phaser.GameObjects.Image;
    hardRadioButton: Phaser.GameObjects.Image;
    easyLabel: Phaser.GameObjects.Text;
    normalLabel: Phaser.GameObjects.Text;
    hardLabel: Phaser.GameObjects.Text;
    selectedDifficulty: Difficulty;
    selectedDifficultyButton: Phaser.GameObjects.Image;

    // Groups to allow easily showing and hiding multiple UI elements
    mainMenuGroup: Phaser.GameObjects.Group;
    lifetimeStatsGroup: Phaser.GameObjects.Group;
    toolListGroup: Phaser.GameObjects.Group;

    // Stats
    statsTexts: Phaser.GameObjects.Text[];
    gamePlayedText: Phaser.GameObjects.Text;
    totalScoreText: Phaser.GameObjects.Text;
    hazardsDefeatedText: Phaser.GameObjects.Text;
    fruitHarvestedText: Phaser.GameObjects.Text;

    // Tool list
    toolListImages: Phaser.GameObjects.Image[];
    toolListBorderImages: Phaser.GameObjects.Image[];
    toolListTitles: Phaser.GameObjects.Text[];
    toolListDescriptions: Phaser.GameObjects.Text[];

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
        let titleY = this.game.renderer.height / 7;
        this.titleText.setPosition(centerX, titleY);
        
        let width = this.backgroundOne.width;
        let height = this.backgroundOne.height;
        let xScale, yScale = 1;
        if (width < this.game.renderer.width) {
            xScale = this.game.renderer.width / width;
        }
        if (height < this.game.renderer.height) {
            yScale = this.game.renderer.height / height;
        }
        this.backgroundOne.setScale(xScale, yScale);
        this.backgroundTwo.setScale(xScale, yScale);

        // Buttons
        let buttonMargin = 55;
        let radioButtonYMargin = 80;
        let radioButtonXMargin = 100;
        let radioButtonLabelMargin = 20;
        let buttonYAnchor = titleY + buttonMargin + 10;
        this.playButton.setPosition(centerX, buttonYAnchor);
        this.tutorialButton.setPosition(centerX - 100, buttonYAnchor + buttonMargin);
        this.toolListButton.setPosition(centerX + 100, buttonYAnchor + buttonMargin);
        this.statsButton.setPosition(centerX, buttonYAnchor + 2 * buttonMargin);
        this.easyRadioButton.setPosition(centerX - radioButtonXMargin, buttonYAnchor + 2 * radioButtonYMargin);
        this.easyLabel.setPosition(this.easyRadioButton.getBottomCenter().x, this.easyRadioButton.getBottomCenter().y + radioButtonLabelMargin);
        this.normalRadioButton.setPosition(centerX, buttonYAnchor + 2 * radioButtonYMargin);
        this.normalLabel.setPosition(this.normalRadioButton.getBottomCenter().x, this.normalRadioButton.getBottomCenter().y + radioButtonLabelMargin);
        this.hardRadioButton.setPosition(centerX + radioButtonXMargin, buttonYAnchor + 2 * radioButtonYMargin);
        this.hardLabel.setPosition(this.hardRadioButton.getBottomCenter().x, this.hardRadioButton.getBottomCenter().y + radioButtonLabelMargin);
        
        // Audio control buttons
        this.musicControlButton.setPosition(5, this.game.renderer.height - 60);
        this.sfxControlButton.setPosition(5, this.game.renderer.height - 5);

        // Credits
        this.creditsText.setPosition(this.game.renderer.width - 90, this.game.renderer.height - 25);

        // Lifetime stats
        let statsMargin = 60;
        let statsXMargin = 225;
        let statsAnchor = titleY - 20;
        for (let i = 0; i < this.statsTexts.length; i++) {
            this.statsTexts[i].setPosition(centerX - statsXMargin, statsAnchor + (i * statsMargin));
        }
        this.gamePlayedText.setPosition(centerX + statsXMargin, statsAnchor);
        this.totalScoreText.setPosition(centerX + statsXMargin, statsAnchor + statsMargin);
        this.hazardsDefeatedText.setPosition(centerX + statsXMargin, statsAnchor + statsMargin * 2);
        this.fruitHarvestedText.setPosition(centerX + statsXMargin, statsAnchor + statsMargin * 3);

        // Tool list
        // Determine the full width of the display of tools
        let numTools = getAllTools().length;
        let perColumn = numTools / 2;
        let toolDescXMargin = 50;
        let toolDescYMargin = 10;
        let leftWidth = 0, rightWidth = 0;
        for (let i = 0; i < numTools; i++) {
            let currentWidth = this.toolListImages[i].width + this.toolListDescriptions[i].width +
                (toolDescXMargin - this.toolListImages[i].width);
            if (i < perColumn) {
                leftWidth = Math.max(leftWidth, currentWidth);
            } else {
                rightWidth = Math.max(rightWidth, currentWidth);
            }
        }
        let totalWidth = leftWidth + rightWidth;

        let toolYAnchor = 35;
        let toolYMargin = 45;
        let toolXMargin = (this.game.renderer.width - totalWidth) / 3;
        let rightColumnX = this.game.renderer.width / 2;
        for (let i = 0; i < numTools; i++) {
            let x = toolXMargin;
            if (i >= perColumn) {
                x = rightColumnX;
            }
            let y = toolYAnchor + ((i % perColumn) * toolYMargin);
            this.toolListImages[i].setPosition(x, y);
            this.toolListBorderImages[i].setPosition(x, y);
            this.toolListTitles[i].setPosition(x + toolDescXMargin, y - toolDescYMargin);
            this.toolListDescriptions[i].setPosition(x + toolDescXMargin, y + toolDescYMargin);
            if (i < perColumn) {
                rightColumnX = Math.max(rightColumnX, this.toolListDescriptions[i].getTopRight().x + toolXMargin);
            }
        }

        // Back buttons
        let backButtonMaxY = this.game.renderer.height - buttonMargin / 2;
        this.backButton.setPosition(centerX, Math.min(backButtonMaxY, this.fruitHarvestedText.y + buttonMargin * 3 / 2));
        this.toolListBackButton.setPosition(centerX, Math.min(backButtonMaxY, this.toolListImages[numTools - 1].y + buttonMargin * 3 / 2));
    }

    create() {
        this.mainMenuGroup = this.add.group();
        this.lifetimeStatsGroup = this.add.group();
        this.toolListGroup = this.add.group();

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
        this.playButton = this.add.image(0, 0, "playButton").setScale(1.15).setName("playButton").setAlpha(0);
        this.configureButton(this.playButton, "playButton");
        this.tutorialButton = this.add.image(0, 0, "tutorialButton").setScale(1.15).setName("tutorialButton").setAlpha(0);
        this.configureButton(this.tutorialButton, "tutorialButton");
        this.toolListButton = this.add.image(0, 0, "toolListButton").setScale(1.15).setName("toolListButton").setAlpha(0);
        this.configureButton(this.toolListButton, "toolListButton");
        this.statsButton = this.add.image(0, 0, "statsButton").setScale(1.15).setName("statsButton").setAlpha(0);
        this.configureButton(this.statsButton, "statsButton");
        this.mainMenuGroup.add(this.playButton);
        this.mainMenuGroup.add(this.tutorialButton);
        this.mainMenuGroup.add(this.toolListButton);
        this.mainMenuGroup.add(this.statsButton);

        // Difficulty selection
        this.easyRadioButton = this.add.image(0, 0, "radioButtonUnselected").setName(Difficulty.Easy);
        this.normalRadioButton = this.add.image(0, 0, "radioButtonSelected").setName(Difficulty.Normal);
        this.hardRadioButton = this.add.image(0, 0, "radioButtonUnselected").setName(Difficulty.Hard);
        this.selectedDifficulty = Difficulty.Normal;
        this.selectedDifficultyButton = this.normalRadioButton;
        this.configureDifficultyRadioButton(this.easyRadioButton);
        this.configureDifficultyRadioButton(this.normalRadioButton);
        this.configureDifficultyRadioButton(this.hardRadioButton);
        this.easyLabel = this.add.text(0, 0, "Easy",
                { ...config()["titleStyle"], font: "20px Verdana" }).setOrigin(0.5);
        this.normalLabel = this.add.text(0, 0, "Normal",
                { ...config()["titleStyle"], font: "20px Verdana" }).setOrigin(0.5);
        this.hardLabel = this.add.text(0, 0, "Hard",
                { ...config()["titleStyle"], font: "20px Verdana" }).setOrigin(0.5);
        this.mainMenuGroup.add(this.easyRadioButton);
        this.mainMenuGroup.add(this.normalRadioButton);
        this.mainMenuGroup.add(this.hardRadioButton);
        this.mainMenuGroup.add(this.easyLabel);
        this.mainMenuGroup.add(this.normalLabel);
        this.mainMenuGroup.add(this.hardLabel);
        
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

        this.statsTexts = [];
        this.statsTexts.push(this.add.text(0, 0, "Games played", { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(0, 0.5));
        this.statsTexts.push(this.add.text(0, 0, "Total score", { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(0, 0.5));
        this.statsTexts.push(this.add.text(0, 0, "Hazards defeated", { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(0, 0.5));
        this.statsTexts.push(this.add.text(0, 0, "Fruit harvested", { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(0, 0.5));
        this.gamePlayedText = this.add.text(0, 0, lifetimeStats.deaths.toString(), { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(1, 0.5);
        this.totalScoreText = this.add.text(0, 0, lifetimeStats.score.toString(), { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(1, 0.5);
        this.hazardsDefeatedText = this.add.text(0, 0, lifetimeStats.hazardsDefeated.toString(), { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(1, 0.5);
        this.fruitHarvestedText = this.add.text(0, 0, lifetimeStats.fruitHarvested.toString(), { ...config()["titleStyle"], font: "bold 30px Verdana" }).setOrigin(1, 0.5);
        this.statsTexts.forEach(text => {
            this.lifetimeStatsGroup.add(text);
        });
        this.lifetimeStatsGroup.add(this.gamePlayedText);
        this.lifetimeStatsGroup.add(this.totalScoreText);
        this.lifetimeStatsGroup.add(this.hazardsDefeatedText);
        this.lifetimeStatsGroup.add(this.fruitHarvestedText);
        
        this.backButton = this.add.image(0, 0, "backButton").setScale(1.15).setName("backButton");
        this.configureButton(this.backButton, "backButton");
        this.lifetimeStatsGroup.add(this.backButton);

        // Tool list
        this.toolListImages = [];
        this.toolListBorderImages = [];
        this.toolListTitles = [];
        this.toolListDescriptions = [];
        this.addToolToToolList(Tool.Basket);
        this.addToolToToolList(Tool.Fertilizer);
        this.addToolToToolList(Tool.Umbrella);
        this.addToolToToolList(Tool.WateringCan);
        this.addToolToToolList(Tool.Shade);
        this.addToolToToolList(Tool.Lamp);
        this.addToolToToolList(Tool.Scarecrow);
        this.addToolToToolList(Tool.Weedkiller);
        this.addToolToToolList(Tool.Pesticide);
        this.addToolToToolList(Tool.Dog);
        this.addToolToToolList(Tool.Hammer);
        this.addToolToToolList(Tool.Missile);

        this.toolListImages.forEach(image => {
            this.toolListGroup.add(image);
        });
        this.toolListBorderImages.forEach(image => {
            this.toolListGroup.add(image);
        });
        this.toolListTitles.forEach(image => {
            this.toolListGroup.add(image);
        });
        this.toolListDescriptions.forEach(image => {
            this.toolListGroup.add(image);
        });

        this.toolListBackButton = this.add.image(0, 0, "backButton").setScale(1.15).setName("backButton");
        this.configureButton(this.toolListBackButton, "backButton");
        this.toolListGroup.add(this.toolListBackButton);

        this.resize(true);
        this.scale.on("resize", this.resize, this);

        // Fade in menu items
        this.fadeInMainMenu();
        this.lifetimeStatsGroup.setVisible(false);
        this.toolListGroup.setVisible(false);

        //For quicker testing - just skips the main menu scene and opens the game scene
        //this.handleButtonClick("playButton");
    }

    addToolToToolList(tool: Tool) {
        this.toolListImages.push(this.add.image(0, 0, tool + "1").setScale(0.85).setOrigin(0, 0.5));
        this.toolListBorderImages.push(this.add.image(0, 0, "toolbox").setScale(0.85).setOrigin(0, 0.5));
        this.toolListTitles.push(this.add.text(0, 0, getToolName(tool),
            { ...config()["titleStyle"], font: "18px Verdana" }).setOrigin(0, 0.5));
        this.toolListDescriptions.push(this.add.text(0, 0, getToolDescription(tool),
            { ...config()["titleStyle"], font: "14px Verdana" }).setOrigin(0, 0.5));
    }

    fadeInMainMenu() {
        this.mainMenuGroup.setVisible(true);
        [this.titleText,
            this.playButton,
            this.tutorialButton,
            this.toolListButton,
            this.statsButton,
            this.easyRadioButton,
            this.normalRadioButton,
            this.hardRadioButton,
            this.easyLabel,
            this.normalLabel,
            this.hardLabel].forEach(target => {
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
        
        this.mainMenuGroup.setAlpha(0);
        this.tweens.add({
            targets: this.mainMenuGroup.getChildren(),
            alpha: {
                from: 0,
                to: 1,
            },
            duration: 750
        });
    }

    fadeInGroup(group: Phaser.GameObjects.Group) {
        group.getChildren().forEach(target => {
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
            targets: group.getChildren(),
            alpha: {
                from: 0,
                to: 1,
            },
            duration: 750
        });
    }

    fadeInLifetimeStats() {
        this.lifetimeStatsGroup.setVisible(true);
        this.fadeInGroup(this.lifetimeStatsGroup);
    }

    fadeInToolList() {
        this.toolListGroup.setVisible(true);
        this.fadeInGroup(this.toolListGroup);
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

    configureDifficultyRadioButton(button: Phaser.GameObjects.Image) {
        button.setInteractive();
        button.on('pointerdown', () => {
            if (button.name != this.selectedDifficulty) {
                this.selectedDifficulty = Difficulty[button.name];
                button.setTexture("radioButtonSelected");
                if (this.selectedDifficultyButton) {
                    this.selectedDifficultyButton.setTexture("radioButtonUnselected");
                }
                this.selectedDifficultyButton = button;
                playSound(this, ButtonClick);
            }
        });
    }

    handleButtonClick(buttonName) {
        let game;
        let tutorial: TutorialState;
        switch (buttonName) {
            case "playButton":
                // Start game
                game = newGame(this.selectedDifficulty);
                tutorial = getDisabledTutorial();
                this.scene.start("MainScene", { gardenGame: game, tutorialState: tutorial })
                        .start("ToolbarScene", { gardenGame: game, tutorialState: tutorial })
                        .start("UIScene", { gardenGame: game, tutorialState: tutorial })
                        .stop();
                break;
            case "tutorialButton":
                // Start game
                game = newGame(Difficulty.Tutorial);
                tutorial = getEnabledTutorial();
                this.scene.start("MainScene", { gardenGame: game, tutorialState: tutorial })
                        .start("ToolbarScene", { gardenGame: game, tutorialState: tutorial })
                        .start("UIScene", { gardenGame: game, tutorialState: tutorial })
                        .stop();
                break;
            case "toolListButton":
                this.mainMenuGroup.setVisible(false);
                this.fadeInToolList();
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
                this.toolListGroup.setVisible(false);
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