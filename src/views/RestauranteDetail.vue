<template>
  <div class="restaurante-detail min-vh-100" style="background-color: #FEFAF5;">
    <div class="container py-4">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <button class="btn border-0 d-flex align-items-center justify-content-center"
                style="width: 38px; height: 38px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
                @click="$router.back()">
          <i class="bi bi-chevron-left" style="color: #2d2d2d; font-size: 1.1rem;"></i>
        </button>
        <button v-if="restaurant"
                class="btn border-0 d-flex align-items-center justify-content-center"
                style="width: 38px; height: 38px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
                @click="openEdit">
          <i class="bi bi-pencil-fill" style="color: #FF5A5F; font-size: 0.9rem;"></i>
        </button>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="error" class="text-center py-5">
        <p class="text-danger">{{ error }}</p>
      </div>

      <template v-else-if="restaurant">
        <div class="card shadow-sm border-0 overflow-hidden">
          <div v-if="restaurant.image_url" class="w-100" style="height: 220px; overflow: hidden;">
            <img :src="restaurant.image_url" :alt="restaurant.name"
                 class="w-100 h-100" style="object-fit: cover;" />
          </div>
          <div class="card-body">
            <h3 class="fw-bold" style="color: #2d2d2d;">{{ restaurant.name }}</h3>

            <div v-for="(tags, cat) in restaurant.tags" :key="cat" class="mb-2">
              <template v-if="tags.length">
                <small class="text-muted fw-semibold me-2">
                  {{ categoryLabel(cat) }}:
                </small>
                <span
                  v-for="t in tags" :key="t"
                  class="badge me-1"
                  :style="{ backgroundColor: categoryColor(cat), color: '#fff' }"
                >
                  {{ t }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <AddRestaurantModal ref="editModal" @save="handleEditSave" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRestaurants } from '../composables/useRestaurants'
import AddRestaurantModal from '../components/AddRestaurantModal.vue'

const route = useRoute()
const { getRestaurantById, updateRestaurant, invalidateCache } = useRestaurants()

const restaurant = ref(null)
const loading = ref(true)
const error = ref('')
const editModal = ref(null)

function categoryLabel(cat) {
  const labels = { place: 'Lugar', food_type: 'Tipo', price: 'Precio', other: 'Otros' }
  return labels[cat] || cat
}

function categoryColor(cat) {
  const colors = { place: '#FF5A5F', food_type: '#F5C25D', price: '#FF5A5F', other: '#7EC8A0' }
  return colors[cat] || '#6c757d'
}

function openEdit() {
  editModal.value?.openForEdit(restaurant.value)
}

async function handleEditSave({ id, data, close, setSaving, setError }) {
  setSaving(true)
  try {
    await updateRestaurant(id, data)
    invalidateCache()
    restaurant.value = await getRestaurantById(id)
    close()
  } catch (e) {
    setError(e.message || 'Error al guardar')
  }
  setSaving(false)
}

onMounted(async () => {
  try {
    restaurant.value = await getRestaurantById(route.params.id)
  } catch (e) {
    error.value = 'Error al cargar el restaurante'
  }
  loading.value = false
})
</script>
