// vt.js — loaded in <head> on every page so it runs before the first paint.
// Cross-document page transitions are progressive enhancement: if the browser skips one
// (unsupported, too slow, tab in background…), the navigation still happens normally.
// These handlers just stop a skipped transition from being reported as an uncaught error.
(function(){
  function quiet(e){
    var vt = e && e.viewTransition;
    if (!vt) return;
    if (vt.ready) vt.ready.catch(function(){});
    if (vt.finished) vt.finished.catch(function(){});
    if (vt.updateCallbackDone) vt.updateCallbackDone.catch(function(){});
  }
  window.addEventListener('pageswap', quiet);
  window.addEventListener('pagereveal', function(e){
    quiet(e);
  });
})();
