import { gameResetEvent, hazardCreatedEvent, plantDestroyEvent, scoreUpdateEvent, weatherUpdateEvent } from "../events/EventMessenger";
import { config } from "../model/Config";
import { ActiveHazard, getHazardTimeToActive, getHazardType, getNextHazardDurationMs, getRandomizedHazards, Hazard, HazardType } from "./Hazard";
import { getNewId } from "./Id";
import { isFruitGrowthPaused, newPlant, harvestFruit, Plant, setFruitProgress, Status, updateStatusLevel, numWarningStatus, getFruitProgressRate, removeHazardByType, removeHazardById, FruitGrowthStage } from "./Plant";
import * as tool from "./Tool";
import * as weather from "./Weather";
import { shuffleArray } from "../util/Util";

export type GardenGame = {
    /** Plants in the game */
    plants: { [id: number]: Plant };
    /** Currently selected tool, or null if none selected */
    selectedTool: tool.Tool;
    /** Currently active weather */
    weather: weather.Weather;
    /** Upcoming weather */
    weatherQueue: weather.Weather[];
    /** How long the current weather has lasted */
    currentWeatherDurationMs: number;
    /** Active hazards */
    activeHazards: { [id: number]: ActiveHazard };
    /** How long ago the current hazard started */
    currentHazardDurationMs: number;
    /** Time until the next hazard should start */
    nextHazardDuration: number;
    /** Time since last score bump */
    timeSinceLastScoreBump: number;
    /** Current score */
    score: number;
}

function defaultGame(): GardenGame {
    return {
        plants: {},
        selectedTool: tool.Tool.NoTool,
        weather: weather.getDefaultWeather(),
        weatherQueue: initialWeatherQueue(),
        currentWeatherDurationMs: 0,
        activeHazards: [],
        currentHazardDurationMs: 0,
        nextHazardDuration: getNextHazardDurationMs(),
        score: 0,
        timeSinceLastScoreBump: 0
    };
}

export function newGame(): GardenGame {
    let game = defaultGame();
    weatherUpdateEvent(game.weather, game.weatherQueue);
    return game;
}

export function resetGame(game: GardenGame) {
    let base = defaultGame();
    game.plants = base.plants;
    game.selectedTool = base.selectedTool;
    game.weather = base.weather;
    game.weatherQueue = base.weatherQueue;
    game.currentWeatherDurationMs = base.currentWeatherDurationMs;
    game.activeHazards = base.activeHazards;
    game.currentHazardDurationMs = base.currentHazardDurationMs;
    game.nextHazardDuration = base.nextHazardDuration;
    game.score = base.score;
    game.timeSinceLastScoreBump = base.timeSinceLastScoreBump;
    weatherUpdateEvent(game.weather, game.weatherQueue);
    gameResetEvent();
}

function initialWeatherQueue(): weather.Weather[] {
    let queue = [];
    for (let i = 0; i < config()["weatherQueueLength"]; i++) {
        queue.push(weather.getRandomWeather());
    }
    return queue;
}

function advanceWeather(game: GardenGame) {
    game.weather = game.weatherQueue[0];
    for (let i = 0; i < game.weatherQueue.length - 1; i++) {
        game.weatherQueue[i] = game.weatherQueue[i + 1];
    }
    game.weatherQueue[game.weatherQueue.length - 1] = weather.getRandomWeather();
}

export function addPlant(game: GardenGame, plantGameObject: Phaser.GameObjects.Sprite): Plant {
    let plant = newPlant(plantGameObject);
    game.plants[plant.id] = plant;
    return plant;
}

export function update(game: GardenGame, delta: number) {
    // Plant updates
    let toRemove: number[] = [];
    
    Object.keys(game.plants).forEach(id => {
        let plant: Plant = game.plants[id];
        if (plant.shouldDestroy && ! config()["invinciblePlants"]) {
            plant.gameObject.destroy();
            plantDestroyEvent(plant);
            toRemove.push(parseInt(id));
        } else {
            updateStatusLevel(plant, Status.Light, -delta / 1000.0 * getLightDecayRateForPlant(game, plant));
            updateStatusLevel(plant, Status.Water, -delta / 1000.0 * getWaterDecayRateForPlant(game, plant));
            updateStatusLevel(plant, Status.Health, -delta / 1000.0 * getHealthDecayRateForPlant(game, plant));
            if (! isFruitGrowthPaused(game, plant)) {
                setFruitProgress(plant, plant.fruitProgress + (delta / 1000.0) * getFruitProgressRate(plant))
            }
        }
    });

    // Remove any plants that were destroyed, and remove corresponding active tools
    toRemove.forEach(id => {
        delete game.plants[id];
    });

    // Weather updates
    game.currentWeatherDurationMs += delta;
    if (game.currentWeatherDurationMs >= config()["weatherDurationMs"]) {
        game.currentWeatherDurationMs = 0;
        advanceWeather(game);
        weatherUpdateEvent(game.weather, game.weatherQueue);
    }

    // Hazard updates
    Object.keys(game.activeHazards).forEach(id => {
        let activeHazard: ActiveHazard = game.activeHazards[id];
        if (activeHazard.timeUntilActiveMs > 0) {
            activeHazard.timeUntilActiveMs -= delta;
        } else {
            if (getHazardType(activeHazard.hazard) == HazardType.Impact) {
                // Impact hazards apply immediately
                updateStatusLevel(game.plants[activeHazard.targetPlantId], Status.Health, -config()["hazards"][activeHazard.hazard.toString()]["healthDamageRate"]);
                removeHazardById(game, game.plants[activeHazard.targetPlantId], activeHazard.id)
            }
        }
    });

    game.currentHazardDurationMs += delta;
    if (game.currentHazardDurationMs >= game.nextHazardDuration && Object.keys(game.plants).length > 0) {
        game.currentHazardDurationMs = 0;
        game.nextHazardDuration = getNextHazardDurationMs();
        let targetPlant = getRandomPlant(game).id;
        // Select a hazard that isn't already active for this plant
        // There is a chance that we select a plant that can't add any new hazards when another
        // plant could get a hazard. I'll just accept this as a feature for now - anyways if a plant
        // has every possible hazard things are likely pretty bad already for the player
        let possibleHazards = getRandomizedHazards();
        let chosenHazard: Hazard = null;
        let foundHazards: Hazard[] = [];
        // Build list of all hazards currently active for the chosen plant
        for (let i = 0; i < game.plants[targetPlant].activeHazardIds.length; i++) {
            foundHazards.push(game.activeHazards[game.plants[targetPlant].activeHazardIds[i]].hazard);
        }
        for (let i = 0; i < possibleHazards.length; i++) {
            let existingHazardFound = false;
            for (let j = 0; j < foundHazards.length; j++) {
                if (possibleHazards[i] == foundHazards[j]) {
                    existingHazardFound = true;
                    break;
                }
            }
            if (! existingHazardFound) {
                chosenHazard = possibleHazards[i];
                break;
            }
        }
        if (chosenHazard != null) {
            let activeHazard: ActiveHazard = {
                id: getNewId(),
                hazard: chosenHazard,
                timeUntilActiveMs: getHazardTimeToActive(chosenHazard),
                targetPlantId: targetPlant,
            }
            game.activeHazards[activeHazard.id] = activeHazard;
            game.plants[targetPlant].activeHazardIds.push(activeHazard.id);
            hazardCreatedEvent(activeHazard.id);
        }
    }

    // Score updates
    game.timeSinceLastScoreBump += delta;
    if (game.timeSinceLastScoreBump >= config()["scoreBumpIntervalMs"]) {
        // Calculate score to be added
        let maxScorePerPlant = config()["maxScoreBumpPerPlant"];
        let plantScore = 0;
        Object.keys(game.plants).forEach(id => {
            let plant: Plant = game.plants[id];
            plantScore += maxScorePerPlant * (plant.levels[Status.Health] / config()["maxLevel"]);
        });
        addScore(game, Math.floor(plantScore));
        game.timeSinceLastScoreBump = 0;
    }
}

function getRandomPlant(game: GardenGame): Plant {
    let ids = [];
    Object.keys(game.plants).forEach(id => {
        ids.push(id);
    });
    shuffleArray(ids);
    return game.plants[ids[0]];
}

export function getLightDecayRateForPlant(game: GardenGame, plant: Plant) {
    return weather.getDecayRate(game.weather, Status.Light);
}

export function getWaterDecayRateForPlant(game: GardenGame, plant: Plant) {
    return weather.getDecayRate(game.weather, Status.Water);
}

export function getHealthDecayRateForPlant(game: GardenGame, plant: Plant): number {
    let decayRate = config()["healthGrowthRate"] * -1;
    // If any status is at warning level, then health will decrease
    let numWarning = numWarningStatus(plant);
    if (numWarning > 0) {
        decayRate = config()["healthDecayRateBase"] * numWarning;
    }
    let hazardDecayRate = 0;
    for (let i = 0; i < plant.activeHazardIds.length; i++) {
        let hazard: ActiveHazard = game.activeHazards[plant.activeHazardIds[i]];
        if (hazard.timeUntilActiveMs <= 0) {
            hazardDecayRate += config()["hazards"][hazard.hazard.toString()]["healthDamageRate"];
        }
    }
    // If hazards are causing damage then don't let health increase
    if (hazardDecayRate > 0 && decayRate < 0) {
        decayRate = 0;
    }
    return decayRate + hazardDecayRate;
}

/** Use the currently selected tool on the given plant. */
export function useSelectedTool(game: GardenGame, plant: Plant): Tool {
    if (! game.selectedTool) {
        return null;
    }

    switch (tool.getCategory(game.selectedTool)) {
        case tool.ToolCategory.Harvest:
            if (plant.fruitGrowthStage == FruitGrowthStage.FullyGrown) {
                harvestFruit(plant);
                addScore(game, config()["fruitHarvestPoints"]);
                return game.selectedTool;
            }
            break;
        case tool.ToolCategory.HazardRemoval:
            removeHazardByType(game, plant, config()["tools"][game.selectedTool]["target"]);
            break;
        // Otherwise, update the plant's status
        case tool.ToolCategory.Water:
            updateStatusLevel(plant, Status.Water, tool.getDelta(game.selectedTool));
            return game.selectedTool;
        case tool.ToolCategory.Light:
            updateStatusLevel(plant, Status.Light, tool.getDelta(game.selectedTool));
            return game.selectedTool;
        case tool.ToolCategory.Growth:
            if (! isFruitGrowthPaused(game, plant)) {
                setFruitProgress(plant, plant.fruitProgress + tool.getDelta(game.selectedTool));
                return game.selectedTool;
            }
            break;
    }
    
    return null;
}

export function removeHazardIfRightToolSelected(game: GardenGame, hazard: ActiveHazard): boolean {
    if (! game.selectedTool || tool.getCategory(game.selectedTool) != tool.ToolCategory.HazardRemoval) {
        return;
    }

    if (config()["tools"][game.selectedTool]["target"] == hazard.hazard) {
        let plantIds = Object.keys(game.plants);
        for (let i = 0; i < plantIds.length; i++) {
            if (removeHazardById(game, game.plants[plantIds[i]], hazard.id)) {
                return true;
            }
        }
    }
    return false;
}

function addScore(game: GardenGame, toAdd: number) {
    game.score += toAdd;
    scoreUpdateEvent(game.score);
}
