import { useState, useRef, useEffect } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function KirubChat() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: language === 'en' 
        ? "Hello! I'm Kirub, your AI assistant for the Ethiopian Red Cross Society. How can I help you today?"
        : language === 'am'
        ? "ሰላም! እኔ Kirub ነኝ፣ የኢትዮጵያ ቀይ መስቀል ማኅበር የእርስዎ AI ረዳት። ዛሬ እንዴት እርዳዎ እችላለሁ?"
        : "Akkam! Ani Kirub dha, gargaarsi AI keessan Ethiopian Red Cross Society. Har'a akkam si gargaaru?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const conversationHistory = useRef([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    conversationHistory.current = [...conversationHistory.current, userMessage]
    setInput('')
    setLoading(true)

    try {
      const response = await api.ai.chat(input, conversationHistory.current)
      const assistantMessage = {
        role: 'assistant',
        content: response.response || 'Sorry, I could not generate a response.'
      }
      setMessages([...newMessages, assistantMessage])
      conversationHistory.current = [...conversationHistory.current, assistantMessage]
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: language === 'en'
          ? 'Sorry, I encountered an error. Please try again later.'
          : language === 'am'
          ? 'ይቅርታ፣ ስህተት ተፈጥሯል። እባክዎ ቆይተው ይሞክሩ።'
          : 'Dhiifama, dogoggora dhufeera. Eegaa irra deebi\'i yaali.',
        error: true
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="bg-ercs-red text-white px-6 py-4 rounded-t-lg">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🤖</span>
            <span>Kirub AI Assistant</span>
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {language === 'en'
              ? 'Ask me anything about ERCS, registration, activities, training, and more!'
              : language === 'am'
              ? 'ስለ ERCS፣ መመዝግብ፣ ስራዎች፣ ስልጠና እና ሌሎችም ማንኛውንም ይጠይቁኝ!'
              : 'ERCS, galmeessuu, hojiiwwan, qormaata fi kan biroo hunda gaafadhuu!'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-ercs-red text-white'
                    : message.error
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Ask Kirub a question...'
                  : language === 'am'
                  ? 'ከKirub ጥያቄ ይጠይቁ...'
                  : 'Gaaffii Kirub irratti gaafadhuu...'
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ercs-red"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-ercs-red text-white rounded-lg hover:bg-ercs-dark-red disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

