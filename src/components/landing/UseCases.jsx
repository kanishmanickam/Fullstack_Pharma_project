import { FaHospital, FaClinicMedical, FaStore, FaCheckCircle } from 'react-icons/fa';

const cases = [
  {
    icon: FaStore,
    color: 'bg-emerald-500',
    who: 'Retail Pharmacies',
    tagline: 'Never run out of bestsellers',
    points: [
      'Track hundreds of SKUs with FEFO sorting',
      'Auto-generate low-stock alerts per medicine',
      'Bulk import stock updates via Excel',
      'Print bills and track daily revenue',
    ],
  },
  {
    icon: FaHospital,
    color: 'bg-blue-500',
    who: 'Hospital Pharmacies',
    tagline: 'Precision inventory for patient safety',
    points: [
      'Monitor near-expiry medicines daily',
      'Role-based access for pharmacists vs admins',
      'Prescription records linked to dispensing',
      'Demand forecasting by ward/department',
    ],
  },
  {
    icon: FaClinicMedical,
    color: 'bg-purple-500',
    who: 'Clinic Dispensaries',
    tagline: 'Lean inventory, zero waste',
    points: [
      'AI chatbot answers stock queries instantly',
      'Tamil language support for local staff',
      'Expiry reports to plan procurement',
      'Compact dashboard for small teams',
    ],
  },
];

const UseCases = () => (
  <section id="usecases" className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
          Use Cases
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Built for Every Pharmacy Setting
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Whether you run a single counter or a hospital chain, MediStock AI scales to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cases.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Top bar */}
            <div className={`${c.color} px-6 py-5 flex items-center gap-4`}>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <c.icon className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{c.who}</p>
                <p className="text-white/80 text-sm">{c.tagline}</p>
              </div>
            </div>
            {/* Points */}
            <div className="p-6">
              <ul className="space-y-3">
                {c.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default UseCases;
