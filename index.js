const axios = require('axios');

// Estos encabezados engañan a Aternos haciéndole creer que eres un móvil real
const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Referer': 'https://aternos.org/server/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Cookie': 'AQUI_VA_TU_COOKIE_LARGA_DE_SESION'
};

async function encenderServidor() {
    try {
        console.log("Intentando conectar con Aternos...");
        
        // 1. Primero entramos a la página del servidor para obtener los tokens de seguridad
        await axios.get('https://aternos.org/server/', { headers });
        
        // 2. Ejecutamos la petición de inicio (el botón de encendido)
        const response = await axios.get('https://aternos.org/panel/ajax/start.php', {
            headers: {
                ...headers,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log("Respuesta de Aternos:", response.data);
        console.log("✅ ¡Señal enviada con éxito!");

    } catch (error) {
        console.error("❌ Error al conectar:", error.message);
    }
}

encenderServidor();
