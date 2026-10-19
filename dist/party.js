let partyDanceTimer=0,partyDanceStep=0,partySession=0;
const partySong=$('#partySong');
partySong.volume=.85;
partySong.addEventListener('ended',endPartyDance);
function endPartyDance() {
  partySession++;
  clearInterval(partyDanceTimer);partyDanceTimer=0;
  partySong.pause();
  if(partySong.readyState>0)partySong.currentTime=0;
  $('#petButton').classList.remove('party-dancing');$('#villageActor').classList.remove('party-dancing');
  for(const node of $$('.party-outfit'))node.style.backgroundPosition='0% 50%';
  $('#danceButton').textContent='♪ 파자마 파티 춤';
}
function startPartyDance() {
  if(partyDanceTimer){endPartyDance();return;}
  if(mealActive||activeGame)return;
  if(!partyCharacters.includes(state.character)){showToast('치이카와·하치와레·우사기의 파자마 파티예요.');return;}
  if(outfitId(state.worn?.[state.character])!=='party'){showToast('파자마 파티 일체복을 입고 춤춰요!');$('.closet').open=true;return;}
  // Starting the music is an explicit sound-on action, even after a saved mute.
  if(!state.sound){state.sound=true;persist();showToast('파티 음악을 켰어요.');}
  stopVillageWalk();stopVoice();partyDanceStep=0;
  const session=++partySession;
  const character=state.character,frames=[1,0,2,0,3,0,2,0];
  $('#petButton').classList.add('party-dancing');$('#villageActor').classList.add('party-dancing');
  $('#danceButton').textContent='■ 춤 멈추기';setSpeech('우~와와~♪');
  partySong.muted=false;
  if(partySong.readyState>0)partySong.currentTime=0;
  partySong.play().then(()=>{
    if(session===partySession)$('#danceButton').textContent='■ 노래·춤 멈추기';
  }).catch(()=>{
    if(session!==partySession)return;
    endPartyDance();showToast('음악을 재생할 수 없어요. 파티 버튼을 다시 눌러 주세요.');
  });
  partyDanceTimer=setInterval(()=>{
    if(state.character!==character||outfitId(state.worn?.[state.character])!=='party'||mealActive||activeGame||!state.sound){endPartyDance();return;}
    const frame=frames[partyDanceStep++%frames.length];
    for(const selector of ['#petFrameA','#villagePet'])$(selector).style.backgroundPosition=`${frame*100/3}% 50%`;
    setSpeech(partyDanceStep%4<2?'우~와와~♪':'와~와~♪');
  },240);
}
document.addEventListener('DOMContentLoaded',()=>{
  $('#danceButton').addEventListener('click',startPartyDance);$('#villageDance').addEventListener('click',startPartyDance);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)endPartyDance();});
});
