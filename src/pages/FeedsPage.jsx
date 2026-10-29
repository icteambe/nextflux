import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EyeOff, FilePen, Search, Trash2, TriangleAlert } from "lucide-react";
import ReadingLayout from "@/components/ReadingLayout.jsx";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar.jsx";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { categories, feeds, unreadCounts } from "@/stores/feedsStore.js";
import {
  currentFeedId,
  editFeedModalOpen,
  unsubscribeModalOpen,
} from "@/stores/modalStore.js";
import { groupFeedsForOverview } from "@/domain/feeds/feedsOverview.js";
import { cn } from "@/lib/utils";

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

// Feedly's "Feeds" page, shown in the main pane: every subscription,
// whatever its unread count.
export default function FeedsPage() {
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const $unreadCounts = useStore(unreadCounts);
  const [query, setQuery] = useState("");
  const groups = useMemo(
    () => groupFeedsForOverview($feeds, $categories, query),
    [$feeds, $categories, query],
  );
  const editFeed = (feed) => {
    currentFeedId.set(String(feed.id));
    editFeedModalOpen.set(true);
  };
  const unsubscribe = (feed) => {
    currentFeedId.set(String(feed.id));
    unsubscribeModalOpen.set(true);
  };
  return (
    <ReadingLayout reader={null}>
      <div className="article-list-panel relative flex h-dvh w-full min-w-0 flex-col overflow-hidden">
        <div className="z-10 px-2">
          <div className="article-list-header w-full border-b py-2 standalone:pt-safe-or-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="rounded-full" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {t("common.feed")}
                </span>
                <span className="truncate text-xs text-muted-foreground opacity-60">
                  {t("sidebar.allFeeds", { count: $feeds.length })}
                </span>
              </div>
              <div className="relative w-56 max-sm:w-40">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("sidebar.searchFeeds")}
                  className="h-8 pl-9"
                />
              </div>
            </div>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto w-full max-w-3xl p-4">
            {groups.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("sidebar.noFeedsFound")}
              </p>
            )}
            {groups.map((group) => (
              <section key={group.id} className="mb-5">
                <h3 className="mb-1 flex items-baseline gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                  <span className="font-normal opacity-70">
                    {group.feeds.length}
                  </span>
                </h3>
                <ul className="divide-y rounded-xl border bg-popover/40">
                  {group.feeds.map((feed) => {
                    const unread = $unreadCounts[feed.id] || 0;
                    return (
                      <li
                        key={feed.id}
                        className="group flex items-center gap-3 px-3 py-2 hover:bg-popover/70"
                      >
                        <FeedIcon feedId={feed.id} />
                        <Link
                          to={`/feed/${feed.id}`}
                          className="min-w-0 flex-1"
                          onClick={() => isMobile && setOpenMobile(false)}
                        >
                          <span className="flex items-center gap-1.5">
                            {feed.parsing_error_count > 0 && (
                              <TriangleAlert
                                className="size-3.5 shrink-0 text-warning"
                                aria-label={t("sidebar.feedError")}
                              />
                            )}
                            {feed.hide_globally && (
                              <EyeOff
                                className="size-3.5 shrink-0 text-muted-foreground"
                                aria-label={t("sidebar.hiddenFeed")}
                              />
                            )}
                            <span
                              className={cn(
                                "truncate text-sm",
                                unread > 0
                                  ? "font-semibold"
                                  : "text-muted-foreground",
                              )}
                            >
                              {feed.title}
                            </span>
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {hostOf(feed.site_url || feed.url)}
                          </span>
                        </Link>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {unread > 0 && unread}
                        </span>
                        <div className="flex shrink-0 gap-0.5 opacity-60 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("articleList.editFeed")}
                            title={t("articleList.editFeed")}
                            onClick={() => editFeed(feed)}
                          >
                            <FilePen className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("articleList.unsubscribe")}
                            title={t("articleList.unsubscribe")}
                            className="text-destructive"
                            onClick={() => unsubscribe(feed)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </ScrollArea>
      </div>
    </ReadingLayout>
  );
}
