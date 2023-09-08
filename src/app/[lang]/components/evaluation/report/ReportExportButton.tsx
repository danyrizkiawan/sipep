"use client";

import { activityBudget, activityCash, formatNumber, programBudget, programCash, programsBudget, programsCash, subActivityBudget, subActivityCash } from "@/app/[lang]/utils/budget-helpers";
import { Month, Program, User } from "../../../utils/model";
import { Workbook, Borders } from 'exceljs';
import { saveAs } from "file-saver";
import { activityBudgetRealization, formatPercentage, formatPercentageFromString, formatWithMeasurement, programBudgetRealization, programsBudgetRealization, subActivityBudgetRealization } from "@/app/[lang]/utils/realization-helpers";
import { formatDate } from "@/app/[lang]/utils/api-helpers";
import { Content, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ReportExportButtonParams {
  user?: User;
  month?: Month;
  date: Date;
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
  date,
  isUnit,
  programs,
} : ReportExportButtonParams) {
    async function onExcelClick(e: any) {
        e.preventDefault()
        
        const userId = isUnit ? undefined : user?.id
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
                if (userId) {
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

                    if (userId && (pic?.user.data.id != userId)) return
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
        const formattedDate = `Depok, ${formatDate(date.toDateString())}`
        const isHead = user?.id == 1
        const headOfUnit = user?.unit?.headOfUnit.at(-1)?.user
        const headOrganizationSignature = [
            'Kepala Dinas Ketahanan Pangan,',
            'Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            'Ir. WIDYATI RIYANDANI',
            'NIP. 196812161994032005',
        ]
        const headUnitSignature = [
            headOfUnit?.position ?? '',
            'Dinas Ketahanan Pangan, Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            headOfUnit?.fullName ?? '',
            `NIP. ${headOfUnit?.nip}`,
        ]
        const picSignature = [
            user?.position ?? '',
            'Dinas Ketahanan Pangan, Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            user?.fullName ?? '',
            `NIP. ${user?.nip ?? ''}`,
        ]
        let leftSignature = [ 'Mengetahui,']
        let rightSignature = [ formattedDate ]
        if (isUnit) {
            if (isHead) {
                rightSignature = [...rightSignature, ...headOrganizationSignature]
            } else {
                leftSignature = [...leftSignature, ...headOrganizationSignature]
                rightSignature = [...rightSignature, ...headUnitSignature]
            }
        } else {
            leftSignature = [...leftSignature, ...headUnitSignature]
            rightSignature = [...rightSignature, ...picSignature]
        }
        for (let i = 0; i < 10; i++) {
            const row = sheet.getRow(y)
            row.alignment = { vertical: 'middle', horizontal: 'center' };
            if (i == 8) {
                row.font = { bold: true, underline: true };
            }
            if (!isHead) {
                sheet.mergeCells(`A${y}:C${y}`)
                row.getCell(3).value = leftSignature[i]
            }
            sheet.mergeCells(`O${y}:Q${y}`)
            row.getCell(17).value = rightSignature[i]
            y++
        }

        // Write to file.
        let until = ''
        if (month && month?.id != 1) {
            until = `_-_${month?.attributes.shortName}`
        }
        const filename = `laporan_realisasi_fisik_dan_kinerja_Jan${until}_2023.xlsx`

        const buf = await workbook.xlsx.writeBuffer();
        return saveAs(new Blob([buf]), filename);
    }


    async function onPdfClick(e: any) {
        e.preventDefault()
        
        const userId = isUnit ? undefined : user?.id
        const monthId = month?.id ?? 0

        var content: Content = []
        
        // Title
        var titles = [
            { text: `Laporan Realisasi Fisik dan Kinerja Bulan ${month?.attributes.name ?? '-'} Tahun 2023`, style: 'title' }
        ]
        if (!isUnit && user?.evaluationScope) {
            titles.push({text: user?.evaluationScope, style: 'title'})
        }
        if (user?.unit?.name) {
            titles.push({text: user?.unit?.name, style: 'title'})
        }
        titles.push({text: `Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Depok`, style: 'title'})
        titles.push({text: ' ', style: 'title'})
        content.push(titles)

        // Tables
        var tableHeader1 = []
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]
            var title = header.title

            if (title == '') continue
            if (header.subtitles) {
                tableHeader1.push({text: title, colSpan: header.subtitles.length, style: 'header'})
                for (let sb = 0; sb < header.subtitles.length -1; sb++) {
                    tableHeader1.push('')
                }
                continue
            }
            if ([7, 8].includes(i)) {
                let until = ''
                if (month && month?.id != 1) {
                    until = `- ${month?.attributes.shortName}`
                }
                title = header.title.replace('Jan', `Jan ${until}`)
            }
            tableHeader1.push({text: header.title, style: 'header', rowSpan: 2})
        }
        var tableHeader2 = []
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]

            if (header.title == '') continue
            if (!header.subtitles) {
                tableHeader2.push('')
                continue
            }

            for (let j = 0; j < header.subtitles.length; j++) {
                tableHeader2.push({text: header.subtitles[j], style: 'header'})
            }
        }

        var body = [
            tableHeader1,
            tableHeader2,
        ]

        // Content
        programs.forEach(program => {
            const activities = program.attributes.activities.data
            const target = program.attributes.programTarget
            const budget = programBudget(program, userId)
            const cash = programCash(program, monthId, userId)
            const budgetRealization = programBudgetRealization(program, monthId, userId)
            const budgetRealizationPercentage = budgetRealization / budget * 100
            const cashRealizationPercentage = budgetRealization / cash * 100
            const values = [
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: program.attributes.name, style: 'program' },
                { text: program.attributes.indicator, style: 'program' },
                { text: formatWithMeasurement(target.target, target.measurement.data), style: 'program' },
                { text: formatNumber(budget), style: 'program' },
                { text: formatNumber(cash), style: 'program' },
                { text: formatNumber(budgetRealization), style: 'program' },
                { text: formatPercentage(budgetRealizationPercentage), style: 'program' },
                { text: formatPercentage(cashRealizationPercentage), style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
                { text: '', style: 'program' },
            ]
            body.push(values)

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
                if (userId) {
                    subActivities = subActivities.filter(sa => sa.attributes.subActivityPic.at(-1)?.user.data.id == userId)
                    if (subActivities.length == 0) return
                }
                const values = [
                    { text: objective.attributes.name, style: 'activity' },
                    { text: objectiveIndicator.attributes.name, style: 'activity' },
                    { text: objectiveIndicator.attributes.objectiveTarget.target, style: 'activity' },
                    { text: activity.attributes.name, style: 'activity' },
                    { text: activity.attributes.indicator, style: 'activity' },
                    { text: formatWithMeasurement(target.target, target.measurement.data), style: 'activity' },
                    { text: formatNumber(budget), style: 'activity' },
                    { text: formatNumber(cash), style: 'activity' },
                    { text: formatNumber(budgetRealization), style: 'activity' },
                    { text: formatPercentage(budgetRealizationPercentage), style: 'activity' },
                    { text: formatPercentage(cashRealizationPercentage), style: 'activity' },
                    { text: '', style: 'activity' },
                    { text: '', style: 'activity' },
                    { text: '', style: 'activity' },
                    { text: '', style: 'activity' },
                    { text: '', style: 'activity' },
                    { text: '', style: 'activity' },
                ]
                body.push(values)
                
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

                    if (userId && (pic?.user.data.id != userId)) return
                    const values = [
                        { text: '', style: 'subActivity' },
                        { text: '', style: 'subActivity' },
                        { text: '', style: 'subActivity' },
                        { text: subActivity.attributes.name, style: 'subActivity' },
                        { text: subActivity.attributes.indicator, style: 'subActivity' },
                        { text: formatWithMeasurement(target.target, measurement), style: 'subActivity' },
                        { text: formatNumber(budget), style: 'subActivity' },
                        { text: formatNumber(cash), style: 'subActivity' },
                        { text: formatNumber(budgetRealization), style: 'subActivity' },
                        { text: formatPercentage(budgetRealizationPercentage), style: 'subActivity' },
                        { text: formatPercentage(cashRealizationPercentage), style: 'subActivity' },
                        { text: budgetProblem, style: 'subActivity' },
                        { text: budgetSolution, style: 'subActivity' },
                        { text: formatWithMeasurement(physical, measurement), style: 'subActivity' },
                        { text: formatPercentageFromString(physicalAchievement ?? '0'), style: 'subActivity' },
                        { text: physicalProblem, style: 'subActivity' },
                        { text: physicalSolution, style: 'subActivity' },
                    ]
                    
                    body.push(values)
                })
            })
        })

        // Footer
        const budget = programsBudget(programs, userId);
        const cash = programsCash(programs, monthId, userId);
        const budgetRealization = programsBudgetRealization(programs, monthId, userId);
        const budgetRealizationPercentage = budgetRealization / budget * 100
        const cashRealizationPercentage = budgetRealization / cash * 100
        const values = [
            { text: 'Total', style: 'header', colSpan: 6 },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: formatNumber(budget), style: 'header' },
            { text: formatNumber(cash), style: 'header' },
            { text: formatNumber(budgetRealization), style: 'header' },
            { text: formatPercentage(budgetRealizationPercentage), style: 'header' },
            { text: formatPercentage(cashRealizationPercentage), style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
            { text: '', style: 'header' },
        ]
        body.push(values)
        var tables: ContentTable = {
            layout: {
                defaultBorder: true,
            },
            table: {
                widths: 'auto',
                headerRows: 2,
                dontBreakRows: true,
                body: body,
            }
        }
        content.push(tables)

        // Signature
        const formattedDate = `Depok, ${formatDate(date.toDateString())}`
        const isHead = user?.id == 1
        const headOfUnit = user?.unit?.headOfUnit.at(-1)?.user
        const headOrganizationSignature = [
            'Kepala Dinas Ketahanan Pangan,',
            'Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            'Ir. WIDYATI RIYANDANI',
            'NIP. 196812161994032005',
        ]
        const headUnitSignature = [
            headOfUnit?.position ?? '',
            'Dinas Ketahanan Pangan, Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            headOfUnit?.fullName ?? '',
            `NIP. ${headOfUnit?.nip}`,
        ]
        const picSignature = [
            user?.position ?? '',
            'Dinas Ketahanan Pangan, Pertanian dan Perikanan',
            'Kota Depok',
            '',
            '',
            '',
            '',
            user?.fullName ?? '',
            `NIP. ${user?.nip ?? ''}`,
        ]
        let leftSignature = [ 'Mengetahui,']
        let rightSignature = [ formattedDate ]
        if (isUnit) {
            if (isHead) {
                rightSignature = [...rightSignature, ...headOrganizationSignature]
            } else {
                leftSignature = [...leftSignature, ...headOrganizationSignature]
                rightSignature = [...rightSignature, ...headUnitSignature]
            }
        } else {
            leftSignature = [...leftSignature, ...headUnitSignature]
            rightSignature = [...rightSignature, ...picSignature]
        }

        content.push(' ')

        for (let i = 0; i < 10; i++) {
            var style = 'signature'
            if (i == 8) style = 'signatureName'
            content.push({
                columns: [
                    { width: '35%', text: leftSignature[i], style: style },
                    { width: '*', text: ' ', style: style },
                    { width: '35%', text: rightSignature[i], style: style },
                ]
            })
        }
        

        var docDefinition: TDocumentDefinitions = {
            content: content,
            styles: {
                title: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'center'
                },
                header: {
                    fontSize: 8,
                    bold: true,
                    alignment: 'center',
                },
                program: {
                    fontSize: 8,
                    bold: true,
                    fillColor: '#16A34A'
                },
                activity: {
                    fontSize: 8,
                    bold: true,
                },
                subActivity: {
                    fontSize: 8,
                },
                signature: {
                    fontSize: 12,
                    alignment: 'center'
                },
                signatureName: {
                    fontSize: 12,
                    alignment: 'center',
                    decoration: 'underline',
                    bold: true,
                },
            },
            pageSize: 'FOLIO',
            pageOrientation: 'landscape',
            pageMargins: [ 20, 20, 20, 20 ],
        }

        let until = ''
        if (month && month?.id != 1) {
            until = `_-_${month?.attributes.shortName}`
        }
        const filename = `laporan_realisasi_fisik_dan_kinerja_Jan${until}_2023.pdf`
        pdfMake.createPdf(docDefinition).download(filename);
    }

  return (
    <div className="flex gap-3">
        <button className="px-6 py-3 bg-green-500 rounded-md text-white" onClick={onExcelClick}>Excel</button>
        <button className="px-6 py-3 bg-red-500 rounded-md text-white" onClick={onPdfClick}>PDF</button>
    </div>
  )
}