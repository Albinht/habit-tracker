import Link from 'next/link'
import Image from 'next/image'
import { LandingPageHeatmap } from '@/components/landing-page-heatmap'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Image
              src="/Traqur logo.png"
              alt="Traqur Logo"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
            <div className="flex space-x-2 sm:space-x-4">
              <Link href="/login">
                <button className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white border border-black text-xs sm:text-sm font-medium hover:bg-gray-900 transition-colors duration-200 shadow-lg hover:shadow-xl rounded-[5px]">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black border border-black text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl rounded-[5px]">
                  Start
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Content */}
        <div className="pt-16 sm:pt-24 pb-12 sm:pb-16 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Top tagline pill */}
            <div className="mb-8 sm:mb-12">
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full">
                Where consistency meets you
              </span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-5xl font-bold text-black mb-8 sm:mb-12 leading-[1.1] tracking-tight">
              mountains are climbed<br />
              one habit at a time.
            </h1>
            
            {/* Subtext */}
            <p className="text-m sm:text-l text-gray-600 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
              Every day you complete a habit, your heatmap grows stronger. Watch your commitment take shape, block by block, 
              and let your streaks keep you motivated for the long run.
            </p>
            
            {/* CTA Button */}
            <div className="mb-12">
              <Link href="/signup">
<button className="inline-flex items-center px-8 py-4 bg-black text-white text-lg font-medium hover:bg-gray-900 transition-colors duration-200 shadow-lg hover:shadow-xl rounded-[5px]">
                  create your first habit →
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mountain image - full display without cropping */}
        <div className="absolute bottom-0 left-0 w-full h-64 sm:h-80 md:relative md:h-auto">
          <Image
            src="/mountain header.png"
            alt="Mountain landscape"
            width={1920}
            height={800}
            className="w-full h-full object-cover md:object-contain"
            priority
          />
        </div>
      </div>

      {/* Habit Heatmap Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Interactive Heatmap Demo */}
          <LandingPageHeatmap />
          
          {/* Supporting Text */}
          <div className="text-center mt-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thousands of people are building stronger habits every day.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              From <strong>drinking more water</strong> to <strong>sleeping better</strong>, our heatmaps make your progress visible and keep your streaks alive. 
              Whether you're <u>quitting smoking</u>, <u>staying fit</u>, <u>meditating daily</u>, or <u>drinking enough water</u>, 
              every completed day builds momentum for lasting change.
            </p>
            <p className="text-sm text-gray-500 italic max-w-2xl mx-auto">
              One user even tracked their entire chess practice routine with a unique heatmap for every opening they studied.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Traqur. Every mountain is climbed one step at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
