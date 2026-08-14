const KEY = "lifeos_v2";

const SUPABASE_URL = "https://wqfsgzpgshdvyjsnmqds.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_XmTz-eehnbWETW76UqACwA_lkZXE1ri";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const defaultState = {
  profile: {
    name: "",
    nickname: "",
    reminder: 90,
    morning: true,
    night: false,
    theme: "midnight",
    animations: true,
    effects: true
  },

  xp: 0,
  streak: 0,
  lastActive: null,
  classes: [],
  tasks: [],
  focus: [],
  unlocked: ["midnight"],
  equipped: "midnight",
  claims: []
};

let state = load();

function load() {
  try {
    const x = JSON.parse(localStorage.getItem(KEY));

    return x
      ? deepMerge(defaultState, x)
      : structuredClone(defaultState);

  } catch {
    return structuredClone(defaultState);
  }
}

function deepMerge(a, b) {
  return {
    ...structuredClone(a),
    ...b,

    profile: {
      ...a.profile,
      ...(b.profile || {})
    },

    unlocked: Array.isArray(b.unlocked)
      ? b.unlocked
      : a.unlocked,

    classes: Array.isArray(b.classes)
      ? b.classes
      : [],

    tasks: Array.isArray(b.tasks)
      ? b.tasks
      : [],

    focus: Array.isArray(b.focus)
      ? b.focus
      : [],

    claims: Array.isArray(b.claims)
      ? b.claims
      : []
  };
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function uid(p = "id") {
  return (
    p +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function today() {
  const d = new Date();
  const o = d.getTimezoneOffset();

  return new Date(d - o * 60000)
    .toISOString()
    .slice(0, 10);
}

function dayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[c]
  );
}

function reset() {
  state = structuredClone(defaultState);
  save();
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }

  return data.user;
}

async function loadClassesFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    console.warn("No hay usuario autenticado.");
    return;
  }

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("user_id", user.id)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error cargando clases:", error);
    return;
  }

  state.classes = data.map(c => ({
    id: c.id,
    user_id: c.user_id,
    title: c.title,
    day: c.day,
    start: String(c.start_time).slice(0, 5),
    end: String(c.end_time).slice(0, 5),
    room: c.room || "",
    teacher: c.teacher || "",
    reminder: c.reminder_minutes ?? state.profile.reminder
  }));

  save();
}

async function saveClassToSupabase(c) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  const payload = {
    user_id: user.id,
    title: c.title,
    day: c.day,
    start_time: c.start,
    end_time: c.end,
    room: c.room || null,
    teacher: c.teacher || null,
    reminder_minutes: Number(c.reminder ?? state.profile.reminder)
  };

  if (c.id && !String(c.id).startsWith("class_")) {
    const { data, error } = await supabase
      .from("classes")
      .update(payload)
      .eq("id", c.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabase
    .from("classes")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function deleteClassFromSupabase(id) {
  const user = await getCurrentUser();

  if (!user) return;

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error eliminando clase:", error);
  }
}

window.LifeOS = {
  get state() {
    return state;
  },

  save,
  uid,
  today,
  dayIndex,
  escapeHtml,
  reset,

  supabase,
  SUPABASE_URL,

  getCurrentUser,
  loadClassesFromSupabase,
  saveClassToSupabase,
  deleteClassFromSupabase
};
