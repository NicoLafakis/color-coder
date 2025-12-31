import React, { useMemo } from 'react';
import {
    CheckCircle2,
    XSquare,
    Info,
    Type,
    Layout,
    Component as ComponentIcon,
    AlertTriangle,
    Zap,
    Eye,
    Anchor,
    Palette as PaletteIcon,
    X
} from 'lucide-react';
import { colord } from 'colord';

const DesignPrinciples = ({ colors, onClose }) => {
    if (!colors || colors.length === 0) return null;

    const primary = colors[0];
    const secondary = colors[1] || colors[0];
    const accent = colors[2] || colors[1] || colors[0];

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

    const checkColorBlindnessRisk = useMemo(() => {
        // Basic heuristics for color blindness risks (R/G, B/Y)
        const risks = [];
        colors.forEach((c1, i) => {
            colors.forEach((c2, j) => {
                if (i >= j) return;
                const o1 = colord(c1).toHsl();
                const o2 = colord(c2).toHsl();

                // Red-Green risk: Hues around 0/360 and 120
                const isRed1 = o1.h < 20 || o1.h > 340;
                const isGreen2 = o2.h > 80 && o2.h < 160;
                const isRed2 = o2.h < 20 || o2.h > 340;
                const isGreen1 = o1.h > 80 && o1.h < 160;

                if ((isRed1 && isGreen2) || (isRed2 && isGreen1)) {
                    risks.push(`High risk pairing: ${c1} and ${c2} (Protanopia/Deuteranopia)`);
                }
            });
        });
        return risks;
    }, [colors]);

    const accessibilityPairings = [
        { name: 'Primary Text', bg: primaryObj.isLight() ? '#000000' : '#FFFFFF', fg: primary },
        { name: 'Secondary UI', bg: '#FFFFFF', fg: secondary },
        { name: 'Accent Highlight', bg: '#FFFFFF', fg: accent },
        { name: 'Pairing: P + S', bg: primary, fg: secondary },
        { name: 'Pairing: S + A', bg: secondary, fg: accent },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-[100] transition-all duration-500">
            <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Modern Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-8 flex items-center justify-between z-20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                <PaletteIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Design OS</h2>
                        </div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                            <Anchor className="w-3.5 h-3.5" />
                            Web Content Accessibility Guidelines (WCAG 2.2) & Pantone Standards
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-full transition-all hover:rotate-90"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-12">
                    {/* Pantone Branding Section */}
                    <section className="relative overflow-hidden group">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                Pantone Brand Integrity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border flex flex-col justify-between aspect-[4/5] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-full h-2/3 rounded-lg mb-4" style={{ backgroundColor: primary }} />
                                    <div>
                                        <div className="font-black text-2xl tracking-tighter italic">PANTONE®</div>
                                        <div className="text-lg font-bold text-gray-800">COY-2024-{primary.replace('#', '')}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Digital Master Suite</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-1">Color Consistency</h4>
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            Maintaining brand integrity requires using precise HEX conversions for web while matching PMS for print. Ensure your <b>primary</b> represents the dominant brand voice.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Color Psychology</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Current primary hue ({Math.round(primaryObj.toHsl().h)}°) communicates
                                            {primaryObj.toHsl().h < 60 ? ' energy and warmth' :
                                                primaryObj.toHsl().h < 180 ? ' growth and freshness' :
                                                    ' stability and trust'}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Golden Rules of Layout */}
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                            <Layout className="w-5 h-5 text-indigo-600" />
                            The Golden Layout Rules
                        </h3>
                        <div className="space-y-6">
                            {/* 60-30-10 */}
                            <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <h4 className="font-bold text-lg">The 60-30-10 Principle</h4>
                                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full uppercase tracking-widest">Balance Ratio</span>
                                    </div>
                                    <div className="flex h-16 w-full rounded-2xl overflow-hidden border-4 border-white/5 mb-6">
                                        <div className="h-full group relative" style={{ backgroundColor: '#F8FAFC', width: '60%' }}>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity text-[10px] font-bold">BASE (60%)</div>
                                        </div>
                                        <div className="h-full group relative" style={{ backgroundColor: secondary, width: '30%' }}>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity text-[10px] font-bold">SUPPORT (30%)</div>
                                        </div>
                                        <div className="h-full group relative" style={{ backgroundColor: primary, width: '10%' }}>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity text-[10px] font-bold">ACCENT (10%)</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                                        "Use 60% for your background/neutral, 30% for your secondary components, and just 10% for your calls-to-action to maximize visual impact."
                                    </p>
                                </div>
                            </div>

                            {/* Scan Patterns */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 border rounded-2xl bg-gray-50">
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-gray-400" /> F-Pattern
                                    </h5>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">Place your primary brand color in the top-left and along the horizontal header where eye tracking is highest.</p>
                                </div>
                                <div className="p-5 border rounded-2xl bg-gray-50">
                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                        <Anchor className="w-4 h-4 text-gray-400" /> Z-Pattern
                                    </h5>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">For landing pages, guide the eye from the logo (Top-L) to the Nav (Top-R) then across the hero to your Primary CTA (Bottom-R).</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Accessibility Deep Dive */}
                    <section className="bg-amber-50/30 p-8 rounded-3xl border border-amber-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                            <Type className="w-5 h-5 text-amber-600" />
                            Accessibility (WCAG 2.2)
                        </h3>

                        {checkColorBlindnessRisk.length > 0 && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 animate-pulse">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest mb-1">Color Blindness Alert</h4>
                                    {checkColorBlindnessRisk.map((risk, i) => (
                                        <p key={i} className="text-xs text-red-700">{risk}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {accessibilityPairings.map((pair, i) => {
                                const results = getContrast(pair.bg, pair.fg);
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-inner" style={{ backgroundColor: pair.bg, color: pair.fg }}>Aa</div>
                                                <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm" style={{ backgroundColor: pair.fg }} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-800">{pair.name}</span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${results.passAA ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>AA</span>
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${results.passAAA ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>AAA</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-black ${results.passAA ? 'text-gray-900' : 'text-red-600'}`}>
                                                {results.ratio}:1
                                            </div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Contrast Ratio</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex gap-3 p-4 bg-white/50 rounded-xl border border-dashed border-gray-200">
                            <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">
                                <b>Pro Tip:</b> Color should never be the only indicator of an action. Always pair status colors (Red/Green) with icons or bold text labels.
                            </p>
                        </div>
                    </section>

                    {/* UI System Mockup */}
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                            <ComponentIcon className="w-5 h-5 text-indigo-600" />
                            System Interaction Preview
                        </h3>
                        <div className="space-y-6">
                            {/* Dashboard Preview */}
                            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 shadow-inner group overflow-hidden relative">
                                <div className="absolute inset-0 bg-white opacity-40 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                <div className="relative z-10 space-y-6">
                                    {/* Navbar Mock */}
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div className="flex gap-1.5">
                                            <div className="w-8 h-3 rounded bg-gray-200" />
                                            <div className="w-8 h-3 rounded bg-gray-200" />
                                        </div>
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primary }} />
                                    </div>

                                    {/* Content Mock */}
                                    <div className="space-y-3">
                                        <div className="h-6 w-3/4 rounded-lg font-black text-2xl" style={{ color: colord(primary).darken(0.3).toHex() }}>
                                            System Overview
                                        </div>
                                        <div className="h-3 w-full rounded bg-gray-200" />
                                        <div className="h-3 w-5/6 rounded bg-gray-200" />
                                    </div>

                                    {/* Form Mock */}
                                    <div className="flex gap-3 pt-4">
                                        <button className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:-translate-y-1" style={{ backgroundColor: primary, color: primaryObj.isLight() ? 'black' : 'white' }}>
                                            Primary Action
                                        </button>
                                        <button className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:bg-gray-100" style={{ borderColor: secondary, color: secondary }}>
                                            Secondary
                                        </button>
                                    </div>

                                    {/* Status Mock */}
                                    <div className="p-3 rounded-xl flex items-center gap-3 border shadow-sm" style={{ backgroundColor: colord(accent).alpha(0.05).toRgbString(), borderColor: colord(accent).alpha(0.1).toRgbString() }}>
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colord(accent).darken(0.2).toHex() }}>
                                            Live Analytics Enabled
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges/Tags */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['Beta', 'Stable', 'Archive'].map((tag, i) => (
                                    <span key={i} className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm hover:scale-110 transition-transform cursor-default" style={{ borderColor: i === 0 ? primary : i === 1 ? secondary : '#eee', color: i === 0 ? primary : i === 1 ? secondary : '#999' }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer with quote */}
                <div className="p-12 border-t mt-auto bg-gray-50 flex items-center justify-between">
                    <div className="w-2/3">
                        <p className="text-xl font-serif italic text-gray-400 leading-tight">
                            "Design is not just what it looks like and feels like. Design is how it works."
                        </p>
                        <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-widest font-sans">Level 4 Master Palette Synthesis</p>
                    </div>
                    <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg ring-4 ring-indigo-50">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignPrinciples;
