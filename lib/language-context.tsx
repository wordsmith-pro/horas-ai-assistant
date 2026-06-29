"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

type Language = "ar" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const translations = {
  // Headers & Navigation
  "nav.amun": { ar: "آمون", en: "AMUN" },
  "nav.egyptian-ai": { ar: "مساعدك الذكي المصري", en: "Egyptian AI Assistant" },
  
  // Welcome Screen
  "welcome.hello": { ar: "مرحباً،", en: "Hello," },
  "welcome.name-placeholder": { ar: "أنا آمون", en: "I'm AMUN" },
  "welcome.description": { ar: "مساعدك الذكي المصري - قادر على توليد النصوص والصور والفيديوهات والموسيقى.\n\nYour Egyptian AI Assistant — capable of text, image, video, and music generation.", en: "Your Egyptian AI Assistant — capable of text, image, video, and music generation." },
  
  // Chat Modes
  "mode.chat": { ar: "دردشة", en: "Chat" },
  "mode.image": { ar: "صور", en: "Images" },
  "mode.video": { ar: "فيديو", en: "Video" },
  "mode.music": { ar: "موسيقى", en: "Music" },
  
  // Input Placeholders
  "input.chat": { ar: "اسأل آمون أي شيء...", en: "Ask AMUN anything..." },
  "input.image": { ar: "صف الصورة التي تريدها...", en: "Describe the image you want..." },
  "input.video": { ar: "صف الفيديو...", en: "Describe the video..." },
  "input.music": { ar: "صف الأغنية أو الموسيقى...", en: "Describe the music or song..." },
  
  // Buttons & Actions
  "action.send": { ar: "إرسال", en: "Send" },
  "action.language": { ar: "اللغة", en: "Language" },
  "action.more": { ar: "المزيد", en: "More" },
  
  // Sidebar
  "sidebar.new-chat": { ar: "دردشة جديدة", en: "New Chat" },
  "sidebar.history": { ar: "السجل", en: "History" },
  "sidebar.settings": { ar: "الإعدادات", en: "Settings" },
  "sidebar.logout": { ar: "تسجيل الخروج", en: "Sign Out" },
  "sidebar.hello": { ar: "مرحباً", en: "Hello" },
  
  // Messages
  "message.error": { ar: "حدث خطأ، يرجى المحاولة مرة أخرى", en: "An error occurred, please try again" },
  "message.loading": { ar: "جاري المعالجة...", en: "Processing..." },
  "message.disclaimer": { ar: "آمون قد تخطئ. تحقق دائماً من المعلومات المهمة.", en: "AMUN AI can make mistakes. Always verify important information." },
  
  // Language Names
  "lang.arabic": { ar: "العربية", en: "Arabic" },
  "lang.english": { ar: "English", en: "English" },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar")

  const t = (key: string): string => {
    const parts = key.split(".") as [string, string]
    const section = translations[key as keyof typeof translations] as any
    return section?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
