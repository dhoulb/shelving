import{l}from"./chunk-5xtgg5a1.js";import{r}from"./chunk-90kryzxh.js";function u(n,e){if(l(e)){if(e instanceof n)return e;if("source"in e)return u(n,e.source)}}function _o(n,e,i=_o){let o=u(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{u,_o};
