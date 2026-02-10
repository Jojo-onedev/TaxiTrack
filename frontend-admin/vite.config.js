<<<<<<< HEAD
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api/admin': {
//         target: 'http://localhost:5000',  // ← CHANGER par ton port backend
//         changeOrigin: true,
//         secure: false,
//       },
//       '/api': {
//         target: 'http://localhost:5000',  // au cas où
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/admin': {
        target: 'http://localhost:5000',  // ton port backend
        changeOrigin: true,
        secure: false
      }
    }
  }
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> origin/frontend-admin
})
