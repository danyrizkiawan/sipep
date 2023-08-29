"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Month, Program } from "../../utils/model";
import { fetchAuthenticatedAPI } from "../../utils/fetch-api";
import RakTable from "../../views/rak-table";
import { getLocalUnit } from "../../utils/session";
import EvaluationReportHeader from "../../components/evaluation/report/EvaluationReportHeader";
import RakTitle from "../../components/evaluation/report/RakTitle";
import { useUser } from "../../utils/auth-context";
import ReportSignature from "../../components/evaluation/report/ReportSignature";
import { Spinner } from "../../components/Loader";

export default function EvaluationReport() {
    const [month, setMonth] = useState<Month>();
    const [date, setDate] = useState<Date>(new Date());
    const [isUnit, setIsUnit] = useState<boolean>(true);
    const [programs, setPrograms] = useState<Program[]>([]);
    const { user } = useUser()
    const [isLoading, setLoading] = useState(false);

    async function fetchData() {
        setLoading(true)
        try {
            const unit = getLocalUnit();
            const path = `/programs`;
            const filters = isUnit ? { unit: { id: { $eq: unit } } } : { sub_activities: { subActivityPic: { id: { $eq: user?.id } } } }
            const urlParamsObject = {
                populate: {
                    programTarget: {
                        populate: '*'
                    },
                    activities: {
                        populate: {
                            unit: {
                                populate: {
                                    headOfUnit: { populate: '*' }
                                }
                            },
                            program: {
                                populate: '*'
                            },
                            objectiveIndicator: {
                                populate: '*'
                            },
                            activityTarget: {
                                populate: '*'
                            },
                            sub_activities: {
                                populate: {
                                    subActivityTarget: { populate: '*' },
                                    dpaBudget: { populate: '*' },
                                    cashBudget: { populate: '*' },
                                    realization: { populate: '*' },
                                    subActivityPic: { populate: '*' },
                                }
                            }
                        }
                    }
                },
                filters: {
                    activities: filters
                },
            };
            const response = await fetchAuthenticatedAPI(path, urlParamsObject);

            if (response.data) {
                setPrograms(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, [isUnit])

    return (
        <div className="mb-20">
            <PageHeader heading="Evaluasi" text="Laporan" />
            <div className="flex justify-center">
                <div className="px-2 py-2 sm:py-10 w-full overflow-auto">
                    <EvaluationReportHeader
                        user={user}
                        onMonthChange={setMonth}
                        onIsUnitChange={setIsUnit}
                        onDateChange={setDate}
                    />
                    {
                        isLoading ? (
                            <div className="text-center">
                                <Spinner></Spinner>
                            </div>
                        ) : (
                            <>
                                <RakTitle user={user} month={month} isUnit={isUnit}/>
                                <RakTable month={month} data={programs} userId={isUnit ? undefined : user?.id} />
                                <ReportSignature
                                    user={user}
                                    date={date}
                                    isUnit={isUnit}
                                />
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
