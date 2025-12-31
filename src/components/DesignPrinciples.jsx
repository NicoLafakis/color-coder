import React, { useMemo } from 'react';
import {
    CheckCircle2,
    Type,
    Layout,
    AlertTriangle,
    Zap,
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

extend([a11yPlugin, namesPlugin]);

const DesignPrinciples = ({ colors, onClose }) => {
    if (!colors || colors.length === 0) return null;

    const primary = colors[0];
    const secondary = colors[1] || colors[0];
    const accent = colors[2] || colors[1] || colors[0];

    const primaryObj = colord(primary);

    const getContrast = (bg, fg) => {
        const ratio = colord(bg).contrast(colord(fg));
        return {
            ratio: Math.round(ratio * 100) / 100,
            passAA: ratio >= 4.5,
            passAAA: ratio >= 7,
        };
    };

    const checkVibrationRisk = (c1, c2) => {
        const o1 = colord(c1).toHsl();
        const o2 = colord(c2).toHsl();
        const highSat = o1.s > 70 && o2.s > 70;
        const closeLight = Math.abs(o1.l - o2.l) < 20;
        const farHue = Math.abs(o1.h - o2.h) > 100 && Math.abs(o1.h - o2.h) < 260;
        return highSat && closeLight && farHue;
    };

    const checkColorBlindnessRisk = useMemo(() => {
        const risks = [];
        colors.forEach((c1, i) => {
            colors.forEach((c2, j) => {
                if (i >= j) return;
                const o1 = colord(c1).toHsl();
                const o2 = colord(c2).toHsl();
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
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center lg:justify-end z-[100] p-2 md:p-0 overflow-hidden">
            <div className="bg-white w-full lg:max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col rounded-2xl lg:rounded-none">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b p-4 md:p-6 flex items-center justify-between z-30">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                            <div className="p-1.5 md:p-2 bg-indigo-600 rounded-lg shadow-lg ring-4 ring-indigo-50">
                                <PaletteIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Design OS</h2>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                            <Anchor className="w-3.5 h-3.5" />
                            Verified Web Standards
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 md:p-8 space-y-8 pb-24">
                    {/* Pantone Branding */}
                    <section className="relative">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 uppercase tracking-wider">
                            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Brand Authentication
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border-4 border-gray-100 flex flex-col aspect-[3/4] shadow-xl">
                                <div className="flex-1 rounded-sm mb-4" style={{ backgroundColor: primary }} />
                                <div className="px-1">
                                    <div className="font-black text-2xl tracking-tighter italic text-gray-900">PANTONE®</div>
                                    <div className="text-lg font-black text-gray-800 uppercase mt-1">BRAND-{primary.replace('#', '')}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" /> Color Psychology
                                    </h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Based on your primary hue ({Math.round(primaryObj.toHsl().h)}°), this brand communicates
                                        <span className="font-bold text-gray-900">
                                            {primaryObj.toHsl().h < 60 ? ' High Energy & Optimism' :
                                                primaryObj.toHsl().h < 180 ? ' Growth, Balance & Nature' :
                                                    primaryObj.toHsl().h < 280 ? ' Trust, Depth & Stability' :
                                                        ' Creativity, Luxury & Wisdom'}
                                        </span>.
                                    </p>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                                        <Anchor className="w-4 h-4 text-indigo-600" /> Consistency Rule
                                    </h4>
                                    <p className="text-xs text-indigo-700 leading-relaxed italic">
                                        "Ensure you use consistent HEX values across all digital touchpoints."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Layout Rules (60-30-10) */}
                    <section className="bg-gray-900 p-4 md:p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Trophy className="w-16 h-16" />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Layout className="w-5 h-5 text-indigo-400" />
                            The 60-30-10 Rule
                        </h3>
                        <div className="flex h-16 w-full rounded-xl overflow-hidden border-2 border-white/10 shadow-inner mb-4">
                            <div className="h-full bg-slate-100 flex items-center justify-center text-gray-900 text-[10px] font-black uppercase" style={{ width: '60%' }}>Canvas (60%)</div>
                            <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase" style={{ backgroundColor: secondary, width: '30%' }}>Support (30%)</div>
                            <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase" style={{ backgroundColor: primary, width: '10%' }}>CTA (10%)</div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Professional composition relies on balance. Use <span className="text-white font-bold">60%</span> for your neutral background, <span className="text-white font-bold">30%</span> for supporting elements, and reserve <span className="text-white font-bold">10%</span> for your primary call-to-action.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-white/10">
                            <div>
                                <h5 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2 mb-1"><Type className="w-3.5 h-3.5" /> Typography</h5>
                                <p className="text-[11px] text-slate-400">Use high contrast for headings.</p>
                            </div>
                            <div className="border-l border-white/10 pl-4">
                                <h5 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2 mb-1"><MousePointer2 className="w-3.5 h-3.5" /> Actions</h5>
                                <p className="text-[11px] text-slate-400">Reserve the primary CTA for the accent.</p>
                            </div>
                        </div>
                    </section>

                    {/* Accessibility (WCAG 2.2) */}
                    <section className="bg-amber-50/40 p-4 md:p-6 rounded-2xl border-2 border-amber-100 relative">
                        <div className="absolute -top-3 -left-2 bg-amber-500 p-1.5 rounded-lg border-4 border-white shadow-lg">
                            <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 uppercase tracking-wider pl-4">
                            Accessibility Guardrails
                        </h3>

                        <div className="space-y-3 mb-6">
                            {checkColorBlindnessRisk.length > 0 && (
                                <div className="p-3 bg-red-600 rounded-xl flex gap-3 shadow-lg">
                                    <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase mb-1">Critical Conflict</h4>
                                        {checkColorBlindnessRisk.map((risk, i) => (
                                            <p key={i} className="text-xs text-red-100">{risk}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {checkVibrationRisk(primary, secondary) && (
                                <div className="p-3 bg-orange-500 rounded-xl flex gap-3 shadow-lg">
                                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase mb-1">Vibration Risk</h4>
                                        <p className="text-xs text-orange-100">
                                            {primary} and {secondary} may cause eye strain when placed together.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {accessibilityPairings.map((pair, i) => {
                                const results = getContrast(pair.bg, pair.fg);
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-base shadow-inner" style={{ backgroundColor: pair.bg, color: pair.fg }}>Aa</div>
                                            <div>
                                                <span className="text-xs font-bold text-gray-800">{pair.name}</span>
                                                <div className="flex gap-1.5 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${results.passAA ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>AA</span>
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${results.passAAA ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-gray-500'}`}>AAA</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-xl font-black italic ${results.passAA ? 'text-gray-900' : 'text-red-600'}`}>
                                            {results.ratio}:1
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-white/60 rounded-xl border-2 border-dashed border-amber-200 flex gap-3">
                            <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="text-[11px] text-amber-800 leading-relaxed italic font-medium">
                                Pro Tip: Don't rely on color alone. Use icons and font weights for status messages.
                            </p>
                        </div>
                    </section>

                    {/* Semantic Interaction */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 uppercase tracking-wider">
                            <MousePointer2 className="w-5 h-5 text-indigo-600" />
                            Semantic Interaction
                        </h3>
                        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 space-y-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Default</div>
                                    <div className="h-10 w-full rounded-lg shadow-lg" style={{ backgroundColor: primary }} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Hover</div>
                                    <div className="h-10 w-full rounded-lg shadow-inner" style={{ backgroundColor: colord(primary).darken(0.1).toHex() }} />
                                </div>
                            </div>
                            <div className="space-y-3 hidden md:block border-t border-slate-200 pt-4">
                                <h5 className="text-[10px] font-black text-indigo-600 uppercase">UI Feedback</h5>
                                <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Success</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg shadow-sm border border-red-100">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-bold text-red-700 uppercase">Warning</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t mt-auto bg-slate-900 flex flex-col md:flex-row items-center justify-between text-white gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Design Ethos</span>
                        <p className="text-lg md:text-xl font-black italic leading-tight text-white/90 mt-2">
                            "Great design is a marriage of <span className="text-indigo-400">precision</span> and <span className="text-indigo-400">accessibility</span>."
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] border-4 border-white/20">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white/30 uppercase">Certified</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignPrinciples;
