const axios = require('axios');
require('dotenv').config();

const IOINTELLIGENCE_API_KEY = process.env.IOINTELLIGENCE_API_KEY;

if (!IOINTELLIGENCE_API_KEY) {
  console.error('❌ ОШИБКА: IOINTELLIGENCE_API_KEY не найден в .env');
  process.exit(1); // Завершаем процесс, если ключ отсутствует
}

const SYSTEM_PROMPT = `
Ты — мастер D&D 5e. Веди игру в фэнтезийном мире. Правила:
- Описывай локации, погоду, звуки
- Игрок принимает решения — ты не решаешь за него
- При необходимости бросай кубик: /roll 1d20+4
- Помни: имена NPC, их отношение, квесты
- Говори от третьего лица, как повествование
- Не делай выводов за игрока
- Не твой ответ не больше 200 слов
`.trim(); // trim() убирает лишние переносы

async function askIoAi(messages) {
  try {
    console.log('Отправляю запрос к io.ai с контекстом из', messages.length, 'сообщений');
    
    // Формируем полный контекст
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter(msg => msg.content && msg.content.trim().length > 0) // Фильтруем пустые сообщения
    ];

    const requestData = {
      model: 'meta-llama/Llama-3.3-70B-Instruct', // Можно заменить на другую модель из списка доступных
      messages: fullMessages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.2, // Снижаем вероятность повторений
      presence_penalty: 0.2   // Поощряем разнообразие
    };

    console.log('Тело запроса:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      'https://api.intelligence.io.solutions/api/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${IOINTELLIGENCE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 секунд таймаут
      }
    );

    console.log('Ответ от API:', {
      status: response.status,
      usage: response.data.usage,
      finish_reason: response.data.choices[0]?.finish_reason
    });

    // Более безопасное извлечение ответа
    return response.data.choices[0]?.message?.content || 'Не получилось сгенерировать ответ.';
  } catch (error) {
    console.error('❌ Ошибка при запросе к io.ai:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return 'Мастер временно недоступен. Попробуй ещё раз позже.';
  }
}

module.exports = askIoAi;