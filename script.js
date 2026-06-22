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
    e.returnValue = '분석이 진행 중입니다.';
}

// ==========================================
// 2. 핵심 분석 엔진 (최종)
// ==========================================
async function startProfessionalAnalysis(name, gender, displayTypeName, year, month, day, fortuneType, maritalStatus, calendarType) {
    document.getElementById('daily').style.display = 'none';
    const loadingScreen = document.getElementById('analysisLoading');
    loadingScreen.style.display = 'flex';
    document.getElementById('loadingTitle').innerHTML = name + "님의 분석 중입니다.";

    const unknownTimeEl = document.getElementById('unknownTime');
    const isUnknownTime = unknownTimeEl ? unknownTimeEl.checked : false;
    let hour = 12, minute = 0;

    let lunarObj = calendarType === 'solar'
        ? Solar.fromYmdHms(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), hour, minute, 0).getLunar()
        : Lunar.fromYmdHms(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), hour, minute, 0);
    let bazi = lunarObj.getEightChar();

    const promptText = "사주 분석 데이터를 JSON으로 줘. 결과는 반드시 scores(wealth, success, love, health), keyword1, keyword2, keyword3, summary, premium(HTML)을 포함해.";

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        const data = await response.json();
        const resultData = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ''));

        loadingScreen.style.display = 'none';
        renderSajuResult(name, displayTypeName, year, month, day, resultData, fortuneType, bazi, wuXing(bazi), isUnknownTime);
    } catch (e) {
        loadingScreen.style.display = 'none';
        alert("분석 실패");
    }
}

function wuXing(bazi) { return bazi.getYearWuXing() + bazi.getMonthWuXing() + bazi.getDayWuXing(); }

// ==========================================
// 3. 화면 렌더링 (용/나무 배경 + 황금 교지 디자인)
// ==========================================
function renderSajuResult(name, typeName, year, month, day, resultData, fortuneType, bazi, wuXing, isUnknownTime) {
    const resultSec = document.getElementById('result');
    resultSec.style.display = 'block';

    const colorInfo = getPersonalColor(year);
    let bgImageName = 'bg_mystic.png';
    if (colorInfo.element === '목(木)') bgImageName = 'bg_wood.png';
    else if (colorInfo.element === '화(火)') bgImageName = 'bg_fire.png';
    else if (colorInfo.element === '토(土)') bgImageName = 'bg_earth.png';
    else if (colorInfo.element === '금(金)') bgImageName = 'bg_metal.png';
    else if (colorInfo.element === '수(수)') bgImageName = 'bg_water.png';

    resultSec.style.background = "url('images/" + bgImageName + "') center/cover fixed no-repeat #111";
    resultSec.style.minHeight = "100vh";
    resultSec.style.padding = "40px 10px";

    let safeSummary = (resultData.summary || "").replace(/\*\*(.*?)\*\*/g, "<strong style='color:#FFD700;'>$1</strong>");

    document.getElementById('freeContentArea').innerHTML = `
        <div style='background: transparent; padding: 40px 10px; text-align: center;'>
            <div style='font-size: 1.8rem; font-weight: 900; color: #E5C07B; margin-bottom: 10px;'>${resultData.keyword1}</div>
            <div style='font-size: 2.6rem; font-weight: 900; color: #FFD700; margin-bottom: 10px;'>${resultData.keyword2}</div>
            <div style='font-size: 1.8rem; font-weight: 900; color: #E5C07B;'>${resultData.keyword3}</div>
            <p style='color:#fff; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; margin-top:20px;'>${safeSummary}</p>
        </div>
    ` + generateSajuChartsHTML(colorInfo, bazi, wuXing, isUnknownTime);
}

function getPersonalColor(yearStr) {
    const lastDigit = parseInt(yearStr, 10) % 10;
    if (lastDigit === 4 || lastDigit === 5) return { element: '목(木)', highlightHex: '#C5E1A5' };
    if (lastDigit === 6 || lastDigit === 7) return { element: '화(火)', highlightHex: '#FFAB91' };
    if (lastDigit === 8 || lastDigit === 9) return { element: '토(土)', highlightHex: '#FFD54F' };
    if (lastDigit === 0 || lastDigit === 1) return { element: '금(金)', highlightHex: '#FFFFFF' };
    return { element: '수(수)', highlightHex: '#81D4FA' };
}

function generateSajuChartsHTML(colorInfo, bazi, wuXing, isUnknownTime) {
    return `<div style='background:rgba(0,0,0,0.6); padding:20px; border-radius:15px; margin-top:20px;'>
        <h3 style='color:#FFD700; text-align:center;'>[나의 사주 명식]</h3>
        <div style='display:flex; justify-content:space-around; color:#fff;'>
            <div>${bazi.getYearGan()}${bazi.getYearZhi()}</div>
            <div>${bazi.getMonthGan()}${bazi.getMonthZhi()}</div>
            <div>${bazi.getDayGan()}${bazi.getDayZhi()}</div>
        </div>
    </div>`;
}