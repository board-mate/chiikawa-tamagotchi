const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = 'chiikawa-tamagotchi-v1';
const characters = [
  ['치이카와', 'chiikawa'], ['하치와레', 'hachiware'], ['우사기', 'usagi'],
  ['모몽가', 'momonga'], ['쿠리만쥬', 'kurimanju'], ['시사', 'shisa'], ['랏코', 'rakko']
];
const games = {
  hunt: { title: '토벌', hint: '몬스터를 빠르게 눌러요!', help: '몬스터를 누를 때마다 공격해요.', emoji: '👾' },
  weed: { title: '제초', hint: '자라난 풀을 뽑아요!', help: '풀을 빠르게 눌러 뽑아 주세요.', emoji: '🌱' },
  forage: { title: '간식 줍기', hint: '간식만 모아요!', help: '🍓와 🍰를 누르고 🍄는 피하세요.', emoji: '🍓' }
};
const outfits = [
  { id:'none', name:'기본 모습', price:0 }, { id:'vest', name:'초록 조끼', price:200 },
  { id:'pajama', name:'구름 잠옷', price:300 }, { id:'explorer', name:'탐험 망토', price:400 }, { id:'ribbon', name:'리본 옷', price:350 },
  {id:'party',name:'파자마 파티 일체복',price:500}
];
const outfitId = value => typeof value==='string'&&value.startsWith('party-')?'party':outfits.some(o => o.id === value) ? value : 'none';
const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(+n) ? +n : 0));
const initialState = () => ({
  version: 1, character: 'chiikawa', createdAt: Date.now(), updatedAt: Date.now(),
  fullness: 76, mood: 82, energy: 84, clean: 100, coins: 60, sound: true,
  refusedLast: false, plays: 0, lastPatPlay: -1,
  rooms: {}, friends: [], ownedOutfits: ['none'], worn: {}, village:initialVillage(),
  room: { wall: 'peach', floor: 'wood', rug: 'rose', furniture: 'sofa', ornament: 'plant', name: '우리 집' }
});
function normalize(input) {
  if (!input || input.version !== 1 || !characters.some(([, id]) => id === input.character)) throw new Error('지원하지 않는 저장 데이터');
  const base = initialState();
  const oldParties=[...new Set((Array.isArray(input.ownedOutfits)?input.ownedOutfits:[]).filter(id=>typeof id==='string'&&id.startsWith('party-')))];
  return {
    ...base, character: input.character,
    createdAt: Number.isFinite(+input.createdAt) ? +input.createdAt : Date.now(),
    updatedAt: Number.isFinite(+input.updatedAt) ? +input.updatedAt : Date.now(),
    fullness: clamp(input.fullness), mood: clamp(input.mood), energy: clamp(input.energy), clean: clamp(input.clean),
    coins: Math.max(0, Math.min(999999, Math.floor(+input.coins || 0)+Math.max(0,oldParties.length-1)*500)),
    sound: input.sound !== false,
    refusedLast: input.refusedLast === true,
    lastPatPlay: Number.isFinite(input.lastPatPlay) ? input.lastPatPlay : -1,
    room: sanitizeRoom(input.room),
    rooms: Object.fromEntries(characters.filter(([,id])=>input.rooms?.[id]).map(([,id])=>[id,sanitizeRoom(input.rooms[id])])),
    friends: Array.isArray(input.friends) ? input.friends.slice(0,8).filter(friend=>friend&&typeof friend.code==='string'&&friend.code.length<=4000&&/^[A-Za-z0-9_-]+$/.test(friend.code)).map(friend=>({code:friend.code})) : [],
    ownedOutfits: [...new Set(['none', ...(Array.isArray(input.ownedOutfits) ? input.ownedOutfits : []).map(outfitId)])],
    worn: Object.fromEntries(characters.map(([,id])=>[id, Array.isArray(input.ownedOutfits) && input.ownedOutfits.includes(input.worn?.[id]) && (outfitId(input.worn[id])!=='party'||partyCharacters.includes(id)) ? outfitId(input.worn[id]) : 'none'])),
    village:sanitizeVillage(input.village),
    plays: Math.max(0, Math.floor(+input.plays || 0))
  };
}
function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalize(JSON.parse(saved));
    const old = JSON.parse(localStorage.getItem('modumaru') || 'null');
    const previous = old?.players?.find((item) => item.id === old.currentPlayerId) || old?.players?.[0];
    const fresh = initialState();
    if (previous) {
      fresh.character = characters.find(([name]) => name === previous.activeCharacter)?.[1] || fresh.character;
      fresh.coins = Math.max(0, Math.min(999999, Math.floor(previous.money || 60)));
      if (previous.tamagotchi) {
        fresh.fullness = clamp(previous.tamagotchi.hunger);
        fresh.clean = clamp(previous.tamagotchi.clean);
      }
    }
    return fresh;
  } catch { return initialState(); }
}
let state = loadInitial();
let activeGame = null;
let toastTimer;
let motionTimer;
let mealActive = false;
const characterLines = {
  chiikawa: { touch:['ワ… ワ…','ハァ〜','アァン〜'], happy:'ワァ〜！', refuse:'アァン〜', rest:'ハァ〜' },
  hachiware: { touch:['なんとかなれーッ！','心がふたつある〜','ちょっと待って、中にジュースみたいなのが入ってて、おいしいんだよ！'], happy:'やったー！', refuse:'今はおなかいっぱいだよ〜', rest:'ちょっと休もう〜' },
  usagi: { touch:['ヤハ！！','ウラ〜','プルャ〜','ウワ〜'], happy:'ヤハ！！', refuse:'ウラ〜！', rest:'プルャ〜' },
  momonga: { touch:['それ、よこせ！','ふえええええ〜ん！','チラァァァ…'], happy:'もっとほめろ！', refuse:'イヤだ！', rest:'眠くなってきたぞ〜' }
};
const touchLineIndex = {};
function characterReaction(kind='touch') {
  const lines=characterLines[state.character];
  if(!lines)return false;
  const index=touchLineIndex[state.character]||0;
  const text=kind==='touch'?lines.touch[index%lines.touch.length]:lines[kind];
  if(kind==='touch')touchLineIndex[state.character]=index+1;
  setSpeech(text);stopVoice();
  if(state.sound)speakReaction(text);
  return true;
}
const characterVoices = Object.fromEntries(['chiikawa','hachiware','usagi','momonga'].map(id => [id, new Audio(`assets/voices/${id}.mp3`)]));
let currentVoice = null;
function stopVoice() {
  if (currentVoice) { currentVoice.pause(); currentVoice.currentTime = 0; currentVoice = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function persist() {
  state.rooms ||= {};
  state.rooms[state.character] = sanitizeRoom(state.room);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { showToast('자동 저장 공간이 부족해요. 저장 파일을 받아 주세요.'); }
  render();
}
function sanitizeRoom(room) {
  const defaults = initialState().room;
  const choices = { wall: ['peach','mint','lavender'], floor: ['wood','cream','tile'], rug: ['rose','blue','leaf'], furniture: ['sofa','bed','desk'], ornament: ['plant','bear','lamp'] };
  const result = { ...defaults };
  for (const key of Object.keys(choices)) if (choices[key].includes(room?.[key])) result[key] = room[key];
  if (typeof room?.name === 'string') result.name = room.name.trim().slice(0, 24) || defaults.name;
  if(Array.isArray(room?.items))result.items=room.items.slice(0,14).filter(item=>item&&['futon','table','lantern','books','bear','bag','camera','box','plant'].includes(item.kind)).map(item=>({kind:item.kind,x:Math.max(6,Math.min(94,Number(item.x)||50)),y:Math.max(40,Math.min(91,Number(item.y)||70))}));
  return result;
}
function characterName() { return characters.find(([, id]) => id === state.character)?.[0] || '치이카와'; }
function characterUrl() { return `assets/characters/${state.character}.png`; }
function setSpeech(message) { $('#speech').textContent = message; }
function showToast(message) {
  const box = $('#toast'); box.textContent = message; box.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('show'), 2500);
}
function react(kind = 'excited') {
  const pet = $('#petButton');
  pet.classList.remove('excited', 'refusing', 'sleeping');
  void pet.offsetWidth;
  pet.classList.add(kind);
  clearTimeout(motionTimer);
  motionTimer = setTimeout(() => pet.classList.remove(kind), kind === 'sleeping' ? 2400 : 950);
}
function chirp(text, label) {
  if(characterReaction(text.includes('やだ')?'refuse':text.includes('…')?'rest':'happy'))return;
  setSpeech(label);
  if (!state.sound) return;
  stopVoice();
  const clip = characterVoices[state.character];
  if (clip) {
    currentVoice = clip;
    clip.currentTime = 0;
    clip.play().catch(() => speakReaction(text));
    return;
  }
  speakReaction(text);
}
function speakReaction(text) {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice=speechSynthesis.getVoices().find(item=>item.lang.toLowerCase().startsWith('ja'));
      if(voice)utterance.voice=voice;
      utterance.lang = 'ja-JP'; utterance.rate = state.character==='hachiware'?1:1.1; utterance.pitch = 1.5; utterance.volume = .9;
      speechSynthesis.speak(utterance);
    }
  } catch { /* Text reaction still works if a voice is unavailable. */ }
}
function render() {
  const image = characterUrl();
  for (const id of ['petFrameA', 'petFrameB']) paintCharacter($('#' + id),state.character,outfitId(state.worn?.[state.character]));
  const outfit = outfitId(state.worn?.[state.character]);
  $('#miniSprite').style.backgroundImage = outfit === 'none' ? `url("${image}")` : `url("${outfitUrl(state.character,outfit)}"),url("${image}")`;
  if(outfit==='party'){$('#miniSprite').style.backgroundImage=`url("assets/sprites/${state.character}-party-v6.png")`;$('#miniSprite').style.backgroundSize=state.character==='usagi'?'400% 112%':'400% 133.333%';$('#miniSprite').style.backgroundPosition='0% 50%';}
  else{$('#miniSprite').style.backgroundSize='contain';$('#miniSprite').style.backgroundPosition='center';}
  for (const id of ['petOutfitA','petOutfitB','mealOutfit']) {
    const node = $('#' + id); if (!node) continue; node.hidden = outfit === 'none' || isCompositeOutfit(state.character,outfit);
    if (!node.hidden) node.src = outfitUrl(state.character,outfit);
  }
  $('#characterTag').textContent = characterName();
  $('#dayLabel').textContent = `완료한 일 ${state.plays}회 · 일할 때만 배고파요`;
  $('#coinCount').textContent = state.coins.toLocaleString('ko-KR');
  for (const stat of ['fullness', 'mood', 'energy', 'clean']) {
    $('#' + stat + 'Number').textContent = Math.round(state[stat]);
    $('#' + stat + 'Bar').style.width = state[stat] + '%';
  }
  updateDirt();
  $('#world').classList.toggle('messy', state.clean < 70);
  $('#soundButton').textContent = state.sound ? '♪' : '♩';
  $('#soundButton').setAttribute('aria-label', state.sound ? '소리 끄기' : '소리 켜기');
  $('#characterSelect').value = state.character;
  window.renderRoom?.();
  window.renderFriends?.();
  window.renderWardrobe?.();
  if(document.readyState!=='loading')window.renderVillage?.();
}
function showScreen(id) {
  if(typeof endPartyDance==='function')endPartyDance();
  if(id!=='villageScreen'&&typeof stopVillageWalk==='function')stopVillageWalk();
  $$('.screen').forEach((node) => node.classList.toggle('active', node.id === id));
  $$('[data-screen]').forEach((node) => node.classList.toggle('active', node.dataset.screen === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if(id==='villageScreen')renderVillage();
}
$$('[data-screen]').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.screen)));

function care(action) {
  if (mealActive || activeGame) return;
  if(foodScenes[action]){eatVillageFood(action);return;}
  if (action === 'rice' || foodScenes[action]) {
    const food = foodScenes[action];
    if (state.fullness >= 96) { showToast(food ? '배가 불러요! 장면 다시 보기로 감상할 수 있어요.' : '이미 배가 불러요!'); chirp('うな！', '배불러~!'); return; }
    const chance = food ? .12 : .22;
    if (!state.refusedLast && Math.random() < chance) {
      state.refusedLast = true; state.mood = clamp(state.mood - 2);
      react('refusing'); chirp('やだ！', '야다! 지금은 안 먹을래.');
      showToast('고개를 도리도리! 한 번 더 권해봐요.'); persist(); return;
    }
    state.fullness = clamp(state.fullness + (food?.fullness || 30));
    state.mood = clamp(state.mood + (food?.mood || 3));
    state.refusedLast = false;
    react(); setSpeech('우나! ' + (food?.name || '주먹밥') + ' 냠냠!');
    if (!food) chirp('うな！','우나! 주먹밥 냠냠!');
    persist(); window.playMeal(action); return;
  }
  if (action === 'bath') {
    if (state.clean >= 98) { showToast('이미 보송보송해요!'); return; }
    state.clean = 100; state.mood = clamp(state.mood + 4);
    react(); chirp('うな！', '뽀득뽀득! 우나!'); persist(); return;
  }
  if (action === 'nap') {
    if (state.energy >= 96) { showToast('기운이 넘쳐서 잠이 안 와요!'); return; }
    state.energy = clamp(state.energy + 27);
    react('sleeping'); chirp('うな…', '쿠울… 잠깐 쉬는 중'); persist();
  }
}
$$('[data-action]').forEach((button) => button.addEventListener('click', () => care(button.dataset.action)));
$('#petButton').addEventListener('click', () => {
  if (mealActive) return;
  if (state.lastPatPlay !== state.plays) state.mood = clamp(state.mood + 2);
  state.lastPatPlay = state.plays;
  react(); if(!characterReaction())chirp('うな！', 'うな！'); persist();
});
$('#soundButton').addEventListener('click', () => {
  state.sound = !state.sound;
  if (!state.sound) { stopVoice(); if (typeof endPartyDance === 'function') endPartyDance(); }
  showToast(state.sound ? '소리를 켰어요.' : '소리를 껐어요.'); persist();
});

function targetFor(mode) {
  if (mode === 'forage') return Math.random() < .24 ? { emoji: '🍄', points: -1 } : { emoji: Math.random() < .5 ? '🍓' : '🍰', points: 1 };
  return { emoji: games[mode].emoji, points: 1 };
}
function moveTarget() {
  if (!activeGame) return;
  const stage = $('#gameStage'), target = $('#gameTarget');
  const item = targetFor(activeGame.mode);
  activeGame.targetPoints = item.points;
  target.textContent = item.emoji;
  target.setAttribute('aria-label', item.points < 0 ? '피해야 하는 버섯' : '목표 누르기');
  const width = Math.max(70, stage.clientWidth - 82), height = Math.max(80, stage.clientHeight - 145);
  const minX = activeGame.mode === 'hunt' ? Math.min(stage.clientWidth * .53, width) : 15;
  target.style.left = `${Math.round(minX + Math.random() * (width - minX))}px`;
  target.style.top = activeGame.mode === 'hunt' ? `${stage.clientHeight - 110 - Math.random() * 25}px` : `${Math.round(55 + Math.random() * (height - 40))}px`;
  activeGame.lastMove = performance.now();
}
function stopGame(award) {
  if (!activeGame) return;
  resetAttack();
  cancelAnimationFrame(activeGame.frame);
  const { mode, score } = activeGame;
  activeGame = null;
  if (!award) { $('#gameOverlay').hidden = true; return; }
  const earned = Math.max(0, score) * 6;
  state.coins += earned; state.plays++;
  state.energy = clamp(state.energy - (mode === 'hunt' ? 14 : 10));
  state.fullness = clamp(state.fullness - ({ hunt: 18, weed: 12, forage: 10 }[mode]));
  state.mood = clamp(state.mood + 5);
  if (mode === 'hunt') state.clean = clamp(state.clean - 40);
  if (mode === 'weed') state.clean = clamp(state.clean - 12);
  persist();
  $('#gameResult').hidden = false;
  $('#resultEmoji').textContent = mode === 'hunt' ? '⚔️' : mode === 'weed' ? '🌱' : '🍓';
  $('#resultTitle').textContent = `${games[mode].title} 끝!`;
  $('#resultText').textContent = `${score}점 · 별 ${earned}개 획득!${mode === 'hunt' ? ' 토벌 다녀와서 꼬질꼬질해졌어요.' : ''}`;
  chirp('うな！', mode === 'hunt' ? '우나! 토벌 성공! 꼬질꼬질…' : '우나! 해냈어!');
}
function gameLoop(now) {
  if (!activeGame) return;
  const left = Math.max(0, 10 - (now - activeGame.startedAt) / 1000);
  $('#gameTime').textContent = left.toFixed(1);
  if (left <= 0) { stopGame(true); return; }
  if (now - activeGame.lastMove > 950) moveTarget();
  activeGame.frame = requestAnimationFrame(gameLoop);
}
function startGame(mode) {
  if (mealActive) return;
  if (state.energy < (mode === 'hunt' ? 14 : 10)) { showToast('기운이 부족해요. 낮잠을 자고 와요!'); return; }
  if (activeGame) stopGame(false);
  $('#gameOverlay').hidden = false;
  $('#gameStage').hidden = false;
  $('#gameResult').hidden = true;
  $('#gameStage').className = 'game-stage ' + mode;
  prepareActor(mode);
  $('#gameTitle').textContent = games[mode].title;
  $('#gameHint').textContent = games[mode].hint;
  $('#gameHelp').textContent = games[mode].help;
  $('#gameTime').textContent = '10.0'; $('#gameScore').textContent = '0';
  activeGame = { mode, score: 0, targetPoints: 1, startedAt: performance.now(), lastMove: 0, frame: 0 };
  moveTarget();
  activeGame.frame = requestAnimationFrame(gameLoop);
  $('#gameTarget').focus();
}
$$('[data-game]').forEach((button) => button.addEventListener('click', () => startGame(button.dataset.game)));
$('#gameTarget').addEventListener('click', () => {
  if (!activeGame) return;
  activeGame.score = Math.max(0, activeGame.score + activeGame.targetPoints);
  $('#gameScore').textContent = activeGame.score;
  animateAttack();
  if (activeGame.targetPoints < 0) showToast('버섯은 간식이 아니야!');
  moveTarget();
});
$('#closeGame').addEventListener('click', () => {
  if (activeGame) stopGame(false);
  $('#gameOverlay').hidden = true; $('#gameStage').hidden = false;
});
$('#resultClose').addEventListener('click', () => { $('#gameOverlay').hidden = true; $('#gameStage').hidden = false; setSpeech(state.clean < 70 ? '토벌 다녀와서 꼬질꼬질…' : '다음엔 뭐 할까?'); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#gameOverlay').hidden) $('#closeGame').click(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && activeGame) stopGame(false);
});

function exportData() { return JSON.stringify(state); }
function applyImport(raw) {
  const next = normalize(JSON.parse(raw));
  if (next.createdAt > Date.now() + 86400000) throw new Error('날짜가 올바르지 않아요');
  if (activeGame) stopGame(false);
  stopVillageWalk(false);if(typeof endPartyDance==='function')endPartyDance();
  state = next; persist(); showScreen('homeScreen');
  setSpeech('다시 만나서 반가워!'); showToast('저장 데이터를 불러왔어요!');
}
$('#downloadSave').addEventListener('click', () => {
  const blob = new Blob([exportData()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'chiikawa-tamagotchi-save.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('저장 파일을 받았어요.');
});
$('#uploadSave').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 100000) throw new Error('저장 파일이 너무 커요');
    applyImport(await file.text());
  } catch (error) { showToast('불러오지 못했어요. ' + error.message); }
  event.target.value = '';
});
$('#copySave').addEventListener('click', async () => {
  const bytes = new TextEncoder().encode(exportData());
  const code = btoa(String.fromCharCode(...bytes));
  try { await navigator.clipboard.writeText(code); showToast('저장 코드를 복사했어요.'); }
  catch { $('#saveCode').value = code; $('#saveCode').select(); showToast('코드를 선택했어요. 직접 복사해 주세요.'); }
});
$('#loadCode').addEventListener('click', () => {
  try {
    const code = $('#saveCode').value.trim();
    if (!code || code.length > 100000) throw new Error('코드를 확인해 주세요');
    const bytes = Uint8Array.from(atob(code), (char) => char.charCodeAt(0));
    applyImport(new TextDecoder().decode(bytes));
    $('#saveCode').value = '';
  } catch (error) { showToast('코드를 읽지 못했어요. 다시 확인해 주세요.'); }
});
$('#characterSelect').innerHTML = characters.map(([name, id]) => `<option value="${id}">${name}</option>`).join('');
$('#characterSelect').addEventListener('change', (event) => {
  selectCharacter(event.target.value);
});
function selectCharacter(id) {
  if (!characters.some(([,key])=>key===id) || mealActive || activeGame) return;
  stopVoice();
  if(typeof endPartyDance==='function')endPartyDance();
  if(typeof selectedDecor!=='undefined')selectedDecor=-1;
  state.rooms[state.character] = sanitizeRoom(state.room);
  state.character = id;
  state.room = sanitizeRoom(state.rooms[id]);
  setSpeech(characterLines[id]?.touch[0]||`${characterName()}와 함께!`); persist();
  $('#roomLinkBox').hidden = true;
}

render();
setSpeech(characterLines[state.character]?.touch[0]||(state.fullness < 25 ? '배고파… 밥 줘…' : state.clean < 50 ? '토벌 다녀와서 꼬질꼬질…' : '같이 놀자!'));
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
