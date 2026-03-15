const axios = require('axios');
const http = require('http');

// Servidor de mantenimiento para que Render no te duerma
http.createServer((req, res) => res.end('Portal activo')).listen(process.env.PORT || 10000);

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

async function encender() {
    console.log("Intentando encender como dispositivo móvil...");
    
    try {
        // Enviamos la señal de encendido al panel
        const res = await axios.post('https://aternos.org/panel/ajax/start.php', 
            `server=${process.env.SERVER_ID}`, {
            headers: {
                'Cookie': `ATERNOS_SESSION=${process.env.ATERNOS_COOKIE}`,
                'User-Agent': MOBILE_UA,
                'Referer': 'https://aternos.org/panel/',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Verificamos si Aternos aceptó la petición
        if (res.data && res.data.success) {
            console.log("✅ ¡Señal aceptada! El servidor debería estar encendiendo.");
        } else {
            console.log("⚠️ Aternos respondió, pero el servidor no prendió. Revisa la cookie.");
            console.log("Respuesta:", JSON.stringify(res.data));
        }

    } catch (e) {
        console.error("❌ Error de red:", e.message);
    }
}

// Ejecutar cada 15 minutos (900000ms)
setInterval(encender, 900000);
encender();
