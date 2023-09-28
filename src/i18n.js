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
    "Featured": "Featured",
    "View": "View",
    "Browse tools": "Browse tools",
    "Search by title or keyword": "Search by title or keyword",
    "Filter topics": "Filter by topic",
    "Clear all filters": "Clear all filters",
    "Showing": "Showing",
    "Tools": "tools",
    "Previous": "Previous",
    "Next": "Next",
  },
  'es': {
    "Featured tools": "Herramientas destacadas",
    "Featured": "Destacado",
    "View": "Ver",
    "Browse tools": "Navega por las herramientas",
    "Search by title or keyword": "Búsqueda por título o palabra clave",
    "Filter topics": "Filtrar por tema",
    "Clear all filters": "Borrar todos los filtros",
    "Showing": "Mostrando",
    "Tools": "herramientas",
    "Previous": "Anterior",
    "Next": "Próximo",
  },
  'zh': {
    "Featured tools": "精选工具",
    "Featured": "精选",
    "View": "查看",
    "Browse tools": "浏览工具",
    "Search by title or keyword": "按标题或关键字搜索",
    "Filter topics": "按主题筛选",
    "Clear all filters": "清除所有筛选条件",
    "Showing": "显示",
    "Tools": "工具",
    "Previous": "以前",
    "Next": "下一步",
  },
  'ar': {
    "Featured tools": "أدوات مميزة",
    "Featured": "متميز",
    "View": "عرض",
    "Browse tools": "أدوات التصفح",
    "Search by title or keyword": "البحث حسب العنوان أو الكلمة الرئيسية",
    "Filter topics": "الفلترة حسب الموضوع",
    "Clear all filters": "مسح جميع الفلاتر",
    "Showing": "عرض",
    "Tools": "أدوات",
    "Previous": "السابق",
    "Next": "التالي",
  },
  'ht': {
    "Featured tools": "Zouti Spesyal",
    "Featured": "Anons Spesyal",
    "View": "View",
    "Browse tools": "Browse zouti",
    "Search by title or keyword": "Rechèch pa tit oswa mo kle",
    "Filter topics": "Filtre sijè",
    "Clear all filters": "Klè tout filtè",
    "Showing": "Montre",
    "Tools": "Zouti",
    "Previous": "Anvan",
    "Next": "Pwochen",
  },
  'fr': {
    "Featured tools": "Outils en vedette",
    "Featured": "En vedette",
    "View": "Afficher",
    "Browse tools": "Parcourir les outils",
    "Search by title or keyword": "Recherche par titre ou mot-clé",
    "Filter topics": "Filtrer les sujets",
    "Clear all filters": "Effacer tous les filtres",
    "Showing": "Montrant",
    "Tools": "Outils",
    "Previous": "Précédent",
    "Next": "Suivant",
  },
  'sw': {
    "Featured tools": "Zana zilizoangaziwa",
    "Featured": "Matukio",
    "View": "Mtazamo",
    "Browse tools": "Vinjari zana",
    "Search by title or keyword": "Tafuta kwa kichwa au neno kuu",
    "Filter topics": "Mada ya chujio",
    "Clear all filters": "Futa vichungi vyote",
    "Showing": "Kuonesha",
    "Tools": "Zana",
    "Previous": "Iliyotangulia",
    "Next": "Ifuatayo",
  },
  'pt': {
    "Featured tools": "Ferramentas em destaque",
    "Featured": "Em destaque",
    "View": "Visualizar",
    "Browse tools": "Ferramentas de navegação",
    "Search by title or keyword": "Pesquise por título ou palavra-chave",
    "Filter topics": "Filtrar tópicos",
    "Clear all filters": "Limpar todos os filtros",
    "Showing": "Mostrando",
    "Tools": "Ferramentas",
    "Previous": "Anterior",
    "Next": "Próximo",
  },
  'ru': {
    "Featured tools": "Популярные инструменты",
    "Featured": "Избранное",
    "View": "Вид",
    "Browse tools": "Просмотрите инструменты",
    "Search by title or keyword": "Поиск по заголовку или ключевому слову",
    "Filter topics": "Фильтровать темы",
    "Clear all filters": "Очистить все фильтры",
    "Showing": "показывая",
    "Tools": "Инструменты",
    "Previous": "предыдущий",
    "Next": "Следующий",
  },
  'vi': {
    "Featured tools": "Các công cụ nổi bật",
    "Featured": "Nổi bật",
    "View": "Xem",
    "Browse tools": "Duyệt các công cụ",
    "Search by title or keyword": "Tìm kiếm theo tiêu đề hoặc từ khóa",
    "Filter topics": "Lọc chủ đề",
    "Clear all filters": "Xóa tất cả các bộ lọc",
    "Showing": "Đang hiển thị",
    "Tools": "Các công cụ",
    "Previous": "Trước",
    "Next": " Tiếp",
  },
};
