import AOS from "aos";
import "aos/dist/aos.css";

export default defineNuxtPlugin(() => {
  if (process.server) return;

  // Initialize AOS with optimal settings for jewelry landing page
  AOS.init({
    duration: 800, 
    delay: 100, 
    once: true,
    offset: 100,
    easing: "ease-in-out-cubic",
    anchorPlacement: "top-bottom", 
    disable: false, 
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
