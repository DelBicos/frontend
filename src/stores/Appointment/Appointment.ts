import { create } from 'zustand';
import {
  Appointment,
  AppointmentSheetRow,
  AppointmentStatus,
  AppointmentStore,
  InvoiceData,
} from './types';
import { useUserStore } from '@stores/User';
import { backendHttpClient } from '@lib/helpers/httpClient';

export const useAppointmentStore = create<AppointmentStore>()((set) => ({
  appointments: [],
  appointmentsByStatus: {},
  loading: false,
  activeRole: undefined,

  fetchAppointments: async (role) => {
    set({ loading: true, appointments: [], activeRole: role });
    try {
      const { user } = useUserStore.getState();
      if (!user) throw new Error('Usuário não autenticado.');

      let endpoint = `api/appointments/user/${user.id}`;
      if (role) {
        endpoint += `?role=${role}`;
      }
      const response = await backendHttpClient.get(endpoint);

      const sortedData = response.data.sort(
        (a: Appointment, b: Appointment) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      );
      const appointmentsByStatus = sortedData.reduce(
        (
          acc: { [key in AppointmentStatus]?: Appointment[] },
          appointment: Appointment,
        ) => {
          const status = appointment.status;
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push(appointment);
          return acc;
        },
        {} as { [key in AppointmentStatus]?: Appointment[] },
      );

      set({ appointments: sortedData, appointmentsByStatus, loading: false });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      set({ appointments: [], loading: false });
    }
  },

  fetchAppointmentsAsSheet: async (role): Promise<AppointmentSheetRow[]> => {
    try {
      const { user } = useUserStore.getState();
      if (!user) {
        throw new Error('Usuário não autenticado para buscar agendamentos.');
      }

      let endpoint = `api/appointments/user/${user.id}`;
      if (role) {
        endpoint += `?role=${role}`;
      }
      const response = await backendHttpClient.get(endpoint);
      const appointments: Appointment[] = response.data;

      const sheetData: AppointmentSheetRow[] = appointments.map(
        (appointment) => ({
          ID: appointment.id,
          Professional: appointment.Professional.User.name,
          Client: appointment.Client.User.name,
          Service: appointment.Service.title,
          Date: new Date(appointment.start_time).toLocaleDateString(),
          Status: appointment.status,
        }),
      );

      return sheetData;
    } catch (error) {
      console.error('Failed to fetch appointments as sheet:', error);
      return [];
    }
  },

  reviewAppointment: async (appointmentId, rating, review) => {
    try {
      const response = await backendHttpClient.post(
        `api/appointments/${appointmentId}/review`,
        { rating, review },
      );
      return response.status === 200;
    } catch (error) {
      console.error('Failed to submit review:', error);
      return false;
    }
  },

  fetchInvoice: async (appointmentId: number): Promise<InvoiceData | null> => {
    try {
      const { user } = useUserStore.getState();
      if (!user) {
        throw new Error('Usuário não autenticado para buscar a nota.');
      }

      const endpoint = `api/appointments/${appointmentId}/receipt`;
      const response = await backendHttpClient.get(endpoint, {
        params: {
          userId: user.id,
        },
      });
      return response.data as InvoiceData;
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      return null;
    }
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await backendHttpClient.put(
        `api/appointments/${appointmentId}`,
        { status },
      );
      if (response.status === 200) {
        const store = useAppointmentStore.getState();
        await store.fetchAppointments(store.activeRole);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      return false;
    }
  },
  cancelAppointment: async (appointmentId) => {
    try {
      await backendHttpClient.post(`api/appointments/${appointmentId}/cancel`);
      const store = useAppointmentStore.getState();
      await store.fetchAppointments(store.activeRole);
      return true;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      return false;
    }
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await backendHttpClient.get(
        `api/appointments/${appointmentId}`,
      );
      return (response.data as Appointment) || null;
    } catch {
      return null;
    }
  },

  markInTransit: async (appointmentId) => {
    try {
      await backendHttpClient.post(
        `api/appointments/${appointmentId}/in-transit`,
      );
      return { success: true };
    } catch (error) {
      const errorMsg =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === 'string'
          ? (error as { response: { data: { error: string } } }).response.data
              .error
          : 'Erro ao atualizar status para em deslocamento.';
      return { success: false, error: errorMsg };
    }
  },

  markArrived: async (appointmentId, coords) => {
    try {
      const response = await backendHttpClient.post(
        `api/appointments/${appointmentId}/arrived`,
        coords || {},
      );
      const data = response.data as {
        success?: boolean;
        verification_code?: string;
      };
      return {
        success: Boolean(data?.success),
        verification_code: data?.verification_code,
      };
    } catch (error) {
      const errorMsg =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === 'string'
          ? (error as { response: { data: { error: string } } }).response.data
              .error
          : 'Erro ao confirmar chegada.';
      return { success: false, error: errorMsg };
    }
  },

  startService: async (appointmentId, code) => {
    try {
      const response = await backendHttpClient.post(
        `api/appointments/${appointmentId}/start-service`,
        { code },
      );
      const data = response.data as { success?: boolean };
      return { success: Boolean(data?.success) };
    } catch (error) {
      const errorMsg =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === 'string'
          ? (error as { response: { data: { error: string } } }).response.data
              .error
          : 'Código incorreto. Peça o código de confirmação ao cliente.';
      return { success: false, error: errorMsg };
    }
  },

  completeService: async (appointmentId, code) => {
    try {
      const response = await backendHttpClient.post(
        `api/appointments/${appointmentId}/complete-service`,
        { code },
      );
      const data = response.data as { success?: boolean };
      return { success: Boolean(data?.success) };
    } catch (error) {
      const errorMsg =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === 'string'
          ? (error as { response: { data: { error: string } } }).response.data
              .error
          : 'Código incorreto. Peça o código de confirmação ao cliente.';
      return { success: false, error: errorMsg };
    }
  },
}));
