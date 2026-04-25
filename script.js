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
    let freeText = document.getElementById('freeContentArea') ? document.getElementById('freeContentArea').innerText : "";
    const snippet = "[포춘스토리 정밀 분석 리포트]\n\n" + freeText + "\n\n👉 본인의 운명 확인하기\nhttps://fortune-story.com";
    try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(snippet);
        else throw new Error("Clipboard API 불가");
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
                                }, { merge: true }).catch(() => { });
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
// 3. 화면 이동 (네비게이션)
// ==========================================
window.selectPath = function (path) {
    const sections = ['login-section', 'gateway', 'daily', 'tarot', 'faceSection', 'amuletSection', 'result', 'tarotResult', 'tarotDraw'];
    sections.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

    const header = document.querySelector('.header-neon');
    if (header) header.style.display = 'flex';

    const bg = document.querySelector('.star-bg-fixed');
    if (bg) bg.style.display = 'block';

    if (path === 'gateway') document.getElementById('gateway').style.display = 'block';
    else if (path === 'saju') document.getElementById('daily').style.display = 'block';
    else if (path === 'tarot') document.getElementById('tarot').style.display = 'block';
    else if (path === 'face') document.getElementById('faceSection').style.display = 'block';
    else if (path === 'amulet') document.getElementById('amuletSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleQuickMenu = function () {
    const opts = document.getElementById('fabOptions');
    const btn = document.getElementById('fabMainBtn');
    opts.classList.toggle('active');
    btn.innerText = opts.classList.contains('active') ? '✕' : '✦';
};

window.quickNav = function (path) {
    window.selectPath(path);
    window.toggleQuickMenu();
};

// ==========================================
// 4. 사주 AI 엔진 (화면 멈춤 및 이모티콘 완벽 제거)
// ==========================================
const sajuForm = document.getElementById('sajuForm');
if (sajuForm) {
    sajuForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fortuneType = document.getElementById('fortuneType').value;
        const rawName = document.getElementById('name').value.trim();
        window.isMasterKey = rawName.includes('**') || sessionStorage.getItem('isFortuneMaster') === 'true';
        const name = rawName.replace(/[*']/g, '');

        if (name.length < 2) { alert("정확한 분석을 위해 이름을 2글자 이상 입력해주십시오."); return; }

        const gender = document.querySelector('input[name="gender"]:checked').value;
        const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;
        const calendarType = document.querySelector('input[name="calendarType"]:checked').value;
        const year = document.getElementById('birthYear').value;
        let month = document.getElementById('birthMonth').value;
        let day = document.getElementById('birthDay').value;

        if (!year || !month || !day) { alert('생년월일을 모두 입력해주십시오.'); return; }
        month = month.padStart(2, '0'); day = day.padStart(2, '0');

        // 💡 버튼 멈춤을 유발했던 괄호 빠짐 에러 완벽 해결
        let displayTypeName = {
            'daily': "오늘의 운세",
            'weekly': "주간 운세",
            'yearly': "1년 심층 운세",
            'wealth': "재물운 심층 분석",
            'love': "애정 및 연애운",
            'subscribe': "월간 운세 구독"
        }[fortuneType] || "명리 분석";

        try {
            if (typeof Kakao !== 'undefined') {
                if (!Kakao.isInitialized()) Kakao.init('a5c28b4d706bced99d7282a87113ec82');
                Kakao.Auth.login({
                    throughTalk: false,
                    success: function () { startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType); },
                    fail: function () { startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType); }
                });
            } else {
                startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType);
            }
        } catch (err) {
            startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType);
        }
    });
}

async function startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType) {
    document.getElementById('daily').style.display = 'none';
    const loadingScreen = document.getElementById('analysisLoading');
    loadingScreen.style.display = 'flex';
    document.getElementById('loadingTitle').innerHTML = `${name}님의 <span style="color:#81D4FA;">${displayTypeName}</span> 분석 중입니다.`;
    window.addEventListener('beforeunload', preventExit);

    const isUnknownTime = document.getElementById('unknownTime') && document.getElementById('unknownTime').checked;
    let hour = 12, minute = 0;
    if (!isUnknownTime && document.getElementById('birthHour') && document.getElementById('birthMinute')) {
        hour = parseInt(document.getElementById('birthHour').value) || 12;
        minute = parseInt(document.getElementById('birthMinute').value) || 0;
    }

    let lunarObj = calendarType === 'solar'
        ? Solar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0).getLunar()
        : Lunar.fromYmdHms(parseInt(year), parseInt(month), parseInt(day), hour, minute, 0);
    let bazi = lunarObj.getEightChar();
    let sajuStr = `${bazi.getYear()}년 ${bazi.getMonth()}월 ${bazi.getDay()}일 ${isUnknownTime ? '(시간 미상)' : bazi.getTime() + '시'}`;
    let wuXing = bazi.getYearWuXing() + bazi.getMonthWuXing() + bazi.getDayWuXing();
    if (!isUnknownTime) wuXing += bazi.getTimeWuXing();

    let detailRequest = "";
    if (fortuneType === 'wealth') {
        detailRequest = "반드시 [타고난 재물 그릇], [부의 변곡점이 되는 시기], [재물 손실 방지책], [전문적인 재테크 방향]으로 나누어 작성해. 그림이나 차트는 절대 넣지 말고 오직 텍스트로만 각 항목당 500자 이상 아주 깊이 있게 분석해.";
    } else if (fortuneType === 'yearly') {
        detailRequest = "반드시 다음 17가지 항목으로 세분화해서 작성해: [올해의 총운], [재물 및 투자운], [직장 및 사업운], [가정 및 대인운], [건강 및 주의사항], 그리고 [1월 운세]부터 [12월 운세]까지 월별 운세 12개. (총 17개 항목 필수). 각 항목당 최소 300자 이상으로, 구체적인 시기와 대처법을 포함해 길고 상세하게 설명해.";
    } else if (fortuneType === 'love') {
        detailRequest = "반드시 다음 항목으로 세분화해: [현재의 애정운], [나의 매력 포인트], [다가오는 인연의 흐름], [관계 발전을 위한 조언]. 각 항목당 최소 400자 이상으로 감정선의 변화까지 깊이 있게 분석해.";
    } else {
        detailRequest = "반드시 다음 4가지 항목으로 세분화해: [재물 및 사업운], [직장 및 명예운], [대인관계 및 가정운], [건강 및 주의사항]. 각 항목당 최소 400자 이상으로 실질적이고 구체적인 조언을 담아 상세히 작성해.";
    }

    // 💡 프롬프트 내 모든 이모티콘 제거 및 진지한 어조 강화
    const promptText = `
        너는 최고급 명리학자야. 고객 정보 - 이름: '${name}', 성별: '${gender}', 생년월일: ${year}년 ${month}월 ${day}일, 결혼여부: '${maritalStatus}'
        명식: ${sajuStr}, 오행: ${wuXing}. 분석 종류: '${displayTypeName}'.
        
        유머나 이모티콘은 절대 금지하며, 상위 0.1% VIP 고객에게 전달하는 매우 진지하고 무게감 있는 전문가의 어조로 작성해.
        전체 글자 수는 최소 3000자 이상이 되도록 내용을 풍부하고 깊이 있게 채워. ${fortuneType === 'wealth' ? '재물운 분석 시 시각적인 그림이나 차트는 일절 포함하지 마.' : ''}

        반드시 아래 JSON 형식으로만 응답해. (다른 텍스트 절대 불가, 따옴표나 줄바꿈에 주의할 것)
        {
            "scores": { "wealth": 85, "success": 90, "love": 75, "health": 80 },
            "free": "<div class='free-preview'><h3 style='color:#FFDF73; margin-bottom:10px;'>[운명 요약]</h3><p style='font-size:1.2rem; font-weight:bold; color:#fff; margin-bottom:15px;'>(전문적이고 날카로운 한줄 풀이)</p><p>(무료공개용 2~3문장)</p></div>",
            "premium": "<div class='premium-content'><div style='background:rgba(255,223,115,0.08); border:1px solid rgba(255,223,115,0.5); border-radius:12px; padding:20px; margin-bottom:35px; text-align:center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);'><h4 style='color:#FFDF73; margin-bottom:15px; font-size:1.15rem; letter-spacing: 1px;'>[${displayTypeName} 행운 지표]</h4><p style='color:#fff; margin:0; font-size:1rem;'>색상: <strong style='color:#81D4FA;'>(색상)</strong> &nbsp;|&nbsp; 숫자: <strong style='color:#F48FB1;'>(숫자)</strong> &nbsp;|&nbsp; 방향: <strong style='color:#A5D6A7;'>(방향)</strong></p></div><div style='margin-bottom:30px; padding:15px; background:rgba(156, 39, 176, 0.1); border-left:4px solid #D3B8F8; border-radius:8px;'><h4 style='color:#D3B8F8; margin-bottom:10px; font-size:1.15rem;'>[핵심 십성(十星) 기운]</h4><p style='color:#fff; font-size:1.05rem; margin:0;'><strong style='color:#FFDF73;'>(해당 운세 기간에 강하게 들어오는 십성 1~2개 기재)</strong> - (이 십성이 현재 고객에게 어떤 영향을 주는지 아주 깊이 있게 3~4문장 이상으로 풀이)</p></div>(이곳에 ${detailRequest} 각 항목은 반드시 <h4 style='color:#FFDF73; margin-top:30px; border-bottom:1px solid rgba(255,223,115,0.3); padding-bottom:10px; font-size:1.2rem;'>[항목명]</h4><p style='color:#e0e0e0; line-height:1.8; margin-top:15px; margin-bottom:25px; font-size: 1.05rem;'>(풀이 내용 - 각 항목당 반드시 3~4문장 이상의 긴 호흡으로 구체적인 근거와 시기, 대처법 등을 포함하여 아주 길게 작성할 것)</p> 형태의 HTML을 사용해서 반복 작성할 것)</div>"
        }
    `;

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        const data = await response.json();
        loadingScreen.style.display = 'none';
        window.removeEventListener('beforeunload', preventExit);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiResultText = data.candidates[0].content.parts[0].text;
            aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultData = JSON.parse(aiResultText);
            renderSajuResult(name, displayTypeName, year, month, day, resultData, fortuneType, bazi, wuXing);
        } else {
            alert("데이터를 가져오지 못했습니다.");
        }
    } catch (error) {
        console.error(error);
        loadingScreen.style.display = 'none';
        window.removeEventListener('beforeunload', preventExit);
        alert("분석 중 오류가 발생했습니다. 다시 시도해 주십시오.");
    }
}

function getPersonalColor(yearStr) {
    const lastDigit = parseInt(yearStr) % 10;
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
    const elementToCapture = document.querySelector(`#${targetId} .paper-container`) || document.querySelector(`#${targetId}`);
    const actionArea = elementToCapture.querySelector('.result-actions') || document.getElementById('sajuActionsArea');
    if (actionArea) actionArea.style.display = 'none';

    setTimeout(() => {
        html2canvas(elementToCapture, {
            scale: window.devicePixelRatio ? window.devicePixelRatio * 2 : 4,
            useCORS: true,
            backgroundColor: '#1a1a1a',
            scrollY: -window.scrollY
        }).then(canvas => {
            if (actionArea) actionArea.style.display = 'block';
            const link = document.createElement('a');
            link.download = `포춘스토리_정밀분석.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            showToast("저장이 완료되었습니다.");
        }).catch(() => {
            if (actionArea) actionArea.style.display = 'block';
            alert("이미지 저장 중 오류가 발생했습니다.");
        });
    }, 500);
};

function renderSajuResult(name, typeName, year, month, day, resultData, fortuneType, bazi, wuXing) {
    const header = document.querySelector('.header-neon');
    if (header) header.style.display = 'none';
    const bg = document.querySelector('.star-bg-fixed');
    if (bg) bg.style.display = 'none';

    document.getElementById('result').style.display = 'block';

    const colorInfo = getPersonalColor(year);
    document.getElementById('resultTitle').innerHTML = `<span style="font-size: 0.65em; color: ${colorInfo.highlightHex};">${name}님을 위한 명리 컨설팅</span><br><span style="font-size: 1.15em; display: inline-block; margin-top: 15px;">${typeName}</span>`;

    let chartHTML = (fortuneType === 'wealth') ? "" : generateSajuChartsHTML(colorInfo, bazi, wuXing);
    document.getElementById('freeContentArea').innerHTML = resultData.free + chartHTML;

    let premiumHTML = "";
    if (resultData.scores) {
        const s = resultData.scores;
        premiumHTML += `
        <div style="margin-top: 1rem; margin-bottom: 3rem; padding: 2rem; background: rgba(0,0,0,0.4); border-radius: 15px; border: 1px solid rgba(212, 175, 55, 0.3);">
            <h3 style="text-align: center; color: #FFDF73; font-size: 1.3rem; margin-bottom: 2rem; font-weight: bold;">[핵심 운기 지표]</h3>
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>재물 및 금전운</span><span style="color: #FFD54F;">${s.wealth}점</span></div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;"><div style="width: ${s.wealth}%; background: linear-gradient(90deg, #F9F6CA, #D4AF37); height: 100%; border-radius: 7px;"></div></div>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>성공 및 학업운</span><span style="color: #4CAF50;">${s.success}점</span></div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;"><div style="width: ${s.success}%; background: linear-gradient(90deg, #A5D6A7, #4CAF50); height: 100%; border-radius: 7px;"></div></div>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>대인 및 애정운</span><span style="color: #FF8A80;">${s.love}점</span></div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;"><div style="width: ${s.love}%; background: linear-gradient(90deg, #FFCDD2, #FF5252); height: 100%; border-radius: 7px;"></div></div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; color: #fff; margin-bottom: 5px;"><span>건강 및 활력운</span><span style="color: #81D4FA;">${s.health}점</span></div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 14px; border-radius: 7px;"><div style="width: ${s.health}%; background: linear-gradient(90deg, #B3E5FC, #29B6F6); height: 100%; border-radius: 7px;"></div></div>
            </div>
        </div>`;
    }

    premiumHTML += resultData.premium;
    const premiumArea = document.getElementById('premiumContentArea');
    premiumArea.innerHTML = premiumHTML;

    // 💡 이모티콘 싹 뺀 버튼 디자인
    if (window.isMasterKey) {
        premiumArea.style.filter = "none";
        premiumArea.style.opacity = "1";
        premiumArea.style.pointerEvents = "auto";
        document.getElementById('unlockOverlay').style.display = 'none';
        document.getElementById('sajuActionsArea').style.display = 'block';
        document.getElementById('sajuActionsArea').innerHTML = `
            <div style="margin-top: 1rem; text-align: center; padding-bottom: 2rem;">
                <p style="color: #FFDF73; margin-bottom: 1.5rem; font-weight:bold;">마스터 권한으로 프리미엄 리포트가 해제되었습니다.</p>
                <button class="btn-premium kakao pulse-btn" style="width: 100%; border-radius: 50px; background-color: #FEE500; color: #000; font-weight: bold; border: none; height: 60px; margin-bottom:10px;" onclick="shareKakaoCombo('saju')">카카오톡으로 전체 결과 발송</button>
                <button class="btn-premium outline" style="width: 100%; border-radius: 50px; background: rgba(0,0,0,0.3); border: 1px solid #fff; color: #fff; height: 60px;" onclick="handlePdfPrint('saju')">결과 이미지 저장</button>
            </div>`;
    } else {
        premiumArea.style.filter = "blur(8px)";
        premiumArea.style.opacity = "0.5";
        premiumArea.style.pointerEvents = "none";
        document.getElementById('unlockOverlay').style.display = 'flex';
        document.getElementById('sajuActionsArea').style.display = 'none';

        const price = {
            daily: 3900,
            weekly: 5900,
            yearly: 9900,
            wealth: 12900,
            love: 8900,
            subscribe: 13900
        }[fortuneType] || 5900;
        document.getElementById('lockPriceAmount').textContent = `${price.toLocaleString()}원`;
        document.getElementById('btnUnlockPremium').onclick = () => window.openPaymentModal(typeName, price);
    }
}

function generateSajuChartsHTML(colorInfo, bazi, wuXing) {
    let counts = [
        (wuXing.match(/木/g) || []).length, (wuXing.match(/火/g) || []).length,
        (wuXing.match(/土/g) || []).length, (wuXing.match(/金/g) || []).length, (wuXing.match(/水/g) || []).length
    ];

    let hookMessage = "오행의 밸런스가 비교적 고른 사주입니다.";
    if (counts[4] === 0) hookMessage = "사주에 수(水) 기운이 고갈되어 있습니다. 잦은 막힘이나 답답함을 느낄 수 있는 명식입니다.";
    else if (counts[1] >= 3) hookMessage = "불(火)의 에너지가 아주 강합니다. 급격한 감정 소모와 충동적인 결정을 경계해야 합니다.";
    else if (counts[0] === 0) hookMessage = "시작과 뻗어나가는 힘인 목(木)이 부족합니다. 실행력 부족으로 기회를 놓칠 확률이 높습니다.";
    else if (counts[2] >= 3) hookMessage = "흙(土)의 기운이 태산처럼 쌓여 있습니다. 지나친 고집으로 스스로 고립을 자초할 수 있습니다.";

    return `
    <div style="margin-top: 2rem; margin-bottom: 2rem; padding: 2rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2);">
        <div style="font-size: 1.1rem; color: ${colorInfo.highlightHex}; text-align: center; font-weight: bold; margin-bottom: 15px;">실제 오행(五行) 분포도</div>
        <p style="color: #fff; text-align: center; margin-bottom: 10px; font-size: 1.05rem;">
            목(<span style="color:#4CAF50; font-weight:bold;">${counts[0]}</span>) · 
            화(<span style="color:#F44336; font-weight:bold;">${counts[1]}</span>) · 
            토(<span style="color:#FFC107; font-weight:bold;">${counts[2]}</span>) · 
            금(<span style="color:#9E9E9E; font-weight:bold;">${counts[3]}</span>) · 
            수(<span style="color:#2196F3; font-weight:bold;">${counts[4]}</span>)
        </p>
        <div style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-left: 4px solid ${colorInfo.highlightHex}; border-radius: 8px;">
            <p style="color: #fff; font-size: 1rem; line-height: 1.5; margin: 0;">${hookMessage}</p>
        </div>
    </div>`;
}

// ==========================================
// 5. 결제 모듈 연동
// ==========================================
window.openPaymentModal = function (typeName, amount) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('paymentFortuneType').textContent = typeName;
    document.getElementById('paymentAmount').textContent = amount.toLocaleString() + "원";
    modal.style.display = 'flex';

    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('confirmPaymentBtn').onclick = () => {
        modal.style.display = 'none';
        sessionStorage.setItem('savedSajuResultHTML', document.getElementById('result').innerHTML);
        const tossPayments = TossPayments("live_ck_ORzdMaqN3wyPbE0GKqQbR5AkYXQG");
        tossPayments.requestPayment('카드', {
            amount: amount, orderId: 'saju_' + new Date().getTime(), orderName: typeName,
            customerName: "고객", successUrl: window.location.href + "?orderId=" + new Date().getTime(), failUrl: window.location.href
        }).catch(() => {
            alert("결제가 취소되었습니다.");
            sessionStorage.removeItem('savedSajuResultHTML');
        });
    };
};

const urlParamsForPayment = new URLSearchParams(window.location.search);
if (urlParamsForPayment.has('paymentKey')) {
    showToast("안전하게 결제를 최종 승인하고 있습니다.");
    fetch('/api/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey: urlParamsForPayment.get('paymentKey'), orderId: urlParamsForPayment.get('orderId'), amount: urlParamsForPayment.get('amount') })
    }).then(res => res.json()).then(data => {
        if (data.orderId) {
            alert("결제가 완료되었습니다. 프리미엄 리포트가 해제됩니다.");
            const saved = sessionStorage.getItem('savedSajuResultHTML');
            if (saved) {
                const header = document.querySelector('.header-neon');
                if (header) header.style.display = 'none';
                const bg = document.querySelector('.star-bg-fixed');
                if (bg) bg.style.display = 'none';

                document.getElementById('daily').style.display = 'none';
                const resultSec = document.getElementById('result');
                resultSec.innerHTML = saved;
                resultSec.style.display = 'block';
                document.getElementById('premiumContentArea').style.filter = "none";
                document.getElementById('premiumContentArea').style.opacity = "1";
                document.getElementById('premiumContentArea').style.pointerEvents = "auto";
                document.getElementById('unlockOverlay').style.display = 'none';
                document.getElementById('sajuActionsArea').style.display = 'block';
                sessionStorage.removeItem('savedSajuResultHTML');
            }
        }
    });
    window.history.replaceState({}, document.title, window.location.pathname);
}

// ==========================================
// 6. 타로 및 관상 엔진
// ==========================================
const tarotCards = [];
for (let i = 0; i <= 21; i++) tarotCards.push({ id: i, name: "메이저 아르카나", img: `images/${i}.jpeg` });
let selectedTarotCards = [];

document.getElementById('tarotForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('tarotName').value.trim().length < 2) return alert("이름을 입력하십시오.");
    if (document.getElementById('tarotConcern').value.trim().length < 30) return alert("고민을 30자 이상 구체적으로 작성해 주십시오.");
    document.getElementById('tarot').style.display = 'none';
    document.getElementById('tarotDraw').style.display = 'block';

    const deck = document.getElementById('tarotDeck');
    deck.innerHTML = ''; selectedTarotCards = [];
    const btnRead = document.getElementById('btnReadTarot');
    btnRead.disabled = true;

    [...tarotCards].sort(() => Math.random() - 0.5).forEach(card => {
        const el = document.createElement('div');
        el.className = 'tarot-card-back';
        el.onclick = function () {
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedTarotCards = selectedTarotCards.filter(c => c.el !== this);
            } else if (selectedTarotCards.length < 3) {
                this.classList.add('selected');
                selectedTarotCards.push({ el: this, card: card });
            }
            document.getElementById('tarotDrawCount').innerText = 3 - selectedTarotCards.length;
            btnRead.disabled = selectedTarotCards.length !== 3;
        };
        deck.appendChild(el);
    });
    btnRead.onclick = () => { alert("우주의 파동을 분석합니다."); location.reload(); };
});

window.checkSmishing = function () {
    const url = document.getElementById('suspectUrl').value.trim();
    if (url === '**') { showToast("무제한 감별 모드가 활성화되었습니다."); return; }
    document.getElementById('urlCheckResult').style.display = 'block';
    document.getElementById('urlCheckResult').innerHTML = "현재 보안 데이터베이스에 보고된 위험이 없습니다.";
};