import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.jsx'

// ១. Import កញ្ចប់ចាំបាច់ពីរនេះពី @tanstack/react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ២. បង្កើត Instance របស់ QueryClient មួយនៅខាងក្រៅ Component
const queryClient = new QueryClient()

//  កែប្រែត្រង់នេះ៖ ហៅប្រើ createRoot() ផ្ទាល់តែម្ដង (មិនបាច់មានពាក្យ ReactDOM ពីមុខទេ)
createRoot(document.getElementById('root')).render(
  //  កែប្រែត្រង់នេះ៖ ប្រើ StrictMode ផ្ទាល់ (មិនបាច់មានពាក្យ React. ពីមុខទេ)
  <StrictMode>
    {/* ៣. យក QueryClientProvider មកគ្របពីខាងក្រៅ <App /> */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)