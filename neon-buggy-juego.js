/* ======================================================================
   Neón Buggy Infinito · núcleo del juego
   Audio, escena, mundo por chunks, zonas, estado, bucle, skins, pase, lobby, Beirut.
   (script clásico: comparte variables con los demás neon-buggy-*.js; orden de carga en neon-buggy.html)
   ====================================================================== */
const NATIVE=Math.random.bind(Math);
const $=id=>document.getElementById(id),V3=THREE.Vector3,rr=(a,b)=>a+Math.random()*(b-a);
const XD={accM:1,brakeM:1,steerM:1,nitM:1,jumpM:1,flipM:1,dragM:1,grip:1,g:1,ts:1,carS:1,cap:3000,camD:1,camH:1,camX:0,camSm:6,fovAdd:0,shk:1,lit:1,fogM:1,formS:1,
 zMax:40,zRate:1,zSpd:1,zHp:1,aRows:10,aSpd:1,cMax:6,cSep:1,cFol:4,metRate:2,metSize:1,qkI:1,ci:1,chDur:0,pulseR:60,dkL:.1,glI:1,dkH:-1,dkDur:0,rnN:2,rnDur:15,rnInt:0};
const XP=Object.assign({},XD);
const XA={act:false,zom:false,zomT:0,armyRows:0,wvT:0,tkT:0,aChase:true,aEntry:'front',zSpawn:'front',mob:[],shells:[],kills:0,empty:false,chaos:false,chPaused:false,chT:0,chZ:false,gOn:false,
 dark:false,dkT:0,met:[],pool:[],vol:[],lb:[],ufo:[],zil:[],cr:[],ls:[],gl:[],rings:[],clones:[],cmode:'follow',qk:0,qd:0,mT:0,lT:0,vT:0,qT:0,uT:0,zT:0,tT:0,sT:0,gT:0,fT:0,gb:0,
 cat:{met:1,lava:1,vol:1,qk:1,ufo:1,zil:1,zom:0,tor:0,tsu:0,grav:0,glitch:1,flash:1},
 meteorRain:false,mrT:0,quakeOn:false,permNit:false,lightning:false,lgT:3,rain:false,filter:'',roadTint:false,camMode:'normal',
 tsE:1,effM:1,reqTxt:'1',frames:0,rdt:.016,lite:false,errs:[],skipAll:false,skipIntro:false,subs:true,intro:0,rnd:[],rnT:0,rnPaused:false,
 bgc:new THREE.Color(0x000000)};

const admin={inv:false,spd:1,fly:false,ghost:false,tur:false,form:'',free:false,nocol:false,used:false};let best=0;try{best=+localStorage.getItem('nb_inf')||0}catch(e){}
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let wallet=ls.get('nb_w',0),own=ls.get('nb_own',[0]),sel=ls.get('nb_sel',0),xp=ls.get('nb_xp',0),claimed=ls.get('nb_cl3',[]),gi=0,pw=[],enemies=[],eT=3;
const save=()=>{ls.set('nb_w',wallet);ls.set('nb_own',own);ls.set('nb_sel',sel);ls.set('nb_xp',xp);ls.set('nb_cl3',claimed);cloudDirty()};
const CARS=[
{n:'Solar',c1:0xffd23a,c2:0xff2bd6,cost:0,shape:0,perk:'Equilibrado. El coche de siempre.'},
{n:'Rayo',c1:0x19f2ff,c2:0xffffff,cost:150,shape:1,spd:4,perk:'Más rápido: +4 m/s de velocidad base.'},
{n:'Drift',c1:0xff2bd6,c2:0x19f2ff,cost:300,shape:1,steer:1.3,reg:2,perk:'Gira mucho más ágil y el turbo se recarga el doble de rápido.'},
{n:'Tanque',c1:0x7dff3a,c2:0x1a3a00,cost:500,shape:2,sh:1,perk:'Empiezas con 3 escudos. Aguanta más golpes.'},
{n:'Fantasma',c1:0xf0f0ff,c2:0x8a5cff,cost:800,shape:1,fan:1,perk:'Las cajas no te frenan y tras un choque eres invulnerable más tiempo.'},
{n:'Oro Real',c1:0xffc400,c2:0xffffff,cost:1500,shape:2,mag:1,spd:2,sh:1,perk:'Imán de monedas, +2 m/s y 3 escudos al empezar.'}];
if(!CARS[sel])sel=0;let CP=CARS[sel];
/* ---------- audio ---------- */
let AC,eng,engG,mg;
function initAudio(){try{if(AC)return;AC=new(window.AudioContext||window.webkitAudioContext)();{const _d=AC.destination;mg=AC.createGain();mg.gain.value=(typeof SET!=='undefined')?SET.vol:1;mg.connect(_d);Object.defineProperty(AC,'destination',{value:mg,configurable:true})}eng=AC.createOscillator();engG=AC.createGain();const f=AC.createBiquadFilter();f.frequency.value=500;eng.type='sawtooth';engG.gain.value=.02;eng.connect(f);f.connect(engG);engG.connect(AC.destination);eng.start()}catch(e){}}
/* el motor solo suena jugando: antes se quedaba zumbando al acabar la partida */
function engVol(){try{if(engG&&AC)engG.gain.setTargetAtTime(st==='play'&&!paused?.02:0,AC.currentTime,.08)}catch(e){}}
function snd(f,d,t,v,s){try{if(!AC)return;const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(30,f+(s||0)),n+d);g.gain.setValueAtTime(v||.06,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(e){}}
function nz(t0,f0,f1,dur,v,q){const n=AC.currentTime+t0,len=Math.max(1,AC.sampleRate*dur|0),buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.5);const s=AC.createBufferSource();s.buffer=buf;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=q||3;f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(f1,n+dur);const g=AC.createGain();g.gain.value=v;s.connect(f);f.connect(g);g.connect(AC.destination);s.start(n)}
/* aplastar una fruta: chapoteo húmedo en varias salpicaduras + golpe blando */
function squish(){try{if(!AC)return;nz(0,1500,250,.32,.9,4);nz(.07,2300,400,.2,.55,6);nz(.16,1100,200,.26,.5,5);const n=AC.currentTime,o=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain(),og=AC.createGain();o.type='sine';o.frequency.setValueAtTime(170,n);o.frequency.exponentialRampToValueAtTime(45,n+.28);lf.frequency.value=38;lg.gain.value=28;lf.connect(lg);lg.connect(o.frequency);og.gain.setValueAtTime(.35,n);og.gain.exponentialRampToValueAtTime(.001,n+.3);o.connect(og);og.connect(AC.destination);o.start(n);lf.start(n);o.stop(n+.32);lf.stop(n+.32)}catch(e){}}
/* ---------- escena ---------- */
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;document.body.prepend(R.domElement);
const S=new THREE.Scene();
const sk=document.createElement('canvas');sk.width=2;sk.height=256;{const c=sk.getContext('2d'),g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#05031a');g.addColorStop(.6,'#3a0f6b');g.addColorStop(1,'#ff2bd6');c.fillStyle=g;c.fillRect(0,0,2,256)}
const skT=new THREE.CanvasTexture(sk),FOG=new THREE.Fog(0xd2e8f8,80,250);S.background=skT;S.fog=FOG;
const cam=new THREE.PerspectiveCamera(62,1,.1,300);
const hemi=new THREE.HemisphereLight(0xdcebff,0x7a8a60,1);S.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d6,.9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:90});S.add(sun,sun.target);
function tex(w,h,fn,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;{const _m=Math.random;Math.random=NATIVE;try{fn(c.getContext('2d'))}finally{Math.random=_m}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(700,240),new THREE.MeshStandardMaterial({map:tex(64,64,c=>{c.fillStyle='#fff';c.fillRect(0,0,64,64);for(let i=0;i<300;i++){c.fillStyle='rgba(0,0,0,'+rr(.04,.14)+')';c.fillRect(rr(0,64),rr(0,64),rr(1,4),rr(1,4))}},175,60),roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;S.add(ground);
const road=new THREE.Mesh(new THREE.PlaneGeometry(28,240),new THREE.MeshStandardMaterial({map:tex(64,128,c=>{c.fillStyle='#3c3e43';c.fillRect(0,0,64,128);for(let i=0;i<260;i++){c.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+rr(.03,.09)+')';c.fillRect(rr(0,64),rr(0,128),1,1)}c.fillStyle='#f2f2f2';c.fillRect(3,0,1,128);c.fillRect(60,0,1,128);[16,32,48].forEach(x=>c.fillRect(x,0,1,48))},1,30),roughness:.9,metalness:0}));road.rotation.x=-Math.PI/2;road.position.y=.02;road.receiveShadow=true;S.add(road);
const rails=[-14.3,14.3].map(x=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.4,.6,240),new THREE.MeshStandardMaterial({color:0xaab0b8,metalness:.6,roughness:.4}));m.position.set(x,.3,0);S.add(m);return m});
/* ---------- geometrías y materiales compartidos ---------- */
const M=(c,e,ei,m,r)=>new THREE.MeshStandardMaterial({color:c,emissive:e||0,emissiveIntensity:ei||0,metalness:m==null?.3:m,roughness:r==null?.5:r});
const mCrate=M(0xc98b4e,0x502800,.3),mBar=M(0xff2b4a,0xff2b4a,.5),mRing=M(0xffd23a,0xffd23a,.6),mWall=M(0x2a1466,0xff2bd6,.3),mCoin=M(0xffd23a,0xffd23a,1,.6,.2),mNit=M(0x19f2ff,0x19f2ff,1),mShd=M(0xff2bd6,0xff2bd6,1),mBld=M(0x120a30,0x24104f,.5),mRamp=M(0xff2bd6,0xff2bd6,.3,.4,.4);
const gBox=new THREE.BoxGeometry(1,1,1),eBox=new THREE.EdgesGeometry(gBox),gCoin=new THREE.CylinderGeometry(.55,.55,.14,16),gOct=new THREE.OctahedronGeometry(.8),gBar=new THREE.CylinderGeometry(.7,.7,1.5,14),gRing=new THREE.CylinderGeometry(.74,.74,.22,14);gCoin.rotateX(Math.PI/2);
const lCy=new THREE.LineBasicMaterial({color:0x19f2ff}),lMg=new THREE.LineBasicMaterial({color:0xff2bd6});
function box(w,h,d,mat,line){const m=new THREE.Mesh(gBox,mat);m.scale.set(w,h,d);if(line)m.add(new THREE.LineSegments(eBox,line));m.castShadow=true;return m}
/* ---------- coche (frente hacia -z) ---------- */
const car3=new THREE.Group();
{const body=new THREE.Mesh(new THREE.BoxGeometry(2,.8,4),M(0xffd23a,0xffa200,.2,.5,.3)),cab=new THREE.Mesh(new THREE.BoxGeometry(1.6,.6,1.6),M(0x111133,0,0,.8,.1)),strip=new THREE.Mesh(new THREE.BoxGeometry(.3,.82,4.02),new THREE.MeshBasicMaterial({color:0xff2bd6})),spo=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,.5),M(0xff2bd6,0xff2bd6,.5));
  body.position.y=.75;cab.position.set(0,1.35,.3);strip.position.y=.75;spo.position.set(0,1.6,1.9);[body,cab].forEach(m=>m.castShadow=true);car3.add(body,cab,strip,spo);
  [-.7,.7].forEach(x=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.4,.25,.1),new THREE.MeshBasicMaterial({color:0xffffff}));l.position.set(x,.85,-2.02);car3.add(l)});
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.8,4.6),new THREE.MeshBasicMaterial({color:0xff2bd6,transparent:true,opacity:.45,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.08;car3.add(glow)}
const wg=new THREE.CylinderGeometry(.55,.55,.5,18);wg.rotateZ(Math.PI/2);
const wheels=[[1.15,-1.4],[-1.15,-1.4],[1.15,1.4],[-1.15,1.4]].map((p,i)=>{const m=new THREE.Mesh(wg,M(0x151525,0,0,.2,.8));const h=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.52,10),new THREE.MeshBasicMaterial({color:0x19f2ff}));h.rotation.z=Math.PI/2;m.add(h);m.position.set(p[0],.55,p[1]);m.castShadow=true;m.rotation.order='YXZ';car3.add(m);return m});
S.add(car3);
/* ---------- mundo por chunks ---------- */
const L=48;let chunks=[],objs=[],ramps=[],debris=[],parts=[],nextC=0,cur;
const rc={};
function rampMesh(H){if(!rc[H]){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(12,0);s.lineTo(12,H);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:8,bevelEnabled:false});g.translate(-6,0,-4);rc[H]={g,e:new THREE.EdgesGeometry(g)}}
  const m=new THREE.Mesh(rc[H].g,mRamp);m.add(new THREE.LineSegments(rc[H].e,lCy));m.rotation.y=Math.PI/2;m.castShadow=m.receiveShadow=true;return m}
function reg(m){S.add(m);cur.meshes.push(m)}
function crate(x,z){const m=box(1.6,1.6,1.6,mCrate,lCy);m.position.set(x,.8,z);reg(m);objs.push({k:'o',t:'crate',x,z,w:1.6,d:1.6,h:1.6,m,c:cur})}
function barrel(x,z){const m=new THREE.Mesh(gBar,mBar);m.add(new THREE.Mesh(gRing,mRing));m.castShadow=true;m.position.set(x,.75,z);reg(m);objs.push({k:'o',t:'barrel',x,z,w:1.4,d:1.4,h:1.5,m,c:cur})}
function pick(t,x,y,z){const m=new THREE.Mesh(t==='coin'?gCoin:gOct,t==='coin'?mCoin:t==='nit'?mNit:t==='shd'?mShd:puMat[t]);if(puMat[t]){const sp=new THREE.Sprite(puIcon(t));sp.scale.set(1.7,1.7,1);sp.renderOrder=5;m.add(sp);m.scale.setScalar(1.25)}m.position.set(x,y,z);reg(m);objs.push({k:'p',t,x,y,z,m,c:cur})}
function ramp(x,z,H){const m=rampMesh(H);m.position.set(x,0,z);reg(m);ramps.push({x,z,H,w:8,len:12,c:cur})}
function coins(x0,z,n,step,amp,y){for(let i=0;i<n;i++)pick('coin',Math.max(-12,Math.min(12,x0+Math.sin(i*.7)*amp)),y||.9,z-i*step)}
function gH(x,z){let h=0;for(const r of ramps)if(Math.abs(x-r.x)<r.w/2&&z<r.z+6&&z>r.z-6)h=Math.max(h,r.H*(r.z+6-z)/12);return h}
const P={
 coins(zc){coins(rr(-8,8),zc+10,8,2.6,rr(0,4));const q=Math.random();if(q<.22)pick('shd',rr(-9,9),1,zc-8);else if(q<.36)pick(['mag','x2','bub','slo'][Math.random()*4|0],rr(-9,9),1.2,zc-8)},
 crates(zc,d){const n=3+(d*4|0)+(Math.random()*3|0);for(let i=0;i<n;i++)crate(rr(-12,12),rr(zc-11,zc+11));coins(rr(-8,8),zc+9,6,3,0)},
 barrels(zc){const x=rr(-8,8),z=zc+rr(-4,4);barrel(x,z);crate(x-1.9,z);crate(x+1.9,z);crate(x,z-1.9);if(Math.random()<.6)barrel(rr(-10,10),zc+rr(-9,9));coins(rr(-8,8),zc+10,5,3,2)},
 ramp(zc){const x=rr(-6,6),H=Math.random()<.5?3:3.5;ramp(x,zc+6,H);for(let i=0;i<4;i++)pick('coin',x,H+2,zc-3-i*4)},
 jumpwall(zc){const x=rr(-6,6),H=3.5;ramp(x,zc+6,H);wall(0,zc-7,28);for(let i=0;i<3;i++)pick('coin',x,H+2.3,zc-5-i*2)},
 wallgap(zc,d){const g=[Math.random()*6|0];if(d>.4)g.push(Math.random()*6|0);for(let i=0;i<6;i++){const x=-13.5+4.5*i+2.25;if(g.includes(i)){pick('coin',x,.9,zc+5);pick('coin',x,.9,zc+2);pick('coin',x,.9,zc-1)}else wall(x,zc,4.5)}},
 slider(zc){wall(0,zc,6,{amp:rr(5,7),sp:rr(1,1.6),ph:rr(0,6)});coins(rr(-6,6),zc-4,5,2.6,3)}};
function genChunk(i){if(TUT.on)return genChunkTut(i);if(!daily.on)return genChunk0(i);const _r=Math.random;Math.random=mulb(daily.seed^Math.imul(i+1,2654435761));try{return genChunk0(i)}finally{Math.random=_r}}
function genChunk0(i){const c={i,meshes:[]};cur=c;const z0=-i*L,d=Math.min(1,i/30);
  for(let k=0;k<2;k++){const zc=z0-12-k*24;if(i<2){P.coins(zc)}else{const pool=['coins','crates','crates','barrels','ramp','ramp'];if(i>=2)pool.push('zebra','zebra');if(i>=3)pool.push('river');if(i>=3)pool.push('wallgap');if(i>=5)pool.push('jumpwall','jumpwall');if(i>=8)pool.push('slider');if(d>.5)pool.push('wallgap','barrels');P[pool[Math.random()*pool.length|0]](zc,d)}}
  if(i>=1&&Math.random()<.1)pick(['mag','x2','bub','slo'][Math.random()*4|0],rr(-9,9),1.2,z0-24);
  deco(i,z0);
  chunks.push(c)}
function purge(c){c.meshes.forEach(m=>S.remove(m));objs=objs.filter(o=>o.c!==c);ramps=ramps.filter(r=>r.c!==c);walkers=walkers.filter(w=>w.c!==c);blds=blds.filter(b=>b.c!==c);landers=landers.filter(l=>l.c!==c)}

/* ---------- zonas, ciudades y realismo ---------- */
const ZC=40,C3=h=>new THREE.Color(h);
const ZONES=[
{n:'VILLAPENE',k:'ciudad',g:0x6f8f4a,t:0x4f9be8,b:0xd2e8f8,lf:0x2f6e2a,li:1},
{n:'BURGOS',k:'campo',g:0xb9a74f,t:0x78aee0,b:0xf2e6bf,lf:0x7a8a3a,li:1.05},
{n:'MADRID',k:'ciudad',g:0x7a7a7e,t:0x3d4f86,b:0xf7ac6e,lf:0x4a7a3a,li:.8},
{n:'CUENCA',k:'campo',g:0x8a9a52,t:0x5aa0e0,b:0xe6efd8,lf:0x3f7a3a,li:1},
{n:'VALENCIA',k:'valencia',g:0xd7a45a,t:0x46a0ea,b:0xffe3ab,lf:0x6a7a2a,li:1.1},
{n:'MARRUECOS · ALHUCEMAS',k:'costa',g:0xe3c98a,t:0x3f9fee,b:0xd8f0fc,lf:0x3f8f3a,li:1.1},
{n:'MARRAKECH',k:'medina',g:0xc98a4a,t:0x46a0ea,b:0xffd9a0,lf:0x6a7a2a,li:1.1},
{n:'ARGELIA',k:'sahara',g:0xd9b36a,t:0x4aa0ea,b:0xffe0b0,lf:0x6a7a2a,li:1.15},
{n:'TÚNEZ',k:'costa',g:0xe8d9a8,t:0x3f9fee,b:0xd8f0fc,lf:0x3f8f3a,li:1.1,rf:0x2a6ab8},
{n:'LIBIA',k:'sahara',g:0xe0b878,t:0x5aa6ea,b:0xfff0c8,lf:0x6a7a2a,li:1.2},
{n:'EGIPTO',k:'egipto',g:0xe2c07a,t:0x4aa0ea,b:0xffe6b0,lf:0x4a7a2a,li:1.2},
{n:'ISRAEL',k:'ciudad',g:0xcdbf9a,t:0x4f9be8,b:0xe2eef6,lf:0x4a7a3a,li:1.05},
{n:'BEIRUT',k:'ciudad',g:0x8a8478,t:0x6a7890,b:0xd8b890,lf:0x4a7a3a,li:.85}];
ZONES.forEach(z=>{z.G=C3(z.g);z.T=C3(z.t);z.B=C3(z.b)});
const zoneOf=i=>ZONES[Math.floor(i/ZC)%ZONES.length];
const kG=new THREE.Color(),kT=new THREE.Color(),kB=new THREE.Color();let curLi=1,lastZi=-1,walkers=[],blds=[],landers=[],danaDone=false,arrDone=false,cn=null;
function drawSky(){const c=sk.getContext('2d'),g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#'+kT.getHexString());g.addColorStop(.75,'#'+kB.getHexString());g.addColorStop(1,'#'+kB.getHexString());c.fillStyle=g;c.fillRect(0,0,2,256);skT.needsUpdate=true;FOG.color.copy(kB);ground.material.color.copy(kG);hemi.intensity=1.05*curLi*XP.lit;sun.intensity=.95*curLi*XP.lit}
function zoneSet(i){const z=ZONES[i];kG.copy(z.G);kT.copy(z.T);kB.copy(z.B);curLi=z.li;drawSky()}
function zoneUpd(dt,d){if(!isFinite(d))d=0;const zi=Math.floor(d/(ZC*L))%ZONES.length,z=ZONES[zi],k=Math.min(1,dt*.9);if(zi!==lastZi){lastZi=zi;pop('📍 '+(TUT.on?'TUTORIAL NOOB':z.n))}kG.lerp(z.G,k);kT.lerp(z.T,k);kB.lerp(z.B,k);curLi+=(z.li-curLi)*k;drawSky()}
/* barreras de obra (siempre orientadas igual, sin líneas que parpadeen) */
const sM={};function stripeMat(w){const k=Math.round(w);return sM[k]=sM[k]||new THREE.MeshStandardMaterial({roughness:.6,map:tex(64,16,c=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,64,16);c.fillStyle='#d8262a';for(let x=-16;x<80;x+=32){c.beginPath();c.moveTo(x,16);c.lineTo(x+16,16);c.lineTo(x+32,0);c.lineTo(x+16,0);c.fill()}},Math.max(1,Math.round(w/2.5)),1)})}
const mCon=M(0xa9adb2,0,0,.1,.9),mLeg=M(0x6a6f75,0,0,.5,.5),mLamp=M(0xff9a1a,0xff7a00,1.2);
function wall(x,z,w,mv){const m=new THREE.Group(),b=box(w,.9,1.1,mCon),pn=box(w,1,.14,stripeMat(w)),lp=box(.4,.3,.4,mLamp);b.position.y=.45;pn.position.y=1.9;lp.position.y=2.55;m.add(b,pn,lp);
 [-1,1].forEach(q=>{const l=box(.16,1.1,.16,mLeg);l.position.set(q*(w/2-.3),1.45,0);m.add(l)});m.position.set(x,0,z);reg(m);
 objs.push({k:'o',t:'wall',x,z,w,d:1.2,h:2.4,m,c:cur,mv:mv?{bx:x,amp:mv.amp,sp:mv.sp,ph:mv.ph}:null})}
/* decorado */
const gCone=new THREE.ConeGeometry(1,1,7),gPyr=new THREE.ConeGeometry(1,1,4),gSph=new THREE.SphereGeometry(1,8,6),gCyl=new THREE.CylinderGeometry(1,1,1,7),mTr=M(0x5a3a22,0,0,0,1),mPole=M(0x555a60,0,0,.6,.5),mLmp=M(0xfff2c0,0xffe9a0,1),mSea=M(0x2f86c8,0,0,.4,.3);
const lm={},LM=c=>lm[c]=lm[c]||M(c,0,0,0,.9);
function mesh(g,mt,x,y,z,sx,sy,sz){const m=new THREE.Mesh(g,mt);m.position.set(x,y,z);m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);reg(m);return m}
function tree(x,z,Z,s){s=s||rr(.8,1.4);
 if(Z.k==='nieve'||(Z.k==='campo'&&Math.random()<.4)){mesh(gCyl,mTr,x,s,z,.25*s,2*s,.25*s);mesh(gCone,LM(Z.lf),x,s*3,z,1.6*s,4*s,1.6*s);if(Z.k==='nieve')mesh(gCone,LM(0xf4f8ff),x,s*4.2,z,s,2.2*s,s)}
 else{mesh(gCyl,mTr,x,s*1.2,z,.3*s,2.4*s,.3*s);mesh(gSph,LM(Z.lf),x,s*3.4,z,1.9*s,1.6*s,1.9*s)}}
function palm(x,z){const s=rr(.9,1.3);mesh(gCyl,mTr,x,3*s,z,.22*s,6*s,.22*s);for(let i=0;i<6;i++){const a=i*1.05,l=mesh(gBox,LM(0x2f8a2f),x+Math.cos(a)*1.6*s,6.1*s,z+Math.sin(a)*1.6*s,3.4*s,.12,.7);l.rotation.y=-a}}
function cactus(x,z){mesh(gCyl,LM(0x3a7a3a),x,1.6,z,.4,3.2,.4);mesh(gCyl,LM(0x3a7a3a),x+.8,2.3,z,.25,1.6,.25)}
function house(x,z,Z){const w=rr(5,8),h=rr(3.5,5);mesh(gBox,LM([0xf2ece0,0xe8d8b8,0xd9c9a8,0xf6f6f0][Math.random()*4|0]),x,h/2,z,w,h,w);const r=mesh(gPyr,LM(Z.k==='nieve'?0xdfe6ee:Z.rf||0xb5502f),x,h+1.4,z,w*.78,2.8,w*.78);r.rotation.y=Math.PI/4}
const bm={};function bldMat(fl,ci){const k=fl+'_'+ci;return bm[k]=bm[k]||new THREE.MeshStandardMaterial({color:[0xffffff,0xe8dcc8,0xc8d4e0][ci],roughness:.8,map:tex(64,128,c=>{c.fillStyle='#cfd0d4';c.fillRect(0,0,64,128);for(let y=4;y<128;y+=16)for(let x=6;x<64;x+=16){c.fillStyle=Math.random()<.3?'#ffe6a0':'#34445e';c.fillRect(x,y,9,10)}},1,fl/8)})}
function bld(x,z){const fl=[4,6,9,13][Math.random()*4|0],h=fl*3.2,w=rr(9,16);const m=mesh(gBox,bldMat(fl,Math.random()*3|0),x,h/2,z,w,h,w);blds.push({m,x,z,y0:h/2,h,sg:Math.random()<.5?1:-1,fall:0,c:cur})}
function mount(x,z,Z){const r=rr(28,50),h=rr(35,70);mesh(gCone,LM(Z.k==='nieve'?0x7a8a9a:/desierto|medina/.test(Z.k)?0xa8763a:0x5a7a50),x,h/2,z,r,h,r);if(Z.k==='nieve')mesh(gCone,LM(0xffffff),x,h*.8,z,r*.4,h*.4,r*.4)}
function lamp(x,z){const q=Math.sign(x);mesh(gCyl,mPole,x,3.5,z,.12,7,.12);mesh(gBox,mPole,x-q*1.3,7,z,2.6,.15,.15);mesh(gBox,mLmp,x-q*2.4,6.85,z,.8,.15,.4)}
function sea(z0){const p=new THREE.Mesh(new THREE.PlaneGeometry(100,L),mSea);p.rotation.x=-Math.PI/2;p.position.set(-92,.06,z0-L/2);reg(p)}
/* carteles de ciudades */
const sc={};function signTex(a,b,bg){const k=a+b+bg;return sc[k]=sc[k]||tex(512,192,c=>{c.fillStyle=bg;c.fillRect(0,0,512,192);c.strokeStyle='#fff';c.lineWidth=8;c.strokeRect(10,10,492,172);c.fillStyle='#fff';c.textAlign='center';c.font='bold 70px Arial,sans-serif';c.fillText(a,256,100,470);c.font='bold 44px Arial,sans-serif';c.fillText(b,256,158,470)},1,1)}
function gantry(z,a,b,bg){const pm=M(0x8a9098,0,0,.6,.5);[-15.5,15.5].forEach(x=>mesh(gBox,pm,x,6.5,z,.8,13,.8));mesh(gBox,pm,0,12.8,z,32,.5,.6);const p=new THREE.Mesh(new THREE.PlaneGeometry(18,6.75),new THREE.MeshBasicMaterial({map:signTex(a,b,bg)}));p.position.set(0,9.6,z+.4);reg(p)}
function deco(i,z0){const Z=zoneOf(i),m=i%ZC;
 if(m===0)gantry(z0-2,TUT.on?'TUTORIAL NOOB':Z.n,TUT.on?'¡A APRENDER!':'¡BIENVENIDO!','#1a4aa0');
 else if(m===ZC-12||m===ZC-4)gantry(z0-2,'→ '+zoneOf(i+ZC).n,kmTxt(Math.round(((ZC-m)*L-2)/10)*10),'#0a6b3a');
 if(Z.n==='MADRID'){if(m===ZC/2-1)gantry(z0-2,'PUERTA DEL SOL','KILÓMETRO 0 · MADRID','#1a4aa0');if(m===ZC/2)sol(z0-24);if(Math.abs(m-ZC/2)<=1)for(let b=0;b<7;b++)tent(rr(-12,12),z0-rr(2,L-2))}
 for(const q of [-1,1]){const zz=()=>z0-rr(1,L-1);lamp(q*15.8,z0-12);lamp(q*15.8,z0-36);
  if(Z.k==='ciudad'||Z.k==='valencia'){for(let b=0;b<3;b++)bld(q*rr(26,52),zz());if(Z.k==='valencia')cactus(q*rr(18,24),zz());else tree(q*rr(18,22),zz(),Z,.8)}
  else{if(Z.k==='costa'){if(q<0){sea(z0);if(Z.n==='MARRUECOS · ALHUCEMAS'){boat(-rr(46,54),zz());for(let b=0;b<3;b++)lander(-rr(30,42),zz())}}else{house(q*rr(26,48),zz(),Z);house(q*rr(26,48),zz(),Z)}for(let b=0;b<3;b++)palm(q*rr(18,28),zz())}
   else if(Z.k==='medina'){for(let b=0;b<4;b++)medina(q*rr(20,50),zz());for(let b=0;b<2;b++)palm(q*rr(18,26),zz());if(Math.random()<.5)minaret(q*rr(30,50),zz())}
   else if(Z.k==='sahara'){for(let b=0;b<3;b++)dune(q*rr(22,70),zz());if(Math.random()<.5)palm(q*rr(18,30),zz())}
   else if(Z.k==='egipto'){if(Math.random()<.6)pyr(q*rr(45,90),zz());for(let b=0;b<2;b++)dune(q*rr(22,70),zz());if(Math.random()<.6)palm(q*rr(18,28),zz())}
   else if(Z.k==='desierto'){for(let b=0;b<3;b++)cactus(q*rr(18,50),zz());if(Math.random()<.5)house(q*rr(26,48),zz(),Z)}
   else{for(let b=0;b<(Z.k==='nieve'?6:5);b++)tree(q*rr(19,60),zz(),Z);if(Math.random()<.5)house(q*rr(26,50),zz(),Z)}
   if(Math.random()<.7&&(Z.k!=='costa'||q>0)&&!/sahara|egipto/.test(Z.k))mount(q*rr(95,135),zz(),Z)}}}
/* pasos de cebra y abuelitas */
const zeG=new THREE.PlaneGeometry(28,4.2),zsG=new THREE.PlaneGeometry(1.7,1.7);
const mZeb=new THREE.MeshStandardMaterial({transparent:true,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false,map:tex(256,64,c=>{c.fillStyle='#f2f2f2';for(let x=3;x<256;x+=11)c.fillRect(x,0,6,64)},1,1)});
const mZs=new THREE.MeshBasicMaterial({map:tex(64,64,c=>{c.fillStyle='#1450b8';c.fillRect(0,0,64,64);c.fillStyle='#fff';c.beginPath();c.moveTo(32,6);c.lineTo(59,56);c.lineTo(5,56);c.closePath();c.fill();c.font='26px sans-serif';c.textAlign='center';c.fillText('🚶',32,50)},1,1)});
function granny(x,z){const g=new THREE.Group(),dr=LM([0x8a3b6b,0x3b6e8a,0x5a8a3b,0x9a5a2a,0x5a4a8a][Math.random()*5|0]),add=(ge,mt,px,py,pz,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(px,py,pz);o.scale.set(sx,sy,sz);g.add(o);return o};
 add(gCone,dr,0,.95,0,.5,1.1,.5);add(gSph,LM(0xf0c8a0),0,1.72,.1,.2,.2,.2);add(gSph,LM(0xeeeeee),0,1.84,.05,.22,.16,.22);add(gCyl,mTr,.45,.5,.15,.03,1,.03);add(gBox,LM(0x7a4a2a),-.4,.8,.1,.22,.28,.12);
 const l1=add(gBox,LM(0x3a3a44),-.12,.22,0,.12,.45,.14),l2=add(gBox,LM(0x3a3a44),.12,.22,0,.12,.45,.14);
 g.scale.setScalar(1.3);g.rotation.y=Math.random()<.5?Math.PI/2:-Math.PI/2;g.position.set(x,0,z);reg(g);
 walkers.push({g,l1,l2,x,z,v:(g.rotation.y>0?1:-1)*rr(1.6,2.6),ph:rr(0,6),hit:0,c:cur})}
P.zebra=function(zc){const p=new THREE.Mesh(zeG,mZeb);p.rotation.x=-Math.PI/2;p.position.set(0,.04,zc);p.renderOrder=1;reg(p);
 [-1,1].forEach(q=>{const sg=new THREE.Mesh(zsG,mZs);sg.position.set(q*15.4,2.4,zc+3);reg(sg);mesh(gCyl,mPole,q*15.4,1.2,zc+2.95,.06,2.4,.06)});
 const n=2+(Math.random()*3|0);for(let k=0;k<n;k++)granny(rr(-12,12),zc+rr(-1.2,1.2));coins(rr(-8,8),zc-6,4,3,2)};
function updWalkers(dt,t){for(const w of walkers){if(w.dead||Math.abs(w.z-car.z)>160)continue;w.x+=w.v*dt;
 if(Math.abs(w.x)>13){w.x=Math.sign(w.x)*13;w.v=-w.v;w.g.rotation.y=w.v>0?Math.PI/2:-Math.PI/2}
 if(w.hit>0)w.hit-=dt;
 else if(Math.abs(w.z-car.z)<2.8&&Math.abs(w.x-car.x)<1.9&&car.y<1.6){w.dead=true;w.g.visible=false;boom(w);speed*=.9;shake=.6;pop('¡SPLAT!');squish()}
 const hp=w.hit>1?Math.sin((1.5-w.hit)/.5*Math.PI)*1.1:0;w.g.position.set(w.x,hp+Math.abs(Math.sin(t*6+w.ph))*.05,w.z);const sw=Math.sin(t*7+w.ph)*.5;w.l1.rotation.x=sw;w.l2.rotation.x=-sw}}
zoneSet(0);

/* ---------- monstruo, sangre, cinemáticas y DANA ---------- */
const kmTxt=r=>r>=1000?(r/1000).toFixed(1)+' km':r+' m';
const mBlood=new THREE.MeshBasicMaterial({color:0x8a0010,transparent:true,opacity:.85,polygonOffset:true,polygonOffsetFactor:-3,depthWrite:false});
function boom(w){const p=new V3(w.x,1,w.z);burst(p,34,0xb00010,11);burst(p,14,0xffd2b0,9);burst(p,10,0xffd23a,12);const d=new THREE.Mesh(new THREE.CircleGeometry(rr(1.2,2.2),12),mBlood);d.rotation.x=-Math.PI/2;d.position.set(w.x,.05,w.z);d.renderOrder=1;S.add(d);w.c.meshes.push(d)}
const mon=new THREE.Group(),mgr=LM(0x3a9a3a),mrd=M(0xff2020,0xff0000,1);
{const a=(g,mt,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(g,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);mon.add(o);return o};
 a(gSph,mgr,0,20,0,8,13,7);a(gSph,mgr,0,35,2,5,5,5);a(gSph,mrd,-2,36,6.5,.9,.9,.9);a(gSph,mrd,2,36,6.5,.9,.9,.9);a(gBox,LM(0x111111),0,33,6.8,3.4,.7,.5);
 for(let i=0;i<5;i++)a(gCone,LM(0xffd23a),0,31-i*4,-6.5,1.6,3,1.6).rotation.x=-1.2;
 [-9,9].forEach(x=>{const o=a(gCyl,mgr,x,22,2,1.5,9,1.5);o.rotation.z=x>0?-.4:.4});
 mon.userData.l=[-4,4].map(x=>a(gCyl,mgr,x,6,0,2.4,12,2.4))}
mon.rotation.y=Math.PI;mon.visible=false;S.add(mon);
function monUpd(dt,t){for(const l of landers)if(Math.abs(l.z-car.z)<200){l.x+=2.2*dt;if(l.x>-22)l.x=-42;l.g.position.set(l.x,Math.abs(Math.sin(t*5+l.z))*.1,l.z)}
 mon.visible=!TUT.on&&st!=='menu'&&dist<ZC*L+200;if(!mon.visible)return;
 mon.position.set(-42,Math.abs(Math.sin(t*3))*.8,car.z-45+Math.sin(t*.5)*10);mon.userData.l.forEach((l,i)=>l.rotation.x=Math.sin(t*3+i*3.14)*.6);
 if(st==='play'&&Math.sin(t*3)>.985)shake=Math.max(shake,.3);
 for(const b of blds){if(!b.fall&&Math.abs(b.z-mon.position.z)<18)bldFall(b);
  if(b.fall>0&&b.m.visible){b.fall+=dt;const f=Math.min(1,b.fall/1.6);b.m.rotation.z=b.sg*f*1.4;b.m.position.y=b.y0-f*b.h*.45;
   if(Math.random()<.35)burst(new V3(b.x+rr(-5,5),b.y0+rr(-2,6),b.z+rr(-5,5)),1,Math.random()<.5?0xff6a1a:0x6a6258,4);
   if(f>=1){b.m.visible=false;rubble(b)}}}
 if(st==='play'||st==='cine'){roarT-=dt;if(roarT<=0){roarT=rr(7,11);roar(1);breathT=1.3}}
 if(breathT>0){breathT-=dt;burst(new V3(mon.position.x+rr(-1,1),34,mon.position.z-7),2,Math.random()<.5?0xff6a1a:0xffd23a,5,-30)}}
const flood=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x6b4a2a,transparent:true,opacity:.82,roughness:.2,metalness:.2}));flood.rotation.x=-Math.PI/2;flood.visible=false;S.add(flood);
const rainOn=v=>$('rain').style.display=v?'block':'none',fade=v=>$('fade').style.opacity=v;
function cineShow(){const q=cn.s[cn.i];$('cap').textContent=q.txt||'';$('alr').style.display=q.al?'block':'none';if(q.al){$('alr').innerHTML=q.al;snd(900,.4,'square',.07,-300)}}
function cine(steps,done){const _sk=XA.skipAll||(XA.skipIntro&&XA.intro);XA.intro=0;if(_sk){for(const q of steps){try{if(q.f)q.f(1,0,performance.now()/1000)}catch(e){}try{if(q.e)q.e()}catch(e){}}if(done)done();return}st='cine';cn={s:steps,i:0,t:0,done};$('cine').classList.add('on');document.body.classList.add('cn');cineShow()}
function cineTick(dt,t){if(!cn)return;cn.t+=dt;const q=cn.s[cn.i];if(q.f)q.f(Math.min(1,cn.t/q.d),dt,t);
 if(cn.t>=q.d){if(q.e)q.e();cn.i++;cn.t=0;if(cn.i>=cn.s.length){const d=cn.done;cn=null;$('cine').classList.remove('on');document.body.classList.remove('cn');if(d)d();return}cineShow()}}
addEventListener('pointerdown',()=>{if(cn)cn.t=99});addEventListener('keydown',e=>{if(cn&&(e.code==='Space'||e.code==='Enter'))cn.t=99});
const orb=(r,h,sp)=>(p,dt,t)=>{cam.position.set(car.x+Math.sin(t*sp)*r,h,car.z+Math.cos(t*sp)*r);cam.lookAt(car.x,1.5,car.z)};
function introCine(){XA.intro=1;cine([{d:3.2,txt:'Villapene, 07:42. Un día tranquilo… o eso parecía.',f:orb(9,2.5,.5)},
 {d:3.4,txt:'¡Un monstruo gigante está destrozando el pueblo!',f:()=>{cam.position.set(car.x+10,6,car.z+14);cam.lookAt(mon.position.x,18,mon.position.z);shake=.2;if(!cn.rz){cn.rz=1;roar(1.3);breathT=1.6}}},
 {d:2,txt:'¡Pisa a fondo y escapa!',f:orb(6,2,.9)}],()=>{st='play'})}
function warp(gz){const nd=(gz+1)*ZC*L;chunks.forEach(purge);chunks=[];objs=[];ramps=[];walkers=[];blds=[];debris.forEach(d=>S.remove(d.m));debris=[];enemies.forEach(e=>S.remove(e.g));enemies=[];car.z=-nd;car.y=0;car.air=false;car.vy=0;dist=nd;nextC=Math.floor(nd/L);while(nextC*L<nd+230)genChunk(nextC++);flood.visible=false;rainOn(0);zoneSet((gz+1)%ZONES.length);lastZi=-1}
function danaChk(){const gz=Math.floor(dist/(ZC*L)),zi=gz%ZONES.length;if(zi===11){if(!arrDone&&dist>=gz*ZC*L+120){arrDone=true;arrive()}}else arrDone=false;if(zi!==4){danaDone=false;return}if(!danaDone&&dist>=gz*ZC*L+ZC*L/2){danaDone=true;dana(gz)}}
function dana(gz){cine([{d:3.8,txt:'Centro de Valencia…',al:'<b>⚠ ES-ALERT · DANA</b><br>Valencia: evite desplazamientos y suba a zonas altas.',f:(p,dt,t)=>{rainOn(1);orb(10,3,.4)(p,dt,t)}},
 {d:5,txt:'¡El agua sube y se lo lleva todo!',f:p=>{flood.visible=true;flood.position.set(car.x,.1+p*2.4,car.z);cam.position.set(car.x+Math.sin(p*3)*8,5+p*2,car.z+10);cam.lookAt(car.x,1+p*2,car.z-10)}},
 {d:2.2,txt:'Todo se vuelve blanco…',f:p=>fade(p),e:()=>warp(gz)},
 {d:4.5,txt:'Marruecos · Bahía de Alhucemas. ¿Cómo has llegado hasta aquí?',f:(p,dt,t)=>{fade(1-p);orb(9,3,.35)(p,dt,t)},e:()=>fade(0)}],()=>{st='play'})}
/* ---------- estado ---------- */
const car={x:0,y:0,z:0,vx:0,vy:0,air:false,flip:0,pv:0};
let st='menu',speed=0,dist=0,shields=2,nitro=60,invul=0,combo=0,cT=0,coinsN=0,bonus=0,shake=0,airT=0,lastVy=0,spin=0;const keys={};
function resetWorld(){chunks.forEach(purge);chunks=[];objs=[];ramps=[];nextC=0;debris.forEach(d=>S.remove(d.m));debris=[];while(nextC*L<230)genChunk(nextC++)}
function load(){if(!daily.rc&&!TUT.on&&!ls.get('nb_tut',0)){tutOffer(()=>load());return}xaResetAll();puReset();acc=0;pSh=-1;admin.used=false;dsStop();roarT=6;breathT=0;zBr=0;if(!daily.rc){daily.on=mode==='daily'&&!TUT.on;if(daily.on){daily.day=dayStr();daily.seed=hstr('nb'+daily.day)}}Object.assign(car,{x:0,y:0,z:0,vx:0,vy:0,air:false,flip:0,pv:0});CP=CARS[sel]||CARS[0];pw=buildCar(car3,CP);speed=0;dist=0;shields=CP.sh?3:2;nitro=100;lastZi=-1;zoneSet(0);invul=0;enemies.forEach(e=>S.remove(e.g));enemies=[];eT=3;combo=0;coinsN=0;bonus=0;shake=0;resetWorld();ghostLoad();st='play';danaDone=false;arrDone=false;if(daily.rc||TUT.on)st='play';else introCine();$('over').classList.add('hide');$('lb').classList.add('hide');setLobby(false);initAudio()}
function panel(h,d){$('pn').style.maxWidth='';$('lb').classList.add('hide');$('pn').innerHTML=h;$('over').classList.remove('hide');$('over').classList.toggle('dock',!!d)}
function menuOld(){panel(`<h1>NEÓN BUGGY<br>INFINITO</h1><p>La carretera no se acaba nunca. Recoge monedas, rompe cajas, vuela barriles, salta las rampas y esquiva los muros. ¡Llega lo más lejos que puedas!</p><p><kbd>A D</kbd> girar · <kbd>W</kbd> turbo ∞ · <kbd>S</kbd> frenar · <kbd>ESPACIO</kbd> voltereta en el aire. En móvil usa los botones.</p><p>Tienes escudos: un choque con un muro te quita uno. Si no te quedan, se acabó.</p>${best?`<p>Récord: <b>${best} pts</b></p>`:''}<button class="go" id="go">ARRANCAR</button>`);$('go').onclick=load;$('go').focus()}
const score=()=>Math.floor(dist)+bonus;
function over(fin){st='end';wallet+=coinsN;xp+=score();save();snd(70,.7,'sawtooth',.2,-40);const s=score();let nb='';if(s>best){best=s;nb='<p><b>¡NUEVO RÉCORD!</b></p>';try{localStorage.setItem('nb_inf',best)}catch(e){}}
  panel(`<h1>${fin?'¡META!':'¡DESTROZADO!'}</h1><p>Distancia: <b>${Math.floor(dist)} m</b> · Monedas: <b>${coinsN}</b> · Cartera: <b>${wallet}</b><br>Puntos: <b>${s}</b></p>${nb}${daily.rc?"<div class='bl' id='rres'></div>":daily.on?"<p id='dres'>Guardando en la tabla…</p>":''}<button class="go" id="go">OTRA VEZ</button> <button class='go alt' id='mn'>MENÚ</button>`);$('go').onclick=load;$('mn').onclick=toMenu;$('go').focus();if(daily.rc)raceOver(fin);else if(daily.on){if(admin.used){const dr=$('dres');if(dr)dr.textContent='Partida con trucos de admin: no se guarda en la tabla.'}else submitRun(Math.floor(dist),coinsN)}}
function pop(t){const d=document.createElement('div');d.className='pop';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}
/* partículas y escombros */
const pg=new THREE.BoxGeometry(.28,.28,.28),pm={};
function burst(p,n,col,sp,vz){pm[col]=pm[col]||new THREE.MeshBasicMaterial({color:col});for(let i=0;i<n;i++){const m=new THREE.Mesh(pg,pm[col]);m.position.copy(p);S.add(m);parts.push({m,v:new V3((Math.random()-.5)*sp,Math.random()*sp,(Math.random()-.5)*sp+(vz||0)),l:.5+Math.random()*.5})}}
function smash(o,k){o.dead=true;debris.push({m:o.m,v:new V3(rr(-7,7),rr(6,11),-speed*rr(.8,1.2)),w:new V3(rr(-4,4),rr(-4,4),rr(-4,4)),l:2.5});burst(o.m.position,k||8,o.t==='barrel'?0xff6a1a:0xc99a5a,7)}
function hit(o){const p=new V3(o.x,.8,o.z);
  if(o.t==='crate'){smash(o);bonus+=25;if(!CP.fan)speed*=.94;shake=Math.max(shake,.25);snd(190,.1,'triangle',.08,-100)}
  else if(o.t==='barrel'){smash(o,20);bonus+=50;burst(p,24,0xffd23a,14);burst(p,14,0xff2b4a,10);for(const q of objs)if(!q.dead&&q.k==='o'&&q.t!=='wall'&&q!==o&&Math.hypot(q.x-o.x,q.z-o.z)<5){smash(q);bonus+=25}
    speed*=.85;if(!car.air){car.air=true;car.vy=8;lastVy=0}shake=.8;snd(110,.5,'sawtooth',.2,-80);pop('¡BOOM!')}
  else if(o.t==='tent'){o.dead=true;o.m.scale.y=.15;o.m.position.y=.15;bonus+=15;speed*=.98;burst(p,6,0xffffff,5);snd(220,.08,'triangle',.05,-80)}
  else if(o.t==='wall'){if(invul>0&&!admin.inv&&!(puT.bub>0))return;smash(o,16);burst(p,20,0x19f2ff,12);shake=1.2;snd(80,.4,'sawtooth',.2,-40);if(admin.inv||puT.bub>0)return;if(shields===0){over();return}shields--;invul=CP.fan?2.6:1.8;speed*=.5;if(!car.air){car.air=true;car.vy=7;lastVy=0}}}
function land(gh){const imp=-car.vy,tw=Math.PI*2;car.y=gh;car.air=false;car.vy=0;lastVy=0;
  if(car.flip>.6){const r=car.flip%tw,dd=Math.min(r,tw-r),n=Math.round(car.flip/tw);
    if(dd<1&&n>=1){const p=300*n;bonus+=p;nitro=Math.min(100,nitro+25);pop('¡VOLTERETA x'+n+'! +'+p);snd(500,.3,'square',.06,700)}
    else if(dd>=1){speed*=.55;shake=.7;pop('¡Mal aterrizaje!');snd(80,.3,'sawtooth',.12,-40)}}
  else if(airT>.7){const p=Math.round(airT*80);bonus+=p;pop('¡SALTO! +'+p)}
  car.pv+=((car.flip+Math.PI)%tw+tw)%tw-Math.PI;car.flip=0;
  if(imp>12){shake=Math.max(shake,.35);burst(new V3(car.x,.3,car.z),10,0x19f2ff,6)}}
/* ---------- control ---------- */
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=1;if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>keys[e.code]=0);addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
document.querySelectorAll('.tc button').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1;b.classList.add('on')});['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,()=>{keys[k]=0;b.classList.remove('on')}))});
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
/* ---------- pausa ---------- */
let paused=false,pOff=0,pStart=0,pzV=false;const pzb=$('pz');
function setPause(v){if(v===paused||(v&&st!=='play'))return;paused=v;
 if(v){pStart=performance.now()/1000;try{AC&&AC.suspend()}catch(e){}for(const k in keys)keys[k]=0;document.querySelectorAll('.tc button.on').forEach(b=>b.classList.remove('on'))}
 else{pOff+=performance.now()/1000-pStart;try{AC&&AC.resume()}catch(e){}}
 $('pau').classList.toggle('hide',!v)}
pzb.addEventListener('click',()=>setPause(true));
$('prs').onclick=()=>setPause(false);
$('pex').onclick=()=>{setPause(false);toMenu()};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.repeat)return;if(e.code==='KeyP'||e.code==='Escape'){if(paused||st==='play'){setPause(!paused);e.preventDefault()}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
/* ---------- bucle ---------- */
const clk=new THREE.Clock();let camP=new V3(0,5,12);
function frame(){requestAnimationFrame(frame);const rdt=Math.min(clk.getDelta(),.05),dt=rdt*(puT.slo>0?.5:1)*XA.tsE,t=performance.now()/1000-pOff;XA.rdt=rdt;XA.frames++;
  if(paused){R.render(S,cam);return}
  const pv=st==='play';if(pv!==pzV){pzV=pv;pzb.style.display=pv?'flex':'none'}
  if(st==='play'){
    const sIn=((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0),nitOn=!!(keys.KeyW||keys.ArrowUp||XA.permNit),brake=keys.KeyS||keys.ArrowDown;
    nitro=100;puUpd(rdt,dt);if(pSh<0)pSh=shields;if(shields<pSh)acc*=.35;pSh=shields;acc+=dt*.25*XP.accM;
    const _b=26+(CP.spd||0)+Math.min(22,dist/100)+acc+(nitOn?16*XP.nitM:0)-(brake?12*XP.brakeM:0),tgt=TUT.on?(brake?12:nitOn?42:28):Math.min(admin.spd>1?Infinity:XP.cap,Math.max(0,_b*admin.spd));XA.effM=_b>0?tgt/_b:1;speed+=(tgt-speed)*Math.min(1,dt*(tgt>speed?1.1*XP.accM:2.5*XP.dragM));if(admin.spd>1&&isFinite(tgt))speed=tgt;
    car.vx+=(sIn*(CP.steer||1)*XP.steerM*SET.steer*(car.air?11:17)*(.7+Math.min(speed,120)/90)-car.vx)*Math.min(1,dt*7*XP.grip);car.x+=car.vx*dt;if(admin.free)car.x=Math.max(-330,Math.min(330,car.x));else if(Math.abs(car.x)>13.2){car.x=Math.sign(car.x)*13.2;car.vx*=-.3;shake=Math.max(shake,.1)}
    car.z-=speed*dt;dist=-car.z;invul=Math.max(0,invul-dt);
    /* vertical */
    const gh=gH(car.x,car.z);
    if(admin.under){const up=(keys.KeyQ?1:0)-(keys.KeyE?1:0);car.air=true;car.vy+=((up?up*18:-14)-car.vy)*Math.min(1,dt*3);car.y=Math.max(-45,Math.min(60,car.y+car.vy*dt));car.flip=0;airT=0}else if(admin.fly){const up=(keys.KeyQ?1:0)-(keys.KeyE?1:0);car.air=true;car.vy+=(up*18-car.vy)*Math.min(1,dt*6);car.y=Math.max(gh,car.y+car.vy*dt);car.flip=0;airT=0;if(car.y<=gh&&car.vy<0)car.vy=0}
    else{if(!car.air){if(gh<car.y-.3){car.air=true;car.vy=Math.max(0,lastVy)*XP.jumpM;car.flip=0;airT=0}else{lastVy=(gh-car.y)/dt;car.y=gh}}
    if(car.air){car.vy-=30*XP.g*dt;car.y+=car.vy*dt;airT+=dt;if(keys.Space)car.flip+=7*XP.flipM*dt;if(car.y<=gh)land(gh)}}
    /* colisiones y recogidas */
    cT-=dt;if(cT<=0)combo=0;
    for(const o of objs){if(o.dead)continue;if(o.mv){o.x=o.mv.bx+o.mv.amp*Math.sin(t*o.mv.sp+o.mv.ph);o.m.position.x=o.x}const dz=Math.abs(o.z-car.z),sw=speed*dt;if(dz>5+sw)continue;
      if(o.mv){o.x=o.mv.bx+o.mv.amp*Math.sin(t*o.mv.sp+o.mv.ph);o.m.position.x=o.x}
      const dx=Math.abs(o.x-car.x);
      if(o.k==='p'){if(Math.hypot(dx,o.y-(car.y+.8),o.z>car.z?Math.max(0,dz-sw):dz)<(o.t==='coin'&&(puT.mag>0||CP.mag)?(puT.mag>0?6:4.5):2.2)){o.dead=true;S.remove(o.m);
        if(o.t==='coin'){combo++;cT=1.5;coinsN++;bonus+=10*Math.min(1+(combo/8|0),5)*(puT.x2>0?2:1);snd(700+Math.min(combo,12)*40,.08,'triangle',.05,300)}
        else if(o.t==='nit'){nitro=100;pop('¡TURBO LLENO!');snd(400,.2,'square',.05,500)}
        else if(o.t==='shd'){if(shields<3)shields++;pop('¡ESCUDO +1!');snd(520,.25,'triangle',.07,500)}else puGet(o.t)}}
      else if(!admin.nocol&&(o.z-car.z)>-(o.d/2+1.8)&&(o.z-car.z)<o.d/2+1.8+sw&&dx<o.w/2+1&&car.y<o.h-.25){hit(o);if(st!=='play')break}}
    if(st==='play'){
      updEnemies(dt,t);updWalkers(dt,t);zoneUpd(dt,dist);danaChk();if(daily.on&&dist>=END_D()){bonus+=2000;over(1)}if(nitOn&&Math.random()<.8)burst(new V3(car.x,car.y+.5,car.z+2.4),1,Math.random()<.5?0xff2bd6:0xffd23a,2,6);
      if(isFinite(dist)){if(dist-nextC*L>L*16){chunks.forEach(purge);chunks=[];objs=[];ramps=[];walkers=[];blds=[];nextC=Math.floor(dist/L)}let gn=0;while(nextC*L<dist+230&&gn++<40)genChunk(nextC++)}
      while(chunks.length&&-(chunks[0].i+1)*L>car.z+40)purge(chunks.shift());
      $('ds').textContent=Math.floor(dist);$('cn').textContent=coinsN;$('hp').textContent=shields?'♥'.repeat(shields):'—';$('nb').style.width=nitro+'%';$('kmh').textContent=Math.round(speed*3.6);
      if(engG){eng.frequency.value=50+Math.min(speed,110)*4+(nitOn?25:0)}}}
  /* movimiento visual del coche */
  if(st!=='end'||true){car3.position.set(car.x,car.y,car.z);
    const gF=gH(car.x,car.z-1.8),gB=gH(car.x,car.z+1.8),tp=car.air?Math.atan2(car.vy,Math.max(speed,10))*.8:Math.atan2(gF-gB,3.6);car.pv+=(tp-car.pv)*Math.min(1,dt*10);
    car3.rotation.set(car.pv+car.flip,0,-car.vx*.012);car3.visible=!(st==='play'&&(admin.ghost||admin.form))&&(admin.inv||puT.bub>0||invul<=0||Math.floor(t*12)%2===0);
    if(st==='play')spin-=speed*dt/.55;pw.forEach((w,i)=>w.rotation.set(spin,i<2?-car.vx*.025:0,0))}
  /* mundo */
  mWat.map.offset.x=t*.02;ground.position.z=Math.round(car.z/4)*4;road.position.z=Math.round(car.z/8)*8;rails.forEach(r=>r.position.z=car.z);
  for(const o of objs){if(o.dead||Math.abs(o.z-car.z)>140)continue;if(o.k==='p')o.m.rotation.y=t*3+o.z}
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.l-=dt;d.v.y-=25*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.w.x*dt;d.m.rotation.z+=d.w.z*dt;if(d.m.position.y<.4){d.m.position.y=.4;d.v.y*=-.4}if(d.l<=0||d.m.position.z>car.z+5){S.remove(d.m);debris.splice(i,1)}}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;p.v.y-=14*dt;p.m.position.addScaledVector(p.v,dt);p.m.scale.multiplyScalar(.97);if(p.l<=0){S.remove(p.m);parts.splice(i,1)}}
  /* cámara */
  shake=Math.max(0,shake-dt*2);
  if(st==='menu'){const a=.7+Math.sin(t*.6)*.5;cam.position.set(car.x+Math.sin(a)*8,2.6,car.z+Math.cos(a)*8);cam.lookAt(car.x,1.3,car.z);camP.set(0,5,car.z+12);if(lobbyG.visible){const dv=new V3(car.x-cam.position.x,0,car.z-cam.position.z),dl=dv.length();dv.normalize();rays.position.set(cam.position.x+dv.x*(dl+30),cam.position.y,cam.position.z+dv.z*(dl+30));rays.quaternion.copy(cam.quaternion);rays.rotateZ(t*.08);sparks.forEach((s,i)=>{s.rotation.y=t*2+i;s.position.y=s.userData.y+Math.sin(t*2+i)*.3})}}
  else{const tx=car.x*(admin.free?1:.7)+XP.camX,ty=car.y*.5+4.6*XP.camH+(admin.form==='godzilla'?5:admin.form==='granny'?2.5:0);camP.x+=(tx-camP.x)*Math.min(1,dt*XP.camSm);camP.y+=(ty-camP.y)*Math.min(1,dt*XP.camSm);camP.z=car.z+(admin.form==='godzilla'?22:admin.form==='granny'?15:11)*XP.camD;
    cam.position.set(camP.x+(Math.random()-.5)*shake*XP.shk,camP.y+(Math.random()-.5)*shake*XP.shk,camP.z);cam.lookAt(car.x*(admin.free?1:.9),car.y*.5+1.3,car.z-14)}
  const f=62+XP.fovAdd+Math.min(28,Math.max(0,speed-90)/80)+Math.min(speed,90)*.3+((keys.KeyW||keys.ArrowUp)&&nitro>0&&st==='play'?6:0);cam.fov+=(f-cam.fov)*.08;cam.updateProjectionMatrix();
  sun.position.set(car.x-14,30,car.z+10);sun.target.position.set(car.x,0,car.z);
  if(st==='cine')cineTick(dt,t);monUpd(dt,t);bombUpd(dt,t);fxUpd(dt,t);raceTick(dt,t);ghostTick(dt);tutTick(dt);engVol();R.render(S,cam)}
addEventListener('error',e=>{const h=$('hint');h.style.display='block';h.textContent='Error: '+e.message});
/* ---- skins, garaje, pase y enemigos ---- */
const mcache={},mbc={},mglc={};
const mc=(c,e)=>mcache[c+'_'+e]=mcache[c+'_'+e]||M(c,e,.25,.5,.3),mbf=c=>mbc[c]=mbc[c]||new THREE.MeshBasicMaterial({color:c}),mgl=c=>mglc[c]=mglc[c]||new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.45,depthWrite:false});
const gW=new THREE.CylinderGeometry(.55,.55,.5,18).rotateZ(Math.PI/2),gHb=new THREE.CylinderGeometry(.28,.28,.52,10).rotateZ(Math.PI/2),gPl=new THREE.PlaneGeometry(2.8,4.6),mWh=M(0x151525,0,0,.2,.8),mGl=M(0x111133,0,0,.8,.1);
function buildCar(g,s){g.clear();const sh=s.shape||0,ws=[],add=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(gBox,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;g.add(o)};
 add(2,sh===1?.6:.8,4,0,sh===1?.65:.75,0,mc(s.c1,s.c1));add(1.6,sh===2?.9:.6,sh===1?1.3:1.6,0,sh===2?1.6:sh===1?1.15:1.35,.3,mGl);add(.3,.82,4.02,0,.75,0,mbf(s.c2));add(2.2,.12,.5,0,sh===2?2.1:1.6,1.9,mc(s.c2,s.c2));
 [-.7,.7].forEach(x=>add(.4,.25,.1,x,.85,-2.02,mbf(0xffffff)));
 const gl=new THREE.Mesh(gPl,mgl(s.c1));gl.rotation.x=-Math.PI/2;gl.position.y=.08;g.add(gl);
 const k=sh===2?1.2:1;[[1.15,-1.4],[-1.15,-1.4],[1.15,1.4],[-1.15,1.4]].forEach(p=>{const w=new THREE.Mesh(gW,mWh);w.add(new THREE.Mesh(gHb,mbf(s.c2)));w.scale.setScalar(k);w.position.set(p[0],.55*k,p[1]);w.castShadow=true;w.rotation.order='YXZ';g.add(w);ws.push(w)});return ws}
function menuV2(){menuOld();pw=buildCar(car3,CARS[sel]);const w=document.createElement('p');w.innerHTML='🪙 <b>'+wallet+'</b> · Coche: <b>'+CARS[sel].n+'</b><br>Cuidado con los coches rivales: los rojos te persiguen. ¡Aplástalos cayendo encima desde una rampa!';$('pn').insertBefore(w,$('go'));const r=document.createElement('div');r.className='row';r.innerHTML="<button class='go alt' id='gar'>GARAJE</button><button class='go alt' id='pas'>PASE</button>";$('pn').appendChild(r);$('gar').onclick=()=>{gi=sel;garage()};$('pas').onclick=passUI}
function toMenu(){TUT.on=0;ghostClear();if(daily.rc||RC.ch)raceLeave();st='menu';puReset();dsStop();Object.assign(car,{x:0,y:0,z:0,vx:0,vy:0,air:false,flip:0,pv:0});speed=0;dist=0;invul=0;enemies.forEach(e=>S.remove(e.g));enemies=[];resetWorld();menu()}
function garage(){const c=CARS[gi],o=own.includes(gi);pw=buildCar(car3,c);car.pv=0;
 const act=o?(sel===gi?"<button class='go' disabled>EQUIPADO</button>":"<button class='go' id='eq'>EQUIPAR</button>"):`<button class='go' id='by'${wallet<c.cost?' disabled':''}>COMPRAR · ${c.cost} 🪙</button>`;
 panel(`<h1>GARAJE</h1><p>🪙 <b>${wallet}</b> monedas</p><div class='cs'><button class='ar' id='pv'>◀</button><div><b style='font-size:22px'>${c.n}</b><div class='perk'>${c.perk}</div></div><button class='ar' id='nx'>▶</button></div><div class='row'>${act}<button class='go alt' id='bk'>VOLVER</button></div>`,1);
 $('pv').onclick=()=>{gi=(gi+CARS.length-1)%CARS.length;garage()};$('nx').onclick=()=>{gi=(gi+1)%CARS.length;garage()};
 if($('eq'))$('eq').onclick=()=>{sel=gi;save();garage()};
 if($('by'))$('by').onclick=()=>{if(wallet>=c.cost){wallet-=c.cost;own.push(gi);sel=gi;save();snd(600,.2,'triangle',.07,500);garage()}};
 $('bk').onclick=menu}
const PASS=Array.from({length:40},(_,i)=>{const n=i+1,x=Math.round(1000*Math.pow(n,1.6)/100)*100;if(n===8)return{x,car:3};if(n===20)return{x,car:4};if(n===36)return{x,car:5};if(n%3===2)return{x,ch:[20*n+40,40*n+80]};return{x,c:Math.round((40+n*15)/10)*10}});
const dg={m:0},icC={};
function ico(k,a,b){const key=k+a+b;if(icC[key])return icC[key];const c=document.createElement('canvas'),W=k==='car'?160:96;c.width=W;c.height=96;const x=c.getContext('2d'),hx=n=>'#'+('000000'+n.toString(16)).slice(-6);
 const rrect=(X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
 x.lineJoin='round';x.strokeStyle='#12163a';
 if(k==='coin'){x.translate(48,48);const g=x.createRadialGradient(-12,-14,4,0,0,42);g.addColorStop(0,'#fff6a8');g.addColorStop(.5,'#ffd23a');g.addColorStop(1,'#e08a00');x.fillStyle=g;x.strokeStyle='#7a4300';x.lineWidth=6;x.beginPath();x.arc(0,0,40,0,7);x.fill();x.stroke();x.strokeStyle='#fff1a0';x.lineWidth=3;x.beginPath();x.arc(0,0,29,0,7);x.stroke();x.fillStyle='#e08a00';x.beginPath();for(let i=0;i<10;i++){const r=i%2?7:17,an=-Math.PI/2+i*Math.PI/5;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill();x.strokeStyle='#7a4300';x.lineWidth=2;x.stroke()}
 else if(k==='gift'){x.lineWidth=5;x.fillStyle='#ff2bd6';rrect(16,46,64,42,6);x.fill();x.stroke();x.fillStyle='#ff6be8';rrect(10,32,76,20,6);x.fill();x.stroke();x.fillStyle='#ffd23a';x.fillRect(42,32,12,56);x.strokeRect(42,32,12,56);
  [[34,20,-.5],[62,20,.5]].forEach(q=>{x.save();x.translate(q[0],q[1]);x.rotate(q[2]);x.beginPath();x.ellipse(0,0,13,8,0,0,7);x.fill();x.stroke();x.restore()});x.beginPath();x.arc(48,26,6,0,7);x.fill();x.stroke()}
 else if(k==='lock'){x.strokeStyle='#cfd6ff';x.lineWidth=9;x.beginPath();x.arc(48,40,20,Math.PI,0);x.stroke();x.fillStyle='#ffc53a';x.strokeStyle='#12163a';x.lineWidth=5;rrect(22,40,52,42,8);x.fill();x.stroke();x.fillStyle='#12163a';x.beginPath();x.arc(48,58,6,0,7);x.fill();x.fillRect(46,60,4,12)}
 else if(k==='rank'){x.lineWidth=5;[[8,52,24,36,'#c0c8e8'],[36,34,24,54,'#ffd23a'],[64,62,24,26,'#e0924a']].forEach(q=>{x.fillStyle=q[4];rrect(q[0],q[1],q[2],q[3],4);x.fill();x.stroke()});x.fillStyle='#ffd23a';x.beginPath();for(let i=0;i<10;i++){const r=i%2?5:11,an=-Math.PI/2+i*Math.PI/5;x.lineTo(48+Math.cos(an)*r,16+Math.sin(an)*r)}x.closePath();x.fill();x.stroke()}
 else if(k==='gear'){x.lineWidth=5;x.fillStyle='#cfd6ff';x.translate(48,48);for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.beginPath();x.rect(-9,-43,18,20);x.fill();x.stroke();x.restore()}x.beginPath();x.arc(0,0,30,0,7);x.fill();x.stroke();x.fillStyle='#12163a';x.beginPath();x.arc(0,0,12,0,7);x.fill()}
 else if(k==='medal'){x.lineWidth=5;x.fillStyle='#ff2bd6';x.beginPath();x.moveTo(22,6);x.lineTo(46,46);x.lineTo(30,52);x.lineTo(12,12);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(74,6);x.lineTo(50,46);x.lineTo(66,52);x.lineTo(84,12);x.closePath();x.fill();x.stroke();x.fillStyle='#ffd23a';x.beginPath();x.arc(48,62,27,0,7);x.fill();x.stroke();x.fillStyle='#e08a00';x.beginPath();for(let i=0;i<10;i++){const r=i%2?7:15,an=-Math.PI/2+i*Math.PI/5;x.lineTo(48+Math.cos(an)*r,62+Math.sin(an)*r)}x.closePath();x.fill()}
 else if(k==='globe'){x.lineWidth=5;x.fillStyle='#2f86c8';x.beginPath();x.arc(48,48,38,0,7);x.fill();x.stroke();x.strokeStyle='#bfe6ff';x.lineWidth=3;x.beginPath();x.ellipse(48,48,16,38,0,0,7);x.stroke();x.beginPath();x.moveTo(10,48);x.lineTo(86,48);x.moveTo(16,28);x.lineTo(80,28);x.moveTo(16,68);x.lineTo(80,68);x.stroke()}
 else if(k==='friends'){x.lineWidth=5;[[32,34,'#5fd0ff'],[62,40,'#ff6be8']].forEach(q=>{x.fillStyle=q[2];x.beginPath();x.arc(q[0],q[1]+34,20,Math.PI,0);x.fill();x.stroke();x.beginPath();x.arc(q[0],q[1],14,0,7);x.fill();x.stroke()})}
 else{x.lineWidth=5;x.fillStyle=hx(a);rrect(10,44,140,30,10);x.fill();x.stroke();x.fillStyle='#1c2a5a';x.beginPath();x.moveTo(42,44);x.lineTo(58,22);x.lineTo(108,22);x.lineTo(124,44);x.closePath();x.fill();x.stroke();
  x.fillStyle='#8fe8ff';x.beginPath();x.moveTo(52,42);x.lineTo(63,27);x.lineTo(80,27);x.lineTo(80,42);x.closePath();x.fill();x.beginPath();x.moveTo(86,42);x.lineTo(86,27);x.lineTo(104,27);x.lineTo(115,42);x.closePath();x.fill();
  x.fillStyle=hx(b);x.fillRect(14,56,132,6);x.fillRect(132,28,18,6);x.fillRect(138,34,5,10);x.fillStyle='#fff';x.fillRect(10,50,7,8);
  [44,118].forEach(cx=>{x.fillStyle='#151525';x.beginPath();x.arc(cx,76,15,0,7);x.fill();x.stroke();x.fillStyle=hx(b);x.beginPath();x.arc(cx,76,6,0,7);x.fill()})}
 return icC[key]=c.toDataURL()}
const pim=(k,a,b,cl)=>"<img class='"+cl+"' draggable='false' alt='' src='"+ico(k,a,b)+"'>";
function claimT(i){const p=PASS[i];if(claimed.includes(i)||xp<p.x)return 0;claimed.push(i);if(p.car!=null){if(!own.includes(p.car))own.push(p.car);return 'Coche: '+CARS[p.car].n}const n=p.c||Math.round(rr(p.ch[0],p.ch[1]));wallet+=n;return '+'+n+' monedas'}
function passUI(sx){const N=PASS.length,W=108,lv=PASS.filter(p=>xp>=p.x).length,pv=lv?PASS[lv-1].x:0,nx=PASS[lv]?PASS[lv].x:pv+1,f=lv>=N?0:(xp-pv)/(nx-pv),nc=PASS.filter((p,i)=>xp>=p.x&&!claimed.includes(i)).length;
 const dsc=p=>p.car!=null?'Coche '+CARS[p.car].n+': '+CARS[p.car].perk:p.ch?'Cofre sorpresa: entre '+p.ch[0]+' y '+p.ch[1]+' monedas':p.c+' monedas';
 const t=PASS.map((p,i)=>{const ok=xp>=p.x,dn=claimed.includes(i),ic=p.car!=null?pim('car',CARS[p.car].c1,CARS[p.car].c2,'ib'):p.ch?pim('gift',0,0,'ib'):pim('coin',0,0,'ib'),lb=p.car!=null?CARS[p.car].n:p.ch?p.ch[0]+'-'+p.ch[1]:p.c;
  return `<div class='tr${dn?' dn':ok?' ok':''}${i===lv?' cur':''}' data-i='${i}' style='animation-delay:${Math.min(i,14)*50}ms'><b class='nm'>${i+1}</b><div class='bx'>${dn?"<u class='ck'>✔</u>":''}<div class='ic'>${ic}</div></div><div class='rp'>${p.ch?pim('gift',0,0,'mi'):p.car!=null?'':pim('coin',0,0,'mi')}${lb}</div><div class='st'>${dn?'':ok?'¡COBRAR!':pim('lock',0,0,'mi')+p.x+' XP'}</div></div>`}).join('');
 panel(`<h1>PASE NEÓN</h1><div class='pxp'><b>Nv ${1+Math.floor(xp/1000)}</b><div class='pbar'><i style='width:${lv>=N?100:Math.round(f*100)}%'></i></div><span>${xp} XP</span></div><div class='trk' id='trk'><div class='trin'><i class='pl' id='pl'></i>${t}</div></div><p class='pdet' id='pdet'>${lv<N?'Siguiente · Nivel '+(lv+1)+': '+dsc(PASS[lv])+' ('+PASS[lv].x+' XP)':'¡Pase completado!'}</p><div class='row'><button class='go' id='all'>COBRAR TODO${nc?' ('+nc+')':''}</button><button class='go alt' id='bk'>VOLVER</button></div>`);
 $('pn').style.maxWidth='min(98vw,1000px)';const trk=$('trk');trk.scrollLeft=sx==null?0:sx;let dx0=0,dl0=0,dd=0;trk.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button===0){dd=1;dg.m=0;dx0=e.clientX;dl0=trk.scrollLeft}};trk.onpointermove=e=>{if(dd&&e.pointerType==='mouse'){const d=e.clientX-dx0;if(Math.abs(d)>5)dg.m=1;trk.scrollLeft=dl0-d}};trk.onpointerup=trk.onpointerleave=()=>{dd=0};trk.onwheel=e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){trk.scrollLeft+=e.deltaY;e.preventDefault()}};if(sx==null)setTimeout(()=>trk.scrollTo({left:Math.max(0,(Math.min(lv,N-1)-1)*W),behavior:'smooth'}),300);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{$('pl').style.width=Math.min(N*W,lv?(lv-1)*W+48+f*W:f*48)+'px'}));
 document.querySelectorAll('.tr').forEach(e=>e.onclick=()=>{if(dg.m)return;const i=+e.dataset.i,p=PASS[i];if(xp>=p.x&&!claimed.includes(i)){const r=claimT(i);e.classList.add('cl');save();snd(700,.2,'triangle',.07,500);pop(r);setTimeout(()=>passUI(trk.scrollLeft),520)}else $('pdet').textContent='Nivel '+(i+1)+': '+dsc(p)+(claimed.includes(i)?' · ¡Cobrado!':' ('+p.x+' XP)')});
 $('all').onclick=()=>{let n=0;PASS.forEach((p,i)=>{if(claimT(i))n++});if(n){save();snd(800,.3,'triangle',.08,500);pop(n+' recompensas');passUI(trk.scrollLeft)}};$('bk').onclick=menu}
/* enemigos */
const ENC=[[0x4a6bff,0xffd23a],[0x9a2bff,0x19f2ff],[0xff8a1a,0x111133]];
function spawnEnemy(){const ag=Math.random()<.35+Math.min(.3,dist/3000),col=ag?[0xff1a1a,0x000000]:ENC[Math.random()*3|0],g=new THREE.Group(),ws=buildCar(g,{c1:col[0],c2:col[1],shape:Math.random()<.5?0:2}),x=[-9,-3,3,9][Math.random()*4|0]+rr(-1,1),z=car.z-rr(110,150);g.position.set(x,0,z);S.add(g);enemies.push({g,ws,x,z,v:ag?speed*.78:rr(13,20),ag,ph:rr(0,6),dead:false})}
function toDebris(e,vz){e.dead=true;debris.push({m:e.g,v:new V3(rr(-6,6),rr(7,12),vz),w:new V3(rr(-6,6),rr(-6,6),rr(-6,6)),l:2.5})}
function stomp(e,gy){toDebris(e,-e.v);car.air=true;car.vy=11;lastVy=0;airT=0;bonus+=150;pop('¡APLASTADO! +150');burst(new V3(e.x,gy+1,e.z),18,0xffd23a,10);snd(300,.2,'square',.07,400);shake=.4}
function hitEnemy(e){toDebris(e,-speed*rr(.9,1.2));const p=new V3(e.x,1,e.z);burst(p,22,0xff6a1a,12);burst(p,10,0xffd23a,10);shake=1.1;snd(90,.4,'sawtooth',.2,-50);if(admin.inv||puT.bub>0)return;if(shields===0){over();return}shields--;invul=CP.fan?2.6:1.8;speed*=.55;if(!car.air){car.air=true;car.vy=6;lastVy=0}}
function updEnemies(dt,t){eT-=dt;if(eT<=0&&enemies.length<(dist>4000?3:2)){spawnEnemy();eT=Math.max(7,13-dist/400)+rr(0,5)}
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.dead){enemies.splice(i,1);continue}
  e.z-=e.v*dt;if(e.ag&&e.z>car.z-55&&e.z<car.z+8)e.x+=Math.sign(car.x-e.x)*Math.min(Math.abs(car.x-e.x),5*dt);else e.x+=Math.sin(t*.8+e.ph)*1.5*dt;
  e.x=Math.max(-12,Math.min(12,e.x));const gy=gH(e.x,e.z);e.g.position.set(e.x,gy,e.z);e.ws.forEach(w=>w.rotation.x-=e.v*dt/.55);
  if(!admin.nocol&&Math.abs(e.z-car.z)<3.6+speed*dt&&Math.abs(e.x-car.x)<2.1){if(car.y>gy+1.1)stomp(e,gy);else if(invul<=0||puT.bub>0){hitEnemy(e);if(st!=='play')return}}
  else if(e.z>car.z+25||e.z<car.z-260){S.remove(e.g);enemies.splice(i,1)}}}
/* pantalla de carga */
function loadScreen(){const tips=['Salta rampas y mantén ESPACIO para dar una voltereta…','Cae encima de los coches enemigos para aplastarlos…','Los coches rojos te persiguen. ¡Cuidado!','Los barriles explotan y lanzan todo por los aires…','Gana monedas para comprar coches nuevos con las flechas del menú…'];let p=0;const bar=$('lbi'),tx=$('lt');tx.textContent=tips[0];const iv=setInterval(()=>{p+=rr(6,14);bar.style.width=Math.min(100,p)+'%';tx.textContent=tips[Math.min(tips.length-1,Math.floor(p/21))];if(p>=100){clearInterval(iv);setTimeout(()=>{$('ld').classList.add('off');menu()},300)}},170)}
/* ---- lobby estilo Brawl ---- */
const lobbyG=new THREE.Group(),lobbyBg=new THREE.Color(0x3a1fb8),sparks=[];let skyTex=null,fogObj=null;
const rays=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({map:tex(512,512,c=>{c.fillStyle='#4a2bd0';c.fillRect(0,0,512,512);c.translate(256,256);for(let i=0;i<20;i++){c.fillStyle=i%2?'#5a38ea':'#3d22b5';c.beginPath();c.moveTo(0,0);c.arc(0,0,400,i*Math.PI/10,(i+1)*Math.PI/10);c.closePath();c.fill()}const g=c.createRadialGradient(0,0,0,0,0,300);g.addColorStop(0,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-256,-256,512,512)},1,1),fog:false,depthWrite:false}));rays.renderOrder=-1;lobbyG.add(rays);
const pd=(r,h,y,col)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),M(col,col,.15,.2,.5));m.position.y=y;m.receiveShadow=true;lobbyG.add(m)};pd(3.6,.6,-.3,0x3a2a8f);pd(5,.4,-.8,0x2a1a70);
const ring=new THREE.Mesh(new THREE.TorusGeometry(3.5,.14,8,48),new THREE.MeshBasicMaterial({color:0xffe14a}));ring.rotation.x=Math.PI/2;ring.position.y=.03;lobbyG.add(ring);
for(let i=0;i<14;i++){const s=new THREE.Mesh(gOct,i%3?mCoin:mNit);s.scale.setScalar(.35+Math.random()*.25);const a=rr(0,6.28),r=rr(5,10);s.position.set(Math.cos(a)*r,0,Math.sin(a)*r-1);s.userData.y=rr(.5,6);lobbyG.add(s);sparks.push(s)}
lobbyG.visible=false;S.add(lobbyG);
function setLobby(on){if(!skyTex){skyTex=S.background;fogObj=S.fog}lobbyG.visible=on;ground.visible=road.visible=!on;rails.forEach(r=>r.visible=!on);S.background=on?lobbyBg:skyTex;S.fog=on?null:fogObj;document.body.classList.toggle('lob',on);if(on){chunks.forEach(purge);chunks=[];objs=[];ramps=[];debris.forEach(d=>S.remove(d.m));debris=[]}}
function lobby(keep){if(!keep)gi=sel;const c=CARS[gi],o=own.includes(gi);$('lvl').textContent=1+Math.floor(xp/1000);$('xpb').style.width=(xp%1000)/10+'%';$('lco').textContent=wallet;$('pnm').textContent=net.name||'PILOTO';$('lmode').textContent=mode==='daily'?'RETO DIARIO · '+dayStr():'CARRERA INFINITA';$('lcn').textContent=c.n.toUpperCase();$('lcp').textContent=c.perk+(o?'':' · BLOQUEADO: '+c.cost+' monedas');$('pdot').classList.toggle('on',PASS.some((p,i)=>xp>=p.x&&!claimed.includes(i)));
 const g=$('lgo');g.textContent=o?'JUGAR':'COMPRAR · '+c.cost;g.disabled=!o&&wallet<c.cost;g.style.opacity=g.disabled?.5:1;
 CP=CARS[sel];pw=buildCar(car3,c);car.pv=0;st='menu';setLobby(true);$('over').classList.add('hide');$('lb').classList.remove('hide')}
function menu(){lobby();if(net.ready)net.ready.then(()=>{if(st!=='menu')return;$('pnm').textContent=net.name||'PILOTO';if(net.ok&&!net.name&&!asked){asked=1;nameUI()}else cloudPull()})}
function cyc(d){gi=(gi+d+CARS.length)%CARS.length;if(own.includes(gi)){sel=gi;save()}lobby(1)}
function lgoClick(){if(own.includes(gi)){sel=gi;save();load();return}const c=CARS[gi];if(wallet>=c.cost){wallet-=c.cost;own.push(gi);sel=gi;save();snd(600,.2,'triangle',.07,500);pop('¡Coche '+c.n+' comprado!');lobby(1)}}
function help(){panel(`<h1>CÓMO SE JUEGA</h1><p>La carretera es infinita. Recoge monedas, rompe cajas, salta rampas y esquiva muros.</p><p>A/D girar · W turbo ∞ · S frenar · ESPACIO voltereta en el aire. En móvil usa los botones.</p><p>¡Cae encima de los coches rivales para aplastarlos! Respeta los pasos de cebra: cuidado con las abuelitas.</p><button class='go' id='bk'>ENTENDIDO</button>`);$('bk').onclick=menu}
$('lgo').onclick=lgoClick;$('lpass').onclick=passUI;$('lhelp').onclick=help;$('lpv').onclick=()=>cyc(-1);$('lnx').onclick=()=>cyc(1);
/* ---------- Sol, tiendas, medina, desembarco y llegada ---------- */
const solTex=tex(64,64,c=>{c.fillStyle='#fff';c.beginPath();c.arc(32,32,30,0,7);c.fill();c.strokeStyle='#000';c.lineWidth=3;c.stroke();c.beginPath();c.moveTo(32,32);c.lineTo(32,10);c.moveTo(32,32);c.lineTo(46,38);c.stroke()},1,1);
const flagTex=tex(64,40,c=>{c.fillStyle='#c8102e';c.fillRect(0,0,64,40);c.fillStyle='#ffc400';c.fillRect(0,10,64,20);c.fillStyle='#8a5a2a';c.fillRect(26,15,12,10)},1,1),mFlag=new THREE.MeshBasicMaterial({map:flagTex,side:THREE.DoubleSide}),gFlag=new THREE.PlaneGeometry(1.6,1);
function sol(z){mesh(gBox,LM(0xe6d3b0),-36,7,z,26,14,16);mesh(gBox,LM(0xd9c4a0),-36,16,z,6,8,6);const f=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({map:solTex}));f.position.set(-32.9,17,z);f.rotation.y=Math.PI/2;reg(f);mesh(gPyr,LM(0x3a4a5a),-36,22,z,5,5,5).rotation.y=Math.PI/4}
function tent(x,z){const m=mesh(gPyr,LM([0xff8a1a,0x2a7ae0,0x3aa84a,0xffd23a][Math.random()*4|0]),x,.9,z,1.8,1.8,1.8);m.rotation.y=Math.PI/4;objs.push({k:'o',t:'tent',x,z,w:2.6,d:2.6,h:1.8,m,c:cur})}
function medina(x,z){const w=rr(6,10),h=rr(4,8);mesh(gBox,LM([0xc4663a,0xd08050,0xb8583a][Math.random()*3|0]),x,h/2,z,w,h,w);mesh(gBox,LM(0x8a3a22),x,h+.25,z,w*.9,.5,w*.9)}
function minaret(x,z){mesh(gBox,LM(0xd8a060),x,11,z,3.5,22,3.5);mesh(gPyr,LM(0x2a8a6a),x,24.5,z,3,5,3).rotation.y=Math.PI/4;mesh(gSph,LM(0xffd23a),x,27.5,z,.6)}
function dune(x,z){mesh(gSph,LM(0xe6c27a),x,0,z,rr(8,16),rr(2,5),rr(8,16))}
function pyr(x,z){const r=rr(28,45);mesh(gPyr,LM(0xd8b872),x,r*.45,z,r,r*.9,r).rotation.y=Math.PI/4}
function boat(x,z){mesh(gBox,LM(0x6a7078),x,.6,z,3.4,1.4,9);mesh(gBox,LM(0x4a5058),x,1.6,z+2,2,1,2.5)}
function lander(x,z){const g=new THREE.Group(),add=(ge,mt,px,py,pz,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(px,py,pz);o.scale.set(sx,sy,sz);g.add(o);return o};
 add(gCyl,LM(0xb5a46a),0,.85,0,.28,1.7,.28);add(gSph,LM(0xf0c8a0),0,1.9,0,.22,.22,.22);add(gCyl,LM(0x5a4a2a),0,2.05,0,.3,.12,.3);add(gCyl,mTr,.35,2.2,0,.03,3.2,.03);
 add(gFlag,mFlag,.35,3.3,.8,1,1,1).rotation.y=Math.PI/2;g.scale.setScalar(1.3);g.position.set(x,0,z);reg(g);landers.push({g,x,z,c:cur})}
function arrive(){cine([{d:3.5,txt:'Después de miles de kilómetros por el Mediterráneo…',f:orb(9,3,.4)},{d:3.5,txt:'¡Has llegado a Israel! Siguiente parada: Beirut…',f:orb(7,2.5,.6)}],()=>{st='play';bonus+=2000;pop('🏁 ¡LLEGASTE! +2000')})}
/* ---------- Beirut: bombas ---------- */
const bombs=[],gBomb=new THREE.SphereGeometry(.7,10,8),gWarn=new THREE.RingGeometry(3.4,4.6,24),mBomb=M(0x222428,0,0,.6,.4),mWarn=new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});let bT=2,bw=0;
function bombUpd(dt,t){if(st!=='play'){while(bombs.length){const o=bombs.pop();S.remove(o.w);S.remove(o.b)}bw=0;return}
 const zi=Math.floor(dist/(ZC*L))%ZONES.length;if(zi!==12){bw=0;return}
 if(!bw){bw=1;pop('⚠ ¡ESQUIVA LAS BOMBAS!')}
 bT-=dt;if(bT<=0){bT=Math.max(.7,rr(.9,1.8)-dist/20000);const x=Math.max(-12,Math.min(12,car.x+rr(-7,7))),z=car.z-speed*2.2+rr(-6,6),w=new THREE.Mesh(gWarn,mWarn),b=new THREE.Group(),f=new THREE.Mesh(gBox,mBomb);
  w.rotation.x=-Math.PI/2;w.position.set(x,.08,z);S.add(w);f.scale.set(.9,.12,.9);f.position.y=.8;b.add(new THREE.Mesh(gBomb,mBomb),f);b.position.set(x,45,z);S.add(b);bombs.push({w,b,x,z,t:0});snd(1200,.9,'sawtooth',.03,-900)}
 mWarn.opacity=.35+.3*Math.sin(t*14);
 for(let i=bombs.length-1;i>=0;i--){const o=bombs[i];o.t+=dt;o.b.position.y=45*(1-Math.min(1,o.t/2));
  if(o.t>=2){S.remove(o.w);S.remove(o.b);bombs.splice(i,1);const p=new V3(o.x,1,o.z);burst(p,30,0xff6a1a,14);burst(p,16,0xffd23a,12);burst(p,14,0x333333,9);shake=Math.max(shake,1.3);snd(70,.6,'sawtooth',.22,-40);
   if(Math.hypot(o.x-car.x,o.z-car.z)<5.2&&car.y<3&&!admin.inv&&!(puT.bub>0)&&invul<=0){if(shields===0){over();return}shields--;invul=1.8;speed*=.6;pop('¡BOMBA!')}}}}
