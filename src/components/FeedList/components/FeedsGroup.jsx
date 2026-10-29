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
import { feedsOverviewOpen } from "@/stores/modalStore.js";
import { feeds } from "@/stores/feedsStore.js";
const FeedsGroup = () => {
  const { t } = useTranslation();
  const $feedsByCategory = useStore(feedsByCategory);
  const $feeds = useStore(feeds);
  return (
    <SidebarGroup>
      {/* Like Feedly's "Feeds" entry: opens the list of every subscription. */}
      <SidebarGroupLabel
        render={
          <button
            type="button"
            className="group/feeds w-full cursor-pointer gap-1 hover:text-foreground"
            title={t("sidebar.allFeeds", { count: $feeds.length })}
            onClick={() => feedsOverviewOpen.set(true)}
          />
        }
      >
        {t("common.feed")}
        <ChevronRight className="opacity-0 transition-opacity group-hover/feeds:opacity-60" />
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
