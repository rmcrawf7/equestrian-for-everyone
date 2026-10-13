/* Photo viewer: click any image inside [data-lightbox] to open it large.
   Close with the × / "Back to gallery" button, Esc, clicking outside the photo,
   or the browser/phone Back button. Arrows, arrow keys or swiping move between photos. */
(function(){
  var groups=document.querySelectorAll('[data-lightbox]');
  if(!groups.length)return;

  var css='.lb{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.97);display:none;flex-direction:column;font-family:Arial,Helvetica,sans-serif;color:#fff}'+
  '.lb.open{display:flex}.lb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;flex:0 0 auto}'+
  '.lb-back{display:inline-flex;align-items:center;gap:10px;background:transparent;border:1px solid rgba(255,255,255,.55);color:#fff;padding:11px 16px;font:800 .72rem Arial,Helvetica,sans-serif;letter-spacing:.11em;text-transform:uppercase;cursor:pointer}'+
  '.lb-back:hover{background:#fff;color:#000}.lb-count{font-size:.78rem;letter-spacing:.12em;color:#bbb}'+
  '.lb-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;position:relative;padding:0 64px}'+
  '.lb-img{max-width:100%;max-height:100%;object-fit:contain;display:block;box-shadow:0 10px 40px rgba(0,0,0,.5);user-select:none;-webkit-user-drag:none}'+
  '.lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);color:#fff;font-size:1.6rem;line-height:1;cursor:pointer}'+
  '.lb-nav:hover{background:#9C0000;border-color:#9C0000}.lb-prev{left:10px}.lb-next{right:10px}'+
  '.lb-cap{flex:0 0 auto;text-align:center;padding:14px 20px 20px;color:#ddd;font-size:.92rem;min-height:1.2em}'+
  '.lb button:focus-visible{outline:2px solid #fff;outline-offset:3px}'+
  '[data-lightbox] img{cursor:zoom-in}[data-lightbox] img:focus-visible{outline:3px solid #9C0000;outline-offset:3px}'+
  '@media(max-width:620px){.lb-stage{padding:0 8px}.lb-nav{width:42px;height:42px;font-size:1.3rem;top:auto;bottom:-6px;transform:none}.lb-prev{left:calc(50% - 52px)}.lb-next{right:calc(50% - 52px)}.lb-cap{padding-top:52px}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var lb=document.createElement('div');
  lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Photo viewer');
  lb.innerHTML='<div class="lb-top"><button class="lb-back" type="button"><span aria-hidden="true">←</span> Back to gallery</button><span class="lb-count" aria-live="polite"></span></div>'+
    '<div class="lb-stage"><button class="lb-nav lb-prev" type="button" aria-label="Previous photo">‹</button><img class="lb-img" alt=""><button class="lb-nav lb-next" type="button" aria-label="Next photo">›</button></div>'+
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var big=lb.querySelector('.lb-img'),cap=lb.querySelector('.lb-cap'),count=lb.querySelector('.lb-count'),
      back=lb.querySelector('.lb-back'),prev=lb.querySelector('.lb-prev'),next=lb.querySelector('.lb-next');

  var list=[],i=0,lastFocus=null,pushed=false;

  function show(n){
    i=(n+list.length)%list.length;var im=list[i];
    big.src=im.currentSrc||im.src;big.alt=im.alt||'';
    cap.textContent=im.alt||'';count.textContent=(i+1)+' / '+list.length;
    var multi=list.length>1;prev.style.display=next.style.display=multi?'':'none';
  }
  function open(group,img){
    list=[].slice.call(group.querySelectorAll('img'));lastFocus=img;
    show(list.indexOf(img));lb.classList.add('open');document.body.style.overflow='hidden';
    try{history.pushState({lb:1},'');pushed=true;}catch(e){pushed=false;}
    back.focus();
  }
  function close(fromHistory){
    if(!lb.classList.contains('open'))return;
    lb.classList.remove('open');document.body.style.overflow='';big.removeAttribute('src');
    if(pushed&&!fromHistory){pushed=false;history.back();}
    pushed=false;if(lastFocus)lastFocus.focus({preventScroll:true});
  }

  groups.forEach(function(g){
    g.querySelectorAll('img').forEach(function(img){
      img.setAttribute('tabindex','0');img.setAttribute('role','button');
      img.setAttribute('aria-label','View larger: '+(img.alt||'photo'));
      img.addEventListener('click',function(){open(g,img);});
      img.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(g,img);}});
    });
  });

  back.addEventListener('click',function(){close(false);});
  prev.addEventListener('click',function(){show(i-1);});
  next.addEventListener('click',function(){show(i+1);});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-stage')||e.target.classList.contains('lb-cap'))close(false);});
  window.addEventListener('popstate',function(){close(true);});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close(false);
    else if(e.key==='ArrowLeft')show(i-1);
    else if(e.key==='ArrowRight')show(i+1);
    else if(e.key==='Tab'){ // keep focus inside the viewer
      var f=[back,prev,next].filter(function(b){return b.style.display!=='none';});
      var k=f.indexOf(document.activeElement);
      if(e.shiftKey&&k<=0){e.preventDefault();f[f.length-1].focus();}
      else if(!e.shiftKey&&k===f.length-1){e.preventDefault();f[0].focus();}
    }
  });
  var sx=null,sy=null;
  lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(sx===null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(dx<0?i+1:i-1);
    else if(dy>90&&Math.abs(dy)>Math.abs(dx))close(false); // swipe down to close
  });
})();
