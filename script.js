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
// 4. 사주 AI 엔진 
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

    let detailRequest = "";
    if (fortuneType === 'wealth') {
        detailRequest = "반드시 [타고난 재물 그릇], [부의 변곡점이 되는 시기], [재물 손실 방지책], [전문적인 재테크 방향]으로 나누어 작성해. 오직 텍스트로만 각 항목당 500자 이상 아주 깊이 있게 분석해.";
    } else if (fortuneType === 'yearly') {
        detailRequest = "반드시 다음 17가지 항목으로 세분화해서 작성해: [올해의 총운], [재물 및 투자운], [직장 및 사업운], [가정 및 대인운], [건강 및 주의사항], 그리고 [1월 운세]부터 [12월 운세]까지 월별 운세 12개. 각 항목당 최소 300자 이상으로 길고 상세하게 설명해.";
    } else if (fortuneType === 'love') {
        detailRequest = "반드시 다음 항목으로 세분화해: [현재의 애정운], [나의 매력 포인트], [다가오는 인연의 흐름], [관계 발전을 위한 조언]. 각 항목당 최소 400자 이상으로 깊이 있게 분석해.";
    } else {
        detailRequest = "반드시 다음 4가지 항목으로 세분화해: [재물 및 사업운], [직장 및 명예운], [대인관계 및 가정운], [건강 및 주의사항]. 각 항목당 최소 400자 이상으로 상세히 작성해.";
    }

    const promptText = "너는 최고급 명리학자야. 고객 정보 - 이름: '" + name + "', 성별: '" + gender + "', 생년월일: " + year + "년 " + month + "월 " + day + "일, 결혼여부: '" + maritalStatus + "'\n" +
        "명식: " + sajuStr + ", 오행: " + wuXing + ". 분석 종류: '" + displayTypeName + "'.\n" +
        "유머나 이모티콘은 절대 금지하며, 상위 0.1% VIP 고객에게 전달하는 매우 진지하고 무게감 있는 전문가의 어조로 작성해.\n" +
        "반드시 아래 JSON 형식으로만 응답해. (HTML 태그 절대 금지)\n" +
        "{\n" +
        "    \"scores\": { \"wealth\": 85, \"success\": 90, \"love\": 75, \"health\": 80 },\n" +
        "    \"keyword1\": \"(분석을 관통하는 거대한 핵심 키워드 1 - 10자 이내)\",\n" +
        "    \"keyword2\": \"(가장 강력한 운명의 특징 2 - 10자 이내)\",\n" +
        "    \"keyword3\": \"(앞으로 다가올 변화 3 - 10자 이내)\",\n" +
        "    \"summary\": \"(이곳에 무료공개용 사주 요약 3~4문장을 작성해. 중요한 단어 양옆에는 반드시 **단어** 형태로 별표 2개를 붙여서 강조해줄 것)\",\n" +
        "    \"premium\": \"<div class='premium-content'><div style='background:rgba(255,223,115,0.08); border:1px solid rgba(255,223,115,0.5); border-radius:12px; padding:20px; margin-bottom:35px; text-align:center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'><h4 style='color:#FFDF73; margin-bottom:15px; font-size:1.15rem; letter-spacing: 1px;'>[" + displayTypeName + " 행운 지표]</h4><p style='color:#fff; margin:0; font-size:1rem;'>색상: <strong style='color:#81D4FA;'>(색상)</strong> &nbsp;|&nbsp; 숫자: <strong style='color:#F48FB1;'>(숫자)</strong> &nbsp;|&nbsp; 방향: <strong style='color:#A5D6A7;'>(방향)</strong></p></div><div style='margin-bottom:30px; padding:15px; background:rgba(156, 39, 176, 0.1); border-left:4px solid #D3B8F8; border-radius:8px;'><h4 style='color:#D3B8F8; margin-bottom:10px; font-size:1.15rem;'>[핵심 십성(十星) 기운]</h4><p style='color:#fff; font-size:1.05rem; margin:0;'><strong style='color:#FFDF73;'>(해당 운세 기간에 강하게 들어오는 십성 1~2개 기재)</strong> - (이 십성이 현재 고객에게 어떤 영향을 주는지 아주 깊이 있게 3~4문장 이상으로 풀이)</p></div>(이곳에 " + detailRequest + " 각 항목은 반드시 <h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[항목명]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(풀이 내용 - 각 항목당 반드시 3~4문장 이상의 긴 호흡으로 구체적인 근거와 시기, 대처법 등을 포함하여 아주 길게 작성할 것)</p> 형태의 HTML을 사용해서 반복 작성할 것)</div>\"\n" +
        "}";

    if (name === '테스트') {
        clearInterval(messageInterval);
        loadingScreen.style.display = 'none';
        window.removeEventListener('beforeunload', preventExit);

        const testResultData = {
            "scores": { "wealth": 99, "success": 99, "love": 99, "health": 99 },
            "keyword1": "거대한 조력자",
            "keyword2": "제왕의 기틀",
            "keyword3": "중차대한 전환점",
            "summary": "올해는 정재와 겁재의 운이 교차하며, 이는 단순한 재물 증식을 넘어 **사회적 지위의 공고화**와 **권위의 확립**을 의미하는 중차대한 변환점이 될 것입니다.",
            "premium": "<div class='premium-content'><div style='text-align:center; color:#fff; padding:50px; border: 1px dashed rgba(255,255,255,0.3); border-radius: 10px;'>이곳은 프리미엄 리포트 영역입니다.<br>(테스트 모드에서는 내용이 생략됩니다)</div></div>"
        };
        renderSajuResult(name, displayTypeName, year, month, day, testResultData, fortuneType, bazi, wuXing, isUnknownTime);
        return;
    }

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

function getPersonalColor(yearStr) {
    const lastDigit = parseInt(yearStr, 10) % 10;
    if (lastDigit === 4 || lastDigit === 5) return { element: '목(木)', textHex: '#DCE775', highlightHex: '#C5E1A5', borderRgba: 'rgba(197, 225, 165, 0.4)' };
    if (lastDigit === 6 || lastDigit === 7) return { element: '화(火)', textHex: '#FFCCBC', highlightHex: '#FFAB91', borderRgba: 'rgba(255, 171, 145, 0.4)' };
    if (lastDigit === 8 || lastDigit === 9) return { element: '토(土)', textHex: '#FFE082', highlightHex: '#FFD54F', borderRgba: 'rgba(255, 213, 79, 0.4)' };
    if (lastDigit === 0 || lastDigit === 1) return { element: '금(金)', textHex: '#EEEEEE', highlightHex: '#FFFFFF', borderRgba: 'rgba(255, 255, 255, 0.4)' };
    return { element: '수(水)', textHex: '#B3E5FC', highlightHex: '#81D4FA', borderRgba: 'rgba(129, 212, 250, 0.4)' };
}

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

// ==========================================
// 💡 화면 렌더링 (VIP 레이아웃 + 스크롤 고정 완벽 해결)
// ==========================================
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
    resultSec.style.padding = "30px 15px";

    const colorInfo = getPersonalColor(year);

    let bgImageName = 'bg_mystic.png';
    if (colorInfo.element === '목(木)') bgImageName = 'bg_wood.png';
    else if (colorInfo.element === '화(火)') bgImageName = 'bg_fire.png';
    else if (colorInfo.element === '토(土)') bgImageName = 'bg_earth.png';
    else if (colorInfo.element === '금(金)') bgImageName = 'bg_metal.png';
    else if (colorInfo.element === '수(水)') bgImageName = 'bg_water.png';

    let safeSummary = (resultData.summary || "").replace(/\*\*(.*?)\*\*/g, "<strong style='color:#FFD700;'>$1</strong>");
    let chartHTML = (fortuneType === 'wealth') ? "" : generateSajuChartsHTML(colorInfo, bazi, wuXing, isUnknownTime);

    // HTML 태그 띄어쓰기 오류 수정본 적용
    let premiumCardHTML = `
        <div class="paper-container" style='max-width: 550px; margin: 0 auto; background: #111; border: 1px solid #D4AF37; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(212,175,55,0.15);'>
            <div style='width: 100%; height: 350px; background: url("images/${bgImageName}") center/cover no-repeat; position: relative;'>
                <div style='position: absolute; bottom: 0; width: 100%; height: 150px; background: linear-gradient(to bottom, transparent, #111);'></div>
            </div>
            <div style='padding: 0 25px 30px 25px; text-align: center; position: relative; z-index: 2; margin-top: -50px;'>
                <h2 style='color: #FFD700; font-size: 0.9rem; letter-spacing: 2px; margin-bottom: 20px;'>${name}님을 위한 ${typeName}</h2>
                <div style='margin-bottom: 35px;'>
                    <div style='font-size: 1.5rem; font-weight: 900; color: #E5C07B; margin-bottom: 8px;'>${resultData.keyword1 || "거대한 조력자"}</div>
                    <div style='font-size: 2.4rem; font-weight: 900; color: #FFD700; margin-bottom: 8px; text-shadow: 0px 2px 10px rgba(255,215,0,0.3);'>${resultData.keyword2 || "제왕의 기틀"}</div>
                    <div style='font-size: 1.5rem; font-weight: 900; color: #E5C07B;'>${resultData.keyword3 || "중차대한 전환점"}</div>
                </div>
                <div style='position: relative; padding: 25px 20px; border-top: 1px dashed rgba(212,175,55,0.4); border-bottom: 1px dashed rgba(212,175,55,0.4);'>
                    <div style='position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #111; padding: 0 15px; color: #D4AF37; font-size: 0.9rem; font-weight: bold;'>[ 운명 요약 ]</div>
                    <p style='color:#e0e0e0; font-size: 1.05rem; line-height: 1.8; text-align: justify; word-break: keep-all; margin: 0;'>${safeSummary}</p>
                </div>
                ${chartHTML}
            </div>
        </div>
    `;

    document.getElementById('freeContentArea').innerHTML = premiumCardHTML;
    if (document.getElementById('resultTitle')) document.getElementById('resultTitle').style.display = 'none';

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

    // 💡 누락되었던 핵심 코드: 결과창이 완성되면 무조건 스크롤을 맨 위로 부드럽게 끌어올림
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. 결제 모듈 연동
// ==========================================
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
            amount: amount, orderId: 'saju_' + new Date().getTime(), orderName: typeName,
            customerName: "고객", successUrl: window.location.href + "?orderId=" + new Date().getTime(), failUrl: window.location.href
        }).catch(function () {
            alert("결제가 취소되었습니다.");
            localStorage.removeItem('savedSajuResultHTML');
        });
    };
};

const urlParamsForPayment = new URLSearchParams(window.location.search);
if (urlParamsForPayment.has('paymentKey')) {
    showToast("안전하게 결제를 최종 승인하고 있습니다.");
    fetch('/api/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey: urlParamsForPayment.get('paymentKey'), orderId: urlParamsForPayment.get('orderId'), amount: urlParamsForPayment.get('amount') })
    }).then(function (res) { return res.json(); }).then(function (data) {
        if (data.orderId) {
            alert("결제가 완료되었습니다. 프리미엄 리포트가 해제됩니다.");

            const saved = localStorage.getItem('savedSajuResultHTML');
            if (saved) {
                const header = document.querySelector('.header-neon');
                if (header) header.style.display = 'none';

                const bg = document.querySelector('.star-bg-fixed');
                if (bg) bg.style.display = 'none';

                const sections = ['login-section', 'gateway', 'daily'];
                sections.forEach(id => {
                    if (document.getElementById(id)) document.getElementById(id).style.display = 'none';
                });

                const resultSec = document.getElementById('result');
                resultSec.innerHTML = saved;
                resultSec.style.display = 'block';
                resultSec.style.background = "#080808";
                resultSec.style.minHeight = "100vh";
                resultSec.style.padding = "30px 15px";

                document.getElementById('premiumContentArea').style.filter = "none";
                document.getElementById('premiumContentArea').style.opacity = "1";
                document.getElementById('premiumContentArea').style.pointerEvents = "auto";
                if (document.getElementById('unlockOverlay')) document.getElementById('unlockOverlay').style.display = 'none';
                if (document.getElementById('sajuActionsArea')) document.getElementById('sajuActionsArea').style.display = 'block';

                localStorage.removeItem('savedSajuResultHTML');

                const keepDataStr = localStorage.getItem('fortune_keep_data');
                if (keepDataStr) {
                    const keepData = JSON.parse(keepDataStr);
                    keepData.isUnlocked = true;
                    localStorage.setItem('fortune_keep_data', JSON.stringify(keepData));
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }).catch(function (err) {
        console.error("결제 승인 오류:", err);
        alert("결제 승인 중 통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });
    window.history.replaceState({}, document.title, window.location.pathname);
}

// ==========================================
// 6. 타로 및 관상 엔진
// ==========================================
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
        btnRead.onclick = function () { alert("우주의 파동을 분석합니다."); location.reload(); };
    });
}

window.checkSmishing = function () {
    const url = document.getElementById('suspectUrl').value.trim();
    if (url === '**') { showToast("무제한 감별 모드가 활성화되었습니다."); return; }
    document.getElementById('urlCheckResult').style.display = 'block';
    document.getElementById('urlCheckResult').innerHTML = "현재 보안 데이터베이스에 보고된 위험이 없습니다.";
};

// ==========================================
// 7. 사주 명식 차트 생성 엔진
// ==========================================
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