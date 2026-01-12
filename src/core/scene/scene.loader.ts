export type Scene = any;

export async function loadScene(path: string): Promise<Scene> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("scene.json 불러오기 실패");
  }
  return await response.json();
}
