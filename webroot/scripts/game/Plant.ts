import { config } from "../model/Config"
import { getNewId } from "./Id"

export type Plant = {
    id: number;
    waterLevel: number;
    lightLevel: number;
    position: Phaser.Math.Vector2;
}

export function newPlant(position: Phaser.Types.Math.Vector2Like): Plant {
    return {
        id: getNewId(),
        waterLevel: config()["defaultWaterLevel"],
        lightLevel: config()["defaultLightLevel"],
        position: new Phaser.Math.Vector2(position.x, position.y)
    }
}
