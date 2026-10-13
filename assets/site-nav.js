(function(){
  var b=document.querySelector('.sn-toggle'),m=document.getElementById('sn-links');
  if(!b||!m)return;
  function set(o){m.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));b.setAttribute('aria-label',o?'Close navigation menu':'Open navigation menu');b.textContent=o?'×':'☰';}
  b.addEventListener('click',function(){set(!m.classList.contains('open'));});
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open')){set(false);b.focus();}});
})();
