let selectedDay=LifeOS.dayIndex(),taskFilter="all",focusMinutes=25,timerLeft=1500,timerRunning=false,timerInterval=null;

const THEMES=[
{id:"midnight",name:"Midnight",rarity:"GRATIS",cost:0,emoji:"🌙",bg:"linear-gradient(135deg,#211b35,#7357e8)"},
{id:"lavender",name:"Lavender",rarity:"COMÚN",cost:500,emoji:"🌸",bg:"linear-gradient(135deg,#e8dcff,#a78cff)"},
{id:"ocean",name:"Ocean",rarity:"RARO",cost:1500,emoji:"🌊",bg:"linear-gradient(135deg,#d8f2ff,#4da7d9)"},
{id:"forest",name:"Forest",rarity:"RARO",cost:2000,emoji:"🌿",bg:"linear-gradient(135deg,#d9f4e4,#49ae79)"},
{id:"sunset",name:"Sunset",rarity:"ÉPICO",cost:3500,emoji:"🌅",bg:"linear-gradient(135deg,#ffd9cf,#ef7c68)"},
{id:"cosmos",name:"Cosmos",rarity:"ÉPICO",cost:5000,emoji:"🪐",bg:"linear-gradient(135deg,#201637,#5d4bd7)"},
{id:"aurora",name:"Aurora",rarity:"LEGENDARIO",cost:8000,emoji:"✨",bg:"linear-gradient(135deg,#102b31,#64d9b0)"},
{id:"glass",name:"Glass",rarity:"LEGENDARIO",cost:10000,emoji:"💎",bg:"linear-gradient(135deg,#edf5ff,#8db6e8)"}
];

const EFFECTS=[
{id:"spark",name:"XP Spark",rarity:"COMÚN",cost:700,emoji:"✨",desc:"Efecto especial al ganar XP."},
{id:"confetti",name:"Level Confetti",rarity:"ÉPICO",cost:2500,emoji:"🎉",desc:"Confeti al subir de nivel."},
{id:"glow",name:"Focus Glow",rarity:"ÉPICO",cost:3500,emoji:"💫",desc:"Efecto visual al completar enfoque."}
];

const AVATARS=[
{id:"moon",name:"Moon",rarity:"COMÚN",cost:400,emoji:"🌙"},
{id:"fox",name:"Fox",rarity:"RARO",cost:1200,emoji:"🦊"},
{id:"robot",name:"Orbit",rarity:"ÉPICO",cost:3000,emoji:"🤖"},
{id:"crown",name:"Crown",rarity:"LEGENDARIO",cost:6000,emoji:"👑"}
];


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL="https://wqfsgzpgshdvyjsnmqds.supabase.co";

const SUPABASE_ANON_KEY="BIb4lQOoZdclzLLiryHnCCvhNaiSwLtcZSjnGHdADqUsdaNPv0_MkX6nfEjs8Ogo5P_Ya47v3XYDTYeQpb50He0";

let supabaseClient=null;

function initSupabase(){

  if(
    typeof window.supabase!=="undefined" &&
    SUPABASE_ANON_KEY
  ){

    supabaseClient=
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

  }

}


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded",async ()=>{

  initSupabase();

  updateStreak();

  bind();

  applyTheme();

  render();

  if(window.LifeOSNotifications){

    LifeOSNotifications.updateNotificationStatus();

    if(
      "Notification" in window &&
      Notification.permission==="granted"
    ){

      LifeOSNotifications.startNotifications();

    }

  }

  await loadClassesFromSupabase();

});


/* =========================================================
   EVENTOS
   ========================================================= */

function bind(){

  document.querySelectorAll("[data-screen]").forEach(
    b=>b.onclick=()=>showScreen(b.dataset.screen)
  );


  document.getElementById("settingsBtn").onclick=()=>{
    showScreen("settingsScreen");
  };


  document.getElementById("newClass").onclick=()=>{
    openModal("Nueva clase",classForm());
  };


  document.getElementById("newTask").onclick=
  document.getElementById("newTask2").onclick=()=>{
    openModal("Nuevo objetivo",taskForm());
  };


  document.getElementById("pdfBtn").onclick=exportPDF;


  document.getElementById("closeModal").onclick=closeModal;


  document.getElementById("notifyBtn").onclick=requestNotifications;


  document.getElementById("saveSettings").onclick=saveSettings;


  document.getElementById("resetBtn").onclick=()=>{

    if(confirm("¿Borrar todos los datos?")){

      LifeOS.reset();

      render();

      toast("LifeOS restablecido");

    }

  };


  document.querySelectorAll("[data-filter]").forEach(
    b=>b.onclick=()=>{

      taskFilter=b.dataset.filter;

      document.querySelectorAll("[data-filter]").forEach(
        x=>x.classList.toggle("active",x===b)
      );

      renderTasks();

    }
  );


  document.querySelectorAll(".duration").forEach(
    b=>b.onclick=()=>{

      if(timerRunning)return;

      focusMinutes=+b.dataset.min;

      timerLeft=focusMinutes*60;

      document.querySelectorAll(".duration").forEach(
        x=>x.classList.toggle("active",x===b)
      );

      updateTimer();

    }
  );


  document.getElementById("focusStart").onclick=toggleFocus;


  document.querySelectorAll(".store-tab").forEach(
    b=>b.onclick=()=>{

      document.querySelectorAll(".store-tab").forEach(
        x=>x.classList.toggle("active",x===b)
      );

      renderStore(b.dataset.store);

    }
  );

}


/* =========================================================
   PANTALLAS
   ========================================================= */

function showScreen(id){

  document.querySelectorAll(".screen").forEach(
    x=>x.classList.toggle("active",x.id===id)
  );

  document.querySelectorAll(".nav-item").forEach(
    x=>x.classList.toggle(
      "active",
      x.dataset.screen===id
    )
  );

  scrollTo(0,0);

}


/* =========================================================
   RENDER
   ========================================================= */

function render(){

  renderHeader();

  renderXP();

  renderHome();

  renderSchedule();

  renderTasks();

  renderStore("themes");

  renderSettings();

  renderFocusStats();

}


function renderHeader(){

  const h=new Date().getHours();

  const name=
    LifeOS.state.profile.nickname||
    LifeOS.state.profile.name||
    "ahí";

  document.getElementById("hello").textContent=
    `${h<12?"Buenos días":h<19?"Buenas tardes":"Buenas noches"}, ${name} 👋`;

  document.getElementById("todayLabel").textContent=
    new Date().toLocaleDateString(
      "es-CL",
      {
        weekday:"long",
        day:"numeric",
        month:"long"
      }
    );

}


function renderXP(){

  const x=levelData();

  document.getElementById("level").textContent=x.level;

  document.getElementById("xpText").textContent=
    `${x.current} / ${x.need} XP`;

  document.getElementById("xpBar").style.width=
    x.current+"%";

  document.getElementById("streak").textContent=
    "🔥 "+LifeOS.state.streak;

  document.getElementById("storeXP").textContent=
    LifeOS.state.xp+" XP";

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome(){

  const cs=classesDay(LifeOS.dayIndex());

  const now=new Date();

  const cur=
    now.getHours()*60+
    now.getMinutes();

  const upcoming=
    cs.find(c=>{

      const [h,m]=c.start.split(":").map(Number);

      return h*60+m>=cur;

    })||cs[0];


  document.getElementById("nextClass").innerHTML=
    upcoming
    ?
    `<div class="card next-card">

      <div class="next-time">
        ${upcoming.start}<br>${upcoming.end}
      </div>

      <div class="next-main">

        <b>
          ${LifeOS.escapeHtml(upcoming.title)}
        </b>

        <small>
          ${
            upcoming.room
            ?"Sala "+LifeOS.escapeHtml(upcoming.room)
            :"Sin sala"
          }

          ${
            upcoming.teacher
            ?" · "+LifeOS.escapeHtml(upcoming.teacher)
            :""
          }
        </small>

      </div>

      <span class="badge">
        🔔 ${reminderText(+upcoming.reminder)}
      </span>

    </div>`

    :

    '<div class="empty">No tienes clases programadas para hoy.</div>';


  const ts=
    LifeOS.state.tasks
      .filter(t=>t.date===LifeOS.today())
      .slice(0,4);


  document.getElementById("homeTasks").innerHTML=
    ts.length
    ?
    ts.map(taskHTML).join("")
    :
    '<div class="empty">Tu día está libre. Añade una misión y empieza a ganar XP.</div>';


  bindDynamic();

}


/* =========================================================
   HORARIO
   ========================================================= */

function renderSchedule(){

  document.getElementById("days").innerHTML=
    DAYS.map(
      (d,i)=>
        `<button class="${i===selectedDay?"active":""}" data-day="${i}">
          ${d.slice(0,3)}
        </button>`
    ).join("");


  document.querySelectorAll("[data-day]").forEach(
    b=>b.onclick=()=>{

      selectedDay=+b.dataset.day;

      renderSchedule();

    }
  );


  const cs=classesDay(selectedDay);


  document.getElementById("scheduleList").innerHTML=
    cs.length
    ?
    cs.map(
      c=>
        `<div class="card schedule-card" data-edit="${c.id}">

          <div class="time">
            ${c.start}<br>${c.end}
          </div>

          <div>

            <div class="class-name">
              ${LifeOS.escapeHtml(c.title)}
            </div>

            <div class="meta">

              ${c.room?"Sala "+LifeOS.escapeHtml(c.room):""}

              ${c.teacher?" · "+LifeOS.escapeHtml(c.teacher):""}

              · 🔔 ${reminderText(+c.reminder)}

            </div>

          </div>

          <span class="dot"></span>

        </div>`
    ).join("")

    :

    '<div class="empty">No hay clases este día.</div>';


  document.querySelectorAll("[data-edit]").forEach(
    e=>e.onclick=()=>{

      const c=
        LifeOS.state.classes.find(
          x=>x.id===e.dataset.edit
        );

      openModal(
        "Editar clase",
        classForm(c),
        c
      );

    }
  );

}


/* =========================================================
   TAREAS
   ========================================================= */

function taskHTML(t){

  return `
    <div class="card task">

      <button
        class="check ${t.done?"done":""}"
        data-task="${t.id}"
      >
        ${t.done?"✓":""}
      </button>

      <div class="task-main ${t.done?"done":""}">

        <b>
          ${LifeOS.escapeHtml(t.title)}
        </b>

        <small>
          ${t.date} · ${t.done?"Completado":"Pendiente"}
        </small>

      </div>

      <span class="xp-pill">
        +${t.xp} XP
      </span>

    </div>
  `;

}


function renderTasks(){

  let ts=[...LifeOS.state.tasks];

  if(taskFilter==="pending")
    ts=ts.filter(t=>!t.done);

  if(taskFilter==="done")
    ts=ts.filter(t=>t.done);


  document.getElementById("tasksList").innerHTML=
    ts.length
    ?
    ts.map(taskHTML).join("")
    :
    '<div class="empty">No hay objetivos en esta vista.</div>';


  bindDynamic();

}


function bindDynamic(){

  document.querySelectorAll("[data-task]").forEach(
    b=>b.onclick=()=>toggleTask(b.dataset.task)
  );

}


/* =========================================================
   MODALES
   ========================================================= */

function openModal(title,html,existing=null){

  document.getElementById("modalTitle").textContent=title;

  const f=document.getElementById("modalForm");

  f.innerHTML=html;

  document.getElementById("modal").classList.remove("hidden");


  f.onsubmit=async e=>{

    e.preventDefault();

    const d=new FormData(f);


    if(
      html.includes('name="title"')&&
      html.includes('name="day"')
    ){

      const data={

        title:d.get("title"),

        day:+d.get("day"),

        room:d.get("room"),

        start:d.get("start"),

        end:d.get("end"),

        teacher:d.get("teacher"),

        reminder:+d.get("reminder")

      };


      if(existing){

        Object.assign(existing,data);

      }else{

        LifeOS.state.classes.push({

          id:LifeOS.uid("class"),

          ...data

        });

      }


      LifeOS.save();


      await syncClassesToSupabase();


    }else{

      const data={

        title:d.get("title"),

        xp:+d.get("xp"),

        date:d.get("date"),

        done:false

      };


      if(existing)

        Object.assign(existing,data);

      else

        LifeOS.state.tasks.push({

          id:LifeOS.uid("task"),

          ...data

        });


      LifeOS.save();

    }


    closeModal();

    render();

    toast("Guardado");

  };


  f.querySelector("[data-close]")
    ?.addEventListener("click",closeModal);


  if(
    existing&&
    document.getElementById("deleteClass")
  ){

    document.getElementById("deleteClass").onclick=
    async ()=>{

      LifeOS.state.classes=
        LifeOS.state.classes.filter(
          x=>x.id!==existing.id
        );


      LifeOS.save();

      await syncClassesToSupabase();

      closeModal();

      render();

      toast("Clase eliminada");

    };

  }

}


function closeModal(){

  document
    .getElementById("modal")
    .classList.add("hidden");

}


/* =========================================================
   SUPABASE — CARGAR CLASES
   ========================================================= */

async function loadClassesFromSupabase(){

  if(!supabaseClient)
    return;


  try{

    const {
      data:{
        user
      },
      error:userError
    }=
      await supabaseClient.auth.getUser();


    if(userError)
      throw userError;


    if(!user)
      return;


    const {
      data,
      error
    }=
      await supabaseClient
        .from("classes")
        .select("*")
        .eq("user_id",user.id)
        .order("start_time");


    if(error)
      throw error;


    if(!Array.isArray(data))
      return;


    LifeOS.state.classes=
      data.map(c=>({

        id:c.id,

        title:c.title,

        day:Number(c.day),

        start:c.start_time,

        end:c.end_time,

        room:c.room||"",

        teacher:c.teacher||"",

        reminder:
          Number.isFinite(Number(c.reminder_minutes))
          ?Number(c.reminder_minutes)
          :LifeOS.state.profile.reminder

      }));


    LifeOS.save();

    render();


    console.log(
      "Clases cargadas desde Supabase."
    );


  }catch(error){

    console.error(
      "Error cargando clases desde Supabase:",
      error
    );

  }

}


/* =========================================================
   SUPABASE — SINCRONIZAR CLASES
   ========================================================= */

async function syncClassesToSupabase(){

  if(!supabaseClient){

    console.warn(
      "Supabase no está inicializado."
    );

    return;

  }


  try{

    const {
      data:{
        user
      },
      error:userError
    }=
      await supabaseClient.auth.getUser();


    if(userError)
      throw userError;


    if(!user){

      console.warn(
        "No hay usuario autenticado en Supabase."
      );

      return;

    }


    const {
      error:deleteError
    }=
      await supabaseClient
        .from("classes")
        .delete()
        .eq("user_id",user.id);


    if(deleteError)
      throw deleteError;


    if(!LifeOS.state.classes.length)
      return;


    const rows=
      LifeOS.state.classes.map(c=>({

        user_id:user.id,

        title:c.title,

        day:Number(c.day),

        start_time:c.start,

        end_time:c.end,

        room:c.room||null,

        teacher:c.teacher||null,

        reminder_minutes:
          Number.isFinite(Number(c.reminder))
          ?Number(c.reminder)
          :90

      }));


    const {
      error:insertError
    }=
      await supabaseClient
        .from("classes")
        .insert(rows);


    if(insertError)
      throw insertError;


    console.log(
      "Clases sincronizadas con Supabase."
    );


  }catch(error){

    console.error(
      "Error sincronizando clases con Supabase:",
      error
    );

  }

}


/* =========================================================
   TAREAS
   ========================================================= */

function toggleTask(id){

  const t=
    LifeOS.state.tasks.find(
      x=>x.id===id
    );

  if(!t)return;


  if(!t.done){

    t.done=true;

    LifeOS.save();

    addXP(
      t.xp,
      t.title
    );

  }else{

    t.done=false;

    LifeOS.state.xp=
      Math.max(
        0,
        LifeOS.state.xp-t.xp
      );

    LifeOS.save();

    toast(`-${t.xp} XP`);

    render();

  }

}


/* =========================================================
   FOCUS
   ========================================================= */

function toggleFocus(){

  if(timerRunning){

    clearInterval(timerInterval);

    timerRunning=false;

    document.getElementById("focusStart")
      .textContent="Continuar enfoque";

    document.getElementById("timerState")
      .textContent="Pausado";

    return;

  }


  timerRunning=true;

  document.getElementById("focusStart")
    .textContent="Pausar";

  document.getElementById("timerState")
    .textContent="Enfoque activo";


  timerInterval=setInterval(
    ()=>{

      timerLeft--;

      updateTimer();

      if(timerLeft<=0)
        finishFocus();

    },
    1000
  );

}


function updateTimer(){

  const m=Math.floor(timerLeft/60);

  const s=timerLeft%60;


  document.getElementById("timer").textContent=
    `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;


  const total=focusMinutes*60;

  const deg=
    (1-timerLeft/total)*360;


  document.querySelector(".timer-ring").style.background=
    `conic-gradient(var(--accent) ${deg}deg,#eeeaf6 ${deg}deg)`;

}


function finishFocus(){

  clearInterval(timerInterval);

  timerRunning=false;


  const title=
    document.getElementById("focusTitle")
      .value.trim()||
    "Sesión de enfoque";


  const xp=
    Math.round(
      focusMinutes*1.33
    );


  LifeOS.state.focus.push({

    id:LifeOS.uid("focus"),

    date:LifeOS.today(),

    minutes:focusMinutes,

    title,

    xp

  });


  LifeOS.save();


  addXP(
    xp,
    title
  );


  document.getElementById("focusStart")
    .textContent="Comenzar enfoque";


  document.getElementById("timerState")
    .textContent="¡Sesión completada!";


  timerLeft=focusMinutes*60;

  updateTimer();

  renderFocusStats();

}


function renderFocusStats(){

  const t=LifeOS.today();


  const today=
    LifeOS.state.focus
      .filter(x=>x.date===t)
      .reduce(
        (a,x)=>a+x.minutes,
        0
      );


  const week=
    LifeOS.state.focus
      .reduce(
        (a,x)=>a+x.minutes,
        0
      );


  const xp=
    LifeOS.state.focus
      .reduce(
        (a,x)=>a+x.xp,
        0
      );


  document.getElementById("focusToday")
    .textContent=today+"m";


  document.getElementById("focusWeek")
    .textContent=week+"m";


  document.getElementById("focusXP")
    .textContent=xp;

}


/* =========================================================
   TIENDA
   ========================================================= */

function renderStore(type){

  const items=
    type==="themes"
    ?THEMES
    :type==="effects"
    ?EFFECTS
    :AVATARS;


  document.getElementById("storeItems").innerHTML=
    items.map(
      i=>{

        const unlocked=
          LifeOS.state.unlocked.includes(i.id);

        const equipped=
          LifeOS.state.equipped===i.id;


        return `

          <div class="skin">

            <div
              class="skin-preview"
              style="background:${
                i.bg||
                "linear-gradient(135deg,#f3efff,#ddd5ff)"
              }"
            >
              ${i.emoji}
            </div>

            <div class="skin-body">

              <span class="rarity">
                ${i.rarity}
              </span>

              <h3>
                ${i.name}
              </h3>

              <p>
                ${
                  i.desc||
                  "Personaliza tu experiencia en LifeOS."
                }
              </p>

              <button
                class="${equipped?"soft":"primary"}"
                data-skin="${i.id}"
                data-cost="${i.cost}"
                data-type="${type}"
              >
                ${
                  equipped
                  ?"✓ Equipado"
                  :unlocked
                  ?"Equipar"
                  :i.cost+" XP"
                }
              </button>

            </div>

          </div>

        `;

      }
    ).join("");


  document.querySelectorAll("[data-skin]").forEach(
    b=>b.onclick=()=>buySkin(
      b.dataset.skin,
      +b.dataset.cost,
      b.dataset.type
    )
  );

}


function buySkin(id,cost,type){

  if(!LifeOS.state.unlocked.includes(id)){

    if(!spendXP(cost)){

      toast(
        `Te faltan ${cost-LifeOS.state.xp} XP`
      );

      return;

    }

    LifeOS.state.unlocked.push(id);

    toast("✨ Desbloqueado");

  }


  if(type==="themes"){

    LifeOS.state.equipped=id;

    LifeOS.state.profile.theme=id;

    applyTheme();

  }


  LifeOS.save();

  renderStore(type);

  renderXP();

}


/* =========================================================
   TEMAS
   ========================================================= */

function applyTheme(){

  document.body.dataset.theme=
    LifeOS.state.equipped;


  const t=
    THEMES.find(
      x=>x.id===LifeOS.state.equipped
    )||THEMES[0];


  const root=
    document.documentElement;


  const map={

    midnight:[
      "#7357e8",
      "#a78cff",
      "#f6f5fb",
      "#24212d"
    ],

    lavender:[
      "#9272e8",
      "#c1aaff",
      "#f8f5ff",
      "#27222f"
    ],

    ocean:[
      "#2b8dbb",
      "#68c7ec",
      "#f2fbff",
      "#202c31"
    ],

    forest:[
      "#258d5a",
      "#62c993",
      "#f2fbf6",
      "#202b24"
    ],

    sunset:[
      "#e76c5c",
      "#ffad82",
      "#fff7f3",
      "#332522"
    ],

    cosmos:[
      "#6756df",
      "#a08fff",
      "#f5f3ff",
      "#242033"
    ],

    aurora:[
      "#2b9c80",
      "#76e0b9",
      "#f1fcf8",
      "#202c29"
    ],

    glass:[
      "#6094ca",
      "#a8d1ef",
      "#f3f8fd",
      "#202933"
    ]

  };


  const v=
    map[t.id]||map.midnight;


  root.style.setProperty(
    "--accent",
    v[0]
  );


  root.style.setProperty(
    "--accent2",
    v[1]
  );


  root.style.setProperty(
    "--soft",
    v[2]
  );


  root.style.setProperty(
    "--card",
    t.id==="midnight"||
    t.id==="cosmos"
    ?" #171525"
    :"#fff"
  );


  if(
    t.id==="midnight"||
    t.id==="cosmos"
  ){

    document.body.style.background=
      "#f6f5fb";

  }

}


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function renderSettings(){

  const p=LifeOS.state.profile;


  document.getElementById("nameInput").value=
    p.name;


  document.getElementById("nicknameInput").value=
    p.nickname;


  document.getElementById("reminderInput").value=
    p.reminder;


  document.getElementById("morningInput").checked=
    p.morning;


  document.getElementById("nightInput").checked=
    p.night;


  document.getElementById("animationsInput").checked=
    p.animations;


  document.getElementById("effectsInput").checked=
    p.effects;


  document.getElementById("themeSelect").innerHTML=
    THEMES
      .filter(
        t=>LifeOS.state.unlocked.includes(t.id)
      )
      .map(
        t=>
          `<option
            value="${t.id}"
            ${LifeOS.state.equipped===t.id?"selected":""}
          >
            ${t.name}
          </option>`
      )
      .join("");

}


/* =========================================================
   GUARDAR CONFIGURACIÓN
   ========================================================= */

function saveSettings(){

  const p=LifeOS.state.profile;


  p.name=
    document.getElementById("nameInput")
      .value.trim();


  p.nickname=
    document.getElementById("nicknameInput")
      .value.trim();


  p.reminder=
    +document.getElementById("reminderInput")
      .value;


  p.morning=
    document.getElementById("morningInput")
      .checked;


  p.night=
    document.getElementById("nightInput")
      .checked;


  p.animations=
    document.getElementById("animationsInput")
      .checked;


  p.effects=
    document.getElementById("effectsInput")
      .checked;


  const theme=
    document.getElementById("themeSelect")
      .value;


  if(
    LifeOS.state.unlocked.includes(theme)
  )
    LifeOS.state.equipped=theme;


  LifeOS.save();

  applyTheme();

  render();

  toast("Configuración guardada");

}


/* =========================================================
   NOTIFICACIONES
   ========================================================= */

async function requestNotifications(){

  if(window.LifeOSNotifications){

    await LifeOSNotifications.requestNotifications();

    return;

  }


  if(!("Notification" in window)){

    toast(
      "Este navegador no admite notificaciones"
    );

    return;

  }


  const p=
    await Notification.requestPermission();


  if(p==="granted"){

    toast(
      "Notificaciones activadas"
    );


    if(window.LifeOSNotifications)
      LifeOSNotifications.startNotifications();

  }


  updateNotificationStatus();

}


function updateNotificationStatus(){

  if(window.LifeOSNotifications){

    LifeOSNotifications
      .updateNotificationStatus();

    return;

  }


  const e=
    document.getElementById(
      "notifyStatus"
    );


  if(!e)return;


  e.textContent=
    "Notification"in window
    ?"Estado: "+Notification.permission
    :"Este navegador no admite notificaciones web.";

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(msg){

  const e=
    document.getElementById("toast");


  e.textContent=msg;

  e.classList.add("show");


  clearTimeout(
    window.__toast
  );


  window.__toast=
    setTimeout(
      ()=>e.classList.remove("show"),
      2200
    );

}
