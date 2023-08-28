"use client";

import { useState } from "react";
import { Month } from "../../../utils/model";
import MonthSelect from "../MonthSelect";

interface EvaluationReportHeaderParams {
  onMonthChange: (month: Month | undefined) => void;
  onIsUnitChange: (isUnit: boolean) => void;
  onDateChange: (date: Date) => void;
}

export default function EvaluationReportHeader({
  onMonthChange,
  onIsUnitChange,
  onDateChange,
} : EvaluationReportHeaderParams) {
  const [isLoading, setLoading] = useState(true);
  const [isUnit, setIsUnit] = useState(0);

  function onChange(month: Month | undefined) {
      setLoading(true)
      onMonthChange(month)
  }


  function onIsUnitSelected(e: any) {
    e.preventDefault()
    setIsUnit(e.target.value)
    onIsUnitChange(e.target.value == 0)
  }

  function onDateSelected(e: any) {
    e.preventDefault()
    onDateChange(new Date(e.target.value))
  }

  return (
    <div className="flex gap-4 mx-4 sm:mx-20 my-4 pt-4 pb-6 border-b border-neutral-200">
      <div className="form-group w-full">
        <h2 className="text-xl font-semibold">Pilih Bidang / Individu</h2>
        <select name="isUnit" id="isUnit" className="pl-4 pr-10 py-3 mt-2 rounded-md w-full" value={isUnit} onChange={onIsUnitSelected}>
          <option className="" value={0}>Laporan Bidang</option>
          <option className="" value={1}>Laporan Individu</option>
        </select>
      </div>
      <MonthSelect onChange={onChange} />
      <div className="form-group w-full">
        <h2 className="text-xl font-semibold">Pilih Tanggal Print</h2>
        <input type="date" name="date" id="date" className="px-4 py-3 mt-2 rounded-md w-full" onChange={onDateSelected}/>
      </div>
    </div>
  )
}