'use client'

import { useLanguage } from '../hooks/useLanguage'

export default function LanguageSwitcher() {
  const { language, languages, changeLanguage, t } = useLanguage()

  return (
    <div className="flex items-center space-x-2 text-xs">
      <label className="text-blue-50 hidden sm:block">{t('languagesNote')}</label>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-white/10 text-white border border-white/30 rounded px-2 py-1 text-xs focus:outline-none"
      >
        {Object.entries(languages).map(([code, info]) => (
          <option key={code} value={code} className="text-gray-900">
            {info.label}
          </option>
        ))}
      </select>
    </div>
  )
}

