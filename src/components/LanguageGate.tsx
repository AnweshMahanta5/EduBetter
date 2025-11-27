
import { useTranslation } from 'react-i18next'
import { rtlLangs, FONT_MAP } from '../i18n/setup'

const LANGS = [
  { code:'en', label:'English' },
  { code:'hi', label:'हिन्दी' },
  { code:'sat', label:'ᱥᱟᱱᱛᱟᱲᱤ (Santali)' },
  { code:'hoc', label:'𑣁𑣂 (Ho)' }
]

export default function LanguageGate({ onDone }: { onDone: () => void }){
  const { t, i18n } = useTranslation()

  function pick(code:string){
    i18n.changeLanguage(code)
    const isRTL = rtlLangs.includes(code)
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.style.fontFamily = (FONT_MAP[code]||FONT_MAP.default).join(',')
    onDone()
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">{t('choose_language_title')}</h1>
      <p className="opacity-70">{t('choose_language_sub')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
        {LANGS.map(l => (
          <button key={l.code}
            onClick={() => pick(l.code)}
            className="rounded-2xl border p-4 text-lg bg-white hover:shadow">
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={() => pick('en')} className="underline text-sm">
        {t('skip_for_now')}
      </button>
    </div>
  )
}
