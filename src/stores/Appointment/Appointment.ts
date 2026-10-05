import { create } from 'zustand';
import {
  Appointment,
  CancelResult,
  CancellationOutcome,
  Dispute,
  AppointmentSheetRow,
  AppointmentStatus,
  AppointmentStore,
  InvoiceData,
} from './types';
import { useUserStore } from '@stores/User';
import { backendHttpClient } from '@lib/helpers/httpClient';

import { logger } from '@lib/logger';
export const useAppointmentStore = create<AppointmentStore>()((set) => ({
  appointments: [],
  appointmentsByStatus: {},
  loading: false,
  activeRole: undefined,

  fetchAppointments: async (role) => {
    // Atualiza em segundo plano: so limpa a lista quando o papel muda,
    // senao cada atualizacao (polling, socket) fazia a tela "piscar".
    const sameRole = useAppointmentStore.getState().activeRole === role;
    set(
      sameRole
        ? { loading: true }
        : {
            loading: true,
            appointments: [],
            appointmentsByStatus: {},
            activeRole: role,
          },
    );
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
      logger.error('Failed to fetch appointments:', error);
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
      logger.error('Failed to fetch appointments as sheet:', error);
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
      logger.error('Failed to submit review:', error);
      return false;
    }
  },

  fetchInvoice: async (
    appointmentId: string | number,
  ): Promise<InvoiceData | null> => {
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
      logger.error('Failed to fetch invoice:', error);
      return null;
    }
  },

  completeAppointment: async (appointmentId) => {
    try {
      await backendHttpClient.post(
        `api/appointments/${appointmentId}/complete`,
      );
      const store = useAppointmentStore.getState();
      await store.fetchAppointments(store.activeRole);
      return true;
    } catch (error) {
      logger.error('Failed to complete appointment:', error);
      return false;
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
      logger.error('Failed to update appointment status:', error);
      return false;
    }
  },

  // Os horarios e valores de cada acao sao decididos pelo servidor; as regras
  // espelhadas no app (src/lib/appointments.ts) servem so para a interface.
  previewCancellation: async (id) => {
    const { data } = await backendHttpClient.get<CancellationOutcome>(
      `/api/appointments/${id}/cancellation-preview`,
    );
    return data;
  },

  cancelAppointment: async (id, reason) => {
    const { data } = await backendHttpClient.post<CancelResult>(
      `/api/appointments/${id}/cancel`,
      { reason: reason?.trim() || undefined },
    );
    return data;
  },

  markNoShow: async (id) => {
    await backendHttpClient.post(`/api/appointments/${id}/no-show`);
  },

  getRescheduleSlots: async (id, date) => {
    const { data } = await backendHttpClient.get<{
      date: string;
      slots: string[];
    }>(`/api/appointments/${id}/reschedule-slots`, { params: { date } });
    return data.slots;
  },

  requestReschedule: async (id, startTime) => {
    await backendHttpClient.post(`/api/appointments/${id}/reschedule`, {
      start_time: startTime,
    });
  },

  respondToReschedule: async (id, accept) => {
    await backendHttpClient.post(`/api/appointments/${id}/reschedule/respond`, {
      accept,
    });
  },

  openDispute: async (id, input) => {
    const { data } = await backendHttpClient.post<Dispute>(
      `/api/appointments/${id}/dispute`,
      input,
    );
    return data;
  },

  getDispute: async (id) => {
    const { data } = await backendHttpClient.get<Dispute | null>(
      `/api/appointments/${id}/dispute`,
    );
    return data ?? null;
  },
}));
