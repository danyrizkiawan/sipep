"use client";

import CustomModal from "../CustomModal";
import { Budget, Measurement, Realization } from "../../utils/model";
import { formatCurrency, formatWithMeasurement } from "../../utils/realization-helpers";
import { useEffect, useState } from "react";
import { sendPUTRequest } from "../../utils/fetch-api";

interface EditRealizationModalParams {
    isOpen: boolean;
    closeModal: () => void;
    subActivityId: number;
    cashBudgets: Budget[];
    measurement: Measurement;
    realization: Realization;
    realizations: Realization[];
    onSuccess: () => Promise<void>;
}

export default function EditRealizationModal({
    isOpen,
    closeModal,
    subActivityId,
    cashBudgets,
    measurement,
    realization,
    realizations,
    onSuccess,
} : EditRealizationModalParams) {

    const [errorMessage, setErrorMessage] = useState<string>()
    const [cash, setCash] = useState<number>(0)
    const [budget, setBudget] = useState<string>("")
    const [physical, setPhysical] = useState<string>("")
    const [budgetProblem, setBudgetProblem] = useState<string>("")
    const [budgetSolution, setBudgetSolution] = useState<string>("")
    const [physicalTarget, setPhysicalTarget] = useState<string>("")
    const [physicalAchievement, setPhysicalAchievement] = useState<string>("")
    const [physicalProblem, setPhysicalProblem] = useState<string>("")
    const [physicalSolution, setPhysicalSolution] = useState<string>("")
    const [previousRealization, setPreviousRealization] = useState<Realization>();

    let month = realization.month.data

    useEffect(() => {
        resetForm(realization)
        getPreviousMonth(realization.month.data.id)
        const cashBudget = cashBudgets.find(b=> b.month.data.id == realization.month.data.id)
        setCash(cashBudget?.budget ?? 0)
    }, [realization]);

    function resetForm(value: Realization) {
        setErrorMessage(undefined)
        setBudget(value.budget.toString())
        setBudgetProblem(value.budgetProblem.problem)
        setBudgetSolution(value.budgetProblem.solution)
        setPhysical(value.physical)
        setPhysicalTarget(value.physicalTarget ?? '')
        setPhysicalAchievement(value.physicalAchievement ?? '')
        setPhysicalProblem(value.physicalProblem.problem)
        setPhysicalSolution(value.physicalProblem.solution)
    }

    async function saveRealization() {
        setErrorMessage(undefined)
        try {
            if (!budget || !budgetProblem || !budgetSolution) {
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

            const updatedRealization = realization
            updatedRealization.budget = formattedBudget
            updatedRealization.budgetProblem.problem = budgetProblem
            updatedRealization.budgetProblem.solution = budgetSolution
            updatedRealization.physical = physical
            updatedRealization.physicalTarget = physicalTarget
            updatedRealization.physicalAchievement = physicalAchievement
            updatedRealization.physicalProblem.problem = physicalProblem
            updatedRealization.physicalProblem.solution = physicalSolution

            const updatedRealizations = realizations
            const index = realizations.findIndex((r) => r.id == realization.id)
            updatedRealizations[index] = updatedRealization

            const body = { data: { realization: updatedRealizations } }
            const path = `/sub-activities/${subActivityId}`;
            const response = await sendPUTRequest(path, body);

            if (!response.data) {
                setErrorMessage(response.error.message)
                return
            }

            await onSuccess()
            closeModal()
        } catch (e) {
            let error = (e as Error).message;
            setErrorMessage(error)
            console.error(error);
        }
    }

    function getPreviousMonth(current: number) {
        const prevMonth = current - 1;
        if (!prevMonth) return setPreviousRealization(undefined);
        
        const prevReal = realizations.find((r) => r.month.data.id === prevMonth);
        setPreviousRealization(prevReal);
    }
    
    return (
        <CustomModal
            isOpen={isOpen}
            closeModal={closeModal}
            title="Edit Realisasi"
            primaryButton={{ onClick: saveRealization }}
        >
            <div className="rounded-md max-h-[24rem] overflow-y-auto">
                <div className="w-full my-3 flex justify-end">
                    {
                        errorMessage && (
                            <div className="rounded-md bg-red-400 text-white px-6 py-3 w-fit">
                                {errorMessage}
                            </div>
                        )
                    }
                </div>
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
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {previousRealization?.month?.data.attributes?.name ?? '-'}</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Anggaran<br/>Kas {month?.attributes?.name ?? '-'}</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {month?.attributes?.name ?? '-'}</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi {previousRealization?.month?.data.attributes?.name ?? '-'}</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Realisasi<br />(tanpa satuan)</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Target (%)</td>
                            <td className="bg-slate-200 px-4 py-2 text-center font-semibold">Capaian (%)</td>
                        </tr>
                        <tr>
                            <td className="bg-slate-100 px-4 py-2">Realisasi</td>
                            <td className="px-4 py-2 text-center">{formatCurrency(previousRealization?.budget ?? 0, true)}</td>
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
        </CustomModal>
    );   
}