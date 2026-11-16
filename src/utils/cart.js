import { API_URL } from "./config.js";
import axios from "axios";

// =====================================================
// AUTH HEADER
// =====================================================

function getAuthConfig() {
  const token = localStorage.getItem("token");

  if (token == null) {
    const error = new Error("LOGIN_REQUIRED");
    error.code = "LOGIN_REQUIRED";
    throw error;
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// =====================================================
// LOAD CART FROM MONGODB
// =====================================================

export async function loadCart() {
  const response = await axios.get(
    API_URL + "/api/cart",
    getAuthConfig(),
  );

  return response.data.items || [];
}

// =====================================================
// ADD / INCREASE / DECREASE
// quantity = 1  -> increase
// quantity = -1 -> decrease
// =====================================================

export async function addToCart(product, quantity) {
  const response = await axios.post(
    API_URL + "/api/cart/add",
    {
      productId: product.productId,
      quantity: Number(quantity),
    },
    getAuthConfig(),
  );

  return response.data.items || [];
}

// =====================================================
// REMOVE PRODUCT
// =====================================================

export async function removeFromCart(productId) {
  const response = await axios.delete(
    API_URL + "/api/cart/" + productId,
    getAuthConfig(),
  );

  return response.data.items || [];
}

// =====================================================
// CLEAR CART
// =====================================================

export async function clearCart() {
  const response = await axios.delete(
    API_URL + "/api/cart",
    getAuthConfig(),
  );

  return response.data.items || [];
}
