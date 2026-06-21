<template>
  <footer class="app-footer" style="background-color: #ffffff; border-top: 1px solid #e9e7e2;">
    <div class="d-flex align-items-center justify-content-around py-1" style="height: 60px;">
      <div class="d-flex align-items-center justify-content-center flex-fill h-100"
           style="cursor: pointer; transition: flex 0.35s ease;"
           :style="{ flex: activeIndex === 0 ? '2' : '1' }"
           @click="$emit('select', 0)">
        <div class="d-flex align-items-center gap-1 rounded-pill px-3 py-1"
             :style="activeIndex === 0 ? { backgroundColor: '#f0eeeb', color: '#FF5A5F' } : { color: '#a09d96' }">
          <i class="bi bi-shop" style="font-size: 1.1rem;"></i>
          <span style="font-size: 0.75rem; font-weight: 600;">Restaurantes</span>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center flex-fill h-100"
           style="cursor: pointer; transition: flex 0.35s ease;"
           :style="{ flex: activeIndex === 1 ? '2' : '1' }"
           @click="$emit('select', 1)">
        <div class="d-flex align-items-center gap-1 rounded-pill px-3 py-1"
             :style="activeIndex === 1 ? { backgroundColor: '#f0eeeb', color: '#FF5A5F' } : { color: '#a09d96' }">
          <i class="bi bi-search" style="font-size: 1.1rem;"></i>
          <span style="font-size: 0.75rem; font-weight: 600;">Buscar</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  activeIndex: { type: Number, default: 0 },
})
defineEmits(['select'])
</script>
