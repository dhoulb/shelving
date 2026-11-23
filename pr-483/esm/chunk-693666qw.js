function Ke(t,n=1){if(t===null)return"null";if(t===void 0)return"undefined";if(typeof t==="boolean")return t?"true":"false";if(typeof t==="string")return Pl(t);if(typeof t==="number")return t.toString();if(typeof t==="symbol")return t.toString();if(typeof t==="function")return`function ${t.name||""}()`;if(typeof t==="object"){if(t instanceof Date)return t.toISOString();if(t instanceof Error)return t.toString();if(t instanceof Request)return fe(t);if(t instanceof Response)return gi(t);if(t instanceof Headers)return yi(t);if(t instanceof Array)return Sl(t,n);if(t instanceof Map)return Cl(t,n);if(t instanceof Set)return Rl(t,n);return El(t,n)}return typeof t}function Pl(t){return`"${t.replace(a,y)}"`}var a=/[\x00-\x08\x0B-\x1F\x7F-\x9F"\\]/g,g={'"':"\\\"","\\":"\\\\","\r":"\\r","\n":"\\n","\t":"\\t","\b":"\\b","\f":"\\f","\v":"\\v"},y=(t)=>g[t]||`\\x${t.charCodeAt(0).toString(16).padStart(2,"00")}`;function yi(t){return Array.from(t,([n,e])=>`${n}: ${e}`).join(`
`)}async function ur(t){return u(fe(t),t)}async function pr(t){return u(gi(t),t)}async function u(t,n){let e=yi(n.headers),r=await d(n);return`${t}${e&&`
${e}`}${r&&`

${r}`}`}var f=65536;async function d(t){if(t.bodyUsed)return"[body used]";let n=t.clone().body;if(!n)return"";let e=n.getReader(),r=new TextDecoder,o=0,s="";try{while(!0){let{done:i,value:c}=await e.read();if(i)return s+r.decode();if(o+=c.byteLength,o>f){let p=c.byteLength-(o-f);return s+=r.decode(c.subarray(0,p),{stream:!0}),await e.cancel(),`${s}${r.decode()}
[truncated at ${f} bytes]`}s+=r.decode(c,{stream:!0})}}catch(i){return`${s}
[read failed: ${i?.message??i}]`}}function fe(t){return`${t.method} ${t.url}`}function gi(t){return`${t.status} ${t.statusText}`}function Sl(t,n=1){let e=Object.getPrototypeOf(t),r=e===Array.prototype?"":e.constructor.name||"",o=n>0&&t.length?t.map((s)=>Ke(s,n-1)).join(`,
	`):"";return`${r?`${r} `:""}${t.length?`[
	${o}
]`:"[]"}`}function Rl(t,n=1){let e=Object.getPrototypeOf(t),r=e===Set.prototype?"":e.constructor.name||"Set",o=n>0&&t.size?Array.from(t).map((s)=>Ke(s,n-1)).join(`,
	`):"";return`${r}(value.size) ${o?`{
	${o}
}`:"{}"}`}function Cl(t,n=1){let e=Object.getPrototypeOf(t),r=e===Map.prototype?"":e.constructor.name||"Map",o=n>0&&t.size?Array.from(t).map(([s,i])=>`${Ke(s)}: ${Ke(i,n-1)}`).join(`,
	`):"";return`${r}(value.size) ${o?`{
	${o}
}`:"{}"}`}function El(t,n=1){let e=Object.getPrototypeOf(t),r=e===Object.prototype?"":e.constructor.name||"",o=n>0?Object.entries(t).map(([s,i])=>`${Ke(s)}: ${Ke(i,n-1)}`).join(`,
	`):"";return`${r?`${r} `:""}${o?`{
	${o}
}`:"{}"}`}function ed(t){let n=t.split(`
`);return n.length>1?`
${n.join(`
	`)}`:` ${t}`}
export{Ke,Pl,yi,ur,pr,fe,gi,Sl,Rl,Cl,El,ed};
