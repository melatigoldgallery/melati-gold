import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey

  const client = (url && key)
    ? createClient(url, key)
    : null

  return {
    provide: {
      supabase: client
    }
  }
})

export const useSupabaseClient = () => {
  const { $supabase } = useNuxtApp()
  return $supabase
}
