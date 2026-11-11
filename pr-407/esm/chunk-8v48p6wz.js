function*os(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Cm(e,r,...n){if(!e.length)return e;let t=Array.from(os(e,r,...n));return t.length===e.length?e:t}async function*wm(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{os,Cm,wm};
