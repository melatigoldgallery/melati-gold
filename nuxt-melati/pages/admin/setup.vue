<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">Database Setup & Testing</h1>

        <!-- Connection Status -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3">Connection Status</h2>
          <div class="flex items-center gap-3">
            <button
              @click="testConnection"
              :disabled="testing"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ testing ? "Testing..." : "Test Connection" }}
            </button>
            <div v-if="connectionStatus" class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', connectionStatus.connected ? 'bg-green-500' : 'bg-red-500']"></div>
              <span :class="connectionStatus.connected ? 'text-green-700' : 'text-red-700'">
                {{ connectionStatus.connected ? "Connected" : "Disconnected" }}
              </span>
            </div>
          </div>
          <div v-if="connectionStatus?.error" class="mt-2 text-sm text-red-600">
            Error: {{ connectionStatus.error }}
          </div>
        </div>

        <!-- Database Operations -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3">Database Operations</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              @click="initDb"
              :disabled="loading"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {{ loading ? "Initializing..." : "Initialize Sample Data" }}
            </button>
            <button
              @click="clearDb"
              :disabled="loading"
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {{ loading ? "Clearing..." : "Clear All Data" }}
            </button>
          </div>
        </div>

        <!-- Content Overview -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3">Content Overview</h2>
          <button
            @click="loadAllContent"
            :disabled="loadingContent"
            class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 mb-4"
          >
            {{ loadingContent ? "Loading..." : "Load Content" }}
          </button>

          <div v-if="contentData" class="space-y-4">
            <div v-for="(items, section) in contentData" :key="section" class="border rounded p-4">
              <h3 class="font-semibold capitalize mb-2">{{ section }} ({{ items.length }} items)</h3>
              <div class="space-y-2">
                <div v-for="item in items.slice(0, 3)" :key="item.id" class="text-sm text-gray-600">
                  • {{ item.title || item.itemKey }}
                </div>
                <div v-if="items.length > 3" class="text-sm text-gray-500">... and {{ items.length - 3 }} more</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environment Check -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3">Environment Configuration</h2>
          <div class="bg-gray-100 rounded p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Supabase URL:</span>
              <span :class="config.public.supabaseUrl ? 'text-green-600' : 'text-red-600'">
                {{ config.public.supabaseUrl ? "✓ Configured" : "✗ Missing" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Supabase Anon Key:</span>
              <span :class="config.public.supabaseAnonKey ? 'text-green-600' : 'text-red-600'">
                {{ config.public.supabaseAnonKey ? "✓ Configured" : "✗ Missing" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Cloudinary Cloud Name:</span>
              <span :class="config.public.cloudinaryCloudName ? 'text-green-600' : 'text-red-600'">
                {{ config.public.cloudinaryCloudName ? "✓ Configured" : "✗ Missing" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Cloudinary Upload Preset:</span>
              <span :class="config.public.cloudinaryUploadPreset ? 'text-green-600' : 'text-red-600'">
                {{ config.public.cloudinaryUploadPreset ? "✓ Configured" : "✗ Missing" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="message" class="mb-4">
          <div
            :class="[
              'p-4 rounded',
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            ]"
          >
            {{ message }}
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex gap-4">
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">← Back to Website</NuxtLink>
          <NuxtLink to="/admin" class="text-blue-600 hover:text-blue-800">Go to Admin Panel →</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Add authentication middleware
definePageMeta({
  layout: false,
  middleware: "auth",
});

const config = useRuntimeConfig();
const { checkConnection, initializeDatabase, clearDatabase } = useDatabase();
const { content, loadContent } = useContentManager();

const testing = ref(false);
const loading = ref(false);
const loadingContent = ref(false);
const connectionStatus = ref<any>(null);
const contentData = ref<any>(null);
const message = ref("");
const messageType = ref<"success" | "error">("success");

const showMessage = (msg: string, type: "success" | "error" = "success") => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
  }, 5000);
};

const testConnection = async () => {
  testing.value = true;
  try {
    connectionStatus.value = await checkConnection();
    if (connectionStatus.value.connected) {
      showMessage("Database connection successful!", "success");
    } else {
      showMessage(`Connection failed: ${connectionStatus.value.error}`, "error");
    }
  } catch (error: any) {
    showMessage(`Connection test failed: ${error.message}`, "error");
  } finally {
    testing.value = false;
  }
};

const initDb = async () => {
  loading.value = true;
  try {
    const result = await initializeDatabase();
    showMessage(result.message, "success");
  } catch (error: any) {
    showMessage(error.message, "error");
  } finally {
    loading.value = false;
  }
};

const clearDb = async () => {
  if (!confirm("Are you sure you want to clear all data? This cannot be undone.")) {
    return;
  }

  loading.value = true;
  try {
    const result = await clearDatabase();
    showMessage(result.message, "success");
    contentData.value = null;
  } catch (error: any) {
    showMessage(error.message, "error");
  } finally {
    loading.value = false;
  }
};

const loadAllContent = async () => {
  loadingContent.value = true;
  try {
    await loadContent();
    contentData.value = content.value;
    showMessage("Content loaded successfully!", "success");
  } catch (error: any) {
    showMessage(`Failed to load content: ${error.message}`, "error");
  } finally {
    loadingContent.value = false;
  }
};

// Test connection on mount
onMounted(() => {
  testConnection();
});
</script>
