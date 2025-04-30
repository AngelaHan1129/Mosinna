<template>
  <div class="flex justify-center items-center min-h-screen py-8">
    <div
      class="w-11/12 max-w-4xl bg-[#6b5276] rounded-lg shadow-lg flex flex-col relative pb-12"
    >
      <!-- Title Section -->
      <div class="text-center p-4">
        <p class="text-white text-xl">風險檢測記錄</p>
      </div>

      <hr class="border-t-2 border-gray-300 mx-4" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col justify-between p-4">
        <div v-if="items.length === 0" class="text-center text-white p-4">
          沒有風險檢測記錄
        </div>
        <div v-else class="bg-white rounded-lg shadow-md p-4">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 text-left text-sm sm:text-base">
                  檢測來源
                </th>
                <th class="py-2 px-4 text-left text-sm sm:text-base">
                  檢測時間
                </th>
                <th class="py-2 px-4 text-center text-sm sm:text-base">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in paginatedItems"
                :key="index"
                class="border-b"
              >
                <td class="py-2 px-4 text-sm sm:text-base">
                  {{ item.source || "使用者上傳" }}
                </td>
                <td class="py-2 px-4 text-sm sm:text-base">
                  {{ new Date(item.checkedAt).toLocaleString() }}
                </td>
                <td
                  class="py-2 px-4 text-center flex flex-col sm:flex-row gap-2 justify-center items-center"
                >
                  <button
                    @click="showDetails(item)"
                    class="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-[#6b5276] text-white rounded hover:bg-[#574460] transition-colors w-full sm:w-auto"
                  >
                    詳細記錄
                  </button>
                  <button
                    @click="handleReport(item)"
                    class="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-orange-400 text-white rounded hover:bg-orange-300 transition-colors w-full sm:w-auto"
                  >
                    通報
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="items.length > 0" class="flex justify-center gap-1 mt-4">
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
            <h2 class="text-lg sm:text-xl font-semibold">檢測結果</h2>
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
                class="flex flex-row justify-between w-full max-w-[400px] my-2 md:my-2.5 mx-auto md:mx-2.5 gap-2"
              >
                <div
                  class="flex-1 p-2 md:p-2.5 text-center rounded bg-[#6b5276] text-[#dad8eb] text-sm sm:text-base"
                >
                  {{ gridItem.title }}
                </div>
                <div
                  class="flex-1 md:p-2.5 text-center p-2 rounded text-white text-sm sm:text-base"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue"; // Import nextTick
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import { toast } from "vue3-toastify";
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
const currentPage = ref(1);
const router = useRouter();
let chartInstance: Chart<"doughnut", number[], string> | null = null; // Store chart instance

const ITEMS_PER_PAGE = 10;
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

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const mapResultToStatus = (result: string) => {
  if (!["pass", "risky", "error"].includes(result)) {
    return "unknown";
  }
  return result as "pass" | "risky" | "error";
};

const getGridItemClass = (status: string) => {
  switch (status) {
    case "pass":
      return "bg-[#4CAF50]"; // Green for pass
    case "risky":
      return "bg-[#C8698A]"; // Original risky color
    case "error":
      return "bg-[#e50b57]"; // Red for error
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

const handleReport = (item: HistoryPageItem) => {
  const textService = item.services.find((s) => s.name === "文字詐騙檢測服務");
  const riskyServices = item.services
    .filter((s) => s.status === "risky") // Use status here
    .map((s) => `「${s.name}」`)
    .join("、");

  const reportText =
    `影片來源：${item.source || "使用者上傳"}\n` +
    (item.url ? `影片連結：${item.url}\n` : "") +
    `檢測時間：${new Date(item.checkedAt).toLocaleString()}\n` +
    `檢測結果：\n` +
    `影片語音內容：${textService?.details?.text || ""}\n` +
    `已檢測到風險：${riskyServices}\n\n` +
    `檢測來源：魔聲仔－影片檢測平台 ${
      import.meta.env.VITE_FRONTEND_HOST
    }/UserHistory?id=${item.id}`;

  localStorage.setItem("reportText", reportText);
  router.push("/Notification");
};

const fetchHistory = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const { data: storedData, status, message } = await response.json();

    const filteredData = ((storedData as CheckResult[]) || [])
      .filter((item) =>
        item.services.some((service) => service.result === "risky")
      )
      .sort(
        (a, b) =>
          new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime()
      );

    if (filteredData.length === 0) {
      items.value = [];
      toast.info("沒有檢測到任何風險的歷史紀錄");
      return;
    }

    items.value = filteredData.map((item) => ({
      id: item.id,
      videoUrl: item.video_path,
      source: item.source || "使用者上傳",
      url: item.url,
      services: item.services.map((service) => ({
        name: service.name,
        result: service.result,
        status: mapResultToStatus(service.result), // Map result to status
        details: JSON.parse(service.details || "{}"),
      })),
      checkedAt: item.checked_at || "",
    }));
  } catch (error) {
    toast.error("獲取資料失敗，請稍後重試");
    items.value = [];
  }
};

const showDetails = async (item: HistoryPageItem) => {
  // Make async
  currentItem.value = item;
  gridItems.value = item.services.map((service) => ({
    title: service.name,
    status: service.status,
  }));
  showModal.value = true;
  await nextTick();
  renderChart();
};

const renderChart = () => {
  const ctx = (
    document.getElementById("myChartHistory") as HTMLCanvasElement
  )?.getContext("2d");
  if (!ctx) return;

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
          "#e50b57", // error
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
              return `${context.label}: ${count}`;
            },
          },
        },
        legend: {
          position: "top",
          labels: {
            filter: (legendItem, chartData) => {
              const dataset = chartData.datasets[0];
              const dataValue = dataset.data[Number(legendItem?.index)];
              return Number(dataValue) > 0;
            },
          },
        },
      },
    },
  });
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
</script>
