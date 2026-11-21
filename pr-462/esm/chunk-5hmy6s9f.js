function*ps(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Lp(e,r,...n){if(!e.length)return e;let t=Array.from(ps(e,r,...n));return t.length===e.length?e:t}async function*Np(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{ps,Lp,Np};
