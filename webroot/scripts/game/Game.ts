import { config } from "../model/Config";
import { newPlant, Plant } from "./Plant";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Rate of decay of plant water levels, per second */
    waterDecayRate: number;
    /** Rate of decay of plant light levels, per second */
    lightDecayRate: number;
}

export function newGame(): GardenGame {
    let game: GardenGame = {
        plants: {},
        waterDecayRate: config()["waterDecayRate"],
        lightDecayRate: config()["lightDecayRate"]
    };
    return game;
}

export function startGame(game: GardenGame, scene: Phaser.Scene): GardenGame {
    // Create first plant object
    //TODO default positioning, probably based on game window size
    //TODO plant texture
    let plant = newPlant(scene.add.image(200, 200, "plant"));
    game.plants[plant.id] = plant;
    return game;
}

export function update(game: GardenGame, delta: number) {
    //TODO updating plants here
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        plant.gameObject.x += 0.01 * delta;
        plant.lightLevel -= (delta / 1000.0) * game.lightDecayRate;
        plant.waterLevel -= (delta / 1000.0) * game.waterDecayRate;
    });
}
