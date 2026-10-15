const foodScenes = {
  ramen:{name:'컵라면',emoji:'🍜',fullness:24,mood:5,caption:'후후 불어서, 면을 후루룩!'},
  pancake:{name:'왕 팬케이크',emoji:'🥞',fullness:19,mood:7,caption:'폭신한 왕 팬케이크를 나눠 먹어요.'},
  oden:{name:'어묵탕',emoji:'🍢',fullness:26,mood:5,caption:'뜨끈한 국물 한 입, 마음까지 따뜻해져요.'},
  radish:{name:'무 반띵',emoji:'🥬',fullness:16,mood:4,caption:'무를 반으로 나눠서 아삭아삭!'},
  parfait:{name:'랏코의 파르페',emoji:'🍨',fullness:18,mood:9,caption:'달콤한 파르페 앞에서는 랏코도 행복해요.'}
};
let videoMeal=false;
function stopFoodVideo(){
  const video=$('#foodClip');video.onended=null;video.ontimeupdate=null;video.onerror=null;
  video.pause();video.removeAttribute('src');video.load();
  $('#foodVideoBox').hidden=true;$('.meal-stage').hidden=false;$('.scene-dots').hidden=false;videoMeal=false;
}
function showFoodScene(id){
  const food=foodScenes[id];if(!food)return;
  mealTimers.forEach(clearTimeout);mealTimers=[];mealActive=true;videoMeal=true;
  if('speechSynthesis' in window)speechSynthesis.cancel();
  $('.meal-scene').dataset.phase='video';$('.meal-stage').hidden=true;$('.scene-dots').hidden=true;
  $('#foodVideoBox').hidden=false;$('#mealTitle').textContent=food.emoji+' '+food.name;
  $('#mealCaption').textContent=food.caption;$('#clipPlay').hidden=true;$('#clipProgress').style.width='0%';
  const video=$('#foodClip');video.muted=!state.sound;video.src=`assets/food-clips/${id}.mp4`;
  video.onended=()=>{$('#mealCaption').textContent='맛있게 먹었어요!';mealTimers.push(setTimeout(finishMeal,650));};
  video.ontimeupdate=()=>{if(Number.isFinite(video.duration)&&video.duration>0)$('#clipProgress').style.width=`${video.currentTime/video.duration*100}%`;};
  video.onerror=()=>{$('#mealCaption').textContent='장면을 불러오지 못했어요. 다시 재생해 보세요.';$('#clipPlay').hidden=false;};
  openScene('#mealOverlay','#skipMeal');
  video.play().catch(()=>{$('#clipPlay').hidden=false;});
}
document.addEventListener('DOMContentLoaded',()=>{$('#clipPlay').addEventListener('click',()=>{$('#foodClip').play().then(()=>{$('#clipPlay').hidden=true;}).catch(()=>{$('#mealCaption').textContent='영상이 준비되면 다시 눌러 주세요.';});});});
