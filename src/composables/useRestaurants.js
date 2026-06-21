import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 10

const cache = {
  list: null,
  listQuery: '',
  detail: new Map(),
}

export function useRestaurants() {
  const restaurants = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const searchQuery = ref('')

  async function fetchRestaurants({ append = false, query = '', force = false } = {}) {
    if (!force && !append && !query && cache.list) {
      restaurants.value = cache.list
      return
    }

    loading.value = true

    let sbQuery = supabase
      .from('restaurants')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (query) {
      sbQuery = sbQuery.ilike('name', `%${query}%`)
    }

    const offset = append ? restaurants.value.length : 0
    sbQuery = sbQuery.range(offset, offset + PAGE_SIZE - 1)

    const { data, error } = await sbQuery
    if (error) {
      console.error(error)
      loading.value = false
      return
    }

    if (append) {
      restaurants.value = [...restaurants.value, ...data]
    } else {
      restaurants.value = data
      if (!query) {
        cache.list = data
        cache.listQuery = ''
      }
    }

    hasMore.value = data.length === PAGE_SIZE
    loading.value = false
  }

  async function searchRestaurants(query) {
    searchQuery.value = query
    restaurants.value = []
    await fetchRestaurants({ query })
  }

  async function loadMore() {
    await fetchRestaurants({ append: true, query: searchQuery.value })
  }

  async function createRestaurant({ name, image_url, tags }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .insert({ name, image_url, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    for (const [category, tagNames] of Object.entries(tags)) {
      if (!tagNames.length) continue
      for (const tagName of tagNames) {
        const trimmed = tagName.trim()
        if (!trimmed) continue

        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: trimmed, category }, { onConflict: 'name,category', ignoreDuplicates: false })
          .select()
          .single()

        if (tag) {
          await supabase
            .from('restaurant_tags')
            .insert({ restaurant_id: restaurant.id, tag_id: tag.id })
        }
      }
    }

    cache.list = null
    restaurants.value.unshift(restaurant)
    return restaurant
  }

  async function updateRestaurant(id, { name, image_url, tags }) {
    const { error } = await supabase
      .from('restaurants')
      .update({ name, image_url })
      .eq('id', id)

    if (error) throw error

    await supabase.from('restaurant_tags').delete().eq('restaurant_id', id)

    for (const [category, tagNames] of Object.entries(tags)) {
      if (!tagNames.length) continue
      for (const tagName of tagNames) {
        const trimmed = tagName.trim()
        if (!trimmed) continue

        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: trimmed, category }, { onConflict: 'name,category', ignoreDuplicates: false })
          .select()
          .single()

        if (tag) {
          await supabase
            .from('restaurant_tags')
            .insert({ restaurant_id: id, tag_id: tag.id })
        }
      }
    }

    cache.list = null
    cache.detail.delete(id)
  }

  async function getRestaurantById(id) {
    const cached = cache.detail.get(id)
    if (cached) return cached

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: tagsData } = await supabase
      .from('restaurant_tags')
      .select('tag:tag_id(*)')
      .eq('restaurant_id', id)

    const tags = { place: [], food_type: [], price: [], other: [] }
    if (tagsData) {
      for (const { tag } of tagsData) {
        if (tags[tag.category]) {
          tags[tag.category].push(tag.name)
        }
      }
    }

    const result = { ...data, tags }
    cache.detail.set(id, result)
    return result
  }

  function invalidateCache() {
    cache.list = null
    cache.detail.clear()
  }

  return {
    restaurants,
    loading,
    hasMore,
    searchQuery,
    fetchRestaurants,
    searchRestaurants,
    loadMore,
    createRestaurant,
    updateRestaurant,
    getRestaurantById,
    invalidateCache,
  }
}
