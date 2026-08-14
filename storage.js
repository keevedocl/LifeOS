const KEY="lifeos_v2";
const defaultState={
 profile:{name:"",nickname:"",reminder:90,morning:true,night:false,theme:"midnight",animations:true,effects:true},
 xp:0,streak:0,lastActive:null,classes:[],tasks:[],focus:[],unlocked:["midnight"],equipped:"midnight",claims:[]
};
let state=load();
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?deepMerge(defaultState,x):structuredClone(defaultState)}catch{return structuredClone(defaultState)}}
function deepMerge(a,b){return {...structuredClone(a),...b,profile:{...a.profile,...(b.profile||{})},unlocked:Array.isArray(b.unlocked)?b.unlocked:a.unlocked,classes:Array.isArray(b.classes)?b.classes:[],tasks:Array.isArray(b.tasks)?b.tasks:[],focus:Array.isArray(b.focus)?b.focus:[],claims:Array.isArray(b.claims)?b.claims:[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function uid(p="id"){return p+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)}
function today(){const d=new Date(),o=d.getTimezoneOffset();return new Date(d-o*60000).toISOString().slice(0,10)}
function dayIndex(){return (new Date().getDay()+6)%7}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function reset(){state=structuredClone(defaultState);save()}
window.LifeOS={get state(){return state},save,uid,today,dayIndex,escapeHtml,reset};