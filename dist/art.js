// Sprite-sheet viewports retain the original generated transparent PNGs.
const blankSprite = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="320"/%3E';
const partyCharacters = ['chiikawa','hachiware','usagi'];
const partyColors = {chiikawa:'분홍',hachiware:'하늘색',usagi:'노란색'};
function isCompositeOutfit(character,outfit) { return (outfit==='party'&&partyCharacters.includes(character)) || (character==='chiikawa'&&['vest','pajama','explorer','ribbon'].includes(outfit)); }
function paintCharacter(node, character, outfit = 'none') {
  const party = outfit==='party'&&partyCharacters.includes(character);
  const frame = ['vest','pajama','explorer','ribbon'].indexOf(outfit);
  const composite = isCompositeOutfit(character,outfit);
  node.src = composite ? blankSprite : `assets/characters/${character}.png`;
  node.classList.toggle('drawn-outfit', composite);
  node.classList.toggle('party-outfit',party);
  node.classList.toggle('party-usagi',party&&character==='usagi');
  node.dataset.character=character;
  node.style.backgroundImage=party?`url("assets/sprites/${character}-party-v6.png")`:'';
  node.style.backgroundPosition = party?'0% 50%':composite?`${frame * 100 / 3}% 50%`:'';
  return composite;
}
function dirtArt(character, outfit) {
  const composite = isCompositeOutfit(character,outfit);
  return composite ? 'assets/sprites/mud-dressed.svg' : 'assets/sprites/mud-body.svg';
}
function updateDirt() {
  const outfit = outfitId(state.worn?.[state.character]);
  const level = state.clean >= 85 ? 0 : state.clean >= 45 ? 1 : 2;
  $('#petButton').dataset.mud = String(level);
  $('#dirt').style.backgroundImage = `url("${dirtArt(state.character,outfit)}")`;
  $('#dirt').hidden = level === 0;
  $('#petButton').setAttribute('aria-label', `${characterName()} 쓰다듬기${level ? ' · 몸에 흙이 묻었어요' : ''}`);
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
