export default defineNuxtPlugin(() => {
  if (process.server) return

  const reveal = () => {
    const els = document.querySelectorAll<HTMLElement>('.reveal, .reveal-up, .reveal-in, .reveal-right')
    const vh = window.innerHeight
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      if (rect.top < vh * 0.9) {
        el.classList.add('is-revealed')
      }
    }
  }

  reveal()
  window.addEventListener('scroll', reveal, { passive: true })
  window.addEventListener('resize', reveal)
})
