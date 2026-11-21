import{l}from"./chunk-d5qxcdq0.js";import{r}from"./chunk-90kryzxh.js";function u(n,e){if(l(e)){if(e instanceof n)return e;if("source"in e)return u(n,e.source)}}function Lo(n,e,i=Lo){let o=u(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{u,Lo};
