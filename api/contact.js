const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { category, name, company, email, phone, budget, deadline, message } = req.body;

  // 必須項目チェック
  if (!name || !company || !email || !phone || !message || !category) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       // 例: ai@tatedouga.jp
      pass: process.env.GMAIL_APP_PASSWORD // Gmailアプリパスワード（16桁）
    }
  });

  const categoryLabels = {
    estimate:   'お見積り依頼',
    brand:      'ブランドムービーの制作',
    drama:      '採用ドラマ・アニメ動画の制作',
    'job-desc': '職種説明アニメ動画の制作',
    sns:        'SNSショートドラマ・アニメの制作',
    hybrid:     'ハイブリッド型（AI × 実写）の制作',
    sub:        '月額プランで継続的に制作',
    consult:    '採用動画・採用広報についての相談',
    other:      'その他'
  };
  const budgetLabels = {
    light:          'LIGHT 15万円〜（単発）',
    standard:       'STANDARD 30万円〜（単発）',
    premium:        'PREMIUM 60万円〜（単発）',
    'sub-starter':  'LIGHT 月額5万円〜（サブスク）',
    'sub-standard': 'STANDARD 月額15万円〜（サブスク）',
    'sub-premium':  'PREMIUM 月額30万円〜（サブスク）',
    undecided:      '未定・相談したい'
  };
  const deadlineLabels = {
    asap:      'できるだけ早く（〜2週間）',
    '1month':  '1ヶ月以内',
    '2month':  '2ヶ月以内',
    '3month':  '3ヶ月以内',
    undecided: '未定・相談したい'
  };

  const mailOptions = {
    from:    `"JobReel お問い合わせ" <${process.env.GMAIL_USER}>`,
    to:      process.env.GMAIL_USER,
    replyTo: email,
    subject: `【問い合わせ】${company} - ${name}`,
    text: `
新しいお問い合わせが届きました。

━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容: ${categoryLabels[category] || category}
■ 会社名: ${company}
■ お名前: ${name}
■ メールアドレス: ${email}
■ 電話番号: ${phone}
■ ご予算: ${budgetLabels[budget] || '未選択'}
■ ご希望納期: ${deadlineLabels[deadline] || '未選択'}
━━━━━━━━━━━━━━━━━━━━

■ メッセージ:
${message}

━━━━━━━━━━━━━━━━━━━━
このメールに返信すると ${email} に届きます。
    `.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('メール送信エラー:', err);
    return res.status(500).json({ error: 'メール送信に失敗しました' });
  }
}
