/* ======================================================================
   Neón Buggy Infinito · online
   Cuenta, reto diario, tablas, amigos, carreras en directo, chat, espectador (Supabase).
   (script clásico: comparte variables con los demás neon-buggy-*.js; orden de carga en neon-buggy.html)
   ====================================================================== */
/* ---------- online: usuario, reto diario, tablas y amigos (Supabase) ---------- */
/* Pega aquí la URL y la clave pública (anon / publishable) de tu proyecto: Project Settings → API */
const SB_URL='https://bfttgrmgkmxpftfxlwss.supabase.co',SB_KEY='sb_publishable_rWFjRmacouQ0LLe9aZMQLg_R2X_MGib';
const net={ok:false,sb:null,uid:null,name:ls.get('nb_name',''),off:0,ready:null},daily={on:false,seed:0,day:''};
let mode=ls.get('nb_mode','inf'),asked=0;const bt={w:'daily',f:'d'};
const END_D=()=>ZONES.length*ZC*L,nameOk=n=>/^[A-Za-z0-9_]{3,14}$/.test(n),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),dayStr=()=>new Date(Date.now()+net.off).toISOString().slice(0,10);
function hstr(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0}
function mulb(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function netInit(){net.ready=(async()=>{if(!SB_URL||!SB_KEY||typeof supabase==='undefined')return false;
 try{net.sb=supabase.createClient(SB_URL,SB_KEY);let session=(await net.sb.auth.getSession()).data.session;
  if(!session){const r=await net.sb.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session}
  net.uid=session.user.id;net.ok=true;
  try{const r=await net.sb.rpc('server_now');if(r.data)net.off=new Date(r.data).getTime()-Date.now()}catch(e){}
  const p=await net.sb.from('profiles').select('name').eq('id',net.uid).maybeSingle();net.name=p.data?p.data.name:'';ls.set('nb_name',net.name);return true}
 catch(e){console.warn(e);net.ok=false;return false}})();return net.ready}
async function claimName(n){const r=await net.sb.from('profiles').insert({id:net.uid,name:n});
 if(r.error)return r.error.code==='23505'?'taken':'err';
 net.name=n;ls.set('nb_name',n);return 'ok'}
function nameUI(msg){panel(`<h1>ELIGE TU USUARIO</h1><p>Será tu nombre en las tablas y para tus amigos. De 3 a 14 letras, números o _ . No se puede repetir ni cambiar después.</p><input class='inp' id='nin' maxlength='14' autocomplete='off' autocapitalize='off' spellcheck='false' placeholder='TuNombre'><p id='nmsg' style='color:#ffe14a;min-height:22px'>${msg||''}</p><button class='go' id='nok'>ENTRAR</button> <button class='go alt' id='nlg'>YA TENGO USUARIO</button>`);
 const inp=$('nin'),m=$('nmsg');inp.focus();
 const go=async()=>{const n=inp.value.trim();if(!nameOk(n)){m.textContent='Usa de 3 a 14 caracteres: letras, números o _';return}$('nok').disabled=true;m.textContent='Comprobando…';const r=await claimName(n);if(r==='ok')tutOffer(menu);else{$('nok').disabled=false;m.textContent=r==='taken'?'Ese nombre ya está cogido, prueba otro':'Error de conexión, inténtalo otra vez'}};
 $('nok').onclick=go;$('nlg').onclick=()=>loginUI();inp.onkeydown=e=>{if(e.key==='Enter')go()}}
async function submitRun(d,g){const say=t=>{const e=$('dres');if(e)e.innerHTML=t};
 if(!net.ok||!net.name){say(net.ok?'Elige un usuario para salir en la tabla.':'Sin conexión: esta partida no entra en la tabla.');return}
 d=Math.min(d,END_D());
 try{const r=await net.sb.rpc('submit_run',{p_dist:d,p_gold:g});if(r.error)throw r.error;const v=r.data;
  say(`Tabla de hoy: <b>#${v.rd}</b> en distancia (${v.d} m) · <b>#${v.rg}</b> en oro (${v.g})`+(d>v.pd?'<br>¡Nuevo mejor de hoy en distancia!':'')+(g>v.pg?'<br>¡Nuevo mejor de hoy en oro!':''))}
 catch(e){console.warn(e);say('No se pudo guardar en la tabla')}}
function boardUI(){panel(`<h1>TABLAS</h1><div class='row'><button class='go alt tg' data-w='daily'>HOY</button><button class='go alt tg' data-w='all'>HISTÓRICO</button></div><div class='row'><button class='go alt tg' data-f='d'>DISTANCIA</button><button class='go alt tg' data-f='g'>ORO</button></div><div class='bl' id='bl'>Cargando…</div><div class='row'><button class='go' id='bk'>VOLVER</button></div>`);$('bk').onclick=menu;
 const draw=async()=>{document.querySelectorAll('.tg').forEach(b=>b.classList.toggle('sel',b.dataset.w?b.dataset.w===bt.w:b.dataset.f===bt.f));const bl=$('bl');
  if(!net.ok){bl.textContent='Online no disponible.';return}bl.textContent='Cargando…';
  try{const r=await net.sb.rpc('board',{p_scope:bt.w,p_field:bt.f});if(r.error)throw r.error;const a=r.data||[];
   if($('bl')!==bl)return;bl.innerHTML=a.length?a.map((x,i)=>`<div class='lr${x.uid===net.uid?' me':''}'><b>${i+1}</b><span>${esc(x.name)}</span><em>${x.val}${bt.f==='d'?' m':''}</em></div>`).join(''):'Todavía no hay nadie. ¡Sé el primero!'}
  catch(e){bl.textContent='No se pudo cargar la tabla'}};
 document.querySelectorAll('.tg').forEach(b=>b.onclick=()=>{if(b.dataset.w)bt.w=b.dataset.w;else bt.f=b.dataset.f;draw()});draw()}
async function friendsUI(msg){panel(`<h1>AMIGOS</h1><div class='cs2'><input class='inp' id='fin' maxlength='14' autocomplete='off' autocapitalize='off' spellcheck='false' placeholder='Usuario de tu amigo'><button class='go' id='fadd'>AÑADIR</button></div><p id='fmsg' style='min-height:22px;color:#ffe14a'>${esc(msg||'')}</p><div class='bl' id='fq' style='display:none'></div><div class='bl' id='fl'>Cargando…</div><div class='row'><button class='go alt' id='bk'>VOLVER</button></div>`);$('bk').onclick=menu;
 const fm=t=>{const e=$('fmsg');if(e)e.textContent=t};
 if(!net.ok||!net.name){$('fl').textContent=net.ok?'Elige un usuario primero.':'Online no disponible.';return}
 $('fadd').onclick=async()=>{const n=$('fin').value.trim();if(!nameOk(n))return fm('Usuario no válido');if(n.toLowerCase()===net.name.toLowerCase())return fm('Ese eres tú');
  try{const q=await net.sb.from('profiles').select('id,name').eq('name_lower',n.toLowerCase()).maybeSingle();if(q.error)throw q.error;if(!q.data)return fm('No existe ese usuario');
   const ins=await net.sb.from('friends').insert({user_id:net.uid,friend_id:q.data.id});if(ins.error&&ins.error.code!=='23505')throw ins.error;
   friendsUI(ins.error?'Ya habías enviado una solicitud a '+q.data.name:'Solicitud enviada a '+q.data.name+'. Saldrá en tu lista cuando la acepte.')}catch(e){fm('Error de conexión')}};
 try{const [a,b]=await Promise.all([net.sb.rpc('friends_list'),net.sb.rpc('friend_requests')]);if(a.error)throw a.error;
  const fl=$('fl'),fq=$('fq');if(!fl)return;const rq=b.error?[]:(b.data||[]),rows=a.data||[];
  if(rq.length){fq.style.display='block';fq.innerHTML='<p style="margin:4px 0;color:#ffe14a">Solicitudes recibidas</p>'+rq.map(x=>`<div class='lr'><span><strong>${esc(x.name)}</strong> quiere ser tu amigo</span><button class='go tg' data-a='${esc(x.uid)}'>ACEPTAR</button><button class='x' data-r='${esc(x.uid)}'>×</button></div>`).join('');
   fq.querySelectorAll('[data-a]').forEach(bn=>bn.onclick=async()=>{bn.disabled=true;try{const r=await net.sb.from('friends').insert({user_id:net.uid,friend_id:bn.dataset.a});if(r.error&&r.error.code!=='23505')throw r.error;friendsUI('¡Ahora sois amigos!');reqDot()}catch(e){bn.disabled=false;fm('No se pudo aceptar')}});
   fq.querySelectorAll('[data-r]').forEach(bn=>bn.onclick=async()=>{try{await net.sb.rpc('friend_decline',{p_uid:bn.dataset.r})}catch(e){}friendsUI();reqDot()})}
  fl.innerHTML=rows.length?rows.map(x=>`<div class='lr' data-u='${esc(x.uid)}'><span><i class='od'></i><strong>${esc(x.name)}</strong><br><small>HOY ${x.td} m · ${x.tg} oro · RÉCORD ${x.ad} m</small></span><button class='x' data-u2='${esc(x.uid)}'>×</button></div>`).join(''):'Aún no tienes amigos. ¡Añade a alguien por su usuario!';
  fl.querySelectorAll('[data-u2]').forEach(bn=>bn.onclick=async()=>{try{await net.sb.from('friends').delete().eq('user_id',net.uid).eq('friend_id',bn.dataset.u2);await net.sb.rpc('friend_decline',{p_uid:bn.dataset.u2})}catch(e){}friendsUI()});
  markOnline()}
 catch(e){const fl=$('fl');if(fl)fl.textContent='No se pudo cargar la lista'}}
$('lmode').onclick=()=>{mode=mode==='daily'?'inf':'daily';ls.set('nb_mode',mode);lobby(1)};
$('lrank').onclick=boardUI;$('lfr').onclick=()=>friendsUI();$('irk').src=ico('rank',0,0);$('ifr').src=ico('friends',0,0);
/* ---------- fase 2: carreras en directo (Supabase Realtime) ---------- */
const RC={ch:null,onSync:null,host:0,st:{},gh:{},bots:[],tStart:0,seed:0,on:0,cd:0,cdIv:null,iv:null,quick:0,th:0,me:{d:0,a:1,f:0,ft:0},nb:null,hb:0,paid:0,pay:'',cl:0,spec:0,code:'',chat:[],rvb:null};
const botBase=T=>T<110?26*T+.1*T*T:4070+52*(T-110);
function botAt(b,T){if(T<0)T=0;const d=botBase(T)*b.f,e=d>=b.D;return{d:Math.min(d,b.D),a:e?0:1,f:e&&b.fin?1:0,x:10*Math.sin(T*.35+b.ph)}}
function mkBots(n,seed){const rg=mulb(seed^0xB07),nm=['Turbo','Rayo99','DriftKing','Pixel','Neon','Sombra','Kira','Max','Lola','Nitro','Zeta','Bruno'],o=[];
 for(let i=0;i<n;i++){const f=.85+rg()*.3,fin=rg()<.12,D=fin?END_D():Math.floor(1200+Math.pow(rg(),1.5)*15000),q=D/f,T=q<=4070?(-26+Math.sqrt(676+.4*q))/.2:110+(q-4070)/52;
  o.push({n:nm.splice(Math.floor(rg()*nm.length),1)[0],f,fin,D,ph:rg()*6,s:Math.floor(rg()*CARS.length),ft:RC.tStart+T*1000})}return o}
function mkGhost(n,s,bot){const g=new THREE.Group();buildCar(g,CARS[s]||CARS[0]);
 g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.material.depthWrite=false;o.castShadow=false}});
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(256,64,c=>{c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,256,64);c.fillStyle=bot?'#ffd23a':'#fff';c.font='bold 34px Arial,sans-serif';c.textAlign='center';c.fillText(n+(bot?' [BOT]':''),128,44,240)},1,1),transparent:true,depthTest:false}));
 sp.scale.set(7,1.75,1);sp.position.y=3.4;g.add(sp);g.visible=false;S.add(g);return g}
const raceHumans=()=>Object.entries(RC.ch?RC.ch.presenceState():{}).map(([u,v])=>Object.assign({u},v[0])).filter(x=>!x.sp);
function raceLeave(){clearInterval(RC.iv);clearInterval(RC.cdIv);RC.on=0;RC.cd=0;RC.onSync=null;for(const k in RC.gh)S.remove(RC.gh[k]);RC.gh={};RC.st={};RC.bots=[];
 if(RC.ch&&net.sb){try{net.sb.removeChannel(RC.ch)}catch(e){}}RC.ch=null;RC.host=0;RC.quick=0;RC.nb=null;RC.hb=0;RC.paid=0;RC.pay='';RC.cl=0;RC.spec=0;RC.code='';RC.chat=[];RC.rvb=null;{const sx=$('spx');if(sx)sx.style.display='none'}RC.me={d:0,a:1,f:0,ft:0};daily.rc=0;daily.on=false;const rk=$('rk');if(rk)rk.style.display='none'}
function raceJoin(name,host,onSync,spec){raceLeave();RC.onSync=onSync;RC.host=host?1:0;
 const ch=net.sb.channel(name,{config:{broadcast:{self:false},presence:{key:net.uid}}});RC.ch=ch;
 ch.on('presence',{event:'sync'},()=>{if(RC.onSync)RC.onSync()});
 ch.on('broadcast',{event:'c'},({payload:p})=>{if(p&&typeof p.n==='string')chatShow(p.n.slice(0,14),p.i|0)});
 ch.on('broadcast',{event:'s'},({payload:p})=>{if(p&&RC.spec&&!RC.on&&!RC.cd&&p.q)specBegin(p.q>>>0,+p.ts||0,p.nb|0);if(!p||p.u===net.uid||!RC.on)return;RC.st[p.u]={n:String(p.n).slice(0,14),d:+p.d||0,x:+p.x||0,y:+p.y||0,a:p.a?1:0,f:p.f?1:0,ft:+p.ft||0,s:p.s|0,t:Date.now()+net.off}});
 ch.on('broadcast',{event:'go'},({payload:p})=>{if(p&&p.t&&!RC.host&&!(st==='play'&&!RC.spec))raceCountdown(+p.t,p.seed>>>0,p.nb|0)});
 return new Promise(res=>ch.subscribe(async s=>{if(s==='SUBSCRIBED'){try{await ch.track({n:net.name,sel,h:host?1:0,sp:spec?1:0})}catch(e){}res(true)}else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED')res(false)}))}
function raceCountdown(t,seed,nb){if(RC.cd)return;if(RC.on)raceReset();RC.cd=1;RC.nb=nb==null?null:nb;RC.tStart=t;RC.seed=seed;
 const tick=()=>{if(!RC.cd){clearInterval(RC.cdIv);return}const left=t-(Date.now()+net.off);if(left<=0){RC.cd=0;clearInterval(RC.cdIv);raceBegin(seed);return}
  panel(`<h1>${Math.ceil(left/1000)}</h1><p>¡Prepárate! La carretera es igual para todos. Gana el que llegue más lejos sin morir.</p>`)};
 tick();RC.cdIv=setInterval(tick,200)}
function raceBegin(seed){if(RC.spec){specBegin(seed,RC.tStart,RC.nb==null?0:RC.nb);return}const T0=Date.now()+net.off,hs=raceHumans();RC.on=1;RC.me={d:0,a:1,f:0,ft:0};RC.st={};
 hs.forEach(h=>{if(h.u!==net.uid)RC.st[h.u]={n:String(h.n).slice(0,14),d:0,x:0,y:0,a:1,f:0,ft:0,s:h.sel|0,t:T0+8000}});
 RC.bots=mkBots(RC.nb==null?Math.max(0,4-hs.length):RC.nb,seed);
 daily.rc=1;daily.on=true;daily.seed=seed;daily.day='race';load();
 const rk=$('rk');if(rk)rk.style.display='block';
 RC.iv=setInterval(()=>{if(RC.ch&&RC.on)RC.ch.send({type:'broadcast',event:'s',payload:{u:net.uid,n:net.name,q:RC.seed,ts:RC.tStart,nb:RC.nb==null?0:RC.nb,d:Math.floor(RC.me.d),x:+car.x.toFixed(1),y:+car.y.toFixed(1),a:admin.used?0:RC.me.a,f:RC.me.f,ft:RC.me.ft,s:sel}})},160)}
function raceList(){const T=Date.now()+net.off,L=RC.spec?[]:[{n:net.name,me:1,d:Math.floor(RC.me.d),a:RC.me.a,f:RC.me.f,ft:RC.me.ft}];
 for(const u in RC.st){const s=RC.st[u];L.push({n:s.n,d:Math.floor(s.d),a:(!s.f&&T-s.t<=5000&&s.a)?1:0,f:s.f,ft:s.ft})}
 RC.bots.forEach(b=>{const q=botAt(b,(T-RC.tStart)/1000);L.push({n:b.n+' [BOT]',d:Math.floor(q.d),a:q.a,f:q.f,ft:b.ft})});
 L.sort((a,b)=>(b.f-a.f)||(a.f&&b.f?a.ft-b.ft:b.d-a.d));return L}
function racePay(L,mi){if(RC.paid)return;RC.paid=1;if(admin.used||L.length<2)return;const hum=1+Object.keys(RC.st).length,m=hum>=2?1:.4,rw=[[150,600],[90,350],[50,200]][mi];if(!rw)return;const c=Math.round(rw[0]*m),x=Math.round(rw[1]*m);wallet+=c;xp+=x;save();RC.pay='Premio por quedar #'+(mi+1)+': +'+c+' monedas y +'+x+' XP';pop('¡PODIO! +'+c+' monedas')}
function raceRender(){const L=raceList(),mi=L.findIndex(x=>x.me);if(!RC.paid&&!RC.me.a&&L.every(x=>!x.a))racePay(L,mi);
 const row=(x,i)=>`<div class='${x.me?'me ':''}${x.a?'':'dead'}'><span>${i+1}. ${esc(x.n)}</span><span>${x.f?'META':x.d+' m'}</span></div>`;
 const rk=$('rk');if(rk&&RC.on&&(st==='play'||st==='spec'))rk.innerHTML=L.slice(0,5).map(row).join('')+(mi>4?row(L[mi],mi):'');
 const rr=$('rres');if(rr)rr.innerHTML=L.map((x,i)=>`<div class='lr${x.me?' me':''}'><b>${i+1}</b><span>${esc(x.n)}</span><em>${x.f?'META':x.d+' m'}</em></div>`).join('')+(L.every(x=>!x.a)?`<p>Partida terminada. Tu puesto: <b>#${mi+1}</b> de ${L.length}</p>${RC.pay?'<p><b>'+RC.pay+'</b></p>':''}`:'<p>Esperando a que terminen los demás…</p>');const dn=L.every(x=>!x.a),rb=RC.rvb;if(rb){rb.style.display=dn&&(RC.quick||RC.host)?'inline-block':'none';rb.textContent=RC.quick?'OTRA PARTIDA':'REVANCHA'}}
function raceOver(fin){RC.me.a=0;RC.me.f=fin?1:0;RC.me.ft=Date.now()+net.off;RC.me.d=fin?END_D():Math.floor(dist);
 const g=$('go');if(g)g.style.display='none';$('mn').onclick=()=>{raceLeave();toMenu()};if(RC.ch){const b=document.createElement('button');b.className='go';b.id='rv';b.style.display='none';$('mn').before(b);RC.rvb=b;b.onclick=()=>{if(RC.quick){raceLeave();qmUI()}else if(RC.host)roomGo()};const cb=document.createElement('div');cb.innerHTML=chatBar();$('pn').appendChild(cb);chatWire()}const rk=$('rk');if(rk)rk.style.display='none';raceRender()}
function rcol(g,t){if(t<RC.cl||admin.nocol||st!=='play')return;const dz=g.position.z-car.z,dx=car.x-g.position.x;if(Math.abs(dz)<3.8&&Math.abs(dx)<2.3&&Math.abs(g.position.y-car.y)<1.6){RC.cl=t+.35;car.vx+=(dx>0?1:dx<0?-1:(NATIVE()<.5?-1:1))*16;speed*=.94;shake=Math.max(shake,.35);snd(160,.12,'square',.08,-60)}}
function raceTick(dt,t){if(!RC.on)return;const T=Date.now()+net.off;if(st==='play')RC.me.d=dist;
 for(const u in RC.st){const s=RC.st[u];let g=RC.gh[u];if(!g)g=RC.gh[u]=mkGhost(s.n,s.s,0);const vis=s.a&&!s.f&&T-s.t<3000&&(st==='play'||st==='spec');g.visible=!!vis;
  if(vis){if(!g.userData.i){g.position.set(s.x,s.y,-s.d);g.userData.i=1}else{const k=Math.min(1,dt*10);g.position.set(g.position.x+(s.x-g.position.x)*k,s.y,g.position.z+(-s.d-g.position.z)*k)}rcol(g,t)}}
 RC.bots.forEach((b,i)=>{const q=botAt(b,(T-RC.tStart)/1000);let g=RC.gh['b'+i];if(!g)g=RC.gh['b'+i]=mkGhost(b.n,b.s,1);g.visible=!!q.a&&(st==='play'||st==='spec');if(g.visible){g.position.set(q.x,0,-q.d);rcol(g,t)}});
 if(RC.spec&&st==='spec')specTick(dt,T);if(t-RC.th>.25){RC.th=t;raceRender()}}
/* menús online */
function onlineUI(msg){
 if(!net.ok||!net.name){panel(`<h1>ONLINE</h1><p>${net.ok?'Primero elige un usuario.':'El modo online no está disponible ahora mismo.'}</p><button class='go' id='bk'>VOLVER</button>`);$('bk').onclick=menu;return}
 panel(`<h1>ONLINE</h1><p>Carrera en directo: mismo mapa para todos, gana quien llegue más lejos sin morir (la meta está al final de Beirut). Los coches chocan entre sí y los 3 primeros ganan monedas y XP. En carrera pulsa 1-4 para decir frases.</p><p style='color:#ffe14a;min-height:22px'>${esc(msg||'')}</p><div class='row'><button class='go' id='qm'>PARTIDA RÁPIDA</button></div><div class='row'><button class='go alt' id='rm'>SALA CON CÓDIGO</button><button class='go alt' id='acc'>CUENTA</button></div><div class='row'><button class='go alt' id='evb'>EVENTOS</button><button class='go alt' id='bk'>VOLVER</button></div>`);
 $('qm').onclick=qmUI;$('rm').onclick=()=>roomUI();$('acc').onclick=()=>accountUI();$('evb').onclick=eventsUI;$('bk').onclick=menu}
async function qmUI(){const slot=Math.ceil((Date.now()+net.off+8000)/20000)*20000;
 panel(`<h1>BUSCANDO…</h1><p id='qinfo'>Conectando…</p><div class='bl' id='ql'></div><div class='row'><button class='go alt' id='qx'>CANCELAR</button></div>`);
 let live=1;$('qx').onclick=()=>{live=0;raceLeave();onlineUI()};
 const ok=await raceJoin('qm-'+slot,0,null);if(!live){raceLeave();return}if(!ok){onlineUI('No se pudo conectar');return}RC.quick=1;
 const iv=setInterval(()=>{if(!live||!$('qinfo')){clearInterval(iv);return}const left=Math.ceil((slot-(Date.now()+net.off))/1000),h=raceHumans();
  $('qinfo').textContent=left>0?'Jugadores: '+h.length+' · Salida en '+left+' s (se rellena con bots)':'¡Salimos!';
  $('ql').innerHTML=h.map(x=>`<div class='lr'><span>${esc(x.n)}</span></div>`).join('');
  if(left<=0){clearInterval(iv);live=0;raceCountdown(slot+3000,hstr('qm'+slot),null)}},400)}
function roomUI(msg){panel(`<h1>SALA</h1><p>Crea una sala y pásales el código a tus amigos, o escribe el código que te hayan dado.</p><div class='row'><button class='go' id='rc'>CREAR SALA</button></div><div class='cs2'><input class='inp' id='rin' maxlength='5' autocomplete='off' autocapitalize='characters' spellcheck='false' placeholder='CÓDIGO'><button class='go' id='rj'>UNIRSE</button><button class='go alt' id='rsp'>VER</button></div><p id='rmsg' style='min-height:22px;color:#ffe14a'>${esc(msg||'')}</p><div class='row'><button class='go alt' id='bk'>VOLVER</button></div>`);
 $('bk').onclick=()=>onlineUI();
 $('rc').onclick=()=>{const al='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<5;i++)c+=al[Math.floor(NATIVE()*al.length)];roomJoin(c,1)};
 $('rj').onclick=()=>roomJoin($('rin').value.trim().toUpperCase(),0);$('rsp').onclick=()=>specJoin($('rin').value.trim().toUpperCase())}
async function roomJoin(code,host){if(!/^[A-HJ-NP-Z2-9]{5}$/.test(code)){const m=$('rmsg');if(m)m.textContent='Código no válido (5 caracteres)';return}
 panel(`<h1>SALA ${code}</h1><p id='rinfo'>Conectando…</p><div class='bl' id='rl'></div><div class='row'><button class='go alt tg' id='rbt' style='display:none'>BOTS: NO</button><button class='go alt tg' id='rinv'>INVITAR AMIGOS</button></div><div class='bl' id='ri' style='max-height:130px'></div>${chatBar()}<div class='row'><button class='go' id='rs' style='display:none'>EMPEZAR</button><button class='go alt' id='rx'>SALIR</button></div>`);$('rbt').style.display=host?'inline-block':'none';$('rinv').onclick=()=>inviteUI(code);$('rbt').onclick=()=>{RC.hb=RC.hb?0:1;$('rbt').textContent=RC.hb?'BOTS: SÍ (hasta 4)':'BOTS: NO'};chatWire();
 let live=1;const t0=Date.now();$('rx').onclick=()=>{live=0;raceLeave();roomUI()};
 const draw=()=>{if(!live||!$('rl'))return;const h=raceHumans(),hh=h.some(x=>x.h);
  if(!hh&&Date.now()-t0>2500){live=0;raceLeave();roomUI('Esa sala no existe');return}
  $('rinfo').textContent=host?'Pasa este código a tus amigos: '+code:(hh?'Esperando a que el anfitrión empiece…':'Buscando sala…');
  $('rl').innerHTML=h.map(x=>`<div class='lr${x.u===net.uid?' me':''}'><span>${esc(x.n)}${x.h?' (anfitrión)':''}</span></div>`).join('');$('rs').style.display=host&&h.length>=1?'inline-block':'none'};
 const ok=await raceJoin('room-'+code,host,draw);if(!live){raceLeave();return}if(!ok){roomUI('No se pudo conectar');return}
 RC.code=code;$('rs').onclick=roomGo;
 setTimeout(draw,2600);draw()}
async function inviteUI(code){const box=$('ri');if(!box)return;box.textContent='Cargando…';try{const r=await net.sb.rpc('friends_list');if(r.error)throw r.error;const fr=r.data||[];if(!$('ri'))return;box.innerHTML=fr.length?fr.map(x=>`<div class='lr'><span>${esc(x.name)}</span><button class='go tg' data-u='${esc(x.uid)}'>INVITAR</button></div>`).join(''):'Aún no tienes amigos añadidos (botón AMIGOS del menú).';box.querySelectorAll('button').forEach(b=>b.onclick=()=>{sendInvite(b.dataset.u,code);b.textContent='ENVIADO';b.disabled=true})}catch(e){box.textContent='No se pudo cargar la lista'}}
async function sendInvite(uid,code){try{const ch=net.sb.channel('inv-'+uid);await new Promise(res=>{ch.subscribe(x=>{if(x==='SUBSCRIBED'||x==='CHANNEL_ERROR'||x==='TIMED_OUT'||x==='CLOSED')res()});setTimeout(res,3000)});await ch.send({type:'broadcast',event:'i',payload:{n:net.name,c:code}});setTimeout(()=>{try{net.sb.removeChannel(ch)}catch(e){}},600)}catch(e){}}
function inviteToast(n,c){if(st==='play'||RC.on)return;const d=document.createElement('div');d.className='invt';d.innerHTML="<b>"+esc(n)+"</b> te invita a una carrera<br><button class='go' id='iy'>UNIRSE</button> <button class='go alt' id='in'>NO</button>";document.body.appendChild(d);const rm=()=>d.remove();d.querySelector('#in').onclick=rm;d.querySelector('#iy').onclick=()=>{rm();if(st==='menu'&&!RC.on)roomJoin(c,0)};setTimeout(rm,30000)}
function inviteListen(){if(!net.ok||net.invCh)return;try{const ch=net.sb.channel('inv-'+net.uid);ch.on('broadcast',{event:'i'},({payload:p})=>{if(p&&typeof p.c==='string'&&/^[A-HJ-NP-Z2-9]{5}$/.test(p.c))inviteToast(String(p.n||'Alguien').slice(0,14),p.c)});ch.subscribe();net.invCh=ch}catch(e){}}
/* ---------- fase 3: cuenta, eventos, chat, espectador, revancha, amigos en línea ---------- */
const PH=['¡GG!','¡Vamos!','¡Otra!','¡Jaja!'];
function chatBar(){return "<div class='row'>"+PH.map((m,i)=>"<button class='go alt tg ch' data-i='"+i+"'>"+esc(m)+"</button>").join('')+"</div><p id='rcht' style='min-height:20px;font-size:15px;margin:4px 0'></p>"}
function chatWire(){document.querySelectorAll('.ch').forEach(b=>{b.onclick=()=>chatSend(+b.dataset.i)});const c=$('rcht');if(c)c.innerHTML=RC.chat.map(esc).join('<br>')}
function chatSend(i){if(!RC.ch||!PH[i])return;try{RC.ch.send({type:'broadcast',event:'c',payload:{n:net.name,i}})}catch(e){}chatShow(net.name,i)}
function chatShow(n,i){const m=PH[i|0];if(!m)return;RC.chat.push(n+': '+m);RC.chat=RC.chat.slice(-5);if(st==='play'||st==='spec')pop(n+': '+m);const c=$('rcht');if(c)c.innerHTML=RC.chat.map(esc).join('<br>')}
addEventListener('keydown',e=>{if(!RC.on||st!=='play'||e.repeat||(e.target&&e.target.tagName==='INPUT'))return;const k=e.code;if(k>='Digit1'&&k<='Digit4')chatSend(+k.slice(5)-1)});
function markOnline(){const o=net.onl?net.onl.presenceState():{};document.querySelectorAll('#fl .lr[data-u]').forEach(e=>e.classList.toggle('on',!!o[e.dataset.u]))}
function onlineListen(){if(!net.ok||net.onl)return;try{const ch=net.sb.channel('nb-online',{config:{presence:{key:net.uid}}});ch.on('presence',{event:'sync'},markOnline);ch.subscribe(async s=>{if(s==='SUBSCRIBED'){try{await ch.track({t:1})}catch(e){}}});net.onl=ch}catch(e){}}
function reqDot(){if(!net.ok||!net.name)return;net.sb.rpc('friend_requests').then(r=>{const d=$('fdot');if(d)d.classList.toggle('on',!r.error&&(r.data||[]).length>0)}).catch(()=>{})}
setInterval(()=>{if(st==='menu')reqDot()},30000);
function eventsUI(){panel("<h1>EVENTOS</h1><p><b>PRÓXIMAMENTE</b></p><p>Recorridos semanales con mapas especiales y premios exclusivos. ¡Muy pronto!</p><div class='row'><button class='go' id='bk'>VOLVER</button></div>");$('bk').onclick=()=>onlineUI()}
const ACC=n=>n.toLowerCase()+'@neonbuggy.app';
async function accountUI(msg){
 if(!net.ok||!net.name){panel("<h1>CUENTA</h1><p>Primero elige un usuario.</p><div class='row'><button class='go' id='bk'>VOLVER</button></div>");$('bk').onclick=()=>onlineUI();return}
 let prot=false;try{const u=(await net.sb.auth.getUser()).data.user;prot=!!(u&&u.email&&!u.is_anonymous)}catch(e){}
 panel("<h1>CUENTA</h1>"+(prot?"<p>Tu usuario <b>"+esc(net.name)+"</b> ya tiene contraseña. En otro dispositivo pulsa «YA TENGO USUARIO» al abrir el juego y escribe tu nombre y tu contraseña.</p>":"<p>Ponle contraseña a <b>"+esc(net.name)+"</b> para no perderlo y poder entrar desde otro móvil u ordenador. Las tablas y los amigos te siguen; las monedas y los coches se guardan en cada dispositivo.</p><input class='inp' id='pw1' type='password' maxlength='40' placeholder='Contraseña (mín. 6)' autocomplete='new-password'><input class='inp' id='pw2' type='password' maxlength='40' placeholder='Repite la contraseña' autocomplete='new-password' style='margin-top:8px'><p id='amsg' style='min-height:22px;color:#ffe14a'>"+esc(msg||'')+"</p><button class='go' id='pok'>GUARDAR CONTRASEÑA</button>")+"<div class='row'><button class='go alt' id='bk'>VOLVER</button></div>");
 $('bk').onclick=()=>onlineUI();
 if(!prot)$('pok').onclick=async()=>{const a=$('pw1').value,b=$('pw2').value,m=$('amsg');if(a.length<6){m.textContent='Mínimo 6 caracteres';return}if(a!==b){m.textContent='Las contraseñas no coinciden';return}$('pok').disabled=true;m.textContent='Guardando…';
  try{const r=await net.sb.auth.updateUser({email:ACC(net.name),password:a});if(r.error)throw r.error;const u=(await net.sb.auth.getUser()).data.user;if(u&&u.email&&!u.is_anonymous)accountUI();else{$('pok').disabled=false;m.textContent='Falta un ajuste en Supabase: desactiva «Confirm email» en Authentication > Sign In / Providers > Email.'}}
  catch(e){$('pok').disabled=false;m.textContent='No se pudo guardar: '+(e&&e.message?e.message:'error')}}}
function loginUI(msg){panel("<h1>YA TENGO USUARIO</h1><p>Escribe tu nombre y la contraseña que pusiste en CUENTA.</p><input class='inp' id='lun' maxlength='14' autocomplete='username' autocapitalize='off' spellcheck='false' placeholder='Usuario'><input class='inp' id='lpw' type='password' maxlength='40' autocomplete='current-password' placeholder='Contraseña' style='margin-top:8px'><p id='lmsg' style='min-height:22px;color:#ffe14a'>"+esc(msg||'')+"</p><button class='go' id='lgo2'>ENTRAR</button> <button class='go alt' id='lbk'>VOLVER</button>");
 $('lbk').onclick=()=>nameUI();
 const go=async()=>{const n=$('lun').value.trim(),p=$('lpw').value,m=$('lmsg');if(!nameOk(n)||!p){m.textContent='Escribe tu usuario y contraseña';return}$('lgo2').disabled=true;m.textContent='Entrando…';
  try{const r=await net.sb.auth.signInWithPassword({email:ACC(n),password:p});if(r.error)throw r.error;ls.set('nb_name',n);location.reload()}catch(e){$('lgo2').disabled=false;m.textContent='Usuario o contraseña incorrectos'}};
 $('lgo2').onclick=go;$('lpw').onkeydown=e=>{if(e.key==='Enter')go()}}
function raceReset(){clearInterval(RC.iv);RC.on=0;for(const k in RC.gh)S.remove(RC.gh[k]);RC.gh={};RC.st={};RC.bots=[];RC.paid=0;RC.pay='';RC.me={d:0,a:1,f:0,ft:0};RC.cl=0;RC.rvb=null}
function roomGo(){if(!RC.ch||!RC.host)return;const t=Date.now()+net.off+5000,seed=hstr('rm'+RC.code+t),nb=RC.hb?Math.max(0,4-raceHumans().length):0;RC.ch.send({type:'broadcast',event:'go',payload:{t,seed,nb}});raceCountdown(t,seed,nb)}
function specBegin(seed,ts,nb){if(RC.on)return;RC.on=1;RC.seed=seed;RC.tStart=ts;RC.nb=nb|0;RC.st={};RC.bots=mkBots(RC.nb,seed);daily.rc=1;daily.on=true;daily.seed=seed;daily.day='race';
 xaResetAll();puReset();Object.assign(car,{x:0,y:0,z:0,vx:0,vy:0,air:false,flip:0,pv:0});speed=0;dist=0;lastZi=-1;zoneSet(0);enemies.forEach(e=>S.remove(e.g));enemies=[];resetWorld();setLobby(false);
 $('over').classList.add('hide');$('lb').classList.add('hide');st='spec';$('spx').style.display='block';$('rk').style.display='block'}
function specTick(dt,T){let lead=-1,lx=0;for(const u in RC.st){const s=RC.st[u];if(s.a&&!s.f&&T-s.t<4000&&s.d>lead){lead=s.d;lx=s.x}}
 RC.bots.forEach(b=>{const q=botAt(b,(T-RC.tStart)/1000);if(q.a&&q.d>lead){lead=q.d;lx=q.x}});if(lead<0)lead=-car.z;
 const step=Math.max(-800*dt,Math.min(800*dt,(lead+car.z)*Math.min(1,dt*3)));car.z-=step;dist=-car.z;car.x+=(lx-car.x)*Math.min(1,dt*4);speed=Math.max(0,step/Math.max(dt,.001));car.y=gH(car.x,car.z);
 while(nextC*L<dist+230)genChunk(nextC++);while(chunks.length&&-(chunks[0].i+1)*L>car.z+40)purge(chunks.shift());zoneUpd(dt,dist);car3.visible=false}
async function specJoin(code){if(!/^[A-HJ-NP-Z2-9]{5}$/.test(code)){const m=$('rmsg');if(m)m.textContent='Código no válido (5 caracteres)';return}
 panel("<h1>VER "+code+"</h1><p id='sinfo'>Conectando…</p><div class='row'><button class='go alt' id='sx'>SALIR</button></div>");
 let live=1;$('sx').onclick=()=>{live=0;raceLeave();roomUI()};
 const ok=await raceJoin('room-'+code,0,null,1);if(!live){raceLeave();return}if(!ok){roomUI('No se pudo conectar');return}
 RC.spec=1;RC.code=code;const t0=Date.now(),iv=setInterval(()=>{if(!live||!$('sinfo')){clearInterval(iv);return}
  if(!raceHumans().some(x=>x.h)&&Date.now()-t0>2500){clearInterval(iv);live=0;raceLeave();roomUI('Esa sala no existe');return}
  $('sinfo').textContent='Esperando a que empiece la carrera… Jugadores: '+raceHumans().length},500)}
$('spx').onclick=()=>{raceLeave();toMenu()};

