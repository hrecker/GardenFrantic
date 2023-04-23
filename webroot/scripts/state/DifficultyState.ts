/** Enum for available game difficulties */
export enum Difficulty {
    Easy = "Easy",
    Normal = "Normal",
    Chaos = "Chaos",
}

let currentDifficulty: Difficulty = Difficulty.Normal;

/** Set the currently active difficulty */
export function setDifficulty(difficulty: Difficulty) {
    currentDifficulty = difficulty;
}

/** Set the currently active difficulty back to normal */
export function resetDifficulty() {
    setDifficulty(Difficulty.Normal);
}

/** Get the currently active difficulty */
export function getCurrentDifficulty(): Difficulty {
    return currentDifficulty;
}
