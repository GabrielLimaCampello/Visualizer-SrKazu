const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#c'),ctx=canvas.getContext('2d'),audio=$('#audio');
let scene, actx, analyser, src, bins=new Uint8Array(256), playing=false, t0=0;
const roles=[
 {id:'artwork',file:'assets/artwork.jpg',label:'Arte principal / personagem',original:'local:24051'},
 {id:'title',file:'assets/title.png',label:'Título principal',original:'local:24048'},
 {id:'credits',file:'assets/credits.png',label:'Créditos superiores',original:'local:24049'},
 {id:'subtitle',file:'assets/subtitle.png',label:'Subtítulo / artistas',original:'local:22918'},
 {id:'logo',file:'assets/logo.png',label:'Logotipo decorativo',original:'local:20768'},
 {id:'particle',file:'assets/particle.jpg',label:'Sprite de partícula',original:'local:23300'},
 {id:'mask',file:'assets/mask.png',label:'Máscara quadrada',original:'local:23996'}
];
const imgs={}; const state={camera:1.0,rotation:0.0,bloom:1.15,motion:.17,lightning:1,particles:1,bars:1,backgroundBlur:14,artX:.36,artY:.51,artScale:.47,titleX:.69,titleY:.35,titleScale:.55,subtitleX:.69,subtitleY:.50,subtitleScale:.48};
async function loadImg(id,url){return new Promise((res,rej)=>{let i=new Image;i.onload=()=>{imgs[id]=i;res(i)};i.onerror=rej;i.src=url})}
async function boot(){scene=await fetch('scene.json').then(r=>r.json()); await Promise.all(roles.map(r=>loadImg(r.id,r.file))); buildSlots();buildLayers();buildFx();buildTree();requestAnimationFrame(draw)}
function initAudio(){if(actx)return;actx=new (AudioContext||webkitAudioContext)();analyser=actx.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.78;src=actx.createMediaElementSource(audio);src.connect(analyser);analyser.connect(actx.destination)}
$('#audioFile').onchange=e=>{let f=e.target.files[0];if(f){audio.src=URL.createObjectURL(f);audio.load()}};
$('#play').onclick=async()=>{initAudio();await actx.resume();if(audio.paused){await audio.play();playing=true;$('#play').textContent='❚❚'}else{audio.pause();playing=false;$('#play').textContent='▶'}};
$$('nav button').forEach(b=>b.onclick=()=>{$$('nav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');$$('.tab').forEach(x=>x.classList.remove('on'));$('#'+b.dataset.tab).classList.add('on')});
function buildSlots(){const host=$('#slotList');roles.forEach(r=>{let d=document.createElement('div');d.className='card';d.innerHTML=`<div class="row"><div><h3>${r.label}</h3><small>${r.original}</small></div><label class="replace">Substituir<input type="file" accept="image/*"></label></div>`;d.querySelector('input').onchange=e=>{let f=e.target.files[0];if(f)loadImg(r.id,URL.createObjectURL(f))};host.append(d)})}
function allElements(){return scene.compositions.flatMap((c,ci)=>c.elements.map((e,ei)=>({e,ci,ei})))}
function buildLayers(){let host=$('#layerList');allElements().forEach(({e,ci,ei})=>{let d=document.createElement('div');d.className='card layer';let v=e.visible?.v??e.visible??1;d.innerHTML=`<input class="toggle" type="checkbox" ${v?'checked':''}><div><h3>C${ci}.${ei} — ${e._name||e.objType}</h3><small>${e.objType} · ${e.blendMode?.v||e.blendMode||'padrão'}</small></div><span class="badge">${e.customImage?.v||e.customImage||''}</span>`;d.querySelector('input').onchange=x=>{if(typeof e.visible==='object')e.visible.v=x.target.checked?1:0;else e.visible=x.target.checked?1:0};host.append(d)})}
function slider(host,key,label,min,max,step){let d=document.createElement('div');d.className='ctrl';d.innerHTML=`<label><span>${label}</span><b>${state[key]}</b></label><input type="range" min="${min}" max="${max}" step="${step}" value="${state[key]}">`;let i=d.querySelector('input'),b=d.querySelector('b');i.oninput=()=>{state[key]=+i.value;b.textContent=i.value};host.append(d)}
function buildFx(){let h=$('#fxList');[['camera','Zoom da câmera',.8,1.3,.005],['rotation','Rotação global',-3,3,.05],['bloom','Bloom / glow',0,2.5,.05],['motion','Motion blur',0,.7,.01],['lightning','Raios',0,2,.05],['particles','Partículas',0,2,.05],['bars','Barras/segmentos',0,2,.05],['backgroundBlur','Blur do fundo',0,30,1],['artX','Arte — posição X',0,1,.005],['artY','Arte — posição Y',0,1,.005],['artScale','Arte — escala',.15,1,.005],['titleX','Título — posição X',0,1,.005],['titleY','Título — posição Y',0,1,.005],['titleScale','Título — escala',.1,1,.005],['subtitleX','Subtítulo — posição X',0,1,.005],['subtitleY','Subtítulo — posição Y',0,1,.005],['subtitleScale','Subtítulo — escala',.1,1,.005]].forEach(x=>slider(h,...x))}
function buildTree(){let lines=scene.compositions.map((c,i)=>`C${i}  ${c.elements.length} elementos\n`+c.elements.map((e,j)=>`  └─ ${j}: ${e.objType}${e.visible?.v===0||e.visible===0?' [oculto]':''}`).join('\n'));$('#tree').textContent=lines.join('\n')}
function band(a,b){if(!analyser)return .25+.18*Math.sin(performance.now()/250);analyser.getByteFrequencyData(bins);let s=0,n=0;for(let i=a;i<b;i++){s+=bins[i];n++}return s/n/255}
function fit(img,cx,cy,scale,rot=0,alpha=1,blend='source-over'){if(!img)return;let maxW=canvas.width*scale,maxH=canvas.height*scale,rr=Math.min(maxW/img.width,maxH/img.height);ctx.save();ctx.globalAlpha=alpha;ctx.globalCompositeOperation=blend;ctx.translate(cx*canvas.width,cy*canvas.height);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-img.width*rr/2,-img.height*rr/2,img.width*rr,img.height*rr);ctx.restore()}
function drawLightning(time,energy){ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor='#ff9b00';ctx.shadowBlur=24*state.bloom;ctx.strokeStyle=`rgba(255,174,20,${.3+energy*.65})`;ctx.lineWidth=3+energy*7;for(let k=0;k<5;k++){ctx.beginPath();let y=(.12+k*.19)*canvas.height;for(let x=-20;x<canvas.width+20;x+=40){let yy=y+Math.sin(x*.014+time*1.7+k)*28+Math.sin(x*.041-time*2.3)*10; x<0?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke()}ctx.restore()}
function drawParticles(time,treble){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<80;i++){let x=(Math.sin(i*91.73+time*.13)*.5+.5)*canvas.width,y=(Math.sin(i*17.1-time*(.15+i%4*.03))*.5+.5)*canvas.height,r=(1+(i%5))*state.particles*(.5+treble);ctx.fillStyle=i%4===0?'#ff5a18':'#ffd15c';ctx.globalAlpha=.18+treble*.7;ctx.fillRect(x,y,r,r)}ctx.restore()}
function drawBars(time,mid){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,62,15,${.25+mid*.6})`;for(let i=0;i<22;i++){let x=(.08+i*.041)*canvas.width,h=(6+Math.abs(Math.sin(time*3+i*.8))*24*mid)*state.bars;ctx.fillRect(x,canvas.height*.88-h,3,h)}ctx.restore()}
function draw(now){let t=now/1000,bass=band(0,24),mid=band(25,90),high=band(90,220),pulse=1+bass*.035;ctx.save();ctx.fillStyle='#090705';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate((state.rotation+Math.sin(t*.45)*.25)*Math.PI/180);ctx.scale(state.camera*pulse,state.camera*pulse);ctx.translate(-canvas.width/2,-canvas.height/2);
// background from the actual .viz artwork slot
ctx.save();ctx.filter=`blur(${state.backgroundBlur}px) saturate(1.25) brightness(.7)`;fit(imgs.artwork,.5,.5,1.55,0,1);ctx.restore();ctx.fillStyle='rgba(35,15,0,.22)';ctx.fillRect(0,0,canvas.width,canvas.height);
// geometric boxes / masks equivalent to 3DBox comps
ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,165,0,.18)';for(let i=0;i<7;i++){ctx.translate(canvas.width*.02,0);ctx.rotate((i%2?1:-1)*.02);ctx.fillRect(canvas.width*(.18+i*.08),canvas.height*(.12+i*.07),canvas.width*.18,canvas.height*.18)}ctx.restore();
// artwork foreground
ctx.save();ctx.shadowColor='#ffb000';ctx.shadowBlur=35*bass*state.bloom;fit(imgs.artwork,state.artX,state.artY,state.artScale,-1.0,1);ctx.restore();
fit(imgs.title,state.titleX,state.titleY,state.titleScale,0,1,'screen');fit(imgs.subtitle,state.subtitleX,state.subtitleY,state.subtitleScale,0,1,'screen');fit(imgs.credits,.38,.76,.28,0,.8,'screen');fit(imgs.logo,.52,.72,.14,0,.6,'screen');
drawLightning(t,bass*state.lightning);drawParticles(t,high);drawBars(t,mid);
// temporal veil approximating MotionBlurEffect
ctx.fillStyle=`rgba(5,3,1,${state.motion*(1-bass*.4)})`;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();requestAnimationFrame(draw)}
$('#reset').onclick=()=>location.reload();boot();
