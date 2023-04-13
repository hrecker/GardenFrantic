import { config } from "../model/Config";

/** Shader background shown for menu and for the main game */
export class BackgroundScene extends Phaser.Scene {
    bgMusic: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: "BackgroundScene"
        });
    }

    getMusicVolume() {
        //TODO
        /*if (getSettings().musicEnabled) {
            return config()["defaultMusicVolume"];
        } else {
            return 0;
        }*/
        return 1;
    }

    create() {
        this.bgMusic = this.sound.add('backgroundMusic');
        this.bgMusic.play({
            loop: true,
            volume: this.getMusicVolume()
        });
        //addSettingsListener(this.settingsListener, this);
    }

    //TODO
    /*settingsListener(newSettings: Settings, scene: Phaser.Scene) {
        bgMusic.setVolume(scene.getMusicVolume());
        if (! newSettings.sfxEnabled) {
            stopAllSounds();
        }
    }*/
}
