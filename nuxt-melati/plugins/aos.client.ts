import AOS from "aos";
import "aos/dist/aos.css";

export default defineNuxtPlugin(() => {
  if (process.server) return;

  // Initialize AOS with optimal settings for jewelry landing page
  AOS.init({
    duration: 800, // Animation duration in milliseconds
    delay: 100, // Delay between animations
    once: false, // Allow animations to repeat on scroll
    offset: 100, // Trigger offset from viewport bottom
    easing: "ease-in-out-cubic", // Smooth easing for luxury feel
    anchorPlacement: "top-bottom", // Animation trigger position
    disable: false, // Enable on all devices
  } as any);

  // Refresh AOS after route changes (for Nuxt)
  watch(
    () => useRoute().path,
    () => {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    },
  );
});
