"use client";

import { SubActivity } from "../../utils/model";
import { formatCurrency, formatWithMeasurement } from "../../utils/realization-helpers";
import AddRealizationModal from "./AddRealizationModal";
import RealizationTable from "./RealizationTable";

interface RealizationSectionParams {
  subActivity: SubActivity;
  onChange: (sa: SubActivity | undefined, showLoading: boolean) => Promise<void>;  
}

export default function RealizationSection({
  subActivity,
  onChange,
} : RealizationSectionParams) {
  const target = subActivity.attributes.subActivityTarget;
  const dpa = subActivity.attributes.dpaBudget.at(-1);
  const pic = subActivity.attributes.subActivityPic.at(-1);

  return (
    <div className="w-full">
      <div>
          <h2 className="text-xl font-semibold w-full lg:w-3/4 my-4">{subActivity.attributes.name}</h2>
          <div className="grid grid-cols-2 w-full lg:w-3/4 py-3 border-y">
            <h5 className="font-semibold">Target</h5>
            <p>{formatWithMeasurement(target.target, target.measurement.data)}</p>
          </div>
          <div className="grid grid-cols-2 w-full lg:w-3/4 py-3 border-b">
            <h5 className="font-semibold">Anggaran DPA</h5>
            <p>{formatCurrency(dpa?.budget ?? 0, dpa == undefined)}</p>
          </div>
          <div className="grid grid-cols-2 w-full lg:w-3/4 py-3 border-b">
            <h5 className="font-semibold">Penanggung Jawab</h5>
            <p>{pic?.user.data.fullName ?? '-'}</p>
          </div>
      </div>
      <div className="flex justify-end my-4">
        <AddRealizationModal
          subActivityId={subActivity.id}
          cashBudgets={subActivity.attributes.cashBudget}
          measurement={target.measurement.data}
          realizations={subActivity.attributes.realization}
          onSuccess={async () => await onChange(subActivity, false)}
        />
      </div>
      <RealizationTable
        subActivity={subActivity}
        measurement={target.measurement.data}
        realizations={subActivity.attributes.realization}
        onSuccess={async () => await onChange(subActivity, false)}
      />
    </div>
  )
}