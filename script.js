'use strict';
const number='5511967037084';
const whatsapp=message=>'https://wa.me/'+number+'?text='+encodeURIComponent(message);
document.querySelectorAll('[data-whatsapp]').forEach(a=>{a.href=whatsapp('Oi! Vim pela prévia do cardápio da Johnne’s Burger e gostaria de conhecer as opções e fazer um pedido.');});
document.querySelectorAll('[data-item]').forEach(a=>{a.href=whatsapp('Oi! Vi a prévia do cardápio da Johnne’s Burger. Quais são as opções e os valores de '+a.dataset.item+'?');});
const tabs=[...document.querySelectorAll('.category-nav a')];
const categories=[...document.querySelectorAll('.category')];
let scrollQueued=false;
function updateCategory(){
  let current=categories[0];
  for(const category of categories){if(category.getBoundingClientRect().top<=window.innerHeight*.42)current=category;}
  tabs.forEach(tab=>{const active=tab.hash==='#'+current.id;tab.classList.toggle('active',active);if(active)tab.setAttribute('aria-current','location');else tab.removeAttribute('aria-current');});
  scrollQueued=false;
}
addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(updateCategory);scrollQueued=true;}},{passive:true});
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>{t.classList.toggle('active',t===tab);if(t===tab)t.setAttribute('aria-current','location');else t.removeAttribute('aria-current');});}));
const modal=document.getElementById('app-dialog');
document.querySelectorAll('[data-app]').forEach(button=>button.addEventListener('click',()=>{
  document.getElementById('app-name').textContent=button.dataset.app.toUpperCase();
  document.getElementById('app-name-copy').textContent=button.dataset.app;
  modal.showModal();
}));
document.querySelectorAll('.close-dialog,.close-dialog-action').forEach(button=>button.addEventListener('click',()=>modal.close()));
modal.addEventListener('click',event=>{if(event.target===modal){const bounds=modal.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)modal.close();}});
