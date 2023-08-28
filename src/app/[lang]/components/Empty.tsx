export default function Empty({
  title = 'Data tidak ditemukan',
  description = 'Silakan hubungi admin untuk melihat data ini.'
} : {
  title?: string,
  description?: string,
}) {
  return (
    <div className="container mx-auto p-8 mt-10">
      <h2 className="text-lg font-bold text-gray-700">{title}</h2>
      <p className="text-md text-gray-400 mt-2">{description}</p>
    </div>
  );
}
