import { useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import {
  Circle,
  CircleDot,
  ExternalLink,
  FileText,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import ArticleHeader from "@/components/ArticleView/components/ArticleHeader.jsx";
import ArticleBody from "@/components/ArticleView/components/ArticleBody.jsx";
import ArticleLoading from "@/components/ArticleView/components/ArticleLoading.jsx";
import "@/components/ArticleView/ArticleView.css";
import { useActiveArticle } from "@/hooks/useActiveArticle.js";
import {
  handleMarkStatus,
  handleToggleContent,
  handleToggleStar,
} from "@/handlers/articleHandlers.js";
import { activeArticle, loadingOriginContent } from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore";
import { getArticleBasePath } from "@/domain/articles/articleNavigation.js";

function Action({ label, shortcut, onClick, disabled, children }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full gap-1 text-muted-foreground"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      <span className="max-sm:hidden">{label}</span>
      {shortcut && <Kbd className="max-sm:hidden">{shortcut}</Kbd>}
    </Button>
  );
}

// The article body rendered under its row in the compact list, Feedly-style.
export default function InlineArticle({ articleId, listArticle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, loading } = useActiveArticle(String(articleId));
  const stored = useStore(activeArticle);
  const fetchLoading = useStore(loadingOriginContent);
  const article = stored?.id === articleId ? stored : listArticle;
  const {
    lineHeight,
    fontSize,
    maxWidth,
    alignJustify,
    fontFamily,
    titleFontSize,
    titleAlignType,
  } = useStore(settingsState);
  const close = () => navigate(getArticleBasePath(window.location.pathname));
  return (
    <div
      className="inline-article article-reader-panel mb-2 rounded-xl bg-popover shadow-custom"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b bg-popover/90 px-2 py-1 backdrop-blur">
        <Action
          label={t("sidebar.shortcuts.close")}
          shortcut="O"
          onClick={close}
        >
          <X className="size-4" />
        </Action>
        <Action
          label={
            article?.status === "read" ? t("common.unread") : t("common.read")
          }
          shortcut="M"
          onClick={() => handleMarkStatus(article)}
          disabled={!article}
        >
          {article?.status === "unread" ? (
            <CircleDot className="size-4 fill-current p-0.5" />
          ) : (
            <Circle className="size-4 p-0.5" />
          )}
        </Action>
        <Action
          label={t("common.star")}
          shortcut="S"
          onClick={() => handleToggleStar(article)}
          disabled={!article}
        >
          <Star
            className={
              article?.starred === 1 ? "size-4 fill-current" : "size-4"
            }
          />
        </Action>
        <Action
          label={t("sidebar.shortcuts.toggleReaderView")}
          shortcut="G"
          onClick={() => handleToggleContent(article)}
          disabled={!article || fetchLoading}
        >
          {fetchLoading ? <Spinner /> : <FileText className="size-4" />}
        </Action>
        <Action
          label={t("sidebar.shortcuts.viewInBrowser")}
          shortcut="V"
          onClick={() => article && window.open(article.url, "_blank")}
          disabled={!article}
        >
          <ExternalLink className="size-4" />
        </Action>
      </div>
      {error ? (
        <div role="alert" className="p-5 text-muted-foreground">
          {error}
        </div>
      ) : article ? (
        <div
          className="article-view-content mx-auto w-full px-5 pt-5 pb-8"
          style={{ maxWidth: `${maxWidth}ch`, fontFamily }}
        >
          <ArticleHeader
            article={article}
            fontSize={fontSize}
            titleAlignType={titleAlignType}
            titleFontSize={titleFontSize}
          />
          <ArticleBody
            article={article}
            alignJustify={alignJustify}
            fontSize={fontSize}
            lineHeight={lineHeight}
          />
        </div>
      ) : loading ? (
        <ArticleLoading />
      ) : null}
    </div>
  );
}
