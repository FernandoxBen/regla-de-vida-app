/* Weekly journey, preserving the existing reglaApp storage and review records. */
const byId=id=>document.getElementById(id);
const plainObject=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const STATUS={practiced:'He practicado',minimum:'Hice lo mínimo',returned:'He retomado',rest:'Necesité descanso'};
let challengeDraft=null;
function localDay(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dayNumber(s){const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000}
function addDays(s,n){const d=new Date((dayNumber(s)+n)*86400000);return d.toISOString().slice(0,10)}
function shortDate(s){return new Date(s+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
function esc(s){return escapeHtml(s??'')}
function activeChallenge(){const c=state.challenge;return plainObject(c)&&typeof c.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(c.start||'')&&/^\d{4}-\d{2}-\d{2}$/.test(c.end||'')&&Number.isFinite(dayNumber(c.start))&&c.end===addDays(c.start,6)?c:null}
function inWeek(c=activeChallenge()){const t=localDay();return !!c&&c.start<=t&&t<=c.end}
function storeNext(next){const previous=state;state=next;if(persist())return true;state=previous;return false}
function initJourney(){
  // Save the untouched prior representation once before any migration write.
  try{const raw=localStorage.getItem('reglaApp');if(raw&&!localStorage.getItem('reglaApp.before-v3'))localStorage.setItem('reglaApp.before-v3',raw);}catch(e){/* No data is overwritten here. */}
  if(!Array.isArray(state.reviews)){if(state.reviews!==undefined)state.legacyReviews=state.reviews;state.reviews=[];}
  if(!Array.isArray(state.challenges)){if(state.challenges!==undefined)state.legacyChallenges=state.challenges;state.challenges=[];}
  state.schemaVersion=3;
  Object.entries(CHALLENGES).forEach(([key,x])=>{fronts[key].weapon=x.action;fronts[key].response=x.recovery;fronts[key].question='¿Qué respuesta concreta me acerca hoy a '+x.virtue.toLowerCase()+'?';});
  if(state.challenge&&!activeChallenge()){state.legacyChallenge=state.challenge;state.challenge=null;}
  for(const c of [activeChallenge(),...state.challenges]){if(plainObject(c)&&!plainObject(c.logs)){if(c.logs!==undefined)c.legacyLogs=c.logs;c.logs={};}}
  // Safer wording for the existing immediate-help tools.
  emergencies.splice(0,emergencies.length,
    {title:'Estoy agotado',way:'Preparar el terreno',text:'Antes de exigirte más, atiende lo necesario.',action:'Protege una pausa, alimento o descanso según lo que necesites. Tu versión mínima puede esperar si ahora necesitas cuidarte.'},
    {title:'No consigo empezar',way:'Dar un paso',text:'Concreta el gesto más pequeño que tenga sentido.',action:'Prepara el material, ofrece el trabajo a Dios y prueba un minuto. Si te ayuda, usa el temporizador de cinco minutos.'},
    {title:'Tengo demasiadas cosas',way:'Preparar y elegir',text:'La sobrecarga merece atención, no un juicio sobre tu valor.',action:'Anota lo pendiente, decide qué puede esperar y elige un solo gesto. Pide ayuda para lo que te supera.'},
    {title:'Estoy enfadado',way:'Reconocer y responder',text:'Sentir enfado no te obliga a actuar con dureza.',action:'Pide una pausa y concreta cuándo retomaréis la conversación. Pon límites claros; no permanezcas en una situación peligrosa.'},
    {title:'Me distraigo con el móvil',way:'Preparar el terreno',text:'Facilita la elección que quieres hacer.',action:'Aparta el móvil durante tu pequeña práctica. Decide antes qué harás al notar el impulso de volver a abrirlo.'},
    {title:'He vuelto a caer',way:'Volver al camino',text:'Reconoce el hecho y deja espacio para una respuesta mejor.',action:'Detén el daño, pide perdón y repara cuando corresponda. Identifica una ayuda para la próxima ocasión y retoma un paso posible.'},
    {title:'La tristeza me pesa',way:'Dejarme acompañar',text:'No tienes que ganarte el derecho a recibir ayuda.',action:'Habla con alguien de confianza. Si el malestar persiste o dificulta tu vida, busca apoyo profesional; no lo reduzcas a falta de voluntad o de fe.'}
  );
  renderWeek();renderGuide();renderReviewContext();
  window.addEventListener('popstate',()=>closeSheet(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderToday();renderWeek();renderReviewContext();}});
  document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!byId('sheet').classList.contains('open'))return;const panel=document.querySelector('.sheet-panel'),xs=[...panel.querySelectorAll('button,input,textarea,select,a,summary')].filter(x=>!x.disabled&&x.getClientRects().length),first=xs[0],last=xs.at(-1);if(!first)return;if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel)){e.preventDefault();first.focus();}});
  document.querySelectorAll('.close').forEach(x=>x.setAttribute('aria-label','Cerrar'));
}
function refsHtml(ids){return '<div class="source-links">'+ids.map(id=>'<a href="'+SOURCES[id].url+'" target="_blank" rel="noopener">'+esc(SOURCES[id].title)+' ↗</a>').join('')+'</div>'}
function renderJourneyToday(){
  byId('journeyDate').textContent=new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
  const c=activeChallenge(),hero=byId('challengeHero'),daily=byId('dailyPractice');
  byId('today').classList.toggle('has-challenge',!!c);
  byId('today').querySelector('h1').innerHTML=c?'Tu paso de hoy.':'Un camino.<br>Tu siguiente paso.';
  if(!c){hero.innerHTML='<div class="eyebrow">TU PRIMER PASO</div><h2>Propón tu reto semanal</h2><p>Un bien que quieres practicar, una situación concreta y una forma de volver cuando cueste.</p><button class="primary" onclick="openSheet(\'setup\')">Elegir mi reto</button>';daily.innerHTML=state.weapon?'<article class="card"><div class="eyebrow">TU PRÁCTICA ANTERIOR, CONSERVADA</div><p>'+esc(state.weapon)+'</p><button class="text-button" onclick="openSheet(\'setup\')">Convertirla en mi reto →</button></article>':'';return;}
  const ended=localDay()>c.end,day=Math.min(7,Math.max(1,dayNumber(localDay())-dayNumber(c.start)+1));
  hero.innerHTML='<div class="eyebrow">'+(ended?'SEMANA PARA REVISAR':'DÍA '+day+' DE 7')+' · '+esc(shortDate(c.start)+' — '+shortDate(c.end))+'</div><h2>'+esc(c.title)+'</h2><p>'+esc(c.virtue||'Mi propósito')+'</p><button class="hero-link" onclick="showScreen(\'ways\')">Ver mi compromiso <span>→</span></button>';
  if(ended){daily.innerHTML='<article class="card"><h2>Recoge lo vivido</h2><p>Tu semana terminó. Puedes repetir el reto, hacerlo más pequeño o elegir otro después de revisar.</p><button class="primary" onclick="showScreen(\'review\')">Revisar esta semana</button><button class="secondary" onclick="beginNextWeek()">Proponer los próximos siete días</button></article>';return;}
  const log=plainObject(c.logs?.[localDay()])?c.logs[localDay()]:{};
  daily.innerHTML='<article class="card practice"><div class="eyebrow">MI PASO DE HOY</div><p class="cue">Cuando '+esc(c.cue)+'</p><h2>'+esc(c.action)+'</h2><div class="minimum"><b>Si hoy cuesta</b><p>'+esc(c.minimum)+'</p></div><details><summary>Prepararme y recordar para quién</summary><p>'+esc(c.support||'Preparo lo necesario para mi práctica.')+'</p><p class="prayer">'+esc(CHALLENGES[c.front]?.prayer||'Señor, ayúdame a vivir este paso en el amor.')+'</p></details><button class="text-button" onclick="openWay(\'umbral\')">Empezar con cinco minutos →</button></article><article class="card daily-check"><h3>¿Cómo va hoy?</h3><p class="sub small">Registra tu práctica, no tu valor. Puedes cambiarlo.</p><div class="status-grid">'+Object.entries(STATUS).map(([k,v])=>'<button aria-pressed="'+(log.status===k)+'" onclick="markDay(\''+k+'\')">'+v+'</button>').join('')+'</div><label for="dailyNote">Una línea para recordar (opcional)</label><textarea id="dailyNote" oninput="saveDailyNote(true)" maxlength="1000" placeholder="Qué me ayudó, qué necesito…">'+esc(log.note||'')+'</textarea><button class="text-button" onclick="saveDailyNote()">Guardar nota</button><span id="dailySaved" role="status"></span></article>';
}
function markDay(status){
  if(!STATUS[status]||!inWeek())return toast('Este reto está listo para revisar.');
  const c=activeChallenge(),day=localDay(),prior=c.logs?.[day]||{},note=byId('dailyNote')?.value??prior.note??'';
  const logs={...c.logs,[day]:{...prior,status:prior.status===status?null:status,note,updated:new Date().toISOString()}};
  if(storeNext({...state,challenge:{...c,logs}})){renderToday();renderWeek();toast('Guardado. Sigue desde aquí.');}
}
function saveDailyNote(quiet=false){
  if(!inWeek())return toast('La semana terminó. Guarda lo vivido en tu reflexión.');
  const c=activeChallenge(),day=localDay(),logs={...c.logs,[day]:{...c.logs?.[day],note:byId('dailyNote').value.trim(),updated:new Date().toISOString()}};
  if(storeNext({...state,challenge:{...c,logs}})){byId('dailySaved').textContent='Guardada';if(!quiet)renderWeek();}
}
function renderWeek(){
  const c=activeChallenge();
  byId('weekContent').innerHTML=c?'<article class="card"><div class="eyebrow">MI COMPROMISO · '+esc(shortDate(c.start)+' — '+shortDate(c.end))+'</div><h2>'+esc(c.title)+'</h2><dl class="commitment"><dt>Cuando</dt><dd>'+esc(c.cue)+'</dd><dt>Entonces</dt><dd>'+esc(c.action)+'</dd><dt>Mi mínimo</dt><dd>'+esc(c.minimum)+'</dd><dt>Me preparo</dt><dd>'+esc(c.support||'Una ayuda sencilla.')+'</dd><dt>Si caigo, vuelvo</dt><dd>'+esc(c.recovery||'Reconozco, reparo y retomo.')+'</dd></dl><div class="week-dots" aria-label="Siete días del reto">'+Array.from({length:7},(_,i)=>{const d=addDays(c.start,i),l=c.logs?.[d],label=STATUS[l?.status]||'Sin registro';return '<div class="week-day '+(d===localDay()?'current':'')+'"><span>'+esc(new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short'}))+'</span><b title="'+esc(label)+'">'+(l?.status?'•':i+1)+'</b><small>'+esc(label)+'</small></div>';}).join('')+'</div><button class="secondary" onclick="openSheet(\'setup\')">Ajustar este reto</button><button class="text-button" onclick="beginNextWeek()">'+(inWeek(c)?'Cerrar y proponer otra semana':'Proponer la próxima semana')+' →</button></article>':'<article class="card"><h2>Una semana que tú eliges</h2><p>Puedes empezar con una propuesta o escribir tu propia práctica.</p><button class="primary" onclick="openSheet(\'setup\')">Crear mi reto</button></article>';
  byId('challengeIdeas').innerHTML=Object.entries(CHALLENGES).map(([k,x])=>'<button class="idea" onclick="proposeChallenge(\''+k+'\')"><span><b>'+esc(x.title)+'</b><small>'+esc(x.virtue)+'</small></span><span aria-hidden="true">↗</span></button>').join('');
  byId('weekArchive').innerHTML=state.challenges.length?state.challenges.filter(plainObject).slice().reverse().map(c=>'<details class="archive-week"><summary>'+esc(c.title||'Reto')+' · '+esc(c.start||'')+'</summary><p>'+esc(c.action)+'</p>'+renderLogs(c)+'</details>').join(''):'<p class="sub">Aquí se conservarán tus retos y sus notas al empezar otra semana.</p>';
}
function renderLogs(c){return Object.entries(c.logs||{}).sort().map(([d,l])=>'<p><b>'+esc(d)+' · '+esc(STATUS[l?.status]||'Nota')+'</b><br>'+esc(l?.note||'')+'</p>').join('')}
function proposeChallenge(front){challengeDraft={front,newWeek:!activeChallenge()||!inWeek()};openSheet('setup');}
function beginNextWeek(){if(inWeek()&&!confirm('¿Cerrar este reto antes de terminar sus siete días? Se conservarán el reto, sus registros y sus notas.'))return;challengeDraft={front:activeChallenge()?.front||state.front,newWeek:true,repeat:true};openSheet('setup');}
function renderChallengeForm(){
  const c=activeChallenge(),draft=challengeDraft;challengeDraft=null;
  const editing=!!c&&!draft?.newWeek;
  const front=draft?.front||c?.front||(CHALLENGES[state.front]?state.front:'ira');
  const select=byId('setupFront');select.innerHTML=Object.entries(CHALLENGES).map(([k,v])=>'<option value="'+k+'">'+esc(v.virtue)+' · '+esc(fronts[k].name)+'</option>').join('')+'<option value="personal">Mi propio propósito</option>';select.value=CHALLENGES[front]?front:'personal';
  byId('challengeForm').dataset.editing=editing?'true':'false';
  byId('setupTitle').textContent=editing?'Ajustar mi reto':'Proponer mi reto';
  byId('saveChallengeButton').textContent=editing?'Guardar ajustes':'Empezar mis siete días';
  const populate=(f,source)=>{const p=CHALLENGES[f]||{};for(const [id,key] of Object.entries({setupName:'title',setupCue:'cue',setupWeapon:'action',setupMinimum:'minimum',setupSupport:'support',setupRecovery:'recovery'}))byId(id).value=source?.[key]??p[key]??'';byId('setupQuestion').value=source?.question||fronts[f]?.question||'¿Qué respuesta buena puedo elegir ahora?';};
  populate(select.value,draft?.repeat||(editing&&(!draft||draft.front===c.front))?c:null);
  if(!c&&!draft&&typeof state.weapon==='string'&&state.weapon){byId('setupWeapon').value=state.weapon;byId('setupQuestion').value=state.question||byId('setupQuestion').value;}
  let previousFront=select.value;
  select.onchange=()=>{if(confirm('¿Cargar el ejemplo de este propósito? Sustituirá solo lo escrito en este formulario; no cambiará el reto guardado hasta que pulses Guardar.')){populate(select.value,null);previousFront=select.value;}else select.value=previousFront;};
  const start=editing?c.start:localDay();byId('setupDates').textContent=shortDate(start)+' — '+shortDate(addDays(start,6))+(editing?' · Tus registros y la versión anterior del reto se conservarán.':' · Una semana para aprender; puedes repetirla.');
}
function saveChallenge(){
  const form=byId('challengeForm');if(!form.reportValidity())return;
  const data={front:byId('setupFront').value,title:byId('setupName').value.trim(),cue:byId('setupCue').value.trim(),action:byId('setupWeapon').value.trim(),minimum:byId('setupMinimum').value.trim(),support:byId('setupSupport').value.trim(),recovery:byId('setupRecovery').value.trim(),question:byId('setupQuestion').value.trim()};
  if(!data.title||!data.cue||!data.action||!data.minimum){byId('setupError').textContent='Completa el reto, la situación, la acción y la versión mínima.';return;}
  const old=activeChallenge(),editing=form.dataset.editing==='true'&&!!old,now=new Date().toISOString();
  const start=editing?old.start:localDay();
  const revisions=editing?[...(Array.isArray(old.revisions)?old.revisions:[]),{date:now,title:old.title,front:old.front,cue:old.cue,action:old.action,minimum:old.minimum,support:old.support,recovery:old.recovery}]:[];
  const challenge={...data,id:editing?old.id:(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)),virtue:CHALLENGES[data.front]?.virtue||'Mi propósito',start,end:addDays(start,6),logs:editing?old.logs:{},revisions,created:editing?old.created:now};
  const archives=!editing&&old?[...state.challenges,{...old,closed:now}]:state.challenges;
  if(!storeNext({...state,challenge,challenges:archives,front:data.front,weapon:data.action,question:data.question}))return;
  closeSheet();renderToday();renderWeek();renderReviewContext();toast(editing?'Reto ajustado; registros conservados.':'Tu camino de esta semana empieza hoy.');
}
function renderReviewContext(){const c=activeChallenge();byId('reviewContext').innerHTML=c?'<article class="card"><div class="eyebrow">TU SEMANA</div><h2>'+esc(c.title)+'</h2><p class="sub">'+esc(shortDate(c.start)+' — '+shortDate(c.end))+'</p><details><summary>Ver mis notas de estos días</summary>'+(renderLogs(c)||'<p>Aún no hay notas. Puedes reflexionar igualmente.</p>')+'</details></article>':'';}
function saveWeeklyReview(e){
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(!Object.values(data).some(x=>x.trim()))return toast('Escribe al menos una idea que quieras conservar.');
  const c=activeChallenge();data.date=new Date().toISOString();data.challengeId=c?.id||null;data.challengeTitle=c?.title||null;
  if(!storeNext({...state,reviews:[data,...state.reviews]}))return;
  e.target.reset();byId('savedMsg').hidden=false;setTimeout(()=>byId('savedMsg').hidden=true,2400);renderHistory();toast('Reflexión guardada. Puedes mantener o simplificar tu reto.');
}
function openRecovery(){openSheet('recovery');const c=activeChallenge();byId('recoveryPersonal').textContent=c?.recovery||'Elige un gesto bueno y posible para la próxima ocasión.';byId('recoveryMark').hidden=!inWeek();}
function recordReturn(){if(!inWeek())return;const c=activeChallenge(),d=localDay(),logs={...c.logs,[d]:{...c.logs?.[d],status:'returned',updated:new Date().toISOString()}};if(storeNext({...state,challenge:{...c,logs}})){closeSheet();renderToday();renderWeek();toast('Regreso registrado. Tu semana continúa.');}}
function renderGuide(){
  byId('manualContent').innerHTML=PATH_STEPS.map((x,i)=>'<details class="card manual-section path-step" data-search="'+esc(x.title+' '+x.text)+'"><summary><span class="step-number">'+(i+1)+'</span>'+esc(x.title)+'</summary><div class="manual-body"><p>'+esc(x.text)+'</p><div class="result"><b>En tu día</b><p>'+esc(x.practice)+'</p></div>'+refsHtml(x.refs)+'</div></details>').join('')+
  '<details class="card manual-section" data-search="evagrio casiano ocho pensamientos tristeza culpa acedia"><summary>Cómo usar los ocho pensamientos</summary><div class="manual-body"><p>Evagrio y Casiano ofrecen un mapa para observar patrones. En esta app los usamos como punto de partida para elegir un bien a practicar, nunca como diagnóstico de una persona.</p><p>La tristeza del esquema antiguo no equivale a toda tristeza actual. El duelo y la depresión no son vicios. La acedia tampoco es un nombre alternativo para cualquier cansancio o bloqueo.</p><p>Tu reto no debe convertirse en una comprobación continua de si has pecado. Si el examen te lleva a angustia o escrúpulos, simplifícalo y busca acompañamiento pastoral; si afecta a tu vida, también profesional.</p>'+refsHtml(['evagrio','casiano','tentacion'])+'</div></details>'+
  Object.entries(CHALLENGES).map(([k,x])=>'<details class="card manual-section" data-search="'+esc(k+' '+x.title+' '+x.virtue)+'"><summary>'+esc(x.title)+'</summary><div class="manual-body"><span class="tag">Propuesta práctica</span><p>'+esc(x.guide)+'</p><p><b>Un ejemplo:</b> cuando '+esc(x.cue.toLowerCase())+', '+esc(x.action.toLowerCase())+'.</p><p><b>En un día difícil:</b> '+esc(x.minimum)+'.</p><p><b>Para volver:</b> '+esc(x.recovery)+'.</p>'+refsHtml(x.refs)+'<button class="secondary" onclick="proposeChallenge(\''+k+'\')">Adaptar este reto a mi semana</button></div></details>').join('');
  byId('sourcesContent').innerHTML=Object.entries(SOURCES).map(([k,x])=>'<details class="card manual-section source-card" data-search="'+esc(x.kind+' '+x.title)+'"><summary>'+esc(x.title)+'</summary><div class="manual-body"><span class="tag">'+esc(x.kind)+'</span><p>'+esc(x.note)+'</p><a href="'+x.url+'" target="_blank" rel="noopener">Consultar la fuente ↗</a></div></details>').join('')+'<p class="footnote">Fuentes revisadas el 16 de septiembre de 2026. La guía funciona sin conexión; los enlaces externos necesitan internet.</p>';
}
function filterGuide(){const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=norm(byId('manualSearch').value.trim());let count=0;document.querySelectorAll('#manual .manual-section').forEach(x=>{const match=!q||norm(x.dataset.search+' '+x.textContent).includes(q);x.hidden=!match;if(match)count++;if(q&&match)x.open=true;});byId('guideEmpty').hidden=count>0;}
