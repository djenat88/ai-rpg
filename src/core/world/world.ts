export type Vec2 = { x: number; y: number };

export type SceneData = {
  map: {
    tileSize: number;
    width: number;
    height: number;
    collision: {
      solids: number[];
      tiles: number[][];
    };
  };
  player: {
    spawn: Vec2;
    speed: number;
  };
  npcs: Array<{
    id: string;
    name: string;
    pos: Vec2;
    trigger: {
      type: "proximity";
      radius: number;
      dialogueId: string;
    };
  }>;
};

export type Player = {
  pos: Vec2;   // 타일 좌표(예: x=2, y=2)
  speed: number;
};

export type NpcRuntime = {
  id: string;
  name: string;
  pos: Vec2; // 타일 좌표
  triggerRadius: number;
  dialogueId: string;
  wasInside: boolean; // 트리거 1회 발동용
};

export type World = {
  sceneId: string;
  map: SceneData["map"];
  player: Player;
  npcs: NpcRuntime[];
};

export function createWorld(scene: any): World {
  const s = scene as SceneData;

  return {
    sceneId: scene.id ?? "unknown_scene",
    map: s.map,
    player: {
      pos: { x: s.player.spawn.x, y: s.player.spawn.y },
      speed: s.player.speed
    },
    npcs: (s.npcs ?? []).map((n) => ({
      id: n.id,
      name: n.name,
      pos: { x: n.pos.x, y: n.pos.y },
      triggerRadius: n.trigger.radius,
      dialogueId: n.trigger.dialogueId,
      wasInside: false
    }))
  };
}
