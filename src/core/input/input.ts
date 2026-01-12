export type Dir = "up" | "down" | "left" | "right";

/**
 * 키보드 입력을 “방향”으로만 뽑아주는 아주 단순한 입력기.
 * 브라우저에서만 동작(윈도우 탐색기에서 더블클릭 실행 같은 건 불가)
 */
export function createKeyboardInput() {
  let lastDir: Dir | null = null;
  let interact = false;

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        lastDir = "up";
        break;
      case "ArrowDown":
      case "s":
      case "S":
        lastDir = "down";
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        lastDir = "left";
        break;
      case "ArrowRight":
      case "d":
      case "D":
        lastDir = "right";
        break;
      case " ":
      case "Enter":
        interact = true;
        break;
    }
  }

  // 외부에서 “한 번만 소비”하도록
  function consumeDir(): Dir | null {
    const d = lastDir;
    lastDir = null;
    return d;
  }

  function consumeInteract(): boolean {
    const v = interact;
    interact = false;
    return v;
  }

  function attach() {
    window.addEventListener("keydown", onKeyDown);
  }

  function detach() {
    window.removeEventListener("keydown", onKeyDown);
  }

  return { attach, detach, consumeDir, consumeInteract };
}
