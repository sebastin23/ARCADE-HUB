/* ======================================================================
   Neón Buggy Infinito · panel admin
   Power-ups, poderes, desastres, caos, cámaras, presets y panel (Konami o 5 toques + contraseña).
   (script clásico: comparte variables con los demás neon-buggy-*.js; orden de carga en neon-buggy.html)
   ====================================================================== */
/* ---------- power-ups, rugidos, poderes de admin y desastres ---------- */
let acc=0,pSh=-1,roarT=6,breathT=0,zBr=0;
const puT={mag:0,x2:0,bub:0,slo:0},PUD={mag:[10,'🧲','IMÁN'],x2:[12,'⭐','PUNTOS x2'],bub:[8,'🫧','ESCUDO'],slo:[6,'⏳','CÁMARA LENTA']};
const puMat={mag:M(0xff5a1a,0xff5a1a,1),x2:M(0x7bff3a,0x7bff3a,1),bub:M(0x66ccff,0x66ccff,1),slo:M(0xb06bff,0xb06bff,1)},puSpr={};
function puIcon(t){if(!puSpr[t]){const mp=tex(64,64,c=>{c.font='46px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(PUD[t][1],32,36)});puSpr[t]=new THREE.SpriteMaterial({map:mp,transparent:true,depthTest:false})}return puSpr[t]}
function puReset(){for(const k in puT)puT[k]=0}
function puGet(t){puT[t]=PUD[t][0];pop(PUD[t][1]+' '+PUD[t][2]+'!');snd(600,.25,'triangle',.07,700)}
function puUpd(rdt,dt){for(const k in puT)if(puT[k]>0)puT[k]=Math.max(0,puT[k]-rdt);
  if(puT.x2>0)bonus+=speed*dt; /* doble puntos: la distancia cuenta el doble */
  if(puT.mag>0){for(const o of objs){if(o.dead||o.k!=='p'||o.t!=='coin')continue;const dz=car.z-o.z,dx=car.x-o.x;if(Math.abs(dz)>18||Math.abs(dx)>18)continue;if(Math.hypot(dx,dz)<15){const k=Math.min(1,dt*9);o.x+=dx*k;o.z+=dz*k;o.m.position.x=o.x;o.m.position.z=o.z}}}}
function puHud(){const e=$('pu');if(!e)return;let h='';if(st==='play')for(const k in puT)if(puT[k]>0)h+='<span>'+PUD[k][1]+' '+Math.ceil(puT[k])+'s</span>';if(e._h!==h){e.innerHTML=h;e._h=h}}
const bubM=new THREE.Mesh(new THREE.SphereGeometry(2.6,16,12),new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.28,depthWrite:false}));bubM.visible=false;S.add(bubM);
/* rugido de Godzilla (sintetizado, sin archivos) */
function roar(v){try{if(!AC)return;v=v||1;const n=AC.currentTime,d=1.7*v,o=AC.createOscillator(),o2=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain(),f=AC.createBiquadFilter();
  o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(80,n);o.frequency.linearRampToValueAtTime(170,n+.25);o.frequency.exponentialRampToValueAtTime(45,n+d);
  o2.frequency.setValueAtTime(55,n);o2.frequency.exponentialRampToValueAtTime(32,n+d);lf.frequency.value=24;lg.gain.value=28;lf.connect(lg);lg.connect(o.frequency);
  f.type='lowpass';f.frequency.setValueAtTime(1100,n);f.frequency.exponentialRampToValueAtTime(220,n+d);
  g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.3*v,n+.12);g.gain.exponentialRampToValueAtTime(.001,n+d);
  o.connect(f);o2.connect(f);f.connect(g);g.connect(AC.destination);[o,o2,lf].forEach(x=>{x.start(n);x.stop(n+d+.05)});nz(0,1100,160,d*.9,.5,1)}catch(e){}}
function bldFall(b){b.fall=.001;burst(new V3(b.x,6,b.z),14,0x998877,10);snd(70,.5,'sawtooth',.12,-30)}
function rubble(b){const w=Math.max(8,b.h*.35),m=new THREE.Mesh(gBox,LM(0x4a4238));m.scale.set(w*1.1,2.2,w*1.1);m.position.set(b.x,1.1,b.z);m.rotation.y=rr(0,3);S.add(m);if(b.c&&b.c.meshes)b.c.meshes.push(m)}
/* ----- modelos de las formas (solo admin) ----- */
function mkZilla(){const g=new THREE.Group(),a=(ge,mt,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o};
  a(gSph,mgr,0,20,0,8,13,7);a(gSph,mgr,0,35,2,5,5,5);a(gSph,mrd,-2,36,6.5,.9,.9,.9);a(gSph,mrd,2,36,6.5,.9,.9,.9);a(gBox,LM(0x111111),0,33,6.8,3.4,.7,.5);
  for(let i=0;i<5;i++)a(gCone,LM(0xffd23a),0,31-i*4,-6.5,1.6,3,1.6).rotation.x=-1.2;
  [-9,9].forEach(x=>{const o=a(gCyl,mgr,x,22,2,1.5,9,1.5);o.rotation.z=x>0?-.4:.4});
  g.userData.l=[-4,4].map(x=>a(gCyl,mgr,x,6,0,2.4,12,2.4));g.scale.setScalar(.2);g.rotation.y=Math.PI;g.visible=false;S.add(g);return g}
function mkGranny(){const g=new THREE.Group(),dr=LM(0x8a3b6b),add=(ge,mt,px,py,pz,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(px,py,pz);o.scale.set(sx,sy,sz);g.add(o);return o};
  add(gCone,dr,0,.95,0,.5,1.1,.5);add(gSph,LM(0xf0c8a0),0,1.72,.1,.2,.2,.2);add(gSph,LM(0xeeeeee),0,1.84,.05,.22,.16,.22);add(gCyl,mTr,.45,.5,.15,.03,1,.03);add(gBox,LM(0x7a4a2a),-.4,.8,.1,.22,.28,.12);
  g.userData.l1=add(gBox,LM(0x3a3a44),-.12,.22,0,.12,.45,.14);g.userData.l2=add(gBox,LM(0x3a3a44),.12,.22,0,.12,.45,.14);
  g.scale.setScalar(3);g.rotation.y=Math.PI;g.visible=false;S.add(g);return g}
const zZ=mkZilla(),gG=mkGranny();
const tur3=new THREE.Group();{const base=new THREE.Mesh(gCyl,M(0x333844,0,0,.6,.4));base.scale.set(.6,.5,.6);const gun=new THREE.Mesh(gBox,M(0x19f2ff,0x19f2ff,.6));gun.scale.set(.2,.2,1.6);gun.position.set(0,.3,.8);tur3.add(base,gun)}tur3.visible=false;S.add(tur3);
/* ----- poderes ----- */
let zRo=3,gBt=0,tuT=0;const trc=[],mTrc=new THREE.MeshBasicMaterial({color:0xfff27a});
function zForm(dt,t){zRo-=dt;if(zRo<=0){zRo=rr(6,9);roar(1);zBr=1.3}
  for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.abs(o.z-car.z)>9+speed*dt||Math.abs(o.x-car.x)>9)continue;smash(o,6);bonus+=25;shake=Math.max(shake,.3)}
  for(const b of blds)if(!b.fall&&Math.abs(b.z-car.z)<16&&Math.abs(b.x-car.x)<60)bldFall(b);
  for(const e of enemies)if(!e.dead&&Math.abs(e.z-car.z)<9&&Math.abs(e.x-car.x)<9){toDebris(e,-rr(10,30));burst(new V3(e.x,1,e.z),16,0xff6a1a,12)}
  if(zBr>0){zBr-=dt;burst(new V3(car.x+rr(-.4,.4),6.4,car.z-1.5),2,Math.random()<.5?0xff6a1a:0xffd23a,5,-34);for(const o of objs){if(o.dead||o.k!=='o')continue;if(o.z<car.z&&o.z>car.z-45&&Math.abs(o.x-car.x)<8){smash(o,4);bonus+=25}}}
  if(Math.sin(t*9)>.97)shake=Math.max(shake,.35)}
function gForm(dt,t){gBt-=dt;if(gBt>0)return;gBt=.22;const p=new V3(car.x+rr(-5,5),rr(.5,3),car.z+rr(-12,2));
  burst(p,10,0xff6a1a,12);burst(p,6,0xffd23a,10);burst(p,4,0x555555,8);snd(rr(90,170),.25,'sawtooth',.07,-60);shake=Math.max(shake,.35);
  for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.hypot(o.x-p.x,o.z-p.z)<7){smash(o,5);bonus+=25}}
  for(const e of enemies)if(!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<9){toDebris(e,-rr(8,20));burst(new V3(e.x,1,e.z),14,0xff6a1a,12)}}
function turUpd(dt,t){tur3.position.set(car.x,car.y+1.9,car.z);
  for(let i=trc.length-1;i>=0;i--){const q=trc[i];q.l-=dt;if(q.l<=0){S.remove(q.m);trc.splice(i,1)}}
  tuT-=dt;if(tuT>0)return;let tg=null,bd=1e9;
  for(const e of enemies){if(e.dead)continue;const dz=car.z-e.z;if(dz<-12||dz>130)continue;const d=Math.hypot(e.x-car.x,dz);if(d<bd){bd=d;tg={e}}}
  if(!tg)for(const o of objs){if(o.dead||o.k!=='o')continue;const dz=car.z-o.z;if(dz<0||dz>70||Math.abs(o.x-car.x)>9)continue;if(dz<bd){bd=dz;tg={o}}}
  if(!tg)return;tuT=.2;const tx=tg.e?tg.e.x:tg.o.x,tz=tg.e?tg.e.z:tg.o.z,a=new V3(car.x,car.y+2,car.z),b=new V3(tx,tg.e?1:.8,tz),len=a.distanceTo(b);
  const m=new THREE.Mesh(gBox,mTrc);m.scale.set(.12,.12,len);m.position.copy(a).lerp(b,.5);m.lookAt(b);S.add(m);trc.push({m,l:.07});tur3.lookAt(b);
  if(tg.e){const e=tg.e;toDebris(e,-rr(5,15));burst(new V3(e.x,1,e.z),18,0xff6a1a,12);bonus+=100}else{smash(tg.o,8);bonus+=25}
  snd(900,.06,'square',.03,-300)}
function bigBoom(){if(st!=='play')return;admin.used=true;const p=new V3(car.x,1.5,car.z);
  burst(p,70,0xff6a1a,30);burst(p,40,0xffd23a,26);burst(p,30,0xffffff,20);shake=2.4;snd(55,1.2,'sawtooth',.25,-25);try{nz(0,900,80,1.4,.7,.8)}catch(e){}
  for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.hypot(o.x-car.x,o.z-car.z)<80)smash(o,2)}
  for(const e of enemies)if(!e.dead&&Math.hypot(e.x-car.x,e.z-car.z)<100){toDebris(e,-rr(5,25));burst(new V3(e.x,1,e.z),20,0xff6a1a,14)}
  for(const b of blds)if(!b.fall&&Math.hypot(b.x-car.x,b.z-car.z)<90)bldFall(b);pop('💥 ¡BOOM!')}
/* ----- desastres (solo admin) ----- */
const D={sz:1,it:1,waterOn:false,water:0,wl:0,tsuW:0,tsu:null,tor:null,bliz:false};
const awater=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({color:0x2f8fdc,transparent:true,opacity:.78,roughness:.15,metalness:.2}));awater.rotation.x=-Math.PI/2;awater.visible=false;S.add(awater);
const SN=1400,snP=new THREE.BufferGeometry(),snA=new Float32Array(SN*3),snO=new Float32Array(SN*3);
for(let i=0;i<SN;i++){snO[i*3]=rr(-40,40);snO[i*3+1]=rr(0,35);snO[i*3+2]=rr(-60,25)}
snP.setAttribute('position',new THREE.BufferAttribute(snA,3));
const snow=new THREE.Points(snP,new THREE.PointsMaterial({color:0xffffff,size:.45,transparent:true,opacity:.9,depthWrite:false}));snow.frustumCulled=false;snow.visible=false;S.add(snow);
const dsAny=()=>D.waterOn||!!D.tsu||!!D.tor||D.bliz||D.tsuW>0;
function dsBtn(){const g=id=>$(id);if(!g('dwat'))return;g('dwat').classList.toggle('on',D.waterOn);g('dtor').classList.toggle('on',!!D.tor);g('dbli').classList.toggle('on',D.bliz)}
function dsKill(w){if(w==='tsu'&&D.tsu){S.remove(D.tsu.g);D.tsu=null}if(w==='tor'&&D.tor){S.remove(D.tor.g);D.tor=null}}
function dsStop(){xaStop();dsKill('tsu');dsKill('tor');D.waterOn=false;D.tsuW=0;D.water=0;D.wl=0;awater.visible=false;if(D.bliz){D.bliz=false;FOG.near=80;FOG.far=250}snow.visible=false;dsBtn()}
function tsunami(){if(st!=='play')return;dsKill('tsu');const w=new THREE.Group(),H=22*D.sz,
  body=new THREE.Mesh(gBox,new THREE.MeshStandardMaterial({color:0x1f7fd0,transparent:true,opacity:.8,roughness:.2})),foam=new THREE.Mesh(gBox,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));
  body.scale.set(700,H,26);body.position.y=H/2;foam.scale.set(700,H*.12,30);foam.position.y=H*1.02;w.add(body,foam);w.position.set(car.x,0,car.z-230);S.add(w);D.tsu={g:w,hit:false};
  try{nz(0,300,60,2.5,.8,1)}catch(e){}pop('🌊 ¡TSUNAMI!')}
function tornado(){if(st!=='play')return;dsKill('tor');const g=new THREE.Group(),mt=new THREE.MeshStandardMaterial({color:0x8a8f98,transparent:true,opacity:.6,roughness:1}),ps=[];
  for(let i=0;i<8;i++){const r=1.2+i*1.1,m=new THREE.Mesh(gCyl,mt);m.scale.set(r,3.2,r);m.position.y=1.6+i*3;g.add(m);ps.push(m)}
  g.scale.setScalar(D.sz);g.position.set(car.x+rr(-15,15),0,car.z-70);S.add(g);D.tor={g,ps,ph:0,sn:0};pop('🌪 ¡TORNADO!')}
function dsUpd(dt,t){
  if(D.tsuW>0)D.tsuW-=dt;
  D.water=Math.max(D.waterOn?.8*D.sz:0,D.tsuW>0?1.2*D.sz:0);D.wl+=(D.water-D.wl)*Math.min(1,dt*1.5);awater.visible=D.wl>.03;
  if(awater.visible){awater.position.set(car.x,D.wl+Math.sin(t*2)*.06,car.z);if(speed>8&&car.y<D.wl+1&&Math.random()<.6)burst(new V3(car.x+rr(-1.5,1.5),D.wl+.3,car.z+rr(-1,2)),2,0xcfeaff,7)}
  if(D.tsu){const w=D.tsu.g;w.position.z+=(40+40*D.it)*dt;w.position.x=car.x;const zz=w.position.z;
    for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.abs(o.z-zz)<16)smash(o,3)}
    for(const b of blds)if(!b.fall&&Math.abs(b.z-zz)<30)bldFall(b);
    for(const e of enemies)if(!e.dead&&Math.abs(e.z-zz)<16){toDebris(e,-rr(5,20));burst(new V3(e.x,1,e.z),12,0xbfe4ff,12)}
    if(!D.tsu.hit&&Math.abs(car.z-zz)<18){D.tsu.hit=true;shake=2.5;burst(new V3(car.x,2,car.z),40,0xbfe4ff,22);snd(60,1,'sawtooth',.2,-30);D.tsuW=8}
    if(zz>car.z+90)dsKill('tsu')}
  if(D.tor){const T=D.tor,g=T.g;T.ph+=dt;const R=5*D.sz*(.7+.3*D.it);
    g.position.z+=(car.z-48-g.position.z)*Math.min(1,dt*1.3);g.position.x+=(car.x+Math.sin(T.ph*.8*D.it)*22-g.position.x)*Math.min(1,dt*1.1);
    T.ps.forEach((m,i)=>{m.rotation.y=T.ph*(6+i);m.position.x=Math.sin(T.ph*3+i)*.4*(i+1)});
    for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.hypot(o.x-g.position.x,o.z-g.position.z)<R+3){smash(o,3);const d=debris[debris.length-1];if(d){d.v.set(rr(-12,12),rr(14,24),rr(-12,12));d.w.set(rr(-9,9),rr(-9,9),rr(-9,9))}}}
    for(const b of blds)if(!b.fall&&Math.hypot(b.x-g.position.x,b.z-g.position.z)<R+25)bldFall(b);
    for(const e of enemies)if(!e.dead&&Math.hypot(e.x-g.position.x,e.z-g.position.z)<R+6){toDebris(e,-rr(5,15));burst(new V3(e.x,1,e.z),14,0x9a8f80,12)}
    if(Math.random()<.5)burst(new V3(g.position.x+rr(-R,R),rr(1,14),g.position.z+rr(-R,R)),1,0x9a8f80,6);
    T.sn-=dt;if(T.sn<=0){T.sn=1.2;try{nz(0,500,140,1.3,.2,.8)}catch(e){}}}
  if(D.bliz){snow.visible=true;snP.setDrawRange(0,Math.min(SN,Math.floor(SN*(.3+.35*D.it))));const W=14*D.it,fy=9+4*D.it;
    for(let i=0;i<SN;i++){let x=snO[i*3]+W*dt,y=snO[i*3+1]-fy*dt,z=snO[i*3+2]+speed*dt*.5;if(y<0)y+=35;if(x>40)x-=80;if(z>25)z-=85;snO[i*3]=x;snO[i*3+1]=y;snO[i*3+2]=z;snA[i*3]=cam.position.x+x;snA[i*3+1]=y;snA[i*3+2]=cam.position.z+z}
    snP.attributes.position.needsUpdate=true;FOG.near=5;FOG.far=Math.max(28,150-D.it*28);FOG.color.set(0xdfe9f2);ground.material.color.set(0xf2f6fa)}}
/* ----- actualización por frame de todo lo anterior ----- */
function fxUpd(dt,t){puHud();
  if(st!=='play'){bubM.visible=zZ.visible=gG.visible=tur3.visible=false;if(st==='menu'||st==='end')dsStop();return}
  const A=admin;if(A.inv||A.spd!==1||A.fly||A.ghost||A.tur||A.form||A.free||A.under||xaDirty()||dsAny())A.used=true;
  A.nocol=A.spd>8||A.ghost||A.form!==''||A.under;
  bubM.visible=puT.bub>0&&(puT.bub>2||Math.floor(t*10)%2===0);bubM.position.set(car.x,car.y+1,car.z);
  zZ.visible=A.form==='godzilla';gG.visible=A.form==='granny';tur3.visible=A.tur&&!A.ghost&&!A.form;
  if(zZ.visible){zZ.position.set(car.x,car.y,car.z);zZ.userData.l.forEach((l,i)=>l.rotation.x=Math.sin(t*9+i*3.14)*.7);zForm(dt,t)}
  if(gG.visible){gG.position.set(car.x,car.y,car.z);gG.userData.l1.rotation.x=Math.sin(t*14)*.7;gG.userData.l2.rotation.x=-Math.sin(t*14)*.7;gForm(dt,t)}
  if(tur3.visible)turUpd(dt,t);
  dsUpd(dt,t);xaUpd(dt,t)}
/* ======================================================================
   ADMIN GOD MODE · núcleo (parámetros, entidades, efectos, restauración)
   ====================================================================== */
let admSync=()=>{},axUI=()=>{};
const xmMet=M(0xff5a1a,0xff4400,1.4,.2,.8),xgMet=new THREE.IcosahedronGeometry(1,1),
 xmCrat=new THREE.MeshBasicMaterial({color:0x120a08,transparent:true,opacity:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
 xmCrk=new THREE.MeshBasicMaterial({color:0x000000}),xgCirc=new THREE.CircleGeometry(1,20),xgRing=new THREE.RingGeometry(.92,1,40),
 xmRing=new THREE.MeshBasicMaterial({color:0x19f2ff,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}),
 xmLv=new THREE.MeshStandardMaterial({color:0xff4a00,emissive:0xff3300,emissiveIntensity:1.2,roughness:.4,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
 xgVol=new THREE.ConeGeometry(1,1,10),xmVol=M(0x3a2a22,0,0,0,1),
 xgUfo=new THREE.SphereGeometry(1,16,8),xmUfo=M(0x9aa4b4,0,0,.8,.3),xmUfoG=M(0x66ff99,0x33ff77,1.2),xmLas=new THREE.MeshBasicMaterial({color:0x66ff66}),
 xmShell=new THREE.MeshBasicMaterial({color:0xffe14a}),xmOl=M(0x4a5a2a),xmOl2=M(0x333d1e,0,0,.3,.7);
const xaK=()=>XA.lite?.5:1;
function xaMark(){if(st==='play'||st==='cine')admin.used=true}
function xaErr(e){XA.errs.push((e&&e.message?e.message:String(e)).slice(0,160));if(XA.errs.length>20)XA.errs.shift()}
function xaDirty(){if(XA.act||XA.clones.length||XA.meteorRain||XA.quakeOn||XA.permNit||XA.lightning||XA.rain||XA.filter||XA.roadTint||XA.camMode!=='normal')return true;for(const k in XD)if(XP[k]!==XD[k])return true;return false}
/* daño genérico de los extras (respeta invencible / escudo burbuja) */
function xaHurt(sp){if(admin.inv||puT.bub>0||invul>0)return;if(shields===0){over();return}shields--;invul=1.8;speed*=sp||.7;shake=Math.max(shake,1);pop('💥 ¡TOCADO!')}

/* ----- humanos (zombis y soldados) ----- */
function xaHum(skin,shirt,pants,zomb,helm){const g=new THREE.Group(),a=(ge,mt,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o};
 a(gBox,LM(shirt),0,1.05,0,.55,.75,.3);a(gBox,LM(skin),0,1.65,0,.32,.32,.32);if(helm)a(gBox,LM(helm),0,1.85,0,.38,.14,.38);
 const l1=a(gBox,LM(pants),-.14,.3,0,.2,.6,.2),l2=a(gBox,LM(pants),.14,.3,0,.2,.6,.2);
 if(zomb){a(gBox,LM(skin),-.36,1.25,.35,.14,.14,.7);a(gBox,LM(skin),.36,1.25,.35,.14,.14,.7);a(gBox,LM(0x8a0010),0,1.1,.16,.3,.2,.02)}
 else{a(gBox,LM(skin),-.36,1.0,.1,.14,.6,.14);a(gBox,LM(skin),.36,1.0,.1,.14,.6,.14);a(gBox,LM(0x222222),.2,1.0,.45,.1,.12,.9)}
 return{g,l1,l2}}
function xaMobN(){let n=0;for(const m of XA.mob)if(!m.dead)n++;return n}
function xaCnt(k){let n=0;for(const m of XA.mob)if(!m.dead&&m.k===k)n++;return n}
function xaSpZ(){if(xaMobN()>=150*xaK())return;const big=Math.random()<.05,h=xaHum(big?0x7a2a2a:0x6bbf4a,big?0x4a1a1a:0x3a5a2a,0x2a2a4a,1),s=big?2.6:rr(1.15,1.45);let x=rr(-17,17),z=car.z-rr(70,150);
 const sp=XA.zSpawn;if(sp==='sides'||(sp==='around'&&Math.random()<.5)){x=(Math.random()<.5?-1:1)*rr(24,40);z=car.z-rr(20,120)}if(sp==='around'&&Math.random()<.3)z=car.z+rr(15,40);
 h.g.scale.setScalar(s);h.g.position.set(x,0,z);S.add(h.g);XA.mob.push({k:'z',big,hp:big?XP.zHp+1:XP.zHp,g:h.g,l1:h.l1,l2:h.l2,x,z,v:(big?5:rr(5,10))*XP.zSpd*(.7+.3*D.it),dead:false,ph:rr(0,6),cd:0})}
function xaSpRow(){const flank=XA.aEntry==='flanks'||(XA.aEntry==='mixed'&&Math.random()<.5),side=Math.random()<.5?-1:1,z0=car.z-rr(105,125);
 for(let i=0;i<9;i++){if(xaMobN()>=150*xaK())break;const h=xaHum(0xe0b890,0x4f5d2a,0x3a4420,0,0x2f3a1c),x=flank?side*(30+i*2):-16+i*4+rr(-.5,.5),z=flank?car.z-rr(40,110):z0+rr(-3,3);
  h.g.scale.setScalar(1.3);h.g.position.set(x,0,z);S.add(h.g);XA.mob.push({k:'s',g:h.g,l1:h.l1,l2:h.l2,x,z,v:rr(7,10)*XP.aSpd,dead:false,ph:rr(0,6)})}snd(180,.3,'square',.04,60)}
function xaSpTank(){const g=new THREE.Group(),a=(ge,mt,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(ge,mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o};
 a(gBox,xmOl,0,.9,0,2.6,.9,5.2);a(gBox,xmOl2,-1.7,.55,0,.8,1.1,5.8);a(gBox,xmOl2,1.7,.55,0,.8,1.1,5.8);a(gBox,xmOl,0,1.6,-.2,1.8,.7,2.2);a(gBox,xmOl2,0,1.65,2.3,.3,.3,3);
 const x=rr(-9,9),z=car.z-rr(110,140);g.scale.setScalar(1.15);g.position.set(x,0,z);S.add(g);XA.mob.push({k:'t',g,x,z,v:rr(12,16)*XP.aSpd,dead:false,ph:0,fT:rr(.8,1.6)})}
function xaSplat(m){XA.kills++;toDebris(m,-Math.min(speed,150)*rr(.4,.9));burst(new V3(m.x,1,m.z),8,m.k==='z'?0x7aff3a:0xb00010,9);bonus+=m.k==='z'?40:60;
 if(XA.kills%8===0){pop((m.k==='z'?'🧟':'🪖')+' x'+XA.kills);snd(rr(120,220),.12,'square',.04,-80)}}
function xaShoot(m){const sp=Math.min(speed,200),T=Math.max(.5,Math.hypot(car.x-m.x,car.z-m.z)/70),tx=car.x+car.vx*T,tz=car.z-sp*T,x=m.x,y=2.1,z=m.z+3,mm=new THREE.Mesh(gSph,xmShell);
 mm.scale.setScalar(.6);mm.position.set(x,y,z);S.add(mm);XA.shells.push({m:mm,x,y,z,vx:(tx-x)/T,vy:(.8-y)/T,vz:(tz-z)/T,l:T+.6});burst(new V3(x,y,z+1.5),8,0xffd23a,8);snd(150,.2,'sawtooth',.12,-90)}
function xaMobUpd(dt,t){
 for(let i=XA.mob.length-1;i>=0;i--){const m=XA.mob[i];if(m.dead){XA.mob.splice(i,1);continue}
  const dx=car.x-m.x,dz=car.z-m.z,d=Math.hypot(dx,dz)||1;
  if(m.k==='z'||(m.k==='s'&&XA.aChase)){m.x+=dx/d*m.v*dt;m.z+=dz/d*m.v*dt;m.x=Math.max(-40,Math.min(40,m.x));m.g.rotation.y=Math.atan2(dx,dz)}
  else if(m.k==='s'){m.z+=m.v*dt;if(Math.abs(m.x)>16)m.x-=Math.sign(m.x)*Math.min(Math.abs(m.x)-14,m.v*dt*.8);m.x+=Math.sin(t+m.ph)*.6*dt}
  else{m.z+=m.v*dt;m.x+=Math.sign(dx)*Math.min(Math.abs(dx),3*dt);m.x=Math.max(-11,Math.min(11,m.x));m.fT-=dt;if(m.fT<=0&&m.z<car.z-25){m.fT=rr(2,3.2)/D.it;xaShoot(m)}}
  if(m.cd>0)m.cd-=dt;
  if(m.z>car.z+60||m.z<car.z-300){m.dead=true;S.remove(m.g);continue}
  const gy=gH(m.x,m.z);m.g.position.set(m.x,gy+(m.k==='t'?0:Math.abs(Math.sin(t*10+m.ph))*.08),m.z);
  if(m.k!=='t'){const sw=Math.sin(t*11+m.ph)*.7;m.l1.rotation.x=sw;m.l2.rotation.x=-sw}
  if(Math.abs(m.z-car.z)<3.2+Math.min(speed,400)*dt&&Math.abs(m.x-car.x)<(m.k==='t'?2.6:m.big?2.8:1.7)*Math.max(1,XP.carS*.7)&&Math.abs(car.y-gy)<2.6*Math.max(1,XP.carS*.7)){
   if(m.k==='t'||m.big){if(!admin.nocol){if(car.y>gy+1.1)stomp(m,gy);else if(invul<=0||puT.bub>0){hitEnemy(m);if(st!=='play')return}}}
   else if(m.k==='z'&&m.hp>1&&m.cd<=0){m.hp--;m.cd=.4;m.z-=2;burst(new V3(m.x,1,m.z),5,0x7aff3a,7);speed*=.97}
   else xaSplat(m)}}
 for(let i=XA.shells.length-1;i>=0;i--){const s=XA.shells[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.l-=dt;s.m.position.set(s.x,s.y,s.z);
  if(s.l<=0||s.y<=.3||(Math.hypot(s.x-car.x,s.z-car.z)<3&&Math.abs(s.y-car.y-.8)<3)){S.remove(s.m);XA.shells.splice(i,1);const p=new V3(s.x,1,s.z);burst(p,22,0xff6a1a,13);burst(p,10,0xffd23a,11);snd(80,.4,'sawtooth',.15,-50);shake=Math.max(shake,.8);
   if(Math.hypot(s.x-car.x,s.z-car.z)<4&&Math.abs(car.y)<5){xaHurt(.65);if(st!=='play')return}}}}
function xaKill(k){XA.mob.forEach(m=>{if(!m.dead&&(!k||m.k===k)){m.dead=true;S.remove(m.g)}})}

/* ----- caos: meteoritos, lava, volcanes, terremotos, aliens, godzillas ----- */
function xaBoom(x,z,r){burst(new V3(x,1.2,z),40,0xff6a1a,18);burst(new V3(x,1.2,z),22,0xffd23a,14);burst(new V3(x,1.2,z),16,0x222222,10);snd(60,.6,'sawtooth',.2,-30);
 const d=Math.hypot(x-car.x,z-car.z);shake=Math.max(shake,Math.max(0,2.2-d/50));
 const c=new THREE.Mesh(xgCirc,xmCrat);c.rotation.x=-Math.PI/2;c.scale.setScalar(r*2);c.position.set(x,.06,z);c.renderOrder=2;S.add(c);XA.cr.push({m:c,l:10});if(XA.cr.length>50){const o=XA.cr.shift();S.remove(o.m)}
 for(const o of objs){if(o.dead||o.k!=='o')continue;if(Math.hypot(o.x-x,o.z-z)<r*3.2)smash(o,5)}
 for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.z-z)<r*3.5){toDebris(e,-rr(5,20));burst(new V3(e.x,1,e.z),12,0xff6a1a,12)}
 for(const b of blds)if(!b.fall&&Math.hypot(b.x-x,b.z-z)<24)bldFall(b);
 for(const m of XA.mob)if(!m.dead&&m.k!=='t'&&Math.hypot(m.x-x,m.z-z)<r*3.5)toDebris(m,-rr(5,15));
 if(d<r*2.6+2&&Math.abs(car.y)<5)xaHurt(.6)}
function xaMeteor(){if(XA.met.length>=30*xaK())return;const T=rr(1.1,1.6),sp=Math.min(speed,250),tx=Math.max(-26,Math.min(26,car.x+rr(-18,18))),tz=car.z-sp*T+rr(-14,10),r=rr(1.2,2.4)*D.sz*XP.metSize,m=new THREE.Mesh(xgMet,xmMet),
 sx=tx+rr(-40,40),sz=tz-rr(30,70),sy=rr(85,120);m.scale.setScalar(r);m.position.set(sx,sy,sz);S.add(m);XA.met.push({m,x:sx,y:sy,z:sz,vx:(tx-sx)/T,vy:-sy/T,vz:(tz-sz)/T,r})}
function xaPool(x,z,r,l){r=r||rr(3.5,7)*D.sz;x=x==null?rr(-10,10):x;z=z==null?car.z-rr(70,150):z;const m=new THREE.Mesh(xgCirc,xmLv);m.rotation.x=-Math.PI/2;m.scale.setScalar(r);m.position.set(x,.07,z);m.renderOrder=3;S.add(m);XA.pool.push({m,x,z,r,l:l||rr(12,18)})}
function xaVol(){const s=rr(1.1,1.8)*D.sz,side=Math.random()<.5?-1:1,x=side*rr(34,52),z=car.z-rr(90,160),g=new THREE.Group(),h=22*s,w=17*s,c=new THREE.Mesh(xgVol,xmVol),tp=new THREE.Mesh(gSph,xmLv);
 c.scale.set(w,h,w);c.position.y=h/2;tp.scale.set(w*.18,w*.1,w*.18);tp.position.y=h;g.add(c,tp);g.position.set(x,0,z);S.add(g);XA.vol.push({g,x,z,h,l:rr(16,22),t:0});pop('🌋 ¡VOLCÁN!');snd(50,1.2,'sawtooth',.2,-20)}
function xaLB(o){const T=rr(1.6,2.4),sp=Math.min(speed,250),tx=Math.max(-14,Math.min(14,car.x+rr(-10,10))),tz=car.z-sp*T+rr(-12,8),gv=24,m=new THREE.Mesh(gSph,xmLv);
 m.scale.setScalar(rr(.8,1.4)*D.sz);m.position.set(o.x,o.h,o.z);S.add(m);XA.lb.push({m,x:o.x,y:o.h,z:o.z,vx:(tx-o.x)/T,vy:(.5*gv*T*T-o.h)/T,vz:(tz-o.z)/T,gv})}
function xaCrack(){const m=new THREE.Mesh(gBox,xmCrk);m.scale.set(rr(.25,.8),.04,rr(8,26));m.position.set(rr(-14,14),.07,car.z-rr(15,120));m.rotation.y=rr(-.5,.5);S.add(m);XA.cr.push({m,l:12})}
function xaUfo(){const g=new THREE.Group(),b=new THREE.Mesh(xgUfo,xmUfo),d=new THREE.Mesh(gSph,xmUfoG);b.scale.set(4,.9,4);d.scale.set(1.8,1.4,1.8);d.position.y=.7;g.add(b,d);g.scale.setScalar(D.sz);
 const x=rr(-25,25),z=car.z-rr(60,120);g.position.set(x,16,z);S.add(g);XA.ufo.push({g,x,y:16,z,l:rr(14,20),ph:rr(0,6),fT:rr(.5,1.2)});pop('👽 ¡ALIENS!');snd(900,.6,'sine',.06,-500)}
function xaLaser(o){const a=new V3(o.x,o.y,o.z),b=new V3(car.x+rr(-1,1),car.y+1,car.z+rr(-1,1)),len=a.distanceTo(b),m=new THREE.Mesh(gBox,xmLas);
 m.scale.set(.22,.22,len);m.position.copy(a).lerp(b,.5);m.lookAt(b);S.add(m);XA.ls.push({m,l:.12});snd(1300,.15,'sawtooth',.04,-1000);burst(b,6,0x66ff66,8);if(Math.random()<.4)xaHurt(.8)}
function xaZil(){const g=mkZilla(),s=rr(.8,1.3)*D.sz,side=Math.random()<.5?-1:1,z=car.z-rr(70,130);g.scale.setScalar(s);g.visible=true;g.position.set(side*rr(50,70),0,z);g.rotation.y=side>0?-Math.PI/2:Math.PI/2;
 XA.zil.push({g,s,side,x:g.position.x,z,l:rr(14,20)});roar(1.2);pop('🦖 ¡GODZILLA!')}
function xaQuake(){XA.qk=rr(2.5,4);pop('🌋 ¡TERREMOTO!');try{nz(0,120,40,3,.5,1)}catch(e){}}
function xaFlash(){const e=$('axflash');if(!e)return;e.style.transition='none';e.style.opacity=.75;try{snd(60,.5,'sawtooth',.1,-30)}catch(_){}requestAnimationFrame(()=>{e.style.transition='opacity .5s';e.style.opacity=0})}
function xaPulse(){if(st!=='play')return;XA.act=true;const R2=XP.pulseR,p=new V3(car.x,car.y+.6,car.z),m=new THREE.Mesh(xgRing,xmRing);m.rotation.x=-Math.PI/2;m.position.set(car.x,.3,car.z);S.add(m);XA.rings.push({m,t:0,R:R2});
 burst(p,40,0x19f2ff,22);shake=Math.max(shake,1.6);snd(90,.7,'sawtooth',.2,-60);
 for(const o of objs){if(o.dead||o.k!=='o')continue;const d=Math.hypot(o.x-car.x,o.z-car.z);if(d<R2){smash(o,6);const q=debris[debris.length-1];if(q){const a=Math.atan2(o.x-car.x,o.z-car.z);q.v.set(Math.sin(a)*30,rr(10,24),Math.cos(a)*30)}}}
 for(const e of enemies)if(!e.dead&&Math.hypot(e.x-car.x,e.z-car.z)<R2){toDebris(e,-rr(10,40));burst(new V3(e.x,1,e.z),14,0x19f2ff,12)}
 for(const q of XA.mob)if(!q.dead&&Math.hypot(q.x-car.x,q.z-car.z)<R2)toDebris(q,-rr(10,40));
 for(const b of blds)if(!b.fall&&Math.hypot(b.x-car.x,b.z-car.z)<R2)bldFall(b);pop('💫 ONDA EXPANSIVA')}

function xaChaosUpd(dt,t){if(XA.chPaused)return;const it=D.it*XP.ci,C=XA.cat;XA.chT+=dt;if(XP.chDur>0&&XA.chT>=XP.chDur){xaChaos(false);pop('☢️ El caos termina');return}
 if(C.met){XA.mT-=dt;if(XA.mT<=0){XA.mT=rr(.25,.7)/it;xaMeteor();if(it>2&&Math.random()<.5)xaMeteor()}}
 if(C.lava){XA.lT-=dt;if(XA.lT<=0){XA.lT=rr(2,4)/it;if(XA.pool.length<14*xaK())xaPool()}}
 if(C.vol){XA.vT-=dt;if(XA.vT<=0){XA.vT=rr(4,7)/it;if(XA.vol.length<3*xaK())xaVol()}}
 if(C.qk){XA.qT-=dt;if(XA.qT<=0){XA.qT=rr(7,12)/it;xaQuake()}}
 if(C.ufo){XA.uT-=dt;if(XA.uT<=0){XA.uT=rr(5,9)/it;if(XA.ufo.length<4*xaK())xaUfo()}}
 if(C.zil){XA.zT-=dt;if(XA.zT<=0){XA.zT=rr(8,13)/it;if(XA.zil.length<3*xaK())xaZil()}}
 if(C.tor){XA.tT-=dt;if(XA.tT<=0){XA.tT=rr(14,22)/it;if(!D.tor){tornado();dsBtn()}}}
 if(C.tsu){XA.sT-=dt;if(XA.sT<=0){XA.sT=rr(22,34)/it;if(!D.tsu)tsunami()}}
 if(C.grav){XA.gT-=dt;if(XA.gT<=0){if(XA.gOn){axSet('g',1);XA.gOn=false;XA.gT=rr(6,10)}else{axSet('g',[-1,.3,2.5][Math.random()*3|0]);XA.gOn=true;XA.gT=rr(4,7);pop('🌀 Gravedad alterada')}}}
 if(C.flash){XA.fT-=dt;if(XA.fT<=0){XA.fT=rr(4,9);xaFlash()}}}
function xaEvCount(){return XA.met.length+XA.pool.length+XA.vol.length+XA.lb.length+XA.ufo.length+XA.zil.length+(D.tor?1:0)+(D.tsu?1:0)+(XA.qk>0?1:0)}
function xaEnt(dt,t){
 xmLv.emissiveIntensity=1+.4*Math.sin(t*6);
 for(let i=XA.met.length-1;i>=0;i--){const o=XA.met[i];o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;o.m.position.set(o.x,o.y,o.z);o.m.rotation.x+=dt*3;o.m.rotation.y+=dt*2;
  if(Math.random()<.8)burst(new V3(o.x,o.y,o.z),1,Math.random()<.5?0xff6a1a:0xffd23a,3);
  if(o.y<=o.r){S.remove(o.m);XA.met.splice(i,1);xaBoom(o.x,o.z,o.r);if(st!=='play')return}}
 for(let i=XA.pool.length-1;i>=0;i--){const o=XA.pool[i];o.l-=dt;if(o.l<=0||o.z>car.z+80){S.remove(o.m);XA.pool.splice(i,1);continue}
  if(Math.random()<.08)burst(new V3(o.x+rr(-o.r,o.r)*.7,.4,o.z+rr(-o.r,o.r)*.7),1,0xff6a1a,3);
  if(Math.hypot(car.x-o.x,car.z-o.z)<o.r&&Math.abs(car.y)<1.4){speed*=1-.5*dt;burst(new V3(car.x,.5,car.z),1,0xff6a1a,5);if(invul<=0){xaHurt(.8);if(st!=='play')return}}}
 for(let i=XA.vol.length-1;i>=0;i--){const o=XA.vol[i];o.l-=dt;o.t-=dt;if(o.l<=0||o.z>car.z+120){S.remove(o.g);XA.vol.splice(i,1);continue}
  burst(new V3(o.x,o.h,o.z),1,Math.random()<.5?0xff6a1a:0x555555,6);if(o.t<=0){o.t=rr(.35,.8)/D.it;xaLB(o)}}
 for(let i=XA.lb.length-1;i>=0;i--){const o=XA.lb[i];o.vy-=o.gv*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;o.m.position.set(o.x,o.y,o.z);if(Math.random()<.5)burst(new V3(o.x,o.y,o.z),1,0xff6a1a,3);
  if(o.y<=.4&&o.vy<0){S.remove(o.m);XA.lb.splice(i,1);const p=new V3(o.x,.8,o.z);burst(p,18,0xff6a1a,12);burst(p,8,0xffd23a,10);snd(100,.25,'sawtooth',.08,-60);
   if(XA.pool.length<26*xaK()&&Math.abs(o.x)<16)xaPool(o.x,o.z,rr(1.6,2.6),rr(5,8));
   if(Math.hypot(o.x-car.x,o.z-car.z)<3.6&&Math.abs(car.y)<4){xaHurt(.7);if(st!=='play')return}}}
 if(XA.quakeOn)XA.qk=Math.max(XA.qk,.3);
 if(XA.qk>0){XA.qk-=dt;shake=Math.max(shake,1.3*XP.qkI);car.vx+=rr(-1,1)*60*dt*XP.qkI;XA.qd-=dt;
  if(XA.qd<=0){XA.qd=.15;burst(new V3(car.x+rr(-14,14),.5,car.z-rr(0,40)),3,0x8a7a60,8);if(Math.random()<.4)xaCrack();for(const b of blds)if(!b.fall&&Math.abs(b.z-car.z)<80&&Math.random()<.08*XP.qkI)bldFall(b)}
  cam.rotateZ(Math.sin(t*45)*.025*XP.qkI)}
 for(let i=XA.ufo.length-1;i>=0;i--){const o=XA.ufo[i];o.l-=dt;if(o.l<=0){S.remove(o.g);XA.ufo.splice(i,1);continue}
  o.x+=(car.x+Math.sin(t*.8+o.ph)*18-o.x)*Math.min(1,dt*1.3);o.z+=(car.z-38+Math.cos(t*.6+o.ph)*14-o.z)*Math.min(1,dt*3);o.y=15+Math.sin(t*2+o.ph)*3+(o.l<2?(2-o.l)*40:0);
  o.g.position.set(o.x,o.y,o.z);o.g.rotation.y+=dt*4;o.fT-=dt;if(o.fT<=0){o.fT=rr(1,2.2)/D.it;xaLaser(o);if(st!=='play')return}}
 for(let i=XA.ls.length-1;i>=0;i--){const o=XA.ls[i];o.l-=dt;if(o.l<=0){S.remove(o.m);XA.ls.splice(i,1)}}
 for(let i=XA.zil.length-1;i>=0;i--){const o=XA.zil[i];o.l-=dt;o.x+=-o.side*11*(.8+.2*D.it)*dt*(Math.abs(o.x)>30?1.6:1);o.z+=(car.z-26-o.z)*Math.min(1,dt*1.6);
  if(o.l<=0||Math.abs(o.x)>110){S.remove(o.g);XA.zil.splice(i,1);continue}
  o.g.position.set(o.x,0,o.z);o.g.userData.l.forEach((l,k)=>l.rotation.x=Math.sin(t*5+k*3.14)*.6);
  if(Math.abs(o.x)<30){shake=Math.max(shake,.45);const R2=14*o.s;
   for(const q of objs){if(q.dead||q.k!=='o')continue;if(Math.hypot(q.x-o.x,q.z-o.z)<R2)smash(q,5)}
   for(const b of blds)if(!b.fall&&Math.hypot(b.x-o.x,b.z-o.z)<30*o.s)bldFall(b);
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-o.x,e.z-o.z)<R2){toDebris(e,-rr(5,20));burst(new V3(e.x,1,e.z),12,0xff6a1a,12)}
   if(Math.hypot(car.x-o.x,car.z-o.z)<8*o.s&&car.y<14){xaHurt(.5);if(st!=='play')return}}}
 for(let i=XA.rings.length-1;i>=0;i--){const o=XA.rings[i];o.t+=dt;const k=Math.min(1,o.t/.7);o.m.scale.setScalar(2+o.R*k);o.m.material.opacity=.8*(1-k);o.m.position.set(car.x,.3,car.z);if(k>=1){S.remove(o.m);XA.rings.splice(i,1)}}
 for(let i=XA.cr.length-1;i>=0;i--){const o=XA.cr[i];o.l-=dt;if(o.l<=0||o.m.position.z>car.z+60){S.remove(o.m);XA.cr.splice(i,1)}}}
function xaClearChaos(){
 XA.met.forEach(o=>S.remove(o.m));XA.met.length=0;XA.lb.forEach(o=>S.remove(o.m));XA.lb.length=0;
 XA.pool.forEach(o=>S.remove(o.m));XA.pool.length=0;XA.cr.forEach(o=>S.remove(o.m));XA.cr.length=0;XA.ls.forEach(o=>S.remove(o.m));XA.ls.length=0;XA.rings.forEach(o=>S.remove(o.m));XA.rings.length=0;
 for(const k of['vol','ufo','zil'])XA[k].forEach(o=>S.remove(o.g));XA.vol.length=0;XA.ufo.length=0;XA.zil.length=0;XA.qk=0;xaGl(0,1,0)}

/* ----- glitch de la geometría del mapa (reversible) ----- */
function xaGl(dt,all,n){
 for(let i=XA.gl.length-1;i>=0;i--){const o=XA.gl[i];o.t-=dt;if(all||o.t<=0){o.m.position.copy(o.p);o.m.scale.copy(o.s);o.m.rotation.copy(o.r);o.m.visible=o.v;o.m._gl=0;XA.gl.splice(i,1)}}
 if(!n||!chunks.length||XA.gl.length>90*xaK())return;
 for(let k=0;k<n;k++){const ms=chunks[Math.random()*chunks.length|0].meshes;if(!ms.length)continue;const m=ms[Math.random()*ms.length|0];if(!m||m._gl||!m.parent||!m.visible)continue;
  XA.gl.push({m,p:m.position.clone(),s:m.scale.clone(),r:m.rotation.clone(),v:m.visible,t:rr(.08,.45)});m._gl=1;const q=Math.random();
  if(q<.3)m.scale.multiply(new V3(rr(.2,3),rr(.2,4),rr(.2,3)));else if(q<.6)m.position.add(new V3(rr(-3,3),rr(-1,5),rr(-3,3)));else if(q<.85){m.rotation.x+=rr(-1.5,1.5);m.rotation.z+=rr(-1.5,1.5)}else m.visible=false}}

/* ----- realidad rota: oscuridad + glitch ----- */
function xaBars(){const n=1+(Math.random()*3*XP.glI|0);for(let i=0;i<n;i++){const b=document.createElement('div');b.className='glb';b.style.top=rr(0,100)+'vh';b.style.height=rr(2,38)+'px';
 b.style.background=['#0ff','#f0f','#fff','#f20','#0f4'][Math.random()*5|0];b.style.opacity=rr(.25,.8);b.style.transform='translateX('+rr(-40,40)+'px)';document.body.appendChild(b);setTimeout(()=>b.remove(),rr(50,130))}}
function xaDarkUpd(dt,t){const fl=Math.random()<.05*XP.glI,hu=XP.dkH<0?(t*.07)%1:XP.dkH;hemi.intensity=fl?1.2:XP.dkL;sun.intensity=fl?.8:XP.dkL*.8;FOG.near=1;FOG.far=55+Math.sin(t*.7)*22;
 FOG.color.setHSL(hu,1,.03);XA.bgc.setHSL((hu+.5)%1,1,.025+(fl?.2:0));S.background=XA.bgc;
 ground.material.color.setHSL((hu+.2)%1,.7,.07+(Math.random()<.04*XP.glI?.3:0));
 if(XP.glI>0){XA.gb-=dt;if(XA.gb<=0){XA.gb=rr(.07,.35)/Math.max(.2,XP.glI);xaBars()}
  if(Math.random()<.12*XP.glI)cam.rotateZ(rr(-.14,.14)*Math.min(1.5,XP.glI));
  const s=XP.carS;car3.scale.set((Math.random()<.05*XP.glI?rr(.5,2.2):1)*s,(Math.random()<.05*XP.glI?rr(.5,2.2):1)*s,s)}
 if(Math.random()<dt*2.5*XP.glI)snd(rr(40,260),rr(.05,.25),Math.random()<.5?'square':'sawtooth',.03,-rr(20,200))}
function xaDark(on){XA.dark=on;XA.dkT=0;
 if(on){XA.act=true;if(!$('glov')){const d=document.createElement('div');d.id='glov';document.body.appendChild(d)}$('glov').style.display=XP.glI>0?'block':'none';R.domElement.classList.add('glx');pop('👁 ...algo no va bien...')}
 else{const e=$('glov');if(e)e.style.display='none';R.domElement.classList.remove('glx');S.background=skT;car3.scale.setScalar(XP.carS);if(!D.bliz){FOG.near=80*XP.fogM;FOG.far=250*XP.fogM}drawSky()}
 xaBtn()}

/* ----- clones del buggy ----- */
function xaCloneAdd(n){XA.act=true;for(let i=0;i<n;i++){if(XA.clones.length>=Math.min(XP.cMax,12*xaK()))break;const g=new THREE.Group();buildCar(g,CP);g.scale.setScalar(XP.carS);
 const k=XA.clones.length,side=k%2?1:-1,rank=Math.floor(k/2)+1,c={g,k,side,rank,mode:XA.cmode,x:car.x+side*rank*3*XP.cSep,z:XA.cmode==='static'?car.z-8-rank*4:car.z+rank*5*XP.cSep};
 g.position.set(c.x,car.y,c.z);S.add(g);XA.clones.push(c)}}
function xaCloneDel(all){XA.clones.splice(all?0:XA.clones.length-1,all?XA.clones.length:1).forEach(c=>S.remove(c.g))}
function xaCloneUpd(dt){for(let i=XA.clones.length-1;i>=0;i--){const c=XA.clones[i];
  if(c.mode==='static'){if(c.z>car.z+200){S.remove(c.g);XA.clones.splice(i,1);continue}}
  else{const f=Math.min(1,dt*XP.cFol);let tx,tz;if(c.mode==='mimic'){tx=-car.x+c.side*c.rank*2*XP.cSep;tz=car.z+Math.abs(c.rank)*3*XP.cSep}else{tx=car.x+c.side*c.rank*3*XP.cSep;tz=car.z+c.rank*5*XP.cSep}
   c.x+=(tx-c.x)*f;c.z+=(tz-c.z)*f}
  c.g.position.set(c.x,c.mode==='static'?gH(c.x,c.z):car.y,c.z);c.g.rotation.copy(car3.rotation);c.g.scale.setScalar(XP.carS)}}

/* ----- cámara: modos ----- */
function xaCam(t){const m=XA.camMode;if(m==='normal'||m==='near'||m==='far')return;const s=XP.carS;
 if(m==='fp'){cam.position.set(car.x,car.y+1.3*s,car.z-.8*s);cam.lookAt(car.x,car.y+1.1*s,car.z-40);car3.visible=false}
 else if(m==='orbit'){const a=t*.5;cam.position.set(car.x+Math.sin(a)*12*XP.camD,car.y+4*XP.camH,car.z+Math.cos(a)*12*XP.camD);cam.lookAt(car.x,car.y+1,car.z)}
 else if(m==='side'){cam.position.set(car.x+14*XP.camD,car.y+3*XP.camH,car.z);cam.lookAt(car.x,car.y+1,car.z-8)}
 else if(m==='top'){cam.position.set(car.x,car.y+40*XP.camD,car.z+6);cam.lookAt(car.x,car.y,car.z-4)}
 else if(m==='cine'){cam.position.set(car.x+Math.sin(t*.3)*9,car.y+2.2,car.z-16-Math.sin(t*.2)*4);cam.lookAt(car.x,car.y+1.2,car.z)}}
function xaCamMode(m){XA.camMode=m;XA.act=true;if(m==='near'){axSet('camD',.55);axSet('camH',.6)}else if(m==='far'){axSet('camD',2.2);axSet('camH',1.8)}else if(m==='normal'){['camD','camH','camX','fovAdd'].forEach(k=>axSet(k,XD[k]));car3.visible=true}axUI()}

/* ----- acciones de botón ----- */
function xaBtn(){axUI()}
function xaZom(on){XA.zom=on;XA.act=true;if(on){pop('🧟 ¡INVASIÓN ZOMBI!');roar(.8);XA.zomT=0}else xaKill('z');xaBtn()}
function xaArmy(){XA.act=true;XA.armyRows=Math.round(XP.aRows);XA.wvT=0;XA.tkT=1;pop('🪖 ¡EL EJÉRCITO VIENE!');snd(300,.9,'sawtooth',.1,300);xaBtn()}
function xaArmyStop(){XA.armyRows=0;xaBtn()}
function xaArmyKill(){XA.armyRows=0;xaKill('s');xaKill('t');XA.shells.forEach(s=>S.remove(s.m));XA.shells.length=0;xaBtn()}
function xaCine(){let n=0;while(cn&&n++<60){cn.t=99;cineTick(.016,performance.now()/1000)}}
function xaEmptyChunk(c){if(c._e)return;c._e=1;c.meshes.forEach(m=>{m.visible=false});
 objs.forEach(o=>{if(o.c===c&&!o.dead){o.dead=true;S.remove(o.m)}});ramps=ramps.filter(r=>r.c!==c);walkers.forEach(w=>{if(w.c===c){w.dead=true;w.g.visible=false}});
 blds.forEach(b=>{if(b.c===c){b.fall=-1;b.m.visible=false}});landers=landers.filter(l=>l.c!==c)}
function xaEmpty(on){XA.empty=on;XA.act=true;if(on){chunks.forEach(xaEmptyChunk);enemies.forEach(e=>{if(!e.dead){e.dead=true;S.remove(e.g)}});pop('🗑 MAPA VACÍO')}xaBtn()}
function xaRebuild(){XA.empty=false;chunks.forEach(purge);chunks=[];objs=[];ramps=[];walkers=[];blds=[];landers=[];debris.forEach(d=>S.remove(d.m));debris=[];
 nextC=Math.floor(dist/L);while(nextC*L<dist+230)genChunk(nextC++);pop('🔨 MAPA RECONSTRUIDO');xaBtn()}
function xaUnder(on){XA.act=true;admin.under=on;if(on){car.air=true;car.vy=-8;pop('🕳 ATRAVIESAS EL SUELO (Q sube)')}else{car.y=gH(car.x,car.z);car.vy=0;car.air=false}admSync();xaBtn()}
function xaSafe(){admin.under=false;car.x=Math.max(-8,Math.min(8,car.x));car.vx=0;car.y=gH(car.x,car.z);car.vy=0;car.air=false;car.flip=0;invul=Math.max(invul,2);admSync();xaBtn()}
function xaChaos(on){XA.chaos=on;XA.act=true;XA.chT=0;XA.chPaused=false;
 if(on){XA.mT=XA.lT=XA.vT=0;XA.qT=3;XA.uT=2;XA.zT=4;XA.tT=6;XA.sT=10;XA.gT=5;XA.fT=3;pop('☢️ ¡CAOS ABSOLUTO!');roar(1.3);shake=2;if(XA.cat.zom&&!XA.zom){xaZom(true);XA.chZ=true}}
 else{xaClearChaos();if(XA.gOn){axSet('g',1);XA.gOn=false}if(XA.chZ){xaZom(false);XA.chZ=false}if(D.tor){dsKill('tor');dsBtn()}dsKill('tsu')}xaBtn()}
function xaRain(on){XA.rain=on;if(on)XA.act=true;rainOn(on);xaBtn()}
function xaFilter(n){XA.filter=n||'';const c=R.domElement.classList;['matrix','sepia','invert','neon','bw'].forEach(x=>c.remove('fx-'+x));if(n){c.add('fx-'+n);XA.act=true}xaBtn()}
function xaRoad(hex){if(hex){road.material.color.set(hex);XA.roadTint=true;XA.act=true}else{road.material.color.set(0xffffff);XA.roadTint=false}}

/* ----- parar / restaurar ----- */
function xaStop(){if(!XA.act)return;XA.zom=false;XA.armyRows=0;XA.empty=false;XA.meteorRain=false;XA.quakeOn=false;XA.permNit=false;XA.lightning=false;
 if(XA.chaos)xaChaos(false);XA.chaos=false;if(XA.dark)xaDark(false);xaClearChaos();xaKill();XA.shells.forEach(s=>S.remove(s.m));XA.shells.length=0;xaCloneDel(true);
 if(XA.rain){XA.rain=false;rainOn(0)}xaFilter('');xaRoad(0);rndStop();
 if(admin.under){admin.under=false;car.y=gH(car.x,car.z);car.vy=0;car.air=false;admSync()}XA.act=false;xaBtn()}
/* devuelve parámetros, cámara, tiempo, gravedad y escala a sus valores originales (idempotente) */
function xaResetAll(){xaStop();for(const k in XD)XP[k]=XD[k];XA.tsE=1;XA.camMode='normal';XA.gOn=false;XA.lite=false;car3.scale.setScalar(1);car3.visible=true;xaFilter('');xaRoad(0);
 FOG.near=80;FOG.far=250;if(!XA.dark)S.background=skT;axUI(true)}

/* puerta del admin: pide contraseña (se compara por hash, ver seguridad.js) */
function admGate(ok){
  const pn=$('adm');if(pn.classList.contains('on')){ok();return}
  if($('agate'))return;
  const rel=()=>{for(const k in keys)keys[k]=0;if(typeof touchKeysReset==='function')touchKeysReset()};   // suelta teclas pegadas (p. ej. la A del Konami)
  rel();
  const d=mk('div');d.id='agate';
  d.innerHTML="<div class='agb'><b>🔒 ADMIN</b><input class='inp' id='agin' type='password' autocomplete='off' placeholder='Contraseña'><p id='agm'></p><div class='cs2'><button class='go alt' id='agx'>CANCELAR</button><button class='go' id='ago'>ENTRAR</button></div></div>";
  document.body.appendChild(d);const inp=$('agin'),m=$('agm');inp.focus();
  const close=()=>{d.remove();rel()};
  const go=()=>{const w=SEC.bloqueado();if(w){m.textContent='Demasiados intentos. Espera '+w+' s.';return}
    if(SEC.admin(inp.value)){close();rel();ok()}else{m.textContent=SEC.bloqueado()?'Demasiados intentos. Espera 1 min.':'Contraseña incorrecta';inp.value='';inp.focus()}};
  $('ago').onclick=go;$('agx').onclick=close;inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')go();else if(e.key==='Escape')close()};
  inp.onkeyup=e=>{if(e.key==='Enter')e.stopPropagation()}}
/* panel admin: código Konami */
{let kb=[];const pn=$('adm'),g=id=>$(id),sl=g('aspd'),sn=g('aspdn'),ck=g('ainv');
  const sync=src=>{
    if(src==='n'){XA.reqTxt=String(sn.value).trim();const v=Math.max(.2,Math.min(1e300,+sn.value||1));admin.spd=v;sl.value=Math.min(100,v)}else{admin.spd=+sl.value;sn.value=admin.spd;XA.reqTxt=String(admin.spd)}
    admin.ghost=g('aghost').checked;admin.fly=g('afly').checked;admin.tur=g('atur').checked;admin.free=g('afree').checked;
    const f=g('aform').value;if(f!==admin.form){admin.form=f;if(f==='godzilla'){roar(1.2);zBr=1.2}else if(f==='granny')pop('👵 ¡ABUELA EXPLOSIVA!')}
    admin.inv=ck.checked||admin.ghost||admin.form!==''||admin.under;
    g('aval').textContent='x'+(admin.spd<10?admin.spd.toFixed(1):admin.spd<1e6?Math.round(admin.spd):admin.spd.toExponential(1));
    D.sz=+g('adsz').value;D.it=+g('adin').value;g('adszv').textContent='x'+D.sz.toFixed(1);g('adinv').textContent='x'+D.it.toFixed(1)};
  admSync=sync;sl.addEventListener('input',()=>sync());sn.addEventListener('input',()=>sync('n'));['ainv','aghost','afly','atur','afree','aform','adsz','adin'].forEach(id=>g(id).addEventListener(id==='adsz'||id==='adin'?'input':'change',()=>sync()));
  [['afu','KeyQ'],['afd','KeyE']].forEach(([id,k])=>{const b=g(id);b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1});['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,()=>keys[k]=0))});
  g('aboom').onclick=bigBoom;g('dwat').onclick=()=>{D.waterOn=!D.waterOn;dsBtn()};g('dtsu').onclick=tsunami;g('dtor').onclick=()=>{if(D.tor)dsKill('tor');else tornado();dsBtn()};
  g('dbli').onclick=()=>{D.bliz=!D.bliz;if(!D.bliz){FOG.near=80;FOG.far=250;snow.visible=false}dsBtn()};g('dstop').onclick=dsStop;
  g('arst').onclick=()=>{sl.value=1;sn.value=1;ck.checked=false;['aghost','afly','atur','afree'].forEach(id=>g(id).checked=false);g('aform').value='';dsStop();sync()};g('acls').onclick=()=>pn.classList.remove('on');
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&(e.target.type==='range'||e.target.type==='number')&&e.code.startsWith('Arrow'))return;kb.push(e.code);if(kb.length>10)kb.shift();if(kb.length===10&&SEC.konami(kb)){kb=[];admGate(()=>{pn.classList.toggle('on');snd(660,.25,'square',.06,400)})}})}
/* ======================================================================
   ADMIN GOD MODE · panel con pestañas, presets, debug, cinemáticas
   ====================================================================== */
const PRM={};[
['accM','Aceleración ×',.1,5,.1],['cap','Velocidad máxima efectiva (m/s)',30,299792458,1000],['brakeM','Frenado ×',.1,5,.1],['steerM','Fuerza de giro ×',.2,4,.1],['grip','Agarre / sensibilidad lateral ×',.1,4,.05],
['dragM','Resistencia (deceleración) ×',.1,5,.1],['nitM','Impulso de turbo ×',0,5,.1],['jumpM','Fuerza de salto en rampas ×',0,4,.1],['flipM','Fuerza de voltereta ×',0,5,.1],['carS','Escala del buggy ×',.2,6,.05],
['g','Gravedad ×',-3,10,.1],['lit','Intensidad de luz ×',.1,3,.05],['fogM','Niebla (distancia) ×',.2,8,.1],
['camD','Distancia de cámara ×',.3,4,.05],['camH','Altura de cámara ×',.2,5,.05],['camX','Desplazamiento lateral',-20,20,.5],['camSm','Seguimiento (más = más rígida)',1,20,.5],['fovAdd','Zoom / FOV',-30,40,1],['shk','Vibración de cámara ×',0,4,.1],
['ts','Tiempo ×',0,5,.05],['formS','Tamaño de la transformación ×',.3,4,.05],['cMax','Clones (máximo)',1,12,1],['cSep','Separación de clones ×',.5,4,.1],['cFol','Velocidad de seguimiento',.5,10,.5],
['metRate','Meteoritos por segundo',.2,8,.1],['metSize','Tamaño de meteorito ×',.4,3,.1],['qkI','Intensidad del terremoto ×',.2,3,.1],['pulseR','Radio de la onda expansiva',20,150,5],
['zMax','Zombis máximos',5,120,1],['zRate','Frecuencia de aparición ×',.2,5,.1],['zSpd','Velocidad de zombis ×',.3,3,.1],['zHp','Resistencia de zombis',1,5,1],
['aRows','Filas del ejército (tamaño)',1,30,1],['aSpd','Velocidad del ejército ×',.3,3,.1],['ci','Intensidad del caos ×',.3,3,.1],['chDur','Duración del caos (s, 0=∞)',0,120,5],
['dkL','Nivel de luz en la oscuridad',.02,.6,.02],['glI','Intensidad del glitch',0,3,.1],['dkH','Color dominante (0-1, -1=auto)',-1,1,.05],['dkDur','Duración realidad rota (s, 0=∞)',0,120,5],
['rnN','Efectos aleatorios por pulsación',1,5,1],['rnDur','Duración de efectos aleatorios (s, 0=∞)',0,120,5],['rnInt','Repetir cada (s, 0=no)',0,60,1]
].forEach(a=>PRM[a[0]]={l:a[1],min:a[2],max:a[3],step:a[4]});
const AX={rows:{},tg:[],info:[],tab:'q',dbg:false,autoLite:true,lastT:performance.now(),lowN:0,fps:60,rndNoCostly:false,pre:null};
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const axNum=(v,d)=>{v=parseFloat(v);return isFinite(v)?v:d};
function axSet(k,v){const p=PRM[k];if(!p)return;v=Math.max(p.min,Math.min(p.max,axNum(v,XD[k])));XP[k]=v;const r=AX.rows[k];if(r){r.rng.value=v;r.num.value=+(+v).toFixed(3)}if(k==='ts')XA.tsE=v<=.001?.0005:v}
function axRow(sec,k){const p=PRM[k],w=mk('div','axr'),top=mk('div','axl'),sp=mk('span',0,p.l),num=mk('input'),rng=mk('input'),rs=mk('button','axm','↺');
 num.type='number';num.step=p.step;num.min=p.min;num.max=p.max;num.setAttribute('inputmode','decimal');rng.type='range';rng.min=p.min;rng.max=p.max;rng.step=p.step;
 const ap=v=>{axSet(k,v);xaMark();axUI()};rng.oninput=()=>ap(rng.value);num.onchange=()=>ap(num.value);rs.onclick=()=>ap(XD[k]);
 top.append(sp,num,rs);w.append(top,rng);sec.appendChild(w);AX.rows[k]={rng,num};rng.value=XP[k];num.value=XP[k]}
function axH(sec,t){sec.appendChild(mk('h5',0,t))}
function axGrid(sec){const g=mk('div','axg');sec.appendChild(g);return g}
function axBtn(sec,label,fn,on,cls){const b=mk('button',cls||'axa',label);b.onclick=()=>{try{fn(b)}catch(e){xaErr(e)}if(!(cls&&cls.includes('nm')))xaMark();axUI()};if(on)AX.tg.push([b,on]);sec.appendChild(b);return b}
function axInfo(sec,fn){const d=mk('div','axi');sec.appendChild(d);AX.info.push([d,fn]);return d}
function axSel(sec,label,opts,get,set){const l=mk('label'),sp=mk('span',0,label),s=mk('select');opts.forEach(o=>{const e=mk('option',0,o[1]);e.value=o[0];s.appendChild(e)});s.value=get();s.onchange=()=>{set(s.value);xaMark();axUI()};l.append(sp,s);sec.appendChild(l);AX.tg.push([{classList:{toggle(){if(s.value!==get())s.value=get()}}},()=>0]);return s}
const tgSet=(id,v)=>{const e=$(id);if(e&&e.checked!==!!v){e.checked=!!v;admSync()}};
const setForm=v=>{const s=$('aform');s.value=v;s.dispatchEvent(new Event('change'))};
const axSpdSet=v=>{const s=$('aspdn');s.value=v;s.dispatchEvent(new Event('input'))};
const AXMAX='1'+'0'.repeat(243);
const axFmt=t=>{t=String(t||'1');return t.length>14?t.slice(0,3)+'…('+t.length+' cifras)×':t+'×'};

/* ----- ajustes persistentes (cinemáticas) ----- */
const XK='nb_xa_cfg';
function xaLoadCfg(){try{const o=JSON.parse(localStorage.getItem(XK)||'{}');XA.skipAll=!!o.skipAll;XA.skipIntro=!!o.skipIntro;XA.subs=o.subs!==false}catch(e){}document.body.classList.toggle('nosub',!XA.subs)}
function xaSaveCfg(){try{localStorage.setItem(XK,JSON.stringify({skipAll:XA.skipAll,skipIntro:XA.skipIntro,subs:XA.subs}))}catch(e){}document.body.classList.toggle('nosub',!XA.subs)}
xaLoadCfg();

/* ----- admin aleatorio (efectos temporales con restauración) ----- */
const tgc=id=>({is:()=>$(id).checked,on:()=>tgSet(id,1),off:()=>tgSet(id,0)});
const RA=[
 {k:'spd',l:'⚡ Velocidad alterada',is:()=>admin.spd!==1,on:()=>axSpdSet([3,8,25,100,5000,1e300][Math.random()*6|0]),off:()=>axSpdSet(1)},
 {k:'inv',l:'🛡 Invulnerable',...tgc('ainv')},{k:'fly',l:'🕊 Vuelo',...tgc('afly')},{k:'ghost',l:'👻 Fantasma',...tgc('aghost')},{k:'tur',l:'🔫 Torreta',...tgc('atur')},{k:'free',l:'🗺 Fuera del mapa',...tgc('afree')},
 {k:'form',l:'🦖 Transformación',is:()=>admin.form!=='',on:()=>setForm(['godzilla','granny'][Math.random()*2|0]),off:()=>setForm('')},
 {k:'water',l:'🌊 Agua',is:()=>D.waterOn,on:()=>{D.waterOn=true;dsBtn()},off:()=>{D.waterOn=false;dsBtn()}},
 {k:'tsu',l:'🌊 Tsunami',is:()=>!!D.tsu,on:tsunami,off:()=>dsKill('tsu')},
 {k:'tor',l:'🌪 Tornado',is:()=>!!D.tor,on:()=>{tornado();dsBtn()},off:()=>{dsKill('tor');dsBtn()}},
 {k:'bli',l:'❄ Ventisca',is:()=>D.bliz,on:()=>{D.bliz=true;dsBtn()},off:()=>{D.bliz=false;FOG.near=80;FOG.far=250;snow.visible=false;dsBtn()}},
 {k:'zom',l:'🧟 Invasión zombi',costly:1,is:()=>XA.zom,on:()=>xaZom(true),off:()=>xaZom(false)},
 {k:'army',l:'🪖 Ejército',costly:1,is:()=>XA.armyRows>0||xaCnt('s')>0,on:xaArmy,off:xaArmyKill},
 {k:'under',l:'👻 Bajo el suelo',is:()=>admin.under,on:()=>xaUnder(true),off:()=>xaUnder(false)},
 {k:'chaos',l:'☢️ Caos absoluto',costly:1,is:()=>XA.chaos,on:()=>xaChaos(true),off:()=>xaChaos(false)},
 {k:'dark',l:'🕳 Realidad rota',is:()=>XA.dark,on:()=>xaDark(true),off:()=>xaDark(false)},
 {k:'met',l:'☄ Lluvia de meteoritos',costly:1,is:()=>XA.meteorRain,on:()=>{XA.meteorRain=true;XA.act=true},off:()=>{XA.meteorRain=false}},
 {k:'qk',l:'🌋 Terremoto',is:()=>XA.quakeOn,on:()=>{XA.quakeOn=true;XA.act=true},off:()=>{XA.quakeOn=false}},
 {k:'grav',l:'🌀 Gravedad alterada',is:()=>XP.g!==1,on:()=>axSet('g',[-1,.2,0,3][Math.random()*4|0]),off:()=>axSet('g',1)},
 {k:'size',l:'📏 Tamaño del buggy',is:()=>XP.carS!==1,on:()=>axSet('carS',Math.random()<.5?.35:3),off:()=>axSet('carS',1)},
 {k:'ice',l:'🧊 Carretera helada',is:()=>XP.grip<.5,on:()=>axSet('grip',.15),off:()=>axSet('grip',1)},
 {k:'time',l:'⏱ Tiempo alterado',is:()=>XP.ts!==1,on:()=>axSet('ts',[.3,.5,2][Math.random()*3|0]),off:()=>axSet('ts',1)},
 {k:'cam',l:'🎥 Cámara especial',is:()=>XA.camMode!=='normal',on:()=>xaCamMode(['orbit','side','top','cine','far'][Math.random()*5|0]),off:()=>xaCamMode('normal')},
 {k:'clone',l:'🚗 Clones',is:()=>XA.clones.length>0,on:()=>xaCloneAdd(4),off:()=>xaCloneDel(true)},
 {k:'phys',l:'🧪 Físicas mutadas',is:()=>XP.jumpM!==1||XP.steerM!==1,on:()=>{axSet('jumpM',rr(.5,3));axSet('steerM',rr(.6,2))},off:()=>{axSet('jumpM',1);axSet('steerM',1)}},
 {k:'rain',l:'🌧 Lluvia',is:()=>XA.rain,on:()=>xaRain(true),off:()=>xaRain(false)},
 {k:'flt',l:'🎨 Filtro de color',is:()=>!!XA.filter,on:()=>xaFilter(['matrix','sepia','invert','neon','bw'][Math.random()*5|0]),off:()=>xaFilter('')},
 {k:'pulse',l:'💫 Onda expansiva',once:1,on:xaPulse},{k:'boom',l:'💥 Explosión',once:1,on:bigBoom}];
function rndApply(){if(st!=='play'){pop('Solo durante una partida');return}xaMark();let pool=RA.filter(a=>a.once||!a.is());if(AX.rndNoCostly)pool=pool.filter(a=>!a.costly);
 const n=Math.round(XP.rnN);for(let i=0;i<n&&pool.length;i++){const a=pool.splice(Math.random()*pool.length|0,1)[0];try{a.on()}catch(e){xaErr(e)}if(a.off)XA.rnd.push({a,t:XP.rnDur>0?XP.rnDur:0});XA.act=true;pop('🎲 '+a.l)}}
function rndStop(){const l=XA.rnd.splice(0);l.forEach(r=>{try{r.a.off()}catch(e){xaErr(e)}});XA.rnT=0}
function rndUpd(rd){if(XA.rnPaused)return;for(let i=XA.rnd.length-1;i>=0;i--){const r=XA.rnd[i];if(r.t>0){r.t-=rd;if(r.t<=0){XA.rnd.splice(i,1);try{r.a.off()}catch(e){xaErr(e)}}}}
 if(XP.rnInt>0){XA.rnT-=rd;if(XA.rnT<=0){XA.rnT=XP.rnInt;rndApply()}}}

/* ----- bucle por frame de todos los extras ----- */
function xaUpd(dt,t){const rd=XA.rdt;
 if(!isFinite(speed))speed=0;if(!isFinite(car.y)||!isFinite(car.vy)||!isFinite(car.x)){car.y=0;car.vy=0;car.x=0;car.air=false}
 if(car.y>400){car.y=400;if(car.vy>0)car.vy=0}
 if(XA.empty){chunks.forEach(xaEmptyChunk);eT=9}
 if(XA.zom){XA.zomT-=dt;if(XA.zomT<=0){XA.zomT=Math.max(.06,.4/(XP.zRate*Math.max(.5,D.it)));if(xaCnt('z')<XP.zMax*xaK())for(let i=0,n=1+(Math.random()*3|0);i<n;i++)xaSpZ()}}
 if(XA.armyRows>0){XA.wvT-=dt;if(XA.wvT<=0){XA.wvT=1.3;xaSpRow();XA.armyRows--}XA.tkT-=dt;if(XA.tkT<=0){XA.tkT=2.6;if(xaCnt('t')<5*xaK())xaSpTank()}}
 xaMobUpd(dt,t);if(st!=='play')return;
 if(!XA.dark||XP.glI<=0)car3.scale.setScalar(XP.carS);
 zZ.scale.setScalar(.2*XP.formS);gG.scale.setScalar(3*XP.formS);
 xaCam(t);
 if(speed>120){if(Math.random()<.6)burst(new V3(car.x+rr(-9,9),rr(.3,7),car.z-rr(15,45)),1,Math.random()<.5?0x19f2ff:0xff2bd6,2,Math.min(speed,400)*.4);shake=Math.max(shake,Math.min(.35,Math.log10(speed)*.06))}
 if(XA.meteorRain){XA.mrT-=dt;if(XA.mrT<=0){XA.mrT=1/XP.metRate;xaMeteor()}}
 if(XA.lightning){XA.lgT-=rd;if(XA.lgT<=0){XA.lgT=rr(3,8);xaFlash()}}
 if(XA.chaos)xaChaosUpd(dt,t);
 xaEnt(dt,t);if(st!=='play')return;
 xaCloneUpd(dt);
 if((XA.chaos&&XA.cat.glitch)||XA.dark)xaGl(dt,0,XA.dark?Math.round(9*XP.glI):4);else if(XA.gl.length)xaGl(dt,0,0);
 if(XA.dark){xaDarkUpd(dt,t);if(XP.dkDur>0){XA.dkT+=rd;if(XA.dkT>=XP.dkDur)xaDark(false)}}
 else if(!D.bliz){FOG.near=80*XP.fogM;FOG.far=250*XP.fogM}
 rndUpd(rd)}

/* ----- restauraciones ----- */
function axStopDis(){dsKill('tsu');dsKill('tor');D.waterOn=false;D.tsuW=0;D.water=0;D.wl=0;awater.visible=false;if(D.bliz){D.bliz=false;FOG.near=80;FOG.far=250}snow.visible=false;dsBtn();
 if(XA.chaos)xaChaos(false);XA.meteorRain=false;XA.quakeOn=false;xaClearChaos()}
function axStopAll(){rndStop();dsStop();pop('🧹 Efectos detenidos')}
function axRestoreAll(){rndStop();$('arst').click();xaResetAll();dsStop();axUI(true);pop('♻ TODO RESTAURADO')}
function axPanic(){axStopAll();xaResetAll();xaSafe();setForm('');axUI(true)}
const PHYS=['accM','cap','brakeM','steerM','grip','dragM','nitM','jumpM','flipM'];

/* ----- presets ----- */
const PK='nb_xa_presets',CAMS=['normal','near','far','fp','orbit','side','top','cine'],FLTS=['','matrix','sepia','invert','neon','bw'];
function axSnap(){return{v:1,p:Object.assign({},XP),flags:{ainv:$('ainv').checked,afly:$('afly').checked,aghost:$('aghost').checked,atur:$('atur').checked,afree:$('afree').checked},form:$('aform').value,
 tg:{zom:XA.zom,chaos:XA.chaos,dark:XA.dark,under:admin.under,empty:XA.empty,met:XA.meteorRain,qk:XA.quakeOn,rain:XA.rain,lg:XA.lightning,nit:XA.permNit},cl:XA.clones.length,cmode:XA.cmode,cam:XA.camMode,flt:XA.filter,cat:Object.assign({},XA.cat),spd:Math.min(1e300,admin.spd)}}
function axApply(s){if(!s||typeof s!=='object'||s.v!==1){pop('Preset no válido');return false}
 axRestoreAll();for(const k in PRM)if(s.p&&k in s.p)axSet(k,s.p[k]);
 if(s.flags)for(const id of['ainv','afly','aghost','atur','afree'])tgSet(id,s.flags[id]);
 if(['','godzilla','granny'].includes(s.form))setForm(s.form);if(typeof s.spd==='number'&&isFinite(s.spd)&&s.spd!==1)axSpdSet(s.spd);
 if(s.cat&&typeof s.cat==='object')for(const k in XA.cat)if(k in s.cat)XA.cat[k]=s.cat[k]?1:0;
 if(CAMS.includes(s.cam)&&s.cam!=='normal')XA.camMode=s.cam;if(FLTS.includes(s.flt))xaFilter(s.flt);if(['follow','static','mimic'].includes(s.cmode))XA.cmode=s.cmode;
 const T=s.tg||{};if(T.zom)xaZom(true);if(T.chaos)xaChaos(true);if(T.dark)xaDark(true);if(T.under)xaUnder(true);if(T.empty)xaEmpty(true);if(T.met){XA.meteorRain=true;XA.act=true}
 if(T.qk){XA.quakeOn=true;XA.act=true}if(T.rain)xaRain(true);if(T.lg){XA.lightning=true;XA.act=true}if(T.nit){XA.permNit=true;XA.act=true}
 if(+s.cl>0)xaCloneAdd(Math.min(12,+s.cl|0));xaMark();axUI(true);return true}
const PRE=[
 ['NORMAL','Restaura todo',()=>axRestoreAll()],
 ['DIOS','Invulnerable + vuelo + fuera del mapa',()=>{axRestoreAll();tgSet('ainv',1);tgSet('afly',1);tgSet('afree',1)}],
 ['APOCALIPSIS','Meteoritos + terremoto + tornado + caos (lava/volcanes)',()=>{axRestoreAll();Object.keys(XA.cat).forEach(k=>XA.cat[k]=0);Object.assign(XA.cat,{met:1,lava:1,vol:1,qk:1,tor:1});XA.meteorRain=true;XA.quakeOn=true;XA.act=true;axSet('ci',.8);xaChaos(true)}],
 ['MATRIX','Tiempo lento + filtro verde',()=>{axRestoreAll();axSet('ts',.6);axSet('lit',.7);xaFilter('matrix')}],
 ['GRAVEDAD CERO','Gravedad 0.15× y saltos largos',()=>{axRestoreAll();axSet('g',.15);axSet('jumpM',1.6)}],
 ['GIGANTE','Buggy ×3',()=>{axRestoreAll();axSet('carS',3);axSet('camD',1.8);axSet('camH',1.6)}],
 ['CAOS TOTAL','Caos absoluto + efectos aleatorios',()=>{axRestoreAll();Object.assign(XA.cat,{met:1,lava:1,vol:1,qk:1,ufo:1,zil:1,glitch:1,flash:1,zom:0,tor:0,tsu:0,grav:0});xaChaos(true);rndApply()}],
 ['CINE','Cámara cinematográfica',()=>{axRestoreAll();xaCamMode('cine');XA.subs=true;xaSaveCfg()}],
 ['INVASIÓN','Zombis + ejército mediano',()=>{axRestoreAll();axSet('aRows',10);xaZom(true);xaArmy()}],
 ['REALIDAD ROTA','Oscuridad, niebla y glitches',()=>{axRestoreAll();xaDark(true)}]];
const getCP=()=>{try{const o=JSON.parse(localStorage.getItem(PK)||'{}');return o&&typeof o==='object'?o:{}}catch(e){return{}}};
const setCP=o=>{try{localStorage.setItem(PK,JSON.stringify(o))}catch(e){pop('No se pudo guardar')}};
function axPreList(){const c=AX.pre;if(!c)return;c.innerHTML='';const o=getCP(),ks=Object.keys(o);if(!ks.length){c.appendChild(mk('div','axi','Sin presets personalizados'));return}
 ks.forEach(n=>{const r=mk('div','axg'),l=mk('button','axa',null);l.textContent='▶ '+n;l.onclick=()=>{const s=getCP()[n];if(axApply(s))pop('Preset: '+n)};
  const e=mk('button','axa','✏ / 🗑');e.onclick=()=>{const v=prompt('Nuevo nombre para "'+n+'" (vacío = eliminar):',n);if(v===null)return;const q=getCP();if(v.trim()===''){delete q[n]}else{const nn=v.trim().slice(0,24);q[nn]=q[n];if(nn!==n)delete q[n]}setCP(q);axPreList()};r.append(l,e);c.appendChild(r)})}

/* ----- construcción del panel ----- */
{const P=$('adm'),tabsEl=$('axtabs'),TABS=[['q','⚡ RÁPIDO'],['v','🚗 VEHÍCULO'],['t','🦖 TRANSF.'],['d','💥 DESASTRES'],['w','🌍 MUNDO'],['c','🎥 CÁMARA/CINE'],['m','⏱ TIEMPO'],['g','🐞 DEBUG'],['p','💾 PRESETS']],S_=id=>$('axs-'+id);
 const showTab=k=>{AX.tab=k;TABS.forEach(([id])=>{S_(id).classList.toggle('on',id===k);AX.tb[id].classList.toggle('on',id===k)})};AX.tb={};
 TABS.forEach(([id,l])=>{const b=mk('button',0,l);b.onclick=()=>showTab(id);tabsEl.appendChild(b);AX.tb[id]=b});

 /* RÁPIDO */
 {const Q=S_('q');axH(Q,'ACCESO RÁPIDO');const g=axGrid(Q);
  axBtn(g,'🧟 INVASIÓN ZOMBI',()=>xaZom(!XA.zom),()=>XA.zom);
  axBtn(g,'🚀 VELOCIDAD MÁXIMA',()=>axSpdSet(admin.spd>=1e300?1:AXMAX),()=>admin.spd>=1e300);
  axBtn(g,'⏭ SALTAR CINEMÁTICAS',()=>{if(cn)xaCine();else pop('No hay cinemática activa')},()=>!!cn);
  axBtn(g,'🗑 VACIAR MAPA',()=>{if(XA.empty)xaEmpty(false);else if(confirm('¿Vaciar el mapa? (Se puede reconstruir desde la pestaña MUNDO)'))xaEmpty(true)},()=>XA.empty);
  axBtn(g,'👻 ATRAVESAR EL SUELO',()=>xaUnder(!admin.under),()=>admin.under);
  axBtn(g,'🪖 QUE VENGA UN EJÉRCITO',xaArmy,()=>XA.armyRows>0||xaCnt('s')>0);
  axBtn(g,'☢️ CAOS ABSOLUTO',()=>xaChaos(!XA.chaos),()=>XA.chaos);
  axBtn(g,'🎲 ADMIN ALEATORIO',rndApply,()=>XA.rnd.length>0);
  axBtn(g,'🕳️ REALIDAD ROTA',()=>xaDark(!XA.dark),()=>XA.dark);
  axBtn(g,'🛟 VOLVER A ZONA SEGURA',xaSafe);
  axBtn(g,'🧹 DETENER TODOS LOS EFECTOS',axStopAll,null,'axa d');
  axBtn(g,'♻ RESTAURAR TODO',()=>{axRestoreAll()},null,'axa d');
  axInfo(Q,()=>'Efectos activos: <b>'+axEffCount()+'</b> · '+(admin.used?'🧪 partida EXPERIMENTAL (no puntúa)':'partida normal'))}

 /* VEHÍCULO */
 {const V=S_('v');axH(V,'MOVIMIENTO');['accM','cap','brakeM','steerM','grip','dragM','nitM','jumpM','flipM'].forEach(k=>axRow(V,k));
  const g=axGrid(V);axBtn(g,'🔥 TURBO PERMANENTE',()=>{XA.permNit=!XA.permNit;if(XA.permNit)XA.act=true},()=>XA.permNit);
  axBtn(g,'🧊 CARRETERA HELADA',()=>axSet('grip',XP.grip<.5?1:.15),()=>XP.grip<.5);axBtn(g,'🛑 FRENADO EXTREMO',()=>axSet('brakeM',XP.brakeM>3?1:5),()=>XP.brakeM>3);
  axBtn(g,'↺ RESTAURAR FÍSICAS',()=>PHYS.forEach(k=>axSet(k,XD[k])),null,'axa d');
  axH(V,'TAMAÑO DEL BUGGY');axRow(V,'carS');const g2=axGrid(V);axBtn(g2,'🐜 DIMINUTO',()=>axSet('carS',.3));axBtn(g2,'🦣 GIGANTE',()=>axSet('carS',3));axBtn(g2,'↺ NORMAL',()=>axSet('carS',1));
  V.appendChild(mk('div','axi','Nota: la escala cambia el modelo (y la zona de impacto de zombis/ejército); las colisiones con obstáculos originales no se reescalan.'));
  const sp=$('aspdn');
  $('aspdm').onclick=()=>{xaMark();axSpdSet(Math.max(.2,Math.min(1e300,admin.spd/2)))};$('aspdp').onclick=()=>{xaMark();axSpdSet(Math.min(1e300,admin.spd*2))};
  $('aspdn1').onclick=()=>axSpdSet(1);$('aspdmax').onclick=()=>{xaMark();axSpdSet(AXMAX)};
  $('axsvsp').onclick=()=>{try{localStorage.setItem('nb_xa_spd',sp.value.slice(0,400));pop('💾 Velocidad guardada')}catch(e){}};
  $('axldsp').onclick=()=>{try{const v=localStorage.getItem('nb_xa_spd');if(v){xaMark();axSpdSet(v)}else pop('Nada guardado')}catch(e){}};
  axInfo(V,()=>'Solicitado: <b>'+axFmt(XA.reqTxt)+'</b><br>Aplicado a las físicas: <b>x'+(XA.effM>=1000?XA.effM.toExponential(1):XA.effM.toFixed(2))+'</b> · '+Math.round(speed)+' m/s (tope '+Math.round(XP.cap)+' m/s)')}

 /* TRANSFORMACIONES */
 {const T=S_('t');axRow(T,'formS');axBtn(T,'↩ VOLVER AL BUGGY ORIGINAL',()=>setForm(''),null,'axa');
  axH(T,'CLONES DEL BUGGY');axSel(T,'Modo',[['follow','Seguidores'],['static','Estáticos'],['mimic','Imitadores (espejo)']],()=>XA.cmode,v=>{XA.cmode=v});['cMax','cSep','cFol'].forEach(k=>axRow(T,k));
  const g=axGrid(T);axBtn(g,'➕ CREAR 1',()=>xaCloneAdd(1));axBtn(g,'➕ CREAR MÁX.',()=>xaCloneAdd(12));axBtn(g,'➖ QUITAR ÚLTIMO',()=>xaCloneDel(false));axBtn(g,'🗑 QUITAR TODOS',()=>xaCloneDel(true),null,'axa d');
  axInfo(T,()=>'Clones: <b>'+XA.clones.length+'</b> / '+Math.min(XP.cMax,12*xaK()))}

 /* DESASTRES */
 {const D_=S_('d');
  axH(D_,'METEORITOS');axBtn(D_,'☄ LLUVIA DE METEORITOS',()=>{XA.meteorRain=!XA.meteorRain;if(XA.meteorRain)XA.act=true},()=>XA.meteorRain);['metRate','metSize'].forEach(k=>axRow(D_,k));
  axH(D_,'TERREMOTO');axBtn(D_,'🌋 TERREMOTO CONTINUO',()=>{XA.quakeOn=!XA.quakeOn;if(XA.quakeOn){XA.act=true;pop('🌋 ¡TERREMOTO!')}},()=>XA.quakeOn);axRow(D_,'qkI');
  axH(D_,'CAÑÓN DE IMPULSOS');axRow(D_,'pulseR');axBtn(D_,'💫 DISPARAR ONDA EXPANSIVA',xaPulse);
  axH(D_,'🧟 INVASIÓN ZOMBI');axBtn(D_,'🧟 INICIAR / DETENER INVASIÓN ZOMBI',()=>xaZom(!XA.zom),()=>XA.zom,'axa big');['zMax','zRate','zSpd','zHp'].forEach(k=>axRow(D_,k));
  axSel(D_,'Aparición',[['front','Delante'],['sides','Laterales'],['around','Alrededor']],()=>XA.zSpawn,v=>{XA.zSpawn=v});
  axBtn(D_,'🗑 ELIMINAR TODOS LOS ZOMBIS',()=>xaKill('z'),null,'axa d');axInfo(D_,()=>'Zombis activos: <b>'+xaCnt('z')+'</b> · eliminados: '+XA.kills);
  axH(D_,'🪖 EJÉRCITO');const ga=axGrid(D_);axBtn(ga,'Pequeño',()=>{axSet('aRows',5);xaArmy()});axBtn(ga,'Mediano',()=>{axSet('aRows',10);xaArmy()});axBtn(ga,'Grande',()=>{axSet('aRows',20);xaArmy()});
  axBtn(D_,'🪖 QUE VENGA UN EJÉRCITO',xaArmy,()=>XA.armyRows>0,'axa big');['aRows','aSpd'].forEach(k=>axRow(D_,k));
  axSel(D_,'Entrada',[['front','Por delante'],['flanks','Por los flancos'],['mixed','Mixto']],()=>XA.aEntry,v=>{XA.aEntry=v});
  axBtn(D_,'🎯 PERSECUCIÓN',()=>{XA.aChase=!XA.aChase},()=>XA.aChase);axBtn(D_,'⏸ DETENER APARICIÓN',xaArmyStop);axBtn(D_,'🗑 ELIMINAR EJÉRCITO',xaArmyKill,null,'axa d');
  axInfo(D_,()=>'Soldados: <b>'+xaCnt('s')+'</b> · tanques: <b>'+xaCnt('t')+'</b> · filas por llegar: '+XA.armyRows);
  axH(D_,'☢️ CAOS ABSOLUTO');axBtn(D_,'☢️ CAOS ABSOLUTO',()=>xaChaos(!XA.chaos),()=>XA.chaos,'axa big');['ci','chDur'].forEach(k=>axRow(D_,k));
  const CL={met:'☄ Meteoritos',lava:'🔥 Lava',vol:'🌋 Volcanes',qk:'🌍 Terremotos',ufo:'👽 Aliens',zil:'🦖 Godzillas',zom:'🧟 Zombis',tor:'🌪 Tornados',tsu:'🌊 Tsunamis',grav:'🌀 Gravedad',glitch:'📺 Glitch',flash:'⚡ Relámpagos'};
  const gc=axGrid(D_);for(const k in CL)axBtn(gc,CL[k],()=>{XA.cat[k]=XA.cat[k]?0:1},()=>XA.cat[k],'axa sm');
  const gp=axGrid(D_);axBtn(gp,'⏸ PAUSAR / ▶ REANUDAR',()=>{XA.chPaused=!XA.chPaused},()=>XA.chPaused);axBtn(gp,'⏹ DETENER CAOS',()=>xaChaos(false),null,'axa d');
  axInfo(D_,()=>'Eventos de caos activos: <b>'+xaEvCount()+'</b>'+(XA.chaos?' · '+Math.round(XA.chT)+' s':''));
  D_.appendChild(mk('div','axi','Cada evento se detiene solo; "Parar desastres" limpia todo. Los límites se reducen en modo ligero.'));
  axBtn(D_,'🛑 DETENER TODOS LOS DESASTRES',axStopDis,null,'axa d')}

 /* MUNDO */
 {const W=S_('w');axH(W,'GRAVEDAD');axRow(W,'g');const gg=axGrid(W);[['Normal',1],['Reducida',.3],['Cero',0],['Invertida',-1],['Extrema',6]].forEach(([l,v])=>axBtn(gg,l,()=>axSet('g',v)));
  axH(W,'MAPA');const gm=axGrid(W);
  axBtn(gm,'1) Quitar mis efectos',()=>{xaClearChaos();xaKill();XA.shells.forEach(s=>S.remove(s.m));XA.shells.length=0;xaCloneDel(true)});
  axBtn(gm,'2) Efectos + enemigos',()=>{xaClearChaos();xaKill();enemies.forEach(e=>{if(!e.dead){e.dead=true;S.remove(e.g)}});debris.forEach(d=>S.remove(d.m));debris.length=0});
  axBtn(gm,'3) VACIAR TODO',()=>{if(confirm('¿Vaciar obstáculos, decoración y enemigos?'))xaEmpty(true)},()=>XA.empty,'axa d');
  axBtn(gm,'4) 🔨 RECONSTRUIR',()=>{if(confirm('¿Reconstruir el mapa desde tu posición?'))xaRebuild()},null,'axa');
  axBtn(W,'👻 ATRAVESAR EL SUELO (Q sube · E baja)',()=>xaUnder(!admin.under),()=>admin.under);axBtn(W,'🛟 VOLVER A ZONA SEGURA',xaSafe);
  axH(W,'ILUMINACIÓN, NIEBLA Y CLIMA');['lit','fogM'].forEach(k=>axRow(W,k));const gw=axGrid(W);
  axBtn(gw,'🌧 LLUVIA',()=>xaRain(!XA.rain),()=>XA.rain);axBtn(gw,'⚡ RELÁMPAGOS',()=>{XA.lightning=!XA.lightning;if(XA.lightning)XA.act=true},()=>XA.lightning);
  axSel(W,'Filtro de color',[['','Ninguno'],['matrix','Matrix'],['sepia','Sepia'],['invert','Invertido'],['neon','Neón'],['bw','Blanco y negro']],()=>XA.filter,v=>xaFilter(v));
  {const l=mk('label'),sp=mk('span',0,'Tinte de la carretera'),c=mk('input');c.type='color';c.value='#ffffff';c.oninput=()=>{xaRoad(c.value);xaMark()};l.append(sp,c);W.appendChild(l);axBtn(W,'↺ Carretera original',()=>{xaRoad(0);c.value='#ffffff'})}
  axH(W,'🕳️ REALIDAD ROTA');axBtn(W,'🕳️ REALIDAD ROTA (oscuridad + glitch)',()=>xaDark(!XA.dark),()=>XA.dark,'axa big');['dkL','glI','dkH','dkDur'].forEach(k=>axRow(W,k));
  axH(W,'🎲 ADMIN ALEATORIO');['rnN','rnDur','rnInt'].forEach(k=>axRow(W,k));axBtn(W,'💰 EXCLUIR EFECTOS COSTOSOS',()=>{AX.rndNoCostly=!AX.rndNoCostly},()=>AX.rndNoCostly,'axa');
  const gr=axGrid(W);axBtn(gr,'🎲 APLICAR',rndApply);axBtn(gr,'⏸ PAUSAR',()=>{XA.rnPaused=!XA.rnPaused},()=>XA.rnPaused);axBtn(gr,'⏹ DETENER + RESTAURAR',rndStop,null,'axa d');
  axInfo(W,()=>'Efectos aleatorios activos: <b>'+XA.rnd.map(r=>r.a.l).join(', ')+'</b>')}

 /* CÁMARA Y CINEMÁTICAS */
 {const C=S_('c');axH(C,'MODO DE CÁMARA');const g=axGrid(C);[['normal','Normal'],['near','Cercana'],['far','Lejana'],['fp','1ª persona'],['orbit','Orbital'],['side','Lateral'],['top','Elevada'],['cine','Cinematográfica']].forEach(([m,l])=>axBtn(g,l,()=>xaCamMode(m),()=>XA.camMode===m));
  ['camD','camH','camX','camSm','fovAdd','shk'].forEach(k=>axRow(C,k));axBtn(C,'↺ RESTAURAR CÁMARA',()=>{xaCamMode('normal');['camSm','shk'].forEach(k=>axSet(k,XD[k]))},null,'axa d');
  axH(C,'CINEMÁTICAS');
  axBtn(C,'🎬 CINEMÁTICAS: ACTIVADAS',()=>{XA.skipAll=!XA.skipAll;xaSaveCfg()},()=>!XA.skipAll,'axa nm').dataset.k='cinesw';
  axBtn(C,'⏩ SALTAR SOLO INTRODUCCIONES',()=>{XA.skipIntro=!XA.skipIntro;xaSaveCfg()},()=>XA.skipIntro,'axa nm');
  axBtn(C,'💬 SUBTÍTULOS Y TEXTOS',()=>{XA.subs=!XA.subs;xaSaveCfg()},()=>XA.subs,'axa nm');
  axBtn(C,'⏭ SALTAR CINEMÁTICA ACTUAL',()=>{if(cn)xaCine();else pop('No hay cinemática activa')},()=>!!cn,'axa nm');
  axBtn(C,'👁 VER CINEMÁTICAS (reactivar)',()=>{XA.skipAll=false;XA.skipIntro=false;XA.subs=true;xaSaveCfg()},null,'axa nm');
  axInfo(C,()=>'Cinemáticas: <b>'+(XA.skipAll?'DESACTIVADAS (se saltan)':XA.skipIntro?'solo intros saltadas':'activadas')+'</b> · ahora: '+(cn?'reproduciendo':'ninguna')+' · preferencia guardada');
  C.appendChild(mk('div','axi','Saltar ejecuta la lógica de finalización real (warp, fundidos, bonus, estado de juego): no se puntúa distinto. Director de cámara con posiciones guardadas: no implementado.'))}

 /* TIEMPO */
 {const M_=S_('m');axH(M_,'CONTROL DEL TIEMPO');axRow(M_,'ts');const g=axGrid(M_);[['1×',1],['0.5×',.5],['0.2× muy lento',.2],['❄ CONGELAR',0],['2×',2],['4×',4]].forEach(([l,v])=>axBtn(g,l,()=>axSet('ts',v),()=>XP.ts===v));
  axBtn(M_,'↺ TIEMPO NORMAL',()=>axSet('ts',1),null,'axa d');axInfo(M_,()=>'Multiplicador aplicado: <b>×'+XA.tsE.toFixed(4)+'</b>');
  M_.appendChild(mk('div','axi','El multiplicador escala el delta de todo el mundo (buggy, enemigos, partículas, desastres). El panel y el render siguen activos con el mundo congelado. Selección por sistema: no implementada.'))}

 /* DEBUG */
 {const G=S_('g');axH(G,'ESTADO');
  axInfo(G,()=>'FPS: <b>'+AX.fps.toFixed(0)+'</b> · frame: '+(AX.fps>0?(1000/AX.fps).toFixed(1):'-')+' ms (aprox.)<br>Pos: '+car.x.toFixed(1)+', '+car.y.toFixed(1)+', '+car.z.toFixed(1)+'<br>Velocidad: '+Math.round(speed)+' m/s · distancia: '+Math.floor(dist)+' m · estado: '+st);
  axInfo(G,()=>'Admin: '+(admin.used?'🧪 EXPERIMENTAL':'limpio')+' · efectos: '+axEffCount()+'<br>Desastres: '+(D.waterOn?'agua ':'')+(D.tsu?'tsunami ':'')+(D.tor?'tornado ':'')+(D.bliz?'ventisca ':'')+(xaEvCount()?'caos×'+xaEvCount():'')+'<br>Clones: '+XA.clones.length+' · zombis: '+xaCnt('z')+' · ejército: '+(xaCnt('s')+xaCnt('t'))+' · entidades admin: '+(xaMobN()+XA.met.length+XA.pool.length+XA.vol.length+XA.lb.length+XA.ufo.length+XA.zil.length+XA.cr.length+XA.clones.length));
  axInfo(G,()=>'Partículas: '+parts.length+' · escombros: '+debris.length+' · enemigos orig.: '+enemies.length+' · glitch: '+XA.gl.length+'<br>Cinemática: '+(cn?'sí':'no')+' · tiempo ×'+XA.tsE.toFixed(3)+' · escala ×'+XP.carS+' · gravedad ×'+XP.g+' · modo ligero: '+(XA.lite?'sí':'no'));
  const g=axGrid(G);axBtn(g,'📊 HUD DEBUG',()=>{AX.dbg=!AX.dbg;$('axdbg').style.display=AX.dbg?'block':'none'},()=>AX.dbg,'axa nm');axBtn(g,'🪶 MODO LIGERO',()=>{XA.lite=!XA.lite},()=>XA.lite,'axa nm');
  axBtn(g,'⚠ AUTO-LIGERO SI BAJA FPS',()=>{AX.autoLite=!AX.autoLite},()=>AX.autoLite,'axa nm');axBtn(g,'🧹 LIMPIAR TEMPORALES',()=>{xaClearChaos();xaKill();xaCloneDel(true)},null,'axa d');
  G.appendChild(mk('div','axi','FPS = fotogramas contados cada 0.5 s (aprox.). No disponibles: memoria GPU, indicadores de colisión.'));
  axH(G,'ÚLTIMOS ERRORES');const pre=mk('pre');G.appendChild(pre);AX.info.push([pre,()=>XA.errs.length?XA.errs.join('\n'):'(sin errores)',1])}

 /* PRESETS */
 {const R_=S_('p');axH(R_,'PRESETS');const g=axGrid(R_);PRE.forEach(([n,d,f])=>axBtn(g,n,()=>{try{f();pop('🎛 '+n+': '+d)}catch(e){xaErr(e)}}));
  axH(R_,'PERSONALIZADOS');axBtn(R_,'💾 GUARDAR CONFIGURACIÓN ACTUAL',()=>{const n=prompt('Nombre del preset:');if(!n||!n.trim())return;const o=getCP();if(Object.keys(o).length>=20&&!(n.trim() in o)){pop('Máximo 20 presets');return}o[n.trim().slice(0,24)]=axSnap();setCP(o);axPreList()},null,'axa nm');
  AX.pre=mk('div');R_.appendChild(AX.pre);axPreList();
  axH(R_,'RECUPERACIÓN');const gr=axGrid(R_);
  axBtn(gr,'Detener desastres',axStopDis);axBtn(gr,'Detener invasiones',()=>{xaZom(false);xaArmyKill()});axBtn(gr,'Eliminar clones',()=>xaCloneDel(true));
  axBtn(gr,'Eliminar temporales',()=>{xaClearChaos();xaKill();XA.shells.forEach(s=>S.remove(s.m));XA.shells.length=0});axBtn(gr,'Detener aleatorios',rndStop);
  axBtn(gr,'Restaurar cámara',()=>{xaCamMode('normal');axSet('camSm',XD.camSm);axSet('shk',1)});axBtn(gr,'Restaurar físicas',()=>PHYS.forEach(k=>axSet(k,XD[k])));
  axBtn(gr,'Restaurar luz/materiales',()=>{if(XA.dark)xaDark(false);xaFilter('');xaRoad(0);xaRain(false);XA.lightning=false;axSet('lit',1);axSet('fogM',1)});axBtn(gr,'Restaurar gravedad',()=>axSet('g',1));
  axBtn(gr,'Restaurar tiempo',()=>axSet('ts',1));axBtn(gr,'Restaurar tamaño',()=>axSet('carS',1));axBtn(gr,'Desactivar transformaciones',()=>setForm(''));
  axBtn(gr,'Desactivar poderes admin',()=>$('arst').click());axBtn(gr,'Reconstruir mapa',()=>{if(confirm('¿Reconstruir el mapa?'))xaRebuild()});axBtn(gr,'Volver a zona segura',xaSafe);
  axBtn(R_,'♻ RESTAURAR TODO',axRestoreAll,null,'axa d');
  R_.appendChild(mk('div','axi','No toca monedas, garaje, experiencia, Pase Neón ni datos online. Las partidas con poderes quedan marcadas como experimentales y no entran en las tablas.'))}
 showTab('q');
 /* encabezado, cierre y emergencia */
 $('axpanic').onclick=axPanic;
 /* el panel no debe activar los controles del coche ni saltar cinemáticas */
 ['keydown','keyup','pointerdown','touchstart'].forEach(ev=>P.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));
 P.addEventListener('wheel',e=>e.stopPropagation(),{passive:true})}

/* ----- estado en vivo ----- */
function axEffCount(){let n=0;const a=[XA.zom,XA.armyRows>0||xaCnt('s')>0,XA.empty,XA.chaos,XA.dark,admin.under,XA.meteorRain,XA.quakeOn,XA.permNit,XA.lightning,XA.rain,!!XA.filter,XA.roadTint,XA.clones.length>0,
  D.waterOn,!!D.tsu,!!D.tor,D.bliz,admin.inv,admin.fly,admin.ghost,admin.tur,admin.free,admin.form!=='',XA.camMode!=='normal',XP.ts!==1,XP.g!==1,XP.carS!==1,admin.spd!==1,XA.rnd.length>0];a.forEach(v=>{if(v)n++});return n}
axUI=function(full){if(full)for(const k in AX.rows){AX.rows[k].rng.value=XP[k];AX.rows[k].num.value=+(+XP[k]).toFixed(3)}
 AX.tg.forEach(([b,f])=>b.classList.toggle('on',!!f()));
 const cb=document.querySelector('#adm [data-k=cinesw]');if(cb)cb.textContent=XA.skipAll?'🎬 CINEMÁTICAS: DESACTIVADAS':'🎬 CINEMÁTICAS: ACTIVADAS';
 const pn=$('adm');if(pn&&pn.classList.contains('on')){AX.info.forEach(([d,f,pre])=>{try{const h=f();if(d._h!==h){d._h=h;pre?d.textContent=h:d.innerHTML=h}}catch(e){}});
  const rq=$('axreq');if(rq)rq.textContent=axFmt(XA.reqTxt);const ef=$('axeff');if(ef)ef.textContent='x'+(XA.effM>=1000?XA.effM.toExponential(1):XA.effM.toFixed(2))}
 $('axst').textContent=(admin.used?'🧪 EXPERIMENTAL · ':'')+axEffCount()+' efectos'};
setInterval(()=>{const now=performance.now(),el=(now-AX.lastT)/1000;if(el>=.5){AX.fps=XA.frames/el;XA.frames=0;AX.lastT=now;
  if(st==='play'&&AX.fps<22&&!paused)AX.lowN++;else AX.lowN=0;
  if(AX.autoLite&&!XA.lite&&AX.lowN>=3){XA.lite=true;AX.lowN=0;if(XA.mob.length>60)XA.mob.slice(60).forEach(m=>{if(!m.dead){m.dead=true;S.remove(m.g)}});if(XA.clones.length>3)XA.clones.splice(3).forEach(c=>S.remove(c.g));pop('⚠ Rendimiento bajo: modo ligero')}
  if(AX.dbg)$('axdbg').textContent='FPS '+AX.fps.toFixed(0)+'\nx '+car.x.toFixed(1)+' y '+car.y.toFixed(1)+' z '+car.z.toFixed(0)+'\nv '+Math.round(speed)+' m/s · efectos '+axEffCount()}
 const bd=$('axbadge');if(bd)bd.style.display=(admin.used&&st!=='menu')?'block':'none';
 if($('adm').classList.contains('on'))axUI()},300);
/* errores */
addEventListener('error',e=>xaErr(e.message||e));addEventListener('unhandledrejection',e=>xaErr(e.reason));
/* elementos auxiliares */
{const a=mk('div',0,'🧪 EXPERIMENTAL'),b=mk('div'),c=mk('div');a.id='axbadge';b.id='axdbg';c.id='axflash';document.body.append(a,b,c)}
/* apertura en móvil: 5 toques rápidos en la esquina superior izquierda */
{const h=mk('div');h.id='axhot';document.body.appendChild(h);let n=0,t0=0;h.addEventListener('pointerdown',e=>{const now=performance.now();n=now-t0<700?n+1:1;t0=now;if(n>=5){n=0;admGate(()=>{$('adm').classList.toggle('on');snd(660,.25,'square',.06,400);axUI(true)})}})}
axUI(true);

pw=buildCar(car3,CP);
