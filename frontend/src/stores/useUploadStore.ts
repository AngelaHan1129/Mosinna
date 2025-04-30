// stores/useUploadStore.js
import { SSEEvent } from "@/types/event";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue3-toastify";

export const useUploadStore = defineStore("upload", () => {
  const events = ref<
    | SSEEvent<"ValidationError">[]
    | SSEEvent<"AllCheckFinished">[]
    | SSEEvent<"VideoCheckFinished">[]
    | SSEEvent<"VideoUploaded">[]
    | SSEEvent<"CheckResultSaved">[]
  >([]); // 用來存儲上傳的事件

  const uploadUrl = async (url: string) => {
    const controller = new AbortController();
    const apiEndpoint = `${import.meta.env.VITE_BACKEND_HOST}/api/check/url`;
    const payload = {
      url,
    };
    events.value = []; // 清空事件列表

    const toastId = toast.loading("Youtube 影片上傳中，請稍候...");

    await fetchEventSource(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      async onopen(response) {
        if (!response.ok) throw new Error("❌ 連接失敗");
        return Promise.resolve();
      },
      onmessage(event) {
        try {
          const data = JSON.parse(event.data);
          events.value.push(data);
          toast.remove(toastId);

          if (events.value.find((x) => x.type === "CheckResultSaved")) {
            controller.abort();
            return;
          }
          if (events.value.find((x) => x.type === "ValidationError")) {
            toast.error("YouTube 影片無法上傳，請檢查網址是否正確！");
            controller.abort();
            return;
          }
          if (events.value.find((x) => x.type === "AllCheckFinished")) {
            toast.success("影片分析完成！");
          }
        } catch (e) {}
      },
      onerror(error) {
        toast.remove(toastId);
        throw error;
      },
    });
  };

  const uploadVideo = async (videoData: string) => {
    const controller = new AbortController();
    const apiEndpoint = `${import.meta.env.VITE_BACKEND_HOST}/api/check`;
    const payload = {
      videoData,
    };
    events.value = []; // 清空事件列表

    const toastId = toast.loading("影片上傳中，請稍候...");

    await fetchEventSource(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      async onopen(response) {
        if (!response.ok) throw new Error("❌ 連接失敗");
        return Promise.resolve();
      },
      onmessage(event) {
        try {
          const data = JSON.parse(event.data);
          events.value.push(data);
          toast.remove(toastId);

          if (events.value.find((x) => x.type === "CheckResultSaved")) {
            controller.abort();
            return;
          }
          if (events.value.find((x) => x.type === "ValidationError")) {
            toast.error("影片無法上傳，請注意檔案大小或格式！");
            controller.abort();
            return;
          }
          if (events.value.find((x) => x.type === "AllCheckFinished")) {
            toast.success("影片分析完成！");
          }
        } catch (e) {}
      },
      onerror(error) {
        toast.remove(toastId);
        throw error;
      },
    });
  };

  return {
    events,
    uploadUrl,
    uploadVideo,
  };
});
