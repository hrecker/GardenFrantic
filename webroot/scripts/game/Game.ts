import { plantDestroyEvent } from "../events/EventMessenger";
import { config } from "../model/Config";
import { newPlant, Plant, setLightLevel, setWaterLevel } from "./Plant";
import { Tool } from "./Tool";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Rate of decay of plant water levels, per second */
    waterDecayRate: number;
    /** Rate of decay of plant light levels, per second */
    lightDecayRate: number;
    /** Currently selected tool, or null if none selected */
    selectedTool: Tool;
}

export function newGame(): GardenGame {
    let game: GardenGame = {
        plants: {},
        waterDecayRate: config()["waterDecayRate"],
        lightDecayRate: config()["lightDecayRate"],
        selectedTool: Tool.NoTool,
    };
    return game;
}

export function addPlant(game: GardenGame, plantGameObject: Phaser.GameObjects.Image): Plant {
    let plant = newPlant(plantGameObject);
    game.plants[plant.id] = plant;
    return plant;
}

export function destroyPlant(game: GardenGame, plant: Plant) {
    
}

export function update(game: GardenGame, delta: number) {
    //TODO updating plants here
    //TODO handling levels reaching 0 or 100 here
    let toRemove: number[] = [];
    
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        if (plant.shouldDestroy) {
            plant.gameObject.destroy();
            plantDestroyEvent(plant);
            toRemove.push(parseInt(id));
        } else {
            setLightLevel(plant, plant.lightLevel - (delta / 1000.0) * game.lightDecayRate);
            setWaterLevel(plant, plant.waterLevel - (delta / 1000.0) * game.waterDecayRate);
        }
    });

    // Remove any plants that were destroyed
    toRemove.forEach(id => {
        delete game.plants[id]
    })
}

export function useSelectedTool(game: GardenGame, plant: Plant) {
    switch (game.selectedTool) {
        case Tool.Lamp:
            setLightLevel(plant, plant.lightLevel + config()["lampIncrease"]);
            break;
        case Tool.WateringCan:
            setWaterLevel(plant, plant.waterLevel + config()["wateringCanIncrease"]);
            break;
    }
}
