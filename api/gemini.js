export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '잘못된 접근입니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent?key=${apiKey}`;

    try {
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        // 💡 에러 원인을 추적하기 위해 구글의 실제 응답을 무조건 텍스트로 받아옵니다.
        const responseText = await googleResponse.text();

        if (!googleResponse.ok) {
            return res.status(googleResponse.status).json({
                message: '구글 API 에러 발생',
                errorDetail: responseText
            });
        }

        return res.status(200).json(JSON.parse(responseText));
    } catch (error) {
        return res.status(500).json({ message: 'Vercel 서버 내부 에러', errorDetail: error.toString() });
    }
}