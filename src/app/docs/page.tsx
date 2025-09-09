'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FaPlay,
  FaArrowLeft,
  FaBook,
  FaQuestionCircle,
  FaChevronRight,
} from 'react-icons/fa'
import {
  MdScience,
  MdUpload,
  MdAccountTree,
  MdSettings,
  MdHelp,
} from 'react-icons/md'
import chemotionLogo from '../../../public/Chemotion_full.svg'

interface ContentItem {
  type: 'text' | 'list' | 'code'
  content?: string
  language?: string
  items?: string[]
}

interface Section {
  id: string
  title: string
  description: string
  content: ContentItem[]
}

interface FAQ {
  question: string
  answer: string
}

interface MainVideo {
  url: string
  title: string
  description: string
}

interface Documentation {
  title: string
  description: string
  mainVideo: MainVideo
  sections: Section[]
  faq: FAQ[]
}

export default function DocumentationPage() {
  const [documentation, setDocumentation] = useState<Documentation | null>(null)
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  useEffect(() => {
    fetch('/data/documentation.json')
      .then((res) => res.json())
      .then((data: Documentation) => {
        setDocumentation(data)
      })
      .catch((error) => {
        console.error('Error loading documentation:', error)
      })
  }, [])

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  const handleSectionTransition = (newSection: string) => {
    setActiveSection(newSection)
  }

  const getSectionIcon = (sectionId: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'what-is-smartadd': <MdScience className="w-5 h-5" />,
      'getting-started': <MdUpload className="w-5 h-5" />,
      'interface-overview': <MdAccountTree className="w-5 h-5" />,
      'step-by-step-workflow': <FaChevronRight className="w-5 h-5" />,
      'common-tasks': <MdSettings className="w-5 h-5" />,
      'tips-best-practices': <FaBook className="w-5 h-5" />,
      troubleshooting: <MdHelp className="w-5 h-5" />,
    }
    return iconMap[sectionId] || <FaBook className="w-5 h-5" />
  }

  if (!documentation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            Loading SmartAdd Documentation
          </h3>
          <p className="text-gray-600 mt-4">
            Preparing your learning experience...
          </p>
        </div>
      </div>
    )
  }

  const currentSection = documentation.sections.find(
    (section) => section.id === activeSection,
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-12xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 text-kit-primary-full hover:text-kit-primary-full/80"
            >
              <FaArrowLeft size={16} />
              <span className="text-sm font-medium">Back to SmartAdd</span>
            </Link>
            <div className="h-8 w-px bg-gray-300"></div>
            <Image src={chemotionLogo} alt="Chemotion Logo" height={32} />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-kit-primary-full rounded-lg flex items-center justify-center">
              <FaBook className="text-white" size={16} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Documentation</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-12xl mx-auto px-6 py-12">
        {/* Hero Section - Overview */}
        {activeSection === 'overview' && (
          <div className="mb-20">
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
                {documentation.title}
              </h1>
              <div className="w-24 h-1 bg-kit-primary-full mx-auto mb-8"></div>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {documentation.description}
              </p>
            </div>

            {/* Video Hero Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-10 mb-16">
              <div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-kit-primary-full rounded-lg flex items-center justify-center">
                    <FaPlay className="text-white ml-1" size={20} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {documentation.mainVideo.title}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {documentation.mainVideo.description}
                    </p>
                  </div>
                </div>

                <div className="aspect-video bg-gray-100 rounded-lg mb-8 overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(documentation.mainVideo.url)}
                    title={documentation.mainVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {documentation.sections.slice(0, 6).map((section) => (
                <div
                  key={section.id}
                  onClick={() => handleSectionTransition(section.id)}
                  className="bg-white rounded-lg border border-gray-200 p-8 cursor-pointer hover:border-kit-primary-full"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-kit-primary-full rounded-lg flex items-center justify-center text-white">
                      {getSectionIcon(section.id)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {section.description}
                      </p>
                      <div className="flex items-center text-kit-primary-full font-medium text-sm">
                        <span>Learn more</span>
                        <FaChevronRight size={12} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* FAQ Card */}
              <div
                onClick={() => handleSectionTransition('faq')}
                className="bg-indigo-50 rounded-lg border border-indigo-200 p-8 cursor-pointer hover:border-indigo-500"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                    <FaQuestionCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Find answers to common questions about SmartAdd features
                      and usage
                    </p>
                    <div className="flex items-center text-indigo-600 font-medium text-sm">
                      <span>View FAQ</span>
                      <FaChevronRight size={12} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {activeSection !== 'overview' && (
          <div>
            <div className="grid grid-cols-12 gap-8">
              {/* Sidebar Navigation */}
              <aside className="col-span-12 lg:col-span-3">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <button
                      onClick={() => handleSectionTransition('overview')}
                      className="flex items-center gap-3 text-kit-primary-full hover:text-kit-primary-full/80 transition-colors mb-6 group"
                    >
                      <FaArrowLeft
                        size={14}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                      <span className="text-sm font-medium">
                        Back to Overview
                      </span>
                    </button>

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Sections
                    </h3>
                    <nav className="space-y-2">
                      {documentation.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionTransition(section.id)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                            activeSection === section.id
                              ? 'bg-kit-primary-full text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-kit-primary-full'
                          }`}
                        >
                          <div
                            className={`${
                              activeSection === section.id
                                ? 'text-white'
                                : 'text-kit-primary-full'
                            }`}
                          >
                            {getSectionIcon(section.id)}
                          </div>
                          {section.title}
                        </button>
                      ))}
                      <button
                        onClick={() => handleSectionTransition('faq')}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                          activeSection === 'faq'
                            ? 'bg-kit-primary-full text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-kit-primary-full'
                        }`}
                      >
                        <div
                          className={`${
                            activeSection === 'faq'
                              ? 'text-white'
                              : 'text-kit-primary-full'
                          }`}
                        >
                          <FaQuestionCircle className="w-5 h-5" />
                        </div>
                        FAQ
                      </button>
                    </nav>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="col-span-12 lg:col-span-9">
                {activeSection === 'faq' ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-kit-primary-full rounded-lg flex items-center justify-center mx-auto mb-6">
                        <FaQuestionCircle className="text-white" size={24} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Frequently Asked Questions
                      </h2>
                      <p className="text-lg text-gray-600">
                        Find answers to common questions about SmartAdd
                      </p>
                    </div>

                    <div className="space-y-4">
                      {documentation.faq.map((faq, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setExpandedFAQ(
                                expandedFAQ === index ? null : index,
                              )
                            }
                            className="w-full px-6 py-5 text-left font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-between"
                          >
                            {faq.question}
                            <FaChevronRight
                              className={`text-gray-400 ${
                                expandedFAQ === index ? 'rotate-90' : ''
                              }`}
                              size={16}
                            />
                          </button>
                          {expandedFAQ === index && (
                            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                              <p className="text-gray-700 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : currentSection ? (
                  <div className="space-y-8">
                    {/* Section Header */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-kit-primary-full rounded-lg flex items-center justify-center mx-auto mb-6">
                        <div className="text-white">
                          {getSectionIcon(currentSection.id)}
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {currentSection.title}
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {currentSection.description}
                      </p>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                      <div className="prose prose-lg max-w-none">
                        {currentSection.content.map((item, index) => {
                          if (item.type === 'text') {
                            return (
                              <p
                                key={index}
                                className="mb-6 text-gray-700 leading-relaxed text-lg"
                              >
                                {item.content}
                              </p>
                            )
                          }

                          if (item.type === 'list') {
                            return (
                              <ul key={index} className="mb-6 space-y-3">
                                {item.items?.map((listItem, listIndex) => (
                                  <li
                                    key={listIndex}
                                    className="flex items-start gap-3 text-gray-700"
                                  >
                                    <div className="w-2 h-2 bg-kit-primary-full rounded-full mt-3 flex-shrink-0"></div>
                                    <span>{listItem}</span>
                                  </li>
                                ))}
                              </ul>
                            )
                          }

                          if (item.type === 'code') {
                            return (
                              <pre
                                key={index}
                                className="mb-6 bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto"
                              >
                                <code className="text-sm font-mono">
                                  {item.content}
                                </code>
                              </pre>
                            )
                          }

                          return null
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
