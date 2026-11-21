function w(n,e,t){let{cause:p,caller:o=n,...s}=t;for(let[a,i]of Object.entries(s))e[a]=i;if(o)Error.captureStackTrace(e,o)}class r extends Error{constructor(n,e={}){super(n,e);w(r,this,e)}}r.prototype.name="RequiredError";
export{w,r};
