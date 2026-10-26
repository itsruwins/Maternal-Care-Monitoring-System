// Database types, written from the confirmed schema (inspect-schema.sql, 2026-10-26)
// plus migrations 0001-0006. Update this file whenever a migration changes a table.

type NullableKeys<T> = { [K in keyof T]: null extends T[K] ? K : never }[keyof T];

type TableDef<Row, DefaultedKeys extends keyof Row = never> = {
  Row: Row;
  Insert: Omit<Row, DefaultedKeys | NullableKeys<Row>> &
    Partial<Pick<Row, DefaultedKeys | NullableKeys<Row>>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type UserRole = "ADMIN" | "HEALTH_WORKER" | "MOTHER";
export type AccountStatus = "ACTIVE" | "INACTIVE";
export type PregnancyStatus = "ACTIVE" | "DELIVERED" | "ENDED";
export type PregnancyOutcome = "LIVE_BIRTH" | "STILLBIRTH" | "MISCARRIAGE" | "OTHER";
export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED";
export type ReminderType = "UPCOMING" | "MISSED_NOTICE";
export type SmsDeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";
export type FollowUpMethod = "CALL" | "SMS" | "HOME_VISIT";

export type UserAccountRow = {
  user_id: string;
  username: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
  last_login_at: string | null;
};

export type HealthWorkerRow = {
  health_worker_id: number;
  user_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  position: string;
  contact_number: string;
};

export type MotherRow = {
  mother_id: number;
  user_id: string | null;
  registered_by: number | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  purok_sitio: string;
  street_address: string;
  contact_number: string;
  emergency_contact_name: string;
  emergency_contact_no: string;
  registration_date: string;
};

export type PregnancyRow = {
  pregnancy_id: number;
  mother_id: number;
  gravida: number;
  para: number;
  lmp_date: string | null;
  expected_delivery_date: string;
  pregnancy_status: PregnancyStatus;
  outcome: PregnancyOutcome | null;
  outcome_date: string | null;
  registration_date: string;
  remarks: string | null;
};

export type ActivityTypeRow = {
  activity_type_id: number;
  name: string;
  description: string | null;
  reminder_days_before: number;
};

export type AppointmentRow = {
  appointment_id: number;
  pregnancy_id: number;
  activity_type_id: number;
  requested_by_user_id: string;
  reviewed_by: number | null;
  requested_datetime: string;
  scheduled_datetime: string | null;
  status: AppointmentStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type PrenatalVisitRow = {
  visit_id: number;
  pregnancy_id: number;
  health_worker_id: number;
  appointment_id: number | null;
  visit_datetime: string;
  aog_weeks: number;
  bp_systolic: number;
  bp_diastolic: number;
  weight_kg: number;
  temperature_c: number;
  pulse_rate: number;
  fundal_height_cm: number | null;
  fetal_heart_rate: number | null;
  notes: string | null;
};

export type VisitServiceRow = {
  service_id: number;
  visit_id: number;
  activity_type_id: number;
  dose_or_details: string;
  result_notes: string | null;
};

export type SmsReminderRow = {
  reminder_id: number;
  appointment_id: number;
  reminder_type: ReminderType;
  recipient_number: string;
  message_text: string;
  scheduled_at: string;
  sent_at: string | null;
  delivery_status: SmsDeliveryStatus;
  provider_message_id: string | null;
  error_message: string | null;
};

export type FollowUpRow = {
  follow_up_id: number;
  appointment_id: number;
  health_worker_id: number;
  follow_up_date: string;
  method: FollowUpMethod;
  outcome_notes: string;
};

export type LoginAttemptRow = {
  login_attempt_id: number;
  username: string;
  attempted_at: string;
};

export type Database = {
  public: {
    Tables: {
      user_account: TableDef<UserAccountRow, "created_at">;
      health_worker: TableDef<HealthWorkerRow, "health_worker_id">;
      mother: TableDef<MotherRow, "mother_id">;
      pregnancy: TableDef<PregnancyRow, "pregnancy_id">;
      activity_type: TableDef<ActivityTypeRow, "activity_type_id">;
      appointment: TableDef<AppointmentRow, "appointment_id" | "created_at" | "updated_at">;
      prenatal_visit: TableDef<PrenatalVisitRow, "visit_id">;
      visit_service: TableDef<VisitServiceRow, "service_id">;
      sms_reminder: TableDef<SmsReminderRow, "reminder_id">;
      follow_up: TableDef<FollowUpRow, "follow_up_id">;
      login_attempt: TableDef<LoginAttemptRow, "login_attempt_id" | "attempted_at">;
    };
    Views: { [_ in never]: never };
    Functions: {
      current_user_role: { Args: never; Returns: string | null };
      current_mother_id: { Args: never; Returns: number | null };
      current_health_worker_id: { Args: never; Returns: number | null };
      is_username_available: { Args: { p_username: string }; Returns: boolean };
      cancel_my_appointment: { Args: { p_appointment_id: number }; Returns: undefined };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      pregnancy_status: PregnancyStatus;
      pregnancy_outcome: PregnancyOutcome;
      appointment_status: AppointmentStatus;
      reminder_type: ReminderType;
      sms_delivery_status: SmsDeliveryStatus;
      follow_up_method: FollowUpMethod;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
