import { plantDestroyEvent, weatherUpdateEvent } from "../events/EventMessenger";
import { config } from "../model/Config";
import { newPlant, Plant, setLightLevel, setWaterLevel } from "./Plant";
import { Tool } from "./Tool";
import { getDefaultWeather, getLightDecayRate, getRandomWeather, getWaterDecayRate, Weather } from "./Weather";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Currently selected tool, or null if none selected */
    selectedTool: Tool;
    /** Currently active weather */
    weather: Weather;
    /** How long the current weather has lasted */
    currentWeatherDurationMs: number;
}

export function newGame(): GardenGame {
    let game: GardenGame = {
        plants: {},
        selectedTool: Tool.NoTool,
        weather: getDefaultWeather(),
        currentWeatherDurationMs: 0
    };
    return game;
}

export function addPlant(game: GardenGame, plantGameObject: Phaser.GameObjects.Image): Plant {
    let plant = newPlant(plantGameObject);
    game.plants[plant.id] = plant;
    return plant;
}

export function update(game: GardenGame, delta: number) {
    // Plant updates
    let toRemove: number[] = [];
    
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        if (plant.shouldDestroy) {
            plant.gameObject.destroy();
            plantDestroyEvent(plant);
            toRemove.push(parseInt(id));
        } else {
            setLightLevel(plant, plant.lightLevel - (delta / 1000.0) * getLightDecayRate(game.weather));
            setWaterLevel(plant, plant.waterLevel - (delta / 1000.0) * getWaterDecayRate(game.weather));
        }
    });

    // Remove any plants that were destroyed
    toRemove.forEach(id => {
        delete game.plants[id]
    });

    // Weather updates
    game.currentWeatherDurationMs += delta;
    if (game.currentWeatherDurationMs >= config()["weatherDurationMs"]) {
        game.currentWeatherDurationMs = 0;
        game.weather = getRandomWeather();
        weatherUpdateEvent(game.weather);
    }
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
