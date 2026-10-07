Quiero diseñar la interfaz web de una plataforma para una tienda de ropa.

Utiliza la imagen de referencia adjunta como inspiración visual. No quiero una copia literal de la interfaz ni de sus ilustraciones; quiero conservar su lenguaje visual general y adaptarlo al contexto de una tienda de ropa.

## CONTEXTO DEL SISTEMA

La plataforma está dividida en dos áreas principales:

1. ÁREA OPERATIVA
2. ÁREA COMERCIAL / E-COMMERCE

El sistema actualmente tiene dos MVP principales:

MVP 1 — Gestión de productos e inventario.
MVP 2 — Catálogo público.

Las funcionalidades completas de compra, pedidos, pagos y delivery están fuera del alcance actual y quedan como futuras ampliaciones.

## ÁREA OPERATIVA

Está destinada al personal interno de la tienda.

Actores actuales:
- Superusuario
- Personal de inventario
- Vendedor

El superusuario tiene acceso global al área operativa.
El personal de inventario se encarga principalmente de gestionar productos, variantes, stock, movimientos y surtido.
El vendedor tendrá acceso principalmente a una herramienta de consulta comercial para apoyar la venta presencial.

### Funciones principales del área operativa

Dashboard:
- Resumen general de la tienda.
- Cantidad de productos.
- Estado del inventario.
- Productos disponibles para venta.
- Productos pendientes de surtido.
- Movimientos recientes.

Productos:
- Listado de productos.
- Crear producto.
- Editar producto.
- Ver detalle.
- Desactivar producto.
- Gestionar variantes.

Una prenda puede tener múltiples variantes dependiendo principalmente de:
- Color
- Talla

Ejemplo:

Camisa
- Negra / S
- Negra / M
- Negra / L
- Blanca / S
- Blanca / M
- Blanca / L

Inventario:
- Stock actual.
- Stock en depósito.
- Stock surtido en tienda.
- Disponibilidad para venta.
- Movimientos de inventario.
- Historial por variante.

El sistema debe diferenciar claramente entre:
- existencia física en depósito;
- existencia surtida en tienda;
- disponibilidad para venta.

Un producto puede existir en el inventario y estar almacenado en depósito sin aparecer públicamente en el catálogo hasta que haya sido surtido y esté disponible para venta.

Surtido:
- Permitir visualizar mercancía pendiente de surtir.
- Mostrar cantidades en depósito.
- Permitir registrar el traslado/surtido hacia la tienda.

Historial:
Mostrar una línea de tiempo o historial visual de movimientos:
- Entrada
- Salida
- Ajuste
- Devolución
- Otros movimientos futuros

No eliminar visualmente el historial cuando un producto sea desactivado.

Consulta comercial:
Crear una vista rápida para vendedores donde puedan buscar una prenda y consultar:
- Nombre
- Marca
- Referencia
- Precio
- Colores
- Tallas
- Disponibilidad
- Imagen
- Información relevante para atención al cliente

## ÁREA COMERCIAL

Está destinada al público y a los clientes.

El catálogo debe ser público y poder consultarse sin iniciar sesión.

El usuario visitante podrá:
- Explorar productos.
- Buscar productos.
- Navegar por categorías.
- Filtrar.
- Ordenar.
- Ver detalles.
- Consultar colores, tallas, precios y disponibilidad.

La autenticación será necesaria para futuras operaciones de compra.

### Catálogo

Diseñar:
- Página principal del catálogo.
- Barra de búsqueda.
- Categorías.
- Filtros.
- Ordenamiento.
- Tarjetas de producto.
- Página de detalle del producto.

Ejemplo de categorías:
- Camisas
- Pantalones
- Calzado
- Ropa interior
- Accesorios

### Regla importante del catálogo

No mostrar información interna del inventario.

El cliente NO debe conocer:
- cantidades almacenadas en depósito;
- mercancía pendiente de surtir;
- movimientos de inventario;
- información interna de almacenamiento.

El catálogo solamente debe mostrar información comercial relevante.

Si un producto tiene stock en depósito pero no tiene unidades disponibles para venta, no debe aparecer como producto disponible en el catálogo.

Si un producto tiene varias variantes y solo algunas están disponibles, el producto debe aparecer, pero las variantes agotadas deben identificarse claramente como no disponibles.

## LENGUAJE VISUAL

Quiero una interfaz moderna, limpia, profesional y minimalista.

Inspiración visual:
- Dashboard modular.
- Tarjetas grandes con esquinas redondeadas.
- Mucho espacio en blanco.
- Sombras suaves.
- Bordes muy discretos.
- Tipografía moderna y legible.
- Iconografía simple.
- Colores pastel como acentos.
- Elementos geométricos decorativos.
- Jerarquía visual clara.
- Interfaz elegante pero no excesivamente corporativa.

Utilizar una base neutra clara y una paleta de acentos suaves.

Los módulos pueden utilizar diferentes colores de acento:
- Verde / turquesa para inventario.
- Azul para productos o información.
- Coral para usuarios.
- Amarillo para promociones.
- Morado para reportes u otras funciones.

No utilizar colores excesivamente saturados.

## NAVEGACIÓN

### Área operativa

Usar una navegación lateral vertical inspirada en la referencia.

Sidebar:
- Logo.
- Dashboard.
- Productos.
- Inventario.
- Surtido.
- Consulta comercial.
- Usuarios, visible principalmente para superusuario.
- Configuración.

La navegación debe adaptarse al rol del usuario.

### Área comercial

No utilizar el mismo sidebar administrativo.

Utilizar una navegación comercial superior:

Logo | Catálogo | Categorías | Buscar | Cuenta | Carrito futuro

El catálogo debe sentirse como una tienda, no como un panel administrativo.

## PANTALLAS A DISEÑAR

Crear inicialmente estas pantallas:

1. Login
2. Dashboard operativo
3. Listado de productos
4. Registrar producto
5. Detalle de producto
6. Gestión de variantes
7. Inventario
8. Historial de movimientos
9. Surtido de mercancía
10. Consulta comercial para vendedor
11. Catálogo público
12. Detalle de producto público
13. Página de categorías

## PRODUCTO DE EJEMPLO

Utilizar productos ficticios de una tienda de ropa.

Ejemplos:
- Camisa deportiva
- Camisa casual
- Pantalón cargo
- Chola deportiva
- Sudadera
- Ropa interior

Utilizar precios ficticios y datos ficticios.

## DISEÑO RESPONSIVO

Diseñar principalmente para escritorio, pero preparar la interfaz para adaptarse posteriormente a tablet y móvil.

Mantener consistencia en:
- espaciado;
- tamaños;
- componentes;
- navegación;
- formularios;
- tarjetas;
- botones;
- estados.

## DESIGN SYSTEM

Antes de diseñar las pantallas, establecer un pequeño sistema de diseño reutilizable:

- Tipografía
- Colores
- Espaciado
- Border radius
- Sombras
- Botones
- Inputs
- Selects
- Cards
- Badges
- Tabs
- Modales
- Alertas
- Estados de stock
- Estados de producto
- Componentes de navegación

Crear componentes reutilizables y mantener consistencia visual en toda la aplicación.

## IMPORTANTE

No agregar funcionalidades de e-commerce que todavía no estén definidas.

No incluir por ahora:
- checkout;
- pagos;
- delivery;
- pedidos;
- cupones;
- procesamiento de compras.

El objetivo actual es diseñar una experiencia completa de gestión interna + catálogo público.