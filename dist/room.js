let mealTimers = [];
let overlayReturnFocus = null;
const furnitureArt = {
  sofa: '<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="18" y="15" width="124" height="65" rx="22" fill="#e0a5a2"/><rect x="29" y="29" width="49" height="34" rx="12" fill="#f2c3b9"/><rect x="82" y="29" width="49" height="34" rx="12" fill="#f2c3b9"/><rect x="8" y="48" width="144" height="36" rx="13" fill="#d49696"/><path d="M26 83v9m108-9v9" stroke="#9a705c" stroke-width="8"/></svg>',
  bed: '<svg viewBox="0 0 160 100" aria-hidden="true"><rect x="13" y="10" width="134" height="79" rx="12" fill="#b79778"/><rect x="21" y="19" width="118" height="59" rx="8" fill="#faf5df"/><rect x="29" y="23" width="46" height="21" rx="8" fill="white"/><rect x="85" y="23" width="46" height="21" rx="8" fill="white"/><path d="M21 50h118v28H21z" fill="#b8c8df"/><path d="M24 86v8m112-8v8" stroke="#9a705c" stroke-width="7"/></svg>',
  desk: '<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M26 42v49m108-49v49" stroke="#a68567" stroke-width="10"/><rect x="13" y="32" width="134" height="15" rx="5" fill="#d3b58b"/><rect x="88" y="48" width="45" height="25" rx="4" fill="#d3b58b"/><circle cx="110" cy="60" r="3" fill="#927456"/><path d="M37 30V13h32v17" fill="#e9b8a8"/><rect x="77" y="18" width="22" height="12" rx="4" fill="#b1c3a3"/></svg>'
};
function drawRoom(element, room, characterId) {
  element.dataset.wall = room.wall; element.dataset.floor = room.floor; element.dataset.rug = room.rug;
  element.innerHTML = '<div class="room-window"><span>☁</span></div><div class="room-floor"></div><div class="room-rug"></div><div class="room-furniture">' + furnitureArt[room.furniture] + '</div><span class="room-ornament"></span><img class="room-character" alt=""><span class="room-plaque"></span>';
  element.querySelector('.room-ornament').textContent = { plant: '🪴', bear: '🧸', lamp: '💡' }[room.ornament];
  const image = element.querySelector('img');
  image.src = 'assets/characters/' + characterId + '.png';
  image.alt = characters.find(([, id]) => id === characterId)?.[0] || '';
  element.querySelector('.room-plaque').textContent = room.name;
}
window.renderRoom = () => {
  state.room = sanitizeRoom(state.room);
  drawRoom($('#myRoom'), state.room, state.character);
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
  return { character: raw.character, room: sanitizeRoom(raw.room) };
}
function makeRoomLink() {
  const link = new URL(location.href);
  link.search = '';
  link.hash = 'room=' + encodeRoom({ type: 'chiikawa-room', version: 1, character: state.character, room: sanitizeRoom(state.room) });
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
    drawRoom($('#friendRoom'), snapshot.room, snapshot.character);
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
  mealTimers.forEach(clearTimeout); mealTimers = []; mealActive = false;
  closeScene('#mealOverlay');
}
window.playMeal = (action) => {
  mealTimers.forEach(clearTimeout); mealTimers = []; mealActive = true;
  const scene = $('.meal-scene'), food = action === 'rice' ? '🍙' : '🥞';
  scene.dataset.phase = 'ready';
  $('#mealPet').src = characterUrl();
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
    const buttons = [...overlay.querySelectorAll('button')], first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.renderRoom();
readSharedRoom();
