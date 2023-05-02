import { createSwayAnimation, randomInRange, shuffleArray } from "../util/Util";

export type BackgroundImageSpawner = {
    spawnIntervalMinMs: number;
    spawnIntervalMaxMs: number;
    nextSpawnIntervalMs: number;
    timeSinceSpawnMs: number;
    spritePool: Phaser.GameObjects.Sprite[];
    currentSpritePoolIndex: number;
}

const spritePoolSize = 6;

export function newBackgroundImageSpawner(scene: Phaser.Scene, spawnIntervalMinMs: number, spawnIntervalMaxMs: number): BackgroundImageSpawner {
    let spritePool = [];
    for (let i = 0; i < spritePoolSize; i++) {
        spritePool.push(scene.add.sprite(-100, -100, "leaf1"));
    }

    return {
        spawnIntervalMinMs: spawnIntervalMinMs,
        spawnIntervalMaxMs: spawnIntervalMaxMs,
        nextSpawnIntervalMs: nextSpawnInterval(spawnIntervalMinMs, spawnIntervalMaxMs),
        timeSinceSpawnMs: 0,
        spritePool: spritePool,
        currentSpritePoolIndex: 0,
    };
}

export function createBackgroundImageAnimations(scene: Phaser.Scene) {
    createSwayAnimation(scene, 'leafsway', [
        { key: 'leaf1' },
        { key: 'leaf2' },
    ]);
    createSwayAnimation(scene, 'spikeleafsway', [
        { key: 'spikeleaf1' },
        { key: 'spikeleaf2' },
    ]);
    createSwayAnimation(scene, 'butterflysway', [
        { key: 'butterfly1' },
        { key: 'butterfly2' },
    ]);
}

function nextSpawnInterval(minMs: number, maxMs: number) {
    return randomInRange(minMs, maxMs);
}

export function update(scene: Phaser.Scene, delta: number, spawner: BackgroundImageSpawner) {
    spawner.timeSinceSpawnMs += delta;
    if (spawner.timeSinceSpawnMs >= spawner.nextSpawnIntervalMs) {
        let startX = -100;
        let endX = scene.game.renderer.width + 100;
        let startY = 200;

        let sprite = spawner.spritePool[spawner.currentSpritePoolIndex];
        sprite.setTexture(getSpawnImage());
        sprite.play(sprite.texture.key.substring(0, sprite.texture.key.length - 1) + "sway");
        sprite.x = startX;
        sprite.y = startY;

        scene.add.tween({
            targets: sprite,
            x: endX,
            duration: 3500
        });

        spawner.timeSinceSpawnMs = 0;
        spawner.nextSpawnIntervalMs = nextSpawnInterval(spawner.spawnIntervalMinMs, spawner.spawnIntervalMaxMs);
        spawner.currentSpritePoolIndex = (spawner.currentSpritePoolIndex + 1) % spawner.spritePool.length;
    }
}

let spawnImages = [
    "butterfly1",
    "leaf1",
    "spikeleaf1"
];
function getSpawnImage() {
    shuffleArray(spawnImages);
    return spawnImages[0];
}