import {
  CalendarDays,
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  CalendarRange,
  MessageSquareText,
  Stethoscope,
  UserRound,
  Users,
  UserRoundCog
} from "lucide-react";

export const navigationByRole = {
  patient: [
    { label: "Dashboard", to: "/patient/dashboard", icon: LayoutDashboard },
    { label: "Find doctors", to: "/patient/doctors", icon: Stethoscope },
    { label: "Book appointment", to: "/patient/book", icon: CalendarDays },
    { label: "My appointments", to: "/patient/appointments", icon: ClipboardCheck },
    { label: "My profile", to: "/patient/profile", icon: UserRound }
  ],
  doctor: [
    { label: "Dashboard", to: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Appointment requests", to: "/doctor/requests", icon: ClipboardCheck },
    { label: "All appointments", to: "/doctor/appointments", icon: CalendarDays },
    { label: "My patients", to: "/doctor/patients", icon: Users },
    { label: "Availability", to: "/doctor/availability", icon: CalendarRange },
    { label: "Reviews", to: "/doctor/reviews", icon: MessageSquareText },
    { label: "Notifications", to: "/doctor/notifications", icon: Bell },
    { label: "My profile", to: "/doctor/profile", icon: UserRound }
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage doctors", to: "/admin/doctors", icon: Stethoscope },
    { label: "Manage patients", to: "/admin/patients", icon: Users },
    { label: "Manage users", to: "/admin/users", icon: UserRoundCog },
    { label: "All appointments", to: "/admin/appointments", icon: CalendarDays }
  ]
};

export const logoutNavigationItem = { label: "Log out", icon: LogOut };
