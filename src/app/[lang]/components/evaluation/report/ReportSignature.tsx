"use client";

import { formatDate } from "@/app/[lang]/utils/api-helpers";
import { User } from "../../../utils/model";

interface ReportSignatureParams {
    user?: User;
    date: Date;
    isUnit: boolean;
}

export default function ReportSignature({
    user,
    date,
    isUnit,
} : ReportSignatureParams) {
    const formattedDate = `Depok, ${formatDate(date.toDateString())}`
    const isHead = user?.id == 1
    const headOfUnit = user?.unit.headOfUnit.at(-1)?.user

    return (
        <div className={`w-full flex ${isHead ? 'justify-end' : 'justify-between'} `}>
            {
                isUnit && (
                    <div className="flex flex-col text-center my-10" hidden={!isUnit}>
                        {
                            isHead ?
                            <p>{formattedDate}</p> :
                            <p>Mengetahui,</p>
                        }
                        <p>Kepala Dinas Ketahanan Pangan,</p>
                        <p>Pertanian dan Perikanan</p>
                        <p>Kota Depok</p>
                        <br />
                        <br />
                        <br />
                        <br />
                        <p className="font-semibold underline">Ir. WIDYATI RIYANDANI</p>
                        <p>NIP. 196812161994032005</p>
                    </div>
                )
            }
            <div className="flex flex-col text-center my-10">
                {
                    isUnit ?
                    <p>{formattedDate}</p> :
                    <p>Mengetahui,</p>
                }
                <p>{headOfUnit?.position}</p>
                <p>Dinas Ketahanan Pangan, Pertanian dan Perikanan</p>
                <p>Kota Depok</p>
                <br />
                <br />
                <br />
                <br />
                <p className="font-semibold underline">{headOfUnit?.fullName}</p>
                <p>NIP. {headOfUnit?.nip}</p>
            </div>
            {
                !isUnit && (
                    <div className="flex flex-col text-center my-10">
                        <p>{formattedDate}</p>
                        <p>{user?.position}</p>
                        <p>Dinas Ketahanan Pangan, Pertanian dan Perikanan</p>
                        <p>Kota Depok</p>
                        <br />
                        <br />
                        <br />
                        <br />
                        <p className="font-semibold underline">{user?.fullName}</p>
                        <p>NIP. {user?.nip}</p>
                    </div>
                )
            }
        </div>
    )
}