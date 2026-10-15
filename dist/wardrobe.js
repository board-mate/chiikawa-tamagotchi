const mealClothes = document.createElement('img');
mealClothes.id = 'mealOutfit'; mealClothes.alt = ''; mealClothes.hidden = true;
$('#mealPet').after(mealClothes);
const mealDirt = document.createElement('img');mealDirt.id='mealDirt';mealDirt.alt='';mealDirt.hidden=true;mealClothes.after(mealDirt);
$('#characterSwitcher').innerHTML = characters.map(([name,id]) => '<button data-character="' + id + '" aria-pressed="false"><img src="assets/characters/' + id + '.png" alt=""><span>' + name + '</span></button>').join('');
$$('[data-character]').forEach(button => button.addEventListener('click', () => selectCharacter(button.dataset.character)));
$('#outfitShop').innerHTML = outfits.map(item => '<button data-outfit="' + item.id + '"><span class="outfit-preview"><img class="shop-body" alt=""><img class="shop-clothes" alt="" hidden></span><b>' + item.name + '</b><small></small></button>').join('');
window.renderWardrobe = () => {
  const current = outfitId(state.worn?.[state.character]);
  $$('[data-character]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.character === state.character)));
  $$('[data-outfit]').forEach(button => {
    const item = outfits.find(item => item.id === button.dataset.outfit);
    button.hidden=item.id==='party'&&!partyCharacters.includes(state.character);
    if(button.hidden)return;
    const composite = paintCharacter(button.querySelector('.shop-body'),state.character,item.id);
    const clothes = button.querySelector('.shop-clothes');
    clothes.hidden = item.id === 'none' || composite;
    if (!clothes.hidden) clothes.src = outfitUrl(state.character,item.id);
    button.querySelector('b').textContent=item.id==='party'?'파자마 파티 · '+partyColors[state.character]:item.name;
    button.querySelector('small').textContent = current === item.id ? '입고 있어요' : state.ownedOutfits.includes(item.id) ? '입기' : '✦ ' + item.price;
    button.setAttribute('aria-pressed', String(current === item.id));
  });
  $('#wearingLabel').textContent = current==='party'?'파자마 파티 · '+partyColors[state.character]:outfits.find(item => item.id === current).name;
  const info = homeInfos[state.character];
  $('#homeLabel').textContent = info[1];
  $('#world').dataset.habitat = info[0];
  $('#homeHabitat').innerHTML = habitatMarkup(state.character);
};
$$('[data-outfit]').forEach(button => button.addEventListener('click', () => {
  if (mealActive || activeGame) return;
  const item = outfits.find(item => item.id === button.dataset.outfit);
  if(item.id==='party'&&!partyCharacters.includes(state.character))return;
  if (!state.ownedOutfits.includes(item.id)) {
    if (state.coins < item.price) { showToast('별이 부족해요. 테스트 별을 받아보세요!'); return; }
    state.coins -= item.price; state.ownedOutfits.push(item.id);
  }
  state.worn[state.character] = item.id;
  persist(); $('#roomLinkBox').hidden = true;
  showToast(item.id === 'none' ? '기본 모습으로 돌아왔어요.' : item.name + '을 입었어요!');
}));
$('#testMoney').addEventListener('click', () => {
  state.coins = Math.min(999999, state.coins + 10000); persist();
  showToast('테스트용 별 10,000개를 받았어요!');
});
render();
