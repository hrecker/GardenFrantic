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

export function addPlant(game: GardenGame, plantGameObject: Phaser.GameObjects.Image): Plant {
    let plant = newPlant(plantGameObject);
    game.plants[plant.id] = plant;
    return plant;
}

export function update(game: GardenGame, delta: number) {
    //TODO updating plants here
    //TODO handling levels reaching 0 or 100 here
    
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        plant.lightLevel = Math.min(Math.max(plant.lightLevel - (delta / 1000.0) * game.lightDecayRate, 0), 100);
        plant.waterLevel = Math.min(Math.max(plant.waterLevel - (delta / 1000.0) * game.waterDecayRate, 0), 100);
    });
}
