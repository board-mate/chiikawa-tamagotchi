let mealTimers = [];
let overlayReturnFocus = null;
const homeInfos = {
  chiikawa: ['house','치이카와의 집'], hachiware: ['cave','하치와레의 동굴'],
  rakko: ['car','랏코의 자동차'], usagi: ['meadow','우사기의 초원'],
  momonga: ['leaves','모몽가의 나뭇잎 은신처'], kurimanju: ['house','쿠리만쥬의 집'], shisa: ['house','시사의 집']
};
function habitatMarkup(id) {
  const type = homeInfos[id]?.[0] || 'house';
  const scenes = {
    house: '<div class="habitat-house"><div class="house-roof"></div><div class="house-door"></div><div class="house-window">✦</div></div>',
    cave: '<div class="cave-rock"><div class="cave-opening"></div><span class="cave-stone stone-one"></span><span class="cave-stone stone-two"></span></div>',
    car: '<div class="car-body"><div class="car-glass"></div><div class="car-door"></div><span class="car-wheel wheel-one"></span><span class="car-wheel wheel-two"></span><span class="car-light"></span></div>',
    meadow: '<div class="meadow-hill"></div><span class="meadow-flower f1">✿</span><span class="meadow-flower f2">✿</span><span class="meadow-flower f3">✿</span><span class="meadow-grass">♧ ♧ ♧</span>',
    leaves: '<div class="rice-cooker"><div class="cooker-lid"></div><div class="cooker-panel">●</div></div><span class="leaf leaf-one"></span><span class="leaf leaf-two"></span><span class="leaf leaf-three"></span><span class="leaf leaf-four"></span>'
  };
  return scenes[type];
}
const furnitureArt = {
  sofa: '<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="15" width="124" height="65" rx="22" fill="#e0a5a2"/><rect x="29" y="29" width="49" height="34" rx="12" fill="#f2c3b9"/><rect x="82" y="29" width="49" height="34" rx="12" fill="#f2c3b9"/><rect x="8" y="48" width="144" height="36" rx="13" fill="#d49696"/><path d="M26 83v9m108-9v9" stroke="#9a705c" stroke-width="8"/></svg>',
  bed: '<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="13" y="10" width="134" height="79" rx="12" fill="#b79778"/><rect x="21" y="19" width="118" height="59" rx="8" fill="#faf5df"/><rect x="29" y="23" width="46" height="21" rx="8" fill="white"/><rect x="85" y="23" width="46" height="21" rx="8" fill="white"/><path d="M21 50h118v28H21z" fill="#b8c8df"/><path d="M24 86v8m112-8v8" stroke="#9a705c" stroke-width="7"/></svg>',
  desk: '<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M26 42v49m108-49v49" stroke="#a68567" stroke-width="10"/><rect x="13" y="32" width="134" height="15" rx="5" fill="#d3b58b"/><rect x="88" y="48" width="45" height="25" rx="4" fill="#d3b58b"/><circle cx="110" cy="60" r="3" fill="#927456"/><path d="M37 30V13h32v17" fill="#e9b8a8"/><rect x="77" y="18" width="22" height="12" rx="4" fill="#b1c3a3"/></svg>'
};
function drawRoom(element, room, characterId, outfit = 'none', clean = 100) {
  element.dataset.habitat = homeInfos[characterId]?.[0] || 'house';
  element.dataset.wall = room.wall; element.dataset.floor = room.floor; element.dataset.rug = room.rug;
  element.innerHTML = '<div class="habitat-layer" aria-hidden="true">' + habitatMarkup(characterId) + '</div><div class="room-window"><span>☁</span></div><div class="room-floor"></div><div class="room-rug"></div><div class="room-furniture">' + furnitureArt[room.furniture] + '</div><span class="room-ornament"></span><img class="room-character" alt=""><img class="room-character room-clothes" alt="" hidden><img class="room-character room-dirt" alt="" hidden><span class="room-plaque"></span>';
  const clothes = element.querySelector('.room-clothes');
  outfit = outfitId(outfit);
  if (outfit !== 'none') { clothes.src = outfitUrl(characterId,outfit); clothes.hidden = characterId === 'chiikawa'; }
  element.querySelector('.room-ornament').textContent = { plant: '🪴', bear: '🧸', lamp: '💡' }[room.ornament];
  const image = element.querySelector('img');
  paintCharacter(image,characterId,outfit);
  const mud = element.querySelector('.room-dirt');
  mud.src = dirtArt(characterId,outfit); mud.hidden = clean >= 85; mud.style.opacity = clean < 45 ? '.94' : '.66';
  image.alt = characters.find(([, id]) => id === characterId)?.[0] || '';
  element.querySelector('.room-plaque').textContent = room.name;
}
window.renderRoom = () => {
  state.room = sanitizeRoom(state.room);
  drawRoom($('#myRoom'), state.room, state.character, state.worn?.[state.character],state.clean);
  if (document.activeElement !== $('#roomName')) $('#roomName').value = state.room.name;
  $$('[data-room]').forEach((select) => { select.value = state.room[select.dataset.room]; });
};
$$('[data-room]').forEach((select) => select.addEventListener('change', () => {
  state.room = sanitizeRoom({ ...state.room, [select.dataset.room]: select.value }); persist();
  $('#roomLinkBox').hidden = true;
}));
$('#roomName').addEventListener('input', () => {
  state.room = sanitizeRoom({ ...state.room, name: $('#roomName').value }); persist();
  $('#roomLinkBox').hidden = true;
});
function encodeRoom(snapshot) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(snapshot)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/, '');
}
function decodeRoom(code) {
  if (!code || code.length > 4000 || !/^[A-Za-z0-9_-]+$/.test(code)) throw new Error('올바른 방 링크가 아니에요.');
  const raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(code.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0))));
  if (raw?.type !== 'chiikawa-room' || raw.version !== 1 || !characters.some(([, id]) => id === raw.character) || !raw.room || typeof raw.room !== 'object') throw new Error('지원하지 않는 방 링크예요.');
  return { character: raw.character, room: sanitizeRoom(raw.room), outfit: outfitId(raw.outfit), clean: raw.clean == null ? 100 : clamp(raw.clean) };
}
function makeRoomLink() {
  const link = new URL(location.href);
  link.search = '';
  link.hash = 'room=' + encodeRoom({ type: 'chiikawa-room', version: 1, character: state.character, room: sanitizeRoom(state.room), outfit: outfitId(state.worn?.[state.character]), clean:state.clean });
  return link.href;
}
async function copyRoomLink() {
  try { await navigator.clipboard.writeText($('#roomLink').value); showToast('방 링크를 복사했어요. 지인에게 보내주세요!'); }
  catch { $('#roomLink').focus(); $('#roomLink').select(); showToast('선택된 링크를 복사해서 보내주세요.'); }
}
$('#shareRoom').addEventListener('click', async () => {
  const url = makeRoomLink();
  $('#roomLink').value = url; $('#roomLinkBox').hidden = false;
  if (navigator.share) {
    try { await navigator.share({ title: state.room.name, text: '내 치이카와 방 구경 와!', url }); return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  await copyRoomLink();
});
$('#copyRoomLink').addEventListener('click', copyRoomLink);
function openScene(id, focusId) {
  overlayReturnFocus = document.activeElement;
  $('.app').inert = true; $(id).hidden = false; $(focusId).focus();
}
function closeScene(id) {
  $(id).hidden = true; $('.app').inert = false;
  overlayReturnFocus?.focus?.();
}
function openRoomCode(code) {
  try {
    const snapshot = decodeRoom(code);
    drawRoom($('#friendRoom'), snapshot.room, snapshot.character, snapshot.outfit,snapshot.clean);
    $('#visitTitle').textContent = snapshot.room.name;
    openScene('#visitOverlay', '#closeVisit');
  } catch { showToast('방 링크를 읽지 못했어요. 전체 링크를 다시 확인해 주세요.'); }
}
function closeVisit() {
  closeScene('#visitOverlay');
  if (location.hash.startsWith('#room=')) history.replaceState(null, '', location.pathname + location.search);
}
$('#closeVisit').addEventListener('click', closeVisit);
$('#backToMyRoom').addEventListener('click', () => { closeVisit(); showScreen('roomScreen'); });
$('#visitRoom').addEventListener('click', () => {
  try {
    const url = new URL($('#visitLink').value.trim());
    if (!url.hash.startsWith('#room=')) throw new Error();
    openRoomCode(url.hash.slice(6));
  } catch { showToast('받은 방 공유 링크를 붙여넣어 주세요.'); }
});
function readSharedRoom() { if (location.hash.startsWith('#room=')) openRoomCode(location.hash.slice(6)); }
window.addEventListener('hashchange', readSharedRoom);

function finishMeal() {
  stopFoodVideo();
  mealTimers.forEach(clearTimeout); mealTimers = []; mealActive = false;
  closeScene('#mealOverlay');
}
window.playMeal = (action) => {
  if (foodScenes[action]) { showFoodScene(action); return; }
  stopFoodVideo();
  mealTimers.forEach(clearTimeout); mealTimers = []; mealActive = true;
  const scene = $('.meal-scene'), food = action === 'rice' ? '🍙' : '🥞';
  scene.dataset.phase = 'ready';
  paintCharacter($('#mealPet'),state.character,outfitId(state.worn?.[state.character]));
  $('#mealDirt').src = dirtArt(state.character,outfitId(state.worn?.[state.character]));
  $('#mealDirt').hidden = state.clean >= 85; $('#mealDirt').style.opacity = state.clean < 45 ? '.94' : '.66';
  $('#mealFood').textContent = food; $('#mealBite').textContent = food;
  $('#mealTitle').textContent = '잘 먹겠습니다!';
  $('#mealCaption').textContent = '밥상 앞으로 총총…';
  openScene('#mealOverlay', '#skipMeal');
  mealTimers.push(setTimeout(() => {
    scene.dataset.phase = 'chew'; $('#mealTitle').textContent = '냠냠, 오물오물!';
    $('#mealCaption').textContent = '한 입, 또 한 입…';
  }, 800));
  mealTimers.push(setTimeout(() => {
    scene.dataset.phase = 'happy'; $('#mealTitle').textContent = '잘 먹었어! 우나!';
    $('#mealCaption').textContent = '배가 든든해졌어요 ♥';
  }, 2400));
  mealTimers.push(setTimeout(finishMeal, 3700));
};
$('#skipMeal').addEventListener('click', finishMeal);
document.addEventListener('keydown', (event) => {
  const overlay = !$('#mealOverlay').hidden ? $('#mealOverlay') : !$('#visitOverlay').hidden ? $('#visitOverlay') : null;
  if (!overlay) return;
  if (event.key === 'Escape') { event.preventDefault(); mealActive ? finishMeal() : closeVisit(); }
  if (event.key === 'Tab') {
    const buttons = [...overlay.querySelectorAll('button,a[href],iframe')].filter(node => node.getClientRects().length), first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.renderRoom();
readSharedRoom();
