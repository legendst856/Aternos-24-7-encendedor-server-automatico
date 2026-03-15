const axios = require('axios');
const http = require('http');

// Servidor de mantenimiento para que Render no duerma el proceso
http.createServer((req, res) => res.end('Portal activo')).listen(process.env.PORT || 10000);

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

async function encender() {
    console.log("Intentando encender con headers blindados...");
    
    try {
        // Ejecutamos la petición con los headers necesarios para evitar el error 403
        const res = await axios.post('https://aternos.org/panel/ajax/start.php', 
            `server=${process.env.SERVER_ID}`, {
            headers: {
                'Cookie': `ATERNOS_SESSION=${process.env.ATERNOS_COOKIE}`,
                'User-Agent': MOBILE_UA,
                'Referer': 'https://aternos.org/panel/',
                'Origin': 'https://aternos.org',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
            }
        });

        // Verificamos si Aternos aceptó la petición
        if (res.data && res.data.success) {
            console.log("✅ ¡Señal aceptada! Servidor iniciando.");
        } else {
            console.log("⚠️ Aternos respondió correctamente pero el servidor no encendió.");
            console.log("Respuesta del servidor:", JSON.stringify(res.data));
        }

    } catch (e) {
        if (e.response && e.response.status === 403) {
            console.error("❌ Error 403: Cloudflare ha bloqueado la IP de Render.");
        } else {
            console.error("❌ Error de red:", e.message);
        }
    }
}

// Ejecutar cada 15 minutos
setInterval(encender, 900000);
encender();
