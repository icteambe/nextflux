import { useEffect, useRef } from "react";
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
import {
  searchDialogOpen,
  addFeedModalOpen,
  settingsModalOpen,
  settingsModalTab,
} from "@/stores/modalStore.js";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import {
  cursorArticleId,
  markAllReadConfirmOpen,
} from "@/stores/readingListStore.js";
import { filter } from "@/stores/articleFilterStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import { spaceAction } from "@/domain/articles/pinRow.js";

export function useHotkeys() {
  const navigate = useNavigate();
  const $articles = useStore(filteredArticles);
  const $activeArticle = useStore(activeArticle);
  const $imageGalleryActive = useStore(imageGalleryActive);
  const { articleId } = useParams();
  const { navigateToPrevious, navigateToNext, toggleCurrentCategory } =
    useSidebarNavigation();
  const { toggleSidebar } = useSidebar();
  // Feedly-style "g" chords: g then a/t/l/p. Without a second key, g keeps
  // its upstream meaning (toggle reader view) once the chord window passes.
  const pendingChord = useRef(null);

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

      if (e.key === "?") {
        e.preventDefault();
        settingsModalTab.set("shortcuts");
        settingsModalOpen.set(true);
        return;
      }

      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchDialogOpen.set(true);
        return;
      }

      if (e.shiftKey && (e.key === "J" || e.key === "K")) {
        e.preventDefault();
        if (e.key === "J") navigateToNext();
        else navigateToPrevious();
        return;
      }

      if (e.key === "X" && e.shiftKey) {
        e.preventDefault();
        toggleCurrentCategory();
        return;
      }

      const goTo = (target) => {
        if (target === "feeds") {
          navigate("/feeds");
          return;
        }
        if (target === "settings") {
          settingsModalTab.set("general");
          settingsModalOpen.set(true);
          return;
        }
        filter.set(target);
        navigate("/");
      };
      if (pendingChord.current) {
        clearTimeout(pendingChord.current);
        pendingChord.current = null;
        const chords = {
          a: "all",
          t: "unread",
          l: "starred",
          f: "feeds",
          p: "settings",
        };
        const target = chords[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          goTo(target);
          return;
        }
      }

      if (e.key === "A" && e.shiftKey) {
        if (filter.get() === "starred") return;
        e.preventDefault();
        markAllReadConfirmOpen.set(true);
        return;
      }

      // Row the list commands act on: the open article, else the cursor row.
      const currentRow = () => {
        if (articleId) return currentIndex;
        return $articles.findIndex((a) => a.id === cursorArticleId.get());
      };
      const selectRow = (index) => {
        const article = $articles[index];
        if (!article) return;
        cursorArticleId.set(article.id);
        if (articleId) navigate(basePath || "/");
      };

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

        case " ": {
          // Feedly: space pages through the open article and, once its end is
          // on screen, opens the next one; Shift+Space pages back up.
          const { listLayout } = settingsState.get();
          // A focused control keeps its own space handling (buttons, links).
          if (
            listLayout !== "feedly" ||
            ["BUTTON", "A", "SELECT"].includes(e.target.tagName) ||
            e.target.closest?.("[role='button'],[role='menuitem'],[role='tab']")
          )
            return;
          const viewport = document.querySelector(
            ".article-list-content [data-slot='scroll-area-viewport']",
          );
          if (!viewport) return;
          e.preventDefault();
          // Instant, not smooth: the virtual list re-anchors while a freshly
          // opened article is still being measured and cancels smooth scrolls.
          const page = Math.round(viewport.clientHeight * 0.85);
          if (e.shiftKey) {
            viewport.scrollTop -= page;
            break;
          }
          const openRow = articleId
            ? viewport.querySelector(`[data-article-id="${articleId}"]`)
            : null;
          if (spaceAction(viewport, openRow) === "next") {
            if (currentIndex < $articles.length - 1)
              await openArticle($articles[currentIndex + 1]);
            break;
          }
          viewport.scrollTop += page;
          break;
        }

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

        case "g": // chord prefix; alone: 原文/摘要切换
          pendingChord.current = setTimeout(() => {
            pendingChord.current = null;
            if (articleId) handleToggleContent($activeArticle);
          }, 500);
          break;

        case "p": // select previous row without opening it
          e.preventDefault();
          selectRow(Math.max(0, currentRow() - 1));
          break;

        case "n": // select next row without opening it
          e.preventDefault();
          selectRow(currentRow() + 1);
          break;

        case "x": {
          // mark the current row read, close it and move on
          e.preventDefault();
          const index = currentRow();
          const article = articleId ? $activeArticle : $articles[index];
          if (!article) break;
          if (article.status !== "read") await handleMarkStatus(article);
          selectRow(Math.min(index + 1, $articles.length - 1));
          break;
        }

        case "[": // pin/hide sidebar
          e.preventDefault();
          toggleSidebar();
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
    toggleSidebar,
  ]);
}
