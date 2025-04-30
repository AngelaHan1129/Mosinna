<template>
  <div class="min-h-[90vh] flex justify-center items-center py-10">
    <div
      class="w-11/12 md:w-4/5 max-w-[900px] bg-[hsla(256,100%,96%,0.9)] rounded-lg shadow-lg"
    >
      <div class="bg-[#6b5276] rounded-t-lg">
        <p
          class="m-0 py-3 md:py-4 px-4 md:px-6 text-left text-[#f1ecff] text-xl md:text-2xl"
        >
          結果分析
        </p>
      </div>

      <hr class="border-t-2 border-gray-300" />

      <!-- 📈 進度條 -->
      <div
        v-if="progress > -1"
        class="mt-4 flex items-center justify-center gap-4 px-4 md:px-8"
      >
        <p class="text-xl text-[#594462]">進度：{{ progress }}%</p>
        <div class="bg-[#e0d7ec] h-5 w-80 rounded overflow-hidden shadow-inner">
          <div
            class="bg-[#9e7cad] h-5 transition-all rounded"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <!-- 🕐 狀態訊息 -->
      <div v-if="statusMsg" class="text-center mt-4 text-[#2b212f] text-sm">
        {{ statusMsg }}
      </div>

      <!-- ✅ 卡片區 -->
      <div class="flex flex-wrap justify-center gap-4 mt-6">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="relative w-[260px] h-[200px] md:h-[260px] bg-[#D1C4E9] rounded-lg shadow-lg flex flex-col justify-start items-center"
        >
          <div class="pt-4 pb-2 flex-none">
            <span class="text-6xl md:text-8xl">{{ card.icon }}</span>
          </div>

          <div
            :class="{
              'bg-[#4CAF50]': card.status === 'safe',
              'bg-[#C8698A]': card.status === 'risky',
              'bg-[#e50b57]': card.status === 'error',
              'bg-[#9d918e]': card.status === 'unknown',
            }"
            class="absolute bottom-0 w-full h-[110px] md:h-[140px] rounded-lg flex flex-col justify-center items-center p-4 space-y-2"
          >
            <div class="text-white text-base font-semibold">
              {{ card.title }}
            </div>
            <button
              @click="handleCardButtonClick(card)"
              class="flex items-center gap-2 text-white text-sm bg-[#6b5276] px-4 py-1 rounded-full hover:bg-[#513e59] transition"
            >
              <svg
                v-if="card.status === 'safe'"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M11.25 9.75h.008v.008h-.008V9.75zM12 12v3.75m0 3.75a9 9 0 100-18 9 9 0 000 18z"
                />
              </svg>
              <svg
                v-if="card.status === 'risky'"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 6v6m0 0v6m0-6h6m-6 0h-6"
                />
              </svg>
              <svg
                v-if="card.status === 'error'"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"
                />
              </svg>
              <svg
                v-if="card.status === 'unknown'"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
              {{ card.buttonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- ✅ Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-gray-800"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">風險狀態說明</h2>
            <button
              @click="showModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p>
            {{ modalContent }}
          </p>
        </div>
      </div>

      <!-- ✅ 分享按鈕 -->
      <div class="text-center mt-4 sm:mt-6">
        <button
          @click="shareToThreads"
          class="px-4 sm:px-6 py-1.5 sm:py-2 bg-pink-500 text-white text-sm sm:text-base rounded hover:bg-pink-400 transition-colors"
        >
          分享至 Threads
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useUploadStore } from "@/stores/useUploadStore";
import { VideoCheckFinishedData } from "@/types/event";

interface Card {
  icon: string;
  title: string;
  buttonText: string;
  status: "safe" | "risky" | "error" | "unknown";
  details?: string | object | null; // Add details to the interface
}

const uploadStore = useUploadStore();

const showModal = ref(false);
const modalContent = ref(""); // Ref to store modal content
const progress = ref(
  uploadStore.events.find((e) => e.type === "AllCheckFinished") ? -1 : 0
);
const statusMsg = ref("");

const handleCardButtonClick = (card: Card) => {
  switch (card.status) {
    case "safe":
      modalContent.value =
        "目前系統尚未檢測到該影片任何影、音訊偽造詐騙的風險。如有疑慮，請重新上傳或聯絡管理員。";
      break;
    case "risky":
      modalContent.value = `系統在「${card.title}」檢測中發現疑似可疑內容。建議您謹慎處理此影片，或聯絡管理員以獲取更多資訊。`;
      break;
    case "error":
      modalContent.value = `「${card.title}」檢測過程中發生錯誤。${
        card.details ? "詳細資訊：" + card.details : "請稍後再試或聯絡管理員。"
      }`;
      break;
    case "unknown":
      modalContent.value = `「${card.title}」的檢測狀態未知。請聯絡管理員以獲取協助。`;
      break;
    default:
      modalContent.value = "發生未知錯誤，請聯絡管理員。";
  }
  showModal.value = true;
};

const shareToThreads = () => {
  const riskyResults = uploadStore.events.filter(
    (e) => e.type === "VideoCheckFinished" && e.data.result === "risky"
  );

  const checkResultId = uploadStore.events.find(
    (e) => e.type === "CheckResultSaved"
  )?.data.checkResultId;
  const url = `${
    import.meta.env.VITE_FRONTEND_HOST
  }/UserHistory?id=${checkResultId}`;

  const text = encodeURIComponent(
    `要小心！我在這裡上傳的影片經過系統檢測，結果如下：\n` +
      riskyResults
        .map((e) => {
          const data = e.data as VideoCheckFinishedData;
          const result = data.name.includes("Deepfake")
            ? "檢測出 AI 生成"
            : data.name === "文字詐騙檢測服務"
            ? "影片內容疑似詐騙"
            : "疑似可疑內容";
          return `${data.name}：${result}`;
        })
        .join(",\n") +
      `\n\n魔聲仔檢測結果報告：${url}` +
      `\n\n#Deepfake`
  );
  const shareUrl = `https://www.threads.net/intent/post?text=${text}`;
  window.open(shareUrl, "_blank");
};

// 🔥 核心重點：從 uploadStore.events 自動生成 cards
const cards = computed<Card[]>(() => {
  return uploadStore.events
    .filter((e) => e.type === "VideoCheckFinished")
    .map((e) => {
      const data = e.data as VideoCheckFinishedData; // Type assertion for clarity
      const result = data.result;
      const name = data.name;
      if (result === "risky") {
        return {
          icon: "🤔",
          title: name,
          buttonText: "疑似可疑內容",
          status: "risky",
        };
      } else if (result === "pass") {
        return {
          icon: "😊",
          title: name,
          buttonText: "尚未發現風險",
          status: "safe",
        };
      } else if (result === "error") {
        const detailsString =
          typeof data.details === "object" &&
          data.details !== null &&
          "message" in data.details
            ? String(data.details.message)
            : String(data.details);
        return {
          icon: "🥺",
          title: name,
          buttonText: "查看錯誤",
          details: detailsString || "未提供詳細錯誤資訊",
          status: "error",
        };
      } else {
        return {
          icon: "❓",
          title: name,
          buttonText: "查看狀態",
          status: "unknown",
        };
      }
    });
});

// 🕐 進度條邏輯（可以加強）
watch(
  () => uploadStore.events,
  (newEvents) => {
    if (newEvents.find((x) => x.type === "AllCheckFinished")) {
      progress.value = 100;
      statusMsg.value = "檢測完成";
    } else if (newEvents.some((x) => x.type === "VideoCheckFinished")) {
      progress.value = 70;
      statusMsg.value = "部分檢測完成";
    } else if (newEvents.find((x) => x.type === "VideoUploaded")) {
      progress.value = 30;
      statusMsg.value = "🚀 上傳成功，檢測中...";
    }
  },
  { deep: true, immediate: true } // Add immediate to run on initial load
);
</script>
