import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      const products = JSON.parse(storagedCart)
      return products;
    }

    return [];
  });
  console.log(cart)
  const addProduct = async (productId: number) => {
    try {
      const product = await api.get(`products/${productId}`)
        .then(response => response.data)
        .then(data => {
          data.amount = 1
          return data
        })

      const filteredProduct = cart.filter((product) => product.id === productId)
      
      if(filteredProduct.length > 0) {
        updateProductAmount({productId: productId, amount:1})
      }else {
        const updateCart = cart
        updateCart.push(product)
        setCart(updateCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart))
      }
      
    } catch {
      // TODO
    }
  };
  
  const removeProduct = (productId: number) => {
    try {
      const removedProduct =  cart.filter((product) => {
        if(productId !== product.id){
          return product
        }
      })
      setCart(removedProduct)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(removedProduct))
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedProductAmount = cart.filter((product) => {
        if(product.id === productId){
          product.amount += amount
          return product
        }
        return product
      })

      setCart(updatedProductAmount)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedProductAmount))
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
