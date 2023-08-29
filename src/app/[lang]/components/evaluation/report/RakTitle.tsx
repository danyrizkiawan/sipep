"use client";

import { Month, User } from "../../../utils/model";

interface RakTitleParams {
  user?: User;
  month?: Month;
  isUnit: boolean;
}

export default function RakTitle({
  user,
  month,
  isUnit,
} : RakTitleParams) {
  return (
    <div className="flex flex-col text-center font-bold my-10 uppercase">
      <h1>Laporan Realisasi Fisik dan Kinerja Bulan {month?.attributes.name ?? '-'} Tahun 2023</h1>
      { !isUnit && (
        <h1>{user?.evaluationScope}</h1>
      ) }
      <h1>{user?.unit?.name}</h1>
      <h1>Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Depok</h1>
    </div>
  )
}