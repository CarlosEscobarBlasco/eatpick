<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
    <div class="login-card card shadow-sm p-4" style="max-width: 420px; width: 100%;">
      <div class="text-center mb-4">
        <i class="bi bi-shop text-primary" style="font-size: 2.5rem;"></i>
        <h1 class="h3 mt-2 fw-bold" style="color: #FF5A5F;">EatPick</h1>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="tu@correo.com"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 mb-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Entrando...' : 'Iniciar sesión' }}
        </button>

        <p v-if="error" class="text-danger text-center small mt-2">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const { data, error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (err) {
    error.value = err.message
    loading.value = false
    return
  }

  router.push({ name: 'Main' })
  loading.value = false
}
</script>

<style scoped>
.login-wrapper {
  background-color: #FEFAF5;
}
</style>
