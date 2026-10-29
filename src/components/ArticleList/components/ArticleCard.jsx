import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuTrigger,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useNavigate, useParams } from "react-router-dom";
import { Ripple } from "@/components/ui/ripple";
import { Clock, ArrowUpFromLine, Star, Circle, CircleDot } from "lucide-react";
import {
  cleanTitle,
  cn,
  extractFirstImage,
  extractTextFromHtml,
} from "@/lib/utils";
import { formatPublishDate } from "@/lib/format";
import ArticleCardCover from "./ArticleCardCover.jsx";
import {
  handleMarkStatus,
  handleMarkAboveAsRead,
} from "@/handlers/articleHandlers.js";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@nanostores/react";
import { settingsState } from "@/stores/settingsStore";
import { feeds } from "@/stores/feedsStore";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { useTranslation } from "react-i18next";
import InlineArticle from "./InlineArticle.jsx";
import { cursorArticleId } from "@/stores/readingListStore.js";
export default function ArticleCard({ article }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const cardRef = useRef(null);
  const $feeds = useStore(feeds);
  const $cursorArticleId = useStore(cursorArticleId);
  const {
    listLayout,
    listDensity,
    markAsReadOnScroll,
    cardImageSize,
    showFavicon,
    showReadingTime,
    textPreviewLines,
    titleLines,
  } = useStore(settingsState);
  const hasBeenVisible = useRef(false);
  const imageUrl = useMemo(() => extractFirstImage(article), [article]);
  const feedTitle = useMemo(() => {
    const feed = $feeds.find((f) => f.id === article.feedId);
    return feed?.title || article.feedId;
  }, [article.feedId, $feeds]);
  const previewContent = useMemo(
    () => extractTextFromHtml(article.content).slice(0, 300),
    [article.content],
  );
  useEffect(() => {
    // 如果文章已读或未启用滚动标记已读,则不需要观察
    // The compact list marks on scroll at the list level (ArticleListContent).
    if (
      article.status === "read" ||
      !markAsReadOnScroll ||
      listLayout === "feedly"
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardRect = entry.boundingClientRect;
          const rootRect = entry.rootBounds;

          // 当文章进入视口时记录状态
          if (entry.isIntersecting) {
            hasBeenVisible.current = true;
          }
          // 只有当卡片完全在视口顶部以上,且之前显示过时才标记已读
          else if (hasBeenVisible.current && cardRect.top < rootRect.top) {
            // console.log(cardRect.bottom, rootRect.top, '标记已读');
            handleMarkStatus(article);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // 设置根元素为滚动容器
        root: cardRef.current?.closest('[data-slot="scroll-area-viewport"]'),
        // 设置阈值为0,表示完全离开视口时触发
        threshold: 0.2,
      },
    );
    const card = cardRef.current;
    if (card) {
      observer.observe(card);
    }
    return () => {
      if (card) {
        observer.unobserve(card);
      }
    };
  }, [article, markAsReadOnScroll, listLayout]);
  const handleArticleClick = async (article) => {
    const basePath = window.location.pathname.split("/article/")[0];
    const toUrl =
      basePath === "/"
        ? `/article/${article.id}`
        : `${basePath}/article/${article.id}`;
    cursorArticleId.set(article.id);
    navigate(toUrl);
    if (article.status !== "read") {
      await handleMarkStatus(article);
    }
  };
  const handleClick = () => {
    handleArticleClick(article);
  };
  const isActive = parseInt(articleId) === article.id;
  const isCursor = !isActive && $cursorArticleId === article.id;
  useEffect(() => {
    if (isCursor)
      cardRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [isCursor]);
  const isRead = article.status === "read";
  const compact = listLayout === "feedly";
  const card = compact ? (
    // Feedly-style row: source, title and time on one line; the article body
    // expands underneath when the row is active.
    <div
      ref={cardRef}
      className="article-row contain-content"
      data-article-id={article.id}
      data-active={isActive || undefined}
    >
      <div
        className={cn(
          "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2",
          listDensity === "compact"
            ? "py-0.5"
            : listDensity === "comfortable"
              ? "py-2.5"
              : "py-1.5",
          "transform-gpu transition-background duration-200 hover:bg-popover/70",
          isActive && "bg-popover/70",
          isCursor && "ring-1 ring-inset ring-border",
        )}
        onClick={handleClick}
      >
        <Ripple />
        {showFavicon && <FeedIcon feedId={article.feedId} />}
        <span
          className={cn(
            "w-32 shrink-0 truncate text-xs font-semibold text-muted-foreground max-sm:hidden",
            isRead && article.starred === 0 && "opacity-50",
          )}
        >
          {feedTitle}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            isRead ? "text-muted-foreground" : "font-semibold text-foreground",
            isRead && article.starred === 0 && "opacity-70",
          )}
        >
          {cleanTitle(article.title)}
        </span>
        {article.starred === 1 && (
          <Star className="size-3 shrink-0 fill-current text-muted-foreground" />
        )}
        <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
          {formatPublishDate(article.published_at)}
        </span>
      </div>
      {isActive && (
        <InlineArticle articleId={article.id} listArticle={article} />
      )}
    </div>
  ) : (
    <div
      ref={cardRef}
      className={cn(
        "cursor-pointer select-none overflow-hidden p-2 rounded-xl",
        "relative transform-gpu transition-background duration-200",
        "bg-transparent contain-content",
        "hover:bg-popover/70",
        isActive && "bg-popover/70 shadow-custom",
      )}
      data-article-id={article.id}
      onClick={handleClick}
    >
      <Ripple />
      <div
        className={cn(
          "card-content flex flex-col gap-1 [&_.card-meta]:transition-opacity [&_.card-title]:transition-opacity [&_.card-reading-time]:transition-opacity [&_.card-preview]:transition-opacity",
          article.status === "read" &&
            article.starred === 0 &&
            "[&_.card-meta]:opacity-50 [&_.card-title]:opacity-50 [&_.card-reading-time]:opacity-50 [&_.card-preview]:opacity-50 [&_.card-image-content]:opacity-50",
        )}
      >
        <div className="card-header flex flex-col gap-1">
          <div className="card-meta flex items-start justify-between gap-1">
            <div className="card-source flex items-center flex-1 gap-1 min-w-0">
              <div className="card-source-content flex gap-1 items-center min-w-0">
                {showFavicon && <FeedIcon feedId={article.feedId} />}
                <span className="card-source-title text-muted-foreground font-bold text-xs line-clamp-1">
                  {feedTitle}
                </span>
              </div>
            </div>
            <div className="card-time-wrapper flex items-center gap-1 text-xs text-muted-foreground">
              <span className="card-star">
                <Star
                  className="size-3 fill-current"
                  style={{
                    opacity: article.starred === 1 ? 1 : 0,
                  }}
                />
              </span>
              <span className="card-time whitespace-nowrap">
                {formatPublishDate(article.published_at)}
              </span>
            </div>
          </div>
          <div className="card-content-body flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <h3
                className={cn(
                  "card-title text-base font-semibold text-wrap break-words",
                  article.status === "read"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
                style={{
                  wordBreak: "break-word",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: titleLines === 0 ? "none" : titleLines,
                }}
              >
                {cleanTitle(article.title)}
              </h3>
              {showReadingTime && (
                <div className="card-reading-time text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  <span className="line-clamp-1">
                    {article.reading_time === 0
                      ? t("common.lessThanAMinute")
                      : `${article.reading_time} ${t("common.minute")}`}
                  </span>
                </div>
              )}
              {textPreviewLines !== 0 && (
                <span
                  className={cn(
                    "card-preview text-sm text-muted-foreground text-wrap break-words w-full max-w-full overflow-hidden",
                  )}
                  style={{
                    wordBreak: "break-word",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: textPreviewLines,
                  }}
                >
                  {previewContent}
                </span>
              )}
              {cardImageSize === "large" && (
                <ArticleCardCover imageUrl={imageUrl} />
              )}
            </div>
            {cardImageSize === "small" && (
              <ArticleCardCover imageUrl={imageUrl} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <ContextMenu>
      <>
        <ContextMenuTrigger render={card} />

        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                handleMarkAboveAsRead(article.id);
              }}
            >
              {<ArrowUpFromLine className="size-4 text-muted-foreground" />}
              {t("common.markAboveAsRead")}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                handleMarkStatus(article);
              }}
            >
              {article.status === "read" ? (
                <CircleDot className="size-4 text-muted-foreground p-0.5 fill-current" />
              ) : (
                <Circle className="size-4 text-muted-foreground p-0.5" />
              )}
              {article.status === "read"
                ? t("common.markAsUnread")
                : t("common.markAsRead")}
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </>
    </ContextMenu>
  );
}
