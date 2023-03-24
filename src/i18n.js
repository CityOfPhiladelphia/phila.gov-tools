import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    "en": '',
  },
});

function setI18nLanguage (lang) {
  i18n.locale = lang;
  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

export function loadLanguageAsync (lang) {
  i18n.setLocaleMessage(lang, languages[lang]);
  return setI18nLanguage(lang);
}

const languages = {
  'en': {
    "Featured tools": "Featured tools",
    "Featured":"Featured",
    "View":"View",
    "Browse tools":"Browse tools",
    "Search by title or keyword":"Search by title or keyword",
    "Filter topics": "Filter topics",
    "Clear all filters":"Clear all filters",
    "Showing":"Showing",
    "Tools":"tools",
    "Previous":"Previous",
    "Next": "Next",
  },
  'es': {
    "Featured tools": "Herramientas destacadas",
    "Featured":"Destacado",
    "View":"Ver",
    "Browse tools":"Navega por las herramientas",
    "Search by title or keyword":"Búsqueda por título o palabra clave",
    "Filter topics": "Filtrar temas",
    "Clear all filters":"Borrar todos los filtros",
    "Showing":"Mostrando",
    "Tools":"herramientas",
    "Previous":"Anterior",
    "Next": "Próximo",
  },
  'zh': {
    "Featured tools": "精选工具",
    "Featured":"精选",
    "View":"查看",
    "Browse tools":"浏览工具",
    "Search by title or keyword":"按标题或关键字搜索",
    "Filter topics": "筛选主题",
    "Clear all filters":"清除所有筛选条件",
    "Showing":"显示",
    "Tools":"工具",
    "Previous":"以前",
    "Next": "下一步",
  },
};