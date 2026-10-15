const habitatBackgrounds={chiikawa:'house-interior-v6',hachiware:'cave-interior-v6',rakko:'rakko-car-v6'};
const originalHabitatMarkup=habitatMarkup;
habitatMarkup=id=>habitatBackgrounds[id]?`<img class="anime-habitat" src="assets/habitats/${habitatBackgrounds[id]}.png" alt="">`:originalHabitatMarkup(id);
const decorArt={
  futon:{name:'포근한 이불',width:34,art:'<path d="M13 30Q59 19 108 30L114 82Q57 94 9 81Z" fill="#fff9e6"/><path d="M12 48Q57 39 111 49L114 82Q58 93 9 81Z" fill="#edcb8e"/><path d="M24 31q18-8 34-2l1 16q-18 7-37 0z" fill="#fffef9"/><path d="M68 58l5 5m17 1l-5 5m-42 2l5 5" stroke="#f9e9bc" stroke-width="4"/>'},
  table:{name:'분홍 낮은 탁자',width:28,art:'<path d="M23 48v24m75-24v24" stroke="#9c6c67" stroke-width="8"/><ellipse cx="60" cy="40" rx="54" ry="24" fill="#e8b4b6"/><path d="M6 40v9q54 44 108 0v-9" fill="#e8b4b6"/><ellipse cx="60" cy="39" rx="54" ry="22" fill="#f6d0ca"/>'},
  lantern:{name:'작은 랜턴',width:13,art:'<path d="M41 20V9q19-12 38 0v11" fill="none"/><path d="M35 27h50l5 49q-30 13-60 0z" fill="#748e83"/><path d="M40 33h40l3 34q-23 9-46 0z" fill="#fff2ab"/><path d="M57 35v30m7-30v30" stroke="#d6bd7d"/><path d="M31 76h58v8H31zM38 20h44v10H38z" fill="#799386"/>'},
  books:{name:'풀뽑기 책',width:16,art:'<path d="M20 62l62-17 22 15-61 18z" fill="#e9c7ba"/><path d="M20 55l60-16 24 14-61 18-23-8z" fill="#fff6dc"/><path d="M24 29l55-10 21 28-54 13z" fill="#b0c59b"/><path d="M34 32l23-5m-19 14l33-7m-25 14l21-5" stroke="#647b54" stroke-width="3"/>'},
  bear:{name:'좋아하는 곰 인형',width:15,art:'<circle cx="37" cy="24" r="12" fill="#c29877"/><circle cx="83" cy="24" r="12" fill="#c29877"/><ellipse cx="60" cy="65" rx="29" ry="27" fill="#c29877"/><circle cx="60" cy="38" r="27" fill="#d2ab86"/><ellipse cx="60" cy="46" rx="14" ry="10" fill="#f0d6b1"/><path d="M47 36h1m24 0h1m-13 4v9m-5-4q5 7 10 0" fill="none"/><path d="M31 59l-9 9m67-9l9 9M43 85l-7 7m40-7l7 7" stroke="#a97f60" stroke-width="13"/>'},
  bag:{name:'곰돌이 가방',width:14,art:'<path d="M35 42Q26-10 73 10L90 40" fill="none" stroke="#b99b74" stroke-width="5"/><circle cx="39" cy="41" r="10" fill="#cca77d"/><circle cx="83" cy="41" r="10" fill="#cca77d"/><path d="M29 46q31-17 62 0v36q-31 15-62 0z" fill="#d5b68f"/><path d="M48 59h1m22 0h1m-11 3v8m-6-3q6 7 12 0" fill="none"/>'},
  camera:{name:'하치와레의 카메라',width:17,art:'<path d="M20 30h80v45H20z" fill="#657b70"/><path d="M20 30h80v13H20z" fill="#f0e9db"/><circle cx="61" cy="55" r="15" fill="#444b48"/><circle cx="61" cy="55" r="9" fill="#a7b8b0"/><path d="M30 23h17v7H30z" fill="#ebe6d8"/><circle cx="88" cy="36" r="3" fill="#55675f"/>'},
  box:{name:'골판지 상자',width:26,art:'<path d="M10 39l44-18 55 19-48 23z" fill="#e9d6ac"/><path d="M10 39v34l51 21V63z" fill="#d3b990"/><path d="M61 63l48-23v34L61 94z" fill="#dfc69d"/><path d="M34 30l50 23-1 12-49-23z" fill="#f3e3bd"/>'},
  plant:{name:'작은 꽃 한 송이',width:13,art:'<path d="M59 32v30m0-15q-26-17-22 1q8 10 22 7m0-10q24-17 22 0q-6 9-22 7" fill="#9fbc82"/><path d="M36 62h48l-7 30H43z" fill="#c09c7c"/><path d="M32 60h56v8H32z" fill="#e0b597"/><g fill="#eeb5bb"><circle cx="49" cy="20" r="9"/><circle cx="66" cy="18" r="9"/><circle cx="72" cy="31" r="9"/><circle cx="56" cy="36" r="9"/><circle cx="44" cy="32" r="9"/></g><circle cx="58" cy="27" r="7" fill="#f4dc9e"/>'}
};
function decorSvg(kind){return `<svg viewBox="0 0 120 100" aria-hidden="true"><g stroke="#665247" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${decorArt[kind].art}</g></svg>`;}
function defaultDecor(character) {
  if(character==='hachiware')return[{kind:'box',x:47,y:72},{kind:'books',x:39,y:67},{kind:'lantern',x:29,y:68},{kind:'camera',x:55,y:66}];
  if(character==='rakko')return[{kind:'table',x:70,y:75},{kind:'books',x:73,y:68}];
  if(character==='momonga')return[{kind:'futon',x:42,y:79},{kind:'plant',x:76,y:71}];
  if(character==='usagi')return[{kind:'futon',x:65,y:80},{kind:'table',x:31,y:73}];
  return[{kind:'futon',x:72,y:78},{kind:'table',x:28,y:73},{kind:'bear',x:81,y:66},{kind:'bag',x:15,y:61}];
}
function sanitizeDecor(items) {
  return items.slice(0,14).filter(item=>item&&Object.hasOwn(decorArt,item.kind)).map(item=>({kind:item.kind,x:Math.max(6,Math.min(94,Number(item.x)||50)),y:Math.max(40,Math.min(91,Number(item.y)||70))}));
}
drawRoom=(element,room,character,outfit='none',clean=100)=>{
  element.dataset.habitat=homeInfos[character]?.[0]||'house';element.dataset.character=character;
  element.classList.add('authentic-room');
  const items=Array.isArray(room.items)?sanitizeDecor(room.items):defaultDecor(character);
  element.innerHTML='<div class="habitat-layer" aria-hidden="true">'+habitatMarkup(character)+'</div><div class="placed-decor">'+items.map((item,i)=>`<button class="decor-item" data-decor-index="${i}" style="left:${item.x}%;top:${item.y}%;width:${decorArt[item.kind].width}%;z-index:${10+Math.floor(item.y)}" aria-label="${decorArt[item.kind].name} 옮기기">${decorSvg(item.kind)}</button>`).join('')+'</div><img class="room-character room-body" alt=""><img class="room-character room-clothes" alt="" hidden><img class="room-character room-dirt" alt="" hidden><span class="room-plaque"></span>';
  const image=element.querySelector('.room-body'),composite=paintCharacter(image,character,outfitId(outfit));
  image.alt=characters.find(([,id])=>id===character)?.[0]||'';
  const clothes=element.querySelector('.room-clothes');clothes.hidden=outfit==='none'||composite;if(!clothes.hidden)clothes.src=outfitUrl(character,outfit);
  const dirt=element.querySelector('.room-dirt');dirt.src=dirtArt(character,outfit);dirt.hidden=clean>=85;dirt.style.opacity=clean<45?'.94':'.66';
  element.querySelector('.room-plaque').textContent=room.name;
  if(element.id!=='myRoom')element.querySelectorAll('.decor-item').forEach(node=>{node.disabled=true;node.tabIndex=-1;});
};
let selectedDecor=-1,decorDrag=null;
window.renderRoom=()=>{
  state.room=sanitizeRoom(state.room);
  if(!Array.isArray(state.room.items))state.room.items=defaultDecor(state.character);
  drawRoom($('#myRoom'),state.room,state.character,outfitId(state.worn?.[state.character]),state.clean);
  $('#homePlacedDecor').innerHTML=state.room.items.map(item=>`<span class="home-decor-item" style="left:${item.x}%;top:${item.y}%;width:${decorArt[item.kind].width}%">${decorSvg(item.kind)}</span>`).join('');
  if(document.activeElement!==$('#roomName'))$('#roomName').value=state.room.name;
  $('#roomThemeTitle').textContent=homeInfos[state.character][1];
  $('#decorHelp').textContent=selectedDecor>=0&&state.room.items[selectedDecor]?decorArt[state.room.items[selectedDecor].kind].name+' 선택됨 · 드래그해서 옮겨요':'소품을 고르고, 집 안에서 끌어서 배치해요.';
  $('#removeDecor').disabled=selectedDecor<0||!state.room.items[selectedDecor];
  $('#world').classList.toggle('authentic-world',Boolean(habitatBackgrounds[state.character]));
};
function initDecorEditor(){
  $('#decorTray').innerHTML=Object.entries(decorArt).map(([id,item])=>`<button data-add-decor="${id}">${decorSvg(id)}<span>${item.name}</span></button>`).join('');
  $$('[data-add-decor]').forEach(button=>button.addEventListener('click',()=>{
    if(state.room.items.length>=14){showToast('소품은 14개까지 놓을 수 있어요.');return;}
    state.room.items.push({kind:button.dataset.addDecor,x:44+(state.room.items.length%3)*10,y:65+(state.room.items.length%2)*10});selectedDecor=state.room.items.length-1;persist();$('#roomLinkBox').hidden=true;
  }));
  $('#removeDecor').addEventListener('click',()=>{if(selectedDecor<0)return;state.room.items.splice(selectedDecor,1);selectedDecor=-1;persist();$('#roomLinkBox').hidden=true;});
  $('#resetDecor').addEventListener('click',()=>{state.room.items=defaultDecor(state.character);selectedDecor=-1;persist();$('#roomLinkBox').hidden=true;showToast('이 집의 기본 소품 배치로 돌아왔어요.');});
  const preview=$('#myRoom');
  preview.addEventListener('pointerdown',event=>{
    const node=event.target.closest('[data-decor-index]');if(!node)return;
    selectedDecor=Number(node.dataset.decorIndex);const item=state.room.items[selectedDecor];
    decorDrag={node,index:selectedDecor,pointer:event.pointerId,startX:event.clientX,startY:event.clientY,x:item.x,y:item.y,moved:false};
    node.classList.add('selected');node.style.zIndex='200';preview.setPointerCapture(event.pointerId);event.preventDefault();
    $('#decorHelp').textContent=decorArt[item.kind].name+' 선택됨';$('#removeDecor').disabled=false;
  });
  preview.addEventListener('pointermove',event=>{
    if(!decorDrag||decorDrag.pointer!==event.pointerId)return;
    const rect=preview.getBoundingClientRect(),item=state.room.items[decorDrag.index];
    item.x=Math.max(6,Math.min(94,decorDrag.x+(event.clientX-decorDrag.startX)/rect.width*100));
    item.y=Math.max(40,Math.min(91,decorDrag.y+(event.clientY-decorDrag.startY)/rect.height*100));
    decorDrag.node.style.left=item.x+'%';decorDrag.node.style.top=item.y+'%';decorDrag.moved=true;
  });
  const finish=()=>{if(!decorDrag)return;decorDrag=null;persist();$('#roomLinkBox').hidden=true;};
  preview.addEventListener('pointerup',finish);preview.addEventListener('pointercancel',finish);
  preview.addEventListener('keydown',event=>{
    const node=event.target.closest('[data-decor-index]');if(!node)return;selectedDecor=Number(node.dataset.decorIndex);const item=state.room.items[selectedDecor];
    const dir={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[event.key];
    if(dir){event.preventDefault();item.x=Math.max(6,Math.min(94,item.x+dir[0]));item.y=Math.max(40,Math.min(91,item.y+dir[1]));persist();$('#roomLinkBox').hidden=true;preview.querySelector(`[data-decor-index="${selectedDecor}"]`)?.focus();}
    if(event.key==='Delete')$('#removeDecor').click();
  });
  render();
}
document.addEventListener('DOMContentLoaded',initDecorEditor);
