import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Wand2, Check, Sparkles, Video, Users } from 'lucide-react';
import bgVideo from '../assets/bg_vid.mp4';

const LandingPage: React.FC = () => {
  return (
    <>
      {/* Video Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
          src={bgVideo}
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#972fff]/20 via-transparent to-[#c58aff]/20" />
      </div>

      <main className="relative z-10 text-foreground min-h-screen">
      
      {/* Header - Dynamic Island Style */}
      <header className="sticky top-0 z-50 pt-4 pb-4">
        <div className="mx-auto max-w-7xl px-6">
          <nav aria-label="Main" className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#972fff]/30 to-[#c58aff]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Main nav container */}
            <div className="relative bg-[#0b0b0b]/20 backdrop-blur-2xl border border-[#c58aff]/20 rounded-full px-6 py-3 shadow-2xl shadow-black/50 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg group/logo"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#972fff] to-[#c58aff] rounded-lg blur-sm group-hover/logo:blur-md transition-all" />
                  <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">
                  Lakeside
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-8 text-sm">
                <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
                  Features
                </a>
                <a href="#benefits" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
                  Why Choose Us
                </a>
                <a href="#cta" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
                  Get Started
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="hover:bg-[#972fff]/10 rounded-full">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 shadow-lg shadow-[#972fff]/25 rounded-full">
                  <Link to="/signup">Start Free</Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative scroll-mt-24 overflow-hidden" id="hero">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c58aff]/20 bg-[#972fff]/5 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#c58aff]" />
              <span className="text-sm text-[#ebd7ff]">Professional Podcast Studio</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance mb-6">
              <span className="bg-gradient-to-r from-white via-[#ebd7ff] to-[#c58aff] bg-clip-text text-transparent">
                Create Content
              </span>
              <br />
              <span className="text-foreground">That Captivates</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-foreground/70 text-balance max-w-3xl mx-auto leading-relaxed">
              Studio-quality recording, AI-powered editing, and seamless collaboration.
              <br className="hidden sm:block" />
              Everything you need to create professional podcasts.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 shadow-2xl shadow-[#972fff]/30 text-base px-8 py-6 h-auto">
                <Link to="/signup">Start Creating Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-[#c58aff]/30 hover:bg-[#972fff]/10 text-base px-8 py-6 h-auto backdrop-blur-sm">
                <Link to="/login">Watch Demo</Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-foreground/50">No credit card required • Free forever plan</p>
          </div>
        </div>

        {/* Floating Cards Animation */}
        <div className="absolute top-1/4 left-10 hidden lg:block">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#972fff]/20 to-[#c58aff]/20 backdrop-blur-xl border border-[#c58aff]/20 animate-float" />
        </div>
        <div className="absolute bottom-1/4 right-10 hidden lg:block">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c58aff]/20 to-[#ebd7ff]/20 backdrop-blur-xl border border-[#c58aff]/20 animate-float animation-delay-2000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 scroll-mt-24 relative" id="features">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-foreground/60 text-lg">Professional tools for professional creators</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Video,
                title: "4K Studio Quality",
                desc: "Crystal-clear 4K video and studio-grade audio with automatic local backups. Your content, protected.",
                gradient: "from-[#972fff]/10 to-[#972fff]/5"
              },
              {
                icon: Wand2,
                title: "AI Magic Editing",
                desc: "Remove filler words, generate transcripts, and create highlights automatically with AI.",
                gradient: "from-[#c58aff]/10 to-[#c58aff]/5"
              },
              {
                icon: Users,
                title: "Real-time Collaboration",
                desc: "Invite guests, co-host sessions, and stream to multiple platforms simultaneously.",
                gradient: "from-[#ebd7ff]/10 to-[#ebd7ff]/5"
              },
            ].map(({ icon: Icon, title, desc, gradient }) => (
              <div 
                key={title} 
                className="group relative overflow-hidden rounded-2xl border border-[#c58aff]/20 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl hover:border-[#c58aff]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#972fff]/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-8">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#972fff] to-[#c58aff] shadow-lg shadow-[#972fff]/25 mb-6">
                    <Icon className="h-7 w-7 text-white" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 scroll-mt-24 bg-gradient-to-b from-[#972fff]/5 to-transparent" id="benefits">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              Why Creators Love <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">Lakeside</span>
            </h2>
            
            <div className="grid gap-4">
              {[
                { title: "Zero Learning Curve", desc: "Start recording in seconds, not hours" },
                { title: "AI-Powered Intelligence", desc: "Smart editing that understands your content" },
                { title: "Broadcast Quality", desc: "Professional results every single time" },
                { title: "Collaborate Seamlessly", desc: "Invite guests and co-hosts with ease" }
              ].map(({ title, desc }) => (
                <div 
                  key={title} 
                  className="flex items-start gap-4 p-6 rounded-xl border border-[#c58aff]/10 bg-background/50 backdrop-blur-sm hover:border-[#c58aff]/30 hover:bg-[#972fff]/5 transition-all duration-300"
                >
                  <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center shadow-lg shadow-[#972fff]/20">
                    <Check className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-foreground/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 scroll-mt-24 relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-gradient-to-b from-[#972fff]/10 via-[#c58aff]/10 to-transparent" />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Ready to Create Something <span className="bg-gradient-to-r from-[#c58aff] to-[#ebd7ff] bg-clip-text text-transparent">Amazing?</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-10">Join thousands of creators producing studio-quality content</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-[#972fff] to-[#c58aff] hover:opacity-90 shadow-2xl shadow-[#972fff]/30 text-base px-8 py-6 h-auto">
              <Link to="/signup">Start Creating Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-[#c58aff]/30 hover:bg-[#972fff]/10 text-base px-8 py-6 h-auto backdrop-blur-sm" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c58aff]/10 bg-background/50 backdrop-blur-xl mt-20">
        <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#972fff] to-[#c58aff] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Lakeside</span>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-sm">
              Professional podcast studio powered by AI. Create, edit, and broadcast stunning content with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <p className="text-sm font-semibold mb-4 text-[#c58aff]">Product</p>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">Updates</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-[#c58aff]">Company</p>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="#" className="text-foreground/60 hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#c58aff]/10">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
            <span>© {new Date().getFullYear()} Lakeside. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
};

export default LandingPage;