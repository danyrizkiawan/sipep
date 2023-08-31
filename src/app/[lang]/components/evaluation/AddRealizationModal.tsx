"use client";

import { useState } from "react";
import CustomModal from "../CustomModal";
import { Budget, Measurement, Month, Realization } from "../../utils/model";
import { formatCurrency, formatWithMeasurement } from "../../utils/realization-helpers";
import { sendPUTRequest } from "../../utils/fetch-api";

interface AddRealizationModalParams {
    subActivityId: number;
    cashBudgets: Budget[];
    measurement: Measurement;
    realizations: Realization[];
    onSuccess: () => Promise<void>;
}

const months: Month[] = [
    { id: 1, attributes: { name: "Januari", shortName: 'Jan' } },
    { id: 2, attributes: { name: "Februari", shortName: 'Feb' } },
    { id: 3, attributes: { name: "Maret", shortName: 'Mar' } },
    { id: 4, attributes: { name: "April", shortName: 'Apr' } },
    { id: 5, attributes: { name: "Mei", shortName: 'Mei' } },
    { id: 6, attributes: { name: "Juni", shortName: 'Jun' } },
    { id: 7, attributes: { name: "Juli", shortName: 'Jul' } },
    { id: 8, attributes: { name: "Agustus", shortName: 'Ags' } },
    { id: 9, attributes: { name: "September", shortName: 'Sep' } },
    { id: 10, attributes: { name: "Oktober", shortName: 'Okt' } },
    { id: 11, attributes: { name: "November", shortName: 'Nov' } },
    { id: 12, attributes: { name: "Desember", shortName: 'Des' } },
]

export default function AddRealizationModal({
    subActivityId,
    cashBudgets,
    measurement,
    realizations,
    onSuccess
} : AddRealizationModalParams) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    function openModal() { setIsOpen(true); }
    function closeModal() { setIsOpen(false); }

    const [month, setMonth] = useState<Month>();
    const [previousMonth, setPreviousMonth] = useState<Month>();
    const usedMonths = realizations.map((r) => r.month.data.id);
    const availableMonths = months.filter((m) => !usedMonths.includes(m.id))
    
    const [errorMessage, setErrorMessage] = useState<string>()
    const [cash, setCash] = useState<number>(0)
    const [budget, setBudget] = useState<string>("")
    const [physical, setPhysical] = useState<string>("")
    const [budgetProblem, setBudgetProblem] = useState<string>("")
    const [budgetSolution, setBudgetSolution] = useState<string>("")
    const [physicalProblem, setPhysicalProblem] = useState<string>("")
    const [physicalTarget, setPhysicalTarget] = useState<string>("")
    const [physicalAchievement, setPhysicalAchievement] = useState<string>("")
    const [physicalSolution, setPhysicalSolution] = useState<string>("")
    const [previousRealization, setPreviousRealization] = useState<Realization>();

    function resetForm() {
        setMonth(undefined)
        setPreviousMonth(undefined)
        setErrorMessage(undefined)
        setBudget("")
        setBudgetProblem("")
        setBudgetSolution("")
        setPhysical("")
        setPhysicalTarget("")
        setPhysicalAchievement("")
        setPhysicalProblem("")
        setPhysicalSolution("")
        setPreviousRealization(undefined)
    }

    function onMonthChanged(e: any) {
        e.preventDefault()
        const selected = months.find((m) => m.id == e.target.value);
        setMonth(selected)
        getPreviousMonth(e.target.value)
        const cashBudget = cashBudgets.find(b=> b.month.data.id == e.target.value)
        setCash(cashBudget?.budget ?? 0)
    }

    async function saveRealization() {
        setErrorMessage(undefined)
        try {
            const monthId = month?.id
            if (!monthId) {
                setErrorMessage("Harap pilih bulan!")
                return
            } else if (!budget || !budgetProblem || !budgetSolution) {
                setErrorMessage("Harap lengkapi realisasi anggaran!")
                return
            } else if (!physical || !physicalTarget || !physicalAchievement || !physicalProblem || !physicalSolution) {
                setErrorMessage("Harap lengkapi realisasi fisik!")
                return
            }

            const formattedBudget = Number(budget)
            if (isNaN(formattedBudget)) {
                setErrorMessage("Realisasi anggaran harus berupa angka!")
                return
            }

            const newRealization = {
                month: { set: [ monthId ] },
                budget: formattedBudget,
                physical,
                physicalTarget,
                physicalAchievement,
                budgetProblem: {
                    problem: budgetProblem,
                    solution: budgetSolution,
                },
                physicalProblem: {
                    problem: physicalProblem,
                    solution: physicalSolution,
                }
            }

            const body = { data: { realization: [ ...realizations, newRealization ] } }
            const path = `/sub-activities/${subActivityId}`;
            const response = await sendPUTRequest(path, body);

            if (!response.data) {
                setErrorMessage(response.error.message)
                return
            }

            resetForm()
            await onSuccess()
            closeModal()
        } catch (e) {
            let error = (e as Error).message;
            setErrorMessage(error)
            console.error(error);
        }
    }

    function getPreviousMonth(current: number) {
        const prevMonth = months.find((m)=> m.id == (current - 1));
        
        setPreviousMonth(prevMonth);
        if (prevMonth == undefined) return setPreviousRealization(undefined);

        const prevReal = realizations.find((r) => r.month.data.id === prevMonth.id);
        setPreviousRealization(prevReal);
    }
    
    return (
        <>
            <button className="px-6 py-2 bg-violet-400 rounded-md text-white" onClick={openModal}>Tambah</button>
            <CustomModal
                isOpen={isOpen}
                closeModal={closeModal}
                title="Tambah Realisasi"
                primaryButton={{ onClick: saveRealization }}
            >
                <form onSubmit={saveRealization} id="addRealization">
                    <div className="flex flex-col lg:flex-row-reverse">
                        <div className="w-full lg:w-1/2 my-auto flex justify-end">
                            {
                                errorMessage && (
                                    <div className="rounded-md bg-red-400 text-white px-6 py-3 w-fit">
                                        {errorMessage}
                                    </div>
                                )
                            }
                        </div>
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-lg font-semibold">Bulan</h2>
                            <select name="activities" id="activities" className="pl-4 pr-10 py-3 mt-2 rounded-md w-full" required value={month?.id ?? 0} onChange={onMonthChanged}>
                                <option key={0} className="" value={0} disabled>-- Silakan pilih bulan -- </option>
                                {availableMonths.map((m) => <option key={m.id} className="" value={m.id}>{m.attributes.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 rounded-md max-h-[24rem] overflow-y-auto">
                        <table className="w-full table table-auto">
                            <thead className="sticky top-0">
                                <tr>
                                    <td className="bg-slate-300 px-4 py-2 text-center font-semibold rounded-tl-md"></td>
                                    <td colSpan={3} className="bg-slate-300 px-4 py-2 text-center font-semibold">Keuangan</td>
                                    <td className="bg-slate-300 px-4 py-2 text-center font-semibold"></td>
                                    <td colSpan={3} className="bg-slate-300 px-4 py-2 text-center font-semibold rounded-tr-md">Realisasi Kinerja (s/d {month?.attributes?.name ?? '-'})</td>
                                </tr>
                            </thead>
                            <tbody className="h-[16rem] overflow-scroll">
                                <tr>
                                    <td className="bg-slate-200"></td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {previousMonth?.attributes?.name ?? '-'}</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Anggaran<br/>Kas {month?.attributes?.name ?? '-'}</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {month?.attributes?.name ?? '-'}</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {previousMonth?.attributes?.name ?? '-'}</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi<br />(tanpa satuan)</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Target (%)</td>
                                    <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Capaian (%)</td>
                                </tr>
                                <tr>
                                    <td className="bg-slate-100 px-4 py-2">Realisasi</td>
                                    <td className="px-4 py-2 text-center">{formatCurrency(previousRealization?.budget ?? 0)}</td>
                                    <td className="px-4 py-2 text-center">{formatCurrency(cash)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <input required type="text" className="w-full px-3 py-2 rounded-md" value={budget} onChange={(e) => setBudget(e.target.value)} />
                                    </td>
                                    <td className="px-4 py-2 text-center">{formatWithMeasurement(previousRealization?.physical ?? '-', measurement)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <input required type="text" className="w-full px-3 py-2 rounded-md" value={physical} onChange={(e) => setPhysical(e.target.value)} />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input required type="text" className="w-full px-3 py-2 rounded-md" value={physicalTarget} onChange={(e) => setPhysicalTarget(e.target.value)} />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input required type="text" className="w-full px-3 py-2 rounded-md" value={physicalAchievement} onChange={(e) => setPhysicalAchievement(e.target.value)} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="bg-slate-100 px-4 py-2">Rincian Masalah</td>
                                    <td className="px-4 py-2 text-center">{previousRealization?.budgetProblem.problem ?? '-'}</td>
                                    <td colSpan={2} className="px-4 py-2 text-center">
                                        <textarea required rows={3} className="w-full px-3 py-2 rounded-md resize-none" value={budgetProblem} onChange={(e) => setBudgetProblem(e.target.value)}></textarea>
                                    </td>
                                    <td className="px-4 py-2 text-center">{previousRealization?.physicalProblem.problem ?? '-'}</td>
                                    <td colSpan={3} className="px-4 py-2 text-center">
                                        <textarea required rows={3} className="w-full px-3 py-2 rounded-md resize-none" value={physicalProblem} onChange={(e) => setPhysicalProblem(e.target.value)}></textarea>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="bg-slate-100 px-4 py-2">Solusi / Tindak Lanjut</td>
                                    <td className="px-4 py-2 text-center">{previousRealization?.budgetProblem.solution ?? '-'}</td>
                                    <td colSpan={2} className="px-4 py-2 text-center">
                                        <textarea required name="" id="" rows={3} className="w-full px-3 py-2 rounded-md resize-none" value={budgetSolution} onChange={(e) => setBudgetSolution(e.target.value)}></textarea>
                                    </td>
                                    <td className="px-4 py-2 text-center">{previousRealization?.physicalProblem.solution ?? '-'}</td>
                                    <td colSpan={3} className="px-4 py-2 text-center">
                                        <textarea required name="" id="" rows={3} className="w-full px-3 py-2 rounded-md resize-none" value={physicalSolution} onChange={(e) => setPhysicalSolution(e.target.value)}></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </CustomModal>
        </>
    );   
}