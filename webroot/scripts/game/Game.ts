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

export function startGame(): GardenGame {
    // Create first plant object
    //TODO default positioning, probably based on game window size
    let plant = newPlant({x: 200, y: 200});
    let game: GardenGame = {
        plants: {
            [plant.id]: plant
        },
        waterDecayRate: config()["waterDecayRate"],
        lightDecayRate: config()["lightDecayRate"]
    };
    console.log(game);
    return game;
}

export function update(game: GardenGame, delta: number) {
    //TODO updating plants here
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        plant.position.x += 0.01 * delta;
        plant.lightLevel -= (delta / 1000.0) * game.lightDecayRate;
        plant.waterLevel -= (delta / 1000.0) * game.waterDecayRate;
    });
}
