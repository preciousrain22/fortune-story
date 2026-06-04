export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '잘못된 접근입니다.' });
    }

    const { paymentKey, orderId, amount } = req.body;

    // Vercel 환경변수에서 Secret Key 가져오기
    const secretKey = process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
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
        return res.status(500).json({ message: '결제 승인 중 서버 에러가 발생했습니다.', error: error.message });
    }
}