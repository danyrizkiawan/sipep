"use client";

import { formatCurrency, formatPercentage, formatWithMeasurement } from "../../utils/realization-helpers";
import { Budget, Measurement, Realization } from "../../utils/model";

interface RealizationItemParams {
    cashBudget?: Budget;
    measurement?: Measurement;
    realization?: Realization;
    onEdit: () => void;
}

export default function RealizationItem({
    cashBudget,
    measurement,
    realization,
    onEdit,
} : RealizationItemParams ) {
    function onClick(e: any) {
        e.preventDefault()
        onEdit()
    }

    return (
        <tr className="bg-gray-50 text-center">
        {realization == undefined ? (
            <td colSpan={4} className="px-6 py-3">Belum ada data realisasi</td>
        ) : (
            <>
                <td className="px-6 py-3">{realization.month.data.attributes.name}</td>
                <td className="px-6 py-3">{formatCurrency(cashBudget?.budget ?? 0)}</td>
                <td className="px-6 py-3">{formatCurrency(realization.budget)}</td>
                <td className="px-6 py-3">{formatWithMeasurement(realization.physical, measurement)}</td>
                <td className="px-6 py-3">{formatPercentage(Number(realization.physicalTarget))}</td>
                <td className="px-6 py-3">{formatPercentage(Number(realization.physicalAchievement))}</td>
                <td className="px-6 py-3">{realization.physicalProblem.problem}</td>
                <td className="px-6 py-3">{realization.physicalProblem.solution}</td>
                <td className="px-2 py-3">
                    <button className="px-6 py-2 bg-violet-100 rounded-md" onClick={onClick}>Edit</button>
                </td>
            </>
        )}
        </tr>
    )
  }