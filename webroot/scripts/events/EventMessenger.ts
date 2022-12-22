import { Plant } from "../game/Plant";
import { Weather } from "../game/Weather";

// This file is used for defining callbacks for events

// Callback types
type NumberCallback = {
    callback: (scene: Phaser.Scene, value: number) => void;
    scene: Phaser.Scene;
}
type PlantCallback = {
    callback: (scene: Phaser.Scene, plant: Plant) => void;
    scene: Phaser.Scene;
}
type WeatherCallback = {
    callback: (scene: Phaser.Scene, weather: Weather) => void;
    scene: Phaser.Scene;
}

// Callback lists
let scoreUpdateCallbacks: NumberCallback[] = [];
let fruitGrowthCallbacks: PlantCallback[] = [];
let fruitHarvestedCallbacks: PlantCallback[] = [];
let plantDestroyCallbacks: PlantCallback[] = [];
let weatherUpdateCallbacks: WeatherCallback[] = [];
let hazardCreatedCallbacks: NumberCallback[] = [];

/** Add a callback listening for score changes */
export function addScoreUpdateListener(callback: (scene: Phaser.Scene, score: number) => void, scene: Phaser.Scene) {
    scoreUpdateCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for score changes */
export function scoreUpdateEvent(score: number) {
    scoreUpdateCallbacks.forEach(callback => 
        callback.callback(callback.scene, score));
}

/** Add a callback listening for plant growing fruit */
export function addFruitGrowthListener(callback: (scene: Phaser.Scene, plant: Plant) => void, scene: Phaser.Scene) {
    fruitGrowthCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for plants growing fruit */
export function fruitGrowthEvent(plant: Plant) {
    fruitGrowthCallbacks.forEach(callback => 
        callback.callback(callback.scene, plant));
}

/** Add a callback listening for plants having fruit harvested */
export function addFruitHarvestListener(callback: (scene: Phaser.Scene, plant: Plant) => void, scene: Phaser.Scene) {
    fruitHarvestedCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for plants having fruit harvested */
export function fruitHarvestEvent(plant: Plant) {
    fruitHarvestedCallbacks.forEach(callback => 
        callback.callback(callback.scene, plant));
}

/** Add a callback listening for plants being destroyed */
export function addPlantDestroyListener(callback: (scene: Phaser.Scene, plant: Plant) => void, scene: Phaser.Scene) {
    plantDestroyCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for plants being destroyed */
export function plantDestroyEvent(plant: Plant) {
    plantDestroyCallbacks.forEach(callback => 
        callback.callback(callback.scene, plant));
}

/** Add a callback listening for weather changes */
export function addWeatherUpdateListener(callback: (scene: Phaser.Scene, weather: Weather) => void, scene: Phaser.Scene) {
    weatherUpdateCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for weather changes */
export function weatherUpdateEvent(weather: Weather) {
    weatherUpdateCallbacks.forEach(callback => 
        callback.callback(callback.scene, weather));
}

/** Add a callback listening for new hazards */
export function addHazardCreatedListener(callback: (scene: Phaser.Scene, hazardId: number) => void, scene: Phaser.Scene) {
    hazardCreatedCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for new hazards */
export function hazardCreatedEvent(hazardId: number) {
    hazardCreatedCallbacks.forEach(callback => 
        callback.callback(callback.scene, hazardId));
}
