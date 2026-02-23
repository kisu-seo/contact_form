/**
 * @file script.js
 * @description Contact Form - 폼 유효성 검사 & 성공 토스트 표시
 *
 * [전체 흐름 요약]
 * 이 스크립트는 사용자가 폼을 제출할 때 아래 6가지 항목을 순차적으로 검사합니다:
 *  1. First Name (빈 값 여부)
 *  2. Last Name  (빈 값 여부)
 *  3. Email      (빈 값 여부 + 정규식 형식 검사)
 *  4. Query Type (라디오 버튼 선택 여부)
 *  5. Message    (빈 값 여부)
 *  6. Consent    (체크박스 동의 여부)
 *
 * [성공 시 피드백]
 * → 성공 토스트(Toast)를 화면 상단에 표시하고, 폼 입력값을 초기화합니다.
 *
 * [실패 시 피드백]
 * → 해당 입력창에 .form__input--error 클래스(빨간 테두리)를 추가하고,
 *   숨겨진 에러 메시지를 화면에 노출합니다.
 *   첫 번째 에러 필드로 포커스를 이동시켜 스크린 리더와 키보드 사용자를 안내합니다.
 */


/* =============================================
   1. DOM 요소 참조 (Element References)
   [Why] 조작할 HTML 요소들을 스크립트 최상단에서 한 번만 가져옵니다.
   이벤트가 발생할 때마다 getElementById를 반복 호출하는 것은 비효율적입니다.
   마치 요리 전에 재료를 미리 꺼내두듯, 필요한 요소를 변수에 저장해 재사용합니다.
   ============================================= */

/** @type {HTMLFormElement} 전체 폼 요소 */
const form = document.getElementById('contact-form');

/** @type {HTMLInputElement} 이름(First Name) 입력창 */
const firstNameEl = document.getElementById('first-name');

/** @type {HTMLInputElement} 성(Last Name) 입력창 */
const lastNameEl = document.getElementById('last-name');

/** @type {HTMLInputElement} 이메일 입력창 */
const emailEl = document.getElementById('email');

/** @type {HTMLTextAreaElement} 메시지 텍스트에어리어 */
const messageEl = document.getElementById('message');

/** @type {HTMLInputElement} 동의 체크박스 */
const consentEl = document.getElementById('consent');

/** @type {HTMLElement} 성공 토스트 알림 요소 */
const toastEl = document.getElementById('toast');

/** @type {NodeList} 쿼리 타입 라디오 버튼 그룹 (name 속성으로 전체 선택) */
const queryTypeRadios = document.querySelectorAll('input[name="query-type"]');


/* =============================================
   2. 에러 메시지 요소 참조 (Error Element References)
   [Why] 각 입력창에 연결된 에러 문구 요소들을 미리 가져옵니다.
   showError/clearError 함수가 이 요소들을 반복적으로 사용하기 때문입니다.
   ============================================= */

/** @type {HTMLElement} First Name 에러 메시지 */
const firstNameError = document.getElementById('first-name-error');

/** @type {HTMLElement} Last Name 에러 메시지 */
const lastNameError = document.getElementById('last-name-error');

/** @type {HTMLElement} Email 에러 메시지 */
const emailError = document.getElementById('email-error');

/** @type {HTMLElement} Query Type 에러 메시지 */
const queryTypeError = document.getElementById('query-type-error');

/** @type {HTMLElement} Message 에러 메시지 */
const messageError = document.getElementById('message-error');

/** @type {HTMLElement} Consent 에러 메시지 */
const consentError = document.getElementById('consent-error');

/** @type {HTMLFieldSetElement} Query Type 라디오 그룹을 감싸는 fieldset */
const queryTypeFieldset = document.querySelector('fieldset[aria-describedby="query-type-error"]');


/* =============================================
   3. 헬퍼 함수 (Helper Functions)
   [Why] 에러 표시/해제 로직이 6개 필드에 반복됩니다.
   이를 함수로 추출해두면 코드 중복이 없어지고,
   나중에 에러 처리 방식을 바꿀 때 이 두 함수만 수정하면 됩니다.
   ============================================= */

/**
 * [에러 표시] 입력창에 에러 상태를 적용하고 에러 메시지를 보여줍니다.
 *
 * [Result] 3가지가 동시에 발생합니다:
 *   1. 입력창 테두리가 빨간색으로 바뀝니다 (.form__input--error 클래스 추가)
 *   2. 입력창 아래에 에러 메시지 텍스트가 나타납니다 (hidden 속성 제거)
 *   3. 스크린 리더가 이 입력창을 "유효하지 않은 값"으로 인식합니다 (aria-invalid: true)
 *
 * @param {HTMLElement} inputEl  - 에러 상태로 만들 입력창 요소
 * @param {HTMLElement} errorEl  - 화면에 보여줄 에러 메시지 요소
 * @returns {void}
 */
function showError(inputEl, errorEl) {
    /* BEM Modifier 클래스 추가 → CSS에서 빨간 테두리 적용 */
    inputEl.classList.add('form__input--error');
    /* hidden 속성 제거 → 에러 문구가 화면에 나타남 */
    errorEl.removeAttribute('hidden');
    /* 스크린 리더에게 "이 값은 유효하지 않음"을 알림 */
    inputEl.setAttribute('aria-invalid', 'true');
}

/**
 * [에러 해제] 입력창의 에러 상태를 제거하고 에러 메시지를 숨깁니다.
 *
 * [Result] 3가지가 동시에 발생합니다:
 *   1. 입력창 테두리가 정상 회색으로 복구됩니다 (.form__input--error 클래스 제거)
 *   2. 에러 메시지 텍스트가 다시 숨겨집니다 (hidden 속성 추가)
 *   3. 스크린 리더가 이 입력창을 "유효한 값"으로 인식합니다 (aria-invalid: false)
 *
 * @param {HTMLElement} inputEl  - 에러 상태를 해제할 입력창 요소
 * @param {HTMLElement} errorEl  - 숨길 에러 메시지 요소
 * @returns {void}
 */
function clearError(inputEl, errorEl) {
    /* BEM Modifier 클래스 제거 → 정상 테두리로 복구 */
    inputEl.classList.remove('form__input--error');
    /* hidden 속성 추가 → 에러 메시지를 다시 숨김 */
    errorEl.setAttribute('hidden', '');
    /* 스크린 리더에게 "이 값은 이제 유효함"을 알림 */
    inputEl.setAttribute('aria-invalid', 'false');
}

/**
 * [이메일 형식 검사] 문자열이 유효한 이메일 형식인지 정규식으로 확인합니다.
 *
 * [정규식 상세 설명] /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *  ^ → 문자열의 시작
 *  [^\s@]+ → 공백(\s)과 @ 가 아닌 문자가 1개 이상 (로컬 파트: 'hello')
 *  @ → 반드시 골뱅이(@) 1개
 *  [^\s@]+ → 공백과 @가 아닌 문자가 1개 이상 (도메인명: 'gmail')
 *  \. → 반드시 점(.) 1개 (이스케이프: \.)
 *  [^\s@]+ → 공백과 @가 아닌 문자가 1개 이상 (최상위 도메인: 'com')
 *  $ → 문자열의 끝
 *
 * [Result] 'a@b.c' → true / 'abc@' → false / 'abc' → false / 'a @b.c' → false
 *
 * @param  {string}  value - 검사할 문자열
 * @returns {boolean}       유효한 이메일이면 true, 아니면 false
 */
function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    /* test(): 문자열이 정규식 조건을 만족하면 true 반환 */
    return emailRegex.test(value);
}


/* =============================================
   4. 유효성 검사 함수 (Validation)
   Submit 버튼을 누를 때 모든 필드를 순서대로 점검합니다.
   [Why] 첫 번째 에러에서 멈추지 않고 모든 필드를 검사하는 이유:
   한 번에 모든 에러를 표시해야 사용자가 어디를 고쳐야 하는지 한눈에 파악합니다.
   중간에 return으로 빠져나오면 하단 필드의 에러가 숨겨져 사용자를 답답하게 만듭니다.
   ============================================= */

/**
 * [폼 유효성 검사] 모든 입력 필드를 검사하고 에러가 있으면 표시합니다.
 *
 * @returns {boolean} 모든 항목 통과 시 true, 하나라도 실패 시 false
 */
function validateForm() {
    /* 에러 없음을 나타내는 플래그. 하나라도 실패하면 false로 바뀝니다. */
    let isValid = true;

    /* ── 검사 1: First Name ── */
    /* trim(): 앞뒤 공백 제거 후 실제 내용 여부 확인
       공백만 입력한 경우도 빈 값으로 처리합니다. */
    if (firstNameEl.value.trim() === '') {
        showError(firstNameEl, firstNameError);
        isValid = false;
    } else {
        clearError(firstNameEl, firstNameError);
    }

    /* ── 검사 2: Last Name ── */
    if (lastNameEl.value.trim() === '') {
        showError(lastNameEl, lastNameError);
        isValid = false;
    } else {
        clearError(lastNameEl, lastNameError);
    }

    /* ── 검사 3: Email Address ── */
    /* 비어있거나 형식이 맞지 않으면 에러.
       두 조건을 OR(||)로 묶어 하나의 에러 메시지로 처리합니다. */
    if (emailEl.value.trim() === '' || !isValidEmail(emailEl.value.trim())) {
        showError(emailEl, emailError);
        isValid = false;
    } else {
        clearError(emailEl, emailError);
    }

    /* ── 검사 4: Query Type (라디오 버튼) ── */
    /* Array.from으로 NodeList → 배열 변환 후,
       some()으로 "하나라도 체크된 라디오가 있는지" 확인합니다.
       [Why] some()은 조건을 만족하는 첫 번째 요소를 찾으면 즉시 true를 반환하므로 효율적입니다. */
    const isQueryTypeSelected = Array.from(queryTypeRadios).some(radio => radio.checked);

    if (!isQueryTypeSelected) {
        queryTypeFieldset.classList.add('form__fieldset--error');
        queryTypeError.removeAttribute('hidden');
        isValid = false;
    } else {
        queryTypeFieldset.classList.remove('form__fieldset--error');
        queryTypeError.setAttribute('hidden', '');
    }

    /* ── 검사 5: Message ── */
    if (messageEl.value.trim() === '') {
        showError(messageEl, messageError);
        isValid = false;
    } else {
        clearError(messageEl, messageError);
    }

    /* ── 검사 6: Consent 체크박스 ── */
    /* checked 속성: 체크됐으면 true, 아니면 false.
       [Why] 체크박스는 텍스트 입력이 없으므로 showError/clearError 대신
       에러 메시지 요소의 hidden 속성만 직접 제어합니다. */
    if (!consentEl.checked) {
        consentError.removeAttribute('hidden');
        isValid = false;
    } else {
        consentError.setAttribute('hidden', '');
    }

    return isValid;
}


/* =============================================
   5. 토스트 알림 표시 함수 (Toast)
   ============================================= */

/**
 * [토스트 표시] 성공 알림창을 화면에 띄웁니다.
 *
 * [Why] hidden 속성 하나만 제거해도 토스트가 나타나는 이유:
 * HTML에서 토스트는 기본적으로 hidden 속성으로 숨겨져 있습니다.
 * hidden 제거와 동시에 HTML의 aria-live="polite" 속성이 이 변화를 감지해
 * 스크린 리더에게 "Message Sent!" 성공 메시지를 자동으로 읽어줍니다.
 *
 * @returns {void}
 */
function showToast() {
    /* hidden 속성 제거 → 토스트가 화면에 나타납니다 */
    toastEl.removeAttribute('hidden');
}


/* =============================================
   6. 폼 초기화 함수 (Reset)
   성공적으로 제출된 후 모든 입력값을 비워줍니다.
   ============================================= */

/**
 * [폼 초기화] 제출 성공 후 폼의 모든 입력값을 초기 상태로 되돌립니다.
 *
 * [Why] form.reset()을 직접 호출하는 이유:
 * 모든 input/textarea/select/checkbox/radio를 일일이 초기화하는 대신,
 * HTML 내장 메서드 하나로 폼 내 모든 요소를 한번에 초기값으로 복구합니다.
 *
 * @returns {void}
 */
function resetForm() {
    /* form.reset(): HTML 내장 메서드. 폼 내 모든 입력 요소를 초기값으로 복구합니다. */
    form.reset();
}


/* =============================================
   7. 이벤트 리스너 (Event Listeners)
   "어떤 사건이 발생했을 때 어떤 함수를 실행할지" 연결합니다.
   ============================================= */

/**
 * [폼 제출 이벤트]
 * 사용자가 Submit 버튼을 클릭하거나 입력 중 Enter를 눌렀을 때 실행됩니다.
 *
 * [Submit 로직 흐름 - 3단계]
 *
 * ▶ 1단계: 폼 기본 제출 동작 방지
 *   event.preventDefault()로 브라우저 기본 동작(GET/POST 요청 + 페이지 새로고침)을 차단합니다.
 *   이 한 줄이 없으면 JS 유효성 검사가 실행되기도 전에 페이지가 새로고침됩니다.
 *
 * ▶ 2단계: 전체 필드 유효성 검사 실행
 *   validateForm()을 호출해 6개 필드를 모두 검사합니다.
 *   모두 통과하면 true, 하나라도 실패하면 false를 반환합니다.
 *
 * ▶ 3단계: 검사 통과 여부에 따른 상태 전환
 *   [성공] showToast() → 성공 알림 표시 / resetForm() → 폼 초기화 / toastEl.focus() → 스크린 리더 안내
 *   [실패] 첫 번째 에러 필드(.form__input--error)로 포커스를 이동해 수정 위치를 안내합니다.
 */
form.addEventListener('submit', (event) => {
    /* ▶ 1단계: 폼의 기본 동작(페이지 새로고침)을 차단합니다. */
    event.preventDefault();

    /* ▶ 2단계: 유효성 검사 실행. 모든 항목이 통과하면 true 반환 */
    const isValid = validateForm();

    if (isValid) {
        /* ▶ 3단계 [성공]: 토스트 표시 + 폼 초기화 */
        showToast();  /* 토스트 알림 표시 */
        resetForm();  /* 입력값 초기화 */

        /* 성공 후 포커스를 토스트로 이동
           [Why] tabIndex="-1"을 추가하는 이유:
           일반 div/p 요소는 포커스를 받지 못합니다. tabIndex="-1"을 주면
           JS의 .focus()로만 포커스가 가능해집니다 (Tab 키 순서에는 포함되지 않음).
           [Result] 스크린 리더가 토스트의 "Message Sent!" 메시지를 즉시 낭독합니다. */
        toastEl.setAttribute('tabindex', '-1');
        toastEl.focus();

    } else {
        /* ▶ 3단계 [실패]: 첫 번째 에러 필드로 포커스 이동
           [Why] 유효성 검사 실패 후 첫 번째 에러 필드로 포커스를 이동하는 이유:
           에러가 화면 아래쪽에 있으면 사용자가 스크롤을 내려야만 확인할 수 있습니다.
           포커스 이동은 자동 스크롤도 함께 일으켜, 사용자를 첫 번째 수정 위치로 즉시 안내합니다.
           스크린 리더 사용자도 포커스 이동으로 에러 위치를 음성으로 파악합니다. */
        const firstErrorInput = form.querySelector('.form__input--error');
        if (firstErrorInput) {
            /* 에러 있는 입력창으로 자동 스크롤 + 포커스 이동 */
            firstErrorInput.focus();
        }
    }
});


/**
 * [실시간 에러 해제 이벤트]
 *
 * [Why - UX 향상 관점]
 * Submit 버튼을 눌러 에러가 표시된 상태에서, 사용자가 수정을 시작하면
 * 빨간 테두리와 에러 메시지가 즉시 사라집니다.
 *
 * 만약 이 실시간 해제 기능이 없다면?
 * → 사용자는 값을 입력하면서도 계속 빨간 테두리를 보게 됩니다.
 * → "내가 제대로 수정하고 있는 건가?" 라는 불안감을 줍니다.
 *
 * 'input' 이벤트는 값이 변경되는 매 순간 발생합니다 (keyup과 달리 붙여넣기도 감지).
 * [Result] 사용자가 첫 글자를 입력하는 순간 에러가 해제되어 긍정적인 진행 피드백을 줍니다.
 */

/* 텍스트 입력창들을 하나의 배열로 관리합니다.
   [Why] forEach 하나로 처리해 각 필드에 addEventListener를 4번 반복 작성하지 않습니다. */
const textInputFields = [
    { el: firstNameEl, err: firstNameError },
    { el: lastNameEl, err: lastNameError },
    { el: emailEl, err: emailError },
    { el: messageEl, err: messageError },
];

textInputFields.forEach(({ el, err }) => {
    /* 'input' 이벤트: 값이 입력되는 순간마다 발생 */
    el.addEventListener('input', () => clearError(el, err));
});

/* 라디오 버튼 그룹: 하나라도 선택되면 에러를 해제합니다.
   [Why] 라디오는 'change' 이벤트를 씁니다. 'input'과 달리 값이 실제로 변경(선택)됐을 때만 발생합니다.
   [Result] 어느 라디오 옵션을 클릭하든 즉시 에러 메시지가 사라집니다. */
queryTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        queryTypeFieldset.classList.remove('form__fieldset--error');
        queryTypeError.setAttribute('hidden', '');
    });
});

/* 동의 체크박스: 체크 상태가 true가 되면 에러를 해제합니다.
   [Why] 체크를 해제(false)해도 에러를 다시 표시하지 않는 이유:
   Submit 버튼을 다시 누르기 전까지는 재검사를 하지 않아야 사용자가 덜 압박를 느낍니다.
   에러는 Submit 시도 때만 새로 뜨고, 실시간으로는 "해제"만 해줍니다.
   [Result] 체크박스를 체크하는 순간 에러 메시지가 사라집니다. */
consentEl.addEventListener('change', () => {
    if (consentEl.checked) {
        consentError.setAttribute('hidden', '');
    }
});
