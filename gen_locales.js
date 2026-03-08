const fs = require('fs');
const path = require('path');

const en = {
    tabs: { home: "Home", blocklist: "Blocklist", silenced: "Silenced", categories: "Categories", settings: "Settings" },
    home: {
        shieldOS: "Shield OS", systemProtected: "System Protected", protectionDisabled: "Protection Disabled",
        activelyFiltering: "SpamKiller is actively filtering SMS.", tapToEnable: "Tap shield to enable SpamKiller.",
        neuralEngineActive: "Neural Engine Active", threatsBlocked: "THREATS BLOCKED", recentBlocked: "RECENT BLOCKED",
        noBlockedMessages: "No blocked messages yet. Threats will appear here when detected.",
        justNow: "Just now", mAgo: "{{count}}m ago", hAgo: "{{count}}h ago", dAgo: "{{count}}d ago",
        spam: "spam", unknown: "Unknown"
    },
    blocklist: {
        title: "Blocklist", usageLimit: "USAGE LIMIT", slots: "{{used}} / {{max}} Slots",
        freeTierActive: "Free tier active", upgradeForMore: "Upgrade for more slots",
        activeBlocklist: "ACTIVE BLOCKLIST", blockTextPlaceholder: "Block text...",
        duplicateTitle: "Duplicate", duplicateMessage: "This keyword is already in your blocklist.",
        rulesAppliedInstantly: "Rules are applied instantly to all incoming traffic."
    },
    silenced: {
        title: "Silenced Numbers", description: "Messages from these numbers will be silently ignored. You won't be notified.",
        placeholder: "e.g. +1 555-123-4567", listTitle: "SILENCED NUMBERS ({{count}})",
        remove: "Remove", noSilencedNumbers: "No silenced numbers"
    },
    activity: {
        title: "Categories", subtitle: "AI automatically categorizes your incoming messages.",
        catScam: "Scam & Phishing", catPromos: "Promos & Coupons", catOtp: "OTP & Auth",
        catBank: "Banking & Bills", catDelivery: "Deliveries", catHealth: "Health & Medical",
        catWork: "Work & Teams", catOthers: "Others", messagesCount: "{{count}} messages"
    },
    aiSettings: {
        title: "AI Threat Detection", neuralProtection: "Neural Protection",
        neuralDesc: "Shield OS uses local neural networks to automatically identify and block new spam patterns. Your communication data never leaves this device.",
        autoAiDefense: "Auto AI Defense", realTimeActive: "Real-time filtering is actively protecting you.",
        protectionPaused: "Protection is currently paused.", localMl: "Local ML", engineVersion: "v4.2 Engine",
        privacyFirst: "Privacy First", zeroCloudLogs: "Zero Cloud Logs"
    },
    upgrade: {
        notNow: "Not now", securePayment: "Secure Payment", oneTimeCharge: "One-time charge",
        filterTitle: "Pro Filter Upgrade", filterSubtitle: "Lifetime Access",
        filterDesc: "Take full control of your security. Add unlimited custom keywords for just",
        filterFeat1: "Unlimited Custom Keywords", filterFeat2: "Instant Threat Blocking", filterFeat3: "Ad-Free Experience",
        filterCta: "Upgrade Now",
        aiTitle: "Neural Shield", aiSubtitle: "Ultimate Protection",
        aiDesc: "Enable full AI auto-detection and unlimited keywords for",
        aiFeat1: "Full Neural Auto-detection", aiFeat2: "Zero-day Spam Protection", aiFeat3: "Privacy-Preserving Local ML",
        aiCta: "Activate Neural Protection"
    },
    settings: {
        title: "Preferences", securityAlerts: "SECURITY & ALERTS", appLock: "App Lock",
        securedBiometrics: "Secured via Biometrics", tapEnable: "Tap to enable",
        alerts: "Alerts", liveUpdatesOn: "Live updates ON", currentlyMuted: "Currently muted",
        aiProtection: "AI PROTECTION", aiSpamDetector: "AI Spam Detector", neuralConfig: "Neural network protection config",
        systemLanguage: "SYSTEM LANGUAGE", supportUs: "SUPPORT US", enjoying: "Enjoying SpamKiller?",
        buyCoffee: "Buy us a Coffee ☕",
        deviceNotSecured: "Device Not Secured", mustSetupPasscode: "You must set up a device Passcode, PIN, or Biometrics in your phone's settings before you can enable App Lock.",
        enableAppLock: "Enable App Lock", cancel: "Cancel", usePasscode: "Use Passcode"
    }
};

const ar = {
    ...en,
    tabs: { home: "الرئيسية", blocklist: "قائمة الحظر", silenced: "مكتوم", categories: "الفئات", settings: "الإعدادات" },
    home: { shieldOS: "Shield OS", systemProtected: "النظام محمي", protectionDisabled: "الحماية معطلة", activelyFiltering: "يقوم التطبيق بتصفية الرسائل النشطة.", tapToEnable: "اضغط على الدرع للتفعيل.", neuralEngineActive: "محرك الذكاء الاصطناعي نشط", threatsBlocked: "التهديدات المحظورة", recentBlocked: "المحظورة مؤخراً", noBlockedMessages: "لا توجد رسائل محظورة حتى الآن.", justNow: "الآن", mAgo: "منذ {{count}} د", hAgo: "منذ {{count}} س", dAgo: "منذ {{count}} ي", spam: "مزعج", unknown: "غير معروف" },
    blocklist: { title: "قائمة الحظر", usageLimit: "حد الاستخدام", slots: "{{used}} / {{max}} خانات", freeTierActive: "النسخة المجانية نشطة", upgradeForMore: "الترقية لمزيد من الخانات", activeBlocklist: "قائمة الحظر النشطة", blockTextPlaceholder: "حظر النص...", duplicateTitle: "مكرر", duplicateMessage: "هذه الكلمة موجودة بالفعل في قائمة الحظر.", rulesAppliedInstantly: "يتم تطبيق القواعد فورًا على جميع الرسائل." },
    silenced: { title: "الأرقام المكتومة", description: "سيتم تجاهل الرسائل من هذه الأرقام بصمت. لن يتم إعلامك.", placeholder: "مثال: +1 555-123-4567", listTitle: "الأرقام المكتومة ({{count}})", remove: "إزالة", noSilencedNumbers: "لا توجد أرقام مكتومة" },
    activity: { title: "الفئات", subtitle: "يصنف الذكاء الاصطناعي رسائلك الواردة تلقائيًا.", catScam: "احتيال وتصيد", catPromos: "عروض وكوبونات", catOtp: "رموز التحقق", catBank: "بنوك وفواتير", catDelivery: "توصيل طلبات", catHealth: "صحة وطب", catWork: "عمل وفرق", catOthers: "أخرى", messagesCount: "{{count}} رسائل" },
    aiSettings: { title: "اكتشاف التهديدات بالذكاء الاصطناعي", neuralProtection: "حماية عصبية", neuralDesc: "يستخدم التطبيق شبكات عصبية محلية لتحديد أنماط البريد المزعج وحظرها تلقائيًا. بياناتك لا تغادر هذا الجهاز.", autoAiDefense: "الدفاع التلقائي بالذكاء الاصطناعي", realTimeActive: "التصفية في الوقت الفعلي تحميك الآن.", protectionPaused: "الحماية متوقفة حاليًا.", localMl: "تعلم آلي محلي", engineVersion: "محرك إصدار 4.2", privacyFirst: "الخصوصية أولاً", zeroCloudLogs: "لا سجلات سحابية" },
    upgrade: { notNow: "ليس الآن", securePayment: "دفع آمن", oneTimeCharge: "دفعة لمرة واحدة", filterTitle: "ترقية الفلتر", filterSubtitle: "وصول مدى الحياة", filterDesc: "تحكم كامل في أمانك. أضف كلمات مفتاحية غير محدودة مقابل", filterFeat1: "كلمات مفتاحية مخصصة غير محدودة", filterFeat2: "حظر فوري للتهديدات", filterFeat3: "تجربة بدون إعلانات", filterCta: "رَقِّ الآن", aiTitle: "درع الذكاء الاصطناعي", aiSubtitle: "الحماية القصوى", aiDesc: "تفعيل الكشف التلقائي بالذكاء الاصطناعي وكلمات غير محدودة مقابل", aiFeat1: "كشف عصبي تلقائي كامل", aiFeat2: "حماية فورية من البريد المزعج", aiFeat3: "تعلم آلي محلي يحفظ الخصوصية", aiCta: "تفعيل الحماية العصبية" },
    settings: { title: "الإعدادات", securityAlerts: "الأمان والتنبيهات", appLock: "قفل التطبيق", securedBiometrics: "مؤمن بالبصمة", tapEnable: "اضغط للتفعيل", alerts: "التنبيهات", liveUpdatesOn: "التحديثات المباشرة مفعلة", currentlyMuted: "مكتوم حاليا", aiProtection: "حماية الذكاء الاصطناعي", aiSpamDetector: "كاشف البريد المزعج بالذكاء الاصطناعي", neuralConfig: "إعدادات حماية الشبكة العصبية", systemLanguage: "لغة النظام", supportUs: "ادعمنا", enjoying: "هل تستمتع بـ SpamKiller؟", buyCoffee: "اشترِ لنا قهوة ☕", usePasscode: "استخدم رمز المرور" }
};

const fr = {
    ...en,
    tabs: { home: "Accueil", blocklist: "Liste noire", silenced: "Silencieux", categories: "Catégories", settings: "Paramètres" },
    home: { shieldOS: "Shield OS", systemProtected: "Système Protégé", protectionDisabled: "Protection Désactivée", activelyFiltering: "SpamKiller filtre activement les SMS.", tapToEnable: "Touchez le bouclier pour activer.", neuralEngineActive: "Moteur Neural Actif", threatsBlocked: "MENACES BLOQUÉES", recentBlocked: "BLOCAGES RÉCENTS", noBlockedMessages: "Aucun message bloqué pour l'instant.", justNow: "À l'instant", mAgo: "il y a {{count}}m", hAgo: "il y a {{count}}h", dAgo: "il y a {{count}}j", spam: "spam", unknown: "Inconnu" },
    blocklist: { title: "Liste noire", usageLimit: "LIMITE D'UTILISATION", slots: "{{used}} / {{max}} Emplacements", freeTierActive: "Niveau gratuit actif", upgradeForMore: "Mise à niveau pour plus de slots", activeBlocklist: "LISTE NOIRE ACTIVE", blockTextPlaceholder: "Bloquer un texte...", duplicateTitle: "Doublon", duplicateMessage: "Ce mot-clé est déjà dans votre liste noire.", rulesAppliedInstantly: "Règles appliquées instantanément." },
    silenced: { title: "Numéros Silencieux", description: "Les messages de ces numéros seront ignorés silencieusement.", placeholder: "ex. +33 6 12 34 56 78", listTitle: "NUMÉROS SILENCIEUX ({{count}})", remove: "Supprimer", noSilencedNumbers: "Aucun numéro silencieux" },
    activity: { title: "Catégories", subtitle: "L'IA catégorise automatiquement vos messages.", catScam: "Arnaque & Phishing", catPromos: "Promos & Coupons", catOtp: "Codes & Auth", catBank: "Banque & Factures", catDelivery: "Livraisons", catHealth: "Santé & Médical", catWork: "Travail & Équipes", catOthers: "Autres", messagesCount: "{{count}} messages" },
    aiSettings: { title: "Détection de menaces IA", neuralProtection: "Protection Neurale", neuralDesc: "Shield OS utilise des réseaux neuronaux locaux pour bloquer le spam.", autoAiDefense: "Défense IA automatique", realTimeActive: "Le filtrage en temps réel vous protège.", protectionPaused: "La protection est en pause.", localMl: "ML Local", engineVersion: "Moteur v4.2", privacyFirst: "Confidentialité", zeroCloudLogs: "Zéro logs cloud" },
    upgrade: { notNow: "Pas maintenant", securePayment: "Paiement sécurisé", oneTimeCharge: "Paiement unique", filterTitle: "Mise à niveau Pro", filterSubtitle: "Accès à vie", filterDesc: "Mots-clés illimités pour seulement", filterFeat1: "Mots-clés illimités", filterFeat2: "Blocage instantané", filterFeat3: "Sans publicité", filterCta: "Mettre à niveau", aiTitle: "Bouclier Neural", aiSubtitle: "Protection Ultime", aiDesc: "Activer la détection IA complète pour", aiFeat1: "Autodétection Neurale", aiFeat2: "Protection anti-spam Zero-day", aiFeat3: "ML privé local", aiCta: "Activer la Protection Neurale" },
    settings: { title: "Préférences", securityAlerts: "SÉCURITÉ ET ALERTES", appLock: "Verrouillage", securedBiometrics: "Sécurisé par biométrie", tapEnable: "Appuyez pour activer", alerts: "Alertes", liveUpdatesOn: "Mises à jour activées", currentlyMuted: "En sourdine", aiProtection: "PROTECTION IA", aiSpamDetector: "Détecteur Spam IA", neuralConfig: "Configuration réseau de neurones", systemLanguage: "LANGUE DU SYSTÈME", supportUs: "SOUTENEZ-NOUS", enjoying: "Vous aimez SpamKiller ?", buyCoffee: "Offrez-nous un café ☕", usePasscode: "Utiliser le code" }
};

const es = {
    ...en,
    tabs: { home: "Inicio", blocklist: "Lista negra", silenced: "Silenciados", categories: "Categorías", settings: "Ajustes" },
    home: { shieldOS: "Shield OS", systemProtected: "Sistema Protegido", protectionDisabled: "Protección Desactivada", activelyFiltering: "Filtrando SMS activamente.", tapToEnable: "Toca el escudo para activar.", neuralEngineActive: "Motor Neuronal Activo", threatsBlocked: "AMENAZAS BLOQUEADAS", recentBlocked: "BLOQUEOS RECIENTES", noBlockedMessages: "No hay mensajes bloqueados aún.", justNow: "Ahora mismo", mAgo: "hace {{count}}m", hAgo: "hace {{count}}h", dAgo: "hace {{count}} d", spam: "spam", unknown: "Desconocido" },
    blocklist: { title: "Lista negra", usageLimit: "LÍMITE DE USO", slots: "{{used}} / {{max}} Espacios", freeTierActive: "Nivel gratis activo", upgradeForMore: "Mejorar para más espacios", activeBlocklist: "LISTA NEGRA ACTIVA", blockTextPlaceholder: "Bloquear texto...", duplicateTitle: "Duplicado", duplicateMessage: "Esta palabra ya está en la lista.", rulesAppliedInstantly: "Las reglas se aplican al instante." },
    silenced: { title: "Números Silenciados", description: "Mensajes de estos números serán ignorados.", placeholder: "ej. +34 600 00 00 00", listTitle: "NÚMEROS SILENCIADOS ({{count}})", remove: "Eliminar", noSilencedNumbers: "No hay números silenciados" },
    activity: { title: "Categorías", subtitle: "La IA clasifica automáticamente tus mensajes.", catScam: "Estafa y Phishing", catPromos: "Promos y Cupones", catOtp: "Códigos de Auth", catBank: "Banco y Facturas", catDelivery: "Entregas", catHealth: "Salud y Médico", catWork: "Trabajo", catOthers: "Otros", messagesCount: "{{count}} mensajes" },
    aiSettings: { title: "Detección de IA", neuralProtection: "Protección Neuronal", neuralDesc: "Bloquea spam con redes neuronales locales.", autoAiDefense: "Defensa IA Automática", realTimeActive: "El filtrado en tiempo real está activo.", protectionPaused: "Protección pausada.", localMl: "ML Local", engineVersion: "Motor v4.2", privacyFirst: "Privacidad", zeroCloudLogs: "Sin registros en la nube" },
    upgrade: { notNow: "Ahora no", securePayment: "Pago seguro", oneTimeCharge: "Pago único", filterTitle: "Mejora Pro", filterSubtitle: "Acceso de por vida", filterDesc: "Añade palabras ilimitadas por", filterFeat1: "Palabras ilimitadas", filterFeat2: "Bloqueo instantáneo", filterFeat3: "Sin anuncios", filterCta: "Mejorar Ahora", aiTitle: "Escudo Neuronal", aiSubtitle: "Protección Máxima", aiDesc: "Activa IA completa por", aiFeat1: "Autodetección Neuronal", aiFeat2: "Protección spam de día cero", aiFeat3: "ML local privado", aiCta: "Activar Protección Neuronal" },
    settings: { title: "Preferencias", securityAlerts: "SEGURIDAD Y ALERTAS", appLock: "Bloqueo App", securedBiometrics: "Asegurado por biometría", tapEnable: "Toca para habilitar", alerts: "Alertas", liveUpdatesOn: "Actualizaciones ON", currentlyMuted: "Silenciado", aiProtection: "PROTECCIÓN IA", aiSpamDetector: "Detector Spam IA", neuralConfig: "Configuración de red neuronal", systemLanguage: "IDIOMA DEL SISTEMA", supportUs: "APÓYANOS", enjoying: "¿Disfrutas SpamKiller?", buyCoffee: "Cómpranos un café ☕", usePasscode: "Usar Código" }
};

const de = {
    ...en,
    tabs: { home: "Start", blocklist: "Sperrliste", silenced: "Stumm", categories: "Kategorien", settings: "Einst." },
    home: { shieldOS: "Shield OS", systemProtected: "System Geschützt", protectionDisabled: "Schutz Deaktiviert", activelyFiltering: "Filtert SMS aktiv.", tapToEnable: "Zum Aktivieren tippen.", neuralEngineActive: "Neural Engine Aktiv", threatsBlocked: "BEDROHUNGEN BLOCKIERT", recentBlocked: "ZULETZT BLOCKIERT", noBlockedMessages: "Noch keine Nachrichten blockiert.", justNow: "Gerade eben", mAgo: "vor {{count}}m", hAgo: "vor {{count}}h", dAgo: "vor {{count}}T", spam: "Spam", unknown: "Unbekannt" },
    blocklist: { title: "Sperrliste", usageLimit: "NUTZUNGSLIMIT", slots: "{{used}} / {{max}} Plätze", freeTierActive: "Gratis-Stufe aktiv", upgradeForMore: "Upgrade für mehr Plätze", activeBlocklist: "AKTIVE SPERRLISTE", blockTextPlaceholder: "Text blockieren...", duplicateTitle: "Duplikat", duplicateMessage: "Dieses Wort ist bereits blockiert.", rulesAppliedInstantly: "Regeln werden sofort angewendet." },
    silenced: { title: "Stumme Nummern", description: "Nachrichten von diesen Nummern werden lautlos ignoriert.", placeholder: "z.B. +49 170 1234567", listTitle: "STUMME NUMMERN ({{count}})", remove: "Entfernen", noSilencedNumbers: "Keine stummen Nummern" },
    activity: { title: "Kategorien", subtitle: "Künstliche Intelligenz kategorisiert Nachrichten.", catScam: "Betrug & Phishing", catPromos: "Angebote & Gutscheine", catOtp: "Auth-Codes", catBank: "Bank & Rechnungen", catDelivery: "Lieferungen", catHealth: "Gesundheit", catWork: "Arbeit", catOthers: "Sonstiges", messagesCount: "{{count}} Nachrichten" },
    aiSettings: { title: "KI-Bedrohungserkennung", neuralProtection: "Neuronaler Schutz", neuralDesc: "Blokiert Spam mit lokalen Netzwerken.", autoAiDefense: "KI-Automatische Abwehr", realTimeActive: "Echtzeitfilter ist aktiv.", protectionPaused: "Schutz ist pausiert.", localMl: "Lokales ML", engineVersion: "v4.2 Engine", privacyFirst: "Datenschutz", zeroCloudLogs: "Keine Cloud-Logs" },
    upgrade: { notNow: "Später", securePayment: "Sichere Zahlung", oneTimeCharge: "Einmalzahlung", filterTitle: "Pro Filter Upgrade", filterSubtitle: "Lebenslanger Zugriff", filterDesc: "Unbegrenzte Schlüsselwörter für", filterFeat1: "Unbegrenzte Wörter", filterFeat2: "Sofortiges Blockieren", filterFeat3: "Werbefrei", filterCta: "Jetzt Upgraden", aiTitle: "Neuronaler Schild", aiSubtitle: "Ultimativer Schutz", aiDesc: "KI und unbegrenzte Wörter für", aiFeat1: "Volle KI-Erkennung", aiFeat2: "Zero-Day-Schutz", aiFeat3: "Privates ML", aiCta: "Schutz Aktivieren" },
    settings: { title: "Einstellungen", securityAlerts: "SICHERHEIT & WARNUNGEN", appLock: "App-Sperre", securedBiometrics: "Durch Biometrie gesichert", tapEnable: "Tippen zum Aktivieren", alerts: "Warnungen", liveUpdatesOn: "Live-Updates AN", currentlyMuted: "Stummgeschaltet", aiProtection: "KI-SCHUTZ", aiSpamDetector: "KI-Spam-Detektor", neuralConfig: "Neuronale Netzwerkkonfiguration", systemLanguage: "SYSTEMSPRACHE", supportUs: "UNTERSTÜTZE UNS", enjoying: "Gefällt dir SpamKiller?", buyCoffee: "Kauf uns einen Kaffee ☕", usePasscode: "Passcode nutzen" }
};

const ja = {
    ...en,
    tabs: { home: "ホーム", blocklist: "ブロック", silenced: "消音", categories: "カテゴリ", settings: "設定" },
    settings: { title: "設定", securityAlerts: "セキュリティとアラート", appLock: "アプリロック", securedBiometrics: "生体認証で保護されています", tapEnable: "タップして有効化", alerts: "アラート", liveUpdatesOn: "ライブアップデートON", currentlyMuted: "ミュート中", aiProtection: "AIプロテクション", aiSpamDetector: "AIスパム検出器", neuralConfig: "ニューラルネットワーク構成", systemLanguage: "システム言語", supportUs: "サポート", enjoying: "楽しんでいますか？", buyCoffee: "コーヒーをおごる ☕", usePasscode: "パスコードを使用" }
};

const zh = {
    ...en,
    tabs: { home: "主页", blocklist: "黑名单", silenced: "静音", categories: "类别", settings: "设置" },
    settings: { title: "设置", securityAlerts: "安全与警报", appLock: "应用锁", securedBiometrics: "通过生物识别保护", tapEnable: "点击以启用", alerts: "警报", liveUpdatesOn: "实时更新已开启", currentlyMuted: "当前已静音", aiProtection: "AI保护", aiSpamDetector: "AI垃圾邮件检测器", neuralConfig: "神经网络保护配置", systemLanguage: "系统语言", supportUs: "支持我们", enjoying: "喜欢SpamKiller吗？", buyCoffee: "请我们喝杯咖啡 ☕", usePasscode: "使用密码" }
};

const tr = {
    ...en,
    tabs: { home: "Ana Sayfa", blocklist: "Engellenenler", silenced: "Sessiz", categories: "Kategoriler", settings: "Ayarlar" },
    settings: { title: "Ayarlar", securityAlerts: "GÜVENLİK VE UYARILAR", appLock: "Uygulama Kilidi", securedBiometrics: "Biyometri ile korundu", tapEnable: "Etkinleştirmek için dokunun", alerts: "Uyarılar", liveUpdatesOn: "Canlı güncellemeler AÇIK", currentlyMuted: "Sessizde", aiProtection: "YAPAY ZEKA KORUMASI", aiSpamDetector: "YZ Spam Dedektörü", neuralConfig: "Sinir ağı koruma yapılandırması", systemLanguage: "SİSTEM DİLİ", supportUs: "BİZİ DESTEKLE", enjoying: "Beğendiniz mi?", buyCoffee: "Bize bir kahve ısmarla ☕", usePasscode: "Parolayı kullan" }
};

const ru = {
    ...en,
    tabs: { home: "Главная", blocklist: "Черный список", silenced: "Приглушенные", categories: "Категории", settings: "Настройки" },
    settings: { title: "Настройки", securityAlerts: "БЕЗОПАСНОСТЬ", appLock: "Блокировка", securedBiometrics: "Защищено биометрией", tapEnable: "Нажмите, чтобы включить", alerts: "Уведомления", liveUpdatesOn: "Обновления ВКЛ", currentlyMuted: "Отключено", aiProtection: "ЗАЩИТА ИИ", aiSpamDetector: "ИИ Детектор", neuralConfig: "Настройка нейронной сети", systemLanguage: "ЯЗЫК", supportUs: "ПОДДЕРЖИТЕ НАС", enjoying: "Нравится приложение?", buyCoffee: "Купите нам кофе ☕", usePasscode: "Использовать пароль" }
};

const langs = { en, ar, fr, es, de, ja, zh, tr, ru };

for (const [key, val] of Object.entries(langs)) {
    fs.writeFileSync(path.join(__dirname, 'locales', `${key}.json`), JSON.stringify(val, null, 2));
}
console.log('Generated translation files successfully.');
