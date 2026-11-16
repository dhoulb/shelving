function P(n,e,t){let{cause:p,caller:o=n,...s}=t;for(let[a,i]of Object.entries(s))e[a]=i;if(o)Error.captureStackTrace(e,o)}class r extends Error{constructor(n,e={}){super(n,e);P(r,this,e)}}r.prototype.name="RequiredError";
export{P,r};
