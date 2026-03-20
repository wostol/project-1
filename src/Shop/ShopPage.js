// ShopPage.jsx
import { useState, useEffect } from 'react'
import './ShopPage.css'
import Shirt from  '../image/shirt.png'
import cap from '../image/cap.png'
import pen from '../image/pen.png'
const ShopPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const mockProducts = [
    {
      id: 1,
      name: 'Футболка',
      description: 'Хлопковая футболка с логотипом',
      price: 150,
      image: Shirt, // Предполагаем, что изображение лежит в папке public/images
      points: 150 // Баллы за покупку
    },
    {
      id: 2,
      name: 'Кружка',
      description: 'Керамическая кружка 350мл',
      price: 90,
      image: cap,
      points: 90
    },
    {
      id: 3,
      name: 'Ручка',
      description: 'Ручка с логотипом',
      price: 40,
      image: pen,
      points: 40
    }
  ]

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 500)

    // Получаем количество товаров в корзине
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    updateHeaderBadge(totalItems)
  }
  const updateHeaderBadge = count => {
    const badges = document.querySelectorAll('.cart-badge')
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count
        badge.style.display = 'flex'
      } else {
        badge.style.display = 'none'
      }
    })
  }
  const addToCart = product => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1
    } else {
      cart.push({
        ...product,
        quantity: 1
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
  }

  if (loading) {
    return (
      <div className='shop-page loading'>
        <div className='spinner'></div>
        <p>Загрузка товаров...</p>
      </div>
    )
  }

  return (
    <div className='shop-page'>
      <header className='shop-header'>
        <h1 className='shop-title'>Магазин</h1>
        <p className='shop-subtitle'>Официальная мерчендайзинг продукция</p>
      </header>

      <div className='shop-container'>
        {/* Сетка товаров */}
        <div className='products-grid'>
          {products.map(product => (
            <div key={product.id} className='product-card'>
              <div className='product-image'>
                <div className='image-placeholder'>
                  <img src={product.image} alt={product.name} />
                </div>
              </div>

              <div className='product-info'>
                <h3 className='product-name'>{product.name}</h3>
                <p className='product-description'>{product.description}</p>

                <div className='product-footer'>
                  <div className='product-price-points'>
                    <div className='product-points'>
                      {product.points} баллов
                    </div>
                  </div>
                  <button
                    className='add-to-cart-btn'
                    onClick={() => addToCart(product)}
                  >
                    <span>+</span> В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ShopPage
