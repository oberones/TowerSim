/** Shared composition entry. Importing this module has no mounting side effects. */
export function mountGame(root: HTMLElement): () => void {
  const heading = document.createElement('h1');
  heading.textContent = 'TowerSim';
  const status = document.createElement('p');
  status.textContent = 'Project setup is ready. Gameplay is not implemented yet.';
  root.replaceChildren(heading, status);
  return () => { heading.remove(); status.remove(); };
}
