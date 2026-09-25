export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: number;
  banner_uri: string | null;
  active: boolean;
  subcategory_id: number;
  professional_id: number;
  createdAt: string;
  updatedAt: string;
  Subcategory: Subcategory;
}

export interface Subcategory {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  avatar_uri: string | null;
  banner_uri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  user_id: number;
  main_address_id: number;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  User: User;
}

export interface Professional {
  id: number;
  user_id: number;
  main_address_id: number;
  cpf: string;
  cnpj: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  User: User;
}

/**
 * Representa os dados de endereço do local de atendimento do cliente.
 */
export interface Address {
  id: number;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  lat?: number;
  lng?: number;
}

/**
 * Entidade completa de Agendamento, contendo relacionamentos com Serviço, Cliente, Profissional,
 * Endereço e Forma de Pagamento.
 */
export interface Appointment {
  id: number;
  professional_id: number;
  client_id: number;
  service_id: number;
  address_id: number;
  rating: number | null;
  review: string | null;
  start_time: string;
  end_time: string;
  completed_at?: string | null;
  final_price?: number | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  Service: Service;
  Client: Client;
  payment_intent_id?: string | null;
  payment_method?: string;
  Professional: Professional;
  Address?: Address | null;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerCpf: string;
  customerAddress: string;
  professionalName: string;
  professionalCpf: string;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number;
  serviceDate: string;
  serviceTime: string;
  total: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface AppointmentSheetRow {
  ID: number;
  Professional: string;
  Client: string;
  Service: string;
  Date: string;
  Status: string;
}

export interface AppointmentStore {
  appointments: Appointment[];
  appointmentsByStatus: { [key in AppointmentStatus]?: Appointment[] };
  loading: boolean;
  activeRole?: 'client' | 'professional';

  fetchAppointments: (role?: 'client' | 'professional') => Promise<void>;

  fetchAppointmentsAsSheet: (
    role?: 'client' | 'professional',
  ) => Promise<AppointmentSheetRow[]>;

  reviewAppointment: (
    appointmentId: number,
    rating: number,
    review: string,
  ) => Promise<boolean>;

  updateAppointmentStatus: (
    appointmentId: number,
    status: AppointmentStatus,
  ) => Promise<boolean>;
  /** Profissional marca um atendimento confirmado como concluido. */
  completeAppointment: (appointmentId: number) => Promise<boolean>;

  fetchInvoice: (appointmentId: number) => Promise<InvoiceData | null>;
}
