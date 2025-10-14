import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  )
}

export default App
