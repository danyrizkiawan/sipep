interface DocumentCardProps {
    data: {
        name: string;
        description?: string;
        year: number;
        publishedAt: string;
        url?: string | null;
    } | null;
  }

export default function DocumentCard({ data }: DocumentCardProps) {
    if (!data) return null;
    const { name, description, url } = data;
    return (
      <div className="flex w-full bg-slate-200 p-4 rounded-lg justify-between">
        <div className="flex flex-col justify-center">
          <h5 className="text-md leading-6 text-gray-900">
            <strong className="font-semibold">{name}</strong>
          </h5>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="flex flex-col justify-center">
          {
            url ? (
              <a href={url} target="_blank" className="rounded-full bg-violet-400 px-3 py-1 text-gray-100 leading-6 h-fit">
                Download
              </a>
            ) : ''
          }
        </div>
      </div>
    );
  }