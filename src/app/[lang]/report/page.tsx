"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { fetchAPI } from "../utils/fetch-api";
import DocumentList from "../views/document-list";
import { Spinner } from "../components/Loader";
import { Document } from "../utils/model";
import Empty from "../components/Empty";

export default function Report() {
    const [data, setData] = useState<Document[]>([]);
    const [isLoading, setLoading] = useState(true);
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

    const fetchData = useCallback(async (start: number, limit: number) => {
        setLoading(true);
        try {
            const path = `/reporting-documents`;
            const urlParamsObject = {
                populate: {
                    document: { fields: ["url"] },
                },
                pagination: {
                    start: start,
                    limit: limit
                },
            };
            const options = { headers: { Authorization: `Bearer ${token}` } };
            const responseData = await fetchAPI(path, urlParamsObject, options);

            if (start === 0) {
                setData(responseData.data);
            } else {
                setData((prevData: any[] ) => [...prevData, ...responseData.data]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(0, 25);
    }, [fetchData]);

    return (
        <div>
            <PageHeader heading="Pelaporan" text="Dokumen" />
            <DocumentList data={data}></DocumentList>
            <div className="text-center">
                {
                    isLoading ? (
                        <Spinner></Spinner>
                    ) : data.length != 0 ? '' : (
                        <Empty></Empty>
                    )
                }
            </div>
        </div>
    );
}
