
// 탭 스위칭
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-buttons button');
  if(!btn) return;
  const tabs = btn.closest('.tabs');
  const id = btn.dataset.tab;
  tabs.querySelectorAll('.tab-buttons button').forEach(b => b.classList.toggle('active', b===btn));
  tabs.querySelectorAll('.tab-contents .pane').forEach(p => p.classList.toggle('active', p.dataset.pane===id));
});

// 스크롤 리빌
const io1 = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      io1.unobserve(entry.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('[data-reveal], .panel').forEach(el=>io1.observe(el));

// 페럴랙스
const heroImg = document.querySelector('.parallax');
if(heroImg && window.matchMedia('(min-width: 821px)').matches){
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY * 0.05;
    heroImg.style.transform = `translateY(${y}px)`;
  }, {passive:true});
}

// 모바일 하단바 페이드 인
const mobileCta = document.querySelector('.mobile-cta');
if(mobileCta){ setTimeout(()=> mobileCta.classList.add('show'), 200); }

// 앵커 스무스 스크롤
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const id = a.getAttribute('href');
  if(id.length > 1){
    const target = document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const FORM_TS = Date.now();
  /* ========= 현장명(메일 본문에 사용) ========= */
  const SITE_NAME = '보라매 파르크힐'; // ← 필요 시 원하는 이름으로 변경

  /* ========= 탭 스위칭 ========= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-buttons button');
    if (!btn) return;
    const tabs = btn.closest('.tabs');
    const id = btn.dataset.tab;
    tabs.querySelectorAll('.tab-buttons button')
      .forEach(b => b.classList.toggle('active', b === btn));
    tabs.querySelectorAll('.tab-contents .pane')
      .forEach(p => p.classList.toggle('active', p.dataset.pane === id));
  });

  /* ========= 스크롤 리빌(단순형: 처음 한 번만 나타남) ========= */
  const revealItems = document.querySelectorAll('[data-reveal], .panel');
  if ('IntersectionObserver' in window && revealItems.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    },{threshold:.12});
    revealItems.forEach(el=>io.observe(el));
  } else {
    revealItems.forEach(el=>el.classList.add('revealed'));
  }

  /* ========= 패럴랙스(데스크탑만) ========= */
  const heroImg = document.querySelector('.parallax');
  if (heroImg && window.matchMedia('(min-width: 821px)').matches){
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY * 0.05;
      heroImg.style.transform = `translateY(${y}px)`;
    }, {passive:true});
  }

  /* ========= 모바일 하단바 페이드 인 ========= */
  const mobileCta = document.querySelector('.mobile-cta');
  if (mobileCta){ setTimeout(()=> mobileCta.classList.add('show'), 200); }

  /* ========= 앵커 스무스 스크롤 ========= */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href');
    if(id.length > 1){
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }
  });

  /* ========= 날짜 피커 ========= */
  if (window.flatpickr) {
    flatpickr("#visit-date", {
      locale: "ko",
      dateFormat: "Y-m-d",
      defaultDate: new Date(),
      allowInput: false,
      disableMobile: true
    });
  }

  /* ========= 폼 요소 ========= */
  const form = document.getElementById('reservation');
  const submitBtn = document.getElementById('submitBtn');
  const checkbox = document.querySelector('.form-contents-privacy-checkbox');
  const visitDateInput = document.getElementById('visit-date');

  // 시간 드롭다운
  const timeWrap = document.querySelector('.time-wrap');
  const timeDisplay = document.getElementById('visit-time-display'); // 예: "10:00 ~ 11:00"
  const timeHidden  = document.getElementById('visit-time');         // 예: "10:00" (시작시각)
  const timeDropdown = document.getElementById('time-dropdown');

  const toggleSubmit = () => { submitBtn.disabled = !checkbox.checked; };
  if (checkbox){
    checkbox.addEventListener('change', toggleSubmit);
    toggleSubmit();
  }

  const normalizePhone = (val) => (val || '').replace(/[^\d]/g, '');
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

  // 시간 드롭다운 열기/닫기/선택
  const openDropdown = () => {
    if (!timeDropdown) return;
    timeDropdown.classList.add('open');
    if (timeDisplay) timeDisplay.setAttribute('aria-expanded','true');
  };
  const closeDropdown = () => {
    if (!timeDropdown) return;
    timeDropdown.classList.remove('open');
    if (timeDisplay) timeDisplay.setAttribute('aria-expanded','false');
  };
  const toggleDropdown = () => {
    if (!timeDropdown) return;
    timeDropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  };

  if (timeDisplay){
    timeDisplay.addEventListener('click', (e)=>{ e.preventDefault(); toggleDropdown(); });
  }
  document.addEventListener('click', (e)=>{ if (timeWrap && !timeWrap.contains(e.target)) closeDropdown(); });

  const onChooseSlot = (el) => {
    if (!el) return;
    const label = el.textContent.trim();              // vtLabel
    const value = (el.dataset.value || '').trim();    // vt
    if (timeDisplay) timeDisplay.value = label;
    if (timeHidden)  timeHidden.value  = value;

    timeDropdown?.querySelectorAll('.slot[aria-selected="true"]')
      .forEach(s=>s.setAttribute('aria-selected','false'));
    el.setAttribute('aria-selected', 'true');

    closeDropdown();
    timeDisplay?.focus();
  };

  timeDropdown?.addEventListener('click', (e)=>{
    const slot = e.target.closest('.slot');
    if (slot) onChooseSlot(slot);
  });

  /* ========= 폼 전송 ========= */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (checkbox && !checkbox.checked) {
      alert('개인정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    const name  = form.elements.name?.value.trim() || '';
    const phone = normalizePhone(form.elements.phone?.value);
    const vd    = visitDateInput?.value.trim() || '';
    const vt    = timeHidden?.value.trim() || '';     // "HH:mm"
    const vtLabel = timeDisplay?.value.trim() || '';  // "HH:mm ~ HH:mm" 또는 "10시 이전"
    const site  = SITE_NAME;
    const ts    = Date.now();

    if (!name) { alert('성함을 입력해 주세요.'); return; }
    if (!(phone.length === 10 || phone.length === 11)) { alert('연락처를 정확히 입력해 주세요.'); return; }
    if (!vd) { alert('방문일을 선택해 주세요.'); return; }
    if (!vt || !vtLabel) { alert('방문시간을 선택해 주세요.'); openDropdown(); return; }

    submitBtn.disabled = true;
    const prevLabel = submitBtn.textContent;
    submitBtn.textContent = '전송 중…';

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, vd, vt, vtLabel, name, phone, ts: FORM_TS })
      });

      if (res.ok) {
        await sleep(300);
        alert(`${name}님, 방문예약이 접수되었습니다!`);
        form.reset();
        if (timeDisplay) timeDisplay.value = '';
        if (timeHidden)  timeHidden.value = '';
        toggleSubmit();
      } else {
        const data = await res.json().catch(()=>({}));
        alert(data.error || '메일 전송에 실패했습니다.');
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
    }
  });
});
// 인터섹션 옵저버 (스크롤 애니메이션)
(function(){
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || items.length === 0){
    items.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const once = el.hasAttribute('data-reveal-once');

      if (entry.isIntersecting) {
        if (el._leaveTimer){ clearTimeout(el._leaveTimer); el._leaveTimer = null; }
        const baseDelay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        el.style.transitionDelay = (baseDelay/1000) + 's';
        el.classList.add('is-revealed');
        if (once) io2.unobserve(el);
      } else {
        if (!once){
          el._leaveTimer = setTimeout(() => {
            el.classList.remove('is-revealed');
            el.style.transitionDelay = '';
          }, 150);
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12
  });

  items.forEach(el => io2.observe(el));
})();

