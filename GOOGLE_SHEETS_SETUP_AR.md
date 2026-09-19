# إعداد نظام Google Sheets + Apps Script — كتالوج بنها 🍯

## أسهل طريقة — خطوة بخطوة

### 1) افتح Google Sheet المرتبط بالفورم

من Google Forms افتح:

**الردود → أيقونة Google Sheets 🟩**

وتأكد أن تجربة الإرسال التي قمت بها موجودة داخل الجدول.

### 2) انسخ Spreadsheet ID

انظر إلى رابط Google Sheets، سيكون مثل:

`https://docs.google.com/spreadsheets/d/1ABC123XYZ456/edit`

انسخ فقط الجزء بين `/d/` و`/edit`:

`1ABC123XYZ456`

### 3) افتح Apps Script

من داخل Google Sheets:

**Extensions / الإضافات → Apps Script**

إذا كان لديك مشروع Apps Script مفتوح بالفعل، استخدمه.

### 4) الصق الكود الجديد بالكامل

افتح الملف:

`google-apps-script-Code.gs`

من هذا المشروع.

انسخ **كل الكود** وضعه بدل كل محتوى `Code.gs` في Apps Script.

### 5) ضع Spreadsheet ID

في بداية الكود ستجد:

```javascript
SPREADSHEET_ID: 'PASTE_YOUR_SPREADSHEET_ID_HERE',
```

استبدل النص داخل علامات الاقتباس بمعرّف Google Sheets الذي نسخته في الخطوة 2.

مثال:

```javascript
SPREADSHEET_ID: '1ABC123XYZ456',
```

لا تضع رابط Google Sheets كاملًا؛ ضع الـ ID فقط.

### 6) احفظ

اضغط **Save 💾**.

### 7) شغّل التهيئة

من قائمة الدوال أعلى Apps Script اختر:

`setupCatalogWorkflow`

ثم اضغط **Run ▶**.

في أول تشغيل سيطلب Google صلاحيات. اختر حساب Google الذي يملك ملف Sheets ثم وافق على الصلاحيات.

### 8) تحقق من Google Sheets

ارجع إلى Google Sheets.

ستجد أعمدة:

- `حالة النشر`
- `ملاحظات الإدارة`
- `تاريخ المراجعة`

كل طلب جديد يبدأ:

`قيد المراجعة`

ومن عمود **حالة النشر** اختر:

- `مقبول` → يظهر في الموقع.
- `مرفوض` → لا يظهر في الموقع.
- `قيد المراجعة` → لا يظهر في الموقع.

### 9) نشر Apps Script كـ Web App

من Apps Script:

**Deploy → New deployment → Web app**

اختر:

- **Execute as:** Me
- **Who has access:** Anyone

ثم **Deploy**.

انسخ رابط `/exec`.

### 10) ربط الموقع

في:

`js/main.js`

ابحث عن:

```javascript
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbyrg0h9dm0-MxQfQ6rmikdpfMUWoSM65ri3BlgbWxeEw2BeOPN-zwaD3-rADN_Mtrxe/exec";
```

ضع رابط Web App:

```javascript
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbyrg0h9dm0-MxQfQ6rmikdpfMUWoSM65ri3BlgbWxeEw2BeOPN-zwaD3-rADN_Mtrxe/exec";
```

ثم ارفع الموقع من جديد.

## إذا ظهر خطأ getSheets

هذا يعني أن Spreadsheet ID غير موجود أو غير صحيح. تأكد من الخطوة 5، ثم شغّل `setupCatalogWorkflow` مرة أخرى.

## ملاحظة مهمة

هذا النظام لا يحتاج تسجيل المستخدمين في موقع كتالوج بنها. Google Form يجمع الطلبات، وGoogle Sheets هي لوحة المراجعة الخاصة بك، والموقع يعرض فقط الطلبات التي اخترت لها `مقبول`.
