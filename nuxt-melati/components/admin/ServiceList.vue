<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.id" class="border rounded-lg p-4 flex items-center gap-4">
      <img :src="item.imageUrl || '/img/placeholder.jpg'" :alt="item.title" class="w-16 h-16 object-cover rounded" />
      <div class="flex-1">
        <h3 class="font-medium">{{ item.title }}</h3>
        <p class="text-xs text-gray-500">{{ item.description?.substring(0, 80) }}...</p>
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
</script>

<style scoped>
.btn-edit {
  @apply px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600;
}
.btn-delete {
  @apply px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600;
}
</style>
