import React, { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db, APP_ID_DB } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { 
  doc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, query, orderBy, writeBatch 
} from "firebase/firestore";
import { 
  Search, X, LayoutDashboard, Package, Image as ImageIcon, LogOut, Plus, Edit, Trash2, 
  AlertTriangle, Store as StoreIcon, Ban, Eye, EyeOff, FileSpreadsheet, Check, AlertCircle,
  ChevronRight, ChevronLeft, Download, Menu, Monitor, Smartphone, ToggleLeft, ToggleRight
} from 'lucide-react';

// ─────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 active:scale-90 transition-transform">
            <X size={24} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (email === 'admin@admin.com' && password === '123456') {
      onLoginSuccess();
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError('Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">ADMINISTRACION</h2>
          <p className="text-gray-400 text-sm mt-2">Panel de gestion de productos</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
            <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-gray-900 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Contrasena</label>
            <input type="password" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-gray-900 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />{error}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50 mt-2">
            {loading ? 'Entrando...' : 'Ingresar'}
          </button>
          <div className="text-center pt-3 border-t border-gray-100">
            <a href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
              <StoreIcon size={15} /> Volver a la Tienda
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// FORMULARIO DE PRODUCTO
// ─────────────────────────────────────────
const ProductForm = ({ product, onSave, onCancel, categories }) => {
  const initialImages = product?.images || (product?.imageUrl ? [product.imageUrl] : []);

  // FIX: campos numericos como string para poder borrar y escribir libremente
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    unitPrice: product?.unitPrice !== undefined ? String(product.unitPrice) : '',
    wholesalePrice: product?.wholesalePrice !== undefined ? String(product.wholesalePrice) : '',
    wholesaleQuantity: product?.wholesaleQuantity !== undefined ? String(product.wholesaleQuantity) : '',
    stock: product?.stock !== undefined ? String(product.stock) : '',
    images: initialImages,
    description: product?.description || '',
    discount: product?.discount !== undefined ? String(product.discount) : '0',
    isBestSeller: product?.isBestSeller || false,
    hasSpecialDiscount: product?.hasSpecialDiscount || false,
    isUnitSaleOnly: product?.isUnitSaleOnly || false,
    isVisible: product?.isVisible !== false,
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // FIX: no convierte a Number mientras escribe
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Al guardar, convierte strings a numeros
  const handleSave = () => {
    onSave({
      ...formData,
      unitPrice: Number(formData.unitPrice) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || 0,
      wholesaleQuantity: Number(formData.wholesaleQuantity) || 0,
      stock: Number(formData.stock) || 0,
      discount: Number(formData.discount) || 0,
      imageUrl: formData.images[0] || '',
    });
  };

  const inputCls = "w-full p-2.5 border border-gray-200 rounded-lg mt-1 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-sm";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors text-sm font-bold ${formData.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
          <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} className="hidden" />
          {formData.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          {formData.isVisible ? 'Visible en Tienda' : 'Oculto en Tienda'}
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Nombre</label>
          <input name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="Ej: Arroz Gallo Oro 1kg" />
        </div>
        <div>
          <label className={labelCls}>Categoria</label>
          <input list="cat-suggestions" name="category" value={formData.category} onChange={handleChange} className={inputCls} placeholder="Ej: Almacen" />
          <datalist id="cat-suggestions">{categories.map(c => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className={labelCls}>Subcategoria</label>
          <input name="subcategory" value={formData.subcategory} onChange={handleChange} className={inputCls} placeholder="Ej: Arroz" />
        </div>
        <div>
          <label className={labelCls}>Precio Unitario ($)</label>
          <input
            type="text"
            inputMode="decimal"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            className={inputCls}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelCls}>Stock</label>
          <input
            type="text"
            inputMode="numeric"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={inputCls}
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" name="isUnitSaleOnly" checked={formData.isUnitSaleOnly} onChange={handleChange} className="w-4 h-4 accent-gray-900" id="unitSaleOnly" />
            <label htmlFor="unitSaleOnly" className="text-sm font-bold text-gray-800 cursor-pointer">Venta SOLO por unidad (sin precio mayorista)</label>
          </div>
          {!formData.isUnitSaleOnly && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Precio Mayorista ($)</label>
                <input type="text" inputMode="decimal" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className={inputCls + " bg-white"} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Cantidad minima</label>
                <input type="text" inputMode="numeric" name="wholesaleQuantity" value={formData.wholesaleQuantity} onChange={handleChange} className={inputCls + " bg-white"} placeholder="0" />
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelCls + " mb-1"}>Imagenes del producto (URLs)</label>
          <p className="text-xs text-gray-400 mb-2">Podes agregar multiples imagenes. La primera sera la principal en la tienda.</p>
          <div className="flex gap-2 mb-3">
            <input
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              className={inputCls + " flex-grow mt-0"}
              placeholder="https://url-de-la-imagen.com/foto.jpg"
            />
            <button type="button" onClick={addImage} className="px-4 bg-gray-900 text-white rounded-lg font-bold hover:bg-black text-sm flex-shrink-0">
              + Agregar
            </button>
          </div>
          {formData.images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0 group border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-white text-[9px] text-center font-bold py-0.5 z-10">
                      Principal
                    </span>
                  )}
                  <img src={img} className="w-full h-full object-cover" alt={`img-${idx}`} onError={e => { e.target.style.display='none'; }} />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">Sin imagenes aun. Agrega una URL arriba.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Descripcion</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className={inputCls + " h-20 resize-none"} placeholder="Descripcion breve del producto..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t mt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancelar</button>
        <button type="button" onClick={handleSave} className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors text-sm shadow">Guardar cambios</button>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────
// FORMULARIO DE BANNER
// ─────────────────────────────────────────
const BannerForm = ({ banner, onSave, onCancel, totalBanners }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    imageDesktop: banner?.imageDesktop || banner?.imageUrl || '',
    imageMobile: banner?.imageMobile || '',
    linkUrl: banner?.linkUrl || '',
    order: banner?.order !== undefined ? String(banner.order) : String(totalBanners + 1),
    active: banner?.active !== false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    if (!formData.imageDesktop.trim()) return alert('La imagen de escritorio es obligatoria');
    onSave({
      title: formData.title,
      imageUrl: formData.imageDesktop,
      imageDesktop: formData.imageDesktop,
      imageMobile: formData.imageMobile,
      linkUrl: formData.linkUrl,
      order: Number(formData.order) || totalBanners + 1,
      active: formData.active,
    });
  };

  const inputCls = "w-full p-2.5 border border-gray-200 rounded-lg mt-1 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-sm";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide";

  return (
    <div className="space-y-5">

      {/* Previews lado a lado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Monitor size={12}/> Escritorio</p>
          <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
            {formData.imageDesktop ? (
              <img src={formData.imageDesktop} alt="desktop" className="w-full h-full object-cover" onError={e => e.target.style.opacity='0.3'} />
            ) : (
              <div className="text-center text-gray-300"><Monitor size={28} className="mx-auto mb-1"/><p className="text-[10px]">Sin imagen</p></div>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Smartphone size={12}/> Mobile</p>
          <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
            {formData.imageMobile ? (
              <img src={formData.imageMobile} alt="mobile" className="w-full h-full object-cover" onError={e => e.target.style.opacity='0.3'} />
            ) : (
              <div className="text-center text-gray-300"><Smartphone size={28} className="mx-auto mb-1"/><p className="text-[10px]">Opcional</p></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">

        <div>
          <label className={labelCls}>Título del banner</label>
          <input name="title" value={formData.title} onChange={handleChange} className={inputCls} placeholder="Ej: Promoción de verano" />
          <p className="text-xs text-gray-400 mt-1">Solo para identificarlo en el admin, no se muestra en la tienda</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1.5"><Monitor size={13}/> Imagen Escritorio <span className="text-red-500">*</span></p>
          <input name="imageDesktop" value={formData.imageDesktop} onChange={handleChange} className={inputCls + " bg-white"} placeholder="https://url-imagen-ancha.com/banner.jpg" />
          <p className="text-[11px] text-blue-500">Recomendado: 1400×400px — proporción panorámica</p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5"><Smartphone size={13}/> Imagen Mobile <span className="text-gray-400 font-normal normal-case">(opcional)</span></p>
          <input name="imageMobile" value={formData.imageMobile} onChange={handleChange} className={inputCls + " bg-white"} placeholder="https://url-imagen-cuadrada.com/banner-mobile.jpg" />
          <p className="text-[11px] text-gray-400">Recomendado: 800×600px — si no cargás, se usa la de escritorio</p>
        </div>

        <div>
          <label className={labelCls}>Link al hacer click <span className="font-normal text-gray-400 normal-case">(opcional)</span></label>
          <input name="linkUrl" value={formData.linkUrl} onChange={handleChange} className={inputCls} placeholder="https:// o dejá vacío" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Orden</label>
            <input type="text" inputMode="numeric" name="order" value={formData.order} onChange={handleChange} className={inputCls} placeholder="1" />
            <p className="text-xs text-gray-400 mt-1">Menor número = primero</p>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <label className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${formData.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="hidden" />
              {formData.active ? <ToggleRight size={22} className="text-green-500 flex-shrink-0"/> : <ToggleLeft size={22} className="text-gray-400 flex-shrink-0"/>}
              <span className={`text-sm font-bold ${formData.active ? 'text-green-700' : 'text-gray-500'}`}>{formData.active ? 'Activo' : 'Inactivo'}</span>
            </label>
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors text-sm">Cancelar</button>
        <button type="button" onClick={handleSave} className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors text-sm shadow">Guardar Banner</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────
const StockStatCard = ({ title, value, subtext, color, icon: Icon, onClick }) => (
  <div onClick={onClick} className={`p-5 rounded-xl border ${color} bg-white shadow-sm flex items-start justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200`}>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1 font-medium">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl text-gray-800 ${color.replace('border-', 'bg-').replace('-200', '-50')}`}>
      <Icon size={22} />
    </div>
  </div>
);

// ─────────────────────────────────────────
// ADMIN DASHBOARD — COMPONENTE PRINCIPAL
// ─────────────────────────────────────────
export default function AdminDashboard() {

  // FIX SESION: verifica si Firebase ya tiene usuario al recargar
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productsSubmenuOpen, setProductsSubmenuOpen] = useState(false);
  const [productFilter, setProductFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const showNotif = (msg, type = 'info') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 3500);
  };

  // FIX SESION: escucha Firebase Auth + sessionStorage para el admin hardcoded
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const savedAdmin = sessionStorage.getItem('adminLoggedIn');
      if (user || savedAdmin === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // Carga datos
  useEffect(() => {
    if (!isLoggedIn) return;
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    const ref = collection(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`);
    const q = query(ref, orderBy(collectionName === 'products' ? 'name' : 'order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeTab, isLoggedIn]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('adminLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  // Importar Excel
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
          if (data.length === 0) return showNotif("Archivo vacio", "error");
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
              isUnitSaleOnly: String(row.SoloUnidad).toUpperCase() === 'SI',
              hasSpecialDiscount: false,
              discount: 0,
              isBestSeller: false,
              isVisible: String(row.Visible).toUpperCase() !== 'NO',
            };
            batch.set(doc(productsRef), productData);
            count++;
          });
          await batch.commit();
          showNotif(`${count} productos importados`, "success");
          e.target.value = null;
        } catch (err) {
          console.error(err);
          showNotif("Error al procesar el archivo", "error");
        }
      };
      reader.readAsBinaryString(file);
    } catch {
      showNotif("Instala xlsx: npm install xlsx", "error");
    }
  };

  // Descargar modelo CSV
  const downloadTemplate = () => {
    const rows = [
      ['Nombre', 'Categoria', 'Subcategoria', 'PrecioUnitario', 'PrecioMayorista', 'CantidadMayorista', 'Stock', 'Imagen', 'Descripcion', 'SoloUnidad', 'Visible'],
      ['Arroz Gallo Oro 1kg', 'Almacen', 'Arroz', '500', '420', '6', '100', 'https://ejemplo.com/arroz.jpg', 'Arroz largo fino', 'NO', 'SI'],
      ['Birome Bic Punta Fina', 'Libreria', 'Escritura', '150', '120', '12', '50', 'https://ejemplo.com/birome.jpg', 'Azul punta fina', 'NO', 'SI'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_productos.csv';
    a.click();
    showNotif('Modelo descargado - abrilo en Excel', 'success');
  };

  // Guardar
  const handleSave = async (data) => {
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    const ref = collection(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`);
    try {
      if (editingItem?.id) {
        await updateDoc(doc(ref, editingItem.id), data);
        showNotif("Producto actualizado", "success");
      } else {
        await addDoc(ref, data);
        showNotif("Producto creado", "success");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch {
      showNotif("Error al guardar", "error");
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este producto permanentemente?")) return;
    const collectionName = activeTab === 'banners' ? 'banners' : 'products';
    try {
      await deleteDoc(doc(db, `artifacts/${APP_ID_DB}/public/data/${collectionName}`, id));
      showNotif("Eliminado", "info");
    } catch {
      showNotif("Error al eliminar", "error");
    }
  };

  // Filtros
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (activeTab === 'products') {
      if (productFilter === 'outOfStock') result = result.filter(i => (i.stock || 0) <= 0);
      else if (productFilter === 'lowStock') result = result.filter(i => (i.stock || 0) > 0 && (i.stock || 0) <= 5);
    }
    if (searchTerm) result = result.filter(i => (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [items, searchTerm, productFilter, activeTab]);

  const paginatedItems = useMemo(() =>
    filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredItems, currentPage, itemsPerPage]
  );

  const dashboardStats = useMemo(() => ({
    total: items.length,
    outOfStock: items.filter(i => (i.stock || 0) <= 0).length,
    lowStock: items.filter(i => (i.stock || 0) > 0 && (i.stock || 0) <= 5).length,
  }), [items]);

  const goToFilter = (filter) => {
    setProductFilter(filter);
    setActiveTab('products');
    setProductsSubmenuOpen(true);
    setSearchTerm('');
    setCurrentPage(1);
    setMobileMenuOpen(false);
  };

  // Pantalla de carga mientras verifica sesion
  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Nav items compartido entre sidebar desktop y drawer mobile
  const NavItems = ({ collapsed }) => (
    <>
      <button
        onClick={() => { setActiveTab('dashboard'); setProductFilter('all'); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all text-sm ${activeTab === 'dashboard' ? 'bg-white text-gray-900 font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'} ${collapsed ? 'justify-center' : ''}`}
        title="Inicio"
      >
        <LayoutDashboard size={18} className="flex-shrink-0" />
        {!collapsed && <span>Inicio</span>}
      </button>

      <div>
        <button
          onClick={() => { setActiveTab('products'); setProductFilter('all'); setProductsSubmenuOpen(o => !o); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all text-sm ${activeTab === 'products' ? 'bg-white text-gray-900 font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'} ${collapsed ? 'justify-center' : ''}`}
          title="Productos"
        >
          <Package size={18} className="flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-grow text-left">Productos</span>
              <ChevronRight size={13} className={`transition-transform duration-200 ${productsSubmenuOpen ? 'rotate-90' : ''}`} />
            </>
          )}
        </button>

        {!collapsed && productsSubmenuOpen && (
          <div className="ml-4 mt-1 border-l border-gray-700/40 pl-3 space-y-0.5">
            {[
              { key: 'all', label: `Todos (${dashboardStats.total})`, icon: Package, color: '' },
              { key: 'outOfStock', label: `Agotados (${dashboardStats.outOfStock})`, icon: Ban, color: 'text-red-400' },
              { key: 'lowStock', label: `Criticos (${dashboardStats.lowStock})`, icon: AlertTriangle, color: 'text-yellow-400' },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => goToFilter(key)}
                className={`w-full text-left text-xs py-2 px-2 rounded-lg transition-all flex items-center gap-2 ${productFilter === key && activeTab === 'products' ? 'text-white font-bold bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800/40'}`}
              >
                <Icon size={11} className={color || 'text-gray-400'} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => { setActiveTab('banners'); setProductFilter('all'); setProductsSubmenuOpen(false); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all text-sm ${activeTab === 'banners' ? 'bg-white text-gray-900 font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'} ${collapsed ? 'justify-center' : ''}`}
        title="Banners"
      >
        <ImageIcon size={18} className="flex-shrink-0" />
        {!collapsed && <span>Banners</span>}
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

      {/* Notificacion */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-full shadow-xl font-medium text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-gray-900 text-white' : notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
          {notification.type === 'success' && <Check size={14} />}
          {notification.type === 'error' && <AlertCircle size={14} />}
          {notification.message}
        </div>
      )}

      {/* SIDEBAR DESKTOP
          FIX: click en aside colapsa/expande. Nav tiene stopPropagation para
          que los clicks en botones no disparen el toggle del aside. */}
      <aside
        onClick={() => setSidebarCollapsed(c => !c)}
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out cursor-pointer shadow-2xl z-50 select-none overflow-hidden`}
      >
        <div className={`h-14 flex items-center border-b border-gray-800/50 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'px-4 gap-2'}`}>
          <StoreIcon size={18} className="text-gray-400 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-bold text-sm tracking-tight flex-grow">ADMIN PANEL</span>}
          {!sidebarCollapsed && <ChevronLeft size={14} className="text-gray-500" />}
        </div>

        <nav className="flex-grow p-3 space-y-1 overflow-hidden" onClick={e => e.stopPropagation()}>
          <NavItems collapsed={sidebarCollapsed} />
        </nav>

        <div className="p-3 border-t border-gray-800/50 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 py-2.5 px-3 text-gray-400 hover:text-red-400 transition-colors text-sm rounded-xl hover:bg-gray-800/50 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </aside>

      {/* DRAWER MOBILE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 flex flex-col shadow-2xl">
            <div className="h-14 flex items-center px-4 border-b border-gray-800/50">
              <span className="font-bold text-white text-sm flex-grow">ADMIN PANEL</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
              <NavItems collapsed={false} />
            </nav>
            <div className="p-3 border-t border-gray-800/50">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 px-3 text-gray-400 hover:text-red-400 text-sm rounded-xl hover:bg-gray-800/50">
                <LogOut size={17} /><span>Cerrar Sesion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">

        {/* HEADER MOBILE
            FIX: el header esta FUERA del area scrollable (main). Esto significa
            que en mobile el header se ve arriba, y cuando la lista scrollea
            hacia abajo el header desaparece del viewport naturalmente.
            El buscador (sticky dentro de main) queda fijo en su lugar. */}
        <header className="bg-white shadow-sm px-4 py-3 flex md:hidden items-center gap-3 flex-shrink-0">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-700 active:scale-90 transition-transform">
            <Menu size={22} />
          </button>
          <span className="font-black text-gray-900 text-sm flex-grow">PANEL ADMIN</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 active:scale-90 transition-transform">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-4 md:p-6">

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Hola, Admin!</h2>
                <p className="text-gray-500 mt-1 text-sm">Resumen del estado de tu negocio.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StockStatCard title="Agotados" value={dashboardStats.outOfStock} subtext="Sin stock" color="border-red-200" icon={Ban} onClick={() => goToFilter('outOfStock')} />
                <StockStatCard title="Stock Critico" value={dashboardStats.lowStock} subtext="Menos de 5 unidades" color="border-yellow-200" icon={AlertTriangle} onClick={() => goToFilter('lowStock')} />
                <StockStatCard title="Total Productos" value={dashboardStats.total} subtext="En catalogo" color="border-gray-200" icon={Package} onClick={() => goToFilter('all')} />
              </div>
            </div>
          )}

          {/* PRODUCTOS / BANNERS */}
          {activeTab !== 'dashboard' && (
            <div className="flex flex-col gap-4 h-full">

              {/* Encabezado + botones */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                    {activeTab === 'products' ? 'Inventario' : 'Banners'}
                  </h2>
                  {activeTab === 'products' && productFilter !== 'all' && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${productFilter === 'outOfStock' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {productFilter === 'outOfStock' ? 'Mostrando: Agotados' : 'Mostrando: Stock Critico'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {activeTab === 'products' && (
                    <>
                      <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-xs shadow active:scale-95 transition-transform" title="Descarga el modelo de Excel">
                        <Download size={13} /> Modelo CSV
                      </button>
                      <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" />
                      <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-xs shadow active:scale-95 transition-transform">
                        <FileSpreadsheet size={13} /> Importar Excel
                      </button>
                    </>
                  )}
                  <button onClick={() => { setEditingItem({}); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold text-xs shadow active:scale-95 transition-transform">
                    <Plus size={13} /> Nuevo
                  </button>
                </div>
              </div>

              {/* BUSCADOR — sticky dentro del main scrollable
                  En mobile: cuando la tabla scrollea, este input queda fijo
                  en la parte superior del area de contenido (no del header). */}
              <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center sticky top-0 z-10">
                <Search className="text-gray-400 flex-shrink-0" size={17} />
                <input
                  className="flex-grow outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-700">
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Tabla PRODUCTOS */}
              {activeTab === 'products' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-grow min-h-0">
                <div className="overflow-auto flex-grow">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="p-3 border-b w-14">Img</th>
                        <th className="p-3 border-b">Nombre</th>
                        <th className="p-3 border-b text-right">Precio</th>
                        <th className="p-3 border-b text-center">Stock</th>
                        <th className="p-3 border-b text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItems.length === 0 ? (
                        <tr><td colSpan="5" className="p-10 text-center text-gray-400 text-sm">No se encontraron resultados</td></tr>
                      ) : (
                        paginatedItems.map(item => (
                          <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.isVisible === false ? 'opacity-50' : ''}`}>
                            <td className="p-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg border overflow-hidden">
                                {item.imageUrl || item.images?.[0]
                                  ? <img src={item.imageUrl || item.images[0]} className="w-full h-full object-cover" alt="" />
                                  : <ImageIcon className="w-full h-full p-2 text-gray-300" />}
                              </div>
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-800 max-w-[180px]">
                              <span className="line-clamp-2">{item.name}</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {item.isVisible === false && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Oculto</span>}
                                {(item.stock || 0) <= 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Agotado</span>}
                                {(item.stock || 0) > 0 && (item.stock || 0) <= 5 && <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">Critico</span>}
                                {(item.images?.length || 0) > 1 && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">{item.images.length} fotos</span>}
                              </div>
                            </td>
                            <td className="p-3 text-right text-sm text-gray-600 font-medium">${item.unitPrice}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${(item.stock || 0) > 10 ? 'bg-green-100 text-green-700' : (item.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {item.stock ?? 0}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 font-bold text-xs text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors">Anterior</button>
                  <span className="text-xs text-gray-400 font-medium">Pag. {currentPage} · {filteredItems.length} resultados</span>
                  <button disabled={paginatedItems.length < itemsPerPage} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 font-bold text-xs text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors">Siguiente</button>
                </div>
              </div>
              )}

              {/* Tabla BANNERS */}
              {activeTab === 'banners' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-grow min-h-0">
                <div className="overflow-auto flex-grow">
                  <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="p-3 border-b w-20">Preview</th>
                        <th className="p-3 border-b">Título</th>
                        <th className="p-3 border-b text-center w-24">Imágenes</th>
                        <th className="p-3 border-b text-center w-16">Orden</th>
                        <th className="p-3 border-b text-center w-20">Estado</th>
                        <th className="p-3 border-b text-right w-20">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItems.length === 0 ? (
                        <tr><td colSpan="6" className="p-10 text-center text-gray-400 text-sm">No hay banners aún. Creá el primero con el botón + Nuevo</td></tr>
                      ) : (
                        paginatedItems.map(item => (
                          <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.active === false ? 'opacity-50' : ''}`}>
                            <td className="p-3">
                              <div className="w-16 h-10 bg-gray-100 rounded-lg border overflow-hidden">
                                {item.imageDesktop || item.imageUrl
                                  ? <img src={item.imageDesktop || item.imageUrl} className="w-full h-full object-cover" alt="" />
                                  : <ImageIcon className="w-full h-full p-2 text-gray-300" />}
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="text-sm font-medium text-gray-800">{item.title || <span className="text-gray-300 italic">Sin título</span>}</p>
                              {item.linkUrl && <p className="text-[10px] text-blue-400 truncate max-w-[200px] mt-0.5">{item.linkUrl}</p>}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${item.imageDesktop || item.imageUrl ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                  <Monitor size={9}/> PC
                                </span>
                                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${item.imageMobile ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  <Smartphone size={9}/> {item.imageMobile ? 'OK' : '—'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-sm font-bold text-gray-600">{item.order ?? '—'}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                {item.active !== false ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 font-bold text-xs text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors">Anterior</button>
                  <span className="text-xs text-gray-400 font-medium">{filteredItems.length} banners</span>
                  <button disabled={paginatedItems.length < itemsPerPage} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 font-bold text-xs text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors">Siguiente</button>
                </div>
              </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={activeTab === 'banners' ? (editingItem?.id ? 'Editar Banner' : 'Nuevo Banner') : (editingItem?.id ? 'Editar Producto' : 'Nuevo Producto')}>
        {activeTab === 'products' ? (
          <ProductForm
            product={editingItem?.id ? editingItem : null}
            onSave={handleSave}
            onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
            categories={[...new Set(items.map(i => i.category).filter(Boolean))]}
          />
        ) : (
          <BannerForm
            banner={editingItem?.id ? editingItem : null}
            onSave={handleSave}
            onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
            totalBanners={items.length}
          />
        )}
      </Modal>
    </div>
  );
}