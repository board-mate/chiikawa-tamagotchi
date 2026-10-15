// Sprite-sheet viewports retain the original generated transparent PNGs.
const blankSprite = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="320"/%3E';
function paintCharacter(node, character, outfit = 'none') {
  const frame = ['vest','pajama','explorer','ribbon'].indexOf(outfit);
  const composite = character === 'chiikawa' && frame >= 0;
  node.src = composite ? blankSprite : `assets/characters/${character}.png`;
  node.classList.toggle('drawn-outfit', composite);
  node.style.backgroundPosition = composite ? `${frame * 100 / 3}% 50%` : '';
  return composite;
}
function outfitUrl(character, outfit) { return `assets/outfits/fitted/${character}-${outfit}.svg`; }
let attackTimer = 0;
function resetAttack() {
  clearTimeout(attackTimer);
  const actor = document.querySelector('.game-pet');
  actor?.classList.remove('attack');
  if (actor) actor.dataset.pose = '0';
}
function prepareActor(mode) {
  resetAttack();
  const actor = document.querySelector('.game-pet');
  const outfit = outfitId(state.worn?.[state.character]);
  actor.dataset.drawn = String(mode === 'hunt' && state.character === 'chiikawa' && outfit === 'none');
  actor.dataset.character = state.character;
  actor.style.setProperty('--paw', state.character === 'usagi' ? '#fff0c5' : state.character === 'rakko' ? '#fff0d2' : '#fff');
}
function animateAttack() {
  resetAttack();
  const actor = document.querySelector('.game-pet');
  actor.classList.add('attack');
  actor.dataset.pose = '1';
  attackTimer = setTimeout(() => {
    actor.dataset.pose = '2';
    attackTimer = setTimeout(() => {
      actor.dataset.pose = '3';
      attackTimer = setTimeout(resetAttack, 110);
    }, 140);
  }, 100);
}
