import { Plant } from "../game/Plant";

// This file is used for defining callbacks for events

// Callback types
type PlantCallback = {
    callback: (scene: Phaser.Scene, plant: Plant) => void;
    scene: Phaser.Scene;
}

// Callback lists
let plantDestroyCallbacks: PlantCallback[] = [];

/** Clear out any active listeners */
export function clearListeners() {
    plantDestroyCallbacks = [];
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
