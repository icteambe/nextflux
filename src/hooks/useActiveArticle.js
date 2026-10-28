import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  activeArticle,
  pendingArticleMutations,
} from "@/stores/articlesStore.js";
import { getArticleById } from "@/db/storage";
import { sameRecord } from "@/domain/sync/reconcileRecords.js";
import { getArticleQueryState } from "@/domain/articles/articleQueryState.js";

// Loads the routed article into `activeArticle`; shared by the reader panel
// and the inline row of the compact list.
export function useActiveArticle(articleId) {
  const result = useLiveQuery(async () => {
    if (!articleId) return { articleId, article: null };
    try {
      return { articleId, article: await getArticleById(articleId) };
    } catch (error) {
      return { articleId, error: error.message, article: null };
    }
  }, [articleId]);
  useEffect(() => {
    const current = activeArticle.get();
    if (current && current.id !== Number(articleId)) activeArticle.set(null);
    if (!result || result.articleId !== articleId) return;
    const article = result.article;
    if (!article) {
      activeArticle.set(null);
      return;
    }
    // Preserve fetched original content and AI state when only status changes.
    const next =
      current?.id === article.id
        ? {
            ...current,
            ...article,
            content: current.shownOriginal ? current.content : article.content,
            originalContent: article.content,
          }
        : { ...article, originalContent: article.content };
    // A database notification for one field must not erase another pending edit.
    const pending = pendingArticleMutations.get();
    for (const field of ["status", "starred"]) {
      const key = `${article.id}:${field}`;
      if (key in pending) next[field] = pending[key];
    }
    if (!sameRecord(current, next)) activeArticle.set(next);
  }, [articleId, result]);
  return getArticleQueryState(articleId, result);
}
