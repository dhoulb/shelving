import{l}from"./chunk-2hjzw4y0.js";import{r}from"./chunk-bptwmk6j.js";function u(n,e){if(l(e)){if(e instanceof n)return e;if("source"in e)return u(n,e.source)}}function Mo(n,e,i=Mo){let o=u(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{u,Mo};
