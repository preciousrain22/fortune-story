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
                // Trigger reflow for animation if needed
                sajuSection.classList.remove('fade-in');
                void sajuSection.offsetWidth;
                sajuSection.classList.add('fade-in');
            }
            if (tarotSection) tarotSection.style.display = 'none';
        } else if (path === 'tarot') {
            if (sajuSection) sajuSection.style.display = 'none';
            if (tarotSection) {
                tarotSection.style.display = 'block';
                // Trigger reflow for animation if needed
                tarotSection.classList.remove('fade-in');
                void tarotSection.offsetWidth;
                tarotSection.classList.add('fade-in');
            }
        }

        // Scroll to the top of the content smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Animation Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

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

            // Generate simple random message
            const messages = [
                `<strong>${name}님</strong>, 오늘 하루는 기대하지 않았던 소소한 기쁨이 찾아올 수 있습니다. 우연히 마주친 사람이 귀인이 될 수 있으니 밝은 미소를 유지하세요.`,
                `<strong>${name}님</strong>, 오늘은 그동안 고민했던 일에 대한 해답의 실마리를 찾게 되는 날입니다. 조금 더 자신감을 가지고 앞으로 나아가셔도 좋습니다.`,
                `<strong>${name}님</strong>, 재물운이 살짝 비치는 하루입니다. 꼭 필요한 곳에 지출은 하되 무리한 투자는 피하고 내실을 다지세요.`,
                `<strong>${name}님</strong>, 오늘은 마음의 안정이 무엇보다 중요한 날입니다. 조급해하지 말고 따뜻한 차 한잔과 함께 평정심을 유지하면 좋은 결과가 따릅니다.`,
                `<strong>${name}님</strong>, 대인관계에서 긍정적인 에너지가 발산되는 날입니다. 주변 사람들에게 먼저 건네는 따뜻한 말 한마디가 큰 행운으로 돌아옵니다.`
            ];

            // simple hash based on date string so same date gives same result
            const hash = name.length + parseInt(year) + parseInt(month) + parseInt(day);
            const msgIndex = hash % messages.length;

            document.getElementById('tasteResultTitle').innerHTML = `${month}월 ${day}일 <span class="highlight">오늘의 기운</span>`;
            document.getElementById('tasteResultText').innerHTML = messages[msgIndex];

            // Switch views
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

    // Date Selects
    const birthYearSelect = document.getElementById('birthYear');
    const birthMonthSelect = document.getElementById('birthMonth');
    const birthDaySelect = document.getElementById('birthDay');

    // Populate Date Selects if they exist
    if (birthYearSelect && birthMonthSelect && birthDaySelect) {
        const currentYear = new Date().getFullYear();
        // Years: 1900 to Current
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}년`;
            birthYearSelect.appendChild(option);
        }
        // Months: 1 to 12
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}월`;
            birthMonthSelect.appendChild(option);
        }
        // Days: 1 to 31 (Simplified)
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}일`;
            birthDaySelect.appendChild(option);
        }
    }

    // Populate Time Selects
    if (birthHourSelect && birthMinuteSelect) {
        // Hours: 1 to 12
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}시`;
            birthHourSelect.appendChild(option);
        }
        // Minutes: 0 to 59
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

    // Prices Definition
    const prices = {
        daily: 3900,
        weekly: 5900,
        yearly: 9900,
        love: 8900,
        exam: 8900
    };

    // Price Update Logic
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

            // Construct Date from Selects
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
                if (amPm === 'PM' && hour24 < 12) {
                    hour24 += 12;
                } else if (amPm === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }

                birthTime = `${hour24.toString().padStart(2, '0')}:${minuteVal}`;
            }

            const calendarType = document.querySelector('input[name="calendarType"]:checked').value;

            if (unknownTime) {
                birthTime = '00:00';
            }

            if (!year || !month || !day) {
                alert('생년월일을 모두 선택해주세요.');
                return;
            }

            // Payment Logic
            const currentPrice = prices[fortuneType];

            // Show Payment Modal
            const paymentModal = document.getElementById('paymentModal');
            const paymentFortuneType = document.getElementById('paymentFortuneType');
            const paymentAmount = document.getElementById('paymentAmount');
            const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
            const closeModalBtn = document.querySelector('.close-modal');

            // Update Modal Content
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

            // Show Modal
            paymentModal.style.display = 'flex';

            // Close Modal Handler
            const closeModal = () => {
                paymentModal.style.display = 'none';
            };
            closeModalBtn.onclick = closeModal;

            // Confirm Payment Handler
            confirmPaymentBtn.onclick = () => {
                confirmPaymentBtn.textContent = "결제 승인 중...";
                confirmPaymentBtn.disabled = true;

                setTimeout(() => {
                    // Payment Success
                    paymentModal.style.display = 'none';
                    confirmPaymentBtn.textContent = "결제하기"; // Reset
                    confirmPaymentBtn.disabled = false;

                    // Start Professional Analysis Simulation
                    startProfessionalAnalysis(name, displayTypeName, year, month, day, fortuneType, maritalStatus);
                }, 1500);
            };
        });
    }

    // Global State for Tarot
    let tarotState = {
        name: '',
        category: '',
        concern: '',
        selectedCards: [],
        maxCards: 3
    };

    // Tarot Form Logic
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

            // Transition to Card Draw Section
            document.getElementById('tarot').style.display = 'none';
            initTarotDraw();
        });
    }

    function initTarotDraw() {
        const tarotDraw = document.getElementById('tarotDraw');
        const deckContainer = document.getElementById('tarotDeck');
        const btnReadTarot = document.getElementById('btnReadTarot');
        const countDisplay = document.getElementById('tarotDrawCount');

        // Reset State
        tarotState.selectedCards = [];
        btnReadTarot.disabled = true;
        btnReadTarot.classList.add('disable-btn');
        btnReadTarot.classList.remove('pulse-btn');
        countDisplay.textContent = '3';
        deckContainer.innerHTML = '';

        tarotDraw.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Generate 78 Full Tarot Deck Cards (facedown)
        for (let i = 0; i < 78; i++) {
            const card = document.createElement('div');
            card.classList.add('tarot-card-back');
            card.dataset.index = i;

            card.addEventListener('click', () => {
                if (card.classList.contains('selected')) {
                    // Deselect
                    card.classList.remove('selected');
                    tarotState.selectedCards = tarotState.selectedCards.filter(idx => idx !== i);
                } else {
                    // Select if under max
                    if (tarotState.selectedCards.length < tarotState.maxCards) {
                        card.classList.add('selected');
                        tarotState.selectedCards.push(i);
                    }
                }

                // Update UI based on selection count
                const remaining = tarotState.maxCards - tarotState.selectedCards.length;
                countDisplay.textContent = remaining;

                if (remaining === 0) {
                    // Lock unselected cards
                    document.querySelectorAll('.tarot-card-back:not(.selected)').forEach(c => c.classList.add('disabled'));
                    btnReadTarot.disabled = false;
                    btnReadTarot.classList.remove('disable-btn');
                    btnReadTarot.classList.add('pulse-btn');
                } else {
                    // Unlock all
                    document.querySelectorAll('.tarot-card-back.disabled').forEach(c => c.classList.remove('disabled'));
                    btnReadTarot.disabled = true;
                    btnReadTarot.classList.add('disable-btn');
                    btnReadTarot.classList.remove('pulse-btn');
                }
            });

            deckContainer.appendChild(card);
        }

        // Action Button Handler (Opens Payment)
        btnReadTarot.onclick = () => {
            openTarotPayment();
        };
    }

    function openTarotPayment() {
        const paymentModal = document.getElementById('paymentModal');
        const paymentFortuneType = document.getElementById('paymentFortuneType');
        const paymentAmount = document.getElementById('paymentAmount');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const closeModalBtn = document.querySelector('.close-modal');

        // Configure Modal for Tarot
        paymentFortuneType.textContent = "타로 파빌리온 - 심층 상담";
        paymentAmount.textContent = "4,900원";
        paymentModal.style.display = 'flex';

        // Override Close Modal
        closeModalBtn.onclick = () => {
            paymentModal.style.display = 'none';
        };

        // Override Confirmation
        confirmPaymentBtn.onclick = () => {
            confirmPaymentBtn.textContent = "우주의 주파수 연결 중...";
            confirmPaymentBtn.disabled = true;

            setTimeout(() => {
                // Payment Success
                paymentModal.style.display = 'none';
                confirmPaymentBtn.textContent = "결제하기"; // Reset
                confirmPaymentBtn.disabled = false;

                // Hide Draw section, show loading
                document.getElementById('tarotDraw').style.display = 'none';
                startTarotAnalysis();
            }, 1500);
        };
    }

    function startTarotAnalysis() {
        const loadingScreen = document.getElementById('tarotLoading');
        const loadingTitle = document.getElementById('tarotLoadingTitle');
        const loadingMessage = document.getElementById('tarotLoadingMessage');

        document.body.style.overflow = 'hidden';
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }

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

        // Fetch Tarot result instead of a simple timeout
        fetchTarotResult().then(result => {
            clearInterval(msgInterval);
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            showTarotResult(result);
        }).catch(err => {
            clearInterval(msgInterval);
            if (loadingScreen) loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            alert("타로 리딩 중 오류가 발생했습니다: " + err.message);
        });
    }

    async function fetchTarotResult() {
        // Full 78-Card Mock Data for Gemini Context or fallback
        // Using a set of public domain Rider-Waite Smith tarot card images
        const baseUrl = "https://upload.wikimedia.org/wikipedia/commons/";

        const fullTarotDeck = [
            { id: 0, name: "바보 (The Fool)", keyword: "새로운 시작, 자유, 무한한 잠재력", isMajor: true, img: "9/90/RWS_Tarot_00_Fool.jpg" },
            { id: 1, name: "마법사 (The Magician)", keyword: "창조력, 기술, 의지, 실천력", isMajor: true, img: "d/de/RWS_Tarot_01_Magician.jpg" },
            { id: 2, name: "여사제 (The High Priestess)", keyword: "직관, 신비, 잠재의식", isMajor: true, img: "8/88/RWS_Tarot_02_High_Priestess.jpg" },
            { id: 3, name: "여황제 (The Empress)", keyword: "풍요, 모성, 아름다움", isMajor: true, img: "d/d2/RWS_Tarot_03_Empress.jpg" },
            { id: 4, name: "황제 (The Emperor)", keyword: "권위, 구조, 안정, 지배", isMajor: true, img: "c/c3/RWS_Tarot_04_Emperor.jpg" },
            { id: 5, name: "교황 (The Hierophant)", keyword: "전통, 교육, 신념, 소속감", isMajor: true, img: "8/8d/RWS_Tarot_05_Hierophant.jpg" },
            { id: 6, name: "연인 (The Lovers)", keyword: "사랑, 조화, 선택, 결합", isMajor: true, img: "3/3a/RWS_Tarot_06_Lovers.jpg" },
            { id: 7, name: "전차 (The Chariot)", keyword: "의지, 승리, 통제, 전진", isMajor: true, img: "9/9b/RWS_Tarot_07_Chariot.jpg" },
            { id: 8, name: "힘 (Strength)", keyword: "용기, 인내, 내면의 힘, 자비", isMajor: true, img: "f/f5/RWS_Tarot_08_Strength.jpg" },
            { id: 9, name: "은둔자 (The Hermit)", keyword: "내면 탐구, 지혜, 고독", isMajor: true, img: "4/4d/RWS_Tarot_09_Hermit.jpg" },
            { id: 10, name: "운명의 수레바퀴 (Wheel of Fortune)", keyword: "전환점, 운명, 변화", isMajor: true, img: "3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg" },
            { id: 11, name: "정의 (Justice)", keyword: "공정, 진실, 인과응보", isMajor: true, img: "e/e0/RWS_Tarot_11_Justice.jpg" },
            { id: 12, name: "매달린 사람 (The Hanged Man)", keyword: "희생, 새로운 관점, 통찰력", isMajor: true, img: "2/2b/RWS_Tarot_12_Hanged_Man.jpg" },
            { id: 13, name: "죽음 (Death)", keyword: "끝과 시작, 변형, 정화", isMajor: true, img: "d/d7/RWS_Tarot_13_Death.jpg" },
            { id: 14, name: "절제 (Temperance)", keyword: "균형, 중용, 조율", isMajor: true, img: "f/f8/RWS_Tarot_14_Temperance.jpg" },
            { id: 15, name: "악마 (The Devil)", keyword: "유혹, 속박, 물질주의", isMajor: true, img: "5/55/RWS_Tarot_15_Devil.jpg" },
            { id: 16, name: "탑 (The Tower)", keyword: "파괴, 혼란, 예상치 못한 변화", isMajor: true, img: "5/53/RWS_Tarot_16_Tower.jpg" },
            { id: 17, name: "별 (The Star)", keyword: "희망, 영감, 평온, 긍정", isMajor: true, img: "d/db/RWS_Tarot_17_Star.jpg" },
            { id: 18, name: "달 (The Moon)", keyword: "불안, 무의식, 두려움", isMajor: true, img: "7/7f/RWS_Tarot_18_Moon.jpg" },
            { id: 19, name: "태양 (The Sun)", keyword: "성공, 기쁨, 활력, 명확성", isMajor: true, img: "1/17/RWS_Tarot_19_Sun.jpg" },
            { id: 20, name: "심판 (Judgement)", keyword: "부활, 평가, 각성", isMajor: true, img: "d/dd/RWS_Tarot_20_Judgement.jpg" },
            { id: 21, name: "세계 (The World)", keyword: "완성, 성취, 새로운 차원", isMajor: true, img: "f/ff/RWS_Tarot_21_World.jpg" },
            // Minor Arcana (Wands, Cups, Swords, Pentacles)
            { id: 22, name: "지팡이 Ace", keyword: "열정, 야망, 에너지", isMajor: false, img: "1/11/Wands01.jpg" },
            { id: 23, name: "지팡이 2", keyword: "열정, 야망, 에너지", isMajor: false, img: "0/0f/Wands02.jpg" },
            { id: 24, name: "지팡이 3", keyword: "열정, 야망, 에너지", isMajor: false, img: "f/ff/Wands03.jpg" },
            { id: 25, name: "지팡이 4", keyword: "열정, 야망, 에너지", isMajor: false, img: "a/a4/Wands04.jpg" },
            { id: 26, name: "지팡이 5", keyword: "열정, 야망, 에너지", isMajor: false, img: "9/9d/Wands05.jpg" },
            { id: 27, name: "지팡이 6", keyword: "열정, 야망, 에너지", isMajor: false, img: "3/3b/Wands06.jpg" },
            { id: 28, name: "지팡이 7", keyword: "열정, 야망, 에너지", isMajor: false, img: "e/e4/Wands07.jpg" },
            { id: 29, name: "지팡이 8", keyword: "열정, 야망, 에너지", isMajor: false, img: "6/6b/Wands08.jpg" },
            { id: 30, name: "지팡이 9", keyword: "열정, 야망, 에너지", isMajor: false, img: "e/e7/Wands09.jpg" },
            { id: 31, name: "지팡이 10", keyword: "열정, 야망, 에너지", isMajor: false, img: "0/0b/Wands10.jpg" },
            { id: 32, name: "지팡이 Page", keyword: "열정, 야망, 에너지", isMajor: false, img: "6/6a/Wands11.jpg" },
            { id: 33, name: "지팡이 Knight", keyword: "열정, 야망, 에너지", isMajor: false, img: "1/16/Wands12.jpg" },
            { id: 34, name: "지팡이 Queen", keyword: "열정, 야망, 에너지", isMajor: false, img: "0/0d/Wands13.jpg" },
            { id: 35, name: "지팡이 King", keyword: "열정, 야망, 에너지", isMajor: false, img: "c/ce/Wands14.jpg" },
            { id: 36, name: "컵 Ace", keyword: "감정, 관계, 직관", isMajor: false, img: "3/36/Cups01.jpg" },
            { id: 37, name: "컵 2", keyword: "감정, 관계, 직관", isMajor: false, img: "f/f8/Cups02.jpg" },
            { id: 38, name: "컵 3", keyword: "감정, 관계, 직관", isMajor: false, img: "7/7a/Cups03.jpg" },
            { id: 39, name: "컵 4", keyword: "감정, 관계, 직관", isMajor: false, img: "3/35/Cups04.jpg" },
            { id: 40, name: "컵 5", keyword: "감정, 관계, 직관", isMajor: false, img: "d/d7/Cups05.jpg" },
            { id: 41, name: "컵 6", keyword: "감정, 관계, 직관", isMajor: false, img: "1/17/Cups06.jpg" },
            { id: 42, name: "컵 7", keyword: "감정, 관계, 직관", isMajor: false, img: "a/ae/Cups07.jpg" },
            { id: 43, name: "컵 8", keyword: "감정, 관계, 직관", isMajor: false, img: "6/60/Cups08.jpg" },
            { id: 44, name: "컵 9", keyword: "감정, 관계, 직관", isMajor: false, img: "2/24/Cups09.jpg" },
            { id: 45, name: "컵 10", keyword: "감정, 관계, 직관", isMajor: false, img: "8/84/Cups10.jpg" },
            { id: 46, name: "컵 Page", keyword: "감정, 관계, 직관", isMajor: false, img: "a/ad/Cups11.jpg" },
            { id: 47, name: "컵 Knight", keyword: "감정, 관계, 직관", isMajor: false, img: "f/fa/Cups12.jpg" },
            { id: 48, name: "컵 Queen", keyword: "감정, 관계, 직관", isMajor: false, img: "6/62/Cups13.jpg" },
            { id: 49, name: "컵 King", keyword: "감정, 관계, 직관", isMajor: false, img: "0/04/Cups14.jpg" },
            { id: 50, name: "검 Ace", keyword: "이성, 도전, 갈등", isMajor: false, img: "1/1a/Swords01.jpg" },
            { id: 51, name: "검 2", keyword: "이성, 도전, 갈등", isMajor: false, img: "9/9e/Swords02.jpg" },
            { id: 52, name: "검 3", keyword: "이성, 도전, 갈등", isMajor: false, img: "0/02/Swords03.jpg" },
            { id: 53, name: "검 4", keyword: "이성, 도전, 갈등", isMajor: false, img: "b/bf/Swords04.jpg" },
            { id: 54, name: "검 5", keyword: "이성, 도전, 갈등", isMajor: false, img: "2/23/Swords05.jpg" },
            { id: 55, name: "검 6", keyword: "이성, 도전, 갈등", isMajor: false, img: "2/29/Swords06.jpg" },
            { id: 56, name: "검 7", keyword: "이성, 도전, 갈등", isMajor: false, img: "3/34/Swords07.jpg" },
            { id: 57, name: "검 8", keyword: "이성, 도전, 갈등", isMajor: false, img: "a/a7/Swords08.jpg" },
            { id: 58, name: "검 9", keyword: "이성, 도전, 갈등", isMajor: false, img: "2/2f/Swords09.jpg" },
            { id: 59, name: "검 10", keyword: "이성, 도전, 갈등", isMajor: false, img: "d/d4/Swords10.jpg" },
            { id: 60, name: "검 Page", keyword: "이성, 도전, 갈등", isMajor: false, img: "4/4c/Swords11.jpg" },
            { id: 61, name: "검 Knight", keyword: "이성, 도전, 갈등", isMajor: false, img: "b/b0/Swords12.jpg" },
            { id: 62, name: "검 Queen", keyword: "이성, 도전, 갈등", isMajor: false, img: "d/d4/Swords13.jpg" },
            { id: 63, name: "검 King", keyword: "이성, 도전, 갈등", isMajor: false, img: "3/33/Swords14.jpg" },
            { id: 64, name: "펜타클 Ace", keyword: "물질, 안정, 결과", isMajor: false, img: "f/fd/Pents01.jpg" },
            { id: 65, name: "펜타클 2", keyword: "물질, 안정, 결과", isMajor: false, img: "9/9f/Pents02.jpg" },
            { id: 66, name: "펜타클 3", keyword: "물질, 안정, 결과", isMajor: false, img: "4/42/Pents03.jpg" },
            { id: 67, name: "펜타클 4", keyword: "물질, 안정, 결과", isMajor: false, img: "3/35/Pents04.jpg" },
            { id: 68, name: "펜타클 5", keyword: "물질, 안정, 결과", isMajor: false, img: "9/96/Pents05.jpg" },
            { id: 69, name: "펜타클 6", keyword: "물질, 안정, 결과", isMajor: false, img: "a/a6/Pents06.jpg" },
            { id: 70, name: "펜타클 7", keyword: "물질, 안정, 결과", isMajor: false, img: "6/6a/Pents07.jpg" },
            { id: 71, name: "펜타클 8", keyword: "물질, 안정, 결과", isMajor: false, img: "4/49/Pents08.jpg" },
            { id: 72, name: "펜타클 9", keyword: "물질, 안정, 결과", isMajor: false, img: "f/f0/Pents09.jpg" },
            { id: 73, name: "펜타클 10", keyword: "물질, 안정, 결과", isMajor: false, img: "4/42/Pents10.jpg" },
            { id: 74, name: "펜타클 Page", keyword: "물질, 안정, 결과", isMajor: false, img: "e/ec/Pents11.jpg" },
            { id: 75, name: "펜타클 Knight", keyword: "물질, 안정, 결과", isMajor: false, img: "d/d5/Pents12.jpg" },
            { id: 76, name: "펜타클 Queen", keyword: "물질, 안정, 결과", isMajor: false, img: "8/88/Pents13.jpg" },
            { id: 77, name: "펜타클 King", keyword: "물질, 안정, 결과", isMajor: false, img: "1/1c/Pents14.jpg" },
        ];

        // Format dummy URL for wands and other arcanas correctly
        fullTarotDeck.forEach(card => {
            if (card.img.includes('Wands') || card.img.includes('Cups') || card.img.includes('Swords') || card.img.includes('Pents')) {
                // The wikimedia commons paths for minor arcana are slightly complex, 
                // to gracefully fallback if some images don't load, we will use a generic tarot back or random placeholder for minors if needed,
                // but we provides real images for Major Arcana which are highly reliable.
                // For minor, let's just make it a cool decorative text or a generic suit icon if the img fails.
            }
            card.imageUrl = card.img.startsWith('http') ? card.img : baseUrl + card.img;
        });

        // Pick 3 pseudo-random cards (reverse logic also possible)
        const shuffled = fullTarotDeck.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(card => {
            // 20% chance to be reversed
            const isReversed = Math.random() < 0.2;
            return {
                ...card,
                orientation: isReversed ? "역방향" : "정방향"
            };
        });



        const apiKey = "";
        if (true) {
            return await fetchFromGemini(selected, apiKey);
        } else {
            // Fallback mock logic if no API key is provided
            return mockTarotResult(selected);
        }
    }

    async function fetchFromGemini(selectedCards, apiKey) {
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

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API 요청 실패 (${response.status}): ${errBody}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        try {
            const parsed = JSON.parse(generatedText);
            return {
                cards: selectedCards,
                interpretations: [
                    parsed.past || "과거 해석을 불러올 수 없습니다.",
                    parsed.present || "현재 해석을 불러올 수 없습니다.",
                    parsed.future || "미래 해석을 불러올 수 없습니다.",
                ],
                advice: parsed.advice || "최종 조언을 불러올 수 없습니다."
            };
        } catch (e) {
            console.error("Failed to parse Gemini JSON output", e, generatedText);
            throw new Error("결과 해석을 파싱하는 데 실패했습니다.");
        }
    }

    function mockTarotResult(selectedCards) {
        // Fallback generator for interpretations
        const posNames = ["원인과 배경 (과거)", "현재 직면한 상황 (현재)", "전개될 결과 (미래)"];
        const interpretations = selectedCards.map((card, index) => {
            let meaning = '';
            if (index === 0) {
                meaning = `이 상황의 뿌리에는 <strong>'${card.name}' (${card.orientation})</strong> 카드의 기운이 짙게 깔려 있습니다. ${card.keyword.split(',')[0]}의 에너지가 무의식을 지배하며 이러한 흐름을 만들었습니다.`;
            } else if (index === 1) {
                meaning = `당신이 직면한 핵심 상황을 <strong>'${card.name}' (${card.orientation})</strong> 카드가 대변하고 있습니다. 지금 가장 필요한 것은 ${card.keyword.split(',')[1] || card.keyword.split(',')[0]}의 태도이며, 직관을 따르셔야 합니다.`;
            } else {
                meaning = `가까운 미래에는 <strong>'${card.name}' (${card.orientation})</strong> 카드의 결론에 이릅니다. 핵심 키워드인 [${card.keyword}]의 에너지가 기다리고 있습니다. 두려워하지 말고 운명의 파도에 올라타십시오.`;
            }
            return meaning;
        });

        return {
            cards: selectedCards,
            interpretations: interpretations,
            advice: "거짓된 환상을 깨고 진실을 마주할 용기를 가지십시오. 우주는 언제나 당신에게 가장 필요한 형태의 시련과 행운을 동시에 줍니다. 내면의 소리에 집중하세요."
        };
    }

    function showTarotResult(resultData) {
        // Hide Gateway specific stuff just in case
        document.querySelector('.header').style.display = 'none';

        const resultSection = document.getElementById('tarotResult');
        resultSection.style.display = 'block';

        const subTitle = document.getElementById('tarotResultSub');
        subTitle.textContent = `'${tarotState.name}'님, 우주의 부름에 응답한 3장의 카드입니다.`;

        const positions = ["과거 (원인)", "현재 (상황)", "미래 (결과)"];

        const revealContainer = document.querySelector('.tarot-cards-reveal');
        revealContainer.innerHTML = '';

        let interpretationHTML = `<h3 style="color: #EEDCFF; margin-bottom: 2rem; text-align: center;">영혼의 메시지 해석</h3>`;
        interpretationHTML += `<p style="margin-bottom: 2rem;"><strong>[질문 요약]</strong> ${tarotState.concern}</p>`;

        resultData.cards.forEach((card, index) => {
            // Card Visual
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

        // Advice
        interpretationHTML += `
            <div style="background: rgba(155, 89, 182, 0.1); padding: 2rem; border-radius: 12px; border: 1px solid rgba(179, 136, 235, 0.3);">
                <h4 style="color: #D3B8F8; text-align: center; margin-bottom: 1rem;">마스터의 최종 조언 (Grand Advice)</h4>
                <p style="text-align: center; line-height: 1.8; color: #EEDCFF;">${resultData.advice}</p>
            </div>
            <div style="margin-top: 3rem; text-align: center; border-top: 1px solid rgba(179, 136, 235, 0.2); padding-top: 2rem;">
                <p style="color: #D3B8F8; margin-bottom: 1.5rem; font-size: 1.1rem;">이 타로 리딩 결과를 소장하시겠습니까?</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 400px; margin: 0 auto;">
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3);" onclick="const e=prompt('결과를 전송받을 이메일 주소를 입력해주세요:');if(e)alert('['+e+'] 주소로 결과 전송이 완료되었습니다.')">📧 이메일 발송</button>
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3);" onclick="window.print()">📄 PDF로 저장</button>
                    <button class="btn-premium kakao" style="font-size: 0.95rem;" onclick="alert('카카오톡 공유창이 열립니다.\\n(시뮬레이션 완료)')">💬 카카오톡 공유</button>
                    <button class="btn-premium outline" style="font-size: 0.95rem; background: rgba(0,0,0,0.3);" onclick="location.reload()">🔄 다른 타로 보기</button>
                </div>
            </div>
        `;

        document.getElementById('tarotResultContent').innerHTML = interpretationHTML;

        window.scrollTo(0, 0);
    }

    function startProfessionalAnalysis(name, typeName, year, month, day, fortuneType, maritalStatus) {
        const loadingScreen = document.getElementById('analysisLoading');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingMessage = document.getElementById('loadingMessage');

        document.body.style.overflow = 'hidden';
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }

        if (loadingTitle) {
            loadingTitle.innerHTML = `'${name}'님의 <span class="obangsaek-text">${typeName}</span> 분석 진행 중...`;
        }

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

        // 🔥 제미나이 사주 API 호출
        getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus)
            .then(aiResultHTML => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                showFinalResult(name, typeName, year, month, day, aiResultHTML);
            })
            .catch(err => {
                clearInterval(msgInterval);
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                alert("사주 분석 중 오류가 발생했습니다: " + err.message);
            });
    }

    // 🔥 새롭게 추가되는 사주 전용 제미나이 함수
    async function getSajuFromGemini(name, typeName, year, month, day, fortuneType, maritalStatus) {
        // 👇 타로에 넣으셨던 것과 똑같은 진우님의 API 키를 여기에 넣어주세요!
        const url = `/api/gemini`;

        const systemPrompt = `
            당신은 30년 경력의 대한민국 최고 명리학자입니다.
            사용자의 생년월일과 운세 종류를 바탕으로, 매우 고급스럽고 품격 있는 문어체(~라 할 수 있습니다, ~한 기운이 깃들어 있습니다)를 사용하여 운세 결과를 작성해 주세요.
            단정적이거나 부정적인 표현은 피하고, 희망적인 비책을 제시하세요.
            마크다운 기호 없이 오직 아래 HTML 포맷에 맞춰 텍스트만 반환하세요.
            
            <p style="margin-bottom:20px; color: #FDFBF7;">(도입부: 사용자의 사주 원국에 대한 1~2문장 묘사)</p>
            <h4 style="text-align: center; color: var(--personal-highlight); font-weight: bold; margin-top:30px;">[ 천명(天命) : 타고난 그릇 ]</h4>
            <p style="margin-bottom:20px; color: #FDFBF7;">(타고난 성향과 기질을 자연물에 비유하여 3~4문장 작성)</p>
            <h4 style="text-align: center; color: var(--personal-highlight); font-weight: bold; margin-top:30px;">[ 시운(時運) : ${typeName} ]</h4>
            <p style="margin-bottom:20px; color: #FDFBF7;">(선택한 운세 종류에 맞는 현재의 운기 흐름과 다가올 기회를 4~5문장 작성)</p>
            <h4 style="text-align: center; color: var(--personal-highlight); font-weight: bold; margin-top:30px;">[ 비책(秘策) : 삶의 조언 ]</h4>
            <p style="margin-bottom:20px; color: #FDFBF7;">(현재 운기를 긍정적으로 활용하기 위한 개운법 2~3문장)</p>
        `;

        const userPrompt = `
            - 이름: ${name}
            - 생년월일: ${year}년 ${month}월 ${day}일
            - 성별/결혼여부: ${maritalStatus === 'married' ? '기혼' : '미혼'}
            - 요청한 운세 종류: ${typeName}
            위 사람의 사주 명식을 분석해 주세요.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: { temperature: 0.6 }
            })
        });

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini API Error Response:", data);
            if (data.error && data.error.message) {
                if (data.error.message.includes("API key not valid")) {
                    throw new Error("API 키가 올바르지 않습니다. script.js 파일에서 정확한 API 키를 입력했는지 확인해주세요.");
                }
                throw new Error("API 오류: " + data.error.message);
            }
            throw new Error("API에서 올바른 응답을 받지 못했습니다. 일일 사용량을 초과했거나 서버 문제일 수 있습니다.");
        }

        return data.candidates[0].content.parts[0].text;
    }

    // 🔥 AI 결과를 받아와서 화면에 그려주는 함수
    function showFinalResult(name, typeName, year, month, day, aiResultHTML) {
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.star-bg-fixed').style.display = 'none';
        document.getElementById('daily').style.display = 'none';

        const resultSection = document.getElementById('result');
        const resultTitle = document.getElementById('resultTitle');
        const resultContent = document.getElementById('resultContent');
        const paperContainer = document.querySelector('.paper-container');

        resultSection.style.display = 'block';

        paperContainer.classList.remove('paper-unroll-anim');
        void paperContainer.offsetWidth;
        paperContainer.classList.add('paper-unroll-anim');

        const personalColorInfo = getPersonalColor(year);
        paperContainer.style.setProperty('--personal-bg', personalColorInfo.bgHex);
        paperContainer.style.setProperty('--personal-color', personalColorInfo.textHex);
        paperContainer.style.setProperty('--personal-highlight', personalColorInfo.highlightHex);

        // 스크롤 두루마리 효과 유지
        paperContainer.style.clipPath = 'inset(-50px -50px 100% -50px)';
        paperContainer.style.transform = 'translateY(0)';

        if (!window.scrollUnrollLoopStarted) {
            window.scrollUnrollLoopStarted = true;
            function updateUnroll() {
                const paper = document.querySelector('.paper-container');
                if (paper && paper.closest('#result').style.display !== 'none') {
                    const windowHeight = window.innerHeight;
                    const rect = paper.getBoundingClientRect();
                    const scrollY = window.scrollY || window.pageYOffset;
                    const scrollMax = Math.max(1, document.documentElement.scrollHeight - windowHeight);
                    const distanceToBottom = scrollMax - scrollY;

                    let clipBottom = rect.bottom - (windowHeight * 0.80);
                    if (distanceToBottom < 500) {
                        const factor = Math.max(0, (500 - distanceToBottom) / 500);
                        clipBottom = clipBottom - (clipBottom + 50) * factor;
                    }
                    if (clipBottom < -50) clipBottom = -50;
                    paper.style.clipPath = `inset(-50px -50px ${clipBottom}px -50px)`;
                }
                requestAnimationFrame(updateUnroll);
            }
            requestAnimationFrame(updateUnroll);
        }

        resultTitle.innerHTML = `<span style="font-size: 0.65em; color: ${personalColorInfo.highlightHex}; font-weight: 400; letter-spacing: 1px; word-break: keep-all;"><span style="display:inline-block;">${name}님을 위해 풀어낸 명리(命理) 비결</span> <span style="display:inline-block;">[퍼스널 컬러: ${personalColorInfo.element} ${personalColorInfo.colorName}]</span></span><br><span style="font-size: 1.15em; display: inline-block; margin-top: 15px;">[ ${typeName} ]</span>`;

        const hashString = name + year + month + day;
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            hash = ((hash << 5) - hash) + hashString.charCodeAt(i);
            hash = hash & hash;
        }
        hash = Math.abs(hash);

        // 🌟 제미나이의 텍스트 결과 + 진우님이 만드신 오행 분포도(그래프) 합체!
        resultContent.innerHTML = aiResultHTML + generateSajuChartsHTML(personalColorInfo, hash);

        window.scrollTo(0, 0);

        // 하단 버튼 로직 유지
        const savePdfBtn = document.getElementById('savePdfBtn');
        const sendEmailBtn = document.getElementById('sendEmailBtn');
        if (savePdfBtn) {
            const newSaveBtn = savePdfBtn.cloneNode(true);
            savePdfBtn.parentNode.replaceChild(newSaveBtn, savePdfBtn);
            newSaveBtn.onclick = () => window.print();
        }
        if (sendEmailBtn) {
            const newEmailBtn = sendEmailBtn.cloneNode(true);
            sendEmailBtn.parentNode.replaceChild(newEmailBtn, sendEmailBtn);
            newEmailBtn.onclick = () => {
                const emailInput = document.getElementById('email').value;
                if (emailInput && emailInput.includes('@')) {
                    alert(`[${emailInput}]로 결과 보고서(PDF)가 발송되었습니다.`);
                } else {
                    alert('올바른 이메일 주소를 입력해주세요.');
                }
            };
        }
        const shareKakaoBtn = document.getElementById('shareKakaoBtn');
        if (shareKakaoBtn) {
            const newKakaoBtn = shareKakaoBtn.cloneNode(true);
            shareKakaoBtn.parentNode.replaceChild(newKakaoBtn, shareKakaoBtn);
            newKakaoBtn.onclick = () => alert('카카오톡 공유창이 열립니다.');
        }
    }

    // Helper: Determine Personal Color based on Year (Simplified for demonstration)
    function getPersonalColor(yearStr) {
        const yearNum = parseInt(yearStr);
        const lastDigit = yearNum % 10;

        // Simple mapping based on Heavenly Stems (Cheongan) last digit of year
        // 4,5: Wood (Green), 6,7: Fire (Red), 8,9: Earth (Yellow), 0,1: Metal (White/Gold), 2,3: Water (Black/Blue)
        if (lastDigit === 4 || lastDigit === 5) {
            return { element: '목(木)', colorName: '초록', textHex: '#DCE775', bgHex: '#1B5E20', highlightHex: '#C5E1A5', borderRgba: 'rgba(197, 225, 165, 0.4)' }; // Wood
        } else if (lastDigit === 6 || lastDigit === 7) {
            return { element: '화(火)', colorName: '빨강', textHex: '#FFCCBC', bgHex: '#B71C1C', highlightHex: '#FFAB91', borderRgba: 'rgba(255, 171, 145, 0.4)' }; // Fire
        } else if (lastDigit === 8 || lastDigit === 9) {
            return { element: '토(土)', colorName: '노랑', textHex: '#FFE082', bgHex: '#3E2723', highlightHex: '#FFD54F', borderRgba: 'rgba(255, 213, 79, 0.4)' }; // Earth
        } else if (lastDigit === 0 || lastDigit === 1) {
            return { element: '금(金)', colorName: '은백색', textHex: '#EEEEEE', bgHex: '#263238', highlightHex: '#FFFFFF', borderRgba: 'rgba(255, 255, 255, 0.4)' }; // Metal
        } else {
            return { element: '수(水)', colorName: '검정/푸른색', textHex: '#B3E5FC', bgHex: '#0D47A1', highlightHex: '#81D4FA', borderRgba: 'rgba(129, 212, 250, 0.4)' }; // Water
        }
    }

    function generateSajuChartsHTML(colorInfo, hash) {
        // Pseudo-random generation of 5 elements based on hash
        const elements = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
        const eColors = ['#4CAF50', '#F44336', '#FFC107', '#9E9E9E', '#2196F3'];

        // Generate pseudo-random values that sum to 8 (8 characters) or 100%
        let v1 = (hash % 30) + 5;
        let v2 = ((hash >> 2) % 30) + 5;
        let v3 = ((hash >> 4) % 30) + 5;
        let v4 = ((hash >> 6) % 30) + 5;
        let v5 = ((hash >> 8) % 30) + 5;

        // Normalize to 100%
        const total = v1 + v2 + v3 + v4 + v5;
        const p1 = Math.round((v1 / total) * 100);
        const p2 = Math.round((v2 / total) * 100);
        const p3 = Math.round((v3 / total) * 100);
        const p4 = Math.round((v4 / total) * 100);
        const p5 = 100 - (p1 + p2 + p3 + p4); // Ensure exactly 100%

        const percentages = [p1, p2, p3, p4, p5];

        // Ten Deities mock data based on hash
        const deities = [
            '비견(比肩)', '겁재(劫財)', '식신(食神)', '상관(傷官)', '편재(偏財)',
            '정재(正財)', '편관(偏官)', '정관(正官)', '편인(偏印)', '정인(正印)'
        ];
        const d1 = deities[hash % 10];
        const d2 = deities[(hash >> 1) % 10];
        const d3 = deities[(hash >> 2) % 10];
        const d4 = deities[(hash >> 3) % 10];
        const d5 = deities[(hash >> 4) % 10];
        const d6 = deities[(hash >> 5) % 10];
        const d7 = deities[(hash >> 6) % 10];
        const d8 = deities[(hash >> 7) % 10];

        let html = `
            <!-- 오행 분포도 -->
            <div style="margin-top: 2rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2); box-shadow: inset 0 0 15px rgba(0,0,0,0.3);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.5rem; font-weight: bold; text-align: center;">[ 오행(五行) 분포도 ]</div>
                <div style="display: flex; flex-direction: column; gap: 20px; max-width: 450px; margin: 0 auto;">
        `;

        percentages.forEach((p, idx) => {
            const labelParts = elements[idx].split('(');
            const pureKor = labelParts[0];
            const hanjaPart = '(' + labelParts[1];
            html += `
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <span style="font-weight: 800; font-size: 1.1rem; color: ${eColors[idx]}; letter-spacing: 2px; text-shadow: 0 0 5px ${eColors[idx]};">${pureKor} <span style="font-size: 0.85rem; font-weight: 400; opacity: 0.8;">${hanjaPart}</span></span>
                            <span style="font-size: 1.1rem; color: #fff; font-weight: bold; text-shadow: 0 0 5px rgba(255,255,255,0.5);">${p}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);">
                            <div style="width: ${p}%; height: 100%; background: linear-gradient(90deg, transparent, ${eColors[idx]}); box-shadow: 0 0 10px ${eColors[idx]}; border-radius: 4px;"></div>
                        </div>
                    </div>
            `;
        });

        html += `
                </div>
            </div>

            <!-- 십신 표 -->
            <div style="margin-bottom: 3rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.2); box-shadow: inset 0 0 15px rgba(0,0,0,0.3);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.5rem; font-weight: bold; text-align: center;">[ 명식(命式)과 십신(十神) ]</div>
                <table style="width: 100%; border-collapse: collapse; text-align: center; color: ${colorInfo.textHex}; table-layout: fixed; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <thead>
                        <tr style="background: rgba(197, 160, 89, 0.15); border-bottom: 2px solid ${colorInfo.borderRgba};">
                            <th style="padding: 12px 10px; width: 20%; color: rgba(255,255,255,0.85); font-weight: normal;">구분</th>
                            <th style="padding: 12px 10px; width: 20%; color: rgba(255,255,255,0.85); font-weight: normal;">시(時)</th>
                            <th style="padding: 12px 10px; width: 20%; color: rgba(255,255,255,0.85); font-weight: normal;">일(日)</th>
                            <th style="padding: 12px 10px; width: 20%; color: rgba(255,255,255,0.85); font-weight: normal;">월(月)</th>
                            <th style="padding: 12px 10px; width: 20%; color: rgba(255,255,255,0.85); font-weight: normal;">년(年)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 15px 12px; font-weight: bold; color: ${colorInfo.highlightHex}; letter-spacing: 1px;">천간<br><span style="font-size:0.75rem; color: rgba(255,255,255,0.5); font-weight: normal;">(십신)</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['갑', '병', '무', '경', '임'][hash % 5]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d1}</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 10px ${colorInfo.textHex};">본원</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: bold; display: inline-block; margin-top: 5px;">[나]</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['을', '정', '기', '신', '계'][hash % 5]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d2}</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['병', '무', '경', '임', '갑'][hash % 5]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d3}</span></td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 12px; font-weight: bold; color: ${colorInfo.highlightHex}; letter-spacing: 1px;">지지<br><span style="font-size:0.75rem; color: rgba(255,255,255,0.5); font-weight: normal;">(십신)</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['자', '인', '진', '오', '신', '술'][hash % 6]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d4}</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['축', '묘', '사', '미', '유', '해'][hash % 6]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d5}</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['인', '진', '오', '신', '술', '자'][hash % 6]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d6}</span></td>
                            <td style="padding: 15px 12px;"><span style="font-size: 1.3rem; font-weight: bold; color: ${colorInfo.textHex}; text-shadow: 0 0 8px rgba(255,255,255,0.2);">${['묘', '사', '미', '유', '해', '축'][hash % 6]}</span><br><span style="font-size: 0.85rem; color: ${colorInfo.highlightHex}; font-weight: 300; display: inline-block; margin-top: 5px;">${d7}</span></td>
                        </tr>
                    </tbody>
                </table>
                <p style="text-align: right; font-size: 0.75rem; margin-top: 15px; color: rgba(255,255,255,0.4); font-weight: 300;">* 사주 원국과 십신의 배치는 고유 기운을 바탕으로 분석되었습니다.</p>
            </div>
        `;
        return html;
    }

    // Helper: Generate Mock Long Content (A4 4~5 Pages)
    function generateLongContent(name, typeName, year, month, day, fortuneType, maritalStatus, colorInfo) {
        let html = "";
        const cHex = colorInfo.highlightHex; // Use dynamic highlight color

        // Create a robust string hash from name and full date
        const hashString = name + year + month + day;
        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            const char = hashString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        hash = Math.abs(hash); // Ensure positive

        const keywords = [
            {
                hanja: '秀 越',
                title: '수월(秀越)',
                desc: '남달리 빼어나고 훌륭하다는 의미를 가집니다.',
                text: '당신이 품은 잠재력은 평범함을 가뿐히 뛰어넘을 만큼 비범한 성질을 띠고 있습니다. 어떤 고난과 역경이 닥치더라도 이를 딛고 일어나 마침내 큰 뜻을 이룰 수 있는 강력하고 긍정적인 에너지가 내포되어 있으니, 스스로의 타고난 가치를 온전히 믿고 거침없이 나아가시길 바랍니다. 평범한 시냇물이 모여 거대한 바다를 이루듯, 당신의 꾸준한 발걸음은 결국 세상을 울리는 큰 힘이 될 것입니다.'
            },
            {
                hanja: '氣 槪',
                title: '기개(氣槪)',
                desc: '굽히지 않고 꿋꿋하게 뻗어나가는 힘을 의미합니다.',
                text: '당신은 흔들림 없는 강직한 성품으로 험난한 세상 풍파에도 쉽게 꺾이지 않습니다. 남들이 주저할 때 앞장설 수 있는 용기가 있으니, 굳건한 신념을 바탕으로 묵묵히 전진한다면 주변의 큰 존경과 따름을 얻어낼 수 있습니다.'
            },
            {
                hanja: '溫 和',
                title: '온화(溫和)',
                desc: '따뜻하고 부드러운 봄볕 같은 성품을 의미합니다.',
                text: '주변 사람들을 편안하게 품어주는 넓은 그릇을 지녔습니다. 타인의 아픔을 깊이 공감하고 어루만지는 능력이 탁월하므로, 이러한 포용력은 결국 덕(德)으로 쌓여 인복이 마르지 않는 삶의 든든한 기반이 될 것입니다.'
            },
            {
                hanja: '明 哲',
                title: '명철(明哲)',
                desc: '사리를 밝게 분별하는 지혜로움을 의미합니다.',
                text: '뛰어난 직관력과 예리한 판단력으로 문제의 본질을 꿰뚫어 보는 지혜가 남다릅니다. 복잡한 상황 속에서도 엉킨 실타래를 푸는 현명함을 발휘하니, 지식과 경험을 두루 쌓을수록 큰 무대에서 빛을 발하는 귀한 인재로 성장할 운명입니다.'
            },
            {
                hanja: '鎭 重',
                title: '진중(鎭重)',
                desc: '태도가 점잖고 무게가 있음을 의미합니다.',
                text: '쉽게 흔들리지 않고 뿌리 깊은 나무처럼 매사에 신중을 기하는 성품입니다. 일시적인 화려함보다는 내실을 다지며 때를 기다릴 줄 아는 지혜가 있으니, 속도는 다소 느릴지라도 한 번 이룬 성취는 결코 모래성처럼 무너지지 않을 것입니다.'
            }
        ];
        const keyword = keywords[hash % keywords.length];

        // Intro & Heaven's Will ([천명])
        html += `
            <h3 style="text-align: center;"><span style="font-size: 1.1em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[천명(天命)]</span> 타고난 그릇과 기질</h3>
            <p>${name}님은 ${year}년 ${month}월 ${day}일, 하늘과 땅의 기운이 교차하는 아름다운 시기에 이 세상에 나셨습니다. 
            사주팔자에 깃든 당신의 본성은 <strong>'외유내강(外柔內剛)'</strong>이라 할 수 있습니다. 겉으로는 봄바람처럼 부드럽고 온화하나, 그 내면에는 한겨울의 모진 바람도 견뎌내는 굳건한 바위와 같은 심지가 자리하고 있습니다.</p>
            <p>당신의 기운은 맑은 날 드넓은 대지를 비추는 따스한 태양과 같으니, 주변 사람들에게 온기를 전하고 만물을 생동케 하는 훌륭한 힘을 지녔습니다. 
            비록 때로는 짙은 구름에 가려 스스로의 빛을 발하지 못하는 듯 답답함을 느낄지라도, 구름이 걷힌 후의 태양은 더욱 찬란하게 빛남을 잊지 마시길 바랍니다.</p>
            <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.2rem; font-weight: bold;">[ 타고난 기운 분석 ]</div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">${keyword.hanja}</span>
                </div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    <strong style="color: ${colorInfo.highlightHex}; font-size: 1.15rem;">${keyword.title}</strong> : ${keyword.desc}<br>
                    <span style="display: inline-block; margin-top: 10px; color: ${colorInfo.textHex};">
                    ${keyword.text}
                    </span>
                </div>
            </div>
            
            ${generateSajuChartsHTML(colorInfo, hash)}
            <br>
        `;

        // Fortune Flow
        html += `
            <h3 style="text-align: center;"><span style="font-size: 1.1em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[운의 흐름(時運)]</span> 현재의 시운과 나아갈 길</h3>
        `;

        // Fortune Details based on Type
        if (fortuneType === 'love') {
            html += generateLoveContent(maritalStatus, cHex);
        } else if (fortuneType === 'exam') {
            html += generateExamContent(cHex);
        } else if (fortuneType === 'daily') {
            html += generateDailyContent(name, maritalStatus, cHex, colorInfo, hash);
        } else {
            // General structure for Weekly, Yearly, Life
            html += generateGeneralContent(fortuneType, maritalStatus, cHex);
        }

        // Monthly Flow (Adding length only for non-daily, since daily is huge anyway)
        if (fortuneType !== 'daily') {
            html += `<br><h4>절기(節氣)로 보는 열두 달의 흐름</h4>`;
            for (let i = 1; i <= 12; i++) {
                html += `<p><strong>${i}월:</strong> ${getMonthlyText(i)}</p>`;
            }
        }

        // Advice
        html += `
            <br>
            <h3 style="text-align: center;"><span style="font-size: 1.1em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[비책(秘策)]</span> 운을 틔우는 지혜</h3>
            <p>${name}님이 품고 있는 훌륭한 기운을 더욱 조화롭게 만개시키기 위해서는 '물(水)'의 유연함을 가까이하는 것이 이롭습니다. 
            만물을 품어 흐르는 강물처럼 마음의 여유를 가지시고, 일상 속에서 잔잔한 호수나 깊은 산속의 계곡을 찾아 마음의 찌든 때를 씻어내시길 권해드립니다.</p>
            <p>혹여 다가오는 운의 흐름에서 거센 비바람을 만나더라도 결코 두려워하지 마십시오. 비 온 뒤에 땅이 더욱 단단해지듯, 이 모든 굴곡진 과정은 당신의 뿌리를 더욱 깊고 튼튼하게 내리기 위한 대자연의 이치일 뿐입니다. 잠시 비를 피할 튼튼한 처마 밑에서 숨을 고르시면 충분합니다.</p>
            <ul>
                <li><strong>길(吉)을 부르는 색:</strong> 맑은 날 깊은 바다와 같은 네이비, 묵직한 흑색(黑)</li>
                <li><strong>기운을 보하는 방향:</strong> 생기가 잉태되어 태동하는 진북(北)방향</li>
                <li><strong>행운을 여는 숫자:</strong> 1, 6</li>
            </ul>
        `;

        // Closing
        html += `
            <br><br>
            <div style="text-align: center; margin-top: 50px;">
                <p>이 작은 글귀가 당신의 인생 여정에 따스한 등불이 되기를 기원합니다.<br>
                결국 명운(命運)이란 하늘이 내리나, 그 길을 걷고 꽃을 피우는 것은 오롯이 당신의 몫입니다.<br>
                <strong>Fortune Story</strong></p>
            </div>
        `;

        return html;
    }

    function generateDailyContent(name, maritalStatus, cHex, colorInfo, hash) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

        const introVariations = [
            `오늘은 하늘의 맑은 기운이 땅으로 온전히 내려와 만물을 깨우는 형상으로, 그동안 미뤄두었던 일들을 과감하게 시작하거나 중요한 결정을 내리기에 참으로 적합한 하루입니다. 다만, 달이 차면 기우는 자연의 이치처럼 너무 지나친 욕심은 오히려 화를 부를 수 있으니, 스스로의 분수를 지키며 매사에 중용(中庸)의 미덕을 발휘해야만 이 상서로운 기운을 온전히 당신의 것으로 만들 수 있습니다.`,
            `마치 겨울잠에서 깨어난 새싹이 대지를 뚫고 올라오듯, 억눌렸던 에너지가 기분 좋게 발산되는 하루입니다. 평소보다 활동 반경을 넓히고 새로운 사람들과 교류하는 과정에서 뜻밖의 큰 수확을 거둘 수 있습니다. 그러나 낯선 제안이나 달콤한 유혹 앞에서는 한 발짝 물러서서 상황의 본질을 냉철하게 꿰뚫어 보는 지혜가 길(吉)함을 지켜줄 것입니다.`,
            `잔잔한 호수에 돌을 던진 듯, 평온했던 일상에 기분 좋은 파문이 일어나는 날입니다. 오랫동안 풀리지 않던 숙원 사업이나 지지부진하던 관계에 긍정적인 돌파구가 열릴 징조가 강렬하게 나타납니다. 오늘 하루만큼은 타인의 시선에 얽매이기보다는, 내면 깊은 곳에서 들려오는 당신만의 직관과 목소리를 믿고 거침없이 행동으로 옮기시길 강력히 권해드립니다.`
        ];

        const morningVariations = [
            `잠자리에서 일어나는 순간부터 머릿속이 맑아지고 새로운 아이디어가 샘솟는 기분 좋은 아침입니다. 동쪽에서 불어오는 따스한 바람이 당신의 앞길을 열어주는 형국이니, 오늘 하루 반드시 처리해야 할 중요한 업무가 있다면 오전 시간대로 일정을 앞당기십시오.`,
            `다소 무거운 몸으로 시작될 수 있으나, 출근길이나 이동 중에 마주치는 상쾌한 공기가 곧 당신의 기혈을 시원하게 뚫어줄 것입니다. 이른 아침의 작고 따뜻한 차 한 잔이 오늘 하루 전체를 여유롭고 부드럽게 이끌어가는 묘약이 됩니다.`,
            `아침부터 예상치 못한 반가운 소식이나 기분 좋은 인사를 받으며 하루의 문을 활기차게 열게 됩니다. 머리 회전이 가장 빠르고 날카로운 시간대이므로, 복잡하고 골치 아팠던 문서 작업이나 치밀한 계획 수립을 이 시간에 몰아서 처리하는 것이 좋습니다.`
        ];

        const lunchVariations = [
            `기운이 절정에 달하며 역동적으로 움직이는 시간대입니다. 여기저기서 당신을 찾는 연락이 많아지거나 변수가 생겨 분주해질 수 있습니다. 식사 후 달콤한 차 한 잔의 여유를 통해 팽팽해진 긴장의 끈을 잠시 늦추고 심호흡을 하십시오.`,
            `태양의 기운이 가장 강렬하게 내리쬐는 한낮, 당신의 리더십과 추진력이 주변 사람들을 압도하며 빛을 발합니다. 중요한 회의나 협상이 있다면 이 시간대를 적극 활용하십시오. 당신의 페이스대로 상황을 유리하게 끌고 갈 수 있는 강한 힘이 솟아납니다.`,
            `오전의 피로가 몰려오며 잠시 집중력이 흐트러질 수 있는 시간입니다. 무리하게 책상에 앉아있기보다는 10분이라도 가볍게 산책을 하며 굳은 몸을 풀어주십시오. 맑은 공기를 들이마시는 것만으로도 오후를 버틸 훌륭한 생기가 충전됩니다.`
        ];

        const afternoonVariations = [
            `오전의 바빴던 불길이 서서히 잦아들고 안정을 찾아가는 시간입니다. 이 시간에는 새로운 일을 크게 벌이기보다는, 오늘 하루 진행했던 일들의 매듭을 확실하게 짓고 꼼꼼하게 점검하는 작업에 집중해야 할 때입니다.`,
            `막바지 스퍼트를 낼 수 있는 귀중한 시간대입니다. 미루고 미뤘던 성가신 일들을 단숨에 해치울 수 있는 놀라운 집중력이 발휘됩니다. 오늘 할 일을 내일로 떠넘기지 않는 결단력이 내일의 더 큰 여유와 복(福)을 불러옵니다.`,
            `동료나 가까운 지인과 소소한 담소를 나누며 서로의 노고를 다독이기에 참으로 좋은 시간입니다. 타인의 고민을 진심으로 들어주고 따뜻한 위로를 건네는 행동이, 훗날 당신이 힘들 때 거대한 방패막이 되어 돌아올 귀한 적선(積善)입니다.`
        ];

        const nightVariations = [
            `모든 활동을 갈무리하고 온전한 나만의 내면으로 침잠해야 하는 지극히 개인적인 시간입니다. 불필요한 저녁 술자리나 왁자지껄한 모임은 맑은 기운을 혼탁하게 할 우려가 큽니다. 따뜻한 물로 피로를 씻어내고 온 에너지를 충전하는 데에 집중하십시오.`,
            `오랜만에 마음이 맞는 편안한 사람들과 격식 없는 저녁 식사를 하기에 안성맞춤인 저녁입니다. 그동안 쌓아두었던 스트레스를 소탈한 대화를 통해 훌훌 털어버리십시오. 맛있는 음식과 좋은 사람들의 기운이 내일을 살아갈 훌륭한 자양분이 됩니다.`,
            `오늘 유독 영감(靈感)과 감수성이 예민하게 깨어나는 밤입니다. 평소 즐겨 읽던 책을 펼치거나 아름다운 음악을 감상하며 영혼을 살찌우는 활동이 매우 이롭습니다. 깊은 사색을 통해 스스로도 몰랐던 자신의 내면과 마주하는 소중한 시간이 될 것입니다.`
        ];

        const wealthVariations = [
            `금전의 흐름이 마치 가뭄 끝에 내리는 단비처럼 반가운 날입니다. 꽉 막혀있던 자금 줄에 어느 정도 숨통이 트이거나, 잊고 있던 작은 돈이 뜻밖에 들어와 기쁨을 줄 수 있습니다. 다만 이 돈은 당장 사치하기보다 종잣돈으로 묵혀두는 것이 좋습니다.`,
            `재물운이 대체로 무난하고 안정적인 궤도를 달리고 있습니다. 크게 들어오는 돈도, 크게 나가는 돈도 없는 평탄한 하루입니다. 오히려 이런 날은 무리한 투자나 남의 말에 현혹되지 않고, 지금 가진 것을 꼼꼼하게 지켜내는 수성(守城)의 지혜가 가장 빛나는 법입니다.`,
            `가까운 지인이나 가족을 위해 기분 좋게 지갑을 열게 되는 날입니다. 베푸는 즐거움이 생각보다 커서 아깝다는 생각보다는 마음이 더욱 풍족해짐을 느낄 것입니다. 억지스러운 소비가 아니라면, 오늘 쓰는 적당한 지출은 훗날 더 큰 형태의 보은으로 돌아옵니다.`
        ];

        const humanVariations = [
            `길을 걷다 우연히 마주치는 바람처럼 다양한 사람들의 감정이 복잡하게 얽히고설키는 날입니다. 내 의도와 무관하게 타인의 시기나 오해를 살 수 있는 불운이 미세하게 서려 있으니, 불필요한 시시비비를 가리는 자리는 단호하게 피하는 것이 상책입니다.`,
            `당신의 재치 있는 입담과 부드러운 매력이 주변 사람들을 강하게 끌어당기는 자석과도 같은 날입니다. 어딜 가나 모임의 중심이 되고 긍정적인 에너지를 널리 전파합니다. 평소 서먹했던 사람에게 먼저 다가가 농담을 건네면 금세 벽이 허물어집니다.`,
            `묵묵히 자신의 자리를 지키며 타인의 말에 귀 기울여주는 든든한 조력자 역할을 자처하게 됩니다. 오늘은 나서는 것보다 한 발짝 뒤에서 전체적인 분위기를 조율하고 타인을 챙기는 자세가 오히려 깊은 신뢰와 존경감을 이끌어냅니다.`
        ];

        let loveText = maritalStatus === 'married'
            ? `부부 사이에 사소한 오해가 커지기 쉬운 날입니다. 말 한마디가 날카로운 검처럼 상대의 마음을 찌를 수 있으니, 무조건 한 박자 쉬고 부드럽게 대화를 이어가십시오. 상대방의 입장을 배려하는 넓은 마음을 발휘하면 저녁 무렵 오히려 유대감이 더욱 깊어집니다.`
            : `애정운이 물처럼 잔잔하고 고요합니다. 새롭게 인연을 찾아 헤매기보다는 본인의 일에 묵묵히 집중할 때 오히려 우연한 기회에 매력이 드러납니다. 만약 호감 가는 상대가 있다면 섣부른 고백보다는 편안한 안부 인사가 훨씬 길(吉)합니다.`;

        // Pseudo-random selection based on hash
        const getVariation = (arr, offset) => arr[(hash + offset) % arr.length];

        const selIntro = getVariation(introVariations, 1);
        const selMorning = getVariation(morningVariations, 2);
        const selLunch = getVariation(lunchVariations, 3);
        const selAfternoon = getVariation(afternoonVariations, 4);
        const selNight = getVariation(nightVariations, 5);
        const selWealth = getVariation(wealthVariations, 6);
        const selHuman = getVariation(humanVariations, 7);

        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <span style="display:inline-block; padding: 5px 15px; border-radius: 20px; background-color: ${colorInfo.borderRgba}; color: ${colorInfo.textHex}; font-weight: bold; font-size: 1.1em; letter-spacing: 2px;">${todayStr} 일진(日辰)</span>
            </div>
            
            <p>${name}님의 사주 명식과 오늘 하루의 우주적 기운이 맞물려 빚어내는 종합적인 흐름입니다. ${selIntro}</p>
            
            <br>
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[시간대별 운의 흐름]</span> 하루를 지배하는 기운의 변화</h4>
            
            <p><strong>아침 (06:00 ~ 11:30) - 여명(黎明)의 태동:</strong> 
            ${selMorning}</p>
            
            <p><strong>점심 (11:30 ~ 15:00) - 중천(中天)의 태양:</strong> 
            ${selLunch}</p>
            
            <p><strong>오후 (15:00 ~ 19:00) - 황혼(黃昏)의 갈무리:</strong> 
            ${selAfternoon}</p>
            
            <p><strong>저녁 심야 (19:00 ~ ) - 심연(深淵)의 휴식:</strong> 
            ${selNight}</p>
            
            <br>
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[영역별 세부 운세]</span> 오늘의 길흉화복(吉凶祸福)</h4>
            
            <p><strong>재물운:</strong> ${selWealth}</p>
            
            <p><strong>인간관계운:</strong> ${selHuman}</p>

            <p><strong>애정운:</strong> ${loveText}</p>
            
            <p><strong>직업/사업운:</strong> 직장이나 당신의 사업장에서 그동안 남몰래 갈고닦아온 내실 있는 실력이 드디어 빛을 발하고 위기 탈출의 귀중한 열쇠가 되는 쾌조의 타이밍입니다. 까다로운 상사나 거래처의 어려운 요구 앞에서도 당황하지 말고 평소의 페이스를 꿋꿋하게 유지하십시오. 당신의 논리정연하고 신중한 태도가 상대방의 단단한 마음의 벽을 허물고 깊은 신뢰를 얻어내어, 필시 큰 성취로 이어지는 징검다리를 놓게 될 것입니다.</p>
            
            <p><strong>건강운:</strong> 겉보기에는 문제가 없어 보이지만, 피로가 보이지 않는 곳에서 체력을 갉아먹고 있을 수 있습니다. 무리하지 않고 가벼운 산책으로 기혈 순환을 장려하는 것이 명약입니다.</p>

            <br>
            <div style="text-align: center; margin-top: 2rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.2rem; font-weight: bold;">[ 오늘의 행운 포인트 (Lucky Point) ]</div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    오늘 당신의 부족한 기운을 빈틈없이 채워주고 불운을 막아줄 든든한 수호 장치들입니다.<br><br>
                    <strong style="color: ${colorInfo.textHex};">유리한 방향:</strong> 측면의 에너지가 닿는 곳<br>
                    <strong style="color: ${colorInfo.textHex};">행운의 컬러:</strong> <strong>${colorInfo.colorName} 계열</strong>의 소품이나 의상<br>
                    <strong style="color: ${colorInfo.textHex};">이로운 음식:</strong> 따뜻하고 맑은 차, 든든한 곡물
                </div>
            </div>
        `;
    }

    function generateGeneralContent(type, maritalStatus, cHex) {
        let title = type === 'daily' ? "오늘의" : type === 'weekly' ? "주간" : type === 'yearly' ? "신년" : "평생";

        let loveSection = maritalStatus === 'married' ?
            `<h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[가정/부부운]</span> 두 그루의 소나무처럼</h4>
            <p>배우자와의 관계는 오랜 세월 풍파를 함께 견뎌낸 두 그루의 소나무처럼 깊은 뿌리로 의지하게 될 것입니다. 
            간혹 거센 바람이 불어 가지가 부딪히고 상처가 날지라도, 이는 서로를 더욱 단단하게 얽어매는 과정입니다. 
            배우자의 침묵 속에 담긴 무게를 헤아려주는 다정한 말 한마디가 가뭄의 단비처럼 가정에 생기를 불어넣을 것입니다.</p>`
            :
            `<h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[애정/연애운]</span> 봄볕에 녹아드는 잔설(殘雪)</h4>
            <p>차가운 겨울이 지나고 따스한 봄볕에 눈이 녹아내리듯, 꽁꽁 얼어붙었던 애정운에 반가운 온기가 스며들고 있습니다. 
            무리하게 봄을 앞당기려 꽃망울을 강제로 터뜨리려 하지 마시고, 때가 되면 자연스레 맺어질 인연의 순리를 믿으십시오. 
            만약 이별의 아픔이나 외로움을 겪고 계시다면, 이는 진정으로 내 삶에 어울리는 따스한 보금자리를 찾기 위해 지나가는 서리일 뿐이니 너무 깊이 상심하지 마시길 바랍니다.</p>`;

        return `
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[재물운]</span> 풍요로운 대지의 기운</h4>
            <p>현재 재물의 기운은 깊은 산속에서 시작된 작은 샘물이 모여 거대한 강줄기를 이루어 나가는 역동적인 형상과 같습니다. 
            재단과 금전이 서서히 모여들어 곳간을 채울 뚜렷한 조짐이 보이나, 재물의 순환이라는 물길이 막히지 않도록 주변 상황을 현명하게 살피는 지혜가 강력하게 요구되는 시기입니다. 
            때로는 가뭄이 든 메마른 땅처럼 자금의 융통이 일시적으로 어려울 때가 닥칠 수 있습니다. 하지만 이는 사주팔자 상 곧 다가올 거대한 재물의 폭우를 안전하게 감당하기 위해 미리 튼튼한 제방을 쌓고 그릇을 키우는 숙성의 시기라 깊이 이해하셔야 합니다. 
            눈앞의 작은 단기적 이익이나 얄팍한 투자에 일희일비하기보다는, 10년 뒤의 울창한 큰 숲을 가꾸는 대범한 마음가짐으로 자산을 굴려 나가실 때 비로소 큰 길(吉)함을 성취하실 수 있을 것입니다.</p>
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[직업/사업운]</span> 넓은 들판에 부는 거침없는 바람</h4>

            <p>직업과 사회적 성취 분야를 짚어보면, 넓은 들판을 거침없이 달려나가는 강력한 순풍(順風)과도 같은 기운이 귀하의 일주(日柱)에 생생하게 깃들어 있습니다. 
            새로운 도약과 기회의 문이 열릴 상서로운 징조가 여러 곳에서 엿보이며, 그동안 남모르게 묵묵히 쌓아온 각고의 내공이 드디어 세상 사람들의 큰 인정과 박수갈채와 함께 빛을 발할 때가 코앞으로 다가왔습니다. 
            만약 현재 몸담고 있는 직장이나 사업의 자리가 마치 찔레꽃 가시밭길처럼 험난하고 고통스럽게 느껴지신다면, 절대 좌절하지 마십시오. 이는 당신의 리더십과 문제 해결 능력을 한 차원 더 크고 견고하게 단련시켜, 훗날 닥칠 진정한 시련을 우습게 넘길 수 있도록 안배해 둔 조물주의 깊고 치밀한 단련 과정일 뿐임을 명심하십시오.</p>
            
            ${loveSection}

            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[건강운]</span> 숲을 지키는 굳건한 바위</h4>
            <p>자신의 건강을 수호하는 기운의 뿌리는 기본적으로 비바람에도 끄떡없는 튼튼하고 거대한 바위처럼 강건하고 곧은 편입니다. 
            다만, 끊임없이 흐르는 부드러운 물방울이 오랜 세월 깊은 바위마저 깎아내리듯, 일상 속에서 타인과의 마찰이나 해결되지 않은 문제들로 인해 누적된 정신적 피로와 보이지 않는 스트레스가 무의식중에 기력을 갉아먹고 쇠약하게 할 수 있으니 각별한 예방과 관리가 요구됩니다. 평소 몸이 보내는 작고 간절한 신호에 귀를 기울이시고, 지치고 소진되는 느낌이 자각될 때는 결코 무리하지 마십시오. 비옥한 대지가 칠흑 같은 밤의 어둠 속에서 조용히 숨을 고르며 내일의 생명을 잉태하듯, 모든 것을 내려놓고 오직 스스로만을 위한 온전한 쉼을 허락하는 것이야말로 진정한 개운(開運)의 첫걸음입니다.</p>
            <br>
        `;
    }

    function generateLoveContent(maritalStatus, cHex) {
        if (maritalStatus === 'married') {
            return `
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[현재 부부 관계의 기운]</span> 마주 보는 두 개의 산봉우리</h4>
            <p>두 분의 연(緣)은 거대한 산맥 속에서 서로를 마주 보며 우뚝 솟은 두 개의 산봉우리와 같습니다. 
            각자의 위치에서 단단하게 서 있으면서도 같은 풍경을 바라보고 있습니다. 
            서로의 기운이 팽팽하게 맞물려 강한 안정감을 주나, 때로는 이 단단함이 아집으로 변하여 소통의 단절을 부를 수 있습니다.</p>
            
            <h4>[지혜로운 대처법]</h4>
            <p>단단한 바위틈에서도 맑은 샘물이 솟아오르듯, 굳어진 마음의 벽을 허무는 것은 결국 다정하고 부드러운 언어입니다. 
            사소한 의견 충돌로 마음이 차갑게 얼어붙었다고 느끼실 때는, 당신이 먼저 따스한 봄햇살이 되어 상대방의 꽁꽁 언 마음을 녹여주십시오. 
            이러한 헌신은 절대 헛되지 않으며, 가정을 굳건히 지키는 든든한 울타리로 당신에게 다시 돌아올 것입니다.</p>
            <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.2rem; font-weight: bold;">[ 애정 화합도 분석 ]</div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">吉 兆</span>
                </div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    <strong style="color: ${colorInfo.highlightHex}; font-size: 1.15rem;">길조(吉兆)</strong> : 매우 상서롭고 좋은 일이 일어날 예감을 의미합니다.<br>
                    <span style="display: inline-block; margin-top: 10px; color: ${colorInfo.textHex};">
                    두 사람의 결합에는 서로의 부족한 기운을 채워주고 이끌어주는 보완적인 오행의 작용이 굳건하게 뒷받침되고 있습니다. 때때로 몰아치는 인생의 폭풍우 속에서도 두 손을 맞잡고 인내한다면, 그 위기를 오히려 서로에 대한 믿음과 사랑을 더욱 깊고 단단하게 뿌리내리는 고귀한 거름으로 승화시키게 될 것입니다. 서로를 거울삼아 함께 성장해 나가는 훌륭하고 모범적인 인연입니다.
                    </span>
                </div>
            </div>
            <br>
            `;
        } else {
            return `
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[현재 나의 애정 기운]</span> 달빛 아래 피어나는 난초</h4>
            <p>당신의 애정 기운은 깊은 밤, 고요한 달빛 아래 맑은 향기를 내뿜는 아름다운 난초와 같습니다. 
            화려하고 자극적인 향기보다는 은은하고 깊이 있는 매력으로 천천히 상대의 마음을 사로잡는 고상함을 지니셨습니다. 
            도화(桃花)의 긍정적인 기운이 조용히 머물고 있으니, 억지로 인연을 찾아 헤매기보다는 본연의 향기를 간직하고 있을 때 제 짝을 찾은 나비가 자연스럽게 날아들 것입니다.</p>
            
            <h4>[관계를 지키는 지혜]</h4>
            <p>마음이 조급해져 꽃망울을 억지로 터뜨리려 하면 꽃은 피지 못하고 잎사귀에 상처만 남게 됩니다. 
            새로운 인연 앞에서는 지나치게 서두르지 마시고, 흐르는 강물처럼 순리대로 마음을 섞어가야 합니다. 
            만약 과거의 상실이 가져온 슬픔이 아직 남아있다면, 이는 단지 당신의 영혼을 더욱 성숙하고 수려하게 빚어내기 위한 가을비에 불과했음을 부디 잊지 마시길 바랍니다.</p>
            <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.2rem; font-weight: bold;">[ 새로운 인연의 기운 ]</div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">佳 期</span>
                </div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    <strong style="color: ${colorInfo.highlightHex}; font-size: 1.15rem;">가기(佳期)</strong> : 인생에서 가장 아름답고 기쁜 만남이 이루어지는 때를 말합니다.<br>
                    <span style="display: inline-block; margin-top: 10px; color: ${colorInfo.textHex};">
                    천지개벽의 이치처럼 때가 이르면 차가운 땅을 뚫고 찬란한 꽃이 만개하듯이, 당신의 외롭고 긴 기다림에 대한 진정한 보상이 찾아올 준비를 마쳤습니다. 스쳐 지나가는 무의미한 인연들에 얽매이며 소중한 감정을 낭비하지 마십시오. 곧 당신의 내면 깊은 곳과 진정한 영혼의 주파수를 교감할 귀한 귀인이 다가올 예정이니, 항상 마음의 여유를 잃지 말고 내실을 다지며 때를 맞이할 준비를 하십시오.
                    </span>
                </div>
            </div>
            <br>
            `;
        }
    }

    function generateExamContent(cHex) {
        return `
            <h4 style="text-align: center;"><span style="font-size: 1.05em; color: ${cHex}; display: block; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">[학업과 성취의 기운]</span> 깊은 땅속에서 자라나는 씨앗</h4>
            <p>문창귀인(文昌貴人)의 이로운 기운이 머물고 있으니, 당신의 학업 운세는 깊은 땅속에서 싹을 틔울 준비를 완전하게 마친 굳센 씨앗과 다름없습니다. 
            보이지 않는 어둠 속에서 고독하게 홀로 흙을 파고드는 과정이 길고 고통스럽게 느껴지시겠으나, 
            그 뿌리가 깊어질수록 머지않아 피워낼 꽃과 달콤한 열매는 타인의 것보다 훨씬 크고 귀할 것입니다.</p>
            
            <h4>[합격을 향한 지혜와 비책]</h4>
            <p>큰 아름드리나무를 베기 위해서는 도끼를 날카롭게 가는 묵언의 시간이 반드시 필요합니다. 
            잠시 성적이 오르지 않거나 막막한 안개가 낀 것처럼 앞이 보이지 않을 때는 결코 자신을 자책하지 마십시오. 
            이는 지식을 온전히 당신의 뼛속 깊이 체화(體化)하기 위한 필수적인 숙성의 시간입니다. 
            시험의 압박감이라는 거센 폭풍이 몰아치더라도, 스스로의 노력을 믿는 그 단단한 마음가짐 하나면 모든 풍파를 충분히 이겨낼 수 있습니다.</p>
            <div style="text-align: center; margin-top: 3rem; margin-bottom: 2rem; padding: 2rem 1.5rem; border: 1px solid ${colorInfo.borderRgba}; border-radius: 12px; background-color: rgba(0, 0, 0, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
                <div style="font-size: 1.15rem; color: ${colorInfo.textHex}; margin-bottom: 1.2rem; font-weight: bold;">[ 학업과 합격 기운 ]</div>
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 1.5rem;">
                    <span class="red-seal" style="transform: scale(1.3); margin: 0 15px;">大 吉</span>
                </div>
                <div style="font-size: 1.05rem; color: ${colorInfo.highlightHex}; line-height: 1.9; text-align: center; word-break: keep-all;">
                    <strong style="color: ${colorInfo.highlightHex}; font-size: 1.15rem;">대길(大吉)</strong> : 운세가 다방면에서 크게 길하고 만사가 융성함을 뜻합니다.<br>
                    <span style="display: inline-block; margin-top: 10px; color: ${colorInfo.textHex};">
                    현재 학업성취와 시험합격을 관장하는 귀인의 이로운 조력이 매섭게 집중되고 있는 시기입니다. 당신이 지금까지 밤잠을 설쳐가며 인내 속에 다져온 피와 땀방울이 그 가치를 찬란하게 증명할 수 있는 완벽한 무대가 마련되고 있습니다. 스스로의 흔들리지 않는 굳건한 신념이 곧 당신의 합격을 결정짓는 핵심 열쇠이니, 불안감을 떨쳐내고 마지막 순간까지 한 치의 흐트러짐 없이 당당하게 나아가십시오.
                    </span>
                </div>
            </div>
            <br>
        `;
    }

    function getMonthlyText(month) {
        const texts = [
            "얼어붙은 대지에 봄비가 내리듯, 웅크렸던 뜻을 서서히 펼치기 참으로 좋은 시기라 할 수 있습니다.",
            "새잎이 돋아나듯 새로운 기운이 솟아오르나, 아직은 늦서리가 내릴 수 있으니 무리한 전진은 잠시 삼가십시오.",
            "따스한 봄볕에 만물이 생동합니다. 귀인의 아낌없는 도움으로 귀한 인연을 맺거나 뜻밖의 기회를 맞이할 수 있습니다.",
            "성급한 춘풍(春風)에 애써 피운 꽃잎이 지지 않도록, 감정의 동요를 고요히 다스리는 지혜가 무엇보다 필요한 달입니다.",
            "푸르른 녹음처럼 기운이 맹렬하게 왕성해지는 시기. 가내의 평안을 먼저 보살피면 바깥의 일도 물 흐르듯 순조롭게 풀립니다.",
            "거센 소나기가 지나간 뒤 하늘이 더욱 투명하게 맑아지듯, 약간의 시련 뒤에 막혔던 일들이 시원하게 뚫릴 상서로운 조짐입니다.",
            "여름날의 뜨거운 태양처럼 매사에 열정적으로 임하십시오. 묵묵히 흘린 땀방울 만큼의 성장이 뚜렷하게 자태를 드러내는 시기입니다.",
            "한여름 짙은 녹음 밑 휴식처럼 쉼표가 절실히 필요합니다. 마음의 짐을 훌훌 털고 재충전의 시간을 가지며 스스로를 보듬으십시오.",
            "황금빛 풍요로운 들녘처럼, 그간 정성껏 뿌려놓은 노력들이 아름다운 보상이라는 진귀한 열매로 맺히기 시작하는 길(吉)한 달입니다.",
            "가을밤의 고요하고 청아한 달빛과 같습니다. 세상의 이치와 내면을 깊이 성찰하고 다가올 추운 겨울을 대비해 든든하게 내실을 다져야 합니다.",
            "차가운 삭풍 속에서도 고고하게 피어나는 매향(梅香)처럼, 묵묵히 본분의 자리를 지키면 마침내 주변의 온전한 인정을 받게 됩니다.",
            "한 해의 생채기를 덮어주는 포근한 첫눈처럼, 묵은 감정과 아쉬움을 훌훌 미련 없이 털어내고 평안하고 따뜻한 마음으로 매듭을 지을 때입니다."
        ];
        return texts[month - 1];
    }
});