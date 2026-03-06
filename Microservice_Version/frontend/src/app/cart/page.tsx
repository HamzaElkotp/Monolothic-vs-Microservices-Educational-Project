"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface CartItem {
    id: number;
    quantity: number;
    product: { id: number; name: string; price: number; };
}
interface Cart { id: number; items: CartItem[]; }

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null);

    const fetchCart = () => {
        const token = Cookies.get('token');
        if (!token) return;
        axios.get('http://localhost:4000/cart', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setCart(res.data)).catch(console.error);
    };

    useEffect(() => fetchCart(), []);

    const removeItem = async (itemId: number) => {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:4000/cart/items/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchCart();
    };

    const checkout = async () => {
        const token = Cookies.get('token');
        try {
            await axios.post('http://localhost:4000/orders/checkout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Checkout successful! Notification sent.');
            fetchCart();
        } catch {
            alert('Checkout failed');
        }
    };

    if (!cart) return <div className="mt-10">Please login to view your cart.</div>;

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
            {cart.items.length === 0 ? (
                <p>Cart is empty</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {cart.items.map(item => (
                        <div key={item.id} className="flex justify-between border-b py-4 items-center">
                            <div>
                                <h2 className="text-xl font-semibold">{item.product.name}</h2>
                                <div className="text-gray-600">Qty: {item.quantity} x ${item.product.price}</div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 font-bold border border-red-500 px-3 py-1 rounded">Remove</button>
                        </div>
                    ))}
                    <div className="text-2xl font-bold self-end mt-4">Total: ${total.toFixed(2)}</div>
                    <button onClick={checkout} className="bg-green-600 text-white p-3 rounded text-xl self-end mt-4 hover:bg-green-700">Checkout</button>
                </div>
            )}
        </div>
    );
}
