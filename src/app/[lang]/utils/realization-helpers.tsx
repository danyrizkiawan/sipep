import { formatNumber } from "./budget-helpers";
import { Activity, Measurement, Program, SubActivity } from "./model"

export function formatPercentage(amount: number) : string {
    if (!isFinite(amount)) amount = 0
    return formatNumber(amount) + '%';
}

export function formatPercentageFromString(amount: string) : string {
    var numAmount = Number(amount)
    if (isNaN(numAmount)) return '-'
    return formatPercentage(numAmount);
}

export function formatCurrency(amount: number, hideZero = false) : string {
    if (amount == 0 && hideZero) return '-'
    const formatter = Intl.NumberFormat('id-ID',{ style: 'currency', currency: 'IDR', maximumFractionDigits: 0,})
    return formatter.format(amount);
}

export function formatValue(value: string) : string {
    const numberValue = Number(value)
    if (isNaN(numberValue)) return value
    if (numberValue == 0) return '-'
    return numberValue.toString()
}

export function formatWithMeasurement(value?: string, measurement?: Measurement) : string {
    if (!value) return '-';
    if (value == '' || value == '-' ) return value;
    let formatted = value
    if (measurement?.attributes.visibility) {
        formatted = `${formatted} ${measurement.attributes.name}`
    }
    return formatted
}

export function programsBudgetRealization(programs: Program[], month: number, userId?: number) : number {
    let budget = 0
    programs.forEach(p => {
        budget += programBudgetRealization(p, month, userId)
    });
    return budget;
}

export function programBudgetRealization(program: Program, month: number, userId?: number) : number {
    let budget = 0
    program.attributes.activities.data.forEach(a => {
        budget += activityBudgetRealization(a, month, userId)
    });
    return budget;
}

export function activityBudgetRealization(activity: Activity, month: number, userId?: number) : number {
    let realization = 0
    activity.attributes.sub_activities.data.forEach(sa => {
        realization += subActivityBudgetRealization(sa, month, userId)
    })
    return realization;
}

export function subActivityBudgetRealization(subActivity: SubActivity, month: number, userId?: number) : number {
    const pic = subActivity.attributes.subActivityPic.at(-1)?.user.data.id
    if (userId && pic != userId) return 0
    
    let realization = 0
    subActivity.attributes.realization.forEach((r) => {
        if (r.month?.data.id <= month) {
            const cb = Number(r.budget ?? 0);
            realization += cb
        }
    })
    return realization;
}

export function subActivityPhysicalRealization(subActivity: SubActivity, month: number) : string {
    const realization = subActivity.attributes.realization.find(r => r.month.data.id == month)
    return realization?.physical ?? '-';
}
