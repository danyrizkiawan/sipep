"use client";

import { useCallback, useEffect, useState } from "react";
import { Month } from "../../utils/model";
import { fetchAuthenticatedAPI } from "../../utils/fetch-api";
import { Spinner } from "../Loader";
import { useUser } from "../../utils/auth-context";

export default function MonthSelect({
    onChange,
}: {
    onChange: (month: Month | undefined) => void;
}) {
    const [months, setMonths] = useState<Month[]>([]);
    const [month, setMonth] = useState<Month>();
    const [isLoading, setLoading] = useState(false);
    const { logout } = useUser();
    
    const fetchMonths = useCallback(async () => {
        setLoading(true);
        try {
            const path = `/months`;
            const urlParamsObject = {
            };
            const responseData = await fetchAuthenticatedAPI(path, urlParamsObject);
            if (!responseData.data) throw new Error(responseData.error.name);

            setMonths(responseData.data);
            setMonth(responseData.data[0])
            onChange(responseData.data[0])
        } catch (e) {
            let error = (e as Error).message;
            if (error == 'UnauthorizedError') {
                logout()
            }
        } finally {
            setLoading(false);
        }
    }, []);

    function onMonthSelected(e: any) {
        e.preventDefault()
        const selected = months.find((m) => m.id == e.target.value)
        setMonth(selected)
        onChange(selected)
    }

    useEffect(() => {
        fetchMonths();
    }, [fetchMonths]);
    
    return (
        isLoading ? (
            <div className="text-center">
                <Spinner></Spinner>
            </div>
        ) : (
            <div className="w-full flex flex-col gap-4">
                <div className="form-group">
                    <h2 className="text-xl font-semibold">Pilih Bulan</h2>
                    <select name="months" id="months" className="pl-4 pr-10 py-3 mt-2 rounded-md w-full" value={month?.id ?? 0} onChange={onMonthSelected}>
                        <option key={0} className="" value={0} disabled>-- Silakan pilih bulan -- </option>
                        {
                            months.length == 0 ? '' : months.map((m) => <option key={"m"+m.id} className="" value={m.id}>{m.attributes.name}</option>)
                        }
                    </select>
                </div>
            </div>
        )
    )
}