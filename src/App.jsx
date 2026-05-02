/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  SK FLUX MASTER v12.0 — Elite Arbitrage System                      ║
 * ║  Dual-Asset · Sniper IA · Predictor · Logistique · Comparatif       ║
 * ║  Single-file React 18 · Tailwind · Lucide · Recharts                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import React, {
  useState, useCallback, useEffect, useRef, useMemo
} from 'react';
import {
  Zap, ShieldCheck, ChevronRight, X, Truck, MapPin, Clock,
  TrendingUp, AlertTriangle, CheckCircle2, Target, Flame,
  Brain, Navigation, Fuel, Star, DollarSign, RefreshCw,
  ClipboardPaste, Eye, GitCompare, Scale, FileText,
  Info, Package, Car, Filter, ArrowUpDown, Award,
  ChevronDown, Camera, Layers
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip as RTooltip, ResponsiveContainer
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────────
   1. KNOWLEDGE BASE v12
───────────────────────────────────────────────────────────────────── */

const KB = {
  DEFAUTS: {
    moteur_hs:     { label: "Moteur HS",               cost: 1200, risk: "critical", keywords: ["moteur hs","casse moteur","moteur cassé","moteur mort"] },
    boite:         { label: "Boîte de vitesses",       cost: 700,  risk: "high",     keywords: ["boite hs","boîte hs","boite claque","boîte claque"] },
    embrayage:     { label: "Embrayage",               cost: 380,  risk: "med",      keywords: ["embrayage","patine","patinage"] },
    distribution:  { label: "Distribution",            cost: 280,  risk: "med",      keywords: ["courroie","distribution","distrib"] },
    carrosserie:   { label: "Carrosserie / Choc",      cost: 450,  risk: "med",      keywords: ["choc","carrosserie","rayure","bosse","accidenté"] },
    ct_refus:      { label: "CT Refusé",               cost: 350,  risk: "med",      keywords: ["ct refusé","contre-visite","contre visite","ct nok"] },
    joint_culasse: { label: "Joint de culasse",        cost: 900,  risk: "critical", keywords: ["joint de culasse","culasse","fumée blanche"] },
    suspension:    { label: "Suspension",              cost: 320,  risk: "med",      keywords: ["amortisseur","suspension","rotule","triangle"] },
    clim:          { label: "Climatisation HS",        cost: 280,  risk: "low",      keywords: ["clim hs","clim ne marche","climatisation hs"] },
    freins:        { label: "Freins à refaire",        cost: 200,  risk: "low",      keywords: ["frein","disque","plaquette"] },
    turbo:         { label: "Turbo défectueux",        cost: 650,  risk: "high",     keywords: ["turbo hs","turbo grillé","turbo claque"] },
    demarrage:     { label: "Problème démarrage",      cost: 180,  risk: "low",      keywords: ["démarre pas","demarre pas","démarrage difficile"] },
    voyant:        { label: "Voyant moteur allumé",    cost: 150,  risk: "low",      keywords: ["voyant","voyant allumé","voyant moteur"] },
    bruit:         { label: "Bruit moteur suspect",    cost: 400,  risk: "high",     keywords: ["bruit","claquement","cognement","sifflement"] },
    rouille:       { label: "Rouille structurelle",    cost: 500,  risk: "high",     keywords: ["rouille","rouillé","corrosion"] },
  },
  PIECES: {
    moteur_complet: { label: "Moteur complet",    buyFactor: 0.3, sellFactor: 0.7  },
    boite_complet:  { label: "Boîte de vitesses", buyFactor: 0.2, sellFactor: 0.55 },
    turbo_piece:    { label: "Turbo",             buyFactor: 0.1, sellFactor: 0.5  },
    tableau_bord:   { label: "Tableau de bord",   buyFactor: 0.05,sellFactor: 0.3  },
    pare_chocs:     { label: "Pare-chocs",        buyFactor: 0.04,sellFactor: 0.25 },
    jantes:         { label: "Jantes",            buyFactor: 0.08,sellFactor: 0.4  },
  },
  POSITIVE_KW: ["testé","garanti","révisé","carnet","facture","propre","ct ok","entretien","suivi","1ère main","première main","premier propriétaire"],
  ROTATION:    { 90: 8, 80: 14, 70: 21, 0: 35 },
  FUEL_KM:     0.12,
  FIXED_COSTS: 500,
};

const SOURCES = {
  leboncoin:  { label: "Leboncoin",    color: "#F56B2A", bg: "#FFF3EE" },
  facebook:   { label: "Facebook MP", color: "#1877F2", bg: "#EEF4FF" },
  lacentrale: { label: "La Centrale", color: "#E30613", bg: "#FFF0F0" },
  autoscout:  { label: "AutoScout24", color: "#FF6B00", bg: "#FFF4EE" },
};

const MARKET_REF = { resaleValue: 4500 };

const VISIT_CHECKLIST = [
  { id: "carrosserie", label: "Carrosserie sans impacts", penaltyIfNo: 8 },
  { id: "moteur",      label: "Moteur sans bruit suspect", penaltyIfNo: 15 },
  { id: "fumee",       label: "Pas de fumée d'échappement", penaltyIfNo: 20 },
  { id: "boite",       label: "Passage de vitesses fluide", penaltyIfNo: 12 },
  { id: "freins",      label: "Freinage efficace", penaltyIfNo: 8 },
  { id: "ct",          label: "CT valide ou récent", penaltyIfNo: 10 },
  { id: "niveaux",     label: "Niveaux huile/refroid. OK", penaltyIfNo: 5 },
  { id: "electronique",label: "Aucun voyant allumé", penaltyIfNo: 10 },
];

const TOOLTIPS = {
  roi:        "ROI = (Profit Net / Prix d'achat) × 100. Mesure le rendement de votre investissement.",
  netProfit:  "Marge Nette = Prix de revente − Prix d'achat − Réparations − Frais fixes − Logistique.",
  rotation:   "Rotation de stock = Nombre de jours estimés avant revente, selon le score IA et la demande marché.",
  logistique: "Frais Logistiques = Coût aller-retour en carburant pour aller chercher le véhicule.",
};

/* ─────────────────────────────────────────────────────────────────────
   2. SMART AGENTS v12
───────────────────────────────────────────────────────────────────── */

const Agents = {
  detectDefauts(description = "") {
    const desc = description.toLowerCase();
    let found = [], cost = 0;
    Object.values(KB.DEFAUTS).forEach(d => {
      if (d.keywords.some(kw => desc.includes(kw))) { found.push(d); cost += d.cost; }
    });
    return { found, cost };
  },

  scoreAd(ad, visitChecks = {}) {
    let score = 90;
    const { found: defauts, cost: repairCost } = Agents.detectDefauts(ad.description);
    if (ad.price > MARKET_REF.resaleValue * 0.85) score -= 18;
    if (ad.km > 150000) score -= 14;
    if (ad.km > 200000) score -= 10;
    defauts.forEach(d => {
      score -= d.risk === "critical" ? 20 : d.risk === "high" ? 12 : 5;
    });
    KB.POSITIVE_KW.forEach(w => { if (ad.description?.toLowerCase().includes(w)) score += 2; });
    // visit checklist penalties
    VISIT_CHECKLIST.forEach(item => {
      if (visitChecks[item.id] === false) score -= item.penaltyIfNo;
    });
    score = Math.max(10, Math.min(99, score));
    return { score, defauts, repairCost };
  },

  calcLogistique(distKm = 40) {
    const fuel = Math.round(distKm * KB.FUEL_KM * 2);
    const mins = Math.round((distKm / 90) * 60);
    return { fuel, mins, distKm };
  },

  rotation(score) {
    if (score >= 90) return KB.ROTATION[90];
    if (score >= 80) return KB.ROTATION[80];
    if (score >= 70) return KB.ROTATION[70];
    return KB.ROTATION[0];
  },

  analyzeVehicle(ad, visitChecks = {}) {
    const { score, defauts, repairCost } = Agents.scoreAd(ad, visitChecks);
    const log = Agents.calcLogistique(ad.distanceKm);
    const netProfit = MARKET_REF.resaleValue - (ad.price + repairCost + KB.FIXED_COSTS + log.fuel);
    const roi = ad.price > 0 ? (netProfit / ad.price) * 100 : 0;
    return { score, defauts, repairCost, logistique: log, netProfit, roi, rotationDays: Agents.rotation(score) };
  },

  analyzePiece(ad) {
    // For spare parts: calculate based on part type
    const partKey = ad.partType || "moteur_complet";
    const part = KB.PIECES[partKey] || KB.PIECES.moteur_complet;
    const refPrice = ad.vehicleValue || 3000;
    const estimatedSell = Math.round(refPrice * part.sellFactor);
    const maxBuy = Math.round(refPrice * part.buyFactor);
    const netProfit = estimatedSell - ad.price - 80; // 80€ frais envoi
    const roi = ad.price > 0 ? (netProfit / ad.price) * 100 : 0;
    return { score: netProfit > 100 ? 88 : 60, defauts: [], repairCost: 0, netProfit, roi, rotationDays: 7, logistique: { fuel: 0, mins: 0, distKm: 0 } };
  },

  sniperMessages(item) {
    const target = Math.round(item.price * 0.82);
    const mid    = Math.round(item.price * 0.88);
    const soft   = Math.round(item.price * 0.93);
    const defStr = item.defauts?.length
      ? `J'ai relevé : ${item.defauts.map(d => d.label).join(", ")} — soit ~${item.repairCost}€ de remise en état.`
      : "Après analyse du marché,";
    return {
      agressif: `Bonjour, votre annonce m'intéresse. ${defStr} Je peux me déplacer cash aujourd'hui pour ${target}€ ferme. Réponse rapide attendue. Cordialement`,
      raisonne:  `Bonjour, j'étudie sérieusement votre véhicule. ${defStr} Une offre à ${mid}€ vous semblerait-elle envisageable ? Je suis disponible rapidement. Merci`,
      rapide:    `Bonjour ! Très intéressé, disponible ce week-end. ${soft}€ et c'est réglé vite fait ? 🤝`,
    };
  },

  opportunityCost(items) {
    // Ranks items by (netProfit / rotationDays) = daily yield
    return [...items]
      .filter(i => i.netProfit > 0)
      .map(i => ({ ...i, dailyYield: i.netProfit / i.rotationDays }))
      .sort((a, b) => b.dailyYield - a.dailyYield);
  },
};

/* ─────────────────────────────────────────────────────────────────────
   3. MOCK DATA
───────────────────────────────────────────────────────────────────── */

const buildAds = () => {
  const raw = [
    { id:1, type:"voiture", title:"Renault Clio 3 Phase 2",     price:2400, km:125000, year:2010, city:"Meaux",         distanceKm:32, source:"leboncoin",  description:"Excellent état, courroie faite, ct ok, carnet d'entretien.", img:"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600" },
    { id:2, type:"voiture", title:"Peugeot 206+ HDi 1.4",       price:1800, km:189000, year:2009, city:"Torcy",          distanceKm:18, source:"facebook",   description:"Bruit moteur au démarrage, voyant allumé. CT refusé pour freins.", img:"https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600" },
    { id:3, type:"voiture", title:"VW Polo 1.4 Confort",         price:4200, km:98000,  year:2013, city:"Croissy",        distanceKm:55, source:"lacentrale", description:"Très bel état. 2 propriétaires. Révisé en concession. Factures.", img:"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600" },
    { id:4, type:"voiture", title:"Ford Fiesta 1.0 EcoBoost",    price:5800, km:62000,  year:2016, city:"Lagny",          distanceKm:28, source:"autoscout",  description:"Voiture révisée, carnet complet, ct ok, première main, factures.", img:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600" },
    { id:5, type:"piece",   title:"Moteur complet Clio 3 1.5 DCI",price:350, km:0,      year:2008, city:"Noisy-le-Grand", distanceKm:22, source:"leboncoin",  description:"Moteur retiré d'une Clio 3 accidentée. Tournait bien avant dépose.", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", partType:"moteur_complet", vehicleValue:2800 },
    { id:6, type:"piece",   title:"Boîte de vitesses 206 HDi",    price:180, km:0,      year:2007, city:"Vincennes",      distanceKm:15, source:"facebook",   description:"Boîte propre, garantie 3 mois. Testée avant envoi.", img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600", partType:"boite_complet", vehicleValue:2000 },
  ];
  return raw.map(ad => ({
    ...ad,
    ...(ad.type === "voiture" ? Agents.analyzeVehicle(ad) : Agents.analyzePiece(ad)),
  }));
};

/* ─────────────────────────────────────────────────────────────────────
   4. MICRO-COMPOSANTS UI
───────────────────────────────────────────────────────────────────── */

// Tooltip interactif
const Tip = ({ text, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <Info size={11} className="text-[#86868B]" />
      {open && (
        <span className="absolute bottom-full left-0 mb-2 w-56 bg-[#1D1D1F] text-white text-[10px] leading-relaxed font-medium rounded-xl p-3 z-50 shadow-2xl">
          {text}
        </span>
      )}
    </span>
  );
};

// Badge source
const SourceBadge = ({ source }) => {
  const s = SOURCES[source] || { label: source, color: "#86868B", bg: "#F5F5F7" };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
      style={{ color: s.color, background: s.bg }}>
      ● {s.label}
    </span>
  );
};

// Score pill
const ScorePill = ({ score }) => {
  const color = score >= 85 ? "#00C07F" : score >= 65 ? "#FF9500" : "#FF3B30";
  const label = score >= 85 ? "TOP" : score >= 65 ? "MOYEN" : "RISQUÉ";
  const glow  = score >= 90;
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full transition-all"
        style={{ background: color, boxShadow: glow ? `0 0 10px ${color}, 0 0 20px ${color}88` : `0 0 6px ${color}66` }} />
      <span className="text-xs font-black" style={{ color }}>{score} · {label}</span>
    </div>
  );
};

// Skeleton row
const SkeletonRow = () => (
  <tr className="border-b border-[#F5F5F7]">
    {[180, 120, 100, 90, 70, 40].map((w, i) => (
      <td key={i} className="px-8 py-7">
        <div className="h-3.5 rounded-full animate-pulse bg-gradient-to-r from-[#E8E8ED] via-[#F5F5F7] to-[#E8E8ED]" style={{ width: w }} />
        {i === 0 && <div className="h-2.5 rounded-full animate-pulse bg-[#F0F0F2] mt-2" style={{ width: 90 }} />}
      </td>
    ))}
  </tr>
);

// Animated counter
const AnimCounter = ({ target, prefix = "", suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame, start, init = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 1200, 1);
      setVal(Math.round(init + (target - init) * (1 - Math.pow(1 - prog, 3))));
      if (prog < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
};

/* ─────────────────────────────────────────────────────────────────────
   5. SIDE PANEL FOCUS MODE
───────────────────────────────────────────────────────────────────── */

const SidePanel = ({ item, onClose, allItems }) => {
  const [tab, setTab] = useState("analyse");
  const [copied, setCopied]   = useState(null);
  const [checks, setChecks]   = useState({});
  const [liveScore, setLiveScore] = useState(item.score);

  // Recalcul live lors de la checklist
  useEffect(() => {
    const { score } = Agents.scoreAd(item, checks);
    setLiveScore(score);
  }, [checks, item]);

  const msgs = Agents.sniperMessages(item);
  const opCost = Agents.opportunityCost(allItems);
  const rank = opCost.findIndex(i => i.id === item.id) + 1;

  const copy = (key, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const msgConf = [
    { key: "agressif", label: "Agressif", icon: Flame,  color: "#FF3B30", desc: "Prix plancher, pression max" },
    { key: "raisonne", label: "Raisonné", icon: Brain,  color: "#0066CC", desc: "Argumenté, crédible" },
    { key: "rapide",   label: "Rapide",   icon: Zap,    color: "#FF9500", desc: "Court, week-end" },
  ];

  const TABS = [
    { key: "analyse",    label: "Analyse" },
    { key: "sniper",     label: "✉ Sniper" },
    { key: "logistique", label: "🚗 Logistique" },
    { key: "visite",     label: "✓ Visite" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[500px] bg-white z-50 flex flex-col shadow-2xl"
        style={{ animation: "slideIn .38s cubic-bezier(.32,.72,0,1)" }}>

        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-[#F0F0F2] bg-[#FAFAFA]">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <SourceBadge source={item.source} />
              {item.type === "piece" && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">Pièce</span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F0F0F2] transition-colors"><X size={16} /></button>
          </div>
          <h2 className="text-xl font-black tracking-tight mb-1">{item.title}</h2>
          <div className="flex items-center gap-2 text-xs text-[#86868B] font-medium mb-3">
            <MapPin size={11} />{item.city} · {item.km > 0 ? `${item.km.toLocaleString()} km` : "Pièce"} · {item.year}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-black">{item.price.toLocaleString()}€</span>
            <div className="text-right">
              <ScorePill score={liveScore} />
              {rank > 0 && (
                <div className="text-[9px] text-[#86868B] font-bold mt-1">
                  #{rank} Opportunité / Coût d'opportunité
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#F0F0F2] px-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3.5 px-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${tab === t.key ? "border-black text-black" : "border-transparent text-[#86868B] hover:text-black"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">

          {/* ── ANALYSE ── */}
          {tab === "analyse" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: <Tip text={TOOLTIPS.netProfit}>Profit Net</Tip>,     val: `${item.netProfit > 0 ? "+" : ""}${item.netProfit}€`, color: item.netProfit > 0 ? "#00C07F" : "#FF3B30" },
                  { label: <Tip text={TOOLTIPS.roi}>ROI Estimé</Tip>,           val: `${item.roi.toFixed(1)}%`,                            color: "#0066CC" },
                  { label: <Tip text={TOOLTIPS.rotation}>Rotation Stock</Tip>,  val: `~${item.rotationDays}j`,                             color: "#FF9500" },
                  { label: "Réparations",                                         val: `${item.repairCost}€`,                               color: item.repairCost > 500 ? "#FF3B30" : "#86868B" },
                ].map((m, i) => (
                  <div key={i} className="bg-[#F7F7FA] rounded-2xl p-4">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">{m.label}</div>
                    <div className="text-xl font-black" style={{ color: m.color }}>{m.val}</div>
                  </div>
                ))}
              </div>

              {/* Défauts */}
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-2">Défauts Détectés</h4>
                {item.defauts?.length === 0
                  ? <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><CheckCircle2 size={14}/>Aucun défaut critique</div>
                  : item.defauts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5 mb-1.5">
                      <div className="flex items-center gap-2"><AlertTriangle size={12} className="text-rose-500"/><span className="text-xs font-bold text-rose-700">{d.label}</span></div>
                      <span className="text-[10px] font-black text-rose-500">-{d.cost}€</span>
                    </div>
                  ))
                }
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-2">Annonce Brute</h4>
                <p className="text-xs text-[#86868B] leading-relaxed bg-[#F7F7FA] rounded-2xl p-4">{item.description}</p>
              </div>
            </>
          )}

          {/* ── SNIPER ── */}
          {tab === "sniper" && (
            <>
              <p className="text-[10px] text-[#86868B] font-medium">3 stratégies générées par IA. Copier et adapter.</p>
              {msgConf.map(({ key, label, icon: Icon, color, desc }) => (
                <div key={key} className="bg-[#F7F7FA] rounded-2xl p-4 border border-[#EBEBF0]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5"><Icon size={13} style={{ color }}/><span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</span></div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#86868B]">{desc}</span>
                      <button onClick={() => copy(key, msgs[key])}
                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white transition-all"
                        style={{ background: copied === key ? "#00C07F" : color }}>
                        {copied === key ? "✓" : "Copier"}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#1D1D1F] font-medium">{msgs[key]}</p>
                </div>
              ))}
            </>
          )}

          {/* ── LOGISTIQUE ── */}
          {tab === "logistique" && (
            <>
              <div className="bg-[#F7F7FA] rounded-2xl p-5 space-y-3">
                {[
                  { icon: Navigation, label: "Distance", val: `${item.logistique?.distKm || 0} km`, color: "#0066CC" },
                  { icon: Clock,      label: "Temps A/R", val: `${(item.logistique?.mins || 0) * 2} min`, color: "#FF9500" },
                  { icon: Fuel,       label: "Carburant", val: `~${item.logistique?.fuel || 0}€`, color: "#00C07F" },
                ].map(({ icon: Icon, label, val, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Icon size={16} style={{ color }}/><span className="text-sm font-bold">{label}</span></div>
                    <span className="text-lg font-black">{val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#1D1D1F] text-white rounded-2xl p-5">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-3">Budget Complet</div>
                {[
                  ["Prix d'achat",   `${item.price.toLocaleString()}€`],
                  ["Réparations",    `${item.repairCost}€`],
                  ["Frais fixes",    `${KB.FIXED_COSTS}€`],
                  ["Carburant A/R",  `${item.logistique?.fuel || 0}€`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs font-bold py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-[#86868B]">{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-black pt-3 mt-1 border-t border-white/10">
                  <span>Profit Net</span>
                  <span style={{ color: item.netProfit > 0 ? "#00C07F" : "#FF3B30" }}>
                    {item.netProfit > 0 ? "+" : ""}{item.netProfit}€
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── VISITE ── */}
          {tab === "visite" && (
            <>
              <p className="text-[10px] text-[#86868B] font-medium mb-1">
                Cochez chaque point pendant l'inspection physique. Le score IA se met à jour en temps réel.
              </p>
              <div className="bg-[#F7F7FA] rounded-2xl overflow-hidden divide-y divide-[#EBEBF0]">
                {VISIT_CHECKLIST.map(item => (
                  <label key={item.id} className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked
                        onChange={e => setChecks(p => ({ ...p, [item.id]: e.target.checked }))}
                        className="w-4 h-4 accent-black rounded"
                      />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-black text-rose-400">-{item.penaltyIfNo}pts</span>
                  </label>
                ))}
              </div>
              <div className="bg-black text-white rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Score Live</span>
                <ScorePill score={liveScore} />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   6. COMPARE PANEL (Face-à-Face)
───────────────────────────────────────────────────────────────────── */

const ComparePanel = ({ items, onClose }) => {
  if (items.length < 2) return null;
  const [a, b] = items;
  const rows = [
    { label: "Prix",         va: `${a.price.toLocaleString()}€`, vb: `${b.price.toLocaleString()}€`, winner: a.price < b.price ? "a" : "b" },
    { label: "Profit Net",   va: `${a.netProfit}€`,              vb: `${b.netProfit}€`,              winner: a.netProfit > b.netProfit ? "a" : "b" },
    { label: "ROI",          va: `${a.roi.toFixed(1)}%`,         vb: `${b.roi.toFixed(1)}%`,         winner: a.roi > b.roi ? "a" : "b" },
    { label: "Score IA",     va: a.score,                         vb: b.score,                         winner: a.score > b.score ? "a" : "b" },
    { label: "Rotation",     va: `${a.rotationDays}j`,            vb: `${b.rotationDays}j`,            winner: a.rotationDays < b.rotationDays ? "a" : "b" },
    { label: "Réparations",  va: `${a.repairCost}€`,             vb: `${b.repairCost}€`,             winner: a.repairCost < b.repairCost ? "a" : "b" },
    { label: "Logistique",   va: `${a.logistique?.fuel || 0}€`,  vb: `${b.logistique?.fuel || 0}€`,  winner: (a.logistique?.fuel||0) < (b.logistique?.fuel||0) ? "a" : "b" },
  ];
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white rounded-3xl z-50 shadow-2xl overflow-hidden"
        style={{ animation: "fadeUp .35s cubic-bezier(.32,.72,0,1)" }}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#F0F0F2]">
          <div className="flex items-center gap-2"><Scale size={18}/><h3 className="font-black text-base">Comparaison Face-à-Face</h3></div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F0F0F2]"><X size={16}/></button>
        </div>
        <div className="grid grid-cols-3 gap-0 divide-x divide-[#F0F0F2]">
          <div className="px-5 py-4 text-center bg-[#FAFAFA]">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">{a.title}</div>
            <ScorePill score={a.score}/>
          </div>
          <div className="px-5 py-4 text-center flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">VS</span>
          </div>
          <div className="px-5 py-4 text-center bg-[#FAFAFA]">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">{b.title}</div>
            <ScorePill score={b.score}/>
          </div>
        </div>
        <div className="divide-y divide-[#F5F5F7]">
          {rows.map(r => (
            <div key={r.label} className="grid grid-cols-3 text-sm">
              <div className={`px-6 py-3 font-black text-center ${r.winner === "a" ? "text-emerald-600 bg-emerald-50" : "text-[#1D1D1F]"}`}>{r.va}</div>
              <div className="px-6 py-3 text-center text-[9px] font-black uppercase tracking-widest text-[#86868B] flex items-center justify-center">{r.label}</div>
              <div className={`px-6 py-3 font-black text-center ${r.winner === "b" ? "text-emerald-600 bg-emerald-50" : "text-[#1D1D1F]"}`}>{r.vb}</div>
            </div>
          ))}
        </div>
        <div className="px-8 py-5 bg-[#FAFAFA] border-t border-[#F0F0F2] text-center">
          {(() => {
            const scoreA = rows.filter(r => r.winner === "a").length;
            const scoreB = rows.filter(r => r.winner === "b").length;
            const winner = scoreA >= scoreB ? a : b;
            return <p className="text-sm font-black">🏆 Recommandation IA : <span className="text-[#0066CC]">{winner.title}</span> ({scoreA >= scoreB ? scoreA : scoreB}/7 critères)</p>;
          })()}
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { transform: translateY(-50%) scale(.96); opacity: 0; } to { transform: translateY(-50%) scale(1); opacity: 1; } }`}</style>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   7. BUBBLE CHART (Recharts)
───────────────────────────────────────────────────────────────────── */

const BubbleChart = ({ data }) => {
  const chartData = data.map(d => ({
    x: d.price, y: d.roi, z: d.score,
    name: d.title, profit: d.netProfit,
  }));
  return (
    <div className="bg-white border border-[#E8E8ED] rounded-3xl p-6">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-4">Cartographie Prix / ROI</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" />
          <XAxis dataKey="x" name="Prix €" tick={{ fontSize: 9, fill: "#86868B" }} label={{ value: "Prix €", position: "insideBottom", offset: -2, fontSize: 9, fill: "#86868B" }} />
          <YAxis dataKey="y" name="ROI %" tick={{ fontSize: 9, fill: "#86868B" }} label={{ value: "ROI %", angle: -90, position: "insideLeft", fontSize: 9, fill: "#86868B" }} />
          <ZAxis dataKey="z" range={[40, 200]} name="Score" />
          <RTooltip cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-white border border-[#E8E8ED] rounded-xl p-3 shadow-lg text-[10px] font-bold">
                  <p className="font-black mb-1">{p.name}</p>
                  <p>Prix : {p.x.toLocaleString()}€</p>
                  <p>ROI : {p.y.toFixed(1)}%</p>
                  <p>Score : {p.z}</p>
                  <p style={{ color: p.profit > 0 ? "#00C07F" : "#FF3B30" }}>Profit : {p.profit}€</p>
                </div>
              );
            }}
          />
          <Scatter data={chartData} fill="#0066CC" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   8. IA VISION PLAQUE (Simulée)
───────────────────────────────────────────────────────────────────── */

const VisionPlaque = () => {
  const [state, setState] = useState("idle"); // idle | loading | result
  const [result, setResult] = useState(null);

  const simulate = async () => {
    setState("loading");
    await new Promise(r => setTimeout(r, 2200));
    setResult({
      modele: "Renault Clio III 1.5 dCi 85ch",
      motorisation: "Diesel",
      premiere_mise_en_circ: "15/03/2009",
      ct: [
        { date: "12/2023", resultat: "Favorable" },
        { date: "12/2021", resultat: "Favorable avec défaillance mineure" },
      ],
    });
    setState("result");
  };

  return (
    <div className="bg-white border border-[#E8E8ED] rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center"><Camera size={14} className="text-white"/></div>
        <h3 className="font-black text-sm">IA Vision Plaque</h3>
        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-black uppercase">BETA</span>
      </div>

      {state === "idle" && (
        <div onClick={simulate}
          className="border-2 border-dashed border-[#D2D2D7] rounded-2xl p-8 text-center cursor-pointer hover:border-[#0066CC] hover:bg-[#F0F5FF] transition-all group">
          <Camera size={24} className="mx-auto text-[#86868B] group-hover:text-[#0066CC] mb-2 transition-colors"/>
          <p className="text-xs font-bold text-[#86868B]">Glisser une photo de plaque</p>
          <p className="text-[9px] text-[#86868B] mt-1">ou cliquer pour simuler l'extraction</p>
        </div>
      )}

      {state === "loading" && (
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin"/>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Lecture de la plaque...</p>
          <p className="text-[9px] text-[#86868B]">Interrogation SIV + historique CT</p>
        </div>
      )}

      {state === "result" && result && (
        <div className="space-y-2">
          {[
            ["Modèle", result.modele],
            ["Motorisation", result.motorisation],
            ["1ère mise en circulation", result.premiere_mise_en_circ],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs py-1.5 border-b border-[#F0F0F2]">
              <span className="text-[#86868B] font-bold">{l}</span>
              <span className="font-black">{v}</span>
            </div>
          ))}
          <div className="mt-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1.5">Historique CT</p>
            {result.ct.map((c, i) => (
              <div key={i} className={`flex justify-between text-[10px] font-bold px-3 py-1.5 rounded-lg mb-1 ${c.resultat.includes("Favorable") && !c.resultat.includes("défaillance") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                <span>{c.date}</span><span>{c.resultat}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setState("idle"); setResult(null); }}
            className="text-[9px] font-black uppercase tracking-widest text-[#86868B] hover:text-black transition-colors mt-1">
            ↺ Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   9. APPLICATION PRINCIPALE
───────────────────────────────────────────────────────────────────── */

export default function SKFluxMaster() {
  const [allData, setAllData]           = useState(() => buildAds());
  const [selected, setSelected]         = useState(null);
  const [compareList, setCompareList]   = useState([]);
  const [showCompare, setShowCompare]   = useState(false);
  const [isSyncing, setIsSyncing]       = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [filterType, setFilterType]     = useState("all"); // all | voiture | piece
  const [sortBy, setSortBy]             = useState("score"); // score | roi | rotation
  const [quickInput, setQuickInput]     = useState("");
  const [logs, setLogs]                 = useState([
    { time: "09:14:02", msg: "SK FLUX MASTER v12.0 initialisé.", type: "info" },
    { time: "09:14:03", msg: `${buildAds().length} annonces chargées depuis le cache local.`, type: "success" },
  ]);
  const consoleRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2, "0")).join(":");
    setLogs(p => [...p.slice(-30), { time, msg, type }]);
  }, []);

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = 9999;
  }, [logs]);

  // Filtered + sorted data
  const data = useMemo(() => {
    let d = filterType === "all" ? allData : allData.filter(i => i.type === filterType);
    if (sortBy === "roi")      d = [...d].sort((a, b) => b.roi - a.roi);
    if (sortBy === "score")    d = [...d].sort((a, b) => b.score - a.score);
    if (sortBy === "rotation") d = [...d].sort((a, b) => a.rotationDays - b.rotationDays);
    return d;
  }, [allData, filterType, sortBy]);

  const stats = useMemo(() => ({
    total:      allData.length,
    topOpp:     allData.filter(d => d.score >= 85).length,
    avgRoi:     allData.length ? (allData.reduce((a, d) => a + d.roi, 0) / allData.length).toFixed(1) : "0",
    totalProfit:allData.reduce((a, d) => a + Math.max(0, d.netProfit), 0),
  }), [allData]);

  const startAutopilot = async () => {
    setIsSyncing(true);
    setIsLoading(true);
    const steps = [
      ["Connexion à Leboncoin API...", "info", 500],
      ["Connexion à Facebook Marketplace...", "info", 500],
      ["Filtre actif : < 6000€, IDF, -200k km...", "info", 400],
      ["4 annonces extraites. Analyse IA en cours...", "info", 700],
    ];
    for (const [msg, type, delay] of steps) {
      addLog(msg, type);
      await new Promise(r => setTimeout(r, delay));
    }
    const newAd = {
      id: Date.now(), type: "voiture", title: "Toyota Yaris 1.0 VVT-i",
      price: 3200, km: 112000, year: 2012, city: "Noisy-le-Grand",
      distanceKm: 21, source: "leboncoin",
      description: "Révisé en concession, ct ok valide 2 ans, carnet entretien complet, propre.",
      img: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=600",
    };
    const analyzed = { ...newAd, ...Agents.analyzeVehicle(newAd) };
    setAllData(p => [analyzed, ...p]);
    addLog(`✓ Opportunité: ${newAd.title} — Score ${analyzed.score} — ROI ${analyzed.roi.toFixed(1)}%`, analyzed.score >= 80 ? "success" : "alert");
    setIsLoading(false);
    setIsSyncing(false);
  };

  const handleDiag = () => {
    if (!quickInput.trim()) return;
    const tmp = { price: 3000, km: 100000, description: quickInput, distanceKm: 40 };
    const res = Agents.analyzeVehicle(tmp);
    addLog(`Diagnostic: Score ${res.score} | Défauts: ${res.defauts?.map(d => d.label).join(", ") || "Aucun"} | Réparations: ${res.repairCost}€`, res.score >= 75 ? "success" : "alert");
    setQuickInput("");
  };

  const toggleCompare = (item) => {
    setCompareList(p => {
      if (p.find(i => i.id === item.id)) return p.filter(i => i.id !== item.id);
      if (p.length >= 2) return [p[1], item];
      return [...p, item];
    });
  };

  const opCost = useMemo(() => Agents.opportunityCost(allData), [allData]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased">

      {/* ── NAV ── */}
      <nav className="sticky top-0 bg-white/85 backdrop-blur-3xl border-b border-[#D2D2D7] z-30 px-10 py-4 flex justify-between items-center shadow-sm shadow-black/[0.02]">
        <div className="flex items-center gap-10">
          <div className="text-xl font-black tracking-tight italic">
            SK <span className="text-indigo-600">FLUX</span> <span className="font-light not-italic">MASTER</span>
            <span className="text-[9px] font-mono text-[#86868B] font-normal not-italic ml-2">v12.0</span>
          </div>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-[#86868B]">
            {["Terminal", "Agents IA", "Flux Marché"].map((l, i) => (
              <span key={l} className={`cursor-pointer transition-colors ${i === 0 ? "text-black border-b border-black pb-0.5" : "hover:text-black"}`}>{l}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {compareList.length === 2 && (
            <button onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all">
              <Scale size={12}/> Comparer
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <ShieldCheck size={11}/> LIVE
          </div>
          <button onClick={startAutopilot} disabled={isSyncing}
            className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-black/10 disabled:opacity-50">
            <Zap size={12} className={isSyncing ? "animate-pulse" : ""}/>
            {isSyncing ? "SCAN..." : "AUTOPILOTE"}
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-10 py-10">

        {/* ── HERO + CONSOLE ── */}
        <div className="flex gap-8 mb-12 items-end">
          <div className="flex-1">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-4">Elite Arbitrage System</p>
            <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-3">
              SK <span className="italic text-indigo-600">FLUX</span><br />
              <span className="font-light text-[#86868B]">MASTER.</span>
            </h1>
            <p className="text-base text-[#86868B] font-medium">Dual-Asset · Sniper IA · Predictor · Logistique</p>
          </div>
          <div className="w-[380px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#86868B]">Console de Scraping Live</span>
            </div>
            <div ref={consoleRef}
              className="bg-[#0A0A0F] rounded-2xl p-4 font-mono text-[10px] leading-relaxed h-32 overflow-y-auto border border-[#1E1E2E]">
              {logs.map((l, i) => (
                <div key={i} className={l.type === "success" ? "text-emerald-400" : l.type === "alert" ? "text-amber-400" : "text-[#5555AA]"}>
                  <span className="text-[#333355]">[{l.time}]</span> {l.msg}
                </div>
              ))}
              <div className="text-[#333355] animate-pulse">█</div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Annonces",        val: stats.total,                          icon: Layers,     color: "#0066CC",  animate: true  },
            { label: "Top Opportunités",val: stats.topOpp,                         icon: Star,       color: "#FF9500",  animate: false },
            { label: <Tip text={TOOLTIPS.roi}>ROI Moyen</Tip>,
                                        val: `${stats.avgRoi}%`,                   icon: Target,     color: "#00C07F",  animate: false },
            { label: "Profit Cumulé",   val: `${stats.totalProfit.toLocaleString()}€`, icon: DollarSign, color: "#8B5CF6", animate: true  },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#E8E8ED] rounded-3xl p-5 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: `${s.color}15` }}>
                  <s.icon size={17} style={{ color: s.color }}/>
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight mb-1">
                {s.animate && typeof s.val === "number"
                  ? <AnimCounter target={s.val}/>
                  : s.val}
              </div>
              <div className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.2em]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── OUTILS (Analyseur + Vision + Bubble) ── */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          {/* Analyseur rapide */}
          <div className="col-span-1 bg-white border border-[#E8E8ED] rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center"><ClipboardPaste size={14} className="text-white"/></div>
              <h3 className="font-black text-sm">Analyseur Rapide</h3>
            </div>
            <textarea className="w-full bg-[#F7F7FA] rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-200 min-h-[80px] resize-none mb-3"
              placeholder="Collez une annonce brute..." value={quickInput} onChange={e => setQuickInput(e.target.value)}/>
            <button onClick={handleDiag}
              className="w-full bg-black text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
              Diagnostiquer
            </button>
          </div>

          {/* Vision plaque */}
          <div className="col-span-1">
            <VisionPlaque/>
          </div>

          {/* Bubble chart */}
          <div className="col-span-1">
            <BubbleChart data={allData}/>
          </div>
        </div>

        {/* ── COÛT D'OPPORTUNITÉ ── */}
        <div className="bg-white border border-[#E8E8ED] rounded-3xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-amber-500"/>
            <h3 className="font-black text-sm">Classement Coût d'Opportunité</h3>
            <span className="text-[9px] text-[#86868B] font-medium ml-1">(Profit / Jours de rotation)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {opCost.slice(0, 3).map((item, i) => (
              <div key={item.id} onClick={() => setSelected(item)}
                className="bg-[#F7F7FA] rounded-2xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xl font-black ${i === 0 ? "text-amber-400" : i === 1 ? "text-[#86868B]" : "text-amber-700"}`}>#{i + 1}</span>
                  <ScorePill score={item.score}/>
                </div>
                <div className="font-black text-xs mb-1 truncate">{item.title}</div>
                <div className="text-[10px] text-[#86868B] font-bold">
                  {item.dailyYield.toFixed(0)}€/jour · Profit {item.netProfit}€
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABLE PRINCIPALE ── */}
        <section className="bg-white rounded-3xl border border-[#E8E8ED] overflow-hidden">
          <div className="px-8 py-5 border-b border-[#F0F0F2] flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"/>
              <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-[#86868B]">Flux Annonces Live</h3>
              {compareList.length > 0 && (
                <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-black">
                  {compareList.length}/2 sélectionné(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Filtre catégorie */}
              <div className="flex bg-[#F0F0F2] rounded-full p-0.5 gap-0.5">
                {[["all","Tout"],["voiture","Voitures"],["piece","Pièces"]].map(([v, l]) => (
                  <button key={v} onClick={() => setFilterType(v)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${filterType === v ? "bg-white text-black shadow-sm" : "text-[#86868B]"}`}>
                    {l}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-[10px] font-black bg-[#F0F0F2] border-0 rounded-full px-3 py-2 outline-none cursor-pointer appearance-none pr-6">
                <option value="score">Score IA ↓</option>
                <option value="roi">ROI ↓</option>
                <option value="rotation">Rotation ↑</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.2em] bg-[#FAFAFA]">
                  {["","Véhicule / Pièce","Prix","Profit / ROI","Score IA","Rotation","Comparer","→"].map((h, i) => (
                    <th key={i} className="px-7 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7]">
                {isLoading && <SkeletonRow/>}
                {data.map((item, idx) => {
                  const isGold   = item.score >= 90;
                  const inComp   = compareList.some(i => i.id === item.id);
                  return (
                    <tr key={item.id}
                      onClick={() => setSelected(item)}
                      className={`group cursor-pointer transition-all duration-300 ${isGold ? "bg-amber-50/40" : "hover:bg-[#F7F7FA]"}`}
                      style={{ animationDelay: `${idx * 60}ms` }}>
                      <td className="px-7 py-5 w-6">
                        {isGold && (
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                            style={{ boxShadow: "0 0 8px #FBBF24, 0 0 16px #FBBF2466" }}/>
                        )}
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E8E8ED] group-hover:shadow-md transition-all flex-shrink-0">
                            <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
                          </div>
                          <div>
                            <div className="font-black text-sm mb-1 flex items-center gap-2">
                              {item.type === "piece"
                                ? <Package size={12} className="text-violet-500"/>
                                : <Car size={12} className="text-[#86868B]"/>}
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SourceBadge source={item.source}/>
                              <span className="text-[9px] text-[#86868B] font-bold flex items-center gap-0.5">
                                <MapPin size={9}/>{item.city} · {item.distanceKm}km
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        <div className="text-base font-black">{item.price.toLocaleString()}€</div>
                        <div className="text-[9px] text-[#86868B] font-bold">{item.km > 0 ? `${item.km.toLocaleString()} km · ${item.year}` : "Pièce détachée"}</div>
                      </td>
                      <td className="px-7 py-5">
                        <div className="font-black text-sm" style={{ color: item.netProfit > 0 ? "#00C07F" : "#FF3B30" }}>
                          {item.netProfit > 0 ? "+" : ""}{item.netProfit}€
                        </div>
                        <div className="text-[9px] font-black" style={{ color: item.roi > 0 ? "#00C07F" : "#FF3B30" }}>
                          <Tip text={TOOLTIPS.roi}>ROI {item.roi.toFixed(1)}%</Tip>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        <ScorePill score={item.score}/>
                        {item.defauts?.length > 0 && (
                          <div className="text-[9px] text-rose-500 font-bold mt-1 flex items-center gap-0.5">
                            <AlertTriangle size={9}/>{item.defauts.length} défaut(s)
                          </div>
                        )}
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                          <Clock size={12}/>
                          <Tip text={TOOLTIPS.rotation}>~{item.rotationDays}j</Tip>
                        </div>
                      </td>
                      <td className="px-7 py-5" onClick={e => { e.stopPropagation(); toggleCompare(item); }}>
                        <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${inComp ? "bg-indigo-600 border-indigo-600 text-white" : "border-[#D2D2D7] text-[#86868B] hover:border-indigo-400"}`}>
                          <GitCompare size={12}/>
                        </button>
                      </td>
                      <td className="px-7 py-5">
                        <ChevronRight size={16} className="text-[#D2D2D7] group-hover:text-indigo-600 transition-colors"/>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && !isLoading && (
                  <tr><td colSpan={8} className="px-8 py-16 text-center text-sm text-[#86868B] font-medium">
                    Aucune annonce. Lancez l'Autopilote ou changez le filtre.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="mt-14 px-10 py-7 border-t border-[#E8E8ED] flex justify-between items-center text-[#86868B]">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] italic text-[#1D1D1F]">SK Flux Master <span className="text-indigo-600">v12.0</span></div>
        <div className="text-[9px] font-mono">Build 2026.05.02 · React 18 · Vite · Tailwind</div>
      </footer>

      {/* ── PANELS ── */}
      {selected    && <SidePanel item={selected} onClose={() => setSelected(null)} allItems={allData}/>}
      {showCompare && <ComparePanel items={compareList} onClose={() => setShowCompare(false)}/>}
    </div>
  );
}