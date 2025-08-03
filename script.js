const pages = document.querySelectorAll(".page");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let user = JSON.parse(localStorage.getItem("user")) || null;

const foods = [
  {id:1,name:"Veg Burger",price:120},{id:2,name:"Cheese Pizza",price:250},
  {id:3,name:"Paneer Tikka",price:200},{id:4,name:"Veg Momos",price:100},
  {id:5,name:"Chicken Roll",price:150},{id:6,name:"Masala Dosa",price:180},
  {id:7,name:"Pav Bhaji",price:90},{id:8,name:"Chole Bhature",price:110},
  {id:9,name:"Fried Rice",price:130},{id:10,name:"Noodles",price:120},
  {id:11,name:"Butter Naan",price:40},{id:12,name:"Dal Makhani",price:160},
  {id:13,name:"Samosa",price:30},{id:14,name:"Spring Roll",price:80},
  {id:15,name:"Chocolate Shake",price:140},{id:16,name:"Cold Coffee",price:100},
  {id:17,name:"French Fries",price:90},{id:18,name:"Tandoori Chicken",price:320},
  {id:19,name:"Biryani",price:220},{id:20,name:"Gulab Jamun",price:70},
  {id:21,name:"Kanpur Kachori",price:50},{id:22,name:"Thaggu ke Laddu",price:180},
  {id:23,name:"Badnam Kulfi",price:60},{id:24,name:"Paneer Masala",price:210},
  {id:25,name:"Chicken Biryani",price:250},{id:26,name:"Mutton Curry",price:300},
  {id:27,name:"Paneer Butter Masala",price:230},{id:28,name:"Veg Cutlet",price:70},
  {id:29,name:"Rasgulla",price:80},{id:30,name:"Lassi",price:90},
  {id:31,name:"Milkshake",price:120},{id:32,name:"Hot Coffee",price:70},
  {id:33,name:"Ice Cream Sundae",price:150}
];

function showPage(id){
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.getElementById("goto-cart-btn").style.display = (id === "menu") ? "block" : "none";
  if(id === "menu") renderFood();
  if(id === "cart") renderCart();
  if(id === "history") renderHistory();
  if(id === "profile") renderProfile();
}

function checkLocation(){
  let loc = prompt("Enter your location:");
  if(loc && loc.toLowerCase().includes("kanpur")){showPage('menu');}
  else{alert("❌ Sorry! We deliver only in Kanpur.");}
}

function renderFood(){
  const list = document.getElementById("food-list");
  list.innerHTML = "";
  foods.forEach(f=>{
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML = `<h3>${f.name}</h3><p>₹${f.price}</p>
    <button onclick="addToCart(${f.id},this)">Add to Cart</button>`;
    list.appendChild(card);
  });
}

function addToCart(id,btn){
  const existing = cart.find(i=>i.id === id);
  if(existing){existing.qty += 1;}
  else{const item = foods.find(f=>f.id === id);cart.push({...item,qty:1});}
  localStorage.setItem("cart",JSON.stringify(cart));
  btn.innerText = "✅ Added!";
  btn.style.background = "#4CAF50";
  setTimeout(()=>{btn.innerText="Add to Cart";btn.style.background="";},1200);
  updateCartCount();
}

function renderCart(){
  const div = document.getElementById("cart-items");
  div.innerHTML = "";
  let total = 0;
  cart.forEach((item,index)=>{
    let line = item.price * (item.qty || 1); total += line;
    div.innerHTML += `<div class="cart-item">${item.name} - ₹${item.price} x ${item.qty}
    <button onclick="updateQty(${index},-1)">-</button>
    <button onclick="updateQty(${index},1)">+</button></div>`;
  });
  div.innerHTML += `<p><b>Total:</b> ₹${total}</p>`;
}

function updateQty(index,change){
  cart[index].qty += change;
  if(cart[index].qty <= 0){cart.splice(index,1);}
  localStorage.setItem("cart",JSON.stringify(cart));
  renderCart(); updateCartCount();
}

function checkout(){
  if(!user){alert("Please login first!");showPage("login");return;}
  const sum = cart.reduce((a,b)=>a+b.price*(b.qty||1),0);
  document.getElementById("checkout-summary").innerText = "Total: ₹" + sum;
  showPage("checkout");
}

function placeOrder(){
  const addr = document.getElementById("address").value.trim();
  if(!addr){alert("Enter address");return;}
  if(cart.length === 0){alert("Cart is empty");return;}
  const payment = document.querySelector('input[name="payment"]:checked').value;

  const anim = document.getElementById("checkout-animation");
  const status = document.getElementById("checkout-status");
  const progress = anim.querySelector(".progress");
  anim.style.display = "flex";
  progress.style.width = "0%";

  const paymentMsgs = (payment === "Online Payment")
    ? ["Processing Payment...","Verifying Order...","Payment Successful!"]
    : ["Placing COD Order...","Verifying COD Order...","Order Confirmed!"];

  let step = 0;
  function nextPayMsg(){
    status.style.opacity = 0;
    setTimeout(()=>{
      status.innerText = paymentMsgs[step];
      status.style.opacity = 1;
      progress.style.width = ((step+1)/paymentMsgs.length)*100 + "%";
      step++;
      if(step < paymentMsgs.length){
        setTimeout(nextPayMsg,2000);
      } else {
        setTimeout(()=>{
          anim.style.display = "none";
          startDeliveryAnimation(payment);
        },1000);
      }
    },300);
  }
  nextPayMsg();
}

function startDeliveryAnimation(payment){
  const delivery = document.getElementById("delivery-animation");
  const dstatus = document.getElementById("delivery-status");
  const progress = delivery.querySelector(".progress");
  delivery.style.display = "flex";
  progress.style.width = "0%";

  const messages = [
    "Preparing your order...",
    "Cooking your food...",
    "On the way to your location...",
    payment === "Cash on Delivery"
      ? "Delivered! Payment Successful (COD)"
      : "Delivered! Enjoy your meal!"
  ];

  const order = {
    items:[...cart],
    total:cart.reduce((a,b)=>a+b.price*(b.qty||1),0),
    name:user.name,mobile:user.mobile,date:new Date().toLocaleString(),
    address:document.getElementById("address").value.trim(),
    payment:payment
  };
  orders.push(order);
  localStorage.setItem("orders",JSON.stringify(orders));
  cart = []; localStorage.setItem("cart","[]"); updateCartCount();

  let step = 0;
  function nextMsg(){
    dstatus.style.opacity = 0;
    setTimeout(()=>{
      dstatus.innerText = messages[step];
      dstatus.style.opacity = 1;
      progress.style.width = ((step+1)/messages.length)*100 + "%";
      step++;
      if(step < messages.length){
        setTimeout(nextMsg,2500);
      } else {
        setTimeout(()=>{
          delivery.style.display = "none";
          showPage("history");
        },3000);
      }
    },400);
  }
  nextMsg();
}

function doLogin(){
  const name = document.getElementById("loginName").value.trim();
  const mobile = document.getElementById("loginMobile").value.trim();
  if(!name || !mobile){alert("Enter details");return;}
  user = {name,mobile};
  localStorage.setItem("user",JSON.stringify(user));
  alert("Login successful");
  showPage("landing");
}

function renderHistory(){
  const div = document.getElementById("history-list");
  div.innerHTML = "";
  if(!user){div.innerHTML="<p>Please login to view orders.</p>";return;}
  orders.filter(o => o.mobile === user.mobile).forEach(o=>{
    div.innerHTML += `<div><b>${o.date}</b><br>
    <b>Payment:</b> ${o.payment}<br>
    <ul>${o.items.map(i=>`<li>${i.name} - ₹${i.price} x ${i.qty}</li>`).join("")}</ul>
    <b>Total:</b> ₹${o.total}</div><hr>`;
  });
}

function renderProfile(){
  const div = document.getElementById("profile-info");
  if(user){
    div.innerHTML = `<p><b>Name:</b> ${user.name}</p><p><b>Mobile:</b> ${user.mobile}</p>`;
  } else {
    div.innerHTML = "<p>Please login.</p>";
  }
}

function logout(){
  user = null; localStorage.removeItem("user");
  alert("Logged out!"); showPage("landing");
}

function updateCartCount(){
  document.getElementById("cart-count").innerText = cart.reduce((s,i)=>s+(i.qty||1),0);
}


function toggleDarkMode(){
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode",document.body.classList.contains("dark")?"on":"off");
}
if(localStorage.getItem("darkMode") === "on"){document.body.classList.add("dark");}


window.addEventListener("load",()=>{
  const splash = document.getElementById("splash-screen");
  setTimeout(()=>{
    splash.classList.add("fade-out");
    setTimeout(()=>{
      splash.style.display = "none"; showPage("landing");
    },800);
  },2500);
});

updateCartCount();
