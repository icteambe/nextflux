import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EyeOff, FilePen, Search, Trash2, TriangleAlert } from "lucide-react";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { categories, feeds, unreadCounts } from "@/stores/feedsStore.js";
import {
  currentFeedId,
  editFeedModalOpen,
  feedsOverviewOpen,
  unsubscribeModalOpen,
} from "@/stores/modalStore.js";
import { groupFeedsForOverview } from "@/domain/feeds/feedsOverview.js";

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url || "";
  }
}

// Feedly's "Feeds" page: every subscription, whatever its unread count.
export default function FeedsOverviewModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = useStore(feedsOverviewOpen);
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const $unreadCounts = useStore(unreadCounts);
  const [query, setQuery] = useState("");
  const groups = useMemo(
    () => groupFeedsForOverview($feeds, $categories, query),
    [$feeds, $categories, query],
  );
  const close = () => {
    feedsOverviewOpen.set(false);
    setQuery("");
  };
  const openFeed = (feed) => {
    close();
    navigate(`/feed/${feed.id}`);
  };
  const editFeed = (feed) => {
    currentFeedId.set(String(feed.id));
    editFeedModalOpen.set(true);
  };
  const unsubscribe = (feed) => {
    currentFeedId.set(String(feed.id));
    unsubscribeModalOpen.set(true);
  };
  return (
    <CustomModal
      open={open}
      onOpenChange={close}
      fixedHeight
      className="sm:max-w-2xl"
      title={t("sidebar.allFeeds", { count: $feeds.length })}
    >
      <div className="sticky top-0 z-10 bg-popover px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sidebar.searchFeeds")}
            className="pl-9"
          />
        </div>
      </div>
      <div className="px-4 pb-4">
        {groups.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("sidebar.noFeedsFound")}
          </p>
        )}
        {groups.map((group) => (
          <section key={group.id} className="mb-4">
            <h3 className="mb-1 flex items-baseline gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
              <span className="font-normal opacity-70">
                {group.feeds.length}
              </span>
            </h3>
            <ul className="divide-y rounded-xl border">
              {group.feeds.map((feed) => {
                const unread = $unreadCounts[feed.id] || 0;
                return (
                  <li
                    key={feed.id}
                    className="group flex items-center gap-3 px-3 py-2 hover:bg-muted/50"
                  >
                    <FeedIcon feedId={feed.id} />
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer text-left"
                      onClick={() => openFeed(feed)}
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
                          className={
                            unread > 0
                              ? "truncate text-sm font-semibold"
                              : "truncate text-sm text-muted-foreground"
                          }
                        >
                          {feed.title}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {hostOf(feed.site_url || feed.url)}
                      </span>
                    </button>
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
    </CustomModal>
  );
}
