const WHATSAPP="27697479557";
let tempImgs=["","","",""];
let products=[], cart=[], current=null, activeCat='all';
const MAX_W = 480;
const QUALITY = 0.45;
const MAX_DOC_BYTES = 900000;
const getDB = () => window.db;
const getFB = () => window.fbMethods;
const getAuth = () => window.auth;
function avg(arr){if(!arr||!arr.length)return 4.9;return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1)}
function toast(m){let d=document.createElement('div');d.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:999px;font-size:11px;font-weight:800;z-index:999;';d.innerText=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2500)}
async function loadProducts(){
  if(!getDB()){ setTimeout(loadProducts,500); return; }
  const { collection, onSnapshot } = getFB();
  const col = collection(getDB(), "blackink_products");
  onSnapshot(col, (snap)=>{
    products = snap.docs.map(d=>({id:d.id, ...d.data()}));
    if(document.getElementById('products')) render();
    if(document.getElementById('adminProducts')) renderAdminP();
  });
}
loadProducts();

// ===== WELCOME =====
function showWelcome(){
  const modal=document.getElementById('welcomeModal'); const box=document.getElementById('welcomeBox');
  if(!modal) return; modal.style.opacity='1'; modal.style.pointerEvents='all'; if(box) box.style.transform='scale(1)';
}
function closeWelcome(){
  const modal=document.getElementById('welcomeModal'); const box=document.getElementById('welcomeBox');
  if(box) box.style.transform='scale(.9)'; if(modal) modal.style.opacity='0';
  setTimeout(()=>{ if(modal) modal.style.pointerEvents='none'; },400);
  localStorage.setItem('BI_WELCOMED',Date.now());
}
window.showWelcome=showWelcome; window.closeWelcome=closeWelcome;
window.addEventListener('load',()=>{
  if(!document.getElementById('welcomeModal')) return;
  const last=localStorage.getItem('BI_WELCOMED'); const now=Date.now();
  const oneDay= 0.10*60*60*1000;
  if(!last||(now-parseInt(last))>oneDay) setTimeout(showWelcome,200);
  document.getElementById('welcomeModal')?.addEventListener('click',e=>{ if(e.target.id==='welcomeModal') closeWelcome(); });
});

// ===== BEAUTIFUL BI CARD =====
function ensureSuccessStyles(){
  if(document.getElementById('biSuccessStyle')) return;
  const s=document.createElement('style'); s.id='biSuccessStyle';
  s.innerHTML=`
  #orderSuccessModal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:.3s}
  #orderSuccessModal.show{opacity:1;pointer-events:all}
  #orderSuccessBox{background:#fff;border:3px solid #000;border-radius:22px;max-width:380px;width:100%;padding:0;overflow:hidden;box-shadow:10px 10px 0 #000;transform:scale(.92);transition:.35s cubic-bezier(.34,1.56,.64,1)}
  #orderSuccessModal.show #orderSuccessBox{transform:scale(1)}
  .bi-card-top{background:#111;color:#fff;padding:18px 20px;text-align:center}
  .bi-card-top h2{margin:0;font-size:22px;letter-spacing:2px;font-weight:900}
  .bi-card-top .bi-code{margin:8px auto 0;background:#fff;color:#000;padding:6px 14px;border-radius:999px;display:inline-block;font-weight:900;letter-spacing:1px;border:2px solid #000}
  .bi-card-body{padding:16px 18px}
  .bi-card-body .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px dashed #ddd;font-size:12px}
  .bi-card-body .row.total{font-weight:900;font-size:14px;border-bottom:none;background:#ffcc00;border:2px solid #000;border-radius:10px;padding:10px 12px;margin-top:10px}
  .bi-ok-btn{width:100%;background:#000;color:#fff;border:3px solid #000;border-radius:999px;padding:14px;font-weight:900;font-size:14px;letter-spacing:1px;cursor:pointer;box-shadow:4px 4px 0 #000;margin-top:14px;transition:.1s}
  .bi-ok-btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #000}
  `;
  document.head.appendChild(s);
}
function showOrderSuccessCard({code,items,total,name}){
  ensureSuccessStyles();
  let old=document.getElementById('orderSuccessModal'); if(old) old.remove();
  const itemsHtml=items.map(i=>`<div class="row"><span>${i.name} Size ${i.size} x${i.qty}</span><span>R${i.price*i.qty}</span></div>`).join('');
  const modal=document.createElement('div'); modal.id='orderSuccessModal';
  modal.innerHTML=`
  <div id="orderSuccessBox">
    <div class="bi-card-top">
      <div style="font-size:32px">✅</div>
      <h2>ORDER SAVED!</h2>
      <div class="bi-code">${code}</div>
      <div style="font-size:11px;margin-top:6px;opacity:.7">Siyabulela, ${name}!</div>
    </div>
    <div class="bi-card-body">
      ${itemsHtml}
      <div class="row total"><span>TOTAL</span><span>R${total}</span></div>
      <div style="font-size:10px;opacity:.6;margin-top:10px;text-align:center">Track with ${code} • Est 2-3 days<br>Admin will update status & days left</div>
      <button class="bi-ok-btn" id="biOkBtn">OK — OPEN WHATSAPP 🔥</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  setTimeout(()=>modal.classList.add('show'),20);
  
  document.getElementById('biOkBtn').onclick=()=>{
    modal.classList.remove('show');
    setTimeout(()=>modal.remove(),300);
    // OPEN WHATSAPP AUTOMATICALLY - NO CONFIRM
    const list=items.map(c=>`• ${c.name} Size ${c.size} x${c.qty}=R${c.price*c.qty}`).join('\n');
    const msg=`🔥 BLACK INK ORDER ${code} 🔥\n\n${list}\n\nTotal: R${total}\nName: ${name}\nTrack: ${code}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank');
  };
}

const hoursBox=document.getElementById('hoursBox');
if(hoursBox){
  const days=[['Thursday','09:00 - 18:00'],['Friday','09:00 - 18:00'],['Saturday','09:00 - 18:00'],['Sunday','Closed'],['Monday','09:00 - 18:00'],['Tuesday','09:00 - 18:00']];
  hoursBox.innerHTML=days.map(d=>`<div><span>${d[0]}</span><span>${d[1]}</span></div>`).join('');
}

if(document.getElementById('products')){
  function render(){
    const box=document.getElementById('products'); if(!box) return; box.innerHTML="";
    let list=activeCat==='all'?products:products.filter(p=>p.cat===activeCat);
    list.forEach((p,i)=>{
      const total=p.sizes?Object.values(p.sizes).reduce((a,b)=>a+b,0):0;
      const cls=total==0?'out':total<3?'low':'in';
      box.innerHTML+=`<div class="card" style="animation-delay:${i*0.06}s" onclick="openProduct('${p.id}')">
        <div style="position:relative"><img src="${p.images[0]}"><div class="like-small">❤️ ${p.likes||0}</div></div>
        <h4>${p.name}</h4><div>R${p.price}</div><div style="font-size:10px">★★★★★ ${avg(p.ratings)} (${p.ratings?.length||0}) • ${p.cat}</div><span class="stock ${cls}">${total==0?'OUT':total+' left'}</span>
      </div>`;
    });
    const cc=document.getElementById('cartCount'); if(cc) cc.innerText=cart.reduce((a,b)=>a+b.qty,0);
  }
  window.filterCat=(cat,btn)=>{ activeCat=cat; document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); render(); }
  window.openProduct=id=>{
    current=products.find(x=>x.id==id);
    document.getElementById('mImage').src=current.images[0];
    document.getElementById('mName').innerText=current.name;
    document.getElementById('mPrice').innerText="R"+current.price;
    document.getElementById('mCat').innerText=current.cat;
    document.getElementById('mStock').innerText=`${Object.values(current.sizes).reduce((a,b)=>a+b,0)} left`;
    document.getElementById('stockFill').style.width="60%";
    const thumbs=document.getElementById('mThumbs'); thumbs.innerHTML="";
    current.images.forEach((img,i)=>{ if(img) thumbs.innerHTML+=`<img src="${img}" class="${i==0?'active':''}" onclick="setMain('${img}',this)">`; });
    const sel=document.getElementById('mSize'); sel.innerHTML="";
    for(let s in current.sizes){ sel.innerHTML+=`<option value="${s}">Size ${s} - ${current.sizes[s]} left ${current.sizes[s]==0?'(OUT)':''}</option>`; }
    document.getElementById('likeCount').innerText=current.likes||0;
    document.getElementById('mAvg').innerText=avg(current.ratings);
    document.getElementById('mRCount').innerText=`(${current.ratings?.length||0})`;
    document.getElementById('productModal').classList.remove('hidden');
  }
  window.setMain=(src,el)=>{document.getElementById('mImage').src=src;document.querySelectorAll('.thumbs img').forEach(i=>i.classList.remove('active'));el.classList.add('active')}
  window.addToCart=()=>{
    const size=document.getElementById('mSize').value; const qty=parseInt(document.getElementById('mQty').value);
    if(!size){ alert("⚠️ Select size"); return; }
    if(current.sizes[size]===0){ alert(`❌ Size ${size} is OUT!`); return; }
    if(qty>current.sizes[size]){ document.getElementById('mQtyError').innerText="Only "+current.sizes[size]+" left"; alert(`❌ Only ${current.sizes[size]} left`); return; }
    cart.push({id:current.id,name:current.name,size,qty,price:current.price}); closeModal('productModal'); render(); toast(`Added 🛒 ${size} x${qty}`); openCart();
  }
  window.openCart=()=>{
    if(cart.length==0){toast('Bag empty');return}
    let html="",total=0; cart.forEach((c,i)=>{total+=c.price*c.qty; html+=`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:12px"><span>${c.name} Size ${c.size} x${c.qty}</span><span>R${c.price*c.qty} <a href="#" onclick="removeCart(${i});return false" style="color:red">x</a></span></div>`});
    document.getElementById('cartItems').innerHTML=html; document.getElementById('cartTotal').innerText="Total: R"+total; document.getElementById('cartModal').classList.remove('hidden');
  }
  window.removeCart=i=>{cart.splice(i,1);render();if(cart.length==0)closeModal('cartModal');else openCart()}
  window.closeModal=id=>document.getElementById(id).classList.add('hidden');

  // ===== FINAL BUY BUTTON - 1.Save 2.Decrease 3.Beautiful Card + Auto WhatsApp =====
  window.submitOrder=async e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button'); const oldText=btn?btn.innerText:''; if(btn){btn.innerText='⏳ Saving...';btn.disabled=true;}
    const name=document.getElementById('custName').value.trim();
    const phone=document.getElementById('custPhone').value.trim();
    const del=document.getElementById('custCampus').value;
    const addr=document.getElementById('custAddress').value;
    if(cart.length===0){alert("Bag empty"); if(btn){btn.innerText=oldText;btn.disabled=false;} return;}
    for(let c of cart){
      const prod=products.find(p=>p.id==c.id);
      if(!prod||(prod.sizes[c.size]||0)<c.qty){ alert(`❌ Size ${c.size} for ${c.name} only has ${(prod?.sizes[c.size]||0)} left`); if(btn){btn.innerText=oldText;btn.disabled=false;} return; }
    }
    const code="BI"+Math.floor(1000+Math.random()*9000);
    let list="",total=0; cart.forEach(c=>{list+=`• ${c.name} Size ${c.size} x${c.qty}=R${c.price*c.qty}\n`;total+=c.price*c.qty;});
    const order={code,name,phone,delivery:del,address:addr,items:[...cart],total,status:"Pending",est:"2-3 days",date:new Date().toLocaleString(),createdAt:Date.now()};

    // 1. SAVE TO FIREBASE
    try{
      const { collection, addDoc, doc, updateDoc } = getFB();
      await addDoc(collection(getDB(),"blackink_orders"),order);
      // 2. DECREASE STOCK
      for(let c of cart){
        const prod=products.find(p=>p.id==c.id);
        if(prod){ prod.sizes[c.size]-=c.qty; if(prod.sizes[c.size]<0) prod.sizes[c.size]=0; await updateDoc(doc(getDB(),"blackink_products",prod.id),{sizes:prod.sizes}); }
      }
    }catch(err){
      console.error(err); alert("❌ Save failed: "+err.message+"\nFix Firestore Rules: allow create: if true; for blackink_orders"); if(btn){btn.innerText=oldText;btn.disabled=false;} return;
    }

    render(); if(typeof renderAdminP==='function') renderAdminP(); if(typeof renderAdminO==='function') renderAdminO();
    const savedItems=[...cart]; const savedName=name; const savedTotal=total; const savedCode=code;
    cart=[]; render(); closeModal('cartModal'); e.target.reset(); if(btn){btn.innerText=oldText;btn.disabled=false;}
    
    // 3. BEAUTIFUL CARD WITH OK -> AUTO OPEN WHATSAPP
    showOrderSuccessCard({code:savedCode,items:savedItems,total:savedTotal,name:savedName});
  }

  // ===== TRACK ORDER - SHOWS STATUS, DAYS LEFT, ITEMS, TOTAL =====
  window.trackOrder=async ()=>{
    const code=document.getElementById('trackInput').value.trim().toUpperCase();
    if(!code){toast('Enter BI code');return}
    const { collection, getDocs } = getFB();
    const snap=await getDocs(collection(getDB(),"blackink_orders"));
    const order=snap.docs.map(d=>d.data()).find(o=>o.code==code);
    const box=document.getElementById('trackResult');
    if(!order){ box.innerHTML=`<div style="background:#fff;border:2px solid #111;padding:10px;border-radius:10px;margin-top:10px">❌ ${code} not found</div>`; return; }
    const itemsHtml=order.items.map(i=>`• ${i.name} Size ${i.size} x${i.qty} = R${i.price*i.qty}`).join('<br>');
    box.innerHTML=`
      <div style="background:#fff;border:3px solid #111;border-radius:16px;padding:14px;margin-top:12px;box-shadow:6px 6px 0 #000">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b style="font-size:16px">${order.code}</b>
          <span style="background:#ffcc00;border:1.5px solid #000;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:900">${order.status}</span>
        </div>
        <div style="margin:10px 0;padding:10px;background:#f5f5f5;border-radius:10px;border:1.5px solid #000;font-size:12px;line-height:1.6">
          ${itemsHtml}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <div style="flex:1;background:#111;color:#fff;border-radius:10px;padding:8px;text-align:center"><div style="font-size:10px;opacity:.6">TOTAL</div><b>R${order.total}</b></div>
          <div style="flex:1;background:#fff;border:2px solid #000;border-radius:10px;padding:8px;text-align:center"><div style="font-size:10px;opacity:.6">DAYS LEFT</div><b>${order.est}</b></div>
        </div>
        <div style="font-size:10px;opacity:.6;margin-top:8px;text-align:center">Ordered: ${order.date} • ${order.delivery}</div>
      </div>`;
  }
}

if(document.getElementById('loginBox')){
  window.handleImg=(input,idx)=>{
    const file=input.files[0]; if(!file) return;
    if(file.size>10*1024*1024){alert("Image too big!");input.value="";return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas'); let w=img.width,h=img.height;
        if(w>MAX_W){h=h*(MAX_W/w);w=MAX_W} if(h>700){w=w*(700/h);h=700}
        canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h);
        tempImgs[idx]=canvas.toDataURL('image/jpeg',QUALITY);
        document.getElementById('prev'+idx).src=tempImgs[idx]; document.getElementById('prev'+idx).style.display='block';
        document.getElementById('up'+idx).parentElement.classList.add('has'); updateSizeInfo();
      }; img.src=e.target.result;
    }; reader.readAsDataURL(file);
  }
  function updateSizeInfo(){
    const totalBytes=tempImgs.join('').length; const totalKB=Math.round(totalBytes*0.75/1024);
    let info=document.getElementById('sizeInfo');
    if(!info){ info=document.createElement('div'); info.id='sizeInfo'; info.style.cssText='font-size:10px;font-weight:800;padding:8px;margin:8px 0;border-radius:8px;border:1.5px solid #000'; const grid=document.querySelector('.upload-grid'); if(grid) grid.after(info); }
    if(info){ info.innerText=`Total: ${totalKB}KB / 900KB limit (${tempImgs.filter(x=>x).length}/4 pics)`; info.style.background=totalKB>900?'#ff4444':totalKB>700?'#ffcc00':'#fff'; info.style.color=totalKB>900?'#fff':'#000'; }
  }
  window.adminLogin=async ()=>{
    const userInput=document.getElementById('lUser').value.trim().toLowerCase(); const pass=document.getElementById('lPass').value.trim(); let email=document.getElementById('lUser').value.trim();
    if(userInput==='admin'||userInput==='blackink') email='blackink@admin.com'; if(userInput==='mamthethwa') email='mamthethwa@admin.com';
    try{ await getFB().signInWithEmailAndPassword(getAuth(),email,pass); showAdmin(); toast("✅ Logged in as "+email); }catch(e){ document.getElementById('lError').innerText=e.message; alert("Login failed: "+e.message); }
  }
  window.adminLogout=async ()=>{ await getFB().signOut(getAuth()); localStorage.removeItem('BI_ADMIN'); location.reload(); }
  window.switchTab=t=>{document.querySelectorAll('.admin-card').forEach(c=>c.classList.add('hidden'));document.getElementById('tab-'+t).classList.remove('hidden');document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');if(t=='products')renderAdminP();if(t=='orders')renderAdminO()}
  function showAdmin(){document.getElementById('loginBox').classList.add('hidden');document.getElementById('adminPanel').classList.remove('hidden');renderAdminP();renderAdminO()}
  window.addProduct=async ()=>{
    const name=document.getElementById('aName').value,price=parseInt(document.getElementById('aPrice').value),cat=document.getElementById('aCat').value,sizesStr=document.getElementById('aSizes').value;
    const imgs=tempImgs.filter(x=>x); if(!name||!price||imgs.length==0){alert("⚠️ Need Name, Price, at least 1 pic");return} if(imgs.length>4){alert("⚠️ Only 4 pics!");return}
    let sizes={}; sizesStr.split(',').forEach(p=>{let [k,v]=p.split(':');if(k)sizes[k.trim().toUpperCase()]=parseInt(v)||0});
    const newProduct={name,price,cat,images:imgs,sizes,likes:0,ratings:[],createdAt:Date.now()};
    const docSize=JSON.stringify(newProduct).length; const docKB=Math.round(docSize/1024);
    if(docSize>MAX_DOC_BYTES){alert("❌ STILL TOO BIG, Try 3 or 2 pics");return;}
    try{ const { collection, addDoc } = getFB(); await addDoc(collection(getDB(),"blackink_products"),newProduct); toast(`✅ Published! ${docKB}KB`); alert(`✅ Published! ${docKB}KB / 900KB - DANKO!!`); tempImgs=["","","",""]; document.querySelectorAll('.prev').forEach(i=>{i.style.display='none';i.src=''}); document.querySelectorAll('.upload-box').forEach(b=>b.classList.remove('has')); document.getElementById('aName').value=""; document.getElementById('aPrice').value=""; document.getElementById('aSizes').value=""; const info=document.getElementById('sizeInfo'); if(info) info.innerText=`Total: 0KB / 900KB limit (0/4 pics)`; }catch(e){ alert("Firebase error: "+e.message); }
  }
  function renderAdminP(){const box=document.getElementById('adminProducts');if(!box)return;box.innerHTML="";products.forEach(p=>{const kb=Math.round(JSON.stringify(p).length/1024);box.innerHTML+=`<div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #eee"><img src="${p.images[0]}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;border:1.5px solid #111"><span style="flex:1"><b>${p.name}</b> (${p.cat})<br><small>R${p.price} • ${Object.entries(p.sizes||{}).map(([k,v])=>k+':'+v).join(', ')} • ${kb}KB</small></span><button onclick="deleteProd('${p.id}')" style="color:red;border:none;background:none;font-weight:800">🗑️</button></div>`})}
  window.deleteProd=async id=>{ if(!confirm("Delete this product?")) return; try{ const { doc, deleteDoc } = getFB(); await deleteDoc(doc(getDB(),"blackink_products",id)); toast("Deleted ✅"); }catch(e){ alert(e.message); } }

  // ===== ADMIN TABLE - STATUS + DAYS LEFT EDITABLE =====
  async function renderAdminO(){
    const tbody=document.getElementById('adminOrders');if(!tbody)return;
    try{
      const { collection, getDocs } = getFB();
      const snap=await getDocs(collection(getDB(),"blackink_orders"));
      const orders=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.createdAt-a.createdAt);
      tbody.innerHTML=""; 
      orders.forEach(o=>{
        tbody.innerHTML+=`<tr>
          <td><b>${o.code}</b></td>
          <td>${o.name}<br><small>${o.phone}</small></td>
          <td>${o.address}</td>
          <td>${o.items.map(i=>`${i.name} ${i.size} x${i.qty}`).join('<br>')}<br><b>R${o.total}</b></td>
          <td>R${o.total}</td>
          <td><select onchange="changeStatus('${o.id}',this.value)" style="border:1.5px solid #000;border-radius:6px;padding:4px;font-weight:800"><option ${o.status=='Pending'?'selected':''}>Pending</option><option ${o.status=='Confirmed'?'selected':''}>Confirmed</option><option ${o.status=='Packed'?'selected':''}>Packed</option><option ${o.status=='Shipped'?'selected':''}>Shipped</option><option ${o.status=='Delivered'?'selected':''}>Delivered</option></select></td>
          <td><input value="${o.est}" onchange="changeEst('${o.id}',this.value)" style="width:90px;border:1.5px solid #000;border-radius:6px;padding:5px;font-weight:800;text-align:center" placeholder="2-3 days"></td>
          <td><small>${o.date}</small></td>
          <td><button onclick="deleteOrder('${o.id}')" style="color:red;border:none;background:none;font-weight:900">✕</button></td>
        </tr>`;
      })
    }catch(e){ tbody.innerHTML="<tr><td>Login first to see orders</td></tr>"; }
  }
  window.changeStatus=async (docId,val)=>{ const { doc, updateDoc } = getFB(); await updateDoc(doc(getDB(),"blackink_orders",docId),{status:val}); toast("Status: "+val); renderAdminO(); }
  window.changeEst=async (docId,val)=>{ const { doc, updateDoc } = getFB(); await updateDoc(doc(getDB(),"blackink_orders",docId),{est:val}); toast("Days left: "+val); renderAdminO(); }
  window.deleteOrder=async docId=>{ if(!confirm("Delete order?")) return; const { doc, deleteDoc } = getFB(); await deleteDoc(doc(getDB(),"blackink_orders",docId)); renderAdminO(); toast("Order deleted");}
  getFB().onAuthStateChanged(getAuth(),(user)=>{ if(user){ showAdmin(); } });
}
