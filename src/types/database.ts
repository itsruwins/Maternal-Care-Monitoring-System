// Database types, written from the confirmed schema (inspect-schema.sql, 2026-10-26)
// plus migrations 0001-0019. Update this file whenever a migration changes a table.

type NullableKeys<T> = { [K in keyof T]: null extends T[K] ? K : never }[keyof T];

// A foreign key, so Supabase can type nested selects like `purok:purok_id(name)`.
type Relation<Name extends string, Column extends string, Target extends string, TargetColumn extends string> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Target;
  referencedColumns: [TargetColumn];
};

type TableDef<Row, DefaultedKeys extends keyof Row = never, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Omit<Row, DefaultedKeys | NullableKeys<Row>> &
    Partial<Pick<Row, DefaultedKeys | NullableKeys<Row>>>;
  Update: Partial<Row>;
  Relationships: Relationships;
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
/** UPCOMING: visit reminder. REQUEST_*: staff answered her request (0017). */
export type ReminderType =
  | "UPCOMING"
  | "MISSED_NOTICE"
  | "REQUEST_CONFIRMED"
  | "REQUEST_NEW_TIME"
  | "REQUEST_DECLINED"
  | "VISIT_MOVED"
  | "VISIT_CANCELLED";
export type SmsDeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "SKIPPED";
export type FollowUpMethod = "CALL" | "SMS" | "HOME_VISIT";
export type FollowUpResult = "REACHED" | "NOT_REACHED";
export type FollowUpCloseReason = "MOVED_AWAY" | "CARE_ELSEWHERE" | "OTHER";
/** How a missed appointment's follow-up was sorted out (view follow_up_item). */
export type FollowUpEnding = "CAME_IN" | "REBOOKED" | "CLOSED" | "PREGNANCY_CLOSED";

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
  /** Legacy typed purok (before migration 0008); empty for new records. */
  purok_sitio: string | null;
  purok_id: number | null;
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
  /** Required while ACTIVE; may be unknown for past pregnancies (0008). */
  expected_delivery_date: string | null;
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
  /** Icon key for the service tiles (migration 0010). */
  icon: string;
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
  /** HTTPSMS's own error text. */
  error_message: string | null;
  /** Tries so far (taking a text for sending counts as one). */
  attempt_count: number;
  /** When an automatic retry is due (the text is PENDING meanwhile). */
  next_attempt_at: string | null;
  /** Taken by a sender run; cleared when the run saves a result. */
  claimed_at: string | null;
  /** The number it actually went to. */
  sent_to: string | null;
  delivered_at: string | null;
  /** When HTTPSMS was last asked about it. */
  status_checked_at: string | null;
  /** Why it was skipped or failed, as a short code (e.g. visit_passed, too_long). */
  status_reason: string | null;
};

export type SmsSettingRow = {
  setting_id: number;
  phone_online: boolean | null;
  phone_status_at: string | null;
  limit_reached_at: string | null;
};

export type FollowUpRow = {
  follow_up_id: number;
  appointment_id: number;
  /** Set by the database to the logged-in staff member (0015). */
  health_worker_id: number;
  follow_up_date: string;
  method: FollowUpMethod;
  outcome_notes: string;
  /** Required for new entries (0015). */
  result: FollowUpResult | null;
  /** Set when the entry says "No more follow-up needed" (0015). */
  close_reason: FollowUpCloseReason | null;
  created_at: string;
};

/** One text on the SMS log, with her name and the appointment (view sms_log_item, 0019). */
export type SmsLogItemRow = {
  reminder_id: number;
  appointment_id: number;
  reminder_type: ReminderType;
  recipient_number: string;
  sent_to: string | null;
  message_text: string;
  delivery_status: SmsDeliveryStatus;
  status_reason: string | null;
  attempt_count: number;
  scheduled_at: string;
  next_attempt_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  /** When it went out, else when it is next due, else when it was first due. */
  shown_at: string;
  appointment_status: AppointmentStatus;
  /** The visit's time, or the time she asked for while it is a request. */
  visit_at: string;
  service: string;
  mother_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
};

/** One Missed appointment on the follow-up list (view follow_up_item, 0015). */
export type FollowUpItemRow = {
  appointment_id: number;
  pregnancy_id: number;
  mother_id: number;
  activity_type_id: number;
  service: string;
  missed_at: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  contact_number: string;
  purok_id: number | null;
  /** Null when she has no purok, or for a hidden one (health workers see shown puroks only). */
  purok_name: string | null;
  attempts: number;
  last_follow_up_date: string | null;
  last_method: FollowUpMethod | null;
  last_result: FollowUpResult | null;
  ended_how: FollowUpEnding | null;
  ended_at: string | null;
  close_reason: FollowUpCloseReason | null;
  /** The new appointment's time, when it ended as REBOOKED. */
  rebooked_at: string | null;
  is_open: boolean;
};

export type PurokRow = {
  purok_id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type ClosedDayRow = {
  closed_date: string;
  reason: string;
  created_at: string;
};

export type LoginAttemptRow = {
  login_attempt_id: number;
  username: string;
  attempted_at: string;
};

/** One service given at a visit, as record_visit / update_visit take it. */
export type VisitServiceInput = { activity_type_id: number; dose_or_details: string; result_notes: string | null };

export type Database = {
  public: {
    Tables: {
      user_account: TableDef<UserAccountRow, "created_at">;
      health_worker: TableDef<HealthWorkerRow, "health_worker_id">;
      mother: TableDef<
        MotherRow,
        "mother_id",
        [
          Relation<"mother_purok_id_fkey", "purok_id", "purok", "purok_id">,
          Relation<"mother_registered_by_fkey", "registered_by", "health_worker", "health_worker_id">,
        ]
      >;
      pregnancy: TableDef<PregnancyRow, "pregnancy_id", [Relation<"pregnancy_mother_id_fkey", "mother_id", "mother", "mother_id">]>;
      activity_type: TableDef<ActivityTypeRow, "activity_type_id" | "icon">;
      appointment: TableDef<
        AppointmentRow,
        "appointment_id" | "created_at" | "updated_at",
        [
          Relation<"appointment_pregnancy_id_fkey", "pregnancy_id", "pregnancy", "pregnancy_id">,
          Relation<"appointment_activity_type_id_fkey", "activity_type_id", "activity_type", "activity_type_id">,
          Relation<"appointment_reviewed_by_fkey", "reviewed_by", "health_worker", "health_worker_id">,
        ]
      >;
      prenatal_visit: TableDef<
        PrenatalVisitRow,
        "visit_id",
        [
          Relation<"prenatal_visit_pregnancy_id_fkey", "pregnancy_id", "pregnancy", "pregnancy_id">,
          Relation<"prenatal_visit_health_worker_id_fkey", "health_worker_id", "health_worker", "health_worker_id">,
        ]
      >;
      visit_service: TableDef<
        VisitServiceRow,
        "service_id",
        [
          Relation<"visit_service_visit_id_fkey", "visit_id", "prenatal_visit", "visit_id">,
          Relation<"visit_service_activity_type_id_fkey", "activity_type_id", "activity_type", "activity_type_id">,
        ]
      >;
      sms_reminder: TableDef<SmsReminderRow, "reminder_id" | "attempt_count", [Relation<"sms_reminder_appointment_id_fkey", "appointment_id", "appointment", "appointment_id">]>;
      follow_up: TableDef<
        FollowUpRow,
        "follow_up_id" | "health_worker_id" | "created_at",
        [
          Relation<"follow_up_appointment_id_fkey", "appointment_id", "appointment", "appointment_id">,
          Relation<"follow_up_health_worker_id_fkey", "health_worker_id", "health_worker", "health_worker_id">,
        ]
      >;
      login_attempt: TableDef<LoginAttemptRow, "login_attempt_id" | "attempted_at">;
      purok: TableDef<PurokRow, "purok_id" | "sort_order" | "is_active" | "created_at">;
      closed_day: TableDef<ClosedDayRow, "created_at">;
      sms_setting: TableDef<SmsSettingRow, "setting_id">;
    };
    Views: {
      follow_up_item: { Row: FollowUpItemRow; Relationships: [] };
      sms_log_item: { Row: SmsLogItemRow; Relationships: [] };
    };
    Functions: {
      current_user_role: { Args: never; Returns: string | null };
      current_mother_id: { Args: never; Returns: number | null };
      current_health_worker_id: { Args: never; Returns: number | null };
      is_username_available: { Args: { p_username: string }; Returns: boolean };
      cancel_my_appointment: { Args: { p_appointment_id: number }; Returns: undefined };
      respond_to_new_time: { Args: { p_appointment_id: number; p_accept: boolean }; Returns: undefined };
      taken_slots: { Args: { p_from: string; p_to: string }; Returns: string[] };
      slot_problem: { Args: { p_slot: string }; Returns: string | null };
      visit_editable: { Args: { p_visit_id: number }; Returns: boolean };
      record_visit: {
        Args: {
          p_pregnancy_id: number;
          p_appointment_id: number | null;
          p_bp_systolic: number;
          p_bp_diastolic: number;
          p_weight_kg: number;
          p_temperature_c: number;
          p_pulse_rate: number;
          p_fundal_height_cm: number | null;
          p_fetal_heart_rate: number | null;
          p_notes: string;
          p_services: VisitServiceInput[];
        };
        Returns: number;
      };
      update_visit: {
        Args: {
          p_visit_id: number;
          p_bp_systolic: number;
          p_bp_diastolic: number;
          p_weight_kg: number;
          p_temperature_c: number;
          p_pulse_rate: number;
          p_fundal_height_cm: number | null;
          p_fetal_heart_rate: number | null;
          p_notes: string;
          p_services: VisitServiceInput[];
        };
        Returns: undefined;
      };
      my_open_missed_visits: { Args: never; Returns: { appointment_id: number; missed_at: string; service: string }[] };
      /** Server sender only (service_role): takes up to 20 due texts. */
      claim_due_sms: { Args: never; Returns: SmsReminderRow[] };
      retry_sms: { Args: { p_reminder_id: number }; Returns: undefined };
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
      follow_up_result: FollowUpResult;
      follow_up_close_reason: FollowUpCloseReason;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
