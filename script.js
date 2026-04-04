window.handlePdfPrint = function (type) {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if ((ua.indexOf("Instagram") > -1) || (ua.indexOf("KAKAOTALK") > -1) || (ua.indexOf("Threads") > -1)) {
        alert("⚠️ 카카오톡이나 인스타그램 내부에서는 PDF 저장이 차단됩니다.\n\n화면 우측 상단(또는 하단)의 메뉴(⋮)를 눌러서\n[다른 브라우저(사파리/크롬)에서 열기]를 선택하신 후 다시 시도해주세요!");
        return;
    }

    alert("프리미엄 PDF 결과지를 생성 중입니다. 잠시만 기다려주세요... ⏳");

    const targetId = type === 'saju' ? 'result' : 'tarotResult';
    const overlay = document.getElementById(targetId);
    const elementToCapture = document.querySelector(`#${targetId} .paper-container`) || document.querySelector(`#${targetId} .tarot-result-container`);

    const actionArea = elementToCapture.querySelector('.result-actions');
    if (actionArea) actionArea.style.display = 'none';

    overlay.style.setProperty('position', 'absolute', 'important');
    overlay.style.setProperty('overflow-y', 'visible', 'important');
    overlay.style.setProperty('height', 'auto', 'important');
    window.scrollTo(0, 0);

    const opt = {
        margin: [5, 0, 5, 0],
        filename: `포춘스토리_프리미엄_${type === 'saju' ? '사주' : '타로'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#1a1a1a',
            windowWidth: document.documentElement.scrollWidth
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elementToCapture).save().then(() => {
        overlay.style.setProperty('position', 'fixed', 'important');
        overlay.style.setProperty('overflow-y', 'auto', 'important');
        overlay.style.setProperty('height', '100vh', 'important');
        if (actionArea) actionArea.style.display = 'block';
    });
};
window.shareKakaoCombo = function (type) {
    // 1. 화면에 있는 텍스트 긁어오기
    let text = "";
    if (type === 'saju') {
        const freeText = document.getElementById('freeContentArea').innerText || "";
        const premiumText = document.getElementById('premiumContentArea').innerText || "";
        text = freeText + "\n" + premiumText;
    } else {
        text = document.getElementById('tarotResultContent').innerText || "";
    }

    // 2. 맨 밑에 홍보 링크 살짝 붙이기
    const snippet = text + "\n\n👉 소름 돋는 내 진짜 운세 확인하기\nhttps://fortune-story.com";

    // 3. 최신 클립보드 복사 기술 (모바일 완벽 호환)
    const copyToClipboard = async () => {
        try {
            // 최신 스마트폰 지원 방식
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(snippet);
            } else {
                // 구형 스마트폰 우회 방식
                const textarea = document.createElement('textarea');
                textarea.value = snippet;
                textarea.style.position = "fixed";
                textarea.style.left = "-999999px";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
        }
    };

    // 4. 복사 완료 후 카카오톡 실행하기
    copyToClipboard().then(() => {
        alert("✅ 운세 결과 전체가 '자동 복사' 되었습니다!\n\n카카오톡 채팅방이 열리면, 대화창을 꾹 눌러서 [붙여넣기]를 하시면 전체 내용이 깔끔하게 전송됩니다. 📋");

        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');

            // 카카오톡 말풍선에 보일 요약 내용 만들기
            const dynamicDesc = text.substring(0, 60).replace(/\n/g, ' ') + "...";

            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: type === 'saju' ? '포춘스토리 프리미엄 운세 결과' : '포춘스토리 프리미엄 타로 결과',
                    description: dynamicDesc,
                    imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                    link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' },
                },
                buttons: [{ title: '내 운세도 확인하기', link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' } }],
            });
        }
    });
};


window.copyManualText = function (type) {
    let text = "";
    if (type === 'saju') {
        const freeText = document.getElementById('freeContentArea').innerText || "";
        const premiumText = document.getElementById('premiumContentArea').innerText || "";
        text = freeText + "\n" + premiumText;
    } else {
        text = document.getElementById('tarotResultContent').innerText || "";
    }
    const snippet = text + "\n\n👉 소름 돋는 내 진짜 운세 확인하기\nhttps://fortune-story.com";

    const textarea = document.createElement('textarea');
    textarea.value = snippet;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        alert("결과 내용이 복사되었습니다! 📋\n인스타나 쓰레드에 길게 붙여넣기 해보세요.");
    } catch (e) {
        alert("복사 기능이 지원되지 않는 기기입니다.");
    }
    document.body.removeChild(textarea);
};

function preventExit(e) {
    e.preventDefault();
    e.returnValue = '분석이 진행 중입니다. 페이지를 나가시면 결과를 받을 수 없습니다!';
}

document.addEventListener('DOMContentLoaded', () => {

    // 🌍 [외국인 감지 로직] 한국어가 아닐 경우 타로 카드를 앞(왼쪽)으로 자동 배치
    const userLang = navigator.language || navigator.userLanguage;
    if (!userLang.startsWith('ko')) {
        const sajuCard = document.getElementById('sajuCard');
        const tarotCard = document.getElementById('tarotCard');
        if (sajuCard && tarotCard) {
            sajuCard.style.order = '2';
            tarotCard.style.order = '1';
        }
    }

    window.selectPath = function (path) {
        const gateway = document.getElementById('gateway');
        const sajuSection = document.getElementById('daily');
        const tarotSection = document.getElementById('tarot');

        if (gateway) gateway.style.display = 'none';

        if (path === 'saju') {
            if (sajuSection) {
                sajuSection.style.display = 'block';
                sajuSection.classList.remove('fade-in');
                void sajuSection.offsetWidth;
                sajuSection.classList.add('fade-in');
            }
            if (tarotSection) tarotSection.style.display = 'none';
        } else if (path === 'tarot') {
            if (sajuSection) sajuSection.style.display = 'none';
            if (tarotSection) {
                tarotSection.style.display = 'block';
                tarotSection.classList.remove('fade-in');
                void tarotSection.offsetWidth;
                tarotSection.classList.add('fade-in');
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prices = {
        daily: 3900,
        weekly: 5900,
        yearly: 9900,
        love: 8900,
        exam: 8900
    };

    const fortuneTypeSelect = document.getElementById('fortuneType');
    const priceDisplay = document.getElementById('priceDisplay');

    if (fortuneTypeSelect) {
        fortuneTypeSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            if (prices[selected]) {
                priceDisplay.textContent = `결제 금액: ${prices[selected].toLocaleString()}원`;
            }
        });
    }

    // 🌟 사주 폼 전송: 결제 대신 카카오 로그인 후 "부분 무료 공개"로 직행
    const sajuForm = document.getElementById('sajuForm');
    if (sajuForm) {
        sajuForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fortuneType = document.getElementById('fortuneType').value;
            const name = document.getElementById('name').value;
            const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;
            const year = document.getElementById('birthYear').value;
            const month = document.getElementById('birthMonth').value.padStart(2, '0');
            const day = document.getElementById('birthDay').value.padStart(2, '0');

            if (!year || !month || !day) {
                alert('생년월일을 모두 선택해주세요.');
                return;
            }

            let displayTypeName = "";
            switch (fortuneType) {
                case 'daily': displayTypeName = "오늘의 운세"; break;
                case 'weekly': displayTypeName = "주간 운세"; break;
                case 'yearly': displayTypeName = "1년 운세"; break;
                case 'love': displayTypeName = "연애운"; break;
                case 'exam': displayTypeName = "수능 운세"; break;
            }

            // 카카오 로그인을 통해 DB(고객 접점) 확보 후 바로 무료 영역 분석 시작
            if (!Kakao.isInitialized()) {
                Kakao.init('a5c28b4d706bced99d7282a87113ec82');
            }

            Kakao.Auth.login({
                success: function (authObj) {
                    // 로그인 성공 시 바로 분석 로딩창 띄움
                    startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus);
                },
                fail: function (err) {
                    // 로그인 거부/실패 시에도 일단 테스트나 진행을 위해 넘어가게 처리할 수 있습니다.
                    alert("카카오 로그인이 취소되었습니다. 분석을 시작합니다.");
                    startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus);
                }
            });
        });
    }

    // (생년월일 셀렉트 박스 생성 및 타로 폼 코드는 기존 유지 - 생략 없이 포함)
    const birthYearSelect = document.getElementById('birthYear');
    const birthMonthSelect = document.getElementById('birthMonth');
    const birthDaySelect = document.getElementById('birthDay');
    if (birthYearSelect && birthMonthSelect && birthDaySelect) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            birthYearSelect.appendChild(new Option(`${i}년`, i));
        }
        for (let i = 1; i <= 12; i++) {
            birthMonthSelect.appendChild(new Option(`${i}월`, i));
        }
        for (let i = 1; i <= 31; i++) {
            birthDaySelect.appendChild(new Option(`${i}일`, i));
        }
    }

    const birthHourSelect = document.getElementById('birthHour');
    const birthMinuteSelect = document.getElementById('birthMinute');
    if (birthHourSelect && birthMinuteSelect) {
        for (let i = 1; i <= 12; i++) birthHourSelect.appendChild(new Option(`${i}시`, i));
        for (let i = 0; i <= 59; i++) birthMinuteSelect.appendChild(new Option(`${i.toString().padStart(2, '0')}분`, i.toString().padStart(2, '0')));
    }

    function startProfessionalAnalysis(name, typeName, year, month, day, fortuneType, maritalStatus) {
        const loadingScreen = document.getElementById('analysisLoading');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingMessage = document.getElementById('loadingMessage');

        window.addEventListener('beforeunload', preventExit);
        document.body.style.overflow = 'hidden';
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (loadingTitle) loadingTitle.innerHTML = `'${name}'님의 <span class="obangsaek-text">${typeName}</span> 분석 진행 중...`;

        const messages = [
            `${name}님의 생년월일시를 바탕으로 사주 명식을 도출하고 있습니다...`,
            `선택하신 '${typeName}'에 맞추어 맞춤형 풀이를 진행 중입니다...`,
            "천간과 지지의 상생상극을 통해 음양오행의 조화를 계산 중입니다...",
            "정밀 운세 보고서를 생성합니다..."
        ];

        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            if (msgIndex < messages.length) {
                if (loadingMessage) loadingMessage.innerText = messages[msgIndex];
                msgIndex++;
            }
        }, 1200);

        getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus)
            .then(aiResult => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                window.removeEventListener('beforeunload', preventExit);
                showFinalResult(name, typeName, year, month, day, aiResult, fortuneType);
            })
            .catch(err => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                window.removeEventListener('beforeunload', preventExit);
                alert("현재 분석 서버에 트래픽이 몰려 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
            });
    }

    async function getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus) {
        const url = `/api/gemini`;

        let specificInstructions = "";
        let lengthInstruction = ""; // 🚨 2번 해결: 상품별 글자 수 차등화 지시문

        if (fortuneType === 'daily') {
            specificInstructions = "오늘 하루의 운세이므로, 아침(태동), 점심(절정), 저녁(갈무리) 시간대별 기운의 변화와 구체적인 행동 지침을 작성하세요.";
            lengthInstruction = "모바일에서 가볍게 읽을 수 있도록 각 섹션당 300~400자 내외로 짧고 강렬하게 핵심만 작성하세요. 절대 길게 쓰지 마세요.";
        } else if (fortuneType === 'weekly') {
            specificInstructions = "일주일간의 운세이므로, 월요일부터 일요일까지 요일별 기운의 흐름과 일진을 풀어쓰세요.";
            lengthInstruction = "각 섹션당 500자 내외로 흐름이 잘 보이게 적절히 작성하세요.";
        } else if (fortuneType === 'yearly') {
            specificInstructions = "1년 전체의 흐름을 분석하는 것이므로, 1월부터 12월까지 각 월별 운세 흐름을 상세하게 풀어쓰세요.";
            lengthInstruction = "1년 전체의 방대한 흐름이므로 돈을 지불한 고객이 감동하도록 각 섹션마다 최소 1500자 이상 아주 방대하고 깊이 있게 작성하세요.";
        } else if (fortuneType === 'love') {
            const mStatus = maritalStatus === 'married' ? '기혼' : '미혼';
            specificInstructions = `현재 고객은 ${mStatus} 상태입니다. 이에 맞추어 현재의 애정 전선, 인연의 작용을 심리학적, 명리학적으로 매우 깊이 있게 분석하세요.`;
            lengthInstruction = "각 섹션마다 최소 1000자 이상 깊이 있게 작성하세요.";
        } else {
            specificInstructions = "고객의 전반적인 삶의 궤적과 운기의 흐름을 심도 있게 분석하세요.";
            lengthInstruction = "각 섹션마다 최소 1000자 이상 깊이 있게 작성하세요.";
        }

        const systemPrompt = `당신은 상위 0.1% VIP를 전담하는 대한민국 최고 수준의 명리학자입니다.
[🔥 핵심 작성 규칙 🔥]
1. 서론/인사말 절대 금지: "존경하는 ~님" 같은 뻔한 인사말은 절대 쓰지 마세요.
2. 분량 강제 (절대 엄수): ${lengthInstruction}
3. 호칭: 무조건 '${name}님'이라고 부르세요.
4. 용어 풀이: 명리학 용어는 무조건 '한자(한글)' 표기법을 지키세요.

[운세 맞춤형 특별 지침]
${specificInstructions}

반드시 아래 JSON 형식으로 응답하세요.
{
  "title1": "첫 번째 소제목", "content1": "첫 번째 내용...",
  "title2": "두 번째 소제목", "content2": "두 번째 내용...",
  "title3": "세 번째 소제목", "content3": "세 번째 내용...",
  "title4": "네 번째 소제목", "content4": "네 번째 내용...",
  "title5": "다섯 번째 소제목", "content5": "다섯 번째 내용..."
}`;

        const userPrompt = `- 이름: ${name}\n- 생년월일: ${year}년 ${month}월 ${day}일\n- 요청한 운세: ${typeName}\n위 사람의 사주 명식을 분석해 주세요.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: { response_mime_type: "application/json", temperature: 0.8 }
            })
        });

        if (!response.ok) throw new Error("API 연동 실패");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    }

    function showFinalResult(name, typeName, year, month, day, aiResult, fortuneType) {
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.star-bg-fixed').style.display = 'none';
        document.getElementById('daily').style.display = 'none';

        const resultSection = document.getElementById('result');
        const freeContentArea = document.getElementById('freeContentArea');
        const premiumContentArea = document.getElementById('premiumContentArea');
        const paperContainer = document.querySelector('.paper-container');

        resultSection.style.display = 'block';

        const personalColorInfo = getPersonalColor(year);
        paperContainer.style.setProperty('--personal-bg', personalColorInfo.bgHex);
        paperContainer.style.setProperty('--personal-color', personalColorInfo.textHex);
        paperContainer.style.setProperty('--personal-highlight', personalColorInfo.highlightHex);

        document.getElementById('resultTitle').innerHTML = `<span style="font-size: 0.65em; color: ${personalColorInfo.highlightHex}; letter-spacing: 1px;">${name}님을 위해 풀어낸 명리 비결</span><br><span style="font-size: 1.15em; display: inline-block; margin-top: 15px;">${typeName}</span>`;

        const hashString = name + year + month + day;
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
        hash = Math.abs(hash);

        const keywords = [
            { hanja: '秀 越', title: '수월(秀越)', desc: '남달리 빼어나고 훌륭하다는 의미' },
            { hanja: '氣 槪', title: '기개(氣槪)', desc: '굽히지 않고 꿋꿋하게 뻗어나가는 힘' },
            { hanja: '溫 和', title: '온화(溫和)', desc: '따뜻하고 부드러운 봄볕 같은 성품' },
            { hanja: '明 哲', title: '명철(明哲)', desc: '사리를 밝게 분별하는 지혜로움' },
            { hanja: '鎭 重', title: '진중(鎭重)', desc: '태도가 점잖고 무게가 있음' }
        ];
        const keyword = keywords[hash % keywords.length];

        // 🟢 무료 제공 HTML (오행 그래프와 타고난 기운 1개)
        let freeHTML = `
            <div style="text-align: center; margin-top: 2rem; margin-bottom: 2rem; padding: 2.5rem 1.5rem; border: 1px solid ${personalColorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15);">
                <div style="font-size: 1.15rem; color: ${personalColorInfo.textHex}; margin-bottom: 1.5rem; font-weight: bold;">[무료 공개] 당신의 행운 키워드</div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">${keyword.hanja}</span>
                </div>
                <div style="font-size: 1.05rem; color: ${personalColorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    <strong style="font-size: 1.15rem;">${keyword.title}</strong> : ${keyword.desc}
                </div>
            </div>
            ${generateSajuChartsHTML(personalColorInfo, hash)}
        `;
        freeContentArea.innerHTML = freeHTML;

        // 🔴 결제 유도 블러 처리용 HTML (AI가 작성한 심층 내용 5가지)
        let premiumHTML = "";
        for (let i = 1; i <= 5; i++) {
            if (aiResult[`title${i}`] && aiResult[`content${i}`]) {
                let formattedContent = aiResult[`content${i}`].split(/\n|\\n/).filter(p => p.trim() !== '').map(p => {
                    return `<p style="color: #FDFBF7; font-size: 1.05rem; line-height: 2.0; margin-bottom: 1.5rem; text-align: justify; word-break: keep-all;">${p.replace(/\[|\]|\*/g, '').trim()}</p>`;
                }).join('');

                premiumHTML += `
                    <div style="margin-top: 3.5rem; margin-bottom: 1rem;">
                        <h3 style="text-align: center; color: ${personalColorInfo.highlightHex}; font-size: 1.3rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 15px;">
                            ${aiResult[`title${i}`].replace(/\[|\]/g, '')}
                        </h3>
                        ${formattedContent}
                    </div>
                `;
            }
        }
        premiumContentArea.innerHTML = premiumHTML;

        // 결제 모달 띄우기 함수 연동
        const currentPrice = { daily: 3900, weekly: 5900, yearly: 9900, love: 8900, exam: 8900 }[fortuneType];
        document.getElementById('btnUnlockPremium').onclick = () => window.openSajuPayment(typeName, currentPrice);

        window.scrollTo(0, 0);
    }

    // 결제 창 띄우기 및 블러 해제 (1번 해결)
    window.openSajuPayment = function (typeName, amount) {
        const paymentModal = document.getElementById('paymentModal');
        document.getElementById('paymentFortuneType').textContent = typeName;
        document.getElementById('paymentAmount').textContent = amount.toLocaleString() + "원";
        paymentModal.style.display = 'flex';

        document.querySelector('.close-modal').onclick = () => paymentModal.style.display = 'none';

        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        confirmPaymentBtn.onclick = () => {
            confirmPaymentBtn.textContent = "결제 진행 중...";
            confirmPaymentBtn.disabled = true;

            const tossPayments = TossPayments("test_ck_0RnYX2w532xnx91LmkYxrNeyqApQ");
            tossPayments.requestPayment('카드', {
                amount: amount,
                orderId: 'saju_' + new Date().getTime(),
                orderName: typeName,
                customerName: "고객",
                successUrl: window.location.href,
                failUrl: window.location.href,
            }).catch(function (error) {
                // [테스트용] 결제 취소 시에도 블러가 해제되도록 허용하여 진우님이 직접 볼 수 있게 함
                if (error.code === 'USER_CANCEL') {
                    paymentModal.style.display = 'none';
                    confirmPaymentBtn.textContent = "결제하기";
                    confirmPaymentBtn.disabled = false;

                    // ✨ 블러 해제 및 공유 버튼 표시 ✨
                    document.getElementById('premiumContentArea').classList.add('unlocked');
                    document.getElementById('unlockOverlay').style.display = 'none';

                    const sajuActionsArea = document.getElementById('sajuActionsArea');
                    sajuActionsArea.style.display = 'block';
                    sajuActionsArea.innerHTML = `
                        <div id="sajuCustomBtnArea" style="margin-top: 1rem; text-align: center; border-top: 1px dashed rgba(197, 160, 89, 0.6); padding-top: 2.5rem; padding-bottom: 2rem;">
                            <p style="color: #FFDF73; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">이 놀라운 심층 운세 결과를 보관하시겠습니까?</p>
                            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                                <button class="btn-premium kakao" style="font-size: 1.05rem; width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; border: none; height: 55px;" onclick="shareKakaoCombo('saju')">💬 카카오톡으로 전체 공유하기</button>
                                <button class="btn-premium outline" style="font-size: 1.05rem; width: 100%; border-radius: 50px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid #fff; height: 55px;" onclick="copyManualText('saju')">📋 전체 텍스트 수동 복사하기</button>
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="handlePdfPrint('saju')">📄 PDF로 저장</button>
                                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="location.reload()">🔄 다른 운세 보기</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        };
    };

    function getPersonalColor(yearStr) {
        const yearNum = parseInt(yearStr);
        const lastDigit = yearNum % 10;
        if (lastDigit === 4 || lastDigit === 5) return { element: '목(木)', colorName: '초록', textHex: '#DCE775', bgHex: '#1B5E20', highlightHex: '#C5E1A5', borderRgba: 'rgba(197, 225, 165, 0.4)' };
        if (lastDigit === 6 || lastDigit === 7) return { element: '화(火)', colorName: '빨강', textHex: '#FFCCBC', bgHex: '#B71C1C', highlightHex: '#FFAB91', borderRgba: 'rgba(255, 171, 145, 0.4)' };
        if (lastDigit === 8 || lastDigit === 9) return { element: '토(土)', colorName: '노랑', textHex: '#FFE082', bgHex: '#3E2723', highlightHex: '#FFD54F', borderRgba: 'rgba(255, 213, 79, 0.4)' };
        if (lastDigit === 0 || lastDigit === 1) return { element: '금(金)', colorName: '은백색', textHex: '#EEEEEE', bgHex: '#263238', highlightHex: '#FFFFFF', borderRgba: 'rgba(255, 255, 255, 0.4)' };
        return { element: '수(水)', colorName: '검정/푸른색', textHex: '#B3E5FC', bgHex: '#0D47A1', highlightHex: '#81D4FA', borderRgba: 'rgba(129, 212, 250, 0.4)' };
    }

    function generateSajuChartsHTML(colorInfo, hash) {
        const elements = ['木(목)', '火(화)', '土(토)', '金(금)', '水(수)'];
        const eColors = ['#4CAF50', '#F44336', '#FFC107', '#9E9E9E', '#2196F3'];

        let v1 = (hash % 30) + 5, v2 = ((hash >> 2) % 30) + 5, v3 = ((hash >> 4) % 30) + 5, v4 = ((hash >> 6) % 30) + 5, v5 = ((hash >> 8) % 30) + 5;
        const total = v1 + v2 + v3 + v4 + v5;
        const percentages = [Math.round((v1 / total) * 100), Math.round((v2 / total) * 100), Math.round((v3 / total) * 100), Math.round((v4 / total) * 100)];
        percentages.push(100 - percentages.reduce((a, b) => a + b, 0));

        const size = 320, center = 160, radius = 110;
        let webPaths = '', dataSegmentHTML = '', dataPoints = '';

        for (let level = 1; level <= 5; level++) {
            let points = '';
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI / 2) - (i * 2 * Math.PI / 5);
                points += `${center + (radius * (level / 5)) * Math.cos(angle)},${center - (radius * (level / 5)) * Math.sin(angle)} `;
            }
            webPaths += `<polygon points="${points.trim()}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
        }

        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI / 2) - (i * 2 * Math.PI / 5);
            webPaths += `<line x1="${center}" y1="${center}" x2="${center + radius * Math.cos(angle)}" y2="${center - radius * Math.sin(angle)}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />`;
        }

        percentages.forEach((p, idx) => {
            let scaledRad = Math.max(10, Math.min((p / 40) * radius, radius));
            const angle = (Math.PI / 2) - (idx * 2 * Math.PI / 5);
            const px = center + scaledRad * Math.cos(angle), py = center - scaledRad * Math.sin(angle);
            dataPoints += `${px},${py} `;

            dataSegmentHTML += `<circle cx="${px}" cy="${py}" r="4" fill="${eColors[idx]}" filter="drop-shadow(0 0 4px ${eColors[idx]})" />`;

            const tx = center + (radius + 25) * Math.cos(angle), ty = center - (radius + 25) * Math.sin(angle);
            const anchor = Math.abs(tx - center) > 10 ? (tx > center ? "start" : "end") : "middle";
            dataSegmentHTML += `
                <text x="${tx}" y="${ty - 5}" fill="${eColors[idx]}" font-size="16" font-weight="bold" text-anchor="${anchor}">${elements[idx].split('(')[0]}</text>
                <text x="${tx}" y="${ty + 12}" fill="#ddd" font-size="12" text-anchor="${anchor}">(${elements[idx].split('(')[1]} ${p}%</text>`;
        });

        return `
            <div style="margin-top: 3rem; margin-bottom: 3rem; padding: 2.5rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2); box-shadow: inset 0 0 15px rgba(0,0,0,0.3);">
                <div style="font-size: 1.2rem; color: ${colorInfo.textHex}; margin-bottom: 0.5rem; font-weight: bold; text-align: center; letter-spacing: 1px;">오행(五行) 분포도</div>
                <div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 2rem;">상생(相生)과 상극(相剋)의 조화</div>
                <div style="display: flex; justify-content: center; align-items: center; position: relative;">
                    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow: visible;">
                        <defs>
                            <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="${colorInfo.textHex}" stop-opacity="0.4" />
                                <stop offset="100%" stop-color="${colorInfo.highlightHex}" stop-opacity="0.1" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        ${webPaths}
                        <polygon points="${dataPoints.trim()}" fill="url(#polyGrad)" stroke="${colorInfo.textHex}" stroke-width="2" filter="url(#glow)"/>
                        ${dataSegmentHTML}
                    </svg>
                </div>
            </div>
        `;
    }

    window.loginWithKakao = function () {
        if (!Kakao.isInitialized()) {
            Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        }
        Kakao.Auth.login({
            success: function (authObj) {
                Kakao.API.request({
                    url: '/v2/user/me',
                    success: function (res) {
                        const userName = res.kakao_account.profile.nickname;
                        alert(userName + "님 환영합니다! 🎉\n성공적으로 로그인되었습니다. 아래에서 무료 운세를 확인하세요.");
                    }
                });
            }
        });
    };
});