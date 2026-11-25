import{l}from"./chunk-9rqw58qf.js";import{r}from"./chunk-90kryzxh.js";function xc(e){console.error(e)}function sa(e){return typeof Error.isError==="function"?Error.isError(e):e instanceof Error}function Re(e){return typeof e==="string"?e:l(e)&&typeof e.message==="string"?e.message:void 0}function Mi(e,s=Mi){let n=Re(e);if(n===void 0)throw new r("Message is required",{received:e,caller:s});return n}function Ce(e){let s=Mi(e,Ce).split(`
`),n={};for(let o of s){let i=o.indexOf(": ");if(i>=0){let t=o.slice(0,i).trim(),c=o.slice(i+2).trim();if(!c.length)continue;if(Object.hasOwn(n,t))n[t]+=`
${c}`;else n[t]=c}else{let t=o.trim();if(!t.length)continue;if(Object.hasOwn(n,""))n[""]+=`
${t}`;else n[""]=t}}return n}function Tc(e){let s=[];for(let[n,o]of Object.entries(e))for(let i of o.split(`
`)){let t=i.trim();if(!t.length)continue;s.push(n?`${n}: ${t}`:t)}return s.join(`
`)}function J(e,s){return`${e}: ${s.split(`
`).join(`
${e}: `)}`}
export{xc,sa,Re,Mi,Ce,Tc,J};
