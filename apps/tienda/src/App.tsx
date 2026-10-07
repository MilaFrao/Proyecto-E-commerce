import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CatalogPage from './pages/CatalogPage'
import CategoriesPage from './pages/CategoriesPage'
import ProductDetail from './pages/ProductDetail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Cuenta from './pages/Cuenta'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="cuenta" element={<Cuenta />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
