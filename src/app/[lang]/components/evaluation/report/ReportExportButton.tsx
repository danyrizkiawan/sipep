"use client";

import { activityBudget, activityCash, formatNumber, programBudget, programCash, programsBudget, programsCash, subActivityBudget, subActivityCash } from "@/app/[lang]/utils/budget-helpers";
import { Month, Program, User } from "../../../utils/model";
import { Workbook, Borders } from 'exceljs';
import { saveAs } from "file-saver";
import { activityBudgetRealization, formatPercentage, formatPercentageFromString, formatWithMeasurement, programBudgetRealization, programsBudgetRealization, subActivityBudgetRealization } from "@/app/[lang]/utils/realization-helpers";

interface ReportExportButtonParams {
  user?: User;
  month?: Month;
  isUnit: boolean;
  programs: Program[];
}

interface TableHeader {
    title: string;
    subtitles?: string[];
}

const headers : TableHeader[] = [
    { title: 'Sasaran Strategis' },
    { title: 'Indikator Kinerja Sasaran' },
    { title: 'Target Kinerja Sasaran' },
    { title: 'Program / Kegiatan / Sub Kegiatan' },
    { title: 'Sasaran Program / Kegiatan / Sub Kegiatan DPA', subtitles: [ 'Indikator Kinerja', 'Target' ] },
    { title: '' },
    { title: 'Anggaran DPA (Rp.)' },
    { title: 'Total Anggaran Kas Jan (Rp.)' },
    { title: 'Total Realisasi Jan (Rp.)' },
    { title: 'Presentase Realisasi Keuangan' },
    { title: 'Presentase Realisasi thd Angkas' },
    { title: 'Realisasi Keuangan', subtitles: [ 'Rincian Masalah', 'Solusi / Tindak Lanjut' ] },
    { title: '' },
    { title: 'Realisasi Kinerja Fisik' },
    { title: 'Tingkat Capaian Realisasi (%)' },
    { title: 'Realisasi Kinerja Fisik', subtitles: [ 'Rincian Masalah', 'Solusi / Tindak Lanjut' ] },
    { title: '' },
]

const columnWidths = [
    18,
    15,
    15,
    18,
    18,
    13,
    15,
    15,
    15,
    10,
    10,
    18,
    18,
    15,
    13,
    18,
    18,
]

const border: Partial<Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
}

export default function ReportExportButton({
  user,
  month,
  isUnit,
  programs,
} : ReportExportButtonParams) {
    async function onClick(e: any) {
        e.preventDefault()
        
        const userId = user?.id
        if (!userId) return;
        const monthId = month?.id ?? 0

        // Modify the workbook
        const workbook = new Workbook();
        const sheet = workbook.addWorksheet('Sheet1');
        var y = 1
        var maxX = 17
        for (let i = 1; i <= maxX; i++) {
            const col = sheet.getColumn(i);
            col.width = columnWidths[i-1]
        }
        
        // Title
        var titles = [`Laporan Realisasi Fisik dan Kinerja Bulan ${month?.attributes.name ?? '-'} Tahun 2023`]
        if (!isUnit && user?.evaluationScope) {
            titles.push(user?.evaluationScope)
        }
        if (user?.unit?.name) {
            titles.push(user?.unit?.name)
        }
        titles.push(`Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Depok`)
        y++
        for (let i = 0; i <= titles.length; i++) {
            sheet.mergeCells(`A${y}:Q${y}`)
            sheet.getCell(`Q${y}`).value = titles[i];
            sheet.getCell(`Q${y}`).font = { bold: true };
            sheet.getCell(`Q${y}`).alignment = { vertical: 'middle', horizontal: 'center' };
            y++
        }
        
        // Header line 1
        y++
        let row = sheet.getRow(y)
        row.font = { bold: true }
        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }

        for (let i = 1; i < headers.length; i++) {
            const header = headers[i-1]
            const cell = row.getCell(i)
            cell.border = border

            if (header.title == '') continue
            if (header.subtitles) {
                const nextCell = row.getCell(i+1)
                sheet.mergeCells(`${cell.$col$row}:${nextCell.$col$row}`)
                nextCell.value = header.title
            } else {
                const nextRow = sheet.getRow(y+1)
                const nextCell = nextRow.getCell(i)
                sheet.mergeCells(`${cell.$col$row}:${nextCell.$col$row}`)
            }
        }
        // Header line 2
        y++
        row = sheet.getRow(y)
        row.font = { bold: true }
        row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        for (let i = 1; i < headers.length; i++) {
            const header = headers[i-1]
            const cell = row.getCell(i)

            if (header.title == '') continue
            if (!header.subtitles) {
                cell.border = border
                cell.value = header.title
                if ([8, 9].includes(i)) {
                    let until = ''
                    if (month && month?.id != 1) {
                        until = `- ${month?.attributes.shortName}`
                    }
                    cell.value = header.title.replace('Jan', `Jan ${until}`)
                }
            } else {
                for (let j = 0; j < header.subtitles.length; j++) {
                    const cell = row.getCell(i + j)
                    cell.value = header.subtitles[j]
                    cell.border = border
                }
            }
        }

        // Content
        y++
        programs.forEach(program => {
            const activities = program.attributes.activities.data
            const target = program.attributes.programTarget
            const budget = programBudget(program, userId)
            const cash = programCash(program, monthId, userId)
            const budgetRealization = programBudgetRealization(program, monthId, userId)
            const budgetRealizationPercentage = budgetRealization / budget * 100
            const cashRealizationPercentage = budgetRealization / cash * 100
            const values = [
                '',
                '',
                '',
                program.attributes.name,
                program.attributes.indicator,
                formatWithMeasurement(target.target, target.measurement.data),
                formatNumber(budget),
                formatNumber(cash),
                formatNumber(budgetRealization),
                formatPercentage(budgetRealizationPercentage),
                formatPercentage(cashRealizationPercentage),
                '',
                '',
                '',
                '',
                '',
                '',
            ]

            const row = sheet.getRow(y)
            row.font = { bold: true }
            row.alignment = { wrapText: true }
            row.values = values
            for (let i = 1; i <= values.length; i++) {
                const cell = row.getCell(i)
                cell.border = border
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }
            }
            y++

            activities.forEach(activity => {
                var subActivities = activity.attributes.sub_activities.data;
                const objectiveIndicator = activity.attributes.objectiveIndicator.data;
                const objective = objectiveIndicator.attributes.objective.data;
                const target = activity.attributes.activityTarget;
                const budget = activityBudget(activity, userId);
                const cash = activityCash(activity, monthId, userId);
                const budgetRealization = activityBudgetRealization(activity, monthId, userId);
                const budgetRealizationPercentage = budgetRealization / budget * 100
                const cashRealizationPercentage = budgetRealization / cash * 100
                if (!isUnit && userId) {
                    subActivities = subActivities.filter(sa => sa.attributes.subActivityPic.at(-1)?.user.data.id == userId)
                    if (subActivities.length == 0) return
                }
                const values = [
                    objective.attributes.name,
                    objectiveIndicator.attributes.name,
                    objectiveIndicator.attributes.objectiveTarget.target,
                    activity.attributes.name,
                    activity.attributes.indicator,
                    formatWithMeasurement(target.target, target.measurement.data),
                    formatNumber(budget),
                    formatNumber(cash),
                    formatNumber(budgetRealization),
                    formatPercentage(budgetRealizationPercentage),
                    formatPercentage(cashRealizationPercentage),
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                ]
                const row = sheet.getRow(y);
                row.font = { bold: true }
                row.alignment = { wrapText: true }
                row.values = values
                for (let i = 1; i <= values.length; i++) {
                    const cell = row.getCell(i)
                    cell.border = border
                }
                y++

                subActivities.forEach(subActivity => {
                    const target = subActivity.attributes.subActivityTarget;
                    const measurement = target.measurement.data;
                    const budget = subActivityBudget(subActivity, userId);
                    const cash = subActivityCash(subActivity, monthId, userId);
                    const budgetRealization = subActivityBudgetRealization(subActivity, monthId, userId);
                    const budgetRealizationPercentage = budgetRealization / budget * 100
                    const cashRealizationPercentage = budgetRealization / cash * 100
                    const realization = subActivity.attributes.realization.find(r => r.month.data.id == monthId);
                    const budgetProblem = realization?.budgetProblem.problem ?? '';
                    const budgetSolution = realization?.budgetProblem.solution ?? '';
                    const physical = realization?.physical;
                    const physicalAchievement = realization?.physicalAchievement;
                    const physicalProblem = realization?.budgetProblem.problem ?? '';
                    const physicalSolution = realization?.budgetProblem.solution ?? '';
                    const pic = subActivity.attributes.subActivityPic.at(-1)

                    if (!isUnit && userId && (pic?.user.data.id != userId)) return
                    const values = [
                        '',
                        '',
                        '',
                        subActivity.attributes.name,
                        subActivity.attributes.indicator,
                        formatWithMeasurement(target.target, measurement),
                        formatNumber(budget),
                        formatNumber(cash),
                        formatNumber(budgetRealization),
                        formatPercentage(budgetRealizationPercentage),
                        formatPercentage(cashRealizationPercentage),
                        budgetProblem,
                        budgetSolution,
                        formatWithMeasurement(physical, measurement),
                        formatPercentageFromString(physicalAchievement ?? '0'),
                        physicalProblem,
                        physicalSolution,
                    ]
                    const row = sheet.getRow(y);
                    row.alignment = { wrapText: true }
                    row.values = values
                    for (let i = 1; i <= values.length; i++) {
                        const cell = row.getCell(i)
                        cell.border = border
                    }
                    y++
                })
            })
        })

        // Footer
        row = sheet.getRow(y)
        row.font = { bold: true }
        const budget = programsBudget(programs, userId);
        const cash = programsCash(programs, monthId, userId);
        const budgetRealization = programsBudgetRealization(programs, monthId, userId);
        const budgetRealizationPercentage = budgetRealization / budget * 100
        const cashRealizationPercentage = budgetRealization / cash * 100
        const values = [
            '',
            '',
            '',
            '',
            '',
            'Total',
            formatNumber(budget),
            formatNumber(cash),
            formatNumber(budgetRealization),
            formatPercentage(budgetRealizationPercentage),
            formatPercentage(cashRealizationPercentage),
            '',
            '',
            '',
            '',
            '',
            '',
        ]
        for (let i = 1; i <= headers.length; i++) {
            const cell = row.getCell(i)
            if (i == 6) {
                const start = row.getCell(1)
                sheet.mergeCells(`${start.$col$row}:${cell.$col$row}`)
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
            }
            cell.border = border
            cell.value = values[i-1]
        }
        y = y + 3

        // Signature
        

        // Write to file.
        let until = ''
        if (month && month?.id != 1) {
            until = `_-_${month?.attributes.shortName}`
        }
        const filename = `laporan_realisasi_fisik_dan_kinerja_Jan${until}_2023.xlsx`

        const buf = await workbook.xlsx.writeBuffer();
        return saveAs(new Blob([buf]), filename);
    }

  return (
    <button className="px-6 py-3 bg-green-500 rounded-md text-white" onClick={onClick}>Excel</button>
  )
}