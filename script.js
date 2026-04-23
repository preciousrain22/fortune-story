// ==========================================
// 1. 공통 유틸리티 (이미지 캡처 저장, 텍스트 복사, 카카오 피드 공유)
// ==========================================
// ==========================================
// 👑 마스터(VIP) 백도어 로직: 접속 시 주소창에 ?master=jinwoo 를 붙이세요
// ==========================================
(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('master') === 'jinwoo') {
        sessionStorage.setItem('isFortuneMaster', 'true');
        // 주소창을 깔끔하게 정리 (다른 사람이 못 보게)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    // 전역 변수로 마스터 여부 저장
    window.isMasterKey = sessionStorage.getItem('isFortuneMaster') === 'true';
})();

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

// 💡 기능 업데이트: 고화질 캡처를 위한 scale 옵션 뻥튀기 및 PNG 전환
window.handlePdfPrint = function (type) {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if ((ua.indexOf("Instagram") > -1) || (ua.indexOf("KAKAOTALK") > -1) || (ua.indexOf("Threads") > -1)) {
        alert("⚠️ 카카오톡/인스타 브라우저에서는 저장이 차단될 수 있습니다.\n\n우측 상단 메뉴(⋮)에서 [다른 브라우저에서 열기]를 선택해주세요!");
        return;
    }

    showToast("결과 이미지를 생성 중입니다... 📸\n(3~5초 소요)");

    const targetId = (type === 'saju' || type === 'face') ? 'result' : 'tarotResult';
    const elementToCapture = document.querySelector(`#${targetId} .paper-container`) || document.querySelector(`#${targetId} .tarot-result-container`);
    const actionArea = elementToCapture.querySelector('.result-actions');

    if (actionArea) actionArea.style.display = 'none';

    setTimeout(() => {
        html2canvas(elementToCapture, {
            scale: window.devicePixelRatio ? window.devicePixelRatio * 2 : 4, // 💡 핵심: 기기 해상도 대비 2배~4배 뻥튀기
            useCORS: true,
            backgroundColor: '#000000',
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.scrollWidth,
            allowTaint: true
        }).then(canvas => {
            if (actionArea) actionArea.style.display = 'block';
            const link = document.createElement('a');

            const fileNameType = type === 'saju' ? '사주' : (type === 'face' ? '관상' : '타로');
            link.download = `포춘스토리_정밀분석_${fileNameType}.png`;

            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            showToast("✅ 고화질로 사진첩에 저장이 완료되었습니다!");
        }).catch(err => {
            if (actionArea) actionArea.style.display = 'block';
            alert("이미지 저장 중 오류가 발생했습니다.");
        });
    }, 500);
}; // 함수 닫기 괄호 수정

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

document.addEventListener('DOMContentLoaded', () => window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
        window.selectPath(e.state.path, true);
    } else {
        window.selectPath('gateway', true);
    }
}));

const tarotConcern = document.getElementById('tarotConcern');
const tarotTextCount = document.getElementById('tarotTextCount');
if (tarotConcern && tarotTextCount) {
    tarotConcern.addEventListener('input', function () {
        const len = this.value.trim().length;
        tarotTextCount.innerText = `${len} / 최소 30자`;
        tarotTextCount.style.color = len >= 30 ? '#4CAF50' : '#FF5252';
    });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('paymentKey') && urlParams.has('orderId') && urlParams.has('amount')) {
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');

    showToast("안전하게 결제를 최종 승인하고 있습니다... ⏳");

    fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount })
    })
        .then(res => res.json())
        .then(data => {
            if (data.orderId) {
                alert("✅ 결제가 최종 완료되었습니다!\n프리미엄 리포트가 해제됩니다.");

                const savedResult = sessionStorage.getItem('savedSajuResultHTML');
                if (savedResult) {
                    document.querySelector('.header').style.display = 'none';
                    document.querySelector('.star-bg-fixed').style.display = 'none';
                    document.getElementById('daily').style.display = 'none';

                    const resultSec = document.getElementById('result');
                    resultSec.innerHTML = savedResult;
                    resultSec.style.display = 'block';

                    document.getElementById('premiumContentArea').classList.add('unlocked');
                    document.getElementById('unlockOverlay').style.display = 'none';

                    const sajuActionsArea = document.getElementById('sajuActionsArea');
                    sajuActionsArea.style.display = 'block';
                    sajuActionsArea.style.borderTop = 'none';
                    sajuActionsArea.innerHTML = `
                        <div id="sajuCustomBtnArea" style="margin-top: 1rem; text-align: center; padding-bottom: 2rem;">
                            <p style="color: #FFDF73; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">이 놀라운 심층 운세 결과를 보관하시겠습니까?</p>
                            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                                <button class="btn-premium kakao pulse-btn" style="font-size: 1.1rem; font-weight: bold; width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; border: none; height: 60px;" onclick="shareKakaoCombo('saju')">💬 카카오톡으로 전체 결과 보내기</button>
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="handlePdfPrint('saju')">📸 이미지로 저장</button>
                                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="location.reload()">🔄 다른 운세 보기</button>
                                </div>
                            </div>
                        </div>
                    `;
                    sessionStorage.removeItem('savedSajuResultHTML');
                }
            } else {
                alert("❌ 결제 승인 실패: " + (data.message || "알 수 없는 오류"));
            }
        })
        .catch(err => alert("서버 통신 오류가 발생했습니다."));

    window.history.replaceState({}, document.title, window.location.pathname);
} else if (urlParams.has('message')) {
    alert("결제 안내: " + decodeURIComponent(urlParams.get('message')));
    window.history.replaceState({}, document.title, window.location.pathname);
}

window.selectPath = function (path, isPopState = false) {
    const gateway = document.getElementById('gateway');
    const sajuSection = document.getElementById('daily');
    const tarotSection = document.getElementById('tarot');
    const faceSection = document.getElementById('faceSection');

    if (!isPopState) {
        window.history.pushState({ path: path }, '', path === 'gateway' ? window.location.pathname : `?path=${path}`);
    }

    const overlays = ['result', 'tarotResult', 'analysisLoading', 'tarotLoading', 'tarotDraw'];
    overlays.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.star-bg-fixed').style.display = 'block';

    if (gateway) gateway.style.display = 'none';
    if (sajuSection) sajuSection.style.display = 'none';
    if (tarotSection) tarotSection.style.display = 'none';
    if (faceSection) faceSection.style.display = 'none';

    if (path === 'gateway') {
        if (gateway) gateway.style.display = 'block';
    } else if (path === 'saju') {
        if (sajuSection) sajuSection.style.display = 'block';
    } else if (path === 'tarot') {
        if (tarotSection) tarotSection.style.display = 'block';
    } else if (path === 'face') {
        if (faceSection) faceSection.style.display = 'block';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


const sajuForm = document.getElementById('sajuForm');
if (sajuForm) {
    sajuForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fortuneType = document.getElementById('fortuneType').value;

        const rawName = document.getElementById('name').value.trim();
        window.isMasterKey = rawName.includes('**');
        const name = rawName.replace(/[*']/g, '');

        if (name.length < 2) {
            alert("정확한 분석을 위해 이름을 2글자 이상 입력해주세요.");
            return;
        }

        const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;

        const year = document.getElementById('birthYear').value;
        let month = document.getElementById('birthMonth').value;
        let day = document.getElementById('birthDay').value;

        if (!year || !month || !day) { alert('생년월일을 모두 입력해주세요.'); return; }

        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        if (monthNum < 1 || monthNum > 12) {
            alert("태어난 '월'을 정확히 입력해주세요. (1~12)");
            return;
        }
        if (dayNum < 1 || dayNum > 31) {
            alert("태어난 '일'을 정확히 입력해주세요. (1~31)");
            return;
        }

        month = month.padStart(2, '0');
        day = day.padStart(2, '0');

        let displayTypeName = {
            'daily': "오늘의 운세", 'weekly': "주간 운세", 'yearly': "1년 심층 운세", 'love': "애정/연애운", 'exam': "학업/시험운"
        }[fortuneType];

        if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');

        Kakao.Auth.login({
            throughTalk: false,
            success: function () { startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus); },
            fail: function () { alert("카카오 로그인이 취소되었습니다. 분석을 시작합니다."); startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus); }
        });
    });
}

// ==========================================
// 💡 카카오 로그인 및 Firebase DB 자동 수집 로직
// ==========================================

// 1. 파이어베이스 접속 키 (진우님이 복사하신 진짜 코드로 덮어쓰세요!)
const firebaseConfig = {
    apiKey: "AIzaSyCnzm66UrkO1rbMnenI0UN0DSNJFs0PebA",
    authDomain: "fortune-story.firebaseapp.com",
    projectId: "fortune-story",
    storageBucket: "fortune-story.firebasestorage.app",
    messagingSenderId: "576293866226",
    appId: "1:576293866226:web:90e4e63c30db23101bde6b"
};

// 2. 파이어베이스 시작
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();


const tarotCards = [];
const majorNames = ["바보", "마법사", "여사제", "여황제", "황제", "교황", "연인", "전차", "힘", "은둔자", "운명의 수레바퀴", "정의", "매달린 사람", "죽음", "절제", "악마", "탑", "별", "달", "태양", "심판", "세계"];

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

        const tarotName = document.getElementById('tarotName').value.trim();
        if (tarotName.length < 2) {
            alert("정확한 리딩을 위해 이름(별명)을 2글자 이상 입력해주세요.");
            return;
        }

        const concern = document.getElementById('tarotConcern').value.trim();
        if (concern.length < 30) {
            alert("카드가 정확한 해답을 보여줄 수 있도록 고민을 30자 이상 자세히 작성해주세요.");
            return;
        }

        if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        Kakao.Auth.login({
            throughTalk: false,
            success: function () { startTarotDraw(); },
            fail: function () { alert("로그인이 취소되었습니다. 타로를 시작합니다."); startTarotDraw(); }
        });
    });
}

function startTarotDraw() {
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.star-bg-fixed').style.display = 'none';
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
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            window.removeEventListener('beforeunload', preventExit);
            alert("현재 우주의 기운(서버 접속자)이 혼잡하여 정밀 분석이 지연되고 있습니다.\n1~2분 뒤에 다시 시도해 주세요. 🙏");
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
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); color: #EEDCFF; border-color: #B388EB; flex: 1; height: 55px;" onclick="handlePdfPrint('tarot')">📸 이미지로 저장</button>
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); color: #EEDCFF; border-color: #B388EB; flex: 1; height: 55px;" onclick="location.reload()">🔄 다른 고민 묻기</button>
                </div>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

// ==========================================
// 4. 사주 분석 및 결과 렌더링 (기존 유지)
// ==========================================

function startProfessionalAnalysis(name, typeName, year, month, day, fortuneType, maritalStatus) {
    const loadingScreen = document.getElementById('analysisLoading');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingMessage = document.getElementById('loadingMessage');

    window.addEventListener('beforeunload', preventExit);
    document.body.style.overflow = 'hidden';
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (loadingTitle) loadingTitle.innerHTML = `${name}님의 <span class="obangsaek-text">${typeName}</span> 분석 진행 중...`;

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
            alert("현재 우주의 기운(서버 접속자)이 혼잡하여 정밀 분석이 지연되고 있습니다.\n1~2분 뒤에 다시 시도해 주세요. 🙏");
        });
}

async function getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus) {
    const url = `/api/gemini`;

    let specificInstructions = "";
    let lengthInstruction = "";
    if (fortuneType === 'daily') {
        specificInstructions = "오늘 하루의 종합적인 기운을 분석하세요. [오늘의 총운], [금전/재물운], [사랑/애정운], [건강/활력운] 순서로 작성하고, 마지막에는 [행운의 아이템과 색상]을 하나씩 콕 짚어주세요.";
        lengthInstruction = "대중적인 운세 서비스처럼 핵심 위주로 명확하게, 섹션당 500자 내외로 작성하세요.";
    } else if (fortuneType === 'weekly') {
        specificInstructions = "일주일간의 운세이므로, 월요일부터 일요일까지 요일별 기운의 흐름과 일진을 풀어쓰세요.";
        lengthInstruction = "각 섹션당 600자 내외로 핵심을 깊이 있게 작성하세요.";
    } else if (fortuneType === 'yearly') {
        specificInstructions = "올해 1년의 거대한 운기 흐름과 디테일한 월별 운세를 모두 분석하는 '초정밀 신년 운세'입니다. 반드시 다음 순서대로 작성하세요: [1. 올해의 총운], [2. 금전 및 재물운], [3. 직업/사업운], [4. 연애/대인관계운], [5. 건강 및 주의사항], 그리고 [6. 1월 운세]부터 [17. 12월 운세]까지 총 17개의 파트(title1~title17)로 나누어 아주 방대하게 작성하세요.";
        lengthInstruction = "각 테마별 운세와 12개월 월별 운세를 각각 600~700자 내외로 매우 상세하고 전문적으로 작성하세요.";
    } else if (fortuneType === 'love') {
        const mStatus = maritalStatus === 'married' ? '기혼' : '미혼';
        specificInstructions = `현재 고객은 ${mStatus} 상태입니다. 이에 맞추어 현재의 애정 전선, 인연의 작용을 심리학적, 명리학적으로 분석하세요.`;
        lengthInstruction = "각 섹션마다 800~1000자 내외로 아주 깊이 있게 작성하세요.";
    } else {
        specificInstructions = "고객의 전반적인 삶의 궤적과 운기의 흐름을 심도 있게 분석하세요.";
        lengthInstruction = "각 섹션마다 800~1000자 내외로 아주 깊이 있게 작성하세요.";
    }

    const systemPrompt = `당신은 상위 0.1% VIP를 전담하는 대한민국 최고 수준의 명리학자입니다.
[🔥 핵심 작성 규칙 🔥]
1. 서론/인사말 절대 금지: "존경하는 ~님" 같은 뻔한 인사말은 절대 쓰지 마세요.
2. 분량 강제 (절대 엄수): ${lengthInstruction}
3. 호칭: 무조건 '${name}님'이라고 부르세요.
4. 용어 풀이: 명리학 용어는 무조건 '한자(한글)' 표기법을 지키세요.

[운세 맞춤형 특별 지침]
${specificInstructions}

반드시 아래 JSON 형식으로 응답하세요. (scores 항목을 반드시 포함하여 0~100 사이의 숫자로 평가하세요)
{
"scores": { "wealth": 85, "success": 90, "love": 75, "health": 80 },
"title1": "첫 번째 소제목", "content1": "첫 번째 내용...",
"title2": "두 번째 소제목", "content2": "두 번째 내용...",
"title3": "세 번째 소제목", "content3": "세 번째 내용...",
"title4": "네 번째 소제목", "content4": "네 번째 내용..."
}`;

    const calendarType = document.querySelector('input[name="calendarType"]:checked') ? document.querySelector('input[name="calendarType"]:checked').value : 'solar';

    const isUnknownTime = document.getElementById('unknownTime') && document.getElementById('unknownTime').checked;
    let hour = 0; let minute = 0;

    if (!isUnknownTime && document.getElementById('birthHour') && document.getElementById('birthMinute')) {
        let rawHour = parseInt(document.getElementById('birthHour').value) || 0;
        let rawMin = parseInt(document.getElementById('birthMinute').value) || 0;
        const amPm = document.getElementById('birthAmPm') ? document.getElementById('birthAmPm').value : 'AM';

        if (amPm === 'PM' && rawHour < 12) rawHour += 12;
        if (amPm === 'AM' && rawHour === 12) rawHour = 0;

        minute = rawMin - 30;
        hour = rawHour;
        if (minute < 0) {
            minute += 60;
            hour -= 1;
            if (hour < 0) hour = 23;
        }
    } else {
        hour = 12;
    }

    let lunarObj = calendarType === 'solar'
        ? Solar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0).getLunar()
        : Lunar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0);

    let bazi = lunarObj.getEightChar();
    let sajuStr = `${bazi.getYear()}년 ${bazi.getMonth()}월 ${bazi.getDay()}일 ${isUnknownTime ? '(시간모름)' : bazi.getTime() + '시'}`;

    let wuXing = bazi.getYearWuXing() + bazi.getMonthWuXing() + bazi.getDayWuXing();
    if (!isUnknownTime) wuXing += bazi.getTimeWuXing();
    const userPrompt = `- 이름: ${name}\n- 생년월일: ${year}년 ${month}월 ${day}일 (${calendarType})\n- 실제 명식(사주팔자): ${sajuStr}\n- 오행 구성: ${wuXing}\n- 요청한 운세: ${typeName}\n위 사람의 정확한 사주 명식과 오행 데이터를 바탕으로 정밀 분석해 주세요. 절대 다른 오행을 지어내지 마세요.`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { response_mime_type: "application/json", temperature: 0.8 }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`[HTTP 상태코드: ${response.status}]\n상세: ${errText}`);
    }

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

    const keywords = ['明哲(명철)', '和合(화합)', '發展(발전)', '安寧(안녕)', '通達(통달)', '繁榮(번영)', '平穩(평온)', '福祿(복록)', '成功(성공)', '幸運(행운)'];
    const randomKeyword = keywords[hash % keywords.length];

    // 💡 기능 업데이트: 사주 차트 하단에 일간 기반 '한 줄 요약 멘트' 추가 (generateSajuChartsHTML 내부에서 처리됨)
    let freeHTML = `
    <div style="text-align: center; margin-top: 2rem; margin-bottom: 2rem; padding: 2rem; border: 1px solid ${personalColorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2);">
        <div style="font-size: 0.9rem; color: ${personalColorInfo.textHex}; margin-bottom: 10px;">${name}님의 기운을 상징하는 고유 명리 키워드</div>
        <div class="red-seal" style="font-size: 2.5rem; margin-bottom: 15px; color: ${personalColorInfo.highlightHex} !important; border-color: ${personalColorInfo.highlightHex}; display: inline-block; padding: 10px 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); background-color: rgba(0,0,0,0.5);">${randomKeyword}</div>
        <div style="font-size: 1.1rem; color: #fff;">수호 오행: <strong style="color: ${personalColorInfo.highlightHex};">${personalColorInfo.element} (${personalColorInfo.colorName})</strong></div>
        <div style="font-size: 0.9rem; color: #aaa; margin-top: 10px;">이 키워드와 색상을 가까이하시면 좋은 기운이 증폭됩니다.</div>
    </div>
    ${generateSajuChartsHTML(personalColorInfo, year, month, day)}
    `;
    freeContentArea.innerHTML = freeHTML;

    let premiumHTML = "";

    if (aiResult.scores) {
        const s = aiResult.scores;
        premiumHTML += `
    <div style="margin-top: 1rem; margin-bottom: 3rem; padding: 2rem; background: rgba(0,0,0,0.4); border-radius: 15px; border: 1px solid rgba(212, 175, 55, 0.3);">
        <h3 style="text-align: center; color: #FFDF73; font-size: 1.3rem; margin-bottom: 2rem; font-weight: bold;">📊 핵심 운기 지표</h3>
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>💰 재물/금전운</span><span style="color: #FFD54F;">${s.wealth}점</span></div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;">
                <div style="width: ${s.wealth}%; background: linear-gradient(90deg, #F9F6CA, #D4AF37); height: 100%; border-radius: 7px;"></div>
            </div>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>📈 성공/학업운</span><span style="color: #4CAF50;">${s.success}점</span></div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;">
                <div style="width: ${s.success}%; background: linear-gradient(90deg, #A5D6A7, #4CAF50); height: 100%; border-radius: 7px;"></div>
            </div>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>❤️ 애정/대인운</span><span style="color: #FF8A80;">${s.love}점</span></div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;">
                <div style="width: ${s.love}%; background: linear-gradient(90deg, #FFCDD2, #FF5252); height: 100%; border-radius: 7px;"></div>
            </div>
        </div>
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>💪 건강/활력운</span><span style="color: #81D4FA;">${s.health}점</span></div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;">
                <div style="width: ${s.health}%; background: linear-gradient(90deg, #B3E5FC, #29B6F6); height: 100%; border-radius: 7px;"></div>
            </div>
        </div>
    </div>
    `;
    }

    for (let i = 1; i <= 20; i++) {
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

    if (window.isMasterKey) {
        document.getElementById('premiumContentArea').classList.add('unlocked');
        document.getElementById('unlockOverlay').style.display = 'none';

        const sajuActionsArea = document.getElementById('sajuActionsArea');
        sajuActionsArea.style.display = 'block';
        sajuActionsArea.innerHTML = `
        <div style="margin-top: 1rem; text-align: center; padding-bottom: 2rem;">
            <p style="color: #FFDF73; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">👑 마스터 권한으로 즉시 해제되었습니다.</p>
            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                <button class="btn-premium kakao pulse-btn" style="font-size: 1.1rem; font-weight: bold; width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; border: none; height: 60px;" onclick="shareKakaoCombo('saju')">💬 카카오톡으로 전체 결과 보내기</button>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="handlePdfPrint('saju')">📸 이미지로 저장</button>
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1; border: 1px solid #fff; height: 55px;" onclick="location.reload()">🔄 다른 운세 보기</button>
                </div>
            </div>
        </div>
    `;
        setTimeout(() => showToast("👑 마스터 권한으로 결제가 패스되었습니다."), 500);
    } else {
        document.getElementById('btnUnlockPremium').onclick = () => window.openSajuPayment(typeName, currentPrice);
    }

    if (typeof showAmuletSection === 'function') {
        showAmuletSection(true);
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

        sessionStorage.setItem('savedSajuResultHTML', document.getElementById('result').innerHTML);

        const tossPayments = TossPayments("live_ck_ORzdMaqN3wyPbE0GKqQbR5AkYXQG");
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
                alert("결제가 취소되었습니다. 정밀 리포트를 보시려면 결제를 완료해주세요.");
                sessionStorage.removeItem('savedSajuResultHTML');
            } else {
                alert("결제창 호출 실패:\n" + error.message);
                sessionStorage.removeItem('savedSajuResultHTML');
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

// 💡 기능 업데이트: 일간(日干) 데이터 추출 및 한 줄 요약 멘트 추가
function generateSajuChartsHTML(colorInfo, year, month, day) {
    const elements = ['木(목)', '火(화)', '土(토)', '金(금)', '水(수)'];
    const eColors = ['#4CAF50', '#F44336', '#FFC107', '#9E9E9E', '#2196F3'];

    const calendarType = document.querySelector('input[name="calendarType"]:checked') ? document.querySelector('input[name="calendarType"]:checked').value : 'solar';

    const isUnknownTime = document.getElementById('unknownTime') && document.getElementById('unknownTime').checked;
    let hour = 0; let minute = 0;

    if (!isUnknownTime && document.getElementById('birthHour') && document.getElementById('birthMinute')) {
        let rawHour = parseInt(document.getElementById('birthHour').value) || 0;
        let rawMin = parseInt(document.getElementById('birthMinute').value) || 0;
        const amPm = document.getElementById('birthAmPm') ? document.getElementById('birthAmPm').value : 'AM';

        if (amPm === 'PM' && rawHour < 12) rawHour += 12;
        if (amPm === 'AM' && rawHour === 12) rawHour = 0;

        minute = rawMin - 30;
        hour = rawHour;
        if (minute < 0) {
            minute += 60;
            hour -= 1;
            if (hour < 0) hour = 23;
        }
    } else {
        hour = 12;
    }

    let lunarObj = calendarType === 'solar'
        ? Solar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0).getLunar()
        : Lunar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0);

    let bazi = lunarObj.getEightChar();

    // 💡 여기서 일간(日干) 오행을 뽑습니다 (사주에서 '나 자신'을 상징)
    const ilganWuXing = bazi.getDayWuXing();

    let wuXing = bazi.getYearWuXing() + bazi.getMonthWuXing() + bazi.getDayWuXing();
    if (!isUnknownTime) wuXing += bazi.getTimeWuXing();
    let counts = [
        (wuXing.match(/木/g) || []).length,
        (wuXing.match(/火/g) || []).length,
        (wuXing.match(/土/g) || []).length,
        (wuXing.match(/金/g) || []).length,
        (wuXing.match(/水/g) || []).length
    ];

    // 💡 오행 과다/결핍에 따른 맞춤형 팩트 폭행 멘트 로직
    let hookMessage = "";
    if (counts[4] === 0) { // 水 결핍
        hookMessage = "🌊 사주에 유연함을 뜻하는 수(水) 기운이 고갈되어 있습니다. 뼈 빠지게 노력해도 막판에 답답함을 느끼지 않으셨나요?";
    } else if (counts[1] >= 3) { // 火 과다
        hookMessage = "🔥 불(火)의 에너지가 아주 강합니다. 직관력과 추진력은 좋지만 급격한 감정 소모를 조심해야 합니다.";
    } else if (counts[0] === 0) { // 木 결핍
        hookMessage = "🌱 시작과 뻗어나가는 힘인 목(木)이 부족합니다. 생각은 완벽한데 첫발을 내딛는 것을 주저하고 계실 확률이 높습니다.";
    } else if (counts[2] >= 3) { // 土 과다
        hookMessage = "⛰️ 흙(土)의 기운이 태산처럼 쌓여 있습니다. 포용력이 넓지만, 때로는 그 고집 때문에 스스로 답답함을 겪습니다.";
    } else { // 기본값
        hookMessage = `✨ 본성을 나타내는 '${ilganWuXing}'의 기운을 타고난 당신, 오행의 밸런스가 비교적 고른 사주입니다.`;
    }

    let total = counts.reduce((a, b) => a + b, 0) || 8;
    const percentages = counts.map(c => Math.round((c / total) * 100));

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

        const tx = center + (radius + 38) * Math.cos(angle), ty = center - (radius + 38) * Math.sin(angle);
        const anchor = Math.abs(tx - center) > 15 ? (tx > center ? "start" : "end") : "middle";
        dataSegmentHTML += `
        <text x="${tx}" y="${ty - 5}" fill="${eColors[idx]}" font-size="14" font-weight="bold" text-anchor="${anchor}">${elements[idx].split('(')[0]}</text>
        <text x="${tx}" y="${ty + 15}" fill="#ddd" font-size="11" text-anchor="${anchor}">(${counts[idx]}개 / ${p}%)</text>`;
    });

    return `
    <div style="margin-top: 3rem; margin-bottom: 3rem; padding: 2.5rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2); box-shadow: inset 0 0 15px rgba(0,0,0,0.3);">
        <div style="font-size: 1.2rem; color: ${colorInfo.textHex}; margin-bottom: 0.5rem; font-weight: bold; text-align: center; letter-spacing: 1px;">실제 오행(五行) 분포도</div>
        <div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 2rem;">명식 기반 상생(相生)과 상극(相剋)의 조화</div>
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
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 4px solid ${colorInfo.highlightHex};">
            <p style="color: #fff; font-size: 1.05rem; line-height: 1.5; font-weight: bold; margin: 0;">${hookMessage}</p>
        </div>
    </div>
`;
}

// ==========================================
// 5. 사이버 수호부 (스미싱 감별기) 로직 (기존 유지)
// ==========================================

let userAmuletCount = 0;
let isFreeGranted = false;

window.showAmuletSection = function (fromResult = false) {
    const amulet = document.getElementById('amuletSection');
    const paper = document.querySelector('#result .paper-container');
    const actionsArea = document.getElementById('sajuActionsArea');

    if (fromResult && !isFreeGranted) {
        userAmuletCount += 1;
        isFreeGranted = true;

        const countDisplay = document.getElementById('checkCountDisplay');
        if (countDisplay) countDisplay.innerText = userAmuletCount;

        setTimeout(() => showToast("🎁 운세 확인 보상: 스미싱 감별 1회 무료 제공!"), 1500);
    }

    if (amulet && paper && fromResult) {
        amulet.style.padding = '2rem 0 0 0';
        amulet.style.marginTop = '2rem';
        amulet.style.borderTop = '1px solid rgba(197, 160, 89, 0.3)';
        paper.insertBefore(amulet, actionsArea);
        amulet.style.display = 'block';
    } else if (amulet) {
        amulet.style.display = 'block';
    }
};

window.checkSmishing = function () {
    const urlInput = document.getElementById('suspectUrl').value.trim();
    const resultDiv = document.getElementById('urlCheckResult');
    const paywall = document.getElementById('amuletPaywall');

    if (!urlInput) { alert("검사할 링크(URL)를 입력해주세요."); return; }

    if (urlInput === '**') {
        userAmuletCount = 999;
        isFreeGranted = true;
        document.getElementById('checkCountDisplay').innerText = userAmuletCount;
        document.getElementById('suspectUrl').value = '';
        paywall.style.display = 'none';
        showToast("👑 마스터 권한이 확인되었습니다. 무제한 모드가 활성화됩니다.");
        return;
    }

    if (userAmuletCount <= 0) {
        if (!isFreeGranted) {
            alert("💡 사주 또는 타로 운세를 먼저 확인하시면\n스미싱 감별 1회 무료 혜택이 제공됩니다!\n\n(또는 하단의 패키지를 결제하여 즉시 이용 가능합니다.)");
        }
        paywall.style.display = 'flex';
        return;
    }

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

    const tossPayments = TossPayments("live_ck_ORzdMaqN3wyPbE0GKqQbR5AkYXQG");
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

// ✦ 플로팅 메뉴 제어 함수 (기존 유지)
window.toggleQuickMenu = function () {
    const options = document.getElementById('fabOptions');
    const mainBtn = document.getElementById('fabMainBtn');
    options.classList.toggle('active');

    const icon = mainBtn.querySelector('.fab-icon');
    if (options.classList.contains('active')) {
        icon.innerText = '✕';
    } else {
        icon.innerText = '✦';
    }
};

window.quickNav = function (path) {
    const isSajuResultOpen = document.getElementById('result').style.display === 'block';
    const isTarotResultOpen = document.getElementById('tarotResult').style.display === 'block';

    if (path === 'amulet') {
        const amuletSec = document.getElementById('amuletSection');
        amuletSec.style.display = 'block';
        amuletSec.scrollIntoView({ behavior: 'smooth' });
        window.toggleQuickMenu();
        return;
    }

    if (isSajuResultOpen || isTarotResultOpen) {
        const confirmMove = confirm("⚠️ 아직 결과를 저장하지 않으셨다면 데이터가 초기화될 수 있습니다.\n\n정말 다른 화면으로 이동하시겠습니까?");
        if (!confirmMove) {
            window.toggleQuickMenu();
            return;
        }
        document.getElementById('result').style.display = 'none';
        document.getElementById('tarotResult').style.display = 'none';
        document.querySelector('.header').style.display = 'flex';
        document.querySelector('.star-bg-fixed').style.display = 'block';
    }

    if (path === 'saju') {
        window.selectPath('saju');
    } else if (path === 'tarot') {
        window.selectPath('tarot');
    } else if (path === 'face') {
        window.selectPath('face');
    }

    window.toggleQuickMenu();
};

window.previewFaceImage = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('facePreview').src = e.target.result;
        document.getElementById('facePreview').style.display = 'block';

        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            base64FaceImage = compressedDataUrl.split(',')[1];
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.startFaceReading = async function () {
    if (!base64FaceImage) {
        alert("관상을 분석할 사진을 먼저 업로드해주세요!");
        return;
    }

    const loadingScreen = document.getElementById('analysisLoading');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingMessage = document.getElementById('loadingMessage');

    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (loadingTitle) loadingTitle.innerHTML = `<span style="color:#81D4FA;">프리미엄 정밀 관상</span> 분석 진행 중...`;
    if (loadingMessage) loadingMessage.innerText = "수석 관상가가 귀하의 이목구비 비율과 찰색(얼굴빛)을 세밀하게 감정하고 있습니다...";

    const payload = {
        contents: [{
            parts: [
                { text: "당신은 최고 권위의 관상가입니다. 사진 속 인물의 이마(초년/부모), 눈과 코(중년/재물/성공), 입과 턱(말년/자식)의 특징을 아주 디테일하게 짚어내고, 운의 흐름을 4문단 이상으로 방대하고 상세히 풀어주세요.\n\n[작성 규칙]\n1. 각 운세(초년, 중년, 말년, 총평)마다 앞에 무조건 **[소제목]** 형태로 굵게 강조해주세요.\n2. 상위 0.1% VIP 고객을 대하듯 품격 있고 진중한 어조를 유지하되, 모든 사람에게 똑같은 칭찬만 하지 마세요. 대상자의 실제 얼굴 이목구비 특징을 분석하여 타고난 장점과 더불어 '관상학적으로 주의해야 할 기운'이나 '보완해야 할 점'도 날카롭게 짚어주어 사람마다 결과가 확실히 다르게 나오도록 입체적으로 분석하세요. (단, 분석 내용에 '결제', '금액' 등 상업적인 단어는 절대 언급 금지)" },
                { inlineData: { mimeType: "image/jpeg", data: base64FaceImage } }
            ]
        }]
    };

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) {
            alert("관상 분석 중 서버 에러가 발생했습니다.");
            if (loadingScreen) loadingScreen.style.display = 'none';
            return;
        }

        const faceResultText = data.candidates[0].content.parts[0].text;
        if (loadingScreen) loadingScreen.style.display = 'none';

        document.querySelector('.header').style.display = 'none';
        document.querySelector('.star-bg-fixed').style.display = 'none';
        document.getElementById('faceSection').style.display = 'none';

        const resultSection = document.getElementById('result');
        const freeContentArea = document.getElementById('freeContentArea');
        const premiumContentArea = document.getElementById('premiumContentArea');

        resultSection.style.display = 'block';
        document.getElementById('resultTitle').innerHTML = `<span style="font-size: 0.65em; color: #81D4FA; letter-spacing: 1px;">얼굴에 새겨진 운명의 기록</span><br><span style="font-size: 1.15em; display: inline-block; margin-top: 15px;">프리미엄 정밀 관상</span>`;

        freeContentArea.innerHTML = `
        <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 3rem 1.5rem; border: 1px solid rgba(129, 212, 250, 0.4); border-radius: 12px; background-color: rgba(0, 0, 0, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(129, 212, 250, 0.1);">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 2rem;">
                <div style="position: relative; width: 160px; height: 160px;">
                    <img src="${document.getElementById('facePreview').src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid #81D4FA; box-shadow: 0 0 20px rgba(129, 212, 250, 0.5);">
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; border-radius:50%; border: 2px dashed #4FC3F7; animation: spin-slow 10s linear infinite;"></div>
                </div>
            </div>
            <h3 style="color: #81D4FA; font-size: 1.4rem; font-weight: bold; margin-bottom: 10px;">기운 스캔 완료</h3>
            <p style="color: #ccc; font-size: 1rem; line-height: 1.6;">당신의 초년, 중년, 말년에 걸친 운명의 흐름과<br>재물운, 성공운의 단서를 모두 해독했습니다.</p>
        </div>
    `;

        const formattedContent = faceResultText.split(/\n|\\n/).filter(p => p.trim() !== '').map(p => {
            let text = p.replace(/\*\*/g, '').trim();

            if (text.startsWith('[') || p.includes('**')) {
                text = text.replace(/\[|\]/g, '').trim();
                return `<h4 style="color: #81D4FA; font-size: 1.25rem; margin-top: 3rem; margin-bottom: 1.5rem; text-align: center; font-weight: 800; word-break: keep-all; line-height: 1.5; border-bottom: 1px solid rgba(129, 212, 250, 0.3); padding-bottom: 10px;">${text}</h4>`;
            }

            return `<p style="color: #E1F5FE; font-size: 1.05rem; line-height: 2.0; margin-bottom: 1.8rem; text-align: justify; word-break: keep-all; opacity: 0.95;">${text.replace(/\*/g, '').trim()}</p>`;
        }).join('');

        premiumContentArea.innerHTML = `<div style="margin-top: 3.5rem;">${formattedContent}</div>`;

        const price = 9900;
        document.getElementById('lockTypeName').textContent = `[정밀 관상]`;
        document.getElementById('lockPriceAmount').textContent = `${price.toLocaleString()}원`;

        if (window.isMasterKey) {
            premiumContentArea.classList.remove('blur-content');
            premiumContentArea.classList.add('unlocked');
            document.getElementById('unlockOverlay').style.display = 'none';
            const actionsArea = document.getElementById('sajuActionsArea');
            if (actionsArea) {
                actionsArea.style.display = 'block';
                actionsArea.innerHTML = `
                <div style="margin-top: 1rem; text-align: center; padding-bottom: 2rem;">
                    <p style="color: #81D4FA; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight:bold;">👑 마스터 권한으로 즉시 해제되었습니다.</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); border: 1px solid #81D4FA; color: #81D4FA;" onclick="handlePdfPrint('face')">📸 이미지 저장</button>
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); border: 1px solid #81D4FA; color: #81D4FA;" onclick="location.reload()">🔄 다시 하기</button>
                    </div>
                </div>
            `;
            }
        } else {
            premiumContentArea.classList.remove('unlocked');
            premiumContentArea.classList.add('blur-content');
            document.getElementById('unlockOverlay').style.display = 'flex';
            document.getElementById('sajuActionsArea').style.display = 'none';
            document.getElementById('btnUnlockPremium').onclick = () => window.openSajuPayment("프리미엄 정밀 관상", price);
        }

        window.scrollTo(0, 0);

    } catch (err) {
        if (loadingScreen) loadingScreen.style.display = 'none';
        alert("분석 중 에러가 발생했습니다.");
    }
}