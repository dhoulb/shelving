function*rs(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Ru(e,r,...n){if(!e.length)return e;let t=Array.from(rs(e,r,...n));return t.length===e.length?e:t}async function*Cu(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{rs,Ru,Cu};
