const axios = require('axios');
const pool = require('../config/db');
require('dotenv').config();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function createDecision(req, res) {
  const { scenario, options, emotional_state } = req.body;

  if (!scenario || !options || options.length < 2) {
    return res.status(400).json({ error: '고민 상황과 최소 2개의 선택지를 입력해주세요.' });
  }

  const optionsList = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const emotionPart = emotional_state ? `\n현재 감정 상태: ${emotional_state}` : '';

  const prompt = `당신은 사용자의 의사결정을 도와주는 AI 어시스턴트입니다.
사용자의 고민 상황과 선택지를 분석하여 최적의 선택을 추천해주세요.

고민 상황: ${scenario}${emotionPart}

선택지:
${optionsList}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "recommended_option": "추천하는 선택지 텍스트 (원문 그대로)",
  "explanation": "이 선택을 추천하는 이유를 3-4문장으로 설명"
}`;

  try {
    const aiResponse = await axios.post(
      OPENROUTER_URL,
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = aiResponse.data.choices[0].message.content;
    const parsed = JSON.parse(content);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        'INSERT INTO decisions (scenario, emotional_state, recommended_option, explanation) VALUES (?, ?, ?, ?)',
        [scenario, emotional_state || null, parsed.recommended_option, parsed.explanation]
      );
      const decisionId = result.insertId;

      for (let i = 0; i < options.length; i++) {
        await conn.execute(
          'INSERT INTO options (decision_id, option_text, order_index) VALUES (?, ?, ?)',
          [decisionId, options[i], i]
        );
      }

      await conn.commit();

      res.json({
        id: decisionId,
        scenario,
        emotional_state: emotional_state || null,
        options,
        recommended_option: parsed.recommended_option,
        explanation: parsed.explanation,
      });
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI 추천 중 오류가 발생했습니다.' });
  }
}

async function getHistory(req, res) {
  try {
    const [decisions] = await pool.execute(
      'SELECT * FROM decisions ORDER BY created_at DESC LIMIT 50'
    );

    for (const decision of decisions) {
      const [opts] = await pool.execute(
        'SELECT option_text FROM options WHERE decision_id = ? ORDER BY order_index',
        [decision.id]
      );
      decision.options = opts.map((o) => o.option_text);
    }

    res.json(decisions);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: '히스토리를 불러오는 중 오류가 발생했습니다.' });
  }
}

async function deleteDecision(req, res) {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM decisions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
}

module.exports = { createDecision, getHistory, deleteDecision };
