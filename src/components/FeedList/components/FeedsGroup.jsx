import { useStore } from "@nanostores/react";
import { feedsByCategory } from "@/stores/feedsStore.js";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import FeedsGroupContent from "@/components/FeedList/components/FeedsGroupContent.jsx";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { feeds } from "@/stores/feedsStore.js";
const FeedsGroup = () => {
  const { t } = useTranslation();
  const $feedsByCategory = useStore(feedsByCategory);
  const $feeds = useStore(feeds);
  const { isMobile, setOpenMobile } = useSidebar();
  const onFeedsPage = useLocation().pathname === "/feeds";
  return (
    <SidebarGroup>
      {/* Like Feedly's "Feeds" entry: the page listing every subscription. */}
      <SidebarGroupLabel
        render={
          <Link
            to="/feeds"
            className={cn(
              "group/feeds w-full gap-1 hover:text-foreground",
              onFeedsPage && "text-foreground",
            )}
            title={t("sidebar.allFeeds", { count: $feeds.length })}
            onClick={() => isMobile && setOpenMobile(false)}
          />
        }
      >
        {t("common.feed")}
        <ChevronRight
          className={cn(
            "transition-opacity group-hover/feeds:opacity-60",
            onFeedsPage ? "opacity-60" : "opacity-0",
          )}
        />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {$feedsByCategory.map((category) => (
            <FeedsGroupContent key={category.id} category={category} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FeedsGroup;
