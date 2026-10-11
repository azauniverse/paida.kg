(function () {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const STORAGE_LISTINGS = 'paidaKgDemoListingsV1';
  const STORAGE_FAVORITES = 'paidaKgFavoritesV1';
  const API_BASE = String(window.PAIDA_API_BASE || '').trim().replace(/\/+$/, '');
  const API_ENABLED = /^https:\/\//i.test(API_BASE);
  let cloudListings = [];
  let lang = 'ky';
  let activeFilter = 'all';
  let favoritesOnly = false;
  let visibleLimit = 8;
  let selectedDetailId = null;
  let toastTimer = null;

  const copy = {
    ky: {
      topline: 'Кыргызстан боюнча пайдалуу сунуштар — бир жерден', freeSearch: 'Издөө акысыз', chooseRegion: 'Аймакты тандаңыз', allKyrgyzstan: 'Бүт Кыргызстан', navOffers: 'Сунуштар', navCategories: 'Категориялар', navHow: 'Кантип иштейт?', postAd: 'Жарыя кошуу',
      heroEyebrow: 'Жаңыча үнөмдөөнүн жолу', heroTitle: 'Керектүүңдү тап.<br><span>Пайданы өткөрбө.</span>', heroDescription: 'Товарлар, пайдалуу сунуштар, жумуш жана кызматтар. Кыргызстан боюнча бир жерден изде.', searchLabel: 'Эмне издеп жатасыз?', searchPlaceholder: 'Эмне издеп жатасыз? Мисалы, блендер...', searchButton: 'Издөө', popular: 'Популярдуу:', popularBlender: 'Блендер', popularJobs: 'Жумуш', popularServices: 'Усталар', todayPick: 'БҮГҮНКҮ ТАНДОО', visualTitle: 'Пайдалуу сунуштарды тап', visualSubtitle: 'Күн сайын жаңы мүмкүнчүлүктөр', floatSearchTitle: 'Бир издөө', floatSearchText: 'Көп мүмкүнчүлүк', floatSimpleTitle: 'Оңой жана тез', floatSimpleText: 'KG · RU', benefitOne: 'Бүт Кыргызстан боюнча', benefitTwo: 'Кыргызча жана орусча', benefitThree: 'Жеңил жана түшүнүктүү',
      browseLabel: 'ИЗДӨӨНҮ БАШТА', categoriesTitle: 'Эмне керек болуп жатат?', allOffers: 'Бардык сунуштар', catProducts: 'Товарлар', catProductsHint: 'Сатып алуу жана сатуу', catDeals: 'Арзандатуулар', catDealsHint: 'Пайдалуу баалар', catJobs: 'Жумуш', catJobsHint: 'Жаңы мүмкүнчүлүктөр', catServices: 'Кызматтар', catServicesHint: 'Адистерди табыңыз',
      freshLabel: 'ЖАҢЫ МҮМКҮНЧҮЛҮКТӨР', offersTitle: 'Пайдалуу сунуштар', offersSubtitle: 'Өзүңүзгө керектүүсүн табыңыз же бааларды салыштырыңыз.', favorites: 'Сакталгандар', demoNotice: 'Бул версияда көрсөтүлгөн жарыялар — демонстрация үчүн. Азырынча чыныгы сатуучу же жумуш берүүчү менен байланышпайт.', filterAll: 'Баары', filterDeals: 'Арзандатуулар', filterProducts: 'Товарлар', filterJobs: 'Жумуш', filterServices: 'Кызматтар', sortLabel: 'Иреттөө:', sortNewest: 'Жаңылары', sortLow: 'Баасы төмөндөн', sortHigh: 'Баасы жогорудан', resultWord: 'сунуш', emptyTitle: 'Азырынча эч нерсе табылган жок', emptyText: 'Издөө сөзүн же аймакты өзгөртүп көрүңүз.', resetButton: 'Чыпкаларды тазалоо', showMore: 'Дагы көрүү', showLess: 'Аз көрсөтүү',
      regionsKicker: 'ӨЗҮҢҮЗГӨ ЖАКЫН', regionsTitle: 'Кыргызстандын кайсы жеринде болбоңуз', regionsText: 'Аймагыңызды тандап, өзүңүзгө жакын сунуштарды караңыз.', howKicker: 'ЖӨНӨКӨЙ БАШТАЛЫШ', howTitle: 'Үч кадам. Керектүү нерсе табылды.', stepOneTitle: 'Издеңиз', stepOneText: 'Керектүү товарды, сунушту же кызматты жазыңыз.', stepTwoTitle: 'Салыштырыңыз', stepTwoText: 'Аймак жана категория боюнча ылайыктуу варианттарды табыңыз.', stepThreeTitle: 'Сактаңыз', stepThreeText: 'Жаккан сунуштарды сактап коюңуз. Бул демо версияда алар түзмөгүңүздө сакталат.', ctaKicker: 'ӨЗҮҢҮЗДҮН СУНУШУҢУЗ БАРБЫ?', ctaTitle: 'Башкаларга да пайдалуу болсун.', ctaText: 'Товар, жумуш же кызмат жөнүндө жарыя кошуп көрүңүз. Демо режимде ал ушул түзмөктө гана сакталат.', ctaTagOne: 'Товарлар', ctaTagTwo: 'Жумуш', ctaTagThree: 'Кызматтар',
      footerDescription: 'Кыргызстан үчүн пайдалуу мүмкүнчүлүктөрдү бир жерге чогултуучу платформа.', footerPlatform: 'Платформа', footerImportant: 'Маанилүү', footerSafety: 'Коопсуз колдонуу', footerAbout: 'Долбоор жөнүндө', footerDemo: 'Азыркы версия — прототип. Чыныгы жарыяларды жарыялоо үчүн сервер, маалымат базасы жана модерация керек.', footerTagline: 'Тап. Салыштыр. Үнөмдө.', prototypeLabel: 'ДЕМО ВЕРСИЯ', formKicker: 'ЖАҢЫ ЖАРЫЯ', formTitle: 'Жарыя кошуу', formDescription: 'Бул прототипте жарыя ушул түзмөктө гана сакталат. Кийин сервер кошулганда, жалпыга жарыялоо мүмкүн болот.', formName: 'Жарыянын аталышы', formNamePlaceholder: 'Мисалы: Блендер сатылат', formCategory: 'Категория', formPrice: 'Баасы (сом)', formRegion: 'Шаар же аймак', formDescriptionLabel: 'Кыскача маалымат', formDescriptionPlaceholder: 'Жарыя жөнүндө кыскача жазыңыз...', formNotice: 'Телефон номери же жеке маалымат жазбаңыз. Бул демо маалымат башка адамдарга көрүнбөйт.', formSubmit: 'Демо жарыяны сактоо', demoBadge: 'ДЕМО', detailNote: 'Бул мисал жарыясы. Ал чыныгы сунуш эмес жана сатуучу менен байланышпайт.', saveOffer: 'Сактоо', savedOffer: 'Сакталды', removedFavorite: 'Сакталгандардан алынды', savedToast: 'Жарыя ушул түзмөктө сакталды. Башкаларга көрсөтүү үчүн сервер керек.', requiredFields: 'Милдеттүү талааларды толтуруңуз.', searchNoResults: 'Бул издөө боюнча сунуш табылган жок.', favoritesEmpty: 'Азырынча сакталган сунуш жок.', defaultLocation: 'Кыргызстан', priceOnRequest: 'Баасы сүйлөшүлөт', perShift: '/ смена', from: 'баштап',
      typeLabels: {deal:'Арзандатуу',product:'Товар',job:'Жумуш',service:'Кызмат'}, cardTypes: {deal:'АРЗАНДАТУУ',product:'ТОВАР',job:'ЖУМУШ',service:'КЫЗМАТ'}, publishedBadge:'ЖАРЫЯЛАНДЫ', publishedMeta:'Жарыяланды', exampleMeta:'Мисал'
    },
    ru: {
      topline: 'Полезные предложения по всему Кыргызстану — в одном месте', freeSearch: 'Поиск бесплатный', chooseRegion: 'Выберите регион', allKyrgyzstan: 'Весь Кыргызстан', navOffers: 'Предложения', navCategories: 'Категории', navHow: 'Как это работает?', postAd: 'Добавить объявление',
      heroEyebrow: 'Новый способ экономить', heroTitle: 'Найдите нужное.<br><span>Не упускайте выгоду.</span>', heroDescription: 'Товары, выгодные предложения, работа и услуги. Ищите по всему Кыргызстану в одном месте.', searchLabel: 'Что вы ищете?', searchPlaceholder: 'Что вы ищете? Например, блендер...', searchButton: 'Найти', popular: 'Популярное:', popularBlender: 'Блендер', popularJobs: 'Работа', popularServices: 'Мастера', todayPick: 'ВЫБОР ДНЯ', visualTitle: 'Находите полезные предложения', visualSubtitle: 'Новые возможности каждый день', floatSearchTitle: 'Один поиск', floatSearchText: 'Много возможностей', floatSimpleTitle: 'Просто и быстро', floatSimpleText: 'KG · RU', benefitOne: 'По всему Кыргызстану', benefitTwo: 'Кыргызский и русский', benefitThree: 'Просто и понятно',
      browseLabel: 'НАЧНИТЕ ПОИСК', categoriesTitle: 'Что вам нужно?', allOffers: 'Все предложения', catProducts: 'Товары', catProductsHint: 'Покупка и продажа', catDeals: 'Скидки', catDealsHint: 'Выгодные цены', catJobs: 'Работа', catJobsHint: 'Новые возможности', catServices: 'Услуги', catServicesHint: 'Найдите специалистов',
      freshLabel: 'НОВЫЕ ВОЗМОЖНОСТИ', offersTitle: 'Полезные предложения', offersSubtitle: 'Находите нужное или сравнивайте цены.', favorites: 'Сохранённое', demoNotice: 'Объявления в этой версии демонстрационные. Сейчас они не связаны с реальными продавцами или работодателями.', filterAll: 'Все', filterDeals: 'Скидки', filterProducts: 'Товары', filterJobs: 'Работа', filterServices: 'Услуги', sortLabel: 'Сортировка:', sortNewest: 'Сначала новые', sortLow: 'Сначала дешевле', sortHigh: 'Сначала дороже', resultWord: 'предложений', emptyTitle: 'Пока ничего не найдено', emptyText: 'Попробуйте изменить запрос или регион.', resetButton: 'Сбросить фильтры', showMore: 'Показать ещё', showLess: 'Свернуть',
      regionsKicker: 'РЯДОМ С ВАМИ', regionsTitle: 'Где бы вы ни находились в Кыргызстане', regionsText: 'Выберите регион и просмотрите предложения поблизости.', howKicker: 'ПРОСТОЕ НАЧАЛО', howTitle: 'Три шага. Нужное найдено.', stepOneTitle: 'Ищите', stepOneText: 'Введите товар, предложение или услугу, которая вам нужна.', stepTwoTitle: 'Сравнивайте', stepTwoText: 'Находите подходящие варианты по региону и категории.', stepThreeTitle: 'Сохраняйте', stepThreeText: 'Добавляйте понравившиеся предложения в избранное. В демо-версии они хранятся на вашем устройстве.', ctaKicker: 'ЕСТЬ ЧТО ПРЕДЛОЖИТЬ?', ctaTitle: 'Пусть это пригодится другим.', ctaText: 'Попробуйте добавить товар, работу или услугу. В демо-режиме объявление сохранится только на этом устройстве.', ctaTagOne: 'Товары', ctaTagTwo: 'Работа', ctaTagThree: 'Услуги',
      footerDescription: 'Платформа полезных возможностей для жителей Кыргызстана.', footerPlatform: 'Платформа', footerImportant: 'Важно', footerSafety: 'Безопасное использование', footerAbout: 'О проекте', footerDemo: 'Текущая версия — прототип. Для публикации реальных объявлений нужны сервер, база данных и модерация.', footerTagline: 'Найдите. Сравните. Сэкономьте.', prototypeLabel: 'ДЕМО-ВЕРСИЯ', formKicker: 'НОВОЕ ОБЪЯВЛЕНИЕ', formTitle: 'Добавить объявление', formDescription: 'В этом прототипе объявление сохраняется только на этом устройстве. После подключения сервера его можно будет публиковать для всех.', formName: 'Название объявления', formNamePlaceholder: 'Например: Продаю блендер', formCategory: 'Категория', formPrice: 'Цена (сом)', formRegion: 'Город или регион', formDescriptionLabel: 'Краткое описание', formDescriptionPlaceholder: 'Кратко опишите предложение...', formNotice: 'Не указывайте номер телефона или личные данные. Это демо-объявление не будет видно другим людям.', formSubmit: 'Сохранить демо-объявление', demoBadge: 'ДЕМО', detailNote: 'Это пример объявления. Оно не является реальным предложением и не связано с продавцом.', saveOffer: 'Сохранить', savedOffer: 'Сохранено', removedFavorite: 'Удалено из сохранённого', savedToast: 'Объявление сохранено на этом устройстве. Чтобы показывать его другим, нужен сервер.', requiredFields: 'Заполните обязательные поля.', searchNoResults: 'По этому запросу предложений не найдено.', favoritesEmpty: 'Пока нет сохранённых предложений.', defaultLocation: 'Кыргызстан', priceOnRequest: 'Цена договорная', perShift: '/ смена', from: 'от',
      typeLabels: {deal:'Скидка',product:'Товар',job:'Работа',service:'Услуга'}, cardTypes: {deal:'СКИДКА',product:'ТОВАР',job:'РАБОТА',service:'УСЛУГА'}, publishedBadge:'ОПУБЛИКОВАНО', publishedMeta:'Опубликовано', exampleMeta:'Пример'
    }
  };

  const demoListings = [
    {id:'demo-1',type:'deal',title:{ky:'Ашкана үчүн блендер',ru:'Блендер для кухни'},description:{ky:'Үйдө күнүмдүк колдонууга ылайыктуу мисал сунуш.',ru:'Пример предложения для повседневного использования дома.'},price:1800,unit:{ky:'бир даана',ru:'за штуку'},city:'Бишкек',region:'Бишкек',emoji:'🥤',art:'art-deal',date:8},
    {id:'demo-2',type:'product',title:{ky:'Үй үчүн идиш-аяк топтому',ru:'Набор посуды для дома'},description:{ky:'Үй-тиричилик товарлары боюнча демо жарыя.',ru:'Демо-объявление о товарах для дома.'},price:2400,unit:{ky:'топтом',ru:'за набор'},city:'Ош',region:'Ош',emoji:'🍽️',art:'art-product',date:7},
    {id:'demo-3',type:'job',title:{ky:'Күнүмдүк төлөнүүчү жумуш',ru:'Работа с ежедневной оплатой'},description:{ky:'Мисал: жумуш убактысы жана төлөмү алдын ала такталат.',ru:'Пример: график и размер оплаты согласуются заранее.'},price:2500,unit:{ky:'смена',ru:'смена'},city:'Токмок',region:'Чүй',emoji:'🧰',art:'art-job',date:6},
    {id:'demo-4',type:'service',title:{ky:'Сантехник чакыруу',ru:'Вызов сантехника'},description:{ky:'Үйдөгү майда оңдоо үчүн мисал кызмат.',ru:'Пример услуги для небольшого ремонта дома.'},price:1000,unit:{ky:'баштап',ru:'от'},city:'Жалал-Абад',region:'Жалал-Абад',emoji:'🔧',art:'art-service',date:5},
    {id:'demo-5',type:'product',title:{ky:'Балдар велосипеди',ru:'Детский велосипед'},description:{ky:'Балдар буюмдары бөлүмүнүн демонстрациялык карточкасы.',ru:'Демонстрационная карточка раздела детских товаров.'},price:3200,unit:{ky:'бир даана',ru:'за штуку'},city:'Кара-Балта',region:'Чүй',emoji:'🚲',art:'art-product',date:4},
    {id:'demo-6',type:'deal',title:{ky:'Чакан ашкана техникасы',ru:'Малая кухонная техника'},description:{ky:'Арзандатуу бөлүмүн көрсөтүү үчүн кошулган мисал.',ru:'Пример карточки для раздела скидок.'},price:1450,unit:{ky:'бир даана',ru:'за штуку'},city:'Каракол',region:'Ысык-Көл',emoji:'🍳',art:'art-deal',date:3},
    {id:'demo-7',type:'service',title:{ky:'Үйгө жеткирүү кызматы',ru:'Доставка на дом'},description:{ky:'Жергиликтүү кызматтын демо-карточкасы. Реалдуу заказ кабыл алынбайт.',ru:'Демо-карточка местной услуги. Реальные заказы не принимаются.'},price:250,unit:{ky:'баштап',ru:'от'},city:'Нарын',region:'Нарын',emoji:'🛵',art:'art-service',date:2},
    {id:'demo-8',type:'job',title:{ky:'Дүкөнгө сатуучу керек',ru:'Требуется продавец в магазин'},description:{ky:'Мисал вакансия. Чыныгы жумуш берүүчү менен байланышпайт.',ru:'Пример вакансии. Не связана с реальным работодателем.'},price:1800,unit:{ky:'смена',ru:'смена'},city:'Баткен',region:'Баткен',emoji:'🧑‍💼',art:'art-job',date:1},
    {id:'demo-9',type:'product',title:{ky:'Күнүмдүк колдонуу үчүн рюкзак',ru:'Рюкзак на каждый день'},description:{ky:'Товар карточкасынын демонстрациялык үлгүсү.',ru:'Демонстрационный пример карточки товара.'},price:1600,unit:{ky:'бир даана',ru:'за штуку'},city:'Ош',region:'Ош',emoji:'🎒',art:'art-product',date:0},
    {id:'demo-10',type:'service',title:{ky:'Компьютерди оңдоо',ru:'Ремонт компьютеров'},description:{ky:'Компьютердик жардам боюнча демо-кызмат.',ru:'Демо-услуга по компьютерной помощи.'},price:800,unit:{ky:'баштап',ru:'от'},city:'Бишкек',region:'Бишкек',emoji:'💻',art:'art-service',date:-1}
  ];

  function safeLoad(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (_) { return fallback; } }
  let userListings = safeLoad(STORAGE_LISTINGS, []);
  if (!Array.isArray(userListings)) userListings = [];
  let favorites = new Set(safeLoad(STORAGE_FAVORITES, []));
  if (!Array.isArray(Array.from(favorites))) favorites = new Set();
  function saveFavorites() { try { localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(Array.from(favorites))); } catch (_) {} }
  function saveListings() { try { localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(userListings)); } catch (_) {} }
  function t(key) {
    if (API_ENABLED) {
      const liveCopy = {
        ky: {
          demoNotice: 'ДЕМО деп белгиленген карточкалар гана мисал. Жарыяланган коомдук сунуштар серверден жүктөлөт.',
          prototypeLabel: 'ПИЛОТТУК ВЕРСИЯ',
          formDescription: 'Жарыя серверге жөнөтүлөт. Модерациядан өткөндөн кийин жалпы тизмеде көрүнөт.',
          formNotice: 'Жарыя текшерүүдөн өткөндөн кийин гана башкаларга көрүнөт. Телефон же жеке маалымат жазбаңыз.',
          formSubmit: 'Текшерүүгө жөнөтүү',
          savedToast: 'Жарыя текшерүүгө жөнөтүлдү. Жактырылгандан кийин сайтта көрүнөт.',
          footerDemo: 'Коомдук жарыялар серверде сакталат. Жарыялар текшерүүдөн өткөндөн кийин гана көрсөтүлөт.',
          ctaText: 'Товар, жумуш же кызмат боюнча жарыя жөнөтүңүз. Жарыя модерациядан өткөндөн кийин жалпыга чыгат.',
          stepThreeText: 'Жаккан сунуштарды сактап коюңуз. Сакталган тизмеңиз ушул түзмөктө калат.'
        },
        ru: {
          demoNotice: 'Только карточки с пометкой ДЕМО являются примерами. Опубликованные объявления загружаются с сервера.',
          prototypeLabel: 'ПИЛОТНАЯ ВЕРСИЯ',
          formDescription: 'Объявление отправится на сервер и появится в общей ленте после модерации.',
          formNotice: 'Объявление станет видно другим только после проверки. Не указывайте телефон и личные данные.',
          formSubmit: 'Отправить на проверку',
          savedToast: 'Объявление отправлено на проверку. Оно появится на сайте после одобрения.',
          footerDemo: 'Публичные объявления хранятся на сервере. Они показываются только после проверки.',
          ctaText: 'Отправьте объявление о товаре, работе или услуге. Оно появится после модерации.',
          stepThreeText: 'Сохраняйте понравившиеся предложения. Список избранного хранится на этом устройстве.'
        }
      };
      if (liveCopy[lang] && liveCopy[lang][key]) return liveCopy[lang][key];
    }
    return copy[lang][key] ?? copy.ky[key] ?? key;
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function translatePage() {
    document.documentElement.lang = lang;
    document.title = lang === 'ky' ? 'PAIDA KG — Пайдалуу нерсенин баары' : 'PAIDA KG — Полезные возможности в одном месте';
    $$('[data-i18n]').forEach(el => { const key = el.dataset.i18n; if (t(key) != null) el.innerHTML = t(key); });
    $$('[data-i18n-placeholder]').forEach(el => { const key = el.dataset.i18nPlaceholder; if (t(key) != null) el.placeholder = t(key); });
    $$('[data-lang]').forEach(btn => { const isActive = btn.dataset.lang === lang; btn.classList.toggle('active', isActive); btn.setAttribute('aria-pressed', String(isActive)); });
    $('#regionSelect').setAttribute('aria-label', t('chooseRegion'));
    if (API_ENABLED) {
      const formDescription = $('[data-i18n="formDescription"]');
      const formNotice = $('[data-i18n="formNotice"]');
      const formSubmit = $('#listingForm button[type="submit"] [data-i18n="formSubmit"]');
      const footerDemo = $('[data-i18n="footerDemo"]');
      const ctaText = $('[data-i18n="ctaText"]');
      if (formDescription) formDescription.textContent = lang === 'ky'
        ? 'Жарыя серверге жөнөтүлөт. Модерациядан өткөндөн кийин жалпыга көрүнөт.'
        : 'Объявление отправится на сервер и станет общедоступным после модерации.';
      if (formNotice) formNotice.textContent = lang === 'ky'
        ? 'Телефон же жеке маалыматты жарыялабаңыз. Жарыя текшерүүдөн өткөнгө чейин көрүнбөйт.'
        : 'Не публикуйте телефон и личные данные. Объявление не будет видно до проверки.';
      if (formSubmit) formSubmit.textContent = lang === 'ky' ? 'Текшерүүгө жөнөтүү' : 'Отправить на проверку';
      if (footerDemo) footerDemo.textContent = lang === 'ky'
        ? 'Жаңы жарыялар модерациядан кийин жарыяланат. «ДЕМО» белгилүү карточкалар мисал үчүн гана көрсөтүлгөн.'
        : 'Новые объявления публикуются после модерации. Карточки с пометкой «ДЕМО» приведены только для примера.';
      if (ctaText) ctaText.textContent = lang === 'ky'
        ? 'Товар, жумуш же кызмат тууралуу жарыя кошуңуз. Жарыя текшерүүгө жөнөтүлөт.'
        : 'Добавьте объявление о товаре, работе или услуге. Оно будет отправлено на проверку.';
    }
    renderListings();
  }
  function getTitle(item) { return item.title && typeof item.title === 'object' ? (item.title[lang] || item.title.ky || '') : String(item.title || ''); }
  function getDescription(item) { return item.description && typeof item.description === 'object' ? (item.description[lang] || item.description.ky || '') : String(item.description || ''); }
  function getUnit(item) { return item.unit && typeof item.unit === 'object' ? (item.unit[lang] || item.unit.ky || '') : String(item.unit || ''); }
  function formatPrice(item) {
    const price = Number(item.price);
    if (!Number.isFinite(price) || price <= 0) return `<span class="listing-price">${esc(t('priceOnRequest'))}</span>`;
    const formatted = new Intl.NumberFormat(lang === 'ky' ? 'ru-RU' : 'ru-RU', {maximumFractionDigits:0}).format(price);
    const unit = getUnit(item);
    let unitDisplay = unit;
    if (unit === 'баштап' || unit === 'от') unitDisplay = t('from');
    if (unit === 'смена') unitDisplay = t('perShift');
    return `<span class="listing-price">${formatted} <small>сом ${unitDisplay && unitDisplay !== 'бир даана' && unitDisplay !== 'за штуку' && unitDisplay !== 'топтом' && unitDisplay !== 'за набор' ? esc(unitDisplay) : ''}</small></span>`;
  }
  function allListings() { return [...demoListings, ...(API_ENABLED ? [] : userListings), ...cloudListings]; }
  function currentRegion() { return $('#regionSelect').value || 'all'; }
  function filteredListings() {
    let items = allListings();
    if (activeFilter !== 'all') items = items.filter(item => item.type === activeFilter);
    const region = currentRegion();
    if (region !== 'all') items = items.filter(item => item.region === region || item.city === region);
    const query = ($('#searchInput').value || '').trim().toLocaleLowerCase();
    if (query) items = items.filter(item => [getTitle(item),getDescription(item),item.city,item.region,copy.ky.typeLabels[item.type],copy.ru.typeLabels[item.type]].join(' ').toLocaleLowerCase().includes(query));
    if (favoritesOnly) items = items.filter(item => favorites.has(item.id));
    const sort = $('#sortSelect').value;
    if (sort === 'low') items.sort((a,b) => (Number(a.price)||Number.MAX_SAFE_INTEGER) - (Number(b.price)||Number.MAX_SAFE_INTEGER));
    else if (sort === 'high') items.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    else items.sort((a,b) => (Number(b.date)||0) - (Number(a.date)||0));
    return items;
  }
  function listingCard(item) {
    const isSaved = favorites.has(item.id);
    const typeLabel = copy[lang].cardTypes[item.type] || copy.ky.cardTypes[item.type];
    const detailTitle = esc(getTitle(item));
    const detailDescription = esc(getDescription(item));
    const location = esc(item.city || item.region || t('defaultLocation'));
    const publishedBadge = item.isRemote ? `<span class="listing-type-pill published">${esc(t('publishedBadge'))}</span>` : `<span class="listing-type-pill demo">${esc(t('demoBadge'))}</span>`;
    const metaLabel = item.isRemote ? t('publishedMeta') : t('exampleMeta');
    return `<article class="listing-card" data-id="${esc(item.id)}" tabindex="0" role="button" aria-label="${detailTitle}">
      <div class="listing-art ${esc(item.art || ({deal:'art-deal',product:'art-product',job:'art-job',service:'art-service'}[item.type] || 'art-product'))}">
        <span class="listing-type-pill">${esc(typeLabel)}</span>${publishedBadge}<span class="listing-emoji" aria-hidden="true">${esc(item.emoji || '📌')}</span>
        <button type="button" class="favorite-btn ${isSaved?'saved':''}" data-favorite="${esc(item.id)}" aria-label="${isSaved ? esc(t('removedFavorite')) : esc(t('saveOffer'))}" aria-pressed="${isSaved}">${isSaved?'♥':'♡'}</button>
      </div>
      <div class="listing-body"><div class="listing-meta"><span class="listing-location"><span>⌖</span>${location}</span><span>${esc(metaLabel)}</span></div><h3>${detailTitle}</h3><p class="listing-card-description">${detailDescription}</p><div class="listing-price-row">${formatPrice(item)}<button class="listing-open" type="button" data-open-detail="${esc(item.id)}" aria-label="${lang==='ky'?'Көбүрөөк маалымат':'Подробнее'}">↗</button></div></div></article>`;
  }
  function renderListings() {
    const items = filteredListings();
    const shown = items.slice(0, visibleLimit);
    $('#listingGrid').innerHTML = shown.map(listingCard).join('');
    $('#resultCount').textContent = String(items.length);
    $('#favoriteCount').textContent = String(favorites.size);
    const region = currentRegion();
    $('#regionSummary').textContent = region === 'all' ? t('allKyrgyzstan') : region;
    $('#emptyState').classList.toggle('hidden', items.length !== 0);
    $('#listingGrid').classList.toggle('hidden', items.length === 0);
    $('#showAllButton').classList.toggle('hidden', items.length <= 8);
    $('#showAllButton span:first-child').textContent = visibleLimit >= items.length ? t('showLess') : t('showMore');
    $('#favoritesToggle').classList.toggle('active-filter', favoritesOnly);
    updateRegionButtons();
  }
  function updateRegionButtons() {
    const region = currentRegion();
    $$('.region-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.region === region));
  }
  function setRegion(region) { $('#regionSelect').value = region; renderListings(); }
  function setFilter(filter) {
    activeFilter = filter;
    favoritesOnly = false;
    visibleLimit = 8;
    $$('.filter-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
    renderListings();
    $('#offers').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showToast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3100);
  }
  function openModal(id) { const modal = $(id); modal.classList.remove('hidden'); document.body.style.overflow='hidden'; const focusable = $('input, select, textarea, button', modal); if (focusable) setTimeout(() => focusable.focus(), 30); }
  function closeModals() { $$('.modal-backdrop').forEach(m => m.classList.add('hidden')); document.body.style.overflow=''; }
  function toggleFavorite(id) {
    if (favorites.has(id)) { favorites.delete(id); showToast(t('removedFavorite')); }
    else { favorites.add(id); showToast(t('savedOffer')); }
    saveFavorites(); renderListings();
    if (selectedDetailId === id) updateDetailFavoriteButton();
  }
  function updateDetailFavoriteButton() {
    const btn = $('#detailSave'); const saved = favorites.has(selectedDetailId);
    btn.innerHTML = `${saved ? '♥' : '♡'} <span>${esc(t(saved ? 'savedOffer' : 'saveOffer'))}</span>`;
  }
  function openDetail(id) {
    const item = allListings().find(x => String(x.id) === String(id)); if (!item) return;
    selectedDetailId = id;
    $('#detailTitle').textContent = getTitle(item);
    $('#detailPrice').innerHTML = formatPrice(item);
    $('#detailLocation').textContent = `⌖ ${item.city || item.region || t('defaultLocation')} · ${item.isRemote ? t('publishedMeta') : t('exampleMeta')}`;
    $('#detailDescription').textContent = getDescription(item);
    $('#detailEmoji').textContent = item.emoji || '📌';
    $('#detailArt').className = `detail-art ${item.art || ''}`;
    const note = $('#detailInfoNote');
    note.classList.toggle('hidden', !!item.isRemote);
    $('#detailModal [data-i18n="demoBadge"]').textContent = item.isRemote ? t('publishedBadge') : t('demoBadge');
    updateDetailFavoriteButton();
    openModal('#detailModal');
  }
  function changeLanguage(nextLang) { if (!copy[nextLang] || lang === nextLang) return; lang = nextLang; translatePage(); }

  function mapCloudListing(row) {
    const type = ['deal','product','job','service'].includes(row.type) ? row.type : 'product';
    const id = String(row.id || '');
    return {
      id: `cloud-${id}`,
      cloudId: id,
      isRemote: true,
      type,
      title: { ky: String(row.title || ''), ru: String(row.title || '') },
      description: { ky: String(row.description || ''), ru: String(row.description || '') },
      price: row.price == null ? 0 : Number(row.price),
      unit: { ky: type === 'job' ? 'смена' : 'бир даана', ru: type === 'job' ? 'смена' : 'за штуку' },
      city: String(row.city || row.region || ''),
      region: String(row.region || row.city || ''),
      emoji: ({ deal:'🏷️', product:'📦', job:'💼', service:'🛠️' })[type],
      art: ({ deal:'art-deal', product:'art-product', job:'art-job', service:'art-service' })[type],
      date: row.created_at ? (Date.parse(row.created_at) || 0) : 0
    };
  }
  async function refreshCloudListings() {
    if (!API_ENABLED) return;
    try {
      const response = await fetch(`${API_BASE}/api/listings`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      cloudListings = Array.isArray(data.listings) ? data.listings.map(mapCloudListing) : [];
      renderListings();
    } catch (error) {
      console.warn('PAIDA KG could not load public listings:', error);
      showToast(lang === 'ky' ? 'Серверден жарыяларды алуу мүмкүн болбой жатат.' : 'Не удалось загрузить объявления с сервера.');
    }
  }

  // Language, filters and search
  $$('[data-lang]').forEach(btn => btn.addEventListener('click', () => changeLanguage(btn.dataset.lang)));
  $$('.filter-tab').forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  $$('.category-card').forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  $('#regionSelect').addEventListener('change', renderListings);
  $('#sortSelect').addEventListener('change', renderListings);
  $('#searchForm').addEventListener('submit', event => { event.preventDefault(); visibleLimit=8; favoritesOnly=false; renderListings(); $('#offers').scrollIntoView({behavior:'smooth',block:'start'}); });
  $$('[data-search-term]').forEach(btn => btn.addEventListener('click', () => { $('#searchInput').value = lang === 'ru' ? (btn.dataset.searchTermRu || btn.dataset.searchTerm) : btn.dataset.searchTerm; $('#searchForm').requestSubmit(); }));
  $('#resetFilters').addEventListener('click', () => { $('#searchInput').value=''; $('#regionSelect').value='all'; $('#sortSelect').value='newest'; activeFilter='all'; favoritesOnly=false; visibleLimit=8; $$('.filter-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter==='all')); renderListings(); });
  $('#showAllButton').addEventListener('click', () => { const total=filteredListings().length; visibleLimit = visibleLimit >= total ? 8 : total; renderListings(); });
  $('#favoritesToggle').addEventListener('click', () => { favoritesOnly=!favoritesOnly; visibleLimit=allListings().length; renderListings(); if (favoritesOnly && !filteredListings().length) showToast(t('favoritesEmpty')); });
  $$('.region-chip').forEach(btn => btn.addEventListener('click', () => setRegion(btn.dataset.region)));
  $('#listingGrid').addEventListener('click', event => {
    const favButton = event.target.closest('[data-favorite]');
    if (favButton) { event.stopPropagation(); toggleFavorite(favButton.dataset.favorite); return; }
    const detailButton = event.target.closest('[data-open-detail]');
    if (detailButton) { event.stopPropagation(); openDetail(detailButton.dataset.openDetail); return; }
    const card = event.target.closest('.listing-card'); if (card) openDetail(card.dataset.id);
  });
  $('#listingGrid').addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('listing-card')) { event.preventDefault(); openDetail(event.target.dataset.id); } });
  $('#detailSave').addEventListener('click', () => { if (selectedDetailId != null) toggleFavorite(selectedDetailId); });

  // Demo listing form
  $$('[data-open-create]').forEach(btn => btn.addEventListener('click', () => openModal('#listingModal')));
  $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModals));
  $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModals(); }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModals(); });
  $('#listingForm').addEventListener('submit', async event => {
    event.preventDefault();
    const title = $('#newTitle').value.trim();
    const priceRaw = $('#newPrice').value;
    const price = Number(priceRaw);
    const city = $('#newRegion').value;
    const type = $('#newCategory').value;
    const description = $('#newDescription').value.trim();
    if (!title || priceRaw === '' || !city || !type || !Number.isFinite(price) || price < 0) { showToast(t('requiredFields')); return; }
    const regionMap = {'Бишкек':'Бишкек','Ош':'Ош','Жалал-Абад':'Жалал-Абад','Ысык-Көл':'Ысык-Көл','Чүй':'Чүй','Нарын':'Нарын','Талас':'Талас','Баткен':'Баткен'};
    if (API_ENABLED) {
      const submitButton = $('#listingForm button[type="submit"]');
      submitButton.disabled = true;
      try {
        const response = await fetch(`${API_BASE}/api/listings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ title, type, price, city, region: regionMap[city] || city, description })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        closeModals(); $('#listingForm').reset();
        showToast(lang === 'ky'
          ? 'Жарыя текшерүүгө жөнөтүлдү. Жактырылгандан кийин сайтта көрүнөт.'
          : 'Объявление отправлено на проверку. Оно появится на сайте после одобрения.');
        $('#offers').scrollIntoView({behavior:'smooth',block:'start'});
      } catch (error) {
        console.error('PAIDA KG submit failed:', error);
        showToast(lang === 'ky' ? 'Жарыя жөнөтүлгөн жок. Интернетти жана сервер жөндөөлөрүн текшериңиз.' : 'Не удалось отправить объявление. Проверьте интернет и настройки сервера.');
      } finally {
        submitButton.disabled = false;
      }
      return;
    }
    const item = {id:`user-${Date.now()}`,type,title:{ky:title,ru:title},description:{ky:description || 'Демо жарыя.',ru:description || 'Демо-объявление.'},price,unit:{ky:'бир даана',ru:'за штуку'},city,region:regionMap[city] || city,emoji:({deal:'🏷️',product:'📦',job:'💼',service:'🛠️'})[type],art:({deal:'art-deal',product:'art-product',job:'art-job',service:'art-service'})[type],date:Date.now(),isUser:true};
    userListings.unshift(item); saveListings(); closeModals(); $('#listingForm').reset(); activeFilter='all'; favoritesOnly=false; visibleLimit=8; $$('.filter-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter==='all')); $('#searchInput').value=''; $('#regionSelect').value='all'; renderListings(); showToast(t('savedToast')); $('#offers').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('#mobileMenuBtn').addEventListener('click', () => { const nav=$('#mobileNav'); const open=nav.classList.toggle('open'); $('#mobileMenuBtn').setAttribute('aria-expanded',String(open)); $('#mobileMenuBtn').textContent=open?'×':'☰'; });
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{ $('#mobileNav').classList.remove('open'); $('#mobileMenuBtn').setAttribute('aria-expanded','false'); $('#mobileMenuBtn').textContent='☰'; }));
  $('#year').textContent = new Date().getFullYear();
  translatePage();
  if (API_ENABLED) refreshCloudListings();
})();
