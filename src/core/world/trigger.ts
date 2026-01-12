import type { World } from "./world";

export type TriggerEvent =
  | { type: "startDialogue"; npcId: string; dialogueId: string };

export function updateTriggers(world: World): TriggerEvent[] {
  const events: TriggerEvent[] = [];

  const px = world.player.pos.x;
  const py = world.player.pos.y;

  for (const npc of world.npcs) {
    const dx = px - npc.pos.x;
    const dy = py - npc.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const inside = dist <= npc.triggerRadius;

    // 반경 "들어오는 순간"에만 1회 발생
    if (inside && !npc.wasInside) {
      events.push({
        type: "startDialogue",
        npcId: npc.id,
        dialogueId: npc.dialogueId
      });
    }

    npc.wasInside = inside;
  }

  return events;
}
