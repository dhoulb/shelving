import{t}from"./chunk-m2s2d87e.js";var n=/[^0-9a-f]/g;function Mm(){return crypto.randomUUID().replace(n,"")}function co(e){if(typeof e!=="string"||!e)return;let r=e.toLowerCase().replace(n,"");if(r.length!==32)return;return`${r.slice(0,8)}${r.slice(8,12)}${r.slice(12,16)}${r.slice(16,20)}${r.slice(20)}`}function Om(e){let r=co(e);if(!r)throw new t("Invalid UUID");return r}
export{Mm,co,Om};
