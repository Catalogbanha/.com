const rawData = Array.isArray(window.directoryData) ? window.directoryData : (Array.isArray(window.BANHA_DIRECTORY) ? window.BANHA_DIRECTORY : []);

// ضع هنا رابط Google Apps Script بعد نشره كـ Web App.
// اتركه فارغًا الآن وسيستمر الموقع بالعمل بقاعدة البيانات المحلية فقط.
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbyrg0h9dm0-MxQfQ6rmikdpfMUWoSM65ri3BlgbWxeEw2BeOPN-zwaD3-rADN_Mtrxe/exec";

function normalizeBusiness(x, i = 0) {
  return {
    id: x.id ?? x["رقم السجل"] ?? i + 1,
    name: x.name ?? x["اسم النشاط"] ?? "",
    nameEn: x.nameEn ?? x["اسم النشاط بالإنجليزية"] ?? "",
    category: x.category ?? x["الفئة الرئيسية"] ?? "🛍️ المتاجر والخدمات المختلفة",
    subcategory: x.subcategory ?? x["التصنيف الفرعي"] ?? "",
    subcategoryEn: x.subcategoryEn ?? x["التصنيف الفرعي بالإنجليزية"] ?? "",
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
    descriptionEn: x.descriptionEn ?? x["الوصف بالإنجليزية"] ?? "",
    pricesInfo: x.pricesInfo ?? x["معلومات الأسعار"] ?? "",
    onlineOnly: x.onlineOnly ?? x["نشاط إلكتروني فقط"] ?? "",
    verified: x.verified ?? x["موثّق"] ?? "",
    source: x.source ?? x["المصدر"] ?? "",
    lat: x.lat ?? x["خط العرض"] ?? "",
    lng: x.lng ?? x["خط الطول"] ?? "",
    image: x.image ?? x["الصورة"] ?? x["الصور"] ?? "",
    newActivity: x.newActivity ?? false
  };
}

// قاعدة البيانات الأساسية المحلية (350 نشاطًا).
const data = rawData.map((x, i) => normalizeBusiness(x, i));

// الأنشطة التي تمت الموافقة عليها من Google Sheets.
let approvedData = [];
let catalogApiLoaded = false;

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
  {name:"📸 استوديوهات التصوير والتصوير الفوتوغرافي", title:"استوديوهات التصوير والتصوير الفوتوغرافي", image:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=85"},
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
    image:"images/1.jpg",
    link:"https://www.facebook.com/Brilliant.Benha"
  },
  {
    name:"مشويات الونش",
    category:"🍔 المطاعم والكافيهات",
    info:"بنها – وابور التلج · 0133276060 · 01220177123 · توصيل متاح",
    address:"وابور التلج، قسم بنها، بنها، القليوبية",
    phone:"0133276060",
    extra:"مشويات وأكلات شرقية مع خدمة التوصيل",
    image:"images/2.jpg",
    link:"https://www.facebook.com/ElwenshBBQ"
  },
  {
    name:"لمسة جمال",
    category:"💄 مستحضرات التجميل والعناية",
    info:"بنها – شارع الفار · 0133263057",
    address:"القليوبية – بنها – شارع الفار",
    phone:"0133263057",
    extra:"متجر مستحضرات تجميل وعناية، وليس مركز تجميل",
    image:"images/3.jpg",
    link:"https://www.facebook.com/lamset.gamal.banha"
  },
  {
    name:"صيدليات العماوي",
    category:"💊 الصيدليات",
    info:"بنها – اتريب – طريق الموقف · أبراج الأمل برج ب · الخط الساخن 15656",
    address:"بنها – اتريب – طريق الموقف – أبراج الأمل برج ب",
    phone:"15656",
    extra:"صيدليات وخدمات رعاية صحية وتجميلية، مع فروع وخدمات متعددة",
    image:"images/4.png",
    link:"https://www.facebook.com/elamawypharmacies",
    website:"https://elamawypharmacies.com/",
    linkType:"facebook"
  },
  {
    name:"وليد عادل ستوديو",
    nameEn:"Waleed Adel Studios",
    category:"📸 استوديوهات التصوير والتصوير الفوتوغرافي",
    info:"استوديو تصوير فوتوغرافي · Photography Studio",
    address:"بنها – مصر",
    phone:"01282010102",
    whatsapp:"01282010102",
    extra:"استوديو متخصص في التصوير الفوتوغرافي وتجهيز جلسات التصوير · Photography studio for professional photo sessions",
    image:"images/activity-waleed-adel-studios.png",
    link:"https://vimeo.com/1190700075",
    website:"https://vimeo.com/1190700075",
    linkType:"portfolio"
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
  facebook: ad.linkType === "facebook" ? ad.link : "",
  instagram: "",
  website: ad.website || (ad.linkType === "portfolio" ? ad.link : ""),
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
  // نضيف الأنشطة المقبولة من Google Sheets دون حذف قاعدة البيانات المحلية.
  const names = new Set();
  const merged = [];
  [...data, ...approvedData, ...featuredDirectory].forEach(item => {
    const key = String(item.name || "").trim().toLocaleLowerCase("ar");
    if (!key || names.has(key)) return;
    names.add(key);
    merged.push(item);
  });
  return merged.map(x => {
    const copy = {...x};
    // إذا كان النشاط إلكترونيًا فقط يمكنه الظهور أيضًا في قسم الأعمال من المنزل والأونلاين.
    if (String(copy.onlineOnly||"").toLowerCase() === "true" || String(copy.onlineOnly||"").trim() === "نعم" || String(copy.onlineOnly||"").includes("أونلاين") || String(copy.onlineOnly||"").includes("اونلاين") || String(copy.onlineOnly||"").includes("من المنزل")) {
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
function renderHomeFeaturedAds(){
  const box=document.getElementById("homeFeaturedAds");
  if(box){
    box.innerHTML=ads.map((ad,i)=>{
      const isPortfolio=ad.linkType==='portfolio';
      const summary=ad.extra || ad.info || '';
      const info=ad.info || '';
      const phone=ad.phone || '';
      return `<article class="home-distinguished-card">
        <div class="home-distinguished-photo">
          <img src="${esc(ad.image)}" alt="${esc(ad.name)}" loading="lazy">
          <span class="home-distinguished-badge"><i class="fa-solid fa-star"></i> نشاط مميز</span>
          <span class="home-distinguished-category">${esc(ad.category||'')}</span>
        </div>
        <div class="home-distinguished-body">
          <h3>${esc(ad.name)}</h3>
          ${ad.nameEn?`<div class="home-ad-en" dir="ltr">${esc(ad.nameEn)}</div>`:''}
          <p class="home-distinguished-summary">${esc(summary)}</p>
          <div class="home-distinguished-info"><i class="fa-solid fa-circle-info"></i><span>${esc(info)}</span></div>
          ${phone?`<div class="home-distinguished-phone"><i class="fa-solid fa-phone"></i><span>${esc(phone)}</span></div>`:''}
          <div class="home-distinguished-actions">
            <a class="btn btn-honey rounded-pill" href="${esc(ad.link)}" target="_blank" rel="noopener"><i class="${isPortfolio?'fa-solid fa-play':'fa-brands fa-facebook-f'}"></i> ${isPortfolio?'معرض الأعمال':'صفحة النشاط'}</a>
            ${phone?`<a class="btn btn-outline-honey rounded-pill" href="tel:${esc(phone)}"><i class="fa-solid fa-phone"></i> اتصال</a>`:''}
          </div>
        </div>
      </article>`;
    }).join('');
  }
  const newBox=document.getElementById("homeNewActivities");
  if(!newBox) return;
  const newItems=sortByCompleteness(catalogData().filter(x=>x.newActivity));
  newBox.innerHTML=newItems.length ? newItems.map(item=>{
    const uid=registerBusiness(item);
    const name=cleanName(item.name), phone=phoneHref(item.phone), img=imgFor(item);
    const category=String(item.category||'').replace(/^\S+\s*/, '');
    return `<article class="home-new-activity-card">
      <div class="home-new-activity-photo"><img src="${esc(img)}" alt="${esc(name)}" loading="lazy"><span>جديد</span></div>
      <div class="home-new-activity-body">
        <div class="home-new-activity-category">${esc(category)}</div>
        <h4>${esc(name)}</h4>
        ${item.nameEn?`<div class="home-new-activity-en" dir="ltr">${esc(item.nameEn)}</div>`:''}
        ${item.address?`<div class="home-new-activity-meta"><i class="fa-solid fa-location-dot"></i>${esc(item.address)}</div>`:''}
        ${phone?`<div class="home-new-activity-meta"><i class="fa-solid fa-phone"></i>${esc(item.phone)}</div>`:''}
        <button type="button" class="btn btn-sm btn-outline-honey rounded-pill home-new-details" data-business-id="${uid}">التفاصيل</button>
      </div>
    </article>`;
  }).join('') : '<div class="catalog-empty"><p>لا توجد أنشطة جديدة حاليًا.</p></div>';
}

function renderAds(){
  const slider=document.getElementById("heroSlider");
  slider.innerHTML=ads.map((ad,i)=>`<article class="hero-slide ${i===0?'active':''}" style="background-image:linear-gradient(90deg,rgba(3,28,20,.82),rgba(3,28,20,.20)),url('${ad.image}')"><div class="hero-content"><span class="hero-number">إعلان ${i+1} من ${ads.length}</span><span class="hero-category">${esc(ad.category)}</span><h1>${esc(ad.name)}</h1><p class="hero-main-info">${esc(ad.info)}</p><div class="hero-facts"><span><i class="fa-solid fa-location-dot"></i> ${esc(ad.address)}</span><span><i class="fa-solid fa-phone"></i> ${esc(ad.phone)}</span><span><i class="fa-solid fa-circle-info"></i> ${esc(ad.extra)}</span></div><a class="btn btn-honey btn-lg rounded-pill" href="${ad.link}" target="_blank" rel="noopener"><i class="${ad.linkType==='portfolio'?'fa-solid fa-play':'fa-brands fa-facebook-f'}"></i> ${ad.linkType==='portfolio'?'شاهد معرض الأعمال · View Portfolio':'شاهد النشاط على فيسبوك'}</a></div></article>`).join("");
  const dots=document.getElementById("heroDots");dots.innerHTML=ads.map((_,i)=>`<button class="hero-dot ${i===0?'active':''}" data-index="${i}" aria-label="الإعلان ${i+1}"></button>`).join("");
  dots.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>goAd(Number(b.dataset.index))));
  updateAdProgress();
}
function goAd(index){
  adIndex=(index+ads.length)%ads.length;
  document.querySelectorAll(".hero-slide").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
  document.querySelectorAll(".hero-dot").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
  updateAdProgress(); restartAdTimer();
}
function updateAdProgress(){const bar=document.getElementById("heroProgressBar");if(!bar)return;bar.style.animation="none";void bar.offsetWidth;bar.style.animation=`heroProgress ${adDuration}ms linear forwards`;}
function restartAdTimer(){
  clearTimeout(adTimer);
  adTimer=setTimeout(()=>{
    adIndex=(adIndex+1)%ads.length;
    document.querySelectorAll(".hero-slide").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
    document.querySelectorAll(".hero-dot").forEach((el,i)=>el.classList.toggle("active",i===adIndex));
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
    const newDiff=Number(Boolean(b.newActivity))-Number(Boolean(a.newActivity));
    if(newDiff!==0) return newDiff;
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
  return `<div class="col-md-6 col-xl-4"><article class="business-card"><div class="card-photo"><img src="${imgFor(item)}" alt="${esc(name)}" loading="lazy">${item.newActivity?'<b class="new-activity-badge">جديد</b>':''}<span>${esc((item.subcategory||item.category||"").replace(/^\S+\s*/,""))}</span></div><div class="card-body"><div class="completeness-badge"><i class="fa-solid fa-circle-check"></i> معلومات مكتملة: ${completenessScore(item)} / 13</div><h3>${esc(name)}</h3>${item.nameEn?`<div class="card-en-name">${esc(item.nameEn)}</div>`:""}${item.address?`<div class="card-meta"><i class="fa-solid fa-location-dot"></i>${esc(item.address)}</div>`:""}${item.prices?`<div class="card-meta"><i class="fa-solid fa-tags"></i>${esc(item.prices)}</div>`:""}<div class="card-actions"><button type="button" class="btn btn-honey rounded-pill business-details-btn" data-business-id="${uid}">التفاصيل</button>${phone?`<a class="icon-action" href="tel:${phone}"><i class="fa-solid fa-phone"></i></a>`:""}${wa?`<a class="icon-action" href="${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i></a>`:""}${map?`<a class="icon-action" href="${esc(map)}" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i></a>`:""}</div></div></article></div>`;
}

window.showBusiness=function(item){
  const phone=phoneHref(item.phone),wa=whatsappHref(item),map=mapHref(item);
  const modalGrid=document.getElementById("catalogGrid");
  const title=document.getElementById("catalogModalTitle");
  if(!modalGrid || !title) return;
  title.textContent=cleanName(item.name);
  modalGrid.innerHTML=`<div class="col-12"><div class="detail-card"><img src="${imgFor(item)}" alt="${esc(cleanName(item.name))}"><div><span class="modal-kicker">${esc(item.category||"")}</span><h2>${esc(cleanName(item.name))}</h2>${item.nameEn?`<p class="detail-en-name">${esc(item.nameEn)}</p>`:""}${item.subcategory?`<p>${esc(item.subcategory)}${item.subcategoryEn?` · ${esc(item.subcategoryEn)}`:""}</p>`:""}${item.address?`<p><i class="fa-solid fa-location-dot"></i> ${esc(item.address)}</p>`:""}${item.phone?`<p><i class="fa-solid fa-phone"></i> ${esc(item.phone)}</p>`:""}${item.whatsapp?`<p><i class="fa-brands fa-whatsapp"></i> ${esc(item.whatsapp)}</p>`:""}${item.hours?`<p><i class="fa-regular fa-clock"></i> ${esc(item.hours)}</p>`:""}${item.prices?`<p><i class="fa-solid fa-tags"></i> ${esc(item.prices)}</p>`:""}${item.pricesInfo?`<p><i class="fa-solid fa-tag"></i> ${esc(item.pricesInfo)}</p>`:""}${item.description?`<p>${esc(item.description)}</p>`:""}${item.descriptionEn?`<p class="detail-en-description" dir="ltr">${esc(item.descriptionEn)}</p>`:""}<div class="modal-actions">${phone?`<a class="btn btn-honey rounded-pill" href="tel:${phone}">اتصال</a>`:""}${wa?`<a class="btn btn-success rounded-pill" href="${wa}" target="_blank" rel="noopener">واتساب</a>`:""}${map?`<a class="btn btn-outline-honey rounded-pill" href="${esc(map)}" target="_blank" rel="noopener">الخريطة</a>`:""}${item.facebook?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.facebook)}" target="_blank" rel="noopener">فيسبوك</a>`:""}${item.instagram?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.instagram)}" target="_blank" rel="noopener">إنستغرام</a>`:""}${item.website?`<a class="btn btn-outline-honey rounded-pill" href="${esc(item.website)}" target="_blank" rel="noopener">الموقع</a>`:""}</div><button type="button" class="btn btn-link mt-3" data-close-business-detail>← العودة إلى القائمة</button></div></div></div>`;
  document.getElementById("catalogEmpty")?.classList.add("d-none");
  const modalEl=document.getElementById("catalogModal");
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
};

function showBusinessById(uid){
  const item=businessStore.get(uid);
  if(item) window.showBusiness(item);
}

function loadApprovedBusinesses(){
  if(!CATALOG_API_URL.trim() || catalogApiLoaded) return;

  const callbackName = `__banhaCatalogCallback_${Date.now()}_${Math.floor(Math.random()*100000)}`;
  const script = document.createElement("script");
  const separator = CATALOG_API_URL.includes("?") ? "&" : "?";
  const timeout = setTimeout(()=>{
    cleanup();
    console.warn("كتالوج بنها: انتهت مهلة تحميل الأنشطة المقبولة من Google Sheets.");
  }, 12000);

  function cleanup(){
    clearTimeout(timeout);
    try { delete window[callbackName]; } catch(_) { window[callbackName] = undefined; }
    script.remove();
  }

  window[callbackName] = payload => {
    cleanup();
    if(!payload || payload.ok !== true || !Array.isArray(payload.items)) {
      console.warn("كتالوج بنها: استجابة Google Apps Script غير صالحة.");
      return;
    }
    approvedData = payload.items.map((item, i)=>normalizeBusiness(item, `submitted-${i+1}`));
    catalogApiLoaded = true;
    renderCategories();
    renderAllBusinesses();
    if(document.getElementById("catalogModal")?.classList.contains("show") && activeCategory) renderCatalogItems();
  };

  script.onerror = ()=>{
    cleanup();
    console.warn("كتالوج بنها: تعذر الاتصال بخدمة Google Apps Script.");
  };
  script.src = CATALOG_API_URL.trim() + separator + "callback=" + encodeURIComponent(callbackName);
  script.async = true;
  document.head.appendChild(script);
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
  try { renderAds(); renderHomeFeaturedAds(); renderCategories(); renderAllBusinesses(); setupGoogleForm(); restartAdTimer(); loadApprovedBusinesses(); } catch(err) { console.error("كتالوج بنها:", err); restartAdTimer(); }
  document.getElementById("heroPrev").onclick=()=>goAd(adIndex-1);
  document.getElementById("heroNext").onclick=()=>goAd(adIndex+1);
  document.getElementById("catalogSearch").addEventListener("input",renderCatalogItems);
  document.addEventListener("click",(e)=>{
    const btn=e.target.closest(".business-details-btn, .home-new-details");
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
