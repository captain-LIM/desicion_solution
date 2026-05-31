const axios = require('axios');
const pool = require('../config/db');
require('dotenv').config();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function buildPersonalizationContext(userId) {
  const [reviewed] = await pool.execute(
    `SELECT d.scenario, d.recommended_option, d.category, d.satisfaction, d.review_note
     FROM decisions d
     WHERE d.user_id = ? AND d.satisfaction IS NOT NULL
     ORDER BY d.created_at DESC LIMIT 15`,
    [userId]
  );
  if (reviewed.length < 3) return { context: '', isPersonalized: false };

  const satisfied = reviewed.filter((r) => r.satisfaction === 1);
  const unsatisfied = reviewed.filter((r) => r.satisfaction === 0);

  let context = '\n\n[사용자 개인화 정보 - 과거 결정 패턴]\n';
  context += '아래는 이 사용자의 실제 과거 결정과 만족도입니다. 이 패턴을 반드시 참고하여 추천하세요:\n';

  if (satisfied.length > 0) {
    context += '\n✅ 만족스러웠던 결정들:\n';
    satisfied.slice(0, 5).forEach((r) => {
      const cat = r.category ? `[${r.category}] ` : '';
      context += `- ${cat}"${r.scenario}" → "${r.recommended_option}" 선택 → 만족\n`;
      if (r.review_note) context += `  (소감: ${r.review_note})\n`;
    });
  }

  if (unsatisfied.length > 0) {
    context += '\n❌ 아쉬웠던 결정들:\n';
    unsatisfied.slice(0, 5).forEach((r) => {
      const cat = r.category ? `[${r.category}] ` : '';
      context += `- ${cat}"${r.scenario}" → "${r.recommended_option}" 선택 → 아쉬움\n`;
      if (r.review_note) context += `  (소감: ${r.review_note})\n`;
    });
  }

  context += '\n위 패턴을 분석하여 이 사용자에게 최적화된 추천을 해주세요.\n';
  return { context, isPersonalized: true };
}

async function createDecision(req, res) {
  const { scenario, options, emotional_state, category } = req.body;

  if (!scenario || !options || options.length < 2) {
    return res.status(400).json({ error: '고민 상황과 최소 2개의 선택지를 입력해주세요.' });
  }

  const optionsList = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const emotionPart = emotional_state ? `\n현재 감정 상태: ${emotional_state}` : '';

  // 개인화 컨텍스트 생성
  const { context: personalizationContext, isPersonalized } = await buildPersonalizationContext(req.user.id);

  const prompt = `당신은 사용자의 의사결정을 도와주는 AI 어시스턴트입니다.
사용자의 고민 상황과 선택지를 분석하여 최적의 선택을 추천해주세요.${personalizationContext}
고민 상황: ${scenario}${emotionPart}

선택지:
${optionsList}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "recommended_option": "추천하는 선택지 텍스트 (원문 그대로)",
  "explanation": "이 선택을 추천하는 이유를 3-4문장으로 설명${isPersonalized ? '. 사용자의 과거 패턴을 반영한 경우 언급해주세요.' : ''}"
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
        'INSERT INTO decisions (scenario, emotional_state, recommended_option, explanation, category, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [scenario, emotional_state || null, parsed.recommended_option, parsed.explanation, category || null, req.user.id]
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
        category: category || null,
        options,
        recommended_option: parsed.recommended_option,
        explanation: parsed.explanation,
        is_personalized: isPersonalized,
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
  const { keyword, category, date_from, date_to } = req.query;

  try {
    const conditions = [];
    const params = [];

    if (keyword) {
      conditions.push('(scenario LIKE ? OR recommended_option LIKE ? OR explanation LIKE ?)');
      const like = `%${keyword}%`;
      params.push(like, like, like);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (date_from) {
      conditions.push('DATE(created_at) >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('DATE(created_at) <= ?');
      params.push(date_to);
    }

    conditions.push('user_id = ?');
    params.push(req.user.id);

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [decisions] = await pool.query(
      `SELECT * FROM decisions ${where} ORDER BY created_at DESC LIMIT 100`,
      params
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

async function getDecisionById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM decisions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: '결정을 찾을 수 없습니다.' });

    const decision = rows[0];
    const [opts] = await pool.execute(
      'SELECT option_text FROM options WHERE decision_id = ? ORDER BY order_index',
      [id]
    );
    decision.options = opts.map((o) => o.option_text);
    res.json(decision);
  } catch (err) {
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
  }
}

async function toggleBookmark(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT is_bookmarked FROM decisions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: '결정을 찾을 수 없습니다.' });
    const next = rows[0].is_bookmarked ? 0 : 1;
    await pool.execute('UPDATE decisions SET is_bookmarked = ? WHERE id = ?', [next, id]);
    res.json({ is_bookmarked: next });
  } catch (err) {
    res.status(500).json({ error: '북마크 처리 중 오류가 발생했습니다.' });
  }
}

async function reviewDecision(req, res) {
  const { id } = req.params;
  const { satisfaction, review_note } = req.body;

  if (satisfaction === undefined || satisfaction === null) {
    return res.status(400).json({ error: '만족도를 선택해주세요.' });
  }

  try {
    await pool.execute(
      'UPDATE decisions SET satisfaction = ?, review_note = ?, reviewed_at = NOW() WHERE id = ?',
      [satisfaction, review_note || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '재검토 저장 중 오류가 발생했습니다.' });
  }
}

async function getPendingReviews(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, scenario, recommended_option, created_at
       FROM decisions
       WHERE user_id = ? AND satisfaction IS NULL
         AND created_at <= NOW() - INTERVAL 3 DAY
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
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

async function getStats(req, res) {
  const userId = req.user.id;
  try {
    // 전체 결정 수
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM decisions WHERE user_id = ?', [userId]
    );

    // 이번 달 결정 수
    const [[{ this_month }]] = await pool.execute(
      'SELECT COUNT(*) as this_month FROM decisions WHERE user_id = ? AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())',
      [userId]
    );

    // 만족도
    const [[satisfactionRow]] = await pool.execute(
      `SELECT
        COUNT(CASE WHEN satisfaction = 1 THEN 1 END) as satisfied,
        COUNT(CASE WHEN satisfaction = 0 THEN 1 END) as unsatisfied,
        COUNT(CASE WHEN satisfaction IS NOT NULL THEN 1 END) as reviewed
       FROM decisions WHERE user_id = ?`,
      [userId]
    );

    // 카테고리별 집계
    const [categoryBreakdown] = await pool.execute(
      `SELECT COALESCE(category, '미분류') as category, COUNT(*) as count
       FROM decisions WHERE user_id = ?
       GROUP BY category ORDER BY count DESC`,
      [userId]
    );

    // 이번 달 가장 많은 카테고리
    const [[topCategoryThisMonth]] = await pool.execute(
      `SELECT COALESCE(category, '미분류') as category, COUNT(*) as count
       FROM decisions WHERE user_id = ?
         AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())
       GROUP BY category ORDER BY count DESC LIMIT 1`,
      [userId]
    );

    // 최근 6개월 월별 추이
    const [monthlyTrend] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
       FROM decisions WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`,
      [userId]
    );

    // 북마크 수
    const [[{ bookmarked }]] = await pool.execute(
      'SELECT COUNT(*) as bookmarked FROM decisions WHERE user_id = ? AND is_bookmarked = 1', [userId]
    );

    const satisfactionRate = satisfactionRow.reviewed > 0
      ? Math.round((satisfactionRow.satisfied / satisfactionRow.reviewed) * 100)
      : null;

    res.json({
      total,
      this_month,
      bookmarked,
      satisfaction_rate: satisfactionRate,
      reviewed_count: satisfactionRow.reviewed,
      top_category_this_month: topCategoryThisMonth?.category || null,
      category_breakdown: categoryBreakdown,
      monthly_trend: monthlyTrend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '통계를 불러오는 중 오류가 발생했습니다.' });
  }
}

module.exports = { createDecision, getHistory, getDecisionById, toggleBookmark, reviewDecision, getPendingReviews, getStats, deleteDecision };
