class no{_callback;_ms;_timeout=void 0;constructor(e=void 0,t=0){this._callback=e,this._ms=t}get exists(){return!!this._timeout}set(e=this._callback,t=this._ms){if(this.clear(),e)this._timeout=setTimeout(i,t,this,e)}clear(){let e=this._timeout;if(e)this._timeout=void 0,clearTimeout(e)}}function i(e,t){e.clear(),t()}
export{no};
