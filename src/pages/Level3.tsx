/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { createScope, createTimeline } from "animejs";

import AttackStatusIcon from "../assets/icons/AttackStatusIcon";
import ExclamationStatusIcon from "../assets/icons/ExclamationStatusIcon";
// import BugIcon from "./assets/icons/BugIcon";
// import CaretIcon from "./assets/icons/CaretIcon";
// import PotionIcon from "./assets/icons/PotionIcon";
// import SpecialAttackIcon from "./assets/icons/SpecialAttackIcon";
// import SwordIcon from "./assets/icons/SwordIcon";

import { Howl } from "howler";
import battleBGM from "../assets/BGM/battle-bgm.ogg";
import decision1SE from "../assets/SE/decision1.ogg";
import decision2SE from "../assets/SE/decision2.ogg";
import prepAttackSE from "../assets/SE/prep-attack.ogg";
import playerAttackSE from "../assets/SE/player-attack.ogg";
import enemyAttackSE from "../assets/SE/enemy-attack.ogg";
import criticalHit from "../assets/SE/critical-hit.ogg";
import healingSE from "../assets/SE/healing.ogg";
import touchExclamationSE from "../assets/SE/touch-exclamation.mp3";
import parrySE from "../assets/SE/parry.ogg";
import shieldReflectionSE from "../assets/SE/shield-reflection.mp3";
import obtainExclamationSE from "../assets/SE/obtain-exclamation.ogg";
import enemyDefeatSE from "../assets/SE/enemy-defeat.ogg";
import falseExclamationSE from "../assets/SE/false-exclamation.ogg";

import victoryME from "../assets/ME/victory.mp3";
import defeatME from "../assets/ME/defeat.ogg";

import victoryBGM from "../assets/BGM/victory-melody.ogg";
import defeatBGM from "../assets/BGM/defeat-melody.ogg";

import heroImage from "../assets/images/hero.png";
import enemyImage from "../assets/images/turtle.png";

import tutorialImage from "../assets/images/tutorial-inciertas.jpg";

import AttackButtonIcon from "../assets/icons/AttackButtonIcon";
import DefenseButtonIcon from "../assets/icons/DefenseButtonIcon";
import AttackExclamationStatusIcon from "../assets/icons/AttackExclamationStatusIcon";
import DefenseExclamationStatusIcon from "../assets/icons/DefenseExclamationStatusIcon";
import DefenseStatusIcon from "../assets/icons/DefenseStatusIcon";
import { useRouter } from "../router/useRouter";

const PLAYER_MAX_HEALTH = 200; // Salud máxima del jugador
const ENEMY_MAX_HEALTH = 275; // Salud máxima del oponente
const PLAYER_DAMAGE = 10; // Determina el daño que inflige el jugador
const ENEMY_DAMAGE = 9; // Determina el daño que ocasiona el oponente
const PLAYER_SPEED = 2250; // Determina la frecuencia de ataque del jugador
const ENEMY_SPEED = 2000; // Determina la frecuencia de ataque del oponente
const PLAYER_CRITICAL = 0.25; // Probabilidad de golpe crítico del jugador
const ENEMY_CRITICAL = 0.25; // Probabilidad de golpe crítico del oponente
let BOOST_POWER = 1; // bonificación de daño que multiplica el daño del jugador
let BLOCK_POWER = 1; // bonificación de defensa que divide el daño del enemigo

// const EXCLAMATIONS_SEQUENCE_COLORS = {
//   0: "#e44",
//   1: "#44e",
//   2: "#4e4",
//   3: "#e4e",
//   4: "#4ee",
//   5: "#ee4",
// };

const EXCLAMATIONS = ["?", "!", "!", "?!", "?!"];
// const EXCLAMATIONS = ["?!", "!", "?", "C", "B"];

type playerAction = "attack" | "guard";
// type enemyAction = "attack";

type damageCategory =
  | "normal"
  | "healing"
  | "guarding"
  | "special"
  | "critical";

const DAMAGE_POPUP_COLOR: Record<damageCategory, string> = {
  normal: "#fafafa",
  healing: "#86efac",
  guarding: "#22d3ee",
  special: "#fdba74",
  critical: "#fb7185",
};

type statusName =
  | "attack_boost"
  | "attack_drop"
  | "defense_boost"
  | "defense_drop"
  | "exclamation_attack"
  | "exclamation_defense";

const STATUS_ICONS: Record<statusName, React.ReactElement> = {
  attack_boost: (
    <AttackStatusIcon
      className="size-4 text-amber-500"
      strokeWeight={1}
      strokeColor="#b45309"
    />
  ),

  attack_drop: (
    <AttackStatusIcon
      className="size-4 text-cyan-600"
      strokeWeight={1}
      strokeColor="#075985"
    />
  ),

  defense_boost: (
    <DefenseStatusIcon
      className="size-4 text-amber-500"
      strokeWeight={28}
      strokeColor="#b45309"
    />
  ),

  defense_drop: (
    <DefenseStatusIcon
      className="size-4 text-cyan-600"
      strokeWeight={28}
      strokeColor="#075985"
    />
  ),

  exclamation_attack: (
    <AttackExclamationStatusIcon
      className="size-4 text-amber-500"
      strokeWeight={1}
      strokeColor="#b45309"
    />
  ),

  exclamation_defense: (
    <DefenseExclamationStatusIcon
      className="size-4 text-cyan-600"
      strokeWeight={1}
      strokeColor="#075985"
    />
  ),
};

function calculateVariation() {
  const minVariation = 0.98; // 2% menos
  const maxVariation = 1.02; // 2% más

  return Math.random() * (maxVariation - minVariation) + minVariation;
}

function shuffleArray(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function App() {
  const { navigate } = useRouter();
  const root = useRef<any | null>(null);
  const scopeRef = useRef<any | null>(null);
  const [contenderStatus, setContenderStatus] = useState<{
    player: statusName[];
    enemy: statusName[];
  }>({ player: [], enemy: [] });

  const [guardingStatus, setGuardingStatus] = useState(false);

  useEffect(() => {
    if (!guardingStatus) return;

    guardAnimation().then(() => {
      setGuardingStatus(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardingStatus]);

  const guardAnimation = useCallback(async () => {
    return createTimeline({
      delay: 500,
    })
      .call(() => handleBattleLog(<>¡El jugador se defendió!</>), 100)
      .add(".reflection", { rotate: "45deg", duration: 0 })
      .add(".shield", { filter: "brightness(50%)", duration: 0 })
      .add(".shield", { opacity: 1, duration: 100 })
      .add(".shield", { filter: "brightness(100%)", duration: 100 })
      .call(() => shieldReflectionSERef.current?.play(), "+=10")
      .add(".reflection", { x: "8rem", duration: 500 })
      .add(".reflection", { x: "0", duration: 0 })
      .call(() => shieldReflectionSERef.current?.play(), "+=10")
      .add(".reflection", { x: "8rem", duration: 500 })
      .add(".reflection", { x: "0", duration: 0 })
      .add(".shield", { opacity: 0, duration: 200 })
      .then(() => {});
  }, []);

  const startGuard = useCallback(async () => {
    setGuardingStatus(true);

    await new Promise(requestAnimationFrame);

    return guardAnimation();
  }, [guardAnimation]);

  const playerStatusRef = useRef<statusName[]>([]);
  const enemyStatusRef = useRef<statusName[]>([]);

  const [tutorial, setTutorial] = useState(1);
  const playerActionRef = useRef<playerAction>("attack");

  const [playerDamagePopup, setPlayerDamagePopup] = useState(0);
  const [enemyDamagePopup, setEnemyDamagePopup] = useState(0);

  const playerColorDamagePopup = useRef<damageCategory>("normal");
  const enemyColorDamagePopup = useRef<damageCategory>("normal");

  const playerIsCritical = useRef(false);
  const enemyIsCritical = useRef(false);

  const [exclamationsOrder, setExclamationsOrder] = useState(() =>
    shuffleArray(EXCLAMATIONS),
  );
  const exclamationsIndexRef = useRef(0);
  const exclamationTypeRef = useRef("");
  const [renderExclamation, setRenderExclamation] = useState<
    "!" | "?" | number
  >("!");

  useEffect(() => {
    if (!enemyDamagePopup) return;

    const enemyDamagePopupAnimation = createTimeline({
      onComplete: () => setEnemyDamagePopup(0),
    });

    enemyDamagePopupAnimation
      .add(".enemy-damage-popup", { y: "-18px", duration: 100 })
      .add(".enemy-damage-popup", { y: 0, duration: 50 })
      .add(".enemy-damage-popup", { y: "-9px", duration: 25 })
      .add(".enemy-damage-popup", { y: 0, duration: 12 })
      .add(".enemy-damage-popup", { y: 0, duration: 300 });
  }, [enemyDamagePopup]);

  useEffect(() => {
    if (!playerDamagePopup) return;

    const playerDamagePopupAnimation = createTimeline({
      onComplete: () => setPlayerDamagePopup(0),
    });

    playerDamagePopupAnimation
      .add(".player-damage-popup", { y: "-18px", duration: 100 })
      .add(".player-damage-popup", { y: 0, duration: 50 })
      .add(".player-damage-popup", { y: "-9px", duration: 25 })
      .add(".player-damage-popup", { y: 0, duration: 12 })
      .add(".player-damage-popup", { y: 0, duration: 300 });
  }, [playerDamagePopup]);

  function addStatus(contender: "player" | "enemy", status: statusName) {
    setContenderStatus((prev) => ({
      ...prev,
      [contender]: [...prev[contender], status],
    }));

    if (contender === "player") {
      playerStatusRef.current = [...playerStatusRef.current, status];
    } else {
      enemyStatusRef.current = [...enemyStatusRef.current, status];
    }
  }

  function removeStatus(contender: "player" | "enemy", status: statusName) {
    setContenderStatus((prev) => ({
      ...prev,
      [contender]: [
        ...prev[contender].filter((prevStatus) => status !== prevStatus),
      ],
    }));

    if (contender === "player") {
      playerStatusRef.current = playerStatusRef.current.filter(
        (prevStatus) => status !== prevStatus,
      );
    } else {
      enemyStatusRef.current = enemyStatusRef.current.filter(
        (prevStatus) => status !== prevStatus,
      );
    }
  }

  function isStatusAffected(contender: "player" | "enemy", status: statusName) {
    if (contender === "player") {
      return playerStatusRef.current.some(
        (prevStatus) => prevStatus === status,
      );
    } else {
      return enemyStatusRef.current.some((prevStatus) => prevStatus === status);
    }
  }

  const exclamationAreaRef = useRef<HTMLDivElement | null>(null);
  const [exclamationAreaSize, setExclamationAreaSize] = useState({
    width: 0,
    height: 0,
  });
  const [exclamationPosition, setExclamationPosition] = useState(
    randomPosition(exclamationAreaSize.height, exclamationAreaSize.width),
  );
  const TIME_EXCLAMATION_VISIBLE = 1500;
  const [showExclamation, setShowExclamation] = useState(false);
  const [exclamationTimestamp, setExclamationTimestamp] = useState<
    number | null
  >(null);

  const [canExclamationPop, setCanExclamationPop] = useState(false);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exclamationCycleRef = useRef<() => void>(null);

  const touchExclamationSERef = useRef<Howl | null>(null);
  const turnOrderRef = useRef<"Player" | "Enemy">(null);
  const isExclamationTouched = useRef(false);

  const battleBGMRef = useRef<Howl | null>(null);
  const decision1SERef = useRef<Howl | null>(null);
  const decision2SERef = useRef<Howl | null>(null);
  const prepAttackSERef = useRef<Howl | null>(null);
  const playerAttackSERef = useRef<Howl | null>(null);
  const enemyAttackSERef = useRef<Howl | null>(null);
  const criticalHitSERef = useRef<Howl | null>(null);
  const healingSERef = useRef<Howl | null>(null);
  const parrySERef = useRef<Howl | null>(null);
  const shieldReflectionSERef = useRef<Howl | null>(null);
  const obtainExclamationSERef = useRef<Howl | null>(null);
  const enemyDefeatSERef = useRef<Howl | null>(null);
  const falseExclamationSERef = useRef<Howl | null>(null);
  const victoryMERef = useRef<Howl | null>(null);
  const defeatMERef = useRef<Howl | null>(null);
  const victoryBGMRef = useRef<Howl | null>(null);
  const defeatBGMRef = useRef<Howl | null>(null);

  function randomPosition(height: number, width: number) {
    return {
      top: Math.random() * (height - 56),
      left: Math.random() * (width - 56),
    };
  }

  const [battleLog, setBattleLog] = useState<React.ReactElement | null>();

  useEffect(() => {
    if (!battleLog) return;

    const battleLogAnimation = createTimeline({
      onComplete: () => handleBattleLog(null),
    });

    battleLogAnimation
      .add(".battle-log", {})
      .add(".battle-log", { x: "-100%", duration: 200 })
      .add(".battle-log", { x: "-100%", duration: 1200 })
      .add(".battle-log", { x: "-200%", duration: 400 })
      .add(".battle-log", { x: "0", duration: 0 })
      .then(() => handleBattleLog(null));
  }, [battleLog]);

  useEffect(() => {
    decision1SERef.current = new Howl({
      src: [decision1SE],
      preload: true,
      volume: 1,
    });
  }, []);

  useEffect(() => {
    if (tutorial !== 0) {
      return;
    }

    if (exclamationAreaRef.current) {
      const { width, height } =
        exclamationAreaRef.current.getBoundingClientRect();
      setExclamationAreaSize({ width, height });
      setExclamationPosition(randomPosition(height, width));
    }

    battleBGMRef.current = new Howl({
      src: [battleBGM],
      preload: true,
      volume: 0.4,
      loop: true,
      autoplay: true,
    });

    decision2SERef.current = new Howl({
      src: [decision2SE],
      preload: true,
      volume: 1,
    });

    prepAttackSERef.current = new Howl({
      src: [prepAttackSE],
      preload: true,
      volume: 1,
    });

    playerAttackSERef.current = new Howl({
      src: [playerAttackSE],
      preload: true,
      volume: 1,
    });

    enemyAttackSERef.current = new Howl({
      src: [enemyAttackSE],
      preload: true,
      volume: 1,
    });

    criticalHitSERef.current = new Howl({
      src: [criticalHit],
      preload: true,
      volume: 1,
    });

    healingSERef.current = new Howl({
      src: [healingSE],
      preload: true,
      volume: 1,
    });

    touchExclamationSERef.current = new Howl({
      src: [touchExclamationSE],
      preload: true,
      volume: 1,
    });

    parrySERef.current = new Howl({
      src: [parrySE],
      preload: true,
      volume: 1,
    });

    shieldReflectionSERef.current = new Howl({
      src: [shieldReflectionSE],
      preload: true,
      volume: 1,
    });

    obtainExclamationSERef.current = new Howl({
      src: [obtainExclamationSE],
      preload: true,
      volume: 1,
    });

    enemyDefeatSERef.current = new Howl({
      src: [enemyDefeatSE],
      preload: true,
      volume: 1,
    });

    falseExclamationSERef.current = new Howl({
      src: [falseExclamationSE],
      preload: true,
      volume: 1,
    });

    victoryMERef.current = new Howl({
      src: [victoryME],
      preload: true,
      volume: 1,
      onend: () => handleVictory(),
    });

    defeatMERef.current = new Howl({
      src: [defeatME],
      preload: true,
      volume: 1,
      onend: () => handleDefeat(),
    });

    victoryBGMRef.current = new Howl({
      src: [victoryBGM],
      preload: true,
      volume: 1,
    });

    defeatBGMRef.current = new Howl({
      src: [defeatBGM],
      preload: true,
      volume: 1,
    });

    scopeRef.current = createScope({ root }).add(() => {
      const tl = createTimeline({
        onComplete: () => battleStart(),
      });

      tl.add(root.current, { opacity: [0, 1], duration: 800 });
      tl.call(
        () =>
          handleBattleLog(
            <>
              ¡Te has topado con un{" "}
              <span className="text-yellow-300">enemigo</span>!
            </>,
          ),
        "+=200",
      );
      tl.add(".hero", { x: "150%", duration: 350 });
      tl.add(".hero", {
        y: [
          { to: -40, duration: 100 },
          { to: 0, duration: 200 },
        ],
        loop: 1,
        duration: 350,
      });
    });

    return () => {
      scopeRef.current.revert();
      touchExclamationSERef.current?.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial]);

  const [exclamations, setExclamations] = useState([
    "#57534d",
    "#57534d",
    "#57534d",
  ]);
  const exclamationAccRef = useRef<0 | 1 | 2 | 3>(0);

  const [chain, setChain] = useState(0);
  const chainRef = useRef(0);

  function obtainExclamation() {
    setExclamations((prev) => {
      const excl = [...prev];

      const idx = excl.findIndex((color) => color === "#57534d");
      if (idx !== -1) {
        excl[idx] = "#ef4444";
      }

      return excl;
    });

    function exclamationCounterAnimation() {
      if (exclamationAccRef.current === 3) return;
      return createTimeline({
        onBegin: () => exclamationAccRef.current++,
      })
        .add(".exclamation-counter", {
          scale: 1.3,
          duration: 100,
        })
        .add(".exclamation-counter", { rotate: 22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: -22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: 0, duration: 40 })
        .add(".exclamation-counter", { scale: 1, duration: 100 });
    }

    exclamationCounterAnimation();
  }

  function applyExclamation() {
    setExclamations((prev) => {
      const idx = prev.lastIndexOf("#ef4444");
      if (idx === -1) return prev;

      return [...prev.slice(0, idx), "#57534d", ...prev.slice(idx + 1)];
    });

    function exclamationCounterAnimation() {
      if (exclamationAccRef.current === 0) return;
      return createTimeline({
        onBegin: () => exclamationAccRef.current--,
      })
        .add(".exclamation-counter", {
          scale: 0.7,
          duration: 100,
        })
        .add(".exclamation-counter", { rotate: 22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: -22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: 0, duration: 40 })
        .add(".exclamation-counter", { scale: 1, duration: 100 });
    }

    exclamationCounterAnimation();
  }

  function applyAllExclamations() {
    setExclamations((prev) =>
      prev.map((color) => (color === "#ef4444" ? "#57534d" : color)),
    );
    exclamationAccRef.current = 0;

    function exclamationCounterAnimation() {
      if (exclamationAccRef.current === 0) return;
      return createTimeline({})
        .add(".exclamation-counter", {
          scale: 0.7,
          duration: 100,
        })
        .add(".exclamation-counter", { rotate: 22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: -22.5, duration: 40 })
        .add(".exclamation-counter", { rotate: 0, duration: 40 })
        .add(".exclamation-counter", { scale: 1, duration: 100 });
    }

    exclamationCounterAnimation();
  }

  const explodeRef = useRef(false);
  const disabledRef = useRef(false);

  useEffect(() => {
    if (exclamationAreaSize.height && exclamationAreaSize.width) {
      disabledRef.current = false;
      function exclamationCycle() {
        disabledRef.current = false;
        const timeBeforeDisplay = Math.random() * 1000 + 2000;

        if (exclamationsIndexRef.current === exclamationsOrder.length) {
          setExclamationsOrder(shuffleArray(EXCLAMATIONS));
          exclamationsIndexRef.current = 0;
        }

        startTimeoutRef.current = setTimeout(() => {
          exclamationTypeRef.current =
            exclamationsOrder[exclamationsIndexRef.current];

          if (["!", "?"].includes(exclamationTypeRef.current)) {
            setRenderExclamation(exclamationTypeRef.current as "!");
          } else if (exclamationTypeRef.current === "C") {
            const randomNumber = Math.floor(Math.random() * 4) + 4;
            setRenderExclamation(randomNumber);
          } else if (exclamationTypeRef.current === "B") {
            explodeRef.current = true;
            const randomNumber = Math.floor(Math.random() * 4) + 4;
            setRenderExclamation(randomNumber);
          } else if (exclamationTypeRef.current === "?!") {
            setRenderExclamation("?");
            exclamationTypeRef.current = "?";

            swapTimeoutRef.current = setTimeout(() => {
              setRenderExclamation("!");
              exclamationTypeRef.current = "!";
            }, TIME_EXCLAMATION_VISIBLE / 1.5);
          }

          isExclamationTouched.current = false;
          setExclamationPosition(
            randomPosition(
              exclamationAreaSize.height,
              exclamationAreaSize.width,
            ),
          );
          setShowExclamation(true);
          setExclamationTimestamp(Date.now());

          endTimeoutRef.current = setTimeout(() => {
            disabledRef.current = true;
            function exclamationFadeAnimation() {
              return createTimeline({
                onComplete: () => setShowExclamation(false),
              }).add(".exclamation-bubble", {
                opacity: 0,
                duration: 100,
              });
            }
            exclamationFadeAnimation();
            if (!isExclamationTouched.current) {
              if (["!", "B", "C"].includes(exclamationTypeRef.current)) {
                falseExclamationSERef.current?.play();
                applyExclamationAnimation();
                resetChain();
              } else if (exclamationTypeRef.current === "?") {
                if (exclamationAccRef.current < 3) {
                  obtainExclamationSERef.current?.play();
                }

                obtainExclamationAnimation();
                addChain();
              }
              exclamationsIndexRef.current++;
            }

            if (
              exclamationTypeRef.current === "C" &&
              isExclamationTouched.current
            ) {
              falseExclamationSERef.current?.play();
              applyExclamationAnimation();
              resetChain();
              exclamationsIndexRef.current++;
            }

            if (
              exclamationTypeRef.current === "B" &&
              isExclamationTouched.current
            ) {
              if (!explodeRef.current) {
                obtainExclamationSERef.current?.play();
                obtainExclamationAnimation();
                addChain();
              }
              if (explodeRef.current) {
                falseExclamationSERef.current?.play();
                applyExclamationAnimation();
                resetChain();
              }
              exclamationsIndexRef.current++;
            }

            exclamationCycle();
          }, TIME_EXCLAMATION_VISIBLE);
        }, timeBeforeDisplay);
      }

      exclamationCycleRef.current = exclamationCycle;

      exclamationCycle();

      return () => {
        if (startTimeoutRef.current !== null) {
          clearTimeout(startTimeoutRef.current);
        }
        if (swapTimeoutRef.current !== null) {
          clearTimeout(swapTimeoutRef.current);
        }
        if (endTimeoutRef.current !== null) {
          clearTimeout(endTimeoutRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exclamationAreaSize.height, exclamationAreaSize.width]);

  useEffect(() => {
    if (!showExclamation) return;
    function exclamationFadeInAnimation() {
      return createTimeline({}).add(".exclamation-bubble", {
        opacity: 1,
        duration: 100,
      });
    }
    exclamationFadeInAnimation();
  }, [showExclamation]);

  function stopExclamation() {
    setShowExclamation(false);
    setCanExclamationPop(false);

    if (startTimeoutRef.current !== null) {
      clearTimeout(startTimeoutRef.current);
    }
    if (swapTimeoutRef.current !== null) {
      clearTimeout(swapTimeoutRef.current);
    }
    if (endTimeoutRef.current !== null) {
      clearTimeout(endTimeoutRef.current);
    }
  }

  function obtainExclamationAnimation() {
    if (exclamationAccRef.current === 3) return;
    obtainExclamationSERef.current?.play();
    return createTimeline({
      onBegin: () => obtainExclamation(),
    })
      .add(`.exclamation-${exclamationAccRef.current} + *`, {
        scaleX: 1.6,
        scaleY: 1.9,
        opacity: 0,
        "z-index": 10,
        duration: 0,
      })
      .add(`.exclamation-${exclamationAccRef.current} + *`, {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        color: "#ef4444",
        duration: 700,
      });
  }

  function handleClickExclamation() {
    if (disabledRef.current) return;

    if (exclamationTimestamp !== null) {
      touchExclamationSERef.current?.play();

      function exclamationPopAnimation() {
        return createTimeline({
          onComplete: () => setShowExclamation(false),
        }).add(".exclamation-bubble", {
          scale: 1.3,
          opacity: 0,
          duration: 100,
        });
      }

      function exclamationCounterAnimation() {
        return createTimeline({})
          .add(".exclamation-bubble", {
            scale: 1.3,
            duration: 80,
          })
          .add(".exclamation-bubble", {
            scale: 1,
            duration: 80,
          });
      }

      if (exclamationTypeRef.current === "!") {
        exclamationsIndexRef.current++;
        exclamationPopAnimation();
        obtainExclamationAnimation();
        addChain();
        clearTimeouts();
      } else if (exclamationTypeRef.current === "?") {
        exclamationsIndexRef.current++;
        exclamationPopAnimation();
        falseExclamationSERef.current?.play();
        applyExclamationAnimation();
        resetChain();
        clearTimeouts();
      } else if (exclamationTypeRef.current === "C") {
        if ((renderExclamation as number) > 1) {
          exclamationCounterAnimation();
          setRenderExclamation((prev) => (prev as number) - 1);
        } else {
          exclamationsIndexRef.current++;
          exclamationPopAnimation();
          obtainExclamationAnimation();
          addChain();
          clearTimeouts();
        }
      } else if (exclamationTypeRef.current === "B") {
        exclamationCounterAnimation();
        setRenderExclamation((prev) => (prev as number) - 1);
        if ((renderExclamation as number) - 1 === 1) {
          explodeRef.current = false;
        } else if ((renderExclamation as number) - 1 < 1) {
          exclamationsIndexRef.current++;
          falseExclamationSERef.current?.play();
          exclamationPopAnimation();
          applyExclamationAnimation();
          resetChain();
          clearTimeouts();
        }
      }

      isExclamationTouched.current = true;

      function clearTimeouts() {
        if (startTimeoutRef.current !== null) {
          clearTimeout(startTimeoutRef.current);
        }
        if (swapTimeoutRef.current !== null) {
          clearTimeout(swapTimeoutRef.current);
        }
        if (endTimeoutRef.current !== null) {
          clearTimeout(endTimeoutRef.current);
        }

        if (exclamationCycleRef.current) {
          exclamationCycleRef.current();
        }
      }
    }
  }

  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [enemyHealth, setEnemyHealth] = useState(ENEMY_MAX_HEALTH);

  // Para evitar problemas de closures en callbacks asíncronos, se crean referencias
  const playerHealthRef = useRef(PLAYER_MAX_HEALTH);
  const enemyHealthRef = useRef(ENEMY_MAX_HEALTH);

  function widthPercentage(curValue: number, maxValue: number) {
    return `${(curValue / maxValue) * 100}%`;
  }

  function healthbarColor(curValue: number, maxValue: number) {
    const pct = (curValue / maxValue) * 100;
    if (pct > 80) return { color1: "#86efac", color2: "#22c55e" };
    if (pct > 60) return { color1: "#e2ff50", color2: "#b2e600" };
    if (pct > 40) return { color1: "#fde047", color2: "#eab308" };
    if (pct > 20) return { color1: "#fcd34d", color2: "#f97316" };
    return { color1: "#fca5a5", color2: "#ef4444" };
  }

  const playerHealthbarColor = healthbarColor(
    playerHealthRef.current,
    PLAYER_MAX_HEALTH,
  );
  const enemyHealthbarColor = healthbarColor(
    enemyHealthRef.current,
    ENEMY_MAX_HEALTH,
  );

  function battleStart() {
    nextTurn();
    setCanExclamationPop(true);
  }

  // Actualiza la referencia de la vida del jugador cada vez que cambia su estado.
  useEffect(() => {
    playerHealthRef.current = playerHealth;
  }, [playerHealth]);

  // Actualiza la referencia de la vida del oponente cada vez que cambia su estado.
  useEffect(() => {
    enemyHealthRef.current = enemyHealth;
  }, [enemyHealth]);

  const playerAccRef = useRef(0);
  const enemyAccRef = useRef(0);
  const doubleAttackRef = useRef<"Player" | "Enemy" | null>(null);
  const battleEndRef = useRef(false);

  const playerAttack = useCallback(() => {
    // if (battleEndRef.current) return;

    // Bonus de cadena. Sigue la fórmula de las subidas de Pokémon, pero partiendo de 20/20.
    const chainBonus = (20 + chainRef.current) / 20;

    const critical = playerIsCritical.current ? 1.25 : 1;
    const variation = calculateVariation();
    const dmg = Math.floor(
      PLAYER_DAMAGE * BOOST_POWER * critical * variation * chainBonus,
    );

    const newHealth = Math.max(enemyHealthRef.current - dmg, 0);
    if (BOOST_POWER !== 1) {
      enemyColorDamagePopup.current = "special";
      BOOST_POWER = 1;
    } else if (playerIsCritical.current) {
      enemyColorDamagePopup.current = "critical";
    } else {
      enemyColorDamagePopup.current = "normal";
    }
    playerIsCritical.current = false;
    removeStatus("player", "exclamation_attack");

    enemyHealthRef.current = newHealth;
    setEnemyHealth(newHealth);
    setEnemyDamagePopup(dmg);
    if (enemyHealthRef.current <= 0 || playerHealthRef.current <= 0) {
      battleEndRef.current = true;
      stopExclamation();
      return;
    }
  }, []);

  const playerGuard = useCallback(() => {
    // BLOCK_POWER = 0.8;
    addStatus("player", "exclamation_defense");

    playerActionRef.current = "attack";
  }, []);

  const enemyAttack = useCallback(() => {
    // if (battleEndRef.current) return;

    // Bonus de cadena. Sigue la fórmula de las bajadas de Pokémon, pero partiendo de 20/20.
    const chainBonus = 20 / (20 + chainRef.current);

    const isPlayerGuarding = isStatusAffected("player", "exclamation_defense");
    const critical = enemyIsCritical.current ? 1.25 : 1;
    const variation = calculateVariation();
    const dmg = isPlayerGuarding
      ? Math.floor(
          ENEMY_DAMAGE * BLOCK_POWER * critical * variation * chainBonus,
        )
      : Math.floor(ENEMY_DAMAGE * critical * variation * chainBonus);
    const newHealth = Math.max(playerHealthRef.current - dmg, 0);

    if (isPlayerGuarding) {
      playerColorDamagePopup.current = "guarding";
      BLOCK_POWER = 1;
    } else if (enemyIsCritical.current) {
      playerColorDamagePopup.current = "critical";
    } else {
      playerColorDamagePopup.current = "normal";
    }

    removeStatus("player", "exclamation_defense");
    enemyIsCritical.current = false;

    playerHealthRef.current = newHealth;
    setPlayerHealth(newHealth);
    setPlayerDamagePopup(dmg);

    if (playerHealthRef.current <= 0 || playerHealthRef.current <= 0) {
      battleEndRef.current = true;
      stopExclamation();
      return;
    }
  }, []);

  const [victoryAfterMath, setVictoryAfterMath] = useState(false);
  const [defeatAfterMath, setDefeatAfterMath] = useState(false);

  const handleBattleEnd = useCallback(() => {
    battleBGMRef.current?.stop();
    stopExclamation();
    if (enemyHealthRef.current <= 0) {
      function enemyDefeatAnimation() {
        return createTimeline({
          onBegin: () => enemyDefeatSERef.current?.play(),
        })
          .add(".enemy", { x: "-75%", duration: 500 })
          .add(".enemy", { opacity: 0, duration: 500 });
      }
      victoryMERef.current?.play();
      enemyDefeatAnimation();
    } else if (playerHealthRef.current <= 0) {
      defeatMERef.current?.play();
    }
  }, []);

  function handleVictory() {
    victoryBGMRef.current?.play();
    setVictoryAfterMath(true);
  }

  function handleDefeat() {
    defeatBGMRef.current?.play();
    setDefeatAfterMath(true);
  }

  const nextTurn = useCallback(async () => {
    let first: "Player" | "Enemy" = "Player";

    // 1) Determinamos el orden
    if (PLAYER_SPEED >= ENEMY_SPEED) {
      first = "Player";
    } else if (PLAYER_SPEED < ENEMY_SPEED) {
      first = "Enemy";
    }

    turnOrderRef.current = first;
    doubleAttackRef.current = null;

    // 2) Si no hay empate, calculamos la diferencia del vencedor con respecto al vencido y la sumamos a su acumulador
    if (PLAYER_SPEED !== ENEMY_SPEED) {
      const winnerSpeed = first === "Player" ? PLAYER_SPEED : ENEMY_SPEED;
      const looserSpeed = first === "Player" ? ENEMY_SPEED : PLAYER_SPEED;

      // porcentaje de diferencia
      const diffPercent = Math.floor(
        ((winnerSpeed - looserSpeed) / looserSpeed) * 100,
      );

      if (first === "Player") {
        const newAcc = diffPercent + playerAccRef.current;

        if (newAcc >= 100) {
          doubleAttackRef.current = "Player";
          playerAccRef.current = 0;
        } else {
          playerAccRef.current = newAcc;
        }
      } else {
        const newAcc = diffPercent + enemyAccRef.current;

        if (newAcc >= 100) {
          doubleAttackRef.current = "Enemy";
          enemyAccRef.current = 0;
        }
      }
    }

    const animacionJugador = async () => {
      function playerAttackSE() {
        playerIsCritical.current = Math.random() < PLAYER_CRITICAL;
        if (playerIsCritical.current) {
          criticalHitSERef.current?.play();
        } else {
          playerAttackSERef.current?.play();
        }
      }

      return (
        createTimeline({
          delay: 500,
        })
          // .call(() => prepAttackSERef.current?.play(), 0)
          .add(".hero", { filter: "brightness(125%)", duration: 200 })
          .add(".hero", { x: "225%", duration: 200 })
          .add(".hero", { x: "150%", duration: 200 })
          .add(".hero", { filter: "brightness(100%)", duration: 200 })
          .call(() => playerAttackSE(), "+=10")
          .add(".enemy", {
            opacity: [
              { to: 0, duration: 100 },
              { to: 1, duration: 100 },
            ],
            loop: 1,
            duration: 250,
          })
          .then(() => playerAttack())
      );
    };

    const animacionEnemigo = async () => {
      const isPlayerGuarding = isStatusAffected(
        "player",
        "exclamation_defense",
      );
      function playEnemyAttackSE() {
        enemyIsCritical.current = Math.random() < ENEMY_CRITICAL * BLOCK_POWER;

        if (isPlayerGuarding) {
          parrySERef.current?.play();
        } else if (enemyIsCritical.current) {
          criticalHitSERef.current?.play();
        } else {
          enemyAttackSERef.current?.play();
        }
      }
      return (
        createTimeline({
          delay: 500,
        })
          // .call(() => prepAttackSERef.current?.play(), 0)
          .add(".enemy", { filter: "brightness(125%)", duration: 200 })
          .add(".enemy", { x: "75%", duration: 200 })
          .add(".enemy", { x: "0%", duration: 200 })
          .add(".enemy", { filter: "brightness(100%)", duration: 200 })
          .call(() => playEnemyAttackSE(), "+=10")
          .add(".parry", {
            "z-index": isPlayerGuarding ? 2 : -1,
            duration: 0,
          })
          .add(".parry", {
            width: "10rem",
            height: "10rem",
            duration: isPlayerGuarding ? 160 : 0,
          })
          .add(".parry", {
            width: 0,
            height: 0,
            "z-index": -1,
            duration: 0,
          })
          .add(".hero", {
            opacity: [
              { to: 0, duration: 100 },
              { to: 1, duration: 100 },
            ],
            loop: 1,
            duration: 250,
          })
          .then(() => enemyAttack())
      );
    };

    async function guardFlow() {
      await startGuard();
      playerGuard();
    }

    // 3) Aquí se dispara el evento de "atacar" teniendo en cuenta doubleAttack y turnOrder
    async function attackAnim(contender: "Player" | "Enemy") {
      if (contender === "Player") {
        return playerActionRef.current === "attack"
          ? await animacionJugador()
          : await guardFlow();
      } else {
        return await animacionEnemigo();
      }
    }

    const battleSeq: ("Player" | "Enemy")[] = [];
    if (first === "Player") {
      battleSeq.push("Player");
      if (doubleAttackRef.current === "Player" && !battleEndRef.current)
        battleSeq.push("Player");
      if (!battleEndRef.current) battleSeq.push("Enemy");
    } else {
      battleSeq.push("Enemy");
      if (doubleAttackRef.current === "Enemy" && !battleEndRef.current)
        battleSeq.push("Enemy");
      if (!battleEndRef.current) battleSeq.push("Player");
    }

    for (const contender of battleSeq) {
      await attackAnim(contender);
      if (battleEndRef.current) break;
    }

    if (!battleEndRef.current) {
      nextTurn();
    } else {
      handleBattleEnd();
      return;
    }
  }, [
    doubleAttackRef,
    enemyAccRef,
    playerAccRef,
    handleBattleEnd,
    enemyAttack,
    playerAttack,
    playerGuard,
    startGuard,
  ]);

  function applyAllExclamationsAnimation() {
    let totalExclamations: string;

    if (exclamationAccRef.current === 1) {
      totalExclamations = ".exclamation-0";
    } else if (exclamationAccRef.current === 2) {
      totalExclamations = ".exclamation-0, .exclamation-1";
    } else {
      totalExclamations = ".exclamation-0, .exclamation-1, .exclamation-2";
    }

    return createTimeline({
      onBegin: () => applyAllExclamations(),
    })
      .add(`:is(${totalExclamations})`, {
        color: "#57534d",
        "z-index": 10,
        duration: 0,
      })
      .add(`:is(${totalExclamations}) + *`, {
        scaleX: 1.6,
        scaleY: 1.9,
        opacity: 0,
        color: "#57534d",
        "z-index": 0,
        duration: 700,
      })
      .add(`:is(${totalExclamations}) + *`, {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: 0,
      });
  }

  function handleEspecial() {
    decision2SERef.current?.play();
    if (exclamationAccRef.current === 1) {
      BOOST_POWER += 0.25;
    } else if (exclamationAccRef.current === 2) {
      BOOST_POWER += 0.65;
    } else if (exclamationAccRef.current === 3) {
      BOOST_POWER += 1.25;
    }
    applyAllExclamationsAnimation();
    addStatus("player", "exclamation_attack");
  }

  function applyExclamationAnimation() {
    if (exclamationAccRef.current === 0) return;
    return createTimeline({
      onBegin: () => applyExclamation(),
    })
      .add(`.exclamation-${exclamationAccRef.current - 1}`, {
        color: "#57534d",
        duration: 0,
      })
      .add(`.exclamation-${exclamationAccRef.current - 1} + *`, {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        "z-index": 10,
        color: "#ef4444",
        duration: 0,
      })
      .add(`.exclamation-${exclamationAccRef.current - 1} + *`, {
        scaleX: 1.6,
        scaleY: 1.9,
        opacity: 0,
        color: "#57534d",
        duration: 700,
      });
  }

  function handleDefense() {
    decision2SERef.current?.play();

    if (exclamationAccRef.current === 1) {
      BLOCK_POWER = 0.9;
    } else if (exclamationAccRef.current === 2) {
      BLOCK_POWER = 0.75;
    } else if (exclamationAccRef.current === 3) {
      BLOCK_POWER = 0.5;
    }

    applyAllExclamationsAnimation();
    playerActionRef.current = "guard";
    // addStatus("player", "exclamation_defense");
  }

  function handleBattleLog(log: React.ReactElement | null) {
    setBattleLog(log);
  }

  function handleTutorial() {
    decision1SERef.current?.play();
    setTutorial((prev) => prev - 1);
  }

  useEffect(() => {
    if (chain <= 1) return;

    const chainAnimation = createTimeline({});

    chainAnimation
      .add(".chain", { scale: 1.3, duration: 100 })
      .add(".chain", { scale: 1, duration: 100 });
  }, [chain]);

  function addChain() {
    setChain((prev) => prev + 1);
    chainRef.current++;
  }

  function resetChain() {
    setChain(0);
    chainRef.current = 0;
  }

  function handleBattleEndModal() {
    if (victoryAfterMath) {
      victoryBGMRef.current?.stop();
      navigate("level-4");
    } else {
      defeatBGMRef.current?.stop();
      window.location.reload();
    }
  }

  return (
    <div
      ref={root}
      className="flex h-[100dvh] items-center justify-center bg-black select-none"
    >
      <div className="relative flex h-[100dvh] w-[392px] flex-col overflow-hidden rounded-2xl border-4 border-slate-600">
        {/* ÁREA DE COMBATE */}
        <div className="grid flex-[0.55] grid-cols-1 grid-rows-1 items-center justify-between bg-[url(src/assets/images/battleback.webp)] bg-cover bg-no-repeat px-1">
          {battleLog && (
            <p className="battle-log battle-log-gradient h-6 w-full translate-x-full py-1 text-center text-sm text-white backdrop-blur-[1px]">
              {battleLog}
            </p>
          )}

          {chain > 1 && (
            <p className="chain outer-stroke absolute top-40 left-1/2 -translate-x-1/2 text-center text-lg font-semibold text-white backdrop-blur-[1px] text-shadow-xs">
              Cadena: <span>{chain}</span>
            </p>
          )}

          <div className="mb-4 flex w-full flex-col self-end">
            <div className="mb-4 flex gap-1">
              <div className="relative flex flex-1">
                <div className="relative flex flex-1 items-end gap-0.5 bg-blue-950/40 px-3 pt-1 pb-2.5 backdrop-blur-[1px] [clip-path:_polygon(5%_0%,_95%_0%,_100%_55%,_95%_100%,_5%_100%,_0_45%)]">
                  {/* BARRA DE VIDA DE JUGADOR */}
                  {/* <div className="sword-icon flex h-9 flex-[3rem] items-center justify-center rounded-full">
                    <SwordIcon className="size-7 text-white" />
                  </div> */}

                  <div className="flex w-full flex-col gap-px">
                    <div className="ml-1 flex h-4 gap-px">
                      {contenderStatus.player.map((status) => (
                        <div key={status}>{STATUS_ICONS[status]}</div>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="flex h-5 w-full overflow-hidden rounded-sm border border-lime-700 bg-black">
                        <div
                          style={{
                            width: widthPercentage(
                              playerHealthRef.current,
                              PLAYER_MAX_HEALTH,
                            ),
                            backgroundImage: `linear-gradient(to bottom,${playerHealthbarColor.color1}, ${playerHealthbarColor.color2} )`,
                          }}
                          className="h-full"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 left-0 z-10 flex w-full justify-end pr-2.5 pl-8">
                  <div className="flex flex-1/2 gap-px">
                    {exclamations.map((color, index) => (
                      <div key={index} className="relative">
                        <ExclamationStatusIcon
                          style={{ color: color }}
                          strokeColor="#0008"
                          className={`exclamation-${index}`}
                        />

                        <ExclamationStatusIcon
                          key={index}
                          style={{ color: color }}
                          strokeColor="#0008"
                          className="absolute top-0 left-0 -z-[1] h-full w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="outer-stroke -mt-1 w-full flex-1/2 text-right text-[0.625rem] font-medium text-white">
                    <span>{playerHealthRef.current}</span>/{" "}
                    <span>{PLAYER_MAX_HEALTH}</span>
                  </p>
                </div>
              </div>
              {/* BARRA DE VIDA DE ENEMIGO */}
              <div className="relative flex flex-[0.859] flex-row-reverse items-end gap-0.5 bg-rose-950/40 px-3 pt-1 pb-2.5 backdrop-blur-[1px] [clip-path:_polygon(5%_0%,_95%_0%,_100%_45%,_95%_100%,_5%_100%,_0_55%)]">
                {/* <div className="bug-icon flex size-9 flex-[3rem] items-center justify-center rounded-full">
                  <BugIcon className="size-7 text-white" />
                </div> */}
                <div className="flex w-full flex-col gap-px">
                  <div className="mr-1 flex h-4 flex-row-reverse"></div>
                  <div className="flex h-5 w-full justify-end overflow-hidden rounded-sm border border-lime-700 bg-black">
                    <div
                      style={{
                        width: widthPercentage(
                          enemyHealthRef.current,
                          ENEMY_MAX_HEALTH,
                        ),
                        backgroundImage: `linear-gradient(to bottom,${enemyHealthbarColor.color1}, ${enemyHealthbarColor.color2} )`,
                      }}
                      className="h-full"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={exclamationAreaRef}
              className="relative mx-4 flex items-end justify-between px-4 pt-12 pb-2"
            >
              {/* EXCLAMACIÓN */}
              {canExclamationPop && showExclamation && (
                <button
                  disabled={disabledRef.current}
                  onClick={handleClickExclamation}
                  style={{
                    top: exclamationPosition.top,
                    left: exclamationPosition.left,
                    borderColor:
                      exclamationTypeRef.current === "B"
                        ? "#6894c9bf"
                        : "#f2f8fcbf",
                    backgroundColor:
                      exclamationTypeRef.current === "B"
                        ? "#4a6aab66"
                        : "#b8e6fe80",
                    boxShadow:
                      exclamationTypeRef.current === "B"
                        ? "inset 0px 0px 16px 0 #557dbb"
                        : "inset 0px 0px 16px 0 #a5f3fc",
                  }}
                  className="exclamation-bubble absolute z-[10] size-14 cursor-pointer rounded-full border-2 opacity-0 outline outline-slate-500/50 backdrop-blur-[1px]"
                >
                  <div className="relative flex h-full items-center justify-center after:absolute after:top-0 after:z-10 after:mt-1 after:-ml-3 after:h-3 after:w-8 after:-rotate-[24deg] after:rounded-[50%] after:bg-white/60">
                    <p
                      style={{
                        color:
                          exclamationTypeRef.current === "B"
                            ? (renderExclamation as number) === 1
                              ? "#fde68a"
                              : "#eff"
                            : "oklch(57.7% 0.245 27.325 / 0.75)",
                        WebkitTextStroke:
                          exclamationTypeRef.current === "B"
                            ? "1px #6894c980"
                            : "1px #f2f8fc80",
                      }}
                      className="text-5xl font-black"
                    >
                      {renderExclamation}
                    </p>
                  </div>
                </button>
              )}
              <div
                style={{ filter: "brightness(100%)" }}
                className="hero relative -translate-x-[150%] overflow-visible"
              >
                <img
                  src={heroImage}
                  alt="hero"
                  className="size-24 scale-x-[-1]"
                />

                {/* PLAYER DAMAGE POP-UP */}
                {playerDamagePopup > 0 && (
                  <p
                    style={{
                      color: DAMAGE_POPUP_COLOR[playerColorDamagePopup.current],
                      textShadow: "1px 1px 1px black",
                    }}
                    className="player-damage-popup outer-stroke absolute top-1/2 left-1/2 -translate-1/2 text-xl font-bold"
                  >
                    {playerDamagePopup}
                  </p>
                )}

                {/* ANIMACIÓN DE DEFENDER */}
                {guardingStatus && (
                  <div className="shield absolute top-1/2 left-1/2 -translate-1/2 overflow-hidden opacity-0">
                    <div className="guard-mask relative size-24 overflow-hidden">
                      <div className="absolute top-0 left-0 size-full bg-cyan-600">
                        <div className="reflection -mt-22 -ml-10 h-[200%] w-5 bg-white/75 backdrop-blur-sm"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ANIMACIÓN DE BLOQUEO */}
                <div className="parry absolute top-1/2 left-1/2 -z-[1] size-0 -translate-1/2 rounded-[50%] border-[16px] border-white/5 backdrop-blur-[2px]"></div>
              </div>

              <div className="relative">
                <img
                  src={enemyImage}
                  alt="ladybug enemy"
                  className="enemy w-28 scale-x-[-1]"
                />

                {/* ENEMY DAMAGE POP-UP */}
                {enemyDamagePopup > 0 && (
                  <p
                    style={{
                      color: DAMAGE_POPUP_COLOR[enemyColorDamagePopup.current],
                      textShadow: "1px 1px 1px black",
                    }}
                    className="enemy-damage-popup outer-stroke absolute top-1/2 left-1/2 -translate-1/2 text-xl font-bold"
                  >
                    {enemyDamagePopup}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ÁREA DE INTERACCIÓN */}
        <div className="interactive-area-pattern relative flex flex-[0.45] flex-col items-center justify-center gap-8 border-t-2 border-slate-700 bg-zinc-300 px-4 py-4 shadow-[0px_0px_0px_6px_#45556c,_inset_0px_-2px_64px_8px_#2f3d4bcc] outline-4 outline-slate-400">
          <div className="grid h-full w-full grid-cols-2 grid-rows-[auto_repeat(2,_minmax(auto,1fr))] gap-x-4">
            <div className="exclamation-counter col-start-2 row-start-1 flex gap-2 justify-self-end p-1">
              <ExclamationStatusIcon
                style={{
                  color:
                    exclamationAccRef.current === 3 ? "#fef08a" : "#f2f8fc",
                }}
                className="scale-[175%]"
                strokeColor={
                  exclamationAccRef.current === 3 ? "#42200688" : "#666"
                }
              />
              <p
                style={{
                  color:
                    exclamationAccRef.current === 3 ? "#fef08a" : "#f2f8fc",
                  WebkitTextStrokeWidth: "1px",
                  WebkitTextStrokeColor:
                    exclamationAccRef.current === 3 ? "#42200688" : "#000",
                }}
                className="text-2xl font-semibold [paint-order:stroke_fill]"
              >
                x <span>{Math.max(exclamationAccRef.current, 0)}</span>
              </p>
            </div>

            <div className="col-start-1 row-start-2 self-center text-center">
              <button
                onClick={handleEspecial}
                disabled={
                  exclamationAccRef.current === 0 ||
                  playerActionRef.current !== "attack" ||
                  BOOST_POWER !== 1
                }
                className="group relative h-22 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-slate-800 bg-red-400 p-2 shadow-[inset_2px_2px_2px_0_#fff8,_inset_-2px_-2px_2px_0_#0008] transition-all enabled:active:scale-90 disabled:cursor-not-allowed disabled:bg-[#c88]"
              >
                <AttackButtonIcon className="absolute top-1/2 left-1/2 h-16 w-full -translate-1/2 text-white opacity-40" />
                <p className="outer-stroke relative z-[1] rounded-sm bg-red-700/35 py-5 text-xl font-semibold text-[#f2f8fc] transition-all group-disabled:bg-[#644]/35 group-disabled:text-neutral-300">
                  Golpe Fuerte
                </p>
              </button>
            </div>
            <div className="col-start-2 row-start-2 self-center text-center">
              <button
                onClick={handleDefense}
                disabled={
                  exclamationAccRef.current === 0 ||
                  playerActionRef.current !== "attack" ||
                  BLOCK_POWER !== 1
                }
                className="group relative h-22 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-slate-800 bg-blue-400 p-2 shadow-[inset_2px_2px_2px_0_#fff8,_inset_-2px_-2px_2px_0_#0008] transition-all enabled:active:scale-90 disabled:cursor-not-allowed disabled:bg-[#88c]"
              >
                <DefenseButtonIcon className="absolute top-1/2 left-1/2 h-16 w-full -translate-1/2 text-white opacity-40" />
                <p className="outer-stroke relative z-[1] rounded-sm bg-blue-700/35 py-5 text-xl font-semibold text-[#f2f8fc] group-disabled:bg-[#446]/35 group-disabled:text-neutral-300">
                  Defender
                </p>
              </button>
            </div>
          </div>
          {/* <div className="relative flex w-full items-center justify-center">
            BOTÓN DE ATAQUE ESPECIAL
            <button className="relative flex size-22 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border-2 border-slate-800 bg-slate-300 shadow-[inset_2px_2px_2px_0_#fff8,_inset_-2px_-2px_2px_0_#0008]">
              <SpecialAttackIcon className="size-12 text-slate-50" />
              <p className="text-center text-[0.625rem] font-medium">
                Ataque Especial
              </p>
              <div className="absolute top-0 right-0 left-0 h-[100%] bg-neutral-400/50"></div>
            </button>
          </div> */}

          {/* <div className="flex w-full justify-between">
            <div className="relative flex items-center gap-1.5">
              <button className="h-18 w-8 cursor-pointer">
                <CaretIcon
                  className="size-full"
                  strokeColor="black"
                  gradientColor1="#67e8f9"
                  gradientColor2="#0ea5e9"
                  gradientColor3="#0d94d8"
                  gradientColor4="#0284c7"
                />
              </button>
              <button className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md bg-slate-500 p-0.5 shadow-[inset_2px_2px_2px_0_#fff8,_inset_-2px_-2px_2px_0_#0008] outline-2 outline-black">
                <p className="text-center text-[0.625rem] font-medium text-white">
                  Tienes: <span>2</span>
                </p>
                <PotionIcon className="size-10 text-slate-50" />
              </button>

              <button className="h-18 w-8 scale-x-[-1] cursor-pointer">
                <CaretIcon
                  className="size-full"
                  strokeColor="black"
                  gradientColor1="#67e8f9"
                  gradientColor2="#0ea5e9"
                  gradientColor3="#0d94d8"
                  gradientColor4="#0284c7"
                />
              </button>

              <p className="outer-stroke absolute right-0 -bottom-5 left-0 text-center text-xs font-medium text-white">
                Poción
              </p>
            </div>
            <div className="relative flex items-center gap-1.5">
              <button className="h-18 w-8 cursor-pointer">
                <CaretIcon
                  className="size-full"
                  strokeColor="black"
                  gradientColor1="#bbf7d0"
                  gradientColor2="#86efac"
                  gradientColor3="#75ce9b"
                  gradientColor4="#4ade80"
                />
              </button>
              <button className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md bg-slate-500 p-0.5 shadow-[inset_2px_2px_2px_0_#fff8,_inset_-2px_-2px_2px_0_#0008] outline-2 outline-black">
                <p className="text-center text-xs font-medium text-white">
                  Arma Eq.
                </p>
                <SwordIcon className="size-10 text-slate-50" />
              </button>

              <button className="h-18 w-8 scale-x-[-1] cursor-pointer">
                <CaretIcon
                  className="size-full"
                  strokeColor="black"
                  gradientColor1="#bbf7d0"
                  gradientColor2="#86efac"
                  gradientColor3="#75ce9b"
                  gradientColor4="#4ade80"
                />
              </button>
              <p className="outer-stroke absolute right-0 -bottom-5 left-0 text-center text-xs font-medium text-white">
                Espada endeble
              </p>
            </div>
          </div> */}
        </div>

        {(victoryAfterMath || defeatAfterMath) && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 px-4">
            <div className="w-full rounded-xl border-4 border-[#5D7E9A] bg-[#f5f7fa] pb-6 shadow-[0px_0px_0px_3px_#1F2732]">
              <p className="mx-6 -translate-y-1/2 rounded-full border-2 border-[#7D9AB3] bg-[#3C5168] py-1 text-center text-[1.325rem] font-bold tracking-wide text-[#f5f7fa] shadow-[0px_-3px_0px_0px_#1F2732]">
                {victoryAfterMath ? "¡Enhorabuena!" : "¡Fin de partida!"}
              </p>

              <div className="mx-4 flex h-40 flex-col items-center justify-center gap-6 rounded-md border-2 border-[#7D9AB3]">
                <p className="text-6xl">{victoryAfterMath ? "⭐" : "🫠"}</p>
                <p className="text-xl font-semibold text-[#1f2732]">
                  {victoryAfterMath
                    ? "¡Has ganado el combate!"
                    : "¡Te han derrotado!"}
                </p>
              </div>

              <div className="mx-4 mt-6">
                <button
                  onClick={handleBattleEndModal}
                  className="btn-text-stroke w-full cursor-pointer rounded-full border-2 border-[#345] bg-[#496580] py-1 text-lg font-semibold text-[#f5f7fa] shadow-[inset_1px_1px_4px_0px_#fff8,_inset_-1px_-1px_4px_0px_#0008] transition-all duration-150 active:scale-90 active:bg-[#5d7e9a]"
                >
                  {victoryAfterMath ? "Continuar" : "Revancha"}
                </button>
              </div>
            </div>
          </div>
        )}
        {tutorial === 1 && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black px-4">
            <div className="w-full rounded-xl border-4 border-[#5D7E9A] bg-[#f5f7fa] pb-6 shadow-[0px_0px_0px_3px_#1F2732]">
              <p className="mx-6 -translate-y-1/2 rounded-full border-2 border-[#7D9AB3] bg-[#3C5168] py-1 text-center text-[1.325rem] font-bold tracking-wide text-[#f5f7fa] shadow-[0px_-3px_0px_0px_#1F2732]">
                Burbujas Inciertas
              </p>

              <div className="mx-4 h-[11.5rem]">
                <img
                  src={tutorialImage}
                  alt="tutorial"
                  className="w-full rounded-xs border-2 border-[#7d9ab3]"
                />
              </div>

              <p className="mt-4 px-4 text-center font-medium text-[#1f2732]">
                ¡Presta <span className="font-bold">atención</span>! Algunas{" "}
                <span className="text-red-500">interrogaciones</span>, se
                volverán <span className="text-red-500">exclamaciones</span>{" "}
                tras un <span className="font-bold">tiempo</span>.
              </p>

              <p className="mt-2 px-4 text-center font-medium text-[#1f2732]">
                ¡Es entonces cuando debes{" "}
                <span className="font-bold">tocarlas</span>!
              </p>

              <div className="mx-4 mt-6">
                <button
                  onClick={handleTutorial}
                  className="btn-text-stroke w-full cursor-pointer rounded-full border-2 border-[#345] bg-[#496580] py-1 text-lg font-semibold text-[#f5f7fa] shadow-[inset_1px_1px_4px_0px_#fff8,_inset_-1px_-1px_4px_0px_#0008] transition-all duration-150 active:scale-90 active:bg-[#5d7e9a]"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
