import{l}from"./chunk-n57k52hr.js";import{t}from"./chunk-m2s2d87e.js";function p(e,r){if(l(r)){if(r instanceof e)return r;if("source"in r)return p(e,r.source)}}function Lo(e,r,o=Lo){let n=p(e,r);if(!n)throw new t(`Source "${e.name}" not found`,{received:r,expected:e,caller:o});return n}
export{p,Lo};
