import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle, Activity } from 'lucide-react';

interface AnalysisProgressProps {
  niche: string;
}

interface Step {
  id: number;
  label: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    label: 'Understanding your niche & search semantics',
    detail: 'Deconstructing core industry terms and buyer search patterns',
  },
  {
    id: 2,
    label: 'Generating candidate pool via AI',
    detail: 'Brainstorming 25–35 distinct, commercially specific opportunity hypotheses',
  },
  {
    id: 3,
    label: 'Querying SerpApi Google Trends Engine',
    detail: 'Fetching 12-month relative interest timeline and geographic signals',
  },
  {
    id: 4,
    label: 'Measuring trend momentum & filtering noise',
    detail: 'Calculating baseline vs recent growth and rejecting terms with insufficient search interest',
  },
  {
    id: 5,
    label: 'Synthesizing evidence-backed commercial insights',
    detail: 'Grounding market angles strictly in verified Google search data',
  },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ niche }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Progressively advance through stages while awaiting backend response
    const timers = [
      setTimeout(() => setCurrentStep(2), 1200),
      setTimeout(() => setCurrentStep(3), 3200),
      setTimeout(() => setCurrentStep(4), 6800),
      setTimeout(() => setCurrentStep(5), 9800),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-12 p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Analyzing <span className="text-indigo-400">"{niche}"</span>
          </h3>
          <p className="text-xs text-slate-400">
            Validating candidate opportunities against Google Trends search data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 transition-opacity duration-300 ${
                isDone
                  ? 'text-slate-300'
                  : isCurrent
                  ? 'text-white'
                  : 'text-slate-600 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{step.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Source: SerpApi Google Trends</span>
        <span>Relative Interest (0–100)</span>
      </div>
    </div>
  );
};
