# SpeedClub - Motorsport Sticker Album & Paddock Trade 🏎️💨

Plataforma interactiva de colección de vehículos de alta gama, álbum virtual 3D, desempaque de containers y mercado de intercambio de piezas (*Paddock Trade*).

---

## ⚡ Inicio Rápido (1 Clic en Windows)

Si estás en una computadora nueva con **Python** y **Node.js** instalados:

1. **Instalar dependencias**: Haz doble clic en [`instalar.bat`](./instalar.bat).
2. **Iniciar la aplicación**: Haz doble clic en [`iniciar.bat`](./iniciar.bat).
3. ¡Listo! Se abrirá automáticamente en tu navegador en `http://localhost:5173/`.

---

## 🛠️ Instalación y Ejecución Manual en Visual Studio Code

### Requisitos Previos:
- **Node.js** (v18 o superior): [Descargar Node.js](https://nodejs.org/)
- **Python** (v3.10 o superior): [Descargar Python](https://www.python.org/downloads/) *(recordar marcar "Add python.exe to PATH")*
- **Visual Studio Code**: [Descargar VS Code](https://code.visualstudio.com/)

### Paso 1: Abrir la carpeta
Abre Visual Studio Code y selecciona **Archivo > Abrir carpeta...** eligiendo la carpeta `Speed-club`.

### Paso 2: Instalar Dependencias
Abre una terminal integrada (`Ctrl + ñ` o `Terminal > Nueva terminal`):

```bash
# 1. Dependencias del Servidor Backend (Python)
pip install -r requirements.txt

# 2. Dependencias de la Interfaz Frontend (React)
cd client
npm install
cd ..
```

### Paso 3: Levantar los Servidores

Abre **dos terminales** en VS Code:

#### Terminal 1 (Servidor Backend):
```bash
cd server
python -m uvicorn main:app --reload --port 8000
```
- API Docs interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Terminal 2 (Cliente Web):
```bash
cd client
npm run dev
```
- Aplicación Web: [http://localhost:5173/](http://localhost:5173/)

---

## 📁 Estructura del Proyecto

```text
Speed-club/
├── client/              # Frontend React + Vite + Tailwind + Framer Motion
│   ├── src/
│   │   ├── components/  # Componentes modulares (Album, Containers, Slots, Telemetría)
│   │   ├── pages/       # Vistas (Dashboard, GarageView, Login, etc.)
│   │   ├── store/       # Estado global reactivo con Zustand (useGarageStore)
│   │   └── utils/       # Síntesis de audio arcade y utilidades
│   └── public/          # Assets estáticos (fondos, marcas, figuritas, containers)
├── server/              # Backend FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/         # Endpoints REST (/api/garage, /api/unboxing, /api/trades)
│   │   ├── core/        # Configuración de base de datos y CORS
│   │   └── models/      # Modelos ORM (VehicleCatalog, Inventory, User, Trade)
│   └── main.py          # Punto de entrada del servidor FastAPI
├── database/            # Scripts SQL de inicialización y catálogo de 20 vehículos
├── requirements.txt     # Dependencias de Python para instalación directa
├── instalar.bat         # Instalador automático de 1 clic para Windows
├── iniciar.bat          # Lanzador automático de 1 clic para ambos servidores
└── .gitignore           # Exclusión de archivos pesados (node_modules, caches)
```

---

## 📦 Compartir el Proyecto sin Peso Excesivo
El archivo `.gitignore` ya está configurado para excluir las carpetas temporales (`node_modules/`, `__pycache__/`, `dist/`). Al comprimir la carpeta en un ZIP para enviarla, el proyecto pesará solo unos pocos megabytes. Quien lo reciba simplemente ejecutará `instalar.bat` para regenerar los módulos al instante.



Hacer responsive la pagina "claiscos urbanos" ya que es mas grande que la pantalla del album de clasicos urbanos, donde se muestra el salon de la fama, quiero que sea mas pequeña esa tarjeta al tamaño similar delas demas tarjetas dentro del album. Quiero que el tamaño del album y las tarjetas de las tematicas dentro del album sean todas del mismo tamaño para que sea lo mas parecido a un album real. Quiero que todas las tematicas del album sean de fondo gris oscuro y las tarjetas que esten completas tengan fondo verde con las letras blancas y las que esten incompletas tengan fondo gris oscuro y las letras amarillas.  
 
Eliminemos todos los detalles del proyecto que tienen neon. Quiero que los colores de la pagina se mantengan clasicos, sin luces de colores para los hovers. 
 
Hacer la tarjeta para el apartado trilers donde se veran videos para conseguir creditos para abrir sobres.

Lo mismo con el stand de intercambio.

Cambiar el boton "tuning & piezas" por el boton 

Eliminar elboton "tuning & piezas" ya que no vamos a implementar esa funcionalidad en el sistema. 

Eliminar el boton "cajas de importacion" ya que no vamos a implementar esa funcionalidad en el sistema.

Camabiar la opcion de los containers, estos simularan los "sobres" para obtener figuritas. y arriba de los containers habria un "boton" de "comprar containers". Estos costaran creditos: Los containers comunes serán los que costaran 100creditos y los containers premium dorados costaran 500creditos. Ademas cada uno tendrá su animación de apertura.





