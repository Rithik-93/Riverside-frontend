import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './router/AppRouter'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <AppRouter />
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgb(17 24 39)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgb(243 244 246)',
            },
            className: 'backdrop-blur-xl',
          }}
        />
      </AuthProvider>
    </div>
  )
}

export default App
