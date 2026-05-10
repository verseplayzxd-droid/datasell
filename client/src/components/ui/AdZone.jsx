export default function AdZone({ id, width = '100%', height = '90px', label = 'Ad Zone' }) {
  return (
    <div
      id={id}
      className="glass-card rounded-lg flex items-center justify-center border-dashed border-outline-variant relative overflow-hidden group"
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <span className="text-body-sm text-outline z-10 tracking-widest uppercase font-label-md">{label}</span>
    </div>
  );
}
