import type { World, Vec2 } from "./world";

/**
 * 타일맵 충돌: 1(벽) 타일은 못 지나가게 함.
 * 현재는 "플레이어 좌표가 들어가려는 타일"이 solid면 이동 막는 방식(초간단 MVP).
 */
export function tryMovePlayer(world: World, delta: Vec2): void {
  const { map, player } = world;

  // 입력을 그대로 더하면 부드럽게 움직이기 어려우니,
  // MVP는 "타일 단위 이동"처럼 쓸 수도 있고,
  // 나중에 dt 기반으로 확장 가능하게 구조만 둠.
  const nextX = player.pos.x + delta.x;
  const nextY = player.pos.y + delta.y;

  // 축 분리 이동: X 먼저, 그 다음 Y
  if (!isSolidTile(map, nextX, player.pos.y)) {
    player.pos.x = nextX;
  }
  if (!isSolidTile(map, player.pos.x, nextY)) {
    player.pos.y = nextY;
  }
}

function isSolidTile(map: World["map"], tileX: number, tileY: number): boolean {
  // 맵 밖이면 벽으로 취급
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) return true;

  const id = map.collision.tiles[tileY]?.[tileX] ?? 0;
  return map.collision.solids.includes(id);
}
