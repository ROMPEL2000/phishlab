import "@fontsource-variable/golos-text";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Crosshair,
  ExternalLink,
  Flag,
  CodeXml as Github,
  Inbox,
  Mail,
  MessageSquare,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldX,
  Target,
  X,
  Globe,
  BookOpen,
} from "lucide-react";
import { scenarios } from "./data";
import { grade, readProgress, STORAGE_KEY, type Answer } from "./logic";
import "./style.css";

function load() {
  try {
    return readProgress(localStorage.getItem(STORAGE_KEY), scenarios);
  } catch {
    return readProgress(null, scenarios);
  }
}
function App() {
  const [initial] = useState(load);
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    initial.answers,
  );
  const [active, setActive] = useState(initial.active);
  const [selected, setSelected] = useState<string[]>(
    initial.answers[initial.active]?.selected || [],
  );
  const [verdict, setVerdict] = useState<boolean | null>(
    initial.answers[initial.active]?.verdict ?? null,
  );
  const [view, setView] = useState<"training" | "results">("training");
  const [help, setHelp] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [retry, setRetry] = useState<string[] | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const s = scenarios.find((s) => s.id === active)!;
  const index = scenarios.indexOf(s);
  const answer = answers[s.id];
  const result = answer ? grade(s, answer) : null;
  const done = Object.keys(answers).length;
  const correct = scenarios.filter(
    (s) => answers[s.id] && grade(s, answers[s.id]).correct,
  ).length;
  const errors = scenarios.filter(
    (s) => answers[s.id] && !grade(s, answers[s.id]).correct,
  );
  const visible = retry
    ? scenarios.filter((s) => retry.includes(s.id))
    : scenarios;
  const position = visible.findIndex((x) => x.id === active);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, active }));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }, [answers, active]);
  useEffect(() => {
    if (help || resetOpen) modal.current?.showModal();
    else modal.current?.close();
  }, [help, resetOpen]);
  function open(id: string) {
    setActive(id);
    setSelected(answers[id]?.selected || []);
    setVerdict(answers[id]?.verdict ?? null);
    setView("training");
  }
  function toggle(id: string) {
    if (!answer)
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
  }
  function submit() {
    if (verdict !== null && !answer)
      setAnswers((prev) => ({ ...prev, [s.id]: { verdict, selected } }));
  }
  function next() {
    if (position < visible.length - 1) {
      open(visible[position + 1].id);
    } else {
      setView("results");
    }
    setTimeout(() => heading.current?.focus(), 0);
  }
  function repeat() {
    const ids = errors.map((s) => s.id);
    const rest = { ...answers };
    ids.forEach((id) => delete rest[id]);
    setAnswers(rest);
    setRetry(ids);
    setActive(ids[0]);
    setSelected([]);
    setVerdict(null);
    setView("training");
  }
  function reset() {
    setAnswers({});
    setRetry(null);
    setActive(scenarios[0].id);
    setSelected([]);
    setVerdict(null);
    setView("training");
    setResetOpen(false);
  }
  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setRetry(null);
            open(active);
          }}
          aria-label="Phishlab — тренажёр"
        >
          <span className="brand-icon">
            <Crosshair size={23} />
          </span>
          phishlab<span className="brand-dot">.</span>
        </a>
        <span className="top-divider" />
        <span className="top-caption">Практика цифровой внимательности</span>
        <div className="top-actions">
          <button
            className="text-button"
            aria-label="Как это работает"
            onClick={() => setHelp(true)}
          >
            <CircleHelp size={16} />
            <span>Как это работает</span>
          </button>
          <a
            className="github"
            href="https://github.com/ROMPEL2000/phishlab"
            target="_blank"
            rel="noreferrer"
            aria-label="Исходный код на GitHub"
          >
            <Github size={20} />
          </a>
        </div>
      </header>
      <main className="page">
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span className="live-dot" /> Интерактивная лаборатория
            </div>
            <h1>Доверяй. Но проверяй.</h1>
            <p>Замечайте детали. Распознавайте фишинг. Учитесь на практике.</p>
          </div>
          <div className="course-mark">
            <ShieldCheck size={24} />
            <div>
              Основы анализа фишинга
              <span>10 ситуаций · без ограничения времени</span>
            </div>
          </div>
        </section>
        <div className="workspace">
          <aside className="sidebar">
            <div className="side-top">
              <span className="section-label">Ваша практика</span>
              <span className="count">
                {done}/{scenarios.length}
              </span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-label="Пройдено ситуаций"
              aria-valuenow={done}
              aria-valuemin={0}
              aria-valuemax={10}
            >
              <span style={{ width: `${done * 10}%` }} />
            </div>
            <nav className="mode-nav" aria-label="Режим">
              <button
                className={view === "training" ? "active" : ""}
                onClick={() => setView("training")}
              >
                <Inbox size={17} />
                Разбор ситуаций<span>{retry ? "↻" : "10"}</span>
              </button>
              <button
                className={view === "results" ? "active" : ""}
                onClick={() => setView("results")}
              >
                <Target size={17} />
                Мои результаты
                {done > 0 && (
                  <span>
                    {correct}/{done}
                  </span>
                )}
              </button>
            </nav>
            <div className={`list-label ${retry ? "retry-label" : ""}`}>
              {retry ? "Повтор ошибок" : "Ситуации"}
              {retry && (
                <button
                  onClick={() => {
                    setRetry(null);
                  }}
                >
                  Все
                </button>
              )}
            </div>
            <nav className="scenario-list" aria-label="Учебные ситуации">
              {visible.map((item) => {
                const i = scenarios.indexOf(item);
                const a = answers[item.id];
                return (
                  <button
                    key={item.id}
                    aria-label={
                      String(i + 1).padStart(2, "0") + " · " + item.title
                    }
                    className={`scenario ${active === item.id && view === "training" ? "current" : ""}`}
                    onClick={() => open(item.id)}
                    aria-current={
                      active === item.id && view === "training"
                        ? "step"
                        : undefined
                    }
                  >
                    <span
                      className={`scenario-number ${a ? (grade(item, a).correct ? "passed" : "failed") : ""}`}
                    >
                      {a ? (
                        grade(item, a).correct ? (
                          <Check size={13} />
                        ) : (
                          <Flag size={12} />
                        )
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="scenario-copy">
                      <strong>{item.title}</strong>
                      <small>
                        {item.type} · {item.level}
                      </small>
                    </span>
                    <ChevronRight size={13} />
                  </button>
                );
              })}
            </nav>
            <div className="side-bottom">
              <Shield size={15} />
              <span>
                Учебные примеры.
                <br />
                Все организации вымышлены.
              </span>
            </div>
          </aside>
          <div className="content">
            {view === "training" ? (
              <>
                <div className="case-bar">
                  <span>
                    {s.type === "Письмо" ? (
                      <Mail size={16} />
                    ) : s.type === "Сообщение" ? (
                      <MessageSquare size={16} />
                    ) : (
                      <Globe size={16} />
                    )}{" "}
                    Ситуация {String(index + 1).padStart(2, "0")}{" "}
                    <span className="muted">/ 10</span>
                  </span>
                  <span className="level">{s.level}</span>
                </div>
                <div className="case-layout">
                  <section className="case-main">
                    <div className="case-heading">
                      <h2 ref={heading} tabIndex={-1}>
                        {s.title}
                      </h2>
                      <p>{s.context}</p>
                    </div>
                    <div className="selection-hint">
                      <Crosshair size={17} />
                      <span>
                        {answer
                          ? "Разбор отмеченных элементов"
                          : "Нажмите на элементы, которые вызывают подозрение"}
                      </span>
                    </div>
                    <article
                      className={`message ${s.type === "Страница" ? "web-message" : ""}`}
                      aria-label={s.subject}
                    >
                      <div className="message-top">
                        <div className="avatar">{s.initials}</div>
                        <div>
                          <strong>{s.sender}</strong>
                          <span>
                            {s.type === "Письмо"
                              ? "Сегодня, 10:42"
                              : s.type === "Сообщение"
                                ? "Личное сообщение"
                                : "Учебная копия страницы"}
                          </span>
                        </div>
                        <span className="message-type">{s.type}</span>
                      </div>
                      <h3>{s.subject}</h3>
                      <div className="message-parts">
                        {s.parts.map((part) => {
                          const chosen = selected.includes(part.id);
                          const status = answer
                            ? part.suspicious
                              ? "is-suspicious"
                              : chosen
                                ? "is-false"
                                : ""
                            : "";
                          return (
                            <button
                              key={part.id}
                              type="button"
                              className={`message-part ${chosen ? "selected" : ""} ${status}`}
                              aria-pressed={chosen}
                              aria-label={`${part.label}: ${part.text}`}
                              disabled={!!answer}
                              onClick={() => toggle(part.id)}
                            >
                              <span className="part-label">{part.label}</span>
                              <span
                                className={`part-text ${part.id === "link" || part.id === "url" ? "url-text" : ""}`}
                              >
                                {part.text}
                              </span>
                              <span className="part-marker">
                                {answer && part.suspicious ? (
                                  <Flag size={13} />
                                ) : chosen ? (
                                  <Check size={13} />
                                ) : (
                                  <span />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="simulation-label">
                        <Shield size={12} /> Симуляция: ссылки и формы неактивны
                      </div>
                    </article>
                    <div className="case-footer">
                      <span>
                        <Crosshair size={14} /> Отмечено элементов:{" "}
                        <b>{selected.length}</b>
                      </span>
                      {position > 0 && (
                        <button
                          className="text-button"
                          onClick={() => open(visible[position - 1].id)}
                        >
                          <ArrowLeft size={14} />
                          Предыдущая
                        </button>
                      )}
                    </div>
                  </section>
                  <aside className="analysis-panel">
                    {!answer ? (
                      <>
                        <div className="panel-icon">
                          <Shield size={21} />
                        </div>
                        <h3>Ваш вердикт</h3>
                        <p>
                          Изучите контекст, отметьте признаки и решите, можно ли
                          доверять сообщению.
                        </p>
                        <div className="verdict-options">
                          <button
                            className={verdict === true ? "chosen danger" : ""}
                            onClick={() => setVerdict(true)}
                            aria-pressed={verdict === true}
                          >
                            <ShieldX size={19} />
                            <span>
                              Это фишинг<small>Есть признаки атаки</small>
                            </span>
                            <span className="radio" />
                          </button>
                          <button
                            className={verdict === false ? "chosen safe" : ""}
                            onClick={() => setVerdict(false)}
                            aria-pressed={verdict === false}
                          >
                            <ShieldCheck size={19} />
                            <span>
                              Можно доверять
                              <small>В рамках этой ситуации</small>
                            </span>
                            <span className="radio" />
                          </button>
                        </div>
                        <button
                          className="primary"
                          disabled={verdict === null}
                          onClick={submit}
                        >
                          Проверить решение
                          <ArrowRight size={16} />
                        </button>
                        <div className="quiet-note">
                          <BookOpen size={16} />
                          <span>
                            В безопасной ситуации можно не отмечать ни одного
                            элемента.
                          </span>
                        </div>
                        <div className="tip">
                          <span>На что смотреть</span>
                          <p>
                            Кто отправитель? Куда ведёт ссылка? Какого действия
                            от вас ждут?
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="feedback" aria-live="polite">
                        <div
                          className={`feedback-title ${result!.correct ? "success" : "attention"}`}
                        >
                          {result!.correct ? (
                            <ShieldCheck size={24} />
                          ) : (
                            <Crosshair size={24} />
                          )}
                          <h3>
                            {result!.correct
                              ? "Точно подмечено"
                              : "Разберём детали"}
                          </h3>
                        </div>
                        <p className="verdict-summary">
                          {s.phishing
                            ? "В этой ситуации — фишинг."
                            : "По условиям ситуации — безопасно."}
                        </p>
                        <div className="result-chips">
                          <span>
                            {result!.verdictCorrect
                              ? "✓ Вердикт верный"
                              : "× Вердикт неверный"}
                          </span>
                          <span>
                            Признаки: {result!.hits}/{result!.expected.length}
                          </span>
                          {result!.extras > 0 && (
                            <span>Лишних отметок: {result!.extras}</span>
                          )}
                        </div>
                        <div className="explanations">
                          {s.parts
                            .filter(
                              (part) =>
                                part.suspicious || selected.includes(part.id),
                            )
                            .map((part) => (
                              <div key={part.id}>
                                <strong>
                                  {part.suspicious ? (
                                    <Flag size={13} />
                                  ) : (
                                    <CircleHelp size={13} />
                                  )}{" "}
                                  {part.label}
                                  {part.suspicious &&
                                    !selected.includes(part.id) && (
                                      <small>Пропущено</small>
                                    )}
                                </strong>
                                <p>{part.explanation}</p>
                              </div>
                            ))}
                          {!s.phishing && selected.length === 0 && (
                            <p>{s.lesson}</p>
                          )}
                        </div>
                        <div className="next-action">
                          <strong>Как поступить</strong>
                          <p>{s.action}</p>
                        </div>
                        <button className="primary" onClick={next}>
                          {position < visible.length - 1
                            ? "Следующая ситуация"
                            : "Посмотреть результат"}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </aside>
                </div>
              </>
            ) : (
              <section className="results">
                <div className="panel-icon large">
                  <Target size={28} />
                </div>
                <span className="eyebrow">Ваша практика</span>
                <h2 ref={heading} tabIndex={-1}>
                  {done === 10
                    ? "Разбор завершён"
                    : "Каждая деталь имеет значение"}
                </h2>
                <p>
                  Верный разбор — это правильный вердикт и все подозрительные
                  признаки без лишних отметок.
                </p>
                <div className="stats">
                  <div>
                    <strong>
                      {done}
                      <small>/ 10</small>
                    </strong>
                    <span>ситуаций разобрано</span>
                  </div>
                  <div>
                    <strong>{correct}</strong>
                    <span>полностью верных разборов</span>
                  </div>
                  <div>
                    <strong>
                      {done ? Math.round((correct / done) * 100) : 0}
                      <small>%</small>
                    </strong>
                    <span>точность разборов</span>
                  </div>
                </div>
                <div className="result-buttons">
                  {done < 10 && (
                    <button
                      className="primary"
                      onClick={() => {
                        setRetry(null);
                        open(scenarios.find((s) => !answers[s.id])!.id);
                      }}
                    >
                      Продолжить практику
                      <ArrowRight size={16} />
                    </button>
                  )}
                  {errors.length > 0 && (
                    <button className="secondary" onClick={repeat}>
                      <RotateCcw size={16} />
                      Повторить ошибки ({errors.length})
                    </button>
                  )}
                  <button
                    className="text-button"
                    onClick={() => setResetOpen(true)}
                  >
                    Начать заново
                  </button>
                </div>
                {done > 0 && (
                  <div className="result-list">
                    {scenarios
                      .filter((s) => answers[s.id])
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setRetry(null);
                            open(s.id);
                          }}
                        >
                          <span
                            className={
                              grade(s, answers[s.id]).correct
                                ? "success"
                                : "attention"
                            }
                          >
                            {grade(s, answers[s.id]).correct ? (
                              <Check size={17} />
                            ) : (
                              <Flag size={17} />
                            )}
                          </span>
                          <span>{s.title}</span>
                          <small>
                            {grade(s, answers[s.id]).correct
                              ? "Верно"
                              : "Есть что разобрать"}
                          </small>
                          <ChevronRight size={15} />
                        </button>
                      ))}
                  </div>
                )}
                <div className="results-note">
                  {done === 10 && correct === 10
                    ? "Отличная работа. В реальной переписке продолжайте проверять контекст и пользоваться независимыми каналами связи."
                    : "Результат отражает текущие ответы, включая повторные попытки. Это практика, а не сертификационный экзамен."}
                </div>
              </section>
            )}
          </div>
        </div>
        <footer>
          <span>
            Phishlab <span className="footer-separator">/</span> Учиться
            замечать больше.
          </span>
          <span className={storageFailed ? "attention" : ""}>
            {storageFailed
              ? "Не удалось сохранить прогресс в этом браузере"
              : "Прогресс хранится только в вашем браузере"}
          </span>
          <button className="text-button" onClick={() => setHelp(true)}>
            О проекте
            <ExternalLink size={13} />
          </button>
        </footer>
      </main>
      <dialog
        aria-label={resetOpen ? "Сброс прогресса" : "О лаборатории"}
        ref={modal}
        onCancel={() => {
          setHelp(false);
          setResetOpen(false);
        }}
        onClick={(e) => {
          if (e.target === modal.current) {
            setHelp(false);
            setResetOpen(false);
          }
        }}
      >
        <div className="modal-content">
          <button
            className="modal-close"
            aria-label="Закрыть"
            onClick={() => {
              setHelp(false);
              setResetOpen(false);
            }}
          >
            <X size={21} />
          </button>
          {resetOpen ? (
            <>
              <h2>Начать с чистого листа?</h2>
              <p>Текущие ответы и прогресс будут удалены из этого браузера.</p>
              <button className="primary" onClick={reset}>
                Сбросить прогресс
              </button>
              <button className="secondary" onClick={() => setResetOpen(false)}>
                Продолжить обучение
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">О лаборатории</span>
              <h2>Пауза перед кликом.</h2>
              <p>
                Phishlab — тренажёр для начинающих специалистов по
                информационной безопасности.
              </p>
              <ol>
                <li>Прочитайте контекст ситуации.</li>
                <li>
                  Отметьте подозрительные элементы письма, сообщения или
                  страницы.
                </li>
                <li>Выберите вердикт и проверьте решение.</li>
                <li>Изучите разбор и повторите ошибки.</li>
              </ol>
              <p>
                Все примеры вымышлены. Адреса используют зарезервированный домен
                .example. Здесь нет настоящих форм входа, отправки данных или
                переходов по учебным ссылкам.
              </p>
              <p>
                Оценка строится на заданных условиях. В реальной работе знакомый
                адрес или HTTPS не гарантируют безопасность, а один тревожный
                признак не всегда доказывает атаку.
              </p>
              <a
                href="https://www.cisa.gov/secure-our-world/recognize-and-report-phishing"
                target="_blank"
                rel="noreferrer"
              >
                Подробнее о распознавании фишинга — CISA{" "}
                <ExternalLink size={13} />
              </a>
              <p className="muted">
                Прогресс сохраняется локально. Учётная запись не требуется.
              </p>
              <button className="primary" onClick={() => setHelp(false)}>
                Перейти к практике
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
