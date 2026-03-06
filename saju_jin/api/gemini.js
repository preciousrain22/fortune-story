export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '잘못된 접근입니다.' });
    }

    // 보안 서버(Vercel)의 금고에서 API 키를 몰래 꺼내옵니다.
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        // 프론트엔드에서 받은 질문을 구글에 대신 전달합니다.
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await googleResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: '서버 에러 발생', error: error.message });
    }
}