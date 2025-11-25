<template>
  <div class="cloudinary-uploader">
    <!-- Upload Area -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
        isDragging ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 hover:border-yellow-400',
        uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="!single"
        @change="handleFileSelect"
        class="hidden"
      />

      <div v-if="uploading" class="space-y-3">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600"></div>
        <p class="text-sm text-gray-600">Uploading {{ uploadProgress }}%...</p>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-yellow-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <div v-else>
        <i class="bi bi-cloud-upload text-4xl text-gray-400 mb-2"></i>
        <p class="text-sm font-medium text-gray-700">
          {{ isDragging ? "Drop files here" : "Click to upload or drag & drop" }}
        </p>
        <p class="text-xs text-gray-500 mt-1">{{ acceptText }}</p>
        <p v-if="!single" class="text-xs text-gray-500">Multiple files allowed</p>
      </div>
    </div>

    <!-- Preview Area -->
    <div v-if="previewUrls.length > 0" class="mt-4 space-y-3">
      <h4 class="text-sm font-medium text-gray-700">Uploaded Images:</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="(url, index) in previewUrls"
          :key="index"
          class="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
        >
          <!-- ✨ Optimized preview thumbnail -->
          <img
            :src="getOptimizedPreview(url)"
            :alt="`Preview ${index + 1}`"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <!-- Overlay with actions -->
          <div
            class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              type="button"
              @click.stop="viewImage(url)"
              class="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="View"
            >
              <i class="bi bi-eye text-gray-700"></i>
            </button>
            <button
              type="button"
              @click.stop="removeImage(index)"
              class="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
              title="Remove"
            >
              <i class="bi bi-trash text-red-600"></i>
            </button>
          </div>

          <!-- Primary badge -->
          <div v-if="index === 0 && !single" class="absolute top-2 left-2">
            <span class="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Primary</span>
          </div>
        </div>
      </div>

      <!-- URL List (for debugging/copying) -->
      <details v-if="showUrls" class="text-xs">
        <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Show URLs</summary>
        <div class="mt-2 space-y-1">
          <div v-for="(url, index) in previewUrls" :key="index" class="flex items-center gap-2">
            <code class="flex-1 bg-gray-100 px-2 py-1 rounded text-xs overflow-x-auto">{{ url }}</code>
            <button type="button" @click="copyUrl(url)" class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs">
              Copy
            </button>
          </div>
        </div>
      </details>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">
        <i class="bi bi-exclamation-triangle mr-1"></i>
        {{ errorMessage }}
      </p>
    </div>

    <!-- ✨ Image Viewer Modal with optimized image -->
    <div
      v-if="viewerUrl"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[60]"
      @click="viewerUrl = null"
    >
      <div class="relative max-w-4xl w-full">
        <button @click="viewerUrl = null" class="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl">
          <i class="bi bi-x-lg"></i>
          Close
        </button>
        <img :src="getOptimizedViewer(viewerUrl)" alt="Full view" class="w-full h-auto rounded-lg" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  folder?: string; // Cloudinary folder name
  single?: boolean; // Single file upload mode
  maxFiles?: number; // Maximum number of files
  maxSize?: number; // Max file size in MB
  accept?: string; // Accepted file types
  showUrls?: boolean; // Show URL list
  modelValue?: string[]; // v-model support for URLs
}>();

const emit = defineEmits<{
  uploaded: [urls: string[]];
  "update:modelValue": [urls: string[]];
  error: [message: string];
}>();

const { uploadFile } = useCloudinary();

// 🚀 Image optimization - inline functions
const optimizeCloudinaryImage = (url: string, width: number, height: number, quality: number | "auto" = "auto") => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  const transformations = `w_${width},h_${height},c_fill,f_auto,q_${quality}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};

const presets = {
  thumbnail: (url: string) => optimizeCloudinaryImage(url, 400, 400, "auto"),
  detail: (url: string) => optimizeCloudinaryImage(url, 1000, 1000, 90),
};

// State
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const previewUrls = ref<string[]>([]);
const errorMessage = ref("");
const viewerUrl = ref<string | null>(null);

// Computed
const acceptText = computed(() => {
  const maxSizeMB = props.maxSize || 5;
  return `PNG, JPG, WebP up to ${maxSizeMB}MB`;
});

// Optimize preview images (thumbnail size for grid)
const getOptimizedPreview = (url: string) => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  return presets.thumbnail(url); // 400x400 for preview grid
};

// Optimize viewer image (detail size for modal)
const getOptimizedViewer = (url: string) => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  return presets.detail(url); // 1000x1000 for viewer modal
};

// Initialize with existing URLs
onMounted(() => {
  if (props.modelValue && props.modelValue.length > 0) {
    previewUrls.value = [...props.modelValue];
  }
});

// Watch for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(previewUrls.value)) {
      previewUrls.value = [...newVal];
    }
  }
);

// Trigger file input
const triggerFileInput = () => {
  if (!uploading.value && fileInput.value) {
    fileInput.value.click();
  }
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    handleFiles(Array.from(target.files));
  }
};

// Handle drag & drop
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files));
  }
};

// Process files
const handleFiles = async (files: File[]) => {
  errorMessage.value = "";

  // Validate file count
  if (props.single && files.length > 1) {
    errorMessage.value = "Only one file is allowed";
    return;
  }

  if (props.maxFiles && previewUrls.value.length + files.length > props.maxFiles) {
    errorMessage.value = `Maximum ${props.maxFiles} files allowed`;
    return;
  }

  // Validate file size
  const maxSizeBytes = (props.maxSize || 5) * 1024 * 1024;
  const oversizedFiles = files.filter((f) => f.size > maxSizeBytes);
  if (oversizedFiles.length > 0) {
    errorMessage.value = `Some files exceed ${props.maxSize || 5}MB limit`;
    return;
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const invalidFiles = files.filter((f) => !validTypes.includes(f.type));
  if (invalidFiles.length > 0) {
    errorMessage.value = "Only JPG, PNG, and WebP images are allowed";
    return;
  }

  // Upload files
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const uploadPromises = files.map(async (file, index) => {
      const result = await uploadFile(file, props.folder || "general");

      // Update progress
      uploadProgress.value = Math.round(((index + 1) / files.length) * 100);

      if (result.success && result.data) {
        return result.data.url;
      } else {
        throw new Error(result.error || "Upload failed");
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    // Update preview URLs
    if (props.single) {
      previewUrls.value = [uploadedUrls[0]];
    } else {
      previewUrls.value = [...previewUrls.value, ...uploadedUrls];
    }

    // Emit events
    emit("uploaded", previewUrls.value);
    emit("update:modelValue", previewUrls.value);

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  } catch (error: any) {
    errorMessage.value = error.message || "Upload failed";
    emit("error", errorMessage.value);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// Remove image
const removeImage = (index: number) => {
  previewUrls.value.splice(index, 1);
  emit("uploaded", previewUrls.value);
  emit("update:modelValue", previewUrls.value);
};

// View image in modal
const viewImage = (url: string) => {
  viewerUrl.value = url;
};

// Copy URL to clipboard
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    // Could add a toast notification here
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};
</script>

<style scoped>
.cloudinary-uploader {
  width: 100%;
}
</style>
