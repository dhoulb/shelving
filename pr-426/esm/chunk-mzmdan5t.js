function*is(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Ap(e,r,...n){if(!e.length)return e;let t=Array.from(is(e,r,...n));return t.length===e.length?e:t}async function*kp(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{is,Ap,kp};
