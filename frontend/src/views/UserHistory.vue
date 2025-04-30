<template>
  <div class="flex justify-center items-center min-h-screen py-8">
    <div
      class="w-11/12 max-w-4xl bg-[#6b5276] rounded-lg shadow-lg flex flex-col relative pb-12"
    >
      <!-- Title Section -->
      <div class="text-center p-4">
        <p class="text-white text-xl">歷史紀錄</p>
      </div>

      <hr class="border-t-2 border-gray-300 mx-4" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col justify-between p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="relative group"
          >
            <!-- Container with aspect ratio -->
            <div class="relative w-full pt-[75%]">
              <!-- Background Card -->
              <div class="absolute inset-0 bg-[#f1ecff] rounded-lg"></div>

              <!-- Content Card -->
              <div
                class="absolute inset-0 bg-white rounded-lg shadow-md overflow-hidden transform translate-x-2 translate-y-2 transition-transform"
              >
                <div class="absolute inset-0">
                  <video
                    v-if="item.videoUrl"
                    :src="item.videoUrl"
                    controls
                    class="w-full h-full object-cover rounded"
                    playsinline
                  ></video>

                  <button
                    @click="showPopup(item)"
                    class="absolute top-2 right-2 transition-transform hover:scale-105"
                  >
                    <img src="/search.png" class="w-16 sm:w-20" alt="Search" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center gap-1 mt-4">
          <button
            @click="changePage(1)"
            :disabled="currentPage === 1"
            class="px-2 py-1.5 text-sm rounded bg-gray-200 text-stone-900 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            &lt;&lt;
          </button>
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2 py-1.5 text-sm rounded bg-gray-200 text-stone-900 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            &lt;
          </button>
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-2 py-1.5 text-sm rounded transition-colors',
              currentPage === page
                ? 'bg-gray-50 text-stone-900'
                : 'bg-gray-200 text-stone-900 hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-2 py-1.5 text-sm rounded bg-gray-200 text-stone-900 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            &gt;
          </button>
          <button
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
            class="px-2 py-1.5 text-sm rounded bg-gray-200 text-stone-900 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            &gt;&gt;
          </button>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <div
          class="bg-white rounded-lg p-4 sm:p-6 w-[95%] sm:w-11/12 max-w-2xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto"
        >
          <div class="flex justify-between items-center mb-2 sm:mb-4">
            <h2 class="text-lg sm:text-xl font-semibold">歷史分析</h2>
            <button
              @click="closePopup"
              class="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
            >
              ×
            </button>
          </div>

          <hr class="border-t-2 border-gray-200 mb-4 sm:mb-6" />

          <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <!-- Chart Section -->
            <div class="flex-1 max-h-[150px] sm:max-h-[200px] lg:max-h-[250px]">
              <canvas id="myChartHistory" class="w-full h-full"></canvas>
            </div>

            <!-- Grid Items -->
            <div class="flex-1 grid gap-2 sm:gap-0 content-center">
              <div
                v-for="(gridItem, gridIndex) in gridItems"
                :key="gridIndex"
                class="flex flex-row justify-between w-full max-w-[400px] my-2 md:my-2.5 mx-2 md:mx-2.5 gap-2"
              >
                <div
                  class="flex-1 p-2 md:p-2.5 text-center rounded bg-[#6b5276] text-[#dad8eb]"
                >
                  {{ gridItem.title }}
                </div>
                <div
                  class="flex-1 md:p-2.5 text-center p-2 sm:p-4 rounded text-white text-sm sm:text-base"
                  :class="getGridItemClass(gridItem.status)"
                >
                  {{ getGridItemText(gridItem.status) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Video Section -->
          <div class="mt-6 sm:mt-8 mx-auto w-full max-w-[600px]">
            <div class="relative w-full pt-[56.25%]">
              <video
                v-if="currentItem?.videoUrl"
                :src="currentItem.videoUrl"
                controls
                class="absolute inset-0 w-full h-full object-cover rounded-lg"
              ></video>
            </div>
            <!-- 影片來源 -->
            <div class="mt-2 text-sm text-gray-700">
              影片來源：{{ currentItem?.source }}
            </div>
            <!-- 若為 Youtube 顯示連結 -->
            <div
              v-if="currentItem?.source !== '使用者上傳'"
              class="mt-2 text-sm text-gray-700"
            >
              影片連結位址：<a
                :href="currentItem?.url || '#'"
                target="_blank"
                class="underline text-blue-700"
                >{{ currentItem?.url }}</a
              >
            </div>
          </div>

          <div class="text-center mt-4 sm:mt-6">
            <button
              @click="showPopupshare"
              class="px-4 sm:px-6 py-1.5 sm:py-2 bg-pink-500 text-white text-sm sm:text-base rounded hover:bg-pink-400 transition-colors"
            >
              分享
            </button>
          </div>
        </div>
      </div>

      <!-- ShareResult Component -->
      <ShareResult
        v-if="showModalshare"
        v-model:detailsText="detailsText"
        @close="closePopupshare"
        @share-to-threads="shareToThreads"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import Chart from "chart.js/auto";
import ShareResult from "../components/ShareResult.vue";
import { CheckResult, HistoryPageItem } from "@/types/history";

const items = ref<HistoryPageItem[]>([]);
const gridItems = ref<
  {
    title: string;
    status: "pass" | "risky" | "error" | "unknown";
  }[]
>([]);
const showModal = ref(false);
const currentItem = ref<HistoryPageItem | null>(null);
const showModalshare = ref(false);
const detailsText = ref("");
const errorMessage = ref("");
const currentPage = ref(1);
const route = useRoute();
let chartInstance: Chart<"doughnut", number[], string> | null = null; // Store chart instance

const ITEMS_PER_PAGE = 6;
const API_URL = `${import.meta.env.VITE_BACKEND_HOST}/api/history`;

const totalPages = computed(() =>
  Math.ceil(items.value.length / ITEMS_PER_PAGE)
);
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return items.value.slice(start, end);
});

const displayedPages = computed(() => {
  const maxButtons = 5;
  const halfButtons = Math.floor(maxButtons / 2);
  let startPage = Math.max(currentPage.value - halfButtons, 1);
  let endPage = Math.min(startPage + maxButtons - 1, totalPages.value);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(endPage - maxButtons + 1, 1);
  }

  return Array.from(
    { length: Math.min(maxButtons, endPage - startPage + 1) },
    (_, i) => startPage + i
  );
});

// Methods
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const mapResultToStatus = (result: string) => {
  if (["pass", "risky", "error"].includes(result)) {
    return result as "pass" | "risky" | "error";
  }
  return "unknown" as const;
};

const getStatusTooltip = (status: string) => {
  switch (status) {
    case "pass":
      return "目前系統尚未檢測到任何影、音訊偽造詐騙的風險。";
    case "risky":
      return "系統在檢測中發現疑似可疑內容。建議您謹慎處理此影片。";
    case "error":
      return "檢測過程中發生錯誤。請稍後再試或聯絡管理員。";
    case "unknown":
      return "檢測狀態未知。請聯絡管理員以獲取協助。";
    default:
      return "未知狀態";
  }
};

const getGridItemClass = (status: string) => {
  switch (status) {
    case "pass":
      return "bg-[#4CAF50]"; // Green for pass
    case "risky":
      return "bg-[#C8698A]"; // Original risky color
    case "error":
      return "bg-[#e3a619]"; // Red for error
    case "unknown":
      return "bg-[#9d918e]"; // Gray for unknown
    default:
      return "bg-gray-400";
  }
};

const getGridItemText = (status: string) => {
  switch (status) {
    case "pass":
      return "尚未發現風險";
    case "risky":
      return "疑似可疑內容";
    case "error":
      return "檢測失敗";
    case "unknown":
      return "狀態未知";
    default:
      return "未知";
  }
};

const fetchHistory = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const { data: storedData, status, message } = await response.json();

    if (Array.isArray(storedData)) {
      items.value = (storedData as CheckResult[]).map((item) => ({
        id: item.id,
        name: `影片ID: ${item.id}`,
        videoUrl: item.video_path,
        url: item.url,
        source: item.source || "使用者上傳",
        services: item.services.map((service) => ({
          name: service.name,
          result: service.result,
          status: mapResultToStatus(service.result), // Map result to status
          details: JSON.parse(service.details || "{}"),
        })),
        checkedAt: item.checked_at || "",
      }));

      // Check for URL parameter after data is loaded
      const historyId = route.query.id;
      if (historyId) {
        const itemToDisplay = items.value.find(
          (video) => video.id === historyId
        );
        if (itemToDisplay) {
          showPopup(itemToDisplay);
        }
      }
    } else {
      errorMessage.value = "獲取的資料格式不正確";
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    errorMessage.value = "獲取資料失敗，請稍後重試";
  }
};

const showPopup = async (item: HistoryPageItem) => {
  currentItem.value = item;
  gridItems.value = item.services.map((service) => ({
    title: service.name,
    status: service.status, // Use status instead of value/result
  }));
  showModal.value = true;

  // Set share text based on risky items
  const riskyServices = gridItems.value
    ?.filter((item) => item.status === "risky")
    .map((item) => `「${item.title}」`);
  if (riskyServices.length > 0) {
    detailsText.value = `要小心！我在魔聲仔中的${riskyServices.join(
      "、"
    )}中檢測到可疑內容，建議大家小心使用。`;
  } else {
    detailsText.value = `我在魔聲仔中檢測了這個影片，目前看起來沒有問題！`; // Default text if no risky items
  }

  // Wait for the DOM to update before rendering the chart
  await nextTick();
  renderChart();
};

const renderChart = () => {
  const ctx = (
    document.getElementById("myChartHistory") as HTMLCanvasElement
  )?.getContext("2d");
  if (!ctx) return;

  // Destroy previous chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const statusCounts = gridItems.value.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { pass: 0, risky: 0, error: 0, unknown: 0 }
  );

  const chartData = {
    labels: ["尚未發現風險", "疑似可疑內容", "檢測失敗", "未知"], // Corresponds to pass, risky, error, unknown
    datasets: [
      {
        label: "檢測結果",
        data: [
          statusCounts.pass,
          statusCounts.risky,
          statusCounts.error,
          statusCounts.unknown,
        ],
        backgroundColor: [
          "#4CAF50", // pass
          "#C8698A", // risky
          "#e3a619", // error
          "#9d918e", // unknown
        ],
        borderColor: "rgba(255, 255, 255, 0.5)", // Add border for better visibility
        borderWidth: 1,
      },
    ],
  };

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const count = context.parsed;
              const labelIndex = context.dataIndex;
              const status = ["pass", "risky", "error", "unknown"][labelIndex];
              const tooltipText = getStatusTooltip(status);
              const text = `${context.dataset.label}: ${count} (${tooltipText})`; // 換行處理
              const matches = text.match(/.{1,15}/g);
              return matches
                ? matches.join(",LINEBREAK").split(",LINEBREAK")
                : [text];
            },
          },
        },
        legend: {
          position: "top",
          labels: {
            filter: (legendItem, chartData) => {
              const dataset = chartData.datasets[0];
              const dataValue = dataset.data[Number(legendItem.index)];
              return Number(dataValue) > 0;
            },
          },
        },
      },
    },
  });
};

const shareToThreads = () => {
  const context = detailsText.value;
  const shareId = currentItem.value?.id;
  const url = `魔聲仔檢測結果：\n${
    import.meta.env.VITE_FRONTEND_HOST
  }/UserHistory?id=${shareId}`;
  const tag = "#魔聲仔";
  const shareUrl = `https://threads.net/intent/post?text=${encodeURIComponent(
    `${context}\n\n${url}\n${tag}`
  )}`;
  window.open(shareUrl, "_blank");
};

// Lifecycle
onMounted(() => {
  fetchHistory();
});

const closePopup = () => {
  showModal.value = false;
  currentItem.value = null; // Clear current item
  gridItems.value = []; // Clear grid items
  if (chartInstance) {
    chartInstance.destroy(); // Clean up chart instance
    chartInstance = null;
  }
};

const showPopupshare = () => {
  showModalshare.value = true;
};

const closePopupshare = () => {
  showModalshare.value = false;
};
</script>
