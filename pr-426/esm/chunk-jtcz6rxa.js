import{l}from"./chunk-9e5qwxer.js";import{t}from"./chunk-m2s2d87e.js";function u(e,r){if(l(r)){if(r instanceof e)return r;if("source"in r)return u(e,r.source)}}function _o(e,r,o=_o){let n=u(e,r);if(!n)throw new t(`Source "${e.name}" not found`,{received:r,expected:e,caller:o});return n}
export{u,_o};
