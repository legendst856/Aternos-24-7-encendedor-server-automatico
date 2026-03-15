const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Navega a Aternos
  await page.goto('https://aternos.org/go/');
  
  // Aquí pones tus datos (recomiendo usar variables de entorno en GitHub)
  await page.type('#user', process.env.ATERNOS_USER);
  await page.type('#password', process.env.ATERNOS_PASS);
  await page.click('#login');
  
  await page.waitForNavigation();
  
  // Esperar a que aparezca el botón de encender
  await page.waitForSelector('.btn-success');
  await page.click('.btn-success');
  
  console.log("¡Botón presionado!");
  await browser.close();
})();
