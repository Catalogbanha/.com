كتالوج بنها 🍯
================

هذا الإصدار يحتوي على:
- قاعدة البيانات المحلية الكاملة بعد إزالة التكرارات.
- الإعلانات الرئيسية الأربعة وتدويرها كل 5 ثوانٍ.
- جميع التصنيفات المطلوبة.
- نموذج Google Forms لإضافة الأنشطة بدون حساب داخل موقع الكتالوج.
- نظام مراجعة ونشر باستخدام Google Sheets + Google Apps Script.
- الأنشطة التي توافق عليها فقط تظهر تلقائيًا في الكتالوج.

Google Form المستخدم:
https://docs.google.com/forms/d/e/1FAIpQLScr0NRrNL14XN_-EXYRQTvSfWQrGjgmiyxkpP5vzg068BrQqQ/viewform?usp=publish-editor

نظام الموافقة:
1. يرسل صاحب النشاط النموذج.
2. يظهر الطلب في Google Sheets بحالة «قيد المراجعة».
3. تراجع البيانات من Google Sheets.
4. اختر «مقبول» لنشر النشاط أو «مرفوض» لمنع نشره.
5. الموقع يقرأ «مقبول» فقط من Web App الخاص بـ Apps Script.

ملفات الربط:
- google-apps-script-Code.gs: كود Google Apps Script الكامل.
- GOOGLE_SHEETS_SETUP_AR.md: شرح الإعداد والنشر خطوة بخطوة.

مهم:
بعد نشر Apps Script كـ Web App، افتح:
js/main.js

وابحث عن:
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbyrg0h9dm0-MxQfQ6rmikdpfMUWoSM65ri3BlgbWxeEw2BeOPN-zwaD3-rADN_Mtrxe/exec";

ثم ضع رابط Web App بين علامتي الاقتباس، مثل:
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbyrg0h9dm0-MxQfQ6rmikdpfMUWoSM65ri3BlgbWxeEw2BeOPN-zwaD3-rADN_Mtrxe/exec";

بعدها ارفع الموقع من جديد.

ملاحظة:
لا يمكن إنشاء/نشر Web App داخل حساب Google الخاص بك من ملف ZIP وحده؛ يجب أن تقوم أنت بتشغيل setupCatalogWorkflow ومنح Google الصلاحيات ثم نشر Web App من حسابك. بعد ذلك يكفي وضع الرابط في main.js كما هو موضح أعلاه.


مهم: نسخة Apps Script الحالية تدعم المشروع المستقل أيضًا. يجب وضع Spreadsheet ID داخل CONFIG > SPREADSHEET_ID قبل تشغيل setupCatalogWorkflow.
