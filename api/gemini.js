export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '잘못된 접근입니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // 최신 Gemini 3 시리즈 정식/프리뷰 모델 코드 (1순위: 3 Flash, 2순위: 3.1 Pro, 3순위: 2.0 Flash 자동 폴백)
    const models = [
        'gemini-3-flash-preview',
        'gemini-3.1-pro-preview',
        'gemini-2.0-flash'
    ];

    try {
        let lastResponseStatus = 500;
        let lastResponseText = '';

        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const googleResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });

            const responseText = await googleResponse.text();

            if (googleResponse.ok) {
                return res.status(200).json(JSON.parse(responseText));
            }

            lastResponseStatus = googleResponse.status;
            lastResponseText = responseText;

            // 404(모델명 미인식)일 경우에만 다음 최신 모델로 자동 재시도
            if (googleResponse.status !== 404) {
                break;
            }
        }

        return res.status(lastResponseStatus).json({
            message: '구글 API 에러 발생',
            errorDetail: lastResponseText
        });
    } catch (error) {
        return res.status(500).json({ message: 'Vercel 서버 내부 에러', errorDetail: error.toString() });
    }
}