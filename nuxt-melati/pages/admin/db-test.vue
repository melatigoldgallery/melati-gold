<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Database Connection Test</h1>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Supabase Status</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="font-medium">Client Available:</span>
            <span :class="supabaseAvailable ? 'text-green-600' : 'text-red-600'">
              {{ supabaseAvailable ? "✅ Yes" : "❌ No" }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-medium">URL:</span>
            <span class="text-sm text-gray-600">{{ supabaseUrl || "Not configured" }}</span>
          </div>
        </div>
      </div>

      <!-- Test Buttons -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Database Tests</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="testCategories" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Test catalog_categories
          </button>
          <button @click="testSubcategories" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            Test catalog_subcategories
          </button>
          <button @click="testProducts" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
            Test catalog_products
          </button>
          <button @click="testServices" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Test custom_services
          </button>
          <button @click="clearResults" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
            Clear Results
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="results.length > 0" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Test Results</h2>
        <div class="space-y-4">
          <div
            v-for="(result, idx) in results"
            :key="idx"
            class="border-l-4 p-4 rounded"
            :class="result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold" :class="result.success ? 'text-green-700' : 'text-red-700'">
                {{ result.table }}
              </h3>
              <span class="text-xs text-gray-500">{{ result.timestamp }}</span>
            </div>

            <div v-if="result.success" class="text-sm">
              <p class="text-green-700 mb-2">✅ Success! Rows found: {{ result.count }}</p>
              <details v-if="result.data && result.data.length > 0" class="mt-2">
                <summary class="cursor-pointer text-blue-600 hover:underline">View Data</summary>
                <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{{
                  JSON.stringify(result.data, null, 2)
                }}</pre>
              </details>
              <p v-else class="text-gray-600 italic">Table exists but is empty (0 rows)</p>
            </div>

            <div v-else class="text-sm text-red-700">
              <p class="font-medium mb-1">❌ Error:</p>
              <pre class="p-3 bg-red-100 rounded text-xs overflow-auto">{{ result.error }}</pre>

              <div
                v-if="result.errorType === 'table_not_found'"
                class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded"
              >
                <p class="font-medium text-yellow-800">💡 Solution:</p>
                <ol class="list-decimal list-inside text-yellow-700 text-xs mt-2 space-y-1">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>
                    Copy content from
                    <code class="bg-yellow-200 px-1">database/catalog_schema.sql</code>
                  </li>
                  <li>Paste and Run in SQL Editor</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 class="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
        <ol class="list-decimal list-inside text-blue-800 text-sm space-y-1">
          <li>Click each test button to check if database tables exist</li>
          <li>
            If you see "relation does not exist" error, run
            <code class="bg-blue-200 px-1">database/catalog_schema.sql</code>
            in Supabase
          </li>
          <li>If tables exist but empty, that's normal for new setup</li>
          <li>catalog_categories should have 6 default rows</li>
          <li>custom_services should have 4 default rows</li>
        </ol>
      </div>

      <div class="mt-6 text-center">
        <NuxtLink to="/admin/catalog" class="text-blue-600 hover:underline">← Back to Catalog Management</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: false,
});

const { $supabase } = useNuxtApp();

const supabaseAvailable = ref(!!$supabase);
const supabaseUrl = ref("");
const results = ref<any[]>([]);

onMounted(() => {
  const config = useRuntimeConfig();
  supabaseUrl.value = config.public.supabaseUrl || "";
  console.log("[DB Test] Supabase client available:", supabaseAvailable.value);
  console.log("[DB Test] URL:", supabaseUrl.value);
});

const testTable = async (tableName: string) => {
  if (!$supabase) {
    results.value.unshift({
      table: tableName,
      success: false,
      error: "Supabase client not available",
      timestamp: new Date().toLocaleTimeString(),
    });
    return;
  }

  try {
    console.log(`[DB Test] Testing ${tableName}...`);
    const { data, error } = await $supabase.from(tableName).select("*");

    if (error) {
      console.error(`[DB Test] Error testing ${tableName}:`, error);

      const errorType =
        error.message?.includes("relation") && error.message?.includes("does not exist") ? "table_not_found" : "other";

      results.value.unshift({
        table: tableName,
        success: false,
        error: error.message || JSON.stringify(error),
        errorType,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      console.log(`[DB Test] Success ${tableName}:`, data?.length || 0, "rows");
      results.value.unshift({
        table: tableName,
        success: true,
        count: data?.length || 0,
        data: data || [],
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  } catch (err: any) {
    console.error(`[DB Test] Exception testing ${tableName}:`, err);
    results.value.unshift({
      table: tableName,
      success: false,
      error: err.message || String(err),
      timestamp: new Date().toLocaleTimeString(),
    });
  }
};

const testCategories = () => testTable("catalog_categories");
const testSubcategories = () => testTable("catalog_subcategories");
const testProducts = () => testTable("catalog_products");
const testServices = () => testTable("custom_services");

const clearResults = () => {
  results.value = [];
};
</script>
