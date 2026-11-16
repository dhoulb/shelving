import{r}from"./chunk-90kryzxh.js";var t=/[^0-9a-f]/g;function Mm(){return crypto.randomUUID().replace(t,"")}function fo(n){if(typeof n!=="string"||!n)return;let e=n.toLowerCase().replace(t,"");if(e.length!==32)return;return`${e.slice(0,8)}${e.slice(8,12)}${e.slice(12,16)}${e.slice(16,20)}${e.slice(20)}`}function Om(n){let e=fo(n);if(!e)throw new r("Invalid UUID");return e}
export{Mm,fo,Om};
