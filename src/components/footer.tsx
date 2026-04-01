import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Linkedin } from "lucide-react";

const DEVELOPER = {
  name: "Tanish S Pareek",
  github: "https://github.com/trigno1",
  linkedin: "https://www.linkedin.com/in/tanish-sunita-pareek/",
  email: "tanishpareek2005@gmail.com",
};

interface FooterProps {
  dark?: boolean; // true = dark footer (matches dark pages), false = white footer
}

export function Footer({ dark = false }: FooterProps) {
  const bg = dark ? "bg-[#080818] border-white/5" : "bg-white border-stone-100";
  const text = dark ? "text-white/25" : "text-stone-400";
  const hover = dark ? "hover:text-white" : "hover:text-stone-900";
  const iconBg = dark ? "bg-white/5 border-white/10" : "bg-stone-50 border-stone-200";

  return (
    <footer className={`w-full border-t ${bg} px-6 py-8`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className={`p-1 flex items-center justify-center rounded-lg border ${iconBg}`}>
            <Image src="/logo.png" alt="Phygital Logo" width={20} height={20} className="rounded" />
          </div>
          <div>
            <p className={`text-sm font-bold ${text}`}>Phygital Protocol</p>
            <p className={`text-xs ${text} opacity-70`}>Physical NFT Drops on Base Sepolia</p>
          </div>
        </div>

        {/* Developer credit */}
        <div className={`text-center text-xs ${text}`}>
          <p className="font-semibold mb-0.5">Developed &amp; Maintained by</p>
          <p className="font-bold text-sm"
            style={{ color: dark ? "rgba(255,255,255,0.5)" : "rgb(79 70 229)" }}>
            {DEVELOPER.name}
          </p>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-3">
          <a href={DEVELOPER.github} target="_blank" rel="noopener noreferrer"
            title="GitHub"
            className={`p-2.5 rounded-xl border ${iconBg} ${text} ${hover} transition-colors`}>
            <Github className="h-4 w-4" />
          </a>
          <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer"
            title="LinkedIn"
            className={`p-2.5 rounded-xl border ${iconBg} ${text} ${hover} transition-colors`}>
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={`mailto:${DEVELOPER.email}`}
            title="Email"
            className={`p-2.5 rounded-xl border ${iconBg} ${text} ${hover} transition-colors`}>
            <Mail className="h-4 w-4" />
          </a>
        </div>

      </div>
    </footer>
  );
}
