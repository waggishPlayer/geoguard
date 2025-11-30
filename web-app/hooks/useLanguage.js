 'use client'
 
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const LANGUAGES = {
  en: { label: 'English' },
  hi: { label: 'हिन्दी' },
  ta: { label: 'தமிழ்' },
  other: { label: 'अन्य भारतीय / Other Indian' },
}

const DICTIONARY = {
  en: {
    navTitle: 'Ministry of Mines and Safety (Smart India Hackathon 2025)',
    dashboard: 'Dashboard',
    tasks: 'My Tasks',
    complaints: 'Complaints',
    messages: 'Messages',
    sensors: 'Sensors',
    slopes: 'Slopes',
    alerts: 'Alerts',
    ml: 'ML Predictions',
    uploads: 'Upload Data',
    admin: 'Admin Panel',
    govt: 'Government Advisories',
    profile: 'Profile',
    languagesNote: 'Indian languages supported',
  },
  hi: {
    navTitle: 'खनन एवं सुरक्षा मंत्रालय (स्मार्ट इंडिया हैकथॉन 2025)',
    dashboard: 'डैशबोर्ड',
    tasks: 'मेरे कार्य',
    complaints: 'शिकायतें',
    messages: 'संदेश',
    sensors: 'सेंसर',
    slopes: 'ढलानें',
    alerts: 'चेतावनियाँ',
    ml: 'एमएल भविष्यवाणियाँ',
    uploads: 'डाटा अपलोड करें',
    admin: 'प्रशासन पैनल',
    govt: 'सरकारी परामर्श',
    profile: 'प्रोफ़ाइल',
    languagesNote: 'भारतीय भाषाओं को समर्थन',
  },
  ta: {
    navTitle: 'சுரங்க மற்றும் பாதுகாப்பு அமைச்சகம் (ஸ்மார்ட் இந்தியா ஹாக்கத்தான் 2025)',
    dashboard: 'டாஷ்போர்டு',
    tasks: 'எனது பணிகள்',
    complaints: 'புகார்கள்',
    messages: 'செய்திகள்',
    sensors: 'சென்சார்கள்',
    slopes: 'சரிவுகள்',
    alerts: 'எச்சரிக்கைகள்',
    ml: 'எம்.எல். கணிப்புகள்',
    uploads: 'தரவு பதிவேற்றம்',
    admin: 'நிர்வாகம்',
    govt: 'அரசு அறிவுறுத்தல்கள்',
    profile: 'சுயவிவரம்',
    languagesNote: 'இந்திய மொழிகளுக்கு ஆதரவு',
  },
  other: {
    navTitle: 'भारत की सभी मान्य भाषाएँ (स्मार्ट इंडिया हॅकथॉन 2025)',
    dashboard: 'डैशबोर्ड',
    tasks: 'मेरे कार्य',
    complaints: 'शिकायतें',
    messages: 'संदेश',
    sensors: 'सेंसर',
    slopes: 'ढलानें',
    alerts: 'चेतावनियाँ',
    ml: 'एमएल भविष्यवाणियाँ',
    uploads: 'डाटा अपलोड',
    admin: 'एडमिन',
    govt: 'सरकारी परामर्श',
    profile: 'प्रोफ़ाइल',
    languagesNote: 'केवल भारतीय भाषाएँ',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('appLanguage')
    if (stored && LANGUAGES[stored]) {
      setLanguage(stored)
    }
  }, [])

  const changeLanguage = (value) => {
    setLanguage(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', value)
    }
  }

  const value = useMemo(
    () => ({
      language,
      languages: LANGUAGES,
      t: (key) => DICTIONARY[language]?.[key] || DICTIONARY.en[key] || key,
      changeLanguage,
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

