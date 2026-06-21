<template>
  <div class="restaurantes-view d-flex flex-column h-100 position-relative" style="background-color: #FEFAF5;">
    <div class="container py-3" style="flex-shrink: 0;">
      <div class="d-flex align-items-center gap-3 mb-3">
        <i class="bi bi-shop fs-3" style="color: #FF5A5F;"></i>
        <div>
          <h2 class="fw-bold mb-0" style="color: #2d2d2d;">Restaurantes</h2>
          <p class="text-muted mb-0 small">Explora lugares cerca de ti</p>
        </div>
      </div>

      <form class="mb-3" @submit.prevent="handleSearch">
        <div class="input-group">
          <input
            v-model="query"
            type="text"
            class="form-control"
            placeholder="Buscar por nombre..."
          />
          <button class="btn" type="submit"
                  style="background-color: #FF5A5F; color: #fff;">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </form>
    </div>

    <div
      ref="scrollEl"
      class="flex-grow-1 overflow-y-auto px-3"
      style="overflow-x: hidden; overscroll-behavior: contain;"
      @scroll="onScroll"
      @wheel="onWheel"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div v-if="refreshing" class="text-center py-2">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Actualizando...</span>
        </div>
      </div>

      <div v-if="!restaurants.length && !loading && !refreshing" class="d-flex align-items-center justify-content-center" style="min-height: 200px;">
        <div class="text-center">
          <i class="bi bi-building text-secondary" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">No hay restaurantes aún</h5>
          <p class="text-muted small">Agrega el primero con el botón +</p>
        </div>
      </div>

      <div v-else>
        <RestaurantCard
          v-for="r in restaurants"
          :key="r.id"
          :restaurant="r"
          @click="$router.push({ name: 'RestauranteDetail', params: { id: r.id } })"
        />

        <div v-if="loading && !refreshing" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-if="!hasMore && restaurants.length > 0" class="text-center py-3">
          <small class="text-muted">Todos los restaurantes cargados</small>
        </div>

        <div class="pb-5"></div>
      </div>
    </div>

    <button
      class="btn btn-primary rounded-circle position-absolute"
      style="width: 56px; height: 56px; bottom: 24px; right: 20px; font-size: 1.5rem; z-index: 1050; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);"
      @click="openModal"
    >
      <i class="bi bi-plus-lg"></i>
    </button>

    <AddRestaurantModal ref="addModal" @save="handleSave" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRestaurants } from '../composables/useRestaurants'
import RestaurantCard from '../components/RestaurantCard.vue'
import AddRestaurantModal from '../components/AddRestaurantModal.vue'

const PULL_THRESHOLD = 80
const SCROLL_BOTTOM_THRESHOLD = 300

const {
  restaurants,
  loading,
  hasMore,
  searchQuery,
  fetchRestaurants,
  searchRestaurants,
  loadMore,
  createRestaurant,
  invalidateCache,
} = useRestaurants()

const query = ref('')
const addModal = ref(null)
const scrollEl = ref(null)
const refreshing = ref(false)

let touchStartY = 0
let touchLastY = 0

function onScroll() {
  const el = scrollEl.value
  if (!el || refreshing.value) return

  if (hasMore.value && !loading.value) {
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining < SCROLL_BOTTOM_THRESHOLD) {
      loadMore()
    }
  }
}

function onWheel(e) {
  const el = scrollEl.value
  if (!el || refreshing.value || loading.value) return
  if (el.scrollTop <= 0 && e.deltaY < 0) {
    triggerRefresh()
  }
}

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e) {
  if (touchStartY === 0) return
  const el = scrollEl.value
  if (!el || el.scrollTop > 0) return
  const touchEndY = e.changedTouches[0].clientY
  const pullDistance = touchEndY - touchStartY
  if (pullDistance > PULL_THRESHOLD) {
    triggerRefresh()
  }
  touchStartY = 0
}

async function triggerRefresh() {
  refreshing.value = true
  query.value = ''
  invalidateCache()
  await fetchRestaurants({ force: true })
  refreshing.value = false
  scrollEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSearch() {
  const q = query.value.trim()
  if (q) {
    invalidateCache()
    searchRestaurants(q)
  } else {
    searchRestaurants('')
  }
}

function openModal() {
  addModal.value?.open()
}

async function handleSave({ data, close, setSaving, setError }) {
  if (!data.name?.trim()) return
  setSaving(true)
  try {
    await createRestaurant(data)
    close()
  } catch (e) {
    setError(e.message || 'Error al guardar')
  }
  setSaving(false)
}

onMounted(() => {
  fetchRestaurants()
})
</script>
