import {
  activeArticle,
  updateArticleStarred,
  updateArticleStatus,
  markAllAsRead,
  markAboveAsRead,
  markArticlesAsRead,
  markBelowAsRead,
  markOlderAsRead,
  loadingOriginContent,
} from "../stores/articlesStore.js";
import minifluxAPI from "@/api/miniflux";
import { reportError } from "@/lib/errors.js";

// 处理文章状态更新
export const handleMarkStatus = async (article) => {
  try {
    await updateArticleStatus(article);
  } catch (err) {
    reportError(err, "article.updateStatus");
  }
};

// 处理文章星标状态更新
export const handleToggleStar = async (article) => {
  try {
    await updateArticleStarred(article);
  } catch (err) {
    reportError(err, "article.updateStarred");
  }
};

// 处理标记所有文章为已读
export const handleMarkAllRead = async (type, id) => {
  try {
    switch (type) {
      case "feed":
        await markAllAsRead("feed", id);
        break;
      case "category":
        await markAllAsRead("category", id);
        break;
      default:
        await markAllAsRead();
    }
  } catch (err) {
    reportError(err, "article.markAllRead");
  }
};

// Mark articles older than `days` days in the current scope as read.
export const handleMarkOlderRead = async (type, id, days) => {
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    await markOlderAsRead(type, id, cutoff);
  } catch (err) {
    reportError(err, "article.markOlderRead");
  }
};

// Rows scrolled past in the compact list
export const handleMarkScrolledPastAsRead = async (ids) => {
  try {
    await markArticlesAsRead(ids);
  } catch (err) {
    reportError(err, "article.markScrolledRead");
  }
};

// 处理标记上方文章为已读
export const handleMarkAboveAsRead = async (articleId) => {
  try {
    await markAboveAsRead(articleId);
  } catch (err) {
    reportError(err, "article.markAboveRead");
  }
};

// 处理标记下方文章为已读
export const handleMarkBelowAsRead = async (articleId) => {
  try {
    await markBelowAsRead(articleId);
  } catch (err) {
    reportError(err, "article.markBelowRead");
  }
};

// 处理内容切换
export const handleToggleContent = async (article) => {
  if (!article || loadingOriginContent.get()) return;

  try {
    loadingOriginContent.set(true);
    const showOriginal = !article.shownOriginal;

    activeArticle.set({
      ...article,
      content: showOriginal
        ? await minifluxAPI.fetchEntryContent(article.id)
        : article.originalContent,
      shownOriginal: showOriginal,
    });
  } catch (error) {
    reportError(error, "article.toggleContent");
  } finally {
    loadingOriginContent.set(false);
  }
};
