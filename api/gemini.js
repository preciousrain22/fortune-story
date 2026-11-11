export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '잘못된 접근입니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 진우님께서 확인해주신 최신 Pro 모델(3.1 Pro)로 정확히 수정했습니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent?key=${apiKey}`;

    try {
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