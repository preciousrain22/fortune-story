// 👇 결제 후 로딩 중 이탈 방지용 자물쇠 함수 👇
function preventExit(e) {
    e.preventDefault();
    e.returnValue = '결제가 완료되어 분석이 진행 중입니다. 페이지를 나가시면 결과를 받을 수 없습니다!';
}
document.addEventListener('DOMContentLoaded', () => {
    // Gateway Path Selection Logic
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

    // Animation Observer
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.fade-in-scroll');
    scrollElements.forEach(el => observer.observe(el));

    // Taste Fortune Form Handler (index.html)
    const tasteForm = document.getElementById('tasteForm');
    const tasteRetryBtn = document.getElementById('tasteRetryBtn');

    if (tasteForm) {
        tasteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('tasteName').value;
            const year = document.getElementById('tasteYear').value;
            const month = document.getElementById('tasteMonth').value;
            const day = document.getElementById('tasteDay').value;

            if (!name || !year || !month || !day) return;

            const messages = [
                `<strong>${name}님</strong>, 오늘 하루는 기대하지 않았던 소소한 기쁨이 찾아올 수 있습니다. 우연히 마주친 사람이 귀인이 될 수 있으니 밝은 미소를 유지하세요.`,
                `<strong>${name}님</strong>, 오늘은 그동안 고민했던 일에 대한 해답의 실마리를 찾게 되는 날입니다. 조금 더 자신감을 가지고 앞으로 나아가셔도 좋습니다.`,
                `<strong>${name}님</strong>, 재물운이 살짝 비치는 하루입니다. 꼭 필요한 곳에 지출은 하되 무리한 투자는 피하고 내실을 다지세요.`,
                `<strong>${name}님</strong>, 오늘은 마음의 안정이 무엇보다 중요한 날입니다. 조급해하지 말고 따뜻한 차 한잔과 함께 평정심을 유지하면 좋은 결과가 따릅니다.`,
                `<strong>${name}님</strong>, 대인관계에서 긍정적인 에너지가 발산되는 날입니다. 주변 사람들에게 먼저 건네는 따뜻한 말 한마디가 큰 행운으로 돌아옵니다.`
            ];

            const hash = name.length + parseInt(year) + parseInt(month) + parseInt(day);
            const msgIndex = hash % messages.length;

            document.getElementById('tasteResultTitle').innerHTML = `${month}월 ${day}일 <span class="highlight">오늘의 기운</span>`;
            document.getElementById('tasteResultText').innerHTML = messages[msgIndex];

            document.getElementById('tasteFormContainer').style.display = 'none';
            document.getElementById('tasteResultContainer').style.display = 'block';
        });
    }

    if (tasteRetryBtn) {
        tasteRetryBtn.addEventListener('click', () => {
            document.getElementById('tasteResultContainer').style.display = 'none';
            document.getElementById('tasteFormContainer').style.display = 'block';
            tasteForm.reset();
        });
    }

    // Manse-ryok Form Handler (main.html)
    const sajuForm = document.getElementById('sajuForm');
    const unknownTimeCheckbox = document.getElementById('unknownTime');
    const birthAmPmSelect = document.getElementById('birthAmPm');
    const birthHourSelect = document.getElementById('birthHour');
    const birthMinuteSelect = document.getElementById('birthMinute');

    const birthYearSelect = document.getElementById('birthYear');
    const birthMonthSelect = document.getElementById('birthMonth');
    const birthDaySelect = document.getElementById('birthDay');

    if (birthYearSelect && birthMonthSelect && birthDaySelect) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}년`;
            birthYearSelect.appendChild(option);
        }
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}월`;
            birthMonthSelect.appendChild(option);
        }
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}일`;
            birthDaySelect.appendChild(option);
        }
    }

    if (birthHourSelect && birthMinuteSelect) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}시`;
            birthHourSelect.appendChild(option);
        }
        for (let i = 0; i <= 59; i++) {
            const option = document.createElement('option');
            const minStr = i.toString().padStart(2, '0');
            option.value = minStr;
            option.textContent = `${minStr}분`;
            birthMinuteSelect.appendChild(option);
        }
    }

    if (unknownTimeCheckbox && birthAmPmSelect && birthHourSelect && birthMinuteSelect) {
        unknownTimeCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                birthAmPmSelect.disabled = true;
                birthHourSelect.disabled = true;
                birthMinuteSelect.disabled = true;
                birthHourSelect.value = '';
                birthMinuteSelect.value = '';
            } else {
                birthAmPmSelect.disabled = false;
                birthHourSelect.disabled = false;
                birthMinuteSelect.disabled = false;
            }
        });
    }

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

    if (sajuForm) {
        sajuForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fortuneType = document.getElementById('fortuneType').value;
            const name = document.getElementById('name').value;
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const maritalStatus = document.querySelector('input[name="maritalStatus"]:checked').value;

            const year = birthYearSelect.value;
            const month = birthMonthSelect.value.padStart(2, '0');
            const day = birthDaySelect.value.padStart(2, '0');

            let birthTime = '';
            const unknownTime = document.getElementById('unknownTime').checked;

            if (!unknownTime) {
                const amPm = birthAmPmSelect.value;
                const hourVal = birthHourSelect.value;
                const minuteVal = birthMinuteSelect.value;

                if (!hourVal || !minuteVal) {
                    alert('태어난 시간을 선택하거나 \'시간 모름\'을 체크해주세요.');
                    return;
                }
                let hour24 = parseInt(hourVal);
                if (amPm === 'PM' && hour24 < 12) hour24 += 12;
                else if (amPm === 'AM' && hour24 === 12) hour24 = 0;
                birthTime = `${hour24.toString().padStart(2, '0')}:${minuteVal}`;
            }

            if (!year || !month || !day) {
                alert('생년월일을 모두 선택해주세요.');
                return;
            }

            const currentPrice = prices[fortuneType];
            const paymentModal = document.getElementById('paymentModal');
            const paymentFortuneType = document.getElementById('paymentFortuneType');
            const paymentAmount = document.getElementById('paymentAmount');
            const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
            const closeModalBtn = document.querySelector('.close-modal');

            let displayTypeName = "";
            switch (fortuneType) {
                case 'daily': displayTypeName = "오늘의 운세"; break;
                case 'weekly': displayTypeName = "주간 운세"; break;
                case 'yearly': displayTypeName = "1년 운세"; break;
                case 'love': displayTypeName = "연애운"; break;
                case 'exam': displayTypeName = "수능 운세"; break;
            }

            paymentFortuneType.textContent = displayTypeName;
            paymentAmount.textContent = currentPrice.toLocaleString() + "원";
            paymentModal.style.display = 'flex';

            closeModalBtn.onclick = () => paymentModal.style.display = 'none';

            confirmPaymentBtn.onclick = () => {
                confirmPaymentBtn.textContent = "결제 승인 중...";
                confirmPaymentBtn.disabled = true;

                setTimeout(() => {
                    paymentModal.style.display = 'none';
                    confirmPaymentBtn.textContent = "결제하기";
                    confirmPaymentBtn.disabled = false;
                    startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus);
                }, 1500);
            };
        });
    }

    // Tarot Section
    let tarotState = { name: '', category: '', concern: '', selectedCards: [], maxCards: 3 };
    const tarotForm = document.getElementById('tarotForm');

    if (tarotForm) {
        tarotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            tarotState.name = document.getElementById('tarotName').value;
            tarotState.category = document.getElementById('tarotCategory').value;
            tarotState.concern = document.getElementById('tarotConcern').value;

            if (!tarotState.name || !tarotState.concern) {
                alert('이름과 고민 내용을 모두 입력해주세요.');
                return;
            }

            if (tarotState.concern.length < 30) {
                alert('더 정확한 타로 리딩을 위해 고민을 30자 이상 구체적으로 적어주세요.');
                return;
            }

            document.getElementById('tarot').style.display = 'none';
            initTarotDraw();
        });
    }

    function initTarotDraw() {
        const tarotDraw = document.getElementById('tarotDraw');
        const deckContainer = document.getElementById('tarotDeck');
        const btnReadTarot = document.getElementById('btnReadTarot');
        const countDisplay = document.getElementById('tarotDrawCount');

        tarotState.selectedCards = [];
        btnReadTarot.disabled = true;
        btnReadTarot.classList.add('disable-btn');
        btnReadTarot.classList.remove('pulse-btn');
        countDisplay.textContent = '3';
        deckContainer.innerHTML = '';

        tarotDraw.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        for (let i = 0; i < 78; i++) {
            const card = document.createElement('div');
            card.classList.add('tarot-card-back');
            card.dataset.index = i;

            card.addEventListener('click', () => {
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    tarotState.selectedCards = tarotState.selectedCards.filter(idx => idx !== i);
                } else {
                    if (tarotState.selectedCards.length < tarotState.maxCards) {
                        card.classList.add('selected');
                        tarotState.selectedCards.push(i);
                    }
                }

                const remaining = tarotState.maxCards - tarotState.selectedCards.length;
                countDisplay.textContent = remaining;

                if (remaining === 0) {
                    document.querySelectorAll('.tarot-card-back:not(.selected)').forEach(c => c.classList.add('disabled'));
                    btnReadTarot.disabled = false;
                    btnReadTarot.classList.remove('disable-btn');
                    btnReadTarot.classList.add('pulse-btn');
                } else {
                    document.querySelectorAll('.tarot-card-back.disabled').forEach(c => c.classList.remove('disabled'));
                    btnReadTarot.disabled = true;
                    btnReadTarot.classList.add('disable-btn');
                    btnReadTarot.classList.remove('pulse-btn');
                }
            });
            deckContainer.appendChild(card);
        }

        btnReadTarot.onclick = () => openTarotPayment();
    }

    function openTarotPayment() {
        const paymentModal = document.getElementById('paymentModal');
        const paymentFortuneType = document.getElementById('paymentFortuneType');
        const paymentAmount = document.getElementById('paymentAmount');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const closeModalBtn = document.querySelector('.close-modal');

        paymentFortuneType.textContent = "타로 파빌리온 - 심층 상담";
        paymentAmount.textContent = "4,900원";
        paymentModal.style.display = 'flex';

        closeModalBtn.onclick = () => paymentModal.style.display = 'none';

        confirmPaymentBtn.onclick = () => {
            confirmPaymentBtn.textContent = "우주의 주파수 연결 중...";
            confirmPaymentBtn.disabled = true;

            setTimeout(() => {
                paymentModal.style.display = 'none';
                confirmPaymentBtn.textContent = "결제하기";
                confirmPaymentBtn.disabled = false;
                document.getElementById('tarotDraw').style.display = 'none';
                startTarotAnalysis();
            }, 1500);
        };
    }

    function startTarotAnalysis() {
        const loadingScreen = document.getElementById('tarotLoading');
        const loadingTitle = document.getElementById('tarotLoadingTitle');
        const loadingMessage = document.getElementById('tarotLoadingMessage');

        // 🔒 [추가] 브라우저 이탈(새로고침/뒤로가기) 방지 잠금!
        window.addEventListener('beforeunload', preventExit);

        document.body.style.overflow = 'hidden';
        if (loadingScreen) loadingScreen.style.display = 'flex';

        if (loadingTitle) {
            loadingTitle.innerHTML = `<span style="color: #D4AF37;">'${tarotState.name}'</span>님의 영혼의 궤적을 탐색하는 중...`;
        }

        const messages = [
            `흩어진 무의식의 조각들을 모으고 있습니다...`,
            `선택하신 카드에 깃든 영적 메시지를 해독하는 중입니다...`,
            `과거의 잔영과 다가올 미래의 실마리를 엮고 있습니다...`,
            `우주의 주파수에서 당신을 위한 지혜를 수신하는 중입니다...`,
            `운명의 베일이 걷히고, 명쾌한 해답이 드러납니다...`
        ];

        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            if (msgIndex < messages.length) {
                if (loadingMessage) loadingMessage.innerText = messages[msgIndex];
                msgIndex++;
            }
        }, 1200);

        fetchTarotResult().then(result => {
            clearInterval(msgInterval);
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';

            // 🔓 [추가] 분석 완료! 잠금 해제
            window.removeEventListener('beforeunload', preventExit);

            showTarotResult(result);
        }).catch(err => {
            clearInterval(msgInterval);
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';

            // 🔓 [추가] 에러 발생! 잠금 해제
            window.removeEventListener('beforeunload', preventExit);

            alert("타로 리딩 중 오류가 발생했습니다: " + err.message);
        });
    }

    async function fetchTarotResult() {
        const baseUrl = "./images/";
        const fullTarotDeck = [
            { id: 0, name: "바보 (The Fool)", keyword: "새로운 시작, 자유, 무한한 잠재력", isMajor: true },
            { id: 1, name: "마법사 (The Magician)", keyword: "창조력, 기술, 의지, 실천력", isMajor: true },
            { id: 2, name: "여사제 (The High Priestess)", keyword: "직관, 신비, 잠재의식", isMajor: true },
            { id: 3, name: "여황제 (The Empress)", keyword: "풍요, 모성, 아름다움", isMajor: true },
            { id: 4, name: "황제 (The Emperor)", keyword: "권위, 구조, 안정, 지배", isMajor: true },
            { id: 5, name: "교황 (The Hierophant)", keyword: "전통, 교육, 신념, 소속감", isMajor: true },
            { id: 6, name: "연인 (The Lovers)", keyword: "사랑, 조화, 선택, 결합", isMajor: true },
            { id: 7, name: "전차 (The Chariot)", keyword: "의지, 승리, 통제, 전진", isMajor: true },
            { id: 8, name: "힘 (Strength)", keyword: "용기, 인내, 내면의 힘, 자비", isMajor: true },
            { id: 9, name: "은둔자 (The Hermit)", keyword: "내면 탐구, 지혜, 고독", isMajor: true },
            { id: 10, name: "운명의 수레바퀴 (Wheel of Fortune)", keyword: "전환점, 운명, 변화", isMajor: true },
            { id: 11, name: "정의 (Justice)", keyword: "공정, 진실, 인과응보", isMajor: true },
            { id: 12, name: "매달린 사람 (The Hanged Man)", keyword: "희생, 새로운 관점, 통찰력", isMajor: true },
            { id: 13, name: "죽음 (Death)", keyword: "끝과 시작, 변형, 정화", isMajor: true },
            { id: 14, name: "절제 (Temperance)", keyword: "균형, 중용, 조율", isMajor: true },
            { id: 15, name: "악마 (The Devil)", keyword: "유혹, 속박, 물질주의", isMajor: true },
            { id: 16, name: "탑 (The Tower)", keyword: "파괴, 혼란, 예상치 못한 변화", isMajor: true },
            { id: 17, name: "별 (The Star)", keyword: "희망, 영감, 평온, 긍정", isMajor: true },
            { id: 18, name: "달 (The Moon)", keyword: "불안, 무의식, 두려움", isMajor: true },
            { id: 19, name: "태양 (The Sun)", keyword: "성공, 기쁨, 활력, 명확성", isMajor: true },
            { id: 20, name: "심판 (Judgement)", keyword: "부활, 평가, 각성", isMajor: true },
            { id: 21, name: "세계 (The World)", keyword: "완성, 성취, 새로운 차원", isMajor: true },
            { id: 22, name: "지팡이 Ace", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 23, name: "지팡이 2", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 24, name: "지팡이 3", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 25, name: "지팡이 4", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 26, name: "지팡이 5", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 27, name: "지팡이 6", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 28, name: "지팡이 7", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 29, name: "지팡이 8", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 30, name: "지팡이 9", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 31, name: "지팡이 10", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 32, name: "지팡이 Page", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 33, name: "지팡이 Knight", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 34, name: "지팡이 Queen", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 35, name: "지팡이 King", keyword: "열정, 야망, 에너지", isMajor: false },
            { id: 36, name: "컵 Ace", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 37, name: "컵 2", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 38, name: "컵 3", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 39, name: "컵 4", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 40, name: "컵 5", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 41, name: "컵 6", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 42, name: "컵 7", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 43, name: "컵 8", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 44, name: "컵 9", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 45, name: "컵 10", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 46, name: "컵 Page", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 47, name: "컵 Knight", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 48, name: "컵 Queen", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 49, name: "컵 King", keyword: "감정, 관계, 직관", isMajor: false },
            { id: 50, name: "검 Ace", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 51, name: "검 2", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 52, name: "검 3", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 53, name: "검 4", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 54, name: "검 5", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 55, name: "검 6", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 56, name: "검 7", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 57, name: "검 8", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 58, name: "검 9", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 59, name: "검 10", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 60, name: "검 Page", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 61, name: "검 Knight", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 62, name: "검 Queen", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 63, name: "검 King", keyword: "이성, 도전, 갈등", isMajor: false },
            { id: 64, name: "펜타클 Ace", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 65, name: "펜타클 2", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 66, name: "펜타클 3", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 67, name: "펜타클 4", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 68, name: "펜타클 5", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 69, name: "펜타클 6", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 70, name: "펜타클 7", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 71, name: "펜타클 8", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 72, name: "펜타클 9", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 73, name: "펜타클 10", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 74, name: "펜타클 Page", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 75, name: "펜타클 Knight", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 76, name: "펜타클 Queen", keyword: "물질, 안정, 결과", isMajor: false },
            { id: 77, name: "펜타클 King", keyword: "물질, 안정, 결과", isMajor: false }
        ];

        fullTarotDeck.forEach((card, index) => {
            card.imageUrl = baseUrl + index + ".jpeg";
        });

        const shuffled = fullTarotDeck.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(card => {
            const isReversed = Math.random() < 0.2;
            return { ...card, orientation: isReversed ? "역방향" : "정방향" };
        });

        return await fetchFromGemini(selected);
    }

    async function fetchFromGemini(selectedCards) {
        const url = '/api/gemini';
        let promptText = `당신은 20년 경력의 신비롭고 통찰력 있는 수석 타로 마스터입니다. 다음 사용자의 고민과 뽑은 3장의 카드를 바탕으로 깊이 있고 감동적인 타로 리딩을 해주세요.\n`;
        promptText += `서양의 신비로운 분위기를 살려 우아한 문어체(~입니다, ~군요, ~의 카드가 속삭입니다)를 사용하세요.\n\n`;
        promptText += `[사용자 이름]: ${tarotState.name}\n`;
        promptText += `[고민 주제]: ${tarotState.category}\n`;
        promptText += `[고민 세부내용]: ${tarotState.concern}\n\n`;
        promptText += `[뽑은 카드 3장 (순서대로 과거/원인, 현재/상황, 미래/결과)]\n`;

        selectedCards.forEach((card, index) => {
            const pos = index === 0 ? "과거" : index === 1 ? "현재" : "미래";
            promptText += `${index + 1}. [${pos}] ${card.name} (${card.orientation}) - 핵심 상징: ${card.keyword}\n`;
        });

        promptText += `\n아래의 JSON 형식과 동일하게 답변을 작성해서 반환해주세요. HTML 태그를 포함하여 바로 출력할 수 있도록 해주세요. (Markdown 백틱 기호는 제외할 것):\n`;
        promptText += `{ "past": "해석내용 HTML...", "present": "해석내용 HTML...", "future": "해석내용 HTML...", "advice": "최종 조언 HTML..." }`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) throw new Error("API 요청 실패");

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            const parsed = JSON.parse(generatedText);

            return {
                cards: selectedCards,
                interpretations: [parsed.past, parsed.present, parsed.future],
                advice: parsed.advice
            };
        } catch (e) {
            console.warn("Gemini API 실패, 기본 텍스트로 대체합니다.", e);
            return mockTarotResult(selectedCards);
        }
    }

    function mockTarotResult(selectedCards) {
        const interpretations = selectedCards.map((card, index) => {
            if (index === 0) return `이 상황의 뿌리에는 <strong>'${card.name}' (${card.orientation})</strong> 카드의 기운이 짙게 깔려 있습니다. ${card.keyword.split(',')[0]}의 에너지가 무의식을 지배하며 이러한 흐름을 만들었습니다.`;
            if (index === 1) return `당신이 직면한 핵심 상황을 <strong>'${card.name}' (${card.orientation})</strong> 카드가 대변하고 있습니다. 지금 가장 필요한 것은 ${card.keyword.split(',')[1] || card.keyword.split(',')[0]}의 태도이며, 직관을 따르셔야 합니다.`;
            return `가까운 미래에는 <strong>'${card.name}' (${card.orientation})</strong> 카드의 결론에 이릅니다. 핵심 키워드인 [${card.keyword}]의 에너지가 기다리고 있습니다. 두려워하지 말고 운명의 파도에 올라타십시오.`;
        });
        return {
            cards: selectedCards,
            interpretations: interpretations,
            advice: "거짓된 환상을 깨고 진실을 마주할 용기를 가지십시오. 우주는 언제나 당신에게 가장 필요한 형태의 시련과 행운을 동시에 줍니다. 내면의 소리에 집중하세요."
        };
    }

    function showTarotResult(resultData) {
        document.querySelector('.header').style.display = 'none';
        const resultSection = document.getElementById('tarotResult');
        resultSection.style.display = 'block';

        document.getElementById('tarotResultSub').textContent = `'${tarotState.name}'님, 우주의 부름에 응답한 3장의 카드입니다.`;
        const positions = ["과거 (원인)", "현재 (상황)", "미래 (결과)"];
        const revealContainer = document.querySelector('.tarot-cards-reveal');
        revealContainer.innerHTML = '';

        let interpretationHTML = `<h3 style="color: #EEDCFF; margin-bottom: 2rem; text-align: center;">영혼의 메시지 해석</h3>`;
        interpretationHTML += `<p style="margin-bottom: 2rem;"><strong>[질문 요약]</strong> ${tarotState.concern}</p>`;

        resultData.cards.forEach((card, index) => {
            const isReversed = card.orientation === '역방향';
            const rotationClass = isReversed ? 'rotate-180' : '';
            const col = document.createElement('div');
            col.classList.add('revealed-card-col');
            col.innerHTML = `
                <div class="revealed-card-pos">${positions[index]}</div>
                <div class="revealed-card-image fade-in" style="animation-delay: ${index * 0.4}s">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="font-weight: bold; color: #FFE082;">${index === 0 ? 'Ⅰ' : index === 1 ? 'Ⅱ' : 'Ⅲ'}</span>
                    </div>
                    <div style="position: relative; perspective: 1000px; display: inline-block;">
                        <img class="${rotationClass}" src="${card.imageUrl}" alt="${card.name}" onerror="this.onerror=null; this.style.opacity='0.2';" style="width: 180px; height: 300px; border-radius: 12px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 2px solid rgba(211, 184, 248, 0.4); transition: transform 0.3s;" />
                        ${isReversed ? `<div style="position: absolute; top: -15px; right: -15px; background: rgba(239, 68, 68, 0.8); color: white; border-radius: 20px; padding: 5px 10px; font-size: 0.8rem; border: 1px solid #ef4444;">역방향</div>` : ''}
                    </div>
                    <div class="revealed-card-name" style="margin-top: 20px;">${card.name}</div>
                    <div style="font-size: 0.8rem; margin-top: 10px; opacity: 0.8;">${card.keyword}</div>
                </div>
            `;
            revealContainer.appendChild(col);

            interpretationHTML += `
                <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(179, 136, 235, 0.2);">
                    <h4 style="color: #FFE082; margin-bottom: 10px;">[${positions[index]}] ${card.name} (${card.orientation})</h4>
                    <p>${resultData.interpretations[index]}</p>
                </div>
            `;
        });

        interpretationHTML += `
            <div style="background: rgba(155, 89, 182, 0.1); padding: 2rem; border-radius: 12px; border: 1px solid rgba(179, 136, 235, 0.3);">
                <h4 style="color: #D3B8F8; text-align: center; margin-bottom: 1rem;">마스터의 최종 조언 (Grand Advice)</h4>
                <p style="text-align: center; line-height: 1.8; color: #EEDCFF;">${resultData.advice}</p>
            </div>
            <div style="margin-top: 3rem; text-align: center; border-top: 1px solid rgba(179, 136, 235, 0.2); padding-top: 2rem;">
                <p style="color: #D3B8F8; margin-bottom: 1.5rem; font-size: 1.1rem;">이 타로 리딩 결과를 소장하시겠습니까?</p>
                <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
                    <button class="btn-premium kakao" id="shareTarotKakaoBtn" style="font-size: 1.05rem; width: 100%; border-radius: 50px;">💬 카카오톡 공유</button>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1;" onclick="window.print()">📄 PDF로 저장</button>
                        <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3); flex: 1;" onclick="location.reload()">🔄 다른 타로 보기</button>
                    </div>
                </div>
            </div>
        `;

        sessionStorage.setItem('savedTarotResult', interpretationHTML);
        document.getElementById('tarotResultContent').innerHTML = interpretationHTML;
        window.scrollTo(0, 0);

        const shareTarotKakaoBtn = document.getElementById('shareTarotKakaoBtn');
        if (shareTarotKakaoBtn && typeof Kakao !== 'undefined') {
            shareTarotKakaoBtn.onclick = () => {
                if (!Kakao.isInitialized()) {
                    Kakao.init('a5c28b4d706bced99d7282a87113ec82');
                }
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: '포춘 스토리 (Fortune Story) - 타로 리딩',
                        description: `'${tarotState.name}'님의 타로 리딩 결과가 도착했습니다. 우주의 조언을 확인해보세요.`,
                        imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                        link: {
                            mobileWebUrl: 'https://fortune-story.com',
                            webUrl: 'https://fortune-story.com',
                        },
                    },
                    buttons: [
                        {
                            title: '내 타로 결과 확인하기',
                            link: {
                                mobileWebUrl: 'https://fortune-story.com',
                                webUrl: 'https://fortune-story.com',
                            },
                        },
                    ],
                });
            };
        }
    }

    function startProfessionalAnalysis(name, typeName, year, month, day, fortuneType, maritalStatus) {
        const loadingScreen = document.getElementById('analysisLoading');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingMessage = document.getElementById('loadingMessage');

        // 🔒 [추가] 브라우저 이탈(새로고침/뒤로가기) 방지 잠금!
        window.addEventListener('beforeunload', preventExit);

        document.body.style.overflow = 'hidden';
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (loadingTitle) loadingTitle.innerHTML = `'${name}'님의 <span class="obangsaek-text">${typeName}</span> 분석 진행 중...`;

        const messages = [
            `${name}님의 생년월일시를 바탕으로 사주 명식을 도출하고 있습니다...`,
            `선택하신 '${typeName}'에 맞추어 맞춤형 풀이를 진행 중입니다...`,
            `'${name}'님의 대운과 세운의 흐름을 정밀 파악하고 있습니다...`,
            "천간과 지지의 상생상극을 통해 음양오행의 조화를 계산 중입니다...",
            `'${typeName}'의 관점에서 ${name}님에게 필요한 개운법을 찾는 중입니다...`,
            "거의 완료되었습니다. 정밀 운세 보고서를 생성합니다..."
        ];

        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            if (msgIndex < messages.length) {
                if (loadingMessage) loadingMessage.innerText = messages[msgIndex];
                msgIndex++;
            }
        }, 1200);

        getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus)
            .then(aiResultHTML => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';

                // 🔓 [추가] 분석 완료! 잠금 해제
                window.removeEventListener('beforeunload', preventExit);

                showFinalResult(name, typeName, year, month, day, aiResultHTML);
            })
            .catch(err => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';

                // 🔓 [추가] 에러 발생! 잠금 해제
                window.removeEventListener('beforeunload', preventExit);

                alert("현재 분석중 서버에 일시적인 트래픽이 몰려 접속이 지연되고 있습니다.\n고객님의 결제는 안전하게 취소(또는 보류)되었으니, 잠시 후 다시 시도해주세요.");
            });
    }

    async function getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus) {
        const url = `/api/gemini`;
        let specificInstructions = "";
        if (fortuneType === 'yearly') {
            specificInstructions = "1년 전체의 흐름을 분석하는 것이므로, 반드시 1월부터 12월까지 각 월별 운세 흐름을 한 문단씩 아주 길고 상세하게 풀어쓰세요.";
        } else if (fortuneType === 'daily') {
            specificInstructions = "오늘 하루의 운세이므로, 아침(태동), 점심(절정), 저녁(갈무리) 시간대별 기운의 변화와 구체적인 행동 지침을 아주 길고 상세하게 작성하세요.";
        } else if (fortuneType === 'weekly') {
            specificInstructions = "일주일간의 운세이므로, 월요일부터 일요일까지 요일별 기운의 흐름과 일진을 아주 길게 풀어쓰세요.";
        } else if (fortuneType === 'love') {
            const mStatus = maritalStatus === 'married' ? '기혼' : '미혼';
            specificInstructions = `현재 고객은 ${mStatus} 상태입니다. 이에 맞추어 현재의 애정 전선, 인연의 작용을 심리학적, 명리학적으로 매우 깊이 있게 분석하세요.`;
        } else if (fortuneType === 'exam') {
            specificInstructions = "시험/학업 운세이므로, 문창귀인 등의 학업 관련 기운 분석, 집중력 상태, 슬럼프 극복 멘탈 관리법을 매우 길고 상세하게 작성하세요.";
        } else {
            specificInstructions = "고객의 전반적인 삶의 궤적과 운기의 흐름을 방대한 분량으로 심도 있게 분석하세요.";
        }

        const systemPrompt = `당신은 상위 0.1% VIP를 전담하는 대한민국 최고 수준의 명리학자입니다.
[🔥 핵심 작성 규칙 🔥]
1. 서론/인사말 절대 금지 (가장 중요): "존경하는 ~님", "30년 명리학의 통찰로", "경험을 토대로", "살펴보겠습니다" 같은 본인 소개나 뻔한 인사말은 절대 쓰지 마세요. 첫 문장부터 군더더기 없이 곧바로 사주 원국에 대한 분석 본론으로 시작하세요.
2. 분량 강제 (절대 엄수): 각 섹션마다 최소 1500자 이상 아주 방대하고 깊이 있게 작성하세요.
3. 호칭 (매우 중요): 무조건 '${name}님'이라고 부르세요. ('선생님', '당신' 등 절대 금지)
4. 용어 풀이: 명리학 용어는 무조건 '한자(한글)' 표기법을 지키세요.
5. 문체: 희망적이면서 통찰력 있는 전문가의 문어체를 사용하세요.

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

    function showFinalResult(name, typeName, year, month, day, aiResult) {
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.star-bg-fixed').style.display = 'none';
        document.getElementById('daily').style.display = 'none';

        const resultSection = document.getElementById('result');
        const resultContent = document.getElementById('resultContent');
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
            { hanja: '秀 越', title: '수월(秀越)', desc: '남달리 빼어나고 훌륭하다는 의미를 가집니다.' },
            { hanja: '氣 槪', title: '기개(氣槪)', desc: '굽히지 않고 꿋꿋하게 뻗어나가는 힘을 의미합니다.' },
            { hanja: '溫 和', title: '온화(溫和)', desc: '따뜻하고 부드러운 봄볕 같은 성품을 의미합니다.' },
            { hanja: '明 哲', title: '명철(明哲)', desc: '사리를 밝게 분별하는 지혜로움을 의미합니다.' },
            { hanja: '鎭 重', title: '진중(鎭重)', desc: '태도가 점잖고 무게가 있음을 의미합니다.' }
        ];
        const keyword = keywords[hash % keywords.length];

        let finalHTML = "";
        if (typeof aiResult === 'string') {
            finalHTML = aiResult;
        } else {
            for (let i = 1; i <= 5; i++) {
                if (aiResult[`title${i}`] && aiResult[`content${i}`]) {
                    let formattedContent = aiResult[`content${i}`].split(/\n|\\n/).filter(p => p.trim() !== '').map(p => {
                        let text = p.replace(/\[|\]|\*/g, '').trim();
                        let splitChar = text.includes(':') ? ':' : (text.includes(' - ') ? ' - ' : null);
                        if (splitChar) {
                            let colonIndex = text.indexOf(splitChar);
                            if (colonIndex > 0 && colonIndex < 25) {
                                let subTitle = text.substring(0, colonIndex).trim();
                                let subContent = text.substring(colonIndex + splitChar.length).trim();
                                if (subContent.length > 0) {
                                    return `<div style="margin-top: 2.5rem; margin-bottom: 1rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${personalColorInfo.highlightHex}; border-left: 3px solid ${personalColorInfo.highlightHex}; padding-left: 10px;">${subTitle}</span></div><p style="color: #FDFBF7; font-size: 1.05rem; line-height: 2.0; margin-bottom: 1.2rem; text-align: justify; word-break: keep-all;">${subContent}</p>`;
                                }
                            }
                        }
                        return `<p style="color: #FDFBF7; font-size: 1.05rem; line-height: 2.0; margin-bottom: 1.5rem; text-align: justify; word-break: keep-all;">${text}</p>`;
                    }).join('');

                    finalHTML += `
                        <div style="margin-top: 3.5rem; margin-bottom: 1rem;">
                            <h3 style="text-align: center; color: ${personalColorInfo.highlightHex}; font-size: 1.3rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 15px;">
                                ${aiResult[`title${i}`].replace(/\[|\]/g, '')}
                            </h3>
                            ${formattedContent}
                        </div>
                    `;

                    if (i === 1) {
                        finalHTML += `
                            <div style="text-align: center; margin-top: 4rem; margin-bottom: 3rem; padding: 2.5rem 1.5rem; border: 1px solid ${personalColorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15);">
                                <div style="font-size: 1.15rem; color: ${personalColorInfo.textHex}; margin-bottom: 1.5rem; font-weight: bold;">타고난 핵심 기운</div>
                                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">${keyword.hanja}</span>
                                </div>
                                <div style="font-size: 1.05rem; color: ${personalColorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                                    <strong style="font-size: 1.15rem;">${keyword.title}</strong> : ${keyword.desc}
                                </div>
                            </div>
                            ${generateSajuChartsHTML(personalColorInfo, hash)}
                        `;
                    }
                }
            }
        }

        sessionStorage.setItem('savedSajuTitle', document.getElementById('resultTitle').innerHTML);
        sessionStorage.setItem('savedSajuResult', finalHTML);

        resultContent.innerHTML = finalHTML;
        window.scrollTo(0, 0);

        document.getElementById('savePdfBtn').onclick = () => window.print();
    }

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

    function generateLongContent(name, typeName, year, month, day, fortuneType, maritalStatus, colorInfo) {
        const hashString = name + year + month + day;
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
        hash = Math.abs(hash);

        const cHex = colorInfo.highlightHex;
        let html = `
            <h3 style="text-align: center;"><span style="font-size: 1.1em; color: ${cHex}; display: block; margin-bottom: 5px;">천명(天命)</span> 타고난 그릇과 기질</h3>
            <p>${name}님은 ${year}년 ${month}월 ${day}일, 하늘과 땅의 기운이 교차하는 아름다운 시기에 태어나셨습니다. 외유내강(外柔內剛)의 본성을 지니셨습니다.</p>
            ${generateSajuChartsHTML(colorInfo, hash)}
        `;

        if (fortuneType === 'love') html += generateLoveContent(maritalStatus, cHex);
        else if (fortuneType === 'exam') html += generateExamContent(cHex);
        else if (fortuneType === 'daily') html += generateDailyContent(name, maritalStatus, cHex, colorInfo, hash);
        else html += generateGeneralContent(fortuneType, maritalStatus, cHex);

        if (fortuneType !== 'daily') {
            html += `<br><h4>절기(節氣)로 보는 열두 달의 흐름</h4>`;
            for (let i = 1; i <= 12; i++) html += `<p><strong>${i}월:</strong> ${getMonthlyText(i)}</p>`;
        }

        html += `
            <br>
            <h3 style="text-align: center;"><span style="font-size: 1.1em; color: ${cHex}; display: block; margin-bottom: 5px;">비책(秘策)</span> 운을 틔우는 지혜</h3>
            <p>항상 마음의 여유를 가지시고 다가오는 운의 흐름을 자연스럽게 받아들이십시오.</p>
        `;
        return html;
    }

    function generateDailyContent(name, maritalStatus, cHex, colorInfo, hash) {
        const todayStr = new Date().toLocaleDateString();
        const intro = `오늘은 맑은 기운이 만물을 깨우는 형상으로, 중요한 결정을 내리기에 참으로 적합한 하루입니다.`;

        return `
            <div style="text-align: center; margin-bottom: 3rem;">
                <span style="display:inline-block; padding: 6px 20px; border-radius: 30px; background-color: rgba(0,0,0,0.3); border: 1px solid ${colorInfo.borderRgba}; color: ${colorInfo.textHex}; font-weight: bold; font-size: 1.1em;">${todayStr} 일진(日辰)</span>
            </div>
            
            <p style="margin-bottom: 3.5rem; line-height: 2.0; word-break: keep-all;">${name}님의 사주 명식과 오늘 하루의 기운이 빚어내는 흐름입니다. ${intro}</p>
            
            <h4 style="text-align: center; margin-top: 4rem; margin-bottom: 2.5rem;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 8px;">시간대별 운의 흐름</span></h4>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">아침 (06:00 ~ 11:30) - 여명(黎明)의 태동</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">머릿속이 맑아지고 새로운 아이디어가 샘솟는 기분 좋은 아침입니다.</p>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">점심 (11:30 ~ 15:00) - 중천(中天)의 태양</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">기운이 절정에 달하며 역동적으로 움직이는 시간대입니다.</p>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">오후 (15:00 ~ 19:00) - 황혼(黃昏)의 갈무리</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">안정을 찾아가는 시간입니다. 꼼꼼하게 점검하는 작업에 집중해야 할 때입니다.</p>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">저녁 심야 (19:00 ~ ) - 심연(深淵)의 휴식</span></div>
            <p style="margin-bottom: 4.5rem; line-height: 2.0; word-break: keep-all;">온전한 나만의 내면으로 침잠해야 하는 지극히 개인적인 시간입니다.</p>
            
            <h4 style="text-align: center; margin-bottom: 2.5rem;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 8px;">영역별 세부 운세</span></h4>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">재물운</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">금전의 흐름이 반가운 날입니다. 작게라도 긍정적인 수확이 있습니다.</p>
            
            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">인간관계운</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">대인관계에서 긍정적인 에너지가 발산되는 날입니다.</p>

            <div style="margin-bottom: 1.2rem;"><span style="font-size: 1.15rem; font-weight: bold; color: ${colorInfo.highlightHex}; border-left: 3px solid ${colorInfo.highlightHex}; padding-left: 10px;">직업/사업운</span></div>
            <p style="margin-bottom: 3rem; line-height: 2.0; word-break: keep-all;">그동안 갈고닦아온 내실이 빛을 발하는 쾌조의 타이밍입니다.</p>
            
            <div style="text-align: center; margin-top: 4rem; padding: 2.5rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.5rem; font-weight: bold;">오늘의 행운 포인트</div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 2.0;">
                    <strong style="color: ${colorInfo.textHex};">유리한 방향:</strong> 남쪽<br>
                    <strong style="color: ${colorInfo.textHex};">행운의 컬러:</strong> <strong style="color: #fff;">${colorInfo.colorName} 계열</strong>
                </div>
            </div>
        `;
    }

    function generateGeneralContent(type, maritalStatus, cHex) {
        return `
        <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px;">재물운</span> 풍요로운 대지의 기운</h4>
        <p>재물의 기운은 깊은 산속에서 시작된 작은 샘물이 모여 거대한 강줄기를 이루어 나가는 역동적인 형상과 같습니다.</p>
        <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px;">직업/사업운</span> 거침없는 바람</h4>
        <p>새로운 도약과 기회의 문이 열릴 상서로운 징조가 여러 곳에서 엿보입니다.</p>
        `;
    }

    function generateLoveContent(maritalStatus, cHex) {
        return `
        <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px;">애정 기운</span> 달빛 아래 피어나는 난초</h4>
        <p>애정 기운은 깊은 밤, 고요한 달빛 아래 맑은 향기를 내뿜는 아름다운 난초와 같습니다.</p>
        `;
    }

    function generateExamContent(cHex) {
        return `
        <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px;">학업 기운</span> 땅속에서 자라나는 씨앗</h4>
        <p>문창귀인의 이로운 기운이 머물고 있으니, 학업 운세는 굳센 씨앗과 다름없습니다.</p>
        `;
    }

    function getMonthlyText(month) {
        const texts = [
            "얼어붙은 대지에 봄비가 내리듯, 웅크렸던 뜻을 서서히 펼치기 참으로 좋은 시기라 할 수 있습니다.",
            "새잎이 돋아나듯 새로운 기운이 솟아오릅니다.",
            "따스한 봄볕에 만물이 생동합니다.",
            "지혜가 무엇보다 필요한 달입니다.",
            "가내의 평안을 먼저 보살피면 바깥의 일도 물 흐르듯 순조롭게 풀립니다.",
            "막혔던 일들이 시원하게 뚫릴 상서로운 조짐입니다.",
            "여름날의 뜨거운 태양처럼 매사에 열정적으로 임하십시오.",
            "한여름 짙은 녹음 밑 휴식처럼 쉼표가 절실히 필요합니다.",
            "황금빛 풍요로운 들녘처럼 열매로 맺히기 시작하는 달입니다.",
            "다가올 추운 겨울을 대비해 든든하게 내실을 다져야 합니다.",
            "묵묵히 본분의 자리를 지키면 마침내 온전한 인정을 받게 됩니다.",
            "묵은 감정과 아쉬움을 털어내고 평안하고 따뜻한 마음으로 매듭을 지을 때입니다."
        ];
        return texts[month - 1];
    }

    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        }

        const shareKakaoBtn = document.getElementById('shareKakaoBtn');
        if (shareKakaoBtn) {
            shareKakaoBtn.onclick = () => {
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: '포춘 스토리 (Fortune Story)',
                        description: '상위 0.1%를 위한 프리미엄 사주 및 타로 분석 결과를 확인해보세요.',
                        imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                        link: {
                            mobileWebUrl: 'https://fortune-story.com',
                            webUrl: 'https://fortune-story.com',
                        },
                    },
                    buttons: [
                        {
                            title: '내 운세 확인하기',
                            link: {
                                mobileWebUrl: 'https://fortune-story.com',
                                webUrl: 'https://fortune-story.com',
                            },
                        },
                    ],
                });
            };
        }
    }

    window.restoreResult = function (type) {
        if (type === 'saju') {
            const savedHTML = sessionStorage.getItem('savedSajuResult');
            const savedTitle = sessionStorage.getItem('savedSajuTitle');
            if (savedHTML) {
                document.getElementById('daily').style.display = 'none';
                document.getElementById('gateway').style.display = 'none';
                document.querySelector('.header').style.display = 'none';
                document.querySelector('.star-bg-fixed').style.display = 'none';
                document.getElementById('resultTitle').innerHTML = savedTitle;
                document.getElementById('resultContent').innerHTML = savedHTML;
                document.getElementById('result').style.display = 'block';
                window.scrollTo(0, 0);
            }
        } else if (type === 'tarot') {
            const savedHTML = sessionStorage.getItem('savedTarotResult');
            if (savedHTML) {
                document.getElementById('tarot').style.display = 'none';
                document.getElementById('gateway').style.display = 'none';
                document.querySelector('.header').style.display = 'none';
                document.getElementById('tarotResultContent').innerHTML = savedHTML;
                document.getElementById('tarotResult').style.display = 'block';
                window.scrollTo(0, 0);
            }
        }
    };
});

// ==========================================
// 카카오 간편 로그인 로직
// ==========================================
window.loginWithKakao = function () {
    if (!Kakao.isInitialized()) {
        Kakao.init('a5c28b4d706bced99d7282a87113ec82'); // 진우님의 카카오 키
    }

    Kakao.Auth.login({
        success: function (authObj) {
            // 로그인 성공 시 유저 정보 가져오기
            Kakao.API.request({
                url: '/v2/user/me',
                success: function (res) {
                    const userName = res.kakao_account.profile.nickname;
                    // 👇 고객용 우아한 환영 메시지로 변경 (DB 수집 멘트 삭제) 👇
                    alert(userName + "님 환영합니다! 🎉\n성공적으로 로그인되었습니다.");
                },
                fail: function (error) {
                    console.error('사용자 정보 요청 실패', error);
                    alert('정보를 불러오는데 실패했습니다.');
                }
            });
        },
        fail: function (err) {
            console.error('로그인 실패', err);
            alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
        }
    });
};
// ==========================================
// 부적 결제, 생성 및 카카오톡 전송 로직
// ==========================================
window.openAmuletPayment = function () {
    const paymentModal = document.getElementById('paymentModal');
    const paymentFortuneType = document.getElementById('paymentFortuneType');
    const paymentAmount = document.getElementById('paymentAmount');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    const closeModalBtn = document.querySelector('.close-modal');

    paymentFortuneType.textContent = "맞춤 영험 부적 (디지털)";
    paymentAmount.textContent = "4,900원";
    paymentModal.style.display = 'flex';

    closeModalBtn.onclick = () => paymentModal.style.display = 'none';

    confirmPaymentBtn.onclick = () => {
        confirmPaymentBtn.textContent = "결제창 여는 중...";
        confirmPaymentBtn.disabled = true;

        // 1. 진우님의 진짜 테스트 키로 토스페이먼츠 연결
        const tossPayments = TossPayments("test_ck_0RnYX2w532xnx91LmkYxrNeyqApQ");

        // 2. 카드 결제창 강제 호출!
        tossPayments.requestPayment('카드', {
            amount: currentPrice,
            orderId: 'saju_' + new Date().getTime(),
            orderName: displayTypeName,
            customerName: name,
            successUrl: window.location.href, // 심사용 임시 주소
            failUrl: window.location.href,    // 심사용 임시 주소
        }).catch(function (error) {
            if (error.code === 'USER_CANCEL') {
                paymentModal.style.display = 'none';
                confirmPaymentBtn.textContent = "결제하기";
                confirmPaymentBtn.disabled = false;
                startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus);
            }
        });
    };

    window.generateAndShowAmulet = function () {
        const upsellSection = document.getElementById('amuletUpsellSection');
        if (upsellSection) upsellSection.style.display = 'none';

        const titleEl = document.getElementById('resultTitle');
        let userName = "고객";
        if (titleEl && titleEl.textContent.includes('님을 위해')) {
            userName = titleEl.textContent.split('님을 위해')[0].trim();
        }

        const amuletType = "만사형통 금전 수호부";
        const effectDesc = "부족한 金의 기운을 보완하고<br>사방의 재물을 끌어당기는 기운";

        const amuletHTML = `
            <div style="padding: 2.5rem 1rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px;">
                <h4 style="color: #FFE082; margin-bottom: 2rem; font-size: 1.25rem;">✨ ${userName}님만의 영험 부적이 완성되었습니다</h4>
                
                <div id="amuletImage" style="width: 260px; height: 440px; margin: 0 auto 2.5rem auto; background: #E8D080; border: 3px solid #8A671C; padding: 15px; text-align: center; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.2); position: relative; font-family: 'Batang', 'Nanum Myeongjo', serif; overflow: hidden;">
                    <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid #8B0000; pointer-events: none; opacity: 0.7;"></div>
                    <div style="color: #8B0000; font-size: 1.1rem; margin-top: 15px; letter-spacing: 4px; font-weight: 900;">[ 萬事亨通 ]</div>
                    <div style="color: #333; font-size: 0.8rem; margin-top: 8px; font-family: 'Noto Sans KR', sans-serif;">${amuletType}</div>
                    
                    <svg style="width: 130px; height: auto; margin: 30px auto; display: block; filter: drop-shadow(0 0 3px rgba(139,0,0,0.5));" viewBox="0 0 100 130">
                        <path d="M50 10 Q60 5 70 15 T50 35 T30 55 T70 75 T50 120" stroke="#8B0000" stroke-width="5" fill="none"/>
                        <circle cx="50" cy="20" r="6" fill="#8B0000"/>
                        <circle cx="50" cy="110" r="6" fill="#8B0000"/>
                        <path d="M20 60 Q50 30 80 60" stroke="#8B0000" stroke-width="4" fill="none" stroke-dasharray="6 6"/>
                    </svg>

                    <div style="color: #000; font-size: 1.05rem; margin-top: 10px; font-weight: bold;">${userName} 님의</div>
                    <div style="color: #333; font-size: 0.85rem; margin-top: 10px; line-height: 1.6; font-family: 'Noto Sans KR', sans-serif;">
                        ${effectDesc}
                    </div>
                    <div style="margin-top: 25px; display: inline-block; color: #ef4444; border: 2px solid #ef4444; padding: 3px 7px; font-weight: 900; font-size: 0.8rem; transform: rotate(-5deg); letter-spacing: 1px;">포춘<br>스토리</div>
                </div>

                <button class="btn-premium kakao pulse-btn" style="width: auto; padding: 0 2rem; box-shadow: 0 0 20px rgba(254, 229, 0, 0.3);" onclick="sendAmuletToKakao('${userName}', '${amuletType}')">
                    <span style="font-size: 1.2rem; margin-right: 8px;">💬</span> 카카오톡으로 부적 발급받기
                </button>
            </div>
        `;

        const resultSection = document.getElementById('amuletResultSection');
        if (resultSection) {
            resultSection.innerHTML = amuletHTML;
            resultSection.style.display = 'block';
        }
    };

    window.sendAmuletToKakao = function (userName, amuletType) {
        if (!Kakao.isInitialized()) {
            Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        }

        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '[포춘스토리] ' + userName + '님 맞춤 황금 부적',
                description: '기운을 채우고 액운을 막는 ' + amuletType + '입니다. 스마트폰 배경화면으로 간직하세요.',
                imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' },
            },
            buttons: [
                { title: '내 부적 확인하기', link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' } },
            ],
            callback: function () {
                alert('카카오톡으로 부적이 성공적으로 전송되었습니다! 💬\\n\\n카카오톡 앱에서 확인해 보세요.');
            },
        });
    };
    // ==========================================
    // 부적 결제, 생성 및 카카오톡 전송 로직
    // ==========================================
    window.openAmuletPayment = function () {
        const paymentModal = document.getElementById('paymentModal');
        const paymentFortuneType = document.getElementById('paymentFortuneType');
        const paymentAmount = document.getElementById('paymentAmount');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const closeModalBtn = document.querySelector('.close-modal');

        paymentFortuneType.textContent = "맞춤 영험 부적 (디지털)";
        paymentAmount.textContent = "4,900원";
        paymentModal.style.display = 'flex';

        closeModalBtn.onclick = () => paymentModal.style.display = 'none';

        confirmPaymentBtn.onclick = () => {
            confirmPaymentBtn.textContent = "맞춤 부적 그리는 중...";
            confirmPaymentBtn.disabled = true;

            setTimeout(() => {
                paymentModal.style.display = 'none';
                confirmPaymentBtn.textContent = "결제하기";
                confirmPaymentBtn.disabled = false;
                generateAndShowAmulet();
            }, 1500);
        };
    };

    window.generateAndShowAmulet = function () {
        const upsellSection = document.getElementById('amuletUpsellSection');
        if (upsellSection) upsellSection.style.display = 'none';

        const titleEl = document.getElementById('resultTitle');
        let userName = "고객";
        if (titleEl && titleEl.textContent.includes('님을 위해')) {
            userName = titleEl.textContent.split('님을 위해')[0].trim();
        }

        const amuletType = "만사형통 금전 수호부";
        const effectDesc = "부족한 金의 기운을 보완하고<br>사방의 재물을 끌어당기는 기운";

        const amuletHTML = `
            <div style="padding: 2.5rem 1rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px;">
                <h4 style="color: #FFE082; margin-bottom: 2rem; font-size: 1.25rem;">✨ ${userName}님만의 영험 부적이 완성되었습니다</h4>
                
                <div id="amuletImage" style="width: 260px; height: 440px; margin: 0 auto 2.5rem auto; background: #E8D080; border: 3px solid #8A671C; padding: 15px; text-align: center; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.2); position: relative; font-family: 'Batang', 'Nanum Myeongjo', serif; overflow: hidden;">
                    <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid #8B0000; pointer-events: none; opacity: 0.7;"></div>
                    <div style="color: #8B0000; font-size: 1.1rem; margin-top: 15px; letter-spacing: 4px; font-weight: 900;">[ 萬事亨通 ]</div>
                    <div style="color: #333; font-size: 0.8rem; margin-top: 8px; font-family: 'Noto Sans KR', sans-serif;">${amuletType}</div>
                    
                    <svg style="width: 130px; height: auto; margin: 30px auto; display: block; filter: drop-shadow(0 0 3px rgba(139,0,0,0.5));" viewBox="0 0 100 130">
                        <path d="M50 10 Q60 5 70 15 T50 35 T30 55 T70 75 T50 120" stroke="#8B0000" stroke-width="5" fill="none"/>
                        <circle cx="50" cy="20" r="6" fill="#8B0000"/>
                        <circle cx="50" cy="110" r="6" fill="#8B0000"/>
                        <path d="M20 60 Q50 30 80 60" stroke="#8B0000" stroke-width="4" fill="none" stroke-dasharray="6 6"/>
                    </svg>

                    <div style="color: #000; font-size: 1.05rem; margin-top: 10px; font-weight: bold;">${userName} 님의</div>
                    <div style="color: #333; font-size: 0.85rem; margin-top: 10px; line-height: 1.6; font-family: 'Noto Sans KR', sans-serif;">
                        ${effectDesc}
                    </div>
                    
                    <div style="margin-top: 20px; display: inline-block; width: 40px; height: 40px; color: #b91c1c; border: 3px solid #b91c1c; border-radius: 4px; font-weight: 900; font-size: 1rem; font-family: 'Batang', serif; transform: rotate(-3deg); line-height: 1.1; padding: 2px; background: rgba(255,255,255,0.1); box-shadow: 1px 1px 3px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(185, 28, 28, 0.2);">
                        天命<br>之印
                    </div>
                </div>

                <button class="btn-premium kakao pulse-btn" style="width: auto; padding: 0 2rem; box-shadow: 0 0 20px rgba(254, 229, 0, 0.3);" onclick="sendAmuletToKakao('${userName}', '${amuletType}')">
                    <span style="font-size: 1.2rem; margin-right: 8px;">💬</span> 카카오톡으로 부적 발급받기
                </button>
            </div>
        `;

        const resultSection = document.getElementById('amuletResultSection');
        if (resultSection) {
            resultSection.innerHTML = amuletHTML;
            resultSection.style.display = 'block';
        }
    };

    window.sendAmuletToKakao = function (userName, amuletType) {
        if (!Kakao.isInitialized()) {
            Kakao.init('a5c28b4d706bced99d7282a87113ec82');
        }

        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '[포춘스토리] ' + userName + '님 맞춤 황금 부적',
                description: '기운을 채우고 액운을 막는 ' + amuletType + '입니다. 스마트폰 배경화면으로 간직하세요.',
                imageUrl: 'https://fortune-story.com/images/og-image.jpg',
                link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' },
            },
            buttons: [
                { title: '내 부적 확인하기', link: { mobileWebUrl: 'https://fortune-story.com', webUrl: 'https://fortune-story.com' } },
            ],
            callback: function () {
                alert('카카오톡으로 부적이 성공적으로 전송되었습니다! 💬\\n\\n카카오톡 앱에서 확인해 보세요.');
            },
        });
    };