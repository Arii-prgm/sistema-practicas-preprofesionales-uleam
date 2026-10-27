
/* ULEAM · Prototipo académico. Sin librerías ni servidor. */
'use strict';
const KEY='uleam_practicas_demo_v3';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>Date.now()+Math.floor(Math.random()*10000);
const seed=()=>({
  student:'Ariela Sánchez',tutor:'Ing. María López',period:'2026-2',companyId:1,authorized:true,practiceStatus:'En proceso',goal:240,start:'2026-10-01',end:'2027-02-28',area:'Soporte tecnológico',schedule:'08:00 a 12:00',responsible:'Carlos Mendoza',
  companies:[{id:1,name:'Empresa ABC',ruc:'1390000000001',address:'Manta, Manabí',contact:'Carlos Mendoza',phone:'0990000000',email:'contacto@empresaabc.ec'}],
  users:[{id:1,name:'Ariela Sánchez',email:'ariela@uleam.edu.ec',role:'Estudiante',status:'Activo'},{id:2,name:'Ing. María López',email:'maria@uleam.edu.ec',role:'Tutor',status:'Activo'},{id:3,name:'Administrador',email:'admin@uleam.edu.ec',role:'Administrador',status:'Activo'}],
  periods:[{id:1,name:'2026-2',code:'P2026-2',start:'2026-10-01',end:'2027-02-28',status:'Activo'}],
  assignments:[{id:1,student:'Ariela Sánchez',tutor:'Ing. María López',period:'2026-2'}],
  agreements:[{id:1,code:'CONV-001',companyId:1,signature:'2026-09-01',expiry:'2027-09-01',file:'convenio_ejemplo.pdf',status:'Vigente'}],
  documents:[{id:1,name:'Carta de aceptación',type:'Carta',file:'carta_aceptacion.pdf',status:'Aprobado',date:'2026-10-01'}],
  evidence:[{id:1,date:'2026-10-02',description:'Mantenimiento preventivo de equipos',file:'evidencia_inicial.pdf',status:'Aceptada',note:''}],
  activities:[{id:1,evidenceId:1,date:'2026-10-02',description:'Mantenimiento preventivo de equipos',hours:8}],
  requests:[],followups:[],evaluation:null,reports:[],notices:[],history:[{date:'2026-10-01',actor:'Administrador',detail:'Práctica autorizada'}],changes:[]
});
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&Array.isArray(d.evidence)?d:seed()}catch{return seed()}}
let db=load(),role=null,page='Inicio',tab='Usuarios';
function persist(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch{toast('Almacenamiento del navegador lleno. Restablece los datos.') }}
function toast(s){const e=$('toast');e.textContent=s;e.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.style.display='none',3600)}
function audit(detail){db.history.unshift({date:new Date().toLocaleString('es-EC'),actor:role,detail});db.history=db.history.slice(0,150)}
function notify(to,message){db.notices.unshift({id:uid(),to,date:today(),message,read:false})}
function total(){return db.activities.reduce((a,b)=>a+Number(b.hours||0),0)}
function percent(){return Math.min(100,Math.round(total()/db.goal*100))}
function company(){return db.companies.find(c=>c.id===Number(db.companyId))||{name:'Sin asignar',ruc:'—',address:'—',contact:'—'}}
function status(s){let c=/Aprob|Acept|Activo|Vigente|Autoriz|Finaliz|Complet|Registrad/.test(s)?'ok':/Rechaz|Observ|Retir|Suspend|Vencid|Inactiv/.test(s)?'bad':'neutral';return `<span class="tag ${c}">${esc(s)}</span>`}
function header(name,desc=''){return `<h1>${esc(name)}</h1><p class="subtitle">${esc(desc)}</p>`}
function card(title,html){return `<section class="card"><h2>${esc(title)}</h2>${html}</section>`}
function stats(items){return `<div class="stats">${items.map(([k,v])=>`<div class="stat"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div>`}
function table(head,rows){return `<div class="table-scroll"><table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td class="empty" colspan="${head.length}">Todavía no hay registros.</td></tr>`}</tbody></table></div>`}
function inp(label,name,type='text',val='',required=true,extra=''){return `<div class="field"><label for="f_${name}">${esc(label)}${required?' *':''}</label><input id="f_${name}" name="${name}" type="${type}" value="${esc(val)}" ${required?'required':''} ${extra}></div>`}
function sel(label,name,opts,val='',required=true){return `<div class="field"><label for="f_${name}">${esc(label)}</label><select id="f_${name}" name="${name}" ${required?'required':''}>${opts.map(o=>{let v=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;return `<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(t)}</option>`}).join('')}</select></div>`}
function area(label,name,val=''){return `<div class="field full"><label for="f_${name}">${esc(label)} *</label><textarea id="f_${name}" name="${name}" required minlength="5">${esc(val)}</textarea></div>`}
function form(kind,fields,button='Guardar',more=''){return `<form data-form="${kind}" class="form-grid">${fields}<div class="actions">${more}<button class="btn primary" type="submit">${esc(button)}</button></div></form>`}
function btn(action,id,label,variant='outline',disabled=false){return `<button class="btn small ${variant}" data-action="${action}" data-id="${id}" ${disabled?'disabled':''}>${esc(label)}</button>`}
function detail(items){return `<div class="details">${items.map(([a,b])=>`<div><small>${esc(a)}</small><strong>${esc(b)}</strong></div>`).join('')}</div>`}
function practice(){return card('Datos de la práctica',detail([['Estudiante',db.student],['Empresa',company().name],['RUC',company().ruc],['Responsable',db.responsible],['Tutor académico',db.tutor],['Período',db.period],['Inicio',db.start],['Finalización',db.end],['Área',db.area],['Horario',db.schedule],['Estado',db.practiceStatus],['Autorización',db.authorized?'Autorizada':'Pendiente']])+`<div class="progress"><span style="width:${percent()}%"></span></div><p class="muted">${total()} de ${db.goal} horas reconocidas · ${percent()}% de avance</p>`)}
const menus={
 estudiante:['Inicio','Mi práctica','Enviar evidencias','Mis actividades y horas','Mis documentos','Solicitudes y novedades','Notificaciones','Mi perfil'],
 tutor:['Inicio','Mis estudiantes','Empresas','Gestión de prácticas','Convenios','Documentos','Evidencias recibidas','Registro de actividades y horas','Solicitudes y novedades','Seguimiento','Evaluaciones e informes','Reportes','Notificaciones'],
 admin:['Inicio','Usuarios y asignaciones','Períodos','Autorizaciones','Solicitudes importantes','Supervisión','Cierre de prácticas','Reportes generales','Notificaciones']
};
const icons=['⌂','♙','▤','◷','▣','☷','✉','⚙','▥','✓','▦','▤','♧'];
const labels={estudiante:'Estudiante',tutor:'Tutor académico',admin:'Administrador'};
function render(){if(!role)return;if(!menus[role].includes(page))page='Inicio';$('roleLabel').textContent=labels[role];$('accountName').textContent=role==='estudiante'?db.student:role==='tutor'?db.tutor:'Administrador';$('accountRole').textContent=labels[role];$('breadcrumb').textContent=page;$('menu').innerHTML=menus[role].map((x,i)=>`<button class="nav-item ${page===x?'active':''}" data-page="${esc(x)}"><span class="nav-icon">${icons[i%icons.length]}</span>${esc(x)}</button>`).join('');$('content').innerHTML=page==='Inicio'?home():role==='estudiante'?student():role==='tutor'?tutor():admin()}
function home(){const k=role==='estudiante'?'Estudiante':role==='tutor'?'Tutor académico':'Administrador';return header('Panel principal · '+k,'Bienvenido al sistema de gestión de prácticas preprofesionales.')+stats([['Horas registradas',total()+' / '+db.goal],['Evidencias pendientes',db.evidence.filter(x=>x.status==='Pendiente').length],['Solicitudes abiertas',db.requests.filter(x=>!['Aprobada','Rechazada'].includes(x.status)).length],['Estado',db.practiceStatus]])+practice()+card('Acciones principales',`<div class="toolbar"><p>Selecciona una opción del menú lateral para continuar.</p>${btn('go',role==='estudiante'?'Enviar evidencias':role==='tutor'?'Evidencias recibidas':'Autorizaciones','Ir a tareas','primary')}</div>`)}
function evidenceTable(mode){return table(['Fecha','Descripción','Archivo','Estado','Acciones'],db.evidence.map(e=>[esc(e.date),esc(e.description),esc(e.file),status(e.status)+(e.note?`<p class="muted">${esc(e.note)}</p>`:''),mode==='tutor'&&e.status==='Pendiente'?btn('acceptEvidence',e.id,'Aceptar')+btn('observeEvidence',e.id,'Observar'):mode==='estudiante'&&e.status==='Observada'?btn('correctEvidence',e.id,'Corregir'):'—']))}
function activityTable(){return table(['Fecha','Actividad','Evidencia','Horas','Registrado por'],db.activities.map(a=>[esc(a.date),esc(a.description),esc(db.evidence.find(e=>e.id===a.evidenceId)?.file||'—'),esc(a.hours)+' h',esc(db.tutor)]))}
function requestTable(mode){return table(['Fecha','Tipo','Motivo','Estado','Acciones'],db.requests.map(s=>[esc(s.date),esc(s.type),esc(s.reason),status(s.status)+(s.note?`<p class="muted">${esc(s.note)}</p>`:''),mode==='tutor'&&['Enviada','Información recibida'].includes(s.status)?btn('requestInfo',s.id,'Pedir información')+btn('forward',s.id,'Remitir'):mode==='admin'&&s.status==='En revisión'?btn('approveRequest',s.id,'Aprobar')+btn('rejectRequest',s.id,'Rechazar'):mode==='estudiante'&&s.status==='Requiere información'?btn('replyRequest',s.id,'Responder'):'—']))}
function documentTable(){return table(['Documento','Tipo','Archivo','Estado','Fecha'],db.documents.map(d=>[esc(d.name),esc(d.type),esc(d.file),status(d.status),esc(d.date)]))}
function notices(){let n=db.notices.filter(x=>x.to===role);return header('Notificaciones','Avisos relacionados con tu perfil.')+card('Bandeja de notificaciones',table(['Fecha','Mensaje'],n.map(x=>[esc(x.date),esc(x.message)])))}
function student(){switch(page){
case 'Mi práctica':return header('Mi práctica','Consulta de los datos oficiales registrados por el tutor.')+practice()+card('Solicitar un cambio',`<p>Si cambias de empresa, te retiras o necesitas modificar alguna condición, envía una solicitud al tutor.</p>${btn('go','Solicitudes y novedades','Solicitar cambio o novedad','primary')}`);
case 'Enviar evidencias':return header('Mis evidencias','Envía el respaldo de tus actividades al tutor. No registra horas automáticamente.')+card('Enviar nueva evidencia',form('evidence',inp('Fecha de actividad','date','date',today())+area('Descripción breve','description')+inp('Adjuntar PDF, JPG o PNG','file','file','',true,'accept=".pdf,.png,.jpg,.jpeg"'),'Enviar evidencia'))+card('Historial de evidencias',evidenceTable('estudiante'))+(db.practiceStatus!=='En proceso'||!db.authorized?`<p class="notice">La práctica no está autorizada o activa: el sistema rechazará nuevos envíos.</p>`:'');
case 'Mis actividades y horas':return header('Mis actividades y horas','Registros oficiales realizados exclusivamente por el tutor.')+stats([['Horas reconocidas',total()],['Meta de horas',db.goal],['Porcentaje',percent()+'%'],['Actividades',db.activities.length]])+card('Registro de horas',activityTable());
case 'Mis documentos':return header('Mis documentos','Documentación institucional cargada por el tutor. Solo consulta.')+card('Documentos disponibles',documentTable())+card('Convenios relacionados',agreementTable());
case 'Solicitudes y novedades':return header('Solicitudes y novedades','Reporta cambios sin modificar directamente tu expediente.')+card('Solicitar cambio o novedad',form('request',sel('Tipo de novedad','type',['Cambio de empresa','Retiro de prácticas','Suspensión temporal','Reanudación','Cambio de horario','Cambio de responsable','Cambio de tutor','Otro'])+inp('Fecha solicitada','date','date',today())+area('Motivo de la solicitud','reason')+inp('Empresa propuesta (opcional)','newCompany','text','',false)+inp('Justificativo (opcional)','file','file','',false,'accept=".pdf,.jpg,.jpeg,.png"'),'Enviar solicitud'))+card('Mis solicitudes',requestTable('estudiante'));
case 'Notificaciones':return notices();
case 'Mi perfil':return header('Mi perfil','Datos del usuario de demostración.')+card('Información personal',detail([['Nombre',db.student],['Correo','ariela@uleam.edu.ec'],['Rol','Estudiante'],['Carrera','Ingeniería de Software']]))+card('Seguridad',`<p class="muted">La contraseña de demostración es 1234. En una versión real se implementaría autenticación segura.</p>`);
default:return ''}}
function companyTable(){return table(['Empresa','RUC','Responsable','Dirección','Acciones'],db.companies.map(c=>[esc(c.name),esc(c.ruc),esc(c.contact),esc(c.address),btn('selectCompany',c.id,'Asignar a práctica')]))}
function agreementTable(){return table(['Código','Empresa','Vigencia','Archivo','Estado'],db.agreements.map(a=>[esc(a.code),esc(db.companies.find(c=>c.id===a.companyId)?.name||'—'),esc(a.expiry),esc(a.file),status(a.status)]))}
function tutor(){switch(page){
case 'Mis estudiantes':return header('Mis estudiantes','Consulta el expediente de los estudiantes asignados.')+card('Estudiantes asignados',table(['Estudiante','Carrera','Empresa','Horas','Estado','Acciones'],[[esc(db.student),'Ingeniería de Software',esc(company().name),total()+' / '+db.goal,status(db.practiceStatus),btn('go','Gestión de prácticas','Ver expediente')]]))+practice();
case 'Empresas':return header('Empresas e instituciones','Registro de empresas receptoras de prácticas.')+card('Registrar empresa',form('company',inp('Nombre o razón social','name')+inp('RUC','ruc','text','',true,'minlength="10"')+inp('Dirección','address')+inp('Responsable','contact')+inp('Teléfono','phone','tel')+inp('Correo','email','email'),'Registrar empresa'))+card('Empresas registradas',companyTable());
case 'Gestión de prácticas':return header('Gestión de prácticas','El tutor configura los datos oficiales del expediente.')+practice()+card('Editar datos de la práctica',form('practice',sel('Empresa asignada','companyId',db.companies.map(c=>[c.id,c.name]),db.companyId)+sel('Período','period',db.periods.map(p=>p.name),db.period)+inp('Fecha de inicio','start','date',db.start)+inp('Fecha de fin','end','date',db.end)+inp('Horas requeridas','goal','number',db.goal,true,'min="1" max="2000"')+inp('Área','area','text',db.area)+inp('Horario','schedule','text',db.schedule)+inp('Responsable','responsible','text',db.responsible),'Guardar datos'));
case 'Convenios':return header('Convenios','Gestiona convenios y su vigencia para las empresas.')+card('Registrar convenio',form('agreement',inp('Código de convenio','code')+sel('Empresa','companyId',db.companies.map(c=>[c.id,c.name]))+inp('Fecha de firma','signature','date',today())+inp('Fecha de vencimiento','expiry','date')+inp('Archivo PDF','file','file','',true,'accept=".pdf"'),'Guardar convenio'))+card('Convenios registrados',agreementTable());
case 'Documentos':return header('Documentación institucional','Carga cartas, planes, informes y documentos del expediente.')+card('Cargar documento',form('document',inp('Nombre','name')+sel('Tipo','type',['Carta','Plan de prácticas','Certificado','Informe','Otro'])+inp('Archivo PDF','file','file','',true,'accept=".pdf"'),'Guardar documento'))+card('Documentos registrados',documentTable());
case 'Evidencias recibidas':return header('Evidencias recibidas','Acepta las evidencias o devuélvelas con observaciones.')+card('Bandeja de revisión',evidenceTable('tutor'));
case 'Registro de actividades y horas':{const available=db.evidence.filter(e=>e.status==='Aceptada'&&!db.activities.some(a=>a.evidenceId===e.id));return header('Registro de actividades y horas','Solo el tutor puede registrar oficialmente horas respaldadas por evidencias aceptadas.')+card('Registrar actividad',available.length?form('activity',sel('Evidencia aceptada','evidenceId',available.map(e=>[e.id,e.date+' · '+e.description]))+inp('Fecha','date','date',today())+inp('Descripción oficial','description')+inp('Horas reconocidas','hours','number','',true,'min="1" max="12"'),'Registrar actividad y horas'):'<p class="notice">No hay evidencias aceptadas pendientes de registrar. Primero revisa las evidencias recibidas.</p>')+card('Horas registradas',activityTable())}
case 'Solicitudes y novedades':return header('Solicitudes y novedades','Revisa las novedades y remite los cambios que requieran autorización.')+card('Bandeja de solicitudes',requestTable('tutor'));
case 'Seguimiento':return header('Seguimiento','Registra visitas, reuniones y observaciones de los estudiantes.')+card('Nuevo seguimiento',form('followup',inp('Fecha','date','date',today())+sel('Tipo','type',['Visita','Reunión','Observación','Seguimiento remoto'])+area('Descripción','description'),'Guardar seguimiento'))+card('Historial de seguimiento',table(['Fecha','Tipo','Descripción'],db.followups.map(f=>[esc(f.date),esc(f.type),esc(f.description)])));
case 'Evaluaciones e informes':return header('Evaluaciones e informes','Evalúa el desempeño, genera el informe y solicita revisión de cierre.')+card('Evaluación de la práctica',form('evaluation',sel('Cumplimiento de actividades','compliance',['Excelente','Bueno','Regular','Insuficiente'])+sel('Competencias profesionales','skills',['Excelente','Bueno','Regular','Insuficiente'])+sel('Responsabilidad y desempeño','responsibility',['Excelente','Bueno','Regular','Insuficiente'])+inp('Fecha de evaluación','date','date',today())+sel('Resultado final','result',['Aprobado','En proceso','Requiere mejoras'],db.evaluation?.result||'En proceso')+area('Observaciones','note',db.evaluation?.note||''),'Guardar evaluación'))+(db.evaluation?card('Evaluación registrada',detail([['Resultado',db.evaluation.result],['Fecha',db.evaluation.date],['Cumplimiento',db.evaluation.compliance],['Competencias',db.evaluation.skills],['Responsabilidad',db.evaluation.responsibility]])):'')+card('Informe final',`<p>Genera un informe de resumen con los datos registrados. Puedes imprimirlo o guardarlo como PDF.</p>${btn('makeReport',0,'Generar informe','primary')} ${btn('print',0,'Imprimir / Guardar PDF')}`)+card('Revisión de cierre',`<p>Horas: ${total()}/${db.goal}. Evaluación: ${db.evaluation?.result||'Pendiente'}. Documentos: ${db.documents.length}.</p>${btn('requestClosure',0,'Enviar a revisión de cierre','primary',total()<db.goal||db.evaluation?.result!=='Aprobado')}`);
case 'Reportes':return header('Reportes','Consulta el resumen y genera informes imprimibles.')+stats([['Horas',total()],['Evidencias',db.evidence.length],['Documentos',db.documents.length],['Seguimientos',db.followups.length]])+practice()+card('Detalle de actividades',activityTable())+card('Reportes generados',table(['Fecha','Nombre'],db.reports.map(r=>[esc(r.date),esc(r.name)])))+btn('makeReport',0,'Generar reporte','primary')+' '+btn('print',0,'Imprimir / Guardar PDF');
case 'Notificaciones':return notices();default:return ''}}
function admin(){switch(page){
case 'Usuarios y asignaciones':return header('Usuarios y asignaciones','Gestiona roles, cuentas y asignación de tutores.')+`<div class="tabs"><button class="tab ${tab==='Usuarios'?'active':''}" data-tab="Usuarios">Usuarios</button><button class="tab ${tab==='Asignaciones'?'active':''}" data-tab="Asignaciones">Asignaciones</button></div>`+(tab==='Usuarios'?card('Usuarios registrados',table(['Nombre','Correo','Rol','Estado','Acciones'],db.users.map(u=>[esc(u.name),esc(u.email),esc(u.role),status(u.status),btn('toggleUser',u.id,u.status==='Activo'?'Desactivar':'Activar')]))+card('Alta de usuario',form('user',inp('Nombre completo','name')+inp('Correo institucional','email','email')+sel('Rol','role',['Estudiante','Tutor','Administrador'])+sel('Estado','status',['Activo','Inactivo']),'Guardar usuario'))):card('Asignaciones actuales',table(['Estudiante','Tutor','Período'],db.assignments.map(a=>[esc(a.student),esc(a.tutor),esc(a.period)])))+card('Asignar tutor',form('assignment',sel('Estudiante','student',db.users.filter(u=>u.role==='Estudiante').map(u=>u.name))+sel('Tutor académico','tutor',db.users.filter(u=>u.role==='Tutor').map(u=>u.name))+sel('Período','period',db.periods.map(p=>p.name)),'Guardar asignación')))+card('Historial de cambios',historyTable());
case 'Períodos':return header('Períodos académicos','Crea períodos y conserva su historial de cambios.')+card('Períodos académicos',table(['Nombre','Código','Inicio / fin','Estado','Acciones'],db.periods.map(p=>[esc(p.name),esc(p.code),esc(p.start)+' / '+esc(p.end),status(p.status),btn('togglePeriod',p.id,p.status==='Activo'?'Desactivar':'Activar')]))+card('Crear período',form('period',inp('Nombre','name')+inp('Identificador','code')+inp('Fecha de inicio','start','date')+inp('Fecha de fin','end','date')+sel('Estado','status',['Borrador','Activo','Inactivo']),'Guardar período')))+card('Historial del período',historyTable());
case 'Autorizaciones':return header('Autorizaciones','Revisa la documentación y autoriza el inicio.')+practice()+card('Requisitos de autorización',`<p>Convenios registrados: ${db.agreements.length}. Documentos: ${db.documents.length}.</p><p>Estado: ${status(db.authorized?'Autorizada':'Pendiente')}</p>${btn('authorize',0,'Autorizar inicio','primary',db.authorized||!db.agreements.length||!db.documents.length)}`);
case 'Solicitudes importantes':return header('Solicitudes importantes','Resuelve las novedades remitidas por el tutor.')+card('Solicitudes pendientes de decisión',requestTable('admin'));
case 'Supervisión':return header('Supervisión general','Consulta prácticas, horas, convenios y trazabilidad.')+stats([['Estudiantes',db.users.filter(x=>x.role==='Estudiante').length],['Tutores',db.users.filter(x=>x.role==='Tutor').length],['Convenios',db.agreements.length],['Horas',total()]])+practice()+card('Historial de acciones',historyTable());
case 'Cierre de prácticas':{let ready=total()>=db.goal&&db.evaluation?.result==='Aprobado'&&db.documents.length>0&&db.practiceStatus==='En proceso';return header('Cierre de prácticas','Verifica el cumplimiento de los requisitos para finalizar.')+card('Lista de requisitos',detail([['Horas',total()+' / '+db.goal],['Evaluación',db.evaluation?.result||'Pendiente'],['Documentos',db.documents.length+' registrados'],['Estado',db.practiceStatus]]))+card('Cierre administrativo',`<p class="notice">El botón se habilita cuando se completan las horas, existe evaluación aprobada y el expediente tiene documentos.</p>${btn('close',0,'Finalizar práctica','primary',!ready)}`)}
case 'Reportes generales':return header('Reportes generales','Resumen institucional para la demostración.')+stats([['Empresas',db.companies.length],['Períodos',db.periods.length],['Evidencias',db.evidence.length],['Horas',total()]])+card('Reporte de actividades',activityTable())+btn('print',0,'Imprimir / Guardar PDF','primary');
case 'Notificaciones':return notices();default:return ''}}
function historyTable(){return table(['Fecha','Responsable','Acción'],db.history.map(h=>[esc(h.date),esc(h.actor),esc(h.detail)]))}
function validateFile(file,ext){if(!file)return 'Selecciona un archivo';if(!ext.some(x=>file.name.toLowerCase().endsWith(x)))return 'Tipo de archivo no permitido';if(file.size>3*1024*1024)return 'Archivo mayor a 3 MB';return ''}
function selectedFile(form){return form.querySelector('input[type=file]')?.files?.[0]}
function record(message,to){audit(message);if(to)notify(to,message);persist();render();toast(message)}
function submitForm(form){const k=form.dataset.form,v=Object.fromEntries(new FormData(form).entries());const file=selectedFile(form);let err='';
 if(k==='evidence'){
  if(!db.authorized||db.practiceStatus!=='En proceso')return toast('La práctica debe estar autorizada y activa');
  err=validateFile(file,['.pdf','.png','.jpg','.jpeg']);if(err)return toast(err);
  db.evidence.push({id:uid(),date:v.date,description:v.description.trim(),file:file.name,status:'Pendiente',note:''});return record('Evidencia enviada al tutor','tutor');
 }
 if(k==='request'){
  if(v.reason.trim().length<8)return toast('Escribe un motivo de al menos 8 caracteres');
  if(file&&(err=validateFile(file,['.pdf','.png','.jpg','.jpeg'])))return toast(err);
  db.requests.push({id:uid(),type:v.type,date:v.date,reason:v.reason.trim(),newCompany:v.newCompany.trim(),file:file?.name||'',status:'Enviada',note:''});return record('Solicitud enviada al tutor','tutor');
 }
 if(k==='company'){
  if(db.companies.some(c=>c.ruc===v.ruc.trim()))return toast('Ya existe una empresa con ese RUC');
  db.companies.push({id:uid(),name:v.name.trim(),ruc:v.ruc.trim(),address:v.address.trim(),contact:v.contact.trim(),phone:v.phone.trim(),email:v.email.trim()});return record('Empresa registrada');
 }
 if(k==='practice'){
  if(v.end<v.start)return toast('La fecha de fin debe ser posterior al inicio');if(Number(v.goal)<total())return toast('La meta no puede ser menor a las horas ya reconocidas');
  Object.assign(db,{companyId:Number(v.companyId),period:v.period,start:v.start,end:v.end,goal:Number(v.goal),area:v.area,schedule:v.schedule,responsible:v.responsible});return record('Datos de la práctica actualizados','estudiante');
 }
 if(k==='agreement'){
  if((err=validateFile(file,['.pdf'])))return toast(err);if(v.expiry<v.signature)return toast('El vencimiento debe ser posterior a la firma');
  db.agreements.push({id:uid(),code:v.code.trim(),companyId:Number(v.companyId),signature:v.signature,expiry:v.expiry,file:file.name,status:v.expiry<today()?'Vencido':'Vigente'});return record('Convenio registrado');
 }
 if(k==='document'){
  if((err=validateFile(file,['.pdf'])))return toast(err);
  db.documents.push({id:uid(),name:v.name.trim(),type:v.type,file:file.name,status:'Pendiente',date:today()});return record('Documento registrado');
 }
 if(k==='activity'){
  let evidence=db.evidence.find(e=>e.id===Number(v.evidenceId)),hours=Number(v.hours);
  if(!db.authorized||db.practiceStatus!=='En proceso')return toast('La práctica no está activa');
  if(!evidence||evidence.status!=='Aceptada'||db.activities.some(a=>a.evidenceId===evidence.id))return toast('Evidencia inválida o ya registrada');
  if(!Number.isInteger(hours)||hours<1||hours>12||total()+hours>db.goal)return toast('Las horas deben ser entre 1 y 12, sin superar la meta');
  db.activities.push({id:uid(),evidenceId:evidence.id,date:v.date,description:v.description.trim(),hours});return record('Tutor registró '+hours+' horas oficiales','estudiante');
 }
 if(k==='followup'){db.followups.push({id:uid(),date:v.date,type:v.type,description:v.description.trim()});return record('Seguimiento guardado')}
 if(k==='evaluation'){db.evaluation={...v};return record('Evaluación registrada','estudiante')}
 if(k==='user'){
  if(db.users.some(u=>u.email.toLowerCase()===v.email.toLowerCase()))return toast('El correo ya está registrado');
  db.users.push({id:uid(),name:v.name.trim(),email:v.email.trim(),role:v.role,status:v.status});return record('Usuario registrado');
 }
 if(k==='assignment'){db.assignments.push({id:uid(),student:v.student,tutor:v.tutor,period:v.period});db.tutor=v.tutor;db.student=v.student;return record('Tutor asignado','estudiante')}
 if(k==='period'){
  if(v.end<v.start)return toast('La fecha final debe ser posterior a la inicial');if(db.periods.some(p=>p.code===v.code.trim()))return toast('El código del período ya existe');
  db.periods.push({id:uid(),name:v.name.trim(),code:v.code.trim(),start:v.start,end:v.end,status:v.status});return record('Período académico guardado');
 }
}
function handleAction(action,id){const e=db.evidence.find(x=>x.id===Number(id)),r=db.requests.find(x=>x.id===Number(id));
 if(action==='go'){page=id;render();return}
 if(action==='print'){window.print();return}
 if(action==='acceptEvidence'&&e&&e.status==='Pendiente'){e.status='Aceptada';return record('Tutor aceptó evidencia','estudiante')}
 if(action==='observeEvidence'&&e&&e.status==='Pendiente'){let note=prompt('Observación obligatoria para el estudiante:');if(!note?.trim())return toast('Debes escribir una observación');e.status='Observada';e.note=note.trim();return record('Tutor devolvió evidencia: '+note,'estudiante')}
 if(action==='correctEvidence'&&e&&e.status==='Observada'){let description=prompt('Descripción corregida:',e.description);if(!description?.trim())return;let filename=prompt('Nombre del archivo corregido (PDF/JPG/PNG):',e.file);if(!filename||!(/\.(pdf|jpg|jpeg|png)$/i.test(filename)))return toast('Escribe un nombre de archivo válido');e.description=description.trim();e.file=filename;e.status='Pendiente';e.note='';return record('Estudiante corrigió evidencia','tutor')}
 if(action==='requestInfo'&&r){let note=prompt('¿Qué información necesita el estudiante?');if(!note?.trim())return toast('Escribe la observación');r.status='Requiere información';r.note=note;return record('Tutor solicitó información adicional','estudiante')}
 if(action==='replyRequest'&&r){let reply=prompt('Respuesta para el tutor:');if(!reply?.trim())return;r.status='Información recibida';r.note='Respuesta: '+reply;return record('Estudiante respondió la solicitud','tutor')}
 if(action==='forward'&&r){r.status='En revisión';return record('Tutor remitió solicitud al administrador','admin')}
 if(action==='approveRequest'&&r&&r.status==='En revisión'){
  if(!confirm('¿Aprobar esta solicitud?'))return;
  if(r.type==='Cambio de empresa'){
   let c=db.companies.find(x=>x.name.toLowerCase()===r.newCompany.toLowerCase());
   if(!c){let name=prompt('Nombre de la nueva empresa (el tutor podrá completar los datos después):',r.newCompany);if(!name?.trim())return; c={id:uid(),name:name.trim(),ruc:'Por completar',address:'Por completar',contact:'Por completar',phone:'',email:''};db.companies.push(c)}
   db.changes.push({date:today(),from:company().name,to:c.name,type:'Cambio de empresa'});db.companyId=c.id;
  }
  if(r.type==='Retiro de prácticas')db.practiceStatus='Retirada';
  if(r.type==='Suspensión temporal')db.practiceStatus='Suspendida';
  if(r.type==='Reanudación')db.practiceStatus='En proceso';
  if(r.type==='Cambio de horario'){const schedule=prompt('Nuevo horario autorizado:',db.schedule);if(!schedule?.trim())return;db.schedule=schedule}
  if(r.type==='Cambio de responsable'){const responsible=prompt('Nuevo responsable:',db.responsible);if(!responsible?.trim())return;db.responsible=responsible}
  if(r.type==='Cambio de tutor'){const tutor=prompt('Nuevo tutor:',db.tutor);if(!tutor?.trim())return;db.tutor=tutor}
  r.status='Aprobada';return record('Administrador aprobó solicitud: '+r.type,'estudiante');
 }
 if(action==='rejectRequest'&&r){let note=prompt('Motivo obligatorio del rechazo:');if(!note?.trim())return toast('Escribe un motivo');r.status='Rechazada';r.note=note;return record('Administrador rechazó solicitud: '+note,'estudiante')}
 if(action==='selectCompany'){db.companyId=Number(id);return record('Empresa asignada a la práctica','estudiante')}
 if(action==='toggleUser'){const u=db.users.find(x=>x.id===Number(id));if(!u)return;u.status=u.status==='Activo'?'Inactivo':'Activo';return record('Cuenta de '+u.name+': '+u.status)}
 if(action==='togglePeriod'){const p=db.periods.find(x=>x.id===Number(id));if(!p)return;p.status=p.status==='Activo'?'Inactivo':'Activo';return record('Período '+p.name+': '+p.status)}
 if(action==='authorize'){if(!db.agreements.length||!db.documents.length)return toast('Se requiere convenio y documentación');db.authorized=true;db.practiceStatus='En proceso';return record('Administrador autorizó inicio de práctica','estudiante')}
 if(action==='makeReport'){db.reports.push({date:today(),name:'Informe de práctica · '+db.student});return record('Informe generado (resumen listo para imprimir)')}
 if(action==='requestClosure'){if(total()<db.goal||db.evaluation?.result!=='Aprobado')return toast('Faltan requisitos');notify('admin','Tutor solicitó revisión de cierre');return record('Tutor envió expediente a revisión de cierre')}
 if(action==='close'){if(total()<db.goal||db.evaluation?.result!=='Aprobado'||!db.documents.length)return toast('Faltan requisitos de cierre');if(!confirm('¿Finalizar esta práctica?'))return;db.practiceStatus='Finalizada';return record('Administrador finalizó práctica','estudiante')}
}
$('loginForm').addEventListener('submit',ev=>{ev.preventDefault();if($('loginPass').value!=='1234')return toast('Contraseña incorrecta. Usa 1234.');role=$('loginRole').value;page='Inicio';$('login').classList.add('hidden');$('app').classList.remove('hidden');render()});
$('logout').addEventListener('click',()=>{role=null;$('app').classList.add('hidden');$('login').classList.remove('hidden');$('loginPass').value=''});
$('menu').addEventListener('click',ev=>{const b=ev.target.closest('[data-page]');if(b){page=b.dataset.page;render()}});
$('content').addEventListener('click',ev=>{const t=ev.target.closest('[data-tab]');if(t){tab=t.dataset.tab;render();return}const b=ev.target.closest('[data-action]');if(b)handleAction(b.dataset.action,b.dataset.id)});
$('content').addEventListener('submit',ev=>{const f=ev.target.closest('form[data-form]');if(!f)return;ev.preventDefault();submitForm(f)});

$('resetDemo').addEventListener('click',()=>{if(confirm('¿Borrar los cambios y restaurar los datos iniciales?')){db=seed();persist();render();toast('Datos de prueba restaurados')}});

