<template>
  <div class="buscador-view d-flex flex-column h-100" style="background-color: #FEFAF5;">
    <div class="container py-3" style="flex-shrink: 0;">
      <div class="d-flex align-items-center gap-3 mb-2">
        <i class="bi bi-search fs-3" style="color: #FF5A5F;"></i>
        <div>
          <h2 class="fw-bold mb-0" style="color: #2d2d2d;">Buscar</h2>
          <p class="text-muted mb-0 small">Encuentra restaurantes por nombre o etiquetas</p>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
           style="background-color: #ffffff; border: 1px solid #e9e7e2; cursor: pointer;"
           @click="filtersOpen = !filtersOpen">
        <i class="bi bi-funnel" :style="{ color: hasActiveFilters ? '#FF5A5F' : '#a09d96', fontSize: '0.9rem' }"></i>
        <span class="flex-grow-1" style="font-size: 0.85rem; color: #5c5954;">
          <template v-if="hasActiveFilters">
            {{ activeFilterCount }} filtro{{ activeFilterCount !== 1 ? 's' : '' }} activo{{ activeFilterCount !== 1 ? 's' : '' }}
          </template>
          <template v-else>Sin filtros</template>
        </span>
        <i class="bi" :class="filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'"
           style="color: #a09d96; font-size: 0.8rem;"></i>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto px-3">
      <template v-if="filtersOpen">
        <div class="px-3 py-3 rounded-3 mb-3" style="background-color: #ffffff; border: 1px solid #e9e7e2;">
          <div class="mb-3">
            <label class="form-label fw-semibold small mb-1">Nombre</label>
            <input
              v-model="filters.nombre"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre..."
            />
          </div>

          <div v-for="cat in filterCategories" :key="cat.key" class="mb-3">
            <label class="form-label fw-semibold small mb-1">{{ cat.label }}</label>
            <template v-if="cat.key !== 'price'">
              <div class="input-group mb-1">
                <input
                  v-model="tagSearch[cat.key]"
                  type="text"
                  class="form-control"
                  placeholder="Filtrar etiquetas..."
                  @click.stop
                />
                <button v-if="tagSearch[cat.key]" class="btn btn-outline-secondary" type="button"
                        style="border-color: #e9e7e2;"
                        @click.stop="tagSearch[cat.key] = ''">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </template>
            <div class="d-flex flex-nowrap gap-1 overflow-auto pb-1" style="scrollbar-width: thin;">
              <template v-if="cat.key === 'price'">
                <span v-for="p in ['$', '$$', '$$$']" :key="p"
                      class="badge d-inline-flex align-items-center"
                      :style="{
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0.4em 0.65em',
                        backgroundColor: filters.price.includes(p) ? '#FF5A5F' : '#e9e7e2',
                        color: filters.price.includes(p) ? '#fff' : '#5c5954',
                        transition: 'background-color 0.15s',
                      }"
                      @click="togglePrice(p)">
                  {{ p }}
                </span>
              </template>
              <template v-else>
                <template v-if="filteredTags[cat.key]?.length">
                  <span v-for="tag in filteredTags[cat.key]" :key="tag.id"
                        class="badge d-inline-flex align-items-center"
                        :style="{
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '0.4em 0.65em',
                          backgroundColor: selectedTagIds.has(tag.id) ? categoryColor(cat.key) : '#e9e7e2',
                          color: selectedTagIds.has(tag.id) ? '#fff' : '#5c5954',
                          transition: 'background-color 0.15s',
                        }"
                        @click="toggleTag(tag)">
                    {{ tag.name }}
                  </span>
                </template>
                <span v-else class="text-muted" style="font-size: 0.8rem;">Sin etiquetas disponibles</span>
              </template>
            </div>
          </div>

          <button class="btn w-100 mt-2" style="background-color: #FF5A5F; color: #fff;"
                  @click="executeSearch">
            Mostrar resultados
          </button>
        </div>
      </template>

      <template v-else-if="hasSearched">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border spinner-border-sm" style="color: #FF5A5F;" role="status">
            <span class="visually-hidden">Buscando...</span>
          </div>
        </div>

        <div v-else-if="!results.length" class="d-flex align-items-center justify-content-center" style="min-height: 200px;">
          <div class="text-center">
            <i class="bi bi-search" style="color: #F5C25D; font-size: 2.5rem;"></i>
            <h5 class="mt-2 text-muted">Sin resultados</h5>
            <p class="text-muted small">Prueba con otros filtros</p>
          </div>
        </div>

        <div v-else>
          <small class="text-muted d-block mb-2">{{ results.length }} resultado{{ results.length !== 1 ? 's' : '' }}</small>
          <RestaurantCard
            v-for="r in results"
            :key="r.id"
            :restaurant="r"
            @click="$router.push({ name: 'RestauranteDetail', params: { id: r.id } })"
          />
          <div class="pb-4"></div>
        </div>
      </template>

      <div v-else class="d-flex align-items-center justify-content-center" style="min-height: 300px;">
        <div class="text-center">
          <h5 class="mt-3 text-muted">Sin resultados</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import RestaurantCard from '../components/RestaurantCard.vue'

function categoryColor(cat) {
  const colors = { place: '#FF5A5F', food_type: '#F5C25D', price: '#FF5A5F', other: '#7EC8A0' }
  return colors[cat] || '#6c757d'
}

const filtersOpen = ref(false)
const hasSearched = ref(false)
const loading = ref(false)
const results = ref([])
const allTags = ref([])

const filters = reactive({
  nombre: '',
  place: [],
  food_type: [],
  price: [],
  other: [],
})

const tagSearch = reactive({
  place: '',
  food_type: '',
  other: '',
})

const selectedTagIds = computed(() => {
  const ids = new Set()
  for (const [cat, tags] of Object.entries(groupedTags.value)) {
    if (cat === 'price') continue
    for (const tag of tags) {
      if (filters[cat]?.includes(tag.name)) {
        ids.add(tag.id)
      }
    }
  }
  return ids
})

const filterCategories = [
  { key: 'place', label: 'Lugar' },
  { key: 'food_type', label: 'Tipo de comida' },
  { key: 'price', label: 'Precio' },
  { key: 'other', label: 'Otros' },
]

const groupedTags = computed(() => {
  const groups = { place: [], food_type: [], price: [], other: [] }
  for (const tag of allTags.value) {
    if (groups[tag.category]) {
      groups[tag.category].push(tag)
    }
  }
  return groups
})

const filteredTags = computed(() => {
  const result = { place: [], food_type: [], other: [] }
  for (const cat of ['place', 'food_type', 'other']) {
    const search = tagSearch[cat].toLowerCase()
    result[cat] = groupedTags.value[cat]?.filter(t => t.name.toLowerCase().includes(search)) || []
  }
  return result
})

const hasActiveFilters = computed(() => {
  return filters.nombre.trim() ||
    filters.place.length ||
    filters.food_type.length ||
    filters.price.length ||
    filters.other.length
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.nombre.trim()) count++
  if (filters.place.length) count++
  if (filters.food_type.length) count++
  if (filters.price.length) count++
  if (filters.other.length) count++
  return count
})

function toggleTag(tag) {
  const arr = filters[tag.category]
  const idx = arr.indexOf(tag.name)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(tag.name)
  }
}

function togglePrice(price) {
  const idx = filters.price.indexOf(price)
  if (idx >= 0) {
    filters.price.splice(idx, 1)
  } else {
    filters.price.push(price)
  }
}

async function executeSearch() {
  filtersOpen.value = false
  hasSearched.value = true
  loading.value = true
  results.value = []

  try {
    let restaurantIds = null

    const activeCategories = ['place', 'food_type', 'other']
    const hasTagFilters = activeCategories.some(cat => filters[cat].length) || filters.price.length

    if (hasTagFilters) {
      const tagNames = []
      for (const cat of activeCategories) {
        for (const name of filters[cat]) {
          tagNames.push({ name, category: cat })
        }
      }
      for (const price of filters.price) {
        tagNames.push({ name: price, category: 'price' })
      }

      if (tagNames.length) {
        const { data: matchedTags } = await supabase
          .from('tags')
          .select('id')
          .in('name', tagNames.map(t => t.name))
          .in('category', [...new Set(tagNames.map(t => t.category))])

        if (matchedTags?.length) {
          const matchedIds = matchedTags.map(t => t.id)

          const { data: rtData } = await supabase
            .from('restaurant_tags')
            .select('restaurant_id')
            .in('tag_id', matchedIds)

          if (rtData?.length) {
            restaurantIds = [...new Set(rtData.map(r => r.restaurant_id))]
          } else {
            restaurantIds = []
          }
        } else {
          restaurantIds = []
        }
      }
    }

    if (restaurantIds !== null && restaurantIds.length === 0) {
      results.value = []
      loading.value = false
      return
    }

    let query = supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.nombre.trim()) {
      query = query.ilike('name', `%${filters.nombre.trim()}%`)
    }

    if (restaurantIds !== null) {
      query = query.in('id', restaurantIds)
    }

    const { data, error } = await query
    if (!error) {
      results.value = data
    }
  } catch (e) {
    console.error(e)
  }

  loading.value = false
}

onMounted(async () => {
  const { data } = await supabase.from('tags').select('*').order('name')
  if (data) allTags.value = data
})
</script>
