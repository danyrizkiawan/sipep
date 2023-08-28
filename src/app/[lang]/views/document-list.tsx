import { getStrapiMedia } from "../utils/api-helpers";
import DocumentCard from "../components/DocumentCard";
import { Document } from "../utils/model";

export default function DocumentList({
  data: documents,
}: {
  data: Document[];
}) {
    return (
        <section className="container p-6 mx-auto space-y-6 sm:space-y-12">
            <div className="grid justify-center grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((document) => {
                    const documentUrl = getStrapiMedia(
                        document.attributes.document.data?.attributes.url
                    );
                    const props = {
                        name: document.attributes.name,
                        description: document.attributes.description,
                        year: document.attributes.year,
                        publishedAt: document.attributes.publishedAt,
                        url: documentUrl,
                    }

                    return (
                        <DocumentCard key={document.id} data={props}></DocumentCard>
                    );
                })}
            </div>
        </section>
    );
}
