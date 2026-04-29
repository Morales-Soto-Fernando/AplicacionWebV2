import { http } from './http';
import type { Product } from './types';

export async function getProducts(): Promise<Product[]> {
  const { data } = await http.get<Product[]>('/products');
  return data;
}