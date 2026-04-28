import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Check, Music2, Settings, Zap } from "lucide-react";

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Connect SoundCloud",
      icon: Music2,
      description: "Link your SoundCloud profile to auto-detect new releases",
      content: (
        <div className="space-y-6">
          <div className="p-6 border border-slate-700 rounded-lg bg-slate-900/50">
            <h3 className="text-lg font-semibold mb-4">SoundCloud Authorization</h3>
            <p className="text-slate-400 mb-6">
              We'll ask permission to read your public profile and detect new tracks. Your credentials are encrypted and never shared.
            </p>
            <Button className="bg-neon-green text-black hover:bg-neon-green/90 w-full">
              Connect SoundCloud
            </Button>
          </div>

          <div className="p-4 bg-neon-green/5 border border-neon-green/20 rounded-lg">
            <p className="text-sm text-slate-300">
              ✓ Your SoundCloud username: <span className="text-neon-green font-semibold">@yourprofile</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Choose Platforms",
      icon: Zap,
      description: "Select which platforms to distribute your music to",
      content: (
        <div className="space-y-4">
          <p className="text-slate-400 mb-6">
            Select all the platforms where you want your music to appear. You can change this anytime.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "Spotify", icon: "🎵" },
              { name: "Apple Music", icon: "🍎" },
              { name: "YouTube Music", icon: "▶️" },
              { name: "Amazon Music", icon: "📦" },
              { name: "Tidal", icon: "🌊" },
              { name: "Deezer", icon: "🎧" },
              { name: "TikTok", icon: "🎬" },
              { name: "Instagram", icon: "📸" },
              { name: "YouTube", icon: "▶️" },
              { name: "Bandcamp", icon: "🎸" },
              { name: "SoundCloud", icon: "☁️" },
              { name: "Beatport", icon: "🎚️" },
            ].map((platform) => (
              <label key={platform.name} className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:border-neon-green/40 hover:bg-neon-green/5">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-lg">{platform.icon}</span>
                <span className="font-semibold">{platform.name}</span>
              </label>
            ))}
          </div>

          <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
            <p className="text-sm text-slate-300">
              💡 Tip: Start with major platforms (Spotify, Apple Music, YouTube) for maximum reach. You can add more later.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Set Preferences",
      icon: Settings,
      description: "Configure your distribution settings",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Auto-Publish New Tracks</label>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green rounded font-semibold">
                Enabled
              </button>
              <p className="text-slate-400 text-sm">
                Automatically distribute new SoundCloud releases to your selected platforms
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Release Delay</label>
            <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white">
              <option>Immediate (no delay)</option>
              <option>1 day delay</option>
              <option>3 days delay</option>
              <option>1 week delay</option>
            </select>
            <p className="text-slate-400 text-sm mt-2">
              How long to wait before distributing after you upload to SoundCloud
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notification Preferences</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Email when track goes live</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Email on distribution errors</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Weekly distribution summary</span>
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Review & Confirm",
      icon: Check,
      description: "You're all set! Review your settings",
      content: (
        <div className="space-y-6">
          <div className="p-6 border border-neon-green/40 bg-neon-green/5 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-neon-green">✓ Setup Complete!</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">SoundCloud Connected</p>
                  <p className="text-slate-400">Monitoring @yourprofile for new releases</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">12 Platforms Selected</p>
                  <p className="text-slate-400">Spotify, Apple Music, YouTube, and 9 more</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Auto-Publish Enabled</p>
                  <p className="text-slate-400">New tracks will distribute immediately</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-700 bg-slate-900/50 rounded-lg">
            <h4 className="font-semibold mb-3">What Happens Next?</h4>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li>We'll monitor your SoundCloud profile for new releases</li>
              <li>When you upload a track, we'll automatically distribute it</li>
              <li>Within 2-4 hours, your music will be live on all selected platforms</li>
              <li>You'll receive email notifications with distribution status</li>
              <li>Track your performance in your dashboard</li>
            </ol>
          </div>

          <Button className="w-full bg-neon-green text-black hover:bg-neon-green/90 py-6 text-lg font-semibold">
            Start Distributing
          </Button>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  idx <= currentStep ? "bg-neon-green" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Step Card */}
        <Card className="p-8 border-slate-700 bg-slate-900/50 space-y-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neon-green/20 rounded-lg">
              <Icon className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentStepData.title}</h1>
              <p className="text-slate-400 mt-1">{currentStepData.description}</p>
            </div>
          </div>

          {/* Content */}
          <div>{currentStepData.content}</div>

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1 border-slate-600"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="flex-1 bg-neon-green text-black hover:bg-neon-green/90"
            >
              {currentStep === steps.length - 1 ? "Done" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </Card>

        {/* Step Indicators */}
        <div className="mt-12 flex justify-between">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`text-center text-sm transition-colors ${
                idx === currentStep
                  ? "text-neon-green font-semibold"
                  : idx < currentStep
                    ? "text-slate-400 line-through"
                    : "text-slate-500"
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
