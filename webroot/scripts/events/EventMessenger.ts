import { Hazard } from "../game/Hazard";
import { Plant } from "../game/Plant";
import { Weather } from "../game/Weather";
import { Settings } from "../state/Settings";

// This file is used for defining callbacks for events

// Callback types
type VoidCallback = {
    callback: (scene: Phaser.Scene) => void;
    scene: Phaser.Scene;
}
type NumberCallback = {
    callback: (scene: Phaser.Scene, value: number) => void;
    scene: Phaser.Scene;
}
type PlantCallback = {
    callback: (scene: Phaser.Scene, plant: Plant) => void;
    scene: Phaser.Scene;
}
type WeatherCallback = {
    callback: (scene: Phaser.Scene, weather: Weather, weatherQueue: Weather[]) => void;
    scene: Phaser.Scene;
}
type SettingsCallback = {
    callback: (newSettings: Settings, scene: Phaser.Scene) => void;
    scene: Phaser.Scene;
}

// Callback lists
let gameResetCallbacks: VoidCallback[] = [];
let scoreUpdateCallbacks: NumberCallback[] = [];
let fruitGrowthCallbacks: PlantCallback[] = [];
let fruitHarvestedCallbacks: PlantCallback[] = [];
let plantDestroyCallbacks: PlantCallback[] = [];
let weatherUpdateCallbacks: WeatherCallback[] = [];
let hazardCreatedCallbacks: NumberCallback[] = [];
let hazardDestroyedCallbacks: NumberCallback[] = [];
let hazardImpactCallbacks: NumberCallback[] = [];
let settingsCallbacks: SettingsCallback[] = [];
let wrongToolCallbacks: VoidCallback[] = [];

/** Clear out any active listeners */
export function clearListeners() {
    gameResetCallbacks = [];
    scoreUpdateCallbacks = [];
    fruitGrowthCallbacks = [];
    fruitHarvestedCallbacks = [];
    plantDestroyCallbacks = [];
    weatherUpdateCallbacks = [];
    hazardCreatedCallbacks = [];
    hazardDestroyedCallbacks = [];
    hazardImpactCallbacks = [];
    wrongToolCallbacks = [];
    // Don't clear settings callbacks since only the background scene listens to the settings
}

/** Add a callback listening for game reset */
export function addGameResetListener(callback: (scene: Phaser.Scene) => void, scene: Phaser.Scene) {
    gameResetCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for game reset */
export function gameResetEvent() {
    gameResetCallbacks.forEach(callback => 
        callback.callback(callback.scene));
}

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
export function addWeatherUpdateListener(callback: (scene: Phaser.Scene, weather: Weather, weatherQueue: Weather[]) => void, scene: Phaser.Scene) {
    weatherUpdateCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for weather changes */
export function weatherUpdateEvent(weather: Weather, weatherQueue: Weather[]) {
    weatherUpdateCallbacks.forEach(callback => 
        callback.callback(callback.scene, weather, weatherQueue));
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

/** Add a callback listening for destroyed hazards */
export function addHazardDestroyedListener(callback: (scene: Phaser.Scene, hazardId: number) => void, scene: Phaser.Scene) {
    hazardDestroyedCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for destroyed hazards */
export function hazardDestroyedEvent(hazardId: number) {
    hazardDestroyedCallbacks.forEach(callback => 
        callback.callback(callback.scene, hazardId));
}

/** Add a callback listening for settings changes */
export function addSettingsListener(callback: (newSettings: Settings, scene: Phaser.Scene) => void, scene: Phaser.Scene) {
    settingsCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any callbacks listening for settings changes */
export function settingsEvent(newSettings: Settings) {
    settingsCallbacks.forEach(callback => 
        callback.callback(newSettings, callback.scene));
}

/** Call any listeners for hazard impacts */
export function hazardImpactEvent(hazardId: number) {
    hazardImpactCallbacks.forEach(callback => 
        callback.callback(callback.scene, hazardId));
}

/** Add a callback listening for hazard impacts */
export function addHazardImpactListener(callback: (scene: Phaser.Scene, hazardId: number) => void, scene: Phaser.Scene) {
    hazardImpactCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Add a callback listening for the wrong tool being used */
export function addWrongToolListener(callback: (scene: Phaser.Scene) => void, scene: Phaser.Scene) {
    wrongToolCallbacks.push({ 
        callback: callback,
        scene: scene
    });
}

/** Call any listeners for the wrong tool being used */
export function wrongToolEvent() {
    wrongToolCallbacks.forEach(callback => 
        callback.callback(callback.scene));
}

