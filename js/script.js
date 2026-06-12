(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     PAGE NAVIGATION
  ═══════════════════════════════════════════════════════ */
  const pageHome  = document.getElementById('page-home');
  const pageIndex = document.getElementById('page-index');
  const pageForce = document.getElementById('page-force');
  const playBtn       = document.getElementById('playBtn');
  const backBtn       = document.getElementById('backBtn');
  const forceBackBtn  = document.getElementById('forceBackBtn');
  const rotateOverlay = document.getElementById('rotateOverlay');

  function navigateTo(from, to) {
    if (!from || !to || from === to) return;
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
  if (backBtn)      backBtn.addEventListener('click',      () => navigateTo(pageIndex, pageHome));
  if (forceBackBtn) forceBackBtn.addEventListener('click', () => { resetForceGame(); navigateTo(pageForce, pageIndex); });

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-label') === 'Force') {
        resetForceGame();
        navigateTo(pageIndex, pageForce);
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

  let musicOn = true;
  document.querySelectorAll('[aria-label="Music"]').forEach(btn => {
    btn.addEventListener('click', () => {
      musicOn = !musicOn;
      btn.style.opacity = musicOn ? '1' : '0.5';
    });
  });

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

        /* show audio button shortly after line appears */
        setTimeout(() => {
          if (audio) audio.classList.add('audio-visible');

          /* wait then move to next line */
          setTimeout(() => {
            showLine(index + 1);
          }, 1200);

        }, 500);
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
  }

  function showCard2() {
    if (!forceCards) return;
    const card2 = forceCards.children[1];
    if (card2) card2.classList.add('card-in');
  }

  function showPlayCard() {
    if (forcePlayCard) forcePlayCard.classList.add('play-card-in');
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

      /* show card 2 */
      showCard2();

      /* hide play card until force is selected */
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');
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

   /* show play card */
      showPlayCard();
    });
  });

  /* ═══════════════════════════════════════════════════════
     PLAY BUTTON
  ═══════════════════════════════════════════════════════ */
if (playForceBtn) {
    playForceBtn.addEventListener('click', () => {
      if (isAnimating || !selectedObject || !selectedForce) return;
      if (forcePlayCard) forcePlayCard.classList.remove('play-card-in');
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

    const interval = setInterval(() => {
      frame++;

      if (frame >= totalFrames) {
        clearInterval(interval);
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
  /* ═══════════════════════════════════════════════════════
     FINISH SCENARIO — RESET FOR NEXT PLAY
  ═══════════════════════════════════════════════════════ */
function finishScenario(blockPos) {
    /* DO NOT rebuild blocks here — keep scattered state visible */

 /* show result popup based on outcome */
    let popupMsg = '';
    if (selectedForce === 'gentle' && blockPos !== 'center') {
      popupMsg = "The push was too gentle. Try using a stronger force.";
    } else if (selectedForce === 'strong') {
      popupMsg = `Excellent! The strong push helped the ${getObjectLabel()} travel far and hit the blocks with force.`;
    } else if (selectedForce === 'gentle' && blockPos === 'center') {
      popupMsg = "Wow! Even a gentle push broke the blocks because they were right in the way!";
    }

showResultPopup(popupMsg, () => {
      /* AFTER user clicks OK: rebuild pyramid, then advance object if round 2 just finished */
      rebuildBlocks();

      /* reset object position now (after OK) */
      if (trackObject) {
        const yOffset = (selectedObject === 'box') ? 30: (selectedObject === 'trolly') ? -15 : 0;
        trackObject.style.transition = 'none';
        trackObject.style.transform  = `translateX(0) translateY(${yOffset}px) rotate(0deg)`;
      }

      const justFinishedRound2 = (selectedObject === null);

      if (justFinishedRound2) {
        const nextBtn = document.querySelector('.obj-btn:not(.btn-exhausted)');
        if (nextBtn) {
          nextBtn.click();
        } else {
          showResultPopup("Great job! You've completed all the experiments!");
        }
      } else {
        const pos = (currentRound === 1) ? 'right' : 'center';
        positionBlocks(pos);
      }
    });

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

    } else {
      /* blocks didn't break — keep retrying this round */
      updateForceButtons();
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
        z-index: 12;
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
})();