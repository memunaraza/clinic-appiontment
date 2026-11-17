import { attachDoctorProfiles } from "./doctorProfiles.js";

const appointmentPeople = [
  { path: "patient", select: "name email" },
  { path: "doctor", select: "name email" }
];

export const populateAppointment = async (appointmentQuery) => {
  const appointment = await appointmentQuery.populate(appointmentPeople);
  if (!appointment) return null;
  const [doctor] = await attachDoctorProfiles([appointment.doctor]);
  return { ...appointment.toObject(), doctor };
};

export const populateAppointments = async (appointmentsQuery) => {
  const appointments = await appointmentsQuery.populate(appointmentPeople);
  const doctors = await attachDoctorProfiles(appointments.map((appointment) => appointment.doctor));
  return appointments.map((appointment, index) => ({
    ...appointment.toObject(),
    doctor: doctors[index]
  }));
};
