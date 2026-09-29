import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {animated, useReducedMotion, useSpring} from "@react-spring/web";
import "./styles.css";

const STEPS = [
  {
    eyebrow: "1 MINUTE AI DEMO",
    title: "Ask AI to make something clearer",
    body: "AI can help turn a complicated idea into plain language. You stay in control of what you keep.",
    example: "Try: “Explain artificial intelligence in simple language for someone completely new to it.”"
  },
  {
    eyebrow: "WHAT JUST HAPPENED?",
    title: "You gave AI a goal and an audience",
    body: "That small instruction changes the answer. Good AI use starts with a clear goal, useful context, and a result you can check.",
    example: "Next time, add what you already know, the format you want, and what a good answer should include."
  }
];

function track(name, detail={}) {
  window.dispatchEvent(new CustomEvent("civicascent:analytics", {detail:{name, ...detail}}));
}

function App(){
  const reduceMotion = useReducedMotion();
  const [open,setOpen] = useState(false);
  const [step,setStep] = useState(0);
  const [choice,setChoice] = useState("");
  const dialogRef = useRef(null);

  const world = useSpring({
    from:{scale:1.015, y:0},
    to:{scale: reduceMotion ? 1 : 1.035, y: reduceMotion ? 0 : -4},
    loop: reduceMotion ? false : {reverse:true},
    config:{tension:18, friction:48, mass:5}
  });

  const intro = useSpring({
    from:{opacity:0, y: reduceMotion ? 0 : 18},
    to:{opacity:1, y:0},
    config:{tension:120, friction:26}
  });

  const panel = useSpring({
    opacity: open ? 1 : 0,
    y: open ? 0 : (reduceMotion ? 0 : 24),
    config:{tension:180, friction:24}
  });

  useEffect(()=>{
    track("landing_view");
  },[]);

  useEffect(()=>{
    if(open) {
      track("guided_experience_start");
      setTimeout(()=>dialogRef.current?.focus(),0);
    }
  },[open]);

  function start(){
    setOpen(true);
    setStep(0);
    setChoice("");
    track("start_here");
  }

  function next(){
    if(step < STEPS.length-1) setStep(s=>s+1);
    else {
      setChoice("continue");
      track("guided_experience_complete");
    }
  }

  function choose(value){
    setChoice(value);
    track("next_action", {value});
  }

  return (
    <main className="experience">
      <animated.div
        className="world"
        style={{transform: world.scale.to(s=>`scale(${s}) translateY(${world.y.get()}px)`)}}
        aria-hidden="true"
      >
        <div className="world-media"/>
        <div className="water-shimmer"/>
        <div className="haze"/>
      </animated.div>

      <div className="contrast" aria-hidden="true"/>

      <animated.section className="intro" style={intro}>
        <p className="brand">CIVICASCENT AI</p>
        <h1>AI should feel <span>possible.</span></h1>
        <p className="lede">Start with one clear experience. Learn what AI can do, try it yourself, and choose where to go next.</p>
        <button className="start" onClick={start} data-analytics-event="start_here">
          Start here <span aria-hidden="true">→</span>
        </button>
        <p className="reassurance">A calm first step for people new to AI.</p>
      </animated.section>

      <div className="access-note">Reduced motion supported · Voice optional · Keyboard + touch</div>

      {open && (
        <div className="guided-shell" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
          <animated.section
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            className="guided"
            style={panel}
          >
            <button className="close" aria-label="Close guided experience" onClick={()=>setOpen(false)}>×</button>
            {!choice ? (
              <>
                <p className="eyebrow">{STEPS[step].eyebrow}</p>
                <h2 id="guide-title">{STEPS[step].title}</h2>
                <p>{STEPS[step].body}</p>
                <blockquote>{STEPS[step].example}</blockquote>
                <button className="continue" onClick={next}>
                  {step === STEPS.length-1 ? "Finish this step" : "Show me why"}
                </button>
              </>
            ) : (
              <>
                <p className="eyebrow">YOUR NEXT MOVE</p>
                <h2 id="guide-title">Choose what feels useful now.</h2>
                <p>You do not need to learn everything at once.</p>
                <nav className="next-actions" aria-label="Next learning actions">
                  {["Learn","Try","Get Help","Continue"].map(item=>(
                    <button key={item} onClick={()=>choose(item.toLowerCase())}>{item}<span aria-hidden="true">→</span></button>
                  ))}
                </nav>
              </>
            )}
            {choice && choice !== "continue" && (
              <div className="choice-result" aria-live="polite">
                <strong>{choice === "get help" ? "Get Help" : choice[0].toUpperCase()+choice.slice(1)}</strong>
                <p>This destination is intentionally held until the first vertical slice passes visual, accessibility, and business validation.</p>
              </div>
            )}
          </animated.section>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
