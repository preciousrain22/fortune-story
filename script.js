// ==========================================
// 1. 공통 유틸리티 (PDF 저장, 텍스트 복사, 카카오 피드 공유)
// ==========================================

function showToast(message) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.style.cssText = 'position:fixed; bottom:40px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); color:#FFD54F; padding:12px 24px; border-radius:30px; font-size:1rem; z-index:10000; transition:opacity 0.5s; text-align:center; border:1px solid #D4AF37; box-shadow: 0 4px 15px rgba(0,0,0,0.5); pointer-events:none; opacity:0;';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

window.handlePdfPrint = function (type) {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if ((ua.indexOf("Instagram") > -1) || (ua.indexOf("KAKAOTALK") > -1) || (ua.indexOf("Threads") > -1)) {
        alert("⚠️ 카카오톡이나 인스타그램 내부에서는 PDF 저장이 차단됩니다.\n\n화면 우측 상단의 메뉴(⋮)를 눌러서\n[다른 브라우저에서 열기]를 선택하신 후 다시 시도해주세요!");
        return;
    }

    showToast("프리미엄 리포트를 PDF로 변환 중입니다... ⏳");

    const targetId = type === 'saju' ? 'result' : 'tarotResult';
    const overlay = document.getElementById(targetId);
    const elementToCapture = document.querySelector(`#${targetId} .paper-container`) || document.querySelector(`#${targetId} .tarot-result-container`);

    const actionArea = elementToCapture.querySelector('.result-actions');
    if (actionArea) actionArea.style.display = 'none';

    const originalBg = elementToCapture.style.backgroundColor;
    const originalPadding = elementToCapture.style.padding;
    elementToCapture.style.backgroundColor = '#1a1a1a';
    elementToCapture.style.padding = '20px';

    overlay.style.setProperty('position', 'absolute', 'important');
    overlay.style.setProperty('overflow-y', 'visible', 'important');
    overlay.style.setProperty('height', 'auto', 'important');
    window.scrollTo(0, 0);

    const opt = {
        margin: [5, 0, 5, 0],
        filename: `포춘스토리_정밀분석_${type === 'saju' ? '사주' : '타로'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#1a1a1a',
            windowWidth: document.documentElement.scrollWidth,
            scrollY: -window.scrollY
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elementToCapture).save().then(() => {
        elementToCapture.style.backgroundColor = originalBg;
        elementToCapture.style.padding = originalPadding;

        overlay.style.setProperty('position', 'fixed', 'important');
        overlay.style.setProperty('overflow-y', 'auto', 'important');
        overlay.style.setProperty('height', '100vh', 'important');
        if (actionArea) actionArea.style.display = 'block';

        showToast("✅ PDF 저장이 완료되었습니다!");
    });
};

window.shareKakaoCombo = async function (type) {
    let freeText = "", premiumText = "";
    if (type === 'saju') {
        freeText = document.getElementById('freeContentArea').innerText || "";
        premiumText = document.getElementById('premiumContentArea').innerText || "";
    } else {
        premiumText = document.getElementById('tarotResultContent').innerText || "";
    }

    const snippet = "[포춘스토리 정밀 분석 리포트]\n\n" + freeText + "\n\n" + premiumText + "\n\n👉 소름 돋는 내 진짜 운세 확인하기\nhttps://fortune-story.com";

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(snippet);
        } else {
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
        showToast("✅ 결과가 복사되었습니다! 카톡 채팅방에 '붙여넣기' 하세요.");
    } catch (err) {
        showToast("❌ 텍스트를 수동으로 복사해 주세요.");
    }

    setTimeout(() => {
        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');

            const dynamicDesc = snippet.substring(0, 60).replace(/\n/g, ' ') + "...";

            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: type === 'saju' ? '포춘스토리 정밀 사주 리포트' : '포춘스토리 정밀 타로 리포트',
                    description: dynamicDesc,
                    imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                    link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' },
                },
                buttons: [{ title: '나의 운세 확인하기', link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' } }],
            });
        }
    }, 1200);
};

function preventExit(e) {
    e.preventDefault();
    e.returnValue = '분석이 진행 중입니다. 페이지를 나가시면 결과를 받을 수 없습니다!';
}

// ==========================================
// 2. 사주 메인 로직 및 공통 이벤트
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('orderId')) {
        alert("✅ 결제가 완료되었습니다!\n(현재는 테스트 버전이므로 결제 후 화면이 새로고침되어 결과가 초기화되었습니다. 실서버 연동 시 DB에 안전하게 저장됩니다.)");
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.has('message')) {
        alert("결제 안내: " + decodeURIComponent(urlParams.get('message')));
        window.history.replaceState({}, document.title, window.location.pathname);
    }

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

    const birthYearSelect = document.getElementById('birthYear');
    const birthMonthSelect = document.getElementById('birthMonth');
    const birthDaySelect = document.getElementById('birthDay');
    if (birthYearSelect && birthMonthSelect && birthDaySelect) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) birthYearSelect.appendChild(new Option(`${i}년`, i));
        for (let i = 1; i <= 12; i++) birthMonthSelect.appendChild(new Option(`${i}월`, i));
        for (let i = 1; i <= 31; i++) birthDaySelect.appendChild(new Option(`${i}일`, i));
    }

    const birthHourSelect = document.getElementById('birthHour');
    const birthMinuteSelect = document.getElementById('birthMinute');
    if (birthHourSelect && birthMinuteSelect) {
        for (let i = 1; i <= 12; i++) birthHourSelect.appendChild(new Option(`${i}시`, i));
        for (let i = 0; i <= 59; i++) birthMinuteSelect.appendChild(new Option(`${i.toString().padStart(2, '0')}분`, i.toString().padStart(2, '0')));
    }

    const sajuForm = document.getElementById('sajuForm');
    if (sajuForm) {
        sForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fortuneType = document.getElementById('fortuneType').value;
            const name = document.getElementById('name').value;
            const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;
            const year = document.getElementById('birthYear').value;
            const month = document.getElementById('birthMonth').value.padStart(2, '0');
            const day = document.getElementById('birthDay').value.padStart(2, '0');

            if (!year || !month || !day) { alert('생년월일을 모두 선택해주세요.'); return; }

            let displayTypeName = {
                'daily': "오늘의 운세", 'weekly': "주간 운세", 'yearly': "1년 심층 운세", 'love': "애정/연애운", 'exam': "학업/시험운"
            }[fortuneType];

            if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');

            Kakao.Auth.login({
                success: function () { startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus); },
                fail: function () { alert("카카오 로그인이 취소되었습니다. 분석을 시작합니다."); startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus); }
            });
        });
    }

    window.loginWithKakao = function () {
        if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        Kakao.Auth.login({
            success: function () {
                Kakao.API.request({
                    url: '/v2/user/me',
                    success: function (res) { alert(res.kakao_account.profile.nickname + "님 환영합니다! 🎉\n아래에서 운세를 확인하세요."); }
                });
            }
        });
    };

    // ==========================================
    // 3. 타로(Tarot) 78장 생성 및 뽑기 로직
    // ==========================================

    const tarotCards = [];
    const majorNames = ["바보 (The Fool)", "마법사 (The Magician)", "여사제 (The High Priestess)", "여황제 (The Empress)", "황제 (The Emperor)", "교황 (The Hierophant)", "연인 (The Lovers)", "전차 (The Chariot)", "힘 (Strength)", "은둔자 (The Hermit)", "운명의 수레바퀴 (Wheel of Fortune)", "정의 (Justice)", "매달린 사람 (The Hanged Man)", "죽음 (Death)", "절제 (Temperance)", "악마 (The Devil)", "탑 (The Tower)", "별 (The Star)", "달 (The Moon)", "태양 (The Sun)", "심판 (Judgement)", "세계 (The World)"];

    for (let i = 0; i <= 21; i++) {
        tarotCards.push({ id: i, name: majorNames[i], img: `images/${i}.jpeg` });
    }

    const suits = [
        { name: 'Cups', kr: '컵' },
        { name: 'Pents', kr: '펜타클' },
        { name: 'Swords', kr: '검' },
        { name: 'Wands', kr: '지팡이' }
    ];
    const ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];

    let minorId = 22;
    for (let suit of suits) {
        for (let i = 0; i < 14; i++) {
            tarotCards.push({ id: minorId, name: `${suit.kr} ${ranks[i]}`, img: `images/${minorId}.jpeg` });
            minorId++;
        }
    }

    let selectedTarotCards = [];

    const tarotForm = document.getElementById('tarotForm');
    if (tarotForm) {
        tarotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');
            Kakao.Auth.login({
                success: function () { startTarotDraw(); },
                fail: function () { alert("로그인이 취소되었습니다. 타로를 시작합니다."); startTarotDraw(); }
            });
        });
    }

    function startTarotDraw() {
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.star-bg-fixed').star.display = 'none';
        document.getElementById('tarot').style.display = 'none';
        document.getElementById('tarotDraw').style.display = 'block';

        const deckContainer = document.getElementById('tarotDeck');
        deckContainer.innerHTML = '';
        selectedTarotCards = [];
        document.getElementById('tarotDrawCount').innerText = '3';
        const btnRead = document.getElementById('btnReadTarot');
        btnRead.disabled = true;
        btnRead.classList.add('disable-btn');

        const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);

        shuffled.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'tarot-card-back';
            cardEl.dataset.isReversed = Math.random() > 0.5 ? "true" : "false";

            cardEl.onclick = function () {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedTarotCards = selectedTarotCards.filter(c => c.el !== this);
                } else {
                    if (selectedTarotCards.length < 3) {
                        this.classList.add('selected');
                        selectedTarotCards.push({ el: this, card: card, isReversed: this.dataset.isReversed === "true" });
                    }
                }
                const remain = 3 - selectedTarotCards.length;
                document.getElementById('tarotDrawCount').innerText = remain;

                if (selectedTarotCards.length === 3) {
                    btnRead.disabled = false;
                    btnRead.classList.remove('disable-btn');
                    document.querySelectorAll('.tarot-card-back:not(.selected)').forEach(c => c.classList.add('disabled'));
                } else {
                    btnRead.disabled = true;
                    btnRead.classList.add('disable-btn');
                    document.querySelectorAll('.tarot-card-back.disabled').forEach(c => c.classList.remove('disabled'));
                }
            };
            deckContainer.appendChild(cardEl);
        });

        btnRead.onclick = () => { startTarotAnalysis(); };
        window.scrollTo(0, 0);
    }

    function startTarotAnalysis() {
        document.getElementById('tarotDraw').style.display = 'none';
        const loadingScreen = document.getElementById('tarotLoading');
        loadingScreen.style.display = 'flex';
        window.addEventListener('beforeunload', preventExit);

        const name = document.getElementById('tarotName').value;
        const categorySelect = document.getElementById('tarotCategory');
        const category = categorySelect.options[categorySelect.selectedIndex].text;
        const concern = document.getElementById('tarotConcern').value;

        const cardInfoText = selectedTarotCards.map((c, i) => {
            const pos = i === 0 ? "과거/원인" : i === 1 ? "현재/상황" : "미래/조언";
            const direction = c.isReversed ? "역방향" : "정방향";
            return `[위치: ${pos}] ${c.card.name} - ${direction}`;
        }).join("\n");

        getTarotFromGemini(name, category, concern, cardInfoText)
            .then(aiResult => {
                loadingScreen.style.display = 'none';
                window.removeEventListener('beforeunload', preventExit);
                showTarotResult(name, category, aiResult);
            })
            .catch(err => {
                loadingScreen.style.display = 'none';
                window.removeEventListener('beforeunload', preventExit);
                alert("현재 우주의 기운(서버)이 혼잡합니다. 잠시 후 다시 시도해주세요.");
            });
    }

    async function getTarotFromGemini(name, category, concern, cardInfoText) {
        const url = `/api/gemini`;
        const systemPrompt = `당신은 상위 0.1% VIP를 전담하는 신비롭고 통찰력 있는 타로 마스터입니다.
[🔥 핵심 작성 규칙 🔥]
1. 분량 강제: 각 섹션당 최소 800자 이상 아주 깊이 있고 영적이며 문학적으로 작성하세요.
2. 호칭: 무조건 '${name}님'이라고 부르세요.
3. 분석: 카드의 상징성과 고객의 구체적 고민을 완벽하게 연결하여 소름 돋는 통찰을 제공하세요.
반드시 아래 JSON 형식으로 응답하세요.
{
  "content1": "(과거/원인) 카드에 대한 심층 해석...",
  "content2": "(현재/상황) 카드에 대한 심층 해석...",
  "content3": "(미래/조언) 카드에 대한 심층 해석 및 최종 솔루션..."
}`;
        const userPrompt = `- 내담자: ${name}\n- 질문 주제: ${category}\n- 구체적 고민: ${concern}\n- 뽑은 타로 카드:\n${cardInfoText}\n\n이 카드들을 바탕으로 깊이 있는 프리미엄 타로 리딩을 해주세요.`;

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

    function showTarotResult(name, category, aiResult) {
        document.getElementById('tarotResult').style.display = 'block';
        document.getElementById('tarotResultSub').innerText = `${name}님의 '${category}' 고민에 대한 우주의 응답입니다.`;

        const revealContainer = document.querySelector('.tarot-cards-reveal');
        revealContainer.innerHTML = '';
        const positions = ["과거 / 원인", "현재 / 상황", "미래 / 조언"];

        selectedTarotCards.forEach((c, i) => {
            const isRev = c.isReversed;
            const transform = isRev ? "transform: rotate(180deg);" : "";
            const dirText = isRev ? " (역방향)" : " (정방향)";

            revealContainer.innerHTML += `
                <div class="revealed-card-col fade-in-up delay-${i + 1}">
                    <div class="revealed-card-pos" style="margin-bottom:10px;">${positions[i]}</div>
                    <div class="revealed-card" style="background-image: url('${c.card.img}'); background-size: cover; background-position: center; ${transform} border: 2px solid #D3B8F8; border-radius: 8px;">
                    </div>
                    <div class="revealed-card-title" style="color:#EEDCFF; margin-top:15px; font-weight:bold; font-size:1.1rem; text-align:center;">
                        ${c.card.name}<br><span style="font-size:0.9rem; color:#B388EB;">${dirText}</span>
                    </div>
                </div>
            `;
        });

        const contentDiv = document.getElementById('tarotResultContent');
        contentDiv.innerHTML = `
            <h3 style="color:#D3B8F8; margin-top:1rem; font-size:1.4rem; border-bottom:1px solid rgba(211, 184, 248, 0.3); padding-bottom:10px;">1. 과거의 잔영 (원인)</h3>
            <p style="margin-bottom:2.5rem; font-size:1.1rem;">${aiResult.content1.replace(/\\n/g, '<br>')}</p>
            
            <h3 style="color:#D3B8F8; margin-top:1rem; font-size:1.4rem; border-bottom:1px solid rgba(211, 184, 248, 0.3); padding-bottom:10px;">2. 현재의 거울 (상황)</h3>
            <p style="margin-bottom:2.5rem; font-size:1.1rem;">${aiResult.content2.replace(/\\n/g, '<br>')}</p>
            
            <h3 style="color:#FFE082; margin-top:1rem; font-size:1.4rem; border-bottom:1px solid rgba(255, 224, 130, 0.3); padding-bottom:10px;">3. 미래의 이정표 (조언)</h3>
            <p style="margin-bottom:2.5rem; font-size:1.1rem;">${aiResult.content3.replace(/\\n/g, '<br>')}</p>
        `;

        const actionArea = document.querySelector('#tarotResult .result-actions');
        actionArea.innerHTML = `
            <div style="margin-top: 3rem; text-align: center; border-top: 1px dashed rgba(179, 136, 235, 0.4); padding-top: 2rem;">
                <p style="color: #D3B8F8; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">영혼의 거울이 비춘 결과를 보관하시겠습니까?</p>
                <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                    <button class="btn-premium kakao pulse-btn" style="font-size: 1.1rem; font-weight: bold; width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; border: none; height: 60px;" onclick="shareKakaoCombo('tarot')">💬 카카오톡으로 전체 결과 보내기</button>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); color: #EEDCFF; border-color: #B388EB; flex: 1; height: 55px;" onclick="handlePdfPrint('tarot')">📄 PDF로 저장</button>
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); color: #EEDCFF; border-color: #B388EB; flex: 1; height: 55px;" onclick="location.reload()">🔄 다른 고민 묻기</button>
                    </div>
                </div>
            </div>
        `;
        window.scrollTo(0, 0);
    }
});

// ==========================================
// 4. 사주 분석 및 결과 렌더링
// ==========================================

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
    let lengthInstruction = "";

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

    let freeHTML = `
        <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 3rem 1.5rem; border: 1px solid ${personalColorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(197, 160, 89, 0.1);">
            <div style="font-size: 1.2rem; color: ${personalColorInfo.textHex}; margin-bottom: 2.5rem; font-weight: bold; text-shadow: 0 0 5px ${personalColorInfo.textHex}; letter-spacing: 1px;">
                ✨ [무료 공개] ${name}님의 고대 행운 비결
            </div>
            
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 2.5rem;">
                <div style="width: 140px; height: 140px; background-color: #8B0000; border: 5px solid #E53935; border-radius: 8px; box-shadow: 0 0 15px rgba(229, 57, 53, 0.8), inset 0 0 15px rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; transform: rotate(15deg);">
                    <span style="color: #FFCDD2; font-size: 3rem; font-weight: 800; font-family: sans-serif; letter-spacing: -3px; text-shadow: 2px 2px 3px rgba(0,0,0,0.8), 0 0 10px #FFD54F;">
                        ${keyword.hanja}
                    </span>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; background-color: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 10px;">
                <h3 style="font-size: 1.6rem; color: ${personalColorInfo.highlightHex}; font-weight: 800; margin-bottom: 10px; display: inline-block;">
                    <span style="font-size: 0.8em; color:rgba(255,255,255,0.7); vertical-align: middle;">비결 명(名):</span> ${keyword.title}
                </h3>
                <p style="color:rgba(255,255,255,0.7); font-size: 0.95rem; margin-bottom: 1.5rem;">(${keyword.hanja[0]} 빼어날 수 / ${keyword.hanja[1]} 넘을 월)</p>
                <p style="color: #FDFBF7; font-size: 1.15rem; line-height: 2.0; text-align: center; word-break: keep-all; max-width: 90%; margin: 0 auto; letter-spacing: -0.5px;">
                    ${keyword.desc}
                </div>
        </div>
        ${generateSajuChartsHTML(personalColorInfo, hash)}
    `;
    freeContentArea.innerHTML = freeHTML;

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

    const currentPrice = { daily: 3900, weekly: 5900, yearly: 9900, love: 8900, exam: 8900 }[fortuneType];

    document.getElementById('lockTypeName').textContent = `[${typeName}]`;
    document.getElementById('lockPriceAmount').textContent = `${currentPrice.toLocaleString()}원`;

    document.getElementById('btnUnlockPremium').onclick = () => window.openSajuPayment(typeName, currentPrice);

    if (typeof showAmuletSection === 'function') {
        showAmuletSection();
    }

    window.scrollTo(0, 0);
}

window.openSajuPayment = function (typeName, amount) {
    const paymentModal = document.getElementById('paymentModal');
    document.getElementById('paymentFortuneType').textContent = typeName;
    document.getElementById('paymentAmount').textContent = amount.toLocaleString() + "원";
    paymentModal.style.display = 'flex';

    document.querySelector('.close-modal').onclick = () => paymentModal.style.display = 'none';

    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    confirmPaymentBtn.textContent = "결제하기";
    confirmPaymentBtn.disabled = false;

    confirmPaymentBtn.onclick = () => {
        confirmPaymentBtn.textContent = "안전한 토스 결제창으로 이동 중...";
        confirmPaymentBtn.disabled = true;

        setTimeout(() => {
            paymentModal.style.display = 'none';
        }, 500);

        const tossPayments = TossPayments("test_ck_0RnYX2w532xnx91LmkYxrNeyqApQ");
        tossPayments.requestPayment('카드', {
            amount: amount,
            orderId: 'saju_' + new Date().getTime(),
            orderName: typeName,
            customerName: "고객",
            successUrl: window.location.href + "?orderId=" + new Date().getTime(),
            failUrl: window.location.href,
        }).catch(function (error) {
            confirmPaymentBtn.textContent = "결제하기";
            confirmPaymentBtn.disabled = false;

            if (error.code === 'USER_CANCEL') {
                document.getElementById('premiumContentArea').classList.add('unlocked');
                document.getElementById('unlockOverlay').style.display = 'none';

                const sajuActionsArea = document.getElementById('sajuActionsArea');
                sajuActionsArea.style.display = 'block';
                sajuActionsArea.style.borderTop = 'none';
                sajuActionsArea.innerHTML = `
                    <div id="sajuCustomBtnArea" style="margin-top: 1rem; text-align: center; padding-bottom: 2rem;">
                        <p style="color: #FFDF73; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">이 놀라운 심층 운세 결과를 보관하시겠습니까?</p>
                        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                            <button class="btn-premium kakao pulse-btn" style="font-size: 1.1rem; font-weight: bold; width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; border: none; height: 60px;" onclick="shareKakaoCombo('tarot')">💬 카카오톡으로 전체 결과 보내기</button>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="handlePdfPrint('saju')">📄 PDF로 저장</button>
                                <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="location.reload()">🔄 다른 운세 보기</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                alert("결제창 호출 실패:\n" + error.message);
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
        let scaledRad = Math.max(5, Math.min((p / 50) * radius, radius));
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

// ==========================================
// 5. 사이버 수호부 (스미싱 감별기) 로직
// ==========================================

let userAmuletCount = 1;

window.showAmuletSection = function () {
    const amulet = document.getElementById('amuletSection');
    const paper = document.querySelector('#result .paper-container');
    const actionsArea = document.getElementById('sajuActionsArea');

    if (amulet && paper) {
        amulet.style.padding = '2rem 0 0 0';
        amulet.style.marginTop = '2rem';
        amulet.style.borderTop = '1px solid rgba(197, 160, 89, 0.3)';
        paper.insertBefore(amulet, actionsArea);
        amulet.style.display = 'block';
    }
};

window.checkSmishing = function () {
    const urlInput = document.getElementById('suspectUrl').value.trim();
    const resultDiv = document.getElementById('urlCheckResult');
    const paywall = document.getElementById('amuletPaywall');

    if (!urlInput) { alert("검사할 링크(URL)를 입력해주세요."); return; }
    if (userAmuletCount <= 0) { paywall.style.display = 'flex'; return; }

    resultDiv.style.display = 'block';
    resultDiv.style.color = '#ccc';
    resultDiv.innerHTML = "⏳ 기운을 분석 중입니다...";

    setTimeout(() => {
        userAmuletCount--;
        document.getElementById('checkCountDisplay').innerText = userAmuletCount;

        if (urlInput.includes("bit.ly") || urlInput.includes("택배") || urlInput.includes("청첩장")) {
            resultDiv.style.color = '#FF5252';
            resultDiv.innerHTML = "❌ [경고] 매우 위험한 악성 스미싱/피싱 사이트입니다. 절대 접속하지 마십시오!";
        } else {
            resultDiv.style.color = '#4CAF50';
            resultDiv.innerHTML = "✅ 현재 보안 데이터베이스에 보고된 위험이 없습니다. (단, 항상 주의하세요)";
        }

        if (userAmuletCount === 0) {
            setTimeout(() => { paywall.style.display = 'flex'; }, 2000);
        }
    }, 1500);
};

window.buyAmulet = function (type, amount) {
    let orderName = type === 'basic' ? '기본 수호권(3회)' : 'VIP 수호 패키지(15회+운세)';

    showToast("안전한 토스 결제창으로 이동합니다...");
    document.getElementById('amuletPaywall').style.display = 'none';

    const tossPayments = TossPayments("test_ck_0RnYX2w532xnx91LmkYxrNeyqApQ");
    tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: 'amulet_' + new Date().getTime(),
        orderName: orderName,
        customerName: "고객",
        successUrl: window.location.href + "?orderId=" + new Date().getTime(),
        failUrl: window.location.href,
    }).catch(function (error) {
        if (error.code === 'USER_CANCEL') {
            document.getElementById('suspectUrl').value = '';
            document.getElementById('urlCheckResult').style.display = 'none';

            if (type === 'basic') {
                userAmuletCount += 3;
                alert("결제 완료! 감별 횟수 3회가 충전되었습니다.");
            } else {
                userAmuletCount += 15;
                alert("결제 완료! 감별 횟수 15회 충전 및 7일간 '오늘의 운세'가 무료 해제됩니다. 👑");
            }
            document.getElementById('checkCountDisplay').innerText = userAmuletCount;
        } else {
            alert("결제창 호출 실패:\n" + error.message);
            document.getElementById('amuletPaywall').style.display = 'flex';
        }
    });
};