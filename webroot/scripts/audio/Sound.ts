import { Hazard } from "../game/Hazard";
import { Tool } from "../game/Tool";
import { config } from "../model/Config";
import { getSettings } from "../state/Settings";

let sounds: { [effect: string]: Phaser.Sound.BaseSound } = {};

export const ButtonClick = "buttonClick";

/** Load all sound files */
export function loadSounds(scene: Phaser.Scene) {
    sounds[Hazard.Bird] = scene.sound.add(Hazard.Bird);
    sounds[Hazard.Bugs] = scene.sound.add(Hazard.Bugs);
    sounds[Hazard.Bunny] = scene.sound.add(Hazard.Bunny);
    sounds[Hazard.Meteor] = scene.sound.add(Hazard.Meteor);
    sounds[Hazard.Mole] = scene.sound.add(Hazard.Mole);
    sounds[Hazard.Weeds] = scene.sound.add(Hazard.Weeds);
    sounds[Tool.Scarecrow] = scene.sound.add(Tool.Scarecrow);
    sounds[Tool.Pesticide] = scene.sound.add(Tool.Pesticide);
    sounds[Tool.Missile] = scene.sound.add(Tool.Missile);
    sounds[Tool.Hammer] = scene.sound.add(Tool.Hammer);
    sounds[Tool.Dog] = scene.sound.add(Tool.Dog);
    sounds[Tool.Weedkiller] = scene.sound.add(Tool.Weedkiller);
    sounds[Tool.Basket] = scene.sound.add(Tool.Basket);
    sounds[Tool.Fertilizer] = scene.sound.add(Tool.Fertilizer);
    sounds[Tool.Lamp] = scene.sound.add(Tool.Lamp);
    sounds[Tool.Shade] = scene.sound.add(Tool.Shade);
    sounds[Tool.WateringCan] = scene.sound.add(Tool.WateringCan);
    sounds[Tool.Umbrella] = scene.sound.add(Tool.Umbrella);
    sounds[ButtonClick] = scene.sound.add(ButtonClick);
}

/** Get a given sound */
export function getSound(sound: string): Phaser.Sound.BaseSound {
    return sounds[sound];
}

/** Play a given sound */
export function playSound(scene: Phaser.Scene, sound: string, loop?: boolean) {
    if (! getSettings().sfxEnabled) {
        return;
    }

    if (loop) {
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