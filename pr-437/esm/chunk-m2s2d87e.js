function P(e,r,o){let{cause:p,caller:n=e,...s}=o;for(let[a,i]of Object.entries(s))r[a]=i;if(n)Error.captureStackTrace(r,n)}class t extends Error{constructor(e,r={}){super(e,r);P(t,this,r)}}t.prototype.name="RequiredError";
export{P,t};
