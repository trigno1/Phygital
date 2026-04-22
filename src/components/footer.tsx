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
  dark?: boolean;
}

export function Footer({ dark = false }: FooterProps) {
  const bg = dark ? "bg-[#050510] border-t border-white/5" : "bg-stone-50 border-t border-stone-200";
  const textTitle = dark ? "text-white" : "text-stone-900";
  const textSub = dark ? "text-white/50" : "text-stone-500";
  const hover = dark ? "hover:text-white" : "hover:text-stone-900";
  const iconBg = dark ? "bg-white/5 border border-white/10" : "bg-white border border-stone-200 shadow-sm";

  return (
    <footer className={`w-full relative overflow-hidden py-10 md:py-14 ${bg}`}>
      {/* Ambient top border glow for dark mode */}
      {dark && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />}

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
        
        {/* Brand section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/phygital_ultra_logo.png" alt="Phygital Logo" width={32} height={32} className="object-contain" />
            <span className={`text-xl font-black tracking-tight ${textTitle}`}>Phygital</span>
          </div>
          <p className={`text-sm font-medium ${textSub}`}>Physical NFT Drops on Base Sepolia</p>
        </div>

        {/* Developer Credit */}
        <div className="text-center flex flex-col items-center">
          <span className={`text-xs font-semibold uppercase tracking-widest mb-1 ${textSub}`}>Developed by</span>
          <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500`}>
            {DEVELOPER.name}
          </span>
        </div>

        {/* Social interactions */}
        <div className="flex items-center gap-3">
          {[
            { icon: Github, href: DEVELOPER.github, title: "GitHub" },
            { icon: Linkedin, href: DEVELOPER.linkedin, title: "LinkedIn" },
            { icon: Mail, href: `mailto:${DEVELOPER.email}`, title: "Email" }
          ].map((item, i) => (
            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" title={item.title}
              className={`p-3 rounded-full ${iconBg} ${textSub} ${hover} transition-all hover:scale-110 hover:-translate-y-1`}>
              <item.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
