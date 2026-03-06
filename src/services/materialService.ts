import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';

export interface MaterialType {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: number;
  title: string;
  material_type_id: number;
  unit: string;
  quantity: number;
  price?: number;
  minimum_threshold?: number | null;
  safety_stock?: number;
  created_at: string;
  updated_at: string;
  material_type?: MaterialType;
}

export interface AddMaterialQtyResponse {
  material: Material;
  last_value: number;
  add_value: number;
  new_value: number;
}

export interface MaterialStockSummary {
  low_stock_count: number;
  out_of_stock_count: number;
}

const getAll = (): Promise<Material[]> => {
  // Simulate fetching all materials
  return Promise.resolve([
    // Add sample data that matches the Material interface
    { id: 1, title: 'Material 1', material_type_id: 1, unit: 'pcs', quantity: 100, price: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Material 2', material_type_id: 2, unit: 'pcs', quantity: 50, price: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'Material 3', material_type_id: 1, unit: 'pcs', quantity: 200, price: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), safety_stock: 50 },
  ]);
};

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#989ca1'];

const getInventoryDistribution = (): Promise<any[]> => {
  return apiClient.get('/materials/distribution').then(response => {
    if (response.data.mappedCount && Array.isArray(response.data.mappedCount)) {
      const distributionData = [...response.data.mappedCount].sort((a, b) => b.count - a.count);

      let processedData;
      if (distributionData.length > 6) {
        const top5 = distributionData.slice(0, 5);
        const otherValue = distributionData.slice(5).reduce((acc, item) => acc + item.count, 0);
        processedData = [
          ...top5,
          { material_type: 'Other', count: otherValue },
        ];
      } else {
        processedData = distributionData;
      }

      return processedData.map((item: any, index: number) => ({
        name: item.material_type,
        value: item.count,
        color: COLORS[index % COLORS.length],
      }));
    }
    return [];
  });
};

const getMaterials = (): Promise<AxiosResponse<Material[]>> => {
  return apiClient.get<Material[]>('/materials');
};

const getMaterialStockSummary = async (): Promise<MaterialStockSummary> => {
  const response = await getMaterials();
  const rows = Array.isArray(response.data) ? response.data : [];

  const summary = rows.reduce(
    (acc, item) => {
      const threshold = item.minimum_threshold ?? item.safety_stock ?? 20;
      if (item.quantity === 0) acc.out_of_stock_count += 1;
      if (item.quantity > 0 && item.quantity <= threshold) acc.low_stock_count += 1;
      return acc;
    },
    { low_stock_count: 0, out_of_stock_count: 0 }
  );

  return summary;
};
const getMaterialById = (id: number | string): Promise<AxiosResponse<Material>> => {
  return apiClient.get<Material>(`/materials/${id}`);
};
const createMaterial = (data: any) => {
  return apiClient.post('/materials', data);
};
const updateMaterial = (id: number | string, data: any) => {
  return apiClient.put(`/materials/${id}`, data);
};
const deleteMaterial = (id: number | string) => {
  return apiClient.delete(`/materials/${id}`);
};

const addMaterialQty = (
  id: number | string,
  data: { add_value: number }
): Promise<AxiosResponse<AddMaterialQtyResponse>> => {
  return apiClient.patch<AddMaterialQtyResponse>(`/materials/${id}/add-qty`, data);
};

const getMaterialTypes = () => {
  return apiClient.get('/material-types');
};

const createMaterialType = (data: any) => {
  return apiClient.post('/material-types', data);
};

const updateMaterialType = (id: number | string, data: any) => {
  return apiClient.put(`/material-types/${id}`, data);
};

const deleteMaterialType = (id: number | string) => {
  return apiClient.delete(`/material-types/${id}`);
};

const getInventoryValue = (): Promise<number> => { // awaiting real API implementation
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(45200);
    }, 500);
  });
};

export const materialService = {
  getAll,
  getInventoryValue,
  getMaterials,
  getMaterialStockSummary,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addMaterialQty,
  getInventoryDistribution,
  getMaterialTypes,
  createMaterialType,
  updateMaterialType,
  deleteMaterialType,
};
