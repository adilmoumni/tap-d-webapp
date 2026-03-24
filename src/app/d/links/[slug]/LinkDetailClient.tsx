"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, Monitor, Loader2, BarChart3, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { SmartLinkForm } from "@/components/dashboard/links/SmartLinkForm";
import { getLink, deleteLink, getLinksStats, type LinkDocument, type DayStats } from "@/lib/db/links";
import { getRedirectUrl } from "@/lib/device";
import Link from "next/link";

function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
       <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
      <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l48,83.08C62.09,198.53,6,277,3.12,367.65H572.88c-2.88-90.6-59-169.12-143.73-210.2Z"/>
    </svg>
  )
}

function getCountryEmoji(countryCode: string) {
  if (!countryCode || countryCode === "unknown" || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function LinkDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [link, setLink] = useState<LinkDocument | null>(null);
  const [stats, setStats] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const s = Array.isArray(slug) ? slug[0] : slug;
    if (!s) return;
    Promise.all([
      getLink(s),
      getLinksStats(s, 30)
    ]).then(([l, s]) => {
      setLink(l);
      setStats(s);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://tap-d.link/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLink(slug);
      router.push("/d/links");
    } catch (err) {
      console.error(err);
      alert("Failed to delete link.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const totalClicks = useMemo(() => stats.reduce((acc, s) => acc + s.clicks, 0), [stats]);
  const totalIos = useMemo(() => stats.reduce((acc, s) => acc + s.iosClicks, 0), [stats]);
  const totalAndroid = useMemo(() => stats.reduce((acc, s) => acc + s.androidClicks, 0), [stats]);
  const totalDesktop = useMemo(() => stats.reduce((acc, s) => acc + s.desktopClicks, 0), [stats]);

  const deviceData = useMemo(() => {
    const data = [];
    if (totalIos > 0) data.push({ name: "iOS", value: totalIos, color: "#e8b86d" });
    if (totalAndroid > 0) data.push({ name: "Android", value: totalAndroid, color: "#4ade80" });
    if (totalDesktop > 0) data.push({ name: "Desktop", value: totalDesktop, color: "#60a5fa" });
    return data;
  }, [totalIos, totalAndroid, totalDesktop]);

  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
       const d = new Date(today);
       d.setDate(d.getDate() - i);
       const dateStr = d.toISOString().split("T")[0];
       const stat = stats.find(s => s.date === dateStr);
       data.push({
         date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
         clicks: stat ? stat.clicks : 0
       });
    }
    return data;
  }, [stats]);

  const topCountries = useMemo(() => {
    const map: Record<string, number> = {};
    stats.forEach(s => {
      Object.entries(s.countries || {}).forEach(([c, count]) => {
        map[c] = (map[c] || 0) + count;
      });
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [stats]);

  const topReferrers = useMemo(() => {
    const map: Record<string, number> = {};
    stats.forEach(s => {
      Object.entries(s.referrers || {}).forEach(([r, count]) => {
        const key = r.replace(/_/g, ".");
        map[key] = (map[key] || 0) + count;
      });
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [stats]);


  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-500" size={40} /></div>;
  }

  if (!link) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Link not found</h2>
        <Link href="/d/links" className="text-blue-500 hover:underline mt-4">Return to links</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8 pb-32">
      <div className="md:w-[60%] space-y-6">
         <Link href="/d/links" className="text-sm flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors w-fit">
           <ChevronLeft size={16}/> Back to links
         </Link>
         
         <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm">
           <h2 className="text-xl font-bold mb-4 text-[#1a1a2e]">Edit Link</h2>
           <SmartLinkForm 
             mode="edit" 
             initialData={link} 
             onSuccess={(updated) => setLink({ ...link, ...updated } as LinkDocument)} 
             onCancel={() => router.push("/d/links")}
           />
         </div>
         
         <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-[#1a1a2e]">Link Actions</h3>
            
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-[#1a1a2e]">Share Link</div>
              <div className="flex items-center gap-3">
                 <div className="flex-1 bg-[#faf8fc] p-3 rounded-lg border border-[#e8e6e2] font-mono text-sm text-[#8a8a9a] truncate">
                    https://tap-d.link/{slug}
                 </div>
                 <button onClick={handleCopy} className="bg-[#1a1a2e] text-white px-4 py-3 rounded-lg font-semibold hover:bg-black transition-colors w-28 shrink-0">
                    {copied ? "Copied!" : "Copy URL"}
                 </button>
              </div>
            </div>

            <div className="border-t border-[#e8e6e2] pt-6">
              <h4 className="text-sm font-semibold mb-3 text-[#1a1a2e]">Test Link Destinations</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <button onClick={() => window.open(getRedirectUrl("ios", link.iosUrl, link.androidUrl, link.fallbackUrl), "_blank")} className="flex items-center justify-center gap-2 border border-[#e8e6e2] hover:border-[#e8b86d] hover:bg-[#faeeda] hover:text-[#b8860b] p-3 rounded-[10px] text-sm font-medium text-[#1a1a2e] shadow-sm transition-all">
                   <AppleIcon/> Test as iOS 
                 </button>
                 <button onClick={() => window.open(getRedirectUrl("android", link.iosUrl, link.androidUrl, link.fallbackUrl), "_blank")} className="flex items-center justify-center gap-2 border border-[#e8e6e2] hover:border-[#e8b86d] hover:bg-[#faeeda] hover:text-[#b8860b] p-3 rounded-[10px] text-sm font-medium text-[#1a1a2e] shadow-sm transition-all">
                   <AndroidIcon/> Test as Android
                 </button>
                 <button onClick={() => window.open(getRedirectUrl("desktop", link.iosUrl, link.androidUrl, link.fallbackUrl), "_blank")} className="flex items-center justify-center gap-2 border border-[#e8e6e2] hover:border-[#e8b86d] hover:bg-[#faeeda] hover:text-[#b8860b] p-3 rounded-[10px] text-sm font-medium text-[#1a1a2e] shadow-sm transition-all">
                   <Monitor size={14}/> Test as Desktop
                 </button>
              </div>
              {!link.isSmart && <p className="text-xs text-[#8a8a9a] mt-2 italic">Since Smart Link is off, all buttons point to the Fallback URL.</p>}
            </div>
            
            <div className="border-t border-[#e8e6e2] pt-6 flex justify-end">
              <button onClick={() => setShowDeleteModal(true)} className="text-[#ef4444] hover:text-white hover:bg-[#ef4444] px-4 py-2 font-semibold text-[13px] border border-[#fecaca] rounded-lg flex items-center gap-2 transition-colors">
                <Trash2 size={16}/> Delete this link forever
              </button>
            </div>
         </div>
      </div>
      
      <div className="md:w-[40%] space-y-6">
        {totalClicks === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#e8e6e2] shadow-sm text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-[#faf8fc] rounded-full flex items-center justify-center mb-2">
              <BarChart3 className="text-[#e8b86d]" size={32}/>
            </div>
            <h3 className="font-bold text-lg text-[#1a1a2e]">No clicks yet</h3>
            <p className="text-sm text-[#8a8a9a] leading-snug">Share your link to start tracking advanced analytics including devices, referrers, and locations!</p>
            <div className="font-mono text-[12px] bg-[#faf8fc] p-3 rounded-lg border border-[#e8e6e2] w-full truncate text-[#1a1a2e]">
              https://tap-d.link/{slug}
            </div>
            <button onClick={handleCopy} className="w-full bg-[#1a1a2e] text-white px-4 py-3 rounded-lg font-semibold hover:bg-black transition-colors">
              {copied ? "Copied!" : "Copy Link to Share"}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] flex flex-col gap-1 shadow-sm">
               <span className="text-sm text-[#8a8a9a] font-semibold tracking-wide uppercase">Total Clicks (30d)</span>
               <span className="text-5xl font-extrabold text-[#e8b86d] tracking-tight">{totalClicks.toLocaleString()}</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm">
               <h3 className="text-sm font-semibold mb-6 text-[#1a1a2e]">Daily Clicks</h3>
               <div className="h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                     <XAxis dataKey="date" tick={{fontSize: 10, fill: "#8a8a9a"}} tickLine={false} axisLine={false} tickMargin={10} />
                     <RechartsTooltip cursor={{fill: '#faf8fc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e8e6e2', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: "bold", fontSize: 13, color: "#1a1a2e"}} />
                     <Bar dataKey="clicks" fill="#e8b86d" radius={[4, 4, 0, 0]} name="Clicks" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm">
               <h3 className="text-sm font-semibold mb-2 text-[#1a1a2e]">Devices</h3>
               <div className="h-[200px] mb-2 relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie 
                        data={deviceData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={65} 
                        outerRadius={85} 
                        paddingAngle={3} 
                        dataKey="value"
                        stroke="none"
                     >
                       {deviceData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{borderRadius: '8px', border: '1px solid #e8e6e2', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: "bold", fontSize: 12}} />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                    <span className="text-[10px] text-[#8a8a9a] font-semibold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-[#1a1a2e]">{totalClicks}</span>
                 </div>
               </div>
               <div className="flex justify-center gap-6">
                 {deviceData.map(d => (
                   <div key={d.name} className="flex flex-col items-center">
                     <div className="flex items-center gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                       <span className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wide">{d.name}</span>
                     </div>
                     <span className="text-[13px] font-bold mt-0.5 text-[#1a1a2e]">{d.value} <span className="text-[11px] text-[#8a8a9a] font-medium ml-0.5">({Math.round((d.value/totalClicks)*100)}%)</span></span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-[#1a1a2e]">Top Locations</h3>
                <div className="space-y-4">
                  {topCountries.length === 0 ? (
                    <span className="text-sm text-[#8a8a9a]">Not enough data.</span>
                  ) : (
                    topCountries.map(([country, count]) => (
                      <div key={country} className="flex flex-row justify-between items-center group">
                         <div className="flex items-center gap-3">
                           <span className="text-[18px] leading-none">{getCountryEmoji(country)}</span>
                           <span className="text-[13px] font-semibold text-[#1a1a2e] group-hover:text-[#e8b86d] transition-colors">{country === 'unknown' ? 'Unknown region' : country}</span>
                         </div>
                         <span className="text-[13px] text-[#8a8a9a] font-semibold bg-[#faf8fc] px-2 py-1 rounded-md">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#e8e6e2] shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-[#1a1a2e]">Top Sources</h3>
                <div className="space-y-4">
                  {topReferrers.length === 0 ? (
                    <span className="text-sm text-[#8a8a9a]">Not enough data.</span>
                  ) : (
                    topReferrers.map(([ref, count]) => (
                      <div key={ref} className="flex flex-row justify-between items-center group">
                         <span className="text-[13px] font-semibold text-[#1a1a2e] truncate max-w-[200px] group-hover:text-[#e8b86d] transition-colors capitalize-first">{ref}</span>
                         <span className="text-[13px] text-[#8a8a9a] font-semibold bg-[#faf8fc] px-2 py-1 rounded-md">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] p-8 max-w-sm w-full space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-[#ef4444]" />
            </div>
             <div className="text-center space-y-2">
                <h3 className="font-bold text-xl text-[#1a1a2e]">Delete link?</h3>
                <p className="text-[13px] text-[#8a8a9a] leading-relaxed px-2">
                  This action <strong className="text-[#1a1a2e]">cannot be undone</strong>. All analytics will be permanently removed, and any traffic to this link will 404.
                </p>
             </div>
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="w-full px-4 py-3.5 bg-[#ef4444] text-white font-bold rounded-xl hover:bg-[#dc2626] flex justify-center items-center shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={18} className="animate-spin"/> : "Yes, delete forever"}
              </button>
              <button disabled={deleting} onClick={() => setShowDeleteModal(false)} className="w-full px-4 py-3.5 bg-white border-2 border-[#e8e6e2] text-[#1a1a2e] font-bold rounded-xl hover:bg-[#faf8fc] transition-colors disabled:opacity-50">
                 Keep link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
