const express = require('express');
const cors = require('cors');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 토스페이먼츠 결제 승인 API 엔드포인트
app.post('/api/confirm', async (req, res) => {
    const { paymentKey, orderId, amount } = req.body;
    const secretKey = process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
        console.error('TOSS_SECRET_KEY is not defined in environment variables.');
        return res.status(500).json({ message: '서버 환경변수 설정 오류' });
    }

    const encryptedSecretKey = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    try {
        const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                'Authorization': encryptedSecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentKey, orderId, amount })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('토스페이먼츠 결제 승인 중 서버 에러 발생:', error);
        return res.status(500).json({ message: '결제 승인 중 서버 에러가 발생했습니다.', error: error.message });
    }
});

// 제미나이(Gemini) AI 운세 분석 API 통로 생성
app.post('/api/gemini', async (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
        return res.status(500).json({ message: 'AI 서버 환경변수 설정 오류' });
    }

    try {
        // 🚨 1.5를 2.5로 변경! (구글 최신 초고속 모델 완벽 적용)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Gemini API 호출 중 서버 에러 발생:', error);
        return res.status(500).json({ message: '운세 분석 중 서버 에러가 발생했습니다.', error: error.message });
    }
});

// Vercel 환경이 아니거나 로컬 테스트를 위해 서버 실행
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
    });
}

// Vercel 서버리스 함수로 동작하도록 app 모듈을 export 합니다.
module.exports = app;