import { useNavigate } from 'react-router'
import { Feather, CheckCircle, Users, BarChart3, Zap } from 'lucide-react'
import { 
  pageWrapper, 
  cardClass, 
  primaryBtn, 
  secondaryBtn, 
  pageTitleClass, 
  bodyText, 
  headingClass 
} from '../styles/common'
import Notification from './Notification';

function Home() {
  const navigate = useNavigate();

  return (
    <div className={pageWrapper}>
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 mt-10">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center">
            <Feather className="w-8 h-8 text-[#1a73e8]" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className={`${pageTitleClass} mb-6`}>Taskify</h1>
        <p className={`${bodyText} text-lg sm:text-xl mb-10`}>
          Plan smarter, work faster, and manage tasks effortlessly. 
          The ultimate workspace for individuals and teams.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate("/register")} className={primaryBtn}>
            Get Started
          </button>
          <button onClick={() => navigate("/login")} className={secondaryBtn}>
            Sign In
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-5xl mx-auto">
        <div className={`${cardClass} flex flex-col gap-3`}>
          <div className="w-10 h-10 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <h2 className={headingClass}>Smart Task Management</h2>
          <p className={bodyText}>
            Create, organize, and prioritize tasks with ease. Manage deadlines,
            assign responsibilities, and keep every project structured in one place.
          </p>  
        </div>

        <div className={`${cardClass} flex flex-col gap-3`}>
          <div className="w-10 h-10 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <h2 className={headingClass}>Team Collaboration</h2>
          <p className={bodyText}>
            Work seamlessly with teammates through shared boards, task updates,
            and real-time collaboration that keeps everyone aligned.
          </p>
        </div>

        <div className={`${cardClass} flex flex-col gap-3`}>
          <div className="w-10 h-10 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <h2 className={headingClass}>Progress Tracking</h2>
          <p className={bodyText}>
            Monitor project stages, track completed tasks, and stay informed
            with clear workflow visibility from start to finish.
          </p>
        </div>

        <div className={`${cardClass} flex flex-col gap-3`}>
          <div className="w-10 h-10 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <h2 className={headingClass}>Boost Productivity</h2>
          <p className={bodyText}>
            Simplify complex workflows, reduce clutter, and focus on what matters
            most with an efficient system built for individuals and teams.
          </p>
        </div>
      </div>

      

      {/* CTA Section */}
      <div className="text-center max-w-2xl mx-auto bg-white border border-[#dadce0] rounded-[24px] p-10 shadow-sm">
        <h3 className={`${headingClass} mb-3`}>Start organizing your work today</h3>
        <p className={`${bodyText} mb-8`}>
          Join Taskify to manage tasks, collaborate with your team, and turn ideas into completed projects.
        </p>
        <button onClick={() => navigate("/register")} className={primaryBtn}>
          Create Free Account
        </button>
      </div>
    </div>
  )
}

export default Home