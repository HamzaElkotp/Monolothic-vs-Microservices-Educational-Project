"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Product { id: number; name: string; description: string; price: number; stock: number; }

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get('http://localhost:4000/products').then(res => setProducts(res.data));
  }, []);

  const addToCart = async (productId: number) => {
    const token = Cookies.get('token');
    if (!token) return alert('Please login first');

    try {
      await axios.post('http://localhost:4000/cart/items', { productId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Added to cart');
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded shadow-sm flex flex-col items-start bg-white text-black">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-600 my-2">{p.description}</p>
            <span className="font-bold text-lg">${p.price}</span>
            <button
              onClick={() => addToCart(p.id)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded self-end hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
