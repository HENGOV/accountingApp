let transactions=JSON.parse(localStorage.getItem("transactions"))||[];
let selectedType="expense";
let selectedCategory="吃饭";
let insuranceAmount=Number(localStorage.getItem("insuranceAmount"))||0;

const monthKey=new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0");
let paidBills=JSON.parse(localStorage.getItem("paidBills_"+monthKey))||{};

const fixedBills=[
  {id:"sienna",name:"Sienna 车贷",subtitle:"Toyota · 每月固定",category:"车贷",icon:"🚙",amount:1032.03},
  {id:"phone",name:"手机话费",subtitle:"每月固定",category:"手机",icon:"📱",amount:50},
  {id:"insurance",name:"车险",subtitle:"点击设置金额",category:"车险",icon:"🛡️",amount:insuranceAmount}
];

const icons={"吃饭":"🍔","购物":"🛍️","车":"🚗","车贷":"🚙","车险":"🛡️","手机":"📱","工资":"💵","其他":"📦"};

const splash=document.getElementById("splash");
const splashWeather=document.getElementById("splashWeather");
const splashText=document.getElementById("splashText");
const greeting=document.getElementById("greeting");
const weatherIcon=document.getElementById("weatherIcon");
const weatherTitle=document.getElementById("weatherTitle");
const weatherDetail=document.getElementById("weatherDetail");
const temperature=document.getElementById("temperature");
const weatherFx=document.getElementById("weatherFx");
const availableBalanceEl=document.getElementById("availableBalance");
const totalIncomeEl=document.getElementById("totalIncome");
const totalExpenseEl=document.getElementById("totalExpense");
const pendingBillsEl=document.getElementById("pendingBills");
const pendingCountEl=document.getElementById("pendingCount");
const fixedBillsList=document.getElementById("fixedBillsList");
const categorySummary=document.getElementById("categorySummary");
const transactionList=document.getElementById("transactionList");
const transactionModal=document.getElementById("transactionModal");
const insuranceModal=document.getElementById("insuranceModal");
const amountInput=document.getElementById("amount");
const noteInput=document.getElementById("note");

function updateGreeting(){
  const hour=new Date().getHours();
  let text="你好";
  if(hour>=5&&hour<11) text="早上好";
  else if(hour>=11&&hour<14) text="中午好";
  else if(hour>=14&&hour<18) text="下午好";
  else if(hour>=18&&hour<23) text="晚上好";
  else text="夜深了";
  greeting.textContent=text;
}

function weatherInfo(code,isDay){
  if(code===0) return {title:isDay?"今天阳光不错":"今晚天气晴朗",icon:isDay?"☀️":"🌙",message:isDay?"适合把今天安排得清清楚楚。":"今天也辛苦了。",effect:"sun"};
  if([1,2,3].includes(code)) return {title:"今天有些云",icon:"☁️",message:"天气安静，慢慢把生活安排好。",effect:"cloud"};
  if([45,48].includes(code)) return {title:"外面有雾",icon:"🌫️",message:"开车注意安全。",effect:"cloud"};
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return {title:"今天有雨",icon:"☔️",message:"出门记得带伞。",effect:"rain"};
  if([71,73,75,77,85,86].includes(code)) return {title:"今天会下雪",icon:"❄️",message:"路滑，开车慢一点。",effect:"snow"};
  if([95,96,99].includes(code)) return {title:"有雷雨",icon:"⛈️",message:"尽量注意天气变化。",effect:"rain"};
  return {title:"今天也要好好生活",icon:"🌤️",message:"把今天安排得明明白白。",effect:"cloud"};
}

function createWeatherEffect(type){
  weatherFx.innerHTML="";
  if(type==="sun"){
    const glow=document.createElement("div"); glow.className="sun-glow"; weatherFx.appendChild(glow);
  }
  if(type==="rain"){
    for(let i=0;i<25;i++){
      const drop=document.createElement("div");
      drop.className="raindrop";
      drop.style.left=Math.random()*100+"%";
      drop.style.animationDuration=(.8+Math.random()*.8)+"s";
      drop.style.animationDelay=Math.random()*2+"s";
      weatherFx.appendChild(drop);
    }
  }
  if(type==="snow"){
    for(let i=0;i<20;i++){
      const snow=document.createElement("div");
      snow.className="snowflake";
      snow.textContent="•";
      snow.style.left=Math.random()*100+"%";
      snow.style.fontSize=(9+Math.random()*13)+"px";
      snow.style.animationDuration=(5+Math.random()*5)+"s";
      snow.style.animationDelay=Math.random()*5+"s";
      weatherFx.appendChild(snow);
    }
  }
}

async function loadWeather(latitude,longitude){
  try{
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`;
    const response=await fetch(url);
    const data=await response.json();
    const current=data.current;
    const info=weatherInfo(current.weather_code,current.is_day===1);
    weatherIcon.textContent=info.icon;
    splashWeather.textContent=info.icon;
    weatherTitle.textContent=info.title;
    weatherDetail.textContent=info.message;
    temperature.textContent=Math.round(current.temperature_2m)+"°";
    splashText.textContent=info.message;
    createWeatherEffect(info.effect);
  }catch(error){
    weatherTitle.textContent="今天也要好好生活";
    weatherDetail.textContent="天气暂时获取不到";
    temperature.textContent="--°";
  }
}

function requestWeather(){
  if(!navigator.geolocation){weatherTitle.textContent="天气功能不可用";return;}
  navigator.geolocation.getCurrentPosition(
    pos=>loadWeather(pos.coords.latitude,pos.coords.longitude),
    ()=>{
      weatherTitle.textContent="允许定位后显示天气";
      weatherDetail.textContent="天气只用于显示你所在地的实时天气";
      temperature.textContent="--°";
    },
    {enableHighAccuracy:false,timeout:8000,maximumAge:600000}
  );
}

function hideSplash() {
  setTimeout(() => {
    splash.classList.add("hide");

    setTimeout(() => {
      splash.remove();

      document.querySelectorAll(".reveal").forEach((card) => {
        card.classList.add("show");
      });
    }, 700);

  }, 1250);
}

function money(value){
  return "$"+Number(value).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}
function saveTransactions(){localStorage.setItem("transactions",JSON.stringify(transactions));}
function savePaidBills(){localStorage.setItem("paidBills_"+monthKey,JSON.stringify(paidBills));}
function currentMonthTransactions(){
  const now=new Date();
  return transactions.filter(item=>{
    const date=new Date(item.createdAt);
    return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth();
  });
}
function currentBills(){fixedBills[2].amount=insuranceAmount;return fixedBills;}

function markBillPaid(id){
  const bill=currentBills().find(item=>item.id===id);
  if(!bill) return;
  if(bill.id==="insurance"&&bill.amount<=0){openInsuranceModal();return;}
  if(paidBills[id]) return;
  paidBills[id]=true; savePaidBills();
  transactions.unshift({id:Date.now(),type:"expense",amount:bill.amount,category:bill.category,note:bill.name,createdAt:new Date().toISOString(),fixedBillId:bill.id});
  saveTransactions(); renderAll();
}

function renderFixedBills(){
  const bills=currentBills();
  fixedBillsList.innerHTML=bills.map(bill=>{
    const paid=!!paidBills[bill.id];
    const noAmount=bill.id==="insurance"&&bill.amount<=0;
    return `<div class="bill-card">
      <div class="bill-left">
        <div class="bill-icon">${bill.icon}</div>
        <div><p class="bill-name">${bill.name}</p><p class="bill-subtitle">${noAmount?"金额待填写":paid?"本月已支付":bill.subtitle}</p></div>
      </div>
      <div class="bill-right">
        <span class="bill-amount">${noAmount?"待设置":money(bill.amount)}</span>
        ${noAmount?`<button class="bill-pay" onclick="openInsuranceModal()">设置</button>`:paid?`<button class="bill-pay paid">✓ 已支付</button>`:`<button class="bill-pay" onclick="markBillPaid('${bill.id}')">已支付</button>`}
      </div>
    </div>`;
  }).join("");
}

function renderFinancialSummary(){
  const current=currentMonthTransactions();
  let income=0,expense=0;
  current.forEach(item=>{if(item.type==="income") income+=item.amount; else expense+=item.amount;});
  let pending=0,pendingCount=0;
  currentBills().forEach(bill=>{if(!paidBills[bill.id]&&bill.amount>0){pending+=bill.amount;pendingCount++;}});
  const available=income-expense-pending;
  totalIncomeEl.textContent=money(income);
  totalExpenseEl.textContent=money(expense);
  pendingBillsEl.textContent=money(pending);
  availableBalanceEl.textContent=money(available);
  pendingCountEl.textContent=pendingCount===0?"全部完成":`${pendingCount} 笔待付款`;
}

function renderCategorySummary(){
  const expenses=currentMonthTransactions().filter(item=>item.type==="expense");
  const totals={};
  expenses.forEach(item=>{totals[item.category]=(totals[item.category]||0)+item.amount;});
  const sorted=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!sorted.length){categorySummary.innerHTML=`<div class="empty-state">这个月还没有支出</div>`;return;}
  categorySummary.innerHTML=sorted.map(([category,total])=>`
    <div class="category-row">
      <div class="category-info"><div class="bill-icon">${icons[category]||"📦"}</div><span>${category}</span></div>
      <strong>${money(total)}</strong>
    </div>`).join("");
}

function renderTransactions(){
  if(!transactions.length){transactionList.innerHTML=`<div class="empty-state">还没有记录，点右下角 + 记第一笔吧</div>`;return;}
  transactionList.innerHTML=transactions.slice(0,10).map(item=>{
    const date=new Date(item.createdAt);
    const dateText=`${date.getMonth()+1}/${date.getDate()}`;
    return `<div class="transaction">
      <div class="transaction-info">
        <div class="bill-icon">${icons[item.category]||"📦"}</div>
        <div><p class="transaction-title">${item.category}</p><p class="transaction-note">${item.note||"无备注"}</p></div>
      </div>
      <div class="transaction-value">
        <strong class="${item.type}">${item.type==="income"?"+":"-"}${money(item.amount)}</strong>
        <span>${dateText}</span>
      </div>
    </div>`;
  }).join("");
}

function openTransactionModal(category="吃饭"){
  selectedCategory=category;
  transactionModal.classList.remove("hidden");
  document.querySelectorAll("#categoryGrid button").forEach(button=>{
    button.classList.toggle("selected",button.dataset.category===selectedCategory);
  });
  setTimeout(()=>amountInput.focus(),350);
}
function closeTransactionModal(){
  transactionModal.classList.add("hidden");
  amountInput.value="";
  noteInput.value="";
}
function saveTransaction(){
  const amount=Number(amountInput.value);
  if(!amount||amount<=0){alert("请输入正确金额");return;}
  transactions.unshift({id:Date.now(),type:selectedType,amount,category:selectedCategory,note:noteInput.value.trim(),createdAt:new Date().toISOString()});
  saveTransactions(); closeTransactionModal(); renderAll();
}

function openInsuranceModal(){
  document.getElementById("insuranceInput").value=insuranceAmount||"";
  insuranceModal.classList.remove("hidden");
}
function closeInsuranceModal(){insuranceModal.classList.add("hidden");}
function saveInsurance(){
  const value=Number(document.getElementById("insuranceInput").value);
  if(!value||value<=0){alert("请输入正确的车险金额");return;}
  insuranceAmount=value;
  localStorage.setItem("insuranceAmount",insuranceAmount);
  closeInsuranceModal(); renderAll();
}

document.getElementById("floatingAddBtn").addEventListener("click",()=>openTransactionModal());
document.getElementById("saveTransactionBtn").addEventListener("click",saveTransaction);
document.getElementById("closeTransactionModal").addEventListener("click",closeTransactionModal);
document.getElementById("closeInsuranceModal").addEventListener("click",closeInsuranceModal);
document.getElementById("saveInsuranceBtn").addEventListener("click",saveInsurance);

document.querySelectorAll(".type-btn").forEach(button=>{
  button.addEventListener("click",()=>{
    selectedType=button.dataset.type;
    document.querySelectorAll(".type-btn").forEach(item=>item.classList.remove("active"));
    button.classList.add("active");
  });
});
document.querySelectorAll("#categoryGrid button").forEach(button=>{
  button.addEventListener("click",()=>{
    selectedCategory=button.dataset.category;
    document.querySelectorAll("#categoryGrid button").forEach(item=>item.classList.remove("selected"));
    button.classList.add("selected");
  });
});
document.querySelectorAll(".quick-category").forEach(button=>{
  button.addEventListener("click",()=>{
    selectedType="expense";
    document.querySelectorAll(".type-btn").forEach(item=>item.classList.toggle("active",item.dataset.type==="expense"));
    openTransactionModal(button.dataset.category);
  });
});

transactionModal.addEventListener("click",event=>{if(event.target===transactionModal) closeTransactionModal();});
insuranceModal.addEventListener("click",event=>{if(event.target===insuranceModal) closeInsuranceModal();});

function renderAll(){renderFixedBills();renderFinancialSummary();renderCategorySummary();renderTransactions();}

const now=new Date();
document.getElementById("monthLabel").textContent=`${now.getMonth()+1}月`;
updateGreeting();
requestWeather();
renderAll();
hideSplash();
