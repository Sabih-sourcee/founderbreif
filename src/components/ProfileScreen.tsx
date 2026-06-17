import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { UserProfile, ProjectBrief } from "../types";
import { Edit, ShieldCheck, PieChart, Landmark } from "lucide-react";

interface ProfileScreenProps {
  userEmail: string;
  savedBriefsCount: number;
  briefs: ProjectBrief[];
  onAuthChanged: (updatedProfile: UserProfile) => void;
}

export default function ProfileScreen({
  userEmail,
  savedBriefsCount,
  briefs,
  onAuthChanged
}: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "Founder Guest",
    email: userEmail || "bookspower218@gmail.com",
    companyName: "Startup Inc.",
    isLoggedIn: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempCompany, setTempCompany] = useState("");

  // Load from local storage if available
  useEffect(() => {
    const cached = localStorage.getItem("founder_brief_user_profile");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: tempName.trim() || profile.name,
      companyName: tempCompany.trim() || profile.companyName
    };
    setProfile(updated);
    localStorage.setItem("founder_brief_user_profile", JSON.stringify(updated));
    onAuthChanged(updated);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTempName(profile.name);
    setTempCompany(profile.companyName || "");
    setIsEditing(true);
  };

  // Briefs distribution analytics
  const counts = {
    Low: briefs.filter((b) => b.complexity === "Low").length,
    Medium: briefs.filter((b) => b.complexity === "Medium").length,
    High: briefs.filter((b) => b.complexity === "High").length
  };

  const total = briefs.length || 1;
  const percentages = {
    Low: Math.round((counts.Low / total) * 100),
    Medium: Math.round((counts.Medium / total) * 100),
    High: Math.round((counts.High / total) * 100)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col justify-start px-4 sm:px-6 pt-6 pb-24 max-w-2xl mx-auto w-full font-sans text-left"
    >
      {/* Header section */}
      <section className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Founder Profile</h1>
        <p className="text-xs text-[#444748] mt-1">Configure your strategist and developer metrics alignment.</p>
      </section>

      {/* Main Profile Info Card */}
      <section className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Circular avatar placeholder with material style styling */}
          <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-[#FAF8F5] border-2 border-[#E5DDD3] flex items-center justify-center overflow-hidden font-bold text-xl font-mono relative uppercase shrink-0">
            {profile.name ? profile.name.charAt(0) : "F"}
          </div>

          <div className="flex-grow w-full min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-2 select-text w-full">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Founder Name"
                  className="w-full text-sm p-2 bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg focus:border-[#E07B39] focus:ring-0 text-[#1A1A1A] font-semibold"
                  maxLength={40}
                  required
                />
                <input
                  type="text"
                  value={tempCompany}
                  onChange={(e) => setTempCompany(e.target.value)}
                  placeholder="Company Name"
                  className="w-full text-sm p-2 bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg focus:border-[#E07B39] focus:ring-0 text-[#1A1A1A] font-semibold"
                  maxLength={40}
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 h-8 bg-[#1A1A1A] text-[#FAF8F5] rounded-md text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 h-8 border border-[#E5DDD3] text-[#444748] rounded-md text-xs font-semibold hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-left">
                <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight">{profile.name}</h2>
                <p className="text-xs text-[#747878] truncate mt-0.5">{profile.email}</p>
                {profile.companyName && (
                  <p className="text-xs font-mono font-bold text-[#E07B39] bg-[#E5DDD3]/45 px-2 py-0.5 rounded-full inline-block mt-2 uppercase tracking-wide">
                    {profile.companyName}
                  </p>
                )}
                
                <button
                  onClick={handleStartEdit}
                  className="mt-3.5 text-xs text-[#E07B39] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile Details</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brief distribution and numerical analytics */}
      <section className="space-y-4 mb-6">
        <h3 className="text-xs font-bold text-[#444748] uppercase tracking-wider font-mono">Applet Analytics</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-[#F2EEE8] border border-[#E5DDD3] rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#444748] uppercase tracking-wider block font-mono">Archived Specifications</span>
              <span className="text-2xl font-extrabold text-[#1A1A1A] mt-1 block">{savedBriefsCount}</span>
            </div>
            <PieChart className="w-6 h-6 text-[#747878] opacity-60" />
          </div>

          <div className="p-4 bg-[#F2EEE8] border border-[#E5DDD3] rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-[#444748] uppercase tracking-wider block font-mono">Primary Currency Focus</span>
              <span className="text-sm font-extrabold text-[#1A1A1A] mt-2 block lowercase sm:uppercase">USD (United States Dollar)</span>
            </div>
            <Landmark className="w-6 h-6 text-[#747878] opacity-60" />
          </div>
        </div>

        {/* Level breakdown progress cards */}
        <div className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Project Scope Metrics</h4>
          
          <div className="space-y-3 font-mono">
            {/* Low bar */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#444748] mb-1">
                <span>Low Complexity ({counts.Low})</span>
                <span>{briefs.length ? percentages.Low : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5DDD3] rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${briefs.length ? percentages.Low : 0}%` }}></div>
              </div>
            </div>

            {/* Medium bar */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#444748] mb-1">
                <span>Medium Complexity ({counts.Medium})</span>
                <span>{briefs.length ? percentages.Medium : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5DDD3] rounded-full overflow-hidden">
                <div className="h-full bg-[#E07B39]" style={{ width: `${briefs.length ? percentages.Medium : 0}%` }}></div>
              </div>
            </div>

            {/* High bar */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#444748] mb-1">
                <span>High Complexity ({counts.High})</span>
                <span>{briefs.length ? percentages.High : 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E5DDD3] rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${briefs.length ? percentages.High : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer informational quick tips section */}
      <section className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-xl flex gap-3 text-left">
        <ShieldCheck className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold text-[#1A1A1A]">CTO Pro-tip for Meetings</h5>
          <p className="text-[11px] text-[#444748] mt-1 leading-relaxed font-normal">
            When meeting with engineers, remember to establish clear milestones first. Use the vetting questions inside each generated brief to assess their response to real-time integration hurdles and security at scale.
          </p>
        </div>
      </section>
    </motion.div>
  );
}
