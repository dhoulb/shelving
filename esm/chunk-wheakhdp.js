import{l}from"./chunk-sqep5xpn.js";import{t}from"./chunk-m2s2d87e.js";function ad(e){console.error(e)}function ta(e){return typeof Error.isError==="function"?Error.isError(e):e instanceof Error}function Se(e){return typeof e==="string"?e:l(e)&&typeof e.message==="string"?e.message:void 0}function Ei(e,s=Ei){let n=Se(e);if(n===void 0)throw new t("Message is required",{received:e,caller:s});return n}function Re(e){let s=Ei(e,Re).split(`
`),n={};for(let o of s){let i=o.indexOf(": ");if(i>=0){let r=o.slice(0,i).trim(),c=o.slice(i+2).trim();if(!c.length)continue;if(Object.hasOwn(n,r))n[r]+=`
${c}`;else n[r]=c}else{let r=o.trim();if(!r.length)continue;if(Object.hasOwn(n,""))n[""]+=`
${r}`;else n[""]=r}}return n}function id(e){let s=[];for(let[n,o]of Object.entries(e))for(let i of o.split(`
`)){let r=i.trim();if(!r.length)continue;s.push(n?`${n}: ${r}`:r)}return s.join(`
`)}function X(e,s){return`${e}: ${s.split(`
`).join(`
${e}: `)}`}
export{ad,ta,Se,Ei,Re,id,X};
