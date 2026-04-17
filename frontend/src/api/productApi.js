import api from "./axios";

export const getProducts = (params, config = {}) => {
  return api.get("/products/", { params, ...config });
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};