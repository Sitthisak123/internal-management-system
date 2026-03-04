import apiClient from './apiClient';

// --- Interfaces (Matches your Prisma Schema & Controller) ---

export interface UserSubset {
  id: number;
  fullname: string;
  username: string;
  email: string;
  position: string;
  role: number;
}

export interface RequisitionItem {
  id: number;
  material_id: number;
  quantity: number;
  material?: {
    id: number;
    title: string;
    unit: string;
  };
}

export interface Requisition {
  id: number;
  ref_no: string;
  subject: string;
  description?: string;
  purpose?: string;
  status: '-1' | '0' | '1';
  form_date: string;
  created_at: string;
  updated_at: string;
  evaluated_at?: string;
  creator: UserSubset;
  owner: UserSubset;
  authorizer?: UserSubset | null;
  mr_form_materials: RequisitionItem[];
}

const getCountFilteredByStatus = (status: string): Promise<Requisition[]> => {
  return apiClient.get<Requisition[]>(`/requisitions/statusCount/${status}`);
};

const getStatusText = (status: number | string): 'Pending' | 'Approved' | 'Rejected' => {
  const statusStr = String(status);
  if (statusStr === '1' || statusStr === 'approved') return 'Approved';
  if (statusStr === '-1' || statusStr === 'rejected') return 'Rejected';
  return 'Pending'; // Default for '0' or any other value
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const getRecentRequisitions = (): Promise<any[]> => {
  return apiClient.get('/requisitions/recentActivities').then(response => {
    if (response.data.recentActivities && Array.isArray(response.data.recentActivities)) {
      return response.data.recentActivities.map((req: any) => {
        let itemText = 'No items in requisition';
        if (req.mr_form_materials && req.mr_form_materials.length > 0) {
          itemText = req.mr_form_materials[0].material?.title ?? 'Item name not available';
          if (req.mr_form_materials.length > 1) {
            itemText += ` and ${req.mr_form_materials.length - 1} more`;
          }
        }

        return {
          id: req.ref_no,
          user: req.creator?.fullname ?? 'Unknown User',
          item: itemText,
          date: formatDate(req.form_date),
          status: getStatusText(req.status),
          avatar: `https://picsum.photos/seed/${req.creator?.fullname ?? 'default'}/40/40`,
        };
      });
    }
    return [];
  });
};

const getRequisitionVolume = (months?: number[]): Promise<any[]> => {
  let queryString = '';
  if (months && months.length > 0) {
    queryString = `?months=${months.join(',')}`;
  }
  return apiClient.get(`/requisitions/volume${queryString}`);
};

// --- Service Methods ---

const getRequisitions = () => {
  return apiClient.get<Requisition[]>('/requisitions');
};

const getRequisitionById = (id: number) => {
  return apiClient.get<Requisition>(`/requisitions/${id}`);
};

const createRequisition = (data: Partial<Requisition> & { items: any[] }) => {
  return apiClient.post<Requisition>('/requisitions', data);
};

const updateRequisition = (id: number, data: Partial<Requisition> & { items?: any[] }) => {
  return apiClient.put<Requisition>(`/requisitions/${id}`, data);
};

const deleteRequisition = (id: number) => {
  return apiClient.delete(`/requisitions/${id}`);
};

export const requisitionService = {
  getRequisitions,
  getRequisitionById,
  getCountFilteredByStatus,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  getRecentRequisitions,
  getRequisitionVolume,
};