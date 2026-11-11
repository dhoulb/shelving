import{l}from"./chunk-7w32sw4y.js";import{t}from"./chunk-m2s2d87e.js";function p(e,r){if(l(r)){if(r instanceof e)return r;if("source"in r)return p(e,r.source)}}function Mo(e,r,o=Mo){let n=p(e,r);if(!n)throw new t(`Source "${e.name}" not found`,{received:r,expected:e,caller:o});return n}
export{p,Mo};
