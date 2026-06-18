/**
 * Burgers & World Cup — приёмник заказов для Google Apps Script.
 *
 * Что делает: принимает POST с заказом (JSON), дописывает строку
 * в активный лист Google-таблицы. Никаких секретов на стороне сайта.
 *
 * Установка — см. README.md, раздел «Настройка Google-таблицы».
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // создаём шапку при первом запуске
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Время', 'Имя', 'Котлетки', 'Сыр', 'Топпинги', 'Соусы']);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.patties || '',
      data.cheese || '',
      (data.toppings || []).join(', '),
      (data.sauces || []).join(', ')
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Позволяет открыть URL в браузере для проверки, что развёртывание живо.
function doGet() {
  return ContentService.createTextOutput('Burgers & World Cup order endpoint is alive 🍔');
}
