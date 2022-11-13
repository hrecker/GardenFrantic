import { config } from "../model/Config"
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    waterLevel: number;
    lightLevel: number;
    gameObject: Phaser.GameObjects.Image;
}

export function newPlant(gameObject: Phaser.GameObjects.Image): Plant {
    return {
        id: getNewId(),
        waterLevel: config()["defaultWaterLevel"],
        lightLevel: config()["defaultLightLevel"],
        gameObject: gameObject
    }
}
