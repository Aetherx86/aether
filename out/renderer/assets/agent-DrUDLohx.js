import { c as createI18n, d as defineStrings, r as reactExports, j as jsxRuntimeExports, h as htmlLang, a as htmlDir, b as clientExports, R as React } from "./index-DMHLWY5B.js";
import { S as SkillCardLine, a as SkillCardPreviewLine, b as SkillProposalCard, s as skillCardBridge, c as skillCardText, d as skillTemplateText, e as skillsText, f as SkillImportPreviewDialog, g as failureKey, p as pickerSkillsOf, w as withSkillChip, h as skillChipOf, u as useSkillPickerInput, i as agentText, j as skillPickerText } from "./skills-CkmNaLwM.js";
const AGENT_PROVIDERS = ["claude-code", "codex"];
const AGENT_MODES = ["ask-commands", "ask-writes", "trust-project"];
const AGENT_WARNING_VERSION = 1;
const AGENT_CODEX_WEB_SEARCH = ["cached", "live", "disabled"];
const zh$1 = {
  actWebSearch: "网页搜索",
  actWebFetch: "读取网页",
  permWebSearch: "在网上搜索",
  permWebFetch: "读取此网页",
  permAllowSearchSession: "本次会话中允许搜索",
  permAllowSiteSession: "本次会话中允许此网站",
  codexWebLabel: "网页搜索",
  codexWebCached: "已保存的结果",
  codexWebLive: "实时",
  codexWebDisabled: "关闭",
  codexWebNote: "“已保存的结果”从预先收集的网页内容中查找；“实时”搜索当前的网页。",
  codexNetworkLabel: "命令的互联网访问",
  codexNetworkOff: "关闭",
  codexNetworkOn: "开启",
  codexNetworkWarning: "开启后，Codex 运行的命令可以访问互联网。在“信任此项目”中，命令会不经询问直接访问。收到的文档中隐藏的指令可能会让它把资料发送出去。",
  codexFolderNote: "这两项设置按项目文件夹分别记住。",
  providerCodexNoteWeb: "命令在 Codex 的隔离空间中运行：只能写入项目文件夹，除非你开启，否则无法访问互联网。"
};
const en$1 = {
  actWebSearch: "Web search",
  actWebFetch: "Read web page",
  permWebSearch: "Search the web",
  permWebFetch: "Read this web page",
  permAllowSearchSession: "Allow searches for this session",
  permAllowSiteSession: "Allow this site for this session",
  codexWebLabel: "Web search",
  codexWebCached: "Saved results",
  codexWebLive: "Live",
  codexWebDisabled: "Off",
  codexWebNote: "Saved results come from web content collected in advance; Live searches the web as it is now.",
  codexNetworkLabel: "Internet access for commands",
  codexNetworkOff: "Off",
  codexNetworkOn: "On",
  codexNetworkWarning: "When on, commands that Codex runs can reach the internet. With “Trust this project” they reach it without asking. Hidden instructions in a document you received could make them send your data out.",
  codexFolderNote: "These two settings are remembered for each project folder.",
  providerCodexNoteWeb: "Commands run in Codex’s isolated space: only the project folder can be written, and there is no internet unless you turn it on."
};
const ja$1 = {
  actWebSearch: "ウェブ検索",
  actWebFetch: "ウェブページの読み取り",
  permWebSearch: "ウェブで検索",
  permWebFetch: "このウェブページを読み取る",
  permAllowSearchSession: "このセッション中は検索を許可",
  permAllowSiteSession: "このセッション中はこのサイトを許可",
  codexWebLabel: "ウェブ検索",
  codexWebCached: "保存済みの結果",
  codexWebLive: "リアルタイム",
  codexWebDisabled: "オフ",
  codexWebNote: "保存済みの結果は事前に集められたウェブの情報から探します。リアルタイムは今のウェブを検索します。",
  codexNetworkLabel: "コマンドのインターネット接続",
  codexNetworkOff: "オフ",
  codexNetworkOn: "オン",
  codexNetworkWarning: "オンにすると、Codex が実行するコマンドがインターネットに接続できます。「このプロジェクトを信頼する」では確認なしで接続します。受け取った文書に隠された指示が、データを外部に送らせるおそれがあります。",
  codexFolderNote: "この 2 つの設定はプロジェクトフォルダーごとに記憶されます。",
  providerCodexNoteWeb: "コマンドは Codex の隔離された環境で実行されます。書き込めるのはプロジェクトフォルダーだけで、オンにしない限りインターネットには接続できません。"
};
const ko$1 = {
  actWebSearch: "웹 검색",
  actWebFetch: "웹 페이지 읽기",
  permWebSearch: "웹에서 검색",
  permWebFetch: "이 웹 페이지 읽기",
  permAllowSearchSession: "이번 세션 동안 검색 허락",
  permAllowSiteSession: "이번 세션 동안 이 사이트 허락",
  codexWebLabel: "웹 검색",
  codexWebCached: "저장된 결과",
  codexWebLive: "실시간",
  codexWebDisabled: "끄기",
  codexWebNote: "저장된 결과는 미리 모아 둔 웹 자료에서 찾고, 실시간은 지금의 웹을 검색합니다.",
  codexNetworkLabel: "명령의 인터넷 접속",
  codexNetworkOff: "끔",
  codexNetworkOn: "켬",
  codexNetworkWarning: "켜면 Codex가 실행하는 명령이 인터넷에 닿습니다. '이 프로젝트는 믿고 맡기기'에서는 묻지 않고 닿습니다. 받은 문서에 숨은 지시가 자료를 밖으로 보내게 할 수 있습니다.",
  codexFolderNote: "이 두 설정은 프로젝트 폴더마다 따로 기억합니다.",
  providerCodexNoteWeb: "명령은 Codex의 격리 공간에서 실행됩니다. 프로젝트 폴더에만 쓸 수 있고, 인터넷은 켜 두지 않으면 막힙니다."
};
const fr$1 = {
  actWebSearch: "Recherche web",
  actWebFetch: "Lecture de page web",
  permWebSearch: "Rechercher sur le web",
  permWebFetch: "Lire cette page web",
  permAllowSearchSession: "Autoriser les recherches pour cette session",
  permAllowSiteSession: "Autoriser ce site pour cette session",
  codexWebLabel: "Recherche web",
  codexWebCached: "Résultats enregistrés",
  codexWebLive: "En direct",
  codexWebDisabled: "Désactivée",
  codexWebNote: "Les résultats enregistrés proviennent de contenus web collectés à l’avance ; « En direct » interroge le web tel qu’il est maintenant.",
  codexNetworkLabel: "Accès à Internet pour les commandes",
  codexNetworkOff: "Désactivé",
  codexNetworkOn: "Activé",
  codexNetworkWarning: "Une fois activé, les commandes lancées par Codex peuvent accéder à Internet. Avec « Faire confiance à ce projet », elles y accèdent sans demander. Des instructions cachées dans un document reçu pourraient leur faire envoyer vos données à l’extérieur.",
  codexFolderNote: "Ces deux réglages sont mémorisés pour chaque dossier de projet.",
  providerCodexNoteWeb: "Les commandes s’exécutent dans l’espace isolé de Codex : seul le dossier du projet peut être modifié, et Internet reste inaccessible tant que vous ne l’activez pas."
};
const de$1 = {
  actWebSearch: "Websuche",
  actWebFetch: "Webseite lesen",
  permWebSearch: "Im Web suchen",
  permWebFetch: "Diese Webseite lesen",
  permAllowSearchSession: "Suchen für diese Sitzung erlauben",
  permAllowSiteSession: "Diese Website für diese Sitzung erlauben",
  codexWebLabel: "Websuche",
  codexWebCached: "Gespeicherte Ergebnisse",
  codexWebLive: "Live",
  codexWebDisabled: "Aus",
  codexWebNote: "Gespeicherte Ergebnisse stammen aus vorab gesammelten Webinhalten; „Live“ durchsucht das Web, wie es jetzt ist.",
  codexNetworkLabel: "Internetzugang für Befehle",
  codexNetworkOff: "Aus",
  codexNetworkOn: "Ein",
  codexNetworkWarning: "Wenn eingeschaltet, können Befehle, die Codex ausführt, das Internet erreichen. Mit „Diesem Projekt vertrauen“ geschieht das ohne Rückfrage. Versteckte Anweisungen in einem erhaltenen Dokument könnten sie dazu bringen, Ihre Daten nach außen zu senden.",
  codexFolderNote: "Diese beiden Einstellungen werden für jeden Projektordner gespeichert.",
  providerCodexNoteWeb: "Befehle laufen im abgeschotteten Bereich von Codex: Nur in den Projektordner kann geschrieben werden, und Internet gibt es nur, wenn Sie es einschalten."
};
const es$1 = {
  actWebSearch: "Búsqueda web",
  actWebFetch: "Leer página web",
  permWebSearch: "Buscar en la web",
  permWebFetch: "Leer esta página web",
  permAllowSearchSession: "Permitir búsquedas durante esta sesión",
  permAllowSiteSession: "Permitir este sitio durante esta sesión",
  codexWebLabel: "Búsqueda web",
  codexWebCached: "Resultados guardados",
  codexWebLive: "En vivo",
  codexWebDisabled: "Desactivada",
  codexWebNote: "Los resultados guardados provienen de contenido web recopilado de antemano; «En vivo» busca en la web tal como está ahora.",
  codexNetworkLabel: "Acceso a internet de los comandos",
  codexNetworkOff: "Desactivado",
  codexNetworkOn: "Activado",
  codexNetworkWarning: "Si lo activas, los comandos que ejecuta Codex pueden acceder a internet. Con «Confiar en este proyecto» acceden sin preguntar. Instrucciones ocultas en un documento recibido podrían hacer que envíen tus datos al exterior.",
  codexFolderNote: "Estos dos ajustes se recuerdan para cada carpeta de proyecto.",
  providerCodexNoteWeb: "Los comandos se ejecutan en el espacio aislado de Codex: solo se puede escribir en la carpeta del proyecto y no hay acceso a internet a menos que lo actives."
};
const th$1 = {
  actWebSearch: "ค้นหาเว็บ",
  actWebFetch: "อ่านหน้าเว็บ",
  permWebSearch: "ค้นหาบนเว็บ",
  permWebFetch: "อ่านหน้าเว็บนี้",
  permAllowSearchSession: "อนุญาตการค้นหาตลอดเซสชันนี้",
  permAllowSiteSession: "อนุญาตเว็บไซต์นี้ตลอดเซสชันนี้",
  codexWebLabel: "ค้นหาเว็บ",
  codexWebCached: "ผลลัพธ์ที่บันทึกไว้",
  codexWebLive: "แบบเรียลไทม์",
  codexWebDisabled: "ปิด",
  codexWebNote: "ผลลัพธ์ที่บันทึกไว้มาจากข้อมูลเว็บที่รวบรวมไว้ล่วงหน้า ส่วนแบบเรียลไทม์จะค้นหาเว็บในขณะนี้",
  codexNetworkLabel: "การเชื่อมต่ออินเทอร์เน็ตของคำสั่ง",
  codexNetworkOff: "ปิด",
  codexNetworkOn: "เปิด",
  codexNetworkWarning: "เมื่อเปิด คำสั่งที่ Codex เรียกใช้จะเข้าถึงอินเทอร์เน็ตได้ ในโหมด “เชื่อถือโปรเจกต์นี้” จะเข้าถึงได้โดยไม่ถาม คำสั่งที่ซ่อนอยู่ในเอกสารที่ได้รับมาอาจทำให้ข้อมูลของคุณถูกส่งออกไปภายนอก",
  codexFolderNote: "การตั้งค่าทั้งสองนี้จะถูกจำแยกตามโฟลเดอร์โปรเจกต์",
  providerCodexNoteWeb: "คำสั่งจะทำงานในพื้นที่แยกของ Codex เขียนได้เฉพาะในโฟลเดอร์โปรเจกต์ และใช้อินเทอร์เน็ตไม่ได้เว้นแต่คุณจะเปิดไว้"
};
const id$1 = {
  actWebSearch: "Pencarian web",
  actWebFetch: "Baca halaman web",
  permWebSearch: "Cari di web",
  permWebFetch: "Baca halaman web ini",
  permAllowSearchSession: "Izinkan pencarian selama sesi ini",
  permAllowSiteSession: "Izinkan situs ini selama sesi ini",
  codexWebLabel: "Pencarian web",
  codexWebCached: "Hasil tersimpan",
  codexWebLive: "Langsung",
  codexWebDisabled: "Nonaktif",
  codexWebNote: "Hasil tersimpan berasal dari konten web yang dikumpulkan sebelumnya; Langsung mencari web sebagaimana adanya sekarang.",
  codexNetworkLabel: "Akses internet untuk perintah",
  codexNetworkOff: "Nonaktif",
  codexNetworkOn: "Aktif",
  codexNetworkWarning: "Jika diaktifkan, perintah yang dijalankan Codex dapat menjangkau internet. Dengan “Percayai proyek ini”, perintah menjangkaunya tanpa bertanya. Instruksi tersembunyi dalam dokumen yang Anda terima dapat membuatnya mengirim data Anda keluar.",
  codexFolderNote: "Kedua pengaturan ini diingat untuk setiap folder proyek.",
  providerCodexNoteWeb: "Perintah berjalan di ruang terisolasi Codex: hanya folder proyek yang dapat ditulisi, dan tidak ada internet kecuali Anda mengaktifkannya."
};
const ru$1 = {
  actWebSearch: "Поиск в интернете",
  actWebFetch: "Чтение веб-страницы",
  permWebSearch: "Искать в интернете",
  permWebFetch: "Прочитать эту веб-страницу",
  permAllowSearchSession: "Разрешить поиск до конца сеанса",
  permAllowSiteSession: "Разрешить этот сайт до конца сеанса",
  codexWebLabel: "Поиск в интернете",
  codexWebCached: "Сохранённые результаты",
  codexWebLive: "В реальном времени",
  codexWebDisabled: "Выключен",
  codexWebNote: "Сохранённые результаты берутся из заранее собранных веб-материалов; поиск в реальном времени ищет в интернете сейчас.",
  codexNetworkLabel: "Доступ команд к интернету",
  codexNetworkOff: "Выключен",
  codexNetworkOn: "Включён",
  codexNetworkWarning: "Если включить, команды, которые запускает Codex, смогут выходить в интернет. В режиме «Доверять этому проекту» они делают это без вопросов. Скрытые указания в полученном документе могут заставить их отправить ваши данные наружу.",
  codexFolderNote: "Эти две настройки запоминаются для каждой папки проекта.",
  providerCodexNoteWeb: "Команды выполняются в изолированной среде Codex: записывать можно только в папку проекта, а доступа к интернету нет, пока вы его не включите."
};
const ar$1 = {
  actWebSearch: "البحث في الويب",
  actWebFetch: "قراءة صفحة ويب",
  permWebSearch: "البحث في الويب",
  permWebFetch: "قراءة صفحة الويب هذه",
  permAllowSearchSession: "السماح بالبحث طوال هذه الجلسة",
  permAllowSiteSession: "السماح بهذا الموقع طوال هذه الجلسة",
  codexWebLabel: "البحث في الويب",
  codexWebCached: "نتائج محفوظة",
  codexWebLive: "مباشر",
  codexWebDisabled: "إيقاف",
  codexWebNote: "تأتي النتائج المحفوظة من محتوى ويب جُمع مسبقًا؛ أما البحث المباشر فيبحث في الويب كما هو الآن.",
  codexNetworkLabel: "وصول الأوامر إلى الإنترنت",
  codexNetworkOff: "إيقاف",
  codexNetworkOn: "تشغيل",
  codexNetworkWarning: "عند التشغيل، يمكن للأوامر التي يشغّلها Codex الوصول إلى الإنترنت. ومع «الثقة بهذا المشروع» تصل إليه دون أن تسأل. قد تدفعها تعليمات مخفية في مستند تلقيته إلى إرسال بياناتك إلى الخارج.",
  codexFolderNote: "يُحفَظ هذان الإعدادان لكل مجلد مشروع على حدة.",
  providerCodexNoteWeb: "تعمل الأوامر في المساحة المعزولة الخاصة بـ Codex: لا يمكن الكتابة إلا في مجلد المشروع، ولا يتوفر اتصال بالإنترنت ما لم تشغّله."
};
const pt$1 = {
  actWebSearch: "Pesquisa na web",
  actWebFetch: "Ler página web",
  permWebSearch: "Pesquisar na web",
  permWebFetch: "Ler esta página web",
  permAllowSearchSession: "Permitir pesquisas nesta sessão",
  permAllowSiteSession: "Permitir este site nesta sessão",
  codexWebLabel: "Pesquisa na web",
  codexWebCached: "Resultados salvos",
  codexWebLive: "Em tempo real",
  codexWebDisabled: "Desativada",
  codexWebNote: "Os resultados salvos vêm de conteúdo da web coletado previamente; “Em tempo real” pesquisa a web como ela está agora.",
  codexNetworkLabel: "Acesso à internet dos comandos",
  codexNetworkOff: "Desativado",
  codexNetworkOn: "Ativado",
  codexNetworkWarning: "Quando ativado, os comandos que o Codex executa podem acessar a internet. Com “Confiar neste projeto”, eles acessam sem perguntar. Instruções ocultas em um documento recebido podem levá-los a enviar seus dados para fora.",
  codexFolderNote: "Essas duas configurações são lembradas para cada pasta de projeto.",
  providerCodexNoteWeb: "Os comandos são executados no espaço isolado do Codex: só a pasta do projeto pode ser alterada, e não há acesso à internet a menos que você o ative."
};
const it$1 = {
  actWebSearch: "Ricerca web",
  actWebFetch: "Lettura pagina web",
  permWebSearch: "Cerca sul web",
  permWebFetch: "Leggi questa pagina web",
  permAllowSearchSession: "Consenti le ricerche per questa sessione",
  permAllowSiteSession: "Consenti questo sito per questa sessione",
  codexWebLabel: "Ricerca web",
  codexWebCached: "Risultati salvati",
  codexWebLive: "In tempo reale",
  codexWebDisabled: "Disattivata",
  codexWebNote: "I risultati salvati provengono da contenuti web raccolti in anticipo; «In tempo reale» cerca sul web così com’è adesso.",
  codexNetworkLabel: "Accesso a internet per i comandi",
  codexNetworkOff: "Disattivato",
  codexNetworkOn: "Attivato",
  codexNetworkWarning: "Se attivato, i comandi eseguiti da Codex possono raggiungere internet. Con «Fidati di questo progetto» lo raggiungono senza chiedere. Istruzioni nascoste in un documento ricevuto potrebbero far loro inviare i tuoi dati all’esterno.",
  codexFolderNote: "Queste due impostazioni vengono ricordate per ogni cartella di progetto.",
  providerCodexNoteWeb: "I comandi vengono eseguiti nello spazio isolato di Codex: si può scrivere solo nella cartella del progetto e non c’è accesso a internet, a meno che tu non lo attivi."
};
const pl$1 = {
  actWebSearch: "Wyszukiwanie w sieci",
  actWebFetch: "Odczyt strony internetowej",
  permWebSearch: "Szukaj w sieci",
  permWebFetch: "Odczytaj tę stronę internetową",
  permAllowSearchSession: "Zezwól na wyszukiwanie do końca sesji",
  permAllowSiteSession: "Zezwól na tę witrynę do końca sesji",
  codexWebLabel: "Wyszukiwanie w sieci",
  codexWebCached: "Zapisane wyniki",
  codexWebLive: "Na żywo",
  codexWebDisabled: "Wyłączone",
  codexWebNote: "Zapisane wyniki pochodzą z treści internetowych zebranych wcześniej; „Na żywo” przeszukuje sieć w jej obecnym stanie.",
  codexNetworkLabel: "Dostęp poleceń do internetu",
  codexNetworkOff: "Wyłączony",
  codexNetworkOn: "Włączony",
  codexNetworkWarning: "Po włączeniu polecenia uruchamiane przez Codex mogą łączyć się z internetem. W trybie „Ufaj temu projektowi” robią to bez pytania. Ukryte instrukcje w otrzymanym dokumencie mogą sprawić, że wyślą Twoje dane na zewnątrz.",
  codexFolderNote: "Te dwa ustawienia są zapamiętywane osobno dla każdego folderu projektu.",
  providerCodexNoteWeb: "Polecenia działają w izolowanej przestrzeni Codex: zapisywać można tylko w folderze projektu, a dostępu do internetu nie ma, dopóki go nie włączysz."
};
const cs$1 = {
  actWebSearch: "Vyhledávání na webu",
  actWebFetch: "Čtení webové stránky",
  permWebSearch: "Hledat na webu",
  permWebFetch: "Přečíst tuto webovou stránku",
  permAllowSearchSession: "Povolit vyhledávání po dobu této relace",
  permAllowSiteSession: "Povolit tento web po dobu této relace",
  codexWebLabel: "Vyhledávání na webu",
  codexWebCached: "Uložené výsledky",
  codexWebLive: "Živě",
  codexWebDisabled: "Vypnuto",
  codexWebNote: "Uložené výsledky pocházejí z webového obsahu shromážděného předem; „Živě“ prohledává web v jeho současné podobě.",
  codexNetworkLabel: "Přístup příkazů k internetu",
  codexNetworkOff: "Vypnuto",
  codexNetworkOn: "Zapnuto",
  codexNetworkWarning: "Po zapnutí se příkazy, které Codex spouští, dostanou na internet. V režimu „Důvěřovat tomuto projektu“ se tam dostanou bez ptaní. Skryté pokyny v přijatém dokumentu je mohou přimět k odeslání vašich dat ven.",
  codexFolderNote: "Tato dvě nastavení se pamatují pro každou složku projektu zvlášť.",
  providerCodexNoteWeb: "Příkazy běží v izolovaném prostoru programu Codex: zapisovat lze jen do složky projektu a internet není k dispozici, dokud ho nezapnete."
};
const nl$1 = {
  actWebSearch: "Zoeken op het web",
  actWebFetch: "Webpagina lezen",
  permWebSearch: "Zoeken op het web",
  permWebFetch: "Deze webpagina lezen",
  permAllowSearchSession: "Zoeken toestaan voor deze sessie",
  permAllowSiteSession: "Deze site toestaan voor deze sessie",
  codexWebLabel: "Zoeken op het web",
  codexWebCached: "Opgeslagen resultaten",
  codexWebLive: "Live",
  codexWebDisabled: "Uit",
  codexWebNote: "Opgeslagen resultaten komen uit vooraf verzamelde webinhoud; Live doorzoekt het web zoals het nu is.",
  codexNetworkLabel: "Internettoegang voor opdrachten",
  codexNetworkOff: "Uit",
  codexNetworkOn: "Aan",
  codexNetworkWarning: "Als dit aan staat, kunnen opdrachten die Codex uitvoert het internet bereiken. Met ‘Dit project vertrouwen’ gebeurt dat zonder te vragen. Verborgen instructies in een ontvangen document kunnen ze je gegevens naar buiten laten sturen.",
  codexFolderNote: "Deze twee instellingen worden per projectmap onthouden.",
  providerCodexNoteWeb: "Opdrachten worden uitgevoerd in de afgeschermde ruimte van Codex: alleen in de projectmap kan worden geschreven en er is geen internet tenzij je het aanzet."
};
const ms$1 = {
  actWebSearch: "Carian web",
  actWebFetch: "Baca halaman web",
  permWebSearch: "Cari di web",
  permWebFetch: "Baca halaman web ini",
  permAllowSearchSession: "Benarkan carian sepanjang sesi ini",
  permAllowSiteSession: "Benarkan laman ini sepanjang sesi ini",
  codexWebLabel: "Carian web",
  codexWebCached: "Hasil tersimpan",
  codexWebLive: "Langsung",
  codexWebDisabled: "Mati",
  codexWebNote: "Hasil tersimpan datang daripada kandungan web yang dikumpul lebih awal; Langsung mencari web seperti keadaannya sekarang.",
  codexNetworkLabel: "Akses internet untuk arahan",
  codexNetworkOff: "Mati",
  codexNetworkOn: "Hidup",
  codexNetworkWarning: "Apabila dihidupkan, arahan yang dijalankan oleh Codex boleh mencapai internet. Dengan “Percayai projek ini”, arahan mencapainya tanpa bertanya. Arahan tersembunyi dalam dokumen yang anda terima boleh menyebabkan data anda dihantar keluar.",
  codexFolderNote: "Kedua-dua tetapan ini diingat bagi setiap folder projek.",
  providerCodexNoteWeb: "Arahan berjalan dalam ruang terasing Codex: hanya folder projek yang boleh ditulis, dan tiada internet melainkan anda menghidupkannya."
};
const he$1 = {
  actWebSearch: "חיפוש באינטרנט",
  actWebFetch: "קריאת דף אינטרנט",
  permWebSearch: "חיפוש באינטרנט",
  permWebFetch: "קריאת דף האינטרנט הזה",
  permAllowSearchSession: "לאשר חיפושים לאורך הסשן הזה",
  permAllowSiteSession: "לאשר את האתר הזה לאורך הסשן הזה",
  codexWebLabel: "חיפוש באינטרנט",
  codexWebCached: "תוצאות שמורות",
  codexWebLive: "בזמן אמת",
  codexWebDisabled: "כבוי",
  codexWebNote: "תוצאות שמורות מגיעות מתוכן אינטרנט שנאסף מראש; חיפוש בזמן אמת מחפש באינטרנט כפי שהוא עכשיו.",
  codexNetworkLabel: "גישה לאינטרנט לפקודות",
  codexNetworkOff: "כבויה",
  codexNetworkOn: "פעילה",
  codexNetworkWarning: "כשהגישה פעילה, הפקודות ש-Codex מריץ יכולות להגיע לאינטרנט. במצב „לסמוך על הפרויקט הזה” הן מגיעות אליו בלי לשאול. הוראות נסתרות במסמך שקיבלת עלולות לגרום להן לשלוח את הנתונים שלך החוצה.",
  codexFolderNote: "שתי ההגדרות האלה נשמרות לכל תיקיית פרויקט בנפרד.",
  providerCodexNoteWeb: "הפקודות רצות במרחב המבודד של Codex: אפשר לכתוב רק לתיקיית הפרויקט, ואין גישה לאינטרנט אלא אם תפעיל אותה."
};
const hi$1 = {
  actWebSearch: "वेब खोज",
  actWebFetch: "वेब पेज पढ़ें",
  permWebSearch: "वेब पर खोजें",
  permWebFetch: "यह वेब पेज पढ़ें",
  permAllowSearchSession: "इस सत्र के दौरान खोज की अनुमति दें",
  permAllowSiteSession: "इस सत्र के दौरान इस साइट की अनुमति दें",
  codexWebLabel: "वेब खोज",
  codexWebCached: "सहेजे गए परिणाम",
  codexWebLive: "लाइव",
  codexWebDisabled: "बंद",
  codexWebNote: "सहेजे गए परिणाम पहले से इकट्ठा की गई वेब सामग्री से आते हैं; लाइव अभी के वेब में खोजता है।",
  codexNetworkLabel: "कमांड की इंटरनेट पहुँच",
  codexNetworkOff: "बंद",
  codexNetworkOn: "चालू",
  codexNetworkWarning: "चालू करने पर Codex जो कमांड चलाता है, वे इंटरनेट तक पहुँच सकते हैं। “इस प्रोजेक्ट पर भरोसा करें” में वे बिना पूछे पहुँचते हैं। मिले हुए दस्तावेज़ में छिपे निर्देश उनसे आपका डेटा बाहर भिजवा सकते हैं।",
  codexFolderNote: "ये दोनों सेटिंग हर प्रोजेक्ट फ़ोल्डर के लिए अलग से याद रखी जाती हैं।",
  providerCodexNoteWeb: "कमांड Codex के अलग किए गए स्थान में चलते हैं: केवल प्रोजेक्ट फ़ोल्डर में लिखा जा सकता है, और जब तक आप चालू न करें, इंटरनेट उपलब्ध नहीं है।"
};
const zhTW$1 = {
  actWebSearch: "網頁搜尋",
  actWebFetch: "讀取網頁",
  permWebSearch: "在網路上搜尋",
  permWebFetch: "讀取此網頁",
  permAllowSearchSession: "本次工作階段允許搜尋",
  permAllowSiteSession: "本次工作階段允許此網站",
  codexWebLabel: "網頁搜尋",
  codexWebCached: "已儲存的結果",
  codexWebLive: "即時",
  codexWebDisabled: "關閉",
  codexWebNote: "「已儲存的結果」從預先收集的網頁內容中查找；「即時」搜尋當下的網頁。",
  codexNetworkLabel: "指令的網際網路存取",
  codexNetworkOff: "關閉",
  codexNetworkOn: "開啟",
  codexNetworkWarning: "開啟後，Codex 執行的指令可以連上網際網路。在「信任此專案」中，指令會不經詢問直接連線。收到的文件中隱藏的指示可能會讓它把資料傳送出去。",
  codexFolderNote: "這兩項設定會依專案資料夾分別記住。",
  providerCodexNoteWeb: "指令在 Codex 的隔離空間中執行：只能寫入專案資料夾，除非你開啟，否則無法連上網際網路。"
};
const vi$1 = {
  actWebSearch: "Tìm kiếm web",
  actWebFetch: "Đọc trang web",
  permWebSearch: "Tìm kiếm trên web",
  permWebFetch: "Đọc trang web này",
  permAllowSearchSession: "Cho phép tìm kiếm trong phiên này",
  permAllowSiteSession: "Cho phép trang này trong phiên này",
  codexWebLabel: "Tìm kiếm web",
  codexWebCached: "Kết quả đã lưu",
  codexWebLive: "Trực tiếp",
  codexWebDisabled: "Tắt",
  codexWebNote: "Kết quả đã lưu lấy từ nội dung web được thu thập sẵn; Trực tiếp tìm trên web như hiện tại.",
  codexNetworkLabel: "Truy cập internet của lệnh",
  codexNetworkOff: "Tắt",
  codexNetworkOn: "Bật",
  codexNetworkWarning: "Khi bật, các lệnh mà Codex chạy có thể truy cập internet. Với “Tin tưởng dự án này”, lệnh truy cập mà không hỏi. Chỉ dẫn ẩn trong tài liệu bạn nhận được có thể khiến dữ liệu của bạn bị gửi ra ngoài.",
  codexFolderNote: "Hai cài đặt này được ghi nhớ riêng cho từng thư mục dự án.",
  providerCodexNoteWeb: "Các lệnh chạy trong không gian cách ly của Codex: chỉ có thể ghi vào thư mục dự án và không có internet trừ khi bạn bật lên."
};
const agentWebStrings = defineStrings({
  zh: zh$1,
  en: en$1,
  ja: ja$1,
  ko: ko$1,
  fr: fr$1,
  de: de$1,
  es: es$1,
  th: th$1,
  id: id$1,
  ru: ru$1,
  ar: ar$1,
  pt: pt$1,
  it: it$1,
  pl: pl$1,
  cs: cs$1,
  nl: nl$1,
  ms: ms$1,
  he: he$1,
  hi: hi$1,
  "zh-TW": zhTW$1,
  vi: vi$1
});
const translate$1 = createI18n(agentWebStrings);
function agentWebText(lang, key, params) {
  return translate$1(lang, key, params);
}
const zh = {
  noticeText: "技能现在在 设置 → 技能 中开启和关闭。Claude 和 Codex 技能文件夹中的技能开始时为关闭状态。",
  noticeOpenSettings: "打开设置",
  noticeClose: "关闭",
  nextSession: "更改的技能将从下一个会话起生效",
  templateLabel: "一起保存为模板的文档",
  templateNone: "无模板",
  templateFromTab: "已在标签页中打开",
  templateFromProject: "项目文件夹",
  templateUnsaved: "此标签页有未保存的更改。模板将使用已保存的文件。",
  templateChecking: "正在检查是否有隐藏的内容…",
  templateUnknown: "无法在此确认这种格式是否有隐藏的内容，因此不能按原样保存。请制作空白模板后保存。",
  templateTooLarge: "此文档太大，无法保存为模板",
  installTitle: "AI 建议安装这个技能",
  installHint: "请在预览中确认内容后再决定是否安装。安装的技能将从下一个会话起使用。",
  installOpen: "打开预览",
  installDismiss: "关闭",
  installDismissed: "未安装",
  installCancel: "取消",
  actProposeSkill: "建议技能"
};
const en = {
  noticeText: "Skills are now turned on and off in Settings → Skills. Skills in the Claude and Codex skill folders start turned off.",
  noticeOpenSettings: "Open Settings",
  noticeClose: "Close",
  nextSession: "Changed skills apply from the next session",
  templateLabel: "Document to save as the template",
  templateNone: "No template",
  templateFromTab: "Open in a tab",
  templateFromProject: "Project folder",
  templateUnsaved: "This tab has unsaved changes. The saved file becomes the template.",
  templateChecking: "Checking for withheld content…",
  templateUnknown: "For this format the app cannot tell here whether anything is withheld, so it cannot be saved as it is. Make a blank template and save that instead.",
  templateTooLarge: "This document is too large to save as a template",
  installTitle: "The AI proposes installing this skill",
  installHint: "Open the preview to see what it holds, then decide whether to install it. An installed skill is available from the next session.",
  installOpen: "Open preview",
  installDismiss: "Close",
  installDismissed: "Not installed",
  installCancel: "Cancel",
  actProposeSkill: "Suggest a skill"
};
const ja = {
  noticeText: "スキルは 設定 → スキル でオン・オフするようになりました。Claude と Codex のスキルフォルダーのスキルはオフの状態で始まります。",
  noticeOpenSettings: "設定を開く",
  noticeClose: "閉じる",
  nextSession: "変更したスキルは次のセッションから反映されます",
  templateLabel: "テンプレートとして一緒に保存する文書",
  templateNone: "テンプレートなし",
  templateFromTab: "タブで開いています",
  templateFromProject: "プロジェクトフォルダー",
  templateUnsaved: "このタブには保存していない変更があります。保存済みのファイルがテンプレートになります。",
  templateChecking: "伏せた内容があるか確認しています…",
  templateUnknown: "この形式は伏せた内容があるかここでは確認できないため、そのまま保存できません。空のテンプレートを作って保存してください。",
  templateTooLarge: "この文書は大きすぎてテンプレートとして保存できません",
  installTitle: "AI がこのスキルのインストールを提案しています",
  installHint: "プレビューで内容を確認してから、インストールするか決めてください。インストールしたスキルは次のセッションから使えます。",
  installOpen: "プレビューを開く",
  installDismiss: "閉じる",
  installDismissed: "インストールしませんでした",
  installCancel: "キャンセル",
  actProposeSkill: "スキルの提案"
};
const ko = {
  noticeText: "스킬은 이제 설정 → 스킬에서 켜고 끕니다. Claude·Codex 스킬 폴더의 스킬은 꺼진 채로 시작합니다.",
  noticeOpenSettings: "설정 열기",
  noticeClose: "닫기",
  nextSession: "바뀐 스킬은 다음 세션부터 적용됩니다",
  templateLabel: "양식으로 함께 저장할 문서",
  templateNone: "양식 없음",
  templateFromTab: "탭에 열림",
  templateFromProject: "프로젝트 폴더",
  templateUnsaved: "이 탭에는 저장하지 않은 고친 내용이 있습니다. 저장된 파일이 양식이 됩니다.",
  templateChecking: "가린 내용이 있는지 확인하는 중…",
  templateUnknown: "이 형식은 가린 내용이 있는지 여기서 확인할 수 없어 원래 문서 그대로 저장할 수 없습니다. 비운 양식을 만들어 저장하세요.",
  templateTooLarge: "이 문서는 너무 커서 양식으로 저장할 수 없습니다",
  installTitle: "AI가 이 스킬 설치를 제안합니다",
  installHint: "미리보기에서 내용을 확인한 뒤 설치할지 정하세요. 설치한 스킬은 다음 세션부터 쓰입니다.",
  installOpen: "미리보기 열기",
  installDismiss: "닫기",
  installDismissed: "설치하지 않음",
  installCancel: "취소",
  actProposeSkill: "스킬 제안"
};
const fr = {
  noticeText: "Les compétences s’activent et se désactivent désormais dans Paramètres → Compétences. Les compétences des dossiers de compétences Claude et Codex sont désactivées au départ.",
  noticeOpenSettings: "Ouvrir les paramètres",
  noticeClose: "Fermer",
  nextSession: "Les compétences modifiées s’appliquent à partir de la prochaine session",
  templateLabel: "Document à enregistrer comme modèle",
  templateNone: "Aucun modèle",
  templateFromTab: "Ouvert dans un onglet",
  templateFromProject: "Dossier du projet",
  templateUnsaved: "Cet onglet a des modifications non enregistrées. C’est le fichier enregistré qui devient le modèle.",
  templateChecking: "Recherche de contenu masqué…",
  templateUnknown: "Pour ce format, l’application ne peut pas vérifier ici si un contenu est masqué ; le document ne peut donc pas être enregistré tel quel. Créez un modèle vierge et enregistrez-le.",
  templateTooLarge: "Ce document est trop volumineux pour être enregistré comme modèle",
  installTitle: "L’IA propose d’installer cette compétence",
  installHint: "Ouvrez l’aperçu pour voir son contenu, puis décidez de l’installer ou non. Une compétence installée est disponible à partir de la prochaine session.",
  installOpen: "Ouvrir l’aperçu",
  installDismiss: "Fermer",
  installDismissed: "Non installée",
  installCancel: "Annuler",
  actProposeSkill: "Proposer une compétence"
};
const de = {
  noticeText: "Skills werden jetzt unter Einstellungen → Skills ein- und ausgeschaltet. Skills aus den Claude- und Codex-Skill-Ordnern sind anfangs ausgeschaltet.",
  noticeOpenSettings: "Einstellungen öffnen",
  noticeClose: "Schließen",
  nextSession: "Geänderte Skills gelten ab der nächsten Sitzung",
  templateLabel: "Dokument, das als Vorlage gespeichert wird",
  templateNone: "Keine Vorlage",
  templateFromTab: "In einem Tab geöffnet",
  templateFromProject: "Projektordner",
  templateUnsaved: "Dieser Tab hat ungespeicherte Änderungen. Die gespeicherte Datei wird zur Vorlage.",
  templateChecking: "Es wird geprüft, ob Inhalte zurückgehalten werden…",
  templateUnknown: "Bei diesem Format kann hier nicht geprüft werden, ob Inhalte zurückgehalten werden; es kann daher nicht unverändert gespeichert werden. Erstellen Sie eine leere Vorlage und speichern Sie diese.",
  templateTooLarge: "Dieses Dokument ist zu groß, um als Vorlage gespeichert zu werden",
  installTitle: "Die KI schlägt vor, diesen Skill zu installieren",
  installHint: "Öffnen Sie die Vorschau, um den Inhalt zu prüfen, und entscheiden Sie dann über die Installation. Ein installierter Skill ist ab der nächsten Sitzung verfügbar.",
  installOpen: "Vorschau öffnen",
  installDismiss: "Schließen",
  installDismissed: "Nicht installiert",
  installCancel: "Abbrechen",
  actProposeSkill: "Skill vorschlagen"
};
const es = {
  noticeText: "Las habilidades ahora se activan y desactivan en Configuración → Habilidades. Las habilidades de las carpetas de habilidades de Claude y Codex empiezan desactivadas.",
  noticeOpenSettings: "Abrir configuración",
  noticeClose: "Cerrar",
  nextSession: "Las habilidades modificadas se aplican a partir de la próxima sesión",
  templateLabel: "Documento que se guarda como plantilla",
  templateNone: "Sin plantilla",
  templateFromTab: "Abierto en una pestaña",
  templateFromProject: "Carpeta del proyecto",
  templateUnsaved: "Esta pestaña tiene cambios sin guardar. El archivo guardado será la plantilla.",
  templateChecking: "Comprobando si hay contenido oculto…",
  templateUnknown: "En este formato no se puede comprobar aquí si hay contenido oculto, así que no se puede guardar tal cual. Cree una plantilla en blanco y guárdela.",
  templateTooLarge: "Este documento es demasiado grande para guardarlo como plantilla",
  installTitle: "La IA propone instalar esta habilidad",
  installHint: "Abra la vista previa para ver lo que contiene y decida si instalarla. Una habilidad instalada está disponible a partir de la próxima sesión.",
  installOpen: "Abrir vista previa",
  installDismiss: "Cerrar",
  installDismissed: "No instalada",
  installCancel: "Cancelar",
  actProposeSkill: "Proponer una habilidad"
};
const th = {
  noticeText: "ตอนนี้เปิดและปิดสกิลได้ที่ การตั้งค่า → สกิล สกิลในโฟลเดอร์สกิลของ Claude และ Codex จะเริ่มต้นในสถานะปิด",
  noticeOpenSettings: "เปิดการตั้งค่า",
  noticeClose: "ปิด",
  nextSession: "สกิลที่เปลี่ยนจะมีผลตั้งแต่เซสชันถัดไป",
  templateLabel: "เอกสารที่จะบันทึกเป็นแม่แบบ",
  templateNone: "ไม่มีแม่แบบ",
  templateFromTab: "เปิดอยู่ในแท็บ",
  templateFromProject: "โฟลเดอร์โปรเจกต์",
  templateUnsaved: "แท็บนี้มีการแก้ไขที่ยังไม่ได้บันทึก ไฟล์ที่บันทึกไว้จะเป็นแม่แบบ",
  templateChecking: "กำลังตรวจว่ามีเนื้อหาที่ซ่อนไว้หรือไม่…",
  templateUnknown: "รูปแบบนี้ตรวจที่นี่ไม่ได้ว่ามีเนื้อหาที่ซ่อนไว้หรือไม่ จึงบันทึกตามเดิมไม่ได้ โปรดสร้างแม่แบบเปล่าแล้วบันทึก",
  templateTooLarge: "เอกสารนี้ใหญ่เกินกว่าจะบันทึกเป็นแม่แบบ",
  installTitle: "AI เสนอให้ติดตั้งสกิลนี้",
  installHint: "เปิดตัวอย่างเพื่อดูเนื้อหาก่อน แล้วจึงตัดสินใจว่าจะติดตั้งหรือไม่ สกิลที่ติดตั้งจะใช้ได้ตั้งแต่เซสชันถัดไป",
  installOpen: "เปิดตัวอย่าง",
  installDismiss: "ปิด",
  installDismissed: "ไม่ได้ติดตั้ง",
  installCancel: "ยกเลิก",
  actProposeSkill: "เสนอสกิล"
};
const id = {
  noticeText: "Skill kini diaktifkan dan dinonaktifkan di Pengaturan → Skill. Skill di folder skill Claude dan Codex awalnya nonaktif.",
  noticeOpenSettings: "Buka Pengaturan",
  noticeClose: "Tutup",
  nextSession: "Skill yang diubah berlaku mulai sesi berikutnya",
  templateLabel: "Dokumen yang disimpan sebagai templat",
  templateNone: "Tanpa templat",
  templateFromTab: "Terbuka di tab",
  templateFromProject: "Folder proyek",
  templateUnsaved: "Tab ini memiliki perubahan yang belum disimpan. File yang tersimpan menjadi templat.",
  templateChecking: "Memeriksa konten yang disembunyikan…",
  templateUnknown: "Untuk format ini aplikasi tidak dapat memeriksa di sini apakah ada konten yang disembunyikan, jadi dokumen tidak dapat disimpan apa adanya. Buat templat kosong lalu simpan.",
  templateTooLarge: "Dokumen ini terlalu besar untuk disimpan sebagai templat",
  installTitle: "AI mengusulkan untuk memasang skill ini",
  installHint: "Buka pratinjau untuk melihat isinya, lalu putuskan apakah akan memasangnya. Skill yang dipasang tersedia mulai sesi berikutnya.",
  installOpen: "Buka pratinjau",
  installDismiss: "Tutup",
  installDismissed: "Tidak dipasang",
  installCancel: "Batal",
  actProposeSkill: "Usulkan skill"
};
const ru = {
  noticeText: "Навыки теперь включаются и выключаются в разделе Настройки → Навыки. Навыки из папок навыков Claude и Codex сначала выключены.",
  noticeOpenSettings: "Открыть настройки",
  noticeClose: "Закрыть",
  nextSession: "Изменённые навыки применяются со следующего сеанса",
  templateLabel: "Документ, который сохраняется как шаблон",
  templateNone: "Без шаблона",
  templateFromTab: "Открыт во вкладке",
  templateFromProject: "Папка проекта",
  templateUnsaved: "В этой вкладке есть несохранённые изменения. Шаблоном станет сохранённый файл.",
  templateChecking: "Проверка скрытого содержимого…",
  templateUnknown: "Для этого формата здесь нельзя проверить, есть ли скрытое содержимое, поэтому документ нельзя сохранить как есть. Создайте пустой шаблон и сохраните его.",
  templateTooLarge: "Этот документ слишком большой, чтобы сохранить его как шаблон",
  installTitle: "ИИ предлагает установить этот навык",
  installHint: "Откройте предпросмотр, чтобы увидеть содержимое, и решите, устанавливать ли навык. Установленный навык будет доступен со следующего сеанса.",
  installOpen: "Открыть предпросмотр",
  installDismiss: "Закрыть",
  installDismissed: "Не установлен",
  installCancel: "Отмена",
  actProposeSkill: "Предложить навык"
};
const ar = {
  noticeText: "أصبح تشغيل المهارات وإيقافها الآن من الإعدادات ← المهارات. تبدأ المهارات الموجودة في مجلدات مهارات Claude وCodex وهي متوقفة.",
  noticeOpenSettings: "فتح الإعدادات",
  noticeClose: "إغلاق",
  nextSession: "تُطبَّق المهارات التي تغيّرت بدءًا من الجلسة التالية",
  templateLabel: "المستند الذي يُحفظ كقالب",
  templateNone: "بلا قالب",
  templateFromTab: "مفتوح في علامة تبويب",
  templateFromProject: "مجلد المشروع",
  templateUnsaved: "في علامة التبويب هذه تغييرات غير محفوظة. سيصبح الملف المحفوظ هو القالب.",
  templateChecking: "جارٍ التحقق من وجود محتوى محجوب…",
  templateUnknown: "لا يمكن هنا التحقق مما إذا كان في هذا التنسيق محتوى محجوب، لذا لا يمكن حفظه كما هو. أنشئ قالبًا فارغًا واحفظه.",
  templateTooLarge: "هذا المستند كبير جدًا بحيث لا يمكن حفظه كقالب",
  installTitle: "يقترح الذكاء الاصطناعي تثبيت هذه المهارة",
  installHint: "افتح المعاينة لترى محتواها، ثم قرّر ما إذا كنت ستثبّتها. تتوفر المهارة المثبّتة بدءًا من الجلسة التالية.",
  installOpen: "فتح المعاينة",
  installDismiss: "إغلاق",
  installDismissed: "لم تُثبَّت",
  installCancel: "إلغاء",
  actProposeSkill: "اقتراح مهارة"
};
const pt = {
  noticeText: "As habilidades agora são ativadas e desativadas em Configurações → Habilidades. As habilidades das pastas de habilidades do Claude e do Codex começam desativadas.",
  noticeOpenSettings: "Abrir configurações",
  noticeClose: "Fechar",
  nextSession: "As habilidades alteradas valem a partir da próxima sessão",
  templateLabel: "Documento a salvar como modelo",
  templateNone: "Sem modelo",
  templateFromTab: "Aberto em uma aba",
  templateFromProject: "Pasta do projeto",
  templateUnsaved: "Esta aba tem alterações não salvas. O arquivo salvo se torna o modelo.",
  templateChecking: "Verificando se há conteúdo ocultado…",
  templateUnknown: "Neste formato não é possível verificar aqui se há conteúdo ocultado, então o documento não pode ser salvo como está. Crie um modelo em branco e salve-o.",
  templateTooLarge: "Este documento é grande demais para ser salvo como modelo",
  installTitle: "A IA propõe instalar esta habilidade",
  installHint: "Abra a pré-visualização para ver o conteúdo e depois decida se vai instalá-la. Uma habilidade instalada fica disponível a partir da próxima sessão.",
  installOpen: "Abrir pré-visualização",
  installDismiss: "Fechar",
  installDismissed: "Não instalada",
  installCancel: "Cancelar",
  actProposeSkill: "Propor uma habilidade"
};
const it = {
  noticeText: "Le abilità ora si attivano e disattivano in Impostazioni → Abilità. Le abilità delle cartelle di abilità di Claude e Codex partono disattivate.",
  noticeOpenSettings: "Apri impostazioni",
  noticeClose: "Chiudi",
  nextSession: "Le abilità modificate valgono dalla prossima sessione",
  templateLabel: "Documento da salvare come modello",
  templateNone: "Nessun modello",
  templateFromTab: "Aperto in una scheda",
  templateFromProject: "Cartella del progetto",
  templateUnsaved: "Questa scheda ha modifiche non salvate. Il file salvato diventa il modello.",
  templateChecking: "Verifica dei contenuti nascosti…",
  templateUnknown: "Per questo formato qui non si può verificare se ci sono contenuti nascosti, quindi il documento non può essere salvato così com’è. Crea un modello vuoto e salva quello.",
  templateTooLarge: "Questo documento è troppo grande per essere salvato come modello",
  installTitle: "L’IA propone di installare questa abilità",
  installHint: "Apri l’anteprima per vedere cosa contiene, poi decidi se installarla. Un’abilità installata è disponibile dalla prossima sessione.",
  installOpen: "Apri anteprima",
  installDismiss: "Chiudi",
  installDismissed: "Non installata",
  installCancel: "Annulla",
  actProposeSkill: "Proponi un’abilità"
};
const pl = {
  noticeText: "Umiejętności włącza się i wyłącza teraz w Ustawienia → Umiejętności. Umiejętności z folderów umiejętności Claude i Codex są na początku wyłączone.",
  noticeOpenSettings: "Otwórz ustawienia",
  noticeClose: "Zamknij",
  nextSession: "Zmienione umiejętności obowiązują od następnej sesji",
  templateLabel: "Dokument zapisywany jako szablon",
  templateNone: "Bez szablonu",
  templateFromTab: "Otwarty w karcie",
  templateFromProject: "Folder projektu",
  templateUnsaved: "Ta karta ma niezapisane zmiany. Szablonem stanie się zapisany plik.",
  templateChecking: "Sprawdzanie, czy są ukryte treści…",
  templateUnknown: "W tym formacie nie da się tu sprawdzić, czy są ukryte treści, więc dokumentu nie można zapisać bez zmian. Utwórz pusty szablon i zapisz go.",
  templateTooLarge: "Ten dokument jest za duży, aby zapisać go jako szablon",
  installTitle: "AI proponuje zainstalowanie tej umiejętności",
  installHint: "Otwórz podgląd, aby zobaczyć zawartość, i zdecyduj, czy ją zainstalować. Zainstalowana umiejętność będzie dostępna od następnej sesji.",
  installOpen: "Otwórz podgląd",
  installDismiss: "Zamknij",
  installDismissed: "Nie zainstalowano",
  installCancel: "Anuluj",
  actProposeSkill: "Propozycja umiejętności"
};
const cs = {
  noticeText: "Dovednosti se nyní zapínají a vypínají v Nastavení → Dovednosti. Dovednosti ze složek dovedností Claude a Codex začínají vypnuté.",
  noticeOpenSettings: "Otevřít nastavení",
  noticeClose: "Zavřít",
  nextSession: "Změněné dovednosti platí od další relace",
  templateLabel: "Dokument, který se uloží jako šablona",
  templateNone: "Bez šablony",
  templateFromTab: "Otevřeno v kartě",
  templateFromProject: "Složka projektu",
  templateUnsaved: "Tato karta má neuložené změny. Šablonou se stane uložený soubor.",
  templateChecking: "Kontroluje se skrytý obsah…",
  templateUnknown: "U tohoto formátu zde nelze ověřit, zda obsahuje skrytý obsah, proto ho nelze uložit tak, jak je. Vytvořte prázdnou šablonu a uložte ji.",
  templateTooLarge: "Tento dokument je příliš velký na uložení jako šablona",
  installTitle: "AI navrhuje nainstalovat tuto dovednost",
  installHint: "Otevřete náhled, prohlédněte si obsah a pak rozhodněte, zda ji nainstalovat. Nainstalovaná dovednost je k dispozici od další relace.",
  installOpen: "Otevřít náhled",
  installDismiss: "Zavřít",
  installDismissed: "Nenainstalováno",
  installCancel: "Zrušit",
  actProposeSkill: "Návrh dovednosti"
};
const nl = {
  noticeText: "Vaardigheden zet je nu aan en uit in Instellingen → Vaardigheden. Vaardigheden in de vaardighedenmappen van Claude en Codex staan eerst uit.",
  noticeOpenSettings: "Instellingen openen",
  noticeClose: "Sluiten",
  nextSession: "Gewijzigde vaardigheden gelden vanaf de volgende sessie",
  templateLabel: "Document dat als sjabloon wordt opgeslagen",
  templateNone: "Geen sjabloon",
  templateFromTab: "Geopend in een tabblad",
  templateFromProject: "Projectmap",
  templateUnsaved: "Dit tabblad heeft niet-opgeslagen wijzigingen. Het opgeslagen bestand wordt het sjabloon.",
  templateChecking: "Controleren op afgeschermde inhoud…",
  templateUnknown: "Bij dit formaat kan hier niet worden nagegaan of er inhoud is afgeschermd, dus het kan niet ongewijzigd worden opgeslagen. Maak een leeg sjabloon en sla dat op.",
  templateTooLarge: "Dit document is te groot om als sjabloon op te slaan",
  installTitle: "De AI stelt voor deze vaardigheid te installeren",
  installHint: "Open het voorbeeld om te zien wat erin zit en beslis dan of je die installeert. Een geïnstalleerde vaardigheid is beschikbaar vanaf de volgende sessie.",
  installOpen: "Voorbeeld openen",
  installDismiss: "Sluiten",
  installDismissed: "Niet geïnstalleerd",
  installCancel: "Annuleren",
  actProposeSkill: "Vaardigheid voorstellen"
};
const ms = {
  noticeText: "Kemahiran kini dihidupkan dan dimatikan dalam Tetapan → Kemahiran. Kemahiran dalam folder kemahiran Claude dan Codex bermula dalam keadaan mati.",
  noticeOpenSettings: "Buka Tetapan",
  noticeClose: "Tutup",
  nextSession: "Kemahiran yang diubah berkuat kuasa mulai sesi seterusnya",
  templateLabel: "Dokumen yang disimpan sebagai templat",
  templateNone: "Tiada templat",
  templateFromTab: "Dibuka dalam tab",
  templateFromProject: "Folder projek",
  templateUnsaved: "Tab ini ada perubahan yang belum disimpan. Fail yang disimpan menjadi templat.",
  templateChecking: "Menyemak kandungan yang disembunyikan…",
  templateUnknown: "Bagi format ini aplikasi tidak dapat menyemak di sini sama ada ada kandungan yang disembunyikan, jadi dokumen tidak boleh disimpan seadanya. Buat templat kosong dan simpan.",
  templateTooLarge: "Dokumen ini terlalu besar untuk disimpan sebagai templat",
  installTitle: "AI mencadangkan untuk memasang kemahiran ini",
  installHint: "Buka pratonton untuk melihat kandungannya, kemudian tentukan sama ada mahu memasangnya. Kemahiran yang dipasang tersedia mulai sesi seterusnya.",
  installOpen: "Buka pratonton",
  installDismiss: "Tutup",
  installDismissed: "Tidak dipasang",
  installCancel: "Batal",
  actProposeSkill: "Cadangkan kemahiran"
};
const he = {
  noticeText: "מעכשיו מפעילים ומכבים מיומנויות בהגדרות ← מיומנויות. מיומנויות מתיקיות המיומנויות של Claude ו־Codex מתחילות כבויות.",
  noticeOpenSettings: "פתיחת ההגדרות",
  noticeClose: "סגירה",
  nextSession: "מיומנויות ששונו חלות מהפעלה הבאה",
  templateLabel: "המסמך שיישמר כתבנית",
  templateNone: "ללא תבנית",
  templateFromTab: "פתוח בכרטיסייה",
  templateFromProject: "תיקיית הפרויקט",
  templateUnsaved: "בכרטיסייה זו יש שינויים שלא נשמרו. הקובץ השמור יהיה התבנית.",
  templateChecking: "בודק אם יש תוכן מוסתר…",
  templateUnknown: "בתבנית קובץ זו לא ניתן לבדוק כאן אם יש תוכן מוסתר, ולכן אי אפשר לשמור את המסמך כמו שהוא. צרו תבנית ריקה ושמרו אותה.",
  templateTooLarge: "המסמך הזה גדול מדי לשמירה כתבנית",
  installTitle: "הבינה המלאכותית מציעה להתקין את המיומנות הזו",
  installHint: "פתחו את התצוגה המקדימה כדי לראות מה היא כוללת, ואז החליטו אם להתקין. מיומנות שהותקנה זמינה מההפעלה הבאה.",
  installOpen: "פתיחת תצוגה מקדימה",
  installDismiss: "סגירה",
  installDismissed: "לא הותקן",
  installCancel: "ביטול",
  actProposeSkill: "הצעת מיומנות"
};
const hi = {
  noticeText: "कौशल अब सेटिंग्स → कौशल में चालू और बंद होते हैं। Claude और Codex कौशल फ़ोल्डरों के कौशल शुरू में बंद रहते हैं।",
  noticeOpenSettings: "सेटिंग्स खोलें",
  noticeClose: "बंद करें",
  nextSession: "बदले गए कौशल अगले सत्र से लागू होंगे",
  templateLabel: "टेम्पलेट के रूप में सहेजा जाने वाला दस्तावेज़",
  templateNone: "कोई टेम्पलेट नहीं",
  templateFromTab: "टैब में खुला",
  templateFromProject: "प्रोजेक्ट फ़ोल्डर",
  templateUnsaved: "इस टैब में बिना सहेजे बदलाव हैं। सहेजी गई फ़ाइल ही टेम्पलेट बनेगी।",
  templateChecking: "छिपाई गई सामग्री की जाँच हो रही है…",
  templateUnknown: "इस फ़ॉर्मैट में यहाँ यह जाँचा नहीं जा सकता कि कोई सामग्री छिपाई गई है या नहीं, इसलिए इसे जैसा है वैसा नहीं सहेजा जा सकता। खाली टेम्पलेट बनाकर उसे सहेजें।",
  templateTooLarge: "यह दस्तावेज़ टेम्पलेट के रूप में सहेजने के लिए बहुत बड़ा है",
  installTitle: "AI इस कौशल को इंस्टॉल करने का सुझाव दे रहा है",
  installHint: "पूर्वावलोकन खोलकर देखें कि इसमें क्या है, फिर तय करें कि इसे इंस्टॉल करना है या नहीं। इंस्टॉल किया गया कौशल अगले सत्र से उपलब्ध होगा।",
  installOpen: "पूर्वावलोकन खोलें",
  installDismiss: "बंद करें",
  installDismissed: "इंस्टॉल नहीं किया",
  installCancel: "रद्द करें",
  actProposeSkill: "कौशल का सुझाव"
};
const zhTW = {
  noticeText: "技能現在在 設定 → 技能 中開啟和關閉。Claude 和 Codex 技能資料夾中的技能開始時為關閉狀態。",
  noticeOpenSettings: "開啟設定",
  noticeClose: "關閉",
  nextSession: "變更的技能將從下一個工作階段起生效",
  templateLabel: "一併儲存為範本的文件",
  templateNone: "不使用範本",
  templateFromTab: "已在分頁中開啟",
  templateFromProject: "專案資料夾",
  templateUnsaved: "此分頁有尚未儲存的變更。範本將使用已儲存的檔案。",
  templateChecking: "正在檢查是否有隱藏的內容…",
  templateUnknown: "無法在此確認這種格式是否有隱藏的內容，因此不能照原樣儲存。請製作空白範本後儲存。",
  templateTooLarge: "此文件太大，無法儲存為範本",
  installTitle: "AI 建議安裝這個技能",
  installHint: "請在預覽中確認內容後再決定是否安裝。安裝的技能將從下一個工作階段起使用。",
  installOpen: "開啟預覽",
  installDismiss: "關閉",
  installDismissed: "未安裝",
  installCancel: "取消",
  actProposeSkill: "建議技能"
};
const vi = {
  noticeText: "Kỹ năng giờ được bật và tắt trong Cài đặt → Kỹ năng. Các kỹ năng trong thư mục kỹ năng của Claude và Codex lúc đầu ở trạng thái tắt.",
  noticeOpenSettings: "Mở Cài đặt",
  noticeClose: "Đóng",
  nextSession: "Kỹ năng đã thay đổi được áp dụng từ phiên tiếp theo",
  templateLabel: "Tài liệu được lưu làm mẫu",
  templateNone: "Không dùng mẫu",
  templateFromTab: "Đang mở trong thẻ",
  templateFromProject: "Thư mục dự án",
  templateUnsaved: "Thẻ này có thay đổi chưa lưu. Tệp đã lưu sẽ trở thành mẫu.",
  templateChecking: "Đang kiểm tra nội dung bị ẩn…",
  templateUnknown: "Với định dạng này, ứng dụng không thể kiểm tra tại đây xem có nội dung bị ẩn hay không, nên không thể lưu nguyên trạng. Hãy tạo mẫu trống rồi lưu.",
  templateTooLarge: "Tài liệu này quá lớn để lưu làm mẫu",
  installTitle: "AI đề xuất cài đặt kỹ năng này",
  installHint: "Mở bản xem trước để xem nội dung, rồi quyết định có cài đặt hay không. Kỹ năng đã cài sẽ dùng được từ phiên tiếp theo.",
  installOpen: "Mở bản xem trước",
  installDismiss: "Đóng",
  installDismissed: "Chưa cài đặt",
  installCancel: "Hủy",
  actProposeSkill: "Đề xuất kỹ năng"
};
const agentSkillsStrings = defineStrings({
  zh,
  en,
  ja,
  ko,
  fr,
  de,
  es,
  th,
  id,
  ru,
  ar,
  pt,
  it,
  pl,
  cs,
  nl,
  ms,
  he,
  hi,
  "zh-TW": zhTW,
  vi
});
const translate = createI18n(agentSkillsStrings);
function agentSkillsText(lang, key, params) {
  return translate(lang, key, params);
}
function agentSkillsBridge() {
  return window.aiOfficeUserSkills ?? null;
}
function AgentTemplateActions({
  context,
  api: api2,
  proposalKey,
  candidate,
  onPreviewOpened
}) {
  const { lang, busy, blocked } = context;
  const ta = (key) => agentSkillsText(lang, key);
  const [state, setState] = reactExports.useState({ kind: "checking" });
  const [working, setWorking] = reactExports.useState(false);
  const [failure, setFailure] = reactExports.useState(null);
  const liveRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    let live = true;
    setState({ kind: "checking" });
    setFailure(null);
    void api2.templateCheck(proposalKey, candidate.id).then((answer) => {
      if (!live) return;
      setState(
        answer.ok ? { kind: "ready", redaction: answer.redaction } : { kind: "failed", reason: answer.reason }
      );
    });
    return () => {
      live = false;
    };
  }, [api2, proposalKey, candidate.id]);
  const failureText = (reason) => reason === "too-large" ? ta("templateTooLarge") : reason === "redacted" ? skillTemplateText(lang, "asIsRedacted") : reason === "unknown" ? ta("templateUnknown") : skillTemplateText(lang, "documentUnreadable");
  const makeBlank = async () => {
    if (working) return;
    setWorking(true);
    setFailure(null);
    try {
      const opened = await api2.templateBlank(proposalKey, candidate.id, {
        tabTitle: skillTemplateText(lang, "previewTabTitle", { title: candidate.title }),
        text: skillTemplateText(lang, "clearRequest"),
        draft: context.draft
      });
      if (!liveRef.current) return;
      if (opened.ok) onPreviewOpened({ tabId: opened.tabId, previewId: opened.previewId });
      else setFailure(skillTemplateText(lang, "openFailed"));
    } finally {
      if (liveRef.current) setWorking(false);
    }
  };
  const saveAsIs = async () => {
    if (working) return;
    setWorking(true);
    setFailure(null);
    try {
      const answer = await api2.templateAsIs(proposalKey, candidate.id);
      if (!liveRef.current) return;
      if (!answer.ok) {
        setFailure(failureText(answer.reason));
        return;
      }
      await context.save({ bytes: answer.bytes, fileName: answer.fileName });
    } finally {
      if (liveRef.current) setWorking(false);
    }
  };
  const disabled = busy || working || !!blocked;
  const asIsAllowed = state.kind === "ready" && state.redaction === "none";
  const asIsReason = state.kind === "checking" ? null : state.kind === "failed" ? failureText(state.reason) : state.redaction === "none" ? null : failureText(state.redaction);
  const note = failure ?? asIsReason ?? (state.kind === "checking" ? ta("templateChecking") : null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn primary",
        disabled: disabled || state.kind === "failed",
        title: blocked ?? void 0,
        onClick: () => void makeBlank(),
        children: skillCardText(lang, "templateBlank")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "ai-skill-card-btn",
        disabled: disabled || !asIsAllowed,
        title: asIsReason ?? blocked ?? void 0,
        "data-template-as-is-blocked": state.kind === "ready" && state.redaction !== "none" ? state.redaction : void 0,
        onClick: () => void saveAsIs(),
        children: skillCardText(lang, "templateAsIs")
      }
    ),
    note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "ai-skill-card-note is-error ai-skill-card-template-note", role: "status", children: note })
  ] });
}
function AgentSkillCard({
  lang,
  payload,
  api: api2,
  skills
}) {
  const ta = (key) => agentSkillsText(lang, key);
  const { proposal, candidates } = payload;
  const [chosen, setChosen] = reactExports.useState(payload.selected ?? "");
  const [status, setStatus] = reactExports.useState({ kind: "open" });
  const candidate = candidates.find((c) => c.id === chosen);
  const previewId = status.kind === "preview" ? status.previewId : null;
  reactExports.useEffect(() => {
    if (!previewId || !skills) return;
    return skills.onPreviewEnded((ended) => {
      if (ended.previewId !== previewId) return;
      setStatus(
        (was) => ended.outcome === "saved" ? { kind: "saved", title: ended.title ?? ("title" in was ? was.title : "") } : { kind: "unsaved", title: "title" in was ? was.title : proposal.title }
      );
    });
  }, [previewId, skills, proposal.title]);
  if (status.kind === "saved" || status.kind === "unsaved") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillCardLine,
      {
        lang,
        status: status.kind,
        title: status.title,
        onOpenSettings: skills ? () => void skills.openSettings() : void 0
      }
    );
  }
  if (status.kind === "preview") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillCardPreviewLine,
      {
        lang,
        title: status.title,
        onGoToTab: skills ? () => void skills.focusTab(status.tabId) : void 0
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-skill-card", children: [
    candidates.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "agent-skill-template", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: ta("templateLabel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: chosen, onChange: (event) => setChosen(event.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: ta("templateNone") }),
        candidates.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: `${c.fileName} · ${ta(c.from === "tab" ? "templateFromTab" : "templateFromProject")}` }, c.id))
      ] }),
      candidate?.unsaved ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: ta("templateUnsaved") }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillProposalCard,
      {
        lang,
        proposal,
        bridge: skillCardBridge(),
        canBeTemplate: !!candidate,
        initialDraft: { withTemplate: proposal.wantsTemplate || !!payload.selected },
        renderTemplateActions: candidate ? (context) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          AgentTemplateActions,
          {
            context,
            api: api2,
            proposalKey: proposal.key,
            candidate,
            onPreviewOpened: (opened) => setStatus({ kind: "preview", ...opened, title: context.draft.title })
          },
          candidate.id
        ) : void 0,
        onSaved: (_id, draft) => setStatus({ kind: "saved", title: draft.title }),
        onCancel: () => setStatus({ kind: "unsaved", title: proposal.title })
      },
      proposal.key
    )
  ] });
}
function AgentInstallProposal({
  lang,
  address,
  skills
}) {
  const [state, setState] = reactExports.useState({ kind: "proposed" });
  const fetchingRef = reactExports.useRef(false);
  reactExports.useEffect(
    () => () => {
      if (fetchingRef.current) void skills.cancelImport();
    },
    [skills]
  );
  const openPreview = async () => {
    if (state.kind !== "proposed" && state.kind !== "done") return;
    setState({ kind: "fetching" });
    fetchingRef.current = true;
    const answer = await skills.importGitHub(address);
    fetchingRef.current = false;
    if (answer.ok) {
      setState({ kind: "preview", preview: answer.preview });
      return;
    }
    if (answer.reason === "cancelled") {
      setState({ kind: "proposed" });
      return;
    }
    setState({
      kind: "done",
      tone: "error",
      text: skillsText(lang, failureKey(answer.reason, "import") ?? "failGeneric")
    });
  };
  if (state.kind === "dismissed") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", children: agentSkillsText(lang, "installDismissed") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-install", role: "group", "aria-label": agentSkillsText(lang, "installTitle"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: agentSkillsText(lang, "installTitle") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "agent-install-address", children: address }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: agentSkillsText(lang, "installHint") }),
    state.kind === "fetching" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", role: "status", children: skillsText(lang, "githubFetching") }) : null,
    state.kind === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: state.tone === "error" ? "agent-error" : "agent-choice-note",
        role: state.tone === "error" ? "alert" : "status",
        children: state.text
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-perm-actions", children: state.kind === "fetching" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "agent-btn", type: "button", onClick: () => void skills.cancelImport(), children: agentSkillsText(lang, "installCancel") }) : state.kind === "done" && state.tone === "ok" ? null : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "agent-btn",
          type: "button",
          onClick: () => setState({ kind: "dismissed" }),
          children: agentSkillsText(lang, "installDismiss")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "agent-btn agent-btn-primary",
          type: "button",
          disabled: state.kind === "preview",
          onClick: () => void openPreview(),
          children: agentSkillsText(lang, "installOpen")
        }
      )
    ] }) }),
    state.kind === "preview" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      SkillImportPreviewDialog,
      {
        api: skills,
        preview: state.preview,
        lang,
        locale: htmlLang(lang),
        onDone: (notice) => setState({ kind: "done", ...notice }),
        onClose: () => setState({ kind: "dismissed" })
      }
    ) : null
  ] });
}
function agentPickerSkillsRaw(skills) {
  return skills.map((skill) => ({
    id: skill.id,
    source: skill.source,
    plugin: skill.plugin,
    name: skill.name,
    title: skill.title,
    description: skill.description,
    enabled: true,
    hidden: false,
    unreadable: void 0,
    agentOnly: true,
    hasScripts: false,
    template: skill.template ? skill.template : void 0,
    templateExists: !!skill.template
  }));
}
function agentSkillInstruction(skill) {
  const lines = [`Use this skill: read ${skill.skillMd} and follow it.`];
  if (skill.template) {
    lines.push(
      `Its template document is ${skill.template}. Copy it into the project folder under a new name and fill in the copy; leave the template itself unchanged.`
    );
  }
  return lines.join(" ");
}
function agentSkillRequest(text, chips, skills) {
  if (chips.length === 0) return { ok: true, text, titles: [] };
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const missing = chips.filter((chip) => !byId.has(chip.id)).map((chip) => chip.id);
  if (missing.length > 0) return { ok: false, missing };
  const chosen = chips.map((chip) => byId.get(chip.id));
  return {
    ok: true,
    text: [...chosen.map(agentSkillInstruction), "", text].join("\n"),
    titles: chips.map((chip, i) => chip.title || chosen[i].title || chosen[i].name)
  };
}
function agentSkillNoticeShown(due, closed) {
  return due === true && !closed;
}
function agentPermissionChoices(action) {
  const lasting = action.kind === "web-search" || action.kind === "web-fetch" && Boolean(action.host);
  return lasting ? ["deny", "allow-session", "allow"] : ["deny", "allow"];
}
function agentSessionAllowLabel(action) {
  return action.kind === "web-search" ? "permAllowSearchSession" : "permAllowSiteSession";
}
function agentWebPermissionLabel(action) {
  if (action.kind === "web-search") return "permWebSearch";
  if (action.kind === "web-fetch") return "permWebFetch";
  return void 0;
}
function codexNetworkWarningShown(prefs) {
  return prefs?.codexNetwork === true;
}
const EMPTY_AGENT_LOG = {
  entries: [],
  pending: [],
  busy: false,
  ended: false
};
function sameAction(a, b) {
  return a.tool === b.tool && a.kind === b.kind && (a.command ?? "") === (b.command ?? "") && a.paths.join("\n") === b.paths.join("\n");
}
function agentLogWith(state, event) {
  switch (event.type) {
    case "started":
      return { ...state, entries: [...state.entries, { kind: "started", skills: event.skills }] };
    case "text":
      return { ...state, entries: [...state.entries, { kind: "agent", text: event.text }] };
    case "tool": {
      if (event.status !== "running") {
        for (let i = state.entries.length - 1; i >= 0; i--) {
          const entry = state.entries[i];
          if (entry.kind === "tool" && entry.status === "running" && sameAction(entry.action, event.action)) {
            const entries = [...state.entries];
            const action = event.action.target && !entry.action.target ? { ...entry.action, target: event.action.target } : entry.action;
            entries[i] = { ...entry, action, status: event.status };
            return { ...state, entries };
          }
        }
      }
      return {
        ...state,
        entries: [...state.entries, { kind: "tool", action: event.action, status: event.status }]
      };
    }
    case "permission":
      return { ...state, pending: [...state.pending, { id: event.id, action: event.action }] };
    case "turn-done":
      return {
        ...state,
        busy: false,
        pending: [],
        entries: event.ok ? state.entries : [...state.entries, { kind: "turn-failed" }]
      };
    case "error":
      return { ...state, entries: [...state.entries, { kind: "error", errorKind: event.kind }] };
    case "ended":
      return {
        ...state,
        busy: false,
        ended: true,
        pending: [],
        entries: [...state.entries, { kind: "ended" }]
      };
  }
}
function agentLogAfterSend(state, text, skills = []) {
  const entry = skills.length > 0 ? { kind: "you", text, skills: [...skills] } : { kind: "you", text };
  return { ...state, busy: true, entries: [...state.entries, entry] };
}
function agentLogAfterSkillsChanged(state) {
  if (state.ended || state.entries.some((entry) => entry.kind === "skills-changed")) return state;
  return { ...state, entries: [...state.entries, { kind: "skills-changed" }] };
}
function agentLogAfterAnswer(state, id2) {
  return { ...state, pending: state.pending.filter((request) => request.id !== id2) };
}
function coveredBySessionAllow(state, id2) {
  const asked = state.pending.find((request) => request.id === id2)?.action;
  if (!asked) return [];
  return state.pending.filter(({ id: other, action }) => {
    if (other === id2) return false;
    if (asked.kind === "web-search") return action.kind === "web-search";
    return asked.kind === "web-fetch" && !!asked.host && action.kind === "web-fetch" && action.host === asked.host;
  }).map((request) => request.id);
}
function openablePath(action) {
  return action.kind === "write" || action.kind === "read" ? action.paths[0] : void 0;
}
function agentLogWithSkillItem(state, item) {
  if (state.entries.some((entry) => "key" in entry && entry.key === item.key)) return state;
  return { ...state, entries: [...state.entries, { kind: item.kind, key: item.key }] };
}
const PROVIDER_LABEL = {
  "claude-code": "providerClaude",
  codex: "providerCodex"
};
const PROVIDER_NOTE = {
  "claude-code": "providerClaudeNote",
  codex: "providerCodexNote"
};
const MODE_LABEL = {
  "ask-commands": ["modeAskCommands", "modeAskCommandsDesc"],
  "ask-writes": ["modeAskWrites", "modeAskWritesDesc"],
  "trust-project": ["modeTrust", "modeTrustDesc"]
};
const CONNECTION_NOTE = {
  checking: "connChecking",
  unavailable: "connUnavailable",
  "metered-accepted": "connMetered",
  blocked: "providerBlocked"
};
const ACTION_LABEL = {
  read: "actRead",
  write: "actWrite",
  command: "actCommand",
  "app-tool": "actAppTool",
  skill: "actSkill",
  other: "actOther"
};
const WEB_ACTION_LABEL = {
  "web-search": "actWebSearch",
  "web-fetch": "actWebFetch"
};
const WEB_SEARCH_LABEL = {
  cached: "codexWebCached",
  live: "codexWebLive",
  disabled: "codexWebDisabled"
};
const STATUS_LABEL = {
  running: "toolRunning",
  done: "toolDone",
  failed: "toolFailed",
  denied: "toolDenied"
};
const START_ERROR = {
  "bad-folder": "errBadFolder",
  "not-connected": "errNotConnected",
  "not-accepted": "errNotAccepted",
  "provider-blocked": "providerBlocked"
};
const RUN_ERROR = {
  "unsafe-tools": "errUnsafeTools",
  "sandbox-unavailable": "errSandboxUnavailable",
  "rate-limit": "errRateLimit",
  "signed-out": "errSignedOut",
  "metered-not-accepted": "errMetered",
  "needs-update": "errNeedsUpdate",
  "not-installed": "errNotInstalled"
};
function runErrorKey(kind) {
  return kind && RUN_ERROR[kind] || "errGeneric";
}
const APP_READ_TOOL = /(?:^|[:_])(?:read_[a-z]+|open_documents)$/;
const APP_SKILL_TOOL = /(?:^|[:_])propose_skill(?:_install)?$/;
function actionLabel(lang, action) {
  if (action.kind === "web-search" || action.kind === "web-fetch") {
    return agentWebText(lang, WEB_ACTION_LABEL[action.kind]);
  }
  if (action.kind === "app-tool" && APP_SKILL_TOOL.test(action.tool)) {
    return agentSkillsText(lang, "actProposeSkill");
  }
  return agentText(
    lang,
    action.kind === "app-tool" && APP_READ_TOOL.test(action.tool) ? "actRead" : ACTION_LABEL[action.kind]
  );
}
function actionDetail(action) {
  if (action.kind === "command") return action.command ?? "";
  if (action.kind === "web-search" || action.kind === "web-fetch") {
    return action.target ?? action.tool;
  }
  if (action.paths.length > 0) return action.paths.join(", ");
  return action.tool;
}
function AgentWindow() {
  const api2 = window.aiOfficeAgentWindow;
  const [init, setInit] = reactExports.useState(null);
  const [prefs, setPrefs] = reactExports.useState(null);
  const [folder, setFolder] = reactExports.useState("");
  const [startError, setStartError] = reactExports.useState(null);
  const [starting, setStarting] = reactExports.useState(false);
  const [sessionId, setSessionId] = reactExports.useState(null);
  const [log, setLog] = reactExports.useState(EMPTY_AGENT_LOG);
  const [input, setInput] = reactExports.useState("");
  const [projectPrefs, setProjectPrefs] = reactExports.useState(null);
  const folderRef = reactExports.useRef("");
  const sessionRef = reactExports.useRef(null);
  const logEnd = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const skillsApi = reactExports.useMemo(() => agentSkillsBridge(), []);
  const [sessionSkills, setSessionSkills] = reactExports.useState([]);
  const [chips, setChips] = reactExports.useState([]);
  const [chipNotice, setChipNotice] = reactExports.useState(null);
  const [cards, setCards] = reactExports.useState({});
  const [installs, setInstalls] = reactExports.useState({});
  const [noticeDue, setNoticeDue] = reactExports.useState(null);
  const [noticeClosed, setNoticeClosed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void api2.getInit().then((value) => {
      setInit(value);
      setPrefs(value.prefs);
      setFolder(value.prefs.recentFolders[0] ?? "");
    });
    const offs = [
      api2.onEvent(({ sessionId: id2, event }) => {
        if (id2 !== sessionRef.current) return;
        setLog((current) => agentLogWith(current, event));
      }),
      api2.onSkillProposal((payload) => {
        if (payload.sessionId !== sessionRef.current) return;
        setCards((current) => ({ ...current, [payload.proposal.key]: payload }));
        setLog(
          (current) => agentLogWithSkillItem(current, { kind: "skill-card", key: payload.proposal.key })
        );
      }),
      api2.onInstallProposal((payload) => {
        if (payload.sessionId !== sessionRef.current) return;
        setInstalls((current) => ({ ...current, [payload.key]: payload }));
        setLog(
          (current) => agentLogWithSkillItem(current, { kind: "skill-install", key: payload.key })
        );
      })
    ];
    return () => {
      for (const off of offs) off();
    };
  }, [api2]);
  reactExports.useEffect(() => {
    if (!skillsApi) return;
    void skillsApi.agentNotice().then(setNoticeDue, () => setNoticeDue(false));
    return skillsApi.onChanged(() => {
      if (sessionRef.current) setLog((current) => agentLogAfterSkillsChanged(current));
    });
  }, [skillsApi]);
  const lang = init?.lang ?? "en";
  const pickerItems = reactExports.useMemo(
    () => pickerSkillsOf(agentPickerSkillsRaw(sessionSkills), lang, "agent"),
    [sessionSkills, lang]
  );
  const onPickSkill = reactExports.useCallback((item) => {
    setChipNotice(null);
    setChips((current) => withSkillChip(current, skillChipOf(item)));
  }, []);
  const composerSkills = sessionId && pickerItems.length > 0 ? {
    lang,
    items: pickerItems,
    chips,
    notice: chipNotice,
    // the list is the session's own: it does not change while the session runs
    onOpen: () => void 0,
    onPick: onPickSkill,
    onRemove: (id2) => {
      setChipNotice(null);
      setChips((current) => current.filter((chip) => chip.id !== id2));
    },
    onManage: () => void skillsApi?.openSettings()
  } : void 0;
  const picker = useSkillPickerInput({
    skills: composerSkills,
    value: input,
    onChange: setInput,
    textareaRef: inputRef
  });
  const checking = init ? Object.values(init.connections).includes("checking") : false;
  reactExports.useEffect(() => {
    if (!checking) return;
    const timer = setInterval(() => {
      void api2.getInit().then((value) => setInit(value));
    }, 2e3);
    return () => clearInterval(timer);
  }, [api2, checking]);
  reactExports.useEffect(() => {
    logEnd.current?.scrollIntoView({ block: "end" });
  }, [log]);
  reactExports.useEffect(() => {
    folderRef.current = folder;
    setProjectPrefs(null);
    if (!folder) return;
    let current = true;
    void api2.getProjectPrefs(folder).then((value) => {
      if (current) setProjectPrefs(value);
    });
    return () => {
      current = false;
    };
  }, [api2, folder]);
  if (!init || !prefs) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent" });
  const t = (key, params) => agentText(lang, key, params);
  const tw = (key) => agentWebText(lang, key);
  document.documentElement.lang = htmlLang(lang);
  document.documentElement.dir = htmlDir(lang);
  const updatePrefs = (patch) => {
    setPrefs({ ...prefs, ...patch });
    void api2.setPrefs(patch).then((saved) => saved && setPrefs(saved));
  };
  const updateProjectPrefs = (patch) => {
    if (!folder || !projectPrefs) return;
    const chosen = folder;
    setProjectPrefs({ ...projectPrefs, ...patch });
    void api2.setProjectPrefs(chosen, patch).then((saved) => {
      if (saved && chosen === folderRef.current) setProjectPrefs(saved);
    });
  };
  const connection = init.connections[prefs.provider];
  const accepted = prefs.warningAccepted >= AGENT_WARNING_VERSION;
  const canStart = !starting && folder !== "" && accepted && (connection === "ready" || connection === "metered-accepted");
  const start = async () => {
    setStarting(true);
    setStartError(null);
    const result = await api2.start({ provider: prefs.provider, mode: prefs.mode, folder });
    setStarting(false);
    if (!result.ok) {
      setStartError(START_ERROR[result.reason] ?? runErrorKey(result.kind));
      return;
    }
    sessionRef.current = result.sessionId;
    setSessionId(result.sessionId);
    setSessionSkills(result.skills ?? []);
    setChips([]);
    setChipNotice(null);
    setCards({});
    setInstalls({});
    setLog(EMPTY_AGENT_LOG);
  };
  const send = async () => {
    const text = input.trim();
    if (!sessionId || !text || log.busy) return;
    const request = agentSkillRequest(text, chips, sessionSkills);
    if (!request.ok) {
      setChipNotice(skillPickerText(lang, "missingNotice"));
      return;
    }
    setInput("");
    setChips([]);
    setChipNotice(null);
    setLog((current) => agentLogAfterSend(current, text, request.titles));
    const ok = await api2.send(sessionId, request.text);
    if (!ok) setLog((current) => agentLogWith(current, { type: "turn-done", ok: false }));
  };
  const closeNotice = (openSettings) => {
    setNoticeClosed(true);
    void skillsApi?.markAgentNoticeSeen();
    if (openSettings) void skillsApi?.openSettings();
  };
  const notice = agentSkillNoticeShown(noticeDue, noticeClosed) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-notice", role: "status", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: agentSkillsText(lang, "noticeText") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-perm-actions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "agent-btn agent-btn-primary",
          type: "button",
          onClick: () => closeNotice(true),
          children: agentSkillsText(lang, "noticeOpenSettings")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "agent-btn", type: "button", onClick: () => closeNotice(false), children: agentSkillsText(lang, "noticeClose") })
    ] })
  ] }) : null;
  const answer = (id2, allow, scope = "once") => {
    if (!sessionId) return;
    const ids = [id2, ...allow && scope === "session" ? coveredBySessionAllow(log, id2) : []];
    for (const each of ids) {
      setLog((current) => agentLogAfterAnswer(current, each));
      void api2.answer(sessionId, each, allow, scope);
    }
  };
  const stop = () => {
    if (sessionId) void api2.stop(sessionId);
  };
  const reset = () => {
    sessionRef.current = null;
    setSessionId(null);
    setSessionSkills([]);
    setChips([]);
    setChipNotice(null);
    setLog(EMPTY_AGENT_LOG);
    void api2.getInit().then((value) => setInit(value));
  };
  const renderEntry = (entry, index) => {
    switch (entry.kind) {
      case "you":
      case "agent":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-msg", "data-who": entry.kind, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-msg-who", children: t(entry.kind === "you" ? "you" : "agent") }),
          entry.kind === "you" && entry.skills && entry.skills.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-msg-skills", children: entry.skills.map((title, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-msg-skill", dir: "auto", children: title }, i)) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-msg-text", children: entry.text })
        ] }, index);
      case "skills-changed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", role: "status", children: agentSkillsText(lang, "nextSession") }, index);
      case "skill-card": {
        const payload = cards[entry.key];
        return payload ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AgentSkillCard,
          {
            lang,
            payload,
            api: api2,
            skills: skillsApi
          },
          `card-${entry.key}`
        ) : null;
      }
      case "skill-install": {
        const payload = installs[entry.key];
        return payload && skillsApi ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AgentInstallProposal,
          {
            lang,
            address: payload.address,
            skills: skillsApi
          },
          `install-${entry.key}`
        ) : null;
      }
      case "tool": {
        const path = openablePath(entry.action);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-tool", "data-status": entry.status, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-tool-status", children: t(STATUS_LABEL[entry.status]) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: actionLabel(lang, entry.action) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-tool-detail", title: actionDetail(entry.action), children: entry.action.kind === "command" && entry.action.summary || actionDetail(entry.action) }),
          path && entry.status === "done" && entry.action.kind === "write" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "agent-link",
              type: "button",
              onClick: () => void api2.openFile(sessionId ?? "", path),
              children: t("openFile")
            }
          ) : null
        ] }, index);
      }
      case "started":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", children: t(entry.skills === 1 ? "skillsLineOne" : "skillsLine", { n: entry.skills }) }, index);
      case "turn-failed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", children: t("turnFailed") }, index);
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-error", role: "alert", children: t(runErrorKey(entry.errorKind)) }, index);
      case "ended":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", children: t("ended") }, index);
    }
  };
  if (sessionId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent", "data-busy": log.busy, "data-ended": log.ended, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "agent-title", children: t("windowTitle") }),
        log.ended ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "agent-btn", type: "button", onClick: reset, children: t("newSession") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "agent-btn", type: "button", onClick: stop, children: t("stop") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-body", children: [
        notice,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-system", children: t("startedLine", { program: t(PROVIDER_LABEL[prefs.provider]), folder }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-log", children: log.entries.map(renderEntry) }),
        log.pending.map((request) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-perm", role: "alertdialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: t("permTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: request.action.kind === "command" ? t("permCommand") : request.action.kind === "write" ? t("permWrite") : request.action.kind === "read" ? t("permRead") : agentWebPermissionLabel(request.action) ? tw(agentWebPermissionLabel(request.action)) : t("permOther", { tool: request.action.tool }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "agent-perm-detail", children: actionDetail(request.action) }),
          request.action.reason ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: t("permReason", { reason: request.action.reason }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-perm-actions", children: agentPermissionChoices(request.action).map(
            (choice) => choice === "deny" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "agent-btn",
                type: "button",
                onClick: () => answer(request.id, false),
                children: t("permDeny")
              },
              choice
            ) : choice === "allow-session" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "agent-btn",
                type: "button",
                onClick: () => answer(request.id, true, "session"),
                children: tw(agentSessionAllowLabel(request.action))
              },
              choice
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "agent-btn agent-btn-primary",
                type: "button",
                onClick: () => answer(request.id, true),
                children: t("permAllow")
              },
              choice
            )
          ) })
        ] }, request.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: logEnd })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-foot", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-input-wrap", children: [
          picker.chipRow,
          picker.popup,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              ref: inputRef,
              className: "agent-input",
              value: input,
              placeholder: t("inputPlaceholder"),
              disabled: log.ended,
              ...picker.inputProps,
              onChange: (event) => {
                setInput(event.target.value);
                picker.track(event.target);
              },
              onSelect: (event) => picker.track(event.currentTarget),
              onCompositionStart: picker.onCompositionStart,
              onCompositionEnd: picker.onCompositionEnd,
              onBlur: picker.onBlur,
              onKeyDown: (event) => {
                if (picker.onKeyDown(event)) return;
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  void send();
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-foot-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "agent-btn agent-btn-primary",
            type: "button",
            disabled: log.ended || log.busy || !input.trim(),
            onClick: () => void send(),
            children: t("send")
          }
        ) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-head", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "agent-title", children: t("windowTitle") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-body", children: [
      notice,
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "agent-intro", children: t("intro") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: t("folderLabel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-folder", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-folder-path", title: folder, children: folder || t("folderNone") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "agent-btn",
              type: "button",
              onClick: () => void api2.pickFolder().then((picked) => picked && setFolder(picked)),
              children: t("folderPick")
            }
          )
        ] }),
        prefs.recentFolders.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-recent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: t("recentLabel") }),
          prefs.recentFolders.map((recent) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "agent-link",
              type: "button",
              title: recent,
              onClick: () => setFolder(recent),
              children: recent
            },
            recent
          ))
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-section", role: "radiogroup", "aria-label": t("providerLabel"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: t("providerLabel") }),
        AGENT_PROVIDERS.map((provider) => {
          const note = CONNECTION_NOTE[init.connections[provider]];
          const blocked = init.connections[provider] === "blocked";
          const choose = () => {
            if (!blocked) updatePrefs({ provider });
          };
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "agent-choice",
              role: "radio",
              tabIndex: blocked ? -1 : 0,
              "aria-checked": prefs.provider === provider,
              "aria-disabled": blocked,
              "data-selected": prefs.provider === provider,
              onClick: choose,
              onKeyDown: (event) => event.key === " " && choose(),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-choice-text", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(PROVIDER_LABEL[provider]) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: provider === "codex" ? tw("providerCodexNoteWeb") : t(PROVIDER_NOTE[provider]) }),
                note ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: t(note) }) : null
              ] })
            },
            provider
          );
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-section", role: "radiogroup", "aria-label": t("modeLabel"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: t("modeLabel") }),
        AGENT_MODES.map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "agent-choice",
            role: "radio",
            tabIndex: 0,
            "aria-checked": prefs.mode === mode,
            "data-selected": prefs.mode === mode,
            onClick: () => updatePrefs({ mode }),
            onKeyDown: (event) => event.key === " " && updatePrefs({ mode }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-choice-text", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(MODE_LABEL[mode][0]) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: t(MODE_LABEL[mode][1]) })
            ] })
          },
          mode
        ))
      ] }),
      prefs.provider === "codex" && folder && projectPrefs ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-section", role: "radiogroup", "aria-label": tw("codexWebLabel"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: tw("codexWebLabel") }),
          AGENT_CODEX_WEB_SEARCH.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "agent-choice",
              role: "radio",
              tabIndex: 0,
              "aria-checked": projectPrefs.codexWebSearch === value,
              "data-selected": projectPrefs.codexWebSearch === value,
              onClick: () => updateProjectPrefs({ codexWebSearch: value }),
              onKeyDown: (event) => event.key === " " && updateProjectPrefs({ codexWebSearch: value }),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-choice-text", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tw(WEB_SEARCH_LABEL[value]) }) })
            },
            value
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: tw("codexWebNote") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-section", role: "radiogroup", "aria-label": tw("codexNetworkLabel"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-label", children: tw("codexNetworkLabel") }),
          [false, true].map((on) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "agent-choice",
              role: "radio",
              tabIndex: 0,
              "aria-checked": projectPrefs.codexNetwork === on,
              "data-selected": projectPrefs.codexNetwork === on,
              onClick: () => updateProjectPrefs({ codexNetwork: on }),
              onKeyDown: (event) => event.key === " " && updateProjectPrefs({ codexNetwork: on }),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-choice-text", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tw(on ? "codexNetworkOn" : "codexNetworkOff") }) })
            },
            String(on)
          )),
          codexNetworkWarningShown(projectPrefs) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-notice", role: "alert", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: tw("codexNetworkWarning") }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", children: tw("codexFolderNote") })
        ] })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-notice", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t("warningTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("warningCommands") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("warningRedaction") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("warningUsage") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: accepted,
              onChange: (event) => updatePrefs({ warningAccepted: event.target.checked ? AGENT_WARNING_VERSION : 0 })
            }
          ),
          " ",
          t("warningAccept")
        ] })
      ] }),
      startError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "agent-error", role: "alert", children: t(startError) }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "agent-foot", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "agent-choice-note", style: { flex: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "agent-btn agent-btn-primary",
          type: "button",
          disabled: !canStart,
          onClick: () => void start(),
          children: starting ? t("starting") : t("start")
        }
      )
    ] })
  ] });
}
function applyTheme(theme) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}
const api = window.aiOfficeAgentWindow;
void api.getTheme().then((theme) => {
  applyTheme(theme);
  api.onThemeChanged(applyTheme);
  clientExports.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AgentWindow, {}) })
  );
});
