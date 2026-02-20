import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db, APP_ID_DB } from './firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { 
  doc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, query, orderBy, writeBatch 
} from "firebase/firestore";
import { 
  Search, X, LayoutDashboard, Package, Image as ImageIcon, LogOut, Plus, Edit, Trash2, AlertTriangle, 
  Store as StoreIcon, Ban, Eye, EyeOff, FileSpreadsheet, Check, AlertCircle
} from 'lucide-react';



// --- COMPONENTES UI COMPARTIDOS EN ADMIN ---

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">{children}</div>
        {footer && <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

// --- PANTALLA DE LOGIN DE ADMINISTRADOR ---

export const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    
    // Acceso de respaldo (Hardcoded para emergencias/pruebas)
    if (email === 'admin@admin.com' && password === '123456') { 
      onLoginSuccess(); 
      setLoading(false); 
      return; 
    }
    
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
      onLoginSuccess(); 
    } catch (err) { 
      console.error(err);
      setError('Credenciales incorrectas.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
          <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">ADMINISTRACIÓN</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-gray-900" value={email} onChange={e => setEmail(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                <input type="password" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-gray-900" value={password} onChange={e => setPassword(e.target.value)} />
             </div>
             {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16}/>{error}
                </div>
             )}
             <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50">
                  {loading ? 'Entrando...' : 'Ingresar'}
                </button>
             </div>
             <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 w-full">
                  <StoreIcon size={16} /> Volver a la Tienda
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

// --- FORMULARIO DE PRODUCTOS ---

const ProductForm = ({ product, onSave, onCancel, categories }) => {
  const initialImages = product?.images || (product?.imageUrl ? [product.imageUrl] : []);
  const [formData, setFormData] = useState({
    name: product?.name || '', category: product?.category || '', subcategory: product?.subcategory || '', 
    unitPrice: product?.unitPrice || 0, wholesalePrice: product?.wholesalePrice || 0, wholesaleQuantity: product?.wholesaleQuantity || 3, 
    stock: product?.stock || 100, images: initialImages, description: product?.description || '', discount: product?.discount || 0, 
    isBestSeller: product?.isBestSeller || false, hasSpecialDiscount: product?.hasSpecialDiscount || false, 
    isUnitSaleOnly: product?.isUnitSaleOnly || false, isVisible: product?.isVisible !== false
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
  };

  const addImage = () => { 
    if(newImageUrl.trim()) { 
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] })); 
      setNewImageUrl(''); 
    } 
  };
  
  const removeImage = (index) => { 
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })); 
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex justify-end">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors ${formData.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} className="hidden" />
                {formData.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                <span className="text-sm font-bold">{formData.isVisible ? 'Visible en Tienda' : 'Oculto en Tienda'}</span>
            </label>
        </div>
        <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1 outline-none focus:border-gray-900" placeholder="Ej: Arroz Gallo Oro" />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
            <input list="cat-suggestions" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mt-1 outline-none focus:border-gray-900" />
            <datalist id="cat-suggestions">{categories.map(c => <option key={c} value={c}/>)}</datalist>
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Subcategoría</label>
            <input name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full p-2 border rounded mt-1 outline-none focus:border-gray-900" />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Precio Unitario ($)</label>
            <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full p-2 border rounded mt-1 outline-none focus:border-gray-900" />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded mt-1 outline-none focus:border-gray-900" />
        </div>
        <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
           <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" name="isUnitSaleOnly" checked={formData.isUnitSaleOnly} onChange={handleChange} className="w-4 h-4 text-gray-900" />
              <label className="text-sm font-bold text-gray-800">¿Venta SOLO por unidad?</label>
           </div>
           {!formData.isUnitSaleOnly && (
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Precio Mayorista ($)</label>
                  <input type="number" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white outline-none focus:border-gray-900" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Min Mayorista</label>
                  <input type="number" name="wholesaleQuantity" value={formData.wholesaleQuantity} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white outline-none focus:border-gray-900" />
               </div>
             </div>
           )}
        </div>
        <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imágenes</label>
            <div className="flex gap-2 mb-3">
               <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-grow p-2 border rounded outline-none focus:border-gray-900" placeholder="URL de la imagen..." />
               <button onClick={addImage} className="bg-gray-900 text-white px-4 rounded font-bold hover:bg-black text-sm">Agregar</button>
            </div>
            {formData.images.length > 0 && (
               <div className="flex gap-2 overflow-x-auto pb-2">
                  {formData.images.map((img, idx) => (
                     <div key={idx} className="relative w-20 h-20 flex-shrink-0 group border rounded overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" alt="thumb" />
                        <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                           <X size={12} />
                        </button>
                     </div>
                  ))}
               </div>
            )}
        </div>
        <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded mt-1 h-20 outline-none focus:border-gray-900 resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
         <button onClick={onCancel} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
         <button onClick={() => onSave({ ...formData, imageUrl: formData.images[0] || '' })} className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black">Guardar</button>
      </div>
    </div>
  );
};

const StockStatCard = ({ title, value, subtext, color, icon: Icon, onClick, clickable }) => (
    <div onClick={clickable ? onClick : undefined} className={`p-6 rounded-2xl border ${color} bg-white shadow-sm flex items-start justify-between transition-all duration-200 ${clickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95' : ''}`}>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('border-', 'bg-').replace('-200', '-50')} text-gray-800`}>
            <Icon size={24} />
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productFilter, setProductFilter] = useState('all'); 
  const [editingItem, setEditingItem] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const showNotif = (msg, type = 'info') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 3000);
  };

  // Cargar datos en tiempo real
  useEffect(() => {
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    const ref = collection(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`);
    const q = query(ref, orderBy(collectionName === 'products' ? 'name' : 'order', 'asc'));
    
    const unsub = onSnapshot(q, (snapshot) => { 
        setItems(snapshot.docs.map(d => ({id: d.id, ...d.data()}))); 
    });
    return () => unsub();
  }, [activeTab]);

  // Carga masiva por Excel
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const XLSX = await import('xlsx'); 
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          if (data.length === 0) return showNotif("Archivo vacío", "error");
          
          const batch = writeBatch(db);
          const productsRef = collection(db, `artifacts/${APP_ID_DB}/public/data/products`);
          let count = 0;
          
          data.forEach(row => {
              const productData = {
                  name: row.Nombre || row.name || 'Sin Nombre', 
                  category: row.Categoria || row.category || 'General', 
                  subcategory: row.Subcategoria || row.subcategory || '',
                  unitPrice: Number(row.PrecioUnitario || row.unitPrice || 0), 
                  wholesalePrice: Number(row.PrecioMayorista || row.wholesalePrice || 0), 
                  wholesaleQuantity: Number(row.CantidadMayorista || row.wholesaleQuantity || 3),
                  stock: Number(row.Stock || row.stock || 0), 
                  imageUrl: row.Imagen || row.imageUrl || '', 
                  images: row.Imagen ? [row.Imagen] : [], 
                  description: row.Descripcion || row.description || '',
                  isUnitSaleOnly: row.SoloUnidad === 'SI', 
                  hasSpecialDiscount: false, 
                  discount: 0, 
                  isBestSeller: false, 
                  isVisible: row.Visible !== 'NO' // Por defecto es visible a menos que diga explícitamente NO
              };
              batch.set(doc(productsRef), productData);
              count++;
          });
          
          await batch.commit(); 
          showNotif(`${count} productos importados`, "success"); 
          e.target.value = null; 
        } catch (error) { 
            console.error(error);
            showNotif("Error al procesar el Excel", "error"); 
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) { 
        alert("Para usar esta función, necesitas instalar la librería xlsx: npm install xlsx"); 
    }
  };

  const handleSave = async (data) => {
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    const ref = collection(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`);
    try {
      if (editingItem && editingItem.id) { 
          await updateDoc(doc(ref, editingItem.id), data); 
          showNotif("Producto actualizado correctamente", "success"); 
      } else { 
          if(activeTab === 'banners' && !data.order) data.order = items.length + 1; 
          await addDoc(ref, data); 
          showNotif("Producto creado correctamente", "success"); 
      }
      setIsModalOpen(false); 
      setEditingItem(null);
    } catch (e) { 
        showNotif("Error al guardar en la base de datos", "error"); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Estás seguro de que deseas eliminar este elemento de forma permanente?")) return;
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    try { 
        await deleteDoc(doc(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`, id)); 
        showNotif("Elemento eliminado", "info"); 
    } catch(e) { 
        showNotif("Error al eliminar", "error"); 
    }
  };

  // Filtrado y Búsqueda
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab === 'products') {
        if (productFilter === 'outOfStock') result = result.filter(i => (i.stock || 0) <= 0);
        else if (productFilter === 'lowStock') result = result.filter(i => (i.stock || 0) > 0 && (i.stock || 0) <= 5);
    }
    if (searchTerm) {
        result = result.filter(i => (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result;
  }, [items, searchTerm, productFilter, activeTab]);

  const paginatedItems = useMemo(() => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredItems, currentPage]);
  
  // Estadísticas del Dashboard
  const dashboardStats = useMemo(() => ({ 
      total: items.length, 
      outOfStock: items.filter(i => (i.stock || 0) <= 0).length, 
      lowStock: items.filter(i => (i.stock || 0) > 0 && (i.stock || 0) <= 5).length 
  }), [items]);

  const handleStatClick = (filter) => { 
      setProductFilter(filter); 
      setActiveTab('products'); 
      setSearchTerm(''); 
      setCurrentPage(1); 
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
       {/* Notificación */}
       {notification.show && (
         <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-medium text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-gray-900 text-white' : notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
           {notification.type === 'success' && <Check size={16}/>}
           {notification.type === 'error' && <AlertCircle size={16}/>}
           {notification.message}
         </div>
       )}
       {/* BARRA LATERAL (SIDEBAR) */}
       <aside onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden shadow-2xl z-50`}>
          <div className={`h-20 flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-6 justify-between'} border-b border-gray-800/50 backdrop-blur-sm`}>
             {!sidebarCollapsed && <span className="font-bold tracking-tight">ADMIN PANEL</span>}
             {sidebarCollapsed && <StoreIcon size={24} className="text-gray-400" />}
          </div>
          <nav className="flex-grow p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
             {[
                 { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' }, 
                 { id: 'products', icon: Package, label: 'Productos' }, 
                 { id: 'banners', icon: ImageIcon, label: 'Banners' }
             ].map(item => (
               <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id !== 'products') setProductFilter('all'); }} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white text-gray-900 font-bold shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`} title={sidebarCollapsed ? item.label : ''}>
                  <item.icon size={20} /> {!sidebarCollapsed && <span>{item.label}</span>}
               </button>
             ))}
          </nav>
          <div className="p-4 border-t border-gray-800/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
             <button onClick={onLogout} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start px-4'} gap-2 py-2 text-gray-400 hover:text-red-400 transition-colors text-sm`}>
                 <LogOut size={20} /> {!sidebarCollapsed && "Cerrar Sesión"}
             </button>
          </div>
       </aside>

       {/* CONTENIDO PRINCIPAL */}
       <div className="flex-grow flex flex-col h-screen overflow-hidden">
          {/* Cabecera Móvil */}
          <header className="bg-white shadow-sm p-4 flex md:hidden justify-between items-center z-20">
              <span className="font-black text-gray-900">PANEL ADMIN</span>
              <button onClick={onLogout}><LogOut size={20} className="text-gray-500" /></button>
          </header>
          
          <main className="flex-grow overflow-y-auto p-4 md:p-8">
             {/* VISTA: INICIO / DASHBOARD */}
             {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fadeIn h-full">
                   <div className="flex justify-between items-end">
                       <div>
                           <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hola, Admin</h2>
                           <p className="text-gray-500 mt-1">Resumen general del estado de tu negocio.</p>
                       </div>
                       <button onClick={() => { setActiveTab('products'); setProductFilter('all'); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black shadow-lg">
                           Ver Inventario
                       </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <StockStatCard title="Agotados" value={dashboardStats.outOfStock || 0} subtext="Clic para ver detalles" color="border-red-200" icon={Ban} clickable={true} onClick={() => handleStatClick('outOfStock')} />
                      <StockStatCard title="Stock Crítico" value={dashboardStats.lowStock || 0} subtext="Menos de 5 unidades" color="border-yellow-200" icon={AlertTriangle} clickable={true} onClick={() => handleStatClick('lowStock')} />
                      <StockStatCard title="Total Productos" value={dashboardStats.total || 0} subtext="Activos en catálogo" color="border-gray-200" icon={Package} clickable={true} onClick={() => { setActiveTab('products'); setProductFilter('all'); }} />
                   </div>
                </div>
             )}

             {/* VISTA: PRODUCTOS / BANNERS */}
             {activeTab !== 'dashboard' && (
                <div className="h-full flex flex-col animate-fadeIn">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{activeTab === 'products' ? 'Inventario de Productos' : 'Gestor de Banners'}</h2>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                         {activeTab === 'products' && (
                             <>
                               <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" />
                               <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm shadow-md">
                                   <FileSpreadsheet size={16} /> Importar Excel
                               </button>
                             </>
                         )}
                         <button onClick={() => { setEditingItem({}); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold text-sm shadow-md">
                             <Plus size={16} /> Agregar Nuevo
                         </button>
                      </div>
                   </div>

                   {/* Buscador */}
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row gap-4 items-center">
                      <div className="relative flex-grow w-full">
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                          <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 transition-all" placeholder="Buscar por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                      </div>
                   </div>

                   {/* Tabla de Resultados */}
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-grow overflow-hidden flex flex-col">
                      <div className="overflow-x-auto flex-grow">
                         <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="p-4 border-b w-20">Imagen</th>
                                    <th className="p-4 border-b">Nombre del Producto</th>
                                    <th className="p-4 border-b text-right">Precio</th>
                                    <th className="p-4 border-b text-center">Stock</th>
                                    <th className="p-4 border-b text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">No se encontraron resultados</td>
                                    </tr>
                                ) : (
                                    paginatedItems.map(item => (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.isVisible === false ? 'opacity-60 bg-gray-100' : ''}`}>
                                            <td className="p-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg border overflow-hidden">
                                                    {item.imageUrl || item.images?.[0] ? 
                                                        <img src={item.imageUrl || item.images[0]} className="w-full h-full object-cover" alt="img" /> : 
                                                        <ImageIcon className="w-full h-full p-3 text-gray-300"/>
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">
                                                {item.name} 
                                                {item.isVisible === false && <span className="inline-flex items-center gap-1 ml-2 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full"><EyeOff size={12}/> Oculto</span>}
                                                {(item.stock || 0) <= 0 && <span className="inline-flex items-center gap-1 ml-2 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Agotado</span>}
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-600">${item.unitPrice}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock > 10 ? 'bg-green-100 text-green-700' : item.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                         </table>
                      </div>
                      
                      {/* Paginación */}
                      <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 font-bold text-sm text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">
                              Anterior
                          </button>
                          <span className="text-sm font-bold text-gray-500">Página {currentPage}</span>
                          <button disabled={paginatedItems.length < itemsPerPage} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 font-bold text-sm text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">
                              Siguiente
                          </button>
                      </div>
                   </div>
                </div>
             )}
          </main>
       </div>
       
       {/* Modal de Creación/Edición */}
       <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem?.id ? 'Editar Producto' : 'Nuevo Producto'}>
          {activeTab === 'products' ? (
              <ProductForm 
                  product={editingItem?.id ? editingItem : null} 
                  onSave={handleSave} 
                  onCancel={() => setIsModalOpen(false)} 
                  categories={[...new Set(items.map(i => i.category).filter(Boolean))]} 
              />
          ) : (
              <div className="text-center p-8 text-gray-500">Formulario de Banners en desarrollo...</div>
          )}
       </Modal>
    </div>
  );
}