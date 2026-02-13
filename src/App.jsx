import admin from './admin.jsx';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  getDocs 
} from "firebase/firestore";
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  AlertCircle,
  MessageCircle,
  Truck,
  User,
  Check,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Navigation
} from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCMNcQoIV9hYsZYHcYr_wmLn71qSJHebIs",
  authDomain: "pedido-digital-online.firebaseapp.com",
  projectId: "pedido-digital-online",
  storageBucket: "pedido-digital-online.firebasestorage.app",
  messagingSenderId: "612281107703",
  appId: "1:612281107703:web:240f0979aaf640986fbff2",
  measurementId: "G-8DVXBZZE93"
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID_DB = "1:612281107703:web:240f0979aaf640986fbff2";

// --- UTILIDADES ---
const formatPrice = (price) => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return "0";
};

// --- COMPONENTES UI INDEPENDIENTES ---

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors active:scale-90 duration-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Notification = ({ message, type, show }) => {
  if (!show) return null;
  const colors = {
    success: 'bg-gray-900 text-white border-gray-800',
    error: 'bg-red-600 text-white border-red-700',
    info: 'bg-white text-gray-900 border-gray-200 shadow-lg'
  };
  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-xl border font-medium text-sm tracking-wide transition-all duration-300 flex items-center gap-2 ${colors[type] || colors.info}`}>
      {type === 'success' && <Check size={16} />}
      {message}
    </div>
  );
};

// Componente Footer Profesional con Background Image
const Footer = () => {
  return (
    <footer 
      className="relative text-white pt-16 pb-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.85)), url('https://firebasestorage.googleapis.com/v0/b/misuperappmayorista.firebasestorage.app/o/footer_mayorista.png?alt=media&token=97089e23-4dc1-4dca-bc63-dc2e4f4adff3')`
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-2xl font-black mb-4 tracking-tighter text-white">MAYORISTA<span className="text-gray-400">ONLINE</span></h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Somos tu mejor opción para compras mayoristas. Calidad, precio y atención personalizada en cada pedido.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all border border-white/10">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all border border-white/10">
                <Instagram size={20} />
              </a>
              <a href="https://wa.me/5491124952866" target="_blank" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-green-500 hover:text-white transition-all border border-white/10">
                <Phone size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white border-b border-gray-700 pb-2 inline-block">Contacto</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <span>Av. Victorica 1234, Moreno,<br/>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400 shrink-0" />
                <span>+54 9 11 2495-2866</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white border-b border-gray-700 pb-2 inline-block">Ubicación</h4>
            <div className="bg-black/30 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg">
              <p className="text-xs text-gray-300 mb-4">Encuéntranos fácilmente en Google Maps y vení a conocer nuestro local.</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Moreno+Buenos+Aires" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 bg-white text-gray-900 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-md active:scale-95"
              >
                <Navigation size={16} />
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700/50 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} MayoristaOnline. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

// Componente de Categorías con Scroll Táctil
const CategoryScroll = ({ categories, activeCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group w-full max-w-6xl mx-auto py-6 px-4 sm:px-8">
      {/* Botones de navegación para desktop (ocultos en móvil si se prefiere solo táctil, pero útiles) */}
      <button 
        onClick={() => scroll('left')} 
        className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-100 p-2 rounded-full text-gray-700 hover:text-black hover:scale-110 active:scale-90 transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x px-2 scrollbar-hide"
        style={{ 
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE/Edge */
        }}
      >
        {/* Estilo inline para ocultar scrollbar en Webkit (Chrome/Safari) */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 border snap-center flex-shrink-0 active:scale-95 ${
              activeCategory === cat 
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')} 
        className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-100 p-2 rounded-full text-gray-700 hover:text-black hover:scale-110 active:scale-90 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

// ProductCard optimizado para Grid de 2 columnas en móvil
const ProductCard = ({ product, cart, handleAddToCart, calculateItemPrice }) => {
  const [qty, setQty] = useState(0);
  const cartItem = cart.find(i => i.productId === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = (product.stock || 0) <= 0;

  const previewPrice = calculateItemPrice(product, qty || 0);
  const unitPrice = product.unitPrice || 0;
  const wholesalePrice = product.wholesalePrice || 0;
  const wholesaleQty = product.wholesaleQuantity || 0;
  const isWholesaleApplied = !product.isUnitSaleOnly && wholesaleQty > 0 && qty >= wholesaleQty;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group">
      {/* Imagen más compacta en móvil (h-40) */}
      <div className="relative h-40 sm:h-56 p-4 sm:p-6 bg-white flex items-center justify-center">
        {product.hasSpecialDiscount && product.discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 uppercase tracking-wider z-10 rounded-sm shadow-sm">
            Sale {product.discount}%
          </div>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="text-gray-400 font-bold uppercase tracking-widest border-2 border-gray-400 px-2 py-1 text-xs sm:text-base sm:px-4">Sin Stock</span>
            </div>
        )}
      </div>

      {/* Contenido más compacto (p-3 en móvil) */}
      <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between bg-gray-50/50">
        <div>
          <h4 className="text-gray-900 font-bold mb-1 sm:mb-2 line-clamp-2 leading-tight text-xs sm:text-base">{product.name}</h4>
          
          <div className="min-h-[3rem] sm:min-h-[3.5rem] mb-2 sm:mb-4">
              {product.isUnitSaleOnly ? (
                <div>
                  <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">
                      ${formatPrice(previewPrice)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">c/u</span>
                  </div>
                  {product.discount > 0 && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">${formatPrice(unitPrice)} c/u</span>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                    <span className={`text-lg sm:text-2xl font-bold text-gray-900`}>
                        ${formatPrice(previewPrice)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">c/u</span>
                    {isWholesaleApplied && <span className="text-[9px] sm:text-[10px] font-bold bg-green-100 text-green-800 px-1 rounded border border-green-200">MAYORISTA</span>}
                  </div>
                  
                  {!isWholesaleApplied && wholesaleQty > 0 && (
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-tight">
                      Lleva {wholesaleQty}+ a <span className="font-bold text-gray-900">${formatPrice(wholesalePrice)}</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
            {isOutOfStock ? (
              <button disabled className="w-full bg-gray-200 text-gray-400 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-medium cursor-not-allowed">
                Agotado
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 h-9 sm:h-11">
                <div className="flex items-center border border-gray-300 rounded bg-white h-full flex-shrink-0">
                  <button 
                  className="w-6 sm:w-8 h-full hover:bg-gray-100 text-gray-600 transition-colors font-bold active:bg-gray-200 text-sm sm:text-base"
                  onClick={() => setQty(Math.max(0, qty - 1))}
                  >-</button>
                  <input 
                  type="number" 
                  className="w-8 sm:w-10 text-center text-xs sm:text-sm focus:outline-none font-medium h-full p-0" 
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  />
                  <button 
                  className="w-6 sm:w-8 h-full hover:bg-gray-100 text-gray-600 transition-colors font-bold active:bg-gray-200 text-sm sm:text-base"
                  onClick={() => setQty(qty + 1)}
                  >+</button>
                </div>
                <button 
                onClick={() => {
                  handleAddToCart(product, qty);
                  setQty(0);
                }}
                disabled={qty === 0}
                className={`flex-grow h-full rounded text-[10px] sm:text-sm font-bold tracking-wide transition-all active:scale-95 duration-100 flex items-center justify-center ${
                  qty > 0 
                  ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400'
                }`}
                >
                  {/* TEXTO CORREGIDO: Siempre "AÑADIR" */}
                  AÑADIR
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const CartContent = ({ cart, updateCartQuantity, removeFromCart }) => {
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) return <div className="text-center py-20 text-gray-400 font-light">Tu carrito está vacío</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-6">
        {cart.map(item => (
          <div key={item.id} className="flex gap-4 items-start border-b border-gray-50 pb-6 last:border-0">
            <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2">
              <img src={item.imageUrl} className="max-w-full max-h-full object-contain" alt={item.name} />
            </div>
            <div className="flex-grow">
              <h5 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h5>
              <div className="text-xs text-gray-500 mb-3">${formatPrice(item.price)} c/u</div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border border-gray-200 rounded-md h-8">
                    <button className="px-3 hover:bg-gray-100 text-gray-500 active:bg-gray-200" onClick={() => updateCartQuantity(item.id, item.quantity, -1, item.productId)}>-</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button className="px-3 hover:bg-gray-100 text-gray-500 active:bg-gray-200" onClick={() => updateCartQuantity(item.id, item.quantity, 1, item.productId)}>+</button>
                </div>
                <div className="font-bold text-gray-900 text-lg">${formatPrice(item.price * item.quantity)}</div>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 active:scale-90">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <span className="text-gray-500">Total Estimado</span>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">${formatPrice(totalAmount)}</span>
          </div>
          <p className="text-xs text-gray-400 text-right mb-4">El envío se calcula en el siguiente paso</p>
      </div>
    </div>
  );
};

const CheckoutContent = ({ 
  checkoutStep, 
  setCheckoutStep, 
  checkoutData, 
  setCheckoutData, 
  cart, 
  clearCart, 
  setModalState, 
  showNotif 
}) => {
  
  const handleNext = () => {
    if (checkoutStep === 0 && !checkoutData.fullName) return showNotif("Nombre requerido", "error");
    if (checkoutStep === 1 && checkoutData.deliveryType === 'Delivery' && (!checkoutData.deliveryStreet || !checkoutData.deliveryHeight)) return showNotif("Dirección incompleta", "error");
    if (checkoutStep === 2 && !checkoutData.paymentMethod) return showNotif("Selecciona un método de pago", "error");
    setCheckoutStep(prev => prev + 1);
  };

  const handleBack = () => setCheckoutStep(prev => prev - 1);

  const sendOrder = async () => {
    if(cart.length === 0) return;

    let msg = `¡Hola! Soy *${checkoutData.fullName}*.\n\nQuiero confirmar el siguiente pedido:\n\n*📦 DETALLE:*\n`;
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      msg += `• ${item.name} (${item.quantity}) - $${formatPrice(item.price)} c/u\n`;
    });
    
    msg += `\n*TOTAL: $${formatPrice(total)}*\n\n`;
    msg += `*🚚 ENTREGA:* ${checkoutData.deliveryType}\n`;
    if (checkoutData.deliveryType === 'Delivery') {
      msg += `📍 Calle: ${checkoutData.deliveryStreet} ${checkoutData.deliveryHeight}\n`;
      if(checkoutData.deliveryCrossStreets) msg += `📍 Entre: ${checkoutData.deliveryCrossStreets}\n`;
      msg += `📍 Loc: ${checkoutData.deliveryLocation} (CP: ${checkoutData.deliveryZipCode})\n`;
    }
    msg += `*💳 PAGO:* ${checkoutData.paymentMethod}\n`;
    if(checkoutData.observations) msg += `*📝 NOTA:* ${checkoutData.observations}\n`;
    
    await clearCart();
    setModalState({ isOpen: false, type: null });
    setCheckoutStep(0);
    showNotif("¡Pedido enviado correctamente!", "success");
    
    window.open(`https://wa.me/5491124952866?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const steps = ['Cliente', 'Entrega', 'Pago', 'Confirmar'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 px-2">
          {steps.map((label, idx) => (
            <div key={label} className={`flex flex-col items-center gap-1 ${idx <= checkoutStep ? 'text-gray-900' : 'text-gray-300'}`}>
              <div className={`w-3 h-3 rounded-full ${idx <= checkoutStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
          ))}
      </div>

      {checkoutStep === 0 && (
        <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Datos del Cliente</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-11 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                placeholder="Nombre y Apellido"
                value={checkoutData.fullName}
                onChange={e => setCheckoutData({...checkoutData, fullName: e.target.value})}
              />
            </div>
        </div>
      )}

      {checkoutStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Método de Entrega</label>
            <div className="grid grid-cols-2 gap-4">
              {['Retiro en Local', 'Delivery'].map(type => (
                <label key={type} className={`p-4 border rounded-xl cursor-pointer text-center transition-all active:scale-95 ${checkoutData.deliveryType === type ? 'border-gray-900 bg-gray-900 text-white shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}>
                    <input type="radio" name="delivery" className="hidden" 
                      checked={checkoutData.deliveryType === type}
                      onChange={() => setCheckoutData({...checkoutData, deliveryType: type})}
                    />
                    <span className="font-bold text-sm">{type}</span>
                </label>
              ))}
            </div>

            {checkoutData.deliveryType === 'Delivery' && (
              <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <input 
                    className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-gray-900 outline-none" 
                    placeholder="Calle" 
                    value={checkoutData.deliveryStreet}
                    onChange={e => setCheckoutData({...checkoutData, deliveryStreet: e.target.value})}
                    />
                    <input 
                    className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-gray-900 outline-none" 
                    placeholder="Altura" 
                    value={checkoutData.deliveryHeight}
                    onChange={e => setCheckoutData({...checkoutData, deliveryHeight: e.target.value})}
                    />
                  </div>
                  <input 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-gray-900 outline-none" 
                    placeholder="Entrecalles (Opcional)" 
                    value={checkoutData.deliveryCrossStreets}
                    onChange={e => setCheckoutData({...checkoutData, deliveryCrossStreets: e.target.value})}
                  />
                  <div className="flex gap-3">
                    <input 
                      className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-gray-900 outline-none" 
                      placeholder="Localidad" 
                      value={checkoutData.deliveryLocation}
                      onChange={e => setCheckoutData({...checkoutData, deliveryLocation: e.target.value})}
                    />
                    <input 
                      className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-gray-900 outline-none" 
                      placeholder="CP" 
                      value={checkoutData.deliveryZipCode}
                      onChange={e => setCheckoutData({...checkoutData, deliveryZipCode: e.target.value})}
                    />
                  </div>
              </div>
            )}
          </div>
      )}

      {checkoutStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Forma de Pago</label>
            <div className="space-y-2">
              {['Efectivo', 'Transferencia Bancaria', 'Tarjeta Débito/Crédito'].map(method => (
                <label key={method} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all active:scale-95 ${checkoutData.paymentMethod === method ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value={method}
                      checked={checkoutData.paymentMethod === method}
                      onChange={() => setCheckoutData({...checkoutData, paymentMethod: method})}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${checkoutData.paymentMethod === method ? 'border-gray-900' : 'border-gray-400'}`}>
                      {checkoutData.paymentMethod === method && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                    </div>
                    <span className="font-medium text-gray-800">{method}</span>
                </label>
              ))}
            </div>
          </div>
      )}

      {checkoutStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Notas Adicionales</label>
            <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-24 focus:border-gray-900 outline-none resize-none" 
              placeholder="Ej: El timbre no funciona, dejar en portería..."
              value={checkoutData.observations}
              onChange={e => setCheckoutData({...checkoutData, observations: e.target.value})}
            />
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <MessageCircle size={20} className="shrink-0 text-green-600" />
              <p>Al confirmar, serás redirigido a <strong>WhatsApp</strong> con tu pedido. <strong>Stock sujeto a confirmación.</strong></p>
            </div>
          </div>
      )}

      <div className="flex justify-between pt-6 mt-2">
          {checkoutStep > 0 ? (
            <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors active:scale-95">Volver</button>
          ) : <div/>}
          
          {checkoutStep < 3 ? (
            <button onClick={handleNext} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
              Siguiente
            </button>
          ) : (
            <button onClick={sendOrder} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 active:scale-95">
              <Truck size={18} /> Confirmar Pedido
            </button>
          )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [banners, setBanners] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [modalState, setModalState] = useState({ type: null, isOpen: false }); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Inicio');
  const [activeSubcategory, setActiveSubcategory] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    deliveryType: 'Retiro en Local',
    deliveryStreet: '',
    deliveryHeight: '',
    deliveryCrossStreets: '',
    deliveryLocation: '',
    deliveryZipCode: '',
    paymentMethod: '',
    observations: ''
  });

  // --- EFECTOS ---

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          try {
            await signInWithCustomToken(auth, window.__initial_auth_token);
          } catch (tokenError) {
            console.warn("Token mismatch, usando anónimo:", tokenError);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
        try { await signInAnonymously(auth); } catch(e) {}
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const productsRef = collection(db, `artifacts/${APP_ID_DB}/public/data/products`);
    const qProducts = query(productsRef, orderBy('name', 'asc'));

    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
      setLoading(false);
    });

    const bannersRef = collection(db, `artifacts/${APP_ID_DB}/public/data/banners`);
    const qBanners = query(bannersRef, orderBy('order', 'asc'));
    
    const unsubBanners = onSnapshot(qBanners, (snapshot) => {
      const bns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(b => b.imageUrl && b.imageUrl.startsWith('http'));
      setBanners(bns);
    });

    return () => {
      unsubProducts();
      unsubBanners();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const cartRef = collection(db, `artifacts/${APP_ID_DB}/users/${user.uid}/cart`);
    const unsubCart = onSnapshot(cartRef, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCart(cartItems);
    });
    return () => unsubCart();
  }, [user]);

  // --- LOGICA ---

  const showNotif = (msg, type = 'info') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const calculateItemPrice = (product, quantity) => {
    const unitPrice = product.unitPrice || 0;
    const wholesalePrice = product.wholesalePrice || 0;
    const wholesaleQty = product.wholesaleQuantity || 0;
    const discount = product.discount || 0;
    let finalPrice = unitPrice;
    if (!product.isUnitSaleOnly && wholesaleQty > 0 && quantity >= wholesaleQty) {
      finalPrice = wholesalePrice;
    }
    if (discount > 0) {
      finalPrice = finalPrice * (1 - (discount / 100));
    }
    return finalPrice;
  };

  const handleAddToCart = async (product, qtyToAdd) => {
    if (!user) return showNotif("Iniciando sesión...", "info");
    if (qtyToAdd <= 0) return showNotif("Selecciona una cantidad", "error");
    if (product.stock < qtyToAdd) return showNotif("Stock insuficiente", "error");

    const existingItem = cart.find(item => item.productId === product.id);
    const cartRef = collection(db, `artifacts/${APP_ID_DB}/users/${user.uid}/cart`);

    try {
      const price = calculateItemPrice(product, qtyToAdd);
      if (existingItem) {
        await updateDoc(doc(cartRef, existingItem.id), { quantity: qtyToAdd, price: price });
        showNotif(`Actualizado: ${product.name}`, "success");
      } else {
        await addDoc(cartRef, { productId: product.id, name: product.name, price: price, quantity: qtyToAdd, imageUrl: product.imageUrl });
        showNotif(`Agregado al carrito`, "success");
      }
    } catch (e) {
      console.error(e);
      showNotif("Error al guardar", "error");
    }
  };

  const updateCartQuantity = async (itemId, currentQty, delta, productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newQty = Math.max(1, Math.min(product.stock || 1000, currentQty + delta));
    if (newQty === currentQty) return;
    const price = calculateItemPrice(product, newQty);
    const itemRef = doc(db, `artifacts/${APP_ID_DB}/users/${user.uid}/cart`, itemId);
    await updateDoc(itemRef, { quantity: newQty, price });
  };

  const removeFromCart = async (itemId) => {
    await deleteDoc(doc(db, `artifacts/${APP_ID_DB}/users/${user.uid}/cart`, itemId));
  };

  const clearCart = async () => {
    if (!user) return;
    const cartRef = collection(db, `artifacts/${APP_ID_DB}/users/${user.uid}/cart`);
    const snapshot = await getDocs(cartRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  };

  // --- FILTROS ---
  const allCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    return ['Inicio', 'Los más vendidos', 'Ofertas', ...cats]; 
  }, [products]);

  const availableSubcategories = useMemo(() => {
    if (['Inicio', 'Los más vendidos', 'Todos', 'Ofertas'].includes(activeCategory)) return [];
    const subs = products
      .filter(p => p.category === activeCategory && p.subcategory)
      .map(p => p.subcategory);
    return ['Todos', ...new Set(subs)];
  }, [activeCategory, products]);

  const filteredProducts = useMemo(() => {
    let res = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    } else {
        if (activeCategory === 'Los más vendidos') res = res.filter(p => p.isBestSeller);
        else if (activeCategory === 'Ofertas') res = res.filter(p => p.hasSpecialDiscount);
        else if (activeCategory !== 'Inicio' && activeCategory !== 'Todos') {
            res = res.filter(p => p.category === activeCategory);
            if (activeSubcategory !== 'Todos') {
                res = res.filter(p => p.subcategory === activeSubcategory);
            }
        }
    }

    switch (sortOrder) {
      case 'alpha_asc': res.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'alpha_desc': res.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price_asc': res.sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0)); break;
      case 'price_desc': res.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0)); break;
      case 'discount_desc': res.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
      default: break;
    }
    return res;
  }, [products, activeCategory, activeSubcategory, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = useMemo(() => {
    const idxLast = currentPage * productsPerPage;
    const idxFirst = idxLast - productsPerPage;
    return filteredProducts.slice(idxFirst, idxLast);
  }, [currentPage, filteredProducts]);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, activeSubcategory, searchQuery, sortOrder]);

  const BannerCarousel = () => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
      if (banners.length <= 1) return;
      const interval = setInterval(() => setIdx(prev => (prev + 1) % banners.length), 5000);
      return () => clearInterval(interval);
    }, [banners]);

    if (!banners.length) return <div className="h-48 sm:h-80 bg-gray-100 flex items-center justify-center rounded-none sm:rounded-2xl m-0 sm:m-4 animate-pulse"><span className="text-gray-400 font-medium tracking-widest">CARGANDO...</span></div>;

    return (
      <div className="relative h-48 sm:h-96 w-full overflow-hidden sm:rounded-2xl shadow-sm group">
        <div className="absolute inset-0 bg-black/5 z-10" />
        <img src={banners[idx].imageUrl} alt="Banner" className="w-full h-full object-cover transition-transform duration-1000 ease-in-out transform hover:scale-105" />
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex justify-center items-center gap-2 mt-12 mb-8">
        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors active:scale-95"><ChevronLeft size={18} /></button>
        {pageNumbers.map(number => (
          <button key={number} onClick={() => setCurrentPage(number)} className={`w-10 h-10 rounded-full font-medium text-sm transition-all active:scale-95 ${currentPage === number ? 'bg-gray-900 text-white shadow-lg scale-110' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>{number}</button>
        ))}
        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors active:scale-95"><ChevronRight size={18} /></button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Notification {...notification} />
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-900 active:scale-90 transition-transform"><Menu size={24} /></button>
          {/* CAMBIO: Logo funcional - resetea filtros */}
          <button 
            onClick={() => { setActiveCategory('Inicio'); setActiveSubcategory('Todos'); setSearchQuery(''); }}
            className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 hover:opacity-80 transition-opacity"
          >
            MAYORISTA<span className="text-gray-400">ONLINE</span>
          </button>
          
          <div className="flex items-center gap-5">
             <div className="hidden lg:flex relative group">
                <input type="search" placeholder="Buscar productos..." className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full w-64 focus:w-80 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all duration-300 outline-none placeholder-gray-400 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
             </div>
             <button className="lg:hidden text-gray-900 active:scale-90 transition-transform" onClick={() => setSearchOpen(!searchOpen)}><Search size={22} /></button>
             <button className="relative text-gray-900 hover:scale-110 active:scale-90 transition-transform duration-200" onClick={() => setModalState({ isOpen: true, type: 'cart' })}>
               <ShoppingCart size={24} strokeWidth={2} />
               {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{cart.reduce((a, c) => a + c.quantity, 0)}</span>}
             </button>
          </div>
        </div>
        <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-gray-50 ${searchOpen ? 'max-h-16 px-4 pb-3 pt-1 border-b' : 'max-h-0'}`}>
           <input type="search" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900" placeholder="¿Qué estás buscando?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:hidden`}>
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
         <nav className="relative bg-white w-3/4 max-w-sm h-full shadow-2xl flex flex-col p-6">
            <div className="flex justify-between items-center mb-8"><span className="font-black text-xl tracking-tighter">MENÚ</span><button onClick={() => setSidebarOpen(false)} className="active:scale-90 transition-transform"><X size={24} /></button></div>
            <ul className="space-y-6 text-lg font-medium text-gray-800">
               {['Inicio', 'Los más vendidos', 'Ofertas'].map(cat => (
                 <li key={cat}><button onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }} className="hover:text-black hover:translate-x-2 transition-all block w-full text-left active:scale-95">{cat}</button></li>
               ))}
               <li className="border-t border-gray-100 pt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Explorar Categorías</li>
               {allCategories.filter(c => !['Inicio', 'Los más vendidos', 'Ofertas'].includes(c)).map(cat => (
                 <li key={cat}><button onClick={() => { setActiveCategory(cat); setSidebarOpen(false); }} className="hover:text-black text-base font-normal block w-full text-left active:scale-95">{cat}</button></li>
               ))}
            </ul>
         </nav>
      </div>

      <main className="flex-grow container mx-auto px-4 pb-24">
        {/* CAMBIO: Banner siempre visible, solo se oculta en Búsqueda */}
        {!searchQuery && <div className="mt-4"><BannerCarousel /></div>}
        
        {/* Componente de Categorías Optimizado */}
        <div className="mt-8 mb-6 animate-fadeIn">
          <CategoryScroll 
            categories={allCategories} 
            activeCategory={activeCategory} 
            onSelectCategory={(cat) => { setActiveCategory(cat); setActiveSubcategory('Todos'); setSearchQuery(''); }} 
          />
        </div>

        <section className="mt-4">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{searchQuery ? `Buscar: "${searchQuery}"` : activeCategory}</h2>
                {activeSubcategory !== 'Todos' && <span className="text-gray-400 font-medium text-sm mt-1 block">/ {activeSubcategory}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                 {availableSubcategories.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto max-w-full md:max-w-md scrollbar-hide py-1">
                      {availableSubcategories.map(sub => (
                        <button key={sub} onClick={() => setActiveSubcategory(sub)} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded border transition-all active:scale-95 ${activeSubcategory === sub ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}>{sub}</button>
                      ))}
                   </div>
                 )}
                 <div className="relative ml-auto">
                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95">
                      <Filter size={16} /> <span className="hidden sm:inline">Ordenar</span> <ChevronDown size={14} />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden animate-fadeIn">
                        {[
                          {val: 'default', label: 'Relevancia'}, {val: 'price_asc', label: 'Menor Precio'}, {val: 'price_desc', label: 'Mayor Precio'}, {val: 'discount_desc', label: 'Descuentos'}, {val: 'alpha_asc', label: 'Nombre (A-Z)'}
                        ].map(opt => (
                          <button key={opt.val} className="block w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 active:bg-gray-100" onClick={() => { setSortOrder(opt.val); setIsSortDropdownOpen(false); }}>{opt.label}</button>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse" />)}</div>
           ) : currentProducts.length > 0 ? (
             <>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-x-6 gap-y-6 sm:gap-y-10 animate-fadeIn" key={activeCategory + currentPage}>
                 {currentProducts.map(product => (
                   <ProductCard key={product.id} product={product} cart={cart} handleAddToCart={handleAddToCart} calculateItemPrice={calculateItemPrice} />
                 ))}
               </div>
               <PaginationControls />
             </>
           ) : (
             <div className="text-center py-32 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-400 text-xl font-light mb-4">No encontramos lo que buscas.</p>
               <button onClick={() => {setSearchQuery(''); setActiveCategory('Todos');}} className="text-gray-900 font-bold underline hover:text-black">Ver todo el catálogo</button>
             </div>
           )}
        </section>
      </main>

      {/* CAMBIO: Footer agregado */}
      <Footer />

      {cart.length > 0 && (
        <button onClick={() => setModalState({ isOpen: true, type: 'cart' })} className="fixed bottom-8 right-8 bg-gray-900 text-white p-0 w-16 h-16 rounded-full shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all z-30 flex flex-col items-center justify-center border-4 border-white/20 backdrop-blur">
          <ShoppingCart size={22} />
          <span className="text-[9px] font-bold mt-1 opacity-90">${formatPrice(cart.reduce((a,c) => a + c.price*c.quantity, 0))}</span>
          <span className="absolute top-0 right-0 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-gray-200">{cart.reduce((a, c) => a + c.quantity, 0)}</span>
        </button>
      )}

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={modalState.type === 'cart' ? 'MI CARRITO' : modalState.type === 'checkout' ? 'FINALIZAR COMPRA' : 'Información'}
        footer={modalState.type === 'cart' && cart.length > 0 ? (
          <button onClick={() => setModalState({ isOpen: true, type: 'checkout' })} className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-black font-bold w-full shadow-lg transition-all active:scale-95">CONTINUAR COMPRA</button>
        ) : null}
      >
        {modalState.type === 'cart' && <CartContent cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} />}
        {modalState.type === 'checkout' && (
          <CheckoutContent 
            checkoutStep={checkoutStep} 
            setCheckoutStep={setCheckoutStep} 
            checkoutData={checkoutData} 
            setCheckoutData={setCheckoutData} 
            cart={cart} 
            clearCart={clearCart} 
            setModalState={setModalState} 
            showNotif={showNotif} 
          />
        )}
      </Modal>
    </div>
  );
}