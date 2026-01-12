import { loadScene } from "../scene/scene.loader";
import { createWorld } from "../world/world";
import { tryMovePlayer } from "../world/collision";
import { updateTriggers } from "../world/trigger";
import { createKeyboardInput } from "../input/input";

function dirToDelta(dir: "up" | "down" | "left" | "right") {
  switch (dir) {
    case "up": return { x: 0, y: -1 };
    case "down": return { x: 0, y: 1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}

export async function startGame() {
  // ⚠️ 이 경로는 “서버로 실행”할 때만 fetch가 됨
  const scene = await loadScene("/src/assets/scenes/cafe_001.json");
  const world = createWorld(scene);

  const input = createKeyboardInput();
  input.attach();

  console.log("게임 시작!");
  console.log("이동: 방향키 또는 WASD");
  console.log("플레이어 시작 위치:", world.player.pos);

  function loop() {
    const dir = input.consumeDir();
    const interact = input.consumeInteract();
    if (dir) {
      tryMovePlayer(world, dirToDelta(dir));
      console.log("플레이어 위치:", world.player.pos);

      const events = interact ? updateTriggers(world) : [];

      for (const ev of events) {
        if (ev.type === "startDialogue") {
          console.log("✅ NPC 접근! 대화 시작:", ev.dialogueId, "(npc:", ev.npcId + ")");
        }
      }
    } else {
      const events = interact ? updateTriggers(world) : [];

      for (const ev of events) {
        if (ev.type === "startDialogue") {
          console.log("✅ NPC 접근! 대화 시작:", ev.dialogueId, "(npc:", ev.npcId + ")");
        }
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
