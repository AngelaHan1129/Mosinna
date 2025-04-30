<template>
  <div class="h-[90vh]">
    <!-- 🌄 背景圖片區塊 -->
    <div
      class="h-[300px] md:h-[300px] sm:h-[200px] bg-contain bg-no-repeat bg-center flex justify-center items-center"
      style="background-image: url('/assets/image/vision.png')"
    ></div>

    <!-- 🟪 下方表單區塊 -->
    <div class="bottom-0 w-full flex justify-center">
      <div
        class="w-full bg-[hsla(282,18%,39%,0.7)] border border-[#f1ecff] border-b-0 rounded-t-[20px] p-8 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
      >
        <!-- 🔗 URL 輸入區 -->
        <p class="text-2xl font-bold m-0 py-4 px-4 text-left text-[#f1ecff]">
          輸入影片連結
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <input
            v-model="urlInput"
            type="url"
            placeholder="請輸入影片連結(僅支援 Youtube)"
            class="flex-1 rounded-[10px] border-none bg-[rgba(255,255,255,0.729)] p-3 text-base outline-none shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
          />
          <button class="btn w-full sm:w-auto" @click="submitUrl">
            點擊送出
          </button>
        </div>

        <!-- 📁 檔案上傳區 -->
        <p class="text-2xl font-bold m-0 py-4 px-4 text-left text-[#f1ecff]">
          上傳影片
        </p>
        <div
          @click="triggerFileUpload"
          class="border-2 border-dashed border-[#f1ecff] px-4 py-12 text-center rounded-[10px] bg-transparent cursor-pointer"
        >
          <div v-if="file" class="text-[#f1ecff]">
            <p>
              檔案名稱:
              <span target="_blank" class="text-[#acd0ff] hover:text-[#fffeec]">
                {{ file.name }}
              </span>
            </p>
          </div>
          <label v-else class="block text-[#f1ecff] text-base">
            點擊按鈕或拖曳檔案上傳
          </label>
          <input
            id="file-upload"
            ref="fileInput"
            type="file"
            class="hidden"
            @change="handleFileChange"
            accept="video/*"
          />
          <button class="btn mt-4" @click.stop="triggerFileUpload">
            點擊上傳
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useUploadStore } from "@/stores/useUploadStore";
import { useRouter } from "vue-router"; // ✨新增這行
import { toast } from "vue3-toastify";

const router = useRouter(); // ✨新增這行
const uploadStore = useUploadStore();

const file = ref<File>();
const urlInput = ref("");
const fileInput = ref<HTMLInputElement>();

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const selectedFile = (event.target as HTMLInputElement).files?.[0];
  if (!selectedFile || !selectedFile.type.startsWith("video/")) return;

  file.value = selectedFile;
  const reader = new FileReader();

  reader.onload = async (e) => {
    const result = (e.target as FileReader).result;
    if (typeof result === "string") {
      uploadStore.uploadVideo(result);
    } else {
      console.error("FileReader result is not a string");
    }
  };

  reader.readAsDataURL(selectedFile);
};

const submitUrl = () => {
  if (!urlInput.value || !urlInput.value.startsWith("http")) {
    toast.error("請輸入正確的影片網址");
    return;
  }
  uploadStore.uploadUrl(urlInput.value);
};

watch(
  () => uploadStore.events,
  (newEvents) => {
    if (newEvents.find((x) => x.type === "VideoUploaded")) {
      toast.success("上傳完成！即將進入分析頁面");
      router.push("/UserReport");
    }
  },
  { deep: true }
);
</script>

<style scoped>
.btn {
  background-color: #c8698a;
  color: #fff;
  padding: 0.5rem 1.5rem;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.2s;
}
.btn:hover {
  background-color: #954e67;
}

video {
  max-height: 300px;
}
</style>
