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
            }"
            class="absolute bottom-0 w-full h-[110px] md:h-[140px] rounded-lg flex flex-col justify-center items-center p-4 space-y-2"
          >
            <div class="text-white text-base font-semibold">
              {{ card.title }}
            </div>
            <button
              @click="showModal = true"
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
            目前系統未檢測到任何音訊偽造的風險。如有疑慮，請重新上傳或聯絡管理員。
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

const uploadStore = useUploadStore();

const showModal = ref(false);
const progress = ref(uploadStore.events.find(e => e.type === "AllCheckFinished") ? -1 : 0);
const statusMsg = ref("");

const shareToThreads = () => {
  const riskyResults = uploadStore.events.filter(
    (e) => e.type === "VideoCheckFinished" && e.data.result === "risky"
  );
  
  const checkResultId = uploadStore.events.find(
    (e) => e.type === "CheckResultSaved"
  )?.data.checkResultId;
  const url = `${import.meta.env.VITE_FRONTEND_HOST}/UserHistory?id=${checkResultId}`;

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
const cards = computed(() => {
  return uploadStore.events
    .filter((e) => e.type === "VideoCheckFinished")
    .map((e) => {
      const result = e.data.result;
      const name = e.data.name;
      if (result === "risky") {
        return {
          icon: "🤔",
          title: name,
          buttonText: "疑似可疑內容",
          status: "risky",
        };
      } else {
        return {
          icon: "😊",
          title: name,
          buttonText: "尚未發現風險",
          status: "safe",
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
  { deep: true }
);
</script>
