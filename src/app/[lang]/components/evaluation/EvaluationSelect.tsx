"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, SubActivity } from "../../utils/model";
import { fetchAuthenticatedAPI } from "../../utils/fetch-api";
import { getLocalUnit } from "../../utils/session";
import { Spinner } from "../Loader";
import Link from "next/link";
import { useUser } from "../../utils/auth-context";

export default function EvaluationSelect({
    onChange
  }: {
    onChange: Function
  }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activity, setActivity] = useState<Activity | undefined>();
    const [subActivity, setSubActivity] = useState<SubActivity | undefined>();
    const [isLoading, setLoading] = useState(false);
    const { logout } = useUser();
    
    const fetchActivities = useCallback(async () => {
        setLoading(true);
        const unit = getLocalUnit();
        try {
            const path = `/activities`;
            const urlParamsObject = {
                populate: {
                    sub_activities: '*'
                },
                filters: {
                    unit: { id: { $eq: unit } }
                },
            };
            const responseData = await fetchAuthenticatedAPI(path, urlParamsObject);
            
            if (!responseData.data) throw new Error(responseData.error.name);
            
            setActivities(responseData.data);
            if (activities.length > 0) {
                setActivity(activities[0])
            }
        } catch (e) {
            let error = (e as Error).message;
            if (error == 'UnauthorizedError') {
                logout()
            }
        } finally {
            setLoading(false);
        }
    }, []);

    function onActivitySelected(e: any) {
        e.preventDefault()
        const selected = activities.find((a) => a.id == e.target.value)
        setActivity(selected)
        setSubActivity(undefined)
        onChange(undefined)
    }

    function onSubActivitySelected(e: any) {
        e.preventDefault()
        const selected = activity?.attributes.sub_activities.data.find((a) => a.id == e.target.value)
        setSubActivity(selected)
        onChange(selected)
    }

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);
    
    return (
        isLoading ? (
            <div className="text-center">
                <Spinner></Spinner>
            </div>
        ) : (
            <div className="w-full flex flex-col gap-4">
                <div className="w-full flex justify-end">
                    <Link
                        key="evaluationReport"
                        href="/evaluation/report"
                        target="_self"
                        className="px-6 py-2 bg-green-500 rounded-md text-white"
                    >
                        Cetak Evaluasi
                    </Link>
                </div>
                <div className="form-group">
                    <h2 className="text-xl font-semibold">Kegiatan</h2>
                    <select name="activities" id="activities" className="pl-4 pr-10 py-3 mt-2 rounded-md w-full" value={activity?.id ?? 0} onChange={onActivitySelected}>
                        <option key={0} className="" value={0} disabled>-- Silakan pilih kegiatan -- </option>
                        {
                            activities.length == 0 ? '' : activities.map((a) => <option key={"a"+a.id} className="" value={a.id}>{a.attributes.name}</option>)
                        }
                    </select>
                </div>
                <div className="form-group">
                    <h2 className="text-xl font-semibold">Sub Kegiatan</h2>
                    <select name="subActivities" id="subActivities" className="pl-4 pr-10 py-3 mt-2 rounded-md w-full" value={subActivity?.id ?? 0} onChange={onSubActivitySelected}>
                        <option key={0} className="" value={0} disabled>-- Silakan pilih sub kegiatan -- </option>
                        {
                            !activity ? '' :
                            activity.attributes.sub_activities.data.map((sa) => <option key={"sa"+sa.id} className="" value={sa.id}>{sa.attributes.name}</option>)
                        }
                    </select>
                </div>
            </div>
        )
    )
  }