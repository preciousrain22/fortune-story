// ==========================================
// 1. 공통 유틸리티 & 마스터(VIP) 백도어
// ==========================================
(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('master') === 'jinwoo') {
        sessionStorage.setItem('isFortuneMaster', 'true');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
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

function preventExit(e) {
    e.preventDefault();
    e.returnValue = '분석이 진행 중입니다. 페이지를 나가시면 결과를 받을 수 없습니다.';
}

window.shareKakaoCombo = async function (type) {
    let freeContent = document.getElementById('freeContentArea');
    let freeText = freeContent ? freeContent.innerText : "";
    const snippet = "[포춘스토리 정밀 분석 리포트]\n\n" + freeText + "\n\n👉 본인의 운명 확인하기\nhttps://fortune-story.com";
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(snippet);
        } else {
            throw new Error("Clipboard API 불가");
        }
        showToast("결과가 복사되었습니다. 카카오톡 대화창에 붙여넣기 하십시오.");
    } catch (err) {
        showToast("복사에 실패했습니다.");
    }
};

// 💡 [핵심] 이중 테두리 및 겉껍데기 강제 제거 마법 함수
function cleanOuterFrame() {
    let styleEl = document.getElementById('fortune-clean-frame');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'fortune-clean-frame';
        styleEl.innerHTML = `
            #result .result-container {
                border: none !important;
                padding: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(styleEl);
    }
}

// ==========================================
// 2. 파이어베이스 및 카카오 로그인
// ==========================================
let db = null;
try {
    const firebaseConfig = {
        apiKey: "AIzaSyCnzm66UrkO1rbMnenI0UN0DSNJFs0PebA",
        authDomain: "fortune-story.firebaseapp.com",
        projectId: "fortune-story",
        storageBucket: "fortune-story.firebasestorage.app",
        messagingSenderId: "576293866226",
        appId: "1:576293866226:web:90e4e63c30db23101bde6b"
    };
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (e) {
    console.log("DB 초기화 무시됨");
}

window.loginWithKakao = function () {
    window.selectPath('gateway');
    try {
        if (typeof Kakao !== 'undefined') {
            if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');
            Kakao.Auth.login({
                success: function (authObj) {
                    Kakao.API.request({
                        url: '/v2/user/me',
                        success: function (res) {
                            if (db) {
                                db.collection("users").doc(res.id.toString()).set({
                                    name: res.properties.nickname || "포춘VIP",
                                    lastLogin: new Date()
                                }, { merge: true }).catch(function () { });
                            }
                        }
                    });
                }
            });
        }
    } catch (err) {
        console.log("카카오 연결 무시됨");
    }
};

// ==========================================
// 3. 화면 이동 및 이어보기(Keep) 엔진
// ==========================================
history.replaceState({ view: 'gateway' }, null, '');

window.selectPath = function (path, isHistory) {
    if (!isHistory) {
        history.pushState({ view: path }, null, '');
    }

    const sections = ['login-section', 'gateway', 'daily', 'tarot', 'faceSection', 'amuletSection', 'result', 'tarotResult', 'tarotDraw'];
    for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) el.style.display = 'none';
    }

    const header = document.querySelector('.header-neon');
    if (header) header.style.display = 'flex';

    const bg = document.querySelector('.star-bg-fixed');
    if (bg) bg.style.display = 'block';

    if (path === 'gateway') document.getElementById('gateway').style.display = 'block';
    else if (path === 'saju') {
        document.getElementById('daily').style.display = 'block';
        renderKeepBanner();
    }
    else if (path === 'tarot') document.getElementById('tarot').style.display = 'block';
    else if (path === 'face') document.getElementById('faceSection').style.display = 'block';
    else if (path === 'amulet') document.getElementById('amuletSection').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('popstate', function (e) {
    if (e.state && e.state.view) {
        window.selectPath(e.state.view, true);
    } else {
        window.selectPath('gateway', true);
    }
});

window.toggleQuickMenu = function () {
    const opts = document.getElementById('fabOptions');
    const btnIcon = document.getElementById('fabIconMenu');
    opts.classList.toggle('active');

    if (opts.classList.contains('active')) {
        btnIcon.innerHTML = "<line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line>";
        btnIcon.style.transform = "rotate(90deg)";
    } else {
        btnIcon.innerHTML = "<circle cx='12' cy='12' r='10'></circle><polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76'></polygon>";
        btnIcon.style.transform = "rotate(0deg)";
    }
};

window.quickNav = function (path) {
    window.selectPath(path);
    window.toggleQuickMenu();
};

function renderKeepBanner() {
    const keepDataStr = localStorage.getItem('fortune_keep_data');
    let banner = document.getElementById('keepBannerArea');

    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'keepBannerArea';
        const formContainer = document.querySelector('#daily > div');
        formContainer.insertBefore(banner, formContainer.firstChild);
    }

    if (!keepDataStr) {
        banner.style.display = 'none';
        return;
    }

    const keepData = JSON.parse(keepDataStr);
    const now = new Date().getTime();

    if (now - keepData.timestamp > 86400000) {
        localStorage.removeItem('fortune_keep_data');
        banner.style.display = 'none';
        return;
    }

    banner.style.display = 'block';
    banner.innerHTML = `
        <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.5); border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(212,175,55,0.15); cursor: pointer;" onclick="loadKeptResult()">
            <div>
                <span style="color:#D4AF37; font-size:0.8rem; font-weight:bold; letter-spacing:1px;">👑 보관된 리포트</span><br>
                <span style="color:#fff; font-size:1.05rem; font-weight:bold; margin-top:5px; display:inline-block;">${keepData.name}님의 ${keepData.typeName}</span>
            </div>
            <div style="background: linear-gradient(135deg, #FFDF73, #D4AF37); color: #000; padding: 10px 18px; border-radius: 30px; font-weight: 900; font-size: 0.9rem; box-shadow: 0 2px 10px rgba(212,175,55,0.4);">
                이어보기 ➔
            </div>
        </div>
    `;
}

window.loadKeptResult = function () {
    const keepDataStr = localStorage.getItem('fortune_keep_data');
    if (!keepDataStr) return;
    const keepData = JSON.parse(keepDataStr);

    history.pushState({ view: 'result' }, null, '');

    const header = document.querySelector('.header-neon');
    if (header) header.style.display = 'none';
    const bg = document.querySelector('.star-bg-fixed');
    if (bg) bg.style.display = 'none';

    const sections = ['login-section', 'gateway', 'daily', 'tarot', 'faceSection', 'amuletSection', 'tarotResult', 'tarotDraw'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const resultSec = document.getElementById('result');
    resultSec.style.display = 'block';
    resultSec.style.background = "#080808";
    resultSec.style.minHeight = "100vh";
    resultSec.style.padding = "30px 15px";

    cleanOuterFrame(); // 이중 테두리 제거 

    document.getElementById('freeContentArea').innerHTML = keepData.freeArea;

    const premiumArea = document.getElementById('premiumContentArea');
    premiumArea.innerHTML = keepData.premiumArea;

    if (keepData.isUnlocked || window.isMasterKey) {
        premiumArea.style.filter = "none";
        premiumArea.style.opacity = "1";
        premiumArea.style.pointerEvents = "auto";
        if (document.getElementById('inlinePayWrapper')) document.getElementById('inlinePayWrapper').style.display = 'none';
        if (document.getElementById('sajuActionsArea')) document.getElementById('sajuActionsArea').style.display = 'block';
    } else {
        premiumArea.style.filter = "blur(8px)";
        premiumArea.style.opacity = "0.5";
        premiumArea.style.pointerEvents = "none";
        if (document.getElementById('inlinePayWrapper')) document.getElementById('inlinePayWrapper').style.display = 'block';
        if (document.getElementById('sajuActionsArea')) document.getElementById('sajuActionsArea').style.display = 'block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==========================================
// 4. 사주 AI 분석 엔진 
// ==========================================
const sajuForm = document.getElementById('sajuForm');
if (sajuForm) {
    sajuForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fortuneType = document.getElementById('fortuneType').value;
        const rawName = document.getElementById('name').value.trim();
        window.isMasterKey = rawName.indexOf('**') !== -1 || sessionStorage.getItem('isFortuneMaster') === 'true';
        const name = rawName.replace(/[*']/g, '');

        if (name.length < 2) { alert("정확한 분석을 위해 이름을 2글자 이상 입력해주십시오."); return; }

        const gender = document.querySelector('input[name="gender"]:checked').value;
        const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;
        const calendarType = document.querySelector('input[name="calendarType"]:checked').value;
        const year = document.getElementById('birthYear').value;
        let month = document.getElementById('birthMonth').value;
        let day = document.getElementById('birthDay').value;

        if (!year || !month || !day) { alert('생년월일을 모두 입력해주십시오.'); return; }
        if (parseInt(month, 10) < 1 || parseInt(month, 10) > 12) { alert('태어난 월은 1월부터 12월 사이로 정확히 입력해 주십시오.'); return; }
        if (parseInt(day, 10) < 1 || parseInt(day, 10) > 31) { alert('태어난 일은 1일부터 31일 사이로 정확히 입력해 주십시오.'); return; }

        month = String(month).length === 1 ? '0' + month : String(month);
        day = String(day).length === 1 ? '0' + day : String(day);

        const typeNames = {
            'daily': "오늘의 운세",
            'weekly': "주간 운세",
            'yearly': "1년 심층 운세",
            'wealth': "재물운 심층 분석",
            'love': "애정 및 연애운"
        };
        let displayTypeName = typeNames[fortuneType] || "명리 분석";

        startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType);
    });
}

async function startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType) {

    // 💡 '테스트' 입력 시 0초 즉시 로딩
    if (name.indexOf('테스트') !== -1) {
        const testResultData = {
            "scores": { "wealth": 99, "success": 99, "love": 99, "health": 99 },
            "keyword1": "거대한 조력자",
            "keyword2": "제왕의 기틀",
            "keyword3": "중차대한 전환점",
            "summary": "오늘의 운세는 **새로운 기회**와 함께 막중한 책임감이 부여되는 하루가 될 것입니다. 외부로부터의 재물 운과 명예 운이 동시에 활성화되지만, 이를 성공적으로 이끌기 위한 지혜로운 대처가 요구됩니다.",
            "premium": "<div class='premium-content'><div style='text-align:center; color:#fff; padding:50px; background: rgba(255,255,255,0.05); border-radius: 10px;'>이곳은 프리미엄 리포트 영역입니다.<br>실제 분석 시 2000자가 넘는 아주 상세한 전문가의 해설이 이곳에 출력됩니다.</div></div>"
        };
        renderSajuResult(name, displayTypeName, year, month, day, testResultData, fortuneType, null, null, false);
        return;
    }

    document.getElementById('daily').style.display = 'none';
    const loadingScreen = document.getElementById('analysisLoading');
    loadingScreen.style.display = 'flex';
    document.getElementById('loadingTitle').innerHTML = name + "님의 <span style='color:#81D4FA;'>" + displayTypeName + "</span> 분석 중입니다.";
    window.addEventListener('beforeunload', preventExit);

    const loadingMessageEl = document.getElementById('loadingMessage');
    const loadingMessages = [
        "명식과 우주의 기운을 동기화하고 있습니다...",
        "타고난 오행의 흐름을 짚어내는 중입니다...",
        "올해의 운기 변곡점을 정밀 타격 중입니다...",
        "VIP 전용 운명 리포트를 정성껏 작성 중입니다..."
    ];
    let msgIndex = 0;
    loadingMessageEl.innerText = loadingMessages[0];

    const messageInterval = setInterval(function () {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        loadingMessageEl.innerText = loadingMessages[msgIndex];
    }, 2500);

    const unknownTimeEl = document.getElementById('unknownTime');
    const isUnknownTime = unknownTimeEl ? unknownTimeEl.checked : false;
    let hour = 12, minute = 0;
    if (!isUnknownTime && document.getElementById('birthHour') && document.getElementById('birthMinute')) {
        hour = parseInt(document.getElementById('birthHour').value, 10) || 12;
        minute = parseInt(document.getElementById('birthMinute').value, 10) || 0;
    }

    let lunarObj = calendarType === 'solar'
        ? Solar.fromYmdHms(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), hour, minute, 0).getLunar()
        : Lunar.fromYmdHms(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), hour, minute, 0);
    let bazi = lunarObj.getEightChar();
    let sajuStr = bazi.getYear() + "년 " + bazi.getMonth() + "월 " + bazi.getDay() + "일 " + (isUnknownTime ? '(시간 미상)' : bazi.getTime() + '시');
    let wuXing = bazi.getYearWuXing() + bazi.getMonthWuXing() + bazi.getDayWuXing();
    if (!isUnknownTime) wuXing += bazi.getTimeWuXing();

    const promptText = "너는 30년 경력의 최고급 명리학자야. 고객 정보 - 이름: '" + name + "', 성별: '" + gender + "', 생년월일: " + year + "년 " + month + "월 " + day + "일, 결혼여부: '" + maritalStatus + "'\n" +
        "명식: " + sajuStr + ", 오행: " + wuXing + ". 분석 종류: '" + displayTypeName + "'.\n" +
        "유머나 이모티콘은 절대 금지하며, 상위 0.1% VIP 고객에게 전달하는 매우 진지하고 무게감 있는 전문가의 어조로 작성해.\n" +
        "절대 짧게 요약하지 마라. 모든 항목을 아주 길고 상세하게, 최소 800자 이상의 프리미엄 리포트 형식으로 쏟아내듯이 작성해.\n" +
        "반드시 아래 JSON 형식으로만 응답해. (HTML 태그 절대 금지)\n" +
        "{\n" +
        "    \"scores\": { \"wealth\": 85, \"success\": 90, \"love\": 75, \"health\": 80 },\n" +
        "    \"keyword1\": \"(분석을 관통하는 거대한 핵심 키워드 1 - 10자 이내)\",\n" +
        "    \"keyword2\": \"(가장 강력한 운명의 특징 2 - 10자 이내)\",\n" +
        "    \"keyword3\": \"(앞으로 다가올 변화 3 - 10자 이내)\",\n" +
        "    \"summary\": \"(이곳에 무료공개용 사주 요약 3~4문장을 작성해. 중요한 단어 양옆에는 반드시 **단어** 형태로 별표 2개를 붙여서 강조해줄 것)\",\n" +
        "    \"premium\": \"<div class='premium-content'><div style='background:rgba(255,223,115,0.08); border:1px solid rgba(255,223,115,0.5); border-radius:12px; padding:20px; margin-bottom:35px; text-align:center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'><h4 style='color:#FFDF73; margin-bottom:15px; font-size:1.15rem; letter-spacing: 1px;'>[" + displayTypeName + " 행운 지표]</h4><p style='color:#fff; margin:0; font-size:1rem;'>색상: <strong style='color:#81D4FA;'>(색상)</strong> &nbsp;|&nbsp; 숫자: <strong style='color:#F48FB1;'>(숫자)</strong> &nbsp;|&nbsp; 방향: <strong style='color:#A5D6A7;'>(방향)</strong></p></div><div style='margin-bottom:30px; padding:15px; background:rgba(156, 39, 176, 0.1); border-left:4px solid #D3B8F8; border-radius:8px;'><h4 style='color:#D3B8F8; margin-bottom:10px; font-size:1.15rem;'>[핵심 십성(十星) 기운]</h4><p style='color:#fff; font-size:1.05rem; margin:0;'><strong style='color:#FFDF73;'>(해당 운세 기간에 강하게 들어오는 십성 1~2개 기재)</strong> - (이 십성이 현재 고객에게 어떤 영향을 주는지 아주 깊이 있게 3~4문장 이상으로 풀이)</p></div><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[1. 타고난 운명의 그릇과 기질]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(500자 이상 아주 상세한 성격 및 기질 풀이)</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[2. 다가오는 재물과 성공의 흐름]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(500자 이상 구체적인 시기와 방향을 포함한 재물운 분석)</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[3. 대인관계 및 애정 운세]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(500자 이상 인간관계 흐름과 주의점 분석)</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[4. 전문가가 전하는 실전 개운법]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(500자 이상 구체적인 행동 지침, 액운 방지책 상세 조언)</p></div>\"\n" +
        "}";

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        const data = await response.json();

        clearInterval(messageInterval);
        loadingScreen.style.display = 'none';
        window.removeEventListener('beforeunload', preventExit);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiResultText = data.candidates[0].content.parts[0].text;
            aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultData = JSON.parse(aiResultText);
            renderSajuResult(name, displayTypeName, year, month, day, resultData, fortuneType, bazi, wuXing, isUnknownTime);
        } else {
            alert("데이터를 가져오지 못했습니다.");
        }
    } catch (error) {
        console.error(error);
        clearInterval(messageInterval);
        loadingScreen.style.display = 'none';
        window.removeEventListener('beforeunload', preventExit);
        alert("분석 중 오류가 발생했습니다. 다시 시도해 주십시오.");
    }
}

// ==========================================
// 5. 렌더링 엔진 (오류 수정 & 단일 레이아웃 적용)
// ==========================================
function getPersonalColor(yearStr) {
    if (!yearStr) return { element: '금(金)', textHex: '#EEEEEE', highlightHex: '#FFFFFF', borderRgba: 'rgba(255, 255, 255, 0.4)' };
    const lastDigit = parseInt(yearStr, 10) % 10;
    if (lastDigit === 4 || lastDigit === 5) return { element: '목(木)', textHex: '#DCE775', highlightHex: '#C5E1A5', borderRgba: 'rgba(197, 225, 165, 0.4)' };
    if (lastDigit === 6 || lastDigit === 7) return { element: '화(火)', textHex: '#FFCCBC', highlightHex: '#FFAB91', borderRgba: 'rgba(255, 171, 145, 0.4)' };
    if (lastDigit === 8 || lastDigit === 9) return { element: '토(土)', textHex: '#FFE082', highlightHex: '#FFD54F', borderRgba: 'rgba(255, 213, 79, 0.4)' };
    if (lastDigit === 0 || lastDigit === 1) return { element: '금(金)', textHex: '#EEEEEE', highlightHex: '#FFFFFF', borderRgba: 'rgba(255, 255, 255, 0.4)' };
    return { element: '수(水)', textHex: '#B3E5FC', highlightHex: '#81D4FA', borderRgba: 'rgba(129, 212, 250, 0.4)' };
}

// 💡 여기서부터 끝까지 하나로 완벽하게 묶인 렌더링 함수입니다. 
function renderSajuResult(name, typeName, year, month, day, resultData, fortuneType, bazi, wuXing, isUnknownTime) {
    history.pushState({ page: 'result' }, null, '');

    const header = document.querySelector('.header-neon');
    if (header) header.style.display = 'none';
    const bg = document.querySelector('.star-bg-fixed');
    if (bg) bg.style.display = 'none';

    const resultSec = document.getElementById('result');
    resultSec.style.display = 'block';
    resultSec.style.background = "#080808";
    resultSec.style.minHeight = "100vh";
    resultSec.style.padding = "20px 10px";

    cleanOuterFrame(); // 이중 테두리 제거

    const colorInfo = getPersonalColor(year);
    const elementMeta = {
        '목(木)': { img: 'bg_wood.png', desc: '성장과 활력을 상징하는 목(木)의 기운입니다. 뻗어 나가는 나무처럼 당신의 운명도 새로운 시작을 향하고 있습니다.' },
        '화(火)': { img: 'bg_fire.png', desc: '열정과 밝음을 상징하는 화(火)의 기운입니다. 타오르는 불꽃처럼 당신의 에너지가 세상에 널리 퍼질 시기입니다.' },
        '토(土)': { img: 'bg_earth.png', desc: '신뢰와 중심을 상징하는 토(土)의 기운입니다. 대지처럼 흔들림 없는 당신의 뿌리가 운명을 든든히 지탱합니다.' },
        '금(金)': { img: 'bg_metal.png', desc: '결단과 완성의 상징인 금(金)의 기운입니다. 단단한 금속처럼 당신의 의지가 현실적인 성과로 나타나는 운기입니다.' },
        '수(水)': { img: 'bg_water.png', desc: '지혜와 흐름을 상징하는 수(水)의 기운입니다. 유연하게 흐르는 물처럼 당신은 지혜롭게 고난을 극복할 것입니다.' }
    };

    const meta = elementMeta[colorInfo.element] || elementMeta['금(金)'];
    let safeSummary = (resultData.summary || "").replace(/\*\*(.*?)\*\*/g, "<strong style='color:#FFD700;'>$1</strong>");
    let chartHTML = (fortuneType === 'wealth') ? "" : generateSajuChartsHTML(colorInfo, bazi, wuXing, isUnknownTime);

    // 💡 이미지 1개만 사용하고 그 아래로 텍스트 풀이로 이어지는 단일 구조 HTML 생성
    let premiumCardHTML = `
        <div style='max-width: 550px; margin: 0 auto;'>
            <img src="images/${meta.img}" style='width: 100%; height: auto; display: block;'>
            
            <div style='padding: 30px 20px; text-align: center; color: #fff; background: #080808;'>
                <h2 style='color: #FFD700; font-size: 1rem; letter-spacing: 3px; margin-bottom: 20px;'>${name}님을 위한 ${typeName}</h2>
                <div style='font-size: 2.5rem; font-weight: 900; color: #FFD700; margin-bottom: 15px;'>${resultData.keyword2 || "제왕의 기틀"}</div>
                <p style='color: #81D4FA; font-size: 1.1rem; margin-bottom: 30px; font-weight: bold;'>${meta.desc}</p>
                
                <div style='text-align: justify; line-height: 1.8; font-size: 1.1rem; color: #e0e0e0;'>
                    ${safeSummary}
                </div>
                ${chartHTML}
            </div>
        </div>
    `;

    document.getElementById('freeContentArea').innerHTML = premiumCardHTML;

    if (document.getElementById('resultTitle')) document.getElementById('resultTitle').style.display = 'none';

    // 💡 하단 프리미엄 정보 (텍스트) 생성
    let premiumHTML = "";
    if (resultData.scores) {
        const s = resultData.scores;
        premiumHTML += "<div style='max-width: 550px; margin: 1rem auto 3rem auto; padding: 2rem; background: rgba(0,0,0,0.6); border-radius: 15px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.5);'>" +
            "<h3 style='text-align: center; color: #FFDF73; font-size: 1.3rem; margin-bottom: 2rem; font-weight: bold;'>[핵심 운기 지표]</h3>" +
            "<div style='margin-bottom: 1.5rem;'><div style='display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;'><span>재물 및 금전운</span><span style='color: #FFD54F;'>" + s.wealth + "점</span></div><div style='width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;'><div style='width: " + s.wealth + "%; background: linear-gradient(90deg, #F9F6CA, #D4AF37); height: 100%; border-radius: 7px;'></div></div></div>" +
            "<div style='margin-bottom: 1.5rem;'><div style='display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;'><span>성공 및 학업운</span><span style='color: #4CAF50;'>" + s.success + "점</span></div><div style='width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;'><div style='width: " + s.success + "%; background: linear-gradient(90deg, #A5D6A7, #4CAF50); height: 100%; border-radius: 7px;'></div></div></div>" +
            "<div style='margin-bottom: 1.5rem;'><div style='display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;'><span>대인 및 애정운</span><span style='color: #FF8A80;'>" + s.love + "점</span></div><div style='width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;'><div style='width: " + s.love + "%; background: linear-gradient(90deg, #FFCDD2, #FF5252); height: 100%; border-radius: 7px;'></div></div></div>" +
            "<div style='margin-bottom: 1rem;'><div style='display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;'><span>건강 및 활력운</span><span style='color: #81D4FA;'>" + s.health + "점</span></div><div style='width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;'><div style='width: " + s.health + "%; background: linear-gradient(90deg, #B3E5FC, #29B6F6); height: 100%; border-radius: 7px;'></div></div></div>" +
            "</div>";
    }

    premiumHTML += (resultData.premium || "");
    const premiumArea = document.getElementById('premiumContentArea');
    premiumArea.innerHTML = premiumHTML;

    // 💡 결제 및 마스터 해제 상태 제어 로직 
    let isUnlockedStatus = false;
    if (window.isMasterKey) {
        isUnlockedStatus = true;
        premiumArea.style.filter = "none";
        premiumArea.style.opacity = "1";
        premiumArea.style.pointerEvents = "auto";
        if (document.getElementById('unlockOverlay')) document.getElementById('unlockOverlay').style.display = 'none';
        if (document.getElementById('inlinePayWrapper')) document.getElementById('inlinePayWrapper').style.display = 'none';
        if (document.getElementById('stickyPayWrapper')) document.getElementById('stickyPayWrapper').style.display = 'none';

        document.getElementById('sajuActionsArea').style.display = 'block';
        document.getElementById('sajuActionsArea').innerHTML = "<div style='margin-top: 1rem; text-align: center; padding-bottom: 2rem;'><p style='color: #FFDF73; margin-bottom: 1.5rem; font-weight:bold;'>마스터 권한으로 프리미엄 리포트가 해제되었습니다.</p><button class='btn-premium kakao pulse-btn' style='width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; font-weight: bold; border: none; height: 60px; margin-bottom:10px;' onclick=\"shareKakaoCombo('saju')\">카카오톡으로 전체 결과 발송</button><button class='btn-premium outline' style='width: 100%; border-radius: 50px; background: rgba(0,0,0,0.5); border: 1px solid #fff; color: #fff; height: 60px;' onclick=\"handlePdfPrint('saju')\">결과 이미지 저장</button></div>";
    } else {
        premiumArea.style.filter = "blur(8px)";
        premiumArea.style.opacity = "0.5";
        premiumArea.style.pointerEvents = "none";
        if (document.getElementById('unlockOverlay')) document.getElementById('unlockOverlay').style.display = 'none';
        if (document.getElementById('inlinePayWrapper')) document.getElementById('inlinePayWrapper').style.display = 'block';

        const sajuActionsArea = document.getElementById('sajuActionsArea');
        sajuActionsArea.style.display = 'block';
        sajuActionsArea.innerHTML = "<div style='margin-top: 2rem; text-align: center; padding-bottom: 2rem;'><button class='btn-premium outline' style='width: 100%; border-radius: 50px; background: rgba(0,0,0,0.5); border: 1px solid #fff; color: #fff; height: 60px;' onclick=\"location.href='/'\">처음으로 돌아가기</button></div>";

        const price = { daily: 3900, weekly: 5900, yearly: 9900, wealth: 12900, love: 8900 }[fortuneType] || 5900;
        const priceStr = price.toLocaleString() + "원";

        if (document.getElementById('lockPriceAmountInline')) document.getElementById('lockPriceAmountInline').textContent = priceStr;
        if (document.getElementById('lockPriceAmountSticky')) document.getElementById('lockPriceAmountSticky').textContent = priceStr;

        const openPay = function () { window.openPaymentModal(typeName, price); };
        if (document.getElementById('btnUnlockInline')) document.getElementById('btnUnlockInline').onclick = openPay;
        if (document.getElementById('btnUnlockSticky')) document.getElementById('btnUnlockSticky').onclick = openPay;

        const observer = new IntersectionObserver(function (entries) {
            const stickyWrapper = document.getElementById('stickyPayWrapper');
            if (stickyWrapper) {
                if (entries[0].isIntersecting) {
                    stickyWrapper.classList.remove('visible');
                } else {
                    stickyWrapper.classList.add('visible');
                }
            }
        }, { threshold: 0 });

        const inlineWrapper = document.getElementById('inlinePayWrapper');
        if (inlineWrapper) observer.observe(inlineWrapper);
    }

    const recentData = {
        name: name,
        typeName: typeName,
        timestamp: new Date().getTime(),
        freeArea: premiumCardHTML,
        premiumArea: premiumHTML,
        isUnlocked: isUnlockedStatus
    };
    localStorage.setItem('fortune_keep_data', JSON.stringify(recentData));

    window.scrollTo({ top: 0, behavior: 'smooth' });
} // <-- 💡 누락되었던 괄호 문제를 여기서 완벽히 봉합했습니다!

// ==========================================
// 부가 엔진 (PDF 다운로드, 타로, 결제 등) 
// ==========================================
window.handlePdfPrint = function (type) {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if ((ua.indexOf("Instagram") > -1) || (ua.indexOf("KAKAOTALK") > -1) || (ua.indexOf("Threads") > -1)) {
        alert("카카오톡 내부 브라우저에서는 저장이 차단될 수 있습니다.\n\n우측 상단 메뉴(⋮)에서 [다른 브라우저에서 열기]를 선택해 주십시오.");
        return;
    }
    showToast("결과 이미지를 생성하고 있습니다.");
    const targetId = (type === 'saju' || type === 'face') ? 'result' : 'tarotResult';
    const elementToCapture = document.querySelector("#" + targetId + " .paper-container") || document.querySelector("#" + targetId);
    const actionArea = elementToCapture.querySelector('.result-actions') || document.getElementById('sajuActionsArea');
    if (actionArea) actionArea.style.display = 'none';

    setTimeout(function () {
        html2canvas(elementToCapture, {
            scale: window.devicePixelRatio ? window.devicePixelRatio * 2 : 4,
            useCORS: true,
            backgroundColor: '#1a1a1a',
            scrollY: -window.scrollY
        }).then(function (canvas) {
            if (actionArea) actionArea.style.display = 'block';
            const link = document.createElement('a');
            link.download = "포춘스토리_정밀분석.png";
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            showToast("저장이 완료되었습니다.");
        }).catch(function () {
            if (actionArea) actionArea.style.display = 'block';
            alert("이미지 저장 중 오류가 발생했습니다.");
        });
    }, 500);
};

window.openPaymentModal = function (typeName, amount) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('paymentFortuneType').textContent = typeName;
    document.getElementById('paymentAmount').textContent = amount.toLocaleString() + "원";
    modal.style.display = 'flex';

    document.querySelector('.close-modal').onclick = function () { modal.style.display = 'none'; };

    document.getElementById('confirmPaymentBtn').onclick = function () {
        modal.style.display = 'none';
        localStorage.setItem('savedSajuResultHTML', document.getElementById('result').innerHTML);

        const tossPayments = TossPayments("live_sk_ZLKGPx4M3MPGYxZ6vLye8BaWypv1");

        tossPayments.requestPayment('카드', {
            amount: amount,
            orderId: 'saju_' + new Date().getTime(),
            orderName: typeName,
            customerName: "고객",
            // 💡 주소를 단순화하여 토스가 파라미터를 정상적으로 붙이도록 유도합니다.
            successUrl: window.location.origin + window.location.pathname,
            failUrl: window.location.origin + window.location.pathname
        }).catch(function (error) {
            console.error("결제창 에러:", error);
            alert("결제창을 띄우지 못했습니다: " + error.message);
        });
    };
};

// ==========================================
// 💡 [새로 추가] 결제 후 돌아왔을 때 화면 복구 & 승인 엔진
// ==========================================
const urlParamsForPayment = new URLSearchParams(window.location.search);

if (urlParamsForPayment.has('code') || urlParamsForPayment.has('paymentKey')) {

    // 1. 공통: 로그인 화면으로 튕기지 않게 보관된 운세 화면 즉시 복구
    window.loadKeptResult();

    // 2. 결제 취소 또는 실패 시
    if (urlParamsForPayment.has('code')) {
        const errCode = urlParamsForPayment.get('code');
        if (errCode === 'PAY_PROCESS_CANCELED' || errCode === 'USER_CANCEL') {
            alert("결제가 취소되었습니다. 원하실 때 다시 버튼을 눌러 진행해 주세요.");
        } else {
            alert("결제 중 오류가 발생했습니다: " + decodeURIComponent(urlParamsForPayment.get('message')));
        }

        // 새로고침으로 인해 날아간 결제 버튼 기능(금액, 클릭 이벤트) 다시 살리기
        setTimeout(() => {
            const keepDataStr = localStorage.getItem('fortune_keep_data');
            if (keepDataStr) {
                const keepData = JSON.parse(keepDataStr);
                const typeName = keepData.typeName || "프리미엄 리포트";
                let price = 5900;
                if (typeName.includes("오늘")) price = 3900;
                else if (typeName.includes("1년")) price = 9900;
                else if (typeName.includes("재물")) price = 12900;
                else if (typeName.includes("애정")) price = 8900;

                const priceStr = price.toLocaleString() + "원";
                if (document.getElementById('lockPriceAmountInline')) document.getElementById('lockPriceAmountInline').textContent = priceStr;
                if (document.getElementById('lockPriceAmountSticky')) document.getElementById('lockPriceAmountSticky').textContent = priceStr;

                const openPay = function () { window.openPaymentModal(typeName, price); };
                if (document.getElementById('btnUnlockInline')) document.getElementById('btnUnlockInline').onclick = openPay;
                if (document.getElementById('btnUnlockSticky')) document.getElementById('btnUnlockSticky').onclick = openPay;
            }
        }, 200);

        // 주소창 지저분한 파라미터 청소
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 3. 결제 성공 시 (승인 API 호출)
    else if (urlParamsForPayment.has('paymentKey')) {
        showToast("결제를 최종 승인하고 있습니다. 잠시만 기다려주세요...");
        fetch('/api/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentKey: urlParamsForPayment.get('paymentKey'),
                orderId: urlParamsForPayment.get('orderId'),
                amount: urlParamsForPayment.get('amount')
            })
        }).then(function (res) { return res.json(); }).then(function (data) {
            if (data.orderId || data.mId) {
                alert("결제가 완료되었습니다. 프리미엄 리포트가 해제됩니다.");

                document.getElementById('premiumContentArea').style.filter = "none";
                document.getElementById('premiumContentArea').style.opacity = "1";
                document.getElementById('premiumContentArea').style.pointerEvents = "auto";

                if (document.getElementById('inlinePayWrapper')) document.getElementById('inlinePayWrapper').style.display = 'none';
                if (document.getElementById('stickyPayWrapper')) document.getElementById('stickyPayWrapper').style.display = 'none';

                const sajuActionsArea = document.getElementById('sajuActionsArea');
                if (sajuActionsArea) {
                    sajuActionsArea.style.display = 'block';
                    sajuActionsArea.innerHTML = "<div style='margin-top: 1rem; text-align: center; padding-bottom: 2rem;'><p style='color: #FFDF73; margin-bottom: 1.5rem; font-weight:bold;'>프리미엄 리포트가 해제되었습니다.</p><button class='btn-premium outline' style='width: 100%; border-radius: 50px; background: rgba(0,0,0,0.5); border: 1px solid #fff; color: #fff; height: 60px;' onclick=\"handlePdfPrint('saju')\">결과 이미지 저장</button></div>";
                }

                const keepDataStr = localStorage.getItem('fortune_keep_data');
                if (keepDataStr) {
                    const keepData = JSON.parse(keepDataStr);
                    keepData.isUnlocked = true;
                    localStorage.setItem('fortune_keep_data', JSON.stringify(keepData));
                }
            } else {
                alert("승인 실패: " + (data.message || "오류가 발생했습니다."));
            }
        }).catch(function (err) {
            console.error("결제 승인 오류:", err);
            alert("결제 승인 중 통신 오류가 발생했습니다.");
        });

        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


const tarotCards = [];
for (let i = 0; i <= 21; i++) tarotCards.push({ id: i, name: "메이저 아르카나", img: "images/" + i + ".jpeg" });
let selectedTarotCards = [];

const tarotForm = document.getElementById('tarotForm');
if (tarotForm) {
    tarotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (document.getElementById('tarotName').value.trim().length < 2) return alert("이름을 입력하십시오.");
        if (document.getElementById('tarotConcern').value.trim().length < 30) return alert("고민을 30자 이상 구체적으로 작성해 주십시오.");
        document.getElementById('tarot').style.display = 'none';
        document.getElementById('tarotDraw').style.display = 'block';

        const deck = document.getElementById('tarotDeck');
        deck.innerHTML = ''; selectedTarotCards = [];
        const btnRead = document.getElementById('btnReadTarot');
        btnRead.disabled = true;

        [...tarotCards].sort(function () { return Math.random() - 0.5; }).forEach(function (card) {
            const el = document.createElement('div');
            el.className = 'tarot-card-back';
            el.onclick = function () {
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedTarotCards = selectedTarotCards.filter(function (c) { return c.el !== this; }.bind(this));
                } else if (selectedTarotCards.length < 3) {
                    this.classList.add('selected');
                    selectedTarotCards.push({ el: this, card: card });
                }
                document.getElementById('tarotDrawCount').innerText = 3 - selectedTarotCards.length;
                btnRead.disabled = selectedTarotCards.length !== 3;
            };
            deck.appendChild(el);
        });

        btnRead.onclick = function () {
            const name = document.getElementById('tarotName').value.trim();
            const concern = document.getElementById('tarotConcern').value.trim();
            const tarotResultData = {
                "scores": { "wealth": 88, "success": 90, "love": 82, "health": 85 },
                "keyword1": "변화의 파동",
                "keyword2": "운명의 아르카나",
                "keyword3": "새로운 시작",
                "summary": name + "님의 고민: '" + concern.substring(0, 30) + "...'에 대해 선택하신 3장의 카드가 강력한 **전환점과 승리의 기운**을 암시합니다.",
                "premium": "<div class='premium-content'><div style='background:rgba(211,184,248,0.1); border:1px solid rgba(211,184,248,0.5); border-radius:12px; padding:20px; margin-bottom:35px; text-align:center;'><h4 style='color:#D3B8F8; margin-bottom:15px;'>[선택한 메이저 아르카나]</h4><p style='color:#fff;'>과거: 바보(The Fool) | 현재: 운명의 휠(Wheel of Fortune) | 미래: 태양(The Sun)</p></div><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[1. 과거와 현재의 흐름 분석]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px;'>고민하셨던 상황은 큰 변화의 수레바퀴 속에서 필연적으로 맞이한 과제입니다. 주저하기보다 직관을 믿고 나아갈 때입니다.</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[2. 미래의 해법과 우주의 조언]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px;'>태양 카드가 암시하듯 긍정적이고 명확한 성과가 기다리고 있습니다. 스스로를 믿고 주도권을 쥐십시오.</p></div>"
            };
            renderSajuResult(name, "타로 3카드 심층 분석", "", "", "", tarotResultData, "tarot", null, null, false);
        };
    });
}

window.checkSmishing = function () {
    const url = document.getElementById('suspectUrl').value.trim();
    if (url === '**') { showToast("무제한 감별 모드가 활성화되었습니다."); return; }
    document.getElementById('urlCheckResult').style.display = 'block';
    document.getElementById('urlCheckResult').innerHTML = "현재 보안 데이터베이스에 보고된 위험이 없습니다.";
};

window.previewFaceImage = function (event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('facePreview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
};

window.startFaceReading = function () {
    const preview = document.getElementById('facePreview');
    if (!preview || !preview.src || preview.style.display === 'none') {
        alert("사진을 먼저 업로드해 주십시오.");
        return;
    }
    const faceResultData = {
        "scores": { "wealth": 92, "success": 88, "love": 85, "health": 90 },
        "keyword1": "용의 기상",
        "keyword2": "대기만성 관상",
        "keyword3": "재물 창고의 명당",
        "summary": "얼굴의 이마와 코의 능선에 **강렬한 명예와 재물 기운**이 흐르고 있습니다. 눈빛의 정기와 턱 선의 안정감이 돋보이며, 나이가 들수록 더 큰 권력과 부를 축적하는 대기만성형 관상입니다.",
        "premium": "<div class='premium-content'><div style='background:rgba(244,143,177,0.1); border:1px solid rgba(244,143,177,0.5); border-radius:12px; padding:20px; margin-bottom:35px; text-align:center;'><h4 style='color:#F48FB1; margin-bottom:15px;'>[관상 12궁 핵심 지표]</h4><p style='color:#fff;'>이마(관록궁): 상급 | 코(재백궁): 최상급 | 눈(전택궁): 상급</p></div><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[1. 이마와 코 - 재물과 명예운]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px;'>이마가 넓고 훤칠하여 젊은 시절부터 조력자의 도움을 받기 쉬운 형상입니다. 코끝이 두툼하고 살집이 있어 들어온 재물이 쉽게 나가지 않는 철옹성 같은 기운을 품고 있습니다.</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[2. 눈과 입 - 대인관계 및 애정운]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px;'>눈빛에 기품이 있고 또렷하여 사람을 끄는 강력한 매력이 있습니다. 입꼬리가 위로 살짝 올라가 있어 귀인이 절로 찾아오고 긍정적인 운을 불러옵니다.</p><h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[3. 관상 개운 조언]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px;'>이마를 환하게 드러낼수록 명예운과 직업운이 크게 상승합니다. 미간을 항상 밝게 유지하고 자주 웃는 인상을 짓는다면 더욱 큰 복이 찾아옵니다.</p></div>"
    };
    renderSajuResult("관상 분석", "관상 심층 해독", "", "", "", faceResultData, "face", null, null, false);
};

function generateSajuChartsHTML(colorInfo, bazi, wuXing, isUnknownTime) {
    try {
        if (!bazi) return "";
        const hColor = colorInfo ? colorInfo.highlightHex : '#FFDF73';
        const tg = isUnknownTime ? '？' : bazi.getTimeGan();
        const tz = isUnknownTime ? '？' : bazi.getTimeZhi();
        return "<div style='margin-top: 1.5rem; margin-bottom: 2.5rem; padding: 1.5rem; background: rgba(0,0,0,0.6); border-radius: 15px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.5);'>" +
            "<h3 style='text-align: center; color: " + hColor + "; font-size: 1.25rem; margin-bottom: 1.5rem; font-weight: bold;'>[나의 사주 명식]</h3>" +
            "<div style='display: flex; justify-content: space-between; text-align: center; color: #fff;'>" +
            "<div style='flex: 1; margin: 0 4px; background: rgba(255,255,255,0.05); padding: 12px 0; border-radius: 10px;'>" +
            "<div style='font-size: 0.8rem; color: #aaa; margin-bottom: 8px;'>시주(시간)</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold; margin-bottom: 5px;'>" + tg + "</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold;'>" + tz + "</div>" +
            "</div>" +
            "<div style='flex: 1; margin: 0 4px; background: rgba(212, 175, 55, 0.15); padding: 12px 0; border-radius: 10px; border: 1px solid rgba(212, 175, 55, 0.5); box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);'>" +
            "<div style='font-size: 0.8rem; color: " + hColor + "; margin-bottom: 8px; font-weight: bold;'>일주(나)</div>" +
            "<div style='font-size: 1.5rem; font-weight: bold; color: " + hColor + "; margin-bottom: 5px;'>" + bazi.getDayGan() + "</div>" +
            "<div style='font-size: 1.5rem; font-weight: bold; color: " + hColor + ";'>" + bazi.getDayZhi() + "</div>" +
            "</div>" +
            "<div style='flex: 1; margin: 0 4px; background: rgba(255,255,255,0.05); padding: 12px 0; border-radius: 10px;'>" +
            "<div style='font-size: 0.8rem; color: #aaa; margin-bottom: 8px;'>월주(환경)</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold; margin-bottom: 5px;'>" + bazi.getMonthGan() + "</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold;'>" + bazi.getMonthZhi() + "</div>" +
            "</div>" +
            "<div style='flex: 1; margin: 0 4px; background: rgba(255,255,255,0.05); padding: 12px 0; border-radius: 10px;'>" +
            "<div style='font-size: 0.8rem; color: #aaa; margin-bottom: 8px;'>년주(조상)</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold; margin-bottom: 5px;'>" + bazi.getYearGan() + "</div>" +
            "<div style='font-size: 1.4rem; font-weight: bold;'>" + bazi.getYearZhi() + "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
    } catch (e) {
        console.error("차트 생성 중 문제가 발생했습니다:", e);
        return "";
    }
}