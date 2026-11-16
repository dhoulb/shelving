import{l}from"./chunk-3hsqrgzg.js";import{r}from"./chunk-90kryzxh.js";function p(n,e){if(l(e)){if(e instanceof n)return e;if("source"in e)return p(n,e.source)}}function _o(n,e,i=_o){let o=p(n,e);if(!o)throw new r(`Source "${n.name}" not found`,{received:e,expected:n,caller:i});return o}
export{p,_o};
