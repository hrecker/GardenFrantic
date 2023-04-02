/** Check if a unit is outside the bounds of the stage */
export function vector2Str(vector: Phaser.Types.Math.Vector2Like) {
    return "(" + vector.x + ", " + vector.y + ")";
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
/** Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function randomInRange(low: number, high: number): number {
    let range = high - low;
    return Math.random() * range + low;
}

export function createSwayAnimation(scene: Phaser.Scene, key: string, frames: Phaser.Types.Animations.AnimationFrame[]) {
    scene.anims.create({
        key: key,
        frames: frames,
        frameRate: 5,
        repeat: -1
    });
}

/** Set a sprite to full white for a time */
export function flashSprite(sprite: Phaser.GameObjects.Image, durationMs: number, scene: Phaser.Scene, tintFill: number) {
    sprite.setTintFill(tintFill);
    scene.time.delayedCall(durationMs, () => {
        sprite.clearTint();
    });
}
