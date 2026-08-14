const XP_LEVEL=100;
function levelData(){let level=Math.floor(LifeOS.state.xp/XP_LEVEL)+1;return{level,current:LifeOS.state.xp%XP_LEVEL,need:XP_LEVEL}}
function addXP(n,reason="Acción completada"){n=Math.max(0,Math.round(n));if(!n)return;LifeOS.state.xp+=n;LifeOS.save();toast(`+${n} XP · ${reason}`);render()}
function spendXP(n){if(LifeOS.state.xp<n)return false;LifeOS.state.xp-=n;LifeOS.save();return true}
function updateStreak(){const t=LifeOS.today(),last=LifeOS.state.lastActive;if(last===t)return;if(!last)LifeOS.state.streak=1;else{const a=new Date(last+"T12:00:00"),b=new Date(t+"T12:00:00"),d=Math.round((b-a)/86400000);LifeOS.state.streak=d===1?LifeOS.state.streak+1:1}LifeOS.state.lastActive=t;LifeOS.save()}