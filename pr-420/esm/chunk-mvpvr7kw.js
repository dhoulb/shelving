function*os(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Cu(e,r,...n){if(!e.length)return e;let t=Array.from(os(e,r,...n));return t.length===e.length?e:t}async function*wu(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{os,Cu,wu};
