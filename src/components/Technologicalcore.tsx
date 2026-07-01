import {
  Target,
  Wind,
  Aperture,
  Activity,
  Infinity,
  Volume2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Algorithmic Soul",
    description:
      "Unique behavioral seeds for every individual shape generated.",
  },
  {
    icon: Wind,
    title: "Dynamic Flow",
    description:
      "Fluid simulations that react to atmospheric data in real-time.",
  },
  {
    icon: Aperture,
    title: "Interactive Geometry",
    description: "Tactile responses to cursor and haptic movements.",
  },
  {
    icon: Activity,
    title: "Neural Motion",
    description: "Movement patterns derived from deep learning motion capture.",
  },
  {
    icon: Infinity,
    title: "Infinite Variance",
    description:
      "Billions of permutations ensuring no two experiences are identical.",
  },
  {
    icon: Volume2,
    title: "Spatial Sound",
    description: "Procedural audio that harmonizes with the visual output.",
  },
];

export default function TechnologicalCore() {
  return (
    <section className="w-full bg-[#121414] px-5 md:px-16 py-20 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center mb-14 md:mb-16">
          <h2
            className="text-[#e2e2e2] mb-4"
            style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: "clamp(28px, 3vw, 36px)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Technological Core
          </h2>
          <p
            className="text-[#87929c]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 400,
            }}
          >
            The underlying systems that transform raw data into digital life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)]">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#121414] p-8 hover:bg-[#1a1c1c] transition-colors"
            >
              <div className="w-11 h-11 rounded flex items-center justify-center border border-[rgba(0,180,255,0.2)] mb-6">
                <Icon size={18} strokeWidth={1.5} className="text-[#89ceff]" />
              </div>

              <h3
                className="text-[#e2e2e2] mb-2"
                style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: "18px",
                  fontWeight: 500,
                }}
              >
                {title}
              </h3>

              <p
                className="text-[#87929c]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
