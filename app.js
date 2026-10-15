const D=window.DATA;D.accounts=D.rows.map(r=>({handle:r[0],name:r[1]||r[0],niche:D.niches[r[2]],followers:r[3],followers_approx:r[4],vtype:D.vtypes[r[5]],persona:r[6],tags:r[7]?r[7].split('|'):[],pick:r[8],avatar:r[9]?(r[9].startsWith('http')?r[9]:D.avpfx+r[9].replace('~.','_400x400.')):'',owner:r[10]}));D.velocity={};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n==null?'—':n>=1e8?(n/1e8).toFixed(1)+'亿':n>=1e4?(n/1e4).toFixed(n>=1e5?0:1)+'万':n.toLocaleString('zh-CN');
const hue=h=>[...h].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7)%360;
const VB='<svg class="v" viewBox="0 0 22 22"><path fill="#1d9bf0" d="M20.4 11c0-1.4-.9-2.6-2.1-3.1.4-1.3.1-2.8-.9-3.7s-2.4-1.2-3.7-.9C13.2 2.1 12 1.2 10.6 1.2S8 2.1 7.5 3.3c-1.3-.4-2.8-.1-3.7.9s-1.3 2.4-.9 3.7C1.7 8.4.8 9.6.8 11s.9 2.6 2.1 3.1c-.4 1.3-.1 2.8.9 3.7s2.4 1.3 3.7.9c.5 1.2 1.7 2.1 3.1 2.1s2.6-.9 3.1-2.1c1.3.4 2.8.1 3.7-.9s1.3-2.4.9-3.7c1.2-.5 2.1-1.7 2.1-3.1z"/><path fill="#fff" d="m9.6 14.9-3.4-3.4 1.3-1.3 2.1 2.1 4.8-5.2 1.4 1.3z"/></svg>';
// avatar with graceful fallback (initial on gradient)
function fb(h,n){const c=hue(h);return `background:linear-gradient(135deg,hsl(${c} 70% 55%),hsl(${(c+40)%360} 65% 42%))`}
function av(a,cls=''){const h=a.handle||'x',n=(a.name||h).trim(),ini=esc([...n][0]||'?');
 return a.avatar?`<img class="av ${cls}" src="${esc(a.avatar)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-i="${ini}" data-s="${fb(h)}" onerror="avErr(this)">`:`<span class="av ${cls}" style="${fb(h)}">${ini}</span>`}
window.avErr=img=>{if(!img.dataset.r&&img.src.includes('_400x400')){img.dataset.r=1;img.src=img.src.replace('_400x400','_normal');return}
 const s=document.createElement('span');s.className=img.className;s.setAttribute('style',img.dataset.s);s.textContent=img.dataset.i;img.replaceWith(s)};
const prof=h=>`https://x.com/${encodeURIComponent(h)}`;
const vcls=v=>/付费/.test(v)?"付费蓝V":/政府/.test(v)?'政府机构':/机构|媒体/.test(v)?'机构媒体':/实名/.test(v)?'个人实名':'付费蓝V';
D.accounts.forEach(a=>{a._v=vcls(a.vtype||'');a._s=[a.handle,a.name,a.persona,a.expertise,a.hot,a.niche,...(a.tags||[])].join(' ').toLowerCase()});
// theme
const T=localStorage.t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.t=T;
$('#theme').onclick=()=>{const t=document.documentElement.dataset.t=='dark'?'light':'dark';document.documentElement.dataset.t=t;localStorage.t=t};
$('#upd').textContent=D.meta.updated_at;
const nAv=D.accounts.filter(a=>a.avatar).length;
$('#stat').textContent=`已收录 ${D.meta.count.toLocaleString()} 位中文认证博主 · ${D.meta.niches.length} 个方向 · 点击任一博主直达 X 主页`;
// segmented helper
function seg(el,items,cur,cb){el.innerHTML=items.map(([k,l,c])=>`<button class="${k==cur?'on':''}" data-k="${esc(k)}">${esc(l)}${c!=null?`<small>${c}</small>`:''}</button>`).join('');el.onclick=e=>{const b=e.target.closest('button');if(b)cb(b.dataset.k)}}
// ---------- directory
const P=D.accounts.filter(a=>a.pick).sort((a,b)=>(b.followers||0)-(a.followers||0));
let st={niche:'全部',q:'',sort:'f',vt:'全部',n:0};let L=[];
function card(a){return `<a class="card${a.owner?' own':''}" href="${prof(a.handle)}" aria-label="${esc(a.name)} 的 X 主页" target="_blank" rel="noopener">
<div class="who">${av(a)}<div><div class="nm"><span style="overflow:hidden;text-overflow:ellipsis">${esc(a.name||a.handle)}</span>${VB}</div><div class="hl">@${esc(a.handle)}</div></div>
<div class="fl">${a.followers_approx?'约':''}${fmt(a.followers)}<small>粉丝</small></div></div>
${a.persona?`<div class="bio">${esc(a.persona)}</div>`:''}
<div class="tags">${a.owner?'<span class="tag own">站长</span>':''}<span class="tag n">${esc(a.niche)}</span>${a.pick?'<span class="tag pkt">新手推荐</span>':''}${a._v!='付费蓝V'?`<span class="tag">${a._v}</span>`:''}${(a.tags||[]).filter(t=>t!=a.niche).slice(0,3).map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div></a>`}
let ready=0;function syncURL(){if(!ready)return;const u=new URLSearchParams();if(st.q)u.set('q',st.q);if(st.niche!='全部')u.set('n',st.niche);if(st.vt!='全部')u.set('v',st.vt);if(st.sort!='f')u.set('s',st.sort);const h='#dir'+(u+''?'?'+u:'');if(location.hash!=h&&(location.hash.slice(1)||'dir').startsWith('dir'))history.replaceState(null,'',h)}
function filt(){syncURL();if(P.length)$('#picksWrap').hidden=!!(st.q.trim()||st.niche!='全部'||st.vt!='全部');requestAnimationFrame(()=>document.querySelector('#chips .on')?.scrollIntoView({inline:'center',block:'nearest'}));const q=st.q.trim().toLowerCase().replace(/^@/,'');const qs=q.split(/\s+/).filter(Boolean);
 L=D.accounts.filter(a=>(st.niche=='全部'||a.niche==st.niche)&&(st.vt=='全部'||a._v==st.vt)&&qs.every(w=>a._s.includes(w)));
 if(st.sort=='fa')L.sort((a,b)=>(a.followers||0)-(b.followers||0));else if(st.sort=='n')L.sort((a,b)=>(a.name||a.handle).localeCompare(b.name||b.handle,'zh'));else L.sort((a,b)=>(b.followers||0)-(a.followers||0));
 $('#cnt').textContent=`共 ${L.length.toLocaleString()} 位博主`;$('#list').innerHTML=L.length?'':`<div class="empty" style="grid-column:1/-1"><div class="orb"></div><h3>没有找到匹配的博主</h3><p>换个关键词，或清除筛选再试试</p></div>`;st.n=0;more()}
function more(){if(st.n>=L.length)return;$('#list').insertAdjacentHTML('beforeend',L.slice(st.n,st.n+48).map(card).join(''));st.n+=48}
new IntersectionObserver(e=>{if(e[0].isIntersecting)more()},{rootMargin:'800px'}).observe($('#sentinel'));
function chips(){const c=[['全部','全部',D.accounts.length],...D.meta.niches.map(([k,n])=>[k,k,n])];seg($('#chips'),c,st.niche,k=>{st.niche=k;chips();filt()})}
function vts(){const cnt={};D.accounts.forEach(a=>cnt[a._v]=(cnt[a._v]||0)+1);seg($('#vt'),[['全部','全部认证'],...['付费蓝V','个人实名','机构媒体','政府机构'].filter(k=>cnt[k]).map(k=>[k,k])],st.vt,k=>{st.vt=k;vts();filt()})}
let tm;$('#q').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=e.target.value;filt()},120)};$('#sort').onchange=e=>{st.sort=e.target.value;filt()};
addEventListener('keydown',e=>{if(e.key=='/'&&document.activeElement.tagName!='INPUT'){e.preventDefault();location.hash='dir';$('#q').focus()}});
if(P.length)$('#picks').innerHTML=P.map(a=>`<a class="pk" href="${prof(a.handle)}" target="_blank" rel="noopener"><div class="who">${av(a,'s')}<div><div class="nm">${esc(a.name||a.handle)}${VB}</div><div class="hl">${esc(a.niche)} · ${fmt(a.followers)} 粉丝</div></div></div><p>${esc(a.pick.replace(/^[^，,]*?\d+(\.\d+)?万?粉[，,]\s*/,'').replace(/\d+(\.\d+)?万粉[，,]?/,''))}</p></a>`).join('');else $('#picksWrap').hidden=true;
// ---------- boards
const go=u=>window.open(u,'_blank','noopener');
document.addEventListener('click',e=>{const p=e.target.closest('[data-prof]');if(p){e.preventDefault();e.stopPropagation();go(prof(p.dataset.prof));return}const r=e.target.closest('[data-href]');if(r)go(r.dataset.href)});
const pending=(t,m,pct)=>`<div class="empty"><div class="orb"></div><h3>${t}</h3><p>${m}</p>${pct!=null?`<div class="bar"><i style="width:${Math.max(4,Math.min(100,pct))}%"></i></div>`:''}</div>`;
let gk='3d',vk='30m',vm='views';const setQ=(p,o)=>history.replaceState(null,'','#'+p+'?'+new URLSearchParams(o));
let liveP;function live(){return liveP||(liveP=new Promise(r=>{const sc=document.createElement('script');sc.src=document.querySelector('meta[name=live]').content;sc.onload=()=>{D.velocity=window.LIVE.velocity;r()};document.head.append(sc)}))}
function growth(){seg($('#gtabs'),['3d','5d','10d','15d','30d'].map(k=>[k,k.replace('d',' 日')]),gk,k=>{gk=k;setQ('growth',{d:gk});growth()});
 const b=D.growth.boards?.[gk],d=parseInt(gk);
 if(!b||!b.length){const f=D.growth.first?new Date(D.growth.first):null,el=f?(Date.now()-f)/864e5:0,left=Math.max(1,Math.ceil(d-el));
  $('#gcap').textContent='每晚 21:16 记录一次粉丝数，按周期内净增粉丝排序';$('#gbody').innerHTML=pending('数据积累中',`${d} 日涨粉榜需要连续 ${d} 天的粉丝快照，预计 ${left} 天后上线`+(f?`（约 ${new Date(+f+d*864e5).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})} 晚间）`:'')+(f?`<br>首次快照：${f.toLocaleDateString('zh-CN')}`:''),el/d*100);return}
 $('#gbody').innerHTML=b.map((r,i)=>`<div class="lr" data-href="${prof(r.handle)}"><span class="rk ${i<3?'t':''}">${i+1}</span>${av(r,'s')}<div class="mid"><div class="nm">${esc(r.name||r.handle)}</div><div class="hl">@${esc(r.handle)} · ${esc(r.niche||'')} · ${fmt(r.followers)} 粉丝</div></div><div class="num"><b>+${fmt(r.gain)}</b><small>${r.pct!=null?r.pct+'%':''}</small></div></div>`).join('')}
function velocity(){if(!window.LIVE){$('#vbody').innerHTML=pending('加载中…','正在读取最新采样');live().then(velocity);return}seg($('#vtabs'),[['30m','30 分钟'],['1h','1 小时'],['3h','3 小时'],['5h','5 小时']],vk,k=>{vk=k;setQ('velocity',{w:vk,m:vm});velocity()});
 seg($('#vm'),[['views','浏览'],['likes','点赞']],vm,k=>{vm=k;setQ('velocity',{w:vk,m:vm});velocity()});
 let b=D.velocity.boards?.[vk];const mins={'30m':30,'1h':60,'3h':180,'5h':300}[vk];
 if(!b||!b.length){const f=D.velocity.first?new Date(D.velocity.first):null,el=f?(Date.now()-f)/6e4:0,left=Math.max(30,mins-el),lab=left>=60?Math.ceil(left/60)+' 小时':Math.ceil(left)+' 分钟';
  $('#vbody').innerHTML=pending('数据积累中',`需要至少 ${mins>=60?mins/60+' 小时':mins+' 分钟'}的连续采样（每天 9:00–24:00 每半小时一次），预计约 ${lab}采样时段后上线`,el/mins*100);return}
 const k=vm=='views'?'dviews':'dlikes';b=[...b].sort((x,y)=>y[k]-x[k]);
 const lt=D.velocity.latest?new Date(D.velocity.latest).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}):'';
 $('#vcap').textContent=`按近 ${{'30m':'30 分钟','1h':'1 小时','3h':'3 小时','5h':'5 小时'}[vk]}新增${vm=='views'?'浏览':'点赞'}排序 · 最近采样 ${lt}（北京时间）· 点击帖子看原文，点击头像进主页`;
 $('#vbody').innerHTML=b.map((r,i)=>`<div class="lr post" data-href="https://x.com/${encodeURIComponent(r.handle)}/status/${esc(r.id)}" title="打开原帖" role="link" tabindex="0">
 <div class="ph"><span class="rk ${i<3?'t':''}">${i+1}</span><a class="au" href="${prof(r.handle)}" data-prof="${esc(r.handle)}">${av(r,'xs')}<div style="min-width:0"><div class="nm">${esc(r.name||r.handle)}</div><div class="hl">@${esc(r.handle)}${r.niche?' · '+esc(r.niche):''}</div></div></a>
 <div class="num"><b>+${fmt(r[k])}</b><small>${vm=='views'?'浏览':'点赞'}增量</small></div></div>
 <div class="tx">${esc(r.text.replace(/https:\/\/t\.co\/\S+/g,'').trim()||'（图片 / 视频帖）')}</div>
 <div class="st"><span>浏览 ${fmt(r.views)} <b>+${fmt(r.dviews)}</b></span><span>点赞 ${fmt(r.likes)} <b>+${fmt(r.dlikes)}</b></span><span>${r.created_at?new Date(r.created_at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):''}</span></div></div>`).join('')}
// ---------- router
function route(){const [p0,qs]=(location.hash.slice(1)||'dir').split('?'),p=['dir','growth','velocity'].includes(p0)?p0:'dir',u=new URLSearchParams(qs||'');
 if(p=='dir'&&qs){st.q=u.get('q')||'';$('#q').value=st.q;st.niche=u.get('n')||'全部';st.vt=u.get('v')||'全部';st.sort=u.get('s')||'f';$('#sort').value=st.sort;chips();vts();filt()}
 if(p=='growth'&&u.get('d'))gk=u.get('d');if(p=='velocity'){if(u.get('w'))vk=u.get('w');if(u.get('m'))vm=u.get('m')}['dir','growth','velocity'].forEach(x=>$('#p-'+x).hidden=x!=p);
 document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.p==p));if(p=='growth')growth();if(p=='velocity')velocity();if(!qs||p!='dir')scrollTo(0,0)}
addEventListener('hashchange',route);chips();vts();filt();route();ready=1;
const tt=document.createElement('button');tt.className='totop';tt.setAttribute('aria-label','回到顶部');tt.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';tt.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.append(tt);
addEventListener('scroll',()=>tt.classList.toggle('show',scrollY>900),{passive:true});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.matches('[data-href]'))go(e.target.dataset.href)});
$('#updh').textContent='数据更新于 '+D.meta.updated_at;(window.requestIdleCallback||setTimeout)(()=>live());
