export default function Card({ title, value, color }) {
  return (
    <div
      className={`${color} p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition`}
    >
      <p className="text-xs uppercase tracking-wider text-white/80 font-medium">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2 text-white">
        {value}
      </h2>
    </div>
  );
}