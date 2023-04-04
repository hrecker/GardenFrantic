import { Hazard } from "../game/Hazard";
import { config } from "../model/Config";

let sounds: { [effect: string]: Phaser.Sound.BaseSound } = {};

/** Load all sound files */
export function loadSounds(scene: Phaser.Scene) {
    sounds[Hazard.Bird] = scene.sound.add(Hazard.Bird);
    sounds[Hazard.Bugs] = scene.sound.add(Hazard.Bugs);
    sounds[Hazard.Bunny] = scene.sound.add(Hazard.Bunny);
    sounds[Hazard.Meteor] = scene.sound.add(Hazard.Meteor);
    sounds[Hazard.Mole] = scene.sound.add(Hazard.Mole);
    sounds[Hazard.Weeds] = scene.sound.add(Hazard.Weeds);
}

/** Get a given sound */
export function getSound(sound: string): Phaser.Sound.BaseSound {
    return sounds[sound];
}

/** Play a given sound */
export function playSound(scene: Phaser.Scene, sound: string, loop?: boolean) {
    //TODO
    /*if (! getSettings().sfxEnabled) {
        return;
    }*/

    if (loop) {
        //TODO configuring sound volume
        // Play the cached sound when looping so that it can be stopped later
        sounds[sound].play({
            volume: config()["sfx"][sound]["volume"],
            loop: loop
        });
    } else {
        scene.sound.play(sound, {
            volume: config()["sfx"][sound]["volume"]
        });
    }
}

/** Stop sound */
export function stopSound(soundEffect: string) {
    sounds[soundEffect].stop();
}

/** Stop any playing sounds */
export function stopAllSounds() {
    Object.keys(sounds).forEach(soundEffect => {
        sounds[soundEffect].stop();
    })
}