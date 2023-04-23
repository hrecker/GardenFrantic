import { config } from "../model/Config";
import { GameResult } from "../model/GameResult";
import { getCurrentDifficulty } from "./DifficultyState";

const baseResultsKey = "GameResults";
const lifetimeStatsKey = "lifetimeStats";
let latestGameResultIndex = -1;
let latestGameResult: GameResult;

/** Save a player's score on the list of high scores */
export function saveGameResult(gameResult: GameResult): GameResult[] {
    let currentResults = getGameResults();
    latestGameResult = gameResult;
    latestGameResultIndex = -1;
    for (let i = 0; i <= currentResults.length && i < config()["maxGamesStored"]; i++) {
        if (i == currentResults.length) {
            currentResults.push(latestGameResult);
            latestGameResultIndex = i;
            break;
        } else if (latestGameResult.score >= currentResults[i].score) {
            currentResults.splice(i, 0, latestGameResult);
            latestGameResultIndex = i;
            break;
        }
    }

    // Truncate array to max length
    if (currentResults.length > config()["maxGamesStored"]) {
        currentResults = currentResults.slice(0, config()["maxGamesStored"]);
    }

    let lifetimeStats = getLifetimeStats();
    lifetimeStats.score += latestGameResult.score;
    lifetimeStats.fruitHarvested += latestGameResult.fruitHarvested;
    lifetimeStats.hazardsDefeated += latestGameResult.hazardsDefeated;
    lifetimeStats.deaths += latestGameResult.deaths;
    localStorage.setItem(getResultsKey(), JSON.stringify(currentResults));
    // Add all stats from all difficulties to the same lifetimestats object
    localStorage.setItem(lifetimeStatsKey, JSON.stringify(lifetimeStats));
    return currentResults;
}

/** Get the current high score list for the player */
export function getGameResults(): GameResult[] {
    let results = localStorage.getItem(getResultsKey())
    if (! results) {
        return [];
    }
    let parsed = JSON.parse(results);
    let gameResults: GameResult[] = [];
    parsed.forEach(gameResult => {
        gameResults.push(parseGameResult(gameResult));
    });
    return gameResults;
}

/** Get the key for results for the currently selected challenge (or the main game mode) */
function getResultsKey() {
    return getCurrentDifficulty() + baseResultsKey;
}

/** Parse a game result from an object, setting default values for anything undefined */
function parseGameResult(json: any): GameResult {
    let score = "score" in json ? json.score : 0;
    let hazardsDefeated = "hazardsDefeated" in json ? json.hazardsDefeated : 0;
    let fruitHarvested = "fruitHarvested" in json ? json.fruitHarvested : 0;
    let deaths = "deaths" in json ? json.deaths : 0;

    if (typeof score !== "number") {
        score = 0;
    }
    if (typeof hazardsDefeated !== "number") {
        hazardsDefeated = 0;
    }
    if (typeof fruitHarvested !== "number") {
        fruitHarvested = 0;
    }
    if (typeof deaths !== "number") {
        deaths = 0;
    }

    return {
        score: score,
        hazardsDefeated: hazardsDefeated,
        fruitHarvested: fruitHarvested,
        deaths: deaths
    };
}

/** Get lifetime stats for the player */
export function getLifetimeStats(): GameResult {
    let results = localStorage.getItem(lifetimeStatsKey)
    if (! results) {
        return parseGameResult({});
    }
    return parseGameResult(JSON.parse(results));
}

/** Get the index of the latest game result in the stored array */
export function getLatestGameResultIndex() {
    return latestGameResultIndex;
}

/** Get the latest game result */
export function getLatestGameResult() {
    return latestGameResult;
}
