/* =========================================================
   LIFEOS APP
   ========================================================= */

let selectedDay = 0;
let taskFilter = "all";
let focusMinutes = 25;
let timerLeft = 1500;
let timerRunning = false;
let timerInterval = null;


/* =========================================================
   TIENDA
   ========================================================= */

const THEMES = [
  {
    id:"midnight",
    name:"Midnight",
    rarity:"GRATIS",
    cost:0,
    emoji:"🌙",
    bg:"linear-gradient(135deg,#211b35,#7357e8)"
  },
  {
    id:"lavender",
    name:"Lavender",
    rarity:"COMÚN",
    cost:500,
    emoji:"🌸",
    bg:"linear-gradient(135deg,#e8dcff,#a78cff)"
  },
  {
    id:"ocean",
    name:"Ocean",
    rarity:"RARO",
    cost:1500,
    emoji:"🌊",
    bg:"linear-gradient(135deg,#d8f2ff,#4da7d9)"
  },
  {
    id:"forest",
    name:"Forest",
    rarity:"RARO",
    cost:2000,
    emoji:"🌿",
    bg:"linear-gradient(135deg,#d9f4e4,#49ae79)"
  },
  {
    id:"sunset",
    name:"Sunset",
    rarity:"ÉPICO",
    cost:3500,
    emoji:"🌅",
    bg:"linear-gradient(135deg,#ffd9cf,#ef7c68)"
  },
  {
    id:"cosmos",
    name:"Cosmos",
    rarity:"ÉPICO",
    cost:5000,
    emoji:"🪐",
    bg:"linear-gradient(135deg,#201637,#5d4bd7)"
  },
  {
    id:"aurora",
    name:"Aurora",
    rarity:"LEGENDARIO",
    cost:8000,
    emoji:"✨",
    bg:"linear-gradient(135deg,#102b31,#64d9b0)"
  },
  {
    id:"glass",
    name:"Glass",
    rarity:"LEGENDARIO",
    cost:10000,
    emoji:"💎",
    bg:"linear-gradient(135deg,#edf5ff,#8db6e8)"
  }
];


const EFFECTS = [
  {
    id:"spark",
    name:"XP Spark",
    rarity:"COMÚN",
    cost:700,
    emoji:"✨",
    desc:"Efecto especial al ganar XP."
  },
  {
    id:"confetti",
    name:"Level Confetti",
    rarity:"ÉPICO",
    cost:2500,
    emoji:"🎉",
    desc:"Confeti al subir de nivel."
  },
  {
    id:"glow",
    name:"Focus Glow",
    rarity:"ÉPICO",
    cost:3500,
    emoji:"💫",
    desc:"Efecto visual al completar enfoque."
  }
];


const AVATARS = [
  {
    id:"moon",
    name:"Moon",
    rarity:"COMÚN",
    cost:400,
    emoji:"🌙"
  },
  {
    id:"fox",
    name:"Fox",
    rarity:"RARO",
    cost:1200,
    emoji:"🦊"
  },
  {
    id:"robot",
    name:"Orbit",
    rarity:"ÉPICO",
    cost:3000,
    emoji:"🤖"
  },
  {
    id:"crown",
    name:"Crown",
    rarity:"LEGENDARIO",
    cost:6000,
    emoji:"👑"
  }
];


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://wqfsgzpgshdvyjsnmqds.supabase.co";

const SUPABASE_ANON_KEY =
  "BIb4lQOoZdclzLLiryHnCCvhNaiSwLtcZSjnGHdADqUsdaNPv0_MkX6nfEjs8Ogo5P_Ya47v3XYDTYeQpb50He0";

let supabaseClient = null;


function initSupabase(){

  try{

    if(
      window.supabase &&
      typeof window.supabase.createClient === "function"
    ){

      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );

      console.log("Supabase conectado.");

    }else{

      console.warn(
        "Supabase JS no está disponible."
      );

    }

  }catch(error){

    console.error(
      "Error iniciando Supabase:",
      error
    );

    supabaseClient = null;
  }
}


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function(){

    console.log("LifeOS iniciando...");

    /*
     * LifeOS ya debería existir porque storage.js
     * se carga antes de app.js.
     */

    if(!window.LifeOS){

      console.error(
        "ERROR: storage.js no cargó correctamente."
      );

      return;
    }


    /*
     * Día inicial.
     */

    try{

      selectedDay = LifeOS.dayIndex();

    }catch(error){

      console.error(
        "Error obteniendo día:",
        error
      );

      selectedDay = 0;
    }


    /*
     * Supabase NO debe bloquear LifeOS.
     */

    initSupabase();


    /*
     * Eventos.
     */

    bind();


    /*
     * Streak.
     */

    try{

      if(typeof updateStreak === "function")
        updateStreak();

    }catch(error){

      console.error(
        "Error actualizando streak:",
        error
      );
    }


    /*
     * Tema.
     */

    try{

      applyTheme();

    }catch(error){

      console.error(
        "Error aplicando tema:",
        error
      );
    }


    /*
     * Render.
     */

    try{

      render();

    }catch(error){

      console.error(
        "Error renderizando LifeOS:",
        error
      );
    }


    /*
     * Notificaciones.
     */

    try{

      if(window.LifeOSNotifications){

        LifeOSNotifications.updateNotificationStatus();

        if(
          "Notification" in window &&
          Notification.permission === "granted"
        ){

          LifeOSNotifications.startNotifications();

        }
      }

    }catch(error){

      console.error(
        "Error con notificaciones:",
        error
      );
    }


    /*
     * Cargar clases desde Supabase.
     */

    try{

      await loadClassesFromSupabase();

    }catch(error){

      console.error(
        "Error cargando clases:",
        error
      );
    }


    console.log("LifeOS iniciado correctamente.");

  }
);


/* =========================================================
   EVENTOS
   ========================================================= */

function bind(){

  console.log("Conectando botones...");


  /*
   * NAVEGACIÓN
   */

  document.querySelectorAll("[data-screen]").forEach(
    button => {

      button.onclick = function(){

        showScreen(
          button.dataset.screen
        );

      };

    }
  );


  /*
   * CONFIGURACIÓN
   */

  const settingsBtn =
    document.getElementById("settingsBtn");

  if(settingsBtn){

    settingsBtn.onclick = function(){

      showScreen("settingsScreen");

    };

  }


  /*
   * NUEVA CLASE
   */

  const newClass =
    document.getElementById("newClass");

  if(newClass){

    newClass.onclick = function(){

      if(typeof classForm !== "function"){

        toast("Error: classForm no está disponible.");

        console.error(
          "classForm() no existe."
        );

        return;
      }

      openModal(
        "Nueva clase",
        classForm()
      );

    };

  }


  /*
   * NUEVA TAREA
   */

  const newTask =
    document.getElementById("newTask");

  const newTask2 =
    document.getElementById("newTask2");


  const createTask = function(){

    if(typeof taskForm !== "function"){

      toast("Error: taskForm no está disponible.");

      console.error(
        "taskForm() no existe."
      );

      return;
    }

    openModal(
      "Nuevo objetivo",
      taskForm()
    );

  };


  if(newTask)
    newTask.onclick = createTask;

  if(newTask2)
    newTask2.onclick = createTask;


  /*
   * PDF
   */

  const pdfBtn =
    document.getElementById("pdfBtn");

  if(pdfBtn){

    pdfBtn.onclick = function(){

      if(typeof exportPDF === "function"){

        exportPDF();

      }else{

        toast("La función PDF no está disponible.");

        console.error(
          "exportPDF() no existe."
        );

      }

    };

  }


  /*
   * MODAL
   */

  const closeModalBtn =
    document.getElementById("closeModal");

  if(closeModalBtn){

    closeModalBtn.onclick =
      closeModal;

  }


  /*
   * NOTIFICACIONES
   */

  const notifyBtn =
    document.getElementById("notifyBtn");

  if(notifyBtn){

    notifyBtn.onclick =
      requestNotifications;

  }


  /*
   * GUARDAR CONFIGURACIÓN
   */

  const saveSettingsBtn =
    document.getElementById("saveSettings");

  if(saveSettingsBtn){

    saveSettingsBtn.onclick =
      saveSettings;

  }


  /*
   * RESET
   */

  const resetBtn =
    document.getElementById("resetBtn");

  if(resetBtn){

    resetBtn.onclick = function(){

      if(
        confirm(
          "¿Borrar todos los datos de LifeOS?"
        )
      ){

        LifeOS.reset();

        render();

        toast(
          "LifeOS restablecido"
        );

      }

    };

  }


  /*
   * FILTROS
   */

  document.querySelectorAll(
    "[data-filter]"
  ).forEach(
    button => {

      button.onclick = function(){

        taskFilter =
          button.dataset.filter;


        document.querySelectorAll(
          "[data-filter]"
        ).forEach(
          x =>
            x.classList.toggle(
              "active",
              x === button
            )
        );


        renderTasks();

      };

    }
  );


  /*
   * DURACIÓN DEL FOCUS
   */

  document.querySelectorAll(
    ".duration"
  ).forEach(
    button => {

      button.onclick = function(){

        if(timerRunning)
          return;


        focusMinutes =
          Number(button.dataset.min);


        timerLeft =
          focusMinutes * 60;


        document.querySelectorAll(
          ".duration"
        ).forEach(
          x =>
            x.classList.toggle(
              "active",
              x === button
            )
        );


        updateTimer();

      };

    }
  );


  /*
   * BOTÓN FOCUS
   */

  const focusStart =
    document.getElementById(
      "focusStart"
    );

  if(focusStart){

    focusStart.onclick =
      toggleFocus;

  }


  /*
   * TABS STORE
   */

  document.querySelectorAll(
    ".store-tab"
  ).forEach(
    button => {

      button.onclick = function(){

        document.querySelectorAll(
          ".store-tab"
        ).forEach(
          x =>
            x.classList.toggle(
              "active",
              x === button
            )
        );


        renderStore(
          button.dataset.store
        );

      };

    }
  );


  console.log("Botones conectados.");

}


/* =========================================================
   PANTALLAS
   ========================================================= */

function showScreen(id){

  document.querySelectorAll(
    ".screen"
  ).forEach(
    screen =>
      screen.classList.toggle(
        "active",
        screen.id === id
      )
  );


  document.querySelectorAll(
    ".nav-item"
  ).forEach(
    item =>
      item.classList.toggle(
        "active",
        item.dataset.screen === id
      )
  );


  window.scrollTo(
    0,
    0
  );

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


/* =========================================================
   HEADER
   ========================================================= */

function renderHeader(){

  const h =
    new Date().getHours();


  const name =
    LifeOS.state.profile.nickname ||
    LifeOS.state.profile.name ||
    "ahí";


  const hello =
    document.getElementById(
      "hello"
    );


  if(hello){

    hello.textContent =
      `${
        h < 12
        ? "Buenos días"
        : h < 19
        ? "Buenas tardes"
        : "Buenas noches"
      }, ${name} 👋`;

  }


  const todayLabel =
    document.getElementById(
      "todayLabel"
    );


  if(todayLabel){

    todayLabel.textContent =
      new Date().toLocaleDateString(
        "es-CL",
        {
          weekday:"long",
          day:"numeric",
          month:"long"
        }
      );

  }

}


/* =========================================================
   XP
   ========================================================= */

function renderXP(){

  const x =
    typeof levelData === "function"
    ? levelData()
    : {
        level:1,
        current:0,
        need:100
      };


  const level =
    document.getElementById("level");

  const xpText =
    document.getElementById("xpText");

  const xpBar =
    document.getElementById("xpBar");

  const streak =
    document.getElementById("streak");

  const storeXP =
    document.getElementById("storeXP");


  if(level)
    level.textContent =
      x.level;


  if(xpText)
    xpText.textContent =
      `${x.current} / ${x.need} XP`;


  if(xpBar)
    xpBar.style.width =
      Math.max(
        0,
        Math.min(
          100,
          x.current
        )
      ) + "%";


  if(streak)
    streak.textContent =
      "🔥 " +
      (LifeOS.state.streak || 0);


  if(storeXP)
    storeXP.textContent =
      (LifeOS.state.xp || 0) +
      " XP";

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome(){

  const nextClass =
    document.getElementById(
      "nextClass"
    );


  if(nextClass){

    let cs = [];

    try{

      cs =
        typeof classesDay === "function"
        ? classesDay(
            LifeOS.dayIndex()
          )
        : [];

    }catch(error){

      console.error(
        "Error clases:",
        error
      );

    }


    const now =
      new Date();


    const cur =
      now.getHours() * 60 +
      now.getMinutes();


    const upcoming =
      cs.find(
        c => {

          const parts =
            String(c.start)
              .split(":")
              .map(Number);


          return (
            parts[0] * 60 +
            parts[1]
          ) >= cur;

        }
      ) || cs[0];


    nextClass.innerHTML =
      upcoming
      ?
      `
      <div class="card next-card">

        <div class="next-time">
          ${upcoming.start}<br>
          ${upcoming.end}
        </div>

        <div class="next-main">

          <b>
            ${LifeOS.escapeHtml(
              upcoming.title
            )}
          </b>

          <small>

            ${
              upcoming.room
              ? "Sala " +
                LifeOS.escapeHtml(
                  upcoming.room
                )
              : "Sin sala"
            }

            ${
              upcoming.teacher
              ? " · " +
                LifeOS.escapeHtml(
                  upcoming.teacher
                )
              : ""
            }

          </small>

        </div>

        <span class="badge">
          🔔 ${
            typeof reminderText === "function"
            ? reminderText(
                Number(
                  upcoming.reminder
                )
              )
            : ""
          }
        </span>

      </div>
      `
      :
      `
      <div class="empty">
        No tienes clases programadas para hoy.
      </div>
      `;

  }


  const homeTasks =
    document.getElementById(
      "homeTasks"
    );


  if(homeTasks){

    const tasks =
      LifeOS.state.tasks
        .filter(
          t =>
            t.date ===
            LifeOS.today()
        )
        .slice(0,4);


    homeTasks.innerHTML =
      tasks.length
      ?
      tasks.map(taskHTML).join("")
      :
      `
      <div class="empty">
        Tu día está libre.
        Añade una misión y empieza a ganar XP.
      </div>
      `;

  }


  bindDynamic();

}


/* =========================================================
   HORARIO
   ========================================================= */

function renderSchedule(){

  const days =
    document.getElementById(
      "days"
    );


  const scheduleList =
    document.getElementById(
      "scheduleList"
    );


  if(!days || !scheduleList)
    return;


  const dayNames =
    typeof DAYS !== "undefined"
    ? DAYS
    : [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo"
      ];


  days.innerHTML =
    dayNames.map(
      (d,i) =>
        `
        <button
          class="${
            i === selectedDay
            ? "active"
            : ""
          }"
          data-day="${i}"
        >
          ${d.slice(0,3)}
        </button>
        `
    ).join("");


  days.querySelectorAll(
    "[data-day]"
  ).forEach(
    button => {

      button.onclick =
        function(){

          selectedDay =
            Number(
              button.dataset.day
            );

          renderSchedule();

        };

    }
  );


  let classes = [];


  try{

    if(typeof classesDay === "function")
      classes =
        classesDay(
          selectedDay
        );

  }catch(error){

    console.error(
      "Error renderizando horario:",
      error
    );

  }


  scheduleList.innerHTML =
    classes.length
    ?
    classes.map(
      c =>
        `
        <div
          class="card schedule-card"
          data-edit="${c.id}"
        >

          <div class="time">
            ${c.start}<br>
            ${c.end}
          </div>

          <div>

            <div class="class-name">
              ${LifeOS.escapeHtml(
                c.title
              )}
            </div>

            <div class="meta">

              ${
                c.room
                ? "Sala " +
                  LifeOS.escapeHtml(
                    c.room
                  )
                : ""
              }

              ${
                c.teacher
                ? " · " +
                  LifeOS.escapeHtml(
                    c.teacher
                  )
                : ""
              }

              ${
                typeof reminderText === "function"
                ? " · 🔔 " +
                  reminderText(
                    Number(c.reminder)
                  )
                : ""
              }

            </div>

          </div>

          <span class="dot"></span>

        </div>
        `
    ).join("")
    :
    `
    <div class="empty">
      No hay clases este día.
    </div>
    `;


  scheduleList.querySelectorAll(
    "[data-edit]"
  ).forEach(
    element => {

      element.onclick =
        function(){

          const c =
            LifeOS.state.classes.find(
              x =>
                x.id ===
                element.dataset.edit
            );


          if(!c)
            return;


          if(typeof classForm !== "function"){

            toast(
              "No se encontró el formulario de clases."
            );

            return;
          }


          openModal(
            "Editar clase",
            classForm(c),
            c
          );

        };

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
        class="check ${
          t.done ? "done" : ""
        }"
        data-task="${t.id}"
      >
        ${
          t.done
          ? "✓"
          : ""
        }
      </button>

      <div class="task-main ${
        t.done ? "done" : ""
      }">

        <b>
          ${LifeOS.escapeHtml(
            t.title
          )}
        </b>

        <small>
          ${t.date} ·
          ${
            t.done
            ? "Completado"
            : "Pendiente"
          }
        </small>

      </div>

      <span class="xp-pill">
        +${t.xp} XP
      </span>

    </div>
  `;

}


function renderTasks(){

  const list =
    document.getElementById(
      "tasksList"
    );


  if(!list)
    return;


  let tasks =
    [...LifeOS.state.tasks];


  if(taskFilter === "pending")
    tasks =
      tasks.filter(
        t => !t.done
      );


  if(taskFilter === "done")
    tasks =
      tasks.filter(
        t => t.done
      );


  list.innerHTML =
    tasks.length
    ?
    tasks.map(
      taskHTML
    ).join("")
    :
    `
    <div class="empty">
      No hay objetivos en esta vista.
    </div>
    `;


  bindDynamic();

}


function bindDynamic(){

  document.querySelectorAll(
    "[data-task]"
  ).forEach(
    button => {

      button.onclick =
        function(){

          toggleTask(
            button.dataset.task
          );

        };

    }
  );

}


/* =========================================================
   MODALES
   ========================================================= */

function openModal(
  title,
  html,
  existing = null
){

  const modal =
    document.getElementById(
      "modal"
    );

  const modalTitle =
    document.getElementById(
      "modalTitle"
    );

  const form =
    document.getElementById(
      "modalForm"
    );


  if(!modal || !form)
    return;


  if(modalTitle)
    modalTitle.textContent =
      title;


  form.innerHTML =
    html;


  modal.classList.remove(
    "hidden"
  );


  form.onsubmit =
    async function(event){

      event.preventDefault();


      const data =
        new FormData(form);


      /*
       * CLASE
       */

      if(
        html.includes(
          'name="day"'
        )
      ){

        const classData = {

          title:
            data.get("title"),

          day:
            Number(
              data.get("day")
            ),

          room:
            data.get("room") || "",

          start:
            data.get("start"),

          end:
            data.get("end"),

          teacher:
            data.get("teacher") || "",

          reminder:
            Number(
              data.get("reminder")
            )

        };


        if(existing){

          Object.assign(
            existing,
            classData
          );

        }else{

          LifeOS.state.classes.push({

            id:
              LifeOS.uid(
                "class"
              ),

            ...classData

          });

        }


        LifeOS.save();


        /*
         * Supabase es secundario.
         * Si falla, LifeOS local sigue funcionando.
         */

        try{

          await syncClassesToSupabase();

        }catch(error){

          console.error(
            error
          );

        }

      }


      /*
       * TAREA
       */

      else{

        const taskData = {

          title:
            data.get("title"),

          xp:
            Number(
              data.get("xp")
            ),

          date:
            data.get("date"),

          done:false

        };


        if(existing){

          Object.assign(
            existing,
            taskData
          );

        }else{

          LifeOS.state.tasks.push({

            id:
              LifeOS.uid(
                "task"
              ),

            ...taskData

          });

        }


        LifeOS.save();

      }


      closeModal();

      render();

      toast(
        "Guardado correctamente"
      );

    };


  const close =
    form.querySelector(
      "[data-close]"
    );


  if(close)
    close.onclick =
      closeModal;


  /*
   * BORRAR CLASE
   */

  const deleteClass =
    document.getElementById(
      "deleteClass"
    );


  if(
    existing &&
    deleteClass
  ){

    deleteClass.onclick =
      async function(){

        LifeOS.state.classes =
          LifeOS.state.classes.filter(
            x =>
              x.id !==
              existing.id
          );


        LifeOS.save();


        try{

          await syncClassesToSupabase();

        }catch(error){

          console.error(
            error
          );

        }


        closeModal();

        render();

        toast(
          "Clase eliminada"
        );

      };

  }

}


function closeModal(){

  const modal =
    document.getElementById(
      "modal"
    );


  if(modal)
    modal.classList.add(
      "hidden"
    );

}


/* =========================================================
   SUPABASE — CARGAR CLASES
   ========================================================= */

async function loadClassesFromSupabase(){

  if(!supabaseClient)
    return;


  try{

    const result =
      await supabaseClient.auth.getUser();


    const user =
      result.data?.user;


    if(!user){

      console.log(
        "No hay sesión Supabase activa. LifeOS funcionará localmente."
      );

      return;

    }


    const response =
      await supabaseClient
        .from("classes")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "start_time"
        );


    if(response.error)
      throw response.error;


    if(!Array.isArray(response.data))
      return;


    LifeOS.state.classes =
      response.data.map(
        c => ({

          id:c.id,

          title:c.title,

          day:Number(c.day),

          start:c.start_time,

          end:c.end_time,

          room:c.room || "",

          teacher:c.teacher || "",

          reminder:
            Number.isFinite(
              Number(
                c.reminder_minutes
              )
            )
            ?
            Number(
              c.reminder_minutes
            )
            :
            Number(
              LifeOS.state.profile.reminder
            )

        })
      );


    LifeOS.save();

    render();


    console.log(
      "Clases cargadas desde Supabase."
    );


  }catch(error){

    console.error(
      "Supabase: no se pudieron cargar las clases.",
      error
    );

  }

}


/* =========================================================
   SUPABASE — SINCRONIZAR
   ========================================================= */

async function syncClassesToSupabase(){

  if(!supabaseClient)
    return;


  try{

    const result =
      await supabaseClient.auth.getUser();


    const user =
      result.data?.user;


    if(!user){

      console.log(
        "Sin sesión Supabase. Guardando solamente local."
      );

      return;

    }


    /*
     * Borramos las clases actuales del usuario.
     */

    const deleted =
      await supabaseClient
        .from("classes")
        .delete()
        .eq(
          "user_id",
          user.id
        );


    if(deleted.error)
      throw deleted.error;


    /*
     * Si no quedan clases,
     * terminamos aquí.
     */

    if(
      !LifeOS.state.classes ||
      !LifeOS.state.classes.length
    )
      return;


    const rows =
      LifeOS.state.classes.map(
        c => ({

          user_id:user.id,

          title:c.title,

          day:Number(c.day),

          start_time:c.start,

          end_time:c.end,

          room:
            c.room || null,

          teacher:
            c.teacher || null,

          reminder_minutes:
            Number.isFinite(
              Number(
                c.reminder
              )
            )
            ?
            Number(
              c.reminder
            )
            :
            90

        })
      );


    const inserted =
      await supabaseClient
        .from("classes")
        .insert(
          rows
        );


    if(inserted.error)
      throw inserted.error;


    console.log(
      "Clases sincronizadas."
    );


  }catch(error){

    console.error(
      "Error sincronizando Supabase:",
      error
    );

  }

}


/* =========================================================
   TAREAS
   ========================================================= */

function toggleTask(id){

  const task =
    LifeOS.state.tasks.find(
      x =>
        x.id === id
    );


  if(!task)
    return;


  if(!task.done){

    task.done = true;

    LifeOS.save();


    if(typeof addXP === "function"){

      addXP(
        task.xp,
        task.title
      );

    }else{

      LifeOS.state.xp +=
        Number(task.xp) || 0;

      LifeOS.save();

      render();

    }

  }else{

    task.done = false;


    LifeOS.state.xp =
      Math.max(
        0,
        LifeOS.state.xp -
        Number(task.xp || 0)
      );


    LifeOS.save();

    toast(
      `-${task.xp} XP`
    );

    render();

  }

}


/* =========================================================
   FOCUS
   ========================================================= */

function toggleFocus(){

  if(timerRunning){

    clearInterval(
      timerInterval
    );


    timerRunning =
      false;


    const button =
      document.getElementById(
        "focusStart"
      );


    const state =
      document.getElementById(
        "timerState"
      );


    if(button)
      button.textContent =
        "Continuar enfoque";


    if(state)
      state.textContent =
        "Pausado";


    return;

  }


  timerRunning =
    true;


  const button =
    document.getElementById(
      "focusStart"
    );


  const state =
    document.getElementById(
      "timerState"
    );


  if(button)
    button.textContent =
      "Pausar";


  if(state)
    state.textContent =
      "Enfoque activo";


  timerInterval =
    setInterval(
      function(){

        timerLeft--;

        updateTimer();


        if(timerLeft <= 0){

          finishFocus();

        }

      },
      1000
    );

}


function updateTimer(){

  const timer =
    document.getElementById(
      "timer"
    );


  if(timer){

    const minutes =
      Math.floor(
        timerLeft / 60
      );


    const seconds =
      timerLeft % 60;


    timer.textContent =
      `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

  }


  const ring =
    document.querySelector(
      ".timer-ring"
    );


  if(ring){

    const total =
      focusMinutes * 60;


    const deg =
      (
        1 -
        timerLeft / total
      ) * 360;


    ring.style.background =
      `conic-gradient(var(--accent) ${deg}deg,#eeeaf6 ${deg}deg)`;

  }

}


function finishFocus(){

  clearInterval(
    timerInterval
  );


  timerRunning =
    false;


  const titleInput =
    document.getElementById(
      "focusTitle"
    );


  const title =
    titleInput?.value.trim() ||
    "Sesión de enfoque";


  const xp =
    Math.round(
      focusMinutes * 1.33
    );


  LifeOS.state.focus.push({

    id:
      LifeOS.uid(
        "focus"
      ),

    date:
      LifeOS.today(),

    minutes:
      focusMinutes,

    title,

    xp

  });


  LifeOS.save();


  if(typeof addXP === "function"){

    addXP(
      xp,
      title
    );

  }else{

    LifeOS.state.xp += xp;

    LifeOS.save();

  }


  const button =
    document.getElementById(
      "focusStart"
    );


  const state =
    document.getElementById(
      "timerState"
    );


  if(button)
    button.textContent =
      "Comenzar enfoque";


  if(state)
    state.textContent =
      "¡Sesión completada!";


  timerLeft =
    focusMinutes * 60;


  updateTimer();

  renderFocusStats();

}


/* =========================================================
   ESTADÍSTICAS FOCUS
   ========================================================= */

function renderFocusStats(){

  const today =
    LifeOS.today();


  const focus =
    LifeOS.state.focus || [];


  const todayMinutes =
    focus
      .filter(
        x =>
          x.date === today
      )
      .reduce(
        (sum,x) =>
          sum +
          Number(
            x.minutes || 0
          ),
        0
      );


  const totalMinutes =
    focus.reduce(
      (sum,x) =>
        sum +
        Number(
          x.minutes || 0
        ),
      0
    );


  const totalXP =
    focus.reduce(
      (sum,x) =>
        sum +
        Number(
          x.xp || 0
        ),
      0
    );


  const todayElement =
    document.getElementById(
      "focusToday"
    );


  const weekElement =
    document.getElementById(
      "focusWeek"
    );


  const xpElement =
    document.getElementById(
      "focusXP"
    );


  if(todayElement)
    todayElement.textContent =
      todayMinutes + "m";


  if(weekElement)
    weekElement.textContent =
      totalMinutes + "m";


  if(xpElement)
    xpElement.textContent =
      totalXP;

}


/* =========================================================
   TIENDA
   ========================================================= */

function renderStore(
  type = "themes"
){

  const container =
    document.getElementById(
      "storeItems"
    );


  if(!container)
    return;


  const items =
    type === "themes"
    ? THEMES
    : type === "effects"
    ? EFFECTS
    : AVATARS;


  const unlocked =
    LifeOS.state.unlocked || [];


  container.innerHTML =
    items.map(
      item => {

        const isUnlocked =
          unlocked.includes(
            item.id
          );


        const equipped =
          LifeOS.state.equipped ===
          item.id;


        return `

          <div class="skin">

            <div
              class="skin-preview"
              style="
                background:${
                  item.bg ||
                  "linear-gradient(135deg,#f3efff,#ddd5ff)"
                }
              "
            >
              ${item.emoji}
            </div>

            <div class="skin-body">

              <span class="rarity">
                ${item.rarity}
              </span>

              <h3>
                ${item.name}
              </h3>

              <p>
                ${
                  item.desc ||
                  "Personaliza tu experiencia en LifeOS."
                }
              </p>

              <button
                class="${
                  equipped
                  ? "soft"
                  : "primary"
                }"
                data-skin="${item.id}"
                data-cost="${item.cost}"
                data-type="${type}"
              >

                ${
                  equipped
                  ? "✓ Equipado"
                  : isUnlocked
                  ? "Equipar"
                  : item.cost + " XP"
                }

              </button>

            </div>

          </div>

        `;

      }
    ).join("");


  container
    .querySelectorAll(
      "[data-skin]"
    )
    .forEach(
      button => {

        button.onclick =
          function(){

            buySkin(
              button.dataset.skin,
              Number(
                button.dataset.cost
              ),
              button.dataset.type
            );

          };

      }
    );

}


function buySkin(
  id,
  cost,
  type
){

  if(
    !LifeOS.state.unlocked.includes(
      id
    )
  ){

    if(
      typeof spendXP === "function"
    ){

      if(!spendXP(cost)){

        toast(
          `Te faltan ${
            cost -
            LifeOS.state.xp
          } XP`
        );

        return;

      }

    }else{

      if(
        LifeOS.state.xp <
        cost
      ){

        toast(
          `Te faltan ${
            cost -
            LifeOS.state.xp
          } XP`
        );

        return;

      }


      LifeOS.state.xp -= cost;

    }


    LifeOS.state.unlocked.push(
      id
    );


    toast(
      "✨ Desbloqueado"
    );

  }


  if(type === "themes"){

    LifeOS.state.equipped =
      id;


    LifeOS.state.profile.theme =
      id;


    applyTheme();

  }


  LifeOS.save();


  renderStore(
    type
  );


  renderXP();

}


/* =========================================================
   TEMAS
   ========================================================= */

function applyTheme(){

  const equipped =
    LifeOS.state.equipped ||
    "midnight";


  document.body.dataset.theme =
    equipped;


  const theme =
    THEMES.find(
      x =>
        x.id ===
        equipped
    ) ||
    THEMES[0];


  const map = {

    midnight:[
      "#7357e8",
      "#a78cff",
      "#f6f5fb"
    ],

    lavender:[
      "#9272e8",
      "#c1aaff",
      "#f8f5ff"
    ],

    ocean:[
      "#2b8dbb",
      "#68c7ec",
      "#f2fbff"
    ],

    forest:[
      "#258d5a",
      "#62c993",
      "#f2fbf6"
    ],

    sunset:[
      "#e76c5c",
      "#ffad82",
      "#fff7f3"
    ],

    cosmos:[
      "#6756df",
      "#a08fff",
      "#f5f3ff"
    ],

    aurora:[
      "#2b9c80",
      "#76e0b9",
      "#f1fcf8"
    ],

    glass:[
      "#6094ca",
      "#a8d1ef",
      "#f3f8fd"
    ]

  };


  const values =
    map[
      theme.id
    ] ||
    map.midnight;


  document.documentElement
    .style
    .setProperty(
      "--accent",
      values[0]
    );


  document.documentElement
    .style
    .setProperty(
      "--accent2",
      values[1]
    );


  document.documentElement
    .style
    .setProperty(
      "--soft",
      values[2]
    );

}


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function renderSettings(){

  const profile =
    LifeOS.state.profile;


  const nameInput =
    document.getElementById(
      "nameInput"
    );


  const nicknameInput =
    document.getElementById(
      "nicknameInput"
    );


  const reminderInput =
    document.getElementById(
      "reminderInput"
    );


  const morningInput =
    document.getElementById(
      "morningInput"
    );


  const nightInput =
    document.getElementById(
      "nightInput"
    );


  const animationsInput =
    document.getElementById(
      "animationsInput"
    );


  const effectsInput =
    document.getElementById(
      "effectsInput"
    );


  if(nameInput)
    nameInput.value =
      profile.name || "";


  if(nicknameInput)
    nicknameInput.value =
      profile.nickname || "";


  if(reminderInput)
    reminderInput.value =
      profile.reminder || 60;


  if(morningInput)
    morningInput.checked =
      !!profile.morning;


  if(nightInput)
    nightInput.checked =
      !!profile.night;


  if(animationsInput)
    animationsInput.checked =
      profile.animations !== false;


  if(effectsInput)
    effectsInput.checked =
      profile.effects !== false;


  const themeSelect =
    document.getElementById(
      "themeSelect"
    );


  if(themeSelect){

    const unlocked =
      LifeOS.state.unlocked || [];


    themeSelect.innerHTML =
      THEMES
        .filter(
          theme =>
            unlocked.includes(
              theme.id
            )
        )
        .map(
          theme =>
            `
            <option
              value="${theme.id}"
              ${
                LifeOS.state.equipped ===
                theme.id
                ? "selected"
                : ""
              }
            >
              ${theme.name}
            </option>
            `
        )
        .join("");

  }

}


/* =========================================================
   GUARDAR CONFIGURACIÓN
   ========================================================= */

function saveSettings(){

  const profile =
    LifeOS.state.profile;


  const nameInput =
    document.getElementById(
      "nameInput"
    );


  const nicknameInput =
    document.getElementById(
      "nicknameInput"
    );


  const reminderInput =
    document.getElementById(
      "reminderInput"
    );


  const morningInput =
    document.getElementById(
      "morningInput"
    );


  const nightInput =
    document.getElementById(
      "nightInput"
    );


  const animationsInput =
    document.getElementById(
      "animationsInput"
    );


  const effectsInput =
    document.getElementById(
      "effectsInput"
    );


  if(nameInput)
    profile.name =
      nameInput.value.trim();


  if(nicknameInput)
    profile.nickname =
      nicknameInput.value.trim();


  if(reminderInput)
    profile.reminder =
      Number(
        reminderInput.value
      );


  if(morningInput)
    profile.morning =
      morningInput.checked;


  if(nightInput)
    profile.night =
      nightInput.checked;


  if(animationsInput)
    profile.animations =
      animationsInput.checked;


  if(effectsInput)
    profile.effects =
      effectsInput.checked;


  const themeSelect =
    document.getElementById(
      "themeSelect"
    );


  if(themeSelect){

    const theme =
      themeSelect.value;


    if(
      LifeOS.state.unlocked.includes(
        theme
      )
    ){

      LifeOS.state.equipped =
        theme;

    }

  }


  LifeOS.save();

  applyTheme();

  render();

  toast(
    "Configuración guardada"
  );

}


/* =========================================================
   NOTIFICACIONES
   ========================================================= */

async function requestNotifications(){

  try{

    if(
      window.LifeOSNotifications
    ){

      await LifeOSNotifications
        .requestNotifications();

      return;

    }


    if(
      !("Notification" in window)
    ){

      toast(
        "Este navegador no admite notificaciones."
      );

      return;

    }


    const permission =
      await Notification
        .requestPermission();


    if(
      permission ===
      "granted"
    ){

      toast(
        "Notificaciones activadas."
      );


      if(
        window.LifeOSNotifications
      ){

        LifeOSNotifications
          .startNotifications();

      }

    }


    updateNotificationStatus();

  }catch(error){

    console.error(
      error
    );

    toast(
      "No se pudieron activar las notificaciones."
    );

  }

}


function updateNotificationStatus(){

  const element =
    document.getElementById(
      "notifyStatus"
    );


  if(!element)
    return;


  if(
    window.LifeOSNotifications
  ){

    LifeOSNotifications
      .updateNotificationStatus();

    return;

  }


  element.textContent =
    "Notification" in window
    ?
    "Estado: " +
    Notification.permission
    :
    "Este navegador no admite notificaciones web.";

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(
  message
){

  const element =
    document.getElementById(
      "toast"
    );


  if(!element){

    console.log(
      message
    );

    return;

  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  clearTimeout(
    window.__toast
  );


  window.__toast =
    setTimeout(
      function(){

        element.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================================
   EXPORTACIÓN
   ========================================================= */

console.log(
  "LifeOS app.js cargado correctamente."
);
