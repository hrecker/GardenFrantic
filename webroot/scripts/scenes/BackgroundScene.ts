import { stopAllSounds } from "../audio/Sound";
import { addSettingsListener } from "../events/EventMessenger";
import { config } from "../model/Config";
import { getSettings, Settings } from "../state/Settings";

/** Shader background shown for menu and for the main game */
export class BackgroundScene extends Phaser.Scene {
    bgMusic: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: "BackgroundScene"
        });
    }

    getMusicVolume() {
        if (getSettings().musicEnabled) {
            return config()["defaultMusicVolume"];
        } else {
            return 0;
        }
    }

    create() {
        this.bgMusic = this.sound.add('backgroundMusic');
        this.bgMusic.play({
            loop: true,
            volume: this.getMusicVolume()
        });
        addSettingsListener(this.settingsListener, this);
    }

    settingsListener(newSettings: Settings, scene: BackgroundScene) {
        if (! newSettings.sfxEnabled) {
            stopAllSounds();
        }
        // This method should be here, assuming the device supports some type of audio playback
        scene.bgMusic.setVolume(scene.getMusicVolume());
    }
}
