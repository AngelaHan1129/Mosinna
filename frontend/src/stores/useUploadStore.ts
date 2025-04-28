// stores/useUploadStore.js
import { SSEEvent } from "@/types/event";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUploadStore = defineStore("upload", () => {
  const events = ref<
    | SSEEvent<"ValidationError">[]
    | SSEEvent<"AllCheckFinished">[]
    | SSEEvent<"VideoCheckFinished">[]
    | SSEEvent<"VideoUploaded">[]
  >([]); // 用來存儲上傳的事件

  const uploadUrl = async (url: string) => {
    const controller = new AbortController();
    const apiEndpoint = `${import.meta.env.VITE_BACKEND_HOST}/api/check/url`;
    const payload = {
      url,
    };
    events.value = []; // 清空事件列表
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
          if (events.value.find((x) => x.type === "AllCheckFinished")) {
            controller.abort();
          }
        } catch (e) {}
      },
      onerror(error) {
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
          if (events.value.find((x) => x.type === "ValidationError")) {
            controller.abort();
          }
          if (events.value.find((x) => x.type === "AllCheckFinished")) {
            controller.abort();
          }
        } catch (e) {}
      },
      onerror(error) {
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
