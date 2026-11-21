/* ======================================================================
   Neón Buggy Infinito · extras y arranque
   Ajustes, logros, guardado en la nube, fantasma, tutorial, ríos y puentes, y arranque.
   (script clásico: comparte variables con los demás neon-buggy-*.js; orden de carga en neon-buggy.html)
   ====================================================================== */
/* ---------- fase 4: ajustes, tutorial, logros, guardado en la nube y fantasma ---------- */
const SET=Object.assign({vol:1,q:2,steer:1,fps:0},ls.get('nb_set',{}));
function setApply(){try{R.setPixelRatio(Math.min(window.devicePixelRatio||1,SET.q===0?1:SET.q===1?1.5:2));R.setSize(innerWidth,innerHeight)}catch(e){}
 try{const sh=SET.q!==0;if(R.shadowMap.enabled!==sh){R.shadowMap.enabled=sh;sun.castShadow=sh;S.traverse(o=>{const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(q=>{q.needsUpdate=true})})}}catch(e){}
 try{if(mg)mg.gain.value=SET.vol}catch(e){}}
/* contador de FPS (usa la medición de AX.fps) */
const fpsEl=mk('div');fpsEl.id='fpsn';document.body.appendChild(fpsEl);
function fpsShow(){fpsEl.style.display=SET.fps?'block':'none'}
setInterval(()=>{if(SET.fps)fpsEl.textContent=Math.round(AX.fps)+' FPS'},500);fpsShow();
function setUI(){const QN=['BAJA','MEDIA','ALTA'];
 panel(`<h1>AJUSTES</h1><div class='srow'><span>Volumen</span><span><button class='go alt tg' id='vm'>−</button> <b id='vv'></b> <button class='go alt tg' id='vp'>+</button></span></div><div class='srow'><span>Calidad gráfica</span><button class='go alt tg' id='sq'></button></div><div class='srow'><span>Mostrar FPS</span><button class='go alt tg' id='sfps'></button></div><div class='srow'><span>Sensibilidad de giro</span><span><button class='go alt tg' id='sm'>−</button> <b id='sv'></b> <button class='go alt tg' id='sp'>+</button></span></div><p style='font-size:13px;opacity:.85'>Calidad BAJA: sin sombras y menos resolución, para móviles lentos.</p><div class='row'><button class='go alt' id='stut'>JUGAR EL TUTORIAL</button></div><div class='row'><button class='go' id='bk'>VOLVER</button></div>`);
 const sv=()=>{ls.set('nb_set',SET);setApply()},up=()=>{$('vv').textContent=Math.round(SET.vol*100)+'%';$('sv').textContent=Math.round(SET.steer*100)+'%';$('sq').textContent=QN[SET.q];$('sfps').textContent=SET.fps?'SÍ':'NO'},cl=(v,a,b)=>Math.max(a,Math.min(b,Math.round(v*10)/10));
 $('vm').onclick=()=>{SET.vol=cl(SET.vol-.1,0,1);sv();up();snd(600,.1,'triangle',.08,0)};$('vp').onclick=()=>{SET.vol=cl(SET.vol+.1,0,1);sv();up();snd(600,.1,'triangle',.08,0)};
 $('sm').onclick=()=>{SET.steer=cl(SET.steer-.1,.5,1.6);sv();up()};$('sp').onclick=()=>{SET.steer=cl(SET.steer+.1,.5,1.6);sv();up()};
 $('sq').onclick=()=>{SET.q=(SET.q+1)%3;sv();up()};$('sfps').onclick=()=>{SET.fps=SET.fps?0:1;sv();up();fpsShow()};$('stut').onclick=()=>tutStart();$('bk').onclick=menu;up()}
/* ---------- tutorial jugable ---------- */
const TOUCH=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
const TUT={on:0,k:-1,ok:[0,0,0,0,0,0],nit:0,brk:0,flip:0,cr:0};
const TEND=24*L+40;
const TSEC=[
 {t:'GIRAR',d:TOUCH?'Usa ◀ ▶ para coger las monedas':'Usa A / D (o las flechas) para coger las monedas',ok:()=>coinsN>=5,p:()=>Math.min(5,coinsN)+' / 5 monedas'},
 {t:'TURBO',d:TOUCH?'Mantén el botón de fuego':'Mantén W (o la flecha arriba)',ok:()=>TUT.nit>=2,p:()=>Math.min(2,TUT.nit).toFixed(1)+' / 2 s'},
 {t:'FRENO',d:TOUCH?'En el móvil no hace falta frenar: esquiva los huecos':'Mantén S para frenar y pasar por los huecos de los muros',ok:()=>TOUCH?dist>=2*192+150:TUT.brk>=1.5,p:()=>TOUCH?'Pasa los muros':Math.min(1.5,TUT.brk).toFixed(1)+' / 1,5 s'},
 {t:'RAMPA Y VOLTERETA',d:TOUCH?'Sube a la rampa y mantén el botón de giro en el aire':'Sube a la rampa y mantén ESPACIO en el aire',ok:()=>TUT.flip>=5,p:()=>Math.min(5,TUT.flip).toFixed(1)+' / 5 de giro'},
 {t:'CAJAS',d:'Choca contra las cajas para romperlas',ok:()=>TUT.cr>=3,p:()=>Math.min(3,TUT.cr)+' / 3 cajas'},
 {t:'PASO DE CEBRA',d:'Las abuelitas cruzan: atropellarlas te frena. ¡Y cuidado con los coches rojos!',ok:()=>dist>=23*L+20,p:()=>'Cruza sin prisa'}];
function tutOffer(next){panel("<h1>¿APRENDER A JUGAR?</h1><p>Un circuito corto de un minuto te enseña a girar, usar el turbo, frenar, saltar rampas y romper cajas. No puedes morir ni puntúa.</p><div class='row'><button class='go' id='tsi'>SÍ, ENSÉÑAME</button><button class='go alt' id='tno'>NO, GRACIAS</button></div>");
 $('tsi').onclick=()=>tutStart();$('tno').onclick=()=>{ls.set('nb_tut',1);next&&next()};$('tsi').focus()}
function tutStart(){if(RC.ch)raceLeave();ls.set('nb_tut',1);Object.assign(TUT,{on:1,k:-1,ok:[0,0,0,0,0,0],nit:0,brk:0,flip:0,cr:0});daily.rc=0;load()}
function genChunkTut(i){const c={i,meshes:[]};cur=c;const z0=-i*L,sec=Math.floor(i/4);
 for(let k=0;k<2;k++){const zc=z0-12-k*24;
  if(sec===0)coins(k?-7:7,zc+10,8,2.5,0);
  else if(sec===1)coins(0,zc+10,8,2.6,0);
  else if(sec===2){if(!k){const g=(i*5+2)%6;for(let j=0;j<6;j++){const x=-13.5+4.5*j+2.25;if(j===g){pick('coin',x,.9,zc+3);pick('coin',x,.9,zc)}else wall(x,zc,4.5)}}}
  else if(sec===3){if(!k){const x=((i%3)-1)*4;ramp(x,zc+6,3.5);for(let n=0;n<4;n++)pick('coin',x,5.5,zc-3-n*4)}}
  else if(sec===4){for(let n=0;n<5;n++)crate(-8+4*n,zc-2+(n%2)*3);if(!k)barrel(0,zc-8)}
  else if(sec===5){if(!k)P.zebra(zc);else coins(rr(-6,6),zc+10,6,3,2)}}
 if(i===24){[-1,1].forEach(q=>{const m=box(.8,6,.8,mCon);m.position.set(q*14,3,z0-6);reg(m)});const t=box(29,1.2,.8,mLamp);t.position.set(0,6,z0-6);reg(t)}
 deco(i,z0);chunks.push(c)}
function tutTick(dt){const b=$('tutb');if(!TUT.on||st!=='play'){if(b&&b.style.display!=='none')b.style.display='none';return}
 shields=3;eT=99;const k=Math.min(5,Math.floor(dist/192));if(TUT.k!==k){TUT.k=k;TUT.nit=TUT.brk=TUT.flip=TUT.cr=0}
 if(keys.KeyW||keys.ArrowUp)TUT.nit+=dt;if(keys.KeyS||keys.ArrowDown)TUT.brk+=dt;if(car.air&&keys.Space)TUT.flip+=7*dt;
 const s=TSEC[k];if(s.ok())TUT.ok[k]=1;
 const h='<b>PASO '+(k+1)+' / 6 · '+s.t+'</b>'+s.d+'<small class="'+(TUT.ok[k]?'ok':'')+'">'+(TUT.ok[k]?'✔ ¡HECHO!':s.p())+'</small>';
 if(b){b.style.display='block';if(b._h!==h){b.innerHTML=h;b._h=h}}
 if(dist>=TEND)tutFinish()}
function tutFinish(){if(!TUT.on)return;TUT.on=0;st='end';const n=TUT.ok.filter(Boolean).length,b=$('tutb');if(b)b.style.display='none';AS.tut=1;achCheck();
 panel("<h1>¡TUTORIAL COMPLETADO!</h1><p>Pasos conseguidos: <b>"+n+" / 6</b></p><p>"+(n<6?'Puedes repetirlo cuando quieras desde AJUSTES.':'¡Ya sabes jugar!')+"</p><div class='row'><button class='go' id='tgo'>JUGAR</button><button class='go alt' id='trp'>REPETIR</button><button class='go alt' id='tmn'>MENÚ</button></div>");
 $('tgo').onclick=load;$('trp').onclick=tutStart;$('tmn').onclick=toMenu;$('tgo').focus()}
/* logros */
const ACHS=[{id:'first',n:'Primera carrera',d:'Termina una partida',t:s=>s.games>=1},{id:'tut',n:'Aprendiz',d:'Completa el tutorial',t:s=>s.tut>=1},{id:'d1k',n:'Mil metros',d:'Llega a 1.000 m en una partida',t:s=>s.dmax>=1000},{id:'d5k',n:'Cinco mil',d:'Llega a 5.000 m en una partida',t:s=>s.dmax>=5000},{id:'d10k',n:'Diez mil',d:'Llega a 10.000 m en una partida',t:s=>s.dmax>=10000},
 {id:'meta',n:'Llegada a Beirut',d:'Cruza la meta',t:s=>s.meta>=1},{id:'c100',n:'Bolsillos llenos',d:'Recoge 100 monedas en una partida',t:s=>s.cmax>=100},{id:'cr100',n:'Rompecajas',d:'Rompe 100 cajas',t:s=>s.cr>=100},{id:'gr10',n:'Cuidado, abuelita',d:'Atropella a 10 abuelitas',t:s=>s.gr>=10},
 {id:'rich',n:'Cartera gorda',d:'Ten 1.000 monedas',t:s=>wallet>=1000},{id:'cars3',n:'Coleccionista',d:'Ten 3 coches',t:s=>own.length>=3},{id:'daily',n:'Reto cumplido',d:'Juega el reto diario',t:s=>s.dl>=1},{id:'race',n:'A correr con amigos',d:'Juega una carrera online',t:s=>s.races>=1},{id:'win',n:'Campeón',d:'Gana una carrera online contra otra persona',t:s=>s.wins>=1}];
let AS=Object.assign({games:0,dmax:0,cmax:0,cr:0,gr:0,meta:0,races:0,wins:0,dl:0,tut:0},ls.get('nb_ast',{}));let AU=ls.get('nb_ach',[]);
function achToast(a){const d=document.createElement('div');d.className='invt';d.style.pointerEvents='none';d.innerHTML="LOGRO DESBLOQUEADO<br><b>"+esc(a.n)+"</b><br><small>"+esc(a.d)+"</small>";document.body.appendChild(d);snd(880,.25,'triangle',.08,400);setTimeout(()=>d.remove(),3500)}
function achCheck(){const nw=[];ACHS.forEach(a=>{if(!AU.includes(a.id)&&a.t(AS)){AU.push(a.id);nw.push(a)}});ls.set('nb_ast',AS);ls.set('nb_ach',AU);nw.forEach((a,i)=>setTimeout(()=>achToast(a),i*3600));if(nw.length)cloudDirty()}
{const _sq=squish;squish=function(){if(!TUT.on)AS.gr++;_sq()};const _sm=smash;smash=function(o,k){if(o&&o.t==='crate'){if(TUT.on)TUT.cr++;else AS.cr++}_sm(o,k)};
 const _ov=over;over=function(fin){if(TUT.on){shields=3;return}_ov(fin);if(admin.used)return;AS.games++;if(dist>AS.dmax)AS.dmax=Math.floor(dist);if(coinsN>AS.cmax)AS.cmax=coinsN;if(fin)AS.meta++;if(daily.rc)AS.races++;else if(daily.on)AS.dl++;ghostSave();achCheck()};
 const _rp=racePay;racePay=function(L,mi){_rp(L,mi);if(mi===0&&L.length>=2&&Object.keys(RC.st).length>=1&&!admin.used){AS.wins++;achCheck()}}}
function achUI(){panel(`<h1>LOGROS ${AU.length}/${ACHS.length}</h1><div class='bl' id='al' style='max-height:300px'>${ACHS.map(a=>{const on=AU.includes(a.id);return `<div class='lr${on?' me':''}'><span><strong>${esc(a.n)}</strong><br><small>${esc(a.d)}</small></span><em>${on?'HECHO':'—'}</em></div>`}).join('')}</div><div class='row'><button class='go' id='bk'>VOLVER</button></div>`);$('bk').onclick=menu}
/* guardado en la nube */
let CLd=0,CLt=null,CLp=0;
function cloudDirty(){try{ls.set('nb_ts',Date.now()+(net.off||0));CLd=1;clearTimeout(CLt);CLt=setTimeout(cloudPush,3000)}catch(e){}}
async function cloudPush(){if(!net.ok||!net.name||!CLd)return;CLd=0;try{const r=await net.sb.from('saves').upsert({user_id:net.uid,data:{w:wallet,o:own,s:sel,x:xp,c:claimed,b:best,a:AU,st:AS},ts:ls.get('nb_ts',0)});if(r.error)throw r.error}catch(e){CLd=1;console.warn('guardado nube',e)}}
async function cloudPull(){if(CLp||!net.ok||!net.name)return;CLp=1;
 try{const r=await net.sb.from('saves').select('data,ts').eq('user_id',net.uid).maybeSingle();if(r.error)throw r.error;const lt=ls.get('nb_ts',0);
  if(r.data&&r.data.ts>lt){const d=r.data.data||{},un=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];
   wallet=Math.max(0,+d.w||0);own=un(d.o,own);if(!own.includes(0))own.unshift(0);sel=own.includes(d.s)?d.s:own[0];xp=Math.max(xp,+d.x||0);claimed=un(d.c,claimed);AU=un(d.a,AU);
   if(d.st)for(const k in AS)AS[k]=Math.max(AS[k]||0,+d.st[k]||0);if((+d.b||0)>best){best=+d.b;try{localStorage.setItem('nb_inf',best)}catch(e){}}
   ls.set('nb_w',wallet);ls.set('nb_own',own);ls.set('nb_sel',sel);ls.set('nb_xp',xp);ls.set('nb_cl3',claimed);ls.set('nb_ach',AU);ls.set('nb_ast',AS);ls.set('nb_ts',r.data.ts);if(st==='menu')lobby()}
  else{CLd=1;if(!lt)ls.set('nb_ts',Date.now()+(net.off||0));cloudPush()}}
 catch(e){CLp=0;console.warn('guardado nube',e)}}
addEventListener('visibilitychange',()=>{if(document.hidden&&CLd)cloudPush()});
/* fantasma de tu mejor partida (reto diario) */
const GH={rec:[],t:0,acc:0,best:null,mesh:null};
function ghostClear(){if(GH.mesh){S.remove(GH.mesh);GH.mesh=null}}
function ghostLoad(){GH.rec=[];GH.t=0;GH.acc=0;GH.best=null;ghostClear();if(!daily.on||daily.rc)return;const b=ls.get('nb_gh',null);if(b&&b.day===daily.day&&Array.isArray(b.p)&&b.p.length>3)GH.best=b}
function ghostTick(dt){if(!(daily.on&&!daily.rc&&st==='play')){if(GH.mesh)GH.mesh.visible=false;return}
 GH.t+=dt;GH.acc+=dt;if(GH.acc>=.25){GH.acc-=.25;GH.rec.push([Math.round(dist),+car.x.toFixed(1),+car.y.toFixed(1)])}
 const b=GH.best;if(!b)return;if(!GH.mesh)GH.mesh=mkGhost('TU MEJOR',b.s|0,0);
 const k=GH.t/.25,i=Math.floor(k);if(i>=b.p.length-1){GH.mesh.visible=false;return}const a=b.p[i],c=b.p[i+1],f=k-i;GH.mesh.visible=true;GH.mesh.position.set(a[1]+(c[1]-a[1])*f,a[2]+(c[2]-a[2])*f,-(a[0]+(c[0]-a[0])*f))}
function ghostSave(){if(!daily.on||daily.rc||GH.rec.length<4||admin.used)return;const e=[Math.round(dist),+car.x.toFixed(1),+car.y.toFixed(1)];GH.rec.push(e);const b=GH.best;if(!b||e[0]>b.p[b.p.length-1][0])ls.set('nb_gh',{day:daily.day,s:sel,p:GH.rec})}
$('lset').onclick=setUI;$('lach').onclick=achUI;$('iset').src=ico('gear',0,0);$('iach').src=ico('medal',0,0);setApply();

$('lonl').onclick=()=>onlineUI();$('ion').src=ico('globe',0,0);
/* ---------- ríos y puentes ---------- */
const gRiv=new THREE.PlaneGeometry(700,18),mWat=new THREE.MeshStandardMaterial({color:0x3f95e0,emissive:0x0a3a7a,emissiveIntensity:.35,roughness:.15,metalness:.2,map:tex(128,128,c=>{c.fillStyle='#d6ecff';c.fillRect(0,0,128,128);c.strokeStyle='#fff';c.lineWidth=3;for(let i=0;i<14;i++){const y=rr(0,128),x=rr(0,100);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+14,y-6,x+28,y);c.stroke()}},60,2)}),mDeck=M(0x7a7f88,0,0,.2,.8),mBrg=M(0xc9ccd2,0,0,.3,.6);
mDeck.polygonOffset=true;mDeck.polygonOffsetFactor=-2;mDeck.polygonOffsetUnits=-2;
P.river=function(zc){const w=new THREE.Mesh(gRiv,mWat);w.rotation.x=-Math.PI/2;w.position.set(0,.03,zc);w.renderOrder=1;reg(w);
 mesh(gBox,mDeck,0,-.06,zc,28.6,.26,22);
 [-1,1].forEach(q=>{mesh(gBox,mBrg,q*14,.75,zc,.5,1.1,22);for(let k=0;k<5;k++){mesh(gBox,mBrg,q*14,1.5,zc-10+k*5,.8,2.2,.8);mesh(gBox,mLmp,q*14,2.8,zc-10+k*5,.5,.3,.5)}});
 coins(rr(-8,8),zc+8,7,2.4,rr(0,4))};
netInit();net.ready.then(ok=>{if(ok){inviteListen();onlineListen();reqDot()}});resetWorld();loadScreen();frame();
