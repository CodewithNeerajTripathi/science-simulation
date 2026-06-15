(function () {
  'use strict';

/* ═══════════════════════════════════════════════════════
     GLOBAL CLICK SOUND
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const clickSound = new Audio('audio/Click.mp3');
    clickSound.play().catch(() => {});
  });

/* ═══════════════════════════════════════════════════════
     INFO POPUP
  ═══════════════════════════════════════════════════════ */
let infoAudio = null;
  let infoAudioMuted = false;
  let activeGameAudio = null;

  function playGameAudio(src) {
    if (activeGameAudio) { activeGameAudio.pause(); activeGameAudio.currentTime = 0; }
    activeGameAudio = new Audio(src);
    activeGameAudio.volume = infoAudio ? 0 : 1;
    activeGameAudio.play().catch(() => {});
    return activeGameAudio;
  }
  function showInfoPopup(imgSrc, audioSrc) {
    let popup = document.getElementById('infoPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'infoPopup';
      popup.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(10, 20, 50, 0.55);
        padding: 16px;
      `;
      const box = document.createElement('div');
      box.id = 'infoPopupBox';
      box.style.cssText = `
        position: relative;
        max-width: 92vw;
        max-height: 92vh;
        animation: popupIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
      `;
      const img = document.createElement('img');
      img.id = 'infoPopupImg';
      img.style.cssText = `
        display: block;
        max-width: 92vw;
        max-height: 92vh;
        object-fit: contain;
        border-radius: clamp(8px, 1.5vw, 16px);
      `;
      const closeBtn = document.createElement('button');
      closeBtn.id = 'infoPopupCloseBtn';
      closeBtn.style.cssText = `
        position: absolute;
        top: clamp(8px, 1.5vw, 16px);
        right: clamp(8px, 2.7vw, 50px);
        width: clamp(32px, 4vw, 30px);
        height: clamp(32px, 6vw, 48px);
        border-radius: 50%;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s;
      `;
      closeBtn.onmouseover = () => { closeBtn.style.transform = 'scale(1.15)'; };
      closeBtn.onmouseout  = () => { closeBtn.style.transform = 'scale(1)'; };
      const closeImg = document.createElement('img');
      closeImg.src = 'icon/close.png';
      closeImg.style.cssText = `width: 100%; height: 100%; object-fit: contain;`;
      closeBtn.appendChild(closeImg);

      const audioBtn = document.createElement('button');
      audioBtn.id = 'infoPopupAudioBtn';
      audioBtn.style.cssText = `
        position: absolute;
        top: clamp(8px, 1.5vw, 16px);
        left: clamp(8px, 3.2vw, 70px);
        width: clamp(64px, 8vw, 60px);
        height: clamp(64px, 12vw, 76px);
        border-radius: 50%;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s;
      `;
      const audioImg = document.createElement('img');
      audioImg.id = 'infoPopupAudioImg';
      audioImg.src = 'icon/audio.png';
      audioImg.style.cssText = `width: 100%; height: 100%; object-fit: contain;`;
      audioBtn.appendChild(audioImg);
      audioBtn.onmouseover = () => { audioBtn.style.transform = 'scale(1.15)'; };
      audioBtn.onmouseout  = () => { audioBtn.style.transform = 'scale(1)'; };

audioBtn.addEventListener('click', () => {
        if (!infoAudio) return;
 if (infoAudioMuted) {
          /* unmute and restart from beginning */
          infoAudioMuted = false;
          audioImg.src = 'icon/audio.png';
          infoAudio.currentTime = 0;
          infoAudio.muted = false;
          infoAudio.play().catch(() => {});
          /* info playing again → silence game audios */
          if (currentInstructionAudio) currentInstructionAudio.volume = 0;
          if (motionCurrentAudio) motionCurrentAudio.volume = 0;
          if (ppCurrentAudio) ppCurrentAudio.volume = 0;
          if (activeGameAudio) activeGameAudio.volume = 0;
        } else {
          /* mute info audio → restore others */
          infoAudioMuted = true;
          audioImg.src = 'icon/mute.png';
          infoAudio.muted = true;
          if (currentInstructionAudio) currentInstructionAudio.volume = 1;
          if (motionCurrentAudio) motionCurrentAudio.volume = 1;
          if (ppCurrentAudio) ppCurrentAudio.volume = 1;
          if (activeGameAudio) activeGameAudio.volume = 1;
        }
      });

      box.appendChild(img);
      box.appendChild(closeBtn);
      box.appendChild(audioBtn);
      popup.appendChild(box);
      document.body.appendChild(popup);

function restoreAllAudio() {
        if (currentInstructionAudio) currentInstructionAudio.volume = 1;
        if (motionCurrentAudio) motionCurrentAudio.volume = 1;
        if (ppCurrentAudio) ppCurrentAudio.volume = 1;
        if (activeGameAudio) activeGameAudio.volume = 1;
      }

      closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        if (infoAudio) {
          infoAudio.pause();
          infoAudio.currentTime = 0;
          infoAudio = null;
        }
        infoAudioMuted = false;
        const aImg = document.getElementById('infoPopupAudioImg');
        if (aImg) aImg.src = 'icon/audio.png';
        restoreAllAudio();
      });

      if (!document.getElementById('popupKeyframes')) {
        const style = document.createElement('style');
        style.id = 'popupKeyframes';
        style.textContent = `
          @keyframes popupIn {
            from { opacity: 0; transform: scale(0.88) translateY(18px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    const img = document.getElementById('infoPopupImg');
    img.src = imgSrc;
    popup.style.display = 'flex';

    /* stop any previous audio */
    if (infoAudio) {
      infoAudio.pause();
      infoAudio.currentTime = 0;
      infoAudio = null;
    }

    /* reset mute state */
    infoAudioMuted = false;
    const aImg = document.getElementById('infoPopupAudioImg');
    if (aImg) aImg.src = 'icon/audio.png';

/* silence all active audios immediately when popup opens */
    if (currentInstructionAudio) currentInstructionAudio.volume = 0;
    if (motionCurrentAudio) motionCurrentAudio.volume = 0;
    if (ppCurrentAudio) ppCurrentAudio.volume = 0;
    if (activeGameAudio) activeGameAudio.volume = 0;

    /* play new audio */
    if (audioSrc) {

      infoAudio = new Audio(audioSrc);
      infoAudio.play().catch(() => {});
      infoAudio.addEventListener('ended', () => {
        infoAudio = null;
        /* restore all audios when info audio finishes */
if (currentInstructionAudio) currentInstructionAudio.volume = 1;
        if (motionCurrentAudio) motionCurrentAudio.volume = 1;
        if (ppCurrentAudio) ppCurrentAudio.volume = 1;
        if (activeGameAudio) activeGameAudio.volume = 1;
      });
    }
  }

  document.querySelectorAll('.page').forEach(page => {
    const infoBtn = page.querySelector('[aria-label="Info"]');
    if (!infoBtn) return;

    let infoImg = null;
let infoAudioFile = null;
    if (page.id === 'page-home' || page.id === 'page-index') {
      infoImg = 'icon/simulation-info.png';
      infoAudioFile = 'audio/Infos/Simulation.mp3';
    } else if (page.id === 'page-force') {
      infoImg = 'icon/Force-info.png';
      infoAudioFile = 'audio/Infos/Force.mp3';
    } else if (page.id === 'page-motion') {
      infoImg = 'icon/motion-info.png';
      infoAudioFile = 'audio/Infos/Motion.mp3';
    } else if (page.id === 'page-pushpull') {
      infoImg = 'icon/Pushandpull-info.png';
      infoAudioFile = 'audio/Infos/pushandpull.mp3';
    }

    if (infoImg) {
      infoBtn.addEventListener('click', () => showInfoPopup(infoImg, infoAudioFile));
    }
  });

  /* ═══════════════════════════════════════════════════════
     PAGE NAVIGATION
  ═══════════════════════════════════════════════════════ */
const pageHome  = document.getElementById('page-home');
  const pageIndex = document.getElementById('page-index');
  const pageForce = document.getElementById('page-force');
  const pageMotion = document.getElementById('page-motion');
  const pagePushPull = document.getElementById('page-pushpull');
  const playBtn       = document.getElementById('playBtn');
  const backBtn       = document.getElementById('backBtn');
  const forceBackBtn  = document.getElementById('forceBackBtn');
  const motionBackBtn = document.getElementById('motionBackBtn');
  const pushpullBackBtn = document.getElementById('pushpullBackBtn');
  const rotateOverlay = document.getElementById('rotateOverlay');

  function navigateTo(from, to) {
    if (!from || !to || from === to) return;
    const popup = document.getElementById('resultPopup');
    if (popup) popup.style.display = 'none';
    from.classList.add('slide-out');
    from.addEventListener('animationend', function onOut() {
      from.removeEventListener('animationend', onOut);
      from.classList.remove('active', 'slide-out');
      to.classList.add('active', 'slide-in');
      to.addEventListener('animationend', function onIn() {
        to.removeEventListener('animationend', onIn);
        to.classList.remove('slide-in');
      }, { once: true });
    }, { once: true });
  }

if (playBtn)      playBtn.addEventListener('click',      () => navigateTo(pageHome, pageIndex));
  if (backBtn)      backBtn.addEventListener('click',      () => { resetForceGame(); navigateTo(pageIndex, pageHome); });
  if (forceBackBtn) forceBackBtn.addEventListener('click', () => { resetForceGame(); navigateTo(pageForce, pageIndex); });
if (motionBackBtn) motionBackBtn.addEventListener('click', () => { resetMotionGame(); navigateTo(pageMotion, pageIndex); });
  if (pushpullBackBtn) pushpullBackBtn.addEventListener('click', () => { resetPushPullGame(); navigateTo(pagePushPull, pageIndex); });

document.querySelectorAll('.menu-btn').forEach(btn => {
    /* add info icon inside each menu button */
    const infoIcon = document.createElement('img');
    infoIcon.src = 'icon/info.png';
    infoIcon.className = 'menu-btn-info-icon';
    btn.appendChild(infoIcon);

infoIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = btn.getAttribute('aria-label');
      if (label === 'Force')     showInfoPopup('icon/Force-info.png',        'audio/Infos/Force.mp3');
      if (label === 'Motion')    showInfoPopup('icon/motion-info.png',       'audio/Infos/Motion.mp3');
      if (label === 'Push/Pull') showInfoPopup('icon/Pushandpull-info.png',  'audio/Infos/pushandpull.mp3');
    });

    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-label') === 'Force') {
        resetForceGame();
        navigateTo(pageIndex, pageForce);
   } else if (btn.getAttribute('aria-label') === 'Motion') {
        navigateTo(pageIndex, pageMotion);
        setTimeout(() => {
          startMotionGame();
        }, 500);
      } else if (btn.getAttribute('aria-label') === 'Push/Pull') {
        navigateTo(pageIndex, pagePushPull);
        setTimeout(() => {
          startPushPullGame();
        }, 500);
      }
    });
  });

  /* ═══════════════════════════════════════════════════════
     FULLSCREEN + MUSIC
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('[aria-label="Fullscreen"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    });
  });
const bgMusic = new Audio('audio/Main-version.wav');
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  bgMusic.muted = true;
  bgMusic.play().catch(() => {});

  let musicOn = false;

  function updateMusicBtns() {
    document.querySelectorAll('[aria-label="Music"]').forEach(btn => {
      const img = btn.querySelector('img');
      if (img) img.src = musicOn ? 'icon/Music.png' : 'icon/Music-2.png';
    });
  }

  document.querySelectorAll('[aria-label="Music"]').forEach(btn => {
    btn.addEventListener('click', () => {
      musicOn = !musicOn;
      bgMusic.muted = !musicOn;
      updateMusicBtns();
    });
  });

  updateMusicBtns();

  /* ═══════════════════════════════════════════════════════
     ROTATE OVERLAY
  ═══════════════════════════════════════════════════════ */
  function checkOrientation() {
    const narrow  = window.innerWidth <= 600 || window.innerHeight <= 600;
    const portrait = window.innerHeight > window.innerWidth;
    rotateOverlay.style.display = (narrow && portrait) ? 'flex' : 'none';
  }
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 120));
  checkOrientation();

  /* ═══════════════════════════════════════════════════════
     FORCE PAGE — STATE
  ═══════════════════════════════════════════════════════ */

  /*
    scenarioCounter[object][force] = number of times played (max 2)
    After 2 plays, that force button becomes disabled for that object.
    Switching object resets nothing — each object has its own counter.
  */
  const scenarioCounter = {
    ball:   { gentle: 0, strong: 0 },
    trolly: { gentle: 0, strong: 0 },
    box:    { gentle: 0, strong: 0 },
  };

let selectedObject = null;   // 'ball' | 'trolly' | 'box'
  let selectedForce  = null;   // 'gentle' | 'strong'
  let isAnimating    = false;
  let currentRound   = 1;      // 1 = right pyramid, 2 = center pyramid
  /* DOM refs */
  const forceInstruction = document.querySelector('.force-instruction');
  const forceCards       = document.querySelector('.force-cards');
  const forcePlayCard    = document.querySelector('.force-play-card');
  const playForceBtn     = document.getElementById('playForceBtn');
  const trackObject      = document.getElementById('trackObject');
  const trackBoy         = document.querySelector('.track-boy');
  const blocksStack      = document.querySelector('.blocks-stack');
  const forceTrackContent = document.querySelector('.force-track__content');

  /* ═══════════════════════════════════════════════════════
     STEP 1 — INSTRUCTION TEXT SEQUENCE
  ═══════════════════════════════════════════════════════ */
function runInstructionSequence(cb) {
    if (!forceInstruction) { cb && cb(); return; }

    const lines = [
      forceInstruction.querySelector('.instr-line1'),
      forceInstruction.querySelector('.instr-line2'),
      forceInstruction.querySelector('.instr-line3'),
    ];
    const audios = [
      document.getElementById('audioBtn1'),
      document.getElementById('audioBtn2'),
      document.getElementById('audioBtn3'),
    ];

    /* reset all */
    lines.forEach(l => l && l.classList.remove('line-visible'));
    audios.forEach(a => a && a.classList.remove('audio-visible'));

    function showLine(index) {
      if (index >= lines.length) {
        setTimeout(() => { cb && cb(); }, 400);
        return;
      }

      const line  = lines[index];
      const audio = audios[index];

      /* hide previous line */
      if (index > 0) {
        lines[index - 1].classList.remove('line-visible');
        audios[index - 1] && audios[index - 1].classList.remove('audio-visible');
      }

setTimeout(() => {
        if (line) line.classList.add('line-visible');

        /* play audio for this line, move to next line when it ends */
  const lineAudio = playGameAudio(`audio/ForceSimulation/0${index + 1}.mp3`);
        lineAudio.muted = !!window.__instructionMuted;
        if (lineAudio.muted) lineAudio.volume = 0;
        currentInstructionAudio = lineAudio;

        const goNext = () => {
          if (audio) audio.classList.remove('audio-visible');
          if (line) line.classList.remove('line-visible');
          showLine(index + 1);
        };

lineAudio.addEventListener('ended', goNext);
        lineAudio.addEventListener('error', goNext);

        lineAudio.play().catch(() => {
          /* if audio fails to play, fall back to timed transition */
          setTimeout(goNext, 1200);
        });

     /* show audio button shortly after line appears */
        setTimeout(() => {
          if (audio) audio.classList.add('audio-visible');
        }, 500);

        /* mute toggle for instruction audio */
        if (audio && !audio.__muteBound) {
          audio.__muteBound = true;
          audio.addEventListener('click', () => {
            window.__instructionMuted = !window.__instructionMuted;
            const img = audio.querySelector('img');
            if (img) {
              img.src = window.__instructionMuted ? 'icon/mute.png' : 'icon/audio.png';
            }
            /* apply to all instruction audio icons */
            audios.forEach(a => {
              if (!a) return;
              const aImg = a.querySelector('img');
              if (aImg) aImg.src = window.__instructionMuted ? 'icon/mute.png' : 'icon/audio.png';
            });
        if (currentInstructionAudio) {
              currentInstructionAudio.muted = window.__instructionMuted;
            }
          });
        }
      }, 300);
    }

    showLine(0);
  }

/* ═══════════════════════════════════════════════════════
     STEP 2 — SHOW CARDS SEQUENTIALLY
  ═══════════════════════════════════════════════════════ */
  function showCard1() {
    if (!forceCards) return;
    forceCards.classList.add('cards-visible');
    const card1 = forceCards.children[0];
    if (card1) card1.classList.add('card-in');
    setStepGuide(1);
  }

  function showCard2() {
    if (!forceCards) return;
    const card2 = forceCards.children[1];
    if (card2) card2.classList.add('card-in');
    setStepGuide(2);
  }

  function showPlayCard() {
    if (forcePlayCard) forcePlayCard.classList.add('play-card-in');
    setStepGuide(3);
  }

/* ═══════════════════════════════════════════════════════
     STEP GUIDE — glow + message box + spotlight per step
  ═══════════════════════════════════════════════════════ */
 let currentStep = 0;
  let idleAudioInterval = null;
  let confirmTimeout = null;
  let currentInstructionAudio = null;

 const clapSound = document.getElementById('clapSound');
if (clapSound) clapSound.src = 'audio/claping.mp3';

  function getStepCards() {
    return {
      1: { card: document.getElementById('card1'), msg: document.getElementById('msgCard1') },
      2: { card: document.getElementById('card2'), msg: document.getElementById('msgCard2') },
      3: { card: document.getElementById('card3'), msg: null },
    };
  }

  function setStepGuide(step) {
    currentStep = step;
    clearStepTimers();

    const cards = getStepCards();

    /* reset all cards: remove glow, dim, confirming state */
    Object.values(cards).forEach(({ card, msg }) => {
      if (card) {
        const frame = card.querySelector('.force-card__frame');
        if (frame) frame.classList.remove('step-glow');
        card.classList.remove('spotlight-active', 'spotlight-dim', 'card-confirming');
      }
      if (msg) msg.classList.remove('msg-visible');
    });

    const active = cards[step];
    if (!active || !active.card) return;

    /* spotlight: active card sharp, others dimmed */
    Object.entries(cards).forEach(([key, { card }]) => {
      if (!card) return;
      if (Number(key) === step) {
        card.classList.add('spotlight-active');
        const frame = card.querySelector('.force-card__frame');
        if (frame) frame.classList.add('step-glow');
      } else {
        card.classList.add('spotlight-dim');
      }
    });

/* show message + idle audio only after 10s of no interaction */
    idleAudioInterval = setTimeout(() => {
      if (active.msg) {
        active.msg.classList.add('msg-visible');
      }
      const idleSrcMap = {
        1: 'audio/ForceSimulation/selecttheobject.mp3',
        2: 'audio/ForceSimulation/pickaforce.mp3',
        3: 'audio/ForceSimulation/pressplaybutton.mp3',
      };
      const idleSrc = idleSrcMap[step];
      if (idleSrc) {
        if (idleGameAudio) { idleGameAudio.pause(); idleGameAudio.currentTime = 0; }
        idleGameAudio = new Audio(idleSrc);
        idleGameAudio.volume = infoAudio ? 0 : 1;
        idleGameAudio.play().catch(() => {});
      }
      /* repeat every 10s until user interacts */
      idleAudioInterval = setInterval(() => {
        if (idleGameAudio) { idleGameAudio.pause(); idleGameAudio.currentTime = 0; }
        idleGameAudio = new Audio(idleSrc);
        idleGameAudio.volume = infoAudio ? 0 : 1;
        idleGameAudio.play().catch(() => {});
      }, 10000);
    }, 10000);
  }

let idleGameAudio = null;

  function clearStepTimers() {
    if (idleAudioInterval) {
      clearTimeout(idleAudioInterval);
      idleAudioInterval = null;
    }
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
      confirmTimeout = null;
    }
    /* stop only idle hint audio, not result/game audio */
    if (idleGameAudio) {
      idleGameAudio.pause();
      idleGameAudio.currentTime = 0;
      idleGameAudio = null;
    }
  }

  /* called when user selects an option in the active card (1 or 2) */
  function onStepSelection(step) {
    if (step !== currentStep) return;

    /* stop idle nudge */
if (idleAudioInterval) {
      clearTimeout(idleAudioInterval);
      idleAudioInterval = null;
    }
    const cards = getStepCards();
    const active = cards[step];
    if (!active || !active.card) return;

    if (active.msg) active.msg.classList.remove('msg-visible');

    /* scale up the active card */
    active.card.classList.add('card-confirming');

    /* 5s confirm window — resets if selection changes again */
    if (confirmTimeout) clearTimeout(confirmTimeout);
    confirmTimeout = setTimeout(() => {
      active.card.classList.remove('card-confirming');
      /* lock answer & advance to next step */
      if (step === 1) {
        showCard2();
      } else if (step === 2) {
        showPlayCard();
      }
   }, 2000);
  }

  /* called when user clicks Play in card 3 */
  function onCard3Played() {
    clearStepTimers();
  }

  /* ═══════════════════════════════════════════════════════
     OBJECT SELECTION
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.obj-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAnimating) return;

    const obj = btn.dataset.object;
      selectedObject = obj;
      selectedForce  = null;
      currentRound   = 1;

      /* reset pyramid to right side, fresh */
      window.__nextBlockPos = 'right';
      rebuildBlocks();
      positionBlocks('right');
      /* visual selection */
      document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

  /* update track object */
     if (trackObject) {
  trackObject.src = `icon/${obj}.png`;
  trackObject.className = 'track-object obj-' + obj;
  const yOffset = (obj === 'box') ? 30 : (obj === 'trolly') ? -15 : 0;
  trackObject.style.transition = 'none';
  trackObject.style.transform  = `translateX(0) translateY(${yOffset}px) rotate(0deg)`;
}

    /* update Card 2 force buttons based on remaining plays */
      updateForceButtons();

      /* hide play card and reset card2 visibility for fresh start */
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');
      const card2El = forceCards ? forceCards.children[1] : null;
      if (card2El) card2El.classList.remove('card-in');

      /* re-enable object buttons in case they were locked */
      document.querySelectorAll('.obj-btn:not(.btn-exhausted)').forEach(b => { b.disabled = false; });

/* reset spotlight to step 1 (card1 active) */
      setStepGuide(1);

      /* only trigger confirm-advance logic for real user clicks, not auto-advance */
      if (!btn.__autoClick) {
        onStepSelection(1);
      }
    });
  });
 

function updateForceButtons() {
    if (!selectedObject) return;
    document.querySelectorAll('.force-type-btn').forEach(btn => {
      btn.classList.remove('selected', 'btn-exhausted');
      btn.disabled = false;
    });
  }

  /* ═══════════════════════════════════════════════════════
     FORCE SELECTION
  ═══════════════════════════════════════════════════════ */
document.querySelectorAll('.force-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAnimating || btn.classList.contains('btn-exhausted')) return;
      if (!selectedObject) return;

      selectedForce = btn.dataset.force;
      document.querySelectorAll('.force-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

/* trigger step-guide selection logic for Card 2 */
      onStepSelection(2);
    });
  });
  /* ═══════════════════════════════════════════════════════
     PLAY BUTTON
  ═══════════════════════════════════════════════════════ */
if (playForceBtn) {
    playForceBtn.addEventListener('click', () => {
      if (isAnimating || !selectedObject || !selectedForce) return;
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');
      onCard3Played();
      runScenario();
    });
  }
  /* ═══════════════════════════════════════════════════════
     SCENARIO LOGIC
  ═══════════════════════════════════════════════════════ */
function runScenario() {
    isAnimating = true;

    if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');

    scenarioCounter[selectedObject][selectedForce]++;
    rebuildBlocks();

    const blockPos = (currentRound === 1) ? 'right' : 'center';
    positionBlocks(blockPos);
    setControlsEnabled(false);

    const isPushObject = (selectedObject === 'trolly' || selectedObject === 'box');

    function afterLaunch() {
      if (selectedForce === 'strong' || (selectedForce === 'gentle' && blockPos === 'center')) {
        if (selectedForce === 'gentle' && blockPos === 'center') {
          const trackWidth2 = forceTrackContent ? forceTrackContent.offsetWidth : window.innerWidth;
          const currentX = trackWidth2 * 0.38;
          const yOffset = (selectedObject === 'box') ? 30 : (selectedObject === 'trolly') ? -15 : 0;
          const spinBack = (selectedObject === 'ball') ? '170deg' : '0deg';
          trackObject.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          trackObject.style.transform  = `translateX(${currentX - 140}px) translateY(${yOffset}px) rotate(${spinBack})`;

          animateBlocksBreak(selectedForce, () => {
            finishScenario(blockPos);
          });
        } else {
          animateBlocksBreak(selectedForce, () => {
            finishScenario(blockPos);
          });
        }
      } else {
        setTimeout(() => {
          finishScenario(blockPos);
        }, 600);
      }
    }

    animateBoyGif((boyFrame) => {
      if (isPushObject) {
      if (boyFrame === 9) {
          animateObjectLaunch(selectedForce, blockPos, null, 1);
        } else if (boyFrame === 19) {
          animateObjectLaunch(selectedForce, blockPos, afterLaunch, 2);
        }
        return;
      }

      /* ball */
      animateObjectLaunch(selectedForce, blockPos, afterLaunch);
    });
  }
  /* ═══════════════════════════════════════════════════════
     BLOCK POSITIONING
  ═══════════════════════════════════════════════════════ */
function positionBlocks(pos) {
    if (!blocksStack) return;
    const trackRight = document.querySelector('.track-right');
    if (!trackRight) return;

    /* capture the right-side bottom offset BEFORE switching to absolute,
       while the element is still flex-positioned, so we get its true
       distance from the bottom of the container */
    trackRight.style.transition   = 'none';
    trackRight.style.position     = '';
    trackRight.style.left         = '';
    trackRight.style.right        = '';
    trackRight.style.transform    = '';
    trackRight.style.bottom       = '';
    trackRight.style.marginBottom = 'clamp(10px, 3vh, 40px)';

    if (pos === 'center') {
      const parent = trackRight.parentElement;
      const parentRect = parent.getBoundingClientRect();
      const selfRect   = trackRight.getBoundingClientRect();

      /* exact distance from bottom of container to bottom of stack, as it sits on the right */
      const bottomPx = parentRect.bottom - selfRect.bottom;

      trackRight.style.position     = 'absolute';
      trackRight.style.left         = '60%';
      trackRight.style.right        = '';
      trackRight.style.transform    = 'translateX(-50%)';
      trackRight.style.bottom       = bottomPx + 'px';
      trackRight.style.marginBottom = '0';
    }
    /* else: stays in default flex-positioned right state set above */
  }

  /* ═══════════════════════════════════════════════════════
     BOY ENTER ANIMATION
  ═══════════════════════════════════════════════════════ */
function animateBoyGif(cb) {
    if (!trackBoy) { cb(); return; }

    const isPushObject = (selectedObject === 'trolly' || selectedObject === 'box');
    const folder      = isPushObject ? 'Gentle Push' : 'KICK';
    const totalFrames = isPushObject ? 36 : 34;
    const ballFrame   = isPushObject ? 26 : 19;
    const resetFrame  = isPushObject ? 'Gentle Push/Final00.png' : 'KICK/Final00.png';

    /* preload all frames first so swapping is instant/smooth */
    const frameSrcs = [];
    for (let f = 0; f < totalFrames; f++) {
      const padded = String(f).padStart(2, '0');
      const src = `icon/${folder}/Final${padded}.png`;
      frameSrcs.push(src);
      const img = new Image();
      img.src = src;
    }

    const fps = (selectedForce === 'strong') ? 80 : 24;
    const ms  = Math.round(1000 / fps);
    let frame = 0;
    let ballLaunched = false;

    /* show frame 0 immediately */
    trackBoy.src = frameSrcs[0];

    window.__boyAnimInterval = setInterval(() => {
      frame++;

    if (frame >= totalFrames) {
        clearInterval(window.__boyAnimInterval);
        window.__boyAnimInterval = null;
        trackBoy.src = `icon/${resetFrame}`;
        return;
      }

      trackBoy.src = frameSrcs[frame];

if (isPushObject) {
        if (frame === 9) {
          cb(frame);
        } else if (frame === 19 && !ballLaunched) {
          ballLaunched = true;
          cb(frame);
        }
      } else if (frame >= ballFrame && !ballLaunched) {
        ballLaunched = true;
        cb(frame);
      }
    }, ms);
  }
  /* ═══════════════════════════════════════════════════════
     BOY EXIT ANIMATION
  ═══════════════════════════════════════════════════════ */
  function animateBoyExit(cb) {
    if (!trackBoy) { cb(); return; }
    trackBoy.style.transition = 'transform 0.7s cubic-bezier(0.55,0,1,0.45)';
    trackBoy.style.transform = 'translateX(-120vw)';
    trackBoy.addEventListener('transitionend', function onExit() {
      trackBoy.removeEventListener('transitionend', onExit);
      cb();
    }, { once: true });
  }

  /* ═══════════════════════════════════════════════════════
     OBJECT LAUNCH ANIMATION
  ═══════════════════════════════════════════════════════ */
function animateObjectLaunch(force, blockPos, cb, phase) {
    if (!trackObject) { cb && cb(); return; }

    const trackWidth   = forceTrackContent ? forceTrackContent.offsetWidth : window.innerWidth;
    const isGentle     = force === 'gentle';
    const isPushObject = (selectedObject === 'trolly' || selectedObject === 'box');

    const targetX = isGentle
      ? trackWidth * 0.38
      : (blockPos === 'center' ? trackWidth * 0.48 : trackWidth * 0.80);

    const yOffset = (selectedObject === 'box') ? 30 : (selectedObject === 'trolly') ? -15 : 0;

    if (isPushObject) {
  if (phase === 1) {
        /* small slow slide — frames 9 to 26 */
        const slideX = 50; // small slide distance
        const slideDuration = 700;

        trackObject.style.transition = `transform ${slideDuration}ms linear`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            trackObject.style.transform = `translateX(${slideX}px) translateY(${yOffset}px) rotate(0deg)`;
          });
        });
        /* no cb — phase 2 continues seamlessly at frame 26 */
        return;
      }

if (phase === 2) {
        /* read current computed position to avoid any snap/jerk */
        const computedTransform = getComputedStyle(trackObject).transform;
        let currentX = 0;
        if (computedTransform && computedTransform !== 'none') {
          const matrix = computedTransform.match(/matrix\(([^)]+)\)/);
          if (matrix) {
            const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
            currentX = values[4] || 0;
          }
        }

        const fastDuration = isGentle ? 700 : 400;
        const easing = isGentle
          ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          : 'cubic-bezier(0.1, 0.0, 0.2, 1.0)';

        /* lock current position first with no transition, then animate to target */
        trackObject.style.transition = 'none';
        trackObject.style.transform  = `translateX(${currentX}px) translateY(${yOffset}px) rotate(0deg)`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            trackObject.style.transition = `transform ${fastDuration}ms ${easing}`;
            trackObject.style.transform  = `translateX(${targetX}px) translateY(${yOffset}px) rotate(0deg)`;
          });
        });

        setTimeout(cb, fastDuration);
        return;
      }
    }

    /* BALL: unchanged single-phase animation */
    const duration = isGentle ? 1400 : 1000;

    trackObject.style.transition = 'none';
    trackObject.style.transform  = `translateX(0) translateY(${yOffset}px) rotate(0deg)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const spin = (selectedObject === 'ball')
          ? (isGentle ? '180deg' : '1440deg')
          : '0deg';
        const easing = isGentle
          ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          : 'cubic-bezier(0.1, 0.0, 0.2, 1.0)';

        trackObject.style.transition = `transform ${duration}ms ${easing}`;
        trackObject.style.transform  = `translateX(${targetX}px) translateY(${yOffset}px) rotate(${spin})`;

        setTimeout(cb, isGentle ? duration - 200 : duration - 500);
      });
    });
  }
  /* ═══════════════════════════════════════════════════════
     BLOCKS BREAK ANIMATION
  ═══════════════════════════════════════════════════════ */
function animateBlocksBreak(force, cb) {
    const blocks = blocksStack ? blocksStack.querySelectorAll('.block-img') : [];
    if (!blocks.length) { setTimeout(cb, 400); return; }

    const isGentle = force === 'gentle';
    const trackRect = forceTrackContent ? forceTrackContent.getBoundingClientRect() : null;

    blocks.forEach((block, i) => {
      const delay    = i * (isGentle ? 80 : 40);
      const blockRect = block.getBoundingClientRect();

      /* floor = where block finally rests on track surface */
   const floorY   = trackRect ? (trackRect.bottom - blockRect.height * 2.5) - blockRect.top : 10;

      /* each block flies/topples in a different direction */
      const side     = (Math.random() > 0.5 ? 1 : -1);
    const bs = blockRect.height; // responsive unit based on actual block size

const spreadX  = isGentle
        ? side * (Math.random() * bs * 0.5 + bs * 0.25)   // small toppling distance
        : side * (Math.random() * bs * 1.2 + bs * 0.6);   // big launch distance, kept on-screen

      const rot      = isGentle
        ? (Math.random() - 0.5) * 90         // small tip-over rotation
        : (Math.random() - 0.5) * 500;       // big spin

      /* arc peak — how high it goes before falling */
      const arcPeak  = isGentle
        ? floorY - (Math.random() * bs * 0.35 + bs * 0.17) // barely lifts
        : floorY - (Math.random() * bs * 2.3 + bs * 1.6);
if (isGentle) {
        /* GENTLE: only top + middle row fall (with bounce+roll), bottom row stays completely still */
        const isBottomRow = block.classList.contains('block-b1') ||
                            block.classList.contains('block-b2') ||
                            block.classList.contains('block-b3');

        if (isBottomRow) {
          /* bottom row: no movement at all */
        } else {
          setTimeout(() => {
     /* TOP + MIDDLE: fall -> bounce -> roll/settle (3 phases) */
            const gapX = side * (Math.random() * 25 + 35);
            const landY = floorY + 20; // push down further so it touches ground
            const bounceUp = landY - (Math.random() * 25 + 15);
            const rollX = gapX + side * (Math.random() * 15 + 10);
/* phase 1: fall down to floor */
            block.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.6, 1)';
            block.style.transform  = `translate(${gapX * 0.5}px, ${landY}px) rotate(${rot * 0.3}deg)`;

            /* phase 2: small bounce up */
            setTimeout(() => {
              block.style.transition = 'transform 0.25s ease-out';
              block.style.transform  = `translate(${gapX * 0.6}px, ${bounceUp}px) rotate(${rot * 0.5}deg)`;

              /* phase 3: settle down + roll sideways to final position */
              setTimeout(() => {
                block.style.transition = 'transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1)';
                block.style.transform  = `translate(${rollX}px, ${landY}px) rotate(${rot}deg)`;
                block.style.opacity    = '1';
              }, 250);
            }, 500);
          }, delay);
        }
      } else {
        /* STRONG: existing fast multi-phase break */
        setTimeout(() => {

          /* phase 1 — shoot upward and sideways (impact explosion) */
          block.style.transition = 'transform 0.22s cubic-bezier(0.1, 0, 0.3, 1)';
          block.style.transform  = `translate(${spreadX * 0.35}px, ${arcPeak}px) rotate(${rot * 0.3}deg)`;
          block.style.opacity    = '1';

          /* phase 2 — fall toward floor fast (gravity) */
          setTimeout(() => {
            block.style.transition = 'transform 0.3s cubic-bezier(0.55, 0, 1, 0.8)';
            block.style.transform  = `translate(${spreadX * 0.85}px, ${floorY + 14}px) rotate(${rot * 0.8}deg)`;
            block.style.opacity    = '1';

            /* phase 3 — first bounce (small, fast) */
            setTimeout(() => {
              block.style.transition = 'transform 0.16s cubic-bezier(0.2, 0, 0.6, 1)';
              block.style.transform  = `translate(${spreadX * 0.9}px, ${floorY - 18}px) rotate(${rot * 0.85}deg)`;

              /* phase 4 — settle back on floor (final rest) */
              setTimeout(() => {
                block.style.transition = 'transform 0.18s cubic-bezier(0.55, 0, 1, 1)';
                block.style.transform  = `translate(${spreadX}px, ${floorY}px) rotate(${rot}deg)`;
                block.style.opacity    = '1';
              }, 160);

            }, 300);

          }, 230);

        }, delay);
      }
    });

const totalTime = isGentle
      ? blocks.length * 80 + 2100
      : blocks.length * 40 + 950;

    setTimeout(cb, totalTime);
  }


function showForceCompletePopup() {
    let popup = document.getElementById('forceCompletePopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'forceCompletePopup';

      const box = document.createElement('div');
      box.className = 'fc-box';

      const confettiImg = document.createElement('img');
      confettiImg.className = 'fc-confetti';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'fc-img-wrap';

      const mainImg = document.createElement('img');
      mainImg.src = 'icon/Simulationcomplete.png';
      mainImg.className = 'fc-main-img';

      const btnRow = document.createElement('div');
      btnRow.className = 'fc-btn-row';

      const replayBtn = document.createElement('button');
     replayBtn.className = 'fc-btn';
      replayBtn.setAttribute('aria-label', 'Replay');
      const replayImg = document.createElement('img');
      replayImg.src = 'icon/RePlay.png';
      replayBtn.appendChild(replayImg);
      replayBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        resetForceGame();
        setTimeout(() => {
          runInstructionSequence(() => { showCard1(); });
        }, 300);
      });

      const backBtn2 = document.createElement('button');
 backBtn2.className = 'fc-btn';
      backBtn2.setAttribute('aria-label', 'Back');
      const backImg = document.createElement('img');
      backImg.src = 'icon/back.png';
      backBtn2.appendChild(backImg);
      backBtn2.addEventListener('click', () => {
        popup.style.display = 'none';
        resetForceGame();
        navigateTo(pageForce, pageIndex);
      });

      btnRow.appendChild(replayBtn);
      btnRow.appendChild(backBtn2);
      imgWrap.appendChild(mainImg);
      imgWrap.appendChild(btnRow);
      box.appendChild(confettiImg);
      box.appendChild(imgWrap);
      popup.appendChild(box);
      document.body.appendChild(popup);
    }

    const confetti = popup.querySelector('.fc-confetti');
    if (confetti) {
      confetti.style.display = 'block';
      confetti.src = 'icon/Sequence-01.gif?t=' + Date.now();
      setTimeout(() => { confetti.style.display = 'none'; }, 3000);
    }

    popup.style.display = 'flex';

    const clap = new Audio('audio/claping.mp3');
    clap.play().catch(() => {});
    const party = new Audio('audio/Party Popper Explode 02.wav');
    party.play().catch(() => {});
  }


  /* ═══════════════════════════════════════════════════════
     FINISH SCENARIO — RESET FOR NEXT PLAY
  ═══════════════════════════════════════════════════════ */
function finishScenario(blockPos) {
    /* DO NOT rebuild blocks here — keep scattered state visible */

 /* show result popup based on outcome */
let popupMsg = '';
    let popupAudio = '';
    const objAudioMap = { ball: '05-ball', trolly: '06-cart', box: '07-box' };
if (selectedForce === 'gentle' && blockPos !== 'center') {
      popupMsg = '';
      popupAudio = '';
} else if (selectedForce === 'strong') {
      popupAudio = objAudioMap[selectedObject];
    } else if (selectedForce === 'gentle' && blockPos === 'center') {
      popupAudio = objAudioMap[selectedObject];
    }

 if (selectedForce === 'gentle' && blockPos !== 'center') {
      // show sim01.png centered, highlight after audio ends, then auto-refresh
      const simImg = document.createElement('img');
      simImg.src = 'icon/sim01.png';
      simImg.style.cssText = `
        position: fixed; left: 50%; top: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        width: clamp(200px, 40vw, 500px);
        opacity: 1;
        transition: filter 0.4s ease, opacity 0.4s ease;
        border-radius: 16px;
      `;
      document.body.appendChild(simImg);

    const gentleAudio = playGameAudio('audio/ForceSimulation/04.mp3');

      const onAudioEnd = () => {
      simImg.style.filter = 'drop-shadow(0 0 18px rgba(0,200,255,1))';
        setTimeout(() => {
          document.body.removeChild(simImg);
          rebuildBlocks();
          if (trackObject) {
            const yOffset = (selectedObject === 'box') ? 30 : (selectedObject === 'trolly') ? -15 : 0;
            trackObject.style.transition = 'none';
            trackObject.style.transform = `translateX(0) translateY(${yOffset}px) rotate(0deg)`;
          }
          positionBlocks('right');
          selectedForce = null;
          updateForceButtons();
          showCard2();
        }, 1200);
      };

      gentleAudio.addEventListener('ended', onAudioEnd);
      gentleAudio.addEventListener('error', onAudioEnd);

      isAnimating = false;
      setControlsEnabled(true);
      return;
    }

if (selectedForce === 'strong' || (selectedForce === 'gentle' && blockPos === 'center')) {
      const imgMap = { ball: 'sim02.png', trolly: 'sim02_2.png', box: 'sim02_3.png' };
      const simImg = document.createElement('img');
      simImg.src = 'icon/' + imgMap[selectedObject];
      simImg.style.cssText = `position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;width:clamp(200px,40vw,500px);opacity:1;transition:filter 0.4s ease;border-radius:16px;`;
      document.body.appendChild(simImg);
     const resultAudio = playGameAudio(`audio/ForceSimulation/${popupAudio}.mp3`);
      const onAudioEnd = () => {
        simImg.style.filter = 'drop-shadow(0 0 18px rgba(0,200,255,1))';
     setTimeout(() => {
          document.body.removeChild(simImg);
          rebuildBlocks();
          if (trackObject) {
            const yOffset = (selectedObject === 'box') ? 30 : (selectedObject === 'trolly') ? -15 : 0;
            trackObject.style.transition = 'none';
            trackObject.style.transform = `translateX(0) translateY(${yOffset}px) rotate(0deg)`;
          }
          const justFinishedRound2 = (selectedObject === null);
       if (justFinishedRound2) {
            const nextBtn = document.querySelector('.obj-btn:not(.btn-exhausted)');
            if (nextBtn) { nextBtn.__autoClick = true; nextBtn.click(); nextBtn.__autoClick = false; }
            else { showForceCompletePopup(); }
          } else {
            const pos = (currentRound === 1) ? 'right' : 'center';
            positionBlocks(pos);
          }
        }, 1200);
      };
      resultAudio.addEventListener('ended', onAudioEnd);
      resultAudio.addEventListener('error', onAudioEnd);
    }

    /* reset boy position silently */
    if (trackBoy) {
      trackBoy.style.transition = 'none';
      trackBoy.style.transform  = 'translateX(0)';
    }

    isAnimating = false;

/* re-enable controls */
    setControlsEnabled(true);

/* check if blocks broke this play */
    const blocksBroke = (selectedForce === 'strong' || (selectedForce === 'gentle' && blockPos === 'center'));

if (blocksBroke && currentRound === 1) {
      /* Round 1 done → move to Round 2 (center pyramid), same object */
      currentRound = 2;
      selectedForce = null;
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');
      updateForceButtons();
      showCard2();

      /* lock object selection during round 2 */
      document.querySelectorAll('.obj-btn').forEach(b => { b.disabled = true; });

} else if (blocksBroke && currentRound === 2) {
      /* Round 2 done → object fully complete, advance to next object AFTER popup OK */
      const obj = selectedObject;
      const objBtn = document.querySelector(`.obj-btn[data-object="${obj}"]`);
      if (objBtn) {
        objBtn.classList.add('btn-exhausted');
        objBtn.disabled = true;
        objBtn.classList.remove('selected');
      }
selectedObject = null;
      selectedForce = null;
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');

      /* unlock remaining object buttons for next selection */
      document.querySelectorAll('.obj-btn:not(.btn-exhausted)').forEach(b => { b.disabled = false; });

 } else {
      /* blocks didn't break — keep retrying this round */
      updateForceButtons();
      selectedForce = null;
      showCard2();
    }
  }

/* ═══════════════════════════════════════════════════════
     REBUILD BLOCKS (after scatter)
  ═══════════════════════════════════════════════════════ */
  function rebuildBlocks() {
    if (!blocksStack) return;
    const blocks = blocksStack.querySelectorAll('.block-img');
    blocks.forEach(block => {
      block.style.transition = 'none';
      block.style.transform  = '';
      block.style.opacity    = '1';
    });
  }

  /* ═══════════════════════════════════════════════════════
     RESULT POPUP
  ═══════════════════════════════════════════════════════ */
function showResultPopup(message, onOk) {
    let popup = document.getElementById('resultPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'resultPopup';
    popup.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(10, 20, 50, 0.45);
        padding: 16px;
      `;
      const box = document.createElement('div');
      box.id = 'resultPopupBox';
  box.style.cssText = `
        position: relative;
        width: clamp(240px, 42vw, 500px);
        aspect-ratio: 4 / 3;
        text-align: center;
        font-family: Arial, sans-serif;
        animation: popupIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
      `;

  /* frame image */
      const frame = document.createElement('img');
      frame.src = 'icon/Asset1@4x.png';
      frame.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
        z-index: 1;
      `;

/* inner content wrapper */
      const inner = document.createElement('div');
inner.style.cssText = `
        position: absolute;
        inset: 5% 5% 14%;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: clamp(6px, 1.5vh, 16px);
        background: rgba(255,255,255,0.92);
        border-radius: clamp(8px, 1.5vw, 16px);
        padding: clamp(8px, 1.5vh, 18px) clamp(10px, 2vw, 22px);
      `;
      /* emoji icon */
      const icon = document.createElement('div');
      icon.id = 'resultPopupIcon';
      icon.style.cssText = `
        font-size: clamp(2rem, 4.5vw, 3rem);
        line-height: 1;
      `;

      /* message text */
      const msg = document.createElement('p');
      msg.id = 'resultPopupMsg';
      msg.style.cssText = `
        font-size: clamp(1rem, 2.2vw, 1.35rem);
        font-weight: 700;
        font-family: 'Comic', Arial, sans-serif;
        line-height: 1.45;
        color: #1a2a4e;
        margin: 0;
        padding: 0 clamp(8px, 2vw, 20px);
      `;

      /* OK button */
      const btn = document.createElement('button');
      btn.id = 'resultPopupOkBtn';
      btn.textContent = 'OK';
      btn.style.cssText = `
        display: inline-block;
        padding: clamp(6px, 1.2vh, 11px) clamp(24px, 5vw, 44px);
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #1a3a6b, #2e5fad);
        color: #fff;
        font-size: clamp(0.85rem, 1.6vw, 1rem);
        font-weight: 700;
        font-family: Arial, sans-serif;
        cursor: pointer;
        letter-spacing: 0.5px;
        box-shadow: 0 6px 20px rgba(30,80,180,0.35);
        transition: transform 0.15s;
      `;
      btn.onmouseover = () => { btn.style.transform = 'scale(1.06)'; };
      btn.onmouseout  = () => { btn.style.transform = 'scale(1)'; };
      btn.onmousedown = () => { btn.style.transform = 'scale(0.95)'; };
      btn.onmouseup   = () => { btn.style.transform = 'scale(1.06)'; };

      inner.appendChild(icon);
      inner.appendChild(msg);
      inner.appendChild(btn);
      box.appendChild(frame);
      box.appendChild(inner);
      popup.appendChild(box);
      document.body.appendChild(popup);

      /* inject keyframe once */
      if (!document.getElementById('popupKeyframes')) {
        const style = document.createElement('style');
        style.id = 'popupKeyframes';
        style.textContent = `
          @keyframes popupIn {
            from { opacity: 0; transform: scale(0.88) translateY(18px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    /* update icon based on message type */
    const icon = document.getElementById('resultPopupIcon');
    const msg  = document.getElementById('resultPopupMsg');

    if (message.includes('too gentle') || message.includes('gentle')) {
      icon.textContent = '';
    } else if (message.includes('Excellent') || message.includes('strong')) {
      icon.textContent = '';
    } else if (message.includes('Wow')) {
      icon.textContent = '';
    } else if (message.includes('Great job') || message.includes('completed')) {
      icon.textContent = '🏆';
    } else {
      icon.textContent = '✅';
    }

    msg.textContent = message;

    const okBtn = document.getElementById('resultPopupOkBtn');
    const newOkBtn = okBtn.cloneNode(true);
    newOkBtn.onmouseover = () => { newOkBtn.style.transform = 'scale(1.06)'; };
    newOkBtn.onmouseout  = () => { newOkBtn.style.transform = 'scale(1)'; };
    newOkBtn.onmousedown = () => { newOkBtn.style.transform = 'scale(0.95)'; };
    newOkBtn.onmouseup   = () => { newOkBtn.style.transform = 'scale(1.06)'; };
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    newOkBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      if (typeof onOk === 'function') onOk();
    });

    popup.style.display = 'flex';
  }

  function getObjectLabel() {
    if (selectedObject === 'trolly') return 'cart';
    return selectedObject; // 'ball' or 'box'
  }

  /* ═══════════════════════════════════════════════════════
     ENABLE / DISABLE CONTROLS
  ═══════════════════════════════════════════════════════ */
  function setControlsEnabled(enabled) {
    document.querySelectorAll('.obj-btn, .force-type-btn').forEach(btn => {
      if (!btn.classList.contains('btn-exhausted')) {
        btn.disabled = !enabled;
      }
    });
    if (playForceBtn) playForceBtn.disabled = !enabled;
  }

  /* ═══════════════════════════════════════════════════════
     RESET FORCE GAME (when navigating away)
  ═══════════════════════════════════════════════════════ */
function resetForceGame() {
    /* stop all audio */
    if (clapSound) { clapSound.pause(); clapSound.currentTime = 0; }
    if (currentInstructionAudio) { currentInstructionAudio.pause(); currentInstructionAudio.currentTime = 0; }

    /* stop any running boy animation interval */
    if (window.__boyAnimInterval) {
      clearInterval(window.__boyAnimInterval);
      window.__boyAnimInterval = null;
    }

    /* reset counters */
    Object.keys(scenarioCounter).forEach(obj => {
      scenarioCounter[obj].gentle = 0;
      scenarioCounter[obj].strong = 0;
    });

    selectedObject = null;
    selectedForce  = null;
    isAnimating    = false;

    /* reset UI */
    document.querySelectorAll('.obj-btn, .force-type-btn').forEach(btn => {
      btn.classList.remove('selected', 'btn-exhausted');
      btn.disabled = false;
    });

 if (forceCards) {
      forceCards.classList.remove('cards-visible');
      Array.from(forceCards.children).forEach(c => c.classList.remove('card-in'));
    }

  /* reset step guide + spotlight + timers */
    clearStepTimers();
    document.querySelectorAll('.force-card, .force-play-card').forEach(c => {
      c.classList.remove('spotlight-active', 'spotlight-dim', 'card-confirming');
      const frame = c.querySelector('.force-card__frame');
      if (frame) frame.classList.remove('step-glow');
    });
    document.querySelectorAll('.step-msg').forEach(m => m.classList.remove('msg-visible'));
    currentStep = 0;

    if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');

    if (trackObject) {
      trackObject.src = 'icon/ball.png';
trackObject.className = 'track-object obj-ball';
      trackObject.style.transition = 'none';
      trackObject.style.transform  = '';
    }

    if (trackBoy) {
      trackBoy.style.transition = 'none';
      trackBoy.style.transform  = 'translateX(0)';
    }

    rebuildBlocks();

    /* reset block position to right */
    const trackRight = document.querySelector('.track-right');
   if (trackRight) {
      trackRight.style.position     = '';
      trackRight.style.left         = '';
      trackRight.style.right        = '';
      trackRight.style.transform    = '';
      trackRight.style.bottom       = '';
      trackRight.style.marginBottom = 'clamp(10px, 4vh, 50px)';
    }

  /* mark as not animating so re-entry starts fresh */
    isAnimating = false;
    currentRound = 1;

    /* re-run instruction sequence */
 if (forceInstruction) {
      forceInstruction.querySelectorAll('.instr-line').forEach(l => l.classList.remove('line-visible'));
      document.querySelectorAll('.instr-audio-btn').forEach(a => a.classList.remove('audio-visible'));
    }
  }

  /* ═══════════════════════════════════════════════════════
     PAGE-FORCE ENTRY — trigger instruction sequence
  ═══════════════════════════════════════════════════════ */
function preloadBoyFrames() {
    const folders = [
      { folder: 'KICK', totalFrames: 34 },
      { folder: 'Gentle Push', totalFrames: 36 }
    ];
    folders.forEach(({ folder, totalFrames }) => {
      for (let f = 0; f < totalFrames; f++) {
        const padded = String(f).padStart(2, '0');
        const img = new Image();
        img.src = `icon/${folder}/Final${padded}.png`;
      }
    });
  }

  const menuForceBtns = document.querySelectorAll('.menu-btn[aria-label="Force"]');
  menuForceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      preloadBoyFrames();
      /* run instruction sequence then reveal card 1 */
      setTimeout(() => {
        runInstructionSequence(() => {
          showCard1();
        });
      }, 500);
    });
  });
/* ═══════════════════════════════════════
     PAGE-MOTION LOGIC
  ═══════════════════════════════════════ */

  const motionQuestions = [
    { q: 'Select the train that is not in motion.',    audio: '02', correct: 'not-moving', folder: '001' },
    { q: 'Select the fan that is in motion.',          audio: '03', correct: 'moving',     folder: '002' },
    { q: 'Select the vehicles that are in motion.',    audio: '04', correct: 'moving',     folder: '003' },
    { q: 'Select the dog that is not in motion.',      audio: '05', correct: 'not-moving', folder: '004' },
    { q: 'Select the girl that is in motion.',         audio: '06', correct: 'moving',     folder: '005' },
    { q: 'Select the boy who is not in motion.',       audio: '07', correct: 'not-moving', folder: '006' },
    { q: 'Select the tree that is in motion.',         audio: '08', correct: 'moving',     folder: '007' },
    { q: 'Select the cart which is not in motion.',    audio: '09', correct: 'not-moving', folder: '008' },
    { q: 'Select the image that shows motion.',        audio: '10', correct: 'moving',     folder: '009' },
    { q: 'Select the bird that is not in motion.',     audio: '11', correct: 'not-moving', folder: '010' },
  ];

  let motionCurrentQ   = 0;
  let motionAnswered   = false;
  let motionGifFrames  = [];
  let motionGifInterval = null;
  let motionGifPlaying  = false;
  let motionCurrentAudio = null;
  let motionCardsLocked  = true;

  const motionCardA      = document.getElementById('motionCardA');
  const motionCardB      = document.getElementById('motionCardB');
 const motionStaticImg  = document.getElementById('motionStaticImg');
  const motionGifImg     = document.getElementById('motionGifImg');
  const motionQuestionLine = document.getElementById('motionQuestionLine');
/* ── GIF control via img src swap ── */
function loadGifFrames(src, cb) {
    /* show static PNG by default */
    if (motionGifImg) {
      motionGifImg.src = 'icon/' + motionQuestions[motionCurrentQ].folder + '/With-motion.png';
    }
    cb && cb();
  }

  function playGifOnCanvas(src) {
    /* swap to gif on click — plays from start */
    if (motionGifImg) {
      motionGifImg.src = src + '?t=' + Date.now();
    }
  }

  function stopGif() {
    /* reset back to static PNG */
    const q = motionQuestions[motionCurrentQ];
    if (motionGifImg && q) {
      motionGifImg.src = 'icon/' + q.folder + '/With-motion.png';
    }
  }
  /* ── Load a question ── */
  function loadMotionQuestion(index) {
    if (index >= motionQuestions.length) {
      showMotionCompletePopup();
      return;
    }

    motionAnswered  = false;
    motionCardsLocked = true;
    const q = motionQuestions[index];

    /* reset card states */
    [motionCardA, motionCardB].forEach(c => c.classList.remove('selected', 'wrong'));

    /* update question text */
    if (motionQuestionLine) motionQuestionLine.innerHTML = '<strong>' + q.q + '</strong>';

    /* load images */
    const gifSrc    = 'icon/' + q.folder + '/With-motion.gif';
    const staticSrc = 'icon/' + q.folder + '/No-motion.png';

    stopGif();

    /* static img */
    if (motionStaticImg) motionStaticImg.src = staticSrc;

    /* load first frame of gif into canvas (paused) */
    loadGifFrames(gifSrc, () => {
      /* run instruction sequence then unlock cards */
      runMotionInstructionSequence(q, () => {
        motionCardsLocked = false;
      });
    });
  }

let motionIntroPlayed = false;

  /* ── Instruction sequence for motion ── */
  function runMotionInstructionSequence(q, onDone) {
    const line1 = document.querySelector('.motion-instruction .instr-line1');
    const line2 = document.querySelector('.motion-instruction .instr-line2');
    const line3 = document.querySelector('.motion-instruction .instr-line3');
    const audio1Btn = document.getElementById('motionAudioBtn1');
    const audio2Btn = document.getElementById('motionAudioBtn2');

    /* reset lines */
    [line1, line2, line3].forEach(l => l && l.classList.remove('line-visible'));
    [audio1Btn, audio2Btn].forEach(a => a && a.classList.remove('audio-visible'));

    if (motionCurrentAudio) { motionCurrentAudio.pause(); motionCurrentAudio = null; }

    function showQuestionLine() {
      setTimeout(() => {
        if (line3) line3.classList.add('line-visible');
        if (audio2Btn) audio2Btn.classList.add('audio-visible');

      const a2 = playGameAudio('audio/Motion/' + q.audio + '.mp3');
        motionCurrentAudio = a2;

        const goCards = () => { onDone && onDone(); };
        a2.addEventListener('ended', goCards);
        a2.addEventListener('error', goCards);
      }, 300);
    }

if (!motionIntroPlayed) {
      /* First time only — show line1 then line2 then question */
      motionIntroPlayed = true;

      /* play 01.mp3 once for both lines */
 const a1 = playGameAudio('audio/Motion/01.mp3');
      motionCurrentAudio = a1;

      /* show line 1 first */
      setTimeout(() => {
        if (line1) line1.classList.add('line-visible');
        if (audio1Btn) audio1Btn.classList.add('audio-visible');

        /* after 1.5s hide line1, show line2 */
        setTimeout(() => {
          if (line1) line1.classList.remove('line-visible');
          if (audio1Btn) audio1Btn.classList.remove('audio-visible');

          setTimeout(() => {
            if (line2) line2.classList.add('line-visible');
            if (audio1Btn) audio1Btn.classList.add('audio-visible');

            /* when audio ends hide line2 and show question */
            const goStep2 = () => {
              if (line2) line2.classList.remove('line-visible');
              if (audio1Btn) audio1Btn.classList.remove('audio-visible');
              showQuestionLine();
            };

            a1.addEventListener('ended', goStep2);
            a1.addEventListener('error', goStep2);

            /* fallback if audio already ended before line2 shows */
            if (a1.ended) goStep2();

          }, 200);
        }, 1500);
      }, 300);

    } else {
      /* Q2 onwards — skip intro, only show question line */
      showQuestionLine();
    }
  }

  /* ── Card click handlers ── */
  function handleMotionCardClick(card) {
    if (motionCardsLocked || motionAnswered) return;
    motionAnswered = true;

    const q = motionQuestions[motionCurrentQ];
    const isCorrect = (card.dataset.answer === q.correct);

    /* always play gif on click */
    const gifSrc = 'icon/' + q.folder + '/With-motion.gif';
    playGifOnCanvas(gifSrc);

    if (isCorrect) {
      card.classList.add('selected');
      const rnd = Math.floor(Math.random() * 5) + 1;
   const correctAudio = playGameAudio('audio/Extras/0' + rnd + '.mp3');
      setTimeout(() => {
        motionCurrentQ++;
        stopGif();
        loadMotionQuestion(motionCurrentQ);
      }, 2000);

    } else {
      card.classList.add('wrong');
      const rnd = Math.floor(Math.random() * 4) + 6;
  const wrongAudio = playGameAudio('audio/Extras/0' + rnd + '.mp3');

      setTimeout(() => {
        card.classList.remove('wrong');
        motionAnswered = false;
        stopGif();
       /* reload gif src to reset */
       if (motionGifImg) motionGifImg.src = 'icon/' + q.folder + '/With-motion.png';
      }, 1500);
    }
  }

  if (motionCardA) motionCardA.addEventListener('click', () => handleMotionCardClick(motionCardA));
  if (motionCardB) motionCardB.addEventListener('click', () => handleMotionCardClick(motionCardB));

  /* ── Complete popup ── */
  function showMotionCompletePopup() {
    let popup = document.getElementById('motionCompletePopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'motionCompletePopup';
      popup.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(10,20,50,0.55); padding: 16px;
      `;
      const box = document.createElement('div');
      box.style.cssText = `
        position: relative;
        width: clamp(260px, 44vw, 520px);
        aspect-ratio: 4/3;
        text-align: center;
        font-family: Arial, sans-serif;
        animation: popupIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
      `;
      const frame = document.createElement('img');
      frame.src = 'icon/Asset1@4x.png';
      frame.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:1;`;

      const inner = document.createElement('div');
      inner.style.cssText = `
        position:absolute; inset:5% 5% 14%; z-index:3;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        gap:clamp(8px,1.5vh,18px);
        background:rgba(255,255,255,0.93);
        border-radius:clamp(8px,1.5vw,16px);
        padding:clamp(10px,2vh,22px) clamp(12px,2vw,24px);
      `;

      const icon = document.createElement('div');
      icon.textContent = '🏆';
      icon.style.cssText = `font-size:clamp(2rem,4.5vw,3rem);line-height:1;`;

      const msg = document.createElement('p');
      msg.textContent = 'Great job! You completed all questions!';
      msg.style.cssText = `
        font-size:clamp(0.9rem,2vw,1.25rem);font-weight:700;
        font-family:'Comic',Arial,sans-serif;color:#1a2a4e;
        line-height:1.4;margin:0;padding:0 clamp(6px,1.5vw,16px);
      `;

      const btnRow = document.createElement('div');
      btnRow.style.cssText = `display:flex;gap:clamp(10px,2vw,20px);align-items:center;justify-content:center;`;

      const refreshBtn = document.createElement('button');
      refreshBtn.textContent = '🔄 Play Again';
      refreshBtn.style.cssText = `
        padding:clamp(6px,1.2vh,11px) clamp(18px,3.5vw,36px);
        border:none; border-radius:50px;
        background:linear-gradient(135deg,#1a7a3a,#2ebd60);
        color:#fff; font-size:clamp(0.8rem,1.5vw,1rem);
        font-weight:700; cursor:pointer;
        box-shadow:0 4px 14px rgba(30,160,80,0.35);
        transition:transform 0.15s;
      `;
      refreshBtn.onmouseover = () => { refreshBtn.style.transform = 'scale(1.06)'; };
      refreshBtn.onmouseout  = () => { refreshBtn.style.transform = 'scale(1)'; };
      refreshBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        resetMotionGame();
        motionCurrentQ = 0;
        loadMotionQuestion(0);
      });

      const backBtn2 = document.createElement('button');
      backBtn2.textContent = '🏠 Back';
      backBtn2.style.cssText = `
        padding:clamp(6px,1.2vh,11px) clamp(18px,3.5vw,36px);
        border:none; border-radius:50px;
        background:linear-gradient(135deg,#1a3a6b,#2e5fad);
        color:#fff; font-size:clamp(0.8rem,1.5vw,1rem);
        font-weight:700; cursor:pointer;
        box-shadow:0 4px 14px rgba(30,80,180,0.35);
        transition:transform 0.15s;
      `;
      backBtn2.onmouseover = () => { backBtn2.style.transform = 'scale(1.06)'; };
      backBtn2.onmouseout  = () => { backBtn2.style.transform = 'scale(1)'; };
      backBtn2.addEventListener('click', () => {
        popup.style.display = 'none';
        resetMotionGame();
        navigateTo(pageMotion, pageIndex);
      });

      btnRow.appendChild(refreshBtn);
      btnRow.appendChild(backBtn2);
      inner.appendChild(icon);
      inner.appendChild(msg);
      inner.appendChild(btnRow);
      box.appendChild(frame);
      box.appendChild(inner);
      popup.appendChild(box);
      document.body.appendChild(popup);
    }
    popup.style.display = 'flex';
  }

  /* ── Entry point: called when Motion menu btn clicked ── */
let motionAudioMuted = false;

  document.getElementById('motionAudioBtn1') && document.getElementById('motionAudioBtn1').addEventListener('click', () => {
    motionAudioMuted = !motionAudioMuted;
    const img1 = document.querySelector('#motionAudioBtn1 img');
    const img2 = document.querySelector('#motionAudioBtn2 img');
    if (img1) img1.src = motionAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (img2) img2.src = motionAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (motionCurrentAudio) motionCurrentAudio.muted = motionAudioMuted;
  });

  document.getElementById('motionAudioBtn2') && document.getElementById('motionAudioBtn2').addEventListener('click', () => {
    motionAudioMuted = !motionAudioMuted;
    const img1 = document.querySelector('#motionAudioBtn1 img');
    const img2 = document.querySelector('#motionAudioBtn2 img');
    if (img1) img1.src = motionAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (img2) img2.src = motionAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (motionCurrentAudio) motionCurrentAudio.muted = motionAudioMuted;
  });

  let ppAudioMuted = false;

  document.getElementById('ppAudioBtn1') && document.getElementById('ppAudioBtn1').addEventListener('click', () => {
    ppAudioMuted = !ppAudioMuted;
    const img1 = document.querySelector('#ppAudioBtn1 img');
    const img2 = document.querySelector('#ppAudioBtn2 img');
    if (img1) img1.src = ppAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (img2) img2.src = ppAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (ppCurrentAudio) ppCurrentAudio.muted = ppAudioMuted;
  });

  document.getElementById('ppAudioBtn2') && document.getElementById('ppAudioBtn2').addEventListener('click', () => {
    ppAudioMuted = !ppAudioMuted;
    const img1 = document.querySelector('#ppAudioBtn1 img');
    const img2 = document.querySelector('#ppAudioBtn2 img');
    if (img1) img1.src = ppAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (img2) img2.src = ppAudioMuted ? 'icon/mute.png' : 'icon/audio.png';
    if (ppCurrentAudio) ppCurrentAudio.muted = ppAudioMuted;
  });

  function startMotionGame() {
    motionCurrentQ  = 0;
    motionAnswered  = false;
    motionCardsLocked = true;
    motionAudioMuted = false;
    const img1 = document.querySelector('#motionAudioBtn1 img');
    const img2 = document.querySelector('#motionAudioBtn2 img');
    if (img1) img1.src = 'icon/audio.png';
    if (img2) img2.src = 'icon/audio.png';
    stopGif();
    loadMotionQuestion(0);
  }
function resetMotionGame() {
    motionAnswered  = false;
    motionCardsLocked = true;
    motionIntroPlayed = false;
    stopGif();
    if (motionCurrentAudio) { motionCurrentAudio.pause(); motionCurrentAudio = null; }
    [motionCardA, motionCardB].forEach(c => c && c.classList.remove('selected', 'wrong'));
    document.querySelectorAll('.motion-instruction .instr-line').forEach(l => l.classList.remove('line-visible'));
    document.querySelectorAll('.motion-instruction .instr-audio-btn').forEach(a => a.classList.remove('audio-visible'));
  }

  /* ═══════════════════════════════════════
     PAGE-PUSHPULL LOGIC
  ═══════════════════════════════════════ */

const pushPullQuestions = [
    { q: 'Meera wants to open a drawer. Should she pull or push the drawer?',           audio: '03', correct: 'pull', folder: '002', gifMs: 2000 },
    { q: 'Rohan wants to lift a bucket from a well using a rope. Should he pull or push the rope?', audio: '04', correct: 'pull', folder: '003', gifMs: 2000 },
    { q: 'Anaya wants to pick out a fish from the pond. Should she pull or push the fishing line?', audio: '05', correct: 'pull', folder: '004', gifMs: 2000 },
    { q: 'Kabir wants to close the curtain. Should he pull or push the curtain?',        audio: '06', correct: 'pull', folder: '005', gifMs: 2000 },
    { q: 'Ishi wants to move a shopping cart forward. Should she pull or push the cart?', audio: '07', correct: 'push', folder: '006', gifMs: 2000 },
    { q: 'Vivaan wants to move a car that has stopped. Should he pull or push the car?', audio: '08', correct: 'push', folder: '007', gifMs: 2000 },
    { q: 'Diya wants to move a chair under the table. Should she pull or push the chair?', audio: '09', correct: 'pull', folder: '008', gifMs: 2000 },
    { q: 'Arjun wants to make a swing move forward. Should he pull or push the swing?', audio: '10', correct: 'push', folder: '009', gifMs: 2000 },
  ];

  let ppCurrentQ      = 0;
  let ppAnswered      = false;
  let ppCurrentAudio  = null;
  let ppCardsLocked   = true;
  let ppIntroPlayed   = false;

  const ppPushBtn     = document.getElementById('ppPushBtn');
  const ppPullBtn     = document.getElementById('ppPullBtn');
  const ppSceneImg    = document.getElementById('ppSceneImg');
  const ppQuestionLine = document.getElementById('ppQuestionLine');

 function ppSetSceneStatic() {
    const q = pushPullQuestions[ppCurrentQ];
    if (ppSceneImg && q) {
      ppSceneImg.src = 'icon/' + q.folder + '.png';
    }
  }

function ppPlaySceneGif() {
    const q = pushPullQuestions[ppCurrentQ];
    if (ppSceneImg && q) {
      ppSceneImg.src = 'icon/' + q.folder + '.gif?t=' + Date.now();

      
      clearTimeout(window.__ppGifTimeout);
      const duration = q.gifMs || 2000;
      window.__ppGifTimeout = setTimeout(() => {
        ppSceneImg.src = 'icon/' + q.folder + '.png';
      }, duration);
    }
  }
  function loadPushPullQuestion(index) {
    if (index >= pushPullQuestions.length) {
      showPushPullCompletePopup();
      return;
    }

    ppAnswered = false;
    ppCardsLocked = true;
    const q = pushPullQuestions[index];

    [ppPushBtn, ppPullBtn].forEach(b => b.classList.remove('selected', 'wrong'));

    if (ppQuestionLine) ppQuestionLine.innerHTML = '<strong>' + q.q + '</strong>';

    ppSetSceneStatic();

    runPushPullInstructionSequence(q, () => {
      ppCardsLocked = false;
    });
  }

  function runPushPullInstructionSequence(q, onDone) {
    const line1 = document.querySelector('#page-pushpull .motion-instruction .instr-line1');
    const line2 = document.querySelector('#page-pushpull .motion-instruction .instr-line2');
    const line3 = document.querySelector('#page-pushpull .motion-instruction .instr-line3');
    const audio1Btn = document.getElementById('ppAudioBtn1');
    const audio2Btn = document.getElementById('ppAudioBtn2');

    [line1, line2, line3].forEach(l => l && l.classList.remove('line-visible'));
    [audio1Btn, audio2Btn].forEach(a => a && a.classList.remove('audio-visible'));

    if (ppCurrentAudio) { ppCurrentAudio.pause(); ppCurrentAudio = null; }

    function showQuestionLine() {
      setTimeout(() => {
        if (line3) line3.classList.add('line-visible');
        if (audio2Btn) audio2Btn.classList.add('audio-visible');

    const a2 = playGameAudio('audio/Pushandpull/' + q.audio + '.mp3');
        ppCurrentAudio = a2;

        const goCards = () => { onDone && onDone(); };
        a2.addEventListener('ended', goCards);
        a2.addEventListener('error', goCards);
      }, 300);
    }

    if (!ppIntroPlayed) {
      ppIntroPlayed = true;

   const a1 = playGameAudio('audio/Pushandpull/01.mp3');
      ppCurrentAudio = a1;

      setTimeout(() => {
        if (line1) line1.classList.add('line-visible');
        if (audio1Btn) audio1Btn.classList.add('audio-visible');

        setTimeout(() => {
          if (line1) line1.classList.remove('line-visible');
          if (audio1Btn) audio1Btn.classList.remove('audio-visible');

          setTimeout(() => {
            if (line2) line2.classList.add('line-visible');
            if (audio1Btn) audio1Btn.classList.add('audio-visible');

            const goStep2 = () => {
              if (line2) line2.classList.remove('line-visible');
              if (audio1Btn) audio1Btn.classList.remove('audio-visible');
              showQuestionLine();
            };

            a1.addEventListener('ended', goStep2);
            a1.addEventListener('error', goStep2);

            if (a1.ended) goStep2();

          }, 200);
        }, 1500);
      }, 300);

    } else {
      showQuestionLine();
    }
  }

  function handlePushPullAnswer(btn) {
    if (ppCardsLocked || ppAnswered) return;
    ppAnswered = true;

    const q = pushPullQuestions[ppCurrentQ];
    const isCorrect = (btn.dataset.answer === q.correct);

    ppPlaySceneGif();

    if (isCorrect) {
      btn.classList.add('selected');
      const rnd = Math.floor(Math.random() * 5) + 1;
const correctAudio = playGameAudio('audio/Extras/0' + rnd + '.mp3');

      setTimeout(() => {
        ppCurrentQ++;
        loadPushPullQuestion(ppCurrentQ);
      }, 2000);

    } else {
      btn.classList.add('wrong');
      const rnd = Math.floor(Math.random() * 4) + 6;
 const wrongAudio = playGameAudio('audio/Extras/0' + rnd + '.mp3');

      setTimeout(() => {
        btn.classList.remove('wrong');
        ppAnswered = false;
        ppSetSceneStatic();
      }, 1500);
    }
  }

  if (ppPushBtn) ppPushBtn.addEventListener('click', () => handlePushPullAnswer(ppPushBtn));
  if (ppPullBtn) ppPullBtn.addEventListener('click', () => handlePushPullAnswer(ppPullBtn));

  function showPushPullCompletePopup() {
    let popup = document.getElementById('pushpullCompletePopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'pushpullCompletePopup';
      popup.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(10,20,50,0.55); padding: 16px;
      `;
      const box = document.createElement('div');
      box.style.cssText = `
        position: relative;
        width: clamp(260px, 44vw, 520px);
        aspect-ratio: 4/3;
        text-align: center;
        font-family: Arial, sans-serif;
        animation: popupIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
      `;
      const frame = document.createElement('img');
      frame.src = 'icon/Asset1@4x.png';
      frame.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:1;`;

      const inner = document.createElement('div');
      inner.style.cssText = `
        position:absolute; inset:5% 5% 14%; z-index:3;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        gap:clamp(8px,1.5vh,18px);
        background:rgba(255,255,255,0.93);
        border-radius:clamp(8px,1.5vw,16px);
        padding:clamp(10px,2vh,22px) clamp(12px,2vw,24px);
      `;

      const icon = document.createElement('div');
      icon.textContent = '🏆';
      icon.style.cssText = `font-size:clamp(2rem,4.5vw,3rem);line-height:1;`;

      const msg = document.createElement('p');
      msg.textContent = 'Great job! You completed all questions!';
      msg.style.cssText = `
        font-size:clamp(0.9rem,2vw,1.25rem);font-weight:700;
        font-family:'Comic',Arial,sans-serif;color:#1a2a4e;
        line-height:1.4;margin:0;padding:0 clamp(6px,1.5vw,16px);
      `;

      const btnRow = document.createElement('div');
      btnRow.style.cssText = `display:flex;gap:clamp(10px,2vw,20px);align-items:center;justify-content:center;`;

      const refreshBtn = document.createElement('button');
      refreshBtn.textContent = '🔄 Play Again';
      refreshBtn.style.cssText = `
        padding:clamp(6px,1.2vh,11px) clamp(18px,3.5vw,36px);
        border:none; border-radius:50px;
        background:linear-gradient(135deg,#1a7a3a,#2ebd60);
        color:#fff; font-size:clamp(0.8rem,1.5vw,1rem);
        font-weight:700; cursor:pointer;
        box-shadow:0 4px 14px rgba(30,160,80,0.35);
        transition:transform 0.15s;
      `;
      refreshBtn.onmouseover = () => { refreshBtn.style.transform = 'scale(1.06)'; };
      refreshBtn.onmouseout  = () => { refreshBtn.style.transform = 'scale(1)'; };
      refreshBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        resetPushPullGame();
        ppCurrentQ = 0;
        loadPushPullQuestion(0);
      });

      const backBtn2 = document.createElement('button');
      backBtn2.textContent = '🏠 Back';
      backBtn2.style.cssText = `
        padding:clamp(6px,1.2vh,11px) clamp(18px,3.5vw,36px);
        border:none; border-radius:50px;
        background:linear-gradient(135deg,#1a3a6b,#2e5fad);
        color:#fff; font-size:clamp(0.8rem,1.5vw,1rem);
        font-weight:700; cursor:pointer;
        box-shadow:0 4px 14px rgba(30,80,180,0.35);
        transition:transform 0.15s;
      `;
      backBtn2.onmouseover = () => { backBtn2.style.transform = 'scale(1.06)'; };
      backBtn2.onmouseout  = () => { backBtn2.style.transform = 'scale(1)'; };
      backBtn2.addEventListener('click', () => {
        popup.style.display = 'none';
        resetPushPullGame();
        navigateTo(pagePushPull, pageIndex);
      });

      btnRow.appendChild(refreshBtn);
      btnRow.appendChild(backBtn2);
      inner.appendChild(icon);
      inner.appendChild(msg);
      inner.appendChild(btnRow);
      box.appendChild(frame);
      box.appendChild(inner);
      popup.appendChild(box);
      document.body.appendChild(popup);
    }
    popup.style.display = 'flex';
  }

function startPushPullGame() {
    ppCurrentQ = 0;
    ppAnswered = false;
    ppCardsLocked = true;
    ppAudioMuted = false;
    const img1 = document.querySelector('#ppAudioBtn1 img');
    const img2 = document.querySelector('#ppAudioBtn2 img');
    if (img1) img1.src = 'icon/audio.png';
    if (img2) img2.src = 'icon/audio.png';
    loadPushPullQuestion(0);
  }

  function resetPushPullGame() {
    ppAnswered = false;
    ppCardsLocked = true;
    ppIntroPlayed = false;
    if (ppCurrentAudio) { ppCurrentAudio.pause(); ppCurrentAudio = null; }
    [ppPushBtn, ppPullBtn].forEach(b => b && b.classList.remove('selected', 'wrong'));
    document.querySelectorAll('#page-pushpull .motion-instruction .instr-line').forEach(l => l.classList.remove('line-visible'));
    document.querySelectorAll('#page-pushpull .motion-instruction .instr-audio-btn').forEach(a => a.classList.remove('audio-visible'));
  }
})();