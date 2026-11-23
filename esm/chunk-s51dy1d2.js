import{l}from"./chunk-9wx70a7r.js";import{r}from"./chunk-90kryzxh.js";function u(n,e){if(l(e)){if(e instanceof n)return e;if("source"in e)return u(n,e.source)}}function Oo(n,e,i=Oo){let o=u(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{u,Oo};
