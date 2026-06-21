<template>
  <div
    class="modal fade"
    id="addRestaurantModal"
    tabindex="-1"
    aria-hidden="true"
    ref="modalEl"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content d-flex flex-column" style="background-color: #FEFAF5;">
        <div class="modal-header border-0 pb-0 flex-shrink-0">
          <h5 class="modal-title fw-bold" style="color: #2d2d2d;">
            <i class="bi" :class="editMode ? 'bi-pencil' : 'bi-plus-circle'" style="color: #FF5A5F; margin-right: 0.5rem;"></i>
            {{ editMode ? 'Editar restaurante' : 'Nuevo restaurante' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="handleSubmit" class="d-flex flex-column flex-grow-1 overflow-hidden">
          <div class="px-3 pt-2 pb-2 flex-shrink-0" style="background-color: #FEFAF5;">
            <label class="form-label fw-semibold mb-1">Nombre</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="Nombre del restaurante"
              required
            />
          </div>

          <div class="flex-grow-1 overflow-auto px-3">
            <div class="mb-3">
              <label class="form-label fw-semibold">Imagen (URL)</label>
              <input
                v-model="form.image_url"
                type="url"
                class="form-control"
                placeholder="https://..."
              />
              <div v-if="form.image_url" class="mt-2">
                <img :src="form.image_url" alt="preview" class="rounded"
                     style="max-height: 120px; max-width: 100%; object-fit: cover;" />
              </div>
            </div>

            <hr />

            <h6 class="fw-semibold mb-3">Etiquetas</h6>

            <div class="mb-3">
              <label class="form-label">Lugar</label>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <span v-for="(tag, i) in form.tags.place" :key="i"
                      class="badge d-inline-flex align-items-center gap-1"
                      style="background-color: #FF5A5F; color: #fff;">
                  {{ tag }}
                  <i class="bi bi-x" style="cursor: pointer;" @click="removeTag('place', i)"></i>
                </span>
              </div>
              <div class="input-group">
                <input v-model="tagInputs.place" type="text" class="form-control"
                       placeholder="Ej: Centro, Norte"
                       @keydown.enter.prevent="addTag('place')" />
                <button class="btn" type="button" @click="addTag('place')"
                        style="background-color: #F5C25D; color: #fff;">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Tipo de comida</label>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <span v-for="(tag, i) in form.tags.food_type" :key="i"
                      class="badge d-inline-flex align-items-center gap-1"
                      style="background-color: #F5C25D; color: #fff;">
                  {{ tag }}
                  <i class="bi bi-x" style="cursor: pointer;" @click="removeTag('food_type', i)"></i>
                </span>
              </div>
              <div class="input-group">
                <input v-model="tagInputs.food_type" type="text" class="form-control"
                       placeholder="Ej: Japonesa, Pizza"
                       @keydown.enter.prevent="addTag('food_type')" />
                <button class="btn" type="button" @click="addTag('food_type')"
                        style="background-color: #F5C25D; color: #fff;">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Precio</label>
              <div class="d-flex flex-wrap gap-2">
                <span v-for="p in ['$', '$$', '$$$']" :key="p"
                      class="badge d-inline-flex align-items-center"
                      :style="{
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        backgroundColor: form.tags.price.includes(p) ? '#FF5A5F' : '#d4d1cb',
                        color: form.tags.price.includes(p) ? '#fff' : '#2d2d2d',
                      }"
                      @click="togglePrice(p)">
                  {{ p }}
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Otros</label>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <span v-for="(tag, i) in form.tags.other" :key="i"
                      class="badge d-inline-flex align-items-center gap-1"
                      style="background-color: #7EC8A0; color: #fff;">
                  {{ tag }}
                  <i class="bi bi-x" style="cursor: pointer;" @click="removeTag('other', i)"></i>
                </span>
              </div>
              <div class="input-group">
                <input v-model="tagInputs.other" type="text" class="form-control"
                       placeholder="Ej: Familiar, Terraza"
                       @keydown.enter.prevent="addTag('other')" />
                <button class="btn" type="button" @click="addTag('other')"
                        style="background-color: #F5C25D; color: #fff;">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <p v-if="error" class="text-danger small mt-2">{{ error }}</p>
          </div>

          <div class="px-3 pt-2 pb-3 flex-shrink-0" style="background-color: #FEFAF5;">
            <button type="submit" class="btn btn-primary w-100" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Guardando...' : (editMode ? 'Guardar cambios' : 'Guardar restaurante') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import Modal from 'bootstrap/js/dist/modal'

const emit = defineEmits(['save'])
const modalEl = ref(null)
let modalInstance = null

const editMode = ref(false)
let editingId = null

const form = reactive({
  name: '',
  image_url: '',
  tags: { place: [], food_type: [], price: [], other: [] },
})

const tagInputs = reactive({
  place: '',
  food_type: '',
  price: '',
  other: '',
})

const saving = ref(false)
const error = ref('')

function addTag(category) {
  const val = tagInputs[category].trim()
  if (val && !form.tags[category].includes(val)) {
    form.tags[category].push(val)
  }
  tagInputs[category] = ''
}

function removeTag(category, index) {
  form.tags[category].splice(index, 1)
}

function togglePrice(price) {
  const idx = form.tags.price.indexOf(price)
  if (idx >= 0) {
    form.tags.price.splice(idx, 1)
  } else {
    form.tags.price.push(price)
  }
}

function resetForm() {
  form.name = ''
  form.image_url = ''
  form.tags = { place: [], food_type: [], price: [], other: [] }
  Object.keys(tagInputs).forEach(k => tagInputs[k] = '')
  error.value = ''
  editMode.value = false
  editingId = null
}

function open() {
  resetForm()
  modalInstance?.show()
}

function openForEdit(restaurant) {
  resetForm()
  editMode.value = true
  editingId = restaurant.id
  form.name = restaurant.name
  form.image_url = restaurant.image_url || ''
  form.tags = {
    place: [...(restaurant.tags?.place || [])],
    food_type: [...(restaurant.tags?.food_type || [])],
    price: [...(restaurant.tags?.price || [])],
    other: [...(restaurant.tags?.other || [])],
  }
  modalInstance?.show()
}

function close() {
  modalInstance?.hide()
}

function setSaving(val) {
  saving.value = val
}

function setError(msg) {
  error.value = msg
}

async function handleSubmit() {
  emit('save', {
    id: editingId,
    editMode: editMode.value,
    data: { ...form, tags: { ...form.tags } },
    close,
    setSaving,
    setError,
  })
}

onMounted(() => {
  if (modalEl.value) {
    modalInstance = new Modal(modalEl.value, { backdrop: 'static' })
  }
})

onBeforeUnmount(() => {
  modalInstance?.dispose()
})

defineExpose({ open, openForEdit, close })
</script>
