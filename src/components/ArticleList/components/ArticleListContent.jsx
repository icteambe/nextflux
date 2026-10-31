import { Button } from "@/components/ui/button";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ArticleCard from "./ArticleCard";
import { useParams } from "react-router-dom";
import {
  filter,
  hasMore,
  currentPage,
  loadingMore,
  loading,
  visibleRange,
} from "@/stores/articlesStore.js";
import { useStore } from "@nanostores/react";
import { Virtuoso } from "react-virtuoso";
import { useIsMedium } from "@/hooks/use-mobile.jsx";
import { CheckCheck, Loader2 } from "lucide-react";
import {
  handleMarkAllRead,
  handleMarkScrolledPastAsRead,
} from "@/handlers/articleHandlers";
import {
  getScrolledPastIds,
  getVisibleIds,
} from "@/domain/articles/scrollRead.js";
import { pinRowToTop } from "@/domain/articles/pinRow.js";
import { isSyncing } from "@/stores/syncStore.js";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.js";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";
import { settingsState } from "@/stores/settingsStore.js";
const ArticleItem = memo(({ article, isLast, compact }) => (
  <div className={cn("mx-auto w-full px-2", !compact && "max-w-[560px]")}>
    <ArticleCard article={article} />
    {!isLast && !compact && <div className="h-4" />}
  </div>
));
ArticleItem.displayName = "ArticleItem";
const ListHeader = () => <div className="vlist-header h-2" />;
function ListFooter({
  context: { feedId, categoryId, $filter, $isSyncing, $loadingMore, compact },
}) {
  const { t } = useTranslation();
  return (
    // In the compact list the footer fills most of the viewport (Feedly's
    // "all done" area) so the last rows can still be pinned to the top.
    <div
      className={cn(
        "vlist-footer mx-auto w-full max-w-[560px] px-2 pt-2",
        compact ? "min-h-[calc(100dvh-9rem)]" : "h-24",
      )}
    >
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        disabled={$filter === "starred"}
        onClick={() =>
          handleMarkAllRead(
            feedId ? "feed" : categoryId ? "category" : "all",
            feedId || categoryId,
          )
        }
      >
        {$isSyncing || $loadingMore ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <CheckCheck data-icon="inline-start" />
        )}
        {t("articleList.markAllRead")}
      </Button>
    </div>
  );
}
const listComponents = { Header: ListHeader, Footer: ListFooter };
export default function ArticleListContent({
  articles,
  setVisibleRange,
  virtuosoRef,
}) {
  const { feedId, categoryId, articleId } = useParams();
  const $filter = useStore(filter);
  const $isSyncing = useStore(isSyncing);
  const isMedium = useIsMedium();
  const index = articles.findIndex(
    (article) => article.id === parseInt(articleId),
  );
  const $hasMore = useStore(hasMore);
  const $loading = useStore(loading);
  const $loadingMore = useStore(loadingMore);
  const { listLayout, markAsReadOnScroll } = useStore(settingsState);
  const compact = listLayout === "feedly";
  // Compact rows are virtualized, so per-row observers miss rows that scroll
  // out. Instead remember which rows were on screen and mark those that have
  // moved above the viewport (Feedly's title-only behaviour). Tracking ids
  // rather than indexes keeps a shrinking list or a programmatic jump from
  // marking rows the reader never saw.
  const $visibleRange = useStore(visibleRange);
  const previousVisibleIds = useRef([]);
  // Index the list was last told to jump to; range reports until the jump
  // lands (which react-virtuoso delivers with a delay) are not user scrolling.
  const pendingJump = useRef(null);
  // True while the opened row is being pinned to the top (see pinRowToTop).
  const pinning = useRef(false);
  useEffect(() => {
    if ($loading) {
      previousVisibleIds.current = [];
      return;
    }
    const visibleIds = getVisibleIds(articles, $visibleRange);
    const jump = pendingJump.current;
    const suppressed =
      jump !== null &&
      Date.now() - jump.at < 3000 &&
      $visibleRange.startIndex !== jump.index;
    if (jump !== null && !suppressed) pendingJump.current = null;
    if (compact && markAsReadOnScroll && jump === null && !pinning.current) {
      const passed = getScrolledPastIds(
        previousVisibleIds.current,
        articles,
        $visibleRange.startIndex,
      );
      if (passed.length) handleMarkScrolledPastAsRead(passed);
    }
    previousVisibleIds.current = visibleIds;
  }, [$visibleRange, compact, markAsReadOnScroll, articles, $loading]);
  const reduceMotion = useReducedMotion();
  const [scrollViewport, setScrollViewport] = useState(null);
  useEffect(() => {
    if (isMedium) {
      return;
    }
    if (index < 0) return;
    if (compact) {
      // The opened row expands underneath itself, so pin it to the top like
      // Feedly does; a smooth scroll would land wrong once the body loads.
      // Rows that slide above the viewport by this jump are not "scrolled past".
      pendingJump.current = { index, at: Date.now() };
      virtuosoRef.current?.scrollToIndex({
        index,
        align: "start",
        behavior: "auto",
      });
      // The previous article collapsing above shifts everything; correct
      // against the DOM until the row really sits at the top.
      if (!scrollViewport) return;
      const id = articles[index]?.id;
      pinning.current = true;
      const cancel = pinRowToTop(
        scrollViewport,
        () => scrollViewport.querySelector(`[data-article-id="${id}"]`),
        {
          onDone: () => {
            pinning.current = false;
          },
        },
      );
      return () => {
        cancel();
        pinning.current = false;
      };
    }
    virtuosoRef.current?.scrollIntoView({
      index: index,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    // `articles` is read for the row id only; a list update must not re-pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMedium, index, compact, reduceMotion, virtuosoRef, scrollViewport]);
  const handleEndReached = () => {
    if (!$hasMore || loadingMore.get()) return;
    loadingMore.set(true);
    currentPage.set(currentPage.get() + 1);
  };
  const context = useMemo(
    () => ({
      feedId,
      categoryId,
      $filter,
      $isSyncing,
      $loadingMore,
      compact,
    }),
    [feedId, categoryId, $filter, $isSyncing, $loadingMore, compact],
  );
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      {$loading ? (
        <Loader2 className="size-4 animate-spin mx-auto mt-3 text-primary" />
      ) : (
        <ScrollArea
          viewportRef={setScrollViewport}
          className={cn(
            "motion-sensitive article-list-content h-full",
            reduceMotion
              ? ""
              : " animate-in duration-400 fade-in slide-in-from-bottom-12 ease-in-out",
          )}
        >
          {scrollViewport && (
            <Virtuoso
              ref={virtuosoRef}
              className="v-list"
              customScrollParent={scrollViewport}
              overscan={{
                main: 2,
                reverse: 0,
              }}
              data={articles}
              rangeChanged={setVisibleRange}
              context={context}
              computeItemKey={(_, article) => article.id}
              totalCount={articles.length}
              endReached={handleEndReached}
              components={listComponents}
              itemContent={(index, article) => (
                <ArticleItem
                  key={article.id}
                  article={article}
                  isLast={index === articles.length - 1}
                  compact={compact}
                />
              )}
            />
          )}
        </ScrollArea>
      )}
    </div>
  );
}
