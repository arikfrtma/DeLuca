const twilio = require('twilio');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { target, bugType } = JSON.parse(event.body);
    
    if (!target) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, message: 'Nomor target diperlukan' })
      };
    }

    // Validasi format nomor Indonesia
    if (!target.startsWith('62') || target.length < 10 || target.length > 15) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Format nomor tidak valid. Gunakan format Indonesia (62...)',
          example: '628123456789'
        })
      };
    }

    // Initialize Twilio client dengan environment variables
    const accountSid = process.env.AC587a0fe94a4fd12d7cf9da05c181ce44;
    const authToken = process.env.11f4ec01b3cd65edccbfe96d75539659;
    const twilioPhone = process.env.+19402603364;

    if (!accountSid || !authToken) {
      console.error('Twilio credentials not found');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Server configuration error',
          error: 'Twilio credentials not configured'
        })
      };
    }

    const client = twilio(accountSid, authToken);

    // Tentukan pesan berdasarkan bug type
    const bugMessages = {
      'crash-infinity': '🚀 Crash Infinity bug diaktifkan! Sistem mungkin mengalami gangguan.',
      'blank-freeze': '❄️ Blank Freeze bug diaktifkan! Layar mungkin membeku.',
      'lag-flood': '🌊 Lag Flood bug diaktifkan! Performa mungkin menurun.',
      'single-crash': '💥 Single Crash bug diaktifkan!'
    };

    const message = bugMessages[bugType] || '🐛 Bug telah diaktifkan!';

    // Kirim pesan WhatsApp menggunakan Twilio
    try {
      const twilioResponse = await client.messages.create({
        body: `${message}\n\nDikirim dari WhatsApp Bug Sender`,
        from: twilioPhone || 'whatsapp:+19402603364', // Default Twilio sandbox number
        to: `whatsapp:+${target}`
      });

      console.log('Twilio response:', twilioResponse.sid);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: `${message} Berhasil dikirim ke ${target}`,
          target: target,
          bugType: bugType,
          messageId: twilioResponse.sid,
          timestamp: new Date().toISOString()
        })
      };

    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Gagal mengirim pesan WhatsApp',
          error: twilioError.message,
          code: twilioError.code
        })
      };
    }

  } catch (error) {
    console.error('Server error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Terjadi kesalahan internal',
        error: error.message 
      })
    };
  }
};