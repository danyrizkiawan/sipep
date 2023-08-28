"use client";

import { useCallback, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Spinner } from "../components/Loader";
import { SubActivity } from "../utils/model";
import EvaluationSelect from "../components/evaluation/EvaluationSelect";
import { fetchAuthenticatedAPI } from "../utils/fetch-api";
import RealizationSection from "../components/evaluation/RealizationSection";

export default function Evaluation() {
    const [subActivity, setSubActivity] = useState<SubActivity | undefined>();
    const [isLoading, setLoading] = useState(false);

    const fetchData = useCallback(async (sa: SubActivity | undefined, showLoading: boolean = true) => {
        if (sa == undefined) {
            setSubActivity(undefined)
            return
        }

        if (showLoading) setLoading(true)
        try {
            const path = `/sub-activities/${sa.id}`;
            const urlParamsObject = {
                populate: {
                    subActivityTarget: { populate: '*' },
                    dpaBudget: { populate: '*' },
                    cashBudget: { populate: '*' },
                    realization: { populate: '*' },
                    subActivityPic: { populate: '*' },
                },
            };
            const response = await fetchAuthenticatedAPI(path, urlParamsObject);

            if (response.data) {
                setSubActivity(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [])

    return (
        <div className="mb-20">
            <PageHeader heading="Evaluasi" text="Pengisian" />
            <div className="flex justify-center">
                <div className="container shadow-xl shadow-slate-100 px-4 py-2 sm:px-10 sm:py-10 w-full rounded-md ">
                    <EvaluationSelect onChange={fetchData} />
                    <div className="mt-14">
                    { isLoading ? (
                        <div className="text-center"><Spinner></Spinner></div>
                    ) : !subActivity ? '' : (
                        <RealizationSection subActivity={subActivity} onChange={fetchData} />
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}
