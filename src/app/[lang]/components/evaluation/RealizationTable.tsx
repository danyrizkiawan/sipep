"use client";

import { useState } from "react";
import { Budget, Measurement, Realization, SubActivity } from "../../utils/model";
import RealizationItem from "./RealizationItem";
import EditRealizationModal from "./EditRealizationModal";
import { formatCurrency, formatWithMeasurement, subActivityBudgetRealization, subActivityPhysicalRealization } from "../../utils/realization-helpers";
import { subActivityCash } from "../../utils/budget-helpers";

interface RealizationTableParams {
  subActivity: SubActivity;
  measurement: Measurement;
  realizations: Realization[];
  onSuccess: () => Promise<void>;
}

export default function RealizationTable({
  subActivity,
  measurement,
  realizations,
  onSuccess,
} : RealizationTableParams) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  function openModal() { setIsOpen(true); }
  function closeModal() { setIsOpen(false); }
  
  const [selected, setSelected] = useState<Realization>();

  function onEdit(realization:Realization) {
    setSelected(realization)
    openModal()
  }

  const lastMonth = realizations.at(-1)?.month.data.id ?? 1

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full table table-auto text-md">
        <thead className="text-gray-700 bg-gray-100">
          <tr>
            <th className="px-6 py-3 rounded-tl-md">Bulan</th>
            <th className="px-6 py-3">Anggaran Kas</th>
            <th className="px-6 py-3">Realisasi Anggaran</th>
            <th className="px-6 py-3">Realisasi Fisik</th>
            <th className="px-6 py-3">Target Fisik (%)</th>
            <th className="px-6 py-3">Capaian Fisik (%)</th>
            <th className="px-6 py-3">Rincian Masalah</th>
            <th className="px-6 py-3">Solusi / Tindak Lanjut</th>
            <th className="px-6 py-3 rounded-tr-md">Actions</th>
          </tr>
        </thead>
        <tbody className="rounded-b-md overflow-clip">
          { realizations.length == 0 ?
            <RealizationItem onEdit={() => {}} />
          : realizations.map(
            (r) => {
              const cash = subActivity.attributes.cashBudget.find(c => c.month.data.id == r.month.data.id)
              return <RealizationItem
                key={r.id}
                cashBudget={cash}
                measurement={measurement}
                realization={r}
                onEdit={() => onEdit(r)}
              />
            } 
          )}
        </tbody>
        <tfoot>
          <tr className="text-gray-700 bg-gray-100">
            <th className="px-6 py-3 rounded-bl-md"></th>
            <th className="px-6 py-3">{formatCurrency(subActivityCash(subActivity, lastMonth))}</th>
            <th className="px-6 py-3">{formatCurrency(subActivityBudgetRealization(subActivity, lastMonth))}</th>
            <th className="px-6 py-3">{formatWithMeasurement(subActivityPhysicalRealization(subActivity, lastMonth), measurement)}</th>
            <th colSpan={4} className="px-6 py-3"></th>
            <th className="px-6 py-3 rounded-br-md"></th>
          </tr>
        </tfoot>
      </table>
      {
        selected && (
          <EditRealizationModal
            isOpen={isOpen}
            closeModal={closeModal}
            subActivityId={subActivity.id}
            cashBudgets={subActivity.attributes.cashBudget}
            measurement={measurement}
            realization={selected}
            realizations={realizations}
            onSuccess={onSuccess}
          />
        )
      }
    </div>
  )
}