export const settingsDefaults = {
  forkDefaults: 2, // bumped when the fork changes a default (see settingsStore)
  lineHeight: 1.8,
  fontSize: 16,
  maxWidth: 65, // 单位为ch
  alignJustify: false,
  fontFamily: "system-ui",
  titleFontSize: 1.6, // 标题相对于正文大小的倍数
  titleAlignType: "left",
  feedIconShape: "square", // circle, square
  useGrayIcon: false,
  sortDirection: "desc", // asc, desc
  sortField: "published_at", // published_at, created_at
  showHiddenFeeds: false,
  markAsReadOnScroll: true,
  useThirdPartyMediaPlayer: false,
  listLayout: "feedly", // cards, feedly (compact rows, article opens inline)
  listDensity: "cozy", // compact, cozy, comfortable (feedly layout row height)
  hideEmptyFeeds: true, // sidebar: hide feeds without unread articles
  cardImageSize: "large", // none, small, large
  showFavicon: true,
  titleLines: 2,
  textPreviewLines: 2,
  showReadingTime: true,
  autoHideToolbar: false,
  showReadingRail: false,
  syncInterval: "15", // 添加同步间隔设置，默认15分钟
  showLineNumbers: false,
  forceDarkCodeTheme: false,
  defaultExpandCategory: false, // 默认展开分类
  showUnreadByDefault: false, // superseded by startPage, kept for old settings
  startPage: "unread", // all, unread, starred, firstCategory ("" = legacy switch)
  reduceMotion: false,
  interfaceFontSize: "16",
  aiApiKey: "",
  aiBaseUrl: "https://api.openai.com/v1",
  aiModel: "gpt-4o-mini",
  aiPrompt:
    "You are a helpful assistant that summarizes articles concisely. Provide a clear, structured summary in the same language as the article. Format: just plain text, no markdown.",
};
