<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.id" class="border rounded-lg p-4 flex items-center gap-4">
      <img :src="item.imageUrl || '/img/placeholder.jpg'" :alt="item.title" class="w-16 h-16 object-cover rounded" />
      <div class="flex-1">
        <h3 class="font-medium">{{ item.title }}</h3>
        <p class="text-sm text-gray-600">{{ item.metadata?.karat }} - {{ formatIDR(item.price) }}</p>
        <p class="text-xs text-gray-500">{{ item.description?.substring(0, 60) }}...</p>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('edit', item)" class="btn-edit">Edit</button>
        <button @click="$emit('delete', item)" class="btn-delete">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(["edit", "delete"]);
defineProps<{
  items: any[];
}>();

const formatIDR = (price: number) => {
  if (!price) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};
</script>

<style scoped>
.btn-edit {
  @apply px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600;
}
.btn-delete {
  @apply px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600;
}
</style>
