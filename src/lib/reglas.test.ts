import { describe, expect, it } from 'vitest'
import { filaAProducto, leerPrecio } from './excel'
import { codigoPedido, mensajePedido, validarPaso, type DatosPedido } from './pedido'
import { cajasPorCantidad, formatoPrecio, precioCaja, precioUnitarioDesde, totalCarrito } from './precios'
import type { ItemCarrito, Producto } from './tipos'

const base: Producto = {
  id: 'arroz', nombre: 'Arroz 1 kg', marca: 'Don Cosme', categoria: 'Almacén',
  precios: { retiro: 10000, bulto: 12000, pallet: 11000 }, unidadesPorCaja: 10, cajasPorPallet: 80,
  stock: 50, imagenes: [], visible: true,
}

describe('precios', () => {
  it('usa el precio del modo elegido', () => {
    expect(precioCaja(base, 'retiro')).toBe(10000)
    expect(precioCaja(base, 'bulto')).toBe(12000)
    expect(precioCaja(base, 'pallet')).toBe(11000)
  })
  it('sin precio de pallet, cobra el de bulto', () => {
    expect(precioCaja({ ...base, precios: { retiro: 10000, bulto: 12000 } }, 'pallet')).toBe(12000)
  })
  it('aplica la oferta y la limita a 90 %', () => {
    expect(precioCaja({ ...base, oferta: 10 }, 'retiro')).toBe(9000)
    expect(precioCaja({ ...base, oferta: 150 }, 'retiro')).toBe(1000)
  })
  it('precio por unidad = caja en retiro / unidades', () => {
    expect(precioUnitarioDesde(base)).toBe(1000)
  })
  it('en pallet multiplica por las cajas que trae; si no se sabe, son cajas sueltas', () => {
    expect(cajasPorCantidad(base, 'pallet', 2)).toBe(160)
    expect(cajasPorCantidad({ ...base, cajasPorPallet: undefined }, 'pallet', 2)).toBe(2)
    expect(cajasPorCantidad(base, 'bulto', 0)).toBe(1)
  })
  it('formatea en pesos argentinos', () => {
    expect(formatoPrecio(1234567.6)).toBe('$ 1.234.568')
    expect(formatoPrecio(Number.NaN)).toBe('$ 0')
  })
})

describe('pedido', () => {
  const items: ItemCarrito[] = [
    { productoId: 'arroz', nombre: 'Arroz 1 kg', imagen: '', modo: 'retiro', cajas: 3, precioCaja: 10000 },
    { productoId: 'agua', nombre: 'Agua 2 L', imagen: '', modo: 'pallet', cajas: 84, precioCaja: 5000 },
  ]
  const datos: DatosPedido = { cliente: 'Almacén Rosa', entrega: 'envio', calle: 'Libertador', altura: '500', localidad: 'Moreno', pago: 'Efectivo' }

  it('suma el total', () => expect(totalCarrito(items)).toBe(450000))

  it('arma el mensaje con detalle, total, dirección y pago', () => {
    const m = mensajePedido(items, datos, 'MO-AB12')
    expect(m).toContain('*Almacén Rosa*')
    expect(m).toContain('(MO-AB12)')
    expect(m).toContain('3 × Arroz 1 kg — Retiro')
    expect(m).toContain('84 × Agua 2 L — Pallet')
    expect(m).toContain('Total estimado: $ 450.000')
    expect(m).toContain('Libertador 500')
    expect(m).toContain('*Pago:* Efectivo')
    expect(m).not.toMatch(/\p{Extended_Pictographic}/u)
  })

  it('valida cada paso', () => {
    expect(validarPaso(0, { ...datos, cliente: ' ' })).toHaveProperty('cliente')
    expect(validarPaso(1, { ...datos, calle: '' })).toHaveProperty('calle')
    expect(validarPaso(1, { ...datos, entrega: 'retiro', calle: '' })).toEqual({})
    expect(validarPaso(2, { ...datos, pago: '' })).toHaveProperty('pago')
  })

  it('genera códigos de 4 caracteres sin letras confusas', () => {
    expect(codigoPedido(() => 0)).toBe('MO-AAAA')
    expect(codigoPedido()).toMatch(/^MO-[A-HJ-NP-Z2-9]{4}$/)
  })
})

describe('importación de Excel', () => {
  it('entiende precios escritos a mano', () => {
    expect(leerPrecio('$12.423')).toBe(12423)
    expect(leerPrecio('12.423,50')).toBe(12423.5)
    expect(leerPrecio(9800)).toBe(9800)
    expect(leerPrecio('abc')).toBe(0)
  })

  it('convierte una fila en producto', () => {
    const { producto, errores } = filaAProducto(
      { Nombre: 'Yerba 1 kg', Categoria: 'Almacén', PrecioRetiro: '$42.500', PrecioBulto: 46200, UnidadesPorCaja: 10, Stock: 7, Oferta: 10, MasVendido: 'SI', Visible: 'NO' },
      2,
    )
    expect(errores).toEqual([])
    expect(producto).toMatchObject({ id: 'yerba-1-kg', precios: { retiro: 42500, bulto: 46200 }, stock: 7, oferta: 10, masVendido: true, visible: false })
  })

  it('multiplica por la caja cuando el precio es unitario', () => {
    const { producto } = filaAProducto({ Nombre: 'Lavandina', PrecioRetiro: 1200, PrecioBulto: 1340, PrecioEsUnitario: 'SI', UnidadesPorCaja: 8 }, 2)
    expect(producto?.precios).toEqual({ retiro: 9600, bulto: 10720 })
  })

  it('marca las filas con errores', () => {
    const { producto, errores } = filaAProducto({ Nombre: '', PrecioRetiro: 0 }, 5)
    expect(producto).toBeUndefined()
    expect(errores).toContain('Falta el nombre')
  })

  it('si no trae stock, conserva el que ya tenía', () => {
    const { producto } = filaAProducto({ Nombre: 'Arroz 1 kg', PrecioRetiro: 1, PrecioBulto: 1 }, 2, { ...base, stock: 33 })
    expect(producto?.stock).toBe(33)
  })
})
