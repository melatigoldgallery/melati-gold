<template>
  <div class="min-h-screen bg-cream">
    <SiteHeader />
    <main class="relative">
      <slot />
    </main>
    <!-- Toast Notifications -->
    <ToastNotification />
  </div>
</template>
