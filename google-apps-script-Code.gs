/**
 * كتالوج بنها 🍯 — نظام استقبال ومراجعة ونشر الأنشطة
 *
 * هذا الملف يُستخدم داخل Google Apps Script المرتبط بملف Google Sheets
 * الذي يستقبل ردود نموذج إضافة النشاط.
 *
 * الوظائف:
 * 1) كل طلب جديد يبدأ بحالة: قيد المراجعة
 * 2) من Google Sheets يمكن تغيير الحالة إلى: مقبول / مرفوض
 * 3) الموقع يقرأ الأنشطة المقبولة فقط من خلال Web App
 * 4) لا يتم إرسال اسم مقدم الطلب أو بيانات الإدارة إلى الموقع العام
 */

const CONFIG = {
  // ضع هنا Spreadsheet ID الخاص بملف Google Sheets الذي يستقبل ردود النموذج.
  // مثال: https://docs.google.com/spreadsheets/d/ABC123/edit  ->  ABC123
  SPREADSHEET_ID: 'PASTE_YOUR_SPREADSHEET_ID_HERE',
  RESPONSE_SHEET_NAME: '', // اتركه فارغًا ليبحث السكربت تلقائيًا عن ورقة ردود النموذج.
  STATUS_HEADER: 'حالة النشر',
  NOTES_HEADER: 'ملاحظات الإدارة',
  REVIEWED_AT_HEADER: 'تاريخ المراجعة',
  APPROVED_VALUE: 'مقبول',
  REJECTED_VALUE: 'مرفوض',
  PENDING_VALUE: 'قيد المراجعة',
  CORS_NOTE: 'Public JSON endpoint for the catalog website'
};

const FIELD_ALIASES = {
  name: ['اسم النشاط'],
  category: ['الفئة الرئيسية', 'الفئة'],
  subcategory: ['التصنيف الفرعي'],
  address: ['العنوان / المنطقة', 'العنوان'],
  phone: ['الهاتف'],
  whatsapp: ['واتساب', 'رقم واتساب'],
  facebook: ['فيسبوك', 'رابط فيسبوك'],
  instagram: ['إنستغرام', 'انستغرام', 'رابط إنستغرام'],
  website: ['الموقع الإلكتروني', 'الموقع', 'رابط الموقع'],
  hours: ['مواعيد العمل', 'مواعيد العمل / ساعات العمل'],
  description: ['وصف النشاط'],
  services: ['المنتجات / الخدمات', 'المنتجات والخدمات', 'الخدمات / المنتجات'],
  prices: ['الأسعار', 'معلومات الأسعار'],
  onlineOnly: ['هل النشاط يعمل من المنزل أو أونلاين؟', 'هل النشاط من المنزل أو أونلاين؟', 'نشاط إلكتروني فقط'],
  image: ['صور النشاط', 'رابط صور النشاط', 'صور / رابط الصور'],
  requester: ['اسم مقدم الطلب للتواصل معه', 'اسم مقدم الطلب']
};

function normalizeHeader(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getSpreadsheet_() {
  const id = String(CONFIG.SPREADSHEET_ID || '').trim();
  if (id && id !== 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    try {
      return SpreadsheetApp.openById(id);
    } catch (err) {
      throw new Error('تعذر فتح Google Sheets باستخدام SPREADSHEET_ID. تأكد من نسخ Spreadsheet ID الصحيح ومن أن حساب Apps Script لديه صلاحية الوصول إلى الملف.');
    }
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error('لم يتم تحديد Spreadsheet ID. افتح ملف Google Sheets، انسخ المعرّف من الرابط بين /d/ و /edit، ثم ضعه في CONFIG > SPREADSHEET_ID.');
}

function getResponseSheet_() {
  const ss = getSpreadsheet_();
  if (CONFIG.RESPONSE_SHEET_NAME) {
    const named = ss.getSheetByName(CONFIG.RESPONSE_SHEET_NAME);
    if (!named) throw new Error('لم يتم العثور على ورقة: ' + CONFIG.RESPONSE_SHEET_NAME);
    return named;
  }

  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    const lastCol = sheet.getLastColumn();
    if (!lastCol) continue;
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(normalizeHeader);
    if (headers.some(h => FIELD_ALIASES.name.includes(h)) && headers.some(h => FIELD_ALIASES.address.includes(h))) {
      return sheet;
    }
  }

  if (sheets.length) return sheets[0];
  throw new Error('لم يتم العثور على أي ورقة داخل Google Sheets.');
}

function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (!lastCol) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(normalizeHeader);
  const map = {};
  headers.forEach((header, index) => {
    if (header) map[header] = index + 1;
  });
  return map;
}

function findColumn_(headerMap, aliases) {
  for (const alias of aliases) {
    const col = headerMap[normalizeHeader(alias)];
    if (col) return col;
  }
  return 0;
}

function ensureColumn_(sheet, header) {
  const map = getHeaderMap_(sheet);
  if (map[header]) return map[header];
  const col = sheet.getLastColumn() + 1;
  sheet.getRange(1, col).setValue(header);
  return col;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍯 كتالوج بنها')
    .addItem('تهيئة نظام المراجعة', 'setupCatalogWorkflow')
    .addItem('اختبار الأنشطة المقبولة', 'testCatalogApi')
    .addToUi();
}

function setupCatalogWorkflow() {
  const sheet = getResponseSheet_();
  const statusCol = ensureColumn_(sheet, CONFIG.STATUS_HEADER);
  const notesCol = ensureColumn_(sheet, CONFIG.NOTES_HEADER);
  const reviewedCol = ensureColumn_(sheet, CONFIG.REVIEWED_AT_HEADER);

  const maxRows = Math.max(sheet.getMaxRows() - 1, 1);
  const statusRange = sheet.getRange(2, statusCol, maxRows, 1);
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      CONFIG.PENDING_VALUE,
      CONFIG.APPROVED_VALUE,
      CONFIG.REJECTED_VALUE
    ], true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(validation);

  // أي صف موجود حاليًا بلا حالة يصبح قيد المراجعة.
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const values = sheet.getRange(2, statusCol, lastRow - 1, 1).getValues();
    let changed = false;
    values.forEach(row => {
      if (!String(row[0] || '').trim()) {
        row[0] = CONFIG.PENDING_VALUE;
        changed = true;
      }
    });
    if (changed) sheet.getRange(2, statusCol, values.length, 1).setValues(values);
  }

  sheet.getRange(1, statusCol).setNote('غيّر هذه الخانة إلى «مقبول» لنشر النشاط على الموقع.');
  sheet.getRange(1, notesCol).setNote('ملاحظات داخلية لا تظهر على الموقع.');
  sheet.getRange(1, reviewedCol).setNote('يُسجل تلقائيًا عند تغيير حالة النشر.');

  // تنسيق العناوين الجديدة.
  sheet.getRange(1, statusCol, 1, Math.max(1, reviewedCol - statusCol + 1))
    .setFontWeight('bold');

  installTriggers_();
  return 'تم تجهيز نظام المراجعة على الورقة: ' + sheet.getName() + ' في الملف: ' + sheet.getParent().getName();
}

function installTriggers_() {
  const ss = getSpreadsheet_();
  const existing = ScriptApp.getProjectTriggers();
  existing.forEach(trigger => {
    const handler = trigger.getHandlerFunction();
    if (handler === 'onCatalogFormSubmit' || handler === 'onCatalogEdit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('onCatalogFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  ScriptApp.newTrigger('onCatalogEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
}

function onCatalogFormSubmit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const statusCol = ensureColumn_(sheet, CONFIG.STATUS_HEADER);
  const reviewedCol = ensureColumn_(sheet, CONFIG.REVIEWED_AT_HEADER);
  const row = e.range.getRow();

  sheet.getRange(row, statusCol).setValue(CONFIG.PENDING_VALUE);
  sheet.getRange(row, reviewedCol).clearContent();
}

function onCatalogEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const statusCol = findColumn_(getHeaderMap_(sheet), [CONFIG.STATUS_HEADER]);
  if (!statusCol) return;
  if (e.range.getColumn() !== statusCol || e.range.getRow() < 2) return;

  const value = String(e.range.getDisplayValue() || '').trim();
  const reviewedCol = ensureColumn_(sheet, CONFIG.REVIEWED_AT_HEADER);
  if ([CONFIG.APPROVED_VALUE, CONFIG.REJECTED_VALUE].includes(value)) {
    sheet.getRange(e.range.getRow(), reviewedCol).setValue(new Date());
  } else if (value === CONFIG.PENDING_VALUE) {
    sheet.getRange(e.range.getRow(), reviewedCol).clearContent();
  }
}

function getCellByAliases_(row, headerMap, aliases) {
  const col = findColumn_(headerMap, aliases);
  return col ? String(row[col - 1] || '').trim() : '';
}

function getPublicItems_() {
  const sheet = getResponseSheet_();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(normalizeHeader);
  const headerMap = {};
  headers.forEach((header, index) => { if (header) headerMap[header] = index + 1; });

  const statusCol = findColumn_(headerMap, [CONFIG.STATUS_HEADER]);
  if (!statusCol) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues();
  const items = [];

  rows.forEach((row, index) => {
    const status = String(row[statusCol - 1] || '').trim();
    if (status !== CONFIG.APPROVED_VALUE) return;

    const services = getCellByAliases_(row, headerMap, FIELD_ALIASES.services);
    const prices = getCellByAliases_(row, headerMap, FIELD_ALIASES.prices);
    const description = getCellByAliases_(row, headerMap, FIELD_ALIASES.description);
    const combinedDescription = [description, services].filter(Boolean).join(' — ');

    const item = {
      id: 'submitted-' + (index + 2),
      name: getCellByAliases_(row, headerMap, FIELD_ALIASES.name),
      category: getCellByAliases_(row, headerMap, FIELD_ALIASES.category) || '🛍️ المتاجر والخدمات المختلفة',
      subcategory: getCellByAliases_(row, headerMap, FIELD_ALIASES.subcategory),
      address: getCellByAliases_(row, headerMap, FIELD_ALIASES.address),
      phone: getCellByAliases_(row, headerMap, FIELD_ALIASES.phone),
      whatsapp: getCellByAliases_(row, headerMap, FIELD_ALIASES.whatsapp),
      facebook: getCellByAliases_(row, headerMap, FIELD_ALIASES.facebook),
      instagram: getCellByAliases_(row, headerMap, FIELD_ALIASES.instagram),
      website: getCellByAliases_(row, headerMap, FIELD_ALIASES.website),
      hours: getCellByAliases_(row, headerMap, FIELD_ALIASES.hours),
      description: combinedDescription,
      prices: prices,
      pricesInfo: prices,
      onlineOnly: getCellByAliases_(row, headerMap, FIELD_ALIASES.onlineOnly),
      image: getCellByAliases_(row, headerMap, FIELD_ALIASES.image),
      source: 'طلبات إضافة النشاط',
      verified: 'مقبول'
    };

    if (item.name) items.push(item);
  });

  return items;
}

function doGet(e) {
  const items = getPublicItems_();
  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    count: items.length,
    items: items
  };

  const callback = e && e.parameter ? String(e.parameter.callback || '').trim() : '';
  const json = JSON.stringify(payload);

  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * اختبار يدوي داخل Apps Script.
 */
function testCatalogApi() {
  const items = getPublicItems_();
  Logger.log('الأنشطة المقبولة: ' + items.length);
  Logger.log(JSON.stringify(items.slice(0, 3), null, 2));
}
