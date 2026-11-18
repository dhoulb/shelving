function*us(e,r,...n){for(let t of e)if(r(t,...n))yield t}function Dp(e,r,...n){if(!e.length)return e;let t=Array.from(us(e,r,...n));return t.length===e.length?e:t}async function*Np(e,r,...n){for await(let t of e)if(r(t,...n))yield t}
export{us,Dp,Np};
