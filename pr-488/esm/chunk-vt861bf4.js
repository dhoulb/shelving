function*cs(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Vp(e,r,...n){if(!e.length)return e;let t=Array.from(cs(e,r,...n));return t.length===e.length?e:t}async function*Kp(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{cs,Vp,Kp};
