import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How We Validate Opportunities</h3>
              <p className="text-xs text-slate-400">Our 6-stage algorithmic validation pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-300">
          <div className="flex gap-3">
            <span className="font-mono text-xs text-indigo-400 font-bold mt-0.5">01</span>
            <div>
              <h4 className="font-semibold text-white mb-1">AI Candidate Generation</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                We prompt the AI (Groq / Gemini) to brainstorm 25 to 35 commercially specific product,
                service, and business angles related to the entered niche, avoiding generic duplicates.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-mono text-xs text-indigo-400 font-bold mt-0.5">02</span>
            <div>
              <h4 className="font-semibold text-white mb-1">Google Trends Search Querying via SerpApi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Each candidate query is queried against the official Google Trends engine via SerpApi,
                retrieving the 12-month relative interest timeline, geographic concentration, and related search queries.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-mono text-xs text-indigo-400 font-bold mt-0.5">03</span>
            <div>
              <h4 className="font-semibold text-white mb-1">Zero Hallucination Filtering</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Candidates that return zero search interest or lack sufficient timeline activity are flagged
                as "Insufficient Trend Evidence" and excluded from the validated list. We never invent search volume or trends.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-mono text-xs text-indigo-400 font-bold mt-0.5">04</span>
            <div>
              <h4 className="font-semibold text-white mb-1">Momentum & Opportunity Scoring Formula</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                The Opportunity Score (0–100) is calculated mathematically:
                <br />
                • <strong className="text-slate-200">Current Relative Interest (0–35 pts)</strong>: Indexed recent interest level.
                <br />
                • <strong className="text-slate-200">Momentum Growth Rate (0–30 pts)</strong>: % change comparing recent 6-week avg vs 6-month baseline.
                <br />
                • <strong className="text-slate-200">Peak Search Volume (0–15 pts)</strong>: Peak interest indexed over 52 weeks.
                <br />
                • <strong className="text-slate-200">Geographic & Rising Queries (0–20 pts)</strong>: Regional distribution and rising search signals.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="font-mono text-xs text-indigo-400 font-bold mt-0.5">05</span>
            <div>
              <h4 className="font-semibold text-white mb-1">AI Evidence Interpretation</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                The validated metrics are passed back to the AI for evidence-grounded interpretation.
                The model is strictly prohibited from inventing statistics and explains why the observed trend curve matters commercially.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Important Note on Google Trends:</span>
              <p className="mt-0.5">
                Google Trends represents <em>relative search interest</em> indexed on a 0–100 scale,
                where 100 is the peak search interest over the timeframe, rather than absolute raw search volume.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
