import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminHospitals from "./pages/AdminHospitals";
import AdminRFID from "./pages/AdminRFID";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorConsultations from "./pages/DoctorConsultations";
import DoctorPrescriptions from "./pages/DoctorPrescriptions";
import DoctorAddConsultation from "./pages/DoctorAddConsultation";
import AdminDoctors from "./pages/AdminDoctors";
import AdminPatientConsultations from "./pages/AdminPatientConsultations";
import DoctorPatientDetails from "./pages/DoctorPatientDetails";
import DoctorManageAppointments from "./pages/DoctorManageAppointments";
import DoctorManageConsultations from "./pages/DoctorManageConsultations";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rfid"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                <AdminRFID />
              </ProtectedRoute>
            }
          />
          {/* Doctor Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultations"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorConsultations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorPatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/manage-appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorManageAppointments />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />

          <Route
            path="/doctor/add-consultation"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAddConsultation />
              </ProtectedRoute>
            }
          />

          {/* New Admin API for viewing doctors only */}
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDoctors />
              </ProtectedRoute>
            }
          />

          {/* New Admin API for viewing a specific patient's consultations */}
          <Route
            path="/admin/patient-consultations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPatientConsultations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/manage-consultations"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorManageConsultations />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
