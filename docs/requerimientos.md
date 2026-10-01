Proyecto Personal: Desarrollo de Catalogo de Ventas/Aplicación E-Commerce 

Parte I: Desglose de la lluvia de ideas 
1.2.¿Qué resuelve un E-Commerce o catálogo de productos en una página web/app móvil?:Permitir a una tienda exponer/publicitar sus productos en internet para ampliar sus “terrenos de venta”, esta misma debe crearle cierta facilidad al cliente de consultar los productos a la venta, rebajas y/o promociones. Crearle al personal de la tienda la facilidad de consultar precios o información adicional sobre cualquier producto existente accediendo al “módulo de inventario” disponible en la pagina/aplicación, tambien ofrecerse como una herramienta para gestionar inventario y “catalogo” u organizador de precios para todos los articulos almacenados.
	1.3.Quienes usaran este aplicativo?: Posibles usuarios ordenados según su categoría o peso dentro de la plataforma:
Administradores/Personal técnico o programadores: Acceso a todos los niveles de la plataforma, ¿por qué? “Para llevar tareas de supervisión” o “tareas de alto rango”, es decir, el rol con mas autoridad.
Personal de inventario/depósito: Registrar productos nuevos al sistema, cargan precios, promociones, control de existencias, etc. Los administradores también pueden hacer lo mismo.
Vendedores o Personal general: Acceso a información y existencia de cada producto, pueden realizar la consulta de precios o información a través de códigos de barra o cualquier otro medio. 
Cliente general: Consultar el catálogo general de la aplicación, es decir, pueden ver ofertas, todos los artículos a la venta, un “carrito de compras”, posible capacidad para solicitar deliverys, canjear cupones de promoción, etc. Cualquier actividad relacionada al comportamiento habitual dentro de un cliente.
	“NOTA: Cualquier rol tiene acceso al catálogo de ventas por si quiere comprar algo”

	1.4. Alcance?-MVP: Primero se haria el desarrollo e implementacion de la aplicacion web, los primeros modulos y de mayor prioridad que estaran disponibles son los de gestion de inventario, todo lo relacionado a la organizacion de los productos que se van a vender
Segundo, existiria la implementacion de los primeros roles del sistema para ya tener la base de autenticaciones montada desde el inicio
Tercero, el desarrollo de catalogo como tal, una vez tenga los productos disponibles a la venta, existira la plataforma que estara disponible para el uso del cliente. Tendra la capacidad de listar, filtrar y ordenar por categorias cualquier articulo disponible (Tambien existiran las imagenes de cada articulo). En un futuro existira la capacidad del carrito de compras, visualización de ofertas, canjeo de cupones de promocion, etc
Cuarto, la pantalla para los vendedores. Luego de que todo funcione correctamente se hara el desarrollo de la aplicacion movil

	MVP 1 — Gestión de Productos e Inventario
1. Descripción general
El primer Producto Mínimo Viable (MVP) del sistema estará orientado a la gestión interna de productos e inventario de una tienda de ropa. Su propósito será establecer la base operativa sobre la cual posteriormente se desarrollarán el catálogo de ventas, las funcionalidades de comercio electrónico y, finalmente, la aplicación móvil.
Este MVP surge de la necesidad de organizar y centralizar la información relacionada con la mercancía que ingresa a la tienda, permitiendo registrar los productos, sus características, precios, variantes y existencias, así como mantener un control sobre su disponibilidad para la venta.
La propuesta inicial contempla que el sistema sirva como una herramienta interna para registrar y organizar los artículos disponibles, controlar sus existencias y facilitar al personal autorizado la consulta de información confiable sobre cada producto. Esta orientación coincide con la concepción inicial del proyecto, en la que la gestión de inventario constituye la primera prioridad antes de la implementación del catálogo orientado al cliente.
2. Objetivo del MVP
El objetivo del MVP 1 es proporcionar a la tienda una plataforma que permita registrar, organizar, consultar y controlar los productos y sus existencias, contemplando las diferentes características propias de una tienda de ropa, como tallas, colores y variantes.
El sistema deberá permitir diferenciar entre la mercancía que se encuentra físicamente en el depósito y aquella que ha sido preparada y surtida para su disponibilidad en la tienda y, por tanto, para su venta.
De esta manera, el MVP no se limitará a almacenar una cantidad total de productos, sino que establecerá una primera estructura para representar el estado real del inventario y su evolución.
3. Registro de productos
Cuando ingrese nueva mercancía a la tienda, el personal encargado del inventario deberá organizarla y clasificarla antes de registrarla en el sistema.
El registro de un producto deberá contemplar, como mínimo, la siguiente información:
Nombre del producto.
Referencia o código de identificación.
Categoría.
Marca.
Descripción.
Imágenes.
Colores disponibles.
Tallas disponibles.
Existencias.
Precio al detal.
Precio al mayor.
La información deberá estructurarse de forma que un mismo producto pueda presentar diferentes variantes, especialmente en función del color y la talla.
Por ejemplo, una misma camisa podrá representarse como un único producto con múltiples variantes:
Camisa
├── Negra
│   ├── S → 2 unidades
│   ├── M → 4 unidades
│   └── L → 3 unidades
│
└── Blanca
    ├── S → 1 unidad
    ├── M → 3 unidades
    └── L → ...

Esta estructura permitirá diferenciar correctamente el producto general de cada combinación específica de sus características.
4. Gestión del stock
El sistema deberá manejar el concepto de stock como la cantidad actual de unidades disponibles de una determinada variante del producto.
Por ejemplo, para una camisa negra de talla M:
Camisa negra — talla M
Stock actual: 5 unidades

Cuando ingresen nuevas unidades de esa misma variante, el sistema deberá incrementar el stock existente en lugar de registrar nuevamente el producto como si se tratara de un artículo independiente.
De esta forma, si existen inicialmente cinco unidades y posteriormente ingresan diez adicionales, el stock deberá actualizarse de la siguiente manera:
5 unidades + 10 unidades = 15 unidades

El mismo principio se aplicará cuando el stock disminuya debido a ventas, devoluciones, ajustes u otros movimientos autorizados.
5. Historial de movimientos
Además del stock actual, el sistema deberá conservar un historial de movimientos de inventario que permita conocer cómo se ha modificado la existencia de cada variante.
El historial deberá permitir identificar, como mínimo, operaciones como:
Entrada de mercancía.
Salida de mercancía.
Venta.
Ajustes de inventario.
Devoluciones u otros movimientos que posteriormente sean definidos.
Por ejemplo:
Fecha       Movimiento             Cantidad    Stock resultante
01/08       Entrada de mercancía      +20              20
03/08       Venta                      -3              17
05/08       Venta                      -5              12
07/08       Entrada de mercancía      +10              22
10/08       Venta                     -10              12

El objetivo de esta funcionalidad será mantener la trazabilidad del inventario, permitiendo consultar no solo cuánto stock existe actualmente, sino también los movimientos que produjeron dicho estado.
6. Existencia y disponibilidad para la venta
Una de las reglas fundamentales descubiertas durante el levantamiento de requerimientos consiste en diferenciar entre la existencia física de un producto y su disponibilidad para la venta.
La mercancía puede encontrarse registrada dentro del inventario y permanecer almacenada en el depósito sin estar todavía disponible para los clientes. Antes de ser puesta a la venta, puede requerir procesos físicos de preparación, clasificación, etiquetado, colocación de alarmas y surtido hacia la tienda.
Por lo tanto, el sistema deberá distinguir conceptualmente entre:
Stock en depósito
        +
Stock surtido en tienda

Por ejemplo:
Camisa negra — talla M

Existencia en depósito: 20
Existencia surtida:       8
Disponible para venta:    8

Posteriormente, si se venden tres unidades:
Existencia total registrada: 20
Existencia en depósito:      12
Existencia en tienda:         5
Disponible para venta:        5

Esta distinción permitirá que el sistema represente de manera más precisa el estado real de la mercancía y evitará que productos registrados en el inventario sean mostrados como disponibles para la venta cuando todavía permanecen en el depósito.
7. Surtido de mercancía
El proceso de disponibilidad para la venta contemplará el surtido de mercancía desde el depósito hacia la tienda.
El flujo general será:
Llegada de mercancía
        ↓
Clasificación y organización
        ↓
Registro en el sistema
        ↓
Preparación de los artículos
        ↓
Surtido hacia la tienda
        ↓
Disponibilidad para la venta

El traslado de mercancía entre depósito y tienda deberá formar parte del control de inventario y podrá quedar registrado como un movimiento, permitiendo conocer dónde se encuentran las unidades y cómo ha evolucionado su disponibilidad.
8. Estado de los productos
El sistema deberá permitir conservar información histórica de productos y variantes que dejen de estar disponibles, evitando que su eliminación física destruya los registros asociados a sus movimientos anteriores.
Cuando un producto deje de comercializarse, podrá ser marcado como inactivo en lugar de eliminarse permanentemente del sistema.
Esto permitirá conservar información como:
Fecha de registro.
Entradas de mercancía.
Salidas.
Ventas.
Ajustes.
Cambios de stock.
Fecha o motivo de desactivación.
De esta forma, la información histórica podrá conservarse para futuras consultas, controles administrativos y procesos de auditoría.
9. Promociones
Las promociones se considerarán una funcionalidad relacionada con la gestión comercial, pero no constituirán inicialmente una parte obligatoria del proceso de registro de un producto.
El registro del producto deberá establecer su información y precios base, mientras que la creación y activación de promociones podrá realizarse posteriormente como un proceso independiente.
La modalidad exacta mediante la cual se gestionarán las promociones —por ejemplo, mediante precios promocionales, descuentos porcentuales, promociones sobre categorías o condiciones especiales— quedará pendiente de definición durante una fase posterior del levantamiento de requerimientos.
10. Actores involucrados en el MVP
10.1. Administrador o superusuario
El administrador tendrá acceso global a la plataforma y podrá realizar las operaciones disponibles en los diferentes módulos del sistema.
Dentro del MVP 1 podrá realizar todas las operaciones relacionadas con productos e inventario, además de aquellas funciones administrativas que sean incorporadas posteriormente.
10.2. Personal de inventario
Será el principal responsable operativo del MVP 1.
Entre sus responsabilidades estarán:
Recibir y organizar mercancía.
Clasificar los artículos.
Registrar nuevos productos.
Registrar variantes.
Actualizar precios.
Registrar entradas de mercancía.
Gestionar existencias.
Registrar movimientos.
Consultar el historial del inventario.
Gestionar el surtido de mercancía hacia la tienda.
10.3. Vendedor
El vendedor utilizará el sistema principalmente como herramienta de apoyo durante la atención al cliente.
Su función dentro del MVP inicial estará orientada a la consulta rápida de información como:
Productos.
Precios.
Referencias.
Tallas.
Colores.
Existencias disponibles.
Promociones activas.
Información descriptiva del artículo.
El objetivo será facilitar la atención al cliente, especialmente en situaciones donde un vendedor nuevo no conozca todavía todo el catálogo o cuando sea necesario verificar rápidamente información específica.
11. Resultado esperado del MVP
Al finalizar el MVP 1, la tienda deberá disponer de una primera plataforma funcional capaz de representar de manera organizada su inventario y sus productos.
El sistema deberá permitir responder preguntas fundamentales como:
¿Qué productos existen?
¿Qué variantes tiene cada producto?
¿Cuántas unidades existen de cada variante?
¿Cuántas se encuentran en depósito?
¿Cuántas están surtidas y disponibles para la venta?
¿Qué movimientos ha tenido una determinada variante?
¿Qué información y precio tiene un producto?
Con esta base, el sistema estará preparado para evolucionar hacia el siguiente MVP: la construcción del catálogo orientado al cliente, utilizando la información organizada y validada durante esta primera etapa.
12. Alcance del MVP 1
El MVP 1 comprenderá principalmente la gestión interna de productos, variantes e inventario, incluyendo el control de existencias, movimientos y disponibilidad para la venta.
Quedarán para etapas posteriores funcionalidades como el carrito de compras, cupones, delivery, procesos completos de comercio electrónico y la aplicación móvil, de acuerdo con la evolución planteada inicialmente para el proyecto.
MVP 2 — Catálogo de productos
13. Descripción general
El segundo Producto Mínimo Viable (MVP) estará orientado al desarrollo del catálogo público de productos de la tienda de ropa. Esta etapa utilizará como base la información gestionada previamente en el MVP 1, con el propósito de transformar los datos internos de productos, variantes, precios, imágenes y disponibilidad en una interfaz accesible para los clientes.
A diferencia del primer MVP, cuyo propósito principal es la gestión interna de la mercancía y el inventario, el MVP 2 estará orientado a la consulta y exploración de productos por parte del cliente. El catálogo constituirá, por tanto, la primera interfaz comercial del sistema y servirá como punto de entrada para las futuras funcionalidades de comercio electrónico.
El catálogo deberá permitir que los usuarios consulten los productos disponibles sin necesidad de crear una cuenta. La autenticación será requerida posteriormente para aquellas operaciones que impliquen una compra o la realización de un pedido.
14. Objetivo del MVP
El objetivo del MVP 2 será proporcionar una plataforma mediante la cual cualquier usuario pueda descubrir, consultar y explorar los productos disponibles para la venta, utilizando mecanismos de búsqueda, categorización, filtrado y ordenamiento.
La información presentada al cliente deberá corresponder con el estado comercial actual de los productos gestionados internamente por la tienda. El catálogo no tendrá como propósito exponer la totalidad de la información del inventario, sino únicamente aquella necesaria para facilitar la consulta y eventual adquisición de los productos.
15. Acceso público al catálogo
El catálogo estará disponible para usuarios no autenticados. Cualquier visitante podrá ingresar a la plataforma y consultar los productos sin necesidad de registrarse o iniciar sesión.
El usuario visitante podrá:
Explorar el catálogo.
Consultar categorías.
Buscar productos.
Filtrar resultados.
Ordenar resultados.
Consultar la información de un producto.
Consultar sus variantes, precios y disponibilidad.
La autenticación será necesaria únicamente cuando el usuario intente realizar una operación que implique una compra o un pedido.
De esta forma, se establecerá una separación entre la consulta pública del catálogo y las operaciones privadas asociadas a una cuenta de cliente.
16. Relación entre inventario y catálogo
El catálogo utilizará la información administrada por el MVP 1, pero no deberá reflejar directamente todos los datos existentes en el inventario interno.
En particular, deberá existir una diferenciación entre:
La existencia física de un producto.
La cantidad disponible para la venta.
La publicación del producto dentro del catálogo.
Un producto puede existir dentro del inventario y encontrarse almacenado en el depósito sin estar disponible para los clientes. En este caso, dicha mercancía no deberá ser mostrada dentro del catálogo público.
Por ejemplo:
Producto: Chola deportiva X
Stock en depósito: 30
Stock surtido en tienda: 0
Stock disponible para venta: 0
En este escenario, el producto no deberá aparecer como disponible para los clientes.
Cuando parte de la mercancía sea surtida hacia la tienda:
Producto: Chola deportiva X
Stock en depósito: 20
Stock surtido en tienda: 10
Stock disponible para venta: 10
el producto podrá ser publicado en el catálogo.
De esta manera, el catálogo representará una vista comercial del inventario, ocultando información operativa que no resulta necesaria para el cliente.
17. Publicación y disponibilidad de productos
Un producto podrá aparecer en el catálogo cuando posea al menos una variante con existencias disponibles para la venta.
La regla general será:
¿Existe el producto?
        ↓
¿Tiene alguna variante disponible para la venta?
       / \
     NO   SÍ
     │     │
     ▼     ▼
 No mostrar
           Mostrar en catálogo
Cuando todas las variantes de un producto se encuentren sin existencias disponibles para la venta, el producto deberá dejar de aparecer en el catálogo hasta que vuelva a disponer de unidades.
Por ejemplo:
Camisa X

Negra
S → 0
M → 4
L → 0

Blanca
S → 2
M → 0
L → 3
El producto continuará siendo visible porque existen variantes disponibles para la venta. Sin embargo, las variantes sin existencias no deberán poder seleccionarse como disponibles.
Esta lógica permitirá evitar que el cliente consulte productos que existen únicamente en el inventario interno pero que todavía no están preparados para su comercialización.
18. Exploración del catálogo
El catálogo deberá permitir al usuario explorar los productos mediante diferentes mecanismos de navegación.
Como funcionalidad base se contempla:
Listado de productos.
Navegación por categorías.
Búsqueda de productos.
Filtrado.
Ordenamiento.
Acceso al detalle de cada producto.
El propósito será permitir que el cliente pueda encontrar una prenda sin depender de un único método de navegación.
El usuario podrá, por ejemplo, ingresar al catálogo, seleccionar una categoría de productos y posteriormente reducir los resultados mediante filtros hasta localizar una prenda específica.
19. Búsqueda de productos
El catálogo deberá incorporar un mecanismo de búsqueda que permita localizar productos a partir de información relevante como su nombre, referencia, marca u otros atributos que posteriormente sean establecidos durante el desarrollo.
El objetivo de esta función será facilitar la localización de productos específicos y reducir la necesidad de recorrer manualmente grandes cantidades de artículos.
La forma exacta en que se ejecutará la búsqueda y los campos que tendrán participación en ella quedarán sujetos a una definición técnica posterior.
20. Categorías
Los productos deberán organizarse mediante categorías que faciliten su navegación.
En el contexto de la tienda de ropa, las categorías podrán representar agrupaciones como:
Ropa
├── Camisas
├── Pantalones
├── Ropa interior
├── Calzado
└── ...
La estructura definitiva de categorías y posibles subcategorías será definida posteriormente de acuerdo con las necesidades de la tienda y la evolución del catálogo.
21. Filtros y ordenamiento
El usuario deberá disponer de mecanismos que permitan reducir y organizar los resultados del catálogo.
Entre los filtros inicialmente contemplados se encuentran:
Categoría.
Marca.
Color.
Talla.
Precio.
Disponibilidad.
Asimismo, el sistema deberá permitir ordenar los resultados mediante criterios comerciales básicos, como:
Precio de menor a mayor.
Precio de mayor a menor.
La incorporación de otros criterios de ordenamiento podrá evaluarse posteriormente según las necesidades del sistema.
22. Información presentada al cliente
El catálogo deberá mostrar al cliente la información necesaria para conocer y evaluar un producto.
La ficha de un producto podrá incluir, como mínimo:
Nombre.
Marca.
Categoría.
Descripción.
Imágenes.
Precio.
Colores disponibles.
Tallas disponibles.
Disponibilidad para la venta.
La información relacionada con el depósito, movimientos internos, cantidades almacenadas que aún no hayan sido surtidas y demás datos operativos no deberán formar parte de la información pública del catálogo.
23. Variantes de productos
El catálogo deberá representar las variantes previamente definidas en el sistema de inventario, especialmente aquellas relacionadas con:
Color.
Talla.
La selección de una variante deberá reflejar su disponibilidad real para la venta.
Por ejemplo:
Camisa deportiva

Color:
[Negro] [Azul]

Talla:
[S] [M] [L] [XL]
En caso de que una determinada combinación de color y talla no tenga unidades disponibles para la venta, dicha variante deberá identificarse como no disponible o impedir su selección.
El catálogo no deberá asumir que la disponibilidad de un producto general implica la disponibilidad de todas sus variantes.
24. Experiencia de consulta del cliente
El flujo principal de interacción planteado para este MVP será:
Cliente ingresa
      ↓
Explora catálogo
      ↓
Selecciona categoría o utiliza búsqueda
      ↓
Filtra y/o ordena resultados
      ↓
Selecciona un producto
      ↓
Consulta información
      ↓
Selecciona color y talla disponibles
      ↓
Consulta precio y disponibilidad
      ↓
Decide continuar con la compra
Este flujo servirá posteriormente como referencia para el levantamiento de requerimientos de interfaz y para la etapa de diseño UI/UX.
La interfaz deberá priorizar una navegación clara y una consulta rápida de la información relevante, siguiendo patrones de interacción habituales en plataformas de comercio electrónico y catálogos digitales.
25. Relación con futuros módulos de comercio electrónico
El MVP 2 tendrá como objetivo principal la consulta de productos, por lo que no incorporará todavía todo el proceso de compra.
Sin embargo, será la base sobre la cual se desarrollará el siguiente MVP, orientado a las funcionalidades de comercio electrónico.
En particular, la información mostrada en el catálogo deberá permitir posteriormente que un cliente autenticado pueda seleccionar una variante determinada y continuar con operaciones como:
Agregar productos al carrito.
Crear pedidos.
Gestionar datos de compra.
Solicitar delivery.
Aplicar cupones o promociones.
Estas funcionalidades formarán parte de una etapa posterior y no constituirán el alcance principal de este MVP.
26. Resultado esperado del MVP
Al finalizar el MVP 2, la tienda deberá disponer de un catálogo web público y funcional, capaz de utilizar la información registrada internamente para presentar únicamente los productos que se encuentren disponibles para la venta.
El sistema deberá permitir que un cliente pueda:
Encontrar un producto.
Explorar productos por categoría.
Buscar y filtrar resultados.
Ordenar los productos.
Consultar información detallada.
Seleccionar una variante disponible.
Conocer su precio y disponibilidad.
El MVP deberá establecer, además, una separación clara entre la información interna de inventario y la información comercial que se expone al cliente.
27. Alcance del MVP 2
El segundo MVP comprenderá el desarrollo del catálogo público de productos, incluyendo su navegación, búsqueda, categorización, filtrado, ordenamiento y consulta detallada.
También comprenderá la integración con la información gestionada por el MVP 1 para determinar qué productos y variantes pueden ser mostrados al cliente.
Quedarán fuera del alcance principal de esta etapa las funcionalidades completas de comercio electrónico, tales como el carrito de compras, generación de pedidos, pagos, delivery, cupones y demás procesos asociados a la compra, los cuales serán considerados en el siguiente incremento funcional del sistema.

