const VILLAGE_W = 1400, VILLAGE_H = 1000;
const villageSpots = [
  {id:'flower-pancake',food:'pancake',x:830,y:470,hint:'꽃밭에서 달콤한 냄새가 나요.'},
  {id:'forest-ramen',food:'ramen',x:270,y:290,hint:'나무 그늘 아래 따뜻한 컵이 있어요.'},
  {id:'stall-oden',food:'oden',x:430,y:750,hint:'길가에서 보글보글 소리가 들려요.'},
  {id:'garden-radish',food:'radish',x:1090,y:750,hint:'풀밭에 무언가 반짝여요.'},
  {id:'rest-parfait',food:'parfait',x:1090,y:230,hint:'쉬어 가는 길에서 랏코의 간식을 발견했어요.'}
];
function initialVillage() { return {x:650,y:500,distance:0,round:0,claimed:[],bag:{}}; }
function sanitizeVillage(input) {
  const value = initialVillage();
  const number=(v,min,max,fallback)=>Number.isFinite(+v)?Math.max(min,Math.min(max,+v)):fallback;
  value.x=number(input?.x,70,VILLAGE_W-70,650);value.y=number(input?.y,100,VILLAGE_H-70,500);
  value.distance=number(input?.distance,0,1000000,0);value.round=Math.floor(number(input?.round,0,100000,0));
  value.claimed=Array.isArray(input?.claimed)?[...new Set(input.claimed.filter(id=>villageSpots.some(spot=>spot.id===id)))]:[];
  for(const id of Object.keys(foodScenes))value.bag[id]=Math.floor(number(input?.bag?.[id],0,99,0));
  return value;
}
let villageFrame=0, villageTarget=null, villageLast=0, villageNear=null, villageDistanceSinceSave=0;
function villageActorImage() {
  const outfit=outfitId(state.worn?.[state.character]);
  paintCharacter($('#villagePet'),state.character,outfit);
  const clothes=$('#villageClothes');clothes.hidden=outfit==='none'||isCompositeOutfit(state.character,outfit);
  if(!clothes.hidden)clothes.src=outfitUrl(state.character,outfit);
  $('#villageMud').src=dirtArt(state.character,outfit);$('#villageMud').hidden=state.clean>=85;
  $('#villageMud').style.opacity=state.clean<45?'.94':'.66';
}
function positionVillage() {
  const viewport=$('#villageViewport'),world=$('#villageMap'),actor=$('#villageActor');
  const v=state.village;
  const cameraX=Math.max(0,Math.min(VILLAGE_W-viewport.clientWidth,v.x-viewport.clientWidth/2));
  const cameraY=Math.max(0,Math.min(VILLAGE_H-viewport.clientHeight,v.y-viewport.clientHeight*.6));
  world.style.transform=`translate(${-cameraX}px,${-cameraY}px)`;
  world.dataset.cameraX=String(cameraX);world.dataset.cameraY=String(cameraY);
  actor.style.left=v.x+'px';actor.style.top=v.y+'px';
  villageNear=villageSpots.filter(s=>!v.claimed.includes(s.id)).sort((a,b)=>Math.hypot(a.x-v.x,a.y-v.y)-Math.hypot(b.x-v.x,b.y-v.y))[0]||null;
  const nearby=villageNear&&Math.hypot(villageNear.x-v.x,villageNear.y-v.y)<145;
  for(const spot of villageSpots){const marker=$(`[data-spot="${spot.id}"]`);if(!marker)continue;
    marker.hidden=v.claimed.includes(spot.id)||Math.hypot(spot.x-v.x,spot.y-v.y)>240;
    marker.classList.toggle('nearby',nearby&&spot===villageNear);
  }
  $('#villageInspect').disabled=!nearby;
  $('#villageInspect').textContent=nearby?'✦ 반짝이는 곳 조사하기':'주변을 걸으며 찾아보세요';
  $('#villageHint').textContent=nearby?villageNear.hint:'화면을 누르거나 방향 버튼으로 걸어가요.';
}
function stopVillageWalk(save=true) {
  cancelAnimationFrame(villageFrame);villageFrame=0;villageTarget=null;villageLast=0;
  $('#villageActor')?.classList.remove('walking');
  if(save&&villageDistanceSinceSave>0){villageDistanceSinceSave=0;persist();}
}
function walkVillage(now) {
  if(!villageTarget||mealActive||activeGame||!$('#villageScreen').classList.contains('active')){stopVillageWalk();return;}
  const v=state.village,elapsed=villageLast?Math.min(40,now-villageLast):16;villageLast=now;
  const dx=villageTarget.x-v.x,dy=villageTarget.y-v.y,distance=Math.hypot(dx,dy),step=Math.min(distance,elapsed*.25);
  if(distance<2){stopVillageWalk();return;}
  v.x+=dx/distance*step;v.y+=dy/distance*step;v.distance+=step;villageDistanceSinceSave+=step;
  $('#villageActor').dataset.facing=dx<0?'left':'right';
  $('#villageActor').classList.add('walking');positionVillage();
  if(v.claimed.length===villageSpots.length&&v.distance>=1100){v.claimed=[];v.distance=0;v.round++;showToast('마을에 새로운 먹거리가 나타났어요!');}
  if(villageDistanceSinceSave>200){villageDistanceSinceSave=0;persist();}
  villageFrame=requestAnimationFrame(walkVillage);
}
function goVillage(x,y) {
  if(mealActive||activeGame)return;
  villageTarget={x:Math.max(70,Math.min(VILLAGE_W-70,x)),y:Math.max(100,Math.min(VILLAGE_H-70,y))};
  if(!villageFrame)villageFrame=requestAnimationFrame(walkVillage);
}
function openDiscovery() {
  if(!villageNear||state.village.claimed.includes(villageNear.id)||Math.hypot(villageNear.x-state.village.x,villageNear.y-state.village.y)>=145)return;
  stopVillageWalk();const spot=villageNear,food=foodScenes[spot.food];
  $('#foundFood').textContent=food.emoji;$('#foundTitle').textContent=food.name+' 발견!';
  $('#foundCaption').textContent=spot.hint;$('#discoveryOverlay').dataset.spot=spot.id;
  $('#foundEat').disabled=state.fullness>=96;
  $('#foundEat').textContent=state.fullness>=96?'지금은 배가 불러요':'여기서 먹기 · 배부름 +'+food.fullness;
  openScene('#discoveryOverlay',state.fullness>=96?'#foundPocket':'#foundEat');
}
function collectDiscovery(eat) {
  const spot=villageSpots.find(s=>s.id===$('#discoveryOverlay').dataset.spot);
  if(!spot||state.village.claimed.includes(spot.id))return;
  if(eat&&state.fullness>=96)return;
  if(!eat&&state.village.bag[spot.food]>=99){showToast('주머니가 가득 찼어요. 먼저 먹어 주세요.');return;}
  state.village.claimed.push(spot.id);state.village.bag[spot.food]=(state.village.bag[spot.food]||0)+1;
  closeScene('#discoveryOverlay');persist();
  if(eat)eatVillageFood(spot.food);else showToast(foodScenes[spot.food].name+'을 주머니에 넣었어요!');
}
function eatVillageFood(id) {
  const food=foodScenes[id];if(!food||mealActive||activeGame)return;
  if(!state.village.bag[id]){showToast('마을에서 이 음식을 먼저 찾아보세요.');return;}
  if(state.fullness>=96){showToast('배가 불러요. 주머니에 보관해 둘게요.');return;}
  stopVillageWalk();state.village.bag[id]--;
  state.fullness=clamp(state.fullness+food.fullness);state.mood=clamp(state.mood+food.mood);
  persist();setSpeech(food.name+' 발견! 맛있게 먹자!');showFoodScene(id);
}
function renderVillage() {
  if(!$('#villageMap'))return;
  villageActorImage();positionVillage();
  const items=Object.entries(state.village.bag).filter(([,n])=>n>0);
  $('#foodBag').innerHTML=items.length?items.map(([id,n])=>`<button data-bag-food="${id}"><span>${foodScenes[id].emoji}</span><b>${foodScenes[id].name}</b><small>${n}개 · 먹기</small></button>`).join(''):'<p class="empty-bag">산책하다 찾은 음식을 여기에 챙겨요.</p>';
  $$('#foodBag [data-bag-food]').forEach(button=>button.addEventListener('click',()=>eatVillageFood(button.dataset.bagFood)));
}
function initVillage() {
  $$('[data-home]').forEach(button=>button.addEventListener('click',()=>{
    stopVillageWalk();const id=button.dataset.home;
    if(id===state.character){showScreen('roomScreen');return;}
    const room=sanitizeRoom(state.rooms[id]);room.name=state.rooms[id]?.name||homeInfos[id][1];
    drawRoom($('#friendRoom'),room,id,outfitId(state.worn?.[id]),100);$('#visitTitle').textContent=homeInfos[id][1];openScene('#visitOverlay','#closeVisit');
  }));
  $('#villageMarkers').innerHTML=villageSpots.map(spot=>`<button data-spot="${spot.id}" class="food-spark" style="left:${spot.x}px;top:${spot.y}px" aria-label="반짝이는 곳으로 걸어가기" hidden>✦</button>`).join('');
  $('#villageViewport').addEventListener('pointerdown',event=>{
    if(event.target.closest('.village-location'))return;
    const rect=$('#villageViewport').getBoundingClientRect();
    goVillage(event.clientX-rect.left+Number($('#villageMap').dataset.cameraX||0),event.clientY-rect.top+Number($('#villageMap').dataset.cameraY||0));
  });
  $$('[data-walk]').forEach(button=>button.addEventListener('click',()=>{const [dx,dy]=button.dataset.walk.split(',').map(Number);goVillage(state.village.x+dx*115,state.village.y+dy*115);}));
  $('#villageInspect').addEventListener('click',openDiscovery);$('#foundEat').addEventListener('click',()=>collectDiscovery(true));$('#foundPocket').addEventListener('click',()=>collectDiscovery(false));
  $('#closeDiscovery').addEventListener('click',()=>closeScene('#discoveryOverlay'));
  document.addEventListener('keydown',event=>{
    if(!$('#villageScreen').classList.contains('active')||mealActive||activeGame||!$('#discoveryOverlay').hidden||event.target.matches('input,textarea,select'))return;
    const dirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    if(dirs[event.key]){event.preventDefault();const [x,y]=dirs[event.key];goVillage(state.village.x+x*115,state.village.y+y*115);}
    if(event.key==='Enter')openDiscovery();
  });
  window.addEventListener('resize',()=>{if($('#villageScreen').classList.contains('active'))positionVillage();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVillageWalk();});
  renderVillage();
}
document.addEventListener('DOMContentLoaded',initVillage);
