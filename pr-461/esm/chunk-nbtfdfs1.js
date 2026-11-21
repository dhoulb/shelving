import{u}from"./chunk-cn53db74.js";import{r}from"./chunk-90kryzxh.js";function l(n,e){if(u(e)){if(e instanceof n)return e;if("source"in e)return l(n,e.source)}}function Oo(n,e,i=Oo){let o=l(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{l,Oo};
