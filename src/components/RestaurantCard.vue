<template>
  <div class="card restaurant-card mb-3" style="cursor: pointer;" @click="$emit('click')">
    <div class="row g-0 align-items-stretch">
      <div class="col-4">
        <div
          class="restaurant-card-img h-100"
          :style="{ backgroundImage: `url(${restaurant.image_url})` }"
        >
          <div v-if="!restaurant.image_url" class="d-flex align-items-center justify-content-center h-100"
               style="background-color: #f0eeeb;">
            <i class="bi bi-image text-muted" style="font-size: 1.5rem;"></i>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="card-body d-flex align-items-center h-100">
          <h6 class="card-title mb-0 fw-semibold" style="color: #2d2d2d;">
            {{ restaurant.name }}
          </h6>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  restaurant: { type: Object, required: true },
})
defineEmits(['click'])
</script>

<style scoped>
.restaurant-card {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #e9e7e2;
  transition: box-shadow 0.15s ease;
}
.restaurant-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.restaurant-card-img {
  background-size: cover;
  background-position: center;
  min-height: 90px;
}
</style>
