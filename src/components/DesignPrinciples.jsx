import React, { useMemo } from 'react';
import {
    CheckCircle2,
    Info,
    Type,
    Layout,
    Component as ComponentIcon,
    AlertTriangle,
    Zap,
    Eye,
    Anchor,
    Palette as PaletteIcon,
    X,
    MousePointer2,
    AlertCircle,
    HelpCircle,
    Trophy
} from 'lucide-react';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import namesPlugin from 'colord/plugins/names';

// Extend colord with necessary plugins
extend([a11yPlugin, namesPlugin]);

const DesignPrinciples = ({ colors, onClose }) => {
    if (!colors || colors.length === 0) return null;

    const primary = colors[0];
    const secondary = colors[1] || colors[0];
    const accent = colors[2] || colors[1] || colors[0];
    const neutral = '#F8FAFC'; // Standard web neutral

    const primaryObj = colord(primary);
    const secondaryObj = colord(secondary);
    const accentObj = colord(accent);

    // Analysis helpers
    const getContrast = (bg, fg) => {
        const ratio = colord(bg).contrast(colord(fg));
        return {
            ratio: Math.round(ratio * 100) / 100,
            passAA: ratio >= 4.5,
            passLargeAA: ratio >= 3,
            passAAA: ratio >= 7,
            passLargeAAA: ratio >= 4.5
        };
    };

    const checkVibrationRisk = (c1, c2) => {
        const o1 = colord(c1).toHsl();
        const o2 = colord(c2).toHsl();
        // Vibrating colors usually have high saturation (>70%) and similar lightness (difference < 20%)
        const highSat = o1.s > 70 && o2.s > 70;
        const closeLight = Math.abs(o1.l - o2.l) < 20;
        const farHue = Math.abs(o1.h - o2.h) > 100 && Math.abs(o1.h - o2.h) < 260; // Opposite-ish
        return highSat && closeLight && farHue;
    };

    const checkColorBlindnessRisk = useMemo(() => {
        const risks = [];
        colors.forEach((c1, i) => {
            colors.forEach((c2, j) => {
                if (i >= j) return;
                const o1 = colord(c1).toHsl();
                const o2 = colord(c2).toHsl();

                // Red-Green risk
                const isRed1 = o1.h < 25 || o1.h > 335;
                const isGreen2 = o2.h > 75 && o2.h < 165;
                const isRed2 = o2.h < 25 || o2.h > 335;
                const isGreen1 = o1.h > 75 && o1.h < 165;

                if ((isRed1 && isGreen2) || (isRed2 && isGreen1)) {
                    risks.push(`Conflict: ${c1} and ${c2} may be indistinguishable (Red-Green deficiency).`);
                }
            });
        });
        return risks;
    }, [colors]);

    const accessibilityPairings = [
        { name: 'Primary on Light', bg: '#FFFFFF', fg: primary },
        { name: 'Secondary on Light', bg: '#FFFFFF', fg: secondary },
        { name: 'Accent on Light', bg: '#FFFFFF', fg: accent },
        { name: 'Body Text vs Primary', bg: primary, fg: primaryObj.isLight() ? '#000000' : '#FFFFFF' },
        { name: 'Secondary on Primary', bg: primary, fg: secondary },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-end z-[100] animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Modern Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b p-8 flex items-center justify-between z-30">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg ring-4 ring-indigo-50">
                                <PaletteIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Design OS</h2>
                        </div>
                        <p className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
                            <Anchor className="w-4 h-4" />
                            Verified Web Standards (WCAG 2.2 + Pantone Digital)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 text-gray-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-12 pb-24">
                    {/* Pantone Branding Section */}
                    <section className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 uppercase tracking-widest">
                            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Brand Authentication
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-4 rounded-xl border-4 border-gray-100 flex flex-col aspect-[3/4] shadow-2xl scale-100 hover:scale-[1.02] transition-transform">
                                <div className="flex-1 rounded-sm mb-6" style={{ backgroundColor: primary }} />
                                <div className="px-2">
                                    <div className="font-black text-3xl tracking-tighter italic text-gray-900">PANTONE®</div>
                                    <div className="text-xl font-black text-gray-800 uppercase mt-1">BRAND-{primary.replace('#', '')}</div>
                                    <div className="h-px bg-gray-200 my-3" />
                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Digital Master Sample</div>
                                        <div className="text-[10px] text-gray-500 font-bold">2024 EDITION</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" /> Color Psychology
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Based on your primary hue ({Math.round(primaryObj.toHsl().h)}°), this brand communicates
                                        <span className="font-bold text-gray-900">
                                            {primaryObj.toHsl().h < 60 ? ' High Energy & Optimism' :
                                                primaryObj.toHsl().h < 180 ? ' Growth, Balance & Nature' :
                                                    primaryObj.toHsl().h < 280 ? ' Trust, Depth & Stability' :
                                                        ' Creativity, Luxury & Wisdom'}
                                        </span>.
                                    </p>
                                </div>
                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                                        <Anchor className="w-4 h-4 text-indigo-600" /> Consistency Rule
                                    </h4>
                                    <p className="text-xs text-indigo-700 leading-relaxed italic">
                                        "Ensure you use consistent HEX values across all digital touchpoints. Pantone colors in web should be tested against common sRGB profiles to prevent brand drift."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Layout Rules (60-30-10) */}
                    <section className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Trophy className="w-12 h-12 text-white/10" />
                        </div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <Layout className="w-5 h-5 text-indigo-400" />
                            The Architectural Blueprint
                        </h3>
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h4 className="font-bold text-lg text-indigo-300">The 60-30-10 Rule</h4>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Perfect Equilibrium</span>
                                </div>
                                <div className="flex h-20 w-full rounded-2xl overflow-hidden border-4 border-white/10 shadow-inner">
                                    <div className="h-full bg-slate-100 flex items-center justify-center text-gray-900 text-[10px] font-black uppercase tracking-tighter" style={{ width: '60%' }}>Neutral (60%)</div>
                                    <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter" style={{ backgroundColor: secondary, width: '30%' }}>Support (30%)</div>
                                    <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter shadow-2xl" style={{ backgroundColor: primary, width: '10%' }}>Accent (10%)</div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Professional digital composition relies on balance. <span className="text-white font-bold">60%</span> for the Canvas (Neutral), <span className="text-white font-bold">30%</span> for Layout elements, and <span className="text-white font-bold">10%</span> for Interaction anchors.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="space-y-2">
                                    <h5 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2">
                                        <Type className="w-3.5 h-3.5" /> Typographic Weight
                                    </h5>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Use high contrast for headings (H1, H2) and slightly lower (but still AA compliant) contrast for body text to create reading rhythm.
                                    </p>
                                </div>
                                <div className="space-y-2 border-l border-white/10 pl-4">
                                    <h5 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2">
                                        <MousePointer2 className="w-3.5 h-3.5" /> Ghost Buttons
                                    </h5>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Use <span style={{ color: secondary }}>{secondary}</span> for secondary actions. Only the 10% accent should be used for the mission-critical CTA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Accessibility (WCAG 2.2) */}
                    <section className="bg-amber-50/40 p-8 rounded-[2rem] border-2 border-amber-100 relative">
                        <div className="absolute -top-4 -left-4 bg-amber-500 p-2 rounded-xl border-4 border-white shadow-lg">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 uppercase tracking-widest pl-4">
                            Accessibility Guardrails
                        </h3>

                        {/* Error Alerts */}
                        <div className="space-y-3 mb-8">
                            {checkColorBlindnessRisk.length > 0 && (
                                <div className="p-4 bg-red-600 rounded-2xl flex gap-4 shadow-xl border-4 border-red-500 animate-bounce-subtle">
                                    <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Critical UX Conflict</h4>
                                        {checkColorBlindnessRisk.map((risk, i) => (
                                            <p key={i} className="text-xs text-red-50 font-medium">{risk}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {checkVibrationRisk(primary, secondary) && (
                                <div className="p-4 bg-orange-500 rounded-2xl flex gap-4 border-4 border-orange-400 shadow-lg">
                                    <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Visual Vibration Detected</h4>
                                        <p className="text-xs text-orange-50 font-medium tracking-tight">
                                            {primary} and {secondary} have similar lightness and high saturation. Placing them next to each other creates "vibrating" edges that cause eye strain.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {accessibilityPairings.map((pair, i) => {
                                const results = getContrast(pair.bg, pair.fg);
                                return (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:shadow-2xl transition-all group overflow-hidden relative">
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border-4 border-gray-50 bg-gray-50 flex-shrink-0" style={{ backgroundColor: pair.bg, color: pair.fg }}>Aa</div>
                                            <div>
                                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{pair.name}</span>
                                                <div className="flex gap-2 mt-1.5 focus-within:">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm ${results.passAA ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>AA {results.passAA ? 'PASS' : 'FAIL'}</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm ${results.passAAA ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-gray-500'}`}>AAA {results.passAAA ? 'PASS' : 'FAIL'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <div className={`text-3xl font-black italic ${results.passAA ? 'text-gray-900' : 'text-red-600'}`}>
                                                {results.ratio}:1
                                            </div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contrast Ratio</div>
                                        </div>
                                        {/* Hover Decoration */}
                                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-1/2 translate-y-1/2 group-hover:bg-indigo-600 transition-colors opacity-0 group-hover:opacity-10" />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 p-6 bg-white/60 rounded-2xl border-2 border-dashed border-amber-200 flex gap-4">
                            <HelpCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <div className="space-y-1">
                                <h5 className="text-xs font-black uppercase text-amber-700 tracking-widest">A11y Pro Tip</h5>
                                <p className="text-[11px] text-amber-800 leading-relaxed italic font-medium">
                                    "Don't rely on color alone. Status messages should have icons (Check/Exclamation) and distinct font weights to ensure users with Color Vision Deficiency can navigate without friction."
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Meaningful Interaction (Semantic) */}
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 uppercase tracking-widest">
                            <MousePointer2 className="w-5 h-5 text-indigo-600" />
                            Semantic Interaction
                        </h3>
                        <div className="space-y-6">
                            <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner group">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="h-6 w-1/2 rounded-full font-black text-2xl tracking-tighter" style={{ color: colord(primary).darken(0.3).toHex() }}>Dashboard</div>
                                            <div className="h-2 w-full rounded-full bg-slate-200" />
                                            <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                                        </div>
                                        <div className="flex gap-4">
                                            {/* Interaction States */}
                                            <div className="flex-1 space-y-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default State</div>
                                                <div className="h-12 w-full rounded-xl shadow-lg border-2" style={{ backgroundColor: primary, borderColor: primary }} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hover / Active</div>
                                                <div className="h-12 w-full rounded-xl shadow-inner border-2 transition-all transform hover:scale-105" style={{ backgroundColor: colord(primary).darken(0.1).toHex(), borderColor: colord(primary).darken(0.2).toHex() }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 border-l-2 border-slate-200 pl-8 hidden md:block">
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">UI Feedback (Semantic)</h5>
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-bold text-slate-600">Action Successful</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border-2" style={{ borderColor: accent }}>
                                                <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: accent }} />
                                                <span className="text-[10px] font-bold text-slate-600">Scanning in progress...</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl shadow-sm border border-red-100">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                <span className="text-[10px] font-bold text-red-700">System Warning</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tag System */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                {['Primary Brand', 'Secondary Support', 'Accent Utility'].map((label, i) => (
                                    <span key={i} className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm transition-all hover:translate-y-[-2px] cursor-default"
                                        style={{
                                            borderColor: i === 0 ? primary : i === 1 ? secondary : accent,
                                            color: i === 0 ? primary : i === 1 ? secondary : accent,
                                            backgroundColor: 'transparent'
                                        }}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Professional Footer */}
                <div className="p-10 border-t mt-auto bg-slate-900 flex items-center justify-between text-white">
                    <div className="w-3/4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Design Ethos</span>
                        </div>
                        <p className="text-2xl font-black italic leading-tight text-white/90">
                            "Great design is a marriage of <span className="text-indigo-400">precision</span>, <span className="text-white">accessibility</span>, and <span className="text-indigo-400">invisible logic</span>."
                        </p>
                        <p className="text-[10px] font-bold text-white/30 mt-4 uppercase tracking-[0.4em]">Color Coder Core Engine • v2.0</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-indigo-600 p-5 rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.4)] border-4 border-white/20">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Certified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignPrinciples;
