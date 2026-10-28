import { useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import CustomAlertDialog from "@/components/ui/CustomAlertDialog.jsx";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { markAllReadConfirmOpen } from "@/stores/readingListStore.js";

// Shift+A asks before marking the current list as read.
export default function MarkAllReadConfirm() {
  const { t } = useTranslation();
  const { feedId, categoryId } = useParams();
  const open = useStore(markAllReadConfirmOpen);
  return (
    <CustomAlertDialog
      isOpen={open}
      title={t("articleList.markAllRead")}
      content={t("articleList.markAllReadConfirm")}
      cancelText={t("common.cancel")}
      confirmText={t("common.confirm")}
      onClose={() => markAllReadConfirmOpen.set(false)}
      onConfirm={() =>
        handleMarkAllRead(
          feedId ? "feed" : categoryId ? "category" : "all",
          feedId || categoryId,
        )
      }
    />
  );
}
