import { useCallback, useMemo, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/doctors/DoctorCard.jsx";
import DoctorDetailsModal from "../../components/doctors/DoctorDetailsModal.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import FormInput from "../../components/common/FormInput.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PageHeading from "../../components/common/PageHeading.jsx";
import RequestError from "../../components/common/RequestError.jsx";
import api from "../../services/api.js";
import useResource from "../../hooks/useResource.js";

const DoctorsPage = () => {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const loadDoctors = useCallback(async () => {
    const { data } = await api.get("/doctors");
    return data.doctors;
  }, []);
  const { data: doctors, loading, error, reload } = useResource(loadDoctors);

  const specializations = useMemo(
    () => [...new Set((doctors || []).map((doctor) => doctor.specialization).filter(Boolean))].sort(),
    [doctors]
  );
  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (doctors || []).filter((doctor) => {
      const matchesSearch = !query || `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(query);
      const matchesSpecialty = specialization === "all" || doctor.specialization === specialization;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialization]);

  const bookWithDoctor = (doctor) => navigate(`/patient/book?doctorId=${doctor._id}`);

  return (
    <div className="soft-enter">
      <PageHeading eyebrow="Find the right care" title="Meet your care team" description="Explore our active providers and find a specialist who fits your needs." />
      <section className="mb-6 grid gap-3 rounded-panel border border-line bg-white p-4 shadow-card sm:grid-cols-[1fr_260px] sm:p-5">
        <FormInput
          id="doctor-search"
          aria-label="Search doctor name or specialization"
          placeholder="Search by doctor or specialty"
          icon={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="field-control" value={specialization} onChange={(event) => setSpecialization(event.target.value)} aria-label="Filter by specialization">
          <option value="all">All specializations</option>
          {specializations.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </section>
      {loading ? <LoadingSpinner label="Finding available doctors" /> : error ? <RequestError message={error} onRetry={reload} /> : filteredDoctors.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} onView={setSelectedDoctor} onBook={bookWithDoctor} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Stethoscope} title="No matching doctors" description="Try another name or specialty, or clear your filters." action={search || specialization !== "all" ? (
          <button type="button" className="secondary-button py-2.5" onClick={() => { setSearch(""); setSpecialization("all"); }}>Clear filters</button>
        ) : null} />
      )}
      {selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onBook={(doctor) => bookWithDoctor(doctor)}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
