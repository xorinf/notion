import { useNavigate } from 'react-router'
import { Feather, CheckCircle, Users, BarChart3, Zap, FileText, LayoutGrid, BookOpen, ArrowRight } from 'lucide-react'

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      color: '#1a73e8',
      title: 'Rich Page Editor',
      desc: 'Write beautiful documents with a powerful rich text editor. Bold, headings, code blocks, tables — everything you need.'
    },
    {
      icon: LayoutGrid,
      color: '#8e24aa',
      title: 'Kanban Boards',
      desc: 'Drag and drop cards across lists. Set priorities, due dates, checklists, labels, and attachments on every card.'
    },
    {
      icon: Users,
      color: '#34a853',
      title: 'Team Collaboration',
      desc: 'Create workspaces, invite teammates, and work together in real-time. Role-based access keeps your data secure.'
    },
    {
      icon: Zap,
      color: '#fb8c00',
      title: 'Real-time Updates',
      desc: 'Changes appear instantly across devices. Move a card, edit a page — your team sees it immediately.'
    },
    {
      icon: CheckCircle,
      color: '#00897b',
      title: 'Task Management',
      desc: 'View all your tasks from every board in one unified view. Filter by priority, search, and track progress.'
    },
    {
      icon: BookOpen,
      color: '#e53935',
      title: 'Activity Journal',
      desc: "Stay on top of what's happening. See a chronological timeline of all actions across your workspaces."
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#191919] px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Feather className="w-7 h-7 text-[#191919]" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-5 leading-none">
          Taskify
        </h1>
        <p className="text-xl text-white/55 mb-4 font-light max-w-xl mx-auto leading-relaxed">
          The all-in-one workspace for notes, tasks, and team collaboration.
        </p>
        <p className="text-sm text-white/30 mb-10">
          Rich pages · Kanban boards · Real-time collab · Activity journal
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            id="hero-get-started"
            onClick={() => navigate("/register")}
            className="bg-white text-[#1d1d1f] font-semibold px-7 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-sm text-sm"
          >
            Get Started Free
          </button>
          <button
            id="hero-sign-in"
            onClick={() => navigate("/login")}
            className="border border-white/20 text-white/80 font-medium px-7 py-3 rounded-xl hover:bg-white/8 transition-colors text-sm"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-3">
            Everything you need to stay organized
          </h2>
          <p className="text-[#5f6368] text-base max-w-xl mx-auto">
            Built for individuals and teams who want to move fast without losing track.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-[#e8e8ed] hover:border-[#d1d5db] hover:shadow-sm transition-all duration-150"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: f.color + '14' }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-2">{f.title}</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#f8f9fa] border-t border-[#e8e8ed] py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#1d1d1f] mb-3 tracking-tight">
            Ready to get organized?
          </h3>
          <p className="text-[#5f6368] mb-8 text-sm">
            Join thousands of teams using Taskify to manage their work.
          </p>
          <button
            id="cta-create-account"
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 bg-[#1a73e8] text-white font-semibold px-7 py-3 rounded-xl hover:bg-[#1558b0] transition-colors shadow-sm text-sm"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#191919] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Feather className="w-4 h-4 text-white" strokeWidth={2} />
          <span className="text-sm font-semibold text-white">Taskify</span>
        </div>
        <p className="text-xs text-[#6b7280]">© {new Date().getFullYear()} Taskify</p>
      </footer>
    </div>
  )
}

export default Home