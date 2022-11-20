import { Plant } from "../game/Plant";
import { Weather } from "../game/Weather";

// This file is used for defining callbacks for events

// Callback types
type PlantCallback = {
    callback: (scene: Phaser.Scene, plant: Plant) => void;
    scene: Phaser.Scene;
}
type WeatherCallback = {
    callback: (scene: Phaser.Scene, weather: Weather) => void;
    scene: Phaser.Scene;
}

// Callback lists
let plantDestroyCallbacks: PlantCallback[] = [];
let weatherUpdateCallbacks: WeatherCallback[] = [];

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
