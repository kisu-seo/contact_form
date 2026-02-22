/* =============================================
   📌 Contact Form - script.js
   역할: 폼 유효성 검사(Validation) & 성공 토스트 표시

   [전체 흐름 요약 - 우편 배달에 비유!]
   1. 사용자가 Submit 클릭
   2. 우체국 직원(validateForm)이 각 항목을 하나씩 점검
   3. 빠진 내용 있으면 → 반송 편지에 빨간 스탬프(.is-error) 찍기
   4. 모든 항목 완벽하면 → 발송 완료 알림(토스트) 보여주기
   ============================================= */


/* =============================================
   1. DOM 요소 가져오기 (Element References)
   HTML 문서에서 우리가 조작할 요소들을 미리 변수에 저장
   마치 서랍에 도구를 미리 꺼내두는 것처럼!
   ============================================= */
const form = document.getElementById('contact-form');  // 폼 전체
const firstNameEl = document.getElementById('first-name');    // 이름 입력창
const lastNameEl = document.getElementById('last-name');     // 성 입력창
const emailEl = document.getElementById('email');         // 이메일 입력창
const messageEl = document.getElementById('message');       // 메시지 입력창
const consentEl = document.getElementById('consent');       // 동의 체크박스
const toastEl = document.getElementById('toast');         // 성공 토스트 알림창

// 라디오 버튼은 여러 개이므로, name 속성으로 그룹 전체를 가져옴
// querySelectorAll은 해당 조건에 맞는 요소를 '배열 형태(NodeList)'로 반환
const queryTypeRadios = document.querySelectorAll('input[name="query-type"]');


/* =============================================
   2. 에러 메시지 요소 가져오기
   각 입력창에 연결된 에러 문구 요소들
   ============================================= */
const firstNameError = document.getElementById('first-name-error');
const lastNameError = document.getElementById('last-name-error');
const emailError = document.getElementById('email-error');
const queryTypeError = document.getElementById('query-type-error');
const messageError = document.getElementById('message-error');
const consentError = document.getElementById('consent-error');


/* =============================================
   3. 헬퍼 함수 (Helper Functions)
   반복되는 로직을 함수로 만들어 재사용
   ============================================= */

/**
 * [에러 표시 함수] showError
 * 특정 입력창에 에러 상태(빨간 테두리)를 표시하고 에러 메시지를 보여줌
 *
 * @param {HTMLElement} inputEl  - 에러 상태로 만들 입력창 요소
 * @param {HTMLElement} errorEl  - 보여줄 에러 메시지 요소
 */
function showError(inputEl, errorEl) {
    // 입력창에 '.is-error' 클래스 추가 → CSS에서 빨간 테두리 적용
    inputEl.classList.add('is-error');
    // 에러 메시지의 hidden 속성을 제거 → 화면에 에러 문구가 나타남
    errorEl.removeAttribute('hidden');
    // 스크린 리더에게 입력값이 유효하지 않음을 알림
    inputEl.setAttribute('aria-invalid', 'true');
}

/**
 * [에러 초기화 함수] clearError
 * 특정 입력창의 에러 상태를 제거하고 에러 메시지를 숨김
 *
 * @param {HTMLElement} inputEl  - 에러 상태를 해제할 입력창 요소
 * @param {HTMLElement} errorEl  - 숨길 에러 메시지 요소
 */
function clearError(inputEl, errorEl) {
    // '.is-error' 클래스 제거 → 정상 테두리로 복구
    inputEl.classList.remove('is-error');
    // hidden 속성 추가 → 에러 메시지를 다시 숨김
    errorEl.setAttribute('hidden', '');
    // 스크린 리더에게 유효한 값이 들어왔음을 알림
    inputEl.setAttribute('aria-invalid', 'false');
}

/**
 * [이메일 정규식 검사 함수] isValidEmail
 * 입력된 문자열이 이메일 형식(xxx@xxx.xxx)인지 확인
 *
 * @param  {string}  value - 검사할 문자열
 * @returns {boolean}       - 유효하면 true, 아니면 false
 */
function isValidEmail(value) {
    /*
     * [정규식 설명] /^[^\s@]+@[^\s@]+\.[^\s@]+$/
     *
     * ^          → 문자열의 시작
     * [^\s@]+    → 공백(\s)과 @가 아닌 문자가 1개 이상 (= 로컬 파트: 'hello')
     * @          → 반드시 골뱅이(@) 1개
     * [^\s@]+    → 공백과 @가 아닌 문자가 1개 이상 (= 도메인명: 'gmail')
     * \.         → 반드시 점(.) 1개 (이스케이프 처리: \.)
     * [^\s@]+    → 공백과 @가 아닌 문자가 1개 이상 (= 최상위도메인: 'com')
     * $          → 문자열의 끝
     *
     * 예) 'hello@gmail.com' → ✅ 통과
     *     'hello@gmail'     → ❌ 점(.) 없음
     *     'hellogmail.com'  → ❌ @(@) 없음
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // test() 메서드: 문자열이 정규식 조건에 맞으면 true 반환
    return emailRegex.test(value);
}


/* =============================================
   4. 유효성 검사 함수 (Validation Function)
   Submit 시 모든 필드를 순서대로 점검하는 "검사관"
   ============================================= */

/**
 * [유효성 검사 메인 함수] validateForm
 * 모든 입력필드를 검사하고, 에러가 있으면 표시
 *
 * @returns {boolean} - 모든 항목 통과 시 true, 하나라도 실패 시 false
 */
function validateForm() {
    // 에러 존재 여부 추적: 처음엔 에러 없음(true)으로 시작
    let isValid = true;

    /* ── 검사 1: First Name (이름) ────────────────── */
    // trim(): 앞뒤 공백 제거 후 실제 내용이 있는지 확인
    if (firstNameEl.value.trim() === '') {
        showError(firstNameEl, firstNameError); // 에러 표시
        isValid = false;                         // 에러 발생! 플래그를 false로
    } else {
        clearError(firstNameEl, firstNameError); // 정상 → 혹시 있던 에러 제거
    }

    /* ── 검사 2: Last Name (성) ───────────────────── */
    if (lastNameEl.value.trim() === '') {
        showError(lastNameEl, lastNameError);
        isValid = false;
    } else {
        clearError(lastNameEl, lastNameError);
    }

    /* ── 검사 3: Email Address (이메일) ──────────── */
    if (emailEl.value.trim() === '' || !isValidEmail(emailEl.value.trim())) {
        // 비어있거나(!isValidEmail) 형식이 올바르지 않으면 에러
        showError(emailEl, emailError);
        isValid = false;
    } else {
        clearError(emailEl, emailError);
    }

    /* ── 검사 4: Query Type (라디오 버튼) ─────────── */
    // Array.from으로 NodeList → 일반 배열로 변환 후
    // some() 메서드: 배열 안에 checked된 라디오가 '하나라도' 있으면 true 반환
    const isQueryTypeSelected = Array.from(queryTypeRadios).some(radio => radio.checked);

    // 라디오 버튼 그룹의 에러 표시는 input이 아닌 fieldset 내부 요소에 해야 하므로
    // 그룹 전체를 감싸는 fieldset을 기준으로 에러 클래스 처리
    const queryTypeFieldset = document.querySelector('fieldset[aria-describedby="query-type-error"]');

    if (!isQueryTypeSelected) {
        // 라디오 그룹 컨테이너에 에러 클래스 추가 (테두리 강조용)
        queryTypeFieldset.classList.add('is-error');
        queryTypeError.removeAttribute('hidden');
        isValid = false;
    } else {
        queryTypeFieldset.classList.remove('is-error');
        queryTypeError.setAttribute('hidden', '');
    }

    /* ── 검사 5: Message (메시지) ────────────────── */
    if (messageEl.value.trim() === '') {
        showError(messageEl, messageError);
        isValid = false;
    } else {
        clearError(messageEl, messageError);
    }

    /* ── 검사 6: Consent (동의 체크박스) ─────────── */
    // checked 속성: 체크박스가 체크됐으면 true, 아니면 false
    if (!consentEl.checked) {
        // 체크박스는 특성상 클래스로 스타일 조작이 어려워 에러 메시지만 표시
        consentError.removeAttribute('hidden');
        isValid = false;
    } else {
        consentError.setAttribute('hidden', '');
    }

    // 모든 검사 결과 반환 (에러 없으면 true, 하나라도 있으면 false)
    return isValid;
}


/* =============================================
   5. 토스트 알림 표시 함수 (Toast Notification)
   ============================================= */

/**
 * [토스트 표시 함수] showToast
 * 성공 알림창을 화면에 띄우고 일정 시간 후 자동으로 숨김
 *
 * @param {number} duration - 토스트를 유지할 시간 (밀리초, 1000 = 1초)
 */
function showToast(duration = 5000) {
    // hidden 속성 제거 → 토스트가 화면에 나타남
    toastEl.removeAttribute('hidden');

    // setTimeout: "XX 밀리초 뒤에 이 함수를 실행해줘"라는 예약 실행
    setTimeout(() => {
        // 예약된 시간이 지나면 다시 hidden 속성을 추가 → 토스트 숨김
        toastEl.setAttribute('hidden', '');
    }, duration);
}


/* =============================================
   6. 폼 초기화 함수 (Reset Form)
   성공적으로 제출된 후 모든 입력값을 비워줌
   ============================================= */

/**
 * [폼 초기화 함수] resetForm
 * 제출 성공 후 폼의 모든 입력값을 원래 상태로 되돌림
 */
function resetForm() {
    // form.reset(): 폼 안의 모든 입력창을 초기값(빈 값)으로 되돌리는 내장 메서드
    form.reset();
}


/* =============================================
   7. 이벤트 리스너 등록 (Event Listeners)
   "어떤 사건이 발생했을 때 어떤 함수를 실행할지" 지정
   ============================================= */

/**
 * [폼 제출 이벤트]
 * 사용자가 Submit 버튼을 클릭하거나 엔터를 눌렀을 때 실행
 */
form.addEventListener('submit', (event) => {
    // event.preventDefault(): 폼의 기본 동작(페이지 새로고침)을 막음
    // 우리가 직접 JS로 처리할 거라서 브라우저 기본 동작은 차단
    event.preventDefault();

    // 유효성 검사 실행 → 모든 항목이 통과하면 true 반환
    const isValid = validateForm();

    if (isValid) {
        // ✅ 모든 검사 통과 → 성공 처리
        showToast(5000); // 토스트 5초간 표시
        resetForm();     // 입력값 초기화

        // 성공 후 포커스를 토스트로 이동시켜 스크린 리더가 즉시 읽도록 처리
        // tabIndex="-1": JS로만 포커스 가능하게 하고 Tab 순서에는 포함 안 함
        toastEl.setAttribute('tabindex', '-1');
        toastEl.focus();
    } else {
        // ❌ 유효성 검사 실패 → 첫 번째 에러 필드로 포커스 이동
        // querySelector('.is-error'): 페이지에서 처음 발견되는 에러 요소를 찾음
        const firstErrorInput = form.querySelector('.is-error');
        if (firstErrorInput) {
            // 에러가 있는 입력창으로 자동 스크롤 + 포커스 이동
            firstErrorInput.focus();
        }
    }
});


/**
 * [실시간 에러 해제 이벤트]
 * 사용자가 에러 필드를 수정하기 시작하면 에러 상태를 즉시 해제
 * "다 저었는데 아직도 경고 불이 켜져 있는 것"은 불친절하기 때문!
 */

// 텍스트 입력창들: 타이핑하는 순간(input 이벤트) 에러 해제
[
    { el: firstNameEl, err: firstNameError },
    { el: lastNameEl, err: lastNameError },
    { el: emailEl, err: emailError },
    { el: messageEl, err: messageError },
].forEach(({ el, err }) => {
    // 'input' 이벤트: 값이 입력되는 순간마다 발생
    el.addEventListener('input', () => clearError(el, err));
});

// 라디오 버튼 그룹: 하나라도 선택되면 에러 해제
queryTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const queryTypeFieldset = document.querySelector('fieldset[aria-describedby="query-type-error"]');
        queryTypeFieldset.classList.remove('is-error');
        queryTypeError.setAttribute('hidden', '');
    });
});

// 동의 체크박스: 체크 상태가 바뀌면 에러 해제
consentEl.addEventListener('change', () => {
    if (consentEl.checked) {
        consentError.setAttribute('hidden', '');
    }
});
