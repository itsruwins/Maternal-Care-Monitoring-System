// The app's one icon set (Phosphor). Import icons from here, never from
// Phosphor directly, so the same icon always means the same thing.
// The "/ssr" build works in both Server and Client Components.
//
// Styles (Flo-like):
// - navigation: weight "regular" (thin rounded outline); the selected tab uses "fill"
// - feature icons: inside <IconCircle>, weight "fill" or "duotone"
// - actions: e.g. <PlusIcon weight="bold" /> inside a round button
export type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";

export {
  // Pregnancy & care
  BabyIcon as PregnancyIcon,
  HeartIcon,
  HeartbeatIcon,
  CalendarHeartIcon as AppointmentIcon,
  CalendarDotsIcon as CalendarIcon,
  CalendarXIcon as ClosedDayIcon,
  ClockIcon,
  WarningCircleIcon as DangerIcon,
  HandHeartIcon as CareIcon,
  FlowerLotusIcon as WellbeingIcon,

  // Activity types (the 5 services)
  StethoscopeIcon as CheckupIcon,
  SyringeIcon as VaccineIcon,
  PillIcon as SupplementIcon,
  TestTubeIcon as LabTestIcon,
  ChalkboardTeacherIcon as EducationIcon,

  // SMS & contact
  ChatCircleTextIcon as SmsIcon,
  BellRingingIcon as ReminderIcon,
  DeviceMobileIcon as PhoneIcon,
  PhoneCallIcon as CallIcon,
  PaperPlaneTiltIcon as SendIcon,
  DoorOpenIcon as HomeVisitIcon,
  MapPinIcon as LocationIcon,
  HospitalIcon as HealthCenterIcon,

  // Navigation
  HouseIcon as HomeIcon,
  ClipboardTextIcon as RecordsIcon,
  UserCircleIcon as ProfileIcon,
  UsersThreeIcon as MothersIcon,
  SquaresFourIcon as DashboardIcon,
  GearSixIcon as SettingsIcon,
  SignOutIcon as LogoutIcon,
  TranslateIcon as LanguageIcon,
  ListIcon as MenuIcon,
  ChartBarIcon as ReportsIcon,
  UserGearIcon as AccountsIcon,
  ListChecksIcon as ActivityTypesIcon,
  HourglassMediumIcon as ComingSoonIcon,

  // Account
  UserIcon,
  LockIcon,
  EnvelopeSimpleIcon as EmailIcon,
  IdentificationCardIcon as IdIcon,
  EyeIcon,
  EyeSlashIcon,

  // Actions & feedback
  PlusIcon,
  PencilSimpleIcon as PencilIcon,
  TrashIcon,
  MinusIcon,
  CheckIcon,
  CheckCircleIcon,
  XIcon as CloseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  CaretLeftIcon,
  CaretDownIcon,
  InfoIcon,
  SpinnerGapIcon as SpinnerIcon,
  SparkleIcon,
  LeafIcon,
  DropIcon,
  ToothIcon,
  CarrotIcon,
  ChatsCircleIcon,
  SunIcon,
  CloudSunIcon,
} from "@phosphor-icons/react/ssr";
