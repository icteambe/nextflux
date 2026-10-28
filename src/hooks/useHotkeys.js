import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import {
  activeArticle,
  filteredArticles,
  imageGalleryActive,
} from "@/stores/articlesStore";
import {
  handleMarkStatus,
  handleToggleStar,
  handleToggleContent,
} from "@/handlers/articleHandlers";
import { forceSync } from "@/stores/syncStore";
import { searchDialogOpen, addFeedModalOpen } from "@/stores/modalStore.js";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import {
  cursorArticleId,
  markAllReadConfirmOpen,
} from "@/stores/readingListStore.js";
import { filter } from "@/stores/articleFilterStore.js";

export function useHotkeys() {
  const navigate = useNavigate();
  const $articles = useStore(filteredArticles);
  const $activeArticle = useStore(activeArticle);
  const $imageGalleryActive = useStore(imageGalleryActive);
  const { articleId } = useParams();
  const { navigateToPrevious, navigateToNext, toggleCurrentCategory } =
    useSidebarNavigation();

  // 获取当前文章在列表中的索引
  const currentIndex = $articles.findIndex((a) => a.id === $activeArticle?.id);

  const basePath = window.location.pathname
    .split("/article/")[0]
    .replace(/\/$/, "");

  useEffect(() => {
    const handleKeyDown = async (e) => {
      // 如果焦点在输入框中,不触发快捷键
      if (
        e.defaultPrevented ||
        e.target.closest?.(".article-media-player") ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === "N" && e.shiftKey) {
        e.preventDefault();
        addFeedModalOpen.set(!addFeedModalOpen.get());
        return;
      }

      if (e.key === "A" && e.shiftKey) {
        if (filter.get() === "starred") return;
        e.preventDefault();
        markAllReadConfirmOpen.set(true);
        return;
      }

      // Open the article under the cursor (or the first one) and mark it read.
      const openArticle = async (article) => {
        if (!article) return;
        cursorArticleId.set(article.id);
        navigate(`${basePath}/article/${article.id}`);
        if (article.status !== "read") {
          await handleMarkStatus(article);
        }
      };

      switch (e.key.toLowerCase()) {
        case "f": // 搜索
          e.preventDefault();
          searchDialogOpen.set(true);
          break;

        case "j": // 下一篇
          if (!articleId) {
            // Resume after the cursor when an article was just closed.
            const cursorIndex = $articles.findIndex(
              (a) => a.id === cursorArticleId.get(),
            );
            await openArticle($articles[cursorIndex + 1]);
          } else if (currentIndex < $articles.length - 1) {
            await openArticle($articles[currentIndex + 1]);
          }
          break;

        case "k": // 上一篇
          if (!articleId) {
            const cursorIndex = $articles.findIndex(
              (a) => a.id === cursorArticleId.get(),
            );
            if (cursorIndex > 0) await openArticle($articles[cursorIndex - 1]);
          } else if (currentIndex > 0) {
            await openArticle($articles[currentIndex - 1]);
          }
          break;

        case "o": // 打开/关闭文章
        case "enter":
          // Enter on a button or link is that control's own activation.
          if (e.key === "Enter" && e.target !== document.body) return;
          e.preventDefault();
          if (articleId) {
            cursorArticleId.set(Number(articleId));
            navigate(basePath || "/");
          } else {
            await openArticle(
              $articles.find((a) => a.id === cursorArticleId.get()) ??
                $articles[0],
            );
          }
          break;

        case "m": // 标记已读/未读
          if (articleId) {
            await handleMarkStatus($activeArticle);
          }
          break;

        case "s": // 收藏/取消收藏
          if (articleId) {
            await handleToggleStar($activeArticle);
          }
          break;

        case "r": // 刷新
          if (!e.ctrlKey && !e.metaKey) {
            await forceSync();
          }
          break;

        case "escape": // 关闭文章
          if ($imageGalleryActive) {
            return;
          } else {
            if (articleId) cursorArticleId.set(Number(articleId));
            navigate(basePath || "/");
          }
          break;

        case "v": // 在新标签页打开原文
          if (articleId) {
            window.open($activeArticle.url, "_blank");
          }
          break;

        case "g": // 原文/摘要切换
          if (articleId) {
            await handleToggleContent($activeArticle);
          }
          break;

        case "p": // 上一个订阅或分组
          e.preventDefault();
          navigateToPrevious();
          break;

        case "n": // 下一个订阅或分组
          e.preventDefault();
          navigateToNext();
          break;

        case "x": // 切换分组展开状态
          e.preventDefault();
          toggleCurrentCategory();
          break;

        default:
          break;
      }
    };

    const target = window;
    target.addEventListener("keydown", handleKeyDown);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    $activeArticle,
    currentIndex,
    $articles,
    basePath,
    navigate,
    articleId,
    $imageGalleryActive,
    navigateToPrevious,
    navigateToNext,
    toggleCurrentCategory,
  ]);
}
