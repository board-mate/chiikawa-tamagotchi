// Short segments from the user's reference video, verified in the player.
const foodScenes = {
  ramen: {name:'컵라면',emoji:'🍜',fullness:24,mood:5,start:0,end:4,caption:'후후 불어서, 면을 후루룩!'},
  pancake: {name:'왕 팬케이크',emoji:'🥞',fullness:19,mood:7,start:5,end:11,caption:'폭신한 왕 팬케이크를 나눠 먹어요.'},
  oden: {name:'어묵탕',emoji:'🍢',fullness:26,mood:5,start:13,end:18,caption:'뜨끈한 국물 한 입, 마음까지 따뜻해져요.'},
  radish: {name:'무 반띵',emoji:'🥬',fullness:16,mood:4,start:20,end:24,caption:'무를 반으로 나눠서 아삭아삭!'},
  parfait: {name:'랏코의 파르페',emoji:'🍨',fullness:18,mood:9,start:26,end:32,caption:'달콤한 파르페 앞에서는 랏코도 행복해요.'}
};
let videoMeal = false;
function stopFoodVideo() {
  const frame = $('#foodVideo');
  frame.removeAttribute('src');
  $('#foodVideoBox').hidden = true;
  $('.meal-stage').hidden = false;
  $('.scene-dots').hidden = false;
  videoMeal = false;
}
function showFoodScene(action, replay = false) {
  const food = foodScenes[action];
  if (!food) return;
  mealTimers.forEach(clearTimeout); mealTimers = [];
  mealActive = true; videoMeal = true;
  $('.meal-scene').dataset.phase = 'video';
  $('.meal-stage').hidden = true;
  $('.scene-dots').hidden = true;
  $('#foodVideoBox').hidden = false;
  $('#mealTitle').textContent = food.emoji + ' ' + food.name;
  $('#mealCaption').textContent = food.caption + (replay ? ' · 장면 다시 보기' : ' · 맛있게 먹었어요!');
  const params = new URLSearchParams({autoplay:'1',playsinline:'1',start:String(food.start),end:String(food.end),rel:'0',mute:state.sound?'0':'1',enablejsapi:'1',origin:location.origin});
  $('#foodVideo').src = 'https://www.youtube-nocookie.com/embed/DBA99It6Q_w?' + params;
  $('#foodVideo').title = food.name + ' 먹는 장면';
  $('#foodVideo').onload = () => {
    const frame = $('#foodVideo');
    if (!videoMeal) return;
    frame.contentWindow.postMessage(JSON.stringify({event:'listening',id:'foodVideo'}),'https://www.youtube-nocookie.com');
    frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'addEventListener',args:['onError']}),'https://www.youtube-nocookie.com');
  };
  $('#foodVideoLink').href = 'https://www.youtube.com/watch?v=DBA99It6Q_w&t=' + food.start + 's';
  openScene('#mealOverlay','#skipMeal');
}
// Replays never change hunger, coins, or care rewards.
function initFoodMenu() {
  $('#animeFoods').innerHTML = Object.entries(foodScenes).map(([id,food]) => `<div class="anime-food"><button class="food-eat" data-action="${id}"><span>${food.emoji}</span><b>${food.name}</b><small>배부름 +${food.fullness}</small></button><button class="food-replay" data-watch="${id}" aria-label="${food.name} 장면 다시 보기">▷ 장면 다시 보기</button></div>`).join('');
  $$('#animeFoods [data-action]').forEach(button => button.addEventListener('click',()=>care(button.dataset.action)));
  $$('[data-watch]').forEach(button => button.addEventListener('click',()=>{if(!mealActive && !activeGame) showFoodScene(button.dataset.watch,true);}));
}
window.addEventListener('message', event => {
  if (!videoMeal || event.source !== $('#foodVideo').contentWindow || event.origin !== 'https://www.youtube-nocookie.com') return;
  let data; try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch { return; }
  if (data?.event === 'onError') $('#mealCaption').textContent = '이 영상은 여기서 재생되지 않아요. 아래 ‘YouTube에서 보기’를 눌러 주세요.';
});

document.addEventListener('DOMContentLoaded',initFoodMenu);
