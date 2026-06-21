<template>
  <div class="main-view d-flex flex-column" style="height: calc(var(--vh, 1vh) * 100); overflow: hidden; background-color: #FEFAF5;">
    <div id="viewsCarousel" class="carousel slide flex-grow-1" data-bs-interval="false" data-bs-wrap="false">
      <div class="carousel-inner h-100">
        <div class="carousel-item active h-100">
          <RestaurantesView />
        </div>
        <div class="carousel-item h-100">
          <BuscadorView />
        </div>
      </div>
    </div>

    <AppFooter :activeIndex="activeIndex" @select="goTo" />
  </div>
</template>

<style scoped>
#viewsCarousel {
  min-height: 0;
}
.carousel-inner :deep(.carousel-item) {
  height: 100%;
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Carousel from 'bootstrap/js/dist/carousel'
import RestaurantesView from './RestaurantesView.vue'
import BuscadorView from './BuscadorView.vue'
import AppFooter from '../components/AppFooter.vue'

const activeIndex = ref(0)
let carouselEl = null
let carouselInstance = null

function goTo(index) {
  carouselInstance?.to(index)
}

function onSlide(e) {
  activeIndex.value = e.to
}

function setVh() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

onMounted(() => {
  setVh()
  window.addEventListener('resize', setVh)

  carouselEl = document.getElementById('viewsCarousel')
  if (carouselEl) {
    carouselInstance = new Carousel(carouselEl, { interval: false, wrap: false, touch: true })
    carouselEl.addEventListener('slid.bs.carousel', onSlide)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVh)
  if (carouselEl) {
    carouselEl.removeEventListener('slid.bs.carousel', onSlide)
  }
  carouselInstance?.dispose()
})
</script>
