<template>
  <iframe
    v-if="videoId"
    :src="`https://www.youtube-nocookie.com/embed/${videoId}`"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
    loading="lazy"
  ></iframe>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  url: string;
}

const props = defineProps<Props>();

const videoId = computed(() => {
  const content = props.url || "";
  // Check to see if the supplied string contains a full URL or is already a video ID
  const isCompleteLink = content.match(/(http:\/\/|https:\/\/)/);

  if (isCompleteLink) {
    const regex =
      /(youtu.be\/|youtube.com\/watch\?v=|youtube.com\/embed\/|youtube-nocookie.com\/embed\/|youtube.com\/shorts\/)(.*)/;
    return content.match(regex)?.[2].replace(/(&.*|".*)/, "") || "";
  }
  return content;
});
</script>
