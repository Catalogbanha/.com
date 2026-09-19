const rawData = Array.isArray(window.directoryData) ? window.directoryData : (Array.isArray(window.BANHA_DIRECTORY) ? window.BANHA_DIRECTORY : []);

// تحويل سجلات ملف البيانات العربي إلى الشكل الذي تستخدمه واجهة الموقع.
const data = rawData.map((x, i) => ({
  id: x.id ?? x["رقم السجل"] ?? i + 1,
  name: x.name ?? x["اسم النشاط"] ?? "",
  category: x.category ?? x["الفئة الرئيسية"] ?? "🛍️ المتاجر والخدمات المختلفة",
  subcategory: x.subcategory ?? x["التصنيف الفرعي"] ?? "",
  originalType: x.originalType ?? x["نوع النشاط الأصلي"] ?? "",
  address: x.address ?? x["العنوان"] ?? "",
  phone: x.phone ?? x["الهاتف"] ?? "",
  whatsapp: x.whatsapp ?? x["واتساب"] ?? "",
  facebook: x.facebook ?? x["فيسبوك"] ?? "",
  instagram: x.instagram ?? x["إنستغرام"] ?? "",
  website: x.website ?? x["الموقع الإلكتروني"] ?? "",
  hours: x.hours ?? x["مواعيد العمل"] ?? "",
  rating: x.rating ?? x["تقييم جوجل"] ?? "",
  reviews: x.reviews ?? x["عدد مراجعات جوجل"] ?? "",
  prices: x.prices ?? x["نطاق الأسعار"] ?? "",
  maps: x.maps ?? x["رابط خرائط جوجل"] ?? "",
  description: x.description ?? x["الوصف"] ?? "",
  pricesInfo: x.pricesInfo ?? x["معلومات الأسعار"] ?? "",
  onlineOnly: x.onlineOnly ?? x["نشاط إلكتروني فقط"] ?? "",
  verified: x.verified ?? x["موثّق"] ?? "",
  source: x.source ?? x["المصدر"] ?? "",
  lat: x.lat ?? x["خط العرض"] ?? "",
  lng: x.lng ?? x["خط الطول"] ?? "",
  image: x.image ?? x["الصورة"] ?? ""
}));

// التصنيفات الأساسية ثابتة حتى تظهر التصنيفات الخالية من البيانات أيضًا.
const allCategories = [
  {name:"🍔 المطاعم والكافيهات", title:"المطاعم والكافيهات", image:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85"},
  {name:"👗 محلات الملابس والأحذية", title:"الملابس والأحذية", image:"https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85"},
  {name:"📱 محلات الموبايلات والإلكترونيات", title:"الموبايلات والإلكترونيات", image:"https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1400&q=85"},
  {name:"🚗 السيارات وقطع الغيار والخدمات المتعلقة بها", title:"السيارات وقطع الغيار", image:"https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=85"},
  {name:"🏠 الأثاث والأجهزة المنزلية", title:"الأثاث والأجهزة المنزلية", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85"},
  {name:"💊 الصيدليات", title:"الصيدليات", image:"https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1400&q=85"},
  {name:"🏥 العيادات والمراكز الطبية", title:"العيادات والمراكز الطبية", image:"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=85"},
  {name:"💄 مراكز التجميل والكوافير", title:"مراكز التجميل والكوافير", image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=85"},
  {name:"💄 مستحضرات التجميل والعناية", title:"مستحضرات التجميل والعناية", image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85"},
  {name:"📚 مراكز التعليم والدروس", title:"التعليم والدروس", image:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85"},
  {name:"🦷 عيادات الأسنان", title:"عيادات الأسنان", image:"https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1400&q=85"},
  {name:"💇 الحلاقين ومراكز العناية", title:"الحلاقين ومراكز العناية", image:"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1400&q=85"},
  {name:"🛍️ المتاجر والخدمات المختلفة", title:"المتاجر والخدمات المختلفة", image:"https://lirp.cdn-website.com/b0bcf014/dms3rep/multi/opt/Examples-of-Industries-That-Depend-On-Yelp-Reviews-and-Ratings-v2-640w.png"},
  {name:"🛠️ الحرفيون والعمال", title:"الحرفيون والعمال", image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1400&q=85"},
  {name:"🏠 أعمال من المنزل والبيع أونلاين", title:"أعمال من المنزل والبيع أونلاين", image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85"}
];

// رابط Google Form الخاص بطلبات إضافة الأنشطة.
// بعد إنشاء النموذج في Google Forms، ضع رابط "إرسال النموذج" هنا.
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScr0NRrNL14XN_-EXYRQTvSfWQrGjgmiyxkpP5vzg068BrQqQ/viewform?usp=publish-editor";

const ads = [
  {
    name:"Brilliant Dental Clinic – برليانت لطب الأسنان",
    category:"🦷 عيادات الأسنان",
    info:"بنها – الفلل – الميدان · أمام صيدلية الكورنيش وكافيه Craffel · 01028212499",
    address:"بنها، الفلل، الميدان، أمام صيدلية الكورنيش وكافيه Craffel",
    phone:"01028212499",
    extra:"عيادة متخصصة في خدمات طب الأسنان وتجميل الأسنان",
    image:"https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=2200&q=90",
    link:"https://www.facebook.com/Brilliant.Benha"
  },
  {
    name:"مشويات الونش",
    category:"🍔 المطاعم والكافيهات",
    info:"بنها – وابور التلج · 0133276060 · 01220177123 · توصيل متاح",
    address:"وابور التلج، قسم بنها، بنها، القليوبية",
    phone:"0133276060",
    extra:"مشويات وأكلات شرقية مع خدمة التوصيل",
    image:"https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2200&q=90",
    link:"https://www.facebook.com/ElwenshBBQ"
  },
  {
    name:"لمسة جمال",
    category:"💄 مستحضرات التجميل والعناية",
    info:"بنها – شارع الفار · 0133263057",
    address:"القليوبية – بنها – شارع الفار",
    phone:"0133263057",
    extra:"متجر مستحضرات تجميل وعناية، وليس مركز تجميل",
    image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=2200&q=90",
    link:"https://www.facebook.com/lamset.gamal.banha"
  },
  {
    name:"صيدليات العماوي",
    category:"💊 الصيدليات",
    info:"بنها – اتريب – طريق الموقف · أبراج الأمل برج ب · الخط الساخن 15656",
    address:"بنها – اتريب – طريق الموقف – أبراج الأمل برج ب",
    phone:"15656",
    extra:"صيدليات وخدمات رعاية صحية وتجميلية، مع فروع وخدمات متعددة",
    image:"https://elamawypharmacies.com/images/pharmacist_1.png",
    link:"https://www.facebook.com/elamawypharmacies",
    website:"https://elamawypharmacies.com/"
  }
];


// الأنشطة المميزة تظهر أيضًا داخل التصنيف الخاص بها، حتى لو لم تكن موجودة في قاعدة البيانات الأصلية.
const featuredDirectory = ads.map((ad, i) => ({
  id: `featured-${i+1}`,
  name: ad.name,
  category: ad.category,
  subcategory: ad.category.replace(/^\S+\s*/, ""),
  address: ad.address,
  phone: ad.phone,
  whatsapp: "",
  facebook: ad.link,
  instagram: "",
  website: ad.website || "",
  hours: "",
  rating: "",
  reviews: "",
  prices: "",
  maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ad.address),
  description: ad.extra,
  pricesInfo: "",
  onlineOnly: "",
  verified: "مميز",
  source: "إعلان مميز",
  lat: "",
  lng: "",
  image: ad.image,
  featured: true
}));

function catalogData(){
  // نضيف المميزين مرة واحدة فقط، ونبقي البيانات الأصلية كما هي.
  const names = new Set(data.map(x => String(x.name||"").trim()));
  const merged = [...data, ...featuredDirectory.filter(x => !names.has(x.name.trim()))];
  return merged.map(x => {
    const copy = {...x};
    // إذا كان النشاط إلكترونيًا فقط يمكنه الظهور أيضًا في قسم الأعمال من المنزل والأونلاين.
    if (String(copy.onlineOnly||"").toLowerCase() === "true" || String(copy.onlineOnly||"").trim() === "نعم") {
      copy.secondaryCategory = "🏠 أعمال من المنزل والبيع أونلاين";
    }
    return copy;
  });
}

const fallbackImages = Object.fromEntries(allCategories.map(x=>[x.name,x.image]));
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function cleanName(name){return String(name||"").replace(/\b(cafa|cafe)\b/gi,"كافيه").replace(/\brestaurant\b/gi,"مطعم").replace(/\bmobile\b/gi,"موبايل").replace(/\bcenter\b/gi,"مركز").replace(/\bmarket\b/gi,"ماركت").replace(/\bclinic\b/gi,"عيادة").replace(/\bpharmacy\b/gi,"صيدلية");}
function imgFor(item){return item.image || fallbackImages[item.category] || allCategories.find(c=>c.name===item.category)?.image || fallbackImages["🛍️ المتاجر والخدمات المختلفة"];}
function phoneHref(phone){return String(phone||"").replace(/[^\d+]/g,"");}
function whatsappHref(item){let n=String(item.whatsapp||item.phone||"").replace(/[^\d]/g,"");if(!n)return "";if(n.startsWith("00"))n=n.slice(2);if(n.startsWith("0"))n="20"+n.slice(1);if(!n.startsWith("20")&&n.length<=11)n="20"+n;return "https://wa.me/"+n;}
function mapHref(item){if(item.maps)return item.maps;if(item.lat&&item.lng)return `https://www.google.com/maps?q=${item.lat},${item.lng}`;if(item.address)return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(item.address);return "";}

// ---------- إعلانات الصفحة الرئيسية ----------
let adIndex=0, adTimer=null, adDuration=5000;
function renderAds(){
  const slider=document.getElementById("adSlider");
  slider.innerHTML=ads.map((ad,i)=>`<article class="ad-slide ${i===0?'active':''}" style="background-image:linear-gradient(90deg,rgba(3,28,20,.82),rgba(3,28,20,.20)),url('${ad.image}')"><div class="ad-content"><span class="ad-number">إعلان ${i+1} من ${ads.length}</span><span class="ad-category">${esc(ad.category)}</span><h1>${esc(ad.name)}</h1><p class="ad-main-info">${esc(ad.info)}</p><div class="ad-facts"><span><i class="fa-solid fa-location-dot"></i> ${esc(ad.address)}</span><span><i class="fa-solid fa-phone"></i> ${esc(ad.phone)}</span><span><i class="fa-solid fa-circle-info"></i> ${esc(ad.extra)}</span></div><a class="btn btn-honey btn-lg rounded-pill" href="${ad.link}" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i> شاهد النشاط على فيسبوك</a></div></article>`).join("");
  const dots=document.getElementById("adDots");dots.innerHTML=ads.map((_,i)=>`<button class="ad-dot ${i===0?'active':''}" data-index="${i}" aria-label="الإعلان ${i+1}"></button>`).join("");
  dots.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>goAd(Number(b.dataset.index))));
  updateAdProgress();
}
function goAd(index){
  adIndex=(index+ads.length)%ads.length;
  document.querySelectorAll(".ad-slide").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
  document.querySelectorAll(".ad-dot").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
  updateAdProgress(); restartAdTimer();
}
function updateAdProgress(){const bar=document.getElementById("adProgressBar");if(!bar)return;bar.style.animation="none";void bar.offsetWidth;bar.style.animation=`adProgress ${adDuration}ms linear forwards`;}
function restartAdTimer(){
  clearTimeout(adTimer);
  adTimer=setTimeout(()=>{
    adIndex=(adIndex+1)%ads.length;
    document.querySelectorAll(".ad-slide").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
    document.querySelectorAll(".ad-dot").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
    updateAdProgress();
    restartAdTimer();
  },adDuration);
}

function completenessScore(item){
  const fields = [item.name,item.address,item.phone,item.whatsapp,item.facebook,item.instagram,item.website,item.hours,item.description,item.prices,item.pricesInfo,item.image,item.maps];
  return fields.reduce((score,v)=>score+(String(v||"").trim()?1:0),0);
}
function sortByCompleteness(items){
  return [...items].sort((a,b)=>{
    const scoreDiff=completenessScore(b)-completenessScore(a);
    if(scoreDiff!==0) return scoreDiff;
    const ratingDiff=(parseFloat(b.rating)||0)-(parseFloat(a.rating)||0);
    if(ratingDiff!==0) return ratingDiff;
    return String(a.name||"").localeCompare(String(b.name||""),"ar");
  });
}

// ---------- التصنيفات ----------
function renderCategories(){
  const grid=document.getElementById("categoryGrid");
  grid.innerHTML=allCategories.map((cat,i)=>{
    const count=catalogData().filter(x=>x.category===cat.name || x.secondaryCategory===cat.name).length;
    return `<button class="category-tile" data-category="${esc(cat.name)}" style="background-image:linear-gradient(0deg,rgba(0,30,20,.86),rgba(0,30,20,.10)),url('${cat.image}')">
      <span class="tile-icon">${cat.name.match(/^\S+/)?.[0]||"📌"}</span><div class="tile-info"><h2>${esc(cat.title)}</h2><p>${count?`${count} نشاط مسجل`:'لا توجد بيانات حاليًا — أضف نشاطك أولًا'}</p><span class="tile-button">استكشف التصنيف <i class="fa-solid fa-arrow-left"></i></span></div>
    </button>`;
  }).join("");
  grid.querySelectorAll(".category-tile").forEach(btn=>btn.addEventListener("click",()=>openCatalog(btn.dataset.category)));
}

let activeCategory="";
let detailReturnMode="category";
function openCatalog(category){
  activeCategory=category;
  document.getElementById("catalogModalTitle").textContent=(allCategories.find(c=>c.name===category)?.title||category);
  document.getElementById("catalogSearch").value="";
  renderCatalogItems();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("catalogModal")).show();
}
function renderAllBusinesses(){
  detailReturnMode="all";
  const grid = document.getElementById("allBusinessGrid");
  if(!grid) return;
  const q=(document.getElementById("allSearch")?.value||"").trim().toLowerCase();
  let items=catalogData();
  if(q){ items=items.filter(x=>[x.name,x.subcategory,x.category,x.address,x.description,x.prices,x.pricesInfo].join(" ").toLowerCase().includes(q)); }
  const featured=items.filter(x=>x.featured);
  const rest=sortByCompleteness(items.filter(x=>!x.featured));
  items=[...featured,...rest];
  const count=document.getElementById("allCount"); if(count) count.textContent=`${items.length} نشاط`;
  const empty=document.getElementById("allEmpty"); if(empty) empty.classList.toggle("d-none",items.length>0);
  grid.innerHTML=items.map(card).join("");
}

function renderCatalogItems(){
  detailReturnMode="category";
  const q=document.getElementById("catalogSearch").value.trim().toLowerCase();
  const filtered=catalogData().filter(x=>{
    const inCategory=x.category===activeCategory || x.secondaryCategory===activeCategory;
    const text=[x.name,x.subcategory,x.address,x.description,x.prices,x.pricesInfo].join(" ").toLowerCase();
    return inCategory && text.includes(q);
  });
  const featured=filtered.filter(x=>x.featured);
  const rest=sortByCompleteness(filtered.filter(x=>!x.featured));
  const items=[...featured,...rest];
  document.getElementById("catalogCount").textContent=`${items.length} نشاط`;
  document.getElementById("catalogEmpty").classList.toggle("d-none",items.length>0);
  document.getElementById("catalogGrid").innerHTML=items.map(card).join("");
}

const businessStore = new Map();
let businessUid = 0;
function registerBusiness(item){
  const uid = `biz-${++businessUid}`;
  businessStore.set(uid, item);
  return uid;
}

function card(item){
  const uid=registerBusiness(item);
  const name=cleanName(item.name),phone=phoneHref(item.phone),wa=whatsappHref(item),map=mapHref(item);
  return `<div class="col-md-6 col-xl-4"><article class="business-card"><div class="card-photo"><img src="${imgFor(item)}" alt="${esc(name)}" loading="lazy"><span>${esc((item.subcategory||item.category||"").replace(/^\S+\s*/,""))}</span></div><div class="card-body"><div class="completeness-badge"><i class="fa-solid fa-circle-check"></i> معلومات مكتملة: ${completenessScore(item)} / 13</div><h3>${esc(name)}</h3>${item.address?`<div class="card-meta"><i class="fa-solid fa-location-dot"></i>${esc(item.address)}</div>`:""}${item.prices?`<div class="card-meta"><i class="fa-solid fa-tags"></i>${esc(item.prices)}</div>`:""}<div class="card-actions"><button type="button" class="btn btn-honey rounded-pill business-details-btn" data-business-id="${uid}">التفاصيل</button>${phone?`<a class="icon-action" href="tel:${phone}"><i class="fa-solid fa-phone"></i></a>`:""}${wa?`<a class="icon-action" href="${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i></a>`:""}${map?`<a class="icon-action" href="${esc(map)}" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i></a>`:""}</div></div></article></div>`;
}

window.showBusiness=function(item){
  const phone=phoneHref(item.phone),wa=whatsappHref(item),map=mapHref(item);
  const modalGrid=document.getElementById("catalogGrid");
  const title=document.getElementById("catalogModalTitle");
  if(!modalGrid || !title) return;
  title.textContent=cleanName(item.name);
  modalGrid.innerHTML=`<div class="col-12"><div class="detail-card"><img src="${imgFor(item)}" alt="${esc(cleanName(item.name))}"><div><span class="modal-kicker">${esc(item.category||"")}</span><h2>${esc(cleanName(item.name))}</h2>${item.subcategory?`<p>${esc(item.subcategory)}</p>`:""}${item.address?`<p><i class="fa-solid fa-location-dot"></i> ${esc(item.address)}</p>`:""}${item.phone?`<p><i class="fa-solid fa-phone"></i> ${esc(item.phone)}</p>`:""}${item.whatsapp?`<p><i class="fa-brands fa-whatsapp"></i> ${esc(item.whatsapp)}</p>`:""}${item.hours?`<p><i class="fa-regular fa-clock"></i> ${esc(item.hours)}</p>`:""}${item.prices?`<p><i class="fa-solid fa-tags"></i> ${esc(item.prices)}</p>`:""}${item.pricesInfo?`<p><i class="fa-solid fa-tag"></i> ${esc(item.pricesInfo)}</p>`:""}${item.description?`<p>${esc(item.description)}</p>`:""}<div class="modal-actions">${phone?`<a class="btn btn-honey rounded-pill" href="tel:${phone}">اتصال</a>`:""}${wa?`<a class="btn btn-success rounded-pill" href="${wa}" target="_blank" rel="noopener">واتساب</a>`:""}${map?`<a class="btn btn-outline-honey rounded-pill" href="${esc(map)}" target="_blank" rel="noopener">الخريطة</a>`:""}${item.facebook?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.facebook)}" target="_blank" rel="noopener">فيسبوك</a>`:""}${item.instagram?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.instagram)}" target="_blank" rel="noopener">إنستغرام</a>`:""}${item.website?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.website)}" target="_blank" rel="noopener">الموقع</a>`:""}</div><button type="button" class="btn btn-link mt-3" data-close-business-detail>← العودة إلى القائمة</button></div></div></div>`;
  document.getElementById("catalogEmpty")?.classList.add("d-none");
  const modalEl=document.getElementById("catalogModal");
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
};

function showBusinessById(uid){
  const item=businessStore.get(uid);
  if(item) window.showBusiness(item);
}

function setupGoogleForm(){
  const btn=document.getElementById("googleFormButton");
  const hint=document.getElementById("googleFormHint");
  if(!btn) return;
  if(GOOGLE_FORM_URL.trim()){
    btn.href=GOOGLE_FORM_URL.trim();
    btn.removeAttribute("aria-disabled");
    if(hint) hint.textContent="سيتم فتح نموذج إضافة النشاط في صفحة جديدة، وبعد الإرسال يصل الطلب إلى جدول المراجعة.";
  }else{
    btn.href="#";
    btn.setAttribute("aria-disabled","true");
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      alert("نموذج إضافة النشاط غير متاح حاليًا. يرجى المحاولة مرة أخرى لاحقًا.");
    });
    if(hint) hint.textContent="سيتم فتح نموذج Google Forms لإرسال بيانات نشاطك، وبعد المراجعة والموافقة يمكن نشر النشاط في الكتالوج.";
  }
}

function init(){
  document.getElementById("year").textContent=new Date().getFullYear();
  try { renderAds(); renderCategories(); renderAllBusinesses(); setupGoogleForm(); restartAdTimer(); } catch(err) { console.error("كتالوج بنها:", err); restartAdTimer(); }
  document.getElementById("adPrev").onclick=()=>goAd(adIndex-1);
  document.getElementById("adNext").onclick=()=>goAd(adIndex+1);
  document.getElementById("catalogSearch").addEventListener("input",renderCatalogItems);
  document.addEventListener("click",(e)=>{
    const btn=e.target.closest(".business-details-btn");
    if(btn){ e.preventDefault(); showBusinessById(btn.dataset.businessId); return; }
    const back=e.target.closest("[data-close-business-detail]");
    if(back){
      if(detailReturnMode === "all"){
        bootstrap.Modal.getOrCreateInstance(document.getElementById("catalogModal")).hide();
      } else {
        renderCatalogItems();
      }
    }
  });
  const allSearch = document.getElementById("allSearch"); if(allSearch) allSearch.addEventListener("input",renderAllBusinesses);
  document.getElementById("backTop").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
  window.addEventListener("scroll",()=>document.getElementById("backTop").classList.toggle("show",window.scrollY>600));
  setTimeout(()=>{ const loader=document.getElementById("loader"); if(loader) loader.classList.add("hide"); },350);
}
document.addEventListener("DOMContentLoaded",init);
