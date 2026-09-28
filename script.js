'use strict';
const catalog = [
  {id:'especial',category:'burgers',name:'Burger Especial',description:'Pão brioche, hambúrguer bovino de 180 g, cheddar, bacon, cebola caramelizada e maionese da casa.',image:'burger-especial.jpg',tag:'EM DESTAQUE'},
  {id:'classico',category:'burgers',name:'Burger Clássico',description:'Pão brioche, hambúrguer bovino de 150 g, queijo, alface, tomate e maionese da casa.',image:'burger-classico.jpg'},
  {id:'duplo',category:'burgers',name:'Burger Duplo',description:'Pão brioche, dois hambúrgueres bovinos de 150 g, cheddar em dobro, picles e molho da casa.',image:'burger-duplo.jpg'},
  {id:'fritas',category:'porcoes',name:'Batata Frita',description:'300 g de batatas fritas crocantes, com sal e uma porção de maionese da casa.',detail:'300 G · PARA DIVIDIR'},
  {id:'fritas-cheddar',category:'porcoes',name:'Batata Cheddar & Bacon',description:'300 g de batatas fritas com cobertura de cheddar cremoso e bacon em cubos.',detail:'300 G · CAPRICHADA'},
  {id:'onion',category:'porcoes',name:'Onion Rings',description:'10 anéis de cebola empanados, acompanhados de molho barbecue.',detail:'10 UNIDADES'},
  {id:'combo-classico',category:'combos',name:'Combo Clássico',description:'1 Burger Clássico + batata frita individual (150 g) + 1 refrigerante cola tradicional em lata (350 ml).',detail:'PARA 1 PESSOA'},
  {id:'combo-especial',category:'combos',name:'Combo Especial',description:'1 Burger Especial + batata cheddar e bacon (150 g) + 1 refrigerante guaraná em lata (350 ml).',detail:'PARA 1 PESSOA'},
  {id:'combo-dupla',category:'combos',name:'Combo da Dupla',description:'2 Burgers Clássicos + batata frita para dividir (300 g) + 2 refrigerantes cola tradicional em lata (350 ml cada).',detail:'PARA 2 PESSOAS'},
  {id:'cola',category:'bebidas',name:'Refrigerante Cola',description:'Sabor cola tradicional. Lata de 350 ml.',detail:'350 ML'},
  {id:'cola-zero',category:'bebidas',name:'Refrigerante Cola Zero',description:'Sabor cola, sem açúcar. Lata de 350 ml.',detail:'350 ML · ZERO AÇÚCAR'},
  {id:'guarana',category:'bebidas',name:'Refrigerante Guaraná',description:'Sabor guaraná tradicional. Lata de 350 ml.',detail:'350 ML'},
  {id:'agua',category:'bebidas',name:'Água Mineral',description:'Água mineral sem gás. Garrafa de 500 ml.',detail:'500 ML · SEM GÁS'}
];
const cart = new Map();
const storageKey = 'johnnes-preview-cart-v2';
const itemById = id => catalog.find(item => item.id === id);
const itemCount = () => [...cart.values()].reduce((sum,quantity)=>sum+quantity,0);
function changeQuantity(id,delta){
  if(!itemById(id))return;
  const next=Math.max(0,Math.min(99,(cart.get(id)||0)+delta));
  if(next)cart.set(id,next);else cart.delete(id);
}
function orderMessage(customer,fulfillment,address,notes){
  const lines=[...cart].map(([id,quantity])=>{
    const item=itemById(id);
    return `${quantity}x ${item.name} — R$ 00,00\n   ${item.description}`;
  });
  return ['SIMULAÇÃO DA PRÉVIA — não é um pedido real.','Oi! Montei esta seleção pelo cardápio da Johnne’s:',...lines,'','Subtotal ilustrativo: R$ 00,00',`Nome: ${customer.trim()}`,`Recebimento: ${fulfillment==='entrega'?'Entrega':'Retirada'}`,fulfillment==='entrega'?`Endereço: ${address.trim()}\nTaxa e disponibilidade de entrega: a confirmar pela loja.`:'',notes.trim()?`Observações: ${notes.trim()}`:'','Itens e valores demonstrativos, sujeitos à substituição pelo cardápio real.'].filter(Boolean).join('\n');
}
try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  if(Array.isArray(saved))for(const entry of saved){
    if(Array.isArray(entry)&&entry.length===2&&itemById(entry[0])&&Number.isInteger(entry[1])&&entry[1]>0&&entry[1]<=99)cart.set(entry[0],entry[1]);
  }
}catch{/* Storage is optional; the cart also works without it. */}
for(const category of document.querySelectorAll('[data-menu]')){
  category.innerHTML=catalog.filter(item=>item.category===category.dataset.menu).map(item=>`<article class="burger-card ${item.image?'':'compact-card'} ${item.tag?'featured':''}">${item.image?`<div class="card-photo"><img src="assets/${item.image}" alt="Foto da Johnne’s Burger" loading="lazy">${item.tag?`<span class="card-label">${item.tag}</span>`:''}</div>`:''}<div class="card-body">${item.detail?`<p class="product-detail">${item.detail}</p>`:''}<h4>${item.name}</h4><p>${item.description}</p><div class="item-bottom"><span class="product-price">R$ 00,00</span><button type="button" class="order-item" data-add="${item.id}" aria-label="Adicionar ${item.name}">Adicionar <span aria-hidden="true">+</span></button></div><span class="item-in-cart" data-quantity="${item.id}"></span></div></article>`).join('');
}
const dialog=document.getElementById('cart-dialog');
const form=document.getElementById('checkout-form');
const cartList=document.getElementById('cart-items');
const status=document.getElementById('cart-status');
let toastTimer;
function announce(message){status.textContent=message;status.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>status.classList.remove('visible'),2500);}
function renderCart(){
  const count=itemCount();
  document.getElementById('cart-count').textContent=count;
  document.getElementById('cart-bar-label').textContent=count?'Revisar minha sacola':'Ver minha sacola';
  document.querySelector('.cart-bar button').setAttribute('aria-label',`Ver minha sacola, ${count} ${count===1?'item':'itens'}`);
  document.getElementById('cart-empty').hidden=count>0;
  form.hidden=count===0;
  document.querySelectorAll('[data-quantity]').forEach(label=>{const q=cart.get(label.dataset.quantity)||0;label.textContent=q?`${q} na sacola`:'';});
  document.querySelectorAll('[data-add]').forEach(button=>{button.disabled=(cart.get(button.dataset.add)||0)>=99;});
  cartList.innerHTML=[...cart].map(([id,quantity])=>`<li class="cart-line"><div><strong>${itemById(id).name}</strong><small>R$ 00,00</small><button class="remove-item" type="button" data-remove="${id}" aria-label="Remover ${itemById(id).name}">Remover</button></div><div class="quantity-control"><button type="button" data-change="${id}" data-delta="-1" aria-label="Diminuir ${itemById(id).name}">−</button><span aria-label="Quantidade de ${itemById(id).name}">${quantity}</span><button type="button" data-change="${id}" data-delta="1" aria-label="Aumentar ${itemById(id).name}" ${quantity>=99?'disabled':''}>+</button></div></li>`).join('');
  try{localStorage.setItem(storageKey,JSON.stringify([...cart]));}catch{/* Nonpersistent cart remains usable. */}
}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{changeQuantity(button.dataset.add,1);renderCart();announce(`${itemById(button.dataset.add).name} adicionado à sacola.`);}));
document.querySelectorAll('[data-open-cart]').forEach(button=>button.addEventListener('click',()=>{renderCart();dialog.showModal();}));
document.querySelector('.cart-close').addEventListener('click',()=>dialog.close());
document.getElementById('choose-items').addEventListener('click',()=>{dialog.close();document.getElementById('cardapio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
cartList.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const id=button.dataset.change||button.dataset.remove;
  if(button.dataset.remove)cart.delete(id);else changeQuantity(id,Number(button.dataset.delta));
  const delta=button.dataset.delta;
  renderCart();announce('Sacola atualizada.');
  const next=cartList.querySelector(`[data-change="${id}"][data-delta="${delta}"]`);
  if(next&&!next.disabled)next.focus();else (cartList.querySelector('button')||document.getElementById('choose-items')).focus();
});
document.querySelectorAll('[name="fulfillment"]').forEach(radio=>radio.addEventListener('change',()=>{
  const delivery=document.querySelector('[name="fulfillment"]:checked').value==='entrega';
  document.getElementById('address-fields').hidden=!delivery;
  document.getElementById('customer-address').required=delivery;
  document.getElementById('customer-address').setCustomValidity('');
}));
form.addEventListener('submit',event=>{
  event.preventDefault();if(!itemCount())return;
  const customer=document.getElementById('customer-name');const address=document.getElementById('customer-address');
  const fulfillment=document.querySelector('[name="fulfillment"]:checked').value;
  customer.setCustomValidity(customer.value.trim()?'':'Informe seu nome.');
  address.setCustomValidity(fulfillment!=='entrega'||address.value.trim()?'':'Informe o endereço de entrega.');
  if(!form.reportValidity())return;
  const message=orderMessage(customer.value,fulfillment,address.value,document.getElementById('order-notes').value);
  window.open('https://wa.me/5511967037084?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
});
['customer-name','customer-address'].forEach(id=>document.getElementById(id).addEventListener('input',event=>event.target.setCustomValidity('')));
const tabs=[...document.querySelectorAll('.category-nav a')];
const categories=[...document.querySelectorAll('.category')];let scrollQueued=false;
function updateCategory(){let current=categories[0];for(const category of categories){if(category.getBoundingClientRect().top<=window.innerHeight*.42)current=category;}tabs.forEach(tab=>{const active=tab.hash==='#'+current.id;tab.classList.toggle('active',active);if(active)tab.setAttribute('aria-current','location');else tab.removeAttribute('aria-current');});scrollQueued=false;}
addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(updateCategory);scrollQueued=true;}},{passive:true});
renderCart();updateCategory();
